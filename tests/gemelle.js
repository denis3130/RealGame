// Il Mimic che esce dalle casse gemelle (42) nel gioco vero, col Mimic rifatto (89-mimic-nuovo.js): stanza ripulita, due casse, l'eroe
// tocca quella cattiva, il Mimic nasce dalla cassa (entrata del modello), combatte 12 s (eroe che non muore, metà in fase 2), poi cade:
// la stanza torna ripulita e la porta si apre; poi la cassa buona in un'altra partita (monete, porta aperta). Conta gli errori.
// Foto tests/gem_<n>.png. Uso: python3 tests/mk.py && node tests/gemelle.js [pagina.html]
const {chromium}=require('playwright');const path=require('path');
const PAGE=process.argv[2]||'test.html';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:700,trBest:700,runs:9,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,PAGE));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:20000});await p.waitForTimeout(800);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`)),W=ms=>p.waitForTimeout(ms);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x!=null?'  '+x:''));
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(q=>q.hidden=true);modal=false;0`);
  // a cleared room of the run, then the twin chests (the bad one is chosen by the test)
  const room=async bad=>{await E(`(()=>{if(!started)startRun();G.room=3;buildRoom();G.enemies.length=0;G.eproj=[];G.state='cleared';G.door=false;G.ccChosen=false;spawnTwinChests();G.cc.forEach((c,i)=>c.bad=i===${bad});
      window.__iv&&clearInterval(__iv);window.__iv=setInterval(()=>{P.hp=P.maxhp;if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},100);P.x=AW/2;P.y=BOT-60;return 0})()`);await W(1200)};
  await room(0);
  ok('due casse cadute',(await J(`G.cc.filter(c=>c.st==='idle').length`))===2);
  await E(`(()=>{const c=G.cc.find(c=>c.bad);P.x=c.x;P.y=c.y+4;return 0})()`);await W(400);
  const ch=await J(`{chosen:!!G.ccChosen,st:G.cc.map(c=>c.st)}`);ok('l\'eroe sceglie la cassa cattiva',ch.chosen&&ch.st.includes('shake'),JSON.stringify(ch));
  await E(`P.x=AW/2;P.y=BOT-60;0`);await W(1600);
  const m0=await J(`(()=>{const e=G.enemies.find(q=>q.type==='mimic');return e?{st:e.st,intro:+(e.intro||0).toFixed(2),nuovo:N3.mimic===N3.mimic2,bar:!$('bossBar').hidden,name:$('bossName').textContent,state:G.state}:null})()`);
  ok('il Mimic rifatto esce dalla cassa',m0&&m0.nuovo&&m0.bar&&m0.state==='play',JSON.stringify(m0));await p.screenshot({path:path.join(__dirname,'gem_1.png')});
  const sts=new Set();for(let i=0;i<30;i++){await W(200);const s=await J(`(()=>{const e=G.enemies.find(q=>q.type==='mimic');return e?e.st:null})()`);if(s)sts.add(s);if(i===15)await E(`(()=>{const e=G.enemies.find(q=>q.type==='mimic');if(e&&!e.p2)e.hp=Math.min(e.hp,e.max*.48);return 0})()`)}
  await p.screenshot({path:path.join(__dirname,'gem_2.png')});ok('combatte (mosse viste)',sts.size>=3,[...sts].join(', '));
  await E(`(()=>{const e=G.enemies.find(q=>q.type==='mimic');if(e)hurtE(e,e.hp+1,false);return 0})()`);
  let end=null;for(let i=0;i<40;i++){await W(250);end=await J(`{state:G.state,door:!!G.door,mimic:G.enemies.filter(q=>q.type==='mimic').length,corpses:(G.corpses||[]).length}`);if(end.state==='cleared'&&end.door)break}
  await p.screenshot({path:path.join(__dirname,'gem_3.png')});ok('sconfitto: stanza ripulita e porta aperta',end.state==='cleared'&&end.door&&!end.mimic,JSON.stringify(end));
  // the good chest
  await room(1);await E(`(()=>{const c=G.cc.find(c=>!c.bad);P.x=c.x;P.y=c.y+4;return 0})()`);await W(400);const c0=await J(`G.coins.length`);await E(`P.x=AW/2;P.y=BOT-60;0`);await W(1500);
  const g=await J(`{coins:G.coins.length,door:!!G.door,mimic:G.enemies.filter(q=>q.type==='mimic').length,state:G.state}`);ok('cassa buona: monete e porta aperta, niente Mimic',c0>0&&g.door&&!g.mimic&&g.state==='cleared',JSON.stringify(Object.assign({c0},g)));
  await E(`window.__iv&&clearInterval(__iv);0`);
  console.log(R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
