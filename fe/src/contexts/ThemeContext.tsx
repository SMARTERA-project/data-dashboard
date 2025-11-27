import { createContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import getTheme from '../assets/theme';
import { ThemeMode, ThemeContextType } from '@/types/theme';

const LOCAL_STORAGE_KEY = 'themeMode';

export const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: () => {},
  themeMode: 'light',
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    () => (localStorage.getItem(LOCAL_STORAGE_KEY) as ThemeMode) || 'light'
  );

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, themeMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
