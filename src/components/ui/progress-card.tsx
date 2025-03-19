
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  icon?: ReactNode;
  className?: string;
}

export function ProgressCard({ title, value, icon, className }: ProgressCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "glass-card rounded-xl p-5 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold">{value}%</div>
        <div className="w-full bg-background/50 rounded-full h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-primary h-2 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
