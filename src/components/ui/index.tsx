import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/tokens';

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, (pressed || disabled) && { opacity: 0.6 }]}>
    <LinearGradient pointerEvents="none" colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>;
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
    style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && { opacity: 0.7 }]}>
    <Text style={[styles.chipText, selected && { color: theme.colors.primaryInk }]}>{label}</Text>
  </Pressable>;
}

export const typography = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '700', lineHeight: 38, color: theme.colors.text },
  heading: { fontSize: 21, fontWeight: '700', lineHeight: 29, color: theme.colors.text },
  body: { fontSize: 16, lineHeight: 25, color: theme.colors.text },
  muted: { fontSize: 14, lineHeight: 22, color: theme.colors.muted },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: theme.colors.primaryInk },
});

const styles = StyleSheet.create({
  card: { padding: theme.space.lg, gap: theme.space.md, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  button: { minHeight: 48, padding: theme.space.md, borderRadius: theme.radius.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary },
  buttonText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  chip: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.selectedBorder },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
});
