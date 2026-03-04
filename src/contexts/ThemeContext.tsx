import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'calm' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'candy';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = {
  calm: {
    name: 'Sunny Warm',
    light: {
      primary: '30 90% 55%',
      secondary: '50 80% 70%',
      accent: '350 80% 65%',
    },
    dark: {
      primary: '30 85% 52%',
      secondary: '50 70% 50%',
      accent: '350 70% 58%',
    }
  },
  ocean: {
    name: 'Tropical Blue',
    light: {
      primary: '200 80% 55%',
      secondary: '45 85% 65%',
      accent: '15 85% 60%',
    },
    dark: {
      primary: '200 70% 50%',
      secondary: '45 75% 55%',
      accent: '15 75% 55%',
    }
  },
  forest: {
    name: 'Spring Green',
    light: {
      primary: '120 65% 50%',
      secondary: '50 80% 65%',
      accent: '15 80% 60%',
    },
    dark: {
      primary: '120 55% 45%',
      secondary: '50 70% 55%',
      accent: '15 70% 55%',
    }
  },
  sunset: {
    name: 'Sunset Blaze',
    light: {
      primary: '15 90% 55%',
      secondary: '350 80% 65%',
      accent: '45 90% 60%',
    },
    dark: {
      primary: '15 85% 50%',
      secondary: '350 70% 58%',
      accent: '45 80% 55%',
    }
  },
  midnight: {
    name: 'Berry Bright',
    light: {
      primary: '340 75% 55%',
      secondary: '30 85% 65%',
      accent: '50 85% 60%',
    },
    dark: {
      primary: '340 65% 50%',
      secondary: '30 75% 55%',
      accent: '50 75% 55%',
    }
  },
  candy: {
    name: 'Candy Pop',
    light: {
      primary: '350 85% 60%',
      secondary: '45 90% 65%',
      accent: '25 90% 60%',
    },
    dark: {
      primary: '350 75% 55%',
      secondary: '45 80% 55%',
      accent: '25 80% 55%',
    }
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'calm';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('app-dark-mode');
    return saved === 'true' || false;
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    const root = document.documentElement;
    const colors = themes[theme][isDark ? 'dark' : 'light'];
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    
    // Update gradients
    root.style.setProperty(
      '--gradient-hero',
      `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.secondary}))`
    );
    root.style.setProperty(
      '--gradient-calm',
      `linear-gradient(135deg, hsl(${colors.primary} / 0.1), hsl(${colors.secondary} / 0.1))`
    );
  }, [theme, isDark]);

  useEffect(() => {
    localStorage.setItem('app-dark-mode', isDark.toString());
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
