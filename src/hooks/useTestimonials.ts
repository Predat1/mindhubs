import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  name: string;
  handle: string;
  avatar_initials: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  verified: boolean;
  created_at: string;
}

export const useTestimonials = () => {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
