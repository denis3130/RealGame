// La creazione dell'eroe al primo avvio (src/js/65-scelta-eroe.js), in stile Dark Souls: con il salvataggio vuoto prima c'è l'intro, poi
// (alla fine o con «Salta») la creazione in quattro passi. I Classe: i quattro eroi a sinistra (Balestriere e Druida col lucchetto e il
// prezzo), l'eroe 3D grande al centro sotto la luce (si gira col dito, un tocco lo fa tirare), le statistiche a destra, la storia sotto.
// II Aspetto: il colore del mantello (i mantelli del gioco, poi nel Profilo). III Dono: cinque doni in 3D, ognuno da solo sulla pietra al
// posto dell'eroe. IV Nome: il nome (il dado ne propone uno), il riepilogo (un tocco su una riga torna a quel passo), «Inizia», «Il viaggio
// ha inizio» col nome, il menu con l'eroe col suo mantello. Quello scelto è gratis e in campo, l'altro dei primi due costa 3.000 oro nella
// scheda Eroi; dono, nome e mantello arrivano nel salvataggio. Riaprendo il gioco la creazione non torna; chiuso a metà, torna sopra il menu.
// Anche con la tastiera, con gli effetti ridotti, la piuma della fenice in battaglia, e i salvataggi vecchi che non la vedono mai.
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
  // how much of the upper part of the stage (over the rune stone) is painted over the dark background: the hero, or the gift, in the light
  const lit=p=>p.evaluate(()=>__E(`(()=>{const c=$('sceCv'),s=SCE.el&&SCE.el.querySelector('.sceStage'),bg=SCE.bgImg;if(!c||!s||!c.width||!bg)return 0;const a=s.getBoundingClientRect(),b=c.getBoundingClientRect(),k=c.width/c.clientWidth;
    const x0=Math.round((a.left-b.left)*k),y0=Math.round((a.top-b.top)*k),w=Math.round(a.width*k),h=Math.round(a.height*.62*k),d=c.getContext('2d').getImageData(x0,y0,w,h).data,e=bg.getContext('2d').getImageData(x0,y0,w,h).data;let n=0;
    for(let i=0;i<d.length;i+=16)if(Math.abs(d[i]-e[i])+Math.abs(d[i+1]-e[i+1])+Math.abs(d[i+2]-e[i+2])>90)n++;return n/(d.length/16)})()`));
  const rows=p=>p.$$eval('.sceRow',l=>l.map(x=>({id:x.dataset.id,on:x.classList.contains('on'),lock:x.classList.contains('lock'),t:x.textContent.replace(/\s+/g,' ').trim()})));
  const title=p=>p.textContent('#sceTitle');
  // every text of the panels shows whole (nothing cut with «…»)
  const cut=p=>p.evaluate(()=>[...document.querySelectorAll('#sceScr .sceRow b,#sceScr .sceStats dt,#sceScr .sceStats dd')].filter(e=>e.offsetWidth&&!e.closest('.empty')&&e.scrollWidth>e.clientWidth+.5).map(e=>e.textContent.trim()));

  // 1. a new player: first the intro, then the making of the hero
  {const {p,cx,E,shot}=await phone(null);
    ok(await E("INTRO.on&&INTRO.splash&&!SCE.on&&!document.getElementById('sceScr')"),'salvataggio vuoto: prima l\'intro (ferma su «Tocca»), la creazione non c\'è ancora');
    await p.tap('#introScr',{force:true});await p.waitForTimeout(1600);
    ok(await E("INTRO.on&&!INTRO.splash&&AU.cur&&AU.cur.name==='trailer'"),'un tocco: l\'intro parte con la sua musica');
    await p.tap('#iSkip',{force:true});await p.waitForTimeout(1200);
    const o=await E("({sce:SCE.on,vis:!!document.getElementById('sceScr'),intro:INTRO.on,menuHidden:$('menu').hidden,music:AU.cur&&AU.cur.name,seen:SAVE.introSeen,step:SCE.step})");
    ok(o.sce&&o.vis&&!o.intro&&o.menuHidden&&o.step===1,'«Salta»: si apre la creazione dell\'eroe (il menu aspetta nascosto)');
    ok(o.music==='scelta','la creazione ha la sua musica');
    ok(/Chi vuoi essere/.test(await title(p))&&(await p.$$eval('.sceSteps li',l=>l.length))===4,'«Chi vuoi essere?», i quattro passi in cima');
    const R=await rows(p);ok(R.map(r=>r.id).join()==='arciere,cacciatrice,balestriere,druida','i quattro eroi nella lista');
    ok(!R[0].lock&&!R[1].lock&&R[2].lock&&R[3].lock&&/7\.000/.test(R[2].t)&&/12\.000/.test(R[3].t),'Balestriere e Druida col lucchetto e il prezzo (7.000 e 12.000)');
    ok(R[0].on&&(await p.textContent('.sceGo')).includes('Avanti')&&!(await p.isDisabled('.sceGo'))&&!(await p.isVisible('.sceBack')),'l\'Arciere già scelto, «Avanti» acceso, niente «Indietro»');
    ok((await p.$$eval('.sceStats dd',l=>l.length))===6&&/Salute/.test(await p.textContent('.sceStats')),'le statistiche coi numeri a destra');
    const c0=await cut(p);ok(!c0.length,'nessun nome tagliato nei pannelli'+(c0.length?': '+c0.join(', '):''));
    const l0=await lit(p);ok(l0>.2,`l'eroe 3D grande al centro, nella luce (${(l0*100).toFixed(0)}% della scena)`);
    // he stands with the rune stone whole over the panel underneath, and big
    const sp=await E("(()=>{const S=sceSpot(),c=$('sceCv').getBoundingClientRect(),d=SCE.el.querySelector('.sceBot').getBoundingClientRect();return{k:S.k,stone:c.top+S.y+S.k*.58*11.4,bot:d.top}})()");
    ok(sp.stone<=sp.bot+.5&&sp.k>7,`la pietra delle rune intera sopra il pannello (k ${sp.k.toFixed(2)})`);
    await shot('1_classe');
    // the Cacciatrice: her numbers against the Arciere's (less health, more speed)
    await p.tap('.sceRow[data-id=cacciatrice]',{force:true});await p.waitForTimeout(600);
    const c=await p.$$eval('.sceStats dd',l=>l.map(x=>x.className));
    ok((await rows(p))[1].on&&c[0]==='dn'&&c[3]==='up'&&/Cacciatrice/.test(await p.textContent('.sceDesc h3')),'la Cacciatrice: meno salute (rosso), più velocità (blu)');
    // a locked hero: shown, but «Bloccato»; Avanti does nothing
    await p.tap('.sceRow[data-id=balestriere]',{force:true});await p.waitForTimeout(700);
    ok(await p.isDisabled('.sceGo')&&/Bloccato/.test(await p.textContent('.sceGo'))&&/7\.000 oro nella scheda Eroi/.test(await p.textContent('.sceGo')),'il Balestriere si vede, ma è «Bloccato» (7.000 oro nella scheda Eroi)');
    await E('sceGo()');ok(await E('SCE.step')===1,'un eroe bloccato non si può prendere');
    const l1=await lit(p);ok(l1>.15,`anche l'eroe bloccato si vede (${(l1*100).toFixed(0)}%)`);await shot('2_bloccato');
    await p.tap('.sceRow[data-id=druida]',{force:true});await p.waitForTimeout(500);ok(/12\.000/.test(await p.textContent('.sceGo')),'il Druida: 12.000 oro');await shot('2b_druida');
    // a finger on the hero: it turns him; a tap makes him shoot
    await p.tap('.sceRow[data-id=cacciatrice]',{force:true});await p.waitForTimeout(500);
    const st=await p.$eval('.sceStage',e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height*.7}});
    const y0=await E('SCE.yaw');await p.mouse.move(st.x-60,st.y);await p.mouse.down();for(let i=1;i<=6;i++)await p.mouse.move(st.x-60+i*20,st.y);await p.mouse.up();
    const y1=await E('SCE.yaw');ok(y1<y0-1,`trascinando il dito l'eroe gira (${(y0-y1).toFixed(2)} rad)`);
    await p.mouse.click(st.x,st.y);await p.waitForTimeout(1300);ok(await E('SCE.hero.shot'),'un tocco sull\'eroe: tende l\'arco e scocca');
    // II · the mantle
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(700);
    const m0=await rows(p);
    ok(await E('SCE.step')===2&&/Il tuo mantello/.test(await title(p))&&m0.map(r=>r.id).join()===',brace,muschio,notte,strega,corvo','«Avanti»: il mantello, sei da scegliere');
    ok(m0[0].on&&await p.isVisible('.sceBack')&&await E("SCE.el.querySelector('.sceStats').classList.contains('empty')"),'«Originale» già scelto, «Indietro», niente statistiche');
    await p.tap('.sceRow[data-id=brace]',{force:true});await p.waitForTimeout(500);
    ok(await E("sceStyle('cacciatrice').hood")==='#d4492f'&&/Mantello: Brace/.test(await p.textContent('.sceDesc h3')),'«Brace»: il cappuccio della Cacciatrice diventa rosso');
    await shot('3_mantello_brace');await p.tap('.sceRow[data-id=notte]',{force:true});await p.waitForTimeout(450);await shot('3_mantello_notte');
    await p.tap('.sceRow[data-id=brace]',{force:true});await p.waitForTimeout(300);
    // III · the gift, alone on the stone in the hero's place
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(900);
    const g=await rows(p);
    ok(await E('SCE.step')===3&&/Scegli un dono/.test(await title(p))&&g.map(r=>r.id).join()==='oro,cristalli,cassa,anello,piuma','«Avanti»: il dono, cinque da scegliere');
    ok(g[0].on&&/Avanti/.test(await p.textContent('.sceGo'))&&/\+500/.test(await p.textContent('.sceStats')),'il sacco d\'oro già scelto (+500)');
    ok(await E("SCE.mode==='gift'&&SCE.gcur&&SCE.gcur.id==='oro'"),'il dono sta da solo sulla pietra, al posto dell\'eroe');
    await shot('4_dono');
    for(const id of ['cristalli','cassa','anello','piuma']){await p.tap(`.sceRow[data-id=${id}]`,{force:true});await p.waitForTimeout(450);await shot('4_dono_'+id)}
    const lg=await lit(p);ok(/Rinascite/.test(await p.textContent('.sceStats'))&&lg>.2,`la piuma della fenice nella luce, con quello che dà (${(lg*100).toFixed(0)}%)`);
    await p.tap('.sceBack',{force:true});await p.waitForTimeout(400);ok(await E("SCE.step===2&&SCE.manto==='brace'&&SCE.mode==='hero'"),'«Indietro»: di nuovo il mantello, «Brace» ancora scelto, l\'eroe torna sulla pietra');
    await p.tap('.sceBack',{force:true});await p.waitForTimeout(400);ok(await E('SCE.step')===1&&(await rows(p))[1].on,'«Indietro»: gli eroi, la Cacciatrice ancora scelta');
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(400);await p.tap('.sceGo',{force:true});await p.waitForTimeout(400);
    ok(await E("SCE.step===3&&SCE.gift==='piuma'"),'avanti di nuovo: il dono che avevi (la piuma)');
    await p.tap('.sceRow[data-id=cassa]',{force:true});await p.waitForTimeout(300);ok(/Carte/.test(await p.textContent('.sceStats')),'la cassa d\'argento: le carte e l\'oro che ci sono dentro');
    // IV · the name: one is offered, the dice gives another, it can be written; the summary
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(900);
    const n0=await p.inputValue('#sceNameIn');
    ok(await E('SCE.step')===4&&/Come ti chiami/.test(await title(p))&&await p.isVisible('#sceNameIn')&&n0.length>1&&/Inizia/.test(await p.textContent('.sceGo')),`«Avanti»: il nome (ne propone uno: «${n0}»), «Inizia»`);
    ok(await E("SCE.mode==='hero'&&!SCE.gcur"),'il dono vola nell\'eroe, che torna sulla pietra');
    await p.tap('.sceDice',{force:true});await p.waitForTimeout(200);const n1=await p.inputValue('#sceNameIn');ok(n1!==n0&&n1.length>1,`il dado: un altro nome («${n1}»)`);
    await p.fill('#sceNameIn','Lupo  <Grigio>');await p.waitForTimeout(100);await p.$eval('#sceNameIn',e=>e.blur());await p.waitForTimeout(150);
    ok(await p.inputValue('#sceNameIn')==='Lupo Grigio'&&/Lupo Grigio/.test(await p.textContent('.sceDesc h3')),'scritto a mano: ripulito («Lupo Grigio»), nel riepilogo');
    await p.fill('#sceNameIn','Bartolomeo il Grande');await p.$eval('#sceNameIn',e=>e.blur());await p.waitForTimeout(100);ok((await p.inputValue('#sceNameIn')).length<=14&&(await E('SCE.name')).length<=14,'al massimo 14 lettere');
    await p.fill('#sceNameIn','Lupo Grigio');await p.waitForTimeout(100);
    const sum=await p.$$eval('.sceSum li',l=>l.map(x=>x.textContent.replace(/\s+/g,' ').trim()));
    ok(sum.length===3&&/Cacciatrice/.test(sum[0])&&/Brace/.test(sum[1])&&/Cassa d'argento/.test(sum[2]),'riepilogo: Cacciatrice, Brace, Cassa d\'argento');
    await shot('5_nome');
    await p.tap('.sceSum li[data-go="2"]',{force:true});await p.waitForTimeout(400);ok(await E('SCE.step')===2,'un tocco sul mantello del riepilogo: torna al mantello');
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(300);await p.tap('.sceGo',{force:true});await p.waitForTimeout(400);
    ok(await E('SCE.step')===4&&await p.inputValue('#sceNameIn')==='Lupo Grigio','avanti fino al nome: «Lupo Grigio» è rimasto');
    // Inizia: the band with the name, then the menu with her, her mantle and the chest
    await p.tap('.sceGo',{force:true});await p.waitForTimeout(1800);
    ok(await E("SCE.el&&SCE.el.classList.contains('band')")&&/Lupo Grigio/.test(await p.textContent('.sceBand')),'«Inizia»: «Il viaggio ha inizio», col nome');await shot('6_fine');
    await p.waitForTimeout(3600);
    const m=await E("({sce:SCE.on,el:!!document.getElementById('sceScr'),menu:!$('menu').hidden,music:AU.cur&&AU.cur.name,hero:SAVE.hero,heroes:SAVE.heroes,starter:SAVE.starter,dono:SAVE.dono,slots:SAVE.slots,pname:SAVE.pname,skin:SAVE.skin,hood:heroStyle().hood,pA:HERO_BY.arciere.price,pC:HERO_BY.cacciatrice.price,pB:HERO_BY.balestriere.price,ls:JSON.parse(localStorage.getItem(SAVE_KEY))})");
    ok(!m.sce&&!m.el&&m.menu&&m.music==='menu','poi il menu, con la sua musica');
    ok(m.hero==='cacciatrice'&&m.starter==='cacciatrice'&&JSON.stringify(m.heroes)==='{"cacciatrice":1}','la Cacciatrice in campo, ed è l\'unica eroina che hai');
    ok(m.dono==='cassa'&&m.slots.some(s=>s&&s.type==='argento'&&s.state==='ready')&&m.ls.starter==='cacciatrice'&&m.ls.dono==='cassa','la cassa d\'argento è tra le tue casse, pronta (e tutto è salvato)');
    ok(m.pname==='Lupo Grigio'&&m.skin==='brace'&&m.hood==='#d4492f'&&m.ls.pname==='Lupo Grigio'&&m.ls.skin==='brace'&&m.ls.skins&&m.ls.skins.brace,'il nome e il mantello «Brace» nel salvataggio, e l\'eroe del menu lo indossa');
    ok(m.pA===3000&&m.pC===0&&m.pB===7000,'prezzi: Arciere 3.000, Cacciatrice gratis, Balestriere 7.000');
    ok(/Dono: Cassa d'argento/.test(await E("$('toast').textContent")),'un avviso ricorda il dono');await shot('7_menu');
    await E("renderProfile()");await p.waitForTimeout(300);
    const pr=await E("({n:$('pName').textContent,chip:(document.querySelector('#skins [data-skin=brace]')||{}).className||'',lock:(document.querySelector('#skins [data-skin=corvo]')||{}).disabled})");
    ok(pr.n==='Lupo Grigio'&&/\bon\b/.test(pr.chip)&&pr.lock===false,'nel Profilo: il nome, «Manto di brace» indossato, gli altri mantelli della creazione disponibili');
    await E("setTab('tabHero')");await p.waitForTimeout(600);ok(/In campo/.test(await p.textContent('#hAct')),'scheda Eroi: la Cacciatrice «In campo»');
    await E("heroView='arciere';renderHero()");await p.waitForTimeout(400);ok(/Sblocca\s*3\.000/.test(await p.textContent('#hAct')),'scheda Eroi: l\'Arciere «Sblocca 3.000»');
    // reopen: no choice, no intro, and the Arciere is not given back by the save's repair; the mantle is still on
    await p.reload();await p.waitForTimeout(1500);
    const r=await E("({sce:SCE.on,intro:INTRO.on,menu:!$('menu').hidden,hero:SAVE.hero,heroes:SAVE.heroes,pA:HERO_BY.arciere.price,hood:heroStyle().hood,pname:SAVE.pname})");
    ok(!r.sce&&!r.intro&&r.menu&&r.hero==='cacciatrice'&&JSON.stringify(r.heroes)==='{"cacciatrice":1}'&&r.pA===3000,'riaprendo il gioco: subito il menu, l\'Arciere non è regalato');
    ok(r.hood==='#d4492f'&&r.pname==='Lupo Grigio','riaprendo: il mantello e il nome restano');
    await E("SAVE.gold=3500;setTab('tabHero');heroView='arciere';renderHero()");await p.waitForTimeout(300);
    await p.click('#hAct [data-hact=buy]');await p.waitForTimeout(200);await p.click('#hAct [data-hact=buy]');await p.waitForTimeout(400);
    const k=await E("({heroes:SAVE.heroes,hero:SAVE.hero,gold:SAVE.gold})");ok(k.heroes.arciere===1&&k.hero==='arciere'&&k.gold===500,'l\'Arciere si compra per 3.000 oro');
    await cx.close()}

  // 2. the keyboard: Esc skips the intro, the arrows move, Enter goes on, Esc goes back; writing the name, only Enter and Esc count
  {const {p,cx,E}=await phone(null);
    await p.keyboard.press('Enter');await p.waitForTimeout(800);await p.keyboard.press('Escape');await p.waitForTimeout(900);
    ok(await E('SCE.on&&SCE.step===1'),'Invio fa partire l\'intro, Esc la salta: la creazione');
    await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');await p.waitForTimeout(200);ok(await E('SCE.sel')==='balestriere','freccia giù due volte: il Balestriere');
    await p.keyboard.press('Enter');await p.waitForTimeout(200);ok(await E('SCE.step')===1,'Invio sul Balestriere bloccato: si resta lì');
    await p.keyboard.press('ArrowUp');await p.keyboard.press('Enter');await p.waitForTimeout(300);ok(await E('SCE.step===2&&SCE.sel')==='cacciatrice','freccia su e Invio: la Cacciatrice, il mantello');
    await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');await p.waitForTimeout(150);ok(await E('SCE.manto')==='muschio','freccia giù due volte: il mantello «Muschio»');
    await p.keyboard.press('Enter');await p.waitForTimeout(250);await p.keyboard.press('ArrowDown');await p.waitForTimeout(150);ok(await E("SCE.step===3&&SCE.gift")==='cristalli','Invio e freccia giù: il dono, i cristalli');
    await p.keyboard.press('Escape');await p.waitForTimeout(200);ok(await E('SCE.step')===2,'Esc: di nuovo il mantello');
    await p.keyboard.press('Enter');await p.waitForTimeout(250);ok(await E('SCE.step===3&&SCE.gift')==='cristalli','Invio: il dono che avevi (i cristalli)');
    await p.keyboard.press('Enter');await p.waitForTimeout(400);ok(await E('SCE.step')===4,'Invio: il nome');
    await p.focus('#sceNameIn');await p.keyboard.press('Control+A');await p.keyboard.type('Ortica');await p.keyboard.press('ArrowUp');await p.keyboard.press('Escape');await p.waitForTimeout(150);
    ok(await E("SCE.step===4&&SCE.name")==='Ortica'&&!(await E("document.activeElement&&document.activeElement.id==='sceNameIn'")),'scrivendo il nome le frecce non cambiano passo; Esc chiude solo la tastiera');
    await p.focus('#sceNameIn');await p.keyboard.press('Enter');await p.waitForTimeout(5000);
    const s=await E("({sce:SCE.on,hero:SAVE.hero,gems:SAVE.gems,dono:SAVE.dono,pname:SAVE.pname,skin:SAVE.skin,menu:!$('menu').hidden})");
    ok(!s.sce&&s.menu&&s.hero==='cacciatrice'&&s.gems===30&&s.dono==='cristalli'&&s.pname==='Ortica'&&s.skin==='muschio','Invio nel nome: Ortica, la Cacciatrice col mantello di muschio e 30 cristalli, poi il menu');
    await cx.close()}

  // 3. the gifts, each on its own into a new save; and the phoenix feather in battle
  {const {p,cx,E}=await phone({...OLD,runs:0,introSeen:1,gems:0,gold:60,slots:[{type:'legno',state:'ready'},null,null,null]});
    ok(await E('SCE.on&&!INTRO.on'),'chiuso a metà (intro vista, nessun eroe preso): la creazione torna subito sopra il menu');
    const d=await E(`(()=>{const out={};for(const g of SCE_GIFTS){const keep=JSON.stringify(SAVE);g.give();out[g.id]={gold:SAVE.gold,gems:SAVE.gems,slots:SAVE.slots.map(s=>s&&s.type+':'+s.state).join(),ring:!!(SAVE.items.anello_falco&&SAVE.eq.anello==='anello_falco'),piuma:SAVE.piuma||0};
      const s=JSON.parse(keep);for(const k of Object.keys(SAVE))delete SAVE[k];Object.assign(SAVE,s)}return out})()`);
    ok(d.oro.gold===560&&d.cristalli.gems===30&&d.cassa.slots==='legno:ready,argento:ready,,'&&d.anello.ring&&d.piuma.piuma===1,'i cinque doni: 500 oro, 30 cristalli, la cassa d\'argento pronta, l\'anello indossato, la piuma');
    // the mantles of the creation are always yours, also in a save put back without them (after the intro, or from a code)
    ok(await E("(()=>{delete SAVE.skins;SAVE.skin='notte';const h=heroStyle().hood;return h==='#4a6bc4'&&SAVE.skins.notte===1})()"),'i mantelli della creazione restano tuoi anche in un salvataggio che li ha persi');
    await E("SAVE.skin=null;sceClose(false)");await p.waitForTimeout(300);
    await E("SAVE.piuma=1;SAVE.starter='arciere';startRun()");await p.waitForTimeout(1800);
    await E('P.revive=0;P.hp=0;die()');await p.waitForTimeout(600);
    const f=await E("({hp:P.hp,max:P.maxhp,state:G.state,piuma:SAVE.piuma,rev:!$('revScr').hidden})");ok(f.hp===f.max&&f.state!=='dead'&&f.piuma===0&&!f.rev,'la piuma della fenice: alla prima caduta ti rialzi, e la piuma è finita');
    await E('P.inv=0;P.hp=0;die()');await p.waitForTimeout(2200);ok(await E(`G.state==='dead'`),'alla seconda caduta niente piuma: si cade davvero');
    await cx.close()}

  // 4. phones of every size: nothing cut, everything on the screen, the stone over the panel; a small phone with low effects
  for(const[w,h] of[[390,763],[375,667],[414,820],[320,568]]){const {p,cx,E,shot}=await phone({gold:60,items:OLD.items,eq:OLD.eq,introSeen:1},w,h);
    const bad=[];for(const s of[1,2,3,4]){if(s>1){await E(`sceToStep(${s})`);await p.waitForTimeout(450)}
      const c1=await cut(p);if(c1.length)bad.push(`passo ${s}: tagliati ${c1.join(', ')}`);
      const out=await p.evaluate(()=>{const S=document.getElementById('sceScr').getBoundingClientRect();return[...document.querySelectorAll('#sceScr .sceRow,#sceScr dd,#sceScr .sceBtn,#sceScr .sceDesc,#sceScr .sceNameBox')].filter(e=>{if(!e.offsetWidth)return false;const r=e.getBoundingClientRect();return r.left<S.left-1||r.right>S.right+1||r.bottom>S.bottom+1}).length});
      if(out)bad.push(`passo ${s}: ${out} pezzi fuori dallo schermo`);
      const sp=await E("(()=>{const S=sceSpot(),c=$('sceCv').getBoundingClientRect(),d=SCE.el.querySelector('.sceBot').getBoundingClientRect();return c.top+S.y+S.k*.58*11.4-d.top})()");if(sp>.5)bad.push(`passo ${s}: la pietra sotto il pannello di ${sp.toFixed(1)} px`)}
    ok(!bad.length,`${w}×${h}: i quattro passi stanno nello schermo, niente tagliato`+(bad.length?' — '+bad.join('; '):''));
    if(w===390)await shot('8_390x763_nome');await cx.close()}
  {const {p,cx,E,shot}=await phone({gold:60,items:OLD.items,eq:OLD.eq,introSeen:1,set:{q:'bassa',vib:true,left:false,mv:.8,sv:.8}},360,640);
    ok(await E("SCE.on&&LOWFX"),'effetti ridotti (360×640): la creazione c\'è');
    await p.tap('.sceRow[data-id=druida]',{force:true});await p.waitForTimeout(800);const ld=await lit(p);ok(ld>.15,`effetti ridotti: il Druida si vede (${(ld*100).toFixed(0)}%)`);
    const fit=await p.evaluate(()=>{const s=document.getElementById('sceScr').getBoundingClientRect();return[...document.querySelectorAll('#sceScr .sceRow,#sceScr dd,#sceScr .sceBtn,#sceScr .sceDesc')].every(e=>{const r=e.getBoundingClientRect();return!e.offsetWidth||(r.left>=s.left-1&&r.right<=s.right+1&&r.bottom<=s.bottom+1)})});
    ok(fit,'su un telefono piccolo tutto sta nello schermo');await shot('9_piccolo_effetti_ridotti');
    await cx.close()}
  // how long a frame of the screen takes (the computer of the tests draws without a graphics card: a phone does the light far faster;
  // a phone that cannot keep up gets the light passes off by itself, SCE.low)
  {const {p,cx,E}=await phone({gold:60,items:OLD.items,eq:OLD.eq,introSeen:1});
    const T=(n)=>`(()=>{const c=document.getElementById('sceCv').getContext('2d');const t0=performance.now();for(let i=0;i<${n};i++){sceTick(1/60);c.getImageData(0,0,1,1)}return (performance.now()-t0)/${n}})()`;
    await E("SCE.manual=true;scePick('cacciatrice')");const ms=await E(T(60));
    await E("SCE.low=true");const lo=await E(T(60));await E("SCE.low=false");
    console.log(`        un fotogramma della creazione: ${ms.toFixed(1)} ms (leggero: ${lo.toFixed(1)} ms) sul computer di prova`);ok(ms<60&&lo<25,'un fotogramma sotto i 60 ms, quello leggero sotto i 25');
    await E("sceToStep(2);sceToStep(3)");const ms2=await E(T(60));console.log(`        un fotogramma col dono: ${ms2.toFixed(1)} ms`);ok(ms2<60,'col dono, sotto i 60 ms');
    await E("for(const k of ['move','back','lock','ok','band','absorb'])sceSnd(k)");
    // a slow phone: the light passes go off by themselves
    await E("SCE.low=false;SCE.slow=0;SCE.ema=0;{const _d=sceDraw;sceDraw=function(){const t=performance.now();_d.apply(this,arguments);while(performance.now()-t<45);}}SCE.manual=false");
    await p.waitForTimeout(2600);ok(await E('SCE.low'),'su un telefono lento (fotogrammi da 45 ms) la luce si alleggerisce da sola');
    await cx.close()}

  // 5. old saves never see it
  {const {p,cx,E}=await phone(OLD);const s=await E("({sce:SCE.on,menu:!$('menu').hidden,hero:SAVE.hero,heroes:SAVE.heroes,pA:HERO_BY.arciere.price,pC:HERO_BY.cacciatrice.price})");
    ok(!s.sce&&s.menu&&s.hero==='arciere'&&s.heroes.arciere===1&&s.pA===0&&s.pC===3000,'salvataggio vecchio: niente creazione, Arciere gratis e Cacciatrice a 3.000');await cx.close()}
  {const {p,cx,E}=await phone({...OLD,introSeen:undefined});await E('introEnd()');await p.waitForTimeout(400);const s=await E("({sce:SCE.on,menu:!$('menu').hidden})");
    ok(!s.sce&&s.menu,'salvataggio con partite ma senza intro: dopo l\'intro il menu, come prima');await cx.close()}

  ok(!errs.length,'nessun errore nella pagina'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
  console.log(fails?`\n${fails} controlli NON passati`:'\nTutto a posto.');await b.close();srv.close();process.exit(fails?1:0)})();
