// Prova degli zombie «chiusi da qualche parte» (difetti dell'anteprima 48, segnalati da Denis: «restano chiusi dietro una barriera»):
// 1. con ogni combinazione di zone aperte, uno zombie da ogni buca attiva arriva all'eroe fermo (la mappa delle distanze copre tutta la mappa
//    grande: prima oltre 1.100 px andavano dritti e si incastravano contro staccionate e barriere);
// 2. dal varco del bordo est lo zombie rompe le assi ed entra (prima restava fuori a spingere: il controllo della barriera era troppo severo);
// 3. le buche dietro una barriera chiusa non sono mai scelte;
// 4. uno zombie della partita chiuso di là da una barriera, fuori dallo schermo, rinasce da una buca raggiungibile;
// 5. gli zombie fermi di una zona chiusa vengono alle assi della sua barriera quando l'eroe è vicino, e il cancello della fattoria attira solo
//    quelli della fattoria.
// Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/chiusi_prova.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(400);
  await p.evaluate(()=>{const M=__MZ,W=M.W,T=64;window.X=v=>v*T;window.Y=v=>(v+2)*T;W.dbg.god=true;W.dbg.noShoot=true;
    // le zone aperte comprando davvero le barriere (così si aprono anche i passaggi): ids dei bottoni
    window.apri=(zo,buy)=>{const M=__MZ,W=M.W,ZM=M.ZM;ZM.ctl.nuova();W.dbg.noSpawn=true;W.Z.length=0;W.coins=99999;if(zo[2]){const g=ZM.buys.find(o=>o.id==='cancello');if(g)g.act()}
      for(const id of buy){const o=ZM.buys.find(q=>q.id===id);if(o)o.act()}W.zoneOpen={1:true,2:!!zo[2],3:!!zo[3],4:!!zo[4]};W.split=null;ZM.navRebuild()};
    window.tutti=(sx,sy,secs)=>{const M=__MZ,W=M.W,ZM=M.ZM;M.tp(X(sx),Y(sy));W.Z.length=0;M.sim(2,1/60);const hs=M.holes.filter(h=>h[2]==null||W.zoneOpen[h[2]]);
      const zs=hs.map(h=>{const z=ZM.spawn({hole:h,kind:'zombie'});if(z){z.hp=1e6;z.rise=1}return[h,z]}).filter(a=>a[1]);const best=new Map();
      for(let i=0;i<60*secs;i++){M.sim(1,1/60);if(i%30===0)for(const[,z] of zs){const d=Math.hypot(z.x-W.hero.x,z.y-W.hero.y);best.set(z,Math.min(best.get(z)??1e9,d))}}
      const bad=zs.filter(([,z])=>best.get(z)>80).map(([h])=>[+(h[0]/64).toFixed(1),+(h[1]/64-2).toFixed(1),h[3]]);W.Z.length=0;return{n:zs.length,bad}}});
  // ---- 1. da ogni buca all'eroe, in quattro combinazioni di zone aperte
  for(const[nm,zo,buy,spots] of[['partenza e borgo',{3:1},['zona3'],[[25.5,13.2],[8,18]]],['partenza, borgo e segheria',{3:1,4:1},['zona3','zona34'],[[17,9.6],[22,6]]],
    ['partenza, fattoria e segheria',{2:1,4:1},['zona24'],[[25.5,11.5]]],['tutte',{2:1,3:1,4:1},['zona3','zona34','zona24'],[[8,6],[20,15]]]]){
    await p.evaluate(([zo,buy])=>apri(zo,buy),[zo,buy]);
    for(const[sx,sy] of spots){const r=await p.evaluate(([x,y])=>tutti(x,y,80),[sx,sy]);ok(r.n>8&&!r.bad.length,`${nm}, eroe in (${sx}, ${sy}): da tutte le ${r.n} buche lo zombie arriva (non arrivati: ${JSON.stringify(r.bad)})`)}}
  // ---- 2. il varco del bordo est del borgo: lo zombie rompe le assi ed entra
  const est=await p.evaluate(()=>{const M=__MZ,W=M.W,ZM=M.ZM;apri({2:1,3:1,4:1},['zona3','zona34','zona24']);M.tp(X(25.5),Y(15));M.sim(2,1/60);
    const h=M.holes.find(q=>Math.abs(q[0]-(X(29.3)+30))<2&&Math.abs(q[1]-Y(18.5))<2),B=ZM.BARS.find(B=>Math.abs(B.x-X(29.3))<3&&Math.abs(B.y-Y(18.5))<3);
    const z=ZM.spawn({hole:h,kind:'zombie'});z.hp=1e6;let hit=-1,inside=-1;for(let i=0;i<60*25;i++){M.sim(1,1/60);if(hit<0&&z.bx&&z.bx.st==='colpo')hit=i/60;if(inside<0&&z.x<X(29.3)-12)inside=i/60}
    W.Z.length=0;return{hit:+hit.toFixed(1),inside:+inside.toFixed(1),assi:B.n}});
  ok(est.hit>=0&&est.inside>est.hit,`dal varco del bordo est lo zombie colpisce le assi dopo ${est.hit} s ed entra nel borgo dopo ${est.inside} s (assi rimaste ${est.assi})`);
  // ---- 3. con la segheria chiusa e l'eroe nel borgo vicino al cancello: nessuna buca della segheria, nemmeno quelle a un passo dalle assi
  const scelte=await p.evaluate(()=>{const M=__MZ,W=M.W,ZM=M.ZM;apri({3:1},['zona3']);M.tp(X(25.5),Y(13.2));M.sim(2,1/60);const seen=new Set();
    for(let i=0;i<300;i++){const h=ZM.pickHole();if(h)seen.add(h)}return[...seen].map(h=>({x:h[0],y:h[1],z:h[2],d:ZM.holeDist(h)})).filter(q=>q.y<Y(12.3)||q.d>=1e9).length});
  ok(scelte===0,`con la segheria chiusa nessuna buca scelta sta di là dal cancello (${scelte})`);
  // ---- 4. uno zombie della partita chiuso di là (nella segheria chiusa), lontano dallo schermo: rinasce da una buca raggiungibile
  const rin=await p.evaluate(()=>{const M=__MZ,W=M.W,ZM=M.ZM;apri({3:1},['zona3']);M.tp(X(20),Y(15));M.cam(X(20),Y(15));M.render(0);M.sim(2,1/60);const r0=W.relocs||0;
    const z=ZM.spawn({hole:[X(22.6),Y(6.4),null,null],kind:'zombie'});z.q=1;z.hp=1e6;z.rise=1;let t=-1;for(let i=0;i<60*8;i++){M.sim(1,1/60);if(i%20===0)M.render(0);if(t<0&&(W.relocs||0)>r0){t=i/60;break}}
    const D={D:ZM.holeDist([z.x,z.y])};let d=1e9;/* (la casella libera più vicina: le buche stanno spesso dentro una fossa) */for(let i=0;i<60*40;i++){M.sim(1,1/60);if(i%60===0)M.render(0);d=Math.min(d,Math.hypot(z.x-W.hero.x,z.y-W.hero.y))}const n2=(W.relocs||0)-r0;M.cam(null);W.Z.length=0;return{t:+t.toFixed(1),D:D&&Math.round(D.D),d:Math.round(d),n2}});
  ok(rin.t>0&&rin.t<5&&rin.D<1e9&&rin.d<80&&rin.n2===1,`uno zombie chiuso di là rinasce dopo ${rin.t} s da una buca raggiungibile (distanza dall'eroe ${rin.D} px), lo raggiunge (${rin.d} px) e non rinasce più (${rin.n2} volta)`);
  // ---- 5. gli zombie fermi: alle assi della loro barriera, e il cancello della fattoria attira solo quelli della fattoria
  const fermi=await p.evaluate(()=>{const M=__MZ,W=M.W,ZM=M.ZM;ZM.ctl.nuova();W.dbg.noSpawn=true;W.zoneOpen[3]=true;const b=ZM.buys.find(o=>o.id==='zona3');W.coins=99999;b.act();ZM.navRebuild();
    M.tp(X(25.5),Y(13.4));for(let i=0;i<60*40;i++)M.sim(1,1/60);const L4=W.lures.find(L=>L.zone===4&&L.y===ZM.buys.find(o=>o.id==='zona34').y),seg=W.Z.filter(z=>z.idle&&z.idle.zone===4),at=seg.filter(z=>L4.slots.some(q=>Math.hypot(q[0]-z.x,q[1]-z.y)<40)).length;
    ZM.ctl.nuova();W.dbg.noSpawn=true;M.tp(X(6.45),Y(12.3)+30);const p0=W.Z.filter(z=>z.idle&&z.idle.zone!==2).map(z=>[z,z.x,z.y]);for(let i=0;i<60*10;i++)M.sim(1,1/60);
    const moved=p0.filter(([z,x,y])=>Math.hypot(z.x-z.idle.home[0],z.y-z.idle.home[1])>90).length,farm=W.Z.filter(z=>z.idle&&z.idle.zone===2&&Math.hypot(z.x-W.gate.x,z.y-W.gate.y)<70).length;return{seg:seg.length,at,moved,farm}});
  ok(fermi.at===fermi.seg&&fermi.seg>0,`con l'eroe vicino al cancello della segheria, i ${fermi.seg} zombie fermi della segheria vengono alle assi (${fermi.at})`);
  ok(fermi.moved===0&&fermi.farm>0,`al cancello della fattoria vengono solo quelli della fattoria (${fermi.farm}); quelli del borgo e della segheria restano a casa loro (lontani: ${fermi.moved})`);
  console.log('ERR',JSON.stringify(errs.slice(0,3)));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
