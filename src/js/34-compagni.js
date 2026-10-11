// =====================================================================
// COMPANIONS: a little friend that follows you through every room
// =====================================================================
const PETS=[
  {id:'muschietto',n:'Muschietto',d:'Un batuffolo di muschio: lancia foglie taglienti al nemico più vicino.',rar:1,unlock:6,gems:120,how:'6 carte dalle casse o 120 cristalli',col:'#7bbf4a',base:{dmg:.32,cd:1.25},per:{dmg:.06}},
  {id:'lucciola',n:'Lucciola',d:'Fa luce intorno a te, lancia scintille che inseguono i nemici e ogni 8 secondi ti cura.',rar:2,unlock:15,gems:320,how:'15 carte dalle casse o 320 cristalli',col:'#e8ff7a',base:{dmg:.16,cd:1.5,heal:.05,hcd:8},per:{dmg:.03,heal:.006}},
  {id:'draghetto',n:'Draghetto',d:'Sputa fiammate che bruciano tutti i nemici davanti a lui.',rar:3,unlock:25,gems:650,how:'25 carte dalle casse o 650 cristalli',col:'#ff7a3c',base:{dmg:.55,cd:2.6},per:{dmg:.08}}];
const PET_BY={};PETS.forEach(p=>PET_BY[p.id]=p);
const PETMAX=10,petCost=l=>Math.round(200*Math.pow(l,1.5));
if(!SAVE.pets)SAVE.pets={owned:{},sel:null};if(!SAVE.pets.cards)SAVE.pets.cards={};for(const k in SAVE.pets.owned)if(SAVE.pets.owned[k].cards==null)SAVE.pets.owned[k].cards=0;
// up to 2 companions equipped, only by hand (old saves: the single 'sel' becomes the first slot)
const PET_SLOTS=2;function petEq(){const P0=SAVE.pets;if(!Array.isArray(P0.eq))P0.eq=P0.sel?[P0.sel]:[];delete P0.sel;P0.eq=P0.eq.filter((id,i,a)=>PET_BY[id]&&P0.owned[id]&&a.indexOf(id)===i).slice(0,PET_SLOTS);return P0.eq}petEq();
if(SAVE.road&&SAVE.road[500]&&!SAVE.pets.owned.lucciola&&!SAVE.pets.l500){SAVE.pets.owned.lucciola={lvl:1,cards:0}}SAVE.pets.l500=1;
const PET_NEED=[0,3,5,8,12,16,22,28,36,45],petNeed=l=>PET_NEED[Math.min(l,PET_NEED.length-1)];
// add pet cards: a locked pet unlocks by itself once it has enough; returns true when it just unlocked
function addPetCards(id,n){const P0=SAVE.pets,o=P0.owned[id];if(o){o.cards=(o.cards||0)+n;return false}const have=(P0.cards[id]||0)+n,need=PET_BY[id].unlock;
  if(have>=need){P0.owned[id]={lvl:1,cards:have-need};delete P0.cards[id];return true}P0.cards[id]=have;return false}// players who already took the 500-trophy prize
const petLvl=id=>(SAVE.pets.owned[id]||{lvl:1}).lvl;
const petStat=(id,k)=>{const p=PET_BY[id];return (p.base[k]||0)+(p.per[k]||0)*(petLvl(id)-1)};
function makePets(){let ids=SAVE.pets?petEq().slice():[];if(!ids.length&&G&&G.daily&&G.daily.mods&&G.daily.mods.includes('pets'))ids=['muschietto'];return ids.map((id,i)=>({id,slot:i,x:P.x+(i?26:-26),y:P.y+8,t:i*.7,cd:1+i*.5,hcd:petStat(id,'hcd')||0,face:-Math.PI/2,att:0,hop:0,happy:0,moving:false}))}
function updPet(dt){const list=G.pets||(G.pet?[G.pet]:[]);for(const pt of list)updOnePet(pt,dt);updPetShots(dt)}
function updOnePet(pt,dt){pt.t+=dt;pt.att=Math.max(0,pt.att-dt);pt.happy=Math.max(0,pt.happy-dt);
  if(Math.abs(Math.cos(P.face))>.2)pt.side=Math.cos(P.face)>=0?-1:1;const sd=(pt.side||-1)*(pt.slot?-1:1),tx=P.x+sd*26,ty=P.y+10+(pt.slot?6:0),dx=tx-pt.x,dy=ty-pt.y,dd=Math.hypot(dx,dy);
  if(dd>200){pt.x=tx;pt.y=ty}else if(dd>4){const sp=Math.min(dd*4,260);pt.x+=dx/dd*sp*dt;pt.y+=dy/dd*sp*dt;pt.moving=dd>8;pt.hop+=dt*12}else pt.moving=false;
  pt.x=clamp(pt.x,L+8,R-8);pt.y=clamp(pt.y,TOP+10,BOT-6);
  const tg=G.state==='play'?nearest(pt.x,pt.y,null,250):null;if(tg)pt.face=Math.atan2(tg.y-pt.y,tg.x-pt.x);else if(pt.moving)pt.face=Math.atan2(dy,dx);
  pt.cd-=dt;if(!tg)pt.cd=Math.max(pt.cd,.35);
  if(tg&&pt.cd<=0){pt.cd=petStat(pt.id,'cd');pt.att=.3;const dmg=P.atk*petStat(pt.id,'dmg')*(G.petBoost||1);
    if(pt.id==='draghetto'){const a=pt.face;for(let i=0;i<14;i++){const aa=a+rand(-.4,.4),s=rand(60,150);fxPush({k:'firep',x:pt.x+Math.cos(a)*10,y:pt.y-18+Math.sin(a)*10,vx:Math.cos(aa)*s,vy:Math.sin(aa)*s-15,t:rand(.3,.5),max:.5,r:rand(4,8)})}
      for(const e of G.enemies){if(!canHit(e))continue;const ex=e.x-pt.x,ey=e.y-pt.y,ed=Math.hypot(ex,ey);if(ed<90&&Math.abs(angDiff(a,Math.atan2(ey,ex)))<.55){hurtE(e,dmg,false);if(!e.dead){e.burn=Math.max(e.burn||0,2.2);e.burnTick=e.burnTick||.5}}}sfx('eshot','fire',pt.x)}
    else{G.petShots.push({x:pt.x,y:pt.y-(pt.id==='lucciola'?26:12),a:pt.face,v:pt.id==='lucciola'?280:380,kind:pt.id==='lucciola'?'spark':'leaf',dmg,life:1.3,hom:pt.id==='lucciola',vx:0,vy:0});sfx(pt.id==='lucciola'?'xp':'eshot',pt.id==='lucciola'?0:'thorn',pt.x)}}
  if(pt.id==='lucciola'&&G.state!=='dead'){pt.hcd-=dt;if(pt.hcd<=0){pt.hcd=petStat('lucciola','hcd');if(P.hp<P.maxhp){const v=Math.max(1,Math.round(P.maxhp*petStat('lucciola','heal')));P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#c8f04a',15);sfx('heal');pt.happy=.8;for(let i=0;i<12;i++)G.fx.push({k:'lvl',x:P.x+rand(-12,12),y:P.y-10,vx:rand(-50,50),vy:rand(-90,-20),t:.6})}}}}
function updPetShots(dt){if(!G.petShots)return;
  for(let i=G.petShots.length-1;i>=0;i--){const s=G.petShots[i];s.life-=dt;if(s.hom){const t2=nearest(s.x,s.y,null,220);if(t2){const da=angDiff(s.a,Math.atan2(t2.y-8-s.y,t2.x-s.x));s.a+=clamp(da,-7*dt,7*dt)}}
    s.vx=Math.cos(s.a)*s.v;s.vy=Math.sin(s.a)*s.v;s.x+=s.vx*dt;s.y+=s.vy*dt;let gone=s.life<=0||s.x<L||s.x>R||s.y<TOP||s.y>BOT||G.rocks.some(k=>Math.hypot(k.x-s.x,k.y-s.y)<k.r);
    if(!gone)for(const e of G.enemies){if(!canHit(e))continue;if(Math.hypot(e.x-s.x,e.y-e.z-8-s.y)<e.r+4){if(BLOCK[e.type]&&BLOCK[e.type](e,s)){gone=true;break}hurtE(e,s.dmg,false);gone=true;break}}
    if(gone){G.fx.push({k:'spark',x:s.x,y:s.y,t:.15});G.petShots.splice(i,1)}}}
function drawPetShots(){for(const s of G.petShots){if(s.kind==='spark'){ctx.save();ctx.globalCompositeOperation='lighter';glow('220,255,110',s.x,s.y,9,.8);ctx.restore();ctx.fillStyle='#fbffd8';circ(s.x,s.y,1.8);ctx.fill()}
  else{ctx.save();ctx.translate(s.x,s.y);ctx.rotate(G.t*18);ink(1.4);ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(0,-4,5,0);ctx.quadraticCurveTo(0,4,-5,0);fs('#7bd65a');ctx.restore()}}}
// one drawing per companion, with idle, walk/fly, attack and happy frames
function drawPetSprite(id,x,y,o){const f=Math.cos(o.face)<0?-1:1;
  if(id==='muschietto'){const bob=o.moving?Math.abs(Math.sin(o.hop))*4:Math.abs(Math.sin(o.t*3))*1,sq=o.moving?1+Math.cos(o.hop*2)*.06:1;ctx.save();ctx.translate(x,y-bob);ctx.scale(f*sq,2-sq);ink(2);
    circ(-4,1,2.6);fs('#4a6a2a');circ(4,1,2.6);fs('#4a6a2a');
    ctx.beginPath();for(let i=0;i<=18;i++){const a=i/18*TAU,r=9+(i%2?1.5:0);ctx.lineTo(Math.cos(a)*r,-9+Math.sin(a)*r)}ctx.closePath();fs('#6fb04a');
    ctx.fillStyle='rgba(255,255,255,.25)';ell(-3,-14,4,2.2);ctx.fill();
    for(const s of [-1,1]){ctx.save();ctx.translate(s*5,-17);ctx.rotate(s*(.45+(o.att>0?.5:0)+Math.sin(o.t*4)*.08));ink(1.6);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(4,-6,0,-12);ctx.quadraticCurveTo(-4,-6,0,0);fs('#9fe06a');ctx.restore()}
    const blink=Math.sin(o.t*1.7)>.97;ctx.fillStyle=INK;if(blink){ctx.fillRect(1,-10,3,1.2);ctx.fillRect(5.5,-10,3,1.2)}else{circ(2.6,-10,1.9);ctx.fill();circ(7,-10,1.9);ctx.fill();ctx.fillStyle='#fff';circ(3.1,-10.7,.7);ctx.fill();circ(7.5,-10.7,.7);ctx.fill()}
    ctx.fillStyle='#ff9ab0';ell(0.6,-6.5,1.6,1);ctx.fill();ell(8.8,-6.5,1.6,1);ctx.fill();
    if(o.att>0||o.happy>0){ctx.fillStyle='#3a1a1a';ell(5,-5.6,1.9,1.5);ctx.fill()}else{ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.arc(5,-6.6,1.6,.2,Math.PI-.2);ctx.stroke()}
    ctx.restore()}
  else if(id==='lucciola'){const by=y-26+Math.sin(o.t*3.2)*3,pulse=.6+.4*Math.sin(o.t*4)+(o.happy>0?.7:0);ctx.save();ctx.translate(x,by);ctx.scale(f,1);
    ctx.save();ctx.globalCompositeOperation='lighter';glow('220,255,110',-5,3,14+pulse*6,.45*Math.min(1.3,pulse));ctx.restore();
    const fl=Math.sin(o.t*40);ctx.fillStyle='rgba(230,245,255,.55)';ctx.strokeStyle='rgba(27,22,18,.6)';ctx.lineWidth=1;for(const s of [-1,1]){ctx.save();ctx.translate(0,-3);ctx.rotate(s*.4+fl*.3*s);ctx.beginPath();ctx.ellipse(-2,-5,3,6,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
    ink(1.6);ell(-5,3,5.5,4.2);fs(`rgb(${Math.min(255,200+40*pulse)|0},255,${Math.min(255,90+50*pulse)|0})`);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-7,6);ctx.moveTo(-4,-.5);ctx.lineTo(-4,6.5);ctx.stroke();
    ink(1.6);circ(1,-1,4);fs('#4a3a20');circ(5,-3,3.4);fs('#4a3a20');ctx.fillStyle='#fff';circ(6,-3.6,1.3);ctx.fill();ctx.fillStyle=INK;circ(6.4,-3.5,.65);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(6,-5.5);ctx.quadraticCurveTo(8,-10,11,-10);ctx.moveTo(5,-6);ctx.quadraticCurveTo(6,-11,9,-12.5);ctx.stroke();ctx.fillStyle='#e8ff7a';circ(11,-10,1);ctx.fill();circ(9,-12.5,1);ctx.fill();
    ctx.restore()}
  else{const by=y-18+Math.sin(o.t*3)*3,fl=Math.sin(o.t*14);ctx.save();ctx.translate(x,by);ctx.scale(f,1);ink(1.8);
    for(const s of [-1,1]){ctx.save();ctx.translate(-2,-6);ctx.rotate(-.5*s+fl*.35-(s<0?.3:0));ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-10,-11);ctx.lineTo(-7,-3);ctx.lineTo(-13,-2);ctx.lineTo(-6,2);ctx.closePath();fs(s<0?'#a8342a':'#d9442e');ctx.restore()}
    ctx.beginPath();ctx.moveTo(-6,2);ctx.quadraticCurveTo(-14,4+Math.sin(o.t*4)*2,-17,-2);ctx.lineTo(-14,1);ctx.closePath();fs('#e5582e');ctx.fillStyle='#ffd86b';ctx.beginPath();ctx.moveTo(-17,-2);ctx.lineTo(-20,-4);ctx.lineTo(-18,0);ctx.closePath();ctx.fill();
    ell(-1,0,8,6.5);fs('#e5582e');ctx.fillStyle='#ffd8a0';ell(1,2,5,3.5);ctx.fill();
    circ(6,-6,5.5);fs('#e5582e');for(const hx of [3,6.5]){ctx.beginPath();ctx.moveTo(hx,-10);ctx.lineTo(hx-2,-15);ctx.lineTo(hx+1.5,-10.5);ctx.closePath();fs('#ffd86b')}
    ctx.fillStyle='#fff';circ(7.6,-7,1.9);ctx.fill();ctx.fillStyle=INK;circ(8.1,-7,1);ctx.fill();
    if(o.att>0){ctx.fillStyle='#5a1f1f';ell(10.5,-4,2.3,1.7);ctx.fill();ctx.save();ctx.globalCompositeOperation='lighter';glow('255,140,50',14,-4,9,.7);ctx.restore()}else{ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(9,-4);ctx.lineTo(11,-4.6);ctx.stroke()}
    ctx.fillStyle='#ffd86b';for(const sx of [-2,3]){circ(sx,6.6,1.5);ctx.fill()}
    if(o.happy>0)for(let i=0;i<2;i++){ctx.fillStyle='#ff6a8a';const hy=-16-((o.t*20+i*8)%14);circ(i?4:-2,hy,1.4);ctx.fill()}
    ctx.restore()}}
function drawPet(pt){pt=pt||G.pet;if(!pt)return;drawPetSprite(pt.id,pt.x,pt.y,pt)}
function petShadow(){for(const pt of G.pets||(G.pet?[G.pet]:[])){if(pt.id==='muschietto')shadow(pt.x,pt.y+2,9,3.5,.3);else shadow(pt.x,pt.y+2,6,2.5,.2)}}
// --- the companion page in the hero tab ---
function renderPets(){const own=SAVE.pets.owned;
  const eq=petEq();$('petBox').innerHTML=`<div class="pslots">Con te: <b>${eq.length}/${PET_SLOTS}</b></div>`+PETS.map(p=>{const o=own[p.id],sel=eq.includes(p.id),l=o?o.lvl:1,c=petCost(l),need=petNeed(l),r=RAR[p.rar];
    const stat=p.id==='lucciola'?`Danno ${Math.round(petStat(p.id,'dmg')*100)}% · Cura ${Math.round(petStat(p.id,'heal')*100)}% ogni 8s`:`Danno ${Math.round(petStat(p.id,'dmg')*100)}% del tuo attacco · ogni ${petStat(p.id,'cd').toFixed(1)}s`;
    const have=o?o.cards||0:SAVE.pets.cards[p.id]||0,goal=o?need:p.unlock,max=o&&l>=PETMAX,pct=max?100:Math.min(100,have/goal*100),full=!max&&have>=goal;
    const bar=`<div class="pbar${full?' full':''}"><i style="width:${pct}%"></i><span>${max?'MAX':`${have}/${goal}`}</span></div>`;
    const btns=o?(sel?`<em class="inuse">Con te</em><button class="btn" data-pdrop="${p.id}">Lascia</button>`:`<button class="btn" data-psel="${p.id}">Porta</button>`)+(max?'':`<button class="btn go" data-pup="${p.id}" ${full&&SAVE.gold>=c?'':'disabled'}>Migliora <i class="coin"></i>${c}</button>`)
      :`<button class="btn gem" data-pbuy="${p.id}" ${(SAVE.gems||0)>=p.gems?'':'disabled'}>Sblocca <i class="gemS"></i>${p.gems}</button>`;
    return `<div class="petc ${o?'':'locked'} ${sel?'sel':''}" style="--pc:${p.col}"><canvas width="120" height="120" data-pet="${p.id}"></canvas><div class="pinfo2"><b>${p.n}${o?` <em>Liv. ${l}</em>`:''} <u style="color:${r.c}">${r.n}</u></b><span>${p.d}</span>${o?`<small>${stat}</small>`:`<small class="how">${LOCK} ${p.how}</small>`}${bar}</div>
      <div class="pbtn">${btns}</div></div>`}).join('');
  $('petBox').querySelectorAll('canvas[data-pet]').forEach(cv=>{const c=cv.getContext('2d'),saved=ctx;ctx=c;c.setTransform(3,0,0,3,60,92);const id=cv.dataset.pet;ctx.fillStyle='rgba(0,0,0,.3)';ell(0,2,12,4);ctx.fill();drawPetSprite(id,0,0,{t:1.2,face:0,moving:false,att:0,happy:own[id]?.3:0,hop:0});ctx=saved;if(!own[id])cv.style.filter='brightness(0) opacity(.6)'})}
document.addEventListener('click',e=>{const s=e.target.closest('[data-psel]'),u=e.target.closest('[data-pup]');
  if(s){const id=s.dataset.psel,eq=petEq();if(!SAVE.pets.owned[id]||eq.includes(id))return;let msg=PET_BY[id].n+' viene con te!';if(eq.length>=PET_SLOTS){const out=eq.shift();msg=`${PET_BY[out].n} resta a casa, ${PET_BY[id].n} viene con te!`}eq.push(id);save();sfx('pick');renderPets();toast(msg)}
  const dr=e.target.closest('[data-pdrop]');if(dr){const id=dr.dataset.pdrop,eq=petEq(),i=eq.indexOf(id);if(i<0)return;eq.splice(i,1);save();sfx('pick');renderPets();toast(PET_BY[id].n+' resta a casa')}
  if(u&&!u.disabled){const id=u.dataset.pup,o=SAVE.pets.owned[id],l=o.lvl,c=petCost(l),need=petNeed(l);if(SAVE.gold<c||l>=PETMAX||(o.cards||0)<need)return;SAVE.gold-=c;o.cards-=need;o.lvl=l+1;save();renderGold();sfx('upgrade');vib(25);renderPets();toast(`${PET_BY[id].n} sale al livello ${l+1}!`)}
  const bu=e.target.closest('[data-pbuy]');if(bu&&!bu.disabled){const p=PET_BY[bu.dataset.pbuy];if((SAVE.gems||0)<p.gems||SAVE.pets.owned[p.id])return;SAVE.gems-=p.gems;unlockPet(p.id);save();renderGold();sfx('victory');vib([30,30,60]);renderPets();toast(`${p.n} sbloccato! Tocca «Porta» per portarlo con te`)}});
function unlockPet(id){if(SAVE.pets.owned[id])return false;SAVE.pets.owned[id]={lvl:1,cards:SAVE.pets.cards[id]||0};delete SAVE.pets.cards[id];save();achPop('Nuovo compagno!',PET_BY[id].n+': trovalo nella scheda Compagni','unlock');return true}
const PETIMG={};function petIcon(id){if(PETIMG[id])return PETIMG[id];const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),saved=ctx;ctx=x;x.setTransform(2.4,0,0,2.4,48,74);drawPetSprite(id,0,0,{t:1.2,face:0,moving:false,att:0,happy:.3,hop:0});ctx=saved;return PETIMG[id]=c.toDataURL()}


