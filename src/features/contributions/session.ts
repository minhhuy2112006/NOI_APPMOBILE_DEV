import { sessionStore } from '../../lib/sessionStore';
export type DonationEntry = { id: string; target: string; amount: number; date: string; status?: 'paid' | 'pending' | 'cancelled'; method?: string; source?: 'demo' | 'backend' };
export const donationSession = sessionStore<DonationEntry[]>([]);
