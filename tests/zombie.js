// La modalità zombie nel gioco vero (src/js/63-zombie.js): il passaggio al menu Zombie scorrendo (la manina in alto a destra; la scelta
// resta dopo aver riaperto il gioco, src/js/67-menu-modi.js), la scheda e il foglio del camposanto, «Gioca» che porta sulla mappa (il menu sparisce, la musica tace, l'eroe è
// l'Arciere 3D con l'arma), la pausa (mondo fermo, Esc, effetti, esci con conferma), l'oro dato una volta sola a fine partita col record e il
// conto delle partite, «Rigioca» che rimette tutto com'era (monete, cancello chiuso, Bara al suo posto, zombie dell'aia, lanterna, round), la
// caduta e «Menu» (il menu torna con la sua musica, l'inclinazione dei personaggi torna quella di prima), e la Classica che parte ancora.
// Uso: python3 tests/mk.py && node tests/zombie.js [cartella delle foto]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
// the page comes from a small local http server: opened as file:// the test browser sometimes reopens it with an empty localStorage
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(path.join(__dirname,'test.html')).pipe(r)});
const OUT=process.argv[2]||path.join(__dirname,'zombie_foto');fs.mkdirSync(OUT,{recursive:true});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|net::/.test(m.text()))errs.push(m.text())});
  await p.addInitScript(()=>{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3,trophies:120,
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  const E=c=>p.evaluate(c=>__E(c),c),shot=n=>p.screenshot({path:path.join(OUT,n+'.png')});
  const open=async()=>{await p.goto('http://127.0.0.1:'+srv.address().port+'/test.html');await p.waitForTimeout(1800);try{await p.click('#sheet .close',{timeout:1200});await p.waitForTimeout(500)}catch(e){}};
  await open();
  // 1. il passaggio tra i due menu (punto 44): nella Classica la manina zombie in alto a destra con «Nuovo!»; uno scorrimento in mezzo alla
  // schermata porta al menu Zombie (il falò), la scelta resta riaprendo il gioco
  ok(await p.evaluate(()=>{const h=document.getElementById('zHand');return!!h&&!h.hidden&&!!h.querySelector('.nw')&&document.getElementById('cSprout').hidden&&!document.getElementById('menu').classList.contains('zmode')}),'nella Classica la manina zombie in alto a destra, con «Nuovo!»');
  await p.mouse.move(300,330);await p.mouse.down();for(let i=1;i<=8;i++)await p.mouse.move(300-i*20,332);await p.mouse.up();
  await p.waitForFunction(()=>__E('!MM.tr'),null,{timeout:10000});await p.waitForTimeout(400);await shot('1_zombie');
  ok(await E("SAVE.modo")==='zombie'&&/Camposanto dei Corvi/.test(await p.textContent('#chapCard'))&&await E("$('menu').classList.contains('zmode')&&!$('tabPlay').hidden"),'scorrendo si passa al menu Zombie: il falò, la scheda del Camposanto dei Corvi (resta la pagina Gioca)');
  await open();ok(await E("SAVE.modo")==='zombie'&&await p.evaluate(()=>!document.getElementById('cSprout').hidden&&document.getElementById('zHand').hidden),'riaprendo il gioco la Zombie resta scelta (col germoglio per tornare alla Classica)');
  // 2. la scheda apre il foglio con le regole e il bottone per entrare
  await p.click('#chapCard');await p.waitForTimeout(700);ok(/Modalità Zombie/.test(await p.textContent('#sheet'))&&!!(await p.$('#sheet [data-zplay]')),'la scheda apre il foglio del camposanto');await shot('2_foglio');
  await p.click('#sheet .close');await p.waitForTimeout(400);
  // 3. Gioca: il camposanto (la prima volta si costruisce), il menu sparisce, la musica tace, l'eroe è l'Arciere 3D
  // (un'inclinazione dei personaggi diversa da quella della mappa: uscendo deve tornare proprio questa)
  await E("CR.cam.k=.61");const crCam0=await E("JSON.stringify(CR.cam)"),g0=await E("SAVE.gold");
  await p.click('#playBtn');await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground&&!document.getElementById('mz').hidden,null,{timeout:60000});await p.waitForTimeout(4200);await shot('3_mappa');
  const s3=await p.evaluate(()=>({menu:document.getElementById('menu').hidden,on:__E('ZG.on'),music:__E('AU.cur?AU.cur.name:null'),R:__MZ.W.director.R,st:__MZ.W.director.st,coins:__MZ.W.coins,muzzle:!!__MZ.W.muzzle,bar:getComputedStyle(document.getElementById('mzBar')).display,pz:!!document.getElementById('mzPz')}));
  ok(s3.menu&&s3.on&&s3.music===null,'Gioca porta sulla mappa: menu nascosto, musica del menu spenta');
  ok(s3.R===1&&s3.st==='round'&&s3.coins===500,`la partita parte: round ${s3.R}, ${s3.coins} monete`);
  ok(s3.muzzle&&s3.bar==='none'&&s3.pz,"l'Arciere 3D con l'arma (bocca dell'arma nota), niente bottoni di prova, il bottone della pausa");
  // 4. la pausa: il mondo si ferma, Esc la chiude, gli effetti si spengono e si riaccendono
  await p.click('#mzPz');await p.waitForTimeout(300);const t1=await p.evaluate(()=>__MZ.W.t);await p.waitForTimeout(600);const t2=await p.evaluate(()=>__MZ.W.t);await shot('4_pausa');
  ok(!(await p.evaluate(()=>document.getElementById('mzPausa').hidden))&&t1===t2,'in pausa il mondo è fermo');
  const sfx0=await E("AU.on.sfx");await p.click('#mzPausa [data-a=sfx]');const sfx1=await E("AU.on.sfx");await p.click('#mzPausa [data-a=sfx]');
  ok(sfx1===!sfx0&&await E("AU.on.sfx")===sfx0,'il bottone degli effetti li spegne e li riaccende');
  await p.keyboard.press('Escape');await p.waitForTimeout(300);const t3=await p.evaluate(()=>__MZ.W.t);await p.waitForTimeout(400);
  ok(await p.evaluate(()=>document.getElementById('mzPausa').hidden)&&await p.evaluate(()=>__MZ.W.t)>t3,'Esc chiude la pausa e il mondo riparte');
  ok(await E("started===false&&paused===true"),'il gioco classico sotto resta fermo');
  // 5. il cancello aperto, la Bara pagata, l'anima comprata, la telecamera inclinata; poi «Esci dalla partita» al round 3
  await p.evaluate(()=>{const M=__MZ,W=M.W;M.coins(9000);M.buyNow('cancello');M.buyNow('anima');M.buyNow('bara');M.view(140,62)});await p.waitForTimeout(800);
  const s5=await p.evaluate(()=>({gate:__MZ.W.gate.open,anime:__MZ.W.director.anime,bara:__MZ.box().b.st,cam:JSON.stringify(CR?0:0)}));
  const crTilt=await E("JSON.stringify(CR.cam)");
  ok(s5.gate&&s5.anime===1&&s5.bara!=='ferma'&&crTilt!==crCam0,`a metà partita: cancello aperto, anima comprata, Bara aperta (${s5.bara}), telecamera inclinata`);
  await p.evaluate(()=>{__MZ.W.Z.length=0;__MZ.W.director.startRound(3)});await p.waitForTimeout(300);
  await p.click('#mzPz');await p.click('#mzPausa [data-a=esci]');await p.waitForTimeout(200);ok(!(await p.evaluate(()=>document.querySelector('#mzPausa .mzsure').hidden)),'«Esci dalla partita» chiede conferma');
  await p.click('#mzPausa [data-a=si]');await p.waitForTimeout(1500);await shot('5_finita');
  const s6=await p.evaluate(()=>({txt:document.querySelector('#mzPartita .fine').textContent,st:__MZ.W.director.st}));const g1=await E("SAVE.gold"),rec1=await E("SAVE.zRec"),n1=await E("SAVE.zN");
  ok(s6.st==='fine'&&/Partita finita/.test(s6.txt)&&/Round raggiunto: 3/.test(s6.txt),'esci: «Partita finita» al round 3');
  ok(g1-g0===180&&rec1===3&&n1===1,`l'oro del round 3 va nel salvataggio (+${g1-g0}), record ${rec1}, partite ${n1}`);
  // 6. Rigioca: tutto com'era all'inizio, e l'oro non viene dato una seconda volta
  await p.click('#mzPartita .fine [data-a=ancora]');await p.waitForTimeout(700);
  const s7=await p.evaluate(()=>{const M=__MZ,W=M.W,D=W.director;return{coins:W.coins,R:D.R,st:D.st,gate:W.gate.open,z2:W.zoneOpen[2],veil:!!W.split,bara:M.box().b.st,anime:D.anime,comprate:D.comprate,idle:W.Z.filter(z=>z.idle).length,
    hero:[Math.round(W.hero.x),Math.round(W.hero.y)],dead:!!W.hero.dead,fine:document.querySelector('#mzPartita .fine').hidden,gun:W.gunId,solid:M.hit(W.gate.x,W.gate.y,4)}});
  ok(s7.coins===500&&s7.R===0&&s7.st==='inizio'&&!s7.dead&&s7.fine&&s7.gun==='pistola',`Rigioca: 500 monete, round da capo, eroe in piedi con la pistola`);
  ok(!s7.gate&&!s7.z2&&s7.veil&&s7.solid,'Rigioca: cancello di nuovo chiuso (col suo solido), fattoria chiusa col velo');
  ok(s7.bara==='ferma'&&s7.anime===0&&s7.comprate===0&&s7.idle===3,'Rigioca: Bara chiusa, nessuna anima, tre zombie fermi nell\'aia');
  ok(await E("SAVE.gold")===g1,"l'oro della partita di prima non viene dato due volte");
  await p.waitForTimeout(3600);await shot('6_rigioca');
  // 7. si cade al round 2 senza anime: «Sei caduto», poi Menu: il menu torna con la sua musica, l'inclinazione dei personaggi come prima
  await p.evaluate(()=>{const M=__MZ;M.view(220,62);__MZ.W.Z.length=0;__MZ.W.director.startRound(2);__MZ.W.director.hurtHero(500)});await p.waitForTimeout(3200);await shot('7_caduto');
  ok(/Sei caduto/.test(await p.textContent('#mzPartita .fine')),'senza anime si cade: «Sei caduto»');
  const g2=await E("SAVE.gold");ok(g2-g1===100&&await E("SAVE.zRec")===3&&await E("SAVE.zN")===2,`l'oro del round 2 (+${g2-g1}), il record resta 3, partite 2`);
  await p.click('#mzPartita .fine [data-a=menu]');await p.waitForTimeout(1500);await shot('8_menu');
  const s8=await p.evaluate(()=>({menu:!document.getElementById('menu').hidden,mz:document.getElementById('mz').hidden,on:__E('ZG.on'),music:__E('AU.cur?AU.cur.name:null')}));
  ok(s8.menu&&s8.mz&&!s8.on&&s8.music==='zmenu','Menu: si torna al menu Zombie con la sua musica (quella del falò), la mappa è spenta');
  ok(await E("JSON.stringify(CR.cam)")===crCam0,"l'inclinazione dei personaggi (CR.cam) è tornata quella del menu");
  ok(/Round\s*3/.test(await p.textContent('#chapCard')),'la scheda mostra il record: round 3');
  // 8. la Classica parte ancora come prima
  await p.click('#cSprout',{force:true});await p.waitForFunction(()=>__E('!MM.tr'),null,{timeout:10000});await p.waitForTimeout(400);ok(await E("SAVE.modo")==='classica'&&!(await E("$('menu').classList.contains('zmode')")),'il germoglio riporta al menu Classico');
  await p.click('#playBtn');await p.waitForTimeout(2600);
  ok(await E("started&&!paused&&G&&G.room===1&&$('menu').hidden")&&!(await E("ZG.on")),'con la Classica «Gioca» parte nella cripta come prima');await shot('9_classica');
  console.log('\nERR',JSON.stringify(errs.slice(0,6)));if(errs.length)fails++;console.log(fails?`${fails} prove non passate`:'tutte le prove passate');await b.close();srv.close();process.exit(fails?1:0)})();
