// =====================================================================
// THE ECONOMY OF THE TWO MODES (punti 25-34 del piano di Denis, anteprima 47). Five systems kept apart in the code, the inventories and
// the screens (punto 25): the Classic packs, the Zombie packs, the Classic reward chests, the Zombie Lucky Cards, the mystery coffin of
// the zombie map (the Bara, in the map's engine).
// - Progressione separata (punto 29): the Classic items (bows, armours, rings, amulets) grow only with Classic cards and the «Essenza di
//   muschio» (from level 5 on); the zombie guns and the four zombie accessories (Fondina, Zaino, Stivali, Talismano) only with Zombie
//   cards and «Rottami». Outfits and creatures are shared, with their cards: what you win in one mode is yours in the other.
// - Packs (punti 26-28): five rarities for each mode (Comune, Rara, Epica, Leggendaria, Implacabile), from the shop, the passes, the
//   missions, the login, the road and the wheel; kept until opened (src/js/69-bustine.js: covers and tearing them open).
// - Classic chests (punto 30): only from a match; four rarities (legno, argento, oro, cristallo = Comune, Rara, Epica, Leggendaria), four
//   slots and a fifth bonus slot (Epica or Leggendaria with its own odds, at most one every 5 hours); all full: a little less gold than the
//   chest is worth, with a notice.
// - Lucky Cards (punti 31-34): abilities for the zombie matches in four kinds of pack (2, 4, 8, 12 cards), won at the end of a zombie match
//   into 4 slots plus the fifth, or bought in the zombie shop (a few a day).
// All the numbers live here, to be tuned playing.
// =====================================================================
const PR=['c','r','e','l','i'],PRN={c:'Comune',r:'Rara',e:'Epica',l:'Leggendaria',i:'Implacabile'},
  PRC={c:['#cfd3d8','#5a5d61'],r:['#4d97ff','#1d3f78'],e:['#b874e6','#4a2766'],l:['#ffb020','#6e4a0c'],i:['#ff4a3a','#3a0606']};
const MATS={ess:{n:'Essenza di muschio',s:'Essenza',col:'#9fe06a'},rot:{n:'Rottami',s:'Rottami',col:'#c8a070'}};
// the packs (the same five for each mode): cards, materials, gold, the odds of the cards' rarities (0 Comune .. 4 Leggendario), the
// chance of creature cards and of outfit cards, the rarity at least one card has (min, min2: how many), the price in the shop
const BUSTE={c:{cards:8,mat:6,gold:[40,80],odds:[70,25,5,0,0],pet:.2,skin:0,min:0,price:{gold:150}},
  r:{cards:18,mat:15,gold:[120,200],odds:[45,35,15,5,0],pet:.35,skin:.05,min:1,price:{gold:500}},
  e:{cards:40,mat:35,gold:[300,450],odds:[25,35,25,13,2],pet:.55,skin:.12,min:3,price:{gems:150}},
  l:{cards:80,mat:80,gold:[700,1000],odds:[10,25,30,25,10],pet:.75,skin:.25,min:4,price:{gems:450}},
  i:{cards:160,mat:180,gold:[1800,2500],odds:[0,15,30,35,20],pet:1,skin:.5,min:4,min2:2,price:{gems:1600}}};
// the materials asked from level 5 on: MATCOST, matCost (src/js/07-meta-oggetti-casse.js)
// ------------------------------------------------------------------ the zombie things: the guns and the four accessories
// (the guns are those of the map, sprite/armi: their level makes them hit harder and reload faster in every match)
const ZACC=[{id:'fondina',n:'Fondina',rar:1,d:'Ricarichi più in fretta.',per:.03,fx:'reload',col:'#8a5a2a'},
  {id:'zaino',n:'Zaino',rar:1,d:'Più colpi di scorta per ogni arma.',per:.06,fx:'ammo',col:'#4b5232'},
  {id:'stivali',n:'Stivali',rar:2,d:'Corri più veloce.',per:.02,fx:'speed',col:'#5a3a24'},
  {id:'talismano',n:'Talismano',rar:3,d:'Ogni zombie ti dà più monete.',per:.04,fx:'cash',col:'#c9a040'}];
const ZACC_BY={};ZACC.forEach(a=>ZACC_BY[a.id]=a);
const zGuns=()=>typeof ARMI!=='undefined'?ARMI.ORDINE.slice():['pistola'];
const zGunInfo=id=>{const D=typeof ARMI!=='undefined'&&ARMI.DATI[id];return D?{id,n:D.n,rar:D.rar||0,d:D.d}:{id,n:id,rar:0,d:''}};
// a level's bonus for a gun: damage +7% a level, reload −2.5% a level
const zGunMul=l=>({dmg:1+.07*(l-1),rel:1-.025*(l-1)});
// the guns you may start a match with: the ones you own up to the rare ones (the epic and legendary ones are found on the map)
const zStartable=id=>{const o=SAVE.z.guns[id];return id==='pistola'||(!!o&&zGunInfo(id).rar<=2)};
// ------------------------------------------------------------------ outfits with cards and levels (shared by the two modes)
// cards to unlock by rarity (the rarity of an outfit: SKINS[id].rar, 2 if not given), then levels 1-5: +2% health in both modes a level
const SKIN_UNLOCK=[6,10,16,26,40],SKIN_MAX=5,skinNeed=l=>[0,8,14,22,34][l]||0,skinRar=id=>(SKINS[id]&&SKINS[id].rar!=null)?SKINS[id].rar:2;
// ------------------------------------------------------------------ the Lucky Cards: abilities for a zombie match
// kind: t timed (seconds), i instant, p passive until used (the revive) or until the next card (the lucky shot)
const LUCKY=[{id:'munizioni',n:"Munizioni d'emergenza",rar:0,k:'i',d:'Riempie le munizioni di tutte le armi che hai.'},
  {id:'impulso',n:'Impulso repulsivo',rar:0,k:'i',d:'Respinge lontano gli zombie vicini.'},
  {id:'cassa',n:'Cash istantaneo',rar:1,k:'i',d:'2.000 monete subito, per questa partita.'},
  {id:'scudo',n:'Scudo temporaneo',rar:1,k:'t',s:20,d:'Per 20 secondi prendi metà dei danni.'},
  {id:'rigenera',n:'Rigenerazione',rar:1,k:'t',s:25,d:'Per 25 secondi la salute torna su piano piano.'},
  {id:'raffica',n:'Raffica infinita',rar:2,k:'t',s:18,d:'Per 18 secondi colpi infiniti e spari più in fretta.'},
  {id:'invisibile',n:'Invisibilità',rar:2,k:'t',s:15,d:'Per 15 secondi gli zombie non ti vedono.'},
  {id:'fortuna',n:'Colpo fortunato',rar:2,k:'p',d:'Più colpi critici, finché non usi un\'altra Lucky Card.'},
  {id:'rialzati',n:'Autorianimazione',rar:3,k:'p',d:'Se cadi ti rialzi da solo, una volta.'}];
const LUCKY_BY={};LUCKY.forEach(c=>LUCKY_BY[c.id]=c);
const LRAR=['Comune','Rara','Epica','Leggendaria'],LRARI=[0,2,3,4];// the Lucky rarities on the game's card colours (RAR)
// the Lucky packs: how many cards, the odds of the cards' rarities, the price, how many you can buy a day in the shop
const LBUSTE={c:{cards:2,odds:[70,25,5,0],price:{gems:60},day:3},r:{cards:4,odds:[50,35,13,2],price:{gems:160},day:2},
  e:{cards:8,odds:[30,35,27,8],price:{gems:380},day:1},l:{cards:12,odds:[15,30,35,20],price:{gems:900},day:1}};
// ------------------------------------------------------------------ the fifth slot (chests and Lucky packs): Epica or Leggendaria, every 5 h
const FIFTH={odds:{e:68,l:32},every:5*3600e3};
// the chests' worth in gold when the slots are all full (the player gets a little less: CHEST_FULL)
const CHEST_WORTH={legno:40,argento:120,oro:300,cristallo:700},LUCKY_WORTH={c:60,r:150,e:360,l:800},CHEST_FULL=.8;
// ------------------------------------------------------------------ the save: new fields, old saves converted
function econInit(){const S=SAVE;
  if(!S.mat||typeof S.mat!=='object')S.mat={ess:0,rot:0};for(const k of['ess','rot'])if(typeof S.mat[k]!=='number'||!isFinite(S.mat[k]))S.mat[k]=0;
  if(!S.z||typeof S.z!=='object')S.z={};const Z=S.z;if(!Z.guns||typeof Z.guns!=='object')Z.guns={pistola:{lvl:1,cards:0}};if(!Z.guns.pistola)Z.guns.pistola={lvl:1,cards:0};
  if(!Z.acc||typeof Z.acc!=='object')Z.acc={};if(!Z.gun||!zStartable(Z.gun))Z.gun='pistola';
  if(!S.bustine||typeof S.bustine!=='object')S.bustine={classica:{},zombie:{}};for(const m of['classica','zombie']){if(!S.bustine[m])S.bustine[m]={};for(const r of PR)if(typeof S.bustine[m][r]!=='number')S.bustine[m][r]=0}
  if(!S.skinCards||typeof S.skinCards!=='object')S.skinCards={};if(!S.skinLv||typeof S.skinLv!=='object')S.skinLv={};
  for(const k of Object.keys(S.skins||{}))if(S.skins[k]&&!S.skinLv[k])S.skinLv[k]=1;
  if(!S.lucky||typeof S.lucky!=='object')S.lucky={};const L=S.lucky;if(!L.inv||typeof L.inv!=='object')L.inv={};if(!Array.isArray(L.slots)||L.slots.length!==4)L.slots=[null,null,null,null];
  if(L.slot5===undefined)L.slot5=null;if(typeof L.next5!=='number')L.next5=0;if(!L.shop||typeof L.shop!=='object')L.shop={day:'',bought:{},seen:0};if(L.pick===undefined)L.pick=null;
  if(S.slot5===undefined)S.slot5=null;if(typeof S.next5!=='number')S.next5=0;if(!Array.isArray(S.fullNotes))S.fullNotes=[]}
econInit();
{const _d=defSave;defSave=function(){const s=_d();s.mat={ess:0,rot:0};s.z={guns:{pistola:{lvl:1,cards:0}},acc:{},gun:'pistola'};s.bustine={classica:{c:0,r:0,e:0,l:0,i:0},zombie:{c:0,r:0,e:0,l:0,i:0}};
  s.skinCards={};s.skinLv={};s.lucky={inv:{},slots:[null,null,null,null],slot5:null,next5:0,shop:{day:'',bought:{},seen:0},pick:null};s.slot5=null;s.next5=0;s.fullNotes=[];return s}}
// ------------------------------------------------------------------ rolling what a pack holds
const rIn=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
// the cards a pack of a mode can give: Classic items, or zombie guns and accessories
function packPool(mode){return mode==='zombie'?zGuns().map(id=>({id:'z:'+id,rar:zGunInfo(id).rar})).concat(ZACC.map(a=>({id:'za:'+a.id,rar:a.rar}))):ITEMS.map(i=>({id:i.id,rar:i.rar}))}
function rollPack(mode,rar){const B=BUSTE[rar],pool=packPool(mode),out={};let left=B.cards;const n=Math.min(6,2+Math.floor(B.cards/14));
  const pick=r=>{let rr=r,pl=pool.filter(p=>p.rar===rr);while(!pl.length&&rr>0){rr--;pl=pool.filter(p=>p.rar===rr)}return itemPickW(pl)};
  // the promised rare cards first (min, min2 of them), then the rest by the odds
  const forced=[];if(B.min)for(let k=0;k<(B.min2||1);k++)forced.push(B.min);
  for(let s=0;s<n&&left>0;s++){const rr=s<forced.length?forced[s]:pickOdds(B.odds),it=pick(rr);if(!it)continue;let cnt=s===n-1?left:Math.max(1,Math.round(left*(.25+Math.random()*.25)));left-=cnt;
    cnt=Math.max(1,Math.round(cnt/(1+it.rar*.7)));out[it.id]=(out[it.id]||0)+cnt}
  // shared things: creature cards, outfit cards
  if(Math.random()<B.pet){const w=PETS.map(q=>[q.id,[0,8,3,1.2][q.rar]||1]),tot=w.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot,id=w[0][0];for(const[k,v] of w){r-=v;if(r<0){id=k;break}}
    out['pet:'+id]=(out['pet:'+id]||0)+rIn(1,2)+PR.indexOf(rar)*2}
  if(Math.random()<B.skin){const ks=Object.keys(SKINS).filter(k=>!SKINS[k].crea);if(ks.length){const id=ks[Math.floor(Math.random()*ks.length)];out['skin:'+id]=(out['skin:'+id]||0)+rIn(2,4)+PR.indexOf(rar)*2}}
  const mat={};mat[mode==='zombie'?'rot':'ess']=Math.round(B.mat*(.85+Math.random()*.3));
  return{cards:Object.entries(out).map(([id,n])=>({id,n})).sort((a,b)=>CI(a.id).rar-CI(b.id).rar),gold:rIn(B.gold[0],B.gold[1]),mat}}
function rollLucky(rar){const B=LBUSTE[rar],out={};for(let k=0;k<B.cards;k++){const rr=pickOdds(B.odds);let pl=LUCKY.filter(c=>c.rar===rr);if(!pl.length)pl=LUCKY;const c=pl[Math.floor(Math.random()*pl.length)];out['luck:'+c.id]=(out['luck:'+c.id]||0)+1}
  return{cards:Object.entries(out).map(([id,n])=>({id,n})).sort((a,b)=>CI(a.id).rar-CI(b.id).rar),gold:0,mat:{}}}
// ------------------------------------------------------------------ giving what was rolled (the cards of every kind, the gold, the materials)
{const _g=grant;grant=function(rew){const rest=[],own=[];for(const c of rew.cards){const k=c.id;
    if(k.startsWith('z:')){const id=k.slice(2),Z=SAVE.z.guns,o=Z[id];c.prev=o?o.cards:0;if(!o){Z[id]={lvl:1,cards:c.n-1};c.isNew=true}else o.cards+=c.n}
    else if(k.startsWith('za:')){const id=k.slice(3),A=SAVE.z.acc,o=A[id];c.prev=o?o.cards:0;if(!o){A[id]={lvl:1,cards:c.n-1};c.isNew=true}else o.cards+=c.n}
    else if(k.startsWith('skin:')){const id=k.slice(5);c.prev=SAVE.skinCards[id]||0;SAVE.skinCards[id]=(SAVE.skinCards[id]||0)+c.n;
      if(!(SAVE.skins&&SAVE.skins[id])&&SAVE.skinCards[id]>=SKIN_UNLOCK[skinRar(id)]){SAVE.skinCards[id]-=SKIN_UNLOCK[skinRar(id)];SAVE.skins=SAVE.skins||{};SAVE.skins[id]=1;SAVE.skinLv[id]=1;c.isNew=true;c.unlocked=true}}
    else if(k.startsWith('luck:')){const id=k.slice(5);c.prev=SAVE.lucky.inv[id]||0;if(!c.prev)c.isNew=true;SAVE.lucky.inv[id]=c.prev+c.n}
    else{rest.push(c);continue}own.push(c)}
  for(const[m,v] of Object.entries(rew.mat||{}))SAVE.mat[m]=(SAVE.mat[m]||0)+v;
  _g({...rew,cards:rest});rew.cards=own.concat(rest).sort((a,b)=>CI(a.id).rar-CI(b.id).rar)}}
// ------------------------------------------------------------------ what a card shows (the reveal, the summary, the collections)
{const _ci=CI;CI=function(id,c){
  if(id.startsWith('z:')){const g=zGunInfo(id.slice(2)),o=SAVE.z.guns[g.id]||{lvl:1,cards:0};return{n:g.n,rar:g.rar,svg:zGunIcon(g.id),o,need:needCards(o.lvl),sub:`Livello ${o.lvl} · Arma zombie`,max:o.lvl>=MAXLV,ready:'Pronta da migliorare!'}}
  if(id.startsWith('za:')){const a=ZACC_BY[id.slice(3)],o=SAVE.z.acc[a.id]||{lvl:1,cards:0};return{n:a.n,rar:a.rar,svg:zAccIcon(a.id),o,need:needCards(o.lvl),sub:`Livello ${o.lvl} · Accessorio zombie`,max:o.lvl>=MAXLV,ready:'Pronto da migliorare!'}}
  if(id.startsWith('skin:')){const k=id.slice(5),S=SKINS[k],own=SAVE.skins&&SAVE.skins[k],lv=SAVE.skinLv[k]||0,cards=SAVE.skinCards[k]||0,need=own?skinNeed(lv):SKIN_UNLOCK[skinRar(k)];
    return{n:S?S.n:k,rar:skinRar(k),svg:skinIcon(k),o:{lvl:lv,cards},need,sub:own?`Livello ${lv} · Vestito`:'Vestito · da sbloccare',max:own&&lv>=SKIN_MAX,ready:c&&c.unlocked?'Vestito sbloccato!':'Pronto da migliorare!'}}
  if(id.startsWith('luck:')){const L0=LUCKY_BY[id.slice(5)],n=SAVE.lucky.inv[L0.id]||0;return{n:L0.n,rar:LRARI[L0.rar],svg:luckyIcon(L0.id),o:{lvl:1,cards:n},need:Math.max(1,n),sub:'Lucky Card · '+L0.d,max:true,ready:''}}
  return _ci(id,c)}}
// ------------------------------------------------------------------ small icons (the collections, the reveal): drawn once, kept as pictures
const ICON2={};
function iconCv(key,f){if(ICON2[key])return ICON2[key];const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),sv=ctx;ctx=x;try{f(x)}catch(e){}finally{ctx=sv}
  return ICON2[key]=`<img class="cicon" src="${c.toDataURL()}" alt="">`}
function zGunIcon(id){return iconCv('g:'+id,x=>{if(typeof ARMI==='undefined')return;x.translate(48,52);x.scale(2.4,2.4);ARMI.arma(id,0,0,-.18,null)})}
function zAccIcon(id){const A=ZACC_BY[id];return iconCv('a:'+id,x=>{x.translate(48,50);x.lineJoin='round';x.lineCap='round';const ink=w=>{x.strokeStyle=INK;x.lineWidth=w};
  if(id==='fondina'){x.fillStyle=A.col;x.beginPath();x.moveTo(-14,-26);x.lineTo(16,-26);x.lineTo(20,8);x.quadraticCurveTo(10,30,-6,26);x.lineTo(-16,4);x.closePath();x.fill();ink(4);x.stroke();
    x.fillStyle='#3a3d42';x.fillRect(-10,-36,18,14);x.strokeRect(-10,-36,18,14);x.strokeStyle='rgba(255,220,170,.35)';x.lineWidth=2;x.beginPath();x.moveTo(-10,-20);x.lineTo(-12,4);x.stroke();x.fillStyle='#c9a040';x.beginPath();x.arc(2,-14,3,0,TAU);x.fill()}
  else if(id==='zaino'){x.fillStyle=A.col;x.beginPath();x.roundRect(-20,-24,40,46,10);x.fill();ink(4);x.stroke();x.fillStyle='#3c4228';x.beginPath();x.roundRect(-14,0,28,18,5);x.fill();ink(3);x.stroke();
    x.strokeStyle=INK;x.lineWidth=3;x.beginPath();x.arc(0,-24,9,Math.PI,0);x.stroke();x.fillStyle='#c9a040';x.fillRect(-3,-6,6,5)}
  else if(id==='stivali'){for(const sd of[-1,1]){x.save();x.translate(sd*11,0);x.fillStyle=A.col;x.beginPath();x.moveTo(-8,-26);x.lineTo(6,-26);x.lineTo(6,6);x.lineTo(16,14);x.lineTo(16,24);x.lineTo(-8,24);x.closePath();x.fill();ink(3.4);x.stroke();
    x.fillStyle='#2a1a10';x.fillRect(-8,18,24,6);x.strokeRect(-8,18,24,6);x.restore()}}
  else{x.fillStyle='#2a2420';x.beginPath();x.arc(0,-26,5,0,TAU);x.fill();ink(3);x.stroke();x.fillStyle=A.col;x.beginPath();x.moveTo(0,-20);x.lineTo(18,-4);x.lineTo(10,22);x.lineTo(-10,22);x.lineTo(-18,-4);x.closePath();x.fill();ink(4);x.stroke();
    x.fillStyle='#7bff9a';x.beginPath();x.arc(0,2,7,0,TAU);x.fill();ink(2.6);x.stroke();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(-2,0,2,0,TAU);x.fill()}})}
function skinIcon(k){const S=SKINS[k]||{body:'#888',hood:'#666',belt:'#444'};return iconCv('s:'+k,x=>{x.translate(48,52);x.lineJoin='round';x.fillStyle=S.body;x.beginPath();x.moveTo(0,-34);x.quadraticCurveTo(-18,-34,-18,-16);x.lineTo(-20,-6);x.lineTo(-30,30);x.lineTo(30,30);x.lineTo(20,-6);x.lineTo(18,-16);x.quadraticCurveTo(18,-34,0,-34);x.closePath();x.fill();
  x.strokeStyle=INK;x.lineWidth=4;x.stroke();x.fillStyle=S.hood;x.beginPath();x.arc(0,-16,14,Math.PI,0);x.lineTo(14,-8);x.lineTo(-14,-8);x.closePath();x.fill();x.stroke();x.fillStyle=S.belt||'#6a4a1a';x.fillRect(-22,8,44,7);x.strokeRect(-22,8,44,7)})}
function luckyIcon(id){return iconCv('l:'+id,x=>{x.translate(48,48);luckyGlyph(x,id,1)})}
// the drawing on a Lucky Card (also on its face in the pack opening): one simple sign for each ability
function luckyGlyph(x,id,s){x.save();x.scale(s,s);x.lineJoin='round';x.lineCap='round';const ink=w=>{x.strokeStyle='#0a0c0b';x.lineWidth=w};
  if(id==='munizioni'){for(let i=-1;i<=1;i++){x.fillStyle='#d39a33';x.beginPath();x.roundRect(i*12-4.5,-18,9,30,4);x.fill();ink(3);x.stroke();x.fillStyle='#b8612f';x.fillRect(i*12-4.5,6,9,6)}}
  else if(id==='impulso'){x.strokeStyle='#7fe0ff';for(let r=8;r<=26;r+=9){x.lineWidth=4;x.beginPath();x.arc(0,0,r,0,TAU);x.stroke()}x.fillStyle='#e8fbff';x.beginPath();x.arc(0,0,5,0,TAU);x.fill()}
  else if(id==='cassa'){x.fillStyle='#ffd23c';for(const[a,b] of[[-8,8],[8,8],[0,-6]]){x.beginPath();x.ellipse(a,b,12,7,0,0,TAU);x.fill();ink(3);x.stroke()}x.fillStyle='#8a5a10';x.font='bold 12px sans-serif';x.textAlign='center';x.fillText('$',0,-2)}
  else if(id==='scudo'){x.fillStyle='#4d97ff';x.beginPath();x.moveTo(0,-24);x.lineTo(20,-14);x.quadraticCurveTo(20,14,0,26);x.quadraticCurveTo(-20,14,-20,-14);x.closePath();x.fill();ink(4);x.stroke();x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(-12,-12);x.lineTo(0,-18);x.lineTo(0,10);x.closePath();x.fill()}
  else if(id==='rigenera'){x.fillStyle='#ff5a6a';x.beginPath();x.moveTo(0,22);x.bezierCurveTo(-30,0,-14,-26,0,-10);x.bezierCurveTo(14,-26,30,0,0,22);x.fill();ink(4);x.stroke();x.fillStyle='#fff';x.fillRect(-3,-6,6,16);x.fillRect(-8,-1,16,6)}
  else if(id==='raffica'){for(let i=0;i<3;i++){x.fillStyle=['#ffd86b','#ffb030','#ff7a2e'][i];x.beginPath();x.moveTo(-22+i*8,-14+i*10);x.lineTo(16+i*4,-6+i*10);x.lineTo(-22+i*8,2+i*10);x.closePath();x.fill();ink(2.4);x.stroke()}}
  else if(id==='invisibile'){x.globalAlpha=.55;x.fillStyle='#bfe9ff';x.beginPath();x.arc(0,-8,13,0,TAU);x.fill();x.fillRect(-14,0,28,22);x.globalAlpha=1;ink(3);x.setLineDash([4,4]);x.beginPath();x.arc(0,-8,13,0,TAU);x.stroke();x.strokeRect(-14,0,28,22);x.setLineDash([])}
  else if(id==='fortuna'){x.fillStyle='#4cb328';for(let k=0;k<4;k++){x.save();x.rotate(k*Math.PI/2+Math.PI/4);x.beginPath();x.arc(0,-10,8,0,TAU);x.fill();ink(3);x.stroke();x.restore()}x.strokeStyle='#2a5a12';x.lineWidth=4;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(6,14,2,24);x.stroke()}
  else{x.fillStyle='#e8e2d0';x.beginPath();x.arc(0,-6,14,0,TAU);x.fill();ink(3.4);x.stroke();x.fillStyle='#ffd84a';x.beginPath();x.moveTo(-20,10);x.lineTo(20,10);x.lineTo(0,28);x.closePath();x.fill();ink(3);x.stroke();x.fillStyle='#0a0c0b';x.fillRect(-6,-9,4,5);x.fillRect(2,-9,4,5)}
  x.restore()}
// ------------------------------------------------------------------ levelling up the zombie things and the outfits
function zUpInfo(kind,id){const o=kind==='gun'?SAVE.z.guns[id]:SAVE.z.acc[id];if(!o)return null;const rar=kind==='gun'?zGunInfo(id).rar:ZACC_BY[id].rar,need=needCards(o.lvl),gold=Math.round((COST[o.lvl-1]||0)*(1+rar*.4)),rot=matCost(o.lvl);
  return{o,need,gold,rot,max:o.lvl>=MAXLV,ok:o.lvl<MAXLV&&o.cards>=need&&SAVE.gold>=gold&&SAVE.mat.rot>=rot}}
function zUp(kind,id){const U=zUpInfo(kind,id);if(!U||!U.ok)return false;U.o.cards-=U.need;U.o.lvl++;SAVE.gold-=U.gold;SAVE.mat.rot-=U.rot;save();sfx('upgrade');return true}
function skinUp(k){const lv=SAVE.skinLv[k]||0,need=skinNeed(lv);if(!(SAVE.skins&&SAVE.skins[k])||SKINS[k]&&SKINS[k].crea||lv>=SKIN_MAX||(SAVE.skinCards[k]||0)<need)return false;SAVE.skinCards[k]-=need;SAVE.skinLv[k]=lv+1;save();sfx('upgrade');return true}
// the health bonus of the outfit you wear (both modes)
const skinBonus=()=>SAVE.skin&&SAVE.skinLv&&SAVE.skinLv[SAVE.skin]?.02*SAVE.skinLv[SAVE.skin]:0;
// the zombie bonuses of a match: the level of each gun, the accessories
function zBonus(){const A=SAVE.z.acc,lv=id=>A[id]?A[id].lvl:0,a=ZACC_BY;return{reload:1-a.fondina.per*lv('fondina'),ammo:1+a.zaino.per*lv('zaino'),speed:1+a.stivali.per*lv('stivali'),cash:1+a.talismano.per*lv('talismano'),hp:1+skinBonus(),
  gun:id=>zGunMul(SAVE.z.guns[id]?SAVE.z.guns[id].lvl:1)}}
// ------------------------------------------------------------------ the chests of the Classic: a fourth rarity, the fifth slot, the notice when all is full
CHESTS.cristallo={n:'Cassa di cristallo',cards:50,gold:[400,600],time:240,odds:[10,25,30,25,10],price:0};
CHC.cristallo={body:'#5a7fd8',dark:'#33489a',band:'#d9f4ff',lock:'#ffd86b'};
TIER.cristallo={lvl:3,c1:'#9fe6ff',bg:'#0e1f4a',rays:22,burst:340,charge:4,flash:'#e9fbff',coins:60,cols:['#ffffff','#9fe6ff','#c8a8ff','#ffd86b'],size:270};
CHESTS.legno.n='Cassa di legno';
const CHEST_RAR={legno:'Comune',argento:'Rara',oro:'Epica',cristallo:'Leggendaria'};
// the crystal chest always has creature cards
{const _r=rollChest;rollChest=function(type){const R=_r(type);if(type==='cristallo'){const w=PETS.map(q=>[q.id,[0,3,3,2.5][q.rar]||1]),tot=w.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot,id=w[0][0];
  for(const[k,v] of w){r-=v;if(r<0){id=k;break}}R.cards.push({id:'pet:'+id,n:rIn(5,9)});R.cards.sort((a,b)=>CI(a.id).rar-CI(b.id).rar)}return R}}
// a chest won in a match: a free slot, or the fifth (when the four are full: Epica or Leggendaria by its own odds, at most one every 5 h),
// or a little gold with a notice (shown: the end of the match says it; otherwise SAVE.fullNotes, told back in the menu)
earnChest=function(type,shown){const i=SAVE.slots.findIndex(s=>!s);if(i>=0){SAVE.slots[i]={type,state:'locked'};return{slot:i,type}}
  const now=Date.now();if(!SAVE.slot5&&now>=SAVE.next5){const t5=pickW(FIFTH.odds)==='l'?'cristallo':'oro';SAVE.slot5={type:t5,state:'locked',fifth:1};SAVE.next5=now+FIFTH.every;return{slot:4,fifth:true,type:t5}}
  const g=Math.round(CHEST_WORTH[type]*CHEST_FULL);SAVE.gold+=g;if(!shown)SAVE.fullNotes.push({k:'chest',type,g,t:now});return{full:true,gold:g,type}};
function pickW(o){const ks=Object.keys(o),tot=ks.reduce((a,k)=>a+o[k],0);let r=Math.random()*tot;for(const k of ks){r-=o[k];if(r<0)return k}return ks[0]}
// the chest a match gives (src/js/06-ui.js): a won arena has a chance of the crystal chest, more in the higher arenas
function matchChest(ct,win){if(win&&ct==='oro'){const ai=arenaIdx(SAVE.trophies||0),p=.08+.025*ai;if(Math.random()<p)return'cristallo'}return ct}
// ------------------------------------------------------------------ packs kept until opened
function addPack(mode,rar,n){SAVE.bustine[mode][rar]=(SAVE.bustine[mode][rar]||0)+(n||1);save()}
const packCount=mode=>PR.reduce((a,r)=>a+(SAVE.bustine[mode][r]||0),0);
// ------------------------------------------------------------------ the Lucky packs won in a zombie match: four slots and the fifth
function earnLucky(rar,shown){const L=SAVE.lucky,i=L.slots.findIndex(s=>!s);if(i>=0){L.slots[i]={rar,state:'locked'};return{slot:i,rar}}
  const now=Date.now();if(!L.slot5&&now>=L.next5){const r5=pickW(FIFTH.odds);L.slot5={rar:r5,state:'locked',fifth:1};L.next5=now+FIFTH.every;return{slot:4,fifth:true,rar:r5}}
  const g=Math.round(LUCKY_WORTH[rar]*CHEST_FULL);SAVE.gold+=g;if(!shown)SAVE.fullNotes.push({k:'lucky',rar,g,t:now});return{full:true,gold:g,rar}}
// the pack a zombie match gives, by the round reached (none before round 3)
function matchLucky(R){if(R<3)return null;const r=R>=15?'l':R>=10?'e':R>=6?'r':'c';if(Math.random()<.18){const up={c:'r',r:'e',e:'l',l:'l'}[r];return up}return r}
// unlocking times of the Lucky packs (seconds, as the chests' CHESTS[t].time)
const LTIME={c:15,r:45,e:90,l:240};
// ------------------------------------------------------------------ the shop's daily limit of the Lucky packs: it starts again at midnight;
// a clock put back (the day before the last one seen) does not start it again
function luckyDay(){const L=SAVE.lucky.shop,now=Date.now(),d=new Date(),day=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  if(now<(L.seen||0)-10*60e3)return L;// the clock went back: keep what was bought
  if(L.day!==day&&now>=(L.seen||0)-10*60e3){if(!L.day||new Date(now).setHours(0,0,0,0)>new Date(L.seen||0).setHours(0,0,0,0)){L.day=day;L.bought={}}}
  L.seen=Math.max(L.seen||0,now);return L}
const luckyLeft=r=>{const L=luckyDay();return Math.max(0,LBUSTE[r].day-(L.bought[r]||0))};
// the rewards turned into gold while away from the menu (a medal's chest with the slots full...): told once, back in the menu
function tellFullNotes(){const N=SAVE.fullNotes;if(!N||!N.length)return;const t=N.map(n=>n.k==='chest'?`${CHESTS[n.type].n}: +${n.g} oro`:`Lucky Cards ${PRN[n.rar]}: +${n.g} oro`).join(' · ');
  SAVE.fullNotes=[];save();setTimeout(()=>toast(`Posti pieni, al loro posto l'oro: ${t}`),900)}
{const _sm=showMenu;showMenu=function(){_sm.apply(this,arguments);tellFullNotes()};
  // (showMenu.lg, the day the login sheet was shown, stays the same property: the first showMenu ran before this wrapper)
  Object.defineProperty(showMenu,'lg',{get(){return _sm.lg},set(v){_sm.lg=v},configurable:true})}
// the Lucky pack of a zombie match, for the end screen of the map (src/js/63-zombie.js zFine; the cover: src/js/69-bustine.js packImg)
function zLuckyEnd(R){const r=matchLucky(R);if(!r)return`<small class="zlk">Supera il round 3 per vincere una bustina di Lucky Cards</small>`;const k=earnLucky(r,true),rr=k.rar||r;
  return`<div class="zlk${k.fifth?' fifth':''}"><img src="${packImg('lucky',rr,72)}" alt=""><div><b>${k.fifth?'Quinta bustina: ':''}Lucky Cards ${PRN[rr]}</b><span>${k.full?`Posti pieni: +${k.gold} oro al suo posto`:k.fifth?'I quattro posti erano pieni: è nel posto speciale':'Ti aspetta nei posti delle Lucky Cards'}</span></div></div>`}
