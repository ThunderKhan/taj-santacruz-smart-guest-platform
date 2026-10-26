import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PrototypeRibbon } from './components/PrototypeRibbon';
import { RequestsProvider } from './store/RequestsProvider';
import { AuthProvider } from './store/AuthProvider';
import { Toaster } from './components/ui/Toaster';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RequestsProvider>
        <AuthProvider>
          <PrototypeRibbon />
          <App />
          <Toaster />
        </AuthProvider>
      </RequestsProvider>
    </BrowserRouter>
  </StrictMode>,
);
