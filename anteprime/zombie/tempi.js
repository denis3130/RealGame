// Tempi dell'ordine di disegno (piano §6.2, da agenti/perf/perf.js e knobs2.js). In tre posti (partenza, dietro la casa, in casa), senza e con
// 5 zombie: fotogrammi alternati con l'ordine nuovo e con quello di prima (W.dbg.ord='ky'), mediana dei tempi di render; con W.dbg.prof i tempi
// dell'ordine (coppie, regole, componenti, più l'ordine dentro i prop quando non è in memoria) e della sagoma. Poi un giro di 360° a passi di 3°
// dietro la casa: il primo giro (le memorie per ψ si riempiono) e il secondo. Soglie: vista predefinita ±0,3 ms; ordine ≤ 0,15 ms (headless);
// giro dietro la casa ≤ +0,5 ms (con il ritaglio della sagoma, fase 6: qui si misura e basta). Poi va letto il contatore sul telefono di Denis
// (W.dbg.prof=true nella console: «ord … · sil …» accanto ai ms).
// Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/tempi.js [pagina] [rallentamento CPU, es. 4]
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html')),THR=+(process.argv[3]||1);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForTimeout(2500);
  // (prima si aspetta che il riempitore in sottofondo delle memorie per settore abbia finito: non deve rubare tempo alle misure)
  for(let i=0,last=-1;i<60;i++){const m=await p.evaluate(()=>__MZ.memo());if(m===last)break;last=m;await p.waitForTimeout(500)}
  if(THR>1){const c=await p.context().newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:THR})}
  const T=64,POS=[['partenza',281.6,537.6],['dietro la casa',7.3*T,.6*T],['in casa',7*T,2*T]];
  console.log(`tempi (ms; dpr 2; CPU ×${THR}; ciclo dei fotogrammi fermo): render con la tela svuotata (getImageData) a fotogrammi alterni, nuovo | ky | mediana delle differenze;`);
  console.log(`  ordine a fotogramma: telecamera ferma · telecamera appena mossa (riquadri a schermo) · ψ appena cambiato (verdetti) · più l'ordine dentro i prop rifatto; solo coppie e componenti; voci`);
  for(const[nm,x,y] of POS)for(const zom of[0,5]){
    const r=await p.evaluate(async([x,y,zom])=>{const M=__MZ,W=M.W,med=a=>{a=a.slice().sort((p,q)=>p-q);return a[a.length>>1]};
      W.dbg.halt=true;M.zombies(false);W.Z.length=0;W.dbg.noShoot=true;W.dbg.freeze=false;M.view(0,45);M.tp(x,y);for(let i=0;i<40;i++)M.render(.05);
      if(zom)for(let i=0;i<5;i++)M.addZombie(['zombie','strisciante','minatore','lanterna','hound'][i],x-80+i*40,y-90+(i%2)*30);W.dbg.freeze=true;
      const g=document.querySelector('#mzCv').getContext('2d'),one=()=>{const t0=performance.now();M.render(0);g.getImageData(0,0,1,1);return performance.now()-t0};
      for(let i=0;i<10;i++)one();const A=[],B=[],Dd=[];
      for(let i=0;i<60;i++){let a,b;if(i%2){W.dbg.ord='ky';b=one();W.dbg.ord=undefined;a=one()}else{W.dbg.ord=undefined;a=one();W.dbg.ord='ky';b=one();W.dbg.ord=undefined}A.push(a);B.push(b);Dd.push(a-b)}
      M.render(0);const o=M.bench(400),oc=M.bench(200,'cam'),o1=M.bench(100,1),o2=M.bench(20,2),cp=M.bench(400,0,'coppie');W.dbg.freeze=false;W.Z.length=0;W.dbg.halt=false;
      return{a:med(A),b:med(B),d:med(Dd),o,oc,o1,o2,cp,n:M.order().length}},[x,y,zom]);
    console.log(`  ${(nm+(zom?' + 5 zombie':'')).padEnd(26)} ${r.a.toFixed(2).padStart(6)} | ${r.b.toFixed(2).padStart(6)} | ${(r.d>=0?'+':'')+r.d.toFixed(2)} · ordine ${r.o.toFixed(3)} · ${r.oc.toFixed(3)} · ${r.o1.toFixed(3)} · ${r.o2.toFixed(3)} · coppie ${r.cp.toFixed(3)} · voci ${r.n}`)}
  // il giro dietro la casa: 120 passi da 3°; il primo giro riempie le memorie per ψ e per settore (si misura il nuovo da solo), nel secondo a ogni
  // passo un fotogramma col nuovo e uno con l'ordine di prima: mediana delle differenze
  const gg=await p.evaluate(async([x,y])=>{const M=__MZ,W=M.W,med=a=>{a=a.slice().sort((p,q)=>p-q);return a[a.length>>1]};W.dbg.halt=true;
    M.zombies(false);W.Z.length=0;W.dbg.freeze=false;M.view(0,45);M.tp(x,y);for(let i=0;i<40;i++)M.render(.05);W.dbg.freeze=true;const g=document.querySelector('#mzCv').getContext('2d');
    const one=()=>{const t0=performance.now();M.render(0);g.getImageData(0,0,1,1);return performance.now()-t0};
    const mem0=M.memo();W.dbg.noWarm=true;M.memo(1);const F=[],O1=[],A=[],B=[],Dd=[],O2=[];W.dbg.prof=true;
    for(let k=0;k<120;k++){M.view(k*3,45);W.dbg.ord=undefined;F.push(one());O1.push(M.prof().ord)}
    // (il primo fotogramma dopo un passo paga da solo il cambio di trasformazione della tela, circa 1,5 ms: l'ordine dei due si alterna)
    for(let k=0;k<120;k++){M.view(k*3,45);let a,b;if(k%2){W.dbg.ord='ky';b=one();W.dbg.ord=undefined;a=one();O2.push(M.prof().ord)}else{W.dbg.ord=undefined;a=one();O2.push(M.prof().ord);W.dbg.ord='ky';b=one()}A.push(a);B.push(b);Dd.push(a-b)}
    W.dbg.prof=false;W.dbg.ord=undefined;M.view(0,45);W.dbg.freeze=false;W.dbg.halt=false;W.dbg.noWarm=false;
    return{mem0,f:med(F),fmx:Math.max(...F),o1:med(O1),o1mx:Math.max(...O1),a:med(A),b:med(B),d:med(Dd),o2:med(O2),o2mx:Math.max(...O2)}},[7.3*T,.6*T]);
  console.log(`giro di 360° dietro la casa (120 passi da 3°), render con la tela svuotata:`);
  console.log(`  (memorie per settore già riempite in sottofondo all'inizio della prova: ${gg.mem0}; per il primo giro si svuotano e il riempitore si ferma)`);
  console.log(`  primo giro (memorie vuote): mediana ${gg.f.toFixed(1)}, il più lungo ${gg.fmx.toFixed(1)} · ordine (W.dbg.prof, timer da 0,1 ms) ${gg.o1.toFixed(2)} / ${gg.o1mx.toFixed(2)}`);
  console.log(`  secondo giro: nuovo ${gg.a.toFixed(1)} | ky ${gg.b.toFixed(1)} | mediana delle differenze ${(gg.d>=0?'+':'')+gg.d.toFixed(2)} ms · ordine ${gg.o2.toFixed(2)} / ${gg.o2mx.toFixed(2)}`);
  console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
