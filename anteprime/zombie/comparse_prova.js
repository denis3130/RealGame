// Prova della comparsa degli zombie (punto 17 del piano): da dove escono. Con l'eroe in vari punti della mappa (zone aperte o chiuse, anche al
// piano di sopra della Locanda) chiede molte volte la buca a ZM.pickHole e controlla che sia sempre di una zona aperta, raggiungibile a piedi
// (il campo di navigazione), a una distanza a piedi tra 130 e 700 px, mai la stessa due volte di fila, e che ce ne sia più d'una; poi le
// comparse speciali: dal fiume (cerchi nell'acqua), dalla botola della cantina (le ante si spalancano), da sotto la carrozza bruciata (polvere).
// Fa le foto anteprime/zombie/_comparsa_*.png. Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/comparse_prova.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.join(__dirname,'..','zombie.html');let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
const PUNTI={partenza:[6.4,20.4],aia:[7.5,7.4],borgo:[22.0,18.5],cappella:[26.5,22.0],segheria:[22.6,6.4],caldaia:[27.6,7.2],sopraLocanda:[19.0,14.5,1]};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(500);
  const E=(f,a)=>p.evaluate(f,a);
  await E(()=>{const M=__MZ,W=M.W;window.ZM=M.ZM;W.dbg.god=true;W.dbg.noSpawn=true;W.dbg.noShoot=true;W.Z.length=0;
    window.prova=(hx,hy,up,n)=>{const T=64,h=W.hero,S0=ZM.STAIRS[0];M.tp(hx*T,(hy+2)*T);if(up){h.lv=1;h.lvH=S0.H;h.st=S0;h.zh=S0.H}else{h.lv=0;h.lvH=0;h.zh=0;h.st=null}h.cl=null;W.Z.length=0;W.lastHole=null;
      M.sim(3,1/60);ZM.navRebuild();M.sim(3,1/60);const got=[];let bad=[],rep=0,prev=null;
      for(let i=0;i<n;i++){const q=ZM.pickHole();if(!q){got.push(null);continue}const d=ZM.holeDist(q),zoneOk=q[2]==null||W.zoneOpen[q[2]];if(!zoneOk||!(d<1e9)||d<130||d>700)bad.push([(q[0]/T).toFixed(1),(q[1]/T-2).toFixed(1),q[2],Math.round(d)]);if(q===prev)rep++;prev=q;got.push(q)}
      const ids=new Set(got.filter(Boolean).map(q=>(q[0]/T).toFixed(1)+','+(q[1]/T-2).toFixed(1)+(q[3]?' '+q[3]:'')));return{none:got.filter(q=>!q).length,bad,rep,kinds:[...ids]}}});
  // 1. solo l'area di partenza aperta
  const r0=await E(()=>{const W=__MZ.W;W.zoneOpen={1:true,2:false,3:false,4:false};return prova(6.4,20.4,0,40)});
  ok(!r0.none&&!r0.bad.length&&!r0.rep&&r0.kinds.length>=2,`solo la partenza aperta: escono da ${r0.kinds.length} buche vicine (${r0.kinds.join(' · ')})`);
  // 2. tutte le zone aperte, in vari posti
  await E(()=>{const M=__MZ,W=M.W;M.coins(99999);M.buyNow('cancello');for(const id of['zona3','zona34','zona24'])M.buyNow(id);W.split=null;ZM.navRebuild()});
  for(const[n,[x,y,up]] of Object.entries(PUNTI)){const r=await E(([x,y,up])=>prova(x,y,up,40),[x,y,up||0]);
    ok(!r.none&&!r.bad.length&&!r.rep&&r.kinds.length>=2,`${n}: ${r.kinds.length} buche, tutte aperte e raggiungibili a meno di 700 px a piedi${r.bad.length?' — FUORI: '+JSON.stringify(r.bad):''} (${r.kinds.join(' · ')})`)}
  // 3. le comparse speciali, una per tipo, con le foto
  for(const[k,cx,cy] of[['acqua',21.4,2.6],['botola',14.6,13.75],['carro',25.6,18.6]]){
    const r=await E(([k,cx,cy])=>{const M=__MZ,W=M.W,T=64;W.Z.length=0;const h=W.hero;h.lv=0;h.zh=0;h.st=null;if(k==='botola')M.tp(cx*T+10,(cy+2)*T+70);else M.tp(cx*T+60,(cy+2)*T+50);/* (la botola sta nel cortile dietro la Locanda: l'eroe lì accanto) */const q=ZM.holes.find(q=>q[3]===k&&Math.abs(q[0]/T-cx)<1.2&&Math.abs(q[1]/T-2-cy)<1.4);if(!q)return{none:1};
      const p0=W.puffs.length,z=ZM.spawn({kind:'zombie',hole:q});M.sim(k==='carro'?8:30,1/60);M.cam(q[0],q[1]-20);M.zoom(2.2);return{sp:z.sp,rise:+z.rise.toFixed(2),fin:+(z.fin||0).toFixed(2),puffs:W.puffs.length-p0}},[k,cx,cy]);
    await p.waitForTimeout(120);await p.screenshot({path:path.join(__dirname,'_comparsa_'+k+'.png')});
    ok(!r.none&&r.sp===k&&(k==='carro'?r.fin>0&&r.puffs>=4:r.rise>0&&r.rise<1),`${k}: lo zombie esce ${k==='acqua'?'dal fiume':k==='botola'?'dalla botola':'da sotto la carrozza'} (${JSON.stringify(r)})`)}
  await E(()=>{__MZ.cam(null);__MZ.zoom(null)});
  console.log('ERR',JSON.stringify(errs));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
