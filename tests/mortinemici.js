// Morti dei nemici (punto 4): un foglio con la morte di ogni nemico in 3D (8 fotogrammi ciascuno) e una prova nel gioco vero (il nemico
// ucciso lascia il suo corpo, che sparisce da solo; niente schegge e pezzetti dello scoppio di prima; la porta si apre come prima).
// Uso: python3 tests/mk.py && node tests/mortinemici.js   → tests/mn_morti.png
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:0,trBest:0,runs:4,introSeen:1,handSeen:1,login:{last:'2099-1-1',n:1},set:{q:'alta'},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__E(s),s),R=[],ok=(n,c)=>R.push((c?'  ok  ':'  NO  ')+n);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun();paused=false;setInterval(()=>{if(!$('skScr').hidden)pick(0);P.hp=P.maxhp},60);0`);await p.waitForTimeout(800);
// the sheet: every type, its death in 8 frames
const d=await E(`(()=>{const T=Object.keys(EDF).filter(t=>N3[t]),FW=96,FH=110,cv=document.createElement('canvas');cv.width=FW*9;cv.height=FH*T.length;const g=cv.getContext('2d');g.fillStyle='#3b3631';g.fillRect(0,0,cv.width,cv.height);
  const sv=ctx;ctx=g;LOWFX=false;try{T.forEach((t,r)=>{const e=makeE0(t,0,0,0);e.face=Math.PI/2-.5;e.f3=e.face;if(t==='bat'||t==='mosquito'||t==='wisp'||t==='snowspirit'||t==='shadoweye')e.z=14;
    g.fillStyle='#f6ead2';g.font='600 11px sans-serif';g.fillText(t+' · '+EDF[t],4,FH*r+12);
    const sP=P;P={x:-30,y:0};const c=(addECorpse(e),G.ecorpses.pop());P=sP;
    for(let k=0;k<8;k++){c.x=FW*(k+1)+FW/2;c.y=FH*r+FH-26;c.t=k/7*c.dur*.999;g.save();g.beginPath();g.rect(FW*(k+1),FH*r,FW,FH);g.clip();drawECorpse(c);g.restore()}
    c.x=FW/2;c.y=FH*r+FH-26;g.save();g.beginPath();g.rect(0,FH*r+14,FW,FH-14);g.clip();N3[t](c.x,c.y+8-(e.z||0),e.face,'idle',.3,N3.meta[t].sc||1,{});g.restore();ESN.pool.push(c.cv)})}finally{ctx=sv}
  return cv.toDataURL('image/png')})()`);
fs.writeFileSync(path.join(__dirname,'mn_morti.png'),Buffer.from(d.split(',')[1],'base64'));
// in the game: kill a goblin, its body stays a moment and goes; no streaks or chunks
await E(`(()=>{G.enemies=[];const e=makeE0('goblin',P.x+60,P.y-80,0);e.spawn=0;e.intro=0;G.enemies.push(e);window.__e=e;window.__fx0=G.fx.length})()`);await p.waitForTimeout(300);
const r1=await E(`(()=>{const e=__e;hurtE(e,e.hp+1,false);return JSON.stringify({dead:e.dead,ec:(G.ecorpses||[]).length,streaks:G.fx.filter(f=>f.k==='chunk').length,pop:G.fx.filter(f=>f.k==='pop').length})})()`).then(JSON.parse);
ok('il goblin ucciso lascia il suo corpo, senza i pezzetti dello scoppio ('+JSON.stringify(r1)+')',r1.dead&&r1.ec===1&&r1.streaks===0);
await p.waitForTimeout(400);await p.screenshot({path:path.join(__dirname,'mn_gioco.png')});
await p.waitForTimeout(1200);const r2=await E(`JSON.stringify({ec:(G.ecorpses||[]).length,corpses:(G.corpses||[]).length,pool:ESN.pool.length,state:G.state})`).then(JSON.parse);
ok('poi il corpo sparisce da solo e la tela torna da usare ('+JSON.stringify(r2)+')',r2.ec===0&&r2.corpses===0&&r2.pool>=1);
// with low effects: the old burst
await E(`(()=>{LOWFX=true;const e=makeE0('slime',P.x+60,P.y-80,0);e.spawn=0;e.intro=0;G.enemies.push(e);hurtE(e,e.hp+1,false);window.__lo={ec:(G.ecorpses||[]).length,st:G.fx.filter(f=>f.k==='streak'||f.k==='chunk').length};LOWFX=false})()`);
const r3=await E(`JSON.stringify(__lo)`).then(JSON.parse);ok('con gli effetti bassi resta lo scoppio di prima ('+JSON.stringify(r3)+')',r3.ec===0&&r3.st>0);
console.log(R.join('\n'));console.log('ERR',JSON.stringify(errs));console.log(R.some(r=>r.startsWith('  NO'))?'prove non passate':'tutte le prove passate');await b.close()})();
