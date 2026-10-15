import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { captureEvidence } from './captureFlow';

export const takeEvidence = () => captureEvidence({
  cameraPermission: ImagePicker.requestCameraPermissionsAsync,
  locationPermission: Location.requestForegroundPermissionsAsync,
  now: Date.now,
  takePhoto: async () => {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.7, exif: false });
    return result.canceled ? null : result.assets[0]?.uri ?? null;
  },
  position: async () => {
    if (!await Location.hasServicesEnabledAsync()) throw Error('GPS đang tắt. Hãy bật dịch vụ vị trí rồi thử lại.');
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const fix = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, mayShowUserSettingsDialog: true }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Error('Chưa lấy được GPS. Hãy ra nơi thoáng và thử lại.')), 30000); }),
      ]);
      return { latitude: fix.coords.latitude, longitude: fix.coords.longitude, accuracy: fix.coords.accuracy, locationAt: fix.timestamp, mocked: fix.mocked };
    } finally { clearTimeout(timer); }
  },
});
