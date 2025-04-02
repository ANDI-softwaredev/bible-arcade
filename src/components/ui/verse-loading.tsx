
import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// Sample Bible verses for loading screen
const LOADING_VERSES = [
  { verse: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.", reference: "Jeremiah 29:11" },
  { verse: "Trust in the LORD with all your heart, and do not lean on your own understanding.", reference: "Proverbs 3:5" },
  { verse: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", reference: "Romans 8:28" },
  { verse: "I can do all things through him who strengthens me.", reference: "Philippians 4:13" },
  { verse: "Be strong and courageous. Do not fear or be in dread of them, for it is the LORD your God who goes with you. He will not leave you or forsake you.", reference: "Deuteronomy 31:6" },
  { verse: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.", reference: "Isaiah 40:31" }
];

interface VerseLoadingProps {
  message?: string;
}

export function VerseLoading({ message = "Loading..." }: VerseLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentVerse, setCurrentVerse] = useState(LOADING_VERSES[0]);
  const [isFadingIn, setIsFadingIn] = useState(true);
  
  // Get random verse
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_VERSES.length);
    setCurrentVerse(LOADING_VERSES[randomIndex]);
  }, []);
  
  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 120);
    
    return () => clearInterval(interval);
  }, []);

  // Verse fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFadingIn(false);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * LOADING_VERSES.length);
        setCurrentVerse(LOADING_VERSES[randomIndex]);
        setIsFadingIn(true);
      }, 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 space-y-6 max-w-md mx-auto text-center">
      <div className="text-primary text-lg font-medium">{message}</div>
      
      <Progress value={progress} className="w-full h-2" />
      
      <div className="h-32 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isFadingIn ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="space-y-3"
        >
          <p className="text-lg text-foreground italic">"{currentVerse.verse}"</p>
          <p className="text-sm text-muted-foreground">{currentVerse.reference}</p>
        </motion.div>
      </div>
    </div>
  );
}
