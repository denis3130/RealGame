// Sfarfallio dell'ordine di disegno girando (piano §6.2) e tavole da guardare (§6.3).
// 1) Con l'eroe fermo in 5 punti la telecamera fa un giro intero a passi di 3° (120 passi, θ=45°): a ogni passo si rifà la verità a z-buffer
//    (verita.js) e si contano gli scambi visibili, cioè le coppie che si coprono sullo schermo (almeno 3 px) e cambiano ordine da un passo
//    all'altro; a parte quelli con la verità uguale al passo prima (chi è davanti non è cambiato, ma l'ordine sì). Soglia: ≤ 65 per giro.
//    Poi lo stesso con l'eroe che cammina in tondo mentre la telecamera gira.
// 2) Le tavole vetrina/giro_<caso>.png: per ogni caso del §6.3 dodici inquadrature, ψ = 0…315 a passi di 45° con θ=45°, poi ψ = 0 e 180 a θ = 35°
//    e 62° (la vista intera, caso 18, solo a ψ = 45 e 180).
// Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/giro.js [pagina] [cartella] [solo: sfarfallio|tavole]
// (predefiniti: anteprime/zombie.html, anteprime/zombie/vetrina; le tavole non vanno su git)
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');const LIB=require('./verita.js');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html')),OUT=path.resolve(process.argv[3]||path.join(__dirname,'vetrina')),SOLO=process.argv[4]||'';fs.mkdirSync(OUT,{recursive:true});
const T=64;
// i 5 punti dello sfarfallio (dalle posizioni di ordine.js): [nome, x, y, zombie]
const PTS=[['cimitero',256,150,[[218,150]]],['cancello',262,352,[[220,345],[222,362]]],['lampione',300,295,[[287,282,'lanterna',1.55],[287,266]]],['portico',470,236,[[452,236]]],['pozzo',538,432]];
// i casi delle tavole: nome, eroe [x,y], soggetto [x,y,z] (il centro del ritaglio), zoom, zombie, opzioni
const CASI=[['01_muri_cancello',[3.7*T,5.5*T],[3.7*T,5.5*T,25],1.7],['02_pilastri',[4.3*T,5*T],[3.7*T,4.95*T,40],2],['03_lapidi',[1.5*T,4*T],[1.45*T,3.3*T,18],1.8],
  ['04_albero_morto',[3*T,2.62*T],[3*T,2.25*T,50],1.4],['04b_albero_vivo',[8.9*T,8.78*T],[8.9*T,8.6*T,60],1.3],['05_lampione',[300,295],[4.2*T+9,4.3*T,55],1.6,[[287,282,'lanterna',1.55]]],
  ['06_zucche',[7.35*T,4.62*T],[7.35*T,4.1*T,10],1.9],['07_casse_botte',[9.1*T,5.7*T],[9.2*T,4.95*T,12],1.9],['07b_sasso_cespuglio_fieno',[6.1*T,7.7*T],[6.2*T,7.4*T,10],1.6],
  ['08_pozzo',[8.4*T,6.95*T],[8.4*T,6.2*T,45],1.7],['09_carriola',[6.3*T,6.35*T],[6.25*T,5.75*T,15],2],['10_fossa',[1.6*T+70,4.95*T+40],[1.6*T+10,4.95*T,10],1.8,'buca'],
  ['11_cartello',[5.45*T,5.95*T],[5.12*T,5.38*T,35],1.9],['12_recinto',[9.4*T,3.8*T],[9.6*T,4.15*T,15],1.7],['13_cripta',[68,157],[1.07*T,2.35*T,22],1.5],
  ['14_casa_fuori',[7.3*T,.6*T],[7.35*T,2.25*T,70],.62],['15_casa_dentro',[7*T,2*T],[7.35*T,2.25*T,30],.75],['15b_casa_muro_est',[568,200],[8.6*T,2.6*T,30],1],
  ['16_portico',[470,236],[7.35*T,3.75*T,40],1.7,[[452,236]]],['17_terreno',[7.6*T,7.9*T],[7.6*T,7.6*T,0],1.3],['18_vista_intera',[4.4*T,8.4*T],null,0,null,'intera']];
const VIEWS=[[0,45],[45,45],[90,45],[135,45],[180,45],[225,45],[270,45],[315,45],[0,35],[180,35],[0,62],[180,62]];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:SOLO==='sfarfallio'?1:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForTimeout(2500);await p.addScriptTag({content:LIB});
  await p.evaluate(()=>{const M=__MZ,W=M.W;M.zombies(false);W.dbg.freeze=true;W.dbg.noShoot=true;W.dbg.halt=true;M.hud(false);
    window.__place=(x,y,zs,rise)=>{const h=W.hero;M.cam(null);h.x=x;h.y=y;h.zh=M.heightAt(x,y);h.moving=false;h.tgZ=null;W.Z.length=0;M.sim(30,1/30);h.face=-Math.PI/2;h.aim=0;
      (zs||[]).forEach((z,i)=>W.Z.push({id:5000+i,kind:z[2]||'zombie',sc:z[3]||1.1,spd:0,hp:99,x:z[0],y:z[1],zh:M.heightAt(z[0],z[1]),face:Math.atan2(y-z[1],x-z[0]),p:0,anim:'walk',rise:rise==null?1:rise,die:0,flash:0}));
      for(const q of M.perches){q.away=0;q.t=1.5}W.flock.length=0;W.clouds.forEach((c,i)=>{c.x=120+i*170;c.y=80+i*130});W.mists.forEach((m,i)=>{m.x=40+i*70;m.y=60+(i*97)%560});W.flies.forEach((f,i)=>{f.x=30+i*37;f.y=40+(i*53)%600;f.z=20;f.ph=i});W.FX.length=0;W.puffs.length=0;W.leaves.length=0;W.t=10};
    window.__cam=(psi,th,z)=>{const C=M.CAM,h=W.hero;M.view(psi,th);C.x=h.x;C.y=h.y;C.oy=24*C.CP;if(z)C.z=z;M.render(0);M.render(0)};
    // la verità di questo fotogramma: per ogni coppia che si copre (≥3 px) [id, id, px davanti il primo, px davanti il secondo, -1 se il primo è disegnato prima]
    window.__truth=()=>__TR.evaluate({truth:true,top:0}).truth});
  if(SOLO!=='tavole'){
    console.log('sfarfallio: 120 passi da 3° a θ=45° (scambi visibili · di cui con la verità uguale · pixel nell\'ordine sbagliato in media a passo)');let tot=0,totS=0;
    const run=async(nm,walk)=>{const r=await p.evaluate(([nm,walk])=>{const M=__MZ,W=M.W,P=__giroPts[nm];__place(P[0],P[1],P[2]);M.orderReset();let prev=null,flips=0,same=0,wrong=0;const ex=[];
        for(let k=0;k<=120;k++){if(walk){const a=k/120*Math.PI*4;W.hero.x=P[0]+Math.cos(a)*30;W.hero.y=P[1]+Math.sin(a)*30;W.hero.zh=M.heightAt(W.hero.x,W.hero.y)}
          __cam(k*3,45);const tr=__truth(),cur=new Map();for(const[a,b,na,nb,o] of tr){const t=Math.abs(na-nb)<3?0:na>nb?1:-1;cur.set(a+'|'+b,{o,t,amb:Math.min(na,nb)>=3});const w=o<0?na:nb;if(w>=3)wrong+=w}// sbagliati: il primo disegnato è davanti
          if(prev)for(const[key,v] of cur){const q=prev.get(key);if(!q||q.o===v.o)continue;flips++;if(q.t===v.t&&v.t!==0&&!v.amb&&!q.amb){same++;if(ex.length<6)ex.push(k*3+'°:'+key)}}prev=cur}
        return{flips,same,wrong:Math.round(wrong/121),ex}},[nm,walk]);return r};
    await p.evaluate(PTS=>{window.__giroPts=Object.fromEntries(PTS.map(([n,x,y,z])=>[n,[x,y,z||[]]]))},PTS);
    for(const[nm] of PTS){const r=await run(nm,false);tot+=r.flips;totS+=r.same;console.log(`  ${nm.padEnd(10)} ${String(r.flips).padStart(4)} · ${String(r.same).padStart(4)} · ${r.wrong} px${r.flips>65?'  ← OLTRE LA SOGLIA':''}  ${r.ex.join(' ')}`)}
    console.log(`  in media ${(tot/PTS.length).toFixed(1)} scambi per giro (soglia 65), ${(totS/PTS.length).toFixed(1)} con la verità uguale`);
    for(const nm of['lampione','portico']){const r=await run(nm,true);console.log(`  ${(nm+', camminando in tondo').padEnd(30)} ${r.flips} scambi · ${r.same} con la verità uguale · ${r.wrong} px`)}}
  if(SOLO!=='sfarfallio'){await p.evaluate(()=>{__MZ.low(false)});
    for(const[name,hero,subj,zoom,zs,opt] of CASI){
      const url=await p.evaluate(([name,hero,subj,zoom,zs,opt,VIEWS])=>{const M=__MZ,W=M.W,dpr=devicePixelRatio,cv=document.querySelector('#mzCv'),TW=180,TH=200,cols=4,views=opt==='intera'?[[45,45],[180,45]]:VIEWS;
        __place(hero[0],hero[1],Array.isArray(zs)?zs:null);if(opt==='buca'){const hl=M.holes[0];W.Z.length=0;W.Z.push({id:6000,kind:'zombie',sc:1.1,spd:0,hp:3,x:hl[0],y:hl[1],face:Math.PI/2,p:0,anim:'walk',rise:.6,die:0,flash:0});for(let i=0;i<4;i++)W.Z.push({id:6001+i,kind:'zombie',sc:1.1,spd:0,hp:3,x:-2000-i*100,y:-2000,face:0,p:0,anim:'walk',rise:.5,die:0,flash:0});M.zombies(true)}
        const big=opt==='intera',tw=big?360:TW,th=big?420:TH,rows=Math.ceil(views.length/cols),out=document.createElement('canvas');out.width=(big?2:cols)*tw*dpr;out.height=(big?1:rows)*(th+16)*dpr;const g=out.getContext('2d');g.fillStyle='#111';g.fillRect(0,0,out.width,out.height);
        if(big)M.setWhole(true);M.zoom(zoom||null);
        views.forEach(([psi,thv],i)=>{M.orderReset();if(big){M.view(psi,thv);M.render(1);M.render(0);M.render(0)}else __cam(psi,thv,zoom||0);const c=big?[innerWidth/2,innerHeight/2-40]:M.toScreen(subj[0],subj[1],subj[2]),cx=(i%(big?2:cols))*tw,cy=Math.floor(i/(big?2:cols))*(th+16);
          const sx=(c[0]-tw/2)*dpr,sy=(c[1]-th*.55)*dpr;g.drawImage(cv,sx,sy,tw*dpr,th*dpr,cx*dpr,(cy+16)*dpr,tw*dpr,th*dpr);g.fillStyle='#efe6d0';g.font=`700 ${11*dpr}px system-ui`;g.fillText(`ψ ${psi}°  θ ${thv}°`,(cx+5)*dpr,(cy+12)*dpr)});
        if(big)M.setWhole(false);M.zoom(null);M.zombies(false);W.Z.length=0;M.view(0,45);return out.toDataURL('image/png')},[name,hero,subj,zoom,zs,opt,VIEWS]);
      fs.writeFileSync(path.join(OUT,'giro_'+name+'.png'),Buffer.from(url.split(',')[1],'base64'));console.log('tavola',name)}}
  await p.evaluate(()=>{__MZ.W.dbg.halt=false});console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
