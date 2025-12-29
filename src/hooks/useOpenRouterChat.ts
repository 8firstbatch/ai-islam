import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { openRouterService } from "@/services/openRouterService";
import { googleAIService } from "@/services/googleAIService";
import { thinkingAIService } from "@/services/thinkingAIService";
import { loadUserSettings } from "@/utils/settingsUtils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: {
    images?: string[]; // Array of image URLs or base64 strings
  };
}

export const useOpenRouterChat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Create a new conversation
  const createConversation = useCallback(async (title: string): Promise<string | null> => {
    if (!user) return null;

    try {
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
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  }, [user]);

  // Save a message to the database
  const saveMessage = useCallback(async (
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    if (!user) return;

    try {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role,
        content,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }, [user]);

  // Load messages for a conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
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
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }, [user]);

  // Stop the current AI response
  const stopGeneration = useCallback(() => {
    if (abortController) {
      console.log('Stopping AI generation...');
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      toast({
        title: "Response stopped",
        description: "AI response generation has been cancelled",
      });
    }
  }, [abortController, toast]);

  // Send a message using OpenRouter
  const sendMessage = useCallback(async (content: string, attachments?: { images?: File[] }, selectedLanguage?: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    let conversationId = currentConversationId;

    // Create conversation if needed and user is authenticated
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
    let assistantMessageId = crypto.randomUUID();

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === assistantMessageId) {
          return prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      // Prepare messages for OpenRouter (exclude the current user message as it will be added)
      const chatMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Prepare the message content with language instruction
      let messageContent = content.trim();
      
      // Add strong language instruction based on selected language
      if (selectedLanguage === "ARB") {
        messageContent = `${content.trim()}\n\nIMPORTANT: You MUST respond entirely in Arabic language (العربية). Do not use English except for technical terms that have no Arabic equivalent.`;
      } else if (selectedLanguage === "MNG") {
        messageContent = `${content.trim()}\n\nIMPORTANT: You MUST respond in Manglish (Malayalam-English mix). Use a natural mix of Malayalam and English words as commonly spoken by Malayalam speakers. Write Malayalam words in English script (transliteration).`;
      } else if (selectedLanguage === "MLM") {
        messageContent = `${content.trim()}\n\nIMPORTANT: You MUST respond entirely in Malayalam language (മലയാളം). Write your complete response in Malayalam script. Use proper Malayalam Islamic terminology and greetings.`;
      } else if (selectedLanguage === "ENG") {
        messageContent = `${content.trim()}\n\nIMPORTANT: You MUST respond entirely in English language.`;
      }

      // Add the new user message with language instruction
      chatMessages.push({
        role: "user",
        content: messageContent,
      });

      // Handle image attachments if present
      if (attachments?.images && attachments.images.length > 0) {
        // For now, we'll just mention the images in the text
        // In a full implementation, you'd need to use a vision model
        const imageNote = `\n\n[Note: ${attachments.images.length} image(s) were uploaded but cannot be processed in this version]`;
        
        // Update the user message to reflect the images
        setMessages((prev) => 
          prev.map((m) => 
            m.id === userMessage.id 
              ? { ...m, content: content.trim() + imageNote }
              : m
          )
        );
      }

      // Get user's AI model preference
      const userSettings = await loadUserSettings(user?.id || '');
      const selectedModel = userSettings?.ai_model || "google/gemini-2.5-flash";

      // Use appropriate AI service based on selected model
      if (selectedModel === "google/gemini-2.5-flash") {
        // Use Google AI service for Smart model
        await googleAIService.sendMessage(
          chatMessages,
          {
            model: 'gemini-2.5-flash',
            stream: true,
            onChunk: updateAssistant,
            signal: controller.signal,
          }
        );
      } else if (selectedModel === "google/gemini-2.5-pro") {
        // Use Thinking AI service for Thinking model
        await thinkingAIService.sendMessage(
          chatMessages,
          {
            model: 'gemini-2.5-pro',
            stream: true,
            onChunk: updateAssistant,
            signal: controller.signal,
          }
        );
      } else {
        // Use OpenRouter service for other models
        await openRouterService.sendMessage(
          chatMessages,
          {
            model: 'openai/gpt-4o-mini',
            stream: true,
            onChunk: updateAssistant,
            signal: controller.signal,
          }
        );
      }

      // Save assistant message if authenticated and we have content
      if (conversationId && user && assistantContent) {
        await saveMessage(conversationId, "assistant", assistantContent);
      }

    } catch (error) {
      console.error("Chat error:", error);
      
      // Don't show error if request was aborted
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        console.log('Request was aborted by user');
        return;
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      
      // Remove the user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [messages, isLoading, toast, user, currentConversationId, createConversation, saveMessage]);

  // Clear messages and start new chat
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  // Edit a message (update both local state and database)
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user || !currentConversationId) {
      // For guests, just update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: newContent } : m
        )
      );
      toast({ title: "Message updated" });
      return;
    }

    try {
      // Update in database
      const { error } = await supabase
        .from("messages")
        .update({ content: newContent })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: newContent } : m
        )
      );

      toast({ title: "Message updated" });
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        title: "Failed to edit message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [user, currentConversationId, toast]);

  // Select a conversation (for integration with sidebar)
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
    stopGeneration,
    clearMessages,
    editMessage,
    currentConversationId,
    selectConversation,
    loadConversation,
  };
};