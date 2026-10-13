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
const N3G={on:true,cur:null,bad:{},pf:{},
  // states of the game with another name among the models' moves
  alias:{aim:'attack',dash:'dash',dive:'dive',howl:'howl',mega:'attack',storm:'attack',spiral:'attack',rain:'attack',shards:'attack',roots:'summon',
    spawn:'summon',imps:'summon',mirror:'attack',blizzard:'nova',avalanche:'pound',anvil:'slam',walls:'forge',blink:'tele',under:'burrow',out:'burrow',rise:'rise'}};
function n3Has(e){return N3G.on&&typeof N3!=='undefined'&&!!N3[e.type]&&N3.meta[e.type]&&N3.meta[e.type].g!=='eroi'&&!N3G.bad[e.type]}
// which enemy is being updated: its shots are its attacks
{const _u=updEnemy;updEnemy=function(e,dt){const k=N3G.cur;N3G.cur=e;try{return _u.apply(this,arguments)}finally{N3G.cur=k}}}
{const _s=shootE;shootE=function(){const e=N3G.cur;if(e&&G)e.a3=G.t;return _s.apply(this,arguments)}}
function n3Move(e){const M=N3.meta[e.type],an=M.an,t=G.t||0,has=a=>an.includes(a),dur=a=>(M.dur&&M.dur[a])||1;
  // losing health: the knock back
  if(e.h3hp==null)e.h3hp=e.hp;if(e.hp<e.h3hp-.01&&(e.h3==null||t-e.h3>dur('hit')*.35))e.h3=t;e.h3hp=e.hp;
  if(e.h3!=null&&t-e.h3<dur('hit')*.75&&has('hit'))return['hit',(t-e.h3)/dur('hit')];
  // a state that is one of its moves
  let st=e.st&&e.st!=='walk'&&e.st!=='rest'?(has(e.st)?e.st:has(N3G.alias[e.st])?N3G.alias[e.st]:null):null;
  if(!st&&e.st&&e.st!=='walk'&&e.st!=='rest'&&isBoss(e.type)){st=an.find(a=>!['idle','walk','hit'].includes(a))||null}
  if(st){if(e.s3!==e.st){e.s3=e.st;e.s3t=t}const k=(t-e.s3t)/dur(st);return[st,k<1?k:.5+(k-1)%1*.5]}
  e.s3=null;
  // the shot: the blow at the middle of the move
  if(e.a3!=null&&has('attack')){const k=.42+(t-e.a3)/dur('attack');if(k<1)return['attack',k]}
  if((e.aim>0)&&has('attack'))return['attack',Math.min(.4,e.aim*.4)];
  // walking (the game's flag, or the body moved since the last frame)
  if(e.moving||(e.x3!=null&&t>e.t3&&Math.hypot(e.x-e.x3,e.y-e.y3)/(t-e.t3)>5))e.mv3=t;if(e.t3==null||t-e.t3>=.05){e.x3=e.x;e.y3=e.y;e.t3=t}const mv=e.mv3!=null&&t-e.mv3<.22;
  const off=(e.id||e.x*.37)%7;
  if(mv&&has('walk'))return['walk',((t+off)/dur('walk'))%1];
  return['idle',((t+off)/dur('idle'))%1]}
function n3Face0(e){if(typeof e.face==='number'&&isFinite(e.face))return e.face;if(typeof P!=='undefined'&&P)return Math.atan2(P.y-e.y,P.x-e.x);return Math.PI/2}
// the direction turns toward the game's one at most ~9 rad/s and smoothly (the AI's direction jumps from a cell of the path to the next)
function n3Turn(o,f,t){if(o.f3==null||o.f3t==null||t-o.f3t>.5){o.f3=f;o.f3t=t;return f}const dt=Math.max(0,t-o.f3t);o.f3t=t;
  let d=f-o.f3;d=Math.atan2(Math.sin(d),Math.cos(d));const k=1-Math.exp(-dt*12),mx=9*dt;o.f3+=Math.max(-mx,Math.min(mx,d*k));return o.f3}
function n3Face(e){return n3Turn(e,n3Face0(e),G.t||0)}
{const _d0=drawEnemy0;drawEnemy0=function(e){if(!n3Has(e)||e.spawn>0)return _d0(e);const x=e.x,y=e.y;
  if(e.poisonT>0){for(let q=0;q<Math.min(3,e.poisonS);q++){const qq=(G.t*.9+q*.33)%1;ctx.fillStyle=`rgba(150,230,90,${.8*(1-qq)})`;circ(x+Math.sin(q*2.3+G.t*2)*e.r*.6,y-e.r*1.6-e.z-qq*14,2.2);ctx.fill()}}
  if(e.burn>0){ctx.fillStyle='rgba(255,138,60,.6)';circ(x+rand(-5,5),y-e.r*2-e.z+rand(-3,3),3);ctx.fill()}
  const hf=e.flash>0;if(hf){ctx.save();ctx.translate(Math.sin(G.t*130)*2.2,0);if(HASF)ctx.filter='brightness(1.85) saturate(.6)'}
  const esc=(e.elite||G.giant&&!isBoss(e.type))&&!e.type.includes('slime');if(esc){ctx.save();ctx.translate(x,y);ctx.scale(1.22,1.22);ctx.translate(-x,-y)}
  const M=N3.meta[e.type],[anim,p]=n3Move(e),sx=e.stun>0?Math.sin(G.t*40)*1.5:0;
  try{N3[e.type](x+sx,y+8-(e.z||0),n3Face(e),anim,Math.min(.999,Math.max(0,p)),M.sc||1,{p2:!!e.p2,noFx:LOWFX})}catch(er){console.error(er);N3G.bad[e.type]=1}
  if(esc)ctx.restore();if(hf)ctx.restore();
  if(e.root>0)drawRoots(e);if(e.frozen>0)drawFrozen(e)}}
// the pets (Muschietto, the Lucciola, the Draghetto) in 3D wherever the game draws them: in battle, in the menu, in their tab and icons
{const _ps=drawPetSprite;drawPetSprite=function(id,x,y,o){if(!N3G.on||typeof N3==='undefined'||!N3[id]||N3G.bad[id])return _ps.apply(this,arguments);o=o||{};
  const M=N3.meta[id],t=o.t!=null?o.t:(G.t||0),a=o.att?'attack':o.happy?'happy':o.moving?'walk':'idle',d=(M.dur&&M.dur[a])||2,
    p=a==='walk'?(((o.hop||0)/(TAU*2))%1+1)%1:((t/d)%1+1)%1;
  const fm=N3G.pf[id]=N3G.pf[id]||{};try{N3[id](x,y,n3Turn(fm,o.face==null?Math.PI/2:o.face,t),a,Math.min(.999,p),1,{noFx:LOWFX})}catch(er){console.error(er);N3G.bad[id]=1;_ps.apply(this,arguments)}}}
