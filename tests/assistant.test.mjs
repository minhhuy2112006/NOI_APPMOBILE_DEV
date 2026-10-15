import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { assistantTransport, validateReply } from '../src/features/assistant/context.ts';
function load(file, dependencies={}) {
  const exports={}; const source=fs.readFileSync(file,'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,require:id=>{if(dependencies[id])return dependencies[id];if(id.includes('assets/'))return 1;throw Error(id);}});return exports;
}
const campaigns=load('src/features/campaigns/data.ts');
const donations=load('src/features/contributions/campaignData.ts');
const {routeContext}=load('src/features/assistant/routeContext.ts',{'../campaigns/data':campaigns,'../contributions/campaignData':donations});
test('no fake AI transport and no ungrounded response accepted',()=>{
 assert.equal(assistantTransport,null);
 const c={route:'/campaigns/mam-xanh',source:'demo',scope:'Chiến dịch',facts:{campaign:{id:'mam-xanh'}}};
 assert.throws(()=>validateReply({answer:'claim',evidenceKeys:[]},c));
 assert.throws(()=>validateReply({answer:'claim',evidenceKeys:['unknown']},c));
 assert.throws(()=>validateReply({answer:'claim',evidenceKeys:[],handoff:'approve-attendance'},c));
 assert.equal(validateReply({answer:'Needs review',evidenceKeys:[],handoff:'leader'},c).handoff,'leader');
 assert.equal(validateReply({answer:'Grounded response',evidenceKeys:['campaign']},c).answer,'Grounded response');
});
test('route context resolves campaign and donation without leaking private fields',()=>{
 const c=routeContext('/campaigns/mam-xanh');assert.equal(c.facts.campaign.id,'mam-xanh');assert.ok(c.facts.campaign.schedule);
 const id=Object.keys(donations.campaignData)[0];const d=routeContext('/contributions/donate/'+id);
 assert.equal(d.facts.campaign.id,id);assert.ok(d.facts.campaign.progress);assert.ok(d.facts.campaign.transparency);
 for(const key of ['donorList','gallery','image','email','phone'])assert.equal(Object.hasOwn(d.facts.campaign,key),false);
 assert.equal(Object.keys(routeContext('/campaigns/not-found').facts).length,0);
 assert.equal(routeContext('/attendance').scope,'Điểm danh');
});
test('five tabs unchanged and routes use shared assistant frame',()=>{
 const tabs=fs.readFileSync('src/app/(tabs)/_layout.tsx','utf8');assert.equal((tabs.match(/name: '/g)||[]).length,5);assert.ok(!tabs.includes('name: \'assistant\''));
 for(const route of ['(tabs)/index','(tabs)/contributions','(tabs)/about','(tabs)/store','(tabs)/account','campaigns/[id]','contributions/[id]','contributions/donate/[id]','assignments','attendance'])assert.match(fs.readFileSync('src/app/'+route+'.tsx','utf8'),/withAssistant\(Screen\)/);
});
