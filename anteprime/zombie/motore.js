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
function setRef(r){if(!r){REF=null;return}const K=r.k||1;/* (difetti 48) r.k: quanto si piega tutto l'edificio (gli edifici alti delle zone nuove meno, come il mulino a vento) */
  if(CAM.rot){const fu=u=>soft(u*CAM.lx),fv=v=>softV((-CAM.oy/CAM.SP-v)*CAM.ly),UV=(x,y)=>{const dx=x-CAM.x,dy=y-CAM.y;return[dx*CAM.c-dy*CAM.s,dx*CAM.s+dy*CAM.c]};
    if(r.length<4){const[u,v]=UV(r[0],r[1]);REF=[fu(u)*K,0,fv(v)*K,0];return}
    let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const[X,Y] of[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]]){const[u,v]=UV(X,Y);if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v}
    const a1=u1-u0>1?(fu(u1)-fu(u0))/(u1-u0):0,b1=v1-v0>1?(fv(v1)-fv(v0))/(v1-v0):0;
    REF=[(u1-u0>1?fu(u0)-a1*u0:fu((u0+u1)/2))*K,a1*K,(v1-v0>1?fv(v0)-b1*v0:fv((v0+v1)/2))*K,b1*K];return}
  const fx=x=>soft((x-CAM.x)*CAM.lx),fy=y=>softV((CAM.cy-y)*CAM.ly);
  if(r.length<4){REF=[fx(r[0])*K,0,fy(r[1])*K,0];return}const[x0,y0,x1,y1]=r,a1=x1-x0>1?(fx(x1)-fx(x0))/(x1-x0):0,b1=y1-y0>1?(fy(y1)-fy(y0))/(y1-y0):0;
  REF=[(x1-x0>1?fx(x0)-a1*x0:fx((x0+x1)/2))*K,a1*K,(y1-y0>1?fy(y0)-b1*y0:fy((y0+y1)/2))*K,b1*K]}
let LEANK=1;// quanto si piega il prop che si sta disegnando (lk del prop: 1 case e muri, .5 pali e lapidi)
// la piega di lato satura piano verso 13° (lontano dall'eroe le cose alte non sembrano cadute); quella in verticale, che allunga o accorcia
// le case mentre l'eroe va su e giù, quasi non c'è (al massimo ±2% dell'altezza): richieste di Denis del 12 ottobre («diminuisci di molto»)
const LK=.22,soft=k=>LK*Math.tanh(k/LK),LKV=.02,softV=k=>LKV*Math.tanh(k/LKV);
// i prop girati a quarti di giro (turn): q quarti in senso antiorario visti dall'alto (q=1: il sud del disegno guarda a est, l'est a nord).
// I pezzi restano nelle coordinate del disegno e S li gira mentre si disegna il prop (ROTP); impronte, riquadri, solidi, ombre, luci,
// fiamme, buche, macchie del terreno e case passano nel mondo quando si costruiscono (TURN). Le facce prendono la luce del verso vero (keyR)
let TURN=null,ROTP=null;
const mkTurn=(cx,cy,q)=>{q=((q%4)+4)%4;const a=-q*Math.PI/2;return{cx,cy,q,c:Math.round(Math.cos(a)),s:Math.round(Math.sin(a))}};
const tP=(R,x,y)=>{const dx=x-R.cx,dy=y-R.cy;return[R.cx+dx*R.c-dy*R.s,R.cy+dx*R.s+dy*R.c]},tV=(R,x,y)=>[x*R.c-y*R.s,x*R.s+y*R.c];
const tR=(R,x,y,w,d)=>{const a=tP(R,x,y),b=tP(R,x+w,y+d);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])]};
const KROT={s:'e',e:'n',n:'w',w:'s',r:'re',re:'rn',rn:'rw',rw:'r'},keyR=(k,q)=>{for(let i=0;i<q;i++)k=KROT[k]||k;return k};
function turn(cx,cy,q,fn){const sv=TURN,R=mkTurn(cx,cy,q);if(!R.q)return fn();TURN=R;try{return fn()}finally{TURN=sv}}
// due strade: dritta (ψ=0, θ=45°: il codice di prima, la piega verticale misurata dal centro dello schermo cy) e girata, in (u, v) intorno al
// perno; vicino allo zero le due danno gli stessi numeri, quindi niente salti
const S=(x,y,z)=>{if(Array.isArray(x))return S(x[0],x[1],x[2]);z=z||0;if(ROTP){const dx=x-ROTP.cx,dy=y-ROTP.cy;x=ROTP.cx+dx*ROTP.c-dy*ROTP.s;y=ROTP.cy+dx*ROTP.s+dy*ROTP.c}
  if(CAM.rot){const dx=x-CAM.x,dy=y-CAM.y,u=dx*CAM.c-dy*CAM.s,v=dx*CAM.s+dy*CAM.c;let lu,lv;
    if(REF){lu=REF[0]+REF[1]*u;lv=REF[2]+REF[3]*v}else{lu=soft(u*CAM.lx);lv=softV((-CAM.oy/CAM.SP-v)*CAM.ly)}
    return[CAM.x+u+lu*z*LEANK,CAM.y+v*CAM.SP-z*CAM.CP+lv*z*LEANK]}
  if(REF)return[x+(REF[0]+REF[1]*x)*z*LEANK,y-z+(REF[2]+REF[3]*y)*z*LEANK];return[x+soft((x-CAM.x)*CAM.lx)*z*LEANK,y-z+softV((CAM.cy-y)*CAM.ly)*z*LEANK]};
// il terreno (e quello che ci sta appoggiato: nuvole, nebbia) gira e si schiaccia con la telecamera con una sola trasformazione della tela,
// (x,y) → (CAM.x+u, CAM.y+v·SP), cioè S(x,y,0); a vista dritta non fa niente
const inGround=fn=>{if(!CAM.rot){fn();return}const c=CAM.c,s=CAM.s,SP=CAM.SP;ctx.save();ctx.transform(c,SP*s,-s,SP*c,CAM.x-(c*CAM.x-s*CAM.y),CAM.y-SP*(s*CAM.x+c*CAM.y));try{fn()}finally{ctx.restore()}};
const add3=(a,b,k)=>[a[0]+b[0]*(k==null?1:k),a[1]+b[1]*(k==null?1:k),a[2]+b[2]*(k==null?1:k)];
// quanto una direzione del mondo (nx, ny) guarda verso la telecamera (1: dritta verso chi guarda, 0: di taglio, <0: dall'altra parte) e quanto va
// verso la destra dello schermo; a vista dritta facing(0,1)=1 (sud) e across(1,0)=1 (est)
const facing=(nx,ny)=>{if(ROTP){const a=nx*ROTP.c-ny*ROTP.s;ny=nx*ROTP.s+ny*ROTP.c;nx=a}return nx*CAM.s+ny*CAM.c},across=(nx,ny)=>{if(ROTP){const a=nx*ROTP.c-ny*ROTP.s;ny=nx*ROTP.s+ny*ROTP.c;nx=a}return nx*CAM.c-ny*CAM.s};
// aiuti per i dettagli disegnati a mano (prendono S2 come primo argomento, così la prova a vuoto vede i loro punti): il tracciato si costruisce
// dentro la trasformazione, stroke e fill si fanno dopo (linee di spessore uniforme). onGround: le coordinate del terreno (x, y del mondo) a
// quota z; onPlane: il piano per o3 con gli assi eu, ev del mondo (0 se si vede da dietro, a meno di two); onRound: un dettaglio sulla pancia di
// una cosa tonda (centro c, raggio r) col lato (nx, ny), scorciato e sfumato quando gira via; ringNear: l'arco vicino di un cerchio a terra
function onGround(S2,x,y,z,fn){const o=S2(x,y,z),a=S2(x+1,y,z),b=S2(x,y+1,z);ctx.save();ctx.transform(a[0]-o[0],a[1]-o[1],b[0]-o[0],b[1]-o[1],o[0],o[1]);try{fn()}finally{ctx.restore()}}
function onPlane(S2,o3,eu,ev,fn,two){const o=S2(o3),A=S2(add3(o3,eu)),B=S2(add3(o3,ev)),a=[A[0]-o[0],A[1]-o[1]],b=[B[0]-o[0],B[1]-o[1]];
  if(a[0]*b[1]-a[1]*b[0]<=0&&!two)return 0;ctx.save();ctx.transform(a[0],a[1],b[0],b[1],o[0],o[1]);try{fn()}finally{ctx.restore()}return 1}
function onRound(S2,c,r,nx,ny,k,fn){const q=S2(c),f=facing(nx,ny);if(f<=.04)return;ctx.save();ctx.globalAlpha*=Math.min(1,f*4);
  ctx.translate(q[0]+across(nx,ny)*r*k,q[1]+f*r*k*CAM.SP);ctx.scale(f,CAM.CP);try{fn()}finally{ctx.restore()}}
function ringNear(S2,x,y,z,r,a0,a1){let fx=CAM.s,fy=CAM.c;if(ROTP){const a=fx*ROTP.c+fy*ROTP.s;fy=fy*ROTP.c-fx*ROTP.s;fx=a}const c=Math.atan2(fy,fx);onGround(S2,x,y,z,()=>{ctx.beginPath();ctx.arc(0,0,r,a0??c-Math.PI/2,a1??c+Math.PI/2)})}
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
// l'usura (punto 11 del piano di Denis): graffi, crepe, ruggine con le colature, vernice e intonaco che si staccano, schegge sui bordi,
// polvere; sempre leggeri (si vedono da vicino, non sporcano la forma) e fissi per ogni texture (stesso seme)
const WEAR={
  scratch(w,h,n){ctx.lineWidth=.8;for(let i=0;i<n;i++){const x=rr(0,w),y=rr(0,h),a=rr(-.6,.6)+(rnd()<.5?0:Math.PI/2),l=rr(2.5,7);ctx.strokeStyle=rnd()<.6?'rgba(255,240,220,.24)':'rgba(10,8,6,.3)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);ctx.stroke()}},
  crack(w,h,n,lite){for(let i=0;i<n;i++){let x=rr(w*.15,w*.85),y=rr(0,h*.4);const pts=[[x,y]];for(let k=0;k<4;k++){x+=rr(-2.5,2.5);y+=rr(2,h*.14+2);pts.push([x,y])}
    ctx.strokeStyle='rgba(8,6,6,.7)';ctx.lineWidth=1.1;ctx.beginPath();pts.forEach((q,k)=>k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
    if(lite){ctx.strokeStyle='rgba(255,245,230,.14)';ctx.lineWidth=.6;ctx.beginPath();pts.forEach((q,k)=>k?ctx.lineTo(q[0]+.8,q[1]+.4):ctx.moveTo(q[0]+.8,q[1]+.4));ctx.stroke()}}},
  rust(w,h,n){for(let i=0;i<n;i++){const x=rr(0,w),y=rr(0,h*.8),r=rr(1,2.8);ctx.fillStyle='rgba(150,74,30,.55)';ctx.beginPath();ctx.ellipse(x,y,r*1.3,r,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(205,115,55,.4)';ctx.beginPath();ctx.ellipse(x-.4,y-.3,r*.6,r*.45,0,0,TAU);ctx.fill();
    const g=ctx.createLinearGradient(0,y,0,y+rr(4,10));g.addColorStop(0,'rgba(130,64,26,.3)');g.addColorStop(1,'rgba(130,64,26,0)');ctx.fillStyle=g;ctx.fillRect(x-.6,y,1.2,10)}},
  peel(w,h,n,under){for(let i=0;i<n;i++){const x=rr(0,w),y=rr(0,h),r=rr(2,5);ctx.fillStyle=under;ctx.beginPath();for(let k=0;k<7;k++){const a=k/7*TAU,q=r*(.6+rnd()*.6);ctx.lineTo(x+Math.cos(a)*q*1.3,y+Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(20,14,10,.3)';ctx.lineWidth=.5;ctx.stroke()}},
  chip(w,h,n){ctx.fillStyle='rgba(8,6,6,.45)';for(let i=0;i<n;i++){const x=rr(0,w),s=rr(1,2.4);ctx.beginPath();ctx.moveTo(x-s,0);ctx.lineTo(x,s*1.2);ctx.lineTo(x+s,0);ctx.closePath();ctx.fill()}},
  stain(w,h,n,col){for(let i=0;i<n;i++){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(rr(0,w),rr(h*.3,h),rr(2,6),rr(1.5,4),rr(0,3),0,TAU);ctx.fill()}},
  dust(w,h){for(let i=0;i<w*h/90;i++){ctx.fillStyle=rnd()<.5?'rgba(200,190,170,.08)':'rgba(0,0,0,.08)';ctx.fillRect(rr(0,w),rr(0,h),.8,.8)}}};
{const ad=(k,f)=>{const o=MARKS[k];MARKS[k]=(w,h,key,m)=>{o(w,h,key,m);if(key==='t'&&k!=='plank'&&k!=='wood')return;f(w,h,key,m)}};
  ad('plank',(w,h,key)=>{WEAR.scratch(w,h,Math.round(w*h/260));WEAR.crack(w,h,Math.round(w*h/2400));if(key!=='t')WEAR.chip(w,h,Math.round(w/14));WEAR.dust(w,h)});
  ad('siding',(w,h)=>{WEAR.scratch(w,h,Math.round(w*h/300));WEAR.crack(w,h,Math.round(w*h/2600));ctx.fillStyle='rgba(230,215,190,.06)';for(let i=0;i<w/18;i++)ctx.fillRect(rr(0,w),0,rr(2,5),h)});
  ad('wood',(w,h)=>{WEAR.scratch(w,h,Math.round(w*h/220));WEAR.crack(w,h,w*h>300?1:0)});
  ad('iron',(w,h)=>{WEAR.rust(w,h,Math.max(1,Math.round(w*h/160)));WEAR.scratch(w,h,Math.round(w*h/120))});
  ad('stone',(w,h)=>{WEAR.crack(w,h,rnd()<Math.min(.9,w*h/1800)?1:0,true);WEAR.chip(w,h,Math.round(w/22));WEAR.dust(w,h)});
  ad('brick',(w,h)=>{WEAR.crack(w,h,rnd()<.5?1:0,true);WEAR.stain(w,h,Math.round(w*h/1400),'rgba(20,30,20,.18)')});
  ad('plaster',(w,h)=>{WEAR.peel(w,h,Math.max(1,Math.round(w*h/700)),'rgba(120,100,80,.45)');WEAR.stain(w,h,1,'rgba(40,30,20,.16)');WEAR.dust(w,h)});
  ad('cloth',(w,h)=>{WEAR.stain(w,h,Math.max(1,Math.round(w*h/500)),'rgba(30,20,20,.2)')});
  ad('bark',(w,h)=>{WEAR.scratch(w,h,Math.round(w*h/400))})}
// i vetri delle finestre: lo sporco negli angoli, un riflesso di traverso, e su qualcuno una crepa a stella
MARKS.pane=(w,h)=>{const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(40,30,20,.35)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.moveTo(w*.15,0);ctx.lineTo(w*.4,0);ctx.lineTo(w*.1,h);ctx.lineTo(-w*.15,h);ctx.closePath();ctx.fill();
  if(rnd()<.35){const x=rr(w*.3,w*.7),y=rr(h*.3,h*.7);ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.6;for(let k=0;k<6;k++){const a=k/6*TAU+rr(-.3,.3),l=rr(3,Math.min(w,h)*.5);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*l*.5,y+Math.sin(a)*l*.5+rr(-1,1));ctx.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);ctx.stroke()}}};
material('plank',['#6e5236','#46321e','#93714c'],'plank');material('plankD',['#54402c','#34261a','#735a3e'],'plank');material('siding',['#6e5236','#46321e','#93714c'],'siding');
material('stone',['#6d6a72','#45434b','#9a97a2'],'stone');material('stoneW',['#5c5f6a','#3c3e47','#80848f'],'stone');material('stoneWD',['#4a4c56','#30323a','#676a75'],'stone');material('stoneD',['#55535b','#36353b','#7c7a84'],'stone');material('brick',['#5a3a30','#3a2420','#7a5448'],'brick');
material('shingle',['#4e3b4a','#302232','#6a5466'],'shingle');material('slate',['#3c4552','#2b323c','#535f6e'],'shingle');material('tile',['#7a3527','#5a2519','#96503a'],'shingle');
material('wood',['#5e4128','#3c2817','#7d5a38'],'wood');material('iron',['#34363e','#1d1e23','#6a6e7a'],'iron');material('soil',['#4a3a2a','#2e2419','#64503a'],'soil');material('soilD',['#3c3028','#241c16','#4e4034'],'soil');
material('bone',['#d9cfb4','#a69a7c','#f0e8d2'],'bone');material('cloth',['#5a3a5e','#3a243e','#7a5a80'],'cloth');material('red',['#6a2e3a','#4a1e28','#8a4a56'],'cloth');
material('glass',['#f0c070','#b87830','#fff0c0'],'pane');material('dark',['#0c0a0e','#06050a','#1a1620'],'flat');material('bark',['#4a3b2e','#2c231b','#6a5644'],'bark');
material('pumpkin',['#d06e22','#8a4010','#f0a040'],'flat');material('leaf',['#365a2c','#22391b','#52803e'],'flat');material('grass',['#36452b','#26311e','#4d6338'],'flat');
material('moss',['#4f6e35','#33491f','#6f9448'],'flat');material('copper',['#5d8a76','#3d5e50','#80b09a'],'iron');material('hay',['#8a7a3a','#5e5228','#a89450'],'straw');
material('slab',['#5a5f6c','#3a3e48','#7d8392'],'slab');material('leafZ',['#3a5234','#1f2e1c','#5a7a44'],'flat');material('oldwood',['#5a4a3a','#36291e','#8a7a62'],'plank');material('board',['#5a4a3a','#36291e','#8a7a62'],'wood');material('post',['#4e3f30','#30251a','#75644e'],'vgrain');material('stave',['#54402c','#34261a','#735a3e'],'vgrain');material('plaster',['#3a2c22','#2a1f18','#4e3d30'],'plaster');material('leafA',['#8a4a22','#52281a','#b86a2e'],'flat');
// ------------------------------------------------------------------ pezzi (le cose di cui è fatto un prop)
// face: quattro angoli 3D in senso antiorario visti da fuori, p0 = angolo in basso a sinistra della texture, p1 = +u, p3 = +v;
// visibile se la proiezione gira nel verso giusto (shoelace < 0). mat: nome del materiale, key: orientamento; o.foot: tocca terra;
// o.tex(w,h): segni in più sopra il materiale (nella texture); o.col: colore pieno senza materiale; o.alpha
let UID=0;function face(p0,p1,p2,p3,mat,key,o){o=o||{};return{k:'face',c:[p0,p1,p2,p3],mat,key,w:len3(sub3(p1,p0)),h:len3(sub3(p3,p0)),foot:!!o.foot,tex:o.tex||null,texId:o.texId||(o.tex?'u'+(++UID):''),col:o.col||null,ink:o.ink==null?.9:o.ink,alpha:o.alpha==null?1:o.alpha,over:o.over||null}}
// hull: contorno scuro intorno a un insieme di punti 3D (il profilo di un solido convesso)
const hullOf=(pts,w)=>({k:'hull',pts,w:w||2.6});
// ball: una sfera a un punto 3D (chiome, zucche, pomelli): tre toni girati verso la luna; sq schiaccia in verticale
let FSD=0;// numero di serie dei disegni dal vivo: il loro seme (stesso ordine di costruzione = stessi segni a ogni caricamento)
const ballAt=(p,r,mat,o)=>Object.assign({k:'ball',p,r,mat,sd:++FSD},o||{});// o.lobes/amp/ph: profilo smerlato (chiome)
// line: un segmento 3D (ringhiere, corde, rami sottili): col, w; ink true aggiunge il contorno
const line3=(a,b,col,w,o)=>Object.assign({k:'line',a,b,col,w:w||1},o||{});
// poly: un poligono 3D piatto riempito (mucchi di terra, pezze), con contorno opzionale
const poly3=(pts,col,o)=>Object.assign({k:'poly',pts,col},o||{});
// fn: disegno libero con la proiezione (per i dettagli): f(S2, ctx). o (facoltativo, per l'ordine di disegno): r raggio a schermo da aggiungere ai
// punti che il disegno tocca (la prova a vuoto all'avvio li registra), fp impronta [[x,y],…] data a mano, z [z0,z1], on (pezzi su cui poggia: dopo di
// loro), side [nx,ny] (sta accanto: prima di chi tocca se il suo lato guarda via dalla telecamera, dopo se la guarda), host (una faccia: se non si
// vede, non si disegna), it e tip (per o.intra del prop)
const fn3=(f,o)=>({k:'fn',f,o:o||{},sd:++FSD});
// un parallelepipedo: x,y,z angolo nord-ovest in basso; o.m = {t,s,e,w,n} materiali per faccia; o.tex per faccia; o.noOut; o.ow spessore contorno;
// o.over = {s:fn,…}: disegni a vettori su una faccia, fatti solo se la faccia si vede e ritagliati sul suo contorno: fn(q, key)
function box(x,y,z,w,d,h,mat,o){o=o||{};const v=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],P=[],M=o.m||{},TX=o.tex||{},foot=z<=0.01&&!o.noFoot;
  const f=(a,b,c,d2,key)=>P.push(face(v[a],v[b],v[c],v[d2],M[key]||mat,key,{foot:key!=='t'&&foot,tex:TX[key],texId:o.texId,ink:o.ink,over:o.over&&o.over[key]}));
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
// (draw(w,h) la disegna nello spazio della texture, origine in alto a sinistra) e si vede da entrambi i lati; o.host: la faccia su cui è appoggiato
// (una finestra sul muro): se quella non si vede, il pannello non si disegna
function plane(x,y,z,len,h,along,texId,draw,o){o=o||{};const p0=[x,y,z],p1=typeof along==='number'?[x+Math.cos(along)*len,y+Math.sin(along)*len,z]:along==='x'?[x+len,y,z]:[x,y+len,z],p3=[x,y,z+h],p2=add3(p1,[0,0,h]);// along: 'x', 'y' o un angolo in radianti
  return{k:'plane',c:[p0,p1,p2,p3],w:len,h,texId,draw,ow:o.ow==null?0:o.ow,alpha:o.alpha==null?1:o.alpha,flip:along==='y',host:o.host||null}}
// un cilindro a facce (pozzo, botti, pilastri tondi): n lati, r in basso, r1 in alto
function cyl(x,y,z,r,h,mat,o){o=o||{};const n=o.n||10,r1=o.r1==null?r:o.r1,P=[],lo=[],hi=[];for(let i=0;i<n;i++){const a=i/n*TAU-Math.PI/2;lo.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z]);hi.push([x+Math.cos(a)*r1,y+Math.sin(a)*r1,z+h])}
  for(let i=0;i<n;i++){const j=(i+1)%n,a=(i+.5)/n*TAU-Math.PI/2,nx=Math.cos(a),ny=Math.sin(a),key=ny>.5?'s':ny<-.5?'n':nx>0?'e':'w';P.push(face(lo[j],lo[i],hi[i],hi[j],(o.m&&o.m.side)||mat,key,{foot:z<=0.01,ink:o.ink==null?.6:o.ink,tex:o.tex}))}
  if(o.top!==false)P.push({k:'facepoly',c:hi.slice().reverse(),mat:(o.m&&o.m.t)||mat,key:'t'});if(!o.noOut)P.push(hullOf(lo.concat(hi),o.ow));return P}
// i gruppi (per l'ordine di disegno dentro un prop, fase 3): ogni chiamata a box, prismX, prismY o cyl è un gruppo (t.g uguale per tutti i suoi
// pezzi, disegnati nell'ordine dell'autore: facce e poi contorno); ogni pezzo sciolto (line3, ballAt, plane, facepoly, poly, fn3) è un gruppo a sé,
// e grp(...pezzi) ne unisce più d'uno (la piramide del lampione con il suo contorno)
let GID=0;const wrapG=f=>function(...a){const P=f.apply(this,a),g=++GID;for(const t of P)t.g=g;return P};
box=wrapG(box);prismX=wrapG(prismX);prismY=wrapG(prismY);cyl=wrapG(cyl);
function grp(...a){const P=a.flat(Infinity),g=++GID;for(const t of P)t.g=g;return P}
// ------------------------------------------------------------------ disegno dei pezzi (ogni fotogramma, con la piega del momento)
const PLANES={};
function drawFace(f){const q=f.c.map(S);if(shoelace(q)>=0)return;const tx=f.col?null:texture(f.mat,ROTP?keyR(f.key,ROTP.q):f.key,f.w,f.h,f.foot,f.texId);
  if(f.alpha<1){ctx.save();ctx.globalAlpha*=f.alpha}
  if(!tx){path(q);ctx.fillStyle=f.col;ctx.fill()}else{if(f.tex&&!tx._x){tx._x=1;const g=tx.getContext('2d'),sv=ctx,sd=seed;ctx=g;ctx.save();ctx.scale(R,R);srand(hashS(tx._id+'|x'));try{f.tex(f.w,f.h,f.key)}finally{ctx.restore();ctx=sv;seed=sd}}drawQuad(tx,q)}
  if(f.over){ctx.save();path(q);ctx.clip();const sd=seed;srand(f.osd||(f.osd=hashS('o|'+f.c[0].join(',')+'|'+f.key)));try{f.over(q,f.key)}finally{seed=sd;ctx.restore()}}
  if(f.ink){path(q);ctx.strokeStyle=`rgba(15,12,10,${Math.min(.7,f.ink*.6)})`;ctx.lineWidth=f.ink;ctx.lineJoin='round';ctx.stroke()}
  if(f.alpha<1)ctx.restore()}
// appoggia una texture su un quadrilatero: una sola trasformazione se è (quasi) un parallelogramma, altrimenti due triangoli esatti
function drawQuad(tx,q,flip){const W=tx.width,H=tx.height,ex=q[0][0]+q[2][0]-q[1][0]-q[3][0],ey=q[0][1]+q[2][1]-q[1][1]-q[3][1];
  const u0=flip?W:0,u1=flip?0:W;
  if(Math.abs(ex)<.8&&Math.abs(ey)<.8){const m=affine3([[u0,H],[u1,H],[u0,0]],[q[0],q[1],q[3]]);if(!m)return;ctx.save();ctx.transform(...m);ctx.drawImage(tx,0,0);ctx.restore();return}
  tri(tx,[[u0,H],[u1,H],[u1,0]],[q[0],q[1],q[2]]);tri(tx,[[u0,H],[u1,0],[u0,0]],[q[0],q[2],q[3]])}
function tri(tx,s,d){const m=affine3(s,d);if(!m)return;const cx=(d[0][0]+d[1][0]+d[2][0])/3,cy=(d[0][1]+d[1][1]+d[2][1])/3;ctx.save();ctx.beginPath();
  for(const p of d){const dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;ctx.lineTo(p[0]+dx/l*.7,p[1]+dy/l*.7)}ctx.closePath();ctx.clip();ctx.transform(...m);ctx.drawImage(tx,0,0);ctx.restore()}
function drawFacePoly(f){const q=f.c.map(S);if(shoelace(q)>=0)return;const m=MAT[f.mat]||MAT.stone,fk=ROTP?keyR(f.key,ROTP.q):f.key;path(q);ctx.fillStyle=f.col||tone(m,fk);ctx.fill();
  if(f.tex){ctx.save();ctx.clip();const sd=seed;srand(f.sd||(f.sd=hashS('fp|'+f.c[0].join(',')+'|'+f.c.length)));try{f.tex(q,f.key)}finally{seed=sd}ctx.restore()}
  if(SKY(fk)){ctx.save();ctx.clip();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of q){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}const g=ctx.createLinearGradient(x0,y0,x0+(x1-x0)*.7,y0+(y1-y0)*.7);g.addColorStop(0,wa(.22));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.restore()}
  path(q);ctx.strokeStyle='rgba(15,12,10,.5)';ctx.lineWidth=.9;ctx.stroke()}
function drawPlane(p){if(p.host&&shoelace(p.host.c.map(S))>=0)return;const q=p.c.map(S),a=shoelace(q);if(Math.abs(a)<1)return;let tx=PLANES[p.texId];if(!tx){tx=PLANES[p.texId]=document.createElement('canvas');tx.width=Math.ceil(p.w*R);tx.height=Math.ceil(p.h*R);const g=tx.getContext('2d'),sv=ctx,sd=seed;ctx=g;ctx.scale(R,R);srand(hashS('P|'+p.texId));try{p.draw(p.w,p.h)}finally{ctx=sv;seed=sd}}
  if(p.alpha<1){ctx.save();ctx.globalAlpha*=p.alpha}drawQuad(tx,q,a>0);if(p.alpha<1)ctx.restore()}
function drawBall(b){const q=S(b.p),m=MAT[b.mat]||MAT.leaf,r=b.r;ctx.save();ctx.translate(q[0],q[1]);if(b.sq)ctx.scale(1,b.sq);const shape=()=>{if(!b.lobes){ball([0,0],r);return}ctx.beginPath();const n=b.lobes,am=b.amp||.14,N=n*6;for(let i=0;i<=N;i++){const a=i/N*TAU,k=Math.abs(Math.sin(a*n/2+(b.ph||0))),r2=r*(1-am*.5+am*k),px=Math.cos(a)*r2,py=Math.sin(a)*r2;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()};shape();ctx.fillStyle=m.c[1];ctx.fill();ctx.save();ctx.clip();
  ctx.fillStyle=m.c[0];ctx.beginPath();ctx.ellipse(LS[0]*r*.25,LS[1]*r*.25,r*.88,r*.84,0,0,TAU);ctx.fill();ctx.fillStyle=m.c[2];ctx.beginPath();ctx.ellipse(LS[0]*r*.45,LS[1]*r*.45,r*.42,r*.34,-.4,0,TAU);ctx.fill();
  if(b.tex){const sd=seed;srand(hashS('b|'+b.sd));try{b.tex(r)}finally{seed=sd}}ctx.restore();if(b.noOut!==true){ink(b.ow||2.4);shape();ctx.stroke()}ctx.restore()}
function drawLine(l){const a=S(l.a),b=S(l.b);ctx.lineCap='round';if(l.ink){ctx.strokeStyle=INK;ctx.lineWidth=l.w+2.2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}ctx.strokeStyle=l.col;ctx.lineWidth=l.w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
function drawPart(p){switch(p.k){case'face':return drawFace(p);case'facepoly':return drawFacePoly(p);case'plane':return drawPlane(p);case'hull':{const H=hull(p.pts.map(S));path(H);ink(p.w);ctx.stroke();return}case'outline':{path(p.pts.map(S));ink(p.w);ctx.stroke();return}
  case'ball':return drawBall(p);case'line':return drawLine(p);case'poly':{const q=p.pts.map(S);path(q);ctx.fillStyle=p.col;ctx.fill();if(p.ink){ink(p.ink);ctx.stroke()}return}case'fn':{if(p.o.host&&shoelace(p.o.host.c.map(S))>=0)return;const sd=seed;srand(hashS('f|'+p.sd));try{return p.f(S,ctx)}finally{seed=sd}}}}
// un prop: parts (nell'ordine di disegno: prima il contorno, poi le facce, da dietro a davanti), bx [x0,y0,x1,y1,zTop] per il taglio a
// schermo, ky la profondità (y del bordo davanti), solids per le collisioni, shadows per le ombre cotte nel terreno, lights/flames
const props=[],solids=[],shadows=[],lights=[],flames=[],holes=[],houses=[],smokes=[],perches=[],decals=[],fades=[];// fades: chiome che sfumano ({x,ky,rx,reach,a}), le parti 'roof' del prop con house:fade// decals: f() dipinte nel terreno dopo le ombre (pozze di luce fisse, macchie)
// o.ky: profondità = la y del bordo davanti della parte alta (dove sta il solido); o.kyFn(x): profondità che dipende dalla x dell'eroe (cose
// sottili in diagonale, come le ante aperte); o.floor: sta a terra (cumuli, pedane, gradini, tappeti) e si disegna prima di tutti gli esseri
const NAMES={cur:null,ref:null,grp:null};// grp: un gruppo di prop che si piegano tutti insieme (group)
function group(ref,fn){const sv=NAMES.grp;NAMES.grp=ref;try{fn()}finally{NAMES.grp=sv}}// il prop che si sta costruendo (serve ai test per dire chi copre l'eroe)
// fiamme, luci e corvi posati prendono il punto del prop che si sta costruendo: si piegano con lui
for(const arr of[flames,lights,perches,smokes])arr.push=function(...a){for(const f of a){if(f.ref===undefined)f.ref=NAMES.ref;if(TURN&&!f._t){f._t=1;[f.x,f.y]=tP(TURN,f.x,f.y);if(f.n)f.n=tV(TURN,f.n[0],f.n[1]);if(f.ky!=null)f.ky=f.y+.5}}return Array.prototype.push.apply(this,a)};
// dentro turn anche buche, chiome che sfumano, macchie del terreno (dipinte girate intorno al perno) e case (riquadro, portico, verso dei muri)
holes.push=function(...a){if(TURN)a=a.map(h=>{const q=tP(TURN,h[0],h[1]);return[q[0],q[1],...h.slice(2)]});return Array.prototype.push.apply(this,a)};
fades.push=function(...a){if(TURN)for(const f of a){const q=tP(TURN,f.x,f.ky);f.x=q[0];f.ky=q[1]}return Array.prototype.push.apply(this,a)};
decals.push=function(...a){if(TURN){const R=TURN;a=a.map(f=>()=>{ctx.save();ctx.translate(R.cx,R.cy);ctx.transform(R.c,R.s,-R.s,R.c,0,0);ctx.translate(-R.cx,-R.cy);try{f()}finally{ctx.restore()}})}return Array.prototype.push.apply(this,a)};
houses.push=function(...a){if(TURN)for(const hs of a){[hs.x,hs.y,hs.w,hs.d]=tR(TURN,hs.x,hs.y,hs.w,hs.d);if(hs.porch){const r=tR(TURN,hs.porch[0],hs.porch[1],hs.porch[2]-hs.porch[0],hs.porch[3]-hs.porch[1]);hs.porch=[r[0],r[1],r[0]+r[2],r[1]+r[3]]}hs.q=TURN.q;hs.R=mkTurn(0,0,TURN.q)}return Array.prototype.push.apply(this,a)};
function prop(o){o.ky=o.ky==null?o.bx[3]:o.ky;if(o.ref===undefined)o.ref=NAMES.ref;o.parts=o.parts||[];o.name=o.name||NAMES.cur||'?';
  if(TURN){const R=TURN,bb=b=>{const r=tR(R,b[0],b[1],b[2]-b[0],b[3]-b[1]);return[r[0],r[1],r[0]+r[2],r[1]+r[3],b[4]]};o.rot=R;o.bx=bb(o.bx);if(o.ob)o.ob=bb(o.ob);o.ky=o.bx[3];o.kyFn=null;
    if(o.ref&&!o.ref.w){const r=o.ref;o.ref=r.length>=4?bb(r).slice(0,4):tP(R,r[0],r[1]);if(r.k)o.ref.k=r.k}}// (r.w: il ref di un edificio, già nel mondo: i pezzi girati che gli stanno attaccati, come la Forgia, non lo girano)
  props.push(o);return o}
// pedane e gradini: chi ci sale sopra viene disegnato più in alto
const stands=[];const stand=(x,y,w,d,h)=>{if(TURN)[x,y,w,d]=tR(TURN,x,y,w,d);return stands.push({x,y,w,d,h})};
function heightAt(x,y){let h=0;for(const s of stands)if(x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.d&&s.h>h)h=s.h;return h}
const solid=(x,y,w,d,tag)=>{if(TURN)[x,y,w,d]=tR(TURN,x,y,w,d);const s={x,y,w,d,tag};solids.push(s);return s};
const shade=(x,y,w,d,h,a)=>{if(TURN)[x,y,w,d]=tR(TURN,x,y,w,d);return shadows.push({x,y,w,d,h,a})};const shadeR=(x,y,r,a)=>{if(TURN)[x,y]=tP(TURN,x,y);return shadows.push({x,y,r,a})};
// per disegnare un prop le facce stanno in ordine: contorno (hull) prima di tutto, poi le facce
// (part.vis: un pezzo che c'è solo a volte, come le assi di una barriera: vis() dice se disegnarlo adesso)
function drawProp(p,alphaOf){const parts=p.parts;for(const part of parts){if(part.vis&&!part.vis())continue;if(part.part&&alphaOf){const a=alphaOf(part.part);if(a<=0)continue;if(a<1){ctx.save();ctx.globalAlpha*=a;drawPart(part);ctx.restore();continue}}drawPart(part)}}
// ------------------------------------------------------------------ il mondo
const W={dbg:{},w:10*T,h:10*T,ground:null,hero:null,Z:[],FX:[],crows:[],flock:[],clouds:[],mists:[],flies:[],leaves:[],puffs:[],coins:0,t:0,
  zoneOpen:{},gunId:'pistola',split:null,gate:null,toast:null};// zone aperte, arma in mano, velo sulla zona chiusa, il cancello (l'area li prepara)
// le barriere (finestre, varchi delle recinzioni: barriere.js) sono solidi con s.bar: fermano sempre l'eroe; BARM dice chi le passa in questo
// controllo: 0 nessuno, 1 i colpi e la mira (si spara attraverso le finestre), 2 solo quelle aperte (lo zombie che colpisce da una finestra senza assi)
let BARM=0;
let DPRCUT=false;let VIEWR=1e9;/* (anteprima 48, punto 54) il mezzo lato del quadrato del mondo che può stare sullo schermo (anche girando): quello che è fuori non si aggiorna a vista, non si ordina e non si disegna (zombie, fiamme libere, corvi posati, luci, fumi) */
const farV=(x,y,r)=>Math.abs(x-CAM.x)>VIEWR+r||Math.abs(y-CAM.y)>VIEWR+r;
/* (FASE 9) un punto a terra entro m punti dallo schermo (a vista dritta e girata: S fa la rotazione); prima del primo disegno sempre sì */
const nearScr=(x,y,m)=>{if(!ORD.HW)return true;const q=S(x,y,0);return Math.abs(q[0]-CAM.x)<ORD.HW+m&&Math.abs(q[1]-CAM.y+CAM.oy)<ORD.HH+m};
let LV=0;/* il piano dei solidi che contano (anteprima 48, punto 15): 0 a terra, 1 il piano di sopra di un edificio (i suoi solidi hanno lv:1) */
/* (difetti 48) la griglia dei solidi: hit() guarda solo i solidi delle caselle di 64 px intorno (prima tutti, centinaia nella mappa grande: era un
   terzo del tempo degli zombie); tra quelli toccati vince il primo creato, come prima. Si rifà quando nascono solidi nuovi o la Bara si sposta (SGV) */
const SGC=64;let SG=null,SGV=0;
function sgBuild(){const cells=new Map();solids.forEach((s,n)=>{s._i=n;const i0=Math.floor(s.x/SGC),i1=Math.floor((s.x+s.w)/SGC),j0=Math.floor(s.y/SGC),j1=Math.floor((s.y+s.d)/SGC);
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*8192+i;let a=cells.get(k);if(!a)cells.set(k,a=[]);a.push(s)}});SG={n:solids.length,v:SGV,cells}}
function hit(x,y,r,ex){if(!SG||SG.n!==solids.length||SG.v!==SGV)sgBuild();let best=null;const i0=Math.floor((x-r)/SGC),i1=Math.floor((x+r)/SGC),j0=Math.floor((y-r)/SGC),j1=Math.floor((y+r)/SGC);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const a=SG.cells.get(j*8192+i);if(!a)continue;for(const s of a){if(best&&s._i>=best._i)continue;if(s.off||s===ex||(s.lv||0)!==LV||(s.bar&&BARM&&(BARM===1||s.bar.open())))continue;
      const cx=cl(x,s.x,s.x+s.w),cy=cl(y,s.y,s.y+s.d);if((x-cx)**2+(y-cy)**2<r*r)best=s}}return best}
function move(o,dx,dy,r){const sv=LV;LV=o.lv||0;const s0=hit(o.x,o.y,r);o.x+=dx;if(hit(o.x,o.y,r,s0))o.x-=dx;o.y+=dy;if(hit(o.x,o.y,r,s0))o.y-=dy;LV=sv}
// ------------------------------------------------------------------ navigazione degli zombie
// Griglia di 8 px con gli ostacoli gonfiati del raggio dello zombie; un campo di distanze verso l'eroe (Dijkstra a 8 vicini, senza tagliare gli
// angoli) ricalcolato quando l'eroe cambia casella. Ogni zombie va dritto se vede l'eroe; altrimenti scende lungo il campo e punta al punto
// più lontano del percorso che riesce a vedere, così gira intorno a muri, case e lapidi senza zig-zag. Se resta fermo (spinto, incastrato)
// prova per mezzo secondo di lato.
const NC=8,ZR=11,NAVMAX=4000;/* (difetti 48) tutta la mappa grande: con 1.100 px chi restava più lontano andava dritto verso l'eroe e si incastrava contro staccionate e barriere (costa circa 1 ms) */let NAV=null;
function navBuild(){const cw=Math.ceil(W.w/NC),ch=Math.ceil(W.h/NC),n=cw*ch,bl=new Uint8Array(n),los=new Uint8Array(n);
  const mark=(arr,R)=>{for(const s of solids){if(s.off||s.lv)continue;const i0=Math.max(0,Math.floor((s.x-R)/NC)),i1=Math.min(cw-1,Math.floor((s.x+s.w+R)/NC)),j0=Math.max(0,Math.floor((s.y-R)/NC)),j1=Math.min(ch-1,Math.floor((s.y+s.d+R)/NC));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=(i+.5)*NC,cy=(j+.5)*NC,dx=cx-cl(cx,s.x,s.x+s.w),dy=cy-cl(cy,s.y,s.y+s.d);if(dx*dx+dy*dy<R*R)arr[j*cw+i]=1}}};
  mark(bl,ZR+.5);mark(los,ZR+3);
  // le barriere: un corridoio di caselle libere che attraversa il muro (bar: quale barriera, bs: da che parte della linea); la vista (los) resta chiusa
  const bar=new Int16Array(n),bs=new Int8Array(n);BARS.forEach((B,bi)=>{const R0=B.reach,hw=Math.max(4,B.half-5),ex=R0+hw+NC;
    const i0=Math.max(0,Math.floor((B.x-ex)/NC)),i1=Math.min(cw-1,Math.floor((B.x+ex)/NC)),j0=Math.max(0,Math.floor((B.y-ex)/NC)),j1=Math.min(ch-1,Math.floor((B.y+ex)/NC));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const dx=(i+.5)*NC-B.x,dy=(j+.5)*NC-B.y,v=dx*B.nx+dy*B.ny,u=-dx*B.ny+dy*B.nx;if(Math.abs(u)<=hw&&Math.abs(v)<=R0){const c=j*cw+i;bl[c]=0;bar[c]=bi+1;bs[c]=v>=0?1:-1}}});
  NAV={cw,ch,n,bl,los,bar,bs,bc:new Float32Array(BARS.length+1),dist:new Float32Array(n),hk:new Float32Array(n*8+64),hv:new Int32Array(n*8+64),hc:-1,t:0}}
const cellOf=(x,y)=>cl(Math.floor(y/NC),0,NAV.ch-1)*NAV.cw+cl(Math.floor(x/NC),0,NAV.cw-1);
const cen=c=>{const i=c%NAV.cw;return[(i+.5)*NC,((c-i)/NAV.cw+.5)*NC]};
function navField(){const N=NAV,h=W.hero,cw=N.cw,ch=N.ch,D=N.dist,B=N.bl,hk=N.hk,hv=N.hv,BR=N.bar,BS=N.bs,BC=N.bc;D.fill(1e9);let hs=0;
  for(let i=0;i<BARS.length;i++)BC[i+1]=BARS[i].off?1e6:BARS[i].cost();// passare da una parte all'altra di una barriera costa (chiusa di più)
  const push=(k,v)=>{let i=hs++;while(i>0){const p=(i-1)>>1;if(hk[p]<=k)break;hk[i]=hk[p];hv[i]=hv[p];i=p}hk[i]=k;hv[i]=v};
  const pop=()=>{const v=hv[0],lk=hk[--hs],lv=hv[hs];let i=0;for(;;){let c=2*i+1;if(c>=hs)break;if(c+1<hs&&hk[c+1]<hk[c])c++;if(hk[c]>=lk)break;hk[i]=hk[c];hv[i]=hv[c];i=c}hk[i]=lk;hv[i]=lv;return v};
  // le caselle libere vicino all'eroe sono i punti di partenza (l'eroe può stare più vicino ai muri di uno zombie)
  const G0=navGoal(),hi=Math.floor(G0[0]/NC),hj=Math.floor(G0[1]/NC);let lim=30;for(let r=4;r<=16&&!hs;r+=4,lim+=32)for(let j=hj-r;j<=hj+r;j++)for(let i=hi-r;i<=hi+r;i++){if(i<0||j<0||i>=cw||j>=ch)continue;const c=j*cw+i;if(B[c])continue;const d=Math.hypot((i+.5)*NC-G0[0],(j+.5)*NC-G0[1]);if(d>lim)continue;if(d<D[c]){D[c]=d;push(d,c)}}
  while(hs){const k0=hk[0],c=pop();if(k0>D[c])continue;if(k0>NAVMAX)break;const i=c%cw,j=(c-i)/cw;// oltre NAVMAX px dall'eroe il campo non serve (mappe grandi)
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(B[nc])continue;
      if(di&&dj&&(B[j*cw+ni]||B[nj*cw+i]))continue;const nd=k0+(di&&dj?1.4142*NC:NC)+(BR[nc]&&BR[nc]===BR[c]&&BS[nc]!==BS[c]?BC[BR[nc]]:0);if(nd<D[nc]){D[nc]=nd;push(nd,nc)}}}}
function navUpdate(dt){if(!NAV)return;NAV.t-=dt;const g=navGoal(),c=cellOf(g[0],g[1]);if(c!==NAV.hc&&NAV.t<=0){NAV.hc=c;NAV.t=.08;navField()}}
// la linea tra due punti è libera? (sulla griglia più gonfia; i primi e gli ultimi 10 px non contano: chi sta vicino a un muro vede lo stesso)
function losClear(x0,y0,x1,y1){const L=Math.hypot(x1-x0,y1-y0);if(L<1)return true;const n=Math.ceil(L/4);for(let k=1;k<n;k++){const s=k/n*L;if(s<10||L-s<10)continue;const t=k/n;if(NAV.los[cellOf(x0+(x1-x0)*t,y0+(y1-y0)*t)])return false}return true}
// la linea è libera per un corpo di raggio r sui solidi veri (ex: il solido da cui sta uscendo)
// (bm: come passano le barriere, vedi BARM)
function physClear(x0,y0,x1,y1,r,ex,bm){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.ceil(L/3)),sv=BARM;BARM=bm||0;try{for(let k=1;k<=n;k++){const t=k/n;if(hit(x0+(x1-x0)*t,y0+(y1-y0)*t,r,ex))return false}return true}finally{BARM=sv}}
function steer(z){const h=W.hero,N=NAV,G0=navGoal(),gx=G0[0],gy=G0[1];
  // l'eroe invisibile (Lucky Card): gli zombie vagano qua e là senza trovarlo
  if(W.mods&&W.mods.invis>0){if(!z.wd||z.wdT<W.t||Math.hypot(z.wd[0]-z.x,z.wd[1]-z.y)<12){z.wd=[z.x+rr(-110,110),z.y+rr(-110,110)];z.wdT=W.t+rr(1.4,3)}return z.wd}
  if(!N)return[gx,gy];const d=Math.hypot(gx-z.x,gy-z.y);if((d<34&&physClear(z.x,z.y,gx,gy,4))||losClear(z.x,z.y,gx,gy))return[gx,gy];
  const D=N.dist,cw=N.cw,ch=N.ch,c=cellOf(z.x,z.y);
  if(N.bl[c]||D[c]>=1e9){// dentro un ostacolo (la fossa da cui è uscito) o fuori dal campo: la casella libera vicina che porta prima all'eroe
    // le caselle libere intorno, a cerchi crescenti: si tengono solo quelle raggiungibili davvero in linea retta (controllo sui solidi veri) e tra
    // queste vince quella da cui il percorso è più corto; così uno zombie schiacciato contro un recinto non punta a una casella dall'altra parte
    const i0=c%cw,j0=(c-i0)/cw,s0=hit(z.x,z.y,ZR-.5);let best=null,bv=1e9,tested=0;
    for(let r=1;r<=18;r++){for(let j=j0-r;j<=j0+r;j++)for(let i=i0-r;i<=i0+r;i++){if(Math.max(Math.abs(i-i0),Math.abs(j-j0))!==r||i<0||j<0||i>=cw||j>=ch)continue;const cc=j*cw+i;if(N.bl[cc]||D[cc]>=1e9)continue;
        const p=cen(cc),v=D[cc]+Math.hypot(p[0]-z.x,p[1]-z.y)*.5;if(v>=bv)continue;tested++;if(physClear(z.x,z.y,p[0],p[1],ZR-1,s0)){bv=v;best=p}}
      if(best&&r>=3)break;if(tested>160)break}
    return best||[gx,gy]}
  let cur=c,tgt=null;for(let k=0;k<24;k++){const i=cur%cw,j=(cur-i)/cw;let nb=-1,nv=D[cur];
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(N.bl[nc])continue;if(di&&dj&&(N.bl[j*cw+ni]||N.bl[nj*cw+i]))continue;if(D[nc]<nv){nv=D[nc];nb=nc}}
    if(nb<0)break;cur=nb;const p=cen(cur);if(losClear(z.x,z.y,p[0],p[1]))tgt=p;else{if(!tgt)tgt=p;break}}
  return tgt||[gx,gy]}
// ------------------------------------------------------------------ le scale (anteprima 48, punto 15). Un edificio col piano di sopra (prop_borgo.js)
// registra la sua scala: {hs, H (l'altezza del piano), bot (dove si comincia a salire, a terra), foot (il primo gradino), head (l'ultimo, alto H),
// land (dove si arriva di sopra)}. Chi la usa (l'eroe col bottone «Sali al piano di sopra» / «Scendi», gli zombie che lo inseguono) la percorre in
// S.dur secondi (gli zombie al loro passo) e in cima passa al piano 1 (o.lv), dove contano solo i solidi con lv:1 (i muri pieni, il buco della
// scala con la ringhiera, i mobili di sopra). Di sopra non c'è la griglia: si va dritti, scivolando lungo i mobili
const STAIRS=[];
function scala(S){S.dur=S.dur||1.1;S.ref=(props.find(p=>p.house===S.hs)||{}).ref||null;const P=[[...S.bot,0],[...S.foot,0],[...S.head,S.H],[...S.land,S.H]];let L=0;S.seg=[];for(let i=1;i<P.length;i++){const l=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);S.seg.push([P[i-1],P[i],L,l]);L+=l}S.len=L;S.i=STAIRS.length;STAIRS.push(S);
  buyable({id:'sali'+S.i,x:S.bot[0],y:S.bot[1],r:28,lv:0,label:()=>'Sali al piano di sopra',price:()=>0,hold:.3,act(){climbStart(W.hero,S,1);return true}});
  buyable({id:'scendi'+S.i,x:S.land[0],y:S.land[1],r:28,lv:1,show:()=>W.hero.st===S,label:()=>'Scendi',price:()=>0,hold:.3,act(){climbStart(W.hero,S,-1);return true}});return S}
function stairAt(S,t){const u=cl(t,0,1)*S.len,G=S.seg;for(let i=0;i<G.length;i++){const[a,b,l0,l]=G[i];if(u<=l0+l||i===G.length-1){const k=l?cl((u-l0)/l,0,1):1;return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]}}return[S.land[0],S.land[1],S.H]}
function climbStart(o,S,dir){o.cl={S,dir,t:0,T:o===W.hero?S.dur:S.len/Math.max(26,o.spd||40)};o.st=S;o.tg=null;o.bx=null;if(o===W.hero)o.busy=null}
function climbStep(o,dt){const C=o.cl,S=C.S;C.t=Math.min(1,C.t+dt/C.T);const q=stairAt(S,C.dir>0?C.t:1-C.t),dx=q[0]-o.x,dy=q[1]-o.y;if(dx*dx+dy*dy>.01)o.face=Math.atan2(dy,dx);o.x=q[0];o.y=q[1];o.zh=q[2];
  if(C.t>=1){o.lv=C.dir>0?1:0;o.lvH=C.dir>0?S.H:0;o.cl=null;o.vx=o.vy=null;o.chk=0;o.cx0=null}}
// il piano dell'eroe per gli zombie (sulla scala conta quello dove arriva); due esseri si colpiscono e si vedono solo sullo stesso piano (sulla
// scala: alla stessa altezza, a meno di 46 px); la meta del campo degli zombie a terra: l'eroe, o il piede della sua scala se è di sopra
function heroLv(){const h=W.hero;return h.cl?(h.cl.dir>0?1:0):(h.lv||0)}
function sameLv(z,o){o=o||W.hero;if(z.cl||o.cl)return Math.abs((z.zh||0)-(o.zh||0))<46;return(z.lv||0)===(o.lv||0)}
function navGoal(){const h=W.hero;return STAIRS.length&&heroLv()===1&&h.st?h.st.bot:[h.x,h.y]}
// chi sta dentro un edificio col piano di sopra si piega con l'edificio (il suo ref, come i corvi posati sui tetti): di sopra e sulla scala resta
// sul suo pavimento; a terra (z 0) non cambia niente. SB è S per gli esseri e i loro effetti
function refAt(x,y){for(const S of STAIRS){const h=S.hs;if(x>h.x&&x<h.x+h.w&&y>h.y&&y<h.y+h.d)return S.ref||null}return null}
function SB(x,y,z){if(Array.isArray(x))return SB(x[0],x[1],x[2]);const r=STAIRS.length&&z>0?refAt(x,y):null;if(!r)return S(x,y,z);const sv=REF;setRef(r);try{return S(x,y,z)}finally{REF=sv}}
// uno zombie e le scale: sulla scala la percorre; di sopra va dritto verso l'eroe se è lì, se no alla scala per scendere; di sotto, con
// l'eroe di sopra, il campo lo porta al piede della scala e lì comincia a salire. Restituisce true se ha già mosso lo zombie
function stairWalk(z,dt){if(z.cl){climbStep(z,dt);return true}const h=W.hero,hl=heroLv();
  if((z.lv||0)===1){const S=z.st;if(!S){z.lv=0;return false}if(hl===1&&h.st===S&&!h.cl){upWalk(z,S,h.x,h.y,dt);return true}
    if(Math.hypot(S.land[0]-z.x,S.land[1]-z.y)<10){climbStart(z,S,-1);return true}upWalk(z,S,S.land[0],S.land[1],dt);return true}
  if(hl===1&&h.st&&Math.hypot(h.st.bot[0]-z.x,h.st.bot[1]-z.y)<14){climbStart(z,h.st,1);return true}return false}
// di sopra non c'è la griglia grande: una piccola dentro l'edificio (fatta la prima volta, coi solidi lv:1), un campo a passi verso la meta
// (rifatto quando la meta cambia casella) e lo zombie punta alla casella più lontana che vede lungo la discesa (come steer)
function upNav(S){if(S.nav)return S.nav;const hs=S.hs,x0=hs.x,y0=hs.y,cw=Math.ceil(hs.w/NC),ch=Math.ceil(hs.d/NC),n=cw*ch,bl=new Uint8Array(n),R=ZR+.5;
  for(const s of solids){if(s.lv!==1||s.off)continue;for(let j=0;j<ch;j++)for(let i=0;i<cw;i++){const cx=x0+(i+.5)*NC,cy=y0+(j+.5)*NC,dx=cx-cl(cx,s.x,s.x+s.w),dy=cy-cl(cy,s.y,s.y+s.d);if(dx*dx+dy*dy<R*R)bl[j*cw+i]=1}}
  return S.nav={x0,y0,cw,ch,n,bl,D:new Float32Array(n),q:new Int32Array(n),gc:-1}}
function upSteer(z,S,gx,gy){if(physClear(z.x,z.y,gx,gy,ZR-1))return[gx,gy];const N=upNav(S),{cw,ch,bl,D,q,x0,y0}=N,cOf=(x,y)=>cl(Math.floor((y-y0)/NC),0,ch-1)*cw+cl(Math.floor((x-x0)/NC),0,cw-1),gc=cOf(gx,gy);
  if(gc!==N.gc){N.gc=gc;D.fill(1e9);let h=0,t=0;const gi=gc%cw,gj=(gc-gi)/cw;for(let r=0;r<=3&&!t;r++)for(let j=gj-r;j<=gj+r;j++)for(let i=gi-r;i<=gi+r;i++){if(i<0||j<0||i>=cw||j>=ch)continue;const c=j*cw+i;if(!bl[c]&&D[c]>0){D[c]=0;q[t++]=c}}
    while(h<t){const c=q[h++],i=c%cw,j=(c-i)/cw;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(bl[nc]||D[nc]<1e9)continue;if(di&&dj&&(bl[j*cw+ni]||bl[nj*cw+i]))continue;D[nc]=D[c]+1;q[t++]=nc}}}
  let cur=cOf(z.x,z.y),tgt=null;for(let k=0;k<14;k++){const i=cur%cw,j=(cur-i)/cw;let nb=-1,nv=D[cur];for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(!bl[nc]&&D[nc]<nv){nv=D[nc];nb=nc}}
    if(nb<0)break;cur=nb;const bi=nb%cw,p=[x0+(bi+.5)*NC,y0+((nb-bi)/cw+.5)*NC];if(physClear(z.x,z.y,p[0],p[1],ZR-1))tgt=p;else{if(!tgt)tgt=p;break}}
  return tgt||[gx,gy]}
function upWalk(z,S,gx,gy,dt){z.st2=(z.st2||0)-dt;if(z.st2<=0||!z.tg2||Math.hypot(z.tg2[0]-z.x,z.tg2[1]-z.y)<5){z.tg2=upSteer(z,S,gx,gy);z.st2=.12}walkTo(z,z.tg2[0],z.tg2[1],dt)}
function walkTo(z,tx,ty,dt){let dx=tx-z.x,dy=ty-z.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;if(z.vx==null){z.vx=dx;z.vy=dy}const k=Math.min(1,dt*7);z.vx+=(dx-z.vx)*k;z.vy+=(dy-z.vy)*k;const vl=Math.hypot(z.vx,z.vy)||1;
  move(z,z.vx/vl*z.spd*dt,z.vy/vl*z.spd*dt,ZR);z.face=Math.atan2(z.vy,z.vx)}
function zWalk(z,dt){if(STAIRS.length&&stairWalk(z,dt))return;if(z.ai&&BARS.length){if(!z.bx&&(z.bxT=(z.bxT||0)-dt)<=0){z.bxT=.15;z.bx=barCheck(z)}if(z.bx){barStep(z,dt);return}}// un boss la sfonda
  z.st=(z.st||0)-dt;if(z.st<=0||!z.tg||Math.hypot(z.tg[0]-z.x,z.tg[1]-z.y)<5){z.tg=steer(z);z.st=.12}
  let tx=z.tg[0]-z.x,ty=z.tg[1]-z.y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  if(z.det>0){z.det-=dt;tx=z.dvx;ty=z.dvy}
  if(z.vx==null){z.vx=tx;z.vy=ty}const k=Math.min(1,dt*7);z.vx+=(tx-z.vx)*k;z.vy+=(ty-z.vy)*k;const vl=Math.hypot(z.vx,z.vy)||1;
  move(z,z.vx/vl*z.spd*dt,z.vy/vl*z.spd*dt,ZR);z.face=Math.atan2(z.vy,z.vx);
  z.chk=(z.chk||0)+dt;if(z.cx0==null){z.cx0=z.x;z.cy0=z.y}
  if(z.chk>.7){if(Math.hypot(z.x-z.cx0,z.y-z.cy0)<z.spd*.7*.3&&!(z.det>0)){const sd=Math.random()<.5?-1:1;z.dvx=-ty*sd;z.dvy=tx*sd;z.det=.5;z.st=0}z.chk=0;z.cx0=z.x;z.cy0=z.y}}
// ------------------------------------------------------------------ le barriere (barriere.js: finestre e varchi delle recinzioni)
// Una barriera è {x, y (il centro sulla linea del muro), nx, ny (il verso «fuori»), half (mezza apertura), th (spessore), reach (mezzo corridoio),
// open(), cost(), hit(z) (un colpo di zombie: il vetro o un'asse), smash(z) (un boss la sfonda), shot() (un colpo dell'eroe che la attraversa)}.
// Nella griglia il corridoio è libero e passare la linea costa cost(): chiusa costa di più, così gli zombie prendono la porta se è poco più
// lunga. Lo zombie che il campo manda di là (barCheck) va davanti alla barriera, la colpisce finché non è aperta e la scavalca in 0,75 s
// con un saltello, senza urti; poi riprende a camminare. Se intanto l'eroe va altrove e la barriera non serve più, lascia perdere
const BARS=[];
function barrier(B){B.reach=B.reach||30;B.th=B.th||10;B.half=B.half||13;B.vault=0;BARS.push(B);return B}
function barCheck(z){if(!NAV||!NAV.bar||!BARS.length)return null;const c=cellOf(z.x,z.y),b=NAV.bar[c];if(!b)return null;const B=BARS[b-1];if(B.off)return null;
  const s=(z.x-B.x)*B.nx+(z.y-B.y)*B.ny>=0?1:-1,o=B.th/2+ZR+2,fx=B.x-s*B.nx*o,fy=B.y-s*B.ny*o,fc=cellOf(fx,fy),D=NAV.dist;
  const df=Math.hypot(fx-z.x,fy-z.y);if(D[fc]>=1e9||D[c]>=1e9||D[fc]+NAV.bc[b]+df>D[c]+2*NC+4+.15*df)return null;return{B,s,st:'va',t:0,chk:0}}/* (difetti 48) più tolleranza: arrivando di lato (al varco del bordo est) il salto dritto è più lungo del percorso sulla griglia di una ventina di px e lo zombie restava a spingere contro le assi */// (una casella di tolleranza: il salto dritto è un poco più lungo del percorso sulla griglia, e uno zombie messo di lato davanti alla finestra restava lì)
function barStep(z,dt){const X=z.bx,B=X.B,s=X.s,o=B.th/2+ZR+1,ax=B.x+s*B.nx*o,ay=B.y+s*B.ny*o,fa=Math.atan2(-s*B.ny,-s*B.nx);X.t+=dt;
  const an=(a,per)=>{if(z.anim!==a){z.anim=a;z.p=0}const p0=z.p;z.p=(z.p+dt/per)%1;return p0};
  const still=()=>{if((X.chk+=dt)<.5)return true;X.chk=0;const c2=barCheck(z);if(c2&&c2.B===B)return true;z.bx=null;return false};// serve ancora?
  if(X.st==='va'){const dx=ax-z.x,dy=ay-z.y,d=Math.hypot(dx,dy);
    if(d<4||(X.t>1.6&&d<22)){X.st=B.open()?'su':'colpo';X.t=0;z.p=0;return}if(X.t>2.4){z.bx=null;return}
    const sp=Math.min(d,z.spd*dt);move(z,dx/d*sp,dy/d*sp,ZR);z.face=Math.atan2(dy,dx);an('walk',z.kind==='hound'?.6:1.1);still();return}
  if(X.st==='colpo'){z.face=fa;if(B.open()){X.st='su';X.t=0;return}if(z.ai){B.smash(z);X.st='su';X.t=0;return}
    const p0=an('attack',1.4);if(p0<.55&&z.p>=.55)B.hit(z);still();return}
  // di là: dalla parte di qua a quella di là in 0,75 s, un saltello sul davanzale, senza urti
  if(!X.from){X.from=[z.x,z.y];X.to=[B.x-s*B.nx*o,B.y-s*B.ny*o];B.vault++;if(B.onVault)B.onVault(z,s)}
  const k=Math.min(1,X.t/.75),e=ez(k);z.x=lerp(X.from[0],X.to[0],e);z.y=lerp(X.from[1],X.to[1],e);z.zh=heightAt(z.x,z.y)+Math.sin(k*Math.PI)*(B.hop||12);z.face=fa;if(!z.ai)an('walk',.75);
  if(k>=1){B.vault--;z.bx=null;z.tg=null;z.st=0;z.cx0=null}}
// ------------------------------------------------------------------ terreno cotto (chiamato dall'area dopo aver messo i prop)
// GT: quanti punti della foto per pixel del mondo: 2 sulla mappa di prima, 1,5 sulla mappa grande (anteprima 48, 30 × 29 caselle: a 2 la foto
// sarebbe 3840 × 3712, troppa memoria per un telefono; a 1,5 è come quella di prima)
let GT=2;let groundDraw=null,BAKE=null;
// edgeSnap(): chiamato dall'area dentro il suo pittore, fotografa il terreno di base per il fuori mappa (makeEdgeBands) prima delle cose che
// non devono proseguire oltre il bordo (fosse, pozzanghere, foglie); se l'area non lo chiama si fotografa tutto il pittore, prima delle ombre
function edgeSnap(){if(BAKE&&!BAKE.snap){BAKE.snap=1;W.edgeBands=makeEdgeBands(BAKE.c,BAKE.w,BAKE.h)}}
// La cottura è fatta a passi (bakeSteps): costruendo la mappa tutta insieme (l'anteprima) i passi vanno uno dopo l'altro; nel gioco la costruzione
// a pezzi (bootAsync) ferma la cottura a ogni passo e lascia libero il telefono. Il pittore dell'area può essere una funzione* che fa yield tra
// un pennello e l'altro (i pennelli lunghi, G.grass$ e G.tufts$, anche a metà, una fascia di righe alla volta): a ogni pausa il disegno fatto
// fin lì viene dipinto davvero (la lettura di un pixel lo fa fare al browser adesso, invece che tutto insieme al primo fotogramma della mappa),
// il gioco riprende il suo ctx e la cottura tiene da parte il suo seme. Con BAKEQ (la costruzione a pezzi) bakeGround mette solo da parte il
// lavoro, che bootAsync fa dopo area.build(), prima di finalize(), come nella strada tutta insieme
let BAKEQ=null,STEP=false;
function bakeGround(w,h,painter){if(BAKEQ){W.w=w;W.h=h;BAKEQ.push([w,h,painter]);return}runSteps(bakeSteps(w,h,painter))}
function runSteps(it){while(!it.next().done);}
function* bakeSteps(w,h,painter){const tk0=performance.now();W.w=w;W.h=h;GT=w*h>16*29*T*T*1.1?1.5:2;const c=document.createElement('canvas');c.width=w*GT;c.height=h*GT;const g=c.getContext('2d');let sv=ctx,sd=5;ctx=g;ctx.scale(GT,GT);srand(5);const job={c,w,h,snap:0};BAKE=job;
  const pause=function*(lab){if(!STEP)return;g.getImageData(0,0,1,1);sd=seed;ctx=sv;BAKE=null;yield lab;sv=ctx;ctx=g;BAKE=job;seed=sd};
  try{const it=painter(w,h);// l'area dipinge il suo terreno
    if(it&&typeof it.next==='function')for(let k=0;;k++){if(it.next().done)break;yield* pause('pittore '+k)}
    edgeSnap();yield* pause('bordo');// le strisce di fuori mappa, se l'area non le ha già fatte: prima delle ombre (specchiate sembrerebbero muri fantasma)
    // ombre: silhouette spinta a est e un po' a sud (luna a ovest, alta), disegnate su uno strato a parte e composte una volta sola, così dove si
    // sovrappongono non diventano nere; il piede è più scuro della punta. Poi il buio di contatto ai piedi di tutto (a ellisse per le cose tonde) e le decalcomanie
    // le ombre e il buio di contatto si disegnano su uno strato a 1 px per unità (metà della foto), senza filtri, e si appoggiano ingranditi: la
    // levigatura dell'ingrandimento le ammorbidisce come la sfocatura di prima, che sulla mappa grande (una sfocatura per ogni solido su una foto di
    // milioni di pixel) teneva ferma la scheda grafica per decine di secondi prima del primo fotogramma
    const LR=1,sh=document.createElement('canvas');sh.width=Math.ceil(w*LR);sh.height=Math.ceil(h*LR);const g2=sh.getContext('2d');g2.scale(LR,LR);
    const layer=(k)=>{g2.clearRect(0,0,w,h);g2.fillStyle='#000';for(const s of shadows){if(s.r){g2.beginPath();g2.ellipse(s.x,s.y,s.r*(k<1?.8:1),s.r*.6*(k<1?.8:1),0,0,TAU);g2.fill();continue}
        const ox=s.h*.5*k,oy=s.h*.15*k,P=[[s.x,s.y],[s.x+s.w,s.y],[s.x+s.w,s.y+s.d],[s.x,s.y+s.d]];g2.beginPath();hull(P.concat(P.map(p=>[p[0]+ox,p[1]+oy]))).forEach((q,i)=>i?g2.lineTo(q[0],q[1]):g2.moveTo(q[0],q[1]));g2.closePath();g2.fill()}};
    ctx.save();ctx.imageSmoothingEnabled=true;layer(1);ctx.globalAlpha=.24;ctx.drawImage(sh,0,0,w,h);ctx.restore();yield* pause('ombre 1');ctx.save();ctx.imageSmoothingEnabled=true;layer(.45);ctx.globalAlpha=.16;ctx.drawImage(sh,0,0,w,h);ctx.restore();yield* pause('ombre 2');ctx.save();ctx.imageSmoothingEnabled=true;
    g2.clearRect(0,0,w,h);g2.fillStyle='#000';g2.beginPath();for(const s of solids){if(s.w>400||s.d>400||s.noAO)continue;if(s.round){g2.moveTo(s.x+s.w+1.5,s.y+s.d/2);g2.ellipse(s.x+s.w/2,s.y+s.d/2,s.w/2+1.5,s.d/2+1.5,0,0,TAU)}else g2.rect(s.x-1,s.y-1,s.w+2,s.d+2)}g2.fill();
    ctx.globalAlpha=.3;ctx.drawImage(sh,0,0,w,h);ctx.restore();yield* pause('buio di contatto');
    for(let i=0;i<decals.length;i++){ctx.save();decals[i]();ctx.restore();if(i%12===11)yield* pause('decalcomanie')}yield* pause('decalcomanie');
  }finally{ctx=sv;BAKE=null}W.ground=tileGround(c);c.width=c.height=0;W.dbg.tbake=performance.now()-tk0}
// (anteprima 48, punto 54) la foto del terreno si taglia in riquadri di al più 1024 px, con 2 px in comune tra vicini (niente righe tra un
// riquadro e l'altro): una foto sola di milioni di pixel (la mappa grande, 2880×2784) il browser la disegna per una strada lentissima (26 ms a
// fotogramma invece di 8 sul computer di prova); a riquadri si disegnano solo quelli sullo schermo. W.ground: {width, height, tiles}
function tileGround(c){const TS=1024,O=2,tiles=[];for(let sy=0;sy<c.height;sy+=TS)for(let sx=0;sx<c.width;sx+=TS){const x0=Math.max(0,sx-O),y0=Math.max(0,sy-O),x1=Math.min(c.width,sx+TS+O),y1=Math.min(c.height,sy+TS+O),t=document.createElement('canvas');
    t.width=x1-x0;t.height=y1-y0;t.getContext('2d').drawImage(c,x0,y0,x1-x0,y1-y0,0,0,x1-x0,y1-y0);tiles.push({c:t,x:x0/GT,y:y0/GT,w:(x1-x0)/GT,h:(y1-y0)/GT})}
  return{width:c.width,height:c.height,tiles,draw(g){for(const t of tiles)g.drawImage(t.c,0,0,t.c.width,t.c.height,t.x,t.y,t.w,t.h)}}}// (draw: tutta la foto, per le prove)
// ------------------------------------------------------------------ luci, buio, nebbia, cielo
let dark=null,mistImg=null,cloudImg=null;
// le pozze di luce sono macchie del terreno: un'ellisse del mondo r × 0,62·r disegnata dentro inGround, così girando resta ferma sotto la luce
// (a vista dritta S(x,y,0) è proprio (x,y) e inGround non fa niente: la stessa di prima)
function drawLights(h0a){if(LOWFX)return;ctx.save();ctx.globalCompositeOperation='lighter';inGround(()=>{for(const L of lights){if(L.house&&(L.house.a>.6||(L.lvl!=null&&(L.lvl?(L.house.up||0)<.5:(L.house.up||0)>.5))))continue;if(farV(L.x,L.y,L.r+20))continue;const f=L.fl?(.9+.1*Math.sin(W.t*(L.fl===2?2:9)+L.x)*Math.sin(W.t*5.3+L.y)):1,a=L.a*(L.house?1-L.house.a:1)*.8;glow(L.rgb,L.x,L.y,L.r*f,a*f,L.r*f*.62)}});ctx.restore()}
function drawDark(W0,H0,toScr0,h0a){if(LOWFX)return;const Q=3,Wd=Math.ceil(W0/Q),Hd=Math.ceil(H0/Q),toScr=(x,y,r)=>toScr0(x,y,r).map(v=>v/Q);if(!dark)dark=document.createElement('canvas');if(dark.width!==Wd||dark.height!==Hd){dark.width=Wd;dark.height=Hd}
  const g=dark.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,Wd,Hd);g.fillStyle='rgba(10,14,34,.42)';g.fillRect(0,0,Wd,Hd);
  g.globalCompositeOperation='destination-out';const SP=CAM.SP,hole=(x,y,r,a,flat)=>{let[sx,sy,sr0]=toScr(x,y,r),sr=Math.max(1,sr0||1);const sq=SP!==1&&!flat;if(sq){g.save();g.translate(sx,sy);g.scale(1,SP);sx=sy=0}const gr=g.createRadialGradient(sx,sy,0,sx,sy,sr);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill();if(sq)g.restore()};
  // il buco di una luce alta (il lampione) sta a metà altezza sullo schermo: a vista dritta copre la pozza a terra (un po' a nord del palo) e la
  // lanterna. Girando, la parte a terra deve restare ferma nel mondo: il centro diventa il punto del terreno z/2 a nord del palo (con la stessa
  // piega), cioè S(x,y,z/2) senza l'altezza e con lo scarto (0, −z/2) del mondo; la lanterna, che sullo schermo resta sopra la base, prende un
  // secondo buco piccolo alla sua altezza, acceso man mano che il primo se ne va (a vista dritta non c'è: niente salti). Più grande
  // schiarirebbe anche il terreno dietro, che girando cambierebbe di nuovo
  for(const L of lights){if(L.off||(L.house&&L.house.a>.6)||farV(L.x,L.y,L.r*1.2+(L.z||0)))continue;const hz=(L.z||0)*.5,ha=.85*(L.house?1-L.house.a:1);LEANK=L.lk||1;setRef(L.ref);const q=S(L.x,L.y,hz),qt=hz?S(L.x,L.y,L.z):q;LEANK=1;setRef(null);
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
// f.n (facoltativa): la normale della faccia da cui esce la luce (la porta della cripta): vista da dietro non si disegna, di taglio sfuma
function drawFlame(f,h0a){if(f.house&&(f.house.a>.9||(f.lvl!=null&&(f.lvl?(f.house.up||0)<.5:(f.house.up||0)>.5))))return;if(f.n){const fc=facing(f.n[0],f.n[1]);if(fc<=0)return;if(fc<.25){ctx.save();ctx.globalAlpha*=fc/.25;try{drawFlame0(f)}finally{ctx.restore()}return}}drawFlame0(f)}
// le falene intorno ai vetri accesi dei lampioni e delle lanterne (punto 11: piccoli dettagli vivi): tre puntini che girano e sbattono
function moths(q,f){if(LOWFX)return;const t=W.t||0;ctx.save();for(let i=0;i<3;i++){const a=t*(1.6+i*.5)+i*2.1+f.x*.01,r=9+4*Math.sin(t*1.3+i),x=q[0]+Math.cos(a)*r,y=q[1]-4+Math.sin(a*1.7)*r*.55,fl=Math.abs(Math.sin(t*28+i*3));
  ctx.fillStyle='rgba(235,225,200,.85)';ctx.beginPath();ctx.ellipse(x-1.2,y,1.4,.6+fl*.9,-.5,0,TAU);ctx.ellipse(x+1.2,y,1.4,.6+fl*.9,.5,0,TAU);ctx.fill();ctx.fillStyle='rgba(60,50,40,.9)';ctx.fillRect(x-.4,y-.6,.8,1.4)}ctx.restore()}
function drawFlame0(f){if(f.off)return;LEANK=f.lk||1;setRef(f.ref);const q=S(f.x,f.y,f.z);LEANK=1;setRef(null);if(f.glass)moths(q,f);const fl=.85+.15*Math.sin(W.t*11+f.x)*Math.sin(W.t*7.3+f.y);
  if(f.fire){for(let i=0;i<5;i++){const a=W.t*6+i*1.3,h=10+4*Math.sin(a),xx=q[0]+(i-2)*3.2;ctx.fillStyle=i%2?'#ffb040':'#ff7a20';ctx.beginPath();ctx.moveTo(xx-3,q[1]);ctx.quadraticCurveTo(xx-2,q[1]-h*.6,xx+Math.sin(a)*1.5,q[1]-h);ctx.quadraticCurveTo(xx+2,q[1]-h*.6,xx+3,q[1]);ctx.closePath();ctx.fill()}}
  else if(f.r<2){ctx.fillStyle='#fff2c0';ctx.beginPath();ctx.ellipse(q[0],q[1]-2,f.r*1.1,f.r*2.4*fl,0,0,TAU);ctx.fill()}
  if(LOWFX)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(f.rgb,q[0],q[1]-2,(f.crypt?26:f.fire?28:f.pump?16*f.pump:f.glass?22:12)*fl,(f.crypt?.5+.2*Math.sin(W.t*1.4):f.pump?.7:.6)*fl);ctx.restore()}
// ------------------------------------------------------------------ gli esseri: eroe con la pistola, zombie dalle buche
const KINDS=[['zombie',1.1,30,80],['strisciante',1.1,24,60],['minatore',1.1,28,110],['lanterna',1.55,22,160],['hound',1.05,64,60]];// la vita in punti di danno delle armi (la pistola fa 20)
let gunState=null,zOn=true,spawnT=1.2,ZID=0;// ZID: numero di serie degli zombie (il loro id stabile per l'ordine di disegno)
{const _h=held;held=function(St,o,B){if(St.gun&&window.ARMI)return ARMI.inMano(St.gun,B,o.gp||{},o.aim);return _h(St,o,B)}}
// l'eroe della mappa: l'eroe 3D con l'arma zombie in mano; il gioco gli mette l'eroe in campo con l'equipaggiamento del menu (dal 14 ottobre,
// Denis: «l'eroe scelto» anche nella modalità zombie; prima era sempre l'Arciere), l'anteprima l'Arciere di base. hid resta 'arciere' perché
// tutti gli eroi stanno sullo stesso corpo 3D (EROE.arciere)
const HSTYLE=Object.assign({},HERO,{hid:'arciere',held:null,quiver:false,gun:'pistola'});
function stile(s){for(const k of Object.keys(HSTYLE))delete HSTYLE[k];Object.assign(HSTYLE,HERO,s||{},{hid:'arciere',held:null,quiver:false,gun:W.gunId||'pistola'})}
const HERO3=()=>typeof EROE!=='undefined'&&!!EROE.arciere&&HSTYLE.hid==='arciere';
// le buche sono [x, y, zona, tipo, quando]: da una zona chiusa (W.zoneOpen) non esce nessuno; tipo 'mais' (escono camminando dal granturco) e
// 'porta' (la latrina) non salgono da terra; quando() avvisa il prop (la porta che si spalanca). o (la partita a ondate): {kind, hp e spd
// (moltiplicano quelli del tipo), q (conta per il round)}; restituisce lo zombie o null se la buca scelta era occupata
// (anteprima 48, punto 17) la buca giusta: tra quelle delle zone aperte e libere, quelle da cui si arriva davvero all'eroe a piedi (il campo di
// navigazione intorno alla buca: niente buche dietro ostacoli invalicabili, in stanze chiuse o oltre una barriera mai aperta; con l'eroe di
// sopra conta la strada fino al piede della scala) e a una distanza a piedi tra 130 e 700 px; di queste una a caso tra le sei più vicine, mai la
// stessa due volte di fila. Senza griglia, o se non ce n'è nessuna, come prima: in linea d'aria tra 110 e 460 px
function holeDist(p){const N=NAV;if(!N)return null;const cw=N.cw,ch=N.ch,D=N.dist,i0=Math.floor(p[0]/NC),j0=Math.floor(p[1]/NC);
  // (difetti 48) la distanza della casella libera più vicina alla buca (non la più piccola dei dintorni: dall'altra parte di una barriera chiusa
  // c'era una casella raggiungibile e la buca sembrava buona, ma lo zombie nasceva chiuso di là)
  for(let r=0;r<=5;r++){let best=1e9,bd=1e9;for(let j=j0-r;j<=j0+r;j++)for(let i=i0-r;i<=i0+r;i++){if(Math.max(Math.abs(i-i0),Math.abs(j-j0))!==r||i<0||j<0||i>=cw||j>=ch)continue;const c=j*cw+i;if(N.bl[c])continue;
      const e=Math.hypot((i+.5)*NC-p[0],(j+.5)*NC-p[1]);if(e<bd){bd=e;best=D[c]}}if(bd<1e9)return best}return 1e9}
// (Denis, 14 ottobre: «se una zona non l'ho ancora sbloccata vorrei che i zombie non spawnassero da lì, solo in zone dove ho il via libera»)
// una buca va bene solo se è in una zona aperta, anche dove sta davvero (W.zoneIdAt), e lontana dalle barriere e dal cancello ancora chiusi:
// chi esce lì accanto sembrava venire dalla zona chiusa
function shutNear(x,y,r){const G=W.gate;if(G&&!G.open&&Math.hypot(x-G.x,y-G.y)<r)return true;for(const L of W.lures||[])if(!L.isOpen()&&Math.hypot(x-L.x,y-L.y)<r)return true;return false}
const zoneOk=(x,y,tag)=>(tag==null||W.zoneOpen[tag])&&(!W.zoneIdAt||W.zoneOpen[W.zoneIdAt(x,y)]!==false);
/* (FASE 9, Denis, 20 ottobre: «non far spawnare i zombie […] troppo lontani a noi») una buca sullo schermo (0) o fuori (1); prima del primo
   disegno (ORD.HW) tutte fuori */
function holeScr(p){if(!ORD.HW)return 1;const q=S(p[0],p[1],0);return Math.abs(q[0]-CAM.x)<ORD.HW-24&&Math.abs(q[1]-CAM.y+CAM.oy)<ORD.HH-24?0:1}
function pickHole(o){const h=W.hero,open=holes.filter(p=>zoneOk(p[0],p[1],p[2])&&!shutNear(p[0],p[1],110)&&!W.Z.some(z=>Math.hypot(z.x-p[0],z.y-p[1])<30));
  if(NAV){const c=[];for(const p of open){if(Math.hypot(p[0]-h.x,p[1]-h.y)<110)continue;const d=holeDist(p);if(d==null||d>=1e9||d<130)continue;c.push([d,p,holeScr(p)])}
    if(!c.length)return null;
    // le buche vicine per strada (entro 420 punti: lo schermo del telefono è alto, «fuori dallo schermo» in su o in giù vorrebbe dire lontano),
    // tra queste prima quelle fuori dallo schermo (non si vedono nascere a metà schermo); se ce n'è meno di due, le tre più vicine per strada (entro 700, come prima, se ci sono).
    // Mai la stessa di prima; tutte raggiungibili (difetti 48: mai una buca a caso che magari sta dietro una barriera chiusa)
    c.sort((a,b)=>a[0]-b[0]);let k=c.filter(a=>a[0]<=420);if(k.length<2){k=c.filter(a=>a[0]<=700).slice(0,3);if(!k.length)k=c.slice(0,3)}else{const off=k.filter(a=>a[2]>0);if(off.length)k=off}
    k=k.slice(0,6);if(k.length>1)k=k.filter(a=>a[1]!==W.lastHole);const p=k[Math.floor(Math.random()*k.length)][1];W.lastHole=p;return p}
  const c=open.filter(p=>{const e=Math.hypot(p[0]-h.x,p[1]-h.y);return e>110&&e<460});return c.length?c[Math.floor(Math.random()*c.length)]:null}
// (difetti 48) uno zombie della partita che non si avvicina più all'eroe (chiuso di là da una barriera, incastrato) e non si vede sullo schermo
// rinasce da una buca raggiungibile, come in CoD; se nessuna buca va bene riprova dopo
function riposiziona(z){const p=pickHole();if(!p){z.bT=6;return false}const out=p[3]==='mais'||p[3]==='porta'||p[3]==='fuori'||p[3]==='carro';if(p[4])p[4]();
  Object.assign(z,{x:p[0],y:p[1],rise:out?1:0,sp:p[3]||null,fin:p[3]==='fuori'||p[3]==='carro'?.9:0,tg:null,vx:null,vy:null,bx:null,bD:null,bT:0,chk:0,cx0:null,det:0,face:Math.atan2(W.hero.y-p[1],W.hero.x-p[0])});W.relocs=(W.relocs||0)+1;return true}
// (Denis, 14 ottobre: «rendi i zombie più rapidi nell'attaccare») quanto dura un attacco, in secondi (prima 1,4 per tutti: arrivavano e
// caricavano quasi 0,8 s prima di colpire); il colpo arriva a metà, nell'affondo del gesto (ATKH: la mossa va indietro fino a .35, affonda
// fino a .6). Il danno di ogni colpo è un po' più basso (partita.js PZ.danno): in tutto fanno circa un quinto di male in più
const ATKT={zombie:1,strisciante:1.05,minatore:1.1,lanterna:1.1,hound:.8},ATKH=.5;
function bloccato(z,dt){if(!z.q||z.boss||!NAV||z.lv||z.cl||(W.mods&&W.mods.invis>0)){z.bT=0;z.bD=null;return}const Dz=NAV.dist[cellOf(z.x,z.y)];
  if(z.bD==null||Dz<z.bD-24){z.bD=Dz;z.bT=0}else z.bT=(z.bT||0)+dt;if((Dz>=1e9?z.bT>3:z.bT>9&&Dz>160)&&farV(z.x,z.y,60))riposiziona(z)}/* (mai chi è già vicino all'eroe, in mezzo alla calca) */
// la comparsa secondo il posto (p[3]): dalla fossa e dalla terra esce dal suolo (rise); dal granturco, dalla porta della latrina e dal buio oltre
// il bordo cammina fuori ('fuori' sfumando); da sotto i carri e la carrozza bruciata striscia fuori sfumando in una nuvola di polvere e cenere;
// dal fiume esce dall'acqua con i cerchi (sp 'acqua'); dalla botola della cantina sale dal buco nero (sp 'botola')
function spawn(o){o=o||{};const h=W.hero,p=o.hole||pickHole();if(!p||(!o.hole&&!zoneOk(p[0],p[1],p[2])))return null;// (una buca data apposta: le prove)
  const k=o.kind?KINDS.find(q=>q[0]===o.kind)||KINDS[0]:KINDS[Math.floor(Math.random()*KINDS.length)];
  const out=p[3]==='mais'||p[3]==='porta'||p[3]==='fuori'||p[3]==='carro';if(p[4])p[4]();
  const z={id:++ZID,kind:k[0],sc:k[1],spd:k[2]*(o.spd||1),hp:k[3]*(o.hp||1),x:p[0],y:p[1],face:Math.atan2(h.y-p[1],h.x-p[0]),p:Math.random(),anim:'walk',rise:out?1:0,die:0,flash:0,sp:p[3]||null};z.spd0=z.spd;z.hp0=z.hp;if(o.q)z.q=1;if(p[3]==='fuori'||p[3]==='carro')z.fin=.9;
  if(p[3]==='carro'&&!LOWFX)for(let i=0;i<6;i++)W.puffs.push({x:p[0]+rr(-12,12),y:p[1]+rr(-8,8),z:rr(2,10),t:rr(1.2,2),r:rr(4,7)});
  W.Z.push(z);return z}
// gli zombie fermi in una zona chiusa (la fattoria prima del cancello): girano piano intorno a casa loro; da fermi girano di colpo la testa
// verso l'eroe quando si avvicina; se l'eroe va al cancello vengono alle sbarre e allungano le braccia. Quando la zona si apre partono
function idleZombie(kind,x,y,zone){const k=KINDS.find(k=>k[0]===kind)||KINDS[0],z={id:++ZID,kind:k[0],sc:k[1],spd:k[2],hp:k[3],x,y,face:rr(0,TAU),p:Math.random(),anim:'idle',rise:1,die:0,flash:0,idle:{zone,home:[x,y],t:rr(0,3),tg:null}};W.Z.push(z);return z}
// (difetti 48) chi attira gli zombie fermi: il cancello della fattoria solo quelli della fattoria (prima tutti, e quelli del borgo e della segheria
// si schiacciavano contro le staccionate per arrivarci); le barriere chiuse (W.lures, area_mappa.js) quelli della zona che sta di là
function lureOf(z){const h=W.hero,G=W.gate,I=z.idle;if(G&&!G.open&&(I.zone==null||I.zone===2)&&Math.hypot(h.x-G.x,h.y-G.y)<G.lure)return G;
  for(const L of W.lures||[])if(L.zone===I.zone&&!L.isOpen()&&Math.hypot(h.x-L.x,h.y-L.y)<L.lure)return L;return null}
// il campo di distanze verso una barriera chiusa, dalla parte della zona chiusa (L.gx, L.gy): come navField ma una volta sola per griglia (la zona
// chiusa non cambia finché la barriera non si compra), senza passare dalle finestre; serve agli zombie fermi attirati alle assi per girare
// intorno a carri e cataste
function lureField(L){const N=NAV;if(L.F&&L.FN===N)return L.F;const cw=N.cw,ch=N.ch,D=new Float32Array(N.n).fill(1e9),B=N.bl,BR=N.bar,BS=N.bs,hk=N.hk,hv=N.hv;let hs=0;
  const push=(k,v)=>{let i=hs++;while(i>0){const p=(i-1)>>1;if(hk[p]<=k)break;hk[i]=hk[p];hv[i]=hv[p];i=p}hk[i]=k;hv[i]=v};
  const pop=()=>{const v=hv[0],lk=hk[--hs],lv=hv[hs];let i=0;for(;;){let c=2*i+1;if(c>=hs)break;if(c+1<hs&&hk[c+1]<hk[c])c++;if(hk[c]>=lk)break;hk[i]=hk[c];hv[i]=hv[c];i=c}hk[i]=lk;hv[i]=lv;return v};
  const gi=Math.floor(L.gx/NC),gj=Math.floor(L.gy/NC);for(let j=gj-3;j<=gj+3;j++)for(let i=gi-3;i<=gi+3;i++){if(i<0||j<0||i>=cw||j>=ch)continue;const c=j*cw+i;if(B[c])continue;const d=Math.hypot((i+.5)*NC-L.gx,(j+.5)*NC-L.gy);if(d<D[c]){D[c]=d;push(d,c)}}
  while(hs){const k0=hk[0],c=pop();if(k0>D[c])continue;const i=c%cw,j=(c-i)/cw;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(B[nc])continue;if(di&&dj&&(B[j*cw+ni]||B[nj*cw+i]))continue;
      if(BR[nc]&&BR[nc]===BR[c]&&BS[nc]!==BS[c])continue;const nd=k0+(di&&dj?1.4142*NC:NC);if(nd<D[nc]){D[nc]=nd;push(nd,nc)}}}
  L.F=D;L.FN=N;return D}
// il punto verso cui camminare scendendo il campo F (come steer: la casella più lontana che si vede lungo la discesa)
function fieldStep(z,F){const N=NAV,cw=N.cw,ch=N.ch;let cur=cellOf(z.x,z.y),tgt=null;if(N.bl[cur]||F[cur]>=1e9)return null;
  for(let k=0;k<16;k++){const i=cur%cw,j=(cur-i)/cw;let nb=-1,nv=F[cur];for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=cw||nj>=ch)continue;const nc=nj*cw+ni;if(N.bl[nc])continue;if(di&&dj&&(N.bl[j*cw+ni]||N.bl[nj*cw+i]))continue;if(F[nc]<nv){nv=F[nc];nb=nc}}
    if(nb<0)break;cur=nb;const p=cen(cur);if(losClear(z.x,z.y,p[0],p[1]))tgt=p;else{if(!tgt)tgt=p;break}}return tgt}
function idleStep(z,dt){const I=z.idle,h=W.hero,G=W.gate,dh=Math.hypot(h.x-z.x,h.y-z.y);I.t-=dt;let tg=null;
  const L=lureOf(z);if(L){if(!I.slot||I.lu!==L){I.slot=L.slots[z.id%L.slots.length];I.lu=L}tg=I.slot;
    if(L.gx!=null&&NAV&&Math.hypot(I.slot[0]-z.x,I.slot[1]-z.y)>46&&!physClear(z.x,z.y,I.slot[0],I.slot[1],ZR-1)){if(!(I.fT>0)){I.fT=.15;I.fp=fieldStep(z,lureField(L))}else I.fT-=dt;if(I.fp)tg=I.fp}}
  else{I.slot=null;if(I.t<=0){I.t=rr(2.5,6);I.tg=Math.random()<.4?null:[I.home[0]+rr(-60,60),I.home[1]+rr(-40,40)]}tg=I.tg}
  const step=(an,per)=>{if(z.anim!==an){z.anim=an;z.p=Math.random()}z.p=(z.p+dt/per)%1};
  if(tg&&Math.hypot(tg[0]-z.x,tg[1]-z.y)>6){const dx=tg[0]-z.x,dy=tg[1]-z.y,d=Math.hypot(dx,dy),sp=z.spd*(I.slot?.8:.35);let ux=dx/d,uy=dy/d;
    // (difetti 48) contro un ostacolo (una lapide, un carro) un passo di lato per mezzo secondo, come zWalk: prima restava fermo lì
    if(I.det>0){I.det-=dt;ux=I.dvx;uy=I.dvy}move(z,ux*sp*dt,uy*sp*dt,ZR);z.face=Math.atan2(uy,ux);step('walk',I.slot?1.2:1.8);
    I.ck=(I.ck||0)+dt;if(I.ck>.8){if(I.cx!=null&&Math.hypot(z.x-I.cx,z.y-I.cy)<sp*.8*.25&&!(I.det>0)){const sd=z.id%2?-1:1;I.dvx=-dy/d*sd;I.dvy=dx/d*sd;I.det=.6}I.ck=0;I.cx=z.x;I.cy=z.y}}
  else if(I.slot){z.face=Math.atan2(h.y-z.y,h.x-z.x);step('attack',1.6)}// alle sbarre
  else{if(dh<300&&!I.look){I.look=1;z.face=Math.atan2(h.y-z.y,h.x-z.x)}else if(dh>=330)I.look=0;step('idle',2.4)}}
// gli zombie non si sovrappongono
function sep(z){if(z.cl)return;for(const o of W.Z)if(o!==z&&!o.die&&o.rise>=1&&!o.cl&&(o.lv||0)===(z.lv||0)){const ex=z.x-o.x,ey=z.y-o.y,e=Math.hypot(ex,ey);if(e>0&&e<24)move(z,ex/e*(24-e)*.5,ey/e*(24-e)*.5,ZR)}}
// le armi vere (sprite/armi: ARMI.DATI): l'eroe spara da solo allo zombie più vicino che vede quando sta fermo; ogni colpo (un pallino per i
// fucili a pompa, che perdono forza con la distanza) va dritto fino al primo zombie sulla sua linea o al primo muro, passa D.pierce zombie in
// più, il razzo esplode largo D.splash. Uno zombie ucciso dà le monete della partita (W.killCoins, 60)
function equip(id){if(!window.ARMI||!ARMI.DATI[id])return;if(gunState&&ARMI.ferma)ARMI.ferma(gunState);W.gunId=id;gunState=ARMI.nuova(id);if(ARMI.prepara)ARMI.prepara(id);if(gunState.estrai)gunState.estrai();HSTYLE.gun=id;W.toast=[ARMI.DATI[id].n,1.8]}
function hurt(z,n,fx){z.hp-=n;z.flash=.12;if(fx)for(let i=0;i<4;i++)W.FX.push({k:'drop',tw:[z.x,z.y,z.zh||0],x:0,y:-24*RIGK.mzk*z.sc/1.1,vx:rr(-40,40),vy:rr(-60,-10),t:.5});
  if(z.hp<=0&&!z.die){z.die=.001;W.kills=(W.kills||0)+1;const n2=Math.round((z.reward||W.killCoins||60)*((W.mods&&W.mods.cash)||1));W.coins+=n2;W.FX.push({k:'coin',tw:[z.x,z.y,(z.zh||0)+44*z.sc],n:n2,t:1.1,t0:1.1});if(W.director&&W.director.killed)W.director.killed(z)}}
function fireShot(ev){const h=W.hero,g=gunState,D=g.D,B=basis(heroDir()*Math.PI/4),zk=RIGK.hzk,pp=window.ARMI&&ARMI.inManoPunti&&ARMI.inManoPunti(W.gunId,B,g.pose(),scrAng(h.aim)),m=pp&&pp.muzzle,
    hw=[h.x,h.y,h.zh||0],ao=HERO3()&&W.muzzle?W.muzzle.slice():m?[m[0]*B.f*zk,(m[1]-8)*zk]:[Math.cos(h.aim)*16,-14+Math.sin(h.aim)*16],ty=-24*RIGK.mzk;
  // le armi speciali (armi_speciali.js: lanciafiamme, fucile a vapore, Risonatore) fanno il colpo a modo loro
  if(W.shotHook&&W.shotHook(ev,g,D,{hw,ao,ty}))return;
  const MD=W.mods||{};// (MD.pierce, MD.kb: l'elisir Doppio Impatto; g.pap: l'arma forgiata, macchine.js W.papHit)
  for(const da of ev.ang){const a=h.aim+da,dx=Math.cos(a),dy=Math.sin(a);let end=D.range,left=(D.pierce||0)+1+(MD.pierce||0);
    for(let s=12;s<D.range;s+=5){const s0=hit(h.x+dx*s,h.y+dy*s,1.5);if(s0&&s0.bar){if(s0.bar.shot)s0.bar.shot();continue}if(s0&&s0.tag!=='hole'){end=s;break}}// il primo muro sulla linea (le finestre e i varchi si passano)
    const L=[];for(const z of W.Z){if(z.die||z.rise<1||!sameLv(z))continue;const rx=z.x-h.x,ry=z.y-h.y,al=rx*dx+ry*dy;if(al<0||al>end)continue;if(Math.abs(rx*dy-ry*dx)<11*z.sc)L.push([al,z])}L.sort((p,q)=>p[0]-q[0]);
    for(const[al,z] of L){const cr=MD.crit>0&&Math.random()<MD.crit,dm=D.dmg*(D.pel>1?cl(1.25-al/D.range,.35,1):1)*(MD.dmg||1)*(cr?2:1);hurt(z,dm,true);if(MD.kb&&!z.ai&&!z.die&&!z.bx)move(z,dx*MD.kb,dy*MD.kb,ZR);if(g.pap&&W.papHit)W.papHit(z,g,dm);if(cr&&W.onCrit)W.onCrit(z);if(!ev.paid&&W.director&&W.director.shotHit){ev.paid=1;W.director.shotHit()}if(--left<=0){end=al;break}}
    if(D.splash){const ex=h.x+dx*end,ey=h.y+dy*end;for(const z of W.Z)if(!z.die&&z.rise>=1&&sameLv(z)&&Math.hypot(z.x-ex,z.y-ey)<D.splash+8)hurt(z,D.dmg*.6,false);W.FX.push({k:'boom',tw:[ex,ey,h.lvz||0],t:.45,t0:.45,r:D.splash});
      if(ARMI.suono){const q=S(ex,ey,0),hq=S(h.x,h.y,0);ARMI.suono(W.gunId,'esplosione',180+(q[0]-hq[0]),.04)}}
    W.FX.push({k:'shot',hw,ao,tw:[h.x+dx*end,h.y+dy*end,h.lvz||0],bo:[0,ty],t:D.pel>1?.06:.08,w:(D.pel>1?1.2:2)+(g.pap?.8:0),pap:g.pap||0})}}
// le cose da comprare (cancello, armi a muro, Bara): {id, x, y, r, show(), label(), price(), act()}; la pagina mostra il bottone da tenere
// premuto quando l'eroe è vicino (il più vicino dei compratori entro r)
const buys=[];function buyable(o){buys.push(o);return o}
// la Bara delle Sorprese (ARMI.nuovaBara) in un punto del mondo, ferma come gli altri oggetti 3D (Denis, 12 ottobre: «che non ruoti ma che
// rimanga ferma come il resto degli oggetti 3d»): si disegna con la telecamera della mappa (ARMI.vistaBara: la proiezione S con la piega
// rigida del suo punto, come una cassa) e nell'ordine è una cosa con la sua impronta (voce 'T', sid 'X': il bordo della buca, le candele, il
// coperchio aperto) e l'altezza della sua posa. Ogni posto dice dove guarda la testa (a, radianti; catena e teschio stanno sul fianco a +90°).
// Si paga col bottone, si prende l'arma che offre col bottone; quando scappa ricompare in uno dei suoi posti di una zona aperta: [x, y, zona, a]
let BOX=null;
function sorpresa(x,y,spots,a){if(!window.ARMI||!ARMI.nuovaBara||!ARMI.formaBara)return null;const b=ARMI.nuovaBara(0,0);spots=spots||[[x,y,null,a]];const s0=spots.find(q=>q[0]===x&&q[1]===y);
  BOX={b,spots,F:ARMI.formaBara(),E:{kind:'T',box:1,sid:'X',sk:880000,prop:{name:'bara',lk:1,ref:null},sb:[0,0,0,0],lean:0},sol:solid(x,y,1,1)};BOX.sol.noAO=true;ORD.byId.set('X',BOX.E);
  boxPlace(x,y,a!=null?a:s0&&s0[3]||0);
  buyable({id:'bara',r:64,get x(){return BOX.x},get y(){return BOX.y},show:()=>BOX.b.st==='ferma'||BOX.b.st==='offre',
    label:()=>BOX.b.st==='offre'?'Prendi: '+ARMI.DATI[BOX.b.gun].n:'Bara delle Sorprese',price:()=>BOX.b.st==='offre'?0:ARMI.BARA.prezzo,
    act(){const b=BOX.b;if(b.st==='offre'){b.prendi();return true}if(W.coins<ARMI.BARA.prezzo)return false;W.coins-=ARMI.BARA.prezzo;const h=W.hero,q=S(h.x,h.y,30);b.paga(q[0],q[1],W.gunId);return true}});return BOX}
// una partita nuova: la Bara chiusa (nuova, con le sue prime due aperture sicure) al suo primo posto
function boxReset(){if(!BOX)return;BOX.b=ARMI.nuovaBara(0,0);const s=BOX.spots[0];boxPlace(s[0],s[1],s[3]||0)}
// mette la Bara in (x, y) con la testa verso a: il solido (il riquadro del contorno girato) e l'impronta per l'ordine
function boxPlace(x,y,a){const F=BOX.F,k=F.BS,c=Math.cos(a),s=Math.sin(a),w=(u,v)=>[x+k*(u*c-v*s),y+k*(u*s+v*c)];BOX.x=x;BOX.y=y;BOX.a=a;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of F.BH){const q=w(p[0],p[1]);if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}
  Object.assign(BOX.sol,{x:x0,y:y0,w:x1-x0,d:y1-y0});SGV++;
  const P=[];for(const p of F.BH)P.push(w(p[0]*1.12,p[1]*1.12));for(const q of F.cand)for(const[dx,dy] of DIR8)P.push(w(q[0]+dx*1.4,q[1]+dy*1.4));for(const q of F.lid)P.push(w(q[0],q[1]));
  const E=BOX.E;finFP(E,P.map(q=>[q[0],q[1],0]));E.x=x;E.y=y;E.prop.ref=houseRefAt(x,y)||[x,y];E.zs=undefined;E.H=null}
// (difetti 48) dentro un edificio la Bara si piega con lui (il ref del primo pezzo della casa), così non scivola sul pavimento girando la visuale
function houseRefAt(x,y){for(const hs of houses)if(x>hs.x&&x<hs.x+hs.w&&y>hs.y&&y<hs.y+hs.d){const p=props.find(q=>q.house===hs&&q.ref);if(p)return p.ref}return null}
function boxUpdate(dt){if(!BOX)return;const b=BOX.b;for(const e of b.update(dt)){if(e.k==='suono'){if(ARMI.suonoBara)ARMI.suonoBara(e.w,180)}else if(e.k==='presa')equip(e.id);else if(e.k==='rimborso'){W.coins+=e.n;W.toast=['La Bara scappa: monete restituite',2.4]}
    else if(e.k==='via'){const c=BOX.spots.filter(s=>(s[2]==null||W.zoneOpen[s[2]])&&Math.hypot(s[0]-BOX.x,s[1]-BOX.y)>40),s=c.length?c[Math.floor(Math.random()*c.length)]:[BOX.x,BOX.y,null,BOX.a];boxPlace(s[0],s[1],s[3]||0);navBuild();if(NAV)NAV.hc=-1;if(b.addio)W.toast=['La Bara se ne va…',2.4]}
    // ricomparsa: dove è andata (il nome della zona) e un fascio di luce verde che si vede da lontano per qualche secondo
    else if(e.k==='qui'){const n=W.zoneAt?W.zoneAt(BOX.x,BOX.y):'';W.toast=['La Bara è ricomparsa'+(n?': '+n:''),3];W.FX.push({k:'faro',tw:[BOX.x,BOX.y,0],t:6,t0:6})}}}
// la voce della Bara in questo fotogramma: l'altezza della posa (chiusa 18 px, col coperchio aperto fino a 40, con la mano e l'arma 50, sotto
// terra quasi niente), il riquadro a schermo e la piega come uno strato, l'impronta girata di ψ
function boxEntry(){const E=BOX.E,F=BOX.F,a=BOX.b.posa();E.z0=0;E.z1=(a.sink||0)>=1?3:a.hand>0?50:F.BS*(F.HB+F.HL+2)+22*(a.lid||0)/F.LIDA;E.cst=-1;layerSB(E);rotate(E,PC,PSN);return E}
// la Bara con la telecamera della mappa: un punto (u, v, z) della bara (in unità della bara, dal punto ai suoi piedi) passa nel mondo e da lì
// sullo schermo con S; l'ombra cade a est e un po' a sud come quelle cotte nel terreno
function drawBox(){const F=BOX.F,k=F.BS,c=Math.cos(BOX.a),s=Math.sin(BOX.a),X=BOX.x,Y=BOX.y;LEANK=BOX.E.prop.lk;setRef(BOX.E.prop.ref);
  try{const o=S(X,Y,0),pj=(u,v,z)=>{const q=S(X+k*(u*c-v*s),Y+k*(u*s+v*c),k*z);return[(q[0]-o[0])/k,(q[1]-o[1])/k]},dx=6/k,dy=1.8/k;
    BOX.b.x=o[0];BOX.b.y=o[1];BOX.b.draw(ARMI.vistaBara(pj,[dx*c+dy*s,-dx*s+dy*c]))}finally{LEANK=1;setRef(null)}}
// per le prove (verita.js): le facce vere della Bara nella posa di adesso, nel mondo (sotto terra schiacciate a terra), con i punti in giro
// come le facce del motore (la normale di Newell al contrario di quella verso fuori)
function boxPrims(){const F=BOX.F,k=F.BS,c=Math.cos(BOX.a),s=Math.sin(BOX.a),X=BOX.x,Y=BOX.y,a=BOX.b.posa(),out=[];if((a.sink||0)>=1)return out;const dz=-(a.sink||0)*17,
    w=q=>[X+k*(q[0]*c-q[1]*s),Y+k*(q[0]*s+q[1]*c),k*Math.max(0,q[2]+dz)],G=ARMI.facceBara(a);
  for(const f of G.faces){let P=f.pts,nx=0,ny=0,nz=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];nx+=(p[1]-q[1])*(p[2]+q[2]);ny+=(p[2]-q[2])*(p[0]+q[0]);nz+=(p[0]-q[0])*(p[1]+q[1])}
    if(nx*f.n[0]+ny*f.n[1]+nz*f.n[2]>0)P=P.slice().reverse();out.push({t:'face',pts:P.map(w),al:1})}
  for(const l of G.lines)out.push({t:'line',p0:w([l[0],l[1],l[2]]),p1:w([l[0],l[1],l[3]]),w:l[4]*k,al:1});
  for(const q of G.pts)out.push({t:'pts',pts:[w(q)],rad:q[3]*k,al:1});
  return out}
// W.mods (fortuna.js, il gioco): cose che la partita cambia per un po' o per tutta la partita: spd la corsa dell'eroe, dmg il danno, crit la
// probabilità di un colpo doppio, cash le monete degli zombie, invis gli zombie che non lo vedono
function updateBeings(dt,inp){const h=W.hero,DI=W.director,MD=W.mods||{};if(h.dead||h.cl)inp={x:0,y:0};LV=h.lv||0;const m=Math.hypot(inp.x,inp.y);h.moving=m>.15;if(h.moving){const sp=150*Math.min(1,m)*(MD.spd||1);move(h,inp.x/m*sp*dt,inp.y/m*sp*dt,10);h.face=Math.atan2(inp.y,inp.x);h.walk+=dt*12}
  if(h.cl){climbStep(h,dt);LV=h.lv||0;h.moving=true;h.walk+=dt*12}else h.zh=h.lv?h.lvH:(h.zh||0)+(heightAt(h.x,h.y)-(h.zh||0))*Math.min(1,dt*14);h.lvz=h.cl?h.zh:h.lv?h.lvH:0;
  const noShoot=!!W.dbg.noShoot||!!h.dead||!!h.busy||!!h.unarmed||!!h.cl;// (mentre ripara una finestra non spara; senz'arma: la sua è sull'incudine della Forgia)
  // il bersaglio: lo zombie più vicino entro 230 px che l'eroe vede davvero (i colpi non passano attraverso muri, recinti, lapidi, casse…);
  // la linea si controlla sui solidi veri, ignorando quello in cui sta lo zombie (la fossa da cui esce); ricontrollata ogni 0,1 s
  const g=gunState,RG=g?Math.min(g.D.range,260):230;
  h.tgT=(h.tgT||0)-dt;let tgt=h.tgZ&&W.Z.includes(h.tgZ)&&!h.tgZ.die&&!h.tgZ.idle&&h.tgZ.rise>=1&&sameLv(h.tgZ)&&Math.hypot(h.tgZ.x-h.x,h.tgZ.y-h.y)<RG?h.tgZ:null;
  if(h.tgT<=0||!tgt){h.tgT=.1;tgt=null;const c=W.Z.filter(z=>z.rise>=1&&!z.die&&!z.idle&&sameLv(z)).map(z=>[Math.hypot(z.x-h.x,z.y-h.y),z]).filter(a=>a[0]<RG).sort((a,b)=>a[0]-b[0]);
    for(const[,z] of c)if(physClear(h.x,h.y,z.x,z.y,1.5,hit(z.x,z.y,2),1)){tgt=z;break}h.tgZ=tgt}
  if(tgt){h.aim=Math.atan2(tgt.y-h.y,tgt.x-h.x);if(!h.moving)h.face=h.aim}
  if(h.busy&&!h.moving)h.face=Math.atan2(h.busy.y-h.y,h.busy.x-h.x);// guarda quello che ripara
  // il verso disegnato dell'Arciere 3D (nel mondo): segue in fretta quello vero, senza le 8 direzioni del rig di prima
  {const tf=h.face||0;if(h.f3==null||dt>=.5)h.f3=tf;else h.f3+=Math.atan2(Math.sin(tf-h.f3),Math.cos(tf-h.f3))*Math.min(1,dt*18)}
  // il grilletto: le armi automatiche lo tengono premuto, le altre lo premono di nuovo appena l'arma è pronta
  if(g){const want=!h.moving&&!!tgt&&!noShoot,ev=g.update(g.st==='ricarica'?dt*(MD.relK||1):dt,want&&(g.D.auto||(g.st==='pronta'&&g.cd<=0)));/* (MD.relK: l'elisir Mani Svelte) */for(const e of ev){if(e.k==='sparo'&&!noShoot)fireShot(e);else if(e.k==='suono'&&ARMI.suono)ARMI.suono(W.gunId,e.w,180);else if(e.k==='bossolo'&&W.onCase)W.onCase(e.n||1);else if(e.k==='caricatore'&&W.onMag)W.onMag()}
    // le voci che durano finché l'arma lavora: il motore delle canne della mitragliatrice, il ruggito del lanciafiamme (si spengono da sole)
    if(W.gunId==='mitragliatrice'&&ARMI.motore)ARMI.motore(g,180);else if(W.gunId==='lanciafiamme'&&ARMI.fiamma)ARMI.fiamma(g,180);
    if(tgt||h.moving)h.rlT=0;else if((h.rlT=(h.rlT||0)+dt)>1.2&&g.st==='pronta'&&g.mag<g.D.mag&&g.res>0)g.ricarica();// ricarica da solo quando non c'è niente da colpire
    if(W.gunId==='pistola'){if(g.res<g.D.mag*2)g.res+=g.D.res}// la pistola non resta mai senza colpi
    else if(g.mag<=0&&g.res<=0&&g.st!=='ricarica')equip('pistola')}// finiti i colpi si torna alla pistola
  else if(!h.moving&&tgt&&!noShoot&&(h.fireCd=(h.fireCd||0)-dt)<=0){h.fireCd=.36;hurt(tgt,20,true)}// senza ARMI: un colpo ogni 0,36 s
  boxUpdate(dt);
  // la scia e le gocce sono attaccate a punti del mondo (i piedi dell'eroe e dello zombie colpito, ripresi con S a ogni fotogramma) più uno
  // scarto sullo schermo (la bocca dell'arma, l'altezza del petto, il volo delle gocce): girando la telecamera restano dove sono successe
  if(DI)DI.update(dt,zOn);else{spawnT-=dt;if(zOn&&spawnT<=0&&W.Z.filter(z=>!z.idle&&!z.die).length<(W.maxZ||5)){spawn();spawnT=rr(2,3.5)}}navUpdate(dt);
  for(const z of W.Z){if(z.flash>0)z.flash-=dt;if(z.fin>0)z.fin-=dt;if(z.die){z.die+=dt;continue}LV=z.lv||0;if(!z.cl)z.zh=z.lv?z.lvH:(z.zh||0)+(heightAt(z.x,z.y)-(z.zh||0))*Math.min(1,dt*14);if(z.rise<1){z.rise=Math.min(1,z.rise+dt/1.3);z.face=Math.atan2(h.y-z.y,h.x-z.x);continue}
    if(z.idle){if(W.zoneOpen[z.idle.zone])z.idle=null;else{if(!ORD.HW||nearScr(z.x,z.y,260)||lureOf(z)){idleStep(z,dt);sep(z)}continue}}// lontani dallo schermo restano fermi, se non li chiama una barriera (FASE 9)
    if(z.ai){z.ai(z,dt);sep(z);continue}// un boss della partita: si muove e colpisce da solo
    if(z.stun>0){z.stun-=dt;if(z.anim!=='idle'){z.anim='idle';z.p=0}z.p=(z.p+dt/2.4)%1;sep(z);continue}// respinto dall'anima che rialza l'eroe
    if(!z.bx&&BARS.length&&!z.lv&&!z.cl&&(z.bxT=(z.bxT||0)-dt)<=0){z.bxT=.15;z.bx=barCheck(z)}// una finestra o un varco da passare (barriere.js)
    if(z.bx){barStep(z,dt);z.bT=0;if(!(z.bx&&z.bx.from))sep(z);continue}
    const dx=h.x-z.x,dy=h.y-z.y,d=Math.hypot(dx,dy);
    if(d<30&&!z.cl&&!h.cl&&sameLv(z)&&physClear(z.x,z.y,h.x,h.y,2,null,2)){z.face=Math.atan2(dy,dx);if(z.anim!=='attack'){z.anim='attack';z.p=0}const p0=z.p;z.p+=dt/(ATKT[z.kind]||ATKT.zombie);if(DI&&DI.zombieHit&&p0<ATKH&&z.p>=ATKH)DI.zombieHit(z,d);z.chk=0;z.cx0=null}// il colpo arriva a metà del gesto
    else{if(z.anim!=='walk'){z.anim='walk';z.p=0}z.p+=dt/(z.kind==='hound'?.6:1.1);zWalk(z,dt);bloccato(z,dt)}
    sep(z);z.p%=1}
  LV=h.lv||0;for(let i=W.Z.length-1;i>=0;i--)if(W.Z[i].die>1.1||(!zOn&&W.Z[i].rise<1))W.Z.splice(i,1);
  for(const f of W.FX){f.t-=dt;if(f.k==='drop'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt}}for(let i=W.FX.length-1;i>=0;i--)if(W.FX[i].t<=0)W.FX.splice(i,1);
  for(const hs of houses){const{x,y,w,d}=hs,pc=hs.porch;hs.inside=(h.x>x&&h.x<x+w&&h.y>y&&h.y<y+d+4)||(pc&&h.x>pc[0]&&h.x<pc[2]&&h.y>pc[1]&&h.y<pc[3]);hs.a+=((hs.inside?0:1)-hs.a)*Math.min(1,dt*7);
    if(hs.upF){const C=h.cl,S=C?C.S:h.st,mine=!!S&&S.hs===hs;let u=0;if(mine){if(C){const f=cl(((C.dir>0?C.t:1-C.t)-.35)/.5,0,1);u=f*f*(3-2*f)}else u=h.lv?1:0}hs.up=C&&mine?u:(hs.up||0)+(u-(hs.up||0))*Math.min(1,dt*8)}
    // (anteprima 48) dietro l'edificio: se l'eroe sta nella striscia che il tetto copre sullo schermo (oltre il lato lontano, fino all'altezza del
    // tetto per l'inclinazione), tetto e muro davanti si fanno trasparenti (hs.b), come le chiome: con gli edifici a due piani gli zombie lì dietro si vedono
    let u0=1e9,u1=-1e9,v0=1e9;for(const[cx,cy] of[[x,y],[x+w,y],[x+w,y+d],[x,y+d]]){const dx=cx-h.x,dy=cy-h.y,U=dx*CAM.c-dy*CAM.s,V=dx*CAM.s+dy*CAM.c;if(U<u0)u0=U;if(U>u1)u1=U;if(V<v0)v0=V}
    const Z=(hs.H||74)+(hs.rh==null?56:hs.rh),bh=!hs.inside&&u0-14<0&&u1+14>0&&v0>-2&&v0<Z*CAM.CP/CAM.SP+20;hs.b=(hs.b==null?1:hs.b)+((bh?.32:1)-(hs.b==null?1:hs.b))*Math.min(1,dt*6)}
  for(const f of fades){const dx=h.x-f.x,dy=h.y-f.ky,U=dx*CAM.c-dy*CAM.s,V=dx*CAM.s+dy*CAM.c,reach=f.reach*CAM.CP/CAM.SP,b=V<0&&V>-reach&&Math.abs(U)<f.rx;f.a+=((b?.35:1)-f.a)*Math.min(1,dt*6)}}
// gli zombie (CR.*) hanno il loro scheletro 3D: basta girarli di ψ (face+ψ) e passare l'inclinazione con camRig. La terra smossa e i sassi
// stanno a terra intorno ai piedi: hanno le misure di prima (la barra di terra larga 18+8k × 8+3k, i sassi su un'ellisse r × r/2), ma sono
// un'ellisse del mondo disegnata nelle coordinate del terreno, così girando restano appoggiati a terra (a vista dritta è il disegno di prima,
// identico al pixel). Il salto dei sassi è un'altezza (CP); la discesa nella buca segue la misura della figura (mzk); il ritaglio è il
// rettangolo sopra la linea dei piedi, come prima. (Un mucchio allungato come la fossa, che la riempie, è una proposta da mostrare a Denis)
const MOUND=k=>[18+8*k,8+3*k];// i raggi del mucchio a terra (x, y del mondo) mentre lo zombie esce (k = rise)
// (difetti 48: «va a scatti, di più quando ci sono tanti zombie») gli zombie da un'immagine pronta: ognuno tiene la sua figura (z.spr, una tela
// piccola alla risoluzione dello schermo) e la ridisegna a turno, al massimo ZBUD figure nuove per fotogramma: con pochi zombie tutte a ogni
// fotogramma come prima, con tanti ognuna ogni 2 o 3 fotogrammi; subito se cambia la mossa, la direzione (più di 5°), l'inclinazione o lo zoom.
// Lo zombie si sposta comunque a ogni fotogramma. ZBOX: il riquadro dipinto di ogni tipo attorno ai piedi (misurato in tutte le mosse, 16
// direzioni e tre inclinazioni, più 4 px) alla sua grandezza; i boss, i tipi senza riquadro e le tele diverse da quella della mappa dal vivo
const ZBOX={zombie:[-34,-61,34,14,1.1],strisciante:[-34,-39,34,26,1.1],minatore:[-46,-63,44,25,1.1],lanterna:[-78,-87,78,52,1.55],hound:[-34,-60,34,14,1.05]},ZS={f:0,n:0,need:1,cv:null,bud:6};
function zDraw(z,x,y,fc,an,ph,sc){const B=ZBOX[z.kind],m=ctx.getTransform();
  if(!B||z.boss||W.dbg.zLive||ctx.canvas!==ZS.cv||Math.abs(m.b)>1e-6||Math.abs(m.c)>1e-6||m.a<=0){CR[z.kind](x,y,fc,an,ph,sc);return}
  const k=m.a,s=sc/B[4],x0=B[0]*s,y0=B[1]*s,pw=Math.ceil((B[2]-B[0])*s*k),pH=Math.ceil((B[3]-B[1])*s*k),cam=CR.cam?CR.cam.k*1e4+CR.cam.zk:0;ZS.n++;
  let S=z.spr;const fresh=!S||S.k!==k||S.cam!==cam||S.an!==an||S.sc!==sc||Math.abs(Math.atan2(Math.sin(fc-S.fc),Math.cos(fc-S.fc)))>.09;
  if(fresh||(S.f!==ZS.f&&(ZS.f+z.id)%ZS.need===0)){if(!S)S=z.spr={cv:document.createElement('canvas')};const C=S.cv;if(C.width!==pw||C.height!==pH){C.width=pw;C.height=pH}
    const g=C.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,pw,pH);g.setTransform(k,0,0,k,-x0*k,-y0*k);const sv=ctx;ctx=g;try{CR[z.kind](0,0,fc,an,ph,sc)}finally{ctx=sv}
    S.k=k;S.cam=cam;S.an=an;S.sc=sc;S.fc=fc;S.f=ZS.f}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(S.cv,Math.round(m.a*(x+x0)+m.e),Math.round(m.d*(y+y0)+m.f));ctx.restore()}
function drawZombie(z){const q=SB(z.x,z.y,z.zh||0),zk=RIGK.mzk,fc=z.face+CAM.yaw;
  if(z.rise<1){const k=z.rise,c=CAM.c,s=CAM.s,SP=CAM.SP,[mx,my]=MOUND(k),
      G=(ox,oy)=>[q[0]+ox*c-oy*s,q[1]+(ox*s+oy*c)*SP];// un punto del terreno intorno ai piedi, (ox, oy) nel mondo
    if(z.sp==='acqua'){ctx.save();ctx.translate(q[0],q[1]);ctx.transform(c,SP*s,-s,SP*c,0,0);ctx.fillStyle='rgba(8,14,24,.8)';ctx.beginPath();ctx.ellipse(0,0,mx*.9,my*1.3,0,0,TAU);ctx.fill();
      for(let i=0;i<3;i++){const r=(k*1.7+i/3)%1;ctx.strokeStyle=`rgba(150,185,215,${.55*(1-r)})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,0,8+r*28,(8+r*28)*.62,0,0,TAU);ctx.stroke()}ctx.restore();
      if(k>.3)for(let i=0;i<4;i++){const a=i*1.6+z.x,g=G(Math.cos(a)*9,Math.sin(a)*5),f=((W.t*1.4+i*.27)%1);ctx.fillStyle=`rgba(170,200,225,${.7*(1-f)})`;ball([g[0],g[1]-(1-f)*30*CAM.CP*k],1.4);ctx.fill()}}// (dal fiume: cerchi nell'acqua e gocce)
    else if(z.sp==='botola'){ctx.save();ctx.translate(q[0],q[1]);ctx.transform(c,SP*s,-s,SP*c,0,0);ctx.fillStyle='#060403';ctx.fillRect(-14,-10,28,20);ctx.restore()}// (dalla cantina: il buco nero della botola aperta)
    else{ctx.fillStyle='#4a3a2a';ctx.save();ctx.translate(q[0],q[1]);ctx.transform(c,SP*s,-s,SP*c,0,0);ctx.beginPath();ctx.ellipse(0,0,mx,my,0,0,TAU);ctx.restore();ctx.fill();
    for(let i=0;i<6;i++){const a=i*1.05+z.x,r=10+k*16,g=G(Math.cos(a)*r,Math.sin(a)*r*.5);ctx.fillStyle='#64503a';ball([g[0],g[1]-Math.sin(k*Math.PI)*6*CAM.CP],2.4);ctx.fill()}}
    if(k>.25){const u=ez((k-.25)/.75),ck=Math.max(1,z.sc/1.1);ctx.save();ctx.beginPath();ctx.rect(q[0]-60*ck,q[1]-150*ck,120*ck,150*ck+1);ctx.clip();
      ctx.translate(0,(1-u)*60*z.sc*zk);zDraw(z,q[0],q[1],fc,'idle',(W.t*.6)%1,z.sc);ctx.restore()}return}
  if(z.die){const k=Math.min(1,z.die/1.1),ck=Math.max(1,z.sc/1.1);ctx.save();ctx.globalAlpha=1-k*k;ctx.beginPath();ctx.rect(q[0]-60*ck,q[1]-150*ck,120*ck,150*ck+1);ctx.clip();ctx.translate(0,ez(k)*50*z.sc*zk);zDraw(z,q[0],q[1],fc,'idle',0,z.sc);ctx.restore();return}
  const fin=z.fin>0;if(fin){ctx.save();ctx.globalAlpha*=cl(1-z.fin/.9,0,1)}zDraw(z,q[0],q[1],fc,z.anim,z.p,z.sc);if(fin)ctx.restore();if(z.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,255,255',q[0],q[1]-24*z.sc*zk,22*z.sc,.5);ctx.restore()}}
// le trasparenze della casa: il tetto sfuma quando l'eroe entra, i mobili compaiono; i muri (wN, wS, wE, wW: da che parte guardano) con l'eroe
// dentro diventano trasparenti se sono rivolti verso la telecamera (a vista dritta i muri sud, come prima), piano piano mentre si gira
const WALLN={wN:[0,-1],wS:[0,1],wE:[1,0],wW:[-1,0],uN:[0,-1],uS:[0,1],uE:[1,0],uW:[-1,0]};
// (anteprima 48) negli edifici col piano di sopra (hs.up: 0 di sotto, 1 di sopra): 'slab' il solaio e 'inU' i mobili di sopra si vedono solo di
// sopra; 'in' i mobili di sotto spariscono sotto il solaio; uN… la parte alta dei muri: con l'eroe dentro al pianterreno sparisce come il tetto
const alphaOf=(hs,part)=>{const B=hs.b==null?1:hs.b,U=hs.up||0;if(part==='roof')return Math.min(hs.a,B);if(part==='in')return hs.a>.95||U>.97?0:1;if(part==='slab'||part==='inU')return hs.a>.95?0:U;if(part==='st')return hs.a>.95?0:1;if(part==='front')return .22+.78*hs.a;let n=WALLN[part];if(n&&hs.R)n=tV(hs.R,n[0],n[1]);
  if(n){const a=Math.min(hs.a,B<1?.45+.55*B:1);let v=1;if(a<1){const f=n[0]*CAM.s+n[1]*CAM.c;v=1-(1-a)*.78*cl((f-.1)/.3,0,1)}if(part.charCodeAt(0)===117)v=U*v+(1-U)*Math.min(v,hs.a);return v}return 1};// (B: l'eroe dietro l'edificio)
// l'eroe è disegnato in 8 direzioni: quella sullo schermo (scrAng) con l'isteresi di setFace (poligono/prova.js), così girando la telecamera
// non sfarfalla tra due viste; l'arma prende l'angolo vero sullo schermo
function heroDir(){const h=W.hero,sa=scrAng(h.face),d=Q8(sa),cur=h.dS==null?d:h.dS,df=Math.atan2(Math.sin(sa-cur*Math.PI/4),Math.cos(sa-cur*Math.PI/4));h.dS=Math.abs(df)>Math.PI/8+.12?d:cur;return h.dS}
// (senza aim l'arma segue il corpo: null, non scrAng(undefined) = NaN)
// l'Arciere 3D: girato con la telecamera della mappa come i mostri (verso nel mondo + ψ); cammina, sta fermo, mira e spara con lo stato vero
// dell'arma (rinculo, vampa, carrello, pompa, ricarica), colpito e caduto con gli occhi strizzati; la bocca dell'arma (W.muzzle, dai piedi)
// serve ai colpi. Senza l'eroe 3D, il rig di prima nelle 8 direzioni
function drawHero(){const h=W.hero,q=SB(h.x,h.y,h.zh||0),f=h.fall||0,inv=W.mods&&W.mods.invis>0;if(inv){ctx.save();ctx.globalAlpha*=.32+.12*Math.sin(W.t*6)}if(f>0){ctx.save();ctx.translate(q[0],q[1]-6);ctx.rotate(-f*1.42);ctx.translate(-q[0],-(q[1]-6))}
  if(HERO3()){const DI=W.director,ht=DI&&DI.hurtT!=null?DI.hurtT:9,aimOn=!!h.tgZ&&!h.moving&&!f&&!h.dead;let anim='idle',p=((W.t/2.4)%1+1)%1;
    const job=!f&&!h.dead&&!h.moving&&h.busy&&h.busy.anim?h.busy:null,bare=job||h.unarmed;// un lavoro con le mani (le assi sulla finestra): l'arma va via; senz'arma con la sua sull'incudine
    if(f>0||h.dead){anim='hit';p=.16}else if(ht<.45){anim='hit';p=ht/.45*.5}else if(h.moving){anim='walk';p=(((h.walk||0)/TAU)%1+1)%1}else if(job){anim=job.anim;p=cl(h.busyP||0,0,.999)}else if(aimOn)anim='aim';
    const out={};try{EROE.arciere(q[0],q[1],(h.f3==null?h.face||0:h.f3)+CAM.yaw,anim,p,1,{style:bare?Object.assign({},HSTYLE,{gun:null}):HSTYLE,gp:gunState&&!bare?gunState.pose():null,noFx:true,out,tool:job?job.tool:null})}catch(e){console.error(e)}W.muzzle=out.muzzle||null;W.magP=out.mag||null;W.magF=out.magFloor||null}
  else drawRig(q[0],q[1]-8,heroDir()*Math.PI/4,h.walk,h.moving&&!f,HSTYLE,{gp:gunState?gunState.pose():{},aim:h.aim==null||f?null:scrAng(h.aim)});
  if(f>0)ctx.restore();if(inv)ctx.restore();if(W.director&&W.director.drawOnHero)W.director.drawOnHero(q)}
// una voce della lista: uno strato di prop (L), un prop intero nell'ordine di prima (W, con W.dbg.ord='ky'), un essere (B: eroe, zombie, corvo
// posato, fiamma libera)
function drawEntry(e,h0a){switch(e.kind){case'V':return drawVeil(e.k);case'L':return drawLayer(e);case'T':return drawBox();case'W':return drawWhole(e.prop);case'B':return e.box?drawBox():e.pet?(W.drawPet&&W.drawPet(e.pet)):e.hero?drawHero():e.z?drawZombie(e.z):e.pc?drawPerch(e.pc):e.fl?drawFlame(e.fl,h0a):null}}
function drawWhole(p){LEANK=p.lk==null?1:p.lk;setRef(p.ref);ROTP=p.rot||null;try{drawProp(p,p.house?part=>alphaOf(p.house,part):null)}finally{ROTP=null}LEANK=1;setRef(null)}
// la sagoma dell'eroe dove è coperto (dietro la casa, la cripta, un albero): si ridisegnano in una tela piccola solo le cose disegnate dopo di lui
// che toccano il suo riquadro, e lì sopra si stampa la sua sagoma chiara a metà trasparenza. Costa qualcosa solo quando è davvero coperto.
let SIL=null,LASTOCC=[];
function heroBox(){const h=W.hero,q=SB(h.x,h.y,h.zh||0),w=HERO3()?27:18;return[q[0]-w,q[1]-58*(HERO3()?RIGK.mzk:RIGK.hzk),q[0]+w,q[1]+6]}// (l'Arciere 3D tiene l'arma più in fuori)
// il riquadro vero di un prop (dai punti 3D dei suoi pezzi; o.ob se lo dà chi lo costruisce): [x0,y0,x1,y1,zTop], calcolato una volta
function obOf(p){if(p._ob)return p._ob;if(p.ob)return p._ob=p.ob;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,z1=0,any=false;const add=(q,r)=>{r=r||0;any=true;if(p.rot){const w=tP(p.rot,q[0],q[1]);q=[w[0],w[1],q[2]]}x0=Math.min(x0,q[0]-r);x1=Math.max(x1,q[0]+r);y0=Math.min(y0,q[1]-r);y1=Math.max(y1,q[1]+r);z1=Math.max(z1,(q[2]||0)+r)};
  for(const t of p.parts){if(t.c)t.c.forEach(q=>add(q));else if(t.pts)t.pts.forEach(q=>add(q));else if(t.a){add(t.a,t.w);add(t.b,t.w)}else if(t.p)add(t.p,t.r)}
  return p._ob=any?[x0-3,y0-3,x1+3,y1+3,z1+4]:[p.bx[0],p.bx[1],p.bx[2],p.bx[3],p.bx[4]]}
// chi copre l'eroe: le voci disegnate dopo di lui il cui riquadro a schermo (quello della regola a, con la piega vera) tocca la figura; i muri
// davanti e il tetto già trasparenti (alpha < .6) no
function occluders(order,hi){const out=[];if(hi<0)return out;let[bx0,by0,bx1,by1]=heroBox();bx0+=5;bx1-=5;// il riquadro della figura, un po' più stretto di quello per le misure
  for(let i=hi+1;i<order.length;i++){const e=order[i];if(e.kind!=='L'&&e.kind!=='W'&&e.kind!=='T')continue;const p=e.prop,pt=e.kind==='L'?e.part:e.kind==='W'?p.parts[0]&&p.parts[0].part:null;
    if(p.house&&pt&&alphaOf(p.house,pt)<.6)continue;const b=e.sb;if(b[2]<bx0||b[0]>bx1||b[3]<by0||b[1]>by1)continue;out.push(e)}return out}
// due memorie: l'immagine dell'eroe (chiave del piano, disaccordo 11: dove sta sullo schermo, verso, mira, passo, inclinazione, zoom: girando
// resta ferma) e la sagoma composta con chi lo copre (in più la telecamera e le voci che coprono con la loro trasparenza)
function silhouette(occ,h0a){if(!occ.length||W.dbg.noSil)return;const m=ctx.getTransform(),[bx0,by0,bx1,by1]=heroBox(),X0=Math.floor(m.a*bx0+m.e),Y0=Math.floor(m.d*by0+m.f),X1=Math.ceil(m.a*bx1+m.e),Y1=Math.ceil(m.d*by1+m.f),Q=.5,w=Math.ceil((X1-X0)*Q),hh=Math.ceil((Y1-Y0)*Q);if(w<=0||hh<=0)return;// a metà risoluzione: è un velo morbido
  if(!SIL)SIL={o:document.createElement('canvas'),h:document.createElement('canvas')};for(const c of[SIL.o,SIL.h]){if(c.width<w)c.width=w;if(c.height<hh)c.height=hh}
  const h=W.hero,hq=S(h.x,h.y,h.zh||0),k1=[Math.round((m.a*hq[0]+m.e)*2),Math.round((m.d*hq[1]+m.f)*2),heroDir(),h.aim==null?'n':Math.round(scrAng(h.aim)*20),h.moving?Math.floor(h.walk*3):-1,gunState&&(gunState.st!=='pronta'||gunState.eq<1)?Math.round(W.t*15):'r',Math.round(RIGK.hzk*100),Math.round(m.a*100),X0,Y0,w,hh].join('|'),
    k2=k1+'|'+[Math.round(CAM.x*2),Math.round(CAM.y*2),Math.round(CAM.oy*2),Math.round(CAM.yaw*200),Math.round(CAM.el*200),occ.map(e=>e.sid+':'+(e.kind==='T'?Math.round(BOX.b.T*30):Math.round((e.prop.house?e.prop.house.a:1)*20))).join(',')].join('|');
  if(SIL.k2!==k2){SIL.k2=k2;const sv=ctx;
    try{let g;if(SIL.k1!==k1){SIL.k1=k1;g=SIL.h.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,SIL.h.width,SIL.h.height);g.setTransform(m.a*Q,0,0,m.d*Q,(m.e-X0)*Q,(m.f-Y0)*Q);ctx=g;drawHero();
        g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgb(160,240,228)';g.fillRect(0,0,w,hh);g.globalCompositeOperation='source-over'}
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
// ================================================================== l'ordine di disegno (fase 3 del piano, §1.2–1.5)
// Le voci della lista non sono i prop ma i loro STRATI: la base (i gruppi che toccano terra, o che restano dentro la sua impronta allargata di
// 3 px) e la sporgenza (i gruppi che partono sopra 2 px e sopra un quarto dell'altezza del prop e ne escono di più: lanterna e braccio del
// lampione, cornice e frontone della cripta, tetto e manovella del pozzo, assi del cartello, rami e chioma). Ogni strato ha un'impronta:
// l'inviluppo convesso dei suoi punti nel mondo (facce, linee ± w/2, sfere ± r, i punti dei disegni a mano registrati da una prova a vuoto
// all'avvio, allargati di o.r), calcolato una volta; a ogni cambio di ψ si girano solo i suoi vertici in (U, V) = (x·c − y·s, x·s + y·c). Gli
// esseri (eroe, zombie, corvi posati) sono cartelloni larghi ±hw e alti H. I pavimenti (floor) vengono prima di tutto, ordinati tra loro con le
// stesse regole.
// Le regole a coppie (rel) danno un verso, una forza (2 forte, 1 debole) e un margine in px: a riquadri a schermo che si toccano; b impronte
// separate lungo V; d^ uno sta tutto sopra l'altro (con tolleranza in z); c impronte separate o appena a contatto (≤3 px; una tutta dentro
// l'altra non è un contatto) con una striscia di U in comune: decide la metà dei segmenti lungo U; d vera (si intersecano) = debole; e
// affiancati: va dopo chi piega la cima verso l'altro, altrimenti la V del centro (debole); tra due esseri solo la V; essere contro cosa:
// sporgenza sopra la testa, poi b, poi il bordo davanti della cosa alla U dell'essere. b, c, d^ dipendono solo da ψ e si tengono in memoria (a
// passi di 1°, 2° col dito giù; la penetrazione SAT non cambia girando e si calcola una volta); a ed e si rifanno a ogni fotogramma. Due strati
// dello stesso prop: se le regole non dicono niente, la base prima. Il contorno unico di una corsa di muro ha solo gli archi «prima di ogni pezzo».
// Ordine: Kahn con la priorità del fotogramma prima (poi V); se ci sono cicli, componenti fortemente connesse (Tarjan) e dentro una componente
// solo gli archi forti; se resta un ciclo forte (un ciclo vero nella geometria) si tengono gli archi dove le due voci si coprono di più sullo
// schermo e si salta quello che lo chiuderebbe. Sotto i 2 px di margine una coppia tiene il verso di prima (isteresi, memoria per coppia di id
// stabili).
// Dentro uno strato i gruppi (le chiamate a box/prismX/prismY/cyl, i pezzi sciolti, grp) si ordinano con le stesse regole senza la a (le coppie
// che non si possono coprire sullo schermo si saltano), ma le impronte che si sovrappongono restano nell'ordine dell'autore e i disegni a mano
// senza impronta danno solo archi deboli; on (poggia su) e side (accanto) sono archi fissi; l'ordine si tiene in memoria per settore di ψ di 2°
// (riempita anche in sottofondo); o.intra(G,V,facing) del prop lo dà a mano (l'albero).
// W.dbg.ord='ky' rimette l'ordine di prima (ky, per le foto prima/dopo); W.dbg.prof misura i tempi (ord, sil) nel contatore.
const LAYERS=[],FREEF=[],HE={kind:'B',hero:1,sid:'H',sk:999999},DIR8=[[1,0],[-1,0],[0,1],[0,-1],[.7071,.7071],[-.7071,.7071],[.7071,-.7071],[-.7071,-.7071]];
const ORD={fast:0,slow:0,mm:{m:new Map()},mn:{m:new Map()},fm:{m:new Map()},last:[],lastF:[],fr:0,cyc:0,tOrd:0,tSil:0,tIntra:0,pOrd:0,pSil:0,byId:new Map()};
let PSIK=null,PC=1,PSN=0,UCAM=0,DRAG=false,NL=0,PVS=null,PVD=null,PVF=null,PVM=null;
// inviluppo convesso senza doppioni, in senso antiorario (1 punto → [p], punti allineati → i 2 estremi)
function hullW(P){const p=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),q=[];for(const a of p){const l=q[q.length-1];if(!l||Math.abs(l[0]-a[0])>1e-7||Math.abs(l[1]-a[1])>1e-7)q.push(a)}
  if(q.length<3)return q.map(a=>[a[0],a[1]]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const a of q){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],a)<=1e-9)lo.pop();lo.push(a)}
  for(let i=q.length-1;i>=0;i--){const a=q[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],a)<=1e-9)up.pop();up.push(a)}
  up.pop();lo.pop();const r=lo.concat(up);return(r.length?r:[q[0]]).map(a=>[a[0],a[1]])}
// q sta dentro l'inviluppo H allargato di d?
function inHull(H,q,d){if(!H.length)return false;if(H.length===1)return Math.hypot(q[0]-H[0][0],q[1]-H[0][1])<=d;
  if(H.length===2){const a=H[0],b=H[1],dx=b[0]-a[0],dy=b[1]-a[1],t=cl(((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(q[0]-a[0]-dx*t,q[1]-a[1]-dy*t)<=d}
  for(let k=0;k<H.length;k++){const a=H[k],b=H[(k+1)%H.length],nx=b[1]-a[1],ny=a[0]-b[0],l=Math.hypot(nx,ny)||1;if(((q[0]-a[0])*nx+(q[1]-a[1])*ny)/l>d)return false}return true}
// SAT: penetrazione minima tra due impronte convesse (negativa: separate di tanto)
function satPen(A,B){let best=1e9;const pr=(nx,ny)=>{let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(let k=0;k<A.length;k++){const d=A[k][0]*nx+A[k][1]*ny;if(d<a0)a0=d;if(d>a1)a1=d}
    for(let k=0;k<B.length;k++){const d=B[k][0]*nx+B[k][1]*ny;if(d<b0)b0=d;if(d>b1)b1=d}const p=Math.min(a1-b0,b1-a0);if(p<best)best=p};
  for(const P of[A,B]){if(P.length<2)continue;for(let k=0;k<P.length;k++){const p=P[k],q=P[(k+1)%P.length],nx=p[1]-q[1],ny=q[0]-p[0],l=Math.hypot(nx,ny);if(l>1e-9)pr(nx/l,ny/l)}}pr(1,0);pr(0,1);return best}
// l'area in comune di due poligoni convessi (Sutherland–Hodgman)
function clipArea(P,Q){if(P.length<3||Q.length<3)return 0;const sg=shoelace(Q)>0?1:-1;let out=P;
  for(let i=0;i<Q.length&&out.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],inp=out,side=p=>sg*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]));out=[];
    for(let k=0;k<inp.length;k++){const p=inp[k],q=inp[(k+1)%inp.length],sp=side(p),sq=side(q);if(sp>=0)out.push(p);if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}}}
  return out.length>2?Math.abs(shoelace(out))/2:0}
const shOf=e=>{if(e.sh)return e.sh;if(e.kind==='B'){const x=e.qx,y=e.qy,h=e.Hh*e.zk,w=e.hw;return e.sh=[[x-w,y+2],[x+w,y+2],[x+w,y-h],[x-w,y-h]]}const p=e.prop;LEANK=p.lk==null?1:p.lk;setRef(p.ref);const P=[];for(const q of e.xy){P.push(S(q[0],q[1],e.z0),S(q[0],q[1],e.z1))}LEANK=1;setRef(null);return e.sh=hullW(P)};
// l'intervallo [V dietro, V davanti] dell'impronta convessa sulla retta U = u (null se non la tocca)
function segAlong(H,u){if(H.length===1)return Math.abs(H[0][0]-u)<1e-6?[H[0][1],H[0][1]]:null;let lo=1e9,hi=-1e9;
  for(let k=0;k<H.length;k++){const p=H[k],q=H[(k+1)%H.length];if((p[0]-u)*(q[0]-u)<=0){if(Math.abs(q[0]-p[0])<1e-9){lo=Math.min(lo,p[1],q[1]);hi=Math.max(hi,p[1],q[1])}else{const v=p[1]+(u-p[0])/(q[0]-p[0])*(q[1]-p[1]);if(v<lo)lo=v;if(v>hi)hi=v}}}
  return lo>hi?null:[lo,hi]}
// gira l'impronta (o.xy, centro o.cx, o.cy) di ψ: o.H in (U, V), i suoi estremi e il centro
function rotate(o,c,s){const n=o.xy.length;if(!o.H||o.H.length!==n){o.H=new Array(n);for(let k=0;k<n;k++)o.H[k]=[0,0]}let U0=1e9,U1=-1e9,V0=1e9,V1=-1e9;
  for(let k=0;k<n;k++){const x=o.xy[k][0],y=o.xy[k][1],U=x*c-y*s,V=x*s+y*c,h=o.H[k];h[0]=U;h[1]=V;if(U<U0)U0=U;if(U>U1)U1=U;if(V<V0)V0=V;if(V>V1)V1=V}
  o.U0=U0;o.U1=U1;o.V0=V0;o.V1=V1;o.cU=o.cx*c-o.cy*s;o.cV=o.cx*s+o.cy*c}
// i punti del mondo che un pezzo può toccare, con i raggi (per le impronte e le quote)
function partPts(t,out){const add=(x,y,z)=>out.push([x,y,z||0]);
  switch(t.k){case'face':case'facepoly':case'plane':for(const q of t.c)add(q[0],q[1],q[2]);break;
    case'poly':case'hull':case'outline':for(const q of t.pts)add(q[0],q[1],q[2]);break;
    case'line':{const r=(t.w||1)/2+(t.ink?1.1:0);for(const q of[t.a,t.b])for(const[dx,dy] of DIR8)add(q[0]+dx*r,q[1]+dy*r,q[2]);break}
    case'ball':{const r=t.r,p=t.p,h=r*(t.sq||1),z0=p[2]>=0?Math.max(0,p[2]-h):p[2]-h;for(const[dx,dy] of DIR8)add(p[0]+dx*r,p[1]+dy*r,p[2]);add(p[0],p[1],p[2]+h);add(p[0],p[1],z0);break}
    case'fn':{const o=t.o,r=o.r||0;let P=t.rec||[];
      if(o.fp){const zs=P.length?P.map(q=>q[2]):[0],za=Math.min(...zs),zb=Math.max(...zs);P=[];for(const q of o.fp){P.push([q[0],q[1],q[2]!=null?q[2]:za]);P.push([q[0],q[1],q[2]!=null?q[2]:zb])}}
      for(const q of P){if(!r){add(q[0],q[1],q[2]);continue}for(const[dx,dy] of DIR8)add(q[0]+dx*r,q[1]+dy*r,q[2]);add(q[0],q[1],q[2]+r);add(q[0],q[1],q[2]>=0?Math.max(0,q[2]-r):q[2]-r)}
      if(o.z&&P.length){const q=P[0];add(q[0],q[1],o.z[0]);add(q[0],q[1],o.z[1])}break}}}
// impronta, quote e centro di un insieme di punti (o.z: [z0,z1] imposto da chi disegna)
function finFP(o,pts,zr){const H=hullW(pts.length?pts:[[0,0,0]]);o.xy=H;let z0=1e9,z1=-1e9;for(const q of pts){if(q[2]<z0)z0=q[2];if(q[2]>z1)z1=q[2]}
  if(!pts.length)z0=z1=0;if(zr){z0=zr[0];z1=zr[1]}o.z0=z0;o.z1=z1;let cx=0,cy=0;for(const q of H){cx+=q[0];cy+=q[1]}o.cx=cx/H.length;o.cy=cy/H.length;o.area=Math.abs(shoelace(H))/2}
// la prova a vuoto di un disegno a mano (all'avvio, su una tela 1×1): S2 registra i punti 3D che tocca
function dryRun(t){const rec=[],S2=(x,y,z)=>{if(Array.isArray(x)){z=x[2];y=x[1];x=x[0]}rec.push([x,y,z||0]);return S(x,y,z)};const sd=seed;srand(hashS('f|'+t.sd));
  try{t.f(S2,ctx)}catch(e){t.err=String(e)}finally{seed=sd}t.rec=rec}
// i gruppi e gli strati di un prop. Sporgenza: i gruppi che partono sopra 2 px e sopra un quarto dell'altezza del prop (i lobi di una zucca
// no) ed escono di più di 3 px dall'impronta della base; chi poggia su un gruppo (on) sta nel suo strato
function buildLayers(p){const G=new Map(),order=[],loose=[];
  for(const t of p.parts){if((t.k==='hull'||t.k==='outline')&&!t.g){loose.push(t);continue}if(!t.g)t.g=++GID;let g=G.get(t.g);
    if(!g){g={g:t.g,parts:[],gi:order.length};G.set(t.g,g);order.push(g)}g.parts.push(t)}
  for(const g of order){const pts=[];let zr=null;g.dec=g.parts.every(t=>t.k==='fn'&&!t.o.r&&!t.o.fp&&!t.o.z&&!t.o.it);for(const t of g.parts){partPts(t,pts);const o=t.o||t;if(o.z&&t.k==='fn')zr=o.z;
      if(o.on&&g.on==null)g.on=o.on;if(o.side&&!g.side)g.side=o.side;if(o.it&&!g.it)g.it=o.it;if(o.tip&&!g.tip)g.tip=o.tip}
    if(p.rot){const R=p.rot;for(const q of pts){const r=tP(R,q[0],q[1]);q[0]=r[0];q[1]=r[1]}if(g.side)g.side=tV(R,g.side[0],g.side[1]);if(g.tip)g.tip=[...tP(R,g.tip[0],g.tip[1]),g.tip[2]]}// un prop girato: l'impronta nel mondo
    if(!pts.length){const b=p.bx;pts.push([(b[0]+b[2])/2,(b[1]+b[3])/2,0]);g.dec=true}// un disegno a mano che la prova a vuoto non ha visto (girato di spalle all'avvio): il centro del prop, solo archi deboli
    finFP(g,pts,zr)}
  for(const g of order)if(g.on!=null){const h=Array.isArray(g.on)?g.on[0]:g.on;g.onG=h&&h.g}
  const lp=loose.map(t=>{const o={t},pts=[];partPts(t,pts);if(p.rot)for(const q of pts){const r=tP(p.rot,q[0],q[1]);q[0]=r[0];q[1]=r[1]}finFP(o,pts);return o});
  const mk=(gs,ls,suf,li)=>{const L={kind:'L',prop:p,li,sid:'P'+p.i+suf,groups:gs,loose:ls.map(o=>o.t),flames:[],memo:new Map(),floor:!!p.floor,outl:!gs.length,sb:[0,0,0,0],lean:0};
    const pts=[];for(const g of gs)for(const q of g.xy)pts.push([q[0],q[1],g.z0],[q[0],q[1],g.z1]);for(const o of ls)for(const q of o.xy)pts.push([q[0],q[1],o.z0],[q[0],q[1],o.z1]);finFP(L,pts);
    const tg=new Set();for(const g of gs)for(const t of g.parts)tg.add(t.part||'');for(const o of ls)tg.add(o.t.part||'');L.part=tg.size===1?[...tg][0]||null:null;
    L.n=LAYERS.length;L.sk=L.n;LAYERS.push(L);ORD.byId.set(L.sid,L);return L};
  let base=order.filter(g=>g.z0<=2),over=[],lb=lp,lo=[];
  // (o.noSplit: un prop senza sporgenze sotto cui si passa, come carretto, pompa, steccati: uno strato solo, l'ordine dentro lo fa intraOrder)
  if(base.length&&base.length<order.length&&!p.noSplit){const bh=hullW(base.flatMap(g=>g.xy)),zl=Math.max(2,.25*Math.max(...order.map(g=>g.z1))),out=o=>o.z0>zl&&!o.xy.every(q=>inHull(bh,q,3));over=order.filter(out);
    if(over.length){const ov=new Set(over);for(const g of order)if(g.onG!=null){const h=G.get(g.onG);if(h&&ov.has(h)!==ov.has(g)){if(ov.has(h))ov.add(g);else ov.delete(g)}}// chi poggia su un gruppo sta nel suo strato
      over=order.filter(g=>ov.has(g));base=order.filter(g=>!ov.has(g));lb=lp.filter(o=>!out(o));lo=lp.filter(out)}}
  else base=order;
  p.layers=over.length?[mk(base,lb,'b',0),mk(over,lo,'o',1)]:[mk(order,lp,'',0)];
  // il prop intero (W.dbg.ord='ky' e le prove): la sua impronta e le quote
  const w={kind:'W',prop:p,sid:'P'+p.i,sk:600000+p.i,sb:[0,0,0,0],lean:0},pts=[];for(const L of p.layers)for(const q of L.xy)pts.push([q[0],q[1],L.z0],[q[0],q[1],L.z1]);finFP(w,pts);p.whole=w;if(!ORD.byId.has(w.sid))ORD.byId.set(w.sid,w)}
// dopo area.build(): prova a vuoto dei disegni a mano, gruppi, strati, contorni delle corse di muro, fiamme figlie, esseri fissi, memoria dei
// verdetti. Non tocca il seme dei numeri a caso (lucciole, nebbia e corvi nascono dopo)
// (a passi come la cottura: nella costruzione a pezzi si ferma ogni 8 ms circa, ridando al gioco il suo ctx e il suo seme)
function finalize(){runSteps(finalizeSteps())}
function* finalizeSteps(){if(LAYERS.length)return;let t0=performance.now();const late=()=>STEP&&performance.now()-t0>8,again=()=>{t0=performance.now()};
  {let sv=ctx,sd=seed;const dc=document.createElement('canvas');dc.width=dc.height=1;const dg=dc.getContext('2d');ctx=dg;
    try{for(const p of props){for(const t of p.parts)if(t.k==='fn')dryRun(t);if(late()){ctx=sv;seed=sd;yield;sv=ctx;sd=seed;ctx=dg;again()}}}finally{ctx=sv;seed=sd}}
  props.forEach((p,i)=>{p.i=i});for(const p of props){buildLayers(p);if(late()){yield;again()}}
  // un prop fatto solo di contorni (il contorno unico di una corsa di muro): prima di ogni pezzo della corsa (stesso nome, dentro la sua impronta)
  for(const O of LAYERS)if(O.outl){O.kids=new Set();for(const L of LAYERS)if(!L.outl&&!L.floor&&L.prop.name===O.prop.name&&L.xy.every(q=>inHull(O.xy,q,3)))O.kids.add(L.n);if(late()){yield;again()}}
  // le fiamme sono figlie dello strato che contiene il loro punto (il più piccolo) e si disegnano subito dopo di lui; le altre sono voci libere
  for(const f of flames){let best=null,ba=1e18;for(const L of LAYERS){if(L.floor||L.outl||f.z<L.z0-3||f.z>L.z1+8||!inHull(L.xy,[f.x,f.y],3))continue;if(L.area<ba){ba=L.area;best=L}}
    if(best){best.flames.push(f);f.L=best}else FREEF.push(f);if(late()){yield;again()}}
  // le tabelle delle coppie di strati (NL² voci ciascuna: le più grandi della costruzione, una pausa tra l'una e l'altra)
  NL=LAYERS.length;W.dbg.NL=NL;PEN=new Float32Array(NL*NL).fill(NaN);if(STEP){yield;again()}PVS=new Int32Array(NL*NL).fill(-999999);if(STEP){yield;again()}PVD=new Int8Array(NL*NL);PVF=new Int8Array(NL*NL);PVM=new Float32Array(NL*NL);
  perches.forEach((c,i)=>{c.E={kind:'B',pc:c,sid:'C'+i,sk:800000+i}});FREEF.forEach((f,i)=>{f.E={kind:'B',fl:f,sid:'F'+i,sk:700000+i}});
  flames.forEach((f,i)=>{f.KE={kind:'B',fl:f,sid:'F*'+i,sk:650000+i}});PSIK=null}
// ψ quantizzato per l'ordine: si rigirano le impronte di tutti gli strati
function psiUpdate(){const st=DRAG?2:1,k=CAM.rot?Math.round(wrapA(CAM.yaw)/DEG/st)*st:0;if(k===PSIK)return;PSIK=k;if(k===0){PC=1;PSN=0}else{PC=Math.cos(k*DEG);PSN=Math.sin(k*DEG)}
  for(const L of LAYERS)rotate(L,PC,PSN)}
// il riquadro a schermo di uno strato (la regola a: con la piega vera, i raggi e 2 px di contorno) e quanto si piega di lato la sua cima
// (la stessa proiezione di S, senza creare array: il risultato in PX, PY)
let PX=0,PY=0;
function projInto(x,y,z){if(CAM.rot){const dx=x-CAM.x,dy=y-CAM.y,u=dx*CAM.c-dy*CAM.s,v=dx*CAM.s+dy*CAM.c;let lu,lv;if(REF){lu=REF[0]+REF[1]*u;lv=REF[2]+REF[3]*v}else{lu=soft(u*CAM.lx);lv=softV((-CAM.oy/CAM.SP-v)*CAM.ly)}
    PX=CAM.x+u+lu*z*LEANK;PY=CAM.y+v*CAM.SP-z*CAM.CP+lv*z*LEANK;return}
  if(REF){PX=x+(REF[0]+REF[1]*x)*z*LEANK;PY=y-z+(REF[2]+REF[3]*y)*z*LEANK;return}PX=x+soft((x-CAM.x)*CAM.lx)*z*LEANK;PY=y-z+softV((CAM.cy-y)*CAM.ly)*z*LEANK}
// (se la telecamera non si è mossa dall'ultima volta, il riquadro è ancora quello: CST è il numero della posizione della telecamera)
let CST=0,CSK='';function camStamp(){const k=CAM.x+','+CAM.y+','+CAM.oy+','+CAM.yaw+','+CAM.el;if(k!==CSK){CSK=k;CST++}}
function layerSB(L){if(L.cst===CST)return;L.cst=CST;const p=L.prop,lk=p.lk==null?1:p.lk;LEANK=lk;setRef(p.ref);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const xy=L.xy,z0=L.z0,z1=L.z1,rot=CAM.rot,c=CAM.c,s=CAM.s,SP=CAM.SP,CP=CAM.CP;
  // (L.pp: gli spigoli proiettati, in basso e in alto, per le copie degli strati fermi: lcPrep misura lì quanto si è mossa la piega)
  const pp=L.pp&&L.pp.length===xy.length*4?L.pp:(L.pp=new Float64Array(xy.length*4));
  for(let k=0;k<xy.length;k++){const X=xy[k][0],Y=xy[k][1];let bx,by,lu,lv,kz;// la base del vertice e la sua piega (come in S), poi le due quote
    if(rot){const dx=X-CAM.x,dy=Y-CAM.y,u=dx*c-dy*s,v=dx*s+dy*c;if(REF){lu=REF[0]+REF[1]*u;lv=REF[2]+REF[3]*v}else{lu=soft(u*CAM.lx);lv=softV((-CAM.oy/SP-v)*CAM.ly)}bx=CAM.x+u;by=CAM.y+v*SP;kz=CP}
    else{if(REF){lu=REF[0]+REF[1]*X;lv=REF[2]+REF[3]*Y}else{lu=soft((X-CAM.x)*CAM.lx);lv=softV((CAM.cy-Y)*CAM.ly)}bx=X;by=Y;kz=1}
    for(let m=0;m<2;m++){const z=m?z1:z0,px=bx+lu*z*lk,py=by-z*kz+lv*z*lk;if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py;const i=(k*2+m)*2;pp[i]=px;pp[i+1]=py}}
  projInto(L.cx,L.cy,z1);const lt=PX;projInto(L.cx,L.cy,0);L.lean=lt-PX;L.sh=null;LEANK=1;setRef(null);const b=L.sb;b[0]=x0-2;b[1]=y0-2;b[2]=x1+2;b[3]=y1+2}
// un essere: cartellone nel punto (x, y), largo ±hw, da zh a zh+H; il riquadro a schermo con l'altezza vera della figura (zk)
function beingE(e,x,y,zh,H,hw,zk,rf){const U=x*PC-y*PSN,V=x*PSN+y*PC;e.cU=e.U0=e.U1=U;e.cV=e.V0=e.V1=V;e.z0=zh;e.z1=zh+H;e.hw=hw;e.H=[[U,V]];e.x=x;e.y=y;e.zh=zh;e.Hh=H;e.zk=zk;
  if(rf){const sv=REF;setRef(rf);projInto(x,y,zh);REF=sv}else projInto(x,y,zh);const w=Math.max(14,hw*1.8),b=e.sb||(e.sb=[0,0,0,0]);b[0]=PX-w;b[1]=PY-H*zk-6;b[2]=PX+w;b[3]=PY+5;e.qx=PX;e.qy=PY;e.sh=null;return e}
// la penetrazione SAT tra due impronte non cambia girando (si girano insieme le forme e gli assi): si calcola una volta per coppia nel mondo.
// Un'impronta tutta dentro l'altra non è un contatto ma un incrocio vero (il muschio disegnato dentro lo spessore di un muro): vale almeno 3,01
function penW(A,B){let pen=satPen(A.xy,B.xy);if(pen>.25&&pen<=3&&(A.xy.every(q=>inHull(B.xy,q,.5))||B.xy.every(q=>inHull(A.xy,q,.5))))pen=3.01;return pen}
let PEN=null;const penL=(A,B)=>{const i=A.n<B.n?A.n*NL+B.n:B.n*NL+A.n;let v=PEN[i];if(v!==v)v=PEN[i]=penW(A,B);return v};
// verdetto geometrico tra due impronte (solo ψ): [verso di A (−1 prima, +1 dopo), forza, margine] o null (affiancati: decide e)
function geom(A,B,intra,pen){const tie=intra?(A.gi<B.gi?-1:1):(A.sk<B.sk?-1:1);
  if(A.V1<=B.V0)return[-1,2,B.V0-A.V1];if(B.V1<=A.V0)return[1,2,A.V0-B.V1];// b
  const tz=Math.max(1.5,.08*Math.min(A.z1-A.z0,B.z1-B.z0));
  // d^: sta tutto sopra (prima della c): il fondo sopra la cima dell'altro, con tolleranza, e la cima più in alto della sua (una linea a metà di
  // un'asta non le sta sopra); tra voci deve anche partire più in alto (una cosa piatta a terra non sta «sotto» una cupola che parte da terra);
  // dentro un prop non vale per i disegni a mano senza impronta (i loro punti non dicono l'altezza vera)
  if(pen>.25&&!(intra&&(A.dec||B.dec))){const lift=intra?-1e9:.5;if(A.z0>=B.z1-tz&&A.z0>B.z0+lift&&A.z1>B.z1)return[1,2,A.z0-B.z1+tz];if(B.z0>=A.z1-tz&&B.z0>A.z0+lift&&B.z1>A.z1)return[-1,2,B.z0-A.z1+tz]}
  const u0=Math.max(A.U0,B.U0),u1=Math.min(A.U1,B.U1);
  if(pen>3||u1-u0>3||(u1>=u0&&(A.H.length===1||B.H.length===1))){if(pen>3&&intra)return[tie,1,9];// dentro un prop un incrocio vero resta nell'ordine dell'autore
    const us=(u0+u1)/2,sa=segAlong(A.H,us),sb=segAlong(B.H,us);// c (contatto ≤3 px = separati), d vera = debole: la metà dei segmenti lungo U
    if(sa&&sb){const ma=(sa[0]+sa[1])/2,mb=(sb[0]+sb[1])/2;return[Math.sign(ma-mb)||tie,pen>3?1:2,Math.abs(ma-mb)]}}
  return null}
// in memoria per il ψ di adesso (PSIK): i verdetti tra strati si calcolano solo quando servono. Due strati dello stesso prop (base e sporgenza):
// se le regole non dicono niente (affiancati) la base va prima, come l'ha scritto l'autore; per i prop ordinati a mano (o.intra: l'albero) anche
// quando le regole sono incerte (deboli)
function pv(A,B){const lo=A.n<B.n?A:B,hi=lo===A?B:A,i=lo.n*NL+hi.n;
  if(PVS[i]!==PSIK){let r=geom(lo,hi,false,penL(lo,hi));if(lo.prop===hi.prop&&(!r||(r[1]<2&&lo.prop.intra)))r=[lo.li<hi.li?-1:1,1,9];PVS[i]=PSIK;if(r){PVD[i]=r[0];PVF[i]=r[1];PVM[i]=r[2]}else PVD[i]=0}
  const d=PVD[i];if(!d)return null;return[lo===A?d:-d,PVF[i],PVM[i]]}
// e: affiancati, va dopo chi piega la cima verso l'altro; se nessuno si piega abbastanza, la V del centro (debole)
function relE(A,B){const k=A.cU<B.cU?1:-1,inA=k*A.lean,inB=-k*B.lean;if(Math.max(inA,inB)>.75)return[inA>=inB?1:-1,1,Math.abs(inA-inB)];
  return[Math.sign(A.cV-B.cV)||(A.sk<B.sk?-1:1),1,Math.abs(A.cV-B.cV)]}
// un essere E contro uno strato P: sporgenza sopra la testa → prima; l'essere sta sopra la cosa (corvo posato) → dopo; b; il bordo davanti della cosa
// alla U dell'essere (kyFn generalizzato) se la figura copre le sue colonne; accanto: chi è più vicino al centro della visuale va dopo (debole)
function relEss(E,P){const tz=Math.max(1.5,.08*Math.min(E.z1-E.z0,P.z1-P.z0)),s=segAlong(P.H,Math.min(P.U1,Math.max(P.U0,E.cU))),
    under=s&&E.cU>=P.U0-1&&E.cU<=P.U1+1&&E.cV>=s[0]-1&&E.cV<=s[1]+1;
  if(under&&P.z0>=E.z1-tz&&P.z0>E.z0+.5&&P.z1>E.z1)return[-1,2,P.z0-E.z1+tz+3];if(under&&E.z0>=P.z1-tz&&E.z0>P.z0+.5&&E.z1>P.z1)return[1,2,E.z0-P.z1+tz+3];
  // (difetti 48) chi sta sopra o sotto una cosa ha sempre un margine di almeno 3 px: chi sta appoggiato sul solaio ha 1,5 px (tz) e sotto i 2 px
  // l'isteresi teneva il verso di quando stava ancora di sotto (l'eroe e gli zombie di sopra restavano «dentro il pavimento»). Sui gradini (st)
  // chi sale o scende sta sopra la scala
  if(under&&P.part==='st'&&E.z0>.5)return[1,2,9];
  if(E.cV>=P.V1)return[1,2,E.cV-P.V1];if(E.cV<=P.V0)return[-1,2,P.V0-E.cV];
  if(E.cU+E.hw>P.U0&&E.cU-E.hw<P.U1){const vf=s?s[1]:P.V1;return[E.cV>=vf-1?1:-1,2,Math.abs(E.cV-vf+1)]}
  const gap=Math.max(0,P.U0-UCAM,UCAM-P.U1),du=Math.abs(E.cU-UCAM);return[du<=gap?1:-1,1,Math.abs(gap-du)]}
// il contorno unico di una corsa di muro ha solo gli archi verso i suoi pezzi (prima di tutti): con la sua impronta (tutta la corsa) contro le
// altre voci chiudeva cicli con le ante e i pilastri; il suo posto lo dà la priorità, appena prima del primo pezzo
function rel(A,B){const la=A.kind==='L',lb=B.kind==='L';
  if(A.outl||B.outl){if(A.kids&&lb&&A.kids.has(B.n))return[-1,3,99];if(B.kids&&la&&B.kids.has(A.n))return[1,3,99];return null}
  // la Bara (T): contro uno strato le regole delle impronte (senza memoria: si sposta), contro un essere come una cosa
  if(A.kind==='T'||B.kind==='T'){const ta=A.kind==='T',T=ta?A:B,O=ta?B:A;let r;if(O.kind==='L')r=geom(T,O,false,penW(T,O))||relE(T,O);else{r=relEss(O,T);r=[-r[0],r[1],r[2]]}
    return ta?r:[-r[0],r[1],r[2]]}
  if(la&&lb)return pv(A,B)||relE(A,B);
  if(!la&&!lb)return[Math.sign(A.cV-B.cV)||(A.sk<B.sk?-1:1),2,Math.abs(A.cV-B.cV)];// tra due esseri solo la profondità (mai e)
  if(!la)return relEss(A,B);const r=relEss(B,A);return[-r[0],r[1],r[2]]}
// Tarjan sui nodi dati (solo gli archi forti se strongOnly), poi Kahn sulle componenti con la priorità key (il più piccolo esce prima); una
// componente con più nodi si riordina con i soli archi forti; se resta un ciclo forte (un ciclo vero nella geometria) si tengono gli archi dal più
// importante (wf: l'area in cui le due voci si coprono davvero sullo schermo; poi il margine più grande) e si salta quello che chiuderebbe il
// ciclo; a parità decide key. adj[v] = [w, forza, margine, w, forza, margine, …]
function sccOrder(nodes,adj,key,strongOnly,wf){const N=adj.length,inS=new Uint8Array(N);for(const v of nodes)inS[v]=1;
  if(!strongOnly&&nodes.length===N){// senza cicli Kahn basta (le componenti sarebbero tutte da un nodo): si prova prima così
    const dg=new Int32Array(N);for(let v=0;v<N;v++){const a=adj[v];for(let k=0;k<a.length;k+=3)dg[a[k]]++}const rd=[],out=[];for(let v=0;v<N;v++)if(!dg[v])rd.push(v);
    while(rd.length){let bi=0;for(let i=1;i<rd.length;i++)if(key[rd[i]]<key[rd[bi]])bi=i;const v=rd[bi];rd[bi]=rd[rd.length-1];rd.pop();out.push(v);const a=adj[v];for(let k=0;k<a.length;k+=3)if(--dg[a[k]]===0)rd.push(a[k])}
    if(out.length===N){ORD.fast++;return out}ORD.slow++}
  const I=new Int32Array(N).fill(-1),Lo=new Int32Array(N),on=new Uint8Array(N),comp=new Int32Array(N),st=[],comps=[];let idx=0;
  const sc=v=>{I[v]=Lo[v]=idx++;st.push(v);on[v]=1;const a=adj[v];for(let k=0;k<a.length;k+=3){const w=a[k];if(!inS[w]||(strongOnly&&a[k+1]<2))continue;
      if(I[w]<0){sc(w);if(Lo[w]<Lo[v])Lo[v]=Lo[w]}else if(on[w]&&I[w]<Lo[v])Lo[v]=I[w]}
    if(Lo[v]===I[v]){const c=[];let w;do{w=st.pop();on[w]=0;comp[w]=comps.length;c.push(w)}while(w!==v);comps.push(c)}};
  for(const v of nodes)if(I[v]<0)sc(v);
  const C=comps.length,indeg=new Int32Array(C),out=new Array(C),ck=new Float64Array(C);
  for(let c=0;c<C;c++){out[c]=[];let m=Infinity;for(const v of comps[c])if(key[v]<m)m=key[v];ck[c]=m}
  for(const v of nodes){const a=adj[v],cv=comp[v];for(let k=0;k<a.length;k+=3){const w=a[k];if(!inS[w]||(strongOnly&&a[k+1]<2))continue;const cw=comp[w];if(cw!==cv){out[cv].push(cw);indeg[cw]++}}}
  const ready=[],res=[];for(let c=0;c<C;c++)if(!indeg[c])ready.push(c);
  while(ready.length){let bi=0;for(let i=1;i<ready.length;i++)if(ck[ready[i]]<ck[ready[bi]])bi=i;const c=ready[bi];ready[bi]=ready[ready.length-1];ready.pop();const mem=comps[c];
    if(mem.length===1)res.push(mem[0]);else if(!strongOnly){for(const v of sccOrder(mem,adj,key,true,wf))res.push(v)}else{ORD.cyc++;for(const v of dagOrder(mem,adj,key,wf))res.push(v)}
    for(const w of out[c])if(--indeg[w]===0)ready.push(w)}
  return res}
function dagOrder(mem,adj,key,wf){const n=mem.length,loc=new Map(mem.map((v,i)=>[v,i])),arcs=[],out=[];for(let i=0;i<n;i++)out.push([]);
  for(const v of mem){const a=adj[v];for(let k=0;k<a.length;k+=3){const w=a[k];if(a[k+1]<2||!loc.has(w))continue;arcs.push([loc.get(v),loc.get(w),a[k+2],a[k+1]>2?1e9:wf?wf(v,w):0])}}
  arcs.sort((p,q)=>q[3]-p[3]||q[2]-p[2]);const seen=new Int32Array(n);let mk=0;
  const reach=(s,t)=>{mk++;const st=[s];seen[s]=mk;while(st.length){const x=st.pop();if(x===t)return true;for(const y of out[x])if(seen[y]!==mk){seen[y]=mk;st.push(y)}}return false};
  for(const[a,b] of arcs)if(!reach(b,a))out[a].push(b);
  const indeg=new Int32Array(n);for(const o of out)for(const y of o)indeg[y]++;const ready=[],res=[];for(let i=0;i<n;i++)if(!indeg[i])ready.push(i);
  while(ready.length){let bi=0;for(let i=1;i<ready.length;i++)if(key[mem[ready[i]]]<key[mem[ready[bi]]])bi=i;const c=ready[bi];ready[bi]=ready[ready.length-1];ready.pop();res.push(mem[c]);for(const y of out[c])if(--indeg[y]===0)ready.push(y)}
  return res}
// l'ordine di una lista di voci: coppie con i riquadri a schermo che si toccano (spazzata su x0), regole, isteresi, componenti
function orderList(ents,hold){const n=ents.length;if(n<2){for(const e of ents){e.rk=0;e.rf=ORD.fr}return ents.slice()}
  for(let i=0;i<n;i++)ents[i]._i=i;const ix=new Array(n);for(let i=0;i<n;i++)ix[i]=i;ix.sort((a,b)=>ents[a].sb[0]-ents[b].sb[0]);
  const adj=new Array(n);for(let i=0;i<n;i++)adj[i]=[];const mem=hold.m,next=new Map();
  for(let a=0;a<n;a++){const A=ents[ix[a]],sa=A.sb;for(let b=a+1;b<n;b++){const B=ents[ix[b]],sbb=B.sb;if(sbb[0]>sa[2])break;if(sbb[1]>sa[3]||sbb[3]<sa[1])continue;
      const r=rel(A,B);if(!r)continue;const lo=A.sk<B.sk,key=lo?A.sk*1e6+B.sk:B.sk*1e6+A.sk,sg=lo?1:-1,old=mem.get(key);let d=r[0];
      if(old!==undefined&&r[2]<2&&old*sg!==d)d=old*sg;next.set(key,d*sg);// isteresi: sotto i 2 px si tiene il verso di prima
      if(d<0)adj[A._i].push(B._i,r[1],r[2]);else adj[B._i].push(A._i,r[1],r[2])}}
  hold.m=next;if(W.dbg.adj)hold.adj={ids:ents.map(e=>e.sid),adj};const fr=ORD.fr,key=new Float64Array(n);for(let i=0;i<n;i++){const e=ents[i];key[i]=e.rf===fr-1?e.rk:1e6+e.cV}
  for(let i=0;i<n;i++){const e=ents[i];if(!e.outl)continue;let m=Infinity;const a=adj[i];for(let k=0;k<a.length;k+=3)if(key[a[k]]<m)m=key[a[k]];if(m<Infinity)key[i]=m-.5}// il contorno subito prima del primo pezzo
  const nodes=new Array(n);for(let i=0;i<n;i++)nodes[i]=i;const res=sccOrder(nodes,adj,key,false,(a,b)=>clipArea(shOf(ents[a]),shOf(ents[b]))).map(i=>ents[i]);res.forEach((e,r)=>{e.rk=r;e.rf=fr});return res}
// l'ordine dei gruppi dentro uno strato, in memoria per settore di ψ di 2°
const secNow=()=>CAM.rot?Math.round(wrapA(CAM.yaw)/DEG/2):0;
function intraOrder(L){const sec=secNow();if(W.dbg.forceIntra===L.sid){L.memo.delete(sec);W.dbg.forceIntra=null}return intraAt(L,sec)}
function intraAt(L,sec){const G=L.groups;if(G.length<2)return G;let o=L.memo.get(sec);if(o)return o;
  const t0=W.dbg.prof?performance.now():0,a=sec*2*DEG,c=sec?Math.cos(a):1,s=sec?Math.sin(a):0;for(const g of G)rotate(g,c,s);const p=L.prop;
  if(p.intra){o=p.intra(G,(x,y)=>x*s+y*c,(nx,ny)=>nx*s+ny*c)||[];if(o.length!==G.length){const seen=new Set(o);o=o.concat(G.filter(g=>!seen.has(g)))}}
  else{const n=G.length,adj=new Array(n);for(let i=0;i<n;i++)adj[i]=[];
    // (la regola a dentro il prop, senza la telecamera: si saltano le coppie che non si possono coprire sullo schermo a nessuna inclinazione
    // 35°–62°, cioè V − z·k con k tra 0,53 e 1,43, e con la piega di lato più grande, LK·z)
    for(const g of G){const ex=LK*g.z1+3;g.a0=g.U0-ex;g.a1=g.U1+ex;g.b0=g.V0-g.z1*1.43-3;g.b1=g.V1-g.z0*.53+3;g.pj=null}const PN=L.pen||(L.pen=new Float32Array(n*n).fill(NaN));
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const A=G[i],B=G[j];if(A.a1<B.a0||B.a1<A.a0||A.b1<B.b0||B.b1<A.b0)continue;let r=null;
      if(A.onG===B.g&&A.onG!=null)r=[1,3,9];else if(B.onG===A.g&&B.onG!=null)r=[-1,3,9];// on: poggia su → dopo l'ospite
      else if((A.side||B.side)&&(PN[i*n+j]!==PN[i*n+j]?PN[i*n+j]=penW(A,B):PN[i*n+j])>-1.5){const sd=A.side?A.side:B.side,f=sd[0]*s+sd[1]*c;r=[(f<0?-1:1)*(A.side?1:-1),3,9]}// side: accanto
      if(!r){const pen=PN[i*n+j]!==PN[i*n+j]?PN[i*n+j]=penW(A,B):PN[i*n+j];r=geom(A,B,true,pen)||[Math.sign(A.cV-B.cV)||(A.gi<B.gi?-1:1),1,Math.abs(A.cV-B.cV)];if((A.dec||B.dec)&&r[1]>1)r=[r[0],1,r[2]]}// un disegno a mano senza impronta (segni, muschio, legature) non impone niente: archi deboli
      if(r[0]<0)adj[i].push(j,r[1],r[2]);else adj[j].push(i,r[1],r[2]);if(W.dbg.intraArcs)W.dbg.intraArcs.push([A.gi,B.gi,r[0],r[1],+r[2].toFixed(2)])}
    // per sciogliere un ciclo forte conta quanto due gruppi si coprono davvero: le loro sagome proiettate a 45° (U, V − z), senza piega
    const pj=g=>{if(!g.pj){const P=[];for(const h of g.H){P.push([h[0],h[1]-g.z0],[h[0],h[1]-g.z1])}g.pj=hullW(P)}return g.pj};
    const key=new Float64Array(n),nodes=[];for(let i=0;i<n;i++){key[i]=G[i].gi;nodes.push(i)}o=sccOrder(nodes,adj,key,false,(a,b)=>clipArea(pj(G[a]),pj(G[b]))).map(i=>G[i])}
  L.memo.set(sec,o);if(W.dbg.prof)ORD.tIntra+=performance.now()-t0;return o}
// le memorie per settore si riempiono anche in sottofondo (pochi ms alla volta, dai settori vicini a quello di adesso), così il primo giro della
// telecamera non paga l'ordine dentro i prop di tutti gli strati a ogni settore nuovo (W.dbg.noWarm per le misure)
function warmIntra(){if(W.dbg.noWarm){setTimeout(warmIntra,500);return}const t0=performance.now(),s0=secNow();let todo=false;
  for(let d=0;d<=90&&performance.now()-t0<4;d++)for(const sg of d?[1,-1]:[1]){const sec=((s0+sg*d+90)%180+180)%180-90;for(const L of LAYERS){if(L.groups.length<2||L.memo.has(sec))continue;todo=true;intraAt(L,sec);if(performance.now()-t0>=4)break}}
  if(todo)setTimeout(warmIntra,30)}
// ------------------------------------------------------------------ FASE 9: gli strati fermi copiati (Denis, 20 ottobre: «Mappa zombie più
// fluida»). Prima ogni casa, muro, albero e oggetto si ridisegnava in 3D a ogni fotogramma, perché la piega delle cose alte cambia mentre
// la telecamera segue l'eroe. Ora i pezzi fermi di uno strato (facce, pannelli, palle, linee, contorni) si dipingono una volta in una tela
// loro e si copiano 1:1 (a vista dritta la telecamera sta su pixel interi della tela). Si ridipingono quando la piega dello strato,
// misurata sugli spigoli della sua impronta in basso e in alto (L.pp), si è mossa di più di mezzo pixel della tela (LCB.tol) o di meno ma
// con lo zoom diverso, quando cambia un suo pezzo (le ante del cancello e la porta della latrina che si aprono, le assi delle barriere, le
// trasparenze delle case con l'eroe dentro); a telecamera ferma tornano esatte (si ridipingono anche le copie spostate di due centesimi di
// pixel, poche per fotogramma). Tutti gli strati di un prop si ridipingono insieme (i muri di una casa restano attaccati). I disegni a mano
// (fn: lanterne, insegne, macchine, il corvo sul palo…) restano dal vivo al loro posto nell'ordine, tra una copia e l'altra, così quello
// che si muove si muove come prima; anche le fiamme figlie. Uno strato che cambia a ogni fotogramma (la piega che corre vicino al centro
// mentre l'eroe va di lato, una porta che si apre) si disegna dal vivo come prima finché non rallenta. Le tele stanno in LCB.max byte
// (fuori le meno usate di recente) e si liberano uscendo dalla mappa. Girando la visuale (CAM.rot), per la sagoma dell'eroe, per un prop
// che sfuma (fade) e con W.dbg.noLC: tutto dal vivo, come prima. Prova: anteprime/zombie/copie_prova.js
const LCB={max:48e6,mem:0,all:new Set(),f:0,tol:.5,cam:null,still:0,rest:false,rN:0,n:{copia:0,dipinto:0,vivo:0}};// (una vista della mappa ne usa 20–45 MB a 2 pixel per punto)
let LCF=null;// il fotogramma con le copie: {ctx, k: la scala, e, f: lo spostamento intero}; null: tutto dal vivo
const lcSum=a=>{let s=0;if(!a)return 0;if(typeof a[0]==='number'){for(let i=0;i<a.length;i++)s=s*1.0001+a[i]*(i+1.7);return s}
  for(let i=0;i<a.length;i++){const q=a[i];s=s*1.0001+q[0]*1.3+q[1]*2.9+(q[2]||0)*4.1}return s};
// un pezzo fermo è cambiato dall'ultima occhiata? (punti nuovi, materiale, colore, raggio, trasparenza, spessore; si ricorda com'è adesso)
function lcTouch(t){const g=t.c||t.pts||t.p,m=t.mat||t.texId||t.col,n=(t.r||0)+(t.alpha==null?1:t.alpha)*7+(t.w||0)*13+(t.sq||0)*17;let ch=!t._lc;t._lc=1;
  if(g!==t._g){const v=lcSum(g);if(v!==t._gs)ch=true;t._g=g;t._gs=v}
  if(t.a!==t._ga||t.b!==t._gb){const v=lcSum(t.a)+3*lcSum(t.b);if(v!==t._gab)ch=true;t._ga=t.a;t._gb=t.b;t._gab=v}
  if(m!==t._m||n!==t._n){ch=true;t._m=m;t._n=n}return ch}
// i pezzi dello strato nel loro ordine, a corse: una corsa di pezzi fermi si copia, un disegno a mano si fa dal vivo
function lcBuild(L,G){const runs=[];let cur=null,ri=0;
  for(const t of L.loose.concat(...G.map(g=>g.parts))){if(t.k==='fn'){runs.push({fn:t});cur=null;continue}
    if(!cur){cur={sid:L.sid+'#'+(ri++),parts:[],cv:null,w:0,h:0,ox:0,oy:0,used:0,heavy:0};runs.push(cur)}cur.parts.push(t);if(t.k!=='line'&&t.k!=='hull'&&t.k!=='outline'&&t.k!=='poly')cur.heavy++}
  // (una corsa di uno o due tratti leggeri si disegna com'è: una tela costerebbe più di quello che fa risparmiare)
  for(const r of runs)if(r.parts&&!r.heavy&&r.parts.length<3)r.dir=true;
  if(!runs.some(r=>r.parts&&!r.dir))return null;return{G,runs,pp:null,lp:null,k:0,st:true,hot:0,ha:-1,hb:-1,hu:-1}}
function lcFreeRun(r){if(r.cv){LCB.mem-=r.cv.width*r.cv.height*4;r.cv.width=r.cv.height=0;r.cv=null}LCB.all.delete(r)}
function lcDrop(C){for(const r of C.runs)if(r.parts)lcFreeRun(r)}
function lcFree(){for(const L of LAYERS){if(L.lc)lcDrop(L.lc);L.lc=null;L.lcNo=null}LCB.mem=0;LCB.all.clear()}
// fa posto: via le tele meno usate di recente (mai quelle già copiate in questo fotogramma)
function lcTrim(need){const old=[...LCB.all].filter(r=>r.used<LCB.f).sort((a,b)=>a.used-b.used);for(const r of old){if(LCB.mem+need<=LCB.max)break;lcFreeRun(r)}return LCB.mem+need<=LCB.max}
// lo stato del fotogramma per ogni strato da disegnare (L.lcA: 1 copia, 2 ridipingi e copia, 3 dal vivo; 0 com'era)
function lcPrep(list){const f=LCB.f,tol=LCB.tol/LCF.k,again=[],fine=[];
  for(const L of list){if(L.kind!=='L')continue;L.lcA=0;L.lcF=f;const p=L.prop;if(p.fade!=null&&p.fade<1)continue;const G=intraOrder(L);if(L.lcNo===G)continue;
    let C=L.lc;if(!C||C.G!==G){if(C)lcDrop(C);C=L.lc=lcBuild(L,G);if(!C){L.lcNo=G;continue}}for(const r of C.runs)if(r.parts)r.used=f;
    const pp=L.pp;let dc=1e9,df=1e9;if(C.pp&&C.pp.length===pp.length){dc=0;for(let i=0;i<pp.length;i++){const d=Math.abs(pp[i]-C.pp[i]);if(d>dc)dc=d}}
    if(C.lp&&C.lp.length===pp.length){df=0;for(let i=0;i<pp.length;i++){const d=Math.abs(pp[i]-C.lp[i]);if(d>df)df=d}}else C.lp=new Float64Array(pp.length);C.lp.set(pp);
    let ch=false;const why=W.dbg.lcWhy;for(const r of C.runs){if(!r.parts)continue;for(const t of r.parts){if(lcTouch(t)){ch=true;if(why)why[L.sid+' '+t.k]=(why[L.sid+' '+t.k]||0)+1}if(t.vis){const v=!!t.vis();if(v!==t._v){ch=true;t._v=v;if(why)why[L.sid+' vis']=(why[L.sid+' vis']||0)+1}}}}
    // (le trasparenze delle case si avvicinano al loro valore senza fermarsi mai del tutto: contano solo i 256 passi che si vedono)
    const hs=p.house;if(hs){const a=Math.round(hs.a*256),b=Math.round((hs.b==null?1:hs.b)*256),u=Math.round((hs.up||0)*256);if(a!==C.ha||b!==C.hb||u!==C.hu){ch=true;C.ha=a;C.hb=b;C.hu=u;if(why)why[L.sid+' casa']=(why[L.sid+' casa']||0)+1}}
    if(why&&df>tol*.5)why[L.sid+' piega']=(why[L.sid+' piega']||0)+1;
    if(ch)C.st=true;C.hot=ch||df>tol*.5?C.hot+1:0;
    // (la copia sta dove la mette la scala: con lo zoom che si assesta, lontano dall'angolo della mappa la differenza di scala sposta la copia)
    if(C.k!==LCF.k){const b=L.sb;dc+=Math.abs(C.k-LCF.k)/LCF.k*Math.max(Math.abs(b[0]),Math.abs(b[1]),Math.abs(b[2]),Math.abs(b[3]))}
    if(C.st||dc>tol){if(C.hot>=2){L.lcA=3;C.st=true}else{L.lcA=2;p._lcf=f}}else{L.lcA=1;again.push(L);if(LCB.rest&&dc>.02/LCF.k)fine.push([dc,L])}}
  // a telecamera ferma le copie tornano esatte: quelle fatte con la piega di poco diversa si ridipingono, poche per fotogramma (le più lontane prima)
  if(fine.length){fine.sort((a,b)=>b[0]-a[0]);for(const[,L] of fine){if(LCB.rN<=0)break;if(L.prop._lcf!==f){L.prop._lcf=f;LCB.rN--}}}
  for(const L of again)if(L.prop._lcf===f)L.lcA=2}
// dipinge una corsa nella sua tela (false: niente posto in memoria o troppo grande, si disegna dal vivo)
function lcPaint(r,hs){const k=LCF.k,pts=[];for(const t of r.parts)partPts(t,pts);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const q of pts){const s2=S(q[0],q[1],q[2]);if(s2[0]<x0)x0=s2[0];if(s2[0]>x1)x1=s2[0];if(s2[1]<y0)y0=s2[1];if(s2[1]>y1)y1=s2[1]}
  const M=4,X0=Math.floor(k*(x0-M)+LCF.e),Y0=Math.floor(k*(y0-M)+LCF.f),w=Math.ceil(k*(x1+M)+LCF.e)-X0,h=Math.ceil(k*(y1+M)+LCF.f)-Y0;if(!(w>0&&h>0)||w>2048||h>2048)return false;
  let cv=r.cv;if(!cv||cv.width<w||cv.height<h){const W2=w+8,H2=h+8,need=W2*H2*4-(cv?cv.width*cv.height*4:0);if(LCB.mem+need>LCB.max&&!lcTrim(need))return false;
    if(!cv)cv=r.cv=document.createElement('canvas');cv.width=W2;cv.height=H2;LCB.mem+=need;LCB.all.add(r)}
  const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,Math.max(w,r.w),Math.max(h,r.h));
  g.setTransform(k,0,0,k,LCF.e-X0,LCF.f-Y0);const sv=ctx;ctx=g;try{for(const t of r.parts)drawPartA(t,hs)}finally{ctx=sv}
  r.w=w;r.h=h;r.ox=X0-LCF.e;r.oy=Y0-LCF.f;return true}
// uno strato con le copie: le corse dipinte (ridipinte se serve) copiate 1:1, i disegni a mano dal vivo tra l'una e l'altra
function lcDraw(L){const C=L.lc,p=L.prop,hs=p.house,redo=L.lcA===2,k=LCF.k,N=LCB.n;LEANK=p.lk==null?1:p.lk;setRef(p.ref);ROTP=p.rot||null;
  try{for(const r of C.runs){if(r.fn){drawPartA(r.fn,hs);continue}if(r.dir){for(const t of r.parts)drawPartA(t,hs);continue}
      if(redo||!r.cv){if(!lcPaint(r,hs)){lcFreeRun(r);for(const t of r.parts)drawPartA(t,hs);N.vivo++;continue}N.dipinto++}else N.copia++;
      ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(r.cv,0,0,r.w,r.h,r.ox+LCF.e,r.oy+LCF.f,r.w,r.h);ctx.setTransform(k,0,0,k,LCF.e,LCF.f)}}
  finally{ROTP=null}
  if(redo){if(!C.pp||C.pp.length!==L.pp.length)C.pp=new Float64Array(L.pp.length);C.pp.set(L.pp);C.k=k;C.st=false}
  LEANK=1;setRef(null);if(!W.dbg.noFlames)for(const f of L.flames)drawFlame(f);return true}
// disegna uno strato: i contorni sciolti per primi, poi i gruppi nel loro ordine, poi le fiamme figlie
function drawPartA(t,hs){if(t.vis&&!t.vis())return;if(hs&&t.part){const a=alphaOf(hs,t.part);if(a<=0)return;if(a<1){ctx.save();ctx.globalAlpha*=a;drawPart(t);ctx.restore();return}}drawPart(t)}
function drawLayer(L){if(LCF&&L.lcA&&L.lcA<3&&ctx===LCF.ctx&&L.lc)return lcDraw(L);if(LCF&&L.lcA===3)LCB.n.vivo++;const p=L.prop,hs=p.house,fd=p.fade!=null&&p.fade<1;if(fd){if(p.fade<=0)return;ctx.save();ctx.globalAlpha*=p.fade}LEANK=p.lk==null?1:p.lk;setRef(p.ref);ROTP=p.rot||null;try{for(const t of L.loose)drawPartA(t,hs);const G=intraOrder(L);for(const g of G)for(const t of g.parts)drawPartA(t,hs)}finally{ROTP=null}
  LEANK=1;setRef(null);if(!W.dbg.noFlames)for(const f of L.flames)drawFlame(f);if(fd)ctx.restore()}// (p.fade: un prop che sparisce piano, le barriere a pagamento che si aprono)
// il riquadro a schermo del segugio: lungo ±12 nel verso in cui guarda
function houndSB(e,z){const c=Math.cos(z.face)*12,s=Math.sin(z.face)*12;for(const k of[-1,1]){const q=S(z.x+c*k,z.y+s*k,z.zh||0);e.sb[0]=Math.min(e.sb[0],q[0]-e.hw);e.sb[2]=Math.max(e.sb[2],q[0]+e.hw);e.sb[3]=Math.max(e.sb[3],q[1]+5)}}
// le voci di questo fotogramma, in ordine: [pavimenti, tutto il resto]
/* (FASE 9) un essere alto H in (x, y, z0) tocca lo schermo? la sua figura (piedi e testa con la piega) allargata di r; senza disegni di prova
   (ORD.HW) sempre sì */
function visB(x,y,z0,H,r){if(!ORD.HW||W.dbg.visAll)return true;const a=S(x,y,z0),b=S(x,y,z0+H);r+=LK*H;
  return Math.max(a[0],b[0])+r>CAM.x-ORD.HW&&Math.min(a[0],b[0])-r<CAM.x+ORD.HW&&Math.max(a[1],b[1])+r>CAM.y-CAM.oy-ORD.HH&&Math.min(a[1],b[1])-r<CAM.y-CAM.oy+ORD.HH}
function buildOrder(vis){const D=W.dbg,fl=[],li=[];psiUpdate();camStamp();UCAM=CAM.x*PC-CAM.y*PSN;
  if(D.ord==='ky'){// l'ordine di prima: prop interi per ky (kyFn), esseri per y, fiamme e corvi come voci; girando la V del punto (centro, ky)
    const h=W.hero,hx=h?h.x:0,K=(x,y)=>x*PSN+y*PC,kp=p=>CAM.rot?K((p.bx[0]+p.bx[2])/2,p.ky):(p.kyFn?p.kyFn(hx):p.ky),L2=[];
    for(const p of props){if(p.hide||!vis(p))continue;layerSB(p.whole);if(p.floor)fl.push(p.whole);else L2.push({k:kp(p),e:p.whole})}
    if(h&&!D.noHero&&!D.heroLast)L2.push({k:K(h.x,h.y+.01),e:beingE(HE,h.x,h.y,h.zh||0,56,10,RIGK.hzk,STAIRS.length&&h.zh>0?refAt(h.x,h.y):null)});
    for(const z of W.Z){if(z.id==null)z.id=++ZID;const e=z.E||(z.E={kind:'B',z,sid:'Z'+z.id,sk:900000+(z.id%99999)});L2.push({k:K(z.x,z.y+.01),e:beingE(e,z.x,z.y,z.zh||0,46*z.sc,10*z.sc,RIGK.mzk,STAIRS.length&&z.zh>0?refAt(z.x,z.y):null)})}
    if(!D.noFlames)for(const f of flames)L2.push({k:K(f.x,f.ky!=null?f.ky:f.y+.6),e:beingE(f.KE,f.x,f.y,f.z-4,10,4,CAM.CP,f.lvl!=null?f.ref:null)});
    for(const c of perches){if(c.away)continue;const ho=perchHost(c);L2.push({k:ho?kp(ho)+.05:K(c.x,c.y+.6),e:beingE(c.E,c.x,c.y,c.z,14,6,CAM.CP)})}
    for(const pt of W.pets||[]){const e=pt.E||(pt.E={kind:'B',pet:pt,sid:'P'+pt.i,sk:600000+pt.i});L2.push({k:K(pt.x,pt.y+.01),e:beingE(e,pt.x,pt.y,pt.zh||0,30,8,RIGK.mzk,STAIRS.length&&pt.zh>0?refAt(pt.x,pt.y):null)})}
    if(BOX)L2.push({k:K(BOX.x,BOX.y+.01),e:boxEntry()});
    L2.sort((a,b)=>a.k-b.k);return[fl,L2.map(o=>o.e)]}
  for(const p of props){if(p.hide||!vis(p))continue;for(const L of p.layers){layerSB(L);(L.floor?fl:li).push(L)}}
  const h=W.hero,rA=(x,y,z)=>STAIRS.length&&z>0?refAt(x,y):null;if(h&&!D.noHero&&!D.heroLast)li.push(beingE(HE,h.x,h.y,h.zh||0,56,10,RIGK.hzk,rA(h.x,h.y,h.zh||0)));
  for(const z of W.Z){if(z.id==null)z.id=++ZID;if(farV(z.x,z.y,90)||!visB(z.x,z.y,z.zh||0,(z.kind==='hound'?30:46)*z.sc,40))continue;const e=z.E||(z.E={kind:'B',z,sid:'Z'+z.id,sk:900000+(z.id%99999)}),hd=z.kind==='hound';beingE(e,z.x,z.y,z.zh||0,(hd?30:46)*z.sc,(hd?16:10)*z.sc,RIGK.mzk,rA(z.x,z.y,z.zh||0));if(hd)houndSB(e,z);li.push(e)}
  for(const c of perches){if(!c.away&&!farV(c.x,c.y,60)&&visB(c.x,c.y,c.z,14,30))li.push(beingE(c.E,c.x,c.y,c.z,14,6,CAM.CP))}
  // i compagni dell'eroe (compagni.js): esseri come gli zombie
  for(const pt of W.pets||[]){if(farV(pt.x,pt.y,60)||!visB(pt.x,pt.y,pt.zh||0,30,40))continue;const e=pt.E||(pt.E={kind:'B',pet:pt,sid:'P'+pt.i,sk:600000+pt.i});li.push(beingE(e,pt.x,pt.y,pt.zh||0,30,8,RIGK.mzk,rA(pt.x,pt.y,pt.zh||0)))}
  if(!D.noFlames)for(const f of FREEF)if(!farV(f.x,f.y,40)&&visB(f.x,f.y,f.z-4,14,30))li.push(beingE(f.E,f.x,f.y,f.z-4,10,4,CAM.CP,f.lvl!=null?f.ref:null));
  if(BOX)li.push(boxEntry());
  // con la zona chiusa velata e la telecamera che guarda verso di lei: prima tutto quello che sta di là dalla linea del confine, poi il velo, poi
  // il resto (il confine è una retta: chi sta tutto di là non può coprire chi sta di qua, come in un albero BSP)
  const kv=veilK();if(kv>0){const far=[],rest=[];for(const e of li)(sideOf(e)<0?far:rest).push(e);VEIL.k=kv;return[orderList(fl,ORD.fm),orderList(far,ORD.mm).concat([VEIL],orderList(rest,ORD.mn))]}
  return[orderList(fl,ORD.fm),orderList(li,ORD.mm)]}
// il velo di nebbia sopra una zona chiusa (W.split: {y, k, wisps, fade}): una sfumatura nel piano del terreno, trasparente sulla linea del confine
// e sempre più fitta verso il fondo, con banchi di nebbia che scorrono. La voce VEIL viene dopo tutto quello che sta di là (la sfumatura copre
// tutto il semipiano dello schermo oltre la linea, anche le cime alte) e prima del resto: muro, cancello ed eroe restano nitidi. Guardando di lato
// o all'indietro il velo copre solo il terreno (prima di tutte le voci)
const VEIL={kind:'V',sid:'V',sk:870000,sb:[0,0,0,0],k:0};
const veilK=()=>W.split&&!W.dbg.noSplit?W.split.k*cl(((CAM.rot?CAM.c:1)-.25)/.25,0,1):0;
function sideOf(e){const y=W.split.y;if(e.kind==='L'||e.kind==='T'){if(e.zs===undefined){let a=1e9,b=-1e9;for(const q of e.xy){if(q[1]<a)a=q[1];if(q[1]>b)b=q[1]}e.zs=b<y-1?-1:a>y+1?1:0}return e.zs}return e.y<y-7?-1:e.y>y+7?1:0}
function drawVeil(k){if(!W.split||k<=.001)return;const y=W.split.y,C='26,30,44';inGround(()=>{const g=ctx.createLinearGradient(0,y,0,y-7*T);
    g.addColorStop(0,`rgba(${C},0)`);g.addColorStop(.1,`rgba(${C},${.3*k})`);g.addColorStop(.4,`rgba(${C},${.58*k})`);g.addColorStop(1,`rgba(${C},${.8*k})`);ctx.fillStyle=g;ctx.fillRect(-W.w,y-60*T,W.w*3,60*T);
    if(!LOWFX&&W.split.wisps){const im=softImg();ctx.globalAlpha=.16*k;for(const m of W.split.wisps)ctx.drawImage(im,m.x-m.r,m.y-m.r*.5,m.r*2,m.r);ctx.globalAlpha=1}})}
// per le prove (ordine.js, giro.js): le voci con la loro geometria, i pezzi di uno strato nel mondo, la proiezione con la piega dello strato
function entryInfo(e,fl){const o={id:e.sid,kind:e.kind==='L'?(e.outl?'O':'L'):e.kind==='W'?'W':e.kind==='T'?'X':e.hero?'H':e.z?'Z':e.pc?'C':'F',floor:!!fl,sb:e.sb.slice(),z0:e.z0,z1:e.z1,cU:e.cU,cV:e.cV,H:(e.H||[]).map(q=>[q[0],q[1]])};
  if(e.kind==='L'||e.kind==='W'){const p=e.prop;o.prop=p.name;o.pi=p.i;o.li=e.li;o.xy=e.xy;o.part=e.part||null;o.alpha=p.house&&e.part?alphaOf(p.house,e.part):1}
  else if(e.kind==='T'){o.prop='bara';o.xy=e.xy;o.x=e.x;o.y=e.y}
  else{o.x=e.x;o.y=e.y;o.zh=e.zh;o.Hh=e.Hh;o.hw=e.hw;o.zk=e.zk;if(e.z){o.zkind=e.z.kind;o.sc=e.z.sc;o.rise=e.z.rise}}return o}
function primsOf(id){if(id==='X'&&BOX)return boxPrims();const L=ORD.byId.get(id);if(!L)return null;const out=[],hs=L.prop.house,R=L.prop.rot,w3=R?(q=>{const r=tP(R,q[0],q[1]);return[r[0],r[1],q[2]||0]}):(q=>q),wa=a=>R?a.map(w3):a;
  const P0=L.prop,hostOK=t=>{const hh=t.host||(t.o&&t.o.host);if(!hh)return true;LEANK=P0.lk==null?1:P0.lk;setRef(P0.ref);ROTP=P0.rot||null;const v=shoelace(hh.c.map(S))<0;ROTP=null;LEANK=1;setRef(null);return v};// (i pezzi appoggiati a una faccia girata di spalle non si disegnano)
  const add=t=>{if(!hostOK(t))return;const al=hs&&t.part?alphaOf(hs,t.part):1;switch(t.k){case'face':case'facepoly':out.push({t:'face',pts:wa(t.c),al});break;case'plane':out.push({t:'poly',pts:wa(t.c),al});break;case'poly':out.push({t:'poly',pts:wa(t.pts),al});break;
    case'line':out.push({t:'line',p0:w3(t.a),p1:w3(t.b),w:t.w||1,al});break;case'ball':out.push({t:'ball',p:w3(t.p),r:t.r,sq:t.sq||1,al});break;case'fn':if(t.rec&&t.rec.length)out.push({t:'pts',pts:wa(t.rec),rad:t.o.r||1.6,al});break}};
  if(L.kind==='W')for(const t of L.prop.parts)add(t);else for(const g of L.groups)for(const t of g.parts)add(t);return out}
function projOf(id,pts){const L=ORD.byId.get(id),p=L&&L.prop;LEANK=p&&p.lk!=null?p.lk:1;setRef(p?p.ref:null);const ce=Math.cos(CAM.el),se=Math.sin(CAM.el);
  const r=pts.map(q=>{const z=q[2]||0,s=S(q[0],q[1],z),v=(q[0]-CAM.x)*CAM.s+(q[1]-CAM.y)*CAM.c;return[s[0],s[1],v*ce+z*se]});LEANK=1;setRef(null);return r}
// il corvo posato si disegna subito dopo la cosa su cui sta (cercata una volta: il prop alto che lo contiene)
function perchHost(c){if(c._host!==undefined)return c._host;let best=null;for(const p of props){if(p.floor)continue;const b=p.bx;if(c.x<b[0]-6||c.x>b[2]+6||c.y<b[1]-6||c.y>b[3]+6||(b[4]||0)<c.z-15)continue;if(!best||p.ky>best.ky)best=p}return c._host=best}
function drawWorld(dt,view){const h0=houses[0],h0a=h0?h0.a:1,D=W.dbg;ZS.f++;ZS.need=Math.max(1,Math.ceil(ZS.n/(LOWFX?4:ZS.bud)));ZS.n=0;ZS.cv=ctx.canvas;
  // il terreno: quando è rimpicciolito più della metà (dpr·zoom < GT/2: un pixel copre più di due punti della foto, come nella vista intera su
  // uno schermo a 1×) la levigatura 'medium' (con le mipmap) evita lo sfarfallio girando; sopra la metà la levigatura normale basta e 'medium'
  // sul telefono sfocherebbe per niente. Vale per tutte e due le strade, dritta e girata, così non c'è un salto quando si comincia a girare o
  // la bussola riporta a nord. La scala vera è √|det|/SP = dpr·zoom (la componente a della matrice è dpr·zoom·cos ψ: girando scende a 0 e poi
  // sotto, e accendeva 'medium' per niente)
  const PH=D.costs?(k=>{ctx.getImageData(0,0,1,1);const t=performance.now();D.costs['#'+k]=(D.costs['#'+k]||0)+t-(PH.t||t);PH.t=t}):null;if(PH){PH.t=0;PH('prima')}
  const TM=D.tm,tk=TM?(k=>{ctx.getImageData(0,0,1,1);const t=performance.now();TM['w.'+k]=(TM['w.'+k]||0)+t-TM._w;TM._w=t}):null;if(TM)TM._w=performance.now();
  const ek=CAM.rot?edgeK():0;
  inGround(()=>{if(ek>0&&!LOWFX)drawEdge(ek);const m=ctx.getTransform(),sq=ctx.imageSmoothingQuality;if(Math.sqrt(Math.abs(m.a*m.d-m.b*m.c)/CAM.SP)<GT/2)ctx.imageSmoothingQuality='medium';
    const GR=W.ground;if(GR.tiles){const r=Math.hypot(view.Wp,view.Hp/CAM.SP)/2/CAM.z+96,cx=CAM.x,cy=CAM.y,oy=Math.abs(CAM.oy)/CAM.SP;for(const t of GR.tiles){if(t.x>cx+r||t.x+t.w<cx-r||t.y>cy+r+oy||t.y+t.h<cy-r-oy)continue;ctx.drawImage(t.c,0,0,t.c.width,t.c.height,t.x,t.y,t.w,t.h)}}
    else ctx.drawImage(GR,0,0,GR.width,GR.height,0,0,W.w,W.h);ctx.imageSmoothingQuality=sq;if(ek>0)drawRim(ek)});
  if(PH)PH('terreno');if(tk)tk('terreno');if(W.split)drawVeil(W.split.k-veilK());// il velo sul terreno quando non copre anche le cose (guardando di lato o all'indietro)
  // chi si vede: l'impronta del prop girata intorno al perno (u, v), allargata della piega più grande che può avere (LK·altezza di lato,
  // LKV in verticale) e di un margine; a vista dritta vale come prima (senza più il riquadro del mondo, che girando nasconderebbe cose)
  const HW=view.Wp/2/CAM.z+24,HH=view.Hp/2/CAM.z+24,c=CAM.c,s=CAM.s,SP=CAM.SP,CP=CAM.CP,oy=CAM.oy;ORD.HW=HW;ORD.HH=HH;VIEWR=Math.hypot(view.Wp,view.Hp/SP)/2/CAM.z+64+Math.abs(oy)/SP;
  const vis=D.visAll?()=>true:p=>{const f=fpOf(p),z1=f[4],ex=LK*z1*(p.lk==null?1:p.lk);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
    for(const X of[f[0],f[2]])for(const Y of[f[1],f[3]]){const dx=X-CAM.x,dy=Y-CAM.y,u=dx*c-dy*s,v=dx*s+dy*c;if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v}
    return u0-ex<HW&&u1+ex>-HW&&v1*SP+oy>-HH&&v0*SP-z1*CP-LKV*z1+oy<HH};
  // l'ordine (fase 3): i pavimenti (cumuli, pedane, gradini, tappeti) sotto i piedi di tutti, poi tutto ciò che sta in piedi, dal fondo verso
  // davanti, con gli esseri e i corvi posati in mezzo; le fiamme vengono subito dopo lo strato che le contiene
  const t0=D.prof?performance.now():0;ORD.fr++;ORD.cyc=0;ORD.tIntra=0;ORD.vis=vis;const[floors,order]=buildOrder(vis),t1=D.prof?performance.now():0;if(tk)tk('ordine');
  {const m=ctx.getTransform();LCF=!D.noLC&&!D.lcLive&&!CAM.rot&&m.b===0&&m.c===0&&m.a===m.d&&m.e===Math.round(m.e)&&m.f===Math.round(m.f)?{ctx,k:m.a,e:m.e,f:m.f}:null;LCB.T=[m.a,m.e,m.f];if(LCF){LCB.f++;const c=LCB.cam,mv=c?Math.max(Math.abs(CAM.x-c[0]),Math.abs(CAM.y-c[1]),Math.abs(CAM.oy-c[2])):1;LCB.cam=[CAM.x,CAM.y,CAM.oy];LCB.still=mv<.004?LCB.still+1:0;LCB.rest=LCB.still>=2;LCB.rN=8;lcPrep(floors.concat(order))}if(tk)tk('copie')}
  for(const L of floors)drawEntry(L,h0a);if(tk)tk('pavimenti');
  if(PH)PH('pavimenti');inGround(()=>drawClouds(dt));drawCrowShadows();drawLights(h0a);if(W.director&&W.director.drawGround)W.director.drawGround(dt);if(PH)PH('nuvole_luci');if(tk)tk('nuvole_luci');
  let hi=-1;const CO=D.costs;// W.dbg.costs: il costo vero di ogni voce (con la scheda grafica aspettata dopo ognuna), in D.costs
  for(let i=0;i<order.length;i++){const e=order[i];if(e.hero)hi=i;if(CO){const t0=performance.now();drawEntry(e,h0a);ctx.getImageData(0,0,1,1);const k=e.prop?e.prop.name+'#'+e.prop.i+(e.part?':'+e.part:''):e.sid;CO[k]=(CO[k]||0)+performance.now()-t0}else drawEntry(e,h0a)}
  if(D.heroLast&&!D.noHero&&W.hero)drawHero();if(tk)tk('voci');
  if(PH)PH('voci');const t2=D.prof?performance.now():0;LASTOCC=occluders(order,hi);silhouette(LASTOCC,h0a);if(PH)PH('sagoma');if(tk)tk('sagoma');ORD.last=order;ORD.lastF=floors;LASTLIST=order;
  if(D.prof){const a=.1;ORD.tOrd=t1-t0+ORD.tIntra;ORD.tSil=performance.now()-t2;ORD.pOrd+=(ORD.tOrd-ORD.pOrd)*a;ORD.pSil+=(ORD.tSil-ORD.pSil)*a}
  if(!LOWFX){for(const p of W.puffs){if(farV(p.x,p.y,40+p.z))continue;setRef(p.ref);const q=S(p.x,p.y,p.z);setRef(null);ctx.fillStyle=`rgba(150,150,165,${.28*(1-p.t/3.2)})`;ball(q,p.r);ctx.fill()}
    for(const l of W.leaves){if(farV(l.x,l.y,40))continue;const q=S(l.x,l.y,l.z);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(l.t*4+l.ph);ctx.fillStyle=l.c;ctx.beginPath();ctx.ellipse(0,0,2.6,1.2,0,0,TAU);ctx.fill();ctx.restore()}
    ctx.save();ctx.globalCompositeOperation='lighter';for(const f of W.flies){const q=S(f.x,f.y,f.z),b=.5+.5*Math.sin(W.t*3+f.ph);glow('170,255,120',q[0],q[1],9,.5*b);ctx.fillStyle=`rgba(230,255,190,${.9*b})`;ctx.fillRect(q[0]-.8,q[1]-.8,1.6,1.6)}ctx.restore()}
  for(const f of W.FX){if(f.k==='coin'){const t=SB(f.tw),k=1-f.t/f.t0,y=t[1]-k*26;ctx.save();ctx.globalAlpha=Math.min(1,f.t/.35);ctx.font='800 14px "Baloo 2",system-ui';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3.6;ctx.strokeStyle=INK;ctx.strokeText('+'+f.n,t[0],y);ctx.fillStyle='#ffd65a';ctx.fillText('+'+f.n,t[0],y);ctx.restore();continue}
    if(f.k==='boom'){const t=SB(f.tw),k=1-f.t/f.t0;ctx.save();ctx.globalCompositeOperation='lighter';glow('255,170,70',t[0],t[1]-10,f.r*(.6+k),.9*(1-k));ctx.restore();ctx.strokeStyle=`rgba(255,220,160,${.7*(1-k)})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(t[0],t[1],f.r*(.4+k),f.r*(.4+k)*.6*CAM.SP,0,0,TAU);ctx.stroke();continue}
    if(f.k==='faro'){const q=S(f.tw),al=Math.min(1,(f.t0-f.t)/.5)*Math.min(1,f.t/1.5),pu=.8+.2*Math.sin(W.t*6),H=190*CAM.CP;ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';
      const g=ctx.createLinearGradient(0,q[1],0,q[1]-H);g.addColorStop(0,`rgba(120,255,160,${.42*al*pu})`);g.addColorStop(1,'rgba(120,255,160,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(q[0]-15,q[1]);ctx.lineTo(q[0]+15,q[1]);ctx.lineTo(q[0]+6,q[1]-H);ctx.lineTo(q[0]-6,q[1]-H);ctx.closePath();ctx.fill();
      const r=26+((f.t0-f.t)*30)%40;ctx.strokeStyle=`rgba(150,255,180,${.5*al*(1-((f.t0-f.t)*30%40)/40)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.5*CAM.SP,0,0,TAU);ctx.stroke();ctx.restore();continue}
    if(f.k==='shot'){const g=SB(f.hw),t=SB(f.tw),a=[g[0]+f.ao[0],g[1]+f.ao[1]],pc=f.pap>=2?'212,139,255':f.pap?'143,230,255':null;ctx.strokeStyle=pc?`rgba(${pc},.95)`:'rgba(255,230,160,.9)';ctx.lineWidth=f.w||2;seg(a,[t[0]+f.bo[0],t[1]+f.bo[1]]);ctx.stroke();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(pc||'255,210,120',a[0],a[1],14,.8);if(pc)glow(pc,t[0]+f.bo[0],t[1]+f.bo[1],10,.6);ctx.restore()}}
    else{const t=SB(f.tw);ctx.fillStyle='#3a5a1e';ball([t[0]+f.x,t[1]+f.y],1.8);ctx.fill()}}
  if(W.director&&W.director.drawTop)W.director.drawTop(dt);if(liveDraw)liveDraw(dt);drawMist(dt);drawFlock();if(PH)PH('effetti_nebbia');if(tk)tk('effetti');LCF=null}
function updateAmbient(dt){W.t+=dt;updateCrows(dt);
  if(W.split){const sp=W.split;if(sp.fade){sp.k-=dt/2.5;if(sp.k<=0){W.split=null}}if(sp.wisps)for(const m of sp.wisps){m.x+=m.v*dt;if(m.x>W.w+m.r)m.x=-m.r}}
  if(LOWFX)return;
  for(const f of W.flies){f.a+=dt*(Math.sin(W.t*.7+f.ph)*1.6);f.x+=Math.cos(f.a)*14*dt;f.y+=Math.sin(f.a)*14*dt;f.z=cl(f.z+Math.sin(W.t*2+f.ph)*8*dt,4,50);if(f.x<0)f.x=W.w;if(f.x>W.w)f.x=0;if(f.y<0)f.y=W.h;if(f.y>W.h)f.y=0}
  for(const s of smokes){s.t-=dt;if(s.t<=0){s.t=.22;if(!nearScr(s.x,s.y,200))continue;W.puffs.push({x:s.x+rr(-3,3),y:s.y+rr(-3,3),z:s.z,t:0,r:rr(4,6),ref:s.ref})}}
  for(const p of W.puffs){p.t+=dt;p.z+=16*dt;p.x+=10*dt;p.r+=5*dt}for(let i=W.puffs.length-1;i>=0;i--)if(W.puffs[i].t>3.2)W.puffs.splice(i,1);
  for(const tr of W.leafTrees||[])if(Math.random()<dt*.8&&nearScr(tr[0],tr[1],160))W.leaves.push({x:tr[0]+rr(-40,40),y:tr[1]+rr(-40,40),z:rr(70,90),t:0,ph:rr(0,6),c:['#a8562a','#c87a2a','#d0a040'][Math.floor(Math.random()*3)]});
  for(const l of W.leaves){l.t+=dt;l.z-=14*dt;l.x+=Math.sin(l.t*3+l.ph)*20*dt+6*dt}for(let i=W.leaves.length-1;i>=0;i--)if(W.leaves[i].z<0)W.leaves.splice(i,1)}
// ------------------------------------------------------------------ le aree (area_mappa.js) si registrano in AREE; anteprima(id) costruisce e accende
// quella della pagina di prova (anteprime/zombie/mk.py), il gioco vero la costruisce col menu (src/js/63-zombie.js)
const AREE={};function anteprima(id){// (la pagina di prova si apre subito sulla mappa: niente schermata d'avvio del gioco)
  try{if(typeof LOAD!=='undefined'){BOOTS.ready=BOOTS.gone=true;LOAD.hide(true)}}catch(e){}const go=()=>boot(AREE[id]);if(document.readyState==='complete')setTimeout(go,300);else addEventListener('load',()=>setTimeout(go,300))}
// ------------------------------------------------------------------ la pagina: tela, levetta, telecamera, bussola, bottoni
// boot(area, o): costruisce la mappa una volta e la pagina sopra il gioco. Per l'anteprima (o vuoto) parte subito, coi bottoni di prova; nel
// gioco vero (o.game, src/js/63-zombie.js) resta spenta finché il menu non la accende e restituisce {start, stop, nuova, pausa}: o.fine(oro,
// round, uccisi) avvisa il gioco a fine partita, o.esci() quando si torna al menu
// bootAsync(area, o): la costruzione a pezzi del gioco vero (src/js/63-zombie.js). Gli stessi passi di boot (area.build, la cottura del
// terreno, finalize, navBuild), nello stesso ordine e con gli stessi semi (la mappa viene uguale), fatti circa 12 ms alla volta con il
// telefono libero in mezzo: la schermata di caricamento si muove e niente si blocca. o.passo(k) riceve a che punto è (da 0 a 1, contando le
// pause: area.passi è quante sono di solito, poi quante erano davvero). Restituisce la promessa del controllo di boot (o.built: già costruita)
function inPezzi(it,o,N){return new Promise((ok,ko)=>{let n=0;const run=()=>{const ts=performance.now();let done=false;STEP=true;
    try{while(performance.now()-ts<12){const t1=performance.now(),r=it.next(),d=performance.now()-t1;if(d>60)(W.dbg.lenti=W.dbg.lenti||[]).push([n,Math.round(d),r.value]);if(r.done){done=true;break}n++}}catch(e){BAKEQ=null;ko(e);return}finally{STEP=false}
    if(!done){if(o.passo)o.passo(Math.min(.97,n/N));setTimeout(run,0);return}ok(n)};setTimeout(run,0)})}
let JOBS=null;// i lavori di cottura dell'area (per rifarli dopo libera)
function bootAsync(area,o){o=o||{};const keep=[window.CR&&CR.cam?Object.assign({},CR.cam):null,typeof RIGCAM!=='undefined'?Object.assign({},RIGCAM):null];
  const steps=function*(){const t0=performance.now();W.dbg.tstart=t0;BAKEQ=[];let q;try{area.build()}finally{q=BAKEQ;BAKEQ=null}JOBS=q;const t1=performance.now();yield;
    for(const[w,h,p] of q)yield* bakeSteps(w,h,p);const t2=performance.now();yield* finalizeSteps();const t3=performance.now();yield;navBuild();
    W.dbg.tb={build:t1-t0,bake:t2-t1,finalize:t3-t2,nav:performance.now()-t3,pezzi:1}};
  return inPezzi(steps(),o,area.passi||60).then(n=>{area.passi=n;W.dbg.passi=n;
    // i personaggi del menu restano come erano (boot li tiene da parte appena parte, per rimetterli tornando al menu)
    if(keep[0])Object.assign(CR.cam,keep[0]);if(keep[1])Object.assign(RIGCAM,keep[1]);
    const tb=performance.now(),ctl=boot(area,Object.assign({},o,{built:true}));W.dbg.tboot=performance.now()-tb;if(o.passo)o.passo(1);return ctl})}
// la memoria (src/js/65-caricamento.js): con la mappa spenta e il gioco in secondo piano si butta la foto del terreno (30 MB, la cosa più
// grande della mappa); ricuoci(o) la rifà a pezzi prima di riaccendere la mappa: gli stessi passi e lo stesso seme, viene uguale
function libera(){if(!JOBS||!W.ground)return false;lcFree();if(W.ground.tiles)for(const t of W.ground.tiles)t.c.width=t.c.height=0;else W.ground.width=W.ground.height=0;W.ground=null;return true}
function ricuoci(o){o=o||{};if(W.ground||!JOBS)return Promise.resolve(0);const sd=seed;
  return inPezzi((function*(){for(const[w,h,p] of JOBS)yield* bakeSteps(w,h,p)})(),o,JOBS.passi||40).then(n=>{JOBS.passi=n;seed=sd;if(o.passo)o.passo(1);return n})}
function boot(area,o){o=o||{};const GAME=!!o.game;let ACT=!GAME,RUN=false,PAUSE=false;W.gioco=GAME?o:null;W.zoneAt=(x,y)=>area.zoneName?area.zoneName({x,y}):'';W.zoneIdAt=(x,y)=>area.zoneId?area.zoneId({x,y}):null;
  // la telecamera della mappa inclina anche i personaggi (CR.cam, RIGCAM, in camRig): nel gioco si tengono quelli del menu appena lo si lascia
  // (prima di costruire o di rimettere a posto la mappa) e tornando al menu si rimettono
  let crKeep=null,rgKeep=null;const keepCam=()=>{if(!GAME||crKeep||rgKeep)return;crKeep=window.CR&&CR.cam?Object.assign({},CR.cam):null;rgKeep=typeof RIGCAM!=='undefined'?Object.assign({},RIGCAM):null};keepCam();
  if(!GAME){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}}
  // niente atmosfera del sotterraneo classico (vento dell'abisso, respiro della bestia) mentre la mappa zombie è accesa: quella sua verrà con l'audio
  try{const _s=ambStart;ambStart=function(k){if(!ACT)return _s(k);_s(null);AMB.kind=k}}catch(e){}
  if(!o.built){const tb0=performance.now();W.dbg.tstart=tb0;area.build();const tb1=performance.now();finalize();const tb2=performance.now();navBuild();W.dbg.tb={build:tb1-tb0,bake:W.dbg.tbake||0,finalize:tb2-tb1,nav:performance.now()-tb2}}setTimeout(warmIntra,800);if(window.ARMI){try{gunState=ARMI.nuova('pistola');HSTYLE.gun=W.gunId='pistola'}catch(e){gunState=null}}
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
  #mz .gun{position:absolute;left:14px;top:calc(44px + env(safe-area-inset-top,0px));font:700 13px "Baloo 2",system-ui;color:#d8cfb8;text-shadow:0 2px 0 #000;pointer-events:none;white-space:nowrap}
  #mz .gun b{font:400 15px "Lilita One",system-ui;letter-spacing:.02em;color:#efe6d0;margin-right:6px}
  #mz .toast{position:absolute;left:50%;top:calc(80px + env(safe-area-inset-top,0px));transform:translate(-50%,-6px);opacity:0;transition:opacity .25s,transform .25s;font:400 18px "Lilita One",system-ui;letter-spacing:.02em;color:#ffe9a8;text-shadow:0 2px 0 #000,0 0 14px rgba(0,0,0,.7);pointer-events:none;white-space:nowrap}
  #mz .toast.on{opacity:1;transform:translate(-50%,0)}
  #mz .buy{position:absolute;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(178px,46vw);box-sizing:border-box;padding:9px 10px 10px;border-radius:14px;background:#2b2622;border:2.5px solid #000;box-shadow:0 4px 0 #000,inset 0 2px 0 rgba(255,240,210,.12);text-align:center;color:#efe6d0;touch-action:none;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent}
  #mz .buy::before{content:'';position:absolute;left:0;top:0;bottom:0;width:var(--p,0%);background:linear-gradient(#d29a34,#8a5a14);opacity:.6}
  #mz .buy .t1{position:relative;font:400 15px "Lilita One",system-ui;letter-spacing:.02em;line-height:1.15;text-shadow:0 2px 0 #000}
  #mz .buy .t2{position:relative;font:700 12.5px "Baloo 2",system-ui;opacity:.92;margin-top:2px}
  #mz .buy .t2 b{color:#ffd65a}#mz .buy.poor .t2 b{color:#ff8a70}
  #mz .buy.no{animation:mzno .35s}@keyframes mzno{25%{transform:translateX(calc(-50% - 6px))}75%{transform:translateX(calc(-50% + 6px))}}
  #mz .hint{position:absolute;left:0;right:0;bottom:100px;text-align:center;font-size:13px;line-height:1.35;opacity:.65;pointer-events:none;transition:opacity 1s}
  #mz[hidden]{display:none!important}#mz.game .bar{display:none}#mz.game .hint{bottom:calc(64px + env(safe-area-inset-bottom,0px))}
  #mz .tl{display:flex;align-items:center;gap:10px;min-width:0}#mz .tl h1{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #mz .pz{pointer-events:auto;flex:none;width:38px;height:38px;padding:0;display:flex;align-items:center;justify-content:center;gap:5px;border-radius:12px;background:#3a332d;-webkit-tap-highlight-color:transparent}
  #mz .pz i{display:block;width:5px;height:15px;border-radius:2px;background:#efe6d0;box-shadow:0 1px 0 #000}
  #mz .pausa{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:rgba(6,6,10,.72);touch-action:none}
  #mz .pausa .mzbox{width:min(290px,82vw);box-sizing:border-box;padding:18px 18px 20px;border-radius:18px;background:linear-gradient(#3a332d,#26211d);border:3px solid #000;box-shadow:0 6px 0 #000,inset 0 2px 0 rgba(255,240,210,.14),0 0 0 2px #8a7a62;display:flex;flex-direction:column;gap:9px;text-align:center}
  #mz .pausa h2{margin:0 0 2px;font:400 30px "Lilita One",system-ui;letter-spacing:.03em;color:#efe6d0;text-shadow:0 3px 0 #000}
  #mz .pausa p{margin:0 0 4px;font:700 14px "Baloo 2",system-ui;opacity:.9}#mz .pausa p b{font:400 17px "Lilita One",system-ui;color:#ffd65a}
  #mz .pausa button{font:400 18px "Lilita One",system-ui;letter-spacing:.02em;padding:9px 12px;border-radius:13px}
  #mz .pausa button.mzgo{color:#1b120a;background:linear-gradient(#ffd65a,#d6982a)}#mz .pausa button.mzout{background:#5a2420;color:#ffd9cf}
  #mz .pausa .mzsure{display:flex;flex-direction:column;gap:9px;margin-top:4px;padding-top:10px;border-top:2px dashed rgba(239,230,208,.25)}
  </style><canvas id="mzCv"></canvas><div class="top"><div class="tl">${GAME?'<button class="pz" id="mzPz" aria-label="Pausa"><i></i><i></i></button>':''}<h1>${area.title||'Mappa zombie'}</h1></div><span class="cash" id="mzCash"></span></div>
  <div class="nord" id="mzNord" role="button" aria-label="Torna a nord" title="Torna a nord (N)"><canvas></canvas></div>
  <div class="hint" id="mzHint"></div><div class="gun" id="mzGun"></div><div class="toast" id="mzToast"></div><div class="buy" id="mzBuy" hidden><div class="t1"></div><div class="t2"></div></div><div class="bar" id="mzBar"></div>
  ${GAME?'<div class="pausa" id="mzPausa" hidden><div class="mzbox"><h2>Pausa</h2><p class="mzpi"></p><button class="mzgo" data-a="su">Riprendi</button><button data-a="sfx"></button><button class="mzout" data-a="esci">Esci dalla partita</button><div class="mzsure" hidden><p></p><button class="mzout" data-a="si">Esci</button><button data-a="no">Resta</button></div></div></div>':''}`;
  document.body.appendChild(ov);if(GAME){ov.hidden=true;ov.classList.add('game')}
  // il bottone per comprare (cancello, armi a muro, Bara): compare quando l'eroe è vicino a qualcosa che si compra; si tiene premuto (dito,
  // mouse, Spazio o Invio) finché la barra d'oro è piena; senza monete abbastanza trema. Dopo un acquisto va staccato prima del prossimo
  const buyEl=ov.querySelector('#mzBuy'),gunEl=ov.querySelector('#mzGun'),toastEl=ov.querySelector('#mzToast');let buyHold=false,buyP=0,buyCur=null,buyKey='',buyLock=false,gunKey='',toastT=0,titleTxt=area.title;const titleEl=ov.querySelector('h1');
  buyEl.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();buyHold=true;try{buyEl.setPointerCapture(e.pointerId)}catch(_){}});
  for(const t of['pointerup','pointercancel','lostpointercapture'])buyEl.addEventListener(t,()=>{buyHold=false;buyLock=false});
  function uiStep(dt){const h=W.hero;let best=null,bd=1e9;for(const o of buys){if(h.cl||(o.lv||0)!==(h.lv||0)||(o.show&&!o.show()))continue;const d=Math.hypot(h.x-o.x,h.y-o.y);if(d<o.r&&d<bd){bd=d;best=o}}
    const kh=!!(keys.Space||keys.Enter),holding=(buyHold||kh)&&!buyLock;if(best!==buyCur){buyCur=best;buyP=0;if(buyHold||kh)buyLock=true}
    // (o.hold: i secondi da tenere premuto, 0,65 se manca; o.rep: si ripete finché si tiene premuto, come le assi della riparazione, e intanto
    // l'eroe lavora: W.hero.busy; o.sub(): la riga sotto il nome)
    W.hero.busy=null;W.hero.busyP=buyP;
    if(best){const pr=best.price(),ok=W.coins>=pr;if(holding&&ok&&best.rep)W.hero.busy=best;if(holding&&ok){buyP+=dt/(best.hold||.65);if(buyP>=1){buyP=0;const r=best.act();if(!best.rep||r===false)buyLock=true;buyKey=''}}else buyP=Math.max(0,buyP-dt*3);
      if(holding&&!ok){if(!best.shk){best.shk=1;buyEl.classList.remove('no');void buyEl.offsetWidth;buyEl.classList.add('no')}}else best.shk=0;
      const sub=best.sub?best.sub():null,key=best.label()+'|'+pr+'|'+ok+'|'+sub;if(key!==buyKey){buyKey=key;const n=pr.toLocaleString('it-IT');buyEl.querySelector('.t1').textContent=best.label();buyEl.querySelector('.t2').innerHTML=sub!=null?sub:pr?(ok?'Tieni premuto · <b>● '+n+'</b>':'Servono <b>● '+n+'</b>'):'Tieni premuto';buyEl.classList.toggle('poor',!ok)}
      buyEl.style.setProperty('--p',(buyP*100).toFixed(1)+'%')}
    const show=!!best&&hudOn&&!whole;if(buyEl.hidden===show)buyEl.hidden=!show;
    // l'arma in mano e i colpi; i messaggi brevi (W.toast = [testo, secondi])
    const g=gunState;if(g){const k=W.gunId+'|'+g.mag+'|'+g.res+'|'+(g.st==='ricarica')+'|'+(g.nome||'')+'|'+!!W.hero.unarmed;if(k!==gunKey){gunKey=k;gunEl.innerHTML=W.hero.unarmed?'<b>Senz\'arma</b>sull\'incudine':'<b'+(g.pap?' style="color:'+(g.pap>=2?'#d9a4ff':'#a6ecff')+'"':'')+'>'+(g.nome||g.D.n)+'</b>'+(g.st==='ricarica'?'ricarica…':g.mag+' / '+(W.gunId==='pistola'?'∞':g.res))}}
    if(area.zoneName){const n=area.zoneName(W.hero);if(n!==titleTxt){titleTxt=n;titleEl.textContent=n}}// il nome della zona dove sta l'eroe
    if(W.toast){toastEl.textContent=W.toast[0];toastEl.classList.add('on');toastT=W.toast[1];W.toast=null}if(toastT>0&&(toastT-=dt)<=0)toastEl.classList.remove('on')}
  const cv=ov.querySelector('#mzCv'),barEl=ov.querySelector('#mzBar'),cashEl=ov.querySelector('#mzCash'),hintEl=ov.querySelector('#mzHint'),nordEl=ov.querySelector('#mzNord'),ncv=nordEl.querySelector('canvas');let low=false,whole=false;
  const ui=()=>{barEl.innerHTML='';if(GAME)return;const mk=(t,on,f)=>{const b=document.createElement('button');b.textContent=t;b.className=on?'on':'';b.onclick=()=>{f();ui()};barEl.appendChild(b)};
    mk('Zombie',zOn,()=>{zOn=!zOn});mk('Effetti bassi',low,()=>{low=!low});mk('Vista intera',whole,()=>{whole=!whole});
    mk('Suono',(()=>{try{return AU.on.sfx&&!!AU.ctx}catch(e){return false}})(),()=>{try{if(!AU.ctx){initAudio();AU.on.sfx=true}else AU.on.sfx=!AU.on.sfx;audioSettings();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume()}catch(e){}})};ui();
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
  ov.addEventListener('pointerdown',e=>{if(e.target.closest('.bar,.nord,.buy,.pz,.pausa,.fine'))return;const s=roleFor(e);if(!s)return;e.preventDefault();
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
  // (nel gioco vero i tasti non arrivano al gioco classico sotto; Esc o P mettono in pausa)
  addEventListener('keydown',e=>{if(!ACT)return;const k=KC(e);if(GAME){e.stopPropagation();if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(k))e.preventDefault()}
    if(GAME&&(k==='Escape'||k==='KeyP')){if(!e.repeat&&matchOn())setPause(!PAUSE);return}if(PAUSE)return;
    keys[k]=1;if(e.repeat)return;if(k==='KeyN'||k==='Home')goNorth();if(k==='KeyV'&&!GAME){whole=!whole;ui()}},true);
  addEventListener('keyup',e=>{if(!ACT)return;if(GAME)e.stopPropagation();const k=KC(e);keys[k]=0;if(k==='Space'||k==='Enter')buyLock=false},true);
  const reset=()=>{stick.id=null;if(look.id!=null)lookEnd();for(const k in keys)keys[k]=0};addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden){reset();if(GAME&&ACT&&matchOn())setPause(true)}});
  // la telecamera: niente inerzia (resta dove la lasci), solo un ammortizzatore di ~0,1 s verso il punto voluto; la bussola fa il ritorno in 0,45 s
  function camInput(dt){const kr=(K('KeyQ','KeyJ')?1:0)-(K('KeyE','KeyL')?1:0),ke=(K('KeyF','KeyK')?1:0)-(K('KeyR','KeyI')?1:0);
    if(kr||ke){cam.ret=null;cam.yawT+=kr*150*DEG*dt;cam.elRaw=cam.elT=cl(cam.elT+ke*45*DEG*dt,ELMIN,ELMAX)}
    if(Math.abs(cam.yawT)>Math.PI){const n=wrapA(cam.yawT);CAM.yaw+=n-cam.yawT;cam.yawT=n}// giri interi tolti a tutti e due: non si vede
    if(cam.ret){const r=cam.ret;r.t=Math.min(1,r.t+dt/.45);const k=ez(r.t);CAM.yaw=cam.yawT=r.y0*(1-k);CAM.el=cam.elT=cam.elRaw=r.e0+(EL0-r.e0)*k;if(r.t>=1)cam.ret=null}
    else{const k=1-Math.exp(-dt*22);CAM.yaw+=(cam.yawT-CAM.yaw)*k;CAM.el+=(cam.elT-CAM.el)*k;if(Math.abs(cam.yawT-CAM.yaw)<1e-4)CAM.yaw=cam.yawT;if(Math.abs(cam.elT-CAM.el)<1e-4)CAM.el=cam.elT}
    if(look.id==null)look.t+=dt;DRAG=look.on;camDerive()}
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
  // (nel gioco con la qualità «bassa» meno pixel, come la tela del gioco: resize() in 45-render.js)
  const DPR=()=>Math.min(GAME&&typeof SAVE!=='undefined'&&SAVE.set&&SAVE.set.q==='bassa'?1.25:2,window.devicePixelRatio||1);let dpr=DPR(),hintT=0;let last=performance.now(),ms=0,zoomOv=0,camOv=null,wholeFit=null,hudOn=true;
  // da coordinate dello schermo-mondo (quelle che escono da S) a pixel della tela: il perno CAM sta oy sotto il centro
  const scr=(X,Y)=>[dpr*(ov.clientWidth/2+(X-CAM.x)*CAM.z),dpr*(ov.clientHeight/2+(Y-CAM.y+CAM.oy)*CAM.z)];
  // vista intera: la mappa con le cime (fino a 90) inquadrata per la telecamera di riposo (yawT, elT); mentre il dito gira resta ferma (niente
  // zoom che respira girando), quando si lascia si riassesta piano
  function fitWhole(Wp,Hp){const c=Math.cos(cam.yawT),s=Math.sin(cam.yawT),SP=Math.SQRT2*Math.sin(cam.elT),CP=Math.SQRT2*Math.cos(cam.elT),cx=W.w/2,cy=W.h/2;let X0=1e9,X1=-1e9,Y0=1e9,Y1=-1e9;
    for(const[x,y] of[[0,0],[W.w,0],[W.w,W.h],[0,W.h]]){const dx=x-cx,dy=y-cy,u=dx*c-dy*s,v=dx*s+dy*c;for(const z of[0,90]){const Y=v*SP-z*CP;X0=Math.min(X0,u);X1=Math.max(X1,u);Y0=Math.min(Y0,Y);Y1=Math.max(Y1,Y)}}
    return[Math.min(Wp/(X1-X0+60),(Hp-150)/(Y1-Y0+30)),-(Y0+Y1)/2-10]}
  function render(dt,ix,iy){const Wp=ov.clientWidth,Hp=ov.clientHeight;if(cv.width!==Math.round(Wp*dpr)||cv.height!==Math.round(Hp*dpr)){cv.width=Math.round(Wp*dpr);cv.height=Math.round(Hp*dpr)}
    const saved=ctx,lf=LOWFX;ctx=cv.getContext('2d');LOWFX=GAME?lf:low;const t0=performance.now();if(typeof glowTick==='function')glowTick();
    try{/* W.dbg.tm={}: i tempi delle parti del fotogramma (tempi_grande.js e le misure del punto 54) */const TM=W.dbg.tm,tk=TM?(k=>{const t=performance.now();TM[k]=(TM[k]||0)+t-TM._;TM._=t}):null;if(TM)TM._=performance.now();updateBeings(dt,{x:ix,y:iy});if(tk)tk('beings');updateAmbient(dt);if(tk)tk('ambient');if(area.update)area.update(dt);if(tk)tk('area');
      const h=W.hero;let tx,ty,z,oyT;
      if(camOv){tx=camOv[0];ty=camOv[1];z=zoomOv||Wp/330;oyT=0}
      else if(whole){if(!wholeFit||look.id==null)wholeFit=fitWhole(Wp,Hp);tx=W.w/2;ty=W.h/2;z=zoomOv||wholeFit[0];oyT=wholeFit[1]}
      else{const lk=(h.lvz||0)*CAM.CP/CAM.SP;tx=h.x-CAM.s*lk;ty=h.y-CAM.c*lk;z=zoomOv||Wp/330;oyT=24*CAM.CP}// l'eroe è il perno: girando resta fermo sullo schermo; sta 24 px (più alto se inclinato) sotto il centro
      const k6=Math.min(1,dt*6);CAM.z+=(z-CAM.z)*Math.min(1,dt*8);CAM.x+=(tx-CAM.x)*k6;CAM.y+=(ty-CAM.y)*k6;CAM.oy+=(oyT-CAM.oy)*k6;camDerive();
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0b0c12';ctx.fillRect(0,0,Wp,Hp);if(area.backdrop)area.backdrop(Wp,Hp);
      // (FASE 9) a vista dritta la telecamera sta su pixel interi della tela: le copie degli strati fermi (lcDraw) cadono 1:1
      {const k=dpr*CAM.z,ex=dpr*(Wp/2-CAM.x*CAM.z),ey=dpr*(Hp/2+(CAM.oy-CAM.y)*CAM.z),pin=!CAM.rot&&!W.dbg.noLC;ctx.setTransform(k,0,0,k,pin?Math.round(ex):ex,pin?Math.round(ey):ey)}
      if(tk){ctx.getImageData(0,0,1,1);tk('backdrop')}drawWorld(dt,{Wp,Hp});if(tk){ctx.getImageData(0,0,1,1);tk('world')}
      drawDark(cv.width,cv.height,(x,y,r)=>{const p=scr(x,y);return[p[0],p[1],r*CAM.z*dpr]},houses[0]?houses[0].a:1);if(tk){ctx.getImageData(0,0,1,1);tk('dark')}
      ctx.setTransform(dpr,0,0,dpr,0,0);if(!W.dbg.noSticks&&!whole){drawStick(stick,64,Hp-196);drawLook(Wp-64,Hp-196)}
      zVig(Wp,Hp);
      const show=hudOn&&!W.dbg.noSticks;if(nordEl.hidden===show)nordEl.hidden=!show;if(show)drawNord();if(tk){ctx.getImageData(0,0,1,1);tk('hud')}
    }catch(e){console.error(e)}finally{ms=ms*.93+(performance.now()-t0)*.07;ctx=saved;LOWFX=lf}}
  /* la vignetta (FASE 9 del gioco, «più fluido sul telefono»): la sfumatura su tutto lo schermo si prepara una volta alla misura della tela e
     poi si copia 1:1 a bande, saltando il centro trasparente (il cerchio di raggio min(Wp,Hp)·0,4); identica a prima */
  let ZV=null;
  function zVig(Wp,Hp){const W0=cv.width,H0=cv.height,key=W0+'x'+H0+'@'+dpr;
    if(!ZV||ZV.key!==key){if(ZV)ZV.c.width=ZV.c.height=0;const c=document.createElement('canvas');c.width=W0;c.height=H0;const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
      const vg=g.createRadialGradient(Wp/2,Hp/2,Math.min(Wp,Hp)*.4,Wp/2,Hp/2,Math.max(Wp,Hp)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=vg;g.fillRect(0,0,Wp,Hp);
      const cx=dpr*Wp/2,cy=dpr*Hp/2,R=dpr*Math.min(Wp,Hp)*.4-1,B=[];
      for(let y0=0;y0<H0;y0+=32){const y1=Math.min(H0,y0+32),dy=Math.max(Math.abs(y0-cy),Math.abs(y1-cy)),hw=dy<R?Math.sqrt(R*R-dy*dy):0,a=Math.max(0,Math.ceil(cx-hw)),b=Math.min(W0,Math.floor(cx+hw));B.push(hw>1&&b>a?[y0,y1-y0,a,b]:[y0,y1-y0,W0,W0])}
      ZV={key,c,B}}
    ctx.save();ctx.setTransform(1,0,0,1,0,0);for(const[y0,bh,a,b] of ZV.B){if(a>0)ctx.drawImage(ZV.c,0,y0,a,bh,0,y0,a,bh);if(b<W0)ctx.drawImage(ZV.c,b,y0,W0-b,bh,b,y0,W0-b,bh)}ctx.restore()}
  let fEma=.016,slowZ=0,slowR=0;/* DPRCUT: abbassata una volta, resta così per le partite dopo (niente 2 s di scatti a ogni partita) */
  function frame(now){if(!ACT){RUN=false;return}// la pagina spenta (nel gioco vero, col menu) non disegna niente
    if(W.dbg.halt){last=now;requestAnimationFrame(frame);return}// W.dbg.halt: le prove ferme il ciclo dei fotogrammi (misure senza disturbi)
    const raw=Math.max(0,(now-last)/1000),rdt=Math.min(.05,raw);last=now;camInput(Math.min(.1,raw));// la telecamera va col tempo vero anche a mondo fermo (W.dbg.freeze)
    // qualità automatica come nel gioco: se i fotogrammi restano lenti per 2,5 s gli effetti si abbassano (LOWFX)
    // (difetti 48) prima la risoluzione: se per 2 s i fotogrammi non stanno nei 60 al secondo la mappa passa da 2 a 1,5 pixel per punto (a vista
    // quasi uguale, quasi la metà dei pixel da colorare); solo se non basta si abbassano anche gli effetti, come prima
    if(GAME&&!PAUSE&&raw<.2){fEma+=(raw-fEma)*.05;const au=typeof SAVE!=='undefined'&&SAVE.set&&SAVE.set.q==='auto';
      if(au&&dpr>1.5&&fEma>.0185){slowR+=raw;if(slowR>2){dpr=1.5;DPRCUT=true;slowR=0;fEma=.0167}}else slowR=0;
      if(au&&!LOWFX&&dpr<=1.5&&fEma>.026){slowZ+=raw;if(slowZ>2.5)LOWFX=true}else slowZ=0}
    let[ix,iy]=vec(stick);if(K('ArrowLeft','KeyA'))ix=-1;if(K('ArrowRight','KeyD'))ix=1;if(K('ArrowUp','KeyW'))iy=-1;if(K('ArrowDown','KeyS'))iy=1;
    const st=W.dbg.freeze||PAUSE?0:rdt,[wx,wy]=stickToWorld(ix,iy);if(GAME&&hintT>0&&(hintT-=st)<=0)hintEl.style.opacity=0;render(st,wx,wy);uiStep(st);cashEl.textContent='● '+W.coins.toLocaleString('it-IT')+(GAME?'':'  ·  '+ms.toFixed(1)+' ms')+(W.dbg.prof?'  ·  ord '+ORD.pOrd.toFixed(2)+' · sil '+ORD.pSil.toFixed(2):'');requestAnimationFrame(frame)}
  if(ACT){RUN=true;requestAnimationFrame(frame)}
  // ------------------------------------------------------------------ nel gioco vero: accendere e spegnere col menu, la pausa, una partita nuova
  const pzScr=ov.querySelector('#mzPausa'),matchOn=()=>!!(W.director&&W.director.st!=='fine');
  function pzFill(){if(!pzScr)return;const D=W.director,R=D?D.R:0;pzScr.querySelector('.mzpi').innerHTML=R?`Round <b>${R}</b> · zombie uccisi <b>${W.kills||0}</b>`:'La partita sta per cominciare';
    let on=false;try{on=!!AU.on.sfx}catch(e){}pzScr.querySelector('[data-a=sfx]').textContent='Effetti: '+(on?'sì':'no')}
  function setPause(v){if(!GAME)return;PAUSE=!!v;if(PAUSE){reset();buyHold=false;pzFill()}pzScr.hidden=!PAUSE;pzScr.querySelector('.mzsure').hidden=true}
  if(GAME){ov.querySelector('#mzPz').addEventListener('click',e=>{e.stopPropagation();try{sfx('ui')}catch(_){}if(matchOn())setPause(true)});
    pzScr.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;try{sfx('ui')}catch(_){}
      if(a==='su')setPause(false);
      else if(a==='sfx'){try{if(!AU.ctx)initAudio();AU.on.sfx=!AU.on.sfx;audioSettings()}catch(_){}pzFill()}
      else if(a==='esci'){const D=W.director,R=D?D.R:0,s=pzScr.querySelector('.mzsure');s.querySelector('p').textContent=R?`La partita finisce qui: prendi l'oro del round ${R}.`:'La partita finisce qui.';s.hidden=false}
      else if(a==='no')pzScr.querySelector('.mzsure').hidden=true;
      else if(a==='si'){setPause(false);if(W.director&&W.director.abbandona)W.director.abbandona()}})}
  function start(){if(ACT)return;keepCam();ACT=true;PAUSE=false;if(pzScr)pzScr.hidden=true;ov.hidden=false;dpr=DPRCUT?Math.min(1.5,DPR()):DPR();camRig();last=performance.now();if(!RUN){RUN=true;requestAnimationFrame(frame)}}
  function stop(){if(!ACT)return;ACT=false;PAUSE=false;ov.hidden=true;reset();lcFree();// (le copie degli strati fermi: fuori dalla mappa non servono, si rifanno da sole)
    buyHold=false;if(crKeep)Object.assign(CR.cam,crKeep);if(rgKeep)Object.assign(RIGCAM,rgKeep);crKeep=rgKeep=null;cv.style.transform=''}
  // una partita nuova: zombie, effetti, monete, arma, uccisioni; l'area rimette le sue cose (cancello chiuso, velo, zombie dell'aia, Bara al primo
  // posto, eroe alla partenza); il round da capo; la telecamera a nord sull'eroe
  function nuova(){if(!ACT)keepCam();W.Z.length=0;W.FX.length=0;W.puffs.length=0;W.toast=null;W.kills=0;for(const B of BARS)if(B.reset)B.reset();W.hero.busy=null;if(area.reset)area.reset();for(const hs of houses)hs.up=0;
    if(window.ARMI){const sg=W.startGun&&ARMI.DATI[W.startGun]?W.startGun:'pistola';try{gunState=ARMI.nuova(sg);HSTYLE.gun=W.gunId=sg}catch(e){gunState=null}}
    if(W.director&&W.director.reset)W.director.reset();navBuild();if(NAV)NAV.hc=-1;ORD.mm.m=new Map();ORD.fm.m=new Map();ORD.fr+=5;
    buyP=0;buyCur=null;buyKey='';buyLock=false;buyHold=false;gunKey='';toastT=0;toastEl.classList.remove('on');buyEl.hidden=true;reset();
    cam.ret=null;CAM.yaw=cam.yawT=0;CAM.el=cam.elT=cam.elRaw=EL0;camDerive();const h=W.hero;CAM.x=h.x;CAM.y=h.y;look.sum=0;hintEl.style.opacity='';hintT=10;if(GAME)setPause(false)}
  const CTL={start,stop,nuova,pausa:setPause,get on(){return ACT},get paused(){return PAUSE}};ZM.ctl=CTL;
  // ganci di prova (tests nella cartella anteprime/zombie): visibilità dell'eroe in un punto, simulazione degli zombie senza disegnare
  const devBox=(x0,y0,x1,y1)=>{const a=scr(x0,y0),b=scr(x1,y1);return[Math.max(0,Math.floor(a[0])),Math.max(0,Math.floor(a[1])),Math.min(cv.width,Math.ceil(b[0])),Math.min(cv.height,Math.ceil(b[1]))]};
  function visAt(x,y,o){o=o||{};const h=W.hero,D=W.dbg;if(o.yaw!=null||o.el!=null)setView(o.yaw,o.el);W.Z.length=0;h.x=x;h.y=y;h.moving=false;h.zh=heightAt(x,y);const zo=zOn;zOn=false;D.noShoot=true;updateBeings(1,{x:0,y:0});zOn=zo;
    CAM.z=zoomOv||ov.clientWidth/330;if(CAM.rot){CAM.x=x;CAM.y=y;CAM.oy=24*CAM.CP}else{CAM.x=x;CAM.y=y-24;CAM.oy=0}camOv=[CAM.x,CAM.y];const g=cv.getContext('2d');
    const shot=f=>{Object.assign(D,{noSil:!o.sil,heroLast:false,noHero:false},f);render(0,0,0);const[bx0,by0,bx1,by1]=heroBox(),B=devBox(bx0,by0,bx1,by1);return{B,px:g.getImageData(B[0],B[1],Math.max(1,B[2]-B[0]),Math.max(1,B[3]-B[1])).data,occ:LASTOCC.map(e=>{const b=e.prop.bx||e.prop.ref;return e.prop.name+'@'+Math.round(b[0])+','+Math.round(b[1])})}};
    const A=shot({}),Bh=shot({heroLast:true}),C=shot({noHero:true});Object.assign(D,{noSil:false,heroLast:false,noHero:false});
    let msk=0,v=0;const a=A.px,b=Bh.px,c=C.px;for(let i=0;i<a.length;i+=4){if(Math.abs(b[i]-c[i])+Math.abs(b[i+1]-c[i+1])+Math.abs(b[i+2]-c[i+2])<30)continue;msk++;if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])<30)v++}
    return{vis:msk?v/msk:1,mask:msk,occ:A.occ,box:A.B}}
  const ctl=()=>({stick:Object.assign({},stick),look:Object.assign({},look),keys:Object.keys(keys).filter(k=>keys[k]),ret:!!cam.ret,yawT:cam.yawT/DEG,elT:cam.elT/DEG});
  const setView=(yd,ed)=>{cam.ret=null;if(yd!=null)CAM.yaw=cam.yawT=wrapA(yd*DEG);if(ed!=null)CAM.el=cam.elT=cam.elRaw=cl(ed*DEG,ELMIN,ELMAX);camDerive()};
  window.__MZ={ZM,W,CAM,props,houses,solids,holes,stands,perches,zoom:v=>{zoomOv=v},cam:(x,y)=>{camOv=x==null?null:[x,y];if(x!=null)CAM.oy=0},// con la visuale fissata dai test il perno è il centro (oy=0), come prima
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
    // l'ordine di disegno (fase 3): order() gli id delle voci dell'ultimo fotogramma nell'ordine in cui sono state disegnate (prima i pavimenti):
    // P<indice del prop> (o P<i>b / P<i>o, base e sporgenza), H l'eroe, Z<serie> gli zombie, C<i> i corvi posati, F<i> le fiamme libere;
    // entries() le stesse voci con impronta girata H [[U,V]…] (al ψ dell'ordine), quote, riquadro a schermo, centro; prims(id) i pezzi di uno strato
    // nel mondo (per la verità a z-buffer di ordine.js) e proj(id,punti) i punti [x,y,z] sullo schermo con la piega dello strato più la
    // profondità vista (v·cos θ + z·sin θ); orderReset() dimentica l'isteresi e il fotogramma prima; layers() tutti gli strati
    order:()=>ORD.lastF.concat(ORD.last).map(e=>e.sid),
    entries:()=>ORD.lastF.map(e=>entryInfo(e,1)).concat(ORD.last.map(e=>entryInfo(e,0))),
    layers:()=>LAYERS.map(L=>({id:L.sid,prop:L.prop.name,pi:L.prop.i,li:L.li,floor:L.floor,outl:L.outl,groups:L.groups.length,xy:L.xy,z0:L.z0,z1:L.z1,part:L.part,flames:L.flames.length,kids:L.kids?[...L.kids].map(n=>LAYERS[n].sid):null})),
    prims:id=>primsOf(id),proj:(id,pts)=>projOf(id,pts),// bench(n, nuovo, parte): il tempo medio (ms) di n calcoli dell'ordine con lo stato di adesso (parte='coppie': solo coppie, regole e componenti,
    // senza i riquadri a schermo e i visibili); nuovo=1 come se ψ fosse appena cambiato (verdetti
    // geometrici da rifare), nuovo=2 anche l'ordine dentro i prop (memorie per settore vuote) per gli strati visibili, nuovo='cam' la telecamera
    // che si è appena mossa (riquadri a schermo da rifare)
    bench:(n,fresh,part)=>{n=n||200;if(part==='coppie'){ORD.fr++;const r=buildOrder(ORD.vis),L=r[1].slice(),F=r[0].slice(),t0=performance.now();for(let i=0;i<n;i++){if(fresh)PVS.fill(-999999);ORD.fr++;orderList(F,ORD.fm);orderList(L,ORD.mm)}return(performance.now()-t0)/n}
      const t0=performance.now();for(let i=0;i<n;i++){if(fresh)CSK='';if(fresh&&fresh!=='cam')PVS.fill(-999999);ORD.fr++;const r=buildOrder(ORD.vis);if(fresh===2)for(const e of r[0].concat(r[1]))if(e.kind==='L'){e.memo.clear();intraOrder(e)}}return(performance.now()-t0)/n},
    memo:clear=>{if(clear)for(const L of LAYERS)L.memo.clear();let n=0;for(const L of LAYERS)n+=L.memo.size;return n},// memo(): quante memorie per settore ci sono (memo(1) le svuota)
    prof:()=>({fast:ORD.fast,slow:ORD.slow,ord:ORD.tOrd,sil:ORD.tSil,intra:ORD.tIntra,cyc:ORD.cyc,n:ORD.last.length,nf:ORD.lastF.length}),// con W.dbg.prof: i tempi dell'ultimo fotogramma (ms)
    adj:()=>ORD.mm.adj,rel:(a,b)=>{const f=id=>ORD.last.concat(ORD.lastF).find(e=>e.sid===id),A=f(a),B=f(b);return A&&B?rel(A,B):null},// rel(id,id): il verdetto tra due voci dell'ultimo fotogramma
orderReset:()=>{ORD.mm.m=new Map();ORD.fm.m=new Map();ORD.fr+=5},
    intra:id=>{const L=ORD.byId.get(id);return L?intraOrder(L).map(g=>({gi:g.gi,k:g.parts.map(t=>t.k).join(','),z0:g.z0,z1:g.z1})):null},
    lc:()=>LCB,// le copie degli strati fermi (FASE 9): memoria, quante copie / dipinti / dal vivo (LCB.n)
    lcReset:()=>{for(const L of LAYERS)if(L.lc)L.lc.st=true},// tutte le copie da ridipingere (prove)
    // (prove) la copia di uno strato contro la stessa ridipinta adesso, con la telecamera di adesso: quanti pixel diversi
    // (prove) gli strati con le copie: lcA (1 copia, 2 ridipinto, 3 dal vivo) e di quanto la copia è lontana dal disegno vero (dc, in px del mondo)
    lcLayers:()=>LAYERS.filter(L=>L.lc&&L.lc.pp).map(L=>{const C=L.lc,a=C.pp,b=L.pp,k=LCB.T?LCB.T[0]:1,sb=L.sb;let d=0;if(b&&a.length===b.length)for(let i=0;i<a.length;i++)d=Math.max(d,Math.abs(a[i]-b[i]));
      if(C.k&&C.k!==k)d+=Math.abs(C.k-k)/k*Math.max(Math.abs(sb[0]),Math.abs(sb[1]),Math.abs(sb[2]),Math.abs(sb[3]));return{id:L.sid,name:L.prop.name,A:L.lcA,f:L.lcF,dc:d,st:C.st,hot:C.hot,runs:C.runs.length}}),
    render:dt=>render(dt||0,0,0),navField:()=>navField(),vis:visAt,hit:(x,y,r)=>!!hit(x,y,r),heightAt,
    nav:()=>NAV&&{cw:NAV.cw,ch:NAV.ch,free:NAV.bl.reduce((s,v)=>s+(v?0:1),0)},navAt:(x,y)=>{if(!NAV)return null;const c=cellOf(x,y);return{bl:NAV.bl[c],bar:NAV.bar[c],bs:NAV.bs[c],D:NAV.dist[c]}},lureF:(L,x,y)=>{const F=lureField(L);return F[cellOf(x,y)]},/* la casella della griglia in (x, y): bloccata, barriera, lato, distanza dall'eroe; lureF: il campo verso una barriera chiusa */navRebuild:()=>{navBuild();NAV.hc=-1},
    zdraw:(g,k,x,y,fc,an,ph,sc)=>{const sv=ctx;ctx=g;try{CR[k](x,y,fc,an,ph,sc)}finally{ctx=sv}},/* un mostro disegnato in una tela qualunque (prove) */
    hurt:(z,n,fx)=>hurt(z,n,fx),addZombie:(kind,x,y,spd)=>{const k=KINDS.find(k=>k[0]===kind)||KINDS[0];const z={id:++ZID,kind:k[0],sc:k[1],spd:spd||k[2],hp:99,x,y,face:0,p:0,anim:'walk',rise:1,die:0,flash:0};W.Z.push(z);return W.Z.length-1},
    sim:(n,dt)=>{for(let i=0;i<n;i++)updateBeings(dt,{x:0,y:0})},
    walk:(ix,iy,n,dt)=>{const[wx,wy]=stickToWorld(ix,iy);for(let i=0;i<(n||1);i++)updateBeings(dt||1/60,{x:wx,y:wy})},
    // il gioco della mappa: le cose da comprare (buyNow(id) compra subito, come il bottone), l'arma, la Bara, le monete
    texStats:()=>{let n=0,px=0,np=0,pp=0;for(const k in TEX){n++;px+=TEX[k].width*TEX[k].height}for(const k in PLANES){np++;pp+=PLANES[k].width*PLANES[k].height}return{n,mpx:+(px/1e6).toFixed(2),np,mpp:+(pp/1e6).toFixed(2)}},
    buys,equip,buyNow:id=>{const o=buys.find(b=>b.id===id);return o?o.act():null},box:()=>BOX,boxTo:i=>{const q=BOX.spots[i];boxPlace(q[0],q[1],q[3]||0);navBuild();if(NAV)NAV.hc=-1;return[q[0],q[1]]},coins:v=>{if(v!=null)W.coins=v;return W.coins},gun:()=>gunState,nuova:()=>CTL.nuova()};
  return CTL}
return{scala,STAIRS,sameLv,heroLv,climbStart,SB,pickHole,holeDist,zoneOk,shutNear,riposiziona,toWorld:(x,y)=>TURN?tP(TURN,x,y):[x,y],dirWorld:(x,y)=>TURN?tV(TURN,x,y):[x,y],AREE,anteprima,boxReset,stile,idleZombie,buyable,buys,barrier,BARS,barCheck,sorpresa,equip,hurt,spawn,KINDS,move,zWalk,sep,physClear,gun:()=>gunState,navRebuild:()=>{navBuild();if(NAV)NAV.hc=-1},softImg,turn,group,grp,finalize,facing,across,onGround,onPlane,onRound,ringNear,T,CAM,W,S,LS,MOON,inGround,scrAng,decals,fades,NAMES,stand,stands,heightAt,add3,sub3,len3,rnd,rr,srand,ink,path,hull,material,MAT,MARKS,texture,tone,face,hullOf,ballAt,line3,poly3,fn3,box,prismX,prismY,plane,cyl,prop,solid,shade,shadeR,props,solids,shadows,lights,flames,holes,houses,smokes,perches,hit,bakeGround,edgeSnap,boot,bootAsync,libera,ricuoci,setLive:f=>{liveDraw=f},wa,mix,cl,ez,lerp,TAU,ball,seg}})();
