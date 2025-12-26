import { useState, KeyboardEvent, useEffect } from "react";
import { Send, Loader2, Image, X, Square, Wrench, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize, isValidImageType, isValidImageSize } from "@/utils/fileUtils";

interface ChatInputProps {
  onSend: (message: string, attachments?: { images?: File[] }) => void;
  onStop?: () => void;
  onOpenTools?: () => void;
  selectedTool?: string | null;
  onRemoveTool?: () => void;
  isLoading: boolean;
  onMicrophoneClick?: () => void;
  onMLMClick?: () => void;
  currentLanguage?: string;
  isListening?: boolean;
}

export const ChatInput = ({ onSend, onStop, onOpenTools, selectedTool, onRemoveTool, isLoading, onMicrophoneClick, onMLMClick, currentLanguage = "ENG", isListening = false }: ChatInputProps) => {
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

  const hasContent = input.trim() || selectedImages.length > 0 || selectedTool;

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
      className={`border-t border-border bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 relative ${
        isDragOver ? 'bg-primary/10 border-primary animate-glow-pulse' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10 animate-scale-in">
          <div className="text-center animate-bounce-gentle">
            <Image className="w-12 h-12 mx-auto mb-2 text-primary" />
            <p className="text-primary font-medium">Drop images here to upload</p>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Attachments Preview */}
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-slide-in-left">
            {/* Image Previews */}
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {formatFileSize(file.size)}
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2 items-end">
          {/* MLM Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMLMClick}
            disabled={isLoading}
            className="h-[52px] px-3 sm:px-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all duration-200 rounded-3xl border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-2 font-semibold active:scale-[1.2] active:bg-emerald-100 dark:active:bg-emerald-900"
            title="Multi-Language Mode - Click to change language"
          >
            <span className="text-xs sm:text-sm font-bold tracking-wider">{currentLanguage}</span>
          </Button>

          {/* Text Input with Tool Tag and Voice Button */}
          <div className="relative flex-1">
            {/* Selected Tool Tag */}
            {selectedTool && (
              <div className="absolute left-12 top-3 z-10 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-sm">
                <div className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center">
                  <Wrench className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-primary font-medium">{selectedTool}</span>
                {onRemoveTool && (
                  <button
                    onClick={onRemoveTool}
                    className="w-4 h-4 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
                    title="Remove tool"
                  >
                    <X className="w-2.5 h-2.5 text-primary" />
                  </button>
                )}
              </div>
            )}

            {/* Voice Button - Inside Input Left */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMicrophoneClick}
              disabled={isLoading}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full transition-all duration-200 hover:scale-105 shadow-lg ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-emerald-500 hover:bg-emerald-600'
              } text-white`}
              title={isListening ? "Listening... Click to stop" : "Voice Input"}
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedTool ? "Ask about this tool..." : "Ask about Islam, Quran, prayers, or seek guidance..."}
              className={`min-h-[52px] max-h-32 resize-none bg-background border-border focus:ring-2 focus:ring-primary/20 rounded-3xl transition-all duration-300 ${
                selectedTool ? 'pt-12 pl-12 pr-16' : 'pl-12 pr-16'
              }`}
              disabled={isLoading}
            />
            
            {/* Tools Button - Inside Input Right */}
            {onOpenTools && !selectedTool && (
              <Button
                variant="ghost"
                onClick={onOpenTools}
                disabled={isLoading}
                className="absolute right-2 bottom-3 h-8 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 flex items-center gap-1.5 rounded-2xl"
                title="Open Islamic Tools"
              >
                <Wrench className="w-3 h-3" />
                Tools
              </Button>
            )}
          </div>

          {/* Send/Stop Button */}
          <Button
            onClick={isLoading ? onStop : handleSend}
            disabled={!isLoading && !hasContent}
            size="icon"
            className={`h-[52px] w-[52px] rounded-3xl transition-all duration-300 shadow-soft ${
              isLoading 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gradient-emerald hover:opacity-90'
            } ${
              hasContent && !isLoading ? 'hover:scale-110 animate-glow-pulse' : ''
            }`}
            title={isLoading ? "Stop generation" : "Send message"}
          >
            {isLoading ? (
              <Square className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
