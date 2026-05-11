import { createClient } from '@supabase/supabase-js';
import type { Renewal } from '@/types/renewal';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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
