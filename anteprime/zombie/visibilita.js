// Mappa di visibilità dell'eroe: per ogni punto dove può stare (griglia di PASSO px) lo disegna tre volte (normale, eroe sopra a tutto, senza eroe)
// e misura quanta parte di lui si vede. Scrive vetrina/vis.json, vetrina/vis_mappa.png (verde visibile, giallo mezzo coperto, rosso coperto)
// e i ritagli dei punti coperti vetrina/vis_<n>.png con chi lo copre. Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/visibilita.js [passo] [sagoma 0/1]
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');
const PASSO=+(process.argv[2]||12),SIL=process.argv[3]==='1';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+path.resolve(__dirname,'..','zombie.html'));await p.waitForTimeout(2500);
  const out=path.join(__dirname,'vetrina');fs.mkdirSync(out,{recursive:true});
  await p.evaluate(()=>{__MZ.zombies(false);__MZ.W.dbg.freeze=true;__MZ.W.dbg.noShoot=true;__MZ.W.dbg.noFlames=true;for(const s of['.top','.bar','.hint'])document.querySelector('#mz '+s).style.display='none'});
  const res=await p.evaluate(([PASSO,SIL])=>{const M=__MZ,W=M.W,r=[];for(let y=PASSO/2;y<W.h;y+=PASSO)for(let x=PASSO/2;x<W.w;x+=PASSO){if(M.hit(x,y,10))continue;const v=M.vis(x,y,{sil:SIL});r.push({x,y,vis:+v.vis.toFixed(3),mask:v.mask,occ:v.occ})}return r},[PASSO,SIL]);
  fs.writeFileSync(path.join(out,'vis.json'),JSON.stringify(res));
  // la mappa: il terreno cotto, i solidi, un puntino per punto
  const png=await p.evaluate(res=>{const W=__MZ.W,c=document.createElement('canvas');c.width=W.w*2;c.height=W.h*2;const g=c.getContext('2d');g.scale(2,2);g.drawImage(W.ground,0,0,W.w,W.h);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W.w,W.h);
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.8;for(const s of __MZ.solids){if(s.w>400||s.d>400)continue;g.strokeRect(s.x,s.y,s.w,s.d)}
    for(const q of res){g.fillStyle=q.vis>=.8?'#3ad16a':q.vis>=.5?'#f2c230':'#ff3b3b';g.beginPath();g.arc(q.x,q.y,q.vis>=.8?1.6:3,0,Math.PI*2);g.fill()}return c.toDataURL('image/png')},res);
  fs.writeFileSync(path.join(out,'vis_mappa.png'),Buffer.from(png.split(',')[1],'base64'));
  // i ritagli dei punti coperti (al massimo 40, i più coperti prima, uno per gruppo di chi copre e zona)
  const bad=res.filter(q=>q.vis<.5).sort((a,b)=>a.vis-b.vis),seen=new Set(),pick=[];for(const q of bad){const k=q.occ.join('|')+'#'+Math.round(q.x/48)+','+Math.round(q.y/48);if(seen.has(k))continue;seen.add(k);pick.push(q);if(pick.length>=40)break}
  let i=0;for(const q of pick){const box=await p.evaluate(([x,y])=>{__MZ.vis(x,y,{sil:false});__MZ.render(0);return __MZ.vis(x,y,{sil:false}).box},[q.x,q.y]);
    const cx=(box[0]+box[2])/4,cy=(box[1]+box[3])/4,W=150,H=170;await p.screenshot({path:path.join(out,'vis_'+(i++)+'.png'),clip:{x:Math.max(0,cx-W/2),y:Math.max(0,cy-H*.6),width:W,height:H}})}
  fs.writeFileSync(path.join(out,'vis_punti.json'),JSON.stringify(pick,null,1));
  const n=res.length,ok=res.filter(q=>q.vis>=.8).length,mid=res.filter(q=>q.vis>=.5&&q.vis<.8).length;
  console.log(`punti ${n} · visibile ${ok} · mezzo ${mid} · coperto ${n-ok-mid} · ritagli ${pick.length}`);console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
