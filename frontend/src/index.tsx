import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Fonction pour détecter les erreurs d'extensions
const isExtensionError = (message: string, source?: string): boolean => {
  const msg = String(message).toLowerCase();
  const src = String(source || '').toLowerCase();
  
  return (
    msg.includes('message channel closed') ||
    msg.includes('asynchronous response') ||
    msg.includes('extension context invalidated') ||
    msg.includes('a listener indicated an asynchronous response') ||
    msg.includes('listener indicated') ||
    msg.includes('message channel') ||
    src.includes('chrome-extension://') ||
    src.includes('moz-extension://') ||
    src.includes('safari-extension://') ||
    src.includes('extension://')
  );
};

// Gestionnaire d'erreurs global pour filtrer les erreurs d'extensions de navigateur
window.addEventListener('error', (event) => {
  if (isExtensionError(event.message, event.filename)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true); // Utiliser la capture pour intercepter avant les autres handlers

// Gestionnaire pour les promesses rejetées non gérées
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason || '';
  const errorString = String(errorMessage);
  
  if (isExtensionError(errorString)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true); // Utiliser la capture pour intercepter avant les autres handlers

// Intercepter console.error pour filtrer les erreurs d'extensions
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  if (!isExtensionError(message)) {
    originalConsoleError.apply(console, args);
  }
};

// Intercepter console.warn pour filtrer les avertissements d'extensions
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  if (!isExtensionError(message)) {
    originalConsoleWarn.apply(console, args);
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
