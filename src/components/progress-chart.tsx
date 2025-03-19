
import { useEffect, useState } from "react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { motion } from "framer-motion";

interface ProgressChartProps {
  data: {
    name: string;
    completion: number;
  }[];
  className?: string;
}

export function ProgressChart({ data, className }: ProgressChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Animate chart data on mount
    const timer = setTimeout(() => {
      setChartData(data);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dx={-10}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
              boxShadow: '0 4px 12px -2px rgba(0,0,0,0.3)',
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <Area 
            type="monotone" 
            dataKey="completion" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorCompletion)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
