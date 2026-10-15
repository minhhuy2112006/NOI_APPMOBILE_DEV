import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyRegistration, validateContact, validateRegistration, toggleRole } from '../src/features/campaigns/registration.ts';
const valid = { ...emptyRegistration, name: 'Nguyễn An', phone: '0901234567', email: 'demo@example.com', roles: ['Hỗ trợ hậu cần'] };

test('contact validation rejects empty fields and accepts valid Vietnamese formats', () => {
  assert.deepEqual(Object.keys(validateContact(emptyRegistration)).sort(), ['email', 'name', 'phone']);
  for (const phone of ['0901234567', '+84 901 234 567', '0901-234-567']) {
    assert.deepEqual(validateContact({ ...valid, phone }), {});
  }
});
test('malformed contact information cannot proceed', () => {
  for (const phone of ['123', '09012345678', 'abc0901234567', '0001234567']) assert.ok(validateContact({ ...valid, phone }).phone);
  for (const email of ['not-an-email', 'a @b.com', 'a@b']) assert.ok(validateContact({ ...valid, email }).email);
  assert.ok(validateContact({ ...valid, name: ' ' }).name);
});
test('submit requires consent, available capacity and a role', () => {
  assert.deepEqual(validateRegistration(valid, true, true), {});
  assert.ok(validateRegistration(valid, false, true).consent);
  assert.ok(validateRegistration(valid, true, false).capacity);
  assert.ok(validateRegistration({ ...valid, roles: [] }, true, true).roles);
});
test('optional message has a strict 300 character boundary', () => {
  assert.equal(validateRegistration({ ...valid, message: 'a'.repeat(300) }, true, true).message, undefined);
  assert.ok(validateRegistration({ ...valid, message: 'a'.repeat(301) }, true, true).message);
});
test('no-preference role is exclusive and selection is reversible without mutation', () => {
  const original = ['Hậu cần', 'Điều phối'];
  assert.deepEqual(toggleRole(original, 'Không có ưu tiên'), ['Không có ưu tiên']);
  assert.deepEqual(original, ['Hậu cần', 'Điều phối']);
  assert.deepEqual(toggleRole(['Không có ưu tiên'], 'Hậu cần'), ['Hậu cần']);
  assert.deepEqual(toggleRole(['Không có ưu tiên'], 'Không có ưu tiên'), []);
  assert.deepEqual(toggleRole(original, 'Hậu cần'), ['Điều phối']);
});
