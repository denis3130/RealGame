// Prova della partita a ondate (partita.js): il round 1 parte da solo, escono esattamente gli zombie della quota e mai più di quelli insieme,
// il round finisce quando sono morti tutti, la pausa e il round dopo (più zombie, più vita, più veloci); i colpi tolgono vita e la vita torna
// dopo qualche secondo; senza anima l'eroe cade e la partita finisce (monete a zero, oro in base al round, schermata «Sei caduto»); con
// l'anima comprata alla Lanterna si rialza una volta e la lanterna si riaccende (al massimo 3 anime); al round 5 il Becchino (barra, colpo di
// pala avvisato dal cerchio, morti evocati; si vede mentre esce da terra e mentre muore), al round 10 lo Spaventapasseri; la spinta dell'anima
// non porta gli zombie oltre i muri. Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/ondate.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{let s=4242;Math.random=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}});// sempre la stessa partita
  const open=async()=>{await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground&&__MZ.W.director,null,{timeout:60000});await p.waitForTimeout(400);
    await p.evaluate(()=>{const M=__MZ;M.W.dbg.freeze=true;let s=4242;Math.random=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})};// il mondo si muove solo con
  // sim (così i tempi sono quelli simulati) e da qui i numeri a caso ripartono sempre uguali (i fotogrammi veri prima del fermo ne consumano un po')
  const E=(f,a)=>p.evaluate(f,a);await open();
  // 1. il round 1: parte da solo dopo l'attesa, quota 6, mai più di 6 insieme; l'eroe spara da solo e li uccide tutti; poi la pausa e il round 2
  const r1=await E(()=>{const M=__MZ,W=M.W,D=W.director;W.dbg.god=true;let maxAlive=0,born=0;const seen=new Set();let t=0,pausaAt=-1,r2At=-1;
    for(;t<240&&r2At<0;t+=1/30){M.sim(1,1/30);const al=W.Z.filter(z=>z.q&&!z.die);maxAlive=Math.max(maxAlive,al.length);for(const z of W.Z)if(z.q&&!seen.has(z)){seen.add(z);if(D.R===1)born++}
      if(D.st==='pausa'&&pausaAt<0)pausaAt=t;if(D.R===2&&r2At<0)r2At=t}
    return{born,maxAlive,pausaAt:+pausaAt.toFixed(1),r2At:+r2At.toFixed(1),pausa:D.PZ.pausa,quota1:D.quota(1),quota2:D.quota(2),left2:D.left,kills:W.kills}});
  ok(r1.born===r1.quota1&&r1.maxAlive<=6,`round 1: escono ${r1.born} zombie (quota ${r1.quota1}), al massimo ${r1.maxAlive} insieme`);
  ok(r1.pausaAt>0&&Math.abs(r1.r2At-r1.pausaAt-r1.pausa)<.2,`finiti gli zombie la pausa (dal secondo ${r1.pausaAt}) e il round 2 dopo ${(r1.r2At-r1.pausaAt).toFixed(1)} s`);
  ok(r1.quota2>r1.quota1,`il round 2 ha più zombie (${r1.quota2})`);
  // 2. più forti a ogni round
  const sc=await E(()=>{const D=__MZ.W.director;return[1,2,5,9,10,15].map(R=>({R,q:D.quota(R),hp:+D.hpMul(R).toFixed(2),v:+D.spdMul(R,'zombie').toFixed(2)}))});
  ok(sc.every((o,i)=>!i||(o.q>sc[i-1].q&&o.hp>sc[i-1].hp&&o.v>=sc[i-1].v)),'quota, vita e velocità crescono: '+sc.map(o=>`R${o.R} ${o.q}·×${o.hp}·×${o.v}`).join('  '));
  // 3. i colpi tolgono vita, la vita torna dopo qualche secondo
  const hv=await E(()=>{const M=__MZ,W=M.W,D=W.director;W.dbg.god=false;W.Z.length=0;D.inv=0;D.hurtHero(34);const a=D.hp;for(let i=0;i<60;i++)M.sim(1,1/30);const b=D.hp;for(let i=0;i<150;i++)M.sim(1,1/30);return{a,b,c:D.hp}});
  ok(hv.a===66&&hv.b===66&&hv.c===100,`un colpo toglie 34 (vita ${hv.a}), dopo 2 s ancora ${hv.b}, dopo 7 s di nuovo ${hv.c}`);
  // 4. uno zombie vero che attacca fa male a metà del gesto
  const za=await E(()=>{const M=__MZ,W=M.W,D=W.director,h=W.hero;W.Z.length=0;D.inv=0;D.hp=100;W.dbg.noShoot=true;const i=M.addZombie('zombie',h.x+22,h.y,1);const z=W.Z[i];z.q=1;let first=-1;
    for(let k=0;k<90&&first<0;k++){M.sim(1,1/30);if(D.hp<100)first=k/30}W.dbg.noShoot=false;W.Z.length=0;return{first:+first.toFixed(2),hp:D.hp}});
  ok(za.first>0&&za.first<1.2,`lo zombie accanto colpisce dopo ${za.first} s (vita ${Math.round(za.hp)})`);
  // 5. la morte senza anima: cade, la partita finisce, monete a zero, oro, schermata
  const mo=await E(()=>{const M=__MZ,W=M.W,D=W.director;W.Z.length=0;M.coins(820);D.R=4;for(let i=0;i<3;i++){D.inv=0;D.hurtHero(40)}const giu=D.st;for(let i=0;i<90;i++)M.sim(1,1/30);
    const f=document.querySelector('#mzPartita .fine');return{giu,st:D.st,dead:!!W.hero.dead,coins:M.coins(),oro:D.oro,txt:f&&!f.hidden?f.textContent:''}});
  ok(mo.giu==='giu'&&mo.st==='fine'&&mo.dead,`senza anima l'eroe cade (${mo.giu}) e la partita finisce (${mo.st})`);
  ok(mo.coins===0&&mo.oro===10*16+30*4&&/Sei caduto/.test(mo.txt)&&/Round raggiunto: 4/.test(mo.txt),`monete a zero, oro ${mo.oro} per il round 4, schermata «Sei caduto»`);
  // 6. l'anima: si compra alla Lanterna, la fiamma la segue, rialza una volta, la lanterna si riaccende; al massimo 3
  await open();
  const an=await E(()=>{const M=__MZ,W=M.W,D=W.director,L=D.lant,h=W.hero;W.dbg.god=false;W.Z.length=0;M.coins(5000);M.tp(L.x,L.y+40);const out={};
    out.buy=M.buyNow('anima');out.anime=D.anime;out.coins=M.coins();out.again=M.buys.find(b=>b.id==='anima').show();
    D.on=true;for(let i=0;i<3;i++){D.inv=0;D.hurtHero(40)}out.giu=D.st;for(let i=0;i<90;i++)M.sim(1,1/30);out.st=D.st;out.hp=D.hp;out.dead=!!h.dead;out.anime2=D.anime;out.show2=M.buys.find(b=>b.id==='anima').show();
    // altre due anime, poi basta
    for(let k=0;k<2;k++){M.buyNow('anima');for(let i=0;i<3;i++){D.inv=0;D.hurtHero(40)}for(let i=0;i<90;i++)M.sim(1,1/30)}out.comprate=D.comprate;out.show3=M.buys.find(b=>b.id==='anima').show();return out});
  ok(an.buy&&an.anime===1&&an.coins===3500&&!an.again,`la Lanterna vende un'anima (1.500): poi non se ne compra un'altra finché non la usi`);
  ok(an.giu==='giu'&&(an.st==='round'||an.st==='inizio')&&an.hp===100&&!an.dead&&an.anime2===0&&an.show2,`con l'anima l'eroe si rialza (${an.st}, vita ${an.hp}) e la lanterna si riaccende`);
  ok(an.comprate===3&&!an.show3,`al massimo 3 anime per partita (comprate ${an.comprate}, poi la lanterna resta spenta)`);
  // 6b. la spinta dell'anima non fa passare gli zombie attraverso i muri: l'eroe 45 px a sud del muro della Fattoria (cancello chiuso), lo
  // zombie tra lui e il muro; dopo la rianimazione lo zombie resta da questa parte (prima saltava di là e il round non finiva più)
  await open();
  const sp6=await E(()=>{const M=__MZ,W=M.W,D=W.director,h=W.hero;W.Z.length=0;D.startRound(3);D.left=0;W.dbg.god=false;W.dbg.noShoot=true;M.coins(1600);M.buyNow('anima');
    M.tp(320,965);D.on=true;const z=W.Z[M.addZombie('zombie',320,940)];z.q=1;
    for(let k=0;k<3;k++){D.inv=0;D.hurtHero(40)}for(let k=0;k<90;k++)M.sim(1,1/30);return{gate:W.gate.open,st:D.st,zy:+z.y.toFixed(1)}});
  ok(!sp6.gate&&sp6.st!=='fine'&&sp6.zy>921,`l'anima spinge via lo zombie ma non oltre il muro della Fattoria (y ${sp6.zy}, il muro finisce a 921)`);
  // 7. il Becchino al round 5: esce da terra, la barra, il cerchio avvisa e la pala fa male, evoca i morti, sconfitto dà monete e munizioni
  await open();
  const be=await E(()=>{const M=__MZ,W=M.W,D=W.director,h=W.hero;W.dbg.god=true;W.Z.length=0;D.startRound(5);for(let i=0;i<60*5;i++)M.sim(1,1/60);const b=D.boss,out={kind:b&&b.kind,hp:b&&Math.round(b.hp),bar:!document.querySelector('#mzPartita .boss').hidden,left:D.left};
    if(!b)return out;W.dbg.noSpawn=true;for(const z of W.Z)if(z!==b)z.die=1.2;
    // l'eroe a 50 px dal Becchino, in un punto libero e senza niente in mezzo (con un ostacolo in mezzo il Becchino gira intorno e i morti mordono prima)
    const clear=(x0,y0,x1,y1)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/3);for(let k=1;k<=n;k++)if(M.hit(x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,2))return false;return true};
    let P=[b.x,b.y+50];for(let a=0;a<16;a++){const x=b.x+Math.cos(a*Math.PI/8)*50,y=b.y+Math.sin(a*Math.PI/8)*50;if(!M.hit(x,y,14)&&clear(b.x,b.y,x,y)){P=[x,y];break}}
    W.dbg.god=false;D.inv=0;D.hp=100;M.tp(P[0],P[1]);let warned=0,hurt=0,summoned=0;const n0=W.Z.length;W.dbg.noShoot=true;
    for(let i=0;i<60*14;i++){M.sim(1,1/60);if(D.warn.some(w=>!w.sum))warned=1;if(D.hp<100&&!hurt){hurt=1;W.dbg.god=true}if(D.warn.some(w=>w.sum))summoned=1;if(warned&&hurt&&summoned)break}// (colpito una volta, poi invulnerabile: si aspetta l'evocazione)
    out.warned=warned;out.hurt=hurt;out.summoned=summoned;W.dbg.god=true;W.hero.dead=false;W.hero.fall=0;D.st='round';D.hp=100;W.dbg.noShoot=false;
    const c0=M.coins();M.hurt(b,b.hp+1,false);out.reward=M.coins()-c0;out.ammo=M.gun().mag===M.gun().D.mag;for(let i=0;i<60*2;i++)M.sim(1,1/60);out.barGone=document.querySelector('#mzPartita .boss').hidden;return out});
  ok(be.kind==='becchino'&&be.bar&&be.hp>=1000,`round 5: il Becchino (vita ${be.hp}) con la sua barra`);
  ok(be.warned&&be.hurt,`il cerchio avvisa e la pala fa male (avviso ${be.warned}, colpito ${be.hurt})`);
  ok(be.summoned,`il Becchino evoca i morti intorno all'eroe`);
  ok(be.reward>=500&&be.ammo&&be.barGone,`sconfitto: +${be.reward} monete, munizioni piene, la barra sparisce`);
  // 7b. il Becchino si vede mentre esce da terra e mentre muore (il ritaglio cresce con la sua grandezza): pixel suoi (con e senza di lui)
  await open();
  const vb=await E(()=>{const M=__MZ,W=M.W,D=W.director,C=M.CAM;W.dbg.halt=true;W.dbg.god=true;W.dbg.noShoot=true;W.dbg.noSpawn=true;W.Z.length=0;M.hud(false);
    const cv=document.getElementById('mzCv'),g=cv.getContext('2d');
    const px=z=>{C.x=z.x;C.y=z.y-30;M.render(0);const A=g.getImageData(0,0,cv.width,cv.height).data;const i=W.Z.indexOf(z);W.Z.splice(i,1);M.render(0);const B=g.getImageData(0,0,cv.width,cv.height).data;W.Z.splice(i,0,z);
      let n=0;for(let j=0;j<A.length;j+=4)if(Math.abs(A[j]-B[j])+Math.abs(A[j+1]-B[j+1])+Math.abs(A[j+2]-B[j+2])>6)n++;return n};
    D.startRound(5);for(let t=0;!D.boss&&t<20;t+=1/60)M.sim(1,1/60);const z=D.boss;if(!z)return{};while(z.rise<.85)M.sim(1,1/60);const up=px(z);while(z.rise<1)M.sim(1,1/60);const full=px(z);
    M.hurt(z,z.hp+1,false);while(z.die<.3)M.sim(1,1/60);return{up,full,die:px(z)}});
  ok(vb.full>0&&vb.up>.35*vb.full&&vb.die>.3*vb.full,`il Becchino si vede mentre esce da terra (${vb.up} px, in piedi ${vb.full}) e mentre sprofonda (${vb.die} px)`);
  // 8. lo Spaventapasseri al round 10: trottola che fa male da vicino
  await open();
  const sp=await E(()=>{const M=__MZ,W=M.W,D=W.director;W.dbg.god=true;W.dbg.noSpawn=true;W.Z.length=0;D.startRound(10);for(let i=0;i<60*5;i++)M.sim(1,1/60);const b=D.boss;if(!b)return{};let P=[b.x,b.y+40];for(let a=0;a<16;a++){const x=b.x+Math.cos(a*Math.PI/8)*40,y=b.y+Math.sin(a*Math.PI/8)*40;if(!M.hit(x,y,14)){P=[x,y];break}}
    W.dbg.god=false;D.inv=0;D.hp=100;W.dbg.noShoot=true;M.tp(P[0],P[1]);
    let spun=0;for(let i=0;i<60*8;i++){M.sim(1,1/60);if(b.A&&b.A.st==='giro')spun=1;if(D.hp<100||W.hero.dead)break}return{kind:b.kind,hp:Math.round(b.hp),spun,hurt:D.hp<100||!!W.hero.dead}});
  ok(sp.kind==='spaventapasseri'&&sp.spun&&sp.hurt,`round 10: lo Spaventapasseri (vita ${sp.hp}) fa la trottola e fa male`);
  console.log('\nERR',JSON.stringify(errs.slice(0,5)));console.log(fails?`${fails} prove non passate`:'tutte le prove passate');await b.close();process.exit(fails?1:0)})();
