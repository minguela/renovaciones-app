import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AIRBNB } from '@/constants/airbnb-colors';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CatalogPicker } from '@/components/CatalogPicker';
import { AttachmentsUploader } from '@/components/AttachmentsUploader';
import { useRenewals } from '@/hooks/useRenewals';
import { useAuth } from '@/hooks/useAuth';
import { useCustomCatalogs } from '@/hooks/useCustomCatalogs';
import { CatalogCategory } from '@/types/catalog';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  type Renewal,
  type RenewalFormData,
  type RenewalHistory,
  RENEWAL_TYPES,
  RENEWAL_FREQUENCIES,
  CURRENCY_OPTIONS,
  COLORS,
  STATUS_OPTIONS,
  PAYMENT_METHODS,
  TAG_OPTIONS,
  NOTIFICATION_METHODS,
  generateId,
  formatCurrency,
} from '@/types/renewal';

const isWeb = Platform.OS === 'web';

function WebDateInput({
  value,
  onChange,
  minimumDate,
  placeholder,
}: {
  value?: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  placeholder?: string;
}) {
  const dateString = value ? value.toISOString().split('T')[0] : '';
  return (
    <View
      style={{
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: AIRBNB.mist,
        backgroundColor: AIRBNB.card,
        justifyContent: 'center',
        paddingHorizontal: 12,
      }}
    >
      {(React as any).createElement('input', {
        type: 'date',
        value: dateString,
        placeholder: placeholder,
        min: minimumDate ? minimumDate.toISOString().split('T')[0] : undefined,
        onChange: (e: any) => {
          if (e.target.value) {
            onChange(new Date(e.target.value));
          }
        },
        style: {
          border: 'none',
          background: 'transparent',
          fontSize: 16,
          color: AIRBNB.carbon,
          width: '100%',
          fontFamily: 'inherit',
          outline: 'none',
          height: '100%',
        },
      })}
    </View>
  );
}

export default function RenewalFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? 'new';
  const isEditing = id !== 'new';
  const { user } = useAuth();
  const { addRenewal, updateRenewal, deleteRenewal, getRenewalById, getHistoryForRenewal } = useRenewals(user?.id);
  const { catalogs: customCatalogs, addCatalog: addCustomCatalog } = useCustomCatalogs(user?.id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContractEndDatePicker, setShowContractEndDatePicker] = useState(false);
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [history, setHistory] = useState<RenewalHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previousRenewal, setPreviousRenewal] = useState<Renewal | null>(null);

  const backgroundColor = isWeb
    ? AIRBNB.canvas
    : useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

  const [formData, setFormData] = useState<RenewalFormData>({
    name: '',
    type: 'subscription',
    frequency: 'monthly',
    cost: '',
    currency: 'EUR',
    renewalDate: undefined,
    provider: '',
    notes: '',
    color: COLORS[0],
    icon: 'creditcard.fill',
    notificationEnabled: true,
    notificationDaysBefore: 7,
    status: 'active',
    autoRenew: true,
    paymentMethod: undefined,
    bankAccount: '',
    tags: [],
    contractEndDate: undefined,
    attachments: [],
    notificationMethod: 'push',
  });

  useEffect(() => {
    if (isEditing) {
      loadRenewal();
    }
  }, [id]);

  // Set default renewal date after mount to avoid hydration mismatch
  useEffect(() => {
    if (!isEditing) {
      setFormData(prev => ({ ...prev, renewalDate: new Date() }));
    }
  }, []);

  const loadRenewal = async () => {
    setLoading(true);
    const renewal = await getRenewalById(id);
    if (renewal) {
      setPreviousRenewal(renewal);
      setFormData({
        name: renewal.name,
        type: renewal.type,
        frequency: renewal.frequency,
        cost: renewal.cost.toString(),
        currency: renewal.currency,
        renewalDate: new Date(renewal.renewalDate),
        provider: renewal.provider || '',
        notes: renewal.notes || '',
        color: renewal.color || COLORS[0],
        icon: renewal.icon || 'creditcard.fill',
        notificationEnabled: renewal.notificationEnabled,
        notificationDaysBefore: renewal.notificationDaysBefore,
        status: renewal.status || 'active',
        autoRenew: renewal.autoRenew ?? true,
        paymentMethod: renewal.paymentMethod,
        bankAccount: renewal.bankAccount || '',
        tags: renewal.tags || [],
        contractEndDate: renewal.contractEndDate ? new Date(renewal.contractEndDate) : undefined,
        attachments: renewal.attachments || [],
        notificationMethod: renewal.notificationMethod || 'push',
      });
      // Load history
      setHistoryLoading(true);
      const hist = await getHistoryForRenewal(renewal.id);
      setHistory(hist);
      setHistoryLoading(false);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!formData.cost || isNaN(parseFloat(formData.cost))) {
      Alert.alert('Error', 'El coste debe ser un número válido');
      return;
    }

    setSaving(true);

    const renewalData: Renewal = {
      id: isEditing ? id : generateId(),
      name: formData.name.trim(),
      type: formData.type,
      frequency: formData.frequency,
      cost: parseFloat(formData.cost),
      currency: formData.currency,
      renewalDate: formData.renewalDate?.toISOString() || new Date().toISOString(),
      provider: formData.provider?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      color: formData.color,
      icon: formData.icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notificationEnabled: formData.notificationEnabled,
      notificationDaysBefore: formData.notificationDaysBefore,
      status: formData.status || 'active',
      autoRenew: formData.autoRenew ?? true,
      paymentMethod: formData.paymentMethod,
      bankAccount: formData.bankAccount?.trim() || undefined,
      tags: formData.tags || [],
      contractEndDate: formData.contractEndDate?.toISOString(),
      attachments: formData.attachments || [],
      notificationMethod: formData.notificationMethod || 'push',
    };

    const success = isEditing
      ? await updateRenewal(renewalData, previousRenewal || undefined)
      : await addRenewal(renewalData);

    setSaving(false);

    if (success) {
      router.back();
    } else {
      Alert.alert('Error', 'No se pudo guardar la renovación');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar renovación',
      '¿Estás seguro de que quieres eliminar esta renovación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRenewal(id);
            if (success) {
              router.back();
            } else {
              Alert.alert('Error', 'No se pudo eliminar la renovación');
            }
          },
        },
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, renewalDate: selectedDate }));
    }
  };

  const onContractEndDateChange = (event: any, selectedDate?: Date) => {
    setShowContractEndDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, contractEndDate: selectedDate }));
    }
  };

  const updateFormData = <K extends keyof RenewalFormData>(
    key: K,
    value: RenewalFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCatalogSelect = (data: {
    name: string;
    type: RenewalFormData['type'];
    frequency: RenewalFormData['frequency'];
    cost: string;
    provider: string;
    icon: string;
    color?: string;
    currency?: string;
  }) => {
    console.log('[Catalog] selected:', data);
    setFormData(prev => ({
      ...prev,
      name: data.name,
      type: data.type,
      frequency: data.frequency,
      cost: data.cost,
      provider: data.provider,
      icon: data.icon,
      color: data.color || prev.color,
      currency: data.currency || prev.currency,
    }));
    setCatalogVisible(false);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const sectionTitleStyle = isWeb
    ? { color: AIRBNB.carbon, fontWeight: '600' as const, fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: 0.5 }
    : { color: '#8E8E93', fontWeight: '600' as const, fontSize: 13, textTransform: 'uppercase' as const };

  const labelStyle = isWeb
    ? { color: AIRBNB.carbon, fontWeight: '500' as const, fontSize: 14 }
    : { color: '#3C3C43', fontWeight: '500' as const, fontSize: 14 };

  const pillUnselectedBg = isWeb ? AIRBNB.canvas : '#F2F2F7';
  const pillSelectedBg = isWeb ? AIRBNB.carbon : '#007AFF';
  const pillSelectedText = isWeb ? '#FFFFFF' : '#FFFFFF';
  const pillUnselectedText = isWeb ? AIRBNB.carbon : '#3C3C43';
  const pillUnselectedBorder = isWeb ? AIRBNB.mist : 'transparent';

  return (
    <SafeAreaView style={[styles.container, isWeb && { backgroundColor: AIRBNB.canvas }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={[styles.customHeader, isWeb && styles.customHeaderWeb]}>
        <View style={styles.customHeaderInner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.customHeaderBtn} hitSlop={8}>
            <Text style={styles.customHeaderBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.customHeaderTitle} numberOfLines={1}>
            {isEditing ? 'Editar Renovación' : 'Nueva Renovación'}
          </Text>
          <View style={styles.customHeaderSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isWeb ? styles.webScrollContent : undefined}
      >
        {/* Información básica */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Información básica</Text>

          {!isEditing && (
            <TouchableOpacity
              style={[styles.catalogButton, isWeb && { backgroundColor: AIRBNB.card, borderColor: AIRBNB.mist }]}
              onPress={() => setCatalogVisible(true)}
              activeOpacity={0.7}
            >
              <IconSymbol name="magnifyingglass" size={18} color={isWeb ? AIRBNB.carbon : '#007AFF'} />
              <Text style={[styles.catalogButtonText, { color: isWeb ? AIRBNB.carbon : '#007AFF' }]}>
                Elegir del catálogo
              </Text>
            </TouchableOpacity>
          )}

          <Input
            label="Nombre *"
            placeholder="Ej: Seguro de coche"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            style={styles.input}
          />

          <Input
            label="Proveedor"
            placeholder="Ej: Mapfre"
            value={formData.provider}
            onChangeText={(text) => updateFormData('provider', text)}
            style={styles.input}
          />

          <View style={styles.row}>
            <Input
              label="Coste *"
              placeholder="0.00"
              value={formData.cost}
              onChangeText={(text) => updateFormData('cost', text)}
              keyboardType="numeric"
              style={[styles.input, { flex: 1 }]}
            />

            <View style={[styles.pickerContainer, { flex: 1, marginLeft: 12 }]}>
              <Text style={[styles.label, labelStyle]}>Moneda</Text>
              <View style={[styles.picker, { backgroundColor: pillUnselectedBg, borderWidth: isWeb ? 1 : 0, borderColor: isWeb ? AIRBNB.mist : 'transparent' }]}>
                {CURRENCY_OPTIONS.map((currency) => (
                  <TouchableOpacity
                    key={currency.value}
                    style={[
                      styles.currencyOption,
                      formData.currency === currency.value && { backgroundColor: pillSelectedBg },
                    ]}
                    onPress={() => updateFormData('currency', currency.value)}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        { color: formData.currency === currency.value ? pillSelectedText : pillUnselectedText },
                      ]}
                    >
                      {currency.symbol}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Tipo y frecuencia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Tipo y frecuencia</Text>

          <Text style={[styles.label, labelStyle]}>Tipo</Text>
          <View style={styles.optionsRow}>
            {RENEWAL_TYPES.map((type) => {
              const selected = formData.type === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    { backgroundColor: selected ? pillSelectedBg : pillUnselectedBg, borderColor: selected ? AIRBNB.carbon : pillUnselectedBorder, borderWidth: 1 },
                  ]}
                  onPress={() => {
                    updateFormData('type', type.value);
                    updateFormData('icon', type.icon);
                  }}
                >
                  <IconSymbol
                    name={type.icon as any}
                    size={20}
                    color={selected ? '#FFFFFF' : isWeb ? AIRBNB.slate : '#8E8E93'}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: selected ? '#FFFFFF' : pillUnselectedText, fontWeight: selected ? '600' : '400' },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 16 }, labelStyle]}>Frecuencia</Text>
          <View style={[styles.picker, { backgroundColor: pillUnselectedBg, borderWidth: isWeb ? 1 : 0, borderColor: isWeb ? AIRBNB.mist : 'transparent' }]}>
            {RENEWAL_FREQUENCIES.map((freq) => {
              const selected = formData.frequency === freq.value;
              return (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.freqOption,
                    selected && { backgroundColor: pillSelectedBg },
                  ]}
                  onPress={() => updateFormData('frequency', freq.value)}
                >
                  <Text
                    style={[
                      styles.freqText,
                      { color: selected ? pillSelectedText : pillUnselectedText, fontWeight: selected ? '600' : '400' },
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Fecha y color */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Fecha y color</Text>

          <Text style={[styles.label, labelStyle]}>Fecha de renovación</Text>
          {isWeb ? (
            <WebDateInput
              value={formData.renewalDate}
              onChange={(date) => updateFormData('renewalDate', date)}
            />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor }]}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color={isWeb ? AIRBNB.carbon : '#007AFF'} />
                <Text style={[styles.dateText, { color: textColor }]}>
                  {formData.renewalDate?.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) || 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.renewalDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                />
              )}
            </>
          )}

          <Text style={[styles.label, { marginTop: 16 }, labelStyle]}>Color</Text>
          <View style={styles.colorRow}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  formData.color === color && styles.colorOptionSelected,
                ]}
                onPress={() => updateFormData('color', color)}
              >
                {formData.color === color && (
                  <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Notificaciones</Text>

          <View style={styles.notificationRow}>
            <Text style={[styles.label, labelStyle]}>Activar notificaciones</Text>
            {isWeb ? (
              <TouchableOpacity
                style={[
                  styles.toggle,
                  formData.notificationEnabled && { backgroundColor: '#34C759' },
                ]}
                onPress={() => updateFormData('notificationEnabled', !formData.notificationEnabled)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    formData.notificationEnabled && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
            ) : (
              <Switch
                value={formData.notificationEnabled}
                onValueChange={(value) => updateFormData('notificationEnabled', value)}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              />
            )}
          </View>

          {formData.notificationEnabled && (
            <>
              <View style={styles.notificationDaysRow}>
                <Text style={[styles.label, labelStyle]}>Avisar</Text>
                <View style={[styles.daysPicker, { backgroundColor: pillUnselectedBg, borderWidth: isWeb ? 1 : 0, borderColor: isWeb ? AIRBNB.mist : 'transparent' }]}>
                  {[1, 3, 7, 14, 30].map((days) => {
                    const selected = formData.notificationDaysBefore === days;
                    return (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.dayOption,
                          selected && { backgroundColor: pillSelectedBg },
                        ]}
                        onPress={() => updateFormData('notificationDaysBefore', days)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: selected ? pillSelectedText : pillUnselectedText, fontWeight: selected ? '600' : '400' },
                          ]}
                        >
                          {days}d
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={[styles.label, labelStyle]}>antes</Text>
              </View>

              <Text style={[styles.label, { marginTop: 16 }, labelStyle]}>Método de aviso</Text>
              <View style={styles.optionsRow}>
                {NOTIFICATION_METHODS.map((method) => {
                  const selected = formData.notificationMethod === method.value;
                  return (
                    <TouchableOpacity
                      key={method.value}
                      style={[
                        styles.typeOption,
                        { backgroundColor: selected ? pillSelectedBg : pillUnselectedBg, borderColor: selected ? AIRBNB.carbon : pillUnselectedBorder, borderWidth: 1 },
                      ]}
                      onPress={() => updateFormData('notificationMethod', method.value)}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          { color: selected ? '#FFFFFF' : pillUnselectedText, fontWeight: selected ? '600' : '400' },
                        ]}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Notas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Notas</Text>
          <Input
            placeholder="Añade notas adicionales..."
            value={formData.notes}
            onChangeText={(text) => updateFormData('notes', text)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Archivos adjuntos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Archivos adjuntos</Text>
          {user?.id ? (
            <AttachmentsUploader
              userId={user.id}
              renewalId={isEditing ? id : 'temp'}
              attachments={formData.attachments || []}
              onAttachmentsChange={(attachments) => updateFormData('attachments', attachments)}
            />
          ) : (
            <Text style={{ color: isWeb ? AIRBNB.slate : '#8E8E93' }}>Inicia sesión para gestionar adjuntos</Text>
          )}
        </View>

        {/* Estado y pago */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Estado y pago</Text>

          <Text style={[styles.label, labelStyle]}>Estado</Text>
          <View style={[styles.picker, { backgroundColor: pillUnselectedBg, borderWidth: isWeb ? 1 : 0, borderColor: isWeb ? AIRBNB.mist : 'transparent' }]}>
            {STATUS_OPTIONS.map((status) => {
              const selected = formData.status === status.value;
              return (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    selected && { backgroundColor: pillSelectedBg },
                  ]}
                  onPress={() => updateFormData('status', status.value)}
                >
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text
                    style={[
                      styles.statusText,
                      { color: selected ? pillSelectedText : pillUnselectedText, fontWeight: selected ? '600' : '400' },
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.notificationRow, { marginTop: 16 }]}>
            <Text style={[styles.label, labelStyle]}>Renovación automática</Text>
            {isWeb ? (
              <TouchableOpacity
                style={[
                  styles.toggle,
                  formData.autoRenew && { backgroundColor: '#34C759' },
                ]}
                onPress={() => updateFormData('autoRenew', !formData.autoRenew)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    formData.autoRenew && styles.toggleKnobActive,
                  ]}
                />
              </TouchableOpacity>
            ) : (
              <Switch
                value={formData.autoRenew}
                onValueChange={(value) => updateFormData('autoRenew', value)}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              />
            )}
          </View>

          <Text style={[styles.label, { marginTop: 16 }, labelStyle]}>Método de pago</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map((method) => {
              const selected = formData.paymentMethod === method.value;
              return (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.paymentOption,
                    { backgroundColor: selected ? pillSelectedBg : pillUnselectedBg, borderColor: selected ? AIRBNB.carbon : pillUnselectedBorder, borderWidth: 1 },
                  ]}
                  onPress={() => updateFormData('paymentMethod', method.value)}
                >
                  <IconSymbol
                    name={method.icon as any}
                    size={20}
                    color={selected ? '#FFFFFF' : isWeb ? AIRBNB.slate : '#8E8E93'}
                  />
                  <Text
                    style={[
                      styles.paymentText,
                      { color: selected ? '#FFFFFF' : pillUnselectedText, fontWeight: selected ? '600' : '400' },
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {formData.paymentMethod === 'direct_debit' && (
            <Input
              label="Cuenta bancaria"
              placeholder="IBAN / Número de cuenta"
              value={formData.bankAccount}
              onChangeText={(text) => updateFormData('bankAccount', text)}
              style={[styles.input, { marginTop: 12 }]}
            />
          )}

          <Text style={[styles.label, { marginTop: 16 }, labelStyle]}>Etiquetas</Text>
          <View style={styles.tagsRow}>
            {TAG_OPTIONS.map((tag) => {
              const isSelected = formData.tags?.includes(tag.value) ?? false;
              return (
                <TouchableOpacity
                  key={tag.value}
                  style={[
                    styles.tagChip,
                    isSelected && { backgroundColor: pillSelectedBg, borderColor: AIRBNB.carbon, borderWidth: 1 },
                  ]}
                  onPress={() => {
                    const current = formData.tags || [];
                    if (isSelected) {
                      updateFormData('tags', current.filter((t) => t !== tag.value));
                    } else {
                      updateFormData('tags', [...current, tag.value]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: isSelected ? '#FFFFFF' : pillUnselectedText, fontWeight: isSelected ? '600' : '400' },
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 16 }, labelStyle]}>Permanencia hasta</Text>
          {isWeb ? (
            <WebDateInput
              value={formData.contractEndDate}
              onChange={(date) => updateFormData('contractEndDate', date)}
              placeholder="Sin fecha de permanencia"
            />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor }]}
                onPress={() => setShowContractEndDatePicker(true)}
              >
                <IconSymbol name="calendar.badge.clock" size={20} color={isWeb ? AIRBNB.carbon : '#007AFF'} />
                <Text style={[styles.dateText, { color: textColor }]}>
                  {formData.contractEndDate
                    ? formData.contractEndDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Sin fecha de permanencia'}
                </Text>
              </TouchableOpacity>

              {showContractEndDatePicker && (
                <DateTimePicker
                  value={formData.contractEndDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={onContractEndDateChange}
                />
              )}
            </>
          )}
        </View>

        {/* Historial de precios */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, sectionTitleStyle]}>Historial de precios</Text>
            {historyLoading ? (
              <ActivityIndicator size="small" color={isWeb ? AIRBNB.coral : '#007AFF'} />
            ) : history.length === 0 ? (
              <Text style={[styles.emptyHistoryText, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>
                No hay cambios de precio registrados
              </Text>
            ) : (
              <View>
                {history.map((item) => {
                  const diff = item.newCost - item.oldCost;
                  const diffPercent = item.oldCost !== 0 ? ((diff / item.oldCost) * 100).toFixed(1) : '0';
                  const isIncrease = diff > 0;
                  const diffColor = isIncrease ? '#FF3B30' : diff < 0 ? '#34C759' : isWeb ? AIRBNB.slate : '#8E8E93';
                  const diffSymbol = isIncrease ? '+' : '';

                  return (
                    <View key={item.id} style={[styles.historyRow, isWeb && styles.historyRowWeb]}>
                      <View style={styles.historyDateCol}>
                        <Text style={[styles.historyDate, { color: textColor }]}>
                          {new Date(item.changedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={styles.historyCostCol}>
                        <Text style={[styles.historyCost, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>
                          {formatCurrency(item.oldCost, formData.currency)}
                        </Text>
                        <IconSymbol name="arrow.right" size={12} color={isWeb ? AIRBNB.slate : '#8E8E93'} />
                        <Text style={[styles.historyCost, { color: textColor }]}>
                          {formatCurrency(item.newCost, formData.currency)}
                        </Text>
                      </View>
                      <View style={styles.historyDiffCol}>
                        <Text style={[styles.historyDiff, { color: diffColor }]}>
                          {diffSymbol}{formatCurrency(diff, formData.currency)}
                        </Text>
                        <Text style={[styles.historyDiffPercent, { color: diffColor }]}>
                          ({diffSymbol}{diffPercent}%)
                        </Text>
                      </View>
                      {item.oldFrequency !== item.newFrequency && (
                        <View style={styles.historyFreqChange}>
                          <Text style={[styles.historyFreqText, { color: isWeb ? AIRBNB.slate : '#8E8E93' }]}>
                            {RENEWAL_FREQUENCIES.find(f => f.value === item.oldFrequency)?.label} → {RENEWAL_FREQUENCIES.find(f => f.value === item.newFrequency)?.label}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Guardar cambios' : 'Crear renovación'}
            onPress={handleSave}
            loading={saving}
            style={isWeb ? { backgroundColor: AIRBNB.coral, borderRadius: 8 } : undefined}
            textStyle={isWeb ? { color: '#FFFFFF', fontWeight: '600' } : undefined}
          />

          {isEditing && (
            <Button
              title="Eliminar renovación"
              variant="danger"
              onPress={handleDelete}
              style={isWeb ? { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: AIRBNB.coral, borderRadius: 8 } : { marginTop: 12 }}
              textStyle={isWeb ? { color: AIRBNB.coral, fontWeight: '600' } : undefined}
            />
          )}
        </View>
      </ScrollView>

      <CatalogPicker
        visible={catalogVisible}
        onClose={() => setCatalogVisible(false)}
        onSelect={handleCatalogSelect}
        customCategories={customCatalogs.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          options: c.options,
        }))}
        onAddCategory={async (cat) => {
          await addCustomCatalog({
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            options: [],
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    fontSize: 16,
  },
  customHeader: {
    paddingTop: 0,
    backgroundColor: AIRBNB.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AIRBNB.mist,
  },
  customHeaderWeb: {
    paddingTop: 16,
  } as any,
  customHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  customHeaderBtn: {
    minWidth: 60,
    alignItems: 'flex-start',
  },
  customHeaderBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: AIRBNB.carbon,
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AIRBNB.carbon,
    letterSpacing: -0.2,
    textAlign: 'center',
    flex: 1,
  },
  customHeaderSpacer: {
    minWidth: 60,
  },
  scrollView: {
    flex: 1,
  },
  webScrollContent: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: isWeb ? 24 : 0,
    marginVertical: isWeb ? 8 : 0,
    backgroundColor: isWeb ? AIRBNB.card : 'transparent',
    borderRadius: isWeb ? 20 : 0,
    borderWidth: isWeb ? 1 : 0,
    borderColor: isWeb ? AIRBNB.mist : 'transparent',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  picker: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    overflow: 'hidden',
  },
  currencyOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  typeText: {
    fontSize: 14,
  },
  freqOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  freqText: {
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  notificationDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  daysPicker: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    overflow: 'hidden',
  },
  dayOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dayText: {
    fontSize: 14,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    minWidth: '30%',
    flex: 1,
  },
  paymentText: {
    fontSize: 13,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: isWeb ? AIRBNB.canvas : '#E5E5EA',
  },
  tagText: {
    fontSize: 13,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  catalogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isWeb ? AIRBNB.mist : 'transparent',
  },
  catalogButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyHistoryText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  historyRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: isWeb ? AIRBNB.mist : '#E5E5EA',
  },
  historyRowWeb: {
    backgroundColor: AIRBNB.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: AIRBNB.mist,
  },
  historyDateCol: {
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  historyCostCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  historyCost: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyDiffCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDiff: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyDiffPercent: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  historyFreqChange: {
    marginTop: 4,
  },
  historyFreqText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});