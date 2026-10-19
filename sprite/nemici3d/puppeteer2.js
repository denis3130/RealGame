// IL BURATTINAIO D'OMBRA rifatto: «la Marionetta del Teatro delle Ombre» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy
// e fatti meglio sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»;
// 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). Nome e titolo restano: «Il Burattinaio d'Ombra», «Il teatro delle ombre». Era
// l'artista del teatro della Cripta; l'Ombra gli ha rubato la croce di comando e adesso la marionetta più grande del teatro è lui: un
// giullare di legno, avorio e velluto viola, alto tre volte e mezzo l'eroe (130 in cima alle punte del cappuccio), appeso a cinque fili
// d'oro che salgono a una croce di legno che dondola da sola nel buio. Viso tondo d'avorio con le guance rosa, una mascherina scura da
// Arlecchino che fa da sopracciglio a V, due occhi d'oro che brillano con la lucina, un sorriso dipinto con la mascella da marionetta e
// due zannette; farsetto a botte coi rombi viola e cremisi e le righe d'oro, gorgiera bianca, maniche a sbuffo, calzoni a sbuffo, gambe
// e braccia di legno miele con le giunture a palla, grandi mani bianche, scarpe a punta coi campanellini, sul dorso la maschera della
// commedia ricamata d'oro, il cappuccio da giullare a due punte coi campanelli. Il suo avviso: prima di ogni colpo si accendono e si
// tendono i fili dell'arto che colpirà (una perla di luce corre giù dalla croce), la croce si piega da quella parte, tintinnano i
// campanelli e le palpebre si chiudono a metà; quando i fili sono molli è indifeso. Fase 2 (o.p2): sopra la croce si aprono due grandi
// occhi magenta e una mano d'ombra la stringe; velluto più cupo, occhi e fili magenta, crepe della vernice accese, sospeso a 3 px.
// Resta della Classica: forme robuste, contorno scuro spesso, colori pieni, occhi con la lucina, solo due zannette, niente sangue, ferite o
// cuciture (le crepe sono solo della vernice); l'Ombra è nebbia, due occhi e una mano.
// Metodo dello spaventapasseri (scheletro 3D proiettato con V(face), braccia e gambe a due ossa con ik, ordine di disegno dalla posa di
// riposo, la testa che gira da sola sul suo piolo, la croce con il suo telaio); dipinta come la lanterna (tre toni, bordo caldo, bagliori
// morbidi). Unità del modello a sc 1: x avanti, y a sinistra (la destra è y negativa), z in su; l'origine è a terra tra i piedi.
// Mosse: idle, walk, hit, slam (Manate), slam3 (Manate a catena), strings (Fili d'oro), puppets (Burattini), lasso (il filo del
// burattino), yank (Tira!), snap (Filo spezzato), vanish (Sipario), drop (Dal riflettore), hand (Mano dell'Ombra), rage (Il vero
// Burattinaio), taunt (Presa in giro), call (Ti chiama), enter (Entrata), die (Sconfitta). Opzioni: o.p2, o.noFx, o.z (altezza della
// caduta data dal gioco), o.jig (colpito, 0..1), o.look (dove guarda la testa, rad), o.talk (parla, 0..1), o.veil (croce, fili alti e
// Ombra velati, 0..1), o.mini (anteprime delle arene), o.game (il gioco disegna il lazo, i fili verso le botole e la luce della
// caduta), o.traps ([{x,y}] le botole, nel mondo), o.out (il modello ci scrive i punti sullo schermo, nel mondo: tipR, tipL, wristR,
// wristL, cross, head). Con LOWFX niente bagliori, perle, fumo, polvere né scintille; nebbia piatta, sipario a 4 pieghe, gorgiera a 10.
// Disegni per il gioco con lo stesso aspetto: il burattino nuovo (modello 'puppet2'), N3.puppeteer2Hand (la mano gigante dell'Ombra che
// cade: con o.a 0 le dita vanno in su sullo schermo e il pollice a sinistra, come l'ombra della mano che disegna il cervello),
// N3.puppeteer2Trap (la botola) e N3.puppeteer2Info (i momenti dei colpi e degli avvisi). Modello 'puppeteer2': nel gioco prende il nome
// 'puppeteer' (src/js/89-burattinaio-nuovo.js).
// Scelte dove il design non bastava: il sipario è largo 96 e alto 166 (con 78 le grandi mani restavano fuori ai lati, con 150 la cima
// del cappuccio e le sue punte si vedevano attraverso la parte che sfuma nel buio); l'asticella delle ginocchia va da −20 a +20 (con ±11
// i fili delle ginocchia passavano davanti al viso); nell'entrata i polsi afflosciati sono a ±29 (dietro il sipario); le code del frac
// girano un poco in avanti intorno ai fianchi (di lato erano una riga); sul cappuccio la radice delle punte non ha il contorno (una punta
// che viene verso di noi sembrava un buco); un pezzo che passa davanti o dietro alla botte sfuma solo per pochi gradi, mai in una posa
// che resta ferma; i lampi delle mosse salgono e scendono in qualche fotogramma (mai uno scatto da un fotogramma all'altro, tranne i
// colpi voluti: i pugni che cadono a peso morto, la frusta, lo strappo verso l'alto del Sipario).
(()=>{const C=C3,K3=C3K,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,run,cmix,poly,bbox,
  rotX,rotY,rotZ,keys,sstep,hitK,frame,ellAt,ellN,AXES,chain,parts,reg,shine,ik,glowTop,cam,hull,rim,chull,bump,floor,wa}=C;
const{trem,fxOn,cheat,pls,rise,ga,ellCap,fadeDraw,grad3,ellSil,smoothP,rimP,frm,ringS,limbGrad,T3,mixT,mixRgb,rotAx}=K3;

// ------------------------------------------------------------------ helpers
const lin=(K,p)=>{if(p<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p<=b[0])return lerp(a[1],b[1],(p-a[0])/Math.max(1e-6,b[0]-a[0]))}return K[K.length-1][1]};
const kv=(K,p)=>p<=K[0][0]?(Array.isArray(K[0][1])?K[0][1].slice():K[0][1]):keys(K,p);
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const rgba=(rgb,a)=>`rgba(${rgb},${cl(a,0,1).toFixed(3)})`;
// a thick line with the outline under it (bars, threads)
function stroke2(pts,w,col,lw){ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  if(lw){ctx.strokeStyle=INK;ctx.lineWidth=w+lw;ctx.stroke()}ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
// a ball painted in three tones with the thick outline and the warm rim. Its two gradients are made once for its radius and its colours, in
// its own coordinates (the canvas moves to it): the many little balls (ruff, joints, knobs, bells) cost little
const BGC=new WeakMap();
function ballG(T,r,al){let M=BGC.get(T);if(!M){M=new Map();BGC.set(T,M)}const rk=Math.round(r*8),key=rk*128+Math.round(al*100);let G=M.get(key);
  if(!G){const R=rk/8;G={f:grad3([-R,-R,R,R],T),rm:null};if(R>=4){const g=ctx.createLinearGradient(-R*.8,-R*.8,R*.15,R*.15);g.addColorStop(0,wa(al));g.addColorStop(1,wa(0));G.rm=g}M.set(key,G)}
  return G}
function ball3(q,r,T,lw,al){const G=ballG(T,r,al||.28),x=q[0],y=q[1];ctx.lineJoin='round';ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fillStyle=G.f;ctx.fill();
  if(lw!==0){ctx.strokeStyle=INK;ctx.lineWidth=lw||2.2;ctx.stroke()}
  if(G.rm){ctx.beginPath();ctx.arc(0,0,Math.max(.4,r-1.9),0,TAU);ctx.strokeStyle=G.rm;ctx.lineWidth=1.3;ctx.stroke()}ctx.translate(-x,-y)}
// a polyline stroked in one path (round ends)
function pline(Q,col,w){ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length;i++)ctx.lineTo(Q[i][0],Q[i][1]);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
// the lantern's shadeLimb (a darker side away from the light, a thin warm line on the lit one) inside the limb's clip, already made
function shadeIn(a,b,ra,rb){let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy);if(l<.4)return;dx/=l;dy/=l;let nx=-dy,ny=dx;if(nx+ny>0){nx=-nx;ny=-ny}ra*=.9;rb*=.9;ctx.lineCap='round';
  ctx.strokeStyle='rgba(60,28,10,.2)';ctx.lineWidth=(ra+rb)*.44;seg([a[0]-nx*ra*.66,a[1]-ny*ra*.66],[b[0]-nx*rb*.66,b[1]-ny*rb*.66]);ctx.stroke();
  ctx.strokeStyle=wa(.16);ctx.lineWidth=Math.max(.5,(ra+rb)*.17);seg([a[0]+nx*ra*.52,a[1]+ny*ra*.52],[b[0]+nx*rb*.52,b[1]+ny*rb*.52]);ctx.stroke()}
// a capsule added to the current path (no beginPath)
function hullP(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);
  if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b,r=Math.max(ra,rb);ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));ctx.moveTo(a[0]+ra*Math.cos(an+f),a[1]+ra*Math.sin(an+f));ctx.arc(a[0],a[1],ra,an+f,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}
// the warm rim inside a chain of capsules (screen points, radii), as the lantern's rim() but in one stroke for the whole chain, with a
// gradient made once for its size and moved to it
const RGC=new Map();
function rimChain(Q,rs,al){const b=bbox(Q),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,rk=Math.max(1,Math.round((Math.max(b[2]-b[0],b[3]-b[1])/2+rs[0])/2)),key=rk*128+Math.round(al*100);
  let g=RGC.get(key);if(!g){const R=rk*2;g=ctx.createLinearGradient(-R*.8,-R*.8,R*.15,R*.15);g.addColorStop(0,wa(al));g.addColorStop(1,wa(0));RGC.set(key,g)}
  ctx.translate(cx,cy);ctx.beginPath();for(let i=0;i<Q.length-1;i++)hullP([Q[i][0]-cx,Q[i][1]-cy],Math.max(.4,rs[i]-1.9),[Q[i+1][0]-cx,Q[i+1][1]-cy],Math.max(.4,rs[i+1]-1.9));
  ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke();ctx.translate(-cx,-cy)}
// a capsule painted across (from the lit side to the dark one)
function caps3(a,ra,b,rb,T,lw){ctx.lineJoin='round';hull(a,ra,b,rb);ctx.fillStyle=limbGrad(a,b,Math.max(ra,rb),T);ctx.fill();if(lw!==0){ctx.strokeStyle=INK;ctx.lineWidth=lw||2.3;ctx.stroke()}}
// a 4-point star of light
function star4(q,r,a,col){if(a<=.01||r<.3)return;ctx.save();ctx.globalAlpha*=Math.min(1,a);ctx.fillStyle=col||'#ffffff';ctx.beginPath();ctx.moveTo(q[0],q[1]-r);ctx.quadraticCurveTo(q[0],q[1],q[0]+r*.8,q[1]);
  ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]+r);ctx.quadraticCurveTo(q[0],q[1],q[0]-r*.8,q[1]);ctx.quadraticCurveTo(q[0],q[1],q[0],q[1]-r);ctx.fill();ctx.restore()}
// a soft glow that adds light
function glowL(rgb,q,r,a){if(LOWFX||a<=.01)return;ctx.save();ctx.globalCompositeOperation='lighter';shine(rgb,q[0],q[1],r,a);ctx.restore()}
// a five-pointed star (the buttons), squashed across by k
function star5(q,r,k,rot){ctx.beginPath();for(let i=0;i<10;i++){const a=rot+i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(q[0]+Math.cos(a)*rr*k,q[1]+Math.sin(a)*rr)}ctx.closePath()}

// ------------------------------------------------------------------ colours: three tones per piece (light, base, shadow)
const K1={vel:T3('#a47ae8','#6e42b8','#351a6e'),cri:T3('#c8384f','#8f1d35','#4a0b1d'),plum:T3('#74468f','#4a2463','#230f35'),
  wood:T3('#f3c98a','#c4864a','#6f4224'),grain:'rgba(141,90,51,.35)',peg:'#3a2416',ivory:T3('#fffaf0','#f1e4c8','#b9a383'),
  mask:T3('#3a1838','#24102a','#120610'),gold:T3('#fff1a8','#ffcd45','#b17b12'),ruff:T3('#ffffff','#f3eeff','#c5b8e4'),
  shoe:T3('#6c4c8c','#3f2659','#1d102b'),wear:'#8a6aa8',crossW:T3('#9c6c46','#5f3b22','#2d190c'),
  cheek:'224,96,127',smile:'#6a1d44',nose:T3('#ffd2b4','#e8a07a','#c87a58'),mouthIn:'#1c0a18',mouthL:'170,110,255',fang:'#fff6e0',
  eye:'#ffd84a',eyeC:'#fff6c8',eyeG:'255,216,74',str:'255,233,160',strHot:'#fffbe8',top:null,crk:'255,122,214',smoke:'120,60,180'};
const K2={vel:T3('#8a5ccc','#55309a','#261050'),cri:T3('#a82a48','#6a1028','#300614'),plum:T3('#5e3478','#3a1a52','#1a0828'),
  eye:'#ff5fc8',eyeC:'#ffe6f6',eyeG:'255,95,200',str:'255,154,224',strHot:'#ffe0f4',top:'255,95,200'};
// the Shadow (phase 2) and the curtain
const SHD={mist:'26,12,44',rim:'120,70,200',hand:T3('#4a2a6e','#2a1444','#120820'),hr:'255,95,200',eye:'#ff5fc8',eyeG:'255,95,200'};
const PALC={};
function pal(k2){k2=Math.round(cl(k2,0,1)*12)/12;if(PALC[k2])return PALC[k2];const K=Object.assign({},K1);if(k2>0){
  for(const n of['vel','cri','plum'])K[n]=mixT(K1[n],K2[n],k2);for(const n of['eye','eyeC','strHot'])K[n]=cmix(K1[n],K2[n],k2);
  for(const n of['eyeG','str'])K[n]=mixRgb(K1[n],K2[n],k2);K.top=k2>.05?K2.top:null;K.topA=k2}K.strC='rgb('+K.str+')';return PALC[k2]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to its left, z up; 0,0,0 the floor point)
const HIP=[-1,11,44],LTH=18.5,LSH=20.4;                  // the hips (±y), thigh and shin
const SHJ=[0,30,80],LUA=21,LFA=20,PUFF=[0,29,84],PUFFR=12; // the shoulder joint, upper arm and forearm, the puffed sleeve
const BC=[0,0,66],BRD=[17,25,24];                         // the barrel doublet
const HC0=[3,0,108],HOOD=18.6;                            // the head (its own turn on the peg), the hood over it
const CR0=[0,0,158];                                      // the control cross
const RUFC=[1,0,91],RUFR=15.5,RUFB=4.8;                   // the ruff
const WR0=[12,39,42],AN0=[-1,10,6];                       // the wrists and the ankles at rest
const GS=1.4;                                             // the big gloves
// the face: the cap of ivory on the front of the head (62° wide, a little taller), the eyes, the jaw
const FACEN=[1,0,.05],FACEA=1.0,FACEAV=1.02,EYEF=.36,EYEP=.36;
const dirAt=(f,s)=>[Math.cos(s)*Math.cos(f),Math.cos(s)*Math.sin(f),Math.sin(s)];
// the two points of the hood (head space, from the root to the tip), their radii, the bell under the tip
const TIP=[[-5,8,13],[-7,15,18],[-9,26,17],[-9,33,10],[-8,35,3]],TIPR=[6,5,3.8,2.8,2],TIPLAG=[0,0,.35,.7,1],TIPDROOP=[0,0,4,10,16];
// the coat tails: where they hang from (behind the belt) and where they end
const TAILA=[-15,7,48],TAILB=[-18,9,22];

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','slam','slam3','strings','puppets','lasso','yank','snap','vanish','drop','hand','rage','taunt','call','enter','die'];
const DUR={idle:3,walk:1.2,hit:.6,slam:1.8,slam3:2.8,strings:1.8,puppets:1.9,lasso:1.6,yank:1.5,snap:1,vanish:1.4,drop:1.9,hand:2.4,rage:3.2,taunt:1.2,call:1,enter:3.4,die:3.8};
const LAB={idle:'Fermo',walk:'Cammina',hit:'Colpito',slam:'Manate',slam3:'Manate a catena',strings:"Fili d'oro",puppets:'Burattini',lasso:'Il filo del burattino',
  yank:'Tira!',snap:'Filo spezzato',vanish:'Sipario',drop:'Dal riflettore',hand:"Mano dell'Ombra",rage:'Il vero Burattinaio',taunt:'Presa in giro',call:'Ti chiama',
  enter:'Entrata',die:'Sconfitta'};
// the moments of the blows (the brain reads them from N3.puppeteer2Info)
const INFO={slam:.52,slam3:[.4,.64,.9],strings:.4,puppets:.62,lasso:.68,yank:[.12,.39,.66],yankHit:.94,vanish:.45,drop:.28,hand:.78,
  slamWarn:.04,lassoLock:.28,handLock:.36,cry:.76,dieClou:.46};
const STR=['h','wL','wR','kL','kR','up'];
const S0=()=>({t:1,l:0,u:-1,b:-1,v:0});
// a hand: fd the fingers' direction, bk the back of the hand (root space; null: along the forearm, the back outward) with their weights
// fk and bkk (0 the default, 1 the direction given: the moves mix them, never switch them), c the curl of the three fingers (0 open .. 1
// fist; the index is c[0] on the left hand and c[2] on the right one, next to the thumb), th the thumb, pt the index straight
const HP=(fd,bk,c,th,pt)=>({fd,fk:1,bk,bkk:1,c:c||[.25,.3,.35],th:th==null?.3:th,pt:pt||0});
const FIST=()=>HP(null,null,[1,1,1],1,0),REST=()=>HP(null,null);
// a pointing hand of the side sd: the index straight, the other two fingers curled by c
const IDX=(sd,fd,bk,c,th)=>HP(fd,bk,sd>0?[0,c,c]:[c,c,0],th==null?.8:th,1);
// a hand pose mixed toward another one by t (a missing direction is the default with weight 0): no pose ever switches in one frame
function HPmix(a,b,t){if(t<=0)return a;if(t>=1)return b;const m=(x,xk,y,yk)=>[x&&y?lerp3(x,y,t):(x||y),lerp(x?xk:0,y?yk:0,t)];
  const[fd,fk]=m(a.fd,a.fk,b.fd,b.fk),[bk,bkk]=m(a.bk,a.bkk,b.bk,b.bkk);
  return{fd,fk,bk,bkk,c:[0,1,2].map(i=>lerp(a.c[i],b.c[i],t)),th:lerp(a.th,b.th,t),pt:lerp(a.pt,b.pt,t)}}
function rest(p2){const A={B:[0,0,0],lean:0,roll:0,yaw:0,s:0,lift:p2?3:0,breath:0,
  fL:AN0.slice(),fR:[AN0[0],-AN0[1],AN0[2]],tL:0,tR:0,fyL:0,fyR:0,kpole:null,
  hL:WR0.slice(),hR:[WR0[0],-WR0[1],WR0[2]],gL:HP(null,null),gR:HP(null,null),
  hy:0,hp:.12,hr:0,hx:0,hz:0,jaw:p2?1.5:0,lid:0,eg:1,wide:0,stars:0,look:1,
  cx:[0,0,0],cr:0,cp:0,cyw:0,kb:0,cvis:1,cup:1,
  S:{h:S0(),wL:S0(),wR:S0(),kL:S0(),kR:S0(),up:S0()},vib:0,
  jb:0,jph:0,droop:0,tsw:0,tail:0,k2:p2?1:0,crk:p2?1:0,smoke:0,
  cur:null,sh:p2?{k:1,eye:1,eg:1,sq:0,blink:1,gz:0,go:0,free:null,breath:0}:null,hint:0,fx:[],thr:null,lasso:null,fthr:null,ring:null};
  if(p2){A.tL=A.tR=.38;for(const k of STR){A.S[k].t=1}}
  return A}
// light a string at p = a (the pearl runs down in .1), out by b
function lightS(A,ks,p,a,b){for(const k of ks){const s=A.S[k],l=rise(p,a,a+.035,b-.035,b);s.l=Math.max(s.l,l);if(p>=a&&p<a+.1)s.u=(p-a)/.1}}
const slack=(A,t,ks)=>{for(const k of ks||STR)A.S[k].t=Math.min(A.S[k].t,t)};
// a slack string pulled taut again at p = a (after slack(): it can only raise the tension), with a «tac» on its eyelet
const tense=(A,k,p,a,noTac)=>{A.S[k].t=Math.max(A.S[k].t,sstep(a-.005,a+.02,p));if(!noTac&&p>=a&&p<a+.05)A.fx.push({k:'tac',s:k,t:(p-a)/.05})};
const snapS=(A,k,p,a)=>{if(p>=a){A.S[k].b=cl((p-a)/.08,0,1);if(p<a+.12)A.fx.push({k:'spark',s:k,t:(p-a)/.12})}};
// the eyes' light grows a moment before each blow (the halo ×1.4)
const preHit=(A,p,hs)=>{for(const h of hs)A.eg=Math.max(A.eg,1+pls(p,h-.05,.09))};
// the shoe's lowest point under the ankle when the toes point down by t: how much the ankle must rise so that the sole never goes into
// the floor (the sole is an ellipsoid 4.6 in front of the ankle and 2.6 below it, radii 10 along the foot and 3.3 up)
const toeLift=t=>{const s=Math.sin(t),c=Math.cos(t);return Math.max(0,4.6*s+2.6*c+Math.sqrt(100*s*s+10.9*c*c)-5.9)};
// the heap: a puppet nobody moves (sitting on the floor, the legs bent outward, the arms wide on the floor, the head lolling)
function heap(A,k,sd){if(k<=0)return;const s=sd||1;
  A.B=lerp3(A.B,[2,0,-33],k);A.lean=lerp(A.lean,.3,k);A.roll=lerp(A.roll,.14*s,k);A.yaw=lerp(A.yaw,0,k);
  A.fL=lerp3(A.fL,[20,27,4],k);A.fR=lerp3(A.fR,[20,-27,4],k);A.tL=lerp(A.tL,-.45,k);A.tR=lerp(A.tR,-.45,k);A.fyL=lerp(A.fyL,.55,k);A.fyR=lerp(A.fyR,.55,k);
  A.kpole=[.5,1,.6];A.kpk=k;   // (the knees out and a little forward: seen from the front they are clearly in front of the barrel)
  A.hL=lerp3(A.hL,[8,50,4],k);A.hR=lerp3(A.hR,[8,-50,4],k);A.gL=HPmix(A.gL,HP([.5,1,0],[0,0,1],[.2,.25,.3],.2),k);A.gR=HPmix(A.gR,HP([.5,-1,0],[0,0,1],[.2,.25,.3],.2),k);
  A.hp=lerp(A.hp,.6,k);A.hr=lerp(A.hr,.7*s,k);A.hy=lerp(A.hy,.25*s,k);A.droop=Math.max(A.droop,k);A.look=lerp(A.look,0,k);A.tail=lerp(A.tail,.5,k)}
function pPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter'&&anim!=='rage',A=rest(P2);
  // the idle sway that every standing pose keeps a little of: the cross draws a slow eight, the body follows
  const sway=(w)=>{A.cx=add(A.cx,mul([2.5*Math.sin(2*ph),4*Math.sin(ph),1.2*Math.sin(ph)],w));A.cr+=.05*w*Math.sin(ph);A.cp+=.04*w*Math.sin(2*ph+1);
    A.B[1]+=1.5*w*Math.sin(ph-.38);A.breath=.02*w*(.5-.5*Math.cos(ph))};
  const hang2=(w)=>{if(!P2)return;// carried: the legs swing like a pendulum under it
    const sw=Math.sin(ph-.6)*w;A.fL[0]+=3*sw;A.fR[0]+=3*sw}
  if(anim==='idle'){sway(1);hang2(1);
    A.B[2]-=1.5*(.5-.5*Math.cos(ph-.38));A.tsw=.12*Math.sin(ph-.63);A.tail=.06*Math.sin(ph-.63);A.jb=.25+.25*Math.sin(ph*2);A.jph=p*2;
    // the fingers play invisible strings: a wave at .15 and one at .60 (the other hand .20 later)
    for(const[sd,o2] of[[1,0],[-1,.2]]){const g=sd>0?A.gL:A.gR,c=[];for(let i=0;i<3;i++){const j=sd>0?2-i:i,w=pls(p,(.15+o2+j*.035)%1,.09)+pls(p,(.6+o2+j*.035)%1,.09);c.push(g.c[i]+.5*w*(P2?1.8:1))}g.c=c}
    A.jaw=Math.max(A.jaw,1.5*(pls(p,.3,.04)+pls(p,.36,.04)));
    A.hy=lin([[0,0],[.1,0],[.16,.5],[.3,.5],[.36,0],[.45,0],[.5,-.5],[.6,-.5],[.66,0],[.68,0],[.84,1.9],[.85,1.9],[.88,-.12],[.9,.05],[.92,0],[1,0]],p);
    if(p>.68&&p<.85)A.hy=1.9*ez((p-.68)/.17);
    A.lid=pls(p,.885,.03);if(!P2)A.tR-=.35*pls(p,.55,.06);
    if(!P2)A.hint=pls(p,.96,.06);
    if(P2){A.sh.breath=.04*(.5-.5*Math.cos(ph));A.sh.blink=1-pls(p,.3,.05)-pls(p,.8,.05);A.crk=.75+.25*Math.sin(ph*2)}}
  else if(anim==='walk'){A.look=1;
    if(!P2){// a puppet's step: the string of the knee pulls the knee up (12 up, 14 forward), the shin dangles under it with the toes
      // down, the foot comes down on its toe at .45 (and .95) and flattens, then slides back under him; the string of the leg that rises
      // is the tauter one
      for(const[sd,o2] of[[-1,0],[1,.5]]){const q=((p-o2)%1+1)%1,sw=q<.5,u=sw?q/.5:0,su=sw?0:(q-.5)/.5,f=sd>0?A.fL:A.fR;
        const t=sw?.55*Math.pow(Math.sin(Math.PI*u),.6):0;
        f[0]+=sw?lerp(-8,8,ez(u))+10*Math.sin(Math.PI*u):lerp(8,-8,su);f[2]+=sw?12*Math.sin(Math.PI*Math.min(1,u/.9))+toeLift(t):0;
        if(sd>0)A.tL=t;else A.tR=t;A.S[sd>0?'kL':'kR'].t=.8+.2*Math.sin(Math.PI*u)}
      A.B[2]+=2.5*(.5-.5*Math.cos(2*ph));A.roll=.04*Math.sin(ph);A.cx[0]+=4;A.kb=.25*Math.sin(ph)}
    else{// carried by the Shadow: the feet over the floor, toes down, the legs left behind like a pendulum
      const sw=Math.sin(ph);A.fL[0]+=-4+3*sw;A.fR[0]+=-4-3*sw;A.lean=-.08;A.roll=.05*Math.sin(ph);A.cx[0]+=5;A.B[2]+=1.2*Math.sin(2*ph)}
    // the arms swing loose, against the legs, a little late
    const as=Math.sin(ph-.5);A.hL[0]+=6*as;A.hR[0]-=6*as;A.hL[2]+=1.5*Math.abs(as);A.hR[2]+=1.5*Math.abs(as);
    A.tsw=.2*Math.sin(2*ph-.6);A.tail=.12*Math.sin(2*ph-.7);A.jb=.6;A.jph=p*4;A.hp=.14;A.cx[1]+=2*Math.sin(ph-.4);
    if(P2)A.crk=.85}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.3*kb;A.B[0]-=4*kb;A.hy=1.2*Math.sin(Math.PI*cl(p/.6,0,1));A.lid=sstep(0,.04,p)*(1-sstep(.5,.6,p));A.stars=sstep(0,.06,p)*(1-sstep(.4,.75,p));A.vib=1.5*(1-p);A.look=0;
    A.hL=add(A.hL,[-6*kb,4*kb,8*kb]);A.hR=add(A.hR,[-6*kb,-4*kb,8*kb]);A.cp=-.2*kb;A.jb=1;A.jph=p*4;A.tsw=-.3*kb}
  else if(anim==='slam'){A.look=0;
    lightS(A,['wL','wR'],p,0,.47);preHit(A,p,[.52]);A.jb=lin([[0,1],[.08,1],[.14,.4],[.44,.4],[.5,0],[1,0]],p);A.jph=p*8;A.lid=.55*rise(p,.0,.06,.74,.8);
    const up=sstep(.06,.4,p),dn=sstep(.47,.52,p),st=sstep(.74,.78,p)*.5+sstep(.8,.84,p)*.5;
    A.cp=-.25*rise(p,0,.06,.45,.5);A.cx[2]=lin([[0,0],[.06,6],[.4,22],[.47,22],[.52,-8],[.74,-8],[.78,8],[.84,0],[1,0]],p);
    A.lean=lin([[0,0],[.06,-.05],[.4,-.15],[.47,-.15],[.52,.7],[.74,.7],[.78,.4],[.84,.05],[.9,-.03],[1,0]],p);
    A.B[2]=lin([[0,0],[.47,0],[.52,-18],[.74,-18],[.78,-9],[.84,0],[1,0]],p);
    const hu=[0,29,120],hd=[34,20,10],tr=.8*trem(p,.4,.47,7,1.8),dn2=dn*dn;
    for(const sd of[1,-1]){let h;if(p<.47)h=lerp3(sd>0?A.hL:A.hR,[hu[0],sd*hu[1],hu[2]+tr],up);else if(p<.52)h=lerp3([hu[0],sd*hu[1],hu[2]],[hd[0],sd*hd[1],hd[2]],dn2);
      else if(p<.74)h=[hd[0],sd*hd[1],hd[2]];else h=lerp3([hd[0],sd*hd[1],hd[2]],sd>0?WR0:[WR0[0],-WR0[1],WR0[2]],st);
      if(sd>0)A.hL=h;else A.hR=h;
      // fists from the warning to the blow, along the forearm (raised, the knuckles point up; falling, they lead down); on the floor the
      // hands open flat and the fingers scratch it (one after the other, 5 a second); then the rest
      let g=HPmix(REST(),FIST(),sstep(0,.06,p)*(1-sstep(.52,.58,p)));const fl=rise(p,.52,.58,.74,.8);
      if(fl>0)g=HPmix(g,HP([.75,sd*.15,-.65],[0,0,1],[0,1,2].map(i=>.25+.6*(.5+.5*Math.sin(p*TAU*9+i*1.1+(sd>0?0:.8)))),.3),fl);
      if(sd>0)A.gL=g;else A.gR=g}
    A.jaw=Math.max(A.jaw,5*rise(p,.1,.2,.4,.47));A.hp=lin([[0,.12],[.4,-.05],[.47,0],[.52,.55],[.74,.55],[.84,.12],[1,.12]],p);
    if(p>=.47&&p<.74)slack(A,.15);else if(p>=.74&&p<.8)slack(A,.6);
    if(p>=.52&&p<.6)A.fx.push({k:'pound',t:(p-.52)/.08});A.tsw=.3*rise(p,.47,.52,.74,.84);A.tail=.25*rise(p,.47,.52,.74,.84)}
  else if(anim==='slam3'){A.look=0;
    // three blows that come forward: the left fist, the right, both. It comes down from its hover onto the floor for them (.00-.05) and goes
    // back up at the end (.95-1)
    const k0=sstep(0,.05,p)*(1-sstep(.95,1,p));A.lift=3*(1-k0);
    lightS(A,['wL'],p,0,.4);lightS(A,['wR'],p,.44,.64);lightS(A,['wL','wR'],p,.68,.9);preHit(A,p,[.4,.64,.9]);A.jb=1;A.jph=p*9;
    A.cr=lin([[0,0],[.05,.3],[.4,.3],[.44,-.3],[.64,-.3],[.68,0],[1,0]],p);A.cp=-.25*rise(p,.68,.72,.86,.9);
    // each fist: from the rest to a fist in front (N), up over the shoulder (U), falling dead weight (accelerating) to the floor (F), back
    const W0L=WR0,W0R=[WR0[0],-WR0[1],WR0[2]],NL=[20,30,60],NR=[20,-30,60],UL=[2,28,120],UR=[2,-28,120],F1=[36,16,10],F2=[36,-16,10],F3L=[34,20,10],F3R=[34,-20,10];
    const path=(S)=>{for(const[a,b,f,t,e] of S)if(p<=b){const k=cl((p-a)/(b-a),0,1);return lerp3(f,t,e==='fall'?k*k:ez(k))}return S[S.length-1][3]};
    A.hL=path([[0,.05,W0L,NL],[.05,.34,NL,UL],[.34,.4,UL,F1,'fall'],[.4,.46,F1,F1],[.46,.56,F1,NL],[.56,.7,NL,NL],[.7,.84,NL,UL],[.84,.9,UL,F3L,'fall'],[.9,.95,F3L,F3L],[.95,1,F3L,W0L]]);
    A.hR=path([[0,.05,W0R,NR],[.05,.46,NR,NR],[.46,.6,NR,UR],[.6,.64,UR,F2,'fall'],[.64,.7,F2,F2],[.7,.84,F2,UR],[.84,.9,UR,F3R,'fall'],[.9,.95,F3R,F3R],[.95,1,F3R,W0R]]);
    A.gL=HPmix(REST(),FIST(),k0);A.gR=HPmix(REST(),FIST(),k0);
    A.lean=lin([[0,0],[.05,.05],[.34,-.1],[.4,.6],[.44,.6],[.54,.3],[.6,-.05],[.64,.6],[.68,.6],[.78,.3],[.84,-.12],[.9,.75],[.95,.75],[1,0]],p);
    A.roll=lin([[0,0],[.4,.2],[.5,.1],[.64,-.2],[.75,-.1],[.9,0],[1,0]],p);
    A.B[2]=lin([[0,0],[.38,0],[.4,-16],[.44,-14],[.54,-4],[.62,0],[.64,-16],[.68,-14],[.78,-4],[.88,0],[.9,-20],[.95,-20],[1,0]],p);
    // dragged forward by the Shadow (the game moves it 45 px): the feet trail on their toes, the body stays back
    const dr=rise(p,.42,.46,.5,.54)+rise(p,.66,.7,.74,.78);A.fL[0]-=10*dr;A.fR[0]-=10*dr;A.tL=A.tR=.38*(1-k0)+.5*dr;A.lean-=.15*dr;
    const dn=Math.max(rise(p,.36,.4,.44,.5),rise(p,.6,.64,.68,.72),rise(p,.86,.9,.95,1));A.hp=.12+.3*dn;A.jaw=3*(pls(p,.38,.05)+pls(p,.62,.05)+pls(p,.88,.06));
    if(p>=.9&&p<.95)slack(A,.2);for(const c of[.4,.64,.9])if(p>=c&&p<c+.08)A.fx.push({k:'pound',t:(p-c)/.08,one:c<.9?(c<.5?1:-1):0});
    A.smoke=.5*rise(p,.36,.42,.9,.98);A.tsw=.25*Math.sin(p*TAU*3)*rise(p,0,.05,.95,1);A.tail=.2*Math.sin(p*TAU*2)*rise(p,0,.05,.95,1)}
  else if(anim==='strings'){A.look=1-sstep(.38,.46,p);
    lightS(A,['wL','wR'],p,0,.45);preHit(A,p,[.4]);A.jb=lerp(1,.2,sstep(.08,.14,p));A.jph=p*8;A.lid=.5*rise(p,.05,.1,.42,.5);
    const op=sstep(0,.08,p),wh=sstep(.38,.42,p),bk=sstep(.62,1,p);
    for(const sd of[1,-1]){const h0=sd>0?A.hL:A.hR,hs=[8,sd*66,82],hw=[34,sd*40,70];let h=lerp3(h0,hs,op);h=lerp3(h,hw,wh);h=lerp3(h,h0,bk);
      if(sd>0)A.hL=h;else A.hR=h;
      // the index fingers point out to hold the thread between them, then forward with the whip; back at rest the fingers close one by one
      const gW=IDX(sd,[1,sd*.2,0],[0,0,1],1);let g=HPmix(HPmix(REST(),IDX(sd,[0,sd,0],[0,0,1],1),op),gW,wh);
      if(bk>0){const r=REST();g=HPmix(g,r,bk);g.c=g.c.map((c,i)=>{const j=sd>0?i:2-i;return lerp(gW.c[i],r.c[i],sstep(.62+.08*j,.8+.08*j,p))});g.pt=1-sstep(.62,.8,p)}
      if(sd>0)A.gL=g;else A.gR=g}
    A.lean=-.08*rise(p,.08,.2,.36,.4)+.15*rise(p,.4,.45,.6,.72);A.cx[2]+=8*rise(p,.08,.2,.4,.5);A.vib=.8*rise(p,.08,.12,.36,.4);
    if(p<.4&&op>.6)A.thr={k:sstep(.08,.4,p),tr:1-sstep(.08,.3,p)};A.jaw=2*rise(p,.36,.4,.46,.55)}
  else if(anim==='puppets'){A.look=1-sstep(.6,.68,p);
    lightS(A,['wL','wR'],p,0,.85);preHit(A,p,[.62]);A.jb=lerp(1,.3,sstep(.08,.14,p));A.jph=p*8;
    const up=sstep(0,.1,p)*(1-sstep(.62,.68,p)),bw=rise(p,.62,.68,.82,.97),fp=rise(p,.3,.34,.58,.62),jo=12*pls(p,.645,.05);
    for(const sd of[1,-1]){const h0=sd>0?A.hL:A.hR;let h=lerp3(h0,[20,sd*26,92],up);
      // the hands up in front, palms down; the fingers play the air, three waves a second
      let g=HP([1,0,-.25],[0,0,1],fp>0?[0,1,2].map(i=>.15+.6*fp*(.5+.5*Math.sin(p*TAU*5.7+i*1.2+(sd>0?0:.9)))):[.15,.15,.15],.2);g=HPmix(REST(),g,up);
      // the jolt that pulls the puppets out (.62), then the bow: the right hand on its chest, the left one open to the side; back to the rest
      if(bw>0){h=lerp3(h,sd<0?[22,-4,80]:[10,58,74],bw);g=HPmix(g,sd<0?HP([0,1,0],[1,0,0],[.2,.2,.25],.3):HP([.2,1,.3],[0,0,1],[0,0,0],0),bw)}
      h=add(h,[0,0,jo]);if(sd>0){A.hL=h;A.gL=g}else{A.hR=h;A.gR=g}}
    A.cr=.15*fp*Math.sin(p*TAU*3);A.vib=.8*fp;A.lean=.4*bw;A.hp=.12+.25*bw;A.hr=.3*bw;A.jaw=Math.max(A.jaw,2*rise(p,.1,.14,.26,.3)*(.5+.5*Math.sin(p*80)));
    if(p>=.08&&p<.92)A.fthr={k:sstep(.08,.3,p),out:sstep(.85,.9,p)}}
  else if(anim==='lasso'){A.look=1-sstep(.66,.74,p);
    lightS(A,['wR'],p,0,.72);preHit(A,p,[.68]);A.jb=lerp(1,.15,sstep(.08,.14,p));A.jph=p*8;A.lid=.55*rise(p,.06,.12,.66,.72);
    const up=sstep(.06,.28,p),tr=.6*trem(p,.28,.68,6.5,1.6),fl=pls(p,.69,.05),bk=sstep(.72,1,p);
    // the right index points at the hero; the flick of the wrist; then (if it missed) it shakes the hand, cross (6 a second), and drops it
    let h=lerp3(A.hR,[24,-34,96],up);h=add(h,[fl*10,0,tr-fl*4]);if(p>.72){const sh=1.5*Math.sin((p-.72)*60)*rise(p,.76,.8,.88,.92);h=add(h,[0,sh,0])}h=lerp3(h,A.hR,bk);A.hR=h;
    A.gR=HPmix(HPmix(REST(),IDX(-1,[1,.15,-.08],[0,0,1],1),up),REST(),bk);
    A.hr=.3*rise(p,.06,.2,.68,.74)-.2*rise(p,.8,.86,.92,1);A.ptip=rise(p,.08,.2,.66,.7);
    if(!o.game&&p>=.68&&p<.95)A.lasso={k:p<.8?(p-.68)/.12:1-(p-.8)/.15};A.jaw=1.5*pls(p,.86,.05)}
  else if(anim==='yank'){A.look=0;
    lightS(A,['wR'],p,.72,.98);preHit(A,p,[.94]);A.jb=.3;A.jph=p*8;
    const J=c=>{const d=p-c;return d<0?0:d<.05?ez(d/.05):Math.max(0,1-(d-.05)/.15)*.6+.4*Math.exp(-(d-.05)*8)};const j=Math.max(J(.12),J(.39),J(.66))*(1-sstep(.7,.76,p));
    // it holds the thread where the lasso left the hand (forward, the index out) and jerks it to its chest three times; then it lets it go,
    // charges the fist over its shoulder (.72-.88) and punches (.94); back to the rest
    const rel=sstep(.7,.78,p),ch=rise(p,.72,.8,.9,.94),pn=rise(p,.92,.94,.96,1);
    let h=lerp3([30,-28,80],[14,-24,78],j);h=lerp3(h,A.hR,rel);h=lerp3(h,[-6,-34,100],ch);h=lerp3(h,[36,-14,62],pn);A.hR=h;
    A.gR=HPmix(HPmix(IDX(-1,[1,.1,0],[0,0,1],1),FIST(),sstep(.72,.78,p)),REST(),sstep(.96,1,p));
    A.lean=-.25*j+.25*pn-.05*ch;A.cp=-.2*j;A.yaw=-.3*ch;A.B[0]+=6*pn-3*j;A.jaw=2*j;A.lid=.4*ch;
    if(!o.game)A.lasso={k:1,tied:1,al:1-rel}}
  else if(anim==='snap'){A.look=0;
    const st=sstep(0,.12,p)*(1-sstep(.55,.62,p));slack(A,lerp(1,.1,sstep(0,.04,p)));tense(A,'h',p,.62);tense(A,'wL',p,.7);tense(A,'wR',p,.7);tense(A,'kL',p,.8);tense(A,'kR',p,.8);
    A.lean=-.32*st+.06*Math.sin(p*30)*st;A.B[0]-=8*st;A.hy=1.4*rise(p,.05,.2,.4,.6);A.lid=Math.sin(p*40)>.3&&p<.6?1:0;A.stars=sstep(0,.05,p)*(1-sstep(.4,.7,p));
    // the arms windmill
    const wm=p*TAU*2.2;A.hL=lerp3(A.hL,[4+10*Math.cos(wm),44,74+16*Math.sin(wm)],st);A.hR=lerp3(A.hR,[4+10*Math.cos(wm+2),-44,74+16*Math.sin(wm+2)],st);
    A.gL=A.gR=HPmix(REST(),HP(null,null,[0,0,0],0),sstep(0,.05,p)*(1-sstep(.6,.8,p)));A.jaw=3*st*(.5+.5*Math.sin(p*44));A.tsw=.4*st*Math.sin(p*25);A.jb=1;A.jph=p*7;
    if(p<.15)A.fx.push({k:'snapR',t:p/.15})}
  else if(anim==='vanish'){A.look=1;lightS(A,['up'],p,0,.45);A.S.up.v=1.4*rise(p,0,.03,.4,.45);A.jb=lerp(1,.3,sstep(.1,.16,p));A.jph=p*8;
    A.cur={k:sstep(.06,.32,p)*(1-sstep(.55,.85,p)),w:rise(p,.06,.3,.6,.85)+.8*pls(p,.47,.1),bulge:pls(p,.385,.13),ph:p*TAU*2.5};
    const yk=sstep(.45,.55,p);A.lift+=320*yk*yk;A.cx[2]+=40*sstep(.42,.5,p);A.body=1-sstep(.5,.56,p);A.vmask=p>=.44;A.strK=1-sstep(.5,.62,p);A.gL=A.gR=HPmix(REST(),HP(null,null,[.4,.4,.45],.4),sstep(0,.1,p));
    // behind the velvet its shape swells it once (.32-.45): the hands go up a little, it leans back
    {const k=rise(p,.3,.34,.42,.45);A.hL[2]+=8*k;A.hR[2]+=8*k;A.lean=-.1*k}if(P2)A.sh.k=1-sstep(.45,.55,p)}
  else if(anim==='drop'){A.look=0;const z=o.z!=null?o.z:(p<.28?260*(1-(p/.28)*(p/.28)):0);A.lift=Math.max(0,z);
    // the fall: arms and legs wide open, the strings slack and waving over it; at the thud (.28) it melts into a heap in a few frames
    const fk=1-sstep(.28,.33,p);
    if(fk>0){A.hL=[0,58,70];A.hR=[0,-58,70];A.gL=A.gR=HP(null,null,[0,0,0],0);A.fL=[-2,20,10];A.fR=[-2,-20,10];A.tL=A.tR=.3;
      A.lean=-.1;A.hp=-.2;A.wide=fk;A.jaw=3*fk;A.vib=2*fk;A.tsw=.5*Math.sin(p*30)*fk;if(!o.game&&p<.28)A.ring={k:p/.28}}
    slack(A,p<.33?.25:.15);A.jb=lerp(1,.2,sstep(.31,.37,p));A.jph=p*8;
    if(p>=.28){heap(A,1-fk);
      // the strings tense one by one and put it back together, a «tac» and a jolt each: the head .60, the right arm .70, the left one .76,
      // the knees .84; at .90 it stands (hovering in the second phase); .90-1 it shrugs
      const T=[['h',.6],['wR',.7],['wL',.76],['kL',.84],['kR',.84]];for(const[s,a] of T)tense(A,s,p,a);
      const hk=sstep(.58,.62,p),ar=sstep(.68,.72,p),al=sstep(.74,.78,p),kn=sstep(.82,.9,p),t0=P2?.38:0;
      A.hp=lerp(A.hp,.12,hk);A.hr=lerp(A.hr,0,hk);A.hy=lerp(A.hy,0,hk);A.droop=lerp(A.droop,0,hk);A.lid=.5*(1-fk)*(1-hk);
      A.hR=lerp3(A.hR,[WR0[0],-WR0[1],WR0[2]+3*bump(cl((p-.7)/.06,0,1))],ar);A.hL=lerp3(A.hL,[WR0[0],WR0[1],WR0[2]+3*bump(cl((p-.76)/.06,0,1))],al);
      A.gR=HPmix(A.gR,REST(),ar);A.gL=HPmix(A.gL,REST(),al);
      A.B=lerp3(A.B,[0,0,0],kn);A.lean=lerp(A.lean,0,kn);A.roll=lerp(A.roll,0,kn);A.fL=lerp3(A.fL,AN0,kn);A.fR=lerp3(A.fR,[AN0[0],-AN0[1],AN0[2]],kn);
      A.tL=lerp(A.tL,t0,kn);A.tR=lerp(A.tR,t0,kn);A.fyL=lerp(A.fyL,0,kn);A.fyR=lerp(A.fyR,0,kn);A.kpk=(A.kpk||0)*(1-kn);A.tail=lerp(A.tail,0,kn);A.look=0;
      if(P2)A.lift=3*kn;
      if(p>.9){const s=Math.sin((p-.9)/.1*Math.PI);A.B[2]+=1.5*s;A.hL[2]+=3*s;A.hR[2]+=3*s;A.roll=.06*Math.sin((p-.9)*60)*(1-sstep(.95,1,p))}
      for(const c of[.6,.7,.76,.84])if(p>=c&&p<c+.05)A.fx.push({k:'tac',t:(p-c)/.05});
      if(p<.36)A.fx.push({k:'thud',t:(p-.28)/.08});
      if(P2){A.sh.k=sstep(.45,.55,p);A.sh.gz=lerp(40,0,sstep(.5,.58,p))}}
    else if(P2)A.sh.k=1-sstep(0,.1,p)}
  else if(anim==='hand'){A.look=0;preHit(A,p,[.78]);
    // the arms up beating the time (.05-.72); the last chord: they fall at once, faster and faster, stop dead at .79 and bounce
    const dw=p<.72?0:p<.79?Math.pow((p-.72)/.07,2):1,up=sstep(0,.05,p)*(1-dw),bt=Math.sin(p*TAU*4.5)*sstep(.05,.1,p)*(1-sstep(.66,.72,p)),dn=pls(p,.815,.07);
    for(const sd of[1,-1]){let h=lerp3(sd>0?A.hL:A.hR,[10,sd*34,118+5*bt*sd],up);h=add(h,[0,0,-12*dn]);if(sd>0)A.hL=h;else A.hR=h;const g=HPmix(REST(),HP([0,sd*.3,1],[-1,0,0],[.1,.2,.3],.3),up);if(sd>0)A.gL=g;else A.gR=g}
    A.hr=.15*bt;A.hy=.2*Math.sin(p*TAU*2.25)*(1-sstep(.7,.8,p));A.jaw=Math.max(A.jaw,3*up*(.5+.5*Math.sin(p*70)));A.lean=-.08*up+.12*dn;A.jb=.6;A.jph=p*9;
    if(P2){A.sh.eg=1+.5*rise(p,0,.08,.7,.8);A.sh.sq=rise(p,.34,.38,.78,.86);A.sh.free={k:rise(p,0,.06,.15,.2)+rise(p,.86,.9,.95,1),z:p<.5?60*sstep(.08,.2,p):60*(1-sstep(.86,.95,p))}}}
  else if(anim==='rage'){A.look=0;A.k2=sstep(.6,.8,p);A.crk=sstep(.62,.8,p);
    const fall=sstep(0,.18,p),up=sstep(.58,.8,p);
    heap(A,fall*(1-up));slack(A,1-fall+up);A.S.up.b=p<.05?-1:p<.5?cl((p-.05)/.08,0,1):1-sstep(.5,.6,p);A.tL=lerp(A.tL,.38,up);A.tR=lerp(A.tR,.38,up);
    // the cross falls spinning to 110, a hand of shadow comes down from the mist and catches it, pulls it up
    A.cx[2]=lin([[0,0],[.18,0],[.42,-48],[.5,-48],[.58,-44],[.8,0],[1,0]],p);A.cyw=TAU*sstep(.18,.42,p);A.cr=.4*rise(p,.18,.3,.42,.5);
    A.sh={k:sstep(.18,.4,p),eye:sstep(.2,.38,p)*(1-pls(p,.3,.04)-pls(p,.36,.04)),eg:1,sq:rise(p,.82,.86,.96,1),blink:1,gz:p<.5?lerp(70,0,sstep(.42,.5,p)):0,go:p<.5?1-sstep(.46,.5,p):0,free:null,breath:0,mistK:sstep(.2,.4,p)};
    if(p>=.58){A.lift=3*up;for(const c of[.62,.68,.74])if(p>=c&&p<c+.05)A.fx.push({k:'tac',t:(p-c)/.05,smoke:1})}
    A.smoke=rise(p,.62,.66,.85,1);A.hp=lerp(A.hp,-.35,rise(p,.8,.84,.96,1));A.jaw=Math.max(A.jaw,1.5*up,5*rise(p,.8,.83,.96,1)*(.6+.4*Math.sin(p*70)));A.wide=rise(p,.58,.62,.8,.86)}
  else if(anim==='taunt'){A.look=0;
    // the whole turn of the head on its peg, like an owl (ratchet), the hood late; the jaw on the beat; two claps and a short bow
    A.hy=TAU*ez(cl(p/.55,0,1));A.tsw=-.5*Math.sin(Math.PI*cl(p/.6,0,1));A.jaw=Math.max(A.jaw,3*rise(p,.3,.33,.77,.8)*(.5+.5*Math.cos((p-.3)/.5*TAU*3)));
    const cl2=rise(p,.68,.78,.9,1),cp=(1-pls(p,.82,.05)-pls(p,.88,.05))*cl2;
    A.hL=lerp3(A.hL,[26,6+5*cp,76],cl2);A.hR=lerp3(A.hR,[26,-6-5*cp,76],cl2);A.gL=HPmix(A.gL,HP([.3,0,1],[0,1,0],[.1,.1,.1],.1),cl2);A.gR=HPmix(A.gR,HP([.3,0,1],[0,-1,0],[.1,.1,.1],.1),cl2);
    A.lean=.2*rise(p,.84,.89,.93,1);A.jb=.5;A.jph=p*8;if(P2)A.sh.moon=rise(p,.1,.2,.8,.95);for(const c of[.82,.88])if(p>=c&&p<c+.04)A.fx.push({k:'clap',t:(p-c)/.04})}
  else if(anim==='call'){A.look=1;
    // palm up, the index curls twice: «vieni, vieni»
    const fw=rise(p,0,.15,.8,1),bk=pls(p,.32,.25)+pls(p,.67,.25);A.hR=lerp3(A.hR,[26,-28,76],fw);A.gR=HPmix(REST(),HP([1,.1,0],[0,0,-1],[1,1,.9*bk],.6,1-bk),fw);
    A.hr=.3*fw;A.jaw=Math.max(A.jaw,1.6*fw*(.5+.5*Math.sin(p*45)));sway(.5)}
  else if(anim==='enter'){A.look=0;
    // .00-.30 the curtain goes up and shows a limp puppet hanging on slack strings; the strings tense one at a time
    A.cur={k:1-sstep(0,.3,p),w:rise(p,0,.05,.25,.32),bulge:0,ph:p*TAU*4};
    const T=[['h',.31],['wR',.38],['wL',.44],['kR',.51],['kL',.56]];slack(A,.12);for(const[s,a] of T)tense(A,s,p,a);
    const hk=sstep(.305,.32,p),ar=sstep(.375,.39,p),al=sstep(.435,.45,p),kr=sstep(.505,.52,p),kl=sstep(.555,.57,p);
    A.hp=lerp(.85,.12,hk);A.hr=lerp(.2,0,hk);A.lid=lerp(1,0,sstep(.315,.33,p));A.eg=lerp(0,1,sstep(.31,.34,p));A.droop=lerp(.8,0,hk);
    A.hR=lerp3([6,-29,38],[WR0[0],-WR0[1],WR0[2]+6*bump(cl((p-.38)/.05,0,1))],ar);A.hL=lerp3([6,29,38],[WR0[0],WR0[1],WR0[2]+6*bump(cl((p-.44)/.05,0,1))],al);
    {const lp=HP(null,null,[.4,.45,.5],.4);A.gR=HPmix(lp,REST(),ar);A.gL=HPmix(lp,REST(),al)}
    const kb=(kr+kl)/2;A.B[2]=lerp(-8,0,kb);A.lean=lerp(.2,0,kb);A.fR=lerp3([4,-11,9],[AN0[0],-AN0[1],AN0[2]],kr);A.fL=lerp3([4,11,9],AN0,kl);A.tR=lerp(.7,0,kr);A.tL=lerp(.7,0,kl);
    A.hint=pls(p,.32,.04)*1;
    A.hy=lin([[0,0],[.6,0],[.74,1.9],[.76,1.9],[.79,-.12],[.81,.04],[.83,0],[1,0]],p);if(p>.6&&p<.74)A.hy=1.9*ez((p-.6)/.14);
    A.jaw=Math.max(A.jaw,4*rise(p,.76,.78,.86,.9)*(.5+.5*Math.sin(p*90)));A.jb=.15+.85*rise(p,.75,.77,.88,.92);A.jph=p*10;
    const bw=rise(p,.79,.87,.92,1);A.lean+=.55*bw;A.hp+=.3*bw;A.hR=lerp3(A.hR,[22,-4,80],bw);A.hL=lerp3(A.hL,[20,62,62],bw);
    A.gR=HPmix(A.gR,HP([0,1,0],[1,0,0],[.2,.2,.25],.3),bw);A.gL=HPmix(A.gL,HP([.6,.8,-.2],[0,0,1],[0,0,0],0),bw);A.tsw=.6*bw;
    for(const c of[.31,.38,.44,.51,.56])if(p>=c&&p<c+.05)A.fx.push({k:'tac',t:(p-c)/.05})}
  else if(anim==='die'){A.look=0;const d=o.p2;
    {const f=1-sstep(.07,.1,p);A.eg=lerp(1,.6+.4*Math.abs(Math.cos(p*45)),f);A.jaw=Math.max(A.jaw,2.5*(.5-.5*Math.cos(p*120))*f)}
    snapS(A,'kL',p,.12);snapS(A,'kR',p,.2);snapS(A,'wL',p,.28);snapS(A,'wR',p,.36);snapS(A,'h',p,.46);snapS(A,'up',p,.5);
    const kn=sstep(.2,.26,p),ar=sstep(.28,.33,p),al=sstep(.36,.41,p),hd=sstep(.46,.5,p),cr=sstep(.48,.68,p);
    A.B[2]=-18*kn;A.lean=.1*kn;A.fL=lerp3(A.fL,[14,12,4],sstep(.12,.18,p));A.fR=lerp3(A.fR,[14,-12,4],kn);A.tL=-.3*sstep(.12,.18,p);A.tR=-.3*kn;
    A.hL=lerp3(A.hL,[6,40,26],ar);A.hR=lerp3(A.hR,[6,-40,26],al);{const lp=HP(null,null,[.35,.4,.45],.35);A.gL=HPmix(A.gL,lp,ar);A.gR=HPmix(A.gR,lp,al)}
    A.hp=lerp(.12,.85,hd);A.droop=hd;
    if(cr>0)heap(A,cr,-1);
    A.lid=Math.max(A.lid,sstep(.72,.84,p));A.eg=A.eg*(1-sstep(.72,.8,p));A.eyeL=1-sstep(.72,.78,p);A.eyeR=1-sstep(.78,.84,p);
    // the cross falls on the heap and bounces (.56-.70)
    A.cx[2]=lin([[0,0],[.56,0],[.68,-95],[.7,-90],[.72,-95],[1,-95]],p);A.cr=lin([[0,0],[.56,0],[.68,.9],[1,.9]],p);A.cp=lin([[0,0],[.56,0],[.68,.35],[1,.35]],p);A.cx[0]=lin([[0,0],[.56,0],[.68,10],[1,10]],p);
    // (the hand of the Shadow opens at .50 and lets the cross fall: it stays where it held it and rises with the dark)
    if(d){const ri=sstep(.6,.84,p);A.sh={k:1-ri,eye:1-ri,eg:1,sq:0,blink:1,gz:0,go:sstep(.5,.54,p),free:null,breath:0,rise:ri,anchor:[0,0,30*ri]}}
    // a bell comes off the hood, rolls in front of the heap and stops; the curtain comes down; it melts in sparks of gold
    A.bell=p>=.74?{k:sstep(.74,.86,p),out:1-sstep(.95,1,p)}:null;
    // (the curtain is down by .93: the heap goes away behind it before the curtain melts from the hem)
    A.cur={k:sstep(.86,.93,p),w:rise(p,.86,.9,.93,.97),bulge:0,melt:sstep(.95,1,p),ph:p*TAU*3};A.jb=rise(p,.48,.5,.66,.7);A.jph=p*10;
    for(const[c,k] of[[.12,'kL'],[.2,'kR'],[.28,'wL'],[.36,'wR'],[.46,'h']])if(p>=c&&p<c+.05)A.fx.push({k:'ping',s:k,t:(p-c)/.05});A.fade=1-sstep(.93,.95,p);A.strK=A.fade}
  // the look of the head toward the hero (the game's o.look) is kept standing, walking and aiming, not in the blows: the moves that start or
  // end standing turn the head to the hero and back smoothly
  if(LKS.has(anim))A.look=Math.max(A.look,1-sstep(0,.06,p));if(LKE.has(anim))A.look=Math.max(A.look,sstep(.92,1,p));
  return A}
const LKS=new Set(['hit','slam','slam3','strings','puppets','lasso','hand','rage','taunt','die']),
  LKE=new Set(['hit','slam','slam3','strings','puppets','lasso','yank','snap','drop','hand','rage','taunt','call','enter']);

// ------------------------------------------------------------------ frames
// the body: the lean round the hips; the lift (the hover of the second phase, the fall) moves everything
const bodyX=A=>frame({B:[A.B[0],A.B[1],A.B[2]+A.lift],lean:A.lean,roll:A.roll,yaw:A.yaw,s:A.s},44);
// the camera's direction (unit) in the model's space: what faces us has a positive dot with it
const camDir=V0=>nrm([V0.s,V0.c,cam.k/cam.zk]);

// ------------------------------------------------------------------ the legs: the breeches puffed round the thigh, the wooden knee ball with
// its peg and the golden eyelet of the string, the shin, the ankle ball, the lacquered pointed shoe with its little bell
function legGeo(X,A,sd){const hip=X.T([HIP[0],sd*HIP[1],HIP[2]]),f=sd>0?A.fL:A.fR,an=[f[0],f[1],f[2]+A.lift],
    pole0=X.Rd([1,sd*.12,.05]),pole=A.kpole&&A.kpk>0?nrm(lerp3(pole0,[A.kpole[0],sd*A.kpole[1],A.kpole[2]],A.kpk)):pole0,[kn,a2]=ik(hip,an,LTH,LSH,pole);
  const t=sd>0?A.tL:A.tR,fy=(sd>0?A.fyL:A.fyR)*sd,fw=[Math.cos(t)*Math.cos(fy),Math.cos(t)*Math.sin(fy),-Math.sin(t)],side=nrm(cross([0,0,1],fw)),up=nrm(cross(fw,side));
  // the knee points away from the line hip-ankle: the string's eyelet is on its front
  // (a leg nearly straight has no knee direction of its own: it turns smoothly to the front instead of jumping there)
  const mid=lerp3(hip,a2,.5),kr=sub(kn,mid),kl=len(kr),fw0=X.Rd([1,0,0]),kd=nrm(kl>1e-4?lerp3(fw0,mul(kr,1/kl),sstep(.3,2.5,kl)):fw0),ke=nrm(add(kd,X.Rd([0,sd*.9,0])));
  return{sd,hip,kn,an:a2,fw,side,up,eye:add(kn,mul(ke,6.6)),kd:ke}}
function legDraw(V0,X,A,K,g){const{P,F}=V0,{sd,hip,kn,an,fw,side,up}=g,lat=X.Rd([0,sd,0]);
  // the breeches: a velvet puff round the top of the thigh, a golden band at the bottom, three soft folds
  const w=nrm(sub(kn,hip)),[pu,pv]=frm(w,X.Rd([1,0,0])),pc=add(lerp3(hip,kn,.36),mul(lat,.5)),FR3={u:pu,v:pv,w},Rd=[8.5,9.5,9.5],sil=ellSil(V0,pc,Rd,FR3,null,18),pa=smoothP(sil);
  const shin=()=>{const a=P(kn),b=P(an);caps3(a,4.4,b,3.8,K.wood,2.2);
      ctx.save();hull(a,4.4,b,3.8);ctx.clip();ctx.strokeStyle=K.grain;ctx.lineWidth=.8;const n=nrm([-(b[1]-a[1]),b[0]-a[0],0]);ctx.beginPath();
      for(const o2 of[-1.4,1.6]){ctx.moveTo(a[0]+n[0]*o2,a[1]+n[1]*o2+2);ctx.quadraticCurveTo((a[0]+b[0])/2+n[0]*(o2+.6),(a[1]+b[1])/2+n[1]*(o2+.6),b[0]+n[0]*o2*.8,b[1]+n[1]*o2*.8-2)}ctx.stroke();ctx.restore()},
    shoe=()=>shoeDraw(V0,A,K,g),fwd=F(fw)<-.35;
  if(fwd)shoe();shin();
  // the ankle ball
  ball3(P(an),3.6,K.wood,2);
  if(!fwd)shoe();
  // the breeches over the top of the thigh
  ctx.fillStyle=grad3(bbox(sil),K.plum);ctx.fill(pa);ctx.save();ctx.clip(pa);
  // the golden band at the bottom and the folds
  const bc=add(pc,mul(w,6.8)),rg=ringS(V0,bc,pu,pv,8.2,20),gr=[];for(let i=0;i<20;i++){const t=i/20*TAU,n=add(mul(pu,Math.cos(t)),mul(pv,Math.sin(t)));gr.push(F(n)>-.05?rg[i]:null)}
  const runs=[];let cur=[];for(let i=0;i<=20;i++){const q=gr[i%20];if(q)cur.push(q);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  K3.strokeRuns(runs,INK,3.4);K3.strokeRuns(runs,K.gold.b,1.8);
  ctx.strokeStyle='rgba(20,8,30,.35)';ctx.lineWidth=1;for(const a of[-.9,0,.9]){const n=add(mul(pu,Math.cos(a)),mul(pv,Math.sin(a)));if(F(n)<.15)continue;
    const q0=P(add(add(pc,mul(w,-6)),mul(n,6))),q1=P(add(add(pc,mul(w,4)),mul(n,8.4)));ctx.beginPath();ctx.moveTo(q0[0],q0[1]);ctx.quadraticCurveTo((q0[0]+q1[0])/2+1,(q0[1]+q1[1])/2,q1[0],q1[1]);ctx.stroke()}
  glowTop(P(pc),9,.1);ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.stroke(pa);rimP(sil,.25);
  // the knee: a wooden ball, a dark peg on its outer side, a thin golden ring, the eyelet of the string in front
  const qk=P(kn);ball3(qk,6.8,K.wood,2.2);topM(qk,6.8,K);
  // a thin golden ring round the joint, where the shin goes into it (only its half toward us)
  {const sd2=nrm(sub(an,kn)),[u,v]=frm(sd2,[1,0,0]),c=add(kn,mul(sd2,2.4)),R=ringS(V0,c,u,v,6.35,20),runs=[];let cur=[];
    for(let i=0;i<=20;i++){const t=i%20/20*TAU,m=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));if(F(m)>.02)cur.push(R[i%20]);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
    K3.strokeRuns(runs,INK,2.6);K3.strokeRuns(runs,K.gold.b,1.3)}
  if(F(lat)>.1){const q=P(add(kn,mul(lat,6.4)));ctx.fillStyle=K.peg;ball(q,1.6);ctx.fill()}
  if(F(g.kd)>-.2){const q=P(g.eye);ctx.strokeStyle=INK;ctx.lineWidth=2;ball(q,1.4);ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.stroke()}}
function shoeDraw(V0,A,K,g){const{P,F}=V0,{an,fw,side,up}=g,at=(a,b,c)=>add(an,add(add(mul(fw,a),mul(side,b)),mul(up,c)));
  const c0=at(4.6,0,-2.6),Rd=[10,4,3.3],FR3={u:fw,v:side,w:up},sil=ellSil(V0,c0,Rd,FR3,null,16),pa=smoothP(sil);
  // the tip curls up: a short chain, a little golden bell on it
  const tp=[at(11.5,0,-2.2),at(14.4,0,-.8),at(15.6,0,1.4)],qs=tp.map(P);
  ctx.fillStyle=grad3(bbox(sil),K.shoe);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke(pa);
  pline(qs,INK,6.2);pline(qs,K.shoe.b,3.2);
  // the white light on the instep and the worn tip
  ctx.save();ctx.clip(pa);const qi=P(at(1,0,1.4)),qj=P(at(8,0,.8));ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.3;ctx.lineCap='round';seg(qi,qj);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.ellipse(qi[0]-.5,qi[1]-.4,2,1,-.3,0,TAU);ctx.fill();
  const qt=P(at(11,0,-1.6));ctx.fillStyle=K.wear;ctx.globalAlpha*=.55;ctx.beginPath();ctx.ellipse(qt[0],qt[1],2,1.2,0,0,TAU);ctx.fill();ctx.restore();rimP(sil,.22);
  const qb=P(add(tp[2],mul(up,-1.2)));ball3(qb,1.8,K.gold,1.2)}

// ------------------------------------------------------------------ the barrel doublet: harlequin diamonds of light violet and crimson with
// golden lines, three golden star buttons, the belt with the little mask of the buckle, the comedy mask embroidered on the back
// the barrel's surface in this frame: the point at the turn th and the height z, on the screen, with how much it faces us. The frame's map is
// taken once (a turn and a shift), so the hundreds of points of the diamonds and of the golden lines make no garbage
function barrelS(V0,X,Rd){const o=X.T([0,0,0]),e1=sub(X.T([1,0,0]),o),e2=sub(X.T([0,1,0]),o),e3=sub(X.T([0,0,1]),o),c=V0.c,s=V0.s,K=cam.k,Z=cam.zk,KZ=K/Z,NF=Math.hypot(1,KZ),
    gd=r=>(r[0]*s+r[1]*c+KZ*r[2])/NF,g1=gd(X.Rd([1,0,0])),g2=gd(X.Rd([0,1,0])),g3=gd(X.Rd([0,0,1]));
  return(th,z)=>{const zz=cl((z-BC[2])/Rd[2],-1,1),sq=Math.sqrt(Math.max(0,1-zz*zz)),m1=sq*Math.cos(th),m2=sq*Math.sin(th),a=BC[0]+m1*Rd[0],b=BC[1]+m2*Rd[1],d=BC[2]+zz*Rd[2],
      x=o[0]+a*e1[0]+b*e2[0]+d*e3[0],y=o[1]+a*e1[1]+b*e2[1]+d*e3[1],w=o[2]+a*e1[2]+b*e2[2]+d*e3[2],n1=m1/Rd[0],n2=m2/Rd[1],n3=zz/Rd[2];
    return[x*c-y*s,(x*s+y*c)*K-w*Z,(n1*g1+n2*g2+n3*g3)/(Math.hypot(n1,n2,n3)||1)]}}
// a patch of the barrel drawn only where it faces us (screen points with their facing): the hidden part of its outline goes along the
// horizon (pushed out a little: the barrel's own outline clips it)
function patch(pts,o){const n=pts.length;if(!pts.some(q=>q[2]>0))return null;
  const out=[];for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];if(a[2]>0)out.push(a);if((a[2]>0)!==(b[2]>0)){const k=a[2]/(a[2]-b[2]),x=lerp(a[0],b[0],k),y=lerp(a[1],b[1],k);out.push([x+(x-o[0])*.12,y+(y-o[1])*.12])}}
  return out.length>2?out:null}
// the runs of a line on the barrel that face us (n segments of f(u), u 0..1)
function runsOf(n,f,lim,runs){let cur=[];for(let i=0;i<=n;i++){const q=f(i/n);if(q[2]>lim)cur.push(q);else if(cur.length){if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur)}
function torsoDraw(V0,X,A,K){const{P}=V0,br=1+A.breath,Rd=[BRD[0]*br,BRD[1]*br,BRD[2]*(1+A.breath*.5)],sil=ellSil(V0,BC,Rd,AXES,X.T,28),pa=smoothP(sil),o0=P(X.T(BC)),bb=bbox(sil),S=barrelS(V0,X,Rd);
  ctx.lineJoin='round';ctx.fillStyle=grad3(bb,K.vel);ctx.fill(pa);ctx.save();ctx.clip(pa);
  // the crimson diamonds (the rows at 58.5 and 75.5, a quarter turn off the violet ones): only those that turn toward us
  const dz=8.5,dth=Math.PI/8;ctx.fillStyle=grad3(bb,K.cri);ctx.beginPath();
  for(const zc of[58.5,75.5])for(let k=0;k<8;k++){const tc=k*Math.PI/4+dth;if(S(tc,zc)[2]<-.55)continue;const ring=[];
    const V4=[[tc,zc+dz],[tc+dth,zc],[tc,zc-dz],[tc-dth,zc]];for(let i=0;i<4;i++){const a=V4[i],b=V4[(i+1)%4];for(let j=0;j<3;j++){const u=j/3;ring.push(S(lerp(a[0],b[0],u),lerp(a[1],b[1],u)))}}
    const pp=patch(ring,o0);if(pp){ctx.moveTo(pp[0][0],pp[0][1]);for(const q of pp)ctx.lineTo(q[0],q[1]);ctx.closePath()}}
  ctx.fill();
  // the golden lines: the edges of the diamonds, two families of spirals from z 50 to 84, and the two borders
  const runs=[];for(const dir of[1,-1])for(let k=0;k<8;k++){const t0=k*Math.PI/4+dth;runsOf(8,u=>S(t0+dir*u*Math.PI/2,50+34*u),0,runs)}
  for(const z of[50,84])runsOf(24,u=>S(u*TAU,z),0,runs);
  K3.strokeRuns(runs,'rgba(60,24,10,.45)',2.2);K3.strokeRuns(runs,K.gold.b,1.05);
  // the comedy mask embroidered on the back (dark plum, gold outline, empty almond eyes, the smile)
  backMask(S,Rd,K);
  // the three golden star buttons on the front
  for(const z of[58,68,78]){const q=S(0,z),f=q[2];if(f<.08)continue;const k=Math.pow(f,.6);star5(q,2.9,k,0);ctx.fillStyle=K.gold.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
    ctx.fillStyle='rgba(255,250,220,.8)';ball([q[0]-.6*k,q[1]-.7],.7);ctx.fill()}
  // the shading: the bottom and the far side darker, the light of the stage on the top
  {const g=ctx.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,'rgba(255,240,255,.10)');g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(20,6,30,.32)');ctx.fillStyle=g;ctx.fillRect(bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1])}
  if(K.top){ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,bb[1],0,bb[1]+(bb[3]-bb[1])*.4);g.addColorStop(0,rgba(K.top,.3*K.topA));g.addColorStop(1,rgba(K.top,0));ctx.fillStyle=g;ctx.fillRect(bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1])}
  ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke(pa);rimP(sil,.3);
  // the belt (a golden band at z 49) and its buckle, a smiling golden mask
  {const runs2=[];runsOf(24,u=>S(u*TAU,49),-.02,runs2);
    K3.strokeRuns(runs2,INK,5);K3.strokeRuns(runs2,K.gold.b,3);K3.strokeRuns(runs2.map(r=>r.map(q=>[q[0],q[1]-.8])),'rgba(255,248,200,.7)',.8)}
  {const q=S(0,49),f=q[2];if(f>.05){const k=Math.pow(f,.6);ctx.beginPath();ctx.ellipse(q[0],q[1],4.5*k,4.3,0,0,TAU);ctx.fillStyle=grad3([q[0]-4.5,q[1]-4.5,q[0]+4.5,q[1]+4.5],K.gold);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
    ctx.fillStyle='#3a1838';ctx.beginPath();for(const s of[-1,1]){ctx.moveTo(q[0]+s*1.7*k+k,q[1]-.8);ctx.ellipse(q[0]+s*1.7*k,q[1]-.8,1*k,.7,s*.4,0,TAU)}ctx.fill();
    ctx.strokeStyle='#3a1838';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-2*k,q[1]+1);ctx.quadraticCurveTo(q[0],q[1]+2.8,q[0]+2*k,q[1]+1);ctx.stroke()}}}
// the mask of the comedy on the back: a shape in (across, up) on the back of the barrel
const BMASK=(()=>{const o=[];for(let i=0;i<=16;i++){const t=i/16*TAU,x=Math.sin(t),y=Math.cos(t);o.push([x*8.6*(1-.18*Math.max(0,-y)),71+y*(y>0?8.8:9.6)+(y<-.6?-.8:0)])}return o})();
function backMask(S,Rd,K){const cen=S(Math.PI,71);if(cen[2]<.1)return;const k=sstep(.1,.35,cen[2]);
  const at=(u,z)=>{const zz=(z-BC[2])/Rd[2],s=Math.sqrt(Math.max(.05,1-zz*zz));return S(Math.PI-u/(Rd[1]*s),z)};
  const a0=ctx.globalAlpha;ctx.globalAlpha=a0*k;const sh=BMASK.map(([u,z])=>at(u,z));poly(sh);ctx.fillStyle='rgba(38,16,52,.55)';ctx.fill();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.3;ctx.stroke();
  // the empty almond eyes, the smile, the gold of the embroidery on the cheeks
  ctx.beginPath();for(const s of[-1,1]){const e=[[s*1.6,74],[s*3.6,75.4],[s*6,74.4],[s*3.8,73]].map(([u,z])=>at(u,z));ctx.moveTo(e[0][0],e[0][1]);for(const q of e)ctx.lineTo(q[0],q[1]);ctx.closePath()}
  ctx.fillStyle='#120610';ctx.fill();ctx.strokeStyle=K.gold.b;ctx.lineWidth=.9;ctx.stroke();
  const sm=[[-5.4,68.4],[-2.6,66.2],[0,65.6],[2.6,66.2],[5.4,68.4]].map(([u,z])=>at(u,z));ctx.beginPath();ctx.moveTo(sm[0][0],sm[0][1]);for(const q of sm)ctx.lineTo(q[0],q[1]);ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle=K.gold.b;ctx.beginPath();for(const s of[-1,1]){const q=at(s*5.6,70.4);ctx.moveTo(q[0]+.8,q[1]);ctx.arc(q[0],q[1],.8,0,TAU)}ctx.fill();ctx.globalAlpha=a0}
// the coat tails: two tongues of violet velvet with a golden edge, hanging behind from the belt (late)
function tailsDraw(V0,X,A,K,Rd){const{P}=V0;for(const sd of[-1,1]){const sw=A.tail*(sd>0?1:.85),zz=(TAILA[2]-BC[2])/Rd[2],s=Math.sqrt(Math.max(0,1-zz*zz)),ry=Math.min(.95,TAILA[1]/(Rd[1]*s)),
    ax=-Rd[0]*s*Math.sqrt(1-ry*ry)+.6,a=X.T([ax,sd*TAILA[1],TAILA[2]]),d=X.Rd(rotAx([TAILB[0]-ax,sd*(TAILB[1]-TAILA[1]),TAILB[2]-TAILA[2]],[0,1,0],-sw*.9)),
    lat=X.Rd([0,sd,0]),fw=X.Rd([1,0,0]),b=add(a,d),m=add(lerp3(a,b,.5),X.Rd([-2-2*sw,0,0])),
    // (the outer edge wraps forward round the hips, as velvet does on a round body: seen from the side the tail is a narrow tongue, not a line)
    pts=[add(a,mul(lat,-4.5)),add(m,mul(lat,-4.4)),add(b,mul(lat,-2.4)),add(b,add(mul(lat,.3),X.Rd([0,0,-3]))),add(add(b,mul(lat,2.4)),mul(fw,2)),add(add(m,mul(lat,4.4)),mul(fw,3.6)),add(add(a,mul(lat,4.5)),mul(fw,4.2))].map(P);
    ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]);ctx.quadraticCurveTo(pts[3][0],pts[3][1]+1.5,pts[4][0],pts[4][1]);ctx.quadraticCurveTo(pts[5][0],pts[5][1],pts[6][0],pts[6][1]);ctx.closePath();
    ctx.fillStyle=grad3(bbox(pts),K.vel);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.save();ctx.clip();ctx.lineWidth=2.2;ctx.stroke();ctx.restore()}}

// ------------------------------------------------------------------ the arms: the puffed sleeve with the golden bands across it, the violet
// upper sleeve, the wooden elbow ball, the bare wooden forearm, the wrist ball with the eyelet of the string, the big white glove
function armGeo(X,A,sd){const S=X.T([SHJ[0],sd*SHJ[1],SHJ[2]]),h=sd>0?A.hL:A.hR,W=[h[0],h[1],h[2]+A.lift],[El,Wr]=ik(S,W,LUA,LFA,X.Rd([-.35,sd,-.5]));
  const g=sd>0?A.gL:A.gR,fa=nrm(sub(Wr,El)),bk0=X.Rd([0,sd,0]);
  // the move's directions mixed with the defaults (along the forearm, the back outward) by their weights
  let u=fa;if(g.fd&&g.fk>.002){const v=lerp3(fa,nrm(g.fd),g.fk);if(len(v)>.2)u=nrm(v)}
  let bk=bk0;if(g.bk&&g.bkk>.002){const v=lerp3(bk0,nrm(g.bk),g.bkk);if(len(v)>.2)bk=nrm(v)}
  // a wooden wrist bends at most 80° from the forearm (never folds the hand back over it)
  {const du=dot(u,fa);if(du<.17){let pp=sub(u,mul(fa,du));if(len(pp)<.05)pp=sub(bk,mul(fa,dot(bk,fa)));u=nrm(add(mul(fa,.17),mul(nrm(pp),.985)))}}
  // the back of the hand across the fingers: when it comes to lie along them it turns smoothly toward the front
  {let w=sub(bk,mul(u,dot(bk,u)));const wl=len(w);if(wl<.4){const f=X.Rd([1,0,0]);let w2=sub(f,mul(u,dot(f,u)));if(len(w2)<.2)w2=sub([0,0,1],mul(u,u[2]));w2=nrm(w2);
    w=wl>1e-4?lerp3(w2,mul(w,1/wl),wl/.4):w2}bk=nrm(w)}
  // the eyelet of the string on the wrist ball: on top, toward the back of the hand, away from the fingers
  const w=nrm(sub(bk,mul(u,dot(bk,u)))),ey=nrm(add(add([0,0,1],mul(w,.8)),mul(u,-.6)));
  const c=add(Wr,mul(u,11)),a={sd,S,El,Wr,u,bk,c,g,puff:X.T([PUFF[0],sd*PUFF[1],PUFF[2]]),eye:add(Wr,mul(ey,3.8)),ptip:sd<0?A.ptip||0:0};a.G=gloveGeo(a);return a}
function upperArmDraw(V0,X,A,K,a){const{P,F}=V0,qs=P(a.S),qe=P(a.El);caps3(qs,6,qe,5,K.vel,2.3);
  // the sleeve gathers at the elbow: a golden band
  {const d=nrm(sub(a.El,a.S)),[u,v]=frm(d,[0,0,1]),r=ringS(V0,add(a.El,mul(d,-3.5)),u,v,5.3,14);ctx.strokeStyle=INK;ctx.lineWidth=3.2;poly(r);ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.7;ctx.stroke()}
  puffDraw(V0,X,A,K,a);
  const q=qe;ball3(q,5,K.wood,2.1);const lat=X.Rd([0,a.sd,0]);if(F(lat)>.1){ctx.fillStyle=K.peg;ball(P(add(a.El,mul(lat,4.6))),1.3);ctx.fill()}}
function puffDraw(V0,X,A,K,a){const{P,F}=V0,c=a.puff,q=P(c),r=PUFFR;ball3(q,r,K.vel,2.4,.32);glowTop(q,r,.1);if(K.top){ctx.save();ctx.globalCompositeOperation='lighter';glowTop(q,r,.25*K.topA);ctx.restore()}
  // two golden bands crossing on its top (the near half only)
  const runs=[];for(const n of[X.Rd([1,0,0]),X.Rd([0,1,0])]){const[u,v]=frm(n,[0,0,1]),R=ringS(V0,c,u,v,r*.98,24);let cur=[];
    for(let i=0;i<=24;i++){const t=i%24/24*TAU,m=add(mul(u,Math.cos(t)),mul(v,Math.sin(t)));if(F(m)>.05)cur.push(R[i%24]);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur)}
  K3.strokeRuns(runs,INK,3.4);K3.strokeRuns(runs,K.gold.b,1.9);
  // four gathers where the sleeve goes in (one stroke)
  ctx.strokeStyle='rgba(20,8,30,.4)';ctx.lineWidth=1;ctx.beginPath();for(const t of[-1.1,-.37,.37,1.1]){const d=nrm(X.Rd([Math.sin(t)*.55,a.sd*.45,-.75]));if(F(d)<.1)continue;const q0=P(add(c,mul(d,r*.55))),q1=P(add(c,mul(d,r*.95)));ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1])}ctx.stroke()}
function lowerArmDraw(V0,X,A,K,a){const{P,D}=V0,qe=P(a.El),qw=P(a.Wr),gl=()=>gloveDraw(V0,a,K);
  const fore=()=>{caps3(qe,4.5,qw,3.8,K.wood,2.2);ctx.save();hull(qe,4.5,qw,3.8);ctx.clip();ctx.strokeStyle=K.grain;ctx.lineWidth=.8;const n=nrm([-(qw[1]-qe[1]),qw[0]-qe[0],0]);
      ctx.beginPath();for(const o2 of[-1.3,1.5]){ctx.moveTo(qe[0]+n[0]*o2,qe[1]+n[1]*o2);ctx.quadraticCurveTo((qe[0]+qw[0])/2+n[0]*(o2+.7),(qe[1]+qw[1])/2+n[1]*(o2+.7),qw[0]+n[0]*o2,qw[1]+n[1]*o2)}ctx.stroke();
      shadeIn(qe,qw,4.5,3.8);ctx.restore();
      ball3(qw,3.8,K.wood,2);topM(qw,3.8,K);const qy=P(a.eye);ctx.strokeStyle=INK;ctx.lineWidth=2;ball(qy,1.3);ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.stroke()};
  if(D(a.c)<D(a.Wr)-2){gl();fore()}else{fore();gl()}}
// the white glove (boss3.js glove() made bigger): the palm, the violet cuff with the golden trim, three fingers and the thumb as soft
// capsules that bend one by one (each by itself, for the waves of the fingers), the index straight to point; little wooden knuckles on the
// back. The geometry first (the game wants the tips of the index fingers), then the drawing
function gloveGeo(a){const g=a.g,u=a.u,w=nrm(sub(a.bk,mul(u,dot(a.bk,u)))),v=cross(w,u),s=GS,c=a.c,sd=a.sd,ts=-sd,ix=1-sd,FG=[],
  at=(x,y,z)=>add(c,mul(add(add(mul(u,x),mul(v,y)),mul(w,z)),s));
  const fing=(b,dirs,rs)=>{const pts=[b];let q=b;for(const d of dirs){q=add(q,mul(d,s));pts.push(q)}FG.push({pts,rs,d0:dirs[0]})};
  for(let i=0;i<3;i++){const b=at(5,(i-1)*3.6,.3),k=cl(g.c[i]||0,0,1),pt=i===ix?g.pt:0,lr=(i-1);
    const op=[add(add(mul(u,4.4),mul(w,-.7)),mul(v,lr*.9)),add(add(mul(u,3.8),mul(w,-1.3)),mul(v,lr*.7))],fi=[add(mul(u,2.2),mul(w,-2.6)),add(mul(u,-1.6),mul(w,-2.4))],st=[mul(u,4.7),mul(u,4.3)];
    let d=[lerp3(op[0],fi[0],k),lerp3(op[1],fi[1],k)];if(pt>0)d=[lerp3(d[0],st[0],pt),lerp3(d[1],st[1],pt)];fing(b,d,[2.35,2.15,1.9])}
  const tb=at(.5,ts*5.2,-.4),tk=cl(g.th,0,1),td=[lerp3(add(mul(v,ts*2.8),mul(u,2.2)),add(mul(v,ts*1.8),mul(u,2.6)),tk),lerp3(add(mul(u,2.8),mul(v,ts*.6)),add(mul(u,1.8),mul(w,-1.4)),tk)];
  fing(tb,td,[2.3,2.1,1.85]);return{u,v,w,s,at,FG,ix,idx:FG[ix].pts[2],tips:FG.map(f=>f.pts[f.pts.length-1])}}
function gloveDraw(V0,a,K){const{P,D,F}=V0,G=a.G,{u,v,w,s,at}=G,c=a.c,L=parts();
  const sil=ellSil(V0,c,[6.6*s,6.2*s,3.8*s],{u,v,w},null,16),pa=smoothP(sil),FQ=G.FG.map(f=>f.pts.map(P)),hb=bbox(sil.concat(...FQ)),gr=grad3(hb,K.ivory);
  L.add(D(c),()=>{ctx.fillStyle=gr;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2.3;ctx.stroke(pa);rimP(sil,.3);
    if(F(w)>.15)ga(sstep(.15,.4,F(w)),()=>{ctx.fillStyle='rgba(150,120,90,.55)';ctx.beginPath();for(let i=0;i<3;i++){const q=P(at(4.4,(i-1)*3.6,2.6));ctx.moveTo(q[0]+.85,q[1]);ctx.arc(q[0],q[1],.85,0,TAU)}ctx.fill()})});
  // the cuff: a short wide ring behind the palm, its golden trim toward the fingers
  const cf=at(-7.5,0,0),cr=o=>{const R=[];for(let i=0;i<14;i++){const t=i/14*TAU;R.push(P(add(add(cf,mul(u,o*s)),add(mul(v,Math.cos(t)*5.6*s),mul(w,Math.sin(t)*4.4*s)))))}return R};
  L.add(D(cf)-.6,()=>{const R0=cr(-1.9),R1=cr(1.9),H=chull(R0.concat(R1));poly(H);ctx.fillStyle=grad3(bbox(H),K.vel);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
    ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.5;poly(R1);ctx.stroke()});
  // the fingers: soft capsules of the same width (their outline, then the ivory with the hand's gradient)
  G.FG.forEach((f,i)=>{const pts=f.pts,q=pts[pts.length-1],r=1.1*(f.rs[0]+f.rs[1]+f.rs[2])/3;
    L.add(D(lerp3(pts[0],q,.5))+(dot(f.d0,w)<-.3?-.3:.3),()=>{const Q=FQ[i];pline(Q,INK,2*r+2.4);pline(Q,gr,2*r-2)})});
  run(L);
  // the tip of the index lights up when it points (the lasso)
  if(a.ptip>0){const q=P(G.idx);glowL(K.str,q,7,.6*a.ptip);star4(q,3.5*a.ptip,a.ptip,'#fffbe8')}}

// ------------------------------------------------------------------ the ruff: puffs of white round the neck, a golden thread under them
function ruffPts(X,A,hyK){const n=LOWFX?10:12,o=[],r0=hyK;for(let i=0;i<n;i++){const t=i/n*TAU+r0,c=X.T([RUFC[0]+Math.cos(t)*RUFR,Math.sin(t)*RUFR,RUFC[2]+(i%2?.6:-.4)]);o.push(c)}return o}
function ruffPuff(V0,c,K,k){const q=V0.P(c);ball3(q,RUFB*(k||1),K.ruff,1.8,.25)}
function ruffThread(V0,X,K){const{P,F}=V0,runs=[];let cur=[];for(let i=0;i<=24;i++){const t=i/24*TAU,c=X.T([RUFC[0]+Math.cos(t)*(RUFR-1),Math.sin(t)*(RUFR-1),RUFC[2]-3.4]),n=X.Rd([Math.cos(t),Math.sin(t),0]);
  if(F(n)>0)cur.push(P(c));else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);K3.strokeRuns(runs,INK,3.2);K3.strokeRuns(runs,K.gold.b,1.6)}

// ------------------------------------------------------------------ the head: the hood (a velvet ball), the ivory face with the golden edge
// of the hood round it, the harlequin mask that makes a V of brows, the golden eyes in dark sockets with the wooden doll's eyelids, the
// little ball of a nose, the rosy cheeks, the painted smile with the marionette's jaw and two little fangs
function headDraw(V0,J,A,K){const{P,F}=V0,Hc=J.Hc,HR=J.HR,R=HOOD,q0=P(Hc),cv=J.cv,
    pt=(d,r)=>{let w=HR(d);const f=dot(w,cv);if(f<.03)w=nrm(add(sub(w,mul(cv,f)),mul(cv,.03)));return P(add(Hc,mul(w,r||R)))},vis=d=>dot(HR(d),cv);
  ctx.lineJoin='round';const hs=J.hsil;ctx.fillStyle=grad3([q0[0]-R,q0[1]-R*1.14,q0[0]+R,q0[1]+R*1.14],K.vel);ctx.fill(hs);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke(hs);
  // the seam over the hood, from the brow to the nape
  {const runs=[];let cur=[];for(let i=0;i<=16;i++){const a=-.2+i/16*2.6,d=[Math.cos(a)*.0+Math.sin(-a+Math.PI/2)*1,0,Math.sin(a)];const dd=nrm([Math.cos(a),0,Math.sin(a)]);if(vis(dd)>.05)cur.push(P(add(Hc,HR(mul(dd,R*.99)))));else if(cur.length){runs.push(cur);cur=[]}}
    if(cur.length)runs.push(cur);K3.strokeRuns(runs,'rgba(26,8,40,.45)',1.1)}
  rimP(J.hpts,.3);glowTop(q0,R,.13);topM(q0,R,K);
  // the face
  const Xh={T:q=>add(Hc,HR(q)),Rd:HR};ctx.save();const cap=ellCap(V0,Xh,[0,0,0],[R,R,R],AXES,FACEN,FACEA,32,{alv:FACEAV,ck:'pu2f'});
  if(!cap){ctx.restore();return}
  ctx.fillStyle=grad3([q0[0]-R,q0[1]-R,q0[0]+R,q0[1]+R],K.ivory);ctx.fill();ctx.clip();
  // (the features sit a little higher on the head than the design's heights, so that they read under a camera that looks down at 29°:
  // the mask between the brows and the cheekbones, the eyes in it, the nose at its lower edge, the smile above the ruff)
  // the cheeks
  for(const sd of[-1,1]){const d=dirAt(sd*.56,-.08),v=vis(d);if(v<.12)continue;const q=pt(d),k=sstep(.12,.4,v);ctx.fillStyle=rgba(K.cheek,.55*k);ctx.beginPath();ctx.ellipse(q[0],q[1],3.4*Math.pow(v,.7),2.4,0,0,TAU);ctx.fill()}
  // the harlequin mask: a dark band from the temples (its points rise to them) to the cheekbones; its top edge makes a V of brows that dips
  // between the eyes (the evil look from every side); a thin golden edge
  const mTop=f=>{const af=Math.abs(f);return .5+.48*Math.pow(af,1.15)},mBot=f=>.1+.12*f*f,MF=1.0;
  {const top=[],bot=[];for(let i=0;i<=14;i++){const f=-MF+2*MF*i/14;top.push(dirAt(f,mTop(f)))}for(let i=0;i<=10;i++){const f=MF-2*MF*i/10;bot.push(dirAt(f,mBot(f)))}
    const sh=top.concat(bot).map(d=>pt(d,R+.1));poly(sh);const b=bbox(sh),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,K.mask.l);g.addColorStop(.45,K.mask.b);g.addColorStop(1,K.mask.d);
    ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.stroke()}
  // the eyes: gold that shines in a dark socket, looking a little down, cut on top by the V of the mask; the light does not throb, it grows
  // (the halo ×1.4) a moment before each blow; the wooden eyelids of a doll close from the top
  const E=[1,-1].map(sd=>{const d=dirAt(sd*EYEF,EYEP),v=vis(d);return{sd,d,v,q:pt(d,R+.15)}}).filter(e=>e.v>.08).sort((a,b)=>a.v-b.v);
  for(const e of E){const wd=1+.18*A.wide,rx=4.4*wd*Math.pow(e.v,.7),ry=5*wd,q=e.q,eg=A.eg*(e.sd>0?(A.eyeL==null?1:A.eyeL):(A.eyeR==null?1:A.eyeR)),op=1-A.lid;
    // the brow line over this eye: the mask's top edge between its inner and outer corner
    const fi=e.sd*(EYEF-.26),fo=e.sd*(EYEF+.3),bi=pt(dirAt(fi,mTop(fi)-.06),R+.1),bo=pt(dirAt(fo,mTop(fo)-.06),R+.1),bx=bo[0]-bi[0],by=bo[1]-bi[1],bl=Math.hypot(bx,by)||1,nx=by/bl,ny=-bx/bl,
      below=nx*(q[0]-bi[0])+ny*(q[1]-bi[1])>0?1:-1;
    ctx.save();ctx.beginPath();ctx.moveTo(bi[0]-bx*2,bi[1]-by*2);ctx.lineTo(bo[0]+bx*2,bo[1]+by*2);ctx.lineTo(bo[0]+bx*2+nx*below*30,bo[1]+by*2+ny*below*30);ctx.lineTo(bi[0]-bx*2+nx*below*30,bi[1]-by*2+ny*below*30);ctx.closePath();ctx.clip();
    ctx.fillStyle=K.mask.d;ctx.beginPath();ctx.ellipse(q[0],q[1],rx*1.3+.6,ry*1.18,0,0,TAU);ctx.fill();
    if(eg>.02&&op>.05){glowL(K.eyeG,q,ry*2.3*(1+.4*Math.max(0,A.eg-1)),.34*Math.min(1,eg)*op);
      const g=ctx.createRadialGradient(q[0]-rx*.2,q[1]+ry*.15,.3,q[0],q[1]+ry*.2,ry*1.05);g.addColorStop(0,K.eyeC);g.addColorStop(.5,K.eye);g.addColorStop(1,cmix(K.eye,'#000000',.38));
      ctx.save();ctx.globalAlpha*=cl(eg,0,1);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill();
      if(op>.45&&rx>1.4){ctx.fillStyle='#ffffff';ball([q[0]-rx*.3,q[1]-ry*.15],.95);ctx.fill()}ctx.restore()}
    else{ctx.fillStyle='#0b0410';ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,TAU);ctx.fill()}
    if(A.lid>.02){ctx.save();ctx.beginPath();ctx.ellipse(q[0],q[1],rx+.4,ry+.4,0,0,TAU);ctx.clip();const yl=q[1]-ry-.4+(2*ry+.8)*A.lid;
      ctx.fillStyle=K.mask.b;ctx.fillRect(q[0]-rx-1,q[1]-ry-1,2*rx+2,yl-(q[1]-ry-1));ctx.strokeStyle=K.gold.b;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-rx-1,yl);ctx.lineTo(q[0]+rx+1,yl);ctx.stroke();ctx.restore()}
    ctx.restore();
    // the golden edge of the brow over it
    ctx.strokeStyle=K.gold.b;ctx.lineWidth=1.1;ctx.lineCap='round';seg(bi,bo);ctx.stroke()}
  // the smile, the marionette's jaw between the two grooves (it drops when it talks, laughs or shouts), the dark mouth with a violet light
  {const ME=-.22,dm=dirAt(0,ME);if(vis(dm)>.04){const j=A.jaw,N=8,sm=[];for(let i=0;i<=N;i++){const f=-.45+.9*i/N;sm.push(pt(dirAt(f,ME+.1*(f/.45)*(f/.45))))}
    const gl=[pt(dirAt(-.45,ME+.09)),pt(dirAt(-.41,-.62))],gr=[pt(dirAt(.45,ME+.09)),pt(dirAt(.41,-.62))],chin=[];for(let i=0;i<=6;i++){const f=.41-.82*i/6;chin.push(pt(dirAt(f,-.64)))}
    if(j>.15){const dn=sm.map(q=>[q[0],q[1]+j]);
      ctx.beginPath();ctx.moveTo(sm[0][0],sm[0][1]);for(const q of sm)ctx.lineTo(q[0],q[1]);for(let i=dn.length-1;i>=0;i--)ctx.lineTo(dn[i][0],dn[i][1]);ctx.closePath();ctx.fillStyle=K.mouthIn;ctx.fill();
      if(!LOWFX){const m=sm[N>>1];ctx.save();ctx.clip();const g=ctx.createRadialGradient(m[0],m[1]+j*.6,.3,m[0],m[1]+j*.6,7);g.addColorStop(0,rgba(K.mouthL,.55));g.addColorStop(1,rgba(K.mouthL,0));ctx.fillStyle=g;ctx.fillRect(m[0]-9,m[1]-2,18,j+6);ctx.restore()}
      // the two little fangs at the top corners
      for(const i of[1,N-1]){const q=sm[i],h=Math.min(2.4,j*.8);ctx.fillStyle=K.fang;ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(q[0]-1.1,q[1]-.2);ctx.lineTo(q[0]+1.1,q[1]-.2);ctx.lineTo(q[0],q[1]+h);ctx.closePath();ctx.fill();ctx.stroke()}
      // the jaw: the piece between the grooves, down by j
      ctx.beginPath();ctx.moveTo(dn[0][0],dn[0][1]);for(const q of dn)ctx.lineTo(q[0],q[1]);ctx.lineTo(gr[1][0],gr[1][1]+j);for(const q of chin)ctx.lineTo(q[0],q[1]+j);ctx.lineTo(gl[1][0],gl[1][1]+j);ctx.closePath();
      ctx.fillStyle=K.ivory.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
      ctx.strokeStyle=K.smile;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(dn[0][0],dn[0][1]);for(const q of dn)ctx.lineTo(q[0],q[1]);ctx.stroke()}
    else{ctx.strokeStyle=K.smile;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sm[0][0],sm[0][1]);for(const q of sm)ctx.lineTo(q[0],q[1]);ctx.stroke()}
    ctx.strokeStyle=rgba('106,29,68',.75);ctx.lineWidth=1.1;for(const G of[gl,gr]){ctx.beginPath();ctx.moveTo(G[0][0],G[0][1]+(j>.15?j:0));ctx.lineTo(G[1][0],G[1][1]+(j>.15?j:0));ctx.stroke()}}}
  // the dark plum lining of the hood, a band just inside its golden edge
  if(cap.rim&&cap.rim.length>1){ctx.beginPath();ctx.moveTo(cap.rim[0][0],cap.rim[0][1]);for(const q of cap.rim)ctx.lineTo(q[0],q[1]);if(cap.full)ctx.closePath();ctx.strokeStyle=rgba('35,15,53',.7);ctx.lineWidth=5;ctx.lineJoin='round';ctx.stroke()}
  // the cracks of the paint in the second phase: thin zigzag lines from the points of the mask down the temples (just inside the hood's
  // edge), lit magenta, breathing
  if(A.crk>.02&&K.top){for(const sd of[-1,1]){const pts=[[.84,58],[.88,47],[.83,37],[.87,27],[.83,17]].map(([r,ph])=>{const a=ph*Math.PI/180;return[Math.cos(r),sd*Math.sin(r)*Math.cos(a),Math.sin(r)*Math.sin(a)]});if(vis(pts[2])<.05)continue;const S=pts.map(d=>pt(d,R+.1));
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();S.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.strokeStyle='rgba(40,8,30,.7)';ctx.lineWidth=1.8;ctx.stroke();
    ctx.strokeStyle=rgba(K1.crk,.95*A.crk);ctx.lineWidth=.9;ctx.stroke();if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(K1.crk,.35*A.crk);ctx.lineWidth=3;ctx.stroke()}ctx.restore()}}
  ctx.restore();
  // the golden edge of the hood round the face
  if(cap.rim&&cap.rim.length>1){ctx.beginPath();ctx.moveTo(cap.rim[0][0],cap.rim[0][1]);for(const q of cap.rim)ctx.lineTo(q[0],q[1]);if(cap.full)ctx.closePath();ctx.lineCap='round';ctx.lineJoin='round';
    ctx.strokeStyle=INK;ctx.lineWidth=3.8;ctx.stroke();ctx.strokeStyle=K.gold.b;ctx.lineWidth=2.2;ctx.stroke()}
  // the nose: a little ball that sticks out
  {const d=dirAt(0,.08),v=vis(d);if(v>-.3){const q=P(add(Hc,mul(HR(d),R+1.5)));ctx.save();ctx.globalAlpha*=sstep(-.3,0,v);ball3(q,3.2,K.nose,1.4,.2);ctx.fillStyle='rgba(255,255,255,.75)';ball([q[0]-1,q[1]-1.1],.8);ctx.fill();ctx.restore()}}
  // the stars over the head (hit, snap)
  if(A.stars>0)starsP(P(add(Hc,[0,0,R+8])),14,A.stars,A.jph*2)}
// dizzy stars over the head (turning with the move, not with the clock)
function starsP(c0,r,a,ph){if(a<=0)return;for(let i=0;i<3;i++){const an=ph+i*TAU/3;C.starS(c0[0]+Math.cos(an)*r,c0[1]+Math.sin(an)*r*.33*C.KR(),2.2,a)}}
// the two points of the hood: from the top of the head out and down to the bells (the purple one on its left, the crimson one on its
// right). They follow the head a little late: each point turns with the head of a moment ago as much as it is far from the root (the root
// never leaves the hood); limp when nobody holds the strings
function tipPts(H0,H1,X,A,sd){const o=[];for(let i=0;i<TIP.length;i++){const k=TIPLAG[i],l=[TIP[i][0],sd*TIP[i][1],TIP[i][2]],
    hy=lerp(H0.hy,H1.hy,k),hp=lerp(H0.hp,H1.hp,k),hr=lerp(H0.hr,H1.hr,k),R=v=>X.Rd(rotZ(rotX(rotY(v,hp),hr),hy));
    // (only the turn lags, and the chain stays on the head: it never stretches)
    let q=add(H0.Hc,R(l));if(A.droop>0){const dz=TIPDROOP[i]*A.droop;q=add(q,[0,0,-dz]);q=add(q,mul(R([0,sd,0]),-dz*.25))}
    if(A.tsw)q=add(q,R([0,sd*A.tsw*k*3,A.tsw*k*4]));o.push(q)}return o}
function bellAt(A,pts,sd){const t=pts[pts.length-1],ph=A.jph*TAU+(sd>0?0:1.3),j=A.jb;return add(t,[1.4*j*Math.sin(ph),1.8*j*Math.sin(ph+1),-4])}
function tipDraw(V0,pts,A,K,sd,noBell,front){const T=sd>0?K.vel:K.cri,P2=pts.map(q=>V0.P(q)),bb=bbox(P2);bb[0]-=6;bb[1]-=6;bb[2]+=6;bb[3]+=6;
  const gr=grad3(front||bb,T);
  if(!front)chain(V0,pts,TIPR,T.b,{lw:2.4,fill:gr,noRim:1});
  else{// over the hood (front: the hood's box, its velvet's gradient): the root is the hood's own velvet going into the point (the violet
    // one without a line, the crimson one with a thin seam), the rest a thinner outline
    const W=[sd>0?0:.9,2,2,2],cap=(i,r0,r1)=>{hull(P2[i],Math.max(.25,r0),P2[i+1],Math.max(.25,r1));ctx.fill()};
    ctx.fillStyle=INK;for(let i=0;i<P2.length-1;i++)if(W[i])cap(i,TIPR[i]+W[i]/2+.1,TIPR[i+1]+W[i]/2+.1);
    ctx.fillStyle=gr;for(let i=0;i<P2.length-1;i++)cap(i,TIPR[i]-W[i]/2+.1,TIPR[i+1]-W[i]/2+.1)}
  rimChain(P2.slice(0,3),TIPR,.24);topM(P2[1],5.5,K);
  if(!noBell)bellDraw(V0,bellAt(A,pts,sd),K,A.jb)}
function bellDraw(V0,c,K,jb){const q=V0.P(c);glowL('255,214,110',q,8,.25*jb*sstep(.2,.5,jb));ball3(q,3.2,K.gold,1.6,.3);
  ctx.strokeStyle='#5a3a08';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-1.9,q[1]+1.3);ctx.quadraticCurveTo(q[0],q[1]+2.5,q[0]+1.9,q[1]+1.3);ctx.stroke();
  ctx.fillStyle='#3a2408';ball([q[0],q[1]+2.6],.75);ctx.fill();ctx.fillStyle='rgba(255,255,240,.85)';ball([q[0]-1,q[1]-1.1],.7);ctx.fill()}
// the magenta light of the Shadow's eyes on the top of a piece (the second phase: the glowTop turns magenta)
function topM(q,r,K){if(!K.top)return;ctx.fillStyle=rgba(K.top,.3*K.topA);ctx.beginPath();ctx.ellipse(q[0]-r*.3,q[1]-r*.45,r*.58,r*.34,0,0,TAU);ctx.fill()}
// the lantern's shadeLimb on a piece of limb (a darker side away from the light, a thin warm line on the lit one)
const shadeL=(a,b,ra,rb)=>C.R.shadeLimb([a,b],[ra*.9,rb*.9],'rgba(60,28,10,.2)',.16);

// ------------------------------------------------------------------ the head's own camera: it turns on its peg by itself, nods and tilts,
// a little toward the camera (so the face reads from the side too) and it half follows the body's lean (a puppet's head on its peg)
function headNow(A,X,face){const hy=A.hy+cheat(face,.3)*(1-A.droop),hp=A.hp-.4*A.lean,hr=A.hr;
  return{Hc:X.T([HC0[0]+A.hx,0,HC0[2]+A.hz]),hy,hp,hr,HR:v=>X.Rd(rotZ(rotX(rotY(v,hp),hr),hy))}}

// ------------------------------------------------------------------ the strings: lines between the true points of the cross and of the body,
// so they stay attached from every side and in every pose. Gold of 1.1 over a dark line of 2.2 (they stand out from the floor); taut =
// straight; slack = a belly of up to 18 that hangs out and down, dimmer; lit = 1.6 and bright with a halo, a pearl of light running down
// from the cross to the limb; shaking (under 8 a second); broken = it springs back up from its eyelet and fades
const SPH={h:.4,wL:1.7,wR:2.9,kL:4.1,kR:5.3,up:.9};
// the points of a string from the cross end b down to the eyelet a (3D, 11 of them)
function strLine(a,b,t,out){const N=10,belly=18*(1-cl(t,0,1)),o=[];if(belly<.3){for(let i=0;i<=N;i++)o.push(lerp3(b,a,i/N));return o}
  const m=lerp3(b,a,.5),c=add(m,mul(nrm(add(out,[0,0,-.75])),2*belly));
  for(let i=0;i<=N;i++){const u=i/N,v=1-u;o.push([v*v*b[0]+2*u*v*c[0]+u*u*a[0],v*v*b[1]+2*u*v*c[1]+u*u*a[1],v*v*b[2]+2*u*v*c[2]+u*u*a[2]])}return o}
// its screen points, shaken across by vib in the middle
function strScr(P,pts,vib,ph){const Q=pts.map(q=>P(q));if(vib<=.05)return Q;const a=Q[0],b=Q[Q.length-1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,s=Math.sin(ph);
  for(let i=1;i<Q.length-1;i++){const k=vib*s*Math.sin(Math.PI*i/(Q.length-1));Q[i]=[Q[i][0]+nx*k,Q[i][1]+ny*k]}return Q}
// the piece of a polyline between the fractions f0 and f1 (of its points)
function sub2(Q,f0,f1){const n=Q.length-1,at=f=>{const x=cl(f,0,1)*n,i=Math.min(n-1,Math.floor(x)),k=x-i;return[lerp(Q[i][0],Q[i+1][0],k),lerp(Q[i][1],Q[i+1][1],k)]};
  const o=[at(f0)];for(let i=Math.floor(f0*n)+1;i<f1*n-1e-6;i++)o.push(Q[i]);o.push(at(f1));return o}
const sub3=(pts,f)=>{const n=pts.length-1,x=cl(f,0,1)*n,i=Math.min(n-1,Math.floor(x));return lerp3(pts[i],pts[i+1],x-i)};
function strStroke(Q,s,K,al){if(Q.length<2||al<=.01)return;const l=cl(s.l,0,1),a=al*(.5+.5*cl(s.t,0,1));
  ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(Q[0][0],Q[0][1]);for(let i=1;i<Q.length;i++)ctx.lineTo(Q[i][0],Q[i][1]);
  ctx.strokeStyle=`rgba(40,20,10,${(.5*a).toFixed(3)})`;ctx.lineWidth=2.2+.6*l;ctx.stroke();
  if(l>.02&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(K.str,.32*l*a);ctx.lineWidth=5.5;ctx.stroke();ctx.restore()}
  ctx.strokeStyle=C.rgba(l>.02?cmix(K.strC,K.strHot,l):K.strC,a);ctx.lineWidth=1.1+.5*l;ctx.stroke()}
function pearl(Q,u,K,al){if(u<0||u>1||al<=.05)return;const e=sub2(Q,0,u),q=e[e.length-1];glowL(K.str,q,7,.8*al);ctx.fillStyle=`rgba(255,255,255,${al.toFixed(3)})`;ball(q,1.7);ctx.fill()}

// ------------------------------------------------------------------ the control cross: dark lacquered wood in its own frame (it turns with the
// body's facing, swings and tilts by itself; roll > 0 dips its left end, pitch > 0 its front end): the long bar for the wrists, the short bar,
// the bar of the knees across its front end, golden knobs on the six ends and the golden ring on top
const CRL=28,CRF=21,CRB=16,CRK=20,KBZ=-.6;
function crossNow(A,mini,lift){const c=[CR0[0]+A.cx[0],CR0[1]+A.cx[1],(mini?140:CR0[2])+A.cx[2]+lift],cp=A.cp,cr=A.cr,cy=A.cyw,kb=A.kb||0;
  const R=v=>rotZ(rotX(rotY(v,cp),-cr),cy),T=q=>add(c,R(q)),Tk=y=>add(c,R(add([CRF,0,KBZ],rotX([0,y,0],-kb))));
  return{c,R,T,Tk,ends:{h:T([0,0,-1.9]),wL:T([0,CRL,0]),wR:T([0,-CRL,0]),kL:Tk(CRK),kR:Tk(-CRK),ring:T([0,0,6.8]),upL:T([0,3,10.2]),upR:T([0,-3,10.2])}}}
function crossDraw(V0,CX,K,A,sh){const{P,D}=V0,T=K.crossW,L=parts();
  const bar=(a,b,r)=>{const qa=P(a),qb=P(b);caps3(qa,r,qb,r,T,2);rimChain([qa,qb],[r,r],.24);
    // the lacquer: a thin line of light along its top (magenta in the second phase)
    const dx=qb[0]-qa[0],dy=qb[1]-qa[1],l=Math.hypot(dx,dy);if(l<2)return;let nx=-dy/l,ny=dx/l;if(nx+ny>0){nx=-nx;ny=-ny}
    ctx.strokeStyle=K.top?rgba(K.top,.35*K.topA+.1):'rgba(255,226,180,.4)';ctx.lineWidth=.8;ctx.lineCap='round';seg([qa[0]+nx*r*.45+dx*.08,qa[1]+ny*r*.45+dy*.08],[qb[0]+nx*r*.45-dx*.08,qb[1]+ny*r*.45-dy*.08]);ctx.stroke()};
  const bars=[[CX.T([0,-CRL,0]),CX.T([0,CRL,0]),1.8],[CX.T([-CRB,0,1.5]),CX.T([CRF+1,0,1.5]),1.7],[CX.Tk(-CRK),CX.Tk(CRK),1.5]];
  for(const[a,b,r] of bars)L.add(D(lerp3(a,b,.5)),()=>bar(a,b,r));
  for(const q of[CX.T([0,-CRL-1.4,0]),CX.T([0,CRL+1.4,0]),CX.T([-CRB-1.4,0,1.5]),CX.T([CRF+2.8,0,1.5]),CX.Tk(-CRK-1.2),CX.Tk(CRK+1.2)])L.add(D(q)+.05,()=>ball3(P(q),2.6,K.gold,1.6,.3));
  // the golden ring on top, standing across the long bar (the two strings into the dark go through it)
  L.add(D(CX.ends.ring)+.2,()=>{const R=ringS(V0,CX.ends.ring,CX.R([0,1,0]),CX.R([0,0,1]),3.6,16);poly(R);ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=4.4;ctx.stroke();
    ctx.strokeStyle=K.gold.d;ctx.lineWidth=2.4;ctx.stroke();ctx.strokeStyle=K.gold.l;ctx.lineWidth=1;ctx.beginPath();for(let i=9;i<15;i++)ctx.lineTo(R[i][0],R[i][1]-.3);ctx.stroke()});
  if(sh)shHands(V0,L,CX,sh);
  run(L)}

// ------------------------------------------------------------------ the Shadow (second phase): a dark violet mist over the cross facing the
// camera, two big almond eyes of magenta in it, and a hand of shadow in 3D in the cross's frame that holds it: the palm over the ring, four
// long but round fingers round the long bar near its middle, the thumb under it, the wrist rising into the mist like a column of smoke that
// thins out; the other hand only in the Mano dell'Ombra and in the fury. Nebbia, due occhi e una mano: niente denti
const SHH=[-6.6,-2.2,2.2,6.6],SHFC=[[4,6.5],[8,2.5],[6.5,-2.8],[2.8,-4.6]],SHFO=[[4,6.5],[10,5.2],[15.5,3.4],[20,1.6]],SHFR=[3.4,3.1,2.8,2.4];
function shHand(V0,L,T0,go,gz,al,side){const{P,D}=V0,H=SHD.hand,dz=gz||0,yy=side||0,T=q=>add(T0([q[0],q[1],q[2]-dz]),[0,0,dz]);   // (its height over the grip is the world's)
  const palm=T([-1,yy,9+dz]);
  // the palm: a soft dark cushion over the ring
  L.add(D(palm),()=>ga(al,()=>{const S=[];for(let i=0;i<14;i++){const t=i/14*TAU;S.push(P(T([-1+8*Math.cos(t),yy+10*Math.sin(t),9+dz+(Math.cos(t)>0?-1:1)])))}
    const top=P(T([-1,yy,13.5+dz]));S.push(top);const h=chull(S);if(h.length<3)return;const pa=smoothP(h);ctx.fillStyle=grad3(bbox(h),H);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke(pa);rimM(h,.55)}));
  for(let i=0;i<4;i++){const y=yy+SHH[i],pts=SHFC.map((c,j)=>T([lerp(c[0],SHFO[j][0],go),y,lerp(c[1],SHFO[j][1],go)+dz]));
    L.add(D(pts[2])+(go<.5?0:.1),()=>ga(al,()=>{const P2=pts.map(q=>P(q)),bb=bbox(P2);bb[0]-=4;bb[1]-=4;bb[2]+=4;bb[3]+=4;chain(V0,pts,SHFR,H.b,{lw:2,fill:grad3(bb,H),noRim:1});
      ctx.strokeStyle=rgba(SHD.hr,.45);ctx.lineWidth=.9;ctx.lineCap='round';ctx.beginPath();for(const q of P2)ctx.lineTo(q[0]-.9,q[1]-1.3);ctx.stroke()}))}
  const th=[[-6,yy+7.5,5.5],lerp3([-6.5,yy+6,.5],[-9,yy+10,3],go),lerp3([-3.5,yy+3.5,-3.6],[-11,yy+12,1],go)].map(q=>T([q[0],q[1],q[2]+dz]));
  L.add(D(th[1]),()=>ga(al,()=>{const P2=th.map(q=>P(q)),bb=bbox(P2);bb[0]-=4;bb[1]-=4;bb[2]+=4;bb[3]+=4;chain(V0,th,[3.2,2.9,2.4],H.b,{lw:2,fill:grad3(bb,H),noRim:1})}));
  return palm}
// a magenta rim inside an outline (the light of the eyes on the Shadow's hand)
function rimM(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.2,cy+Rr*.2),kx=1-1.6/Math.max(1,(x1-x0)/2),ky=1-1.6/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,rgba(SHD.hr,al));g.addColorStop(1,rgba(SHD.hr,0));ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
function shHands(V0,L,CX,sh){const al=sh.k,o=sh;if(al<=.01)return;
  // the hand that holds the cross (it comes down from the mist and closes on it in the fury)
  shHand(V0,L,CX.T,o.go||0,o.gz||0,al,0);
  // the free hand (rises from the cross into the dark and comes back)
  if(o.free&&o.free.k>.01)shHand(V0,L,CX.T,.85,o.free.z||0,al*o.free.k,-15)}
// the mist: lumps of soft dark violet with a violet edge (an ellipse at half strength on slow phones), breathing. It is painted once in a
// canvas of its own (it only breathes and fades): one picture costs far less than its soft lumps every frame
const MIST={c:null,R:2,W:66,H:48};
function mistImg(){if(MIST.c)return MIST.c;const R=MIST.R,cv=document.createElement('canvas');cv.width=2*MIST.W*R;cv.height=2*MIST.H*R;const g=cv.getContext('2d'),sy=32/45;
  g.setTransform(R*.9,0,0,R*.9,MIST.W*R,MIST.H*R);
  // the lumps of the cloud (x, y, radius, darkness); first their violet edges, then the dark on top: the edge shows only round the outside
  const LU=[[0,4,40,.85],[-25,8,24,.6],[26,6,23,.6],[-9,-15,23,.55],[13,-13,21,.55],[2,16,22,.5]];
  const lump=(x,y,r,st)=>{const gr=g.createRadialGradient(0,0,r*.05,0,0,r);for(const[o,c] of st)gr.addColorStop(o,c);g.save();g.translate(x,y);g.scale(1,sy);g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();g.restore()};
  for(const[x,y,r] of LU)lump(x,y,r*1.06,[[0,`rgba(${SHD.rim},0)`],[.7,`rgba(${SHD.rim},0)`],[.86,`rgba(${SHD.rim},.25)`],[1,`rgba(${SHD.rim},0)`]]);
  for(const[x,y,r,a] of LU)lump(x,y,r,[[0,`rgba(${SHD.mist},${a})`],[.6,`rgba(${SHD.mist},${(a*.62).toFixed(3)})`],[1,`rgba(${SHD.mist},0)`]]);
  return MIST.c=cv}
function shMist(q,k,br){if(k<=.01)return;
  if(LOWFX){ctx.fillStyle=`rgba(${SHD.mist},${(.5*k).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],45*(1+br),32*(1+br),0,0,TAU);ctx.fill();return}
  const im=mistImg(),s=1+br,a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);ctx.drawImage(im,q[0]-MIST.W*s,q[1]-MIST.H*s,2*MIST.W*s,2*MIST.H*s);ctx.globalAlpha=a0}
// an almond eye facing the camera (w × h, the inner corner lower: cross), with its white core and halo; blink 1 open .. 0 shut; sq narrows
// it; moon turns it into a laughing crescent
function almond(c,w,h,rot,col,core,glow,al,o){if(al<=.01)return;o=o||{};const bl=o.blink==null?1:o.blink,sq=o.sq||0,mo=o.moon||0,hh=h*Math.max(.08,bl)*(1-.55*sq);
  ctx.save();ctx.translate(c[0],c[1]);ctx.rotate(rot);ctx.globalAlpha*=al;
  if(glow&&!LOWFX&&bl>.2){ctx.save();ctx.globalCompositeOperation='lighter';shine(glow,0,0,w*1.15*(o.eg||1),.55*Math.min(1,bl),w*.55*(o.eg||1));ctx.restore()}
  if(mo>.5){ctx.strokeStyle=col;ctx.lineWidth=h*.55;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-w/2,h*.25);ctx.quadraticCurveTo(0,-h*1.1,w/2,h*.25);ctx.stroke();
    if(core){ctx.strokeStyle=core;ctx.lineWidth=h*.18;ctx.stroke()}ctx.restore();return}
  ctx.beginPath();ctx.moveTo(-w/2,0);ctx.quadraticCurveTo(0,-hh*1.15-(sq*h*.15),w/2,0);ctx.quadraticCurveTo(0,hh*1.05,-w/2,0);ctx.closePath();
  if(core){const g=ctx.createRadialGradient(0,0,.3,0,0,w*.5);g.addColorStop(0,core);g.addColorStop(.38,col);g.addColorStop(1,cmix(col,'#000000',.35));ctx.fillStyle=g}else ctx.fillStyle=col;ctx.fill();
  ctx.restore()}
function shEyes(q,sh,al,lk){const sp=15,bl=sh.blink==null?1:sh.blink,e=sh.eye==null?1:sh.eye;if(e<=.01)return;
  for(const sd of[-1,1])almond([q[0]+sd*sp+lk[0],q[1]-2+lk[1]],14,6*e,-sd*.26,SHD.eye,'#ffffff',SHD.eyeG,al,{blink:bl,sq:sh.sq||0,moon:sh.moon||0,eg:sh.eg||1})}
// the hint of who moves it (first phase): two light violet eyes open a little in the dark over the cross and close again (20%)
function hintEyes(q,a){if(a<=.01)return;for(const sd of[-1,1])almond([q[0]+sd*13,q[1]],11,4,-sd*.26,'rgb(190,150,255)',null,null,.2*a,{blink:a})}
// the Shadow's wrist: a column of smoke from the palm up into the mist, thinner as it rises
function shWrist(V0,palm,top,al){if(al<=.01)return;const a=V0.P(palm),b=top,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w0=8,w1=3;
  ctx.save();ctx.globalAlpha*=al;const g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,'rgba(42,20,68,.95)');g.addColorStop(.7,'rgba(30,14,48,.55)');g.addColorStop(1,'rgba(20,10,34,0)');
  const sw=Math.sin(a[1]*.07)*2;ctx.beginPath();ctx.moveTo(a[0]+nx*w0,a[1]+ny*w0);ctx.quadraticCurveTo((a[0]+b[0])/2+nx*(w0+w1)/2+sw,(a[1]+b[1])/2,b[0]+nx*w1,b[1]+ny*w1);
  ctx.lineTo(b[0]-nx*w1,b[1]-ny*w1);ctx.quadraticCurveTo((a[0]+b[0])/2-nx*(w0+w1)/2+sw,(a[1]+b[1])/2,a[0]-nx*w0,a[1]-ny*w0);ctx.closePath();ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle=rgba(SHD.hr,.3);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a[0]+nx*w0*.8,a[1]+ny*w0*.8);ctx.quadraticCurveTo((a[0]+b[0])/2+nx*(w0+w1)*.4+sw,(a[1]+b[1])/2,b[0]+nx*w1,b[1]+ny*w1);ctx.stroke();ctx.restore()}

// ------------------------------------------------------------------ the curtain: a drape of crimson velvet facing the camera (the same from every
// side), 96 wide (the design's 78 left his big hands out at the sides) and 166 tall (with 150 the top of his hood and its two points showed
// through the part that melts into the dark), centred on him and in front of him. It hangs from the dark (its top melts into it in the last 25), seven folds
// in three tones (four on slow phones), the golden fringe along the hem (one dashed stroke of upright dashes), the golden cord with its
// tassel tied on the left a third of the way up. c.k: how far down it is (0 up in the dark, 1 down to the floor); c.w: how much the hem and
// the folds wave (±4); c.bulge: his shape pushing it once; c.melt: it dissolves from the hem in sparks of gold
const CURW=96,CURH=166;
function curtainDraw(V0,c,K,fx){const q0=V0.P(0,0,0),Wd=CURW,Ht=CURH,yF=q0[1]+8,yT=yF-Ht,melt=c.melt||0,yB=yT+Ht*c.k*(1-melt);if(yB-yT<1.5)return;
  const nF=LOWFX?4:7,fw=Wd/nF,x0=q0[0]-Wd/2,wv=c.w||0,ph=c.ph||0,bu=c.bulge||0,T=K1.cri,yc=yT+Ht*.5,yS=yT+Math.min(25,(yB-yT)*.6);
  const hem=x=>yB+4*wv*Math.sin((x-x0)*.17+ph*1.3)*Math.min(1,(yB-yT)/30);
  const ex=(i,y)=>{if(i<=0)return x0;if(i>=nF)return x0+Wd;const xc=x0+i*fw,b=bu*.14*(xc-q0[0])*Math.exp(-(((y-yc)/42)**2));return xc+1.6*wv*Math.sin(y*.09+i*2.1+ph)+b};
  // a colour that melts into the dark over the top (transparent at yT, whole from yS)
  const vfade=(rgb,a)=>{const g=ctx.createLinearGradient(0,yT,0,yS);g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(1,`rgba(${rgb},${a})`);return g};
  ctx.lineJoin='round';
  // the folds in three tones across; their top melts into the dark (slices of rising alpha: no canvas of its own, that costs a lot)
  const G=[];for(let i=0;i<nF;i++){const xa=x0+i*fw,g=ctx.createLinearGradient(xa,0,xa+fw,0);g.addColorStop(0,T.b);g.addColorStop(.3,T.l);g.addColorStop(.62,T.b);g.addColorStop(1,T.d);G.push(g)}
  const NS=LOWFX?3:6,a0=ctx.globalAlpha;
  for(let j=0;j<NS;j++){const ya=yT+(yS-yT)*j/NS,yb=yT+(yS-yT)*(j+1)/NS+(j<NS-1?.4:0);ctx.globalAlpha=a0*(j+.5)/NS;
    for(let i=0;i<nF;i++){ctx.beginPath();ctx.moveTo(ex(i,ya),ya);ctx.lineTo(ex(i+1,ya),ya);ctx.lineTo(ex(i+1,yb),yb);ctx.lineTo(ex(i,yb),yb);ctx.closePath();ctx.fillStyle=G[i];ctx.fill()}}
  ctx.globalAlpha=a0;
  for(let i=0;i<nF;i++){const ys=[];for(let j=0;j<=5;j++)ys.push(yS+(yB-yS)*j/5);const L0=ys.map(y=>[ex(i,y),y]),R0=ys.map(y=>[ex(i+1,y),y]);
    L0[5][1]=hem(L0[5][0]);R0[5][1]=hem(R0[5][0]);ctx.beginPath();for(const q of L0)ctx.lineTo(q[0],q[1]);for(let j=5;j>=0;j--)ctx.lineTo(R0[j][0],R0[j][1]);ctx.closePath();ctx.fillStyle=G[i];ctx.fill()}
  // the fold lines, the top and the hem a little darker, his shape pushing it
  ctx.strokeStyle=vfade('40,4,14',.45);ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<nF;i++){for(let j=0;j<=6;j++){const y=yT+(yB-yT)*j/6,x=ex(i,y);if(j)ctx.lineTo(x,j<6?y:hem(x));else ctx.moveTo(x,y)}}ctx.stroke();
  {const g=ctx.createLinearGradient(0,yS,0,yB);g.addColorStop(0,'rgba(20,0,8,.25)');g.addColorStop(.55,'rgba(20,0,8,0)');g.addColorStop(1,'rgba(20,0,8,.28)');ctx.fillStyle=g;ctx.fillRect(x0,yS,Wd,yB-yS+5)}
  if(bu>.01){const g=ctx.createRadialGradient(q0[0]-4,yc-6,4,q0[0],yc,40);g.addColorStop(0,`rgba(255,190,200,${(.22*bu).toFixed(3)})`);g.addColorStop(.7,`rgba(255,150,170,${(.08*bu).toFixed(3)})`);g.addColorStop(1,'rgba(40,0,10,0)');ctx.fillStyle=g;ctx.fillRect(x0,yS,Wd,yB-yS)}
  // the outline: the two sides (melting into the dark on top) and the hem
  ctx.beginPath();ctx.moveTo(x0,yT);ctx.lineTo(x0,hem(x0));for(let i=1;i<=12;i++){const x=x0+Wd*i/12;ctx.lineTo(x,hem(x))}ctx.lineTo(x0+Wd,yT);ctx.strokeStyle=vfade('10,6,14',1);ctx.lineWidth=2.4;ctx.stroke();
  // the golden fringe under the hem: a band of dark gold, then upright dashes of gold
  ctx.beginPath();for(let i=0;i<=16;i++){const x=x0+1+(Wd-2)*i/16;ctx.lineTo(x,hem(x)+2.8)}ctx.lineCap='butt';ctx.strokeStyle=INK;ctx.lineWidth=6.6;ctx.stroke();ctx.strokeStyle='#b17b12';ctx.lineWidth=5;ctx.stroke();
  ctx.setLineDash([1.5,1.3]);ctx.strokeStyle='#ffcd45';ctx.lineWidth=5;ctx.stroke();ctx.setLineDash([]);ctx.lineCap='round';
  ctx.beginPath();for(let i=0;i<=16;i++){const x=x0+1+(Wd-2)*i/16;ctx.lineTo(x,hem(x)+.4)}ctx.strokeStyle='#ffcd45';ctx.lineWidth=1.4;ctx.stroke();
  // the golden cord tied on the left a third of the way up, with its tassel
  const ry=yF-Ht/3;if(ry<yB-6&&ry>yT+10){const a=[x0-1.5,ry-7],b=[x0+15,ry+1],e=[x0-1.5,ry+7];ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(b[0]+2,b[1]-6,b[0],b[1]);ctx.quadraticCurveTo(b[0]+2,b[1]+6,e[0],e[1]);
    ctx.strokeStyle=INK;ctx.lineWidth=3.8;ctx.stroke();ctx.strokeStyle='#ffcd45';ctx.lineWidth=2;ctx.stroke();
    const k=[b[0]-1,b[1]];ball3(k,2.2,K1.gold,1.4,.2);const tl=[k[0]+1,k[1]+2.5],sw=Math.sin(ph*1.7)*wv*1.5;ctx.beginPath();ctx.moveTo(tl[0]-1.6,tl[1]);ctx.quadraticCurveTo(tl[0]-3.4+sw,tl[1]+6,tl[0]-2.4+sw,tl[1]+9.5);
    ctx.lineTo(tl[0]+2.6+sw,tl[1]+9.5);ctx.quadraticCurveTo(tl[0]+3.6+sw,tl[1]+6,tl[0]+1.6,tl[1]);ctx.closePath();ctx.fillStyle='#ffcd45';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
    ctx.strokeStyle='#b17b12';ctx.lineWidth=.8;for(const d of[-1,.2,1.4]){ctx.beginPath();ctx.moveTo(tl[0]+d+sw*.5,tl[1]+3.5);ctx.lineTo(tl[0]+d*1.2+sw,tl[1]+9);ctx.stroke()}}
  // melting from the hem: sparks of gold rising
  if(melt>0&&fx){for(let i=0;i<14;i++){const u=(i+.5)/14,x=x0+Wd*u,t=cl(melt*1.25-((i*7)%5)*.05,0,1);if(t<=0||t>=1)continue;const q=[x+Math.sin(i*3.1)*3*t,hem(x)-4-26*t];
    ctx.fillStyle=`rgba(255,${200+((i*37)%50)},110,${(1-t).toFixed(3)})`;ball(q,1.4*(1-t*.4));ctx.fill();if(i%3===0)star4(q,3*(1-t),1-t,'#fff6c8')}}}

// ------------------------------------------------------------------ the effects of the moves (none with o.noFx or on slow phones)
function sparkAt(q,t,col,n){if(t<0||t>=1)return;for(let i=0;i<(n||6);i++){const a=i/(n||6)*TAU+.4,d=3+12*t,g=8*t*t;ctx.fillStyle=`rgba(${col},${(1-t).toFixed(3)})`;ball([q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d*.8+g],1.3*(1-t*.5));ctx.fill()}
  star4(q,5*(1-t),1-t,'#ffffff')}
function fxDraw(V0,L,e,A,K,J){const{P,D}=V0,t=e.t,col=A.k2>.5?'255,122,214':'255,214,110',top=J.dTop+20,ri=sstep(0,.35,t);if(ri<=.01)return;const L0=L;L={add:(d,f)=>L0.add(d,()=>ga(ri,f))};
  if(e.k==='spark'||e.k==='ping'){const c=J.eyes[e.s];if(!c)return;L.add(top,()=>{const q=P(c);if(e.k==='spark')sparkAt(q,t,col,7);else{ctx.strokeStyle=rgba(col,.7*(1-t));ctx.lineWidth=1.2;ball(q,2+8*t);ctx.stroke()}})}
  else if(e.k==='tac'){const c=J.eyes[e.s];if(!c)return;L.add(top,()=>{const q=P(c);ctx.strokeStyle=`rgba(255,250,225,${(1-t).toFixed(3)})`;ctx.lineWidth=1.2;ctx.lineCap='round';
      for(let i=0;i<4;i++){const a=i*Math.PI/2+.78,r0=2+3*t,r1=4+6*t;seg([q[0]+Math.cos(a)*r0,q[1]+Math.sin(a)*r0],[q[0]+Math.cos(a)*r1,q[1]+Math.sin(a)*r1]);ctx.stroke()}
      if(e.smoke)K3.dust(V0,c,t,5,5,'150,100,210',.45)})}
  else if(e.k==='pound'){for(const sd of[1,-1]){if(e.one&&e.one!==sd)continue;const a=sd>0?J.aL:J.aR,c=[a.c[0],a.c[1],0];
      L.add(-9000,()=>{const q=P(c);ctx.strokeStyle=`rgba(200,180,255,${(.6*(1-t)).toFixed(3)})`;ctx.lineWidth=2*(1-t)+.6;ctx.beginPath();ctx.ellipse(q[0],q[1],6+22*t,(6+22*t)*.55*C.KR(),0,0,TAU);ctx.stroke()});
      L.add(D(c)+30,()=>K3.dust(V0,c,t,7,9,'196,184,160',.55))}}
  else if(e.k==='thud'){const c=[A.B[0],A.B[1],0];L.add(-9000,()=>{const q=P(c);ctx.strokeStyle=`rgba(200,180,255,${(.5*(1-t)).toFixed(3)})`;ctx.lineWidth=2.4*(1-t)+.6;ctx.beginPath();ctx.ellipse(q[0],q[1],20+40*t,(20+40*t)*.55*C.KR(),0,0,TAU);ctx.stroke()});
    L.add(J.dTop+5,()=>K3.dust(V0,[c[0]+6,c[1],0],t,12,28,'196,184,160',.5))}
  else if(e.k==='clap'){const m=lerp3(J.aL.c,J.aR.c,.5);L.add(top,()=>{const q=P(m);star4(q,7*(1-t),1-t,'#fff6d8');ctx.strokeStyle=`rgba(255,240,200,${(.8*(1-t)).toFixed(3)})`;ctx.lineWidth=1.1;
      for(let i=0;i<6;i++){const a=i/6*TAU,r0=4+4*t,r1=7+8*t;seg([q[0]+Math.cos(a)*r0,q[1]+Math.sin(a)*r0],[q[0]+Math.cos(a)*r1,q[1]+Math.sin(a)*r1]);ctx.stroke()}})}
  else if(e.k==='snapR'){const c=J.aR.G.idx;L.add(top,()=>{const q=P(c);sparkAt(q,t,col,8);for(let i=0;i<3;i++){const u=cl(t*1.3-i*.12,0,1);if(u<=0||u>=1)continue;const q2=P(add(c,mul(J.fw,20+30*u+i*8)));ctx.fillStyle=`rgba(${col},${(1-u).toFixed(3)})`;ball(q2,1.4);ctx.fill()}})}}
// the joints smoke a thread of violet in the strong moves of the second phase
function smokeDraw(V0,pts,k,p){for(let j=0;j<pts.length;j++){const c=pts[j];for(let i=0;i<2;i++){const u=((p*3+i*.5+j*.27)%1+1)%1,q=V0.P(add(c,[Math.sin(j+u*3)*2,0,3+u*16]));
  ctx.fillStyle=`rgba(120,60,180,${(.35*k*(1-u)).toFixed(3)})`;ball(q,1.8+u*3.5);ctx.fill()}}}

// ------------------------------------------------------------------ the model
const EPS=.05;
function puppeteer2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';p=cl(+p||0,0,.9999);
  const V0=V(face),{P,D,F}=V0,po={p2:!!o.p2,game:!!o.game,z:o.z!=null?o.z/sc:null},A=pPose(anim,p,po),fx=fxOn(o);
  // the game's values: hit (the strings shake, it sways back a little), where the head looks (toward the hero), the jaw that talks
  const jig=cl(o.jig||0,0,1),talk=cl(o.talk||0,0,1),veil=cl(o.veil||0,0,1),mini=!!o.mini,lookG=cl(o.look||0,-1.9,1.9),vk=1-.6*veil;
  const tune=B=>{B.lean-=.06*jig;B.hy+=lookG*B.look};tune(A);if(jig>0)A.vib=Math.max(A.vib,1.5*jig);
  if(talk>0){const nb=Math.max(1,Math.round(DUR[anim]*7));A.jaw=Math.max(A.jaw,talk*3.6*(.5-.5*Math.cos(p*TAU*nb)))}
  const K=pal(A.k2),X=bodyX(A),lift=A.lift,H0=headNow(A,X,face);
  // the points of the hood follow the head 0.24 s late: the mean of the head over a moment around then (a snap of the head does not snap
  // them, they swing after it); at the end of a move they catch up with it, so that the next move starts where this one ends
  const loop=anim==='idle'||anim==='walk',lag0=Math.min(.12,.24/DUR[anim]),lag=loop?lag0:lag0*(1-sstep(1-2*lag0,1,p)),H1={hy:0,hp:0,hr:0};
  for(const f of[.5,1,1.5]){const q=p-lag*f,pl=loop?(q%1+1)%1:Math.max(0,q),Al=pPose(anim,pl,po);tune(Al);const Hs=headNow(Al,bodyX(Al),face);
    H1.hy+=(Hs.hy+Al.yaw-A.yaw)/3;H1.hp+=(Hs.hp+(Al.lean-A.lean)*.6)/3;H1.hr+=(Hs.hr+(Al.roll-A.roll)*.6)/3}
  const bodyK=(A.body==null?1:A.body)*(A.fade==null?1:A.fade),sK=A.strK==null?1:A.strK;
  if(bodyK>.01)floor(V0,x,y,sc,[A.B[0],A.B[1],0],30,11,.34*bodyK,lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const L=parts(),LB=parts(),BCw=X.T(BC),dT=D(BCw),ex=X.Rd([1,0,0]),ey=X.Rd([0,1,0]),ez3=X.Rd([0,0,1]),fw=X.Rd([1,0,0]);
  // in front of the barrel or behind it, as the camera sees it: the barrel's normal toward the point, in the body's frame (0 on its outline);
  // the copy in front fades in over the one behind (never a jump); far from the barrel a plain switch (nothing to cover there)
  const kOf=q=>{const r=sub(q,BCw),bx=dot(r,ex),by=dot(r,ey),e=bx*bx/289+by*by/625;if(e<1e-4)return F(ex)>0?1:0;const f=F(nrm(add(mul(ex,bx/289),mul(ey,by/625))));
    return e>2.4?(f>0?1:0):sstep(-.04,.04,f)};
  const lay=(Ls,d,kf,f)=>{if(kf<.99)Ls.add(Math.min(d,dT-EPS),f);if(kf>.01)Ls.add(Math.max(d,dT+EPS),kf<.99?()=>ga(kf,f):f)};
  const zB=q=>dot(sub(q,BCw),ez3)+BC[2];   // a point's height in the body's frame
  // ---------------- the legs (behind the barrel; in the heap, the knees in front of it come forward)
  const gL=legGeo(X,A,1),gR=legGeo(X,A,-1);
  for(const g of[gR,gL]){const kz=sstep(38.8,42.8,zB(g.kn)),kf=kz>0?kz*kOf(g.kn):0;lay(LB,D(g.hip)-6,kf,()=>legDraw(V0,X,A,K,g))}
  // ---------------- the barrel doublet; the coat tails behind it (in front of it seen from the back)
  const br=1+A.breath,Rd=[BRD[0]*br,BRD[1]*br,BRD[2]*(1+A.breath*.5)];
  LB.add(dT,()=>torsoDraw(V0,X,A,K));
  {const tm=X.T([-14,0,36]);lay(LB,D(tm),kOf(tm),()=>tailsDraw(V0,X,A,K,Rd))}
  // ---------------- the arms: the sleeve with its puff by the side it hangs from; the forearm and the hand by where the hand is (in front of
  // the barrel or behind it; by the head when it is raised over the shoulders)
  const aL=armGeo(X,A,1),aR=armGeo(X,A,-1);
  for(const a of[aR,aL]){const fs=F(X.Rd([0,a.sd,0]));lay(LB,D(a.puff),sstep(-.3,-.2,fs),()=>upperArmDraw(V0,X,A,K,a));
    const dF=D(lerp3(a.Wr,a.c,.5)),hz=zB(a.Wr),draw=()=>lowerArmDraw(V0,X,A,K,a);
    if(hz>100)LB.add(Math.max(dF,dT+EPS),draw);else lay(LB,dF,kOf(a.c),draw)}
  // ---------------- the neck, the ruff (each puff at its own depth: the front ones cover the chin), the head, the points of the hood
  const dHd=Math.max(D(H0.Hc),dT+3*EPS),J={Hc:H0.Hc,HR:H0.HR,cv:camDir(V0),aL,aR,fw:ex};
  J.hpts=ellSil(V0,H0.Hc,[HOOD,HOOD,HOOD],AXES,null,26);J.hsil=smoothP(J.hpts);{const q=P(H0.Hc);J.hbb=[q[0]-HOOD,q[1]-HOOD*1.14,q[0]+HOOD,q[1]+HOOD*1.14]}
  {const a=X.T([1,0,89]),b=add(H0.Hc,H0.HR([-1,0,-13]));LB.add(Math.max(D(a),dT+EPS),()=>{const qa=P(a),qb=P(b);caps3(qa,4,qb,4,K.wood,2.2);shadeL(qa,qb,4,4)})}
  LB.add(dT+1.5*EPS,()=>ruffThread(V0,X,K));
  for(const c of ruffPts(X,A,(H0.hy-cheat(face,.3))*.22))LB.add(Math.max(D(c),dT+2*EPS),()=>ruffPuff(V0,c,K));
  LB.add(dHd,()=>headDraw(V0,J,A,K));
  const tL=tipPts(H0,H1,X,A,1),tR=tipPts(H0,H1,X,A,-1);
  // (over the hood a point is the same velvet coming out of it: there its root has only a thin seam, so a point that comes toward us does
  // not look like a hole in the hood)
  for(const[sd,pts] of[[1,tL],[-1,tR]]){const kf=sstep(-.12,.12,F(nrm(sub(pts[1],H0.Hc)))),nb=sd<0&&!!A.bell,dr=()=>tipDraw(V0,pts,A,K,sd,nb);
    LB.add(dHd-.02,dr);if(kf>.01)LB.add(dHd+.02,()=>{ctx.save();ctx.clip(J.hsil);ga(kf,()=>tipDraw(V0,pts,A,K,sd,nb,J.hbb));ctx.restore()})}
  // the violet smoke from the joints (second phase, strong moves)
  if(fx&&A.smoke>.02){const js=[gL.kn,gR.kn,aL.El,aR.El,aL.Wr,aR.Wr];LB.add(dHd+.5,()=>smokeDraw(V0,js,A.smoke,p))}
  // ---------------- the strings: from the cross to the head, the wrists and the knees. A piece low down goes in front of the barrel or behind it
  // (the near one in front, the far one behind), the piece above the shoulders by its own depth (beside the head, the points, the ruff)
  const CX=crossNow(A,mini,lift),eyes={h:add(H0.Hc,H0.HR([-1,0,19])),wL:aL.eye,wR:aR.eye,kL:gL.eye,kR:gR.eye,up:CX.ends.ring};J.eyes=eyes;J.dTop=dHd+5;
  const zs=H0.Hc[2]-14,nv=Math.max(1,Math.round(DUR[anim]*6.5)),pearlOn=fx&&!o.noFx;
  if(sK>.01)for(const k of['h','wL','wR','kL','kR']){const s=A.S[k];if(s.b>=1)continue;const a=eyes[k],b=CX.ends[k],mid=lerp3(a,b,.5);
    const out0=sub(mid,BCw);let out=nrm([out0[0],out0[1],0]);if(k==='h'||len([out0[0],out0[1],0])<2)out=ey;
    const pts=strLine(a,b,s.t,out),Q=strScr(P,pts,Math.max(A.vib,s.v||0),SPH[k]+p*TAU*nv),fE=s.b>=0?1-.85*ez(s.b):1,al=(s.b>=0?1-s.b:1)*sK;
    let fs;if(pts[0][2]<zs)fs=0;else if(pts[10][2]>=zs)fs=1;else{fs=1;for(let i=0;i<10;i++)if(pts[i][2]>=zs&&pts[i+1][2]<zs){fs=(i+(pts[i][2]-zs)/Math.max(1e-6,pts[i][2]-pts[i+1][2]))/10;break}}
    const f1=Math.min(fs,fE);
    if(f1>.005){const dm=D(sub3(pts,f1/2)),dd=k==='h'?Math.max(dm,dHd+.6):k[0]==='k'?Math.min(Math.max(dm,dT+EPS),dHd-.1):Math.max(dm,dT+EPS);L.add(dd,()=>{strStroke(sub2(Q,0,f1),s,K,al*vk);if(pearlOn&&s.u<=f1)pearl(Q,s.u,K,al*vk)})}
    if(fE>fs+.005){const m3=sub3(pts,(fs+fE)/2);lay(LB,D(m3)+2,kOf(m3),()=>{strStroke(sub2(Q,fs,fE),s,K,al);if(pearlOn&&s.u>fs)pearl(Q,s.u,K,al)})}}
  // ---------------- the cross, the two strings from its ring up into the dark, the Shadow (or its hint)
  const sh=A.sh&&!mini?A.sh:null,cK=(A.cvis==null?1:A.cvis)*sK*vk;let dX=dHd+10;
  if(A.cx[2]<-60&&F(fw)<-.15)dX=dT-2*EPS;
  // (the Shadow's hand holds the cross in the cross's frame; when it lets it go, in a frame of its own where it held it)
  const CXh=sh&&sh.anchor?crossNow({cx:sh.anchor,cp:0,cr:0,cyw:0,kb:0},mini,lift):CX,own=CXh!==CX&&sh&&sh.k>.01;
  if(cK>.01){L.add(dX,()=>{if(cK<.99)ctx.globalAlpha*=cK;crossDraw(V0,CX,K,A,sh&&sh.k>.01&&!own?sh:null);if(cK<.99)ctx.globalAlpha/=cK})}
  if(own)L.add(dHd+10.1,()=>ga(vk,()=>{const L2=parts();shHands(V0,L2,CXh,sh);run(L2)}));
  const shC=[CX.c[0],CX.c[1],206+cl(A.cx[2],-3,25)+Math.min(lift,3)+(A.sh&&A.sh.rise?30*A.sh.rise:0)],shQ=P(shC);
  if(!mini&&sK>.01){const s=A.S.up;if(s.b<1){const bb=s.b>=0?ez(s.b):0,al=(1-bb)*sK*vk,vib=Math.max(A.vib*.5,s.v||0);
    L.add(dX-1.5,()=>{for(const[i,e] of[[0,CX.ends.upL],[1,CX.ends.upR]]){const a=P(add(e,[0,0,bb*30])),b=P(add(e,[0,0,46])),w=vib*Math.sin(SPH.up+i+p*TAU*nv);
      const g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]),l=cl(s.l,0,1),c0=l>.02?cmix(K.strC,K.strHot,l):K.strC;g.addColorStop(0,C.rgba(c0,al));g.addColorStop(.3,C.rgba(c0,al*.85));g.addColorStop(1,C.rgba(c0,0));
      ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[0]+b[0])/2+w,(a[1]+b[1])/2,b[0],b[1]);
      if(l>.02&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(K.str,.3*l*al);ctx.lineWidth=5;ctx.stroke();ctx.restore()}
      ctx.strokeStyle=g;ctx.lineWidth=1.1+.5*l;ctx.stroke()}})}}
  if(sh&&sh.k>.01){const al=sh.k*vk,shk=sh.mistK==null?1:sh.mistK,lk=[0,0];
    {const d=X.Rd(rotZ([1,0,0],lookG)),q1=P(add(BCw,mul(d,10))),q0=P(BCw),l=Math.hypot(q1[0]-q0[0],q1[1]-q0[1])||1;lk[0]=2*(q1[0]-q0[0])/l;lk[1]=2*(q1[1]-q0[1])/l}
    L.add(dX-3,()=>shMist(shQ,al*shk,sh.breath||0));
    const palm=CXh.T([-1,0,13+(sh.gz||0)]);L.add(dX-1,()=>{shWrist(V0,palm,[shQ[0],shQ[1]+6],al*shk);shEyes(shQ,sh,al,lk)})}
  if(A.hint>.01&&!mini&&!sh)L.add(dX-1,()=>hintEyes(P([CX.c[0],CX.c[1],206+Math.min(lift,3)]),A.hint*vk));
  // ---------------- the pieces of the moves: the thread between the index fingers (Fili d'oro), the threads from the fingertips to the
  // trapdoors (Burattini), the lasso in the pages, the light where it falls (pages), the bell that comes off (Sconfitta)
  if(A.thr){const t=A.thr,a=aL.G.idx,b=aR.G.idx;L.add(Math.max(D(a),D(b),dT)+1,()=>{const qa=P(a),qb=P(b),dx=qb[0]-qa[0],dy=qb[1]-qa[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,
      w=o.noFx?0:t.tr*2.6*Math.sin(p*TAU*nv*1.1),m=[(qa[0]+qb[0])/2+nx*w,(qa[1]+qb[1])/2+ny*w];ctx.lineCap='round';ctx.beginPath();ctx.moveTo(qa[0],qa[1]);ctx.quadraticCurveTo(m[0],m[1],qb[0],qb[1]);
      ctx.strokeStyle='rgba(40,20,10,.5)';ctx.lineWidth=2+t.k;ctx.stroke();if(!o.noFx&&!LOWFX&&t.k>.2){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(K.str,.4*t.k*sstep(.2,.5,t.k));ctx.lineWidth=6;ctx.stroke();ctx.restore()}
      ctx.strokeStyle=o.noFx?K.strC:cmix(K.strC,K.strHot,t.k);ctx.lineWidth=o.noFx?1.1:.6+1*t.k;ctx.stroke()})}
  if(A.fthr&&(o.traps||!o.game)){const t=A.fthr,TP=o.traps?o.traps.map(r=>{const sx=(r.x-x)/sc,sy=(r.y-y)/sc/cam.k;return[sx*V0.c+sy*V0.s,-sx*V0.s+sy*V0.c,0]}):[[70,24,0],[70,-24,0]];
    for(const T0 of TP){const a=dot(sub(T0,aL.c),ey)>dot(sub(T0,aR.c),ey)?aL:aR,tips=a.G.tips.slice(0,3),dd=D(T0)>dT?dT+EPS*3:dT-EPS*3;
      L.add(Math.max(dd,D(lerp3(a.c,T0,.3))),()=>{for(const tp of tips){const e=lerp3(tp,T0,t.k*(1-t.out)),e2=add(lerp3(tp,e,1),[0,0,70*t.out]),qa=P(tp),qb=P(t.out>0?e2:e);
        ctx.strokeStyle=`rgba(40,20,10,${(.4*(1-t.out)).toFixed(3)})`;ctx.lineWidth=1.8;seg(qa,qb);ctx.stroke();ctx.strokeStyle=C.rgba(K.strC,.85*(1-t.out));ctx.lineWidth=.8;ctx.stroke()}})}}
  if(A.lasso&&!o.game){const t=A.lasso,a=aR.G.idx,e=t.tied?[110,0,14]:add(a,add(mul(fw,120*t.k),[0,0,-(a[2]-16)*t.k]));L.add(D(lerp3(a,e,.5))+20,()=>ga(t.al==null?1:t.al,()=>{const qa=P(a),qe=P(e);
    ctx.strokeStyle='rgba(40,20,10,.5)';ctx.lineWidth=2.6;seg(qa,qe);ctx.stroke();ctx.strokeStyle=K.strHot;ctx.lineWidth=1.4;ctx.stroke();ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(qe[0],qe[1],5,3,0,0,TAU);ctx.stroke()}))}
  if(A.ring&&!o.game){const k=A.ring.k;L.add(-9500,()=>{const q=P(0,0,0),r=46;if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';shine('255,244,214',q[0],q[1],r*1.1,.35*k,r*.6*C.KR());ctx.restore()}
    ctx.strokeStyle=`rgba(255,244,214,${(.3+.5*k).toFixed(3)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.55*C.KR(),0,0,TAU);ctx.stroke()})}
  if(A.bell){const b=A.bell,b0=bellAt(A,tR,-1),fl=[30,-10,3.2],k=b.k,pos=add(lerp3(b0,fl,ez(k)),[0,0,Math.sin(Math.PI*k)*12*(1-k)]),sw=k>=1?0:1;
    J.bellQ=pos;L.add(1e6+1,()=>ga(b.out,()=>{const q=P(pos);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(k<1?k*TAU*2:.35*Math.sin((p-.86)*90)*Math.exp(-(p-.86)*25));ctx.translate(-q[0],-q[1]);bellDraw(V0,pos,K,0);ctx.restore()}))}
  // ---------------- the curtain, in front of everything
  if(A.cur&&A.cur.k>.002)L.add(1e6,()=>curtainDraw(V0,A.cur,K,fx));
  if(fx)for(const e of A.fx)fxDraw(V0,L,e,A,K,J);
  // ---------------- the body: as one picture while it fades (the Sipario, the end of the defeat), or pulled up into the dark (only what
  // is under the curtain's whole velvet shows, never through the top that melts into the dark); otherwise piece by piece among the rest
  if(bodyK<=.01){}
  else if(A.vmask&&A.cur){const yT=V0.P(0,0,0)[1]+8-CURH,LBs=LB.slice().sort((a,b)=>a.d-b.d);L.add(dT,()=>{ctx.save();ctx.beginPath();ctx.rect(-200,yT+25,400,400);ctx.clip();
      ga(bodyK,()=>{for(const e of LBs){ink(2.4);e.f()}});ctx.restore()})}
  else if(bodyK<.99){const LBs=LB.slice().sort((a,b)=>a.d-b.d);L.add(dT,()=>ga(bodyK,()=>{for(const e of LBs){ink(2.4);e.f()}}))}
  else for(const e of LB)L.push(e);
  run(L);ctx.restore();
  // ---------------- the points for the game (on the screen, in the world's coordinates)
  if(o.dbg){const Q=q=>{const s=P(q);return[x+s[0]*sc,y+s[1]*sc]};Object.assign(o.dbg,{head:Q(H0.Hc),body:Q(BCw),wL:Q(aL.Wr),wR:Q(aR.Wr),hL:Q(aL.c),hR:Q(aR.c),kL:Q(gL.kn),kR:Q(gR.kn),aL:Q(gL.an),aR:Q(gR.an),
    cross:Q(CX.c),tipL:Q(tL[4]),tipR:Q(tR[4]),idxR:Q(aR.G.idx),shadow:sh&&sh.k>.01?shQ.map((v,i)=>i?y+v*sc:x+v*sc):null})}
  if(o.out){const W=q=>{const s=P(q),r=[x+s[0]*sc,y+s[1]*sc];r.x=r[0];r.y=r[1];return r};
    o.out.tipR=W(aR.G.idx);o.out.tipL=W(aL.G.idx);o.out.wristR=W(aR.Wr);o.out.wristL=W(aL.Wr);o.out.cross=W(CX.ends.ring);o.out.head=W(add(H0.Hc,mul(H0.HR(FACEN),HOOD)))}}

// ------------------------------------------------------------------ for the game: the pieces of its attacks, with the same look
// the giant hand of the Shadow that falls from the dark (Mano dell'Ombra): x, y the point on the floor under the palm, z the palm's height;
// k: 0 falling, palm down and the fingers half closed; .3 the blow, the fingers spread wide, the palm flat and a little squashed; .6 it
// presses; 1 it rises closing the fingers. o.a: its turn on the floor, as the game turns the hand's shadow (0: the fingers point up the screen,
// away from us, the thumb on the left: the Shadow's right hand palm down, seen from above); o.noFx. The palm 44 × 38, four long round
// fingers of 28 that fan out, the thumb; dark violet with the magenta edge, a column of smoke rising from the wrist into the dark (behind it,
// fading). Its shadow on the floor is the game's
const HKY=[[0,[.5,.65,1]],[.3,[0,1.2,.74]],[.6,[.12,1.1,.86]],[1,[.85,.7,1]]];
N3.puppeteer2Hand=function(x,y,z,k,sc,o){o=o||{};sc=sc||1;k=cl(k||0,0,1);const v=keys(HKY,k),curl=v[0],spr=v[1],sq=v[2],a=Math.PI+(o.a==null?0:o.a),V0=V(Math.PI/2),{P,D}=V0,H=SHD.hand,fx=fxOn(o);
  const ca=Math.cos(a),sa=Math.sin(a),T=q=>[q[0]*ca-q[1]*sa,q[0]*sa+q[1]*ca,z/sc+q[2]*sq];
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts();
  // the wrist and the column of smoke rising from it into the dark (behind the hand, thinner and fainter as it rises)
  {const w0=T([-22,0,6]),w1=add(w0,[0,0,150]);L.add(-1e4,()=>{const a0=P(w0),a1=P(w1),g=ctx.createLinearGradient(a0[0],a0[1],a1[0],a1[1]);g.addColorStop(0,'rgba(42,20,68,.9)');g.addColorStop(.45,'rgba(28,12,46,.5)');g.addColorStop(1,'rgba(20,10,34,0)');
    ctx.beginPath();ctx.moveTo(a0[0]-16,a0[1]);ctx.quadraticCurveTo(a0[0]-13,(a0[1]+a1[1])/2,a1[0]-6,a1[1]);ctx.lineTo(a1[0]+6,a1[1]);ctx.quadraticCurveTo(a0[0]+13,(a0[1]+a1[1])/2,a0[0]+16,a0[1]);ctx.closePath();ctx.fillStyle=g;ctx.fill();
    if(fx){ctx.strokeStyle=g;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a0[0]-14,a0[1]);ctx.quadraticCurveTo(a0[0]-11,(a0[1]+a1[1])/2,a1[0]-5,a1[1]);ctx.strokeStyle=rgba(SHD.hr,.3);ctx.stroke()}})}
  // the palm: a flat dark cushion (we see the back of the hand), the knuckles' ridge
  {const S=[];for(let i=0;i<20;i++){const t=i/20*TAU;S.push(T([Math.cos(t)*22,Math.sin(t)*19,Math.cos(t)>0?2:4]))}for(let i=0;i<10;i++){const t=i/10*TAU;S.push(T([Math.cos(t)*16-2,Math.sin(t)*13,7]))}
    L.add(D(T([0,0,4])),()=>{const h=chull(S.map(q=>P(q)));const pa=smoothP(h);ctx.fillStyle=grad3(bbox(h),H);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke(pa);rimM(h,.6);
      ctx.strokeStyle='rgba(10,4,18,.45)';ctx.lineWidth=1.2;ctx.lineCap='round';const c1=P(T([8,-12,6])),c2=P(T([10,0,6.5])),c3=P(T([8,12,6]));ctx.beginPath();ctx.moveTo(c1[0],c1[1]);ctx.quadraticCurveTo(c2[0],c2[1]-2,c3[0],c3[1]);ctx.stroke()})}
  // four long round fingers that fan out and the thumb, each in two bones that curl toward the palm; each by its own depth (the palm
  // covers their roots)
  const fing=(pts,rs)=>{L.add(D(pts[1]),()=>{const P2=pts.map(q=>P(q)),bb=bbox(P2);bb[0]-=6;bb[1]-=6;bb[2]+=6;bb[3]+=6;chain(V0,pts,rs,H.b,{lw:2.4,fill:grad3(bb,H),noRim:1});
    ctx.strokeStyle=rgba(SHD.hr,.5);ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();for(const q of P2)ctx.lineTo(q[0]-1.2,q[1]-2.6);ctx.stroke()})};
  for(let i=0;i<4;i++){const yy=(i-1.5)*9.6*spr,d=nrm([1,yy*.022*spr,0]),c1=Math.cos(curl*.9),s1=Math.sin(curl*.9),c2=Math.cos(curl*1.9),s2=Math.sin(curl*1.9);
    fing([T([18,yy*.82,3]),T([18+14*c1*d[0],yy*.82+14*d[1],3-14*s1]),T([18+14*c1+13*c2,yy*.82+27*d[1],3-14*s1-13*s2])],[6.2,5.6,4.6])}
  fing([T([-4,-22*spr,3]),T([6,-30*spr,1-6*curl]),T([14,-33*spr,-1-8*curl])],[6,5.4,4.4]);
  run(L);
  // smoke curling off the edge while it presses and rises
  if(fx&&k>.25){const u=sstep(.25,1,k);for(let i=0;i<6;i++){const t=i/6*TAU+u*2,q=P(T([Math.cos(t)*26,Math.sin(t)*22,4+u*20]));ctx.fillStyle=`rgba(90,46,140,${(.28*(1-u)).toFixed(3)})`;ball(q,4+u*6);ctx.fill()}}
  ctx.restore()};
// the trapdoor, 26 × 26: two wooden leaves hinged on its sides, golden hinges, golden light in the cracks. k 0 shut (o.glow 0..1 makes the
// light grow); .0-.3 the leaves open downward; .3-.7 open (a dark hole with the golden light inside); .7-1 they close again. o.p2: magenta
// light. Shut and without light it can be baked into the floor (the game draws it once with k 0)
N3.puppeteer2Trap=function(x,y,k,sc,o){o=o||{};sc=sc||1;k=cl(k||0,0,1);const V0=V(Math.PI/2),{P}=V0,gl=cl(o.glow||0,0,1),lc=o.p2?'255,120,210':'255,210,110',W=13;
  const op=k<.3?ez(k/.3):k<.7?1:1-ez((k-.7)/.3),th=op*Math.PI*.47,open=op>.01;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.lineJoin='round';
  const C4=[[-W,-W,0],[W,-W,0],[W,W,0],[-W,W,0]].map(q=>P(q)),I4=[[-W+2,-W+2,0],[W-2,-W+2,0],[W-2,W-2,0],[-W+2,W-2,0]].map(q=>P(q));
  // the frame: a dark border of old wood
  poly(C4);ctx.fillStyle='#2d190c';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
  // open: the hole (its far wall lit by the light below), the leaves hanging into it (only what shows through the opening)
  if(open){poly(I4);ctx.fillStyle='#0a0408';ctx.fill();ctx.save();ctx.clip();
    const c=P(0,0,-6),g=ctx.createRadialGradient(c[0],c[1],1,c[0],c[1],18);g.addColorStop(0,`rgba(${lc},${(.85*op).toFixed(3)})`);g.addColorStop(.45,`rgba(${lc},${(.35*op).toFixed(3)})`);g.addColorStop(1,'rgba(10,4,14,0)');ctx.fillStyle=g;ctx.fillRect(c[0]-20,c[1]-20,40,40);
    // the near wall of the hole in shadow (under the near edge of the frame)
    {const a0=P(-W+2,W-2,0),a1=P(W-2,W-2,0),b0=P(-W+2,W-2,-10),gr=ctx.createLinearGradient(0,a0[1]-12,0,a0[1]);gr.addColorStop(0,'rgba(8,3,10,0)');gr.addColorStop(1,'rgba(8,3,10,.85)');ctx.fillStyle=gr;ctx.fillRect(a0[0],a0[1]-12,a1[0]-a0[0],12+Math.max(0,b0[1]-a0[1]))}
    leaves();ctx.restore();if(!LOWFX&&!o.noFx){ctx.save();ctx.globalCompositeOperation='lighter';shine(lc,c[0],c[1]-4,16,.45*op,10);ctx.restore()}}
  else leaves();
  // the golden hinges on the two sides
  for(const sd of[-1,1])for(const u of[.22,.78]){const q=P(lerp(-W+2,W-2,u),sd*(W-2),0);ctx.fillStyle='#ffcd45';ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.rect(q[0]-1.6,q[1]-1.2,3.2,2.4);ctx.fill();ctx.stroke()}
  // the light in the cracks (between the leaves and round them)
  if(!open&&gl>.01){const a=P(-W+2,0,0),b=P(W-2,0,0);ctx.strokeStyle=`rgba(${lc},${(.9*gl).toFixed(3)})`;ctx.lineWidth=1.2;seg(a,b);ctx.stroke();poly(I4);ctx.strokeStyle=`rgba(${lc},${(.45*gl).toFixed(3)})`;ctx.lineWidth=.9;ctx.stroke();
    if(!LOWFX&&!o.noFx){ctx.save();ctx.globalCompositeOperation='lighter';shine(lc,(a[0]+b[0])/2,a[1],14,.4*gl,7);ctx.restore()}}
  ctx.restore();
  // the two leaves, hinged on the left and the right side (model y), falling into the hole as it opens
  function leaves(){for(const sd of[-1,1]){const hx=sd*(W-2),L4=[[-W+2,hx,0],[W-2,hx,0],[W-2,hx-sd*(W-2)*Math.cos(th),-(W-2)*Math.sin(th)],[-W+2,hx-sd*(W-2)*Math.cos(th),-(W-2)*Math.sin(th)]].map(q=>P(q));
    poly(L4);const g=ctx.createLinearGradient(L4[0][0],L4[0][1],L4[2][0],L4[2][1]);g.addColorStop(0,cmix('#5f3b22','#000000',.35*op));g.addColorStop(1,cmix('#5f3b22','#2d190c',.4+.4*op));ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
    // the planks' seams
    ctx.strokeStyle='rgba(20,10,4,.45)';ctx.lineWidth=.8;ctx.beginPath();for(const u of[.33,.66]){ctx.moveTo(lerp(L4[0][0],L4[1][0],u),lerp(L4[0][1],L4[1][1],u));ctx.lineTo(lerp(L4[3][0],L4[2][0],u),lerp(L4[3][1],L4[2][1],u))}ctx.stroke()}}};
// the moments of the model (the brain reads them): the blows and the warnings, as fractions of each move
N3.puppeteer2Info=Object.assign({},INFO,{dur:Object.assign({},DUR),moves:MV.slice(),
  hits:{slam:[.52],slam3:[.4,.64,.9],strings:[.4],puppets:[.62],lasso:[.68],yank:[.94],drop:[.28],hand:[.78]},
  warn:{slam:.04,slam3:.04,strings:.04,puppets:.08,lasso:.06,yank:.72,vanish:0,hand:.08},
  slack:{slam:[.52,.74],slam3:[.9,.95],snap:[0,.6],drop:[.28,.55],rage:[0,.58]},
  trapOpen:.62,trapClose:.8,yankPulls:[.12,.39,.66],handFree:[.08,.2],handBack:.86,threadGone:.4,lassoBack:[.8,.95],
  vanishCurtain:[.06,.32],vanishUp:[.55,.85],dropStand:.9,dropStrings:[.6,.7,.76,.84],
  rage:{fall:[0,.18],eyes:[.2,.4],grab:.5,clacks:[.62,.68,.74],laugh:.8},enter:{curtainUp:[0,.3],strings:[.31,.38,.44,.51,.56],stand:.6,cry:.76,bow:[.8,1]},
  die:{pings:[.12,.2,.28,.36,.46],clou:.46,heap:[.48,.68],upSnap:.5,cross:.7,lids:.84,bell:.86,curtain:[.86,.93],melt:.95},
  taunt:{turn:[0,.55],claps:[.82,.88]},call:{beckon:[[.2,.45],[.55,.8]]},
  size:{h:130,cross:158,r:26,hand:100,trap:26}});

// ------------------------------------------------------------------ IL BURATTINO NUOVO ('puppet2', in the game in place of 'puppet'): a little
// marionette like its master, 28 tall: a head of violet lacquered wood with the ivory face, the dark mask and two little glowing eyes, a
// little hood with two points and tiny bells, a ruff of six puffs, a sack of violet velvet with a golden diamond in front, stick arms and
// legs of honey wood with round joints, little ivory hands and pointed shoes, three golden strings (the head and the hands) going up 50 and
// fading. idle, walk (hops as if pulled by the strings), attack (the arms go up on the strings, a little violet sphere between the hands,
// thrown at .50), hit, spawn (out of the trapdoor on its string, from 22 under the floor to 6 over it, then down). o.p2: magenta eyes and
// strings; o.noFx
const PK={head:T3('#8e6ad0','#6a46a8','#22103e'),body:T3('#a47ae8','#6e42b8','#351a6e'),cri:T3('#c8384f','#8f1d35','#4a0b1d'),wood:T3('#f3c98a','#c4864a','#6f4224'),
  ivory:T3('#fffaf0','#f1e4c8','#b9a383'),mask:'#24102a',gold:T3('#fff1a8','#ffcd45','#b17b12'),ruff:T3('#ffffff','#f3eeff','#c5b8e4'),shoe:T3('#6c4c8c','#3f2659','#1d102b'),
  eye:'#ffd84a',eyeG:'255,216,74',str:'255,233,160'},PK2=Object.assign({},PK,{eye:'#ff5fc8',eyeG:'255,95,200',str:'255,154,224',body:T3('#8a5ccc','#55309a','#261050')});
function puPose2(anim,p){const ph=p*TAU,A={z:0,lean:0,roll:0,hy:0,hr:0,sw:0,arm:[[2,4.6,6.4],[2,-4.6,6.4]],leg:[[0,2.4,.9],[0,-2.4,.9]],toe:[0,0],eg:1,shut:0,orb:-1,clip:false,str:1};
  if(anim==='walk'){// one hop per cycle, pulled up by the strings: up 6, the legs kick and dangle, soft landing
    const h=Math.sin(Math.PI*p);A.z=6*h*h*(3-2*h);A.lean=.12;A.roll=.06*Math.sin(ph);const kk=Math.sin(ph*2);A.leg=[[-1.5+3*kk,2.4,.9+2.2*h],[-1.5-3*kk,-2.4,.9+2.2*h]];A.toe=[.5*h,.5*h];
    A.arm=[[3+1.5*Math.sin(ph),5.4,8.5+3*h],[3-1.5*Math.sin(ph),-5.4,8.5+3*h]];A.sw=.25*Math.sin(ph)}
  else if(anim==='attack'){// .00-.45 the arms go up on the strings, the eyes light up, a little violet sphere grows between the hands; .50 thrown
    const up=sstep(0,.45,p)*(1-sstep(.62,1,p)),th=sstep(.46,.52,p)*(1-sstep(.6,.8,p));A.arm=[lerp3([2,4.6,6.4],lerp3([3,3,22],[7,2.4,16],th),up),lerp3([2,-4.6,6.4],lerp3([3,-3,22],[7,-2.4,16],th),up)];
    A.eg=1+.8*up;A.orb=p<.5?sstep(.08,.45,p):-1;A.lean=-.12*up+.3*th;A.z=1.5*up}
  else if(anim==='hit'){const kb=hitK(p);A.lean=-.42*kb;A.hy=1.4*Math.sin(Math.PI*cl(p/.7,0,1));A.shut=p<.5?1:0;A.z=2*kb;A.arm=[[0,6,10+4*kb],[0,-6,10+4*kb]]}
  else if(anim==='spawn'){// out of the trapdoor on its string: from 22 under the floor up to 6, then down to the floor; the legs kick, the strings taut
    A.z=p<.55?lerp(-22,6,ez(p/.55)):lerp(6,0,ez((p-.55)/.45));A.clip=true;const kk=Math.sin(ph*3);A.leg=[[1+2.5*kk,2.6,1.2+2.5*(1-p)],[1-2.5*kk,-2.6,1.2+2.5*(1-p)]];A.arm=[[1,5,16],[1,-5,16]];
    A.roll=.12*Math.sin(ph*2)*(1-p);if(p>.85){const s=Math.sin((p-.85)/.15*Math.PI);A.z-=.8*s}}
  else{// idle: it swings on its strings, the feet barely touch, the head tilts, the arms hang
    A.sw=1.5*Math.sin(ph);A.z=.5+.5*Math.sin(ph*2);A.hr=.18*Math.sin(ph+.6);A.hy=.25*Math.sin(ph-1);A.arm=[[2+.8*Math.sin(ph+.4),4.6,6.4],[2-.8*Math.sin(ph+.4),-4.6,6.4]]}
  return A}
function puppet2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=['idle','walk','attack','hit','spawn'].includes(anim)?anim:'idle';p=cl(+p||0,0,.9999);
  const K=o.p2?PK2:PK,V0=V(face),{P,D,F}=V0,A=puPose2(anim,p),fx=fxOn(o),X=frame({B:[0,A.sw*.0,A.z],lean:A.lean,roll:A.roll},0);
  const sw=A.sw,Tq=q=>add(X.T(q),[0,sw,0]);
  if(A.z>-8)floor(V0,x,y,sc,[0,0,0],8.5,7,.3*(A.z<0?sstep(-8,0,A.z):1),Math.max(0,A.z));
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  if(A.clip){const q=P(0,0,0);ctx.beginPath();ctx.rect(q[0]-60,q[1]-200,120,200+6);ctx.clip()}
  const L=parts(),Hc=Tq([0,0,19.5]),HR=v=>X.Rd(rotZ(rotX(v,A.hr),A.hy+cheat(face,.25))),hips=[Tq([0,2,6.5]),Tq([0,-2,6.5])],sh=[Tq([0,4,13]),Tq([0,-4,13])];
  // the strings from the head and the hands up into the dark
  const hands=[0,1].map(i=>{const a=A.arm[i];return add(add(a,[0,sw,0]),[0,0,A.z])});
  L.add(-40,()=>{for(const q3 of[add(Hc,HR([0,0,6.5])),hands[0],hands[1]]){const a=P(q3),b=P(add(q3,[0,0,50])),g=ctx.createLinearGradient(a[0],a[1],b[0],b[1]);g.addColorStop(0,`rgba(${K.str},.9)`);g.addColorStop(1,`rgba(${K.str},0)`);
    ctx.strokeStyle='rgba(40,20,10,.35)';ctx.lineWidth=1.7;seg(a,[b[0],(a[1]+b[1])/2]);ctx.stroke();ctx.strokeStyle=g;ctx.lineWidth=.8;seg(a,b);ctx.stroke()}});
  // the legs: two sticks with a round knee, the little pointed shoes
  for(let i=0;i<2;i++){const sd=i?-1:1,hp=hips[i],f=add(add(A.leg[i],[0,0,A.z]),[0,sw*.6,0]),[kn,an]=ik(hp,f,3.6,3.6,X.Rd([1,0,.2]));
    L.add(D(hp)-3,()=>{const a=P(hp),b=P(kn),c=P(an);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3.2+1.4;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.stroke();
      ctx.strokeStyle=K.wood.b;ctx.lineWidth=3.2;ctx.stroke();ball3(b,2,K.wood,1.3,.2);
      const t=A.toe[i],fd=X.Rd([Math.cos(t),0,-Math.sin(t)]),s0=P(add(an,mul(fd,-1))),s1=P(add(add(an,mul(fd,4.2)),[0,0,.6]));ctx.strokeStyle=INK;ctx.lineWidth=4.6;seg(s0,s1);ctx.stroke();ctx.strokeStyle=K.shoe.b;ctx.lineWidth=3;ctx.stroke()})}
  // the sack of velvet with its golden diamond
  const bc=Tq([0,0,10]);L.add(D(bc),()=>{const sil=ellSil(V0,bc,[3.6,4.2,4.4],{u:X.Rd([1,0,0]),v:X.Rd([0,1,0]),w:X.Rd([0,0,1])},null,14),pa=smoothP(sil);ctx.fillStyle=grad3(bbox(sil),K.body);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke(pa);rimP(sil,.25);
    const n=X.Rd([1,0,0]),f=F(n);if(f>.1){const c=P(add(bc,mul(n,3.5))),kx=Math.pow(f,.7);ctx.beginPath();ctx.moveTo(c[0],c[1]-2.6);ctx.lineTo(c[0]+1.8*kx,c[1]);ctx.lineTo(c[0],c[1]+2.6);ctx.lineTo(c[0]-1.8*kx,c[1]);ctx.closePath();ctx.fillStyle=K.gold.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke()}});
  // the arms: little sticks from the shoulders, round elbows, ivory hands
  for(let i=0;i<2;i++){const s=sh[i],h=hands[i],[el,wr]=ik(s,h,4.6,4.6,X.Rd([-.4,i?-1:1,-.4])),fs=F(X.Rd([0,i?-1:1,0]));
    L.add(fs>-.2?D(bc)+1+D(s)*.001:D(bc)-1,()=>{const a=P(s),b=P(el),c=P(wr);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.stroke();
      ctx.strokeStyle=K.wood.b;ctx.lineWidth=3.2;ctx.stroke();ball3(b,2,K.wood,1.3,.2);ball3(c,2.4,K.ivory,1.4,.25)})}
  // the ruff: six white puffs
  for(let i=0;i<6;i++){const t=i/6*TAU,c=Tq([Math.cos(t)*4.4,Math.sin(t)*4.4,13.6]);L.add(D(c)+.5,()=>ball3(P(c),2.1,K.ruff,1.2,.2))}
  // the head: violet lacquered wood, the ivory face, the dark mask, two little eyes; the hood with two points and bells
  L.add(D(Hc)+1,()=>{const q=P(Hc),r=6.5;ball3(q,r,K.head,2,.3);glowTop(q,r,.14);
    const fn=HR([1,0,0]),fv=F(fn);if(fv>-.2){ctx.save();ball(q,r-.6);ctx.clip();const c=[q[0]+(P(add(Hc,fn))[0]-q[0])*r*.62,q[1]+(P(add(Hc,fn))[1]-q[1])*r*.62+.6],kx=Math.max(.2,Math.pow(Math.max(0,fv),.6));
      ctx.fillStyle=K.ivory.b;ctx.beginPath();ctx.ellipse(c[0],c[1],4.3*kx,4.6,0,0,TAU);ctx.fill();ctx.fillStyle=K.mask;ctx.beginPath();ctx.ellipse(c[0],c[1]-.8,4.6*kx,1.7,0,0,TAU);ctx.fill();
      for(const sd of[-1,1]){const e=[c[0]+sd*1.8*kx,c[1]-.8];if(A.shut){ctx.strokeStyle=K.eye;ctx.lineWidth=.9;seg([e[0]-1,e[1]],[e[0]+1,e[1]]);ctx.stroke()}
        else{if(fx)glowL(K.eyeG,e,3.5*A.eg,.45);ctx.fillStyle=K.eye;ball(e,1.05*kx+.2);ctx.fill();ctx.fillStyle='#fff';ball([e[0]-.35,e[1]-.35],.35);ctx.fill()}}
      ctx.strokeStyle='#6a1d44';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(c[0]-1.6*kx,c[1]+2);ctx.quadraticCurveTo(c[0],c[1]+3,c[0]+1.6*kx,c[1]+2);ctx.stroke();ctx.restore()}
    for(const sd of[1,-1]){const pts=[[-1,sd*2.5,5],[-2,sd*6,6.5],[-2,sd*8.5,3.5]].map(v=>add(Hc,HR(v))),T=sd>0?K.head:K.cri,P2=pts.map(v=>P(v)),bb=bbox(P2);bb[0]-=3;bb[1]-=3;bb[2]+=3;bb[3]+=3;
      chain(V0,pts,[2.4,1.8,1.2],T.b,{lw:1.6,fill:grad3(bb,T),rim:.2});const b=P(add(pts[2],[0,0,-1.6]));ball3(b,1.3,K.gold,1,.2)}});
  // the little violet sphere between the hands (attack)
  if(A.orb>0){const c=lerp3(hands[0],hands[1],.5),q3=add(c,[0,0,2.5]);L.add(D(q3)+5,()=>C.orb(P(q3),1+2.6*A.orb,o.p2?'#c060e0':'#8a4ad8',{glow:o.p2?'255,95,200':'170,110,255',ga:.5*A.orb}))}
  run(L);ctx.restore()}
reg('puppet2',{n:"Burattino d'ombra",g:'boss3',sc:1,an:['idle','walk','attack','hit','spawn'],dur:{idle:1.8,walk:.5,attack:1,hit:.6,spawn:.8},
  lab:{idle:'Fermo',walk:'Saltella',attack:'Attacca',hit:'Colpito',spawn:'Esce dalla botola'}},puppet2);

reg('puppeteer2',{n:"Il Burattinaio d'Ombra",g:'boss',sc:1,p2:true,an:MV.slice(),dur:Object.assign({},DUR),lab:Object.assign({},LAB)},puppeteer2);
{const OLD=N3.puppeteer,M0=N3.meta.puppeteer;if(OLD&&M0)N3.meta.puppeteer2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
{const OLD=N3.puppet,M0=N3.meta.puppet;if(OLD&&M0)N3.meta.puppet2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
