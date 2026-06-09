import * as React from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "lucky-theme";

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme,
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (defaultTheme) return defaultTheme;
    return getStoredTheme();
  });

  React.useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch {}
  }, [theme]);

  const toggleTheme = () => {
    if (switchable) {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

