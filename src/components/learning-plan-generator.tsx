import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Download, BookOpen, BookCheck, ChevronRight, Star, AlertCircle, Clock, BarChart } from "lucide-react";
import { 
  getAllReadingProgress, 
  getAllJournalEntries,
  getQuizResults,
  getStudyDuration
} from "@/services/bible-api";
import { bibleBooks } from "@/data/bible-database";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GrowingSeedAnimation } from "@/components/ui/growing-seed-animation";
import { useAuth } from "@/contexts/AuthContext";

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
    strengths: string[];
    weaknesses: string[];
    weaknessTopics: string[]; // Add a list of specific topics to focus on
    recentlyImproved: string[]; // Add topics that show recent improvement
  };
  nextMilestone: {
    description: string;
    chaptersNeeded: number;
  };
  reviewTopics: string[];
  suggestedSchedule: {
    dailyReadings: string[];
    reviewMaterials: string[];
    practiceQuizzes: string[];
  };
  studyHabits: {
    averageDuration: number; // in minutes
    frequencyPerWeek: number;
    bestPerformingTimeOfDay: string;
  };
}

export function LearningPlanGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningPlan, setLearningPlan] = useState<LearningPlanData | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  // Generate learning plan based on user data and quiz performance
  const generateLearningPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Get reading progress
      const readingProgress = await getAllReadingProgress();
      const journalEntries = await getAllJournalEntries();
      const quizResults = await getQuizResults();
      const studyDurations = await getStudyDuration();
      
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
      
      // Get recommended books based on reading patterns, weaknesses, and quiz performance
      const recommendedBooks = [];
      
      // Based on quiz performance weaknesses
      if (quizResults && quizResults.length > 0) {
        const quizWeaknesses = analyzeQuizWeaknesses(quizResults);
        quizWeaknesses.forEach(book => {
          if (!recommendedBooks.some(rec => rec.name === book)) {
            recommendedBooks.push({
              name: book,
              reason: "Based on quiz performance"
            });
          }
        });
      }
      
      // Add recommendations based on reading gaps
      weaknesses.forEach(book => {
        if (!recommendedBooks.some(rec => rec.name === book)) {
          recommendedBooks.push({
            name: book,
            reason: completedBookMap.has(book) 
              ? "Continue your progress in this book" 
              : "New book to expand your knowledge"
          });
        }
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
      
      // Analyze quiz performance
      const quizScores = analyzeQuizScores(quizResults);
      
      // Analyze study habits
      const studyHabits = analyzeStudyHabits(studyDurations);
      
      // Generate review topics
      const reviewTopics = generateReviewTopics(quizResults, readingProgress);
      
      // Create suggested schedule
      const suggestedSchedule = createSuggestedSchedule(
        recommendedBooks.map(b => b.name),
        reviewTopics, 
        quizScores.weaknesses
      );
      
      // Create learning plan
      const plan: LearningPlanData = {
        username: profile?.full_name || user?.email?.split('@')[0] || "Friend",
        strengths: strengths.length > 0 ? strengths : ["Genesis", "Psalms", "John"],
        weaknesses: weaknesses.length > 0 ? weaknesses : ["Revelation", "Ezekiel", "Leviticus"],
        recommendedBooks: recommendedBooks.slice(0, 3),
        completedChaptersCount: completedChapters,
        totalChaptersGoal: completedChapters + 30, // Set a goal of 30 more chapters
        quizScores,
        nextMilestone: {
          description: "Complete 25% of the New Testament",
          chaptersNeeded: 65 - completedChapters
        },
        reviewTopics,
        suggestedSchedule,
        studyHabits
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
  };
  
  // Analyze quiz results to identify strengths and weaknesses
  const analyzeQuizWeaknesses = (quizResults) => {
    // Group questions by book and track correct/incorrect
    const bookPerformance = {};
    
    quizResults.forEach(result => {
      if (!result.questions) return;
      
      result.questions.forEach(question => {
        if (!question.book) return;
        
        if (!bookPerformance[question.book]) {
          bookPerformance[question.book] = { correct: 0, total: 0 };
        }
        
        bookPerformance[question.book].total++;
        if (question.isCorrect) {
          bookPerformance[question.book].correct++;
        }
      });
    });
    
    // Identify books with poor performance (less than 60% correct)
    const weaknessBooks = [];
    Object.entries(bookPerformance).forEach(([book, data]: [string, any]) => {
      const percentage = (data.correct / data.total) * 100;
      if (percentage < 60 && data.total >= 3) { // Only consider books with at least 3 questions
        weaknessBooks.push(book);
      }
    });
    
    return weaknessBooks.slice(0, 3); // Return top 3 weakness books
  };
  
  // Analyze quiz scores - enhanced with performance metrics
  const analyzeQuizScores = (quizResults) => {
    if (!quizResults || quizResults.length === 0) {
      return {
        average: 75,
        lastAttempts: [75, 82, 68, 90],
        strengths: ["Old Testament History", "Psalms", "Gospels"],
        weaknesses: ["Prophets", "Epistles", "Revelation"],
        weaknessTopics: ["End Times", "Genealogies", "Levitical Law"],
        recentlyImproved: []
      };
    }
    
    // Calculate real quiz performance
    const scores = quizResults.map(result => 
      Math.round((result.score / result.totalQuestions) * 100)
    );
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Extract performance metrics if available
    let categoryPerformance = {};
    let topicPerformance = {};
    
    quizResults.forEach(result => {
      // Use performance_metrics if available
      if (result.performance_metrics) {
        if (result.performance_metrics.categories) {
          result.performance_metrics.categories.forEach(category => {
            if (!categoryPerformance[category.name]) {
              categoryPerformance[category.name] = { correct: 0, total: 0, recent: [] };
            }
            categoryPerformance[category.name].correct += category.correct;
            categoryPerformance[category.name].total += category.total;
            categoryPerformance[category.name].recent.push({
              date: result.completedAt,
              percentage: category.percentage
            });
          });
        }
        
        if (result.performance_metrics.topics) {
          result.performance_metrics.topics.forEach(topic => {
            if (!topicPerformance[topic.name]) {
              topicPerformance[topic.name] = { correct: 0, total: 0, recent: [] };
            }
            topicPerformance[topic.name].correct += topic.correct;
            topicPerformance[topic.name].total += topic.total;
            topicPerformance[topic.name].recent.push({
              date: result.completedAt,
              percentage: topic.percentage
            });
          });
        }
      } else {
        // Fall back to analyzing individual questions
        if (!result.questions) return;
        
        result.questions.forEach(question => {
          if (question.category) {
            if (!categoryPerformance[question.category]) {
              categoryPerformance[question.category] = { correct: 0, total: 0, recent: [] };
            }
            
            categoryPerformance[question.category].total++;
            if (question.isCorrect) {
              categoryPerformance[question.category].correct++;
            }
          }
          
          if (question.topic) {
            if (!topicPerformance[question.topic]) {
              topicPerformance[question.topic] = { correct: 0, total: 0, recent: [] };
            }
            
            topicPerformance[question.topic].total++;
            if (question.isCorrect) {
              topicPerformance[question.topic].correct++;
            }
          }
        });
      }
    });
    
    // Calculate percentage for each category
    const categoryScores = {};
    Object.entries(categoryPerformance).forEach(([category, data]: [string, any]) => {
      categoryScores[category] = (data.correct / data.total) * 100;
    });
    
    // Calculate percentage for each topic
    const topicScores = {};
    Object.entries(topicPerformance).forEach(([topic, data]: [string, any]) => {
      topicScores[topic] = (data.correct / data.total) * 100;
    });
    
    // Sort categories by performance
    const sortedCategories = Object.entries(categoryScores)
      .sort(([_, a], [__, b]) => (b as number) - (a as number))
      .map(([category]) => category);
    
    // Sort topics by performance
    const sortedTopics = Object.entries(topicScores)
      .sort(([_, a], [__, b]) => (a as number) - (b as number))
      .map(([topic]) => topic);
    
    // Find topics that show recent improvement
    const improvedTopics = [];
    Object.entries(topicPerformance).forEach(([topic, data]: [string, any]) => {
      if (data.recent && data.recent.length >= 2) {
        // Sort by date, oldest first
        const sorted = [...data.recent].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Check if there's improvement
        if (sorted[sorted.length - 1].percentage > sorted[0].percentage + 10) {
          improvedTopics.push(topic);
        }
      }
    });
    
    return {
      average,
      lastAttempts: scores.slice(-4), // Get the last 4 attempts
      strengths: sortedCategories.slice(0, 3),
      weaknesses: sortedCategories.reverse().slice(0, 3),
      weaknessTopics: sortedTopics.slice(0, 3),
      recentlyImproved: improvedTopics.slice(0, 3)
    };
  };
  
  // Analyze study habits
  const analyzeStudyHabits = (studyDurations) => {
    if (!studyDurations || studyDurations.length === 0) {
      return {
        averageDuration: 25,
        frequencyPerWeek: 3,
        bestPerformingTimeOfDay: "evening"
      };
    }
    
    // Calculate average duration
    const durations = studyDurations.map(session => session.duration);
    const averageDuration = Math.round(
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    );
    
    // Calculate frequency per week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const sessionsInLastWeek = studyDurations.filter(
      session => new Date(session.timestamp) >= oneWeekAgo
    );
    const frequencyPerWeek = sessionsInLastWeek.length;
    
    // Determine best performing time of day
    const timePerformance = {
      morning: { count: 0, averageScore: 0 },
      afternoon: { count: 0, averageScore: 0 },
      evening: { count: 0, averageScore: 0 },
      night: { count: 0, averageScore: 0 }
    };
    
    studyDurations.forEach(session => {
      if (!session.timestamp || !session.score) return;
      
      const hour = new Date(session.timestamp).getHours();
      let timeOfDay;
      
      if (hour >= 5 && hour < 12) timeOfDay = "morning";
      else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
      else if (hour >= 17 && hour < 21) timeOfDay = "evening";
      else timeOfDay = "night";
      
      timePerformance[timeOfDay].count++;
      timePerformance[timeOfDay].averageScore += session.score;
    });
    
    // Calculate average score for each time of day
    Object.keys(timePerformance).forEach(time => {
      if (timePerformance[time].count > 0) {
        timePerformance[time].averageScore /= timePerformance[time].count;
      }
    });
    
    // Find best performing time of day
    let bestTime = "evening"; // default
    let bestScore = 0;
    Object.entries(timePerformance).forEach(([time, data]: [string, any]) => {
      if (data.count > 0 && data.averageScore > bestScore) {
        bestScore = data.averageScore;
        bestTime = time;
      }
    });
    
    return {
      averageDuration,
      frequencyPerWeek,
      bestPerformingTimeOfDay: bestTime
    };
  };
  
  // Generate review topics
  const generateReviewTopics = (quizResults, readingProgress) => {
    // Default topics if no data is available
    const defaultTopics = [
      "The Ten Commandments",
      "The Beatitudes",
      "Creation Story",
      "The Parables of Jesus",
      "The Crucifixion Narrative"
    ];
    
    if (!quizResults || quizResults.length === 0) return defaultTopics;
    
    // Find topics from incorrect answers
    const incorrectTopics = new Set();
    quizResults.forEach(result => {
      if (!result.questions) return;
      
      result.questions.forEach(question => {
        if (!question.isCorrect && question.topic) {
          incorrectTopics.add(question.topic);
        }
      });
    });
    
    // Combine with recently read chapters that might need review
    const recentlyRead = readingProgress
      .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
      .slice(0, 5)
      .map(item => `${item.book} ${item.chapter}`);
    
    // Combine both sources of review topics
    const reviewTopics = [...Array.from(incorrectTopics), ...recentlyRead];
    
    return reviewTopics.slice(0, 5); // Limit to 5 topics
  };
  
  // Create suggested schedule
  const createSuggestedSchedule = (recommendedBooks, reviewTopics, quizWeaknesses) => {
    // Create daily reading plan
    const dailyReadings = recommendedBooks.map(book => `${book} (next chapter)`);
    
    // Create review materials
    const reviewMaterials = reviewTopics.map(topic => 
      typeof topic === 'string' && topic.includes(' ') 
        ? `Review ${topic}` 
        : `Study guide on ${topic}`
    );
    
    // Create practice quizzes
    const practiceQuizzes = [
      "Quiz on Basic Bible Knowledge",
      ...quizWeaknesses.map(weakness => `Practice questions on ${weakness}`),
      "Interactive timeline review"
    ];
    
    return {
      dailyReadings,
      reviewMaterials,
      practiceQuizzes: practiceQuizzes.slice(0, 3)
    };
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

QUIZ PERFORMANCE
---------------
Average score: ${learningPlan.quizScores.average.toFixed(1)}%
Recent scores: ${learningPlan.quizScores.lastAttempts.join('%, ')}%
Strong categories: ${learningPlan.quizScores.strengths.join(', ')}
Needs improvement: ${learningPlan.quizScores.weaknesses.join(', ')}

STUDY HABITS
-----------
Average session duration: ${learningPlan.studyHabits.averageDuration} minutes
Weekly frequency: ${learningPlan.studyHabits.frequencyPerWeek} sessions
Best performance time: ${learningPlan.studyHabits.bestPerformingTimeOfDay}

RECOMMENDED READING
------------------
${learningPlan.recommendedBooks.map(book => `- ${book.name}: ${book.reason}`).join('\n')}

SUGGESTED REVIEW TOPICS
----------------------
${learningPlan.reviewTopics.map(topic => `- ${topic}`).join('\n')}

SUGGESTED WEEKLY SCHEDULE
-----------------------
Daily Readings:
${learningPlan.suggestedSchedule.dailyReadings.map(reading => `- ${reading}`).join('\n')}

Review Materials:
${learningPlan.suggestedSchedule.reviewMaterials.map(material => `- ${material}`).join('\n')}

Practice Quizzes:
${learningPlan.suggestedSchedule.practiceQuizzes.map(quiz => `- ${quiz}`).join('\n')}

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
6. Review previously studied material periodically
7. Study during your best performance time (${learningPlan.studyHabits.bestPerformingTimeOfDay})
8. Aim to increase weekly study sessions gradually
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
          Generate a custom study plan based on your progress, quiz performance, and study habits
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isGenerating ? (
          <GrowingSeedAnimation message="Growing your personalized plan..." />
        ) : !learningPlan ? (
          <div className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Create Your Learning Plan</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              We'll analyze your reading progress, quiz performance, and study habits to create a
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  STUDY HABITS
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-primary mr-1" />
                    <span>{learningPlan.studyHabits.averageDuration} min sessions</span>
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-primary mr-1" />
                    <span>{learningPlan.studyHabits.frequencyPerWeek}× per week</span>
                  </div>
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-primary mr-1" />
                    <span>Best time: {learningPlan.studyHabits.bestPerformingTimeOfDay}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">QUIZ PERFORMANCE</h3>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Average Score</span>
                <span className="font-medium">{learningPlan.quizScores.average.toFixed(1)}%</span>
              </div>
              <Progress 
                value={learningPlan.quizScores.average} 
                className="h-1.5 mb-3" 
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Strong Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {learningPlan.quizScores.strengths.map((category, i) => (
                      <Badge key={i} variant="outline" className="bg-green-500/10">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Needs Improvement</p>
                  <div className="flex flex-wrap gap-2">
                    {learningPlan.quizScores.weaknesses.map((category, i) => (
                      <Badge key={i} variant="outline" className="bg-orange-500/10">
                        {category}
                      </Badge>
                    ))}
                  </div>
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
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart className="h-4 w-4 text-primary" />
                SUGGESTED WEEKLY PLAN
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium mb-1">Daily Readings:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {learningPlan.suggestedSchedule.dailyReadings.map((reading, i) => (
                      <li key={i}>{reading}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium mb-1 mt-3">Review Topics:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {learningPlan.reviewTopics.slice(0, 3).map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium mb-1 mt-3">Practice Quizzes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {learningPlan.suggestedSchedule.practiceQuizzes.map((quiz, i) => (
                      <li key={i}>{quiz}</li>
                    ))}
                  </ul>
                </div>
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
