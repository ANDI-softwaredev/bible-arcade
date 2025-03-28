
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Download, BookOpen, BookCheck, ChevronRight, Star, AlertCircle } from "lucide-react";
import { getAllReadingProgress, getAllJournalEntries } from "@/services/bible-api";
import { bibleBooks } from "@/data/bible-database";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface LearningPlanData {
  username: string;
  strengths: string[];
  weaknesses: string[];
  recommendedBooks: {
    name: string;
    reason: string;
  }[];
  completedChaptersCount: number;
  totalChaptersGoal: number;
  quizScores: {
    average: number;
    lastAttempts: number[];
  };
  nextMilestone: {
    description: string;
    chaptersNeeded: number;
  };
}

export function LearningPlanGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningPlan, setLearningPlan] = useState<LearningPlanData | null>(null);
  const { toast } = useToast();
  
  // Generate learning plan based on user data and quiz performance
  const generateLearningPlan = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        // Get reading progress
        const readingProgress = getAllReadingProgress();
        const journalEntries = getAllJournalEntries();
        
        // Get completed books and chapters
        const completedBookMap = new Map();
        readingProgress.forEach(item => {
          if (!completedBookMap.has(item.book)) {
            completedBookMap.set(item.book, []);
          }
          completedBookMap.get(item.book).push(item.chapter);
        });
        
        // Calculate strengths (books with most completed chapters)
        const strengths: string[] = Array.from(completedBookMap.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 3)
          .map(([book]) => book);
        
        // Calculate weaknesses (books that haven't been started or have few completed chapters)
        const allBooks = [...bibleBooks.oldTestament, ...bibleBooks.newTestament];
        const weaknesses: string[] = allBooks
          .filter(book => !completedBookMap.has(book) || completedBookMap.get(book).length < 2)
          .slice(0, 3);
        
        // Get recommended books based on reading patterns and weaknesses
        const recommendedBooks = weaknesses.map(book => {
          return {
            name: book,
            reason: completedBookMap.has(book) 
              ? "Continue your progress in this book" 
              : "New book to expand your knowledge"
          };
        });
        
        // If user has journal entries, recommend related books
        if (journalEntries.length > 0) {
          const journaledBook = journalEntries[0].book;
          if (!recommendedBooks.some(rec => rec.name === journaledBook)) {
            recommendedBooks.push({
              name: journaledBook,
              reason: "Based on your journal reflections"
            });
          }
        }
        
        // Calculate total completed chapters
        const completedChapters = readingProgress.length;
        
        // Generate mock quiz scores (in a real app, would pull from actual quiz history)
        const mockScores = [75, 82, 68, 90];
        
        // Create learning plan
        const plan: LearningPlanData = {
          username: "Samuel", // This should be dynamic based on the user
          strengths: strengths.length > 0 ? strengths : ["Genesis", "Psalms", "John"],
          weaknesses: weaknesses.length > 0 ? weaknesses : ["Revelation", "Ezekiel", "Leviticus"],
          recommendedBooks: recommendedBooks.slice(0, 3),
          completedChaptersCount: completedChapters,
          totalChaptersGoal: completedChapters + 30, // Set a goal of 30 more chapters
          quizScores: {
            average: mockScores.reduce((sum, score) => sum + score, 0) / mockScores.length,
            lastAttempts: mockScores
          },
          nextMilestone: {
            description: "Complete 25% of the New Testament",
            chaptersNeeded: 65 - completedChapters
          }
        };
        
        setLearningPlan(plan);
        toast({
          title: "Learning Plan Generated",
          description: "Your personalized learning plan is ready!"
        });
      } catch (error) {
        console.error("Error generating learning plan:", error);
        toast({
          title: "Error",
          description: "Failed to generate your learning plan. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };
  
  // Create a downloadable text version of the learning plan
  const downloadLearningPlan = () => {
    if (!learningPlan) return;
    
    const content = `
BIBLICO PERSONALIZED LEARNING PLAN
==================================
Created for: ${learningPlan.username}
Date: ${new Date().toLocaleDateString()}

PROGRESS SUMMARY
---------------
Chapters completed: ${learningPlan.completedChaptersCount}
Goal: ${learningPlan.totalChaptersGoal} chapters
Progress: ${Math.round((learningPlan.completedChaptersCount / learningPlan.totalChaptersGoal) * 100)}%

STRENGTHS
---------
${learningPlan.strengths.map(strength => `- ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT
--------------------
${learningPlan.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

RECOMMENDED READING
------------------
${learningPlan.recommendedBooks.map(book => `- ${book.name}: ${book.reason}`).join('\n')}

QUIZ PERFORMANCE
---------------
Average score: ${learningPlan.quizScores.average.toFixed(1)}%
Recent scores: ${learningPlan.quizScores.lastAttempts.join('%, ')}%

NEXT MILESTONE
-------------
${learningPlan.nextMilestone.description}
Chapters needed to reach milestone: ${learningPlan.nextMilestone.chaptersNeeded}

IMPROVEMENT STRATEGIES
--------------------
1. Schedule daily reading time for the recommended books
2. Take quizzes on chapters immediately after reading them
3. Join a study group for accountability
4. Use the journal feature to reflect on what you've learned
5. Focus on understanding rather than completion
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biblico-learning-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Learning Plan Downloaded",
      description: "Your plan has been saved as a text file."
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Personalized Learning Plan
        </CardTitle>
        <CardDescription>
          Generate a custom study plan based on your progress and quiz performance
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!learningPlan ? (
          <div className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Create Your Learning Plan</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              We'll analyze your reading progress and quiz performance to create a
              personalized study plan to help you grow in your biblical knowledge.
            </p>
            <Button 
              onClick={generateLearningPlan} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? "Generating..." : "Generate Learning Plan"}
              {!isGenerating && <Sparkles className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">PROGRESS OVERVIEW</h3>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span>{learningPlan.completedChaptersCount} chapters completed</span>
                <span className="text-muted-foreground">Goal: {learningPlan.totalChaptersGoal}</span>
              </div>
              <Progress 
                value={(learningPlan.completedChaptersCount / learningPlan.totalChaptersGoal) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  STRENGTHS
                </h3>
                <div className="space-y-1">
                  {learningPlan.strengths.map((item, i) => (
                    <div key={i} className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-1" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  FOCUS AREAS
                </h3>
                <div className="space-y-1">
                  {learningPlan.weaknesses.map((item, i) => (
                    <div key={i} className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-1" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">RECOMMENDED READING</h3>
              <div className="space-y-2">
                {learningPlan.recommendedBooks.map((book, i) => (
                  <div key={i} className="flex items-start">
                    <BookCheck className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium">{book.name}</div>
                      <div className="text-sm text-muted-foreground">{book.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="py-2">
              <Button onClick={downloadLearningPlan} className="w-full flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download Complete Learning Plan
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
