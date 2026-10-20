// FASE 9, mappa zombie più fluida: le copie degli strati fermi (lcDraw in motore.js) non devono cambiare l'aspetto. Per ogni punto lo
// stesso fotogramma due volte, con le copie e tutto dal vivo (W.dbg.lcLive: la telecamera resta sui pixel interi, cambia solo il modo di
// disegnare), mondo fermo; dopo che l'eroe si è fermato da poco (copie di età diverse, la piega mossa fino a un terzo di pixel) e mentre
// cambiano le cose: il cancello che si apre, le assi di una barriera rotta e riparata, la casa con l'eroe dentro, il piano di sopra della
// Locanda, gli effetti bassi. Conta i pixel diversi di più di 30 (somma dei tre canali, come identico.js) e il gruppo di differenze più
// grande; poi i tempi con e senza copie (fermo, a destra, in giù, 10 zombie) e la memoria delle tele.
// Soglie: a telecamera ferma al massimo lo 0,02% dei pixel con Δ>30 e nessun gruppo più spesso di 4 px della tela (gli arrotondamenti dei
// bordi); mentre la telecamera si muove ancora (dopo una corsa) ogni copia disegnata entro LCB.tol dal disegno vero (mezzo pixel della tela:
// righe sottili lungo i bordi) e al massimo lo 0,6% dei pixel.
// Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/copie_prova.js [pagina]
const {chromium}=require('../../node_modules/playwright');const path=require('path'),fs=require('fs');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html')),OUT=path.join(__dirname,'vetrina','copie');fs.mkdirSync(OUT,{recursive:true});
const T=64,PUNTI={partenza:[6.4,20.4],aia:[7.5,7.4],casa:[2.3,6.0],borgo:[22.0,18.5],locanda:[18.0,15.6],cappella:[26.5,22.0],segheria:[22.6,6.4],fiume:[20.5,2.8]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(800);
  await p.evaluate(()=>{const M=__MZ,W=M.W;W.split=null;W.dbg.noSpawn=true;W.dbg.god=true;W.dbg.noShoot=true;W.dbg.halt=true;
    // the comparison: the same frame with the copies and live; pixels with Δ>30 and the biggest group of them (flood fill, 8 neighbours)
    window.__cmp=(name)=>{const cv=document.querySelector('#mzCv'),g=cv.getContext('2d'),w=cv.width,h=cv.height;W.dbg.freeze=true;W.dbg.lcLive=false;M.render(0);M.render(0);const A=g.getImageData(0,0,w,h).data;
      W.dbg.lcLive=true;M.render(0);const B=g.getImageData(0,0,w,h).data;W.dbg.lcLive=false;M.render(0);W.dbg.freeze=false;
      const bad=new Uint8Array(w*h);let n=0,mx=0;for(let i=0,j=0;i<A.length;i+=4,j++){const d=Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]);if(d>mx)mx=d;if(d>30){bad[j]=1;n++}}
      let big=0;const st=[];for(let j=0;j<bad.length;j++){if(bad[j]!==1)continue;let x0=w,x1=0,y0=h,y1=0;bad[j]=2;st.push(j);while(st.length){const q=st.pop(),x=q%w,y=(q-x)/w;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const k=Y*w+X;if(bad[k]===1){bad[k]=2;st.push(k)}}}big=Math.max(big,Math.min(x1-x0+1,y1-y0+1))}
      if(n>w*h*.002||big>3){const c=document.createElement('canvas');c.width=w;c.height=h;const cg=c.getContext('2d'),im=cg.createImageData(w,h);for(let i=0,j=0;i<A.length;i+=4,j++){const v=bad[j]?255:A[i]*.3;im.data[i]=v;im.data[i+1]=bad[j]?40:A[i+1]*.3;im.data[i+2]=bad[j]?40:A[i+2]*.3;im.data[i+3]=255}cg.putImageData(im,0,0);window.__img=c.toDataURL()}else window.__img=null;
      return{pct:+(100*n/(w*h)).toFixed(3),gruppo:big,max:mx}}});
  const R=[];const ok=(name,c,x)=>R.push((c?'OK   ':'NO   ')+name+(x!=null?'  '+x:''));
  // moving: the camera still gliding after a run, the copies may be up to LCB.tol (a third of a pixel of the canvas) away from the true
  // drawing, so the pixels differ in thin lines along the edges: there the check is on the copies themselves (every copy drawn in the last
  // frame within LCB.tol) and on the share of pixels; still: the frame must be the same, apart from the rounding of the edges
  const check=async(name,setup,moving)=>{const r=await p.evaluate(([setup,name])=>{const M=__MZ,W=M.W;try{(0,eval)('('+setup+')')(M,W)}catch(e){return{err:String(e)}}
      const L=M.lc(),k=L.T[0],far=M.lcLayers().filter(o=>o.f===L.f&&o.A===1).reduce((m,o)=>Math.max(m,o.dc*k),0);return Object.assign(__cmp(name),{far:+far.toFixed(3),tol:L.tol})},[setup.toString(),name]);
    if(r.err){ok(name,false,r.err);return}const good=moving?r.pct<=.6&&r.far<=r.tol+1e-6:r.pct<=.02&&r.gruppo<=4;
    ok(name,good,`${r.pct}% dei pixel con Δ>30, gruppo più spesso ${r.gruppo} px, Δ massimo ${r.max}`+(moving?`, copia più lontana ${r.far} px (al massimo ${r.tol})`:''));
    if(!good){const img=await p.evaluate(()=>window.__img);if(img)fs.writeFileSync(path.join(OUT,name.replace(/[^a-z0-9]+/gi,'_')+'.png'),Buffer.from(img.split(',')[1],'base64'))}};
  // 1. every place, still (the camera settled) and just after a walk to the right that stops (copies of different ages)
  for(const[n,[x,y]] of Object.entries(PUNTI).filter(([n])=>!process.env.SOLO||process.env.SOLO.split(',').includes(n))){
    await check(n+': fermo',`(M,W)=>{M.tp(${x*T},${(y+2)*T});const h=W.hero;h.lv=0;h.zh=0;h.st=null;for(let i=0;i<150;i++)M.render(1/60);for(let i=0;i<20;i++)M.render(0)}`);
    await check(n+': dopo una corsa a destra',`(M,W)=>{for(let i=0;i<50;i++){M.walk(1,0,1,1/60);M.render(1/60)}for(let i=0;i<6;i++)M.render(1/60)}`,true);
    await check(n+': dopo una corsa in diagonale',`(M,W)=>{for(let i=0;i<40;i++){M.walk(-.7,.7,1,1/60);M.render(1/60)}for(let i=0;i<4;i++)M.render(1/60)}`,true);
    await check(n+': fermo dopo la corsa',`(M,W)=>{for(let i=0;i<120;i++)M.render(1/60);for(let i=0;i<20;i++)M.render(0)}`)}
  // 2. the things that change: the gate that opens (its leaves and the board falling), in the middle of the animation and at the end
  await check('cancello che si apre (a metà)',`(M,W)=>{const g=W.gate;M.tp(g.x,g.y+90);for(let i=0;i<150;i++)M.render(1/60);M.coins(99999);M.buyNow('cancello');for(let i=0;i<40;i++)M.render(1/60)}`);
  await check('cancello aperto',`(M,W)=>{for(let i=0;i<200;i++)M.render(1/60)}`);
  // the house with the hero inside (walls and roof transparent), then just out of it
  await check('casa con l\'eroe dentro',`(M,W)=>{M.tp(7.3*64,3.3*64);for(let i=0;i<200;i++)M.render(1/60)}`);
  await check('casa mentre l\'eroe esce',`(M,W)=>{for(let i=0;i<12;i++){M.walk(0,1,1,1/60);M.render(1/60)}}`);
  // a barrier: boards broken by the zombies and put back
  const hasBar=await p.evaluate(()=>!!(__MZ.ZM&&__MZ.ZM.BARS&&__MZ.ZM.BARS.length));
  if(hasBar){await check('barriera con le assi rotte',`(M,W)=>{const B=M.ZM.BARS[0];M.tp(B.x+B.nx*70,B.y+B.ny*70);for(let i=0;i<150;i++)M.render(1/60);for(let i=0;i<3;i++)B.hit({x:B.x+B.nx*30,y:B.y+B.ny*30});for(let i=0;i<30;i++)M.render(1/60)}`);
    await check('barriera riparata',`(M,W)=>{const B=M.ZM.BARS[0];if(B.reset)B.reset();for(let i=0;i<30;i++)M.render(1/60)}`)}
  // upstairs at the Locanda, and the low effects
  await check('Locanda, piano di sopra',`(M,W)=>{const S0=M.ZM.STAIRS&&M.ZM.STAIRS[0];if(!S0)return;const h=W.hero;M.tp(19*64,16.5*64);h.lv=1;h.lvH=S0.H;h.st=S0;h.zh=S0.H;for(let i=0;i<200;i++)M.render(1/60)}`);
  await check('effetti bassi',`(M,W)=>{const h=W.hero;h.lv=0;h.zh=0;h.st=null;M.low(true);M.tp(6.4*64,22.4*64);for(let i=0;i<150;i++)M.render(1/60)}`);
  await p.evaluate(()=>{__MZ.low(false)});
  // 3. times (median of 40 frames, the drawing waited for) and memory of the canvases
  const tempi=await p.evaluate(()=>{const M=__MZ,W=M.W,T=64,h=W.hero,cv=document.querySelector('#mzCv'),g=cv.getContext('2d'),out={};h.lv=0;h.zh=0;h.st=null;
    for(const[n,[x,y]] of [['partenza',[6.4,20.4]],['casa',[2.3,6.0]],['locanda',[18.0,15.6]],['segheria',[22.6,6.4]]]){out[n]={};
      for(const[nz,dn,ix,iy] of [[0,'fermo',0,0],[0,'destra',1,0],[0,'giu',0,1],[10,'10 zombie, destra',1,0]])for(const lc of[0,1]){W.dbg.noLC=!lc;W.Z.length=0;M.tp(x*T,(y+2)*T);
        for(let i=0;i<nz;i++){const a=i/nz*6.283,r=110+(i%3)*40;const k=M.addZombie('zombie',h.x+Math.cos(a)*r,h.y+Math.sin(a)*r);W.Z[k].hp=1e9}
        for(let i=0;i<120;i++)M.render(1/60);const ts=[];for(let i=0;i<40;i++){if(ix||iy)M.walk(ix,iy,1,1/60);const t0=performance.now();M.render(1/60);g.getImageData(0,0,1,1);ts.push(performance.now()-t0)}
        ts.sort((a,b)=>a-b);(out[n][dn]=out[n][dn]||[]).push(+ts[20].toFixed(1))}}
    W.dbg.noLC=false;W.Z.length=0;return{out,mem:Math.round(M.lc().mem/1e6)}});
  console.log(R.join('\n'));console.log('tempi (senza copie → con copie, ms a fotogramma, mediana):');for(const[n,o] of Object.entries(tempi.out))console.log('  '+n.padEnd(10)+Object.entries(o).map(([k,v])=>`${k} ${v[0]} → ${v[1]}`).join(' · '));
  console.log('memoria delle tele:',tempi.mem,'MB');console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,10).join('\n'):'nessun errore');await b.close()})();
