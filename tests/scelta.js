// La scelta dell'eroe al primo avvio (src/js/65-scelta-eroe.js): con il salvataggio vuoto prima di tutto c'è «Chi vuoi essere?» con
// l'Arciere e la Cacciatrice in 3D (l'intro aspetta sotto); toccandone uno si accende, tende l'arco e scocca, il bottone dice «Sarò…»
// e la nota il prezzo dell'altro; confermando parte l'intro con l'eroe scelto, poi il menu: quello scelto è gratis e in campo, l'altro
// costa 3.000 oro nella scheda Eroi e si può comprare. Riaprendo il gioco la scelta non torna e l'altro eroe non viene regalato.
// Anche con la tastiera (frecce e Invio), con gli effetti ridotti, e i salvataggi vecchi che non la vedono mai.
// Uso: python3 tests/mk.py && node tests/scelta.js [cartella delle foto]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
// the page comes from a small local http server, with the viewport line that claude.ai and the phone app add
const VP='<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n';
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(VP+fs.readFileSync(path.join(__dirname,'test.html'),'utf8'))});
const OUT=process.argv[2]||path.join(__dirname,'scelta_foto');fs.mkdirSync(OUT,{recursive:true});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
const OLD={gold:900,gems:40,introSeen:1,handSeen:1,runs:4,trophies:120,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL='http://127.0.0.1:'+srv.address().port+'/test.html';
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];
  // a phone: touch, 390x844; the save is set before the page starts (null = a brand new player)
  const phone=async(save)=>{const cx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await cx.addInitScript(s=>{if(sessionStorage.getItem('qa_set'))return;sessionStorage.setItem('qa_set',1);localStorage.clear();if(s)localStorage.setItem('cripta_save_v1',JSON.stringify(s))},save);
    const p=await cx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|net::|404/.test(m.text()))errs.push(m.text())});
    await p.goto(URL);await p.waitForTimeout(1300);return{p,cx,E:c=>p.evaluate(c=>__E(c),c),shot:n=>p.screenshot({path:path.join(OUT,n+'.png')})}};
  // how much of a card's canvas is painted (the hero and his stone are there)
  const ink=(p,i)=>p.evaluate(i=>{const c=document.querySelectorAll('.sceCard canvas')[i];if(!c||!c.width)return 0;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let k=3;k<d.length;k+=16)if(d[k]>200)n++;return n/(d.length/16)},i);

  // 1. a new player: the choice comes first, the intro waits under it
  {const {p,cx,E,shot}=await phone(null);
    ok(await E("SCE.on")&&await p.isVisible('#sceScr'),'salvataggio vuoto: «Chi vuoi essere?» è la prima cosa');
    ok(await E("INTRO.on&&INTRO.splash"),'l\'intro aspetta sotto la scelta, ferma');
    ok(/Chi vuoi essere/.test(await p.textContent('#sceScr h1'))&&await p.isDisabled('.sceGo'),'titolo, bottone spento finché non scegli');
    const a0=await ink(p,0),c0=await ink(p,1);ok(a0>.08&&c0>.08,`i due eroi 3D sulle pietre delle rune (pieno ${(a0*100).toFixed(0)}% e ${(c0*100).toFixed(0)}%)`);
    const names=await p.$$eval('.sceName',l=>l.map(x=>x.textContent));ok(names.join()==='Arciere,Cacciatrice','Arciere e Cacciatrice');
    await shot('1_scelta');
    // 2. a tap on the Cacciatrice: she lights up and shoots, the button names her, the note prices the Arciere
    await p.tap('.sceCard[data-id=cacciatrice]',{force:true});await p.waitForTimeout(250);await shot('2_tocco');await p.waitForTimeout(1250);
    ok(await E("AU.ctx&&AU.ctx.state")==='running','il primo tocco accende il suono');
    ok(await p.getAttribute('.sceCard[data-id=cacciatrice]','aria-pressed')==='true'&&await p.getAttribute('.sceCard[data-id=arciere]','aria-pressed')==='false','la carta della Cacciatrice è scelta, l\'altra no');
    ok(!(await p.isDisabled('.sceGo'))&&(await p.textContent('.sceGo'))==='Sarò la Cacciatrice!','il bottone dice «Sarò la Cacciatrice!»');
    ok(/L'Arciere potrai sbloccarlo.*3\.000 oro/.test(await p.textContent('.sceNote')),'la nota: l\'Arciere si sblocca per 3.000 oro');
    ok(await E("SCE.cards[1].shot"),'la Cacciatrice ha scoccato la freccia');
    ok(await E("INTRO.on&&INTRO.splash&&!AU.cur"),'sotto, l\'intro è ancora ferma e muta');
    await shot('3_scelta_cacciatrice');
    // switch and back
    await p.tap('.sceCard[data-id=arciere]',{force:true});await p.waitForTimeout(300);ok((await p.textContent('.sceGo'))==="Sarò l'Arciere!"&&/La Cacciatrice potrai sbloccarla/.test(await p.textContent('.sceNote')),'cambiando idea: «Sarò l\'Arciere!» e la Cacciatrice in vendita');
    await p.tap('.sceCard[data-id=cacciatrice]',{force:true});await p.waitForTimeout(300);
    // 3. confirm: the intro starts with her
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(700);await shot('4_conferma');await p.waitForTimeout(1500);
    const st=await E("({sce:SCE.on,el:!!document.getElementById('sceScr'),intro:INTRO.on,splash:INTRO.splash,P:P.hero,hid:P.style&&P.style.hid,music:AU.cur&&AU.cur.name,ls:JSON.parse(localStorage.getItem(SAVE_KEY)),snap:JSON.parse(INTRO.snap)})");
    ok(!st.sce&&!st.el&&st.intro&&!st.splash&&st.music==='trailer','confermando la scelta sparisce e parte l\'intro con la sua musica');
    ok(st.P==='cacciatrice'&&st.hid==='cacciatrice','nell\'intro c\'è la Cacciatrice');
    ok(st.ls.starter==='cacciatrice'&&st.ls.hero==='cacciatrice'&&JSON.stringify(st.ls.heroes)==='{"cacciatrice":1}'&&st.snap.starter==='cacciatrice','la scelta è salvata subito (anche nella copia che l\'intro rimette)');
    await p.waitForTimeout(3000);await shot('5_intro');
    await p.tap('#iSkip',{force:true});await p.waitForTimeout(1500);await shot('6_menu');
    const m=await E("({menu:!$('menu').hidden,hero:SAVE.hero,heroes:SAVE.heroes,seen:SAVE.introSeen,pA:HERO_BY.arciere.price,pC:HERO_BY.cacciatrice.price,gold:SAVE.gold})");
    ok(m.menu&&m.hero==='cacciatrice'&&JSON.stringify(m.heroes)==='{"cacciatrice":1}'&&m.seen===1,'nel menu: la Cacciatrice in campo, solo lei tra gli eroi, intro vista');
    ok(m.pA===3000&&m.pC===0,'prezzi: Arciere 3.000, Cacciatrice gratis');
    await E("setTab('tabHero')");await p.waitForTimeout(600);ok(/In campo/.test(await p.textContent('#hAct')),'scheda Eroi: la Cacciatrice «In campo»');
    await E("heroView='arciere';renderHero()");await p.waitForTimeout(400);ok(/Sblocca\s*3\.000/.test(await p.textContent('#hAct')),'scheda Eroi: l\'Arciere «Sblocca 3.000»');await shot('7_eroi_arciere');
    // 4. reopen: no choice, and the Arciere is not given back by the save's repair
    await p.reload();await p.waitForTimeout(1500);
    const r=await E("({sce:SCE.on,intro:INTRO.on,menu:!$('menu').hidden,hero:SAVE.hero,heroes:SAVE.heroes,pA:HERO_BY.arciere.price})");
    ok(!r.sce&&!r.intro&&r.menu,'riaprendo il gioco: niente scelta, niente intro, subito il menu');
    ok(r.hero==='cacciatrice'&&JSON.stringify(r.heroes)==='{"cacciatrice":1}'&&r.pA===3000,'riaprendo: l\'Arciere non è regalato, costa ancora 3.000');
    // 5. buying the Arciere
    await E("SAVE.gold=3500;setTab('tabHero');heroView='arciere';renderHero()");await p.waitForTimeout(300);
    await p.click('#hAct [data-hact=buy]');await p.waitForTimeout(200);await p.click('#hAct [data-hact=buy]');await p.waitForTimeout(400);
    const k=await E("({heroes:SAVE.heroes,hero:SAVE.hero,gold:SAVE.gold})");ok(k.heroes.arciere===1&&k.hero==='arciere'&&k.gold===500,'l\'Arciere si compra per 3.000 oro');
    await cx.close()}

  // 6. the keyboard, and picking the Arciere
  {const {p,cx,E,shot}=await phone(null);
    await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);ok(await E("SCE.sel")==='cacciatrice'&&await E("INTRO.splash"),'freccia a destra: la Cacciatrice (l\'intro non parte)');
    await p.keyboard.press('ArrowLeft');await p.waitForTimeout(200);ok(await E("SCE.sel")==='arciere','freccia a sinistra: l\'Arciere');
    await p.keyboard.press('Enter');await p.waitForTimeout(2400);
    const s=await E("({sce:SCE.on,intro:INTRO.on,splash:INTRO.splash,P:P.hero,hero:SAVE.hero,heroes:SAVE.heroes,starter:SAVE.starter,pA:HERO_BY.arciere.price,pC:HERO_BY.cacciatrice.price})");
    ok(!s.sce&&s.intro&&!s.splash&&s.P==='arciere','Invio: l\'intro parte con l\'Arciere');
    ok(s.hero==='arciere'&&JSON.stringify(s.heroes)==='{"arciere":1}'&&s.starter==='arciere'&&s.pA===0&&s.pC===3000,'scegliendo l\'Arciere la Cacciatrice costa 3.000');
    await cx.close()}

  // 7. low effects: the screen still draws, no errors; and how long a frame of the screen takes
  {const {p,cx,E,shot}=await phone({gold:60,items:OLD.items,eq:OLD.eq,set:{q:'bassa',vib:true,left:false,mv:.8,sv:.8}});
    ok(await E("SCE.on&&LOWFX"),'effetti ridotti: la scelta c\'è');
    await p.tap('.sceCard[data-id=arciere]',{force:true});await p.waitForTimeout(900);ok(await ink(p,0)>.08,'effetti ridotti: l\'Arciere si vede');await shot('8_effetti_ridotti');
    await cx.close()}
  {const {p,cx,E}=await phone(null);
    const ms=await E("(()=>{SCE.manual=true;scePick('cacciatrice');const t0=performance.now();for(let i=0;i<60;i++){sceTick(1/60);for(const c of SCE.cards)c.cv.getContext('2d').getImageData(0,0,1,1)}return (performance.now()-t0)/60})()");
    console.log(`        un fotogramma della scelta (due eroi e lo sfondo): ${ms.toFixed(1)} ms sul computer di prova`);ok(ms<40,'un fotogramma sotto i 40 ms sul computer di prova');
    await cx.close()}

  // 8. old saves never see it
  {const {p,cx,E}=await phone(OLD);const s=await E("({sce:SCE.on,menu:!$('menu').hidden,hero:SAVE.hero,heroes:SAVE.heroes,pA:HERO_BY.arciere.price,pC:HERO_BY.cacciatrice.price})");
    ok(!s.sce&&s.menu&&s.hero==='arciere'&&s.heroes.arciere===1&&s.pA===0&&s.pC===3000,'salvataggio vecchio: niente scelta, Arciere gratis e Cacciatrice a 3.000');await cx.close()}
  {const {p,cx,E}=await phone({...OLD,introSeen:undefined});const s=await E("({sce:SCE.on,intro:INTRO.on})");
    ok(!s.sce&&s.intro,'salvataggio con partite ma senza intro: niente scelta, l\'intro come prima');await cx.close()}

  ok(!errs.length,'nessun errore nella pagina'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
  console.log(fails?`\n${fails} controlli NON passati`:'\nTutto a posto.');await b.close();srv.close();process.exit(fails?1:0)})();
