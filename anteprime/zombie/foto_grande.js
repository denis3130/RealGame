// Foto della mappa grande (anteprima 48): la vista intera e i posti nuovi da vicino (Locanda, mercato, Cappella, Fucina, Segheria, fiume,
// barriere tra le zone), con le zone aperte. Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/foto_grande.js [nomi…]
// → anteprime/zombie/vetrina/grande/<nome>.png
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.join(__dirname,'..','zombie.html'),OUT=path.join(__dirname,'vetrina','grande');
const P=(x,y)=>[x*64,(y+2)*64];
const SH={intera:null,locanda:[...P(18.4,17.9),1.3],locandaDentro:[...P(17.6,15.2),1.6],mercato:[...P(24.6,16.0),1.4],cappella:[...P(26.5,19.6),1.4],cappellaDentro:[...P(26.5,22.4),1.6],
  fucina:[...P(17.2,19.6),1.5],segheria:[...P(23.2,9.6),1.2],segheriaDentro:[...P(22.6,6.4),1.5],fiume:[...P(20.5,2.8),1.4],caldaia:[...P(27.6,7.2),1.6],
  barrieraCarri:[...P(13.2,18.5),1.8],barrieraTronchi:[...P(15.2,9.6),1.8],cancelloSegheria:[...P(25.5,13.2),1.8],carrozza:[...P(26.7,19.6),1.7],orto:[...P(22.3,21.0),1.6],
  dietroLocanda:[...P(18.4,12.8),1.3],fucinaDentro:[...P(17.2,21.6),1.5],dietroCappella:[...P(26.6,19.7),1.3]};
(async()=>{const want=process.argv.slice(2);const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(500);
  await p.evaluate(()=>{const M=__MZ,W=M.W;W.dbg.noSpawn=true;W.dbg.god=true;W.dbg.noShoot=true;for(const z of[2,3,4])W.zoneOpen[z]=true;W.split=null;M.ZM.navRebuild();for(const t of document.querySelectorAll('#mzHint'))t.style.display='none'});
  for(const[k,v] of Object.entries(SH)){if(want.length&&!want.includes(k))continue;
    await p.evaluate(v=>{const M=__MZ;if(!v){M.setWhole(true);return}M.setWhole(false);const inside=v[3];M.tp(v[0],v[1]);M.cam(v[0],v[1]-20);M.zoom(v[2]);M.view(0,null)},v);await p.waitForTimeout(700);
    await p.screenshot({path:path.join(OUT,k+'.png')});console.log('foto',k)}
  console.log('ERR',JSON.stringify(errs));await b.close()})();
