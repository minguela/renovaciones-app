import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  signIn as sbSignIn,
  signUp as sbSignUp,
  signOut as sbSignOut,
  signInWithGoogle as sbSignInWithGoogle,
  signInWithApple as sbSignInWithApple,
} from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        setAuthError(null);
      }
      if (event === 'SIGNED_OUT') {
        setAuthMessage(null);
        setAuthError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      const { error } = await sbSignIn(email, password);
      if (error) {
        setAuthError(error.message);
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
      const { error } = await sbSignUp(email, password);
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMessage('Revisa tu email para confirmar');
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
      const { error } = await sbSignOut();
      if (error) {
        setAuthError(error.message);
      }
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
    try {
      const { error } = await sbSignInWithGoogle();
      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
      // En web puede redirigir; en nativo continúa aquí
    } catch (err: any) {
      setAuthError(err?.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      const { error } = await sbSignInWithApple();
      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Error al iniciar sesión con Apple');
      setLoading(false);
    }
  }, []);

  return {
    user,
    session,
    loading,
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
