import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0F0F18',
              color: '#EDE0C4',
              border: '1px solid rgba(201,165,85,0.2)',
              borderRadius: '0',
              fontFamily: '"Jost", sans-serif',
              fontWeight: 400,
              fontSize: '0.85rem',
              letterSpacing: '0.03em',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            },
            success: {
              iconTheme: { primary: '#C9A555', secondary: '#0F0F18' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0F0F18' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
