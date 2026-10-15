import { sessionStore } from '../../lib/sessionStore';
export const initialProfile = { name: 'Huy', quote: 'Mỗi hành động nhỏ đều có thể tạo nên thay đổi lớn.', birthday: '', city: '', phone: '', email: '', skills: '', interests: '', purpose: '', goalHours: '100', goalYear: '2026' };
export const profileSession = sessionStore(initialProfile);
export const accountSession = sessionStore({ active: true });
// Existing presentation stats, deliberately isolated from real attendance records.
export const sampleJourney = { activities: 12, hours: 86 };
export const notificationSession = sessionStore({ campaign: true, attendance: true, donation: true, noi: true });
export const supportDraft = sessionStore({ subject: '', message: '' });
export function exitDemo() { accountSession.set({ active: false }); profileSession.set(initialProfile); }
