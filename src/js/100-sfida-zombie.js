// =====================================================================
// 100. LA SFIDA DELLA NOTTE (la modalità sfida dentro la Zombie: Denis, 12 ottobre: «la modalità sfida dentro la modalità zombie»; 31
// ottobre: «Modalità sfida»). Ogni giorno una regola diversa (sette, a giro), la stessa mappa e le stesse ondate; tre medaglie per il round
// raggiunto (bronzo al 5, argento al 10, oro al 15), ognuna col suo premio una volta al giorno. Dal bottone «Sfida» quando sei nella
// Zombie (nella Classica resta la sfida del giorno di sempre); «Rigioca» rifà la sfida, «Menu» la chiude. Oro, record e partite come in
// una partita normale; in più la medaglia sulla schermata di fine.
// Si attacca come le abilità (99): avvolge ZM.partita (reset, update) e ZM.modsHook; zFine e zExit di 63.
// =====================================================================
const ZCH_R=[
  {id:'pistola',n:'Solo pistola',d:'Le armi a muro e la Bara delle Sorprese restano chiuse: hai solo la pistola. Gli zombie hanno un quarto di vita in meno.',zhp:.75,noGuns:1},
  {id:'orda',n:'Orda famelica',d:'Gli zombie corrono il 35% in più, ma ogni zombie ucciso vale il doppio delle monete.',zspd:1.35,cash:2},
  {id:'freddo',n:'Sangue freddo',d:'La vita non torna da sola: la Benda e la Lanterna delle Anime sono tutto quello che hai.',noRegen:1},
  {id:'becchini',n:'Notte dei becchini',d:'Un boss ogni tre round invece che ogni cinque.',boss3:1},
  {id:'pietra',n:'Mani di pietra',d:'Ricarichi più piano, ma ogni colpo fa il 50% di danno in più.',dmg:1.5,relK:.6},
  {id:'ricchi',n:'Ricchi e dannati',d:'Parti con 4.000 monete in più, ma gli zombie hanno il 30% di vita in più.',coins:4000,zhp:1.3},
  {id:'fragile',n:'Cuore fragile',d:'Hai 60 di vita invece di 100, ma un colpo su tre è critico.',vita:60,crit:.33}];
const ZCH_M=[{r:5,n:'Bronzo',dn:'di bronzo',c:'#d0864a',p:{oro:400,rot:10},t:'400 oro e 10 Rottami'},{r:10,n:'Argento',dn:"d'argento",c:'#d4d9e2',p:{bus:'r'},t:'Bustina Zombie Rara'},{r:15,n:'Oro',dn:"d'oro",c:'#ffd84a',p:{gems:25,rot:30},t:'25 cristalli e 30 Rottami'}];
// the day (local): the rule turns at midnight
const zchDay=()=>{const t=new Date();return Math.floor((t.getTime()-t.getTimezoneOffset()*6e4)/864e5)},zchRule=d=>ZCH_R[((d==null?zchDay():d)%7+7)%7];
function zchSave(){const d=zchDay();if(!SAVE.zchal||SAVE.zchal.d!==d)SAVE.zchal={d,best:0,got:[0,0,0],n:0};const C=SAVE.zchal;if(!Array.isArray(C.got))C.got=[0,0,0];return C}
const zchOpen=()=>(SAVE.zN||0)>=1;
const ZCH={on:false,rule:null,lastR:0,end:false,pz:null,hud:null};
// ------------------------------------------------------------------ the rules in the match
const ZCH_BOSS={becchino:'Il Becchino',spaventapasseri:'Lo Spaventapasseri'};
function zchStartMatch(D){const W=ZM.W,R0=ZCH.rule;ZCH.lastR=0;ZCH.end=false;if(!ZCH.pz)ZCH.pz={vita:D.PZ.vita,rigenera:D.PZ.rigenera};
  D.PZ.vita=R0.vita||ZCH.pz.vita;D.PZ.rigenera=R0.noRegen?0:ZCH.pz.rigenera;D.hp=D.PZ.vita;if(R0.coins)W.coins=(W.coins||0)+R0.coins;
  // the guns on the walls and the coffin closed (their prompts never show)
  for(const b of ZM.buys||[])if(!b.__zch&&(b.id==='bara'||String(b.id).startsWith('muro_'))){b.__zch=1;const s0=b.show;b.show=function(){return!(ZCH.on&&ZCH.rule&&ZCH.rule.noGuns)&&(s0?s0.apply(this,arguments):true)}}
  if(R0.noGuns&&W.gunId!=='pistola')try{ZM.equip('pistola')}catch(e){}
  try{if(ZM.fortuna&&ZM.fortuna.applyMods)ZM.fortuna.applyMods()}catch(e){}
  W.toast=['Sfida della notte: '+R0.n,3];zchHud(true)}
function zchUpdate(D){const W=ZM.W,R0=ZCH.rule;if(!ZCH.on||!R0)return;
  // the zombies of the rule: life and speed changed once, as they come out
  for(const z of W.Z){if(z.__zch||z.die)continue;z.__zch=1;if(R0.zhp){z.hp*=R0.zhp;if(z.hp0)z.hp0*=R0.zhp}if(R0.zspd&&!z.boss&&!z.ai){z.spd*=R0.zspd;if(z.spd0)z.spd0*=R0.zspd}}
  // a boss every three rounds (and none on the fifth and tenth)
  if(R0.boss3&&D.st==='round'&&D.R!==ZCH.lastR){ZCH.lastR=D.R;const R=D.R,want=R%3===0?((R/3)%2===1?'becchino':'spaventapasseri'):null;
    if(want&&!D.bossK){D.bossK=want;D.bossT=2.6;D.left=Math.round(D.quota(R)*.25);W.toast=[ZCH_BOSS[want]+' sta arrivando…',2.6]}
    else if(!want&&D.bossK&&D.bossT>0){D.bossK=null;D.bossT=0;D.left=D.quota(R);if(D.ui&&D.ui.b2)D.ui.b2.textContent=''}}
  if(D.st==='fine'&&!ZCH.end){ZCH.end=true;zchEnd(D)}}
// the end: the medals reached today, their prizes once, a line on the end screen
function zchEnd(D){const C=zchSave(),R=D.R||0,got=[];C.n++;C.best=Math.max(C.best,R);
  ZCH_M.forEach((m,i)=>{if(R>=m.r&&!C.got[i]){C.got[i]=1;got.push(i);const p=m.p;if(p.oro)SAVE.gold+=p.oro;if(p.rot)SAVE.mat.rot=(SAVE.mat.rot||0)+p.rot;if(p.gems)SAVE.gems=(SAVE.gems||0)+p.gems;
    if(p.bus)addPack('zombie',p.bus)}});
  try{mprog('chal',null,1)}catch(e){}save();
  const U=D.ui;if(!U||!U.fine)return;const top=ZCH_M.reduce((a,m,i)=>R>=m.r?i:a,-1),el=document.createElement('div');el.className='zchEnd';
  el.innerHTML=`<style>#mzPartita .zchEnd{margin:6px 0 2px;text-align:center}#mzPartita .zchEnd .t{font:400 15px "Lilita One",system-ui;letter-spacing:.03em;color:#e9d9a8;text-shadow:0 2px 0 #000}
    #mzPartita .zchEnd .m{display:inline-flex;align-items:center;gap:7px;margin-top:4px;font:700 15px "Baloo 2",system-ui;text-shadow:0 2px 0 #000}#mzPartita .zchEnd .m i{width:22px;height:22px;border-radius:50%;border:2.5px solid #000;background:var(--mc);box-shadow:inset 0 -3px 0 rgba(0,0,0,.25),0 2px 0 #000}
    #mzPartita .zchEnd .g{display:block;font:700 13px "Baloo 2",system-ui;color:#9fe06a;margin-top:2px}</style>
    <div class="t">Sfida della notte · ${ZCH.rule.n}</div>${top>=0?`<div class="m" style="--mc:${ZCH_M[top].c}"><i></i>Medaglia ${ZCH_M[top].dn}!</div>`:`<div class="m">Nessuna medaglia: il bronzo è al round 5</div>`}
    ${got.map(i=>`<span class="g">+ ${ZCH_M[i].t}</span>`).join('')}`;
  const h2=U.fine.querySelector('h2');if(h2)h2.after(el);else U.fine.prepend(el)}
function zchOff(){const D=ZM.W&&ZM.W.director;if(D&&ZCH.pz){D.PZ.vita=ZCH.pz.vita;D.PZ.rigenera=ZCH.pz.rigenera}ZCH.on=false;ZCH.rule=null;zchHud(false);try{if(ZM.fortuna&&ZM.fortuna.applyMods)ZM.fortuna.applyMods()}catch(e){}}
// the modifiers of the rule go through the hook of the luck cards (W.mods is rebuilt every frame)
if(typeof ZM!=='undefined'){const _h=ZM.modsHook;ZM.modsHook=function(m){if(_h)_h.apply(this,arguments);const R0=ZCH.on&&ZCH.rule;if(!R0||!m)return;
  if(R0.cash)m.cash=(m.cash||1)*R0.cash;if(R0.dmg)m.dmg=(m.dmg||1)*R0.dmg;if(R0.relK)m.relK=(m.relK||1)*R0.relK;if(R0.crit)m.crit=Math.max(m.crit||0,R0.crit)}}
// the little label of the challenge under the top bar
function zchHud(on){const ov=document.getElementById('mz');if(!ov)return;let el=document.getElementById('mzSfida');
  if(!el){el=document.createElement('div');el.id='mzSfida';el.style.cssText='position:absolute;left:50%;top:calc(46px + env(safe-area-inset-top,0px));transform:translateX(-50%);padding:3px 11px;border-radius:11px;background:rgba(40,12,14,.82);border:2px solid #000;box-shadow:0 2px 0 #000;font:400 13px "Lilita One",system-ui;letter-spacing:.03em;color:#ffcf9a;text-shadow:0 1px 0 #000;white-space:nowrap;pointer-events:none;z-index:2';ov.appendChild(el)}
  el.hidden=!on;if(on)el.textContent='Sfida · '+ZCH.rule.n}
if(typeof ZM!=='undefined'&&ZM.partita){const install=D=>{if(!D||D.__zch)return;D.__zch=1;const _r=D.reset;D.reset=function(){_r.apply(this,arguments);if(ZCH.on&&ZCH.rule)zchStartMatch(D);else zchHud(false)};
    const _u=D.update;D.update=function(){_u.apply(this,arguments);try{zchUpdate(D)}catch(e){console.error(e)}}};
  const _p=ZM.partita;ZM.partita=function(){const D=_p.apply(this,arguments);install(D);return D};if(ZM.W.director)install(ZM.W.director)}
// leaving the match closes the challenge (the next match from Gioca is a normal one)
if(typeof zExit==='function'){const _e=zExit;zExit=function(){const r=_e.apply(this,arguments);zchOff();return r}}
// ------------------------------------------------------------------ the menu: the button «Sfida» in the Zombie, the sheet
const ZCH_SVG='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="#2a1a2e" stroke="#191714" stroke-width="2.4"/><path d="M24 7a13 13 0 1 0 9 22 11 11 0 0 1-9-22z" fill="#f2e6c8" stroke="#191714" stroke-width="2"/><circle cx="15" cy="19" r="2.6" fill="#e0473a"/><circle cx="15" cy="19" r="1" fill="#ffd0c0"/></svg>';
if(typeof renderModesRow==='function'&&typeof $==='function'&&$('chalBtn')){
  {const _r=renderModesRow;renderModesRow=function(){_r.apply(this,arguments);if(!zMode())return;const C=zchSave(),o=zchOpen(),n=C.got.filter(Boolean).length;
    const h=`${ZCH_SVG}<b>Sfida</b><small>${!o?'Dopo 1 partita':n?n+'/3 medaglie':'Nuova!'}</small>${o&&!C.n?'<i class="bang">!</i>':''}`,c=$('chalBtn');if(c._h!==h){c.innerHTML=h;c._h=h}c.classList.toggle('lock',!o)}}
  $('chalBtn').onclick=()=>openSheet(zMode()?'zchal':'chal');
  function fillZChal(){const C=zchSave(),R0=zchRule(),nx=zchRule(zchDay()+1),t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1),o=zchOpen();lastSheetHTML='';
    $('sheet').innerHTML=`<h2>Sfida della notte</h2><p class="lead">Una regola diversa ogni notte, sulla mappa di sempre. Cambia tra <b>${fmtH(mid-t)}</b>.</p>
      <div class="cmods"><div class="cmod bad"><b>${R0.n}</b><span>${R0.d}</span></div></div>
      <div class="tiers">${ZCH_M.map((m,i)=>`<div class="tier ${C.got[i]?'got':''}" style="--tc:${m.c}"><i></i><b>${m.n}</b><small>Round ${m.r}<br>${C.got[i]?'Preso!':m.t}</small></div>`).join('')}</div>
      <p class="lead small">${C.n?`Stanotte il tuo meglio è il <b>round ${C.best}</b>.`:'Ogni medaglia dà il suo premio una volta per notte.'} Domani: <b>${nx.n}</b>.</p>
      ${o?`<button class="btn go bigPlay" data-zchplay="1">${C.n?'Riprova la sfida':'Gioca la sfida'}</button>`:'<p class="lead" style="text-align:center">Si apre dopo la prima partita nel camposanto.</p>'}<button class="btn alt close">Chiudi</button>`}
  {const _os=openSheet;openSheet=function(kind){if(kind==='zchal'){SHEET=kind;sfx('ui');fillZChal();$('sheetScr').hidden=false;return}return _os.apply(this,arguments)}}
  $('sheet').addEventListener('click',e=>{const b=e.target.closest('button[data-zchplay]');if(!b||!zchOpen())return;ZCH.on=true;ZCH.rule=zchRule();closeSheet();zGo()})}
