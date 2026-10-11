// Strips of the boss deaths: every boss is put in a room, killed, and photographed during its death (first frame: alive).
// Run `python3 tests/mk.py` first. Usage: node tests/bossdie.js [boss ...]  (no names = all nine). Output: tests/bd_<boss>.png
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ALL=['golem','witch','salamander','smith','toad','hydra','yeti','icequeen','mimic'];
(async()=>{const only=process.argv.slice(2),kinds=ALL.filter(k=>!only.length||only.includes(k));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:640},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:0,trBest:0,runs:4,introSeen:1,handSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1200);
// no skill screens, no level-up pop-ups: the strip must show only the death
await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun();paused=false;bannerEl.style.visibility='hidden';{const _t=text;text=function(x,y,...r){return _t(-9999,-9999,...r)}}const _tt=typeof toast==='function'?toast:null;if(_tt)toast=()=>{};setInterval(()=>{if(!$('skScr').hidden)pick(0);if(!$('whScr').hidden&&!WH.spin)$('whGo').click()},40)`));
await p.waitForTimeout(600);
for(const k of kinds){
  // an empty room, the boss alone, the hero just under it (the camera frames both); then the final blow
  await p.evaluate(k=>__E(`G.room=3;buildRoom();G.enemies=[];const e=makeE('${k}',AW/2,TOP+200,0);G.enemies.push(e);P.x=AW/2;P.y=e.y+120;P.hp=P.maxhp;if(G.vx!=null)camSnap();bannerEl.classList.remove('show');$('bossBar').hidden=false;$('bossName').textContent=ET['${k}'].name;$('bossFill').style.width='4%'`),k);
  // let the real entrance play, so the boss is set up exactly as in a game
  const intro=await p.evaluate(()=>__E(`(G.enemies[0].intro||1.6)`));await p.waitForTimeout(intro*1000+1200);
  const box=await p.evaluate(()=>__E(`(()=>{const e=G.enemies[0],sx=e.x-(G.vx||0),sy=e.y-(G.vy||0);return{x:Math.max(0,Math.round(sx-100)),y:Math.max(0,Math.round(sy-150)),w:200,h:200}})()`));
  const shots=[await p.screenshot({clip:{x:box.x,y:box.y,width:box.w,height:box.h}})];const t0=Date.now();
  await p.evaluate(()=>__E(`{const e=G.enemies.find(x=>isBoss(x.type));if(e)hurtE(e,e.hp+1,false)}`));
  for(let i=0;i<11;i++){await p.waitForTimeout(i?250:60);shots.push(await p.screenshot({clip:{x:box.x,y:box.y,width:box.w,height:box.h}}))}
  const st=await p.evaluate(()=>__E(`({corpses:(G.corpses||[]).length,enemies:G.enemies.length,state:G.state,ended:!!G.ended,bar:$('bossBar').className})`));
  const sheet=await p.evaluate(async(imgs)=>{const cv=document.createElement('canvas');cv.width=400*6;cv.height=400*2;const c=cv.getContext('2d');c.fillStyle='#111';c.fillRect(0,0,cv.width,cv.height);
    for(let i=0;i<imgs.length;i++){const im=new Image();im.src='data:image/png;base64,'+imgs[i];await new Promise(r=>im.onload=r);c.drawImage(im,(i%6)*400,Math.floor(i/6)*400)}
    return cv.toDataURL('image/png')},shots.map(s=>s.toString('base64')));
  fs.writeFileSync(path.join(__dirname,`bd_${k}.png`),Buffer.from(sheet.split(',')[1],'base64'));
  console.log(k,JSON.stringify(st),((Date.now()-t0)/1000).toFixed(1)+'s');
  await p.evaluate(()=>__E(`G.corpses=[];G.ended=false;$('endScr').hidden=true;started=true;paused=false;G.state='play'`));
}
console.log('ERRORS',JSON.stringify(errs.slice(0,8)));await b.close()})();
