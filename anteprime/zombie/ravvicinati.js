// Zombie che partono VICINO all'eroe (34..90 px) ma con un solido in mezzo: arrivano? attaccano attraverso il solido? Per ogni punto dove può
// stare l'eroe (griglia di P px) mette zombie e segugi tutto intorno, simula 40 s e conta chi non arriva e chi attacca con un ostacolo in mezzo.
// Scritta durante la verifica del 12 ottobre. Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/ravvicinati.js [P]
const {chromium}=require('../../node_modules/playwright'),path=require('path');
const open=async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+path.resolve(__dirname,'..','zombie.html'));await p.waitForTimeout(2500);
  await p.evaluate(()=>{const M=__MZ;M.zombies(false);M.W.dbg.freeze=true;M.W.dbg.noShoot=true;M.W.Z.length=0});return {b,p,errs}};
const P=+(process.argv[2]||24);(async()=>{const {b,p,errs}=await open();
const r=await p.evaluate(([P,process_kind])=>{const M=__MZ,W=M.W;const H0=[W.hero.x,W.hero.y];
  const S=2,cw=320,ch=320,seen=new Uint8Array(cw*ch),q=[];const st=[Math.round(H0[0]/S),Math.round(H0[1]/S)];seen[st[1]*cw+st[0]]=1;q.push(st[1]*cw+st[0]);
  while(q.length){const u=q.pop(),i=u%cw,j=(u-i)/cw;for(const[di,dj] of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(seen[nc])continue;if(M.hit(ni*S,nj*S,10))continue;seen[nc]=1;q.push(nc)}}
  // lo zombie (r 11) può stare lì e ci arriva dalla partenza dell'eroe? (BFS zombie)
  const zs=new Uint8Array(cw*ch);{const q2=[st[1]*cw+st[0]];zs[q2[0]]=1;while(q2.length){const u=q2.pop(),i=u%cw,j=(u-i)/cw;for(const[di,dj] of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(zs[nc])continue;if(M.hit(ni*S,nj*S,11))continue;zs[nc]=1;q2.push(nc)}}}
  const segHit=(x0,y0,x1,y1)=>{const L=Math.hypot(x1-x0,y1-y0),n=Math.ceil(L/1.5);for(let k=1;k<n;k++){const t=k/n;if(M.hit(x0+(x1-x0)*t,y0+(y1-y0)*t,.5))return true}return false};
  const fail=[],thru=[];let tries=0,nh=0;
  for(let hy=P/2;hy<W.h;hy+=P)for(let hx=P/2;hx<W.w;hx+=P){if(!seen[Math.round(hy/S)*cw+Math.round(hx/S)])continue;nh++;W.hero.x=hx;W.hero.y=hy;W.hero.moving=false;M.navRebuild();
    for(let sy=hy-90;sy<=hy+90;sy+=12)for(let sx=hx-90;sx<=hx+90;sx+=12){const d0=Math.hypot(sx-hx,sy-hy);if(d0<34||d0>90||sx<0||sy<0||sx>=W.w||sy>=W.h)continue;if(!zs[Math.round(sy/S)*cw+Math.round(sx/S)]||M.hit(sx,sy,11))continue;if(!segHit(sx,sy,hx,hy))continue;
      tries++;W.Z.length=0;M.addZombie(process_kind,sx,sy);const z=W.Z[0];let got=-1;for(let i=0;i<1200;i++){M.sim(1,1/30);if(z.anim==='attack'){got=i/30;break}}
      if(got<0)fail.push([hx,hy,sx,sy,+z.x.toFixed(1),+z.y.toFixed(1),+Math.hypot(z.x-hx,z.y-hy).toFixed(1)]);else if(segHit(z.x,z.y,hx,hy))thru.push([hx,hy,sx,sy,+z.x.toFixed(1),+z.y.toFixed(1),+Math.hypot(z.x-hx,z.y-hy).toFixed(1),+got.toFixed(1)])}}
  W.Z.length=0;return{nh,tries,fail,thru}},[P,process.env.KIND||'hound']);
console.log('posizioni eroe',r.nh,'prove',r.tries,'mai arrivati (40 s)',r.fail.length,'attacco con un solido in mezzo',r.thru.length);
console.log('MAI:');for(const f of r.fail.slice(0,60))console.log(JSON.stringify(f));console.log('ATTRAVERSO:');for(const f of r.thru.slice(0,60))console.log(JSON.stringify(f));
require('fs').writeFileSync(__dirname+'/t10_'+(process.env.KIND||'hound')+'_'+(process.env.PAGE||'zx')+'.json',JSON.stringify(r));console.log('ERR',errs);await b.close()})();
