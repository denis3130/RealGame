// =====================================================================
// THE PROLOGUE (Denis, 14 October evening: «dobbiamo cambiare intro, dobbiamo farla più alla dark souls»). At the first launch, in the
// place of the action trailer, a slow and dark prologue like the opening of Dark Souls: black and fog, tableaux in 3D (the camera of the
// monsters, painted like them) that come out of the dark and go back into it, the legend told line by line (only text, no voice), choir
// and bells; at the end a fade into the black (no title) and the making of the hero. The story (Denis's choice, without moss and crypt):
// a kingdom of light, a flame deep under the earth that begins to die, the dead that sleep no more, the kings turned into monsters and the
// guardians into jailers, a nameless hero who will go down to light the flame again… or to let it die.
// The trailer of 38 stays aside: playIntro(force, 'trailer').
// Everything depends only on the time t: the same t always gives the same frame (PRO.manual and proFrame(t) for the test shots).
// =====================================================================
const PRO={on:false,go:false,t:0,a0:null,at:0,ft:0,stall:0,p0:0,raf:0,cv:null,txt:null,cur:null,dur:55.6,low:false,ema:0,slow:0,last:0,manual:false,grain:null,vig:null,vigK:'',err:0};
// the tableaux: [from, to, how it is drawn]; each one comes out of the black and goes back into it
const PRO_SC=[[1.8,9.4,proRegno],[9.2,21.8,proFiamma],[21.6,28.4,proMorti],[28.2,34,proRe],[33.8,39.6,proCustodi],[39.4,53,proEroe]];
// the words: [from, to, text] (a \n makes two lines)
const PRO_TX=[[3.2,8.4,"Nell'Età Antica, il regno ardeva di luce."],
  [10.6,15.4,'Il suo cuore, una fiamma antica,\nardeva nelle profondità della terra.'],
  [16,21,'Poi la fiamma cominciò a spegnersi…'],
  [22.8,27.8,'…e i morti non dormirono più.'],
  [29.2,33.4,'I re divennero mostri.'],
  [34.8,39,'I custodi, carcerieri.'],
  [40.4,45.8,'Si dice che un giorno un eroe senza nome\nscenderà nelle profondità,'],
  [46.4,49.9,'per riaccendere la fiamma…'],
  [50.3,54.6,'…o per lasciarla morire.']];
const plerp=(a,b,k)=>a+(b-a)*k;
const proEz=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
const proSeg=(t,a,b)=>proEz((t-a)/(b-a));
// a fixed random number for (i, seed): the same every frame, so nothing flickers by chance
const prH=(i,s)=>{const x=Math.sin(i*127.1+(s||0)*311.7)*43758.5453;return x-Math.floor(x)};

// ------------------------------------------------------------------ the screen
function proDom(sc){if(!$('proCss')){const s=document.createElement('style');s.id='proCss';s.textContent=`
#introScr.pro{background:#000}#introScr.pro #iCap,#introScr.pro #iLogo,#introScr.pro #iFlash,#introScr.pro #iSplash{display:none!important}
#proCv{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0}
#proTxt{position:absolute;left:14px;right:14px;bottom:calc(6.5% + clamp(26px,7vh,64px));z-index:4;text-align:center;pointer-events:none;opacity:0;
  font:italic 500 clamp(17px,4.9vw,23px)/1.4 "EB Garamond",Georgia,"Times New Roman",serif;letter-spacing:.025em;color:#e6dbc4;text-shadow:0 0 10px #000,0 0 3px #000,0 1px 0 #000}
#proTxt span{display:block}
#introScr.pro #iSkip{font:500 11px "Cinzel",Georgia,serif;letter-spacing:.22em;text-transform:uppercase;color:#cdbf9f;background:rgba(0,0,0,.35);border:1px solid rgba(216,180,106,.38);border-radius:2px;padding:7px 12px 6px}
#proSplash{position:absolute;inset:0;z-index:6;display:none;flex-direction:column;align-items:center;justify-content:center;gap:28px;background:#000;cursor:pointer}
#introScr.pro.splash #proSplash{display:flex}
#proSplash i{position:relative;width:16px;height:30px;border-radius:50% 50% 45% 45%/62% 62% 38% 38%;background:radial-gradient(ellipse at 50% 72%,#fff6d8 0 18%,#ffc65a 38%,#e0621e 72%,rgba(150,40,10,0) 76%);
  filter:drop-shadow(0 0 10px rgba(255,170,80,.75));animation:proFl 1.9s ease-in-out infinite;transform-origin:50% 90%}
#proSplash b{font:500 13px "Cinzel",Georgia,serif;letter-spacing:.32em;text-transform:uppercase;color:#cdbf9f;animation:iPulse 2.4s ease-in-out infinite}
@keyframes proFl{0%,100%{transform:scale(1,1) rotate(-2deg)}35%{transform:scale(.92,1.08) rotate(2deg)}70%{transform:scale(1.05,.95) rotate(-1deg)}}
@media (prefers-reduced-motion:reduce){#proSplash i,#proSplash b{animation:none}}`;document.head.appendChild(s)}
  if(!PRO.cv){PRO.cv=document.createElement('canvas');PRO.cv.id='proCv';PRO.cv.setAttribute('aria-hidden','true');
    PRO.txt=document.createElement('div');PRO.txt.id='proTxt';PRO.txt.setAttribute('aria-live','polite');
    PRO.sp=document.createElement('div');PRO.sp.id='proSplash';PRO.sp.innerHTML='<i aria-hidden="true"></i><b>Tocca per iniziare</b>'}
  if(PRO.cv.parentNode!==sc){sc.insertBefore(PRO.cv,sc.firstChild);sc.appendChild(PRO.txt);sc.appendChild(PRO.sp)}
  PRO.txt.textContent='';PRO.txt.style.opacity='0';PRO.cur=null}
// at the first launch (and from the settings) the prologue; the trailer only when asked by name
{const _pi=playIntro;playIntro=function(force,which){if(which==='trailer')return _pi.call(this,force);return proStart(force)}}
function proStart(force){if(INTRO.on)return true;if(!force&&SAVE.introSeen)return false;if(started&&$('menu').hidden)return false;
  INTRO.snap=JSON.stringify(SAVE);INTRO.on=true;INTRO.pro=true;INTRO.shot=-1;INTRO.st={};INTRO.t=0;
  $('menu').hidden=true;$('endScr').hidden=true;$('pauseScr').hidden=true;$('sheetScr').hidden=true;$('wrap').classList.remove('inmenu');$('wrap').classList.add('intro');
  const sc=$('introScr');sc.hidden=false;sc.className='pro';$('iCap').className='';proDom(sc);
  started=true;paused=true;Object.assign(PRO,{on:true,go:false,t:0,a0:null,at:0,ft:0,stall:0,low:!!PRO.low,ema:0,slow:0,err:0,last:performance.now()});
  if(!AU.ctx||AU.ctx.state!=='running'){INTRO.splash=true;sc.classList.add('splash')}else proGo();
  cancelAnimationFrame(PRO.raf);PRO.raf=requestAnimationFrame(proLoop);return true}
// the tap that starts it (the sound needs a touch first): the music and the clock start together
function proGo(){if(!INTRO.on||!INTRO.pro)return;INTRO.splash=false;$('introScr').classList.remove('splash');initAudio();duckMusic(1);
  Object.assign(PRO,{go:true,p0:performance.now()+150,a0:null,at:0,ft:0,stall:0});AU.intT=1;playMusic('prologo');
  // its quiet music (measured: about 6 dB under the menu's) a little louder, so that on a phone it is heard
  if(AU.cur&&AU.cur.name==='prologo'){PRO.a0=AU.cur.next;try{const g=AU.cur.bus.gain,n=AU.ctx.currentTime;g.cancelScheduledValues(n);g.setValueAtTime(0,n);g.setTargetAtTime(PRO_VOL,n+.05,.7)}catch(e){}}}
const PRO_VOL=1.6;
{const _g=iGo;iGo=function(){if(INTRO.pro)return proGo();return _g.apply(this,arguments)}}
// the end (or «Salta»): the black stays, and what comes after it (the making of the hero, which 65 opens from introEnd, or the menu)
// comes out of it; the long sounds of the prologue stop
{const _ie=introEnd;introEnd=function(){const was=INTRO.on&&INTRO.pro,skip=was&&PRO.t<PRO.dur-.3;
  if(was){INTRO.pro=false;PRO.on=false;PRO.go=false;cancelAnimationFrame(PRO.raf);if(PRO.txt){PRO.txt.textContent='';PRO.txt.style.opacity='0'}
    if(AU.cur&&AU.cur.name==='prologo'){const c=AU.ctx,o=AU.cur;try{o.bus.gain.setTargetAtTime(0,c.currentTime,.25)}catch(e){}setTimeout(()=>{for(const n of o.beds||[])try{n.stop()}catch(e){}},1500)}}
  const r=_ie.apply(this,arguments);if(was)proOut(skip?.8:1.8);return r}}
function proOut(s){const w=$('wrap');if(!w)return;let d=$('proOut');
  if(!d){d=document.createElement('div');d.id='proOut';d.setAttribute('aria-hidden','true');d.style.cssText='position:absolute;inset:0;z-index:999;background:#000;pointer-events:none'}
  d.style.transition='none';d.style.opacity='1';w.appendChild(d);void d.offsetWidth;d.style.transition=`opacity ${s}s cubic-bezier(.45,0,.55,1)`;d.style.opacity='0';
  clearTimeout(proOut.t);proOut.t=setTimeout(()=>d.remove(),s*1000+120)}
// while the prologue plays, the game under it does not draw
{const _l=loop;loop=function(now){if(PRO.on){last=now;requestAnimationFrame(loop);return}_l(now)}}
// the clock: the music's own (pictures and sound never drift apart; when the phone sleeps both stop and wait), else the screen's
function proTime(){if(!PRO.go)return 0;const c=AU.ctx;if(PRO.a0!=null&&c){if(c.state==='running')PRO.at=Math.max(0,c.currentTime-PRO.a0);return PRO.at}return PRO.ft}
function proLoop(now){if(!PRO.on)return;const raw=Math.max(0,(now-PRO.last)/1000),dt=Math.min(raw,.1);PRO.last=now;
  if(PRO.go&&!PRO.manual){const c=AU.ctx;
    // a sound that does not start (its clock stands still for three seconds on a page that is seen): the pictures go on by the screen's clock
    if(PRO.a0!=null){if(c&&c.state==='running'||document.hidden)PRO.stall=0;else if((PRO.stall+=dt)>3){PRO.ft=PRO.at;PRO.a0=null}}
    else if(now>=PRO.p0)PRO.ft+=dt;
    // a slow phone (frames longer than 30 ms for a second and a half): the light passes and the grain go
    if(raw<.25&&PRO.t>1){PRO.ema=(PRO.ema||raw)+(raw-(PRO.ema||raw))*.06;PRO.slow=PRO.ema>.03?(PRO.slow||0)+raw:0;if(PRO.slow>1.5)PRO.low=true}}
  if(!PRO.manual){const t=proTime();PRO.t=t;proFrame(t);if(PRO.go&&t>=PRO.dur){introEnd();return}}
  PRO.raf=requestAnimationFrame(proLoop)}
// one frame at the time t: the tableaux, the words, the grain and the dark round the edges
function proFrame(t){const cv=PRO.cv;if(!cv)return;const W=cv.clientWidth,H=cv.clientHeight;if(W<4||H<4)return;const low=LOWFX||PRO.low,dpr=Math.min(window.devicePixelRatio||1,low?1.25:2);
  const PW=Math.round(W*dpr),PH=Math.round(H*dpr);if(cv.width!==PW||cv.height!==PH){cv.width=PW;cv.height=PH}PRO.dpr=dpr;
  const x=cv.getContext('2d'),sv=ctx,gt=G.t;ctx=x;G.t=t;
  try{x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.fillStyle='#000';x.fillRect(0,0,PW,PH);
    if(PRO.go||PRO.manual)for(const[a,b,f] of PRO_SC){if(t<a||t>b)continue;const e=Math.min(proEz((t-a)/1.4),proEz((b-t)/1.4));
      x.setTransform(dpr,0,0,dpr,0,0);x.save();try{f(t-a,b-a,W,H,low,t)}finally{x.restore()}
      x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';if(e<1){x.fillStyle=`rgba(0,0,0,${(1-e).toFixed(3)})`;x.fillRect(0,0,PW,PH)}}
    x.setTransform(dpr,0,0,dpr,0,0);proPost(x,t,W,H,low)}
  catch(e){if(!PRO.err){PRO.err=1;console.error(e)}}
  finally{ctx=sv;G.t=gt}
  proText(t)}
function proText(t){const el=PRO.txt;if(!el)return;let cur=null,a=0;if(PRO.go||PRO.manual)for(const[t0,t1,s] of PRO_TX)if(t>=t0&&t<=t1){cur=s;a=Math.min(proEz((t-t0)/1.2),proEz((t1-t)/1.2));break}
  if(cur!==PRO.cur){PRO.cur=cur;el.innerHTML=cur?cur.split('\n').map(l=>`<span>${l}</span>`).join(''):''}el.style.opacity=cur?a.toFixed(3):'0'}
// the dark round the edges (kept while the size stays the same) and a fine grain that moves
function proPost(x,t,W,H,low){const k=W+'x'+H;if(PRO.vigK!==k){PRO.vigK=k;const c=PRO.vig||(PRO.vig=document.createElement('canvas'));c.width=Math.ceil(W/2);c.height=Math.ceil(H/2);const v=c.getContext('2d'),g=v.createRadialGradient(c.width/2,c.height*.46,Math.min(c.width,c.height)*.22,c.width/2,c.height*.5,Math.hypot(c.width,c.height)*.62);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,'rgba(0,0,0,.42)');g.addColorStop(1,'rgba(0,0,0,.9)');v.fillStyle=g;v.fillRect(0,0,c.width,c.height)}
  x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(PRO.vig,0,0,W,H);
  if(low)return;if(!PRO.grain){const c=PRO.grain=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),d=g.createImageData(128,128);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)}
  const f=Math.floor(t*24),ox=prH(f,1)*128,oy=prH(f,2)*128;x.save();x.globalAlpha=.07;x.globalCompositeOperation='overlay';x.translate(-ox,-oy);const p=x.createPattern(PRO.grain,'repeat');x.fillStyle=p;x.fillRect(0,0,W+128,H+128);x.restore()}

// ------------------------------------------------------------------ the tools of the tableaux (the monsters' camera, painted like them)
// a camera: the monsters' camera turned to `face`, the point (0,0,0) of the scene at the screen point (cx, cy), k pixels per unit; the
// light comes from the upper left of the screen and a little toward us, as on the monsters
function proCam(face,cx,cy,k,aim){const V0=C3.V(face),c=Math.cos(face),s=Math.sin(face),a=aim?V0.P(aim):[0,0];ctx.translate(cx,cy);ctx.scale(k,k);ctx.translate(-a[0],-a[1]);
  return{V0,k,cx,cy,face,L:C3.nrm([-c*.55+s*.35,s*.55+c*.35,.78]),S:p=>{const q=V0.P(p);return[cx+(q[0]-a[0])*k,cy+(q[1]-a[1])*k]}}}
// back to the screen's own units (for the lights, the dark, the fog), keeping the device pixels
const pScreen=()=>{const m=ctx.getTransform(),d=window.devicePixelRatio?Math.min(window.devicePixelRatio,2):1;ctx.setTransform(PRO.dpr||d,0,0,PRO.dpr||d,0,0)};
// the colours drained a little (the world of the prologue is greyer than the game's)
function pDesat(W,H,a){if(a<=0)return;ctx.save();ctx.globalCompositeOperation='saturation';ctx.globalAlpha=a;ctx.fillStyle='#808080';ctx.fillRect(0,0,W,H);ctx.restore()}
// the colour of a face turned to n under the light
const pShade=(K,n,col)=>{const l=C3.dot(n,K.L);return l>=0?C3.lt(col,.3*l):C3.dk(col,-.5*l)};
// a solid made of flat faces ([normal, [3D corners]]): its outline thick, each face we see in its own light, the edges thin
function pFaces(K,F,col,o){o=o||{};const{V0}=K,all=[];for(const f of F)for(const q of f[1])all.push(V0.P(q));const hull=C3.chull(all);if(hull.length<3)return hull;
  ctx.lineJoin='round';C3.poly(hull);ctx.fillStyle=C3.dk(col,.25);ctx.fill();
  for(const[n,q] of F){if(V0.F(n)<=.01)continue;const sh=pShade(K,n,col),pts=q.map(p=>V0.P(p)),b=C3.bbox(pts);C3.poly(pts);
    if(o.flat)ctx.fillStyle=sh;else{const g=ctx.createLinearGradient(b[0],b[1],b[2],b[3]);g.addColorStop(0,C3.lt(sh,.08));g.addColorStop(1,C3.dk(sh,.14));ctx.fillStyle=g}ctx.fill();
    ctx.strokeStyle=C3.dk(col,.6);ctx.lineWidth=o.ew||.6;ctx.stroke();if(o.face)o.face(n,q,pts)}
  C3.poly(hull);ctx.strokeStyle=INK;ctx.lineWidth=o.lw||1.7;ctx.stroke();return hull}
// a box: the middle of its base c, w along x, d along y, height h, turned by o.a round the vertical
function pBox(K,c,w,d,h,col,o){o=o||{};const a=o.a||0,ca=Math.cos(a),sa=Math.sin(a),hw=w/2,hd=d/2,T=(x,y,z)=>[c[0]+x*ca-y*sa,c[1]+x*sa+y*ca,c[2]+z];
  return pFaces(K,[[[0,0,1],[T(-hw,-hd,h),T(hw,-hd,h),T(hw,hd,h),T(-hw,hd,h)]],[[ca,sa,0],[T(hw,-hd,0),T(hw,hd,0),T(hw,hd,h),T(hw,-hd,h)]],[[-ca,-sa,0],[T(-hw,hd,0),T(-hw,-hd,0),T(-hw,-hd,h),T(-hw,hd,h)]],
    [[-sa,ca,0],[T(hw,hd,0),T(-hw,hd,0),T(-hw,hd,h),T(hw,hd,h)]],[[sa,-ca,0],[T(-hw,-hd,0),T(hw,-hd,0),T(hw,-hd,h),T(-hw,-hd,h)]]],col,o)}
// a gable roof over a box (the ridge along x): two slopes and two gables
function pRoof(K,c,w,d,h,col,o){o=o||{};const a=o.a||0,ca=Math.cos(a),sa=Math.sin(a),hw=w/2+.8,hd=d/2+.8,T=(x,y,z)=>[c[0]+x*ca-y*sa,c[1]+x*sa+y*ca,c[2]+z],R=(x,y,z)=>[x*ca-y*sa,x*sa+y*ca,z];
  const n1=C3.nrm(R(0,h,hd)),n2=C3.nrm(R(0,-h,hd));
  return pFaces(K,[[n2,[T(-hw,-hd,0),T(hw,-hd,0),T(hw,0,h),T(-hw,0,h)]],[n1,[T(hw,hd,0),T(-hw,hd,0),T(-hw,0,h),T(hw,0,h)]],[R(1,0,0),[T(hw,-hd,0),T(hw,hd,0),T(hw,0,h)]],[R(-1,0,0),[T(-hw,hd,0),T(-hw,-hd,0),T(-hw,0,h)]]],col,o)}
// a round body from a profile [[z, r], ...] round the vertical axis at c (towers, pillars, bowls), painted soft like the monsters
function pRound(K,c,prof,col,o){o=o||{};const pts=[];for(const[z,r] of prof)for(let i=0;i<(o.m||18);i++){const t=i/(o.m||18)*TAU;pts.push([c[0]+Math.cos(t)*r,c[1]+Math.sin(t)*r*(o.sy||1),c[2]+z])}
  return C3.vol(K.V0,pts,col,{lw:o.lw||1.7,kl:o.kl==null?.2:o.kl,kd:o.kd==null?.4:o.kd,rim:o.rim||.22})}
// a cone (a roof, a spike, a stalactite: h < 0 hangs down)
const pCone=(K,c,r,h,col,o)=>pRound(K,c,[[0,r],[h,.01]],col,o);
// a floating piece of ground: an uneven top at z = 0 (radius R0, squeezed by sy across), its side of earth or rock going down and
// dissolving into the dark; o.top: how the top is painted (a fill), o.edge: the light along its edge
function pSlab(K,R0,dep,col,side,seed,o){o=o||{};const{V0}=K,N=56,top=[],bot=[],sy=o.sy||1;
  for(let i=0;i<N;i++){const a=i/N*TAU,r=R0*(1+.07*Math.sin(a*3+seed)+.045*Math.sin(a*7+seed*2.1)+.025*Math.sin(a*13+seed*.7));top.push([Math.cos(a)*r,Math.sin(a)*r*sy,0]);
    bot.push([Math.cos(a)*r*.72,Math.sin(a)*r*.72*sy,-dep*(.65+.45*prH(i,seed))])}
  const T=top.map(q=>V0.P(q)),Bt=bot.map(q=>V0.P(q)),sp=C3.chull(T.concat(Bt)),b=C3.bbox(sp);
  // the side: from its colour under the edge to the black (jagged rocks hanging under it)
  ctx.lineJoin='round';C3.poly(sp);let g=ctx.createLinearGradient(0,b[1]+(b[3]-b[1])*.25,0,b[3]);g.addColorStop(0,side);g.addColorStop(.6,C3.dk(side,.6));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fill();
  ctx.save();C3.poly(sp);ctx.clip();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.2;for(let i=0;i<N;i+=2){const q=V0.P(top[i]),p=Bt[i];if(V0.D(top[i])<V0.D([0,0,0]))continue;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(plerp(q[0],p[0],.8),plerp(q[1],p[1],.8));ctx.stroke()}ctx.restore();
  // the top
  C3.poly(T);const tb=C3.bbox(T);g=ctx.createRadialGradient((tb[0]+tb[2])/2-(tb[2]-tb[0])*.12,(tb[1]+tb[3])/2-(tb[3]-tb[1])*.18,4,(tb[0]+tb[2])/2,(tb[1]+tb[3])/2,Math.max(tb[2]-tb[0],tb[3]-tb[1])*.62);
  g.addColorStop(0,C3.lt(col,.1));g.addColorStop(.6,col);g.addColorStop(1,C3.dk(col,.35));ctx.fillStyle=o.top||g;ctx.fill();
  if(o.mark){ctx.save();C3.poly(T);ctx.clip();o.mark(T);ctx.restore()}
  ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;C3.poly(T);ctx.stroke();
  if(o.edge){ctx.strokeStyle=o.edge;ctx.lineWidth=1;ctx.globalAlpha=.55;ctx.beginPath();let on=false;for(let i=0;i<=N;i++){const q=top[i%N],n=[Math.cos(i/N*TAU),Math.sin(i/N*TAU),0];if(V0.F(n)>.05){const p=V0.P(q);if(on)ctx.lineTo(p[0],p[1]+1.2);else{ctx.moveTo(p[0],p[1]+1.2);on=true}}else on=false}ctx.stroke();ctx.globalAlpha=1}
  return T}
// the parts of a tableau drawn far to near ({d: depth, f: draw})
const pRun=parts=>{parts.sort((a,b)=>a.d-b.d);for(const p of parts)p.f()};
// a light in screen units: a soft circle added to what is there
function pLight(x,y,r,rgb,a,ry){if(a<=0||r<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,r,Math.min(1,a),ry);ctx.restore()}
// the dark of the scene: everything is multiplied by a colour, darker far from the light (cx, cy, r: where the light is)
function pNight(W,H,lx,ly,r,inC,outC){const m=ctx.getTransform();ctx.save();ctx.setTransform(m.a,0,0,m.d,0,0);ctx.globalCompositeOperation='multiply';const g=ctx.createRadialGradient(lx,ly,r*.08,lx,ly,r);g.addColorStop(0,inC);g.addColorStop(1,outC);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
// fog lying over a level of the scene: soft banks that drift sideways
function pFog(W,y0,y1,t,rgb,a,n,seed){if(a<=0)return;ctx.save();for(let i=0;i<n;i++){const s=.7+prH(i,seed)*.7,v=(prH(i,seed+1)-.5)*.02*W,x=((prH(i,seed+2)*1.4*W+t*v*8)%(W*1.4)+W*1.4)%(W*1.4)-W*.2,y=plerp(y0,y1,prH(i,seed+3));
  ctx.globalAlpha=a*s;ctx.drawImage(glowSprite(rgb),x-W*.35*s,y-W*.06*s,W*.7*s,W*.12*s)}ctx.restore()}
// motes in a light: little points that rise (or fall: v < 0) and twinkle, in a box round (cx, cy)
function pMotes(t,cx,cy,w,h,n,rgb,a,v,seed){ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const ph=prH(i,seed),sp=.5+prH(i,seed+1),u=((ph-t*v*sp*.05)%1+1)%1,x=cx+(prH(i,seed+2)-.5)*w+Math.sin(t*.7+i)*4,y=cy+h/2-u*h,
  al=a*Math.sin(u*Math.PI)*(.5+.5*Math.sin(t*2.3+i*1.7));if(al<=.01)continue;ctx.fillStyle=`rgba(${rgb},${al.toFixed(3)})`;ctx.fillRect(x,y,1.5,1.5)}ctx.restore()}

// ------------------------------------------------------------------ I · «Nell'Età Antica, il regno ardeva di luce.»
// a kingdom on a hill, floating in the dark like a model: the walls, the towers with their flags, the houses round it, every window lit,
// a warm light all round it and golden motes rising; the camera turns slowly round it
const PR_HOUSES=[[-72,-30,.3],[-64,22,-.4],[-40,58,.9],[8,72,.1],[52,52,-.7],[74,6,.4],[60,-44,1.2],[18,-76,.2],[-34,-68,-.5],[-82,-4,1.4]];
const PR_TREES=[[-86,30],[-50,76],[30,80],[80,30],[84,-28],[40,-70],[-12,-84],[-70,-52],[-20,74],[70,62]];
function proRegno(lt,dur,W,H,low){const k=Math.min(W/228,H/400)*(1+.05*proEz(lt/dur)),cx=W/2,cy=H*.6,face=.55+lt*.045,K=proCam(face,cx,cy,k),{V0}=K;
  // the sky behind: deep blue going to black, a few stars
  ctx.save();pScreen();
  {const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b1020');g.addColorStop(.55,'#141a2a');g.addColorStop(1,'#000');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(let i=0;i<40;i++){const x=prH(i,3)*W,y=prH(i,4)*H*.55,a=.25+.35*Math.sin(lt*1.3+i*2.1);ctx.fillStyle=`rgba(220,225,255,${Math.max(0,a).toFixed(3)})`;ctx.fillRect(x,y,1.2,1.2)}
    pLight(cx,cy-60*k,190*k,'255,196,110',.32)}
  ctx.restore();
  pSlab(K,104,30,'#6e6a44','#3b2e22',1.3,{sy:.9,edge:'#e6c98a',mark:T=>{// a road of light earth winding up the hill, and dry grass
      ctx.strokeStyle='rgba(214,190,140,.55)';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<=24;i++){const a=-2.2+i*.19,r=96-i*2.6,q=V0.P([Math.cos(a)*r,Math.sin(a)*r*.9,0]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke();
      ctx.strokeStyle='rgba(40,48,24,.35)';ctx.lineWidth=.8;for(let i=0;i<70;i++){const a=prH(i,7)*TAU,r=30+prH(i,8)*70,q=V0.P([Math.cos(a)*r,Math.sin(a)*r*.9,0]);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+1,q[1]-3);ctx.stroke()}}});
  const parts=[],win=[];
  // the hill under the castle
  parts.push({d:-1e3,f:()=>C3.vol(V0,C3.ellPts([0,0,0],[60,54,26],null,7,26,0),'#7a7650',{lw:2,kl:.22,kd:.42})});
  // the houses and the trees round the hill
  PR_HOUSES.forEach(([x,y,a],i)=>{const c=[x,y,0],col=['#d8c49a','#c9b08a','#e0caa0'][i%3],rc=['#9a4a32','#7a3a2a','#5a6a8a'][i%3];
    parts.push({d:V0.D(c),f:()=>{pBox(K,c,12,9,7,col,{a,lw:1.4,face:(n,q,pts)=>{if(n[2]>.5)return;win.push([[(pts[0][0]+pts[2][0])/2,(pts[0][1]+pts[2][1])/2+.6],1])}});pRoof(K,[x,y,7],12,9,6,rc,{a,lw:1.4})}})});
  PR_TREES.forEach(([x,y],i)=>{const c=[x,y,0],h=9+prH(i,9)*5;parts.push({d:V0.D(c),f:()=>{C3.caps(V0,c,1.2,[x,y,h*.6],1,'#4a3524',{lw:1.2});C3.sball(V0,[x,y,h],4.4+prH(i,10)*1.6,'#3f5a36',{lw:1.4,kl:.25,kd:.45})}})});
  // the castle: walls round a court, four towers, the keep and a tall tower behind it, flags on the roofs
  const Z=24,TW=[[-22,-22],[22,-22],[22,22],[-22,22]];
  for(let i=0;i<4;i++){const a=TW[i],b=TW[(i+1)%4],m=[(a[0]+b[0])/2,(a[1]+b[1])/2,Z],along=a[0]===b[0];parts.push({d:V0.D(m),f:()=>pBox(K,m,along?4:44,along?44:4,12,'#cdbb95',{lw:1.6,face:(n,q,pts)=>{if(n[2]>.5)return;// battlements
      ctx.fillStyle=C3.dk('#cdbb95',.5);for(let j=0;j<6;j++){const u=(j+.5)/6,p=V0.P([plerp(q[3][0],q[2][0],u),plerp(q[3][1],q[2][1],u),q[3][2]]);ctx.fillRect(p[0]-.9,p[1]-2.2,1.8,2.2)}}})})}
  TW.forEach(([x,y],i)=>{const c=[x,y,Z];parts.push({d:V0.D(c)+.5,f:()=>{pRound(K,c,[[0,6.6],[24,6.2]],'#d6c49e');pCone(K,[x,y,Z+24],8.2,12,i%2?'#3f5a8c':'#9a3a2a');pFlag(K,[x,y,Z+36],lt,i)}})});
  parts.push({d:V0.D([0,0,Z])+.2,f:()=>{pBox(K,[0,0,Z],18,18,30,'#ddcca6',{lw:1.7,face:(n,q,pts)=>{if(n[2]>.5)return;for(const u of[.3,.7])for(const v of[.35,.7]){const p=V0.P([plerp(q[0][0],q[1][0],u),plerp(q[0][1],q[1][1],u),plerp(q[0][2],q[3][2],v)]);win.push([p,1.3])}}});
    pRound(K,[0,0,Z+30],[[0,13],[16,.01]],'#8a3426',{m:4});pFlag(K,[0,0,Z+47],lt,7)}});
  parts.push({d:V0.D([-7,-10,Z])-.3,f:()=>{pRound(K,[-7,-10,Z],[[0,5.4],[46,5]],'#e3d4b0');pCone(K,[-7,-10,Z+46],7,14,'#3f5a8c');pFlag(K,[-7,-10,Z+61],lt,9)}});
  pRun(parts);
  // the windows: warm points of light (drawn in the scene's units)
  ctx.save();ctx.globalCompositeOperation='lighter';for(const[p,s] of win){ctx.fillStyle='rgba(255,214,130,.95)';ctx.fillRect(p[0]-.7*s,p[1]-1*s,1.4*s,2*s);glow('255,190,90',p[0],p[1],4.5*s,.5)}ctx.restore();
  // the light of the kingdom: warm in the middle, the edges of the model going into the night
  pScreen();const c0=K.S([0,0,Z+20]);
  pNight(W,H,c0[0],c0[1],Math.max(W,H)*.8,'rgb(255,236,205)','rgb(70,74,110)');
  pLight(c0[0],c0[1],130*k,'255,190,100',.32);pLight(c0[0],c0[1]-30*k,60*k,'255,226,160',.2);
  if(!low)pMotes(lt,c0[0],c0[1]-10*k,170*k,150*k,46,'255,214,140',.9,.8,11);
  pFog(W,H*.72,H*.92,lt,'190,170,150',.06,5,21)}
// a flag on a pole at the top p of a roof, waving
function pFlag(K,p,t,i){const{V0}=K,b=V0.P(p),top=V0.P([p[0],p[1],p[2]+6]);ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(top[0],top[1]);ctx.stroke();
  const col=i%3===0?'#d8b04a':'#b8342a',pts=[];for(let j=0;j<=5;j++){const u=j/5,w=Math.sin(t*3.2+i+u*4)*1.2*u;pts.push(V0.P([p[0]+u*7*Math.cos(.6),p[1]+u*7*Math.sin(.6)+w,p[2]+6-u*.5]))}
  for(let j=5;j>=0;j--){const u=j/5,w=Math.sin(t*3.2+i+u*4)*1.2*u;pts.push(V0.P([p[0]+u*7*Math.cos(.6),p[1]+u*7*Math.sin(.6)+w,p[2]+3.4-u*.8+(j===5?1.2:0)]))}
  C3.poly(pts);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.7;ctx.stroke()}

// ------------------------------------------------------------------ a flame (screen units of the scene): layers that sway and lick upward;
// life 1: tall, white at the heart; going toward 0 it shrinks, reddens and trembles
function pFlame(x,y,h,w,life,t,low){if(life<=.01)return;const L=Math.max(.06,life),H0=h*(.25+.75*L),W0=w*(.45+.55*L);
  const cols=L>.55?['#c8361a','#ff8a2a','#ffd36a','#fff6d8']:L>.25?['#8a1e12','#d84a1e','#ff9a3a','#ffd890']:['#5a120c','#9a2a14','#d8501e','#ff9a50'];
  ctx.save();ctx.globalCompositeOperation='lighter';glow(L>.4?'255,170,70':'255,90,40',x,y-H0*.45,H0*1.5,.55*L+.15);ctx.restore();
  for(let j=0;j<4;j++){const s=1-j*.22,hh=H0*s*(1+.08*Math.sin(t*9+j*1.7)),ww=W0*s,ph=t*(5+j*1.3)+j;ctx.beginPath();
    for(let i=0;i<=14;i++){const u=i/14,wid=ww*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.12)),.8)*(1-u*.25),sw=Math.sin(ph+u*4.2)*ww*.35*u;ctx.lineTo(x-wid+sw,y-u*hh)}
    for(let i=14;i>=0;i--){const u=i/14,wid=ww*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.12)),.8)*(1-u*.25),sw=Math.sin(ph+u*4.2)*ww*.35*u;ctx.lineTo(x+wid+sw,y-u*hh)}
    ctx.closePath();ctx.fillStyle=cols[j];ctx.globalAlpha=j?.92:.85;ctx.fill();if(!j){ctx.strokeStyle='rgba(60,12,6,.6)';ctx.lineWidth=.8;ctx.stroke()}}
  ctx.globalAlpha=1}
// the altar of the flame: three round steps, the bronze brazier, the coals; returns the point where the flame stands
function pAltar(K,parts){const{V0}=K;parts.push({d:-500,f:()=>{pRound(K,[0,0,0],[[0,31],[4,31]],'#5e5854',{m:28});pRound(K,[0,0,4],[[0,24],[4,24]],'#69625d',{m:26});pRound(K,[0,0,8],[[0,17],[4,17]],'#746c66',{m:24});
    // runes cut round the top step
    ctx.strokeStyle='rgba(30,22,18,.6)';ctx.lineWidth=.7;for(let i=0;i<10;i++){const a=i/10*TAU+.2,p=V0.P([Math.cos(a)*14.5,Math.sin(a)*14.5,12]),n=[Math.cos(a),Math.sin(a),0];if(V0.F(n)<-.2)continue;ctx.beginPath();ctx.moveTo(p[0]-1,p[1]-.4);ctx.lineTo(p[0]+1,p[1]+.4);ctx.stroke()}
    pRound(K,[0,0,12],[[0,3.4],[2.6,3.8],[3.6,7],[7.2,11],[8.4,11.6]],'#8a6a3a',{m:22,kl:.3,kd:.45});
    const c=V0.P([0,0,20.4]);ctx.fillStyle='#1a0e08';ctx.beginPath();ctx.ellipse(c[0],c[1],10.6,10.6*.5,0,0,TAU);ctx.fill()}});
  return[0,0,20.4]}
// II · «Il suo cuore, una fiamma antica, ardeva nelle profondità della terra.» «Poi la fiamma cominciò a spegnersi…»
// deep under the earth a round hall of broken pillars, the altar with a great flame; then the flame shrinks and reddens, the runes in the
// floor go out one by one, ash falls where the sparks rose, the cold creeps in
const PR_PIL=[[0,62,1],[.8,58,.62],[1.6,63,1],[2.35,60,.45],[3.1,62,1],[3.9,59,.7],[4.7,63,1],[5.5,60,.55]];
function proFiamma(lt,dur,W,H,low){const life=1-.86*proSeg(lt,6.8,11.6),fl=life*(1+.05*Math.sin(lt*11)+.04*Math.sin(lt*17.3))*(lt>8?1+.12*Math.sin(lt*23)*(1-life):1);
  const k=Math.min(W/205,H/380)*(1.02+.07*proEz(lt/dur)),cx=W/2,cy=H*.6+(1-proEz(lt/2.4))*H*.07,face=.3+lt*.032,K=proCam(face,cx,cy,k,[0,0,8]),{V0}=K;
  pSlab(K,88,28,'#47423e','#1f1a17',4.1,{sy:.92,edge:'#ffb060',mark:T=>{ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.8;
      for(const r of[40,54,68,82]){ctx.beginPath();for(let i=0;i<=44;i++){const a=i/44*TAU,q=V0.P([Math.cos(a)*r,Math.sin(a)*r*.92,0]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke()}
      for(let i=0;i<18;i++){const a=i/18*TAU+.1,p0=V0.P([Math.cos(a)*34,Math.sin(a)*34*.92,0]),p1=V0.P([Math.cos(a)*88,Math.sin(a)*88*.92,0]);ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke()}
      // the runes in a ring round the altar, lit by the flame: they go out one by one
      for(let i=0;i<14;i++){const a=i/14*TAU,r=44,on=proSeg(life,.2+i/14*.7,.3+i/14*.7),q=V0.P([Math.cos(a)*r,Math.sin(a)*r*.92,0]);ctx.save();ctx.translate(q[0],q[1]);ctx.scale(1,.55);
        ctx.strokeStyle=on>.02?`rgba(255,${190-60*(1-life)|0},90,${(.25+.65*on).toFixed(3)})`:'rgba(20,14,10,.5)';ctx.lineWidth=1.1;ctx.beginPath();const v=i%4;
        if(v===0){ctx.moveTo(0,-3);ctx.lineTo(0,3);ctx.moveTo(-2,-1);ctx.lineTo(2,1)}else if(v===1){ctx.moveTo(-2,3);ctx.lineTo(0,-3);ctx.lineTo(2,3)}else if(v===2){ctx.moveTo(-2,-3);ctx.lineTo(2,-1);ctx.lineTo(-2,1);ctx.lineTo(2,3)}else{ctx.arc(0,0,2.4,0,TAU);ctx.moveTo(0,-3.4);ctx.lineTo(0,3.4)}
        ctx.stroke();ctx.restore()}}});
  const parts=[],fp=pAltar(K,parts);
  // the broken pillars round the hall
  PR_PIL.forEach(([a,r,hk],i)=>{const c=[Math.cos(a)*r,Math.sin(a)*r*.92,0],h=64*hk;parts.push({d:V0.D(c),f:()=>{pRound(K,c,[[0,7],[2.5,7],[3.5,5.6],[h,5.2]],'#5f5953',{m:16});
    if(hk<1){// the broken top: jagged stones
      const pts=[];for(let j=0;j<8;j++){const b=j/8*TAU;pts.push(V0.P([c[0]+Math.cos(b)*5.3,c[1]+Math.sin(b)*5.3,h+(j%2?3.2:0)+prH(j,i)*2]))}C3.poly(pts);ctx.fillStyle='#6a645e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
    else pRound(K,[c[0],c[1],h],[[0,6.6],[4,6.6]],'#6a645e',{m:14})}})});
  pRun(parts);
  // the flame
  const f0=K.S(fp);ctx.save();pScreen();
  pNight(W,H,f0[0],f0[1]-10*k,Math.max(W,H)*(.45+.4*life),`rgb(255,${200+40*life|0},${150+50*life|0})`,`rgb(${20+30*life|0},${22+20*life|0},${40+20*life|0})`);
  // its light on the floor, the hanging stones of the vault black against it
  pLight(f0[0],f0[1]+8*k,120*k*(.4+.6*life),'255,150,70',.42*life+.05,46*k*(.4+.6*life));
  pFlame(f0[0],f0[1],50*k*fl,11*k*Math.max(.4,fl),life,lt,low);pDesat(W,H,.12+.3*(1-life));
  if(!low){if(life>.35)pMotes(lt,f0[0],f0[1]-50*k,40*k,110*k,26,'255,190,90',life,2.4,31);else pMotes(lt,f0[0],f0[1]-60*k,160*k,150*k,30,'170,160,150',.5*(1-life),-.6,33)}
  pFog(W,H*.62,H*.86,lt,'120,110,100',.05,4,41);ctx.restore()}

// ------------------------------------------------------------------ the dead, the kings, the guardians and the hero use the game's 3D models;
// their eyes are lit again after the dark of the scene (where they are: from the model's own height and the way it faces)
function pEyes(K,c,th,fw,up,sp,rgb,a,r){const{V0}=K,f=[Math.cos(th),Math.sin(th),0],n=[-Math.sin(th),Math.cos(th),0];if(V0.F(f)<.05)return;const al=a*Math.min(1,V0.F(f)*3);
  for(const sd of[-1,1]){const q=K.S([c[0]+f[0]*fw+n[0]*sd*sp,c[1]+f[1]*fw+n[1]*sd*sp,c[2]+up]);pLight(q[0],q[1],r*K.k,rgb,al);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${rgb},${Math.min(1,al*1.4).toFixed(3)})`;ctx.beginPath();ctx.arc(q[0],q[1],r*.22*K.k,0,TAU);ctx.fill();ctx.restore()}}
// the way a model on the scene faces, for its own camera (th: where it looks in the scene)
const pFace=(K,th)=>K.face+th;
// III · «…e i morti non dormirono più.»
// a graveyard on a floating piece of earth under a cold moon: crooked stones and crosses, a dead tree, fog on the ground; the small
// skeletons climb out of the earth one after the other, their eyes lit
const PR_GRAVES=[[-44,-30,.2,0],[-16,-40,-.15,1],[14,-34,.1,0],[44,-22,-.3,0],[-54,8,.25,1],[56,22,.3,0],[-36,42,.15,0],[10,50,-.2,1],[48,52,.1,0]];
const PR_RISE=[[-24,-10,.7,.4],[22,-8,1.4,-.3],[-4,22,2.1,.1],[38,8,2.8,-.6],[-44,-18,3.4,.7],[-20,30,4.0,.3]];
function proMorti(lt,dur,W,H,low){const k=Math.min(W/196,H/360)*(1.02+.07*proEz(lt/dur)),cx=W/2,cy=H*.58,face=1.1+lt*.03,K=proCam(face,cx,cy,k,[0,0,6]),{V0}=K;
  // the sky: a great pale moon behind
  ctx.save();pScreen();{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c1222');g.addColorStop(.6,'#0a0d16');g.addColorStop(1,'#000');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const mx=W*.72,my=H*.19,mr=Math.min(W,H)*.1;pLight(mx,my,mr*4,'170,190,255',.3);ctx.fillStyle='#dfe6f4';ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fill();ctx.fillStyle='rgba(150,165,195,.35)';for(const[a,b,r] of[[-.3,-.2,.22],[.25,.15,.16],[.05,.4,.12]]){ctx.beginPath();ctx.arc(mx+a*mr,my+b*mr,r*mr,0,TAU);ctx.fill()}
    // thin clouds passing over it
    for(let i=0;i<3;i++){const y=my+(i-1)*mr*.7,x=((lt*6+i*W*.4)%(W*1.4))-W*.2;ctx.globalAlpha=.25;ctx.drawImage(glowSprite('20,26,44'),x-mr*2,y-mr*.25,mr*4,mr*.5);ctx.globalAlpha=1}}ctx.restore();
  pSlab(K,90,26,'#3a3c33','#1b1916',7.3,{sy:.9,edge:'#a8b8d8',mark:T=>{ctx.fillStyle='rgba(30,26,20,.38)';for(let i=0;i<14;i++){const a=prH(i,12)*TAU,r=prH(i,13)*80,q=V0.P([Math.cos(a)*r,Math.sin(a)*r*.9,0]);ctx.beginPath();ctx.ellipse(q[0],q[1],6+prH(i,14)*8,3,0,0,TAU);ctx.fill()}
      ctx.strokeStyle='rgba(60,70,50,.4)';ctx.lineWidth=.8;for(let i=0;i<60;i++){const a=prH(i,15)*TAU,r=prH(i,16)*86,q=V0.P([Math.cos(a)*r,Math.sin(a)*r*.9,0]);ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+(prH(i,17)-.5)*2,q[1]-2.6);ctx.stroke()}}});
  const parts=[],eyes=[];
  // the stones and the crosses, leaning
  PR_GRAVES.forEach(([x,y,a,cross],i)=>{const c=[x,y,0];parts.push({d:V0.D(c),f:()=>{if(cross){pBox(K,c,2.6,2.6,22,'#66625a',{a,lw:1.3});pBox(K,[x,y,13.5],12,2.6,2.6,'#66625a',{a,lw:1.3})}
    else{const tl=(prH(i,18)-.5)*.3,pts=[];for(let j=0;j<=10;j++){const u=j/10*Math.PI;for(const dy of[-2,2])pts.push([x+Math.cos(a)*Math.cos(u)*7+Math.sin(a)*dy,y+Math.sin(a)*Math.cos(u)*7-Math.cos(a)*dy,14+Math.sin(u)*7+tl*Math.cos(u)*8])}
      for(const dy of[-2,2])for(const sx of[-1,1])pts.push([x+Math.cos(a)*sx*7+Math.sin(a)*dy,y+Math.sin(a)*sx*7-Math.cos(a)*dy,0]);
      C3.vol(V0,pts,'#726e65',{lw:1.4,kl:.18,kd:.45,rim:.15});const m=V0.P([x,y,12]);ctx.strokeStyle='rgba(30,28,24,.55)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(m[0],m[1]-4);ctx.lineTo(m[0],m[1]+2);ctx.moveTo(m[0]-2,m[1]-2);ctx.lineTo(m[0]+2,m[1]-2);ctx.stroke()}}})});
  // the dead tree
  parts.push({d:V0.D([-60,-46,0]),f:()=>{const B=[-60,-46,0];C3.chain(V0,[B,[-61,-45,16],[-58,-46,30],[-56,-44,42]],[3.2,2.6,2,1.2],'#3b3430',{lw:1.6});
    for(const[a,z,l] of[[.9,24,14],[-2.2,30,12],[.2,38,10],[2.6,20,9]]){const s=[-60+Math.cos(a)*1,-46+Math.sin(a),z],e=[s[0]+Math.cos(a)*l,s[1]+Math.sin(a)*l,z+l*.5];C3.chain(V0,[s,[(s[0]+e[0])/2,(s[1]+e[1])/2,(s[2]+e[2])/2+2],e],[1.4,1,.5],'#3b3430',{lw:1.2})}}});
  // the dead climbing out of the earth (their own camera: the scene's turned the way they look)
  const ST_D={glowEyes:true,eyes:'#ff7a4a',eyeCol:'#ff7a4a'};
  PR_RISE.forEach(([x,y,t0,th])=>{const c=[x,y,0],u=lt-t0;if(u<0)return;const rp=Math.min(1,u/1.4),fc=Math.PI/2+th;
    parts.push({d:V0.D(c),f:()=>{const q=V0.P(c);if(rp<1)N3.bonelet(q[0],q[1],fc,'rise',rp,1,{style:ST_D});else N3.bonelet(q[0],q[1],fc,'idle',((u-1.4)/2.4)%1,1,{style:ST_D})}});
    eyes.push([c,fc-K.face,26*.72-(rp<1?(1-C3.ez(Math.min(1,rp/.72)))*28*.72:0),proEz(u/1.1)])});
  pRun(parts);
  ctx.save();pScreen();
  pNight(W,H,W*.68,H*.22,Math.max(W,H)*1.05,'rgb(178,190,222)','rgb(22,26,44)');pDesat(W,H,.3);
  for(const[c,th,up,a] of eyes)pEyes(K,c,th,6,up,2.4,'255,110,70',.8*a,5);
  pFog(W,H*.48,H*.84,lt,'150,165,200',.12,7,51);ctx.restore()}

// IV · «I re divennero mostri.»
// a throne hall: a dark carpet up to the dais, two high thrones, torn banners on the wall; the Toad King and the Ice Queen in front of
// them, still, looking away… then they turn their heads to us, their eyes lit
function proRe(lt,dur,W,H,low){const k=Math.min(W/150,H/290)*(1+.08*proEz(lt/dur)),cx=W/2,cy=H*.5,face=Math.PI/2-.2+lt*.02,K=proCam(face,cx,cy,k,[-26,0,22]),{V0}=K;
  pSlab(K,84,24,'#362e32','#160f16',2.2,{sy:.84,edge:'#ff8a60',mark:T=>{const a=V0.P([60,-12,0]),b=V0.P([60,12,0]),c=V0.P([-14,12,0]),d=V0.P([-14,-12,0]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.closePath();
      ctx.fillStyle='#4a161a';ctx.fill();ctx.strokeStyle='#8a6a32';ctx.lineWidth=1;ctx.stroke()}});
  const parts=[],look=proSeg(lt,2.1,2.9),turn=th=>Math.PI/2+th*(1-look);
  parts.push({d:-300,f:()=>{pBox(K,[-30,0,0],34,96,4,'#463e42',{lw:1.6});pBox(K,[-32,0,4],28,80,4,'#50464b',{lw:1.6});
    // the wall behind the thrones
    pBox(K,[-52,0,0],6,100,82,'#2c262a',{lw:1.8})}});
  // the banners on the wall
  for(const y of[-40,-14,14,40])parts.push({d:V0.D([-46,y,0])-1,f:()=>{const pts=[[-48.6,y-6,76],[-48.6,y+6,76]];for(let j=0;j<=6;j++){const u=j/6;pts.push([-48.6,y+6-u*12,30-(j%2?5:0)-Math.sin(y+j)*2])}const s=pts.map(p=>V0.P(p));C3.poly(s);
    ctx.fillStyle=y%28===0?'#3e1a22':'#4a1a20';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();const m=V0.P([-48.6,y,60]);ctx.strokeStyle='rgba(200,160,70,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(m[0]-3,m[1]+2);ctx.lineTo(m[0]-3,m[1]-2);ctx.lineTo(m[0]-1.5,m[1]);ctx.lineTo(m[0],m[1]-3);ctx.lineTo(m[0]+1.5,m[1]);ctx.lineTo(m[0]+3,m[1]-2);ctx.lineTo(m[0]+3,m[1]+2);ctx.closePath();ctx.stroke()}});
  // the thrones and the kings
  for(const[y,who,th] of[[-20,'toad',.95],[20,'icequeen',-.95]]){
    parts.push({d:V0.D([-40,y,0]),f:()=>{pBox(K,[-40,y,8],10,16,9,'#3a2a22',{lw:1.4});pBox(K,[-45,y,8],4,18,40,'#3a2a22',{lw:1.5});for(const dy of[-7,0,7])pCone(K,[-45,y+dy,48],2,dy?5:8,'#a8843a',{m:8,lw:1.1})}});
    parts.push({d:V0.D([-28,y,0]),f:()=>{const q=V0.P([-26,y,8]);if(who==='toad')N3.toad(q[0],q[1],turn(th),'idle',(lt/2.4)%1,.62);else N3.icequeen(q[0],q[1]-4,turn(th),'idle',(lt/2.4)%1,.5)}})}
  // two braziers with a low red fire
  for(const y of[-44,44])parts.push({d:V0.D([-2,y,0]),f:()=>{pRound(K,[-2,y,0],[[0,3],[16,1.6],[18,5],[21,6]],'#4a3a2c',{m:12})}});
  pRun(parts);
  ctx.save();pScreen();const tq=K.S([-30,0,30]);
  pNight(W,H,tq[0],tq[1],Math.max(W,H)*.7,'rgb(168,118,112)','rgb(20,12,20)');pDesat(W,H,.42);
  for(const y of[-44,44]){const q=K.S([-2,y,21]);pFlame(q[0],q[1],13*k,3.6*k,.38,lt+y,low);pLight(q[0],q[1]+6*k,44*k,'255,90,50',.32,20*k)}
  // their eyes: the toad's two yellow lamps, the queen's cold blue
  const ek=.25+.75*look;pEyes(K,[-26,-20,8],turn(.95)-K.face,9,25,5,'255,220,90',.85*ek,5);pEyes(K,[-26,20,4],turn(-.95)-K.face,6,26,2.6,'120,210,255',.85*ek,4);
  pFog(W,H*.62,H*.86,lt,'140,110,120',.07,4,61);ctx.restore()}

// V · «I custodi, carcerieri.»
// a great gate in the rock, its portcullis down and chained, a padlock; the Yeti of the peaks and the lava Salamander keep it, one cold
// and one burning; beyond the bars, far away, a red glow
function proCustodi(lt,dur,W,H,low){const k=Math.min(W/168,H/320)*(1.02+.07*proEz(lt/dur)),cx=W/2,cy=H*.53,face=Math.PI/2+.1-lt*.025,K=proCam(face,cx,cy,k,[-12,0,24]),{V0}=K;
  pSlab(K,86,26,'#383640','#18161c',5.7,{sy:.86,edge:'#c0c8e0',mark:T=>{ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.9;for(let i=0;i<22;i++){const a=prH(i,22)*TAU,r=20+prH(i,23)*64,q=V0.P([Math.cos(a)*r,Math.sin(a)*r*.86,0]);ctx.beginPath();ctx.moveTo(q[0]-4,q[1]);ctx.lineTo(q[0]+(prH(i,24)-.5)*6,q[1]+2);ctx.stroke()}}});
  const parts=[];
  // the gate: two pillars, the lintel, the bars, the chains and the padlock
  parts.push({d:V0.D([-34,0,0]),f:()=>{const g=K.S([-44,0,30]);ctx.save();pScreen();pLight(g[0],g[1],64*k,'255,70,30',.34,44*k);ctx.restore();
    pBox(K,[-34,-30,0],16,16,74,'#4c4852',{lw:1.8});pBox(K,[-34,30,0],16,16,74,'#4c4852',{lw:1.8});
    for(let y=-20;y<=20;y+=5)C3.caps(V0,[-34,y,0],1.1,[-34,y,66],1.1,'#34343e',{lw:1.1,noRim:true});
    for(const z of[18,40,60])C3.caps(V0,[-34,-22,z],1,[-34,22,z],1,'#34343e',{lw:1.1,noRim:true});
    pBox(K,[-34,0,74],18,78,12,'#57525e',{lw:1.8});
    for(const[z0,z1] of[[50,22],[22,50]]){ctx.strokeStyle='#8a8a94';ctx.lineWidth=1.3;for(let j=0;j<=16;j++){const u=j/16,y=-24+u*48,z=plerp(z0,z1,u)-Math.sin(u*Math.PI)*8,q=V0.P([-30,y,z]);ctx.beginPath();ctx.ellipse(q[0],q[1],1.4,.9,j%2?0:1.2,0,TAU);ctx.stroke()}}
    const lq=V0.P([-29,0,30]);ink(1.2);ctx.fillStyle='#a8843a';ctx.fillRect(lq[0]-3,lq[1]-2,6,6);ctx.strokeRect(lq[0]-3,lq[1]-2,6,6);ctx.beginPath();ctx.arc(lq[0],lq[1]-2,2.2,Math.PI,0);ctx.stroke()}});
  // the guardians: the Yeti roars once
  const ys=lt>2.6&&lt<4.0?'roar':'idle',yp=ys==='roar'?(lt-2.6)/1.4:(lt/2.8)%1;
  parts.push({d:V0.D([6,-40,0]),f:()=>{const q=V0.P([6,-40,0]);N3.yeti(q[0],q[1],Math.PI/2+.5,ys,yp,.56)}});
  parts.push({d:V0.D([12,30,0]),f:()=>{const q=V0.P([12,30,0]);N3.salamander(q[0],q[1],Math.PI/2-.9,'idle',(lt/2.6)%1,.56)}});
  pRun(parts);
  ctx.save();pScreen();
  const sq=K.S([12,30,8]),yq=K.S([6,-40,30]);pNight(W,H,W/2,H*.48,Math.max(W,H)*.7,'rgb(150,150,176)','rgb(14,12,22)');pDesat(W,H,.38);
  pLight(sq[0],sq[1],76*k,'255,110,40',.4,42*k);pLight(yq[0],yq[1],56*k,'150,200,255',.14);
  pEyes(K,[6,-40,0],.5-0,8,34,3,'140,210,255',.8,4);
  if(!low)pMotes(lt,sq[0],sq[1]-20*k,60*k,60*k,14,'255,150,60',.8,1.6,71);
  pFog(W,H*.6,H*.86,lt,'130,130,160',.08,5,81);ctx.restore()}

// VI · «Si dice che un giorno un eroe senza nome scenderà nelle profondità,» «per riaccendere la fiamma…» «…o per lasciarla morire.»
// a hooded figure, his face never seen, goes down a long stair along a wall of rock over the dark; at the bottom the altar of the second
// tableau with only an ember left in the brazier: he stops in front of it, the ember stirs… and goes out. Black
const PR_HERO={body:'#2e313a',hood:'#3d414c',belt:'#5a4a3a'};
function proEroe(lt,dur,W,H,low){const st={...heroStyle0('arciere'),...PR_HERO};
  if(lt<7.5){// the stair seen from the side, going down to the right of the screen; the rock wall behind it, the dark under it
    const s0=Math.min(16,lt/7.3*15.5),hp=[s0*7,0,5-s0*5],k=Math.min(W/170,H/320),face=.28,K=proCam(face,W/2,H*.5,k,[hp[0],hp[1],hp[2]+16]),{V0}=K;
    ctx.save();pScreen();const dq=K.S([26*7,0,-26*5-10]);pLight(dq[0],dq[1],150*k,'255,70,30',.26,90*k);ctx.restore();
    // the wall: one slanted face of rock along the stair, fading out at both ends, with its cracks
    const parts=[{d:-1e4,f:()=>{const x0=(s0-12)*7,x1=(s0+12)*7,zt=x=>-x*5/7+48,zb=x=>-x*5/7-64,Q=[[x0,-10,zt(x0)],[x1,-10,zt(x1)],[x1,-10,zb(x1)],[x0,-10,zb(x0)]].map(p=>V0.P(p));
      C3.poly(Q);const g=ctx.createLinearGradient(Q[0][0],Q[0][1],Q[1][0],Q[1][1]);g.addColorStop(0,'rgba(36,32,29,0)');g.addColorStop(.3,'#2a2622');g.addColorStop(.7,'#2a2622');g.addColorStop(1,'rgba(36,32,29,0)');ctx.fillStyle=g;ctx.fill();
      ctx.save();C3.poly(Q);ctx.clip();ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=1;for(let i=Math.floor(s0)-14;i<s0+14;i++){const x=i*7+prH(i,3)*5,z=-x*5/7+prH(i,4)*90-50,a=V0.P([x,-10,z]),b=V0.P([x+4+prH(i,5)*8,-10,z-8-prH(i,6)*14]);
        ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo((a[0]+b[0])/2+2,(a[1]+b[1])/2);ctx.lineTo(b[0],b[1]);ctx.stroke()}
      ctx.strokeStyle='rgba(150,140,130,.12)';ctx.lineWidth=.8;for(let i=Math.floor(s0)-14;i<s0+14;i++){const x=i*7+prH(i,7)*6,z=-x*5/7+prH(i,8)*80-40,a=V0.P([x,-10,z]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[0]+3,a[1]-1);ctx.stroke()}ctx.restore()}}];
    for(let i=-4;i<28;i++){const c=[i*7,0,-i*5],far=Math.abs(i-s0);if(far>11)continue;const al=Math.max(0,Math.min(1,(11-far)/4));
      parts.push({d:V0.D(c)-.01,f:()=>{ctx.save();ctx.globalAlpha=al;pBox(K,[c[0],1,c[2]-10],7.6,18,15,'#46413b',{lw:1.4});ctx.restore()}})}
    parts.push({d:V0.D(hp)+.02,f:()=>{const q=V0.P(hp);EROE.arciere(q[0],q[1],face+.05,'walk',(lt/.95)%1,.72,{style:st,moss:false})}});
    pRun(parts);
    ctx.save();pScreen();const hq=K.S([hp[0],hp[1],hp[2]+20]);
    pNight(W,H,hq[0],hq[1]-10*k,Math.max(W,H)*.62,'rgb(150,144,158)','rgb(8,8,14)');pDesat(W,H,.35);pLight(hq[0],hq[1]-12*k,46*k,'190,182,176',.1);
    pFog(W,H*.62,H*.98,lt,'110,100,110',.09,6,91);if(lt>6.5){ctx.fillStyle=`rgba(0,0,0,${proEz((lt-6.5)/1).toFixed(3)})`;ctx.fillRect(0,0,W,H)}ctx.restore();return}
  // the bottom: the altar, the ember, the hero in front of it, seen from behind
  const v=lt-7.5,k=Math.min(W/118,H/236)*(1+.07*proEz(v/6)),face=-.15+v*.02,K=proCam(face,W/2,H*.52,k,[0,20,15]),{V0}=K;
  const life=.1+.22*proSeg(v,.8,2.4)-.32*proSeg(v,3.4,5)+(v>3.4&&v<5?.05*Math.sin(v*31):0);
  pSlab(K,80,26,'#38342f','#15110e',4.1,{sy:.92,edge:'#ff9050'});const parts=[],fp=pAltar(K,parts);
  parts.push({d:V0.D([0,32,0]),f:()=>{const q=V0.P([0,32,0]);EROE.arciere(q[0],q[1],face-Math.PI/2,'idle',(v/2.6)%1,.7,{style:st,moss:false})}});
  pRun(parts);
  ctx.save();pScreen();const f0=K.S(fp),out=proSeg(v,4.4,5.4),L=Math.max(0,life);
  pNight(W,H,f0[0],f0[1],Math.max(W,H)*(.3+.6*L),'rgb(255,200,160)','rgb(8,6,10)');pDesat(W,H,.25);
  pLight(f0[0],f0[1]+6*k,90*k*(.3+L),'255,120,60',(.6*L+.06)*(1-out),36*k*(.3+L));pFlame(f0[0],f0[1],26*k*(.4+L*2),6*k,Math.max(.04,L*2.2),lt,low);
  if(!low&&v>3.6)pMotes(v,f0[0],f0[1]-20*k,30*k,40*k,8,'200,190,180',.5*(1-out),.8,95);
  ctx.fillStyle=`rgba(0,0,0,${Math.max(out,1-proEz(v/1.1)).toFixed(3)})`;ctx.fillRect(0,0,W,H);ctx.restore()}

// ------------------------------------------------------------------ the music of the prologue (D minor, as the making of the hero that comes
// after it): the cues are on the seconds of the pictures (one step is a quarter of a second)
// a long noise through the music (wind, fire, a breath of air): filtered, its volume shaped [[dt, v], ...], its filter moving (sweep)
function prBed(tr,at,dur,brown,type,f,q,pts,rev,sweep){const c=AU.ctx,n=noiseSrc(at,dur+.1,brown),b=filt(type,f,q),g=c.createGain();n.connect(b);b.connect(g);
  g.gain.setValueAtTime(0,at);for(const[dt,v] of pts)g.gain.linearRampToValueAtTime(v,at+dt);if(sweep)for(const[dt,v] of sweep)b.frequency.linearRampToValueAtTime(v,at+dt);route(g,tr,rev||0);
  if(dur>3)(tr.beds||(tr.beds=[])).push(n)}
// one snap of a fire (v: how strong)
function prSnap(tr,at,v){const c=AU.ctx,n=noiseSrc(at,.04),hp=filt('highpass',2400+Math.random()*2400,.7),g=c.createGain();n.connect(hp);hp.connect(g);g.gain.setValueAtTime(.0001,at);
  g.gain.linearRampToValueAtTime((.015+Math.random()*.035)*v,at+.002);g.gain.exponentialRampToValueAtTime(.0005,at+.03);route(g,tr,.1)}
TRACKS.prologo={bpm:60,
  // T: the second of the pictures this step plays at (from the clock they share; a cue up to half a second late still plays, at once)
  play(tr,step,t,spb){const T=PRO.a0!=null?t-PRO.a0:step*spb,lo=Math.max(tr.cueT==null?-1:tr.cueT,T-.5),hi=T+spb;tr.cueT=hi;if(lo>56)return;
    const cue=(x,f)=>{if(x>=lo&&x<hi)try{f(t+Math.max(0,x-T))}catch(e){}};
    // the wind of the dark, all the way, and a low drone under the first pictures
    cue(0,a=>{prBed(tr,a,56,true,'lowpass',380,.7,[[2,.05],[20,.05],[22,.08],[39,.06],[50,.07],[55.5,0]],.3,[[6,520],[14,300],[22,620],[30,360],[40,540],[52,280]]);vPad(tr,a+.2,[38,45],9,.07,300)});
    // I · the kingdom: a warm chord, the bell, the harp going up, a far choir
    cue(1.8,a=>vPad(tr,a,[50,57,62,65],8,.08,900));
    cue(3.2,a=>{vBell(tr,a,74,4,.05);vBell(tr,a+.01,62,4,.03)});
    [62,65,69,74,77].forEach((m,i)=>cue(3.6+i*.55,a=>vHarp(tr,a,m,2.4,.045)));
    cue(5.2,a=>vChoir(tr,a,[57,62,65],4.4,.05));
    // II · down into the earth: a deep breath of air, the fire, the chord of the flame
    cue(8.8,a=>{prBed(tr,a,1.8,true,'lowpass',260,.7,[[.6,.1],[1.8,0]],.4,[[1.8,120]]);vBass(tr,a+.4,38,3,.12)});
    cue(9.4,a=>prBed(tr,a,12,true,'lowpass',520,.6,[[1,.06],[6.6,.06],[11,.02],[12,0]],.15));
    // the fire crackling while the flame lives (fewer and softer as it dies)
    if(hi>9.4&&lo<20.9){const v=1-.85*proSeg(T,15,20.5);for(let x=Math.max(lo,9.4);x<Math.min(hi,20.9);x+=.05+Math.random()*.14)if(Math.random()<v)try{prSnap(tr,t+Math.max(0,x-T),v)}catch(e){}}
    cue(10.4,a=>vPad(tr,a,[46,53,58,62],6,.08,1100));
    cue(10.6,a=>{vBell(tr,a,69,4,.045);vChoir(tr,a+.3,[50,57,62],5,.05)});
    [70,69,65,62].forEach((m,i)=>cue(12.2+i*.7,a=>vHarp(tr,a,m,2.2,.04)));
    // the flame dies: the chord goes down, a bass that falls, little bells going out like sparks
    cue(16,a=>{vPad(tr,a,[43,50,55,58],5.4,.085,700);vBell(tr,a,62,3.5,.035)});
    [50,48,46,45].forEach((m,i)=>cue(16+i*1.3,a=>vBass(tr,a,m-12,1.25,.13)));
    [86,84,81,79].forEach((m,i)=>cue(16.8+i*1.15,a=>vBell(tr,a,m,1.6,.012*(1-i*.2))));
    cue(20.2,a=>prBed(tr,a,2,false,'highpass',2600,.7,[[.3,.012],[2,0]],.4,[[2,1200]]));
    // III · the dead: only the wind for a moment, then the deep drum, a choir that does not resolve, the earth breaking at each one
    cue(22.6,a=>{dDrum(tr,a,.9,60,26,2.2,140,.5);vChoir(tr,a+.1,[49,50,56],5.4,.06);vPad(tr,a,[37,44],5.6,.07,260)});
    PR_RISE.forEach(([x,y,t0])=>cue(21.6+t0,a=>{prBed(tr,a,.6,true,'lowpass',300,.7,[[.05,.16],[.6,0]],.15);for(let i=0;i<4;i++)fModal(a+.1+i*.11+Math.random()*.05,VR(1150,.15),[1,2.2,3.7],[.05,.03,.02],.05,.2)}));
    cue(25.4,a=>vBell(tr,a,51,4,.03));
    // IV · the kings: a low brass, a slow heart, the creak when they turn
    cue(28.4,a=>{vBrass(tr,a,38,5,.05);vBrass(tr,a,45,5,.035);vPad(tr,a,[43,46,50],5.4,.07,500)});
    for(let i=0;i<6;i++)cue(28.8+i*.92,a=>dTaiko(tr,a,.32+(i%2?0:.1)));
    cue(29.2,a=>vChoir(tr,a,[50,53,58],4,.05));
    cue(30.3,a=>prBed(tr,a,.9,false,'bandpass',420,6,[[.2,.06],[.9,0]],.2,[[.9,260]]));
    // V · the guardians: the chains, the iron of the gate, the Yeti's roar, a hard chord
    cue(34.2,a=>{for(let i=0;i<10;i++)M.metal(a+i*.07+Math.random()*.03,.4,VR(1150,.3),.4)});
    cue(34.8,a=>{vChoir(tr,a,[45,52,57],4.4,.055);vBrass(tr,a,33,4,.06);dDrum(tr,a,.6,70,30,1.4,200,.4)});
    cue(36.4,a=>{prBed(tr,a,1.3,true,'lowpass',420,1.2,[[.15,.2],[.9,.12],[1.3,0]],.3,[[.4,700],[1.3,260]]);vBrass(tr,a,31,1.2,.06)});
    cue(37.6,a=>{for(let i=0;i<6;i++)M.metal(a+i*.09,.3,VR(1000,.3),.4)});
    // VI · the hero: his steps on the stone going down, his theme on the harp and a flute, the choir rising with hope… and the end
    for(let i=0;i<15;i++)cue(39.6+i*.475,a=>fThump(a,VR(150,.08),70,.06,.07+(i%2?.02:0),.3));
    [[40.6,69],[41.4,74],[42.2,72],[43,69],[43.8,65],[44.6,67],[45.4,69]].forEach(([x,m])=>cue(x,a=>vHarp(tr,a,m,2.6,.045)));
    cue(40.4,a=>vPad(tr,a,[50,57,62],6,.07,800));
    cue(42.6,a=>vFlute(tr,a,74,2.6,.03));
    cue(46.4,a=>{vChoir(tr,a,[50,57,62,65],4,.06);vBell(tr,a,74,3,.035);vPad(tr,a,[46,53,58,62],3.8,.07,1200)});
    cue(50.3,a=>{vPad(tr,a,[38,45,50],3.2,.06,400);vBell(tr,a,62,3,.025)});
    cue(51.6,a=>{vBell(tr,a,50,6,.05);vBell(tr,a,38,6,.04);prBed(tr,a,1.2,false,'highpass',3000,.7,[[.2,.01],[1.2,0]],.5)})}};
// the start of the game (59) has already opened the trailer before this file: the prologue takes its place
if(INTRO.on&&!INTRO.pro){INTRO.on=false;INTRO.splash=false;started=false;$('introScr').classList.remove('splash');try{proStart(true)}catch(e){console.error(e)}}
