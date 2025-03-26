
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { BibleReading } from "@/components/bible-reading";
import { BibleQuiz } from "@/components/bible-quiz";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, BookText } from "lucide-react";
import { getCurrentWeekProgress, loadQuizAttempts, updateReadingProgress } from "@/data/bible-database";
import { saveReadingProgress } from "@/services/bible-api";

const BibleStudy = () => {
  const [activeTab, setActiveTab] = useState("read");
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  
  // Load quiz attempts from storage
  useEffect(() => {
    loadQuizAttempts();
    updateProgress();
  }, []);
  
  const updateProgress = () => {
    const progress = getCurrentWeekProgress();
    setWeeklyProgress(progress);
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
      // We'll handle direct updates here to avoid using require in saveReadingProgress
      saveReadingProgress(book, chapter);
      updateProgress();
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
            Read the Bible and test your knowledge with interactive quizzes
          </p>
        </header>
        
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Weekly Progress</h2>
            <div className="pill">{weeklyProgress}% Complete</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Bible Study Progress</span>
              <span className="font-medium">{weeklyProgress}%</span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
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
