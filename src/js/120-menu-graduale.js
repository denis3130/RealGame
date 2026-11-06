// =====================================================================
// 120. IL MENU CHE SI APRE PIANO (Denis, 6 novembre, alla domanda «cosa miglioreresti nel gioco?»: «Menu che si apre piano»). Per chi
// comincia i bottoni del menu si aprono uno alla volta salendo di livello (il Livello esploratore, «Liv. N» in alto), come in Clash Royale:
// all'inizio ci sono Gioca, le isole, le casse sotto l'eroe e l'Armeria; dopo la prima partita le Missioni; poi a ogni livello qualcosa di
// nuovo (APRE). Quello che non è ancora aperto non si vede (le colonne ai lati, la fila sopra Gioca, la manina della Zombie) oppure resta
// col lucchetto e il livello (le linguette in basso, Sfida e Abisso accanto a Gioca): un tocco dice quando si apre. Quando si apre qualcosa,
// tornando al menu una finestra «Si è aperto!» lo presenta, e il bottone brilla con la scritta «Nuovo» finché non lo tocchi.
// Vale solo per chi crea l'eroe da adesso (SAVE.apre, messo al primo avvio, quando serve la creazione): i salvataggi di prima hanno tutto
// aperto come sempre. Rispetta LOWFX e «riduci movimento». Prova: tests/a50/menu.js.
// =====================================================================
const APRE=[
  {id:'missioni',runs:1,n:'Le Missioni',d:'Ogni giorno tre compiti, ognuno col suo premio.',sel:['#misBtn']},
  {id:'eroi',lv:2,n:'Eroi e talenti',d:'Rendi più forte il tuo eroe coi talenti e conosci gli altri eroi.',sel:['#tabs [data-tab="tabHero"]'],lock:1},
  {id:'accesso',lv:2,n:"L'accesso di ogni giorno",d:'Torna ogni giorno: sette premi, uno dopo l\'altro.',sel:['#loginBtn']},
  {id:'zombie',lv:3,n:'La modalità Zombie',d:'Il Camposanto dei Corvi: resisti alle ondate. Tocca la manina o scorri il menu.',sel:['#zHand','#modeTabs']},
  {id:'compagni',lv:4,n:'I compagni',d:'Piccoli amici che combattono con te.',sel:['#tabs [data-tab="tabPets"]'],lock:1},
  {id:'ruota',lv:4,n:'La Ruota della fortuna',d:'Un giro gratis ogni giorno.',sel:['#wheelBtn']},
  {id:'bottega',lv:5,n:'La Bottega',d:'Le offerte, il negozio del giorno, le casse e l\'oro.',sel:['#tabs [data-tab="tabShop"]'],hide:['#offerBtn','#zShopBtn'],lock:1},
  {id:'pass',lv:5,n:'Il Pass di stagione',d:'Un premio a ogni livello del pass.',sel:['#passBtn','#zPassBtn']},
  {id:'albero',lv:6,n:"L'Albero delle abilità",d:'Rendi più forti le abilità che trovi in partita.',sel:['#cnTrBtn']},
  {id:'cammino',lv:6,n:'Il Cammino e i Traguardi',d:'Premi per le coppe, per i ponti e per le tue imprese.',sel:['#roadSide','#achBtn']},
  {id:'sfida',lv:7,n:'La Sfida del giorno',d:'Ogni giorno una regola diversa e tre medaglie.',sel:['#chalBtn'],lock:1},
  {id:'abisso',lv:7,n:"L'Abisso",d:'Scendi più in fondo che puoi.',sel:['#abyssBtn'],lock:1},
  {id:'torre',lv:8,n:'Torre, Corsa e Reliquie',d:'Le prove in più della Classica.',sel:['#cnModeRow']},
  {id:'evento',lv:8,n:"L'Evento della settimana",d:'Ogni settimana un evento con i suoi premi.',sel:['#evtBtn']}];
const AP={err:0,busy:false,iv:0};
const apErr=e=>{if(AP.err++<3)console.error(e)};
const apOn=()=>!!(SAVE&&SAVE.apre&&SAVE.apre.on);
function apS(){const A=SAVE.apre;A.seen=A.seen||{};A.nuovo=A.nuovo||{};return A}
function apLv(){try{return acct().lvl||1}catch(e){return(SAVE.acct&&SAVE.acct.lvl)||1}}
function apOpen(a){if(!apOn())return true;if(a.runs&&(SAVE.runs||0)<a.runs)return false;if(a.lv&&apLv()<a.lv)return false;return true}
function apIsOpen(id){const a=APRE.find(q=>q.id===id);return!a||apOpen(a)}
const apWhen=a=>a.lv?'Si apre al livello '+a.lv:'Si apre dopo la prima partita';
const AP_LOCK='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5.2a3.5 3.5 0 0 1 7 0V7" fill="none" stroke="#191714" stroke-width="2.6"/><path d="M4.5 7V5.2a3.5 3.5 0 0 1 7 0V7" fill="none" stroke="#c9b48a" stroke-width="1.3"/><rect x="2.6" y="6.6" width="10.8" height="8" rx="1.8" fill="#c9b48a" stroke="#191714" stroke-width="1.4"/><circle cx="8" cy="10.4" r="1.3" fill="#191714"/></svg>';
// nella Classica Missioni, Accesso, Ruota e Traguardi stanno nel bottone «Premi» (94): «Premi» c'è appena uno dei quattro è aperto e dice
// «Nuovo» finché uno dei quattro lo è; nel suo pannello le righe di quelli chiusi non ci sono
const AP_PREMI={misBtn:'missioni',loginBtn:'accesso',wheelBtn:'ruota',achBtn:'cammino'};
function apPremi(){const on=apOn(),ids=Object.values(AP_PREMI),nu=id=>on&&apIsOpen(id)&&!!apS().nuovo[id];
  const b=$('cnPremiBtn');if(b){b.classList.toggle('apChiuso',on&&!ids.some(apIsOpen));b.classList.toggle('apNuovo',ids.some(nu))}
  for(const r of document.querySelectorAll('#cnPremi .cnPrR[data-id]')){const f=AP_PREMI[r.dataset.id];if(!f)continue;r.classList.toggle('apChiuso',on&&!apIsOpen(f));r.classList.toggle('apNuovo',nu(f))}}
if(typeof cnPremiReady==='function'){const _r=cnPremiReady;cnPremiReady=function(id){if(AP_PREMI[id]&&!apIsOpen(AP_PREMI[id]))return false;return _r.apply(this,arguments)}}
if(typeof cnPremiFill==='function'){const _f=cnPremiFill;cnPremiFill=function(){const r=_f.apply(this,arguments);try{apPremi()}catch(e){apErr(e)}return r}}
// i bottoni chiusi: nascosti (classe, così il resto del menu può continuare a cambiare hidden), o col lucchetto e il livello (lock: quelli
// di sel; quelli di hide, i bottoni ai lati della stessa cosa, restano nascosti)
function apApply(){const on=apOn();for(const a of APRE){const op=!on||apOpen(a),nu=on&&op&&!!apS().nuovo[a.id];
  for(const s of a.sel)for(const el of document.querySelectorAll(s)){
    if(a.lock){el.classList.toggle('apLock',!op);let t=el.querySelector('.apLv');if(!op&&!t){t=document.createElement('span');t.className='apLv';el.appendChild(t)}
      if(t){if(op)t.remove();else{const txt=a.lv?'Liv. '+a.lv:'Presto';if(t._t!==txt){t._t=txt;t.innerHTML=AP_LOCK+'<b>'+txt+'</b>'}}}}
    else el.classList.toggle('apChiuso',!op);
    el.classList.toggle('apNuovo',nu)}
    for(const s of a.hide||[])for(const el of document.querySelectorAll(s)){el.classList.toggle('apChiuso',!op);el.classList.toggle('apNuovo',nu)}}
  apPremi()}
// si può mostrare la finestra adesso? (il menu davanti, nessun foglio, cassa, isola nuova, spettacolo del ponte, creazione o filmato)
function apCanShow(){const h=id=>{const e=$(id);return!e||e.hidden};
  return!$('menu').hidden&&h('sheetScr')&&h('chestScr')&&h('arenaUpScr')&&h('endScr')&&!(typeof INTRO!=='undefined'&&INTRO.on)&&!(typeof SCE!=='undefined'&&SCE.on)&&
    !(typeof ISL!=='undefined'&&ISL.brA)&&!(typeof modal!=='undefined'&&modal)&&!document.getElementById('apPop')}
// quello che si è appena aperto e non è ancora stato presentato: uno alla volta
function apCheck(){try{if(!apOn()||AP.busy)return;const A=apS(),a=APRE.find(q=>apOpen(q)&&!A.seen[q.id]);if(!a)return;if(!apCanShow())return;
  A.seen[a.id]=1;A.nuovo[a.id]=1;save();apApply();apPop(a)}catch(e){apErr(e)}}
// «Si è aperto!»: il disegno del bottone in grande, il nome, una riga, «Vedi»
function apPop(a){AP.busy=true;const src=a.sel.map(s=>document.querySelector(s)).find(Boolean),svg=src&&src.querySelector('svg');
  const el=document.createElement('div');el.id='apPop';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  el.innerHTML=`<div class="apBox"><div class="apRays"></div><div class="apIco"></div><small>Si è aperto!</small><h3></h3><p></p><button class="btn">Vedi</button></div>`;
  el.querySelector('h3').textContent=a.n;el.querySelector('p').textContent=a.d;if(svg){const c=svg.cloneNode(true);c.removeAttribute('width');c.removeAttribute('height');el.querySelector('.apIco').appendChild(c)}
  else el.querySelector('.apIco').innerHTML=AP_LOCK;
  ($('wrap')||document.body).appendChild(el);apSnd();
  const done=()=>{if(!el.parentNode)return;el.classList.add('out');setTimeout(()=>{el.remove();AP.busy=false;apApply();apCheck()},LOWFX?60:260)};
  el.querySelector('button').onclick=e=>{e.stopPropagation();try{sfx('ui')}catch(_){}done()};el.onclick=e=>{if(e.target===el)done()}}
function apSnd(){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.02;AU.pan=0;
  vBell(null,t,72,1.6,.12);vBell(null,t+.12,76,1.6,.1);vBell(null,t+.24,79,2,.1);whoosh(t,.6,700,2600,.12,.3)}catch(e){}}
// i tocchi: un bottone col lucchetto dice quando si apre (e non fa altro); uno «Nuovo» smette di esserlo
document.addEventListener('click',e=>{if(!apOn())return;const t=e.target;if(!t||!t.closest)return;
  const lk=t.closest('.apLock');if(lk){e.stopPropagation();e.preventDefault();const a=APRE.find(q=>q.sel.some(s=>lk.matches(s)));try{sfx('ui')}catch(_){}
    if(a)toast(apWhen(a));lk.classList.remove('apShake');void lk.offsetWidth;lk.classList.add('apShake');return}
  const nu=t.closest('.apNuovo');if(nu&&nu.id!=='cnPremiBtn'){const f=AP_PREMI[nu.dataset&&nu.dataset.id],a=f?APRE.find(q=>q.id===f):APRE.find(q=>q.sel.concat(q.hide||[]).some(s=>nu.matches(s)));
    if(a&&apS().nuovo[a.id]){delete apS().nuovo[a.id];save()}nu.classList.remove('apNuovo');apApply()}},true);
// quello che si apre da solo e non deve farlo finché è chiuso (l'accesso di ogni giorno dopo la prima partita)
{const _o=openSheet;openSheet=function(kind){if(kind==='login'&&!apIsOpen('accesso'))return;return _o.apply(this,arguments)}}
// la creazione dell'eroe del primo avvio: da qui si parte col menu che si apre piano
try{if(SAVE&&!SAVE.apre&&typeof sceNeeded==='function'&&sceNeeded()){SAVE.apre={on:1,seen:{},nuovo:{}};save()}}catch(e){apErr(e)}
{const _b=renderBadges;renderBadges=function(){const r=_b.apply(this,arguments);try{apApply()}catch(e){apErr(e)}return r}}
{const _p=renderPlay;renderPlay=function(){const r=_p.apply(this,arguments);try{apApply()}catch(e){apErr(e)}return r}}
AP.iv=setInterval(apCheck,700);
// (solo nelle pagine d'anteprima) il bottoncino per salire di livello e vedere gli sblocchi uno dopo l'altro
if(window.MB_ANTEPRIMA){const b=document.createElement('button');b.id='apUp';b.type='button';b.textContent='Anteprima: sali di livello ▲';
  b.onclick=e=>{e.stopPropagation();try{const A=acct();acctXP(Math.max(1,acctNeed(A.lvl)-(A.xp||0)));if((SAVE.runs||0)<1)SAVE.runs=1;save();renderTop();renderBadges();renderPlay()}catch(err){apErr(err)}};
  (document.getElementById('menu')||document.body).appendChild(b)}
{const st=document.createElement('style');st.textContent=`
.apChiuso{display:none!important}
.apLock{position:relative;color:#6f6252!important}
.apLock>*:not(.apLv){opacity:.42;filter:grayscale(1)}
.apLock [id$="Badge"],.apLock .pip,.apLock .bang{display:none!important}
.apLv{position:absolute;left:50%;top:50%;transform:translate(-50%,-62%);display:flex;flex-direction:column;align-items:center;gap:1px;pointer-events:none;filter:none;z-index:2}
.apLv svg{width:20px;height:20px;filter:drop-shadow(0 2px 0 rgba(0,0,0,.6))}
.apLv b{font:400 11.5px var(--display,"Lilita One"),system-ui;color:#efe2c4;text-shadow:0 2px 0 #000,0 0 3px #000;white-space:nowrap}
.modeBtn.apLock{filter:grayscale(.85) brightness(.8)}
.modeBtn.apLock small{visibility:hidden}
.apShake{animation:apSh .36s}
@keyframes apSh{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.apNuovo{position:relative}
.apNuovo::after{content:"Nuovo";position:absolute;top:-6px;right:-4px;padding:1px 6px 2px;border:2px solid #191714;border-radius:9px;background:linear-gradient(#ffe27a,#e0a52c);
  color:#2a1a08;font:400 11px var(--display,"Lilita One"),system-ui;letter-spacing:.02em;box-shadow:0 2px 0 #000;z-index:3;animation:apNu 1.1s ease-in-out infinite alternate}
@keyframes apNu{to{transform:scale(1.12)}}
#menu .sideBtns .apNuovo::after{top:auto;bottom:3px;right:-11px}
#menu .sideBtns.r .apNuovo::after{right:auto;left:-11px}
#cnPremi .apNuovo::after{top:-7px;right:6px}
#menu #tabs .apNuovo::after{z-index:6;top:-9px;right:2px}
#apPop{position:absolute;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,rgba(20,14,8,.55),rgba(6,4,2,.86));animation:apIn .3s ease-out}
#apPop.out{opacity:0;transition:opacity .25s}
@keyframes apIn{from{opacity:0}}
#apPop .apBox{position:relative;width:min(300px,82vw);padding:22px 18px 18px;border:3px solid #191714;border-radius:18px;text-align:center;
  background:linear-gradient(#4a3c2c,#2c231b);box-shadow:0 6px 0 #000,inset 0 2px 0 rgba(255,236,190,.25);color:#efe2c4;animation:apBx .45s cubic-bezier(.2,1.5,.4,1)}
@keyframes apBx{from{transform:scale(.6) translateY(30px)}}
#apPop .apRays{position:absolute;left:50%;top:58px;width:240px;height:240px;margin:-120px 0 0 -120px;border-radius:50%;pointer-events:none;
  background:repeating-conic-gradient(rgba(255,214,110,.22) 0 10deg,transparent 10deg 24deg);mask:radial-gradient(circle,#000 30%,transparent 70%);-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);animation:apRy 9s linear infinite}
@keyframes apRy{to{transform:rotate(360deg)}}
#apPop .apIco{position:relative;width:76px;height:76px;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;color:var(--gold,#ffd65a);
  filter:drop-shadow(0 0 12px rgba(255,214,110,.7)) drop-shadow(0 3px 0 #000);animation:apIc 1.6s ease-in-out infinite alternate}
#apPop .apIco svg{width:68px;height:68px}
@keyframes apIc{to{transform:translateY(-4px) scale(1.05)}}
#apPop small{position:relative;display:block;font:400 14px var(--display,"Lilita One"),system-ui;letter-spacing:.06em;color:#ffd65a;text-transform:uppercase;text-shadow:0 2px 0 #000}
#apPop h3{position:relative;margin:2px 0 6px;font:400 25px var(--display,"Lilita One"),system-ui;line-height:1.1;text-wrap:balance;text-shadow:0 2px 0 #000}
#apPop p{position:relative;margin:0 4px 14px;font-size:14.5px;line-height:1.35;color:#e3d4b4;text-wrap:balance}
#apPop .btn{position:relative;min-width:120px}
#apUp{position:absolute;left:50%;transform:translateX(-50%);top:calc(128px + env(safe-area-inset-top,0px));z-index:40;padding:4px 10px;border:2px solid #191714;border-radius:10px;
  background:#3a6b3a;color:#efe;font:400 12px var(--display,"Lilita One"),system-ui;box-shadow:0 2px 0 #000;opacity:.92}
@media (prefers-reduced-motion:reduce){.apNuovo::after,#apPop .apRays,#apPop .apIco,#apPop .apBox,#apPop{animation:none}}
body.lowfx #apPop .apRays{display:none}`;document.head.appendChild(st)}
