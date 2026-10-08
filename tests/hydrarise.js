// the hydra's rise, frame by frame, and its dive back up during the fight
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/'+(process.argv[2]||'test_b2.html'));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
await E(`__b2show('hydra')`);await p.waitForTimeout(900);await E(`paused=true`);
const times=[.3,.9,1.3,1.8,2.2,2.6,3.1,3.5,3.9];let i=0;
for(const tt of times){await E(`(()=>{const e=G.enemies.find(e=>e.type==='hydra');while((e.iT||0)<${tt}&&e.intro>0){update(1/60)}})()`);await E(`render()`);
  const bb=JSON.parse(await E(`(()=>{const e=G.enemies.find(e=>isBoss(e.type));const s=Math.min(cv.width/VW,cv.height/VH)/devicePixelRatio,r=cv.getBoundingClientRect(),ox=r.left+(r.width-VW*s)/2,oy=r.top+Math.max(0,(r.height-VH*s)/2);return JSON.stringify({x:ox+(e.x-G.vx)*s,y:oy+(e.y-G.vy)*s})})()`));
  await p.screenshot({path:`hr_${i++}.png`,clip:{x:bb.x-110,y:bb.y-150,width:220,height:200}})}
// dive during the fight
await E(`(()=>{const e=G.enemies.find(e=>e.type==='hydra');while(e.intro>0)update(1/60);e.st='dive';e.sub='a';e.stT=.5;for(let k=0;k<45;k++)update(1/60)})()`);
for(let k=0;k<5;k++){await E(`for(let k=0;k<${k===0?40:6};k++)update(1/60);render()`);const bb=JSON.parse(await E(`(()=>{const e=G.enemies.find(e=>isBoss(e.type));const x=e.sub==='under'?e.tx:e.x,y=e.sub==='under'?e.ty:e.y;const s=Math.min(cv.width/VW,cv.height/VH)/devicePixelRatio,r=cv.getBoundingClientRect(),ox=r.left+(r.width-VW*s)/2,oy=r.top+Math.max(0,(r.height-VH*s)/2);return JSON.stringify({x:ox+(x-G.vx)*s,y:oy+(y-G.vy)*s,st:e.st,sub:e.sub})})()`));
  await p.screenshot({path:`hd_${k}.png`,clip:{x:Math.max(0,bb.x-110),y:Math.max(0,bb.y-150),width:220,height:200}})}
console.log(errs);await b.close()})();
