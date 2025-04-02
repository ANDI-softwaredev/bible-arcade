
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
      <div className="relative h-40 w-40">
        {/* Soil */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-8 rounded-b-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Plant stem */}
        <motion.div 
          className="absolute bottom-8 left-1/2 w-1.5 bg-gradient-to-t from-green-600 to-green-500"
          initial={{ height: 0 }}
          animate={{ height: 52 }}
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
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-500 rounded-full transform -rotate-45"></div>
        </motion.div>
        
        {/* Second leaf - right */}
        <motion.div 
          className="absolute left-[calc(50%+4px)] bottom-[calc(8px+26px)] w-8 h-6"
          initial={{ opacity: 0, scale: 0, rotateZ: 10 }}
          animate={{ opacity: 1, scale: 1, rotateZ: 30 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-500 rounded-full transform rotate-45"></div>
        </motion.div>
        
        {/* Third leaf - left up higher */}
        <motion.div 
          className="absolute left-[calc(50%-10px)] bottom-[calc(8px+38px)] w-7 h-5"
          initial={{ opacity: 0, scale: 0, rotateZ: -10 }}
          animate={{ opacity: 1, scale: 1, rotateZ: -35 }}
          transition={{ duration: 0.8, delay: 2.0 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-500 rounded-full transform -rotate-45"></div>
        </motion.div>
        
        {/* Fourth leaf - right up higher */}
        <motion.div 
          className="absolute left-[calc(50%+3px)] bottom-[calc(8px+38px)] w-7 h-5"
          initial={{ opacity: 0, scale: 0, rotateZ: 10 }}
          animate={{ opacity: 1, scale: 1, rotateZ: 35 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-500 rounded-full transform rotate-45"></div>
        </motion.div>
        
        {/* Flower/top */}
        <motion.div 
          className="absolute left-1/2 bottom-[calc(8px+52px)]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 2.4 }}
          style={{ marginLeft: "-12px" }}
        >
          <div className="flex items-center justify-center">
            {/* Flower petals */}
            <motion.div 
              className="absolute w-6 h-6 bg-primary/80 rounded-full"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.05, 1] }}
              transition={{ delay: 2.8, duration: 0.8 }}
            />
            <motion.div 
              className="absolute w-6 h-6 bg-primary/80 rounded-full transform translate-x-3 translate-y-3"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.05, 1] }}
              transition={{ delay: 3.0, duration: 0.8 }}
            />
            <motion.div 
              className="absolute w-6 h-6 bg-primary/80 rounded-full transform translate-x-3 translate-y-[-3px]"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.05, 1] }}
              transition={{ delay: 3.2, duration: 0.8 }}
            />
            <motion.div 
              className="absolute w-6 h-6 bg-primary/80 rounded-full transform translate-x-[-3px] translate-y-3"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.05, 1] }}
              transition={{ delay: 3.4, duration: 0.8 }}
            />
            <motion.div 
              className="absolute w-6 h-6 bg-primary/80 rounded-full transform translate-x-[-3px] translate-y-[-3px]"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.05, 1] }}
              transition={{ delay: 3.6, duration: 0.8 }}
            />
            
            {/* Flower center */}
            <motion.div 
              className="w-6 h-6 bg-yellow-400 rounded-full z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.6, duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
      
      <motion.p 
        className="mt-4 text-center text-primary font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {message || "Growing in faith..."}
      </motion.p>
    </div>
  );
}
