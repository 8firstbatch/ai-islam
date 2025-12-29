interface WelcomeScreenProps {
  onSuggestionClick: (prompt: string) => void;
}

export const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* Decorative Islamic pattern */}
      <div className="absolute inset-0 pattern-islamic opacity-30 pointer-events-none animate-float-gentle" />

      {/* Welcome text */}
      <h1 className="font-islamic-greeting text-4xl md:text-5xl text-primary mb-4 text-center animate-slide-in-left font-medium tracking-wide">
        Assalamu Alaikum
      </h1>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-medium text-primary mb-2 tracking-wider">AI ISLAM</h2>
        <p className="text-muted-foreground text-lg font-light">Your Islamic AI Assistant</p>
      </div>

      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-primary/20 rounded-full animate-float-gentle" style={{ animationDelay: "1s" }} />
      <div className="absolute top-32 right-32 w-3 h-3 bg-gold/30 rounded-full animate-float-gentle" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-40 left-40 w-1 h-1 bg-primary/40 rounded-full animate-float-gentle" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-gold/20 rounded-full animate-float-gentle" style={{ animationDelay: "1.5s" }} />
    </div>
  );
};
