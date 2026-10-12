// La vista predefinita (ψ=0, θ=45°) deve restare identica mentre si rifà la telecamera 3D (piano, §6.0). Fotografa la tela nei 16 punti di
// vetrina.js (l'eroe spostato ogni volta da un lato diverso del prop, così le cose alte si piegano in tutti i versi), a 1× e a 2×, con gli
// effetti bassi (niente nebbia, nuvole, lucciole, respiro: tutto fermo), zombie spenti, tempo fermo (W.t=10) e corvi posati rimessi a posto;
// più tre foto di uno zombie che esce dalla fossa aperta (rise .1, .6, .9: la terra smossa, i sassi, la discesa), con gli zombie accesi.
// La pagina (anche quella da cui si fa il riferimento) deve esportare __MZ.perches: senza, i corvi posati non si rimettono a posto e danno
// differenze false (un corvo che vola via o gira la testa); il test allora si ferma con un messaggio.
// Uso: python3 anteprime/zombie/mk.py, poi
//   node anteprime/zombie/identico.js rif [pagina] [cartella]   → salva le foto di riferimento in <cartella>/rif_<dpr>_<n>.png
//   node anteprime/zombie/identico.js [pagina] [cartella]       → confronta con il riferimento: pixel con |Δ|>30 (somma dei tre canali) e il
//                                                                 gruppo di differenze più grande (in px CSS); <cartella>/diff_<dpr>_<n>.png
// Con PIENI=1 nell'ambiente: effetti pieni (luci, buio, nuvole, nebbia, lucciole messe ferme in posti fissi) e riferimento a parte (pieni_*).
// Con CORVI=0: senza i corvi posati (nascosti), riferimento a parte (nc_*): serve a separare un cambiamento voluto dei corvi da tutto il resto.
// Soglie (§6.0): al massimo lo 0,2% dei pixel con |Δ|>30 e nessun gruppo più largo o alto di 20 px CSS. Predefiniti: pagina
// anteprime/zombie.html, cartella anteprime/zombie/vetrina/identico (non su git).
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');
const args=process.argv.slice(2),RIF=args[0]==='rif',PIENI=process.env.PIENI==='1',NOCROW=process.env.CORVI==='0';if(RIF)args.shift();
const PRE=(NOCROW?'nc_':'')+(PIENI?'pieni_':'rif_'),PRED=(NOCROW?'nc_':'')+(PIENI?'diffpieni_':'diff_');
const PAGE=path.resolve(args[0]||path.join(__dirname,'..','zombie.html')),OUT=path.resolve(args[1]||path.join(__dirname,'vetrina','identico'));
fs.mkdirSync(OUT,{recursive:true});
const T=64,PROPS={cripta:[1.1,1.7,1.5],albero_morto:[3,2.25,1.5],lapidi:[1.9,3.3,1.8],fossa:[2,4.95,1.8],muro_cancello:[3.7,5.5,1.5],casa:[7.35,2.3,1.0],finestre_porta:[7.3,3.5,1.6],portico:[7.35,3.9,1.7],lampione:[4.2,4.3,1.6],pozzo:[8.4,6.2,1.6],carriola:[6.3,5.75,1.8],casse_botte:[9.2,4.9,1.8],zucche_recinto:[7.3,4.15,1.8],albero_vivo:[8.9,8.6,1.3],sasso_cespuglio_fieno:[6.15,7.45,1.6],cartello:[5.12,5.38,1.9]};
const OFF=[[-1.6,0],[1.6,0],[0,-1.7],[0,1.7]];
const PTS=Object.entries(PROPS).map(([n,[cx,cy,z]],i)=>({n,hx:(cx+OFF[i%4][0])*T,hy:(cy+OFF[i%4][1])*T,z}));
for(const k of[.1,.6,.9])PTS.push({n:'buca_'+Math.round(k*100),rise:k,z:1.6});// lo zombie che esce dalla fossa aperta (holes[0]), l'eroe a (70, 40) da lì
(async()=>{const b=await chromium.launch();const errs=[];const res=[];
  for(const dpr of[1,2]){const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:dpr});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
    await p.goto('file://'+PAGE);await p.waitForTimeout(2500);
    const ok=await p.evaluate(PIENI=>{const M=__MZ,W=M.W;if(!M.perches)return false;M.zombies(false);M.low(!PIENI);W.dbg.freeze=true;W.dbg.noShoot=true;W.dbg.noSticks=true;
      for(const s of['.top','.bar','.hint','.nord']){const e=document.querySelector('#mz '+s);if(e)e.style.display='none'}return true},PIENI);
    if(!ok){console.log('ERRORE: la pagina non esporta __MZ.perches (aggiungere perches a window.__MZ nel motore): i corvi posati non si possono rimettere a posto e il confronto non vale');await b.close();process.exit(1)}
    for(let i=0;i<PTS.length;i++){const P=PTS[i];
      const url=await p.evaluate(({hx,hy,z,rise,NOCROW})=>{const M=__MZ,W=M.W,h=W.hero,C=M.CAM;M.cam(null);M.zoom(z);
        let hole=null;if(rise!=null){hole=M.holes[0];hx=hole[0]+70;hy=hole[1]+40}
        h.x=hx;h.y=hy;h.face=-Math.PI/2;h.aim=0;h.moving=false;h.walk=0;h.tgZ=null;M.sim(90,1/30);h.face=-Math.PI/2;h.aim=0;
        // lo zombie che esce, più quattro fermi lontano fuori dallo schermo: con 5 zombie non ne nasce un altro a caso
        M.zombies(rise!=null);W.Z.length=0;if(rise!=null){W.Z.push({kind:'zombie',sc:1.1,spd:30,hp:3,x:hole[0],y:hole[1],face:Math.PI/2,p:0,anim:'walk',rise,die:0,flash:0});
          for(let i=0;i<4;i++)W.Z.push({kind:'zombie',sc:1.1,spd:30,hp:3,x:-2000-i*100,y:-2000,face:0,p:0,anim:'walk',rise:.5,die:0,flash:0})}
        for(const q of M.perches){q.away=NOCROW?1:0;q.t=1.5}W.flock.length=0;W.clouds.forEach((c,i)=>{c.x=120+i*170;c.y=80+i*130});W.mists.forEach((m,i)=>{m.x=40+i*70;m.y=60+(i*97)%560});W.flies.forEach((f,i)=>{f.x=30+i*37;f.y=40+(i*53)%600;f.z=20;f.ph=i});W.FX.length=0;W.puffs.length=0;W.leaves.length=0;W.t=10;
        C.z=z;C.x=hx;if(M.view){M.view(0,45);C.y=hy;C.oy=24}else C.y=hy-24;// telecamera di riposo: il perno sull'eroe (oggi il centro 24 px sopra)
        M.render(0);M.render(0);const u=(document.querySelector('#mzCv')||document.querySelector('#mz canvas')).toDataURL('image/png');M.zombies(false);W.Z.length=0;return u},Object.assign({NOCROW},P));
      const f=path.join(OUT,PRE+dpr+'_'+String(i).padStart(2,'0')+'_'+P.n+'.png');
      if(RIF){fs.writeFileSync(f,Buffer.from(url.split(',')[1],'base64'));continue}
      if(!fs.existsSync(f)){res.push({dpr,i,n:P.n,err:'manca il riferimento'});continue}
      const ref='data:image/png;base64,'+fs.readFileSync(f).toString('base64');
      const r=await p.evaluate(async([a,c,dpr])=>{const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s});const[i1,i2]=await Promise.all([ld(a),ld(c)]);
        const w=i1.width,h=i1.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
        g.drawImage(i1,0,0);const d1=g.getImageData(0,0,w,h).data;g.clearRect(0,0,w,h);g.drawImage(i2,0,0);const im=g.getImageData(0,0,w,h),d2=im.data;
        const M=new Uint8Array(w*h);let n=0,any=0;for(let k=0,j=0;k<d1.length;k+=4,j++){const d=Math.abs(d1[k]-d2[k])+Math.abs(d1[k+1]-d2[k+1])+Math.abs(d1[k+2]-d2[k+2]);if(d>0)any++;if(d>30){M[j]=1;n++}}
        // gruppi (8 vicini): il più grande per numero di pixel e per lato del riquadro, in px CSS
        let big=0,side=0,cnt=0;const st=new Int32Array(w*h);for(let j=0;j<w*h;j++){if(M[j]!==1)continue;cnt++;let sp=0,c=0,x0=1e9,y0=1e9,x1=-1,y1=-1;st[sp++]=j;M[j]=2;
          while(sp){const q=st[--sp],x=q%w,y=(q-x)/w;c++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
            for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const o=Y*w+X;if(M[o]===1){M[o]=2;st[sp++]=o}}}
          if(c>big)big=c;const sd=Math.max(x1-x0+1,y1-y0+1)/dpr;if(sd>side)side=sd}
        let png=null;if(n){for(let j=0;j<w*h;j++)if(M[j]){d2[j*4]=255;d2[j*4+1]=0;d2[j*4+2]=0;d2[j*4+3]=255}g.putImageData(im,0,0);png=cv.toDataURL('image/png')}
        return{tot:w*h,any,d30:n,pct:100*n/(w*h),groups:cnt,big,side,png}},[ref,url,dpr]);
      if(r.png)fs.writeFileSync(path.join(OUT,PRED+dpr+'_'+String(i).padStart(2,'0')+'_'+P.n+'.png'),Buffer.from(r.png.split(',')[1],'base64'));delete r.png;
      res.push(Object.assign({dpr,i,n:P.n},r))}
    await p.close()}
  await b.close();
  if(RIF){console.log('riferimento salvato in',OUT,'('+PTS.length*2+' foto)');console.log('ERR',JSON.stringify(errs.slice(0,5)));return}
  let worst=0,side=0,ok=true;for(const r of res){if(r.err){console.log(r.dpr+'× '+r.n+': '+r.err);ok=false;continue}worst=Math.max(worst,r.pct);side=Math.max(side,r.side);
    const pass=r.pct<=.2&&r.side<=20;if(!pass)ok=false;console.log(`${r.dpr}× ${String(r.i).padStart(2)} ${r.n.padEnd(22)} diversi ${String(r.any).padStart(6)} · |Δ|>30 ${String(r.d30).padStart(5)} (${r.pct.toFixed(3)}%) · gruppi ${r.groups} · il più grande ${r.big} px, lato ${r.side.toFixed(1)} px CSS${pass?'':'  ← OLTRE LA SOGLIA'}`)}
  console.log(`peggiore ${worst.toFixed(3)}% · gruppo più largo ${side.toFixed(1)} px CSS → ${ok?'IDENTICO entro le soglie':'NON identico'}`);console.log('ERR',JSON.stringify(errs.slice(0,5)))})();
