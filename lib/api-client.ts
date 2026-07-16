// API client for RenovacionesApp — replaces Supabase with Neon-backed API routes
// Works on both web (fetch) and native (fetch)

const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

// Token storage abstraction (works with AsyncStorage on native, localStorage on web)
let tokenStore: { getToken: () => Promise<string | null>; setToken: (t: string | null) => Promise<void> } | null = null;

export function setTokenStore(store: { getToken: () => Promise<string | null>; setToken: (t: string | null) => Promise<void> }) {
  tokenStore = store;
}

async function getToken(): Promise<string | null> {
  if (!tokenStore) {
    // Fallback to localStorage for web
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
  return tokenStore.getToken();
}

async function setToken(token: string | null) {
  if (!tokenStore) {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('auth_token', token);
      else localStorage.removeItem('auth_token');
    }
    return;
  }
  return tokenStore.setToken(token);
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE}/api/${path}`;
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

// ── Types ──
export interface User {
  id: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  email?: string;
  whatsapp_number?: string;
  telegram_chat_id?: string;
  sms_number?: string;
  email_address?: string;
  notifications_enabled: boolean;
  notification_method: string;
  created_at: string;
  updated_at: string;
}

export interface Renewal {
  id: string;
  userId?: string;
  name: string;
  type: string;
  frequency: string;
  cost: number;
  currency: string;
  renewalDate: string;
  provider?: string;
  notes?: string;
  color?: string;
  icon?: string;
  notificationEnabled: boolean;
  notificationDaysBefore: number;
  status?: string;
  paymentMethod?: string;
  bankAccount?: string;
  tags?: string[];
  autoRenew?: boolean;
  contractEndDate?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RenewalHistory {
  id: string;
  renewalId: string;
  oldCost: number;
  newCost: number;
  oldFrequency: string;
  newFrequency: string;
  changedAt: string;
}

export interface UserCatalog {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  options: any[];
  createdAt: string;
  updatedAt: string;
}

// ── Auth ──
export async function signUp(email: string, password: string): Promise<{ data: { user: User } | null; error: Error | null }> {
  try {
    const data = await apiFetch('auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setToken(data.token);
    return { data: { user: data.user }, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function signIn(email: string, password: string): Promise<{ data: { user: User } | null; error: Error | null }> {
  try {
    const data = await apiFetch('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setToken(data.token);
    return { data: { user: data.user }, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    await setToken(null);
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch('auth/me');
  } catch {
    return null;
  }
}

// ── Google OAuth ──
// Web: redirects to Google, callback returns token in URL
// Native: opens auth session via expo-auth-session

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://renovaciones.dminguela.es';

export async function signInWithGoogle(): Promise<{ data: any; error: Error | null }> {
  try {
    // Web flow: redirect to Google
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const redirectUri = `${SITE_URL}/api/auth/google/callback`;
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&access_type=offline` +
        `&prompt=consent`;
      window.location.href = googleUrl;
      return { data: null, error: null }; // Page will redirect — no result to return
    }

    // Native: use API-based flow with code
    const data = await apiFetch('auth/google', {
      method: 'POST',
      body: JSON.stringify({ code: 'native_flow_placeholder' }),
    });
    await setToken(data.token);
    return { data: { user: data.user }, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// Check URL for OAuth callback token on page load
export function handleOAuthCallback(): { token: string } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('auth_token', token);
    // Clean URL
    window.history.replaceState(null, '', window.location.pathname);
    return { token };
  }
  return null;
}

// ── Renewals ──
export async function getRenewals(): Promise<Renewal[]> {
  try {
    return await apiFetch('renewals');
  } catch {
    return [];
  }
}

export async function addRenewal(renewal: Renewal): Promise<{ data: any; error: Error | null }> {
  try {
    const data = await apiFetch('renewals', {
      method: 'POST',
      body: JSON.stringify(renewal),
    });
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function updateRenewal(renewal: Renewal): Promise<{ data: any; error: Error | null }> {
  try {
    const data = await apiFetch('renewals', {
      method: 'PUT',
      body: JSON.stringify(renewal),
    });
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function deleteRenewal(id: string): Promise<{ error: Error | null }> {
  try {
    await apiFetch('renewals', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

// ── Profile ──
export async function getProfile(): Promise<Profile | null> {
  try {
    return await apiFetch('profiles');
  } catch {
    return null;
  }
}

export async function updateProfile(updates: Partial<Profile>): Promise<{ data: any; error: Error | null }> {
  try {
    const data = await apiFetch('profiles', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// ── Catalogs ──
export async function getCatalogs(): Promise<UserCatalog[]> {
  try {
    return await apiFetch('catalogs');
  } catch {
    return [];
  }
}

export async function addCatalog(catalog: Omit<UserCatalog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ data: any; error: Error | null }> {
  try {
    const data = await apiFetch('catalogs', {
      method: 'POST',
      body: JSON.stringify(catalog),
    });
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function updateCatalog(id: string, updates: Partial<UserCatalog>): Promise<{ data: any; error: Error | null }> {
  try {
    const data = await apiFetch('catalogs', {
      method: 'PUT',
      body: JSON.stringify({ ...updates, id }),
    });
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function deleteCatalog(id: string): Promise<{ error: Error | null }> {
  try {
    await apiFetch('catalogs', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

// ── History ──
export async function getRenewalHistory(renewalId: string): Promise<RenewalHistory[]> {
  try {
    return await apiFetch(`history?renewalId=${renewalId}`);
  } catch {
    return [];
  }
}

export async function addRenewalHistory(history: { renewalId: string; oldCost: number; newCost: number; oldFrequency: string; newFrequency: string }): Promise<{ data: any; error: Error | null }> {
  try {
    const data = await apiFetch('history', {
      method: 'POST',
      body: JSON.stringify(history),
    });
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// ── Attachments (data URLs inline) ──
// Files are stored as base64 data URLs in the renewals JSONB `attachments` array.
// Max 2MB per file, max 5 files. No external storage needed.
export async function uploadAttachment(userId: string, renewalId: string, file: File | Blob, fileName: string): Promise<{ data: string | null; error: Error | null }> {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return { data: base64, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function getAttachmentUrl(dataUrl: string): Promise<string> {
  return dataUrl; // Already a data URL
}

export async function deleteAttachment(path: string): Promise<{ data: null; error: null }> {
  // Attachments are stored inline; no server-side deletion needed
  return { data: null, error: null };
}

// ── Auth helpers for hooks ──
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  // Simple polling-based auth state change (replaces Supabase realtime)
  let currentUser: User | null = null;
  let running = true;

  async function check() {
    if (!running) return;
    try {
      const user = await getCurrentUser();
      if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
        currentUser = user;
        callback(user);
      }
    } catch {}
    if (running) setTimeout(check, 5000);
  }

  check();
  return () => { running = false; };
}
