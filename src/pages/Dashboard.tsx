
import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, BookMarked, BarChart2, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressCard } from "@/components/ui/progress-card";
import { StudyCard } from "@/components/ui/study-card";
import { ProgressChart } from "@/components/progress-chart";
import { LearningPlanGenerator } from "@/components/learning-plan-generator";
import { toast } from "@/hooks/use-toast";
import { 
  calculateOverallProgress, 
  calculateTestamentProgress,
  getAllReadingProgress,
  getCompletedBooks
} from "@/services/bible-api";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [weeklyReading, setWeeklyReading] = useState(0);
  const [completedStudies, setCompletedStudies] = useState(0);
  const [bibleProgress, setBibleProgress] = useState({
    overall: 0,
    oldTestament: 0,
    newTestament: 0,
    chaptersRead: 0
  });
  
  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        // Fetch user profile if authenticated
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0] || "Friend");
        } else {
          setUserName(session.user.email?.split('@')[0] || "Friend");
        }
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Load user data and progress statistics
    const fetchUserData = async () => {
      try {
        if (isAuthenticated === null) return; // Wait for auth check
        
        // Calculate Bible reading progress
        const overall = await calculateOverallProgress();
        const oldTestament = await calculateTestamentProgress("OT");
        const newTestament = await calculateTestamentProgress("NT");
        const readingProgress = await getAllReadingProgress();
        const chaptersRead = readingProgress.length;
        const completedBooks = (await getCompletedBooks()).length;
        
        setBibleProgress({
          overall,
          oldTestament,
          newTestament,
          chaptersRead
        });
        
        setCompletedStudies(completedBooks);
        
        // Calculate study streak
        const streak = calculateStudyStreak(readingProgress);
        setStudyStreak(streak);
        
        // Calculate weekly reading hours (approximate based on completed chapters)
        // Assuming average reading time of 10 minutes per chapter
        const recentReadings = getRecentReadings(readingProgress, 7); // last 7 days
        const weeklyHours = (recentReadings.length * 10 / 60).toFixed(1);
        setWeeklyReading(parseFloat(weeklyHours));
        
        // Generate weekly progress data for chart
        const chartData = generateWeeklyProgressData(readingProgress);
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
    
    if (isAuthenticated !== null) {
      fetchUserData();
    }
  }, [isAuthenticated]);
  
  // Function to calculate study streak based on reading progress
  const calculateStudyStreak = (progress) => {
    if (!progress || progress.length === 0) return 0;
    
    // Sort by date (newest first)
    const sortedProgress = [...progress].sort((a, b) => 
      new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()
    );
    
    // Check if user has read today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latestReadDate = new Date(sortedProgress[0].lastRead);
    latestReadDate.setHours(0, 0, 0, 0);
    
    // If latest reading is not from today or yesterday, streak is broken
    const diff = (today.getTime() - latestReadDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 1) return 0;
    
    // Count consecutive days
    let streak = 1;
    let currentDate = latestReadDate;
    
    // Group readings by date
    const readingsByDate = {};
    sortedProgress.forEach(item => {
      const date = new Date(item.lastRead);
      date.setHours(0, 0, 0, 0);
      const dateString = date.toISOString().split('T')[0];
      if (!readingsByDate[dateString]) {
        readingsByDate[dateString] = [];
      }
      readingsByDate[dateString].push(item);
    });
    
    // Count consecutive days
    for (let i = 1; i <= 30; i++) { // Check up to 30 days back
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      if (readingsByDate[prevDateStr]) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Get readings from the past n days
  const getRecentReadings = (progress, days) => {
    if (!progress || progress.length === 0) return [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return progress.filter(item => {
      const readDate = new Date(item.lastRead);
      return readDate >= cutoffDate;
    });
  };
  
  // Generate weekly progress data for chart
  const generateWeeklyProgressData = (progress) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const result = [];
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count chapters read on this day
      const dayReadings = progress.filter(item => {
        const readDate = new Date(item.lastRead);
        readDate.setHours(0, 0, 0, 0);
        return readDate.toISOString().split('T')[0] === dateStr;
      });
      
      // Calculate completion percentage (max 100%)
      const completion = Math.min(100, dayReadings.length * 10);
      
      result.push({
        name: days[(dayOfWeek - i + 7) % 7],
        completion: completion || 0
      });
    }
    
    return result;
  };
  
  const getCurrentTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "morning";
    if (hours < 18) return "afternoon";
    return "evening";
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="pt-8 sm:pt-12 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="pt-8 sm:pt-12">
        <header className="mb-8 sm:mb-12">
          <div className="pill mb-3 inline-block">Dashboard</div>
          <h1 className="text-3xl font-bold">Good {getCurrentTime()}, {userName || "Friend"}</h1>
          <p className="text-muted-foreground mt-2">
            Your spiritual journey continues. Here's your progress so far.
          </p>
          
          {isAuthenticated === false && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-700 dark:text-yellow-400">
              <p>Sign in to save your progress and personalize your dashboard.</p>
            </div>
          )}
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
            title="Completed Studies" 
            value={completedStudies.toString()} 
            icon={<BookMarked className="h-4 w-4 text-primary" />}
          />
          <StatCard 
            title="Chapters Read" 
            value={bibleProgress.chaptersRead.toString()} 
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            trend={bibleProgress.chaptersRead > 0 ? { value: 4, positive: true } : undefined}
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
