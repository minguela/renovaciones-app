import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useEffect, useRef } from 'react';
import { clearLegacyAuthToken, setClerkTokenProvider } from '@/lib/api-client';

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
  const authRef = useRef(auth);
  authRef.current = auth;

  useEffect(() => {
    setClerkTokenProvider(async () => {
      const current = authRef.current;
      if (!current.isLoaded || !current.isSignedIn) return undefined;
      return current.getToken();
    });
    return () => setClerkTokenProvider(null);
  }, []);

  useEffect(() => {
    if (auth.isLoaded && auth.isSignedIn) void clearLegacyAuthToken();
  }, [auth.isLoaded, auth.isSignedIn]);

  return <>{children}</>;
}

export function clerkIsConfigured() {
  return Boolean(publishableKey);
}
