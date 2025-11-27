import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { ThemeProvider } from '@contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import 'leaflet/dist/leaflet.css';
import '@/assets/styles/leaflet-tweaks.css';

const fontLink = document.createElement('link');
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
