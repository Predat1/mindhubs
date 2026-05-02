import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Chat {
  id: string;
  vendor_id: string;
  user_id: string;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  customer_name?: string;
  customer_avatar?: string;
  vendor_name?: string;
  vendor_avatar?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export const useVendorChats = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ["vendor-chats", vendorId],
    queryFn: async (): Promise<Chat[]> => {
      if (!vendorId) return [];
      
      const { data, error } = await supabase
        .from("chats")
        .select(`
          *,
          user:user_id(id)
        `)
        .eq("vendor_id", vendorId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      // En l'absence de table "profiles" publique, on mocke le nom du client avec son ID ou on pourrait le récupérer via d'autres moyens.
      return (data || []).map((chat) => ({
        ...chat,
        customer_name: "Client " + chat.user_id.slice(0, 4).toUpperCase(),
        customer_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.user_id}`
      }));
    },
    enabled: !!vendorId,
  });
};

export const useUserChats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-chats", userId],
    queryFn: async (): Promise<Chat[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("chats")
        .select(`*, vendor:vendor_id(shop_name, avatar_url)`)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((chat: any) => ({
        ...chat,
        vendor_name: chat.vendor?.shop_name || "Vendeur",
        vendor_avatar: chat.vendor?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.vendor_id}`
      }));
    },
    enabled: !!userId,
  });
};

export const useChatMessages = (chatId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch initial messages
  const query = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async (): Promise<Message[]> => {
      if (!chatId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!chatId,
  });

  // Subscribe to real-time changes
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          queryClient.setQueryData(["chat-messages", chatId], (old: Message[] | undefined) => {
            if (!old) return [payload.new as Message];
            // Éviter les doublons (optimistic UI)
            if (old.find(m => m.id === payload.new.id)) return old;
            return [...old, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  return query;
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content, senderId }: { chatId: string; content: string; senderId: string }) => {
      // 1. Insert message
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .insert([{ chat_id: chatId, content, sender_id: senderId }])
        .select()
        .single();

      if (msgError) throw msgError;

      // 2. Update chat's last_message and updated_at
      const { error: chatError } = await supabase
        .from("chats")
        .update({ last_message: content, updated_at: new Date().toISOString() })
        .eq("id", chatId);

      if (chatError) throw chatError;

      return msgData as Message;
    },
    onSuccess: (newMessage, variables) => {
      // Mettre à jour le cache local optimiste
      queryClient.setQueryData(["chat-messages", variables.chatId], (old: Message[] | undefined) => {
        if (!old) return [newMessage];
        if (old.find(m => m.id === newMessage.id)) return old;
        return [...old, newMessage];
      });
      // Invalidate chats to update the last_message in the sidebar
      queryClient.invalidateQueries({ queryKey: ["vendor-chats"] });
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
    },
  });
};

export const useCreateOrGetChat = () => {
  return useMutation({
    mutationFn: async ({ vendorId, userId }: { vendorId: string; userId: string }) => {
      // Check if chat exists
      const { data: existingChat, error: checkError } = await supabase
        .from("chats")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingChat) {
        return existingChat as Chat;
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from("chats")
        .insert([{ vendor_id: vendorId, user_id: userId }])
        .select()
        .single();

      if (createError) throw createError;

      return newChat as Chat;
    }
  });
};
