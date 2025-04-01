
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Save, Loader2 } from "lucide-react";
import { bibleBooks } from "@/data/bible-database";
import { 
  getAllBooks, 
  saveReadingProgress,
  getAllReadingProgress,
  BibleAPIBook,
  getChapterJournal,
  saveChapterJournal
} from "@/services/bible-api";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface BibleReadingProps {
  initialBook?: string;
  initialChapter?: number;
  onReadComplete?: (book: string, chapter: number) => void;
}

export function BibleReading({ 
  initialBook = "John", 
  initialChapter = 1,
  onReadComplete
}: BibleReadingProps) {
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [loading, setLoading] = useState(true);
  const [chapterCount, setChapterCount] = useState(1);
  const [allBooks, setAllBooks] = useState<BibleAPIBook[]>([]);
  const [readingProgress, setReadingProgress] = useState<Record<string, boolean>>({});
  const [journalText, setJournalText] = useState("");
  const [savingJournal, setSavingJournal] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const { toast } = useToast();
  
  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Load all books
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await getAllBooks();
        setAllBooks(books);
      } catch (error) {
        console.error("Failed to load Bible books:", error);
        // Fallback to local book list if API fails
        const oldTestamentBooks = bibleBooks.oldTestament.map((name, i) => ({
          id: `OT${i}`,
          name,
          testament: "OT" as const,
          chapters: 50, // Default
        }));
        
        const newTestamentBooks = bibleBooks.newTestament.map((name, i) => ({
          id: `NT${i}`,
          name,
          testament: "NT" as const,
          chapters: 28, // Default
        }));
        
        setAllBooks([...oldTestamentBooks, ...newTestamentBooks]);
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
    
    // Load reading progress
    const loadReadingProgress = async () => {
      if (isAuthenticated === null) return; // Wait for auth check
      
      const progress = await getAllReadingProgress();
      const progressMap: Record<string, boolean> = {};
      
      progress.forEach(p => {
        progressMap[`${p.book}-${p.chapter}`] = p.completed;
      });
      
      setReadingProgress(progressMap);
    };
    
    if (isAuthenticated !== null) {
      loadReadingProgress();
    }
  }, [isAuthenticated]);
  
  // Load chapter data and journal when book or chapter changes
  useEffect(() => {
    const loadChapterJournal = async () => {
      if (isAuthenticated === null) return; // Wait for auth check
      
      setLoading(true);
      
      try {
        // Find book ID from the name
        const book = allBooks.find(b => b.name === selectedBook);
        
        if (book) {
          // Set chapter count for the selected book
          setChapterCount(book.chapters);
        } else {
          // Estimate chapter count based on common Bible knowledge
          const chapterCounts: Record<string, number> = {
            "Genesis": 50,
            "Exodus": 40,
            "Leviticus": 27,
            "Numbers": 36,
            "Deuteronomy": 34,
            "Matthew": 28,
            "Mark": 16,
            "Luke": 24,
            "John": 21,
            "Acts": 28,
            "Romans": 16,
            // Add more as needed
          };
          
          setChapterCount(chapterCounts[selectedBook] || 1);
        }
        
        // Load journal text for this chapter if authenticated
        if (isAuthenticated) {
          const journal = await getChapterJournal(selectedBook, selectedChapter);
          setJournalText(journal || "");
        }
      } catch (error) {
        console.error("Error loading chapter journal:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (allBooks.length > 0 && isAuthenticated !== null) {
      loadChapterJournal();
    }
  }, [selectedBook, selectedChapter, allBooks, isAuthenticated]);
  
  // Mark chapter as read
  const markAsRead = async (checked: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your reading progress.",
        variant: "destructive"
      });
      return;
    }
    
    if (checked) {
      setMarkingAsRead(true);
      
      try {
        await saveReadingProgress(selectedBook, selectedChapter);
        
        // Update local state
        setReadingProgress({
          ...readingProgress,
          [`${selectedBook}-${selectedChapter}`]: true
        });
        
        toast({
          title: "Chapter Completed!",
          description: `You've marked ${selectedBook} ${selectedChapter} as read.`,
        });
        
        // Call callback if provided
        if (onReadComplete) {
          onReadComplete(selectedBook, selectedChapter);
        }
      } catch (error) {
        console.error("Error marking chapter as read:", error);
        toast({
          title: "Error",
          description: "Failed to mark chapter as read. Please try again.",
          variant: "destructive"
        });
      } finally {
        setMarkingAsRead(false);
      }
    } else {
      // Handle unmarking as read (optional)
      // For now, we'll just show a toast but not actually remove the progress
      toast({
        title: "Note",
        description: "Your reading history has been maintained.",
      });
    }
  };
  
  const saveJournal = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your journal entries.",
        variant: "destructive"
      });
      return;
    }
    
    setSavingJournal(true);
    
    try {
      await saveChapterJournal(selectedBook, selectedChapter, journalText);
      
      toast({
        title: "Journal Saved",
        description: "Your notes for this chapter have been saved.",
      });
    } catch (error) {
      console.error("Error saving journal:", error);
      toast({
        title: "Error",
        description: "Failed to save journal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingJournal(false);
    }
  };
  
  // Navigation functions
  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      // Find previous book
      const allBookNames = allBooks.map(b => b.name);
      const currentIndex = allBookNames.indexOf(selectedBook);
      
      if (currentIndex > 0) {
        const prevBook = allBookNames[currentIndex - 1];
        const prevBookObj = allBooks.find(b => b.name === prevBook);
        
        setSelectedBook(prevBook);
        // Set to last chapter of previous book
        setSelectedChapter(prevBookObj?.chapters || 1);
      }
    }
  };
  
  const goToNextChapter = () => {
    if (selectedChapter < chapterCount) {
      setSelectedChapter(selectedChapter + 1);
    } else {
      // Find next book
      const allBookNames = allBooks.map(b => b.name);
      const currentIndex = allBookNames.indexOf(selectedBook);
      
      if (currentIndex < allBookNames.length - 1) {
        const nextBook = allBookNames[currentIndex + 1];
        setSelectedBook(nextBook);
        setSelectedChapter(1);
      }
    }
  };
  
  // Generate array of chapters for the select
  const chapterOptions = Array.from({ length: chapterCount }, (_, i) => i + 1);
  
  // Check if this chapter is already read
  const isChapterRead = readingProgress[`${selectedBook}-${selectedChapter}`] || false;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Reading Tracker</span>
            {isChapterRead && (
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>Read</span>
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Select 
                value={selectedBook} 
                onValueChange={(value) => {
                  setSelectedBook(value);
                  setSelectedChapter(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Book" />
                </SelectTrigger>
                <SelectContent>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Old Testament</div>
                    {allBooks
                      .filter(book => book.testament === "OT")
                      .map((book) => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">New Testament</div>
                    {allBooks
                      .filter(book => book.testament === "NT")
                      .map((book) => (
                        <SelectItem key={book.id} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                  </div>
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedChapter.toString()} 
                onValueChange={(value) => setSelectedChapter(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Chapter" />
                </SelectTrigger>
                <SelectContent>
                  <div className="max-h-[200px] overflow-y-auto">
                    {chapterOptions.map((chapter) => (
                      <SelectItem key={chapter} value={chapter.toString()}>
                        Chapter {chapter}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-xl font-semibold">
              {selectedBook} {selectedChapter}
            </div>
            
            {isAuthenticated === false && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-700 dark:text-yellow-400">
                <p>Please sign in to track your reading progress and save journal entries.</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="chapter-read" 
                  checked={isChapterRead}
                  onCheckedChange={markAsRead}
                  disabled={!isAuthenticated || markingAsRead}
                />
                <Label
                  htmlFor="chapter-read"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  I have read this chapter
                  {markingAsRead && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="journal" className="text-sm font-medium">
                  Journal your thoughts, key verses, and insights:
                </Label>
                <Textarea
                  id="journal"
                  placeholder="Write your notes, reflections, or key points from this chapter..."
                  className="min-h-[200px]"
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  disabled={!isAuthenticated}
                />
                <Button 
                  onClick={saveJournal} 
                  className="mt-2 flex items-center gap-2"
                  disabled={!isAuthenticated || savingJournal}
                >
                  {savingJournal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Journal
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousChapter}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextChapter}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
