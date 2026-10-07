// every boss up close, mid-fight (node bosslook.js tag [file])
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},set:{big:false},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
const file=process.argv[3]||'test.html';await p.goto('file://'+__dirname+'/'+file);await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);const tag=process.argv[2]||'bl';
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1200);
const list=[['golem',1,5],['witch',1,10],['salamander',2,5],['smith',2,10],['toad',3,5],['hydra',3,10],['yeti',4,5],['icequeen',4,10]];
for(const [bt,ch,room] of list){await E(`P.inv=1e9;P.hp=P.maxhp=1e9;P.atk=0;G.chapter=${ch};G.room=${room};G.event=null;buildRoom();for(const e of G.enemies){e.intro=0;e.iT=99;e.z=0}P.x=AW/2;P.y=BOT-60;camSnap();$('banner').classList.remove('show');$('bossBar').hidden=true`);
  for(let k=0;k<3;k++){await p.waitForTimeout(1300);const bb=JSON.parse(await E(`(()=>{const e=G.enemies.find(e=>isBoss(e.type));const s=Math.min(cv.width/VW,cv.height/VH)/devicePixelRatio,r=cv.getBoundingClientRect(),ox=r.left+(r.width-VW*s)/2,oy=r.top+Math.max(0,(r.height-VH*s)/2);return JSON.stringify({x:ox+(e.x-G.vx)*s,y:oy+(e.y-G.vy)*s})})()`));
    await p.screenshot({path:`${tag}_${bt}_${k}.png`,clip:{x:Math.max(0,bb.x-95),y:Math.max(0,bb.y-150),width:190,height:200}})}}
// the mimic
await E(`G.chapter=1;G.room=4;G.event=null;buildRoom();G.enemies=[];const m=makeE('mimic',AW/2,TOP+200,0);m.intro=0;m.iT=99;G.enemies.push(m);P.x=AW/2;P.y=BOT-60;camSnap()`);
for(let k=0;k<3;k++){await p.waitForTimeout(1300);const bb=JSON.parse(await E(`(()=>{const e=G.enemies.find(e=>e.type==='mimic');const s=Math.min(cv.width/VW,cv.height/VH)/devicePixelRatio,r=cv.getBoundingClientRect(),ox=r.left+(r.width-VW*s)/2,oy=r.top+Math.max(0,(r.height-VH*s)/2);return JSON.stringify({x:ox+(e.x-G.vx)*s,y:oy+(e.y-G.vy)*s})})()`));
  await p.screenshot({path:`${tag}_mimic_${k}.png`,clip:{x:Math.max(0,bb.x-95),y:Math.max(0,bb.y-150),width:190,height:200}})}
console.log(errs);await b.close()})();
