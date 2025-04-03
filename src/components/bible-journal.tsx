
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Clock, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BibleJournalProps {
  book: string;
  chapter: number;
}

export function BibleJournal({ book, chapter }: BibleJournalProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadJournal = async () => {
      if (!book || !chapter) return;
      
      try {
        setLoading(true);
        
        // Check for existing journal entry
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          toast({
            title: "Authentication required",
            description: "Please log in to access your journal",
            variant: "destructive"
          });
          return;
        }
        
        // Use journal_entries instead of journals for TypeScript compatibility
        const { data, error } = await supabase
          .from("journal_entries")
          .select("text, last_updated")
          .eq("book", book)
          .eq("chapter", chapter)
          .eq("user_id", session.session.user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setNotes(data.text || "");
          setLastSaved(new Date(data.last_updated).toLocaleString());
        } else {
          setNotes("");
          setLastSaved(null);
        }
      } catch (error) {
        console.error("Error loading journal:", error);
        toast({
          title: "Error loading journal",
          description: "Could not load your journal entry.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadJournal();
  }, [book, chapter, toast]);
  
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your journal",
          variant: "destructive"
        });
        return;
      }
      
      // Check if journal entry already exists
      const { data: existingEntry } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("user_id", session.session.user.id)
        .maybeSingle();
      
      let result;
      
      if (existingEntry) {
        // Update existing journal entry
        result = await supabase
          .from("journal_entries")
          .update({
            text: notes,
            last_updated: new Date().toISOString()
          })
          .eq("id", existingEntry.id);
      } else {
        // Create new journal entry
        result = await supabase
          .from("journal_entries")
          .insert({
            book,
            chapter,
            text: notes,
            user_id: session.session.user.id
          });
      }
      
      if (result.error) throw result.error;
      
      setLastSaved(new Date().toLocaleString());
      
      toast({
        title: "Journal saved",
        description: `Your thoughts on ${book} ${chapter} have been saved.`
      });
    } catch (error) {
      console.error("Error saving journal:", error);
      toast({
        title: "Error saving journal",
        description: "Could not save your journal entry.",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Journal: {book} {chapter}</span>
          {lastSaved && (
            <div className="text-sm font-normal text-muted-foreground flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Last saved: {lastSaved}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your thoughts, insights, and reflections on this chapter..."
              className="min-h-[200px] mb-4"
            />
            
            <Button 
              onClick={handleSave} 
              disabled={saveLoading}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Journal Entry
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
