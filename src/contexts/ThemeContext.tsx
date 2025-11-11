import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ThemeMode,
  OceanTheme,
  ThemeColors,
  getThemeColorsForOceanTheme,
  applyCSSVariables,
  lightThemeTokens,
  darkThemeTokens
} from '../utils/themeSystem';

interface ThemeContextType {
  mode: ThemeMode;
  oceanTheme: OceanTheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  setOceanTheme: (theme: OceanTheme) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [oceanTheme, setOceanThemeState] = useState<OceanTheme>('ocean-depths');
  const [colors, setColors] = useState<ThemeColors>(lightThemeTokens);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedOceanTheme = localStorage.getItem('ocean-theme') as OceanTheme;

    if (savedMode) {
      setModeState(savedMode);
    }
    if (savedOceanTheme) {
      setOceanThemeState(savedOceanTheme);
    }
  }, []);

  // Update colors and CSS variables when theme changes
  useEffect(() => {
    const newColors = getThemeColorsForOceanTheme(mode, oceanTheme);
    setColors(newColors);
    applyCSSVariables(newColors);
    
    // Update body class for dark mode
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode, oceanTheme]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const setOceanTheme = (newTheme: OceanTheme) => {
    setOceanThemeState(newTheme);
    localStorage.setItem('ocean-theme', newTheme);
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        oceanTheme,
        colors,
        setMode,
        setOceanTheme,
        toggleMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
