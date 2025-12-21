import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, X } from "lucide-react";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export const LoginPrompt = ({ isOpen, onClose, onContinueAsGuest }: LoginPromptProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-soft overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-lg text-foreground">Sign In to Continue</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-emerald flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Sign in to save your conversations and access them across devices. Your chat history will be preserved!
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/auth")}
              className="w-full bg-gradient-emerald hover:opacity-90"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </Button>

            <Button
              variant="outline"
              onClick={onContinueAsGuest}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Guest conversations won't be saved
          </p>
        </div>
      </div>
    </div>
  );
};
