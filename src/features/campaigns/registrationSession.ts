import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { demoSession } from '../assignments/demo';
import { updateApplication } from './registrationState';
const listeners = new Set<() => void>();
const registered = (campaignId: string) => demoSession.read().applications.some(item => item.user_id === demoSession.actor() && item.campaign_id === campaignId && ['submitted', 'selected', 'waitlisted', 'confirmed', 'completed'].includes(item.status));
export function useCampaignRegistration(campaignId: string) {
  const [joined, setJoined] = useState(() => registered(campaignId));
  useFocusEffect(useCallback(() => {
    const refresh = () => setJoined(registered(campaignId));
    refresh();
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [campaignId]));
  return joined;
}
// Reuses the applications read by assignments and attendance. No API request.
export function saveDemoRegistration(campaignId: string, action: 'submit' | 'cancel') {
  const snapshot = demoSession.read();
  demoSession.save({ ...snapshot, applications: updateApplication(snapshot.applications, demoSession.actor(), campaignId, action) });
  listeners.forEach(listener => listener());
}
