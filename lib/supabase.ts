import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Renewal } from '@/types/renewal';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  whatsapp_number?: string;
  telegram_chat_id?: string;
  notifications_enabled: boolean;
  notification_method: 'whatsapp' | 'telegram' | 'email' | 'none';
  created_at: string;
  updated_at: string;
}

// Auth helpers
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signInWithApple() {
  if (Platform.OS === 'web') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : '' },
    });
    return { data, error };
  }

  // Native iOS: for true native Sign in with Apple, install expo-apple-authentication
  // and use supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: 'renovacionesapp://', skipBrowserRedirect: true },
  });

  if (error) return { data, error };

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, 'renovacionesapp://');
    if (result.type === 'success' && 'url' in result) {
      await supabase.auth.getSession();
    }
  }

  return { data, error };
}

export async function signInWithGoogle() {
  const redirectTo = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.location.origin : '')
    : 'renovacionesapp://';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
  });

  if (error) return { data, error };

  if (Platform.OS !== 'web' && data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success' && 'url' in result) {
      await supabase.auth.getSession();
    }
  }

  return { data, error };
}

// Renewals CRUD
export async function getRenewals(userId: string): Promise<Renewal[]> {
  const { data, error } = await supabase
    .from('renewals')
    .select('*')
    .eq('user_id', userId)
    .order('renewal_date', { ascending: true });

  if (error) {
    console.error('Error fetching renewals:', error);
    return [];
  }

  // Map database fields to app types
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    frequency: item.frequency,
    cost: item.cost,
    currency: item.currency,
    renewalDate: item.renewal_date,
    provider: item.provider,
    notes: item.notes,
    color: item.color,
    icon: item.icon,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    notificationEnabled: item.notification_enabled,
    notificationDaysBefore: item.notification_days_before,
    status: item.status,
    paymentMethod: item.payment_method,
    bankAccount: item.bank_account,
    tags: item.tags || [],
    autoRenew: item.auto_renew,
    contractEndDate: item.contract_end_date,
  }));
}

export async function addRenewal(userId: string, renewal: Renewal) {
  const { data, error } = await supabase
    .from('renewals')
    .insert([{
      id: renewal.id,
      user_id: userId,
      name: renewal.name,
      type: renewal.type,
      frequency: renewal.frequency,
      cost: renewal.cost,
      currency: renewal.currency,
      renewal_date: renewal.renewalDate,
      provider: renewal.provider,
      notes: renewal.notes,
      color: renewal.color,
      icon: renewal.icon,
      notification_enabled: renewal.notificationEnabled,
      notification_days_before: renewal.notificationDaysBefore,
      status: renewal.status,
      payment_method: renewal.paymentMethod,
      bank_account: renewal.bankAccount,
      tags: renewal.tags,
      auto_renew: renewal.autoRenew,
      contract_end_date: renewal.contractEndDate,
    }])
    .select()
    .single();

  return { data, error };
}

export async function updateRenewal(userId: string, renewal: Renewal) {
  const { data, error } = await supabase
    .from('renewals')
    .update({
      name: renewal.name,
      type: renewal.type,
      frequency: renewal.frequency,
      cost: renewal.cost,
      currency: renewal.currency,
      renewal_date: renewal.renewalDate,
      provider: renewal.provider,
      notes: renewal.notes,
      color: renewal.color,
      icon: renewal.icon,
      notification_enabled: renewal.notificationEnabled,
      notification_days_before: renewal.notificationDaysBefore,
      status: renewal.status,
      payment_method: renewal.paymentMethod,
      bank_account: renewal.bankAccount,
      tags: renewal.tags,
      auto_renew: renewal.autoRenew,
      contract_end_date: renewal.contractEndDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', renewal.id)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

export async function deleteRenewal(userId: string, renewalId: string) {
  const { error } = await supabase
    .from('renewals')
    .delete()
    .eq('id', renewalId)
    .eq('user_id', userId);

  return { error };
}

// Profile management
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}
