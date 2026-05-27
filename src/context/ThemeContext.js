import React, { createContext, useContext, useState, useEffect } from 'react';
import { darkTheme, lightTheme } from '../theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'dark');
  const t = mode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('theme', next);
  };

  useEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.color = t.textPrimary;
    document.body.style.transition = 'all 0.2s';
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ t, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);