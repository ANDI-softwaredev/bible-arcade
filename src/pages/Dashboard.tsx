import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, BookMarked, BarChart2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressCard } from "@/components/ui/progress-card";
import { StudyCard } from "@/components/ui/study-card";
import { ProgressChart } from "@/components/progress-chart";
import { LearningPlanGenerator } from "@/components/learning-plan-generator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GrowingSeedAnimation } from "@/components/ui/growing-seed-animation";
import { 
  calculateOverallProgress, 
  calculateTestamentProgress,
  getCompletedBooks,
  getStudyStreak,
  getChaptersReadCount,
  getWeeklyReadingData,
  getWeeklyReadingTime
} from "@/services/bible-api";
import { getQuizResults } from "@/services/quiz-generator";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [weeklyReading, setWeeklyReading] = useState(0);
  const [completedStudies, setCompletedStudies] = useState(0);
  const [quizzesTaken, setQuizzesTaken] = useState(0);
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
        // Calculate Bible reading progress
        const overall = await calculateOverallProgress();
        const oldTestament = await calculateTestamentProgress("OT");
        const newTestament = await calculateTestamentProgress("NT");
        const completedBooks = await getCompletedBooks();
        
        // Get quiz results
        const quizResults = await getQuizResults();
        const numQuizzesTaken = quizResults.length;
        
        // Get reading statistics from database
        const streak = await getStudyStreak();
        const chaptersRead = await getChaptersReadCount();
        const weeklyHours = await getWeeklyReadingTime();
        const chartData = await getWeeklyReadingData();
        
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
  
  if (loading) {
    return (
      <Layout>
        <div className="pt-8 sm:pt-12 flex justify-center items-center min-h-[60vh]">
          <GrowingSeedAnimation message="Loading your spiritual journey..." />
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
            <h2 className="text-xl font-semibold mb-4">Your Goals</h2>
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

// Pre-defined study modules (could be moved to a separate data file)
const studyModules = [
  {
    id: 1,
    title: "The Gospel of John",
    description: "Explore the theological depth of John's account",
    progress: 65,
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "New Testament",
    href: "/study/john"
  },
  {
    id: 2,
    title: "Psalms of David",
    description: "Discover the prayers and poetry of King David",
    progress: 42,
    image: "https://images.unsplash.com/photo-1602525665453-7483caed6e3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "Old Testament",
    href: "/study/psalms"
  },
  {
    id: 3,
    title: "The Book of Acts",
    description: "Witness the birth and growth of the early church",
    progress: 78,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80",
    chip: "New Testament",
    href: "/study/acts"
  },
];

export default Dashboard;
