// =====================================================================
// IL CERVO D'AURORA, custode della Vetta di Mossbound (arena 12, l'ultimo boss). Trotta a mezza distanza e alterna (modello stag):
// - Carica (prep + charge): abbassa la testa e raspa (una striscia segna la corsa), poi galoppa dritto finché non sbatte contro un muro o
//   un ostacolo: schegge di cristallo. Nella fase 2 due cariche di fila.
// - Cristalli (crystals): butta indietro la testa, poi un ventaglio di schegge di cristallo (due nella fase 2).
// - Aurora (aurora): alza la testa, le corna ardono: tende di luce ondeggiano in alto e scendono sulla stanza (tre, quattro nella fase 2).
// - Zoccolata (stomp): si impenna (un cerchio segna il colpo) e batte gli zoccoli: anello di punte di ghiaccio, onda e schegge.
// Fase 2: corna che ardono, muschio che brilla pieno di fiori. Entrata: salta giù dall'alto, atterra con le zampe piegate, alza la testa
// mentre le corna si accendono punta dopo punta. Sconfitta: si inginocchia, si sdraia, le corna si crepano in neve, sbocciano i fiori e
// diventa la luce dell'aurora che sale: resta un cumulo di muschio con un fiore.
// =====================================================================
EUPD.stag=(e,dt,sm,a,d)=>{
  if(b3phase(e,"Il Cervo si accende d'aurora",'200,160,255','shimmer')){e.si=0}
  b3tick(e,dt);const p2=e.p2,k=b3k(e);
  if(e.st==='enter'){b3go(e,'walk',1);return}
  if(e.st==='walk'){e.face=a;
    if(!e.anchor||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<130){const an=Math.atan2(e.y-P.y,e.x-P.x)+rand(-.8,.8),r=rand(170,230);e.anchor=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,40)}
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy),sp=p2?100:84;e.moving=dd>4;if(dd>4)moveCircle(e,dx/dd*Math.min(dd,sp*dt),dy/dd*Math.min(dd,sp*dt));
    if(e.stT<=0){e.anchor=null;const seq=p2?['charge','aurora','stomp','crystals','charge','aurora','stomp']:['charge','crystals','stomp','aurora','charge','crystals'],nx=seq[e.si++%seq.length];
      e.lf=a;e.moving=false;stagStart(e,nx,a)}
    return}
  e.moving=false;
  if(e.st==='prep'){e.face=e.lf;if(e.stT<=0){b3go(e,'charge',1.15);e.ct=0;e.cv={x:Math.cos(e.lf),y:Math.sin(e.lf)};sfx('dash',0,e.x)}}
  else if(e.st==='charge'){e.face=e.lf;e.ct=(e.ct||0)+dt;const sp=p2?430:380,ox=e.x,oy=e.y;moveCircle(e,e.cv.x*sp*dt,e.cv.y*sp*dt);
    if(k>=1){e.mt-=B3D(e,'charge');e.s3=null}// the gallop loops: a new stride from the start (the stride is periodic)
    e.stepT=(e.stepT||0)-dt;if(e.stepT<=0){e.stepT=.17;stepFx(e.x,e.y+6,true);if(!LOWFX)fxPush({k:'puff',x:e.x-e.cv.x*20,y:e.y+8,vx:-e.cv.x*40,vy:-12,t:.4,r:rand(5,8)})}
    const moved=Math.hypot(e.x-ox,e.y-oy),wall=e.x<=L+e.r+2||e.x>=R-e.r-2||e.y<=TOP+e.r+2||e.y>=BOT-e.r-2;
    if((wall||moved<sp*dt*.4)&&e.ct>.12||e.stT<=0){const hit=e.stT>0;
      if(hit){shake(9);sfx('boom',0,e.x);vib([50,30,70]);vfxBlast(e.x+e.cv.x*e.r,e.y+e.cv.y*e.r*.6,'190,255,225',80,{sparks:16,spcol:['#ffffff','#c8fff0','#c8b0ff'],debris:['#e0fff4','#a8e8d0','#ffffff'],n:12,dust:10});
        const n=p2?10:8,o=Math.atan2(-e.cv.y,-e.cv.x);for(let i=0;i<n;i++)shootE(e.x,e.y-20,o+(i-(n-1)/2)*.32,180,6,12,'crystal');stamp('crater',e.x+e.cv.x*e.r,e.y+e.cv.y*e.r*.6,22)}
      if(p2&&!e.dbl){e.dbl=1;e.lf=Math.atan2(P.y-e.y,P.x-e.x);b3go(e,'prep',.5);stagLine(e,e.lf,.5);return}
      e.dbl=0;b3go(e,'walk',hit?rand(1,1.3):rand(.7,1))}}
  else if(e.st==='crystals'){e.face=a;
    const fan=off=>{const n=p2?9:7;for(let i=0;i<n;i++)shootE(e.x,e.y-50,a+(i-(n-1)/2+off)*.15,215,6,12,'crystal');sfx('shimmer',1,e.x)};
    if(b3at(e,.42))fan(0);if(p2&&b3at(e,.6))fan(.5);
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}
  else if(e.st==='aurora'){e.face=a;
    if(b3at(e,.2)){const n=p2?4:3;for(let i=0;i<n;i++){const h=i%2===1,base=h?P.y:P.x,off=i<2?0:rand(60,90)*(Math.random()<.5?-1:1),pos=h?clamp(base+off,TOP+20,BOT-20):clamp(base+off,L+20,R-20);
        b3curtain(pos,h,48,.95+i*.28,18)}sfx('shimmer',2,e.x)}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}
  else if(e.st==='stomp'){e.face=a;
    if(b3at(e,.44)){G.waves.push({x:e.x,y:e.y,r:e.r,max:p2?290:240,dmg:Math.round(16*DMG()),hit:false,rgb:'190,255,230'});if(Math.hypot(P.x-e.x,P.y-e.y)<e.r+40)hurtP(Math.round(26*DMG()));
      const n=p2?16:12;for(let i=0;i<n;i++)shootE(e.x,e.y-10,i*TAU/n,150,6,12,'ice');for(let i=0;i<4;i++){const an=i*TAU/4+rand(-.4,.4),r=rand(60,100);addZone(clamp(e.x+Math.cos(an)*r,L+20,R-20),clamp(e.y+Math.sin(an)*r*.7,TOP+20,BOT-20),24,3,'frost')}
      stamp('crater',e.x,e.y+4,34);vfxBlast(e.x,e.y,'220,255,240',120,{debris:['#ffffff','#e0fff4','#c8e8f0'],n:24,sparks:14,spcol:['#ffffff','#c8fff0'],dust:16,cracks:36});shake(10);sfx('boom',0,e.x);sfx('icicles',0,e.x)}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1.1,1.5))}
  else b3go(e,'walk',1)};
// the start of a move: the charge first lowers the head and paws the ground (a band shows the run), the stomp shows its circle
function stagStart(e,nx,a){if(nx==='charge'){b3go(e,'prep',e.p2?.75:1);stagLine(e,a,e.stT);sfx('rock',0,e.x);return}
  b3go(e,nx);if(nx==='stomp')b3warn(e.x,e.y,e.r+40,.44*B3D(e,'stomp'),'120,80,220');else sfx('shimmer',1,e.x)}
function stagLine(e,a,t){const ca=Math.cos(a),sa=Math.sin(a);let len=0;for(let s=0;s<900;s+=10){const x=e.x+ca*s,y=e.y+sa*s;if(x<L+e.r||x>R-e.r||y<TOP+e.r||y>BOT-e.r||G.rocks.some(q=>Math.hypot(q.x-x,q.y-y)<q.r+e.r*.6))break;len=s}
  b3wline(e.x,e.y,a,Math.max(60,len+e.r),e.r*2,t+.15,'120,80,220')}
// the entrance (2.8 s): leaps down from above (lands at 1.12 s), the legs fold under it, the head rises, the antlers light up
B3IN.stag=(e,t,t0,at,roar)=>{e.em=t<1.08?.999:1;
  if(t0===0){sfx('quake',0,e.x);shake(2)}
  if(at(1.12)){shake(10);G.hitstop=Math.max(G.hitstop||0,.08);sfx('boom',0,e.x);vib([100,40,120]);dustRing(e.x,e.y,26);stamp('crater',e.x,e.y+4,e.r*1.4);
    vfxBlast(e.x,e.y,'220,255,240',140,{debris:['#ffffff','#e0fff4','#c8e8f0'],n:30,dust:26,sparks:12,spcol:['#ffffff','#c8fff0','#c8b0ff']});for(let i=0;i<2;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y,rgb:'200,255,235',r0:e.r,r1:e.r*(4+i*2),t:.5,max:.5,w:7-i*2})},i*100)}
  if(at(1.8))sfx('shimmer',2,e.x);
  if(at(2.3))roar()};
// the defeat: snow from the cracking antlers, then the light of the aurora rising
B3DIE.stag={tick(c,dt,D,p){if(p>.45&&p<.75&&Math.random()<(LOWFX?.3:.7))cpart(c,{k:'frost',x:c.x+rand(-30,30),y:c.y-rand(30,90),vz:rand(-20,10),life:rand(.6,1.1),r:rand(2,4),ph:rand(0,3)});
    if(p>.7&&Math.random()<(LOWFX?.3:.8))cpart(c,{k:'spark',x:c.x+rand(-30,30),y:c.y-rand(0,40),vx:rand(-8,8),vz:rand(40,90),g:-20,life:rand(.8,1.4),r:2.4,col:Math.random()<.5?'150,255,210':'210,170,255'});
    if(p>.45&&!c.crk){c.crk=1;sfx('icicles',0,c.x)}if(p>.72&&!c.aur){c.aur=1;sfx('shimmer',2,c.x)}}};
