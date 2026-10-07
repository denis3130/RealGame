const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @'+((e.stack||'').split('\n')[1]||'').trim().slice(-50)));
const today=new Date();const ds=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
await p.addInitScript(([ds])=>{if(localStorage.getItem('qa_once'))return;localStorage.setItem('qa_once',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:30000,gems:3000,trophies:1300,trBest:1300,runs:12,introSeen:1,login:{last:ds,n:3},items:{arco_frassino:{lvl:3,cards:40},giubba:{lvl:3,cards:40},balestra:{lvl:1,cards:5}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],best:{room:10,gold:100},inf:{best:12,top:[]},tutDone:1,pets:{owned:{muschietto:{lvl:1,cards:5},lucciola:{lvl:1}},sel:'muschietto'}}))},[ds]);
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);
const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c)=>{R.push((c?'OK   ':'FAIL ')+n)};
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`);
// hero buy
await p.click('#tabs button[data-tab="tabHero"]');await p.waitForTimeout(400);
await p.click('.harr.r');await p.waitForTimeout(300);await p.screenshot({path:'t_hero1.png'});
await p.click('#hAct [data-hact]');await p.waitForTimeout(200);await p.screenshot({path:'t_hero2.png'});await p.click('#hAct [data-hact]');await p.waitForTimeout(500);
let s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('compra Cacciatrice',s.heroes.cacciatrice&&s.hero==='cacciatrice'&&s.gold===29200);
await p.screenshot({path:'t_hero3.png'});
await p.click('.harr.l');await p.waitForTimeout(300);await p.click('#hAct [data-hact]');await p.waitForTimeout(300);s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('torna ad Arciere',s.hero==='arciere');
// pets
await E(`heroSeg='pet';renderHero()`);await p.waitForTimeout(300);await p.screenshot({path:'t_pet1.png'});
await p.click('[data-pup="muschietto"]');await p.waitForTimeout(200);await p.click('[data-psel="lucciola"]');await p.waitForTimeout(300);
s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('compagno: migliora e scegli',s.pets.owned.muschietto.lvl===2&&s.pets.eq.includes('lucciola')&&s.pets.eq.includes('muschietto'));await p.screenshot({path:'t_pet2.png'});
// talents
await E(`heroSeg='tal';renderHero()`);await p.waitForTimeout(300);await p.click('.tbuy');await p.waitForTimeout(300);s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('talento comprato',Object.keys(s.tal).length===1);await p.screenshot({path:'t_tal.png'});
// item upgrade + equip
await E(`heroSeg='coll';renderHero();openItem('giubba')`);await p.waitForTimeout(300);await p.click('#itemPanel [data-act="up"]');await p.waitForTimeout(500);s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('oggetto migliorato',s.items.giubba.lvl===4);await p.screenshot({path:'t_item.png'});
await E(`closeItem();openItem('balestra')`);await p.waitForTimeout(200);await p.click('#itemPanel [data-act="equip"]');await p.waitForTimeout(300);s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('equipaggia balestra',s.eq.arma==='balestra');await E(`closeItem()`);
// name
await p.click('#tabs button[data-tab="tabProfile"]');await p.waitForTimeout(400);await p.click('#pName');await p.waitForTimeout(200);await p.keyboard.press('Control+A');await p.keyboard.type('Denis');await p.keyboard.press('Enter');await p.waitForTimeout(300);
s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('nome cambiato',s.pname==='Denis');
// save code roundtrip
await p.click('#gearBtn');await p.waitForTimeout(300);await p.click('[data-code="out"]');await p.waitForTimeout(300);const code=await p.$eval('#codeTa',t=>t.value);await p.screenshot({path:'t_code1.png'});
await E(`SAVE.gold=1;save()`);await p.click('[data-code="in"]');await p.waitForTimeout(200);await p.fill('#codeTa',code);await p.click('[data-codeload]');await p.waitForTimeout(400);await p.screenshot({path:'t_code2.png'});
const confirm=await p.$('[data-codeok],[data-codeyes],[data-codeconf]');if(confirm){await confirm.click();await p.waitForTimeout(500)}
await p.waitForTimeout(1500);
s=JSON.parse(await p.evaluate(()=>localStorage.getItem('cripta_save_v1')));ok('codice caricato (oro ripristinato) '+s.gold,s.gold>1000&&s.pname==='Denis');
await p.screenshot({path:'t_code3.png'});
// bad code
await E(`document.querySelectorAll('#sheetScr').forEach(e=>e.hidden=true)`);
// pause/quit in run
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr,#itemScr').forEach(e=>e.hidden=true);setTab('tabPlay')`);await p.waitForTimeout(300);
await p.click('#playBtn');await p.waitForTimeout(3500);await p.click('#pauseBtn');await p.waitForTimeout(400);await p.screenshot({path:'t_pause.png'});
ok('pausa',await E(`paused&&!$('pauseScr').hidden`));
await p.click('#resumeBtn');await p.waitForTimeout(300);ok('riprendi',await E(`!paused`));
await p.keyboard.press('p');await p.waitForTimeout(300);ok('pausa con P',await E(`paused`));
await p.click('#quitBtn');await p.waitForTimeout(2500);await p.screenshot({path:'t_quit.png'});ok('abbandona -> fine',await E(`!$('endScr').hidden`));
await p.click('#menuBtn');await p.waitForTimeout(800);ok('torna al menu',await E(`!$('menu').hidden`));
// keyboard play
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`);await p.click('#playBtn');await p.waitForTimeout(2500);
const y0=await E('P.y');await p.keyboard.down('ArrowUp');await p.waitForTimeout(600);await p.keyboard.up('ArrowUp');const y1=await E('P.y');ok('muovi con frecce',y1<y0-20);
await E('P.dashCd=0');await p.keyboard.press('Space');await p.waitForTimeout(50);ok('scatto con spazio',await E('P.dashT>0||P.dashCd>0'));
await E('P.ult=100');await p.keyboard.press('q');await p.waitForTimeout(100);ok('abilità con Q',await E('P.ult<100'));
// touch drag
const y2=await E('P.y');await p.mouse.move(195,600);await p.mouse.down();await p.mouse.move(195,500,{steps:5});await p.waitForTimeout(500);await p.mouse.up();const y3=await E('P.y');ok('muovi trascinando',y3<y2-10);
// death with gems -> revive
await E('SAVE.gems=100;P.revive=0;P.hp=0;die()');await p.waitForTimeout(4500);await p.screenshot({path:'t_revive.png'});ok('schermata rinascita',await E(`!$('revScr').hidden`));
await p.click('#rvYes');await p.waitForTimeout(800);ok('rinascita',await E(`P.hp>0&&!paused&&G.state!=='dead'`));
await E('P.hp=0;die()');await p.waitForTimeout(4500);ok('seconda morte: niente rinascita',await E(`$('revScr').hidden||$('rvYes').disabled`));await p.screenshot({path:'t_dead2.png'});
await p.waitForTimeout(6000);await p.screenshot({path:'t_dead3.png'});ok('fine partita dopo morte',await E(`!$('endScr').hidden`));
// reload persistence
await p.reload();await p.waitForTimeout(1500);s=JSON.parse(await E('JSON.stringify(SAVE)'));ok('salvataggio dopo ricarica',s.pname==='Denis'&&s.heroes.cacciatrice&&s.items.giubba.lvl===4);
// intro replay from settings keeps save
const before=await E('JSON.stringify(SAVE)');await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);setTab('tabProfile')`);await p.click('#gearBtn');await p.waitForTimeout(300);await p.click('[data-intro]');await p.waitForTimeout(3000);await p.screenshot({path:'t_intro.png'});
ok('intro parte',await E('INTRO.on'));await p.waitForTimeout(25000);ok('intro finisce al menu',await E(`!INTRO.on&&!$('menu').hidden`));
const after=await E('JSON.stringify(SAVE)');const a=JSON.parse(after),bb=JSON.parse(before);delete a.introSeen;delete bb.introSeen;ok('intro non tocca il salvataggio',JSON.stringify(a)===JSON.stringify(bb));
await p.screenshot({path:'t_after_intro.png'});
console.log(R.join('\n'));console.log('ERRORS',JSON.stringify(errs,null,1));await b.close()})();
