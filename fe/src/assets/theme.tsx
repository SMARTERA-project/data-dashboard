import { createTheme, Theme } from '@mui/material/styles';
import { ThemeMode, ColorTokens } from '@/types/theme';
import { CssBaseline, GlobalStyles } from '@mui/material';

const FONT_FAMILY = 'Inter, sans-serif';

const colorTokens = (mode: ThemeMode): ColorTokens => ({
  primary: mode === 'light' ? '#1C5240' : '#dfa500',
  secondary: mode === 'light' ? '#6BB8AD' : '#6cb7af',
  error: mode === 'light' ? '#d32f2f' : '#F7C8D1',
  warning: mode === 'light' ? '#F07D57' : '#ffb74d',
  success: mode === 'light' ? '#388e3c' : '#66bb6a',
  info: mode === 'light' ? '#0288d1' : '#29b6f6',
  text: {
    primary: mode === 'light' ? '#000000' : '#d3d3d3',
    secondary: mode === 'light' ? '#000000' : '#bdbdbd',
    sideNavigation: mode === 'light' ? '#f0ecdf' : '#bdbdbd',
    menuItemSelected: mode === 'light' ? '#fefefd' : '#121212',
  },
  background: {
    default: mode === 'light' ? '#F7F5EC' : '#121212',
    paper: mode === 'light' ? 'white' : '#1e1e1e',
    sideNavigation: mode === 'light' ? '#165040' : '#1e1e1e',
    menuItemSelected: mode === 'light' ? '#0f382d' : '#121212',
    collapsibleMenuItemSelected: mode === 'light' ? '#eff3f2' : '#121212',
  },
});

const globalStyles = (
  <GlobalStyles
    styles={{
      '@import': [
        "url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined')",
      ],
      '.material-symbols-outlined': {
        fontFamily: "'Material Symbols Outlined'",
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontSize: '24px',
        display: 'inline-block',
        lineHeight: '1',
        letterSpacing: 'normal',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        direction: 'ltr',
        WebkitFontFeatureSettings: "'liga'",
        WebkitFontSmoothing: 'antialiased',
      },
    }}
  />
);

const getTheme = (mode: ThemeMode): Theme => {
  const colors = colorTokens(mode);

  return createTheme({
    palette: {
      mode,
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
      error: { main: colors.error },
      warning: { main: colors.warning },
      success: { main: colors.success },
      info: { main: colors.info },
      text: colors.text,
      background: colors.background,
    },
    typography: {
      fontFamily: FONT_FAMILY,
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.2,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.85rem',
        lineHeight: 1.5,
      },
      h1: {
        fontSize: '3rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 700,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
            backgroundColor: colors.background.default,
          },
          '.material-symbols-outlined': {
            fontFamily: "'Material Symbols Outlined'",
            fontWeight: 'normal',
            fontStyle: 'normal',
            fontSize: '32px',
            lineHeight: 1,
            letterSpacing: 'normal',
            textTransform: 'none',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            direction: 'ltr',
            WebkitFontFeatureSettings: '"liga"',
            WebkitFontSmoothing: 'antialiased',
          },
        },
      },
    },
  });
};

export default getTheme;
