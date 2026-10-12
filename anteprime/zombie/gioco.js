// Prova del gioco della mappa (area_mappa): monete di partenza, il bottone da tenere premuto (col dito vero, CDP), il cancello che si apre (catena,
// ante, solidi, zona, zombie della fattoria che partono, velo che sparisce), il Revolver a muro, la Bara delle Sorprese (paga, offre, prendi),
// le armi vere che uccidono e danno monete, gli zombie che escono solo dalle zone aperte.
// Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/gioco.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:60000});await p.waitForTimeout(600);
  const E=(f,a)=>p.evaluate(f,a);const T=64,P=(x,y)=>[x*T,(y+2)*T];
  ok(await E(()=>__MZ.coins()===500),'si parte con 500 monete');
  ok(await E(()=>__MZ.W.gunId==='pistola'&&__MZ.gun().D.n==='Pistola'),'in mano la pistola');
  // nessuno zombie dalla fattoria chiusa: si simulano 60 s con l'eroe al cancello
  const sp=await E(([x,y])=>{const M=__MZ,W=M.W;M.zombies(true);W.dbg.noShoot=true;M.tp(x,y);let farm=0,area1=0;for(let i=0;i<1800;i++){M.sim(1,1/30);for(const z of W.Z)if(!z.idle&&!z._c){z._c=1;if(z.y<14.3*64)farm++;else area1++}}const idle=W.Z.filter(z=>z.idle).length;W.Z.length=0;return{farm,area1,idle}},P(6.45,12.8));
  ok(sp.farm===0&&sp.area1>0,`col cancello chiuso escono zombie solo nell'area di partenza (${sp.area1}) e nessuno nella fattoria (${sp.farm})`);
  // il bottone vero col dito: lontano non c'è, al cancello sì, senza monete trema e non compra
  await E(([x,y])=>{__MZ.tp(x,y)},P(6.45,15.5));await p.waitForTimeout(300);ok(await E(()=>document.getElementById('mzBuy').hidden),'lontano dal cancello il bottone non c\'è');
  await E(([x,y])=>{__MZ.tp(x,y);__MZ.W.dbg.noShoot=true},P(6.45,12.8));await p.waitForTimeout(400);
  ok(await E(()=>!document.getElementById('mzBuy').hidden&&/Cancello/.test(document.getElementById('mzBuy').textContent)),'al cancello compare il bottone del cancello');
  const box=await p.evaluate(()=>{const r=document.getElementById('mzBuy').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
  const cdp=await ctx.newCDPSession(p);const touch=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  await touch('touchStart',...box);await p.waitForTimeout(1100);await touch('touchEnd',...box);
  ok(await E(()=>__MZ.coins()===500&&!__MZ.W.gate.open),'con 500 monete tenendo premuto il cancello non si apre');
  // con le monete: si tiene premuto mezzo secondo (non basta) e poi abbastanza
  await E(()=>__MZ.coins(900));await p.waitForTimeout(200);await touch('touchStart',...box);await p.waitForTimeout(250);await touch('touchEnd',...box);await p.waitForTimeout(100);
  ok(await E(()=>!__MZ.W.gate.open),'un tocco breve non compra');
  await touch('touchStart',...box);await p.waitForFunction(()=>__MZ.W.gate.open,null,{timeout:6000}).catch(()=>{});await touch('touchEnd',...box);await p.waitForTimeout(200);// (0,65 s di gioco tenendo premuto: qui i fotogrammi sono lenti)
  const g=await E(()=>({open:__MZ.W.gate.open,coins:__MZ.coins(),zone:__MZ.W.zoneOpen[2],idle:__MZ.W.Z.filter(z=>z.idle).length}));
  ok(g.open&&g.coins===150&&g.zone,`tenendo premuto con 900 monete il cancello si apre (restano ${g.coins})`);
  const veil=await p.waitForFunction(()=>!__MZ.W.split,null,{timeout:12000}).then(()=>true,()=>false);// (2,5 s di gioco: qui i fotogrammi sono lenti)
  ok(veil,'il velo sulla fattoria è sparito');
  ok(await E(()=>__MZ.W.Z.filter(z=>z.idle).length===0),'gli zombie della fattoria non sono più fermi');
  // si passa dal cancello: dall'area di partenza alla fattoria camminando
  const walk=await E(([x,y])=>{const M=__MZ,W=M.W;W.Z.length=0;M.zombies(false);M.tp(x,y);for(let i=0;i<120;i++)M.walk(0,-1,1,1/30);return W.hero.y},P(6.45,12.9));
  ok(walk<11.6*T+2*T,`si entra nella fattoria passando dal cancello (y ${(walk/T-2).toFixed(2)})`);
  // il Revolver a muro dietro la casa
  await E(([x,y])=>{const M=__MZ;M.coins(600);M.tp(x,y)},P(9.6,14.62));await p.waitForTimeout(300);
  ok(await E(()=>/Revolver/.test(document.getElementById('mzBuy').textContent)),'dietro la casa il bottone del Revolver');
  ok(await E(()=>__MZ.buyNow('muro_revolver')&&__MZ.W.gunId==='revolver'&&__MZ.coins()===100),'comprato il Revolver (500): in mano e monete tolte');
  // le armi vere uccidono: uno zombie davanti, l'eroe fermo spara finché muore e arrivano 60 monete
  const kill=await E(([x,y])=>{const M=__MZ,W=M.W;W.dbg.noShoot=false;M.tp(x,y);W.Z.length=0;const i=M.addZombie('zombie',x,y-90,1);W.Z[i].hp=80;const c0=M.coins();for(let k=0;k<240&&!W.Z[i].die;k++)M.sim(1,1/30);return{dead:!!W.Z[i].die,coins:M.coins()-c0}},P(6.45,17.5));
  ok(kill.dead&&kill.coins===60,`il Revolver uccide lo zombie (+${kill.coins} monete)`);
  // la Bara delle Sorprese: paga, gira, offre, si prende
  const bara=await E(async([x,y])=>{const M=__MZ,W=M.W;W.Z.length=0;M.coins(1000);M.tp(x,y);const B=M.box();if(!B)return{none:1};const ok1=M.buyNow('bara');const c=M.coins();for(let i=0;i<60*7&&B.b.st!=='offre'&&B.b.st!=='scappa';i++)M.sim(1,1/60);const st=B.b.st,gun=B.b.gun;
    if(st==='offre')M.buyNow('bara');for(let i=0;i<60;i++)M.sim(1,1/60);return{ok1,c,st,gun,now:W.gunId}},P(4.45,17.35));
  ok(bara.ok1&&bara.c===250,`la Bara si paga 750 (restano ${bara.c})`);
  ok(bara.st==='offre'?bara.now===bara.gun:bara.st==='scappa',`la Bara offre un'arma e la si prende (${bara.st}: ${bara.gun} → in mano ${bara.now})`);
  console.log('\nERR',JSON.stringify(errs.slice(0,5)));console.log(fails?`${fails} prove non passate`:'tutte le prove passate');await b.close();process.exit(fails?1:0)})();
