"use client";

import { useState } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 rounded-xl border border-foreground/20 bg-background/90 px-3 py-2 text-sm font-medium backdrop-blur"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
}
