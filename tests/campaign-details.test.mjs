import test from 'node:test';
import assert from 'node:assert/strict';
import { campaigns } from '../src/features/campaigns/data.ts';
import { campaignDetails, participationState } from '../src/features/campaigns/details.ts';

test('every campaign has its own complete detail content and a timeline matching its hours', () => {
  for (const campaign of campaigns) {
    const detail = campaignDetails[campaign.id];
    assert.ok(detail, campaign.id);
    assert.ok(detail.tasks.length > 0);
    assert.ok(detail.timeline.length > 0);
    const [start, end] = campaign.timeLabel.split('–').map(value => value.trim());
    assert.equal(detail.timeline[0].time.split('–')[0].trim(), start);
    assert.equal(detail.timeline.at(-1).time.split('–')[1].trim(), end);
    for (let i = 1; i < detail.timeline.length; i++) {
      assert.equal(detail.timeline[i - 1].time.split('–')[1].trim(), detail.timeline[i].time.split('–')[0].trim());
    }
  }
});

test('demo registration fills the final seat and cancellation restores availability', () => {
  assert.deepEqual(participationState(39, 40, true), { count: 40, remaining: 0, full: true, progress: 1 });
  assert.equal(participationState(39, 40, false).remaining, 1);
  assert.equal(participationState(39, 40, false).full, false);
});

test('full and over-capacity campaigns stay closed with bounded progress', () => {
  for (const count of [20, 25]) {
    const state = participationState(count, 20, false);
    assert.equal(state.full, true);
    assert.equal(state.remaining, 0);
    assert.equal(state.progress, 1);
  }
});

test('zero capacity never produces an invalid progress value', () => {
  assert.equal(participationState(0, 0, false).progress, 0);
  assert.equal(participationState(0, 0, false).full, true);
});
