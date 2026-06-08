"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // ✅ Load stored theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    setThemeState(storedTheme || defaultTheme);
  }, [defaultTheme, storageKey]);

  // ✅ Apply theme to <html> and listen to system changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (newTheme: Theme) => {
      root.classList.remove("light", "dark");
      const activeTheme =
        newTheme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : newTheme;
      root.classList.add(activeTheme);
    };

    applyTheme(theme);

    // ✅ Auto-update when system theme changes
    const handleChange = () => {
      if (theme === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
