// Un boss della Classica rifatto nella copia di prova del gioco (anteprime/mk_boss2.py <tipo> --test [--stub] → tests/<tipo>2_test.html):
// entra nella sua stanza come dice il suo cervello (BCL[tipo].enter), guarda l'entrata, lascia combattere (eroe che non muore ma tira
// davvero e viene colpito), controlla che passino tutte le mosse della fase 1 (BCL[tipo].moves) e i loro pericoli (BCL[tipo].hz), porta il
// boss a metà vita (la fase 2: BCL[tipo].moves2), misura il disegno della stanza, lo sconfigge e guarda la sconfitta fino alla stanza
// ripulita; ascolta la sua voce (grido, presa in giro, rabbia, sconfitta) e conta gli errori. Foto tests/b2g_<tipo>_<momento>.png.
// Uso: python3 anteprime/mk_boss2.py <tipo> --test [--stub] && node tests/boss2gioco.js <tipo>
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const T=process.argv[2];if(!T){console.log('uso: node tests/boss2gioco.js <tipo>');process.exit(1)}
const page=path.join(__dirname,`${T}2_test.html`);if(!fs.existsSync(page)){console.log('manca',page,'(python3 anteprime/mk_boss2.py',T,'--test)');process.exit(1)}
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+page);await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x?'  '+x:''));
  const shot=n=>p.screenshot({path:path.join(__dirname,`b2g_${T}_${n}.png`)});
  const has=await E(`!!(window.BCL&&BCL['${T}'])`);if(!has){console.log('il cervello non ha registrato BCL.'+T+' (modello nuovo mancante?)');await b.close();process.exit(2)}
  const C=JSON.parse(await E(`(()=>{const R=BCL['${T}'],M=N3.meta['${T}']||{};return JSON.stringify({n:R.n,moves:R.moves||[],moves2:R.moves2||[],p2:R.p2!==false,voice:R.voice||[],an:M.an||[],nuovo:!!N3['${T}2']&&N3['${T}']===N3['${T}2']})})()`));
  ok(`${C.n}: il modello nuovo al posto del vecchio`,C.nuovo);
  await E(`initAudio();AU.on.music=false;audioSettings();window.__vl=[];{const _p=B3VO.play;B3VO.play=function(t,k){const d=_p.apply(this,arguments);if(t==='${T}')__vl.push(k+(d?'':'(muto)'));return d}}0`);
  const said=async()=>JSON.parse(await E(`JSON.stringify(__vl)`));
  const FIND=`((window.BCL['${T}'].find&&BCL['${T}'].find())||G.enemies.find(q=>q.type==='${T}'))`;
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);AU.on.music=false;startRun();0`);await p.waitForTimeout(700);
  await E(`BCL['${T}'].enter();P.inv=0;P.hp=P.maxhp=1e7;window.__st={};window.__hz={};0`);
  // the entrance
  const in0=JSON.parse(await E(`(()=>{const e=${FIND};return JSON.stringify({b:!!e,st:e&&e.st,m:e&&n3Move(e),intro:e&&e.intro})})()`));
  ok('entrata recitata dal modello',in0.b&&(!C.an.includes('enter')||in0.m&&in0.m[0]==='enter'),JSON.stringify(in0));
  await p.waitForTimeout(1300);await shot('entrata1');await p.waitForTimeout(1300);await shot('entrata2');
  for(let i=0;i<30;i++){if(await E(`(()=>{const e=${FIND};return !e||!(e.intro>0)})()`))break;await p.waitForTimeout(200)}await p.waitForTimeout(400);
  const in1=JSON.parse(await E(`(()=>{const e=${FIND};return JSON.stringify({st:e&&e.st,intro:e&&e.intro})})()`));
  ok('dopo l\'entrata combatte',!(in1.intro>0),JSON.stringify(in1));
  if(C.voice.includes('cry'))ok('voce: il grido dell\'entrata',(await said()).includes('cry'),(await said()).join(' '));
  // the fight: the states and the dangers every 100 ms; the hero stays at the bottom and shoots (or where the brain says: BCL[tipo].hero,
  // for a boss that does not come to you); once it gets hit (the mocking). In the second phase its health never goes under 15% (a boss with
  // little health, like the Mimic, would die before showing every move of it)
  await E(`window.__iv=setInterval(()=>{const e=${FIND};if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}P.hp=P.maxhp;if(!e)return;__st[e.st]=(__st[e.st]||0)+1;if(BCL['${T}'].hero){const h=BCL['${T}'].hero(e);if(h){P.x=h.x;P.y=h.y}}
    try{const h=BCL['${T}'].hz?BCL['${T}'].hz():{};for(const k in h)__hz[k]=Math.max(__hz[k]||0,+h[k]||0)}catch(err){}
    if(e.hp<e.max*.55&&!window.__half)e.hp=e.max*.9;else if(window.__half&&e.hp<e.max*.15)e.hp=e.max*.45},100);0`);
  for(let i=0;i<6;i++){await p.waitForTimeout(4200);await shot('lotta'+(i+1));if(i===1)await E(`P.inv=0;P.dashT=0;hurtP(5);0`)}
  let st=JSON.parse(await E(`JSON.stringify({st:__st,hz:__hz})`));
  const seen=C.moves.filter(m=>st.st[m]);ok('mosse della fase 1',seen.length===C.moves.length,seen.join(', ')+(seen.length<C.moves.length?' · mancano: '+C.moves.filter(m=>!st.st[m]).join(', '):''));
  R.push('     stati visti: '+JSON.stringify(st.st));R.push('     pericoli (massimo insieme): '+JSON.stringify(st.hz));
  if(C.voice.includes('laugh'))ok('voce: la presa in giro',(await said()).includes('laugh'),(await said()).filter(x=>/laugh|c_/.test(x)).join(' '));
  // half health: the second phase
  if(C.p2){await E(`window.__half=1;window.__st={};{const e=${FIND};if(e){e.hp=e.max*.49}}0`);
    for(let i=0;i<24;i++){await p.waitForTimeout(250);if(await E(`(()=>{const e=${FIND};return !!(e&&e.p2)})()`))break}
    await p.waitForTimeout(900);await shot('fase2_a');await p.waitForTimeout(6000);await shot('fase2_b');await p.waitForTimeout(7000);await shot('fase2_c');
    // a long second phase: keep watching (up to 24 s more) until every move of it has been seen
    for(let i=0;i<48;i++){const seen=JSON.parse(await E(`JSON.stringify(__st)`));if(C.moves2.every(m=>seen[m]))break;await p.waitForTimeout(500)}
    st=JSON.parse(await E(`JSON.stringify({st:__st,hz:__hz,p2:!!(${FIND}||{}).p2})`));
    const s2=C.moves2.filter(m=>st.st[m]);ok('fase 2',st.p2&&s2.length===C.moves2.length,s2.join(', ')+(s2.length<C.moves2.length?' · mancano: '+C.moves2.filter(m=>!st.st[m]).join(', '):'')+' · '+JSON.stringify(st.st));
    if(C.voice.includes('angry'))ok('voce: la rabbia della fase 2',(await said()).includes('angry'),'')}
  // drawing time of the room with the boss
  const ms=JSON.parse(await E(`(()=>{const T=[];for(let i=0;i<40;i++){const t0=performance.now();render();T.push(performance.now()-t0)}T.sort((a,b)=>a-b);return JSON.stringify({med:+T[20].toFixed(2)})})()`));
  R.push(`     disegno della stanza (mediana di 40): ${ms.med} ms`);
  // the defeat
  await E(`window.__half=0;clearInterval(__iv);window.__iv=setInterval(()=>{if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},100);{const e=${FIND};if(e){e.shell=0;e.z=0;e.hidden=false;e.air=0;hurtE(e,e.hp+10,false)}}0`);
  await p.waitForTimeout(1200);await shot('sconfitta1');await p.waitForTimeout(1600);await shot('sconfitta2');
  for(let i=0;i<20;i++){await p.waitForTimeout(500);if(await E(`G.state!=='play'&&!(G.corpses||[]).length`))break}
  const fin=JSON.parse(await E(`JSON.stringify({state:G.state,corpses:(G.corpses||[]).length,left:G.enemies.filter(q=>isBoss(q.type)||q.type==='${T}').length})`));
  ok('sconfitta e stanza ripulita',fin.left===0&&fin.state!=='play',JSON.stringify(fin));
  if(C.voice.includes('die'))ok('voce: la sconfitta',(await said()).includes('die'),(await said()).slice(-4).join(' '));
  await E(`clearInterval(__iv);0`);
  console.log(R.join('\n'));console.log('ERR',JSON.stringify(errs.slice(0,12)));await b.close()})();
