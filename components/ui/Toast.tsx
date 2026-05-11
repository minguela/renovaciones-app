import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToastContext, ToastItem, ToastType } from '@/components/ui/ToastContext';
import { WebColors, MobileColors, Radius, Shadows } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

function getIconName(type: ToastType): any {
  switch (type) {
    case 'success':
      return 'checkmark';
    case 'error':
      return 'xmark';
    case 'warning':
      return 'exclamationmark.triangle';
    case 'info':
    default:
      return 'info.circle';
  }
}

function getIconColor(type: ToastType, isDark: boolean): string {
  if (isWeb) {
    switch (type) {
      case 'success':
        return WebColors.success;
      case 'error':
        return WebColors.danger;
      case 'warning':
        return WebColors.warning;
      case 'info':
      default:
        return WebColors.accent;
    }
  }
  const colors = isDark ? MobileColors.dark : MobileColors.light;
  switch (type) {
    case 'success':
      return colors.success;
    case 'error':
      return colors.danger;
    case 'warning':
      return colors.warning;
    case 'info':
    default:
      return colors.tint;
  }
}

function ToastItemView({ toast, index }: { toast: ToastItem; index: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { hideToast } = useToastContext();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: !isWeb,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 280,
          useNativeDriver: !isWeb,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: !isWeb,
        }),
      ]).start(() => {
        hideToast(toast.id);
      });
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, hideToast, translateY, opacity]);

  const iconName = getIconName(toast.type);
  const iconColor = getIconColor(toast.type, isDark);

  const webStyle: any = isWeb
    ? {
        boxShadow: Shadows.web.card,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }
    : {};

  const mobileBg = isDark
    ? MobileColors.dark.backgroundElevated
    : MobileColors.light.backgroundElevated;

  return (
    <Animated.View
      style={[
        styles.toast,
        isWeb ? styles.webToast : styles.mobileToast,
        isWeb && { backgroundColor: 'rgba(5, 6, 15, 0.92)', borderColor: WebColors.border },
        !isWeb && {
          backgroundColor: mobileBg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 6,
          elevation: 4,
        },
        {
          transform: [{ translateY }],
          opacity,
          marginTop: index > 0 ? 10 : 0,
        },
        webStyle,
      ]}
    >
      <View style={styles.iconContainer}>
        <IconSymbol
          name={iconName}
          size={20}
          color={iconColor}
          style={styles.icon}
        />
      </View>
      <Text
        style={[
          styles.message,
          isWeb
            ? { color: WebColors.text }
            : {
                color: isDark
                  ? MobileColors.dark.text
                  : MobileColors.light.text,
              },
        ]}
        numberOfLines={3}
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function ToastContainer() {
  const { toasts } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        isWeb ? styles.webContainer : styles.mobileContainer,
      ]}
      pointerEvents="box-none"
    >
      {toasts.map((toast, index) => (
        <ToastItemView key={toast.id} toast={toast} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'box-none',
  },
  webContainer: {
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: 16,
  },
  mobileContainer: {
    alignItems: 'center',
    paddingTop: 48,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    minWidth: isWeb ? 280 : 260,
    maxWidth: isWeb ? 400 : 340,
  },
  webToast: {
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  mobileToast: {
    borderRadius: Radius.xl,
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
});
