// =====================================================================
// THE HEROES' MASTERY AND THE SUPER THAT GROWS (Denis, 16 October: «Super che cresce»; of three ways he chose «Con la maestria»: every
// hero earns mastery by playing with him; at levels 3, 6 and 10 the Super becomes stronger, longer and takes a new effect. Free).
// - It is earned in the Classic runs (arenas, Abyss, challenge of the day) with the hero in the field: 1 an enemy, 4 an elite, 40 a
//   boss, 6 a clean room, 40 an arena won. Ten levels (MQ_XP); every level gives gold (50 × the level), shown at the next clean room.
// - The Super: level 3 «stronger» (+30% damage: ultK), level 6 «longer» (it lasts or counts 45% more: ultD), level 10 its own new
//   effect (ultX, MQ_X: one for each hero, here at the bottom). In battle the name of the Super carries the numeral of its grade.
// - In the Heroes tab: the mastery under the hero's words (level, bar, the three grades of the Super, each with what it gives).
// =====================================================================
const MQ_XP=[0,120,320,600,960,1400,1950,2600,3400,4400];
const ULT_TN=['',' I',' II',' III'];
function mqXP(id){const M=SAVE.maestria;return M&&M[id]||0}
function mqLvl(id){const x=mqXP(id);let l=1;for(let i=1;i<MQ_XP.length;i++)if(x>=MQ_XP[i])l=i+1;return l}
function ultTier(id){const l=mqLvl(id||(P&&P.hero)||SAVE.hero);return l>=10?3:l>=6?2:l>=3?1:0}
function ultK(){return ultTier()>=1?1.3:1}
function ultD(){return ultTier()>=2?1.45:1}
function ultX(){return ultTier()>=3}
if(typeof SAVE_BLOCCHI!=='undefined'&&!SAVE_BLOCCHI.classica.includes('maestria'))SAVE_BLOCCHI.classica.push('maestria');
// the new effect of each Super at level 10
const MQ_X={
  arciere:{n:'Freccia stellare',d:'alla fine una freccia gigante cade sul nemico più forte e stordisce chi è vicino'},
  cacciatrice:{n:'Ventaglio finale',d:'alla fine della danza sedici frecce volano tutto intorno'},
  balestriere:{n:'Dardo esplosivo',d:'il dardo scoppia su ogni nemico che trapassa'},
  druida:{n:'Spine',d:'quando le radici lasciano, le spine feriscono i nemici e tu ti curi'},
  bardo:{n:'Ritornello',d:'due secondi dopo la ballata suona di nuovo'},
  alchimista:{n:'Pioggia di calderoni',d:'altri due calderoni cadono su altri nemici'},
  ninja:{n:'Ombre esplosive',d:'alla fine le ombre scoppiano in una nuvola di fumo'},
  paladino:{n:'Doppio martello',d:'un secondo martello cade su altri nemici'},
  mago:{n:'Spuntoni di ghiaccio',d:'alla fine spuntano spine di ghiaccio sotto i nemici gelati'},
  berserker:{n:'Sete di battaglia',d:'durante la furia ogni colpo ti cura un poco'},
  corsaro:{n:'Il cannone grande',d:"l'ultima palla di cannone è enorme"},
  domatore:{n:'Il branco torna',d:'i lupi di luce tornano indietro una seconda volta'},
  monaco:{n:'Tre palmi',d:'alla fine tre palmi di luce invece di uno'}};
// ---- things the Supers do a moment later (a second bolt, a second verse…)
function ultLater(t,f){if(G)(G.ultQ||(G.ultQ=[])).push({t,f})}
{const _uu=updUlt;updUlt=function(dt){_uu.apply(this,arguments);try{mqTick(dt)}catch(e){}}}
{const _b=buildRoom;buildRoom=function(){const r=_b.apply(this,arguments);if(G){G.ultQ=[];G.mqC=[]}if(P)P.spinX=false;return r}}
function mqTick(dt){if(!G||!P)return;const Q=G.ultQ;if(Q&&Q.length)for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t-=dt;if(q.t<=0){Q.splice(i,1);if(G.state==='play')try{q.f()}catch(e){}}}
  // the Huntress: the dance ends with a fan of arrows all round
  if(P.spinX&&!(P.spin>0)){P.spinX=false;if(G.state==='play')mqFan()}
  // the Alchemist's small cauldrons
  const C=G.mqC;if(C&&C.length)for(let i=C.length-1;i>=0;i--){const c=C[i];c.t+=dt;if(c.t<0)continue;
    if(!c.done&&c.t>=c.fall){c.done=true;const x=c.x,y=c.y;shake(5);sfx('boom',0,x);sfx('nh','splash',x);
      vfxBlast(x,y,'123,240,106',80,{sparks:LOWFX?5:14,spcol:['#e8ffd8','#9cf57e','#5fd04a'],debris:'stone',n:LOWFX?3:8,dust:LOWFX?3:6,spore:LOWFX?2:8,sporeRgb:'140,240,110',cracks:28});
      for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-x,e.y-y)>72+e.r)continue;hurtE(e,P.atk*1.8*ultK(),Math.random()<P.crit);if(!e.dead){e.poisonS=4;e.poisonT=Math.max(e.poisonT||0,4)}}
      pzAdd(x,y,50,4.5,false)}
    if(c.t>=c.fall+1.4)C.splice(i,1)}}
// ---- the Archer: the star arrow on the strongest
function mqStar(nw){const tg=G.enemies.filter(canHit).sort((a,b)=>(isBoss(b.type)?1e9:0)+b.hp-((isBoss(a.type)?1e9:0)+a.hp))[0];
  const x=tg?tg.x:rand(L+60,R-60),y=tg?tg.y:rand(TOP+80,BOT-80);G.ultRain.push({x,y,t:-(nw*.4+.25),dur:.6,big:true})}
function mqStarDraw(r,p,h){const x=r.x,y=r.y-h*1.25;
  ctx.save();ctx.strokeStyle=`rgba(255,220,120,${(.35+p*.5).toFixed(3)})`;ctx.lineWidth=2.5;ctx.setLineDash([7,6]);ctx.lineDashOffset=-(G.t||0)*20;ctx.beginPath();ctx.arc(r.x,r.y,54,0,TAU);ctx.stroke();ctx.setLineDash([]);
  if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('255,226,130',x,y-10,34,.55);ctx.globalCompositeOperation='source-over'}
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,y-44);ctx.lineTo(x,y);ctx.stroke();ctx.strokeStyle='#ffd86b';ctx.lineWidth=4.5;ctx.stroke();
  ctx.fillStyle='#fff6c8';ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y+13);ctx.lineTo(x-8,y-2);ctx.lineTo(x+8,y-2);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffe58a';for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(x,y-34);ctx.lineTo(x+s*9,y-46);ctx.lineTo(x+s*2,y-44);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}
// ---- the Huntress: sixteen arrows all round
function mqFan(){for(let i=0;i<16;i++)arrow(P.x,P.y-8,i*TAU/16+(G.t||0),1.1*ultK());sfx('bow');fxPush({k:'ring2',x:P.x,y:P.y-10,rgb:'255,150,200',r0:12,r1:90,t:.35,max:.35,w:6})}
// ---- the Crossbowman: the second bolt, and the bolts that burst on whatever they go through
function mqBolt(){const tg=nearest(P.x,P.y),a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):P.face;P.face=a;
  G.arrows.push({wb:0,x:P.x+Math.cos(a)*10,y:P.y-8+Math.sin(a)*10,a,vx:Math.cos(a)*640,vy:Math.sin(a)*640,m:5*ultK(),pierce:999,ric:0,hit:new Set(),life:2,big:true,siege:true,xpl:ultX()});
  sfx('bow','balestra');shake(3)}
{const _u=update;update=function(dt){const g=G,A0=g&&g.arrows;let snap=null;
  if(A0&&A0.length){for(const ar of A0)if(ar.xpl)(snap||(snap=[])).push({ar,h:new Set(ar.hit)})}
  _u.apply(this,arguments);if(G!==g||!P)return;
  try{if(snap)for(const s of snap){for(const e of s.ar.hit){if(s.h.has(e))continue;const x=e.x,y=e.y;vfxBlast(x,y,'255,200,120',38,{sparks:LOWFX?4:10,spcol:['#fff2c8','#ffc070','#e07830'],dust:LOWFX?2:4,ring2:false});sfx('boom',0,x);
      for(const o of G.enemies)if(o!==e&&canHit(o)&&Math.hypot(o.x-x,o.y-y)<38+o.r)hurtE(o,P.atk*ultK(),Math.random()<P.crit)}}
    // the Druid: when the roots of the Super let go, the thorns
    let th=0;for(const e of G.enemies){if(!e.rootX||e.root>0)continue;e.rootX=false;if(!canHit(e))continue;th++;hurtE(e,P.atk*1.5*ultK(),Math.random()<P.crit);
      vfxBlast(e.x,e.y,'150,255,120',30,{sparks:LOWFX?3:8,spcol:['#e8ffd8','#9fff7a','#4a9a2a'],debris:'leaf',n:LOWFX?3:6,dust:2,ring2:false})}
    if(th){const v=Math.max(1,Math.round(P.maxhp*.02*th));P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#9fff7a',15);sfx('es','heal',P.x)}}catch(err){}}}
// ---- the Bard: the second verse
function mqVerse(){if(!G||!P)return;sfx('nh','ballata');G.ballad={t:0,dur:1.2,ring:0,note:0};text(P.x,P.y-58,'Ritornello','#ffd84a',14);
  for(const e of G.enemies){if(!canHit(e))continue;hurtE(e,P.atk*.8*ultK(),Math.random()<P.crit);if(!e.dead&&!isBoss(e.type))e.daze=Math.max(e.daze||0,1.2)}}
// ---- the Alchemist: two more cauldrons on other crowds (as far as can be from the first and from each other)
function mqCaulds(c0){const put=[c0];for(let i=0;i<2;i++){let best=null,bs=-1;for(const e of G.enemies){if(!canHit(e))continue;const far=Math.min(...put.map(q=>Math.hypot(q.x-e.x,q.y-e.y)));if(far<110)continue;
      let n=0;for(const f of G.enemies)if(canHit(f)&&Math.hypot(f.x-e.x,f.y-e.y)<80)n++;const sc=n*100+far*.1;if(sc>bs){bs=sc;best={x:e.x,y:e.y}}}
    const p=best||{x:clamp(c0.x+(i?-1:1)*140,L+40,R-40),y:clamp(c0.y+rand(-60,60),TOP+50,BOT-30)};put.push(p);
    (G.mqC||(G.mqC=[])).push({x:clamp(p.x,L+40,R-40),y:clamp(p.y,TOP+50,BOT-30),t:-.5-i*.35,fall:.62,done:false,rot:rand(-.4,.4)})}}
{const _ur=drawUltRain;drawUltRain=function(){_ur.apply(this,arguments);if(!G||!G.mqC||!G.mqC.length||typeof cauldDraw!=='function')return;const keep=G.cauld;
  try{for(const c of G.mqC){if(c.t<0)continue;G.cauld=c;ctx.save();ctx.translate(c.x,c.y);ctx.scale(.68,.68);ctx.translate(-c.x,-c.y);cauldDraw();ctx.restore()}}finally{G.cauld=keep}}}
// ---- the Ninja: the shadows burst
function mqShadowBurst(list){for(const s of list){if(s.x==null)continue;vfxBlast(s.x,s.y-6,'150,120,220',52,{sparks:LOWFX?4:12,spcol:['#e8dcff','#b8a6ff','#5a4890'],dust:LOWFX?2:6,ring2:true});
    for(const e of G.enemies)if(canHit(e)&&Math.hypot(e.x-s.x,e.y-s.y)<52+e.r)hurtE(e,P.atk*2*ultK(),Math.random()<P.crit)}sfx('boom',0,P.x);shake(4)}
// ---- the Paladin: a second hammer, on the crowd farthest from the first
function mqHammer2(H){let best=null,bn=-1;for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-H.x,e.y-H.y)<120)continue;let n=0;for(const f of G.enemies)if(canHit(f)&&Math.hypot(f.x-e.x,f.y-e.y)<110)n++;if(n>bn){bn=n;best=e}}
  const t=best?{x:clamp(best.x,L+40,R-40),y:clamp(best.y,TOP+50,BOT-30)}:esCrowd(110);if(!G.enemies.some(canHit))return;sfx('es','skyham');G.skyHam={x:t.x,y:t.y,t:0,fall:.62,done:false,second:true}}
// ---- the ice Mage: spikes of ice under the frozen ones (and the bosses the blizzard slowed)
function mqSpikes(){let n=0;for(const e of G.enemies){if(!canHit(e)||!(e.frozen>0||isBoss(e.type)&&e.slow>0))continue;n++;hurtE(e,P.atk*1.5*ultK(),Math.random()<P.crit);
    vfxBlast(e.x,e.y,'190,235,255',34,{sparks:LOWFX?4:10,spcol:['#ffffff','#d8f2ff','#7fc8ff'],dust:2,ring2:false});
    if(!LOWFX)for(let i=0;i<5;i++)esFx({k:'shard',x:e.x+rand(-8,8),y:e.y,vx:rand(-50,50),vy:rand(-160,-90),g:420,max:.55,r:rand(2.4,3.4),rot:rand(-.4,.4)})}
  if(n){sfx('es','ice',P.x);shake(3)}}
// ---- the Berserker: every blow in the fury heals a little (at most a quarter of his health in a fury)
function mqLeech(){if((P.furyHeal||0)>=.25||P.hp>=P.maxhp)return;const v=Math.max(1,Math.round(P.maxhp*.01));P.hp=Math.min(P.maxhp,P.hp+v);P.furyHeal=(P.furyHeal||0)+.01;
  if((P.leechN=(P.leechN||0)+1)%5===0)text(P.x,P.y-44,'+'+v*5,'#ff8a6a',13)}
// ---- earning it (only the Classic runs, never the trailer)
const mqOn=()=>!!(G&&P&&P.hero&&!INTRO.on&&G.mode!==undefined&&HERO_BY[P.hero]);
function mqAdd(v){if(!mqOn())return;const id=P.hero,M=SAVE.maestria||(SAVE.maestria={}),l0=mqLvl(id);M[id]=(M[id]||0)+v;G.mqGain=(G.mqGain||0)+v;const l1=mqLvl(id);
  if(l1>l0){for(let l=l0+1;l<=l1;l++){SAVE.gold+=50*l;(G.mqUp||(G.mqUp=[])).push(l)}try{renderGold()}catch(e){}save();if(G.state!=='play')mqShowUp()}}
function mqShowUp(){const U=G&&G.mqUp;if(!U||!U.length||!P)return;const l=U.shift(),id=P.hero,X=MQ_X[id];
  banner('Maestria '+l,l===3?'La Super diventa più forte':l===6?'La Super dura di più':l===10&&X?'Nuovo: '+X.n:'+'+(50*l)+' oro',2.2);sfx('upgrade');
  if(U.length)setTimeout(mqShowUp,2400)}
{const _ke=killE;killE=function(e,noLoot){const was=e&&e.dead;const r=_ke.apply(this,arguments);try{if(!was&&e&&e.dead&&!noLoot)mqAdd(isBoss(e.type)?40:e.elite?4:1)}catch(err){}return r}}
{const _u=update;update=function(dt){const st0=G&&G.state;_u.apply(this,arguments);try{if(st0==='play'&&G&&G.state==='cleared'&&!G.event){mqAdd(6);mqShowUp()}}catch(e){}}}
{const _er=endRun;endRun=function(win){try{if(win&&!INTRO.on)mqAdd(40)}catch(e){}return _er.apply(this,arguments)}}
// ---- the Heroes tab: the mastery under the hero's words
{const st=document.createElement('style');st.textContent=`
.mqBox{grid-column:1/-1;display:grid;gap:6px;margin-top:2px;padding:8px 10px 9px;border:2px solid var(--ink);border-radius:var(--hewn2,10px);background:linear-gradient(rgba(255,255,255,.04),rgba(0,0,0,.12))}
.mqTop{display:flex;align-items:baseline;gap:8px}.mqTop b{font-family:var(--display);font-weight:400;font-size:17px;color:var(--gold)}.mqTop span{margin-left:auto;font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.mqBar{height:8px;border:2px solid var(--ink);border-radius:6px;background:rgba(0,0,0,.35);overflow:hidden}.mqBar i{display:block;height:100%;background:linear-gradient(90deg,#c88a1c,var(--gold))}
.mqT{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
.mqT div{border:2px solid var(--ink);border-radius:8px;padding:4px 5px 5px;font-size:11.5px;line-height:1.2;color:var(--muted);background:rgba(0,0,0,.22);min-width:0}
.mqT div b{display:block;font-family:var(--display);font-weight:400;font-size:13px;color:#cbbfa6}
.mqT div.on{background:rgba(255,201,60,.12);border-color:#7a5a12;color:#eadfc6}.mqT div.on b{color:var(--gold)}
.mqTip{font-size:12px;color:var(--muted);line-height:1.3}`;document.head.appendChild(st)}
function mqHTML(id){const l=mqLvl(id),x=mqXP(id),max=l>=10,a=MQ_XP[l-1],b=max?a:MQ_XP[l],k=max?1:(x-a)/Math.max(1,b-a),t=ultTier(id),X=MQ_X[id]||{n:'Effetto nuovo',d:''};
  const g=[[3,'Più forte','+30% di danno'],[6,'Più lunga','dura il 45% in più'],[10,X.n,X.d]];
  return `<div class="mqTop"><b>Maestria Liv. ${l}</b><span>${max?'Massimo':x.toLocaleString('it-IT')+' / '+b.toLocaleString('it-IT')}</span></div><div class="mqBar"><i style="width:${Math.round(k*100)}%"></i></div>
  <div class="mqT">${g.map(([lv,n,d],i)=>`<div class="${t>i?'on':''}"><b>${ULT_TN[i+1].trim()} · ${n}</b>${t>i?d:'al livello '+lv}</div>`).join('')}</div>
  <div class="mqTip">Si guadagna giocando con questo eroe: nemici, boss, stanze pulite. La Super cresce ai livelli 3, 6 e 10.</div>`}
{const _rh=renderHero;renderHero=function(){const r=_rh.apply(this,arguments);try{const h=HERO_BY[heroView]||HEROES[0],info=$('heroInfo');if(info){let box=$('mqBox');
    if(!box){box=document.createElement('div');box.id='mqBox';box.className='mqBox';info.insertAdjacentElement('afterend',box)}box.innerHTML=mqHTML(h.id)}}catch(e){}return r}}
