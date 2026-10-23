import { Image, StyleSheet, View } from 'react-native';

export function WelcomeScreen({ onReady }: { onReady: () => void }) {
  return (
    <View style={styles.screen}>
      <Image
        source={require('../../assets/branding/noi-sprout-transparent.png')}
        onLoad={onReady}
        onError={onReady}
        resizeMode="contain"
        style={styles.logo}
        accessibilityLabel="Logo NOI"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
    top: '32%',
    width: 180,
    height: 180,
    transform: [{ translateY: -90 }],
  },
});