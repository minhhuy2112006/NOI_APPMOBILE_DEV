import test from 'node:test';
import assert from 'node:assert/strict';
import { approved, confirm, validateCapture, distanceMeters, status, durationLabel, monthCells } from '../src/features/attendance/model.ts';
import { captureEvidence, PermissionError } from '../src/features/attendance/captureFlow.ts';
const now=Date.parse('2026-10-07T07:02:00+07:00');
const a={id:'a',campaignId:'c',campaignTitle:'C',title:'A',start:'2026-10-07T07:00:00+07:00',end:'2026-10-07T11:30:00+07:00',location:'L',latitude:0,longitude:0,campaignStatus:'published'};
const registrations=[{user_id:'v',campaign_id:'c',status:'confirmed'}];
const evidence={photo:'camera-new.jpg',capturedAt:now-1000,locationAt:now,latitude:0,longitude:0,accuracy:5};
test('only confirmed registrations appear and can check in',()=>{
 for(const state of ['submitted','selected','rejected','cancelled','completed']){
  const rows=[{...registrations[0],status:state}];assert.equal(approved([a],rows,'v').length,0);assert.throws(()=>confirm(a,rows,'v','in',evidence,undefined,now));
 }
 assert.equal(approved([a],registrations,'v').length,1);
 assert.equal(approved([a],registrations,'other').length,0);
});
test('Haversine boundary <=100 passes, >100 fails without rounding',()=>{
 const latitude=m=>m/6371000*180/Math.PI;
 assert.ok(Math.abs(distanceMeters(0,0,latitude(100),0)-100)<1e-9);
 for(const d of [0,99.9,100])assert.doesNotThrow(()=>validateCapture(a,{...evidence,latitude:latitude(d)},now));
 for(const d of [100.01,101,500])assert.throws(()=>validateCapture(a,{...evidence,latitude:latitude(d)},now),/Bạn chưa ở trong khu vực diễn ra hoạt động/);
});
test('check-in/out, history duration and duplicate protection',()=>{
 const record=confirm(a,registrations,'v','in',evidence,undefined,now);
 assert.equal(status(a,record,now),'DANG_THAM_GIA');
 assert.throws(()=>confirm(a,registrations,'v','in',evidence,record,now));
 const outTime=Date.parse('2026-10-07T11:28:00+07:00');
 const out={...evidence,photo:'new-out.jpg',capturedAt:outTime-1000,locationAt:outTime};
 const done=confirm(a,registrations,'v','out',out,record,outTime);
 assert.equal(durationLabel(done.actualDuration),'4 giờ 26 phút');assert.equal(status(a,done,outTime),'HOAN_TAT');
 assert.equal(done.checkIn.photo,'camera-new.jpg');assert.equal(done.checkOut.photo,'new-out.jpg');
 assert.throws(()=>confirm(a,registrations,'v','out',out,done,outTime));
 assert.throws(()=>confirm(a,registrations,'v','out',out,undefined,outTime));
 assert.equal(JSON.parse(JSON.stringify(done)).checkOut.latitude,0);
});
test('reject old GPS/photos, missing accuracy, spoofing, missing venue and closed window',()=>{
 const record=confirm(a,registrations,'v','in',evidence,undefined,now);
 assert.throws(()=>confirm(a,registrations,'v','out',evidence,record,now+1000));
 for(const update of [{locationAt:now-5000},{capturedAt:now-121000},{accuracy:null},{accuracy:101},{latitude:NaN},{mocked:true}]) assert.throws(()=>validateCapture(a,{...evidence,...update},now));
 assert.throws(()=>confirm({...a,latitude:null},registrations,'v','in',evidence,undefined,now));
 assert.throws(()=>confirm(a,registrations,'v','in',evidence,undefined,now+86400000));
 assert.equal(status(a,undefined,now),'CHUA_CHECK_IN');assert.equal(status(a,record,Date.parse(a.start)-1),'DA_CHECK_IN');assert.equal(status(a,record,Date.parse(a.end)),'CHO_CHECK_OUT');
});
test('camera/location denials and camera cancellation are safe; every flow requests fresh GPS',async()=>{
 let calls=[];
 const device={now:()=>now,cameraPermission:async()=>({granted:true,canAskAgain:true}),locationPermission:async()=>({granted:true,canAskAgain:true}),takePhoto:async()=>{calls.push('photo');return 'photo';},position:async()=>{calls.push('gps');return {...evidence};}};
 await assert.rejects(captureEvidence({...device,cameraPermission:async()=>({granted:false,canAskAgain:false})}),PermissionError);assert.deepEqual(calls,[]);
 assert.equal(await captureEvidence({...device,takePhoto:async()=>null}),null);assert.deepEqual(calls,[]);
 await assert.rejects(captureEvidence({...device,locationPermission:async()=>({granted:false,canAskAgain:true})}),PermissionError);assert.deepEqual(calls,['photo']);
 calls=[];await captureEvidence(device);await captureEvidence(device);assert.deepEqual(calls,['photo','gps','photo','gps']);
});
test('calendar handles leap year and month boundaries',()=>{assert.equal(monthCells(2028,1).filter(Boolean).length,29);assert.equal(monthCells(2026,11).filter(Boolean).length,31);});
