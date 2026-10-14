// ---------- menu ----------
const toastEl=$('toast');let toastT=null;
function toast(t){toastEl.textContent=t;toastEl.style.bottom=$('chestScr').hidden?'':'150px';toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('show'),1800)}
function renderGold(){tweenNum($('mGold'),SAVE.gold);tweenNum($('mGems'),SAVE.gems||0);renderTop()}
// top bar: the hero you play with, its power, the wallet
function renderTop(){try{const h=HERO_BY[SAVE.hero]||HEROES[0],A=acct(),N=acctNeed(A.lvl),F=FRAMES[SAVE.frame]||FRAMES.base;$('tbName').textContent='Liv. '+A.lvl;$('tbLv').textContent=A.lvl;
  $('tbXp').style.width=Math.min(100,A.xp/N*100)+'%';$('tbXpT').textContent=A.xp+'/'+N;$('tbWho').style.setProperty('--f1',F.c[0]);
  const k=h.id+'|'+JSON.stringify(SAVE.eq)+'|'+(SAVE.skin||'');if(renderTop.k!==k){renderTop.k=k;drawPortrait($('tbAv'),heroStyle(),Math.PI*.55,2.4)}}catch(e){}}
$('tbWho').onclick=()=>{sfx('ui');setTab('tabProfile')};
$('topbar').addEventListener('click',e=>{const b=e.target.closest('.plus');if(!b)return;sfx('ui');
  if(b.dataset.plus==='gold'){setTab('tabShop');setShopPage('spGold')}
  else openSheet('gems')});
let lastSlotsHTML='';
function tapSlot(i){const s=SAVE.slots[i];if(!s)return;const st=slotState(s);
  if(st==='ready'){SAVE.slots[i]=null;save();renderPlay();openChest(s.type,{slot:true})}
  else if(st==='locked'){if(anyUnlocking()){toast('Puoi sbloccare una cassa alla volta');return}s.state='unlocking';s.end=Date.now()+CHESTS[s.type].time*1000;save();renderPlay()}
  else{const c=skipCost(s);
    if(!s.confirm){s.confirm=true;renderPlay();setTimeout(()=>{s.confirm=false;renderPlay()},3000);return}
    if(SAVE.gold>=c){SAVE.gold-=c;s.state='ready';s.confirm=false;save();renderGold();renderPlay()}else{s.confirm=false;toast(`Ti servono ${c} oro`);renderPlay()}}}
function onHeroTap(e){const b=e.target.closest('.icard');if(!b)return;
  if(b.dataset.id&&SAVE.items[b.dataset.id])openItem(b.dataset.id);
  else if(b.dataset.id)toast('Lo trovi nelle casse');
  else if(b.dataset.slot)openPicker(b.dataset.slot)}
$('tabHero').addEventListener('click',onHeroTap);
function closeItem(){$('itemScr').hidden=true}
$('itemScr').addEventListener('click',e=>{if(e.target.id==='itemScr')closeItem()});
function openPicker(slot){
  const own=ITEMS.filter(i=>i.slot===slot&&SAVE.items[i.id]);
  $('itemPanel').innerHTML=`<span class="tag">${SLOTN[slot]}</span><h2>Scegli cosa equipaggiare</h2>${own.length?`<div class="coll">${own.map(i=>icard(i.id)).join('')}</div>`:'<p>Non hai ancora oggetti per questo slot. Aprili dalle casse.</p>'}<button class="btn alt" data-act="close">Chiudi</button>`;
  $('itemScr').hidden=false;
  $('itemPanel').onclick=e=>{const b=e.target.closest('.icard');if(b){openItem(b.dataset.id);return}if(e.target.closest('[data-act=close]'))closeItem()};
}
function openItem(id){
  const it=ITEM[id],o=SAVE.items[id],r=RAR[it.rar],st=itemStats(it,o.lvl),nx=o.lvl<MAXLV?itemStats(it,o.lvl+1):null,need=needCards(o.lvl),cost=upCost(it,o.lvl);
  const ess=matCost(o.lvl),hasE=((SAVE.mat&&SAVE.mat.ess)||0)>=ess,eq=SAVE.eq[it.slot]===id,canUp=o.lvl<MAXLV&&o.cards>=need,canPay=SAVE.gold>=cost&&hasE;
  const stats=Object.keys(st).map(k=>`<div><span>${STATN[k][0]}</span><b>${STATN[k][1](st[k])}${nx?` <i>→ ${STATN[k][1](nx[k])}</i>`:''}</b></div>`).join('');
  $('itemPanel').innerHTML=`
    <div class="ihead" style="--rc:${r.c};--rc2:${r.d}"><div class="iicon">${itemSVG(it)}</div><div><span class="tag" style="color:${r.c}">${r.n} · ${SLOTN[it.slot]}</span><h2>${it.n}</h2><span class="lvbig">Livello ${o.lvl}${o.lvl>=MAXLV?' (massimo)':''}</span></div></div>
    <div class="stats">${stats}</div>
    ${WEAP[it.id]?`<p class="perk"><b>Al tiro:</b> ${WEAP[it.id].d}</p>`:''}${it.perk?`<p class="perk"><b>Effetto speciale:</b> ${it.perk}</p>`:''}
    ${setOf(id)?`<p class="perk"><b>${setOf(id).n}</b> (${setOf(id).items.map(i=>ITEM[i].n).join(' + ')}): ${setOf(id).d}${activeSets().includes(setOf(id))?' · <b>attivo</b>':''}</p>`:''}
    <div><small class="muted">Carte per il prossimo livello</small>${cardBar(id)}</div>
    <div class="row">
      ${eq?(it.slot==='anello'||it.slot==='amuleto'?'<button class="btn alt" data-act="unequip">Togli</button>':'<button class="btn alt" disabled>Equipaggiato</button>'):'<button class="btn alt" data-act="equip">Equipaggia</button>'}
      ${o.lvl<MAXLV?`<button class="btn" data-act="up" ${canUp&&canPay?'':'disabled'}>Migliora · ${cost} oro${ess?` + ${ess} <i class="essI"></i>`:''}</button>`:''}
    </div>
    ${o.lvl<MAXLV&&!canUp?`<small class="muted">${need-o.cards===1?'Ti manca 1 carta':`Ti mancano ${need-o.cards} carte`}: le trovi nelle bustine e nelle casse.</small>`:o.lvl<MAXLV&&SAVE.gold<cost?`<small class="muted">Ti mancano ${cost-SAVE.gold} oro.</small>`:o.lvl<MAXLV&&!hasE?`<small class="muted">Ti mancano ${ess-((SAVE.mat&&SAVE.mat.ess)||0)} Essenze di muschio: le trovi nelle bustine Classiche.</small>`:''}
    <button class="btn alt" data-act="close">Chiudi</button>`;
  $('itemScr').hidden=false;
  $('itemPanel').onclick=e=>{const a=e.target.closest('[data-act]');if(!a||a.disabled)return;const act=a.dataset.act;
    if(act==='close')closeItem();
    else if(act==='equip'){SAVE.eq[it.slot]=id;save();renderHero();openItem(id);toast(it.n+' equipaggiato')}
    else if(act==='unequip'){SAVE.eq[it.slot]=null;save();renderHero();openItem(id)}
    else if(act==='up'){if(!canUp||!canPay)return;o.cards-=need;o.lvl++;SAVE.gold-=cost;SAVE.mat.ess-=ess;save();renderGold();renderHero();openItem(id);toast(`${it.n}: livello ${o.lvl}!`);sfx('upgrade')}};
}
$('shop').addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(!b||b.disabled)return;const c=CHESTS[b.dataset.buy];if(SAVE.gold<c.price)return;SAVE.gold-=c.price;save();renderGold();renderShop();openChest(b.dataset.buy)});
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{sfx('ui');setTab(b.dataset.tab)});
