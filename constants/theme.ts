import { Platform } from 'react-native';

// ============================================================
// WEB THEME — Airbnb Clean (light aesthetic)
// ============================================================
export const WebColors = {
  text: '#222222',               // Carbon — primary body text
  textSecondary: '#6a6a6a',      // Slate
  textTertiary: '#9a9a9a',       // Light slate
  textMuted: '#b0b0b0',          // Muted gray
  background: '#f7f7f7',         // Canvas
  backgroundElevated: '#ffffff', // Card
  backgroundCard: '#ffffff',
  tint: '#ff385c',               // Coral — primary action
  tintHover: '#e00b41',
  border: '#ebebeb',
  borderSubtle: '#f7f7f7',
  icon: '#222222',
  iconSecondary: '#6a6a6a',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  accent: '#ff385c',             // Coral
  glow: 'rgba(255, 56, 92, 0.15)',
  glowMd: 'rgba(255, 56, 92, 0.10)',
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
    sm: 'rgba(0, 0, 0, 0.04) 0px 1px 2px 0px',
    md: 'rgba(0, 0, 0, 0.06) 0px 2px 8px 0px',
    subtle: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px inset',
    subtle2: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.02) 0px 0px 48px 0px inset',
    subtle3: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px inset',
    card: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(0, 0, 0, 0.1) 0px 4px 8px 0px',
    form: 'rgba(0, 0, 0, 0.02) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(0, 0, 0, 0.1) 0px 4px 8px 0px',
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
