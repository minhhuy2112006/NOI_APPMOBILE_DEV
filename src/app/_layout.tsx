import { WelcomeScreen } from '../components/WelcomeScreen';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '../theme/tokens';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // A failed asset must never leave the native launch screen stuck.
    const fallback = setTimeout(() => setImageReady(true), 3000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!imageReady) return;
    void SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setWelcomeVisible(false);
      });
    }, 1500);
    return () => {
      clearTimeout(timer);
      opacity.stopAnimation();
    };
  }, [imageReady, opacity]);

  return (
    <>
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.primary, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="campaigns/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="contributions/[id]" options={{ headerShown: false}} />
      </Stack>
      <StatusBar style="dark" hidden={false} />
      {welcomeVisible && (
        <Animated.View
          accessibilityViewIsModal
          style={[styles.welcome, { opacity }]}
        >
          <WelcomeScreen onReady={() => setImageReady(true)} />
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  welcome: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 100,
    backgroundColor: '#FFFFFF',
  },
});
