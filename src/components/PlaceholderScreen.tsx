import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/tokens';

type Props = {
  title: string;
  description: string;
};

export function PlaceholderScreen({ title, description }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.notice}>Nội dung đang được chuẩn bị.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, padding: 24, gap: 16 },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.text },
  description: { fontSize: 16, lineHeight: 25, color: theme.colors.text },
  notice: { fontSize: 14, lineHeight: 22, color: theme.colors.muted },
});
