// =====================================================================
// THE MAKING OF THE HERO (Denis, 14 October: «vorrei che fosse la scelta come quella dei dark souls», then «migliora il tutto»). At the
// very first launch the intro plays first, then this screen, like the character creation of Dark Souls: black all round, a hard light
// from above, the hero big in 3D in the middle of it, turning slowly (a finger turns him, a tap makes him shoot), dark panels over the
// scene. Four steps:
//   I   Classe   the four heroes on the left (the Arciere and the Cacciatrice can be picked; the Balestriere and the Druida are there
//                with their padlock and their price), his numbers on the right, his story underneath;
//   II  Aspetto  the colour of his mantle (the game's mantles, SKINS: changed later in the Profile like the ones of the pass);
//   III Dono     the gift to start with, in 3D on the rune stone in the hero's place (a sack of gold, crystals, a silver chest, the
//                falcon ring, the phoenix feather);
//   IV  Nome     his name (SAVE.pname, seen in the Profile), a summary, «Inizia»: he shoots into the sky, «Il viaggio ha inizio».
// The hero picked is free and is yours; the other one of the first two costs 3.000 gold in the hero tab (SAVE.starter); the
// Balestriere and the Druida keep their prices. Shown once: a save that has a starter, or games played, never sees it again; closed
// half way, it comes back over the menu.
// =====================================================================
const SCE_IDS=['arciere','cacciatrice','balestriere','druida'],SCE_FREE=['arciere','cacciatrice'],SCE_PRICE=HERO_BY.cacciatrice.price||3000;
// rgb: the colour of the runes, the sparks and the name; the: with its article
const SCE_INFO={arciere:{rgb:'92,222,200',hex:'#5cdec8',the:"l'Arciere",twang:null},cacciatrice:{rgb:'255,140,190',hex:'#ff8cbe',the:'la Cacciatrice',twang:'arco_ricurvo'},
  balestriere:{rgb:'150,190,255',hex:'#a9c8ff',the:'il Balestriere'},druida:{rgb:'123,240,168',hex:'#7bf0a8',the:'il Druida'}};
const SCE_LORE={arciere:'Il veterano della cripta: equilibrato in tutto, non ha un punto debole e non perde mai la calma.',
  cacciatrice:'Rapidissima e sfuggente: colpisce di lato e sparisce prima che il nemico si giri. Ma bastano pochi colpi a fermarla.',
  balestriere:'Lento e corazzato. Ogni dardo è un macigno: trapassa i nemici e li spinge via.',
  druida:'Parla con il bosco: le radici lo proteggono e lo curano mentre combatte.'};
const SCE_STEPS=[{t:'Chi vuoi essere?',l:'Classe'},{t:'Il tuo mantello',l:'Aspetto'},{t:'Scegli un dono',l:'Dono'},{t:'Come ti chiami?',l:'Nome'}],SCE_NUM=['I','II','III','IV'];
// the mantles: '' is the hero's own colours; the others are skins of the game (SKINS), which every save owns
const SCE_MANTI=[{id:'',n:'Originale',d:'I colori di sempre.'},
  {id:'brace',n:'Brace',sk:'Manto di brace',d:'Rosso come il fuoco del Cuore del Vulcano.',body:'#8a2a1e',hood:'#d4492f',belt:'#4a2a1a'},
  {id:'muschio',n:'Muschio',sk:'Manto di muschio',d:'Verde come la cripta dove tutto comincia.',body:'#3f7a2a',hood:'#6cae3c',belt:'#6b4a2a'},
  {id:'notte',n:'Notte',sk:'Manto della notte',d:'Blu come il cielo sopra i Picchi di Brina.',body:'#26386e',hood:'#4a6bc4',belt:'#8a6a3a'},
  {id:'strega',n:'Strega',sk:'Manto della strega',d:'Viola come le radici della Strega.',body:'#4e3278',hood:'#8c5cc4',belt:'#3a2a1d'},
  {id:'corvo',n:'Corvo',sk:'Manto del corvo',d:'Nero come le ali dei corvi del camposanto.',body:'#2e313a',hood:'#4d5260',belt:'#8a5a2a'}];
const SCE_MANTO=Object.fromEntries(SCE_MANTI.map(m=>[m.id,m]));
for(const m of SCE_MANTI)if(m.id&&!SKINS[m.id])SKINS[m.id]={n:m.sk,body:m.body,hood:m.hood,belt:m.belt,crea:1};
// they belong to every save, also to one put back as it was (the intro restores the save from a copy taken before this file runs) or
// loaded from a code: given again when the save has lost them
function sceOwnSkins(){SAVE.skins=SAVE.skins||{};for(const m of SCE_MANTI)if(m.id)SAVE.skins[m.id]=1}
sceOwnSkins();
// the portrait at the top was drawn before these mantles existed: drawn again
try{renderTop.k=null;renderTop()}catch(e){}
{const _hs=heroStyle;heroStyle=function(){const K=SAVE.skin&&SKINS[SAVE.skin];if(K&&K.crea&&!(SAVE.skins&&SAVE.skins[SAVE.skin]))sceOwnSkins();return _hs.apply(this,arguments)}}
{const _rp=renderProfile;renderProfile=function(){sceOwnSkins();return _rp.apply(this,arguments)}}
// names offered (the dice gives another one); the player can write his own
const SCE_NAMES=['Bruma','Ortica','Tasso','Gufo','Ruggine','Ghianda','Selce','Brina','Falco','Rovo','Cenere','Scintilla','Salice','Ginepro','Volpe','Nebbia','Tempesta',
  'Smeraldo','Quercia','Faggio','Lince','Airone','Grifo','Corteccia','Lampo','Vischio','Mirtillo','Pietra'];
const SCE={on:false,el:null,step:1,sel:null,manto:'',gift:null,name:'',done:false,raf:0,time:0,last:0,manual:false,yaw:Math.PI/2-.5,vel:0,drag:null,
  hero:null,prev:null,gcur:null,gprev:null,mode:'hero',modeT:-9,kz:null,emb:[],motes:null,fog:null,bgK:'',bgImg:null,can:{},low:false,ema:0,slow:0,err:0,
  tilt:.9,lift:3,cant:1,fin:null,pulse:-9};
const sceStarter=()=>SCE_FREE.includes(SAVE.starter)?SAVE.starter:'arciere';
// the price of the first two heroes follows the choice: the one you picked is yours, the other costs 3.000 gold
for(const id of SCE_FREE)Object.defineProperty(HERO_BY[id],'price',{configurable:true,enumerable:true,get:()=>sceStarter()===id?0:SCE_PRICE});
// a new player: no hero picked yet, no games played, no hero but the Arciere the save gives everybody
const sceNeeded=()=>!SAVE.starter&&!(SAVE.runs>0)&&Object.keys(SAVE.heroes||{}).every(k=>k==='arciere');
const sceFree=id=>SCE_FREE.includes(id);
// the hero as he looks on this screen: his style with the mantle picked
function sceStyle(id){const S=heroStyle0(id),M=SCE_MANTO[SCE.manto||''],st=M&&M.body?{...S,body:M.body,hood:M.hood,belt:M.belt}:S;return id==='druida'&&!st.eyes?{...st,eyes:st.eyeCol}:st}

// ------------------------------------------------------------------ the gifts
// rows: what you get, as the right column shows it; give(): into the save
const SCE_GIFTS=[
  {id:'oro',n:"Sacco d'oro",rgb:'255,205,110',d:"Un sacco pesante, pieno di monete ancora tiepide. Con l'oro migliori l'equipaggiamento e compri casse in bottega.",
   rows:[['Oro','+500','coin']],give(){SAVE.gold=(SAVE.gold||0)+500}},
  {id:'cristalli',n:'Cristalli',rgb:'120,220,255',d:'Cristalli presi dalle rocce della cripta: brillano anche al buio. Servono per i compagni, la ruota e la rinascita.',
   rows:[['Cristalli','+30','gem']],give(){SAVE.gems=(SAVE.gems||0)+30}},
  {id:'cassa',n:"Cassa d'argento",rgb:'200,225,255',d:"Una cassa chiusa da chissà quanto tempo, con dentro carte oggetto e oro. La trovi pronta da aprire tra le tue casse.",
   rows:[['Carte',CHESTS.argento.cards],['Oro',CHESTS.argento.gold.join('–')]],
   give(){const i=SAVE.slots.findIndex(s=>!s);if(i>=0)SAVE.slots[i]={type:'argento',state:'ready'};else SAVE.gold=(SAVE.gold||0)+CHESTS.argento.price}},
  {id:'anello',n:'Anello del falco',rgb:'120,170,255',d:"Un anello d'argento con una pietra blu: chi lo porta vede i punti deboli dei nemici. Lo indossi da subito.",
   rows:[['Rarità','Raro'],['Critico','+5%'],['Attacco','+3']],
   give(){SAVE.items=SAVE.items||{};if(!SAVE.items.anello_falco)SAVE.items.anello_falco={lvl:1,cards:0};SAVE.eq=SAVE.eq||{};if(!SAVE.eq.anello)SAVE.eq.anello='anello_falco'}},
  {id:'piuma',n:'Piuma della fenice',rgb:'255,140,70',d:'Una piuma che non smette mai di scaldare. La prima volta che cadi in battaglia prende fuoco e ti rialzi.',
   rows:[['Rinascite','+1']],give(){SAVE.piuma=(SAVE.piuma||0)+1}}];
const SCE_GIFT=Object.fromEntries(SCE_GIFTS.map(g=>[g.id,g]));
// the phoenix feather: the first fall in battle (when no dragon's heart is left) burns it and you get up again
{const _d=die;die=function(){if(!INTRO.on&&G&&G.mode&&!G.ended&&G.state!=='dead'&&P&&!(P.revive>0)&&(SAVE.piuma||0)>0){SAVE.piuma--;save();
    P.hp=P.maxhp;P.inv=2.4;shake(7);vib([40,30,90]);banner('Piuma della fenice','Ti rialzi',1.8);sfx('rise');sfx('pick');
    try{vfxBlast(P.x,P.y-10,'255,150,60',150,{fire:10,sparks:26,spcol:['#fff1a8','#ffb040','#ff6a2a'],dust:8});fxPush({k:'flash',x:P.x,y:P.y-10,r:190,rgb:'255,190,110',t:.35,max:.35})}catch(e){}
    for(const e of G.enemies)if(!isBoss(e.type)){const a=Math.atan2(e.y-P.y,e.x-P.x);moveCircle(e,Math.cos(a)*50,Math.sin(a)*50)}return}
  return _d.apply(this,arguments)}}

// ------------------------------------------------------------------ the hero's numbers (the game's own: makeP with that hero)
function sceStats(id){const keepH=SAVE.hero,keepP=P;let q=null;try{SAVE.hero=id;q=makeP()}catch(e){}finally{SAVE.hero=keepH;P=keepP}
  return q?{hp:Math.round(q.maxhp),atk:Math.round(q.atk),aspd:q.aspd,spd:Math.round(q.spd),crit:q.crit,dash:q.dashMax}:null}
const sce1=v=>(Math.round(v*10)/10).toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1});
// label, value, which way is better (the dash: less is better)
const SCE_ROWS=[['hp','Salute',v=>v,1],['atk','Attacco',v=>v,1],['aspd','Cadenza',sce1,1],['spd','Velocità',v=>v,1],['crit','Critico',v=>Math.round(v*100)+'%',1],['dash','Scatto',v=>sce1(v)+' s',-1]];
// a name: letters, numbers, spaces and a few signs (it is shown in the Profile and in the rankings), at most 14
const sceClean=v=>String(v||'').replace(/[<>&"`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,14);
const sceRandName=()=>{let n;do n=SCE_NAMES[randi(0,SCE_NAMES.length-1)];while(n===SCE.name&&SCE_NAMES.length>1);return n};

// ------------------------------------------------------------------ the look (Dark Souls: black, thin gold rules, serif capitals, dark panels)
function sceFonts(){if($('sceFont'))return;const l=document.createElement('link');l.id='sceFont';l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=EB+Garamond:ital,wght@0,500;1,500&display=swap';document.head.appendChild(l)}
function sceCss(){if($('sceCss'))return;const s=document.createElement('style');s.id='sceCss';s.textContent=`
#sceScr{--g:#d8b46a;--gh:#f6e2a8;--tx:#e9dcc0;--dim:#9a8f79;--se:"Cinzel",Georgia,"Times New Roman",serif;--bo:"EB Garamond",Georgia,"Times New Roman",serif;
  position:absolute;inset:0;z-index:96;overflow:hidden;background:#030202;color:var(--tx);font-family:var(--bo);display:flex;flex-direction:column;
  touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#sceScr *,#sceScr *::before,#sceScr *::after{box-sizing:border-box}
#sceCv{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
#sceScr>:not(#sceCv){position:relative;z-index:1}
.sceTop{flex:none;text-align:center;padding:clamp(8px,1.6vh,22px) 12px 0;animation:sceIn .9s .1s ease-out backwards}
.sceTop small{display:block;font:500 10px/1 var(--se);letter-spacing:.34em;text-transform:uppercase;color:var(--dim)}
.sceTop h1{margin:6px 0 0;font:700 clamp(21px,6.3vw,30px)/1.08 var(--se);letter-spacing:.05em;color:var(--gh);text-shadow:0 0 18px rgba(255,196,110,.22),0 2px 0 #000;white-space:nowrap}
.sceRule{display:flex;align-items:center;justify-content:center;gap:8px;margin:7px auto 0;width:min(78%,300px)}
.sceRule::before,.sceRule::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(216,180,106,0),rgba(216,180,106,.6))}
.sceRule::after{background:linear-gradient(90deg,rgba(216,180,106,.6),rgba(216,180,106,0))}
.sceRule i{width:6px;height:6px;transform:rotate(45deg);background:var(--g);box-shadow:0 0 8px rgba(255,205,130,.7)}
.sceSteps{display:flex;justify-content:center;gap:12px;margin:6px 0 0;padding:0;list-style:none;font:500 9.5px var(--se);letter-spacing:.16em;text-transform:uppercase;color:#7a6f5b;white-space:nowrap;text-shadow:0 0 5px #000,0 0 2px #000}
.sceSteps li{transition:color .3s}.sceSteps li.on{color:var(--gh)}.sceSteps li.ok{color:#a8946a}.sceSteps b{font-weight:700;margin-right:4px}
.sceMid{position:relative;flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1.16fr) minmax(0,1.04fr) minmax(0,1.04fr);width:100%;max-width:560px;margin:0 auto;padding:0 8px}
.sceCol{min-width:0;align-self:start;margin-top:clamp(4px,1.4vh,14px);padding:6px 6px 7px;background:linear-gradient(rgba(8,6,5,.84),rgba(8,6,5,.62));
  border:1px solid rgba(216,180,106,.14);border-top-color:rgba(216,180,106,.36);box-shadow:0 10px 26px rgba(0,0,0,.5);text-shadow:0 0 6px #000,0 1px 0 #000;
  animation:sceIn .8s .25s ease-out backwards;transition:opacity .35s}
.sceCol.empty{visibility:hidden}
.sceCol h2{margin:0 0 4px;padding:0 0 5px 2px;font:500 9.5px var(--se);letter-spacing:.24em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid rgba(216,180,106,.26)}
.sceStats h2{text-align:right;padding:0 2px 5px 0}
.sceRow{position:relative;display:block;width:100%;margin:0;padding:clamp(6px,1.1vh,10px) 3px clamp(6px,1.1vh,10px) 14px;border:0;background:none;color:#b3a78e;text-align:left;cursor:pointer;
  font:500 clamp(12.5px,3.75vw,15.5px)/1.1 var(--se);letter-spacing:.01em;transition:color .2s,background .2s}
.sceRow::before{content:'';position:absolute;left:3px;top:calc(clamp(6px,1.1vh,10px) + .55em);width:6px;height:6px;margin-top:-3px;background:var(--g);box-shadow:0 0 8px rgba(255,205,130,.9);transform:rotate(45deg) scale(0);transition:transform .2s}
.sceRow.on{color:#fff4d8;background:linear-gradient(90deg,rgba(216,180,106,.22),rgba(216,180,106,0) 92%)}
.sceRow.on::before{transform:rotate(45deg) scale(1)}
.sceRow b{font-weight:500;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sceRow.g b{white-space:normal;line-height:1.08}
.sceRow small{display:flex;align-items:center;gap:4px;margin-top:3px;font:500 10.5px/1 var(--se);letter-spacing:.04em;color:#8a7f6b}
.sceRow.lock b{color:#857b69}.sceRow.lock.on b{color:#d4c9b0}
.sceRow.m b{display:flex;align-items:center;gap:7px}
.sceDot{flex:none;width:13px;height:13px;border-radius:50%;border:1.5px solid #120e0b;background:linear-gradient(135deg,var(--a) 0 52%,var(--b) 52% 100%);box-shadow:0 0 0 1px rgba(216,180,106,.35)}
.sceDot.o{background:conic-gradient(#5cdec8 0 25%,#ff8cbe 0 50%,#a9c8ff 0 75%,#7bf0a8 0)}
.sceLk{display:inline-block;width:10px;height:11px;flex:none}
.sceCoin,.sceGem{display:inline-block;width:12px;height:12px;flex:none;vertical-align:-1px;background:var(--coinImg) center/contain no-repeat}.sceGem{background-image:var(--gemImg)}
.sceStage{grid-column:2;grid-row:1;align-self:stretch;min-height:0;cursor:grab;touch-action:none}
.sceList{grid-column:1;grid-row:1}.sceStats{grid-column:3;grid-row:1;text-align:right}
.sceStats dl{margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(3px,.9vh,7px) 6px;align-items:baseline}
.sceStats dt{font:500 clamp(10px,3vw,12px) var(--se);color:#a2967f;letter-spacing:.02em;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sceStats dd{margin:0;font:700 clamp(12.5px,3.8vw,15.5px) var(--se);color:#f2e7cd;font-variant-numeric:tabular-nums;white-space:nowrap}
.sceStats dd.up{color:#8cc4ff}.sceStats dd.dn{color:#ff9187}.sceStats dd i{font-style:normal;font-size:.62em;margin-left:2px;vertical-align:.15em}
.sceStats dd .sceCoin,.sceStats dd .sceGem{width:13px;height:13px;margin-left:3px;vertical-align:-2px}
.sceNameBox{position:absolute;left:50%;top:clamp(4px,1.4vh,14px);width:min(300px,86%);transform:translateX(-50%);z-index:2;display:none;text-align:center;animation:sceIn .5s ease-out backwards}
#sceScr.s4 .sceNameBox{display:block}
.sceNameBox label{display:block;margin-bottom:5px;font:500 9.5px var(--se);letter-spacing:.24em;text-transform:uppercase;color:var(--dim);text-shadow:0 0 6px #000}
.sceNameRow{display:flex;align-items:stretch;border:1px solid rgba(246,214,140,.6);background:linear-gradient(rgba(10,8,6,.9),rgba(6,5,4,.94));box-shadow:0 0 0 1px #000,0 0 22px rgba(255,190,100,.18),0 10px 26px rgba(0,0,0,.55)}
.sceNameRow input{flex:1;min-width:0;margin:0;padding:10px 12px;border:0;outline:0;background:none;color:#fff3d2;font:700 clamp(17px,5.2vw,21px) var(--se);letter-spacing:.06em;text-align:center;
  -webkit-user-select:text;user-select:text;caret-color:var(--g)}
.sceNameRow input::placeholder{color:#7d725f}
.sceDice{flex:none;width:46px;border:0;border-left:1px solid rgba(216,180,106,.35);background:none;color:var(--g);cursor:pointer;display:flex;align-items:center;justify-content:center}
.sceDice svg{width:22px;height:22px}.sceDice:active svg{transform:rotate(25deg) scale(.92)}
.sceBot{flex:none;width:100%;max-width:560px;margin:0 auto;padding:0 12px clamp(8px,1.4vh,20px);animation:sceIn .8s .35s ease-out backwards;transition:opacity .4s}
.sceDesc{position:relative;padding:clamp(7px,1.3vh,11px) 14px clamp(8px,1.4vh,12px);border:1px solid rgba(216,180,106,.34);background:linear-gradient(rgba(16,12,9,.9),rgba(7,5,4,.94));
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.7),inset 0 0 22px rgba(0,0,0,.6),0 0 26px rgba(0,0,0,.7)}
.sceDesc::before,.sceDesc::after{content:'';position:absolute;top:-4px;width:7px;height:7px;transform:rotate(45deg);background:#0a0806;border:1px solid rgba(216,180,106,.6)}
.sceDesc::before{left:-4px}.sceDesc::after{right:-4px}
.sceDesc h3{margin:0;font:700 clamp(15px,4.5vw,19px)/1.15 var(--se);letter-spacing:.05em;color:var(--c,var(--gh))}
.sceDesc p{margin:4px 0 0;font:italic 500 clamp(13.5px,3.9vw,15.5px)/1.28 var(--bo);color:#e4d8bd}
.sceDesc ul{margin:5px 0 0;padding:0;list-style:none;font:500 clamp(12.5px,3.6vw,14px)/1.3 var(--bo);color:#cdbfa2}
.sceDesc li{display:flex;gap:6px;align-items:baseline}.sceDesc li::before{content:'';flex:none;width:5px;height:5px;transform:rotate(45deg) translateY(-2px);background:var(--g);opacity:.8}
.sceDesc li b{color:var(--c,var(--gh));font-weight:500}
.sceSum{display:grid!important;gap:2px}
.sceSum li{cursor:pointer;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(216,180,106,.12)}.sceSum li::before{display:none}
.sceSum li span{font:500 10.5px var(--se);letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.sceSum li b{font:700 clamp(13px,3.8vw,15px) var(--se);color:#f2e6c8;letter-spacing:.03em;text-align:right}
.sceSum li b::after{content:' ›';color:var(--g)}
.sceBtns{display:flex;gap:10px;justify-content:center;margin-top:clamp(7px,1.3vh,11px)}
.sceBtn{min-width:118px;min-height:46px;padding:10px 16px 11px;border:1px solid rgba(216,180,106,.5);background:linear-gradient(rgba(42,33,25,.94),rgba(16,12,10,.97));color:#efdfbb;cursor:pointer;
  font:700 14px/1 var(--se);letter-spacing:.14em;text-transform:uppercase;box-shadow:inset 0 1px 0 rgba(255,232,186,.14),0 0 0 1px #000,0 6px 16px rgba(0,0,0,.6);transition:transform .08s,opacity .3s,filter .2s}
.sceBtn:active{transform:translateY(2px) scale(.98)}
.sceGo{flex:1;max-width:260px;border-color:rgba(246,214,140,.85);color:#fff2cf;background:linear-gradient(rgba(92,70,40,.96),rgba(40,30,20,.98));
  box-shadow:inset 0 1px 0 rgba(255,236,190,.3),0 0 0 1px #000,0 0 18px rgba(255,196,100,.28),0 6px 16px rgba(0,0,0,.6)}
.sceGo:not([disabled]){animation:sceGlow 2.4s ease-in-out infinite}
.sceGo[disabled]{cursor:default;color:#a39885;border-color:rgba(216,180,106,.3);background:linear-gradient(rgba(34,29,25,.95),rgba(16,13,11,.98));box-shadow:0 0 0 1px #000}
.sceGo[disabled] .sceLk{margin-right:7px;vertical-align:-1px}
.sceGo small{display:block;margin-top:3px;font:500 10px/1 var(--bo);letter-spacing:.04em;text-transform:none;color:#b8a988}.sceGo[disabled]{padding-top:7px;padding-bottom:7px}
.sceBack{display:none}#sceScr:not(.s1) .sceBack{display:block}
.sceBand{position:absolute!important;left:0;right:0;top:50%;height:110px;margin-top:-55px;z-index:4!important;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;
  background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.82) 26%,rgba(0,0,0,.82) 74%,rgba(0,0,0,0))}
.sceBand span{display:block;text-align:center;font:700 clamp(19px,6.2vw,32px) var(--se);color:#f3d79c;text-transform:uppercase;white-space:nowrap;text-shadow:0 0 24px rgba(255,186,90,.6),0 0 3px #000;letter-spacing:.08em}
.sceBand small{display:block;margin-bottom:4px;font:500 clamp(11px,3.4vw,14px) var(--se);letter-spacing:.36em;color:#cdb78a}
#sceScr.band .sceBand{animation:sceBand 2.7s ease-out forwards}#sceScr.band .sceBand span{animation:sceSpace 2.7s ease-out forwards}
.sceFade{position:absolute!important;inset:0;z-index:5!important;background:#000;opacity:0;pointer-events:none;transition:opacity .5s}
#sceScr.fin .sceTop,#sceScr.fin .sceCol,#sceScr.fin .sceBot,#sceScr.fin .sceNameBox{opacity:0;transition:opacity .5s;pointer-events:none}
#sceScr.go .sceFade{opacity:1}
#sceScr.out{pointer-events:none;background:transparent}#sceScr.out>:not(.sceFade){display:none}#sceScr.out.clear .sceFade{opacity:0}
.sceSwap{animation:sceSwap .35s ease-out}
@keyframes sceIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.sceNameBox{animation-name:sceInX}@keyframes sceInX{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translateX(-50%)}}
@keyframes sceSwap{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
@keyframes sceGlow{50%{box-shadow:inset 0 1px 0 rgba(255,236,190,.3),0 0 0 1px #000,0 0 28px rgba(255,196,100,.5),0 6px 16px rgba(0,0,0,.6)}}
@keyframes sceBand{0%{opacity:0}16%{opacity:1}74%{opacity:1}100%{opacity:0}}
@keyframes sceSpace{from{letter-spacing:.05em}to{letter-spacing:.12em}}
@keyframes sceShake{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.sceNo{animation:sceShake .35s}
@media (max-width:370px){.sceSteps li:not(.on) span{display:none}.sceSteps{gap:10px}.sceRow.m b{gap:5px}.sceDot{width:12px;height:12px}}
@media (max-height:800px){.sceTop small{display:none}.sceTop h1{margin-top:0}}
@media (max-height:600px){.sceSteps{display:none}.sceDesc ul li:nth-child(n+2){display:none}.sceSum li:nth-child(n+2){display:flex!important}.sceBtn{min-height:42px}}
@media (max-width:340px){.sceCol{padding:5px 4px 6px}.sceRow{padding-left:12px;font-size:12px}.sceRow::before{left:2px}.sceRow.m b{gap:5px}.sceStats dt{font-size:9.5px}}
@media (prefers-reduced-motion:reduce){.sceTop,.sceCol,.sceBot,.sceGo:not([disabled]),.sceSwap,.sceNameBox{animation:none}}
`;document.head.appendChild(s)}
const SCE_LOCK='<svg class="sceLk" viewBox="0 0 10 11" aria-hidden="true"><path d="M2.6 5V3.4a2.4 2.4 0 0 1 4.8 0V5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="4.6" width="8" height="6" rx="1.2" fill="currentColor"/><rect x="4.4" y="6.6" width="1.2" height="2.2" rx=".6" fill="#000" opacity=".55"/></svg>';
const SCE_DICE='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.6" fill="currentColor"/></svg>';
const sceNum=n=>Number(n).toLocaleString('it-IT');

// ------------------------------------------------------------------ the screen
function sceOpen(){if(SCE.on)return;sceCss();sceFonts();
  const el=document.createElement('div');el.id='sceScr';el.className='s1';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','sceTitle');
  el.innerHTML=`<canvas id="sceCv" aria-hidden="true"></canvas>
    <header class="sceTop"><small>Creazione dell'eroe</small><h1 id="sceTitle">${SCE_STEPS[0].t}</h1><div class="sceRule"><i></i></div>
      <ol class="sceSteps">${SCE_STEPS.map((s,i)=>`<li class="${i?'':'on'}"><b>${SCE_NUM[i]}</b><span>${s.l}</span></li>`).join('')}</ol></header>
    <main class="sceMid"><nav class="sceCol sceList" aria-label="Scelta"></nav><div class="sceStage" aria-hidden="true"></div><section class="sceCol sceStats" aria-live="polite"></section>
      <div class="sceNameBox"><label for="sceNameIn">Il nome del tuo eroe</label><div class="sceNameRow"><input id="sceNameIn" maxlength="14" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="done" placeholder="Il tuo nome"><button class="sceDice" aria-label="Un altro nome a caso">${SCE_DICE}</button></div></div></main>
    <footer class="sceBot"><div class="sceDesc" aria-live="polite"></div>
      <div class="sceBtns"><button class="sceBtn sceBack">‹ Indietro</button><button class="sceBtn sceGo">Avanti ›</button></div></footer>
    <div class="sceBand"><span><small></small>Il viaggio ha inizio</span></div><div class="sceFade"></div>`;
  $('wrap').appendChild(el);
  SCE.menuWas=!$('menu').hidden;if(SCE.menuWas)$('menu').hidden=true;
  const stats={};for(const id of SCE_IDS)stats[id]=sceStats(id);
  const nm=sceClean(SAVE.pname);
  Object.assign(SCE,{on:true,el,step:1,sel:null,manto:'',gift:null,name:nm&&nm!=='Esploratore'?nm:'',done:false,time:0,last:performance.now(),stats,hero:null,prev:null,gcur:null,gprev:null,
    mode:'hero',modeT:-9,kz:null,emb:[],motes:null,fog:null,bgK:'',fin:null,drag:null,vel:0,yaw:Math.PI/2-.5,low:!!SCE.low,ema:0,slow:0,err:0,pulse:-9});
  if(!SCE.name)SCE.name=sceRandName();
  const inp=el.querySelector('#sceNameIn');inp.value=SCE.name;
  inp.addEventListener('input',()=>{SCE.name=sceClean(inp.value);sceNameShow()});
  inp.addEventListener('focus',()=>{initAudio();try{inp.select()}catch(e){}});
  inp.addEventListener('blur',()=>{const v=sceClean(inp.value);if(v!==inp.value)inp.value=v;SCE.name=v;sceNameShow()});
  el.querySelector('.sceDice').addEventListener('click',()=>{initAudio();sceSnd('move');SCE.name=sceRandName();inp.value=SCE.name;sceNameShow();if(SCE.hero)SCE.hero.act=sceT()});
  el.querySelector('.sceList').addEventListener('click',e=>{const r=e.target.closest('.sceRow');if(!r)return;
    if(SCE.step===1)scePick(r.dataset.id);else if(SCE.step===2)sceMantoPick(r.dataset.id);else if(SCE.step===3)sceGiftPick(r.dataset.id)});
  el.querySelector('.sceDesc').addEventListener('click',e=>{const r=e.target.closest('[data-go]');if(r)sceToStep(+r.dataset.go)});
  el.querySelector('.sceGo').addEventListener('click',()=>sceGo());
  el.querySelector('.sceBack').addEventListener('click',()=>sceBack());
  sceStageInput(el.querySelector('.sceStage'));
  el.addEventListener('pointerdown',()=>{initAudio();if(AU.cur==null||AU.cur.name!=='scelta')playMusic('scelta')},{capture:true});
  sceList();scePick('arciere',true);sceDescFit();
  try{document.fonts.ready.then(()=>{if(SCE.on)sceDescFit()})}catch(e){}
  playMusic('scelta');
  cancelAnimationFrame(SCE.raf);SCE.raf=requestAnimationFrame(sceLoop)}
// closing: the black stays a moment and then lifts off the menu (fade: false takes it all away at once)
function sceClose(fade){SCE.on=false;cancelAnimationFrame(SCE.raf);if(SCE.menuWas){SCE.menuWas=false;$('menu').hidden=false}const el=SCE.el;SCE.el=null;if(!el)return;
  if(!fade){el.remove();return}el.classList.add('out');requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('clear')));setTimeout(()=>el.remove(),800)}
const sceT=()=>SCE.time;
// the left column of each step (the fourth has none: the name sits on top of the stage)
function sceList(){const L=SCE.el.querySelector('.sceList'),s=SCE.step;let h='';
  if(s===1)h='<h2>Classe</h2>'+SCE_IDS.map(id=>{const H=HERO_BY[id],lk=!sceFree(id);
    return `<button class="sceRow${lk?' lock':''}" data-id="${id}" aria-pressed="false"><b>${H.n}</b>${lk?`<small>${SCE_LOCK}${sceNum(H.price)}<i class="sceCoin"></i></small>`:''}</button>`}).join('');
  else if(s===2)h='<h2>Mantello</h2>'+SCE_MANTI.map(m=>`<button class="sceRow m" data-id="${m.id}" aria-pressed="false"><b><i class="sceDot${m.id?'':' o'}" style="--a:${m.hood||'#fff'};--b:${m.body||'#000'}"></i>${m.n}</b></button>`).join('');
  else if(s===3)h='<h2>Dono</h2>'+SCE_GIFTS.map(g=>`<button class="sceRow g" data-id="${g.id}" aria-pressed="false"><b>${g.n}</b></button>`).join('');
  L.innerHTML=h;L.classList.toggle('empty',s===4);
  L.classList.remove('sceSwap');void L.offsetWidth;if(s<4)L.classList.add('sceSwap');
  sceMark(s===1?SCE.sel:s===2?SCE.manto:SCE.gift)}
function sceMark(id){for(const r of SCE.el.querySelectorAll('.sceList .sceRow')){const on=r.dataset.id===id;r.classList.toggle('on',on);r.setAttribute('aria-pressed',on?'true':'false')}}
// the texts of each step: the right column and the panel underneath
function sceHeroText(id){const h=HERO_BY[id],I=SCE_INFO[id],U=typeof ULT!=='undefined'&&ULT[id],S=SCE.stats[id],B=SCE.stats.arciere,lk=!sceFree(id),R=SCE.el.querySelector('.sceStats');
  R.classList.remove('empty');R.innerHTML='<h2>Statistiche</h2><dl>'+SCE_ROWS.map(([k,n,f,dir])=>{if(!S)return'';const v=S[k],b=B?B[k]:v,d=id==='arciere'?0:Math.sign((v-b)*dir)*(Math.abs(v-b)>1e-6?1:0);
    return `<dt>${n}</dt><dd class="${d>0?'up':d<0?'dn':''}">${f(v)}${d?`<i>${d>0?'▲':'▼'}</i>`:''}</dd>`}).join('')+'</dl>';
  const D=SCE.el.querySelector('.sceDesc');D.style.setProperty('--c',I.hex);
  D.innerHTML=`<h3>${h.n}</h3><p>${SCE_LORE[id]||h.d}</p><ul><li><span>${h.start}</span></li>${U?`<li><span>Super: <b>${U.n}</b></span></li>`:''}</ul>`;
  // a locked one: the button says so, and where he is unlocked
  const go=SCE.el.querySelector('.sceGo');go.disabled=lk;go.innerHTML=lk?`<span>${SCE_LOCK}Bloccato</span><small>${sceNum(h.price)} oro nella scheda Eroi</small>`:'Avanti ›'}
function sceMantoText(id){const m=SCE_MANTO[id]||SCE_MANTI[0];SCE.el.querySelector('.sceStats').classList.add('empty');
  const D=SCE.el.querySelector('.sceDesc');D.style.setProperty('--c',m.hood||SCE_INFO[SCE.sel||'arciere'].hex);
  D.innerHTML=`<h3>Mantello: ${m.n}</h3><p>${m.id?m.d:`I colori di sempre ${(SCE_INFO[SCE.sel]||SCE_INFO.arciere).the.replace(/^l'/,"dell'").replace(/^la /,'della ').replace(/^il /,'del ')}.`}</p><ul><li><span>Lo cambi quando vuoi nel Profilo.</span></li></ul>`;
  const go=SCE.el.querySelector('.sceGo');go.disabled=false;go.textContent='Avanti ›'}
function sceGiftText(id){const g=SCE_GIFT[id],R=SCE.el.querySelector('.sceStats');R.classList.remove('empty');
  R.innerHTML='<h2>Contenuto</h2><dl>'+g.rows.map(([n,v,ic])=>`<dt>${n}</dt><dd>${v}${ic==='coin'?'<i class="sceCoin"></i>':ic==='gem'?'<i class="sceGem"></i>':''}</dd>`).join('')+'</dl>';
  const D=SCE.el.querySelector('.sceDesc');D.style.setProperty('--c','#f6e2a8');D.innerHTML=`<h3>${g.n}</h3><p>${g.d}</p>`;
  const go=SCE.el.querySelector('.sceGo');go.disabled=false;go.textContent='Avanti ›'}
// the summary of the last step (a tap on a line goes back to that step)
function sceSummary(){if(!SCE.el||SCE.step!==4)return;SCE.el.querySelector('.sceStats').classList.add('empty');
  const D=SCE.el.querySelector('.sceDesc'),H=HERO_BY[SCE.sel],m=SCE_MANTO[SCE.manto]||SCE_MANTI[0],g=SCE_GIFT[SCE.gift];D.style.setProperty('--c',SCE_INFO[SCE.sel].hex);
  D.innerHTML=`<h3>${SCE.name||'Il tuo eroe'}</h3><ul class="sceSum"><li data-go="1"><span>Classe</span><b>${H.n}</b></li><li data-go="2"><span>Mantello</span><b>${m.n}</b></li><li data-go="3"><span>Dono</span><b>${g?g.n:'—'}</b></li></ul>`;
  const go=SCE.el.querySelector('.sceGo');go.disabled=false;go.textContent='Inizia'}
// while you write: only the name over the summary changes (rebuilding it would lose a tap on its lines when the keyboard closes)
const sceNameShow=()=>{const h=SCE.el&&SCE.step===4&&SCE.el.querySelector('.sceDesc h3');if(h)h.textContent=SCE.name||'Il tuo eroe'};
function sceText(){const s=SCE.step;if(s===1)sceHeroText(SCE.sel);else if(s===2)sceMantoText(SCE.manto);else if(s===3)sceGiftText(SCE.gift);else sceSummary()}
// the panel is as high as its longest text, measured once (and again when the fonts arrive or the screen turns)
function sceDescFit(){if(!SCE.el)return;const D=SCE.el.querySelector('.sceDesc'),keep=SCE.step;D.style.minHeight='0px';let mx=0;
  for(const id of SCE_IDS){sceHeroText(id);mx=Math.max(mx,D.offsetHeight)}for(const m of SCE_MANTI){sceMantoText(m.id);mx=Math.max(mx,D.offsetHeight)}
  for(const g of SCE_GIFTS){sceGiftText(g.id);mx=Math.max(mx,D.offsetHeight)}
  SCE.step=4;const gk=SCE.gift;if(!SCE.gift)SCE.gift=SCE_GIFTS[4].id;sceSummary();mx=Math.max(mx,D.offsetHeight);SCE.gift=gk;SCE.step=keep;
  sceText();D.style.minHeight=Math.ceil(mx)+'px'}
// picking a hero: the old one sinks into the dark, the new one comes up into the light
function scePick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==1||!HERO_BY[id])return;const t=sceT();
  if(!quiet){initAudio();sceSnd(sceFree(id)?'move':'lock')}
  if(SCE.sel===id){if(SCE.hero&&t-SCE.hero.act>1.6)SCE.hero.act=t;return}
  if(SCE.hero)SCE.prev={...SCE.hero,t0:t};
  SCE.sel=id;SCE.hero={id,act:-1,in:t,anim:'idle',bl:null,lastA:null,shot:false};
  for(let i=0;i<(LOWFX||SCE.low?6:14);i++)sceEmber(SCE_INFO[id].rgb,true);
  sceMark(id);sceHeroText(id)}
// a mantle: the cloth takes the colour in a flash of light
function sceMantoPick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==2||!SCE_MANTO[id])return;if(!quiet){initAudio();sceSnd('move')}
  if(SCE.manto!==id){SCE.manto=id;SCE.pulse=sceT();const m=SCE_MANTO[id],rgb=m.hood?rgbStr(m.hood):SCE_INFO[SCE.sel].rgb;for(let i=0;i<(LOWFX||SCE.low?6:16);i++)sceEmber(rgb,true)}
  sceMark(id);sceMantoText(id)}
const rgbStr=h=>{const n=parseInt(h.slice(1),16);return`${n>>16&255},${n>>8&255},${n&255}`};
function sceGiftPick(id,quiet){if(SCE.done||!SCE.on||SCE.step!==3||!SCE_GIFT[id])return;const t=sceT();
  if(!quiet){initAudio();sceSnd('move')}
  if(SCE.gift===id){if(SCE.gcur)SCE.gcur.pop=t;return}
  if(SCE.gcur)SCE.gprev={...SCE.gcur,t0:t};
  SCE.gift=id;SCE.gcur={id,t0:t,pop:t};for(let i=0;i<(LOWFX||SCE.low?5:12);i++)sceEmber(SCE_GIFT[id].rgb,true,true);
  sceMark(id);sceGiftText(id)}
// from one step to another: the title, the marks over the steps, the columns; the hero leaves the stone to the gift and comes back
function sceToStep(n){if(SCE.done||!SCE.on||n===SCE.step||n<1||n>4)return;if(n>1&&!sceFree(SCE.sel))return;const from=SCE.step,t=sceT();SCE.step=n;SCE.el.className='s'+n;
  SCE.el.querySelector('#sceTitle').textContent=SCE_STEPS[n-1].t;SCE.el.querySelectorAll('.sceSteps li').forEach((li,i)=>{li.classList.toggle('on',i===n-1);li.classList.toggle('ok',i<n-1)});
  if(n===3){if(!SCE.gift)SCE.gift=SCE_GIFTS[0].id;SCE.mode='gift';SCE.modeT=t;SCE.gcur={id:SCE.gift,t0:t+.18,pop:t+.18};SCE.gprev=null}
  else if(from===3){SCE.mode='hero';SCE.modeT=t;if(SCE.gcur)SCE.gprev={...SCE.gcur,t0:t,into:n===4};SCE.gcur=null;if(SCE.hero){SCE.hero.in=t+.12}
    if(n===4){for(let i=0;i<(LOWFX||SCE.low?10:24);i++)sceEmber(SCE_GIFT[SCE.gift].rgb,true);SCE.pulse=t+.25;sceSnd('absorb')}}
  sceList();sceText();if(n===4){const i=SCE.el.querySelector('#sceNameIn');if(i.value!==SCE.name)i.value=SCE.name}}
function sceGo(){if(SCE.done||!SCE.on)return;initAudio();
  if(SCE.step===1&&!sceFree(SCE.sel)){sceSnd('lock');const b=SCE.el.querySelector('.sceGo');b.classList.remove('sceNo');void b.offsetWidth;b.classList.add('sceNo');if(SCE.hero)SCE.hero.no=sceT();return}
  if(SCE.step<4){sceSnd('ok');sceToStep(SCE.step+1);return}
  sceFinish()}
function sceBack(){if(SCE.done||!SCE.on||SCE.step<2)return;sceSnd('back');const a=document.activeElement;if(a&&a.id==='sceNameIn')a.blur();sceToStep(SCE.step-1)}
// the end: he shoots into the sky, «Il viaggio ha inizio» with his name, the menu
function sceFinish(){if(SCE.done||!SCE.on||!sceFree(SCE.sel)||!SCE.gift)return;const inp=SCE.el.querySelector('#sceNameIn');
  SCE.name=sceClean(inp?inp.value:SCE.name)||SCE.name||sceRandName();if(inp){inp.value=SCE.name;inp.blur()}
  SCE.done=true;const id=SCE.sel,g=SCE_GIFT[SCE.gift],t=sceT();
  // the choice: the hero picked is the one you own and play; the other one of the first two is for sale in the hero tab
  const hs={};for(const k in SAVE.heroes||{})if(!sceFree(k))hs[k]=SAVE.heroes[k];hs[id]=1;
  sceOwnSkins();SAVE.starter=id;SAVE.hero=id;SAVE.heroes=hs;SAVE.dono=g.id;SAVE.pname=SCE.name;SAVE.skin=SCE.manto||null;try{g.give()}catch(e){}heroView=id;heroConfirm=null;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(e){}
  if(INTRO.on&&INTRO.snap){try{const s=JSON.parse(INTRO.snap);for(const k of['starter','hero','heroes','dono','pname','skin','skins','gold','gems','slots','items','eq','piuma'])s[k]=SAVE[k];INTRO.snap=JSON.stringify(s)}catch(e){}}
  SCE.fin={t0:t};SCE.el.classList.add('fin');SCE.el.querySelector('.sceBand small').textContent=SCE.name;sceSnd('ok');if(SCE.hero)SCE.hero.act=t+.2;
  for(let i=0;i<(LOWFX||SCE.low?8:20);i++)sceEmber(SCE_INFO[id].rgb,true);
  setTimeout(()=>{if(SCE.el){SCE.el.classList.add('band');sceSnd('band')}},1350);
  setTimeout(()=>{if(SCE.el)SCE.el.classList.add('go')},3700);
  setTimeout(()=>sceDone(g),4250)}
function sceDone(g){if(!SCE.on)return;sceClose(true);playMusic('menu');
  try{if(!INTRO.on){renderGold();renderPlay();renderWho();renderTop.k=null;renderTop()}}catch(e){}
  setTimeout(()=>{try{if(!INTRO.on)toast(`Dono: ${g.n}${g.id==='oro'?' (+500 oro)':g.id==='cristalli'?' (+30 cristalli)':g.id==='cassa'?' (tra le tue casse)':''}`)}catch(e){}},700)}
// keys: up and down (or left and right, W/S, A/D) move in the list, Enter or Space go on, Esc goes back; while writing the name only
// Enter (done) and Esc count
addEventListener('resize',()=>{if(SCE.on)setTimeout(sceDescFit,60)});
addEventListener('keydown',e=>{if(!SCE.on)return;e.stopImmediatePropagation();
  if(e.target&&e.target.id==='sceNameIn'){if(e.key==='Enter'){e.preventDefault();e.target.blur();sceGo()}else if(e.key==='Escape'){e.preventDefault();e.target.blur()}return}
  if(SCE.done){e.preventDefault();return}
  const s=SCE.step,ids=s===1?SCE_IDS:s===2?SCE_MANTI.map(m=>m.id):s===3?SCE_GIFTS.map(g=>g.id):[],cur=s===1?SCE.sel:s===2?SCE.manto:SCE.gift,i=Math.max(0,ids.indexOf(cur)),c=e.code;
  const mv=d=>{e.preventDefault();if(!ids.length)return;const j=Math.max(0,Math.min(ids.length-1,i+d));if(s===1)scePick(ids[j]);else if(s===2)sceMantoPick(ids[j]);else sceGiftPick(ids[j])};
  if(c==='ArrowUp'||c==='KeyW'||c==='ArrowLeft'||c==='KeyA')mv(-1);
  else if(c==='ArrowDown'||c==='KeyS'||c==='ArrowRight'||c==='KeyD')mv(1);
  else if(c==='Enter'||c==='Space'||c==='NumpadEnter'){e.preventDefault();sceGo()}
  else if(c==='Escape'||c==='Backspace'){e.preventDefault();sceBack()}},true);
// the finger on the hero: drag sideways to turn him, a tap makes him show what he can do
function sceStageInput(st){
  st.addEventListener('pointerdown',e=>{if(SCE.done)return;initAudio();SCE.drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,t:performance.now(),t0:performance.now(),moved:false};try{st.setPointerCapture(e.pointerId)}catch(_){}});
  st.addEventListener('pointermove',e=>{const d=SCE.drag;if(!d||d.id!==e.pointerId)return;const now=performance.now(),dx=e.clientX-d.x;d.x=e.clientX;
    if(Math.abs(e.clientX-d.x0)>7||Math.abs(e.clientY-d.y0)>7)d.moved=true;const a=-dx*.0135;SCE.yaw+=a;const dt=Math.max(.008,(now-d.t)/1000);SCE.vel=a/dt;d.t=now});
  const up=e=>{const d=SCE.drag;if(!d||d.id!==e.pointerId)return;SCE.drag=null;if(performance.now()-d.t>120)SCE.vel=0;
    if(!d.moved&&performance.now()-d.t0<420){if(SCE.mode==='hero'&&SCE.hero){if(sceT()-SCE.hero.act>1.6)SCE.hero.act=sceT()}else if(SCE.gcur)SCE.gcur.pop=sceT()}};
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up)}

// ------------------------------------------------------------------ sounds and music (the game's own instruments)
function sceSnd(k){if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.005;AU.pan=0;try{
  if(k==='move'){fNoise(t,.11,'bandpass',VR(1500,.06),1.2,.05,{att:.012,f2:2300});vBell(null,t+.01,[79,81,83,86][randi(0,3)],.7,.007)}
  else if(k==='back'){fNoise(t,.1,'bandpass',900,1.1,.05,{att:.01,f2:620})}
  else if(k==='lock'){M.metal(t,.22,VR(700,.05),.35);M.metal(t+.07,.16,VR(560,.05),.3);fThump(t,190,90,.07,.12)}
  else if(k==='ok'){fThump(t,130,46,.6,.34,.4);fNoise(t,.5,'lowpass',420,.7,.12,{brown:true,att:.02,rev:.6});vBell(null,t+.02,62,2.6,.03);vBell(null,t+.03,74,2.2,.018)}
  else if(k==='band'){fThump(t,90,36,1.2,.4,.6);vChoir(null,t,[50,57,62,66],3.2,.07);vBell(null,t+.05,74,4,.03);vBell(null,t+.06,81,3.5,.016);fNoise(t,1.6,'lowpass',260,.7,.1,{brown:true,att:.3,rev:.7})}
  else if(k==='absorb'){whoosh(t,.45,500,2400,.16,.3);vBell(null,t+.36,86,1.4,.02);vBell(null,t+.4,93,1.2,.012)}}catch(e){}}
// slow, warm and a little solemn: D minor, a pad that breathes, a low harp, a choir now and then, a bell, the crackle of a fire
TRACKS.scelta={bpm:54,ch:[[50,53,57],[46,50,53],[53,57,60],[48,52,55]],
  play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%8,C=this.ch[bar%4];
    if(s===0){vPad(tr,t,C,spb*16,.1,650);vBass(tr,t,C[0]-12,spb*15,.15)}
    if(s===0&&(bar===2||bar===6))vChoir(tr,t,[C[0]+12,C[2]+12],spb*16,.045);
    if(s%4===0)vHarp(tr,t,C[(s/4)%3]+12+(s===12?12:0),spb*5,.032);
    if(s===10&&bar%2===1)vHarp(tr,t,C[2]+24,spb*4,.018);
    if(bar===7&&s===8)vBell(tr,t,C[0]+24,3,.022);
    if(AU.on.sfx&&Math.random()<.22)try{fNoise(t+Math.random()*spb,.012,'highpass',2400+Math.random()*2200,.7,.012+Math.random()*.022)}catch(e){}}};
{const _pm=playMusic;playMusic=function(name){if((SCE.on||SCE.wait)&&name==='menu')name='scelta';return _pm.call(this,name)}}

// ------------------------------------------------------------------ the heroes: poses and blends
// every change of move starts from the pose drawn last and slides into the new one, so nothing jumps
const SCE_K=['B','lean','roll','s','sx','hd','hy','hp','grip','aim','up','hR','fL','fR','draw','nock','squint','jig','sway'];
function sceSnap(A){const o={};for(const k of SCE_K){const v=A[k];o[k]=Array.isArray(v)?v.slice():v}return o}
const sceNrm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
function sceMix(A,F,k){for(const n of SCE_K){const a=A[n],b=F[n];if(a==null||b==null)continue;if(Array.isArray(a))A[n]=a.map((v,i)=>v+(b[i]-v)*k);else if(typeof a==='number')A[n]=a+(b-a)*k}
  if(A.aim)A.aim=sceNrm(A.aim);if(A.up)A.up=sceNrm(A.up)}
// the bow raised towards the sky: bow, string and string hand turn together round the shoulder; on the way up the bow also stands
// upright (k: 0..1), so from the side you see its whole curve, and the whole thing rises a little above the face
function sceTilt(A,f,k){if(!f)return;const c=Math.cos(f),s=Math.sin(f),o=[4,0,13],rot=v=>[v[0]*c-v[2]*s,v[1],v[0]*s+v[2]*c],lift=(SCE.lift||0)*k,
  rp=v=>{const d=rot([v[0]-o[0],v[1]-o[1],v[2]-o[2]]);return[d[0]+o[0],d[1]+o[1],d[2]+o[2]+lift]};A.grip=rp(A.grip);A.hR=rp(A.hR);A.aim=rot(A.aim);A.up=rot(A.up);
  const a=A.aim,u=sceNrm([-a[0]*a[2],-a[1]*a[2],1-a[2]*a[2]]);A.up=sceNrm(A.up.map((v,i)=>v+(u[i]-v)*k*(SCE.cant==null?1:SCE.cant)))}
const sceEz=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
const sceBow=id=>id==='arciere'||id==='cacciatrice';
// what the hero does now: T is the time since you tapped him. The archers jump, raise the bow to the sky and shoot; the Balestriere
// fires a bolt and reloads; the Druida swings his staff and throws his leaves
function sceMove(H,t){const T=H.act>=0&&t>=H.act?t-H.act:1e9,TILT=SCE.tilt;
  const M={anim:'idle',p:((t/2.6)%1+1)%1,pull:0,tilt:0,hop:0,sq:0,squint:null,show:0};
  if(sceBow(H.id)){if(T<.28){const k=T/.28;Object.assign(M,{anim:'aim',p:0,tilt:TILT*sceEz(k),hop:3.6*Math.sin(k*Math.PI),sq:k<.2?-.05*Math.sin(k/.2*Math.PI):0,show:sceEz(k*1.4)})}
    else if(T<.82){const k=(T-.28)/.42;Object.assign(M,{anim:'aim',p:0,pull:sceEz(Math.min(1,k)),tilt:TILT,squint:.25+.35*Math.min(1,k),show:1,sq:T<.36?.06*Math.sin((T-.28)/.08*Math.PI):0})}
    else if(T<1.34){const k=(T-.82)/.52;Object.assign(M,{anim:'shoot',p:.5+.5*Math.min(1,k),tilt:TILT,show:1})}
    else if(T<1.9)M.show=1-sceEz((T-1.34)/.56)}
  else{const D=H.id==='balestriere'?1.5:1.35;if(T<D){Object.assign(M,{anim:'shoot',p:T/D,show:sceEz(Math.min(1,T/.25))})}else if(T<D+.5)M.show=1-sceEz((T-D)/.5)}
  return M}
// a hero at the stage's point, through the hero layer (fading, the darkening of the locked ones and the light from above)
function sceHeroAt(H,t,dt,X,Y,k,alpha,dark,light){const M=sceMove(H,t),id=H.id,I=SCE_INFO[id];
  if(M.anim==='shoot'&&!H.shot){H.shot=true;if(sceBow(id))sfx('bow',I.twang);else if(id==='balestriere')sfx('bow','balestra');else sfx('summon');for(let i=0;i<(LOWFX||SCE.low?3:7);i++)sceEmber(I.rgb,true)}
  if(M.anim==='idle'&&H.shot&&t-H.act>2)H.shot=false;
  if(M.anim!==H.anim){if(H.lastA&&!(H.anim==='aim'&&M.anim==='shoot'))H.bl={A:H.lastA,t0:t,d:M.anim==='idle'?.32:.24};H.anim=M.anim}
  // the face: the turntable (SCE.yaw), and during the show three quarters towards us so the shot is seen
  const show=sceBow(id)?Math.PI/2+.95:Math.PI/2+.55;let d=show-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));let face=SCE.yaw+d*M.show;
  if(H.no!=null&&t-H.no<.4)face+=.12*Math.sin((t-H.no)*40)*(1-(t-H.no)/.4);
  const style=sceStyle(id);
  const draw=()=>EROE.arciere(X,Y,face,M.anim,M.p,k,{style,moss:2,pull:M.pull,tweak:A=>{
    if(M.tilt)sceTilt(A,M.tilt,M.tilt/SCE.tilt);
    if(H.bl){const w=sceEz((t-H.bl.t0)/H.bl.d);if(w>=1)H.bl=null;else{sceMix(A,H.bl.A,1-w);if(M.anim!=='idle'&&w<.9)A.pinch=false}}
    if(M.hop||M.sq){A.B=[A.B[0],A.B[1],A.B[2]+M.hop];A.s=(A.s||0)+M.sq}
    if(M.squint!=null)A.squint=Math.max(A.squint||0,M.squint);
    H.lastA=sceSnap(A)}});
  // standing still he fits a smaller box (the Balestriere's crossbow, the Druida's antlers); moving, the bow raised to the sky
  sceLayer(X,Y,k,draw,alpha,dark,light,M.anim==='idle'&&!M.show&&!H.bl?SCE_BOX:null)}
const SCE_BOX=[27,53,9];
// a canvas kept for the layers, grown when needed
function sceCan(n,w,h){let c=SCE.can[n];if(!c)c=SCE.can[n]=document.createElement('canvas');if(c.width<w)c.width=w;if(c.height<h)c.height=h;return c}
// the layer: a box round the figure (in device pixels), cleared, drawn, darkened if asked, then laid on the canvas. light (0..1): the hard
// light from above of Dark Souls: the feet go into the shade, the top gets warm light and a bright edge where the light hits
function sceLayer(X,Y,k,draw,alpha,dark,light,bx){const m=ctx.getTransform(),dp=m.a,low=LOWFX||SCE.low;
  if(alpha<=.004)return;if(alpha>=.995&&!dark&&!light){draw();return}
  bx=bx||[29,71,10];const L=X-bx[0]*k,T=Y-bx[1]*k,R=X+bx[0]*k,B=Y+bx[2]*k,x0=Math.floor(L*dp+m.e),y0=Math.floor(T*dp+m.f),w=Math.ceil((R-L)*dp)+2,h=Math.ceil((B-T)*dp)+2;
  const c=sceCan('lay',w,h),g=c.getContext('2d'),saved=ctx;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,h);g.setTransform(dp,0,0,dp,m.e-x0,m.f-y0);
  ctx=g;try{draw()}finally{ctx=saved}
  g.setTransform(1,0,0,1,0,0);
  const yy=v=>v*dp+m.f-y0;
  // the shade: only the lower part of the box (the legs and the feet)
  if(light){const y1=Math.max(0,Math.floor(yy(Y-26*k)));g.globalCompositeOperation='source-atop';const gr=g.createLinearGradient(0,y1,0,yy(Y+3*k));gr.addColorStop(0,'rgba(6,5,10,0)');gr.addColorStop(1,`rgba(6,5,10,${(.55*light).toFixed(3)})`);g.fillStyle=gr;g.fillRect(0,y1,w,h-y1)}
  if(dark){g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(${dark[0]},${dark[1]})`;g.fillRect(0,0,w,h)}
  g.globalCompositeOperation='source-over';
  ctx.save();ctx.setTransform(1,0,0,1,0,0);const a0=Math.min(1,alpha);ctx.globalAlpha=a0;ctx.drawImage(c,0,0,w,h,x0,y0,w,h);
  if(light&&!low){// the light passes at half size (they are soft): a second layer masked by the figure
    const hw=Math.ceil(w/2),hh=Math.ceil(h/2),c2=sceCan('lit',hw,hh),q=c2.getContext('2d'),cx=(X*dp+m.e-x0)/2,cy=yy(Y-60*k)/2;q.setTransform(1,0,0,1,0,0);
    // the warm light on the head and the shoulders, only on him (the top 60% of the box)
    const th=Math.ceil(hh*.62);q.globalCompositeOperation='copy';q.drawImage(c,0,0,w,th*2,0,0,hw,th);q.globalCompositeOperation='source-in';const rg=q.createRadialGradient(cx,cy,0,cx,cy,18*k*dp);
    rg.addColorStop(0,'rgba(255,236,200,.55)');rg.addColorStop(.5,'rgba(255,226,186,.2)');rg.addColorStop(1,'rgba(255,220,180,0)');q.fillStyle=rg;q.fillRect(0,0,hw,th);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a0*light*.6;ctx.drawImage(c2,0,0,hw,th,x0,y0,w,th*2);
    // the bright edge: what has nothing over it (the figure moved down a little and cut away), stronger near the top
    const s=Math.max(1,Math.round(.15*k*dp));q.globalCompositeOperation='copy';q.drawImage(c,0,0,w,h,0,0,hw,hh);q.globalCompositeOperation='destination-out';q.drawImage(c,0,0,w,h,0,s,hw,hh);
    q.globalCompositeOperation='source-in';const eg=q.createLinearGradient(0,yy(Y-64*k)/2,0,yy(Y-4*k)/2);eg.addColorStop(0,'rgba(255,240,205,1)');eg.addColorStop(1,'rgba(255,214,160,.25)');q.fillStyle=eg;q.fillRect(0,0,hw,hh);
    ctx.globalAlpha=a0*light*.75;ctx.drawImage(c2,0,0,hw,hh,x0,y0,w,hh*2)}
  ctx.restore()}

// ------------------------------------------------------------------ the gifts in 3D (the C3 toolkit of the 3D monsters, painted like them:
// three soft tones, the thick dark outline, the warm rim). Each one turns with `face`; (0, 0) is the point under it, z up
const SCE_G3={
  // a sack of rough cloth tied with a rope, coins peeping out of the top, two coins flying round it
  oro(V0,t,C){const{vol,revo,IDF,surfLine}=C,orb=[0,1].map(i=>{const a=t*1.1+i*Math.PI;return{c:[Math.cos(a)*12.5,Math.sin(a)*12.5,8+3*Math.sin(t*1.6+i*2)],a}}),dc=V0.D(0,0,8);
    const coin=(c,n,r)=>{n=C.nrm(n);const back=C.add(c,C.mul(n,-.8));ctx.lineJoin='round';C.disc3(V0,back,n,r);ctx.fillStyle='#b5620a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
      const pts=C.disc3(V0,c,n,r),b=C.bbox(pts);ctx.fillStyle=C.soft(b[0]+(b[2]-b[0])*.3,b[1]+(b[3]-b[1])*.3,(b[0]+b[2])/2,(b[1]+b[3])/2,Math.max(b[2]-b[0],b[3]-b[1])*.7,'#f5b82a',.45,.25);ctx.fill();ctx.stroke();
      if(V0.F(n)>.15){C.disc3(V0,c,n,r*.6);ctx.strokeStyle='rgba(176,96,8,.8)';ctx.lineWidth=.9;ctx.stroke();const q=V0.P(C.add(c,C.mul(n,.1)));ctx.fillStyle='rgba(255,250,215,.85)';ctx.beginPath();ctx.arc(q[0]-r*.32,q[1]-r*.3,r*.2,0,C.TAU);ctx.fill()}};
    const toUs=w=>C.nrm([V0.s+w[0],V0.c+w[1],.55+w[2]]);
    for(const o of orb)if(V0.D(o.c)<dc)coin(o.c,toUs([.5*Math.cos(o.a*2),.5*Math.sin(o.a*2),.2]),2.9);
    const B=[[0,5.2],[1.4,7.6],[3.8,9.3],[6.8,9.4],[9.6,7.8],[12,5.4],[13.3,4.3]];vol(V0,revo(B,1,IDF,0,20),'#c99a5c',{kl:.22,kd:.36});
    // folds of the cloth, the patch
    const rAt=z=>{for(let i=1;i<B.length;i++)if(z<=B[i][0])return C.lerp(B[i-1][1],B[i][1],(z-B[i-1][0])/(B[i][0]-B[i-1][0]));return B[B.length-1][1]};
    for(const a0 of[-.7,.15,.9,1.8,2.7,3.6,4.6,5.5])surfLine(V0,IDF,k=>{const z=13-k*7,r=rAt(z)+.05,a=a0+k*.25;return{p:[Math.cos(a)*r,Math.sin(a)*r,z],n:[Math.cos(a),Math.sin(a),.2]}},'rgba(92,60,28,.4)',1,true);
    C.spot(V0,[Math.cos(2.2)*9.35,Math.sin(2.2)*9.35,6],[Math.cos(2.2),Math.sin(2.2),0],2.6,'#a87a44',{lw:1,N:4});
    // the cloth above the rope, gathered and open at the top, with the coins inside
    const T=[[13.2,3.9],[14.6,4.9],[16.3,5.8],[17,5.5]];vol(V0,revo(T,1,IDF,0,16),'#b98a4e',{kl:.2,kd:.3});
    if(V0.F(0,0,1)>0){C.disc3(V0,[0,0,16.9],[0,0,1],4.7);ctx.fillStyle='#3a2410';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
      for(const[x,y,z,nx,ny] of[[-1.7,-1.3,17.7,-.3,-.4],[1.6,.9,18.1,.4,.2],[.2,2,17.5,.1,.6],[-.3,-.2,19.1,.15,-.1]])coin([x,y,z],C.add([nx,ny,1],C.mul(toUs([0,0,0]),.6)),2.7)}
    surfLine(V0,IDF,a=>({p:[Math.cos(a)*4.5,Math.sin(a)*4.5,13.4],n:[Math.cos(a),Math.sin(a),0]}),'#8a5a2b',1.7,false,null,true);
    const kn=[Math.cos(.5)*4.8,Math.sin(.5)*4.8,13.4];if(V0.F(Math.cos(.5),Math.sin(.5),0)>0){C.caps(V0,kn,1.15,C.add(kn,[.8,.6,-4.2]),.9,'#9a6834',{lw:1.2});C.caps(V0,kn,1.15,C.add(kn,[1.2,-.8,-3.4]),.9,'#8a5a2b',{lw:1.2});C.sball(V0,kn,1.8,'#9a6834',{lw:1.3})}
    for(const o of orb)if(V0.D(o.c)>=dc)coin(o.c,toUs([.5*Math.cos(o.a*2),.5*Math.sin(o.a*2),.2]),2.9)},
  // a cluster of crystals growing from a dark stone, light inside
  cristalli(V0,t,C){const{vol}=C;vol(V0,C.ellPts([0,0,1.8],[9,8.5,3],null,4,14),'#57504a',{kl:.16,kd:.42});
    const X=[{b:[0,0,2.5],d:[0,0,1],h:15,r:3.3},{b:[3.4,3,2],d:[.35,.3,1],h:9,r:2.4},{b:[-3.1,2.6,2],d:[-.38,.3,1],h:7.5,r:2.1},{b:[2.2,-3.5,2],d:[.3,-.42,1],h:8.5,r:2.2},{b:[-2.8,-2.9,1.8],d:[-.35,-.35,1],h:5.5,r:1.8}];
    const draw=x=>{const w=C.nrm(x.d);let u=C.cross(w,[0,1,0]);if(C.len(u)<.2)u=C.cross(w,[1,0,0]);u=C.nrm(u);const v=C.cross(w,u),pts=[],hex=[],top=[];
      for(let i=0;i<6;i++){const a=i/6*C.TAU+.3,o=C.add(C.mul(u,Math.cos(a)*x.r),C.mul(v,Math.sin(a)*x.r)),p0=C.add(x.b,o),p1=C.add(p0,C.mul(w,x.h));pts.push(p0,p1);hex.push(p0);top.push(p1)}
      const ap=C.add(x.b,C.mul(w,x.h+x.r*1.5));pts.push(ap);
      const hull=C.chull(pts.map(q=>V0.P(q))),bb=C.bbox(hull),g=ctx.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);g.addColorStop(0,'#e9fdff');g.addColorStop(.42,'#62d2f2');g.addColorStop(1,'#5a46c8');
      vol(V0,pts,'#5fd0f0',{fill:g,lw:2.2,rim:.45});
      // the edge nearest to us, lit, and the facets of the tip
      let bi=0,bd=-1e9;for(let i=0;i<6;i++){const dd=V0.D(hex[i]);if(dd>bd){bd=dd;bi=i}}
      const e0=V0.P(hex[bi]),e1=V0.P(top[bi]),e2=V0.P(ap);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(e0[0],e0[1]);ctx.lineTo(e1[0],e1[1]);ctx.lineTo(e2[0],e2[1]);ctx.stroke();
      const n1=V0.P(top[(bi+1)%6]),n5=V0.P(top[(bi+5)%6]);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(n1[0],n1[1]);ctx.lineTo(e1[0],e1[1]);ctx.lineTo(n5[0],n5[1]);ctx.stroke()};
    X.slice().sort((a,b)=>V0.D(a.b)-V0.D(b.b)).forEach(draw);
    const c=V0.P(0,0,9);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';C.shine('110,215,255',c[0],c[1],15,.3+.08*Math.sin(t*2.3));ctx.restore()}
    const tw=(t*.8)%1;if(tw<.25){const q=V0.P(0,0,20.5);C.starS(q[0]+1,q[1],2.4*Math.sin(tw/.25*Math.PI),1)}},
  // the silver chest of the game (its colours), the lid lifting a little now and then with light spilling out
  cassa(V0,t,C){const{vol}=C,c=CHC.argento,ph=(t%4.4)/4.4,th=ph>.6&&ph<.95?.34*Math.sin((ph-.6)/.35*Math.PI):0;
    const box=(x0,x1,y0,y1,z0,z1)=>[[x0,y0,z0],[x1,y0,z0],[x0,y1,z0],[x1,y1,z0],[x0,y0,z1],[x1,y0,z1],[x0,y1,z1],[x1,y1,z1]];
    const rot=q=>{const dx=q[0]+6,dz=q[2]-10,cc=Math.cos(th),s=Math.sin(th);return[-6+dx*cc-dz*s,q[1],10+dx*s+dz*cc]};
    const lidPts=(r,y0,y1)=>{const o=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI;for(const y of[y0,y1])o.push(rot([Math.cos(a)*r,y,10+Math.sin(a)*r]))}return o};
    // a strip on a flat face (only when the face looks at us)
    const strip=(pts,n,col)=>{if(V0.F(n)<=.02)return;const s=pts.map(q=>V0.P(q));C.poly(s);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke()};
    vol(V0,box(-6,6,-9,9,0,10),c.body,{kl:.26,kd:.4});
    // the four sides: the ones turned away from the light a little darker, every edge drawn
    const o0=V0.P(0,0,0),shade=n=>{const q=V0.P(n);return Math.max(0,Math.min(.3,(q[0]-o0[0])*.32+.06))};
    for(const[n,f] of[[[1,0,0],[[6,-9,0],[6,9,0],[6,9,10],[6,-9,10]]],[[-1,0,0],[[-6,-9,0],[-6,9,0],[-6,9,10],[-6,-9,10]]],[[0,1,0],[[-6,9,0],[6,9,0],[6,9,10],[-6,9,10]]],[[0,-1,0],[[-6,-9,0],[6,-9,0],[6,-9,10],[-6,-9,10]]]])
      strip(f,n,`rgba(10,14,20,${shade(n).toFixed(3)})`);
    for(const y of[-5.4,5.4]){strip([[6.02,y-1.1,0],[6.02,y+1.1,0],[6.02,y+1.1,10],[6.02,y-1.1,10]],[1,0,0],c.band);strip([[-6.02,y-1.1,0],[-6.02,y+1.1,0],[-6.02,y+1.1,10],[-6.02,y-1.1,10]],[-1,0,0],c.band)}
    if(th>.03){const q=V0.P(rot([6,0,10.6]));if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';C.shine('255,230,150',q[0],q[1],14,.55*th/.34);ctx.restore()}}
    vol(V0,lidPts(6,-9,9),c.dark,{kl:.24,kd:.38});
    // the bands over the lid, on the part that faces us
    for(const y of[-5.4,5.4]){const seg=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI;seg.push({a,v:V0.F([Math.cos(a+th),0,Math.sin(a+th)])})}
      const vis=seg.filter(s=>s.v>.02);if(vis.length<2)continue;const A=[],Bk=[];for(const s of vis){A.push(V0.P(rot([Math.cos(s.a)*6.08,y-1.1,10+Math.sin(s.a)*6.08])));Bk.push(V0.P(rot([Math.cos(s.a)*6.08,y+1.1,10+Math.sin(s.a)*6.08])))}
      C.poly(A.concat(Bk.reverse()));ctx.fillStyle=c.band;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke()}
    // the lock on the front, under the lid
    if(V0.F(1,0,0)>.05){strip([[6.05,-1.9,5.2],[6.05,1.9,5.2],[6.05,1.9,9.6],[6.05,-1.9,9.6]],[1,0,0],'#c9d3dc');const q=V0.P(6.1,0,7.6);ctx.fillStyle=c.lock;ctx.beginPath();ctx.arc(q[0],q[1],1.25,0,C.TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(q[0]-.6,q[1]-.7,.5,.5)}},
  // the falcon ring: a silver ring standing up, a blue stone in its setting
  anello(V0,t,C){const R0=6.4,cz=10.5,n=C.nrm([1,0,.35]),u=[0,1,0],v=C.nrm(C.cross(n,u)),N=30,pts=[];
    for(let i=0;i<=N;i++){const a=i/N*C.TAU;pts.push(C.add([0,0,cz],C.add(C.mul(u,Math.cos(a)*R0),C.mul(v,Math.sin(a)*R0))))}
    const dc=V0.D(0,0,cz),back=[],front=[];for(let i=0;i<N;i++){const m=C.lerp3(pts[i],pts[i+1],.5);(V0.D(m)<dc?back:front).push(i)}
    const run=ids=>{if(!ids.length)return;// consecutive pieces as one chain each
      const groups=[];let g=[ids[0]];for(let j=1;j<ids.length;j++){if(ids[j]===ids[j-1]+1)g.push(ids[j]);else{groups.push(g);g=[ids[j]]}}groups.push(g);
      if(groups.length>1&&groups[0][0]===0&&groups[groups.length-1][groups[groups.length-1].length-1]===N-1){const l=groups.pop();groups[0]=l.concat(groups[0])}
      for(const gr of groups){const P3=gr.map(i=>pts[i]);P3.push(pts[(gr[gr.length-1]+1)%N]);C.chain(V0,P3,P3.map(()=>1.55),'#c9cfd6',{kl:.4,kd:.42,lw:2})}};
    run(back);run(front);
    const top=C.add([0,0,cz],C.mul(v,R0+1.2));C.sball(V0,top,2.9,'#aeb6c0',{lw:1.8,kl:.35,kd:.4});
    for(const a of[0,1.57,3.14,4.71]){const q=C.add(top,C.add(C.mul(u,Math.cos(a)*2.2),C.mul(n,Math.sin(a)*2.2)));if(V0.F(C.sub(q,top))>-.2){const s=V0.P(q);ctx.fillStyle='#dfe4ea';ctx.beginPath();ctx.arc(s[0],s[1],.8,0,C.TAU);ctx.fill()}}
    const g=C.add(top,C.mul(v,.9)),q=V0.P(g);C.sball(V0,g,2.3,'#4d97ff',{lw:1.4,kl:.55,kd:.45});
    ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(q[0]-.8,q[1]-.9,.7,0,C.TAU);ctx.fill();
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';C.shine('110,165,255',q[0],q[1],9,.35+.1*Math.sin(t*3));ctx.restore()}
    const tw=(t*.7+.4)%1;if(tw<.22)C.starS(q[0]+2,q[1]-2,2.2*Math.sin(tw/.22*Math.PI),1)},
  // the phoenix feather: red, orange and gold, the shaft, the barbs, little flames at the tip
  piuma(V0,t,C){const L=27,d=C.nrm([.22,0,1]),s=[0,1,0],n=C.nrm(C.cross(d,s)),b0=[-2.2,0,1.5],bend=.28+.03*Math.sin(t*1.7);
    const at=(k,w)=>C.add(C.add(C.add(b0,C.mul(d,k*L)),C.mul(s,w)),C.mul(n,bend*k*k*L*.4));
    const wid=k=>k<.16?0:(k<.5?Math.sin((k-.16)/.34*Math.PI/2):Math.sqrt(Math.max(0,1-Math.pow((k-.5)/.5,2.2))))*5.4;
    const left=[],right=[];for(let i=0;i<=24;i++){const k=.16+i/24*.84,nt=i%3===1?.82:1;left.push(at(k,wid(k)*nt));right.push(at(k,-wid(k)*.82*(i%3===2?.86:1)))}
    const face=V0.F(n),vane=left.concat(right.reverse()).map(q=>V0.P(q));
    const g=ctx.createLinearGradient(...V0.P(at(.16,0)),...V0.P(at(1,0)));
    if(face>=0){g.addColorStop(0,'#ffe07a');g.addColorStop(.35,'#ff9a3a');g.addColorStop(.75,'#ff5a2e');g.addColorStop(1,'#d63228')}else{g.addColorStop(0,'#f2b04a');g.addColorStop(.4,'#e5702c');g.addColorStop(1,'#a8261e')}
    if(!LOWFX){const q=V0.P(at(.75,0));ctx.save();ctx.globalCompositeOperation='lighter';C.shine('255,140,60',q[0],q[1],16,.32+.08*Math.sin(t*5));ctx.restore()}
    ctx.lineJoin='round';C.poly(vane);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
    // the barbs, inside the vane
    ctx.save();C.poly(vane);ctx.clip();ctx.strokeStyle=face>=0?'rgba(150,40,10,.38)':'rgba(90,20,10,.4)';ctx.lineWidth=.8;ctx.beginPath();
    for(let k=.2;k<.97;k+=.06)for(const sd of[1,-1]){const a=V0.P(at(k,0)),b=V0.P(at(Math.min(1,k+.09),sd*wid(k)*1.05));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();
    const hi=V0.P(at(.4,wid(.4)*.5));ctx.fillStyle='rgba(255,240,190,.25)';ctx.beginPath();ctx.ellipse(hi[0],hi[1],2.4,4.6,-.3,0,C.TAU);ctx.fill();ctx.restore();
    // the shaft: bare at the bottom, pale gold along the vane
    const sh=[];for(let i=0;i<=12;i++)sh.push(V0.P(at(i/12*.97,0)));ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.8;C.line(sh.slice(0,4));ctx.stroke();ctx.strokeStyle='#fff1c4';ctx.lineWidth=1.3;C.line(sh);ctx.stroke();
    // little flames licking at the tip
    for(let i=0;i<3;i++){const k=.82+i*.07,ph=t*6+i*2.1,q=V0.P(at(k,(i-1)*2.2)),hh=3+1.6*Math.sin(ph),w=1.5;ctx.fillStyle=i===1?'#ffd25a':'#ff8a2e';ctx.globalAlpha=.85;
      ctx.beginPath();ctx.moveTo(q[0]-w,q[1]);ctx.quadraticCurveTo(q[0]-w*.6,q[1]-hh*.6,q[0]+Math.sin(ph*1.3)*.8,q[1]-hh);ctx.quadraticCurveTo(q[0]+w*.7,q[1]-hh*.5,q[0]+w,q[1]);ctx.closePath();ctx.fill();ctx.globalAlpha=1}}};
// a gift standing in the hero's place on the stone: rising from it, floating, turning; a = fading in/out, pop = the little jump when
// it is picked again or tapped; in the light from above like the heroes
function sceGiftAt(G0,t,X,Y,k,alpha,light){const C=window.C3;if(!C||!SCE_G3[G0.id])return;const tt=t-G0.t0,pp=t-(G0.pop==null?G0.t0:G0.pop),pop=pp>0&&pp<.5?Math.sin(pp/.5*Math.PI)*(1-pp/.5):0,
    rise=sceEz(Math.min(1,Math.max(0,tt)/.5)),sc=k*(.78+.22*rise)*(1+.14*pop),fl=Math.sin(t*1.6)*1.3*k,flat=G0.id==='anello'||G0.id==='piuma',
    face=flat?Math.PI/2+.8*Math.sin(t*.8)+pop*1.4:t*.75+pop*2.2,lift=(4+6*rise)*k;
  // its shadow on the stone, the light under it
  ctx.save();ctx.globalAlpha=.32*alpha;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(X,Y,(8-2*rise)*k,(2.6-.6*rise)*k,0,0,TAU);ctx.fill();ctx.restore();
  if(!LOWFX&&!SCE.low){ctx.save();ctx.globalCompositeOperation='lighter';glow(SCE_GIFT[G0.id].rgb,X,Y-lift-10*k+fl,24*k,.26*alpha*(1+pop));ctx.restore()}
  sceLayer(X,Y-lift+fl,sc,()=>{ctx.save();ctx.translate(X,Y-lift+fl);ctx.scale(sc,sc);try{SCE_G3[G0.id](C.V(face),t,C)}finally{ctx.restore()}},alpha,null,light)}

// ------------------------------------------------------------------ the dark around: far pillars in the black, the floor; the light is drawn every frame
function sceBgImg(w,h,S,dpr){const fy=S.y*dpr,kq=Math.round(S.k*3)/3,key=w+'x'+h+':'+Math.round(fy/8)+':'+kq;if(SCE.bgK===key&&SCE.bgImg)return SCE.bgImg;
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  const g=x.createRadialGradient(w/2,fy-h*.22,10,w/2,fy-h*.22,Math.max(w,h)*.75);g.addColorStop(0,'#17120e');g.addColorStop(.32,'#0b0907');g.addColorStop(1,'#020101');x.fillStyle=g;x.fillRect(0,0,w,h);
  // pillars and arches far away, barely there
  x.save();x.globalAlpha=.5;for(const[px,pw,ph] of[[.05,.07,.74],[.23,.05,.6],[.77,.05,.6],[.95,.07,.74]]){const X=w*px,W=w*pw,top=h*(1-ph),gg=x.createLinearGradient(X-W,0,X+W,0);
    gg.addColorStop(0,'rgba(30,25,21,0)');gg.addColorStop(.35,'rgba(42,35,29,.9)');gg.addColorStop(.6,'rgba(24,20,17,.9)');gg.addColorStop(1,'rgba(20,16,14,0)');x.fillStyle=gg;x.fillRect(X-W,top,W*2,h-top)}
  x.restore();
  // the floor: a darker band under the stone
  const fl=x.createLinearGradient(0,fy-h*.06,0,h);fl.addColorStop(0,'rgba(0,0,0,0)');fl.addColorStop(.25,'rgba(6,5,4,.7)');fl.addColorStop(1,'rgba(1,1,1,.96)');x.fillStyle=fl;x.fillRect(0,fy-h*.06,w,h);
  const v=x.createRadialGradient(w/2,h*.5,Math.min(w,h)*.28,w/2,h*.5,Math.max(w,h)*.76);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.8)');x.fillStyle=v;x.fillRect(0,0,w,h);
  x.setTransform(dpr,0,0,dpr,0,0);sceLight(x,{x:S.x,y:S.y,k:kq},Math.max(0,S.y-110*kq),1,6);
  SCE.bgK=key;return SCE.bgImg=c}
// the hard light from above: a cone with soft edges, brighter in its middle, and the pool it makes on the floor (pulse: a mantle, a gift)
function sceLight(x,S,top,a,n){const k=S.k,bot=S.y+3*k;x.save();x.globalCompositeOperation='lighter';n=n||6;
  for(let i=0;i<n;i++){const sp=n>1?i/(n-1):.5,cw0=(4+5*sp)*k,cw1=(22+16*sp)*k,cone=x.createLinearGradient(0,top,0,bot);
    cone.addColorStop(0,`rgba(255,234,186,${(.07*a).toFixed(3)})`);cone.addColorStop(.55,`rgba(255,222,165,${(.035*a).toFixed(3)})`);cone.addColorStop(1,`rgba(255,212,150,${(.014*a).toFixed(3)})`);
    x.fillStyle=cone;x.beginPath();x.moveTo(S.x-cw0,top);x.lineTo(S.x+cw0,top);x.lineTo(S.x+cw1,bot);x.lineTo(S.x-cw1,bot);x.closePath();x.fill()}
  if(n<6){x.restore();return}
  x.save();x.translate(S.x,S.y);x.scale(1,.32);const pool=x.createRadialGradient(0,0,2,0,0,40*k);pool.addColorStop(0,`rgba(255,216,152,${(.32*a).toFixed(3)})`);pool.addColorStop(.5,`rgba(255,190,120,${(.1*a).toFixed(3)})`);pool.addColorStop(1,'rgba(255,170,100,0)');
  x.fillStyle=pool;x.beginPath();x.arc(0,0,40*k,0,TAU);x.fill();x.restore();x.restore()}
// sparks rising from the runes (gift: from the gift)
function sceEmber(rgb,burst,gift){SCE.emb.push({rgb,gift:!!gift,x:(Math.random()*2-1)*(burst?15:18),y:(Math.random()*2-1)*3,vx:(Math.random()*2-1)*(burst?13:3),vy:-(burst?20+Math.random()*28:10+Math.random()*13),l:0,max:burst?.7+Math.random()*.7:1.3+Math.random()*1.3,s:burst?1.3:1})}
// where the hero stands and how big: in the middle of the screen, the rune stone (its side goes 6.9k under his feet) just over the
// panel underneath, and as big as the screen allows: his hood (a circle 11.5k wide round a point 26k over his feet) may go behind the
// bottom corners of the panels over the scene only a little, the whole of him (44k) under the name in the fourth step
function sceSpot(){const st=SCE.el&&SCE.el.querySelector('.sceStage'),cv=$('sceCv');if(!st||!cv)return null;const a=st.getBoundingClientRect(),b=cv.getBoundingClientRect(),cx=b.left+b.width/2,A=a.bottom-3;
  const lim=[];if(SCE.step===4){const nb=SCE.el.querySelector('.sceNameBox');if(nb&&nb.offsetHeight){const r=nb.getBoundingClientRect();lim.push({dx:-1,bot:r.bottom+8})}}
  else for(const c of SCE.el.querySelectorAll('.sceCol')){if(c.classList.contains('empty')||!c.offsetHeight)continue;const r=c.getBoundingClientRect();lim.push({dx:r.right<=cx?cx-r.right:r.left>=cx?r.left-cx:-1,bot:r.bottom})}
  const ok=k=>{const f=A-6.9*k,cy=f-26*k,R=11.5*k;for(const l of lim){if(l.dx<0){if(f-44*k<l.bot)return false}else if(l.dx<R&&cy-Math.sqrt(R*R-l.dx*l.dx)<l.bot-.42*R)return false}return true};
  let k=Math.min((A-a.top-6)/50.9,b.width*.94/32);while(k>1.6&&!ok(k))k-=.02;k=Math.max(1.6,k);
  return{x:b.width/2,y:A-6.9*k-b.top,k,top:a.top-b.top}}
function sceDraw(t,dt){const cv=$('sceCv');if(!cv)return;const low=LOWFX||SCE.low,dpr=Math.min(window.devicePixelRatio||1,low?1.25:2),w=cv.clientWidth,h=cv.clientHeight;if(w<4||h<4)return;
  const W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const S0=sceSpot();if(!S0)return;
  // the camera moves softly from one step to the next (the hero a step closer, the gift)
  if(SCE.kz==null||dt<=0)SCE.kz=S0.k;else SCE.kz+=(S0.k-SCE.kz)*(1-Math.exp(-dt*5));const S={...S0,k:SCE.kz},k=S.k;
  const x=cv.getContext('2d'),saved=ctx,gt=G.t;ctx=x;G.t=t;
  try{x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(sceBgImg(W,H,S,dpr),0,0);x.setTransform(dpr,0,0,dpr,0,0);
    const fin=SCE.fin?t-SCE.fin.t0:-1,pulse=t-SCE.pulse,pl=pulse>0&&pulse<.6?Math.sin(pulse/.6*Math.PI):0,boost=1.5*pl+(fin>0&&fin<1.2?2*Math.sin(fin/1.2*Math.PI):0);
    if(boost>.02)sceLight(x,S,Math.max(0,S.y-110*k),boost,1);
    // fog drifting over the floor
    if(!low){if(!SCE.fog){SCE.fog=[];for(let i=0;i<7;i++)SCE.fog.push({x:Math.random(),y:Math.random(),s:.7+Math.random()*.6,v:(.008+Math.random()*.012)*(i%2?1:-1)})}
      for(const f of SCE.fog){const fx=((f.x+t*f.v)%1+1)%1*(w+240)-120,fy=S.y-5*k+f.y*20*k;x.globalAlpha=.07*f.s;x.drawImage(glowSprite('200,190,175'),fx-90*f.s,fy-16*f.s,180*f.s,32*f.s)}x.globalAlpha=1}
    // the rune stone under his feet, in his colour (grey for a locked hero; in the gift's colour while the gift stands on it)
    const I=SCE_INFO[SCE.sel]||SCE_INFO.arciere,lk=SCE.step===1&&!sceFree(SCE.sel),gifting=SCE.mode==='gift'&&SCE.gift;SCE.rt=(SCE.rt||0)+dt*(lk?.5:1.2);
    drawRuneStone(S.x,S.y,k*.58,lk?'150,150,170':gifting?SCE_GIFT[SCE.gift].rgb:I.rgb,SCE.rt);
    SCE.ember=(SCE.ember||0)+dt*(low?2:5);while(SCE.ember>1){SCE.ember--;if(SCE.hero)sceEmber(lk?'170,170,190':gifting?SCE_GIFT[SCE.gift].rgb:I.rgb,false)}
    sceEmbers(x,S,dt,low,false);
    // the heroes: the one going away sinks into the dark, the new one comes up into the light; when the gift takes the stone he sinks
    // too, and comes back up after it
    const hk=id=>k*(id==='druida'?.86:1),out=SCE.mode==='gift'?sceEz((t-SCE.modeT)/.32):0,lit=1+.6*pl;
    if(SCE.prev){const a=1-sceEz((t-SCE.prev.t0)/.3);if(a<=0)SCE.prev=null;else sceHeroAt(SCE.prev,t,dt,S.x,S.y-(1-a)*3*k,hk(SCE.prev.id),a,['8,8,12',(.35+.4*(1-a)).toFixed(3)],lit)}
    if(SCE.hero&&out<1){const a=sceEz((t-SCE.hero.in-.08)/.34)*(1-out);sceHeroAt(SCE.hero,t,dt,S.x,S.y+((1-sceEz((t-SCE.hero.in-.08)/.34))*4+out*5)*k,hk(SCE.hero.id),a,lk?['6,6,10','.42']:null,lk?.5:lit);
      if(a<1&&a>0&&!low&&out===0){x.save();x.globalCompositeOperation='lighter';glow('255,236,200',S.x,S.y-24*k,26*k,.35*(1-a));x.restore()}}
    // a padlock swinging in front of a locked hero
    if(lk&&SCE.hero){const sw=Math.sin(t*2.1)*.18;x.save();x.translate(S.x+9.5*k,S.y-9*k);x.rotate(sw);x.scale(k*.42,k*.42);sceLockDraw(x);x.restore()}
    // the gift on the stone, in the hero's place; going back to the hero it sinks, going on it turns into light and flies into him
    if(SCE.gprev){const u=(t-SCE.gprev.t0)/(SCE.gprev.into?.5:.28);if(u>=1)SCE.gprev=null;
      else if(SCE.gprev.into){const q=sceEz(u);sceGiftAt(SCE.gprev,t,S.x,S.y-q*16*k,k*1.2*(1-.8*q),1-q*q,1)}
      else sceGiftAt(SCE.gprev,t,S.x,S.y+u*4*k,k*1.2,1-sceEz(u),1)}
    if(SCE.gcur)sceGiftAt(SCE.gcur,t,S.x,S.y,k*1.2,sceEz((t-SCE.gcur.t0)/.35),1);
    if(fin>=0&&fin<.7&&!low){x.save();x.globalCompositeOperation='lighter';glow('255,236,190',S.x,S.y-28*k,32*k,.45*(1-fin/.7));x.restore()}
    // dust in the light, the gift's sparks
    if(!low){if(!SCE.motes){SCE.motes=[];for(let i=0;i<30;i++)SCE.motes.push({u:Math.random()*2-1,v:Math.random(),s:.5+Math.random(),ph:Math.random()*TAU})}
      x.save();x.globalCompositeOperation='lighter';for(const m of SCE.motes){const vv=((m.v-t*.018*m.s)%1+1)%1,yy=S.y-104*k*vv+4*k,ww=(5+28*(1-vv))*k*.85,xx=S.x+m.u*ww+Math.sin(t*.4+m.ph)*3*k,a=.34*Math.sin(vv*Math.PI)*(.5+.5*Math.sin(t*1.3+m.ph));
        x.fillStyle=`rgba(255,236,190,${a.toFixed(3)})`;x.fillRect(xx,yy,1.4,1.4)}x.restore()}
    sceEmbers(x,S,dt,low,true)}
  catch(e){if(!SCE.err){SCE.err=1;console.error(e)}}
  finally{ctx=saved;G.t=gt}}
// the sparks of the hero (behind him) or of the gift (in front), in units of k/2.4 round the hero's feet
function sceEmbers(x,S,dt,low,gift){x.save();x.translate(S.x,S.y);x.scale(S.k/2.4,S.k/2.4);x.globalCompositeOperation='lighter';
  for(let i=SCE.emb.length-1;i>=0;i--){const e=SCE.emb[i];if(e.gift!==gift)continue;e.l+=dt;if(e.l>=e.max){SCE.emb.splice(i,1);continue}e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.97;e.vy*=.985;
    const a=Math.sin(e.l/e.max*Math.PI),oy=gift?-14*2.4:0;x.fillStyle=`rgba(${e.rgb},${(.8*a).toFixed(3)})`;x.fillRect(e.x-.7*e.s,e.y+oy-.7*e.s,1.4*e.s,1.4*e.s);if(!low)glow(e.rgb,e.x,e.y+oy,3.4*e.s,.32*a)}
  x.restore()}
function sceLockDraw(x){x.lineJoin='round';x.strokeStyle=INK;x.lineWidth=2.4;x.beginPath();x.moveTo(-5,0);x.lineTo(-5,-5);x.arc(0,-5,5,Math.PI,0);x.lineTo(5,0);x.stroke();
  x.strokeStyle='#b7bcc4';x.lineWidth=1.3;x.stroke();
  const g=x.createLinearGradient(0,-1,0,11);g.addColorStop(0,'#ffd86b');g.addColorStop(1,'#b8781a');x.fillStyle=g;x.beginPath();x.roundRect?x.roundRect(-8,-1,16,12,2.5):x.rect(-8,-1,16,12);x.fill();x.strokeStyle=INK;x.lineWidth=2;x.stroke();
  x.fillStyle=INK;x.beginPath();x.arc(0,4,1.8,0,TAU);x.fill();x.fillRect(-.8,4,1.6,4);x.fillStyle='rgba(255,255,255,.4)';x.fillRect(-6.4,.6,4,1.4)}
// one step of the screen (the tests step it by hand with SCE.manual, to look at every frame)
function sceTick(dt){SCE.time+=dt;const t=SCE.time;
  // at the end he turns to face us and stays there; otherwise the turntable: slowly round, the finger's push fading back into it
  // (while you write his name he slows down and turns his face to you)
  if(SCE.fin){let d=(Math.PI/2-.35)-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));SCE.yaw+=d*(1-Math.exp(-dt*5));SCE.vel=0}
  else if(!SCE.drag){const front=SCE.step===4,auto=front?0:.32;SCE.vel+=(auto-SCE.vel)*(1-Math.exp(-dt*(front?2.4:1.6)));SCE.yaw+=SCE.vel*dt;
    if(front&&Math.abs(SCE.vel)<.6){let d=(Math.PI/2-.35)-SCE.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));SCE.yaw+=d*(1-Math.exp(-dt*2.2))}}
  sceDraw(t,dt)}
// a slow phone (frames longer than 30 ms for a second and a half): smaller canvas, no fog, no dust, no light passes, like LOWFX
function sceLoop(now){if(!SCE.on)return;const raw=Math.max(0,(now-SCE.last)/1000),dt=Math.min(.05,raw);SCE.last=now;
  if(!SCE.manual&&raw<.25&&SCE.time>.6){SCE.ema=(SCE.ema||raw)+(raw-(SCE.ema||raw))*.06;SCE.slow=SCE.ema>.03?(SCE.slow||0)+raw:0;if(SCE.slow>1.5)SCE.low=true}
  if(!SCE.manual)sceTick(dt);SCE.raf=requestAnimationFrame(sceLoop)}

// while you choose, the game under the choice does not draw
{const _l=loop;loop=function(now){if(SCE.on){last=now;requestAnimationFrame(loop);return}_l(now)}}
// first the intro, then the making of the hero: at the end of the intro (or with «Salta») the screen opens over the menu
{const _ie=introEnd;introEnd=function(){const need=INTRO.on&&sceNeeded();if(need)SCE.wait=true;try{_ie.apply(this,arguments)}finally{SCE.wait=false}sceOwnSkins();if(need&&sceNeeded()&&!SCE.on)sceOpen()}}
// the fonts come while the intro plays; a save that was closed half way through the choice gets it again over the menu
if(sceNeeded()){sceFonts();if(!INTRO.on)sceOpen()}
