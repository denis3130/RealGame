// =====================================================================
// THE HEROES' OWN WEAPONS (Denis, 16 October: «Armi proprie: un'arma speciale per ogni eroe nelle casse», and of two ways «Tutti, potere
// col suo»: anyone can carry one for its numbers; its look and its special power only with its own hero). Thirteen legendary weapons
// (rarity 4, slot «arma»), one a hero. With its hero: the weapon in his hand changes (sprite/eroe3d/armi3d.js, st.leg: the star bow, the
// moon bow, the dragon crossbow, the willow staff, the golden lute, the rainbow flask, the shadow stars, the hammer of the dawn, the staff
// of the blizzard, the thunder axes, the captain's sabre, the fang whip, the golden beads and fists) and his trick gets stronger (POWER).
// With another hero only the numbers. In the chests, the shop and the packs (itemPickW): a hero's own weapon comes more often when you
// play him, less when you own him, rarely when you do not; the three legendaries of before keep their chance.
// =====================================================================
// what each one gives with its own hero (the rows of the weapons are in 07, with the other items)
const OWNP={arco_stelle:'ogni quinta freccia è una stella che si divide in tre quando colpisce',arco_luna:'le frecce rimbalzano su un nemico in più e i critici arrivano più spesso',balestra_drago:'i dardi bruciano e spingono più lontano',bastone_salice:'le foglie a volte bloccano il nemico con le radici e ogni colpo ti cura un poco',liuto_oro:'le note rimbalzano su due nemici in più e ogni ottava nota ti cura',fiala_arcobaleno:'pozze più grandi e il veleno fa il doppio',stelle_ombra:'cinque stelline a ventaglio invece di tre',martello_alba:'ogni terzo martello è sacro e lo scudo para un colpo ogni 4 secondi',bastone_bufera:'ogni terza sfera gela il nemico',asce_tuono:'lancia due asce insieme',sciabola_capitano:'tre coltelli invece di due e la sciabola arriva più lontano',frusta_zanna:'la frusta colpisce due nemici e Zanna morde più forte',grani_quiete:"ogni terzo pugno fa l'onda d'urto"};
const OWNA={arciere:"con l'",alchimista:"con l'",cacciatrice:'con la '};
for(const id in OWNP){const it=ITEM[id],h=it&&HERO_BY[it.hero];if(it)it.perk=`Solo ${OWNA[it.hero]||'col '}${h?h.n:it.hero}: ${OWNP[id]}`}
const ownW=()=>{const id=SAVE.eq&&SAVE.eq.arma,it=id&&ITEM[id];return it&&it.hero?it:null};
// ---- in the chests, the shop and the packs: weighted (the hero you play, the ones you own, the others; the old legendaries stay at 1)
function itemW(o){const it=o&&(o.hero!==undefined?o:ITEM[o.id]);if(!it||!it.hero)return 1;return it.hero===SAVE.hero?1:SAVE.heroes&&SAVE.heroes[it.hero]?.35:.12}
function itemPickW(pool,rnd){if(!pool||!pool.length)return undefined;const r0=rnd||Math.random,w=pool.map(itemW),tot=w.reduce((a,b)=>a+b,0);let r=r0()*tot;for(let i=0;i<pool.length;i++){r-=w[i];if(r<0)return pool[i]}return pool[pool.length-1]}
// ---- the look: the weapon of his own hero, in his hand (the colours of the stave or the beads, the kind of bow); another hero keeps his
{const _hs=heroStyle0;heroStyle0=function(id){const s=_hs.apply(this,arguments),it=ownW();if(!it)return s;const hid=s.hid||id||SAVE.hero,base=(HERO_BY[hid]||HEROES[0]).style||{};
  if(it.hero!==hid)return{...s,bowCol:base.bowCol||HERO.bowCol};
  const o={...s,legW:it.id};
  if(it.id==='arco_stelle'){o.bowKind='stelle';o.bowCol='#2c3f8a'}else if(it.id==='arco_luna'){o.bowKind='luna';o.bowCol='#d0dae8'}
  else if(it.id==='balestra_drago')o.bowCol='#6a1812';else if(it.id==='grani_quiete'){o.wraps='#f0c64a';o.beads='#e0b040'}
  return o}}
// ---- the power: only with his own hero (after the hero's own numbers)
{const _am=applyMeta;applyMeta=function(p){_am.apply(this,arguments);if(!p)return;const it=ownW();p.own=it&&it.hero===p.hero?it.id:null;if(!p.own)return;
  if(p.own==='arco_luna'){p.ric=(p.ric||0)+1;p.crit+=.08}
  else if(p.own==='balestra_drago'){p.fire=true;p.kbm=(p.kbm||1)*1.35}
  else if(p.own==='liuto_oro')p.ric=(p.ric||0)+2;
  else if(p.own==='martello_alba'){p.palEvery=3;p.shEvery=4}
  else if(p.own==='bastone_bufera')p.iceEvery=3;
  else if(p.own==='sciabola_capitano'){p.sabT=60;p.sabR=90}
  else if(p.own==='frusta_zanna')p.zannaK=1.3;
  else if(p.own==='grani_quiete')p.shockEvery=3}}
// the star arrow (every fifth volley of the Archer), the notes that heal (every eighth of the Bard), the stars of the Ninja, the third knife
let OWN_N=0;
{const _v=volley;volley=function(a){const pre=P&&P.slashT;const r=_v.apply(this,arguments);try{if(!P||!G||INTRO.on||!P.own)return r;const id=P.own;OWN_N++;
  if(id==='arco_stelle'&&OWN_N%5===0){for(let i=G.arrows.length-1;i>=0&&i>=G.arrows.length-6;i--){const ar=G.arrows[i];if(!ar.blade&&!ar.star&&!ar.starKid){ar.star=true;ar.m*=1.2;break}}}
  else if(id==='liuto_oro'&&OWN_N%8===0){const v=Math.max(1,Math.round(P.maxhp*.02));if(P.hp<P.maxhp){P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#ffd84a',14)}}
  else if(id==='stelle_ombra'&&P.proj==='star'){arrow(P.x,P.y-6,a+.44,.35);arrow(P.x,P.y-6,a-.44,.35)}
  else if(id==='sciabola_capitano'&&P.proj==='knife'&&P.slashT==null)(G.knifeQ||(G.knifeQ=[])).push({t:.18,a})}catch(e){}return r}}
// the Berserker's two axes (not the big one of every third volley)
if(typeof axeSpawn==='function'){const _ax=axeSpawn;axeSpawn=function(x,y,a,m){if(P&&P.own==='asce_tuono'&&!(m>2)){_ax.call(this,x,y,a-.13,m);return _ax.call(this,x,y,a+.13,m)}return _ax.apply(this,arguments)}}
// the Tamer's whip: a second crack on another enemy in reach
if(typeof lashSpawn==='function'){const _ls=lashSpawn;lashSpawn=function(x,y,a,m){const r=_ls.apply(this,arguments);try{if(P&&P.own==='frusta_zanna'&&G.lashes&&G.lashes.length){const L=G.lashes,first=L[L.length-1].e;let best=null,bd=1e9;
    for(const e of G.enemies){if(!canHit(e)||e===first)continue;const d=Math.hypot(e.x-P.x,e.y-P.y)-e.r;if(d>200)continue;let da=Math.atan2(e.y-P.y,e.x-P.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>.9)continue;if(d<bd){bd=d;best=e}}
    if(best){const an=Math.atan2(best.y-P.y,best.x-P.x);L.push({a:an,t:-.06,dur:.32,e:best,tx:best.x,ty:best.y-best.r*.6,m:m||1,hit:false,side:-L[L.length-1].side||1})}}}catch(e){}return r}}
// the Alchemist: bigger puddles, and the poison twice
if(typeof pzAdd==='function'){const _pz=pzAdd;pzAdd=function(x,y,r,t,big){if(P&&P.own==='fiala_arcobaleno'){r*=1.3;t*=1.2}return _pz.call(this,x,y,r,t,big)}}
if(typeof flaskBurst==='function'){const _fb=flaskBurst;flaskBurst=function(ar){const r=_fb.apply(this,arguments);try{if(P&&P.own==='fiala_arcobaleno'&&G){const R0=ar.big?62:44;for(const e of G.enemies)if(canHit(e)&&!e.dead&&Math.hypot(e.x-ar.x,e.y-ar.y)<R0+e.r)e.poisonS=Math.min(4,(e.poisonS||0)+1)}}catch(e){}return r}}
// the hits of the shots (a set of the enemies each had hit, before the game's update): the star splits, the willow's leaves root and heal
{const _u=update;update=function(dt){const g=G,A0=g&&g.arrows;let snap=null;
  if(A0&&A0.length&&P&&(P.own==='arco_stelle'||P.own==='bastone_salice')){snap=[];for(const ar of A0)if(!ar.blade&&(ar.star||P.own==='bastone_salice'))snap.push({ar,h:new Set(ar.hit)})}
  _u.apply(this,arguments);if(!snap||G!==g||!P)return;
  try{let heal=0;for(const s of snap){for(const e of s.ar.hit){if(s.h.has(e))continue;
      if(s.ar.star&&!s.ar.split){s.ar.split=true;const a=s.ar.a!=null?s.ar.a:Math.atan2(s.ar.vy,s.ar.vx);for(const da of[-.55,0,.55]){arrow(e.x,e.y,a+da,.5);const k=G.arrows[G.arrows.length-1];if(k){k.starKid=true;k.hit.add(e)}}
        vfxBlast(e.x,e.y,'255,226,130',26,{sparks:LOWFX?4:10,spcol:['#fff6c8','#ffd86b','#e0b040'],dust:0,ring2:false});sfx('es','bell',e.x)}
      if(P.own==='bastone_salice'){heal++;if(!isBoss(e.type)&&!e.dead&&Math.random()<.1&&!(e.root>0)){e.root=1;e.rootT=0;e.rootK=.5;vfxBlast(e.x,e.y,'150,255,120',22,{sparks:0,debris:'leaf',n:LOWFX?3:6,dust:2,ring2:false})}}}}
    if(heal&&P.hp<P.maxhp)P.hp=Math.min(P.maxhp,P.hp+heal)}catch(err){}}}
// the star arrow: golden, with a glow and a little star turning on it
{const _da=drawArrow;drawArrow=function(a){if(a&&a.star&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,226,130',a.x,a.y,16,.6);ctx.restore()}_da.apply(this,arguments);
  if(a&&a.star){const r=4.2,a0=(G.t||0)*9;ctx.save();ctx.beginPath();for(let i=0;i<10;i++){const an=a0+i*Math.PI/5,rr=i%2?r*.45:r;ctx.lineTo(a.x+Math.cos(an)*rr,a.y+Math.sin(an)*rr)}ctx.closePath();ctx.fillStyle='#ffd86b';ctx.fill();ctx.lineWidth=1.2;ctx.strokeStyle=INK;ctx.stroke();ctx.restore()}}}
// ---- the icons: the 3D weapons with their own look (the beads drawn by hand)
if(typeof ITART!=='undefined'){const B3=(id,st,rot,rgb)=>x=>{if(rgb)iglow(x,rgb,48,48,42,.32);return bow3d(x,id,{leg:1,...st},rot)};
  Object.assign(ITART,{
    arco_stelle:B3('arco',{kind:'stelle',col:'#2c3f8a',draw:0,nock:1},.62,'255,214,110'),
    arco_luna:B3('arco',{kind:'luna',col:'#d0dae8',draw:0,nock:1},.62,'180,215,255'),
    balestra_drago:B3('balestra',{draw:1,bolt:true,col:'#6a1812'},-.5,'255,120,40'),
    bastone_salice:B3('bastone',{glow:1},-.8,'255,226,130'),
    liuto_oro:B3('liuto',{},-.5,'255,214,110'),
    fiala_arcobaleno:B3('fiala',{},0,'200,140,255'),
    stelle_ombra:B3('stellina',{},0,'190,150,255'),
    martello_alba:B3('maglio',{glow:1},-.8,'255,226,140'),
    bastone_bufera:B3('gelo',{glow:1},-.8,'150,215,255'),
    asce_tuono:B3('ascia',{},-.8,'255,90,50'),
    sciabola_capitano:B3('sciabola',{},-.9,'255,226,140'),
    frusta_zanna:B3('frusta',{out:0},-.6,'230,220,190'),
    grani_quiete:x=>{iglow(x,'255,220,120',48,48,40,.3);const N=14,cx=48,cy=44,rx=26,ry=24;
      for(let i=0;i<N;i++){const a=i/N*TAU-Math.PI/2,bx=cx+Math.cos(a)*rx,by=cy+Math.sin(a)*ry,big=i%4===0,r=big?6.4:5;
        paint(x,()=>{x.beginPath();x.arc(bx,by,r,0,TAU)},big?'#c8323c':'#e0b040',{box:[bx-r,by-r,bx+r,by+r],lw:2.6,rim:false});x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(bx-r*.35,by-r*.38,r*.26,0,TAU);x.fill()}
      // the tassel
      paint(x,()=>{x.beginPath();x.moveTo(44,70);x.lineTo(52,70);x.lineTo(56,90);x.lineTo(40,90);x.closePath()},'#c8323c',{box:[40,70,56,90],lw:2.6});
      paint(x,()=>{x.beginPath();x.arc(48,70,4.6,0,TAU)},'#e0b040',{box:[43,65,53,75],lw:2.4,rim:false})}})}
// ---- the item sheet: whose weapon it is
{const _oi=typeof openItem==='function'?openItem:null;if(_oi)openItem=function(id){const r=_oi.apply(this,arguments);try{const it=ITEM[id];if(it&&it.hero){const h=HERO_BY[it.hero];
  const el=document.querySelector('#itemPanel .ihead .tag');if(el&&h&&!/Arma d/.test(el.textContent))el.textContent=el.textContent.replace(/Arma$/,'Arma '+(/^[AEIOU]/.test(h.n)?"dell'":it.hero==='cacciatrice'?'della ':'del ')+h.n)}}catch(e){}return r}}
// ---- taking a hero into the field: if in your hand there is another hero's own weapon (that gives him nothing) and you have his own, he
// takes his own (a weapon of the others, chosen by you, stays)
$('hAct').addEventListener('click',e=>{const b=e.target.closest('[data-hact]');if(!b||b.dataset.hact!=='use')return;try{const cur=ITEM[SAVE.eq.arma],mine=ITEMS.find(i=>i.hero===SAVE.hero);
  if(cur&&cur.hero&&cur.hero!==SAVE.hero&&mine&&SAVE.items[mine.id]){SAVE.eq.arma=mine.id;save();toast(mine.n+' in mano');renderHero();renderGear()}}catch(err){}});
