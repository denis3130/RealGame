// Prova della Classica nuova (src/js/94-classica-nuova.js, solo nell'anteprima): la mappa del mondo con le stelle e i bracieri, la Torre, la
// Corsa e le reliquie nel menu; ogni stanza con un obiettivo (resisti, totem, pavimento che sale, scrigno a tempo, lanterna) con il suo premio;
// la stanza élite con la reliquia; le quattro fusioni e gli effetti delle reliquie senza errori; una partita intera di un giocatore automatico
// (i bivi scelti a giro) fino alla vittoria con le stelle; la Torre fino al piano 20; la Corsa dei boss da un custode all'altro.
// Foto tests/cn_<n>.png. Uso: python3 anteprime/mk_classica.py --test && node tests/classica.js [solo]
const {chromium}=require('playwright');const path=require('path');
const SOLO=process.argv[2]||'';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,240))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1500,gems:60,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},
    items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'classica_test.html'));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1200);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`)),W=ms=>p.waitForTimeout(ms);const R=[];const ok=(n,c,x)=>{R.push((c?'OK   ':'NO   ')+n+(x!=null?'  '+x:''));console.log(R[R.length-1])};
  let shot=0;const snap=async n=>{await p.screenshot({path:path.join(__dirname,`cn_${String(++shot).padStart(2,'0')}_${n}.png`)})};
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(q=>q.hidden=true);modal=false;0`);
  // an automatic player inside the page: god mode, kills, doors, chests, choices (the route doors picked in turn)
  await E(`(()=>{window.__A={on:false,god:true,kill:true,spd:4,door:0,log:[],ends:[]};setInterval(()=>{const A=__A;if(!A.on)return;try{
    if(!$('cnRoute').hidden){const d=[...document.querySelectorAll('#cnRoute .cnDoor')];if(d.length){const k=A.door++%d.length;A.log.push('strada '+d[k].querySelector('b').textContent);d[k].click()}return}
    if(!$('cnRel').hidden){const c=document.querySelector('#cnRel .cnRelC');A.log.push('reliquia '+c.querySelector('b').textContent);c.click();return}
    if(!$('skScr').hidden){if(skMode==='shop')closeSkills();else pick(0);return}
    if(!$('revScr').hidden){$('rvNo').click();return}
    if(!$('endScr').hidden){if(!A.endSeen){A.endSeen=1;A.ends.push({tag:$('endTag').textContent,title:$('endTitle').textContent,text:$('endText').textContent})}return}
    if(!started||paused||modal)return;if(A.god)P.hp=P.maxhp;
    for(let k=0;k<A.spd;k++){if(!started||paused||modal)break;if(G.hitstop>0)G.hitstop=0;update(.033)}
    if(A.stopOnClear&&G.state==='cleared'){A.on=false;return}
    if(G.state==='play'&&A.kill){A.kt=(A.kt||0)+1;if(A.kt%6===0){const e=G.enemies.find(e=>canHit(e));if(e)hurtE(e,e.hp+1,false)}}
    if(G.cc&&!G.ccChosen&&G.state==='cleared'){const c=G.cc.find(c=>c.st==='idle'&&!c.bad);if(c){P.x=c.x;P.y=c.y+4}}
    if(G.prop&&!G.prop.used&&G.state==='cleared'){P.x=G.prop.x;P.y=G.prop.y+30}
    if(G.goldRun){const c=G.coins[0];if(c){P.x=c.x;P.y=c.y}}
    if(G.state==='cleared'&&G.door&&!G.goldRun&&(!G.cc||G.ccChosen||!G.cc.some(c=>c.st==='idle'))){P.x=AW/2;P.y=TOP-20}
  }catch(e){A.log.push('ERR '+e.message)}},16)})();0`);
  const toMenu=async()=>{await E(`(()=>{__A.on=false;$('endScr').hidden=true;['cnRoute','cnRel','cnMap','skScr'].forEach(i=>$(i)&&($(i).hidden=true));modal=false;paused=false;if(G&&!G.ended&&started){G.ended=true;started=false}showMenu();return 0})()`);await W(600)};
  const run=async(maxS,stop)=>{const t0=Date.now();while(Date.now()-t0<maxS*1000){await W(400);const s=await J(`({end:!$('endScr').hidden,room:G.room,ev:G.event,st:G.state})`);if(s.end||(stop&&await E(stop)))return s}return null};

  // ---------------------------------------------------------------- the menu: card, map, tower, rush, relics
  if(!SOLO||SOLO==='menu'){
    const card=await J(`({t:$('chapCard').textContent,stars:$('chapCard').querySelectorAll('.cnCkS b').length})`);ok('la scheda dell\'arena ha le stelle e porta alla mappa',card.stars===3&&/Mappa/.test(card.t),card.t.slice(0,80));
    await p.click('#chapCard');await W(500);
    const m=await J(`({open:!$('cnMap').hidden,nodes:document.querySelectorAll('#cnMap .cnN').length,lock:document.querySelectorAll('#cnMap .cnN.lock').length,br:document.querySelectorAll('#cnMap .cnBr').length})`);
    ok('la mappa: 12 arene, 11 chiuse, 12 bracieri',m.open&&m.nodes===12&&m.lock===11&&m.br===12,JSON.stringify(m));await snap('mappa');
    await p.click('#cnMap .cnN[data-a="3"]');await W(300);ok('un\'arena chiusa dice come aprirla',await E(`!!document.querySelector('#cnMap .cnLockP')&&!document.querySelector('#cnMap .cnPlay')`));
    await p.click('#cnMap .cnAll input');await W(300);ok('«apri tutte le arene» (solo anteprima)',await E(`document.querySelectorAll('#cnMap .cnN.lock').length===0&&!!document.querySelector('#cnMap .cnPlay')`));await snap('mappa_aperta');
    await p.click('#cnMap .cnMode[data-sub="tower"]');await W(300);const tw=await J(`({mods:document.querySelectorAll('#cnMap .cnMods li').length,board:document.querySelectorAll('#cnMap .cnBoard li').length})`);ok('la Torre: tre regole, classifica',tw.mods===3&&tw.board>=9,JSON.stringify(tw));await snap('torre');
    await p.click('#cnMap .cnX');await W(200);await p.click('#cnMap .cnMode[data-sub="rush"]');await W(300);ok('la Corsa: dodici custodi',await E(`document.querySelectorAll('#cnMap .cnRush li.ok').length===12`));await snap('corsa');
    await p.click('#cnMap .cnX');await W(200);await p.click('#cnMap .cnMode[data-sub="rel"]');await W(300);ok('le reliquie: dodici, nessuna trovata',await E(`document.querySelectorAll('#cnMap .cnRelB.no').length===12`));await snap('reliquie');
    await p.click('#cnMap .cnX');await W(200);await p.click('#cnMap .cnAll input');await W(200);await p.click('#cnMap .cnX');await W(300);
  }
  // ---------------------------------------------------------------- the rooms with an objective, one by one
  const room=async(o,secs,name)=>{await E(`(()=>{if(!started){SAVE.cn.pick=0;startRun()}document.querySelectorAll('#skScr,#cnRoute,#cnRel').forEach(q=>q.hidden=true);modal=false;paused=false;G.state='play';G.room=Math.max(1,${o.room}-1);G.event=null;cnRouteApply(${JSON.stringify(o)});G.state='play';G.fade=0;return 0})()`);
    await W(300);await snap(name+'_a');await E(`__A.on=true;__A.stopOnClear=true;__A.kill=${o.k==='obj'&&o.obj==='resisti'?'false':'true'};0`);const t0=Date.now();let seen=null;
    while(Date.now()-t0<secs*1000){await W(300);const s=await J(`({st:G.state,hud:($('cnHud')||{}).textContent||'',sk:!$('skScr').hidden,rel:!$('cnRel').hidden,tag:$('skTag').textContent})`);if(!seen&&s.hud)seen=s.hud;if(s.st==='cleared')break}
    await E(`__A.on=false;__A.stopOnClear=false;0`);return seen};
  if(!SOLO||SOLO==='obj'){
    for(const k of['resisti','totem','lava','scrigno','proteggi']){
      await E(`__A.on=false;0`);
      const hud=await room({k:'obj',room:4,obj:k},k==='resisti'?40:25,'obj_'+k);await W(900);
      const s=await J(`({st:G.state,paid:!!(G.cnObj&&G.cnObj.paid),win:!!(G.cnObj&&G.cnObj.win),sk:!$('skScr').hidden,tag:$('skTag').textContent,lost:!!(G.cnObj&&G.cnObj.lost)})`);
      await snap('obj_'+k+'_b');
      ok(`obiettivo «${k}»: la stanza si chiude e dà il premio (o lo perde)`,s.st==='cleared'&&(s.paid&&s.sk||s.lost),JSON.stringify(Object.assign({hud},s)));
      await E(`(()=>{if(!$('skScr').hidden)pick(0);return 0})()`);await W(200)}
    // the resisti room lasts 30 seconds even if you kill everything
    await room({k:'obj',room:3,obj:'resisti'},4,'resisti_corto');const rs=await J(`({st:G.state,left:G.cnObj.left})`);ok('«Resisti» non si chiude prima del tempo',rs.st==='play'&&rs.left>0,JSON.stringify(rs));
    await E(`__A.on=false;0`);
  }
  // ---------------------------------------------------------------- the elite room and its relic
  if(!SOLO||SOLO==='elite'){
    await room({k:'elite',room:3},20,'elite');for(let i=0;i<30&&!(await E(`!$('cnRel').hidden`));i++){await E(`(()=>{if(!$('skScr').hidden)pick(0);return 0})()`);await W(250)}const s=await J(`({rel:!$('cnRel').hidden,n:document.querySelectorAll('#cnRel .cnRelC').length,el:G.enemies.filter(e=>e.elite).length})`);
    await snap('reliquia');ok('élite: due nemici élite, poi la scelta della reliquia',s.rel&&s.n===2,JSON.stringify(s));
    await p.click('#cnRel .cnRelC');await W(300);const r=await J(`({run:G.relics,col:SAVE.cn.relics})`);ok('la reliquia è tua e entra nella collezione',r.run.length===1&&r.col[r.run[0]]===1,JSON.stringify(r));
  }
  // ---------------------------------------------------------------- fusions and relic effects
  if(!SOLO||SOLO==='fusioni'){
    await E(`(()=>{if(!started){SAVE.cn.pick=0;startRun()}for(const id of['fire','braci'])if(!P.skills[id]){const s=SK.find(q=>q.id===id);s.f();P.skills[id]=1}openSkills('level');return 0})()`);await W(400);
    const f=await J(`({first:offer[0]&&offer[0].id,tag:(document.querySelector('#skList .sk .evotag')||{}).textContent})`);await snap('fusione');ok('con fuoco e braci la prima carta è la fusione «Inferno»',f.first==='fu_inferno'&&/FUSIONE/.test(f.tag||''),JSON.stringify(f));
    await E(`pick(0);0`);await W(300);
    await E(`(()=>{for(const id of['ice','brina','fu_bufera','poison','spore','fu_peste','light','statica','fu_tempesta']){const s=SK.find(q=>q.id===id);if(!P.skills[id]){s.f();P.skills[id]=1}}
      for(const r of CN_REL)if(!G.relics.includes(r.id)){r.f();G.relics.push(r.id)}G.room=6;G.event=null;buildRoom();G.state='play';return 0})()`);
    await E(`__A.on=true;__A.kill=false;0`);
    for(let i=0;i<12;i++){await W(500);await E(`(()=>{if(started&&!paused&&!modal&&G.state==='play'){P.dashCd=0;dash()}return 0})()`).catch(()=>{})}
    const fx=await J(`({fx:CN.fx.length,kinds:[...new Set(CN.fx.map(f=>f.k))],frozen:G.enemies.filter(e=>e.frozen>0).length,psn:G.enemies.filter(e=>e.poisonT>0).length,state:G.state,err:__A.log.filter(l=>/ERR/.test(l))})`);
    await snap('effetti');ok('fusioni e reliquie insieme per 6 secondi senza errori',!fx.err.length,JSON.stringify(fx));
    await E(`__A.on=false;0`);
  }
  // ---------------------------------------------------------------- a whole run, the route chosen in turn, up to the win and its stars
  if(!SOLO||SOLO==='partita'){
    await toMenu();await E(`(()=>{SAVE.cn.pick=0;__A.door=0;__A.endSeen=0;__A.ends=[];__A.log=[];startRun();__A.on=true;__A.kill=true;return 0})()`);
    const end=await run(240);await W(1500);const a=await J(`({ends:__A.ends,log:__A.log.slice(0,60),stars:SAVE.cn.stars,etr:$('eTr').textContent.replace(/\\s+/g,' ').slice(0,200),lit:!!document.querySelector('#eTr .cnLitL')})`);
    await snap('vittoria');
    ok('una partita intera con i bivi fino alla vittoria',end&&end.end&&a.ends.length&&a.ends[0].title==='VITTORIA',JSON.stringify(a.ends[0]||end));
    ok('le stelle dell\'arena 1 e il braciere acceso',(a.stars[0]&1)===1&&a.lit,JSON.stringify({stars:a.stars,etr:a.etr}));
    console.log('     strade e reliquie: '+a.log.filter(l=>/strada|reliquia/.test(l)).join(' | '));
    await toMenu();await W(700);const card=await J(`$('chapCard').textContent`);ok('la scheda dopo la vittoria propone l\'arena 2',/Arena 2/.test(card),card.slice(0,60));
  }
  // ---------------------------------------------------------------- the tower
  if(!SOLO||SOLO==='torre'){
    await toMenu();const inf0=await J(`SAVE.inf`);
    await E(`(()=>{CN.next='tower';__A.endSeen=0;__A.ends=[];__A.log=[];goPlay('arena');return 0})()`);await W(2600);
    const t=await J(`({mode:G.mode,mods:(G.tower&&G.tower.mods||[]).map(m=>m.id),last:G.seq[G.seq.length-1],room:G.room,ban:$('banner').textContent})`);await snap('torre_piano1');
    ok('la Torre: Abisso con tre regole della settimana, fino al piano 20',t.mode==='inf'&&t.mods.length===3&&t.last.c===20,JSON.stringify(t));
    // straight to floor 19, then the automatic player climbs the last two
    await E(`(()=>{const k=G.seq.findIndex(s=>s.c===19);G.si=k;G.room=19;G.event=null;buildRoom();__A.on=true;__A.kill=true;return 0})()`);
    const end=await run(120);await W(800);const tt=await J(`({ends:__A.ends,inf:SAVE.inf,tower:SAVE.cn.tower})`);await snap('torre_fine');
    ok('in cima alla Torre: «Torre conquistata», il record della settimana, l\'Abisso intatto',tt.ends[0]&&tt.ends[0].title==='TORRE CONQUISTATA'&&tt.tower.best===20&&JSON.stringify(tt.inf)===JSON.stringify(inf0),JSON.stringify(tt.ends[0]));
  }
  // ---------------------------------------------------------------- the boss rush
  if(!SOLO||SOLO==='corsa'){
    await toMenu();const tr0=await J(`({t:SAVE.trophies,b:SAVE.bestA})`);
    await E(`(()=>{SAVE.cn.all=true;CN.next='rush';__A.endSeen=0;__A.ends=[];__A.log=[];goPlay('arena');return 0})()`);await W(2600);
    const r0=await J(`({list:G.rush&&G.rush.list.length,room:G.room,boss:G.enemies.filter(e=>isBoss(e.type)).map(e=>e.type)})`);await snap('corsa_1');
    ok('la Corsa parte dal primo custode',r0.list===12&&r0.room===10&&r0.boss[0]==='golem',JSON.stringify(r0));
    await E(`__A.on=true;__A.kill=true;0`);
    const t0=Date.now();let seen=new Set();while(Date.now()-t0<150000){await W(500);const s=await J(`({i:G.rush?G.rush.i:-1,b:G.enemies.filter(e=>isBoss(e.type)).map(e=>e.type)[0]||'',end:!$('endScr').hidden})`);if(s.b)seen.add(s.b);if(s.i>=3||s.end)break}
    const r1=await J(`({i:G.rush.i,beat:G.rush.beat})`);await snap('corsa_4');ok('da un custode all\'altro (4 custodi di fila)',r1.i>=3&&seen.size>=3,JSON.stringify(Object.assign({visti:[...seen]},r1)));
    await E(`(()=>{__A.on=false;endRun(false);return 0})()`);await W(500);const r2=await J(`({tag:$('endTag').textContent,text:$('endText').textContent,best:SAVE.cn.rush.best,t:SAVE.trophies,b:SAVE.bestA})`);await snap('corsa_fine');
    ok('la fine della Corsa: record e niente coppe o record d\'arena cambiati',r2.tag==='Corsa dei boss'&&r2.best>=3&&r2.t===tr0.t&&JSON.stringify(r2.b)===JSON.stringify(tr0.b),JSON.stringify(r2));
  }
  console.log('\n'+R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
