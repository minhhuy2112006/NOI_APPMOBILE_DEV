import { sessionStore } from '../../lib/sessionStore';
export const initialProfile = { name: 'Nguyễn Bảo Khôi', quote: 'Mỗi hành động nhỏ đều có thể tạo nên thay đổi lớn.', birthday: '02/11/2006', gender: 'Nam', city: 'Quận 2 Thảo Điền', phone: '0987654321', email: 'paokhoi1111@gmail.com', emergencyName: 'Park Po Gum', emergencyRelationship: 'Cha', emergencyPhone: '0123456789', avatarUri: '', skills: 'Giao tiếp, Làm việc nhóm, Hậu cần, Chụp ảnh', interests: 'Giáo dục, Môi trường, Cộng đồng, Trẻ em', purpose: '', goalHours: '100', goalYear: '2026' };
export const profileSession = sessionStore(initialProfile);
export const accountSession = sessionStore({ active: true });
// Existing presentation stats, deliberately isolated from real attendance records.
export const sampleJourney = { activities: 12, hours: 86 };
export const notificationSession = sessionStore({ campaign: true, attendance: true, donation: true, noi: true });
export const supportDraft = sessionStore({ subject: '', message: '' });
export function exitDemo() { accountSession.set({ active: false }); profileSession.set(initialProfile); }
