// =====================================================================
// THE REACH OF THE BLOWS (Denis, 16 October: «una piccola area dove sta ad indicare il limite massimo del colpo? che sia pugno freccia
// proiettile ecc? ogni colpo la sua area di effetto»; of the three ways proposed he chose «Sempre accesa»: also while walking). On the
// floor, under the dangers and the enemies' warnings (they stay on top), in the colour of the blow, never red (red is the enemies'
// danger), only for the blows that stop before the edge of the screen:
//   Monaco      the lane of the punch towards the target and the front of the wave where it stops; when the next is the fourth punch,
//               the ring of the shockwave round him
//   Corsaro     the half-moon of the sabre (within 44 px of an enemy he cuts instead of throwing the knives): it lights up when he will cut
//   Domatore    the cone of the whip, 200 px, on the nearest enemy
//   Berserker   the path of the axe towards the target and the mark where it turns back
// (no full rings: the punches go 346 px and the axes 232, more than half the screen; a ring that big crossed the whole room)
//   Alchimista  the circle of the flask's burst on the target, with the puddle inside
// The others (arrows, bolts, leaves, notes, stars, hammers, orbs, knives) go beyond the screen: nothing. On while there are enemies to
// hit; off in the settings («Gittata»: SAVE.set.gitt === false). With LOWFX simpler (no soft edge, still dashes).
// =====================================================================
const GIT={k:0,ang:null,hot:0,spec:null,tg:null,on:()=>!(SAVE.set&&SAVE.set.gitt===false)};
function gitSpec(){if(!P||!P.proj)return null;const sp=P.pspd||560;
  switch(P.proj){
    case 'wave':return{kind:'punch',r:sp*.6+10,rgb:'255,241,168'};   // the wave lives .6 s (93)
    case 'knife':return{kind:'sabre',r:P.sabR||66,trig:P.sabT||44,rgb:'236,240,248'};  // slashStart under 44 px, slashHit reaches 66 (the captain's sabre 60 and 90)
    case 'lash':return{kind:'whip',r:200,cone:.38,rgb:'255,236,180'}; // lashSpawn: reach 200, ±.38 rad
    case 'axe':return{kind:'axe',r:sp*.414,rgb:'236,240,248'};        // out for .46 s slowing down: 232 px at 560 px/s
    case 'flask':return{kind:'flask',r:44,rgb:'123,240,106'};}         // flaskBurst: 44 px round where it bursts
  return null}
function gitTick(dt){const sp=G&&P&&!INTRO.on&&G.state==='play'&&GIT.on()?gitSpec():null,tg=sp?nearest(P.x,P.y):null;
  GIT.k+=((sp&&tg?1:0)-GIT.k)*Math.min(1,dt*6);if(sp)GIT.spec=sp;
  if(tg){const a=Math.atan2(tg.y-P.y,tg.x-P.x);if(GIT.ang==null)GIT.ang=a;else{const d=Math.atan2(Math.sin(a-GIT.ang),Math.cos(a-GIT.ang));GIT.ang+=d*Math.min(1,dt*12)}GIT.tg=tg}
  else if(GIT.ang==null&&P)GIT.ang=P.face||0;
  // «hot»: the blow lands (the target is inside its shape)
  let hot=0;if(sp&&tg){const d=Math.hypot(tg.x-P.x,tg.y-P.y)-tg.r;hot=sp.kind==='sabre'?(d<sp.trig?1:0):sp.kind==='flask'?1:(d<=sp.r?1:0)}
  GIT.hot+=(hot-GIT.hot)*Math.min(1,dt*8)}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{gitTick(dt)}catch(e){}}}
function gitDraw(){if(!G||!P||INTRO.on||GIT.k<.02||!GIT.spec||G.state==='dead')return;
  const S=GIT.spec,A=GIT.k,H=GIT.hot,x=P.x,y=P.y+2,a=GIT.ang||0,lo=LOWFX,c=S.rgb,t=G.t||0;
  ctx.save();ctx.lineCap='round';
  // a dashed ring with a dark line under it (it must read on the ice and on the lava too), and a soft edge inside
  const ring=(cx,cy,r,al)=>{if(!lo){const g=ctx.createRadialGradient(cx,cy,Math.max(0,r-18),cx,cy,r);g.addColorStop(0,`rgba(${c},0)`);g.addColorStop(1,`rgba(${c},${(.09*al/.3).toFixed(3)})`);
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.arc(cx,cy,Math.max(0,r-18),0,TAU,true);ctx.fill()}
    ctx.setLineDash([7,8]);ctx.lineDashOffset=lo?0:-t*12;
    ctx.strokeStyle=`rgba(20,14,10,${(.24*al/.3).toFixed(3)})`;ctx.lineWidth=3.4;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(${c},${al.toFixed(3)})`;ctx.lineWidth=1.7;ctx.stroke();ctx.setLineDash([])};
  // a slice of the floor: a soft fill from r0 to r1 and its outline
  const slice=(r0,r1,a0,a1,fa,la,dashEdges)=>{ctx.beginPath();ctx.arc(x,y,r1,a0,a1);ctx.arc(x,y,r0,a1,a0,true);ctx.closePath();
    if(lo)ctx.fillStyle=`rgba(${c},${fa.toFixed(3)})`;else{const g=ctx.createRadialGradient(x,y,r0,x,y,r1);g.addColorStop(0,`rgba(${c},${(fa*.25).toFixed(3)})`);g.addColorStop(1,`rgba(${c},${fa.toFixed(3)})`);ctx.fillStyle=g}
    ctx.fill();ctx.strokeStyle=`rgba(20,14,10,${(la*.55).toFixed(3)})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,r1,a0,a1);ctx.stroke();
    ctx.strokeStyle=`rgba(${c},${la.toFixed(3)})`;ctx.lineWidth=2.2;ctx.stroke();
    if(dashEdges){ctx.setLineDash([5,7]);ctx.lineDashOffset=lo?0:-t*10;ctx.lineWidth=1.5;for(const e of[a0,a1]){ctx.beginPath();ctx.moveTo(x+Math.cos(e)*r0,y+Math.sin(e)*r0);ctx.lineTo(x+Math.cos(e)*r1,y+Math.sin(e)*r1);ctx.stroke()}ctx.setLineDash([])}};
  // a lane on the floor towards the target, from r0 to r1 and w wide: soft inside (stronger at the far end), dashed sides
  const lane=(r0,r1,w,fa,la)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);
    if(lo)ctx.fillStyle=`rgba(${c},${(fa*.6).toFixed(3)})`;else{const g=ctx.createLinearGradient(r0,0,r1,0);g.addColorStop(0,`rgba(${c},0)`);g.addColorStop(1,`rgba(${c},${fa.toFixed(3)})`);ctx.fillStyle=g}
    ctx.fillRect(r0,-w/2,r1-r0,w);ctx.setLineDash([5,7]);ctx.lineDashOffset=lo?0:-t*14;ctx.lineWidth=1.4;ctx.strokeStyle=`rgba(${c},${(la*.55).toFixed(3)})`;
    for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(r0+10,sd*w/2);ctx.lineTo(r1-6,sd*w/2);ctx.stroke()}ctx.setLineDash([]);
    // the end: the front of the wave, where it stops
    ctx.beginPath();ctx.moveTo(r1-8,-w/2-4);ctx.quadraticCurveTo(r1+8,0,r1-8,w/2+4);ctx.strokeStyle=`rgba(20,14,10,${(la*.55).toFixed(3)})`;ctx.lineWidth=4.6;ctx.stroke();
    ctx.strokeStyle=`rgba(${c},${la.toFixed(3)})`;ctx.lineWidth=2.6;ctx.stroke();ctx.restore()};
  if(S.kind==='punch'){lane(16,S.r,30,(.07+.07*H)*A,(.45+.3*H)*A);
    // the fourth punch shakes the ground: its ring waits round him
    if(typeof ES!=='undefined'&&ES.punchN%(P.shockEvery||4)===(P.shockEvery||4)-1){ctx.strokeStyle=`rgba(255,215,110,${((.3+.16*Math.sin(t*8))*A).toFixed(3)})`;ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y,74,0,TAU);ctx.stroke()}}
  else if(S.kind==='sabre')slice(12,S.r,a-1.4,a+1.4,(.035+.11*H)*A,(.26+.44*H)*A,false);
  else if(S.kind==='whip')slice(18,S.r,a-S.cone,a+S.cone,(.05+.07*H)*A,(.36+.3*H)*A,true);
  else if(S.kind==='axe'){
    // the path of the throw and the turn: a little half-round arrow at the far end, pointing back at him
    const ex=x+Math.cos(a)*S.r,ey=y+Math.sin(a)*S.r,al=(.42+.3*H)*A;
    for(let d=26;d<S.r-16;d+=14){const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;ctx.fillStyle=`rgba(20,14,10,${(al*.4).toFixed(3)})`;ctx.beginPath();ctx.arc(px,py,3,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(${c},${(al*.85).toFixed(3)})`;ctx.beginPath();ctx.arc(px,py,1.9,0,TAU);ctx.fill()}
    const r0=9.5,b0=a-Math.PI/2,b1=a+Math.PI/2;ctx.strokeStyle=`rgba(20,14,10,${(al*.55).toFixed(3)})`;ctx.lineWidth=4.6;ctx.beginPath();ctx.arc(ex,ey,r0,b0,b1);ctx.stroke();
    ctx.strokeStyle=`rgba(${c},${al.toFixed(3)})`;ctx.lineWidth=2.6;ctx.stroke();
    const hx=ex+Math.cos(b1)*r0,hy=ey+Math.sin(b1)*r0,ha=b1+Math.PI/2;ctx.fillStyle=`rgba(${c},${al.toFixed(3)})`;ctx.beginPath();
    ctx.moveTo(hx+Math.cos(ha)*6.5,hy+Math.sin(ha)*6.5);ctx.lineTo(hx+Math.cos(ha+2.4)*5,hy+Math.sin(ha+2.4)*5);ctx.lineTo(hx+Math.cos(ha-2.4)*5,hy+Math.sin(ha-2.4)*5);ctx.closePath();ctx.fill()}
  else if(S.kind==='flask'&&GIT.tg&&!GIT.tg.dead){const e=GIT.tg,ex=e.x,ey=e.y;
    // the puddle it leaves (as flat as the real one, 92) and the round of the burst
    ctx.save();ctx.translate(ex,ey);ctx.scale(1,.62);ctx.fillStyle=`rgba(${c},${(.1*A).toFixed(3)})`;ctx.beginPath();ctx.arc(0,0,S.r*.62,0,TAU);ctx.fill();ctx.restore();
    ring(ex,ey,S.r,.34*A)}
  ctx.restore()}
{const _hg=drawHazardsGround;drawHazardsGround=function(){try{gitDraw()}catch(e){}return _hg.apply(this,arguments)}}
// the switch in the settings, under «Stanze»
{const _fs=fillSettings;fillSettings=function(){_fs.apply(this,arguments);const sh=$('sheet');if(!sh)return;const row=[...sh.querySelectorAll('.srow')].find(r=>/^Stanze/.test(r.textContent.trim()));
  const on=GIT.on();if(row)row.insertAdjacentHTML('afterend',`<div class="srow"><span>Gittata</span><div class="seg"><button class="${on?'on':''}" data-gitt="1">Accesa</button><button class="${on?'':'on'}" data-gitt="0">Spenta</button></div></div>`);
  const ld=sh.querySelector('.lead');if(ld)ld.insertAdjacentText('beforeend',' La gittata mostra sul pavimento fin dove arrivano i colpi corti: pugni, sciabola, frusta, asce e fiale.')}}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('button[data-gitt]');if(!b||SHEET!=='set')return;SAVE.set.gitt=b.dataset.gitt==='1';save();sfx('ui');fillSettings()});
