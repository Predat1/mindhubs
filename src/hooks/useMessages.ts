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

const sb = supabase as any;

export const useVendorChats = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ["vendor-chats", vendorId],
    queryFn: async (): Promise<Chat[]> => {
      if (!vendorId) return [];
      
      const { data, error } = await sb
        .from("chats")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map((chat: any) => ({
        ...chat,
        customer_name: chat.customer_name || "Client #" + (chat.user_id || "").slice(0, 4).toUpperCase(),
        customer_avatar: chat.customer_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.user_id}`
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
      const { data, error } = await sb
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

  const query = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async (): Promise<Message[]> => {
      if (!chatId) return [];
      const { data, error } = await sb
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!chatId,
  });

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
            if (old.find(m => m.id === (payload.new as any).id)) return old;
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
      const { data: msgData, error: msgError } = await sb
        .from("messages")
        .insert([{ chat_id: chatId, content, sender_id: senderId }])
        .select()
        .single();

      if (msgError) throw msgError;

      const { error: chatError } = await sb
        .from("chats")
        .update({ last_message: content, updated_at: new Date().toISOString() })
        .eq("id", chatId);

      if (chatError) throw chatError;

      return msgData as Message;
    },
    onSuccess: (newMessage, variables) => {
      queryClient.setQueryData(["chat-messages", variables.chatId], (old: Message[] | undefined) => {
        if (!old) return [newMessage];
        if (old.find(m => m.id === newMessage.id)) return old;
        return [...old, newMessage];
      });
      queryClient.invalidateQueries({ queryKey: ["vendor-chats"] });
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
    },
  });
};

export const useCreateOrGetChat = () => {
  return useMutation({
    mutationFn: async ({ vendorId, userId, customerName, customerAvatar }: { vendorId: string; userId: string; customerName?: string; customerAvatar?: string }) => {
      const { data: existingChat, error: checkError } = await sb
        .from("chats")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingChat) {
        return existingChat as Chat;
      }

      const { data: newChat, error: createError } = await sb
        .from("chats")
        .insert([{ 
          vendor_id: vendorId, 
          user_id: userId,
          customer_name: customerName,
          customer_avatar: customerAvatar
        }])
        .select()
        .single();

      if (createError) throw createError;

      return newChat as Chat;
    }
  });
};
