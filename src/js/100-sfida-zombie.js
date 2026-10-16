// =====================================================================
// THE ZOMBIE DAILY CHALLENGE (Denis, 16 October: «Sfida zombie», of the options «Sfida del giorno»): as the Classic one (src/js/36 and 58),
// the same twisted camposanto for everybody today, with a board of rivals. Every day one help and one trouble picked by the date (ZCH_MODS:
// gold coins, a gun in hand, quick abilities, thick skin, a soul in the pocket; the horde, the quick night, the giant zombies, the glass
// heart). Medals by the round you reach (ZCH_T: 5, 8, 12) with their rewards, once a day; the podium (top 3 of the board) +10 crystals. The
// match is the normal one (its gold, its Lucky pack, the Pass Zombie) with the two twists; «Rigioca» keeps them. It opens after the first
// zombie match. In the Zombie home a side button «Sfida» (with «!» while a medal of today is still to win), its sheet with the twists, the
// medals, the board and «Gioca la sfida»; in the match a small line under the health and the twists under «Round 1». SAVE.zchal (zombie block):
// {day, best (round), kills, tries, tiers, top}. All the numbers here, to be tuned playing.
// =====================================================================
const ZCH_MODS=[
  {id:'oro',n:"Monete d'oro",d:'Ogni zombie ti dà il doppio delle monete',good:1},
  {id:'arma',n:'Arma in mano',d:"Cominci con un'arma vera al posto della pistola",good:1},
  {id:'abil',n:'Abilità svelte',d:'Le abilità si ricaricano il 40% più in fretta',good:1},
  {id:'vita',n:'Pelle dura',d:'Salute +50%',good:1},
  {id:'anima',n:'Anima in tasca',d:"Cominci con un'anima che ti rialza una volta",good:1},
  {id:'orda',n:"L'orda",d:'In ogni round il 40% di zombie in più'},
  {id:'veloci',n:'Notte svelta',d:'Gli zombie corrono il 25% più veloci'},
  {id:'giganti',n:'Zombie giganti',d:'Zombie più grossi e con il 50% di vita in più'},
  {id:'fragile',n:'Cuore di vetro',d:'Salute -40%, ma i tuoi colpi fanno il 40% in più'}];
const ZCH_T=[{r:5,n:'Bronzo',c:'#e0955a',rw:{gold:200}},{r:8,n:'Argento',c:'#eef3f7',rw:{rot:30}},{r:12,n:'Oro',c:'#ffd84a',rw:{pack:'r'}}];
const ZCH_GUNS=['revolver','mitraglietta','pompa'];
const ZRIVALS=['Becchino Stanco','Corvo Nero','Lanterna Rossa','Pala Arrugginita','Ossa Rotte','Croce di Legno','Notte Fonda','Lume di Candela','Cane da Guardia','Mano Fredda','Vedova Grigia','Lapide Storta','Fossa Aperta','Campana a Morto'];
if(typeof SAVE_BLOCCHI!=='undefined'&&!SAVE_BLOCCHI.zombie.includes('zchal'))SAVE_BLOCCHI.zombie.push('zchal');
// today's challenge: one help and one trouble, the gun of «Arma in mano»
function zchalToday(){const r=dayRng('zchal'),good=ZCH_MODS.filter(m=>m.good),bad=ZCH_MODS.filter(m=>!m.good),g=good[Math.floor(r()*good.length)],b=bad[Math.floor(r()*bad.length)],gun=ZCH_GUNS[Math.floor(r()*ZCH_GUNS.length)];
  return{day:today(),mods:[g.id,b.id],gun,has:{[g.id]:1,[b.id]:1}}}
function ensureZChal(){const C=SAVE.zchal;if(!C||typeof C!=='object'||C.day!==today())SAVE.zchal={day:today(),best:0,kills:0,tries:0,tiers:{},top:false};const Z=SAVE.zchal;if(!Z.tiers||typeof Z.tiers!=='object')Z.tiers={};return Z}
const zchalOpen=()=>(SAVE.zN||0)>=1;
const zchalRw=w=>w.gold?w.gold+' oro':w.rot?w.rot+' Rottami':'Bustina Zombie '+PRN[w.pack];
// the board: nine rivals with today's rounds, and you
function zchalBoard(){const r=dayRng('zboard'),names=ZRIVALS.slice(),C=ensureZChal(),L=[];for(let i=names.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[names[i],names[j]]=[names[j],names[i]]}for(let i=0;i<9;i++){const R=Math.round(3+r()*13);L.push({n:names[i],R,k:Math.round(R*(9+r()*7))})}
  if(C.best>0)L.push({n:SAVE.pname||'Tu',R:C.best,k:C.kills,me:true});L.sort((a,b)=>b.R-a.R||b.k-a.k);return L}
const zchalReady=()=>{if(!zchalOpen())return false;const C=ensureZChal();return ZCH_T.some((T,i)=>!C.tiers[i])&&C.tries<1};
// ------------------------------------------------------------------ the sheet
function fillZChal(){const C=ensureZChal(),T=zchalToday(),L=zchalBoard(),t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1),open=zchalOpen();lastSheetHTML='';
  const mods=T.mods.map(id=>ZCH_MODS.find(m=>m.id===id)),gn=typeof ARMI!=='undefined'&&ARMI.DATI[T.gun]?ARMI.DATI[T.gun].n:T.gun;
  $('sheet').innerHTML=`<h2>Sfida del giorno · Zombie</h2><p class="lead">Il camposanto di oggi, uguale per tutti: cambia tra <b>${fmtH(mid-t)}</b></p>
    <div class="cmods">${mods.map(m=>`<div class="cmod ${m.good?'good':'bad'}"><b>${m.n}</b><span>${m.id==='arma'?`Cominci col ${gn} al posto della pistola`:m.d}</span></div>`).join('')}</div>
    <div class="tiers">${ZCH_T.map((x,i)=>`<div class="tier ${C.tiers[i]?'got':''}" style="--tc:${x.c}"><i></i><b>${x.n}</b><small>Round ${x.r}<br>${C.tiers[i]?'Presa!':zchalRw(x.rw)}</small></div>`).join('')}</div>
    <p class="lead small">Le medaglie si vincono una volta al giorno, arrivando al loro round. Nei primi 3 della classifica: <b>+10 cristalli</b>. Oro e Lucky Cards come in ogni partita.</p>
    <div class="board">${L.map((x,i)=>`<div class="brow ${x.me?'me':''}"><span class="bpos">${i+1}</span><b>${x.me?(SAVE.pname||'Tu')+' (tu)':x.n}</b><span class="bsc">Round ${x.R}</span></div>`).join('')}</div>
    ${open?`<button class="btn go bigPlay" data-zchal="1">${C.tries?'Riprova la sfida':'Gioca la sfida'}</button>`:'<p class="lead" style="text-align:center">Si apre dopo la prima partita nel camposanto.</p>'}<button class="btn alt close">Chiudi</button>`}
{const _os=openSheet;openSheet=function(kind){if(kind==='zchal'){SHEET=kind;sfx('ui');fillZChal();$('sheetScr').hidden=false;return}return _os(kind)}}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('[data-zchal]');if(!b||!zchalOpen())return;closeSheet();ZG.chalNext=true;zGo()});
// ------------------------------------------------------------------ the side button in the Zombie home
{const b=document.createElement('button');b.className='qbtn zonly';b.id='zChalBtn';b.setAttribute('aria-label','Sfida del giorno');
  b.innerHTML=`<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="7" width="22" height="20" rx="3" fill="#33402e" stroke="#0a0c0b" stroke-width="2.2"/><path d="M5 10a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v3H5z" fill="#8a2a22" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 4v6M21 4v6" stroke="#0a0c0b" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="19.5" r="5.2" fill="#e8e2d0" stroke="#0a0c0b" stroke-width="1.8"/><rect x="13.1" y="18.3" width="2.1" height="2.4" rx=".6" fill="#0a0c0b"/><rect x="16.8" y="18.3" width="2.1" height="2.4" rx=".6" fill="#0a0c0b"/><path d="M14.2 24v1.6M16 24v1.6M17.8 24v1.6" stroke="#0a0c0b" stroke-width="1.2"/><circle cx="24.5" cy="25" r="3.4" fill="#ffd84a" stroke="#0a0c0b" stroke-width="1.6"/></svg><small>Sfida</small><i class="bang" id="zChalBang" hidden>!</i>`;
  const col=document.querySelector('.sideBtns.r');if(col)col.appendChild(b);b.classList.toggle('zoff',!zMode());b.onclick=()=>openSheet('zchal')}
function renderZChalBtn(){const b=$('zChalBtn');if(!b)return;const rd=zchalReady();$('zChalBang').hidden=!rd;b.classList.toggle('hot',rd);b.classList.toggle('none',!zchalOpen())}
{const _rs=renderSide;renderSide=function(){_rs.apply(this,arguments);try{renderZChalBtn()}catch(e){}}}
// ------------------------------------------------------------------ the match: the twists
{const _gp=goPlay;goPlay=function(){ZG.chalNext=false;return _gp.apply(this,arguments)}}
{const _zs=zStart;zStart=function(){const C=ZG.chalNext&&zchalOpen()?zchalToday():null;ZG.chalNext=false;ZM.W.chal=C;ZM.W.abilCd=C&&C.has.abil?.6:1;return _zs.apply(this,arguments)}}
{const _ab=zApplyBonus;zApplyBonus=function(){_ab.apply(this,arguments);const C=ZM.W.chal,D=ZM.W.director,PZ=D&&D.PZ;
  if(PZ){PZ.vita0=PZ.vita;if(C&&C.has.vita)PZ.vita=Math.round(PZ.vita*1.5);if(C&&C.has.fragile)PZ.vita=Math.round(PZ.vita*.6)}
  if(C&&ZM.fortuna){const b=ZM.fortuna.LK.base;if(C.has.oro)b.cash=(b.cash||1)*2;if(C.has.fragile)b.dmg=1.4}
  if(C&&C.has.arma&&typeof ARMI!=='undefined'&&ARMI.DATI[C.gun])ZM.W.startGun=C.gun}}
// the match side (from partita.js D): the soul at the start, the horde at every round, quick and giant zombies, the line under the health
{const W=ZM.W;let ui=null;
  const mkLine=()=>{const ov=document.getElementById('mz');if(!ov)return null;const el=document.createElement('div');el.id='mzChal';el.innerHTML=`<style>#mzChal{position:absolute;left:14px;top:calc(84px + env(safe-area-inset-top,0px));max-width:62vw;font:700 11.5px/1.25 "Baloo 2",system-ui;color:#ffd65a;text-shadow:0 2px 0 #000;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#mzChal[hidden]{display:none}</style><span></span>`;ov.appendChild(el);return{el,t:el.querySelector('span'),k:''}};
  const step=()=>{const C=W.chal,D=W.director;if(!ui)ui=mkLine();if(ui){const k=C?C.mods.join():'';if(k!==ui.k){ui.k=k;ui.el.hidden=!C;if(C)ui.t.textContent='Sfida del giorno · '+C.mods.map(id=>ZCH_MODS.find(m=>m.id===id).n).join(' · ')}}
    if(!C||!D)return;
    // the round 1 banner says the twists under «Round 1»
    if(D.st==='round'&&D.R===1&&!C.ban&&D.ui){C.ban=1;D.ui.b2.textContent='Sfida del giorno: '+C.mods.map(id=>ZCH_MODS.find(m=>m.id===id).n).join(' · ');D.ui.banT=Math.max(D.ui.banT,3.4)}
    if(C.has.orda&&D.st==='round'&&C.lastR!==D.R){C.lastR=D.R;D.left=Math.round(D.left*1.4)}
    if(C.has.veloci||C.has.giganti)for(const z of W.Z){if(!z.q||z.boss||z.cz||z.die)continue;z.cz=1;if(C.has.veloci){z.spd*=1.25;z.spd0=(z.spd0||z.spd/1.25)*1.25}if(C.has.giganti){z.hp*=1.5;z.hp0=(z.hp0||z.hp/1.5)*1.5;z.sc*=1.15}}};
  const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__zc)return D;D.__zc=1;const _u=D.update;D.update=(dt,on)=>{_u(dt,on);try{step()}catch(e){console.error(e)}};
    const _r=D.reset;D.reset=()=>{_r();const C=W.chal;if(C){C.lastR=0;C.ban=0;if(C.has.anima)D.anime=1}};return D}}
// the end of a challenge match: the best round of the day, the medals, the podium; the lines on the end screen
function zchalEnd(R,kills){const C=ensureZChal(),first=!C.tries;C.tries++;const out=[];if(R>C.best||R===C.best&&kills>C.kills){C.best=R;C.kills=kills}
  if(first){zPassXP(60);mprog('chal',null,1)}
  ZCH_T.forEach((T,i)=>{if(C.best>=T.r&&!C.tiers[i]){C.tiers[i]=1;const w=T.rw;if(w.gold)SAVE.gold+=w.gold;if(w.rot)SAVE.mat.rot=(SAVE.mat.rot||0)+w.rot;if(w.pack)addPack('zombie',w.pack);out.push(`Medaglia ${T.n}: ${zchalRw(w)}`)}});
  const L=zchalBoard(),pos=L.findIndex(x=>x.me)+1;if(pos>0&&pos<=3&&!C.top){C.top=true;SAVE.gems=(SAVE.gems||0)+10;out.push('Podio: +10 cristalli')}save();
  return`<div class="zchEnd"><b>Sfida del giorno</b>${pos?`<span>${pos}° in classifica</span>`:''}${out.map(t=>`<em>${t}</em>`).join('')}</div>`}
{const _zf=zFine;zFine=function(oro,R,kills){const r=_zf.apply(this,arguments);try{if(ZM.W.chal&&ZM.W.chal.day===today()){const e=zchalEnd(R,kills);if(r)r.extra=(r.extra||'')+e}}catch(e){console.error(e)}return r}}
{const st=document.createElement('style');st.textContent=`#mzPartita .fine .zchEnd{display:flex;flex-direction:column;align-items:center;gap:1px;margin-top:6px;padding:6px 14px;border:2px solid #000;border-radius:12px;background:rgba(40,30,12,.75)}
#mzPartita .fine .zchEnd b{font:400 15px "Lilita One",system-ui;color:#ffd65a;letter-spacing:.02em}#mzPartita .fine .zchEnd span{font:700 13px "Baloo 2",system-ui}#mzPartita .fine .zchEnd em{font:700 13px "Baloo 2",system-ui;font-style:normal;color:#9dff6a}`;document.head.appendChild(st)}
