
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BibleBook, BibleChapter, getAllBooks, getBibleChapter, saveReadingProgress, saveChapterJournal, trackReadingActivity } from '@/services/bible-api';
import { toast } from '@/hooks/use-toast';

interface BibleReaderAdapterProps {
  onProgressUpdate?: (book?: string, chapter?: number) => void;
  onLoadingChange?: (loading: boolean) => void;
}

// This component is a wrapper that adapts the BibleReader component to work with Supabase
const BibleReaderAdapter: React.FC<BibleReaderAdapterProps> = ({ 
  onProgressUpdate,
  onLoadingChange
}) => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [activeBook, setActiveBook] = useState<BibleBook | null>(null);
  const [activeChapter, setActiveChapter] = useState<BibleChapter | null>(null);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [notes, setNotes] = useState('');
  const [completedChapters, setCompletedChapters] = useState<{book: string, chapter: number}[]>([]);
  const { user } = useAuth();

  // Load all books on mount
  useEffect(() => {
    loadBooks();
    fetchCompletedChapters();
  }, []);

  // When active book changes, reset chapter number to 1
  useEffect(() => {
    if (activeBook) {
      setChapterNumber(1);
      loadChapter(activeBook.id, 1);
    }
  }, [activeBook]);

  // When chapter number changes, load the new chapter
  useEffect(() => {
    if (activeBook && chapterNumber) {
      loadChapter(activeBook.id, chapterNumber);
    }
  }, [chapterNumber]);

  // Update loading state
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const booksData = await getAllBooks();
      setBooks(booksData);
      
      // Set the first book as active by default
      if (booksData.length > 0 && !activeBook) {
        setActiveBook(booksData[0]);
      }
    } catch (error) {
      console.error("Error loading books:", error);
      toast({
        title: "Error loading books",
        description: "Could not load the Bible books. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChapter = async (bookId: string, chapter: number) => {
    setLoading(true);
    try {
      const chapterData = await getBibleChapter('KJV', bookId, chapter);
      setActiveChapter(chapterData);
      
      // Load notes for this chapter
      if (activeBook) {
        loadNotes(activeBook.name, chapter);
      }
      
      // Update parent component if needed
      if (onProgressUpdate && activeBook) {
        onProgressUpdate(activeBook.name, chapter);
      }
    } catch (error) {
      console.error("Error loading chapter:", error);
      toast({
        title: "Error loading chapter",
        description: "Could not load the chapter. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (book: string, chapter: number) => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('text')
        .eq('user_id', user.id)
        .eq('book', book)
        .eq('chapter', chapter)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error loading notes:", error);
        return;
      }
      
      setNotes(data?.text || '');
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const handleSaveNotes = async () => {
    try {
      if (!activeBook || !chapterNumber || !user) return;
      
      const { data: existing, error: fetchError } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('book', activeBook.name)
        .eq('chapter', chapterNumber)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let saveError;
      
      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            text: notes,
            last_updated: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        saveError = error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            book: activeBook.name,
            chapter: chapterNumber,
            text: notes,
            last_updated: new Date().toISOString()
          });
        
        saveError = error;
      }
      
      if (saveError) {
        throw saveError;
      }
      
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      });
      
      // Also track reading activity
      await trackReadingActivity(activeBook.name, chapterNumber);
      
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error saving notes",
        description: "Could not save your notes. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleMarkCompleted = async () => {
    try {
      if (!activeBook || !chapterNumber || !user) return;
      
      // Save the reading progress
      const { error } = await supabase
        .from('reading_progress')
        .insert({
          user_id: user.id,
          book: activeBook.name,
          chapter: chapterNumber,
          completed: true,
          last_read: new Date().toISOString()
        });
      
      if (error) {
        // If it already exists, we'll just update it
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('reading_progress')
            .update({
              completed: true,
              last_read: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('book', activeBook.name)
            .eq('chapter', chapterNumber);
            
          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }
      
      // Also track this reading activity
      await trackReadingActivity(activeBook.name, chapterNumber);
      
      toast({
        title: "Chapter marked as completed",
        description: `${activeBook.name} ${chapterNumber} has been marked as read.`,
      });
      
      // Update local state
      setCompletedChapters([...completedChapters, {
        book: activeBook.name,
        chapter: chapterNumber
      }]);
      
      // Update parent component if needed
      if (onProgressUpdate) {
        onProgressUpdate(activeBook.name, chapterNumber);
      }
      
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast({
        title: "Error updating progress",
        description: "Could not mark the chapter as read. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchCompletedChapters = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('reading_progress')
        .select('book, chapter')
        .eq('user_id', user.id)
        .eq('completed', true);
        
      if (error) throw error;
      
      setCompletedChapters(data || []);
    } catch (error) {
      console.error("Error fetching completed chapters:", error);
    }
  };

  const isChapterCompleted = (book: string, chapter: number): boolean => {
    return completedChapters.some(item => 
      item.book === book && item.chapter === chapter
    );
  };

  // Define what we're rendering based on the component's state
  if (loading) {
    return <div>Loading Bible data...</div>;
  }

  return (
    <div className="bible-reader">
      {/* Implement your Bible reader UI here using the state and functions above */}
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Book</label>
            <select
              className="w-full p-2 border rounded bg-card"
              value={activeBook?.id || ''}
              onChange={(e) => {
                const selectedBook = books.find(book => book.id === e.target.value);
                if (selectedBook) setActiveBook(selectedBook);
              }}
            >
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Select Chapter</label>
            <select
              className="w-full p-2 border rounded bg-card"
              value={chapterNumber}
              onChange={(e) => setChapterNumber(parseInt(e.target.value))}
            >
              {activeBook?.chapters.map(chapter => (
                <option key={chapter} value={chapter}>
                  Chapter {chapter}
                  {isChapterCompleted(activeBook.name, chapter) ? ' (Read)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {activeChapter && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {activeBook?.name} {chapterNumber}
              </h2>
              
              <button
                onClick={handleMarkCompleted}
                className={`px-4 py-2 rounded-md flex items-center ${
                  isChapterCompleted(activeBook?.name || '', chapterNumber)
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-primary/90 text-primary-foreground hover:bg-primary/80'
                }`}
                disabled={isChapterCompleted(activeBook?.name || '', chapterNumber)}
              >
                {isChapterCompleted(activeBook?.name || '', chapterNumber)
                  ? 'Completed ✓'
                  : 'Mark as Read'}
              </button>
            </div>
            
            <div className="bible-content prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: activeChapter.content }} />
            </div>
          </div>
        )}
        
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Your Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[150px] p-3 border rounded bg-card"
            placeholder="Write your thoughts and reflections about this chapter..."
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleReaderAdapter;
