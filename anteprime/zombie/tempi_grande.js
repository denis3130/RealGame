// Tempi della mappa grande (punto 54 del piano): in vari punti (zone vecchie e nuove, dentro gli edifici, al piano di sopra), senza zombie e con
// 10 zombie intorno, la mediana del tempo di un fotogramma (aggiornamento + disegno, a 1×, effetti normali e bassi); poi il tempo del campo di
// navigazione (navField) e di un giro di aggiornamento degli zombie. Solo misure, da confrontare prima e dopo. Uso: python3
// anteprime/zombie/mk.py area_mappa && node anteprime/zombie/tempi_grande.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]&&process.argv[2].endsWith('.html')?process.argv[2]:path.join(__dirname,'..','zombie.html')),WANT=process.argv.slice(2).filter(a=>!a.endsWith('.html'));
const PUNTI={partenza:[6.4,20.4],aia:[7.5,7.4],casa:[2.3,6.0],borgo:[22.0,18.5],locanda:[18.0,15.6],sopra:[19.0,14.5,1],cappella:[26.5,22.0],segheria:[22.6,6.4],fiume:[20.5,2.8]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(800);
  await p.evaluate(()=>{const M=__MZ,W=M.W;M.coins(99999);M.buyNow('cancello');for(const id of['zona3','zona34','zona24'])if(M.buys.find(o=>o.id===id))M.buyNow(id);W.split=null;W.dbg.noSpawn=true;W.dbg.god=true;W.dbg.noShoot=true;W.dbg.halt=true;M.ZM.navRebuild();for(let i=0;i<60;i++)M.render(1/30)});
  const mis=async(x,y,up,nz,low)=>p.evaluate(([x,y,up,nz,low])=>{const M=__MZ,W=M.W,T=64,h=W.hero,S0=M.ZM.STAIRS&&M.ZM.STAIRS[0];M.low(!!low);W.Z.length=0;M.tp(x*T,(y+2)*T);if(up){h.lv=1;h.lvH=S0.H;h.st=S0;h.zh=S0.H}else{h.lv=0;h.lvH=0;h.zh=0;h.st=null}h.cl=null;
      for(let i=0;i<nz;i++){const a=i/nz*6.283,r=110+(i%3)*40;const k=M.addZombie('zombie',h.x+Math.cos(a)*r,h.y+Math.sin(a)*r);W.Z[k].hp=1e9}
      for(let i=0;i<40;i++)M.render(1/60);const ts=[];for(let i=0;i<60;i++){const t0=performance.now();M.render(1/60);ts.push(performance.now()-t0)}ts.sort((a,b)=>a-b);return ts[30]},[x,y,up||0,nz,low||0]);
  console.log('punto          0 zombie   10 zombie   10 z. bassi');
  for(const[n,[x,y,up]] of Object.entries(PUNTI)){if(WANT.length&&!WANT.includes(n))continue;const a=await mis(x,y,up,0),b2=await mis(x,y,up,10),c=await mis(x,y,up,10,1);console.log(n.padEnd(14),(a.toFixed(1)+' ms').padStart(8),(b2.toFixed(1)+' ms').padStart(11),(c.toFixed(1)+' ms').padStart(13))}
  const nav=await p.evaluate(()=>{const M=__MZ,W=M.W,T=64,h=W.hero;h.lv=0;h.zh=0;h.st=null;W.Z.length=0;const ts=[];if(!M.navField)return'-';for(const[x,y] of[[6.4,20.4],[22,18.5],[22.6,6.4],[7.5,7.4]]){M.tp(x*T,(y+2)*T);const t0=performance.now();for(let i=0;i<10;i++)M.navField();ts.push((performance.now()-t0)/10)}return ts.map(v=>+v.toFixed(2))});
  console.log('navField (ms):',JSON.stringify(nav));
  console.log('ERR',JSON.stringify(errs.slice(0,3)));await b.close()})();
