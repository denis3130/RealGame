// =====================================================================
// I VESTITI (punti 39 e 40 del piano di Denis, anteprima 47): i nove vestiti di sprite/eroe3d/vestiti3d.js nel gioco, insieme ai due
// mantelli del Pass. Si sbloccano con le loro carte (bustine dalla Rara in su) o dai pass, salgono di livello con le carte (+2% di vita a
// livello, in tutte e due le modalità: skinBonus) e si scelgono dal Guardaroba, dove l'eroe 3D gira con il vestito addosso: si possono
// provare anche quelli ancora chiusi. Si vedono ovunque ci sia l'eroe: battaglia, mappa zombie, menu, falò, passaggio tra le modalità.
// =====================================================================
// (crea: the cloaks of the making of the hero, src/js/89-scelta-eroe.js: every save owns them, no cards and no levels)
const WARD_G={scuro:'Scuro e strappato',crea:'Della creazione',swag:'Swag',pass:'Dal Pass'},WARD_O={scuro:0,crea:1,swag:2,pass:3};
const WARD_D={stracciato:'Pelle nera consumata sopra la felpa, la cerniera storta, strappi tenuti dalle spille e borchie sulle spalle.',
  felpa:'Felpa antracite col marsupio, i lacci coi puntali e gli strappi che mostrano la maglia rossa.',
  sopravvissuto:'Giacca militare con le toppe, cartucciera a tracolla, fazzoletto al collo, occhialoni, guanti e scarponi.',
  mantello:'Un mantello lungo e sfrangiato che ondeggia, la mantellina sulle spalle e il fermaglio a teschio di corvo.',
  becchino:'Frac nero con le code, panciotto rosso, la catena dell\'orologio, guanti grigi e il cilindro.',
  neon:'Nera, con la foglia di muschio stampata che si accende, i lacci verdi e il bordo luminoso sul cappuccio.',
  varsity:'Bordeaux e panna, la M di ciniglia sul petto, i bottoni a pressione e i polsini a righe.',
  rune:'Piumino viola trapuntato, le rune d\'oro che brillano piano e la catena col ciondolo.',
  drago:'Kimono cremisi con le nuvole d\'oro, il colletto incrociato e la fusciacca annodata dietro.',
  lucciola:'Il manto del Pass, punteggiato di lucciole.',stellato:'Il manto del Pass, pieno di stelle.'};
{const VS=typeof EROE!=='undefined'&&EROE.VESTITI||{};for(const k in VS){const v=VS[k];SKINS[k]={n:v.n,rar:v.rar,body:v.body,hood:v.hood,belt:v.belt,group:v.group}}
  for(const k of['lucciola','stellato'])if(SKINS[k]){SKINS[k].group='pass';if(SKINS[k].rar==null)SKINS[k].rar=k==='stellato'?3:2}}
const wardList=()=>Object.keys(SKINS).sort((a,b)=>(WARD_O[SKINS[a].group]??3)-(WARD_O[SKINS[b].group]??3)||skinRar(a)-skinRar(b));
const wardOwn=k=>!k||!!(SAVE.skins&&SAVE.skins[k]);
// skinIcon gives an <img> (iconCv): here its picture alone
const imgSrc=h=>{const m=/src="([^"]+)"/.exec(h||'');return m?m[1]:''};
// the hero you play (any of the four) in an outfit: the colours of the outfit and its id (the 3D hero draws its pieces from the id)
function wardStyle(k,o){const s0=heroStyle0(SAVE.hero),S=k&&SKINS[k];return{...s0,...(S?{body:S.body,hood:S.hood,belt:S.belt,skinId:k}:{}),...(o||{})}}
// the outfits' pictures: the hero in 3D wearing it, three quarters, without the bow (cards, reveal, collections)
{const _si=skinIcon;skinIcon=function(k){if(!SKINS[k]||typeof EROE==='undefined')return _si(k);return iconCv('s3:'+k,x=>{x.translate(48,72);x.scale(2.1,2.1);
  const sv=noShadow;noShadow=false;try{drawRig(0,0,Math.PI/2-.42,0,false,wardStyle(k,{held:null,quiver:false}),{})}finally{noShadow=sv}})}}
// ------------------------------------------------------------------ the Guardaroba
const WD={sel:null,raf:0};
function fillVestiti(){lastSheetHTML='';const cur=SAVE.skin&&wardOwn(SAVE.skin)&&SKINS[SAVE.skin]?SAVE.skin:'';if(WD.sel==null||(WD.sel&&!SKINS[WD.sel]))WD.sel=cur;
  const k=WD.sel,S=k&&SKINS[k],cr=!!(S&&S.crea),own=wardOwn(k),lv=k?(SAVE.skinLv[k]||(own?1:0)):0,cards=k?SAVE.skinCards[k]||0:0,need=k?(own?skinNeed(lv):SKIN_UNLOCK[skinRar(k)]):0,max=own&&lv>=SKIN_MAX,r=k?RAR[skinRar(k)]:null;
  const bar=k&&!cr?`<div class="pbar${!max&&cards>=need?' full':''}"><i style="width:${max?100:Math.min(100,cards/Math.max(1,need)*100)}%"></i><span>${max?'MAX':`${cards}/${need}`}</span></div>`:'';
  const btns=!k?(cur?`<button class="btn go" data-wdwear="">Torna all'originale</button>`:`<em class="inuse">Indossato</em>`)
    :own?(cur===k?`<em class="inuse">Indossato</em>`:`<button class="btn go" data-wdwear="${k}">Indossa</button>`)+(max||cr?'':`<button class="btn" data-wdup="${k}" ${cards>=need?'':'disabled'}>Migliora</button>`)
    :`<span class="wdLock">${LOCK} ${S.group==='pass'?'Si ottiene dal Pass':'Carte dalle bustine Rare, Epiche, Leggendarie e Immortali'}</span>`;
  const card=id=>{const S2=id&&SKINS[id],o=wardOwn(id),l=id?(SAVE.skinLv[id]||1):0,c=id?SAVE.skinCards[id]||0:0,nd=id?(o?skinNeed(l):SKIN_UNLOCK[skinRar(id)]):0,ready=id&&!S2.crea&&c>=nd&&!(o&&l>=SKIN_MAX);
    return `<button class="wdc ${o?'':'locked'} ${WD.sel===id?'sel':''} ${cur===id?'on':''}" data-wd="${id}" style="--rc:${id?RAR[skinRar(id)].c:'#cfc6b0'}">
      <img src="${imgSrc(id?skinIcon(id):wardOrigIcon())}" alt=""><b>${id?S2.n:'Originale'}</b><small>${!id?'Il vestito di sempre':S2.crea?'Tuo':o?`Liv. ${l}`:`${LOCK} ${c}/${nd}`}</small>${cur===id?'<i class="wdOn">✓</i>':ready?'<i class="wdDot"></i>':''}</button>`};
  $('sheet').innerHTML=`<h2>Guardaroba</h2><p class="lead">I vestiti valgono in tutte e due le modalità: ogni livello dà <b>+2% di vita</b>. Tocca un vestito per provarlo addosso.</p>
    <div class="wdStage" style="--rc:${cr?S.hood:r?r.c:'#cfc6b0'}"><canvas id="wdCv"></canvas><div class="wdInfo"><b>${k?S.n:'Originale'}</b>${k?`<div class="wdTag">${cr?'':`<u style="color:${r.c}">${r.n}</u> · `}<span>${WARD_G[S.group]||''}</span></div>`:''}
      <p>${k?WARD_D[k]||'':'Il cappuccio verde acqua e la giubba di sempre.'}</p>${k&&own?`<small>${cr?'Solo colori: niente livelli':`Livello ${lv} · +${lv*2}% di vita`}</small>`:''}${bar}<div class="wdBtns">${btns}</div></div></div>
    ${['scuro','crea','swag','pass'].map(g=>{const ids=wardList().filter(id=>SKINS[id].group===g);return ids.length?`<h3 class="h3">${WARD_G[g]}</h3><div class="wdGrid">${(g==='scuro'?[''].concat(ids):ids).map(card).join('')}</div>`:''}).join('')}
    <button class="btn alt close">Chiudi</button>`;
  wardStart()}
function wardOrigIcon(){return iconCv('s3:orig',x=>{x.translate(48,72);x.scale(2.1,2.1);const sv=noShadow;noShadow=false;try{drawRig(0,0,Math.PI/2-.42,0,false,{...heroStyle0(SAVE.hero),held:null,quiver:false},{})}finally{noShadow=sv}})}
// the hero turning slowly in the outfit you are looking at (only while the Guardaroba is open)
function wardStart(){const cv=$('wdCv');if(!cv)return;const d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(150*d);cv.height=Math.round(170*d);if(!WD.raf)WD.raf=requestAnimationFrame(wardLoop)}
function wardLoop(){WD.raf=0;const cv=$('wdCv');if(SHEET!=='vestiti'||!cv)return;const g=cv.getContext('2d'),sv=ctx,t=performance.now()/1000,k=cv.width/150;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);ctx=g;const s0=noShadow;noShadow=false;
  try{g.setTransform(k*3,0,0,k*3,cv.width/2,cv.height*.66);drawRig(0,0,Math.PI/2-t*.55,0,false,wardStyle(WD.sel),{})}catch(e){console.error(e)}finally{ctx=sv;noShadow=s0}
  WD.raf=requestAnimationFrame(wardLoop)}
{const _os=openSheet;openSheet=function(kind){if(kind==='vestiti'){SHEET=kind;sfx('ui');WD.sel=null;fillVestiti();$('sheetScr').hidden=false;return}return _os(kind)}}
$('sheet').addEventListener('click',e=>{if(SHEET!=='vestiti')return;const b=e.target.closest('[data-wd],[data-wdwear],[data-wdup]');if(!b||b.disabled)return;
  if(b.dataset.wd!=null){WD.sel=b.dataset.wd;sfx('ui');vib(10);fillVestiti();return}
  if(b.dataset.wdwear!=null){const k=b.dataset.wdwear;if(k&&!wardOwn(k))return;SAVE.skin=k||null;save();sfx('upgrade');vib(20);renderTop.k=null;renderTop();fillVestiti();wardRefresh();toast(k?`Indossi ${SKINS[k].n}`:'Torni al vestito di sempre');return}
  if(b.dataset.wdup!=null){const k=b.dataset.wdup;if(skinUp(k)){vib(25);toast(`${SKINS[k].n} sale al livello ${SAVE.skinLv[k]}!`);fillVestiti();wardRefresh()}}});
// ------------------------------------------------------------------ where you open it: the Armeria (both modes) and the Profile
function wardRow(){const k=SAVE.skin&&wardOwn(SAVE.skin)&&SKINS[SAVE.skin]?SAVE.skin:'',up=wardList().some(id=>{const o=wardOwn(id),l=SAVE.skinLv[id]||1,c=SAVE.skinCards[id]||0;return o&&l<SKIN_MAX&&c>=skinNeed(l)});
  return `<button class="wdRow" data-wdopen="1"><img src="${imgSrc(k?skinIcon(k):wardOrigIcon())}" alt=""><span><small>Vestito</small><b>${k?SKINS[k].n:'Originale'}</b></span><em>Guardaroba ›</em>${up?'<i class="wdDot"></i>':''}</button>`}
function wardRefresh(){const a=$('wdArm');if(a)a.innerHTML=wardRow();const s=$('skins');if(s)s.innerHTML=wardRow()}
{const tg=$('tabGear'),ph=tg&&tg.querySelector('.pageHead');if(ph){const d=document.createElement('div');d.id='wdArm';ph.after(d);d.innerHTML=wardRow()}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-wdopen]');if(!b)return;e.stopPropagation();openSheet('vestiti')},true);
{const _rp=renderProfile;renderProfile=function(){_rp.apply(this,arguments);const s=$('skins');if(s)s.innerHTML=wardRow()}}
{const _sh=setTab;setTab=function(t){const r=_sh.apply(this,arguments);if(t==='tabGear'){const a=$('wdArm');if(a)a.innerHTML=wardRow()}return r}}
{const st=document.createElement('style');st.textContent=`
#wdArm{margin:2px 0 10px}
.wdRow{position:relative;display:flex;align-items:center;gap:10px;width:100%;padding:6px 12px 6px 6px;border:2.5px solid var(--ink,#0a0c0b);border-radius:12px;background:linear-gradient(100deg,rgba(80,64,44,.75),rgba(30,26,22,.75));color:var(--parch,#f2e8d0);font-family:var(--body);cursor:pointer;text-align:left}
.wdRow img{width:46px;height:46px;flex:none;filter:drop-shadow(0 3px 0 rgba(0,0,0,.4))}.wdRow span{flex:1;min-width:0;display:flex;flex-direction:column}.wdRow small{font-size:11px;opacity:.8}
.wdRow b{font-family:var(--display);font-weight:400;font-size:16px;color:#fff;text-shadow:var(--tol-s);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wdRow em{font-style:normal;font-weight:700;font-size:13px;color:#ffd86b}
.wdDot{position:absolute;top:4px;right:6px;width:11px;height:11px;border-radius:50%;background:#e5484d;border:2px solid #0a0c0b}
.wdStage{position:sticky;top:-2px;z-index:3;box-shadow:0 6px 12px rgba(0,0,0,.35);display:flex;gap:10px;align-items:center;margin:2px 0 10px;padding:6px 10px 10px 4px;border:2.5px solid var(--ink,#0a0c0b);border-radius:14px;background:radial-gradient(60% 70% at 25% 60%,color-mix(in srgb,var(--rc) 30%,transparent),transparent 72%),linear-gradient(170deg,#3a3028,#1c1814)}
.wdStage canvas{width:150px;height:170px;flex:none}.wdInfo{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.wdTag{font-size:12px}.wdInfo b{font-family:var(--display);font-weight:400;font-size:19px;color:#fff;text-shadow:var(--tol-s);line-height:1.1}.wdInfo u{text-decoration:none;font-weight:800;font-size:12px}.wdInfo span{font-size:12px;opacity:.85}
.wdInfo p{margin:0;font-size:12.5px;line-height:1.3}.wdInfo small{font-size:12px;color:#c8f04a;font-weight:700}.wdBtns{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}.wdBtns .btn{padding:6px 12px;font-size:14px}
.wdLock{font-size:12px;color:#ffd86b;font-weight:700}.wdLock svg,.wdc small svg{width:12px;height:12px;vertical-align:-1px;display:inline-block}
.wdGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:4px 0 12px}
.wdc{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 2px 7px;border:2.5px solid var(--ink,#0a0c0b);border-radius:12px;background:linear-gradient(170deg,color-mix(in srgb,var(--rc) 22%,#3a3028),#1e1a16);color:var(--parch,#f2e8d0);font-family:var(--body);cursor:pointer;-webkit-tap-highlight-color:transparent}
.wdc img{width:64px;height:64px;filter:drop-shadow(0 3px 0 rgba(0,0,0,.4))}.wdc b{font-size:11.5px;line-height:1.15;text-align:center;font-weight:800}.wdc small{font-size:10.5px;opacity:.85}
.wdc.locked img{filter:saturate(.75) brightness(.78) drop-shadow(0 3px 0 rgba(0,0,0,.4))}.wdc.sel{outline:3px solid #ffd86b;outline-offset:1px}
.wdOn{position:absolute;top:3px;right:5px;width:18px;height:18px;border-radius:50%;background:#7bbf4a;border:2px solid #0a0c0b;color:#fff;font-style:normal;font-size:11px;line-height:14px;text-align:center;font-weight:900}`;document.head.appendChild(st)}
