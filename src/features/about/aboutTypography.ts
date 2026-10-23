import { Platform, useWindowDimensions, type TextStyle } from 'react-native';
import { useFonts, Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';

/** Uses the same scale and typography as ImpactScreen. */
export function useAboutTypography() {
  const { width } = useWindowDimensions();
  const u = Math.min(width, 520) / 853;
  const [loaded] = useFonts({ Lora_400Regular, Lora_400Regular_Italic });
  const serif = loaded ? 'Lora_400Regular' : Platform.OS === 'ios' ? 'Georgia' : 'serif';
  return {
    header: { fontSize: 29 * u, lineHeight: 37 * u, fontWeight: '700', color: '#0D2E68' } as TextStyle,
    hero: { fontFamily: serif, fontSize: 58 * u, lineHeight: 65 * u, letterSpacing: -1.9 * u, fontWeight: '400', color: '#0C2D67' } as TextStyle,
    accent: { fontFamily: loaded ? 'Lora_400Regular_Italic' : serif, fontStyle: loaded ? 'normal' : 'italic', color: '#EE579D' } as TextStyle,
  };
}
