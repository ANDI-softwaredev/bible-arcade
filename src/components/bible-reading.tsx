
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
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { bibleBooks } from "@/data/bible-database";
import { getChapter, BibleChapter } from "@/data/bible-rsv";

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
  
  // Mock chapter counts (in a real app, this would come from a complete dataset)
  const mockChapterCounts: Record<string, number> = {
    "Genesis": 50,
    "Exodus": 40,
    "Matthew": 28,
    "Mark": 16,
    "Luke": 24,
    "John": 21,
    "Acts": 28,
    "Romans": 16,
    // Add more as needed
  };
  
  // Load chapter data
  useEffect(() => {
    setLoading(true);
    
    // Get chapter count for the selected book
    setChapterCount(mockChapterCounts[selectedBook] || 1);
    
    // Load chapter data
    const chapter = getChapter(selectedBook, selectedChapter);
    setChapterData(chapter);
    
    setLoading(false);
    
    // Mark as read when chapter changes (if callback provided)
    if (onReadComplete) {
      onReadComplete(selectedBook, selectedChapter);
    }
  }, [selectedBook, selectedChapter, onReadComplete]);
  
  // Navigation functions
  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      // Find previous book
      const allBooks = [...bibleBooks.oldTestament, ...bibleBooks.newTestament];
      const currentIndex = allBooks.indexOf(selectedBook);
      
      if (currentIndex > 0) {
        const prevBook = allBooks[currentIndex - 1];
        setSelectedBook(prevBook);
        // Set to last chapter of previous book (mock data)
        setSelectedChapter(mockChapterCounts[prevBook] || 1);
      }
    }
  };
  
  const goToNextChapter = () => {
    if (selectedChapter < chapterCount) {
      setSelectedChapter(selectedChapter + 1);
    } else {
      // Find next book
      const allBooks = [...bibleBooks.oldTestament, ...bibleBooks.newTestament];
      const currentIndex = allBooks.indexOf(selectedBook);
      
      if (currentIndex < allBooks.length - 1) {
        const nextBook = allBooks[currentIndex + 1];
        setSelectedBook(nextBook);
        setSelectedChapter(1);
      }
    }
  };
  
  // Generate array of chapters for the select
  const chapterOptions = Array.from({ length: chapterCount }, (_, i) => i + 1);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>RSV Bible</span>
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
                    {bibleBooks.oldTestament.map((book) => (
                      <SelectItem key={book} value={book}>{book}</SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">New Testament</div>
                    {bibleBooks.newTestament.map((book) => (
                      <SelectItem key={book} value={book}>{book}</SelectItem>
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
              In a complete application, all books and chapters would be available.
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
        )}
      </CardContent>
    </Card>
  );
}
