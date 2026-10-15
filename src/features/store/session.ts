import { sessionStore } from '../../lib/sessionStore';
import { initialWallet } from './model';
export const walletSession = sessionStore(initialWallet);
