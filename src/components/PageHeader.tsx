import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/tokens';

export function PageHeader({ title, subtitle, brand }: { title: string; subtitle: string; brand?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>{brand ?? <View style={{ transform: [{ rotate: '-6deg' }] }}><Text style={{ fontSize: 32, fontWeight: '900', letterSpacing: -2 }}><Text style={{ color: '#BC3F9D' }}>N</Text><Text style={{ color: '#8A5BD0' }}>O</Text><Text style={{ color: '#4875DA' }}>I</Text></Text><Text style={{ fontSize: 8, lineHeight: 11, color: '#5C6A80', fontStyle: 'italic' }}>Cùng nhau lan tỏa</Text></View>}</View>
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { paddingTop: 14, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brand: { width: 62 },
  copy: { flex: 1, minHeight: 50 },
  title: { fontSize: 23, lineHeight: 30, fontWeight: '900', color: theme.colors.primaryInk },
  subtitle: { fontSize: 11, lineHeight: 17, color: theme.colors.muted, marginTop: 3 },
});

