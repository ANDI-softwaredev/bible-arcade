import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, BarChart2, BookMarked, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

// Fading animation variants for elements
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const features = [
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: "Bible Study",
    description: "Access comprehensive study materials for every book of the Bible, with in-depth commentaries."
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-primary" />,
    title: "Progress Tracking",
    description: "Visualize your reading progress with beautiful charts and analytics to stay motivated."
  },
  {
    icon: <BookMarked className="h-6 w-6 text-primary" />,
    title: "Study Plans",
    description: "Follow curated study plans designed to deepen your understanding of scripture."
  },
];

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "py-4 backdrop-blur-xl bg-background/80 border-b border-white/10" 
          : "py-6"
      )}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg tracking-tight">Biblico</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <ThemeToggle />
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <Link to="/register">
              <Button className="px-4 md:px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-32 pb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="pill mb-6 inline-block"
            >
              Modern Bible Learning System
            </motion.div>
            
            <motion.h1 
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Track</span> your Bible study journey with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">elegance</span>
            </motion.h1>
            
            <motion.p 
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-lg text-muted-foreground mb-8 md:mb-12"
            >
              A beautiful, minimalist Bible learning management system that helps you grow spiritually through visual progress tracking and comprehensive study resources.
            </motion.p>
            
            <motion.div 
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mt-20 relative max-w-5xl mx-auto rounded-2xl overflow-hidden glass-card border border-white/10"
          >
            <img 
              src="https://images.unsplash.com/photo-1606820854416-439b3305ff39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2700&q=90" 
              alt="Dashboard Preview" 
              className="w-full shadow-xl rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-70" />
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-background/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="pill mb-4 inline-block">Features</div>
            <h2 className="text-3xl font-bold mb-4">
              Everything you need for Bible study
            </h2>
            <p className="text-muted-foreground">
              Our platform combines beautiful design with powerful functionality to enhance your spiritual growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="about" className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="pill mb-4 inline-block">About Biblico</div>
                <h2 className="text-3xl font-bold mb-4">
                  A modern approach to Bible study
                </h2>
                <p className="text-muted-foreground mb-6">
                  Biblico was designed with a focus on aesthetic beauty and functional simplicity. We believe that spiritual tools should not only be effective but also delightful to use.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">User-centered design</p>
                      <p className="text-sm text-muted-foreground">
                        Built around how people actually study and interact with scripture.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <BarChart2 className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Data-driven insights</p>
                      <p className="text-sm text-muted-foreground">
                        Visual analytics to help you understand your study patterns.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link to="/register">
                  <Button className="mt-2">
                    Create Your Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="relative h-80 lg:h-auto overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1555236867-9e742fae7821?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80" 
                  alt="Bible study" 
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent lg:hidden" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              <span className="font-semibold">Biblico</span>
            </div>
            
            <div className="flex gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Biblico. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
