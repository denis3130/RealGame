// =====================================================================
// HERO ACTIVE ABILITY: a bar that fills by hitting and killing, one big move per hero
// =====================================================================
const ULT={
  arciere:{n:'Pioggia di frecce',d:'Una pioggia di frecce cade su tutti i nemici per un secondo.',col:'#2fb3a6',rgb:'120,230,210'},
  cacciatrice:{n:'Danza delle lame',d:'Gira su sé stessa, intoccabile, e scaglia una spirale di frecce.',col:'#ff8ab8',rgb:'255,150,200'},
  balestriere:{n:"Dardo d'assedio",d:'Un dardo enorme che trapassa tutto ed esplode contro il muro.',col:'#dfe4ea',rgb:'230,235,245'},
  druida:{n:'Abbraccio delle radici',d:'Le radici bloccano e feriscono ogni nemico; tu recuperi salute.',col:'#9fff7a',rgb:'150,255,120'},
  bardo:{n:'Ballata',d:'Una canzone che rallenta tutti i nemici, li stordisce un attimo e ti cura.',col:'#ffd84a',rgb:'255,216,74'},
  alchimista:{n:'Grande calderone',d:'Un calderone enorme scoppia sui nemici e lascia una pozza di veleno.',col:'#7bf06a',rgb:'123,240,106'},
  ninja:{n:'Cento ombre',d:'Tre ombre di te compaiono e tirano stelline insieme a te.',col:'#b8a6ff',rgb:'184,166,255'},
  // the six heroes of 16 October: their Supers are in 93
  paladino:{n:'Martello del cielo',d:'Un martello di luce gigante cade sui nemici e li stordisce; tu recuperi salute e resti protetto un attimo.',col:'#ffd86b',rgb:'255,215,110'},
  mago:{n:'Tormenta',d:'Una bufera congela tutti i nemici e fa piovere ghiaccio su di loro.',col:'#9fe8ff',rgb:'160,230,255'},
  berserker:{n:'Furia',d:'Per sei secondi lanci molto più veloce, colpisci più forte e corri di più.',col:'#ff6a3c',rgb:'255,106,60'},
  corsaro:{n:'Bordata',d:'Le palle di cannone della tua nave cadono sui nemici.',col:'#f0c64a',rgb:'240,198,74'},
  domatore:{n:'Il branco',d:'Zanna ulula, quattro lupi di luce travolgono i nemici e Zanna morde il doppio.',col:'#8fc8ff',rgb:'143,200,255'},
  monaco:{n:'Cento pugni',d:'Una tempesta di pugni, poi un palmo di luce che trapassa tutto.',col:'#fff1a8',rgb:'255,241,168'}};
const ultGain=v=>{if(!P||G.state==='dead')return;const was=P.ult>=100;P.ult=Math.min(100,(P.ult||0)+v);if(!was&&P.ult>=100){sfx('shimmer',2);$('ultBtn').classList.add('full')}};
function useUlt(){if(!started||paused||modal||!P||(P.ult||0)<100||G.state==='dead'||G.state==='trans')return;
  const id=P.hero||'arciere',U=ULT[id];P.ult=0;$('ultBtn').classList.remove('full');
  G.ultFx={t:.9,max:.9,rgb:U.rgb};G.slowT=Math.max(G.slowT||0,.35);text(P.x,P.y-58,U.n+ULT_TN[ultTier(id)],U.col||'#ffe27a',17);vib([30,30,80]);shake(4);
  fxPush({k:'ring2',x:P.x,y:P.y-10,rgb:U.rgb,r0:10,r1:160,t:.5,max:.5,w:10});fxPush({k:'flash',x:P.x,y:P.y-10,rgb:U.rgb,r:120,t:.3,max:.3});
  if(id==='arciere'){sfx('levelup');const tg=G.enemies.filter(canHit);
    const nw=ultD()>1?4:3;for(let w=0;w<nw;w++){const pts=tg.slice(0,8).map(e=>({x:e.x+rand(-14,14),y:e.y+rand(-10,10)}));while(pts.length<6)pts.push({x:rand(L+30,R-30),y:rand(TOP+40,BOT-60)});
      for(const pt of pts)G.ultRain.push({x:pt.x,y:pt.y,t:-(w*.4+rand(0,.15)),dur:.42})}if(ultX())mqStar(nw)}
  else if(id==='cacciatrice'){P.inv=Math.max(P.inv,1.25*ultD());P.spin=1.1*ultD();P.spinX=ultX();P.spinA=P.face;sfx('dash')}
  else if(id==='balestriere'){const tg=nearest(P.x,P.y),a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):P.face;P.face=a;
    G.arrows.push({wb:0,x:P.x+Math.cos(a)*10,y:P.y-8+Math.sin(a)*10,a,vx:Math.cos(a)*640,vy:Math.sin(a)*640,m:5*ultK(),pierce:999,ric:0,hit:new Set(),life:2,big:true,siege:true,xpl:ultX()});
    sfx('bow','balestra');sfx('boom');moveCircle(P,-Math.cos(a)*14,-Math.sin(a)*14);if(ultD()>1)ultLater(.32,mqBolt)}
  else if(id==='druida'){sfx('summon');const v=Math.round(P.maxhp*.2*ultK());P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-44,'+'+v,'#9fff7a',18);
    for(const e of G.enemies){if(!canHit(e))continue;e.root=(isBoss(e.type)?1.4:2.6)*ultD();e.rootT=0;e.rootK=ultK();e.rootX=ultX();vfxBlast(e.x,e.y,'150,255,120',30,{sparks:0,debris:'leaf',n:8,dust:4,ring2:false})}}
  // the Bardo, the Alchimista and the Ninja: their Supers are in 92
  else if(NH_ULT[id])NH_ULT[id]()}
function updUlt(dt){
  if(P.spin>0){P.spin-=dt;P.spinA+=dt*14;P.face=P.spinA;P.spinF=(P.spinF||0)-dt;if(P.spinF<=0){P.spinF=.035;arrow(P.x,P.y-8,P.spinA,.9*ultK());if(Math.random()<.4)sfx('bow')}}
  for(let i=G.ultRain.length-1;i>=0;i--){const r=G.ultRain[i];r.t+=dt;if(r.t<r.dur)continue;G.ultRain.splice(i,1);if(r.big){shake(7);sfx('boom',0,r.x)}
    vfxBlast(r.x,r.y,r.big?'255,236,140':'200,255,240',r.big?72:34,{sparks:8,spcol:['#ffffff','#9ff0e0'],dust:4,ring2:false});sfx('hit',{c:false,t:'goblin'},r.x);
    {const rr=r.big?54:26,dm=(r.big?6:2.1)*ultK();for(const e of G.enemies)if(canHit(e)&&Math.hypot(e.x-r.x,e.y-r.y)<e.r+rr){hurtE(e,P.atk*dm,Math.random()<P.crit);if(r.big&&!e.dead&&!isBoss(e.type))e.daze=Math.max(e.daze||0,1.2)}}
    stamp('cracks',r.x,r.y,10)}
  if(G.ultFx){G.ultFx.t-=dt;if(G.ultFx.t<=0)G.ultFx=null}}
function siegeBoom(ar){vfxBlast(ar.x,ar.y,'255,220,150',110,{fire:8,sparks:24,debris:'stone',n:16,dust:14,cracks:40});G.fx.push({k:'boom',x:ar.x,y:ar.y,t:.35,r:70});shake(9);sfx('boom',0,ar.x);
  for(const e of G.enemies)if(canHit(e)&&Math.hypot(e.x-ar.x,e.y-ar.y)<e.r+70)hurtE(e,P.atk*3,true)}
function drawUltRain(){for(const r of G.ultRain){if(r.t<0)continue;const p=clamp(r.t/r.dur,0,1),h=(1-p)*260;if(r.big){mqStarDraw(r,p,h);continue}
  ctx.strokeStyle=`rgba(160,255,230,${.4+p*.4})`;ctx.lineWidth=2;circ(r.x,r.y,24);ctx.stroke();
  for(let k=-1;k<=1;k++){const x=r.x+k*7,y=r.y-h+Math.abs(k)*6;ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y-16);ctx.lineTo(x,y);ctx.stroke();ctx.strokeStyle='#d9b27a';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#e8ecf0';ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x-3,y-1);ctx.lineTo(x+3,y-1);ctx.closePath();ctx.fill()}}}
function drawRoots(e){const k=Math.min(1,(e.root||0)/.3),x=e.x,y=e.y;ctx.save();ctx.lineCap='round';
  for(let i=0;i<5;i++){const a=i/5*TAU+e.x*.1,r=e.r*1.1,sx=x+Math.cos(a)*r,sy=y+Math.sin(a)*r*.45,tx=x+Math.cos(a+.6)*e.r*.4,ty=y-e.r*(.8+.3*Math.sin(i))*k;
    ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx+Math.cos(a)*6,ty+6,tx,ty);ctx.stroke();ctx.strokeStyle='#6b4a2a';ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#7bd65a';ctx.beginPath();ctx.ellipse(tx,ty,3,1.6,a,0,TAU);ctx.fill()}ctx.restore()}
function drawUltOverlay(){const u=G.ultFx;if(!u)return;const k=u.t/u.max;ctx.fillStyle=`rgba(6,8,16,${.32*Math.sin(k*Math.PI)})`;ctx.fillRect(-60,-60,AW+120,AH+120);ctx.save();ctx.globalCompositeOperation='lighter';glow(u.rgb,P.x,P.y-12,90,.5*k);ctx.restore()}
function hudUlt(){const b=$('ultBtn');if(!b||!P)return;const hide=G.state==='dead';if(b.hidden!==hide)b.hidden=hide;const v=(P.ult||0)/100;b.style.setProperty('--u',v*360+'deg');b.style.setProperty('--uc',(ULT[P.hero]||ULT.arciere).col)}


