
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
      className="rounded-full bg-background/50 backdrop-blur-sm border border-border/40"
      aria-label="Toggle theme"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'opacity-0'}`} />
    </Button>
  );
}
