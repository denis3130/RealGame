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
const CAM={x:0,y:0,z:1,lx:.003,ly:.0002};    // centro inquadrato (coordinate del terreno), zoom, quanto si piegano le cose alte
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646},rr=(a,b)=>a+(b-a)*rnd(),srand=s=>{seed=s||1};
// ------------------------------------------------------------------ proiezione
// un punto del mondo (x, y sul terreno, z in alto) sullo schermo: le cose alte scappano dal centro in orizzontale, e in verticale
// quelle sotto l'eroe sembrano un po' più alte (sono più vicine), quelle sopra più basse
let REF=null;// il punto del prop che decide la piega di tutti i suoi pezzi: così il prop si piega come un blocco unico e finestre, porta, lanterna… non scivolano sopra di lui (Denis, 12 ottobre); null = ogni punto per conto suo (muri e staccionate lunghe)
let LEANK=1;// quanto si piega il prop che si sta disegnando (lk del prop: 1 case e muri, .5 pali e lapidi)
// la piega di lato satura piano verso 13° (lontano dall'eroe le cose alte non sembrano cadute); quella in verticale, che allunga o accorcia
// le case mentre l'eroe va su e giù, quasi non c'è (al massimo ±2% dell'altezza): richieste di Denis del 12 ottobre («diminuisci di molto»)
const LK=.22,soft=k=>LK*Math.tanh(k/LK),LKV=.02,softV=k=>LKV*Math.tanh(k/LKV);
const S=(x,y,z)=>{if(Array.isArray(x))return S(x[0],x[1],x[2]);z=z||0;const rx=REF?REF[0]:x,ry=REF?REF[1]:y;return[x+soft((rx-CAM.x)*CAM.lx)*z*LEANK,y-z+softV((CAM.y-ry)*CAM.ly)*z*LEANK]};
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
  const m=MAT[mat]||MAT.stone,c=document.createElement('canvas');c.width=w*R;c.height=h*R;const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(R,R);
  try{ctx.fillStyle=tone(m,key);ctx.fillRect(0,0,w,h);const marks=MARKS[m.marks];if(marks)marks(w,h,key,m);if(m.after)m.after(w,h,key);
    if(SKY(key)){// luce calda in alto a sinistra sulle facce che guardano il cielo
      const gr=ctx.createLinearGradient(0,0,w*.7,h*.7);gr.addColorStop(0,wa(key==='t'?.26:.16));gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h)}
    else{// le facce in piedi: più scure verso il basso, nere ai piedi se toccano terra; un filo di luce fredda in cima
      const gr=ctx.createLinearGradient(0,h,0,Math.max(0,h-Math.min(28,h)));gr.addColorStop(0,`rgba(0,0,0,${foot?.38:.14})`);gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
      ctx.fillStyle='rgba(200,215,255,.22)';ctx.fillRect(0,0,w,1.5);if(key==='s'||key==='w'){const gw=ctx.createLinearGradient(0,0,2.5,0);gw.addColorStop(0,'rgba(200,215,255,.16)');gw.addColorStop(1,'rgba(200,215,255,0)');ctx.fillStyle=gw;ctx.fillRect(0,0,2.5,h)}}
  }finally{ctx=sv}return TEX[id]=c}
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
const ballAt=(p,r,mat,o)=>Object.assign({k:'ball',p,r,mat},o||{});// o.lobes/amp/ph: profilo smerlato (chiome)
// line: un segmento 3D (ringhiere, corde, rami sottili): col, w; ink true aggiunge il contorno
const line3=(a,b,col,w,o)=>Object.assign({k:'line',a,b,col,w:w||1},o||{});
// poly: un poligono 3D piatto riempito (mucchi di terra, pezze), con contorno opzionale
const poly3=(pts,col,o)=>Object.assign({k:'poly',pts,col},o||{});
// fn: disegno libero con la proiezione (per i dettagli): f(S, ctx)
const fn3=(f)=>({k:'fn',f});
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
  if(!tx){path(q);ctx.fillStyle=f.col;ctx.fill()}else{if(f.tex&&!tx._x){tx._x=1;const g=tx.getContext('2d'),sv=ctx;ctx=g;ctx.save();ctx.scale(R,R);try{f.tex(f.w,f.h,f.key)}finally{ctx.restore();ctx=sv}}drawQuad(tx,q)}
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
  if(f.tex){ctx.save();ctx.clip();f.tex(q,f.key);ctx.restore()}
  if(SKY(f.key)){ctx.save();ctx.clip();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of q){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}const g=ctx.createLinearGradient(x0,y0,x0+(x1-x0)*.7,y0+(y1-y0)*.7);g.addColorStop(0,wa(.22));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.restore()}
  path(q);ctx.strokeStyle='rgba(15,12,10,.5)';ctx.lineWidth=.9;ctx.stroke()}
function drawPlane(p){const q=p.c.map(S),a=shoelace(q);if(Math.abs(a)<1)return;let tx=PLANES[p.texId];if(!tx){tx=PLANES[p.texId]=document.createElement('canvas');tx.width=Math.ceil(p.w*R);tx.height=Math.ceil(p.h*R);const g=tx.getContext('2d'),sv=ctx;ctx=g;ctx.scale(R,R);try{p.draw(p.w,p.h)}finally{ctx=sv}}
  if(p.alpha<1){ctx.save();ctx.globalAlpha*=p.alpha}drawQuad(tx,q,a>0);if(p.alpha<1)ctx.restore()}
const LS=(()=>{const l=Math.hypot(-.78,.22);return[-.78/l,.22/l]})();// da dove viene la luna, sullo schermo
function drawBall(b){const q=S(b.p),m=MAT[b.mat]||MAT.leaf,r=b.r;ctx.save();ctx.translate(q[0],q[1]);if(b.sq)ctx.scale(1,b.sq);const shape=()=>{if(!b.lobes){ball([0,0],r);return}ctx.beginPath();const n=b.lobes,am=b.amp||.14,N=n*6;for(let i=0;i<=N;i++){const a=i/N*TAU,k=Math.abs(Math.sin(a*n/2+(b.ph||0))),r2=r*(1-am*.5+am*k),px=Math.cos(a)*r2,py=Math.sin(a)*r2;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()};shape();ctx.fillStyle=m.c[1];ctx.fill();ctx.save();ctx.clip();
  ctx.fillStyle=m.c[0];ctx.beginPath();ctx.ellipse(LS[0]*r*.25,LS[1]*r*.25,r*.88,r*.84,0,0,TAU);ctx.fill();ctx.fillStyle=m.c[2];ctx.beginPath();ctx.ellipse(LS[0]*r*.45,LS[1]*r*.45,r*.42,r*.34,-.4,0,TAU);ctx.fill();
  if(b.tex)b.tex(r);ctx.restore();if(b.noOut!==true){ink(b.ow||2.4);shape();ctx.stroke()}ctx.restore()}
function drawLine(l){const a=S(l.a),b=S(l.b);ctx.lineCap='round';if(l.ink){ctx.strokeStyle=INK;ctx.lineWidth=l.w+2.2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}ctx.strokeStyle=l.col;ctx.lineWidth=l.w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
function drawPart(p){switch(p.k){case'face':return drawFace(p);case'facepoly':return drawFacePoly(p);case'plane':return drawPlane(p);case'hull':{const H=hull(p.pts.map(S));path(H);ink(p.w);ctx.stroke();return}case'outline':{path(p.pts.map(S));ink(p.w);ctx.stroke();return}
  case'ball':return drawBall(p);case'line':return drawLine(p);case'poly':{const q=p.pts.map(S);path(q);ctx.fillStyle=p.col;ctx.fill();if(p.ink){ink(p.ink);ctx.stroke()}return}case'fn':return p.f(S,ctx)}}
// un prop: parts (nell'ordine di disegno: prima il contorno, poi le facce, da dietro a davanti), bx [x0,y0,x1,y1,zTop] per il taglio a
// schermo, ky la profondità (y del bordo davanti), solids per le collisioni, shadows per le ombre cotte nel terreno, lights/flames
const props=[],solids=[],shadows=[],lights=[],flames=[],holes=[],houses=[],smokes=[],perches=[],decals=[],fades=[];// fades: chiome che sfumano ({x,ky,rx,reach,a}), le parti 'roof' del prop con house:fade// decals: f() dipinte nel terreno dopo le ombre (pozze di luce fisse, macchie)
// o.ky: profondità = la y del bordo davanti della parte alta (dove sta il solido); o.kyFn(x): profondità che dipende dalla x dell'eroe (cose
// sottili in diagonale, come le ante aperte); o.floor: sta a terra (cumuli, pedane, gradini, tappeti) e si disegna prima di tutti gli esseri
const NAMES={cur:null,ref:null};// il prop che si sta costruendo (serve ai test per dire chi copre l'eroe)
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
const GT=2;let groundDraw=null;
function bakeGround(w,h,painter){W.w=w;W.h=h;const c=document.createElement('canvas');c.width=w*GT;c.height=h*GT;const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(GT,GT);srand(5);
  try{painter(w,h);// l'area dipinge il suo terreno
    // ombre: silhouette spinta a est e un po' a sud (luna a ovest, alta), disegnate su uno strato a parte e composte una volta sola, così dove si
    // sovrappongono non diventano nere; il piede è più scuro della punta. Poi il buio di contatto ai piedi di tutto (a ellisse per le cose tonde) e le decalcomanie
    const sh=document.createElement('canvas');sh.width=c.width;sh.height=c.height;const g2=sh.getContext('2d');g2.scale(GT,GT);
    const layer=(k)=>{g2.clearRect(0,0,w,h);g2.fillStyle='#000';for(const s of shadows){if(s.r){g2.beginPath();g2.ellipse(s.x,s.y,s.r*(k<1?.8:1),s.r*.6*(k<1?.8:1),0,0,TAU);g2.fill();continue}
        const ox=s.h*.5*k,oy=s.h*.15*k,P=[[s.x,s.y],[s.x+s.w,s.y],[s.x+s.w,s.y+s.d],[s.x,s.y+s.d]];g2.beginPath();hull(P.concat(P.map(p=>[p[0]+ox,p[1]+oy]))).forEach((q,i)=>i?g2.lineTo(q[0],q[1]):g2.moveTo(q[0],q[1]));g2.closePath();g2.fill()}};
    ctx.save();if('filter' in ctx)ctx.filter='blur(1.8px)';layer(1);ctx.globalAlpha=.24;ctx.drawImage(sh,0,0,w,h);layer(.45);ctx.globalAlpha=.16;ctx.drawImage(sh,0,0,w,h);ctx.globalAlpha=1;
    if('filter' in ctx)ctx.filter='blur(1.4px)';for(const s of solids){if(s.w>400||s.d>400||s.noAO)continue;ctx.fillStyle='rgba(0,0,0,.3)';if(s.round){ctx.beginPath();ctx.ellipse(s.x+s.w/2,s.y+s.d/2,s.w/2+1.5,s.d/2+1.5,0,0,TAU);ctx.fill()}else ctx.fillRect(s.x-1,s.y-1,s.w+2,s.d+2)}ctx.restore();
    for(const f of decals){ctx.save();f();ctx.restore()}
  }finally{ctx=sv}W.ground=c}
// ------------------------------------------------------------------ luci, buio, nebbia, cielo
let dark=null,mistImg=null,cloudImg=null;
function drawLights(h0a){if(LOWFX)return;ctx.save();ctx.globalCompositeOperation='lighter';for(const L of lights){if(L.house&&L.house.a>.6)continue;LEANK=L.lk||1;const q=S(L.x,L.y,0);LEANK=1;const f=L.fl?(.9+.1*Math.sin(W.t*(L.fl===2?2:9)+L.x)*Math.sin(W.t*5.3+L.y)):1,a=L.a*(L.house?1-L.house.a:1)*.8;glow(L.rgb,q[0],q[1],L.r*f,a*f,L.r*f*.62)}ctx.restore()}
function drawDark(W0,H0,toScr0,h0a){if(LOWFX)return;const Q=3,Wd=Math.ceil(W0/Q),Hd=Math.ceil(H0/Q),toScr=(x,y,r)=>toScr0(x,y,r).map(v=>v/Q);if(!dark)dark=document.createElement('canvas');if(dark.width!==Wd||dark.height!==Hd){dark.width=Wd;dark.height=Hd}
  const g=dark.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,Wd,Hd);g.fillStyle='rgba(10,14,34,.42)';g.fillRect(0,0,Wd,Hd);
  g.globalCompositeOperation='destination-out';const hole=(x,y,r,a)=>{const[sx,sy,sr0]=toScr(x,y,r),sr=Math.max(1,sr0||1);const gr=g.createRadialGradient(sx,sy,0,sx,sy,sr);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill()};
  for(const L of lights){if(L.house&&L.house.a>.6)continue;LEANK=L.lk||1;REF=L.ref||null;const q=S(L.x,L.y,(L.z||0)*.5);LEANK=1;REF=null;hole(q[0],q[1],L.r*1.2,.85*(L.house?1-L.house.a:1))}if(W.hero){const hq=S(W.hero.x,W.hero.y,10);hole(hq[0],hq[1],120,.6)}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dark,0,0,W0,H0);ctx.restore()}
function softImg(){if(mistImg)return mistImg;mistImg=document.createElement('canvas');mistImg.width=mistImg.height=64;const g=mistImg.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return mistImg}
function drawMist(dt){if(LOWFX)return;const im=softImg();ctx.save();ctx.globalAlpha=.10;for(const m of W.mists){m.x+=m.v*dt;if(m.x>W.w+180)m.x=-180;ctx.drawImage(im,m.x-m.r,m.y-m.r*.42,m.r*2,m.r*.84)}ctx.restore()}
// le nuvole che passano davanti alla luna: grandi ombre morbide che scorrono sul terreno
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
function drawCrowShadows(){for(const c of W.flock){const q=S(c.x,c.y,0);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(q[0],q[1],9,3.2,0,0,TAU);ctx.fill()}}
function drawFlock(){for(const c of W.flock){const q=S(c.x,c.y,c.z);drawCrow(q,Math.sin(c.ph),c.dir,.95)}}
function drawPerched(){for(const p of perches){if(p.away)continue;const q=S(p.x,p.y,p.z);ctx.save();ctx.translate(q[0],q[1]);const f=Math.sin(p.t*.7)*.8+(Math.sin(p.t*2.3)>.9?1.2:0),d=Math.cos(f)>=0?1:-1;ink(1.6);ctx.fillStyle='#16151c';
    ctx.beginPath();ctx.ellipse(0,-5,5,4,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(-10,1);ctx.lineTo(-8,-3);ctx.closePath();ctx.fill();ctx.stroke();const hx=3*Math.cos(f),hy=-10;ctx.beginPath();ctx.arc(hx,hy,3.2,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#d8b040';ctx.beginPath();ctx.moveTo(hx+2.6*d,hy-1);ctx.lineTo(hx+7*d,hy+.5);ctx.lineTo(hx+2.6*d,hy+1);ctx.closePath();ctx.fill();ctx.fillStyle='#ff5040';ball([hx+1.2*d,hy-.8],.8);ctx.fill();ctx.restore()}}
// fiamme e lumi: candele, vetri delle lanterne, zucche, camini, il respiro verde della cripta (disegnate nell'ordine di profondità)
function drawFlame(f,h0a){if(f.house&&f.house.a>.9)return;LEANK=f.lk||1;REF=f.ref||null;const q=S(f.x,f.y,f.z);LEANK=1;REF=null;const fl=.85+.15*Math.sin(W.t*11+f.x)*Math.sin(W.t*7.3+f.y);
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
  if(!h.moving&&tgt&&h.fireCd<=0&&!noShoot){h.fireCd=.36;tgt.hp--;tgt.flash=.12;const hs=S(h.x,h.y,0),ts=S(tgt.x,tgt.y,24);W.FX.push({k:'shot',a:[hs[0]+Math.cos(h.aim)*16,hs[1]-14+Math.sin(h.aim)*16],b:ts,t:.08});
    for(let i=0;i<5;i++)W.FX.push({k:'drop',x:ts[0],y:ts[1],vx:rr(-40,40),vy:rr(-60,-10),t:.5});if(tgt.hp<=0){tgt.die=.001;W.coins+=60}}
  spawnT-=dt;if(zOn&&spawnT<=0&&W.Z.length<5){spawn();spawnT=rr(2,3.5)}navUpdate(dt);
  for(const z of W.Z){if(z.flash>0)z.flash-=dt;if(z.die){z.die+=dt;continue}z.zh=(z.zh||0)+(heightAt(z.x,z.y)-(z.zh||0))*Math.min(1,dt*14);if(z.rise<1){z.rise=Math.min(1,z.rise+dt/1.3);z.face=Math.atan2(h.y-z.y,h.x-z.x);continue}
    const dx=h.x-z.x,dy=h.y-z.y,d=Math.hypot(dx,dy);
    if(d<30&&physClear(z.x,z.y,h.x,h.y,2)){z.face=Math.atan2(dy,dx);if(z.anim!=='attack'){z.anim='attack';z.p=0}z.p+=dt/1.4;z.chk=0;z.cx0=null}else{if(z.anim!=='walk'){z.anim='walk';z.p=0}z.p+=dt/(z.kind==='hound'?.6:1.1);zWalk(z,dt)}
    for(const o of W.Z)if(o!==z&&!o.die&&o.rise>=1){const ex=z.x-o.x,ey=z.y-o.y,e=Math.hypot(ex,ey);if(e>0&&e<24)move(z,ex/e*(24-e)*.5,ey/e*(24-e)*.5,ZR)}z.p%=1}
  for(let i=W.Z.length-1;i>=0;i--)if(W.Z[i].die>1.1||(!zOn&&W.Z[i].rise<1))W.Z.splice(i,1);
  for(const f of W.FX){f.t-=dt;if(f.k==='drop'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt}}for(let i=W.FX.length-1;i>=0;i--)if(W.FX[i].t<=0)W.FX.splice(i,1);
  for(const hs of houses){const{x,y,w,d}=hs,pc=hs.porch;hs.inside=(h.x>x&&h.x<x+w&&h.y>y&&h.y<y+d+4)||(pc&&h.x>pc[0]&&h.x<pc[2]&&h.y>pc[1]&&h.y<pc[3]);hs.a+=((hs.inside?0:1)-hs.a)*Math.min(1,dt*7)}
  for(const f of fades){const b=h.y<f.ky&&h.y>f.ky-f.reach&&Math.abs(h.x-f.x)<f.rx;f.a+=((b?.35:1)-f.a)*Math.min(1,dt*6)}}
function drawZombie(z){const q=S(z.x,z.y,z.zh||0);
  if(z.rise<1){const k=z.rise;ctx.fillStyle='#4a3a2a';ctx.beginPath();ctx.ellipse(q[0],q[1],18+k*8,8+k*3,0,0,TAU);ctx.fill();for(let i=0;i<6;i++){const a=i*1.05+z.x,r=10+k*16;ctx.fillStyle='#64503a';ball([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.5-Math.sin(k*Math.PI)*6],2.4);ctx.fill()}
    if(k>.25){const u=ez((k-.25)/.75);ctx.save();ctx.beginPath();ctx.rect(q[0]-60,q[1]-150,120,151);ctx.clip();ctx.translate(0,(1-u)*60*z.sc);CR[z.kind](q[0],q[1],z.face,'idle',(W.t*.6)%1,z.sc);ctx.restore()}return}
  if(z.die){const k=Math.min(1,z.die/1.1);ctx.save();ctx.globalAlpha=1-k*k;ctx.beginPath();ctx.rect(q[0]-60,q[1]-150,120,151);ctx.clip();ctx.translate(0,ez(k)*50*z.sc);CR[z.kind](q[0],q[1],z.face,'idle',0,z.sc);ctx.restore();return}
  CR[z.kind](q[0],q[1],z.face,z.anim,z.p,z.sc);if(z.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,255,255',q[0],q[1]-24*z.sc,22*z.sc,.5);ctx.restore()}}
const alphaOf=(hs,part)=>part==='roof'?hs.a:part==='front'?.22+.78*hs.a:part==='in'?(hs.a>.95?0:1):1;
function drawHero(){const h=W.hero,q=S(h.x,h.y,h.zh||0);drawRig(q[0],q[1]-8,h.face,h.walk,h.moving,HSTYLE,{gp:gunState?gunState.pose():{},aim:h.aim})}
function drawEntry(e,h0a){if(e.p){LEANK=e.p.lk==null?1:e.p.lk;REF=e.p.ref||null;drawProp(e.p,e.p.house?part=>alphaOf(e.p.house,part):null);LEANK=1;REF=null;return}if(e.hero){drawHero();return}if(e.fl){drawFlame(e.fl,h0a);return}drawZombie(e.z)}
// la sagoma dell'eroe dove è coperto (dietro la casa, la cripta, un albero): si ridisegnano in una tela piccola solo le cose davanti a lui che
// toccano il suo riquadro, e lì sopra si stampa la sua sagoma chiara a metà trasparenza. Costa qualcosa solo quando è davvero coperto.
let SIL=null,LASTOCC=[];
function heroBox(){const h=W.hero,q=S(h.x,h.y,h.zh||0);return[q[0]-18,q[1]-58,q[0]+18,q[1]+6]}
// il riquadro vero di un prop (dai punti 3D dei suoi pezzi; o.ob se lo dà chi lo costruisce): [x0,y0,x1,y1,zTop], calcolato una volta
function obOf(p){if(p._ob)return p._ob;if(p.ob)return p._ob=p.ob;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,z1=0,any=false;const add=(q,r)=>{r=r||0;any=true;x0=Math.min(x0,q[0]-r);x1=Math.max(x1,q[0]+r);y0=Math.min(y0,q[1]-r);y1=Math.max(y1,q[1]+r);z1=Math.max(z1,(q[2]||0)+r)};
  for(const t of p.parts){if(t.c)t.c.forEach(q=>add(q));else if(t.pts)t.pts.forEach(q=>add(q));else if(t.a){add(t.a,t.w);add(t.b,t.w)}else if(t.p)add(t.p,t.r)}
  return p._ob=any?[x0-3,y0-3,x1+3,y1+3,z1+4]:[p.bx[0],p.bx[1],p.bx[2],p.bx[3],p.bx[4]]}
function occluders(list,hi){const out=[];if(hi<0)return out;let[bx0,by0,bx1,by1]=heroBox();bx0+=5;bx1-=5;// il riquadro della figura, un po' più stretto di quello per le misure
  for(let i=hi+1;i<list.length;i++){const e=list[i];if(!e.p)continue;const p=e.p;if(p.house&&p.house.inside&&p.parts[0]&&(p.parts[0].part==='front'||p.parts[0].part==='roof'))continue;// il muro davanti e il tetto sono già trasparenti
    // le cose alte si piegano sempre via dall'eroe: la tolleranza per la piega va solo dal lato opposto a lui
    const o=obOf(p),hx=W.hero.x,padE=o[0]>hx?.37*o[4]*(p.lk==null?1:p.lk)+2:1,padW=o[2]<hx?.37*o[4]*(p.lk==null?1:p.lk)+2:1;if(o[2]+padE<bx0||o[0]-padW>bx1||o[3]+3<by0||o[1]-o[4]*1.37>by1)continue;out.push(e)}return out}
function silhouette(occ,h0a){if(!occ.length||W.dbg.noSil)return;const m=ctx.getTransform(),[bx0,by0,bx1,by1]=heroBox(),X0=Math.floor(m.a*bx0+m.e),Y0=Math.floor(m.d*by0+m.f),X1=Math.ceil(m.a*bx1+m.e),Y1=Math.ceil(m.d*by1+m.f),Q=.5,w=Math.ceil((X1-X0)*Q),hh=Math.ceil((Y1-Y0)*Q);if(w<=0||hh<=0)return;// a metà risoluzione: è un velo morbido
  if(!SIL)SIL={o:document.createElement('canvas'),h:document.createElement('canvas')};for(const c of[SIL.o,SIL.h]){if(c.width<w)c.width=w;if(c.height<hh)c.height=hh}
  // memoria: se l'eroe, la telecamera, chi lo copre e le trasparenze non sono cambiati, si riusa la sagoma del fotogramma prima
  const h=W.hero,key=[Math.round(h.x*2),Math.round(h.y*2),Math.round((h.zh||0)*2),Math.round(h.face*8),h.moving?Math.floor(h.walk*3):-1,Math.round(CAM.x*2),Math.round(CAM.y*2),Math.round(CAM.z*100),w,hh,occ.map(e=>props.indexOf(e.p)+':'+Math.round((e.p.house?e.p.house.a:1)*20)).join(',')].join('|');
  if(SIL.key!==key){SIL.key=key;
  const sv=ctx;try{let g=SIL.h.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,hh);g.setTransform(m.a*Q,0,0,m.d*Q,(m.e-X0)*Q,(m.f-Y0)*Q);ctx=g;drawHero();
      g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgb(160,240,228)';g.fillRect(0,0,w,hh);g.globalCompositeOperation='source-over';
      g=SIL.o.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,w,hh);g.setTransform(m.a*Q,0,0,m.d*Q,(m.e-X0)*Q,(m.f-Y0)*Q);ctx=g;for(const e of occ)drawEntry(e,h0a);
      g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-in';g.globalAlpha=1;g.drawImage(SIL.h,0,0);g.globalCompositeOperation='source-over'}finally{ctx=sv}}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.55;ctx.imageSmoothingEnabled=true;ctx.drawImage(SIL.o,0,0,w,hh,X0,Y0,X1-X0,Y1-Y0);ctx.restore()}
// ------------------------------------------------------------------ il fotogramma del mondo (in coordinate del mondo, già trasformate)
let liveDraw=null;// l'area può aggiungere disegni dal vivo: liveDraw(dt)
function drawWorld(dt,view){const h0=houses[0],h0a=h0?h0.a:1,D=W.dbg;
  ctx.drawImage(W.ground,0,0,W.ground.width,W.ground.height,0,0,W.w,W.h);
  const vis=p=>!(p.bx[2]<view.x0||p.bx[0]>view.x1||p.bx[3]<view.y0||p.bx[1]-p.bx[4]>view.y1);
  // il pavimento: cumuli, pedane, gradini, tappeti (stanno sotto i piedi di tutti)
  for(const p of props)if(p.floor&&vis(p)){LEANK=p.lk==null?1:p.lk;REF=p.ref||null;drawProp(p,p.house?part=>alphaOf(p.house,part):null);LEANK=1;REF=null}
  drawClouds(dt);drawCrowShadows();drawLights(h0a);
  // tutto ciò che sta in piedi, dal fondo verso davanti; gli esseri e le fiamme in mezzo
  const hx=W.hero?W.hero.x:0,list=[];for(const p of props){if(p.floor||!vis(p))continue;list.push({k:p.kyFn?p.kyFn(hx):p.ky,p})}
  for(const z of W.Z)list.push({k:z.y+.01,z});if(W.hero&&!D.noHero&&!D.heroLast)list.push({k:W.hero.y+.01,hero:1});if(!D.noFlames)for(const f of flames)list.push({k:f.ky!=null?f.ky:f.y+.6,fl:f});
  list.sort((a,b)=>a.k-b.k);let hi=-1;
  for(let i=0;i<list.length;i++){const e=list[i];if(e.hero)hi=i;drawEntry(e,h0a)}
  if(D.heroLast&&!D.noHero&&W.hero)drawHero();
  LASTOCC=occluders(list,hi);silhouette(LASTOCC,h0a);
  drawPerched();
  if(!LOWFX){for(const p of W.puffs){REF=p.ref||null;const q=S(p.x,p.y,p.z);REF=null;ctx.fillStyle=`rgba(150,150,165,${.28*(1-p.t/3.2)})`;ball(q,p.r);ctx.fill()}
    for(const l of W.leaves){const q=S(l.x,l.y,l.z);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(l.t*4+l.ph);ctx.fillStyle=l.c;ctx.beginPath();ctx.ellipse(0,0,2.6,1.2,0,0,TAU);ctx.fill();ctx.restore()}
    ctx.save();ctx.globalCompositeOperation='lighter';for(const f of W.flies){const q=S(f.x,f.y,f.z),b=.5+.5*Math.sin(W.t*3+f.ph);glow('170,255,120',q[0],q[1],9,.5*b);ctx.fillStyle=`rgba(230,255,190,${.9*b})`;ctx.fillRect(q[0]-.8,q[1]-.8,1.6,1.6)}ctx.restore()}
  for(const f of W.FX){if(f.k==='shot'){ctx.strokeStyle='rgba(255,230,160,.9)';ctx.lineWidth=2;seg(f.a,f.b);ctx.stroke();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,210,120',f.a[0],f.a[1],14,.8);ctx.restore()}}else{ctx.fillStyle='#3a5a1e';ball([f.x,f.y],1.8);ctx.fill()}}
  if(liveDraw)liveDraw(dt);drawMist(dt);drawFlock()}
function updateAmbient(dt){W.t+=dt;updateCrows(dt);if(LOWFX)return;
  for(const f of W.flies){f.a+=dt*(Math.sin(W.t*.7+f.ph)*1.6);f.x+=Math.cos(f.a)*14*dt;f.y+=Math.sin(f.a)*14*dt;f.z=cl(f.z+Math.sin(W.t*2+f.ph)*8*dt,4,50);if(f.x<0)f.x=W.w;if(f.x>W.w)f.x=0;if(f.y<0)f.y=W.h;if(f.y>W.h)f.y=0}
  for(const s of smokes){s.t-=dt;if(s.t<=0){s.t=.22;W.puffs.push({x:s.x+rr(-3,3),y:s.y+rr(-3,3),z:s.z,t:0,r:rr(4,6),ref:s.ref})}}
  for(const p of W.puffs){p.t+=dt;p.z+=16*dt;p.x+=10*dt;p.r+=5*dt}for(let i=W.puffs.length-1;i>=0;i--)if(W.puffs[i].t>3.2)W.puffs.splice(i,1);
  for(const tr of W.leafTrees||[])if(Math.random()<dt*.8)W.leaves.push({x:tr[0]+rr(-40,40),y:tr[1]+rr(-40,40),z:rr(70,90),t:0,ph:rr(0,6),c:['#a8562a','#c87a2a','#d0a040'][Math.floor(Math.random()*3)]});
  for(const l of W.leaves){l.t+=dt;l.z-=14*dt;l.x+=Math.sin(l.t*3+l.ph)*20*dt+6*dt}for(let i=W.leaves.length-1;i>=0;i--)if(W.leaves[i].z<0)W.leaves.splice(i,1)}
// ------------------------------------------------------------------ la pagina: tela, levetta, telecamera, bottoni
function boot(area){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}
  area.build();navBuild();if(window.ARMI){try{gunState=ARMI.nuova('pistola')}catch(e){gunState=null}}
  for(let i=0;i<16;i++)W.flies.push({x:rr(0,W.w),y:rr(0,W.h),z:rr(6,40),a:rr(0,TAU),ph:rr(0,TAU)});for(let i=0;i<9;i++)W.mists.push({x:rr(-100,W.w+100),y:rr(0,W.h),r:rr(80,160),v:rr(6,14)});
  for(let i=0;i<4;i++)W.clouds.push({x:rr(-300,W.w),y:rr(-100,W.h),r:rr(220,360),v:rr(9,16)});
  const ov=document.createElement('div');ov.id='mz';ov.innerHTML=`<style>
  #mz{position:fixed;inset:0;z-index:99999;background:#0b0c12;font-family:"Baloo 2",system-ui,sans-serif;color:#efe6d0;touch-action:none;user-select:none;-webkit-user-select:none}
  #mz canvas{position:absolute;inset:0;width:100%;height:100%}
  #mz .top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(rgba(8,8,12,.85),rgba(8,8,12,0));pointer-events:none}
  #mz h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:19px;letter-spacing:.02em;text-shadow:0 2px 0 #000}
  #mz .cash{font:800 14px "Baloo 2",system-ui;color:#ffd65a;text-shadow:0 2px 0 #000;white-space:nowrap}
  #mz .bar{position:absolute;left:0;right:0;bottom:0;padding:10px 10px calc(20px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:linear-gradient(rgba(8,8,12,0),rgba(8,8,12,.9))}
  #mz button{font:700 14px "Baloo 2",system-ui;color:#efe6d0;background:#33302e;border:2px solid #000;border-radius:12px;padding:8px 12px;box-shadow:0 3px 0 #000}
  #mz button.on{background:#4a6a2a;color:#eaffd0}#mz button:active{transform:translateY(2px);box-shadow:0 1px 0 #000}
  #mz .hint{position:absolute;left:0;right:0;bottom:100px;text-align:center;font-size:13px;opacity:.65;pointer-events:none}
  </style><canvas></canvas><div class="top"><h1>${area.title||'Mappa zombie'}</h1><span class="cash" id="mzCash"></span></div>
  <div class="hint">Trascina per camminare · fermo spara</div><div class="bar" id="mzBar"></div>`;document.body.appendChild(ov);
  const cv=ov.querySelector('canvas'),barEl=ov.querySelector('#mzBar');let low=false,whole=false;
  const ui=()=>{barEl.innerHTML='';const mk=(t,on,f)=>{const b=document.createElement('button');b.textContent=t;b.className=on?'on':'';b.onclick=()=>{f();ui()};barEl.appendChild(b)};
    mk('Zombie',zOn,()=>{zOn=!zOn});mk('Effetti bassi',low,()=>{low=!low});mk('Vista intera',whole,()=>{whole=!whole})};ui();
  const stick={on:false,x0:0,y0:0,x:0,y:0};
  ov.addEventListener('pointerdown',e=>{if(e.target.closest('.bar'))return;stick.on=true;stick.x0=stick.x=e.clientX;stick.y0=stick.y=e.clientY});
  ov.addEventListener('pointermove',e=>{if(stick.on){stick.x=e.clientX;stick.y=e.clientY}});const up=()=>{stick.on=false};ov.addEventListener('pointerup',up);ov.addEventListener('pointercancel',up);
  const keys={};addEventListener('keydown',e=>keys[e.key]=1);addEventListener('keyup',e=>keys[e.key]=0);
  const dpr=Math.min(2,window.devicePixelRatio||1);let last=performance.now(),ms=0,zoomOv=0,camOv=null;
  function render(dt,ix,iy){const Wp=ov.clientWidth,Hp=ov.clientHeight;if(cv.width!==Math.round(Wp*dpr)||cv.height!==Math.round(Hp*dpr)){cv.width=Math.round(Wp*dpr);cv.height=Math.round(Hp*dpr)}
    const saved=ctx,lf=LOWFX;ctx=cv.getContext('2d');LOWFX=low;const t0=performance.now();
    try{updateBeings(dt,{x:ix,y:iy});updateAmbient(dt);if(area.update)area.update(dt);
      const h=W.hero,z=zoomOv||(whole?Math.min(Wp/(W.w+80),Hp/(W.h+160)):Wp/330),tx=camOv?camOv[0]:whole?W.w/2:h.x,ty=camOv?camOv[1]:whole?W.h/2+10:h.y-24;
      CAM.z+=(z-CAM.z)*Math.min(1,dt*8);CAM.x+=(tx-CAM.x)*Math.min(1,dt*6);CAM.y+=(ty-CAM.y)*Math.min(1,dt*6);
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0b0c12';ctx.fillRect(0,0,Wp,Hp);if(area.backdrop)area.backdrop(Wp,Hp);
      ctx.setTransform(dpr*CAM.z,0,0,dpr*CAM.z,dpr*(Wp/2-CAM.x*CAM.z),dpr*(Hp/2-CAM.y*CAM.z));
      const view={x0:CAM.x-Wp/2/CAM.z-80,x1:CAM.x+Wp/2/CAM.z+80,y0:CAM.y-Hp/2/CAM.z-80,y1:CAM.y+Hp/2/CAM.z+80};
      drawWorld(dt,view);
      drawDark(cv.width,cv.height,(x,y,r)=>[dpr*(Wp/2+(x-CAM.x)*CAM.z),dpr*(Hp/2+(y-CAM.y)*CAM.z),r*CAM.z*dpr],houses[0]?houses[0].a:1);
      ctx.setTransform(dpr,0,0,dpr,0,0);if(stick.on){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(stick.x0,stick.y0,42,0,TAU);ctx.stroke();const dx=stick.x-stick.x0,dy=stick.y-stick.y0,l=Math.min(42,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);ctx.fillStyle='rgba(255,255,255,.4)';ball([stick.x0+Math.cos(a)*l,stick.y0+Math.sin(a)*l],18);ctx.fill()}
      const vg=ctx.createRadialGradient(Wp/2,Hp/2,Math.min(Wp,Hp)*.4,Wp/2,Hp/2,Math.max(Wp,Hp)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,Wp,Hp)
    }catch(e){console.error(e)}finally{ms=ms*.93+(performance.now()-t0)*.07;ctx=saved;LOWFX=lf}}
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;let ix=0,iy=0;if(stick.on){const dx=stick.x-stick.x0,dy=stick.y-stick.y0,l=Math.hypot(dx,dy);if(l>6){ix=dx/Math.max(l,50);iy=dy/Math.max(l,50)}}
    if(keys.ArrowLeft||keys.a)ix=-1;if(keys.ArrowRight||keys.d)ix=1;if(keys.ArrowUp||keys.w)iy=-1;if(keys.ArrowDown||keys.s)iy=1;
    render(W.dbg.freeze?0:dt,ix,iy);ov.querySelector('#mzCash').textContent='● '+W.coins.toLocaleString('it-IT')+'  ·  '+ms.toFixed(1)+' ms';requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
  // ganci di prova (tests nella cartella anteprime/zombie): visibilità dell'eroe in un punto, simulazione degli zombie senza disegnare
  const devBox=(x0,y0,x1,y1)=>{const Wp=ov.clientWidth,Hp=ov.clientHeight,f=(x,y)=>[dpr*(Wp/2+(x-CAM.x)*CAM.z),dpr*(Hp/2+(y-CAM.y)*CAM.z)],a=f(x0,y0),b=f(x1,y1);return[Math.max(0,Math.floor(a[0])),Math.max(0,Math.floor(a[1])),Math.min(cv.width,Math.ceil(b[0])),Math.min(cv.height,Math.ceil(b[1]))]};
  function visAt(x,y,o){o=o||{};const h=W.hero,D=W.dbg;W.Z.length=0;h.x=x;h.y=y;h.moving=false;h.zh=heightAt(x,y);const zo=zOn;zOn=false;D.noShoot=true;updateBeings(1,{x:0,y:0});zOn=zo;
    CAM.z=zoomOv||ov.clientWidth/330;CAM.x=x;CAM.y=y-24;camOv=[CAM.x,CAM.y];const g=cv.getContext('2d');
    const shot=f=>{Object.assign(D,{noSil:!o.sil,heroLast:false,noHero:false},f);render(0,0,0);const[bx0,by0,bx1,by1]=heroBox(),B=devBox(bx0,by0,bx1,by1);return{B,px:g.getImageData(B[0],B[1],Math.max(1,B[2]-B[0]),Math.max(1,B[3]-B[1])).data,occ:LASTOCC.map(e=>e.p.name+'@'+Math.round(e.p.bx[0])+','+Math.round(e.p.bx[1]))}};
    const A=shot({}),Bh=shot({heroLast:true}),C=shot({noHero:true});Object.assign(D,{noSil:false,heroLast:false,noHero:false});
    let msk=0,v=0;const a=A.px,b=Bh.px,c=C.px;for(let i=0;i<a.length;i+=4){if(Math.abs(b[i]-c[i])+Math.abs(b[i+1]-c[i+1])+Math.abs(b[i+2]-c[i+2])<30)continue;msk++;if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])<30)v++}
    return{vis:msk?v/msk:1,mask:msk,occ:A.occ,box:A.B}}
  window.__MZ={W,CAM,props,houses,solids,holes,stands,zoom:v=>{zoomOv=v},cam:(x,y)=>{camOv=x==null?null:[x,y]},setWhole:v=>{whole=v;ui()},tp:(x,y)=>{W.hero.x=x;W.hero.y=y},zombies:v=>{zOn=v;ui()},low:v=>{low=v;ui()},
    render:dt=>render(dt||0,0,0),vis:visAt,hit:(x,y,r)=>!!hit(x,y,r),heightAt,
    nav:()=>NAV&&{cw:NAV.cw,ch:NAV.ch,free:NAV.bl.reduce((s,v)=>s+(v?0:1),0)},navRebuild:()=>{navBuild();NAV.hc=-1},
    addZombie:(kind,x,y,spd)=>{const k=KINDS.find(k=>k[0]===kind)||KINDS[0];const z={kind:k[0],sc:k[1],spd:spd||k[2],hp:99,x,y,face:0,p:0,anim:'walk',rise:1,die:0,flash:0};W.Z.push(z);return W.Z.length-1},
    sim:(n,dt)=>{for(let i=0;i<n;i++)updateBeings(dt,{x:0,y:0})}}}
return{T,CAM,W,S,LS,decals,fades,NAMES,stand,stands,heightAt,add3,sub3,len3,rnd,rr,srand,ink,path,hull,material,MAT,MARKS,texture,tone,face,hullOf,ballAt,line3,poly3,fn3,box,prismX,prismY,plane,cyl,prop,solid,shade,shadeR,props,solids,shadows,lights,flames,holes,houses,smokes,perches,hit,bakeGround,boot,setLive:f=>{liveDraw=f},wa,mix,cl,ez,lerp,TAU,ball,seg}})();
