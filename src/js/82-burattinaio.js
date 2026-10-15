// =====================================================================
// IL BURATTINAIO D'OMBRA, custode della Cripta delle Ombre (arena 9). Fluttua lontano da te e alterna quattro mosse, ognuna sul suo
// fotogramma del modello (sprite/nemici3d/boss3.js, puppeteer):
// - Manate (slam): prepara (le mani si alzano, un cerchio viola dove batteranno), le mani battono davanti a lui: un'onda d'ombra che si
//   allarga sul pavimento (si salta con lo scatto); nella fase 2 anche un anello di sfere d'ombra.
// - Fili (strings): allarga le mani e un filo d'oro attraversa tutta la stanza correndo via da lui: si passa con lo scatto o stando
//   dietro un ostacolo; nella fase 2 il filo torna indietro.
// - Burattini (puppets): burattini d'ombra escono da terra davanti a lui (due, tre nella fase 2) e saltellano verso di te (al massimo
//   quattro insieme; dopo 14 secondi i loro fili si consumano).
// - Sipario (vanish): sprofonda in una pozza viola, la pozza riappare vicino a te (un cerchio la annuncia) e lui risale con un anello di
//   sfere d'ombra.
// Fase 2 a metà vita: mantello più scuro e occhi arancioni, tutto più rapido. Entrata: scende appeso ai suoi fili e fa l'inchino.
// Sconfitta: i fili si spezzano (anche quelli dei burattini), le mani cadono in fumo, il mantello si affloscia, gli occhi salgono come bolle.
// =====================================================================
EUPD.puppeteer=(e,dt,sm,a,d)=>{
  if(b3phase(e,'Il Burattinaio tira tutti i fili','255,95,200','magic')){e.si=0}
  b3tick(e,dt);const p2=e.p2,k=b3k(e);
  if(e.st==='enter'){b3go(e,'walk',.9);return}
  if(e.st==='walk'){e.face=a;
    // floats to a spot 150-220 px from you, in the room, away from the obstacles
    if(!e.anchor||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<120){const an=Math.atan2(e.y-P.y,e.x-P.x)+rand(-.9,.9),r=rand(150,220);e.anchor=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,40)}
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy),sp=(p2?88:72);e.moving=dd>4;if(dd>4)moveCircle(e,dx/dd*Math.min(dd,sp*dt),dy/dd*Math.min(dd,sp*dt),true);
    if(e.stT<=0){e.anchor=null;const seq=p2?['strings','slam','vanish','puppets','strings','slam','vanish']:['slam','strings','puppets','slam','vanish','strings'],nx=seq[e.si++%seq.length];
      if(nx==='puppets'&&G.enemies.filter(m=>m.type==='puppet'&&!m.dead).length>=3){b3go(e,'walk',.4);return}
      if(nx==='vanish'){b3go(e,'vanish');sfx('creep',2,e.x);return}
      e.nx=nx;e.lf=a;b3go(e,'prep',p2?.55:.75);e.moving=false;
      if(nx==='slam'){const q=b3pt(e,40,0,a);e.tx=q.x;e.ty=q.y;b3warn(q.x,q.y,48,e.stT+.57,'170,110,255')}
      else if(nx==='strings'){const c=b3pt(e,20,0,a);b3wline(c.x,c.y,a+Math.PI/2,1800,10,e.stT+.5,'255,210,90',true)}
      else sfx('shimmer',1,e.x)}
    return}
  e.moving=false;
  if(e.st==='prep'){e.face=e.lf;if(e.stT<=0)b3go(e,e.nx)}
  else if(e.st==='slam'){e.face=e.lf;
    if(b3at(e,.44)){const x=e.tx,y=e.ty;G.waves.push({x,y,r:14,max:p2?290:230,dmg:Math.round(17*DMG()),hit:false,rgb:'170,110,255'});if(Math.hypot(P.x-x,P.y-y)<48)hurtP(Math.round(24*DMG()));
      vfxBlast(x,y,'150,90,230',90,{sparks:12,spcol:['#ffd84a','#c8a0ff','#ffffff'],dust:14,debris:'stone',n:10,cracks:30});stamp('crater',x,y,28);shake(8);sfx('boom',0,x);vib([40,30,60]);b3fx(e,'pslam',x,y);
      if(p2)for(let i=0;i<10;i++)shootE(x,y-10,i*TAU/10+rand(0,.3),130,7,12,'shadow')}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1.1,1.5))}
  else if(e.st==='strings'){e.face=e.lf;
    if(b3at(e,.3)){b3thread(e.x,e.y,e.lf,p2?340:290,18,{back:p2,s0:22});b3fx(e,'pstrings');sfx('shimmer',2,e.x);sfx('dash',0,e.x)}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1.1,1.5))}
  else if(e.st==='puppets'){e.face=a;
    if(b3at(e,.15))sfx('creep',1,e.x);
    if(b3at(e,.86)){const n=G.enemies.filter(m=>m.type==='puppet'&&!m.dead).length;let made=0;
      for(const t of(p2?[-.6,0,.6]:[-.6,.6])){if(n+made>=4)break;const q=b3pt(e,40*Math.cos(t)+6,40*Math.sin(t),e.f3),x=clamp(q.x,L+16,R-16),y=clamp(q.y-8,TOP+20,BOT-20);
        const m=makeE('puppet',x,y,0);m.p2=p2;m.face=a;G.enemies.push(m);made++;b3fx(e,'ppuppet',x,y);if(!LOWFX)vfxBlast(x,y,'120,70,200',26,{sparks:4,spcol:['#ffd84a','#c8a0ff'],dust:0,ring2:false})}}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.8,1.1):rand(1.2,1.6))}
  else if(e.st==='vanish'){e.face=a;
    if(b3at(e,.33)){e.hidden=true;b3fx(e,'psink',e.x,e.y)}
    if(b3at(e,.5)){vfxBlast(e.x,e.y,'90,50,160',50,{sparks:0,dust:10,ring2:false});const an=rand(0,TAU),r=rand(120,165),s=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,30);
      e.x=s.x;e.y=s.y;b3warn(e.x,e.y,40,.33,'170,110,255',true);vfxBlast(e.x,e.y,'90,50,160',50,{sparks:0,dust:10,ring2:false});sfx('creep',2,e.x)}
    if(b3at(e,.62))e.hidden=false;
    if(b3at(e,.68)){const n=p2?16:12,o=rand(0,TAU);for(let i=0;i<n;i++)shootE(e.x,e.y-16,o+i*TAU/n,135,7,12,'shadow');fxPush({k:'ring2',x:e.x,y:e.y-10,rgb:'170,110,255',r0:10,r1:100,t:.45,max:.45,w:7});sfx('magic',0,e.x);shake(4);b3fx(e,'prise',e.x,e.y)}
    if(p2&&b3at(e,.82)){const n=12,o=rand(0,TAU);for(let i=0;i<n;i++)shootE(e.x,e.y-16,o+(i+.5)*TAU/n,120,7,12,'shadow')}
    if(e.stT<=0){e.hidden=false;b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}}
  else b3go(e,'walk',1)};
// the entrance (2.4 s, the model's 'enter'): comes down from above hanging on its strings (lands at 1.2 s), then the deep bow
B3IN.puppeteer=(e,t,t0,at,roar)=>{e.em=t<1.15?.999:1;
  if(t0===0){sfx('creep',2,e.x);shake(2)}
  if(t<1.1&&!LOWFX&&Math.random()<.4)fxPush({k:'spark',x:e.x+rand(-30,30),y:e.y-rand(40,180),t:.4});
  if(at(1.2)){shake(5);dustRing(e.x,e.y,18);vfxBlast(e.x,e.y,'150,90,230',80,{sparks:10,spcol:['#ffd84a','#c8a0ff'],dust:14,ring2:false});sfx('boom',0,e.x)}
  if(at(1.55))sfx('shimmer',2,e.x);
  if(at(2.05))roar()};
ETELE.puppeteer=e=>{if(e.st==='vanish'&&e.hidden){const k=b3k(e);if(k>.5&&k<.66){ctx.strokeStyle=`rgba(255,216,74,${.5+.3*Math.sin(G.t*20)})`;ctx.lineWidth=2;ell(e.x,e.y,30,18);ctx.stroke()}}};
// the defeat: the strings of the puppets snap too, a cloud of violet motes rises as the cloak goes limp
B3DIE.puppeteer={setup(c){for(const m of G.enemies)if(m.type==='puppet'&&!m.dead){vfxBlast(m.x,m.y-8,'120,70,200',30,{sparks:6,spcol:['#ffd84a','#c8a0ff'],dust:6,ring2:false});killE(m,true)}sfx('click',0,c.x)},
  tick(c,dt,D,p){if(p>.3&&p<.75&&Math.random()<(LOWFX?.25:.6))cpart(c,{k:'spark',x:c.x+rand(-26,26),y:c.y-rand(4,50),vx:rand(-10,10),vz:rand(30,70),g:-10,life:rand(.6,1.1),r:2,col:c.p2?'255,140,220':'200,150,255'});
    if(p>.62&&!c.pop){c.pop=1;sfx('bubble',0,c.x)}}};
