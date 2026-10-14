// Musiche dei boss (punto 51): entrando nella stanza del boss la musica dell'arena si abbassa e aspetta; quando il boss compare parte il
// suo tema; al colpo finale la musica si chiude (filtro) e cala; nel clou della morte l'accordo di vittoria e poi «vittoria»; nel menu
// tutto torna aperto. Anche il Mimic delle casse gemelle col suo tema. Uso: python3 tests/mk.py && node tests/bossmusica.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:0,trBest:0,runs:4,introSeen:1,handSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1200);
const E=s=>p.evaluate(s=>__E(s),s),R=[],ok=(n,c)=>R.push((c?'  ok  ':'  NO  ')+n);
await E(`initAudio();AU.ctx.resume();document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun();paused=false;setInterval(()=>{if(!$('skScr').hidden)pick(0);P.hp=P.maxhp},60);0`);
await p.waitForTimeout(1500);
const st=()=>E(`JSON.stringify({m:AU.cur&&AU.cur.name,boss:!!BMTRACK[AU.cur&&AU.cur.name],duck:AU.duck,f:AU.mlp?Math.round(AU.mlp.frequency.value):null,pend:BM.pend,room:G.room})`).then(JSON.parse);
const s0=await st();ok('nella prima stanza la musica dell\'arena ('+s0.m+')',s0.m&&!s0.boss);
// straight to the boss room of the arena
await E(`(()=>{const idx=G.seq.findIndex(s=>s.c===ROOMS);G.si=idx-1;G.enemies=[];nextStep()})()`);await p.waitForTimeout(150);
const s1=await st();ok('entrando dal boss la musica resta quella di prima e si abbassa ('+s1.m+', '+s1.duck+'), il tema aspetta ('+s1.pend+')',s1.m===s0.m&&s1.duck<.5&&s1.pend==='golem');
let s2=s1;for(let i=0;i<40&&s2.m!=='golem';i++){await p.waitForTimeout(150);s2=await st()}
ok('quando il Golem compare parte il suo tema, un po\' più basso ('+s2.m+', '+s2.duck+')',s2.m==='golem'&&s2.duck>.8&&s2.duck<1&&!s2.pend);
const intro=await E(`(()=>{const b=G.enemies.find(e=>isBoss(e.type));return b?{iT:b.iT,intro:b.intro}:null})()`);ok('a metà della sua entrata ('+JSON.stringify(intro)+')',intro&&intro.iT>0);
await p.waitForTimeout(2500);
// the finishing blow
await E(`(()=>{const e=G.enemies.find(e=>isBoss(e.type));hurtE(e,e.hp+1,false)})()`);await p.waitForTimeout(600);
const s3=await st();ok('al colpo finale la musica si chiude e cala (filtro '+s3.f+' Hz, '+s3.duck+')',s3.f<2000&&s3.duck<.5);
let s4=s3;for(let i=0;i<40&&s4.m!=='vittoria';i++){await p.waitForTimeout(150);s4=await st()}await p.waitForTimeout(600);s4=await st();
ok('dopo l\'accordo di vittoria, la musica calma ('+s4.m+', filtro '+s4.f+')',s4.m==='vittoria'&&s4.f>15000&&s4.duck===1);
// the menu: all open
await E(`endRun(true,true);showMenu();0`);await p.waitForTimeout(400);const s5=await st();ok('nel menu la sua musica, tutto aperto ('+s5.m+', '+s5.f+')',s5.m==='menu'&&s5.f>15000&&s5.duck===1&&!s5.pend);
// the Mimic of the twin chests: its own theme
await E(`startRun();paused=false;0`);await p.waitForTimeout(800);const m0=await st();
await E(`bmIn('mimic');0`);await p.waitForTimeout(700);const m1=await st();ok('il Mimic col suo tema ('+m1.m+')',m1.m==='mimic');
await E(`(()=>{bmDie('mimic');bmWin('mimic')})()`);await p.waitForTimeout(2200);const m2=await st();ok('dopo il Mimic torna la musica di prima ('+m2.m+', prima '+m0.m+')',m2.m===m0.m);
console.log(R.join('\n'));console.log('ERR',JSON.stringify(errs));console.log(R.some(r=>r.startsWith('  NO'))?'prove non passate':'tutte le prove passate');await b.close()})();
