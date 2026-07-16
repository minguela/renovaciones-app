import { useState, useEffect, useCallback } from 'react';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  signInWithGoogle as apiSignInWithGoogle,
  getCurrentUser,
  onAuthStateChange,
  type User,
} from '@/lib/api-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authProcessing, setAuthProcessing] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getCurrentUser().then((u) => {
      if (!mounted) return;
      setUser(u);
      setLoading(false);
    });

    const unsubscribe = onAuthStateChange((u) => {
      if (!mounted) return;
      setUser(u);
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      const { error } = await apiSignIn(email, password);
      if (error) {
        setAuthError(error.message);
      } else {
        const u = await getCurrentUser();
        setUser(u);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      const { error } = await apiSignUp(email, password);
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMessage('Cuenta creada correctamente');
        const u = await getCurrentUser();
        setUser(u);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      await apiSignOut();
      setUser(null);
    } catch (err: any) {
      setAuthError(err?.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    setAuthProcessing(true);
    try {
      const { error } = await apiSignInWithGoogle();
      if (error) {
        setAuthError(error.message);
      }
      // On web, page will redirect — no need to set user
      // On native, token is stored and user will be picked up by polling
    } catch (err: any) {
      setAuthError(err?.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
      setAuthProcessing(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setAuthError('Apple Sign-In ya no está disponible. Usa email/contraseña.');
  }, []);

  return {
    user,
    session: user ? { user } : null, // compatibility
    loading,
    authProcessing,
    isAuthenticated: !!user,
    authMessage,
    authError,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
  };
}
