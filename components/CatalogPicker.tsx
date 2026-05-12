import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { CatalogCategories, CatalogCategory, CatalogOption } from '@/types/catalog';
import { RENEWAL_TYPES } from '@/types/renewal';

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
  }) => void;
}

export function CatalogPicker({ visible, onClose, onSelect }: CatalogPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null);

  const handleClose = () => {
    setSelectedCategory(null);
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
    });
    setSelectedCategory(null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const accentColor = isWeb ? '#ff385c' : '#007AFF';
  const textColor = isWeb ? '#222222' : '#000000';
  const secondaryText = isWeb ? '#6a6a6a' : '#8E8E93';
  const headerBg = isWeb ? '#f7f7f7' : '#F2F2F7';

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
            <View style={styles.grid}>
              {CatalogCategories.map((category) => (
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
                      color={accentColor}
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
});
