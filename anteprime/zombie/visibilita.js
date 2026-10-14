// Mappa di visibilità dell'eroe: per ogni punto dove può stare (griglia di PASSO px) lo disegna tre volte (normale, eroe sopra a tutto, senza eroe)
// e misura quanta parte di lui si vede. Scrive vetrina/vis.json, vetrina/vis_mappa.png (verde visibile, giallo mezzo coperto, rosso coperto)
// e i ritagli dei punti coperti vetrina/vis_<n>.png con chi lo copre. Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/visibilita.js [passo] [sagoma 0/1] [ψ°] [θ°]
// Deterministico: nuvole, nebbia e lucciole messe in posti fissi, tempo fermo, niente stormo, corvi posati rimessi a posto prima di ogni punto
// (l'eroe che passa vicino li fa volare via), come identico.js. Così due giri danno gli stessi numeri punto per punto e il confronto prima/dopo
// vale. ψ e θ (gradi, facoltativi) girano e inclinano la telecamera per tutti i punti. PAGINA=<file.html> per misurare un'altra pagina.
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');
const PASSO=+(process.argv[2]||12),SIL=process.argv[3]==='1',PSI=process.argv[4]!=null?+process.argv[4]:null,TH=process.argv[5]!=null?+process.argv[5]:null;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+path.resolve(process.env.PAGINA||path.join(__dirname,'..','zombie.html')));await p.waitForTimeout(2500);
  const out=path.join(__dirname,'vetrina');fs.mkdirSync(out,{recursive:true});
  await p.evaluate(()=>{__MZ.zombies(false);__MZ.W.dbg.freeze=true;__MZ.W.dbg.noShoot=true;__MZ.W.dbg.noFlames=true;for(const s of['.top','.bar','.hint','.nord']){const e=document.querySelector('#mz '+s);if(e)e.style.display='none'}
    const W=__MZ.W;W.flock.length=0;W.clouds.forEach((c,i)=>{c.x=120+i*170;c.y=80+i*130});W.mists.forEach((m,i)=>{m.x=40+i*70;m.y=60+(i*97)%560});W.flies.forEach((f,i)=>{f.x=30+i*37;f.y=40+(i*53)%600;f.z=20;f.ph=i});W.FX.length=0;W.puffs.length=0;W.leaves.length=0;W.t=10;
    __MZ.calma=()=>{for(const q of __MZ.perches||[]){q.away=0;q.t=1.5}W.flock.length=0}});
  const res=await p.evaluate(([PASSO,SIL,PSI,TH])=>{const M=__MZ,W=M.W,r=[],o={sil:SIL};if(PSI!=null)o.yaw=PSI;if(TH!=null)o.el=TH;for(let y=PASSO/2;y<W.h;y+=PASSO)for(let x=PASSO/2;x<W.w;x+=PASSO){if(M.hit(x,y,10))continue;M.calma();const v=M.vis(x,y,o);r.push({x,y,vis:+v.vis.toFixed(3),mask:v.mask,occ:v.occ})}return r},[PASSO,SIL,PSI,TH]);
  fs.writeFileSync(path.join(out,'vis.json'),JSON.stringify(res));
  // la mappa: il terreno cotto, i solidi, un puntino per punto
  const png=await p.evaluate(res=>{const W=__MZ.W,c=document.createElement('canvas');c.width=W.w*2;c.height=W.h*2;const g=c.getContext('2d');g.scale(2,2);if(W.ground.draw)W.ground.draw(g);else g.drawImage(W.ground,0,0,W.w,W.h);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W.w,W.h);
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.8;for(const s of __MZ.solids){if(s.w>400||s.d>400)continue;g.strokeRect(s.x,s.y,s.w,s.d)}
    for(const q of res){g.fillStyle=q.vis>=.8?'#3ad16a':q.vis>=.5?'#f2c230':'#ff3b3b';g.beginPath();g.arc(q.x,q.y,q.vis>=.8?1.6:3,0,Math.PI*2);g.fill()}return c.toDataURL('image/png')},res);
  fs.writeFileSync(path.join(out,'vis_mappa.png'),Buffer.from(png.split(',')[1],'base64'));
  // i ritagli dei punti coperti (al massimo 40, i più coperti prima, uno per gruppo di chi copre e zona)
  const bad=res.filter(q=>q.vis<.5).sort((a,b)=>a.vis-b.vis),seen=new Set(),pick=[];for(const q of bad){const k=q.occ.join('|')+'#'+Math.round(q.x/48)+','+Math.round(q.y/48);if(seen.has(k))continue;seen.add(k);pick.push(q);if(pick.length>=40)break}
  let i=0;for(const q of pick){const box=await p.evaluate(([x,y,PSI,TH])=>{const o={sil:false};if(PSI!=null)o.yaw=PSI;if(TH!=null)o.el=TH;__MZ.calma();__MZ.vis(x,y,o);__MZ.render(0);__MZ.calma();return __MZ.vis(x,y,o).box},[q.x,q.y,PSI,TH]);
    const cx=(box[0]+box[2])/4,cy=(box[1]+box[3])/4,W=150,H=170;await p.screenshot({path:path.join(out,'vis_'+(i++)+'.png'),clip:{x:Math.max(0,cx-W/2),y:Math.max(0,cy-H*.6),width:W,height:H}})}
  fs.writeFileSync(path.join(out,'vis_punti.json'),JSON.stringify(pick,null,1));
  const n=res.length,ok=res.filter(q=>q.vis>=.8).length,mid=res.filter(q=>q.vis>=.5&&q.vis<.8).length;
  console.log(`punti ${n} · visibile ${ok} · mezzo ${mid} · coperto ${n-ok-mid} · ritagli ${pick.length}`);console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
