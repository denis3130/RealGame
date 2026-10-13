// =====================================================================
// SOUND 2: the crypt's lullaby in the menu (a music box in three, a drone that slowly beats, a choir sighing far away),
// a menu ambience of far bells and whispers, and down in the dungeon the same music box heard from very far
// =====================================================================
function vBox(tr,t,m,dur,vel){const c=AU.ctx,f=mtof(m),g=c.createGain(),w=osc('sine',4.2+Math.random(),t,t+dur+.1),wg=c.createGain();wg.gain.value=f*.004;w.connect(wg);
  for(const[r,a,d] of [[1,1,dur],[2,.3,dur*.5],[3.02,.1,dur*.22],[4.98,.05,.09]]){const o=osc('sine',f*r,t,t+d+.05),og=c.createGain();wg.connect(o.frequency);o.connect(og);og.gain.setValueAtTime(.0001,t);og.gain.linearRampToValueAtTime(vel*a,t+.002);og.gain.exponentialRampToValueAtTime(.0005,t+d);og.connect(g)}
  const n=noiseSrc(t,.014),hp=filt('highpass',6000),ng=c.createGain();ng.gain.setValueAtTime(vel*.35,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.014);n.connect(hp);hp.connect(ng);ng.connect(g);
  route(g,tr,.6,.32)}
TRACKS.menu={bpm:90,
  ch:[[57,60,64],[53,57,60],[50,53,57],[52,56,59],[57,60,64],[53,57,60],[52,56,59],[57,60,64]],
  bass:[45,41,38,40,45,41,40,45],
  mel:[[[0,76,2],[2,81,2],[4,84,2],[6,83,2],[8,81,2],[10,76,2]],[[0,77,2],[2,81,2],[4,84,2],[6,81,2],[8,77,2],[10,76,2]],
       [[0,74,2],[2,77,2],[4,81,2],[6,80,2],[8,81,2],[10,77,2]],[[0,76,2],[2,80,2],[4,83,2],[6,86,2],[8,84,2],[10,83,2]],
       [[0,81,4],[4,84,2],[6,88,4],[10,86,2]],[[0,84,4],[4,81,2],[6,77,4],[10,76,2]],
       [[0,75,2],[2,76,2],[4,80,2],[6,83,2],[8,80,2],[10,76,2]],[[0,81,10]]],
  play(tr,step,t,spb){const s=step%12,bar=Math.floor(step/12)%8,cyc=Math.floor(step/96),C=this.ch[bar],pass=cyc%3;
    if(s===0&&bar%2===0)vPad(tr,t,[C[0]-12,C[2]-12],spb*24,.075,380);
    if(s===0)vBass(tr,t,this.bass[bar],spb*10,.15);
    if(s===4||s===8)for(const m of C)vHarp(tr,t,m,.9,.026);
    if(pass<2){for(const[ss,m,l] of this.mel[bar])if(ss===s)vBox(tr,t,m+(pass===1?-12:0),spb*l*2.2,pass===1?.05:.058)}
    else if(s===0&&bar%2===0)vBox(tr,t,C[2]+12,spb*14,.03);
    if(s===0&&bar%4===2)vChoir(tr,t,[C[0]+12,C[1]+12],spb*20,.045);
    if(s===0&&bar===7&&cyc%2===1)dDrum(tr,t,.16,70,38,.6,300,.25)}};
const SND2={
  chime(t){const b=[91,93,96,98,100];for(let i=0;i<3;i++)vBell(null,t+i*rand(.12,.3),b[randi(0,4)]+rand(-.12,.12),1.6,.007)},
  toll(t){vBell(null,t,VR(45,.01),5,.022);vBell(null,t+.01,57,3.5,.008);fNoise(t,1.2,'lowpass',300,.7,.03,{brown:true,att:.2,rev:.8})},
  hum(t){const c=AU.ctx;for(const[f0,f1] of [[VR(330,.05),VR(300,.05)],[VR(341,.05),VR(296,.05)]]){const o=osc('sine',f0,t,t+3.2),g=c.createGain();o.frequency.linearRampToValueAtTime(f1,t+3);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.007,t+1.2);g.gain.exponentialRampToValueAtTime(.0005,t+3.1);o.connect(g);route(g,null,.8)}},
  creak(t){const c=AU.ctx,o=osc('sawtooth',VR(140,.15),t,t+.7),bp=filt('bandpass',VR(700,.15),9),g=c.createGain();o.frequency.linearRampToValueAtTime(VR(95,.1),t+.6);o.connect(bp);bp.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.03,t+.15);g.gain.exponentialRampToValueAtTime(.0005,t+.65);route(g,null,.5)},
  whisper(t){fNoise(t,.32,'bandpass',VR(2600,.2),4,.016,{att:.12,rev:.7});fNoise(t+.28,.42,'bandpass',VR(1250,.2),5,.014,{att:.16,rev:.7});fNoise(t+.62,.25,'bandpass',VR(3400,.2),4,.01,{att:.08,rev:.7})},
  ghostBox(t){const L=[[76,81,84,83,81],[77,81,84,81,77],[76,80,83,86,84]][randi(0,2)];L.forEach((m,i)=>vBox(null,t+i*.38+rand(0,.03),m+rand(-.15,.15)-12*(Math.random()<.5),1.4,.011))}};
AMBEV.menu=[[3,6,t=>{if(!$('tabPlay').hidden)fNoise(t,.5,'bandpass',600,.8,.025,{brown:true,att:.1})}],[7,14,SND2.chime],[22,40,SND2.toll],[18,34,SND2.hum],[14,26,SND2.creak],[26,48,SND2.whisper]];
for(const k of ['moss','lava','swamp','ice'])AMBEV[k].push([50,95,SND2.ghostBox],[30,60,SND2.whisper]);
// buttons: a soft knock with a tiny note of the lullaby's scale
{const _s=sfx;sfx=function(k,arg,x){if(k==='ui'&&AU.ctx&&AU.on.sfx){const now=performance.now();if(now-(AU.last.ui||0)<40)return;AU.last.ui=now;const t=AU.ctx.currentTime+.005;AU.pan=0;try{M.wood(t,.42,VR(520,.04));vBox(null,t+.004,[81,83,84,88][randi(0,3)],.35,.012)}catch(e){}return}return _s(k,arg,x)}}
// =====================================================================
// ANIMATIONS 2: every character breathes when still and squashes a little on each step, the hero's hood
// sways, dust at the hero's feet; in the menu the companions hop now and then and the sheets slide in row by row
// =====================================================================
{const _dr=drawRig;drawRig=function(x,y,face,walk,moving,S,o){RIGW.w=walk;RIGW.mv=moving;
  if(LOWFX||!S||S.float)return _dr.apply(this,arguments);
  const t=(G&&G.t)||0,fy=y+8*(S.sc||1);let sx=1,sy=1;
  if(moving){const c=Math.max(0,Math.cos(walk*2));sy=1-.04*c;sx=1+.035*c}else{const b=Math.sin(t*2.3+x*.05);sy=1+.02*b;sx=1-.012*b}
  ctx.save();ctx.translate(x,fy);ctx.scale(sx,sy);ctx.translate(-x,-fy);_dr.apply(this,arguments);ctx.restore()}}
{const _u=update;update=function(dt){_u(dt);if(!G||!P||LOWFX||G.state==='dead'||!P.moving)return;const ph=Math.floor((P.walk||0)/Math.PI);
  if(ph!==P._stepPh){P._stepPh=ph;const sd=ph%2?1:-1;for(let i=0;i<2;i++)G.fx.push({k:'puff',x:P.x+sd*4+rand(-2,2),y:P.y+8,vx:rand(-12,12)-Math.cos(P.face)*16,vy:rand(-10,-3)-Math.sin(P.face)*6,t:rand(.2,.3),r:rand(1.5,2.5)})}}}
// the sheets: rows slide in when a sheet opens (not when its timers tick)
{const _os=openSheet;openSheet=function(kind){_os(kind);const s=$('sheet');s.classList.remove('fresh');void s.offsetWidth;s.classList.add('fresh');clearTimeout(s._fr);s._fr=setTimeout(()=>s.classList.remove('fresh'),900)}}
// the explorer level: the bar shines when you come back with a new level
{const _rt=renderTop;renderTop=function(){_rt();const A=SAVE.acct;if(!A)return;if(A.seen==null)A.seen=A.lvl;if(A.lvl>A.seen&&!$('menu').hidden){A.seen=A.lvl;save();const w=$('tbWho');w.classList.remove('lvup');void w.offsetWidth;w.classList.add('lvup');sfx('levelup')}}}
// =====================================================================
// THE WAY OUT: when the door is open the hero walks into the doorway by himself and fades into the dark
// beyond it (no more legs sinking into the floor), and keeps walking while the screen goes black
// =====================================================================
function exitK(){if(!G||!P||!G.door)return 0;return clamp((TOP+6-P.y)/30,0,1)}
{const _u=update;update=function(dt){
  if(G&&P&&G.door&&(G.state==='cleared'||(G.state==='trans'&&G.fadeDir>0))&&P.y<TOP+10&&Math.abs(P.x-AW/2)<DOORW+8){
    if(G.state==='trans'){P.y-=46*dt;P.walk=(P.walk||0)+dt*9;P.moving=true;P.face=-Math.PI/2;for(const pt of G.pets||[]){pt.y-=46*dt}}
    else{P.x+=(AW/2-P.x)*Math.min(1,dt*6);P.y-=70*dt;P.face=-Math.PI/2;P.moving=true;P.walk=(P.walk||0)+dt*10;P.queue=[]}}
  _u(dt)}}
{const _dh=drawHero;drawHero=function(){const k=exitK();if(k<=0)return _dh.apply(this,arguments);ctx.save();ctx.globalAlpha*=1-k*.97;_dh.apply(this,arguments);ctx.restore();
  // the dark of the doorway swallows him from the feet up
  ctx.save();ctx.globalAlpha=k*.9;const g=ctx.createLinearGradient(0,P.y+10,0,P.y-34);g.addColorStop(0,'rgba(8,6,10,.95)');g.addColorStop(1,'rgba(8,6,10,0)');ctx.fillStyle=g;ctx.fillRect(P.x-22,P.y-36,44,48);ctx.restore()}}
{const _dp=drawPet;drawPet=function(pt){const k=exitK();if(k<=0)return _dp.apply(this,arguments);ctx.save();ctx.globalAlpha*=1-k;_dp.apply(this,arguments);ctx.restore()}}
// the menu starts behind the start screen; the trailer, the first time, comes after its «Tocca per iniziare» (src/js/65-caricamento.js)
newRun();applySettings();showMenu();requestAnimationFrame(loop);
