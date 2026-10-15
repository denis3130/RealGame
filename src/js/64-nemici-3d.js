// =====================================================================
// THE ENEMIES AND BOSSES IN 3D in battle (sprite/nemici3d, N3): every enemy that has a 3D model is drawn by it instead of the drawing of
// today, with the move picked from what the enemy is really doing (richiesta di Denis del 13 ottobre: «aggiungi al gioco l'artefatto
// nemici e boss in 3d»). drawEnemy0 is wrapped: the effects round the body (poison, burn, the white flash, the bigger elites, roots,
// ice) stay those of the game; only the body changes. The move:
// - a boss or an enemy in a state that is one of its moves (leap, tongue, roll, dive, howl…): that move, p = time in the state / its length;
// - the moment it shoots (shootE during its update) or aims: 'attack' from the middle of the move, so the blow lands with the shot;
// - when it loses health: 'hit'; when it moves: 'walk'; else 'idle'. p only grows with time, so every move loops without a jump.
// The point of the models is the feet: 8 px below the game's point (as for the hero); e.z (jumps, flights) lifts the body.
// =====================================================================
const N3G={on:true,cur:null,bad:{},pf:{},opt:{},zm:{golem:1,toad:1,yeti:1},
  jp:{slime:e=>.22+.38*Math.min(1,Math.max(0,1-e.jump/.5)),bigslime:e=>.22+.38*Math.min(1,Math.max(0,1-e.jump/.5)),magmaslime:e=>.22+.38*Math.min(1,Math.max(0,1-e.jump/.5)),
    frog:e=>.18+.48*Math.min(1,Math.max(0,1-e.jump/.55))},wp:{toad:e=>((e.hopT||0)%.8+.8)%.8/.8},
  // states of the game with another name among the models' moves
  alias:{aim:'attack',dash:'dash',dive:'dive',howl:'howl',mega:'attack',storm:'attack',spiral:'attack',rain:'attack',shards:'attack',roots:'summon',
    spawn:'summon',imps:'summon',mirror:'attack',blizzard:'nova',avalanche:'pound',anvil:'slam',walls:'forge',blink:'tele',under:'burrow',out:'burrow',rise:'rise'}};
function n3Has(e){return N3G.on&&typeof N3!=='undefined'&&!!N3[e.type]&&N3.meta[e.type]&&N3.meta[e.type].g!=='eroi'&&!N3G.bad[e.type]}
// which enemy is being updated: its shots are its attacks
{const _u=updEnemy;updEnemy=function(e,dt){const k=N3G.cur;N3G.cur=e;try{return _u.apply(this,arguments)}finally{N3G.cur=k}}}
{const _h=hurtE;hurtE=function(e,dmg,crit,dot){if(e&&!dot&&!e.dead&&!(e.intro>0)&&!e.hidden&&G)e.h3q=G.t;return _h.apply(this,arguments)}}
{const _s=shootE;shootE=function(){const e=N3G.cur;if(e&&G)e.a3=G.t;return _s.apply(this,arguments)}}
function n3Move(e){const M=N3.meta[e.type],an=M.an,t=G.t||0,has=a=>an.includes(a),dur=a=>(M.dur&&M.dur[a])||1;
  // losing health: the knock back
  if(e.h3q!=null&&e.h3q!==e.h3u){e.h3u=e.h3q;if(!isBoss(e.type)&&(e.h3==null||t-e.h3>dur('hit')*.75+.45))e.h3=e.h3q}
  if(e.h3!=null&&t-e.h3<dur('hit')*.75&&has('hit'))return['hit',(t-e.h3)/dur('hit')];
  // a state that is one of its moves
  let st=e.st&&e.st!=='walk'&&e.st!=='rest'?(has(e.st)?e.st:has(N3G.alias[e.st])?N3G.alias[e.st]:null):null;
  if(!st&&e.st&&e.st!=='walk'&&e.st!=='rest'&&isBoss(e.type)){st=an.find(a=>!['idle','walk','hit'].includes(a))||null}
  if(st){if(e.s3!==e.st){e.s3=e.st;e.s3t=t;e.w3=0}const sf=isBoss(e.type)?((G.bossLvl&&G.bossLvl.spd)||1)*(e.p2?(e.type==='toad'?1.25:e.type==='golem'||e.type==='mimic'?1.3:1):1):1,k=(t-e.s3t)*sf/dur(st);if(k<1)return[st,k];
    const w=Math.floor((k-1)/.6);if(w>(e.w3||0)){e.b3a=st;e.b3p=e.a3p;e.b3t=t}e.w3=w;return[st,.35+((k-1)%.6)/.6*.3]}
  e.s3=null;
  // the shot: the blow at the middle of the move
  if(e.a3!=null&&has('attack')){const k=(e.aim3?.5:.25)+(t-e.a3)/dur('attack');if(k<1)return['attack',k]}
  if(e.aim>0&&has('attack')){e.aim3=Math.max(e.aim3||0,e.aim);return['attack',.45*(1-e.aim/e.aim3)]}
  if(e.a3==null||t-e.a3>dur('attack'))e.aim3=0;
  // walking (the game's flag, or the body moved since the last frame)
  if(e.moving||(e.x3!=null&&t>e.t3&&Math.hypot(e.x-e.x3,e.y-e.y3)/(t-e.t3)>5))e.mv3=t;if(e.t3==null||t-e.t3>=.05){e.x3=e.x;e.y3=e.y;e.t3=t}const mv=e.mv3!=null&&t-e.mv3<.22;
  if(e.o3==null)e.o3=Math.random()*7;const off=e.o3;
  const J=N3G.jp[e.type];if(J){if(e.jump>0&&has('walk')){e.i3=null;return['walk',J(e)]}}
  else if(mv&&has('walk')){e.i3=null;return['walk',N3G.wp[e.type]?N3G.wp[e.type](e):((t+off)/dur('walk'))%1]}
  if(e.a3n&&e.a3n!=='idle'&&e.a3n!=='walk'){if(e.i3==null)e.i3=t;if(t-e.i3<.08)return[e.a3n,e.a3p]}e.i3=null;
  return['idle',((t+off)/dur('idle'))%1]}
function n3Face0(e){if(typeof P!=='undefined'&&P&&e.f3!=null&&Math.hypot(P.x-e.x,P.y-e.y)<P.r+6)return e.f3;if(typeof e.face==='number'&&isFinite(e.face))return e.face;if(typeof P!=='undefined'&&P)return Math.atan2(P.y-e.y,P.x-e.x);return Math.PI/2}
// the direction turns toward the game's one at most ~9 rad/s and smoothly (the AI's direction jumps from a cell of the path to the next)
function n3Turn(o,f,t){if(o.f3==null||o.f3t==null||t-o.f3t>.5){o.f3=f;o.f3t=t;o.fx3=Math.cos(f);o.fy3=Math.sin(f);return f}const dt=Math.max(0,t-o.f3t);o.f3t=t;
  if(o.fx3==null){o.fx3=Math.cos(o.f3);o.fy3=Math.sin(o.f3)}const a=1-Math.exp(-dt/.15);o.fx3+=(Math.cos(f)-o.fx3)*a;o.fy3+=(Math.sin(f)-o.fy3)*a;
  if(Math.hypot(o.fx3,o.fy3)<.35)return o.f3;
  let d=Math.atan2(o.fy3,o.fx3)-o.f3;d=Math.atan2(Math.sin(d),Math.cos(d));const k=1-Math.exp(-dt*12),mx=9*dt;o.f3+=Math.max(-mx,Math.min(mx,d*k));return o.f3}
function n3Face(e){return n3Turn(e,n3Face0(e),G.t||0)}
{const _d0=drawEnemy0;drawEnemy0=function(e){if(!n3Has(e)||e.spawn>0)return _d0(e);const x=e.x,y=e.y,ea=e.alpha!=null&&isFinite(e.alpha)?Math.max(0,Math.min(1,e.alpha)):1;
  if(e.ph==='tele'||e.ph2==='tele'||ea<=.02)return;
  if(e.poisonT>0){for(let q=0;q<Math.min(3,e.poisonS);q++){const qq=(G.t*.9+q*.33)%1;ctx.fillStyle=`rgba(150,230,90,${.8*(1-qq)})`;circ(x+Math.sin(q*2.3+G.t*2)*e.r*.6,y-e.r*1.6-e.z-qq*14,2.2);ctx.fill()}}
  if(e.burn>0){const u=(G.t*1.6+(e.o3||0))%1;ctx.fillStyle=`rgba(255,138,60,${(.7*(1-u)).toFixed(3)})`;circ(x+Math.sin(G.t*5+(e.o3||0))*4,y-e.r*2-e.z-u*10,3*(1-u*.5));ctx.fill()}
  const hf=e.flash>0;if(hf){ctx.save()}
  const esc=(e.elite||G.giant&&!isBoss(e.type))&&!e.type.includes('slime');if(esc){ctx.save();ctx.translate(x,y);ctx.scale(1.22,1.22);ctx.translate(-x,-y)}
  const M=N3.meta[e.type],[anim,p]=n3Move(e),sx=0;
  const fc=n3Face(e),pp=Math.min(.999,Math.max(0,p)),t=G.t||0,X=x+sx,zg=N3G.zm[e.type],Y=y+8-(zg||N3G.jp[e.type]?0:(e.z||0)),o3={p2:!!e.p2,noFx:LOWFX};if(zg)o3.z=e.z||0;if(N3G.opt[e.type])Object.assign(o3,N3G.opt[e.type](e));
  // a change of move fades over 0.12 s: the old pose (frozen) fades under the new one, so no pose ever pops into another
  if(e.a3n!==anim){if(e.a3n!=null){e.b3a=e.a3n;e.b3p=e.a3p;e.b3t=t}e.a3n=anim}e.a3p=pp;
  const aE=ctx.globalAlpha;ctx.globalAlpha=aE*ea;
  try{if(e.b3t!=null&&t-e.b3t<.12){const a0=ctx.globalAlpha;ctx.globalAlpha=a0*.6*(1-(t-e.b3t)/.12);N3[e.type](X,Y,fc,e.b3a,e.b3p,M.sc||1,{...o3,noFx:true});ctx.globalAlpha=a0}
    N3[e.type](X,Y,fc,anim,pp,M.sc||1,o3)}catch(er){console.error(er);N3G.bad[e.type]=1}
  ctx.globalAlpha=aE;
  if(esc)ctx.restore();if(hf){ctx.restore();ctx.save();ctx.globalCompositeOperation='lighter';glow('255,255,255',x,y-e.r-(e.z||0),e.r*1.8,.55*Math.min(1,e.flash/.08));ctx.restore()}
  if(e.root>0)drawRoots(e);if(e.frozen>0)drawFrozen(e)}}
// the pets (Spiritello, Funghetto, Lucciola, Corvetto, Draghetto) in 3D wherever the game draws them: in battle, in the menu, in their tab and icons
{const _ps=drawPetSprite;drawPetSprite=function(id,x,y,o){if(!N3G.on||typeof N3==='undefined'||!N3[id]||N3G.bad[id])return _ps.apply(this,arguments);o=o||{};
  const M=N3.meta[id],t=o.t!=null?o.t:(G.t||0),a=o.att?'attack':o.happy?'happy':o.moving?'walk':'idle',d=(M.dur&&M.dur[a])||2,
    p=a==='walk'?(((o.hop||0)/(TAU*2))%1+1)%1:a==='attack'&&o.att>0&&o.att<=.3?1-o.att/.3:a==='happy'&&o.happy>0?1-Math.min(1,o.happy/.8):((t/d)%1+1)%1;
  const fm=N3G.pf[id]=N3G.pf[id]||{},fc=n3Turn(fm,o.face==null?Math.PI/2:o.face,t),pp=Math.min(.999,Math.max(0,p));
  if(fm.a!==a){if(fm.a!=null){fm.ba=fm.a;fm.bp=fm.p;fm.bt=t}fm.a=a}fm.p=pp;
  try{if(fm.bt!=null&&t-fm.bt>=0&&t-fm.bt<.12){const a0=ctx.globalAlpha;ctx.globalAlpha=a0*.6*(1-(t-fm.bt)/.12);N3[id](x,y,fc,fm.ba,fm.bp,1,{noFx:true});ctx.globalAlpha=a0}
    N3[id](x,y,fc,a,pp,1,{noFx:LOWFX})}catch(er){console.error(er);N3G.bad[id]=1;_ps.apply(this,arguments)}}}
