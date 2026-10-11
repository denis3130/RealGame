// Apre la copia del gioco, carica i disegni dei mostri e della mappa e salva le tavole in out/.
// node foto.js [tavolaCase,tavolaOggetti,zombieTerra,scene]
const {chromium}=require('/home/user/RealGame/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:300,trBest:300,runs:4,introSeen:1,handSeen:1,login:{last:'2099-1-1',n:1}}))});
  await p.goto('file://'+__dirname+'/gioco.html');await p.waitForTimeout(1500);
  const f64=n=>fs.readFileSync(path.join(__dirname,'fonts',n)).toString('base64');
  const ok=await p.evaluate(async([a,c])=>{const L=new FontFace('Lilita One',`url(data:font/woff2;base64,${a})`),B=new FontFace('Baloo 2',`url(data:font/woff2;base64,${c})`,{weight:'400 800'});
    await L.load();await B.load();document.fonts.add(L);document.fonts.add(B);return document.fonts.check('30px "Lilita One"')&&document.fonts.check('600 13px "Baloo 2"')},[f64('lilita.woff2'),f64('baloo2.woff2')]);
  console.log('font',ok);
  for(const f of ['/home/user/RealGame/sprite/mostri/disegno_mostri.js',path.join(__dirname,'disegno_mappa.js'),path.join(__dirname,'componi.js')])
    await p.evaluate(s=>__E(s),fs.readFileSync(f,'utf8'));
  for(const n of (process.argv[2]||'tavolaCase,tavolaOggetti,zombieTerra,scene').split(',')){
    try{const url=await p.evaluate(n=>__E(`FOTO.${n}()`),n);fs.writeFileSync(path.join(__dirname,'out',n+'.png'),Buffer.from(url.split(',')[1],'base64'));console.log('ok',n)}
    catch(e){console.log('ERRORE',n,e.message.slice(0,400))}}
  console.log(errs.slice(0,10));await b.close()})();
