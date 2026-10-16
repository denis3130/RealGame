// Le abilità della modalità zombie (anteprime/zombie/abilita.js in partita, src/js/99-abilita-zombie.js nel menu): il salvataggio (lo Scatto
// tuo e in partita, un salvataggio rovinato rimesso a posto), l'Arsenale (i tre posti e le sei abilità, il round che serve, lo sblocco con
// oro e Rottami, il livello, coi posti pieni «al posto di»), il foglio del camposanto con le tre, la partita (tre bottoni coi livelli; lo
// Scatto che porta l'eroe e la ricarica; la Granata che scoppia sullo zombie; il Pupazzo che attira gli zombie ed è nell'ordine degli esseri,
// poi brucia; la Tagliola che prende uno zombie, lo tiene e gli fa male; la Cura, che a salute piena non parte; l'Adrenalina che rende più
// svelti corsa e arma; i tasti 1, 2, 3; il dito sul bottone che non gira la telecamera; una partita nuova con tutto pronto), gli effetti
// ridotti (LOWFX) e quanto costano da disegnare; la sfida del giorno zombie (src/js/100-sfida-zombie.js: il bottone, il foglio, la partita
// coi due guai, le medaglie una volta sola, «Rigioca» che resta nella sfida, «Gioca» che torna normale). Foto in tests/abilita_foto.
// Uso: python3 tests/mk.py && node tests/abilita.js [cartella delle foto]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const OUT=process.argv[2]||path.join(__dirname,'abilita_foto');fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(path.join(__dirname,'test.html')).pipe(r)});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|net::/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(()=>{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:20000,gems:40,introSeen:1,handSeen:1,runs:3,trophies:120,starter:'arciere',modo:'zombie',zRec:5,zN:2,mat:{ess:0,rot:400},
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  const E=c=>p.evaluate(c=>__E(c),c),shot=n=>p.screenshot({path:path.join(OUT,n+'.png')}),Z=f=>p.evaluate(f);
  await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForTimeout(2000);try{await p.click('#sheet .close',{timeout:1200});await p.waitForTimeout(400)}catch(e){}
  // 1. il salvataggio
  let A=await E("JSON.stringify(zab())");ok(A==='{"lv":{"scatto":1},"eq":["scatto",null,null]}','un salvataggio di prima: lo Scatto tuo e in partita '+A);
  A=await E("const k=JSON.stringify(SAVE.z.ab);SAVE.z.ab={lv:{scatto:'x',boh:3,granata:9,cura:-2},eq:['granata','granata','boh','cura']};const r=JSON.stringify(zab());SAVE.z.ab=JSON.parse(k);r");
  {const o=JSON.parse(A);ok(o.lv.scatto===1&&o.lv.granata===5&&Object.keys(o.lv).length===2&&o.eq.join()==='granata,,','un salvataggio rovinato rimesso a posto: '+A)}
  ok(await E("JSON.stringify(saveBlocks(SAVE).zombie.z.ab)")===await E("JSON.stringify(SAVE.z.ab)"),'le abilità stanno nel blocco Zombie del salvataggio');
  // 2. l'Arsenale
  await E("setTab('tabGear')");await p.waitForTimeout(600);
  const n=await Z(()=>document.querySelectorAll('#zabColl .zabc').length),sl=await Z(()=>document.querySelectorAll('#zabSlots .zabS').length);
  ok(n===6&&sl===3,`nell'Arsenale le sei abilità e i tre posti (${n}, ${sl})`);
  await Z(()=>document.querySelector('#zArs .secTitle').scrollIntoView({block:'start'}));await p.waitForTimeout(300);await shot('1_arsenale');
  await p.click('#zabColl [data-zab=pupazzo]');await p.waitForTimeout(400);
  ok(await Z(()=>/round 6/.test(document.getElementById('itemPanel').textContent)&&document.querySelector('#itemPanel [data-zabact=buy]').disabled),'il Pupazzo: «Si sblocca dopo aver superato il round 6», bottone spento');await shot('2_pupazzo');
  await p.click('#itemPanel [data-zabact=close]');await p.waitForTimeout(200);
  await p.click('#zabColl [data-zab=granata]');await p.waitForTimeout(400);await shot('3_granata');
  const g0=await E("SAVE.gold"),r0=await E("SAVE.mat.rot");await p.click('#itemPanel [data-zabact=buy]');await p.waitForTimeout(400);
  A=JSON.parse(await E("JSON.stringify(zab())"));ok(A.lv.granata===1&&A.eq[1]==='granata'&&await E("SAVE.gold")===g0-1000&&await E("SAVE.mat.rot")===r0-15,'sbloccata la Granata: 1.000 oro e 15 Rottami, va nel posto libero');
  await p.click('#itemPanel [data-zabact=up]');await p.waitForTimeout(300);ok(await E("zab().lv.granata")===2&&await E("SAVE.gold")===g0-1400,'migliorata al livello 2 (400 oro)');
  await p.click('#itemPanel [data-zabact=close]');
  await E("SAVE.zRec=12");for(const id of['tagliola','cura','pupazzo','adrenalina'])await E(`zabBuy('${id}')`);
  A=JSON.parse(await E("JSON.stringify(zab())"));ok(A.eq.join()==='scatto,granata,tagliola'&&A.lv.adrenalina===1,'sbloccate tutte: i posti pieni restano '+A.eq.join());
  await E("renderGear()");await p.click('#zabColl [data-zab=pupazzo]');await p.waitForTimeout(300);await p.click('#itemPanel [data-zabact=swap]');await p.waitForTimeout(300);
  ok(await Z(()=>document.querySelectorAll('#itemPanel [data-zabto]').length)===3,'coi posti pieni «Porta in partita» chiede al posto di quale');await shot('4_scambio');
  await p.click('#itemPanel [data-zabto="2"]');await p.waitForTimeout(300);ok(await E("zab().eq.join()")==='scatto,granata,pupazzo','il Pupazzo al posto della Tagliola');
  await p.click('#itemPanel [data-zabact=close]');await p.waitForTimeout(200);await E("renderGear()");await Z(()=>document.querySelector('#zArs .secTitle').scrollIntoView({block:'start'}));await p.waitForTimeout(300);await shot('5_arsenale_pieno');
  // 3. il foglio del camposanto mostra le tre
  await E("setTab('tabPlay')");await p.waitForTimeout(400);await E("openSheet('zombie')");await p.waitForTimeout(500);
  ok(await Z(()=>document.querySelectorAll('#sheet .zabRow .zabMini').length)===3,'il foglio del camposanto: le tre abilità e «Cambia»');await shot('6_foglio');await E("closeSheet()");
  // 4. la partita
  await p.click('#playBtn');await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground&&!document.getElementById('mz').hidden,null,{timeout:90000});
  await p.waitForFunction(()=>__MZ.W.director.R>=1,null,{timeout:30000}).catch(()=>{});await p.waitForTimeout(500);
  const st=await Z(()=>({btn:[...document.querySelectorAll('#mzAb .ab')].map(b=>!b.hidden),nm:document.getElementById('mzAb').classList.contains('nmon'),sl:__MZ.ZM.abil.AB.sl.map(s=>s&&s.id+':'+s.lv+':'+s.cd)}));
  ok(st.btn.join()==='true,true,true'&&st.sl.join()==='scatto:1:0,granata:2:0,pupazzo:1:0'&&st.nm,'in partita tre bottoni coi nomi, i livelli del menu, tutte pronte: '+JSON.stringify(st));await shot('7_partita');
  // lo Scatto
  await Z(()=>{__MZ.W.dbg.noSpawn=true;__MZ.W.dbg.god=true;for(const z of __MZ.W.Z.slice())if(!z.idle)z.die=2});
  const h0=await Z(()=>({x:__MZ.W.hero.x,y:__MZ.W.hero.y}));await Z(()=>__MZ.ZM.abil.use(0));await p.waitForTimeout(150);
  ok(await Z(()=>__MZ.W.hero.dashP!=null&&__MZ.W.director.inv>0),"durante lo scatto la mossa «dash» dell'eroe 3D e niente danni");await shot('8_scatto');await p.waitForTimeout(600);
  const h1=await Z(()=>({x:__MZ.W.hero.x,y:__MZ.W.hero.y,cd:__MZ.ZM.abil.AB.sl[0].cd,dp:__MZ.W.hero.dashP}));const dd=Math.hypot(h1.x-h0.x,h1.y-h0.y);
  ok(dd>40&&h1.cd>3&&h1.dp==null,`lo scatto porta l'eroe (${dd.toFixed(0)} px), poi la ricarica (${h1.cd.toFixed(1)} s)`);
  ok(await Z(()=>!__MZ.ZM.abil.use(0)),'in ricarica non riparte');
  // la Granata
  await Z(()=>{const h=__MZ.W.hero;const i=__MZ.addZombie('zombie',h.x+70,h.y,1);const z=__MZ.W.Z[i];z.hp=z.hp0=400;z.q=1});
  await Z(()=>__MZ.ZM.abil.use(1));await p.waitForTimeout(600);await shot('9_granata');await p.waitForTimeout(900);
  const gz=await Z(()=>{const z=__MZ.W.Z.find(z=>z.hp0===400);return z?{hp:Math.round(z.hp),die:z.die}:{gone:1}});ok(gz.gone||gz.hp<400,'la granata scoppia e fa male allo zombie '+JSON.stringify(gz));
  // il Pupazzo
  await Z(()=>{for(const z of __MZ.W.Z.slice())if(!z.idle)z.die=2});await p.waitForTimeout(200);
  await Z(()=>__MZ.ZM.abil.use(2));await p.waitForTimeout(900);
  const pg=await Z(()=>({goal:!!__MZ.W.goal,things:(__MZ.W.things||[]).length,order:__MZ.order().filter(s=>/^A/.test(s)).length}));ok(pg.goal&&pg.things===1&&pg.order===1,"il pupazzo piantato: gli zombie puntano a lui (W.goal), ed è nell'ordine degli esseri "+JSON.stringify(pg));
  await Z(()=>{const g=__MZ.W.goal;for(let k=0;k<3;k++){const i=__MZ.addZombie('zombie',g[0]+60+k*20,g[1]+40,40);const z=__MZ.W.Z[i];z.hp=z.hp0=999;z.q=1}});await p.waitForTimeout(2500);await shot('10_pupazzo');
  const near=await Z(()=>{const g=__MZ.W.goal;return g?__MZ.W.Z.filter(z=>z.hp0===999&&Math.hypot(z.x-g[0],z.y-g[1])<45).length:-1});ok(near>=1,`gli zombie vanno al pupazzo (${near} vicini)`);
  await p.waitForTimeout(5500);const pz=await Z(()=>({goal:__MZ.W.goal,hurt:__MZ.W.Z.filter(z=>z.hp0===999&&z.hp<999).length,things:(__MZ.W.things||[]).length}));ok(!pz.goal&&pz.hurt>=1&&!pz.things,'alla fine brucia: niente più richiamo, gli zombie vicini si fanno male '+JSON.stringify(pz));
  // la Tagliola, la Cura, l'Adrenalina
  await Z(()=>{__MZ.W.abil=[{id:'tagliola',lv:1},{id:'cura',lv:1},{id:'adrenalina',lv:1}];__MZ.ZM.abil.setup();for(const z of __MZ.W.Z.slice())if(!z.idle)z.die=2});await p.waitForTimeout(300);
  await Z(()=>__MZ.ZM.abil.use(0));await p.waitForTimeout(500);
  await Z(()=>{const t=__MZ.ZM.abil.AB.traps[0];__MZ.W.dbg.noShoot=true;const i=__MZ.addZombie('minatore',t.x+3,t.y+2,30);const z=__MZ.W.Z[i];z.hp=z.hp0=500;z.q=1});
  await p.waitForFunction(()=>__MZ.ZM.abil.AB.traps.some(t=>t.st==='presa'),null,{timeout:8000}).catch(()=>{});await p.waitForTimeout(300);await shot('11_tagliola');
  const tg=await Z(()=>{const t=__MZ.ZM.abil.AB.traps[0];const z=__MZ.W.Z.find(z=>z.hp0===500);return{st:t&&t.st,stun:z&&+z.stun.toFixed(2),hp:z&&Math.round(z.hp)}});ok(tg.st==='presa'&&tg.stun>0&&tg.hp<500,'la tagliola prende lo zombie, lo tiene e gli fa male '+JSON.stringify(tg));
  await Z(()=>{for(const z of __MZ.W.Z.slice())if(!z.idle)z.die=2;__MZ.W.director.hp=30;__MZ.W.dbg.noShoot=false});await p.waitForTimeout(100);const c0=await Z(()=>__MZ.W.director.hp);await Z(()=>__MZ.ZM.abil.use(1));await p.waitForTimeout(250);await shot('12_cura');
  const c1=await Z(()=>__MZ.W.director.hp);ok(c1>=c0+45,`la cura: salute da ${Math.round(c0)} a ${Math.round(c1)}`);
  await Z(()=>{__MZ.W.director.hp=__MZ.W.director.PZ.vita;__MZ.ZM.abil.AB.sl[1].cd=0});ok(await Z(()=>!__MZ.ZM.abil.use(1)),'a salute piena la cura non parte (e non va in ricarica)');
  await Z(()=>__MZ.ZM.abil.use(2));await p.waitForTimeout(400);await shot('13_adrenalina');
  const ad=await Z(()=>({adr:__MZ.ZM.abil.AB.adr,gunK:__MZ.W.mods.gunK,spd:__MZ.W.mods.spd}));ok(ad.adr>6&&ad.gunK>1.3&&ad.spd>1.2,"l'adrenalina: corsa e arma più svelte "+JSON.stringify(ad));
  // i tasti e il dito
  await Z(()=>{for(const s of __MZ.ZM.abil.AB.sl)if(s)s.cd=0;__MZ.W.director.hp=40});await p.keyboard.press('Digit2');await p.waitForTimeout(200);ok(await Z(()=>__MZ.ZM.abil.AB.sl[1].cd>0),'il tasto 2 usa la seconda');
  const v0=await Z(()=>__MZ.view().yaw);const bb=await Z(()=>{const r=document.querySelectorAll('#mzAb .ab')[0].getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
  await Z(()=>{for(const s of __MZ.ZM.abil.AB.sl)if(s)s.cd=0});await p.mouse.move(bb[0],bb[1]);await p.mouse.down();await p.mouse.move(bb[0]-60,bb[1]-10,{steps:5});await p.mouse.up();await p.waitForTimeout(200);
  const tb=await Z(()=>({cd:__MZ.ZM.abil.AB.sl[0].cd,yaw:__MZ.view().yaw}));ok(tb.cd>0&&Math.abs(tb.yaw-v0)<.5,"il dito sul bottone usa l'abilità e non gira la telecamera");
  // 5. gli effetti ridotti e il costo del disegno (tre tagliole, due granate, un pupazzo; il mondo fermo)
  const ms=await Z(()=>{const W=__MZ.W,A=__MZ.ZM.abil;W.abil=[{id:'tagliola',lv:5},{id:'granata',lv:5},{id:'pupazzo',lv:5}];A.setup();W.dbg.freeze=true;const t=()=>{const t0=performance.now();for(let i=0;i<30;i++)__MZ.render(0);return(performance.now()-t0)/30};
    const base=t();const h=W.hero;for(let i=0;i<3;i++){A.AB.sl[0].cd=0;A.use(0);h.x+=24}h.x-=72;A.AB.sl[1].cd=0;A.use(1);A.AB.sl[1].cd=0;A.use(1);A.AB.sl[2].cd=0;A.use(2);W.dbg.freeze=false;return base});
  // (i tempi delle parti del fotogramma dove si disegnano, W.dbg.tm: a terra con le luci e gli effetti in alto; a turno, cinque fotogrammi
  // senza e cinque con, sei volte, perché la macchina di prova cambia velocità da un momento all'altro; il pupazzo a parte, da solo)
  await p.waitForTimeout(700);const ms2=await Z(()=>{const W=__MZ.W,A=__MZ.ZM.abil.AB;W.dbg.freeze=true;for(const g of A.gren)g.fuse=99;const keep={traps:A.traps,gren:A.gren},part=['w.nuvole_luci','w.effetti'];let a=0,b=0;
    const run=()=>{W.dbg.tm={};for(let i=0;i<5;i++)__MZ.render(0);const tm=W.dbg.tm;W.dbg.tm=null;return part.reduce((s,k)=>s+(tm[k]||0),0)};
    for(let k=0;k<6;k++){A.traps=[];A.gren=[];__MZ.render(0);a+=run();Object.assign(A,keep);__MZ.render(0);b+=run()}
    const o=A.dolls[0];let d=0;if(o){const t=performance.now();for(let i=0;i<40;i++)W.drawThing(o);d=(performance.now()-t)/40}return[a/30,b/30,d]});
  console.log(`   disegno (terra e effetti): ${ms2[0].toFixed(2)} ms senza, ${ms2[1].toFixed(2)} ms con tre tagliole e due granate; il pupazzo ${ms2[2].toFixed(2)} ms`);ok(ms2[1]-ms2[0]<3&&ms2[2]<1.5,'le abilità costano poco da disegnare');await shot('14_tutte');
  // 6. una partita nuova: tutto pronto, niente in giro
  await Z(()=>__MZ.nuova());await p.waitForTimeout(400);const rs=await Z(()=>({cd:__MZ.ZM.abil.AB.sl.map(s=>s&&s.cd),tr:__MZ.ZM.abil.AB.traps.length,gr:__MZ.ZM.abil.AB.gren.length,goal:__MZ.W.goal,adr:__MZ.ZM.abil.AB.adr,th:(__MZ.W.things||[]).length}));
  ok(rs.cd.every(c=>!c)&&!rs.tr&&!rs.gr&&!rs.goal&&!rs.adr&&!rs.th,'una partita nuova: tutte pronte, niente in giro '+JSON.stringify(rs));
  // 7. la sfida del giorno zombie: il bottone, il foglio (un aiuto e un guaio, tre medaglie, la classifica), la partita coi guai, la fine
  await Z(()=>__MZ.W.director.abbandona());await p.waitForTimeout(900);await p.click('#mzPartita .fine [data-a=menu]');await p.waitForTimeout(1500);await E("if(!$('sheetScr').hidden)closeSheet()");await p.waitForTimeout(400);
  ok(await Z(()=>{const b=document.getElementById('zChalBtn');return!!b&&!b.classList.contains('zoff')&&!document.getElementById('zChalBang').hidden}),'nel menu Zombie il bottone «Sfida» col punto esclamativo');
  await p.click('#zChalBtn');await p.waitForTimeout(500);await shot('15_sfida');
  const sh=await Z(()=>({mods:document.querySelectorAll('#sheet .cmod').length,good:document.querySelectorAll('#sheet .cmod.good').length,tiers:document.querySelectorAll('#sheet .tier').length,board:document.querySelectorAll('#sheet .brow').length,go:!!document.querySelector('#sheet [data-zchal]')}));
  ok(sh.mods===2&&sh.good===1&&sh.tiers===3&&sh.board===9&&sh.go,'il foglio: un aiuto e un guaio, tre medaglie, nove rivali, «Gioca la sfida» '+JSON.stringify(sh));
  const T=await E("JSON.stringify(zchalToday())");ok(T===await E("JSON.stringify(zchalToday())"),'la sfida di oggi è sempre la stessa '+T);
  const g1=await E("SAVE.gold"),r1=await E("SAVE.mat.rot");await p.click('#sheet [data-zchal]');
  await p.waitForFunction(()=>window.__MZ&&!document.getElementById('mz').hidden&&__MZ.W.chal,null,{timeout:60000});await p.waitForTimeout(1500);
  const ch=await Z(()=>({mods:__MZ.W.chal.mods,line:document.getElementById('mzChal').textContent,hidden:document.getElementById('mzChal').hidden}));
  ok(ch.mods.length===2&&!ch.hidden&&/Sfida del giorno/.test(ch.line),'in partita la riga della sfida sotto la salute: '+ch.line);await shot('16_sfida_partita');
  await Z(()=>{__MZ.W.director.R=8;__MZ.W.kills=77;__MZ.W.director.abbandona()});await p.waitForTimeout(1200);await shot('17_sfida_fine');
  const en=await Z(()=>({txt:(document.querySelector('#mzPartita .fine .zchEnd')||{}).textContent||'',z:__E('JSON.stringify(SAVE.zchal)')}));const ZC=JSON.parse(en.z);
  ok(ZC.best===8&&ZC.tiers[0]&&ZC.tiers[1]&&!ZC.tiers[2]&&/Medaglia Bronzo/.test(en.txt)&&/Medaglia Argento/.test(en.txt),'arrivato al round 8: medaglie di bronzo e d\'argento, scritte alla fine '+en.txt);
  ok(await E("SAVE.mat.rot")>=r1+30,'la medaglia d\'argento dà 30 Rottami');
  await Z(()=>{document.querySelector('#mzPartita .fine [data-a=ancora]').click()});await p.waitForTimeout(800);ok(await Z(()=>!!__MZ.W.chal),'«Rigioca» resta nella sfida');
  await Z(()=>{__MZ.W.director.R=8;__MZ.W.director.abbandona()});await p.waitForTimeout(1000);ok(await Z(()=>!document.querySelector('#mzPartita .fine .zchEnd em')||!/Medaglia/.test(document.querySelector('#mzPartita .fine .zchEnd').textContent)),'le medaglie prese non si danno due volte');
  ok(await E("saveBlocks(SAVE).zombie.zchal&&saveBlocks(SAVE).zombie.zchal.best")===8,'la sfida sta nel blocco Zombie del salvataggio');
  await p.click('#mzPartita .fine [data-a=menu]');await p.waitForTimeout(1200);await E("if(!$('sheetScr').hidden)closeSheet()");await p.waitForTimeout(400);await p.click('#playBtn');await p.waitForFunction(()=>!document.getElementById('mz').hidden,null,{timeout:60000});await p.waitForTimeout(800);
  ok(await Z(()=>!__MZ.W.chal&&document.getElementById('mzChal').hidden),'«Gioca» di nuovo: una partita normale, senza la sfida');
  console.log('errori:',errs.length?errs.slice(0,6):'nessuno');if(errs.length)fails++;
  await b.close();srv.close();console.log(fails?`${fails} FAIL`:'tutto ok');process.exit(fails?1:0)})();
