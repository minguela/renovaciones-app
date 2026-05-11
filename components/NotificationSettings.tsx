import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase, type Profile } from '@/lib/supabase';

const isWeb = Platform.OS === 'web';

const NOTIFICATION_METHODS = [
  { value: 'none', label: 'Desactivadas', icon: 'bell.slash' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'phone.fill' },
  { value: 'telegram', label: 'Telegram', icon: 'paperplane.fill' },
  { value: 'email', label: 'Email', icon: 'envelope.fill' },
];

export function NotificationSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [method, setMethod] = useState<string>('none');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = isWeb ? '#9da7ba' : useThemeColor({ light: '#666666', dark: '#999999' }, 'text');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setMethod(data.notification_method || 'none');
        setWhatsappNumber(data.whatsapp_number || '');
        setTelegramChatId(data.telegram_chat_id || '');
        setNotificationsEnabled(data.notifications_enabled);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión');
        return;
      }

      const updates = {
        notification_method: method,
        whatsapp_number: whatsappNumber || null,
        telegram_chat_id: telegramChatId || null,
        notifications_enabled: notificationsEnabled,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates });

      if (error) throw error;

      Alert.alert('Éxito', 'Configuración guardada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'test',
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Éxito', 'Notificación de prueba enviada');
      } else {
        Alert.alert('Error', result.error || 'No se pudo enviar');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al enviar notificación');
    }
  };

  if (loading) {
    return (
      <Card>
        <ActivityIndicator />
      </Card>
    );
  }

  return (
    <Card variant={isWeb ? 'glass' : 'default'}>
      <Text style={[styles.title, { color: textColor }]}>Notificaciones</Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: secondaryTextColor }]}>Método de notificación</Text>
        <View style={styles.methodsContainer}>
          {NOTIFICATION_METHODS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.methodButton,
                method === item.value && (isWeb ? styles.methodButtonActiveWeb : styles.methodButtonActive),
              ]}
              onPress={() => setMethod(item.value)}
            >
              <Text
                style={[
                  styles.methodText,
                  method === item.value && (isWeb ? styles.methodTextActiveWeb : styles.methodTextActive),
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {method !== 'none' && (
        <>
          <View style={styles.section}>
            <Text style={[styles.label, { color: secondaryTextColor }]}>
              Activar notificaciones
            </Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                notificationsEnabled && (isWeb ? styles.toggleActiveWeb : styles.toggleActive),
              ]}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <View
                style={[
                  styles.toggleKnob,
                  notificationsEnabled && styles.toggleKnobActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {method === 'whatsapp' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: secondaryTextColor }]}>
                Número de WhatsApp (con código de país)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isWeb ? 'rgba(199, 211, 234, 0.06)' : '#F2F2F7',
                    color: textColor,
                    borderColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : 'transparent',
                    borderWidth: isWeb ? 1 : 0,
                  },
                ]}
                placeholder="Ej: +346****5678"
                placeholderTextColor={isWeb ? '#9da7ba' : '#8E8E93'}
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                keyboardType="phone-pad"
              />
              <Text style={[styles.helpText, { color: isWeb ? '#81899b' : '#8E8E93' }]}>
                Para WhatsApp gratis, obtén tu API key en callmebot.com
              </Text>
            </View>
          )}

          {method === 'telegram' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: secondaryTextColor }]}>
                Chat ID de Telegram
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isWeb ? 'rgba(199, 211, 234, 0.06)' : '#F2F2F7',
                    color: textColor,
                    borderColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : 'transparent',
                    borderWidth: isWeb ? 1 : 0,
                  },
                ]}
                placeholder="Ej: 123456789"
                placeholderTextColor={isWeb ? '#9da7ba' : '#8E8E93'}
                value={telegramChatId}
                onChangeText={setTelegramChatId}
              />
              <Text style={[styles.helpText, { color: isWeb ? '#81899b' : '#8E8E93' }]}>
                1. Crea un bot con @BotFather{'\n'}
                2. Escribe al bot{'\n'}
                3. Obtén tu chat ID desde getUpdates
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Guardar configuración"
              onPress={handleSave}
              loading={saving}
            />
            <View style={{ height: 12 }} />
            <Button
              title="Enviar notificación de prueba"
              variant="secondary"
              onPress={sendTestNotification}
            />
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: isWeb ? 999 : 8,
    backgroundColor: isWeb ? 'rgba(186, 214, 247, 0.06)' : '#F2F2F7',
    borderColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : 'transparent',
    borderWidth: isWeb ? 1 : 0,
  },
  methodButtonActive: {
    backgroundColor: '#007AFF',
  },
  methodButtonActiveWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.2)',
    borderColor: 'rgba(102, 58, 243, 0.5)',
    borderWidth: 1,
  },
  methodText: {
    fontSize: 14,
    color: isWeb ? '#d1e4fa' : '#3C3C43',
  },
  methodTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  methodTextActiveWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: isWeb ? '#2C2C2E' : '#E5E5EA',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#34C759',
  },
  toggleActiveWeb: {
    backgroundColor: '#663af3',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: isWeb ? 4 : 8,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
