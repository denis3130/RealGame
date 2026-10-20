// Con src/js/93-colpi-unici.js ma senza i boss rifatti (python3 anteprime/mk_colpi.py --test --senza-boss → tests/colpi_oggi_test.html):
// i boss di oggi delle arene 9–12 (Burattinaio, Fenice, Piovra, Cervo), che usano gli stessi tipi di colpo dei rifatti ('shadow', 'bubble',
// 'ice', 'crystal'), devono restare come sono (niente rombi, inchiostro, schegge d'aurora); i burattini del Burattinaio di oggi tirano lo
// spillo come tutti i burattini. Uso: node tests/colpi_oggi.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'colpi_oggi_test.html'));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:20000});await p.waitForTimeout(600);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`)),W=ms=>p.waitForTimeout(ms);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x!=null?'  '+x:''));
  await E(`document.querySelectorAll('#cpPan').forEach(q=>q.hidden=true);modal=false;paused=false;startRun();0`);await W(800);
  for(const ai of[8,9,10,11]){await E(`(()=>{G.arena=${ai};G.chapter=ARENAS[${ai}].ch;G.diff=ARENAS[${ai}].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom();return 0})()`);
    const seen={};for(let i=0;i<120;i++){await W(100);const s=await J(`(()=>{P.hp=P.maxhp;const o={};for(const q of G.eproj){const k=(q.kind)+(q.cuLook?'+'+q.cuLook:'')+(q.cuYo?'+fili':'')+(q.cuK?'+'+q.cuK:'');o[k]=(o[k]||0)+1}return o})()`);for(const k in s)seen[k]=Math.max(seen[k]||0,s[k])}
    const boss=await J(`(()=>{const e=G.enemies.find(q=>isBoss(q.type)||['puppeteer','phoenix','octopus','stag'].includes(q.type));return e?e.type:null})()`);
    const bad=Object.keys(seen).filter(k=>k.includes('+rombo')||k.includes('+inkb')||k.includes('+stag')||k.includes('+fili')||k.includes('+boss'));
    ok(`arena ${ai+1} (${boss}): i colpi del boss di oggi restano come sono`,!bad.length,JSON.stringify(seen))}
  console.log(R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
