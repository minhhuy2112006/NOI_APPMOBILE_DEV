import { campaigns } from '../campaigns/data';
import { campaignData } from '../contributions/campaignData';
import type { ScreenContext } from './context';
export function routeContext(route: string): ScreenContext {
  const context: ScreenContext = { route, source: 'demo', scope: 'NOI', facts: {} };
  const segments = route.split('/').filter(Boolean);
  if (segments[0] === 'campaigns') {
    const c = campaigns.find(c => c.id === segments[1]);
    context.scope = 'Chiến dịch';
    if (c) context.facts.campaign = { id: c.id, title: c.title, organization: c.organization, schedule: c.schedule, location: c.location, description: c.description };
  } else if (segments[0] === 'contributions' && segments.length > 1) {
    const c = campaignData[segments.at(-1)!];
    context.scope = segments[1] === 'donate' ? 'Quyên góp' : 'Chi tiết đóng góp';
    if (c) context.facts.campaign = { id: c.id, title: c.title, beneficiary: c.beneficiary, organization: c.organization, schedule: c.duration, progress: { raised: c.raised, target: c.target }, transparency: c.transparency.map(t => ({ title: t.title, amount: t.amount, date: t.date })) };
  } else context.scope = ({ '/': 'Chiến dịch', '/contributions': 'Đóng góp', '/about': 'Về NOI', '/store': 'Cửa hàng', '/account': 'Tài khoản', '/assignments': 'Công việc', '/attendance': 'Điểm danh' } as Record<string, string>)[route] ?? 'NOI';
  return context;
}
