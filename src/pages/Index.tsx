import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Sidebar } from "@/components/Sidebar";
import { QuranSearch } from "@/components/QuranSearch";
import { PrayerTimes } from "@/components/PrayerTimes";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Menu, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { messages, isLoading, sendMessage, clearMessages, currentConversationId, selectConversation } = useConversations();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showQuranSearch, setShowQuranSearch] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [guestContinued, setGuestContinued] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    clearMessages();
    setMobileSidebarOpen(false);
  };

  const handleSendMessage = (content: string) => {
    // Show login prompt if user is not logged in and hasn't chosen to continue as guest
    if (!user && !guestContinued) {
      setShowLoginPrompt(true);
      return;
    }
    sendMessage(content);
  };

  const handleContinueAsGuest = () => {
    setGuestContinued(true);
    setShowLoginPrompt(false);
  };

  const handleInsertVerse = (verse: string) => {
    handleSendMessage(`I'd like to learn more about this verse:\n\n${verse}`);
  };

  return (
    <>
      <Helmet>
        <title>Islamic AI - Your Spiritual Guide</title>
        <meta name="description" content="Ask questions about Islam, Quran, Hadith, prayers, and receive guidance rooted in authentic Islamic teachings." />
      </Helmet>

      <div className="h-screen flex overflow-hidden bg-gradient-hero">
        {/* Desktop Sidebar */}
        {user && (
          <div className="hidden md:block">
            <Sidebar
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => { selectConversation(id); setMobileSidebarOpen(false); }}
              onNewChat={handleNewChat}
              onOpenQuranSearch={() => setShowQuranSearch(true)}
              onOpenPrayerTimes={() => setShowPrayerTimes(true)}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {user && mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative z-50">
              <Sidebar
                currentConversationId={currentConversationId}
                onSelectConversation={(id) => { selectConversation(id); setMobileSidebarOpen(false); }}
                onNewChat={handleNewChat}
                onOpenQuranSearch={() => { setShowQuranSearch(true); setMobileSidebarOpen(false); }}
                onOpenPrayerTimes={() => { setShowPrayerTimes(true); setMobileSidebarOpen(false); }}
                isCollapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user && (
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                )}
                <ChatHeader onClear={handleNewChat} hasMessages={messages.length > 0} showActions={!user} />
              </div>
              <div className="flex items-center gap-2">
                {/* Prayer Times Button - visible for everyone */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPrayerTimes(true)}
                  title="Prayer Times"
                  className="text-primary"
                >
                  <Clock className="w-5 h-5" />
                </Button>
                {!user && !authLoading && (
                  <Button onClick={() => navigate("/auth")} className="bg-gradient-emerald hover:opacity-90">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={handleSendMessage} />
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

          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>

      <QuranSearch isOpen={showQuranSearch} onClose={() => setShowQuranSearch(false)} onInsertVerse={handleInsertVerse} />
      <PrayerTimes isOpen={showPrayerTimes} onClose={() => setShowPrayerTimes(false)} />
      <LoginPrompt 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
        onContinueAsGuest={handleContinueAsGuest}
      />
    </>
  );
};

export default Index;
