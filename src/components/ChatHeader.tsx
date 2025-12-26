import { Sparkles, RotateCcw, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
  showActions?: boolean;
}

export const ChatHeader = ({ onClear, hasMessages, showActions = true }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center gap-4">
        {/* Stylish Logo */}
        <div className="relative group">
          {/* Outer rotating border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-spin-border opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Main logo container */}
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
            {/* Islamic geometric pattern overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-20">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <defs>
                  <pattern id="islamic-pattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M6 0L12 6L6 12L0 6Z" fill="currentColor" opacity="0.3"/>
                    <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="48" height="48" fill="url(#islamic-pattern)" className="text-white"/>
              </svg>
            </div>
            
            {/* Central icon */}
            <div className="relative z-10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-pulse-glow" />
            </div>
            
            {/* Decorative elements */}
            <Star className="absolute top-1 right-1 w-2.5 h-2.5 text-yellow-300 animate-bounce-gentle" />
            <Zap className="absolute bottom-1 left-1 w-2.5 h-2.5 text-yellow-200 animate-float-gentle" />
          </div>
          
          {/* Glowing accent */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
        </div>

        {/* Enhanced Typography */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Islamic AI
            </h1>
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground font-medium">Your spiritual guide</p>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>
      </div>

      {showActions && hasMessages && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      )}
    </div>
  );
};
