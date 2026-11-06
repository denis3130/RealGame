// the menu that opens slowly (src/js/120-menu-graduale.js): a new player sees only Gioca, the islands, the chests and the Armory; the
// tabs, Sfida and Abisso keep the lock and the level; after the first match the Missions with «Si è aperto!» (in the Classica inside «Premi»,
// whose panel shows only what is open); level by level the rest, in the Zombie too; a
// locked tab says when it opens; «Nuovo» goes away at the first tap; the daily login doesn't open by itself while closed; an old save has
// everything open; photos on two phones; no errors. python3 tests/a50/mk.py, then node tests/a50/menu.js
const {chromium}=require('playwright');const D=__dirname+'/';
const NEW={gold:300,gems:30,trophies:0,runs:0,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},
  eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],apre:{on:1,seen:{},nuovo:{}}};
const OLD=Object.assign({},NEW,{runs:3,apre:undefined});
(async()=>{const b=await chromium.launch();let nOk=0,nKo=0;const ok=(t,c,x)=>{c?nOk++:nKo++;console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''))};
  const open=async(save,vp)=>{const p=await b.newPage({viewport:vp||{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await p.addInitScript(s=>{localStorage.setItem('cripta_save_v1',s)},JSON.stringify(save));await p.goto('file://'+D+'test_a50.html');
    await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
    const E=s=>p.evaluate(s=>__E(s),s);await E(`try{introEnd()}catch(e){};INTRO.on=false;try{closeSheet()}catch(e){};setTab('tabPlay');0`);await p.waitForTimeout(600);return{p,E,errs}};
  const VIS=`window.__vis=s=>{const e=document.querySelector(s);return!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden'};
    window.__rows=()=>{const b=$('cnPremiBtn'),p=$('cnPremi');if(!b||!p)return null;if(p.hidden)b.click();const r=[...p.querySelectorAll('.cnPrR')].filter(x=>x.getClientRects().length).map(x=>x.dataset.id+(x.classList.contains('apNuovo')?'*':''));p.hidden=true;return r};
    window.__lk=s=>{const e=document.querySelector(s);return e?{lock:e.classList.contains('apLock'),lv:(e.querySelector('.apLv b')||{}).textContent||''}:null};0`;
  // ---------- un giocatore nuovo
  let{p,E,errs}=await open(NEW);await E(VIS);
  const st=JSON.parse(await E(`JSON.stringify({gioca:__vis('#playBtn'),premi:__vis('#cnPremiBtn'),miss:__vis('#misBtn'),acc:__vis('#loginBtn'),ruota:__vis('#wheelBtn'),pass:__vis('#passBtn'),mano:__vis('#zHand'),
    riga:__vis('#cnModeRow'),albero:__vis('#cnTrBtn'),evento:__vis('#evtBtn'),eroi:__lk('#tabs [data-tab="tabHero"]'),comp:__lk('#tabs [data-tab="tabPets"]'),bott:__lk('#tabs [data-tab="tabShop"]'),
    armeria:__lk('#tabs [data-tab="tabGear"]'),sfida:__lk('#chalBtn'),abisso:__lk('#abyssBtn')})`));
  ok('giocatore nuovo: Gioca c\'è; «Premi», le Missioni, l\'accesso, la Ruota, il Pass, la manina, la fila sopra Gioca, l\'Albero e l\'Evento no',
    st.gioca&&!st.premi&&!st.miss&&!st.acc&&!st.ruota&&!st.pass&&!st.mano&&!st.riga&&!st.albero&&!st.evento,st);
  ok('le linguette Eroi, Compagni e Bottega col lucchetto e il livello; l\'Armeria aperta',st.eroi.lock&&st.eroi.lv==='Liv. 2'&&st.comp.lv==='Liv. 4'&&st.bott.lv==='Liv. 5'&&!st.armeria.lock);
  ok('Sfida e Abisso accanto a Gioca col lucchetto (Liv. 7)',st.sfida.lock&&st.sfida.lv==='Liv. 7'&&st.abisso.lock);
  await p.screenshot({path:D+'me_nuovo.png'});
  // un tocco sulla linguetta chiusa dice quando si apre e non la apre
  await E(`document.querySelector('#tabs [data-tab="tabHero"]').click();0`);await p.waitForTimeout(300);
  const tt=JSON.parse(await E(`JSON.stringify({toast:toastEl.textContent||'',eroi:!$('tabHero').hidden})`));
  ok('la linguetta chiusa dice «Si apre al livello 2» e non si apre',/livello 2/.test(tt.toast)&&!tt.eroi,tt);
  // l'accesso di ogni giorno non si apre da solo finché è chiuso
  await E(`SAVE.runs=1;save();showMenu();0`);await p.waitForTimeout(1500);
  ok('l\'accesso di ogni giorno non si apre da solo finché è chiuso',await E(`SHEET!=='login'||$('sheetScr').hidden`));
  // dopo la prima partita: «Si è aperto: Le Missioni», poi il bottone con «Nuovo»
  const pop1=await p.waitForFunction(()=>{const e=document.querySelector('#apPop h3');return e&&e.textContent},null,{timeout:6000}).then(h=>h.jsonValue()).catch(()=>'');
  await p.waitForTimeout(500);await p.screenshot({path:D+'me_pop.png'});ok('dopo la prima partita la finestra «Si è aperto!»: Le Missioni',pop1==='Le Missioni',pop1);
  await E(`document.querySelector('#apPop button').click();0`);await p.waitForTimeout(500);
  const pr1=JSON.parse(await E(`JSON.stringify({premi:__vis('#cnPremiBtn'),nuovo:$('cnPremiBtn').classList.contains('apNuovo'),righe:__rows()})`));
  ok('nella Classica ora c\'è «Premi» e brilla con «Nuovo»; dentro solo le Missioni, con «Nuovo»',pr1.premi&&pr1.nuovo&&JSON.stringify(pr1.righe)==='["misBtn*"]',pr1);
  await E(`$('cnPremiBtn').click();0`);await p.waitForTimeout(350);await p.screenshot({path:D+'me_premi.png'});
  await E(`document.querySelector('#cnPremi .cnPrR[data-id="misBtn"]').click();0`);await p.waitForTimeout(400);
  const mis=await E(`SHEET==='mis'&&!$('sheetScr').hidden`);await E(`try{closeSheet()}catch(e){};0`);await p.waitForTimeout(300);
  ok('toccate le Missioni si aprono e «Nuovo» se ne va, anche da «Premi»',mis&&await E(`!SAVE.apre.nuovo.missioni&&!$('cnPremiBtn').classList.contains('apNuovo')&&!$('misBtn').classList.contains('apNuovo')`));
  // livello dopo livello: ogni volta le finestre di quello che si apre
  const seen=[];const lvUp=async L=>{await E(`(()=>{const A=acct();while(A.lvl<${L})acctXP(acctNeed(A.lvl)-(A.xp||0));renderTop();renderBadges();renderPlay();return 1})()`);
    for(let k=0;k<6;k++){const h=await p.waitForFunction(()=>{const e=document.querySelector('#apPop h3');return e&&!document.querySelector('#apPop.out')&&e.textContent},null,{timeout:2500}).then(h=>h.jsonValue()).catch(()=>null);
      if(!h)break;seen.push(L+':'+h);if(L===3&&!seen.some(s=>s.startsWith('shot3'))){await p.waitForTimeout(600);await p.screenshot({path:D+'me_pop_zombie.png'});seen.push('shot3')}
      await E(`(document.querySelector('#apPop button')||{click(){}}).click();0`);await p.waitForTimeout(450);
      try{await E(`(()=>{const ids=['achPop','arenaUpScr'];for(const i of ids){const e=$(i);if(e&&!e.hidden&&i==='arenaUpScr')e.hidden=true}try{closeSheet()}catch(e){}return 1})()`)}catch(e){}}};
  await lvUp(2);const r2=JSON.parse(await E(`JSON.stringify(__rows())`));
  ok('al livello 2 in «Premi» ci sono le Missioni e l\'accesso, non la Ruota né i Traguardi',r2&&r2.length===2&&r2[0]==='misBtn'&&/^loginBtn/.test(r2[1]),r2);
  await lvUp(3);await E(`SAVE.modo='zombie';save();renderPlay();0`);await p.waitForTimeout(900);
  const z3=JSON.parse(await E(`JSON.stringify({mano:__vis('#zHand'),miss:__vis('#misBtn'),acc:__vis('#loginBtn'),lucky:__vis('#luckInvBtn'),pass:__vis('#zPassBtn'),bott:__vis('#zShopBtn'),trag:__vis('#achBtn')})`));
  ok('al livello 3 nella Zombie: Missioni, accesso e Lucky Cards sì; Pass Zombie, Bottega Zombie e Traguardi non ancora',z3.miss&&z3.acc&&z3.lucky&&!z3.pass&&!z3.bott&&!z3.trag,z3);
  await p.screenshot({path:D+'me_zombie3.png'});await E(`SAVE.modo='classica';save();renderPlay();0`);await p.waitForTimeout(600);
  for(const L of[4,5,6,7,8])await lvUp(L);
  const tit=seen.filter(s=>!s.startsWith('shot'));
  ok('salendo dal livello 2 all\'8 si presentano le tredici cose che mancavano, al livello giusto',tit.length===13&&tit.includes('3:La modalità Zombie')&&tit.includes('2:Eroi e talenti')&&tit.includes('8:L\'Evento della settimana'),tit);
  await E(`setTab('tabPlay');0`);await p.waitForTimeout(600);
  const all=JSON.parse(await E(`JSON.stringify({chiusi:document.querySelectorAll('.apChiuso').length,lucchetti:document.querySelectorAll('.apLock').length,mano:__vis('#zHand'),riga:__vis('#cnModeRow'),albero:__vis('#cnTrBtn'),pass:__vis('#passBtn'),evento:__vis('#evtBtn'),righe:__rows()})`));
  ok('al livello 8 è tutto aperto (anche le quattro righe di «Premi»)',all.chiusi===0&&all.lucchetti===0&&all.mano&&all.riga&&all.albero&&all.pass&&all.evento&&all.righe.length===4,all);await p.screenshot({path:D+'me_tutto.png'});
  // la Zombie: i bottoni ai lati come sempre
  await E(`SAVE.modo='zombie';save();renderPlay();0`);await p.waitForTimeout(900);
  const zo=JSON.parse(await E(`JSON.stringify({miss:__vis('#misBtn'),acc:__vis('#loginBtn'),trag:__vis('#achBtn'),pass:__vis('#zPassBtn'),bott:__vis('#zShopBtn'),chiusi:document.querySelectorAll('.apChiuso').length})`));
  ok('nella Zombie al livello 8 ai lati c\'è tutto (anche Pass e Bottega Zombie), niente di chiuso',zo.miss&&zo.acc&&zo.trag&&zo.pass&&zo.bott&&zo.chiusi===0,zo);await p.screenshot({path:D+'me_zombie.png'});
  await E(`SAVE.modo='classica';save();renderPlay();0`);await p.waitForTimeout(600);
  ok('nessun errore (giocatore nuovo)',errs.length===0,errs.slice(0,4));await p.close();
  // ---------- un salvataggio di prima: tutto aperto, nessuna finestra
  ({p,E,errs}=await open(OLD));await E(VIS);await p.waitForTimeout(1500);
  const ol=JSON.parse(await E(`JSON.stringify({apre:!!SAVE.apre,chiusi:document.querySelectorAll('.apChiuso').length,lucchetti:document.querySelectorAll('.apLock').length,pop:!!document.getElementById('apPop'),premi:__vis('#cnPremiBtn'),albero:__vis('#cnTrBtn'),righe:__rows()})`));
  ok('un salvataggio di prima ha tutto aperto e nessuna finestra',!ol.apre&&!ol.chiusi&&!ol.lucchetti&&!ol.pop&&ol.premi&&ol.albero&&ol.righe.length===4,ol);
  ok('nessun errore (salvataggio di prima)',errs.length===0,errs.slice(0,4));await p.close();
  // ---------- un telefono piccolo, da giocatore nuovo
  ({p,E,errs}=await open(NEW,{width:320,height:640}));await E(VIS);await p.screenshot({path:D+'me_piccolo.png'});
  const sm=JSON.parse(await E(`JSON.stringify({w:document.documentElement.scrollWidth,lv:__lk('#tabs [data-tab="tabShop"]')})`));ok('telefono piccolo: niente fuori dallo schermo, i lucchetti ci sono',sm.w<=320&&sm.lv.lock,sm);
  ok('nessun errore (telefono piccolo)',errs.length===0,errs.slice(0,4));
  console.log(nOk+' sì, '+nKo+' no');await b.close();process.exit(nKo?1:0)})();
