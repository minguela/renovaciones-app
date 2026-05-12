import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { CatalogCategories, CatalogCategory, CatalogOption } from '@/types/catalog';
import { RENEWAL_TYPES, COLORS } from '@/types/renewal';

const isWeb = Platform.OS === 'web';

interface CatalogPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (data: {
    name: string;
    type: CatalogOption['defaultType'];
    frequency: CatalogOption['defaultFrequency'];
    cost: string;
    provider: string;
    icon: string;
    color?: string;
    currency?: string;
  }) => void;
  customCategories?: CatalogCategory[];
  onAddCategory?: (category: CatalogCategory) => void;
}

export function CatalogPicker({ visible, onClose, onSelect, customCategories = [], onAddCategory }: CatalogPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const allCategories = [...CatalogCategories, ...customCategories];

  const handleClose = () => {
    setSelectedCategory(null);
    setAddingCategory(false);
    setNewCategoryName('');
    onClose();
  };

  const handleSelectCategory = (category: CatalogCategory) => {
    setSelectedCategory(category);
  };

  const handleSelectOption = (option: CatalogOption, category: CatalogCategory) => {
    const typeInfo = RENEWAL_TYPES.find((t) => t.value === option.defaultType);
    onSelect({
      name: option.name,
      type: option.defaultType,
      frequency: option.defaultFrequency,
      cost: option.defaultCost.toString(),
      provider: option.suggestedProvider || category.name,
      icon: typeInfo?.icon || category.icon,
      color: option.defaultColor || category.color,
      currency: option.defaultCurrency || 'EUR',
    });
    setSelectedCategory(null);
    setAddingCategory(false);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return;
    }
    const newCategory: CatalogCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      icon: 'tag.fill',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      options: [],
    };
    if (onAddCategory) {
      onAddCategory(newCategory);
    }
    setNewCategoryName('');
    setAddingCategory(false);
    setSelectedCategory(newCategory);
  };

  const accentColor = isWeb ? '#ff385c' : '#007AFF';
  const textColor = isWeb ? '#222222' : '#000000';
  const secondaryText = isWeb ? '#6a6a6a' : '#8E8E93';
  const headerBg = isWeb ? '#f7f7f7' : '#F2F2F7';
  const cardBg = isWeb ? '#ffffff' : '#FFFFFF';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={!isWeb}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: headerBg }]}>
          {selectedCategory ? (
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                <IconSymbol name="arrow.left" size={24} color={accentColor} />
              </TouchableOpacity>
              <View style={styles.headerTitleRow}>
                <IconSymbol
                  name={selectedCategory.icon as any}
                  size={20}
                  color={accentColor}
                />
                <Text style={[styles.headerTitle, { color: textColor }]}>
                  {selectedCategory.name}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                <IconSymbol name="xmark" size={24} color={accentColor} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.headerRow}>
              <View style={styles.headerSpacer} />
              <Text style={[styles.headerTitle, { color: textColor }]}>
                Elegir del catálogo
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                <IconSymbol name="xmark" size={24} color={accentColor} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={isWeb ? styles.webScrollContent : undefined}
          showsVerticalScrollIndicator={false}
        >
          {!selectedCategory ? (
            <>
              <View style={styles.grid}>
                {allCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, isWeb && styles.categoryCardWeb]}
                    onPress={() => handleSelectCategory(category)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, isWeb && styles.iconContainerWeb]}>
                      <IconSymbol
                        name={category.icon as any}
                        size={28}
                        color={category.color || accentColor}
                      />
                    </View>
                    <Text
                      style={[styles.categoryName, { color: textColor }]}
                      numberOfLines={2}
                    >
                      {category.name}
                    </Text>
                    <Text style={[styles.categoryCount, { color: secondaryText }]}>
                      {category.options.length} opciones
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {addingCategory ? (
                <View style={[styles.addCategoryContainer, isWeb && { backgroundColor: cardBg, borderColor: '#ebebeb' }]}>
                  <TextInput
                    style={[styles.addCategoryInput, { color: textColor }]}
                    placeholder="Nombre de nueva categoría"
                    placeholderTextColor={secondaryText}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoFocus
                  />
                  <View style={styles.addCategoryButtons}>
                    <TouchableOpacity onPress={() => setAddingCategory(false)} style={styles.addCategoryButton}>
                      <Text style={{ color: secondaryText }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddCategory} style={[styles.addCategoryButton, styles.addCategoryButtonPrimary]}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Añadir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.addCategoryButtonRow, isWeb && { backgroundColor: cardBg, borderColor: '#ebebeb' }]}
                  onPress={() => setAddingCategory(true)}
                >
                  <IconSymbol name="plus.circle.fill" size={20} color={accentColor} />
                  <Text style={[styles.addCategoryButtonText, { color: accentColor }]}>
                    Añadir nueva categoría
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.optionsList}>
              {selectedCategory.options.map((option, index) => (
                <TouchableOpacity
                  key={`${option.name}-${index}`}
                  style={[styles.optionRow, isWeb && styles.optionRowWeb]}
                  onPress={() => handleSelectOption(option, selectedCategory)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionName, { color: textColor }]}>
                      {option.name}
                    </Text>
                    {option.suggestedProvider && (
                      <Text style={[styles.optionProvider, { color: secondaryText }]}>
                        {option.suggestedProvider}
                      </Text>
                    )}
                  </View>
                  <View style={styles.optionMeta}>
                    <Text style={[styles.optionCost, { color: accentColor }]}>
                      {option.defaultCost.toFixed(2)} €
                    </Text>
                    <IconSymbol
                      name="chevron.right"
                      size={18}
                      color={secondaryText}
                    />
                  </View>
                </TouchableOpacity>
              ))}

              {selectedCategory.options.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: secondaryText }]}>
                    Esta categoría está vacía. Añade opciones manualmente en el formulario.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  webContainer: {
    backgroundColor: '#f7f7f7',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isWeb ? 'rgba(186, 215, 247, 0.12)' : '#E5E5EA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButton: {
    padding: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  headerSpacer: {
    minWidth: 32,
  },
  scrollView: {
    flex: 1,
  },
  webScrollContent: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryCardWeb: {
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    borderColor: 'rgba(186, 215, 247, 0.12)',
    boxShadow:
      'rgba(199, 211, 234, 0.12) 0px 1px 1px 0px inset, rgba(199, 211, 234, 0.05) 0px 24px 48px 0px inset, rgba(6, 6, 14, 0.7) 0px 24px 32px 0px',
  } as any,
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainerWeb: {
    backgroundColor: 'rgba(102, 58, 243, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102, 58, 243, 0.2)',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  categoryCount: {
    fontSize: 12,
    marginTop: 4,
  },
  addCategoryButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  addCategoryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  addCategoryContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addCategoryInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginBottom: 12,
  },
  addCategoryButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  addCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCategoryButtonPrimary: {
    backgroundColor: '#ff385c',
  },
  optionsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  optionRowWeb: {
    backgroundColor: 'rgba(186, 214, 247, 0.03)',
    borderColor: 'rgba(186, 215, 247, 0.12)',
    boxShadow:
      'rgba(199, 211, 234, 0.12) 0px 1px 1px 0px inset, rgba(199, 211, 234, 0.05) 0px 24px 48px 0px inset, rgba(6, 6, 14, 0.7) 0px 24px 32px 0px',
  } as any,
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionProvider: {
    fontSize: 13,
    marginTop: 2,
  },
  optionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
