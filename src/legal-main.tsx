import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LegalPage } from './components/LegalPage';
import './index.css';

createRoot(document.getElementById('legal-root')!).render(
  <StrictMode>
    <LegalPage />
  </StrictMode>
);
