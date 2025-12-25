import { Sparkles, RotateCcw, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpenRouterStatus } from "./OpenRouterStatus";

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
  showActions?: boolean;
}

export const ChatHeader = ({ onClear, hasMessages, showActions = true }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
            <Moon className="w-2.5 h-2.5 text-secondary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-xl text-foreground">Islamic AI</h1>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">Your spiritual guide</p>
            {/* <OpenRouterStatus /> */}
          </div>
        </div>
      </div>

      {showActions && hasMessages && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      )}
    </div>
  );
};
