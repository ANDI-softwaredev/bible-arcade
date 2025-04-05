import React, { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllBibleBooks, getAllChaptersForBook, getChapter } from "@/data/bible-rsv";
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateReadingProgress } from "@/services/bible-api";
import { trackReadingActivity } from "@/services/bible-api";

interface BibleReaderAdapterProps {
  onProgressUpdate?: (book: string, chapter: number) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const BibleReaderAdapter: React.FC<BibleReaderAdapterProps> = ({ onProgressUpdate, onLoadingChange }) => {
  const [selectedBook, setSelectedBook] = useState<string>("Genesis");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterContent, setChapterContent] = useState<any>(null);
  const [completedChapters, setCompletedChapters] = useState<{ [book: string]: { [chapter: number]: boolean } }>({});
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const bibleBooks = getAllBibleBooks();
  const allChapters = getAllChaptersForBook(selectedBook);

  const loadChapter = useCallback(async (book: string, chapter: number) => {
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    try {
      const chapterData = getChapter(book, chapter);
      setChapterContent(chapterData);
    } catch (error) {
      console.error("Error loading chapter:", error);
      toast({
        title: "Error",
        description: "Could not load the selected chapter.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [onLoadingChange]);

  useEffect(() => {
    loadChapter(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter, loadChapter]);

  useEffect(() => {
    // Load completed chapters from local storage on component mount
    const storedProgress = localStorage.getItem('readingProgress');
    if (storedProgress) {
      setCompletedChapters(JSON.parse(storedProgress));
    }
  }, []);

  useEffect(() => {
    // Save completed chapters to local storage whenever it changes
    localStorage.setItem('readingProgress', JSON.stringify(completedChapters));
  }, [completedChapters]);

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter(1); // Reset chapter to 1 when book changes
  };

  const handleChapterChange = (chapter: number) => {
    setSelectedChapter(chapter);
  };

  const handleProgressUpdate = async (book: string, chapter: number) => {
    try {
      if (!book || !chapter) return;
      
      // Update reading progress
      await updateReadingProgress(book, chapter);
      
      // Track reading activity for statistics
      await trackReadingActivity(book, chapter);
      
      // Trigger the callback
      if (onProgressUpdate) {
        onProgressUpdate(book, chapter);
      }
      
      toast({
        title: "Progress Updated",
        description: `Marked ${book} chapter ${chapter} as read.`,
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Could not update your reading progress.",
        variant: "destructive",
      });
    }
  };

  const toggleChapterCompletion = (book: string, chapter: number) => {
    setCompletedChapters(prevChapters => {
      const newChapters = { ...prevChapters };
      if (!newChapters[book]) {
        newChapters[book] = {};
      }
      newChapters[book][chapter] = !newChapters[book][chapter];
      return newChapters;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Select onValueChange={handleBookChange} defaultValue={selectedBook}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Book" />
          </SelectTrigger>
          <SelectContent>
            {bibleBooks.map((book) => (
              <SelectItem key={book.id} value={book.name}>{book.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={handleChapterChange} defaultValue={selectedChapter.toString()}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Chapter" />
          </SelectTrigger>
          <SelectContent>
            {allChapters.map((chapter) => (
              <SelectItem key={chapter} value={chapter.toString()}>{chapter}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-12">
          Loading chapter...
        </div>
      ) : chapterContent ? (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">{selectedBook} {selectedChapter}</h2>
          <ScrollArea className="h-[400px] pr-4">
            {chapterContent.verses.map((verse) => (
              <div key={verse.verse} className="flex items-start gap-2 py-1">
                <span className="text-sm font-medium text-muted-foreground mt-0.5">{verse.verse}</span>
                <p className="text-sm">{verse.text}</p>
              </div>
            ))}
          </ScrollArea>
          <div className="mt-4">
            <Label htmlFor="mark-complete" className="text-sm font-medium">
              Mark as Complete
            </Label>
            <Checkbox
              id="mark-complete"
              checked={completedChapters[selectedBook]?.[selectedChapter] || false}
              onCheckedChange={() => {
                toggleChapterCompletion(selectedBook, selectedChapter);
                handleProgressUpdate(selectedBook, selectedChapter);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-6 text-center">
          <p className="text-muted-foreground">
            Select a book and chapter to start reading.
          </p>
        </div>
      )}
    </div>
  );
};

export default BibleReaderAdapter;
