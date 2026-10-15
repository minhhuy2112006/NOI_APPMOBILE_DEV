import { demoSession } from '../assignments/demo';
import { updateApplication } from './registrationState';
// Reuses the applications read by assignments and attendance. No API request.
export function saveDemoRegistration(campaignId: string, action: 'submit' | 'cancel') {
  const snapshot = demoSession.read();
  demoSession.save({ ...snapshot, applications: updateApplication(snapshot.applications, demoSession.actor(), campaignId, action) });
}
