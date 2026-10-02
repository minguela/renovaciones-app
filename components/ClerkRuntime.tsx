import { ClerkProvider, useAuth, useClerk } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useEffect, useRef } from 'react';
import { setClerkSignOutHandler, setClerkTokenProvider } from '@/lib/api-client';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || '';

export function ClerkRuntime({ children }: { children: React.ReactNode }) {
  if (!publishableKey) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkTokenBridge>{children}</ClerkTokenBridge>
    </ClerkProvider>
  );
}

function ClerkTokenBridge({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const clerk = useClerk();
  const authRef = useRef(auth);
  const clerkRef = useRef(clerk);
  authRef.current = auth;
  clerkRef.current = clerk;

  useEffect(() => {
    setClerkTokenProvider(async () => {
      const current = authRef.current;
      if (!current.isLoaded || !current.isSignedIn) return undefined;
      return current.getToken();
    });
    setClerkSignOutHandler(async () => {
      const current = authRef.current;
      if (current.isLoaded && current.isSignedIn) await clerkRef.current.signOut();
    });
    return () => {
      setClerkTokenProvider(null);
      setClerkSignOutHandler(null);
    };
  }, []);

  return <>{children}</>;
}

export function clerkIsConfigured() {
  return Boolean(publishableKey);
}
