// =====================================================================
// 104. LA MIRA ALLA BRAWL STARS (Denis, 1° novembre: «vorrei che aggiungessi al gioco una cosa tipo lo sparo alla brawl star che vede una
// piccola area che ti precede la gittata del tiro di quell'arma ecc.»; risposte: in tutte e due le modalità, «Automatica + levetta»,
// anche la Super e le abilità zombie, prima nell'Anteprima 49).
// - L'area del tiro, a terra davanti all'eroe, con la forma e la gittata vere del colpo. Classica: la freccia o il dardo fino al muro o
//   all'ostacolo che lo ferma (più larga con le frecce in più davanti; le righe delle diagonali, dei lati, di dietro e del ventaglio; il
//   rimbalzo sul muro), le tre stelline del Ninja, la fiala dell'Alchimista che vola a pallonetto col cerchio dove scoppia. Zombie: la
//   striscia o il cono di ogni arma fino al primo muro (le pompe e i mitra a cono, il lanciarazzi col cerchio dell'esplosione, il
//   lanciafiamme corto, il Risonatore tutto intorno), verso il bersaglio nel fascio della visuale.
// - Classica, da fermo: si spara da soli come prima; l'area, leggera, segue il bersaglio.
// - La levetta del tiro (Classica, in basso a destra accanto allo Scatto): la trascini, vedi l'area dove va il colpo, lasci e spara lì,
//   anche camminando; un tocco spara al più vicino; riportata al centro prima di lasciare non spara.
// - Zombie (Denis, 1° novembre: «la visuale e lo sparo siano insieme», «alla grandezza per ogni proiettile», «lascia il fascio largo»): si
//   spara dove guarda la visuale; davanti all'eroe il fascio largo della visuale, l'eroe spara da solo (anche camminando) agli zombie che ci
//   entrano, gli altri no; dentro, l'area del colpo grande quanto i proiettili dell'arma; la levetta del tiro qui non c'è.
// - La Super della Classica e le abilità della Zombie si trascinano allo stesso modo e mostrano dove colpiscono (il cerchio della Pioggia
//   di frecce e del Calderone, la striscia del Dardo d'assedio, i nemici presi da Ballata e Radici, il giro della Danza e delle Ombre; la
//   direzione dello Scatto, dove cade la Bomba, il raggio del Rintocco, dove si mette la Tagliola); un tocco le usa come prima.
// - Le mire (1° novembre, Denis: «fai più trasparenti e più belle le mire»): come vetro di luce (sotto, «i disegni a terra»).
// Fuori da src/ordine.txt: va nell'Anteprima 49 (anteprime/mk_anteprima49.py). Nel motore della mappa zombie ci sono agganci che senza
// questo file non fanno niente (W.aimHook con {a, fire, pose, face, idle}, h.aimP, W.lookY); in 99 il bottone delle abilità chiede ad
// aimAbDown se il dito è suo.
// Tutto rispetta LOWFX. MIRA.on = false lo spegne.
// =====================================================================
const MIRA={on:true,err:0};
const MRGB={tiro:'255,248,232',sup:'255,214,120'};
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
// della Classica, il terreno della mappa zombie dentro inGround, che li stende con la telecamera). Dal 1° novembre (Denis: «fai più trasparenti
// e più belle le mire») come vetro di luce: il pieno appena accennato che sfuma verso la fine, i bordi sottili e chiari che si spengono con
// la distanza, le punte tonde con un bagliore morbido, una luce che corre lungo la mira (non con LOWFX); niente più bordo scuro né frecce
// la luce morbida (sommata: sul buio sembra luce, sul chiaro quasi non si vede e non sporca)
function mGlow(x,y,r,rgb,a){if(a<=0||r<1)return;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(${rgb},${mA(a)})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
// una striscia: da (x, y) verso a, lunga len, mezza larghezza hw; parte un poco lontano dai piedi (o.s0), finisce tonda; o.run la luce che
// corre, o.wall la punta più chiara (si ferma su un muro o un ostacolo)
function mLane(x,y,a,len,hw,rgb,al,o){if(len<4||al<=0)return;o=o||{};const s0=Math.min(o.s0==null?10:o.s0,len*.4),L=Math.max(s0+2,len-hw*.35),cap=hw*.9;
  ctx.save();ctx.translate(x,y);ctx.rotate(a);
  const shape=()=>{ctx.beginPath();ctx.moveTo(s0,-hw);ctx.lineTo(L,-hw);ctx.bezierCurveTo(L+cap*.55,-hw,L+cap,-hw*.55,L+cap,0);ctx.bezierCurveTo(L+cap,hw*.55,L+cap*.55,hw,L,hw);
    ctx.lineTo(s0,hw);ctx.bezierCurveTo(s0-cap*.55,hw,s0-cap,hw*.55,s0-cap,0);ctx.bezierCurveTo(s0-cap,-hw*.55,s0-cap*.55,-hw,s0,-hw);ctx.closePath()};
  const g=ctx.createLinearGradient(s0,0,L+cap,0);g.addColorStop(0,`rgba(${rgb},${mA(.17*al)})`);g.addColorStop(.6,`rgba(${rgb},${mA(.1*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.05*al)})`);
  shape();ctx.fillStyle=g;ctx.fill();
  const e=ctx.createLinearGradient(s0,0,L+cap,0);e.addColorStop(0,`rgba(${rgb},${mA(.62*al)})`);e.addColorStop(1,`rgba(${rgb},${mA(.2*al)})`);
  ctx.strokeStyle=e;ctx.lineWidth=1.15;ctx.stroke();
  // the line down the middle, very faint: a sight
  if(hw>5){const c=ctx.createLinearGradient(s0,0,L,0);c.addColorStop(0,`rgba(${rgb},${mA(.32*al)})`);c.addColorStop(1,`rgba(${rgb},0)`);ctx.strokeStyle=c;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(s0+2,0);ctx.lineTo(L,0);ctx.stroke()}
  // the running light (clipped to the strip)
  if(o.run&&!LOWFX&&L-s0>30){const k=(mT()*.95+(o.ph||0))%1,px=s0+(L+cap-s0)*k,w=Math.min(54,(L-s0)*.4),r=ctx.createLinearGradient(px-w,0,px,0);
    r.addColorStop(0,`rgba(${rgb},0)`);r.addColorStop(1,`rgba(${rgb},${mA(.3*al*(1-.55*k))})`);ctx.save();shape();ctx.clip();ctx.fillStyle=r;ctx.fillRect(px-w,-hw,w,hw*2);ctx.restore()}
  ctx.restore();
  // the tip: a soft light where it ends, a little brighter on a wall
  const tx=x+Math.cos(a)*(L+cap*.3),ty=y+Math.sin(a)*(L+cap*.3);mGlow(tx,ty,hw*2.2,rgb,(o.wall?.3:.16)*al)}
// un cono fatto di raggi (ogni raggio fino al suo muro): dall'eroe, largo hw0 alla partenza, fino ai punti ends (dal lato a−sp al lato a+sp)
function mFan(x,y,a,hw0,ends,rgb,al,o){if(!ends.length||al<=0)return;o=o||{};const len=o.len||200,s0=10,c=Math.cos(a),s=Math.sin(a),px=-s*hw0,py=c*hw0,bx=x+c*s0,by=y+s*s0;ctx.save();
  const path=()=>{ctx.beginPath();ctx.moveTo(bx-px,by-py);for(const p of ends)ctx.lineTo(p[0],p[1]);ctx.lineTo(bx+px,by+py);ctx.closePath()};
  const g=ctx.createRadialGradient(x,y,s0,x,y,len);g.addColorStop(0,`rgba(${rgb},${mA(.16*al)})`);g.addColorStop(.6,`rgba(${rgb},${mA(.09*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.04*al)})`);
  path();ctx.fillStyle=g;ctx.fill();
  // the two sides, fading with the distance
  ctx.lineCap='round';for(const p of[ends[0],ends[ends.length-1]]){const e=ctx.createLinearGradient(x,y,p[0],p[1]);e.addColorStop(0,`rgba(${rgb},${mA(.55*al)})`);e.addColorStop(1,`rgba(${rgb},${mA(.14*al)})`);
    ctx.strokeStyle=e;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(bx+(p===ends[0]?-px:px),by+(p===ends[0]?-py:py));ctx.lineTo(p[0],p[1]);ctx.stroke()}
  // the far edge, where the shot stops
  ctx.beginPath();ends.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=`rgba(${rgb},${mA(.42*al)})`;ctx.lineWidth=1.3;ctx.lineJoin='round';ctx.stroke();
  // the running light: an arc going out
  if(o.run&&!LOWFX){const k=(mT()*.9)%1,rr=s0+(len-s0)*k;ctx.save();path();ctx.clip();ctx.beginPath();ctx.arc(x,y,rr,a-1.2,a+1.2);ctx.strokeStyle=`rgba(${rgb},${mA(.26*al*(1-.6*k))})`;ctx.lineWidth=7;ctx.stroke();ctx.restore()}
  ctx.restore()}
// quanto può deviare un proiettile: un cuneo appena accennato intorno alla sua striscia, dalla larghezza del colpo a quella che ha in fondo
function mSpread(x,y,a,len,hw,sp,rgb,al){if(len<8||al<=0||sp<=0)return;const s0=10,w1=hw+Math.tan(sp)*len;ctx.save();ctx.translate(x,y);ctx.rotate(a);
  const g=ctx.createLinearGradient(s0,0,len,0);g.addColorStop(0,`rgba(${rgb},${mA(.08*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.03*al)})`);
  ctx.beginPath();ctx.moveTo(s0,-hw);ctx.lineTo(len,-w1);ctx.lineTo(len,w1);ctx.lineTo(s0,hw);ctx.closePath();ctx.fillStyle=g;ctx.fill();
  if(!LOWFX){ctx.setLineDash([3,6]);ctx.strokeStyle=`rgba(${rgb},${mA(.16*al)})`;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(s0,-hw);ctx.lineTo(len,-w1);ctx.moveTo(s0,hw);ctx.lineTo(len,w1);ctx.stroke();ctx.setLineDash([])}
  ctx.restore()}
// i pallini di un fucile a pompa: il cono appena accennato dove volano e un raggio sottile per ogni pallino (fino al suo muro), con la sua
// testina di luce; o.run un arco di luce che va avanti
function mPellets(x,y,a,ends,rgb,al,o){if(!ends.length||al<=0)return;o=o||{};const s0=10,len=o.len||200,bx=x+Math.cos(a)*s0,by=y+Math.sin(a)*s0;ctx.save();
  const path=()=>{ctx.beginPath();ctx.moveTo(bx,by);for(const p of ends)ctx.lineTo(p[0],p[1]);ctx.closePath()};
  const g=ctx.createRadialGradient(x,y,s0,x,y,len);g.addColorStop(0,`rgba(${rgb},${mA(.1*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.025*al)})`);path();ctx.fillStyle=g;ctx.fill();
  ctx.lineCap='round';for(const p of ends){const b=Math.atan2(p[1]-y,p[0]-x),q0=[x+Math.cos(b)*s0,y+Math.sin(b)*s0],r=ctx.createLinearGradient(q0[0],q0[1],p[0],p[1]);
    r.addColorStop(0,`rgba(${rgb},${mA(.5*al)})`);r.addColorStop(1,`rgba(${rgb},${mA(.14*al)})`);ctx.strokeStyle=r;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();
    ctx.fillStyle=`rgba(${rgb},${mA(.5*al)})`;ctx.beginPath();ctx.arc(p[0],p[1],1.7,0,Math.PI*2);ctx.fill()}
  if(o.run&&!LOWFX){const k=(mT()*.9)%1,rr=s0+(len-s0)*k;ctx.save();path();ctx.clip();ctx.beginPath();ctx.arc(x,y,rr,a-1.2,a+1.2);ctx.strokeStyle=`rgba(${rgb},${mA(.24*al*(1-.6*k))})`;ctx.lineWidth=6;ctx.stroke();ctx.restore()}
  ctx.restore()}
// uno spicchio (il lanciafiamme): raggio r, mezza apertura half
function mSector(x,y,a,r,half,rgb,al,o){if(r<4||al<=0)return;o=o||{};ctx.save();const shape=()=>{ctx.beginPath();ctx.moveTo(x+Math.cos(a)*8,y+Math.sin(a)*8);ctx.arc(x,y,r,a-half,a+half);ctx.closePath()};
  const g=ctx.createRadialGradient(x,y,6,x,y,r);g.addColorStop(0,`rgba(${rgb},${mA(.2*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(.06*al)})`);shape();ctx.fillStyle=g;ctx.fill();
  ctx.lineJoin='round';ctx.strokeStyle=`rgba(${rgb},${mA(.42*al)})`;ctx.lineWidth=1.1;ctx.stroke();
  if(o.run&&!LOWFX){const k=(mT()*1.3)%1;ctx.save();shape();ctx.clip();ctx.beginPath();ctx.arc(x,y,8+(r-8)*k,a-half,a+half);ctx.strokeStyle=`rgba(${rgb},${mA(.3*al*(1-.6*k))})`;ctx.lineWidth=6;ctx.stroke();ctx.restore()}
  ctx.restore()}
// un cerchio: il pieno che si fa più chiaro verso l'orlo (come una lente), l'orlo sottile, un anello tratteggiato che gira piano e (o.pulse) un'onda
function mCirc(x,y,r,rgb,al,o){if(r<2||al<=0)return;o=o||{};const t=mT(),f=o.fill||.14;ctx.save();
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${mA(f*.25*al)})`);g.addColorStop(.75,`rgba(${rgb},${mA(f*.6*al)})`);g.addColorStop(1,`rgba(${rgb},${mA(f*al)})`);
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=`rgba(${rgb},${mA(.66*al)})`;ctx.lineWidth=1.3;ctx.stroke();
  if(!LOWFX&&r>14){ctx.setLineDash([5,8]);ctx.lineDashOffset=-t*9;ctx.beginPath();ctx.arc(x,y,r*.78,0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${mA(.24*al)})`;ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([])}
  if(o.pulse&&!LOWFX){const k=(t*1.2)%1;ctx.beginPath();ctx.arc(x,y,r*(.25+.75*k),0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${mA(.3*al*(1-k))})`;ctx.lineWidth=1.6;ctx.stroke()}
  ctx.restore();if(o.glow)mGlow(x,y,r*.5,rgb,.12*al)}
// il mirino su un bersaglio: un anello sottile con quattro tacche che girano piano e si stringono un poco a tempo (dentro un pieno appena)
function mRing(x,y,r,rgb,al,o){o=o||{};const t=mT(),sp=o.spin==null?.9:o.spin,rr=r*(1+(LOWFX?0:.06*Math.sin(t*5)));ctx.save();
  ctx.beginPath();ctx.arc(x,y,rr,0,Math.PI*2);ctx.fillStyle=`rgba(${rgb},${mA(.08*al)})`;ctx.fill();ctx.strokeStyle=`rgba(${rgb},${mA(.75*al)})`;ctx.lineWidth=1.3;ctx.stroke();
  ctx.lineCap='round';ctx.lineWidth=1.8;ctx.strokeStyle=`rgba(${rgb},${mA(.9*al)})`;for(let i=0;i<4;i++){const an=t*sp+i*Math.PI/2,c=Math.cos(an),s=Math.sin(an);ctx.beginPath();ctx.moveTo(x+c*(rr+2),y+s*(rr+2));ctx.lineTo(x+c*(rr+6),y+s*(rr+6));ctx.stroke()}
  ctx.restore()}
// i puntini a terra da (x0, y0) a (x1, y1)
function mDots(x0,y0,x1,y1,rgb,al){const d=Math.hypot(x1-x0,y1-y0),n=Math.floor(d/13);if(n<2)return;ctx.save();
  for(let i=1;i<n;i++){const k=i/n;ctx.fillStyle=`rgba(${rgb},${mA(.5*al*(.45+.55*k))})`;ctx.beginPath();ctx.arc(x0+(x1-x0)*k,y0+(y1-y0)*k,1.4,0,Math.PI*2);ctx.fill()}ctx.restore()}
// il pallonetto nella Classica (vista dall'alto): l'ombra a terra a puntini e la fiala in aria, più alta a metà
function mLob(x0,y0,x1,y1,h,rgb,al){const d=Math.hypot(x1-x0,y1-y0),n=Math.max(4,Math.round(d/14));ctx.save();
  for(let i=1;i<n;i++){const k=i/n,x=x0+(x1-x0)*k,y=y0+(y1-y0)*k,z=4*h*k*(1-k);
    ctx.fillStyle=`rgba(16,10,6,${mA(.1*al)})`;ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(${rgb},${mA(.62*al*(.5+.5*Math.sin(k*Math.PI)))})`;ctx.beginPath();ctx.arc(x,y-z,1.9,0,Math.PI*2);ctx.fill()}
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
// una striscia per ogni colpo della raffica, larga quanto il colpo (Denis, 1° novembre: «fai la cosa trasparente tipo alla grandezza per ogni
// proiettile»): le frecce toccano un nemico fino a 5 px dal loro centro; le note, le stelline e i dardi un poco più grossi. Le frecce in
// più davanti partono affiancate a 9 px (volley in 11): ognuna la sua striscia
const MCHW={arrow:4,bolt:4.6,note:5.4,star:5,leaf:4.6,flame:5.2,flask:5};
function mcLanes(a){const n=Math.max(1,P.front||1),hw=MCHW[P.proj]||4.5,mid=(n-1)>>1,L2=[];
  for(let i=0;i<n;i++)L2.push({a,off:(i-(n-1)/2)*9,hw,front:true,main:i===mid});
  for(let d=1;d<=(P.diag||0);d++)L2.push({a:a+.42*d,off:0,hw},{a:a-.42*d,off:0,hw});
  if(P.side)L2.push({a:a+Math.PI/2,off:0,hw},{a:a-Math.PI/2,off:0,hw});
  if(P.rear)L2.push({a:a+Math.PI,off:0,hw});
  if(P.fan)L2.push({a:a+.8,off:0,hw},{a:a-.8,off:0,hw});
  if(P.proj==='star')L2.push({a:a+.22,off:0,hw},{a:a-.22,off:0,hw});
  return L2}
const mcFlaskD=f=>60+f*(mcRange()-60);
// l'area del tiro: al di là della levetta (al 1) o del bersaglio da fermo (al leggero)
function mcDrawShot(a,f,al,tg){const x=P.x,y=P.y,rg=mcRange(),c=MRGB.tiro,live=al>.9;
  if(P.proj==='flask'){let d=f==null?(tg?Math.hypot(tg.x-x,tg.y-y):rg):mcFlaskD(f);d=Math.min(d,mcRay(x,y-6,a,d).t);const ex=x+Math.cos(a)*d,ey=y+Math.sin(a)*d;
    mLob(x,y-12,ex,ey,Math.min(54,16+d*.12),c,al);mCirc(ex,ey,44,c,al,{pulse:live,glow:live});
    for(const l of mcLanes(a))if(!l.front)mLane(x,y,l.a,mcRay(x,y-6,l.a,rg).t,l.hw,c,al*.55);return}
  for(const l of mcLanes(a)){const ox=-Math.sin(l.a)*l.off,oy=Math.cos(l.a)*l.off,r=mcRay(x+ox,y-6+oy,l.a,rg);
    mLane(x+ox,y+oy,l.a,r.t,l.hw,c,al*(l.front?1:.6),{run:live&&l.main,wall:r.t<rg-1});
    // the bounce off the wall (P.wb): the arrow comes back with at least 0,8 s of life
    if(l.main&&P.wb>0&&r.w&&r.t<rg-1){const bx=x+ox+Math.cos(l.a)*r.t,by=y-6+oy+Math.sin(l.a)*r.t,b=r.w==='x'?Math.PI-l.a:-l.a,left=Math.max(rg-r.t,.8*(P.pspd||560)),r2=mcRay(bx+Math.cos(b)*.5,by+Math.sin(b)*.5,b,left);
      mLane(bx,by+6,b,r2.t,l.hw,c,al*.45,{run:live,s0:0})}}}
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
  if(U.k==='pt'){const p=mcUltPt(id,a,f);if(!LOWFX)mGlow(p.x,p.y,U.r*1.05,c,.14);
    if(id==='alchimista')mLob(x,y-14,p.x,p.y,Math.min(96,34+Math.hypot(p.x-x,p.y-y)*.2),c,.95);else mDots(x,y,p.x,p.y,c,.85);
    mCirc(p.x,p.y,U.r,c,1,{pulse:1,fill:.16});
    // the rain: little arrows standing in the circle
    if(id==='arciere'){ctx.save();ctx.strokeStyle=`rgba(${c},.55)`;ctx.lineWidth=1.5;ctx.lineCap='round';for(let i=0;i<7;i++){const an=i*2.4+.5,q=U.r*(.2+.6*((i*.37)%1)),ax=p.x+Math.cos(an)*q,ay=p.y+Math.sin(an)*q;ctx.beginPath();ctx.moveTo(ax,ay-9);ctx.lineTo(ax,ay);ctx.moveTo(ax-2.6,ay-3);ctx.lineTo(ax,ay);ctx.lineTo(ax+2.6,ay-3);ctx.stroke()}ctx.restore()}}
  else if(U.k==='dir'){const r=mcRay(x,y-8,a,2000);mLane(x,y,a,r.t,U.hw,c,1,{run:1,wall:1});mCirc(x+Math.cos(a)*r.t,y+Math.sin(a)*r.t,U.boom,c,.85,{pulse:1,glow:1})}
  else if(U.k==='all'){for(const e of G.enemies)if(canHit(e))mRing(e.x,e.y,e.r+6,c,1);mCirc(x,y,30,c,.6,{glow:1})}
  else if(U.k==='shadows'){ctx.save();ctx.translate(x,y);ctx.scale(1,26/42);mCirc(0,0,42,c,1,{fill:.12});ctx.restore();
    for(let i=0;i<3;i++){const s=P.face+Math.PI/2+i/3*Math.PI*2;mRing(x+Math.cos(s)*42,y+Math.sin(s)*26,7,c,.9,{spin:0})}}
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

// ================================================================== LA ZOMBIE: si spara dove guarda la visuale
// (Denis, 1° novembre: «sulla modalità zombie voglio che la visuale e lo sparo siano insieme cioè, se non guardo da quella direzione
// muovendo la visuale il pg non spara»; poi «fai la cosa trasparente tipo alla grandezza per ogni proiettile» e «si ma lascia il fascio
// largo»). Davanti all'eroe, verso la cima dello schermo (la direzione della visuale: −π/2 − ψ nel mondo), c'è il fascio della visuale, una
// luce fredda e leggera che si ferma ai muri (aperto ±22°, ±30° per le armi corte e il Risonatore; lungo quanto arriva l'arma, al massimo
// 380): l'eroe spara da solo, anche camminando, al primo zombie che ci entra e si vede (niente muri in mezzo), e lo segue finché ci resta;
// quelli fuori dal fascio non li colpisce: per sparargli si gira la visuale col dito a destra (o Q/E). Dentro il fascio l'area del colpo
// dell'arma in mano, grande quanto i suoi proiettili: la striscia del proiettile (sottile per la pistola, più grossa per il revolver, il chiodo
// e il razzo) col cuneo appena accennato di quanto può deviare, un raggio per ogni pallino delle pompe, la fiamma del lanciafiamme, l'onda
// del Risonatore tutto intorno; senza bersaglio dritta davanti e leggera, col bersaglio girata verso di lui, più chiara, col mirino rosso ai
// suoi piedi. Senza nessuno nel fascio l'eroe guarda dove guarda la visuale (camminando, dove cammina) e ricarica da solo. La levetta del tiro
// della Zombie non c'è più (il cerchio della telecamera torna al suo posto); le abilità si trascinano come prima.
const MZ={ab:null,shots:0,tg:null,pt:0,lk:0,fwd:0,V:null,doff:null,ray:null};
const MZV={half:22*Math.PI/180,wide:30*Math.PI/180,rmax:380};
const MZC={vista:'196,222,255',tiro:'236,243,255',bers:'255,132,108'};
// le abilità che si mirano: dir una direzione, pt un punto, self intorno all'eroe; null nessuna mira (un tocco o un trascinamento le usano)
const MZAB={scatto:'dir',bomba:'pt',rintocco:'self',tagliola:'pt',adrenalina:null,benda:null};
const mzRgb=h=>{const n=parseInt(h.slice(1),16);return((n>>16)&255)+','+((n>>8)&255)+','+(n&255)};
// lo spostamento del dito sullo schermo → la direzione nel mondo con la telecamera di adesso (come la levetta del movimento: stickToWorld)
function mzS2W(dx,dy){const C=ZM.CAM,u=dx,v=dy/(C.SP||1);return Math.atan2(v*C.c-u*C.s,u*C.c+v*C.s)}
// fin dove arriva un colpo verso a (come fireShot: un passo ogni 5 px, le finestre e i varchi si passano, il primo muro lo ferma)
function mzRay(x,y,a,max,s0){const dx=Math.cos(a),dy=Math.sin(a);for(let s=s0==null?12:s0;s<max;s+=5){const q=ZM.hit(x+dx*s,y+dy*s,1.5);if(q&&q.bar)continue;if(q&&q.tag!=='hole')return s}return max}
const mzDir=()=>ZM.W.director;
const mzLive=()=>{const D=mzDir(),h=ZM.W.hero;return!!(MIRA.on&&D&&D.st!=='fine'&&h&&!h.dead)};
// la direzione della visuale nel mondo (la cima dello schermo)
const mzFwd=()=>-Math.PI/2-ZM.CAM.yaw;
const mzWr=a=>Math.atan2(Math.sin(a),Math.cos(a));
const mzDA=(a,b)=>Math.abs(mzWr(a-b));
// il proiettile dell'arma in mano: che area fa (lane la striscia di un proiettile, fan i pallini, flame la fiamma, wave l'onda tutto
// intorno), quanto è grosso (hw, mezza larghezza in px, dal suo colpo: ARMI.DATI.colpo) e quanto può deviare (sp, radianti: per un colpo
// solo fino a spread°, per i pallini ±spread/2 come in disegno_armi.js), fin dove arriva (al massimo 380, lo schermo), l'esplosione del razzo
const MZHW={p9:2.6,p44:3.4,smg:2.4,rif:2.8,lmg:3.2,pal:1.8,razzo:5,chiodo:3.2};
function mzView(g){const D=g.D,kind=D.wave?'wave':D.flame?'flame':D.pel>1?'fan':'lane',deg=kind==='flame'?D.spread/2+8:D.pel>1?D.spread/2:D.spread;
  return{kind,r:Math.min(D.range,MZV.rmax),sp:deg*Math.PI/180,hw:MZHW[D.colpo]||2.8,pel:D.pel||1,splash:D.splash||0,half:D.range<200||D.wave?MZV.wide:MZV.half}}
// dentro il fascio della visuale (conti veloci: distanza e angolo; lo zombie conta col suo corpo, un poco più del suo centro)
function mzIn(h,z,f,V){if(!z||z.die||z.idle||!(z.rise>=1)||!ZM.sameLv(z)||!ZM.W.Z.includes(z))return false;const dx=z.x-h.x,dy=z.y-h.y,d=Math.hypot(dx,dy),b=10*(z.sc||1);
  if(d>V.r+b)return false;return mzDA(Math.atan2(dy,dx),f)<=V.half+Math.atan2(b,Math.max(d,1))}
// si vede: niente muri, recinti, lapidi o casse in mezzo (come il bersaglio del motore)
const mzSeen=(h,z)=>ZM.physClear(h.x,h.y,z.x,z.y,1.5,ZM.hit(z.x,z.y,2),1);
function mzPick(h,f,V){const c=[];for(const z of ZM.W.Z)if(mzIn(h,z,f,V))c.push([Math.hypot(z.x-h.x,z.y-h.y),z]);c.sort((p,q)=>p[0]-q[0]);for(const[,z] of c)if(mzSeen(h,z))return z;return null}
// l'aggancio nel motore (motore.js, updateBeings): il bersaglio nel fascio (lo stesso finché ci resta e si vede, altrimenti il più vicino;
// controllato ogni 0,1 s come il bersaglio del motore) e il grilletto; senza bersaglio l'arma guarda la visuale
function mzHook(h,tgt,g,dt){if(!mzLive()||!g)return null;const f=mzFwd(),V=mzView(g);MZ.fwd=f;MZ.V=V;
  MZ.pt-=dt;let z=MZ.tg;if(!mzIn(h,z,f,V))z=null;
  if(MZ.pt<=0){MZ.pt=.1;z=z&&mzSeen(h,z)?z:mzPick(h,f,V)}
  MZ.tg=z;
  // the area drawn turns toward the target smoothly (its angle from the view, so turning the view never makes it lag)
  const off=z?mzWr(Math.atan2(z.y-h.y,z.x-h.x)-f):0;MZ.doff=MZ.doff==null?off:MZ.doff+mzWr(off-MZ.doff)*Math.min(1,dt*22);
  if(z){MZ.lk=Math.min(1,MZ.lk+dt*7);return{a:Math.atan2(z.y-h.y,z.x-h.x),fire:true,pose:true,idle:false}}
  MZ.lk=Math.max(0,MZ.lk-dt*4);return{a:f,fire:false,pose:false,face:!h.moving,idle:true}}
if(typeof ZM!=='undefined'&&ZM.W){const W=ZM.W;W.aimHook=mzHook;const _sh=W.shotHook;W.shotHook=function(){MZ.shots++;return _sh?_sh.apply(this,arguments):false}}
// ------------------------------------------------------------------ la partita: niente levetta del tiro, la riga d'aiuto nuova
function mzUI(){const ov=document.getElementById('mz');if(!ov)return;const old=document.getElementById('mzAim');if(old)old.remove();ov.classList.remove('mzaim');delete ZM.W.lookY;
  if(!document.getElementById('mzAimCss')){const st=document.createElement('style');st.id='mzAimCss';st.textContent=`#mzAb .ab.aim{box-shadow:0 4px 0 #000,inset 0 0 0 2px var(--c),0 0 16px 3px var(--c)}`;document.head.appendChild(st)}
  const hint=document.getElementById('mzHint');if(hint&&!hint.dataset.mira){hint.dataset.mira='1';const fine=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
    hint.innerHTML=fine?'WASD: cammina · Q/E o trascina: gira la visuale · R/F: inclina<br>Spari dove guardi: gira la visuale verso gli zombie':'Sinistra: cammina · Destra: gira la visuale<br>Spari dove guardi: gira la visuale verso gli zombie'}}
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
// il fascio della visuale: i raggi dall'eroe verso la visuale (ognuno fino al suo muro), rifatti solo quando l'eroe o la visuale si muovono
function mzBeam(h,f,V){const n=LOWFX?7:11,R=MZ.ray,k=Math.round(h.x)+','+Math.round(h.y)+','+f.toFixed(3)+','+V.r+','+V.half.toFixed(3)+','+n+','+(h.lv||0);
  if(R&&R.k===k&&mT()-R.t<.3)return R.e;
  const e=[];for(let i=0;i<n;i++){const b=f-V.half+2*V.half*i/(n-1),l=mzRay(h.x,h.y,b,V.r,8);e.push([h.x+Math.cos(b)*l,h.y+Math.sin(b)*l])}MZ.ray={k,e,t:mT()};return e}
function mzDrawBeam(h,f,V,lk){const e=mzBeam(h,f,V),x=h.x,y=h.y,c=MZC.vista,a=.8+.2*lk,s0=12,n=e.length,bx=x+Math.cos(f)*s0,by=y+Math.sin(f)*s0;
  ctx.save();ctx.globalCompositeOperation='lighter';
  const fill=(pts,al)=>{const g=ctx.createRadialGradient(x,y,s0,x,y,V.r);g.addColorStop(0,`rgba(${c},${mA(al*a)})`);g.addColorStop(.5,`rgba(${c},${mA(al*.45*a)})`);g.addColorStop(1,`rgba(${c},0)`);
    ctx.beginPath();ctx.moveTo(bx,by);for(const p of pts)ctx.lineTo(p[0],p[1]);ctx.closePath();ctx.fillStyle=g;ctx.fill()};
  fill(e,.1);fill(e.slice(Math.floor(n/4),n-Math.floor(n/4)),.07);// the middle a little brighter: soft sides
  // the two sides, a faint line that goes out into the dark
  ctx.lineCap='round';for(const p of[e[0],e[n-1]]){const g=ctx.createLinearGradient(bx,by,p[0],p[1]);g.addColorStop(0,`rgba(${c},${mA(.4*a)})`);g.addColorStop(1,`rgba(${c},${mA(.05*a)})`);
    ctx.strokeStyle=g;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(p[0],p[1]);ctx.stroke()}
  // the far edge, dotted: how far the gun reaches (or the wall)
  if(!LOWFX){ctx.setLineDash([2,7]);ctx.lineDashOffset=-mT()*6;ctx.beginPath();e.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=`rgba(${c},${mA(.22*a)})`;ctx.lineWidth=1.2;ctx.stroke();ctx.setLineDash([])}
  ctx.restore()}
// l'area del colpo verso a (al la trasparenza, d dove sta il bersaglio per l'esplosione del razzo, lock col bersaglio: la luce che corre)
function mzDrawShot(g,a,al,d,lock,c){const h=ZM.W.hero,D=g.D,V=mzView(g),x=h.x,y=h.y;
  if(V.kind==='wave'){mCirc(x,y,D.range,c,al*.8,{pulse:lock});return}// the Resonator: all round
  if(V.kind==='flame'){let reach=D.range;for(let s=10;s<D.range;s+=6){const q=ZM.hit(x+Math.cos(a)*s,y+Math.sin(a)*s,1.5);if(q&&q.tag!=='hole'){reach=s;break}}// as armi_speciali.js: the centre's wall
    mSector(x,y,a,reach,V.sp,c,al,{run:lock});return}
  if(V.kind==='fan'){const n=V.pel,ends=[];for(let i=0;i<n;i++){const b=a-V.sp+2*V.sp*i/(n-1),l=mzRay(x,y,b,V.r);ends.push([x+Math.cos(b)*l,y+Math.sin(b)*l])}
    mPellets(x,y,a,ends,c,al,{run:lock,len:V.r});return}
  // one projectile: its strip as wide as it is, and around it, barely there, how far it may stray
  const len=mzRay(x,y,a,V.r);mSpread(x,y,a,len,V.hw,V.sp,c,al);mLane(x,y,a,len,V.hw,c,al,{run:lock,wall:len<V.r-1,s0:12});
  if(V.splash){const k=Math.min(len,d||len);mCirc(x+Math.cos(a)*k,y+Math.sin(a)*k,V.splash+8,c,al,{pulse:lock})}}
function mzDrawAb(dr){const h=ZM.W.hero,id=dr.id,a=mzS2W(dr.dx,dr.dy),A=ZAB_BY[id],c=mzRgb(A.col),x=h.x,y=h.y;
  if(id==='scatto'){const len=mzRay(x,y,a,96,6);mLane(x,y,a,len,8,c,1,{run:1,wall:len<95})}
  else if(id==='bomba'){const p=mzAbAim(id,dr);mDots(x,y,p.x,p.y,c,.7);mCirc(p.x,p.y,58,c,1,{pulse:1,fill:.16,glow:1})}
  else if(id==='rintocco')mCirc(x,y,125,c,1,{pulse:1,glow:1});
  else if(id==='tagliola'){const p=mzAbAim(id,dr);mDots(x,y,p.x,p.y,c,.7);mCirc(p.x,p.y,15,c,1,{fill:.24,glow:1})}
  else mCirc(x,y,26,c,.8)}
// upstairs (the Locanda) the area goes up with the hero: the ground drawing moved on the screen by the height of his floor
function mzOnFloor(fn){const h=ZM.W.hero,z=h.lvz||0;if(z>0){const q0=ZM.SB(h.x,h.y,0),q1=ZM.SB(h.x,h.y,z);ctx.save();ctx.translate(q1[0]-q0[0],q1[1]-q0[1]);try{ZM.inGround(fn)}finally{ctx.restore()}}else ZM.inGround(fn)}
// (MIRA.last: cosa è stato disegnato in questo fotogramma, per le prove)
function mzGround(){MIRA.last=null;if(!mzLive())return;const h=ZM.W.hero,ab=MZ.ab&&MZ.ab.live?MZ.ab:null;
  if(ab&&MZAB[ab.id]){mzOnFloor(()=>mzDrawAb(ab));MIRA.last={k:'abilita',id:ab.id};return}// an ability being aimed: only its area
  const g=ZM.gun&&ZM.gun();if(!g||h.cl||h.busy||h.unarmed)return;const f=MZ.fwd,V=MZ.V||mzView(g),z=MZ.tg&&mzIn(h,MZ.tg,f,V)?MZ.tg:null,a=f+(MZ.doff||0);
  // the wide beam of the view (where the hero shoots); inside it the area of the shot: without a target ahead, lighter; with one, brighter
  // toward him and the sight at his feet
  mzOnFloor(()=>{mzDrawBeam(h,f,V,MZ.lk);mzDrawShot(g,a,.45+.55*MZ.lk,z?Math.hypot(z.x-h.x,z.y-h.y):null,!!z,z?MZC.tiro:MZC.vista);
    if(z)mRing(z.x,z.y,13*(z.sc||1),MZC.bers,.55+.45*MZ.lk)});
  MIRA.last=z?{k:'tiro',a:Math.atan2(z.y-h.y,z.x-h.x),gun:g.id,lock:true}:{k:'vista',a:f,gun:g.id,lock:false}}
// the bomb's flight seen standing (over everything): dots in the air, as the bottle will go
function mzTop(){if(!mzLive()||LOWFX)return;const dr=MZ.ab&&MZ.ab.live?MZ.ab:null;if(!dr||dr.id!=='bomba')return;
  const h=ZM.W.hero,p=mzAbAim('bomba',dr),c=mzRgb(ZAB_BY.bomba.col),z0=(h.zh||0)+30,n=12;ctx.save();
  for(let i=1;i<n;i++){const k=i/n,q=ZM.S(h.x+(p.x-h.x)*k,h.y+(p.y-h.y)*k,z0*(1-k)+Math.sin(k*Math.PI)*46);ctx.beginPath();ctx.arc(q[0],q[1],1.9,0,Math.PI*2);ctx.fillStyle=`rgba(${c},${mA(.4+.4*Math.sin(k*Math.PI))})`;ctx.fill()}
  ctx.restore()}
// ------------------------------------------------------------------ l'aggancio alla partita (partita.js): come le abilità, avvolge il direttore
function mzInstall(D){if(!D||D.__mira)return;D.__mira=1;
  const _r=D.reset;D.reset=function(){_r.apply(this,arguments);MZ.tg=null;MZ.lk=0;MZ.doff=null;MZ.ray=null;try{mzUI()}catch(e){mErr(e)}};
  const _g=D.drawGround;D.drawGround=function(){_g.apply(this,arguments);try{mzGround()}catch(e){mErr(e)}};
  const _t=D.drawTop;D.drawTop=function(){_t.apply(this,arguments);try{mzTop()}catch(e){mErr(e)}};
  try{mzUI()}catch(e){mErr(e)}}
if(typeof ZM!=='undefined'&&ZM.partita){const _p=ZM.partita;ZM.partita=function(){const D=_p.apply(this,arguments);mzInstall(D);return D};if(ZM.W.director)mzInstall(ZM.W.director)}
