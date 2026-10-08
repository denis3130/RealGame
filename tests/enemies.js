// every normal enemy in its chapter's room, alive for a few seconds, close up
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},set:{big:false},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1200);
const sets=[[1,['slime','bigslime','bat','goblin','skeleton','mushroom','wisp','beetle','plant','eyeflower','shadoweye','necro']],[2,['imp','magmaslime','obsidian','pyro','bomber','bonelet']],[3,['frog','mosquito','croc','snail','tadpole']],[4,['wolf','snowspirit','icesentinel']]];
for(const [ch,list] of sets){await E(`(()=>{P.inv=1e9;P.hp=P.maxhp=1e9;P.atk=0;G.chapter=${ch};G.room=3;G.event=null;rollDark=()=>false;buildRoom();G.rocks=[];fields={};G.enemies=[];const L=${JSON.stringify(list)};L.forEach((t,i)=>{const e=makeE(t,60+(i%4)*80,140+Math.floor(i/4)*120,0);e.hp=e.max=1e9;G.enemies.push(e)});P.x=180;P.y=600;camSnap()})()`);
  await p.waitForTimeout(3000);await p.screenshot({path:`en_${ch}.png`,clip:{x:0,y:60,width:390,height:520}})}
console.log(errs);await b.close()})();
