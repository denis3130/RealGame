// ---------- MOTORE della mappa zombie (anteprime/zombie/mk.py lo incolla in una copia del gioco insieme a mostri, armi, prop e area)
// Telecamera dritta dall'alto come nel gioco (lo schermo è x, y − z): il terreno è una foto piatta, ma tutto ciò che è alto è un volume 3D
// che si piega via dall'eroe, vertice per vertice, come nei Pokémon Bianco e Nero: più una cosa è alta e lontana dal centro, più si vede
// il fianco rivolto verso l'eroe. Ogni faccia ha una texture dipinta una volta sola (tre toni, segni del materiale, ombra ai piedi, luce
// in cima) e viene appoggiata sul quadrilatero proiettato (due triangoli affini: esatto anche quando il quadrilatero non è un
// parallelogramma); le facce che guardano dall'altra parte non si disegnano (verso di percorrenza dei vertici). Contorno scuro spesso
// intorno a ogni solido, come i mostri. Il terreno con le ombre è cotto in un'immagine; luci, nebbia, corvi, zombie ed eroe sono dal vivo.
// Le API per chi scrive i prop stanno in ZM (vedi anteprime/zombie/LEGGIMI.md).
const ZM=(()=>{
const R0=CR._rig,{TAU,cl,ez,lerp,mix,ball,seg}=R0,wa=R0.wa;
const T=64;                                   // una casella
// la telecamera (Denis, 12 ottobre: «girare e inclinare»). x, y: il perno sul terreno (l'eroe; i test possono fissarlo dove vogliono), z: zoom,
// lx, ly: quanto si piegano le cose alte. yaw ψ: 0 = si guarda verso nord come prima; cresce quando la telecamera gira a sinistra (sullo
// schermo il mondo gira in senso orario). el θ: 45° = come prima; più grande = più dall'alto. oy: di quanto il perno sta sotto il centro dello
// schermo (24·CP con l'eroe). c, s, SP, CP, cy, rot si ricavano una volta per fotogramma in camDerive (S li legge migliaia di volte):
// lo schermo mostra il terreno come (u, v·SP) con u = dx·c − dy·s, v = dx·s + dy·c, e l'altezza z come −z·CP; cy = y del centro dello schermo
const CAM={x:0,y:0,z:1,lx:.003,ly:.0002,yaw:0,el:Math.PI/4,oy:0,c:1,s:0,SP:1,CP:1,cy:0,rot:false};
const DEG=Math.PI/180,EL0=Math.PI/4,ELMIN=35*DEG,ELMAX=62*DEG,ELRUB=4*DEG,wrapA=a=>a-TAU*Math.round(a/TAU);
// da dove viene la luna: MOON nel mondo (ovest, un po' a sud), LS sullo schermo (gira con la telecamera; prop.js lo legge per riferimento)
const LS0=(()=>{const l=Math.hypot(-.78,.22);return[-.78/l,.22/l]})(),MOON=LS0.slice(),LS=LS0.slice();
// quanto si schiacciano e si abbassano i personaggi con l'inclinazione: più morbido del mondo (kr=√SP, zk=CP^¼, piano §4), così a 62° la
// tesa e l'elmetto non coprono gli occhi. I fogli dei mostri (CR.cam) e il rig dell'eroe (RIGCAM) li ricevono se ci sono. hzk e mzk sono
// l'abbassamento davvero usato dall'eroe e dai mostri: 1 finché il loro rig non sa ancora inclinarsi (prima della fase 2), così il riquadro
// della sagoma, la partenza del colpo e la discesa nella buca restano della misura della figura disegnata
const RIGK={kr:1,zk:1,hzk:1,mzk:1};
function camRig(){const kr=CAM.SP===1?1:Math.sqrt(CAM.SP),zk=CAM.CP===1?1:Math.pow(CAM.CP,.25),hasM=!!(window.CR&&CR.cam),hasH=typeof RIGCAM!=='undefined';
  RIGK.kr=kr;RIGK.zk=zk;RIGK.mzk=hasM?zk:1;RIGK.hzk=hasH?zk:1;
  if(hasM)Object.assign(CR.cam,{k:kr===1?.55:.55*kr,zk});if(hasH){RIGCAM.kr=kr;RIGCAM.zk=zk}}
// la vista dritta (ψ=0, θ=45°) usa la strada di prima, identica al pixel: c, s, SP, CP valgono esattamente 1, 0, 1, 1 (√2·cos 45° fa
// 1,0000000000000002: senza l'arrotondamento la mappa a 45° non sarebbe uguale a prima)
function camDerive(){CAM.cy=CAM.y-CAM.oy;CAM.rot=Math.abs(wrapA(CAM.yaw))>1e-5||Math.abs(CAM.el-EL0)>1e-5;
  if(!CAM.rot){CAM.c=1;CAM.s=0;CAM.SP=1;CAM.CP=1;LS[0]=LS0[0];LS[1]=LS0[1]}
  else{const snap=v=>Math.abs(v-1)<1e-9?1:v;CAM.c=Math.cos(CAM.yaw);CAM.s=Math.sin(CAM.yaw);CAM.SP=snap(Math.SQRT2*Math.sin(CAM.el));CAM.CP=snap(Math.SQRT2*Math.cos(CAM.el));
    const u=MOON[0]*CAM.c-MOON[1]*CAM.s,v=(MOON[0]*CAM.s+MOON[1]*CAM.c)*CAM.SP,l=Math.hypot(u,v)||1;LS[0]=u/l;LS[1]=v/l}
  camRig()}
// la levetta è relativa allo schermo: spinta verso destra, l'eroe va a destra sullo schermo comunque sia girata e inclinata la telecamera.
// Si toglie SP (così la direzione sullo schermo è quella del pollice anche a 35° o 62°), si gira di −ψ e si rimette la lunghezza della spinta
function stickToWorld(ix,iy){const m=Math.hypot(ix,iy);if(m<1e-6)return[0,0];const u=ix,v=iy/CAM.SP,k=m/Math.hypot(u,v);return[(u*CAM.c+v*CAM.s)*k,(v*CAM.c-u*CAM.s)*k]}
// una direzione del mondo a (radianti) com'è sullo schermo: serve ai personaggi disegnati in 8 direzioni e all'arma (a 45° è a+ψ)
const scrAng=a=>Math.atan2(CAM.SP*Math.sin(a+CAM.yaw),Math.cos(a+CAM.yaw));
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646},rr=(a,b)=>a+(b-a)*rnd(),srand=s=>{seed=s||1};
// un seme proprio per ogni texture e ogni pannello, preso dal suo nome: i segni a caso non dipendono più dall'ordine in cui le texture
// vengono create (prima il seme era condiviso con fumo e foglie, e due caricamenti della stessa pagina davano disegni diversi)
const hashS=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>1)%2147483646+1};
// ------------------------------------------------------------------ proiezione
// un punto del mondo (x, y sul terreno, z in alto) sullo schermo: le cose alte scappano dal centro in orizzontale, e in verticale
// quelle sotto l'eroe sembrano un po' più alte (sono più vicine), quelle sopra più basse
// la piega di un prop rigido (Denis, 12 ottobre): ref = [x,y] (un punto: tutto il prop si piega uguale) o [x0,y0,x1,y1] (un riquadro: la
// piega va dritta da un bordo all'altro, presa dalla piega vera ai due bordi). Così finestre, porta, lanterna… restano incollate alla casa, e
// quando l'eroe è dentro la casa le pareti si aprono via da lui da tutti i lati, come guardare dentro una scatola. null = ogni punto per conto suo
let REF=null;// [a0,a1,b0,b1]: piega di lato a0+a1·x, in verticale b0+b1·y
// con la telecamera girata la piega si calcola in (u, v) intorno al perno (la piega in verticale dal centro dello schermo, v = −oy/SP)
function setRef(r){if(!r){REF=null;return}
  if(CAM.rot){const fu=u=>soft(u*CAM.lx),fv=v=>softV((-CAM.oy/CAM.SP-v)*CAM.ly),UV=(x,y)=>{const dx=x-CAM.x,dy=y-CAM.y;return[dx*CAM.c-dy*CAM.s,dx*CAM.s+dy*CAM.c]};
    if(r.length<4){const[u,v]=UV(r[0],r[1]);REF=[fu(u),0,fv(v),0];return}
    let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const[X,Y] of[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]]){const[u,v]=UV(X,Y);if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v}
    const a1=u1-u0>1?(fu(u1)-fu(u0))/(u1-u0):0,b1=v1-v0>1?(fv(v1)-fv(v0))/(v1-v0):0;
    REF=[u1-u0>1?fu(u0)-a1*u0:fu((u0+u1)/2),a1,v1-v0>1?fv(v0)-b1*v0:fv((v0+v1)/2),b1];return}
  const fx=x=>soft((x-CAM.x)*CAM.lx),fy=y=>softV((CAM.cy-y)*CAM.ly);
  if(r.length<4){REF=[fx(r[0]),0,fy(r[1]),0];return}const[x0,y0,x1,y1]=r,a1=x1-x0>1?(fx(x1)-fx(x0))/(x1-x0):0,b1=y1-y0>1?(fy(y1)-fy(y0))/(y1-y0):0;
  REF=[x1-x0>1?fx(x0)-a1*x0:fx((x0+x1)/2),a1,y1-y0>1?fy(y0)-b1*y0:fy((y0+y1)/2),b1]}
let LEANK=1;// quanto si piega il prop che si sta disegnando (lk del prop: 1 case e muri, .5 pali e lapidi)
// la piega di lato satura piano verso 13° (lontano dall'eroe le cose alte non sembrano cadute); quella in verticale, che allunga o accorcia
// le case mentre l'eroe va su e giù, quasi non c'è (al massimo ±2% dell'altezza): richieste di Denis del 12 ottobre («diminuisci di molto»)
const LK=.22,soft=k=>LK*Math.tanh(k/LK),LKV=.02,softV=k=>LKV*Math.tanh(k/LKV);
// due strade: dritta (ψ=0, θ=45°: il codice di prima, la piega verticale misurata dal centro dello schermo cy) e girata, in (u, v) intorno al
// perno; vicino allo zero le due danno gli stessi numeri, quindi niente salti
const S=(x,y,z)=>{if(Array.isArray(x))return S(x[0],x[1],x[2]);z=z||0;
  if(CAM.rot){const dx=x-CAM.x,dy=y-CAM.y,u=dx*CAM.c-dy*CAM.s,v=dx*CAM.s+dy*CAM.c;let lu,lv;
    if(REF){lu=REF[0]+REF[1]*u;lv=REF[2]+REF[3]*v}else{lu=soft(u*CAM.lx);lv=softV((-CAM.oy/CAM.SP-v)*CAM.ly)}
    return[CAM.x+u+lu*z*LEANK,CAM.y+v*CAM.SP-z*CAM.CP+lv*z*LEANK]}
  if(REF)return[x+(REF[0]+REF[1]*x)*z*LEANK,y-z+(REF[2]+REF[3]*y)*z*LEANK];return[x+soft((x-CAM.x)*CAM.lx)*z*LEANK,y-z+softV((CAM.cy-y)*CAM.ly)*z*LEANK]};
// il terreno (e quello che ci sta appoggiato: nuvole, nebbia) gira e si schiaccia con la telecamera con una sola trasformazione della tela,
// (x,y) → (CAM.x+u, CAM.y+v·SP), cioè S(x,y,0); a vista dritta non fa niente
const inGround=fn=>{if(!CAM.rot){fn();return}const c=CAM.c,s=CAM.s,SP=CAM.SP;ctx.save();ctx.transform(c,SP*s,-s,SP*c,CAM.x-(c*CAM.x-s*CAM.y),CAM.y-SP*(s*CAM.x+c*CAM.y));try{fn()}finally{ctx.restore()}};
const add3=(a,b,k)=>[a[0]+b[0]*(k==null?1:k),a[1]+b[1]*(k==null?1:k),a[2]+b[2]*(k==null?1:k)];
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const len3=a=>Math.hypot(a[0],a[1],a[2]);
// ------------------------------------------------------------------ disegno 2D
function ink(w){ctx.strokeStyle=INK;ctx.lineWidth=w||2.4;ctx.lineJoin='round';ctx.lineCap='round'}
function path(P){ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath()}
function hull(P){const p=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}up.pop();lo.pop();return lo.concat(up)}
const shoelace=P=>{let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1]}return a};
// la matrice affine che porta tre punti su altri tre
function affine3(sp,dp){const[x0,y0]=sp[0],[x1,y1]=sp[1],[x2,y2]=sp[2],[u0,v0]=dp[0],[u1,v1]=dp[1],[u2,v2]=dp[2];
  const det=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);if(Math.abs(det)<1e-9)return null;
  const a=((u1-u0)*(y2-y0)-(u2-u0)*(y1-y0))/det,c=((u2-u0)*(x1-x0)-(u1-u0)*(x2-x0))/det,b=((v1-v0)*(y2-y0)-(v2-v0)*(y1-y0))/det,d=((v2-v0)*(x1-x0)-(v1-v0)*(x2-x0))/det;
  return[a,b,c,d,u0-a*x0-c*y0,v0-b*x0-d*y0]}
// ------------------------------------------------------------------ materiali e texture
// ogni materiale: tre toni [base, scuro, chiaro] e i segni; la texture di una faccia dipende da materiale, orientamento (t sopra, s sud,
// e est, w ovest, n nord, r falda), misura e se tocca terra. La luna sta a ovest, alta: sopra e ovest chiari, est e nord scuri
const MAT={};
function material(name,c,marks,o){MAT[name]=Object.assign({c,marks},o||{});return name}
const TONE={t:.55,w:.3,s:0,r:.38,rn:-.35,rw:.42,re:-.15,e:-.45,n:-.6};const SKY=k=>k==='t'||k==='r'||k==='rn'||k==='rw'||k==='re';// rw/re: falde che guardano a ovest (luna) e a est
function tone(m,key){const k=TONE[key]||0;return k>=0?mix(m.c[0],m.c[2],k):mix(m.c[0],m.c[1],-k)}
const TEX={},R=2;// risoluzione delle texture: 2 pixel per unità
function texture(mat,key,w,h,foot,extra){w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));const id=mat+'|'+key+'|'+w+'|'+h+'|'+(foot?1:0)+'|'+(extra||'');if(TEX[id])return TEX[id];
  const m=MAT[mat]||MAT.stone,c=document.createElement('canvas');c.width=w*R;c.height=h*R;c._id=id;const g=c.getContext('2d'),sv=ctx,sd=seed;ctx=g;ctx.scale(R,R);srand(hashS(id));
  try{ctx.fillStyle=tone(m,key);ctx.fillRect(0,0,w,h);const marks=MARKS[m.marks];if(marks)marks(w,h,key,m);if(m.after)m.after(w,h,key);
    if(SKY(key)){// luce calda in alto a sinistra sulle facce che guardano il cielo
      const gr=ctx.createLinearGradient(0,0,w*.7,h*.7);gr.addColorStop(0,wa(key==='t'?.26:.16));gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h)}
    else{// le facce in piedi: più scure verso il basso, nere ai piedi se toccano terra; un filo di luce fredda in cima
      const gr=ctx.createLinearGradient(0,h,0,Math.max(0,h-Math.min(28,h)));gr.addColorStop(0,`rgba(0,0,0,${foot?.38:.14})`);gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
      ctx.fillStyle='rgba(200,215,255,.22)';ctx.fillRect(0,0,w,1.5);if(key==='s'||key==='w'){const gw=ctx.createLinearGradient(0,0,2.5,0);gw.addColorStop(0,'rgba(200,215,255,.16)');gw.addColorStop(1,'rgba(200,215,255,0)');ctx.fillStyle=gw;ctx.fillRect(0,0,2.5,h)}}
  }finally{ctx=sv;seed=sd}return TEX[id]=c}
const MARKS={};
// i segni dei materiali disegnati nello spazio della texture (w×h, origine in alto a sinistra, l'alto della faccia in alto)
MARKS.plank=(w,h,key)=>{// assi verticali con i chiodi e le venature
  ctx.strokeStyle='rgba(20,12,6,.55)';ctx.lineWidth=1.1;const st=9;for(let x=st;x<w;x+=st){ctx.beginPath();ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,h);ctx.stroke()}
  ctx.fillStyle='rgba(10,8,6,.6)';for(let x=st/2;x<w;x+=st){for(const y of[h*.15,h*.85]){ctx.beginPath();ctx.arc(x,y,.75,0,TAU);ctx.fill()}}
  for(let x=st/2,i=0;x<w;x+=st,i++){if(i%2)continue;const y=rr(h*.2,h*.8),kx=x+rr(-2,2);ctx.fillStyle='#2a1a10';ctx.beginPath();ctx.ellipse(kx,y,1.2,2.1,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,230,200,.14)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(kx,y,2,3.2,0,0,TAU);ctx.stroke();ctx.strokeStyle='rgba(20,12,6,.3)';ctx.beginPath();ctx.moveTo(kx-2.6,y-6);ctx.quadraticCurveTo(kx-3.4,y,kx-2.6,y+6);ctx.stroke()}
  ctx.fillStyle=wa(.07);for(let x=1;x<w;x+=st)ctx.fillRect(x,0,2.2,h)};
MARKS.siding=(w,h,key)=>{// assi orizzontali sovrapposte, con l'ombra sotto ogni asse
  const st=8;for(let y=st;y<h;y+=st){ctx.fillStyle='rgba(20,12,6,.5)';ctx.fillRect(0,y-1.2,w,1.6);ctx.fillStyle=wa(.09);ctx.fillRect(0,y+.6,w,1)}
  ctx.strokeStyle='rgba(20,12,6,.35)';ctx.lineWidth=.8;for(let i=0;i<w*h/900;i++){ctx.beginPath();ctx.ellipse(rr(0,w),rr(0,h),2.2,.9,0,0,TAU);ctx.stroke()}};
MARKS.stone=(w,h,key,m)=>{// corsi di pietre sfalsate con il giunto scuro, qualche pietra più chiara, muschio in basso
  const ch=9;for(let r=0,y=0;y<h;r++,y+=ch){const yy=Math.min(h,y+ch);ctx.strokeStyle='rgba(10,10,14,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,yy-.5);ctx.lineTo(w,yy-.5);ctx.stroke();
    for(let x=(r%2?7:14)+rr(-2,2);x<w;x+=15+rnd()*7){ctx.beginPath();ctx.moveTo(x+.5,y);ctx.lineTo(x+.5,yy);ctx.stroke();if(rnd()<.25){ctx.fillStyle=rnd()<.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)';ctx.fillRect(x+1,y+1,Math.min(14,w-x-2),ch-2)}}}
  if(key!=='t')for(let i=0;i<w/14;i++){ctx.fillStyle='rgba(64,96,44,.45)';ctx.beginPath();ctx.ellipse(rr(0,w),h-rr(0,h*.35),rr(2,5),rr(1,2),0,0,TAU);ctx.fill()}};
MARKS.brick=(w,h)=>{const ch=5;for(let r=0,y=0;y<h;r++,y+=ch){ctx.strokeStyle='rgba(30,10,8,.55)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(0,y+ch-.5);ctx.lineTo(w,y+ch-.5);ctx.stroke();for(let x=(r%2?4:9);x<w;x+=10){ctx.beginPath();ctx.moveTo(x+.5,y);ctx.lineTo(x+.5,y+ch);ctx.stroke()}
    for(let x=(r%2?4:9);x<w;x+=10)if(rnd()<.2){ctx.fillStyle=rnd()<.5?'rgba(255,200,160,.08)':'rgba(0,0,0,.12)';ctx.fillRect(x+1,y+.5,8,ch-1.5)}}};
MARKS.shingle=(w,h,key)=>{// tegole a file sfalsate col bordo basso tondo, ombra sotto ogni fila, filo di luce in alto, qualche tegola rotta o mancante col listello
  const ch=7,cw=12;for(let r=0,y=0;y<h;r++,y+=ch){ctx.fillStyle='rgba(10,6,8,.5)';ctx.fillRect(0,y+ch-1.6,w,1.8);
    for(let x=(r%2?cw/2:0)-cw;x<w;x+=cw){const k=rnd();if(k<.05){ctx.fillStyle='#0a0608';ctx.fillRect(x+.5,y,cw-1,ch-1);ctx.fillStyle='#3e2c1c';ctx.fillRect(x+.5,y+ch*.45,cw-1,1.2);continue}
      ctx.fillStyle=k<.12?'rgba(0,0,0,.14)':k<.2?'rgba(255,255,255,.05)':'rgba(0,0,0,0)';if(k<.2)ctx.fillRect(x+1,y+1,cw-2,ch-2);ctx.strokeStyle='rgba(10,6,8,.5)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x+.5,y);ctx.lineTo(x+.5,y+ch-2);ctx.stroke();
      ctx.fillStyle='rgba(10,6,8,.45)';ctx.beginPath();ctx.moveTo(x,y+ch-2.2);ctx.quadraticCurveTo(x+cw/2,y+ch+1.2,x+cw,y+ch-2.2);ctx.lineTo(x+cw,y+ch-.6);ctx.lineTo(x,y+ch-.6);ctx.closePath();ctx.fill();ctx.fillStyle=wa(.08);ctx.fillRect(x+1,y+.4,cw-2,.9)}}
  const rows=Math.ceil(h/ch);for(let i=0;i<w*h/900;i++){const r=Math.floor(Math.pow(rnd(),key==='rn'?2.2:.45)*rows),y=r*ch+ch-2;ctx.fillStyle='rgba(72,104,48,.5)';ctx.beginPath();ctx.ellipse(rr(0,w),y,rr(3,6),rr(.9,1.6),0,0,TAU);ctx.fill()}};
MARKS.wood=(w,h,key)=>{ctx.strokeStyle='rgba(20,12,6,.3)';ctx.lineWidth=.8;const n=Math.max(1,Math.round(h/5));for(let i=0;i<n;i++){const y=(i+.5)*h/n;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(w*.3,y+rr(-1.5,1.5),w*.7,y+rr(-1.5,1.5),w,y);ctx.stroke()}};
MARKS.iron=(w,h)=>{ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(0,0,Math.max(1,w*.25),h);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(w*.7,0,w*.3,h)};
MARKS.soil=(w,h)=>{for(let i=0;i<w*h/60;i++){ctx.fillStyle=rnd()<.5?'rgba(0,0,0,.18)':'rgba(255,230,200,.07)';ctx.beginPath();ctx.ellipse(rr(0,w),rr(0,h),rr(1,3),rr(.8,1.8),0,0,TAU);ctx.fill()}};
MARKS.bone=(w,h)=>{ctx.strokeStyle='rgba(60,45,30,.25)';ctx.lineWidth=.8;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(rr(0,w),rr(0,h));ctx.lineTo(rr(0,w),rr(0,h));ctx.stroke()}};
MARKS.cloth=(w,h)=>{ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=1;for(let y=3;y<h;y+=6){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+rr(-1,1));ctx.stroke()}};
MARKS.bark=(w,h,key)=>{// corteccia: venature verticali ondulate, nodi, muschio alla base
  ctx.strokeStyle='rgba(15,10,6,.5)';ctx.lineWidth=1;const n=Math.max(2,Math.round(w/3.5));for(let i=0;i<n;i++){const x0=(i+.5)*w/n;ctx.beginPath();ctx.moveTo(x0+rr(-1,1),h);ctx.bezierCurveTo(x0+rr(-2,2),h*.66,x0+rr(-2,2),h*.33,x0+rr(-1.5,1.5),0);ctx.stroke()}
  for(let i=0;i<Math.max(1,w*h/450);i++){const kx=rr(1,w-1),ky=rr(h*.15,h*.85);ctx.strokeStyle='rgba(15,10,6,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(kx,ky,1.6,3,0,0,TAU);ctx.stroke();ctx.fillStyle='rgba(15,10,6,.35)';ctx.beginPath();ctx.ellipse(kx,ky,.8,1.6,0,0,TAU);ctx.fill()}
  if(key!=='t')for(let i=0;i<w/6;i++){ctx.fillStyle='rgba(64,96,44,.45)';ctx.beginPath();ctx.ellipse(rr(0,w),h-rr(0,h*.3),rr(1.5,3.5),rr(1,2.5),0,0,TAU);ctx.fill()}};
MARKS.slab=(w,h)=>{// lastre di pietra grandi, sfalsate, con la fuga scura e il muschio
  const ch=12,cw=20;for(let r=0,y=0;y<h;r++,y+=ch){ctx.strokeStyle='rgba(10,10,14,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,y+ch-.5);ctx.lineTo(w,y+ch-.5);ctx.stroke();for(let x=(r%2?cw/2:0)+rr(-2,2);x<w;x+=cw){ctx.beginPath();ctx.moveTo(x+.5,y);ctx.lineTo(x+.5,y+ch);ctx.stroke();if(rnd()<.3){ctx.fillStyle=rnd()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.1)';ctx.fillRect(x+1,y+1,cw-2,ch-2)}}}
  for(let i=0;i<w*h/500;i++){ctx.fillStyle='rgba(72,104,48,.45)';ctx.beginPath();ctx.ellipse(rr(0,w),rr(0,h),rr(2,5),rr(1,2),0,0,TAU);ctx.fill()}};
MARKS.straw=(w,h,key)=>{// paglia: fili corti in due toni, tutti un po' inclinati, più fitti; ombra tra i fili
  for(let i=0;i<w*h/9;i++){const xx=rr(0,w),yy=rr(0,h),k=rnd();ctx.strokeStyle=k<.35?'rgba(60,40,10,.5)':k<.75?'rgba(200,175,100,.4)':'rgba(120,90,36,.5)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+rr(2,5),yy+(key==='t'?rr(-1.5,1.5):rr(-3,-1)));ctx.stroke()}};
MARKS.vgrain=(w,h)=>{ctx.strokeStyle='rgba(20,12,6,.35)';ctx.lineWidth=.9;const n=Math.max(1,Math.round(w/4));for(let i=0;i<n;i++){const x0=(i+.5)*w/n;ctx.beginPath();ctx.moveTo(x0+rr(-.8,.8),h);ctx.bezierCurveTo(x0+rr(-1.5,1.5),h*.6,x0+rr(-1.5,1.5),h*.3,x0+rr(-1,1),0);ctx.stroke()}};
MARKS.plaster=(w,h)=>{ctx.strokeStyle='rgba(10,8,6,.5)';ctx.lineWidth=1;const x0=rr(w*.2,w*.8);ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x0+rr(-3,3),h*.3);ctx.lineTo(x0+rr(-5,5),h*.55);ctx.stroke();ctx.fillStyle='rgba(20,30,20,.25)';ctx.beginPath();ctx.ellipse(rr(0,w),h*.85,rr(8,18),rr(4,8),0,0,TAU);ctx.fill()};
MARKS.flat=()=>{};
material('plank',['#6e5236','#46321e','#93714c'],'plank');material('plankD',['#54402c','#34261a','#735a3e'],'plank');material('siding',['#6e5236','#46321e','#93714c'],'siding');
material('stone',['#6d6a72','#45434b','#9a97a2'],'stone');material('stoneW',['#5c5f6a','#3c3e47','#80848f'],'stone');material('stoneWD',['#4a4c56','#30323a','#676a75'],'stone');material('stoneD',['#55535b','#36353b','#7c7a84'],'stone');material('brick',['#5a3a30','#3a2420','#7a5448'],'brick');
material('shingle',['#4e3b4a','#302232','#6a5466'],'shingle');material('slate',['#3c4552','#2b323c','#535f6e'],'shingle');material('tile',['#7a3527','#5a2519','#96503a'],'shingle');
material('wood',['#5e4128','#3c2817','#7d5a38'],'wood');material('iron',['#34363e','#1d1e23','#6a6e7a'],'iron');material('soil',['#4a3a2a','#2e2419','#64503a'],'soil');material('soilD',['#3c3028','#241c16','#4e4034'],'soil');
material('bone',['#d9cfb4','#a69a7c','#f0e8d2'],'bone');material('cloth',['#5a3a5e','#3a243e','#7a5a80'],'cloth');material('red',['#6a2e3a','#4a1e28','#8a4a56'],'cloth');
material('glass',['#f0c070','#b87830','#fff0c0'],'flat');material('dark',['#0c0a0e','#06050a','#1a1620'],'flat');material('bark',['#4a3b2e','#2c231b','#6a5644'],'bark');
material('pumpkin',['#d06e22','#8a4010','#f0a040'],'flat');material('leaf',['#365a2c','#22391b','#52803e'],'flat');material('grass',['#36452b','#26311e','#4d6338'],'flat');
material('moss',['#4f6e35','#33491f','#6f9448'],'flat');material('copper',['#5d8a76','#3d5e50','#80b09a'],'iron');material('hay',['#8a7a3a','#5e5228','#a89450'],'straw');
material('slab',['#5a5f6c','#3a3e48','#7d8392'],'slab');material('leafZ',['#3a5234','#1f2e1c','#5a7a44'],'flat');material('oldwood',['#5a4a3a','#36291e','#8a7a62'],'plank');material('board',['#5a4a3a','#36291e','#8a7a62'],'wood');material('post',['#4e3f30','#30251a','#75644e'],'vgrain');material('stave',['#54402c','#34261a','#735a3e'],'vgrain');material('plaster',['#3a2c22','#2a1f18','#4e3d30'],'plaster');material('leafA',['#8a4a22','#52281a','#b86a2e'],'flat');
// ------------------------------------------------------------------ pezzi (le cose di cui è fatto un prop)
// face: quattro angoli 3D in senso antiorario visti da fuori, p0 = angolo in basso a sinistra della texture, p1 = +u, p3 = +v;
// visibile se la proiezione gira nel verso giusto (shoelace < 0). mat: nome del materiale, key: orientamento; o.foot: tocca terra;
// o.tex(w,h): segni in più sopra il materiale (nella texture); o.col: colore pieno senza materiale; o.alpha
let UID=0;function face(p0,p1,p2,p3,mat,key,o){o=o||{};return{k:'face',c:[p0,p1,p2,p3],mat,key,w:len3(sub3(p1,p0)),h:len3(sub3(p3,p0)),foot:!!o.foot,tex:o.tex||null,texId:o.texId||(o.tex?'u'+(++UID):''),col:o.col||null,ink:o.ink==null?.9:o.ink,alpha:o.alpha==null?1:o.alpha}}
// hull: contorno scuro intorno a un insieme di punti 3D (il profilo di un solido convesso)
const hullOf=(pts,w)=>({k:'hull',pts,w:w||2.6});
// ball: una sfera a un punto 3D (chiome, zucche, pomelli): tre toni girati verso la luna; sq schiaccia in verticale
let FSD=0;// numero di serie dei disegni dal vivo: il loro seme (stesso ordine di costruzione = stessi segni a ogni caricamento)
const ballAt=(p,r,mat,o)=>Object.assign({k:'ball',p,r,mat,sd:++FSD},o||{});// o.lobes/amp/ph: profilo smerlato (chiome)
// line: un segmento 3D (ringhiere, corde, rami sottili): col, w; ink true aggiunge il contorno
const line3=(a,b,col,w,o)=>Object.assign({k:'line',a,b,col,w:w||1},o||{});
// poly: un poligono 3D piatto riempito (mucchi di terra, pezze), con contorno opzionale
const poly3=(pts,col,o)=>Object.assign({k:'poly',pts,col},o||{});
// fn: disegno libero con la proiezione (per i dettagli): f(S, ctx)
const fn3=(f)=>({k:'fn',f,sd:++FSD});
// un parallelepipedo: x,y,z angolo nord-ovest in basso; o.m = {t,s,e,w,n} materiali per faccia; o.tex per faccia; o.noOut; o.ow spessore contorno
function box(x,y,z,w,d,h,mat,o){o=o||{};const v=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],P=[],M=o.m||{},TX=o.tex||{},foot=z<=0.01&&!o.noFoot;
  const f=(a,b,c,d2,key)=>P.push(face(v[a],v[b],v[c],v[d2],M[key]||mat,key,{foot:key!=='t'&&foot,tex:TX[key],texId:o.texId,ink:o.ink}));
  f(3,2,6,7,'s');f(2,1,5,6,'e');f(0,3,7,4,'w');f(1,0,4,5,'n');f(7,6,5,4,'t');
  if(!o.noOut)P.push(hullOf(v,o.ow));return P}
// un profilo [u,z] estruso lungo y da y a y+t (lapidi, picchetti, frontoni): la faccia sud è il profilo, i fianchi seguono i lati
function prismX(x,y,t,prof,mat,o){o=o||{};const fr=prof.map(([u,z])=>[x+u,y+t,z]),bk=prof.map(([u,z])=>[x+u,y,z]),P=[],n=prof.length;
  for(let i=0;i<n;i++){const j=(i+1)%n,du=prof[j][0]-prof[i][0],dz=prof[j][1]-prof[i][1];if(Math.abs(du)<1e-6&&Math.abs(dz)<1e-6)continue;// normale (dz,0,-du)
    const key=Math.abs(dz)>Math.abs(du)?(dz>0?'e':'w'):(du<0?(dz>1e-6?'re':dz<-1e-6?'rw':'t'):'n');if(key==='n'&&Math.abs(dz)<1e-6)continue;// la faccia sotto non si vede mai
    P.push(face(bk[i],bk[j],fr[j],fr[i],(o.m&&o.m[key])||mat,key,{foot:Math.min(prof[i][1],prof[j][1])<=0.01&&key!=='t',texId:o.texId,ink:o.ink}))}
  P.push({k:'facepoly',c:fr,mat:(o.m&&o.m.s)||mat,key:'s',tex:o.texF});P.push({k:'facepoly',c:bk.slice().reverse(),mat:(o.m&&o.m.n)||mat,key:'n'});
  if(o.out==='profile'){P.unshift({k:'outline',pts:bk,w:o.ow});P.push({k:'outline',pts:fr,w:o.ow})}else if(!o.noOut)P.push(hullOf(fr.concat(bk),o.ow));return P}
// un profilo [v,z] lungo y estruso lungo x da x a x+len (tetti a due falde con il colmo lungo x, tettoie)
function prismY(x,y,len,prof,mat,o){o=o||{};const a=prof.map(([v,z])=>[x,y+v,z]),b=prof.map(([v,z])=>[x+len,y+v,z]),P=[],n=prof.length;
  for(let i=0;i<n;i++){const j=(i+1)%n,dv=prof[j][0]-prof[i][0],dz=prof[j][1]-prof[i][1];// normale (0,dz,-dv): guarda in su se -dv>0
    if(Math.abs(dv)<1e-6&&Math.abs(dz)<1e-6)continue;const up=-dv;let key;if(Math.abs(up)>Math.abs(dz)*.3)key=up>0?(dz>0?'r':dz<0?'rn':'t'):null;else key=dz>0?'s':'n';if(!key)continue;// la faccia sotto non si vede
    P.push(face(a[i],b[i],b[j],a[j],(o.m&&o.m[key])||mat,key,{tex:o.tex&&o.tex[i],texId:o.texId}))}
  P.push({k:'facepoly',c:b.slice().reverse(),mat:(o.m&&o.m.e)||mat,key:'e',tex:o.texE});P.push({k:'facepoly',c:a,mat:(o.m&&o.m.w)||mat,key:'w',tex:o.texW});
  if(!o.noOut)P.push(hullOf(a.concat(b),o.ow));return P}
// un pannello verticale (recinti, cancellate, ringhiere, tronchi sottili): rivolto a sud se along==='x', a est se 'y'; la texture può avere buchi
// (draw(w,h) la disegna nello spazio della texture, origine in alto a sinistra) e si vede da entrambi i lati
function plane(x,y,z,len,h,along,texId,draw,o){o=o||{};const p0=[x,y,z],p1=typeof along==='number'?[x+Math.cos(along)*len,y+Math.sin(along)*len,z]:along==='x'?[x+len,y,z]:[x,y+len,z],p3=[x,y,z+h],p2=add3(p1,[0,0,h]);// along: 'x', 'y' o un angolo in radianti
  return{k:'plane',c:[p0,p1,p2,p3],w:len,h,texId,draw,ow:o.ow==null?0:o.ow,alpha:o.alpha==null?1:o.alpha,flip:along==='y'}}
// un cilindro a facce (pozzo, botti, pilastri tondi): n lati, r in basso, r1 in alto
function cyl(x,y,z,r,h,mat,o){o=o||{};const n=o.n||10,r1=o.r1==null?r:o.r1,P=[],lo=[],hi=[];for(let i=0;i<n;i++){const a=i/n*TAU-Math.PI/2;lo.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z]);hi.push([x+Math.cos(a)*r1,y+Math.sin(a)*r1,z+h])}
  for(let i=0;i<n;i++){const j=(i+1)%n,a=(i+.5)/n*TAU-Math.PI/2,nx=Math.cos(a),ny=Math.sin(a),key=ny>.5?'s':ny<-.5?'n':nx>0?'e':'w';P.push(face(lo[j],lo[i],hi[i],hi[j],(o.m&&o.m.side)||mat,key,{foot:z<=0.01,ink:o.ink==null?.6:o.ink,tex:o.tex}))}
  if(o.top!==false)P.push({k:'facepoly',c:hi.slice().reverse(),mat:(o.m&&o.m.t)||mat,key:'t'});if(!o.noOut)P.push(hullOf(lo.concat(hi),o.ow));return P}
// ------------------------------------------------------------------ disegno dei pezzi (ogni fotogramma, con la piega del momento)
const PLANES={};
function drawFace(f){const q=f.c.map(S);if(shoelace(q)>=0)return;const tx=f.col?null:texture(f.mat,f.key,f.w,f.h,f.foot,f.texId);
  if(f.alpha<1){ctx.save();ctx.globalAlpha*=f.alpha}
  if(!tx){path(q);ctx.fillStyle=f.col;ctx.fill()}else{if(f.tex&&!tx._x){tx._x=1;const g=tx.getContext('2d'),sv=ctx,sd=seed;ctx=g;ctx.save();ctx.scale(R,R);srand(hashS(tx._id+'|x'));try{f.tex(f.w,f.h,f.key)}finally{ctx.restore();ctx=sv;seed=sd}}drawQuad(tx,q)}
  if(f.ink){path(q);ctx.strokeStyle=`rgba(15,12,10,${Math.min(.7,f.ink*.6)})`;ctx.lineWidth=f.ink;ctx.lineJoin='round';ctx.stroke()}
  if(f.alpha<1)ctx.restore()}
// appoggia una texture su un quadrilatero: una sola trasformazione se è (quasi) un parallelogramma, altrimenti due triangoli esatti
function drawQuad(tx,q,flip){const W=tx.width,H=tx.height,ex=q[0][0]+q[2][0]-q[1][0]-q[3][0],ey=q[0][1]+q[2][1]-q[1][1]-q[3][1];
  const u0=flip?W:0,u1=flip?0:W;
  if(Math.abs(ex)<.8&&Math.abs(ey)<.8){const m=affine3([[u0,H],[u1,H],[u0,0]],[q[0],q[1],q[3]]);if(!m)return;ctx.save();ctx.transform(...m);ctx.drawImage(tx,0,0);ctx.restore();return}
  tri(tx,[[u0,H],[u1,H],[u1,0]],[q[0],q[1],q[2]]);tri(tx,[[u0,H],[u1,0],[u0,0]],[q[0],q[2],q[3]])}
function tri(tx,s,d){const m=affine3(s,d);if(!m)return;const cx=(d[0][0]+d[1][0]+d[2][0])/3,cy=(d[0][1]+d[1][1]+d[2][1])/3;ctx.save();ctx.beginPath();
  for(const p of d){const dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;ctx.lineTo(p[0]+dx/l*.7,p[1]+dy/l*.7)}ctx.closePath();ctx.clip();ctx.transform(...m);ctx.drawImage(tx,0,0);ctx.restore()}
function drawFacePoly(f){const q=f.c.map(S);if(shoelace(q)>=0)return;const m=MAT[f.mat]||MAT.stone;path(q);ctx.fillStyle=f.col||tone(m,f.key);ctx.fill();
  if(f.tex){ctx.save();ctx.clip();const sd=seed;srand(f.sd||(f.sd=hashS('fp|'+f.c[0].join(',')+'|'+f.c.length)));try{f.tex(q,f.key)}finally{seed=sd}ctx.restore()}
  if(SKY(f.key)){ctx.save();ctx.clip();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of q){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}const g=ctx.createLinearGradient(x0,y0,x0+(x1-x0)*.7,y0+(y1-y0)*.7);g.addColorStop(0,wa(.22));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.restore()}
  path(q);ctx.strokeStyle='rgba(15,12,10,.5)';ctx.lineWidth=.9;ctx.stroke()}
function drawPlane(p){const q=p.c.map(S),a=shoelace(q);if(Math.abs(a)<1)return;let tx=PLANES[p.texId];if(!tx){tx=PLANES[p.texId]=document.createElement('canvas');tx.width=Math.ceil(p.w*R);tx.height=Math.ceil(p.h*R);const g=tx.getContext('2d'),sv=ctx,sd=seed;ctx=g;ctx.scale(R,R);srand(hashS('P|'+p.texId));try{p.draw(p.w,p.h)}finally{ctx=sv;seed=sd}}
  if(p.alpha<1){ctx.save();ctx.globalAlpha*=p.alpha}drawQuad(tx,q,a>0);if(p.alpha<1)ctx.restore()}
function drawBall(b){const q=S(b.p),m=MAT[b.mat]||MAT.leaf,r=b.r;ctx.save();ctx.translate(q[0],q[1]);if(b.sq)ctx.scale(1,b.sq);const shape=()=>{if(!b.lobes){ball([0,0],r);return}ctx.beginPath();const n=b.lobes,am=b.amp||.14,N=n*6;for(let i=0;i<=N;i++){const a=i/N*TAU,k=Math.abs(Math.sin(a*n/2+(b.ph||0))),r2=r*(1-am*.5+am*k),px=Math.cos(a)*r2,py=Math.sin(a)*r2;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()};shape();ctx.fillStyle=m.c[1];ctx.fill();ctx.save();ctx.clip();
  ctx.fillStyle=m.c[0];ctx.beginPath();ctx.ellipse(LS[0]*r*.25,LS[1]*r*.25,r*.88,r*.84,0,0,TAU);ctx.fill();ctx.fillStyle=m.c[2];ctx.beginPath();ctx.ellipse(LS[0]*r*.45,LS[1]*r*.45,r*.42,r*.34,-.4,0,TAU);ctx.fill();
  if(b.tex){const sd=seed;srand(hashS('b|'+b.sd));try{b.tex(r)}finally{seed=sd}}ctx.restore();if(b.noOut!==true){ink(b.ow||2.4);shape();ctx.stroke()}ctx.restore()}
function drawLine(l){const a=S(l.a),b=S(l.b);ctx.lineCap='round';if(l.ink){ctx.strokeStyle=INK;ctx.lineWidth=l.w+2.2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}ctx.strokeStyle=l.col;ctx.lineWidth=l.w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
function drawPart(p){switch(p.k){case'face':return drawFace(p);case'facepoly':return drawFacePoly(p);case'plane':return drawPlane(p);case'hull':{const H=hull(p.pts.map(S));path(H);ink(p.w);ctx.stroke();return}case'outline':{path(p.pts.map(S));ink(p.w);ctx.stroke();return}
  case'ball':return drawBall(p);case'line':return drawLine(p);case'poly':{const q=p.pts.map(S);path(q);ctx.fillStyle=p.col;ctx.fill();if(p.ink){ink(p.ink);ctx.stroke()}return}case'fn':{const sd=seed;srand(hashS('f|'+p.sd));try{return p.f(S,ctx)}finally{seed=sd}}}}
// un prop: parts (nell'ordine di disegno: prima il contorno, poi le facce, da dietro a davanti), bx [x0,y0,x1,y1,zTop] per il taglio a
// schermo, ky la profondità (y del bordo davanti), solids per le collisioni, shadows per le ombre cotte nel terreno, lights/flames
const props=[],solids=[],shadows=[],lights=[],flames=[],holes=[],houses=[],smokes=[],perches=[],decals=[],fades=[];// fades: chiome che sfumano ({x,ky,rx,reach,a}), le parti 'roof' del prop con house:fade// decals: f() dipinte nel terreno dopo le ombre (pozze di luce fisse, macchie)
// o.ky: profondità = la y del bordo davanti della parte alta (dove sta il solido); o.kyFn(x): profondità che dipende dalla x dell'eroe (cose
// sottili in diagonale, come le ante aperte); o.floor: sta a terra (cumuli, pedane, gradini, tappeti) e si disegna prima di tutti gli esseri
const NAMES={cur:null,ref:null,grp:null};// grp: un gruppo di prop che si piegano tutti insieme (group)
function group(ref,fn){const sv=NAMES.grp;NAMES.grp=ref;try{fn()}finally{NAMES.grp=sv}}// il prop che si sta costruendo (serve ai test per dire chi copre l'eroe)
// fiamme, luci e corvi posati prendono il punto del prop che si sta costruendo: si piegano con lui
for(const arr of[flames,lights,perches,smokes])arr.push=function(...a){for(const f of a)if(f.ref===undefined)f.ref=NAMES.ref;return Array.prototype.push.apply(this,a)};
function prop(o){o.ky=o.ky==null?o.bx[3]:o.ky;if(o.ref===undefined)o.ref=NAMES.ref;o.parts=o.parts||[];o.name=o.name||NAMES.cur||'?';props.push(o);return o}
// pedane e gradini: chi ci sale sopra viene disegnato più in alto
const stands=[];const stand=(x,y,w,d,h)=>stands.push({x,y,w,d,h});
function heightAt(x,y){let h=0;for(const s of stands)if(x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.d&&s.h>h)h=s.h;return h}
const solid=(x,y,w,d,tag)=>{const s={x,y,w,d,tag};solids.push(s);return s};
const shade=(x,y,w,d,h,a)=>shadows.push({x,y,w,d,h,a});const shadeR=(x,y,r,a)=>shadows.push({x,y,r,a});
// per disegnare un prop le facce stanno in ordine: contorno (hull) prima di tutto, poi le facce
function drawProp(p,alphaOf){const parts=p.parts;for(const part of parts){if(part.part&&alphaOf){const a=alphaOf(part.part);if(a<=0)continue;if(a<1){ctx.save();ctx.globalAlpha*=a;drawPart(part);ctx.restore();continue}}drawPart(part)}}
// ------------------------------------------------------------------ il mondo
const W={dbg:{},w:10*T,h:10*T,ground:null,hero:null,Z:[],FX:[],crows:[],flock:[],clouds:[],mists:[],flies:[],leaves:[],puffs:[],coins:0,t:0};
function hit(x,y,r,ex){for(const s of solids){if(s.off||s===ex)continue;const cx=cl(x,s.x,s.x+s.w),cy=cl(y,s.y,s.y+s.d);if((x-cx)**2+(y-cy)**2<r*r)return s}return null}
function move(o,dx,dy,r){const s0=hit(o.x,o.y,r);o.x+=dx;if(hit(o.x,o.y,r,s0))o.x-=dx;o.y+=dy;if(hit(o.x,o.y,r,s0))o.y-=dy}
// ------------------------------------------------------------------ navigazione degli zombie
// Griglia di 8 px con gli ostacoli gonfiati del raggio dello zombie; un campo di distanze verso l'eroe (Dijkstra a 8 vicini, senza tagliare gli
// angoli) ricalcolato quando l'eroe cambia casella. Ogni zombie va dritto se vede l'eroe; altrimenti scende lungo il campo e punta al punto
// più lontano del percorso che riesce a vedere, così gira intorno a muri, case e lapidi senza zig-zag. Se resta fermo (spinto, incastrato)
// prova per mezzo secondo di lato.
const NC=8,ZR=11;let NAV=null;
function navBuild(){const cw=Math.ceil(W.w/NC),ch=Math.ceil(W.h/NC),n=cw*ch,bl=new Uint8Array(n),los=new Uint8Array(n);
  const mark=(arr,R)=>{for(const s of solids){if(s.off)continue;const i0=Math.max(0,Math.floor((s.x-R)/NC)),i1=Math.min(cw-1,Math.floor((s.x+s.w+R)/NC)),j0=Math.max(0,Math.floor((s.y-R)/NC)),j1=Math.min(ch-1,Math.floor((s.y+s.d+R)/NC));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=(i+.5)*NC,cy=(j+.5)*NC,dx=cx-cl(cx,s.x,s.x+s.w),dy=cy-cl(cy,s.y,s.y+s.d);if(dx*dx+dy*dy<R*R)arr[j*cw+i]=1}}};
  mark(bl,ZR+.5);mark(los,ZR+3);
  NAV={cw,ch,n,bl,los,dist:new Float32Array(n),hk:new Float32Array(n*8+64),hv:new Int32Array(n*8+64),hc:-1,t:0}}
const cellOf=(x,y)=>cl(Math.floor(y/NC),0,NAV.ch-1)*NAV.cw+cl(Math.floor(x/NC),0,NAV.cw-1);
const cen=c=>{const i=c%NAV.cw;return[(i+.5)*NC,((c-i)/NAV.cw+.5)*NC]};
function navField(){const N=NAV,h=W.hero,cw=N.cw,ch=N.ch,D=N.dist,B=N.bl,hk=N.hk,hv=N.hv;D.fill(1e9);let hs=0;
  const push=(k,v)=>{let i=hs++;while(i>0){const p=(i-1)>>1;if(hk[p]<=k)break;hk[i]=hk[p];hv[i]=hv[p];i=p}hk[i]=k;hv[i]=v};
  const pop=()=>{const v=hv[0],lk=hk[--hs],lv=hv[hs];let i=0;for(;;){let c=2*i+1;if(c>=hs)break;if(c+1<hs&&hk[c+1]<hk[c])c++;if(hk[c]>=lk)break;hk[i]=hk[c];hv[i]=hv[c];i=c}hk[i]=lk;hv[i]=lv;return v};
  // le caselle libere vicino all'eroe sono i punti di partenza (l'eroe può stare più vicino ai muri di uno zombie)
  const hi=Math.floor(h.x/NC),hj=Math.floor(h.y/NC);let lim=30;for(let r=4;r<=16&&!hs;r+=4,lim+=32)for(let j=hj-r;j<=hj+r;j++)for(let i=hi-r;i<=hi+r;i++){if(i<0||j<0||i>=cw||j>=ch)continue;const c=j*cw+i;if(B[c])continue;const d=Math.hypot((i+.5)*NC-h.x,(j+.5)*NC-h.y);if(d>lim)continue;if(d<D[c]){D[c]=d;push(d,c)}}
  while(hs){const k0=hk[0],c=pop();if(k0>D[c])continue;const i=c%cw,j=(c-i)/cw;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(B[nc])continue;
      if(di&&dj&&(B[j*cw+ni]||B[nj*cw+i]))continue;const nd=k0+(di&&dj?1.4142*NC:NC);if(nd<D[nc]){D[nc]=nd;push(nd,nc)}}}}
function navUpdate(dt){if(!NAV)return;NAV.t-=dt;const c=cellOf(W.hero.x,W.hero.y);if(c!==NAV.hc&&NAV.t<=0){NAV.hc=c;NAV.t=.08;navField()}}
// la linea tra due punti è libera? (sulla griglia più gonfia; i primi e gli ultimi 10 px non contano: chi sta vicino a un muro vede lo stesso)
function losClear(x0,y0,x1,y1){const L=Math.hypot(x1-x0,y1-y0);if(L<1)return true;const n=Math.ceil(L/4);for(let k=1;k<n;k++){const s=k/n*L;if(s<10||L-s<10)continue;const t=k/n;if(NAV.los[cellOf(x0+(x1-x0)*t,y0+(y1-y0)*t)])return false}return true}
// la linea è libera per un corpo di raggio r sui solidi veri (ex: il solido da cui sta uscendo)
function physClear(x0,y0,x1,y1,r,ex){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/3));for(let k=1;k<=n;k++){const t=k/n;if(hit(x0+(x1-x0)*t,y0+(y1-y0)*t,r,ex))return false}return true}
function steer(z){const h=W.hero,N=NAV;if(!N)return[h.x,h.y];const d=Math.hypot(h.x-z.x,h.y-z.y);if((d<34&&physClear(z.x,z.y,h.x,h.y,4))||losClear(z.x,z.y,h.x,h.y))return[h.x,h.y];
  const D=N.dist,cw=N.cw,ch=N.ch,c=cellOf(z.x,z.y);
  if(N.bl[c]||D[c]>=1e9){// dentro un ostacolo (la fossa da cui è uscito) o fuori dal campo: la casella libera vicina che porta prima all'eroe
    // le caselle libere intorno, a cerchi crescenti: si tengono solo quelle raggiungibili davvero in linea retta (controllo sui solidi veri) e tra
    // queste vince quella da cui il percorso è più corto; così uno zombie schiacciato contro un recinto non punta a una casella dall'altra parte
    const i0=c%cw,j0=(c-i0)/cw,s0=hit(z.x,z.y,ZR-.5);let best=null,bv=1e9,tested=0;
    for(let r=1;r<=18;r++){for(let j=j0-r;j<=j0+r;j++)for(let i=i0-r;i<=i0+r;i++){if(Math.max(Math.abs(i-i0),Math.abs(j-j0))!==r||i<0||j<0||i>=cw||j>=ch)continue;const cc=j*cw+i;if(N.bl[cc]||D[cc]>=1e9)continue;
        const p=cen(cc),v=D[cc]+Math.hypot(p[0]-z.x,p[1]-z.y)*.5;if(v>=bv)continue;tested++;if(physClear(z.x,z.y,p[0],p[1],ZR-1,s0)){bv=v;best=p}}
      if(best&&r>=3)break;if(tested>160)break}
    return best||[h.x,h.y]}
  let cur=c,tgt=null;for(let k=0;k<24;k++){const i=cur%cw,j=(cur-i)/cw;let nb=-1,nv=D[cur];
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(N.bl[nc])continue;if(di&&dj&&(N.bl[j*cw+ni]||N.bl[nj*cw+i]))continue;if(D[nc]<nv){nv=D[nc];nb=nc}}
    if(nb<0)break;cur=nb;const p=cen(cur);if(losClear(z.x,z.y,p[0],p[1]))tgt=p;else{if(!tgt)tgt=p;break}}
  return tgt||[h.x,h.y]}
function zWalk(z,dt){z.st=(z.st||0)-dt;if(z.st<=0||!z.tg||Math.hypot(z.tg[0]-z.x,z.tg[1]-z.y)<5){z.tg=steer(z);z.st=.12}
  let tx=z.tg[0]-z.x,ty=z.tg[1]-z.y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  if(z.det>0){z.det-=dt;tx=z.dvx;ty=z.dvy}
  if(z.vx==null){z.vx=tx;z.vy=ty}const k=Math.min(1,dt*7);z.vx+=(tx-z.vx)*k;z.vy+=(ty-z.vy)*k;const vl=Math.hypot(z.vx,z.vy)||1;
  move(z,z.vx/vl*z.spd*dt,z.vy/vl*z.spd*dt,ZR);z.face=Math.atan2(z.vy,z.vx);
  z.chk=(z.chk||0)+dt;if(z.cx0==null){z.cx0=z.x;z.cy0=z.y}
  if(z.chk>.7){if(Math.hypot(z.x-z.cx0,z.y-z.cy0)<z.spd*.7*.3&&!(z.det>0)){const sd=Math.random()<.5?-1:1;z.dvx=-ty*sd;z.dvy=tx*sd;z.det=.5;z.st=0}z.chk=0;z.cx0=z.x;z.cy0=z.y}}
// ------------------------------------------------------------------ terreno cotto (chiamato dall'area dopo aver messo i prop)
const GT=2;let groundDraw=null,BAKE=null;
// edgeSnap(): chiamato dall'area dentro il suo pittore, fotografa il terreno di base per il fuori mappa (makeEdgeBands) prima delle cose che
// non devono proseguire oltre il bordo (fosse, pozzanghere, foglie); se l'area non lo chiama si fotografa tutto il pittore, prima delle ombre
function edgeSnap(){if(BAKE&&!BAKE.snap){BAKE.snap=1;W.edgeBands=makeEdgeBands(BAKE.c,BAKE.w,BAKE.h)}}
function bakeGround(w,h,painter){W.w=w;W.h=h;const c=document.createElement('canvas');c.width=w*GT;c.height=h*GT;const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(GT,GT);srand(5);BAKE={c,w,h,snap:0};
  try{painter(w,h);// l'area dipinge il suo terreno
    edgeSnap();// le strisce di fuori mappa, se l'area non le ha già fatte: prima delle ombre (specchiate sembrerebbero muri fantasma)
    // ombre: silhouette spinta a est e un po' a sud (luna a ovest, alta), disegnate su uno strato a parte e composte una volta sola, così dove si
    // sovrappongono non diventano nere; il piede è più scuro della punta. Poi il buio di contatto ai piedi di tutto (a ellisse per le cose tonde) e le decalcomanie
    const sh=document.createElement('canvas');sh.width=c.width;sh.height=c.height;const g2=sh.getContext('2d');g2.scale(GT,GT);
    const layer=(k)=>{g2.clearRect(0,0,w,h);g2.fillStyle='#000';for(const s of shadows){if(s.r){g2.beginPath();g2.ellipse(s.x,s.y,s.r*(k<1?.8:1),s.r*.6*(k<1?.8:1),0,0,TAU);g2.fill();continue}
        const ox=s.h*.5*k,oy=s.h*.15*k,P=[[s.x,s.y],[s.x+s.w,s.y],[s.x+s.w,s.y+s.d],[s.x,s.y+s.d]];g2.beginPath();hull(P.concat(P.map(p=>[p[0]+ox,p[1]+oy]))).forEach((q,i)=>i?g2.lineTo(q[0],q[1]):g2.moveTo(q[0],q[1]));g2.closePath();g2.fill()}};
    ctx.save();if('filter' in ctx)ctx.filter='blur(1.8px)';layer(1);ctx.globalAlpha=.24;ctx.drawImage(sh,0,0,w,h);layer(.45);ctx.globalAlpha=.16;ctx.drawImage(sh,0,0,w,h);ctx.globalAlpha=1;
    if('filter' in ctx)ctx.filter='blur(1.4px)';for(const s of solids){if(s.w>400||s.d>400||s.noAO)continue;ctx.fillStyle='rgba(0,0,0,.3)';if(s.round){ctx.beginPath();ctx.ellipse(s.x+s.w/2,s.y+s.d/2,s.w/2+1.5,s.d/2+1.5,0,0,TAU);ctx.fill()}else ctx.fillRect(s.x-1,s.y-1,s.w+2,s.d+2)}ctx.restore();
    for(const f of decals){ctx.save();f();ctx.restore()}
  }finally{ctx=sv;BAKE=null}W.ground=c}
// ------------------------------------------------------------------ luci, buio, nebbia, cielo
let dark=null,mistImg=null,cloudImg=null;
// le pozze di luce sono macchie del terreno: un'ellisse del mondo r × 0,62·r disegnata dentro inGround, così girando resta ferma sotto la luce
// (a vista dritta S(x,y,0) è proprio (x,y) e inGround non fa niente: la stessa di prima)
function drawLights(h0a){if(LOWFX)return;ctx.save();ctx.globalCompositeOperation='lighter';inGround(()=>{for(const L of lights){if(L.house&&L.house.a>.6)continue;const f=L.fl?(.9+.1*Math.sin(W.t*(L.fl===2?2:9)+L.x)*Math.sin(W.t*5.3+L.y)):1,a=L.a*(L.house?1-L.house.a:1)*.8;glow(L.rgb,L.x,L.y,L.r*f,a*f,L.r*f*.62)}});ctx.restore()}
function drawDark(W0,H0,toScr0,h0a){if(LOWFX)return;const Q=3,Wd=Math.ceil(W0/Q),Hd=Math.ceil(H0/Q),toScr=(x,y,r)=>toScr0(x,y,r).map(v=>v/Q);if(!dark)dark=document.createElement('canvas');if(dark.width!==Wd||dark.height!==Hd){dark.width=Wd;dark.height=Hd}
  const g=dark.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,Wd,Hd);g.fillStyle='rgba(10,14,34,.42)';g.fillRect(0,0,Wd,Hd);
  g.globalCompositeOperation='destination-out';const SP=CAM.SP,hole=(x,y,r,a,flat)=>{let[sx,sy,sr0]=toScr(x,y,r),sr=Math.max(1,sr0||1);const sq=SP!==1&&!flat;if(sq){g.save();g.translate(sx,sy);g.scale(1,SP);sx=sy=0}const gr=g.createRadialGradient(sx,sy,0,sx,sy,sr);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill();if(sq)g.restore()};
  // il buco di una luce alta (il lampione) sta a metà altezza sullo schermo: a vista dritta copre la pozza a terra (un po' a nord del palo) e la
  // lanterna. Girando, la parte a terra deve restare ferma nel mondo: il centro diventa il punto del terreno z/2 a nord del palo (con la stessa
  // piega), cioè S(x,y,z/2) senza l'altezza e con lo scarto (0, −z/2) del mondo; la lanterna, che sullo schermo resta sopra la base, prende un
  // secondo buco piccolo alla sua altezza, acceso man mano che il primo se ne va (a vista dritta non c'è: niente salti). Più grande
  // schiarirebbe anche il terreno dietro, che girando cambierebbe di nuovo
  for(const L of lights){if(L.house&&L.house.a>.6)continue;const hz=(L.z||0)*.5,ha=.85*(L.house?1-L.house.a:1);LEANK=L.lk||1;setRef(L.ref);const q=S(L.x,L.y,hz),qt=hz?S(L.x,L.y,L.z):q;LEANK=1;setRef(null);
    if(CAM.rot&&hz){const dx=hz*CAM.s,dy=hz*(CAM.CP-CAM.c*SP),d=Math.hypot(dx,dy);hole(q[0]+dx,q[1]+dy,L.r*1.2,ha);if(d>.5)hole(qt[0],qt[1],L.z*.4,ha*.6*cl(d/30,0,1),true)}
    else hole(q[0],q[1],L.r*1.2,ha)}if(W.hero){const hq=S(W.hero.x,W.hero.y,10);hole(hq[0],hq[1],120,.6)}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dark,0,0,W0,H0);ctx.restore()}
function softImg(){if(mistImg)return mistImg;mistImg=document.createElement('canvas');mistImg.width=mistImg.height=64;const g=mistImg.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return mistImg}
// la nebbia bassa: ogni banco sta in un punto del mondo (S a terra, così girando resta lì e scorre verso est), ma la forma è una striscia
// orizzontale sullo schermo (2r × 0,84r, schiacciata come il terreno): girata col terreno a 90° diventava una colonna di luce
function drawMist(dt){if(LOWFX)return;const im=softImg(),SP=CAM.SP;ctx.save();ctx.globalAlpha=.10;for(const m of W.mists){m.x+=m.v*dt;if(m.x>W.w+180)m.x=-180;const q=S(m.x,m.y,0);ctx.drawImage(im,q[0]-m.r,q[1]-m.r*.42*SP,m.r*2,m.r*.84*SP)}ctx.restore()}
// le nuvole che passano davanti alla luna: grandi ombre morbide che scorrono sul terreno (sono ombre a terra: girano col terreno, dentro inGround)
function drawClouds(dt){if(LOWFX)return;const im=softImg();ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.22;for(const c of W.clouds){c.x+=c.v*dt;c.y+=c.v*.25*dt;if(c.x>W.w+300){c.x=-300;c.y=rr(-100,W.h)}ctx.drawImage(im,c.x-c.r,c.y-c.r*.6,c.r*2,c.r*1.2)}ctx.restore()}
// i corvi: uno stormo che attraversa il cielo sopra la mappa, con le ombre che scivolano sul terreno; e quelli appollaiati, che volano via
function drawCrow(q,wing,dir,s){s=s||1;ctx.save();ctx.translate(q[0],q[1]);ctx.scale(dir<0?-s:s,s);ctx.fillStyle='#0d0c12';ctx.beginPath();ctx.ellipse(0,0,6,2.6,0,0,TAU);ctx.fill();
  ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-11,-1);ctx.lineTo(-11,2);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(5,-.5);ctx.lineTo(9.5,-.2);ctx.lineTo(5,1.2);ctx.closePath();ctx.fill();
  for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(-1,0);ctx.quadraticCurveTo(sd*9,-2-wing*7,sd*17,-wing*12+1);ctx.quadraticCurveTo(sd*9,2-wing*4,1,2);ctx.closePath();ctx.fill()}ctx.restore()}
function updateCrows(dt){if(W.flock.length===0&&Math.random()<dt*.08){const n=3+Math.floor(Math.random()*3),dir=Math.random()<.5?1:-1,y0=rr(60,W.h-60),alt=rr(120,170);
    for(let i=0;i<n;i++)W.flock.push({x:dir>0?-80-i*34:W.w+80+i*34,y:y0+rr(-22,22),z:alt+rr(-10,10),dir,ph:rr(0,6),sp:rr(85,110)})}
  for(const c of W.flock){c.x+=c.dir*c.sp*dt;c.ph+=dt*7;c.y+=Math.sin(c.ph*.4)*6*dt;c.z+=Math.sin(c.ph*.3)*4*dt}
  for(let i=W.flock.length-1;i>=0;i--){const c=W.flock[i];if(c.x<-140||c.x>W.w+140)W.flock.splice(i,1)}
  // i corvi appollaiati volano via quando l'eroe si avvicina e tornano dopo un po'
  for(const p of perches){p.t=(p.t||0)+dt;if(p.away){p.away+=dt;if(p.away>14){p.away=0;p.k=0}continue}if(W.hero&&Math.hypot(W.hero.x-p.x,W.hero.y-p.y)<80){p.away=.001;W.flock.push({x:p.x,y:p.y,z:p.z,dir:p.x<W.hero.x?-1:1,ph:0,sp:70,rise:1,a:0})}}
  for(const c of W.flock)if(c.rise){c.z+=60*dt;c.sp=Math.min(110,c.sp+40*dt)}}
function drawCrowShadows(){for(const c of W.flock){const q=S(c.x,c.y,0);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(q[0],q[1],9,3.2*CAM.SP,0,0,TAU);ctx.fill()}}
function drawFlock(){for(const c of W.flock){const q=S(c.x,c.y,c.z);drawCrow(q,Math.sin(c.ph),Math.sign(c.dir*CAM.c)||c.dir,.95)}}
// il corvo posato si piega come la cosa su cui sta (lk e ref del prop che lo ospita, perchHost): con la piega intera (LEANK=1) sull'obelisco
// (lk .5) scappava di lato il doppio della punta e restava sospeso accanto, già a vista dritta e ancora di più girando
function drawPerch(p){{if(p.away)return;const ho=perchHost(p);LEANK=ho&&ho.lk!=null?ho.lk:1;setRef(ho?ho.ref:p.ref);const q=S(p.x,p.y,p.z);LEANK=1;setRef(null);ctx.save();ctx.translate(q[0],q[1]);const f=Math.sin(p.t*.7)*.8+(Math.sin(p.t*2.3)>.9?1.2:0),d=Math.cos(f)>=0?1:-1;ink(1.6);ctx.fillStyle='#16151c';
    ctx.beginPath();ctx.ellipse(0,-5,5,4,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(-10,1);ctx.lineTo(-8,-3);ctx.closePath();ctx.fill();ctx.stroke();const hx=3*Math.cos(f),hy=-10;ctx.beginPath();ctx.arc(hx,hy,3.2,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#d8b040';ctx.beginPath();ctx.moveTo(hx+2.6*d,hy-1);ctx.lineTo(hx+7*d,hy+.5);ctx.lineTo(hx+2.6*d,hy+1);ctx.closePath();ctx.fill();ctx.fillStyle='#ff5040';ball([hx+1.2*d,hy-.8],.8);ctx.fill();ctx.restore()}}
// fiamme e lumi: candele, vetri delle lanterne, zucche, camini, il respiro verde della cripta (disegnate nell'ordine di profondità)
function drawFlame(f,h0a){if(f.house&&f.house.a>.9)return;LEANK=f.lk||1;setRef(f.ref);const q=S(f.x,f.y,f.z);LEANK=1;setRef(null);const fl=.85+.15*Math.sin(W.t*11+f.x)*Math.sin(W.t*7.3+f.y);
  if(f.fire){for(let i=0;i<5;i++){const a=W.t*6+i*1.3,h=10+4*Math.sin(a),xx=q[0]+(i-2)*3.2;ctx.fillStyle=i%2?'#ffb040':'#ff7a20';ctx.beginPath();ctx.moveTo(xx-3,q[1]);ctx.quadraticCurveTo(xx-2,q[1]-h*.6,xx+Math.sin(a)*1.5,q[1]-h);ctx.quadraticCurveTo(xx+2,q[1]-h*.6,xx+3,q[1]);ctx.closePath();ctx.fill()}}
  else if(f.r<2){ctx.fillStyle='#fff2c0';ctx.beginPath();ctx.ellipse(q[0],q[1]-2,f.r*1.1,f.r*2.4*fl,0,0,TAU);ctx.fill()}
  if(LOWFX)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(f.rgb,q[0],q[1]-2,(f.crypt?26:f.fire?28:f.pump?16*f.pump:f.glass?22:12)*fl,(f.crypt?.5+.2*Math.sin(W.t*1.4):f.pump?.7:.6)*fl);ctx.restore()}
// ------------------------------------------------------------------ gli esseri: eroe con la pistola, zombie dalle buche
const KINDS=[['zombie',1.1,30,4],['strisciante',1.1,24,3],['minatore',1.1,28,5],['lanterna',1.55,22,7],['hound',1.05,64,3]];
let gunState=null,zOn=true,spawnT=1.2;
{const _h=held;held=function(St,o,B){if(St.gun&&window.ARMI)return ARMI.inMano(St.gun,B,o.gp||{},o.aim);return _h(St,o,B)}}
const HSTYLE=Object.assign({},HERO,{held:null,quiver:false,gun:'pistola'});
function spawn(){const h=W.hero,c=holes.filter(([x,y])=>Math.hypot(x-h.x,y-h.y)>110&&Math.hypot(x-h.x,y-h.y)<460);if(!c.length)return;const p=c[Math.floor(Math.random()*c.length)],k=KINDS[Math.floor(Math.random()*KINDS.length)];
  if(W.Z.some(z=>Math.hypot(z.x-p[0],z.y-p[1])<30))return;W.Z.push({kind:k[0],sc:k[1],spd:k[2],hp:k[3],x:p[0],y:p[1],face:0,p:Math.random(),anim:'walk',rise:0,die:0,flash:0})}
function updateBeings(dt,inp){const h=W.hero;const m=Math.hypot(inp.x,inp.y);h.moving=m>.15;if(h.moving){const sp=150*Math.min(1,m);move(h,inp.x/m*sp*dt,inp.y/m*sp*dt,10);h.face=Math.atan2(inp.y,inp.x);h.walk+=dt*12}
  h.zh=(h.zh||0)+(heightAt(h.x,h.y)-(h.zh||0))*Math.min(1,dt*14);const noShoot=!!W.dbg.noShoot;
  // il bersaglio: lo zombie più vicino entro 230 px che l'eroe vede davvero (i colpi non passano attraverso muri, recinti, lapidi, casse…);
  // la linea si controlla sui solidi veri, ignorando quello in cui sta lo zombie (la fossa da cui esce); ricontrollata ogni 0,1 s
  h.fireCd-=dt;h.tgT=(h.tgT||0)-dt;let tgt=h.tgZ&&W.Z.includes(h.tgZ)&&!h.tgZ.die&&h.tgZ.rise>=1&&Math.hypot(h.tgZ.x-h.x,h.tgZ.y-h.y)<230?h.tgZ:null;
  if(h.tgT<=0||!tgt){h.tgT=.1;tgt=null;const c=W.Z.filter(z=>z.rise>=1&&!z.die).map(z=>[Math.hypot(z.x-h.x,z.y-h.y),z]).filter(a=>a[0]<230).sort((a,b)=>a[0]-b[0]);
    for(const[,z] of c)if(physClear(h.x,h.y,z.x,z.y,1.5,hit(z.x,z.y,2))){tgt=z;break}h.tgZ=tgt}
  if(gunState)gunState.update(dt,!h.moving&&!!tgt&&!noShoot);
  if(tgt){h.aim=Math.atan2(tgt.y-h.y,tgt.x-h.x);if(!h.moving)h.face=h.aim}
  // la scia e le gocce sono attaccate a punti del mondo (i piedi dell'eroe e dello zombie colpito, ripresi con S a ogni fotogramma) più uno
  // scarto sullo schermo (la bocca dell'arma, l'altezza del petto, il volo delle gocce): girando la telecamera restano dove sono successe
  if(!h.moving&&tgt&&h.fireCd<=0&&!noShoot){h.fireCd=.36;tgt.hp--;tgt.flash=.12;const B=basis(heroDir()*Math.PI/4),zk=RIGK.hzk,pp=window.ARMI&&ARMI.inManoPunti&&ARMI.inManoPunti('pistola',B,gunState?gunState.pose():{},scrAng(h.aim)),m=pp&&pp.muzzle,
    hw=[h.x,h.y,h.zh||0],tw=[tgt.x,tgt.y,tgt.zh||0],ty=-24*RIGK.mzk;W.FX.push({k:'shot',hw,ao:m?[m[0]*B.f*zk,(m[1]-8)*zk]:[Math.cos(h.aim)*16,-14+Math.sin(h.aim)*16],tw,bo:[0,ty],t:.08});
    for(let i=0;i<5;i++)W.FX.push({k:'drop',tw,x:0,y:ty,vx:rr(-40,40),vy:rr(-60,-10),t:.5});if(tgt.hp<=0){tgt.die=.001;W.coins+=60}}
  spawnT-=dt;if(zOn&&spawnT<=0&&W.Z.length<5){spawn();spawnT=rr(2,3.5)}navUpdate(dt);
  for(const z of W.Z){if(z.flash>0)z.flash-=dt;if(z.die){z.die+=dt;continue}z.zh=(z.zh||0)+(heightAt(z.x,z.y)-(z.zh||0))*Math.min(1,dt*14);if(z.rise<1){z.rise=Math.min(1,z.rise+dt/1.3);z.face=Math.atan2(h.y-z.y,h.x-z.x);continue}
    const dx=h.x-z.x,dy=h.y-z.y,d=Math.hypot(dx,dy);
    if(d<30&&physClear(z.x,z.y,h.x,h.y,2)){z.face=Math.atan2(dy,dx);if(z.anim!=='attack'){z.anim='attack';z.p=0}z.p+=dt/1.4;z.chk=0;z.cx0=null}else{if(z.anim!=='walk'){z.anim='walk';z.p=0}z.p+=dt/(z.kind==='hound'?.6:1.1);zWalk(z,dt)}
    for(const o of W.Z)if(o!==z&&!o.die&&o.rise>=1){const ex=z.x-o.x,ey=z.y-o.y,e=Math.hypot(ex,ey);if(e>0&&e<24)move(z,ex/e*(24-e)*.5,ey/e*(24-e)*.5,ZR)}z.p%=1}
  for(let i=W.Z.length-1;i>=0;i--)if(W.Z[i].die>1.1||(!zOn&&W.Z[i].rise<1))W.Z.splice(i,1);
  for(const f of W.FX){f.t-=dt;if(f.k==='drop'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt}}for(let i=W.FX.length-1;i>=0;i--)if(W.FX[i].t<=0)W.FX.splice(i,1);
  for(const hs of houses){const{x,y,w,d}=hs,pc=hs.porch;hs.inside=(h.x>x&&h.x<x+w&&h.y>y&&h.y<y+d+4)||(pc&&h.x>pc[0]&&h.x<pc[2]&&h.y>pc[1]&&h.y<pc[3]);hs.a+=((hs.inside?0:1)-hs.a)*Math.min(1,dt*7)}
  for(const f of fades){const dx=h.x-f.x,dy=h.y-f.ky,U=dx*CAM.c-dy*CAM.s,V=dx*CAM.s+dy*CAM.c,reach=f.reach*CAM.CP/CAM.SP,b=V<0&&V>-reach&&Math.abs(U)<f.rx;f.a+=((b?.35:1)-f.a)*Math.min(1,dt*6)}}
// gli zombie (CR.*) hanno il loro scheletro 3D: basta girarli di ψ (face+ψ) e passare l'inclinazione con camRig. La terra smossa e i sassi
// stanno a terra intorno ai piedi: hanno le misure di prima (la barra di terra larga 18+8k × 8+3k, i sassi su un'ellisse r × r/2), ma sono
// un'ellisse del mondo disegnata nelle coordinate del terreno, così girando restano appoggiati a terra (a vista dritta è il disegno di prima,
// identico al pixel). Il salto dei sassi è un'altezza (CP); la discesa nella buca segue la misura della figura (mzk); il ritaglio è il
// rettangolo sopra la linea dei piedi, come prima. (Un mucchio allungato come la fossa, che la riempie, è una proposta da mostrare a Denis)
const MOUND=k=>[18+8*k,8+3*k];// i raggi del mucchio a terra (x, y del mondo) mentre lo zombie esce (k = rise)
function drawZombie(z){const q=S(z.x,z.y,z.zh||0),zk=RIGK.mzk,fc=z.face+CAM.yaw;
  if(z.rise<1){const k=z.rise,c=CAM.c,s=CAM.s,SP=CAM.SP,[mx,my]=MOUND(k),
      G=(ox,oy)=>[q[0]+ox*c-oy*s,q[1]+(ox*s+oy*c)*SP];// un punto del terreno intorno ai piedi, (ox, oy) nel mondo
    ctx.fillStyle='#4a3a2a';ctx.save();ctx.translate(q[0],q[1]);ctx.transform(c,SP*s,-s,SP*c,0,0);ctx.beginPath();ctx.ellipse(0,0,mx,my,0,0,TAU);ctx.restore();ctx.fill();
    for(let i=0;i<6;i++){const a=i*1.05+z.x,r=10+k*16,g=G(Math.cos(a)*r,Math.sin(a)*r*.5);ctx.fillStyle='#64503a';ball([g[0],g[1]-Math.sin(k*Math.PI)*6*CAM.CP],2.4);ctx.fill()}
    if(k>.25){const u=ez((k-.25)/.75);ctx.save();ctx.beginPath();ctx.rect(q[0]-60,q[1]-150,120,151);ctx.clip();
      ctx.translate(0,(1-u)*60*z.sc*zk);CR[z.kind](q[0],q[1],fc,'idle',(W.t*.6)%1,z.sc);ctx.restore()}return}
  if(z.die){const k=Math.min(1,z.die/1.1);ctx.save();ctx.globalAlpha=1-k*k;ctx.beginPath();ctx.rect(q[0]-60,q[1]-150,120,151);ctx.clip();ctx.translate(0,ez(k)*50*z.sc*zk);CR[z.kind](q[0],q[1],fc,'idle',0,z.sc);ctx.restore();return}
  CR[z.kind](q[0],q[1],fc,z.anim,z.p,z.sc);if(z.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,255,255',q[0],q[1]-24*z.sc*zk,22*z.sc,.5);ctx.restore()}}
const alphaOf=(hs,part)=>part==='roof'?hs.a:part==='front'?.22+.78*hs.a:part==='in'?(hs.a>.95?0:1):1;
// l'eroe è disegnato in 8 direzioni: quella sullo schermo (scrAng) con l'isteresi di setFace (poligono/prova.js), così girando la telecamera
// non sfarfalla tra due viste; l'arma prende l'angolo vero sullo schermo
function heroDir(){const h=W.hero,sa=scrAng(h.face),d=Q8(sa),cur=h.dS==null?d:h.dS,df=Math.atan2(Math.sin(sa-cur*Math.PI/4),Math.cos(sa-cur*Math.PI/4));h.dS=Math.abs(df)>Math.PI/8+.12?d:cur;return h.dS}
// (senza aim l'arma segue il corpo: null, non scrAng(undefined) = NaN)
function drawHero(){const h=W.hero,q=S(h.x,h.y,h.zh||0);drawRig(q[0],q[1]-8,heroDir()*Math.PI/4,h.walk,h.moving,HSTYLE,{gp:gunState?gunState.pose():{},aim:h.aim==null?null:scrAng(h.aim)})}
function drawEntry(e,h0a){if(e.p){LEANK=e.p.lk==null?1:e.p.lk;setRef(e.p.ref);drawProp(e.p,e.p.house?part=>alphaOf(e.p.house,part):null);LEANK=1;setRef(null);return}if(e.hero){drawHero();return}if(e.fl){drawFlame(e.fl,h0a);return}if(e.pc){drawPerch(e.pc);return}drawZombie(e.z)}
// la sagoma dell'eroe dove è coperto (dietro la casa, la cripta, un albero): si ridisegnano in una tela piccola solo le cose davanti a lui che
// toccano il suo riquadro, e lì sopra si stampa la sua sagoma chiara a metà trasparenza. Costa qualcosa solo quando è davvero coperto.
let SIL=null,LASTOCC=[];
function heroBox(){const h=W.hero,q=S(h.x,h.y,h.zh||0);return[q[0]-18,q[1]-58*RIGK.hzk,q[0]+18,q[1]+6]}
// il riquadro vero di un prop (dai punti 3D dei suoi pezzi; o.ob se lo dà chi lo costruisce): [x0,y0,x1,y1,zTop], calcolato una volta
function obOf(p){if(p._ob)return p._ob;if(p.ob)return p._ob=p.ob;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,z1=0,any=false;const add=(q,r)=>{r=r||0;any=true;x0=Math.min(x0,q[0]-r);x1=Math.max(x1,q[0]+r);y0=Math.min(y0,q[1]-r);y1=Math.max(y1,q[1]+r);z1=Math.max(z1,(q[2]||0)+r)};
  for(const t of p.parts){if(t.c)t.c.forEach(q=>add(q));else if(t.pts)t.pts.forEach(q=>add(q));else if(t.a){add(t.a,t.w);add(t.b,t.w)}else if(t.p)add(t.p,t.r)}
  return p._ob=any?[x0-3,y0-3,x1+3,y1+3,z1+4]:[p.bx[0],p.bx[1],p.bx[2],p.bx[3],p.bx[4]]}
function occluders(list,hi){const out=[];if(hi<0)return out;let[bx0,by0,bx1,by1]=heroBox();bx0+=5;bx1-=5;// il riquadro della figura, un po' più stretto di quello per le misure
  for(let i=hi+1;i<list.length;i++){const e=list[i];if(!e.p)continue;const p=e.p;if(p.house&&p.house.inside&&p.parts[0]&&(p.parts[0].part==='front'||p.parts[0].part==='roof'))continue;// il muro davanti e il tetto sono già trasparenti
    // le cose alte si piegano sempre via dal centro della visuale (l'eroe, o dove guarda il dito a destra): la tolleranza per la piega va solo dal lato opposto
    // con la telecamera girata la stessa prova fatta in (u, v): il riquadro vero girato intorno al perno, schiacciato di SP, con la stessa
    // tolleranza per la piega di lato e per l'altezza (·CP). A ψ=0 e θ=45° dà gli stessi numeri della strada dritta: niente salti della sagoma
    const o=obOf(p),pl=.37*o[4]*(p.lk==null?1:p.lk)+2;let X0=o[0],X1=o[2],Y0=o[1],Y1=o[3],H=o[4];
    if(CAM.rot){const c=CAM.c,s=CAM.s;let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const X of[o[0],o[2]])for(const Y of[o[1],o[3]]){const dx=X-CAM.x,dy=Y-CAM.y,u=dx*c-dy*s,v=dx*s+dy*c;if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v}
      X0=CAM.x+u0;X1=CAM.x+u1;Y0=CAM.y+v0*CAM.SP;Y1=CAM.y+v1*CAM.SP;H=o[4]*CAM.CP}
    const hx=CAM.x,padE=X0>hx||p.ref?pl:1,padW=X1<hx||p.ref?pl:1;if(X1+padE<bx0||X0-padW>bx1||Y1+3<by0||Y0-H*1.37>by1)continue;out.push(e)}return out}
function silhouette(occ,h0a){if(!occ.length||W.dbg.noSil)return;const m=ctx.getTransform(),[bx0,by0,bx1,by1]=heroBox(),X0=Math.floor(m.a*bx0+m.e),Y0=Math.floor(m.d*by0+m.f),X1=Math.ceil(m.a*bx1+m.e),Y1=Math.ceil(m.d*by1+m.f),Q=.5,w=Math.ceil((X1-X0)*Q),hh=Math.ceil((Y1-Y0)*Q);if(w<=0||hh<=0)return;// a metà risoluzione: è un velo morbido
  if(!SIL)SIL={o:document.createElement('canvas'),h:document.createElement('canvas')};for(const c of[SIL.o,SIL.h]){if(c.width<w)c.width=w;if(c.height<hh)c.height=hh}
  // memoria: se l'eroe, la telecamera, chi lo copre e le trasparenze non sono cambiati, si riusa la sagoma del fotogramma prima
  const h=W.hero,key=[Math.round(h.x*2),Math.round(h.y*2),Math.round((h.zh||0)*2),Math.round(h.face*8),h.moving?Math.floor(h.walk*3):-1,Math.round(CAM.x*2),Math.round(CAM.y*2),Math.round(CAM.z*100),Math.round(CAM.yaw*200),Math.round(CAM.el*200),Math.round(CAM.oy*2),w,hh,occ.map(e=>props.indexOf(e.p)+':'+Math.round((e.p.house?e.p.house.a:1)*20)).join(',')].join('|');
  if(SIL.key!==key){SIL.key=key;
  const sv=ctx;try{let g=SIL.h.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,hh);g.setTransform(m.a*Q,0,0,m.d*Q,(m.e-X0)*Q,(m.f-Y0)*Q);ctx=g;drawHero();
      g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgb(160,240,228)';g.fillRect(0,0,w,hh);g.globalCompositeOperation='source-over';
      g=SIL.o.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,hh);g.setTransform(m.a*Q,0,0,m.d*Q,(m.e-X0)*Q,(m.f-Y0)*Q);ctx=g;for(const e of occ)drawEntry(e,h0a);
      g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.globalAlpha=1;g.drawImage(SIL.h,0,0);g.globalCompositeOperation='source-over'}finally{ctx=sv}}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.55;ctx.imageSmoothingEnabled=true;ctx.drawImage(SIL.o,0,0,w,hh,X0,Y0,X1-X0,Y1-Y0);ctx.restore()}
// ------------------------------------------------------------------ il fotogramma del mondo (in coordinate del mondo, già trasformate)
let liveDraw=null,LASTLIST=[];// l'area può aggiungere disegni dal vivo: liveDraw(dt)
// fuori dalla mappa (girando, negli angoli si vede oltre il bordo): la stessa erba della mappa che sfuma nella nebbia, in un motivo che si
// ripete (una chiamata sola), e sopra, vicino al bordo, il terreno del bordo che prosegue (makeEdgeBands); dentro la mappa gli ultimi 28 px
// cominciano a sfumare, così il bordo non fa una riga. Solo con la
// telecamera girata, e compare piano (edgeK: tutto dopo 8° di giro o 4° di inclinazione): a vista dritta resta il disegno di prima e
// non c'è un salto quando si comincia a girare o quando la bussola riporta a nord. Con LOWFX niente erba: solo la sfumatura del bordo
const edgeK=()=>cl(Math.max(Math.abs(wrapA(CAM.yaw))/(8*DEG),Math.abs(CAM.el-EL0)/(4*DEG)),0,1),EDGEF=.18;
let edgeTile=null,edgePat=null;
function makeEdgeTile(){const N=256,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),sd=seed;srand(hashS('bordo del mondo'));
  // i segni che escono da un lato rientrano dall'altro: niente cuciture
  const wrap=(x,y,m,f)=>{for(const ox of[0,-N,N])for(const oy of[0,-N,N]){if((ox&&(x+ox<-m||x+ox>N+m))||(oy&&(y+oy<-m||y+oy>N+m)))continue;f(x+ox,y+oy)}};
  g.fillStyle='#33412a';g.fillRect(0,0,N,N);// i toni dell'erba della mappa (prop.js, G.grass): il bordo non cambia colore, lo scurisce solo la nebbia
  for(let i=0;i<14;i++){const x=rr(0,N),y=rr(0,N),r=rr(30,70),cc=rnd()<.5?'36,50,29':'62,80,46';wrap(x,y,r,(X,Y)=>{const gr=g.createRadialGradient(X,Y,0,X,Y,r);gr.addColorStop(0,`rgba(${cc},.4)`);gr.addColorStop(1,`rgba(${cc},0)`);g.fillStyle=gr;g.fillRect(X-r,Y-r,2*r,2*r)})}
  g.lineWidth=1.4;for(let i=0;i<N*N/70;i++){const x=rr(0,N),y=rr(0,N),k=rnd(),dx=rr(-1.6,1.6),dy=-rr(2.5,5);g.strokeStyle=k<.4?'#293520':k<.8?'#475c34':'#5a7140';wrap(x,y,6,(X,Y)=>{g.beginPath();g.moveTo(X,Y);g.lineTo(X+dx,Y+dy);g.stroke()})}
  seed=sd;return c}
function drawEdge(k){if(!edgeTile)edgeTile=makeEdgeTile();if(!edgePat||edgePat._c!==ctx){edgePat=ctx.createPattern(edgeTile,'repeat');edgePat._c=ctx}
  ctx.save();ctx.globalAlpha=k;try{drawEdge0()}finally{ctx.restore()}}
// fuori dalla mappa il terreno del bordo prosegue (girando si vede oltre il bordo, e un sentiero o la terra del cimitero che finiscono dritti
// contro l'erba sembrano tagliati): una striscia di EB px del terreno, specchiata sul bordo (così continua senza riga: sentiero, terra, erba)
// e negli angoli specchiata due volte, che man mano che si allontana si scioglie nel motivo d'erba; sopra la nebbia. Il terreno è quello
// dipinto dall'area prima delle ombre e delle macchie (specchiate, le ombre del muro nord sembravano un muro fantasma fuori), e se l'area
// chiama edgeSnap() nel suo pittore, solo quello dipinto fino a lì (il terreno di base, senza fosse e pozzanghere vicino al bordo). Le quattro
// strisce si preparano una volta, piene (l'erba del motivo è già dentro, allineata al mondo come quella dal vivo: dove si toccano o
// finiscono non c'è un orlo), e ogni fotogramma sono 4 drawImage. Nord e sud comprendono gli angoli; ovest ed est 1 px in più per lato
const EB=64;
function makeEdgeBands(src,w,h){if(!edgeTile)edgeTile=makeEdgeTile();const k=src.width/w,E=EB,out=[];
  const fade=g=>{g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.3,'rgba(0,0,0,.85)');g.addColorStop(.6,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');return g};
  const lin=(x0,y0,x1,y1)=>g=>fade(g.createLinearGradient(x0,y0,x1,y1)),rad=(x,y)=>g=>fade(g.createRadialGradient(x,y,0,x,y,E));
  // D(a,d,e,f): il terreno con lo specchio x → a·x+e, y → d·y+f (a, d = ±1)
  const D=(a,d,e,f)=>g=>{g.transform(a,0,0,d,e,f);g.drawImage(src,0,0,src.width,src.height,0,0,w,h)};
  // una striscia: il rettangolo del mondo X0..X1 × Y0..Y1; pieces = [riquadro, disegno] del terreno specchiato; masks = [riquadro, sfumatura]
  const band=(X0,Y0,X1,Y1,pieces,masks)=>{const mk=()=>{const c=document.createElement('canvas');c.width=Math.round((X1-X0)*k);c.height=Math.round((Y1-Y0)*k);const g=c.getContext('2d');g.setTransform(k,0,0,k,-X0*k,-Y0*k);return[c,g]};
    const[c,g]=mk(),[t,tg]=mk();g.fillStyle=g.createPattern(edgeTile,'repeat');g.fillRect(X0,Y0,X1-X0,Y1-Y0);
    const inR=(G,r,f)=>{G.save();G.beginPath();G.rect(r[0],r[1],r[2]-r[0],r[3]-r[1]);G.clip();f(G);G.restore()};
    for(const[r,f] of pieces)inR(tg,r,f);tg.globalCompositeOperation='destination-in';for(const[r,gr] of masks)inR(tg,r,G=>{G.fillStyle=gr(G);G.fillRect(r[0],r[1],r[2]-r[0],r[3]-r[1])});
    g.setTransform(1,0,0,1,0,0);g.drawImage(t,0,0);out.push({c,X0,Y0,W:c.width/k,H:c.height/k})};
  band(-E,h-1,w+E,h+E,[[[0,h-1,w,h],D(1,1,0,0)],[[0,h,w,h+E],D(1,-1,0,2*h)],[[-E,h,0,h+E],D(-1,-1,0,2*h)],[[w,h,w+E,h+E],D(-1,-1,2*w,2*h)]],
    [[[0,h-1,w,h+E],lin(0,h,0,h+E)],[[-E,h,0,h+E],rad(0,h)],[[w,h,w+E,h+E],rad(w,h)]]);
  band(-E,-E,w+E,1,[[[0,0,w,1],D(1,1,0,0)],[[0,-E,w,0],D(1,-1,0,0)],[[-E,-E,0,0],D(-1,-1,0,0)],[[w,-E,w+E,0],D(-1,-1,2*w,0)]],
    [[[0,-E,w,1],lin(0,0,0,-E)],[[-E,-E,0,0],rad(0,0)],[[w,-E,w+E,0],rad(w,0)]]);
  band(-E,-1,1,h+1,[[[0,0,1,h],D(1,1,0,0)],[[-E,0,0,h],D(-1,1,0,0)],[[-E,-1,0,0],D(-1,-1,0,0)],[[-E,h,0,h+1],D(-1,-1,0,2*h)]],
    [[[-E,0,1,h],lin(0,0,-E,0)],[[-E,-1,0,0],rad(0,0)],[[-E,h,0,h+1],rad(0,h)]]);
  band(w-1,-1,w+E,h+1,[[[w-1,0,w,h],D(1,1,0,0)],[[w,0,w+E,h],D(-1,1,2*w,0)],[[w,-1,w+E,0],D(-1,-1,2*w,0)],[[w,h,w+E,h+1],D(-1,-1,2*w,2*h)]],
    [[[w-1,0,w+E,h],lin(w,0,w+E,0)],[[w,-1,w+E,0],rad(w,0)],[[w,h,w+E,h+1],rad(w,h)]]);
  return out}
function drawEdge0(){const w=W.w,h=W.h,M=Math.max(w,h)*1.5,F=210;ctx.fillStyle=edgePat;ctx.fillRect(-M,-M,M+1,h+2*M);ctx.fillRect(w-1,-M,M+1,h+2*M);ctx.fillRect(0,-M,w,M+1);ctx.fillRect(0,h-1,w,M+1);// solo intorno alla mappa (1 px sotto il bordo, niente righe)
  if(W.edgeBands&&!W.dbg.noBands)for(const b of W.edgeBands)ctx.drawImage(b.c,b.X0,b.Y0,b.W,b.H);// il terreno del bordo che prosegue (sopra il motivo, sotto la nebbia)
  // la nebbia: lungo i lati una sfumatura dritta, negli angoli una tonda, dal bordo della mappa al buio in F px
  const st=g=>{g.addColorStop(0,`rgba(11,12,18,${EDGEF})`);g.addColorStop(.55,'rgba(11,12,18,.72)');g.addColorStop(1,'rgba(11,12,18,1)');ctx.fillStyle=g},
    band=(x,y,bw,bh,gx0,gy0,gx1,gy1)=>{st(ctx.createLinearGradient(gx0,gy0,gx1,gy1));ctx.fillRect(x,y,bw,bh)},
    corner=(cx,cy,x,y)=>{st(ctx.createRadialGradient(cx,cy,0,cx,cy,F));ctx.fillRect(x,y,M,M)};
  band(-M,0,M,h,0,0,-F,0);band(w,0,M,h,w,0,w+F,0);band(0,-M,w,M,0,0,0,-F);band(0,h,w,M,0,h,0,h+F);
  corner(0,0,-M,-M);corner(w,0,w,-M);corner(w,h,w,h);corner(0,h,-M,h)}
// dentro la mappa: da trasparente a 28 px dal bordo fino a EDGEF sul bordo (dove comincia la nebbia di fuori). Quattro trapezi con gli
// angoli a 45°, così negli angoli la sfumatura non si somma due volte
function drawRim(k){const w=W.w,h=W.h,B=28,c=`rgba(11,12,18,${EDGEF})`,z='rgba(11,12,18,0)';ctx.save();ctx.globalAlpha=k;
  try{for(const[P,x0,y0,x1,y1] of[[[[0,0],[w,0],[w-B,B],[B,B]],0,B,0,0],[[[w,0],[w,h],[w-B,h-B],[w-B,B]],w-B,0,w,0],[[[w,h],[0,h],[B,h-B],[w-B,h-B]],0,h-B,0,h],[[[0,h],[0,0],[B,B],[B,h-B]],B,0,0,0]]){
    const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,z);g.addColorStop(1,c);ctx.fillStyle=g;path(P);ctx.fill()}}finally{ctx.restore()}}
// il riquadro di un prop per la scelta dei visibili: quello dato da chi lo costruisce unito a quello vero dei suoi pezzi
function fpOf(p){if(p._fp)return p._fp;const o=obOf(p),b=p.bx;return p._fp=[Math.min(o[0],b[0]),Math.min(o[1],b[1]),Math.max(o[2],b[2]),Math.max(o[3],b[3]),Math.max(o[4],b[4]||0)]}
// la profondità per l'ordine di disegno: a vista dritta la y del bordo davanti (ky, come prima); con la telecamera girata, provvisoriamente
// (finché non arriva il motore dell'ordine, fase 3), la profondità V = x·s + y·c del punto (centro x del riquadro, ky). Le cose con kyFn
// (le ante aperte: un segmento in diagonale tra due angoli del riquadro, kyFn = la sua y alla x dell'eroe) prendono la V del punto del
// segmento alla u dell'eroe: è kyFn rifatto in (u, v), uguale a kyFn quando ψ = 0 (anche solo inclinando), quindi nessun salto.
// La parte con la x (x·s) entra piano: niente fino a KX0 = 0,5° di giro, tutta da 1,5°. Così uscendo da nord le cose con la stessa ky (i pezzi di
// una corsa di muro) restano nell'ordine della strada dritta e i loro contorni non si scambiano di colpo al primo fotogramma girato (a destra
// li avrebbe messi al contrario); si scambiano a mezzo grado, mentre la vista già si muove
const KX0=.5*DEG,KX1=DEG;let KS=0;
const KV=(x,y)=>x*KS+y*CAM.c;
function kySeg(p){if(p._ks)return p._ks;const b=p.bx,xa=b[0]+4,xb=b[2]-4;return p._ks=xb-xa<1?[xa,b[1]+4,xa,b[3]-4]:[xa,p.kyFn(xa),xb,p.kyFn(xb)]}
function keyOf(p,hx,hy){if(!CAM.rot)return p.kyFn?p.kyFn(hx):p.ky;if(!p.kyFn)return KV((p.bx[0]+p.bx[2])/2,p.ky);
  const[x0,y0,x1,y1]=kySeg(p),c=CAM.c,s=CAM.s,ua=x0*c-y0*s,ub=x1*c-y1*s,va=KV(x0,y0),vb=KV(x1,y1);
  return Math.abs(ub-ua)<1?Math.max(va,vb):va+(vb-va)*cl((hx*c-hy*s-ua)/(ub-ua),0,1)}
// il corvo posato si disegna subito dopo la cosa su cui sta (cercata una volta: il prop alto che lo contiene)
function perchHost(c){if(c._host!==undefined)return c._host;let best=null;for(const p of props){if(p.floor)continue;const b=p.bx;if(c.x<b[0]-6||c.x>b[2]+6||c.y<b[1]-6||c.y>b[3]+6||(b[4]||0)<c.z-15)continue;if(!best||p.ky>best.ky)best=p}return c._host=best}
function drawWorld(dt,view){const h0=houses[0],h0a=h0?h0.a:1,D=W.dbg;
  // il terreno: quando è rimpicciolito più della metà (dpr·zoom < GT/2: un pixel copre più di due punti della foto, come nella vista intera su
  // uno schermo a 1×) la levigatura 'medium' (con le mipmap) evita lo sfarfallio girando; sopra la metà la levigatura normale basta e 'medium'
  // sul telefono sfocherebbe per niente. Vale per tutte e due le strade, dritta e girata, così non c'è un salto quando si comincia a girare o
  // la bussola riporta a nord. La scala vera è √|det|/SP = dpr·zoom (la componente a della matrice è dpr·zoom·cos ψ: girando scende a 0 e poi
  // sotto, e accendeva 'medium' per niente)
  const ek=CAM.rot?edgeK():0;KS=CAM.s*cl((Math.abs(wrapA(CAM.yaw))-KX0)/KX1,0,1);
  inGround(()=>{if(ek>0&&!LOWFX)drawEdge(ek);const m=ctx.getTransform(),sq=ctx.imageSmoothingQuality;if(Math.sqrt(Math.abs(m.a*m.d-m.b*m.c)/CAM.SP)<GT/2)ctx.imageSmoothingQuality='medium';
    ctx.drawImage(W.ground,0,0,W.ground.width,W.ground.height,0,0,W.w,W.h);ctx.imageSmoothingQuality=sq;if(ek>0)drawRim(ek)});
  // chi si vede: l'impronta del prop girata intorno al perno (u, v), allargata della piega più grande che può avere (LK·altezza di lato,
  // LKV in verticale) e di un margine; a vista dritta vale come prima (senza più il riquadro del mondo, che girando nasconderebbe cose)
  const HW=view.Wp/2/CAM.z+24,HH=view.Hp/2/CAM.z+24,c=CAM.c,s=CAM.s,SP=CAM.SP,CP=CAM.CP,oy=CAM.oy;
  const vis=D.visAll?()=>true:p=>{const f=fpOf(p),z1=f[4],ex=LK*z1*(p.lk==null?1:p.lk);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
    for(const X of[f[0],f[2]])for(const Y of[f[1],f[3]]){const dx=X-CAM.x,dy=Y-CAM.y,u=dx*c-dy*s,v=dx*s+dy*c;if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v}
    return u0-ex<HW&&u1+ex>-HW&&v1*SP+oy>-HH&&v0*SP-z1*CP-LKV*z1+oy<HH};
  // il pavimento: cumuli, pedane, gradini, tappeti (stanno sotto i piedi di tutti)
  for(const p of props)if(p.floor&&vis(p)){LEANK=p.lk==null?1:p.lk;setRef(p.ref);drawProp(p,p.house?part=>alphaOf(p.house,part):null);LEANK=1;REF=null}
  inGround(()=>drawClouds(dt));drawCrowShadows();drawLights(h0a);
  // tutto ciò che sta in piedi, dal fondo verso davanti; gli esseri, le fiamme e i corvi posati in mezzo
  const hx=W.hero?W.hero.x:0,hy=W.hero?W.hero.y:0,list=[];for(const p of props){if(p.floor||!vis(p))continue;list.push({k:keyOf(p,hx,hy),p})}
  for(const z of W.Z)list.push({k:KV(z.x,z.y+.01),z});if(W.hero&&!D.noHero&&!D.heroLast)list.push({k:KV(W.hero.x,W.hero.y+.01),hero:1});if(!D.noFlames)for(const f of flames)list.push({k:KV(f.x,f.ky!=null?f.ky:f.y+.6),fl:f});
  for(const c of perches){if(c.away)continue;const ho=perchHost(c);list.push({k:ho?keyOf(ho,hx,hy)+.05:KV(c.x,c.y+.6),pc:c})}
  list.sort((a,b)=>a.k-b.k);let hi=-1;
  for(let i=0;i<list.length;i++){const e=list[i];if(e.hero)hi=i;drawEntry(e,h0a)}
  if(D.heroLast&&!D.noHero&&W.hero)drawHero();
  LASTOCC=occluders(list,hi);silhouette(LASTOCC,h0a);LASTLIST=list;
  if(!LOWFX){for(const p of W.puffs){setRef(p.ref);const q=S(p.x,p.y,p.z);setRef(null);ctx.fillStyle=`rgba(150,150,165,${.28*(1-p.t/3.2)})`;ball(q,p.r);ctx.fill()}
    for(const l of W.leaves){const q=S(l.x,l.y,l.z);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(l.t*4+l.ph);ctx.fillStyle=l.c;ctx.beginPath();ctx.ellipse(0,0,2.6,1.2,0,0,TAU);ctx.fill();ctx.restore()}
    ctx.save();ctx.globalCompositeOperation='lighter';for(const f of W.flies){const q=S(f.x,f.y,f.z),b=.5+.5*Math.sin(W.t*3+f.ph);glow('170,255,120',q[0],q[1],9,.5*b);ctx.fillStyle=`rgba(230,255,190,${.9*b})`;ctx.fillRect(q[0]-.8,q[1]-.8,1.6,1.6)}ctx.restore()}
  for(const f of W.FX){if(f.k==='shot'){const g=S(f.hw),t=S(f.tw),a=[g[0]+f.ao[0],g[1]+f.ao[1]];ctx.strokeStyle='rgba(255,230,160,.9)';ctx.lineWidth=2;seg(a,[t[0]+f.bo[0],t[1]+f.bo[1]]);ctx.stroke();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,210,120',a[0],a[1],14,.8);ctx.restore()}}
    else{const t=S(f.tw);ctx.fillStyle='#3a5a1e';ball([t[0]+f.x,t[1]+f.y],1.8);ctx.fill()}}
  if(liveDraw)liveDraw(dt);drawMist(dt);drawFlock()}
function updateAmbient(dt){W.t+=dt;updateCrows(dt);if(LOWFX)return;
  for(const f of W.flies){f.a+=dt*(Math.sin(W.t*.7+f.ph)*1.6);f.x+=Math.cos(f.a)*14*dt;f.y+=Math.sin(f.a)*14*dt;f.z=cl(f.z+Math.sin(W.t*2+f.ph)*8*dt,4,50);if(f.x<0)f.x=W.w;if(f.x>W.w)f.x=0;if(f.y<0)f.y=W.h;if(f.y>W.h)f.y=0}
  for(const s of smokes){s.t-=dt;if(s.t<=0){s.t=.22;W.puffs.push({x:s.x+rr(-3,3),y:s.y+rr(-3,3),z:s.z,t:0,r:rr(4,6),ref:s.ref})}}
  for(const p of W.puffs){p.t+=dt;p.z+=16*dt;p.x+=10*dt;p.r+=5*dt}for(let i=W.puffs.length-1;i>=0;i--)if(W.puffs[i].t>3.2)W.puffs.splice(i,1);
  for(const tr of W.leafTrees||[])if(Math.random()<dt*.8)W.leaves.push({x:tr[0]+rr(-40,40),y:tr[1]+rr(-40,40),z:rr(70,90),t:0,ph:rr(0,6),c:['#a8562a','#c87a2a','#d0a040'][Math.floor(Math.random()*3)]});
  for(const l of W.leaves){l.t+=dt;l.z-=14*dt;l.x+=Math.sin(l.t*3+l.ph)*20*dt+6*dt}for(let i=W.leaves.length-1;i>=0;i--)if(W.leaves[i].z<0)W.leaves.splice(i,1)}
// ------------------------------------------------------------------ la pagina: tela, levetta, telecamera, bussola, bottoni
function boot(area){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}
  area.build();navBuild();if(window.ARMI){try{gunState=ARMI.nuova('pistola')}catch(e){gunState=null}}
  for(let i=0;i<16;i++)W.flies.push({x:rr(0,W.w),y:rr(0,W.h),z:rr(6,40),a:rr(0,TAU),ph:rr(0,TAU)});for(let i=0;i<9;i++)W.mists.push({x:rr(-100,W.w+100),y:rr(0,W.h),r:rr(80,160),v:rr(6,14)});
  for(let i=0;i<4;i++)W.clouds.push({x:rr(-300,W.w),y:rr(-100,W.h),r:rr(220,360),v:rr(9,16)});
  const ov=document.createElement('div');ov.id='mz';ov.innerHTML=`<style>
  #mz{position:fixed;inset:0;z-index:99999;background:#0b0c12;font-family:"Baloo 2",system-ui,sans-serif;color:#efe6d0;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
  #mz canvas{position:absolute;inset:0;width:100%;height:100%}
  #mz .top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(rgba(8,8,12,.85),rgba(8,8,12,0));pointer-events:none}
  #mz h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:19px;letter-spacing:.02em;text-shadow:0 2px 0 #000}
  #mz .cash{font:800 14px "Baloo 2",system-ui;color:#ffd65a;text-shadow:0 2px 0 #000;white-space:nowrap}
  #mz .bar{position:absolute;left:0;right:0;bottom:0;padding:10px 10px calc(20px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:linear-gradient(rgba(8,8,12,0),rgba(8,8,12,.9))}
  #mz button{font:700 14px "Baloo 2",system-ui;color:#efe6d0;background:#33302e;border:2px solid #000;border-radius:12px;padding:8px 12px;box-shadow:0 3px 0 #000}
  #mz button.on{background:#4a6a2a;color:#eaffd0}#mz button:active{transform:translateY(2px);box-shadow:0 1px 0 #000}
  #mz .nord{position:absolute;right:8px;top:calc(48px + env(safe-area-inset-top,0px));width:60px;height:60px;cursor:pointer;opacity:.62;transition:opacity .3s,transform .08s;-webkit-tap-highlight-color:transparent}
  #mz .nord.lit{opacity:1}#mz .nord:active{transform:scale(.9)}
  #mz .hint{position:absolute;left:0;right:0;bottom:100px;text-align:center;font-size:13px;line-height:1.35;opacity:.65;pointer-events:none;transition:opacity 1s}
  </style><canvas id="mzCv"></canvas><div class="top"><h1>${area.title||'Mappa zombie'}</h1><span class="cash" id="mzCash"></span></div>
  <div class="nord" id="mzNord" role="button" aria-label="Torna a nord" title="Torna a nord (N)"><canvas></canvas></div>
  <div class="hint" id="mzHint"></div><div class="bar" id="mzBar"></div>`;document.body.appendChild(ov);
  const cv=ov.querySelector('#mzCv'),barEl=ov.querySelector('#mzBar'),cashEl=ov.querySelector('#mzCash'),hintEl=ov.querySelector('#mzHint'),nordEl=ov.querySelector('#mzNord'),ncv=nordEl.querySelector('canvas');let low=false,whole=false;
  const ui=()=>{barEl.innerHTML='';const mk=(t,on,f)=>{const b=document.createElement('button');b.textContent=t;b.className=on?'on':'';b.onclick=()=>{f();ui()};barEl.appendChild(b)};
    mk('Zombie',zOn,()=>{zOn=!zOn});mk('Effetti bassi',low,()=>{low=!low});mk('Vista intera',whole,()=>{whole=!whole})};ui();
  const fine=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
  hintEl.innerHTML=fine?'WASD: cammina · Q/E o trascina: gira · R/F: inclina<br>N o la bussola: torna a nord':'Sinistra: cammina · Destra: trascina per girare e inclinare<br>Bussola in alto: torna a nord';
  // due comandi (Denis, 12 ottobre): il dito a sinistra muove l'eroe (relativo allo schermo), il dito a destra tiene la telecamera: di lato la
  // gira intorno all'eroe, su e giù la inclina. Ogni dito ha il suo comando (pointerId), così si cammina e si gira insieme; se il lato del
  // dito è già occupato prende il comando libero (il pollice che passa la metà). La telecamera resta dove la si lascia; la bussola la riporta a nord.
  const STR=60;// oltre questa distanza la base della levetta segue il dito (girarsi indietro è subito, come in Archero)
  const stick={id:null,x0:0,y0:0,x:0,y:0},look={id:null,x0:0,y0:0,x:0,y:0,px:0,py:0,on:false,ax:0,ay:0,t:9,sum:0};
  const cam={yawT:0,elT:EL0,elRaw:EL0,ret:null};// dove il dito vuole la telecamera: CAM.yaw e CAM.el la seguono con un ammortizzatore
  const vec=s=>{if(s.id==null)return[0,0];const dx=s.x-s.x0,dy=s.y-s.y0,l=Math.hypot(dx,dy);return l>6?[dx/Math.max(l,50),dy/Math.max(l,50)]:[0,0]};
  // sensibilità in px CSS, misurata sul lato corto dello schermo: mezzo giro in 3/4 del lato corto (~290 px su un telefono da 390), tutta la
  // corsa dell'inclinazione (27°) in poco più di 1/3 (~135 px). Oltre i limiti l'inclinazione si tira ancora un poco (4°, con resistenza) e torna
  const lookK=()=>{const m=Math.min(ov.clientWidth,ov.clientHeight)||390;return[Math.PI/(.75*m),(ELMAX-ELMIN)/(.35*m)]};
  const rub=e=>e<ELMIN?ELMIN-ELRUB*Math.tanh((ELMIN-e)/(3*ELRUB)):e>ELMAX?ELMAX+ELRUB*Math.tanh((e-ELMAX)/(3*ELRUB)):e;
  // trascinare verso destra = la telecamera gira a destra (si guarda a destra): il terreno sotto il pollice (la metà bassa) segue il dito, come nei
  // giochi in terza persona sul telefono. Verso il basso = più dall'alto. Il dito che va quasi dritto non tocca l'altro asse (pesi per direzione)
  function lookBy(dx,dy,raw){cam.ret=null;let wy=1,we=1;
    if(!raw){look.ax+=(Math.abs(dx)-look.ax)*.35;look.ay+=(Math.abs(dy)-look.ay)*.35;const r=look.ay/(look.ax+look.ay+1e-6);we=cl((r-.25)/.25,0,1);wy=cl((.75-r)/.25,0,1)}
    const[ky,ke]=lookK(),d=dx*ky*wy;cam.yawT-=d;look.sum+=Math.abs(d);cam.elRaw+=dy*ke*we;cam.elT=rub(cam.elRaw)}
  function lookEnd(){look.was=look.on;look.id=null;look.on=false;look.t=0;cam.elRaw=cam.elT=cl(cam.elT,ELMIN,ELMAX);if(look.sum>25*DEG)hintEl.style.opacity=0}
  // già quasi a nord (entro 0,17°): niente viaggio, ma la vista esatta, altrimenti resterebbe la strada girata con la bussola spenta
  function goNorth(){if(look.id!=null&&look.on)return;const y0=wrapA(CAM.yaw);if(Math.abs(y0)<.003&&Math.abs(CAM.el-EL0)<.003){cam.ret=null;CAM.yaw=cam.yawT=0;CAM.el=cam.elT=cam.elRaw=EL0;camDerive();return}CAM.yaw=cam.yawT=y0;cam.ret={t:0,y0,e0:CAM.el}}
  const roleFor=e=>{if(e.pointerType==='mouse'&&e.button===2)return look.id==null?look:null;if(e.pointerType==='mouse'&&e.button!==0)return null;// col mouse: tasto destro = telecamera ovunque
    const pref=e.clientX<ov.clientWidth/2?stick:look,oth=pref===stick?look:stick;return pref.id==null?pref:oth.id==null?oth:null};
  ov.addEventListener('pointerdown',e=>{if(e.target.closest('.bar,.nord'))return;const s=roleFor(e);if(!s)return;e.preventDefault();
    s.id=e.pointerId;s.x0=s.x=e.clientX;s.y0=s.y=e.clientY;if(s===look){look.on=false;look.ax=look.ay=0;look.sum=0;cam.ret=null}try{ov.setPointerCapture(e.pointerId)}catch(_){}});
  ov.addEventListener('pointermove',e=>{if(e.pointerId===stick.id){stick.x=e.clientX;stick.y=e.clientY;const dx=stick.x-stick.x0,dy=stick.y-stick.y0,l=Math.hypot(dx,dy);if(l>STR){stick.x0+=dx*(1-STR/l);stick.y0+=dy*(1-STR/l)}}
    else if(e.pointerId===look.id){look.x=e.clientX;look.y=e.clientY;// i primi 7 px non girano: un tocco fermo non sposta niente
      if(!look.on){if(Math.hypot(look.x-look.x0,look.y-look.y0)<7)return;look.on=true;look.px=look.x;look.py=look.y;return}
      lookBy(look.x-look.px,look.y-look.py);look.px=look.x;look.py=look.y}});
  const up=e=>{if(e.pointerId===stick.id)stick.id=null;if(e.pointerId===look.id)lookEnd()};for(const t of['pointerup','pointercancel','lostpointercapture'])ov.addEventListener(t,up);
  ov.addEventListener('contextmenu',e=>e.preventDefault());
  nordEl.addEventListener('click',()=>goNorth());
  // tastiera (computer): frecce/WASD camminano, Q/E (o J/L) girano, R/F (o I/K) inclinano, N o Home tornano a nord, V la vista intera
  const keys={},K=(...a)=>a.some(k=>keys[k]),KC=e=>e.code||e.key;
  addEventListener('keydown',e=>{const k=KC(e);keys[k]=1;if(e.repeat)return;if(k==='KeyN'||k==='Home')goNorth();if(k==='KeyV'){whole=!whole;ui()}});addEventListener('keyup',e=>{keys[KC(e)]=0});
  const reset=()=>{stick.id=null;if(look.id!=null)lookEnd();for(const k in keys)keys[k]=0};addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
  // la telecamera: niente inerzia (resta dove la lasci), solo un ammortizzatore di ~0,1 s verso il punto voluto; la bussola fa il ritorno in 0,45 s
  function camInput(dt){const kr=(K('KeyQ','KeyJ')?1:0)-(K('KeyE','KeyL')?1:0),ke=(K('KeyF','KeyK')?1:0)-(K('KeyR','KeyI')?1:0);
    if(kr||ke){cam.ret=null;cam.yawT+=kr*150*DEG*dt;cam.elRaw=cam.elT=cl(cam.elT+ke*45*DEG*dt,ELMIN,ELMAX)}
    if(Math.abs(cam.yawT)>Math.PI){const n=wrapA(cam.yawT);CAM.yaw+=n-cam.yawT;cam.yawT=n}// giri interi tolti a tutti e due: non si vede
    if(cam.ret){const r=cam.ret;r.t=Math.min(1,r.t+dt/.45);const k=ez(r.t);CAM.yaw=cam.yawT=r.y0*(1-k);CAM.el=cam.elT=cam.elRaw=r.e0+(EL0-r.e0)*k;if(r.t>=1)cam.ret=null}
    else{const k=1-Math.exp(-dt*22);CAM.yaw+=(cam.yawT-CAM.yaw)*k;CAM.el+=(cam.elT-CAM.el)*k;if(Math.abs(cam.yawT-CAM.yaw)<1e-4)CAM.yaw=cam.yawT;if(Math.abs(cam.elT-CAM.el)<1e-4)CAM.el=cam.elT}
    if(look.id==null)look.t+=dt;camDerive()}
  // il comando della levetta (sinistra): anello e pomello dove si è appoggiato il dito
  function drawStick(s,gx,gy){const on=s.id!=null,x0=on?s.x0:gx,y0=on?s.y0:gy,a0=on?1:.32,dx=on?s.x-s.x0:0,dy=on?s.y-s.y0:0,l=Math.min(42,Math.hypot(dx,dy)),an=Math.atan2(dy,dx),kx=x0+Math.cos(an)*l,ky=y0+Math.sin(an)*l;
    ctx.save();ctx.globalAlpha=a0;ctx.fillStyle='rgba(0,0,0,.18)';ball([x0,y0],44);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x0,y0,42,0,TAU);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.4)';ball([kx,ky],18);ctx.fill();ctx.strokeStyle='rgba(20,20,30,.55)';ctx.lineWidth=1.8;
    for(const r of[0,1,2,3]){const b=r*TAU/4,c=Math.cos(b),d=Math.sin(b);ctx.beginPath();ctx.moveTo(kx+c*11-d*3,ky+d*11+c*3);ctx.lineTo(kx+c*14,ky+d*14);ctx.lineTo(kx+c*11+d*3,ky+d*11-c*3);ctx.stroke()}
    ctx.restore()}
  // il comando della telecamera (destra): non è una levetta (non torna al centro, non ha un bordo), è un piattino che il dito tiene. Il piattino è
  // schiacciato come il terreno (sin θ) e la sua tacca segna il nord, con le due frecce del giro; col dito sopra sta sotto il dito e accanto una
  // guida mostra l'inclinazione (in alto di lato, in basso dall'alto) e sparisce 0,6 s dopo
  function drawLook(gx,gy){const on=look.id!=null,x=on?look.x:gx,y=on?look.y:gy,q=Math.sin(CAM.el),r=17;
    ctx.save();ctx.globalAlpha=on?.95:.32;ctx.fillStyle='rgba(0,0,0,.18)';ball([x,y],on?32:44);ctx.fill();if(!on){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,42,0,TAU);ctx.stroke()}
    ctx.fillStyle='rgba(190,230,255,.42)';ctx.beginPath();ctx.ellipse(x,y,r+2,(r+2)*q,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(20,20,30,.55)';ctx.lineWidth=1.8;ctx.stroke();
    const an=nordAng(q);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(an)*r*.8,y+Math.sin(an)*r*.8*q);ctx.strokeStyle='rgba(150,30,25,.8)';ctx.lineWidth=2.4;ctx.stroke();// la tacca del nord
    ctx.strokeStyle='rgba(20,20,30,.6)';ctx.lineWidth=1.8;for(const d of[-1,1]){const a=Math.PI/2+d*.95,ex=x+Math.cos(a)*(r+7),ey=y+Math.sin(a)*(r+7)*q;// le frecce del giro, sul bordo davanti
      ctx.beginPath();ctx.ellipse(x,y,r+7,(r+7)*q,0,Math.PI/2+d*.25,a,d<0);ctx.stroke();const tx=-Math.sin(a)*d,ty=Math.cos(a)*q*d,tl=Math.hypot(tx,ty);
      ctx.beginPath();ctx.moveTo(ex+(tx/tl)*4.5+ty/tl*3,ey+(ty/tl)*4.5-tx/tl*3);ctx.lineTo(ex,ey);ctx.lineTo(ex+(tx/tl)*4.5-ty/tl*3,ey+(ty/tl)*4.5+tx/tl*3);ctx.stroke()}
    const ga=on?1:Math.max(0,1-look.t/.6);if(on?look.on:look.was&&ga>0){const rx=x-48,k=(CAM.el-ELMIN)/(ELMAX-ELMIN),ry=y-30+60*cl(k,-.15,1.15);ctx.globalAlpha=.9*ga;// la guida dell'inclinazione
      ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(rx,y-30);ctx.lineTo(rx,y+30);ctx.stroke();
      ctx.fillStyle=k<0||k>1?'rgba(255,190,150,.9)':'rgba(190,230,255,.9)';ball([rx,ry],5);ctx.fill();ctx.strokeStyle='rgba(20,20,30,.6)';ctx.lineWidth=1.5;ctx.stroke()}
    ctx.restore()}
  // la bussola: un disco di pietra appoggiato a terra, visto con la telecamera del gioco (schiacciato come il terreno, spesso quanto si vede il
  // fianco), l'ago di ferro con la punta rossa verso il nord del mondo, la N sempre dritta. Tre toni, bordo illuminato dalla luna (ovest),
  // contorno d'inchiostro. Lontano dal nord è piena e respira d'oro (si può toccare); a nord è mezza trasparente. Si ridisegna solo se cambia
  // l'angolo sul disco (schiacciato di q = sin θ, per sembrare un disco a terra) di una direzione del mondo w (nord = −π/2), scelto così che
  // sullo schermo punti dove quella direzione sta sulla mappa, cioè (cos(w+ψ), sin(w+ψ)·SP): il terreno del gioco a 45° non è schiacciato
  // (SP=1), il disco sì, quindi sulle diagonali l'angolo del disco va corretto di SP/q (a ψ=45° l'ago segnava 35° invece di 45°)
  const discAng=(w,q)=>Math.atan2(Math.sin(w+CAM.yaw)*CAM.SP/q,Math.cos(w+CAM.yaw)),nordAng=q=>discAng(-Math.PI/2,q);
  let nKey='',nLit=false;
  function drawNord(){const D=Math.min(2,window.devicePixelRatio||1),S0=Math.round(60*D),off=Math.abs(wrapA(CAM.yaw))>.02||Math.abs(CAM.el-EL0)>.02,ph=off&&!LOWFX?Math.round((W.t*2%1)*12):0,
      key=[Math.round(wrapA(CAM.yaw)/DEG*2),Math.round(CAM.el/DEG*2),off?1:0,ph,S0].join('|');if(off!==nLit){nLit=off;nordEl.classList.toggle('lit',off)}if(key===nKey)return;nKey=key;
    if(ncv.width!==S0){ncv.width=ncv.height=S0}const g=ncv.getContext('2d');g.setTransform(S0/60,0,0,S0/60,0,0);g.clearRect(0,0,60,60);
    const cx=30,cy=31,R=18,q=Math.sin(CAM.el),t=7*Math.cos(CAM.el),c=Math.cos(CAM.yaw),s=Math.sin(CAM.yaw),P=(a,rr)=>[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*q],an=nordAng(q);
    g.lineJoin=g.lineCap='round';
    if(off){const k=LOWFX?.5:.5+.5*Math.sin(ph/12*TAU);g.strokeStyle=`rgba(255,214,90,${.25+.3*k})`;g.lineWidth=5;g.beginPath();g.ellipse(cx,cy+t/2,R+5,(R+5)*q+t/2,0,0,TAU);g.stroke()}
    g.fillStyle='rgba(0,0,0,.42)';g.beginPath();g.ellipse(cx+1.5,cy+t+2.5,R+1.5,(R+1.5)*q,0,0,TAU);g.fill();// ombra
    g.beginPath();g.ellipse(cx,cy,R,R*q,0,Math.PI,0);g.lineTo(cx+R,cy+t);g.ellipse(cx,cy+t,R,R*q,0,0,Math.PI);g.closePath();// sagoma: faccia sopra + fianco
    g.fillStyle='#2a241f';g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();
    const gr=g.createLinearGradient(cx-R,cy-R*q,cx+R*.6,cy+R*q);gr.addColorStop(0,'#8c8172');gr.addColorStop(.5,'#635a4f');gr.addColorStop(1,'#3d3631');// tre toni: luce da ovest
    g.fillStyle=gr;g.beginPath();g.ellipse(cx,cy,R,R*q,0,0,TAU);g.fill();
    g.fillStyle='#4a423a';g.beginPath();g.ellipse(cx,cy,R*.72,R*.72*q,0,0,TAU);g.fill();// il quadrante incassato
    g.strokeStyle='rgba(205,220,245,.5)';g.lineWidth=1.4;g.beginPath();g.ellipse(cx,cy,R-1.4,(R-1.4)*q,0,Math.PI*.95,Math.PI*1.55);g.stroke();// bordo illuminato
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.2;g.beginPath();g.ellipse(cx,cy+.6,R*.72,R*.72*q,0,Math.PI*1.05,Math.PI*1.9);g.stroke();// ombra dentro il quadrante
    for(let i=0;i<8;i++){const a=discAng(-Math.PI/2+i*Math.PI/4,q),big=i%2===0,p0=P(a,R*(big?.56:.62)),p1=P(a,R*.7);g.strokeStyle=big?'#d8cdb4':'rgba(216,205,180,.55)';g.lineWidth=big?1.8:1.1;g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.stroke()}
    const N=P(an,R*.84),Sd=P(an+Math.PI,R*.64),L=P(an-Math.PI/2,R*.2),Rt=P(an+Math.PI/2,R*.2),C=[cx,cy-1.2],tri=(a,b,d,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(a[0],a[1]-1.2);g.lineTo(b[0],b[1]-1.2);g.lineTo(d[0],d[1]-1.2);g.closePath();g.fill()};
    tri(N,L,C,'#d0493c');tri(N,Rt,C,'#8e2620');tri(Sd,L,C,'#e6dcc6');tri(Sd,Rt,C,'#a99c84');// l'ago: due toni per metà, la luce dal lato della luna
    g.strokeStyle=INK;g.lineWidth=1.5;g.beginPath();g.moveTo(N[0],N[1]-1.2);g.lineTo(L[0],L[1]-1.2);g.lineTo(Sd[0],Sd[1]-1.2);g.lineTo(Rt[0],Rt[1]-1.2);g.closePath();g.stroke();
    g.fillStyle='#c9a24a';g.beginPath();g.arc(C[0],C[1],2.6,0,TAU);g.fill();g.strokeStyle=INK;g.lineWidth=1.1;g.stroke();g.fillStyle='rgba(255,240,200,.8)';g.beginPath();g.arc(C[0]-.8,C[1]-.9,.9,0,TAU);g.fill();
    const tp=P(an,R+7.5);g.font='400 13px "Lilita One",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.strokeStyle=INK;g.lineWidth=3.2;g.strokeText('N',tp[0],tp[1]);g.fillStyle='#efe6d0';g.fillText('N',tp[0],tp[1])}
  const dpr=Math.min(2,window.devicePixelRatio||1);let last=performance.now(),ms=0,zoomOv=0,camOv=null,wholeFit=null,hudOn=true;
  // da coordinate dello schermo-mondo (quelle che escono da S) a pixel della tela: il perno CAM sta oy sotto il centro
  const scr=(X,Y)=>[dpr*(ov.clientWidth/2+(X-CAM.x)*CAM.z),dpr*(ov.clientHeight/2+(Y-CAM.y+CAM.oy)*CAM.z)];
  // vista intera: la mappa con le cime (fino a 90) inquadrata per la telecamera di riposo (yawT, elT); mentre il dito gira resta ferma (niente
  // zoom che respira girando), quando si lascia si riassesta piano
  function fitWhole(Wp,Hp){const c=Math.cos(cam.yawT),s=Math.sin(cam.yawT),SP=Math.SQRT2*Math.sin(cam.elT),CP=Math.SQRT2*Math.cos(cam.elT),cx=W.w/2,cy=W.h/2;let X0=1e9,X1=-1e9,Y0=1e9,Y1=-1e9;
    for(const[x,y] of[[0,0],[W.w,0],[W.w,W.h],[0,W.h]]){const dx=x-cx,dy=y-cy,u=dx*c-dy*s,v=dx*s+dy*c;for(const z of[0,90]){const Y=v*SP-z*CP;X0=Math.min(X0,u);X1=Math.max(X1,u);Y0=Math.min(Y0,Y);Y1=Math.max(Y1,Y)}}
    return[Math.min(Wp/(X1-X0+60),(Hp-150)/(Y1-Y0+30)),-(Y0+Y1)/2-10]}
  function render(dt,ix,iy){const Wp=ov.clientWidth,Hp=ov.clientHeight;if(cv.width!==Math.round(Wp*dpr)||cv.height!==Math.round(Hp*dpr)){cv.width=Math.round(Wp*dpr);cv.height=Math.round(Hp*dpr)}
    const saved=ctx,lf=LOWFX;ctx=cv.getContext('2d');LOWFX=low;const t0=performance.now();
    try{updateBeings(dt,{x:ix,y:iy});updateAmbient(dt);if(area.update)area.update(dt);
      const h=W.hero;let tx,ty,z,oyT;
      if(camOv){tx=camOv[0];ty=camOv[1];z=zoomOv||Wp/330;oyT=0}
      else if(whole){if(!wholeFit||look.id==null)wholeFit=fitWhole(Wp,Hp);tx=W.w/2;ty=W.h/2;z=zoomOv||wholeFit[0];oyT=wholeFit[1]}
      else{tx=h.x;ty=h.y;z=zoomOv||Wp/330;oyT=24*CAM.CP}// l'eroe è il perno: girando resta fermo sullo schermo; sta 24 px (più alto se inclinato) sotto il centro
      const k6=Math.min(1,dt*6);CAM.z+=(z-CAM.z)*Math.min(1,dt*8);CAM.x+=(tx-CAM.x)*k6;CAM.y+=(ty-CAM.y)*k6;CAM.oy+=(oyT-CAM.oy)*k6;camDerive();
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0b0c12';ctx.fillRect(0,0,Wp,Hp);if(area.backdrop)area.backdrop(Wp,Hp);
      ctx.setTransform(dpr*CAM.z,0,0,dpr*CAM.z,dpr*(Wp/2-CAM.x*CAM.z),dpr*(Hp/2+(CAM.oy-CAM.y)*CAM.z));
      drawWorld(dt,{Wp,Hp});
      drawDark(cv.width,cv.height,(x,y,r)=>{const p=scr(x,y);return[p[0],p[1],r*CAM.z*dpr]},houses[0]?houses[0].a:1);
      ctx.setTransform(dpr,0,0,dpr,0,0);if(!W.dbg.noSticks&&!whole){drawStick(stick,64,Hp-196);drawLook(Wp-64,Hp-196)}
      const vg=ctx.createRadialGradient(Wp/2,Hp/2,Math.min(Wp,Hp)*.4,Wp/2,Hp/2,Math.max(Wp,Hp)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,Wp,Hp);
      const show=hudOn&&!W.dbg.noSticks;if(nordEl.hidden===show)nordEl.hidden=!show;if(show)drawNord()
    }catch(e){console.error(e)}finally{ms=ms*.93+(performance.now()-t0)*.07;ctx=saved;LOWFX=lf}}
  function frame(now){const raw=(now-last)/1000,rdt=Math.min(.05,raw);last=now;camInput(Math.min(.1,raw));// la telecamera va col tempo vero anche a mondo fermo (W.dbg.freeze)
    let[ix,iy]=vec(stick);if(K('ArrowLeft','KeyA'))ix=-1;if(K('ArrowRight','KeyD'))ix=1;if(K('ArrowUp','KeyW'))iy=-1;if(K('ArrowDown','KeyS'))iy=1;
    const[wx,wy]=stickToWorld(ix,iy);render(W.dbg.freeze?0:rdt,wx,wy);cashEl.textContent='● '+W.coins.toLocaleString('it-IT')+'  ·  '+ms.toFixed(1)+' ms';requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
  // ganci di prova (tests nella cartella anteprime/zombie): visibilità dell'eroe in un punto, simulazione degli zombie senza disegnare
  const devBox=(x0,y0,x1,y1)=>{const a=scr(x0,y0),b=scr(x1,y1);return[Math.max(0,Math.floor(a[0])),Math.max(0,Math.floor(a[1])),Math.min(cv.width,Math.ceil(b[0])),Math.min(cv.height,Math.ceil(b[1]))]};
  function visAt(x,y,o){o=o||{};const h=W.hero,D=W.dbg;if(o.yaw!=null||o.el!=null)setView(o.yaw,o.el);W.Z.length=0;h.x=x;h.y=y;h.moving=false;h.zh=heightAt(x,y);const zo=zOn;zOn=false;D.noShoot=true;updateBeings(1,{x:0,y:0});zOn=zo;
    CAM.z=zoomOv||ov.clientWidth/330;if(CAM.rot){CAM.x=x;CAM.y=y;CAM.oy=24*CAM.CP}else{CAM.x=x;CAM.y=y-24;CAM.oy=0}camOv=[CAM.x,CAM.y];const g=cv.getContext('2d');
    const shot=f=>{Object.assign(D,{noSil:!o.sil,heroLast:false,noHero:false},f);render(0,0,0);const[bx0,by0,bx1,by1]=heroBox(),B=devBox(bx0,by0,bx1,by1);return{B,px:g.getImageData(B[0],B[1],Math.max(1,B[2]-B[0]),Math.max(1,B[3]-B[1])).data,occ:LASTOCC.map(e=>e.p.name+'@'+Math.round(e.p.bx[0])+','+Math.round(e.p.bx[1]))}};
    const A=shot({}),Bh=shot({heroLast:true}),C=shot({noHero:true});Object.assign(D,{noSil:false,heroLast:false,noHero:false});
    let msk=0,v=0;const a=A.px,b=Bh.px,c=C.px;for(let i=0;i<a.length;i+=4){if(Math.abs(b[i]-c[i])+Math.abs(b[i+1]-c[i+1])+Math.abs(b[i+2]-c[i+2])<30)continue;msk++;if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])<30)v++}
    return{vis:msk?v/msk:1,mask:msk,occ:A.occ,box:A.B}}
  const ctl=()=>({stick:Object.assign({},stick),look:Object.assign({},look),keys:Object.keys(keys).filter(k=>keys[k]),ret:!!cam.ret,yawT:cam.yawT/DEG,elT:cam.elT/DEG});
  const setView=(yd,ed)=>{cam.ret=null;if(yd!=null)CAM.yaw=cam.yawT=wrapA(yd*DEG);if(ed!=null)CAM.el=cam.elT=cam.elRaw=cl(ed*DEG,ELMIN,ELMAX);camDerive()};
  window.__MZ={W,CAM,props,houses,solids,holes,stands,perches,zoom:v=>{zoomOv=v},cam:(x,y)=>{camOv=x==null?null:[x,y];if(x!=null)CAM.oy=0},// con la visuale fissata dai test il perno è il centro (oy=0), come prima
    setWhole:v=>{whole=v;ui()},tp:(x,y)=>{W.hero.x=x;W.hero.y=y},zombies:v=>{zOn=v;ui()},low:v=>{low=v;ui()},
    // la telecamera, in gradi: view() legge, view(ψ,θ) mette subito (null = lascia com'è), viewTo come il dito (morbido), north() come la bussola
    view:(yd,ed)=>yd===undefined?{yaw:wrapA(CAM.yaw)/DEG,el:CAM.el/DEG,yawT:cam.yawT/DEG,elT:cam.elT/DEG,oy:CAM.oy}:setView(yd,ed),
    viewTo:(yd,ed)=>{cam.ret=null;if(yd!=null)cam.yawT=yd*DEG;if(ed!=null)cam.elT=cam.elRaw=cl(ed*DEG,ELMIN,ELMAX)},
    north:now=>{goNorth();if(now&&cam.ret){cam.ret.t=1;camInput(0)}},
    drag:(dx,dy,o)=>{lookBy(dx,dy,!(o&&o.feel));if(!(o&&o.hold))lookEnd()},// come un dito a destra (o.feel: con i pesi per direzione; o.hold: non lo stacca)
    ctl,toWorld:(ix,iy)=>stickToWorld(ix,iy),
    toScreen:(x,y,z)=>{const q=S(x,y,z||0),p=scr(q[0],q[1]);return[p[0]/dpr,p[1]/dpr]},// un punto del mondo in px CSS (dopo un render)
    hud:v=>{hudOn=!!v;W.dbg.noSticks=!v;for(const s of['.top','.bar','.hint'])ov.querySelector(s).style.display=v?'':'none'},
    look:(x,y)=>{if(x==null)return ctl();console.warn('__MZ.look(x,y): la visuale non si sposta più in piano, usa __MZ.view(gradi, gradi)')},
    order:()=>LASTLIST.map(e=>e.p?e.p.name+'@'+Math.round(e.p.bx[0])+','+Math.round(e.p.bx[1]):e.hero?'eroe':e.fl?'fiamma':e.pc?'corvo':'zombie:'+e.z.kind),
    render:dt=>render(dt||0,0,0),vis:visAt,hit:(x,y,r)=>!!hit(x,y,r),heightAt,
    nav:()=>NAV&&{cw:NAV.cw,ch:NAV.ch,free:NAV.bl.reduce((s,v)=>s+(v?0:1),0)},navRebuild:()=>{navBuild();NAV.hc=-1},
    addZombie:(kind,x,y,spd)=>{const k=KINDS.find(k=>k[0]===kind)||KINDS[0];const z={kind:k[0],sc:k[1],spd:spd||k[2],hp:99,x,y,face:0,p:0,anim:'walk',rise:1,die:0,flash:0};W.Z.push(z);return W.Z.length-1},
    sim:(n,dt)=>{for(let i=0;i<n;i++)updateBeings(dt,{x:0,y:0})},
    walk:(ix,iy,n,dt)=>{const[wx,wy]=stickToWorld(ix,iy);for(let i=0;i<(n||1);i++)updateBeings(dt||1/60,{x:wx,y:wy})}}}
return{group,T,CAM,W,S,LS,MOON,inGround,scrAng,decals,fades,NAMES,stand,stands,heightAt,add3,sub3,len3,rnd,rr,srand,ink,path,hull,material,MAT,MARKS,texture,tone,face,hullOf,ballAt,line3,poly3,fn3,box,prismX,prismY,plane,cyl,prop,solid,shade,shadeR,props,solids,shadows,lights,flames,holes,houses,smokes,perches,hit,bakeGround,edgeSnap,boot,setLive:f=>{liveDraw=f},wa,mix,cl,ez,lerp,TAU,ball,seg}})();
