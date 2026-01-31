  import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X, Search, Book, ExternalLink, Volume2, VolumeX, Loader2, ChevronUp, ChevronDown, ArrowLeft, ArrowRight, Globe, BookOpen, Hash } from "lucide-react";

interface QuranVerse {
  number: number;
  text: string;
  translation: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
  audioUrl?: string;
}

interface Translation {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  type: string;
}

interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  folder: string;
  bitrate: string;
  status?: 'working' | 'fallback' | 'unavailable';
}

// Available Quran reciters with correct folder names for multiple audio sources
const availableReciters: Reciter[] = [
  { id: "alafasy", name: "Mishary Rashid Al-Afasy", arabicName: "مشاري راشد العفاسي", folder: "mishary_rashid_alafasy", bitrate: "128kbps" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري", folder: "mahmoud_khalil_al-hussary", bitrate: "128kbps" },
  { id: "sudais", name: "Abdul Rahman Al-Sudais", arabicName: "عبد الرحمن السديس", folder: "abdurrahmaan_as-sudais", bitrate: "192kbps" },
  { id: "shuraim", name: "Saud Al-Shuraim", arabicName: "سعود الشريم", folder: "saood_ash-shuraym", bitrate: "128kbps" },
  { id: "maher", name: "Maher Al-Muaiqly", arabicName: "ماهر المعيقلي", folder: "maher_al_mueaqly", bitrate: "128kbps" },
  { id: "minshawi", name: "Mohamed Siddiq Al-Minshawi", arabicName: "محمد صديق المنشاوي", folder: "muhammad_siddeeq_al-minshawee", bitrate: "128kbps" },
  { id: "ajmi", name: "Ahmed ibn Ali Al-Ajmi", arabicName: "أحمد بن علي العجمي", folder: "ahmed_ibn_ali_al-ajamy", bitrate: "128kbps" },
  { id: "ghamdi", name: "Saad Al-Ghamdi", arabicName: "سعد الغامدي", folder: "sa_d_al-ghaamidi", bitrate: "128kbps" },
  { id: "basfar", name: "Abdullah Basfar", arabicName: "عبد الله بصفر", folder: "abdullah_basfar", bitrate: "192kbps" },
  { id: "rifai", name: "Hani Ar-Rifai", arabicName: "هاني الرفاعي", folder: "hani_ar-rifai", bitrate: "192kbps" },
  { id: "abdulbasit", name: "Abdul Basit Abdul Samad", arabicName: "عبد الباسط عبد الصمد", folder: "abdul_basit_murattal", bitrate: "192kbps" },
  { id: "hudhaify", name: "Ali Al-Hudhaify", arabicName: "علي الحذيفي", folder: "hudhaify", bitrate: "128kbps" },
  { id: "bukhatir", name: "Salah Bukhatir", arabicName: "صلاح بخاطر", folder: "salaah_abdulrahman_bukhatir", bitrate: "128kbps" }
];

// Available translations in different languages
const availableTranslations: Translation[] = [
  { identifier: "en.sahih", language: "en", name: "Sahih International", englishName: "English", type: "translation" },
  { identifier: "en.pickthall", language: "en", name: "Pickthall", englishName: "English (Pickthall)", type: "translation" },
  { identifier: "en.yusufali", language: "en", name: "Yusuf Ali", englishName: "English (Yusuf Ali)", type: "translation" },
  { identifier: "ar.muyassar", language: "ar", name: "التفسير الميسر", englishName: "Arabic (Tafsir)", type: "tafsir" },
  { identifier: "ml.abdulhameed", language: "ml", name: "മലയാളം - അബ്ദുൽ ഹമീദ് & പറപ്പൂർ", englishName: "Malayalam", type: "translation" },
  { identifier: "ur.jalandhry", language: "ur", name: "اردو - فتح محمد جالندھری", englishName: "Urdu (Jalandhry)", type: "translation" },
  { identifier: "ur.kanzuliman", language: "ur", name: "اردو - کنز الایمان", englishName: "Urdu (Kanz ul Iman)", type: "translation" },
  { identifier: "hi.hindi", language: "hi", name: "हिंदी - फारूक खान & अहमद", englishName: "Hindi", type: "translation" },
  { identifier: "fr.hamidullah", language: "fr", name: "French - Hamidullah", englishName: "French", type: "translation" },
  { identifier: "de.bubenheim", language: "de", name: "German - Bubenheim & Elyas", englishName: "German", type: "translation" },
  { identifier: "es.cortes", language: "es", name: "Spanish - Cortes", englishName: "Spanish", type: "translation" },
  { identifier: "ru.kuliev", language: "ru", name: "Russian - Kuliev", englishName: "Russian", type: "translation" },
  { identifier: "tr.diyanet", language: "tr", name: "Turkish - Diyanet", englishName: "Turkish", type: "translation" },
  { identifier: "id.indonesian", language: "id", name: "Indonesian - Bahasa Indonesia", englishName: "Indonesian", type: "translation" },
  { identifier: "ms.basmeih", language: "ms", name: "Malay - Basmeih", englishName: "Malay", type: "translation" },
  { identifier: "bn.bengali", language: "bn", name: "Bengali - Muhiuddin Khan", englishName: "Bengali", type: "translation" },
  { identifier: "fa.makarem", language: "fa", name: "Persian - Makarem Shirazi", englishName: "Persian", type: "translation" },
  { identifier: "nl.keyzer", language: "nl", name: "Dutch - Keyzer", englishName: "Dutch", type: "translation" },
  { identifier: "it.piccardo", language: "it", name: "Italian - Piccardo", englishName: "Italian", type: "translation" },
  { identifier: "pt.elhayek", language: "pt", name: "Portuguese - El Hayek", englishName: "Portuguese", type: "translation" },
  { identifier: "sw.barwani", language: "sw", name: "Swahili - Al-Barwani", englishName: "Swahili", type: "translation" },
  { identifier: "zh.jian", language: "zh", name: "Chinese - Ma Jian", englishName: "Chinese", type: "translation" },
  { identifier: "ja.japanese", language: "ja", name: "Japanese", englishName: "Japanese", type: "translation" },
  { identifier: "ko.korean", language: "ko", name: "Korean", englishName: "Korean", type: "translation" },
  { identifier: "th.thai", language: "th", name: "Thai", englishName: "Thai", type: "translation" },
  { identifier: "vi.vietnamese", language: "vi", name: "Vietnamese", englishName: "Vietnamese", type: "translation" }
];

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
  const [selectedTranslation, setSelectedTranslation] = useState("en.sahih");
  const [selectedReciter, setSelectedReciter] = useState("alafasy");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [reciterStatus, setReciterStatus] = useState<Record<string, 'working' | 'fallback' | 'unavailable'>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Test reciter availability on component mount with enhanced testing
  useEffect(() => {
    const testReciterAvailability = async () => {
      // Test with Al-Fatiha (1:1) as it's available for most reciters
      const testSurah = "001";
      const testAyah = "001";
      
      for (const reciter of availableReciters) {
        try {
          // Test multiple sources for better reliability
          const testSources = [
            `https://everyayah.com/data/${reciter.folder}/${testSurah}${testAyah}.mp3`,
            `https://cdn.islamic.network/quran/audio/128/${reciter.folder}/1/1.mp3`,
            `https://server8.mp3quran.net/afs/${reciter.folder}/${testSurah}${testAyah}.mp3`,
          ];
          
          let reciterWorking = false;
          let usingFallback = false;
          
          for (let i = 0; i < testSources.length; i++) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
              
              const response = await fetch(testSources[i], { 
                method: 'HEAD',
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              if (response.ok) {
                reciterWorking = true;
                if (i > 0) usingFallback = true;
                break;
              }
            } catch (error) {
              console.log(`Test failed for ${reciter.name} source ${i + 1}:`, error);
              continue;
            }
          }
          
          if (reciterWorking) {
            setReciterStatus(prev => ({ 
              ...prev, 
              [reciter.id]: usingFallback ? 'fallback' : 'working' 
            }));
          } else {
            setReciterStatus(prev => ({ ...prev, [reciter.id]: 'unavailable' }));
          }
        } catch (error) {
          console.log(`Overall test failed for ${reciter.name}:`, error);
          setReciterStatus(prev => ({ ...prev, [reciter.id]: 'unavailable' }));
        }
      }
    };

    if (isOpen) {
      testReciterAvailability();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setSearchMode('reference');
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSearchMode('keyword');
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (results.length > 0) {
            setSelectedResultIndex(prev => 
              prev > 0 ? prev - 1 : results.length - 1
            );
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (results.length > 0) {
            setSelectedResultIndex(prev => 
              prev < results.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (results.length > 0 && selectedResultIndex >= 0) {
            handleInsert(results[selectedResultIndex]);
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedResultIndex, searchMode]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedResultIndex(0);
  }, [results]);

  const playArabicRecitation = async (verse: QuranVerse) => {
    const verseKey = `${verse.surah.number}-${verse.number}`;
    
    // Stop if already playing this verse
    if (playingAudio === verseKey) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setLoadingAudio(verseKey);

    try {
      // Get selected reciter info
      const reciter = availableReciters.find(r => r.id === selectedReciter) || availableReciters[0];
      
      // Format surah and ayah numbers with leading zeros
      const surahNum = String(verse.surah.number).padStart(3, "0");
      const ayahNum = String(verse.number).padStart(3, "0");
      
      // Enhanced audio sources with multiple fallbacks (similar to QuranReciting)
      const audioSources = [
        // Primary source - EveryAyah.com
        `https://everyayah.com/data/${reciter.folder}/${surahNum}${ayahNum}.mp3`,
        // QuranicAudio.com alternative
        `https://quranicaudio.com/files/audio/${reciter.folder}/${surahNum}${ayahNum}.mp3`,
        // Islamic.network CDN - very reliable
        `https://cdn.islamic.network/quran/audio/128/${reciter.folder}/${verse.surah.number}/${verse.number}.mp3`,
        `https://cdn.islamic.network/quran/audio/64/${reciter.folder}/${verse.surah.number}/${verse.number}.mp3`,
        // MP3Quran.net alternatives
        `https://server8.mp3quran.net/afs/${reciter.folder}/${surahNum}${ayahNum}.mp3`,
        `https://server6.mp3quran.net/qtm/${reciter.folder}/${surahNum}${ayahNum}.mp3`,
        // Backup servers
        `https://audio.qurancentral.com/download/${reciter.folder}/${surahNum}${ayahNum}.mp3`,
        // Fallback with different folder naming
        `https://download.quranicaudio.com/quran/${reciter.folder.replace(/_/g, '-')}/${surahNum}${ayahNum}.mp3`,
      ];

      await tryAudioSources(audioSources, verseKey, reciter);
    } catch (error) {
      setLoadingAudio(null);
      const reciter = availableReciters.find(r => r.id === selectedReciter) || availableReciters[0];
      setReciterStatus(prev => ({ ...prev, [selectedReciter]: 'unavailable' }));
      toast({
        title: "Audio Error",
        description: `Recitation by ${reciter.name} is not available for this verse. Please try another reciter.`,
        variant: "destructive",
      });
    }
  };

  // Enhanced audio loading with multiple source fallbacks
  const tryAudioSources = async (audioSources: string[], verseKey: string, reciter: Reciter): Promise<void> => {
    const tryAudioSource = async (sourceIndex: number): Promise<void> => {
      if (sourceIndex >= audioSources.length) {
        throw new Error("All audio sources failed");
      }

      const audioUrl = audioSources[sourceIndex];
      console.log(`Trying audio source ${sourceIndex + 1}/${audioSources.length}:`, audioUrl);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio();
      audio.crossOrigin = "anonymous"; // Enable CORS
      audio.preload = "metadata";

      return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;
        let resolved = false;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          audio.onloadeddata = null;
          audio.onerror = null;
          audio.oncanplaythrough = null;
          audio.onloadedmetadata = null;
          audio.onabort = null;
        };

        const resolveOnce = () => {
          if (resolved) return;
          resolved = true;
          cleanup();
          audioRef.current = audio;
          setLoadingAudio(null);
          setPlayingAudio(verseKey);
          setReciterStatus(prev => ({ 
            ...prev, 
            [selectedReciter]: sourceIndex === 0 ? 'working' : 'fallback' 
          }));
          
          // Show success toast for first-time loads or fallback usage
          if (sourceIndex > 0) {
            toast({
              title: "Audio Loaded",
              description: `Playing verse recitation by ${reciter.name} (using backup source)`,
              variant: "default",
            });
          }
          
          audio.play().catch(console.error);
          resolve();
        };

        const tryNext = () => {
          if (resolved) return;
          resolved = true;
          cleanup();
          console.log(`Audio source ${sourceIndex + 1} failed, trying next...`);
          tryAudioSource(sourceIndex + 1).then(resolve).catch(reject);
        };

        // Multiple success event handlers for better compatibility
        audio.onloadeddata = () => {
          if (audio.duration > 0) resolveOnce();
        };
        
        audio.oncanplaythrough = resolveOnce;
        
        audio.onloadedmetadata = () => {
          if (audio.duration > 0) resolveOnce();
        };

        // Error handlers
        audio.onerror = (e) => {
          console.log(`Audio error for source ${sourceIndex + 1}:`, e);
          tryNext();
        };

        audio.onabort = () => {
          console.log(`Audio aborted for source ${sourceIndex + 1}`);
          tryNext();
        };

        audio.onended = () => {
          setPlayingAudio(null);
        };

        // Timeout for loading (3 seconds for individual verses)
        timeoutId = setTimeout(() => {
          if (!resolved) {
            console.log(`Audio source ${sourceIndex + 1} timeout (3s), trying next...`);
            tryNext();
          }
        }, 3000);

        // Start loading
        try {
          audio.src = audioUrl;
          audio.load();
        } catch (error) {
          console.log(`Failed to load audio source ${sourceIndex + 1}:`, error);
          tryNext();
        }
      });
    };

    await tryAudioSource(0);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAudio(null);
  };

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
      let url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,${selectedTranslation}`;
      
      if (ayahNumber) {
        url = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,${selectedTranslation}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        if (ayahNumber) {
          // Single verse
          const arabicData = data.data[0];
          const translationData = data.data[1];
          setResults([
            {
              number: arabicData.numberInSurah,
              text: arabicData.text,
              translation: translationData.text,
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
          const translationData = data.data[1];
          const verses: QuranVerse[] = arabicData.ayahs.map((ayah: { numberInSurah: number; text: string }, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: translationData.ayahs[index].text,
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
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${selectedTranslation}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.data.matches) {
        const verses: QuranVerse[] = await Promise.all(
          data.data.matches.slice(0, 10).map(async (match: { 
            surah: { number: number; name: string; englishName: string }; 
            numberInSurah: number; 
            text: string 
          }) => {
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
    stopAudio();
    
    // Get the selected translation info
    const selectedTranslationInfo = availableTranslations.find(t => t.identifier === selectedTranslation);
    const translationLanguage = selectedTranslationInfo?.language || 'en';
    const translationName = selectedTranslationInfo?.englishName || 'English';
    
    // Create language-specific instruction for the AI
    let languageInstruction = '';
    if (translationLanguage !== 'en') {
      const languageNames: { [key: string]: string } = {
        'ml': 'Malayalam',
        'ar': 'Arabic',
        'ur': 'Urdu',
        'hi': 'Hindi',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'ru': 'Russian',
        'tr': 'Turkish',
        'id': 'Indonesian',
        'ms': 'Malay',
        'bn': 'Bengali',
        'fa': 'Persian',
        'nl': 'Dutch',
        'it': 'Italian',
        'pt': 'Portuguese',
        'sw': 'Swahili',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'th': 'Thai',
        'vi': 'Vietnamese'
      };
      
      const languageName = languageNames[translationLanguage] || translationName;
      languageInstruction = `\n\n[Please respond in ${languageName} language since the user selected ${translationName} translation]`;
    }
    
    const formattedVerse = `📖 **${verse.surah.englishName} (${verse.surah.number}:${verse.number})**\n\n"${verse.text}"\n\n*Translation (${translationName}):* "${verse.translation}"${languageInstruction}`;
    onInsertVerse(formattedVerse);
    onClose();
  };

  const handleClose = () => {
    stopAudio();
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
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Mode Toggle with Arrow Navigation */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-2 flex-1">
              <Button
                variant={searchMode === "reference" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchMode("reference")}
                className={`flex items-center gap-2 ${searchMode === "reference" ? "bg-gradient-emerald" : ""}`}
              >
                <ArrowLeft className="w-3 h-3" />
                By Reference
              </Button>
              <Button
                variant={searchMode === "keyword" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchMode("keyword")}
                className={`flex items-center gap-2 ${searchMode === "keyword" ? "bg-gradient-emerald" : ""}`}
              >
                By Keyword
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {/* Switch modes instruction removed */}
            </div>
          </div>

          {/* Translation Language Selector */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Translation:</span>
              </div>
              <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableTranslations.map((translation) => (
                    <SelectItem key={translation.identifier} value={translation.identifier}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{translation.englishName}</span>
                        {translation.type === 'tafsir' && (
                          <span className="text-xs bg-muted px-1 rounded">Tafsir</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reciter Selector */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                <span>Reciter:</span>
              </div>
              <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableReciters.map((reciter) => {
                    const status = reciterStatus[reciter.id];
                    return (
                      <SelectItem key={reciter.id} value={reciter.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{reciter.name}</span>
                          <div className="flex items-center gap-1 ml-2">
                            {status === 'working' && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" title="Available" />
                            )}
                            {status === 'fallback' && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Available (lower quality)" />
                            )}
                            {status === 'unavailable' && (
                              <div className="w-2 h-2 bg-red-500 rounded-full" title="Unavailable" />
                            )}
                            {!status && (
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" title="Testing..." />
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Lower quality</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Unavailable</span>
              </div>
            </div>
          </div>

          {searchMode === "reference" ? (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Select value={surahNumber} onValueChange={setSurahNumber}>
                  <SelectTrigger className="rounded-2xl">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Surah # (1-114)" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Surah {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Ayah # (optional)"
                    value={ayahNumber}
                    onChange={(e) => setAyahNumber(e.target.value)}
                    type="number"
                    min="1"
                    className="rounded-2xl pl-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
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
              <div className={`relative ${isSearching ? 'animate-spin-border' : ''}`}>
                <Input
                  placeholder="Search for a word or phrase..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => setIsSearching(true)}
                  onBlur={() => !loading && setIsSearching(false)}
                  className="flex-1 rounded-2xl relative z-10"
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
          )}
        </div>

        {/* Results with Arrow Navigation */}
        <ScrollArea className="h-96">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Book className="w-12 h-12 mb-4 opacity-50" />
              <p>Search for Quran verses in multiple languages</p>
              <p className="text-sm">e.g., Surah 1, Ayah 1 or search "mercy"</p>
              <p className="text-xs mt-2">Available in 25+ languages including Arabic, English, Urdu, Hindi, French, German, and more</p>
              <div className="mt-4 text-xs text-center space-y-1">
                <p>Keyboard shortcuts:</p>
                <p>{/* Navigation instructions removed */}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {results.map((verse, index) => (
                <div
                  key={`${verse.surah.number}-${verse.number}-${index}`}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    index === selectedResultIndex
                      ? "bg-primary/10 border-primary shadow-md ring-2 ring-primary/20"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <Book className="w-4 h-4" />
                      <span>
                        {verse.surah.englishName} ({verse.surah.number}:{verse.number})
                      </span>
                      {index === selectedResultIndex && (
                        <div className="flex items-center gap-1 text-xs">
                          <ChevronUp className="w-3 h-3" />
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playArabicRecitation(verse)}
                        disabled={loadingAudio === `${verse.surah.number}-${verse.number}`}
                        className="shrink-0"
                        title="Play Arabic Recitation"
                      >
                        {loadingAudio === `${verse.surah.number}-${verse.number}` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : playingAudio === `${verse.surah.number}-${verse.number}` ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={index === selectedResultIndex ? "default" : "outline"}
                        onClick={() => handleInsert(verse)}
                        className="shrink-0"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {index === selectedResultIndex ? "Press Enter" : "Use in Chat"}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-right font-display text-lg text-foreground mb-3 leading-loose">
                    {verse.text}
                  </p>
                  
                  <p className="text-sm text-muted-foreground italic">
                    {verse.translation}
                  </p>
                </div>
              ))}
              
              {results.length > 0 && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  {/* Navigation instructions removed */}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
