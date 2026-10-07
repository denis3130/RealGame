// boss growth check: health multiplier per arena and the extra move of the high tiers (screenshot while it warns)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:5300,trBest:5300,runs:9,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
console.log('boss vita per arena',await E(`JSON.stringify(ARENAS.map((A,i)=>{G.arena=i;G.diff=A.diff;G.mode='camp';G.daily=null;SAVE.trophies=A.t;const a=bossMul();SAVE.trophies=(ARENAS[i+1]||{t:A.t+3000}).t-1;const b=bossLvl();return A.n+': '+a.toFixed(2)+'→'+bossMul().toFixed(2)+' vel '+b.spd.toFixed(2)}))`));
await E(`SAVE.trophies=5300;document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(2500);
await E(`G.enemies=[];const e=makeE('golem',180,220,0);e.intro=0;G.enemies.push(e);G.state='play';P.x=180;P.y=520;window.__g=setInterval(()=>{P.hp=P.maxhp},100)`);
let shot=0;for(let i=0;i<40&&shot<2;i++){await p.waitForTimeout(250);if(await E(`G.enemies[0]&&G.enemies[0].xWarn>.2`)){await p.screenshot({path:'bx_warn'+shot+'.png'});await p.waitForTimeout(700);await p.screenshot({path:'bx_ring'+shot+'.png'});shot++}}
console.log('mossa in più vista',shot,errs);await b.close()})();
