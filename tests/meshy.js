// Lo zombie di Meshy nella sua pagina (anteprime/mk_meshy.py, poi node tests/meshy.js [pagina.html]): il modello si carica, ogni mossa
// parte e torna a «Fermo», «Tutte» le fa in fila, «Quattro direzioni» e «Prima e dopo», «Effetti ridotti», niente errori, il tempo di
// disegno. Foto: tests/meshy_mosse.jpg (ogni mossa a metà), tests/meshy_prima_dopo.png (il nostro di oggi sopra, quello di Meshy sotto).
const {chromium}=require('playwright');const path=require('path');const D=__dirname+'/';
const page=process.argv[2]||path.join(D,'..','anteprime','meshy.html');
let ok=0,ko=0;const ck=(c,m)=>{if(c){ok++;console.log('  sì  '+m)}else{ko++;console.log('  NO  '+m)}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:{width:390,height:763},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200))});
  await p.goto('file://'+page);await p.waitForFunction(()=>window.__MZB,null,{timeout:90000}).catch(()=>{});
  const E=s=>p.evaluate(s);
  let s=await E(`JSON.stringify({prims:__MZB.M.prims.length,tri:__MZB.M.prims.reduce((a,q)=>a+q.idx.length/3,0),ossa:__MZB.M.skin&&__MZB.M.skin.joints.length,clips:__MZB.M.clips.map(c=>c.name),mosse:__MZB.MOVES.map(m=>m.id),B:__MZB.B})`).catch(()=>'{}');s=JSON.parse(s);
  ck(s.prims>0&&s.ossa>0&&s.mosse&&s.mosse.length>=5,'il modello si carica con lo scheletro e le mosse '+JSON.stringify({tri:s.tri,ossa:s.ossa,mosse:s.mosse}));
  const miss=Object.entries(s.B||{}).filter(([k,v])=>v<0).map(([k])=>k);ck(!miss.length,'le ossa che muoviamo noi ci sono tutte'+(miss.length?' (mancano: '+miss.join(', ')+')':''));
  // every move: it starts, and (if it does not repeat) it goes back to «Fermo»; a photo in the middle
  const shots=[];for(const id of s.mosse||[]){await E(`__MZB.play('${id}')`);const m=await E(`(()=>{const c=__MZB.cur;return{d:c.m.dur||c.clip.dur/(c.m.sp||1),loop:!!c.m.loop,hold:c.m.hold||0}})()`);
    await p.waitForTimeout(Math.min(2500,m.d*500));shots.push({id,png:await p.screenshot({clip:{x:0,y:60,width:390,height:520}})});
    if(!m.loop){await p.waitForFunction(id=>__MZB.cur.m.id!==id,id,{timeout:(m.d+m.hold)*1000+15000}).catch(()=>{});
      ck(await E(`__MZB.cur.m.id==='fermo'||(__MZB.cur.m.id==='sbuca'&&'${id}'==='muore')`),`«${id}» parte e poi torna da solo`)}else ck(await E(`__MZB.cur.m.id==='${id}'`),`«${id}» si ripete`)}
  // «Tutte»: one after the other
  await E(`[...document.querySelectorAll('#mv button')].find(b=>b.textContent==='Tutte').click()`);const seen=new Set();for(let i=0;i<24;i++){seen.add(await E(`__MZB.cur.m.id`));await p.waitForTimeout(700)}
  ck(seen.size>=3,'«Tutte» le fa in fila: '+[...seen].join(', '));
  // four sides, before and after
  await E(`[...document.querySelectorAll('#op button')].find(b=>b.textContent==='Quattro direzioni').click();__MZB.play('fermo')`);await p.waitForTimeout(1500);
  const four=await p.screenshot();
  await E(`[...document.querySelectorAll('#op button')].find(b=>b.textContent==='Prima e dopo').click()`);await p.waitForTimeout(1500);
  ck(await E(`!document.getElementById('oggi').hidden&&document.getElementById('oggi').naturalWidth>0`),'«Prima e dopo»: sopra il nostro zombie di oggi da quattro lati');
  await p.screenshot({path:D+'meshy_prima_dopo.png'});
  await E(`[...document.querySelectorAll('#op button')].find(b=>b.textContent==='Prima e dopo').click()`);
  // reduced effects
  await E(`[...document.querySelectorAll('#op button')].find(b=>b.textContent==='Effetti ridotti').click()`);await p.waitForTimeout(1200);const lowMs=await E(`__MZB.ms`);
  await E(`[...document.querySelectorAll('#op button')].find(b=>b.textContent==='Effetti ridotti').click()`);await p.waitForTimeout(1200);const ms=await E(`__MZB.ms`);
  ck(ms>0&&lowMs>0,`tempo di disegno (senza scheda grafica): ${ms.toFixed(2)} ms, effetti ridotti ${lowMs.toFixed(2)} ms`);
  ck(!errs.length,'nessun errore'+(errs.length?' '+errs.slice(0,3).join(' | '):''));
  // the sheet of the moves
  {const W=195,Hh=260,cols=4,rows=Math.ceil(shots.length/cols);const html=`<body style="margin:0;background:#0b1016;display:grid;grid-template-columns:repeat(${cols},${W}px);gap:4px;color:#f1e4c6;font:700 13px sans-serif">${shots.map(x=>`<div style="position:relative"><img style="width:${W}px;height:${Hh}px;object-fit:cover" src="data:image/png;base64,${x.png.toString('base64')}"><div style="position:absolute;left:6px;top:4px">${x.id}</div></div>`).join('')}</body>`;
    const q=await b.newPage({viewport:{width:cols*(W+4),height:rows*(Hh+4)}});await q.setContent(html);await q.waitForTimeout(300);await q.screenshot({path:D+'meshy_mosse.jpg',type:'jpeg',quality:84});await q.close()}
  require('fs').writeFileSync(D+'meshy_quattro.png',four);
  console.log(`\n${ok} sì, ${ko} no`);await b.close();process.exit(ko?1:0)})();
