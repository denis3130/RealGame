// the Beast of the Abyss: entrance frames, then each phase fought for a while, screenshots and checks
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test_beast.html');await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
await E(`__beastGo()`);await p.waitForTimeout(900);await E(`paused=true`);
for(const [i,tt] of [.3,.8,1.1,1.75,2.3,2.9,3.6,4.2,4.45,4.6,5.2,6.3].entries()){await E(`(()=>{const e=G.enemies.find(e=>e.type==='beast');while(e.intro>0&&(e.iT||0)<${tt})update(1/60);render()})()`);await p.screenshot({path:`bst_in${String(i).padStart(2,'0')}.png`,clip:{x:0,y:0,width:390,height:620}})}
const log=[];
for(const ph of [0,1,2]){await E(`(()=>{const e=G.enemies.find(e=>e.type==='beast');e.intro=0;e.iT=99;e.hp=e.max*${[.95,.6,.3][ph]};})()`);
  for(let k=0;k<8;k++){const st=await E(`(()=>{for(let i=0;i<70;i++){const a=G.t*.8;P.x=clamp(AW/2+Math.cos(a)*120,L+20,R-20);P.y=clamp(BOT-140+Math.sin(a)*90,TOP+120,BOT-20);update(1/60);P.hp=P.maxhp}render();const e=G.enemies.find(e=>e.type==='beast');return e?e.st+'/'+(G.beHands||[]).map(h=>h.act?h.act.k:'-').join('')+'/'+(G.beH||[]).map(h=>h.k).join(','):'morta'})()`);log.push(ph+':'+st);
    await p.screenshot({path:`bst_p${ph}_${k}.png`})}}
// can the hero actually hit it?
const hp0=await E(`(()=>{const e=G.enemies.find(e=>e.type==='beast');e.hp=e.max;return e.hp})()`);await E(`(()=>{P.x=AW/2;P.y=TOP+260;P.moving=false;for(let i=0;i<300;i++){update(1/60);P.hp=P.maxhp;P.x=AW/2;P.y=TOP+260}})()`);
const hp1=await E(`G.enemies.find(e=>e.type==='beast').hp`);console.log('colpita dalle frecce:',hp1<hp0,Math.round(hp0-hp1));
console.log(log.join('  '));console.log(errs);await b.close()})();
