import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UserSettings {
  ai_model: string;
  ai_response_style: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/islamic-chat`;

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Load user settings
  useEffect(() => {
    if (user) {
      supabase
        .from("user_settings")
        .select("ai_model, ai_response_style")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserSettings(data);
        });
    }
  }, [user]);

  // Load messages for a conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      );
    }
    setCurrentConversationId(conversationId);
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(async (title: string): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return data.id;
  }, [user]);

  // Save a message to the database
  const saveMessage = useCallback(async (
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });
  }, []);

  // Update conversation title
  const updateConversationTitle = useCallback(async (
    conversationId: string,
    title: string
  ) => {
    await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let conversationId = currentConversationId;

    // Create conversation if needed
    if (!conversationId && user) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      conversationId = await createConversation(title);
      if (conversationId) {
        setCurrentConversationId(conversationId);
      }
    }

    // Save user message if authenticated
    if (conversationId && user) {
      await saveMessage(conversationId, "user", content.trim());
    }

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: userSettings?.ai_model,
          responseStyle: userSettings?.ai_response_style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const contentChunk = parsed.choices?.[0]?.delta?.content;
            if (contentChunk) updateAssistant(contentChunk);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save assistant message if authenticated
      if (conversationId && user && assistantContent) {
        await saveMessage(conversationId, "assistant", assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentConversationId, user, createConversation, saveMessage, userSettings, toast]);

  // Clear messages and start new chat
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  // Select a conversation
  const selectConversation = useCallback((id: string | null) => {
    if (id) {
      loadConversation(id);
    } else {
      clearMessages();
    }
  }, [loadConversation, clearMessages]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    currentConversationId,
    selectConversation,
    setMessages,
  };
};
