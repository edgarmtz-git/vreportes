import { useState, useCallback } from 'react';

interface User {
  uid: number;
  name: string;
  username: string;
  partner_display_name: string;
  company_id: number;
  partner_id: number;
  server_version: string;
  db: string;
  is_admin: boolean;
  is_system: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data;
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true, user };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message || 'Error de autenticación',
        }));
        return { success: false, error: result.message };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión con el servidor';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const checkAuth = useCallback(() => {
    const user = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (user && isAuthenticated) {
      try {
        const parsedUser = JSON.parse(user);
        setAuthState({
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } catch (error) {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }

    return false;
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
