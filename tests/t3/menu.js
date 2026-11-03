// Prove del menu della Mossbound tripla A (anteprima a parte): python3 tests/t3/mk.py, poi node tests/t3/menu.js
// Il cammino delle isole in 3D vero (isole, ponte, mini isola, eroe, custode, premi e tocchi), lo spettacolo delle assi, l'interfaccia nuova
// (e quella di prima con l'interruttore), l'assedio del menu Zombie in 3D (barricata, orda, lo zombie che scavalca e l'eroe che spara, ricarica,
// bossoli, cenere, lampo, spinta), il vento e la vita sulle isole, lo scorrimento tra le modalità con le due scene in 3D, il ritorno al disegno di
// sempre se il 3D non c'è, i tempi.
// Foto in tests/t3/me_*.png
const {chromium}=require('playwright');const D=__dirname+'/';
let ok=0,ko=0;const ck=(c,m)=>{if(c){ok++;console.log('  sì  '+m)}else{ko++;console.log('  NO  '+m)}};
const SAVE={gold:5000,gems:500,trophies:900,runs:12,introSeen:1,handSeen:1,starter:'arciere',hero:'arciere',heroes:{arciere:1},modo:'classica',tutDone:1,
  cn:{br:{0:40},stars:{0:1},pick:0},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:390,height:763},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200))});
  await p.addInitScript(s=>{localStorage.setItem('cripta_save_v1',s)},JSON.stringify(SAVE));
  await p.goto('file://'+D+'test_t3.html');await p.waitForTimeout(3000);const E=s=>p.evaluate(s=>window.__E(s),s);
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);0`);await p.waitForTimeout(2500);
  // 1. the islands in 3D
  console.log('Le isole');
  let s=JSON.parse(await E(`JSON.stringify({live:T3I.live,host:T3I.host,bad:T3I.bad,err:__T3.err,cv:getComputedStyle(__T3.cv).display,hero:!!CAMP.hero,prz:(ISL.prz||[]).length,nV:T3I.nV,meshes:T3I.M.size})`));
  ck(s.live&&s.host==='menu'&&s.cv!=='none'&&!s.bad,'la schermata principale della Classica è in 3D');ck(!s.err,'nessun errore del motore');
  ck(s.hero,'l\'eroe si tocca dove lo disegna il 3D');ck(s.prz>0,'i premi del ponte si toccano dove sono ('+s.prz+')');ck(s.nV<65000,'nessun pezzo oltre i 65.000 punti ('+s.nV+')');
  await p.screenshot({path:D+'me_isola.png'});
  await E(`ISL.view=.48;ISL.rest=.48;ISL.go=null;0`);await p.waitForTimeout(1500);await p.screenshot({path:D+'me_ponte.png'});
  s=JSON.parse(await E(`JSON.stringify({prz:(ISL.prz||[]).length,at:Object.keys(ISL.przAt||{}).length})`));ck(s.at>0,'i premi hanno il loro posto sullo schermo per lo spettacolo');
  await E(`ISL.view=0;ISL.rest=null;ISL.go=0;0`);await p.waitForTimeout(800);
  // the wind on the bridge, the bridge that sways under the hero, the life round the islands
  const wu0=+await E(`T3I.wu||0`);await E(`(()=>{const G0=cnBrGeo(0);ISL.sw={i:0,a:1,b:1,h:G0.a0+G0.len*.35};T3I.life&&(T3I.life.fT=0);return 1})()`);
  await p.waitForFunction(w=>__E(`(T3I.wu||0)!==${w}&&!!T3I.lm&&!!T3I.life&&T3I.life.fl.length>0`),wu0,{timeout:60000}).catch(()=>{});
  s=JSON.parse(await E(`JSON.stringify({wu:T3I.wu,wind:[...T3I.M.values()].some(B=>B&&B.wind&&B.wind.length===3),pBr:!!T3I.pBr,lm:!!T3I.lm,fl:T3I.life?T3I.life.fl.length:0,err:__T3.err})`));
  ck(s.wu!==wu0&&s.wind&&s.pBr,'il vento muove funi e stendardi del ponte, il ponte ondeggia sotto l\'eroe');ck(s.lm&&s.fl>0,'uno stormo passa sopra il ponte ('+s.fl+')');
  await E(`ISL.sw=null;0`);
  // 2. the show: planks fly in, prizes open, the hero runs to the checkpoint
  console.log('Lo spettacolo delle assi');
  await E(`(()=>{const got=[2,3,4].map(j=>Object.assign({j},cnBrPrize(0,j)));cnS().br[0]=100;CN.brAnim={i:0,from:cnBrLaid(0,40),to:cnBrLaid(0,100),done:true,got,pend:{gold:0,gems:0,slots:[]}};cnIslSync(true);
    const _c=cnIsles;cnIsles=function(dt){return _c(Math.min(.2,dt*5))};return 1})()`);
  const k0=+await E(`ISL.brA?ISL.brA.k:-1`);let seen={},fl=0;for(let i=0;i<28;i++){await p.waitForTimeout(1000);const q=JSON.parse(await E(`JSON.stringify({ph:ISL.brA&&ISL.brA.ph,k:ISL.brA&&ISL.brA.k,fl:ISL.brA&&ISL.brA.fl.length})`));if(q.ph)seen[q.ph]=1;fl=Math.max(fl,q.fl||0);
    if(i===3)await p.screenshot({path:D+'me_spettacolo.png'});if(q.ph==='pop4'&&!seen.shot){seen.shot=1;await p.screenshot({path:D+'me_traguardo.png'})}if(!q.ph)break}
  ck(k0>=0&&fl>0,'le assi volano in 3D al loro posto');ck(seen.lay&&(seen.pop||seen.walk||seen.pop4),'le assi si posano, i premi si aprono, l\'eroe va al traguardo');
  s=JSON.parse(await E(`JSON.stringify({bad:T3I.bad,err:__T3.err})`));ck(!s.bad&&!s.err,'nessun errore durante lo spettacolo');
  // 3. the interface: new, the switch in the Settings, the one of before
  console.log('L\'interfaccia');
  ck(await E(`document.documentElement.classList.contains('t3ui')`),'l\'interfaccia nuova è accesa');
  await E(`openSheet('set');0`);await p.waitForTimeout(600);ck(await E(`!!document.querySelector('#sheet .t3set [data-u]')`),'nelle Impostazioni gli interruttori dell\'anteprima');await p.screenshot({path:D+'me_impostazioni.png'});
  await E(`document.querySelector('#sheet .t3set [data-u="0"]').click();0`);ck(!await E(`document.documentElement.classList.contains('t3ui')`),'«Di prima» torna all\'interfaccia di oggi');
  await E(`document.querySelector('#sheet .t3set [data-u="1"]').click();document.querySelector('#sheet .t3set [data-l="film"]').click();0`);ck(await E(`document.documentElement.classList.contains('t3ui')&&__T3.luce==='film'`),'«Interfaccia nuova» e «Luce da film» dalle Impostazioni');
  await E(`document.querySelector('#sheet .t3set [data-l="chiara"]').click();$('sheetScr').hidden=true;0`);
  await E(`openSheet('mis');0`);await p.waitForTimeout(600);await p.screenshot({path:D+'me_missioni.png'});await E(`$('sheetScr').hidden=true;0`);
  // 4. the Zombie menu: the siege in 3D
  console.log('L\'assedio');
  // (the sweep must reach its end by itself: the menu's clock runs on even while the pictures slide)
  await p.click('#zHand',{force:true});const sw0=await E(`!!MM.tr`);await p.waitForFunction(()=>__E('!MM.tr'),null,{timeout:240000}).catch(()=>{});
  ck(sw0&&await E(`!MM.tr&&zMode()`),'lo scorrimento verso la Zombie arriva in fondo da solo');
  // (the first time the scene is made a little each frame: meanwhile the drawing of always)
  await p.waitForFunction(()=>__E('T3F.ready&&!!T3F.hd'),null,{timeout:90000}).catch(()=>{});await p.waitForTimeout(1500);
  s=JSON.parse(await E(`JSON.stringify({z:zMode(),ready:T3F.ready,bad:T3F.bad,live:T3I.live,err:__T3.err,hero:!!CAMP.hero,ms:+T3F.ms.toFixed(1),S:T3F.S.length,mats:Object.keys(T3F.X).length,
    tris:T3F.S.concat(T3F.G.bar||[]).reduce((a,it)=>a+it.m.n/3,0),big:T3F.S.concat(T3F.G.bar||[],T3F.G.wheel||[]).every(it=>it.m.nv<65000),bar:(T3F.G.bar||[]).length,wheel:!!(T3F.G.wheel&&T3F.wheel),
    torch:(T3F.torch||[]).length,ff:(T3F.ff||[]).length,Z:T3F.hd?T3F.hd.Z.length:0,roles:T3F.hd?[...new Set(T3F.hd.Z.map(z=>z.role))].sort().join(','):'',z3:!!T3F.hd&&T3F.hd.Z.some(z=>z.M),hy:T3F.hy,top:T3F.top})`));
  ck(s.z&&s.ready&&!s.bad&&s.live,'l\'assedio del menu Zombie è in 3D');ck(s.hero,'l\'eroe si tocca');ck(!s.err,'nessun errore del motore');
  ck(s.S>=12&&s.mats>=15,'tutta la scena in 3D, dipinta coi materiali ('+s.S+' pezzi, '+s.mats+' disegni dei materiali, '+s.tris+' triangoli)');ck(s.big,'nessun pezzo oltre i 65.000 punti');
  ck(s.bar>=8&&s.wheel&&s.torch===2,'la barricata col carro ribaltato, la ruota che gira e le due torce');ck(s.ff>=5,'la fattoria brucia ('+s.ff+' fuochi)');
  ck(s.hy>s.top,'l\'orizzonte sotto la barra in alto: il cielo si vede');ck(s.Z>=14&&s.z3&&/press/.test(s.roles)&&/row2/.test(s.roles),'l\'orda in 3D alla barricata ('+s.Z+': '+s.roles+')');
  await p.screenshot({path:D+'me_assedio.png'});
  // (on this computer a frame can take a second: wait for the next ones, not for a fixed time)
  // one climbs the barricade: the hero turns, aims and shoots, it falls back; the horde comes back to its number
  await E(`(()=>{T3F.seen={};const _u=t3FHeroUp;t3FHeroUp=function(dt){_u(dt);T3F.seen[T3F.h.st]=1};const H=T3F.hd;for(const z of H.Z)if(z.role!=='walk'){z.x=z.tx;z.y=z.ty}T3F.h.st='idle';H.cT=0;return 1})()`);
  await p.waitForFunction(()=>__E(`T3F.n.shot>0&&!T3F.hd.Z.some(z=>z.role==='climb')`),null,{timeout:60000}).catch(()=>{});
  s=JSON.parse(await E(`JSON.stringify({n:T3F.n,seen:T3F.seen,fx:T3F.fx.length})`));
  ck(s.n.climb>0&&s.seen.turn&&s.seen.aim&&s.n.shot>0,'uno scavalca, l\'eroe si gira, mira e spara '+JSON.stringify(s.n));
  s=JSON.parse(await E(`JSON.stringify({cs:T3F.fx.filter(e=>e.k==='cs').length,bl:T3F.fx.filter(e=>e.k==='bl'||e.k==='sp').length,ash:(T3F.ash||[]).length,cam:!!T3F.cam,go:!!T3F.go})`));
  ck(s.go&&s.cs>0,'l\'arma vera dell\'Arsenale: i bossoli volano ('+s.cs+')');ck(s.ash>0,'cenere e braci nel vento ('+s.ash+')');
  await p.waitForFunction(()=>__E(`(T3F.h.st==='idle'||T3F.h.st==='reload')&&T3F.hd.Z.filter(z=>z.role!=='dead').length>=T3F.hd.n`),null,{timeout:240000}).catch(()=>{});
  s=JSON.parse(await E(`JSON.stringify({st:T3F.h.st,alive:T3F.hd.Z.filter(z=>z.role!=='dead').length,n:T3F.hd.n,seen:T3F.seen})`));ck((s.st==='idle'||s.st==='reload')&&s.alive>=s.n,'l\'eroe torna a guardia (e ricarica) e l\'orda torna al suo numero '+JSON.stringify(s));
  // the barricade shakes under a push, the lightning, the scarecrow that looks at you
  await E(`(()=>{T3F.hd.uT=0;T3F.lt.next=0;T3F.sc.st='idle';T3F.sc.t=99;T3F.sc.next=0;return 1})()`);
  await p.waitForFunction(()=>__E(`T3F.n.push>0&&T3F.n.bolt>0&&T3F.sc.st==='turn'`),null,{timeout:20000}).catch(()=>{});
  s=JSON.parse(await E(`JSON.stringify({n:T3F.n,sc:T3F.sc.st})`));ck(s.n.push>0,'la barricata trema sotto una spinta');ck(s.n.bolt>0,'il lampo');ck(s.sc==='turn','lo spaventapasseri si gira a guardarti');
  // 5. the times (the computer of the tests has no graphics card: on the phone the counter says it)
  console.log('I tempi');
  const zt=+await E(`T3F.ms.toFixed(1)`);await p.click('#cSprout',{force:true}).catch(()=>{});
  s=JSON.parse(await E(`JSON.stringify({tr:!!MM.tr,i:!!T3I.snapOk,f:!!T3F.snapOk})`));ck(s.tr&&s.i&&s.f,'lo scorrimento tra le modalità mostra le due scene in 3D '+JSON.stringify(s));
  await p.waitForFunction(()=>__E('!MM.tr'),null,{timeout:240000}).catch(()=>{});ck(await E(`!MM.tr&&!zMode()`),'e quello verso la Classica pure');await E(`if(zMode()){SAVE.modo='classica';applyModeUI()}0`);await p.waitForTimeout(2500);const it=+await E(`T3I.ms.toFixed(1)`);
  console.log('  tempi medi a fotogramma (ms, computer di prova senza scheda grafica): isole',it,'· assedio',zt);ck(it>0&&zt>0,'il disegno 3D del menu gira');
  // 6. no 3D: the drawing of always
  console.log('Senza 3D');
  await E(`T3I.on=false;T3F.on=false;0`);await p.waitForFunction(()=>__E(`!T3I.live&&getComputedStyle(__T3.cv).display==='none'`),null,{timeout:90000}).catch(()=>{});s=JSON.parse(await E(`JSON.stringify({live:T3I.live,cv:getComputedStyle(__T3.cv).display,z:zMode(),tr:!!MM.tr,seen:T3I.seen,wN:T3I.wN,host:T3I.host})`));ck(!s.live&&s.cv==='none','senza il 3D torna il disegno di sempre '+JSON.stringify(s));await E(`T3I.on=true;T3F.on=true;0`);
  ck(!errs.length,'nessun errore nella pagina'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log(`\n${ok} sì, ${ko} no`);await b.close();process.exit(ko?1:0)})();
