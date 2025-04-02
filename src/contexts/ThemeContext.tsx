
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use this approach to safely handle initial state with SSR/hydration
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMounted, setIsMounted] = useState(false);

  // Use a separate useEffect for mounting logic
  useEffect(() => {
    setIsMounted(true);
    
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Update the document classes when theme changes
  useEffect(() => {
    if (!isMounted) return;
    
    const root = document.documentElement;
    
    // Add a class to trigger transitions
    root.classList.add("theme-transition");
    
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    
    // Remove transition class after the transition completes
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [theme, isMounted]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Return a stable context value
  const contextValue = React.useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
