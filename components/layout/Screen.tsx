import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSemanticTheme } from '@/constants/design-tokens';

type ScreenKind = 'dashboard' | 'form' | 'screen';

interface ScreenProps {
  children: React.ReactNode;
  kind?: ScreenKind;
  style?: StyleProp<ViewStyle>;
}

const isWeb = Platform.OS === 'web';

export function Screen({ children, kind = 'screen', style }: ScreenProps) {
  const { colors, spacing } = useSemanticTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgCanvas }]}>
      <View
        style={[
          styles.inner,
          { paddingHorizontal: spacing.lg },
          kind === 'dashboard' && styles.dashboardWidth,
          kind === 'form' && styles.formWidth,
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  dashboardWidth: isWeb
    ? {
        maxWidth: 1120,
      }
    : {},
  formWidth: isWeb
    ? {
        maxWidth: 760,
      }
    : {},
});
