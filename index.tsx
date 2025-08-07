import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ToastContainer from './components/ToastContainer';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const Root = () => {
  const { isAuthenticated, login, logout, error, isLoading } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} error={error} isLoading={isLoading} />;
  }

  return <App isAuthenticated={isAuthenticated} onLogout={logout} />;
};


root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <Root />
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);