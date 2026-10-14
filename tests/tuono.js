// Arco del tuono (al posto dell'Arco delle spine) e scia dell'Anello del gelo: un salvataggio vecchio con l'Arco delle spine passa carte
// e livello all'Arco del tuono (anche impugnato); la carta ha il suo disegno; in battaglia l'eroe 3D tiene l'arco del tuono, le frecce
// hanno la punta a fulmine e ogni tanto cade un fulmine; con l'Anello del gelo camminando restano lastre di ghiaccio.
// Uso: python3 tests/mk.py && node tests/tuono.js   → tests/tu_menu.png, tests/tu_gioco.png
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:0,trBest:0,runs:4,introSeen:1,handSeen:1,login:{last:'2099-1-1',n:1},set:{q:'alta'},
  items:{arco_frassino:{lvl:1,cards:0},arco_spine:{lvl:4,cards:7},giubba:{lvl:1,cards:0},anello_gelo:{lvl:1,cards:0}},eq:{arma:'arco_spine',armatura:'giubba',anello:'anello_gelo',amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1500);
const E=s=>p.evaluate(s=>__E(s),s),R=[],ok=(n,c)=>R.push((c?'  ok  ':'  NO  ')+n);
const s0=JSON.parse(await E(`JSON.stringify({it:SAVE.items.arco_tuono,old:!!SAVE.items.arco_spine,eq:SAVE.eq.arma,item:ITEM.arco_tuono&&ITEM.arco_tuono.n,spine:!!ITEM.arco_spine})`));
ok('il salvataggio vecchio passa all\'Arco del tuono con carte e livello ('+JSON.stringify(s0)+')',s0.it&&s0.it.lvl===4&&s0.it.cards===7&&!s0.old&&s0.eq==='arco_tuono'&&s0.item==='Arco del tuono'&&!s0.spine);
const ic=await E(`(itemSVG(ITEM.arco_tuono)||'').length`);ok('la carta ha il suo disegno ('+ic+' caratteri)',ic>200);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);setTab('tabGear');0`);await p.waitForTimeout(900);await p.screenshot({path:path.join(__dirname,'tu_menu.png')});
// in battle: the bolt arrows, the lightning now and then, the frost trail while walking
await E(`startRun();paused=false;setInterval(()=>{if(!$('skScr').hidden)pick(0);P.hp=P.maxhp},60);0`);await p.waitForTimeout(1200);
const st=JSON.parse(await E(`JSON.stringify({wk:P.wk,light:P.light||0,ring:P.style&&P.style.ring})`));ok('in partita: l\'arco e il fulmine ('+JSON.stringify(st)+')',st.wk==='arco_tuono'&&st.light>=1&&st.ring==='anello_gelo');
await p.keyboard.down('ArrowLeft');await p.waitForTimeout(700);await p.keyboard.up('ArrowLeft');await p.keyboard.down('ArrowUp');await p.waitForTimeout(600);const fr=await E(`(G.frost||[]).length`);ok('camminando con l\'Anello del gelo restano lastre di ghiaccio ('+fr+')',fr>5);
await p.screenshot({path:path.join(__dirname,'tu_gioco.png')});await p.keyboard.up('ArrowUp');
console.log(R.join('\n'));console.log('ERR',JSON.stringify(errs));console.log(R.some(r=>r.startsWith('  NO'))?'prove non passate':'tutte le prove passate');await b.close()})();
