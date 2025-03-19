
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full bg-background/50 backdrop-blur-sm border border-border/40 overflow-hidden relative"
      aria-label="Toggle theme"
    >
      <Sun 
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out 
          ${theme === 'dark' 
            ? 'rotate-[-90deg] scale-0 opacity-0 absolute' 
            : 'rotate-0 scale-100 opacity-100'}`} 
      />
      <Moon 
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out 
          ${theme === 'dark' 
            ? 'rotate-0 scale-100 opacity-100' 
            : 'rotate-90 scale-0 opacity-0 absolute'}`} 
      />
    </Button>
  );
}
