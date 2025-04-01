
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, BookOpen, Save, CheckCircle } from "lucide-react";
import { getChapter, rsvBibleSample, BibleVerse } from "@/data/bible-rsv";
import { saveReadingProgress } from "@/services/bible-api";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BibleReaderProps {
  initialBook?: string;
  initialChapter?: number;
  onProgressUpdate?: () => void;
}

export function BibleReader({ 
  initialBook = "John", 
  initialChapter = 1,
  onProgressUpdate
}: BibleReaderProps) {
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [maxChapters, setMaxChapters] = useState(1);
  const [isChapterRead, setIsChapterRead] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Determine available books from the RSV Bible data
  const availableBooks = Object.keys(rsvBibleSample);
  
  useEffect(() => {
    // Load chapter content
    const chapter = getChapter(selectedBook, selectedChapter);
    
    if (chapter) {
      setChapterVerses(chapter.verses);
      
      // Check if this chapter has been read by the current user
      const checkIfRead = async () => {
        try {
          // Get reading progress from the API
          const allProgress = await getAllReadingProgress();
          const isRead = allProgress.some(
            p => p.book === selectedBook && p.chapter === selectedChapter && p.completed
          );
          setIsChapterRead(isRead);
        } catch (error) {
          console.error("Error checking read status:", error);
          setIsChapterRead(false);
        }
      };
      
      checkIfRead();
    } else {
      setChapterVerses([]);
    }
    
    // Update max chapters for the selected book
    const bookChapters = rsvBibleSample[selectedBook] || {};
    setMaxChapters(Object.keys(bookChapters).length);
  }, [selectedBook, selectedChapter]);
  
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
      await saveReadingProgress(selectedBook, selectedChapter);
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
  
  // Imported functions from bible-api.ts (simplified here for direct access)
  const getAllReadingProgress = async () => {
    try {
      // This is a simplified version - in reality, it would call the API function
      const progressStr = localStorage.getItem("bible-reading-progress");
      return progressStr ? JSON.parse(progressStr) : [];
    } catch (error) {
      console.error("Error getting reading progress:", error);
      return [];
    }
  };
  
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
          <div className="text-xl font-semibold">
            {selectedBook} {selectedChapter}
          </div>
          
          <div className="space-y-4">
            {chapterVerses.length > 0 ? (
              chapterVerses.map((verse) => (
                <div key={verse.verse} className="group">
                  <span className="text-sm font-semibold text-primary mr-2">{verse.verse}</span>
                  <span>{verse.text}</span>
                </div>
              ))
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
              <Save className="h-4 w-4" />
              {isChapterRead ? "Already Read" : "Mark as Read"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
