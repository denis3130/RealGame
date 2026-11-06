// the new zombies in a real match (anteprime/zombie/speciali.js): the Sputatore spits and leaves a pool that burns, the Gonfio swells and
// bursts (and bursts when killed, in a chain), the Bruto charges (hits the hero and pushes him, or hits a wall and is stunned) and slams;
// the bell or the trap stop their moves; the director makes them in their rounds and not before; the drawings cost; photos; no errors.
// python3 tests/a50/mk.py, then node tests/a50/speciali.js
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:9000,gems:0,trophies:0,runs:3,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],mat:{ess:0,rot:500}}))});
  await p.goto('file://'+D+'test_a50.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`));let nOk=0,nKo=0;
  const ok=(t,c,x)=>{c?nOk++:nKo++;console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''))};
  const wait=async(cond,ms)=>{for(let t=0;t<ms;t+=100){if(await E(cond))return true;await p.waitForTimeout(100)}return false};
  await E(`try{introEnd()}catch(e){};INTRO.on=false;0`);
  ok('i tre disegni, le mosse e gli agganci del motore ci sono',await E(`!!(CR.gonfio&&CR.sputatore&&CR.bruto&&ZM.speciali&&ZM.zSpec&&ZM.ZBOX&&ZM.ZBOX.bruto&&ZM.ZBOX.gonfio&&ZM.ZBOX.sputatore)`));
  await E(`try{closeSheet()}catch(e){};SAVE.modo='zombie';zGo();0`);
  for(let i=0;i<120;i++){await p.waitForTimeout(500);if(await E(`!!(ZG.on&&ZM.W.director&&ZM.W.director.st)`))break}
  await p.waitForTimeout(2500);
  await E(`ZM.W.dbg.noSpawn=true;ZM.W.dbg.noShoot=true;
    window.__clear=()=>{const W=ZM.W,S=ZM.speciali.SP;for(const z of W.Z.slice())if(!z.idle)W.Z.splice(W.Z.indexOf(z),1);for(const k of['spits','pools','clouds','blasts','rings','cracks','puffs'])S[k]=[];S.push=null;
      const D=W.director;D.hp=D.PZ.vita;D.inv=0;W.dbg.god=false;return 1};
    // a free direction from the hero: nothing in the way for d px
    window.__free=d=>{const h=ZM.W.hero;let best=null;for(let k=0;k<48;k++){const a=k/48*6.2832,x=h.x+Math.cos(a)*d,y=h.y+Math.sin(a)*d;if(!ZM.hit(x,y,16)&&ZM.physClear(h.x,h.y,x,y,10,null,2)){best=a;break}}return best};0`);
  const shot=async n=>{await p.waitForTimeout(60);await p.screenshot({path:D+'sp_'+n+'.png'})};
  // ---------- lo Sputatore
  await E(`__clear();const a=__free(170);window.__sp=ZM.speciali.spawn('sputatore',170,a);__sp.zs.cd=0;0`);
  const spat=await wait(`ZM.speciali.SP.spits.length>0`,4000);await shot('sputo');
  ok('lo Sputatore a distanza tira il collo indietro e sputa',spat,await J(`{st:__sp.zs.st,anim:__sp.anim,d:Math.round(Math.hypot(__sp.x-ZM.W.hero.x,__sp.y-ZM.W.hero.y))}`));
  const hp0=await E(`ZM.W.director.hp`);const landed=await wait(`ZM.speciali.SP.spits.length===0&&ZM.speciali.SP.pools.length>0`,2500);await shot('pozza');
  const hp1=await E(`ZM.W.director.hp`);ok('lo sputo cade dove eri: ti fa male e lascia la pozza',landed&&hp1<hp0-8,{prima:hp0,dopo:hp1});
  await E(`ZM.W.director.inv=0;0`);await p.waitForTimeout(1600);const hp2=await E(`ZM.W.director.hp`);ok('nella pozza si brucia piano',hp2<hp1-4&&hp2>hp1-30,{dopo:hp1,poi:hp2});
  ok('aspetta a distanza prima di sputare di nuovo',await E(`__sp.zs.cd>0&&!__sp.die`),await J(`{cd:+__sp.zs.cd.toFixed(2),st:__sp.zs.st}`));
  // ---------- il Gonfio che arriva da te: si gonfia e scoppia, fa male a te e agli zombie vicini, lascia la nube
  await E(`__clear();const h=ZM.W.hero,a=__free(60);window.__zz=ZM.spawn({hole:[h.x+Math.cos(a+1.4)*30,h.y+Math.sin(a+1.4)*30,null,null],kind:'zombie',q:1});__zz.rise=1;__zz.hp=60;
    window.__go=ZM.speciali.spawn('gonfio',34,a);0`);
  await p.waitForTimeout(700);await shot('gonfia');const sw=await J(`{st:__go.zs.st,anim:__go.anim,p:+__go.p.toFixed(2)}`);ok('vicino a te il Gonfio si gonfia',sw.st==='gonfia'&&sw.anim==='attack',sw);
  const g0=await E(`ZM.W.director.hp`);const boomed=await wait(`ZM.speciali.SP.blasts.length>0`,1500);await p.waitForTimeout(150);await shot('scoppio');
  const g1=await J(`{hp:ZM.W.director.hp,gone:!ZM.W.Z.includes(__go)||__go.die>1,zz:__zz.die?'morto':Math.round(__zz.hp),nubi:ZM.speciali.SP.clouds.length}`);
  ok('scoppia: ti fa male, uccide lo zombie accanto, il corpo sparisce, resta la nube',boomed&&g1.hp<g0-20&&g1.gone&&g1.zz==='morto'&&g1.nubi===1,Object.assign({prima:g0},g1));
  await E(`ZM.W.director.inv=0;0`);const c0=await E(`ZM.W.director.hp`);await p.waitForTimeout(1600);ok('nella nube si brucia piano',await E(`ZM.W.director.hp`)<c0-4,{prima:c0,dopo:await E(`ZM.W.director.hp`)});
  // ---------- il Gonfio ucciso scoppia subito, e a catena l'altro accanto
  await E(`__clear();ZM.W.dbg.god=true;const a=__free(150);window.__g1=ZM.speciali.spawn('gonfio',150,a);window.__g2=ZM.speciali.spawn('gonfio',150,a+.2);ZM.hurt(__g1,9999,true);0`);
  const chain=await wait(`ZM.speciali.SP.blasts.length>=2`,1500);await shot('catena');
  ok('il Gonfio ucciso scoppia e fa scoppiare quello accanto',chain&&await E(`__g1.die>1&&__g2.die>1`),await J(`{scoppi:ZM.speciali.SP.blasts.length}`));
  // ---------- il Bruto: si curva (la strada si accende), carica, ti prende e ti spinge via
  await E(`__clear();const a=__free(210);window.__br=ZM.speciali.spawn('bruto',210,a);__br.zs.cd=0;window.__h0=[ZM.W.hero.x,ZM.W.hero.y];0`);
  const prep=await wait(`__br.zs.st==='prep'`,3000);await p.waitForTimeout(450);await shot('carica');ok('il Bruto si curva per caricare',prep,await J(`{st:__br.zs.st}`));
  const b0=await E(`ZM.W.director.hp`);const hitH=await wait(`__br.zs.hit===true||(__br.zs.st==='cammina'&&__br.zs.cd>0)`,3000);await p.waitForTimeout(300);
  const b1=await J(`{hp:ZM.W.director.hp,mosso:Math.round(Math.hypot(ZM.W.hero.x-__h0[0],ZM.W.hero.y-__h0[1])),st:__br.zs.st}`);
  ok('la carica ti prende: fa male e ti spinge via',hitH&&b1.hp<b0-20&&b1.mosso>25,Object.assign({prima:b0},b1));
  // contro un muro resta stordito (le stelline)
  const wall=await J(`(()=>{const h=ZM.W.hero;for(let k=0;k<72;k++){const a=k/72*6.2832;for(let d=50;d<160;d+=6){if(ZM.hit(h.x+Math.cos(a)*d,h.y+Math.sin(a)*d,10)){if(d>70&&!ZM.hit(h.x+Math.cos(a)*(d-46),h.y+Math.sin(a)*(d-46),14))return{a,d};break}}}return null})()`);
  if(wall){await E(`__clear();ZM.W.dbg.god=true;const h=ZM.W.hero,w=${JSON.stringify(wall)};window.__br=ZM.speciali.spawn('bruto',w.d-46,w.a);Object.assign(__br.zs,{st:'corsa',t:0,dir:w.a,hit:true,blk:0});0`);
    const st=await wait(`__br.zs.st==='stordito'`,1500);await p.waitForTimeout(200);await shot('stordito');ok('contro un muro il Bruto resta stordito',st,await J(`{st:__br.zs.st}`))}
  else ok('contro un muro il Bruto resta stordito (nessun muro vicino all\'eroe per provarlo)',false);
  // da vicino lo schianto
  await E(`__clear();const a=__free(60);window.__br=ZM.speciali.spawn('bruto',36,a);0`);
  const s0=await E(`ZM.W.director.hp`);const sl=await wait(`ZM.speciali.SP.rings.length>0`,1800);await p.waitForTimeout(120);await shot('schianto');
  ok('da vicino alza il braccio e lo schianta: fa male, anello e crepe',sl&&await E(`ZM.W.director.hp`)<s0-20&&await E(`ZM.speciali.SP.cracks.length>0`),{prima:s0,dopo:await E(`ZM.W.director.hp`)});
  // la campana o la tagliola (stun) fermano la mossa a metà
  await E(`__clear();ZM.W.dbg.god=true;const a=__free(210);window.__br=ZM.speciali.spawn('bruto',210,a);Object.assign(__br.zs,{st:'prep',t:0,dir:a+3.14});__br.stun=1.5;0`);await p.waitForTimeout(250);
  ok('stordito dalla campana o dalla tagliola, la carica si perde',await E(`__br.zs.st==='cammina'`),await J(`{st:__br.zs.st}`));
  // ---------- il direttore: nel round 8 escono il Bruto, il Gonfio e lo Sputatore (il primo di ognuno sicuro); nel round 2 nessuno
  await E(`__clear();ZM.W.dbg.god=true;ZM.speciali.SP.seen={};ZM.W.dbg.noSpawn=false;ZM.W.director.startRound(2);0`);
  await wait(`ZM.W.Z.filter(z=>z.q&&!z.idle).length>=5`,25000);const r2=await J(`ZM.W.Z.filter(z=>z.q&&!z.idle).map(z=>z.kind)`);ok('nel round 2 nessuno zombie nuovo',!r2.some(k=>['gonfio','sputatore','bruto'].includes(k)),r2);
  await E(`__clear();ZM.W.dbg.god=true;ZM.speciali.SP.seen={};ZM.W.director.startRound(8);0`);
  await wait(`['bruto','gonfio','sputatore'].every(k=>ZM.W.Z.some(z=>z.kind===k))`,40000);const r8=await J(`ZM.W.Z.filter(z=>z.q&&!z.idle).map(z=>z.kind)`);
  ok('nel round 8 escono il Bruto, il Gonfio e lo Sputatore',['bruto','gonfio','sputatore'].every(k=>r8.includes(k)),r8);
  ok('al massimo un Bruto alla volta nel round 8',r8.filter(k=>k==='bruto').length<=1);
  await p.waitForTimeout(1500);await shot('round8');
  await E(`ZM.W.dbg.noSpawn=true;0`);
  // ---------- i disegni: quanto costa uno zombie nuovo dal vivo, con lo zombie di sempre e la lanterna per confronto (la tela si svuota
  // davvero solo con getImageData: senza, il tempo finisce a caso nella misura dopo)
  const cost=await J(`(()=>{const c=document.createElement('canvas');c.width=220;c.height=220;const g=c.getContext('2d',{willReadFrequently:false}),out={};
    for(let pass=0;pass<2;pass++)for(const k of['zombie','lanterna','gonfio','sputatore','bruto']){g.getImageData(0,0,1,1);const t0=performance.now();
      for(let i=0;i<60;i++){g.setTransform(1,0,0,1,110,160);window.__MZ.zdraw(g,k,0,0,i*.1,i%2?'walk':'attack',i/60,k==='bruto'?1.5:k==='lanterna'?1.55:1.15)}
      g.getImageData(0,0,1,1);const v=(performance.now()-t0)/60;out[k]=pass?Math.min(out[k],v):v}
    for(const k in out)out[k]=+out[k].toFixed(2);return out})()`);
  ok('disegno dal vivo (ms): gli zombie nuovi costano come quelli di sempre (non più della lanterna, con margine)',['gonfio','sputatore','bruto'].every(k=>cost[k]<=cost.lanterna*1.5+.5),cost);
  // ---------- con gli effetti ridotti
  await E(`__clear();LOWFX=true;ZM.W.dbg.god=true;const a=__free(150);ZM.speciali.spawn('sputatore',160,a).zs.cd=0;ZM.speciali.spawn('bruto',200,a+.8).zs.cd=0;ZM.speciali.spawn('gonfio',34,a+2);0`);
  await p.waitForTimeout(3000);await shot('lowfx');await E(`LOWFX=false;0`);
  ok('nessun errore',errs.length===0,errs.slice(0,4));
  console.log(nOk+' sì, '+nKo+' no');await b.close();process.exit(nKo?1:0)})();
