
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Save, 
  CheckCircle, 
  FileText,
  AlertTriangle
} from "lucide-react";
import { getChapter, rsvBibleSample, BibleVerse } from "@/data/bible-rsv";
import { saveReadingProgress, getAllReadingProgress } from "@/services/bible-api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface BibleReaderProps {
  initialBook?: string;
  initialChapter?: number;
  onProgressUpdate?: (book?: string, chapter?: number) => void;
  onLoading?: (isLoading: boolean) => void; 
}

export function BibleReader({ 
  initialBook = "John", 
  initialChapter = 1,
  onProgressUpdate,
  onLoading
}: BibleReaderProps) {
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [maxChapters, setMaxChapters] = useState(1);
  const [isChapterRead, setIsChapterRead] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Determine available books from the RSV Bible data
  const availableBooks = Object.keys(rsvBibleSample);
  
  // Notify parent component about loading state
  useEffect(() => {
    if (onLoading) {
      onLoading(true);
    }
    return () => {
      if (onLoading) {
        onLoading(false);
      }
    };
  }, [onLoading]);
  
  // Get the journal entry for the current chapter
  const fetchJournalEntry = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('text')
        .eq('user_id', session.session.user.id)
        .eq('book', selectedBook)
        .eq('chapter', selectedChapter)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setJournalEntry(data.text);
      } else {
        setJournalEntry('');
      }
    } catch (error) {
      console.error("Error fetching journal entry:", error);
    }
  };
  
  useEffect(() => {
    // Notify parent component about loading state
    if (onLoading) onLoading(true);
    
    setLoadingError(null);
    
    try {
      // Load chapter content
      const chapter = getChapter(selectedBook, selectedChapter);
      
      if (chapter) {
        setChapterVerses(chapter.verses);
        
        // Check if this chapter has been read by the current user
        const checkIfRead = async () => {
          try {
            const { data: session } = await supabase.auth.getSession();
            if (!session?.session?.user) {
              if (onLoading) onLoading(false);
              return;
            }
            
            const { data, error } = await supabase
              .from('reading_progress')
              .select('*')
              .eq('user_id', session.session.user.id)
              .eq('book', selectedBook)
              .eq('chapter', selectedChapter)
              .eq('completed', true)
              .maybeSingle();
            
            if (error) throw error;
            
            setIsChapterRead(!!data);
            
            // Fetch journal entry
            await fetchJournalEntry();
            
            // Loading complete
            if (onLoading) onLoading(false);
          } catch (error) {
            console.error("Error checking read status:", error);
            setIsChapterRead(false);
            
            // Loading complete even on error
            if (onLoading) onLoading(false);
          }
        };
        
        checkIfRead();
      } else {
        setChapterVerses([]);
        setLoadingError("Chapter not found in the available data.");
        
        // Loading complete when no chapter is found
        if (onLoading) onLoading(false);
      }
      
      // Update max chapters for the selected book
      const bookChapters = rsvBibleSample[selectedBook] || {};
      setMaxChapters(Object.keys(bookChapters).length || 1);
      
      // Notify parent about progress update
      if (onProgressUpdate) {
        onProgressUpdate(selectedBook, selectedChapter);
      }
    } catch (error) {
      console.error("Error loading Bible chapter:", error);
      setLoadingError("Error loading Bible data. Please try again.");
      if (onLoading) onLoading(false);
    }
  }, [selectedBook, selectedChapter, onLoading, onProgressUpdate]);
  
  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      // Go to previous book, last chapter
      const bookIndex = availableBooks.indexOf(selectedBook);
      if (bookIndex > 0) {
        const prevBook = availableBooks[bookIndex - 1];
        const prevBookChapters = rsvBibleSample[prevBook] || {};
        const lastChapter = Math.max(...Object.keys(prevBookChapters).map(Number));
        setSelectedBook(prevBook);
        setSelectedChapter(lastChapter || 1);
      }
    }
  };
  
  const handleNextChapter = () => {
    const bookChapters = rsvBibleSample[selectedBook] || {};
    const chaptersInBook = Object.keys(bookChapters).length;
    
    if (selectedChapter < chaptersInBook) {
      setSelectedChapter(selectedChapter + 1);
    } else {
      // Go to next book, first chapter
      const bookIndex = availableBooks.indexOf(selectedBook);
      if (bookIndex < availableBooks.length - 1) {
        const nextBook = availableBooks[bookIndex + 1];
        setSelectedBook(nextBook);
        setSelectedChapter(1);
      }
    }
  };
  
  const markAsRead = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your progress",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: session.session.user.id,
          book: selectedBook,
          chapter: selectedChapter,
          completed: true,
          last_read: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setIsChapterRead(true);
      toast({
        title: "Progress Saved",
        description: `${selectedBook} chapter ${selectedChapter} marked as read.`
      });
      
      // Call the onProgressUpdate callback if provided
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error("Error marking chapter as read:", error);
      toast({
        title: "Error",
        description: "Failed to save reading progress.",
        variant: "destructive"
      });
    }
  };
  
  const saveJournal = async () => {
    if (!journalEntry.trim()) {
      toast({
        title: "Empty Journal",
        description: "Please write something before saving.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSavingJournal(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your journal",
          variant: "destructive"
        });
        setIsSavingJournal(false);
        return;
      }
      
      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: session.session.user.id,
          book: selectedBook,
          chapter: selectedChapter,
          text: journalEntry,
          last_updated: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Journal Saved",
        description: "Your journal entry has been saved."
      });
    } catch (error) {
      console.error("Error saving journal:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive"
      });
    } finally {
      setIsSavingJournal(false);
    }
  };
  
  if (loadingError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Error Loading Bible Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-destructive mb-4">{loadingError}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Bible Reader (RSV)</span>
          {isChapterRead && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Read</span>
            </Badge>
          )}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Select value={selectedBook} onValueChange={(value) => {
            setSelectedBook(value);
            setSelectedChapter(1);
          }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Book" />
            </SelectTrigger>
            <SelectContent>
              {availableBooks.map((book) => (
                <SelectItem key={book} value={book}>
                  {book}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={String(selectedChapter)} onValueChange={(value) => {
            setSelectedChapter(parseInt(value));
          }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Chapter" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxChapters }, (_, i) => i + 1).map((chapter) => (
                <SelectItem key={chapter} value={String(chapter)}>
                  Chapter {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Checkbox 
              id="chapter-read" 
              checked={isChapterRead} 
              onCheckedChange={() => {
                if (!isChapterRead) {
                  markAsRead();
                }
              }}
            />
            <label htmlFor="chapter-read" className="text-xl font-semibold cursor-pointer">
              {selectedBook} {selectedChapter}
            </label>
          </div>
          
          <div className="space-y-4">
            {chapterVerses.length > 0 ? (
              <div>
                <div className="border p-4 rounded-md bg-card/80 max-h-[300px] overflow-y-auto mb-4">
                  {chapterVerses.map((verse) => (
                    <div key={verse.verse} className="group mb-2">
                      <span className="text-sm font-semibold text-primary mr-2">{verse.verse}</span>
                      <span>{verse.text}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Journal Notes</h3>
                    </div>
                    <Textarea
                      placeholder="Write your thoughts and insights about this chapter..."
                      className="min-h-[150px]"
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={saveJournal}
                      disabled={isSavingJournal}
                      className="bg-teal hover:bg-teal-dark"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSavingJournal ? 'Saving...' : 'Save Notes'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No verses available for this chapter.
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreviousChapter}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNextChapter} 
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={markAsRead}
              disabled={isChapterRead}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              {isChapterRead ? "Already Read" : "Mark as Read"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
