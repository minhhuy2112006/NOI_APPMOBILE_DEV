import type { Capture } from './model';
export class PermissionError extends Error {
  permission: 'camera' | 'location';
  canAskAgain: boolean;
  constructor(permission: 'camera' | 'location', canAskAgain: boolean) { super(permission === 'camera' ? 'Cần cấp quyền camera để chụp ảnh điểm danh.' : 'Cần cấp quyền vị trí để xác nhận bạn có mặt tại hoạt động.'); this.permission = permission; this.canAskAgain = canAskAgain; }
}
type Permission = { granted: boolean; canAskAgain: boolean };
export type CaptureDevice = {
  cameraPermission: () => Promise<Permission>; locationPermission: () => Promise<Permission>;
  takePhoto: () => Promise<string | null>;
  position: () => Promise<Omit<Capture, 'photo' | 'capturedAt'>>;
  now: () => number;
};
// Called afresh for each check-in AND check-out; no cached location/photo argument.
export async function captureEvidence(device: CaptureDevice): Promise<Capture | null> {
  const camera = await device.cameraPermission();
  if (!camera.granted) throw new PermissionError('camera', camera.canAskAgain);
  const photo = await device.takePhoto();
  if (!photo) return null;
  const capturedAt = device.now();
  const location = await device.locationPermission();
  if (!location.granted) throw new PermissionError('location', location.canAskAgain);
  return { photo, capturedAt, ...await device.position() };
}
