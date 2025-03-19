
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StudyCardProps {
  title: string;
  description: string;
  progress: number;
  image?: string;
  href: string;
  chip?: string;
  className?: string;
}

export function StudyCard({ 
  title, 
  description, 
  progress,
  image,
  href,
  chip,
  className 
}: StudyCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "glass-card rounded-xl overflow-hidden flex flex-col",
        className
      )}
    >
      {image && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="object-cover w-full h-full"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          {chip && (
            <div className="absolute top-4 left-4">
              <div className="pill">{chip}</div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-background/50 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <Link 
          to={href}
          className="inline-flex items-center gap-2 text-primary font-medium text-sm mt-2 hover:gap-3 transition-all"
        >
          Continue Learning
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
