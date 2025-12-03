import { useState, useEffect } from 'react';
import { checkAuthStatus } from '@/services/api';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    checkAuthStatus()
      .then((isAuthenticated) => {
        setAuthState(isAuthenticated ? 'authenticated' : 'unauthenticated');
      })
      .catch((error) => {
        console.error('Error checking auth:', error);
        setAuthState('unauthenticated');
      });
  }, []);

  return { authState };
}
