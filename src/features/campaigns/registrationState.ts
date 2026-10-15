import type { ApplicationRef } from '../assignments/model';
export function updateApplication(items: ApplicationRef[], userId: string, campaignId: string, action: 'submit' | 'cancel'): ApplicationRef[] {
  const previous = items.find(item => item.user_id === userId && item.campaign_id === campaignId);
  // A demo submission never approves a volunteer, nor downgrades prior approval.
  if (action === 'submit' && previous && ['submitted', 'selected', 'waitlisted', 'confirmed', 'completed'].includes(previous.status)) return items;
  if (action === 'cancel' && (!previous || previous.status === 'completed')) return items;
  const next: ApplicationRef = { id: previous?.id ?? `local-${campaignId}-${userId}`, user_id: userId, campaign_id: campaignId, status: action === 'submit' ? 'submitted' : 'cancelled' };
  return previous ? items.map(item => item.id === previous.id ? next : item) : [...items, next];
}
