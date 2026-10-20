// Prova della Classica nuova (src/js/94-classica-nuova.js, solo nell'anteprima), seconda versione con le scelte di Denis: il menu (scheda coi
// bracieri, mappa senza stelle, Torre, Corsa, Reliquie, Ricercati, il bottone «Premi», la Zombie com'era); la partita d'arena con le 10 stanze
// di sempre (le ondate a tempo sono tolte: l'eroe cresce, la Furia sale, il custode alla stanza 10, la vittoria col braciere e il record);
// la Furia (ranghi, moltiplicatore per 6 secondi, colpo che la spezza, niente fiamme); le carte con la rarità a sorpresa (rivelazione,
// effetti più grandi, due livelli alle leggendarie); le evoluzioni spettacolari (la carta, la trasformazione, tutte e sei insieme senza
// errori); la Nemesi (chi ti uccide si prende l'oro, il manifesto, l'invasione in una stanza a caso col sacco, le frasi, la taglia, la
// Nemesi che cresce, il custode che tiene l'oro); la Torre fino al piano 20 e la Corsa dei boss.
// Foto tests/cn_<n>.png. Uso: python3 anteprime/mk_classica.py --test --build && node tests/classica.js [menu|stanze|furia|rarita|evo|nemesi|torre|corsa]
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
  const jump=r=>`(()=>{const k=G.seq.findIndex(q=>q.c===${r});G.si=k-1;G.enemies=[];G.eproj=[];nextStep();return 0})()`;   // straight to room r

  // ---------------------------------------------------------------- the menu
  if(!SOLO||SOLO==='menu'){
    await toMenu();
    const card=await J(`({t:$('chapCard').textContent,stars:$('chapCard').querySelectorAll('.cnCkS b').length,braz:$('chapCard').querySelectorAll('.cnTr svg').length})`);
    ok('la scheda dell\'arena: bracieri, niente stelle, porta alla mappa',card.braz===1&&card.stars===0&&/Mappa/.test(card.t)&&/0\/12/.test(card.t),card.t.slice(0,90));
    const mn=await J(`({premi:${vis('cnPremiBtn')},mis:${vis('misBtn')},login:${vis('loginBtn')},road:${vis('roadSide')},offer:${vis('offerBtn')},pass:${vis('passBtn')},chest:${vis('chestBtn')}})`);
    ok('menu: a sinistra solo «Premi», a destra Pass e Casse',mn.premi&&!mn.mis&&!mn.login&&!mn.road&&!mn.offer&&mn.pass&&mn.chest,JSON.stringify(mn));
    await p.click('#cnPremiBtn');await W(450);const pr=await J(`({open:!$('cnPremi').hidden,rows:document.querySelectorAll('#cnPremi .cnPrR').length})`);await snap('menu_premi');
    ok('«Premi» apre Missioni, Accesso, Ruota e Traguardi',pr.open&&pr.rows===4,JSON.stringify(pr));
    await p.click('#cnPremi .cnPrR[data-id="misBtn"]');await W(600);const ms=await J(`({sheet:SHEET,vis:!$('sheetScr').hidden})`);ok('dal pannello si aprono le Missioni',ms.vis&&ms.sheet==='mis',JSON.stringify(ms));
    await E(`(()=>{closeSheet();modal=false;return 0})()`);
    const zm=await J(`(()=>{const m=$('menu');m.classList.add('zmode');const r={premi:${vis('cnPremiBtn')},mis:${vis('misBtn')}};m.classList.remove('zmode');return r})()`);ok('nella Zombie il menu resta com\'era',!zm.premi&&zm.mis,JSON.stringify(zm));
    await p.click('#chapCard');await W(500);
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
    const s5=await J(`({ends:__A.ends,won:SAVE.cn.stars[0],best:SAVE.cn.best[0],bestA:bestRoom(0),pick:SAVE.cn.pick,etr:$('eTr').textContent.replace(/\\s+/g,' ').slice(0,160),room:$('eRoom').textContent})`);await snap('vittoria');
    ok('la vittoria: braciere acceso, record, l\'arena dopo proposta',end&&s5.ends[0]&&s5.ends[0].title==='VITTORIA'&&(s5.won&1)===1&&s5.best&&s5.best.win&&s5.bestA===10&&s5.pick===1&&/braciere/.test(s5.etr)&&/Furia massima/.test(s5.etr),JSON.stringify(s5));
    await toMenu();const c=await J(`({t:$('chapCard').textContent,n:$('chapCard').querySelectorAll('.rn').length,on:$('chapCard').querySelectorAll('.rn.on').length})`);
    ok('la scheda dopo la vittoria propone l\'arena 2, con le sue 10 stanze',/Arena 2/.test(c.t)&&c.n===10&&c.on===0,JSON.stringify(c));
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
    await toMenu();await p.click('#chapCard');await W(400);await p.click('#cnMap .cnMode[data-sub="nem"]');await W(500);
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
  console.log('\n'+R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
