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

/**
 * 使用 View Transitions API 实现丝滑主题切换
 * 浏览器原生 GPU 加速，零 JS 动画代码
 */
function switchThemeSmooth(current: Theme, next: Theme) {
  if (typeof document === "undefined") return;

  const docEl = document.documentElement;

  // 不支持 View Transitions 的浏览器直接切
  if (typeof (document as any).startViewTransition !== "function") {
    docEl.classList.remove("light", "dark");
    docEl.classList.add(next);
    return;
  }

  // @ts-ignore — View Transitions API
  docEl.startViewTransition(() => {
    docEl.classList.remove("light", "dark");
    docEl.classList.add(next);
  });
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

  // 初始化时立即设置 DOM class
  const initRef = React.useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }

  // 同步 storage
  React.useEffect(() => {
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch {}
  }, [theme]);

  // 跨标签页同步
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setTheme(e.newValue);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(e.newValue!);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    if (!switchable) return;
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    switchThemeSmooth(theme, next);
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
