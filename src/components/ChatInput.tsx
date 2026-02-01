import { useState, KeyboardEvent, useEffect } from "react";
import { Send, Image, X, Wrench, Mic, Square, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize, isValidImageType, isValidImageSize } from "@/utils/fileUtils";

interface ChatInputProps {
  onSend: (message: string, attachments?: { images?: File[] }) => void;
  onOpenTools?: () => void;
  selectedTool?: string | null;
  onRemoveTool?: () => void;
  isLoading: boolean;
  onMicrophoneClick?: () => void;
  onStopGeneration?: () => void;
  isListening?: boolean;
  searchMode?: boolean; // Change from aiModel to searchMode
}

export const ChatInput = ({ onSend, onOpenTools, selectedTool, onRemoveTool, isLoading, onMicrophoneClick, onStopGeneration, isListening = false, searchMode = false }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { toast } = useToast();

  const handleSend = () => {
    if ((input.trim() || selectedImages.length > 0 || selectedTool) && !isLoading) {
      const attachments = {
        images: selectedImages.length > 0 ? selectedImages : undefined
      };
      
      // Include selected tool in the message if present
      const messageContent = selectedTool ? `${selectedTool}: ${input}` : input;
      
      onSend(messageContent, attachments);
      setInput("");
      setSelectedImages([]);
      if (onRemoveTool) onRemoveTool(); // Clear the selected tool
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validImages: File[] = [];
    const errors: string[] = [];
    
    files.forEach(file => {
      if (!isValidImageType(file)) {
        errors.push(`${file.name}: Invalid file type. Please select JPEG, PNG, GIF, or WebP images.`);
        return;
      }
      
      if (!isValidImageSize(file, 10)) {
        errors.push(`${file.name}: File too large. Maximum size is 10MB.`);
        return;
      }
      
      validImages.push(file);
    });
    
    if (errors.length > 0) {
      toast({
        title: "Invalid Files",
        description: errors.join('\n'),
        variant: "destructive"
      });
    }
    
    if (selectedImages.length + validImages.length > 5) {
      toast({
        title: "Too Many Images",
        description: "You can upload up to 5 images at once.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedImages(prev => [...prev, ...validImages]);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [selectedImages]);

  return (
    <div 
      className={`border-t border-border bg-card/80 backdrop-blur-sm p-3 sm:p-4 transition-all duration-300 relative ${
        isDragOver ? 'bg-primary/10 border-primary animate-glow-pulse' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10 animate-scale-in">
          <div className="text-center animate-bounce-gentle">
            <Image className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-primary" />
            <p className="text-primary font-medium text-sm sm:text-base">Drop images here to upload</p>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
        {/* Attachments Preview */}
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 animate-slide-in-left">
            {/* Image Previews */}
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border border-border overflow-hidden bg-muted transition-all duration-300">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-0.5 sm:p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {formatFileSize(file.size)}
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-1.5 sm:gap-2 items-end">
          {/* Text Input with Tool Tag */}
          <div className="relative flex-1">
            {/* Selected Tool Tag */}
            {selectedTool && (
              <div className="absolute left-2 sm:left-3 top-2 sm:top-3 z-10 flex items-center gap-1.5 sm:gap-2 bg-primary/10 border border-primary/20 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-primary/20 flex items-center justify-center">
                  <Wrench className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary" />
                </div>
                <span className="text-primary font-medium truncate max-w-[120px] sm:max-w-none">{selectedTool}</span>
                {onRemoveTool && (
                  <button
                    onClick={onRemoveTool}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/20 flex items-center justify-center transition-colors"
                    title="Remove tool"
                  >
                    <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary" />
                  </button>
                )}
              </div>
            )}
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchMode 
                  ? "Search the web" 
                  : selectedTool 
                    ? "Ask about this tool..." 
                    : "Ask anything"
              }
              className={`min-h-[44px] sm:min-h-[52px] max-h-32 resize-none bg-background border-border rounded-2xl sm:rounded-3xl transition-all duration-300 text-sm sm:text-base focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-border focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border hover:border-border active:border-border ${
                selectedTool ? 'pt-8 sm:pt-12 pl-2 sm:pl-3 pr-12 sm:pr-16' : 
                'pl-2 sm:pl-3 pr-12 sm:pr-16'
              }`}
              disabled={isLoading}
              style={{ 
                outline: 'none', 
                boxShadow: 'none',
                border: '1px solid hsl(var(--border))'
              }}
            />
            
            {/* Search Icons - when search mode is enabled */}
            {searchMode && (
              <div className="absolute left-2 sm:left-3 bottom-1 flex items-center gap-1 text-xs text-muted-foreground group cursor-pointer px-2 py-1 rounded-md hover:bg-muted/50 transition-colors duration-200">
                <Globe className="w-3 h-3" />
                <span>Search</span>
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">×</span>
                    <span>Search</span>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                </div>
              </div>
            )}
            
            {/* Tools Button - Inside Input Right */}
            {onOpenTools && !selectedTool && !input.trim() && (
              <Button
                variant="ghost"
                onClick={onOpenTools}
                disabled={isLoading}
                className="absolute right-1.5 sm:right-2 bottom-2 sm:bottom-3 h-6 sm:h-8 px-2 sm:px-3 text-xs text-muted-foreground transition-all duration-300 flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl"
                title="Open Islamic Tools"
              >
                <Wrench className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Tools</span>
              </Button>
            )}
          </div>

          {/* Action Button - Send/Stop/Mic */}
          <Button
            onClick={
              (input.trim() || selectedImages.length > 0 || selectedTool) 
                ? handleSend 
                : isLoading
                  ? onStopGeneration
                  : isListening
                    ? onMicrophoneClick // Stop listening when clicked while listening
                    : onMicrophoneClick // Start listening when clicked while not listening
            }
            disabled={false}
            size="icon"
            className={`h-[44px] w-[44px] sm:h-[52px] sm:w-[52px] rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-soft button-transition ${
              (input.trim() || selectedImages.length > 0 || selectedTool)
                ? 'bg-gradient-emerald hover:opacity-90 animate-glow-pulse'
                : isLoading
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
            title={
              (input.trim() || selectedImages.length > 0 || selectedTool)
                ? "Send message"
                : isLoading
                  ? "Stop generation"
                  : isListening 
                    ? "Stop listening (click to stop)" 
                    : "Start voice input (click to speak)"
            }
          >
            {(input.trim() || selectedImages.length > 0 || selectedTool) ? (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : isLoading ? (
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
