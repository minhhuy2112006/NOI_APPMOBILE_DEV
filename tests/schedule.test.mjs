import test from 'node:test';
import assert from 'node:assert/strict';
import { byDay, milestoneStatus, completeMilestone, linkedAssignments, progress } from '../src/features/schedule/model.ts';
const base = { id:'m',campaignId:'c',groupId:'g',title:'Hoạt động',date:'2026-10-06',startTime:'2026-10-06T08:00:00+07:00',endTime:'2026-10-06T10:00:00+07:00',location:'L',description:'D',responsibleId:'leader',volunteerCount:2,taskIds:['t'],completedAt:null,completedBy:null,version:1 };
const actor={id:'leader',role:'volunteer',name:'Leader',organization_id:null};
const data={people:[actor],campaigns:[],applications:[],groups:[{id:'g',campaign_id:'c',leader_id:'leader',member_ids:['v']}],tasks:[{id:'t',group_id:'g'}],assignments:[{id:'a',task_id:'t',member_id:'v',status:'HOAN_THANH'}],events:[]};
test('time boundaries never auto-complete a milestone even with all tasks done',()=>{
 assert.equal(milestoneStatus(base,Date.parse('2026-10-06T07:59:00+07:00')),'SAP_DIEN_RA');
 assert.equal(milestoneStatus(base,Date.parse(base.startTime)),'DANG_DIEN_RA');
 assert.equal(milestoneStatus(base,Date.parse(base.endTime)),'CHO_CAP_NHAT_KET_QUA');
 assert.deepEqual(progress(base,data),{completed:1,total:1});
 assert.equal(milestoneStatus(base,Date.parse('2026-10-07T00:00:00+07:00')),'CHO_CAP_NHAT_KET_QUA');
});
test('multiple days and overlapping activities remain distinct and sorted',()=>{
 const overlap={...base,id:'overlap',startTime:'2026-10-06T09:00:00+07:00'};
 const next={...base,id:'next',date:'2026-10-07',startTime:'2026-10-07T08:00:00+07:00',endTime:'2026-10-07T10:00:00+07:00'};
 const days=byDay([next,overlap,base]); assert.deepEqual(days.map(d=>d.date),['2026-10-06','2026-10-07']);
 const now=Date.parse('2026-10-06T09:30:00+07:00');
 assert.equal(days[0].items.filter(m=>milestoneStatus(m,now)==='DANG_DIEN_RA').length,2);
});
test('only responsible person or matching group leader can confirm; record actor/time/version',()=>{
 const now='2026-10-06T10:30:00+07:00';
 assert.throws(()=>completeMilestone(base,{...actor,id:'v'},data,1,now));
 assert.throws(()=>completeMilestone(base,actor,data,1,'2026-10-06T07:00:00+07:00'));
 assert.throws(()=>completeMilestone(base,actor,data,0,now));
 const done=completeMilestone(base,actor,data,1,now);
 assert.equal(done.completedAt,now);assert.equal(done.completedBy,'leader');assert.equal(done.version,2);
 assert.equal(milestoneStatus(done),'HOAN_THANH');assert.throws(()=>completeMilestone(done,actor,data,2,now));
 assert.equal(base.completedAt,null);assert.equal(data.assignments[0].status,'HOAN_THANH');
 const pending={...data,assignments:[{...data.assignments[0],status:'DA_PHAN_CONG'}]};
 completeMilestone(base,actor,pending,1,now);assert.equal(pending.assignments[0].status,'DA_PHAN_CONG');
});
test('task link resolves only explicit task ids in same campaign, including empty links',()=>{
 assert.deepEqual(linkedAssignments(base,data).map(a=>a.id),['a']);
 assert.deepEqual(linkedAssignments({...base,taskIds:[]},data),[]);
 assert.deepEqual(linkedAssignments({...base,campaignId:'other'},data),[]);
 assert.equal(linkedAssignments(base,data).filter(a=>a.member_id==='leader').length,0);
});
