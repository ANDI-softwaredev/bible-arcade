
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { BibleReading } from "@/components/bible-reading";
import { BibleQuiz } from "@/components/bible-quiz";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, BookText, Edit, BookCheck, CheckSquare } from "lucide-react";
import { getCurrentWeekProgress, loadQuizAttempts, updateReadingProgress } from "@/data/bible-database";
import { saveReadingProgress } from "@/services/bible-api";
import { supabase } from "@/integrations/supabase/client";

const BibleStudy = () => {
  const [activeTab, setActiveTab] = useState("read");
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [completedChapters, setCompletedChapters] = useState(0);
  const [totalJournals, setTotalJournals] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load quiz attempts from storage and fetch reading progress
  useEffect(() => {
    loadQuizAttempts();
    updateProgress();
    fetchReadingStats();
  }, []);
  
  const updateProgress = () => {
    const progress = getCurrentWeekProgress();
    setWeeklyProgress(progress);
  };
  
  const fetchReadingStats = async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setIsLoading(false);
        return;
      }
      
      // Get reading progress count
      const { count: readingCount, error: readingError } = await supabase
        .from('reading_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('completed', true);
      
      if (readingError) {
        console.error("Error fetching reading count:", readingError);
        setIsLoading(false);
        return;
      }
      
      // Get journal entries count
      const { count: journalCount, error: journalError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id);
      
      if (journalError) {
        console.error("Error fetching journal count:", journalError);
        setIsLoading(false);
        return;
      }
      
      setCompletedChapters(readingCount || 0);
      setTotalJournals(journalCount || 0);
    } catch (error) {
      console.error("Error fetching reading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle quiz completion
  const handleQuizComplete = (score: number, totalPossible: number, percentageScore: number) => {
    // Update the weekly progress
    updateProgress();
  };
  
  // Handle reading completion
  const handleReadingComplete = (book: string, chapter: number) => {
    // Track reading progress
    try {
      // Update local database
      saveReadingProgress(book, chapter);
      updateProgress();
      fetchReadingStats();
    } catch (error) {
      console.error("Error in handleReadingComplete:", error);
    }
  };
  
  return (
    <Layout>
      <div className="pt-8 sm:pt-12">
        <header className="mb-8 sm:mb-12">
          <div className="pill mb-3 inline-block">Bible Study</div>
          <h1 className="text-3xl font-bold">Study the Word</h1>
          <p className="text-muted-foreground mt-2">
            Read the Bible, journal your thoughts, and test your knowledge with interactive quizzes
          </p>
        </header>
        
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Progress</h2>
            <div className="pill">{weeklyProgress}% Complete</div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Bible Study Progress</span>
                <span className="font-medium">{weeklyProgress}%</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card/40 p-4 rounded-lg flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-coral/20 flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-coral" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chapters Read</p>
                  <p className="text-2xl font-bold">{completedChapters}</p>
                </div>
              </div>
              
              <div className="bg-card/40 p-4 rounded-lg flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-teal/20 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-teal" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Journal Entries</p>
                  <p className="text-2xl font-bold">{totalJournals}</p>
                </div>
              </div>
              
              <div className="bg-card/40 p-4 rounded-lg flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <BookText className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                  <p className="text-2xl font-bold">{getCurrentWeekProgress() < 10 ? 0 : Math.floor(getCurrentWeekProgress() / 10)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="read" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Bible Reading</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              <span>Quiz Assessment</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="read" className="space-y-4">
            <BibleReading onReadComplete={handleReadingComplete} />
          </TabsContent>
          
          <TabsContent value="quiz">
            <BibleQuiz onComplete={handleQuizComplete} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BibleStudy;
