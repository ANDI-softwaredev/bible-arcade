
import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, BookMarked, BarChart2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressCard } from "@/components/ui/progress-card";
import { StudyCard } from "@/components/ui/study-card";
import { ProgressChart } from "@/components/progress-chart";

// Mock data
const progressData = [
  { name: "Mon", completion: 30 },
  { name: "Tue", completion: 45 },
  { name: "Wed", completion: 60 },
  { name: "Thu", completion: 40 },
  { name: "Fri", completion: 75 },
  { name: "Sat", completion: 80 },
  { name: "Sun", completion: 65 },
];

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

const Dashboard = () => {
  const [userName, setUserName] = useState("Samuel");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getCurrentTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "morning";
    if (hours < 18) return "afternoon";
    return "evening";
  };
  
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
            value="7 days" 
            icon={<Calendar className="h-4 w-4 text-primary" />}
            trend={{ value: 12, positive: true }}
          />
          <StatCard 
            title="Weekly Reading" 
            value="3.5 hours" 
            icon={<Clock className="h-4 w-4 text-primary" />}
            trend={{ value: 8, positive: true }}
          />
          <StatCard 
            title="Completed Studies" 
            value="6" 
            icon={<BookMarked className="h-4 w-4 text-primary" />}
          />
          <StatCard 
            title="Memorized Verses" 
            value="24" 
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            trend={{ value: 4, positive: true }}
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
              value={42} 
              icon={<BookOpen className="h-4 w-4 text-primary" />}
            />
            <ProgressCard 
              title="New Testament" 
              value={65} 
              icon={<BookMarked className="h-4 w-4 text-primary" />}
            />
            <ProgressCard 
              title="Old Testament" 
              value={28} 
              icon={<BarChart2 className="h-4 w-4 text-primary" />}
            />
          </div>
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

export default Dashboard;
