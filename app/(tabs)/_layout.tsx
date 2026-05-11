import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isWeb ? '#b6d9fc' : Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: isWeb ? '#81899b' : Colors[colorScheme ?? 'light'].icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: isWeb
          ? {
              backgroundColor: '#05060f',
              borderTopColor: 'rgba(186, 215, 247, 0.12)',
              borderTopWidth: 1,
              height: 64,
              paddingBottom: 8,
            }
          : undefined,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Renovaciones',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text" color={color} />,
        }}
      />
    </Tabs>
  );
}
