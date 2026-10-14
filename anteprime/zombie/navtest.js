// Gli zombie arrivano all'eroe da ogni punto? Per alcune posizioni dell'eroe (fermo, che non spara) mette uno zombie in ogni punto libero di una
// griglia di PASSO px e da ogni buca, simula fino a 45 s (passi di 1/30 s, senza disegnare) e conta chi arriva a meno di 32 px. Poi una prova di
// folla: 8 zombie insieme. Scrive vetrina/nav.json e vetrina/nav_mappa.png (verde arriva, rosso no, i numeri sono i secondi).
// Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/navtest.js [passo]
const {chromium}=require('../../node_modules/playwright');const fs=require('fs'),path=require('path');
const PASSO=+(process.argv[2]||48);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+path.resolve(__dirname,'..','zombie.html'));await p.waitForTimeout(2500);
  const out=path.join(__dirname,'vetrina');fs.mkdirSync(out,{recursive:true});
  const T=64,HEROES={portico:[7.35*T,3.75*T],dentro_casa:[7.05*T,2.95*T],cimitero_nord:[2*T,1.9*T],dietro_cripta:[1.2*T,.62*T],pozzo:[8.4*T,6.95*T],angolo_sud_ovest:[.5*T,9.5*T],fossa:[1.6*T,4.3*T]};
  const res=await p.evaluate(([HEROES,PASSO])=>{const M=__MZ,W=M.W;M.zombies(false);W.dbg.freeze=true;W.dbg.noShoot=true;const out={};
    for(let[name,[hx,hy]] of Object.entries(HEROES)){for(let r=0;r<40&&M.hit(hx,hy,10);r+=2){let f=false;for(let a=0;a<6.28&&!f;a+=.4){if(!M.hit(hx+Math.cos(a)*r,hy+Math.sin(a)*r,10)){hx+=Math.cos(a)*r;hy+=Math.sin(a)*r;f=true}}if(f)break}// l'eroe mai dentro un solido
      W.hero.x=hx;W.hero.y=hy;W.hero.moving=false;M.navRebuild();const starts=[];
      for(let y=PASSO/2;y<W.h;y+=PASSO)for(let x=PASSO/2;x<W.w;x+=PASSO){if(M.hit(x,y,11)||Math.hypot(x-hx,y-hy)<60)continue;starts.push([x,y,'g'])}
      for(const[x,y] of M.holes)starts.push([x,y,'buca']);
      const rows=[];for(const[x,y,k] of starts)for(const kind of['zombie','hound']){W.Z.length=0;M.addZombie(kind,x,y);let t=0,got=-1;const z=W.Z[0];
        for(let i=0;i<1350;i++){M.sim(1,1/30);t+=1/30;if(Math.hypot(z.x-hx,z.y-hy)<32){got=t;break}}rows.push({x,y,k,kind,t:got<0?null:+got.toFixed(1),end:[Math.round(z.x),Math.round(z.y)]})}
      // la folla: 8 zombie da 8 punti lontani
      W.Z.length=0;const far=starts.filter(s=>Math.hypot(s[0]-hx,s[1]-hy)>200).sort((a,b)=>((a[0]*7+a[1]*13)%97)-((b[0]*7+b[1]*13)%97)).slice(0,8);for(const s of far)M.addZombie('zombie',s[0],s[1]);
      let t=0;for(let i=0;i<1800;i++){M.sim(1,1/30);t+=1/30;if(W.Z.every(z=>Math.hypot(z.x-hx,z.y-hy)<60))break}
      out[name]={hero:[hx,hy],rows,crowd:{t:+t.toFixed(1),arrived:W.Z.filter(z=>Math.hypot(z.x-hx,z.y-hy)<60).length,of:W.Z.length}}}
    W.Z.length=0;return out},[HEROES,PASSO]);
  fs.writeFileSync(path.join(out,'nav.json'),JSON.stringify(res));
  const png=await p.evaluate(res=>{const W=__MZ.W,names=Object.keys(res),cols=4,rows=Math.ceil(names.length/cols),S=.75,c=document.createElement('canvas');c.width=cols*W.w*S;c.height=rows*(W.h*S+18);const g=c.getContext('2d');g.fillStyle='#111';g.fillRect(0,0,c.width,c.height);
    names.forEach((n,k)=>{const ox=(k%cols)*W.w*S,oy=Math.floor(k/cols)*(W.h*S+18);g.save();g.translate(ox,oy+18);g.scale(S,S);(W.ground.draw?W.ground.draw(g):g.drawImage(W.ground,0,0,W.w,W.h));g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,W.w,W.h);
      g.strokeStyle='rgba(255,255,255,.55)';for(const s of __MZ.solids){if(s.w>400||s.d>400)continue;g.strokeRect(s.x,s.y,s.w,s.d)}
      const R=res[n];g.fillStyle='#4fd0ff';g.beginPath();g.arc(R.hero[0],R.hero[1],9,0,7);g.fill();g.font='bold 11px sans-serif';
      for(const r of R.rows){if(r.kind!=='zombie')continue;g.fillStyle=r.t==null?'#ff3b3b':'#3ad16a';g.beginPath();g.arc(r.x,r.y,5,0,7);g.fill();if(r.t==null){g.strokeStyle='#ff3b3b';g.beginPath();g.moveTo(r.x,r.y);g.lineTo(r.end[0],r.end[1]);g.stroke()}else{g.fillStyle='#fff';g.fillText(r.t,r.x+6,r.y+4)}}
      g.restore();g.fillStyle='#fff';g.font='bold 13px sans-serif';const f=R.rows.filter(r=>r.t==null).length;g.fillText(`${n}: ${R.rows.length-f}/${R.rows.length} arrivano · folla ${R.crowd.arrived}/${R.crowd.of} in ${R.crowd.t}s`,ox+6,oy+13)});return c.toDataURL('image/png')},res);
  fs.writeFileSync(path.join(out,'nav_mappa.png'),Buffer.from(png.split(',')[1],'base64'));
  for(const[n,R] of Object.entries(res)){const f=R.rows.filter(r=>r.t==null),ts=R.rows.filter(r=>r.t!=null).map(r=>r.t);console.log(`${n}: arrivano ${R.rows.length-f.length}/${R.rows.length}, tempo medio ${(ts.reduce((a,b)=>a+b,0)/Math.max(1,ts.length)).toFixed(1)}s, max ${Math.max(0,...ts)}s · folla ${R.crowd.arrived}/${R.crowd.of} in ${R.crowd.t}s`+(f.length?' · NON arrivano: '+f.slice(0,8).map(r=>`${r.kind}@${r.x},${r.y}→${r.end}`).join(' '):''))}
  console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
