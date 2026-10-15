// =====================================================================
// LA PIOVRA DELLA PALUDE, custode della Palude Maledetta (arena 11). Nuota piano a mezza distanza (con la sua acqua intorno) e alterna
// (modello octopus):
// - Tentacolata (slam): una striscia d'acqua segna dove batterà; il tentacolo si alza arricciato e si abbatte davanti a lei: chi è sotto
//   viene colpito, e dall'acqua parte un'onda. Nella fase 2 due tentacolate di fila.
// - Inchiostro (ink): si gonfia e sputa tre (cinque) palle d'inchiostro ad arco: dove cadono restano chiazze che rallentano.
// - Gorgo (whirl): gira con i tentacoli distesi: l'acqua ti tira verso di lei mentre spara bolle a spirale.
// - Immersione (dive): sparisce sott'acqua (si vedono solo le bolle e la ninfea che vengono verso di te), un cerchio segna dove esce, e
//   riemerge con uno spruzzo e un anello di bolle.
// Fase 2: viola con le macchie magenta che brillano, occhi rossi. Entrata: sale dall'acqua (prima la ninfea, poi gli occhi), saluta con
// due tentacoli e fa la faccia arrabbiata. Sconfitta: impallidisce, si arriccia e affonda in una nuvola d'inchiostro: resta la ninfea.
// =====================================================================
EUPD.octopus=(e,dt,sm,a,d)=>{
  if(b3phase(e,'La Piovra si arrabbia','255,90,220','splash')){e.si=0}
  b3tick(e,dt);const p2=e.p2,k=b3k(e);
  if(e.st==='enter'){b3go(e,'walk',1);return}
  if(e.st==='walk'){e.face=a;e.air=0;
    if(!e.anchor||Math.hypot(e.anchor.x-P.x,e.anchor.y-P.y)<120){const an=Math.atan2(e.y-P.y,e.x-P.x)+rand(-.8,.8),r=rand(150,210);e.anchor=b3spot(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r*.8,40)}
    const dx=e.anchor.x-e.x,dy=e.anchor.y-e.y,dd=Math.hypot(dx,dy),sp=p2?78:62;e.moving=dd>4;if(dd>4)moveCircle(e,dx/dd*Math.min(dd,sp*dt),dy/dd*Math.min(dd,sp*dt));
    if(e.stT<=0){e.anchor=null;const seq=p2?['slam','dive','ink','whirl','slam','dive','ink']:['slam','ink','whirl','slam','dive','ink'],nx=seq[e.si++%seq.length];
      e.nx=nx;e.lf=a;e.moving=false;
      if(nx==='dive'){b3go(e,'dive');sfx('bubble',0,e.x);return}
      b3go(e,'prep',p2?.45:.65);
      if(nx==='slam'){b3wline(e.x,e.y,a,105,46,e.stT+.66,'90,210,200')}
      else if(nx==='whirl')b3warn(e.x,e.y,70,e.stT+.2,'90,210,200',true);
      else sfx('bubble',1,e.x)}
    return}
  e.moving=false;
  if(e.st==='prep'){e.face=e.lf;if(e.stT<=0)b3go(e,e.nx)}
  else if(e.st==='slam'){e.face=e.lf;
    if(b3at(e,.47)){const ca=Math.cos(e.lf),sa=Math.sin(e.lf),dx=P.x-e.x,dy=P.y-e.y,u=dx*ca+dy*sa,v=Math.abs(dy*ca-dx*sa);
      if(u>0&&u<110&&v<24+P.r*.6&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(24*DMG()));
      const tx=e.x+ca*80,ty=e.y+sa*80;G.waves.push({x:tx,y:ty,r:10,max:p2?190:160,dmg:Math.round(14*DMG()),hit:false,rgb:'120,220,210'});
      vfxBlast(tx,ty,'120,220,210',70,{sparks:14,spcol:['#ffffff','#9ff0e0','#3aa89a'],dust:0,ring2:false});G.ripples.push({x:tx,y:ty,r:8,max:70,a:1});shake(6);sfx('splash',2,tx);b3fx(e,'oslam',tx,ty)}
    if(e.stT<=0){if(p2&&e.nx==='slam'&&!e.dbl){e.dbl=1;e.lf=a;b3go(e,'prep',.38);e.nx='slam';b3wline(e.x,e.y,a,105,46,.38+.66,'90,210,200');return}
      e.dbl=0;b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}}
  else if(e.st==='ink'){e.face=a;
    if(b3at(e,.38)){const n=p2?5:3;for(let i=0;i<n;i++){const off=(i-(n-1)/2)*.5,r=Math.min(260,Math.max(90,d))*(i?rand(.75,1.1):1),tx=e.x+Math.cos(a+off)*r,ty=e.y+Math.sin(a+off)*r;
        b3ink(e.x,e.y-26,tx,ty,.85+i*.06,26,14,{p2})}sfx('splash',1,e.x)}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}
  else if(e.st==='whirl'){e.face=a;
    if(k>.1&&k<.9){if(d<300&&d>e.r+P.r&&P.dashT<=0){const pull=(p2?78:58)*(1-d/340);moveCircle(P,(e.x-P.x)/d*pull*dt,(e.y-P.y)/d*pull*dt)}
      e.fireT=(e.fireT||0)-dt;if(e.fireT<=0){e.fireT=.17;const arms=p2?3:2;for(let q=0;q<arms;q++){const an=(e.rot||0)+q*TAU/arms;const pr={x:e.x+Math.cos(an)*24,y:e.y-14+Math.sin(an)*14};
          shootE(pr.x,pr.y,an,110,7,11,'bubble');const pj=G.eproj[G.eproj.length-1];if(pj)pj.ph=rand(0,TAU)}e.rot=(e.rot||0)+.33}}
    if(b3at(e,.1)){sfx('bubble',2,e.x);b3fx(e,'owhirl')}
    if(e.stT<=0)b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}
  else if(e.st==='dive'){e.face=a;
    if(b3at(e,.3)){e.hidden=true;e.air=1;b3fx(e,'osink',e.x,e.y)}
    if(k>=.32&&k<.45){e.tx=clamp(P.x,L+40,R-40);e.ty=clamp(P.y,TOP+50,BOT-50)}
    if(b3at(e,.45)){const s=b3spot(e.tx,e.ty,20);e.tx=s.x;e.ty=s.y;e.sx0=e.x;e.sy0=e.y;b3warn(e.tx,e.ty,58,.25*B3D(e,'dive'),'90,210,200')}
    if(k>=.45&&k<.66&&e.sx0!=null){const u=(k-.45)/.21,q=u*u*(3-2*u);e.x=e.sx0+(e.tx-e.sx0)*q;e.y=e.sy0+(e.ty-e.sy0)*q;if(!LOWFX&&Math.random()<.5)G.fx.push({k:'bub',x:e.x+rand(-14,14),y:e.y+rand(-8,8),t:.5,r:rand(2,4)})}
    if(b3at(e,.66)){if(e.tx!=null){e.x=e.tx;e.y=e.ty}e.hidden=false}
    if(b3at(e,.7)){if(Math.hypot(P.x-e.x,P.y-e.y)<58+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(24*DMG()));const n=p2?16:12,o=rand(0,TAU);
      for(let i=0;i<n;i++){shootE(e.x,e.y-14,o+i*TAU/n,120,7,11,'bubble');const pj=G.eproj[G.eproj.length-1];if(pj)pj.ph=rand(0,TAU)}
      G.waves.push({x:e.x,y:e.y,r:12,max:120,dmg:Math.round(12*DMG()),hit:false,rgb:'120,220,210'});vfxBlast(e.x,e.y,'120,220,210',100,{sparks:18,spcol:['#ffffff','#9ff0e0','#3aa89a'],dust:0,ring2:false});
      G.ripples.push({x:e.x,y:e.y,r:12,max:90,a:1});shake(7);sfx('splash',2,e.x);b3fx(e,'orise',e.x,e.y)}
    if(b3at(e,.8))e.air=0;
    if(e.stT<=0){e.hidden=false;e.air=0;e.sx0=null;b3go(e,'walk',p2?rand(.7,1):rand(1,1.4))}}
  else b3go(e,'walk',1)};
// the entrance (3 s): bubbles, the lily pad, the eyes, then up it comes with a splash (1.35 s), waves hello, puts on its grumpy face
B3IN.octopus=(e,t,t0,at,roar)=>{e.em=t<.95?.999:1;
  if(t0===0){sfx('bubble',2,e.x);shake(2)}
  if(t<1.6&&Math.random()<(LOWFX?.3:.7))G.fx.push({k:'bub',x:e.x+rand(-40,40),y:e.y+rand(-14,14),t:.6,r:rand(2,5)});
  if(at(1.35)){shake(5);sfx('splash',2,e.x);vfxBlast(e.x,e.y,'120,220,210',110,{sparks:14,spcol:['#ffffff','#9ff0e0','#3aa89a'],dust:0,ring2:false});G.ripples.push({x:e.x,y:e.y,r:10,max:90,a:1})}
  if(at(1.9))sfx('shimmer',1,e.x);
  if(at(2.65))roar()};
ETELE.octopus=e=>{if(e.st==='whirl'){const k=b3k(e);if(k>.1&&k<.9){const a=.18+.08*Math.sin(G.t*6);ctx.strokeStyle=`rgba(150,230,220,${a})`;ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.lineDashOffset=-G.t*40;ell(e.x,e.y,300,180);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0}}};
// the defeat: bubbles while it sinks, a splash when the ink cloud blooms
B3DIE.octopus={tick(c,dt,D,p){if(p>.25&&p<.8&&Math.random()<(LOWFX?.3:.7))cpart(c,{k:'bubble',x:c.x+rand(-26,26),y:c.y-rand(0,16),vz:rand(20,50),ph:rand(0,6),life:rand(.5,1),r:rand(2,5)});
    if(p>.52&&!c.ink){c.ink=1;sfx('splash',1,c.x);cpart(c,{k:'ripple',x:c.x,y:c.y,life:1.2,r:16})}}};
