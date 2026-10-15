// Il Golem di Muschio rifatto nella copia di prova del gioco (anteprime/mk_golem2.py --test → tests/golem2_test.html): entra nella stanza
// del Golem (arena 1, stanza 10), guarda l'entrata (la statua che si risveglia), lascia combattere (eroe che non muore ma tira davvero e
// viene colpito), controlla che passino tutte le mosse e i loro pericoli, porta il Golem a metà vita (la furia, gli spallacci che
// diventano massi, il Raggio del Cuore), poi lo sconfigge e guarda la sconfitta fino alla stanza ripulita. Foto tests/g2_<momento>.png.
// Uso: python3 anteprime/mk_golem2.py --test [--stub] && node tests/golem2gioco.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,handSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'golem2_test.html'));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x?'  '+x:''));
  const shot=n=>p.screenshot({path:path.join(__dirname,`g2_${n}.png`)});
  ok('modello nuovo al posto del vecchio',await E(`G2ON&&N3.golem===N3.golem2&&N3.meta.golem.an.includes('fault')`));
  // every clip of its voice, written down (as in tests/boss3voci.js)
  await E(`initAudio();AU.on.music=false;audioSettings();window.__vl=[];{const _p=B3VO.play;B3VO.play=function(t,k){const d=_p.apply(this,arguments);if(t==='golem')__vl.push(k+(d?'':'(muto)'));return d}}0`);
  const said=async()=>JSON.parse(await E(`JSON.stringify(__vl)`));
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);AU.on.music=false;startRun();0`);await p.waitForTimeout(700);
  await E(`G.arena=0;G.chapter=ARENAS[0].ch;G.diff=ARENAS[0].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;P.inv=0;P.hp=P.maxhp=1e7;buildRoom();window.__st={};window.__hz={};0`);
  // the entrance
  const in0=JSON.parse(await E(`(()=>{const e=G.enemies.find(q=>q.type==='golem');return JSON.stringify({b:!!e,st:e&&e.st,m:e&&n3Move(e),intro:e&&e.intro})})()`));
  ok('entrata: statua che si risveglia',in0.b&&in0.m&&in0.m[0]==='enter',JSON.stringify(in0));
  await p.waitForTimeout(1300);await shot('entrata1');await p.waitForTimeout(1300);await shot('entrata2');await p.waitForTimeout(900);
  const in1=JSON.parse(await E(`(()=>{const e=G.enemies.find(q=>q.type==='golem');return JSON.stringify({st:e.st,intro:e.intro,em:e.em})})()`));
  ok('dopo l\'entrata cammina',in1.intro<=0&&['walk','leap'].includes(in1.st),JSON.stringify(in1));
  ok('voce: il ruggito dell\'entrata',(await said()).includes('cry'),(await said()).join(' '));
  // the fight: note the states and the dangers every 100 ms; the hero stays at the bottom and shoots
  await E(`window.__iv=setInterval(()=>{const e=G.enemies.find(q=>q.type==='golem');if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}P.hp=P.maxhp;if(!e)return;__st[e.st]=(__st[e.st]||0)+1;
    const B=G.g2||{},H=__hz,mx=(k,v)=>H[k]=Math.max(H[k]||0,v);mx('cerchi',(B.warn||[]).length);mx('lastre',(B.slabs||[]).length);mx('massi_in_volo',(B.chunks||[]).length);mx('faglie',(B.faults||[]).length);mx('zanne',(B.fangs||[]).length);
    mx('massi_a_terra',G.rocks.filter(k=>k.g2).length);mx('onde',G.waves.length);if(B.lane)mx('striscia',1);if(B.beam&&B.beam.fire)mx('raggio',1);mx('schegge',G.eproj.filter(q=>q.kind==='stone').length);
    if(e.hp<e.max*.55&&!window.__half)e.hp=e.max*.9},100);0`);
  for(let i=0;i<5;i++){await p.waitForTimeout(4200);await shot('lotta'+(i+1));if(i===1)await E(`P.inv=0;P.dashT=0;hurtP(5);window.__tpw=1;0`)}
  let st=JSON.parse(await E(`JSON.stringify({st:__st,hz:__hz})`));
  const want=['leap','stuck','throw','fault','curl','roll','unroll'],seen=want.filter(m=>st.st[m]);ok('mosse della fase 1',seen.length===want.length,seen.join(', ')+(seen.length<want.length?' · mancano: '+want.filter(m=>!st.st[m]).join(', '):''));
  R.push('     pericoli (massimo insieme): '+JSON.stringify(st.hz));
  {const v=await said(),cs=['c_leap','c_throw','c_fault','c_roll'].filter(c=>v.includes(c));ok('voce: un verso per mossa e la presa in giro',cs.length>=3&&v.includes('laugh')&&st.st.taunt,`${cs.join(', ')} · ${v.filter(x=>/laugh/.test(x)).join(', ')} · gesto ${st.st.taunt||0}`)}
  // half health: the rage, then the beam
  await E(`window.__half=1;window.__st={};{const e=G.enemies.find(q=>q.type==='golem');if(e){e.hp=e.max*.49}}0`);
  for(let i=0;i<20;i++){await p.waitForTimeout(250);if(await E(`(()=>{const e=G.enemies.find(q=>q.type==='golem');return e&&e.st==='rage'})()`))break}
  await p.waitForTimeout(900);await shot('furia');
  for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await E(`!!(G.g2&&G.g2.beam&&G.g2.beam.fire)`)){await shot('raggio');break}}
  await p.waitForTimeout(9000);await shot('fase2');
  st=JSON.parse(await E(`JSON.stringify({st:__st,hz:__hz,p2:!!(G.enemies.find(q=>q.type==='golem')||{}).p2,sassi:G.rocks.filter(k=>k.g2).length})`));
  ok('fase 2: furia e Raggio del Cuore',st.p2&&st.st.rage&&st.st.beam&&st.hz.raggio,JSON.stringify(st.st));
  ok('voce: la rabbia e il verso del Raggio',(await said()).includes('angry')&&(await said()).includes('c_beam'),'');
  // drawing time of the room with the Golem
  const ms=JSON.parse(await E(`(()=>{const T=[];for(let i=0;i<40;i++){const t0=performance.now();render();T.push(performance.now()-t0)}T.sort((a,b)=>a-b);return JSON.stringify({med:+T[20].toFixed(2)})})()`));
  R.push(`     disegno della stanza (mediana di 40): ${ms.med} ms`);
  // the defeat
  await E(`window.__half=0;clearInterval(__iv);window.__iv=setInterval(()=>{if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},100);{const e=G.enemies.find(q=>q.type==='golem');if(e){e.shell=0;e.z=0;hurtE(e,e.hp+10,false)}}0`);
  await p.waitForTimeout(1200);await shot('sconfitta1');await p.waitForTimeout(1600);await shot('sconfitta2');await p.waitForTimeout(3000);
  const fin=JSON.parse(await E(`JSON.stringify({state:G.state,corpses:(G.corpses||[]).length,left:G.enemies.length})`));
  ok('sconfitta e stanza ripulita',fin.left===0&&(fin.state==='cleared'||fin.state==='exit'||fin.corpses===0),JSON.stringify(fin));
  ok('voce: il lamento della sconfitta',(await said()).includes('die'),(await said()).slice(-4).join(' '));
  await E(`clearInterval(__iv);0`);
  console.log(R.join('\n'));console.log('ERR',JSON.stringify(errs.slice(0,12)));await b.close()})();
