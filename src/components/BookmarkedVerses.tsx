import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Heart, 
  Search, 
  Trash2, 
  MessageSquare, 
  Copy,
  BookOpen,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookmarkedVerse {
  id: string;
  surah_number: number;
  verse_number: number;
  surah_name: string;
  arabic_text: string;
  english_translation: string;
  notes?: string;
  created_at: string;
}

interface BookmarkedVersesProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertVerse: (verse: string) => void;
}

export const BookmarkedVerses = ({ isOpen, onClose, onInsertVerse }: BookmarkedVersesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  // Local storage key for bookmarks
  const getStorageKey = () => `bookmarked_verses_${user?.id || 'guest'}`;

  useEffect(() => {
    if (isOpen && user) {
      loadBookmarks();
    }
  }, [isOpen, user]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      // Load from localStorage for now
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedBookmarks = JSON.parse(stored);
        setBookmarks(parsedBookmarks);
      } else {
        // Sample bookmarks for demonstration
        const sampleBookmarks: BookmarkedVerse[] = [
          {
            id: "1",
            surah_number: 2,
            verse_number: 255,
            surah_name: "Al-Baqarah",
            arabic_text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
            english_translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            surah_number: 1,
            verse_number: 1,
            surah_name: "Al-Fatihah",
            arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            english_translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
            created_at: new Date().toISOString()
          }
        ];
        setBookmarks(sampleBookmarks);
        localStorage.setItem(storageKey, JSON.stringify(sampleBookmarks));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to load bookmarked verses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBookmarks = (updatedBookmarks: BookmarkedVerse[]) => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(updatedBookmarks));
    setBookmarks(updatedBookmarks);
  };

  const deleteBookmark = async (id: string) => {
    try {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
      saveBookmarks(updatedBookmarks);
      
      toast({
        title: "Success",
        description: "Bookmark removed successfully"
      });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive"
      });
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      const updatedBookmarks = bookmarks.map(bookmark => 
        bookmark.id === id ? { ...bookmark, notes } : bookmark
      );
      saveBookmarks(updatedBookmarks);
      
      setEditingNotes(null);
      setNotesText("");
      
      toast({
        title: "Success",
        description: "Notes updated successfully"
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Verse copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleInsertVerse = (bookmark: BookmarkedVerse) => {
    const verseText = `${bookmark.surah_name} ${bookmark.surah_number}:${bookmark.verse_number}\n\n${bookmark.arabic_text}\n\n${bookmark.english_translation}`;
    onInsertVerse(verseText);
    onClose();
  };

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.surah_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.english_translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.arabic_text.includes(searchTerm) ||
    (bookmark.notes && bookmark.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Bookmarked Verses
            <Badge variant="secondary">{bookmarks.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search bookmarked verses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>

        {/* Bookmarks List */}
        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No bookmarks match your search" : "No bookmarked verses yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {!searchTerm && "Use the Quran Search to bookmark your favorite verses"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {bookmark.surah_name} {bookmark.surah_number}:{bookmark.verse_number}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(`${bookmark.arabic_text}\n\n${bookmark.english_translation}`)}
                          title="Copy verse"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInsertVerse(bookmark)}
                          title="Insert into chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this bookmarked verse? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBookmark(bookmark.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Arabic Text */}
                    <div className="text-right text-xl leading-relaxed font-arabic">
                      {bookmark.arabic_text}
                    </div>
                    
                    {/* English Translation */}
                    <div className="text-muted-foreground italic">
                      {bookmark.english_translation}
                    </div>

                    {/* Notes Section */}
                    <div className="border-t pt-3">
                      {editingNotes === bookmark.id ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Add your notes about this verse..."
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateNotes(bookmark.id, notesText);
                              } else if (e.key === 'Escape') {
                                setEditingNotes(null);
                                setNotesText("");
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateNotes(bookmark.id, notesText)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingNotes(null);
                                setNotesText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => {
                            setEditingNotes(bookmark.id);
                            setNotesText(bookmark.notes || "");
                          }}
                        >
                          {bookmark.notes ? (
                            <div className="bg-muted p-2 rounded">
                              <strong>Notes:</strong> {bookmark.notes}
                            </div>
                          ) : (
                            <div className="text-muted-foreground italic">
                              Click to add notes...
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bookmark Date */}
                    <div className="text-xs text-muted-foreground">
                      Bookmarked on {new Date(bookmark.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};