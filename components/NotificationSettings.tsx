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
import { supabase, type Profile } from '@/lib/supabase';

const isWeb = Platform.OS === 'web';

const AIRBNB = {
  canvas: '#f7f7f7',
  card: '#ffffff',
  carbon: '#222222',
  slate: '#6a6a6a',
  mist: '#ebebeb',
  coral: '#ff385c',
  coralDeep: '#e00b41',
};

export function NotificationSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Contact data
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [smsNumber, setSmsNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
        setWhatsappNumber(data.whatsapp_number || '');
        setTelegramChatId(data.telegram_chat_id || '');
        setSmsNumber(data.sms_number || '');
        setEmailAddress(data.email_address || user.email || '');
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
        whatsapp_number: whatsappNumber || null,
        telegram_chat_id: telegramChatId || null,
        sms_number: smsNumber || null,
        email_address: emailAddress || null,
        notifications_enabled: notificationsEnabled,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates });

      if (error) throw error;

      Alert.alert('Éxito', 'Datos de contacto guardados');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar');
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
    <Card variant="default">
      <Text style={[styles.title, { color: isWeb ? AIRBNB.carbon : '#000000' }]}>Datos de contacto</Text>
      <Text style={[styles.subtitle, { color: isWeb ? AIRBNB.slate : '#666666' }]}>
        Guarda tus datos para recibir avisos por el canal que elijas en cada renovación.
      </Text>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={[styles.label, { color: isWeb ? AIRBNB.carbon : '#3C3C43' }]}>
            Activar notificaciones
          </Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              notificationsEnabled && { backgroundColor: '#34C759' },
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
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: isWeb ? AIRBNB.slate : '#666666' }]}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isWeb ? AIRBNB.card : '#F2F2F7',
              color: isWeb ? AIRBNB.carbon : '#000000',
              borderColor: isWeb ? AIRBNB.mist : 'transparent',
              borderWidth: isWeb ? 1 : 0,
            },
          ]}
          placeholder="tu@email.com"
          placeholderTextColor={isWeb ? AIRBNB.slate : '#8E8E93'}
          value={emailAddress}
          onChangeText={setEmailAddress}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: isWeb ? AIRBNB.slate : '#666666' }]}>
          Teléfono SMS (con código de país)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isWeb ? AIRBNB.card : '#F2F2F7',
              color: isWeb ? AIRBNB.carbon : '#000000',
              borderColor: isWeb ? AIRBNB.mist : 'transparent',
              borderWidth: isWeb ? 1 : 0,
            },
          ]}
          placeholder="Ej: +346****5678"
          placeholderTextColor={isWeb ? AIRBNB.slate : '#8E8E93'}
          value={smsNumber}
          onChangeText={setSmsNumber}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: isWeb ? AIRBNB.slate : '#666666' }]}>
          WhatsApp (con código de país)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isWeb ? AIRBNB.card : '#F2F2F7',
              color: isWeb ? AIRBNB.carbon : '#000000',
              borderColor: isWeb ? AIRBNB.mist : 'transparent',
              borderWidth: isWeb ? 1 : 0,
            },
          ]}
          placeholder="Ej: +346****5678"
          placeholderTextColor={isWeb ? AIRBNB.slate : '#8E8E93'}
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          keyboardType="phone-pad"
        />
        <Text style={[styles.helpText, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>
          Para WhatsApp gratis, obtén tu API key en callmebot.com
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: isWeb ? AIRBNB.slate : '#666666' }]}>
          Chat ID de Telegram
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isWeb ? AIRBNB.card : '#F2F2F7',
              color: isWeb ? AIRBNB.carbon : '#000000',
              borderColor: isWeb ? AIRBNB.mist : 'transparent',
              borderWidth: isWeb ? 1 : 0,
            },
          ]}
          placeholder="Ej: 123456789"
          placeholderTextColor={isWeb ? AIRBNB.slate : '#8E8E93'}
          value={telegramChatId}
          onChangeText={setTelegramChatId}
        />
        <Text style={[styles.helpText, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>
          1. Crea un bot con @BotFather{'\n'}
          2. Escribe al bot{'\n'}
          3. Obtén tu chat ID desde getUpdates
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Guardar datos de contacto"
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
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: isWeb ? '#dddddd' : '#E5E5EA',
    padding: 2,
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
    borderRadius: isWeb ? 14 : 8,
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
