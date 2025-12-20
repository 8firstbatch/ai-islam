import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { X, Search, Book, ExternalLink } from "lucide-react";

interface QuranVerse {
  number: number;
  text: string;
  translation: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

interface QuranSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertVerse: (verse: string) => void;
}

export const QuranSearch = ({ isOpen, onClose, onInsertVerse }: QuranSearchProps) => {
  const [query, setQuery] = useState("");
  const [surahNumber, setSurahNumber] = useState("");
  const [ayahNumber, setAyahNumber] = useState("");
  const [results, setResults] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<"reference" | "keyword">("reference");
  const { toast } = useToast();

  const searchByReference = async () => {
    if (!surahNumber) {
      toast({
        title: "Please enter a Surah number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`;
      
      if (ayahNumber) {
        url = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,en.sahih`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        if (ayahNumber) {
          // Single verse
          const arabicData = data.data[0];
          const englishData = data.data[1];
          setResults([
            {
              number: arabicData.numberInSurah,
              text: arabicData.text,
              translation: englishData.text,
              surah: {
                number: arabicData.surah.number,
                name: arabicData.surah.name,
                englishName: arabicData.surah.englishName,
              },
            },
          ]);
        } else {
          // Whole surah
          const arabicData = data.data[0];
          const englishData = data.data[1];
          const verses: QuranVerse[] = arabicData.ayahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: englishData.ayahs[index].text,
            surah: {
              number: arabicData.number,
              name: arabicData.name,
              englishName: arabicData.englishName,
            },
          }));
          setResults(verses.slice(0, 20)); // Limit to first 20 verses
        }
      } else {
        throw new Error("Verse not found");
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not find the verse. Please check the reference.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchByKeyword = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/en.sahih`
      );
      const data = await response.json();

      if (data.status === "OK" && data.data.matches) {
        const verses: QuranVerse[] = await Promise.all(
          data.data.matches.slice(0, 10).map(async (match: any) => {
            // Fetch Arabic text
            const arabicRes = await fetch(
              `https://api.alquran.cloud/v1/ayah/${match.surah.number}:${match.numberInSurah}/quran-uthmani`
            );
            const arabicData = await arabicRes.json();
            
            return {
              number: match.numberInSurah,
              text: arabicData.data?.text || "",
              translation: match.text,
              surah: {
                number: match.surah.number,
                name: match.surah.name,
                englishName: match.surah.englishName,
              },
            };
          })
        );
        setResults(verses);
      } else {
        setResults([]);
        toast({
          title: "No results",
          description: "No verses found matching your search.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Search failed. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchMode === "reference") {
      searchByReference();
    } else {
      searchByKeyword();
    }
  };

  const handleInsert = (verse: QuranVerse) => {
    const formattedVerse = `📖 **${verse.surah.englishName} (${verse.surah.number}:${verse.number})**\n\n"${verse.text}"\n\n*Translation:* "${verse.translation}"`;
    onInsertVerse(formattedVerse);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-soft overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center">
              <Book className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Quran Search</h2>
              <p className="text-xs text-muted-foreground">Find verses by reference or keyword</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Mode Toggle */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 mb-4">
            <Button
              variant={searchMode === "reference" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchMode("reference")}
              className={searchMode === "reference" ? "bg-gradient-emerald" : ""}
            >
              By Reference
            </Button>
            <Button
              variant={searchMode === "keyword" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchMode("keyword")}
              className={searchMode === "keyword" ? "bg-gradient-emerald" : ""}
            >
              By Keyword
            </Button>
          </div>

          {searchMode === "reference" ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Surah # (1-114)"
                  value={surahNumber}
                  onChange={(e) => setSurahNumber(e.target.value)}
                  type="number"
                  min="1"
                  max="114"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Ayah # (optional)"
                  value={ayahNumber}
                  onChange={(e) => setAyahNumber(e.target.value)}
                  type="number"
                  min="1"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-emerald hover:opacity-90"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Input
                placeholder="Search for a word or phrase..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-emerald hover:opacity-90"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="h-96">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Book className="w-12 h-12 mb-4 opacity-50" />
              <p>Search for Quran verses above</p>
              <p className="text-sm">e.g., Surah 1, Ayah 1 or search "mercy"</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {results.map((verse, index) => (
                <div
                  key={`${verse.surah.number}-${verse.number}-${index}`}
                  className="p-4 bg-muted/50 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <Book className="w-4 h-4" />
                      <span>
                        {verse.surah.englishName} ({verse.surah.number}:{verse.number})
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInsert(verse)}
                      className="shrink-0"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Use in Chat
                    </Button>
                  </div>
                  
                  <p className="text-right font-display text-lg text-foreground mb-3 leading-loose">
                    {verse.text}
                  </p>
                  
                  <p className="text-sm text-muted-foreground italic">
                    {verse.translation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
