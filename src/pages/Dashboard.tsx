
import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, BookMarked, BarChart2, CheckSquare, Award } from "lucide-react";
import { Layout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressCard } from "@/components/ui/progress-card";
import { StudyCard } from "@/components/ui/study-card";
import { ProgressChart } from "@/components/progress-chart";
import { LearningPlanGenerator } from "@/components/learning-plan-generator";
import { UserRewards } from "@/components/user-rewards";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  calculateOverallProgress, 
  calculateTestamentProgress,
  getCompletedBooks,
  getStudyStreak,
  getChaptersReadCount,
  getWeeklyReadingData,
  getWeeklyReadingTime
} from "@/services/bible-api";
import { getQuizResults, getStudyGoals, StudyGoal } from "@/services/quiz-generator";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [weeklyReading, setWeeklyReading] = useState(0);
  const [completedStudies, setCompletedStudies] = useState(0);
  const [quizzesTaken, setQuizzesTaken] = useState(0);
  const [userGoals, setUserGoals] = useState<StudyGoal[]>([]);
  const [bibleProgress, setBibleProgress] = useState({
    overall: 0,
    oldTestament: 0,
    newTestament: 0,
    chaptersRead: 0
  });
  
  useEffect(() => {
    // Load user data and progress statistics
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data...");
        
        // Calculate Bible reading progress
        const overall = await calculateOverallProgress();
        const oldTestament = await calculateTestamentProgress("OT");
        const newTestament = await calculateTestamentProgress("NT");
        const completedBooks = await getCompletedBooks();
        
        // Get quiz results
        const quizResults = await getQuizResults();
        const numQuizzesTaken = quizResults.length;
        
        // Get user goals
        const goals = await getStudyGoals();
        
        // Get reading statistics from database
        const streak = await getStudyStreak();
        console.log("Fetched study streak:", streak);
        
        const chaptersRead = await getChaptersReadCount();
        const weeklyHours = await getWeeklyReadingTime();
        const chartData = await getWeeklyReadingData();
        console.log("Weekly chart data:", chartData);
        
        // Update state with fetched data
        setBibleProgress({
          overall,
          oldTestament,
          newTestament,
          chaptersRead
        });
        
        setCompletedStudies(completedBooks.length);
        setQuizzesTaken(numQuizzesTaken);
        setStudyStreak(streak);
        setWeeklyReading(weeklyHours);
        setProgressData(chartData);
        setUserGoals(goals);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load your progress data. Please try again later.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const getCurrentTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "morning";
    if (hours < 18) return "afternoon";
    return "evening";
  };

  // Render a goal card based on its type
  const renderGoalCard = (goal: StudyGoal) => {
    // Calculate progress percentage
    let progressPercentage = 0;
    let goalText = '';
    let icon;
    
    switch (goal.type) {
      case 'book':
        icon = <BookOpen className="h-4 w-4 text-primary" />;
        goalText = `Read the book of ${goal.target}`;
        progressPercentage = goal.progress;
        break;
      case 'quiz-performance':
        icon = <Award className="h-4 w-4 text-amber-500" />;
        goalText = `Achieve ${goal.target}% quiz score`;
        progressPercentage = goal.progress;
        break;
      case 'reading-streak':
        icon = <Calendar className="h-4 w-4 text-green-500" />;
        goalText = `${goal.target}-day reading streak`;
        progressPercentage = (goal.progress / Number(goal.target)) * 100;
        break;
      case 'chapters-read':
        icon = <BookOpen className="h-4 w-4 text-blue-500" />;
        goalText = `Read ${goal.target} chapters`;
        progressPercentage = (goal.progress / Number(goal.target)) * 100;
        break;
      default:
        icon = <CheckSquare className="h-4 w-4 text-primary" />;
        goalText = `Complete ${goal.target} goal`;
        progressPercentage = goal.progress;
    }

    return (
      <div key={goal.id} className="bg-card/40 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{goalText}</span>
          </div>
          {goal.completed && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
              Completed
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {goal.type === 'reading-streak' || goal.type === 'chapters-read' 
                ? `${goal.progress} / ${goal.target}` 
                : `${Math.round(progressPercentage)}%`
              }
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="pt-8 sm:pt-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Loading your spiritual journey...</h2>
            <p className="text-muted-foreground">Please wait while we load your data.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Get the user's name for greeting from profile
  const userName = profile?.full_name || user?.email?.split('@')[0] || "Friend";
  
  return (
    <Layout>
      <div className="pt-8 sm:pt-12">
        <header className="mb-8 sm:mb-12">
          <div className="pill mb-3 inline-block">Dashboard</div>
          <h1 className="text-3xl font-bold">Good {getCurrentTime()}, {userName}</h1>
          <p className="text-muted-foreground mt-2">
            Your spiritual journey continues. Here's your progress so far.
          </p>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Study Streak" 
            value={`${studyStreak} days`} 
            icon={<Calendar className="h-4 w-4 text-primary" />}
            trend={studyStreak > 0 ? { value: studyStreak, positive: true } : undefined}
          />
          <StatCard 
            title="Weekly Reading" 
            value={`${weeklyReading} hours`} 
            icon={<Clock className="h-4 w-4 text-primary" />}
            trend={weeklyReading > 0 ? { value: Math.round(weeklyReading * 10), positive: true } : undefined}
          />
          <StatCard 
            title="Quizzes Taken" 
            value={quizzesTaken.toString()} 
            icon={<BookMarked className="h-4 w-4 text-primary" />}
            trend={quizzesTaken > 0 ? { value: quizzesTaken, positive: true } : undefined}
          />
          <StatCard 
            title="Chapters Read" 
            value={bibleProgress.chaptersRead.toString()} 
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            trend={bibleProgress.chaptersRead > 0 ? { value: bibleProgress.chaptersRead, positive: true } : undefined}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Weekly Progress</h2>
              <div className="pill">Last 7 days</div>
            </div>
            
            <ProgressChart data={progressData} />
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Bible Reading Goals</h2>
              <div className="space-y-3">
                <ProgressCard 
                  title="Overall Bible Reading" 
                  value={bibleProgress.overall} 
                  icon={<BookOpen className="h-4 w-4 text-primary" />}
                />
                <ProgressCard 
                  title="New Testament" 
                  value={bibleProgress.newTestament} 
                  icon={<BookMarked className="h-4 w-4 text-primary" />}
                />
                <ProgressCard 
                  title="Old Testament" 
                  value={bibleProgress.oldTestament} 
                  icon={<BarChart2 className="h-4 w-4 text-primary" />}
                />
              </div>
            </div>
            
            {/* Latest Achievement */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Latest Achievement</h2>
              <UserRewards compact={true} />
            </div>
          </div>
        </div>
        
        {/* Study Goals Section */}
        <div className="mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Your Study Goals</CardTitle>
              <CardDescription>
                Track your progress towards your personal study goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userGoals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">You haven't set any study goals yet.</p>
                  <a href="/goals" className="text-primary hover:underline text-sm mt-2 inline-block">
                    Set your first goal
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userGoals.slice(0, 4).map(goal => renderGoalCard(goal))}
                </div>
              )}
              {userGoals.length > 0 && (
                <div className="mt-4 text-center">
                  <a href="/goals" className="text-primary hover:underline text-sm">
                    View all goals
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Learning Plan Generator */}
        <div className="mb-8">
          <LearningPlanGenerator />
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Continue Studying</h2>
            <a href="/study" className="text-primary text-sm hover:underline">
              View all
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyModules.map((module) => (
              <StudyCard 
                key={module.id}
                title={module.title}
                description={module.description}
                progress={module.progress}
                image={module.image}
                chip={module.chip}
                href={module.href}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Pre-defined study modules
const studyModules = [
  {
    id: 1,
    title: "The Gospel of John",
    description: "Explore the theological depth of John's account",
    progress: 65,
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "New Testament",
    href: "/biblestudy/john"
  },
  {
    id: 2,
    title: "Psalms of David",
    description: "Discover the prayers and poetry of King David",
    progress: 42,
    image: "https://images.unsplash.com/photo-1602525665453-7483caed6e3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "Old Testament",
    href: "/biblestudy/psalms"
  },
  {
    id: 3,
    title: "The Book of Acts",
    description: "Witness the birth and growth of the early church",
    progress: 78,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80",
    chip: "New Testament",
    href: "/biblestudy/acts"
  },
];

export default Dashboard;
