import { useRef, useEffect } from "react";
import { useIslamicChat } from "@/hooks/useIslamicChat";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useIslamicChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <Helmet>
        <title>Islamic AI - Your Spiritual Guide for Islamic Knowledge</title>
        <meta
          name="description"
          content="Ask questions about Islam, Quran, Hadith, prayers, and receive guidance rooted in authentic Islamic teachings. Your AI companion for spiritual growth."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <ChatHeader onClear={clearMessages} hasMessages={messages.length > 0} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={sendMessage} />
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center shadow-soft">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </main>

        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </>
  );
};

export default Index;
