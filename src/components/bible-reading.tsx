import { useState, useEffect } from "react";
import { ChevronDown, Book, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BibleReader } from "@/components/BibleReader";
import { useToast } from "@/hooks/use-toast";
import { 
  getBibleBooks, 
  getBibleChapter,
  BibleBook, 
  saveReadingProgress 
} from "@/services/bible-api";
import { VerseLoading } from "./ui/verse-loading";

interface BibleReadingProps {
  onReadComplete?: (book: string, chapter: number) => void;
}

export function BibleReading({ onReadComplete }: BibleReadingProps) {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterContent, setChapterContent] = useState<string>("");
  const [expandedBooks, setExpandedBooks] = useState<string[]>([]);
  const { toast } = useToast();
  
  const toggleBookExpansion = (bookId: string) => {
    if (expandedBooks.includes(bookId)) {
      setExpandedBooks(expandedBooks.filter(id => id !== bookId));
    } else {
      setExpandedBooks([...expandedBooks, bookId]);
    }
  };
  
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const allBooks = await getBibleBooks();
        setBooks(allBooks);
        
        if (allBooks.length > 0) {
          setSelectedBook(allBooks[0]);
        }
      } catch (error) {
        console.error("Error loading Bible books:", error);
        toast({
          title: "Error loading Bible data",
          description: "Could not load the list of books. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
  }, [toast]);
  
  useEffect(() => {
    const loadChapter = async () => {
      if (!selectedBook) return;
      
      try {
        setLoading(true);
        const chapter = await getBibleChapter(undefined, selectedBook.id, selectedChapter);
        setChapterContent(chapter.content);
      } catch (error) {
        console.error("Error loading Bible chapter:", error);
        toast({
          title: "Error loading chapter",
          description: `Could not load ${selectedBook.name} chapter ${selectedChapter}.`,
          variant: "destructive",
        });
        setChapterContent("");
      } finally {
        setLoading(false);
      }
    };
    
    loadChapter();
  }, [selectedBook, selectedChapter, toast]);
  
  const handleChapterSelect = (chapterNum: number) => {
    setSelectedChapter(chapterNum);
  };
  
  const handleMarkComplete = () => {
    if (selectedBook) {
      try {
        saveReadingProgress(selectedBook.name, selectedChapter);
        
        toast({
          title: "Reading marked as complete",
          description: `You've completed ${selectedBook.name} chapter ${selectedChapter}.`,
        });
        
        if (onReadComplete) {
          onReadComplete(selectedBook.name, selectedChapter);
        }
      } catch (error) {
        console.error("Error marking reading as complete:", error);
        toast({
          title: "Error saving progress",
          description: "Could not save your reading progress.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleBookSelect = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(1);
    }
  };
  
  const oldTestament = books.filter(book => book.testament === "OT");
  const newTestament = books.filter(book => book.testament === "NT");
  
  if (loading && books.length === 0) {
    return <VerseLoading />;
  }
  
  return (
    <div className="grid md:grid-cols-7 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="glass-card rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Select a Book</h2>
          
          <Select value={selectedBook?.id} onValueChange={handleBookSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a book" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Old Testament</SelectLabel>
                {oldTestament.map((book) => (
                  <SelectItem key={book.id} value={book.id}>{book.name}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>New Testament</SelectLabel>
                {newTestament.map((book) => (
                  <SelectItem key={book.id} value={book.id}>{book.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {selectedBook && (
          <div className="glass-card rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Select a Chapter</h2>
            <div className="grid grid-cols-4 gap-2">
              {selectedBook.chapters.map((chapter) => (
                <Button
                  key={chapter}
                  variant={chapter === selectedChapter ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChapterSelect(chapter)}
                  className="w-full"
                >
                  {chapter}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="glass-card rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Browse Bible</h2>
          
          <Collapsible 
            open={expandedBooks.includes("old-testament")}
            onOpenChange={() => toggleBookExpansion("old-testament")}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent rounded-md">
                <span className="font-medium">Old Testament</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedBooks.includes("old-testament") ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              {oldTestament.map((book) => (
                <div 
                  key={book.id}
                  className="py-1 px-2 cursor-pointer hover:bg-accent rounded-md"
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Book className="h-3 w-3" />
                    <span className={selectedBook?.id === book.id ? "font-medium text-primary" : ""}>
                      {book.name}
                    </span>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible 
            open={expandedBooks.includes("new-testament")}
            onOpenChange={() => toggleBookExpansion("new-testament")}
            className="mt-2"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent rounded-md">
                <span className="font-medium">New Testament</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedBooks.includes("new-testament") ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
              {newTestament.map((book) => (
                <div 
                  key={book.id}
                  className="py-1 px-2 cursor-pointer hover:bg-accent rounded-md"
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Book className="h-3 w-3" />
                    <span className={selectedBook?.id === book.id ? "font-medium text-primary" : ""}>
                      {book.name}
                    </span>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
      
      <div className="md:col-span-5">
        <Card className="p-6 glass-card">
          {loading ? (
            <VerseLoading />
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {selectedBook?.name} {selectedChapter}
                </h2>
                <Button onClick={handleMarkComplete}>Mark as Read</Button>
              </div>
              
              <div className="bible-reader-container prose dark:prose-invert max-w-none">
                <BibleReader 
                  initialBook={selectedBook?.name}
                  initialChapter={selectedChapter}
                />
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedChapter > 1) {
                      setSelectedChapter(selectedChapter - 1);
                    }
                  }}
                  disabled={selectedChapter <= 1}
                >
                  Previous Chapter
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedBook && selectedChapter < selectedBook.chapters.length) {
                      setSelectedChapter(selectedChapter + 1);
                    }
                  }}
                  disabled={!selectedBook || selectedChapter >= selectedBook.chapters.length}
                >
                  Next Chapter
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
