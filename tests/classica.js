// Prova della Classica nuova (src/js/94-classica-nuova.js, solo nell'anteprima), seconda versione con le scelte di Denis: il menu (scheda coi
// bracieri, mappa senza stelle, Torre, Corsa, Reliquie, Ricercati, il bottone «Premi», la Zombie com'era); la partita d'arena con le 10 stanze
// di sempre (le ondate a tempo sono tolte: l'eroe cresce, la Furia sale, il custode alla stanza 10, la vittoria col braciere e il record);
// la Furia (ranghi, moltiplicatore per 6 secondi, colpo che la spezza, niente fiamme); le carte con la rarità a sorpresa (rivelazione,
// effetti più grandi, due livelli alle leggendarie); le evoluzioni spettacolari (la carta, la trasformazione, tutte e sei insieme senza
// errori); la Nemesi (chi ti uccide si prende l'oro, il manifesto, l'invasione in una stanza a caso col sacco, le frasi, la taglia, la
// Nemesi che cresce, il custode che tiene l'oro); la Torre fino al piano 20 e la Corsa dei boss; la scalata a giro: la torre che sale
// (piani, nemici dai bordi, la salita, i buchi, i Campioni, il premio, il custode, la torre da 20 col campione) e le trappole (percorso coi
// traguardi, trappole e nemici, la fuga dal crollo, il custode tra le trappole), la modalità sulla scheda e sulla mappa; le isole; tutto in 3D
// (gli ostacoli di 95 dipinti una volta, il disegno di prima che torna, le cose della stanza, le isole); il ponte di pietre tra le isole, la Prova
// dell'Incubo e le isole chiuse al buio; le isole verso nord col ponte che sale dritto e l'eroe che lo attraversa.
// Foto tests/cn_<n>.png. Uso: python3 anteprime/mk_classica.py --test --build && node tests/classica.js [menu|stanze|furia|rarita|evo|nemesi|torre|corsa|ondate|trappole|3d|ponte]
const {chromium}=require('playwright');const path=require('path');
const SOLO=process.argv[2]||'';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,240))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1500,gems:60,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},
    items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'classica_test.html'));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1200);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`)),W=ms=>p.waitForTimeout(ms);const R=[];const ok=(n,c,x)=>{R.push((c?'OK   ':'NO   ')+n+(x!=null?'  '+x:''));console.log(R[R.length-1])};
  let shot=0;const snap=async n=>{await p.screenshot({path:path.join(__dirname,`cn_${String(++shot).padStart(2,'0')}_${n}.png`)})};
  // qualità alta: sul computer di prova, lento, la qualità automatica passerebbe agli effetti ridotti a metà prova (carte girate subito, niente schegge)
  await E(`(()=>{document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(q=>q.hidden=true);modal=false;SAVE.set=SAVE.set||{};SAVE.set.q='alta';applySettings();return 0})()`);
  // the automatic player: god mode, a kill every few ticks, the cards (after they are revealed), the relics, the revive declined, the doors
  await E(`(()=>{window.__A={on:false,god:true,kill:true,spd:4,every:6,ends:[],log:[]};setInterval(()=>{const A=__A;if(!A.on)return;try{
    if(!$('cnRel').hidden){const c=document.querySelector('#cnRel .cnRelC');A.log.push('reliquia '+c.querySelector('b').textContent);c.click();return}
    if(!$('skScr').hidden){if(CN.revEnd&&performance.now()<CN.revEnd)return;if(skMode==='shop')closeSkills();else pick(0);return}
    if(!$('revScr').hidden){$('rvNo').click();return}
    if(!$('endScr').hidden){if(!A.endSeen){A.endSeen=1;A.ends.push({tag:$('endTag').textContent,title:$('endTitle').textContent,text:$('endText').textContent})}return}
    if(!started||paused||modal)return;if(A.god)P.hp=P.maxhp;
    for(let k=0;k<A.spd;k++){if(!started||paused||modal)break;if(G.hitstop>0)G.hitstop=0;update(.033)}
    if(G.state==='play'&&A.kill){A.kt=(A.kt||0)+1;if(A.kt%A.every===0){const e=G.enemies.find(e=>canHit(e));if(e)hurtE(e,e.hp+(e.cnSh||0)+1,false)}}
    if(G.cc&&!G.ccChosen&&G.state==='cleared'){const c=G.cc.find(c=>c.st==='idle'&&!c.bad);if(c){P.x=c.x;P.y=c.y+4}}
    if(G.prop&&!G.prop.used&&G.state==='cleared'){P.x=G.prop.x;P.y=G.prop.y+30}
    if(G.goldRun){const c=G.coins[0];if(c){P.x=c.x;P.y=c.y}}
    if(G.state==='cleared'&&G.door&&!G.goldRun&&(!G.cc||G.ccChosen||!G.cc.some(c=>c.st==='idle'))){P.x=AW/2;P.y=TOP-20}
  }catch(e){A.log.push('ERR '+e.message)}},16)})();0`);
  const toMenu=async()=>{await E(`(()=>{__A.on=false;$('endScr').hidden=true;['cnRel','cnMap','skScr','revScr'].forEach(i=>$(i)&&($(i).hidden=true));modal=false;paused=false;if(G&&!G.ended&&started){G.ended=true;started=false}showMenu();
    return 0})()`);await W(1000);await E(`(()=>{if(!$('sheetScr').hidden)closeSheet();modal=false;return 0})()`);await W(200)};
  const run=async(maxS,stop)=>{const t0=Date.now();while(Date.now()-t0<maxS*1000){await W(400);const s=await J(`({end:!$('endScr').hidden,room:G.room,st:G.state})`);if(s.end||(stop&&await E(stop)))return s}return null};
  const arena=async(a)=>{await toMenu();await E(`(()=>{LOWFX=false;SAVE.cn=SAVE.cn||{};SAVE.cn.pick=${a||0};__A.endSeen=0;__A.ends=[];__A.log=[];CN.forceRar=null;startRun();return 0})()`);await W(2400)};
  const vis=id=>`(!!$('${id}')&&$('${id}').offsetParent!==null)`;
  const openMap=async()=>{const q=await J(`(()=>{const L=ISL.lay,r=campCv.getBoundingClientRect();return{x:r.left+L.cx/L.dpr,y:r.top+(L.lab+14*L.dpr)/L.dpr}})()`);await p.mouse.click(q.x,q.y);await W(500)};
  const jump=r=>`(()=>{const k=G.seq.findIndex(q=>q.c===${r});G.si=k-1;G.enemies=[];G.eproj=[];nextStep();return 0})()`;   // straight to room r

  // ---------------------------------------------------------------- the menu
  if(!SOLO||SOLO==='menu'){
    await toMenu();
    const card=await J(`({t:$('chapCard').textContent,stars:$('chapCard').querySelectorAll('.cnCkS b').length,braz:$('chapCard').querySelectorAll('.cnTr svg').length})`);
    ok('la scheda dell\'arena: bracieri, niente stelle, porta alla mappa',card.braz===1&&card.stars===0&&/Mappa/.test(card.t)&&/0\/12/.test(card.t),card.t.slice(0,90));
    const mn=await J(`({premi:${vis('cnPremiBtn')},mis:${vis('misBtn')},login:${vis('loginBtn')},road:${vis('roadSide')},offer:${vis('offerBtn')},pass:${vis('passBtn')},chest:${vis('chestBtn')}})`);
    ok('menu: a sinistra solo «Premi», a destra Pass e Casse',mn.premi&&!mn.mis&&!mn.login&&!mn.road&&!mn.offer&&mn.pass&&mn.chest,JSON.stringify(mn));
    const is0=await J(`({cur:ISL.cur,pick:cnPick(),view:ISL.view,row:document.querySelectorAll('#cnModeRow .cnMode').length,rowVis:${vis('cnModeRow')},card:${vis('chapCard')},lay:!!ISL.lay})`);await snap('isole');
    ok('le isole: l\'eroe sull\'isola dell\'arena, i quattro modi sopra Gioca, la scheda nascosta',is0.cur===is0.pick&&is0.view===is0.pick&&is0.row===4&&is0.rowVis&&!is0.card&&is0.lay,JSON.stringify(is0));
    {const q=await J(`(()=>{const r=$('homeStage').getBoundingClientRect(),L=ISL.lay;return{x:r.left+r.width*.72,y:campCv.getBoundingClientRect().top+L.cy/L.dpr}})()`);
      await p.mouse.move(q.x,q.y);await p.mouse.down();for(let i=1;i<=8;i++){await p.mouse.move(q.x-i*22,q.y);await W(16)}await p.mouse.up();await W(1200)}
    const is1=await J(`({cur:ISL.cur,view:ISL.view,zm:zMode()})`);await snap('isole_chiusa');
    await E(`(()=>{goPlay('arena');return 0})()`);await W(300);const is2=await J(`({started,toast:($('toast')||{}).textContent||''})`);
    ok('scorrendo si vede l\'isola chiusa, l\'eroe resta e «Gioca» dice come aprirla',is1.view===1&&is1.cur===0&&!is1.zm&&!is2.started&&/Finisci il ponte/.test(is2.toast),JSON.stringify({is1,is2}));
    await E(`(()=>{ISL.view=ISL.cur;return 0})()`);
    await p.click('#cnPremiBtn');await W(450);const pr=await J(`({open:!$('cnPremi').hidden,rows:document.querySelectorAll('#cnPremi .cnPrR').length})`);await snap('menu_premi');
    ok('«Premi» apre Missioni, Accesso, Ruota e Traguardi',pr.open&&pr.rows===4,JSON.stringify(pr));
    await p.click('#cnPremi .cnPrR[data-id="misBtn"]');await W(600);const ms=await J(`({sheet:SHEET,vis:!$('sheetScr').hidden})`);ok('dal pannello si aprono le Missioni',ms.vis&&ms.sheet==='mis',JSON.stringify(ms));
    await E(`(()=>{closeSheet();modal=false;return 0})()`);
    const zm=await J(`(()=>{const m=$('menu');m.classList.add('zmode');const r={premi:${vis('cnPremiBtn')},mis:${vis('misBtn')}};m.classList.remove('zmode');return r})()`);ok('nella Zombie il menu resta com\'era',!zm.premi&&zm.mis,JSON.stringify(zm));
    await openMap();
    const m=await J(`({open:!$('cnMap').hidden,nodes:document.querySelectorAll('#cnMap .cnN').length,lock:document.querySelectorAll('#cnMap .cnN.lock').length,br:document.querySelectorAll('#cnMap .cnBr').length,modes:[...document.querySelectorAll('#cnMap .cnMode b')].map(b=>b.textContent),rec:document.querySelectorAll('#cnMap .cnRec2 li').length,stars:document.querySelectorAll('#cnMap .cnGoals').length})`);
    ok('la mappa: 12 arene, 11 chiuse, 12 bracieri, i record, quattro modi, niente stelle',m.open&&m.nodes===12&&m.lock===11&&m.br===12&&m.rec===3&&m.modes.join()==='Torre,Corsa dei boss,Reliquie,Ricercati'&&!m.stars,JSON.stringify(m));await snap('mappa');
    await p.click('#cnMap .cnN[data-a="3"]');await W(300);ok('un\'arena chiusa dice come aprirla',await E(`!!document.querySelector('#cnMap .cnLockP')&&!document.querySelector('#cnMap .cnPlay')`));
    await p.click('#cnMap .cnMode[data-sub="tower"]');await W(300);const tw=await J(`({mods:document.querySelectorAll('#cnMap .cnMods li').length,board:document.querySelectorAll('#cnMap .cnBoard li').length})`);ok('la Torre: tre regole, classifica',tw.mods===3&&tw.board>=9,JSON.stringify(tw));
    await p.click('#cnMap .cnX');await W(200);await p.click('#cnMap .cnMode[data-sub="rush"]');await W(300);ok('la Corsa: chiusa finché non batti un custode',await E(`document.querySelectorAll('#cnMap .cnRush li.ok').length===0&&!!document.querySelector('#cnMap .cnLockP')`));
    await p.click('#cnMap .cnX');await W(200);await p.click('#cnMap .cnMode[data-sub="nem"]');await W(300);ok('i Ricercati: nessuno per ora',await E(`!!document.querySelector('#cnMap .cnEmpty')`));
    await p.click('#cnMap .cnX');await W(200);await p.click('#cnMap .cnX');await W(300);
  }
  // ---------------------------------------------------------------- the arena: the 10 rooms of the game
  if(!SOLO||SOLO==='stanze'){
    await arena(0);const s0=await J(`({seq:G.seq.filter(q=>q.c).map(q=>q.c),room:G.room,chip:$('roomTxt').textContent,wave:!!$('cnWaveTxt'),xb:!$('xpBar').hidden,a:G.cnA})`);
    ok('la partita d\'arena: le 10 stanze di sempre, niente ondate',s0.seq.join()==='1,2,3,4,5,6,7,8,9,10'&&s0.room===1&&s0.chip==='1/10'&&!s0.wave&&s0.xb&&s0.a===0,JSON.stringify(s0));
    await E(`(()=>{__A.on=true;__A.every=6;return 0})()`);await run(90,`G.room>=3&&G.state==='play'`);
    const s1=await J(`({room:G.room,chip:$('roomTxt').textContent,lvl:P.lvl,xp:Math.round(P.xp),fu:G.cnF?G.cnF.max:-1,gold:G.gold})`);await snap('stanza_3');
    ok('stanza dopo stanza: l\'esperienza arriva, la Furia sale, l\'oro arriva',s1.room>=3&&s1.chip===s1.room+'/10'&&(s1.lvl>=2||s1.xp>0)&&s1.fu>=0&&s1.gold>0,JSON.stringify(s1));
    const s2r=await run(240,`G.room===ROOMS&&G.state==='play'&&G.enemies.some(e=>isBoss(e.type))`);
    const s2=await J(`({room:G.room,lvl:P.lvl,sk:Object.keys(P.skills).length,boss:(G.enemies.find(e=>isBoss(e.type))||{}).type})`);await snap('custode');
    ok('il custode alla stanza 10',!!s2r&&s2.room===10&&s2.boss==='golem'&&s2.lvl>=4&&s2.sk>=3,JSON.stringify(s2));
    await E(`__A.every=3;0`);const end=await run(90);await W(1200);
    const s5=await J(`({ends:__A.ends,won:SAVE.cn.stars[0],best:SAVE.cn.best[0],bestA:bestRoom(0),pick:SAVE.cn.pick||0,br:SAVE.cn.br[0],etr:$('eTr').textContent.replace(/\\s+/g,' ').slice(0,160),
      brL:(document.querySelector('#eTr .cnBridge')||{}).textContent||'',room:$('eRoom').textContent})`);await snap('vittoria');
    ok('la vittoria: braciere acceso, record, 55 pietre del ponte (30 delle stanze e 25 del custode), l\'isola dopo ancora chiusa',end&&s5.ends[0]&&s5.ends[0].title==='VITTORIA'&&(s5.won&1)===1&&s5.best&&s5.best.win&&s5.bestA===10&&s5.pick===0&&s5.br===55&&/braciere/.test(s5.etr)&&/Furia massima/.test(s5.etr)&&/Ponte verso.*\+55 pietre.*55\/100/.test(s5.brL),JSON.stringify(s5));
    await toMenu();const c=await J(`({t:$('chapCard').textContent,n:$('chapCard').querySelectorAll('.rn').length,cur:ISL.cur,op:cnOpen(1)})`);
    ok('dopo la vittoria si resta sull\'arena 1: il ponte è a metà',/Arena 1/.test(c.t)&&c.n===10&&c.cur===0&&!c.op,JSON.stringify(c));
  }
  // ---------------------------------------------------------------- the Furia
  if(!SOLO||SOLO==='furia'){
    await arena(0);await E(`(()=>{__A.on=false;G.enemies=[];G.eproj=[];P.inv=99;return 0})()`);
    const kill=async n=>E(`(()=>{for(let i=0;i<${n};i++){const e=makeE('slime',AW/2,TOP+150,0,false);G.enemies.push(e);killE(e)}return 0})()`);
    await kill(3);const f1=await J(`({lv:G.cnF.lv,txt:$('cnFu').querySelector('b').textContent,vis:!$('cnFu').hidden,mul:cnFuMul(),sm:$('cnFu').querySelector('small').textContent})`);
    ok('3 uccisioni di fila: Furia D, ×1,1 per 6 secondi',f1.lv===0&&f1.txt==='D'&&f1.vis&&f1.mul===1.1&&/×1,1 oro ed esperienza · 6 s/.test(f1.sm),JSON.stringify(f1));
    await kill(70);await W(200);const f2=await J(`(()=>{const x0=P.xp,l0=P.lvl;gainXp(4);return{lv:G.cnF.lv,txt:$('cnFu').querySelector('b').textContent,blaze:'cnBlaze' in P,mul:cnFuMul(),xp:P.lvl>l0?'up':P.xp-x0,sss:$('cnFu').classList.contains('sss')}})()`);
    ok('72 uccisioni: SSS, ×2,5 oro ed esperienza, niente fiamme',f2.lv===6&&f2.txt==='SSS'&&!f2.blaze&&f2.mul===2.5&&(f2.xp===10||f2.xp==='up')&&f2.sss,JSON.stringify(f2));
    await E(`(()=>{for(let i=0;i<6;i++)G.enemies.push(makeE('slime',AW/2-60+i*24,TOP+160,0,false));G.state='play';return 0})()`);await W(300);
    const g=await J(`(()=>{const e=G.enemies.find(e=>canHit(e));const h=e?e.hp:0;if(e){e.burn=0;hurtE(e,10,false)}return{dmg:e?Math.round(h-e.hp):0,burn:e?e.burn>0:false}})()`);
    ok('a SSS i colpi fanno il loro danno e non bruciano',g.dmg===10&&!g.burn,JSON.stringify(g));
    await E(`(()=>{for(let i=0;i<20;i++)update(.033);return 0})()`);await snap('furia_sss');
    const fb=await J(`(()=>{for(let i=0;i<200;i++){G.cnF.idle=0;cnFuTick(.033)}cnFuHud(true);return{lv:G.cnF.lv,mul:cnFuMul(),sm:$('cnFu').querySelector('small').textContent,burst:$('cnFu').classList.contains('burst')}})()`);
    ok('dopo 6 secondi il moltiplicatore finisce, il rango resta',fb.lv===6&&fb.mul===1&&fb.sm===''&&!fb.burst,JSON.stringify(fb));
    await E(`(()=>{G.cnF.bt=3;G.cnF.bm=2.5;P.inv=0;P.dashT=0;hurtP(5);return 0})()`);const f3=await J(`({lv:G.cnF.lv,bt:G.cnF.bt,mul:cnFuMul()})`);ok('un colpo preso spezza la Furia e spegne il moltiplicatore',f3.lv<6&&f3.lv>=0&&f3.bt===0&&f3.mul===1,JSON.stringify(f3));
    const f4=await J(`(()=>{const n0=G.cnF.n;G.cnF.idle=10;for(let i=0;i<90;i++)cnFuTick(.033);return{n0,n:G.cnF.n,lv:G.cnF.lv}})()`);ok('senza uccisioni la Furia cala',f4.n<f4.n0-5,JSON.stringify(f4));
  }
  // ---------------------------------------------------------------- the cards with a surprise rarity
  if(!SOLO||SOLO==='rarita'){
    await arena(0);await E(`(()=>{__A.on=false;CN.forceRar=3;openSkills('level');return 0})()`);await W(500);
    const r0=await J(`({hid:document.querySelectorAll('#skList .sk.cnHid,#skList .sk.cnSpin').length,n:document.querySelectorAll('#skList .sk').length})`);await snap('carte_coperte');
    await E(`pick(0);0`);const r1=await J(`({open:!$('skScr').hidden,hid:document.querySelectorAll('#skList .sk.cnHid,#skList .sk.cnSpin').length})`);
    ok('le carte arrivano coperte; il primo tocco le scopre e non sceglie',r0.hid>=2&&r1.open&&r1.hid===0,JSON.stringify({r0,r1}));
    const r2=await J(`({rar:[...document.querySelectorAll('#skList .sk em.rar')].map(e=>e.textContent),cls:[...document.querySelectorAll('#skList .sk')].map(b=>b.className.match(/cnr\\d|cnEvoC/)?.[0]||''),desc:[...document.querySelectorAll('#skList .sk div>span')].map(s=>s.textContent)})`);await snap('carte_leggendarie');
    ok('forzate leggendarie: cornice d\'oro, nome e descrizione più grande',r2.rar.every(t=>t==='Leggendaria')&&r2.cls.every(c=>c==='cnr3')&&r2.desc.every(d=>/\+25% danno|\+70%|\+35%|100%|56%|45%/.test(d)),JSON.stringify(r2));
    await E(`(()=>{closeSkills();CN.rar=null;CN.revEnd=0;return 0})()`);
    const ap=await J(`(()=>{const out={};let s=SK.find(q=>q.id==='atk');let pre={atk:P.atk,aspd:P.aspd,crit:P.crit,maxhp:P.maxhp,hp:P.hp,dashMax:P.dashMax,spd:P.spd,lv:0};s.f();P.skills.atk=(P.skills.atk||0)+1;cnRarApply(s,3,pre);out.atk=+(P.atk/pre.atk).toFixed(3);
      s=SK.find(q=>q.id==='front');const f0=P.front,lv0=P.skills.front||0,a0=P.atk;pre={atk:P.atk,lv:lv0};s.f();P.skills.front=lv0+1;cnRarApply(s,3,pre);out.front=[P.front-f0,P.skills.front,+(P.atk/a0).toFixed(3)];
      s=SK.find(q=>q.id==='hp');pre={maxhp:P.maxhp,hp:P.hp,lv:0};const m0=P.maxhp;s.f();P.skills.hp=(P.skills.hp||0)+1;cnRarApply(s,2,pre);out.hp=+(P.maxhp/m0).toFixed(2);return out})()`);
    ok('gli effetti: Attacco leggendario +70%, Freccia frontale leggendaria due livelli e +25%, Salute epica +45%',ap.atk===1.7&&ap.front[0]===2&&ap.front[1]===2&&ap.front[2]===1.25&&ap.hp===1.45,JSON.stringify(ap));
    const ro=await J(`(()=>{CN.forceRar=null;G.cnF={n:0,lv:-1,idle:0,max:-1};const c=[0,0,0,0];for(let i=0;i<4000;i++)c[cnRarRoll()]++;G.cnF={n:80,lv:6,idle:0,max:6};const d=[0,0,0,0];for(let i=0;i<4000;i++)d[cnRarRoll()]++;G.cnF=null;return{base:c,sss:d}})()`);
    ok('la Furia fa uscire più carte rare',ro.sss[3]>ro.base[3]*1.5&&ro.sss[0]<ro.base[0]&&ro.base[0]>ro.base[1],JSON.stringify(ro));
  }
  // ---------------------------------------------------------------- the spectacular evolutions
  if(!SOLO||SOLO==='evo'){
    await arena(0);await E(`(()=>{__A.on=false;CN.forceRar=0;for(const[id,n] of [['multi',2],['fire',1]]){const s=SK.find(q=>q.id===id);for(let i=0;i<n;i++)s.f();P.skills[id]=n}openSkills('level');return 0})()`);await W(1600);
    const e0=await J(`({first:offer[0]&&offer[0].id,tag:(document.querySelector('#skList .sk .evotag')||{}).textContent,old:offer.some(s=>/^evo_/.test(s.id))})`);await snap('evoluzione_carta');
    ok('Raffica al massimo e Frecce infuocate: la prima carta è l\'evoluzione «Pioggia di meteore»',e0.first==='ev_meteore'&&!e0.old,JSON.stringify(e0));
    await E(`(()=>{CN.revEnd=0;pick(0);return 0})()`);await W(200);const e1=await J(`({m:!!P.cnMeteor,ban:$('banner').textContent,evoT:CN.evoT>0})`);ok('la trasformazione: «EVOLUZIONE!» e la colonna di luce',e1.m&&/EVOLUZIONE/.test(e1.ban)&&e1.evoT,JSON.stringify(e1));
    await E(`(()=>{for(const id of['pierce','ice','ric','light','orbit','dash','front','crit','diag','side']){const s=SK.find(q=>q.id===id);while((P.skills[id]||0)<s.max){s.f();P.skills[id]=(P.skills[id]||0)+1}}
      for(const v of CN_EVO)if(!P.skills[v.id]){v.f();P.skills[v.id]=1}CN.forceRar=null;window.__C={dr:0,th:0};{const _e=cnEvoTick;cnEvoTick=function(dt){const n=CN.dr.length;const r=_e.apply(this,arguments);if(CN.dr.length>n)__C.dr++;return r}}{const _t=cnThunder;cnThunder=function(e){__C.th++;return _t.apply(this,arguments)}}for(let i=0;i<8;i++){const q=cnSpot(14);G.enemies.push(makeE(pk(['slime','goblin','bat']),q.x,q.y,.9,false))}__A.on=true;__A.every=30;return 0})()`);
    let seen={meteor:0,dragon:0,lance:0,shard:0,feather:0,bolt:0};for(let i=0;i<16;i++){await W(450);const s=await J(`({meteor:CN.fx.some(f=>f.k==='meteor'||f.k==='scorch'),dragon:CN.dr.length>0,lance:G.arrows.some(a=>a.cnK==='lance'),shard:CN.fx.some(f=>f.k==='shard'),feather:G.arrows.some(a=>a.cnK==='feather'),bolt:G.fx.some(f=>f.k==='bolt')})`);for(const k in s)if(s[k])seen[k]++;if(i===7)await snap('evoluzioni')}
    await E(`__A.on=false;0`);const er=await J(`__A.log.filter(l=>/ERR/.test(l))`),C=await J(`__C`);seen.dragon+=C.dr;seen.bolt+=C.th;
    ok('tutte e sei le evoluzioni insieme: meteore, drago, lance e schegge, piume, fulmini, senza errori',seen.meteor&&seen.dragon&&seen.lance&&seen.shard&&seen.feather&&!er.length,JSON.stringify({seen,er}));
  }
  // ---------------------------------------------------------------- the Nemesis
  if(!SOLO||SOLO==='nemesi'){
    await arena(0);await E(`(()=>{__A.on=false;__A.god=false;return 0})()`);
    const g0=await J(`SAVE.gold`);
    await E(`(()=>{const e=makeE('goblin',P.x,P.y-70,0,false);G.enemies.push(e);G.gold=345;G.cnLastHit={e,t:G.t};P.inv=0;P.dashT=0;P.revive=0;N3G.cur=e;try{hurtP(P.hp+50)}finally{N3G.cur=null}window.__K=e;return 0})()`);await W(400);
    const d0=await J(`({st:G.state,name:__K.cnName,tone:__K.cnTone,dance:!!__K.cnDance,bub:CN.bub.length})`);for(let i=0;i<10;i++)await E(`(()=>{if(G.state==='dead')update(.033);return 0})()`);await snap('nemesi_nasce');
    ok('chi ti uccide prende un nome, balla e ti prende in giro',d0.st==='dead'&&!!d0.name&&d0.dance&&d0.bub===1,JSON.stringify(d0));
    for(let i=0;i<20&&await E(`$('endScr').hidden`);i++){await E(`(()=>{if(!$('revScr').hidden)$('rvNo').click();return 0})()`);await W(300)}
    const d1=await J(`({nem:SAVE.cn.nem,card:!!document.querySelector('#eTr .cnDeath'),txt:$('eTr').textContent.replace(/\\s+/g,' ').slice(0,200),gold:SAVE.gold})`);
    await W(500);await snap('nemesi_manifesto_fine');
    ok('a fine partita: la Nemesi col tuo oro (345) e il manifesto, l\'oro non arriva al menu',d1.nem.length===1&&d1.nem[0].gold===345&&d1.card&&/345/.test(d1.txt)&&d1.gold===g0,JSON.stringify({n:d1.nem[0],txt:d1.txt,gold:d1.gold,g0}));
    await toMenu();await openMap();await p.click('#cnMap .cnMode[data-sub="nem"]');await W(500);
    const bd=await J(`({posters:document.querySelectorAll('#cnMap .cnWant').length,badge:!!document.querySelector('#cnMap .cnBadge'),taglia:(document.querySelector('#cnMap .cnTaglia')||{}).textContent})`);await snap('ricercati');
    ok('la bacheca dei Ricercati col manifesto e la taglia',bd.posters===1&&/345/.test(bd.taglia||''),JSON.stringify(bd));
    await p.click('#cnMap .cnX');await W(200);await p.click('#cnMap .cnX');await W(300);
    // the next run: the invasion with the sack, the taunts, the bounty
    await arena(0);const inv=await J(`({r:G.cnNem&&G.cnNem.r,id:G.cnNem&&G.cnNem.id,now:G.enemies.some(e=>e.cnNem)})`);await E(`(()=>{__A.god=true;return 0})()`);
    await E(jump(`G.cnNem.r`));const iv=await J(`({room:G.room,portal:CN.fx.some(f=>f.k==='portal'),ban:$('banner').textContent})`);
    await E(`(()=>{for(let i=0;i<70;i++)update(.033);return 0})()`);const n0=await J(`(()=>{const e=G.enemies.find(e=>e.cnNem);return e?{sack:e.cnSack,name:e.cnName,afx:e.cnAfx,big:e.cnBig,hp:e.hp,max:e.max,spawn:e.spawn}:null})()`);
    await E(`(()=>{for(let i=0;i<40;i++)update(.033);return 0})()`);const nb=await J(`({bub:CN.bub.map(b=>b.txt),ban:$('banner').textContent})`);await snap('invasione');
    ok('l\'invasione in una stanza a caso (3–8, mai la 5): la Nemesi col sacco (345), il nome, i poteri, la prima frase',[3,4,6,7,8].includes(inv.r)&&!!inv.id&&!inv.now&&iv.room===inv.r&&iv.portal&&/Invasione/.test(iv.ban)&&n0&&n0.sack===345&&!!n0.name&&n0.afx.length>=1&&nb.bub.length>=1,JSON.stringify({inv,iv,n0,nb}));
    const k0=await J(`({gold:G.gold,gems:G.gemsRun||0})`);await E(`(()=>{const e=G.enemies.find(e=>e.cnNem);for(let i=0;i<6&&!e.dead;i++)hurtE(e,e.hp+(e.cnSh||0)+1,false);return 0})()`);await W(300);
    const k1=await J(`({nem:SAVE.cn.nem.length,out:SAVE.cn.nemOut.length,gold:G.gold,gems:G.gemsRun||0,coins:G.coins.filter(c=>c.gr).length,ban:$('banner').textContent})`);await snap('nemesi_sconfitta');
    ok('battuta la Nemesi: ti riprendi l\'oro e la taglia in cristalli',k1.nem===0&&k1.out===1&&k1.gold-k0.gold+k1.coins>=345&&k1.gems-k0.gems===10&&/Nemesi sconfitta/.test(k1.ban),JSON.stringify({k0,k1}));
    // a Nemesis that beats you again grows
    await toMenu();await E(`(()=>{SAVE.cn.nem=[{id:'nprova',type:'skeleton',name:'Torvo',title:'il Macellaio',tone:'spavalda',lvl:1,afx:['scudo'],gold:100,wins:1}];save();return 0})()`);
    await arena(0);await E(`(()=>{__A.god=false;G.cnNem.r=G.room;cnNemCheck();for(let i=0;i<60;i++)update(.033);const e=G.enemies.find(e=>e.cnNem);G.gold=50;G.cnLastHit={e,t:G.t};P.inv=0;P.dashT=0;P.revive=0;N3G.cur=e;try{hurtP(P.hp+50)}finally{N3G.cur=null}return 0})()`);
    for(let i=0;i<20&&await E(`$('endScr').hidden`);i++){await E(`(()=>{if(!$('revScr').hidden)$('rvNo').click();return 0})()`);await W(300)}await W(400);
    const up=await J(`({n:SAVE.cn.nem[0],txt:$('eTr').textContent.replace(/\\s+/g,' ').slice(0,160)})`);await snap('nemesi_cresce');
    ok('la Nemesi che ti batte ancora: livello 2, un potere in più, il suo sacco cresce',up.n&&up.n.lvl===2&&up.n.afx.length===2&&up.n.gold===150&&up.n.wins===2&&/più forte/.test(up.txt),JSON.stringify(up));
    // the keeper that kills you keeps your gold, and gives it back when you beat it
    await toMenu();await E(`(()=>{SAVE.cn.nem=[];SAVE.cn.bossGold={};save();return 0})()`);await arena(0);
    await E(`(()=>{__A.god=false;return 0})()`);await E(jump('ROOMS'));for(let i=0;i<30&&!(await E(`G.room===ROOMS&&G.state==='play'&&G.enemies.some(e=>isBoss(e.type))`));i++){await E(`(()=>{if(started&&!paused&&!modal)for(let k=0;k<6;k++)update(.033);return 0})()`);await W(200)}
    await E(`(()=>{const b=G.enemies.find(e=>isBoss(e.type));G.gold=210;G.cnLastHit={e:b,t:G.t};P.inv=0;P.dashT=0;P.revive=0;hurtP(P.hp+50);return 0})()`);
    for(let i=0;i<20&&await E(`$('endScr').hidden`);i++){await E(`(()=>{if(!$('revScr').hidden)$('rvNo').click();return 0})()`);await W(300)}await W(300);
    const bg=await J(`({bg:SAVE.cn.bossGold,txt:$('eTr').textContent.replace(/\\s+/g,' ').slice(0,160)})`);ok('il custode che ti uccide si tiene l\'oro',bg.bg.golem===210&&/si tiene il tuo oro/.test(bg.txt),JSON.stringify(bg));
    await arena(0);await E(`(()=>{__A.god=true;return 0})()`);await E(jump('ROOMS'));for(let i=0;i<30&&!(await E(`G.room===ROOMS&&G.state==='play'&&G.enemies.some(e=>isBoss(e.type))`));i++){await E(`(()=>{if(started&&!paused&&!modal)for(let k=0;k<6;k++)update(.033);return 0})()`);await W(200)}
    await W(3500);const bb=await J(`({ban:$('banner').textContent})`);
    const kb=await J(`(()=>{const g0=G.gold,b=G.enemies.find(e=>isBoss(e.type));if(b){b.intro=0;killE(b)}return{d:G.gold-g0,left:SAVE.cn.bossGold.golem||0}})()`);
    ok('battuto il custode ti riprendi l\'oro',kb.d>=210&&!kb.left,JSON.stringify(Object.assign(kb,bb)));
    await toMenu();await E(`(()=>{__A.god=true;SAVE.cn.nem=[];SAVE.cn.nemOut=[];SAVE.cn.bossGold={};save();return 0})()`);
  }
  // ---------------------------------------------------------------- the tower
  if(!SOLO||SOLO==='torre'){
    await toMenu();const inf0=await J(`SAVE.inf`);
    await E(`(()=>{CN.next='tower';__A.endSeen=0;__A.ends=[];__A.log=[];__A.god=true;__A.every=6;goPlay('arena');return 0})()`);await W(2600);
    const t=await J(`({mode:G.mode,mods:(G.tower&&G.tower.mods||[]).map(m=>m.id),last:G.seq[G.seq.length-1],room:G.room})`);await snap('torre_piano1');
    ok('la Torre: Abisso con tre regole della settimana, fino al piano 20',t.mode==='inf'&&t.mods.length===3&&t.last.c===20,JSON.stringify(t));
    await E(`(()=>{const k=G.seq.findIndex(s=>s.c===19);G.si=k;G.room=19;G.event=null;buildRoom();__A.on=true;__A.kill=true;return 0})()`);
    const end=await run(120);await W(800);const tt=await J(`({ends:__A.ends,inf:SAVE.inf,tower:SAVE.cn.tower,rel:__A.log.filter(l=>/reliquia/.test(l))})`);await snap('torre_fine');
    ok('in cima alla Torre: «Torre conquistata», il record della settimana, l\'Abisso intatto',tt.ends[0]&&tt.ends[0].title==='TORRE CONQUISTATA'&&tt.tower.best===20&&JSON.stringify(tt.inf)===JSON.stringify(inf0),JSON.stringify(tt.ends[0]));
  }
  // ---------------------------------------------------------------- the boss rush
  if(!SOLO||SOLO==='corsa'){
    await toMenu();const tr0=await J(`({t:SAVE.trophies,b:SAVE.bestA})`);
    await E(`(()=>{SAVE.cn.all=true;CN.next='rush';__A.endSeen=0;__A.ends=[];__A.log=[];__A.god=true;goPlay('arena');return 0})()`);await W(2600);
    const r0=await J(`({list:G.rush&&G.rush.list.length,room:G.room,boss:G.enemies.filter(e=>isBoss(e.type)).map(e=>e.type)})`);await snap('corsa_1');
    ok('la Corsa parte dal primo custode',r0.list===12&&r0.room===10&&r0.boss[0]==='golem',JSON.stringify(r0));
    await E(`__A.on=true;__A.kill=true;__A.every=3;0`);
    const t0=Date.now();let seen=new Set();while(Date.now()-t0<150000){await W(500);const s=await J(`({i:G.rush?G.rush.i:-1,b:G.enemies.filter(e=>isBoss(e.type)).map(e=>e.type)[0]||'',end:!$('endScr').hidden})`);if(s.b)seen.add(s.b);if(s.i>=3||s.end)break}
    const r1=await J(`({i:G.rush.i,beat:G.rush.beat})`);await snap('corsa_4');ok('da un custode all\'altro (4 custodi di fila)',r1.i>=3&&seen.size>=3,JSON.stringify(Object.assign({visti:[...seen]},r1)));
    await E(`(()=>{__A.on=false;endRun(false,true);return 0})()`);await W(500);const r2=await J(`({tag:$('endTag').textContent,best:SAVE.cn.rush.best,t:SAVE.trophies,b:SAVE.bestA})`);await snap('corsa_fine');
    ok('la fine della Corsa: record e niente coppe o record d\'arena cambiati',r2.tag==='Corsa dei boss'&&r2.best>=3&&r2.t===tr0.t&&JSON.stringify(r2.b)===JSON.stringify(tr0.b),JSON.stringify(r2));
  }
  // ---------------------------------------------------------------- the tower that rises (arena 2; arena 8 has 20 floors)
  const helpers=`(()=>{SAVE.cn.all=true;window.__step=(sec)=>{for(let i=0;i<sec*30;i++){if(!$('skScr').hidden){CN.revEnd=0;pick(0);if(!$('skScr').hidden)pick(0)}if(!$('revScr').hidden)$('rvNo').click();if(G.hitstop>0)G.hitstop=0;P.hp=P.maxhp;update(1/30)}};
    window.__kill=()=>{for(const e of G.enemies.slice())if(!e.cnAnchor&&!e.dead&&!isBoss(e.type)){e.spawn=0;e.intro=0;hurtE(e,e.hp+(e.cnSh||0)+1,false)}};
    window.__floor=(f)=>{G.si=f-2;G.cnTw.px=P.x;G.cnTw.py=P.y;G.enemies=[];G.cnRise=null;nextStep()};return 0})()`;
  if(!SOLO||SOLO==='ondate'){
    await E(helpers);await arena(1);await E(`(()=>{__A.on=false;return 0})()`);
    const o0=await J(`({mode:G.cnMode,plan:G.cnTw.plan.map(q=>q.k).join(''),seq:G.seq.map(q=>q.c).join(','),hud:!$('cnTow').hidden&&$('cnTow').textContent,chip:$('roomChip').classList.contains('cnw')&&$('cnFlTxt').textContent,
      edge:G.enemies.filter(e=>!e.cnAnchor&&!isBoss(e.type)).every(e=>e.x<=L+40||e.x>=R-40||e.y>=BOT-40)})`);await snap('torre_piano1');
    ok('la torre: 10 piani (Campioni alla 5, premio alla 8, custode alla 10), nemici che salgono dai bordi, la barra dei piani',o0.mode==='torre'&&o0.plan==='nnnnennpnb'&&o0.seq==='1,2,3,4,5,6,7,8,9,10'&&/Piano 1\/10/.test(o0.hud)&&o0.chip==='1/10'&&o0.edge,JSON.stringify(o0));
    for(let k=0;k<12&&!(await E(`!!G.cnRise`));k++)await E(`(()=>{__kill();__step(.4);return 0})()`);
    const o1=await J(`({rise:!!G.cnRise,ban:$('banner').textContent,px:Math.round(P.x),py:Math.round(P.y)})`);await E(`__step(.5);0`);await snap('torre_sale');
    await E(`__step(2.4);0`);const o2=await J(`({f:G.cnTw.f,room:G.room,rise:!!G.cnRise,holes:(G.cnHoles||[]).length,inHole:cnInHole(P.x,P.y,0),px:Math.round(P.x),py:Math.round(P.y),hud:$('cnTow').textContent})`);await snap('torre_piano2');
    ok('ripulito il piano, la piattaforma sale al piano 2: l\'eroe resta dov\'era, un buco nel pavimento',o1.rise&&/Il piano sale/.test(o1.ban)&&o2.f===2&&o2.room===2&&!o2.rise&&o2.holes>=1&&!o2.inHole&&Math.hypot(o2.px-o1.px,o2.py-o1.py)<40&&/Piano 2\/10/.test(o2.hud),JSON.stringify({o1,o2}));
    const hb=await J(`(()=>{const h=G.cnHoles[0],p=h.parts[0];P.x=p.x;P.y=p.y-p.r*.62-24;for(let i=0;i<40;i++)moveCircle(P,0,3,false);const [ci,cj]=cellOf(p.x,p.y);fields={};const f=field(14);return{inside:cnInHole(P.x,P.y,0),nav:f.blk[cj*GC+ci]===1}})()`);
    ok('nel buco non si cade: l\'eroe ci gira intorno e i nemici lo evitano',!hb.inside&&hb.nav,JSON.stringify(hb));
    await E(`(()=>{P.x=AW/2;P.y=BOT-60;__floor(5);__step(2.5);return 0})()`);const o5=await J(`({f:G.cnTw.f,k:G.cnTw.k,el:G.enemies.filter(e=>e.elite&&e.cnAfx).length})`);await snap('torre_campioni');
    ok('il piano 5: i Campioni coi poteri',o5.f===5&&o5.k==='e'&&o5.el>=2,JSON.stringify(o5));
    await E(`(()=>{__floor(8);__step(2.5);return 0})()`);const o8=await J(`({k:G.cnTw.k,pick:G.cnPick&&G.cnPick.map(s=>s.k),anchor:G.enemies.some(e=>e.cnAnchor),n:G.enemies.filter(e=>!e.cnAnchor).length,rocks:G.rocks.filter(k=>G.cnPick.some(q=>Math.hypot(k.x-q.x,k.y-q.y)<k.r+60)).length})`);await snap('torre_premio');
    await E(`(()=>{P.hp=Math.round(P.maxhp*.4);const s=G.cnPick[0];P.x=s.x;P.y=s.y+6;cnShrineTick(.016);return 0})()`);const h8=await J(`({hp:P.hp,max:P.maxhp})`);
    await E(`(()=>{for(let i=0;i<60;i++)update(1/30);return 0})()`);const o8b=await J(`({anchor:G.enemies.some(e=>e.cnAnchor),st:G.state,pick:!!G.cnPick})`);
    ok('il piano del premio: la fonte o l\'altare, niente ostacoli addosso; la fonte cura e il piano si ripulisce',o8.k==='p'&&o8.pick.join()==='fonte,altare'&&o8.anchor&&o8.n===0&&o8.rocks===0&&h8.hp>=h8.max*.75&&!o8b.anchor&&!o8b.pick&&o8b.st!=='play',JSON.stringify({o8,h8,o8b}));
    await E(`(()=>{__floor(10);__step(2);__A.on=true;__A.every=3;return 0})()`);const o10=await J(`({k:G.cnTw.k,boss:(G.enemies.find(e=>isBoss(e.type))||{}).type,hud:$('cnTow').innerHTML.includes('svg')})`);await snap('torre_custode');
    const end=await run(90);await W(1200);const oe=await J(`({ends:__A.ends,room:$('eRoom').textContent,lab:$('eRoom').nextElementSibling&&$('eRoom').nextElementSibling.textContent,best:SAVE.cn.best[1],etr:$('eTr').textContent.replace(/\\s+/g,' ').slice(0,120)})`);await snap('torre_vittoria');
    ok('il custode in cima alla torre; la vittoria col piano 10 e il braciere',o10.k==='b'&&o10.boss==='salamander'&&end&&oe.ends[0]&&oe.ends[0].title==='VITTORIA'&&oe.room==='10'&&oe.lab==='Piano'&&oe.best&&oe.best.fl===10&&/braciere/.test(oe.etr),JSON.stringify({o10,oe}));
    await arena(7);await E(`(()=>{__A.on=false;return 0})()`);const t20=await J(`({plan:G.cnTw.plan.map(q=>q.k).join(''),n:G.seq.length})`);
    await E(`(()=>{P.x=AW/2;P.y=BOT-60;__floor(5);__step(2.6);return 0})()`);const mb=await J(`(()=>{const m=G.enemies.find(e=>e.cnMini);return m?{afx:m.cnAfx.length,name:m.cnName,big:m.max>ET[m.type].hp*3,n:G.enemies.length}:null})()`);await snap('torre_campione');
    ok('la torre lunga (arena 8): 20 piani, il campione del piano ogni 5 coi tre poteri',t20.n===20&&t20.plan==='nnnnmnnpnmnnnnmpnnnb'&&mb&&mb.afx===3&&mb.name==='Campione del piano'&&mb.big,JSON.stringify({t20,mb}));
  }
  // ---------------------------------------------------------------- the traps (arena 3)
  if(!SOLO||SOLO==='trappole'){
    await E(helpers);await arena(2);await E(`(()=>{__A.on=false;__step(1.5);return 0})()`);
    const c0=await J(`({mode:G.cnMode,kind:G.cnTr.kind,tr:[...new Set(G.cnTr.list.map(o=>o.k))].join(','),coins:G.cnTr.coins.length,en:G.enemies.length,door:G.door,hud:$('cnHud').textContent})`);await snap('trappole_percorso');
    ok('il percorso: lame, trave, spuntoni e sfiati, nove monete, la porta aperta, i tre traguardi',c0.mode==='trappole'&&c0.kind==='corso'&&c0.tr==='saw,beam,spk,vent'&&c0.coins===9&&c0.en===0&&c0.door&&/Tempo/.test(c0.hud)&&/Monete0\/9/.test(c0.hud.replace(/\\s/g,'')),JSON.stringify(c0));
    const c1=await J(`(()=>{const T=G.cnTr,r={};let o=T.list.find(o=>o.k==='saw');P.inv=0;P.dashT=0;let h0=P.hp;P.x=o.x;P.y=o.y;cnTrTick(.016);r.saw=h0-P.hp;
      o=T.list.find(o=>o.k==='vent');o.ph=o.per*.9-T.t;P.inv=0;h0=P.hp;P.x=o.x;P.y=o.y;cnTrTick(.016);r.vent=h0-P.hp;r.hit=T.hit;return r})()`);
    ok('le trappole fanno male: la lama e lo sfiato (e il traguardo «nessun colpo» salta)',c1.saw>0&&c1.vent>0&&c1.hit,JSON.stringify(c1));
    const c2=await J(`(()=>{for(const c of G.cnTr.coins){P.x=c.x;P.y=c.y;cnTrTick(.016)}const g0=G.gold,k0=G.gemsRun||0;P.x=AW/2;P.y=TOP+4;cnTrTick(.016);return{res:G.cnTr.res,gold:G.gold-g0,gems:(G.gemsRun||0)-k0,ban:$('banner').textContent}})()`);
    ok('all\'uscita i traguardi diventano oro e cristalli',c2.res&&c2.res[0]&&!c2.res[1]&&c2.res[2]&&c2.gold===30&&c2.gems===2&&/★★☆/.test(c2.ban),JSON.stringify(c2));
    // a room with at least one enemy on foot (the enemies are drawn at random: bats and wisps fly over the traps)
    for(let tr=0;tr<4;tr++){await E(`(()=>{const k=G.seq.findIndex(q=>q.c===2);G.si=k-1;G.enemies=[];nextStep();__step(2.5);return 0})()`);if(await E(`G.enemies.some(e=>canHit(e)&&!cnFlies(e)&&!isBoss(e.type))`))break}
    const m0=await J(`(()=>{const o=G.cnTr.list.find(o=>o.k==='saw'),e=G.enemies.find(e=>canHit(e)&&!cnFlies(e)&&!isBoss(e.type));let d=0;if(o&&e){const h=e.hp;e.x=o.x;e.y=o.y;e.cnTrT=0;cnTrTick(.016);d=Math.round(h-e.hp)}return{kind:G.cnTr.kind,n:G.cnTr.list.length,en:G.enemies.length,d}})()`);await snap('trappole_misto');
    ok('trappole e nemici: le trappole colpiscono anche loro',m0.kind==='misto'&&m0.n>=3&&m0.en>=2&&m0.d>0,JSON.stringify(m0));
    await E(`(()=>{const k=G.seq.findIndex(q=>q.c===3);G.si=k-1;G.enemies=[];nextStep();__step(3.6);return 0})()`);
    const f0=await J(`({kind:G.cnTr.kind,door:G.door,st:G.state,col:Math.round(G.cnCol.y),bot:BOT,en:G.enemies.length})`);await snap('trappole_fuga');
    const f1=await J(`(()=>{P.inv=0;P.dashT=0;const h0=P.hp;P.y=G.cnCol.y+20;cnColTick(.016);return{dmg:h0-P.hp,above:P.y<G.cnCol.y}})()`);
    await E(`(()=>{P.x=AW/2;P.y=TOP+4;__step(.1);P.y=TOP-20;__step(1.2);return 0})()`);await W(900);const f2=await J(`({room:G.room,kind:G.cnTr&&G.cnTr.kind})`);
    ok('la fuga dal crollo: porta aperta coi nemici in giro, il crollo sale, chi resta sotto prende un colpo e salta avanti, si esce',f0.kind==='fuga'&&f0.door&&f0.st==='play'&&f0.col<f0.bot&&f1.dmg>0&&f1.above&&f2.room===4&&f2.kind==='corso',JSON.stringify({f0,f1,f2}));
    await E(`(()=>{const k=G.seq.findIndex(q=>q.c===10);G.si=k-1;G.enemies=[];nextStep();__step(3);return 0})()`);
    const b0=await J(`(()=>{const b=G.enemies.find(e=>isBoss(e.type)),o=G.cnTr.list.find(o=>o.k==='saw');let d=0;if(b&&o){b.intro=0;const h=b.hp,x=b.x,y=b.y;b.x=o.x;b.y=o.y;b.cnTrT=0;cnTrTick(.016);d=Math.round(h-b.hp);b.x=x;b.y=y}return{kind:G.cnTr.kind,tr:G.cnTr.list.map(o=>o.k).join(','),boss:b&&b.type,d}})()`);await snap('trappole_custode');
    ok('il custode tra le trappole, che colpiscono anche lui',b0.kind==='boss'&&b0.tr==='saw,saw,vent,vent'&&b0.boss==='toad'&&b0.d>0,JSON.stringify(b0));
    await toMenu();await E(`(()=>{SAVE.cn.pick=1;renderChap();return 0})()`);await W(300);
    const k0=await J(`({t:$('chapCard').textContent,n:$('chapCard').querySelectorAll('.rn').length})`);await snap('scheda_torre');
    await openMap();const mp=await J(`({badges:document.querySelectorAll('#cnMap .cnMoN').length,line:(document.querySelector('#cnMap .cnMoL')||{}).textContent})`);await snap('mappa_modi');
    await p.click('#cnMap .cnX');await W(300);
    ok('scheda e mappa dicono la modalità di ogni arena',/La torre che sale/.test(k0.t)&&k0.n===10&&mp.badges===12&&/torre che sale/.test(mp.line||''),JSON.stringify({k0:k0.t.slice(0,80),n:k0.n,mp}));
  }
  // ---------------------------------------------------------------- everything in 3D (95 and the islands, traps and effects of 94)
  if(!SOLO||SOLO==='3d'){
    await arena(0);await E(`(()=>{__A.on=false;G.enemies=[];G.eproj=[];paused=true;return 0})()`);
    const o0=await J(`(()=>{const T={muschio:['boulder','pillar','tomb','urn','gravestone','stump'],cristalli:['crystal','brazier','skulls','pillar'],radici:['thorns','stump','brazier'],cenere:['basalt','lavarock','obsidian'],forgia:['anvil','cauldron','crate'],
        palude:['deadtree','totem','mudmound','reeds','lantern'],canneto:['swamprock'],brina:['iceblock','snowpine','snowman','snowrock'],ghiacciaio:['frozenstatue','crystal']},keep=themeOf,rk=G.rocks;let n=0;
      try{for(const th in T){themeOf=()=>th;G.rocks=T[th].map((kind,i)=>({x:L+40+i*60,y:TOP+120+(i%2)*90,r:20,seed:1+i,kind}));render();n+=G.rocks.filter(k=>k._s3||OB3.L[k.kind]).length}}finally{themeOf=keep;G.rocks=rk}
      return{n,bad:Object.keys(OB3.bad)}})()`);
    ok('i 27 tipi di ostacolo dei quattro mondi in 3D, senza errori',o0.n===31&&!o0.bad.length,JSON.stringify(o0));
    const o1=await J(`(()=>{render();const n0=OB3.n;for(let i=0;i<5;i++)render();const n1=OB3.n;const k=G.rocks[0];k.dmg=8;render();const n2=OB3.n;OB3.on=false;G.rocks.forEach(q=>{q._sp=null});render();const old=!!k._sp;OB3.on=true;k.dmg=0;render();
      return{still:n1-n0,worn:n2-n1,old,kinds:G.rocks.map(q=>q.kind).join()}})()`);
    ok('ogni ostacolo è dipinto una volta (si rifà solo con l\'usura); spento torna il disegno di prima',o1.still===0&&o1.worn>=1&&o1.old,JSON.stringify(o1));
    const o2=await J(`(()=>{const c0=G.coins.length,cx=AW/2,cy=BOT-200;for(let i=0;i<6;i++)G.coins.push({x:cx-60+i*24,y:cy,vx:0,vy:0,t:9});G.gems.push({x:cx,y:cy+40,z:0,ph:0,vx:0,vy:0});G.orbs.push({x:cx,y:cy+70,ph:0,vx:0,vy:0});G.hearts.push({x:cx+60,y:cy+70});
      G.boulders.push({sx:cx-100,sy:cy-200,tx:cx-50,ty:cy-120,t:.5,dur:1,kind:'rock'},{sx:cx+100,sy:cy-200,tx:cx+50,ty:cy-120,t:.5,dur:1,kind:'anvil'});G.bands.push({h:true,pos:TOP+60,w:26,warn:0,act:.2,style:''});
      render();const r={coins:G.coins.length-c0,hearts:G.hearts.length,hold:!!OB3.hold};for(const k of['fontana','altare','tesoro']){G.prop={kind:k,x:cx,y:TOP+200,used:false};render();G.prop.used=true;render()}
      G.prop=null;G.boulders=[];G.bands=[];G.coins.length=c0;G.gems=[];G.orbs=[];G.hearts=[];return r})()`);
    await snap('3d_cose');
    ok('monete, cristalli, sfere, cuori, fontana, altare, tesoro, massi in volo e spine in 3D (le liste tornano intere)',o2.coins===6&&o2.hearts===1&&!o2.hold,JSON.stringify(o2));
    await toMenu();const i0=await J(`(()=>{SAVE.cn.all=1;ISL.cache.clear();const t0=performance.now();for(let i=0;i<12;i++){ISL.view=i;cnIslImg(i,ISL.lay)}const t=performance.now()-t0;SAVE.cn.all=0;ISL.cache.clear();ISL.view=ISL.cur;return{ms:+(t/12).toFixed(1)}})()`);
    ok('le isole coi dettagli in 3D: le dodici dipinte senza errori',i0.ms>0,JSON.stringify(i0));
  }
  // ---------------------------------------------------------------- the stone bridge, the Incubo, the dark islands
  if(!SOLO||SOLO==='ponte'){
    await toMenu();
    const mg=await J(`(()=>{const keep=SAVE.cn;SAVE.cn={stars:{0:1,1:1},best:{}};const r={b0:cnBrHave(0),b1:cnBrHave(1),o1:cnOpen(1),o2:cnOpen(2),o3:cnOpen(3),brv:SAVE.cn.brv};SAVE.cn=keep;return r})()`);
    ok('un salvataggio di prima: le isole già aperte restano aperte (il loro ponte è finito)',mg.b0===100&&mg.b1===100&&mg.o1&&mg.o2&&!mg.o3&&mg.brv===1,JSON.stringify(mg));
    const fresh=`(()=>{const S=cnS();S.all=0;S.stars={};S.br={};S.inc={};S.best={};S.pick=0;S.nem=[];S.nemOut=[];S.bossGold={};ISL.inc=false;ISL.cache.clear();save();return 0})()`;
    await E(fresh);
    // a retreat at room 7: 18 stones (3 for each room passed)
    await arena(0);await E(`(()=>{__A.on=false;return 0})()`);await E(jump(7));await W(300);await E(`(()=>{endRun(false,true);return 0})()`);await W(700);
    const b1=await J(`({br:SAVE.cn.br[0],l:(document.querySelector('#eTr .cnBridge')||{}).textContent||'',anim:CN.brAnim,lab:$('eRoom').nextElementSibling.textContent})`);await snap('ponte_fine');
    ok('ogni stanza superata porta 3 pietre al ponte (ritirata alla stanza 7: 18 pietre)',b1.br===18&&/\+18 pietre/.test(b1.l)&&/18\/100/.test(b1.l)&&b1.anim&&b1.anim.i===0&&b1.anim.from===0&&b1.anim.to===2&&!b1.anim.done&&b1.lab==='Stanza',JSON.stringify(b1));
    await toMenu();await W(900);const b2=await J(`({brA:ISL.brA,hold:!!ISL.hold,cur:ISL.cur,anim:CN.brAnim})`);await snap('ponte_pietre');
    ok('nel menu la telecamera va al ponte e le pietre nuove cadono al loro posto',b2.brA&&b2.brA.i===0&&b2.brA.to===2&&b2.hold&&b2.cur===0&&!b2.anim,JSON.stringify(b2));
    await W(2600);
    // two victories finish the bridge (18+55+55 → 100): the next island opens and the hero jumps there
    await E(`(()=>{SAVE.trophies=ARENAS[1].t-5;delete SAVE.arenaUp;return 0})()`);
    for(let k=0;k<2;k++){await arena(0);await E(`(()=>{__A.on=false;endRun(true);return 0})()`);await W(700)}
    const b3=await J(`({br:SAVE.cn.br[0],pick:SAVE.cn.pick,up:SAVE.arenaUp==null,tr:SAVE.trophies>=ARENAS[1].t,l:(document.querySelector('#eTr .cnBridge')||{}).textContent||'',done:!!document.querySelector('#eTr .cnBridge.done'),op:cnOpen(1),op2:cnOpen(2)})`);await snap('ponte_finito_fine');
    ok('due vittorie dopo: il ponte è finito, l\'isola dopo è aperta e diventa quella da giocare (le coppe non aprono più le arene)',b3.br===100&&b3.pick===1&&b3.done&&/Il ponte è finito/.test(b3.l)&&b3.op&&!b3.op2&&b3.up&&b3.tr,JSON.stringify(b3));
    await toMenu();await W(1300);await snap('ponte_finito');await W(2600);const b4=await J(`({cur:ISL.cur,view:+ISL.view.toFixed(2)})`);
    ok('nel menu, finito il ponte, l\'eroe passa sull\'isola nuova',b4.cur===1,JSON.stringify(b4));
    const nb=await J(`(()=>{const L=ISL.lay,M=cnBrMap(0,L,CAMP.t),f=M.S(M.G.a0,0,0),n=M.S(M.G.a1,0,0),A0=cnIslAt(0,L,CAMP.t),A1=cnIslAt(1,L,CAMP.t);return{dx:Math.round(n[0]-f[0]),up:Math.round(f[1]-n[1]),north:A1.y<A0.y,small:A1.f<A0.f,x:Math.round(A1.x-A0.x)}})()`);
    ok('le isole vanno verso nord: l\'isola dopo è sopra e più piccola, il ponte sale dritto',nb.dx===0&&nb.up>40&&nb.north&&nb.small&&nb.x===0,JSON.stringify(nb));
    await E(`(()=>{ISL.go=null;ISL.view=1;ISL.cur=1;ISL.jump=null;cnIslMove(1,0);return 0})()`);await W(300);const wk=await J(`({way:!!(ISL.jump&&ISL.jump.way),over:ISL.jump&&ISL.jump.way.pts.some(p=>p[2]>10),dur:ISL.jump&&+ISL.jump.dur.toFixed(2),cur:ISL.cur})`);await snap('ponte_cammina');
    await W(2600);const wk2=await J(`({jump:!!ISL.jump,cur:ISL.cur,view:+ISL.view.toFixed(2)})`);
    ok('l\'eroe attraversa il ponte a piedi (su e giù per la gobba) e arriva sull\'altra isola',wk.way&&wk.over&&wk.dur>=1&&wk.cur===0&&!wk2.jump&&wk2.cur===0&&wk2.view===0,JSON.stringify({wk,wk2}));
    {const q=await J(`(()=>{const r=$('homeStage').getBoundingClientRect(),L=ISL.lay;return{x:r.left+r.width*.5,y:campCv.getBoundingClientRect().top+(L.titleB/L.dpr)+20}})()`);
      await p.mouse.move(q.x,q.y);await p.mouse.down();for(let i=1;i<=8;i++){await p.mouse.move(q.x,q.y+i*16);await W(16)}await p.mouse.up();await W(2800)}
    const vd=await J(`({view:+ISL.view.toFixed(2),cur:ISL.cur,pick:SAVE.cn.pick})`);
    ok('col dito in giù si va all\'isola dopo (verso nord) e l\'eroe ci passa',vd.view===1&&vd.cur===1&&vd.pick===1,JSON.stringify(vd));
    // the locked islands are dark and their guardian is not drawn
    const dk=await J(`(()=>{const lum=i=>{const c=cnIslImg(i,ISL.lay).cv,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let s=0,n=0;for(let j=0;j<d.length;j+=16)if(d[j+3]>200){s+=d[j]*.3+d[j+1]*.59+d[j+2]*.11;n++}return n?s/n:0};
      const seen=new Set(),keep=cnIslBoss;cnIslBoss=function(i){seen.add(i);return keep.apply(this,arguments)};window.__bossSeen=seen;window.__bossKeep=keep;return{open:Math.round(lum(1)),lock:Math.round(lum(2))}})()`);
    await E(`(()=>{ISL.go=2;return 0})()`);await W(900);await snap('isola_chiusa_buia');
    const bs=await J(`(()=>{const r=[...__bossSeen];cnIslBoss=__bossKeep;ISL.go=null;ISL.view=ISL.cur;return r})()`);
    ok('le isole chiuse sono al buio e il loro custode non si vede',dk.lock<dk.open*.4&&bs.includes(1)&&!bs.includes(2)&&!bs.includes(3),JSON.stringify({dk,bs}));
    await openMap();const mp=await J(`(()=>{const n=document.querySelector('#cnMap .cnN.lock .cnPic img');return{lock:document.querySelectorAll('#cnMap .cnN.lock').length,f:n?getComputedStyle(n).filter:''}})()`);
    await p.click('#cnMap .cnN[data-a="2"]');await W(300);const ms=await J(`({t:(document.querySelector('#cnMap .cnSel')||{}).textContent||'',lk:!!document.querySelector('#cnMap .cnSel.lock'),f:getComputedStyle(document.querySelector('#cnMap .cnSel .cnSh img')).filter})`);await snap('mappa_buia');
    await p.click('#cnMap .cnX');await W(300);
    ok('sulla mappa le arene chiuse sono al buio, il custode è «???» e dice il ponte da finire',mp.lock===10&&/brightness\(0\.1/.test(mp.f)&&ms.lk&&/brightness\(0\.1/.test(ms.f)&&/Custode: \?\?\?/.test(ms.t)&&/Finisci il ponte da «.*»: 0\/100 pietre/.test(ms.t),JSON.stringify({mp,ms:Object.assign(ms,{t:ms.t.replace(/\s+/g,' ').slice(0,160)})}));
    // the Incubo on a won island
    await E(`(()=>{ISL.go=0;return 0})()`);await W(900);const ib=await J(`(()=>{const b=ISL.incBtn,L=ISL.lay,r=campCv.getBoundingClientRect();return b?{x:r.left+(b[0]+b[2])/2/L.dpr,y:r.top+(b[1]+b[3])/2/L.dpr}:null})()`);
    if(ib){await p.mouse.click(ib.x,ib.y);await W(900)}
    const i1=await J(`({btn:${!!ib},inc:!!ISL.inc,cls:$('playBtn').classList.contains('cnInc'),txt:$('playBtn').textContent.trim(),view:Math.round(ISL.view)})`);await snap('incubo_isola');
    ok('sull\'isola vinta c\'è «Incubo»: un tocco lo accende e «Gioca» diventa «Incubo»',i1.btn&&i1.inc&&i1.cls&&/Incubo/.test(i1.txt)&&i1.view===0,JSON.stringify(i1));
    await E(`(()=>{ISL.go=1;return 0})()`);await W(700);const i1b=await J(`({cls:$('playBtn').classList.contains('cnInc'),txt:$('playBtn').textContent.trim()})`);
    ok('sull\'isola non ancora vinta «Gioca» resta «Gioca»',!i1b.cls&&/Gioca/.test(i1b.txt),JSON.stringify(i1b));
    await E(`(()=>{ISL.go=0;return 0})()`);await W(700);
    const d0=await J(`({...DIFF})`);
    await E(`(()=>{__A.endSeen=0;__A.ends=[];__A.log=[];__A.god=true;goPlay('arena');return 0})()`);await W(2600);
    await E(`(()=>{for(let i=0;i<70;i++){if(G.hitstop>0)G.hitstop=0;P.hp=P.maxhp;update(1/30)}return 0})()`);await W(100);
    const i2=await J(`({inc:!!G.cnInc,a:G.cnA,eb:DIFF.eliteBase,ef:DIFF.eliteFrom,fh:DIFF.firstHp,diff:+G.diff.toFixed(2),ban:$('banner').textContent})`);await snap('incubo_stanza');
    ok('la Prova dell\'Incubo: nemici più forti, élite da subito, la scritta all\'inizio',i2.inc&&i2.a===0&&i2.eb===.3&&i2.ef===1&&i2.fh===1&&i2.diff===1.6&&/Incubo/.test(i2.ban),JSON.stringify(i2));
    await E(jump(10));await E(`(()=>{for(let i=0;i<150;i++){if(G.hitstop>0)G.hitstop=0;P.hp=P.maxhp;update(1/30)}return 0})()`);
    const i3=await J(`(()=>{const b=G.enemies.find(e=>isBoss(e.type));return b?{type:b.type,rage:!!(b.p2||b.reborn||b.tkRage||b.raged),a:b.cnIncA,full:b.hp>=b.max*.9}:null})()`);await snap('incubo_custode');
    ok('il custode dell\'Incubo è già arrabbiato (fase 2 da subito) con la vita intera',i3&&i3.rage&&i3.a===2&&i3.full,JSON.stringify(i3));
    const g0=await J(`({gold:SAVE.gold,gems:SAVE.gems,br:SAVE.cn.br[0]})`);
    await E(`(()=>{G.gold=100;P.goldMul=1;G.gemsRun=0;G.gems=[];endRun(true);return 0})()`);await W(700);
    const i4=await J(`({dg:+$('eGold').textContent,dgem:SAVE.gems-${g0.gems},br:SAVE.cn.br[0],inc:SAVE.cn.inc[0],tag:$('endTag').textContent,l:(document.querySelector('#eTr .cnIncL')||{}).textContent||'',bridge:!!document.querySelector('#eTr .cnBridge'),eb:DIFF.eliteBase,same:JSON.stringify({...DIFF})===JSON.stringify(${JSON.stringify(d0)})})`);await snap('incubo_vinto');
    ok('vinto l\'Incubo: oro doppio, 3 cristalli, la luna rossa, niente pietre, le manopole di prima',i4.dg===200&&i4.dgem>=3&&i4.br===g0.br&&i4.inc&&i4.inc.win&&i4.tag==='Prova dell\'Incubo'&&/Incubo vinto per la prima volta/.test(i4.l)&&!i4.bridge&&i4.same,JSON.stringify(i4));
    await p.click('#againBtn');await W(2400);const i5=await J(`({inc:!!G.cnInc,eb:DIFF.eliteBase,a:G.cnA})`);await toMenu();const i6=await J(`({same:JSON.stringify({...DIFF})===JSON.stringify(${JSON.stringify(d0)})})`);
    ok('«Gioca ancora» rifà l\'Incubo; uscendo a metà tornano le manopole di prima',i5.inc&&i5.eb===.3&&i5.a===0&&i6.same,JSON.stringify({i5,i6}));
    await W(1200);await snap('incubo_luna');
    await E(`(()=>{SAVE.cn.all=1;ISL.inc=false;ISL.go=5;return 0})()`);await W(900);const i7=await J(`({pill:!!ISL.incBtn,won:cnWon(5)})`);await E(`(()=>{SAVE.cn.all=0;ISL.go=null;ISL.view=ISL.cur;return 0})()`);
    ok('nell\'anteprima, con «apri tutte le arene», l\'Incubo si prova su ogni isola',i7.pill&&!i7.won,JSON.stringify(i7));
    await E(`(()=>{ISL.inc=false;cnPlayLbl();return 0})()`);
  }
  console.log('\n'+R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
