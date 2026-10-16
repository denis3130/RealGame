// the six heroes of 16 October and what came with them (src/js/93-96): every hero's Super at grade 0 and III (no errors, the grade's
// effect is there), the reach of the short blows (94) and its switch in the settings, every voice of every hero made without a NaN (95),
// the mastery (96): the levels from the save, the points from a kill and a clean room, the band «Maestria N» with its gold, the name of the
// Super with its numeral, the row in the Heroes tab; the own weapons (97): power and look only with their hero. Uso: node eroi6.js (dopo python3 tests/mk.py)
const {chromium}=require('playwright');
const HEROES=['arciere','cacciatrice','balestriere','druida','bardo','alchimista','ninja','paladino','mago','berserker','corsaro','domatore','monaco'];
const SAVE0=(hero,mq)=>({gold:1000,gems:50,trophies:700,trBest:700,runs:6,introSeen:1,starter:'arciere',sel:'arena',items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},
  eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],tutDone:1,handSeen:1,hero,heroes:{arciere:1,[hero]:1},maestria:mq||{}});
(async()=>{const b=await chromium.launch();const errs=[];const R=[];const ok=(n,c)=>R.push((c?'OK   ':'FAIL ')+n);
  const page=async save=>{const p=await b.newPage({viewport:{width:390,height:800},deviceScaleFactor:1});p.on('pageerror',e=>errs.push(e.message+' '+((e.stack||'').split('\n')[1]||'').trim()));
    await p.addInitScript(s=>{localStorage.setItem('cripta_save_v1',JSON.stringify(s))},save);await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1100);
    const E=s=>p.evaluate(s=>__E(s),s);await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`);return{p,E}};
  const crowd=`(()=>{G.enemies.length=0;['goblin','slime','skeleton','bat','slime','goblin','skeleton'].forEach((k,i)=>{const e=makeE(k,AW/2-130+i*44,TOP+170+(i%2)*70,0);e.hp=e.max=e.hp*30;e.spawn=0;G.enemies.push(e)})})()`;
  // 1. the Supers
  const want={arciere:s=>s.big===1,cacciatrice:s=>s.spin>1.5,balestriere:s=>s.q===1&&s.xpl>=1,druida:s=>s.rootX>0,bardo:s=>s.q===1&&s.bal>2,alchimista:s=>s.mqC===2,ninja:s=>s.sh>6&&s.x3,
    paladino:s=>s.hx3,mago:s=>s.bl>4.5&&s.bx3,berserker:s=>s.fury>8&&s.furyX,corsaro:s=>s.cann===16&&s.cbig===1,domatore:s=>s.pack===6&&s.px3,monaco:s=>s.fl>2.5&&s.fx3};
  for(const hero of HEROES){const res={};for(const xp of [0,4400]){const {p,E}=await page(SAVE0(hero,{[hero]:xp}));await E('startRun()');await p.waitForTimeout(1500);await E(crowd);await E('P.ult=100;useUlt()');
      res[xp]=await E(`({tier:ultTier(),big:G.ultRain.filter(r=>r.big).length,spin:P.spin||0,q:(G.ultQ||[]).length,xpl:G.arrows.filter(a=>a.xpl).length,rootX:G.enemies.filter(e=>e.rootX).length,bal:G.ballad?G.ballad.dur:0,
        mqC:(G.mqC||[]).length,sh:G.shadows?G.shadows.dur:0,x3:!!(G.shadows&&G.shadows.x3),hx3:!!(G.skyHam&&G.skyHam.x3),bl:G.blizz?G.blizz.dur:0,bx3:!!(G.blizz&&G.blizz.x3),fury:P.fury||0,furyX:!!P.furyX,
        cann:(G.cannon||[]).length,cbig:(G.cannon||[]).filter(c=>c.big).length,pack:G.pack?G.pack.list.length:0,px3:!!(G.pack&&G.pack.x3),fl:G.flurry?G.flurry.dur:0,fx3:!!(G.flurry&&G.flurry.x3),
        name:(G.texts.find(t=>/ I+$/.test(t.t))||{}).t||''})`);
      for(let i=0;i<8;i++){await E('if(P)P.hp=P.maxhp');await p.waitForTimeout(250)}await p.close()}
    ok(`${hero}: Super al grado 0 (niente effetto nuovo) e al grado III (${res[4400].name})`,res[0].tier===0&&!want[hero](res[0])&&res[4400].tier===3&&want[hero](res[4400])&&/ III$/.test(res[4400].name))}
  // 2. the reach
  {const {p,E}=await page(SAVE0('monaco'));await E('startRun()');await p.waitForTimeout(1500);await E(crowd);await p.waitForTimeout(600);
    ok('gittata: il Monaco ha la corsia del pugno (346 px)',await E("GIT.k>.5&&GIT.spec.kind==='punch'&&Math.round(GIT.spec.r)===346"));
    const kinds=await E(`(()=>{const o={};for(const h of ['corsaro','domatore','berserker','alchimista','arciere','ninja']){const keep=P.proj;P.proj=HERO_BY[h].proj;P.pspd=PSPD[P.proj]||560;const s=gitSpec();o[h]=s?s.kind:null;P.proj=keep}return o})()`);
    ok('gittata: sciabola, frusta, ascia, fiala; niente per frecce e stelline '+JSON.stringify(kinds),kinds.corsaro==='sabre'&&kinds.domatore==='whip'&&kinds.berserker==='axe'&&kinds.alchimista==='flask'&&!kinds.arciere&&!kinds.ninja);
    await E("endRun(false,true)");await p.waitForTimeout(900);await E("openSheet('set')");await p.waitForTimeout(200);await p.click('button[data-gitt="0"]');await p.waitForTimeout(150);
    ok('Impostazioni → Gittata: «Spenta» la spegne',await E("SAVE.set.gitt===false&&!GIT.on()&&/gittata mostra/.test($('sheet').textContent)"));await p.click('button[data-gitt="1"]');
    ok('«Accesa» la riaccende',await E('GIT.on()'));await p.close()}
  // 3. the voices
  {const {p,E}=await page(SAVE0('arciere'));const v=await E(`(()=>{let n=0,bad=[];for(const h in HV.PF){const W=HV.lib(h);for(const k of ['att','hurt','ult','win','die','talk'])if(!W[k]||!W[k].length)bad.push(h+':'+k);
      for(const k in W)W[k].forEach((c,i)=>{const d=B3VO.render(B3VO.clip(c[0],c[1],HV.PF[h].base,c[2]));let pk=0,nan=0;for(const x of d){if(!isFinite(x))nan++;else pk=Math.max(pk,Math.abs(x))}n++;if(nan||pk<.02)bad.push(h+'.'+k+i)})}
      const lines=Object.keys(HLINE).length===13&&Object.values(HLINE).every(L=>['start','boss','win','low','revive','room'].every(k=>L[k]));return{n,bad,lines}})()`);
    ok(`voci: ${v.n} versi dei tredici eroi senza errori, tutte le battute`,!v.bad.length&&v.lines&&v.n>=110);
    await E('startRun()');await p.waitForTimeout(2600);ok('voci: il fumetto della prima stanza «'+await E("G.hvb&&G.hvb.s")+'»',await E("!!G.hvb&&G.hvb.k==='start'"));await p.close()}
  // 4. the mastery
  {const {p,E}=await page(SAVE0('paladino',{paladino:315,mago:2000}));
    ok('maestria: i livelli dal salvataggio (Paladino 2, Mago 7 con la Super II, Arciere 1)',await E("mqLvl('paladino')===2&&mqLvl('mago')===7&&ultTier('mago')===2&&mqLvl('arciere')===1&&ultTier('arciere')===0"));
    await E('startRun()');await p.waitForTimeout(1600);await E(crowd);const g0=await E('SAVE.gold');await E('for(const e of G.enemies.slice(0,5))killE(e)');
    ok('maestria: nemici uccisi danno punti, al 320 il livello 3',await E("mqLvl('paladino')===3&&SAVE.maestria.paladino>=320"));
    await E('for(const e of G.enemies)if(!e.dead)killE(e)');await p.waitForTimeout(900);
    ok('maestria: stanza pulita, la fascia «Maestria 3» e 150 oro',await E(`/Maestria 3/.test($('banner').textContent)&&SAVE.gold===${g0}+150`));
    await E('P.ult=100;useUlt()');await p.waitForTimeout(100);ok('maestria: il nome della Super col grado («Martello del cielo I»)',await E("G.texts.some(t=>/Martello del cielo I$/.test(t.t))"));
    await E("endRun(false,true)");await p.waitForTimeout(1200);await E("document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);heroView='mago';setTab('tabHero');renderHero()");await p.waitForTimeout(300);
    ok('maestria: nella scheda Eroi la riga col livello e i tre gradi',await E("!!$('mqBox')&&/Maestria Liv\\. 7/.test($('mqBox').textContent)&&$('mqBox').querySelectorAll('.mqT .on').length===2"));
    const ls=await E(`(o=>o.v===2?o.classica.maestria:o.maestria)(JSON.parse(localStorage.getItem('cripta_save_v1')))`);ok('maestria: nel salvataggio, nel blocco della Classica',!!ls&&ls.paladino>=320);await p.close()}
  // 5. the own weapons: the power and the look only with their hero
  for(const [hero,w,chk] of [['arciere','arco_stelle',"P.style.bowKind==='stelle'"],['berserker','asce_tuono',"(G.axes||[]).length>=2"],['monaco','grani_quiete',"P.shockEvery===3&&P.style.wraps==='#f0c64a'"]]){
    const sv=SAVE0(hero);sv.items[w]={lvl:1,cards:0};sv.eq.arma=w;const {p,E}=await page(sv);await E('startRun()');await p.waitForTimeout(1500);await E(crowd);await p.waitForTimeout(1600);
    const r=await E(`({own:P.own,leg:P.style.legW,chk:${chk}})`);await E("SAVE.hero='"+(hero==='arciere'?'paladino':'arciere')+"';SAVE.heroes[SAVE.hero]=1");const o=await E('(()=>{const q=makeP();return{own:q.own,leg:heroStyle0(SAVE.hero).legW||null}})()');
    ok(`armi proprie: ${w} col suo eroe (potere e aspetto), con un altro solo i numeri`,r.own===w&&r.leg===w&&r.chk&&!o.own&&!o.leg);await p.close()}
  // 6. the classic enemies more alive (98): the wind-up before the blow and the look round when still
  {const {p,E}=await page(SAVE0('arciere'));await E('startRun()');await p.waitForTimeout(1400);
    const r=await E(`(()=>{const out={};for(const t of ['goblin','skeleton','plant','imp','eyeflower']){G.enemies.length=0;G.eproj.length=0;P.inv=999;const e=makeE(t,P.x,P.y-170,0);e.spawn=0;e.hp=e.max=99999;G.enemies.push(e);
      let prep=0;for(let i=0;i<480;i++){update(1/60);P.hp=P.maxhp;P.x=AW/2;P.y=BOT-60;const[a]=n3Move(e);if(a==='prep')prep++;e.a3n=a}out[t]=prep}return{out,n:Object.keys(N3.meta).filter(k=>N3.meta[k].an.includes('prep')&&N3.meta[k].g!=='boss3').length}})()`);
    ok('nemici più vivi: «Prepara» per 26 nemici, e si vede prima dei loro colpi '+JSON.stringify(r),r.n===26&&Object.values(r.out).every(v=>v>20));
    const sw=await E(`(()=>{G.enemies.length=0;const e=makeE('plant',P.x+60,P.y-160,0);e.spawn=0;G.enemies.push(e);e.a3n='idle';let mn=9,mx=-9;for(let i=0;i<400;i++){G.t+=1/60;const f=n3Face(e)-n3Face0(e);mn=Math.min(mn,f);mx=Math.max(mx,f)}return+(mx-mn).toFixed(2)})()`);
    ok('nemici più vivi: da fermi si guardano intorno piano ('+sw+' rad)',sw>.3&&sw<1.4);await p.close()}
  ok('nessun errore nella pagina'+(errs.length?': '+errs.slice(0,4).join(' | '):''),!errs.length);
  console.log(R.join('\n'));await b.close();process.exit(R.some(r=>r.startsWith('FAIL'))?1:0)})();
