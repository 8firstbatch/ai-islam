import { Sparkles, BookOpen, Moon, Heart } from "lucide-react";

const suggestions = [
  {
    icon: BookOpen,
    title: "Learn about Quran",
    prompt: "What are the main themes of the Quran?",
  },
  {
    icon: Moon,
    title: "Prayer guidance",
    prompt: "How do I perform the five daily prayers?",
  },
  {
    icon: Heart,
    title: "Spiritual advice",
    prompt: "How can I strengthen my faith in difficult times?",
  },
];

interface WelcomeScreenProps {
  onSuggestionClick: (prompt: string) => void;
}

export const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* Decorative Islamic pattern */}
      <div className="absolute inset-0 pattern-islamic opacity-30 pointer-events-none" />

      {/* Logo/Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-emerald flex items-center justify-center shadow-soft animate-float">
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-glow animate-pulse-glow">
          <Moon className="w-4 h-4 text-secondary-foreground" />
        </div>
      </div>

      {/* Welcome text */}
      <h1 className="font-display text-4xl md:text-5xl text-primary mb-4 text-center">
        Assalamu Alaikum
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-2">
        Peace be upon you. I am your Islamic AI assistant, here to help you with questions about Islam, Quran, prayers, and spiritual guidance.
      </p>
      <p className="text-sm text-primary font-display mb-12 opacity-80">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <suggestion.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {suggestion.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {suggestion.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
