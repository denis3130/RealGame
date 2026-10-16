// =====================================================================
// THE SIX HEROES OF 16 OCTOBER IN BATTLE (Denis: «sia la 1 che la 2»: Paladino, Mago del ghiaccio, Berserker, Corsaro, Domatore, Monaco).
// They are in HEROES (39) with their style (the 3D pieces are in sprite/eroe3d), their shot (P.proj) and their Super (ULT in 35). Here:
//   Paladino   'hammer' hammers of light; every fourth one is sacred: bigger, and when it hits it heals you a little. His shield parries a
//                       blow every 6 s (P.shield, hurtP). Super «Martello del cielo»: a giant hammer of light falls on the thickest crowd:
//                       it stuns them, and a golden light heals you and keeps you safe a moment
//   Mago       'ice'    orbs of ice that slow (he starts with the Frecce di ghiaccio); every fifth one freezes a small enemy a moment.
//                       Super «Tormenta»: a blizzard freezes every enemy (the bosses only slowed) and shards of ice fall on them
//   Berserker  'axe'    axes that fly out and come back like a boomerang, hitting on the way out and on the way back. Super «Furia»: red
//                       with rage, he throws much faster and harder and runs quicker for a few seconds
//   Corsaro    'knife'  two knives a throw, one after the other; an enemy too close gets the sabre instead (a cut in front of him).
//                       Super «Bordata»: cannonballs from the sea fall on the enemies
//   Domatore   'lash'   the whip cracks on the nearest enemy in its reach; his wolf Zanna runs and bites. Super «Il branco»: Zanna howls,
//                       four wolves of light run through the enemies, and Zanna bites twice as fast for a while
//   Monaco     'wave'   punches that throw waves of air, wider than an arrow; every fourth punch a shockwave all round pushes them back.
//                       Super «Cento pugni»: a storm of punches, then a palm of light that goes through everything
// The 3D hero plays the cut and the other fist through H3D.ex (62). Everything respects LOWFX. The numbers are to be tuned by playing.
// =====================================================================
const ES={palN:0,iceN:0,punchN:0,col:{hammer:'255,215,110',ice:'150,220,255',axe:'230,235,245',knife:'230,235,245',lash:'255,236,180',wave:'255,241,168'}};
const ESH=id=>P&&P.hero===id;
// ------------------------------------------------------------------ what each one starts with
{const _am=applyMeta;applyMeta=function(p){_am.apply(this,arguments);if(!p)return;
  if(p.hero==='paladino'){p.shield=Math.max(p.shield||0,2);p.shCd=0}}}
// ------------------------------------------------------------------ the shots
// (only the shots of a volley become axes and lashes: the blades of the storm and the like stay what they are)
{const _a=arrow;arrow=function(x,y,a,m){if(P&&G&&!INTRO.on&&ES.vol){
    if(P.proj==='axe'){axeSpawn(x,y,a,m);return}
    if(P.proj==='lash'){lashSpawn(x,y,a,m);return}}
  _a.apply(this,arguments);const ar=G.arrows[G.arrows.length-1];if(!ar||!P)return;
  if(P.proj==='hammer'){ar.ham=true;ar.ph=rand(0,TAU);if(++ES.palN%4===0){ar.sacred=true;ar.m*=1.25}}
  else if(P.proj==='ice'){ar.orb=true;ar.ph=rand(0,TAU);if(++ES.iceN%5===0){ar.frost=true;ar.m*=1.15}}
  else if(P.proj==='knife')ar.knife=true;
  else if(P.proj==='wave'){ar.wave=true;ar.life=Math.min(ar.life,.6);ar.rad=13;ar.pierce=(ar.pierce||0)+1}}}
{const _v=volley;volley=function(a){if(!P||!G)return _v.apply(this,arguments);
  // the Corsair: an enemy too close gets the sabre instead of the knives
  if(P.proj==='knife'){const e=nearest(P.x,P.y);if(e&&Math.hypot(e.x-P.x,e.y-P.y)-e.r<44){slashStart(Math.atan2(e.y-P.y,e.x-P.x));return}}
  if(P.proj==='wave'){ES.punchN++;P.alt=ES.punchN%2===0;if(ES.punchN%4===0)shockRing(P.x,P.y,1)}
  // the axes and the lashes: the volley's shots become them; its giant shot (every third volley) is a big one, here
  const own=P.proj==='axe'||P.proj==='lash',gi=P.giant;if(own){ES.vol=true;P.giant=0}
  try{_v.apply(this,arguments)}finally{if(own){ES.vol=false;P.giant=gi}}
  if(own&&gi&&(G.gv=(G.gv||0)+1)%3===0){if(P.proj==='axe'){axeSpawn(P.x,P.y-6,a,2.4);G.axes[G.axes.length-1].big=true}else lashSpawn(P.x,P.y-6,a,2.4)}
  // the second knife, a moment after the first
  if(P.proj==='knife')(G.knifeQ||(G.knifeQ=[])).push({t:.09,a})}}
// ------------------------------------------------------------------ the Paladin
// the sacred hammers that hit heal; the frost orbs that hit freeze (a set of the enemies each had hit, before the game's update)
{const _u=update;update=function(dt){const g=G,A0=g&&g.arrows;let snap=null;
  if(A0&&A0.length&&P&&(P.proj==='hammer'||P.proj==='ice')){snap=[];for(const ar of A0)if(ar.sacred||ar.frost)snap.push({ar,h:new Set(ar.hit)})}
  _u.apply(this,arguments);
  if(snap&&G===g)for(const s of snap){const nw=[...s.ar.hit].filter(e=>!s.h.has(e));if(!nw.length)continue;
    if(s.ar.sacred&&!s.ar.healed){s.ar.healed=true;const v=Math.max(1,Math.round(P.maxhp*.03));if(P.hp<P.maxhp){P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#ffd86b',15)}
      sfx('es','heal',P.x);if(!LOWFX)for(let i=0;i<6;i++)esFx({k:'spark',x:P.x+rand(-10,10),y:P.y-10+rand(-14,6),vx:rand(-20,20),vy:rand(-70,-30),max:rand(.5,.8),r:rand(1.2,2),c:'#ffe58a'})}
    if(s.ar.frost)for(const e of nw)if(!e.dead&&!isBoss(e.type)&&!(e.frozen>0)){e.frozen=1.1;text(e.x,e.y-e.r-30,'GELO','#bfe9ff',13);sfx('es','freeze',e.x)}}}}
// the shield: a golden parry (the shield on his arm flashes)
{const _hp=hurtP;hurtP=function(d){if(ESH('paladino')&&!INTRO.on&&P.shield&&P.shCd<=0&&!(P.inv>0)&&!(P.dashT>0)&&G.state!=='dead'){
    P.shCd=6;P.inv=.45;P.shHit=.35;vfxBlast(P.x,P.y-10,'255,215,110',44,{sparks:LOWFX?5:12,spcol:['#fff6c8','#ffd86b','#e0b040'],dust:0,ring2:false});
    text(P.x,P.y-42,'PARATO','#ffd86b',14);sfx('es','parry',P.x);return}
  return _hp.apply(this,arguments)}}
// ------------------------------------------------------------------ the Berserker's axes: out and back
function axeSpawn(x,y,a,m){const L=G.axes||(G.axes=[]);const sp=P.pspd||560;L.push({x,y,a,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,m:m||1,t:0,tb:0,back:false,hit:new Set(),hit2:new Set(),rot:rand(0,TAU),big:P.fury>0})}
function axeUpdate(dt){const L=G.axes;if(!L||!L.length)return;
  for(let i=L.length-1;i>=0;i--){const ax=L[i];ax.t+=dt;ax.rot+=dt*(ax.back?-24:24);
    if(!ax.back){ax.x+=ax.vx*dt;ax.y+=ax.vy*dt;const slow=Math.max(.25,1-ax.t/.5);ax.vx*=Math.pow(.2,dt*(1-slow));ax.vy*=Math.pow(.2,dt*(1-slow));
      const out=ax.x<L_()+6||ax.x>R_()-6||ax.y<TOP+6||ax.y>BOT-6,rk=G.rocks.find(k=>Math.hypot(k.x-ax.x,k.y-ax.y)<k.r);
      if(ax.t>=.46||out||rk){ax.back=true;ax.tb=0;if(out||rk){G.fx.push({k:'spark',x:ax.x,y:ax.y,t:.15});sfx('es','clank',ax.x)}}}
    else{ax.tb+=dt;const dx=P.x-ax.x,dy=P.y-8-ax.y,d=Math.hypot(dx,dy)||1,sp=Math.min(980,380+ax.tb*1300);ax.x+=dx/d*sp*dt;ax.y+=dy/d*sp*dt;
      if(d<16||ax.tb>2.2){L.splice(i,1);if(d<16)sfx('es','catch',P.x);continue}}
    const set=ax.back?ax.hit2:ax.hit,R0=ax.big?15:11;
    for(const e of G.enemies){if(!canHit(e)||set.has(e))continue;if(Math.hypot(e.x-ax.x,e.y-e.z-8-ax.y)>e.r+R0)continue;set.add(e);
      const crit=Math.random()<P.crit;hurtE(e,P.atk*ax.m*(crit?(P.critMul||2):1)*(P.fury>0?1.3:1),crit);ultGain(1);
      if(!e.dead&&!isBoss(e.type)){const ka=ax.back?Math.atan2(e.y-P.y,e.x-P.x):ax.a;e.kbx=(e.kbx||0)+Math.cos(ka)*60;e.kby=(e.kby||0)+Math.sin(ka)*60}
      for(let q=0;q<4;q++)G.fx.push({k:'chunk',x:ax.x,y:ax.y,vx:rand(-90,90),vy:rand(-90,90),t:rand(.15,.3),r:rand(1.2,2.2),col:ECOL[e.type]})}}}
const L_=()=>L,R_=()=>R;
// ------------------------------------------------------------------ the Corsair: the second knife, the sabre
function slashStart(a){P.slashT=0;P.face=a;(G.slashQ||(G.slashQ=[])).push({t:.07,a});sfx('es','swish',P.x)}
function slashHit(a){const x=P.x,y=P.y-6;let n=0;
  for(const e of G.enemies){if(!canHit(e))continue;const dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy);if(d>66+e.r)continue;let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>1.4&&d>e.r+10)continue;
    const crit=Math.random()<P.crit;hurtE(e,P.atk*1.8*(crit?(P.critMul||2):1),crit);ultGain(1.5);n++;if(!e.dead&&!isBoss(e.type)){e.kbx=(e.kbx||0)+Math.cos(a)*120;e.kby=(e.kby||0)+Math.sin(a)*120}}
  G.slashFx={x,y,a,t:0};if(n){shake(2);sfx('es','clang',x);G.hitstop=Math.max(G.hitstop||0,.04)}}
// ------------------------------------------------------------------ the Tamer's whip: a crack on the first enemy in its reach
function lashSpawn(x,y,a,m){const reach=200;let best=null,bd=1e9;
  for(const e of G.enemies){if(!canHit(e))continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy)-e.r;if(d>reach)continue;let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));
    if(Math.abs(da)>.38)continue;if(d<bd){bd=d;best=e}}
  const L=G.lashes||(G.lashes=[]),to=best?{x:best.x,y:best.y-best.r*.6}:{x:P.x+Math.cos(a)*reach*.85,y:P.y-8+Math.sin(a)*reach*.85};
  L.push({a,t:0,dur:.32,e:best,tx:to.x,ty:to.y,m:m||1,hit:false,side:Math.random()<.5?-1:1})}
function lashUpdate(dt){const L=G.lashes;if(!L||!L.length)return;
  for(let i=L.length-1;i>=0;i--){const s=L[i];s.t+=dt;if(s.e&&!s.e.dead){s.tx=s.e.x;s.ty=s.e.y-s.e.r*.6}
    if(!s.hit&&s.t>=.1){s.hit=true;sfx('es','crack',s.tx);esFx({k:'crack',x:s.tx,y:s.ty,max:.22});
      if(s.e&&canHit(s.e)){const e=s.e,crit=Math.random()<P.crit;hurtE(e,P.atk*1.35*s.m*(crit?(P.critMul||2):1),crit);ultGain(1.2);
        if(!e.dead&&!isBoss(e.type)){e.kbx=(e.kbx||0)+Math.cos(s.a)*50;e.kby=(e.kby||0)+Math.sin(s.a)*50}}}
    if(s.t>=s.dur)L.splice(i,1)}}
// ------------------------------------------------------------------ the Tamer's wolf Zanna: it runs to the nearest enemy and bites, then
// comes back beside him; it cannot be hurt
const ZANNA={pal:{fur:'#8a7a66',lite:'#efe2cc',dark:'#5e4e3e',earIn:'#d8b8a0',eye:'#ffd86b',eyeRgb:'255,216,107'},collar:'#c8323c'};
function wolfMake(){if(!P)return null;return{k:'wolf',x:P.x-22,y:P.y+10,face:P.face||0,st:'idle',t:0,cd:.6,anim:'idle',at:0,bite:0,howl:0,fury:0}}
function wolfUpdate(dt){if(!ESH('domatore')){G.allies=null;return}let W=G.allies&&G.allies.find(a=>a.k==='wolf');if(!W){W=wolfMake();if(!W)return;G.allies=[W]}
  W.t+=dt;W.cd-=dt;W.fury=Math.max(0,W.fury-dt);if(W.bite>0)W.bite-=dt;if(W.howl>0)W.howl-=dt;
  if(Math.hypot(W.x-P.x,W.y-P.y)>420){W.x=P.x-20;W.y=P.y+10}
  const play=G.state==='play',tg=play?nearest(W.x,W.y,null,360):null,sp=W.fury>0?300:250;let mx=0,my=0;
  if(W.howl>0){W.anim='howl'}
  else if(tg&&Math.hypot(tg.x-P.x,tg.y-P.y)<420){const dx=tg.x-W.x,dy=tg.y-W.y,d=Math.hypot(dx,dy)||1;W.face=Math.atan2(dy,dx);
    if(d>tg.r+15){mx=dx/d*sp;my=dy/d*sp}
    else if(W.cd<=0){W.cd=W.fury>0?.42:.85;W.bite=.5;const crit=Math.random()<P.crit;hurtE(tg,P.atk*1.05*(W.fury>0?1.3:1)*(crit?(P.critMul||2):1),crit);ultGain(.8);sfx('es','bite',W.x);
      if(!tg.dead&&!isBoss(tg.type)){tg.kbx=(tg.kbx||0)+Math.cos(W.face)*36;tg.kby=(tg.kby||0)+Math.sin(tg.face||0)*0+Math.sin(W.face)*36}}}
  else{const hx=P.x-Math.cos(P.face||0)*26,hy=P.y+12-Math.sin(P.face||0)*10,dx=hx-W.x,dy=hy-W.y,d=Math.hypot(dx,dy);if(d>14){const s=Math.min(sp,d*4);mx=dx/d*s;my=dy/d*s;W.face=Math.atan2(dy,dx)}else W.face=P.face||W.face}
  if(mx||my){const nx=clamp(W.x+mx*dt,L+10,R-10),ny=clamp(W.y+my*dt,TOP+14,BOT-8);W.x=nx;W.y=ny}
  W.moving=!!(mx||my);if(W.howl<=0)W.anim=W.bite>0?'attack':W.moving?'walk':'idle'}
function drawAlly(W){if(W.k!=='wolf'||typeof N3==='undefined'||!N3.wolf)return;const dur={idle:2.6,walk:.5,attack:1,howl:.9}[W.anim]||1;
  let p=W.anim==='attack'?clamp(1-W.bite/.5,0,1)*.6+.12:W.anim==='howl'?clamp(1-W.howl/.9,0,1):((W.t/dur)%1+1)%1;
  if(W.fury>0&&!LOWFX)glow('255,120,80',W.x,W.y-10,26,.25+.1*Math.sin(G.t*9));
  try{N3.wolf(W.x,W.y+4,W.face,W.anim,p,.7,{...ZANNA,noFx:LOWFX})}catch(e){}}
// ------------------------------------------------------------------ the Monk: the shockwave of every fourth punch
function shockRing(x,y,k){fxPush({k:'ring2',x,y:y-4,rgb:'255,241,168',r0:10,r1:84*k,t:.38,max:.38,w:7});sfx('es','shock',x);shake(1.5);
  for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-x,e.y-y)>74*k+e.r)continue;hurtE(e,P.atk*.7*k,false);if(!e.dead&&!isBoss(e.type)){const a=Math.atan2(e.y-y,e.x-x);e.kbx=(e.kbx||0)+Math.cos(a)*90;e.kby=(e.kby||0)+Math.sin(a)*90}}
  if(!LOWFX)for(let i=0;i<8;i++){const a=i/8*TAU;G.fx.push({k:'puff',x:x+Math.cos(a)*14,y:y+4+Math.sin(a)*7,vx:Math.cos(a)*110,vy:Math.sin(a)*55,t:rand(.3,.45),r:rand(4,6)})}}
// ------------------------------------------------------------------ little particles of their own: sparks, snow, the crack of the whip
function esFx(f){const L=G.esfx||(G.esfx=[]);f.t=0;if(L.length<(LOWFX?40:140))L.push(f)}
function esFxUpdate(dt){const L=G.esfx;if(!L||!L.length)return;for(let i=L.length-1;i>=0;i--){const f=L[i];f.t+=dt;if(f.t>=f.max){L.splice(i,1);continue}if(f.g)f.vy+=f.g*dt;f.x+=(f.vx||0)*dt;f.y+=(f.vy||0)*dt}}
function esFxDraw(){const L=G.esfx;if(!L||!L.length)return;
  for(const f of L){const u=f.t/f.max;
    if(f.k==='spark'){ctx.globalAlpha=1-u;ctx.fillStyle=f.c||'#fff';ctx.beginPath();ctx.arc(f.x,f.y,f.r*(1-u*.5),0,TAU);ctx.fill();ctx.globalAlpha=1}
    else if(f.k==='snow'){ctx.globalAlpha=Math.min(1,(1-u)*2)*.9;ctx.fillStyle='#f4faff';ctx.beginPath();ctx.arc(f.x+Math.sin(f.t*3+f.r*7)*4,f.y,f.r,0,TAU);ctx.fill();ctx.globalAlpha=1}
    else if(f.k==='crack'){ctx.save();ctx.globalAlpha=1-u;if(!LOWFX)glow('255,240,190',f.x,f.y,16,.6);ctx.strokeStyle='#fffbe8';ctx.lineWidth=1.6;ctx.lineCap='round';
      for(let i=0;i<6;i++){const a=i/6*TAU+.3,r0=3+u*6,r1=7+u*12;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0);ctx.lineTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1);ctx.stroke()}ctx.restore()}
    else if(f.k==='shard'){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot||0);ctx.globalAlpha=1-u;ctx.fillStyle='#d8f2ff';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-f.r*1.6);ctx.lineTo(f.r*.6,0);ctx.lineTo(0,f.r*1.6);ctx.lineTo(-f.r*.6,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.globalAlpha=1}}}
// ------------------------------------------------------------------ the Supers (called by useUlt in 35)
Object.assign(NH_ULT,{
  // Martello del cielo: on the thickest crowd (or in front of him) a giant hammer of light falls: stuns, heals, keeps him safe
  paladino(){sfx('es','skyham');const t=esCrowd(110);G.skyHam={x:t.x,y:t.y,t:0,fall:.62,done:false}},
  // Tormenta: every enemy frozen (the bosses slowed), hurt, and ice falls on them for a while
  mago(){sfx('es','blizzard');G.blizz={t:0,dur:3.4,tick:.4};fxPush({k:'flash',x:P.x,y:P.y-10,rgb:'200,235,255',r:420,t:.45,max:.45});
    for(const e of G.enemies){if(!canHit(e))continue;hurtE(e,P.atk*1.2,Math.random()<P.crit);if(e.dead)continue;if(isBoss(e.type))e.slow=Math.max(e.slow||0,4.5);else e.frozen=Math.max(e.frozen||0,2.4)}},
  // Furia: faster, harder, quicker for six seconds, red with rage
  berserker(){sfx('es','fury');P.fury=6;P.furyAspd=P.aspd;P.aspd*=1.8;P.furySpd=P.spd;P.spd*=1.15;shake(5);
    vfxBlast(P.x,P.y-10,'255,90,60',70,{sparks:LOWFX?8:20,spcol:['#ffd0a0','#ff6a3c','#c8281e'],dust:LOWFX?3:8,ring2:true})},
  // Bordata: cannonballs from the sea, on the enemies and round them
  corsaro(){sfx('es','cannon');const tg=G.enemies.filter(canHit).sort(()=>Math.random()-.5),L=[];
    for(let i=0;i<10;i++){const e=tg[i%Math.max(1,tg.length)];const x=e&&i<tg.length+3?e.x+rand(-16,16):rand(L_()+40,R_()-40),y=e&&i<tg.length+3?e.y+rand(-12,12):rand(TOP+50,BOT-50);
      L.push({x:clamp(x,L_()+20,R_()-20),y:clamp(y,TOP+30,BOT-20),t:-i*.13-rand(0,.08),fall:.7,done:false})}G.cannon=(G.cannon||[]).concat(L)},
  // Il branco: Zanna howls, four wolves of light run through the enemies, Zanna in a fury
  domatore(){sfx('es','howl');const W=G.allies&&G.allies.find(a=>a.k==='wolf');if(W){W.howl=.9;W.fury=7}
    const tg=G.enemies.filter(canHit),L=[];for(let i=0;i<4;i++){const e=tg[i%Math.max(1,tg.length)],a=e?Math.atan2(e.y-P.y,e.x-P.x)+rand(-.15,.15):P.face+(i-1.5)*.7;
      L.push({x:P.x,y:P.y,a,t:-.25-i*.08,hit:new Set()})}G.pack={t:0,list:L}},
  // Cento pugni: a storm of punches toward the nearest, then a palm of light that goes through everything
  monaco(){sfx('es','flurry');G.flurry={t:0,dur:1.8,cd:0,palm:false};P.inv=Math.max(P.inv,.4)}});
// the thickest crowd of enemies (the most within r of one of them), or a point in front of the hero
function esCrowd(r){let best=null,bn=-1;for(const e of G.enemies){if(!canHit(e))continue;let n=0;for(const f of G.enemies)if(canHit(f)&&Math.hypot(f.x-e.x,f.y-e.y)<r)n++;
    const d=Math.hypot(e.x-P.x,e.y-P.y);if(n>bn||(n===bn&&d<best.d)){bn=n;best={x:e.x,y:e.y,d}}}
  const tx=best?best.x:P.x+Math.cos(P.face)*100,ty=best?best.y:P.y+Math.sin(P.face)*100;return{x:clamp(tx,L+40,R-40),y:clamp(ty,TOP+50,BOT-30)}}
// ------------------------------------------------------------------ every frame
function esUpdate(dt){if(!G||!P)return;esFxUpdate(dt);axeUpdate(dt);lashUpdate(dt);wolfUpdate(dt);
  if(P.shHit>0)P.shHit-=dt;if(P.slashT!=null){P.slashT+=dt;if(P.slashT>.45)P.slashT=null}
  if(P.style&&P.style.shield==='pal')P.style.shHit=Math.max(0,P.shHit||0);
  const KQ=G.knifeQ;if(KQ&&KQ.length)for(let i=KQ.length-1;i>=0;i--){const q=KQ[i];q.t-=dt;if(q.t<=0){KQ.splice(i,1);if(G.state==='play'&&P.proj==='knife'){arrow(P.x,P.y-6,q.a+rand(-.05,.05),.75);sfx('bow','knife',P.x)}}}
  const SQ=G.slashQ;if(SQ&&SQ.length)for(let i=SQ.length-1;i>=0;i--){const q=SQ[i];q.t-=dt;if(q.t<=0){SQ.splice(i,1);if(G.state==='play')slashHit(q.a)}}
  if(G.slashFx){G.slashFx.t+=dt;if(G.slashFx.t>.24)G.slashFx=null}
  // the fury wears off
  if(P.fury>0){P.fury-=dt;if(!LOWFX&&Math.random()<dt*14)G.fx.push({k:'puff',x:P.x+rand(-8,8),y:P.y-6,vx:rand(-10,10),vy:rand(-40,-20),t:rand(.3,.5),r:rand(3,5)});
    if(P.fury<=0){P.fury=0;if(P.furyAspd)P.aspd=P.furyAspd;if(P.furySpd)P.spd=P.furySpd;P.furyAspd=P.furySpd=null}}
  // the giant hammer of light
  const H=G.skyHam;if(H){H.t+=dt;if(!H.done&&H.t>=H.fall){H.done=true;const x=H.x,y=H.y;shake(9);vib([50,30,90]);sfx('boom',0,x);sfx('es','bell',x);
      vfxBlast(x,y,'255,215,110',120,{sparks:LOWFX?8:24,spcol:['#fff6c8','#ffd86b','#e0b040'],debris:'stone',n:LOWFX?5:12,dust:LOWFX?4:10,cracks:40});fxPush({k:'flash',x,y,rgb:'255,230,150',r:180,t:.32,max:.32});
      for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-x,e.y-y)>110+e.r)continue;hurtE(e,P.atk*3,Math.random()<P.crit);if(e.dead)continue;if(isBoss(e.type))e.slow=Math.max(e.slow||0,3);else e.daze=Math.max(e.daze||0,1.6)}
      const v=Math.round(P.maxhp*.25);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#ffd86b',18);P.inv=Math.max(P.inv,1.6);
      fxPush({k:'ring2',x:P.x,y:P.y-10,rgb:'255,225,140',r0:14,r1:46,t:1.4,max:1.4,w:4})}
    if(H.t>=H.fall+1.3)G.skyHam=null}
  // the blizzard
  const B=G.blizz;if(B){B.t+=dt;B.tick-=dt;if(!LOWFX&&Math.random()<dt*40)esFx({k:'snow',x:rand(G.vx||0,(G.vx||0)+VW),y:(G.vy||0)+rand(-10,40),vx:rand(-30,-10),vy:rand(60,110),max:rand(2,3.4),r:rand(1,2.4)});
    if(B.tick<=0&&G.state==='play'){B.tick=.45;const L=G.enemies.filter(canHit);const e=L[Math.floor(Math.random()*L.length)];
      if(e){hurtE(e,P.atk*.4,false);sfx('es','freeze',e.x);if(!LOWFX)for(let i=0;i<4;i++)esFx({k:'shard',x:e.x,y:e.y-e.r,vx:rand(-60,60),vy:rand(-90,-30),g:300,max:.5,r:2.2,rot:rand(0,TAU)})}}
    if(B.t>=B.dur)G.blizz=null}
  // the cannonballs
  const C=G.cannon;if(C&&C.length)for(let i=C.length-1;i>=0;i--){const c=C[i];c.t+=dt;if(c.done){if(c.t>=c.fall+.5)C.splice(i,1);continue}if(c.t<c.fall)continue;c.done=true;
    const x=c.x,y=c.y;shake(3);sfx('boom',0,x);vfxBlast(x,y,'255,170,90',46,{fire:LOWFX?2:5,sparks:LOWFX?4:10,debris:'stone',n:LOWFX?3:6,dust:LOWFX?3:6,cracks:22});
    for(const e of G.enemies)if(canHit(e)&&Math.hypot(e.x-x,e.y-y)<48+e.r)hurtE(e,P.atk*2,Math.random()<P.crit)}
  // the wolves of light
  const K=G.pack;if(K){K.t+=dt;let alive=0;for(const w of K.list){w.t+=dt;if(w.t<0){alive++;continue}if(w.t>1.1)continue;alive++;w.x+=Math.cos(w.a)*560*dt;w.y+=Math.sin(w.a)*560*dt;
      for(const e of G.enemies)if(canHit(e)&&!w.hit.has(e)&&Math.hypot(e.x-w.x,e.y-w.y)<e.r+16){w.hit.add(e);hurtE(e,P.atk*2,Math.random()<P.crit);if(!e.dead&&!isBoss(e.type)){e.kbx=(e.kbx||0)+Math.cos(w.a)*80;e.kby=(e.kby||0)+Math.sin(w.a)*80}}}
    if(!alive)G.pack=null}
  // the storm of punches
  const F=G.flurry;if(F){F.t+=dt;F.cd-=dt;
    if(F.t<F.dur&&F.cd<=0&&G.state==='play'){F.cd=LOWFX?.1:.07;const tg=nearest(P.x,P.y),a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):P.face;P.face=a;P.alt=!P.alt;arrow(P.x,P.y-6,a+rand(-.22,.22),.55);sfx('bow','wave',P.x)}
    if(F.t>=F.dur&&!F.palm){F.palm=true;const tg=nearest(P.x,P.y),a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):P.face;P.face=a;
      G.arrows.push({wb:0,x:P.x+Math.cos(a)*10,y:P.y-8+Math.sin(a)*10,a,vx:Math.cos(a)*520,vy:Math.sin(a)*520,m:3,pierce:999,ric:0,hit:new Set(),life:1.2,palm:true,rad:30});
      sfx('es','palm',P.x);shake(4);shockRing(P.x,P.y,1.3)}
    if(F.t>=F.dur+.2)G.flurry=null}}
{const _uu=updUlt;updUlt=function(dt){_uu.apply(this,arguments);esUpdate(dt)}}
{const _b=buildRoom;buildRoom=function(){const r=_b.apply(this,arguments);if(G)Object.assign(G,{axes:[],lashes:[],esfx:[],knifeQ:[],slashQ:[],slashFx:null,skyHam:null,blizz:null,cannon:[],pack:null,flurry:null,
  allies:P&&P.hero==='domatore'?[wolfMake()]:null});if(P){P.slashT=null}return r}}
// the fury ends with the run too (the numbers go back)
{const _nr=newRun;newRun=function(){if(P&&P.fury>0){if(P.furyAspd)P.aspd=P.furyAspd;if(P.furySpd)P.spd=P.furySpd;P.fury=0}return _nr.apply(this,arguments)}}
// ------------------------------------------------------------------ the 3D hero: the Corsair's cut, the Monk's other fist (62 reads H3D.ex)
{const _dh=drawHero;drawHero=function(){if(P&&typeof H3D!=='undefined'){H3D.ex={slash:P.slashT!=null?.2+P.slashT/.45*.45:null,alt:!!P.alt}}
  // the Berserker in a fury: a red glow under him
  if(P&&P.fury>0&&!LOWFX)glow('255,80,50',P.x,P.y-10,30,.22+.1*Math.sin(G.t*10));
  try{return _dh.apply(this,arguments)}finally{if(typeof H3D!=='undefined')H3D.ex=null}}}
// ------------------------------------------------------------------ the shots as they fly
{const _da=drawArrow;drawArrow=function(a){if(a.blade)return _da.apply(this,arguments);
  if(a.palm){const k=Math.min(1,(1.2-a.life)/.15);if(!LOWFX)glow('255,230,140',a.x,a.y,40,.5);EROE.onda(a.x,a.y,9*k,a.a,1);EROE.onda(a.x-Math.cos(a.a)*10,a.y-Math.sin(a.a)*10,6.5*k,a.a,.6);return}
  if(a.ham){if(a.tr)drawTrail(a,ES.col.hammer,2);EROE.martello(a.x,a.y,a.sacred?4.6:3.4,G.t*16+(a.ph||0));if(a.sacred&&!LOWFX)glow('255,230,140',a.x,a.y,18,.45);return}
  if(a.orb){if(a.tr)drawTrail(a,ES.col.ice,2);EROE.ghiaccio(a.x,a.y,a.frost?4.8:3.8,G.t*6+(a.ph||0));return}
  if(a.knife){if(a.tr)drawTrail(a,ES.col.knife,1.6);EROE.coltello(a.x,a.y,2.4,a.a);return}
  if(a.wave){const u=1-a.life/.6;EROE.onda(a.x,a.y,3.2+u*2.4,a.a,1-u*.6);return}
  return _da.apply(this,arguments)}}
// ------------------------------------------------------------------ drawing in the air: axes, lashes, the cut, the hammer of light, the
// cannonballs, the wolves of light, the particles
{const _ur=drawUltRain;drawUltRain=function(){_ur.apply(this,arguments);if(!G)return;
  for(const ax of G.axes||[]){ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(ax.x,ax.y+12,5,2,0,0,TAU);ctx.fill();EROE.ascia(ax.x,ax.y,ax.big?3.8:3,ax.rot)}
  for(const s of G.lashes||[])lashDraw(s);
  if(G.slashFx)slashDraw(G.slashFx);
  skyHamDraw();
  for(const c of G.cannon||[])cannonDraw(c);
  packDraw();esFxDraw()}}
function lashDraw(s){const hx=P.x+Math.cos(s.a)*8,hy=P.y-12+Math.sin(s.a)*3,k=Math.min(1,s.t/.1),fade=s.t>.18?1-(s.t-.18)/(s.dur-.18):1,ex=hx+(s.tx-hx)*k,ey=hy+(s.ty-hy)*k;
  const nx=-(ey-hy),ny=ex-hx,l=Math.hypot(nx,ny)||1,w=(1-k*.6)*16*s.side,cx=(hx+ex)/2+nx/l*w,cy=(hy+ey)/2+ny/l*w-8*(1-k);
  ctx.save();ctx.globalAlpha=Math.max(0,fade);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.2;ctx.beginPath();ctx.moveTo(hx,hy);ctx.quadraticCurveTo(cx,cy,ex,ey);ctx.stroke();
  ctx.strokeStyle='#8a5530';ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle='rgba(255,220,170,.45)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(hx,hy-.6);ctx.quadraticCurveTo(cx,cy-.8,ex,ey-.6);ctx.stroke();ctx.restore()}
function slashDraw(f){const k=f.t/.24,r=48+k*10;ctx.save();ctx.globalAlpha=1-k;ctx.lineCap='round';
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=6*(1-k)+1.5;ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*.62,0,f.a-1.1,f.a+1.1);ctx.stroke();
  ctx.strokeStyle='rgba(190,225,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,r-7,(r-7)*.62,0,f.a-.9,f.a+.9);ctx.stroke();ctx.restore()}
function skyHamDraw(){const H=G.skyHam;if(!H)return;const fall=H.t<H.fall,k=Math.min(1,H.t/H.fall),h=fall?(1-k*k)*330:0,a=fall?1:1-Math.max(0,(H.t-H.fall-.9)/.4),x=H.x,y=H.y;
  if(fall){ctx.fillStyle=`rgba(0,0,0,${(.15+.3*k).toFixed(3)})`;ctx.beginPath();ctx.ellipse(x,y,22+28*k,(22+28*k)*.42,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(255,215,110,${(.3+.5*k).toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.ellipse(x,y,110,46,0,0,TAU);ctx.stroke();ctx.setLineDash([])}
  else if(!LOWFX){const u=(H.t-H.fall)/1.3;ctx.save();ctx.globalAlpha=Math.max(0,.6*(1-u));glow('255,220,130',x,y-20,90,.5);ctx.restore()}
  ctx.save();ctx.globalAlpha=Math.max(0,a);EROE.martello(x,y-26-h,13,fall?-1.3+k*.4:-.9);ctx.restore()}
function cannonDraw(c){const x=c.x,y=c.y;if(c.t<0)return;
  if(!c.done){const k=Math.min(1,c.t/c.fall),h=(1-k)*(1-k)*300;ctx.fillStyle=`rgba(0,0,0,${(.12+.3*k).toFixed(3)})`;ctx.beginPath();ctx.ellipse(x,y,6+12*k,(6+12*k)*.45,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(255,120,80,${(.25+.5*k).toFixed(3)})`;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(x,y,48,22,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
    const by=y-h-8;if(!LOWFX){ctx.fillStyle='rgba(120,110,100,.35)';for(let i=1;i<4;i++){ctx.beginPath();ctx.arc(x+i*1.5,by-i*9,3+i,0,TAU);ctx.fill()}}
    ctx.lineWidth=2.4;ctx.strokeStyle=INK;ctx.fillStyle='#2a2a30';ctx.beginPath();ctx.arc(x,by,7,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(x-2.4,by-2.4,2.2,0,TAU);ctx.fill()}}
function packDraw(){const K=G.pack;if(!K||typeof N3==='undefined'||!N3.wolf)return;
  for(const w of K.list){if(w.t<0||w.t>1.1)continue;const al=Math.min(1,w.t*6)*Math.min(1,(1.1-w.t)*5);ctx.save();ctx.globalAlpha=al*.72;if(!LOWFX)glow('140,200,255',w.x,w.y-10,30,.45);
    try{N3.wolf(w.x,w.y,w.a,'walk',(w.t/.5)%1,.62,{pal:{fur:'#8fc8ff',lite:'#e8f6ff',dark:'#4a7ac8',earIn:'#bfe0ff',eye:'#ffffff',eyeRgb:'255,255,255'},noFx:true})}catch(e){}ctx.restore()}}
// ------------------------------------------------------------------ their sounds (from the code, like all the others)
const ES_SND={
  hammer(t){whoosh(t,.18,500,1500,.1);fModal(t+.01,VR(1250,.04),[1,2.4,3.9],[.4,.18,.08],.05,.35)},
  ice(t){whoosh(t,.16,900,2600,.08);fModal(t,VR(2400,.04),[1,1.5,2.7],[.4,.25,.1],.05,.4);M.glass(t+.02,.3,VR(3200,.05))},
  axe(t){whoosh(t,.24,220,900,.14,.15)},
  knife(t){whoosh(t,.1,1800,5200,.1);fModal(t,VR(3800,.05),[1,1.6],[.2,.08],.025,.12)},
  wave(t){fThump(t,VR(170,.1),60,.1,.35);whoosh(t+.01,.14,400,1400,.09)},
  heal(t){[0,4,7,12].forEach((s,i)=>fModal(t+i*.05,880*Math.pow(2,s/12),[1,2,3],[.4,.2,.1],.04,.5))},
  parry(t){fModal(t,VR(1800,.03),[1,2.76,5.4],[.6,.3,.15],.12,.6);fNoise(t,.05,'highpass',3000,.8,.12);fModal(t+.02,VR(900,.03),[1,2.1],[.5,.2],.06,.4)},
  freeze(t){M.glass(t,.5,VR(2600,.06));fNoise(t,.12,'highpass',4000,.8,.06)},
  clank(t){fModal(t,VR(1500,.08),[1,2.3,3.7],[.3,.15,.06],.05,.12)},
  catch(t){fThump(t,VR(260,.1),120,.06,.18)},
  swish(t){whoosh(t,.16,900,3600,.13)},
  clang(t){fModal(t,VR(2200,.04),[1,2.4,3.6],[.45,.2,.1],.08,.3);fThump(t,VR(220,.1),90,.08,.25)},
  crack(t){fNoise(t,.025,'highpass',2500,.7,.32,{att:.001});fNoise(t+.015,.08,'bandpass',1800,1.4,.12)},
  bite(t){fNoise(t,.05,'bandpass',1200,1.2,.18,{att:.002});fThump(t,VR(160,.1),80,.07,.22);fNoise(t+.04,.25,'lowpass',380,1,.1,{brown:true,att:.04})},
  howl(t){const c=AU.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';f.type='bandpass';f.frequency.value=900;f.Q.value=3;
    o.frequency.setValueAtTime(330,t);o.frequency.linearRampToValueAtTime(560,t+.35);o.frequency.linearRampToValueAtTime(520,t+.9);o.frequency.linearRampToValueAtTime(380,t+1.25);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+.2);g.gain.setValueAtTime(.09,t+.9);g.gain.exponentialRampToValueAtTime(.0001,t+1.3);o.connect(f);f.connect(g);route(g,null,.25);o.start(t);o.stop(t+1.35)},
  shock(t){fThump(t,VR(110,.1),45,.25,.4);fNoise(t,.3,'lowpass',900,1,.18,{f2:200})},
  skyham(t){whoosh(t,.55,200,1800,.16,.2);[523.25,659.25,783.99].forEach((f,i)=>fModal(t+.05+i*.05,f,[1,2,3],[.4,.2,.1],.04,.8))},
  bell(t){[261.63,392,523.25,659.25].forEach((f,i)=>fModal(t+i*.04,f,[1,2.01,3.02,4.1],[.9,.4,.2,.1],.07,.6))},
  blizzard(t){fNoise(t,2.4,'bandpass',900,.6,.14,{f2:2600,att:.3});for(let i=0;i<5;i++)M.glass(t+.2+i*.17,.4,VR(2800,.1))},
  fury(t){fNoise(t,.7,'lowpass',420,1.2,.3,{brown:true,att:.05});fThump(t,90,40,.4,.5);for(let i=0;i<3;i++)fThump(t+.15+i*.12,VR(120,.1),50,.12,.3)},
  cannon(t){for(let i=0;i<4;i++){fThump(t+i*.16,VR(70,.1),30,.5,.32);fNoise(t+i*.16,.4,'lowpass',500,1,.14,{brown:true})}},
  flurry(t){for(let i=0;i<8;i++)fThump(t+i*.06,VR(180,.15),70,.06,.16)},
  palm(t){fModal(t,196,[1,2.01,2.97,4.2],[1,.5,.3,.15],.12,.6);whoosh(t,.5,300,1600,.16)},
  lash(t){whoosh(t,.12,600,2400,.09)}};
{const _s=sfx;sfx=function(k,arg,x){const own=(k==='bow'&&ES_SND[arg]&&(arg==='hammer'||arg==='ice'||arg==='axe'||arg==='knife'||arg==='wave'||arg==='lash'))||k==='es';if(!own)return _s.apply(this,arguments);
  if(!AU.ctx||!AU.on.sfx||!ES_SND[arg])return;const now=performance.now(),key=k==='bow'?'bow':'es_'+arg;if(now-(AU.last[key]||0)<(k==='bow'?45:35))return;AU.last[key]=now;
  AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));try{ES_SND[arg](AU.ctx.currentTime+.005)}catch(e){}}}
