// =====================================================================
// LA FENICE DELLA FORGIA, custode della Forgia degli Dei (arena 10). Vola bassa a mezza distanza e alterna (modello phoenix):
// - Piume di fuoco (feathers): le ali vanno indietro, poi un ventaglio di piume di fuoco (nella fase 2 due ventagli, azzurri).
// - Picchiata (dive): una striscia di fuoco segna la linea; si alza e si tuffa lungo la linea fino al punto dove eri, lasciando fiamme.
// - Vortice (vortex): gira con le ali aperte: anelli di fuoco che si allargano e due (tre) bracci di sfere di fuoco.
// - Pioggia di braci (rain): vola in alto e fa cadere le braci dove sei e intorno (cerchi di avviso a terra).
// - Rinascita (rebirth) a metà vita: si chiude in una palla di fuoco, diventa un uovo di cenere (non si può colpire), si spacca e rinasce
//   con le fiamme azzurre: un anello di fuoco e la fase 2, più rapida.
// Entrata: scende dal cielo dentro una colonna di fuoco, atterra, apre le ali e grida. Sconfitta: le fiamme si spengono, le piume diventano
// cenere, si chiude in un uovo che si crepa e ne esce un pulcino.
// =====================================================================
EUPD.phoenix=(e,dt,sm,a,d)=>{
  b3tick(e,dt);const p2=e.p2,k=b3k(e);if(e.shell>0)e.shell-=dt;
  // half health: the rebirth (once), whatever it was doing
  if(!e.reborn&&e.hp<e.max*.5){e.reborn=1;e.air=1;e.hidden=false;b3go(e,'rebirth');e.shell=3.1;e.moving=false;sfx('ignite',2,e.x);return}
  if(e.st==='enter'){b3go(e,'walk',.9);return}
  if(e.st==='walk'){e.face=a;e.air=0;
    if(!e.anchor||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<130){const an=Math.atan2(e.y-P.y,e.x-P.x)+rand(-1,1),r=rand(160,230);e.anchor=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,40)}
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy),sp=p2?110:90;e.moving=dd>4;if(dd>4)moveCircle(e,dx/dd*Math.min(dd,sp*dt),dy/dd*Math.min(dd,sp*dt),true);
    if(e.stT<=0){e.anchor=null;const seq=p2?['dive','feathers','rain','vortex','dive','feathers','rain']:['feathers','dive','vortex','feathers','rain','dive'],nx=seq[e.si++%seq.length];
      e.nx=nx;e.lf=a;e.moving=false;
      if(nx==='rain'){b3go(e,'rain');sfx('dash',0,e.x);return}
      b3go(e,'prep',p2?.5:.7);
      if(nx==='dive'){const tx=clamp(P.x,L+30,R-30),ty=clamp(P.y,TOP+40,BOT-40),ang=Math.atan2(ty-e.y,tx-e.x),dist=Math.min(420,Math.hypot(tx-e.x,ty-e.y)+60);
        let ex=e.x+Math.cos(ang)*dist,ey=e.y+Math.sin(ang)*dist;ex=clamp(ex,L+30,R-30);ey=clamp(ey,TOP+40,BOT-40);const len=Math.hypot(ex-e.x,ey-e.y);
        e.dv={sx:e.x,sy:e.y,ex,ey,ang};e.lf=ang;G.lines.push({x:e.x,y:e.y,a:ang,len,w:34,warn:e.stT+.35*B3D(e,'dive'),act:.5,act0:.5,hit:false,col:p2?'blue':'fire',dmg:22})}
      else if(nx==='vortex')b3warn(e.x,e.y,60,e.stT+.25,'255,140,40',true);
      else sfx('ignite',1,e.x)}
    return}
  e.moving=false;
  if(e.st==='prep'){e.face=e.lf;if(e.stT<=0)b3go(e,e.nx)}
  else if(e.st==='feathers'){e.face=a;
    const fan=off=>{const n=p2?9:7;for(let i=0;i<n;i++)shootE(e.x,e.y-30,a+(i-(n-1)/2+off)*.16,210,6,13,p2?'featherb':'feather');sfx('dash',0,e.x)};
    if(b3at(e,.4))fan(0);if(p2&&b3at(e,.62))fan(.5);
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}
  else if(e.st==='dive'){const D=e.dv;e.face=D?D.ang:e.lf;
    if(b3at(e,.3))e.air=1;
    if(b3at(e,.35))sfx('dash',0,e.x);
    if(D&&k>=.35&&k<=.62){const u=(k-.35)/.27,q=u*u*(3-2*u);e.x=D.sx+(D.ex-D.sx)*q;e.y=D.sy+(D.ey-D.sy)*q;
      if(!LOWFX&&Math.random()<.7)fxPush({k:'firep',x:e.x+rand(-8,8),y:e.y+rand(-6,6),r:rand(6,11),t:.4,max:.4})}
    if(D&&b3at(e,.62)){e.x=D.ex;e.y=D.ey;const len=Math.hypot(D.ex-D.sx,D.ey-D.sy);for(let s=20;s<len;s+=38)addZone(D.sx+Math.cos(D.ang)*s,D.sy+Math.sin(D.ang)*s,17,p2?3:2.2,'fire');
      vfxBlast(e.x,e.y,p2?'120,200,255':'255,140,50',80,{fire:10,sparks:14,dust:8,ring2:false});stamp('scorch',e.x,e.y,26);shake(6);sfx('boom',0,e.x)}
    if(b3at(e,.75))e.air=0;
    if(e.stT<=0){e.air=0;e.dv=null;b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}}
  else if(e.st==='vortex'){e.face=a;
    const ring=()=>{G.waves.push({x:e.x,y:e.y,r:16,max:p2?260:220,dmg:Math.round(15*DMG()),hit:false,rgb:p2?'120,200,255':'255,140,40'});fxPush({k:'ring2',x:e.x,y:e.y-12,rgb:p2?'150,220,255':'255,170,70',r0:12,r1:70,t:.35,max:.35,w:6});sfx('ignite',0,e.x)};
    if(b3at(e,.15)||b3at(e,.5)||(p2&&b3at(e,.8)))ring();
    if(k>.15&&k<.85){e.fireT=(e.fireT||0)-dt;if(e.fireT<=0){e.fireT=.13;const arms=p2?3:2;for(let q=0;q<arms;q++)shootE(e.x,e.y-20,(e.rot||0)+q*TAU/arms,125,6,11,'fire');e.rot=(e.rot||0)+.27}}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}
  else if(e.st==='rain'){e.face=a;
    if(b3at(e,.15))e.air=1;
    if(b3at(e,.25)){const n=p2?11:7;for(let i=0;i<n;i++){const an=rand(0,TAU),r=i?rand(40,160):0;meteor(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,.12*i,26,16)}sfx('incoming',0,e.x)}
    if(b3at(e,.92))e.air=0;
    if(e.stT<=0){e.air=0;b3go(e,'walk',p2?rand(.8,1.1):rand(1.1,1.5))}}
  else if(e.st==='rebirth'){e.face=a;
    if(b3at(e,.3))sfx('rock',0,e.x);
    if(b3at(e,.55)){e.p2=true;banner('La Fenice rinasce','Fase 2',1.6);bossRage(e,'120,200,255');$('bossBar').classList.add('rage');shake(9);sfx('boom',0,e.x);vib([60,40,100]);
      for(let i=0;i<16;i++)shootE(e.x,e.y-20,i*TAU/16,140,7,12,'fire');G.waves.push({x:e.x,y:e.y,r:16,max:240,dmg:Math.round(14*DMG()),hit:false,rgb:'120,200,255'});
      vfxBlast(e.x,e.y-20,'150,220,255',120,{fire:16,sparks:20,spcol:['#ffffff','#9fe0ff','#3a8ae8'],dust:10})}
    if(b3at(e,.7))roarBoss(e);
    if(e.stT<=0){e.shell=0;e.air=0;e.si=0;b3go(e,'walk',.8)}}
  else b3go(e,'walk',1)};
// the cry of a boss (as at the end of the entrances, without the shake of the room)
function roarBoss(e){sfx('roar',0,e.x);for(let i=0;i<2;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,255,255',r0:e.r,r1:e.r*4,t:.4,max:.4,w:5-i*1.5})},i*160)}
// the entrance (2.6 s): swoops down from the sky inside a pillar of fire (lands at 1.17 s), spreads its wings and cries
B3IN.phoenix=(e,t,t0,at,roar)=>{e.em=t<1.12?.999:1;
  if(t0===0){sfx('ignite',2,e.x);shake(2)}
  if(t<1.3&&Math.random()<(LOWFX?.4:.9))fxPush({k:'firep',x:e.x+rand(-16,16),y:e.y-rand(0,200),r:rand(6,12),t:.4,max:.4});
  if(at(1.17)){shake(7);G.hitstop=Math.max(G.hitstop||0,.06);dustRing(e.x,e.y,20);stamp('scorch',e.x,e.y+4,34);vfxBlast(e.x,e.y,'255,140,50',110,{fire:14,sparks:16,dust:12});sfx('boom',0,e.x)}
  if(at(1.85))roar()};
ETELE.phoenix=e=>{if(e.st==='rebirth'){const k=b3k(e);if(k>.25&&k<.55){ctx.strokeStyle=`rgba(255,200,120,${.4+.3*Math.sin(G.t*16)})`;ctx.lineWidth=2;ell(e.x,e.y+4,42,24);ctx.stroke()}}};
// the defeat: ash rises while the feathers go grey, the egg cracks, a little chirp
B3DIE.phoenix={tick(c,dt,D,p){if(p>.15&&p<.6&&Math.random()<(LOWFX?.3:.7))cpart(c,{k:'ash',x:c.x+rand(-24,24),y:c.y-rand(8,50),vz:rand(10,30),vx:rand(-8,8),g:-12,life:rand(.8,1.3),r:rand(1.5,3)});
    if(p<.3&&Math.random()<(LOWFX?.2:.5))cpart(c,{k:'ember',x:c.x+rand(-20,20),y:c.y-rand(10,50),vz:rand(20,50),life:.6,r:1.8});
    if(p>.75&&!c.crk){c.crk=1;sfx('click',0,c.x)}if(p>.9&&!c.chirp){c.chirp=1;sfx('shimmer',3,c.x)}}};
