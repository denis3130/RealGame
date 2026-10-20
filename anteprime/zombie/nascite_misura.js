// Misura dove nascono gli zombie (FASE 9, punto 17 di docs/fase-9-fluidita.md): l'eroe in una griglia di punti delle zone aperte, per quattro mappe (solo partenza, +fattoria,
// +borgo, tutto), 30 nascite a punto; distanza a piedi, sullo schermo o no, e la buca più vicina disponibile. Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/nascite_misura.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=process.argv[2]||path.join(__dirname,'..','zombie.html');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(500);
  const E=(f,a)=>p.evaluate(f,a);
  await E(()=>{const M=__MZ,W=M.W;window.ZM=M.ZM;W.dbg.god=true;W.dbg.noSpawn=true;W.dbg.noShoot=true;W.Z.length=0;M.setWhole(false);M.cam(null);M.zoom(null)});
  const cfgs=[['partenza',[]],['+fattoria',['cancello']],['+borgo',['cancello','zona3']],['tutto',['cancello','zona3','zona34','zona24']]];
  for(const[nome,buy] of cfgs){
    const r=await E(([buy])=>{const M=__MZ,W=M.W,T=64;ZM.ctl.nuova();W.dbg.noSpawn=true;W.Z.length=0;M.coins(99999);for(const id of buy)M.buyNow(id);if(buy.length)W.split=null;ZM.navRebuild();
      const out={pts:0,d:[],on:0,far:0,none:0,minHole:[],HW:0,HH:0,worst:[]};
      for(let gy=1;gy<29;gy+=1.5)for(let gx=1;gx<30;gx+=1.5){const x=gx*T,y=(gy)*T;if(W.zoneIdAt&&W.zoneOpen[W.zoneIdAt(x,y)]===false)continue;
        M.tp(x,y);const h=W.hero;h.lv=0;h.zh=0;h.st=null;h.cl=null;ZM.navRebuild();M.sim(2,1/60);if(ZM.holeDist([x,y])>40)continue;M.render(1);M.render(1);
        out.pts++;out.HW=Math.round(ZM.ORD?0:0);let mh=1e9;for(const q of ZM.holes){if(!ZM.zoneOk(q[0],q[1],q[2]))continue;const d=ZM.holeDist(q);if(d<mh&&d>=130)mh=d}out.minHole.push(Math.round(mh));
        let mx=0;W.lastHole=null;for(let i=0;i<30;i++){const q=ZM.pickHole();if(!q){out.none++;continue}const d=ZM.holeDist(q);out.d.push(Math.round(d));if(d>mx)mx=d;const s=M.toScreen(q[0],q[1],0);if(s[0]>0&&s[0]<390&&s[1]>0&&s[1]<844)out.on++;if(d>420)out.far++}
        if(mx>420)out.worst.push([gx,gy-2,Math.round(mx),Math.round(mh)])}
      return out},[buy]);
    const d=r.d.sort((a,b)=>a-b),q=f=>d[Math.floor(f*(d.length-1))];
    console.log(`${nome}: ${r.pts} punti, ${d.length} buche scelte, mediana ${q(.5)}, 90% ${q(.9)}, max ${d[d.length-1]}; sullo schermo ${(100*r.on/d.length).toFixed(1)}%; oltre 420 ${(100*r.far/d.length).toFixed(1)}%; nessuna ${r.none}`);
    if(r.worst.length)console.log('   lontane:',JSON.stringify(r.worst.slice(0,12)))}
  const sz=await E(()=>{const M=__MZ;const h=M.W.hero;const c=[M.toScreen(h.x,h.y,0),M.toScreen(h.x+165,h.y,0),M.toScreen(h.x,h.y-300,0),M.toScreen(h.x,h.y+300,0)];return{scr:c,cz:M.CAM.z}});
  console.log('telecamera',JSON.stringify(sz));
  console.log('ERR',JSON.stringify(errs.slice(0,3)));await b.close()})();
