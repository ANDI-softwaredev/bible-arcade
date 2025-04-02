
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, MobileMenuTrigger } from "./app-sidebar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

export function Layout({ children, fullWidth = false, className }: LayoutProps) {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle scroll event for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <SidebarProvider>
      {/* Cosmic background */}
      <div className="cosmic-background"></div>
      <div className="cosmic-stars"></div>
      
      <div className="fixed top-4 right-8 z-50">
        <ThemeToggle />
      </div>
      
      <div className="fixed top-4 left-4 z-50">
        <MobileMenuTrigger />
      </div>

      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <motion.main 
          key={location.pathname}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "flex-1 pb-12 pt-16 md:pt-12 relative",
            fullWidth ? "px-4 sm:px-6" : "container",
            className
          )}
        >
          {children}
          
          {/* Scroll to top button */}
          <motion.div 
            className="fixed bottom-6 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: showScrollTop ? 1 : 0, 
              scale: showScrollTop ? 1 : 0.8,
              pointerEvents: showScrollTop ? 'auto' : 'none'
            }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              onClick={scrollToTop} 
              size="icon" 
              variant="secondary"
              className="rounded-full shadow-md hover:shadow-lg bg-teal/90 hover:bg-teal text-primary-foreground"
            >
              <ChevronUp className="h-5 w-5" />
              <span className="sr-only">Scroll to top</span>
            </Button>
          </motion.div>
        </motion.main>
      </div>
    </SidebarProvider>
  );
}
