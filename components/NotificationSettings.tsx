import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { InlineBanner } from '@/components/ui/InlineBanner';
import { getCurrentUser, getProfile, updateProfile } from '@/lib/api-client';
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
  const [smsNumber, setSmsNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const canSendTest = useMemo(() => {
    if (!notificationsEnabled) return false;
    return Boolean(emailAddress || smsNumber || whatsappNumber || telegramChatId);
  }, [notificationsEnabled, emailAddress, smsNumber, whatsappNumber, telegramChatId]);

  const loadProfile = async () => {
    try {
      setError(null);
      const user = await getCurrentUser();
      if (!user) return;

      const data = await getProfile();
      if (!data) return;

      setWhatsappNumber(data.whatsapp_number || '');
      setTelegramChatId(data.telegram_chat_id || '');
      setSmsNumber(data.sms_number || '');
      setEmailAddress(data.email_address || user.email || '');
      setNotificationsEnabled(Boolean(data.notifications_enabled));
    } catch (err) {
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
        sms_number: smsNumber || null,
        email_address: emailAddress || null,
        notifications_enabled: notificationsEnabled,
      };

      const { error: upsertError } = await updateProfile(updates);
      if (upsertError) throw upsertError;

      showToast('Ajustes guardados correctamente', 'success');
    } catch (err) {
      setError('No se pudieron guardar los ajustes. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    setError(null);
    try {
      const user = await getCurrentUser();
      if (!user) return;
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        setError('Debes iniciar sesión para enviar una prueba.');
        return;
      }

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'test' }),
      });
      const result = await response.json();
      if (response.status >= 400) throw new Error(result.error || 'Error al enviar');

      showToast('Aviso de prueba enviado', 'success');
    } catch (err) {
      setError('No se pudo enviar la notificación de prueba.');
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

      <Field label="Email" hint="Canal recomendado para avisos estándar.">
        <Input
          value={emailAddress}
          onChangeText={setEmailAddress}
          placeholder="tu@email.com"
          keyboardType="email-address"
        />
      </Field>

      <Field label="Teléfono SMS" hint="Incluye prefijo internacional. Ej: +34600111222">
        <Input value={smsNumber} onChangeText={setSmsNumber} placeholder="+34600111222" keyboardType="phone-pad" />
      </Field>

      <Field label="WhatsApp" hint="Incluye prefijo internacional.">
        <Input value={whatsappNumber} onChangeText={setWhatsappNumber} placeholder="+34600111222" keyboardType="phone-pad" />
      </Field>

      <Field label="Telegram Chat ID" hint="Ejemplo: 123456789">
        <Input value={telegramChatId} onChangeText={setTelegramChatId} placeholder="123456789" />
      </Field>

      <Button title="Guardar ajustes" onPress={handleSave} loading={saving} />
      <View style={{ height: 10 }} />
      <Button title="Probar aviso" variant="secondary" onPress={sendTestNotification} disabled={!canSendTest} />
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
});
