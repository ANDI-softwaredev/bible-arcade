
import { useEffect, useState } from "react";
import { BookOpen, BarChart2, BookMarked, Calendar, ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout";
import { ProgressChart } from "@/components/progress-chart";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const weeklyData = [
  { name: "Mon", completion: 30 },
  { name: "Tue", completion: 45 },
  { name: "Wed", completion: 60 },
  { name: "Thu", completion: 40 },
  { name: "Fri", completion: 75 },
  { name: "Sat", completion: 80 },
  { name: "Sun", completion: 65 },
];

const monthlyData = [
  { name: "Week 1", completion: 55 },
  { name: "Week 2", completion: 65 },
  { name: "Week 3", completion: 45 },
  { name: "Week 4", completion: 70 },
];

const bibleCompletion = [
  { name: "Old Testament", value: 28, color: "hsl(var(--primary))" },
  { name: "New Testament", value: 65, color: "hsl(var(--accent))" },
  { name: "Remaining", value: 7, color: "hsl(var(--muted))" },
];

const bookCompletion = [
  { name: "Genesis", progress: 100, chapters: 50, lastRead: "2 days ago" },
  { name: "Exodus", progress: 85, chapters: 40, lastRead: "1 week ago" },
  { name: "Leviticus", progress: 40, chapters: 27, lastRead: "3 days ago" },
  { name: "Numbers", progress: 20, chapters: 36, lastRead: "2 weeks ago" },
  { name: "Deuteronomy", progress: 5, chapters: 34, lastRead: "1 month ago" },
  { name: "Matthew", progress: 100, chapters: 28, lastRead: "3 days ago" },
  { name: "Mark", progress: 100, chapters: 16, lastRead: "1 week ago" },
  { name: "Luke", progress: 90, chapters: 24, lastRead: "Yesterday" },
  { name: "John", progress: 65, chapters: 21, lastRead: "Today" },
  { name: "Acts", progress: 78, chapters: 28, lastRead: "4 days ago" },
];

const Progress = () => {
  const [timeFrame, setTimeFrame] = useState<"weekly" | "monthly">("weekly");
  const [progressData, setProgressData] = useState(weeklyData);
  
  useEffect(() => {
    setProgressData(timeFrame === "weekly" ? weeklyData : monthlyData);
  }, [timeFrame]);

  return (
    <Layout>
      <div className="pt-8 sm:pt-12">
        <header className="mb-8 sm:mb-12">
          <div className="pill mb-3 inline-block">Progress Tracker</div>
          <h1 className="text-3xl font-bold">Your Bible Reading Journey</h1>
          <p className="text-muted-foreground mt-2">
            Track your progress through the Bible and set new goals
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Reading Progress</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTimeFrame("weekly")}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-all",
                    timeFrame === "weekly" 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-accent/10"
                  )}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setTimeFrame("monthly")}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-all",
                    timeFrame === "monthly" 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-accent/10"
                  )}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            <ProgressChart data={progressData} />
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Bible Completion</h2>
            </div>
            
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bibleCompletion}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {bibleCompletion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      boxShadow: '0 4px 12px -2px rgba(0,0,0,0.3)',
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              {bibleCompletion.slice(0, 2).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Books Progression</h2>
            <div className="pill">10 of 66 Books</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-2 font-medium text-muted-foreground">Book</th>
                  <th className="text-left py-4 px-2 font-medium text-muted-foreground">Progress</th>
                  <th className="text-left py-4 px-2 font-medium text-muted-foreground">Chapters</th>
                  <th className="text-left py-4 px-2 font-medium text-muted-foreground">Last Read</th>
                  <th className="text-left py-4 px-2 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookCompletion.map((book) => (
                  <tr key={book.name} className="border-b border-border">
                    <td className="py-4 px-2 font-medium">{book.name}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-background/50 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{book.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm">{book.chapters} chapters</td>
                    <td className="py-4 px-2 text-sm">{book.lastRead}</td>
                    <td className="py-4 px-2">
                      <a 
                        href={`/study/${book.name.toLowerCase()}`}
                        className="inline-flex items-center text-primary text-sm hover:underline"
                      >
                        Continue
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Reading Stats</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">Reading Streak</h3>
              </div>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-sm text-muted-foreground mt-1">Keep it going!</p>
            </div>
            
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">Daily Average</h3>
              </div>
              <div className="text-2xl font-bold">30 minutes</div>
              <p className="text-sm text-muted-foreground mt-1">This week</p>
            </div>
            
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookMarked className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">Completed Books</h3>
              </div>
              <div className="text-2xl font-bold">4 books</div>
              <p className="text-sm text-muted-foreground mt-1">Genesis, Matthew, Mark, Luke</p>
            </div>
            
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">Verses Memorized</h3>
              </div>
              <div className="text-2xl font-bold">24 verses</div>
              <p className="text-sm text-muted-foreground mt-1">+4 this week</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Progress;
