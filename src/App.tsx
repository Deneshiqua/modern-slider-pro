import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import DemoPage from './pages/Demo';
import DocsPage from './pages/Docs';
import EditorPage from './pages/Editor';
import Index from './pages/Index';
import { LanguageProvider } from '@/context/LanguageContext';
import NotFound from './pages/NotFound';
import { PublishedSlidesProvider } from '@/context/PublishedSlidesContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PublishedSlidesProvider>
      <ThemeProvider storageKey="msp-theme" useSystemTheme attachThemeClassToHtml>
        <LanguageProvider storageKey="msp-language">
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </PublishedSlidesProvider>
  </QueryClientProvider>
);

export default App;