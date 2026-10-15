import { campaigns } from '../campaigns/data';
import { campaignDetails } from '../campaigns/details';
import { demoSession } from '../assignments/demo';
import type { Milestone } from './model';

// Adapt the existing presentation schedule; no fake API and no extra task copies.
const items: Milestone[] = campaigns.flatMap(c => {
  const [day, month, year] = c.dateLabel.match(/\d{2}\/\d{2}\/\d{4}/)![0].split('/');
  const date = `${year}-${month}-${day}`;
  const group = demoSession.read().groups.find(g => g.campaign_id === c.id);
  return (campaignDetails[c.id]?.timeline ?? []).map((entry, index) => {
    const times = entry.time.match(/\d{2}:\d{2}/g)!;
    return { id: `${c.id}-milestone-${index}`, campaignId: c.id, groupId: group?.id ?? null, title: entry.title, date,
      startTime: `${date}T${times[0]}:00+07:00`, endTime: `${date}T${times[1]}:00+07:00`, location: c.location, description: entry.text,
      responsibleId: group?.leader_id ?? 'demo-lan', volunteerCount: group?.member_ids.length ?? 0,
      // Explicit demo association, not inferred by overlapping times or task names.
      taskIds: index === 0 ? demoSession.read().tasks.filter(t => t.group_id === group?.id).map(t => t.id) : [],
      completedAt: null, completedBy: null, version: 1 };
  });
});
export const scheduleSession = {
  read: () => items,
  save: (next: Milestone) => { const index = items.findIndex(m => m.id === next.id); if (index >= 0) items[index] = next; },
};
