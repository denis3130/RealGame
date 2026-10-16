// =====================================================================
// THE ZOMBIE ABILITIES IN THE MENU (Denis, 12 October: «nella modalità zombie si potranno anche scegliere e sbloccare delle abilità (per
// esempio lo scatto), con al massimo 3 abilità equipaggiate insieme»; 16 October: «Abilità zombie»). In the Arsenal (the Armoury tab in the
// Zombie mode), above the accessories: the three places of the abilities you bring into a match and the six abilities (what they do in a
// match: anteprime/zombie/abilita.js, ZM.abil). The Dash is everyone's from the start; the others are unlocked with gold and Rottami (the
// three strongest only after a record round), and every one grows to level 5 (stronger, and a shorter recharge). A tap opens its sheet: what
// it does, the numbers now and at the next level, «Porta in partita» / «Togli dalla partita», «Sblocca», «Migliora»; with the three places
// full, «Porta» asks which one it takes. The three go to the match (ZM.W.abil) when it starts; the zombie sheet shows them too.
// SAVE.z.ab = {lv:{id: level}, eq:[id|null ×3]} (inside SAVE.z: the zombie block of the save). All the prices in ZABP, to be tuned playing.
// =====================================================================
const ZABD=ZM.abil.ZAB,ZAB_IDS=ZM.abil.ZAB_IDS,ZAB_MAX=ZM.abil.ZAB_MAX;
// unlocking (gold, Rottami, the record round it needs); a level up from l to l+1 costs 40%·l of the unlocking price (the Dash: of «up»)
const ZABP={scatto:{gold:0,rot:0,up:[600,10]},granata:{gold:1000,rot:15},tagliola:{gold:1500,rot:25,rec:4},cura:{gold:2000,rot:35},pupazzo:{gold:3000,rot:50,rec:6},adrenalina:{gold:4000,rot:70,rec:8}};
// the save: made and mended here (old saves, a save code read back, a broken entry): known abilities only, levels 1-5, the Dash always
// yours, three places without doubles and only with abilities you have
function zab(){const Z=SAVE.z&&typeof SAVE.z==='object'?SAVE.z:(SAVE.z={});let A=Z.ab;if(!A||typeof A!=='object'||Array.isArray(A))A=Z.ab={};
  if(!A.lv||typeof A.lv!=='object'||Array.isArray(A.lv))A.lv={};
  for(const k of Object.keys(A.lv)){const v=A.lv[k];if(!ZABD[k]||typeof v!=='number'||!isFinite(v)||v<1)delete A.lv[k];else A.lv[k]=Math.min(ZAB_MAX,Math.floor(v))}
  if(!A.lv.scatto)A.lv.scatto=1;
  if(!Array.isArray(A.eq))A.eq=['scatto',null,null];
  const eq=[0,1,2].map(i=>{const id=A.eq[i];return typeof id==='string'&&A.lv[id]?id:null});for(let i=0;i<3;i++)if(eq[i]&&eq.indexOf(eq[i])!==i)eq[i]=null;A.eq=eq;
  return A}
{const _d=defSave;defSave=function(){const s=_d();if(s.z&&typeof s.z==='object')s.z.ab={lv:{scatto:1},eq:['scatto',null,null]};return s}}
zab();
const r10=v=>Math.round(v/10)*10;
function zabInfo(id){const A=zab(),P=ZABP[id],lv=A.lv[id]||0,rec=P.rec||0,recOk=(SAVE.zRec||0)>=rec,rot=SAVE.mat?SAVE.mat.rot||0:0;
  if(!lv)return{own:false,lv:0,gold:P.gold,rot:P.rot,rec,recOk,ok:recOk&&SAVE.gold>=P.gold&&rot>=P.rot};
  const b=P.up||[P.gold,P.rot],g=r10(b[0]*.4*lv),r=Math.round(b[1]*.4*lv),max=lv>=ZAB_MAX;return{own:true,lv,max,gold:g,rot:r,rec,recOk:true,ok:!max&&SAVE.gold>=g&&rot>=r}}
// unlocking or a level up (a new ability goes into a free place)
function zabBuy(id){const I=zabInfo(id),A=zab();if(!I.ok)return false;SAVE.gold-=I.gold;SAVE.mat.rot-=I.rot;A.lv[id]=(A.lv[id]||0)+1;if(!I.own){const i=A.eq.indexOf(null);if(i>=0)A.eq[i]=id}save();sfx('upgrade');vib(20);return true}
function zabPut(id,slot){const A=zab();if(!A.lv[id])return;const cur=A.eq.indexOf(id);if(cur>=0)A.eq[cur]=null;if(slot==null){slot=A.eq.indexOf(null);if(slot<0)slot=2}A.eq[slot]=id;save()}
function zabTake(id){const A=zab(),i=A.eq.indexOf(id);if(i>=0){A.eq[i]=null;save()}}
// ------------------------------------------------------------------ pictures: the sign of the ability (the same as on its button in the match)
function zabIcon(id){return iconCv('ab:'+id,x=>{x.translate(48,49);ZM.abil.glyph(x,id,1.42)})}
// the numbers of a level (and of the next one): the recharge, then what grows
function zabStats(id,l,n){const A=ZM.abil,D=ZABD[id],it=v=>v.toLocaleString('it-IT',{maximumFractionDigits:1});
  const row=(lab,f,u)=>{const a=f(l),b=n?f(n):a;return`<div><span>${lab}</span><b>${it(a)}${u||''}${n&&b!==a?` <i>→ ${it(b)}${u||''}</i>`:''}</b></div>`};
  let s=row('Ricarica',v=>Math.round(A.cdOf(id,v)*10)/10,' s');
  if(id==='scatto')s+=`<div><span>Senza danni</span><b>mezzo secondo</b></div>`;
  else if(id==='granata')s+=row('Danno',v=>Math.round(D.dmg*A.pw(v)))+`<div><span>Raggio</span><b>${D.r}</b></div>`;
  else if(id==='tagliola')s+=row('Danno',v=>Math.round(D.dmg*A.pw(v)))+row('Tiene fermo',v=>Math.round(D.hold*(1+.06*(v-1))*10)/10,' s')+`<div><span>A terra insieme</span><b>${D.max}</b></div>`;
  else if(id==='pupazzo')s+=row('Attira per',v=>Math.round(A.durOf(id,v)*10)/10,' s')+row('Danno del fuoco',v=>Math.round(D.dmg*A.pw(v)));
  else if(id==='cura')s+=row('Salute',v=>Math.round(D.heal*A.pw(v)*100),'%');
  else s+=row('Durata',v=>Math.round(A.durOf(id,v)*10)/10,' s')+`<div><span>Corsa · arma</span><b>+${Math.round((D.spd-1)*100)}% · +${Math.round((D.gun-1)*100)}%</b></div>`;
  return s}
// ------------------------------------------------------------------ the Arsenal: the three places and the six abilities
{const zs=$('zArs');if(zs)zs.insertAdjacentHTML('afterbegin',`<div class="secTitle"><h3>Abilità</h3><small>Fino a 3 in partita</small></div><div class="zabSlots" id="zabSlots"></div><div class="coll zabColl" id="zabColl"></div>`)}
function zabSlotHTML(id,i){if(!id)return`<button class="zabS empty" data-zabslot="${i}" aria-label="Posto libero"><span>+</span><i class="k">${i+1}</i></button>`;const D=ZABD[id],lv=zab().lv[id];
  return`<button class="zabS" data-zab="${id}" style="--rc:${D.col[0]};--rc2:${D.col[1]}" aria-label="${D.n}">${zabIcon(id)}<i class="k">${i+1}</i><b>Liv. ${lv}</b></button>`}
function zabCard(id){const D=ZABD[id],A=zab(),I=zabInfo(id),on=A.eq.includes(id);
  const sub=I.own?`<span class="lv">Liv. ${I.lv}</span>`:I.recOk?`<span class="zabP">${I.gold.toLocaleString('it-IT')} oro</span>`:`<span class="zabP rec">Dal round ${I.rec}</span>`;
  return`<button class="icard zabc ${I.own?'':'locked'} ${on?'on':''}" data-zab="${id}" style="--rc:${D.col[0]};--rc2:${D.col[1]}">${I.own&&I.ok?'<em class="up">▲</em>':''}${on?'<i class="zabOn">✓</i>':''}${!I.own?`<i class="zabLk">${LOCK}</i>`:''}${zabIcon(id)}<span class="zabN">${D.n}</span>${sub}</button>`}
function renderZab(){const A=zab(),s=$('zabSlots'),c=$('zabColl');if(!s||!c)return;const hs=A.eq.map(zabSlotHTML).join(''),hc=ZAB_IDS.map(zabCard).join('');if(s._h!==hs){s.innerHTML=hs;s._h=hs}if(c._h!==hc){c.innerHTML=hc;c._h=hc}}
{const _r=renderZArs;renderZArs=function(){const r=_r.apply(this,arguments);try{renderZab()}catch(e){console.error(e)}return r}}
$('tabGear').addEventListener('click',e=>{const b=e.target.closest('[data-zab],[data-zabslot]');if(!b||!zMode())return;e.stopPropagation();sfx('ui');
  if(b.dataset.zabslot!=null){toast("Tocca un'abilità qui sotto per portarla in partita");return}openZab(b.dataset.zab)},true);
// the sheet of an ability (in the item window, like the guns): what it does, the numbers, the buttons; with the three places full «Porta in
// partita» shows the three in use to choose the one it takes
function openZab(id,swap){const D=ZABD[id],A=zab(),I=zabInfo(id),lv=I.lv,nx=I.own&&!I.max,on=A.eq.includes(id),full=!A.eq.includes(null);
  const rotS=n=>`${n} ${MAT_SVG.rot.replace('<svg ','<svg class="mI" ')}`,price=(g,r)=>`${g.toLocaleString('it-IT')} oro${r?' + '+rotS(r):''}`;
  let act='',msg='';
  if(!I.own){act=`<button class="btn" data-zabact="buy" ${I.ok?'':'disabled'}>Sblocca · ${price(I.gold,I.rot)}</button>`;
    msg=!I.recOk?`Si sblocca dopo aver superato il round ${I.rec} (il tuo record: ${SAVE.zRec||0}).`:!I.ok?(SAVE.gold<I.gold?`Ti mancano ${(I.gold-SAVE.gold).toLocaleString('it-IT')} oro.`:`Ti mancano ${I.rot-(SAVE.mat.rot||0)} Rottami: li trovi nelle bustine Zombie e nel Pass Zombie.`):''}
  else{act=(on?'<button class="btn alt" data-zabact="take">Togli dalla partita</button>':`<button class="btn alt" data-zabact="${full?'swap':'put'}">Porta in partita</button>`)+(nx?`<button class="btn" data-zabact="up" ${I.ok?'':'disabled'}>Migliora · ${price(I.gold,I.rot)}</button>`:'');
    if(nx&&!I.ok)msg=SAVE.gold<I.gold?`Ti mancano ${(I.gold-SAVE.gold).toLocaleString('it-IT')} oro.`:`Ti mancano ${I.rot-(SAVE.mat.rot||0)} Rottami: li trovi nelle bustine Zombie e nel Pass Zombie.`}
  const sw=swap&&I.own&&!on?`<div class="zabSwap"><small class="muted">Al posto di:</small>${A.eq.map((q,i)=>`<button class="zabS" data-zabto="${i}" style="--rc:${ZABD[q].col[0]};--rc2:${ZABD[q].col[1]}" aria-label="${ZABD[q].n}">${zabIcon(q)}<i class="k">${i+1}</i></button>`).join('')}</div>`:'';
  $('itemPanel').innerHTML=`<div class="ihead" style="--rc:${D.col[0]};--rc2:${D.col[1]}"><div class="iicon">${zabIcon(id)}</div><div><span class="tag" style="color:${D.col[0]}">Abilità zombie${on?' · in partita':''}</span><h2>${D.n}</h2><span class="lvbig">${I.own?`Livello ${lv}${I.max?' (massimo)':''}`:'Da sbloccare'}</span></div></div>
    <div class="stats">${zabStats(id,Math.max(1,lv),nx?lv+1:null)}</div><p class="perk">${D.d}${id!=='scatto'&&id!=='cura'&&id!=='adrenalina'?' <b>Il danno cresce coi round, come la vita degli zombie.</b>':''}</p>
    <div class="row">${act}</div>${sw}${msg?`<small class="muted">${msg}</small>`:''}<button class="btn alt" data-zabact="close">Chiudi</button>`;
  $('itemScr').hidden=false;
  $('itemPanel').onclick=e=>{const t=e.target.closest('[data-zabact],[data-zabto]');if(!t||t.disabled)return;
    if(t.dataset.zabto!=null){zabPut(id,+t.dataset.zabto);sfx('upgrade');toast(D.n+' in partita');renderGear();openZab(id);return}
    const a=t.dataset.zabact;if(a==='close'){closeItem();return}
    if(a==='buy'||a==='up'){const was=I.own;if(zabBuy(id)){renderGold();renderGear();renderPlay();toast(was?`${D.n}: livello ${zab().lv[id]}!`:`${D.n} sbloccata!`);openZab(id)}}
    else if(a==='put'){zabPut(id);sfx('upgrade');toast(D.n+' in partita');renderGear();openZab(id)}
    else if(a==='swap'){sfx('ui');openZab(id,true)}
    else if(a==='take'){zabTake(id);sfx('ui');renderGear();openZab(id)}}}
// ------------------------------------------------------------------ the match: the three chosen, with their level
{const _zs=zStart;zStart=function(){try{const A=zab();ZM.W.abil=A.eq.map(id=>id?{id,lv:A.lv[id]}:null)}catch(e){console.error(e)}return _zs.apply(this,arguments)}}
// the zombie sheet: the abilities you bring, and a button to the Arsenal
{const _fz=fillZombie;fillZombie=function(){_fz.apply(this,arguments);const el=$('sheet').querySelector('.abTop');if(!el)return;const A=zab();
  el.insertAdjacentHTML('afterend',`<div class="zabRow"><span>Abilità in partita</span><div>${A.eq.map((id,i)=>id?`<i class="zabMini" style="--rc:${ZABD[id].col[0]};--rc2:${ZABD[id].col[1]}" title="${ZABD[id].n}">${zabIcon(id)}</i>`:'<i class="zabMini empty">+</i>').join('')}</div><button class="btn alt" data-zabgo="1">Cambia</button></div>`)}}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('[data-zabgo]');if(!b)return;sfx('ui');closeSheet();setTab('tabGear')});
// ------------------------------------------------------------------ the look
{const st=document.createElement('style');st.textContent=`
#zArs .zabSlots{display:flex;gap:12px;justify-content:center;margin:4px 0 12px}
.zabS{position:relative;width:62px;height:62px;flex:none;padding:0;border-radius:50%;border:3px solid var(--crInk,#0a0c0b);background:radial-gradient(circle at 38% 32%,var(--rc,#4a443c),var(--rc2,#211d19) 78%);box-shadow:0 3px 0 var(--crInk,#0a0c0b),inset 0 0 0 2px rgba(255,240,210,.22);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent}
.zabS .cicon{width:52px;height:52px;margin:0}.zabS:active{transform:translateY(2px)}
.zabS.empty{border-style:dashed;border-color:rgba(221,212,184,.5);background:rgba(41,38,33,.55);box-shadow:none;color:#cfc6b0;font-family:var(--display);font-size:24px}
.zabS .k{position:absolute;top:-5px;left:-5px;width:19px;height:19px;border-radius:50%;background:#1a1714;border:2px solid var(--crInk,#0a0c0b);font:400 11px/15px var(--display);color:#e9dfc6;text-align:center;font-style:normal}
.zabS b{position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);padding:0 6px;border:2px solid var(--crInk,#0a0c0b);border-radius:999px;background:#2a2622;font:400 10.5px/1.3 var(--display);color:#fff;white-space:nowrap;text-shadow:var(--tol-s)}
.zabc .cicon{width:50px;height:50px}.zabc .zabN{font-family:var(--display);font-size:12.5px;line-height:1.1;color:#fff;text-shadow:var(--tol-s)}
.zabc .zabP{font-family:var(--display);font-size:11px;line-height:1.2;padding:0 6px;border-radius:999px;background:rgba(0,0,0,.45);color:#ffd65a}.zabc .zabP.rec{color:#ff9a80}
.zabc.locked .cicon{filter:grayscale(.75) brightness(.55)}.zabc.on{outline:3px solid #9dff6a;outline-offset:1px}
.zabc .zabOn{position:absolute;top:-8px;left:-8px;width:21px;height:21px;border-radius:50%;background:#9dff6a;color:#0a0c0b;border:2px solid #0a0c0b;font-style:normal;font-size:12px;line-height:17px;text-align:center;z-index:1}
.zabc .zabLk{position:absolute;top:4px;right:4px;width:16px;height:16px;opacity:.9}.zabc .zabLk .lk{width:16px;height:16px}
.zabSwap{display:flex;align-items:center;gap:10px;justify-content:center;margin:8px 0 4px;flex-wrap:wrap}.zabSwap small{width:100%;text-align:center}
.zabRow{display:flex;align-items:center;gap:10px;margin:10px 0 12px;padding:8px 10px;border:2.5px solid var(--crInk,#0a0c0b);border-radius:12px;background:linear-gradient(100deg,rgba(60,90,50,.4),rgba(20,24,18,.55))}
.zabRow>span{font-family:var(--display);font-size:13px;color:#e9dfc6;line-height:1.1;flex:1 1 auto;min-width:0}.zabRow>div{display:flex;gap:6px}.zabRow .btn{width:auto;flex:none;padding:6px 12px;font-size:14px}
.zabMini{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;border:2.5px solid var(--crInk,#0a0c0b);background:radial-gradient(circle at 38% 32%,var(--rc,#4a443c),var(--rc2,#211d19) 78%);font-style:normal}
.zabMini .cicon{width:32px;height:32px}.zabMini.empty{border-style:dashed;border-color:rgba(221,212,184,.5);background:rgba(41,38,33,.55);color:#cfc6b0;font-family:var(--display);font-size:18px}`;document.head.appendChild(st)}
