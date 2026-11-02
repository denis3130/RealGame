// Prove della Mossbound tripla A (anteprima a parte): python3 tests/t3/mk.py, poi node tests/t3/tripla.js
// La stanza del primo mondo in 3D vero: il motore acceso, l'eroe, i nemici del primo mondo, il Golem in tutte le sue mosse (anche nella
// fase 2), gli ostacoli, le due luci, le luci dei colpi e la telecamera che si stringe, gli effetti ridotti, il ritorno al disegno di
// sempre fuori dal primo mondo, i tempi di disegno. Foto in tests/t3/tr_*.png
const {chromium}=require('playwright');const D=__dirname+'/';
let ok=0,ko=0;const ck=(c,m)=>{if(c){ok++;console.log('  sì  '+m)}else{ko++;console.log('  NO  '+m)}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:390,height:763},deviceScaleFactor:1.5});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:500,trophies:0,runs:3,introSeen:1,handSeen:1,starter:'arciere',hero:'arciere',heroes:{arciere:1},modo:'classica',tutDone:1,
    items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
  await p.goto('file://'+D+'test_t3.html');await p.waitForTimeout(2500);const E=s=>p.evaluate(s=>window.__E(s),s);
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun();0`);await p.waitForTimeout(2600);
  // 1. the room of the first world in 3D
  console.log('La stanza');
  await E(`P.inv=999;P.hp=P.maxhp=1e6;G.room=3;G.event=null;buildRoom();0`);await p.waitForTimeout(3500);
  let s=JSON.parse(await E(`JSON.stringify({act:t3Active(),ok:__T3.ok,err:__T3.err,hero:T3E.n,cv:getComputedStyle(__T3.cv).display,rocks:T3S.n})`));
  ck(s.act&&s.ok,'nel primo mondo la stanza è in 3D');ck(s.cv!=='none','la tela 3D si vede');ck(s.hero>3,'l\'eroe è in 3D ('+s.hero+' pezzi)');ck(s.rocks>0,'gli ostacoli sono in 3D');ck(!s.err,'nessun errore del motore');
  await p.screenshot({path:D+'tr_stanza.png'});
  // 2. the enemies of the first world, each in 3D, every move
  console.log('I nemici');
  const T=['slime','bigslime','magmaslime','bat','mushroom','plant','wisp','goblin','skeleton','bonelet','necro'];
  const r=JSON.parse(await E(`(()=>{const out={},A=['idle','walk','attack','prep','hit','die'];G.enemies.length=0;
    for(const t of ${JSON.stringify(T)}){const e=makeE(t,AW/2,AH*.45,0);e.spawn=0;e.hp=1e6;e.max=1e6;G.enemies.push(e);let good=0,n=0;
      for(const a of A){if(a==='walk'&&t==='plant')continue;n++;const _c=t3Cap;t3Cap=function(fn){const q=_c(fn);if(q.n){q.n.anim=a;q.n.p=.37}if(q.h){q.h.anim=a==='attack'?'shoot':a;q.h.p=.37}return q};
        try{T3N.force=40;T3N.msF=0;const d=t3EnemyDraw(e);if(d)good++}catch(er){}t3Cap=_c}G.enemies.length=0;out[t]=[good,n,!!T3N.bad[t]]}return JSON.stringify(out)})()`));
  for(const t of T)ck(r[t][0]===r[t][1]&&!r[t][2],t+': tutte le mosse in 3D ('+r[t][0]+'/'+r[t][1]+')');
  // 3. the Golem: every move, both phases
  console.log('Il Golem');
  const g=JSON.parse(await E(`(()=>{const K=t3GK(),out=[];for(const p2 of[false,true])for(const a of K.MV)for(const pp of[.1,.5,.9]){try{const R=t3GolemItems({anim:a,p:pp,o:{p2},sc:1},t3CharM(0,1,200,300,0));out.push(R.items.length>20&&R.items.every(it=>it.M.every(isFinite)))}catch(er){out.push(false)}}return JSON.stringify({n:out.length,good:out.filter(Boolean).length,mv:K.MV.length})})()`));
  ck(g.good===g.n,'il Golem in tutte le '+g.mv+' mosse, fase 1 e fase 2 ('+g.good+'/'+g.n+' pose)');
  await E(`(()=>{G.enemies.length=0;const e=makeE('golem',AW/2,AH*.42,0);e.spawn=0;e.intro=0;e.z=0;e.hp=1e9;e.max=1e9;G.enemies.push(e);return 1})()`);await p.waitForTimeout(1800);
  s=JSON.parse(await E(`JSON.stringify({n:T3GL.n,bad:T3GL.bad})`));ck(s.n>40&&!s.bad,'il Golem nella stanza è in 3D ('+s.n+' pezzi)');
  await p.screenshot({path:D+'tr_golem.png'});
  // 4. the two lights
  console.log('Le due luci');
  await E(`__T3.luce='film';0`);await p.waitForTimeout(2200);s=JSON.parse(await E(`JSON.stringify({l:__T3.luce,b:(document.getElementById('t3btn')||{}).textContent||''})`));
  ck(s.l==='film'&&/film/i.test(s.b),'la luce «Da film» col bottone che lo dice');await p.screenshot({path:D+'tr_golem_film.png'});
  await E(`__T3.luce='chiara';0`);await p.waitForTimeout(500);s=JSON.parse(await E(`JSON.stringify({l:__T3.luce})`));ck(s.l==='chiara','torna la luce «Chiara»');
  // 5. the lights of the blows, the squeeze of the camera
  console.log('I colpi');
  s=JSON.parse(await E(`(()=>{const e=G.enemies[0],n0=T3FX.L.length;hurtE(e,5,false);const a=T3FX.L.length>n0;P.inv=0;P.dashT=0;const k0=T3FX.kick;hurtP(1);P.inv=999;return JSON.stringify({a,kick:T3FX.kick>k0})})()`));
  ck(s.a,'un colpo a segno accende un lampo sul nemico');ck(s.kick,'un colpo preso stringe la telecamera');
  // 6. the frame time: 8 enemies and the hero
  console.log('I tempi');
  await E(`(()=>{G.enemies.length=0;for(const t of ['slime','slime','bat','mushroom','goblin','skeleton','plant','wisp']){const e=makeE(t,AW/2-100+Math.random()*200,AH*.3+Math.random()*200,0);e.spawn=0;e.hp=1e6;e.max=1e6;G.enemies.push(e)}return 1})()`);
  await p.waitForTimeout(3000);await E(`__T3.prof={};0`);await p.waitForTimeout(3000);
  s=JSON.parse(await E(`(()=>{const P0=__T3.prof,n=P0.n||1,o={n};for(const k of Object.keys(P0))if(k!=='n'&&k!=='_')o[k]=+(P0[k]/n).toFixed(2);__T3.prof=null;return JSON.stringify(o)})()`));
  console.log('  tempi medi a fotogramma (ms, computer di prova senza scheda grafica):',JSON.stringify(s));ck(s.n>=3,'il disegno 3D gira ('+s.n+' fotogrammi misurati)');
  // 7. reduced effects
  console.log('Effetti ridotti');
  await E(`LOWFX=true;0`);await p.waitForTimeout(1200);s=JSON.parse(await E(`JSON.stringify({act:t3Active(),err:__T3.err,low:!!__T3.low})`));ck(s.act&&!s.err,'con gli effetti ridotti la stanza resta in 3D senza errori');await E(`LOWFX=false;0`);
  // 8. out of the first world: the drawing of always
  console.log('Fuori dal primo mondo');
  await E(`G.chapter=2;G.room=3;G.event=null;buildRoom();0`);await p.waitForTimeout(1500);s=JSON.parse(await E(`JSON.stringify({th:themeOf(G.room),act:t3Active(),cv:getComputedStyle(__T3.cv).display})`));
  ck(!s.act&&s.cv==='none','fuori dal primo mondo ('+s.th+') torna il disegno di sempre');
  ck(!errs.length,'nessun errore nella pagina'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  console.log(`\n${ok} sì, ${ko} no`);await b.close();process.exit(ko?1:0)})();
