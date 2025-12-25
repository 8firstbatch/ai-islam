import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "system";
  });
  const { user } = useAuth();

  const getEffectiveTheme = (t: Theme): "light" | "dark" => {
    if (t === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return t;
  };

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(getEffectiveTheme(theme));

  // Apply theme immediately on mount
  useEffect(() => {
    const effective = getEffectiveTheme(theme);
    setEffectiveTheme(effective);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effective);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(effective);
    
    // Force a repaint to ensure styles are applied
    root.style.display = 'none';
    void root.offsetHeight; // Trigger reflow
    root.style.display = '';
  }, []);

  useEffect(() => {
    const effective = getEffectiveTheme(theme);
    setEffectiveTheme(effective);
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effective);
    
    // Also set the class on the body for better coverage
    document.body.classList.remove("light", "dark");
    document.body.classList.add(effective);
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setEffectiveTheme(getEffectiveTheme("system"));
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  // Load theme from user settings when authenticated
  useEffect(() => {
    if (user) {
      supabase
        .from("user_settings")
        .select("theme")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.theme) {
            setThemeState(data.theme as Theme);
          }
        });
    }
  }, [user]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (user) {
      await supabase
        .from("user_settings")
        .update({ theme: newTheme })
        .eq("user_id", user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
