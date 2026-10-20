// COLPI UNICI (Denis, 20 ottobre: «voglio che gli attacchi tipo che sparano qualcosa siano unici per tutti e adatti al proprio stile e
// design»; le sue risposte: tutti i nemici e i boss della Classica, l'aspetto e il suono e anche il modo di sparare, i 13 boss rifatti,
// prima una pagina da vedere sul telefono). Ogni nemico che spara ha il suo colpo, dipinto come la lanterna (tre toni con la luce
// dall'alto a sinistra, contorno scuro, bordo chiaro, bagliore morbido), il suo suono e il suo modo di volare:
// - Goblin: freccia da bracconiere (asta grezza legata, punta di selce, una penna rossa e una verde); mentre mira una riga di puntini
//   rossi dice dove tirerà (si accende quando la mira è ferma); l'élite tira tre frecce in fila sulla stessa riga, una dopo l'altra.
// - Scheletro: dardo d'osso della balestra (asta scura, punta d'osso, alette di ferro) che resta piantato nei muri e nei massi e vibra;
//   l'élite tira tre dardi paralleli, come una balestra a tre canne.
// - Pipistrello (solo l'élite): lo strillo, tre archi rosa e viola che si allargano mentre volano; due strilli di fila.
// - Pianta: semi di girasole che girano su se stessi; la corona di semi rallenta mentre si allarga e resta sospesa come un fiore.
// - Fuoco fatuo: fiammelle fatue con gli occhietti, che danzano a destra e a sinistra intrecciandosi.
// - Diavoletto: una palla di fuoco con le lingue di fiamma che dopo poco si spacca in tre braci (cinque l'élite).
// - Piromante: la meteora è un sasso di basalto con le crepe di lava e la coda di fuoco; a terra il cerchio rosso ha l'anello di rune
//   del piromante e l'ombra che cresce; fischia mentre cade.
// - Negromante: un teschietto fantasma con gli occhi verdi e la fiamma verde dietro, che batte i denti e ti segue piano (gira al massimo
//   di 1,25 radianti al secondo per 1,8 s, poi va dritto): l'unico colpo che insegue.
// - Nano bombarolo: la bomba di ferro col tappo d'ottone e la miccia che sfavilla (sfrigola quando è a terra).
// - Rana: lo sputo saltellante, una palla di muco che va verso di te a quattro balzi: fa male solo quando tocca terra (l'ombra dice dove).
// - Spirito della neve: fiocchi di neve a sei punte; la corona gira mentre si allarga, a spirale (il verso cambia da spirito a spirito).
// - Sentinella di ghiaccio: lancia le sue schegge, una dopo l'altra, dal punto dove girano: mentre ricrescono (1,4 s) è scoperta.
// - Fiore occhio: petali taglienti che girano; quelli di lato curvano e si chiudono tutti dove eri tu, come un fiore che si chiude.
// - Occhio d'ombra: lo sguardo ha il suo raggio (bordi viola scuro, cuore bianco, pupille a fessura che corrono); nell'avviso occhietti.
// - Burattino d'ombra: lo spillo d'oro col filo, che vola a zig zag come un punto da cucito.
// I 13 boss rifatti (src/js/89-*.js, anche loro non ancora nel gioco) avevano già quasi tutti un colpo disegnato apposta; qui ognuno
// prende il suo suono (prima molti usavano quello del fuoco, del ghiaccio, del veleno o della palla rossa) e, dove due boss sparavano
// nello stesso modo (l'anello tutto intorno), il suo modo:
// - Golem: le schegge roventi sono pesanti, rallentano e cadono a terra dopo 130 px (stai lontano quando atterra).
// - Yeti: le schegge di ghiaccio pattinano e rimbalzano una volta sui muri e sui blocchi.
// - Strega: i semi dell'anello partono piano e accelerano, come se germogliassero.
// - Idra: l'anello di gocce della fase 2 esce in tre ondate, una per testa (sinistra, centro, destra).
// - Burattinaio: le sfere d'ombra diventano rombi d'Arlecchino del suo costume, appesi ai fili d'oro: vanno, si fermano e tornano da lui.
// - Piovra: le bolle diventano bolle d'inchiostro (la loro danza resta).
// - Cervo: l'anello di schegge della seconda Zoccolata usa le sue schegge di cristallo d'aurora (prima il ghiaccio di tutti).
// - Salamandra, Fenice, Re Rospo, Regina, Mimic: il modo resta il loro (i ventagli sfalsati di magma, le piume nelle corsie che si piantano
//   nei muri, le bolle con la lucciola, le lance e i pilastri, le monete); suono proprio a Salamandra e Fenice. Il Fabbro non spara colpi
//   (il maglio sulla catena è già suo).
// Danni, velocità e quante volte tirano restano quelli di oggi (le braci del diavoletto fanno 0,7 del colpo). Con LOWFX niente bagliori,
// scie, occhietti né scintille. CU.on spegne tutto (Prima / Dopo nella pagina). Solo anteprima: non è in src/ordine.txt; la pagina
// python3 anteprime/mk_colpi.py lo mette nella copia del gioco.
const CU={on:true,cur:null,n:0,first:null,raw:false,fx:[],stuck:[],last:{}};
const CUL=[-.6,-.8];// where the light comes from (top left of the screen)
// the light side of a piece turned by a (its local y): >0 when the light falls on its +y side
const cuSide=a=>.6*Math.sin(a)-.8*Math.cos(a);
const cuMix=(a,b,k)=>{const A=cuRgb(a),B=cuRgb(b);return`rgb(${Math.round(A[0]+(B[0]-A[0])*k)},${Math.round(A[1]+(B[1]-A[1])*k)},${Math.round(A[2]+(B[2]-A[2])*k)})`};
const CURGB={};function cuRgb(c){if(CURGB[c])return CURGB[c];const n=parseInt(c.slice(1),16);return CURGB[c]=[n>>16&255,n>>8&255,n&255]}
// a gradient across a piece of half width w turned by a (in its own frame): light, base, shadow, cached by the angle
const CUG=new Map();
function cuAcross(id,a,w,T){const s=cuSide(a),b=Math.round(((a%TAU)+TAU)%TAU/TAU*32)%32,key=id+'|'+b;let g=CUG.get(key);if(g)return g;
  const k=Math.min(1,Math.abs(s)),sg=s>=0?1:-1;g=ctx.createLinearGradient(0,sg*w,0,-sg*w);g.addColorStop(0,cuMix(T[1],T[0],.35+.65*k));g.addColorStop(.5,T[1]);g.addColorStop(1,cuMix(T[1],T[2],.4+.6*k));CUG.set(key,g);return g}
// a round piece lit from the top left (in a frame moved to its centre, not turned): cached by size
function cuBall(id,r,T){const key=id+'|'+r;let g=CUG.get(key);if(g)return g;g=ctx.createRadialGradient(-r*.36,-r*.42,r*.06,-r*.05,r*.05,r*1.2);g.addColorStop(0,T[0]);g.addColorStop(.5,T[1]);g.addColorStop(1,T[2]);CUG.set(key,g);return g}
const cuGlow=(rgb,x,y,r,a)=>{if(LOWFX||a<=0)return;ctx.globalCompositeOperation='lighter';glow(rgb,x,y,r,a);ctx.globalCompositeOperation='source-over'};
const cuPoly=pts=>{ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath()};
const cuTri=t=>{const f=((t%1)+1)%1;return f<.25?f*4:f<.75?2-f*4:f*4-4};// a triangle wave, -1..1
// the pieces that never change but for the angle are drawn once into a little canvas at the scale of the screen (2 pixels a point, 1,5 on
// slow phones) and copied pixel to pixel after, as the game does since phase 9: arrows, bolts, pins, shards, flakes, the skull
const CUSP=new Map();let CUSF=null,CUSS=2;
const cuScale=()=>{const t=G?G.t:0;if(t!==CUSF){CUSF=t;const m=ctx.getTransform();CUSS=Math.max(1,Math.round(Math.hypot(m.a,m.b)*4)/4)}return CUSS};
const cuB=(a,n)=>(Math.round(((a%TAU)+TAU)%TAU/TAU*n)%n);
function cuSprite(key,R,draw){const S=cuScale(),k=key+'|'+S;let c=CUSP.get(k);if(c)return c;if(CUSP.size>900)CUSP.clear();
  c=document.createElement('canvas');const n=Math.ceil(R*2*S);c.width=c.height=n;const x=c.getContext('2d'),keep=ctx;ctx=x;try{x.setTransform(S,0,0,S,n/2,n/2);draw()}catch(err){}finally{ctx=keep}
  c.S=S;CUSP.set(k,c);return c}
function cuBlit(c,x,y){const S=c.S,w=c.width/S,m=ctx.getTransform();
  if(m.b===0&&m.c===0&&Math.abs(m.a-S)<.01){const dx=Math.round((x-w/2)*S+m.e)-m.e,dy=Math.round((y-w/2)*S+m.f)-m.f;ctx.drawImage(c,dx/S,dy/S,w,w)}else ctx.drawImage(c,x-w/2,y-w/2,w,w)}

// ------------------------------------------------------------------ the colours (light, base, shadow)
const CUC={wood:['#ecc98f','#b8864c','#6a4524'],flint:['#e2e9f0','#98a4b4','#525c6a'],red:['#ff8f72','#d8443a','#80221e'],green:['#a8de74','#5f9e3a','#2c5a1e'],
  dwood:['#a87c50','#6b4a2e','#36230f'],bone:['#fffbf0','#e4d8bd','#968a70'],iron:['#c0c8d2','#7c848e','#3c424a'],
  seed:['#fff4c4','#e8c45a','#946e20'],fire:['#fff8d4','#ffb03a','#de4418'],skull:['#fffdf6','#e9e1cc','#a2967e'],gob:['#dcff9e','#78c83e','#2c661c'],
  ice:['#f6fdff','#a6dcf6','#468ac0'],petal:['#ffc6e0','#e0559a','#761c44'],metal:['#fffbe8','#d6c180','#86703c'],bead:['#ffc8ef','#d050a8','#641a56'],
  bomb:['#8e9aac','#454e5e','#1a1e26'],brass:['#ffe4a0','#d8a84a','#7a5418'],basalt:['#6e5e62','#3a3036','#16101a']};

// ------------------------------------------------------------------ the drawings (x, y on the floor, a the way it moves)
function cuArrowArt(x,y,a,o){o=o||{};const s=cuSide(a);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineJoin='round';ctx.lineCap='round';
  // the two feathers, ragged and notched: red above, green below; the one the light falls on is lighter
  const F=[[-13,-.7],[-6.4,-.7],[-7.6,-3.4],[-9.4,-3],[-10.4,-4.5],[-12.4,-4.1],[-13.6,-2.6]];
  for(const sd of[-1,1]){const T=sd<0?CUC.red:CUC.green,lit=(sd>0)===(s>0);cuPoly(F.map(q=>[q[0],q[1]*sd]));ctx.fillStyle=lit?cuMix(T[1],T[0],.55):cuMix(T[1],T[2],.25);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
    ctx.strokeStyle=lit?T[0]:T[1];ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-12.6,-1.6*sd);ctx.lineTo(-7.4,-1.1*sd);ctx.stroke()}
  // the shaft of raw wood with its knot
  ctx.strokeStyle=INK;ctx.lineWidth=4.2;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(4,0);ctx.stroke();ctx.strokeStyle=cuAcross('aw',a,1.3,CUC.wood);ctx.lineWidth=2.4;ctx.stroke();
  ctx.fillStyle=CUC.wood[2];ctx.beginPath();ctx.ellipse(-3.5,0,.9,1.25,0,0,TAU);ctx.fill();
  // the binding behind the head
  ctx.strokeStyle='#3a2a1d';ctx.lineWidth=1;for(const bx of[2.2,3.3]){ctx.beginPath();ctx.moveTo(bx,-1.5);ctx.lineTo(bx+.5,1.5);ctx.stroke()}
  // the chipped flint head: two faces and the ridge
  const H=[[3.6,-3.3],[6.4,-2.6],[10.6,0],[6.4,2.6],[3.6,3.3],[4.8,0]];cuPoly(H);ctx.fillStyle=cuAcross('ah',a,3.2,CUC.flint);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  ctx.strokeStyle=CUC.flint[0];ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(5.2,0);ctx.lineTo(9.6,0);ctx.stroke();ctx.restore()}
function cuBoltArt(x,y,a,o){o=o||{};ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineJoin='round';ctx.lineCap='round';
  // two stiff iron vanes
  for(const sd of[-1,1]){cuPoly([[-10.5,0],[-4.2,0],[-6.2,3.9*sd],[-10.2,4.3*sd]]);ctx.fillStyle=cuAcross('bv'+sd,a,4,CUC.iron);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke()}
  // the thick dark shaft
  ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(3,0);ctx.stroke();ctx.strokeStyle=cuAcross('bs',a,1.6,CUC.dwood);ctx.lineWidth=3.1;ctx.stroke();
  // the iron ferrule and the barbed head of bone
  ctx.fillStyle=CUC.iron[1];ctx.fillRect(1.6,-1.9,1.6,3.8);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.strokeRect(1.6,-1.9,1.6,3.8);
  if(!o.sunk){const H=[[3,-3.9],[10.2,0],[3,3.9],[4.4,0]];cuPoly(H);ctx.fillStyle=cuAcross('bh',a,3.6,CUC.bone);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(4.8,0);ctx.lineTo(9,0);ctx.stroke()}
  ctx.restore()}
function cuScreechArt(x,y,a,age){const k=1+.45*Math.min(1,age/.5),al=Math.max(.35,1-age*.35);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineCap='round';
  const C=['#fff0f8','#eaa6cc','#a77ad8'];for(let i=2;i>=0;i--){const R=(4.6+i*2.7)*k,fx=-i*3.2*k,sp=.9-i*.1;ctx.globalAlpha=al;
    ctx.strokeStyle=INK;ctx.globalAlpha=al*.6;ctx.lineWidth=4;ctx.beginPath();ctx.arc(fx-R,0,R,-sp,sp);ctx.stroke();ctx.globalAlpha=al;ctx.strokeStyle=C[i];ctx.lineWidth=2.2-i*.3;ctx.stroke()}
  ctx.globalAlpha=1;ctx.restore()}
function cuSeedArt(x,y,rot){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.ellipse(0,0,6.6,4,rot,0,TAU);ctx.fillStyle=cuBall('sd',6.6,CUC.seed);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  // three brown stripes along it, the dark point and the light on top
  const c=Math.cos(rot),s=Math.sin(rot),P2=(u,v)=>[u*c-v*s,u*s+v*c];ctx.strokeStyle='rgba(104,64,22,.9)';ctx.lineWidth=1;ctx.lineCap='round';
  for(const o of[-1.9,0,1.9]){const a=P2(-4.6,o*.8),m=P2(0,o*1.15),b=P2(4.6,o*.8);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(m[0],m[1],b[0],b[1]);ctx.stroke()}
  const tp=P2(5.6,0);ctx.fillStyle='#4a2a10';ctx.beginPath();ctx.arc(tp[0],tp[1],1.2,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.ellipse(-2,-1.6,1.8,.9,rot,0,TAU);ctx.fill();ctx.restore()}
function cuWispArt(x,y,a,ph){const t=G.t||0,w=Math.sin(t*17+ph)*1.7;ctx.save();ctx.translate(x,y);ctx.rotate(a);
  ctx.beginPath();ctx.moveTo(1.5,-4.7);ctx.arc(1.5,0,4.7,-Math.PI/2,Math.PI/2);ctx.quadraticCurveTo(-3.6,4.4,-10,w);ctx.quadraticCurveTo(-3.6,-4.4,1.5,-4.7);
  let g=CUG.get('wf');if(!g){g=ctx.createLinearGradient(-10,0,6,0);g.addColorStop(0,'rgba(199,179,242,.75)');g.addColorStop(.45,'#9fdcf4');g.addColorStop(1,'#e8fbff');CUG.set('wf',g)}
  ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(42,31,74,.85)';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.arc(2.2,0,2.4,0,TAU);ctx.fill();ctx.restore();
  // two little eyes when it comes at you (seen from the front)
  if(!LOWFX&&Math.sin(a)>-.3){const hx=x+Math.cos(a)*1.8,hy=y+Math.sin(a)*1.8;ctx.fillStyle='#2a1f4a';for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(hx+sd*1.6,hy-.3,.75,1,0,0,TAU);ctx.fill()}}}
function cuFireArt(x,y,a,r,ph){const t=G.t||0,n=r>4.5?4:2;ctx.save();ctx.translate(x,y);ctx.rotate(a);
  // the tongues of flame streaming back
  for(let i=0;i<n;i++){const y0=(i-(n-1)/2)*r*.42,fl=.5+.5*Math.sin(t*31+i*2.3+ph),L=r*(1.35+.55*fl),ty=y0*1.5+Math.sin(t*25+i*1.7+ph)*r*.18;
    ctx.fillStyle='rgba(255,112,38,.85)';ctx.beginPath();ctx.moveTo(0,y0-r*.34);ctx.quadraticCurveTo(-L*.55,y0-r*.42,-L-r*.3,ty);ctx.quadraticCurveTo(-L*.55,y0+r*.42,0,y0+r*.34);ctx.fill();
    ctx.fillStyle='rgba(255,214,110,.9)';ctx.beginPath();ctx.moveTo(0,y0-r*.18);ctx.quadraticCurveTo(-L*.35,y0-r*.2,-L*.7,ty*.8);ctx.quadraticCurveTo(-L*.35,y0+r*.2,0,y0+r*.18);ctx.fill()}
  ctx.restore();ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fillStyle=cuBall('fi',r,CUC.fire);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=r>4.5?1.6:1.2;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.ellipse(-r*.32,-r*.36,r*.3,r*.2,-.6,0,TAU);ctx.fill();ctx.restore()}
function cuSkullCore(j,tl){ctx.save();ctx.rotate(tl);ctx.lineJoin='round';
  ctx.beginPath();ctx.ellipse(0,2.9+j,3.3,2,0,0,TAU);ctx.fillStyle=CUC.skull[2];ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  ctx.strokeStyle='rgba(27,22,18,.7)';ctx.lineWidth=.7;for(const tx of[-1.3,0,1.3]){ctx.beginPath();ctx.moveTo(tx,2.2+j);ctx.lineTo(tx,3.6+j);ctx.stroke()}
  ctx.beginPath();ctx.arc(0,-1.2,5.6,0,TAU);ctx.fillStyle=cuBall('sk',5.6,CUC.skull);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  ctx.fillStyle=INK;for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(sd*2.15,-1.3,1.65,2.05,sd*.15,0,TAU);ctx.fill()}
  ctx.beginPath();ctx.moveTo(-.7,1.5);ctx.lineTo(.7,1.5);ctx.lineTo(0,.5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#c8ff9a';for(const sd of[-1,1]){ctx.beginPath();ctx.arc(sd*2.15,-1,.8,0,TAU);ctx.fill()}
  ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.ellipse(-2.4,-4.4,1.4,.8,-.4,0,TAU);ctx.fill();ctx.restore()}
function cuSkullArt(x,y,a,ph,fast){const t=G.t||0,j=Math.max(0,Math.sin(t*15+ph))*1.3,bob=Math.sin(t*4+ph)*.8,tl=Math.sin(t*3+ph)*.12;
  // the green ghost fire behind it
  ctx.save();ctx.translate(x,y+bob);ctx.rotate(a);for(let i=0;i<3;i++){const y0=(i-1)*2.6,L=9+3*Math.sin(t*20+i*2.1+ph),ty=y0*1.6+Math.sin(t*14+i)*1.4;
    ctx.fillStyle='rgba(110,240,130,.55)';ctx.beginPath();ctx.moveTo(-2,y0-2.6);ctx.quadraticCurveTo(-L*.6,y0-3,-L-4,ty);ctx.quadraticCurveTo(-L*.6,y0+3,-2,y0+2.6);ctx.fill();
    ctx.fillStyle='rgba(214,255,206,.6)';ctx.beginPath();ctx.moveTo(-2,y0-1.2);ctx.quadraticCurveTo(-L*.4,y0-1.3,-L*.7,ty*.8);ctx.quadraticCurveTo(-L*.4,y0+1.3,-2,y0+1.2);ctx.fill()}ctx.restore();
  // the little skull, turned to you: cranium, cheeks, the jaw that chatters (shut or open, five tilts: from its little canvases)
  if(fast){const jb=j>.65?1:0,tb=Math.round(tl/.06);cuBlit(cuSprite('sk'+jb+'.'+tb,9,()=>cuSkullCore(jb*1.3,tb*.06)),x,y+bob)}
  else{ctx.save();ctx.translate(x,y+bob);cuSkullCore(j,tl);ctx.restore()}
  if(!LOWFX)for(const sd of[-1,1])cuGlow('150,255,120',x+sd*2.1,y+bob-1,4,.7)}
function cuGobArt(x,y,a,z,ph,vz){const t=G.t||0,st=Math.max(-1,Math.min(1,vz)),r=5.2;ctx.save();ctx.translate(x,y-z);ctx.rotate(a);
  const rx=r*(1+.2*Math.abs(st)-.14*(1-Math.abs(st))*(z<4?1:0)),ry=r*(1-.16*Math.abs(st)+.16*(z<4?1:0));ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.restore();
  ctx.save();ctx.translate(x,y-z);ctx.fillStyle=cuBall('gb',r,CUC.gob);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
  ctx.fillStyle='rgba(234,255,200,.9)';ctx.beginPath();ctx.arc(1.6+Math.sin(t*6+ph)*.6,1.2,.9,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(-.6,2.2,.6,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.ellipse(-1.9,-2,1.6,.95,-.5,0,TAU);ctx.fill();ctx.restore();
  // drops of slime trailing behind while it is in the air
  if(z>3&&!LOWFX){ctx.fillStyle=CUC.gob[1];ctx.strokeStyle=INK;ctx.lineWidth=1;for(let i=1;i<=2;i++){const d=4.6+i*3.4,dz=z+Math.sin(t*12+i+ph)*.6+i*1.4;ctx.beginPath();ctx.arc(x-Math.cos(a)*d,y-dz-Math.sin(a)*d*.6,1.7-i*.4,0,TAU);ctx.fill();ctx.stroke()}}}
function cuFlakeArt(x,y,rot){ctx.save();ctx.translate(x,y);ctx.lineCap='round';const A=[];for(let i=0;i<6;i++){const th=rot+i*Math.PI/3;A.push([Math.cos(th),Math.sin(th)])}
  const arm=(d,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(d[0]*6.6,d[1]*6.6);for(const s of[-1,1]){const c=Math.cos(.75*s),sn=Math.sin(.75*s),bx=d[0]*3.8,by=d[1]*3.8;
      ctx.moveTo(bx,by);ctx.lineTo(bx+(d[0]*c-d[1]*sn)*2.4,by+(d[0]*sn+d[1]*c)*2.4)}ctx.stroke()};
  for(const d of A)arm(d,3.4,INK);
  for(const d of A){const k=(d[0]*CUL[0]+d[1]*CUL[1]+1)/2;arm(d,1.8,cuMix(CUC.ice[2],'#ffffff',.3+.7*k))}
  ctx.beginPath();for(let i=0;i<6;i++){const th=rot+i*Math.PI/3+Math.PI/6;ctx.lineTo(Math.cos(th)*2.3,Math.sin(th)*2.3)}ctx.closePath();ctx.fillStyle='#eefaff';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#7fc8f0';ctx.beginPath();ctx.arc(0,0,.9,0,TAU);ctx.fill();ctx.restore()}
function cuShardArt(x,y,a,ph,sc,spin){const t=G.t||0,sp=spin!=null?spin:t*6+ph,wk=.55+.45*Math.abs(Math.cos(sp)),s=cuSide(a)*(Math.cos(sp)>=0?1:-1);sc=sc||1;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(sc,sc);ctx.lineJoin='round';
  const tip=[8.6,0],tl=[-6.8,0],up=[1,-3.7*wk],dn=[1,3.7*wk];
  cuPoly([tip,up,tl]);ctx.fillStyle=s<0?cuMix(CUC.ice[1],CUC.ice[0],.7):cuMix(CUC.ice[1],CUC.ice[2],.35);ctx.fill();
  cuPoly([tip,dn,tl]);ctx.fillStyle=s>=0?cuMix(CUC.ice[1],CUC.ice[0],.7):cuMix(CUC.ice[1],CUC.ice[2],.35);ctx.fill();
  cuPoly([tip,up,tl,dn]);ctx.strokeStyle=INK;ctx.lineWidth=1.5/sc;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=.9/sc;ctx.beginPath();ctx.moveTo(tl[0]+2,0);ctx.lineTo(tip[0]-1.2,0);ctx.stroke();ctx.restore()}
function cuPetalArt(x,y,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.beginPath();ctx.moveTo(-7.6,0);ctx.quadraticCurveTo(-1.5,-6.4,7.6,0);ctx.quadraticCurveTo(-1.5,6.4,-7.6,0);
  let g=CUG.get('pt');if(!g){g=ctx.createLinearGradient(0,-5.6,0,5.6);g.addColorStop(0,CUC.petal[0]);g.addColorStop(.45,CUC.petal[1]);g.addColorStop(1,CUC.petal[2]);CUG.set('pt',g)}
  ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();ctx.strokeStyle='rgba(122,28,68,.85)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(-6.2,0);ctx.quadraticCurveTo(0,-.8,6.4,0);ctx.stroke();
  ctx.strokeStyle='rgba(255,236,246,.95)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-4.4,-2.2);ctx.quadraticCurveTo(0,-4.2,4.6,-1.6);ctx.stroke();ctx.restore()}
function cuPinArt(x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.fillStyle=INK;ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(7.4,-1.5);ctx.lineTo(10.6,0);ctx.lineTo(7.4,1.5);ctx.lineTo(-6,2);ctx.closePath();ctx.fill();
  ctx.fillStyle=cuAcross('pn',a,1.1,CUC.metal);ctx.beginPath();ctx.moveTo(-6,-.9);ctx.lineTo(7.2,-.7);ctx.lineTo(9.4,0);ctx.lineTo(7.2,.7);ctx.lineTo(-6,.9);ctx.closePath();ctx.fill();
  ctx.translate(-7.4,0);ctx.rotate(-a);ctx.beginPath();ctx.arc(0,0,3.6,0,TAU);ctx.fillStyle=cuBall('pb',3.6,CUC.bead);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.ellipse(-1.2,-1.4,1.1,.8,-.5,0,TAU);ctx.fill();ctx.restore()}
// the pyromancer's meteor: a lump of basalt with lava cracks, turning, its tail of fire pointing back where it comes from
function cuRockArt(x,y,spin,dx,dy){const t=G.t||0,m=Math.hypot(dx,dy)||1,bx=dx/m,by=dy/m;
  if(!LOWFX)cuGlow('255,140,60',x,y,24,.7);
  for(let i=0;i<3;i++){const fl=.5+.5*Math.sin(t*28+i*2),L=16+8*fl+i*3,px=-by*(i-1)*3.4,py=bx*(i-1)*3.4;ctx.fillStyle=i===1?'rgba(255,214,110,.9)':'rgba(255,110,40,.8)';
    ctx.beginPath();ctx.moveTo(x+px-by*2.6,y+py+bx*2.6);ctx.quadraticCurveTo(x+px-bx*L*.5,y+py-by*L*.5,x+px-bx*L,y+py-by*L);ctx.quadraticCurveTo(x+px-bx*L*.5,y+py-by*L*.5,x+px+by*2.6,y+py-bx*2.6);ctx.fill()}
  ctx.save();ctx.translate(x,y);const B=[1,.84,1.06,.9,1.04,.82,.96];ctx.beginPath();for(let i=0;i<7;i++){const an=spin+i/7*TAU;ctx.lineTo(Math.cos(an)*7*B[i],Math.sin(an)*7*B[i])}ctx.closePath();
  ctx.fillStyle=cuBall('rk',7,CUC.basalt);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  // the lava cracks: two crooked lines that branch, not from the middle
  const CR=[[[-5.2,-1.6],[-2.6,-.6],[-1.4,1.8],[.8,2.6],[3.4,4.4]],[[-.6,-5.4],[.4,-3],[2.6,-1.8],[5.4,-2.4]],[[.4,-3],[-.6,-1.4]]],cs=Math.cos(spin),sn=Math.sin(spin);
  ctx.lineCap='round';ctx.lineJoin='round';for(const[w,col] of[[2.6,'rgba(255,90,20,.45)'],[1.2,'#ffb050']]){ctx.strokeStyle=col;ctx.lineWidth=w;for(const L0 of CR){ctx.beginPath();for(const[u,v] of L0)ctx.lineTo(u*cs-v*sn,u*sn+v*cs);ctx.stroke()}}
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(-2.4,-2.6,2,1.1,-.5,0,TAU);ctx.fill();ctx.restore()}
// the dwarf's bomb: iron, a brass cap, a rope fuse that sparkles (k: how much fuse is left)
function cuBombArt(x,y,spin,k){const t=G.t||0;ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,6.4,0,TAU);ctx.fillStyle=cuBall('bm',6.4,CUC.bomb);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(-2.3,-2.5,2,1.1,-.6,0,TAU);ctx.fill();
  const c=Math.cos(spin-1.1),s=Math.sin(spin-1.1),cx=c*6,cy=s*6;ctx.save();ctx.translate(cx,cy);ctx.rotate(spin-1.1+Math.PI/2);ctx.fillStyle=CUC.brass[1];ctx.fillRect(-2.2,-1.6,4.4,2.6);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.strokeRect(-2.2,-1.6,4.4,2.6);
  ctx.fillStyle=CUC.brass[0];ctx.fillRect(-1.6,-1.2,1.4,.8);ctx.restore();
  const L=2+5*k,ex=cx+c*L+Math.cos(spin)*1.5,ey=cy+s*L+Math.sin(spin)*1.5;ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(cx+c*1.4,cy+s*1.4);ctx.quadraticCurveTo(cx+c*L*.6-s*2,cy+s*L*.6+c*2,ex,ey);ctx.stroke();
  ctx.strokeStyle='#9a7448';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
  const fl=.6+.4*Math.sin(t*40);if(!LOWFX){cuGlow('255,200,90',x+ex,y+ey,7+fl*2,.9);ctx.fillStyle='#fff6c8';for(let i=0;i<3;i++){const an=t*9+i*2.1,d=2+((t*14+i*.37)%1)*4;ctx.beginPath();ctx.arc(x+ex+Math.cos(an)*d,y+ey+Math.sin(an)*d,.6,0,TAU);ctx.fill()}}
  ctx.fillStyle='#ffe27a';ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?1:2.6*fl;ctx.lineTo(x+ex+Math.cos(i*Math.PI/4+t*6)*r,y+ey+Math.sin(i*Math.PI/4+t*6)*r)}ctx.closePath();ctx.fill()}

// the Puppeteer's harlequin lozenge: velvet in four facets (violet and crimson, magenta in the second phase), a gold edge, turning on itself
const CUROM=[['#b98cf0','#6a40b0','#2e1758'],['#ff8aa0','#c0304e','#5c0f24']],CUROM2=[['#ff9ae8','#c03aa8','#540f48'],['#ffb0c0','#d8405e','#64102a']];
function cuRomboArt(spin,p2){const C=p2?CUROM2:CUROM,w=4.6*Math.max(.25,Math.abs(Math.cos(spin))),h=7.4,sd=Math.cos(spin)>=0;ctx.lineJoin='round';
  const T=[0,-h],Rt=[w,0],B=[0,h],Lf=[-w,0],O=[0,0];
  const face=(a,b,c)=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath()};
  // four facets: lit at the top left, the colours swap as it turns
  face(T,Lf,O);ctx.fillStyle=(sd?C[0]:C[1])[0];ctx.fill();face(T,Rt,O);ctx.fillStyle=(sd?C[1]:C[0])[1];ctx.fill();
  face(B,Lf,O);ctx.fillStyle=(sd?C[1]:C[0])[1];ctx.fill();face(B,Rt,O);ctx.fillStyle=(sd?C[0]:C[1])[2];ctx.fill();
  cuPoly([T,Rt,B,Lf]);ctx.strokeStyle='#ffd84a';ctx.lineWidth=2.6;ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.arc(0,-h-1.2,1.3,0,TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke()}
// the Octopus's ink bubble: dark glossy ink, a petrol and magenta sheen round the edge, the swirl inside, the big light
function cuInkArt(r,ph,p2){let g=CUG.get('ink|'+r+'|'+(p2?1:0));if(!g){g=ctx.createRadialGradient(-r*.3,-r*.35,r*.1,0,0,r);g.addColorStop(0,p2?'#5a2a6a':'#2f4a5a');g.addColorStop(.7,p2?'#2a1036':'#14222c');g.addColorStop(1,'#08080e');CUG.set('ink|'+r+'|'+(p2?1:0),g)}
  ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();
  ctx.lineWidth=1.3;ctx.strokeStyle=p2?'rgba(255,120,220,.85)':'rgba(90,220,210,.85)';ctx.beginPath();ctx.arc(0,0,r*.82,.4+ph,1.9+ph);ctx.stroke();
  ctx.strokeStyle='rgba(230,120,200,.75)';ctx.beginPath();ctx.arc(0,0,r*.82,2.6+ph,3.7+ph);ctx.stroke();
  ctx.strokeStyle='rgba(160,200,230,.45)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<14;i++){const a=ph*1.5+i*.45,d=r*.08+i*r*.04;ctx.lineTo(Math.cos(a)*d,Math.sin(a)*d)}ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.ellipse(-r*.38,-r*.42,r*.26,r*.16,-.7,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(r*.4,r*.32,r*.09,0,TAU);ctx.fill()}
const CULOOK={
  rombo:p=>{cuGlow(p.p2?'255,110,230':'170,110,255',p.x,p.y,14,.45);const b=cuB((p.ph||0)+(p.age||0)*9,16);cuBlit(cuSprite('ro'+b+(p.p2?'b':'a'),10,()=>cuRomboArt(b*TAU/16,p.p2)),p.x,p.y)},
  inkb:p=>{cuGlow('120,90,170',p.x,p.y,p.r*2.2,.3);const w=1+Math.sin((G.t||0)*9+(p.ph||0))*.08;ctx.save();ctx.translate(p.x,p.y);ctx.scale(w,2-w);cuInkArt(p.r||7,(p.ph||0)+(G.t||0)*.8,p.p2);ctx.restore()},
  stag:p=>{if(EPDRAW.crystal){const k=p.kind;p.kind='crystal';try{EPDRAW.crystal(p)}finally{p.kind=k}}}};

// ------------------------------------------------------------------ the shots in flight
const CUD={
  cuArrow:p=>{if(!LOWFX){cuGlow('255,110,90',p.x,p.y,11,.22);drawTrail(p,'255,210,180',2)}const b=cuB(p.a,32);cuBlit(cuSprite('ar'+b,15,()=>cuArrowArt(0,0,b*TAU/32)),p.x,p.y)},
  cuBolt:p=>{if(!LOWFX){cuGlow('255,90,80',p.x,p.y,12,.3);drawTrail(p,'255,150,140',2.4)}const b=cuB(p.a,32);cuBlit(cuSprite('bo'+b,14,()=>cuBoltArt(0,0,b*TAU/32)),p.x,p.y)},
  cuScreech:p=>{cuGlow('210,150,255',p.x,p.y,13*(1+.45*Math.min(1,p.age/.5)),.4);cuScreechArt(p.x,p.y,p.a,p.age||0)},
  cuSeed:p=>{cuGlow('255,220,120',p.x,p.y,13,.4);const b=cuB((p.ph||0)+(p.age||0)*7*(p.cuSpin||1),24);cuBlit(cuSprite('sd'+b,9,()=>cuSeedArt(0,0,b*TAU/24)),p.x,p.y)},
  cuWisp:p=>{cuGlow('170,220,255',p.x,p.y,14,.5);if(!LOWFX)drawTrail(p,'190,200,255',3.6);cuWispArt(p.x,p.y,p.ma==null?p.a:p.ma,p.ph||0)},
  cuFire:p=>{cuGlow('255,130,50',p.x,p.y,19,.55);cuFireArt(p.x,p.y,p.a,6.2,p.ph||0)},
  cuEmber:p=>{cuGlow('255,130,50',p.x,p.y,11,.5);if(!LOWFX)drawTrail(p,'255,150,60',2.2);cuFireArt(p.x,p.y,p.a,3.6,p.ph||0)},
  cuSkull:p=>{cuGlow('140,255,120',p.x,p.y,17,.45);if(!LOWFX)drawTrail(p,'140,255,140',3.4);cuSkullArt(p.x,p.y,Math.atan2(p.vy,p.vx),p.ph||0,true)},
  cuGob:p=>{const ph=p.cuHop?((p.age||0)%p.cuHop.per)/p.cuHop.per:0;cuGlow('150,230,90',p.x,p.y-(p.z||0),10,.3);cuGobArt(p.x,p.y,p.a,p.z||0,p.ph||0,Math.cos(ph*Math.PI))},
  cuFlake:p=>{cuGlow('210,240,255',p.x,p.y,13,.45);const r=(G.t||0)*3*(p.cuTurn&&p.cuTurn.w<0?-1:1)+(p.ph||0),b=cuB(r*6,24);cuBlit(cuSprite('fl'+b,9,()=>cuFlakeArt(0,0,b*TAU/24/6)),p.x,p.y)},
  cuShard:p=>{cuGlow('160,220,255',p.x,p.y,14,.45);if(!LOWFX)drawTrail(p,'200,235,255',2.6);const b=cuB(p.a,32),f=cuB((G.t||0)*6+(p.ph||0),8);cuBlit(cuSprite('sh'+b+'.'+f,11,()=>cuShardArt(0,0,b*TAU/32,0,1,f*TAU/8)),p.x,p.y)},
  cuPetal:p=>{cuGlow('255,120,190',p.x,p.y,13,.4);cuPetalArt(p.x,p.y,(p.ph||0)+(p.age||0)*15)},
  cuPin:p=>{if(!LOWFX&&p.tr&&p.tr.length>=4){const t=p.tr,n=t.length;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(t[0],t[1]);for(let i=2;i<n;i+=2)ctx.lineTo(t[i],t[i+1]);
      const ma=p.ma==null?p.a:p.ma;ctx.lineTo(p.x-Math.cos(ma)*7,p.y-Math.sin(ma)*7);ctx.strokeStyle='rgba(40,22,6,.5)';ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle='rgba(255,226,140,.95)';ctx.lineWidth=1.1;ctx.stroke()}
    cuGlow('255,220,140',p.x,p.y,11,.4);const b=cuB(p.ma==null?p.a:p.ma,32);cuBlit(cuSprite('pn'+b,12,()=>cuPinArt(0,0,b*TAU/32)),p.x,p.y)}};
{const _d=drawEproj;drawEproj=function(p){const f=CUD[p.kind]||(p.cuLook&&CULOOK[p.cuLook]);if(f){try{f(p)}catch(err){_d(p)}return}return _d(p)}}

// ------------------------------------------------------------------ who shoots what: the enemy being updated turns its shots into its own
{const _s=shootE;
  CU.shoot=(x,y,a,sp,r,dmg,kind,o)=>{const A=G.eproj,n0=A.length;CU.raw=true;try{_s(x,y,a,sp,r,dmg,kind)}finally{CU.raw=false}
    const p=A.length>n0?A[A.length-1]:null;if(p){p.cuK=kind;p.age=0;p.ph=Math.random()*TAU;if(o)Object.assign(p,o)}return p};
  shootE=function(x,y,a,sp,r,dmg,kind){const e=CU.cur;if(CU.on&&!CU.raw&&e&&G&&CUS[e.type]){CU.n++;try{CUS[e.type](e,x,y,a,sp,r,dmg,kind,CU.n);return}catch(err){console.error(err)}}
    // a boss made again: its shot stays its own (the brain may look at it after), with its way of flying added
    if(CU.on&&!CU.raw&&e&&G&&CUB[e.type]&&cuNewBoss(e)){CU.n++;if(CUX[e.type]&&CUX[e.type](e,x,y,a,sp,r,dmg,kind,CU.n))return;const A=G.eproj,n0=A.length,res=_s.apply(this,arguments);
      if(A.length>n0){const p=A[A.length-1];try{CUB[e.type](e,p,x,y)}catch(err){console.error(err)}}return res}
    return _s.apply(this,arguments)}}
// a shot for later (a burst), fired while the enemy is updated
const cuLater=(e,t,f)=>{(e.cuQ||(e.cuQ=[])).push({t,f})};
const CUS={
  goblin(e,x,y,a,sp,r,dmg,kind,n){if(n>1)return;const A=e.aimA!=null?e.aimA:a;CU.shoot(x,y,A,sp,r,dmg,'cuArrow');
    if(e.elite)for(const t of[.11,.22])cuLater(e,t,()=>CU.shoot(e.x,e.y-8,A,sp,r,dmg,'cuArrow'))},
  skeleton(e,x,y,a,sp,r,dmg,kind,n){if(n===1){CU.first={x,y,a};CU.shoot(x,y,a,sp,r,dmg,'cuBolt');return}
    const f=CU.first||{x,y,a},s=n===2?-1:1;CU.shoot(f.x-Math.sin(f.a)*11*s,f.y+Math.cos(f.a)*11*s,f.a,sp,r,dmg,'cuBolt')},
  bat(e,x,y,a,sp,r,dmg,kind,n){if(n>1)return;CU.shoot(x,y,a,sp,r,dmg,'cuScreech');cuLater(e,.16,()=>CU.shoot(e.x,e.y-14,a,sp,r,dmg,'cuScreech'))},
  plant(e,x,y,a,sp,r,dmg,kind,n){CU.shoot(x,y,a,sp,r,dmg,'cuSeed',{cuDec:{k:.5,t:.9},cuSpin:n%2?1:-1})},
  wisp(e,x,y,a,sp,r,dmg,kind,n){CU.shoot(x,y,a,sp,r,dmg,'cuWisp',{cuWob:{A:8,f:2.1,ph:(n%2)*Math.PI}})},
  imp(e,x,y,a,sp,r,dmg,kind,n){if(n>1)return;const A=Math.atan2(P.y-e.y,P.x-e.x);CU.shoot(x,y,A,sp,r+1,dmg,'cuFire',{cuSplit:{t:.42,n:e.elite?5:3,sp:e.elite?.26:.32}})},
  necro(e,x,y,a,sp,r,dmg,kind,n){CU.shoot(x,y,a,sp,r,dmg,'cuSkull',{cuHome:{w:1.25,t:1.8}})},
  frog(e,x,y,a,sp,r,dmg,kind,n){const per=.34;CU.shoot(x,y+2,a,sp,r,dmg,'cuGob',{cuHop:{per,h:15},r0:r,life:per*4-.005,z:0})},
  snowspirit(e,x,y,a,sp,r,dmg,kind,n){CU.shoot(x,y,a,sp,r,dmg,'cuFlake',{cuTurn:{w:.8*(e.cuSp||(e.cuSp=Math.random()<.5?-1:1))}})},
  // the sentinel throws the shards going round it, the one on your side first; with none left, from its body
  icesentinel(e,x,y,a,sp,r,dmg,kind,n){const go=()=>{const ha=Math.atan2(P.y-e.y,P.x-e.x),S=(e.shards||[]).filter(s=>s.hp>0);
      S.sort((s1,s2)=>Math.abs(angDiff(ha,e.rot+s1.a))-Math.abs(angDiff(ha,e.rot+s2.a)));const s=S[0];
      if(!s){CU.shoot(e.x,e.y-16,Math.atan2(P.y-6-(e.y-16),P.x-e.x),sp,r,dmg,'cuShard');return}
      const an=e.rot+s.a,sx=e.x+Math.cos(an)*24,sy=e.y-14+Math.sin(an)*14;s.hp=0;s.re=1.4;s.hit=0;CU.shoot(sx,sy,Math.atan2(P.y-6-sy,P.x-sx),sp,r,dmg,'cuShard')};
    if(n===1)go();else cuLater(e,(n-1)*.15,go)},
  // the petals at the sides curve in and meet where you were
  eyeflower(e,x,y,a,sp,r,dmg,kind,n){const Ac=Math.atan2(P.y-e.y,P.x-e.x),off=angDiff(Ac,a),D=clamp(Math.hypot(P.x-x,P.y-6-y),110,260),p=CU.shoot(x,y,a,sp,r,dmg,'cuPetal');
    if(p&&Math.abs(off)>.02){const v=Math.hypot(p.vx,p.vy),w=-Math.sign(off)*2*Math.sin(Math.abs(off))*v/D;p.cuCurve={w,t:2*Math.abs(off)/Math.abs(w)}}},
  puppet(e,x,y,a,sp,r,dmg,kind,n){CU.shoot(x,y,a,Math.max(sp,145),Math.max(4,r-1),dmg,'cuPin',{cuZig:{A:8,per:.36}})}};
// the bosses made again: what each adds to its own shots (p is already in the room, its kind untouched). Only a boss whose new brain is
// here (it put itself in BCL): the bosses of today share some kinds ('shadow', 'bubble', 'ice', 'crystal') and stay as they are
const cuNewBoss=e=>!!(e&&window.BCL&&BCL[e.type]);
const cuBoss=p=>{p.cuK=p.cuK||'boss';p.age=0;p.cuX0=p.x;p.cuY0=p.y};
const CUB={
  golem(e,p){if(p.kind==='stone'){cuBoss(p);p.cuHeavy={r:130}}},
  yeti(e,p){if(p.kind==='yice'){cuBoss(p);p.cuBounce=1}},
  witch(e,p){if(p.kind==='wseed'||p.kind==='wseed2'){cuBoss(p);p.cuAcc={k:.38,t:1}}},
  hydra(e,p){},
  puppeteer(e,p){if(p.kind==='shadow'){cuBoss(p);p.cuLook='rombo';p.p2=!!e.p2;p.ph=Math.random()*TAU;p.cuYo={out:1.15,hold:.32,x:e.x,y:e.y-16}}},
  octopus(e,p){if(p.kind==='bubble'){cuBoss(p);p.cuLook='inkb';p.p2=!!e.p2}},
  stag(e,p){if(p.kind==='ice'){p.cuLook='stag';p.sp2=1}},
  salamander(){},phoenix(){}};
// the Hydra's ring of drops in the second phase: in three waves, one for each head (left, middle, right of the screen)
const CUX={hydra(e,x,y,a,sp,r,dmg,kind,n){if(kind!=='hyglob')return false;const c=Math.cos(a),k=c<-.38?0:c>.38?2:1,ox=(k-1)*26,oy=k===1?-8:0;
    const go=()=>CU.shoot(e.x+ox,e.y-14+oy,a,sp,r,dmg,'hyglob');if(k===0)go();else cuLater(e,k*.13,go);return true}};
// the meteors of the pyromancer and the bombs of the dwarf are theirs too
{const _m=meteor;meteor=function(){const A=G.meteors,n0=A.length,r=_m.apply(this,arguments);if(CU.on&&CU.cur&&CU.cur.type==='pyro')for(let i=n0;i<A.length;i++)A[i].cu='pyro';return r}}
{const _l=lob;lob=function(sx,sy,tx,ty,o){const A=G.lobs,n0=A.length,r=_l.apply(this,arguments);if(CU.on&&CU.cur&&CU.cur.type==='bomber')for(let i=n0;i<A.length;i++)if(A[i].kind==='bomb')A[i].cu='bomber';return r}}
// the update of an enemy: who is shooting, its burst for later, the stare of the shadow eye
{const _u=updEnemy;updEnemy=function(e,dt){const k=CU.cur,n=CU.n,f=CU.first;CU.cur=e;CU.n=0;CU.first=null;
  try{if(e.cuQ&&e.cuQ.length&&!(e.daze>0)&&!(e.frozen>0)&&!(e.spawn>0)){for(let i=e.cuQ.length-1;i>=0;i--){const q=e.cuQ[i];q.t-=dt;if(q.t>0)continue;e.cuQ.splice(i,1);if(!e.dead&&!e.hidden&&G.state==='play')try{q.f()}catch(err){console.error(err)}}}
    const L0=e.type==='shadoweye'&&CU.on?G.lines.length:-1;const r=_u.apply(this,arguments);
    if(L0>=0)for(let i=L0;i<G.lines.length;i++){const l=G.lines[i];if(l.col==='purple'){l.col='cuEye';if(i===L0)cuPlay('eyeCharge',l.x)}}
    return r}finally{CU.cur=k;CU.n=n;CU.first=f}}}
{const _b=drawBeamLine;drawBeamLine=function(l){if(l.col==='cuEye'){try{cuBeam(l);return}catch(err){l.col='purple'}}return _b.apply(this,arguments)}}

// ------------------------------------------------------------------ how they fly (before the game moves them) and what is left after
function cuPre(dt){const A=G.eproj,split=[],drop=[];
  for(const p of A){if(!p.cuK)continue;p.age=(p.age||0)+dt;
    if(p.cuDec){const v0=p.cuV0||(p.cuV0=Math.hypot(p.vx,p.vy)),k=1-(1-p.cuDec.k)*Math.min(1,p.age/p.cuDec.t)*(2-Math.min(1,p.age/p.cuDec.t)),m=Math.hypot(p.vx,p.vy)||1;p.vx*=v0*k/m;p.vy*=v0*k/m}
    let w=0;if(p.cuTurn)w=p.cuTurn.w;if(p.cuCurve&&p.age<=p.cuCurve.t)w=p.cuCurve.w;
    if(p.cuHome&&p.age<p.cuHome.t){const d=angDiff(Math.atan2(p.vy,p.vx),Math.atan2(P.y-6-p.y,P.x-p.x));w=clamp(d/Math.max(dt,1e-3),-p.cuHome.w,p.cuHome.w)}
    if(w){const c=Math.cos(w*dt),s=Math.sin(w*dt),vx=p.vx*c-p.vy*s,vy=p.vx*s+p.vy*c;p.vx=vx;p.vy=vy}
    let ls=0;const W=p.cuWob||p.cuZig;if(W){const f=t=>p.cuWob?W.A*Math.sin(TAU*W.f*t+W.ph):W.A*cuTri(t/W.per),d=f(p.age)-f(p.age-dt),m=Math.hypot(p.vx,p.vy)||1;p.x+=-p.vy/m*d;p.y+=p.vx/m*d;ls=d/Math.max(dt,1e-3)}
    if(W||w||p.cuDec){const m=Math.hypot(p.vx,p.vy)||1;p.ma=Math.atan2(p.vy+p.vx/m*ls,p.vx-p.vy/m*ls);if(w)p.a=Math.atan2(p.vy,p.vx)}
    if(p.cuHop){const per=p.cuHop.per,ph=(p.age%per)/per,k=Math.floor(p.age/per);p.z=p.cuHop.h*Math.sin(Math.PI*ph);p.r=p.z<6?p.r0:-40;if(k!==p.cuHk){if(p.cuHk!=null)cuSplat(p,false);p.cuHk=k}}
    if(p.cuSplit&&!p.cuDone&&p.age>=p.cuSplit.t)split.push(p);
    // the Golem's heavy shards: slower and slower, they drop after 130 px
    if(p.cuHeavy){const d=Math.hypot(p.x-p.cuX0,p.y-p.cuY0),v0=p.cuV0||(p.cuV0=Math.hypot(p.vx,p.vy)),k=Math.max(.35,1-.65*(d/p.cuHeavy.r)**1.5),m=Math.hypot(p.vx,p.vy)||1;p.vx*=v0*k/m;p.vy*=v0*k/m;
      if(d>=p.cuHeavy.r)drop.push(p)}
    // the Yeti's shards skate: once off a wall or an ice block
    if(p.cuBounce>0){const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;let hit=false;if(nx<L+2||nx>R-2){p.vx=-p.vx;hit=true}if(ny<TOP+2||ny>BOT-2){p.vy=-p.vy;hit=true}
      if(!hit)for(const k2 of G.rocks){const ex=nx-k2.x,ey=ny-k2.y,dd=Math.hypot(ex,ey);if(dd<k2.r+p.r*.5+1&&dd>.01){const ux=ex/dd,uy=ey/dd,dt2=p.vx*ux+p.vy*uy;if(dt2<0){p.vx-=2*dt2*ux;p.vy-=2*dt2*uy;hit=true}break}}
      if(hit){p.cuBounce--;p.a=Math.atan2(p.vy,p.vx);CU.fx.push({k:'tink',x:p.x,y:p.y,t:0,max:.22});cuPlay('bTink',p.x)}}
    // the Witch's seeds sprout: slow at first, then faster
    if(p.cuAcc){const v0=p.cuV0||(p.cuV0=Math.hypot(p.vx,p.vy)),u=Math.min(1,p.age/p.cuAcc.t),k=p.cuAcc.k+(1-p.cuAcc.k)*u*u,m=Math.hypot(p.vx,p.vy)||1;p.vx*=v0*k/m;p.vy*=v0*k/m}
    // the Puppeteer's lozenges on their strings: out, a stop, pulled back to him
    if(p.cuYo){const Y=p.cuYo,v0=p.cuV0||(p.cuV0=Math.hypot(p.vx,p.vy));
      if(p.age<Y.out){const u=p.age/Y.out,k=1-u*u,m=Math.hypot(p.vx,p.vy)||1;p.vx*=v0*Math.max(.04,k)/m;p.vy*=v0*Math.max(.04,k)/m;if(!p.cuDir)p.cuDir=Math.atan2(p.vy,p.vx)}
      else if(p.age<Y.out+Y.hold){p.vx=Math.cos(p.cuDir)*.01;p.vy=Math.sin(p.cuDir)*.01;if(!p.cuTug){p.cuTug=1;cuPlay('bTug',p.x)}}
      else{const dx=Y.x-p.x,dy=Y.y-p.y,d=Math.hypot(dx,dy)||1,u=Math.min(1,(p.age-Y.out-Y.hold)/.22),v=v0*1.3*(.25+.75*u);p.vx=dx/d*v;p.vy=dy/d*v;if(d<12)drop.push(p)}}}
  for(const p of split){const i=A.indexOf(p);if(i<0)continue;A.splice(i,1);p.cuDone=1;const S=p.cuSplit,v=Math.hypot(p.vx,p.vy),a=Math.atan2(p.vy,p.vx),dm=Math.max(1,Math.round(p.dmg*.7));
    for(let k=0;k<S.n;k++){const an=a+(k-(S.n-1)/2)*S.sp;A.push({x:p.x,y:p.y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,a:an,r:Math.max(3.5,p.r-2.5),dmg:dm,kind:'cuEmber',cuK:'cuEmber',life:4,age:0,ph:Math.random()*TAU})}
    CU.fx.push({k:'pop',x:p.x,y:p.y,t:0,max:.28});cuPlay('pop',p.x)}
  for(const p of drop){const i=A.indexOf(p);if(i<0)continue;A.splice(i,1);p.cuDone=1;
    if(p.cuHeavy){CU.fx.push({k:'chip',x:p.x,y:p.y,t:0,max:.5});cuPlay('bClack',p.x)}else CU.fx.push({k:'yo',x:p.x,y:p.y,t:0,max:.25,p2:p.p2})}}
function cuStick(p){const x=clamp(p.x,L+1,R-1),y=clamp(p.y,TOP+1,BOT-1);if(CU.stuck.length>=(LOWFX?6:14))CU.stuck.shift();CU.stuck.push({x,y,a:Math.atan2(p.vy,p.vx),t:0,max:1.4});cuPlay('tock',x)}
function cuSplat(p,end){const x=p.x,y=p.y;CU.fx.push({k:'splat',x,y,t:0,max:end?.45:.3,big:!!end});if(end)cuPlay('splat',x);else if((p.cuHk||0)<2)cuPlay('blip',x)}
function cuPost(dt,pre,arr){
  if(G.eproj===arr&&pre.length){const now=new Set(G.eproj);for(const p of pre){if(now.has(p)||p.cuDone)continue;const hero=Math.hypot(P.x-p.x,P.y-6-p.y)<P.r+Math.abs(p.r0||p.r)+3;
      if(p.cuK==='cuBolt'&&!hero&&p.life>0)cuStick(p);else if(p.cuK==='cuGob')cuSplat(p,true)}}
  for(const m of G.meteors)if(m.cu==='pyro'&&!m.cuS&&m.t>=0){m.cuS=1;cuPlay('meteor',m.x)}
  for(const b of G.lobs)if(b.cu==='bomber'&&b.landed&&!b.cuS){b.cuS=1;cuPlay('fuse',b.tx,b.ft)}
  for(const l of G.lines)if(l.col==='cuEye'&&l.warn<=0&&!l.cuZ){l.cuZ=1;cuPlay('eyeZap',l.x)}
  for(let i=CU.fx.length-1;i>=0;i--){const f=CU.fx[i];f.t+=dt;if(f.t>=f.max)CU.fx.splice(i,1)}
  for(let i=CU.stuck.length-1;i>=0;i--){const s=CU.stuck[i];s.t+=dt;if(s.t>=s.max)CU.stuck.splice(i,1)}}
{const _u=update;update=function(dt){const ok=G&&G.eproj&&G.state!=='trans'&&G.state!=='dead',arr=ok?G.eproj:null,pre=ok?G.eproj.filter(p=>p.cuK):[];
  if(ok&&pre.length)try{cuPre(dt)}catch(err){console.error(err)}
  _u.apply(this,arguments);
  if(ok)try{cuPost(dt,pre,arr)}catch(err){console.error(err)}}}
{const _b=buildRoom;buildRoom=function(){CU.fx.length=0;CU.stuck.length=0;return _b.apply(this,arguments)}}

// ------------------------------------------------------------------ on the floor: the goblin's aim, the frog's shadows, the pyromancer's runes
function cuGround(){if(!G||!CU.on&&!G.eproj.some(p=>p.cuK)&&!G.meteors.some(m=>m.cu))return;const t=G.t||0;
  if(CU.on)for(const e of G.enemies){if(e.type!=='goblin'||!(e.aim>0)||e.hidden||e.dead)continue;const lock=e.aim<=.25,k=lock?1:Math.min(1,(.75-e.aim)/.3),A=e.aimA!=null?e.aimA:e.face,x0=e.x+Math.cos(A)*12,y0=e.y-8+Math.sin(A)*12;
    ctx.save();ctx.lineCap='round';ctx.setLineDash([.1,6]);ctx.lineDashOffset=-t*40;ctx.strokeStyle=`rgba(27,22,18,${.35*k})`;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+Math.cos(A)*240,y0+Math.sin(A)*240);ctx.stroke();
    ctx.strokeStyle=lock?`rgba(255,80,60,${.9})`:`rgba(255,140,110,${.55*k})`;ctx.lineWidth=2;ctx.stroke();ctx.restore()}
  for(const p of G.eproj)if(p.cuK==='cuGob'){const z=p.z||0,k=1-z/22;ctx.fillStyle=`rgba(20,40,10,${.32*k})`;ctx.beginPath();ctx.ellipse(p.x,p.y+2,5.4*k,2.2*k,0,0,TAU);ctx.fill()}
  for(const m of G.meteors){if(m.cu!=='pyro'||m.t<0)continue;const p=Math.min(1,m.t/m.dur);ctx.fillStyle=`rgba(20,8,4,${.35*p})`;ctx.beginPath();ctx.ellipse(m.x,m.y,m.r*.55*p,m.r*.25*p,0,0,TAU);ctx.fill();
    ctx.save();ctx.translate(m.x,m.y);ctx.rotate(t*1.4);ctx.strokeStyle=`rgba(255,176,74,${.4+.35*p})`;ctx.lineWidth=1.6;ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(0,0,m.r+5,0,TAU);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=`rgba(255,190,90,${.5+.4*p})`;for(let i=0;i<6;i++){const an=i/6*TAU;ctx.save();ctx.rotate(an);ctx.translate(m.r+5,0);ctx.beginPath();ctx.moveTo(0,-2.4);ctx.lineTo(2,1.6);ctx.lineTo(-2,1.6);ctx.closePath();ctx.fill();ctx.restore()}ctx.restore()}}
{const _t=drawTelegraphs;drawTelegraphs=function(){_t.apply(this,arguments);try{cuGround()}catch(err){}}}
// in the air: the pyromancer's meteors, the dwarf's bombs, the bolts stuck in walls and rocks, the little bursts
{const _a=drawHazards2Air;drawHazards2Air=function(){const M=G.meteors,mine=M.filter(m=>m.cu==='pyro');if(!mine.length)return _a.apply(this,arguments);
  G.meteors=M.filter(m=>m.cu!=='pyro');try{_a.apply(this,arguments)}finally{G.meteors=M}
  for(const m of mine){if(m.t<0)continue;const p=m.t/m.dur,h=(1-p)*260,x=m.x+(1-p)*40;cuRockArt(x,m.y-h,(G.t||0)*5+m.x,-40,260)}}}
{const _a=drawLobsAir;drawLobsAir=function(){const B=G.lobs,mine=B.filter(b=>b.cu==='bomber');if(!mine.length)return _a.apply(this,arguments);
  G.lobs=B.filter(b=>b.cu!=='bomber');try{_a.apply(this,arguments)}finally{G.lobs=B}
  for(const b of mine){if(b.t<0)continue;const p=clamp(b.t/b.dur,0,1);
    if(b.landed){const wob=Math.sin((G.t||0)*30)*.06;cuBombArt(b.tx,b.ty-6,-.5+wob,clamp(b.ft/(b.fuse||.6),0,1));continue}
    const x=b.sx+(b.tx-b.sx)*p,gy=b.sy+(b.ty-b.sy)*p,h=Math.sin(p*Math.PI)*b.h;shadow(x,gy+3,6*(.5+p*.5),2.5,.25);cuBombArt(x,gy-h,p*9,1)}}}
function cuAir(){if(!G)return;const t=G.t||0;
  for(const s of CU.stuck){const vib=.16*Math.exp(-s.t*9)*Math.sin(s.t*70),al=Math.min(1,(s.max-s.t)/.35);ctx.globalAlpha=al;const a=s.a+vib;
    ctx.fillStyle='rgba(20,14,10,.5)';ctx.beginPath();ctx.ellipse(s.x,s.y,2.6,1.5,s.a,0,TAU);ctx.fill();cuBoltArt(s.x-Math.cos(a)*8,s.y-Math.sin(a)*8,a,{sunk:true});ctx.globalAlpha=1}
  // the Puppeteer's golden strings while the lozenges hang and come back
  if(!LOWFX&&G.eproj.some(p=>p.cuYo&&p.age>=p.cuYo.out-.15)){ctx.lineCap='round';for(const p of G.eproj){if(!p.cuYo||p.age<p.cuYo.out-.15)continue;const Y=p.cuYo,k=Math.min(1,(p.age-Y.out+.15)/.15);
      ctx.strokeStyle=`rgba(255,226,140,${.55*k})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Y.x,Y.y-30);ctx.quadraticCurveTo((Y.x+p.x)/2,(Y.y-30+p.y)/2-8*(1-k),p.x,p.y-7);ctx.stroke()}}
  for(const f of CU.fx){const k=f.t/f.max;
    if(f.k==='pop'){cuGlow('255,160,60',f.x,f.y,20*(1-k)+6,.7*(1-k));ctx.strokeStyle=`rgba(255,214,120,${1-k})`;ctx.lineWidth=2.4*(1-k)+.4;ctx.beginPath();ctx.arc(f.x,f.y,4+k*14,0,TAU);ctx.stroke();
      if(!LOWFX){ctx.fillStyle=`rgba(255,240,190,${1-k})`;for(let i=0;i<6;i++){const an=i/6*TAU+f.x,d=4+k*18;ctx.beginPath();ctx.arc(f.x+Math.cos(an)*d,f.y+Math.sin(an)*d,1.1*(1-k)+.3,0,TAU);ctx.fill()}}}
    else if(f.k==='chip'){ctx.fillStyle=`rgba(210,190,160,${.6*(1-k)})`;ctx.beginPath();ctx.ellipse(f.x,f.y+2,6+k*10,(6+k*10)*.42,0,0,TAU);ctx.fill();
      ctx.fillStyle=`rgba(255,140,60,${1-k})`;for(let i=0;i<4;i++){const an=i*1.7+f.x,d=3+k*9;ctx.beginPath();ctx.arc(f.x+Math.cos(an)*d,f.y+Math.sin(an)*d*.5-Math.sin(k*Math.PI)*6,1.3,0,TAU);ctx.fill()}}
    else if(f.k==='tink'){cuGlow('190,235,255',f.x,f.y,12*(1-k)+4,.8*(1-k));ctx.strokeStyle=`rgba(235,250,255,${1-k})`;ctx.lineWidth=1.4;for(let i=0;i<4;i++){const an=i*Math.PI/2+.4;ctx.beginPath();ctx.moveTo(f.x+Math.cos(an)*3,f.y+Math.sin(an)*3);ctx.lineTo(f.x+Math.cos(an)*(5+k*7),f.y+Math.sin(an)*(5+k*7));ctx.stroke()}}
    else if(f.k==='yo'){ctx.strokeStyle=`rgba(${f.p2?'255,140,230':'200,160,255'},${1-k})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,3+k*9,0,TAU);ctx.stroke()}
    else if(f.k==='splat'){const R=(f.big?13:8)*(.4+.6*k);ctx.strokeStyle=`rgba(150,230,90,${.75*(1-k)})`;ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(f.x,f.y+2,R,R*.42,0,0,TAU);ctx.stroke();
      if(!LOWFX){ctx.fillStyle=`rgba(200,250,140,${.9*(1-k)})`;const n=f.big?5:3;for(let i=0;i<n;i++){const an=i/n*TAU+f.x*.3,d=R*.9,z=Math.sin(k*Math.PI)*(f.big?9:5);ctx.beginPath();ctx.arc(f.x+Math.cos(an)*d,f.y+2+Math.sin(an)*d*.42-z,1.2,0,TAU);ctx.fill()}}}}}
{const _a=drawHazards2Air;drawHazards2Air=function(){_a.apply(this,arguments);try{cuAir()}catch(err){}}}
// the stare of the shadow eye: the warning with little eyes flowing out, then the beam with dark violet edges, a white heart, slit pupils
function cuBeam(l){const t=G.t||0;ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);
  if(l.warn>0){const pu=.5+.5*Math.sin(t*14);ctx.fillStyle=`rgba(120,60,200,${.08+.08*pu})`;ctx.fillRect(0,-l.w/2,l.len,l.w);ctx.strokeStyle='rgba(190,120,255,.75)';ctx.lineWidth=1.6;ctx.setLineDash([6,6]);ctx.lineDashOffset=-t*30;
    ctx.strokeRect(0,-l.w/2,l.len,l.w);ctx.setLineDash([]);
    if(!LOWFX)for(let s=((t*70)%28)+10;s<l.len;s+=28){const al=Math.min(1,s/60)*(1-s/l.len)*.85;ctx.fillStyle=`rgba(230,200,255,${al})`;ctx.beginPath();ctx.ellipse(s,0,4,1.8,0,0,TAU);ctx.fill();ctx.fillStyle=`rgba(40,10,70,${al})`;ctx.beginPath();ctx.ellipse(s,0,.8,1.6,0,0,TAU);ctx.fill()}
    ctx.restore();return}
  const k=Math.max(0,l.act/(l.act0||.3)),w=l.w*(.7+.3*k);let g=CUG.get('bm|'+l.w);if(!g){g=ctx.createLinearGradient(0,-l.w/2,0,l.w/2);g.addColorStop(0,'rgba(40,10,70,0)');g.addColorStop(.2,'rgba(70,24,120,.9)');g.addColorStop(.42,'rgba(190,120,255,.95)');
    g.addColorStop(.5,'rgba(255,245,255,1)');g.addColorStop(.58,'rgba(190,120,255,.95)');g.addColorStop(.8,'rgba(70,24,120,.9)');g.addColorStop(1,'rgba(40,10,70,0)');CUG.set('bm|'+l.w,g)}
  ctx.globalAlpha=Math.min(1,k*1.4);ctx.scale(1,w/l.w);ctx.fillStyle=g;ctx.fillRect(0,-l.w/2,l.len,l.w);ctx.scale(1,l.w/w);
  if(!LOWFX){ctx.fillStyle='rgba(40,10,70,.85)';for(let s=((t*420)%22);s<l.len;s+=22){ctx.beginPath();ctx.ellipse(s,0,.9,w*.22,0,0,TAU);ctx.fill()}
    ctx.globalAlpha=1;ctx.restore();cuGlow('200,140,255',l.x+Math.cos(l.a)*l.len,l.y+Math.sin(l.a)*l.len,16*k+4,.8*k);cuGlow('220,170,255',l.x,l.y,14*k+4,.8*k);return}
  ctx.globalAlpha=1;ctx.restore()}

// ------------------------------------------------------------------ the sounds of the shots (made by the code, as all the game's sounds)
function cuTone(t,f0,f1,dur,vol,type,rev){const c=AU.ctx,o=osc(type||'sine',f0,t,t+dur+.05),g=c.createGain();o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+Math.min(.02,dur*.2));g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);route(g,null,rev||0)}
const CUSND={
  cuArrow:t=>{twang(t,VR(430,.05),.05);whoosh(t+.015,.13,3800,1700,.05);fNoise(t+.02,.2,'bandpass',VR(4600,.04),14,.025,{f2:3800})},
  cuBolt:t=>{fThump(t,160,55,.08,.22);fModal(t+.004,VR(1500,.05),[1,2.6,4.1],[.06,.04,.02],.06,.12);fNoise(t,.035,'highpass',2800,1,.09,{att:.001});whoosh(t+.01,.12,2300,900,.1)},
  cuScreech:t=>{cuTone(t,VR(2600,.05),VR(4200,.05),.09,.035,'triangle',.1);cuTone(t+.02,VR(3900,.05),VR(2900,.05),.07,.02,'sine',.1)},
  cuSeed:t=>{fThump(t,VR(240,.1),110,.07,.2);fNoise(t,.06,'lowpass',900,1,.12,{brown:true});M.plant(t+.015,.35)},
  cuWisp:t=>{fNoise(t,.26,'highpass',VR(2400,.1),.8,.05,{f2:5600,att:.06,rev:.3});vBell(null,t+.01,88+Math.random(),.5,.025)},
  cuFire:t=>{fNoise(t,.24,'bandpass',VR(620,.1),.9,.15,{brown:true,f2:320,att:.04});for(let i=0;i<3;i++)fNoise(t+Math.random()*.18,.014,'highpass',3600,.7,.045)},
  pop:t=>{fThump(t,VR(380,.1),VR(1000,.1),.05,.1);fNoise(t,.09,'bandpass',VR(1900,.1),1,.08);for(let i=0;i<3;i++)fNoise(t+.02+Math.random()*.1,.012,'highpass',4200,.7,.04)},
  cuSkull:t=>{fNoise(t,.55,'bandpass',VR(400,.05),7,.08,{f2:240,att:.14,rev:.35});cuTone(t,VR(196,.02),165,.5,.03,'sine',.3);M.bone(t+.04,.35,1300);M.bone(t+.12,.28,1200)},
  meteor:t=>{fNoise(t,.95,'bandpass',2600,12,.04,{f2:520,att:.25});for(let i=0;i<4;i++)fNoise(t+1.05+Math.random()*.25,.02,'highpass',3000,.7,.06)},
  cuGob:t=>{fThump(t,VR(420,.1),VR(950,.1),.06,.14);fNoise(t,.08,'lowpass',1300,1,.1,{brown:true})},
  blip:t=>{fThump(t,VR(620,.1),280,.04,.035)},
  splat:t=>{M.goo(t,.4)},
  cuFlake:t=>{M.glass(t,.45,VR(3300,.05));M.glass(t+.07,.3,VR(4300,.05));whoosh(t,.22,2400,900,.035)},
  cuShard:t=>{M.ice(t,.55);whoosh(t,.12,3400,1500,.05)},
  cuPetal:t=>{fNoise(t,.1,'bandpass',VR(2100,.1),1.3,.08,{f2:3600});vBell(null,t+.01,95,.35,.018)},
  eyeCharge:t=>{fNoise(t,.8,'bandpass',260,4,.05,{f2:880,att:.65});cuTone(t,110,330,.8,.02,'triangle',.2)},
  eyeZap:t=>{fThump(t,VR(240,.05),55,.28,.18);fNoise(t,.3,'bandpass',1300,2,.11,{f2:380})},
  cuPin:t=>{fNoise(t,.05,'highpass',5200,1,.05,{att:.001});whoosh(t,.13,5600,2800,.035);fModal(t,VR(3100,.05),[1,2.7],[.07,.035],.035,.12)},
  tock:t=>{M.wood(t,.5,VR(420,.1))},
  bStone:t=>{M.stone(t,.4);whoosh(t,.16,2400,800,.05)},
  bClack:t=>{M.stone(t+.005,.22);fNoise(t,.05,'highpass',3200,.8,.05)},
  bMagma:t=>{fThump(t,VR(180,.1),70,.12,.2);fNoise(t,.25,'bandpass',VR(900,.1),1.2,.08,{brown:true,f2:400});fNoise(t+.05,.2,'highpass',5200,.7,.035)},
  bYice:t=>{M.ice(t,.7);fNoise(t,.18,'bandpass',VR(3000,.05),3,.04,{f2:1800})},
  bTink:t=>{M.glass(t,.35,VR(3600,.08))},
  bThorn:t=>{fNoise(t,.08,'bandpass',VR(1500,.1),1.2,.08,{f2:3000});M.wood(t,.25,VR(700,.1))},
  bSeed:t=>{fThump(t,VR(300,.1),700,.05,.1);M.plant(t,.3)},
  bVenom:t=>{fNoise(t,.12,'bandpass',VR(1100,.1),1.5,.1,{f2:500});fNoise(t,.3,'highpass',3800,.8,.045,{att:.04})},
  bBell:t=>{vBell(null,t,96,.4,.03);vBell(null,t+.03,103,.3,.018);M.wood(t+.01,.3,VR(900,.1))},
  bTug:t=>{whoosh(t,.14,1400,4200,.04);M.wood(t+.02,.2,VR(1300,.1))},
  bBlub:t=>{fThump(t,VR(200,.15),VR(520,.15),.09,.12);fThump(t+.06,VR(300,.15),VR(800,.15),.06,.07);fNoise(t,.1,'lowpass',700,1,.05,{brown:true})},
  bFeather:t=>{whoosh(t,.18,1800,4200,.06);fNoise(t,.2,'bandpass',VR(800,.1),.9,.08,{brown:true,f2:400,att:.03});cuTone(t,VR(2400,.05),VR(3600,.05),.06,.012,'sine',.1)},
  bPshard:t=>{M.glass(t,.4,VR(2500,.05));fNoise(t,.2,'bandpass',600,.9,.08,{brown:true})},
  bAurora:t=>{const N=[84,86,89,91,93];vBell(null,t,N[Math.floor(Math.random()*5)],.6,.025);whoosh(t,.15,3000,1600,.035)},
  fuse:(t,d)=>{fNoise(t,Math.max(.2,d||.6),'highpass',6500,.8,.035,{att:.03})}};
CUSND.cuEmber=CUSND.cuFire;
const CUGAP={pop:60,blip:90,tock:70,splat:80,bTink:70,bClack:80,bTug:120};
// the boss kinds whose shot sound becomes their own (a shared kind only for its boss)
const CUBS={stone:'bStone',magma:'bMagma',yice:'bYice',wthorn:'bThorn',wthorn2:'bThorn',wseed:'bSeed',wseed2:'bSeed',hyglob:'bVenom',pfeather:'bFeather',pfeatherb:'bFeather',pshard:'bPshard',crystal:'bAurora'},
  CUBS2={puppeteer:{shadow:'bBell'},octopus:{bubble:'bBlub'},stag:{ice:'bAurora'}};
function cuPlay(k,x,arg){if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx||!CUSND[k])return;const now=performance.now();if(now-(CU.last[k]||0)<(CUGAP[k]||90))return;CU.last[k]=now;
  const pan=AU.pan;AU.pan=x==null?0:Math.max(-.7,Math.min(.7,(x-180)/200));try{CUSND[k](AU.ctx.currentTime+.005,arg)}catch(err){}AU.pan=pan}
{const _s=sfx;sfx=function(k,arg,x){if(k==='eshot'&&CUSND[arg]&&arg.startsWith('cu')){cuPlay(arg,x);return}
  if(CU.on&&k==='eshot'&&arg){const e=CU.cur,nb=cuNewBoss(e),b=(nb&&CUBS2[e.type]&&CUBS2[e.type][arg])||((nb||!e&&arg!=='crystal')&&CUBS[arg]);if(b){cuPlay(b,x);return}}
  return _s.apply(this,arguments)}}
