import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  language?: string; // Add language field
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/islamic-chat`;

// Language detection function
const detectLanguage = (text: string): string => {
  // Malayalam Unicode range: U+0D00–U+0D7F
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  
  // Arabic Unicode range: U+0600–U+06FF
  const arabicRegex = /[\u0600-\u06FF]/;
  
  // Hindi/Devanagari Unicode range: U+0900–U+097F
  const hindiRegex = /[\u0900-\u097F]/;
  
  // Urdu (uses Arabic script but has specific patterns)
  const urduRegex = /[\u0600-\u06FF]/;
  
  // Bengali Unicode range: U+0980–U+09FF
  const bengaliRegex = /[\u0980-\u09FF]/;
  
  // Tamil Unicode range: U+0B80–U+0BFF
  const tamilRegex = /[\u0B80-\u0BFF]/;
  
  // Telugu Unicode range: U+0C00–U+0C7F
  const teluguRegex = /[\u0C00-\u0C7F]/;
  
  // Kannada Unicode range: U+0C80–U+0CFF
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  
  // Check for different languages
  if (malayalamRegex.test(text)) {
    return 'ml'; // Malayalam
  } else if (arabicRegex.test(text)) {
    // Check for common Urdu words/patterns to distinguish from Arabic
    const urduWords = ['کے', 'میں', 'کو', 'سے', 'پر', 'کا', 'کی', 'ہے', 'ہیں', 'تھا', 'تھی'];
    const hasUrduWords = urduWords.some(word => text.includes(word));
    return hasUrduWords ? 'ur' : 'ar'; // Urdu or Arabic
  } else if (hindiRegex.test(text)) {
    return 'hi'; // Hindi
  } else if (bengaliRegex.test(text)) {
    return 'bn'; // Bengali
  } else if (tamilRegex.test(text)) {
    return 'ta'; // Tamil
  } else if (teluguRegex.test(text)) {
    return 'te'; // Telugu
  } else if (kannadaRegex.test(text)) {
    return 'kn'; // Kannada
  }
  
  return 'en'; // Default to English
};

// Get language name for display
const getLanguageName = (code: string): string => {
  const languageNames: { [key: string]: string } = {
    'ml': 'Malayalam',
    'ar': 'Arabic',
    'ur': 'Urdu',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'en': 'English'
  };
  return languageNames[code] || 'English';
};

export const useIslamicChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Detect the language of the user's message
    const detectedLanguage = detectLanguage(content.trim());
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      language: detectedLanguage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent, language: detectedLanguage } : m
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
            language: detectedLanguage,
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
          language: detectedLanguage, // Send detected language to backend
          languageName: getLanguageName(detectedLanguage), // Send language name for context
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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Show language detection feedback
      if (detectedLanguage !== 'en') {
        toast({
          title: `Language Detected: ${getLanguageName(detectedLanguage)}`,
          description: "AI will respond in the same language",
          variant: "default",
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      // Remove the user message if there was an error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};

// Export utility functions for use in other components
export { detectLanguage, getLanguageName };
