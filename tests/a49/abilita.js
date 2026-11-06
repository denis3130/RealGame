// the zombie abilities in a real match: the three buttons, each ability used, its effect checked, photos; the Arsenal's section
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:9000,gems:0,trophies:0,runs:3,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',modo:'zombie',zRec:4,
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],mat:{ess:0,rot:500}}))});
  await p.goto('file://'+D+'test_a49.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s);const ok=(t,c,x)=>console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''));
  await E(`try{introEnd()}catch(e){};INTRO.on=false;0`);
  // the Arsenal: the section, the slots, locked ones with the record
  await E(`try{closeSheet()}catch(e){};SAVE.modo='zombie';try{setMode&&setMode('zombie')}catch(e){};setTab('tabGear');0`);await p.waitForTimeout(800);
  const ars=JSON.parse(await E(`JSON.stringify({sec:!!document.getElementById('zAbSec'),slots:document.querySelectorAll('#zAbEq .slot').length,cards:document.querySelectorAll('#zAbAll .icard').length,locked:document.querySelectorAll('#zAbAll .icard.locked').length,txt:[...document.querySelectorAll('#zAbAll .icard .st')].map(e=>e.textContent)})`));
  ok("l'Arsenale ha la sezione Abilità: tre posti, sei abilità, cinque chiuse",ars.sec&&ars.slots===3&&ars.cards===6&&ars.locked===5,ars);
  await p.evaluate(()=>{const s=document.querySelector('#zAbSec');if(s)s.scrollIntoView()});await p.waitForTimeout(300);await p.screenshot({path:D+'ab_arsenale.png'});
  // unlock the bomb (record 4 ≥ 3): gold and Rottami go, it goes into a slot; the bell needs record 6
  await E(`openSheet('zab:bomba');0`);await p.waitForTimeout(400);await p.screenshot({path:D+'ab_foglio.png'});
  await E(`document.querySelector('#sheet button[data-zabact="buy"]').click();0`);await p.waitForTimeout(300);
  const bb=JSON.parse(await E(`JSON.stringify({gold:SAVE.gold,rot:SAVE.mat.rot,ab:SAVE.z.ab})`));ok('sbloccata la Bomba: 900 oro e 40 Rottami, va nel secondo posto',bb.gold===8100&&bb.rot===460&&bb.ab.own.bomba&&bb.ab.eq[1]==='bomba',bb);
  await E(`openSheet('zab:rintocco');0`);await p.waitForTimeout(300);const dis=await E(`!!document.querySelector('#sheet button[data-zabact="buy"]').disabled`);ok('il Rintocco con record 4 non si sblocca (serve il 6)',dis);
  // for the match: all owned, the three to try
  await E(`SAVE.z.ab={own:{scatto:1,bomba:1,rintocco:1,tagliola:1,adrenalina:1,benda:1},eq:['scatto','bomba','rintocco']};save();closeSheet();zGo();0`);
  for(let i=0;i<120;i++){await p.waitForTimeout(500);if(await E(`!!(ZG.on&&ZM.W.director&&ZM.W.director.st)`))break}
  await p.waitForTimeout(2500);
  const ui=JSON.parse(await E(`JSON.stringify({n:document.querySelectorAll('#mzAb .ab').length,ready:document.querySelectorAll('#mzAb .ab.ready').length})`));ok('in partita tre bottoni, pronti',ui.n===3&&ui.ready===3,ui);
  await E(`ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;window.__home=[ZM.W.hero.x,ZM.W.hero.y];0`);
  // zombies round the hero
  const put=async n=>E(`(()=>{const h=ZM.W.hero;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const out=[];for(let i=0;i<${n};i++){const a=i/${n}*6.283,x=h.x+Math.cos(a)*55,y=h.y+Math.sin(a)*55;const k=window.__MZ.addZombie('zombie',x,y,30);const z=ZM.W.Z[k];z.hp=400;z.q=1;z.lv=h.lv||0;out.push(z)}return out.length})()`);
  await put(5);await p.waitForTimeout(300);
  // 1 the dash: the hero moves about 90 px and can't be touched
  const d0=JSON.parse(await E(`JSON.stringify({x:ZM.W.hero.x,y:ZM.W.hero.y})`));await p.keyboard.press('Digit1');await p.waitForTimeout(120);await p.screenshot({path:D+'ab_scatto.png'});await p.waitForTimeout(300);
  const d1=JSON.parse(await E(`JSON.stringify({x:ZM.W.hero.x,y:ZM.W.hero.y,cd:ZABS.cd[0]})`));ok('lo scatto sposta l\'eroe (circa 90 px) e va in ricarica',Math.hypot(d1.x-d0.x,d1.y-d0.y)>40&&d1.cd>3,{dist:Math.round(Math.hypot(d1.x-d0.x,d1.y-d0.y)),cd:+d1.cd.toFixed(1)});
  // 2 the bomb: a fire where the zombies are, they get hurt
  await put(5);const hp0=await E(`ZM.W.Z.reduce((s,z)=>s+z.hp,0)`);await E(`zabUse(1);0`);await p.waitForTimeout(1400);await p.screenshot({path:D+'ab_bomba.png'});await p.waitForTimeout(1200);
  const hp1=await E(`ZM.W.Z.filter(z=>!z.die).reduce((s,z)=>s+z.hp,0)`),fires=await E(`ZABS.fires.length`);ok('la bomba incendia la terra e brucia gli zombie',hp1<hp0-60,{prima:Math.round(hp0),dopo:Math.round(hp1),fuochi:fires});
  // 3 the bell: pushed back and stunned
  await E(`ZABS.fires=[];0`);await put(5);const r0=await E(`ZM.W.Z.map(z=>Math.hypot(z.x-ZM.W.hero.x,z.y-ZM.W.hero.y)).reduce((a,b)=>a+b,0)/ZM.W.Z.length`);
  await E(`zabUse(2);0`);await p.waitForTimeout(250);await p.screenshot({path:D+'ab_rintocco.png'});
  const r1=JSON.parse(await E(`JSON.stringify({d:ZM.W.Z.map(z=>Math.hypot(z.x-ZM.W.hero.x,z.y-ZM.W.hero.y)).reduce((a,b)=>a+b,0)/ZM.W.Z.length,stun:ZM.W.Z.filter(z=>z.stun>0).length})`));ok('il rintocco li spinge via e li stordisce',r1.d>r0+25&&r1.stun>=4,{prima:Math.round(r0),dopo:Math.round(r1.d),storditi:r1.stun});
  // 4-6 the others, put in the slots
  await E(`SAVE.z.ab.eq=['tagliola','adrenalina','benda'];ZM.W.director.reset&&0;zabReset();0`);await p.waitForTimeout(200);
  // (the trap where the ground is free: a line through the hero with nothing in the way, the zombie on one side, the hero on the other;
  //  near a fence the zombie would walk round it and miss the trap, which is right)
  await E(`(()=>{for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const h=ZM.W.hero;h.x=window.__home[0];h.y=window.__home[1];h.moving=false;for(let i=0;i<16;i++){const a=i/16*6.283,c=Math.cos(a),s=Math.sin(a);
    if(ZM.physClear(h.x-c*60,h.y-s*60,h.x+c*80,h.y+s*80,12)){window.__dir=[c,s];break}}h.face=Math.atan2((window.__dir||[1,0])[1],(window.__dir||[1,0])[0]);zabUse(0);return 1})()`);await p.waitForTimeout(500);
  await E(`(()=>{const h=ZM.W.hero,T=ZABS.traps[0],d=window.__dir||[1,0];h.x=T.x+d[0]*70;h.y=T.y+d[1]*70;const k=window.__MZ.addZombie('zombie',T.x-d[0]*45,T.y-d[1]*45,30);const z=ZM.W.Z[k];z.hp=400;z.q=1;z.lv=h.lv||0;return 1})()`);
  for(let i=0;i<30;i++){await p.waitForTimeout(150);if(await E(`!!(ZABS.traps[0]&&ZABS.traps[0].z)`))break}
  await p.waitForTimeout(400);await p.screenshot({path:D+'ab_tagliola.png'});const tg=JSON.parse(await E(`JSON.stringify({preso:!!(ZABS.traps[0]&&ZABS.traps[0].z),stun:ZM.W.Z[0]&&ZM.W.Z[0].stun})`));ok('la tagliola prende il primo zombie che ci passa',tg.preso,tg);
  await E(`zabUse(1);0`);await p.waitForTimeout(200);const ad=JSON.parse(await E(`JSON.stringify({spd:ZM.W.mods.spd,relK:ZM.W.mods.relK,adr:ZABS.adr})`));await p.screenshot({path:D+'ab_adrenalina.png'});ok('l\'adrenalina: più veloce e ricarica doppia',ad.spd>1.2&&ad.relK>=2,ad);
  await E(`ZABS.adr=.01;0`);await p.waitForTimeout(300);const ad2=JSON.parse(await E(`JSON.stringify({spd:ZM.W.mods&&ZM.W.mods.spd,relK:ZM.W.mods&&ZM.W.mods.relK})`));ok('finita l\'adrenalina tutto torna com\'era',(ad2.spd||1)===1&&(ad2.relK||1)===1,ad2);
  await E(`ZM.W.director.hp=30;zabUse(2);0`);await p.waitForTimeout(400);await p.screenshot({path:D+'ab_benda.png'});await p.waitForTimeout(900);const hp=await E(`ZM.W.director.hp`);ok('la benda rimette in forze',hp>80,Math.round(hp));
  // a used ability can't be used again while it recharges
  const cdn=await E(`(()=>{const c=ZABS.cd[2];zabUse(2);return ZABS.cd[2]<=c})()`);ok('durante la ricarica non si usa',cdn);
  // the ability buttons don't turn the camera (the tap stops at them)
  const yaw0=await E(`ZM.CAM.yaw`);const bx=await p.evaluate(()=>{const r=document.querySelector('#mzAb .ab').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
  await p.mouse.move(bx[0],bx[1]);await p.mouse.down();await p.mouse.move(bx[0]-80,bx[1],{steps:6});await p.mouse.up();await p.waitForTimeout(200);const yaw1=await E(`ZM.CAM.yaw`);ok('trascinare sopra un bottone non gira la telecamera',Math.abs(yaw1-yaw0)<.01,[yaw0,yaw1]);
  console.log(errs.slice(0,6).join('\n')||'nessun errore');await b.close()})();
