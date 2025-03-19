
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-muted-foreground" />
      <Switch 
        checked={theme === "dark"} 
        onCheckedChange={toggleTheme} 
        aria-label="Toggle theme" 
      />
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-muted-foreground" />
    </div>
  );
}
