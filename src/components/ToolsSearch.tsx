import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, Book, Clock, Calendar, BookMarked, ChevronUp, ChevronDown } from "lucide-react";

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
  onOpenPrayerTimes: () => void;
  onOpenIslamicCalendar: () => void;
}

export const ToolsSearch = ({
  isOpen,
  onClose,
  onOpenQuranSearch,
  onOpenHadithSearch,
  onOpenPrayerTimes,
  onOpenIslamicCalendar,
}: ToolsSearchProps) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

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
        onOpenHadithSearch();
        onClose();
      },
    },
    {
      id: "prayer-times",
      name: "Prayer Times",
      description: "View daily prayer schedules",
      icon: <Clock className="w-5 h-5" />,
      action: () => {
        onOpenPrayerTimes();
        onClose();
      },
    },
    {
      id: "islamic-calendar",
      name: "Islamic Calendar",
      description: "Hijri calendar with important dates",
      icon: <Calendar className="w-5 h-5" />,
      action: () => {
        onOpenIslamicCalendar();
        onClose();
      },
    },
  ];

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(query.toLowerCase()) ||
    tool.description.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredTools.length - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredTools.length - 1 ? prev + 1 : 0
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTools.length > 0 && selectedIndex >= 0) {
            filteredTools[selectedIndex].action();
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
  }, [isOpen, filteredTools, selectedIndex]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 rounded-3xl"
              autoFocus
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Use ↑ ↓ arrows to navigate • Press Enter to select • Esc to close
          </div>
        </div>

        {/* Tools List */}
        <ScrollArea className="max-h-80">
          {filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p>No tools found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredTools.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={tool.action}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left hover:scale-[1.02] ${
                    index === selectedIndex
                      ? "bg-primary/10 border-primary shadow-md ring-2 ring-primary/20"
                      : "bg-muted/50 border-border hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      tool.id === 'quran-search' ? 'bg-emerald-500/20 text-emerald-600' :
                      tool.id === 'hadith-search' ? 'bg-blue-500/20 text-blue-600' :
                      tool.id === 'prayer-times' ? 'bg-purple-500/20 text-purple-600' :
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
          )}
        </ScrollArea>
      </div>
    </div>
  );
};