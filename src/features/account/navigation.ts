import { router } from 'expo-router';
import type { Section } from './model';
export const openAccount = (section: Section) => router.push({ pathname: '/account/[section]', params: { section } });
