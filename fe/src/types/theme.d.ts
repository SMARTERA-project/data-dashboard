export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  toggleTheme: () => void;
  themeMode: ThemeMode;
}

export interface ColorTokens {
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    sideNavigation: string;
    menuItemSelected: string;
  };
  background: {
    default: string;
    paper: string;
    sideNavigation: string;
    menuItemSelected: string;
    collapsibleMenuItemSelected: string;
  };
}
