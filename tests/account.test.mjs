import test from 'node:test';
import assert from 'node:assert/strict';
import { registrationMatches, donationMatches, paidTotal, goalPercent } from '../src/features/account/model.ts';
test('registrations separate waiting, approved, completed and cancelled', () => {
  assert.equal(registrationMatches('confirmed', 'Đã đăng ký/đã xác nhận'), true);
  assert.equal(registrationMatches('submitted', 'Đã đăng ký/đã xác nhận'), false);
  assert.equal(registrationMatches('waitlisted', 'Đang chờ'), true);
  assert.equal(registrationMatches('completed', 'Đã tham gia'), true);
  assert.equal(registrationMatches('cancelled', 'Đã hủy'), true);
  assert.equal(registrationMatches('rejected', 'Đã hủy'), false);
});
test('donation total excludes demo, pending and cancelled transactions', () => {
  const entries = [{ amount: 100, source: 'backend', status: 'paid' }, { amount: 200, source: 'demo', status: 'paid' }, { amount: 300, source: 'backend', status: 'pending' }, { amount: 400, source: 'backend', status: 'cancelled' }, { amount: 500 }];
  assert.equal(paidTotal(entries), 100);
  assert.equal(entries.filter(e => donationMatches(e, 'Đang chờ')).length, 1);
  assert.equal(entries.filter(e => donationMatches(e, 'Đã hủy')).length, 1);
  assert.equal(donationMatches({ amount: 500 }, 'Đã thanh toán'), false);
  assert.equal(entries.filter(e => donationMatches(e, 'Tất cả')).length, 5);
});
test('goal progress is bounded for empty and exceeded goals', () => {
  assert.equal(goalPercent(86, 100), 86);
  assert.equal(goalPercent(120, 100), 100);
  assert.equal(goalPercent(86, 0), 0);
});

import { updateApplication } from '../src/features/campaigns/registrationState.ts';
import { approved } from '../src/features/attendance/model.ts';
test('new registration is shared but never auto-approved for attendance', () => {
  const items = updateApplication([], 'user', 'campaign', 'submit');
  assert.equal(items[0].status, 'submitted');
  assert.equal(approved([{ campaignId: 'campaign' }], items, 'user').length, 0);
  assert.equal(updateApplication(items, 'user', 'campaign', 'submit').length, 1);
  const cancelled = updateApplication(items, 'user', 'campaign', 'cancel');
  assert.equal(cancelled[0].status, 'cancelled');
  assert.equal(updateApplication(cancelled, 'user', 'campaign', 'submit')[0].id, items[0].id);
  const confirmed = [{ ...items[0], status: 'confirmed' }];
  assert.equal(updateApplication(confirmed, 'user', 'campaign', 'submit')[0].status, 'confirmed');
  assert.equal(approved([{ campaignId: 'campaign' }], confirmed, 'user').length, 1);
  assert.equal(updateApplication(confirmed, 'other', 'campaign', 'submit')[0].status, 'confirmed');
});
