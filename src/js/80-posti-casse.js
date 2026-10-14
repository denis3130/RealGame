// =====================================================================
// I 5 POSTI SOTTO L'EROE (difetti dell'anteprima 48; Denis: «fai in modo che i 5 pacchetti li vedi da sotto il player, non dentro un menu
// apposito», «al posto degli oggetti»). Nella Classica le quattro casse vinte e la quinta, nella Zombie le quattro Lucky Cards vinte e la
// quinta: gli oggetti indossati si cambiano dall'Armeria, l'arma zombie e la Lucky Card in tasca dall'Arsenale. Toccando un posto si apre un
// riquadro piccolo sopra di lui, come in Clash Royale: Sblocca, Apri subito con l'oro, Apri!; una cassa pronta si apre subito al primo tocco.
// Insieme («migliora tutto, rendi visibilmente più bello e riconoscibile», «testi tagliati»): i nomi sotto tutti i bottoni della Zombie (la
// lamiera storta era un ritaglio, clip-path, che tagliava via nomi e bollini), i nomi sotto tutte le linguette della barra in basso, «Liv. N»
// intero anche sui telefoni stretti.
// =====================================================================
const PSKIP=t=>Math.max(5,Math.ceil(t*1000/6000)*5);// aprire subito una cassa ancora chiusa costa come se si sbloccasse adesso
const POSTI={
  classica:{list:()=>SAVE.slots.concat([SAVE.slot5]),st:slotState,busy:i=>i<4&&anyUnlocking(),time:s=>CHESTS[s.type].time,
    skip:s=>s.state==='unlocking'?skipCost(s):PSKIP(CHESTS[s.type].time),img:(s,i)=>i===4?chestSVG5(s.type):chestSVG(s.type,false),
    name:s=>CHESTS[s.type].n,rar:s=>rwRar(s.type),what:(s,i)=>{const C=CHESTS[s.type];return `${Math.round(C.cards*(i===4?1.3:1))} carte e ${C.gold[0]}–${C.gold[1]} oro`},
    set:(i,v)=>{if(i===4)SAVE.slot5=v;else SAVE.slots[i]=v},open:(s,i)=>openChest(s.type,i===4?{slot:true,fifth:true}:{slot:true}),next5:()=>SAVE.next5||0,
    none:'Vinci le casse giocando, dalla stanza 3 in poi',none5:'Quando i quattro posti sono pieni, la prossima cassa vinta arriva qui: Epica o Leggendaria'},
  zombie:{list:()=>SAVE.lucky.slots.concat([SAVE.lucky.slot5]),st:lslotState,busy:i=>i<4&&lUnlocking(),time:s=>LTIME[s.rar],
    skip:s=>s.state==='unlocking'?lSkip(s):PSKIP(LTIME[s.rar]),img:(s,i)=>`<img class="pkI" src="${packImg('lucky',s.rar,i===4?128:96)}" alt="">`,
    name:()=>'Lucky Cards',rar:s=>s.rar,what:s=>`${LBUSTE[s.rar].cards} Lucky Cards da portare in partita`,
    set:(i,v)=>{if(i===4)SAVE.lucky.slot5=v;else SAVE.lucky.slots[i]=v},open:s=>openPack('lucky',s.rar),next5:()=>SAVE.lucky.next5||0,
    none:'Le vinci finendo le partite Zombie, dal round 3 in poi',none5:'Quando i quattro posti sono pieni, la prossima bustina vinta arriva qui: Epica o Leggendaria'}};
const postiOf=()=>POSTI[zMode()?'zombie':'classica'];
const tShort=ms=>fmtT(ms).replace(/^(\d+m) 00s$/,'$1');
function postoHTML(P,s,i){const five=i===4,cls='psl'+(five?' p5':'');
  if(!s){const w=five&&P.next5()>Date.now();return `<button class="${cls} empty" data-pe="${i}" aria-label="${five?'Quinta: vuota':'Posto vuoto'}">${five?'<i class="p5c"></i>':''}<span class="pimg"></span><b>${five?(w?fmtH(P.next5()-Date.now()).replace(/ \d+s$/,''):'Quinta'):'Vuoto'}</b></button>`}
  const st=P.st(s),r=P.rar(s);let lab,bar='';
  if(st==='ready')lab='<b>Apri!</b>';
  else if(st==='unlocking'){const T=P.time(s)*1000,left=s.end-Date.now();lab=`<b class="tm">${fmtT(left)}</b>`;bar=`<i class="pbar"><i style="width:${Math.max(4,Math.round((1-left/T)*100))}%"></i></i>`}
  else lab=P.busy(i)?'<b class="wt">In attesa</b>':'<b>Sblocca</b>';
  return `<button class="${cls} ${st}" data-ps="${i}" style="--rc:${PRC[r][0]};--rc2:${PRC[r][1]}" aria-label="${(five?'Quinta: ':'')+P.name(s)} ${PRN[r]}">${five?'<i class="p5c"></i>':''}<span class="pimg">${P.img(s,i)}</span>${lab}${bar}</button>`}
// la fila sotto l'eroe (prende il posto degli oggetti in tutte e due le modalità)
renderGearRow=function(){const P=postiOf(),html=P.list().map((s,i)=>postoHTML(P,s,i)).join(''),el=$('homeGear');el.classList.add('posti');el._z=false;if(el._h!==html){el.innerHTML=html;el._h=html}if(POP.i!=null)popFill()};
// ------------------------------------------------------------------ il riquadro sopra il posto
const POP={i:null,el:null};
function popOpen(i){POP.i=i;if(!POP.el){const d=document.createElement('div');d.id='postoPop';d.className='pPop';d.setAttribute('role','dialog');document.body.appendChild(d);POP.el=d;
    d.addEventListener('click',e=>{const b=e.target.closest('[data-pa]');if(b&&!b.disabled)popAct(b.dataset.pa)})}
  POP.el._h='';POP.el.classList.toggle('z',zMode());popFill();POP.el.hidden=false;POP.el.classList.remove('in');void POP.el.offsetWidth;POP.el.classList.add('in');sfx('ui')}
function popClose(){POP.i=null;if(POP.el)POP.el.hidden=true}
function popFill(){const P=postiOf(),i=POP.i,s=P.list()[i],tile=$('homeGear').querySelector(`[data-ps="${i}"]`);
  if(!s||!tile||$('menu').hidden||$('tabPlay').hidden||!$('sheetScr').hidden){popClose();return}
  const st=P.st(s),r=P.rar(s),c=P.skip(s),coin='<i class="coin"></i>';let body;
  if(st==='ready')body='<button class="btn go" data-pa="open">Apri!</button>';
  else if(st==='unlocking')body=`<p class="pt">Pronta tra <b>${fmtT(s.end-Date.now())}</b></p><button class="btn go" data-pa="skip">Apri subito · ${c} ${coin}</button>`;
  else body=(P.busy(i)?`<p class="pt">Si sblocca una alla volta: prima finisce quella che si sta aprendo</p>`:`<button class="btn go" data-pa="unlock">Sblocca · ${tShort(P.time(s)*1000)}</button>`)+`<button class="btn alt" data-pa="skip">Apri subito · ${c} ${coin}</button>`;
  const html=`<div class="ph"><b>${i===4?'Quinta · ':''}${P.name(s)}</b><span class="pr" style="--rc:${PRC[r][0]}">${PRN[r]}</span></div>
    <div class="pbody"><span class="pimg">${P.img(s,i)}</span><div><p class="pw">${P.what(s,i)}</p>${i===4?'<p class="pt">Si sblocca da sola, anche insieme alle altre</p>':''}</div></div><div class="pbtns">${body}</div>`;
  if(POP.el._h!==html){POP.el.innerHTML=html;POP.el._h=html}
  // sopra il posto e dentro lo schermo, con la punta verso il posto
  const R=tile.getBoundingClientRect(),W0=Math.min(272,innerWidth-20),x=Math.max(10,Math.min(innerWidth-10-W0,R.left+R.width/2-W0/2));
  POP.el.style.width=W0+'px';POP.el.style.left=x+'px';POP.el.style.bottom=Math.round(innerHeight-R.top+10)+'px';POP.el.style.setProperty('--ax',Math.round(R.left+R.width/2-x)+'px')}
function popAct(a){const P=postiOf(),i=POP.i,s=P.list()[i];if(!s||CHbusy)return;const st=P.st(s);
  if(a==='open'&&st==='ready'){popClose();P.set(i,null);save();renderPlay();P.open(s,i);return}
  if(a==='unlock'&&st==='locked'&&!P.busy(i)){s.state='unlocking';s.end=Date.now()+P.time(s)*1000;save();sfx('ui');vib(12);renderPlay();return}
  if(a==='skip'&&st!=='ready'){const c=P.skip(s);if(SAVE.gold<c){toast(`Ti servono ${c} oro`);return}SAVE.gold-=c;s.state='ready';s.confirm=false;save();renderGold();sfx('upgrade');vib(25);renderPlay()}}
$('homeGear').addEventListener('click',e=>{const b=e.target.closest('[data-ps],[data-pe]');if(!b)return;e.stopPropagation();if(CHbusy)return;const P=postiOf();
  if(b.dataset.pe!=null){sfx('ui');toast(+b.dataset.pe===4?P.none5:P.none);return}
  const i=+b.dataset.ps,s=P.list()[i];if(!s)return;if(P.st(s)==='ready'){POP.i=i;popAct('open');return}if(POP.i===i){popClose();return}popOpen(i)},true);
document.addEventListener('pointerdown',e=>{if(POP.i!=null&&!e.target.closest('#postoPop,[data-ps]'))popClose()},true);
{const _st=setTab;setTab=function(){popClose();return _st.apply(this,arguments)}}
{const _os=openSheet;openSheet=function(){popClose();return _os.apply(this,arguments)}}
// ------------------------------------------------------------------ l'aspetto
{const st=document.createElement('style');st.textContent=`
#menu .homeFoot{margin:0 10px}
#homeGear.posti{position:relative;z-index:3;display:flex;justify-content:center;align-items:flex-end;gap:6px;flex-wrap:nowrap}
.psl{position:relative;box-sizing:border-box;width:56px;height:66px;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:0;padding:0 2px 4px;
  border:2.5px solid var(--crInk);border-radius:12px;background:linear-gradient(#5d554a,#37312a);background:radial-gradient(80% 60% at 50% 30%,color-mix(in srgb,var(--rc,#8a8f96) 40%,transparent),transparent 72%),linear-gradient(#5d554a,#37312a);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.28),inset 0 -3px 0 rgba(0,0,0,.3),0 3px 0 var(--crInk);color:#fff;font-family:var(--display);cursor:pointer;-webkit-tap-highlight-color:transparent}
.psl:active{transform:translateY(2px)}
.psl .pimg{position:absolute;left:3px;right:3px;top:2px;height:42px;display:flex;align-items:center;justify-content:center;pointer-events:none}
.psl .pimg svg{width:46px;height:auto;max-width:none;filter:drop-shadow(0 2px 0 rgba(0,0,0,.45))}
.psl .pimg .pkI{height:40px;width:auto;max-width:none;filter:drop-shadow(0 2px 0 rgba(0,0,0,.45))}
.psl b{position:relative;z-index:1;font-weight:400;font-size:12px;line-height:1.05;white-space:nowrap;text-shadow:var(--tol-s);letter-spacing:.01em}
.psl b.tm{font-size:11px;font-variant-numeric:tabular-nums}.psl b.wt{font-size:9.5px;color:#d9d0b8}
.psl .pbar{position:absolute;left:6px;right:6px;bottom:-6px;height:6px;border:2px solid var(--crInk);border-radius:4px;background:#1e1b18;overflow:hidden;box-sizing:content-box}
.psl .pbar i{display:block;height:100%;background:linear-gradient(#ffe46e,#e09a10)}
.psl.ready{background:radial-gradient(80% 60% at 50% 30%,rgba(255,250,200,.65),transparent 70%),linear-gradient(#ffe46e,#f2a400);animation:pslReady 1.3s ease-in-out infinite}
.psl.ready b{font-size:13.5px}
.psl.ready .pimg{animation:pslHop 1.3s ease-in-out infinite}
.psl.empty{background:rgba(24,21,18,.5);border:2px dashed rgba(221,212,184,.5);box-shadow:none;cursor:pointer}.psl.empty b{font-size:10.5px;color:#cfc6b0}
.psl.p5{width:62px;height:72px;border-color:#1b1612;box-shadow:inset 0 0 0 2px #ffd84a,inset 0 2px 0 rgba(255,255,255,.3),0 3px 0 var(--crInk),0 0 14px rgba(255,216,74,.35)}
.psl.p5 .pimg{height:48px}.psl.p5 .pimg svg{width:60px}.psl.p5 .pimg .pkI{height:46px}
.psl.p5.empty{box-shadow:inset 0 0 0 2px rgba(255,216,74,.35);border-style:dashed;border-color:rgba(255,216,74,.55)}
.psl .p5c{position:absolute;top:-9px;left:50%;width:22px;height:13px;margin-left:-11px;z-index:2;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2022%2013%22%3E%3Cpath%20d%3D%22M2%2012l1-9%204%204%204-6%204%206%204-4%201%209z%22%20fill%3D%22%23ffd84a%22%20stroke%3D%22%231b1612%22%20stroke-width%3D%221.8%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E") no-repeat center/contain}
.psl.p5.empty .p5c{opacity:.6}
@keyframes pslReady{0%,100%{box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 3px 0 var(--crInk),0 0 0 rgba(255,216,74,0)}50%{box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 3px 0 var(--crInk),0 0 16px rgba(255,216,74,.85)}}
@keyframes pslHop{0%,70%,100%{transform:translateY(0)}80%{transform:translateY(-4px) rotate(-4deg)}90%{transform:translateY(0) rotate(3deg)}}
#menu.zmode .psl{background:linear-gradient(#3a3f37,#1d201b);background:radial-gradient(80% 60% at 50% 30%,color-mix(in srgb,var(--rc,#8a8f96) 35%,transparent),transparent 72%),linear-gradient(#3a3f37,#1d201b);border-color:#0a0c0b;box-shadow:inset 0 2px 0 rgba(200,230,180,.14),inset 0 -3px 0 rgba(0,0,0,.45),0 3px 0 #0a0c0b}
#menu.zmode .psl.ready{background:radial-gradient(80% 60% at 50% 30%,rgba(220,255,170,.55),transparent 70%),linear-gradient(#a8d862,#4f8a27);animation-name:pslReadyZ}
#menu.zmode .psl .pbar i{background:linear-gradient(#b5e46a,#4f8a27)}
#menu.zmode .psl.empty{background:rgba(10,12,10,.5);border-color:rgba(160,200,140,.4)}
#menu.zmode .psl.p5{box-shadow:inset 0 0 0 2px #9dff6a,inset 0 2px 0 rgba(255,255,255,.2),0 3px 0 #0a0c0b,0 0 14px rgba(140,255,110,.3)}
@keyframes pslReadyZ{0%,100%{box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 3px 0 #0a0c0b,0 0 0 rgba(150,255,110,0)}50%{box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 3px 0 #0a0c0b,0 0 16px rgba(150,255,110,.8)}}
@media (max-width:370px){#homeGear.posti{gap:4px}.psl{width:52px;height:62px}.psl.p5{width:58px;height:68px}.psl .pimg svg{width:42px}.psl.p5 .pimg svg{width:54px}}
@media (prefers-reduced-motion:reduce){.psl.ready,.psl.ready .pimg{animation:none}}
.pPop{position:fixed;z-index:60;box-sizing:border-box;padding:10px 12px 12px;border:3px solid var(--crInk,#1b1612);border-radius:16px;background:linear-gradient(#f3e7c6,#d9c597);color:#2a2018;
  box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 5px 0 var(--crInk,#1b1612),0 10px 24px rgba(0,0,0,.45);font-family:var(--body)}
.pPop.in{animation:popIn .22s cubic-bezier(.2,1.5,.4,1)}
@keyframes popIn{from{transform:translateY(8px) scale(.9);opacity:0}to{transform:none;opacity:1}}
.pPop::after{content:'';position:absolute;left:calc(var(--ax,50%) - 10px);bottom:-13px;width:18px;height:18px;background:#d9c597;border-right:3px solid var(--crInk,#1b1612);border-bottom:3px solid var(--crInk,#1b1612);transform:rotate(45deg);border-bottom-right-radius:4px}
.pPop .ph{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.pPop .ph b{font-family:var(--display);font-weight:400;font-size:17px;line-height:1.1;color:#2a2018}
.pPop .pr{flex:none;padding:2px 8px;border:2px solid var(--crInk,#1b1612);border-radius:8px;background:var(--rc);color:#fff;font-family:var(--display);font-size:12px;text-shadow:var(--tol-s)}
.pPop .pbody{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.pPop .pimg{flex:none;width:64px;display:flex;justify-content:center}.pPop .pimg svg{width:64px;height:auto;max-width:none}.pPop .pimg .pkI{height:60px;width:auto;max-width:none}
.pPop .pw{margin:0;font-weight:800;font-size:14px;line-height:1.25}.pPop .pt{margin:4px 0 0;font-size:12.5px;line-height:1.3;color:#5a4a36}
.pPop .pbtns{display:flex;flex-direction:column;gap:7px}.pPop .pbtns .pt{margin:0 0 2px}
.pPop .btn{width:100%;margin:0}.pPop .btn .coin{display:inline-block;width:15px;height:15px;vertical-align:-2px}
.pPop.z{background:linear-gradient(#2f342d,#1a1d19);color:#e2ead8;border-color:#0a0c0b;box-shadow:inset 0 2px 0 rgba(200,230,180,.18),0 5px 0 #0a0c0b,0 10px 24px rgba(0,0,0,.6)}
.pPop.z::after{background:#1a1d19;border-color:#0a0c0b}.pPop.z .ph b{color:#fff;text-shadow:var(--tol-s)}.pPop.z .pt{color:#b9c6ae}
/* --- la Zombie: niente ritaglio sui bottoni (tagliava nomi e bollini), un po' d'aria sotto la barra in alto; la fila delle Lucky Cards vinte
   ora sta sotto l'eroe, il suo bottone non serve più --- */
#menu.zmode .qbtn{clip-path:none!important}
#menu.zmode #tabPlay .sideBtns{padding-top:8px}
#menu.zmode #luckSlotBtn{display:none!important}
/* --- la barra in basso: il nome sotto ogni linguetta, non solo sotto quella aperta --- */
#menu #tabs button{flex-direction:column;gap:1px}
#menu #tabs button svg{width:27px;height:27px}
#menu #tabs button span{display:block;margin:0;font-family:var(--display);font-weight:400;font-size:11px;line-height:1;color:#efe7d2;text-shadow:var(--tol-s);white-space:nowrap}
#menu #tabs button.on svg{width:38px;height:38px;transform:translateY(-4px)}
#menu #tabs button.on span{font-size:13.5px;margin-top:-5px;color:#fff}
#menu.zmode #tabs button span{color:#c9d4c0}#menu.zmode #tabs button.on span{color:#d8ff9e}
/* --- il nome nel Profilo: un nome lungo va a capo e rimpicciolisce invece di finire tagliato («Massimiliar…») --- */
.pmain{flex:1 1 auto}.pmain h2#pName{max-width:100%;font-size:clamp(19px,6.4vw,28px);line-height:1.02;overflow-wrap:anywhere}
.pmain h2#pName.lungo{font-size:clamp(17px,5.2vw,23px)}
/* --- «Liv. N» sempre intero: il riquadro del nome non scende sotto i 56 px, oro e cristalli più stretti sui telefoni piccoli --- */
#tbWho .tbInfo{min-width:56px}#tbWho #tbName{overflow:visible;text-overflow:clip}
@media (max-width:400px){#topbar{gap:6px}#topbar .res{margin-left:10px;min-width:0;padding-right:22px}#topbar .res span{font-size:14px}#tbWho .tbInfo{margin-left:7px}}
@media (max-width:350px){#topbar .res span{font-size:12.5px}#tbWho .av{width:38px;height:38px}}
`;document.head.appendChild(st)}
renderGearRow();
// il bottone a destra «Casse» ora è quello della bustina gratis (le casse vinte si vedono già sotto l'eroe): pronta «Gratis!», se no il tempo che manca
renderChestBtn=function(){const fr=Date.now()>=SAVE.free.next,rar=(SAVE.free.n+1)%3===0?'argento':'legno',lab=fr?'Gratis!':fmtH(SAVE.free.next-Date.now()).replace(/ \d+s$/,'');
  const html=`${rwIcon(rar,'classica')}<small>${lab}</small>${fr?'<em class="pip">1</em>':''}`,el=$('chestBtn');el.classList.toggle('hot',fr);el.setAttribute('aria-label','Bustina gratis');if(el._h!==html){el.innerHTML=html;el._h=html}};
renderChestBtn();
// il nome lungo nel Profilo: un po' più piccolo (classe lungo) oltre gli 11 caratteri
{const _rp=renderProfile;renderProfile=function(){const r=_rp.apply(this,arguments);try{const e=$('pName');if(e&&!e.querySelector('input'))e.classList.toggle('lungo',(e.textContent||'').trim().length>11)}catch(e){}return r}}
