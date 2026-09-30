import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { theme } from '../../theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabs = [
  { name: 'index', title: 'Chiến dịch', icon: 'megaphone-outline' },
  { name: 'contributions', title: 'Đóng góp', icon: 'heart-outline' },
  { name: 'about', title: 'Về NOI', icon: 'leaf-outline' },
  { name: 'store', title: 'Cửa hàng', icon: 'bag-outline' },
  { name: 'account', title: 'Tài khoản', icon: 'person-outline' },
] as const satisfies readonly { name: string; title: string; icon: IconName }[];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs initialRouteName="index" screenOptions={{ tabBarLabelStyle: { fontSize: 11, marginTop: 2 }, tabBarIconStyle: { height: 26 }, tabBarLabelPosition: 'below-icon', tabBarActiveTintColor: theme.colors.primary, tabBarInactiveTintColor: theme.colors.muted, headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.text, tabBarStyle: { height: 50 + insets.bottom, paddingTop: 4, paddingBottom: insets.bottom, backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border } }}>
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            headerShown: false,
            tabBarAccessibilityLabel: title,
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon} color={color} size={size} />{focused && <View style={{ position: 'absolute', top: -5, width: 18, height: 2, borderRadius: 2, backgroundColor: color }} />}</View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}






