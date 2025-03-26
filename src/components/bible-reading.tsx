
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
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Clock } from "lucide-react";
import { bibleBooks } from "@/data/bible-database";
import { 
  getAllBooks, 
  getChapterFromAPI,
  saveReadingProgress,
  getAllReadingProgress,
  BibleAPIBook
} from "@/services/bible-api";
import { BibleChapter } from "@/data/bible-rsv";
import { useToast } from "@/hooks/use-toast";

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
  const [chapterData, setChapterData] = useState<BibleChapter | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [chapterCount, setChapterCount] = useState(1);
  const [allBooks, setAllBooks] = useState<BibleAPIBook[]>([]);
  const [readingProgress, setReadingProgress] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
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
      }
    };
    
    loadBooks();
    
    // Load reading progress
    const progress = getAllReadingProgress();
    const progressMap: Record<string, boolean> = {};
    
    progress.forEach(p => {
      progressMap[`${p.book}-${p.chapter}`] = p.completed;
    });
    
    setReadingProgress(progressMap);
  }, []);
  
  // Load chapter data when book or chapter changes
  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      
      try {
        // Find book ID from the name
        const book = allBooks.find(b => b.name === selectedBook);
        
        if (book) {
          // Set chapter count for the selected book
          setChapterCount(book.chapters);
          
          // Load chapter data
          const chapterData = await getChapterFromAPI(book.id, selectedChapter);
          setChapterData(chapterData);
        } else {
          // Fallback to local data if book not found
          const { getChapter } = require("@/data/bible-rsv");
          setChapterData(getChapter(selectedBook, selectedChapter));
          
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
      } catch (error) {
        console.error("Error loading chapter:", error);
        setChapterData(undefined);
      } finally {
        setLoading(false);
      }
      
      // Mark as read when chapter changes (if callback provided)
      if (onReadComplete) {
        onReadComplete(selectedBook, selectedChapter);
      }
    };
    
    if (allBooks.length > 0 || selectedBook) {
      loadChapter();
    }
  }, [selectedBook, selectedChapter, allBooks, onReadComplete]);
  
  // Mark chapter as read
  const markAsRead = () => {
    saveReadingProgress(selectedBook, selectedChapter);
    
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
            <span>RSV Bible</span>
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
        ) : !chapterData ? (
          <div className="py-8 text-center">
            <p>This chapter is not available in the sample data.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try selecting a different book or chapter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xl font-semibold">
              {selectedBook} {selectedChapter}
            </div>
            
            <div className="space-y-2 text-base leading-7">
              {chapterData.verses.map((verse) => (
                <div key={verse.verse} className="flex">
                  <span className="text-sm font-semibold text-primary mr-2 min-w-[20px]">
                    {verse.verse}
                  </span>
                  <span>{verse.text}</span>
                </div>
              ))}
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
              
              <Button
                variant={isChapterRead ? "outline" : "default"}
                size="sm"
                onClick={markAsRead}
                className="flex items-center gap-1"
                disabled={isChapterRead}
              >
                {isChapterRead ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Mark as Read</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
