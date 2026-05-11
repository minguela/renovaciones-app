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

import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CatalogPicker } from '@/components/CatalogPicker';
import { AttachmentsUploader } from '@/components/AttachmentsUploader';
import { useRenewals } from '@/hooks/useRenewals';
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
  generateId,
  formatCurrency,
} from '@/types/renewal';

const isWeb = Platform.OS === 'web';

export default function RenewalFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = id !== 'new';
  const { addRenewal, updateRenewal, deleteRenewal, getRenewalById, getHistoryForRenewal, userId } = useRenewals();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContractEndDatePicker, setShowContractEndDatePicker] = useState(false);
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [history, setHistory] = useState<RenewalHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previousRenewal, setPreviousRenewal] = useState<Renewal | null>(null);

  const backgroundColor = isWeb
    ? 'rgba(186, 214, 247, 0.03)'
    : useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

  const [formData, setFormData] = useState<RenewalFormData>({
    name: '',
    type: 'subscription',
    frequency: 'monthly',
    cost: '',
    currency: 'EUR',
    renewalDate: new Date(),
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
  });

  useEffect(() => {
    if (isEditing) {
      loadRenewal();
    }
  }, [id]);

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
      renewalDate: formData.renewalDate.toISOString(),
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
  }) => {
    setFormData(prev => ({
      ...prev,
      name: data.name,
      type: data.type,
      frequency: data.frequency,
      cost: data.cost,
      provider: data.provider,
      icon: data.icon,
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

  const accentColor = isWeb ? '#b6d9fc' : '#007AFF';
  const secondaryText = isWeb ? '#9da7ba' : '#8E8E93';
  const labelColor = isWeb ? '#d1e4fa' : '#3C3C43';

  return (
    <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Editar Renovación' : 'Nueva Renovación',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.headerButton, { color: accentColor }]}>Cancelar</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isWeb ? styles.webScrollContent : undefined}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>Información básica</Text>

          {!isEditing && (
            <TouchableOpacity
              style={[styles.catalogButton, { backgroundColor }]}
              onPress={() => setCatalogVisible(true)}
              activeOpacity={0.7}
            >
              <IconSymbol name="magnifyingglass" size={18} color={accentColor} />
              <Text style={[styles.catalogButtonText, { color: accentColor }]}>
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
              <Text style={[styles.label, { color: labelColor }]}>Moneda</Text>
              <View style={[styles.picker, { backgroundColor }]}>
                {CURRENCY_OPTIONS.map((currency) => (
                  <TouchableOpacity
                    key={currency.value}
                    style={[
                      styles.currencyOption,
                      formData.currency === currency.value && (isWeb ? styles.currencyOptionSelectedWeb : styles.currencyOptionSelected),
                    ]}
                    onPress={() => updateFormData('currency', currency.value)}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        formData.currency === currency.value && (isWeb ? styles.currencyTextSelectedWeb : styles.currencyTextSelected),
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>Tipo y frecuencia</Text>

          <Text style={[styles.label, { color: labelColor }]}>Tipo</Text>
          <View style={styles.optionsRow}>
            {RENEWAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  formData.type === type.value && (isWeb ? styles.typeOptionSelectedWeb : styles.typeOptionSelected),
                  { backgroundColor },
                ]}
                onPress={() => {
                  updateFormData('type', type.value);
                  updateFormData('icon', type.icon);
                }}
              >
                <IconSymbol
                  name={type.icon as any}
                  size={20}
                  color={formData.type === type.value ? accentColor : secondaryText}
                />
                <Text
                  style={[
                    styles.typeText,
                    formData.type === type.value && (isWeb ? styles.typeTextSelectedWeb : styles.typeTextSelected),
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 16, color: labelColor }]}>Frecuencia</Text>
          <View style={[styles.picker, { backgroundColor }]}>
            {RENEWAL_FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.freqOption,
                  formData.frequency === freq.value && (isWeb ? styles.freqOptionSelectedWeb : styles.freqOptionSelected),
                ]}
                onPress={() => updateFormData('frequency', freq.value)}
              >
                <Text
                  style={[
                    styles.freqText,
                    formData.frequency === freq.value && (isWeb ? styles.freqTextSelectedWeb : styles.freqTextSelected),
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>Fecha y color</Text>

          <Text style={[styles.label, { color: labelColor }]}>Fecha de renovación</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor }]}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol name="calendar" size={20} color={accentColor} />
            <Text style={[styles.dateText, { color: textColor }]}>
              {formData.renewalDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.renewalDate}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={[styles.label, { marginTop: 16, color: labelColor }]}>Color</Text>
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>Notificaciones</Text>

          <View style={styles.notificationRow}>
            <Text style={[styles.label, { color: labelColor }]}>Activar notificaciones</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                formData.notificationEnabled && (isWeb ? styles.toggleActiveWeb : styles.toggleActive),
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
          </View>

          {formData.notificationEnabled && (
            <View style={styles.notificationDaysRow}>
              <Text style={[styles.label, { color: labelColor }]}>Avisar</Text>
              <View style={[styles.daysPicker, { backgroundColor }]}>
                {[1, 3, 7, 14, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dayOption,
                      formData.notificationDaysBefore === days && (isWeb ? styles.dayOptionSelectedWeb : styles.dayOptionSelected),
                    ]}
                    onPress={() => updateFormData('notificationDaysBefore', days)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        formData.notificationDaysBefore === days && (isWeb ? styles.dayTextSelectedWeb : styles.dayTextSelected),
                      ]}
                    >
                      {days}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.label, { color: labelColor }]}>antes</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>Notas</Text>
          <Input
            placeholder="Añade notas adicionales..."
            value={formData.notes}
            onChangeText={(text) => updateFormData('notes', text)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>Archivos adjuntos</Text>
          {userId ? (
            <AttachmentsUploader
              userId={userId}
              renewalId={isEditing ? id : 'temp'}
              attachments={formData.attachments || []}
              onAttachmentsChange={(attachments) => updateFormData('attachments', attachments)}
            />
          ) : (
            <Text style={{ color: secondaryText }}>Inicia sesión para gestionar adjuntos</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: secondaryText }]}>Estado y pago</Text>

          <Text style={[styles.label, { color: labelColor }]}>Estado</Text>
          <View style={[styles.picker, { backgroundColor }]}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusOption,
                  formData.status === status.value && (isWeb ? styles.statusOptionSelectedWeb : styles.statusOptionSelected),
                ]}
                onPress={() => updateFormData('status', status.value)}
              >
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text
                  style={[
                    styles.statusText,
                    formData.status === status.value && (isWeb ? styles.statusTextSelectedWeb : styles.statusTextSelected),
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.notificationRow, { marginTop: 16 }]}>
            <Text style={[styles.label, { color: labelColor }]}>Renovación automática</Text>
            {isWeb ? (
              <TouchableOpacity
                style={[
                  styles.toggle,
                  formData.autoRenew && styles.toggleActiveWeb,
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

          <Text style={[styles.label, { marginTop: 16, color: labelColor }]}>Método de pago</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.paymentOption,
                  { backgroundColor },
                  formData.paymentMethod === method.value && (isWeb ? styles.paymentOptionSelectedWeb : styles.paymentOptionSelected),
                ]}
                onPress={() => updateFormData('paymentMethod', method.value)}
              >
                <IconSymbol
                  name={method.icon as any}
                  size={20}
                  color={formData.paymentMethod === method.value ? accentColor : secondaryText}
                />
                <Text
                  style={[
                    styles.paymentText,
                    formData.paymentMethod === method.value && (isWeb ? styles.paymentTextSelectedWeb : styles.paymentTextSelected),
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.paymentMethod === 'bank_transfer' && (
            <Input
              label="Cuenta bancaria"
              placeholder="IBAN / Número de cuenta"
              value={formData.bankAccount}
              onChangeText={(text) => updateFormData('bankAccount', text)}
              style={[styles.input, { marginTop: 12 }]}
            />
          )}

          <Text style={[styles.label, { marginTop: 16, color: labelColor }]}>Etiquetas</Text>
          <View style={styles.tagsRow}>
            {TAG_OPTIONS.map((tag) => {
              const isSelected = formData.tags?.includes(tag.value) ?? false;
              return (
                <TouchableOpacity
                  key={tag.value}
                  style={[
                    styles.tagChip,
                    isSelected && (isWeb ? styles.tagChipSelectedWeb : styles.tagChipSelected),
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
                      isSelected && (isWeb ? styles.tagTextSelectedWeb : styles.tagTextSelected),
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 16, color: labelColor }]}>Permanencia hasta</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor }]}
            onPress={() => setShowContractEndDatePicker(true)}
          >
            <IconSymbol name="calendar.badge.clock" size={20} color={accentColor} />
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
              minimumDate={new Date()}
            />
          )}
        </View>

        {isEditing && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: secondaryText }]}>Historial de precios</Text>
            {historyLoading ? (
              <ActivityIndicator size="small" color={accentColor} />
            ) : history.length === 0 ? (
              <Text style={[styles.emptyHistoryText, { color: secondaryText }]}>
                No hay cambios de precio registrados
              </Text>
            ) : (
              <View>
                {history.map((item) => {
                  const diff = item.newCost - item.oldCost;
                  const diffPercent = item.oldCost !== 0 ? ((diff / item.oldCost) * 100).toFixed(1) : '0';
                  const isIncrease = diff > 0;
                  const diffColor = isIncrease ? '#FF3B30' : diff < 0 ? '#34C759' : secondaryText;
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
                        <Text style={[styles.historyCost, { color: secondaryText }]}>
                          {formatCurrency(item.oldCost, formData.currency)}
                        </Text>
                        <IconSymbol name="arrow.right" size={12} color={secondaryText} />
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
                          <Text style={[styles.historyFreqText, { color: secondaryText }]}>
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

        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Guardar cambios' : 'Crear renovación'}
            onPress={handleSave}
            loading={saving}
          />

          {isEditing && (
            <Button
              title="Eliminar renovación"
              variant="danger"
              onPress={handleDelete}
              style={{ marginTop: 12 } as any}
            />
          )}
        </View>
      </ScrollView>

      <CatalogPicker
        visible={catalogVisible}
        onClose={() => setCatalogVisible(false)}
        onSelect={handleCatalogSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    backgroundColor: '#05060f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    fontSize: 16,
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
    paddingVertical: 12,
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
    borderRadius: 8,
    padding: 4,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  currencyOptionSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencyOptionSelectedWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.15)',
    borderRadius: 6,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  currencyTextSelected: {
    color: '#007AFF',
  },
  currencyTextSelectedWeb: {
    color: '#b6d9fc',
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
  typeOptionSelected: {
    backgroundColor: '#007AFF15',
  },
  typeOptionSelectedWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.1)',
    borderColor: 'rgba(102, 58, 243, 0.3)',
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    color: '#3C3C43',
  },
  typeTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  typeTextSelectedWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
  },
  freqOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  freqOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  freqOptionSelectedWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.15)',
    borderRadius: 6,
  },
  freqText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  freqTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  freqTextSelectedWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
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
  notificationDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  daysPicker: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  dayOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dayOptionSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayOptionSelectedWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.15)',
    borderRadius: 6,
  },
  dayText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dayTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  dayTextSelectedWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  statusOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusOptionSelectedWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.15)',
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  statusTextSelectedWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
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
  paymentOptionSelected: {
    backgroundColor: '#007AFF15',
  },
  paymentOptionSelectedWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.1)',
    borderColor: 'rgba(102, 58, 243, 0.3)',
    borderWidth: 1,
  },
  paymentText: {
    fontSize: 13,
    color: '#3C3C43',
  },
  paymentTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  paymentTextSelectedWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
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
    backgroundColor: '#E5E5EA',
  },
  tagChipSelected: {
    backgroundColor: '#007AFF15',
  },
  tagChipSelectedWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.15)',
    borderColor: 'rgba(102, 58, 243, 0.3)',
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    color: '#3C3C43',
  },
  tagTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  tagTextSelectedWeb: {
    color: '#b6d9fc',
    fontWeight: '500',
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
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: isWeb ? 1 : 0,
    borderColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : 'transparent',
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
    borderBottomColor: isWeb ? 'rgba(186, 215, 247, 0.08)' : '#E5E5EA',
  },
  historyRowWeb: {
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderBottomWidth: 0,
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
