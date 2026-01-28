import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, Book, Calendar, BookMarked, Volume2, ChevronUp, ChevronDown } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface ToolsSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuranSearch: () => void;
  onOpenHadithSearch: () => void;
  onOpenIslamicCalendar: () => void;
  onOpenQuranReciting: () => void;
}

export const ToolsSearch = ({
  isOpen,
  onClose,
  onOpenQuranSearch,
  onOpenHadithSearch,
  onOpenIslamicCalendar,
  onOpenQuranReciting,
}: ToolsSearchProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  console.log("ToolsSearch rendered, isOpen:", isOpen);

  const tools: Tool[] = [
    {
      id: "quran-search",
      name: "Quran Search",
      description: "Search verses by reference or keyword",
      icon: <Book className="w-5 h-5" />,
      action: () => {
        console.log("Opening Quran Search");
        onOpenQuranSearch();
        onClose();
      },
    },
    {
      id: "hadith-search",
      name: "Hadith Search",
      description: "Find authentic hadiths from collections",
      icon: <BookMarked className="w-5 h-5" />,
      action: () => {
        console.log("Opening Hadith Search");
        onOpenHadithSearch();
        onClose();
      },
    },
    {
      id: "quran-reciting",
      name: "Quran Recitation",
      description: "Listen to beautiful Quran recitations",
      icon: <Volume2 className="w-5 h-5" />,
      action: () => {
        console.log("Opening Quran Recitation");
        onOpenQuranReciting();
        onClose();
      },
    },
    {
      id: "islamic-calendar",
      name: "Islamic Calendar",
      description: "Hijri calendar with important dates",
      icon: <Calendar className="w-5 h-5" />,
      action: () => {
        console.log("Opening Islamic Calendar");
        onOpenIslamicCalendar();
        onClose();
      },
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : tools.length - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < tools.length - 1 ? prev + 1 : 0
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (tools.length > 0 && selectedIndex >= 0) {
            tools[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, onClose, onOpenQuranSearch, onOpenHadithSearch, onOpenIslamicCalendar]);

  // Reset selected index when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-soft overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center">
              <Search className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Islamic Tools</h2>
              <p className="text-xs text-muted-foreground">Search and access Islamic resources</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="text-center text-sm text-muted-foreground">
            Select an Islamic tool to get started
          </div>
        </div>

        {/* Tools List */}
        <ScrollArea className="max-h-80">
          <div className="p-2 space-y-1">
            {tools.map((tool, index) => (
              <button
                key={tool.id}
                onClick={() => {
                  console.log("Button clicked for tool:", tool.id);
                  tool.action();
                }}
                className={`w-full p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.02] ${
                  index === selectedIndex
                    ? "bg-primary/10 border-primary shadow-md ring-2 ring-primary/20"
                    : "bg-muted/50 border-border hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tool.id === 'quran-search' ? 'bg-emerald-500/20 text-emerald-600' :
                    tool.id === 'hadith-search' ? 'bg-blue-500/20 text-blue-600' :
                    tool.id === 'quran-reciting' ? 'bg-purple-500/20 text-purple-600' :
                    'bg-amber-500/20 text-amber-600'
                  }`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{tool.name}</h3>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <ChevronUp className="w-3 h-3" />
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};