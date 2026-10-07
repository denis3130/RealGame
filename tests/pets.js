const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:400,trophies:600,trBest:600,runs:4,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c)=>R.push((c?'OK   ':'FAIL ')+n);
ok('nuovo giocatore senza compagno',await E(`SAVE.pets.eq.length===0&&Object.keys(SAVE.pets.owned).length===0`));
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);setTab('tabHero');heroSeg='pet';renderHero()`);await p.waitForTimeout(400);await p.screenshot({path:'pt_1.png'});
// roll many chests: how often pet cards appear
const st=await E(`(()=>{const o={legno:0,argento:0,oro:0},n=2000;for(const t in o){for(let i=0;i<n;i++){const r=rollChest(t);if(r.cards.some(c=>c.id.startsWith('pet:')))o[t]++}o[t]=(o[t]/n*100).toFixed(0)+'%'}return JSON.stringify(o)})()`);console.log('pet cards per chest',st);
// open a gold chest with forced pet cards close to unlock
await E(`SAVE.pets.cards.muschietto=4;window._r=rollChest;rollChest=function(t){const r=window._r(t);r.cards=r.cards.filter(c=>!c.id.startsWith('pet:'));r.cards.push({id:'pet:muschietto',n:3});return r}`);
await E(`openChest('oro');0`);let shots=0;
for(let t=0;t<40;t++){await p.waitForTimeout(350);const st2=await E(`({h:$('chestScr').hidden,txt:$('cardStage').innerText.slice(0,80),d:!$('cdone').hidden})`);if(st2.d){await E(`$('cdone').click()`);await p.waitForTimeout(500);continue}if(st2.h)break;if(st2.txt.includes('Muschietto')&&shots<2){await p.waitForTimeout(1600);await p.screenshot({path:'pt_card'+(shots++)+'.png'})}await p.mouse.click(195,700)}
let s=JSON.parse(await E('JSON.stringify(SAVE.pets)'));ok('sbloccato con le carte (4+3≥6, avanza 1), non equipaggiato da solo '+JSON.stringify(s),s.owned.muschietto&&s.owned.muschietto.cards===1&&s.eq.length===0);
await E(`rollChest=window._r`);
// gem unlock
await E(`closeSheet&&0;$('chestScr').hidden=true;setTab('tabHero');heroSeg='pet';renderHero()`);await p.waitForTimeout(300);
await p.click('[data-pbuy="lucciola"]');await p.waitForTimeout(300);s=JSON.parse(await E('JSON.stringify({p:SAVE.pets,g:SAVE.gems})'));ok('sblocca Lucciola con gemme, non equipaggiata',s.p.owned.lucciola&&s.g===250&&s.p.eq.length===0);
// manual equip: two at most, a third replaces the oldest
await p.click('[data-psel="muschietto"]');await p.waitForTimeout(200);await p.click('[data-psel="lucciola"]');await p.waitForTimeout(200);s=JSON.parse(await E('JSON.stringify(SAVE.pets)'));ok('due compagni con te '+JSON.stringify(s.eq),s.eq.join()==='muschietto,lucciola');
await E(`SAVE.pets.owned.draghetto={lvl:1,cards:0};renderPets()`);await p.click('[data-psel="draghetto"]');await p.waitForTimeout(200);s=JSON.parse(await E('JSON.stringify(SAVE.pets)'));ok('il terzo prende il posto del primo '+JSON.stringify(s.eq),s.eq.join()==='lucciola,draghetto');
await p.click('[data-pdrop="draghetto"]');await p.waitForTimeout(200);s=JSON.parse(await E('JSON.stringify(SAVE.pets)'));ok('lascia a casa '+JSON.stringify(s.eq),s.eq.join()==='lucciola');await E(`SAVE.pets.eq.push('muschietto');renderPets()`);
// upgrade needs cards
const dis=await p.$eval('[data-pup="lucciola"]',b=>b.disabled);ok('migliora bloccato senza carte',dis);
await E(`SAVE.pets.owned.lucciola.cards=5;renderPets()`);await p.click('[data-pup="lucciola"]');await p.waitForTimeout(300);s=JSON.parse(await E('JSON.stringify(SAVE.pets.owned.lucciola)'));ok('migliora con carte e oro '+JSON.stringify(s),s.lvl===2&&s.cards===2);
await p.screenshot({path:'pt_2.png'});
// run uses selected pet; a run without pets works
await E(`startRun()`);await p.waitForTimeout(1500);ok('in partita con due compagni',await E(`G.pets.length===2&&G.pets[0].id==='lucciola'&&G.pets[1].id==='muschietto'`));await p.waitForTimeout(1500);await p.screenshot({path:'pt_run2.png'});await E(`endRun(false,true)`);await p.waitForTimeout(500);
await E(`SAVE.pets={owned:{},eq:[],cards:{}};startRun()`);await p.waitForTimeout(2000);ok('partita senza compagno',await E(`!G.pet&&started`));await E(`endRun(false,true)`);
// road 500
await E(`$('endScr').hidden=true;$('menu').hidden=false;setTab('tabRoad')`);await p.waitForTimeout(400);
const btn=await p.$('[data-road="500"]');if(btn){await btn.click();await p.waitForTimeout(500)}s=JSON.parse(await E('JSON.stringify(SAVE.pets)'));ok('cammino 500: 10 carte Lucciola '+JSON.stringify(s.cards),(s.cards.lucciola||0)===10);
await p.screenshot({path:'pt_road.png'});
console.log(R.join('\n'));console.log(errs);await b.close()})();
