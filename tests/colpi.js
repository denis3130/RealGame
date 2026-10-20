// I colpi unici dei nemici (src/js/93-colpi-unici.js) nella pagina di prova (python3 anteprime/mk_colpi.py --test → tests/colpi_test.html):
// per ogni nemico che spara entra nella sua stanza (anche l'élite), aspetta che il colpo sia in volo e fa una foto (tests/cu_<tipo>.png),
// conta i colpi nuovi visti per tipo, guarda che i colpi di oggi tornino con «Colpi di oggi», misura il disegno con tanti colpi insieme
// (con e senza LOWFX) e conta gli errori.
// Uso: python3 anteprime/mk_colpi.py --test && node tests/colpi.js [tipo ...]
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const page=path.join(__dirname,'colpi_test.html');if(!fs.existsSync(page)){console.log('manca',page);process.exit(1)}
const ONLY=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+page);await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:20000});await p.waitForTimeout(800);const E=s=>p.evaluate(s=>__E(s),s);
  await E(`initAudio();AU.on.music=false;audioSettings();document.querySelectorAll('#cpPan').forEach(q=>q.hidden=true);modal=false;paused=false;0`);
  const EN=JSON.parse(await E(`JSON.stringify(CPEN.map(q=>q.t))`)).filter(t=>!ONLY.length||ONLY.includes(t));
  const R=[];
  // what is flying now: the new shots by kind, plus the meteors, bombs and stares that are theirs
  const FLY=`(()=>{const o={};for(const q of G.eproj){const k=q.cuK||q.kind;o[k]=(o[k]||0)+1}for(const m of G.meteors)if(m.t>=0){const k=m.cu?'meteora_'+m.cu:'meteora';o[k]=(o[k]||0)+1}
    for(const l of G.lobs)if(l.t>=0){const k=l.cu?'bomba_'+l.cu:'lob_'+l.kind;o[k]=(o[k]||0)+1}for(const l of G.lines){const k='raggio_'+l.col;o[k]=(o[k]||0)+1}return JSON.stringify(o)})()`;
  for(const el of[false,true]){
    await E(`$('cpEl').checked=${el};CP_el=${el};0`).catch(()=>{});
    for(const t of EN){if(el&&t==='bat')continue;
      await E(`(()=>{const c=document.getElementById('cpEl');c.checked=${el};c.onchange({target:c});CPgo('e','${t}');return 0})()`);await p.waitForTimeout(900);
      const seen={};let shot=false;
      for(let i=0;i<70;i++){await p.waitForTimeout(100);const f=JSON.parse(await E(FLY));for(const k in f)seen[k]=Math.max(seen[k]||0,f[k]);
        const any=Object.keys(f).some(k=>k.startsWith('cu')||k.endsWith('_pyro')||k.endsWith('_bomber')||k==='raggio_cuEye');
        if(any&&!shot){await p.waitForTimeout(t==='frog'||t==='plant'||t==='snowspirit'?420:220);await p.screenshot({path:path.join(__dirname,`cu_${t}${el?'_elite':''}.png`)});shot=true}}
      R.push(`${shot?'OK ':'NO '} ${t}${el?' élite':''}: ${JSON.stringify(seen)}`)}}
  // the shots of today come back with «Colpi di oggi»
  await E(`CPset(false);CPgo('e','goblin');0`);await p.waitForTimeout(4500);const old=JSON.parse(await E(FLY));
  R.push((Object.keys(old).some(k=>k.startsWith('cu'))?'NO ':'OK ')+' colpi di oggi: '+JSON.stringify(old));await E(`CPset(true);0`);
  // the cost of drawing: 40 shots of a kind at once, drawn 15 times with the canvas made to finish each time (getImageData), less the time of
  // finishing an empty canvas; next to the shots of today (orb, arrow, fire); with and without LOWFX
  for(const low of[false,true]){const ms=JSON.parse(await E(`(()=>{LOWFX=${low};CPgo('e','goblin');G.enemies=[];paused=true;const K=['orb','arrow','fire','thorn','cuArrow','cuBolt','cuScreech','cuSeed','cuWisp','cuFire','cuEmber','cuSkull','cuGob','cuFlake','cuShard','cuPetal','cuPin'],out={};
      const mk=k=>{const A=[];for(let i=0;i<40;i++){const a=i*.37,x=L+30+(i%8)*48,y=TOP+120+Math.floor(i/8)*46,tr=[];for(let s2=6;s2>0;s2--)tr.push(x-Math.cos(a)*s2*3,y-Math.sin(a)*s2*3);
        A.push({x,y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,a,r:6,dmg:1,kind:k,cuK:k.startsWith('cu')?k:null,life:9,age:i*.03,ph:i,z:(i%3)*5,cuHop:k==='cuGob'?{per:.34,h:15}:null,r0:6,tr})}return A};
      const fin=()=>ctx.getImageData(0,0,1,1);fin();let t0=performance.now();for(let j=0;j<15;j++)fin();const base=(performance.now()-t0)/15;
      for(const k of K){const A=mk(k);for(let j=0;j<3;j++){for(const q of A)drawEproj(q);fin()}t0=performance.now();for(let j=0;j<15;j++){for(const q of A)drawEproj(q);fin()}
        out[k]=+(Math.max(0,(performance.now()-t0)/15-base)/40*1000).toFixed(1)}
      paused=false;LOWFX=false;return JSON.stringify(out)})()`));R.push(`disegno di un colpo, µs${low?' (LOWFX)':''}: `+JSON.stringify(ms))}
  console.log(R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
