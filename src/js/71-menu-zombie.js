// =====================================================================
// THE ZOMBIE MENU'S OWN THINGS (punti 29, 31, 34 e 43 del piano): the Arsenal (the zombie guns and the four accessories, with their
// cards, gold and Rottami), the Lucky Cards (the collection with how many you have, the one you bring into the match, the four slots and
// the fifth for the packs won in the matches), the Pass Zombie. They live in the same tabs and buttons as the Classic ones, which show
// what belongs to the mode you are in.
// =====================================================================
// ------------------------------------------------------------------ pictures: the guns fitted to their card, the Lucky Cards
// a gun drawn big on a spare canvas, cut to what was painted, then fitted in the icon
zGunIcon=function(id){return iconCv('g2:'+id,x=>{if(typeof ARMI==='undefined')return;const c=document.createElement('canvas');c.width=360;c.height=200;const g=c.getContext('2d'),sv=ctx;ctx=g;
  try{g.translate(150,110);g.scale(3,3);ARMI.arma(id,0,0,0,null)}finally{ctx=sv}
  const D=g.getImageData(0,0,360,200).data;let x0=360,y0=200,x1=0,y1=0;for(let y=0;y<200;y+=2)for(let xx=0;xx<360;xx+=2)if(D[(y*360+xx)*4+3]>20){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<=x0)return;const w=x1-x0+4,h=y1-y0+4,s=Math.min(86/w,70/h);x.save();x.translate(48,50);x.rotate(-.12);x.drawImage(c,x0-2,y0-2,w,h,-w*s/2,-h*s/2,w*s,h*s);x.restore()})};
// a Lucky Card's face: a tarot card, the frame of its rarity, the sign of its ability, its name
const LKC={};
function luckyCardImg(id,w){const k=id+w;if(LKC[k])return LKC[k];const L=LUCKY_BY[id],R=RAR[LRARI[L.rar]],d=Math.min(2,window.devicePixelRatio||1),W=Math.round(w*d),H=Math.round(w*1.45*d),c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');g.scale(W/100,H/145);g.lineJoin='round';
  g.beginPath();g.roundRect(3,3,94,139,9);g.fillStyle='#16120e';g.fill();g.lineWidth=3.4;g.strokeStyle=INK;g.stroke();
  g.beginPath();g.roundRect(8,8,84,129,6);const bg=g.createLinearGradient(0,8,0,137);bg.addColorStop(0,R.c);bg.addColorStop(.55,R.d);bg.addColorStop(1,'#120e0a');g.fillStyle=bg;g.fill();
  g.strokeStyle='rgba(255,230,170,.7)';g.lineWidth=1.2;g.stroke();g.strokeStyle='rgba(255,230,170,.35)';g.beginPath();g.roundRect(12,12,76,121,4);g.stroke();
  // the rays behind the sign and the little stars of the fortune-teller
  g.save();g.translate(50,58);for(let i=0;i<16;i++){g.rotate(TAU/16);g.fillStyle=i%2?'rgba(255,255,255,.08)':'rgba(255,255,255,.03)';g.beginPath();g.moveTo(-3,0);g.lineTo(0,-60);g.lineTo(3,0);g.closePath();g.fill()}g.restore();
  g.fillStyle='rgba(255,240,200,.85)';for(const[x,y] of[[18,20],[82,20],[18,125],[82,125]]){g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-1.6,-1.6,3.2,3.2);g.restore()}
  g.beginPath();g.arc(50,58,27,0,TAU);g.fillStyle='rgba(10,8,6,.45)';g.fill();g.strokeStyle='rgba(255,230,170,.55)';g.lineWidth=1.4;g.stroke();
  g.save();g.translate(50,58);luckyGlyph(g,id,1.05);g.restore();
  // the name on a band
  g.fillStyle='rgba(10,8,6,.7)';g.fillRect(10,98,80,30);g.font='10.5px "Lilita One",system-ui';g.textAlign='center';g.textBaseline='middle';
  const words=L.n.split(' '),lines=[];let cur='';for(const w0 of words){const t=cur?cur+' '+w0:w0;if(g.measureText(t).width>74&&cur){lines.push(cur);cur=w0}else cur=t}lines.push(cur);
  g.lineWidth=2.6;g.strokeStyle=INK;g.fillStyle='#fff';lines.slice(0,2).forEach((s,i)=>{const y=113+(i-(Math.min(2,lines.length)-1)/2)*11;g.strokeText(s,50,y);g.fillText(s,50,y)});
  g.font='7px "Lilita One",system-ui';g.fillStyle=R.c;g.strokeText(LRAR[L.rar].toUpperCase(),50,20);g.fillText(LRAR[L.rar].toUpperCase(),50,20);
  return LKC[k]=c.toDataURL()}
// ------------------------------------------------------------------ the save of the Pass Zombie
const ZPASS_T=30,ZPASS_XP=100,ZPASS_COST=500;
// two dark outfits of the zombie pass (their drawings come with the new outfits; for now the colours of the coat)
// (the outfits of the Zombie Pass, stracciato and becchino, are in sprite/eroe3d/vestiti3d.js: src/js/72-vestiti.js puts them in SKINS)
function zpassReward(i,prem){
  if(prem){if(i===15)return{k:'skin',v:'stracciato'};if(i===30)return{k:'skin',v:'becchino'};if(i===10||i===25)return{k:'lpack',v:'l'};if(i===20)return{k:'zpack',v:'l'};
    return i%5===0?{k:'zpack',v:'e'}:i%3===0?{k:'gems',v:10+Math.floor(i/2)}:i%2===0?{k:'rot',v:20+2*i}:{k:'lpack',v:i>=15?'r':'c'}}
  return i%5===0?{k:'lpack',v:i>=20?'e':'r'}:i%3===0?{k:'rot',v:8+i}:i%2===0?{k:'gold',v:80+10*i}:{k:'zpack',v:i>=15?'r':'c'}}
function ensureZPass(){const s=seasonIdx();if(!SAVE.zpass||SAVE.zpass.s!==s)SAVE.zpass={s,xp:0,f:{},p:{},gold:false};return SAVE.zpass}
const zpassLvl=()=>Math.min(ZPASS_T,Math.floor(ensureZPass().xp/ZPASS_XP));
function zPassXP(v){const P0=ensureZPass(),l0=zpassLvl();P0.xp+=Math.max(0,Math.round(v));const l1=zpassLvl();save();if(l1>l0)achPop('Pass Zombie','Hai raggiunto il livello '+l1+'!','trophy');return l1-l0}
const zpassReady=()=>{const P0=ensureZPass(),l=zpassLvl();let n=0;for(let i=1;i<=l;i++){if(!P0.f[i])n++;if(P0.gold&&!P0.p[i])n++}return n};
function zpassLabel(r){return r.k==='gold'?`${r.v} oro`:r.k==='gems'?`${r.v} cristalli`:r.k==='rot'?`${r.v} Rottami`:r.k==='zpack'?'Bustina Zombie '+PRN[r.v]:r.k==='lpack'?'Lucky Cards '+PRN[r.v]:r.k==='skin'?SKINS[r.v].n:''}
function zpassIcon(r){if(r.k==='gold')return coinPile(r.v>400?1:0);if(r.k==='gems')return '<span class="bigGem"></span>';if(r.k==='rot')return MAT_SVG.rot;
  if(r.k==='zpack')return `<img class="pkI" src="${packImg('zombie',r.v,96)}" alt="">`;if(r.k==='lpack')return `<img class="pkI" src="${packImg('lucky',r.v,96)}" alt="">`;return skinIcon(r.v)}
function grantZPass(r){if(r.k==='gold'){SAVE.gold+=r.v;sfx('coin')}else if(r.k==='gems'){SAVE.gems=(SAVE.gems||0)+r.v;sfx('gem')}else if(r.k==='rot'){SAVE.mat.rot+=r.v;sfx('upgrade')}
  else if(r.k==='skin'){SAVE.skins=SAVE.skins||{};SAVE.skins[r.v]=1;SAVE.skinLv[r.v]=SAVE.skinLv[r.v]||1;sfx('victory');achPop('Nuovo vestito!',SKINS[r.v].n+': indossalo dal Guardaroba','unlock')}
  toast('+'+zpassLabel(r));renderGold();save();if(r.k==='zpack'||r.k==='lpack'){closeSheet();openPack(r.k==='zpack'?'zombie':'lucky',r.v)}}
function fillZPass(){const P0=ensureZPass(),l=zpassLvl(),into=P0.xp-l*ZPASS_XP,mx=l>=ZPASS_T;lastSheetHTML='';
  let rows='';for(let i=1;i<=ZPASS_T;i++){const fr=zpassReward(i,false),pr=zpassReward(i,true),reach=l>=i;
    const cell=(r,prem,got)=>`<div class="pcell ${prem?'gold':''} ${got?'got':reach&&(!prem||P0.gold)?'ready':''} ${prem&&!P0.gold?'lockd':''}"><div class="pic">${zpassIcon(r)}</div><small>${zpassLabel(r)}</small>${got?'<i class="pok">✓</i>':reach&&(!prem||P0.gold)?`<button class="btn go" data-zpass="${i}" data-prem="${prem?1:0}">Riscatta</button>`:prem&&!P0.gold?`<i class="plk">${LOCK}</i>`:''}</div>`;
    rows+=`<div class="prow ${reach?'reach':''}"><span class="plv">${i}</span>${cell(fr,false,!!P0.f[i])}${cell(pr,true,!!P0.p[i])}</div>`}
  $('sheet').innerHTML=`<h2>Pass Zombie</h2><p class="lead">Stagione ${P0.s+1} del camposanto · finisce tra <b>${fmtH(seasonEnd()-Date.now())}</b></p>
    <div class="phead"><span class="plvBig">${l}</span><div class="pbar"><i style="width:${mx?100:into/ZPASS_XP*100}%"></i><span>${mx?'Livello massimo!':`${into}/${ZPASS_XP} punti`}</span></div></div>
    <p class="lead small">Guadagni punti giocando la modalità Zombie: round superati, zombie uccisi, boss.</p>
    ${P0.gold?'<p class="pgold on">Pass del Becchino attivo</p>':`<button class="btn go pbuy" data-zpassbuy="1" ${(SAVE.gems||0)>=ZPASS_COST?'':'disabled'}>Sblocca il Pass del Becchino · <i class="gemS"></i>${ZPASS_COST}</button>`}
    <div class="ptracks"><span></span><b>Gratis</b><b class="g">Pass del Becchino</b></div><div class="prows">${rows}</div><button class="btn alt close">Chiudi</button>`;
  setTimeout(()=>{const el=$('sheet').querySelectorAll('.prow.reach');if(el.length)el[el.length-1].scrollIntoView({block:'center'})},40)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-zpass]'),buy=e.target.closest('[data-zpassbuy]');if(!b&&!buy)return;const P0=ensureZPass();
  if(buy&&!buy.disabled){if((SAVE.gems||0)<ZPASS_COST||P0.gold)return;SAVE.gems-=ZPASS_COST;P0.gold=true;save();renderGold();sfx('victory');vib([40,30,40,30,120]);toast('Pass del Becchino sbloccato!');fillZPass();renderSide();return}
  if(!b||CHbusy)return;const i=+b.dataset.zpass,prem=b.dataset.prem==='1';if(zpassLvl()<i)return;if(prem){if(!P0.gold||P0.p[i])return;P0.p[i]=1}else{if(P0.f[i])return;P0.f[i]=1}
  grantZPass(zpassReward(i,prem));if(SHEET==='zpass')fillZPass();renderSide()});
// the zombie matches fill the Pass Zombie (not the Classic pass)
{const _zf=zFine;zFine=function(oro,R,kills){const _p=passXP;passXP=v=>zPassXP(v);try{return _zf.apply(this,arguments)}finally{passXP=_p}}}
// ------------------------------------------------------------------ the Lucky packs won in the matches: four slots and the fifth
const lslotState=s=>{if(s.state==='unlocking'&&Date.now()>=s.end)s.state='ready';return s.state};
const lUnlocking=()=>SAVE.lucky.slots.some(s=>s&&lslotState(s)==='unlocking');
const lSkip=s=>Math.max(5,Math.ceil((s.end-Date.now())/6000)*5);
function lslotHTML(s,i){if(!s)return '<div class="slot empty"><span>Vuoto</span></div>';const st=lslotState(s);let lab;
  if(st==='ready')lab='<b>Apri!</b><small>&nbsp;</small>';else if(st==='unlocking')lab=`<b>${fmtT(s.end-Date.now())}</b><small>${s.confirm?'Tocca ancora: '+lSkip(s)+' oro':'Apri ora: '+lSkip(s)+' oro'}</small>`;
  else lab=lUnlocking()&&i<4?`<b>In attesa</b><small>${fmtT(LTIME[s.rar]*1000)}</small>`:`<b>Sblocca</b><small>${fmtT(LTIME[s.rar]*1000)}</small>`;
  return `<button class="slot lslot ${st}" data-li="${i}" aria-label="Lucky Cards ${PRN[s.rar]}"><img class="pkI" src="${packImg('lucky',s.rar,96)}" alt="">${lab}</button>`}
function fillLSlots(){const L=SAVE.lucky,s5=L.slot5;
  const five=s5?`<button class="slot slot5 lk5 ${lslotState(s5)} r-${s5.rar}" data-li="4"><span class="s5t">Quinta bustina · ${PRN[s5.rar]}</span><div class="s5q"><img class="pkI" src="${packImg('lucky',s5.rar,128)}" alt=""></div>${(()=>{const st=lslotState(s5);return st==='ready'?'<b>Apri!</b>':st==='unlocking'?`<b>${fmtT(s5.end-Date.now())}</b><small>${s5.confirm?'Tocca ancora: '+lSkip(s5)+' oro':'Apri ora: '+lSkip(s5)+' oro'}</small>`:`<b>Sblocca</b><small>${fmtT(LTIME[s5.rar]*1000)} · si sblocca da sola</small>`})()}</button>`
    :`<div class="slot5 lk5 empty"><span class="s5t">Quinta bustina</span><div class="s5q"><img class="pkI" src="${packImg('lucky','l',128)}" alt=""></div><small>${L.next5>Date.now()?'Di nuovo possibile tra '+fmtH(L.next5-Date.now()):'Quando i quattro posti sono pieni, la prossima bustina vinta arriva qui: Epica o Leggendaria'}</small></div>`;
  const html=`<h2>Lucky Cards vinte</h2><p class="lead">Le vinci finendo le partite Zombie, dal round 3 in poi (più lontano arrivi, più sono rare): aspettano qui e si sbloccano una alla volta.</p>
    <div class="slots cslots">${L.slots.map(lslotHTML).join('')}</div>${five}<p class="lead small">Con tutti i posti pieni la bustina vinta diventa oro (un po' meno di quanto vale), e te lo diciamo.</p>
    <button class="btn" data-lkopen="1">Le tue Lucky Cards</button><button class="btn alt close">Chiudi</button>`;
  if(html!==lastSheetHTML){$('sheet').innerHTML=html;lastSheetHTML=html}}
function tapLSlot(i){const L=SAVE.lucky,s=i===4?L.slot5:L.slots[i];if(!s)return;const st=lslotState(s);
  if(st==='ready'){if(CHbusy)return;if(i===4)L.slot5=null;else L.slots[i]=null;save();renderPlay();openPack('lucky',s.rar)}
  else if(st==='locked'){if(i<4&&lUnlocking()){toast('Puoi sbloccarne una alla volta');return}s.state='unlocking';s.end=Date.now()+LTIME[s.rar]*1000;save();renderPlay();sfx('ui')}
  else{const c=lSkip(s);if(!s.confirm){s.confirm=true;renderPlay();setTimeout(()=>{s.confirm=false;renderPlay()},3000);return}
    if(SAVE.gold>=c){SAVE.gold-=c;s.state='ready';s.confirm=false;save();renderGold();renderPlay()}else{s.confirm=false;toast(`Ti servono ${c} oro`);renderPlay()}}
  if(SHEET==='lslots'){lastSheetHTML='';fillLSlots()}}
$('sheet').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-li]');if(!b)return;e.preventDefault();tapLSlot(+b.dataset.li)});
// ------------------------------------------------------------------ the collection of the Lucky Cards and the one you bring
function fillLucky(){lastSheetHTML='';const L=SAVE.lucky,pick=L.pick&&L.inv[L.pick]>0?L.pick:null,tot=LUCKY.reduce((a,c)=>a+(L.inv[c.id]||0),0);
  $('sheet').innerHTML=`<h2>Le tue Lucky Cards</h2><p class="lead">Abilità per le partite Zombie: <b>${tot}</b> carte. Scegline una da portare: in partita la usi alla <b>Macchina della Fortuna</b> (al massimo 2 dello stesso tipo in una partita) e si consuma.</p>
    <div class="lkPick">${pick?`<img src="${luckyCardImg(pick,60)}" alt=""><div><b>In tasca: ${LUCKY_BY[pick].n}</b><span>Ne hai ${L.inv[pick]}. Toccala di nuovo per lasciarla.</span></div>`:'<div><b>In tasca: nessuna carta</b><span>Tocca una carta che hai per portarla nella prossima partita.</span></div>'}</div>
    <div class="lkGrid">${LUCKY.map((c,i)=>{const n=L.inv[c.id]||0;return `<button class="lkc r${c.rar} ${n?'':'none'} ${pick===c.id?'on':''}" data-lk="${c.id}" style="--d:${(i*.37)%2}s"><span class="lkf"><img src="${luckyCardImg(c.id,92)}" alt=""></span><b>×${n}</b><small>${c.d}</small></button>`}).join('')}</div>
    <button class="btn" data-lkshop="1">Comprane nella Bottega</button><button class="btn alt close">Chiudi</button>`}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('[data-lk],[data-lkshop],[data-lkopen]');if(!b)return;
  if(b.dataset.lkshop){closeSheet();setTab('tabShop');setShopPage('spLucky');return}if(b.dataset.lkopen){openSheet('lucky');return}
  const id=b.dataset.lk,L=SAVE.lucky;if(!(L.inv[id]>0)){toast('Non ce l\'hai ancora: la trovi nelle bustine Lucky Cards');sfx('ui');return}
  L.pick=L.pick===id?null:id;save();sfx(L.pick?'upgrade':'ui');vib(15);fillLucky();renderPlay()});
{const _os=openSheet;openSheet=function(kind){if(kind==='zpass'||kind==='lslots'||kind==='lucky'){SHEET=kind;sfx('ui');lastSheetHTML='';({zpass:fillZPass,lslots:fillLSlots,lucky:fillLucky})[kind]();$('sheetScr').hidden=false;return}return _os(kind)}}
// ------------------------------------------------------------------ the buttons of the Zombie home
{const mk=(id,lab,svg,side,before)=>{const b=document.createElement('button');b.className='qbtn zonly';b.id=id;b.setAttribute('aria-label',lab);b.innerHTML=svg;const col=document.querySelector('.sideBtns.'+side);col.insertBefore(b,before?$(before):null);return b};
  mk('luckInvBtn','Lucky Cards',`<span class="lkIco"></span><small>Lucky</small><em class="pip" id="luckInvN" hidden></em>`,'l');
  mk('zPassBtn','Pass Zombie',`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 27V12c0-5 3.6-9 8-9s8 4 8 9v15z" fill="#6a7a5a" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 14c0-2 1.8-4 4-4s4 2 4 4" fill="none" stroke="#0a0c0b" stroke-width="2"/><circle cx="13.5" cy="18" r="2" fill="#9dff6a"/><circle cx="18.5" cy="18" r="2" fill="#9dff6a"/><path d="M5 27h22" stroke="#0a0c0b" stroke-width="3" stroke-linecap="round"/><path d="M13 23h6" stroke="#0a0c0b" stroke-width="2" stroke-linecap="round"/></svg><small>Pass</small><em class="plvl" id="zPassLvl">0</em><i class="bang" id="zPassBang" hidden>!</i>`,'r','passBtn');
  mk('luckSlotBtn','Lucky Cards vinte','','r','passBtn');
  mk('zShopBtn','Bottega Zombie',`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 13h20v14H6z" fill="#5a4636" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/><path d="M4 13l3-7h18l3 7z" fill="#8a3a2a" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 27v-8h8v8" fill="#2a2220" stroke="#0a0c0b" stroke-width="2"/><circle cx="16" cy="9.5" r="1.6" fill="#ffd84a"/></svg><small>Bottega</small>`,'r','passBtn');
  $('luckInvBtn').onclick=()=>openSheet('lucky');$('zPassBtn').onclick=()=>openSheet('zpass');$('luckSlotBtn').onclick=()=>openSheet('lslots');$('zShopBtn').onclick=()=>{sfx('ui');setTab('tabShop');setShopPage('spLucky')}}
function renderLuckBtn(){const L=SAVE.lucky,sl=L.slots.filter(Boolean).concat(L.slot5?[L.slot5]:[]),rd=sl.filter(s=>lslotState(s)==='ready'),un=sl.find(s=>lslotState(s)==='unlocking'),lk=sl.find(s=>lslotState(s)==='locked');
  const s0=rd[0]||un||lk,ic=`<img class="pkI" src="${packImg('lucky',s0?s0.rar:'c',64)}" alt="">`,lab=rd.length?'Apri!':un?fmtT(un.end-Date.now()).replace(/ \d+s$/,''):lk?'Sblocca':'Vinte';
  const html=`${ic}<small>${lab}</small>${rd.length?`<em class="pip">${rd.length}</em>`:lk&&!un?'<i class="bang">!</i>':''}`,el=$('luckSlotBtn');el.classList.toggle('hot',!!rd.length);el.classList.toggle('none',!s0);if(el._h!==html){el.innerHTML=html;el._h=html}
  const n=LUCKY.reduce((a,c)=>a+(L.inv[c.id]||0),0),p=$('luckInvN');p.hidden=!n;p.textContent=n;
  const zr=zpassReady();$('zPassBang').hidden=!zr;$('zPassBtn').classList.toggle('hot',!!zr);$('zPassLvl').textContent=zpassLvl();
  if(SHEET==='lslots')fillLSlots()}
{const _rs=renderSide;renderSide=function(){_rs.apply(this,arguments);try{renderLuckBtn()}catch(e){}}}
{const _a=applyModeUI;applyModeUI=function(){_a.apply(this,arguments);const z=zMode();document.querySelectorAll('.zonly').forEach(e=>e.classList.toggle('zoff',!z));$('homeGear').classList.remove('zoff');
  const gb=document.querySelector('#tabs button[data-tab="tabGear"] span, #tabs button[data-tab="tabGear"] b');if(gb)gb.textContent=z?'Arsenale':'Armeria'}}
// ------------------------------------------------------------------ the Arsenal (the Armoury tab in the Zombie mode)
{const zs=document.createElement('div');zs.id='zArs';zs.className='zonly zoff';zs.innerHTML=`<div class="secTitle"><h3>Accessori</h3><small>Sempre attivi: salgono con le loro carte</small></div><div class="coll" id="zAcc"></div>
  <div class="secTitle"><h3>Armi zombie</h3><small id="zGunN"></small></div><div class="coll" id="zGuns"></div><p class="sub" id="zMatP"></p>`;$('gearStage').after(zs)}
const zCardBar=(o,need,max)=>{if(!o)return '<div class="bar"><span>da trovare</span></div>';if(max)return '<div class="bar full"><i style="width:100%"></i><span>MAX</span></div>';const p=Math.min(1,o.cards/need);return `<div class="bar ${p>=1?'full':''}"><i style="width:${p*100}%"></i><span>${o.cards}/${need}</span></div>`};
function zcard(kind,id,extra){const o=kind==='gun'?SAVE.z.guns[id]:SAVE.z.acc[id],rar=kind==='gun'?zGunInfo(id).rar:ZACC_BY[id].rar,r=RAR[rar],U=o?zUpInfo(kind,id):null,
    icon=kind==='gun'?zGunIcon(id):zAccIcon(id),ready=o&&o.lvl<MAXLV&&o.cards>=needCards(o.lvl);
  return `<button class="icard zc ${o?'':'locked'}" data-zk="${kind}" data-zid="${id}" style="--rc:${r.c};--rc2:${r.d}" ${extra||''}>${ready?'<em class="up">▲</em>':''}${icon}<span class="lv">${o?'Liv. '+o.lvl:'?'}</span>${zCardBar(o,needCards(o?o.lvl:1),o&&o.lvl>=MAXLV)}</button>`}
function renderZArs(){const own=zGuns().filter(id=>SAVE.z.guns[id]).length;
  $('zAcc').innerHTML=ZACC.map(a=>zcard('acc',a.id)).join('');$('zGuns').innerHTML=zGuns().map(id=>zcard('gun',id)).join('');$('zGunN').textContent=`${own} di ${zGuns().length} trovate`;
  $('zMatP').innerHTML=`Hai <b>${SAVE.mat.rot}</b> ${MAT_SVG.rot.replace('<svg ','<svg class="mI" ')} Rottami: dal livello 5 servono per migliorare armi e accessori. Li trovi nelle bustine Zombie e nel Pass Zombie.`;
  const g=SAVE.z.gun,pick=SAVE.lucky.pick&&SAVE.lucky.inv[SAVE.lucky.pick]>0?SAVE.lucky.pick:null;
  $('eqL').innerHTML=`<div class="eqslot">${zcard('gun',g,'data-start="1"')}<small>In mano</small></div>`;
  $('eqR').innerHTML=`<div class="eqslot"><button class="icard lkSlot ${pick?'':'empty'}" data-lkopen="1" style="--rc:${pick?RAR[LRARI[LUCKY_BY[pick].rar]].c:'#6a6357'};--rc2:${pick?RAR[LRARI[LUCKY_BY[pick].rar]].d:'#2a2622'}">${pick?`<img class="lkThumb" src="${luckyCardImg(pick,46)}" alt=""><span class="lv">×${SAVE.lucky.inv[pick]}</span>`:'<span>+</span>'}</button><small>Lucky Card</small></div>`;
  $('gearPow').innerHTML=`Rottami <b>${SAVE.mat.rot}</b>`;const h=$('tabGear').querySelector('.pageHead h2');if(h)h.textContent='Arsenale'}
{const _rg=renderGear;renderGear=function(){const z=zMode();for(const s of['coll','setBox'])$(s).classList.toggle('zoff',z);$('tabGear').querySelectorAll(':scope>.secTitle').forEach(e=>e.classList.toggle('zoff',z));$('zArs').classList.toggle('zoff',!z);
  if(z){renderZArs();return}const h=$('tabGear').querySelector('.pageHead h2');if(h)h.textContent='Armeria';return _rg.apply(this,arguments)}}
// the hero of the Arsenal holds the gun he brings
{const _dp=drawHeroPreview;drawHeroPreview=function(dt,cvx,hid){if(!(zMode()&&cvx===$('gearCv')))return _dp.apply(this,arguments);const _hs=heroStyle;heroStyle=h=>({..._hs('arciere'),gun:SAVE.z.gun});try{return _dp.call(this,dt,cvx,'arciere')}finally{heroStyle=_hs}}}
$('tabGear').addEventListener('click',e=>{const b=e.target.closest('.zc,[data-lkopen]');if(!b||!zMode())return;e.stopPropagation();sfx('ui');if(b.dataset.lkopen){openSheet('lucky');return}
  const o=b.dataset.zk==='gun'?SAVE.z.guns[b.dataset.zid]:SAVE.z.acc[b.dataset.zid];if(!o){toast(b.dataset.zk==='gun'?'La trovi nelle bustine Zombie, sui muri o nella Bara':'Lo trovi nelle bustine Zombie');return}openZItem(b.dataset.zk,b.dataset.zid)},true);
// the sheet of a gun or an accessory: what it does now and at the next level, the upgrade, the gun to bring
function openZItem(kind,id){const o=kind==='gun'?SAVE.z.guns[id]:SAVE.z.acc[id];if(!o)return;const U=zUpInfo(kind,id),gi=kind==='gun'?zGunInfo(id):null,A=kind==='acc'?ZACC_BY[id]:null,rar=gi?gi.rar:A.rar,r=RAR[rar],
    D=gi&&typeof ARMI!=='undefined'?ARMI.DATI[id]:null,m0=zGunMul(o.lvl),m1=zGunMul(Math.min(MAXLV,o.lvl+1)),nx=o.lvl<MAXLV;
  let stats='';
  if(D){const row=(n,a,b)=>`<div><span>${n}</span><b>${a}${nx&&b!==a?` <i>→ ${b}</i>`:''}</b></div>`;stats=row('Danno',Math.round(D.dmg*m0.dmg)+(D.pel>1?'×'+D.pel:''),Math.round(D.dmg*m1.dmg)+(D.pel>1?'×'+D.pel:''))+row('Ricarica',(D.rel*m0.rel).toFixed(2)+' s',(D.rel*m1.rel).toFixed(2)+' s')+row('Colpi',D.mag,D.mag)+row('Cadenza',D.rate+'/s',D.rate+'/s')}
  else{const pc=l=>Math.round(A.per*l*100);stats=`<div><span>${{reload:'Ricarica',ammo:'Colpi di scorta',speed:'Velocità',cash:'Monete'}[A.fx]}</span><b>${A.fx==='reload'?'−':'+'}${pc(o.lvl)}%${nx?` <i>→ ${A.fx==='reload'?'−':'+'}${pc(o.lvl+1)}%</i>`:''}</b></div>`}
  const start=gi&&zStartable(id),inHand=gi&&SAVE.z.gun===id,ok=U&&U.ok;
  $('itemPanel').innerHTML=`<div class="ihead" style="--rc:${r.c};--rc2:${r.d}"><div class="iicon">${gi?zGunIcon(id):zAccIcon(id)}</div><div><span class="tag" style="color:${r.c}">${r.n} · ${gi?'Arma zombie':'Accessorio zombie'}</span><h2>${gi?gi.n:A.n}</h2><span class="lvbig">Livello ${o.lvl}${o.lvl>=MAXLV?' (massimo)':''}</span></div></div>
    <div class="stats">${stats}</div><p class="perk">${gi?gi.d:A.d}${gi&&!start?' <b>Le armi epiche e leggendarie non si portano: si trovano sulla mappa (muri e Bara), ma il loro livello vale lo stesso.</b>':''}</p>
    <div><small class="muted">Carte per il prossimo livello</small>${zCardBar(o,needCards(o.lvl),o.lvl>=MAXLV)}</div>
    <div class="row">${gi?(inHand?'<button class="btn alt" disabled>In mano</button>':start?'<button class="btn alt" data-zact="hand">Porta in partita</button>':''):''}
      ${nx?`<button class="btn" data-zact="up" ${ok?'':'disabled'}>Migliora · ${U.gold} oro${U.rot?` + ${U.rot} ${MAT_SVG.rot.replace('<svg ','<svg class="mI" ')}`:''}</button>`:''}</div>
    ${nx&&!ok?`<small class="muted">${o.cards<U.need?`Ti mancano ${U.need-o.cards} carte: le trovi nelle bustine Zombie.`:SAVE.gold<U.gold?`Ti mancano ${U.gold-SAVE.gold} oro.`:`Ti mancano ${U.rot-SAVE.mat.rot} Rottami.`}</small>`:''}
    <button class="btn alt" data-zact="close">Chiudi</button>`;
  $('itemScr').hidden=false;
  $('itemPanel').onclick=e=>{const a=e.target.closest('[data-zact]');if(!a||a.disabled)return;const act=a.dataset.zact;
    if(act==='close')closeItem();else if(act==='hand'){SAVE.z.gun=id;save();sfx('upgrade');toast(gi.n+' in mano');renderGear();renderPlay();openZItem(kind,id)}
    else if(act==='up'){if(zUp(kind,id)){renderGold();renderGear();renderPlay();openZItem(kind,id);toast(`${gi?gi.n:A.n}: livello ${o.lvl}!`)}}}}
// ------------------------------------------------------------------ the row under the hero by the fire: the gun, the Lucky Card, the Arsenal
{const _rr=renderGearRow;renderGearRow=function(){if(!zMode()){const el=$('homeGear');if(el._z){el._z=false;el._h=''}return _rr.apply(this,arguments)}
  const g=SAVE.z.gun,o=SAVE.z.guns[g]||{lvl:1},r=RAR[zGunInfo(g).rar],L=SAVE.lucky,pick=L.pick&&L.inv[L.pick]>0?L.pick:null,acc=ZACC.filter(a=>SAVE.z.acc[a.id]).length;
  const html=`<button class="hgs zg" data-zh="gun" style="--rc:${r.c};--rc2:${r.d}" aria-label="Arma">${zGunIcon(g)}<b>Liv. ${o.lvl}</b></button>
    <button class="hgs zg ${pick?'':'empty'}" data-zh="lucky" ${pick?`style="--rc:${RAR[LRARI[LUCKY_BY[pick].rar]].c};--rc2:${RAR[LRARI[LUCKY_BY[pick].rar]].d}"`:''} aria-label="Lucky Card">${pick?`<img class="lkThumb" src="${luckyCardImg(pick,40)}" alt=""><b>×${L.inv[pick]}</b>`:'+<small>Lucky</small>'}</button>
    <button class="hgs zg" data-zh="ars" aria-label="Arsenale">${zAccIcon('zaino')}<b>${acc}/4</b></button>`;
  const el=$('homeGear');el._z=true;if(el._h!==html){el.innerHTML=html;el._h=html}}}
$('homeGear').addEventListener('click',e=>{const b=e.target.closest('[data-zh]');if(!b)return;e.stopPropagation();sfx('ui');const k=b.dataset.zh;if(k==='gun')openZItem('gun',SAVE.z.gun);else if(k==='lucky')openSheet('lucky');else setTab('tabGear')},true);
// ------------------------------------------------------------------ the look
{const st=document.createElement('style');st.textContent=`
.icard .cicon{width:52px;height:52px;display:block;margin:0 auto}.iicon .cicon{width:100%;height:auto;display:block}.hgs .cicon{width:40px;height:40px;display:block;margin:0 auto}
.icard.zc.locked .cicon{filter:brightness(0) opacity(.45)}
.lkIco{display:block;width:30px;height:36px;margin:2px auto 0;border:2px solid #0a0c0b;border-radius:5px;background:linear-gradient(160deg,#2a5a34,#0e1a10);box-shadow:inset 0 0 0 2px #c8b070;position:relative}
.lkIco::after{content:'';position:absolute;inset:6px 5px;background:radial-gradient(circle at 50% 50%,#ffd84a 0 22%,transparent 24%),conic-gradient(from 45deg,#7bd06a 0 25%,transparent 0 50%,#7bd06a 0 75%,transparent 0);border-radius:50%}
.qbtn .pkI{max-width:none;height:34px;width:auto;margin:1px auto 0}.qbtn.none{opacity:.7}
.lkSlot{min-height:96px;justify-content:center}.lkSlot.empty span{font-size:30px;color:#cfc6b0}.lkThumb{width:46px;display:block;margin:0 auto;filter:drop-shadow(0 3px 0 rgba(0,0,0,.4))}.hgs .lkThumb{width:28px;margin:2px auto 0}
.hgs.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;color:#cfc6b0;font-size:20px}.hgs small{font-size:9px;line-height:1}
.lkPick{display:flex;align-items:center;gap:12px;margin:4px 0 12px;padding:8px 12px;border:2.5px solid var(--crInk,#0a0c0b);border-radius:12px;background:linear-gradient(100deg,rgba(60,90,50,.55),rgba(20,24,18,.6))}
.lkPick img{width:44px;filter:drop-shadow(0 3px 0 rgba(0,0,0,.4))}.lkPick b{display:block;font-family:var(--display);font-weight:400;font-size:16px;color:#fff;text-shadow:var(--tol-s)}.lkPick span{font-size:12.5px}
.lkGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
.lkc{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 2px 6px;border:0;background:none;color:inherit;font-family:var(--body);cursor:pointer;-webkit-tap-highlight-color:transparent}
.lkc .lkf{position:relative;display:block;width:100%;max-width:96px;border-radius:9px;overflow:hidden;animation:lkfloat 3.2s var(--d,0s) ease-in-out infinite;filter:drop-shadow(0 5px 0 rgba(0,0,0,.45))}
.lkc .lkf img{display:block;width:100%}
.lkc .lkf::after{content:'';position:absolute;inset:-20% -60%;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%);transform:translateX(-70%);animation:lkshine 4.5s var(--d,0s) ease-in-out infinite}
.lkc.r2 .lkf,.lkc.r3 .lkf{box-shadow:0 0 14px rgba(255,216,74,.5)}.lkc.r3 .lkf{animation:lkfloat 3.2s var(--d,0s) ease-in-out infinite,lkglow 1.8s ease-in-out infinite alternate}
.lkc b{position:absolute;top:2px;right:6px;padding:0 6px;border:2px solid #0a0c0b;border-radius:999px;background:#e5484d;color:#fff;font-family:var(--display);font-weight:400;font-size:14px;text-shadow:var(--tol-s)}
.lkc small{font-size:10.5px;line-height:1.2;text-align:center;opacity:.85}
.lkc.none .lkf{filter:grayscale(1) brightness(.45) drop-shadow(0 5px 0 rgba(0,0,0,.45))}.lkc.none b{background:#5a5550}.lkc.none .lkf::after{display:none}
.lkc.on .lkf{outline:3px solid #9dff6a;outline-offset:2px;box-shadow:0 0 18px rgba(157,255,106,.7)}
@keyframes lkfloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}
@keyframes lkshine{0%,62%{transform:translateX(-70%)}100%{transform:translateX(70%)}}
@keyframes lkglow{to{box-shadow:0 0 24px rgba(255,216,74,.85)}}
.slot.lslot .pkI{height:52px;width:auto;max-width:none}.slot5.lk5{background:radial-gradient(70% 140% at 18% 50%,rgba(125,255,160,.28),transparent 70%),linear-gradient(#1c2a1e,#0e140f);box-shadow:0 4px 0 var(--ink),inset 0 0 0 2px #7dffa0}
.slot5.lk5.r-l{box-shadow:0 4px 0 var(--ink),inset 0 0 0 2px #ffd84a,0 0 18px rgba(255,216,74,.35)}.slot5.lk5 .s5q img{height:84px;width:auto;max-width:none;display:block;margin:auto}
.mI{width:16px;height:16px;vertical-align:-3px}
#zArs .coll{margin-bottom:6px}
@media (prefers-reduced-motion:reduce){.lkc .lkf,.lkc .lkf::after{animation:none!important}}`;document.head.appendChild(st)}
applyModeUI();
// ------------------------------------------------------------------ what the Zombie progression does in a match (punto 29): every gun hits
// harder and reloads faster with its level, the Fondina shortens every reload, the Zaino gives more spare bullets, the Stivali a faster run,
// the Talismano more coins for every zombie; the outfit's level gives more health (in both modes); the match starts with the gun you chose.
// The guns' numbers are changed for the match only (ARMI.DATI, from the first copy) and put back when you leave the map
const ZD0={};
function zApplyBonus(){if(typeof ARMI==='undefined')return;const B=zBonus();
  for(const id of ARMI.ORDINE){const D=ARMI.DATI[id];if(!ZD0[id])ZD0[id]={dmg:D.dmg,rel:D.rel,res:D.res};const o=ZD0[id],m=zGunMul(SAVE.z.guns[id]?SAVE.z.guns[id].lvl:1);
    D.dmg=Math.round(o.dmg*m.dmg*100)/100;D.rel=Math.round(o.rel*m.rel*B.reload*1000)/1000;D.res=Math.round(o.res*B.ammo)}
  ZM.W.startGun=zStartable(SAVE.z.gun)?SAVE.z.gun:'pistola';
  if(ZM.fortuna)ZM.fortuna.LK.base={spd:B.speed,cash:B.cash,dmg:1};if(ZM.W.director&&ZM.W.director.PZ)ZM.W.director.PZ.vita=Math.round(100*B.hp)}
function zRestoreBonus(){if(typeof ARMI==='undefined')return;for(const id in ZD0)Object.assign(ARMI.DATI[id],ZD0[id])}
{const _zs=zStart;zStart=function(){try{zApplyBonus()}catch(e){console.error(e)}return _zs.apply(this,arguments)}}
{const _ze=zExit;zExit=function(){const r=_ze.apply(this,arguments);zRestoreBonus();return r}}
// the menu shows the guns' own numbers, not the ones of a match in progress
{const _oz=openZItem;openZItem=function(kind,id){const keep=ZD0[id]&&typeof ARMI!=='undefined'?{...ARMI.DATI[id]}:null;if(keep)Object.assign(ARMI.DATI[id],ZD0[id]);try{return _oz(kind,id)}finally{if(keep)Object.assign(ARMI.DATI[id],keep)}}}
// the outfit's level in the Classic: more health
{const _m=makeP;makeP=function(){const q=_m.apply(this,arguments);const b=skinBonus();if(b>0&&q){q.maxhp=Math.round(q.maxhp*(1+b));q.hp=q.maxhp}return q}}
// by the fire the gun beside the hero is the one he brings into the match
Object.defineProperty(FALO,'gun',{get(){return SAVE.z&&zStartable(SAVE.z.gun)?SAVE.z.gun:'pistola'},configurable:true});
