import { Sparkles, RotateCcw, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
  showActions?: boolean;
}

export const ChatHeader = ({ onClear, hasMessages, showActions = true }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between flex-1 gap-2 sm:gap-4">
      {/* Empty space for minimal design */}
      <div className="flex-1"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* New Chat Button */}
        {showActions && hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 sm:h-9 px-2 sm:px-3 text-muted-foreground hover:text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all duration-200 rounded-full flex items-center gap-1 sm:gap-2"
            title="New Chat"
          >
            <RotateCcw className="w-4 h-4 flex-shrink-0" />
            <span className="hidden md:inline text-xs font-medium">New Chat</span>
          </Button>
        )}
      </div>
    </div>
  );
};
