
import { useState, useEffect } from "react";
import { Search, BookOpen, Filter, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { StudyCard } from "@/components/ui/study-card";
import { cn } from "@/lib/utils";
import BibleReaderAdapter from "@/components/bible-reader-adapter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { VerseLoading } from "@/components/ui/verse-loading";
import { saveStudyDuration } from "@/services/quiz-generator";
import { supabase } from "@/integrations/supabase/client";

const studyModules = [
  {
    id: 1,
    title: "The Gospel of John",
    description: "Explore the theological depth of John's account",
    progress: 65,
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "New Testament",
    href: "/study/john",
    category: "new-testament"
  },
  {
    id: 2,
    title: "Psalms of David",
    description: "Discover the prayers and poetry of King David",
    progress: 42,
    image: "https://images.unsplash.com/photo-1602525665453-7483caed6e3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "Old Testament",
    href: "/study/psalms",
    category: "old-testament"
  },
  {
    id: 3,
    title: "The Book of Acts",
    description: "Witness the birth and growth of the early church",
    progress: 78,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80",
    chip: "New Testament",
    href: "/study/acts",
    category: "new-testament"
  },
  {
    id: 4,
    title: "Genesis: The Beginning",
    description: "Study the book of beginnings and God's creation",
    progress: 100,
    image: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "Old Testament",
    href: "/study/genesis",
    category: "old-testament"
  },
  {
    id: 5,
    title: "The Book of Revelation",
    description: "Understand the apocalyptic visions of John",
    progress: 25,
    image: "https://images.unsplash.com/photo-1506318164473-2dfd3ede3623?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "New Testament",
    href: "/study/revelation",
    category: "new-testament"
  },
  {
    id: 6,
    title: "The Book of Proverbs",
    description: "Gain wisdom from Solomon's collection of sayings",
    progress: 55,
    image: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    chip: "Old Testament",
    href: "/study/proverbs",
    category: "old-testament"
  },
];

type Category = "all" | "old-testament" | "new-testament";

const categories = [
  { id: "all", label: "All Studies" },
  { id: "old-testament", label: "Old Testament" },
  { id: "new-testament", label: "New Testament" },
];

const Study = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activeTab, setActiveTab] = useState("studies");
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const [completedChapters, setCompletedChapters] = useState<{book: string, chapter: number}[]>([]);
  
  const filteredModules = studyModules.filter((module) => {
    const matchesSearch = 
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "all" || module.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const fetchCompletedChapters = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) return;

        const { data, error } = await supabase
          .from('reading_progress')
          .select('book, chapter')
          .eq('user_id', session.session.user.id)
          .eq('completed', true);

        if (error) throw error;
        setCompletedChapters(data || []);
      } catch (error) {
        console.error("Error fetching completed chapters:", error);
      }
    };

    fetchCompletedChapters();
  }, []);

  useEffect(() => {
    const startTime = new Date();
    let currentBook: string | undefined;
    let currentChapter: number | undefined;
    
    return () => {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes
      
      if (duration >= 1) { // Only save if at least 1 minute
        saveStudyDuration({
          duration,
          timestamp: endTime.toISOString(),
          book: currentBook,
          chapter: currentChapter
        });
      }
    };
  }, []);

  const handleProgressUpdate = (book?: string, chapter?: number) => {
    if (book && chapter) {
      console.log("Reading progress updated:", book, chapter);
    }
  };

  const isChapterCompleted = (book: string, chapter: number): boolean => {
    return completedChapters.some(item => 
      item.book === book && item.chapter === chapter
    );
  };

  return (
    <Layout>
      <div className="pt-8 sm:pt-12">
        <header className="mb-8 sm:mb-12">
          <div className="pill mb-3 inline-block">Bible Study</div>
          <h1 className="text-3xl font-bold">Explore Biblical Teachings</h1>
          <p className="text-muted-foreground mt-2">
            Dive into our comprehensive Bible study modules or mark your reading progress with checkboxes
          </p>
        </header>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="w-full grid grid-cols-2 bg-card/60 backdrop-blur-sm">
            <TabsTrigger value="studies" className="data-[state=active]:bg-coral/80 data-[state=active]:text-white">Study Modules</TabsTrigger>
            <TabsTrigger value="read" className="data-[state=active]:bg-teal/80 data-[state=active]:text-white">Bible Reading</TabsTrigger>
          </TabsList>
          
          <TabsContent value="studies">
            <div className="glass-card rounded-xl p-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for studies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-teal/20 focus:border-teal-light/50"
                  />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id as Category)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all",
                        activeCategory === category.id
                          ? "bg-coral/20 text-coral-light"
                          : "hover:bg-accent/10"
                      )}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {filteredModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => (
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
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-xl p-8 text-center"
              >
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No studies found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any studies matching your criteria.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="text-coral hover:underline"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="read">
            <div className="mb-6">
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2 text-coral" />
                    Your Reading Progress
                  </h2>
                  <div className="pill">{completedChapters.length} chapters completed</div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Track your Bible reading progress by checking off chapters as you complete them. Your progress will be shown on your dashboard.
                </p>
              </div>
            </div>
            
            {loading ? (
              <div className="py-12">
                <VerseLoading message="Loading the Bible..." />
              </div>
            ) : (
              <BibleReaderAdapter
                onProgressUpdate={handleProgressUpdate}
                onLoadingChange={setLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Study;
