// =====================================================================
// SEASON PASS: 30 levels, a free track and a gold track, a new season every 28 days
// =====================================================================
const SEASON_EPOCH=Date.UTC(2026,9,1),SEASON_MS=28*864e5,SEASON_N=['Lucciole','Brina','Braci','Radici'];
const seasonIdx=()=>Math.max(0,Math.floor((Date.now()-SEASON_EPOCH)/SEASON_MS));
const seasonEnd=()=>SEASON_EPOCH+(seasonIdx()+1)*SEASON_MS;
const PASS_T=30,PASS_XP=100,PASS_COST=500;
const SKINS={lucciola:{n:'Manto delle lucciole',body:'#3f6a2a',hood:'#d8b030',belt:'#6a4a1a'},stellato:{n:'Manto stellato',body:'#1e2a5a',hood:'#5a6ac8',belt:'#c8a0ff'}};
function passReward(i,prem){
  if(prem){if(i===10)return{k:'frame',v:'stagione'};if(i===15)return{k:'skin',v:'lucciola'};if(i===20)return{k:'title',v:'Campione di stagione'};if(i===30)return{k:'skin',v:'stellato'};
    return i%5===0?{k:'chest',v:'oro'}:i%3===0?{k:'gems',v:10+Math.floor(i/2)}:i%2===0?{k:'gold',v:200+i*20}:{k:'chest',v:'argento'}}
  return i%5===0?{k:'chest',v:i>=15?'oro':'argento'}:i%3===0?{k:'gems',v:3+Math.floor(i/5)}:i%2===0?{k:'gold',v:80+i*10}:{k:'chest',v:'legno'}}
function ensurePass(){const s=seasonIdx();if(!SAVE.pass||SAVE.pass.s!==s)SAVE.pass={s,xp:0,f:{},p:{},gold:false};return SAVE.pass}
const passLvl=()=>Math.min(PASS_T,Math.floor(ensurePass().xp/PASS_XP));
function passXP(v){const P0=ensurePass(),l0=passLvl();P0.xp+=Math.max(0,Math.round(v));const l1=passLvl();save();if(l1>l0)achPop('Pass di stagione','Hai raggiunto il livello '+l1+'!','trophy');return l1-l0}
const passReady=()=>{const P0=ensurePass(),l=passLvl();let n=0;for(let i=1;i<=l;i++){if(!P0.f[i])n++;if(P0.gold&&!P0.p[i])n++}return n};
function passRewLabel(r){return r.k==='gold'?`${r.v} oro`:r.k==='gems'?`${r.v} cristalli`:r.k==='chest'?rwName(r.v,'classica'):r.k==='frame'?'Cornice '+FRAMES[r.v].n:r.k==='skin'?SKINS[r.v].n:'Titolo «'+r.v+'»'}
function passIcon(r){if(r.k==='gold')return coinPile(r.v>400?1:0);if(r.k==='gems')return '<span class="bigGem"></span>';if(r.k==='chest')return rwIcon(r.v,'classica');
  if(r.k==='frame'){const f=FRAMES[r.v];return `<span class="pfrm" style="--f1:${f.c[0]};--f2:${f.c[1]}"></span>`}
  if(r.k==='skin')return skinIcon(r.v).replace('class="cicon"','class="pkI"');
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="13" width="30" height="14" rx="3" fill="#ffd84a" stroke="#0b1326" stroke-width="2.4"/><path d="M11 20h18" stroke="#8a5a20" stroke-width="3" stroke-linecap="round"/></svg>`}
function grantPass(r){if(r.k==='gold'){SAVE.gold+=r.v;sfx('coin')}else if(r.k==='gems'){SAVE.gems=(SAVE.gems||0)+r.v;sfx('gem')}else if(r.k==='frame'){SAVE.xframes=SAVE.xframes||[];if(!SAVE.xframes.includes(r.v))SAVE.xframes.push(r.v);sfx('victory')}
  else if(r.k==='title'){SAVE.xtitles=SAVE.xtitles||[];if(!SAVE.xtitles.includes(r.v))SAVE.xtitles.push(r.v);sfx('victory')}else if(r.k==='skin'){SAVE.skins=SAVE.skins||{};SAVE.skins[r.v]=1;sfx('victory');SAVE.skinLv=SAVE.skinLv||{};SAVE.skinLv[r.v]=SAVE.skinLv[r.v]||1;achPop('Nuovo vestito!',SKINS[r.v].n+': indossalo dal Guardaroba','unlock')}
  toast('+'+passRewLabel(r));renderGold();save();if(r.k==='chest'){closeSheet();openChest(r.v)}}
function fillPass(){const P0=ensurePass(),l=passLvl(),into=P0.xp-l*PASS_XP,mx=l>=PASS_T;lastSheetHTML='';
  let rows='';for(let i=1;i<=PASS_T;i++){const fr=passReward(i,false),pr=passReward(i,true),reach=l>=i;
    const cell=(r,prem,got)=>`<div class="pcell ${prem?'gold':''} ${got?'got':reach&&(!prem||P0.gold)?'ready':''} ${prem&&!P0.gold?'lockd':''}"><div class="pic">${passIcon(r)}</div><small>${passRewLabel(r)}</small>${got?'<i class="pok">✓</i>':reach&&(!prem||P0.gold)?`<button class="btn go" data-pass="${i}" data-prem="${prem?1:0}">Riscatta</button>`:prem&&!P0.gold?`<i class="plk">${LOCK}</i>`:''}</div>`;
    rows+=`<div class="prow ${reach?'reach':''}"><span class="plv">${i}</span>${cell(fr,false,!!P0.f[i])}${cell(pr,true,!!P0.p[i])}</div>`}
  $('sheet').innerHTML=`<h2>Pass di stagione</h2><p class="lead">Stagione ${P0.s+1}: <b>${SEASON_N[P0.s%4]}</b> · finisce tra <b>${fmtH(seasonEnd()-Date.now())}</b></p>
    <div class="phead"><span class="plvBig">${l}</span><div class="pbar"><i style="width:${mx?100:into/PASS_XP*100}%"></i><span>${mx?'Livello massimo!':`${into}/${PASS_XP} punti`}</span></div></div>
    <p class="lead small">Guadagni punti finendo le partite (stanze, nemici, boss), con la sfida del giorno e con le missioni.</p>
    ${P0.gold?'<p class="pgold on">Pass d\'oro attivo</p>':`<button class="btn go pbuy" data-passbuy="1" ${(SAVE.gems||0)>=PASS_COST?'':'disabled'}>Sblocca il Pass d'oro · <i class="gemS"></i>${PASS_COST}</button>`}
    <div class="ptracks"><span></span><b>Gratis</b><b class="g">Pass d'oro</b></div><div class="prows">${rows}</div><button class="btn alt close">Chiudi</button>`;
  setTimeout(()=>{const r=$('sheet').querySelector('.prow.reach:last-of-type')||$('sheet').querySelectorAll('.prow.reach');const el=$('sheet').querySelectorAll('.prow.reach');if(el.length)el[el.length-1].scrollIntoView({block:'center'})},40)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pass]'),buy=e.target.closest('[data-passbuy]');const P0=ensurePass();
  if(buy&&!buy.disabled){if((SAVE.gems||0)<PASS_COST||P0.gold)return;SAVE.gems-=PASS_COST;P0.gold=true;save();renderGold();sfx('victory');vib([40,30,40,30,120]);toast("Pass d'oro sbloccato!");fillPass();renderSide();return}
  if(!b)return;const i=+b.dataset.pass,prem=b.dataset.prem==='1';if(passLvl()<i)return;if(prem){if(!P0.gold||P0.p[i])return;P0.p[i]=1}else{if(P0.f[i])return;P0.f[i]=1}
  grantPass(passReward(i,prem));if(SHEET==='pass')fillPass();renderSide()});

// =====================================================================
// DAILY CHALLENGE: the same twisted run for everybody today, with a leaderboard of rivals
// =====================================================================
const CHAL_MODS=[
  {id:'fire',n:'Frecce di fuoco',d:'Inizi con le frecce infuocate',good:1,f:()=>{P.fire=true}},
  {id:'skills3',n:'Partenza lanciata',d:'Inizi con 3 abilità a caso',good:1,f:()=>{for(let i=0;i<3;i++)randSkill()}},
  {id:'swift',n:'Passo leggero',d:'Lo scatto si ricarica il doppio più in fretta',good:1,f:()=>{P.dashMax*=.5}},
  {id:'pets',n:'Amici fedeli',d:'Il tuo compagno colpisce il doppio',good:1,f:()=>{G.petBoost=2}},
  {id:'glass',n:'Cuore di vetro',d:'Salute -40%, attacco +40%',f:()=>{P.maxhp=Math.round(P.maxhp*.6);P.hp=P.maxhp;P.atk*=1.4}},
  {id:'giant',n:'Nemici giganti',d:'Nemici più grossi e con il 40% di salute in più',f:()=>{G.curseHp=(G.curseHp||1)*1.4;G.giant=true}},
  {id:'meteor',n:'Pioggia di meteore',d:'Meteore cadono durante ogni stanza',f:()=>{G.meteorRain=true}},
  {id:'elite',n:"Caccia all'élite",d:'Molti più nemici élite',f:()=>{G.eliteBoost=2.5}}];
const RIVALS=['Fungo Errante','Lucciola Lesta','Rana Furba','Arco di Quercia','Piuma Rossa','Brina Silente','Zanna di Lupo','Radice Antica','Sasso Ridente','Volpe del Muschio','Stella Cadente','Gufo di Brace','Pino Innevato','Sorriso di Lava'];
function dayRng(salt){let h=2166136261;const s=today()+'|'+salt;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%1e6)/1e6}}
function chalToday(){const r=dayRng('chal'),good=CHAL_MODS.filter(m=>m.good),bad=CHAL_MODS.filter(m=>!m.good),ai=arenaIdx(SAVE.trBest||0),maxCh=Math.min(4,ai+1),ch=1+Math.floor(r()*maxCh);
  return{ch,mods:[good[Math.floor(r()*good.length)].id,bad[Math.floor(r()*bad.length)].id]}}
function ensureChal(){if(!SAVE.chal||SAVE.chal.day!==today())SAVE.chal={day:today(),best:0,done:false,tries:0};return SAVE.chal}
function chalBoard(){const r=dayRng('board'),names=shuffle(RIVALS.slice()),C=ensureChal(),L=[];for(let i=0;i<9;i++){L.push({n:names[i],s:Math.round((2200+r()*11000)/10)*10})}
  if(C.best>0)L.push({n:SAVE.pname||'Tu',s:C.best,me:true});L.sort((a,b)=>b.s-a.s);return L}
const chalScore=win=>G.room*1000+G.kills*10+(win?5000:0)+Math.round(100*Math.max(0,P.hp)/Math.max(1,P.maxhp))*10;


