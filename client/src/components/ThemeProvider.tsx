import { createContext, useContext, useEffect, ReactNode } from "react";

/** Single premium dark theme — no toggle. */
const ThemeContext = createContext<{ theme: "dark" }>({ theme: "dark" });

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    localStorage.removeItem("theme");
  }, []);

  return <ThemeContext.Provider value={{ theme: "dark" }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
