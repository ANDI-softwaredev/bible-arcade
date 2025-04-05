import { useState, useEffect } from "react";
import { ChevronDown, Book, ChevronRight, Edit, BookCheck, CheckSquare } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  getBibleBooks, 
  getBibleChapter,
  BibleBook, 
  saveReadingProgress 
} from "@/services/bible-api";
import { VerseLoading } from "./ui/verse-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BibleJournal } from "./bible-journal";
import { supabase } from "@/integrations/supabase/client";

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
  const [activeTab, setActiveTab] = useState<"read" | "journal">("read");
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);
  const [keyPoints, setKeyPoints] = useState("");
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
        console.log("Loading Bible books...");
        const allBooks = await getBibleBooks();
        console.log("Loaded books:", allBooks.length);
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
        // Check if this reading has been completed
        await checkReadingComplete();
        
        // Load key points if available
        await loadKeyPoints();
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading Bible chapter info:", error);
        toast({
          title: "Error loading chapter information",
          description: `Could not load data for ${selectedBook.name} chapter ${selectedChapter}.`,
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    loadChapter();
  }, [selectedBook, selectedChapter, toast]);
  
  const checkReadingComplete = async () => {
    if (!selectedBook) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setIsReadingCompleted(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('reading_progress')
        .select('completed')
        .eq('book', selectedBook.name)
        .eq('chapter', selectedChapter)
        .eq('user_id', session.session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking reading progress:", error);
      }
      
      setIsReadingCompleted(!!data?.completed);
    } catch (error) {
      console.error("Error checking reading progress:", error);
      setIsReadingCompleted(false);
    }
  };
  
  const loadKeyPoints = async () => {
    if (!selectedBook) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setKeyPoints("");
        return;
      }
      
      const { data } = await supabase
        .from('journal_entries')
        .select('text')
        .eq('book', selectedBook.name)
        .eq('chapter', selectedChapter)
        .eq('user_id', session.session.user.id)
        .maybeSingle();
      
      setKeyPoints(data?.text || "");
    } catch (error) {
      console.error("Error loading key points:", error);
      setKeyPoints("");
    }
  };
  
  const handleChapterSelect = (chapterNum: number) => {
    setSelectedChapter(chapterNum);
  };
  
  const saveKeyPoints = async () => {
    if (!selectedBook) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your key points",
          variant: "destructive",
        });
        return;
      }
      
      // Save to database
      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          book: selectedBook.name,
          chapter: selectedChapter,
          text: keyPoints,
          user_id: session.session.user.id
        }, { onConflict: 'user_id, book, chapter' });
      
      if (error) throw error;
      
      toast({
        title: "Key points saved",
        description: `Your notes for ${selectedBook.name} chapter ${selectedChapter} have been saved.`,
      });
    } catch (error) {
      console.error("Error saving key points:", error);
      toast({
        title: "Error saving key points",
        description: "Could not save your notes.",
        variant: "destructive",
      });
    }
  };
  
  const handleMarkComplete = async (isCompleted: boolean) => {
    if (selectedBook) {
      try {
        console.log("Marking chapter as", isCompleted ? "complete" : "incomplete");
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          toast({
            title: "Authentication required",
            description: "Please log in to track your reading progress",
            variant: "destructive",
          });
          return;
        }
        
        // Save locally
        const saved = await saveReadingProgress(selectedBook.name, selectedChapter);
        
        if (saved) {
          setIsReadingCompleted(isCompleted);
          
          toast({
            title: isCompleted ? "Reading marked as complete" : "Reading marked as incomplete",
            description: `You've ${isCompleted ? 'completed' : 'unmarked'} ${selectedBook.name} chapter ${selectedChapter}.`,
          });
          
          if (onReadComplete && isCompleted) {
            onReadComplete(selectedBook.name, selectedChapter);
          }
        } else {
          throw new Error("Failed to save reading progress");
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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Loading Bible Data</h3>
          <p className="text-muted-foreground mb-4">Please wait while we load the Bible data...</p>
        </div>
      </div>
    );
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
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Loading Chapter</h3>
                <p className="text-muted-foreground">Please wait...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {selectedBook?.name} {selectedChapter}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="readingComplete" 
                      checked={isReadingCompleted}
                      onCheckedChange={(checked) => handleMarkComplete(checked === true)}
                    />
                    <label
                      htmlFor="readingComplete"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mark as read
                    </label>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab(activeTab === "read" ? "journal" : "read")}
                  >
                    {activeTab === "read" ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Journal
                      </>
                    ) : (
                      <>
                        <Book className="h-4 w-4 mr-2" />
                        Read
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "read" | "journal")} className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="read" className="flex-1">
                    <Book className="h-4 w-4 mr-2" />
                    Read
                  </TabsTrigger>
                  <TabsTrigger value="journal" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Journal
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="read" className="mt-0">
                  <div className="flex flex-col space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Use the checkbox above to mark this chapter as read when you've completed it.
                    </p>
                    <div className="p-4 border border-border rounded-md bg-card/40">
                      <p className="text-center font-medium">
                        📖 Read {selectedBook?.name} Chapter {selectedChapter} in your Bible
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="journal" className="mt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Key Points & Notes for {selectedBook?.name} {selectedChapter}
                      </label>
                      <Textarea
                        placeholder="Enter key points and notes from your reading..."
                        className="min-h-[200px]"
                        value={keyPoints}
                        onChange={(e) => setKeyPoints(e.target.value)}
                      />
                    </div>
                    <Button onClick={saveKeyPoints}>
                      Save Notes
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
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
