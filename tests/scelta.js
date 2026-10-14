// La creazione dell'eroe al primo avvio (src/js/65-scelta-eroe.js), in stile Dark Souls: con il salvataggio vuoto prima c'è l'intro, poi
// (alla fine o con «Salta») la creazione: i quattro eroi a sinistra (Balestriere e Druida col lucchetto e il prezzo), l'eroe 3D al centro
// sotto la luce (si gira col dito, un tocco lo fa tirare), le statistiche a destra, la storia sotto; «Avanti», il dono iniziale (cinque, in
// 3D), «Inizia», «Il viaggio ha inizio», il menu. Quello scelto è gratis e in campo, l'altro dei primi due costa 3.000 oro nella scheda Eroi;
// il dono arriva nel salvataggio. Riaprendo il gioco la creazione non torna; chiuso a metà, torna sopra il menu. Anche con la tastiera,
// con gli effetti ridotti, la piuma della fenice in battaglia, e i salvataggi vecchi che non la vedono mai.
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
  const phone=async(save,vw,vh)=>{const cx=await b.newContext({viewport:{width:vw||390,height:vh||844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await cx.addInitScript(s=>{if(sessionStorage.getItem('qa_set'))return;sessionStorage.setItem('qa_set',1);localStorage.clear();if(s)localStorage.setItem('cripta_save_v1',JSON.stringify(s))},save);
    const p=await cx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|net::|404/.test(m.text()))errs.push(m.text())});
    await p.goto(URL);await p.waitForTimeout(1300);return{p,cx,E:c=>p.evaluate(c=>__E(c),c),shot:n=>p.screenshot({path:path.join(OUT,n+'.png')})}};
  // how much of the stage is painted with colour (the hero in the light; the dark and the light round him are grey and brown)
  const lit=p=>p.evaluate(()=>{const c=document.getElementById('sceCv'),s=document.querySelector('.sceStage');if(!c||!s||!c.width)return 0;const a=s.getBoundingClientRect(),k=c.width/c.clientWidth;
    const x0=Math.round(a.left*k),y0=Math.round(a.top*k),w=Math.round(a.width*k),h=Math.round(a.height*k),d=c.getContext('2d').getImageData(x0,y0,w,h).data;let n=0;
    for(let i=0;i<d.length;i+=16){const mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]);if(mx-mn>70)n++}return n/(d.length/16)});
  const rows=p=>p.$$eval('.sceRow',l=>l.map(x=>({id:x.dataset.id,on:x.classList.contains('on'),lock:x.classList.contains('lock'),t:x.textContent.replace(/\s+/g,' ').trim()})));

  // 1. a new player: first the intro, then the making of the hero
  {const {p,cx,E,shot}=await phone(null);
    ok(await E("INTRO.on&&INTRO.splash&&!SCE.on&&!document.getElementById('sceScr')"),'salvataggio vuoto: prima l\'intro (ferma su «Tocca»), la creazione non c\'è ancora');
    await p.tap('#introScr',{force:true});await p.waitForTimeout(1600);
    ok(await E("INTRO.on&&!INTRO.splash&&AU.cur&&AU.cur.name==='trailer'"),'un tocco: l\'intro parte con la sua musica');
    await p.tap('#iSkip',{force:true});await p.waitForTimeout(1200);
    const o=await E("({sce:SCE.on,vis:!!document.getElementById('sceScr'),intro:INTRO.on,menuHidden:$('menu').hidden,music:AU.cur&&AU.cur.name,seen:SAVE.introSeen,step:SCE.step})");
    ok(o.sce&&o.vis&&!o.intro&&o.menuHidden&&o.step===1,'«Salta»: si apre la creazione dell\'eroe (il menu aspetta nascosto)');
    ok(o.music==='scelta','la creazione ha la sua musica');
    const R=await rows(p);ok(R.map(r=>r.id).join()==='arciere,cacciatrice,balestriere,druida','i quattro eroi nella lista');
    ok(!R[0].lock&&!R[1].lock&&R[2].lock&&R[3].lock&&/7\.000/.test(R[2].t)&&/12\.000/.test(R[3].t),'Balestriere e Druida col lucchetto e il prezzo (7.000 e 12.000)');
    ok(R[0].on&&(await p.textContent('.sceGo')).includes('Avanti')&&!(await p.isDisabled('.sceGo')),'l\'Arciere già scelto, «Avanti» acceso');
    ok((await p.$$eval('.sceStats dd',l=>l.length))===6&&/Salute/.test(await p.textContent('.sceStats')),'le statistiche coi numeri a destra');
    const l0=await lit(p);ok(l0>.04,`l'eroe 3D al centro, nella luce (pieno ${(l0*100).toFixed(1)}%)`);
    await shot('1_classe');
    // the Cacciatrice: her numbers against the Arciere's (less health, more speed)
    await p.tap('.sceRow[data-id=cacciatrice]',{force:true});await p.waitForTimeout(600);
    const c=await p.$$eval('.sceStats dd',l=>l.map(x=>x.className));
    ok((await rows(p))[1].on&&c[0]==='dn'&&c[3]==='up'&&/Cacciatrice/.test(await p.textContent('.sceDesc h3')),'la Cacciatrice: meno salute (rosso), più velocità (blu)');
    // a locked hero: shown, but «Bloccato»; Avanti does nothing
    await p.tap('.sceRow[data-id=balestriere]',{force:true});await p.waitForTimeout(700);
    ok(await p.isDisabled('.sceGo')&&/Bloccato/.test(await p.textContent('.sceGo'))&&/Si sblocca nella scheda Eroi per 7\.000 oro/.test(await p.textContent('.sceDesc')),'il Balestriere si vede, ma è «Bloccato» (si sblocca nella scheda Eroi per 7.000 oro)');
    await E('sceGo()');ok(await E('SCE.step')===1,'un eroe bloccato non si può prendere');
    const l1=await lit(p);ok(l1>.03,'anche l\'eroe bloccato si vede');await shot('2_bloccato');
    await p.tap('.sceRow[data-id=druida]',{force:true});await p.waitForTimeout(500);ok(/12\.000/.test(await p.textContent('.sceDesc')),'il Druida: 12.000 oro');await shot('2b_druida');
    // a finger on the hero: it turns him; a tap makes him shoot
    await p.tap('.sceRow[data-id=cacciatrice]',{force:true});await p.waitForTimeout(500);
    const st=await p.$eval('.sceStage',e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height*.7}});
    const y0=await E('SCE.yaw');await p.mouse.move(st.x-60,st.y);await p.mouse.down();for(let i=1;i<=6;i++)await p.mouse.move(st.x-60+i*20,st.y);await p.mouse.up();
    const y1=await E('SCE.yaw');ok(y1<y0-1,`trascinando il dito l'eroe gira (${(y0-y1).toFixed(2)} rad)`);
    await p.mouse.click(st.x,st.y);await p.waitForTimeout(1300);ok(await E('SCE.hero.shot'),'un tocco sull\'eroe: tende l\'arco e scocca');
    // Avanti: the gift
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(700);
    const g=await rows(p);
    ok(await E('SCE.step')===2&&/Scegli un dono/.test(await p.textContent('#sceTitle'))&&g.map(r=>r.id).join()==='oro,cristalli,cassa,anello,piuma','«Avanti»: il dono, cinque da scegliere');
    ok(g[0].on&&/Inizia/.test(await p.textContent('.sceGo'))&&await p.isVisible('.sceBack')&&/\+500/.test(await p.textContent('.sceStats')),'il sacco d\'oro già scelto (+500), «Inizia» e «Indietro»');
    await shot('3_dono');
    for(const id of ['cristalli','cassa','anello','piuma']){await p.tap(`.sceRow[data-id=${id}]`,{force:true});await p.waitForTimeout(450);await shot('3_dono_'+id)}
    ok(/Rinascite/.test(await p.textContent('.sceStats'))&&await lit(p)>.03,'la piuma della fenice nella luce, con quello che dà');
    await p.tap('.sceBack',{force:true});await p.waitForTimeout(400);ok(await E('SCE.step')===1&&(await rows(p))[1].on,'«Indietro»: di nuovo gli eroi, la Cacciatrice ancora scelta');
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(400);await p.tap('.sceRow[data-id=cassa]',{force:true});await p.waitForTimeout(300);
    ok(/Carte/.test(await p.textContent('.sceStats')),'la cassa d\'argento: le carte e l\'oro che ci sono dentro');
    // Inizia: the band, then the menu with her and the chest
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(1800);
    ok(await E("SCE.el&&SCE.el.classList.contains('band')"),'«Inizia»: «Il viaggio ha inizio»');await shot('4_fine');
    await p.waitForTimeout(3600);
    const m=await E("({sce:SCE.on,el:!!document.getElementById('sceScr'),menu:!$('menu').hidden,music:AU.cur&&AU.cur.name,hero:SAVE.hero,heroes:SAVE.heroes,starter:SAVE.starter,dono:SAVE.dono,slots:SAVE.slots,pA:HERO_BY.arciere.price,pC:HERO_BY.cacciatrice.price,pB:HERO_BY.balestriere.price,ls:JSON.parse(localStorage.getItem(SAVE_KEY))})");
    ok(!m.sce&&!m.el&&m.menu&&m.music==='menu','poi il menu, con la sua musica');
    ok(m.hero==='cacciatrice'&&m.starter==='cacciatrice'&&JSON.stringify(m.heroes)==='{"cacciatrice":1}','la Cacciatrice in campo, ed è l\'unica eroina che hai');
    ok(m.dono==='cassa'&&m.slots.some(s=>s&&s.type==='argento'&&s.state==='ready')&&m.ls.starter==='cacciatrice'&&m.ls.dono==='cassa','la cassa d\'argento è tra le tue casse, pronta (e tutto è salvato)');
    ok(m.pA===3000&&m.pC===0&&m.pB===7000,'prezzi: Arciere 3.000, Cacciatrice gratis, Balestriere 7.000');
    ok(/Dono: Cassa d'argento/.test(await E("$('toast').textContent")),'un avviso ricorda il dono');await shot('5_menu');
    await E("setTab('tabHero')");await p.waitForTimeout(600);ok(/In campo/.test(await p.textContent('#hAct')),'scheda Eroi: la Cacciatrice «In campo»');
    await E("heroView='arciere';renderHero()");await p.waitForTimeout(400);ok(/Sblocca\s*3\.000/.test(await p.textContent('#hAct')),'scheda Eroi: l\'Arciere «Sblocca 3.000»');
    // reopen: no choice, no intro, and the Arciere is not given back by the save's repair
    await p.reload();await p.waitForTimeout(1500);
    const r=await E("({sce:SCE.on,intro:INTRO.on,menu:!$('menu').hidden,hero:SAVE.hero,heroes:SAVE.heroes,pA:HERO_BY.arciere.price})");
    ok(!r.sce&&!r.intro&&r.menu&&r.hero==='cacciatrice'&&JSON.stringify(r.heroes)==='{"cacciatrice":1}'&&r.pA===3000,'riaprendo il gioco: subito il menu, l\'Arciere non è regalato');
    await E("SAVE.gold=3500;setTab('tabHero');heroView='arciere';renderHero()");await p.waitForTimeout(300);
    await p.click('#hAct [data-hact=buy]');await p.waitForTimeout(200);await p.click('#hAct [data-hact=buy]');await p.waitForTimeout(400);
    const k=await E("({heroes:SAVE.heroes,hero:SAVE.hero,gold:SAVE.gold})");ok(k.heroes.arciere===1&&k.hero==='arciere'&&k.gold===500,'l\'Arciere si compra per 3.000 oro');
    await cx.close()}

  // 2. the keyboard: Esc skips the intro, the arrows move, Enter goes on, Esc goes back
  {const {p,cx,E}=await phone(null);
    await p.keyboard.press('Enter');await p.waitForTimeout(800);await p.keyboard.press('Escape');await p.waitForTimeout(900);
    ok(await E('SCE.on&&SCE.step===1'),'Invio fa partire l\'intro, Esc la salta: la creazione');
    await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');await p.waitForTimeout(200);ok(await E('SCE.sel')==='balestriere','freccia giù due volte: il Balestriere');
    await p.keyboard.press('Enter');await p.waitForTimeout(200);ok(await E('SCE.step')===1,'Invio sul Balestriere bloccato: si resta lì');
    await p.keyboard.press('ArrowUp');await p.keyboard.press('Enter');await p.waitForTimeout(300);ok(await E('SCE.step===2&&SCE.sel')==='cacciatrice','freccia su e Invio: la Cacciatrice, il dono');
    await p.keyboard.press('ArrowDown');await p.waitForTimeout(150);await p.keyboard.press('Escape');await p.waitForTimeout(200);ok(await E('SCE.step')===1,'Esc: di nuovo gli eroi');
    await p.keyboard.press('Enter');await p.waitForTimeout(250);ok(await E('SCE.step===2&&SCE.gift')==='cristalli','Invio: il dono che avevi (i cristalli)');
    await p.keyboard.press('Enter');await p.waitForTimeout(5000);
    const s=await E("({sce:SCE.on,hero:SAVE.hero,gems:SAVE.gems,dono:SAVE.dono,menu:!$('menu').hidden})");ok(!s.sce&&s.menu&&s.hero==='cacciatrice'&&s.gems===30&&s.dono==='cristalli','Invio: la Cacciatrice con 30 cristalli, poi il menu');
    await cx.close()}

  // 3. the gifts, each on its own into a new save; and the phoenix feather in battle
  {const {p,cx,E}=await phone({...OLD,runs:0,introSeen:1,gems:0,gold:60,slots:[{type:'legno',state:'ready'},null,null,null]});
    ok(await E('SCE.on&&!INTRO.on'),'chiuso a metà (intro vista, nessun eroe preso): la creazione torna subito sopra il menu');
    const d=await E(`(()=>{const out={};for(const g of SCE_GIFTS){const keep=JSON.stringify(SAVE);g.give();out[g.id]={gold:SAVE.gold,gems:SAVE.gems,slots:SAVE.slots.map(s=>s&&s.type+':'+s.state).join(),ring:!!(SAVE.items.anello_falco&&SAVE.eq.anello==='anello_falco'),piuma:SAVE.piuma||0};
      const s=JSON.parse(keep);for(const k of Object.keys(SAVE))delete SAVE[k];Object.assign(SAVE,s)}return out})()`);
    ok(d.oro.gold===560&&d.cristalli.gems===30&&d.cassa.slots==='legno:ready,argento:ready,,'&&d.anello.ring&&d.piuma.piuma===1,'i cinque doni: 500 oro, 30 cristalli, la cassa d\'argento pronta, l\'anello indossato, la piuma');
    await E("sceClose(false)");await p.waitForTimeout(300);
    await E("SAVE.piuma=1;SAVE.starter='arciere';startRun()");await p.waitForTimeout(1800);
    await E('P.revive=0;P.hp=0;die()');await p.waitForTimeout(600);
    const f=await E("({hp:P.hp,max:P.maxhp,state:G.state,piuma:SAVE.piuma,rev:!$('revScr').hidden})");ok(f.hp===f.max&&f.state!=='dead'&&f.piuma===0&&!f.rev,'la piuma della fenice: alla prima caduta ti rialzi, e la piuma è finita');
    await E('P.inv=0;P.hp=0;die()');await p.waitForTimeout(2200);ok(await E(`G.state==='dead'`),'alla seconda caduta niente piuma: si cade davvero');
    await cx.close()}

  // 4. a small phone and low effects: everything draws and fits; how long a frame of the screen takes
  {const {p,cx,E,shot}=await phone({gold:60,items:OLD.items,eq:OLD.eq,introSeen:1,set:{q:'bassa',vib:true,left:false,mv:.8,sv:.8}},360,640);
    ok(await E("SCE.on&&LOWFX"),'effetti ridotti (360×640): la creazione c\'è');
    await p.tap('.sceRow[data-id=druida]',{force:true});await p.waitForTimeout(800);ok(await lit(p)>.02,'effetti ridotti: il Druida si vede');
    const fit=await p.evaluate(()=>{const s=document.getElementById('sceScr').getBoundingClientRect();return[...document.querySelectorAll('#sceScr .sceRow,#sceScr dd,#sceScr .sceBtn,#sceScr .sceDesc')].every(e=>{const r=e.getBoundingClientRect();return!e.offsetWidth||(r.left>=s.left-1&&r.right<=s.right+1&&r.bottom<=s.bottom+1)})});
    ok(fit,'su un telefono piccolo tutto sta nello schermo');await shot('6_piccolo_effetti_ridotti');
    await cx.close()}
  {const {p,cx,E}=await phone({gold:60,items:OLD.items,eq:OLD.eq,introSeen:1});
    const ms=await E("(()=>{SCE.manual=true;scePick('cacciatrice');const t0=performance.now();for(let i=0;i<60;i++){sceTick(1/60);document.getElementById('sceCv').getContext('2d').getImageData(0,0,1,1)}return (performance.now()-t0)/60})()");
    console.log(`        un fotogramma della creazione: ${ms.toFixed(1)} ms sul computer di prova`);ok(ms<40,'un fotogramma sotto i 40 ms sul computer di prova');
    const ms2=await E("(()=>{SCE.manual=true;sceGo();const t0=performance.now();for(let i=0;i<60;i++){sceTick(1/60);document.getElementById('sceCv').getContext('2d').getImageData(0,0,1,1)}return (performance.now()-t0)/60})()");
    console.log(`        un fotogramma col dono: ${ms2.toFixed(1)} ms`);ok(ms2<40,'col dono, sotto i 40 ms');
    await E("for(const k of ['move','back','lock','ok','band','absorb'])sceSnd(k)");
    await cx.close()}

  // 5. old saves never see it
  {const {p,cx,E}=await phone(OLD);const s=await E("({sce:SCE.on,menu:!$('menu').hidden,hero:SAVE.hero,heroes:SAVE.heroes,pA:HERO_BY.arciere.price,pC:HERO_BY.cacciatrice.price})");
    ok(!s.sce&&s.menu&&s.hero==='arciere'&&s.heroes.arciere===1&&s.pA===0&&s.pC===3000,'salvataggio vecchio: niente creazione, Arciere gratis e Cacciatrice a 3.000');await cx.close()}
  {const {p,cx,E}=await phone({...OLD,introSeen:undefined});await E('introEnd()');await p.waitForTimeout(400);const s=await E("({sce:SCE.on,menu:!$('menu').hidden})");
    ok(!s.sce&&s.menu,'salvataggio con partite ma senza intro: dopo l\'intro il menu, come prima');await cx.close()}

  ok(!errs.length,'nessun errore nella pagina'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
  console.log(fails?`\n${fails} controlli NON passati`:'\nTutto a posto.');await b.close();srv.close();process.exit(fails?1:0)})();
