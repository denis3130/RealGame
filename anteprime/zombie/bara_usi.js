// La Bara delle Sorprese si apre da 3 a 5 volte (punto 20 del piano): dopo l'ultima arma saluta, sprofonda e ricompare in un altro posto
// di una zona aperta, col nome della zona e un fascio di luce; lì riparte con un numero nuovo. Niente monete rese (non scappa più a caso).
// Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/bara_usi.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:60000});await p.waitForTimeout(500);
  const E=(f,a)=>p.evaluate(f,a);
  for(let giro=0;giro<3;giro++){
    const r=await E(()=>{const M=__MZ,W=M.W,B=M.box();W.dbg.god=true;W.dbg.noSpawn=true;W.dbg.noShoot=true;W.zoneOpen[2]=true;W.Z.length=0;const x0=B.x,y0=B.y,max=B.b.max;let opens=0,moved=false,toast=null,faro=0,refund=0;
      for(let k=0;k<8&&!moved;k++){M.coins(5000);M.tp(B.x,B.y+40);const c0=W.coins;if(!M.buyNow('bara'))break;opens++;
        for(let i=0;i<60*30;i++){M.sim(1,1/60);if(B.b.st==='offre')M.buyNow('bara');if(W.toast&&/ricomparsa/.test(W.toast[0]))toast=W.toast[0];if(W.FX.some(f=>f.k==='faro'))faro=1;if(B.x!==x0||B.y!==y0)moved=true;if(B.b.st==='ferma'&&(moved?B.b.t>.1:true))break}
        if(W.coins>c0-750+1)refund++}
      return{opens,max,moved,toast,faro,refund,st:B.b.st,usi:B.b.usi,newMax:B.b.max,x:Math.round(B.x),y:Math.round(B.y)}});
    ok(r.moved&&r.opens===r.max&&r.max>=3&&r.max<=5&&!r.refund,`giro ${giro+1}: la Bara si apre ${r.opens} volte (doveva ${r.max}) e poi va in un altro posto (${r.x}, ${r.y}), senza rendere monete`);
    ok(!!r.toast&&r.faro,`… dice dove è andata («${r.toast}») e accende il fascio di luce`);
    ok(r.st==='ferma'&&r.usi===0&&r.newMax>=3&&r.newMax<=5,`… e lì riparte da capo (${r.newMax} aperture)`)}
  console.log('ERR',JSON.stringify(errs));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
