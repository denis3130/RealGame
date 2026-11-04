// Gli zombie in 3D vero nella loro pagina (python3 anteprime/mk_zombie3d.py, poi node tests/zombie3d.js [pagina.html] [mostro]): per ogni mostro
// (lo zombie base e lo strisciante) il modello si costruisce, ogni mossa parte e (se non si ripete) torna da sola, «Tutte» le fa in fila,
// «Quattro direzioni» e «Prima e dopo», «Effetti ridotti», nessun errore, i tempi. Foto di ogni mostro (zombie3d_… per lo zombie base,
// strisciante3d_… per lo strisciante): tests/<nome>_mosse.jpg (ogni mossa in sei momenti, di tre quarti), tests/<nome>_prima_dopo.png
// (il nostro mostro di oggi sopra, quello in 3D sotto; <nome>_prima_dopo_grande.png lo stesso su uno schermo grande), tests/<nome>_quattro.png.
const {chromium}=require('playwright');const path=require('path');const D=__dirname+'/';
const page=process.argv[2]&&process.argv[2].endsWith('.html')?process.argv[2]:path.join(D,'..','anteprime','zombie3d.html'),ONLY=process.argv.find(a=>/^(zombie|strisciante)$/.test(a));
let ok=0,ko=0;const ck=(c,m)=>{if(c){ok++;console.log('  sì  '+m)}else{ko++;console.log('  NO  '+m)}};
// how each one is photographed: the bones it must have, the camera of the sheet of the moves, the size of a photo
const CFG={zombie:{file:'zombie3d',bones:25,cam:{view:.75,pitch:.32,dist:1.05},clip:{x:45,y:40,width:300,height:470},W:150,H:235},
  strisciante:{file:'strisciante3d',bones:27,cam:{view:.75,pitch:.45,dist:.78},clip:{x:0,y:150,width:390,height:330},W:195,H:165}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:390,height:763},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200))});
  await p.goto('file://'+page);await p.waitForFunction(()=>window.__Z3D&&__Z3D.ready,null,{timeout:90000}).catch(()=>{});
  const E=s=>p.evaluate(s);
  const models=JSON.parse(await E(`JSON.stringify(__Z3D.models)`).catch(()=>'[]'));
  ck(models.includes('zombie')&&models.includes('strisciante'),'nella pagina ci sono i due mostri: '+models.join(', '));
  for(const md of models.filter(m=>!ONLY||m===ONLY)){const C=CFG[md];console.log('\n— '+md);
    await E(`__Z3D.model='${md}'`);await p.waitForFunction(m=>__Z3D.ready&&__Z3D.model===m,md,{timeout:90000}).catch(()=>{});
    let s=JSON.parse(await E(`JSON.stringify({tri:__Z3D.M.tri,ossa:__Z3D.M.skin.joints.length,mosse:__Z3D.MOVES.map(m=>m.id),ms:__Z3D.buildMs})`).catch(()=>'{}'));
    ck(s.tri>5000&&s.ossa===C.bones&&s.mosse&&s.mosse.length===9,`il modello si costruisce (${s.tri} triangoli, ${s.ossa} ossa, in ${s.ms&&s.ms.toFixed(0)} ms) con le nove mosse`);
    // every move: it starts, and (if it does not repeat) it goes back by itself
    for(const id of s.mosse||[]){await E(`__Z3D.play('${id}')`);const m=await E(`(()=>{const c=__Z3D.cur;return{d:c.m.dur,loop:!!c.m.loop,hold:c.m.hold?2.2:0}})()`);
      if(!m.loop){await p.waitForFunction(id=>__Z3D.cur.m.id!==id,id,{timeout:(m.d+m.hold)*1000+20000}).catch(()=>{});ck(await E(`__Z3D.cur.m.id!=='${id}'`),`«${id}» parte e poi torna da solo`)}
      else{await p.waitForTimeout(1200);ck(await E(`__Z3D.cur.m.id==='${id}'`),`«${id}» si ripete`)}}
    // «Tutte»: one after the other
    await E(`[...document.querySelectorAll('#mv button')].find(b=>b.textContent==='Tutte').click()`);const seen=new Set();for(let i=0;i<22;i++){seen.add(await E(`__Z3D.cur.m.id`));await p.waitForTimeout(800)}
    ck(seen.size>=3,'«Tutte» le fa in fila: '+[...seen].join(', '));
    // the moves in six moments each, seen from three quarters (frozen moments)
    const shots=[];await E(`__Z3D.auto=false;__Z3D.view=${C.cam.view};__Z3D.pitch=${C.cam.pitch};__Z3D.dist=${C.cam.dist};document.querySelectorAll('.ui').forEach(e=>e.style.visibility='hidden')`);
    for(const id of s.mosse||[])for(const k of[.05,.22,.4,.58,.76,.94]){await E(`__Z3D.hold={id:'${id}',p:${k}}`);await p.waitForTimeout(350);shots.push({id,k,png:await p.screenshot({clip:C.clip})})}
    await E(`__Z3D.hold=null;document.querySelectorAll('.ui').forEach(e=>e.style.visibility='');__Z3D.dist=1;__Z3D.play('fermo')`);
    // four sides, before and after
    await E(`__Z3D.four=true`);await p.waitForTimeout(1500);require('fs').writeFileSync(D+C.file+'_quattro.png',await p.screenshot());
    await E(`__Z3D.cmp=true`);await p.waitForTimeout(1500);
    ck(await E(`!document.getElementById('oggi').hidden&&document.getElementById('oggi').naturalWidth>0`),'«Prima e dopo»: sopra il nostro mostro di oggi da quattro lati');
    ck(await E(`document.getElementById('oggi').getBoundingClientRect().top>=document.querySelector('.top').getBoundingClientRect().bottom`),'«Prima e dopo»: la foto di oggi sta sotto la barra in alto');
    await p.screenshot({path:D+C.file+'_prima_dopo.png'});
    // the same, big, to look at closely: a computer screen
    await p.setViewportSize({width:1200,height:900});await p.waitForTimeout(1800);await p.screenshot({path:D+C.file+'_prima_dopo_grande.png'});await p.setViewportSize({width:390,height:763});
    await E(`__Z3D.cmp=false;__Z3D.four=false`);
    // reduced effects
    await E(`__Z3D.low=true`);await p.waitForTimeout(1500);const lowMs=await E(`__Z3D.ms`);await E(`__Z3D.low=false`);await p.waitForTimeout(1500);const ms=await E(`__Z3D.ms`);
    ck(ms>0&&lowMs>0,`tempo del fotogramma (computer di prova senza scheda grafica): ${ms.toFixed(2)} ms, effetti ridotti ${lowMs.toFixed(2)} ms`);
    // the sheet of the moves
    {const W=C.W,Hh=C.H,rows=[...new Set(shots.map(x=>x.id))];const html=`<body style="margin:0;background:#0b1016;color:#f1e4c6;font:700 13px sans-serif">${rows.map(id=>`<div style="display:flex;align-items:center"><div style="width:84px;padding-left:6px">${id}</div>${shots.filter(x=>x.id===id).map(x=>`<img style="width:${W}px;height:${Hh}px" src="data:image/png;base64,${x.png.toString('base64')}">`).join('')}</div>`).join('')}</body>`;
      const q=await b.newPage({viewport:{width:84+6*W,height:rows.length*Hh}});await q.setContent(html);await q.waitForTimeout(300);await q.screenshot({path:D+C.file+'_mosse.jpg',type:'jpeg',quality:82});await q.close()}}
  ck(!errs.length,'nessun errore'+(errs.length?' '+errs.slice(0,3).join(' | '):''));
  console.log(`\n${ok} sì, ${ko} no`);await b.close();process.exit(ko?1:0)})();
