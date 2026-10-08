// QA strips: each boss from its entrance through its moves, one frame every ~0.45s, framed on the boss
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test_b2.html');await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
const ids=(process.argv[2]||'golem,witch,salamander,smith,toad,hydra,yeti,icequeen,mimic').split(',');const N=+(process.argv[3]||22);
await E(`__b2show('golem')`);await p.waitForTimeout(900);await E(`paused=true`);
for(const id of ids){await E(`__b2show('${id}');paused=true`);await p.waitForTimeout(100);const log=[];
  for(let k=0;k<N;k++){const st=await E(`(()=>{for(let i=0;i<27;i++){const b=G.enemies.find(e=>isBoss(e.type));if(b&&!(b.intro>0)){const a=G.t*.6;P.x=clamp(b.x+Math.cos(a)*130,L+20,R-20);P.y=clamp(b.y+Math.sin(a)*90+80,TOP+20,BOT-20)}update(1/60);render()}
      const e=G.enemies.find(e=>isBoss(e.type));G.vx=clamp(e.x-VW/2,-BIG.m,AW+BIG.m-VW);G.vy=clamp(e.y-VH*.45,-BIG.m,AH+BIG.m-VH);render();return e.st+'/'+e.sub+(e.intro>0?' intro':'')})()`);log.push(st);
    const bb=JSON.parse(await E(`(()=>{const e=G.enemies.find(e=>isBoss(e.type));const s=Math.min(cv.width/VW,cv.height/VH)/devicePixelRatio,r=cv.getBoundingClientRect(),ox=r.left+(r.width-VW*s)/2,oy=r.top+Math.max(0,(r.height-VH*s)/2);return JSON.stringify({x:ox+(e.x-G.vx)*s,y:oy+(e.y-G.vy)*s})})()`));
    await p.screenshot({path:`qa_${id}_${String(k).padStart(2,'0')}.png`,clip:{x:Math.max(0,bb.x-100),y:Math.max(0,bb.y-140),width:200,height:190}})}
  console.log(id,log.join(' '))}
console.log(errs);await b.close()})();
