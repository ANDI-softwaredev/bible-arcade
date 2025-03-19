
import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { cn } from "@/lib/utils";

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
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <motion.main 
          key={location.pathname}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "flex-1 pb-12",
            fullWidth ? "px-4 sm:px-6" : "container",
            className
          )}
        >
          {children}
        </motion.main>
      </div>
    </SidebarProvider>
  );
}
