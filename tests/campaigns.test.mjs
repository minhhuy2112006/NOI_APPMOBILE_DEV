import test from 'node:test';
import assert from 'node:assert/strict';
import { campaigns, filterCampaigns } from '../src/features/campaigns/data.ts';

test('search handles Vietnamese accents, case and organization names', () => {
  assert.equal(filterCampaigns(campaigns, '  GUI MOT BUA COM ', '', '', false)[0]?.id, 'bua-com');
  assert.equal(filterCampaigns(campaigns, 'mam xanh', '', '', false).length, 2);
});

test('filters combine instead of overriding each other', () => {
  assert.deepEqual(filterCampaigns(campaigns, '', 'Môi trường', 'Đà Nẵng', false).map(item => item.id), ['bien-xanh']);
  assert.equal(filterCampaigns(campaigns, '', 'Môi trường', 'Đà Nẵng', true).length, 0);
});

test('empty results and clearing all filters', () => {
  assert.equal(filterCampaigns(campaigns, 'khong ton tai', '', '', false).length, 0);
  assert.equal(filterCampaigns(campaigns, '', '', '', false).length, campaigns.length);
});
