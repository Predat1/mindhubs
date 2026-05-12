import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// ─── Cinema Studio — fal.ai Unified Video Generation ───
// All 15 video models routed through fal.ai queue API.
// Architecture: submit → get request_id → poll status → get video URL.
// Single API key: FAL_API_KEY

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  modelId: string;
  falEndpoint: string;
  prompt: string;
  duration?: number;
  aspectRatio?: string;
  imageUrl?: string;
  vendorId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
  if (!FAL_API_KEY) {
    return new Response(JSON.stringify({ error: "FAL_API_KEY not configured" }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "create";

    // ═══ ACTION: Poll job status ═══
    if (action === "status") {
      const jobId = url.searchParams.get("job_id");
      if (!jobId) throw new Error("job_id required");

      const { data: job, error } = await supabase
        .from("video_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error || !job) throw new Error("Job not found");

      if (job.status === "processing" && job.provider_job_id && job.fal_endpoint) {
        try {
          const statusResp = await fetch(
            `https://queue.fal.run/${job.fal_endpoint}/requests/${job.provider_job_id}/status`,
            { headers: { "Authorization": `Key ${FAL_API_KEY}` } }
          );

          if (statusResp.ok) {
            const statusData = await statusResp.json();

            if (statusData.status === "COMPLETED") {
              // Fetch the actual result
              const resultResp = await fetch(
                `https://queue.fal.run/${job.fal_endpoint}/requests/${job.provider_job_id}`,
                { headers: { "Authorization": `Key ${FAL_API_KEY}` } }
              );
              const resultData = await resultResp.json();
              const videoUrl = resultData?.video?.url || resultData?.output?.video?.url || resultData?.data?.video_url || null;

              await supabase.from("video_jobs").update({
                status: "completed",
                result_url: videoUrl,
                completed_at: new Date().toISOString(),
              }).eq("id", jobId);

              return new Response(JSON.stringify({ ...job, status: "completed", result_url: videoUrl }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });

            } else if (statusData.status === "FAILED") {
              await supabase.from("video_jobs").update({
                status: "failed",
                completed_at: new Date().toISOString(),
              }).eq("id", jobId);

              return new Response(JSON.stringify({ ...job, status: "failed" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }

            // Still IN_QUEUE or IN_PROGRESS
            const progress = statusData.queue_position != null
              ? { queue_position: statusData.queue_position }
              : statusData.logs ? { logs: statusData.logs.slice(-3) } : {};

            return new Response(JSON.stringify({ ...job, status: "processing", ...progress }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } catch (pollErr) {
          console.error("fal.ai polling error:", pollErr);
        }
      }

      return new Response(JSON.stringify(job), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══ ACTION: Create new video generation ═══
    const { modelId, falEndpoint, prompt, duration, aspectRatio, imageUrl, vendorId }: GenerateRequest = await req.json();

    if (!modelId || !falEndpoint || !prompt || !vendorId) {
      return new Response(JSON.stringify({ error: "modelId, falEndpoint, prompt, and vendorId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build fal.ai request body
    const falInput: Record<string, any> = { prompt };
    if (duration) falInput.duration = `${duration}s`;
    if (aspectRatio) falInput.aspect_ratio = aspectRatio;
    if (imageUrl) {
      falInput.image_url = imageUrl;
      // Some models use start_image_url
      falInput.start_image_url = imageUrl;
    }

    // Create job record
    const { data: job, error: insertErr } = await supabase
      .from("video_jobs")
      .insert({
        vendor_id: vendorId,
        model_id: modelId,
        fal_endpoint: falEndpoint,
        status: "processing",
        prompt,
        duration: duration || 5,
        aspect_ratio: aspectRatio || '16:9',
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (insertErr || !job) {
      console.error("DB insert error:", insertErr);
      throw new Error("Failed to create video job");
    }

    // Submit to fal.ai queue
    try {
      const submitResp = await fetch(`https://queue.fal.run/${falEndpoint}`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(falInput),
      });

      if (!submitResp.ok) {
        const errText = await submitResp.text();
        console.error(`fal.ai submit error (${falEndpoint}):`, submitResp.status, errText);
        await supabase.from("video_jobs").update({ status: "failed" }).eq("id", job.id);
        return new Response(JSON.stringify({ error: `fal.ai error: ${submitResp.status}`, jobId: job.id }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const submitData = await submitResp.json();
      const requestId = submitData.request_id;

      await supabase.from("video_jobs").update({ provider_job_id: requestId }).eq("id", job.id);

      return new Response(JSON.stringify({
        jobId: job.id,
        requestId,
        status: "processing",
        modelId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (apiErr: any) {
      console.error("fal.ai submit failed:", apiErr);
      await supabase.from("video_jobs").update({ status: "failed" }).eq("id", job.id);
      return new Response(JSON.stringify({ error: apiErr.message, jobId: job.id }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (e: any) {
    console.error("generate-video error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
