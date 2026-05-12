import { useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, Star, Loader2, AlertTriangle, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoResultProps {
  jobId: string;
  videoUrl?: string;
  status: "processing" | "completed" | "failed";
  modelName?: string;
  reasoning?: string;
  onRate?: (jobId: string, rating: number) => void;
  onRegenerate?: (jobId: string) => void;
}

const VideoResult = ({ jobId, videoUrl, status, modelName, reasoning, onRate, onRegenerate }: VideoResultProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  if (status === "processing") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-muted/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 animate-pulse blur-sm -z-10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Génération en cours...</p>
            {modelName && <p className="text-xs text-muted-foreground mt-1">{modelName}</p>}
            <p className="text-xs text-muted-foreground mt-1">⏱ Temps estimé : 1-3 min</p>
          </div>
          {reasoning && (
            <div className="flex items-start gap-1.5 text-xs text-violet-400 bg-violet-500/5 rounded-lg px-3 py-2 mt-1">
              <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{reasoning}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (status === "failed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 w-full max-w-md"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Échec de génération</p>
            <p className="text-xs text-muted-foreground">Essayez un autre modèle ou simplifiez le prompt.</p>
          </div>
          {onRegenerate && (
            <Button size="sm" variant="outline" onClick={() => onRegenerate(jobId)}>
              <RefreshCw className="w-3 h-3 mr-1" /> Relancer
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Completed
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-muted/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden w-full max-w-md"
    >
      {/* Video Player */}
      {videoUrl ? (
        <div className="relative group">
          <video
            src={videoUrl}
            controls
            className="w-full aspect-video bg-black rounded-t-2xl"
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      ) : (
        <div className="w-full aspect-video bg-muted/60 flex items-center justify-center rounded-t-2xl">
          <Play className="w-12 h-12 text-muted-foreground/30" />
        </div>
      )}

      {/* Controls */}
      <div className="p-3 space-y-2">
        {modelName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>{modelName}</span>
          </div>
        )}

        {reasoning && (
          <p className="text-xs text-violet-400/80 leading-relaxed">{reasoning}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          {/* Rating */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  onRate?.(jobId, star);
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            {videoUrl && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                <a href={videoUrl} download target="_blank" rel="noreferrer">
                  <Download className="w-3 h-3 mr-1" /> Télécharger
                </a>
              </Button>
            )}
            {onRegenerate && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onRegenerate(jobId)}>
                <RefreshCw className="w-3 h-3 mr-1" /> Relancer
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoResult;
