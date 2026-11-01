// =====================================================================
// 104. LA MIRA ALLA BRAWL STARS (Denis, 1° novembre: «vorrei che aggiungessi al gioco una cosa tipo lo sparo alla brawl star che vede una
// piccola area che ti precede la gittata del tiro di quell'arma ecc.»; risposte: in tutte e due le modalità, «Automatica + levetta»,
// anche la Super e le abilità zombie, prima nell'Anteprima 49).
// - L'area del tiro, a terra davanti all'eroe, con la forma e la gittata vere del colpo. Classica: la freccia o il dardo fino al muro o
//   all'ostacolo che lo ferma (più larga con le frecce in più davanti; le righe delle diagonali, dei lati, di dietro e del ventaglio; il
//   rimbalzo sul muro), le tre stelline del Ninja, la fiala dell'Alchimista che vola a pallonetto col cerchio dove scoppia. Zombie: la
//   striscia o il cono di ogni arma fino al primo muro (le pompe e i mitra a cono, il lanciarazzi col cerchio dell'esplosione, il
//   lanciafiamme corto, il Risonatore tutto intorno).
// - Da fermo si spara da soli come prima: l'area, leggera, segue il bersaglio.
// - La levetta del tiro (Classica: in basso a destra accanto allo Scatto; Zombie: sopra le abilità): la trascini, vedi l'area dove va il
//   colpo, lasci e spara lì, anche camminando; un tocco spara al più vicino; riportata al centro prima di lasciare non spara.
// - La Super della Classica e le abilità della Zombie si trascinano allo stesso modo e mostrano dove colpiscono (il cerchio della Pioggia
//   di frecce e del Calderone, la striscia del Dardo d'assedio, i nemici presi da Ballata e Radici, il giro della Danza e delle Ombre; la
//   direzione dello Scatto, dove cade la Bomba, il raggio del Rintocco, dove si mette la Tagliola); un tocco le usa come prima.
// Fuori da src/ordine.txt: va nell'Anteprima 49 (anteprime/mk_anteprima49.py). Nel motore della mappa zombie ci sono tre agganci che senza
// questo file non fanno niente (W.aimHook, h.aimP, W.lookY); in 99 il bottone delle abilità chiede ad aimAbDown se il dito è suo.
// Tutto rispetta LOWFX. MIRA.on = false lo spegne.
// =====================================================================
const MIRA={on:true,err:0};
const MRGB={tiro:'255,244,214',sup:'255,204,84'};
const MDZ=12,MMAX=44;// la zona morta e la corsa della levetta (px dello schermo)
function mErr(e){if(MIRA.err++<3)console.error(e)}
const mT=()=>performance.now()/1000;
const mA=v=>Math.max(0,Math.min(1,v)).toFixed(3);
// un dito sceso su un bottone: dov'è rispetto a dove è sceso (dx, dy, len), se è fuori dalla zona morta (live; moved se lo è stato almeno
// una volta), quanto è tirato (f, da 0 a 1). Alla fine tap (non è mai uscito dalla zona morta) o cancel (rientrato al centro, o il dito
// perso). I movimenti si prendono dalla finestra in cattura: non arrivano alla telecamera della mappa né alla levetta del movimento.
function mTrack(e,el,cb){const id=e.pointerId,x0=e.clientX,y0=e.clientY,st={dx:0,dy:0,len:0,f:0,live:false,moved:false,tap:false,cancel:false,done:false,el};
  const upd=ev=>{st.dx=ev.clientX-x0;st.dy=ev.clientY-y0;st.len=Math.hypot(st.dx,st.dy);st.live=st.len>MDZ;if(st.live)st.moved=true;st.f=Math.max(0,Math.min(1,(st.len-MDZ)/(MMAX-MDZ)))};
  const off=()=>{removeEventListener('pointermove',mv,true);removeEventListener('pointerup',up,true);removeEventListener('pointercancel',cc,true);el.removeEventListener('lostpointercapture',lost)};
  const fin=()=>{st.done=true;off();try{cb.end&&cb.end(st)}catch(err){mErr(err)}};
  const mv=ev=>{if(ev.pointerId!==id)return;ev.stopPropagation();upd(ev);try{cb.move&&cb.move(st)}catch(err){mErr(err)}};
  const up=ev=>{if(ev.pointerId!==id||st.done)return;ev.stopPropagation();upd(ev);st.tap=!st.moved;st.cancel=st.moved&&!st.live;fin()};
  const cc=ev=>{if(ev.pointerId!==id||st.done)return;st.live=false;st.cancel=true;fin()};
  const lost=ev=>{if(ev.pointerId!==id||st.done)return;setTimeout(()=>{if(!st.done){st.live=false;st.cancel=true;fin()}},0)};// (dopo il pointerup, che arriva prima)
  try{el.setPointerCapture(id)}catch(_){}
  addEventListener('pointermove',mv,true);addEventListener('pointerup',up,true);addEventListener('pointercancel',cc,true);el.addEventListener('lostpointercapture',lost);
  try{cb.move&&cb.move(st)}catch(err){mErr(err)}return st}
// la manopola sotto il pollice: segue il dito fino a 22 px dal centro del bottone
function mKnob(k,st){if(!k)return;if(!st||!st.len){k.style.transform='';return}const m=Math.min(st.len,22)/st.len;k.style.transform=`translate(${(st.dx*m).toFixed(1)}px,${(st.dy*m).toFixed(1)}px)`}
// il mirino sulla manopola
const MSVG='<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="8.2" fill="none" stroke="#1b1612" stroke-width="2.6"/><path d="M17 4.6v6.2M17 23.2v6.2M4.6 17h6.2M23.2 17h6.2" stroke="#1b1612" stroke-width="2.6" stroke-linecap="round"/><circle cx="17" cy="17" r="2.3" fill="#c8323c"/></svg>';

// ------------------------------------------------------------------ i disegni a terra (nelle coordinate del mondo di chi chiama: la stanza
// della Classica, il terreno della mappa zombie dentro inGround, che li stende con la telecamera). Il colore pieno vicino all'eroe che
// sfuma lontano, i bordi chiari con un alone scuro (si leggono sul pavimento chiaro della neve e su quello buio della cripta)
// una striscia: da (x, y) verso a, lunga len, mezza larghezza hw; le frecce che corrono verso la fine (o.chev, non con LOWFX); la sbarra dove si ferma
function mLane(x,y,a,len,hw,rgb,al,o){if(len<3||al<=0)return;o=o||{};ctx.save();ctx.translate(x,y);ctx.rotate(a);
  const g=ctx.createLinearGradient(0,0,len,0);g.addColorStop(0,`rgba(${rgb},${mA(.4*al)})`);g.addColorStop(Math.min(.9,150/len),`rgba(${rgb},${mA(.3*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.15*al)})`);
  ctx.beginPath();ctx.moveTo(0,-hw);ctx.lineTo(len,-hw);ctx.lineTo(len,hw);ctx.lineTo(0,hw);ctx.arc(0,0,hw,Math.PI/2,Math.PI*1.5);ctx.closePath();ctx.fillStyle=g;ctx.fill();
  const e=ctx.createLinearGradient(0,0,len,0);e.addColorStop(0,`rgba(${rgb},${mA(.95*al)})`);e.addColorStop(1,`rgba(${rgb},${mA(.5*al)})`);
  ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-hw);ctx.lineTo(len,-hw);ctx.moveTo(0,hw);ctx.lineTo(len,hw);
  ctx.strokeStyle=`rgba(16,10,6,${mA(.24*al)})`;ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle=e;ctx.lineWidth=1.5;ctx.stroke();
  if(!o.open){ctx.beginPath();ctx.moveTo(len,-hw-2.5);ctx.lineTo(len,hw+2.5);ctx.strokeStyle=`rgba(16,10,6,${mA(.3*al)})`;ctx.lineWidth=4.2;ctx.stroke();ctx.strokeStyle=`rgba(${rgb},${mA(.9*al)})`;ctx.lineWidth=2.1;ctx.stroke()}
  if(o.chev&&!LOWFX&&len>40){const sp=30,off=(mT()*72)%sp,w=Math.min(hw*.62,6);ctx.lineWidth=1.9;
    for(let d=16+off;d<len-10;d+=sp){ctx.strokeStyle=`rgba(${rgb},${mA(.6*al*(.3+.7*(1-d/len)))})`;ctx.beginPath();ctx.moveTo(d-4.5,-w);ctx.lineTo(d,0);ctx.lineTo(d-4.5,w);ctx.stroke()}}
  ctx.restore()}
// un cono fatto di raggi (ogni raggio fino al suo muro): dall'eroe, largo hw0 alla partenza, fino ai punti ends (dal lato a−sp al lato a+sp)
function mFan(x,y,a,hw0,ends,rgb,al,o){if(!ends.length||al<=0)return;o=o||{};const px=-Math.sin(a)*hw0,py=Math.cos(a)*hw0,len=o.len||200;ctx.save();
  const g=ctx.createLinearGradient(x,y,x+Math.cos(a)*len,y+Math.sin(a)*len);g.addColorStop(0,`rgba(${rgb},${mA(.4*al)})`);g.addColorStop(.55,`rgba(${rgb},${mA(.28*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.15*al)})`);
  const path=()=>{ctx.beginPath();ctx.moveTo(x-px,y-py);for(const p of ends)ctx.lineTo(p[0],p[1]);ctx.lineTo(x+px,y+py)};
  path();ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.lineJoin='round';ctx.lineCap='round';path();
  ctx.strokeStyle=`rgba(16,10,6,${mA(.24*al)})`;ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle=`rgba(${rgb},${mA(.72*al)})`;ctx.lineWidth=1.5;ctx.stroke();
  // the far edge brighter: where the shot stops
  ctx.beginPath();ends.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=`rgba(${rgb},${mA(.9*al)})`;ctx.lineWidth=2;ctx.stroke();
  if(o.chev&&!LOWFX){const m=ends[ends.length>>1],l=Math.hypot(m[0]-x,m[1]-y),sp=28,off=(mT()*64)%sp,c=Math.cos(a),s=Math.sin(a);ctx.lineWidth=1.8;
    for(let d=16+off;d<l-10;d+=sp){const w=hw0*.6+d*Math.tan(Math.min(.5,Math.atan2(Math.hypot(ends[0][0]-m[0],ends[0][1]-m[1]),l)))*.55,cx=x+c*d,cy=y+s*d;
      ctx.strokeStyle=`rgba(${rgb},${mA(.55*al*(.3+.7*(1-d/l)))})`;ctx.beginPath();ctx.moveTo(cx-c*4.5-s*w,cy-s*4.5+c*w);ctx.lineTo(cx,cy);ctx.lineTo(cx-c*4.5+s*w,cy-s*4.5-c*w);ctx.stroke()}}
  ctx.restore()}
// uno spicchio (il lanciafiamme): raggio r, mezza apertura half
function mSector(x,y,a,r,half,rgb,al){if(r<4||al<=0)return;ctx.save();ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,r,a-half,a+half);ctx.closePath();
  const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,`rgba(${rgb},${mA(.42*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.18*al)})`);ctx.fillStyle=g;ctx.fill();
  ctx.lineJoin='round';ctx.strokeStyle=`rgba(16,10,6,${mA(.24*al)})`;ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle=`rgba(${rgb},${mA(.8*al)})`;ctx.lineWidth=1.6;ctx.stroke();ctx.restore()}
// un cerchio: il pieno leggero, l'orlo chiaro con l'alone scuro, un anello tratteggiato che gira dentro e (o.pulse) un'onda che si allarga
function mCirc(x,y,r,rgb,al,o){if(r<2||al<=0)return;o=o||{};const t=mT();ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=`rgba(${rgb},${mA((o.fill||.17)*al)})`;ctx.fill();
  ctx.strokeStyle=`rgba(16,10,6,${mA(.26*al)})`;ctx.lineWidth=3.6;ctx.stroke();ctx.strokeStyle=`rgba(${rgb},${mA(.88*al)})`;ctx.lineWidth=1.9;ctx.stroke();
  if(!LOWFX&&r>14){ctx.setLineDash([6,7]);ctx.lineDashOffset=-t*16;ctx.beginPath();ctx.arc(x,y,r*.7,0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${mA(.45*al)})`;ctx.lineWidth=1.3;ctx.stroke();ctx.setLineDash([])}
  if(o.pulse&&!LOWFX){const k=(t*1.5)%1;ctx.beginPath();ctx.arc(x,y,r*(.3+.7*k),0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${mA(.55*al*(1-k))})`;ctx.lineWidth=2;ctx.stroke()}
  ctx.restore()}
// un anello sotto un nemico (preso dalla Super)
function mRing(x,y,r,rgb,al){ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=`rgba(16,10,6,${mA(.3*al)})`;ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle=`rgba(${rgb},${mA(.95*al)})`;ctx.lineWidth=2.2;ctx.stroke();
  ctx.fillStyle=`rgba(${rgb},${mA(.14*al)})`;ctx.fill();ctx.restore()}
// i puntini a terra da (x0, y0) a (x1, y1)
function mDots(x0,y0,x1,y1,rgb,al){const d=Math.hypot(x1-x0,y1-y0),n=Math.floor(d/14);if(n<2)return;ctx.save();ctx.fillStyle=`rgba(${rgb},${mA(.7*al)})`;ctx.strokeStyle=`rgba(16,10,6,${mA(.25*al)})`;ctx.lineWidth=1;
  for(let i=1;i<n;i++){const k=i/n;ctx.beginPath();ctx.arc(x0+(x1-x0)*k,y0+(y1-y0)*k,1.7,0,Math.PI*2);ctx.fill();ctx.stroke()}ctx.restore()}
// il pallonetto nella Classica (vista dall'alto): l'ombra a terra a puntini e la fiala in aria, più alta a metà
function mLob(x0,y0,x1,y1,h,rgb,al){const d=Math.hypot(x1-x0,y1-y0),n=Math.max(4,Math.round(d/15));ctx.save();
  for(let i=1;i<n;i++){const k=i/n,x=x0+(x1-x0)*k,y=y0+(y1-y0)*k,z=4*h*k*(1-k);
    ctx.fillStyle=`rgba(16,10,6,${mA(.2*al)})`;ctx.beginPath();ctx.arc(x,y,1.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x,y-z,2.4,0,Math.PI*2);ctx.fillStyle=`rgba(${rgb},${mA(.85*al)})`;ctx.fill();ctx.strokeStyle=`rgba(16,10,6,${mA(.35*al)})`;ctx.lineWidth=1;ctx.stroke()}
  ctx.restore()}

// ================================================================== LA CLASSICA
const MC={drag:null,pend:null,faceA:0,faceT:0,ult:null,nb:false,arm:false,inU:false,blk:false,btn:null,kn:null};
const mcOk=()=>!!(MIRA.on&&started&&!paused&&!modal&&P&&G&&G.state!=='dead'&&G.state!=='trans'&&!(INTRO&&INTRO.on));
const mcRange=()=>(P.pspd||560)*(P.proj==='flask'?1.05:1.4);
// fin dove arriva un colpo partito da (x, y) verso a: il bordo della stanza (dove la freccia sparisce) o il primo ostacolo che lo ferma.
// w: 'x' o 'y' se si ferma su un muro (per il rimbalzo), null su un ostacolo o in fondo alla gittata
function mcRay(x,y,a,max){const dx=Math.cos(a),dy=Math.sin(a);let t=max,w=null;
  if(dx>1e-6&&(R-x)/dx<t){t=(R-x)/dx;w='x'}else if(dx<-1e-6&&(L-x)/dx<t){t=(L-x)/dx;w='x'}
  if(dy>1e-6&&(BOT-y)/dy<t){t=(BOT-y)/dy;w='y'}else if(dy<-1e-6&&(TOP-y)/dy<t){t=(TOP-y)/dy;w='y'}
  for(const k of G.rocks||[]){const ox=k.x-x,oy=k.y-y,b=ox*dx+oy*dy,c=ox*ox+oy*oy-k.r*k.r;if(c<=0){t=0;w=null;break}if(b<=0)continue;const q=b*b-c;if(q<0)continue;const s=b-Math.sqrt(q);if(s<t){t=s;w=null}}
  return{t:Math.max(0,t),w}}
// le righe di una raffica (volley in 11 e i suoi aggiunti): davanti più larga con le frecce in più, le diagonali, i lati, dietro, il ventaglio,
// le due stelline del Ninja
function mcLanes(a){const n=Math.max(1,P.front||1),L2=[{a,hw:Math.max(8,(n-1)*4.5+7),main:true}];
  for(let d=1;d<=(P.diag||0);d++)L2.push({a:a+.42*d,hw:3.6},{a:a-.42*d,hw:3.6});
  if(P.side)L2.push({a:a+Math.PI/2,hw:3.6},{a:a-Math.PI/2,hw:3.6});
  if(P.rear)L2.push({a:a+Math.PI,hw:3.6});
  if(P.fan)L2.push({a:a+.8,hw:4.2},{a:a-.8,hw:4.2});
  if(P.proj==='star')L2.push({a:a+.22,hw:3.4},{a:a-.22,hw:3.4});
  return L2}
const mcFlaskD=f=>60+f*(mcRange()-60);
// l'area del tiro: al di là della levetta (al 1) o del bersaglio da fermo (al leggero)
function mcDrawShot(a,f,al,tg){const x=P.x,y=P.y,rg=mcRange(),c=MRGB.tiro,live=al>.9;
  if(P.proj==='flask'){let d=f==null?(tg?Math.hypot(tg.x-x,tg.y-y):rg):mcFlaskD(f);d=Math.min(d,mcRay(x,y-6,a,d).t);const ex=x+Math.cos(a)*d,ey=y+Math.sin(a)*d;
    mLob(x,y-12,ex,ey,Math.min(54,16+d*.12),c,al);mCirc(ex,ey,44,c,al,{pulse:live});
    for(const l of mcLanes(a))if(!l.main)mLane(x,y,l.a,mcRay(x,y-6,l.a,rg).t,l.hw,c,al*.55);return}
  for(const l of mcLanes(a)){const r=mcRay(x,y-6,l.a,rg);mLane(x,y,l.a,r.t,l.hw,c,al*(l.main?1:.58),{chev:live&&l.main});
    // the bounce off the wall (P.wb): the arrow comes back with at least 0,8 s of life
    if(l.main&&P.wb>0&&r.w&&r.t<rg-1){const bx=x+Math.cos(l.a)*r.t,by=y-6+Math.sin(l.a)*r.t,b=r.w==='x'?Math.PI-l.a:-l.a,left=Math.max(rg-r.t,.8*(P.pspd||560)),r2=mcRay(bx+Math.cos(b)*.5,by+Math.sin(b)*.5,b,left);
      mLane(bx,by+6,b,r2.t,l.hw*.8,c,al*.45,{chev:live})}}}
// ------------------------------------------------------------------ la Super trascinata: il bottone diventa una levetta d'oro
// pt: un punto da scegliere (distanza d al massimo, cerchio r); dir: una direzione (striscia larga hw, esplosione boom sul muro); all: ogni
// nemico; self: un giro intorno all'eroe; shadows: le tre ombre del Ninja
const MUL={arciere:{k:'pt',d:300,r:92},alchimista:{k:'pt',d:320,r:105},balestriere:{k:'dir',hw:13,boom:70},cacciatrice:{k:'self',r:88},ninja:{k:'shadows'},druida:{k:'all'},bardo:{k:'all'}};
const mcUltOk=()=>mcOk()&&(P.ult||0)>=100;
function mcUltPt(id,a,f){const U=MUL[id],d=f*U.d;let x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;
  if(id==='alchimista'){x=clamp(x,L+40,R-40);y=clamp(y,TOP+50,BOT-30)}else{x=clamp(x,L+24,R-24);y=clamp(y,TOP+30,BOT-24)}return{x,y}}
// la Pioggia di frecce nel cerchio: prima i nemici che ci stanno dentro, poi punti a caso nel cerchio
function mcRainPts(cx,cy,r){const pts=[];for(const e of G.enemies){if(!canHit(e)||Math.hypot(e.x-cx,e.y-cy)>r+e.r*.5)continue;pts.push({x:e.x+rand(-14,14),y:e.y+rand(-10,10)});if(pts.length>=8)break}
  while(pts.length<7){const an=rand(0,Math.PI*2),q=Math.sqrt(Math.random())*r*.9;pts.push({x:cx+Math.cos(an)*q,y:cy+Math.sin(an)*q})}return pts}
function mcUltGo(a,f){const id=P.hero||'arciere',U=MUL[id]||{k:'self'};
  // the siege bolt: useUlt aims at nearest(); for this one call nearest is a point the stick's way
  if(id==='balestriere'){const _n=nearest;nearest=function(){return{x:P.x+Math.cos(a)*100,y:P.y+Math.sin(a)*100}};try{useUlt()}finally{nearest=_n}return}
  if(id==='arciere'){const n0=G.ultRain.length;useUlt();if(G.ultRain.length>n0){const c=mcUltPt(id,a,f);G.ultRain.splice(n0);for(let w=0;w<3;w++)for(const p of mcRainPts(c.x,c.y,U.r))G.ultRain.push({x:p.x,y:p.y,t:-(w*.4+rand(0,.15)),dur:.42})}return}
  if(id==='alchimista'){useUlt();if(G.cauld&&!G.cauld.done){const c=mcUltPt(id,a,f);G.cauld.x=c.x;G.cauld.y=c.y}return}
  if(id==='cacciatrice'){useUlt();if(P.spin>0)P.spinA=a;return}
  useUlt()}
function mcDrawUlt(a,f){const id=P.hero||'arciere',U=MUL[id]||{k:'self',r:80},c=MRGB.sup,x=P.x,y=P.y;
  if(U.k==='pt'){const p=mcUltPt(id,a,f);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(c,p.x,p.y,U.r*1.1,.22);ctx.restore()}
    if(id==='alchimista')mLob(x,y-14,p.x,p.y,Math.min(96,34+Math.hypot(p.x-x,p.y-y)*.2),c,.95);else mDots(x,y,p.x,p.y,c,.85);
    mCirc(p.x,p.y,U.r,c,1,{pulse:1,fill:.2});
    // the rain: little arrows standing in the circle
    if(id==='arciere'){ctx.save();ctx.strokeStyle=`rgba(${c},.8)`;ctx.lineWidth=2;ctx.lineCap='round';for(let i=0;i<7;i++){const an=i*2.4+.5,q=U.r*(.2+.6*((i*.37)%1)),ax=p.x+Math.cos(an)*q,ay=p.y+Math.sin(an)*q;ctx.beginPath();ctx.moveTo(ax,ay-9);ctx.lineTo(ax,ay);ctx.moveTo(ax-2.6,ay-3);ctx.lineTo(ax,ay);ctx.lineTo(ax+2.6,ay-3);ctx.stroke()}ctx.restore()}}
  else if(U.k==='dir'){const r=mcRay(x,y-8,a,2000);mLane(x,y,a,r.t,U.hw,c,1,{chev:1});mCirc(x+Math.cos(a)*r.t,y+Math.sin(a)*r.t,U.boom,c,.85,{pulse:1})}
  else if(U.k==='all'){for(const e of G.enemies)if(canHit(e))mRing(e.x,e.y,e.r+7,c,1);mCirc(x,y,30,c,.6)}
  else if(U.k==='shadows'){ctx.save();ctx.translate(x,y);ctx.scale(1,26/42);mCirc(0,0,42,c,1,{fill:.12});ctx.restore();
    for(let i=0;i<3;i++){const s=P.face+Math.PI/2+i/3*Math.PI*2;mRing(x+Math.cos(s)*42,y+Math.sin(s)*26,7,c,.9)}}
  else mCirc(x,y,U.r||80,c,1,{pulse:1})}
// ------------------------------------------------------------------ la levetta del tiro (accanto allo Scatto)
function mcUI(){if(MC.btn||typeof $!=='function'||!$('ultBtn'))return;const b=document.createElement('button');b.id='aimBtn';b.setAttribute('aria-label','Mira e tira');
  b.innerHTML=`<i class="kn">${MSVG}</i><span>MIRA</span>`;$('ultBtn').after(b);MC.btn=b;MC.kn=b.querySelector('.kn');
  const st=document.createElement('style');st.textContent=`
  #aimBtn{position:absolute;right:102px;bottom:20px;width:68px;height:68px;border-radius:50%;border:3px solid var(--ink);padding:0;cursor:pointer;touch-action:none;
    background:radial-gradient(circle at 50% 36%,#5e564b,#2b2521 70%);box-shadow:0 4px 0 var(--ink),inset 0 0 0 2px rgba(255,240,210,.2);opacity:.84;-webkit-tap-highlight-color:transparent;transition:opacity .2s,box-shadow .2s}
  #aimBtn .kn{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#fffaf0,#e0d0a8);border:2.5px solid var(--ink);box-shadow:0 2px 0 var(--ink);pointer-events:none}
  #aimBtn .kn svg{display:block;width:100%;height:100%}
  #aimBtn span{position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);font-family:var(--display);font-size:10px;line-height:12px;color:var(--ink);background:var(--parch);border:2px solid var(--ink);border-radius:999px;padding:0 5px;pointer-events:none}
  #aimBtn.on{opacity:1;box-shadow:0 4px 0 var(--ink),inset 0 0 0 2px rgba(255,240,210,.55),0 0 16px 2px rgba(255,236,190,.5)}
  #ultBtn.aim{opacity:1;box-shadow:0 3px 0 var(--ink),0 0 20px 5px var(--uc,#ffcc54)}
  #wrap.lefty #aimBtn{right:auto;left:102px}
  .inmenu #aimBtn,.intro #aimBtn{display:none!important}`;document.head.appendChild(st);
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{initAudio()}catch(_){}if(!mcOk()||MC.drag)return;
    MC.drag=mTrack(e,b,{move:s=>{mKnob(MC.kn,s);b.classList.toggle('on',s.live)},end:s=>{MC.drag=null;mKnob(MC.kn,null);b.classList.remove('on');if(!s.cancel&&mcOk())MC.pend={a:s.tap?null:Math.atan2(s.dy,s.dx),f:s.f,t:0,auto:s.tap}}})})}
mcUI();
// the Super's button: its own listener (04) would use it at the touch; here, in capture, the finger is taken first when the Super is ready
addEventListener('pointerdown',e=>{if(!MIRA.on)return;const b=e.target&&e.target.closest?e.target.closest('#ultBtn'):null;if(!b||!mcUltOk())return;
  e.stopPropagation();e.preventDefault();try{initAudio()}catch(_){}if(MC.ult)return;const kn=b.querySelector('svg');
  MC.ult=mTrack(e,b,{move:s=>{mKnob(kn,s);b.classList.toggle('aim',s.live)},end:s=>{MC.ult=null;mKnob(kn,null);b.classList.remove('aim');if(s.cancel||!mcUltOk())return;if(s.tap)useUlt();else mcUltGo(Math.atan2(s.dy,s.dx),s.f)}})},true);
// ------------------------------------------------------------------ nel gioco: il tiro della levetta e il tiro da solo fermo mentre si mira
// The stick's shot goes in the queue of the volleys like the automatic one (P.queue: the skill tree counts them), marked with its angle (ma);
// volley, when it finds a marked one, shoots that way. While the stick aims (or its shot waits for the bow) the automatic shot is held:
// the first nearest(P.x, P.y) after input() in update is the automatic shot's target, and for that one call there is none.
{const _in=input;input=function(){const r=_in.apply(this,arguments);if(MC.arm){MC.arm=false;MC.nb=true}return r}}
{const _ne=nearest;nearest=function(x,y,skip,maxD){if(MC.nb&&skip==null&&maxD==null&&P&&x===P.x&&y===P.y){MC.nb=false;return null}return _ne.apply(this,arguments)}}
{const _vo=volley;volley=function(a){const Q=P&&P.queue;if(!MIRA.on||!Q)return _vo.apply(this,arguments);let q=null;for(let i=Q.length-1;i>=0;i--)if(Q[i].t<=0){q=Q[i];break}
  if(!q||q.ma==null)return _vo.apply(this,arguments);
  const n0=G.arrows.length,before=new Set(Q),r=_vo.call(this,q.ma);
  // the Alchemist's flask lands where the stick said: its flight lasts as long as that distance; what the volley put in the queue
  // (the skill tree's storm) goes the same way
  if(q.md!=null)for(let i=n0;i<G.arrows.length;i++){const ar=G.arrows[i];if(ar.flask){const v=Math.hypot(ar.vx,ar.vy)||470;ar.life=Math.min(ar.life,Math.max(.08,q.md/v));ar.l0=ar.life}}
  for(const it of Q)if(!before.has(it)&&it.ma==null){it.ma=q.ma;it.md=q.md}
  return r}}
function mcFire(p,dt){let a=p.a;if(a==null){const t=nearest(P.x,P.y);a=t?Math.atan2(t.y-P.y,t.x-P.x):P.face}
  const md=P.proj==='flask'&&!p.auto?mcFlaskD(p.f):null;P.fireCd=1/P.aspd+dt;// (update takes dt off at once)
  for(let k=0;k<(P.multi||1);k++)P.queue.push({t:k*.12,ma:a,md});MC.faceA=a;MC.faceT=.32;MC.pend=null}
{const _u=update;update=function(dt){
  if(!MIRA.on||!G||!P||G.state==='trans'||G.state==='dead'||(INTRO&&INTRO.on)){if(G&&G.state==='dead')MC.pend=null;return _u.apply(this,arguments)}
  const drag=MC.drag&&MC.drag.live?MC.drag:null;
  // the stick's shot, as soon as the bow is ready (at most 0,6 s late; never in the middle of a dash or of the Danza)
  if(MC.pend){const p=MC.pend;p.t+=dt;if(p.t>.6)MC.pend=null;else if(P.dashT<=0&&!(P.spin>0)&&P.fireCd-dt<=0)mcFire(p,dt)}
  MC.blk=!!(drag||MC.pend);MC.arm=MC.blk;MC.nb=false;MC.inU=true;
  try{return _u.apply(this,arguments)}finally{MC.inU=false;MC.arm=false;MC.nb=false;MC.blk=false;
    try{if(MC.faceT>0)MC.faceT-=dt;
      // the hero turns where the stick aims (walking too, like Brawl Stars) and, standing, holds the bow drawn that way
      if(G&&P&&G.state!=='dead'&&P.dashT<=0&&!(P.spin>0)){const a=drag?Math.atan2(drag.dy,drag.dx):MC.pend&&MC.pend.a!=null?MC.pend.a:MC.faceT>0?MC.faceA:null;
        if(a!=null){P.face=a;if(!P.moving)P.aiming=true}}}catch(err){mErr(err)}}}}
// ------------------------------------------------------------------ i disegni della Classica: a terra, insieme ai segni dei nemici
// (MIRA.last: what was drawn in the last frame, for the tests)
function mcDraw(){MIRA.last=null;if(!MIRA.on||!G||!P||(INTRO&&INTRO.on)||G.state==='dead'||G.state==='trans')return;
  const U=MC.ult&&MC.ult.live?MC.ult:null;if(U){const a=Math.atan2(U.dy,U.dx);mcDrawUlt(a,U.f);MIRA.last={k:'super',a,f:U.f};return}
  const D=MC.drag&&MC.drag.live?MC.drag:null;
  if(D){const a=Math.atan2(D.dy,D.dx);mcDrawShot(a,D.f,1);MIRA.last={k:'tiro',a,f:D.f,al:1};return}
  if(MC.pend&&MC.pend.a!=null){mcDrawShot(MC.pend.a,MC.pend.f,.8);MIRA.last={k:'tiro',a:MC.pend.a,al:.8};return}
  if(P.aiming&&!P.moving&&P.dashT<=0&&!(MC.faceT>0)){const t=nearest(P.x,P.y);if(t){const a=Math.atan2(t.y-P.y,t.x-P.x);mcDrawShot(a,null,.55,t);MIRA.last={k:'tiro',a,al:.55}}}}
{const _t=drawTelegraphs;drawTelegraphs=function(){_t.apply(this,arguments);try{mcDraw()}catch(err){mErr(err)}}}
// the stick goes away with the Super's button when the hero falls
{const _hu=hudUlt;hudUlt=function(){_hu.apply(this,arguments);const b=MC.btn;if(b){const hide=!MIRA.on||!G||G.state==='dead';if(b.hidden!==hide)b.hidden=hide;if(hide&&MC.drag)b.classList.remove('on')}}}

// ================================================================== LA ZOMBIE
const MZ={drag:null,ab:null,fire:null,shots:0,faceA:0,faceT:0,btn:null,kn:null};
// le abilità che si mirano: dir una direzione, pt un punto, self intorno all'eroe; null nessuna mira (un tocco o un trascinamento le usano)
const MZAB={scatto:'dir',bomba:'pt',rintocco:'self',tagliola:'pt',adrenalina:null,benda:null};
// i colpi di una raffica delle armi automatiche quando si lascia la levetta (come un attacco di Brawl Stars)
const MZBURST={mitraglietta:5,tamburo:6,mitra:4,mitragliatrice:10,lanciafiamme:6};
const mzRgb=h=>{const n=parseInt(h.slice(1),16);return((n>>16)&255)+','+((n>>8)&255)+','+(n&255)};
// lo spostamento del dito sullo schermo → la direzione nel mondo con la telecamera di adesso (come la levetta del movimento: stickToWorld)
function mzS2W(dx,dy){const C=ZM.CAM,u=dx,v=dy/(C.SP||1);return Math.atan2(v*C.c-u*C.s,u*C.c+v*C.s)}
// fin dove arriva un colpo verso a (come fireShot: un passo ogni 5 px, le finestre e i varchi si passano, il primo muro lo ferma)
function mzRay(x,y,a,max,s0){const dx=Math.cos(a),dy=Math.sin(a);for(let s=s0==null?12:s0;s<max;s+=5){const q=ZM.hit(x+dx*s,y+dy*s,1.5);if(q&&q.bar)continue;if(q&&q.tag!=='hole')return s}return max}
const mzDir=()=>ZM.W.director;
const mzLive=()=>{const D=mzDir(),h=ZM.W.hero;return!!(MIRA.on&&D&&D.st!=='fine'&&h&&!h.dead)};
// l'aggancio nel motore (motore.js, updateBeings): dove punta l'eroe e il grilletto, o null per il tiro di sempre
function mzHook(h,tgt,g,dt){if(!mzLive())return null;
  const F=MZ.fire;if(F){if(F.a==null)F.a=tgt?Math.atan2(tgt.y-h.y,tgt.x-h.x):(h.face||0);return{a:F.a,fire:true,pose:true}}
  const d=MZ.drag&&MZ.drag.live?MZ.drag:null;if(d)return{a:mzS2W(d.dx,d.dy),fire:false,pose:true};
  if(MZ.faceT>0&&h.moving)return{a:MZ.faceA,fire:false,pose:false};// a moment turned toward the shot while walking
  return null}
if(typeof ZM!=='undefined'&&ZM.W){const W=ZM.W;W.aimHook=mzHook;const _sh=W.shotHook;W.shotHook=function(){MZ.shots++;return _sh?_sh.apply(this,arguments):false}}
function mzShoot(s){const g=ZM.gun&&ZM.gun();if(!g)return;const D=g.D,n=D.auto?(MZBURST[g.id]||4):1,T=D.auto?(D.spin||0)+n/D.rate+.45:.9;
  MZ.fire={a:s.tap?null:mzS2W(s.dx,s.dy),t:0,T,n,s0:MZ.shots}}
function mzTick(dt){const F=MZ.fire;if(F){F.t+=dt;const n=MZ.shots-F.s0;if(n>=F.n||F.t>F.T){if(F.a!=null)MZ.faceA=F.a;MZ.faceT=n>0?.3:0;MZ.fire=null}}else if(MZ.faceT>0)MZ.faceT-=dt}
// ------------------------------------------------------------------ la levetta del tiro (sopra le abilità; il cerchio della telecamera va più in alto)
function mzUI(){const ov=document.getElementById('mz');if(!ov)return;let b=document.getElementById('mzAim');
  if(!b){b=document.createElement('button');b.id='mzAim';b.setAttribute('aria-label','Mira e spara');b.innerHTML=`<i class="kn">${MSVG}</i>`;ov.appendChild(b);
    const st=document.createElement('style');st.textContent=`
    #mz #mzAim{position:absolute;right:calc(16px + env(safe-area-inset-right,0px));bottom:calc(104px + env(safe-area-inset-bottom,0px));width:76px;height:76px;padding:0;border-radius:50%;
      background:radial-gradient(circle at 50% 36%,#4c443c,#1d1815 70%);border:3px solid #000;box-shadow:0 4px 0 #000,inset 0 0 0 2px rgba(255,240,210,.16);z-index:3;touch-action:none;cursor:pointer;opacity:.86;transition:opacity .3s,box-shadow .2s;-webkit-tap-highlight-color:transparent}
    #mz #mzAim:active{transform:none;box-shadow:0 4px 0 #000,inset 0 0 0 2px rgba(255,240,210,.3)}
    #mz #mzAim .kn{position:absolute;left:50%;top:50%;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#fffaf0,#d9c9a2);border:2.5px solid #000;box-shadow:0 2px 0 #000;pointer-events:none}
    #mz #mzAim .kn svg{display:block;width:100%;height:100%}
    #mz #mzAim.on{opacity:1;box-shadow:0 4px 0 #000,inset 0 0 0 2px rgba(255,240,210,.5),0 0 16px 2px rgba(255,236,190,.5)}
    #mz #mzAim.off{opacity:0;pointer-events:none}
    #mz.game.mzaim .hint,#mz.game.mzaim.zab .hint{bottom:calc(214px + env(safe-area-inset-bottom,0px))}
    #mzAb .ab.aim{box-shadow:0 4px 0 #000,inset 0 0 0 2px var(--c),0 0 16px 3px var(--c)}`;document.head.appendChild(st);
    b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();try{initAudio()}catch(_){}if(!mzLive()||MZ.drag)return;
      MZ.drag=mTrack(e,b,{move:s=>{mKnob(MZ.kn,s);b.classList.toggle('on',s.live)},end:s=>{MZ.drag=null;mKnob(MZ.kn,null);b.classList.remove('on');if(!s.cancel&&mzLive())mzShoot(s)}})});
    for(const t of['pointerup','pointermove','click'])b.addEventListener(t,e=>e.stopPropagation())}
  MZ.btn=b;MZ.kn=b.querySelector('.kn');ov.classList.add('mzaim');ZM.W.lookY=300;
  const hint=document.getElementById('mzHint');if(hint&&!hint.dataset.mira){hint.dataset.mira='1';const fine=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
    hint.innerHTML=fine?'WASD: cammina · Q/E o trascina: gira · R/F: inclina<br>Il cerchio del tiro: trascinalo, mira e lascia':'Sinistra: cammina · Destra: trascina per girare la visuale<br>Il cerchio del tiro: trascinalo, mira e lascia'}}
function mzUIUpdate(D){const b=MZ.btn;if(!b)return;const h=ZM.W.hero,off=!MIRA.on||D.st==='fine'||!!h.dead;if(b.classList.contains('off')!==off){b.classList.toggle('off',off);if(off){MZ.fire=null;b.classList.remove('on')}}}
// ------------------------------------------------------------------ le abilità trascinate (99 chiede qui se il dito è nostro)
function mzAbAim(id,s){const W=ZM.W,h=W.hero,a=mzS2W(s.dx,s.dy);
  if(id==='scatto')return{a};
  if(id==='bomba'){const d=30+s.f*200;return{x:Math.max(4,Math.min((W.w||9999)-4,h.x+Math.cos(a)*d)),y:Math.max(4,Math.min((W.h||9999)-4,h.y+Math.sin(a)*d))}}
  if(id==='tagliola'){let d=s.f*80;d=Math.max(0,Math.min(d,mzRay(h.x,h.y,a,d+12,4)-12));return{x:h.x+Math.cos(a)*d,y:h.y+Math.sin(a)*d}}
  return null}
function aimAbDown(i,e,b){if(!MIRA.on||typeof ZABS==='undefined'||!mzLive())return false;const id=ZABS.eq[i];if(!id||ZABS.cd[i]>0||!zabCan())return false;
  const img=b.querySelector('img'),k=MZAB[id];if(MZ.ab)return true;
  MZ.ab=mTrack(e,b,{move:s=>{mKnob(img,s);b.classList.toggle('aim',s.live&&!!k)},end:s=>{MZ.ab=null;mKnob(img,null);b.classList.remove('aim');
      if(k&&s.cancel)return;if(s.tap||!k||k==='self')zabUse(i);else zabUse(i,mzAbAim(id,s))}});
  MZ.ab.id=id;MZ.ab.i=i;return true}
// ------------------------------------------------------------------ i disegni della mappa: a terra col direttore (dopo il fuoco e le tagliole)
function mzDrawGun(g,a,al){const h=ZM.W.hero,D=g.D,x=h.x,y=h.y,c=MRGB.tiro,live=al>.9;
  if(D.wave){mCirc(x,y,D.range,c,al*.9,{pulse:live});return}// the Resonator: all round
  if(D.flame){let reach=D.range;for(let s=10;s<D.range;s+=6){const q=ZM.hit(x+Math.cos(a)*s,y+Math.sin(a)*s,1.5);if(q&&q.tag!=='hole'){reach=s;break}}// as armi_speciali.js: the centre's wall
    mSector(x,y,a,reach,(D.spread/2+8)*Math.PI/180,c,al);return}
  const sp=(D.pel>1?D.spread/2:D.spread)*Math.PI/180;
  if(sp<.075){const len=mzRay(x,y,a,D.range);mLane(x,y,a,len,5.5,c,al,{chev:live});if(D.splash)mCirc(x+Math.cos(a)*len,y+Math.sin(a)*len,D.splash+8,c,al,{pulse:live});return}
  const n=sp>.17?9:5,ends=[];for(let i=0;i<n;i++){const b=a-sp+2*sp*i/(n-1),l=mzRay(x,y,b,D.range);ends.push([x+Math.cos(b)*l,y+Math.sin(b)*l])}
  mFan(x,y,a,4.5,ends,c,al,{chev:live,len:D.range})}
function mzDrawAb(dr){const h=ZM.W.hero,id=dr.id,a=mzS2W(dr.dx,dr.dy),A=ZAB_BY[id],c=mzRgb(A.col),x=h.x,y=h.y;
  if(id==='scatto'){const len=mzRay(x,y,a,96,6);mLane(x,y,a,len,8,c,1,{chev:1})}
  else if(id==='bomba'){const p=mzAbAim(id,dr);mDots(x,y,p.x,p.y,c,.6);mCirc(p.x,p.y,58,c,1,{pulse:1,fill:.2})}
  else if(id==='rintocco')mCirc(x,y,125,c,1,{pulse:1});
  else if(id==='tagliola'){const p=mzAbAim(id,dr);mDots(x,y,p.x,p.y,c,.6);mCirc(p.x,p.y,15,c,1,{fill:.3})}
  else mCirc(x,y,26,c,.8)}
// upstairs (the Locanda) the area goes up with the hero: the ground drawing moved on the screen by the height of his floor
function mzOnFloor(fn){const h=ZM.W.hero,z=h.lvz||0;if(z>0){const q0=ZM.SB(h.x,h.y,0),q1=ZM.SB(h.x,h.y,z);ctx.save();ctx.translate(q1[0]-q0[0],q1[1]-q0[1]);try{ZM.inGround(fn)}finally{ctx.restore()}}else ZM.inGround(fn)}
function mzGround(){MIRA.last=null;if(!mzLive())return;const h=ZM.W.hero,ab=MZ.ab&&MZ.ab.live?MZ.ab:null,dr=MZ.drag&&MZ.drag.live?MZ.drag:null;
  if(ab&&MZAB[ab.id]){mzOnFloor(()=>mzDrawAb(ab));MIRA.last={k:'abilita',id:ab.id};return}// an ability being aimed: only its area
  const g=ZM.gun&&ZM.gun();if(!g||h.cl||h.busy||h.unarmed)return;let a=null,al=0;
  if(dr){a=mzS2W(dr.dx,dr.dy);al=1}else if(MZ.fire&&MZ.fire.a!=null){a=MZ.fire.a;al=.8}else if(h.tgZ&&!h.moving&&h.aim!=null){a=h.aim;al=.42}
  if(a!=null){mzOnFloor(()=>mzDrawGun(g,a,al));MIRA.last={k:'tiro',a,al,gun:g.id}}}
// the bomb's flight seen standing (over everything): dots in the air, as the bottle will go
function mzTop(){if(!mzLive()||LOWFX)return;const dr=MZ.ab&&MZ.ab.live?MZ.ab:null;if(!dr||dr.id!=='bomba')return;
  const h=ZM.W.hero,p=mzAbAim('bomba',dr),c=mzRgb(ZAB_BY.bomba.col),z0=(h.zh||0)+30,n=12;ctx.save();
  for(let i=1;i<n;i++){const k=i/n,q=ZM.S(h.x+(p.x-h.x)*k,h.y+(p.y-h.y)*k,z0*(1-k)+Math.sin(k*Math.PI)*46);ctx.beginPath();ctx.arc(q[0],q[1],2.3,0,Math.PI*2);ctx.fillStyle=`rgba(${c},.85)`;ctx.fill();ctx.strokeStyle='rgba(16,10,6,.4)';ctx.lineWidth=1;ctx.stroke()}
  ctx.restore()}
// ------------------------------------------------------------------ l'aggancio alla partita (partita.js): come le abilità, avvolge il direttore
function mzInstall(D){if(!D||D.__mira)return;D.__mira=1;
  const _u=D.update;D.update=function(dt,on){_u.apply(this,arguments);try{mzTick(dt);mzUIUpdate(D)}catch(e){mErr(e)}};
  const _r=D.reset;D.reset=function(){_r.apply(this,arguments);MZ.fire=null;MZ.faceT=0;try{mzUI()}catch(e){mErr(e)}};
  const _g=D.drawGround;D.drawGround=function(){_g.apply(this,arguments);try{mzGround()}catch(e){mErr(e)}};
  const _t=D.drawTop;D.drawTop=function(){_t.apply(this,arguments);try{mzTop()}catch(e){mErr(e)}};
  try{mzUI()}catch(e){mErr(e)}}
if(typeof ZM!=='undefined'&&ZM.partita){const _p=ZM.partita;ZM.partita=function(){const D=_p.apply(this,arguments);mzInstall(D);return D};if(ZM.W.director)mzInstall(ZM.W.director)}
