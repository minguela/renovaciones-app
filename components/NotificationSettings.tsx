import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { InlineBanner } from '@/components/ui/InlineBanner';
import { getCurrentUser, getProfile, updateProfile, sendTestNotification } from '@/lib/api-client';
import { useSemanticTheme } from '@/constants/design-tokens';
import { useToast } from '@/hooks/useToast';

export function NotificationSettings() {
  const { colors, spacing } = useSemanticTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMethod, setNotificationMethod] = useState<'telegram' | 'email' | 'whatsapp'>('telegram');
  const [savedSignature, setSavedSignature] = useState('');

  const signature = JSON.stringify({ whatsappNumber, telegramChatId, emailAddress, notificationsEnabled, notificationMethod });

  useEffect(() => {
    loadProfile();
  }, []);

  const canSendTest = useMemo(() => {
    if (!notificationsEnabled) return false;
    const destination = notificationMethod === 'telegram' ? telegramChatId : notificationMethod === 'email' ? emailAddress : whatsappNumber;
    return Boolean(destination && savedSignature === signature);
  }, [notificationsEnabled, notificationMethod, telegramChatId, emailAddress, whatsappNumber, savedSignature, signature]);

  const loadProfile = async () => {
    try {
      setError(null);
      const user = await getCurrentUser();
      if (!user) return;

      const data = await getProfile();
      if (!data) return;

      setWhatsappNumber(data.whatsapp_number || '');
      setTelegramChatId(data.telegram_chat_id || '');
      setEmailAddress(data.email_address || user.email || '');
      setNotificationsEnabled(Boolean(data.notifications_enabled));
      const method = ['telegram', 'email', 'whatsapp'].includes(data.notification_method) ? data.notification_method : 'telegram';
      setNotificationMethod(method as 'telegram' | 'email' | 'whatsapp');
      setSavedSignature(JSON.stringify({
        whatsappNumber: data.whatsapp_number || '', telegramChatId: data.telegram_chat_id || '',
        emailAddress: data.email_address || user.email || '',
        notificationsEnabled: Boolean(data.notifications_enabled), notificationMethod: method,
      }));
    } catch {
      setError('No se pudieron cargar tus ajustes de notificaciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setError('Debes iniciar sesión para guardar la configuración.');
        return;
      }

      const updates = {
        whatsapp_number: whatsappNumber || null,
        telegram_chat_id: telegramChatId || null,
        email_address: emailAddress || null,
        notifications_enabled: notificationsEnabled,
        notification_method: notificationMethod,
      };

      const { error: upsertError } = await updateProfile(updates);
      if (upsertError) throw upsertError;

      setSavedSignature(signature);
      showToast('Ajustes guardados correctamente', 'success');
    } catch (err) {
      setError(err instanceof Error ? `No se pudieron guardar los ajustes: ${err.message}` : 'No se pudieron guardar los ajustes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    setError(null);
    try {
      const result = await sendTestNotification();
      if (!result.success) throw new Error(result.error || 'Error al enviar');

      showToast('Aviso de prueba enviado', 'success');
    } catch (err) {
      setError(err instanceof Error ? `No se pudo enviar la prueba: ${err.message}` : 'No se pudo enviar la notificación de prueba.');
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
    <Card variant="form">
      <Text style={[styles.title, { color: colors.textPrimary }]}>Canales de aviso</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Activa recordatorios y define los datos de contacto que quieres usar.
      </Text>

      {error ? <InlineBanner kind="error" message={error} /> : null}

      <View style={[styles.switchRow, { marginBottom: spacing.lg }]}>
        <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Recibir recordatorios</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>

      <Text style={[styles.switchLabel, { color: colors.textPrimary, marginBottom: 8 }]}>Canal principal</Text>
      <View style={styles.channelRow}>
        {([['telegram', 'Telegram'], ['email', 'Email'], ['whatsapp', 'WhatsApp']] as const).map(([value, label]) => (
          <TouchableOpacity
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: notificationMethod === value }}
            onPress={() => setNotificationMethod(value)}
            style={[styles.channelOption, { borderColor: notificationMethod === value ? colors.textPrimary : colors.textSecondary }]}
          >
            <Text style={{ color: colors.textPrimary }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {notificationMethod === 'email' && <Field label="Email" hint="Dirección a la que llegarán los recordatorios.">
        <Input
          value={emailAddress}
          onChangeText={setEmailAddress}
          placeholder="tu@email.com"
          keyboardType="email-address"
        />
      </Field>}

      {notificationMethod === 'whatsapp' && <Field label="WhatsApp" hint="Requiere activar CallMeBot primero. Incluye prefijo internacional.">
        <Input value={whatsappNumber} onChangeText={setWhatsappNumber} placeholder="+34600111222" keyboardType="phone-pad" />
      </Field>}

      {notificationMethod === 'telegram' && <Field label="Telegram Chat ID" hint="Crea un bot con @BotFather, escribe /start al bot y copia tu Chat ID de getUpdates. El token del bot se configura en el servidor.">
        <Input value={telegramChatId} onChangeText={setTelegramChatId} placeholder="123456789" />
      </Field>}

      <Button title="Guardar ajustes" onPress={handleSave} loading={saving} />
      <View style={{ height: 10 }} />
      <Button title="Probar aviso" variant="secondary" onPress={handleSendTestNotification} disabled={!canSendTest} />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  channelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  channelOption: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
});
