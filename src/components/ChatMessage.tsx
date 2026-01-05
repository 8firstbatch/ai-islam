import { Message, detectLanguage, getLanguageName } from "@/hooks/useIslamicChat";
import { cn } from "@/lib/utils";
import { User, Sparkles, Copy, Edit3, MoreVertical, Volume2, VolumeX, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
}

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
}

export const ChatMessage = ({ message, onEdit }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to format AI responses with proper Islamic greetings
  const formatAIResponse = (text: string): string => {
    let formattedText = text.trim();
    
    // Check if response already starts with Islamic greeting
    const startsWithGreeting = /^(Assalamualaikum|Assalamu alaikum|As-salamu alaikum)/i.test(formattedText);
    
    // Check if response already has Bismillah after greeting
    const hasBismillahAfterGreeting = /^(Assalamualaikum|Assalamu alaikum|As-salamu alaikum)[\s\n]*Bismillah/i.test(formattedText);
    
    // If no greeting at all, add the full format
    if (!startsWithGreeting) {
      formattedText = `Assalamualaikum\n\nBismillah\n\n${formattedText}`;
    }
    // If greeting exists but no Bismillah after it, add Bismillah
    else if (!hasBismillahAfterGreeting) {
      formattedText = formattedText.replace(
        /^(Assalamualaikum|Assalamu alaikum|As-salamu alaikum)/i,
        '$1\n\nBismillah'
      );
    }
    
    return formattedText;
  };

  // Function to clean markdown symbols from AI responses
  const cleanAIResponse = (text: string): string => {
    return text
      // Remove markdown bold (**text** or __text__)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // Remove markdown italic (*text* or _text_)
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove markdown code blocks (`text`)
      .replace(/`(.*?)`/g, '$1')
      // Remove markdown headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown links [text](url) - keep only text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown strikethrough (~~text~~)
      .replace(/~~(.*?)~~/g, '$1')
      // Remove other common markdown symbols
      .replace(/^\s*[-*+]\s+/gm, '') // List bullets
      .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
      .replace(/^\s*>\s+/gm, '') // Blockquotes
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Load user profile for displaying in chat
  useEffect(() => {
    if (user && isUser) {
      const loadUserProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      };
      loadUserProfile();
    }
  }, [user, isUser]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({ title: "Copied to clipboard" });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content && onEdit) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Language detection function (use the one from hook for consistency)
  const detectMessageLanguage = (text: string): 'ml' | 'en' => {
    const detectedLang = detectLanguage(text);
    return detectedLang === 'ml' ? 'ml' : 'en'; // Simplify for TTS
  };

  // Debug function to log available voices
  const logAvailableVoices = (voices: SpeechSynthesisVoice[]) => {
    console.log('Available voices:', voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default
    })));
    
    const malayalamVoices = voices.filter(voice => 
      voice.lang.includes('ml') || 
      voice.name.toLowerCase().includes('malayalam') ||
      voice.name.toLowerCase().includes('kerala')
    );
    
    console.log('Malayalam voices found:', malayalamVoices);
    
    const hindiVoices = voices.filter(voice => 
      voice.lang.includes('hi') || 
      voice.name.toLowerCase().includes('hindi')
    );
    
    console.log('Hindi voices found:', hindiVoices);
  };

  const handleSpeak = async () => {
    if (!speechSynthesis) {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSpeaking) {
        // Stop speaking
        speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      // Cancel any ongoing speech first
      speechSynthesis.cancel();
      
      // Small delay to ensure cancellation is processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clean the message content for better speech
      const messageContent = isUser ? message.content : formatAIResponse(message.content);
      const cleanContent = messageContent
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
        .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
        .replace(/`(.*?)`/g, '$1') // Remove code blocks
        .replace(/\n+/g, '. ') // Replace line breaks with periods
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      if (!cleanContent) {
        toast({
          title: "Nothing to read",
          description: "The message appears to be empty",
          variant: "destructive",
        });
        return;
      }

      // Detect language
      const detectedLanguage = detectMessageLanguage(cleanContent);
      
      // Start speaking
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      
      // Configure voice settings based on language
      if (detectedLanguage === 'ml') {
        // Malayalam settings
        utterance.rate = 0.7; // Slower for Malayalam
        utterance.pitch = 0.9;
        utterance.volume = 1.0;
        utterance.lang = 'ml-IN'; // Malayalam (India)
      } else {
        // English settings
        utterance.rate = 0.85; // Slightly increased for consistency
        utterance.pitch = 0.8;
        utterance.volume = 1.0;
        utterance.lang = 'en-US'; // English (US)
      }
      
      // Get available voices with better error handling
      const getVoices = () => {
        return new Promise<SpeechSynthesisVoice[]>((resolve) => {
          let voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve(voices);
            return;
          }
          
          // Wait for voices to load
          let attempts = 0;
          const maxAttempts = 10;
          
          const checkVoices = () => {
            voices = speechSynthesis.getVoices();
            attempts++;
            
            if (voices.length > 0 || attempts >= maxAttempts) {
              resolve(voices);
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          
          // Listen for voiceschanged event
          const handleVoicesChanged = () => {
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
              resolve(voices);
            }
          };
          
          speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
          checkVoices();
        });
      };
      
      const voices = await getVoices();
      
      // Debug: Log available voices
      logAvailableVoices(voices);
      
      let preferredVoice: SpeechSynthesisVoice | undefined;
      
      if (detectedLanguage === 'ml') {
        // Enhanced Malayalam voice selection with multiple fallback strategies
        preferredVoice = 
          // First try: Exact Malayalam matches
          voices.find(voice => voice.lang === 'ml-IN') ||
          voices.find(voice => voice.lang === 'ml') ||
          
          // Second try: Malayalam in voice name
          voices.find(voice => voice.name.toLowerCase().includes('malayalam')) ||
          voices.find(voice => voice.name.toLowerCase().includes('kerala')) ||
          
          // Third try: Other Indian languages as fallback
          voices.find(voice => voice.lang === 'hi-IN') ||
          voices.find(voice => voice.lang === 'ta-IN') || // Tamil
          voices.find(voice => voice.lang === 'te-IN') || // Telugu
          voices.find(voice => voice.lang === 'kn-IN') || // Kannada
          
          // Fourth try: Any Hindi voice
          voices.find(voice => voice.lang.startsWith('hi')) ||
          
          // Fifth try: Any Indian English voice
          voices.find(voice => voice.lang === 'en-IN') ||
          
          // Last resort: Default voice with Malayalam language setting
          voices.find(voice => voice.default) ||
          voices[0];
        
        // If we found a voice, log which one we're using
        if (preferredVoice) {
          console.log('Selected voice for Malayalam:', {
            name: preferredVoice.name,
            lang: preferredVoice.lang,
            localService: preferredVoice.localService
          });
        }
        
        // Adjust settings for Malayalam
        utterance.rate = 0.8; // Increased from 0.6 for faster speech
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0;
        
        // Force Malayalam language even if voice doesn't support it
        utterance.lang = preferredVoice?.lang.includes('ml') ? preferredVoice.lang : 'ml-IN';
        
        if (!preferredVoice?.lang.includes('ml') && !preferredVoice?.name.toLowerCase().includes('malayalam')) {
          toast({
            title: "Malayalam voice not available",
            description: `Using ${preferredVoice?.name || 'default'} voice for Malayalam text`,
            variant: "default",
          });
        }
      } else {
        // Enhanced English voice selection
        preferredVoice = 
          // First try: High-quality male English voices
          voices.find(voice => 
            voice.lang === 'en-US' && (
              voice.name.toLowerCase().includes('david') ||
              voice.name.toLowerCase().includes('mark') ||
              voice.name.toLowerCase().includes('daniel') ||
              voice.name.toLowerCase().includes('guy') ||
              voice.name.toLowerCase().includes('james') ||
              voice.name.toLowerCase().includes('male')
            )
          ) ||
          
          // Second try: High-quality English voices (any gender)
          voices.find(voice => 
            voice.lang === 'en-US' && (
              voice.name.includes('Microsoft') ||
              voice.name.includes('Google') ||
              voice.name.includes('Natural') ||
              voice.name.includes('Neural')
            )
          ) ||
          
          // Third try: Any US English voice
          voices.find(voice => voice.lang === 'en-US') ||
          
          // Fourth try: Any English voice
          voices.find(voice => voice.lang.startsWith('en')) ||
          
          // Last resort: Default voice
          voices.find(voice => voice.default) ||
          voices[0];
        
        console.log('Selected voice for English:', {
          name: preferredVoice?.name,
          lang: preferredVoice?.lang
        });
      }
      
      // Use the preferred voice or fallback to default
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Set up event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Speech error:', event.error);
        
        // Provide user-friendly error messages
        let errorMessage = "Failed to play audio";
        switch (event.error) {
          case 'network':
            errorMessage = "Network error - check your connection";
            break;
          case 'synthesis-failed':
            errorMessage = "Speech synthesis failed - try again";
            break;
          case 'synthesis-unavailable':
            errorMessage = "Speech synthesis not available";
            break;
          case 'audio-busy':
            errorMessage = "Audio is busy - try again in a moment";
            break;
          case 'not-allowed':
            errorMessage = "Speech permission denied";
            break;
        }
        
        toast({
          title: "Speech error",
          description: errorMessage,
          variant: "destructive",
        });
      };

      utterance.onpause = () => {
        setIsSpeaking(false);
      };

      utterance.onresume = () => {
        setIsSpeaking(true);
      };

      // Start speaking
      speechSynthesis.speak(utterance);
      
      // Show language detection feedback with voice info
      const voiceInfo = preferredVoice ? 
        `Using ${preferredVoice.name} (${preferredVoice.lang})` : 
        'Using default voice';
        
      toast({
        title: `Speaking in ${detectedLanguage === 'ml' ? 'Malayalam' : 'English'}`,
        description: voiceInfo,
        variant: "default",
      });
      
      // Fallback check for browsers that don't fire onstart immediately
      setTimeout(() => {
        if (speechSynthesis.speaking && !isSpeaking) {
          setIsSpeaking(true);
        }
      }, 500);
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech error",
        description: "Failed to initialize text-to-speech",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-2 sm:gap-3 animate-slide-up relative",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={userProfile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
              {userProfile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-emerald text-primary-foreground shadow-soft flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex flex-col max-w-[85%] sm:max-w-[80%] relative min-w-0">
        {/* User name (only for user messages) */}
        {isUser && (
          <div className={cn("mb-1 text-xs text-muted-foreground flex items-center gap-1 sm:gap-2", isUser ? "justify-end" : "justify-start")}>
            <span className="truncate">{userProfile?.display_name || user?.email?.split("@")[0] || "You"}</span>
            {message.language && message.language !== 'en' && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 flex-shrink-0">
                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{getLanguageName(message.language)}</span>
              </Badge>
            )}
          </div>
        )}
        
        {/* AI language indicator */}
        {!isUser && message.language && message.language !== 'en' && (
          <div className="mb-1 text-xs text-muted-foreground flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Responding in {getLanguageName(message.language)}</span>
              <span className="sm:hidden">{getLanguageName(message.language)}</span>
            </Badge>
          </div>
        )}
        
        <div
          className={cn(
            "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-soft relative",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card text-card-foreground rounded-bl-md border border-border"
          )}
        >
          {/* Message Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "w-full text-sm leading-relaxed resize-none bg-transparent border-none outline-none selectable-text",
                  isUser ? "text-primary-foreground" : "text-card-foreground"
                )}
                rows={Math.max(2, editContent.split('\n').length)}
              />
              <div className="flex gap-1 sm:gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className={cn(
                    "h-6 sm:h-7 px-2 text-xs",
                    isUser 
                      ? "hover:bg-primary-foreground/20 text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className={cn(
                    "h-6 sm:h-7 px-2 text-xs",
                    isUser 
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap selectable-text">
              {isUser ? message.content : formatAIResponse(message.content)}
            </p>
          )}

          {!isEditing && (
            <span
              className={cn(
                "text-xs mt-1 sm:mt-2 block opacity-60",
                isUser ? "text-right" : "text-left"
              )}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Bottom action buttons - positioned outside message bubble */}
        {!isEditing && (
          <div className={cn(
            "flex gap-1 sm:gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isUser ? "justify-start" : "justify-end"
          )}>
            {/* Context Menu Button */}
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isUser ? "start" : "end"} className="w-28 sm:w-32">
                <DropdownMenuItem onClick={handleCopy} className="cursor-pointer text-xs sm:text-sm">
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Copy
                </DropdownMenuItem>
                {isUser && (
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer text-xs sm:text-sm">
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Text-to-Speech button for AI messages */}
            {!isUser && speechSynthesis && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full text-amber-500 hover:text-amber-600 transition-all duration-300 ${
                  isSpeaking ? 'animate-pulse' : ''
                }`}
                title={isSpeaking ? "Stop speaking" : "Listen to message"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
