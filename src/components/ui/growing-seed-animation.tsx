
import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GrowingSeedAnimationProps {
  message?: string;
  className?: string;
}

export function GrowingSeedAnimation({ message, className }: GrowingSeedAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="relative h-32 w-32">
        {/* Soil */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-8 bg-amber-800 rounded-b-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Plant stem */}
        <motion.div 
          className="absolute bottom-8 left-1/2 w-1.5 bg-green-500"
          initial={{ height: 0 }}
          animate={{ height: 40 }}
          transition={{ 
            duration: 1.5, 
            delay: 0.5,
            ease: "easeOut"
          }}
          style={{ marginLeft: "-3px" }}
        />
        
        {/* First leaf - left */}
        <motion.div 
          className="absolute left-[calc(50%-12px)] bottom-[calc(8px+26px)] w-8 h-6"
          initial={{ opacity: 0, scale: 0, rotateZ: -10 }}
          animate={{ opacity: 1, scale: 1, rotateZ: -30 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <div className="w-full h-full bg-green-400 rounded-full transform -rotate-45"></div>
        </motion.div>
        
        {/* Second leaf - right */}
        <motion.div 
          className="absolute left-[calc(50%+4px)] bottom-[calc(8px+26px)] w-8 h-6"
          initial={{ opacity: 0, scale: 0, rotateZ: 10 }}
          animate={{ opacity: 1, scale: 1, rotateZ: 30 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <div className="w-full h-full bg-green-400 rounded-full transform rotate-45"></div>
        </motion.div>
        
        {/* Flower/top */}
        <motion.div 
          className="absolute left-1/2 bottom-[calc(8px+40px)]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          style={{ marginLeft: "-10px" }}
        >
          <div className="w-5 h-5 bg-primary rounded-full" />
        </motion.div>
      </div>
      
      <motion.p 
        className="mt-4 text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {message || "Growing in faith..."}
      </motion.p>
    </div>
  );
}
