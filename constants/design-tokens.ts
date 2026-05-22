import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  x2l: 32,
  x3l: 40,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const elevation = {
  none: {},
  raised: Platform.select({
    web: { boxShadow: 'rgba(0,0,0,0.08) 0px 4px 16px 0px' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
  }),
} as const;

export const semanticColors = {
  light: {
    bgCanvas: '#F6F7F9',
    bgSurface: '#FFFFFF',
    bgSurfaceRaised: '#FFFFFF',
    textPrimary: '#15181D',
    textSecondary: '#5D6672',
    textMuted: '#7C8694',
    borderSubtle: '#DCE2EA',
    borderStrong: '#BAC5D3',
    accentPrimary: '#1769E0',
    accentPrimaryPressed: '#0E56C0',
    statusSuccess: '#079455',
    statusWarning: '#DC6803',
    statusDanger: '#D92D20',
    statusInfo: '#1769E0',
    focusRing: '#0B63F6',
  },
  dark: {
    bgCanvas: '#0F1216',
    bgSurface: '#171B21',
    bgSurfaceRaised: '#1F252D',
    textPrimary: '#F2F5F8',
    textSecondary: '#C1CAD6',
    textMuted: '#8A95A5',
    borderSubtle: '#2A313B',
    borderStrong: '#3A4553',
    accentPrimary: '#5C9DFF',
    accentPrimaryPressed: '#3F87F5',
    statusSuccess: '#34C759',
    statusWarning: '#FF9F0A',
    statusDanger: '#FF453A',
    statusInfo: '#5C9DFF',
    focusRing: '#7CB4FF',
  },
} as const;

export function useSemanticTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  return {
    scheme,
    colors: semanticColors[scheme],
    spacing,
    radius,
    elevation,
  };
}
