import React, { useState, useCallback } from 'react';
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
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { CatalogCategories, CatalogCategory, CatalogOption } from '@/types/catalog';
import { RENEWAL_TYPES, COLORS } from '@/types/renewal';

const isWeb = Platform.OS === 'web';

/* ─── Airbnb tokens ─── */
const TOKENS = {
  canvas: '#f7f7f7',
  card: '#ffffff',
  carbon: '#222222',
  slate: '#6a6a6a',
  mist: '#ebebeb',
  coral: '#ff385c',
  coralDeep: '#e00b41',
};

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

export function CatalogPicker({
  visible,
  onClose,
  onSelect,
  customCategories = [],
  onAddCategory,
}: CatalogPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const allCategories = [...CatalogCategories, ...customCategories];

  const handleClose = useCallback(() => {
    setSelectedCategory(null);
    setAddingCategory(false);
    setNewCategoryName('');
    onClose();
  }, [onClose]);

  const handleSelectCategory = (category: CatalogCategory) => {
    setSelectedCategory(category);
  };

  const handleSelectOption = useCallback(
    (option: CatalogOption, category: CatalogCategory) => {
      const typeInfo = RENEWAL_TYPES.find((t) => t.value === option.defaultType);
      const payload = {
        name: option.name,
        type: option.defaultType,
        frequency: option.defaultFrequency,
        cost: option.defaultCost.toString(),
        provider: option.suggestedProvider || category.name,
        icon: typeInfo?.icon || category.icon,
        color: option.defaultColor || category.color,
        currency: option.defaultCurrency || 'EUR',
      };
      onSelect(payload);
    },
    [onSelect]
  );

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

  /* ─── Render content ─── */
  const renderContent = () => (
    <SafeAreaView style={[styles.container, isWeb && styles.webContainer]}>
      {/* Header */}
      <View style={styles.header}>
        {selectedCategory ? (
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} style={styles.headerButton} hitSlop={8}>
              <IconSymbol name="arrow.left" size={24} color={TOKENS.coral} />
            </TouchableOpacity>
            <View style={styles.headerTitleRow}>
              <IconSymbol name={selectedCategory.icon as any} size={20} color={TOKENS.coral} />
              <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton} hitSlop={8}>
              <IconSymbol name="xmark" size={24} color={TOKENS.coral} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Elegir del catálogo</Text>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton} hitSlop={8}>
              <IconSymbol name="xmark" size={24} color={TOKENS.coral} />
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
                      color={category.color || TOKENS.coral}
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {category.name}
                  </Text>
                  <Text style={styles.categoryCount}>
                    {category.options.length} opciones
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {addingCategory ? (
              <View style={[styles.addCategoryContainer, isWeb && styles.addCategoryContainerWeb]}>
                <TextInput
                  style={styles.addCategoryInput}
                  placeholder="Nombre de nueva categoría"
                  placeholderTextColor={TOKENS.slate}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  autoFocus
                />
                <View style={styles.addCategoryButtons}>
                  <Pressable onPress={() => setAddingCategory(false)} style={styles.addCategoryBtnGhost}>
                    <Text style={styles.addCategoryBtnGhostText}>Cancelar</Text>
                  </Pressable>
                  <Pressable onPress={handleAddCategory} style={styles.addCategoryBtnPrimary}>
                    <Text style={styles.addCategoryBtnPrimaryText}>Añadir</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addCategoryButtonRow, isWeb && styles.addCategoryButtonRowWeb]}
                onPress={() => setAddingCategory(true)}
                activeOpacity={0.7}
              >
                <IconSymbol name="plus.circle.fill" size={20} color={TOKENS.coral} />
                <Text style={styles.addCategoryButtonText}>Añadir nueva categoría</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.optionsList}>
            {selectedCategory.options.map((option, index) => (
              <Pressable
                key={`${option.name}-${index}`}
                style={({ pressed }) => [
                  styles.optionRow,
                  isWeb && styles.optionRowWeb,
                  pressed && styles.optionRowPressed,
                ]}
                onPress={() => handleSelectOption(option, selectedCategory)}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  {option.suggestedProvider && (
                    <Text style={styles.optionProvider}>{option.suggestedProvider}</Text>
                  )}
                </View>
                <View style={styles.optionMeta}>
                  <Text style={styles.optionCost}>{option.defaultCost.toFixed(2)} €</Text>
                  <IconSymbol name="chevron.right" size={18} color={TOKENS.slate} />
                </View>
              </Pressable>
            ))}

            {selectedCategory.options.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Esta categoría está vacía. Añade opciones manualmente en el formulario.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  if (!visible) return null;

  if (isWeb) {
    return (
      <View style={styles.webOverlay}>
        {renderContent()}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {renderContent()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* Overlay (web only) */
  webOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: TOKENS.canvas,
  } as any,

  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  webContainer: {
    backgroundColor: TOKENS.canvas,
  },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: TOKENS.mist,
    backgroundColor: TOKENS.card,
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
    color: TOKENS.carbon,
    letterSpacing: -0.2,
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

  /* Grid */
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
    backgroundColor: TOKENS.card,
    borderColor: TOKENS.mist,
    boxShadow: `${TOKENS.mist} 0px 1px 1px 0px inset, rgba(0,0,0,0.04) 0px 2px 6px 0px, rgba(0,0,0,0.1) 0px 4px 8px 0px`,
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
    backgroundColor: 'rgba(255, 56, 92, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 56, 92, 0.15)',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    color: TOKENS.carbon,
  },
  categoryCount: {
    fontSize: 12,
    marginTop: 4,
    color: TOKENS.slate,
  },

  /* Add category */
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
  addCategoryButtonRowWeb: {
    backgroundColor: TOKENS.card,
    borderColor: TOKENS.mist,
  },
  addCategoryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: TOKENS.coral,
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
  addCategoryContainerWeb: {
    backgroundColor: TOKENS.card,
    borderColor: TOKENS.mist,
  },
  addCategoryInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: TOKENS.mist,
    borderRadius: 8,
    marginBottom: 12,
    color: TOKENS.carbon,
  },
  addCategoryButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  addCategoryBtnGhost: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCategoryBtnGhostText: {
    color: TOKENS.slate,
    fontWeight: '500',
  },
  addCategoryBtnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: TOKENS.coral,
  },
  addCategoryBtnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },

  /* Options list */
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
    backgroundColor: TOKENS.card,
    borderColor: TOKENS.mist,
    boxShadow: `${TOKENS.mist} 0px 1px 1px 0px inset, rgba(0,0,0,0.04) 0px 2px 6px 0px, rgba(0,0,0,0.1) 0px 4px 8px 0px`,
  } as any,
  optionRowPressed: {
    opacity: 0.7,
    backgroundColor: TOKENS.canvas,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: TOKENS.carbon,
  },
  optionProvider: {
    fontSize: 13,
    marginTop: 2,
    color: TOKENS.slate,
  },
  optionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionCost: {
    fontSize: 14,
    fontWeight: '600',
    color: TOKENS.coral,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    color: TOKENS.slate,
  },
});
