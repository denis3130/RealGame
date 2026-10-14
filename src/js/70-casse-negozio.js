// =====================================================================
// THE CLASSIC CHESTS AND THE SHOPS (punti 30 e 37): the chests come only from the matches (src/js/06-ui.js) and wait in four slots, plus
// the fifth slot, a little bigger and set apart, for an Epic or Legendary chest (at most one every 5 hours) with better odds; every other
// reward that was a chest is a pack now (src/js/07-meta-oggetti-casse.js rwName...). The shop sells the packs of its mode: the Classic
// one the Classic packs, the Zombie one the Zombie packs and the Lucky Cards (a few a day, again at midnight).
// =====================================================================
// a chest from a slot opens as a chest; anything else that asked for a chest (pass, wheel, missions, login, road, offers) opens a pack
let CH5=false;
{const _oc=openChest;openChest=function(type,o){o=o||{};if(!o.slot)return openPack(o.mode||rwMode(),rwRar(type));
  if(!o.fifth)return _oc(type);
  // the fifth chest: more cards and better odds (CH5, in rollChest), a bigger chest, more light, its own title
  const T0=TIER[type];TIER[type]={...T0,rays:T0.rays+6,burst:T0.burst+120,charge:T0.charge+1,coins:T0.coins+30,size:Math.round(T0.size*1.12)};CH5=true;
  let p;try{p=_oc(type)}finally{CH5=false;TIER[type]=T0}
  $('ctitle').innerHTML=`<span>Quinta cassa: ${CHESTS[type].n}</span>`;$('chestWrap').classList.add('fifth');return p}}
{const _r=rollChest;rollChest=function(type){if(!CH5)return _r(type);const C=CHESTS[type],c0=C.cards,o0=C.odds;
  C.cards=Math.round(c0*1.3);C.odds=o0.map((v,i)=>v*[.55,.8,1.25,1.7,2.3][i]);try{return _r(type)}finally{C.cards=c0;C.odds=o0}}}
// the fifth chest's picture: the chest with golden wings and a crown
function chestSVG5(type){const s=chestSVG(type,false).replace('<svg viewBox="0 -14 80 84" aria-hidden="true">','<svg viewBox="-14 -26 108 100" aria-hidden="true">');
  const wing=sx=>`<g transform="translate(${sx<0?10:70},44) scale(${sx},1)"><path d="M0 0C-8-4-18-2-24-12-18-12-14-14-12-18-18-20-20-24-22-30-12-28-6-20 0-12z" fill="#ffe08a" stroke="#1b1612" stroke-width="2.6" stroke-linejoin="round"/><path d="M-4-6C-10-8-14-10-17-14M-3-11C-8-14-11-18-13-22" stroke="#c99a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
  const crown=`<path d="M27 3l4-11 5 7 4-10 4 10 5-7 4 11z" fill="#ffd84a" stroke="#1b1612" stroke-width="2.4" stroke-linejoin="round"/><circle cx="40" cy="-10" r="2" fill="#e5484d" stroke="#1b1612" stroke-width="1.2"/><circle cx="31" cy="-7" r="1.4" fill="#5fd0f0"/><circle cx="49" cy="-7" r="1.4" fill="#5fd0f0"/>`;
  return s.replace('aria-hidden="true">','aria-hidden="true">'+wing(-1)+wing(1)).replace(/<\/svg>$/,crown+'</svg>')}
// ------------------------------------------------------------------ the chests sheet: the free pack, the four slots, the fifth
function slot5HTML(){const s=SAVE.slot5;if(!s){const wait=SAVE.next5>Date.now();
    return `<div class="slot5 empty"><span class="s5t">Quinta cassa</span><div class="s5q">${chestSVG5('oro')}</div><small>${wait?'Di nuovo possibile tra '+fmtH(SAVE.next5-Date.now()):'Quando i quattro posti sono pieni, la prossima cassa vinta arriva qui: Epica o Leggendaria'}</small></div>`}
  const st=slotState(s),c=CHESTS[s.type];let lab;
  if(st==='ready')lab='<b>Apri!</b>';else if(st==='unlocking')lab=`<b>${fmtT(s.end-Date.now())}</b><small>${s.confirm?'Tocca ancora: '+skipCost(s)+' oro':'Apri ora: '+skipCost(s)+' oro'}</small>`;else lab=`<b>Sblocca</b><small>${fmtT(c.time*1000)} · si sblocca da sola, anche insieme alle altre</small>`;
  return `<button class="slot slot5 ${st} r-${s.type}" data-i="4" aria-label="Quinta cassa: ${c.n}"><span class="s5t">Quinta cassa · ${CHEST_RAR[s.type]}</span><div class="s5q">${chestSVG5(s.type)}</div>${lab}</button>`}
fillChests=function(){const ready=Date.now()>=SAVE.free.next,rar=(SAVE.free.n+1)%3===0?'argento':'legno';
  const html=`<h2>Casse</h2><div class="freeRow ${ready?'hot':''}">${rwIcon(rar,'classica')}<div><b>${rwName(rar,'classica')} gratis</b><span>${ready?'Pronta da aprire!':'Si riempie tra '+fmtH(SAVE.free.next-Date.now())}</span></div>${ready?'<button class="btn go" data-free="1">Apri</button>':''}</div>
    <p class="lead">Le casse si vincono solo giocando, dalla stanza 3 in poi: aspettano qui e si sbloccano una alla volta. Vincendo un'arena può arrivare la Cassa di cristallo.</p><div class="slots cslots">${SAVE.slots.map(slotHTML).join('')}</div>
    ${slot5HTML()}<p class="lead small">Con tutti i posti pieni la cassa vinta diventa oro (un po' meno di quanto vale), e te lo diciamo.</p><button class="btn alt close">Chiudi</button>`;
  if(html!==lastSheetHTML){$('sheet').innerHTML=html;lastSheetHTML=html}};
{const _t=tapSlot;tapSlot=function(i){if(i!==4)return _t(i);const s=SAVE.slot5;if(!s)return;const st=slotState(s);
  if(st==='ready'){if(CHbusy)return;SAVE.slot5=null;save();renderPlay();openChest(s.type,{slot:true,fifth:true})}
  else if(st==='locked'){s.state='unlocking';s.end=Date.now()+CHESTS[s.type].time*1000;save();renderPlay();sfx('ui')}
  else{const c=skipCost(s);if(!s.confirm){s.confirm=true;renderPlay();setTimeout(()=>{s.confirm=false;renderPlay()},3000);return}
    if(SAVE.gold>=c){SAVE.gold-=c;s.state='ready';s.confirm=false;save();renderGold();renderPlay()}else{s.confirm=false;toast(`Ti servono ${c} oro`);renderPlay()}}}}
// the button on the home counts the fifth too
renderChestBtn=function(){const fr=Date.now()>=SAVE.free.next,sl=SAVE.slots.filter(Boolean).concat(SAVE.slot5?[SAVE.slot5]:[]),rd=sl.filter(s=>slotState(s)==='ready'),un=sl.find(s=>slotState(s)==='unlocking'),lk=sl.find(s=>slotState(s)==='locked'),n=rd.length+(fr?1:0);
  let ic,lab;if(n){ic=rd.length?chestSVG(rd[0].type,false):rwIcon('legno','classica');lab='Apri!'}else if(un){ic=chestSVG(un.type,false);lab=fmtT(un.end-Date.now()).replace(/ \d+s$/,'')}else if(lk){ic=chestSVG(lk.type,false);lab='Sblocca'}else{ic=chestSVG('legno',false);lab=fmtH(SAVE.free.next-Date.now()).replace(/ \d+s$/,'')}
  const html=`${ic}<small>${lab}</small>${n?`<em class="pip">${n}</em>`:lk&&!un?'<i class="bang">!</i>':''}`,el=$('chestBtn');el.classList.toggle('hot',!!n);if(el._h!==html){el.innerHTML=html;el._h=html}};
// ------------------------------------------------------------------ the shops
const PKODDS=['Comune','Non comune','Raro','Epico','Leggendario'];
function packCardHTML(mode,r){const B=BUSTE[r],pr=B.price,cost=pr.gold?`<i class="coin"></i>${pr.gold.toLocaleString('it-IT')}`:`<i class="gemS"></i>${pr.gems.toLocaleString('it-IT')}`,ok=pr.gold?SAVE.gold>=pr.gold:(SAVE.gems||0)>=pr.gems,M=mode==='zombie'?'rot':'ess';
  return `<div class="pkc r-${r} m-${mode}"><div class="pkpic"><img src="${packImg(mode,r,128)}" alt=""></div><div class="pkin"><b>${PACKN[mode][r]}</b><span class="pkr" style="--rc:${PRC[r][0]}">${PRN[r]}</span>
    <small>${B.cards} carte · ${MAT_SVG[M].replace('<svg ','<svg class="mI" ')} ${B.mat} ${MATS[M].s} · ${B.gold[0]}-${B.gold[1]} oro${B.min?` · almeno ${B.min2||1} ${PKODDS[B.min].toLowerCase()}`:''}</small>
    <div class="odds">${B.odds.map((v,j)=>v?`<i style="--rc:${RAR[j].c}" title="${RAR[j].n}">${v}%</i>`:'').join('')}</div></div>
    <button class="btn ${r==='i'?'go':''}" data-bpk="${mode}:${r}" ${ok?'':'disabled'}>${cost}</button></div>`}
function luckyCardHTML(r){const B=LBUSTE[r],left=luckyLeft(r),ok=left>0&&(SAVE.gems||0)>=B.price.gems;
  return `<div class="pkc lk r-${r}"><div class="pkpic"><img src="${packImg('lucky',r,128)}" alt=""></div><div class="pkin"><b>${PACKN.lucky[r]}</b><span class="pkr" style="--rc:${PRC[r][0]}">${PRN[r]}</span>
    <small>${B.cards} Lucky Cards · ${left?`ne puoi comprare ancora <b>${left}</b> oggi`:'<b>finite per oggi</b>'}</small>
    <div class="odds">${B.odds.map((v,j)=>v?`<i style="--rc:${RAR[LRARI[j]].c}" title="${LRAR[j]}">${v}%</i>`:'').join('')}</div></div>
    <button class="btn go" data-blk="${r}" ${ok?'':'disabled'}><i class="gemS"></i>${B.price.gems}</button></div>`}
function keptHTML(mode){const K=SAVE.bustine[mode],L=PR.filter(r=>K[r]>0);if(!L.length)return '';
  return `<div class="secTitle"><h3>Da aprire</h3><small>Le bustine che hai messo da parte</small></div><div class="kept">${L.map(r=>`<button class="kpk" data-kpk="${mode}:${r}"><img src="${packImg(mode,r,96)}" alt=""><b>×${K[r]}</b><span>Apri</span></button>`).join('')}</div>`}
// the Zombie shop's pages, next to the Classic ones (the shop shows the ones of the mode)
{const tab=$('tabShop'),gold=$('spGold');const mk=(id,html)=>{const d=document.createElement('div');d.className='spage zsp';d.id=id;d.innerHTML=html;tab.insertBefore(d,gold);return d};
  mk('spZPacks','<div class="secTitle"><h3>Bustine Zombie</h3><small>Armi, accessori e Rottami</small></div><div class="shop" id="zshop"></div>');
  mk('spLucky','<div class="secTitle"><h3>Lucky Cards</h3><small id="luckyT"></small></div><p class="sub">Abilità per le partite Zombie: le usi alla Macchina della Fortuna sulla mappa. Poche al giorno, di nuovo a mezzanotte.</p><div class="shop" id="lshop"></div>');
  mk('spKept','<div id="keptBox"></div>');
  const ch=$('spChests').querySelector('.secTitle');ch.innerHTML='<h3>Bustine</h3><small>Carte, Essenza di muschio e oro: si aprono subito</small>'}
{const _rs=renderShop;renderShop=function(){_rs.apply(this,arguments);const z=zMode();
  for(const id of['spOffers','spDaily','spChests'])$(id).classList.toggle('zoff',z);for(const id of['spZPacks','spLucky'])$(id).classList.toggle('zoff',!z);
  const h=$('tabShop').querySelector('.pageHead small');if(h)h.textContent=z?'Rifornimenti per il camposanto':'Tutto per la tua avventura';
  if(z){$('zshop').innerHTML=PR.map(r=>packCardHTML('zombie',r)).join('');$('lshop').innerHTML=['c','r','e','l'].map(luckyCardHTML).join('');
    const t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);$('luckyT').innerHTML=`Di nuovo tra <b>${fmtH(mid-t)}</b>`}
  else $('shop').innerHTML=PR.map(r=>packCardHTML('classica',r)).join('');
  $('keptBox').innerHTML=keptHTML(z?'zombie':'classica')}}
function buyPack(mode,r){const B=BUSTE[r],pr=B.price;if(CHbusy)return;if(pr.gold){if(SAVE.gold<pr.gold)return;SAVE.gold-=pr.gold}else{if((SAVE.gems||0)<pr.gems)return;SAVE.gems-=pr.gems}
  save();renderGold();renderShop();sfx('coin');openPack(mode,r)}
function buyLucky(r){const B=LBUSTE[r];if(CHbusy||luckyLeft(r)<=0||(SAVE.gems||0)<B.price.gems)return;const L=luckyDay();SAVE.gems-=B.price.gems;L.bought[r]=(L.bought[r]||0)+1;save();renderGold();renderShop();sfx('gem');openPack('lucky',r)}
$('tabShop').addEventListener('click',e=>{const b=e.target.closest('[data-bpk],[data-blk],[data-kpk]');if(!b||b.disabled)return;
  if(b.dataset.bpk){const[m,r]=b.dataset.bpk.split(':');buyPack(m,r)}else if(b.dataset.blk)buyLucky(b.dataset.blk);else{const[m,r]=b.dataset.kpk.split(':');if(!CHbusy)openKept(m,r)}});
// the shop's timers while it is open
setInterval(()=>{if($('menu').hidden||$('tabShop').hidden||!zMode())return;const t=new Date(),mid=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1),el=$('luckyT');if(el)el.innerHTML=`Di nuovo tra <b>${fmtH(mid-t)}</b>`},1000);
// ------------------------------------------------------------------ the look
{const st=document.createElement('style');st.textContent=`
.slot5{position:relative;display:grid;grid-template-columns:96px minmax(0,1fr);grid-template-rows:auto auto auto;column-gap:10px;align-items:center;margin:12px 0 4px;padding:8px 12px 10px;border:3px solid var(--ink);border-radius:14px;
  background:radial-gradient(70% 140% at 18% 50%,rgba(255,216,74,.32),transparent 70%),linear-gradient(#3e2c4e,#1e1626);box-shadow:0 4px 0 var(--ink),inset 0 0 0 2px #ffd84a;color:var(--parch);text-align:left;width:100%;font-family:var(--body);cursor:pointer}
.slot5.r-cristallo{background:radial-gradient(70% 140% at 18% 50%,rgba(159,230,255,.38),transparent 70%),linear-gradient(#24305e,#121a36);box-shadow:0 4px 0 var(--ink),inset 0 0 0 2px #9fe6ff,0 0 18px rgba(159,230,255,.35)}
.slot5 .s5t{grid-column:1/3;font-family:var(--display);font-size:15px;color:#ffd84a;text-shadow:var(--tol-s);margin-bottom:2px}
.slot5 .s5q{grid-row:2/4;width:96px}.slot5 .s5q svg{width:100%;height:auto;display:block;filter:drop-shadow(0 4px 0 rgba(0,0,0,.4))}
.slot5 b{font-family:var(--display);font-weight:400;font-size:20px}.slot5 small{font-size:12px;opacity:.9;line-height:1.25}
.slot5.empty{cursor:default;background:rgba(0,0,0,.25);border-style:dashed;box-shadow:inset 0 0 0 2px rgba(255,216,74,.35)}.slot5.empty .s5q{opacity:.35;filter:grayscale(.6)}
.slot5.ready{animation:pulse 1.2s infinite}.slot5.ready .s5q{animation:wob 1.6s ease-in-out infinite}
.chestWrap.fifth svg{filter:drop-shadow(0 0 18px rgba(255,216,74,.7))}
.freeRow .pkI{width:44px;height:auto}
.pkI{width:100%;max-width:56px;height:auto;display:block;margin:auto;filter:drop-shadow(0 3px 0 rgba(0,0,0,.4))}
.rch .pkI,.wkc .pkI,.pchest .pkI,.pi .pkI,.dic .pkI{max-width:40px}
.pic .pkI{max-width:none;height:34px;width:auto}
.lic .pkI{max-width:none;height:44px;width:auto}.lday.big .lic .pkI{height:52px}.wkc .pkI{height:40px;width:auto}
#menu #shop,#menu #zshop,#menu #lshop{display:flex;flex-direction:column;gap:10px}
.pkc{position:relative;display:grid;grid-template-columns:70px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 10px 9px 8px;border:3px solid var(--ink);border-radius:var(--hewn,12px);box-shadow:0 5px 0 var(--ink),inset 0 2px 0 rgba(255,255,255,.08);
  background:radial-gradient(60% 120% at 12% 50%,color-mix(in srgb,var(--pg,#ffb35a) 35%,transparent),transparent 70%),linear-gradient(#3a2f26,#211a15)}
.pkc.r-c{--pg:#a6e36e}.pkc.r-r{--pg:#79b2ff}.pkc.r-e{--pg:#c98cff}.pkc.r-l{--pg:#ffc23a}.pkc.r-i{--pg:#ff5a2a;box-shadow:0 5px 0 var(--ink),inset 0 0 0 2px #ff6a2a,0 0 20px rgba(255,90,42,.35)}
.pkc.m-zombie,.pkc.lk{background:radial-gradient(60% 120% at 12% 50%,color-mix(in srgb,var(--pg) 30%,transparent),transparent 70%),linear-gradient(#232a22,#121611)}
.pkc .pkpic img{width:66px;height:auto;display:block;filter:drop-shadow(0 4px 0 rgba(0,0,0,.45))}.pkc.r-i .pkpic img,.pkc.r-l .pkpic img{animation:wob 2.4s ease-in-out infinite}
.pkc .pkin{min-width:0;display:flex;flex-direction:column;gap:2px}.pkc .pkin b{font-family:var(--display);font-weight:400;font-size:15.5px;line-height:1.1;color:#fff;text-shadow:var(--tol-s)}
.pkc .pkr{font-family:var(--display);font-size:11.5px;color:var(--rc)}.pkc small{font-size:11.5px;line-height:1.3;color:#e6dcc6}.pkc small .mI{width:14px;height:14px;vertical-align:-3px}
.pkc .odds{display:flex;flex-wrap:wrap;gap:3px}.pkc .odds i{font-style:normal;font-size:10px;padding:0 4px;border-radius:6px;border:1.5px solid var(--ink);background:var(--rc);color:#1b1612;font-weight:700}
.pkc .btn{font-size:15px;padding:8px 9px;white-space:nowrap}
.kept{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px}.kpk{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 8px;border:3px solid var(--ink);border-radius:12px;background:linear-gradient(#3a2f26,#211a15);color:#fff;font-family:var(--display);cursor:pointer}
.kpk img{width:46px}.kpk b{font-weight:400;position:absolute;top:2px;right:4px;font-size:14px;text-shadow:var(--tol-s)}.kpk span{font-size:13px;color:var(--gold)}
#menu.zmode .secTitle h3{color:#cfe8b0}
@media (prefers-reduced-motion:reduce){.slot5.ready,.slot5.ready .s5q,.pkc .pkpic img{animation:none!important}}`;document.head.appendChild(st)}
