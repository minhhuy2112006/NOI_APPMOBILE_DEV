import test from 'node:test';
import assert from 'node:assert/strict';
import { assignTask, createGroup, transition, allowedActions, displayStatus } from '../src/features/assignments/model.ts';
const volunteer = { id: 'v', name: 'V', role: 'volunteer', organization_id: null };
const leader = { ...volunteer, id: 'l' };
const organizer = { ...volunteer, id: 'o', role: 'organizer', organization_id: 'org' };
const stranger = { ...organizer, id: 'other', organization_id: 'other' };
const now = '2026-10-06T01:00:00Z';
function fixture() {
  const s = { people: [volunteer, leader, organizer, stranger], campaigns: [{ id: 'c', title: 'C', organization_id: 'org' }], applications: [{ id: 'av', user_id: 'v', campaign_id: 'c', status: 'confirmed' }, { id: 'al', user_id: 'l', campaign_id: 'c', status: 'confirmed' }], groups: [], tasks: [], assignments: [], events: [] };
  return createGroup(s, organizer, { id: 'g', campaign_id: 'c', name: 'G', leader_id: 'l', member_ids: ['v'] });
}
const draft = { group_id: 'g', title: 'T', description: 'D', location: 'L', requirements: '', starts_at: now, ends_at: '2026-10-06T04:00:00Z', deadline: '2026-10-06T05:00:00Z', member_ids: ['v'] };
const assigned = () => assignTask(fixture(), leader, draft, 't', now);
function command(s, actor, action, reason) { const a=s.assignments[0]; return transition(s, actor, { assignment_id: a.id, expected_version: a.version, action, reason }, now); }
test('direct assignment → start → submit → leader confirmation with audit', () => {
  let s=assigned(); assert.equal(s.assignments[0].status,'DA_PHAN_CONG');
  assert.deepEqual(allowedActions(s,volunteer,s.assignments[0]),['start']);
  s=command(s,volunteer,'start'); s=command(s,volunteer,'submit');
  assert.equal(s.assignments[0].status,'CHO_XAC_NHAN');
  assert.throws(()=>command(s,volunteer,'confirm'));
  s=command(s,leader,'confirm'); assert.equal(s.assignments[0].status,'HOAN_THANH');
  assert.equal(s.assignments[0].confirmed_by,'l'); assert.equal(s.assignments[0].confirmed_at,now);
  assert.equal(s.events.length,3); assert.deepEqual(allowedActions(s,volunteer,s.assignments[0]),[]);
});
test('review requires nonblank reason; rework can be started and resubmitted', () => {
  let s=command(command(assigned(),volunteer,'start'),volunteer,'submit');
  assert.throws(()=>command(s,leader,'rework','   '));
  s=command(s,leader,'rework','Bổ sung dụng cụ'); assert.equal(s.assignments[0].rework_reason,'Bổ sung dụng cụ');
  assert.throws(()=>command(s,volunteer,'submit'));
  s=command(command(s,volunteer,'start'),volunteer,'submit');
  s=command(s,organizer,'confirm'); assert.equal(s.assignments[0].confirmed_by,'o');
});
test('no cross-organization/group access, self approval or stale/double submit', () => {
  let s=assigned(); assert.throws(()=>assignTask(s,stranger,draft,'x',now));
  assert.throws(()=>command(s,leader,'start')); assert.throws(()=>command(s,volunteer,'confirm'));
  s=command(s,volunteer,'start'); const a=s.assignments[0];
  s=command(s,volunteer,'submit');
  assert.throws(()=>transition(s,volunteer,{assignment_id:a.id,expected_version:a.version,action:'submit'},now));
  assert.throws(()=>command(s,stranger,'confirm'));
  assert.throws(()=>command(s,{...leader,id:'unrelated-leader'},'confirm'));
  let own=assignTask(fixture(),leader,{...draft,member_ids:['l']},'own',now);
  own=command(command(own,leader,'start'),leader,'submit'); assert.throws(()=>command(own,leader,'confirm'));
  assert.equal(command(own,organizer,'confirm').assignments[0].status,'HOAN_THANH');
});
test('group/membership validation and atomic assignment creation', () => {
  const s=fixture(); assert.throws(()=>createGroup(s,leader,{...s.groups[0],id:'g2'}));
  assert.throws(()=>assignTask(s,leader,{...draft,member_ids:['v','unknown']},'t',now));
  assert.equal(s.tasks.length,0); assert.equal(s.assignments.length,0);
  assert.throws(()=>assignTask(s,leader,{...draft,ends_at:now},'t',now));
  assert.throws(()=>assignTask(s,leader,{...draft,deadline:'invalid'},'t',now));
  s.applications[0].status='cancelled'; assert.throws(()=>assignTask(s,leader,draft,'t',now));
});
test('overdue is derived, does not erase pending review or completion', () => {
  let s=assigned(); const task=s.tasks[0], later=Date.parse('2026-10-07T00:00:00Z');
  assert.equal(displayStatus(s.assignments[0],task,later),'QUA_HAN');
  s=command(command(s,volunteer,'start'),volunteer,'submit');
  assert.equal(displayStatus(s.assignments[0],task,later),'CHO_XAC_NHAN');
  s=command(s,leader,'confirm'); assert.equal(displayStatus(s.assignments[0],task,later),'HOAN_THANH');
});
