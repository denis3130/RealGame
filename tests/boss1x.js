const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:0,runs:4,introSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);
await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun();const idx=G.seq.findIndex(s=>s.c===5);G.si=idx-1;nextStep();setInterval(()=>{P.hp=P.maxhp},100)`));
await p.waitForTimeout(5000);await p.evaluate(()=>__E(`const e=G.enemies.find(e=>isBoss(e.type));e.hp=e.max*.3`));await p.waitForTimeout(2500);await p.screenshot({path:"b1_0.png"});
await p.evaluate(()=>__E(`const e=G.enemies.find(e=>isBoss(e.type));e.hp=1;hurtE(e,10,false)`));
const t0=Date.now();const log=[];
for(let i=0;i<16;i++){await p.waitForTimeout(700);await p.screenshot({path:`b1_${i+1}.png`});log.push(((Date.now()-t0)/1000).toFixed(1)+' '+await p.evaluate(()=>__E(`JSON.stringify({st:G.state,bd:!$('bossDown').hidden,rp:RP.on,wh:!$('whScr').hidden,door:G.door,ct:G.clearT,pa:paused,mo:modal,st2:started,rpa:!!RP.after,pend:RP.pending,en:G.enemies.length,ended:G.ended})`)))}
console.log(log.join('\n'),errs);await b.close()})();
