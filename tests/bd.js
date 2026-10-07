// the land past the walls in each chapter: corners, sides, behind the door, below
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1500);
const chs=(process.argv[2]||'1,2,3,4').split(',');
for(const ch of chs){await E(`P.inv=999;P.hp=P.maxhp=1e6;G.chapter=${ch};G.room=3;G.event=null;buildRoom();G.enemies.forEach(e=>e.dead=true);G.enemies=[]`);await p.waitForTimeout(300);
  for(const [n,x,y] of [['top','AW/2','TOP+20'],['left','30','AH/2'],['bot','AW-30','BOT-10']]){await E(`P.x=${x};P.y=${y};camSnap()`);await p.waitForTimeout(900);await p.screenshot({path:`bd_${ch}_${n}.png`})}}
console.log(errs);await b.close()})();
