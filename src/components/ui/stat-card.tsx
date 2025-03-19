
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  className 
}: StatCardProps) {
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
      
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-semibold">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-1",
            trend.positive ? "text-green-400" : "text-red-400"
          )}>
            {trend.positive ? "↑" : "↓"}
            <span>{trend.value}% from last week</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
