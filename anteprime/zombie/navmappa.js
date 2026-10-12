// Gli zombie della mappa intera arrivano all'eroe girando intorno a fienile, casa colonica, tettoia, recinti e passando dal cancello aperto.
// Ogni caso: l'eroe fermo in un punto, otto zombie messi in posti diversi (anche lontani, dietro gli edifici), 60 s simulati: quanti arrivano a
// 40 px e in quanto tempo. Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/navmappa.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));
const CASI={aia:[7.5,7.4,[[12.9,3.9],[15.7,6.0],[13.4,8.62],[2.3,8.1],[0.3,6.0],[11.6,10.3],[9.0,11.0],[2.5,3.4]]],
  portone:[10.7,6.1,[[15.7,6.0],[13.2,3.85],[13.2,8.62],[7.6,11.6],[4.8,5.2],[1.4,10.2],[14.6,11.0],[8.0,3.4]]],
  dentroFienile:[12.4,6.2,[[10.2,4.5],[10.5,8.0],[15.7,8.0],[13.2,3.85],[7.5,7.0],[12.0,10.5],[14.2,11.2],[16-.3,4.5]]],
  colonica:[2.32,6.0,[[4.9,5.0],[2.3,8.1],[0.3,7.8],[2.3,3.9],[6.2,8.8],[4.6,11.0],[7.8,5.6],[2.6,11.85]]],
  partenza:[6.4,20.4,[[7.0,11.6],[9.0,11.0],[5.5,10.0],[4.4,15.6],[12.4,15.9],[13.05,20.3],[8.0,13.4],[3.75,13.8]]],
  retroCasa:[9.6,14.5,[[6.45,11.6],[12.9,15.9],[11.3,13.2],[2.75,13.5],[7.0,19.4],[11.9,19.0],[4.0,15.6],[13.0,21.5]]]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:60000});await p.waitForTimeout(500);
  await p.evaluate(()=>{const M=__MZ;M.coins(9999);M.buyNow('cancello');M.zombies(false);M.W.dbg.noShoot=true;M.W.dbg.halt=true});
  await p.evaluate(()=>{for(let i=0;i<200;i++)__MZ.render(1/30)});// il velo se ne va, le ante si aprono
  let tot=0,arr=0;for(const[n,[hx,hy,zs]] of Object.entries(CASI)){const r=await p.evaluate(([hx,hy,zs])=>{const M=__MZ,W=M.W,T=64;W.Z.length=0;M.tp(hx*T,(hy+2)*T);W.hero.moving=false;
      zs.forEach(([x,y])=>{const i=M.addZombie('zombie',x*T,(y+2)*T);W.Z[i].hp=1e9});const t0={},dt=1/30;for(let k=0;k<60*30;k++){M.sim(1,dt);for(const z of W.Z)if(t0[z.id]==null&&Math.hypot(z.x-W.hero.x,z.y-W.hero.y)<40)t0[z.id]=k*dt;if(Object.keys(t0).length===zs.length)break}
      const ts=Object.values(t0);return{n:ts.length,of:zs.length,med:ts.length?(ts.reduce((a,b)=>a+b,0)/ts.length).toFixed(1):'-',max:ts.length?Math.max(...ts).toFixed(1):'-',stuck:W.Z.filter(z=>t0[z.id]==null).map(z=>[(z.x/T).toFixed(1),(z.y/T-2).toFixed(1)].join(','))}},[hx,hy,zs]);
    tot+=r.of;arr+=r.n;console.log(n.padEnd(14),`arrivano ${r.n}/${r.of}, tempo medio ${r.med}s, max ${r.max}s`+(r.stuck.length?' · fermi in '+r.stuck.join(' | '):''))}
  console.log(`\ntotale ${arr}/${tot}`);console.log('ERR',JSON.stringify(errs.slice(0,3)));await b.close()})();
