// =====================================================================
// THE THREE NEW HEROES IN BATTLE (Denis, 15 October: «crea altri 3 pg con le loro abilita ecc… sbloccabili nella creazione dell'eroe ed
// sbloccabili nel menu»; he chose the Bardo, the Alchimista and the Ninja). They are in HEROES (39) with their style (the 3D pieces are in
// sprite/eroe3d), their shot (P.proj) and their Super (ULT in 35). What they do is here:
//   Bardo       'note'  notes that bounce on to another enemy (he starts with the Rimbalzo); every shot is the next note of a little
//                       tune on the lute. Super «Ballata»: a song that hurts every enemy, slows them all, stuns the small ones and heals you
//   Alchimista  'flask' flasks that burst where they hit or fall: they hurt and poison all round and leave a puddle of venom that keeps
//                       poisoning whoever walks in it. Super «Grande calderone»: a huge cauldron falls on the thickest crowd and bursts
//   Ninja       'star'  three spinning stars in a fan (the two at the sides weaker); when he dashes he vanishes in a puff of smoke.
//                       Super «Cento ombre»: three shadows of him come out of the smoke and throw stars with him for a few seconds
// Everything respects LOWFX (fewer particles, no glows). The numbers are to be tuned by playing.
// =====================================================================
const NH={tune:[0,3,5,7,10,7,5,3,0,-2,0,3,7,5,3,0],ti:0,base:440,sc:null,
  NOTE:['#ffd84a','#ff8ab8','#7fe0ff'],NOTEG:['255,216,74','255,138,184','127,224,255']};
// ------------------------------------------------------------------ the shots
{const _a=arrow;arrow=function(x,y,a,m){_a.apply(this,arguments);const ar=G.arrows[G.arrows.length-1];if(!ar||!P)return;
  if(P.proj==='note'){ar.note=G.noteN=(G.noteN||0)+1;ar.ph=rand(0,TAU)}
  else if(P.proj==='flask'){ar.flask=true;ar.life=Math.min(ar.life,1.05);ar.l0=ar.life;ar.spin=Math.random()<.5?-1:1}
  else if(P.proj==='star')ar.star=true}}
// the Ninja's fan: two more stars at the sides of every volley
{const _v=volley;volley=function(a){_v.apply(this,arguments);if(P&&P.proj==='star'){arrow(P.x,P.y-6,a+.22,.4);arrow(P.x,P.y-6,a-.22,.4)}}}
// a flask that leaves the field (it hit, it fell, it met a wall or a rock) bursts there
{const _u=update;update=function(dt){const g=G,A0=g&&g.arrows,fl=A0&&A0.length?A0.filter(a=>a.flask&&!a.blade):null;_u.apply(this,arguments);
  if(fl&&fl.length&&G===g&&G.arrows===A0){const live=new Set(A0);for(const a of fl)if(!live.has(a))flaskBurst(a)}}}
function flaskBurst(ar){if(!G||!P)return;const x=ar.x,y=ar.y,R=ar.big?62:44;sfx('nh','pop',x);
  vfxBlast(x,y,'123,240,106',R,{sparks:LOWFX?3:9,spcol:['#e8ffd8','#9cf57e','#5fd04a'],dust:false,ring2:false,spore:LOWFX?2:6,sporeRgb:'140,240,110',w:5});
  if(!LOWFX)for(let i=0;i<6;i++)hfx({k:'glass',x,y:y-6,vx:rand(-90,90),vy:rand(-130,-40),g:420,max:rand(.35,.6),r:rand(1.2,2.2),rot:rand(0,TAU),vr:rand(-14,14)});
  for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-x,e.y-y)>R+e.r)continue;
    if(!ar.hit.has(e))hurtE(e,P.atk*.45*(ar.m||1),false);if(!e.dead){e.poisonS=Math.min(4,(e.poisonS||0)+1);e.poisonT=Math.max(e.poisonT||0,3)}}
  pzAdd(x,y,R*.62,2.4)}
// ------------------------------------------------------------------ the venom puddles (the Alchemist's, never the enemies' acid: they hurt only enemies)
function pzAdd(x,y,r,t,big){const L=G.pz||(G.pz=[]);L.push({x,y,r,t,max:t,tick:.12,seed:rand(0,10),big:!!big});
  const cap=LOWFX?4:7;while(L.length>cap){const i=L.findIndex(z=>!z.big);L.splice(i<0?0:i,1)}}
function pzUpdate(dt){const L=G.pz;if(!L||!L.length)return;
  for(let i=L.length-1;i>=0;i--){const z=L[i];z.t-=dt;if(z.t<=0){L.splice(i,1);continue}z.tick-=dt;if(z.tick>0)continue;z.tick=.5;
    for(const e of G.enemies)if(canHit(e)&&Math.hypot(e.x-z.x,(e.y-z.y)*1.45)<z.r+e.r*.6){e.poisonS=Math.min(4,(e.poisonS||0)+1);e.poisonT=Math.max(e.poisonT||0,2)}}}
function pzDraw(){const L=G.pz;if(!L||!L.length)return;
  const blob=(z,r)=>{ctx.beginPath();for(let i=0;i<=14;i++){const a=i/14*TAU,rr=r*(1+.1*Math.sin(i*2.3+z.seed)+.05*Math.sin(G.t*2+i+z.seed));ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath()};
  for(const z of L){const a=Math.min(1,z.t/.5)*Math.min(1,(z.max-z.t)/.12+.25),r=z.r;ctx.save();ctx.translate(z.x,z.y);ctx.scale(1,.62);
    blob(z,r*1.1);ctx.fillStyle=`rgba(28,90,24,${(.42*a).toFixed(3)})`;ctx.fill();
    blob(z,r*.92);ctx.fillStyle=`rgba(104,222,72,${(.42*a).toFixed(3)})`;ctx.fill();
    ctx.fillStyle=`rgba(214,255,180,${(.38*a).toFixed(3)})`;ctx.beginPath();ctx.ellipse(-r*.28,-r*.24,r*.3,r*.13,-.2,0,TAU);ctx.fill();ctx.restore();
    if(LOWFX)continue;
    for(let i=0;i<3;i++){const ph=(G.t*1.3+i*.37+z.seed)%1,bx=z.x+Math.cos(i*2.1+z.seed)*r*.45,by=z.y+Math.sin(i*2.1+z.seed)*r*.26,br=(.8+ph*1.8)*(z.big?1.5:1);
      ctx.strokeStyle=`rgba(220,255,190,${(.75*a*(1-ph)).toFixed(3)})`;ctx.lineWidth=.9;ctx.beginPath();ctx.arc(bx,by-ph*2,br,0,TAU);ctx.stroke()}}}
// ------------------------------------------------------------------ little particles of their own: glass, smoke, notes
function hfx(f){const L=G.hfx||(G.hfx=[]);f.t=0;if(L.length<(LOWFX?50:150))L.push(f)}
function smokePuff(x,y,rgb,n,s){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(20,70)*(s||1);hfx({k:'smoke',x:x+Math.cos(a)*4,y:y+Math.sin(a)*3,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6-rand(8,26),drag:.93,max:rand(.45,.8),r:rand(7,12)*(s||1),rgb})}}
function hfxUpdate(dt){const L=G.hfx;if(!L||!L.length)return;
  for(let i=L.length-1;i>=0;i--){const f=L[i];f.t+=dt;if(f.t>=f.max){L.splice(i,1);continue}if(f.drag){const k=Math.pow(f.drag,dt*60);f.vx*=k;f.vy*=k}
    if(f.g)f.vy+=f.g*dt;f.x+=(f.vx||0)*dt;f.y+=(f.vy||0)*dt;if(f.vr)f.rot+=f.vr*dt}}
function hfxDraw(){const L=G.hfx;if(!L||!L.length)return;
  for(const f of L){const u=f.t/f.max;
    if(f.k==='smoke'){const r=f.r*(.6+u*.9);ctx.globalAlpha=.55*(1-u)*Math.min(1,u*6);ctx.drawImage(glowSprite(f.rgb),f.x-r,f.y-r,r*2,r*2);ctx.globalAlpha=1}
    else if(f.k==='glass'){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rot);ctx.globalAlpha=1-u;ctx.fillStyle=u<.5?'#e8fbff':'#9fe8b0';ctx.fillRect(-f.r,-f.r*.4,f.r*2,f.r*.8);ctx.restore();ctx.globalAlpha=1}
    else if(f.k==='note'){const k=(f.c||0)%3,a=(1-u)*Math.min(1,u*8),x=f.x+Math.sin(f.t*7+(f.ph||0))*3;ctx.globalAlpha=a;if(!LOWFX)glow(NH.NOTEG[k],x,f.y-2,11,.35);EROE.nota(x,f.y,f.s||2.6,NH.NOTE[k],f.c%4===0?1:0);ctx.globalAlpha=1}}}
// ------------------------------------------------------------------ the shots as they fly
{const _da=drawArrow;drawArrow=function(a){const pr=P&&P.proj;if(a.blade||!(pr==='note'||pr==='flask'||pr==='star'))return _da.apply(this,arguments);
  if(pr==='note'){const k=(a.note||0)%3,w=Math.sin(G.t*16+(a.ph||0))*2.6,nx=-Math.sin(a.a)*w,ny=Math.cos(a.a)*w;if(a.tr)drawTrail(a,NH.NOTEG[k],2);
    if(!LOWFX)glow(NH.NOTEG[k],a.x+nx,a.y+ny-2,13,.42);EROE.nota(a.x+nx,a.y+ny+4,a.big?5:3.6,P.fire?'#ff9a3c':P.ice?'#9fe0ff':NH.NOTE[k],(a.note||0)%4===0?1:0);return}
  if(pr==='flask'){// a lob: high in the middle of its flight, its shadow on the floor where it really is
    const k=1-a.life/(a.l0||1.05),h=Math.sin(Math.min(1,k*1.2)*Math.PI)*12*(a.big?1.5:1);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(a.x,a.y+2,4.5,2,0,0,TAU);ctx.fill();
    if(!LOWFX)glow('123,240,106',a.x,a.y-h,13,.35);EROE.fiala(a.x,a.y-h,a.big?6.2:4.2,G.t*9*(a.spin||1),P.fire?'#ff9a3c':P.ice?'#9fe0ff':'#7bf06a');return}
  if(a.tr)drawTrail(a,'210,220,235',1.8);if(!LOWFX)glow('220,230,255',a.x,a.y,10,.32);EROE.stella(a.x,a.y,a.big?8:5.4,G.t*28,P.fire?'#ffb27a':P.ice?'#bfe9ff':'#c9d2dc')}}
// ------------------------------------------------------------------ the Ninja vanishes when he dashes
{const _d=dash;dash=function(){const c=P&&P.dashCd;_d.apply(this,arguments);if(started&&P&&P.hero==='ninja'&&c<=0&&P.dashT>0){smokePuff(P.x,P.y-8,'130,110,180',LOWFX?4:9);sfx('nh','poof',P.x)}}}
// ------------------------------------------------------------------ the Supers (called by useUlt in 35)
const NH_ULT={
  // Ballata: every enemy hurt and slowed, the small ones stunned a moment (golden notes over their heads), health back
  bardo(){sfx('nh','ballata');const v=Math.round(P.maxhp*.15);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#ffd84a',18);
    G.ballad={t:0,dur:1.5*ultD(),ring:0,note:0};if(ultX())ultLater(2.1,mqVerse);
    for(const e of G.enemies){if(!canHit(e))continue;hurtE(e,P.atk*1.4*ultK(),Math.random()<P.crit);if(e.dead)continue;e.slow=Math.max(e.slow||0,4.5*ultD());if(!isBoss(e.type))e.daze=Math.max(e.daze||0,1.6*ultD())}},
  // Grande calderone: on the thickest crowd (or in front of him), it falls from the sky and bursts
  alchimista(){sfx('nh','cauldron');let best=null,bn=-1;for(const e of G.enemies){if(!canHit(e))continue;let n=0;for(const f of G.enemies)if(canHit(f)&&Math.hypot(f.x-e.x,f.y-e.y)<95)n++;
      const d=Math.hypot(e.x-P.x,e.y-P.y);if(n>bn||(n===bn&&d<best.d)){bn=n;best={x:e.x,y:e.y,d}}}
    const tx=best?best.x:P.x+Math.cos(P.face)*100,ty=best?best.y:P.y+Math.sin(P.face)*100;
    G.cauld={x:clamp(tx,L+40,R-40),y:clamp(ty,TOP+50,BOT-30),t:0,fall:.62,done:false,rot:rand(-.4,.4)};if(ultX())mqCaulds(G.cauld)},
  // Cento ombre: three shadows of him out of the smoke, round him, throwing stars too
  ninja(){sfx('nh','ombre');P.inv=Math.max(P.inv,.6);const L=[0,1,2].map(i=>({a:P.face+Math.PI/2+i/3*TAU,cd:.25+i*.12}));G.shadows={t:0,dur:4.5*ultD(),list:L,x3:ultX()};
    for(const s of L)smokePuff(P.x+Math.cos(s.a)*42,P.y+Math.sin(s.a)*26-8,'120,96,180',LOWFX?3:8)}};
// stunned: the small ones stand still a moment (the bosses are only slowed)
{const _ue=updEnemy;updEnemy=function(e,dt){if(e.daze>0){e.daze-=dt;if(!isBoss(e.type)&&!(e.intro>0)){e.moving=false;return}}return _ue.apply(this,arguments)}}
// ------------------------------------------------------------------ every frame: puddles, particles, the song, the cauldron, the shadows
function nhUpdate(dt){if(!G||!P)return;pzUpdate(dt);hfxUpdate(dt);
  const b=G.ballad;if(b){b.t+=dt;b.ring-=dt;b.note-=dt;
    if(b.ring<=0&&b.t<b.dur-.3){b.ring=.32;fxPush({k:'ring2',x:P.x,y:P.y-8,rgb:'255,216,74',r0:16,r1:230,t:.6,max:.6,w:6})}
    if(b.note<=0){b.note=LOWFX?.12:.05;const a=b.t*7.5,s=rand(70,140);hfx({k:'note',x:P.x+Math.cos(a)*10,y:P.y-14+Math.sin(a)*6,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-30,drag:.97,max:rand(.7,1.1),s:rand(2.4,3.4),c:(G.noteN=(G.noteN||0)+1),ph:rand(0,TAU)})}
    if(b.t>=b.dur)G.ballad=null}
  const c=G.cauld;if(c){c.t+=dt;
    if(!c.done&&c.t>=c.fall){c.done=true;const x=c.x,y=c.y;shake(9);vib([50,30,90]);sfx('boom',0,x);sfx('nh','splash',x);
      vfxBlast(x,y,'123,240,106',125,{sparks:LOWFX?8:22,spcol:['#e8ffd8','#9cf57e','#5fd04a'],debris:'stone',n:LOWFX?5:12,dust:LOWFX?4:10,spore:LOWFX?4:14,sporeRgb:'140,240,110',cracks:40});
      fxPush({k:'flash',x,y,rgb:'160,255,130',r:170,t:.3,max:.3});
      for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-x,e.y-y)>105+e.r)continue;hurtE(e,P.atk*3*ultK(),Math.random()<P.crit);if(!e.dead){e.poisonS=4;e.poisonT=Math.max(e.poisonT||0,5)}}
      pzAdd(x,y,ultD()>1?88:74,5.5*ultD(),true);if(!LOWFX)for(let i=0;i<10;i++)hfx({k:'glass',x,y:y-10,vx:rand(-160,160),vy:rand(-220,-60),g:480,max:rand(.5,.8),r:rand(1.4,2.6),rot:rand(0,TAU),vr:rand(-14,14)})}
    if(c.t>=c.fall+1.4)G.cauld=null}
  const S=G.shadows;if(S){S.t+=dt;const fade=S.t>S.dur-.35;
    for(const s of S.list){s.a+=dt*.9;s.x=P.x+Math.cos(s.a)*42;s.y=P.y+Math.sin(s.a)*26;s.cd-=dt;
      if(!fade&&s.cd<=0&&G.state==='play'){const tg=nearest(s.x,s.y);if(tg){s.cd=.42;const an=Math.atan2(tg.y-s.y,tg.x-s.x);s.face=an;arrow(s.x,s.y-6,an,.55*ultK());sfx('bow','star',s.x)}else s.cd=.2}}
    if(S.t>=S.dur){for(const s of S.list)smokePuff(s.x,s.y-8,'120,96,180',LOWFX?3:7);sfx('nh','poof',P.x);if(S.x3)mqShadowBurst(S.list);G.shadows=null}}}
{const _uu=updUlt;updUlt=function(dt){_uu.apply(this,arguments);nhUpdate(dt)}}
{const _b=buildRoom;buildRoom=function(){const r=_b.apply(this,arguments);if(G)Object.assign(G,{pz:[],hfx:[],cauld:null,shadows:null,ballad:null});return r}}
// ------------------------------------------------------------------ drawing: the puddles on the floor; the particles, the cauldron and the stunned
// ones' notes in the air; the shadows with the hero
{const _hg=drawHazardsGround;drawHazardsGround=function(){_hg.apply(this,arguments);if(G)pzDraw()}}
{const _ur=drawUltRain;drawUltRain=function(){_ur.apply(this,arguments);if(!G)return;cauldDraw();hfxDraw();
  for(const e of G.enemies)if(e.daze>0&&!e.dead&&!isBoss(e.type)){const y=e.y-e.r*2-(e.z||0)-6;for(let i=0;i<3;i++){const a=G.t*5+i*TAU/3;EROE.nota(e.x+Math.cos(a)*e.r*.8,y+Math.sin(a)*3,2,NH.NOTE[i],0)}}}}
function cauldDraw(){const c=G.cauld;if(!c)return;const fall=c.t<c.fall,k=Math.min(1,c.t/c.fall),h=fall?(1-k*k)*320:0,a=fall?1:1-Math.max(0,(c.t-c.fall-1)/.4),x=c.x,y=c.y,s=fall?1:1+.15*Math.exp(-(c.t-c.fall)*8)*Math.sin((c.t-c.fall)*30);
  // the shadow growing where it will fall, with a ring of warning
  if(fall){ctx.fillStyle=`rgba(0,0,0,${(.15+.3*k).toFixed(3)})`;ctx.beginPath();ctx.ellipse(x,y,26+30*k,(26+30*k)*.42,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(150,255,120,${(.3+.5*k).toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.ellipse(x,y,105,44,0,0,TAU);ctx.stroke();ctx.setLineDash([])}
  ctx.save();ctx.globalAlpha=a;ctx.translate(x,y-h);ctx.rotate(fall?c.rot*(1-k):0);ctx.scale(s,1/s);
  // the iron pot: legs, belly, rim, the green brew glowing on top, two rings for handles
  ctx.lineJoin='round';ctx.fillStyle='#1d1d24';for(const sx of[-17,0,17]){ctx.beginPath();ctx.moveTo(sx-4,-6);ctx.lineTo(sx-3,2);ctx.lineTo(sx+3,2);ctx.lineTo(sx+4,-6);ctx.closePath();ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke()}
  ctx.beginPath();ctx.ellipse(0,-26,32,26,0,0,TAU);const g=ctx.createRadialGradient(-10,-36,4,0,-26,34);g.addColorStop(0,'#5a5a66');g.addColorStop(.6,'#2c2c36');g.addColorStop(1,'#16161c');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();
  for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*31,-36,5,0,TAU);ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#4a4a56';ctx.lineWidth=2;ctx.stroke()}
  ctx.beginPath();ctx.ellipse(0,-46,27,8,0,0,TAU);ctx.fillStyle='#3a3a46';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,-46,23,6,0,0,TAU);ctx.fillStyle='#7bf06a';ctx.fill();ctx.fillStyle='rgba(230,255,200,.6)';ctx.beginPath();ctx.ellipse(-7,-47.5,8,2,0,0,TAU);ctx.fill();
  if(!LOWFX){glow('123,240,106',0,-50,40,.45);ctx.strokeStyle='rgba(230,255,200,.8)';ctx.lineWidth=1;for(let i=0;i<3;i++){const ph=(c.t*2+i*.33)%1;ctx.beginPath();ctx.arc(-12+i*12,-48-ph*10,1.5+ph*2,0,TAU);ctx.stroke()}}
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(-14,-32,6,10,-.4,0,TAU);ctx.fill();ctx.restore()}
// the shadows: the hero drawn once on a small layer, dyed violet, laid down at each of them (the ones behind him first)
{const _dh=drawHero;drawHero=function(){const S=G&&G.shadows,dead=!P||G.state==='dead';let img=null;
  if(S&&!dead){try{img=nhShadowImg()}catch(e){img=null}}
  const al=S?Math.min(1,S.t/.25)*Math.min(1,(S.dur-S.t)/.35):0,lay=back=>{if(!img)return;for(const s of S.list)if(s.x!=null&&(s.y<P.y)===back)nhBlit(img,s.x,s.y,.72*al)};
  lay(true);const nin=!dead&&P.hero==='ninja'&&P.dashT>0;if(nin)ctx.globalAlpha=.3;try{_dh.apply(this,arguments)}finally{ctx.globalAlpha=1}lay(false)}}
function nhShadowImg(){const m=ctx.getTransform(),dp=Math.hypot(m.a,m.b)||1,W=Math.ceil(76*dp),H=Math.ceil(100*dp);let c=NH.sc;if(!c)c=NH.sc=document.createElement('canvas');
  if(c.width!==W||c.height!==H){c.width=W;c.height=H}const g=c.getContext('2d'),sv=ctx,pull=P.aiming?(P.fireCd>0?clamp(1-P.fireCd*P.aspd,0,1)*5:5):0;
  g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.setTransform(dp,0,0,dp,W/2-P.x*dp,H*.82-P.y*dp);ctx=g;
  try{drawRig(P.x,P.y,P.face,P.walk,P.moving,P.style||HERO,{pull})}finally{ctx=sv}
  g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(58,34,108,.74)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';return{c,W,H}}
function nhBlit(I,x,y,a){if(a<=0)return;const m=ctx.getTransform(),sx=m.a*x+m.c*y+m.e,sy=m.b*x+m.d*y+m.f;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=a;
  ctx.fillStyle='rgba(20,10,40,.35)';ctx.beginPath();ctx.ellipse(sx,sy+2*Math.hypot(m.a,m.b),11*Math.hypot(m.a,m.b),4*Math.hypot(m.a,m.b),0,0,TAU);ctx.fill();
  ctx.drawImage(I.c,sx-I.W/2,sy-I.H*.82);ctx.restore()}
// ------------------------------------------------------------------ their sounds (from the code, like all the others): the lute plays the tune
// note by note, the flask whistles and breaks, the star rings
const NH_SND={
  note(t){const f=NH.base*Math.pow(2,NH.tune[(NH.ti++)%NH.tune.length]/12);fModal(t,f,[1,2,3.01,4.2],[.55,.32,.2,.1],.085,.18);fModal(t,f/2,[1,2],[.42,.2],.03,.1);fNoise(t,.02,'bandpass',f*4,3,.05,{att:.001})},
  flask(t){whoosh(t,.16,700,1900,.09);M.glass(t+.012,.35,VR(2600,.05))},
  star(t){fModal(t,VR(3300,.04),[1,1.47,2.31],[.16,.1,.06],.045,.2);whoosh(t,.09,2600,6500,.1)},
  pop(t){for(let i=0;i<4;i++)M.glass(t+i*.018,.6-i*.1,VR(2200+i*300,.1));fNoise(t,.22,'lowpass',1400,1,.2,{f2:300});for(let i=0;i<3;i++)fThump(t+.05+i*.06,VR(600,.2),VR(1300,.2),.05,.05)},
  poof(t){fNoise(t,.3,'bandpass',900,.8,.18,{f2:300,att:.02});fNoise(t,.12,'highpass',4000,.8,.05)},
  chord(t){[293.66,349.23,440,587.33,698.46].forEach((f,i)=>{fModal(t+i*.06,f,[1,2,3.01,4.2],[.9,.5,.3,.15],.07,.3)});fNoise(t,.7,'highpass',6000,.7,.025,{att:.15,rev:.5})},
  ballata(t){NH_SND.chord(t);[587.33,698.46,880,1174.66].forEach((f,i)=>fModal(t+.4+i*.09,f,[1,2,3.01],[.8,.4,.2],.05,.4));fModal(t+.85,293.66,[1,1.5,2],[1.4,1,.6],.05,.5)},
  cauldron(t){fNoise(t,.6,'bandpass',2600,7,.06,{f2:420});whoosh(t+.2,.4,300,1500,.12)},
  splash(t){fThump(t,120,45,.35,.55,.2);fNoise(t,.5,'lowpass',1800,1,.33,{f2:200,brown:true});for(let i=0;i<6;i++)fThump(t+.06+i*.05,VR(500,.25),VR(1200,.25),.05,.06);for(let i=0;i<3;i++)M.glass(t+i*.03,.7,VR(2000+i*400,.1))},
  ombre(t){whoosh(t,.3,400,2400,.16,.2);for(let i=0;i<3;i++)NH_SND.poof(t+.06+i*.07)}};
{const _s=sfx;sfx=function(k,arg,x){const own=(k==='bow'&&(arg==='note'||arg==='flask'||arg==='star'))||k==='nh';if(!own)return _s.apply(this,arguments);
  if(!AU.ctx||!AU.on.sfx||!NH_SND[arg])return;const now=performance.now(),key=k==='bow'?'bow':'nh_'+arg;if(now-(AU.last[key]||0)<(k==='bow'?45:40))return;AU.last[key]=now;
  AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));try{NH_SND[arg](AU.ctx.currentTime+.005)}catch(e){}}}
