import { Platform } from 'react-native';

// ============================================================
// WEB THEME — AuthKit Midnight Command Center (2026 aesthetic)
// ============================================================
export const WebColors = {
  text: '#d8ecf8',               // Comet — primary body text
  textSecondary: '#d1e4fa',      // Arctic Mist
  textTertiary: '#9da7ba',       // Whisper Blue
  textMuted: '#81899b',          // Interstellar Gray
  background: '#05060f',         // Midnight Abyss
  backgroundElevated: '#0a0b14', // Slightly lighter
  backgroundCard: 'rgba(186, 214, 247, 0.03)',
  tint: '#663af3',               // Neon Violet — primary action
  tintHover: '#7c52f8',
  border: 'rgba(186, 215, 247, 0.12)',
  borderSubtle: 'rgba(186, 214, 247, 0.06)',
  icon: '#d8ecf8',
  iconSecondary: '#9da7ba',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  accent: '#b6d9fc',             // Celestial Light
  glow: 'rgba(186, 207, 247, 0.32)',
  glowMd: 'rgba(238, 186, 247, 0.24)',
} as const;

// ============================================================
// MOBILE THEME — Modern iOS native aesthetic
// ============================================================
export const MobileColors = {
  light: {
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#8E8E93',
    textMuted: '#999999',
    background: '#F2F2F7',
    backgroundElevated: '#FFFFFF',
    backgroundCard: '#FFFFFF',
    tint: '#007AFF',
    tintHover: '#0056D6',
    border: '#E5E5EA',
    borderSubtle: '#F2F2F7',
    icon: '#007AFF',
    iconSecondary: '#8E8E93',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    accent: '#007AFF',
    glow: 'transparent',
    glowMd: 'transparent',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#999999',
    textTertiary: '#8E8E93',
    textMuted: '#666666',
    background: '#000000',
    backgroundElevated: '#1C1C1E',
    backgroundCard: '#1C1C1E',
    tint: '#0A84FF',
    tintHover: '#409CFF',
    border: '#38383A',
    borderSubtle: '#2C2C2E',
    icon: '#0A84FF',
    iconSecondary: '#8E8E93',
    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF453A',
    accent: '#0A84FF',
    glow: 'transparent',
    glowMd: 'transparent',
  },
} as const;

// ============================================================
// Font tokens
// ============================================================
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
    display: 'system-ui',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    display: 'normal',
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'IBM Plex Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    display: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  },
});

// ============================================================
// Spacing tokens (base 4px)
// ============================================================
export const Spacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  36: 36,
  40: 40,
  48: 48,
  56: 56,
  100: 100,
  120: 120,
  200: 200,
} as const;

// ============================================================
// Border radius tokens
// ============================================================
export const Radius = {
  sm: 2,
  md: 6,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  pill: 999,
} as const;

// ============================================================
// Shadow / elevation tokens
// ============================================================
export const Shadows = {
  web: {
    sm: 'rgba(186, 207, 247, 0.32) 0px 0px 6px 0px',
    md: 'rgba(238, 186, 247, 0.24) 0px 0px 12px 0px',
    subtle: 'rgba(186, 215, 247, 0.12) 0px 0px 0px 1px inset',
    subtle2: 'rgba(199, 211, 234, 0.12) -0.5px 0.5px 1px 0px inset, rgba(186, 215, 247, 0.08) 0px 0px 96px 0px inset',
    subtle3: 'rgba(186, 214, 247, 0.06) 0px 0px 0px 1px inset',
    card: 'rgba(199, 211, 234, 0.12) 0px 1px 1px 0px inset, rgba(199, 211, 234, 0.05) 0px 24px 48px 0px inset, rgba(6, 6, 14, 0.7) 0px 24px 32px 0px',
    form: 'rgba(216, 236, 248, 0.2) 0px 1px 1px 0px inset, rgba(168, 216, 245, 0.06) 0px 24px 48px 0px inset, rgba(0, 0, 0, 0.3) 0px 16px 32px 0px',
  },
  mobile: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
    subtle: undefined,
    subtle2: undefined,
    subtle3: undefined,
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    form: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  },
} as const;

// ============================================================
// Legacy export for backwards compatibility
// ============================================================
export const Colors = {
  light: {
    text: MobileColors.light.text,
    background: MobileColors.light.background,
    tint: MobileColors.light.tint,
    icon: MobileColors.light.iconSecondary,
    tabIconDefault: MobileColors.light.iconSecondary,
    tabIconSelected: MobileColors.light.tint,
  },
  dark: {
    text: MobileColors.dark.text,
    background: MobileColors.dark.background,
    tint: MobileColors.dark.tint,
    icon: MobileColors.dark.iconSecondary,
    tabIconDefault: MobileColors.dark.iconSecondary,
    tabIconSelected: MobileColors.dark.tint,
  },
};
