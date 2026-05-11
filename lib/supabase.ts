import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Renewal, RenewalHistory } from '@/types/renewal';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grgmuqaigqgrbjvzjecn.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

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

  if (Platform.OS === 'web' && data?.url) {
    // Fallback: if Supabase didn't auto-redirect, do it manually
    if (typeof window !== 'undefined' && window.location.href === data.url) {
      return { data, error };
    }
    // If we're still here and have a URL, redirect manually
    if (typeof window !== 'undefined' && data.url) {
      window.location.href = data.url;
    }
  }

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
    attachments: item.attachments || [],
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
      attachments: renewal.attachments || [],
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
      attachments: renewal.attachments || [],
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

// Storage helpers for attachments
const ATTACHMENTS_BUCKET = 'attachments';

export async function uploadAttachment(userId: string, renewalId: string, file: File | Blob, fileName: string) {
  const path = `${userId}/${renewalId}/${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading attachment:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export function getAttachmentUrl(path: string) {
  const { data } = supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .getPublicUrl(path);

  return data?.publicUrl || '';
}

export async function deleteAttachment(path: string) {
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error deleting attachment:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// Renewal history CRUD
export async function getRenewalHistory(renewalId: string): Promise<RenewalHistory[]> {
  const { data, error } = await supabase
    .from('renewal_history')
    .select('*')
    .eq('renewal_id', renewalId)
    .order('changed_at', { ascending: false });

  if (error) {
    console.error('Error fetching renewal history:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    renewalId: item.renewal_id,
    oldCost: item.old_cost,
    newCost: item.new_cost,
    oldFrequency: item.old_frequency,
    newFrequency: item.new_frequency,
    changedAt: item.changed_at,
  }));
}

export async function addRenewalHistory(history: Omit<RenewalHistory, 'id' | 'changedAt'>) {
  const { data, error } = await supabase
    .from('renewal_history')
    .insert([{
      renewal_id: history.renewalId,
      old_cost: history.oldCost,
      new_cost: history.newCost,
      old_frequency: history.oldFrequency,
      new_frequency: history.newFrequency,
    }])
    .select()
    .single();

  return { data, error };
}

export async function deleteRenewalHistory(renewalId: string, historyId: string) {
  const { error } = await supabase
    .from('renewal_history')
    .delete()
    .eq('id', historyId)
    .eq('renewal_id', renewalId);

  return { error };
}
