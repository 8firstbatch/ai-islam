import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useOpenRouterChat } from "@/hooks/useOpenRouterChat";
import { supabase } from "@/integrations/supabase/client";
import { loadUserSettings } from "@/utils/settingsUtils";

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Sidebar } from "@/components/Sidebar";
import { QuranSearch } from "@/components/QuranSearch";
import { HadithSearch } from "@/components/HadithSearch";
import { IslamicCalendar } from "@/components/IslamicCalendar";
import { ToolsSearch } from "@/components/ToolsSearch";
import { QuranReciting } from "@/components/QuranReciting";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

import { Menu } from "lucide-react";


const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  // Use OpenRouter for AI chat with Supabase conversation saving
  const openRouterChat = useOpenRouterChat();
  const { messages, isLoading, sendMessage, stopGeneration, clearMessages, editMessage, currentConversationId, selectConversation } = openRouterChat;
  
  // Keep Supabase conversations hook for sidebar functionality
  const supabaseConversations = useConversations();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showQuranSearch, setShowQuranSearch] = useState(false);
  const [showHadithSearch, setShowHadithSearch] = useState(false);
  const [showIslamicCalendar, setShowIslamicCalendar] = useState(false);
  const [showToolsSearch, setShowToolsSearch] = useState(false);
  const [showQuranReciting, setShowQuranReciting] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [guestContinued, setGuestContinued] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchMode, setSearchMode] = useState(false); // Boolean for search mode
  const recognitionRef = useRef<any>(null);

  // Test Supabase connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        await supabase.auth.getSession();
      } catch (err) {
        // Silent error handling
      }
    };
    testConnection();
  }, []);

  // Load user settings when user is available
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const settings = await loadUserSettings(user.id);
          if (settings) {
            setSearchMode(settings.search_mode || false);
          }
        } catch (error) {
          console.error("Failed to load user settings:", error);
        }
      }
    };
    loadSettings();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    clearMessages();
    setMobileSidebarOpen(false);
  };

  const handleSendMessage = (content: string, attachments?: { images?: File[] }) => {
    // Show login prompt if user is not logged in and hasn't chosen to continue as guest
    if (!user && !guestContinued) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Send message using OpenRouter - AI will auto-detect language
    // Pass searchMode to enable web search if needed
    sendMessage(content, attachments, searchMode);
  };

  const handleContinueAsGuest = () => {
    setGuestContinued(true);
    setShowLoginPrompt(false);
  };

  const handleInsertVerse = (verse: string) => {
    handleSendMessage(`I'd like to learn more about this verse:\n\n${verse}`);
  };

  const handleInsertHadith = (hadith: string) => {
    handleSendMessage(`I'd like to learn more about this hadith:\n\n${hadith}`);
  };

  const handleInsertTool = (toolName: string) => {
    // Set the selected tool instead of sending a message immediately
    setSelectedTool(toolName);
    setShowToolsSearch(false);
  };

  const handleRemoveTool = () => {
    setSelectedTool(null);
  };

  const handleMicrophoneClick = async () => {
    // If currently listening, stop the recognition
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permissionError) {
      console.error('Microphone permission denied:', permissionError);
      alert("Microphone access is required for voice input. Please allow microphone access and try again.");
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure speech recognition with better settings
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US'; // Default to English - AI will auto-detect and respond in appropriate language

    // Handle when speech recognition starts
    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Speech recognition started - speak now');
      // Show a subtle notification that we're listening
      const notification = document.createElement('div');
      notification.id = 'voice-notification';
      notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-pulse';
      notification.textContent = '🎤 Listening... Speak now';
      document.body.appendChild(notification);
    };

    // Handle successful speech recognition
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log('🗣️ Voice input received:', transcript, 'Confidence:', confidence);
      
      // Remove listening notification
      const notification = document.getElementById('voice-notification');
      if (notification) {
        notification.remove();
      }
      
      // Send the transcribed text as a message if confidence is reasonable
      if (transcript.trim() && confidence > 0.3) {
        handleSendMessage(transcript.trim());
      } else if (transcript.trim()) {
        // Still send if we have text, even with low confidence
        handleSendMessage(transcript.trim());
      } else {
        console.log('No clear speech detected');
        alert("No clear speech detected. Please try speaking again.");
      }
      setIsListening(false);
    };

    // Handle speech recognition errors with better user feedback
    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsListening(false);
      
      // Remove listening notification
      const notification = document.getElementById('voice-notification');
      if (notification) {
        notification.remove();
      }
      
      let errorMessage = '';
      let shouldAlert = true;
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again and speak clearly.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check your microphone connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed. Please try again.';
          break;
        case 'bad-grammar':
          errorMessage = 'Speech recognition grammar error. Please try again.';
          shouldAlert = false; // Don't alert for grammar errors
          break;
        case 'language-not-supported':
          errorMessage = 'Language not supported. Switching to English.';
          break;
        default:
          errorMessage = `Voice recognition failed (${event.error}). Please try again.`;
      }
      
      if (shouldAlert && errorMessage) {
        alert(errorMessage);
      }
      console.log(errorMessage);
    };

    // Handle when speech recognition ends
    recognition.onend = () => {
      setIsListening(false);
      console.log('🔇 Speech recognition ended');
      
      // Remove listening notification
      const notification = document.getElementById('voice-notification');
      if (notification) {
        notification.remove();
      }
    };

    // Handle speech recognition abort
    recognition.onabort = () => {
      setIsListening(false);
      console.log('🚫 Speech recognition aborted');
      
      // Remove listening notification
      const notification = document.getElementById('voice-notification');
      if (notification) {
        notification.remove();
      }
    };

    // Start speech recognition with error handling
    try {
      recognition.start();
      console.log('🚀 Starting speech recognition...');
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      setIsListening(false);
      alert("Failed to start voice recognition. Please try again.");
    }
  };

  return (
    <>
      <Helmet>
        <title> AI Islam  - Your Spiritual Guide</title>
        <meta name="description" content="Ask questions about Islam, Quran, Hadith, prayers, and receive guidance rooted in authentic Islamic teachings." />
      </Helmet>

      <div className="min-h-screen h-screen flex overflow-hidden bg-gradient-hero">
        {/* Desktop Sidebar */}
        {user && (
          <div className="hidden md:block flex-shrink-0">
            <Sidebar
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => { 
                selectConversation(id); 
                setMobileSidebarOpen(false); 
              }}
              onNewChat={handleNewChat}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {user && mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative z-50 h-full">
              <Sidebar
                currentConversationId={currentConversationId}
                onSelectConversation={(id) => { 
                  selectConversation(id); 
                  setMobileSidebarOpen(false); 
                }}
                onNewChat={handleNewChat}
                isCollapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
            <div className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {user && (
                  <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0" onClick={() => setMobileSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                )}
                <div className="min-w-0">
                  <ChatHeader 
                    onClear={handleNewChat} 
                    hasMessages={messages.length > 0} 
                    showActions={!user}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!user && !authLoading && (
                  <Button 
                    onClick={() => navigate("/auth")} 
                    className="bg-gradient-emerald hover:opacity-90"
                  >
                    Sign In
                  </Button>
                )}
                
                {authLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col overflow-hidden min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col min-h-0">
                <WelcomeScreen onSuggestionClick={handleSendMessage} />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
                <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} onEdit={editMessage} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center shadow-soft animate-pulse-glow">
                        <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-spin-slow">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground animate-ping" />
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-soft relative">
                          {/* Enhanced typing animation */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "200ms", animationDuration: "1s" }} />
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "400ms", animationDuration: "1s" }} />
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 via-emerald-500/20 to-transparent animate-pulse" />
                          </div>
                          
                          {/* AI thinking text with typewriter effect */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-emerald-600 font-medium animate-pulse">
                              {searchMode ? "Searching the web" : "AI Islam is thinking"}
                            </span>
                            <div className="flex gap-1">
                              <span className="text-emerald-500 animate-typing-cursor">.</span>
                              <span className="text-emerald-500 animate-typing-cursor" style={{ animationDelay: "0.5s" }}>.</span>
                              <span className="text-emerald-500 animate-typing-cursor" style={{ animationDelay: "1s" }}>.</span>
                            </div>
                          </div>
                          
                          {/* Search websites animation - only show in search mode */}
                          {searchMode && (
                            <div className="mb-3 space-y-1">
                              <div className="text-xs text-emerald-500/80 animate-pulse">
                                Searching websites:
                              </div>
                              <div className="flex flex-wrap gap-1 text-xs">
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}>
                                  DuckDuckGo
                                </span>
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}>
                                  IslamQA.info
                                </span>
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "400ms" }}>
                                  Quran.com
                                </span>
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}>
                                  Sunnah.com
                                </span>
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "800ms" }}>
                                  IslamWeb.net
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Animated progress indicator */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-loading-bar" />
                            </div>
                            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                          </div>
                          
                          {/* Subtle breathing animation for the whole bubble */}
                          <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 animate-breathing" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </main>

          <div className="flex-shrink-0">
            <ChatInput 
              onSend={handleSendMessage} 
              onOpenTools={() => setShowToolsSearch(true)}
              selectedTool={selectedTool}
              onRemoveTool={handleRemoveTool}
              isLoading={isLoading}
              onMicrophoneClick={handleMicrophoneClick}
              onStopGeneration={stopGeneration}
              isListening={isListening}
              searchMode={searchMode}
            />
          </div>

          <Footer />
        </div>
      </div>

      <ToolsSearch 
        isOpen={showToolsSearch} 
        onClose={() => setShowToolsSearch(false)}
        onOpenQuranSearch={() => setShowQuranSearch(true)}
        onOpenHadithSearch={() => setShowHadithSearch(true)}
        onOpenIslamicCalendar={() => setShowIslamicCalendar(true)}
        onOpenQuranReciting={() => setShowQuranReciting(true)}
      />
      <QuranSearch isOpen={showQuranSearch} onClose={() => setShowQuranSearch(false)} onInsertVerse={handleInsertVerse} />
      <HadithSearch isOpen={showHadithSearch} onClose={() => setShowHadithSearch(false)} onInsertHadith={handleInsertHadith} />
      <IslamicCalendar isOpen={showIslamicCalendar} onClose={() => setShowIslamicCalendar(false)} />
      <QuranReciting isOpen={showQuranReciting} onClose={() => setShowQuranReciting(false)} />
      <LoginPrompt 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
        onContinueAsGuest={handleContinueAsGuest}
      />
    </>
  );
};

export default Index;
