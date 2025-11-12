// Complete Theme System for Aquarium Serenity

export type ThemeMode = 'light' | 'dark';
export type OceanTheme = 'ocean-depths' | 'coral-reef' | 'kelp-forest' | 'arctic-waters';

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Surfaces & Cards
  surfaceBase: string;
  surfaceElevated: string;
  surfaceOverlay: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Accent & Primary
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  
  // Gradients
  gradientPrimary: string;
  gradientSecondary: string;
  gradientAccent: string;
  
  // Borders & Dividers
  border: string;
  borderSubtle: string;
  divider: string;
  
  // States
  hover: string;
  active: string;
  focus: string;
  
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  
  // Glass effect
  glassBackground: string;
  glassBorder: string;
}

export const oceanThemes: Record<OceanTheme, {
  name: string;
  description: string;
  icon: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    gradient: string;
  };
}> = {
  'ocean-depths': {
    name: 'Ocean Depths',
    description: 'Deep blue waters and mysterious depths',
    icon: '🌊',
    preview: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      tertiary: '#93c5fd',
      gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
    }
  },
  'coral-reef': {
    name: 'Coral Reef',
    description: 'Vibrant coral gardens and tropical waters',
    icon: '🪸',
    preview: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      tertiary: '#fbcfe8',
      gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f97316 100%)'
    }
  },
  'kelp-forest': {
    name: 'Kelp Forest',
    description: 'Emerald kelp forests and sea greens',
    icon: '🌿',
    preview: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      tertiary: '#6ee7b7',
      gradient: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)'
    }
  },
  'arctic-waters': {
    name: 'Arctic Waters',
    description: 'Icy blues and glacial tones',
    icon: '❄️',
    preview: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
    colors: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      tertiary: '#67e8f9',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)'
    }
  }
};

// Light mode color tokens
export const lightThemeTokens: ThemeColors = {
  // Backgrounds
  bgPrimary: '#f0f9ff',
  bgSecondary: '#e0f2fe',
  bgTertiary: '#bae6fd',
  
  // Surfaces
  surfaceBase: 'rgba(255, 255, 255, 0.7)',
  surfaceElevated: 'rgba(255, 255, 255, 0.85)',
  surfaceOverlay: 'rgba(255, 255, 255, 0.95)',
  
  // Text
  textPrimary: '#1e3a8a',
  textSecondary: '#1e40af',
  textMuted: '#60a5fa',
  textInverse: '#ffffff',
  
  // Accent
  accentPrimary: '#3b82f6',
  accentSecondary: '#60a5fa',
  accentTertiary: '#93c5fd',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
  gradientSecondary: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)',
  gradientAccent: 'linear-gradient(135deg, #7dd3fc 0%, #93c5fd 100%)',
  
  // Borders
  border: 'rgba(59, 130, 246, 0.2)',
  borderSubtle: 'rgba(59, 130, 246, 0.1)',
  divider: 'rgba(59, 130, 246, 0.15)',
  
  // States
  hover: 'rgba(59, 130, 246, 0.1)',
  active: 'rgba(59, 130, 246, 0.2)',
  focus: 'rgba(59, 130, 246, 0.3)',
  
  // Shadows
  shadowSm: '0 1px 2px 0 rgba(30, 58, 138, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(30, 58, 138, 0.1), 0 2px 4px -1px rgba(30, 58, 138, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(30, 58, 138, 0.1), 0 4px 6px -2px rgba(30, 58, 138, 0.05)',
  
  // Glass
  glassBackground: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.3)'
};

// Dark mode color tokens
export const darkThemeTokens: ThemeColors = {
  // Backgrounds
  bgPrimary: '#0f172a',
  bgSecondary: '#1e293b',
  bgTertiary: '#334155',
  
  // Surfaces
  surfaceBase: 'rgba(30, 41, 59, 0.7)',
  surfaceElevated: 'rgba(30, 41, 59, 0.85)',
  surfaceOverlay: 'rgba(30, 41, 59, 0.95)',
  
  // Text
  textPrimary: '#f0f9ff',
  textSecondary: '#bfdbfe',
  textMuted: '#60a5fa',
  textInverse: '#0f172a',
  
  // Accent
  accentPrimary: '#60a5fa',
  accentSecondary: '#93c5fd',
  accentTertiary: '#bfdbfe',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  gradientSecondary: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  gradientAccent: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
  
  // Borders
  border: 'rgba(96, 165, 250, 0.2)',
  borderSubtle: 'rgba(96, 165, 250, 0.1)',
  divider: 'rgba(96, 165, 250, 0.15)',
  
  // States
  hover: 'rgba(96, 165, 250, 0.1)',
  active: 'rgba(96, 165, 250, 0.2)',
  focus: 'rgba(96, 165, 250, 0.3)',
  
  // Shadows
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
  
  // Glass
  glassBackground: 'rgba(30, 41, 59, 0.6)',
  glassBorder: 'rgba(96, 165, 250, 0.2)'
};

// Apply theme colors to ocean theme
export function getThemeColorsForOceanTheme(
  mode: ThemeMode,
  oceanTheme: OceanTheme
): ThemeColors {
  const baseTokens = mode === 'light' ? { ...lightThemeTokens } : { ...darkThemeTokens };
  const ocean = oceanThemes[oceanTheme];
  
  // Override accent colors with ocean theme colors
  baseTokens.accentPrimary = ocean.colors.primary;
  baseTokens.accentSecondary = ocean.colors.secondary;
  baseTokens.accentTertiary = ocean.colors.tertiary;
  baseTokens.gradientPrimary = ocean.colors.gradient;
  
  // Adjust gradient variants based on primary gradient
  if (mode === 'light') {
    baseTokens.gradientSecondary = `linear-gradient(135deg, ${ocean.colors.secondary} 0%, ${ocean.colors.tertiary} 100%)`;
    baseTokens.gradientAccent = `linear-gradient(135deg, ${ocean.colors.tertiary} 0%, rgba(255,255,255,0.5) 100%)`;
  } else {
    baseTokens.gradientSecondary = `linear-gradient(135deg, ${ocean.colors.primary} 0%, ${ocean.colors.secondary} 100%)`;
    baseTokens.gradientAccent = `linear-gradient(135deg, ${ocean.colors.secondary} 0%, ${ocean.colors.tertiary} 100%)`;
  }
  
  return baseTokens;
}

// Apply theme colors as CSS variables
export function applyCSSVariables(colors: ThemeColors) {
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
}

// CSS variable names for use in components
export const cssVars = {
  bgPrimary: 'var(--theme-bgPrimary)',
  bgSecondary: 'var(--theme-bgSecondary)',
  bgTertiary: 'var(--theme-bgTertiary)',
  surfaceBase: 'var(--theme-surfaceBase)',
  surfaceElevated: 'var(--theme-surfaceElevated)',
  surfaceOverlay: 'var(--theme-surfaceOverlay)',
  textPrimary: 'var(--theme-textPrimary)',
  textSecondary: 'var(--theme-textSecondary)',
  textMuted: 'var(--theme-textMuted)',
  textInverse: 'var(--theme-textInverse)',
  accentPrimary: 'var(--theme-accentPrimary)',
  accentSecondary: 'var(--theme-accentSecondary)',
  accentTertiary: 'var(--theme-accentTertiary)',
  gradientPrimary: 'var(--theme-gradientPrimary)',
  gradientSecondary: 'var(--theme-gradientSecondary)',
  gradientAccent: 'var(--theme-gradientAccent)',
  border: 'var(--theme-border)',
  borderSubtle: 'var(--theme-borderSubtle)',
  divider: 'var(--theme-divider)',
  hover: 'var(--theme-hover)',
  active: 'var(--theme-active)',
  focus: 'var(--theme-focus)',
  shadowSm: 'var(--theme-shadowSm)',
  shadowMd: 'var(--theme-shadowMd)',
  shadowLg: 'var(--theme-shadowLg)',
  glassBackground: 'var(--theme-glassBackground)',
  glassBorder: 'var(--theme-glassBorder)',
};
