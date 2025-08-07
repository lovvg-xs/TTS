import { useState, useEffect, useCallback } from 'react';
import { USERNAME, PASSWORD } from '../auth.config';

// Key for persistent authentication in localStorage
const AUTH_STORAGE_KEY = 'tts-auth-persistent';

export const useAuth = () => {
  // Check localStorage for the authentication token on initial load
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = useCallback(async (user: string, pass: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (user === USERNAME && pass === PASSWORD) {
      try {
        // Use localStorage to persist the session
        window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to save session state", e);
        setError("Login failed: Could not save session. Please enable cookies/storage.");
      }
    } else {
      setError('Invalid username or password.');
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    try {
      // Clear the persistent session from localStorage
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove session state", e)
    }
    setIsAuthenticated(false);
  }, []);
  
  // Listen for storage changes to sync logout across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // When the auth key is removed or changed in another tab, log out here as well.
      if (event.key === AUTH_STORAGE_KEY) {
        if (window.localStorage.getItem(AUTH_STORAGE_KEY) !== 'true') {
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { isAuthenticated, login, logout, error, isLoading };
};
