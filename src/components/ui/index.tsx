import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/tokens';

export function ActionBackground({ radius = 12, pressed = false, disabled = false, loading = false }: { radius?: number; pressed?: boolean; disabled?: boolean; loading?: boolean }) {
  return <LinearGradient pointerEvents="none" colors={loading ? theme.buttons.gradient : disabled ? theme.buttons.disabledGradient : pressed ? theme.buttons.pressedGradient : theme.buttons.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />;
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function Button({ title, onPress, disabled = false, loading = false, loadingTitle = 'Đang xử lý…' }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean; loadingTitle?: string }) {
  const blocked = disabled || loading;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: blocked, busy: loading }} disabled={blocked} onPress={onPress} style={styles.button}>
    {({ pressed }) => <>
      <ActionBackground pressed={pressed} disabled={disabled} loading={loading} radius={theme.radius.sm} />
      {loading && <ActivityIndicator color={theme.buttons.primaryText} style={{ position: 'absolute', left: theme.space.md }} />}
      <Text style={[styles.buttonText, disabled && !loading && { color: theme.buttons.disabledText }]}>{loading ? loadingTitle : title}</Text>
    </>}
  </Pressable>;
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
    style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && { opacity: 0.7 }]}>
    <Text style={[styles.chipText, selected && { color: theme.buttons.text }]}>{label}</Text>
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
  button: { minHeight: 48, padding: theme.space.md, borderRadius: theme.radius.sm, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.buttons.secondaryBackground },
  buttonText: { color: theme.buttons.primaryText, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  chip: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center' },
  selected: { backgroundColor: theme.buttons.secondaryBackground, borderColor: theme.buttons.border },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
});
