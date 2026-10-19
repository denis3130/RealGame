// LA PIOVRA DELLA PALUDE rifatta: «la Signora dello Stagno» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio
// sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo
// il Golem: «sì, fai gli altri 12»). Design: docs/boss-classici-design/octopus.md. Titolo che resta: «Signora dello stagno maledetto».
// Una piovra antica e gigantesca color petrolio, seduta dritta nella sua pozza come su un trono (116 in cima alle volute, tre volte
// l'eroe): la testa larga con due grandi occhi d'ambra dalla pupilla a barra, sotto palpebre pesanti e arcate a V con la loro puntina; il
// mantello alto a goccia piegato indietro, con gli anelli; sopra, la corona dello stagno: un cerchio di giunco intrecciato con le chiocciole
// di palude, una cozza di fiume aperta a ventaglio che tiene la Perla dello Stagno e il fiore rosa di ninfea appuntato come una spilla, due
// ciuffi d'alga che pendono. Otto braccia: due posate davanti come mani impazienti, due stese di lato, due alzate a S come cobra, due che
// salgono dietro di lei e si arricciano in fuori come lo schienale di un trono (il ventre corallo con le ventose guarda avanti). Il suo
// segnale: la Perla lampeggia e la luce corre nelle ventose del braccio che sta per colpire (come la luce del cuore del Golem nelle vene).
// A metà vita si alza in piedi sulle braccia, accende anelli magenta su tutta la pelle, la corona si accende da dentro e la pozza diventa
// inchiostro. Resta della Classica: forme tonde e piene, colori ricchi, occhi con la lucina, il becco con le sue due punte come uniche
// zannette, niente sangue né ferite.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face); ogni braccio è una catena di punti che parte dalla gonna, con la forma
// data da quattro direzioni e un ricciolo intorno a un asse (si arrotola e si srotola senza cambiare lunghezza), il ventre corallo che corre
// lungo il braccio; l'ordine di disegno viene dalla posa di riposo (le braccia alzate dalla loro punta); la parte di sopra (testa, mantello,
// corona) ha la sua rotazione, la corona e le alghe la loro cornice. Dipinta come la lanterna: tre toni, bordo caldo, riflesso bagnato in
// cima, bagliori morbidi. Unità del modello a sc 1: x avanti, y verso la sua sinistra, z in su; l'origine è a terra al centro della pozza.
// Mosse: idle, walk (Scivola), hit, slam (Tentacolata), stuck (Ventose attaccate), slam2 (Doppia tentacolata, fase 2), ink (Pioggia
// d'inchiostro), cage (Gabbia degli abissi), whirl (Gorgo), sink (Si immerge), swim (Sott'acqua), rise (Agguato), tide (Marea Nera,
// fase 2), rage (Furia), taunt (Presa in giro), enter (Entrata), die (Sconfitta).
// Opzioni: o.p2 (seconda fase), o.side (+1 la mano alla sua sinistra, y > 0; -1 l'altra), o.ang (direzione del colpo rispetto a dove
// guarda, positiva verso la sua sinistra; 0 se manca), o.len / o.len2 (lunghezza dei colpi, 165 se manca, mai sotto 60), o.a2 (direzione
// del secondo colpo della Doppia tentacolata), o.n (colpi della Pioggia d'inchiostro, 3 o 5), o.call (la presa in giro che chiama),
// o.noWater (niente pozza: i menu e le anteprime), o.noFx (niente schizzi, gocce, bolle e sbuffi delle mosse: li disegna il gioco), o.z
// (altezza dal pavimento). 'enter' ha sempre i colori della fase 1; 'rage' va sempre dalla fase 1 alla fase 2.
// Con LOWFX niente bagliori: Perla, ventose, anelli, conchiglie e occhi solo coi colori pieni (le ventose dell'avviso cambiano colore lo
// stesso), niente gocce, bolle né correnti di schiuma, le alghe stanno ferme.
// Disegni per il gioco con lo stesso aspetto: N3.octopus2Arm (il braccio che sbuca dal pavimento nella Gabbia), N3.octopus2Pad (la ninfea
// della Marea Nera), N3.octopus2Blob (la palla d'inchiostro in volo) e N3.octopus2Info (i momenti delle mosse). Nel gioco prende il nome
// 'octopus' (src/js/89-piovra-nuova.js); il disegno di oggi resta in N3.meta.octopus2.old per la pagina «prima e dopo».
(()=>{const C=C3,K3=C3K,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,cmix,poly,bbox,
  rotX,rotY,rotZ,keys,sstep,hitK,frame,ellAt,ellN,AXES,parts,reg,shine,chull,wa,leaf,softBall,KR}=C;
const{trem,fxOn,pls,rise,flash,ga,grad3,ellSil,hullE,smoothP,svol3,T3,mixT,mixRgb,rotAx,fadeDraw}=K3;
const PI=Math.PI;

// ------------------------------------------------------------------ helpers
const dirv=(a,e)=>[Math.cos(e)*Math.cos(a),Math.cos(e)*Math.sin(a),Math.sin(e)];
const nrmS=v=>{const l=len(v);return l>1e-6?[v[0]/l,v[1]/l,v[2]/l]:[0,0,1]};
const mir=v=>[v[0],-v[1],v[2]],mirA=v=>[-v[0],v[1],-v[2]];   // a point or a direction to the other side; an axis of rotation
const fr=x=>x-Math.floor(x);
const kv=(K,p)=>keys(K,p);
// a beat that rises in 1/3 of w and falls in the rest (a soft flash: never a jump)
const blip=(p,c,w)=>p<c-w/3||p>c+w*2/3?0:p<c?sstep(c-w/3,c,p):1-sstep(c,c+w*2/3,p);
// many little round marks as one path
const dots=(pts,rr)=>{ctx.beginPath();for(const q of pts){const r=rr==null?q[2]:rr;ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU)}};
const lineP=pts=>{ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1])};
// a capsule round two screen circles, added to a Path2D (the same turn every time: the union of many fills as one)
function capP(pa,a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);
  if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b,r=Math.max(ra,rb);pa.moveTo(q[0]+r,q[1]);pa.arc(q[0],q[1],r,0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));pa.moveTo(a[0]+ra*Math.cos(an+f),a[1]+ra*Math.sin(an+f));pa.arc(a[0],a[1],ra,an+f,an+TAU-f);pa.arc(b[0],b[1],rb,an-f,an+f);pa.closePath()}
// a flat ellipse on the floor or on the water (centre c, radii rx along the body's x, ry along y, both turned by the angle t): the path
// in ctx, exact (a parallel projection of an ellipse is an ellipse)
function flatEll(V0,c,rx,ry,t){const o=V0.P(c),ct=Math.cos(t||0),st=Math.sin(t||0),a=V0.P(add(c,[ct*rx,st*rx,0])),b=V0.P(add(c,[-st*ry,ct*ry,0]));
  ctx.save();ctx.transform(a[0]-o[0],a[1]-o[1],b[0]-o[0],b[1]-o[1],o[0],o[1]);ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.restore()}
// soft lights in one pass ('lighter'): every glow of the drawing is kept and drawn at the end of its layer
let GL=null;
const glo=(rgb,x,y,r,a,ry)=>{if(LOWFX||a<=.01)return;const k=a*ctx.globalAlpha;if(GL)GL.push([rgb,x,y,r,k,ry]);else shine(rgb,x,y,r,a,ry)};
function glowFlush(){if(!GL||!GL.length)return;ctx.save();ctx.globalCompositeOperation='lighter';const a0=ctx.globalAlpha;for(const g of GL){glow(g[0],g[1],g[2],g[3],Math.min(1,g[4]),g[5])}ctx.globalAlpha=a0;ctx.restore();GL.length=0}
// the warm (or cold) rim inside an outline, in a colour of its own
function rimC(pts,al,rgb){if(!pts||pts.length<3)return;const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),
  kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);g.addColorStop(0,`rgba(${rgb},${al*.55})`);g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}

// ------------------------------------------------------------------ colours: three tones per piece (light, base, shadow)
// phase 1: petroleum teal, coral bellies, amber eyes, mother of pearl; the light of the signal is the water green of the runes of the room
const K1={skin:T3('#58bdb0','#1d8080','#0c4552'),rimRgb:'223,251,234',wet:'242,255,251',hem:'#2e9a92',
  ringO:'#0a3640',ringC:'#74cfc0',ringG:'116,207,192',ringOn:0,cloud:'15,90,98',
  belly:T3('#ffd0b8','#ec967e','#a95c5c'),suck:'#fde6d6',suckOn:'#8ffbe9',sig:'140,250,232',
  iris:T3('#ffd889','#ff9f2e','#b3550f'),eyeR:'#0b3f4a',pupil:'#160b06',eyeG:'255,170,70',
  lid:'#145a62',lidL:'#0b2e36',mouth:'#2b1020',beak:T3('#fffaf0','#f6ebd3','#b8a27a'),siph:'#0b2e36',
  reed:T3('#9a8254','#7a6440','#4e3e24'),reedD:'#2a2012',shell:T3('#fff2e2','#e8c9b4','#a9806e'),band:'#8a5a46',iri:'207,233,255',
  musO:T3('#5a5236','#3a3424','#211d14'),musI:T3('#fff4ec','#e9d6e6','#b7a2c0'),
  pearl:'#f6ffff',pearlD:'#c9d8e6',pearlG:'190,255,240',petal:'#ff9ad8',petalD:'#e05aa8',heart:'#ffd84a',fOpen:0,
  alga:'#78a043',algaD:'#3e6a28',water:'#173f44',waterL:'#3d8f8a',waterD:'#0b262a',foam:'205,245,235',refl:'190,255,240',refl2:'61,143,138',
  shellLit:0,shellG:'255,110,215',ink:'#2a1f40',inkRgb:'42,31,64'};
// phase 2: colder and darker, the warning rings lit magenta, red-magenta eyes, the crown lit from within, the pool of ink
const K2=Object.assign({},K1,{skin:T3('#45aebd','#1d6a80','#0b3448'),rimRgb:'200,246,255',hem:'#2b8a9a',
  ringO:'#ff4fcf',ringC:'#ffd1f3',ringG:'255,80,210',ringOn:1,suckOn:'#ff7ae0',sig:'255,122,224',
  iris:T3('#ffb3c6','#ff3d78','#8f0f3d'),eyeG:'255,70,140',petal:'#ff7ad0',petalD:'#c83a98',fOpen:1,pearlG:'255,120,220',
  water:'#1d1330',waterL:'#3a2a52',waterD:'#0e0918',refl:'255,90,220',refl2:'120,230,210',shellLit:1});
// the defeat: the skin pales to a grey lilac, the rings to grey
const PALE={skin:T3('#e4dfea','#c9c2d2','#8f8899'),ring:'#9a93a8'};
const PALC={};
function pal(k2,pl){k2=Math.round(cl(k2,0,1)*24)/24;pl=Math.round(cl(pl||0,0,1)*16)/16;const id=k2+'|'+pl;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='number'?lerp(a,b,k2):typeof a==='string'?(a===b?a:a[0]==='#'?cmix(a,b,k2):mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(pl>0){K.skin=mixT(K.skin,PALE.skin,pl);K.hem=cmix(K.hem,PALE.skin.b,pl);K.ringO=cmix(K.ringO,'#5e586a',pl);K.ringC=cmix(K.ringC,PALE.ring,pl);K.lid=cmix(K.lid,'#8a8396',pl);K.ringOn*=1-pl}
  K.k2=k2;return PALC[id]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to her left, z up; 0,0,0 the floor point)
const HC=[9,0,34],HR=[22,26,16];                       // the head: wide and flat
const MC=[-6,0,64],MR=[26,28,36],MTL=.18;              // the mantle: a tall drop leaning back
const SKP=[[0,46],[6,40],[14,32],[22,24]],SKX=2;        // the skirt: a solid of revolution round [2,0,0] (height, radius)
const PV=[0,0,24];                                     // where the upper part (head, mantle, crown) turns and leans
const EYD=[.824,.472,.315],EYRX=8.6,EYRY=7.6;          // the eyes: direction on the head (side +1), size
const MOD=nrm([.92,0,-.38]);                           // the mouth
const SIB=[-2,24,28],SID=nrm([-.2,.9,-.3]);            // the siphon on her left: root, direction
const POOL=[62,56];                                    // the pool
// the rings: [azimuth, elevation, radius] on the mantle (9, a constellation) and on the head (3, never between the eyes)
const RINGM=[[.45,.12,5.2],[-.62,.3,4.4],[1.35,-.08,5],[-1.45,.12,4.6],[2.25,.32,5.5],[-2.35,0,4.8],[3.05,.38,4.2],[.95,.46,3.6],[-2.85,-.28,3.8]];
const RINGH=[[1.25,.42,3.8],[-1.3,.36,3.6],[2.55,.3,3.5]];
const WARTS=[[-.25,.78,1.5],[.3,.72,1.2],[-.8,.66,1.3],[.95,.6,1.1]];

// ------------------------------------------------------------------ the arms. A chain of NP points from its root on the skirt: its shape
// is four headings (at u 0, .3, .6, 1 of its length, smoothly between) and a curl that rolls the last part round an axis (faster toward
// the tip), so it rolls and unrolls without changing its length; the belly (the coral side with the suckers) is carried along the arm
// from where it faces at the root. The points are closer toward the tip, so the curls stay round
const NS=14,NP=15,UP=[],UM=[];for(let j=0;j<NP;j++)UP.push(1-Math.pow(1-j/NS,1.55));for(let j=0;j<NS;j++)UM.push((UP[j]+UP[j+1])/2);
const KU=[0,.3,.6,1],PIECE=[[0,3],[3,8],[8,14]];
// a shape (side +1): L length, k headings, c curl {ax, ang, u0, pw}, c2 a second bend, vb where the belly faces at the root, roll a turn
// on its side, th thickness, rb root radius, b the root (on the skirt), fb how much it follows the lean of the body (0 the floor's frame)
function SH(o){return Object.assign({L:70,k:null,c:{ax:[0,0,1],ang:0,u0:.7,pw:1.6},c2:null,vb:[0,0,-1],roll:0,th:1,rb:10.5,b:[0,0,0],fb:0,kind:'hand'},o)}
function mixC(a,b,k){if(!a&&!b)return null;a=a||{ax:b.ax,ang:0,u0:b.u0,pw:b.pw};b=b||{ax:a.ax,ang:0,u0:a.u0,pw:a.pw};
  const r=lerp3(mul(a.ax,a.ang),mul(b.ax,b.ang),k),l=len(r);return{ax:l>1e-6?mul(r,1/l):a.ax,ang:l,u0:lerp(a.u0,b.u0,k),pw:lerp(a.pw,b.pw,k)}}
// between two shapes; lead > 0: the root goes first and the tip follows (a whip)
function mixS(a,b,k,lead){if(k<=0)return a;if(k>=1)return b;const kk=i=>lead?ez(cl(k*(1+lead)-lead*KU[i],0,1)):k;
  return{L:lerp(a.L,b.L,k),k:a.k.map((v,i)=>nrmS(lerp3(v,b.k[i],kk(i)))),c:mixC(a.c,b.c,lead?kk(3):k),c2:mixC(a.c2,b.c2,lead?kk(3):k),vb:nrmS(lerp3(a.vb,b.vb,k)),
    roll:lerp(a.roll,b.roll,k),th:lerp(a.th,b.th,k),rb:lerp(a.rb,b.rb,k),b:lerp3(a.b,b.b,k),fb:lerp(a.fb,b.fb,k),kind:k<.5?a.kind:b.kind,lit:k<.5?a.lit:b.lit}}
const mirC=c=>c&&{ax:mirA(c.ax),ang:c.ang,u0:c.u0,pw:c.pw};
const mirS=S=>Object.assign({},S,{b:mir(S.b),k:S.k.map(mir),c:mirC(S.c),c2:mirC(S.c2),vb:mir(S.vb),roll:-S.roll});
// turns a shape round the vertical (the whirl), and its headings by small angles (sways)
const turnS=(S,a)=>Object.assign({},S,{b:rotZ(S.b,a),k:S.k.map(v=>rotZ(v,a)),c:S.c&&Object.assign({},S.c,{ax:rotZ(S.c.ax,a)}),c2:S.c2&&Object.assign({},S.c2,{ax:rotZ(S.c2.ax,a)}),vb:rotZ(S.vb,a)});
function bendS(S,ax,angs){return Object.assign({},S,{k:S.k.map((v,i)=>angs[i]?rotAx(v,ax,angs[i]):v)})}
// the heading at u (body axes)
function headAt(S,u){const i=u>KU[2]?2:u>KU[1]?1:0,k=sstep(KU[i],KU[i+1],u),a=S.k[i],b=S.k[i+1];let h=nrmS([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]);
  for(const c of[S.c,S.c2])if(c&&c.ang){const t=u<=c.u0?0:Math.pow((u-c.u0)/(1-c.u0),c.pw);if(t>0)h=rotAx(h,c.ax,c.ang*t)}return h}
// the eight arms: kind and side; their shapes at rest (side +1; the other side mirrored)
const ARM=[['hand',-1],['hand',1],['side',-1],['side',1],['cobra',-1],['cobra',1],['throne',-1],['throne',1]];
const REST1={
  hand:SH({kind:'hand',b:[26,11,4],L:70,k:[dirv(.42,-.02),dirv(.52,-.01),dirv(.56,0),dirv(.5,.12)],c:{ax:[0,0,-1],ang:1.45*PI,u0:.62,pw:1.6}}),
  side:SH({kind:'side',b:[11,26,4],L:70,k:[dirv(1.22,-.02),dirv(1.52,0),dirv(1.22,0),dirv(1.3,0)],c:{ax:[.964,-.267,0],ang:1.25*PI,u0:.70,pw:1.6}}),
  cobra:SH({kind:'cobra',b:[-14,25,6],L:90,k:[dirv(2.15,.62),dirv(1.95,1.38),dirv(1.62,1.12),dirv(1.57,1.05)],c:{ax:[-1,0,0],ang:1.45*PI,u0:.66,pw:1.35},vb:[1,0,0],fb:1}),
  throne:SH({kind:'throne',b:[-26,13,6],L:130,rb:9.5,k:[nrm([-12,4,34]),nrm([-4,1.6,24]),nrm([4,1.4,22]),nrm([2,1,22])],c:{ax:[-1,0,0],ang:1.6*PI,u0:.74,pw:1.25},vb:[1,0,0],fb:1})};
// the second phase: the body 12 higher, the first third of every arm down to the water like a bent leg, the cobras wider, the hands
// farther forward
const REST2={
  hand:SH(Object.assign({},REST1.hand,{b:[26,11,4],k:[dirv(.42,.25),dirv(.45,-1.0),dirv(.5,.02),dirv(.5,.08)],c:{ax:[0,0,-1],ang:.75*PI,u0:.72,pw:1.6}})),
  side:SH(Object.assign({},REST1.side,{k:[dirv(1.25,.25),dirv(1.35,-1.0),dirv(1.25,.02),dirv(1.3,0)],c:{ax:[.964,-.267,0],ang:1.15*PI,u0:.74,pw:1.6}})),
  cobra:SH(Object.assign({},REST1.cobra,{k:[dirv(2.1,-.35),dirv(1.85,1.05),dirv(1.55,1.0),dirv(1.5,.85)],c:{ax:[-1,0,0],ang:1.35*PI,u0:.68,pw:1.35}})),
  throne:SH(Object.assign({},REST1.throne,{k:[nrm([-9,4,10]),nrm([-4,1.6,24]),nrm([4,1.4,22]),nrm([2,1,22])]}))};
const RC={};
function rest(i,k2){const id=i+'|'+(k2>.5?1:0);if(RC[id])return RC[id];const[kd,sd]=ARM[i],S=(k2>.5?REST2:REST1)[kd];return RC[id]=sd>0?S:mirS(S)}
// the angle of each root round the body (for the scallops of the skirt)
const ROOTA=ARM.map((_,i)=>{const b=rest(i,0).b;return Math.atan2(b[1],b[0]-SKX)});

// ------------------------------------------------------------------ the crown of the pond, worked out once on the mantle at rest: the
// ring of reed (front at z 84, back at 90), its frame, and the places of the pieces on it (in the crown's own axes)
const MF0={u:[Math.cos(MTL),0,Math.sin(MTL)],v:[0,1,0],w:[-Math.sin(MTL),0,Math.cos(MTL)]};
const CR0=(()=>{const N=28,pts=[],nrs=[];for(let i=0;i<N;i++){const t=i/N*TAU,e=.47+.38*(1-Math.cos(t))/2,m=[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)];
    const n=ellN(MR,MF0,m);pts.push(add(ellAt(MC,MR,MF0,m),mul(n,1.4)));nrs.push(n)}
  let c=[0,0,0];for(const q of pts)c=add(c,q);c=mul(c,1/N);
  // the plane of the ring: its up from the front and the back point, its forward
  const up=nrm(cross(sub(pts[N/4],pts[3*N/4]),sub(pts[0],pts[N/2]))),e3=up[2]<0?mul(up,-1):up,e1=nrm(sub([1,0,0],mul(e3,e3[0]))),e2=cross(e3,e1);
  const loc=q=>{const d=sub(q,c);return[dot(d,e1),dot(d,e2),dot(d,e3)]};
  return{N,c,E:[e1,e2,e3],ring:pts.map(loc),nrm:nrs.map(n=>[dot(n,e1),dot(n,e2),dot(n,e3)])}})();
// a place on the ring by the angle round it (0 in front, + toward her left): local point, local normal of the mantle, the radial out
function crownAt(t){const N=CR0.N,f=((t/TAU*N)%N+N)%N,i=Math.floor(f),k=f-i,j=(i+1)%N,q=lerp3(CR0.ring[i],CR0.ring[j],k),n=nrm(lerp3(CR0.nrm[i],CR0.nrm[j],k));
  return{q,n,out:nrm([q[0],q[1],0])}}
// the ornaments: kind, angle, size
const ORN=[{k:'snail',t:PI/4,h:17,r:5,tilt:.26},{k:'snail',t:-PI/4,h:17,r:5,tilt:.26},{k:'snail',t:115*PI/180,h:13,r:4,tilt:.2},{k:'snail',t:-115*PI/180,h:13,r:4,tilt:.2},
  {k:'snail',t:PI,h:11,r:3.5,tilt:.14},{k:'mussel',t:0,h:15,w:16},{k:'flower',t:80*PI/180,r:7},{k:'alga',t:95*PI/180,l:18},{k:'alga',t:-95*PI/180,l:18}];
// a pond snail (a tall pointed spiral shell, Lymnaea): its profile (height, radius) and its points at unit size, worked out once
const SNP=[[0,.6],[.1,.95],[.22,1],[.36,.8],[.52,.54],[.68,.33],[.84,.16],[1,.02]];
const SNPTS=(()=>{const out=[];for(const[z,r] of SNP)for(let i=0;i<10;i++){const t=i/10*TAU,bulge=1+.18*Math.max(0,Math.cos(t))*(z<.4?1:0);out.push([Math.cos(t)*r*bulge,Math.sin(t)*r,z])}return out})();
const snR=z=>{for(let i=0;i<SNP.length-1;i++){const a=SNP[i],b=SNP[i+1];if(z<=b[0])return lerp(a[1],b[1],(z-a[0])/(b[0]-a[0]))}return 0};

// ------------------------------------------------------------------ the moves (every one depends only on p; idle, walk and swim close on themselves)
const MV=['idle','walk','hit','slam','stuck','slam2','ink','cage','whirl','sink','swim','rise','tide','rage','taunt','enter','die'];
const DUR={idle:3,walk:1.2,hit:.6,slam:1.8,stuck:1.4,slam2:2.6,ink:1.6,cage:2.2,whirl:2.8,sink:.9,swim:.8,rise:1.6,tide:3.2,rage:2.8,taunt:1.1,enter:3.4,die:4};
const LAB={idle:'Ferma',walk:'Scivola',hit:'Colpita',slam:'Tentacolata',stuck:'Ventose attaccate',slam2:'Doppia tentacolata (fase 2)',ink:"Pioggia d'inchiostro",
  cage:'Gabbia degli abissi',whirl:'Gorgo',sink:'Si immerge',swim:"Sott'acqua",rise:'Agguato',tide:'Marea Nera (fase 2)',rage:'Furia',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'};
const POPS=[.20,.29,.38,.47,.56,.65,.74,.83],INK3=[.40,.47,.54],INK5=[.36,.42,.48,.54,.60];
// the order of the arms round the body (from her front left round her back to her front right): the wave of the walk, the groups of legs
const ROUND=[7,0,6,1,5,2,4,3];   // ROUND[i] = place of arm i round her
const PERM=[7,6,5,4,3,2,1,0];    // after the turn and a half of the whirl the arm i is where PERM[i] was
// the hand of the side sd raised high over its flank and rolled back like a whip (two half turns)
function whipUp(i,k2){const R=rest(i,k2),sd=ARM[i][1],az=sd*.95,ax=nrm(cross(dirv(az,0),[0,0,1]));
  return Object.assign({},R,{k:[dirv(az,.95),dirv(az,1.32),dirv(az-sd*.12,1.66),dirv(az-sd*.18,1.9)],c:{ax,ang:2*PI,u0:.48,pw:1.2},c2:null,roll:0,th:1})}
// the same arm lying on the floor along the blow: from its root to the end of the line (len from her centre along ang); bz: how high its
// root is (the second phase stands 12 higher), yaw: how much the body has turned (the line stays where it is in the room)
function whipDown(i,k2,ang,L0,yaw,bz){const R=rest(i,k2),b=R.b,a0=ang-yaw,E=[Math.cos(a0)*L0,Math.sin(a0)*L0,0],v=sub(E,b),Lh=Math.hypot(v[0],v[1]),a=Math.atan2(v[1],v[0]),
  dz=Math.max(0,bz-3),e0=-Math.atan2(dz*1.6,Math.max(20,Lh*.32)),sd=ARM[i][1];
  return Object.assign({},R,{k:[dirv(a,e0),dirv(a,e0*.25),dirv(a,0),dirv(a,.02)],c:{ax:[0,0,-sd],ang:.18*PI,u0:.88,pw:1.5},c2:null,L:Math.hypot(Lh,dz)*1.02,th:Math.sqrt(70/Math.max(70,Lh))*1.06,roll:0})}
// the bend that lifts a piece of an arm lying along the heading of its knot 2 (up > 0)
const upAx=S=>{const d=S.k[2],h=nrmS([d[0],d[1],0]);return nrm(cross(h,[0,0,1]))};
// an arm raised high and open (the Gabbia), planted in the pool at her flank, a petal of the flower (the Agguato), a jet of the fountain
// (the Marea), flat on the water as a ray of the star (the Gorgo), wrapped round her (she sinks), hanging forward without strength
const ROOTA_=i=>{const b=rest(i,0).b;return Math.atan2(b[1],b[0])};
function armTo(i,k2,kind){const R=rest(i,k2),a=ROOTA_(i),sd=ARM[i][1],out=dirv(a,0),ax=nrm(cross(out,[0,0,1]));
  if(kind==='open')return Object.assign({},R,{k:[dirv(a,.9),dirv(a-sd*.15,1.35),dirv(a-sd*.1,1.25),dirv(a,.95)],c:{ax:mul(ax,-1),ang:.9*PI,u0:.7,pw:1.4},c2:null,fb:0,vb:[0,0,1]});
  if(kind==='plant'){const a2=a+sd*.18;return Object.assign({},R,{k:[dirv(a2,.85),dirv(a2,.25),dirv(a2,-1.05),dirv(a2,-1.45)],c:{ax,ang:.15,u0:.8,pw:1.5},c2:null,fb:0,vb:[0,0,1]})}
  if(kind==='petal')return Object.assign({},R,{k:[dirv(a,1.05),dirv(a,1.25),dirv(a,1.0),dirv(a,.6)],c:{ax:mul(ax,-1),ang:1.1*PI,u0:.62,pw:1.5},c2:null,fb:0,vb:[0,0,1],L:Math.min(R.L,84)});
  if(kind==='jet')return Object.assign({},R,{k:[dirv(a,1.4),dirv(a,1.5),dirv(a,1.1),dirv(a,.2)],c:{ax:mul(ax,-1),ang:.8*PI,u0:.7,pw:1.4},c2:null,fb:0,vb:[0,0,1],L:Math.min(R.L,88)});
  if(kind==='flat')return Object.assign({},R,{k:[dirv(a,-.04),dirv(a,0),dirv(a,0),dirv(a,.03)],c:{ax:[0,0,sd],ang:.1,u0:.85,pw:1.5},c2:null,fb:0,vb:[0,0,-1],L:76,th:.95,rb:Math.min(R.rb,10)});
  if(kind==='stilt')return Object.assign({},R,{k:[dirv(a,-.55),dirv(a,-1.0),dirv(a,-.4),dirv(a,0)],c:{ax:[0,0,sd],ang:.4,u0:.8,pw:1.5},c2:null,fb:0,vb:[0,0,-1],L:Math.min(R.L,80)});
  if(kind==='wrap'){const a2=a+sd*.9;return Object.assign({},R,{k:[dirv(a,1.1),dirv(a2,1.25),dirv(a2+sd*.6,1.3),dirv(a2+sd*1.2,1.2)],c:{ax:[0,0,sd],ang:.8*PI,u0:.6,pw:1.3},c2:null,fb:0,vb:[0,0,1],L:Math.min(R.L,92)})}
  if(kind==='droop')return Object.assign({},R,{k:[dirv(a,.35),dirv(a*.6,.05),dirv(a*.4,-.02),dirv(a*.3,0)],c:{ax:[0,0,-sd],ang:.5*PI,u0:.75,pw:1.5},c2:null,fb:0,vb:[0,0,-1],L:Math.min(R.L,96)});
  if(kind==='spring')return Object.assign({},R,{c:{ax:R.c.ax,ang:3.2*PI,u0:.25,pw:1.1},c2:null});
  return R}
const TAPAX=[0,0,1];
// the tap of a hand on the water (k 0..1 of one tap): its tip up by 5 and down
function tapS(S,k){if(k<=0)return S;return bendS(S,upAx(S),[0,0,.16*k,.3*k])}
function oPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter'&&anim!=='rage',k2=P2?1:0;
  const A={B:[0,0,P2?12:0],lean:0,roll:0,yaw:0,s:0,sx:0,spin:0,hy:0,hp:0,hr:0,ml:0,mb:0,msq:0,
    k2,pale:0,ring:P2?1:0,rwave:-1,rfront:2,rflick:0,rsz:1,
    blink:1,lid:.34,lidLo:.14,squint:0,pw:.32,round:0,eyeGlow:1,look:[0,0],brow:0,jaw:0,
    siT:0,siP:0,siLit:0,pg:.55,pf:0,ptr:0,halo:0,crTilt:[0,0],crOff:-1,
    arms:ARM.map((_,i)=>rest(i,k2)),hi:[0,0,0,0,0,0,0,0],runs:[],pops:null,inkRun:0,
    cut:0,eyesU:0,eyeTop:0,skOpen:0,skWave:0,skK:1,cloud:0,algae:0,algaOut:0,
    pool:{k:1,ink:P2?1:0,inkR:1,rim:0,swirl:0,spin:0,boil:0,swell:0,mound:0},
    fin:0,drip:0,tip:null,flWhite:0,shellK:1,fx:[]};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const run=(i,u0,u1,a)=>{if(u1>u0&&a>.01)A.runs.push({i,u0:cl(u0,0,1),u1:cl(u1,0,1),a:cl(a,0,1)})};
  const breath=k=>{const b=Math.sin(ph*k);A.mb=.03*(.5+.5*b);A.pg=.45+.3*(.5+.5*b)};
  // the second phase's rings pulse in waves from the head to the tips (period 1.6 s, a whole number of waves in a loop)
  if(P2)A.rwave=fr(p*Math.max(1,Math.round(DUR[anim]/1.6)));
  if(anim==='walk'){// SCIVOLA: the arms on the water make a wave round the body (each lifts by 4 and pushes, 1/8 apart); the body leans
    // forward .10 and bobs by 2 (up at .25 and .75), the mantle lags and catches up; cobras and throne sway ±4°; a V wave in front
    breath(1);A.lean=.10;A.B[2]+=2*(.5+.5*Math.cos(TAU*2*(p-.25)));A.ml=.05*Math.sin(TAU*2*(p-.12));A.hy=0;A.skWave=p;A.algae=.35*Math.sin(TAU*2*(p-.2));
    A.arms=A.arms.map((S,i)=>{const kd=ARM[i][0],sd=ARM[i][1],w=Math.sin(TAU*(p-ROUND[i]/8));
      if(kd==='cobra'||kd==='throne')return bendS(S,[1,0,0],[0,.07*sd*w,.07*sd*w,0]);
      if(P2){// on its legs in two groups (at 0 and .5): the knee rises, steps and plants; the tip curls on the floor
        const g=ROUND[i]%2,q=fr(p-g*.5),st=q<.5?Math.sin(q/.5*PI):0,pl=q>=.5?Math.sin((q-.5)/.5*PI):0;
        return Object.assign(bendS(S,upAx(S),[.32*st,.18*st,.06*st,0]),{c:Object.assign({},S.c,{ang:S.c.ang+.35*pl})})}
      const up=Math.max(0,w),push=Math.max(0,-w);return bendS(bendS(S,upAx(S),[0,.1*up,.12*up,.1*up]),[0,0,1],[0,-sd*.08*push,-sd*.1*push,-sd*.08*push])});
    if(P2){A.B[2]+=1.5*Math.abs(Math.sin(TAU*p));A.rflick=.35*Math.max(pls(p,0,.12),pls(p,.5,.12),pls(p,1,.12))}
    fx('vwave',p)}
  else if(anim==='hit'){const k=hitK(p);A.msq=-.08*k;A.squint=.8*(1-sstep(.3,.45,p));A.lean=-.06*k;A.B[0]-=2*k;A.pg=.6;
    A.arms=A.arms.map(S=>bendS(S,upAx(S),[0,.12*k,.16*k,.1*k]))}
  else if(anim==='slam'||anim==='stuck'||anim==='slam2'){
    const s1=o.side<0?-1:1,i1=s1<0?0:1,i2=1-i1,bz=4+A.B[2];
    if(anim==='slam'){// TENTACOLATA: the eyes on the target and a flash of the pearl (0-.06); the hand rises high and rolls back over the
      // flank like a whip (.05-.50) while its suckers light up one by one from the root (.10-.45); the blow (.50-.60): it unrolls and
      // comes down stretched along the line (IMPACT .60); it stays on the floor, heavy, a bounce at .66 (the pose stuck starts from)
      const ang=o.ang||0,Ls=Math.max(60,o.len||165),yw=.5*ang*sstep(.05,.5,p);A.yaw=yw;
      const R=rest(i1,k2),W1=whipUp(i1,k2),W2=whipDown(i1,k2,ang,Ls,.5*ang,bz);
      if(p<.5)A.arms[i1]=mixS(R,W1,ez(sstep(.05,.5,p)));else if(p<.6)A.arms[i1]=mixS(W1,W2,(p-.5)/.1,.9);
      else{const bo=rise(p,.6,.63,.66,.72)-.4*rise(p,.66,.7,.72,.8);A.arms[i1]=bendS(W2,upAx(W2),[0,.1*bo,.14*bo,.08*bo])}
      A.hi[i1]=rise(p,.05,.15,.55,.6);
      A.pf=pls(p,.035,.07);A.halo=A.pf;A.look=[0,.4*sstep(0,.06,p)*(1-sstep(.65,.9,p))];
      run(i1,0,sstep(.10,.45,p),1-sstep(.62,.78,p));
      A.ml=.12*sstep(.05,.45,p)*(1-sstep(.5,.56,p))-.15*rise(p,.5,.56,.66,.8)-.04*sstep(.66,.8,p);
      A.pw=lerp(.32,.2,sstep(.05,.2,p));A.brow=-1*sstep(.05,.2,p);A.squint=.25*sstep(.05,.2,p);
      A.lean=.15*sstep(.5,.58,p);A.B[0]+=2*sstep(.5,.58,p);A.jaw=.6*rise(p,.5,.53,.62,.72);
      // the other arms spread and press on the water
      const pr=sstep(.08,.3,p);for(let i=0;i<4;i++)if(i!==i1){const sd=ARM[i][1],S=A.arms[i];A.arms[i]=bendS(S,[0,0,1],[sd*.1*pr,sd*.12*pr,sd*.1*pr,0])}
      fx('drip',(p-.22)/.16,{arm:i1});fx('drip',(p-.36)/.14,{arm:i1});fx('splashline',(p-.6)/.32,{arm:i1});fx('ring',(p-.6)/.3,{arm:i1,u:1,r:26})}
    else if(anim==='stuck'){// VENTOSE ATTACCATE: it tugs (0-.15), the arm tenses and turns a little on its side; the suckers come off one by
      // one from the tip (eight pops) and the arm rises from the tip a piece at a time; the body stays bent forward, the crown leant toward
      // the hero, the pearl in view trembling (the weak point); .85-1 the arm goes back up curling and she straightens
      const ang=o.ang||0,Ls=Math.max(60,o.len||165),W2=whipDown(i1,k2,ang,Ls,.5*ang,bz),back=sstep(.85,1,p);A.yaw=.5*ang*(1-back);
      let f=0;for(const t of POPS)f+=sstep(t-.03,t+.02,p);f/=8;
      const tug=rise(p,0,.06,.12,.16),uf=.95-.78*f,ax=upAx(W2);
      let S=Object.assign({},W2,{roll:ARM[i1][1]*.45*sstep(0,.15,p),th:W2.th*(1+.06*tug),c2:{ax,ang:1.5*PI*f,u0:uf,pw:1.25}});
      A.arms[i1]=back>0?mixS(S,rest(i1,k2),ez(back)):S;A.pops={i:i1,f};
      A.lean=.15*(1-back);A.B[0]+=2*(1-back)-1.5*tug;A.ml=-.04*(1-back)+.08*tug;A.crTilt=[.12*sstep(.08,.2,p)*(1-back),0];
      A.ptr=sstep(.12,.2,p)*(1-sstep(.8,.88,p));A.pg=.75;A.pw=lerp(.2,.32,back);A.brow=-.5*(1-back);A.squint=.2*(1-back)+.3*tug;
      for(let k=0;k<8;k++)fx('pop',(p-POPS[k])/.1,{arm:i1,n:k});fx('drip',(p-.86)/.14,{arm:i1})}
    else{// DOPPIA TENTACOLATA (second phase): the first hand rises and rolls (.04-.38, suckers .08-.34), comes down straight (IMPACT 1 .45),
      // stays on the floor (.45-.70) and goes back up (.70-.95); the other hand rises and rolls (.45-.78, suckers .50-.74) while the body
      // turns by half of o.a2 toward the new target, comes down along o.a2 (IMPACT 2 .85) and stays (the pose of stuck with o.ang = o.a2)
      const a2=o.a2||0,L1=Math.max(60,o.len||165),L2=Math.max(60,o.len2||o.len||165),yw=.5*a2*sstep(.45,.78,p);A.yaw=yw;
      const R1=rest(i1,k2),R2=rest(i2,k2),U1=whipUp(i1,k2),U2=whipUp(i2,k2),D1=whipDown(i1,k2,0,L1,yw,bz),D2=whipDown(i2,k2,a2,L2,.5*a2,bz);
      A.arms[i1]=p<.38?mixS(R1,U1,ez(sstep(.04,.38,p))):p<.45?mixS(U1,D1,(p-.38)/.07,.9):p<.70?D1:mixS(D1,R1,ez(sstep(.70,.95,p)));
      A.arms[i2]=p<.45?R2:p<.78?mixS(R2,U2,ez(sstep(.45,.78,p))):p<.85?mixS(U2,D2,(p-.78)/.07,.9):D2;
      A.hi[i1]=rise(p,.04,.12,.42,.45);A.hi[i2]=rise(p,.45,.53,.82,.85);
      A.pf=Math.max(pls(p,.035,.07),.7*pls(p,.47,.06));A.halo=A.pf;
      run(i1,0,sstep(.08,.34,p),1-sstep(.48,.6,p));run(i2,0,sstep(.50,.74,p),1-sstep(.88,.98,p));
      A.pw=.2;A.brow=-1;A.squint=.25;A.ml=.1*rise(p,.04,.3,.36,.4)-.13*rise(p,.38,.42,.5,.56)+.1*rise(p,.45,.7,.76,.8)-.13*rise(p,.78,.82,.9,.96);
      A.jaw=.6*Math.max(rise(p,.38,.41,.48,.55),rise(p,.78,.81,.9,.96));A.lean=.12*Math.max(rise(p,.38,.44,.6,.72),sstep(.78,.84,p));A.B[0]+=2*sstep(.78,.84,p);
      fx('splashline',(p-.45)/.3,{arm:i1});fx('ring',(p-.45)/.3,{arm:i1,u:1,r:24});fx('splashline',(p-.85)/.15,{arm:i2});fx('ring',(p-.85)/.15,{arm:i2,u:1,r:24})}}
  else if(anim==='ink'){// PIOGGIA D'INCHIOSTRO: the mantle swells like a balloon (+16%) and the rings widen, the siphon turns to the hero and
    // swells, the light of the pearl runs down to it (.10-.34); at every shot the mantle loses a notch, the siphon spits a puff of ink
    // up with droplets and the head kicks; .62-1 it empties with a puff of bubbles and straightens
    const n=(o.n||(o.p2?5:3))>=5?5:3,T=n===5?INK5:INK3;let notch=0,kick=0;for(const t of T){notch+=sstep(t,t+.03,p);kick=Math.max(kick,blip(p,t+.012,.07))}
    A.mb=.16*sstep(0,.36,p)-.12/n*notch-.04*sstep(.62,.9,p)+.03*(1-sstep(0,.2,p))*.5;A.rsz=1+.35*cl(A.mb/.16,0,1);
    A.siT=sstep(.04,.3,p)*(1-sstep(.7,.95,p));A.siP=.8*sstep(.1,.36,p)*(1-sstep(T[n-1],T[n-1]+.12,p))+.5*kick;A.siLit=sstep(.28,.34,p)*(1-sstep(.62,.8,p));
    A.inkRun=sstep(.10,.34,p);A.inkA=1-sstep(.62,.78,p);A.pf=pls(p,.035,.07);A.halo=A.pf;A.pg=.6;
    A.hp=-.07*kick;A.B[0]-=1.2*kick;A.lean=-.05*sstep(.1,.36,p)*(1-sstep(.62,.9,p));A.look=[0,.3*sstep(0,.1,p)*(1-sstep(.7,.9,p))];A.squint=.2*sstep(.2,.36,p)*(1-sstep(.62,.8,p));
    for(let k=0;k<n;k++)fx('spit',(p-T[k])/.16,{k});fx('bubbles',(p-.64)/.3,{siph:1})}
  else if(anim==='cage'){// GABBIA DEGLI ABISSI: she rises a little and lifts four arms (cobras and sides) high and open like a hand, the suckers
    // lit from the root (.05-.22); she plants them in her pool at her flanks (splash .33): cut by the water, the light goes down with them;
    // she stays bent with the arms tense in the water, the eyes lit and fixed on the hero, the pool turning slowly; a push down at .71 (the
    // arms burst out far away in the game at .715); .85-1 she pulls them out dripping and straightens
    A.B[2]+=4*rise(p,0,.2,.85,1)-3*blip(p,.712,.07);const up=ez(sstep(0,.25,p)),dn=ez(sstep(.25,.36,p)),out=ez(sstep(.85,1,p));
    for(const i of[2,3,4,5]){const R=rest(i,k2),O=armTo(i,k2,'open'),Pl=armTo(i,k2,'plant');let S=mixS(mixS(R,O,up),Pl,dn);
      if(p>.38&&p<.85){const t=.03*Math.sin(TAU*(p-.38)*2.2*3.5);S=bendS(S,upAx(Pl),[t,0,0,0])}
      A.arms[i]=out>0?mixS(S,R,out):S;A.hi[i]=up*(1-dn)+.3*dn*(1-out);run(i,0,sstep(.05,.22,p),1-sstep(.36,.44,p))}
    A.lean=.1*sstep(.3,.4,p)*(1-out);A.eyeGlow=1+.5*sstep(.3,.4,p)*(1-out);A.look=[0,.5*sstep(.3,.4,p)*(1-out)];A.squint=.3*sstep(.3,.4,p)*(1-out);A.pw=lerp(.32,.24,sstep(.3,.4,p)*(1-out));
    A.pool.spin=.5*sstep(.3,.4,p)*(p-.3);A.pool.boil=.4*rise(p,.35,.45,.8,.9);A.pf=pls(p,.035,.07);A.halo=A.pf;
    for(const i of[2,3,4,5])fx('splash',(p-.33)/.22,{arm:i,u:.72});for(const i of[2,3,4,5])fx('drip',(p-.86)/.14,{arm:i})}
  else if(anim==='whirl'){// GORGO: the eight arms flat on the water like a star (~200 tip to tip), the skirt opens, a flash (0-.15); skirt and
    // arms turn a turn and a half round her (slow, fast, slow), the arms bent back like the blades of a pinwheel, the algae flying out, the
    // light running round in the suckers; head, mantle and crown keep looking at the hero; .85-1 it stops dead (a jolt at .86), the arms go
    // back to their places (the turn and a half puts each where its opposite was: PERM) and the head sways
    const k0=ez(sstep(0,.15,p)),u=cl((p-.15)/.7,0,1),sp=TAU*1.5*ez(u),w=u<.5?4*u:4*(1-u),back=ez(sstep(.86,1,p)),jolt=p>.85?.1*Math.sin((p-.85)/.15*TAU)*(1-sstep(.85,1,p)):0;
    A.spin=sp+jolt;A.skOpen=k0*(1-back);A.algaOut=sstep(.15,.3,p)*(1-sstep(.85,.95,p));A.pf=pls(p,.04,.08);A.halo=A.pf;
    A.arms=A.arms.map((S,i)=>{const F=armTo(i,k2,'flat');let T=mixS(S,F,k0);if(u>0&&u<1)T=Object.assign({},T,{c2:{ax:[0,0,1],ang:-.75*Math.min(1,w),u0:.15,pw:1}});
      if(back>0)T=mixS(T,turnS(rest(PERM[i],k2),-PI),back);const a=ROOTA[i];if(p>.15&&p<.85)run(i,0,fr(p*2.6-a/TAU+.3),.8*sstep(.15,.22,p)*(1-sstep(.78,.85,p)));return T});
    A.hr=.08*Math.sin((p-.86)/.14*TAU*1.5)*(p>.86?1-sstep(.86,1,p):0);A.squint=.3*sstep(.1,.2,p)*(1-back);A.look=[0,.3];
    A.pool.swirl=sstep(.08,.2,p)*(1-sstep(.85,1,p));A.pool.spin=sp;fx('whirlfoam',p)}
  else if(anim==='sink'||anim==='swim'){
    if(anim==='sink'){// SI IMMERGE: a breath and a look at the hero (0-.20); she wraps herself in her arms like a cloak, lowers the crown and
      // sinks with a suck of bubbles (under at .70, cut at the water); .85-1 only the tips of the crown are out, two amber lights under the
      // water: the pose of swim
      const w=ez(sstep(.2,.55,p)),dn=p<.7?-120*ez(sstep(.22,.7,p)):lerp(-120,-95,ez(sstep(.72,.95,p)));A.B[2]+=dn;A.mb=.08*rise(p,0,.2,.3,.4);A.cut=sstep(.18,.22,p);
      A.arms=A.arms.map((S,i)=>mixS(S,armTo(i,k2,'wrap'),w));A.hp=.12*sstep(.2,.45,p);A.lid=lerp(.34,.2,rise(p,0,.15,.3,.4));A.look=[0,.4*rise(p,0,.1,.3,.4)];
      A.eyesU=sstep(.8,.95,p);A.fin=sstep(.85,1,p);fx('suck',(p-.3)/.55);fx('bubbles',(p-.45)/.4)}
    else{// SOTT'ACQUA: only the tips of the crown out of the water, cutting it like a fin, the V wake toward where she goes; two amber
      // lights under the water; bubbles (the last frame is the first)
      A.B[2]+=-95+1.2*Math.sin(ph);A.cut=1;A.eyesU=1;A.fin=1;A.arms=A.arms.map((S,i)=>armTo(i,k2,'wrap'));A.hp=.12;fx('vwave',p,{fin:1});fx('trail',p)}}
  else if(anim==='rise'){// AGGUATO: from under the water: the water boils in a circle, the crown goes under, the eyes rise brighter and the
    // surface swells (0-.63); THE BLOW at .63: she bursts out with all her arms open upward like a flower and the beak wide, in a column of
    // water; she holds the flower (.63-.75), the arms fall slapping the water (.80), she settles (.90-1)
    const out=sstep(.6,.66,p),z=p<.6?-95-15*ez(sstep(0,.6,p)):lerp(-110,6,ez(out))-6*sstep(.75,.95,p);A.B[2]+=z;A.cut=1;
    A.eyesU=(1+.6*sstep(.2,.6,p))*(1-sstep(.6,.64,p));A.eyeTop=sstep(.2,.6,p);A.pool.boil=sstep(.05,.3,p)*(1-sstep(.62,.7,p));A.pool.swell=sstep(.3,.6,p)*(1-sstep(.6,.64,p));
    const fl=ez(sstep(.6,.66,p)),fall=ez(sstep(.75,.82,p)),set=ez(sstep(.88,1,p));
    A.arms=A.arms.map((S,i)=>{const W=armTo(i,k2,'wrap'),Pt=armTo(i,k2,'petal'),F=armTo(i,k2,'flat');let T=mixS(W,Pt,fl);if(fall>0)T=mixS(T,F,fall);if(set>0)T=mixS(T,S,set);A.hi[i]=fl*(1-fall);return T});
    A.jaw=.9*rise(p,.61,.64,.76,.84);A.hp=-.18*rise(p,.61,.65,.75,.85);A.squint=.3*rise(p,.62,.66,.74,.8);A.pf=.8*pls(p,.63,.08);A.halo=A.pf;A.eyeGlow=1.3;
    fx('column',(p-.6)/.32);fx('slap',(p-.8)/.2);fx('bubbles',(p-.05)/.55,{wide:1})}
  else if(anim==='tide'){// MAREA NERA (second phase): up on the tips of her arms (+20), then every arm over her head like a fountain, rings and
    // crown blazing, the pearl burning (0-.30); she pulls them down slowly, breathing deep, the water rising round her (.30-.55); she slams
    // them all on the water at .55 (a ring of splashes: the wave starts) and pushes; .80-1 she comes back down
    const upB=ez(sstep(0,.14,p))*(1-ez(sstep(.8,1,p)));A.B[2]+=20*upB;A.pool.mound=upB;
    const st=ez(sstep(0,.12,p)),jt=ez(sstep(.1,.28,p)),dw=ez(sstep(.3,.53,p)),sl=ez(sstep(.53,.56,p)),bk=ez(sstep(.8,1,p));
    A.arms=A.arms.map((S,i)=>{let T=mixS(S,armTo(i,1,'stilt'),st);T=mixS(T,armTo(i,1,'jet'),jt);const D=bendS(armTo(i,1,'jet'),upAx(armTo(i,1,'flat')),[-.5,-.6,-.6,-.4]);
      T=mixS(T,D,dw*.6);T=mixS(T,armTo(i,1,'flat'),sl);if(p>.56&&p<.8)T=bendS(T,upAx(T),[.04*Math.sin(TAU*(p-.56)*3.2*3.5),0,0,0]);if(bk>0)T=mixS(T,S,bk);A.hi[i]=jt*(1-sl);return T});
    A.mb=.1*rise(p,.3,.45,.53,.6);A.pool.rim=sstep(.3,.55,p)*(1-sstep(.62,.9,p));A.ring=1;A.rflick=.5*rise(p,.05,.15,.5,.6);A.shellK=1+.8*rise(p,.05,.15,.5,.6);A.pg=1;A.pf=.6*rise(p,.05,.12,.25,.32);A.halo=A.pf;
    A.hp=-.12*rise(p,.1,.2,.28,.35)+.06*rise(p,.53,.56,.7,.8);A.jaw=.5*rise(p,.52,.56,.62,.7);A.squint=.3*rise(p,.5,.55,.75,.85);
    fx('ringsplash',(p-.55)/.3);fx('spray',(p-.55)/.25)}
  else if(anim==='rage'){// FURIA: she trembles and the rings flicker (0-.20); she rises on her eight arms, the skirt lifting (.20-.50); she
    // throws her head back while the rings light magenta in a wave from the head to the tips, the shells of the crown light up within, the
    // flower opens, the pool turns to ink from the middle out and the skin takes the colours of the second phase (.50-.70); she roars with
    // the beak open, the arms lashing up and out with a spray (.70-.85); she settles in the pose of the second phase
    A.B[1]+=.9*trem(p,0,.2,3.6,2.8);A.rflick=.6*(1-sstep(.15,.22,p))*sstep(0,.03,p);
    const up=ez(sstep(.2,.5,p));A.B[2]+=12*up;A.arms=A.arms.map((S,i)=>mixS(rest(i,0),rest(i,1),up));
    A.k2=sstep(.5,.7,p);A.ring=sstep(.5,.52,p);A.rfront=-.3+1.6*sstep(.5,.7,p);A.pool.ink=1;A.pool.inkR=sstep(.5,.7,p);
    A.hp=-.35*rise(p,.5,.6,.8,.9);A.lid=lerp(.34,.12,rise(p,.5,.6,.85,.95));A.jaw=.9*rise(p,.7,.74,.84,.88);A.brow=1.2*rise(p,.5,.6,.85,.95);
    const wh=rise(p,.7,.75,.82,.88);if(wh>0)A.arms=A.arms.map((S,i)=>{A.hi[i]=wh;return bendS(S,upAx(S),[.5*wh,.6*wh,.45*wh,0])});
    A.pf=Math.max(pls(p,.6,.12),.8*pls(p,.76,.1));A.halo=A.pf;A.pg=.5+.5*sstep(.5,.7,p);A.shellK=1+.6*rise(p,.55,.65,.8,.9);
    fx('spray',(p-.72)/.2);fx('bubbles',(p-.5)/.25,{wide:1})}
  else if(anim==='taunt'){// PRESA IN GIRO: a cobra rises to the crown and straightens it with a tap (0-.30, a flash of the pearl at .12); she
    // looks down at the hero with heavy lids and the brows raised, the siphon turned to him blows a string of bubbles that ends in a big one
    // that pops (.62); the hands drum twice (.75, .85). With o.call: no bubbles, the head a little on one side and the tip of the cobra
    // curling twice toward her (.38, .56): «come here»
    const i=5,R=A.arms[i],tp=ez(sstep(0,.18,p))*(1-ez(sstep(.24,.36,p))),tap=blip(p,.22,.06);
    const T=Object.assign({},R,{k:[nrm([.02,.38,1]),nrm([.06,.12,1]),nrm([.16,-.18,1]),nrm([.25,-.55,.8])],c:{ax:[1,0,0],ang:.7*PI*(1+.25*tap),u0:.72,pw:1.4}});
    A.arms[i]=mixS(R,T,tp);A.hi[i]=tp;A.crTilt=[0,.1*(1-sstep(.2,.24,p))*sstep(0,.08,p)];
    A.pf=pls(p,.12,.07);A.halo=A.pf;A.hp=-.08*rise(p,.28,.36,.7,.8);A.lid=lerp(.34,.46,rise(p,.28,.36,.7,.8));A.brow=1.3*rise(p,.28,.36,.7,.8);
    if(o.call){A.hr=.15*rise(p,.28,.36,.7,.8);const cu=Math.max(blip(p,.38,.1),blip(p,.56,.1)),C=Object.assign({},R,{k:[dirv(1.6,.6),dirv(1.3,1.0),dirv(.9,.9),dirv(.6,.6)],c:{ax:[0,0,-1],ang:(.8+.9*cu)*PI,u0:.6,pw:1.3}});
      A.arms[5]=mixS(A.arms[5],C,rise(p,.3,.36,.66,.74));A.hi[5]=Math.max(A.hi[5],rise(p,.3,.36,.66,.74))}
    else{A.siT=rise(p,.28,.34,.66,.74);A.siP=.4*rise(p,.3,.34,.58,.64);fx('bubstring',(p-.32)/.3);fx('bigbub',(p-.42)/.24)}
    for(const[c,i2] of[[.75,0],[.85,1]])A.arms[i2]=tapS(A.arms[i2],blip(p,c,.08));for(const[c,i2] of[[.75,0],[.85,1]])fx('ring',(p-c-.02)/.15,{arm:i2,u:1,r:12})}
  else if(anim==='enter'){// ENTRATA (always the colours of the first phase): a dark pool spreads and boils (0-.15); under the water two amber
    // eyes open, the tips of the crown come out and turn slowly like a fin (.15-.30); the tip of a hand comes out and taps three times
    // (.31 .35 .39); she rises slow and majestic, the water running off her (.40-.66), the two arms of the throne unrolling behind her (.52,
    // .60) with a wet snap, the skirt spreading on the water; the pearl lights up (.66); she slams both hands on the water (.75); she roars
    // (.82-.92); she lowers her lids and looks down at the hero (.92-1)
    A.pool.k=ez(sstep(0,.15,p));A.pool.boil=sstep(.02,.1,p)*(1-sstep(.4,.55,p));
    const upk=ez(sstep(.40,.66,p));A.B[2]+=-95*(1-upk);A.cut=1-sstep(.64,.68,p);A.yaw=.35*Math.sin(TAU*(p-.15)/.25*.5)*sstep(.15,.2,p)*(1-sstep(.38,.46,p));
    A.eyesU=sstep(.17,.25,p)*(1-sstep(.5,.58,p));A.fin=sstep(.15,.22,p);A.skK=lerp(.55,1,ez(sstep(.45,.66,p)));A.drip=rise(p,.42,.5,.66,.78);
    A.pg=.55*sstep(.64,.68,p);A.pf=pls(p,.665,.06);A.halo=A.pf;
    const taps=Math.max(blip(p,.31,.04),blip(p,.35,.04),blip(p,.39,.04));A.tip=p>.28&&p<.44?{k:sstep(.28,.31,p)*(1-sstep(.4,.44,p)),tap:taps}:null;
    A.arms=A.arms.map((S,i)=>{let T=mixS(armTo(i,0,'wrap'),S,ez(sstep(.44,.66,p)));
      if(ARM[i][0]==='throne'){const t=i===6?.52:.60,un=ez(sstep(t-.03,t+.04,p));T=Object.assign({},T,{c:Object.assign({},T.c,{ang:lerp(3.4*PI,T.c.ang,un),u0:lerp(.35,T.c.u0,un)})})}
      if(ARM[i][0]==='hand'){const hu=rise(p,.72,.74,.75,.77);T=bendS(T,upAx(T),[.35*hu,.5*hu,.35*hu,0]);A.hi[i]=hu}
      if(ARM[i][0]==='cobra'){const ro=rise(p,.8,.84,.9,.94);T=bendS(T,[1,0,0],[0,ARM[i][1]*-.2*ro,ARM[i][1]*-.3*ro,0])}return T});
    A.jaw=.85*rise(p,.82,.85,.9,.93);A.hp=-.2*rise(p,.82,.85,.9,.94);A.lid=p<.9?.3:lerp(.3,.46,rise(p,.92,.95,.98,1.01));A.brow=.6*rise(p,.92,.95,.99,1.01);
    A.blink=p<.25?sstep(.17,.25,p):1;
    for(const t of[.31,.35,.39])fx('ring',(p-t)/.12,{at:[44,10,0],r:9});for(const t of[.52,.60])fx('snap',(p-t)/.12,{arm:t<.55?6:7});
    fx('slap',(p-.75)/.2,{hands:1});fx('pearlstar',(p-.66)/.12);fx('bubbles',(p-.02)/.4,{wide:1})}
  else if(anim==='die'){// SCONFITTA: she trembles, the eyes wide with round pupils, the pearl flickering (0-.15); the light withdraws: the rings
    // go out from the tips toward the body, the skin pales, cobras and throne lose their strength and fall forward on the water (.15-.40);
    // she sinks turning a quarter, the arms curling like springs and going under last; at .55 the crown slips off and falls on the water
    // with a plop (the climax); a cloud of ink opens on the water and clears (.55-.80); only the crown floats on the calm water, the pearl's
    // last glow at .90, a last bubble at .95 (in the second phase the flower opens white at the end)
    A.B[1]+=.8*trem(p,0,.15,3.6,4)*(1-sstep(.12,.15,p));A.round=sstep(.02,.08,p);A.lid=lerp(.34,.02,sstep(.02,.1,p));A.lidLo=lerp(.14,0,sstep(.02,.1,p));A.brow=.9*sstep(.02,.1,p);
    A.ptr=1-sstep(.12,.16,p);A.ring=o.p2?1:0;A.rfront=1.3-1.6*sstep(.15,.3,p);A.pale=sstep(.25,.4,p);
    const dr=ez(sstep(.15,.4,p)),sp=ez(sstep(.4,.6,p));
    A.arms=A.arms.map((S,i)=>{let T=S;if(ARM[i][0]==='cobra'||ARM[i][0]==='throne')T=mixS(T,armTo(i,k2,'droop'),dr);if(sp>0)T=mixS(T,armTo(i,k2,'spring'),sp);return T});
    A.yaw=PI/2*ez(sstep(.4,.62,p));A.B[2]+=-80*ez(sstep(.38,.55,p))-50*ez(sstep(.55,.72,p));A.cut=sstep(.36,.4,p);A.hp=.15*sstep(.3,.5,p);
    A.crOff=sstep(.5,.56,p);A.crSpin=.35*sstep(.5,1,p);A.crBob=.6*Math.sin(TAU*(p-.56)*1.6)*sstep(.56,.6,p)*(1-sstep(.8,1,p));A.pg=.4*(1-sstep(.3,.45,p))+.9*blip(p,.9,.06);A.pf=.6*blip(p,.9,.06);A.flWhite=o.p2?sstep(.9,1,p):0;
    A.pool.ink=o.p2?1:0;fx('inkcloud',(p-.55)/.3);fx('bubbles',(p-.25)/.55,{wide:1});fx('plop',(p-.55)/.25);fx('lastbub',(p-.95)/.05)}
  else{// FERMA: a slow deep breath (the mantle +3%, the pearl with it), two bubbles from the siphon on the breath out (.75), a wave round the
    // scallops of the skirt; the hands drum (right .10 .18, left .55 .63); the cobras sway in S (±6°, out of step) and the volutes curl and
    // uncurl a little; the upper part looks round (±.12) and comes back to the front at 0 and .5; a slow blink at .45; a darker cloud on the
    // mantle (.60-.90); a drop from a cobra at .30; the algae sway
    breath(1);A.s=.008*Math.sin(ph);A.hy=C.look(p,.12);A.skWave=p;A.algae=.3*Math.sin(ph+.6);
    {const d=p-.45;A.blink=d<-.034||d>.084?1:d<0?1-sstep(-.034,0,d):d<.017?0:sstep(.017,.05,d)}
    A.cloud=rise(p,.60,.70,.82,.90);A.cloudY=cl((p-.6)/.3,0,1);A.siP=.6*pls(p,.75,.1);fx('sibub',(p-.74)/.2);fx('sibub',(p-.80)/.2,{b:1});
    A.arms=A.arms.map((S,i)=>{const kd=ARM[i][0],sd=ARM[i][1];
      if(kd==='hand'){const t=i===0?Math.max(blip(p,.10,.06),blip(p,.18,.06)):Math.max(blip(p,.55,.06),blip(p,.63,.06));return tapS(S,t)}
      if(kd==='cobra'){const w=.105*Math.sin(ph+(sd>0?0:2.1));return bendS(S,[1,0,0],[0,sd*w,-sd*w*.8,sd*w*.6])}
      if(kd==='throne'){const w=.06*Math.sin(ph+(sd>0?1:2.6));return Object.assign({},S,{c:Object.assign({},S.c,{ang:S.c.ang*(1+w)})})}
      if(kd==='side'){const w=.04*Math.sin(ph+(sd>0?.5:3));return bendS(S,[0,0,1],[0,sd*w,-sd*w,sd*w])}return S});
    for(const[c,i] of[[.10,0],[.18,0],[.55,1],[.63,1]])fx('ring',(p-c-.01)/.14,{arm:i,u:1,r:11});fx('drip',(p-.3)/.22,{arm:5})}
  return A}

// ------------------------------------------------------------------ frames: the body (lean, roll, yaw round [0,0,20]), the floor (only the
// turn and the place: the skirt and the arms that lie on the water), the upper part (head, mantle, crown: its own turn round PV)
function frames(A){const X=frame(A,20),Xf=frame({B:A.B,yaw:A.yaw+A.spin},0),RU=v=>rotZ(rotY(rotX(v,A.hr),A.hp),A.hy);
  return{X,Xf,RU,TU:q=>X.T(add(PV,RU(sub(q,PV)))),RdU:v=>X.Rd(RU(v))}}
const skR=z=>{if(z<=SKP[0][0])return SKP[0][1];for(let i=0;i<SKP.length-1;i++){const a=SKP[i],b=SKP[i+1];if(z<=b[0])return lerp(a[1],b[1],(z-a[0])/(b[0]-a[0]))}return SKP[SKP.length-1][1]};
const perpOf=h=>{let v=cross(h,[0,0,1]);if(len(v)<.2)v=cross(h,[1,0,0]);return nrm(v)};

// ------------------------------------------------------------------ an arm now: its points in the room, radii, headings, bellies, and
// where it leaves the skirt (before that it is inside the skirt and never drawn)
function armGeo(S,F,A){const Rf=F.Xf.Rd,Rb=F.X.Rd,fb=S.fb,R=fb<.001?Rf:v=>nrmS(lerp3(Rf(v),Rb(v),fb));
  const P=new Array(NP),H=new Array(NS),HP=new Array(NP),RR=new Array(NP),N=new Array(NP);P[0]=F.Xf.T(S.b);
  for(let j=0;j<NS;j++){const h=R(headAt(S,UM[j])),ds=S.L*(UP[j+1]-UP[j]);H[j]=h;P[j+1]=[P[j][0]+h[0]*ds,P[j][1]+h[1]*ds,P[j][2]+h[2]*ds]}
  for(let j=0;j<NP;j++){RR[j]=(2+(S.rb-2)*Math.pow(1-UP[j],.85))*S.th;HP[j]=j===0?H[0]:j===NS?H[NS-1]:nrmS(add(H[j-1],H[j]))}
  let n=R(S.vb);for(let j=0;j<NP;j++){const h=HP[j];n=sub(n,mul(h,dot(n,h)));const l=len(n);n=l>1e-4?mul(n,1/l):perpOf(h);N[j]=S.roll?rotAx(n,h,S.roll):n}
  // the skirt in the floor's frame: the first point outside it, and whether the arm comes out from under it (low) or through its side
  const cy=Math.cos(-(A.yaw+A.spin)),sy=Math.sin(-(A.yaw+A.spin)),sk=A.skK*(1+.12*A.skOpen),zk=1-.35*A.skOpen;let js=0,under=true;
  for(let j=0;j<NP;j++){const d=sub(P[j],A.B),x=d[0]*cy-d[1]*sy-SKX,y=d[0]*sy+d[1]*cy,z=d[2]/zk,inside=z>=0&&z<=22&&Math.hypot(x,y)<skR(z)*sk*.97;
    if(!inside){js=Math.max(0,j-1);under=z<7;break}if(j===NP-1)js=NS}
  return{P,H,HP,R:RR,N,S,js,under}}
// the shading of an arm on the screen, worked out once for all its pieces: screen points, the side of the shadow (lower right), the
// coral belly (β: its angle from the view round the arm, 0 when it faces us: its band on the screen runs from -r cos β to r on its side)
function armScreen(V0,G){const{P,F}=V0,Q=G.P.map(q=>P(q)),NS2=new Array(NP),bel=new Array(NP),ok=new Array(NP);G.Q=Q;
  for(let j=0;j<NP;j++){const a=Q[Math.max(0,j-1)],b=Q[Math.min(NS,j+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);
    let nx=l>1e-4?-dy/l:-.55,ny=l>1e-4?dx/l:-.83;if(nx*.55+ny*.83<0){nx=-nx;ny=-ny}NS2[j]=[nx,ny];ok[j]=l>.45*G.R[j];
    const N=G.N[j],o=P(add(G.P[j],N));bel[j]=Math.atan2((o[0]-Q[j][0])*nx+(o[1]-Q[j][1])*ny,F(N))}
  G.NS2=NS2;G.bel=bel;G.ok=ok;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let j=0;j<NP;j++){const q=Q[j],r=G.R[j];x0=Math.min(x0,q[0]-r);y0=Math.min(y0,q[1]-r);x1=Math.max(x1,q[0]+r);y1=Math.max(y1,q[1]+r)}G.bb=[x0,y0,x1,y1]}
// a point along the arm at u (0 root .. 1 tip): position, radius, belly, heading (between the chain's points)
function armAt(G,u){let j=0;while(j<NS-1&&UP[j+1]<u)j++;const k=cl((u-UP[j])/(UP[j+1]-UP[j]),0,1);
  return{p:lerp3(G.P[j],G.P[j+1],k),r:lerp(G.R[j],G.R[j+1],k),n:nrmS(lerp3(G.N[j],G.N[j+1],k)),h:nrmS(lerp3(G.HP[j],G.HP[j+1],k)),j,k}}
// a band along the arm between two offsets across it (in units of its radius, + toward the shadow), from point a to b: one polygon
function bandPoly(G,a,b,s0,s1){ctx.beginPath();let on=false;const Q=G.Q,N=G.NS2,R=G.R;
  const L=[],Rr=[];const flush=()=>{if(L.length>1){ctx.moveTo(L[0][0],L[0][1]);for(let i=1;i<L.length;i++)ctx.lineTo(L[i][0],L[i][1]);for(let i=Rr.length-1;i>=0;i--)ctx.lineTo(Rr[i][0],Rr[i][1]);ctx.closePath();on=true}L.length=0;Rr.length=0};
  for(let j=a;j<=b;j++){if(!G.ok[j]){flush();continue}const q=Q[j],n=N[j],r=R[j],o0=typeof s0==='function'?s0(j):s0,o1=typeof s1==='function'?s1(j):s1;
    if(o1<=o0){flush();continue}L.push([q[0]+n[0]*r*o0,q[1]+n[1]*r*o0]);Rr.push([q[0]+n[0]*r*o1,q[1]+n[1]*r*o1])}flush();return on}
// one piece of an arm (chain points j0..j1): the outline only of its own segments, the fill one segment further on both sides (so
// pieces drawn at different depths join without a seam, and a piece that comes out of the skirt grows out of it), then inside its fill
// the three tones, the coral belly, the rings on the back, the suckers (lit by the signal), the pearl of light at the head of the signal
function armPiece(V0,G,j0,j1,K,A,o){const Q=G.Q,Rr=G.R,lw=2.6,js=G.js,os=Math.max(j0,js+1),fs=Math.max(js,j0-1),fe=Math.min(NS-1,j1);if(fe<fs)return;
  const po=new Path2D(),pf=new Path2D();let any=false;
  for(let s=os;s<j1;s++){if(G.dead&&(G.dead[s]||G.dead[s+1]))continue;capP(po,Q[s],Rr[s]+lw/2,Q[s+1],Rr[s+1]+lw/2);any=true}
  for(let s=fs;s<=fe;s++){if(G.dead&&(G.dead[s]||G.dead[s+1]))continue;capP(pf,Q[s],Math.max(.35,Rr[s]-lw/2+.1),Q[s+1],Math.max(.35,Rr[s+1]-lw/2+.1))}
  ctx.lineJoin='round';if(any){ctx.fillStyle=INK;ctx.fill(po)}ctx.fillStyle=G.fill;ctx.fill(pf);
  ctx.save();ctx.clip(pf);const a=fs,b=fe+1;
  // the coral belly where it faces us, then the shadow (two steps) and the light over skin and belly alike
  const bl=G.bel;ctx.fillStyle=K.belly.b;if(bandPoly(G,a,b,j=>bl[j]>=0?-Math.cos(bl[j]):-1.2,j=>bl[j]>=0?1.2:Math.cos(bl[j])))ctx.fill();
  ctx.fillStyle=K.belly.l;ctx.globalAlpha*=.55;if(bandPoly(G,a,b,j=>{const c=Math.cos(bl[j]);return Math.abs(bl[j])<PI/2?(bl[j]>=0?-c:-1.2)*.85:2},j=>{const c=Math.cos(bl[j]);return Math.abs(bl[j])<PI/2?(bl[j]>=0?.15:c*.5-.35):1})){ctx.fill()}ctx.globalAlpha/=.55;
  ctx.fillStyle=G.dk;ctx.globalAlpha*=.5;if(bandPoly(G,a,b,.05,1.25))ctx.fill();ctx.globalAlpha/=.5;
  ctx.globalAlpha*=.38;if(bandPoly(G,a,b,.55,1.25))ctx.fill();ctx.globalAlpha/=.38;
  ctx.fillStyle=G.lt;ctx.globalAlpha*=.5;if(bandPoly(G,a,b,-.82,-.32))ctx.fill();ctx.globalAlpha/=.5;
  if(!LOWFX){ctx.fillStyle=`rgba(${K.rimRgb},.32)`;if(bandPoly(G,a,b,j=>-1+1.9/Math.max(2,Rr[j]),j=>-1+3.1/Math.max(2,Rr[j])))ctx.fill()}
  armDetails(V0,G,a,b,K,A,o);ctx.restore()}
// the rings on the back of the raised arms and the suckers (two rows on the belly, at most 8 a row; only those that face us; the budget
// of the drawing goes first to the arm that attacks, then to the raised ones), lit by the signal, the pearl of light at its head
function armDetails(V0,G,a,b,K,A,o){const{P,F}=V0,u0=UP[a],u1=UP[Math.min(NS,b)];
  if(G.rings)for(const u of[.38,.6]){if(u<u0||u>u1)continue;const s=armAt(G,u),n=mul(s.n,-1),f=F(n);if(f<.12)continue;
    const c=add(s.p,mul(n,s.r*.92)),rr=s.r*.42,lit=G.ringLit(.5+.4*u);ringSpot(V0,c,n,rr,K,lit,cl((f-.12)*4,0,1))}
  if(!G.suck)return;const runs=G.runs,pop=G.pop,outer=new Path2D(),inn=new Path2D(),hot=new Path2D();let nOut=0,nHot=0;
  for(let i=0;i<8;i++){const u=.2+.093*i;if(u<u0-.001||u>u1+.001)continue;const s=armAt(G,u);
    let lit=0;for(const r of runs)if(u<=r.u1+.001&&u>=r.u0)lit=Math.max(lit,r.a*(r.u1>=.999?1:sstep(r.u1+.001,r.u1-.05,u)));
    const popped=pop&&(7-i)<pop.f*8-.3;
    for(const sg of[-1,1]){if((G.qn||0)>=G.quota)break;const d=rotAx(s.n,s.h,sg*.48),f=F(d);if(f<.1)continue;G.qn=(G.qn||0)+1;
      const c=add(s.p,mul(d,s.r*.93)),rs=Math.max(1,s.r*.27),t1=s.h,t2=nrm(cross(d,t1)),q=P(c),pa=P(add(c,mul(t1,rs))),pb=P(add(c,mul(t2,rs))),ax=pa[0]-q[0],ay=pa[1]-q[1],bx=pb[0]-q[0],by=pb[1]-q[1];
      const el=(pa2,k)=>{pa2.moveTo(q[0]+ax*k,q[1]+ay*k);for(let m=1;m<=10;m++){const t=m/10*TAU,c2=Math.cos(t),s2=Math.sin(t);pa2.lineTo(q[0]+(ax*c2+bx*s2)*k,q[1]+(ay*c2+by*s2)*k)}pa2.closePath()};
      el(outer,1);nOut++;if(popped)continue;if(lit>.05){el(hot,.62);nHot++;glo(K.sig,q[0],q[1],rs*3.2,.5*lit*f)}else el(inn,.55)}}
  if(nOut){ctx.fillStyle=K.belly.l;ctx.fill(outer);ctx.strokeStyle=K.belly.d;ctx.lineWidth=.8;ctx.stroke(outer);ctx.fillStyle=K.suck;ctx.fill(inn);if(nHot){ctx.fillStyle=K.suckOn;ctx.fill(hot)}}
  // the head of the signal: a pearl of light running toward the tip
  for(const r of runs){if(r.u1>=.995||r.a<.3||r.u1<u0||r.u1>u1)continue;const s=armAt(G,r.u1),q=P(s.p),bq=G.NS2[s.j],bb=G.bel[s.j],off=Math.abs(bb)<PI/2?Math.sin(bb)*.45*s.r:0,c=[q[0]+bq[0]*off,q[1]+bq[1]*off];
    glo(K.sig,c[0],c[1],12,.7*r.a);ctx.fillStyle=`rgba(255,255,255,${(.9*r.a).toFixed(3)})`;ball(c,2.2);ctx.fill()}}
const SUCK={n:0,max:48},RINGS={n:0,max:20};
// a ring of the skin (a dark circle with a light centre; lit magenta in the second phase), flat on the surface at c (normal n)
function ringSpot(V0,c,n,rr,K,lit,al){if(RINGS.n>=RINGS.max||al<=.02)return;RINGS.n++;const{P}=V0,t1=perpOf(n),t2=cross(n,t1),q=P(c),a=P(add(c,mul(t1,rr))),b=P(add(c,mul(t2,rr))),ax=a[0]-q[0],ay=a[1]-q[1],bx=b[0]-q[0],by=b[1]-q[1];
  const pth=k=>{ctx.beginPath();for(let m=0;m<12;m++){const t=m/12*TAU,c2=Math.cos(t),s2=Math.sin(t);ctx.lineTo(q[0]+(ax*c2+bx*s2)*k,q[1]+(ay*c2+by*s2)*k)}ctx.closePath()};
  const a0=ctx.globalAlpha;ctx.globalAlpha=a0*al;
  if(lit>.02){glo(K.ringG,q[0],q[1],rr*3.2,.75*lit);pth(1);ctx.fillStyle=cmix(K1.ringO,K.ringO,lit);ctx.fill();pth(.55);ctx.fillStyle=cmix(K1.ringC,K.ringC,lit);ctx.fill()}
  else{pth(1);ctx.fillStyle=K1.ringO;ctx.fill();pth(.55);ctx.fillStyle=cmix(K1.ringC,K.ringC,K.k2>.5?.35:0);ctx.fill()}
  ctx.globalAlpha=a0}

// ------------------------------------------------------------------ the pool: dark water with foam on its rim, the rings that leave her
// body, the pearl's reflection; ink in the second phase. With o.noWater only the rings
function poolDraw(V0,A,K,o,fx,nr,p){const{P}=V0,c=[A.B[0],A.B[1],0],pk=A.pool.k;
  if(!o.noWater&&pk>.01){const rx=POOL[0]*pk,ry=POOL[1]*pk;
    flatEll(V0,c,rx+4,ry+3.5,0);ctx.fillStyle='rgba(6,8,10,.32)';ctx.fill();
    flatEll(V0,c,rx,ry,0);const q=P(c),g=ctx.createLinearGradient(0,q[1]-ry*.6,0,q[1]+ry*.6);g.addColorStop(0,K.waterL);g.addColorStop(.42,K.water);g.addColorStop(1,K.waterD);ctx.fillStyle=g;ctx.fill();
    if(A.pool.ink>0&&A.pool.inkR<1&&A.k2<1){}   // (the ink of the second phase is in the palette; while it spreads, see below)
    ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
    ctx.save();flatEll(V0,c,rx,ry,0);ctx.clip();
    // the ink spreading from the middle (the Furia)
    if(A.pool.inkR>0&&A.pool.inkR<1){flatEll(V0,c,rx*A.pool.inkR*1.05,ry*A.pool.inkR*1.05,0);ctx.fillStyle=K2.water;ctx.fill()}
    // the sky's light on the far edge, the foam broken along the rim (it turns slowly with the pool)
    flatEll(V0,c,rx*.94,ry*.9,0);ctx.strokeStyle=`rgba(${K.foam},.18)`;ctx.lineWidth=2.4;ctx.stroke();
    if(!LOWFX){const sp=A.pool.spin||0;ctx.strokeStyle=`rgba(${K.foam},.55)`;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();
      for(let i=0;i<14;i++){const t0=i/14*TAU+sp*.3+.2*Math.sin(i*2.3),t1=t0+.18+.08*Math.sin(i*1.7);for(let m=0;m<=3;m++){const t=lerp(t0,t1,m/3),w=P(add(c,[Math.cos(t)*rx*.97,Math.sin(t)*ry*.97,0]));m?ctx.lineTo(w[0],w[1]):ctx.moveTo(w[0],w[1])}}ctx.stroke()}
    // the reflection of the pearl and of the eyes, in front of her
    if(!LOWFX&&A.cut<.5){const w=P(add(c,[34,0,0]));glo(K.refl,w[0],w[1],14,.18+.25*A.pg,7);const w2=P(add(c,[-30,-20,0]));glo(K.refl2,w2[0],w2[1],18,.12,6)}
    // the water rising round her (the Marea) and the swell over her when she comes up (the Agguato), the mound that lifts her
    if(A.pool.rim>0){flatEll(V0,c,rx*.98,ry*.98,0);ctx.strokeStyle=`rgba(${K.foam},${.5*A.pool.rim})`;ctx.lineWidth=2+4*A.pool.rim;ctx.stroke()}
    if(A.pool.swell>0){const g2=ctx.createRadialGradient(q[0],q[1]-4,1,q[0],q[1],38);g2.addColorStop(0,`rgba(${K.refl},${.35*A.pool.swell})`);g2.addColorStop(1,`rgba(${K.refl},0)`);ctx.fillStyle=g2;ctx.fillRect(q[0]-40,q[1]-30,80,60)}
    ctx.restore()}
  // the mound of black water that lifts her (the Marea)
  if(A.pool.mound>0&&!o.noWater){const h=(A.B[2]-12)*.9,pts=[];for(let i=0;i<18;i++){const t=i/18*TAU;pts.push(P(add(c,[Math.cos(t)*44,Math.sin(t)*40,0])))}
    for(let i=0;i<18;i++){const t=i/18*TAU;pts.push(P(add(c,[Math.cos(t)*30,Math.sin(t)*27,h])))}const H=hullE(pts,.05);if(H.length>2){ctx.lineJoin='round';poly(H);
      ctx.fillStyle=grad3(bbox(H),T3(K.waterL,K.water,K.waterD));ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke()}}
  // the rings leaving her body (they stay with o.noWater), the boiling, the currents of foam turning round her
  for(let i=0;i<3;i++){const k=fr(p*nr+i/3),r=40+k*24;flatEll(V0,c,r*1.08,r,0);ctx.strokeStyle=`rgba(${K.foam},${(.42*(1-k)*sstep(0,.15,k)).toFixed(3)})`;ctx.lineWidth=1.4;ctx.stroke()}
  if(fx&&A.pool.boil>0)for(let i=0;i<12;i++){const t=fr(p*3+i*.37),a=i*2.4,rr=12+42*fr(i*.618),w=P(add(c,[Math.cos(a)*rr,Math.sin(a)*rr*.9,0]));ctx.strokeStyle=`rgba(${K.foam},${(.7*A.pool.boil*(1-t)).toFixed(3)})`;ctx.lineWidth=1.1;ball([w[0],w[1]-t*3],1+t*3.2);ctx.stroke()}
  if(fx&&A.pool.swirl>0){ctx.lineCap='round';for(let a=0;a<3;a++){ctx.beginPath();for(let i=0;i<=26;i++){const t=i/26,an=t*TAU*.9+a*TAU/3+(A.pool.spin||0)*.8,r=22+48*t,w=P(add(c,[Math.cos(an)*r,Math.sin(an)*r,0]));i?ctx.lineTo(w[0],w[1]):ctx.moveTo(w[0],w[1])}
    ctx.strokeStyle=`rgba(${K.foam},${(.5*A.pool.swirl).toFixed(3)})`;ctx.lineWidth=1.6;ctx.setLineDash([7,6]);ctx.stroke();ctx.setLineDash([])}}}

// ------------------------------------------------------------------ the skirt: a solid of revolution laid on the water, eight low
// scallops on its hem (over the arms), a wave running round them; the same colour as the skin, only its edge a shade lighter
function skirtPts(F,A,cutW){const zs=[0,4,9,15,22],N=24,sk=A.skK*(1+.12*A.skOpen),zk=1-.35*A.skOpen,ang=A.arms.map(S=>Math.atan2(S.b[1],S.b[0]-SKX)),rows=[];
  for(const z of zs){const row=[];for(let i=0;i<N;i++){const t=i/N*TAU;let r=skR(z)*sk,zz=z*zk;
      if(z===0){let sc=0;for(const a of ang){const d=Math.atan2(Math.sin(t-a),Math.cos(t-a));sc=Math.max(sc,Math.exp(-(d/.22)*(d/.22)))}const wv=Math.sin(2*t-TAU*A.skWave);r=(42+4*sc)*sk+1.1*wv;zz=.7+.6*wv}
      row.push(F.Xf.T([SKX+Math.cos(t)*r,Math.sin(t)*r,zz]))}rows.push(row)}
  return rows}
function cutPts(rows){const out=[],n=rows.length;for(let i=0;i<n;i++){const r=rows[i],m=r.length;for(let j=0;j<m;j++){const a=r[j];if(a[2]>=0)out.push(a);const b=r[(j+1)%m];
    if(a[2]*b[2]<0)out.push(lerp3(a,b,a[2]/(a[2]-b[2])));if(i<n-1){const c=rows[i+1][j%rows[i+1].length];if(a[2]*c[2]<0)out.push(lerp3(a,c,a[2]/(a[2]-c[2])))}}}return out}
function skirtDraw(V0,F,A,K,J){const{P}=V0,rows=skirtPts(F,A),cut=A.cut>0&&A.B[2]<1;let hem=rows[0],up=[];for(let i=1;i<rows.length;i++)up=up.concat(rows[i]);
  let Hs,Hh=null;if(cut){const pts=cutPts(rows);if(pts.length<3)return;Hs=hullE(pts.map(q=>P(q)),.08)}else{Hs=hullE(up.map(q=>P(q)),.08);Hh=hem.map(q=>P(q))}
  if(Hs.length<3)return;const pa=smoothP(Hs);let ph=null;if(Hh){ph=smoothP(Hh)}
  const bb=bbox(Hh?Hs.concat(Hh):Hs);ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=5.6;ctx.stroke(pa);if(ph)ctx.stroke(ph);
  ctx.fillStyle=grad3(bb,K.skin);ctx.fill(pa);if(ph)ctx.fill(ph);
  // the soft shadow of the head on the top of the skirt, the darker hem, the light edge of the hem that faces us, the warm rim
  ctx.save();{const u=new Path2D();u.addPath(pa);if(ph)u.addPath(ph);ctx.clip(u)}
  {const hq=P(F.TU([12,0,22])),g=ctx.createRadialGradient(hq[0],hq[1]+4,2,hq[0],hq[1]+4,30);g.addColorStop(0,'rgba(4,16,20,.42)');g.addColorStop(1,'rgba(4,16,20,0)');ctx.fillStyle=g;ctx.fillRect(hq[0]-32,hq[1]-28,64,64)}
  ctx.restore();
  if(Hh){const fr0=[];for(let i=0;i<hem.length;i++){const t=i/hem.length*TAU,d=F.Xf.Rd([Math.cos(t),Math.sin(t),0]);fr0.push(V0.F(d)>.05?[Hh[i][0],Hh[i][1]-1.4]:null)}
    ctx.strokeStyle=K.hem;ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();let on=false;for(let i=0;i<=fr0.length;i++){const q=fr0[i%fr0.length];if(!q){on=false;continue}on?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);on=true}ctx.stroke()}
  rimC(Hs,.28,K.rimRgb);J.skH=Hs}

// ------------------------------------------------------------------ the mantle and the head (the upper part: their own frame TU)
function mantleOf(A){const t=MTL+A.ml,b=1+A.mb;return{MF:{u:[Math.cos(t),0,Math.sin(t)],v:[0,1,0],w:[-Math.sin(t),0,Math.cos(t)]},MRn:[MR[0]*b*(1-A.msq*.5),MR[1]*b*(1-A.msq*.5),MR[2]*b*(1+A.msq)]}}
// the points of an ellipsoid in rows (to cut it at the water)
function ellRowsT(Cc,Rd,Fr,T,n,m){const rows=[];for(let i=0;i<=n;i++){const a=-PI/2+i/n*PI,z=Math.sin(a),r=Math.cos(a),row=[];if(r<1e-3){row.push(T(ellAt(Cc,Rd,Fr,[0,0,z])));rows.push(row);continue}
  for(let j=0;j<m;j++){const t=j/m*TAU;row.push(T(ellAt(Cc,Rd,Fr,[Math.cos(t)*r,Math.sin(t)*r,z])))}rows.push(row)}return rows}
// how lit a ring is: the second phase (in the palette), the wave of light from the head (w 0) to the tips (w 1), the front that lights or puts
// them out (the Furia, the defeat), a flicker
function ringLitF(A,K,w){const fr2=A.rfront>=1.5?1:sstep(w-.06,w+.06,A.rfront),pu=A.rwave<0?1:.55+.45*Math.max(0,Math.cos(TAU*(A.rwave-w*.6)));return cl(K.ringOn*A.ring*fr2*pu+A.rflick*(1-K.ringOn*.5),0,1)}
function mantleDraw(V0,F,A,K,J){const{P,F:FF}=V0,{MF,MRn}=J.M,top=A.B[2]+MC[2]+MRn[2],bot=A.B[2]+MC[2]-MRn[2];if(top<0)return;
  let pts;if(A.cut>0&&bot<2){const c=cutPts(ellRowsT(MC,MRn,MF,F.TU,8,16));if(c.length<3)return;pts=hullE(c.map(q=>P(q)),.08)}else pts=ellSil(V0,MC,MRn,MF,F.TU,20);
  if(pts.length<3)return;const hp=svol3(V0,pts,K.skin,{lw:2.8,scr:1});J.mH=hp;
  ctx.save();ctx.clip(hp.path);const b=bbox(pts);
  // darker toward its foot, the darker cloud passing down it, the rings, the warts, the wet shine on its top
  {const g=ctx.createLinearGradient(0,b[1]+(b[3]-b[1])*.5,0,b[3]);g.addColorStop(0,'rgba(4,20,26,0)');g.addColorStop(1,'rgba(4,20,26,.4)');ctx.fillStyle=g;ctx.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1])}
  if(A.cloud>0){const m=dirv(.15,lerp(.85,-.25,A.cloudY||0)),c=P(F.TU(ellAt(MC,MRn,MF,m))),r=(b[2]-b[0])*.55,g=ctx.createRadialGradient(c[0],c[1],2,c[0],c[1],r);
    g.addColorStop(0,`rgba(${K.cloud},${(.38*A.cloud).toFixed(3)})`);g.addColorStop(1,`rgba(${K.cloud},0)`);ctx.fillStyle=g;ctx.fillRect(c[0]-r,c[1]-r,2*r,2*r)}
  RINGM.forEach(([az,el,r],i)=>{const m=dirv(az,el),n=F.RdU(ellN(MRn,MF,m)),f=FF(n);if(f<.12)return;const c=F.TU(ellAt(MC,MRn,MF,m));ringSpot(V0,add(c,mul(n,.3)),n,r*A.rsz,K,ringLitF(A,K,.14+.035*i),cl((f-.12)*4,0,1))});
  for(const[az,el,r] of WARTS){const m=dirv(az,el),n=F.RdU(ellN(MRn,MF,m)),f=FF(n);if(f<.2)continue;const q=P(F.TU(ellAt(MC,MRn,MF,m)));ctx.fillStyle=`rgba(${K.wet},${(.35*f).toFixed(3)})`;ball(q,r);ctx.fill();
    ctx.fillStyle=`rgba(4,30,36,${(.25*f).toFixed(3)})`;ball([q[0]+r*.35,q[1]+r*.4],r*.7);ctx.fill()}
  {const q=[b[0]+(b[2]-b[0])*.36,b[1]+(b[3]-b[1])*.2],rx=(b[2]-b[0])*.2,ry=(b[3]-b[1])*.1,g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],rx);g.addColorStop(0,`rgba(${K.wet},.5)`);g.addColorStop(.55,`rgba(${K.wet},.16)`);g.addColorStop(1,`rgba(${K.wet},0)`);
    ctx.fillStyle=g;ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(-.35);ctx.scale(1,ry/rx);ctx.beginPath();ctx.arc(0,0,rx,0,TAU);ctx.fill();ctx.restore()}
  if(A.drip>0){ctx.strokeStyle=`rgba(${K.wet},${(.5*A.drip).toFixed(3)})`;ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<6;i++){const az=-1.4+i*.56,m0=dirv(az,.6),m1=dirv(az+.05,-.1);
    const a=P(F.TU(ellAt(MC,MRn,MF,m0))),c=P(F.TU(ellAt(MC,MRn,MF,m1))),f=FF(F.RdU(ellN(MRn,MF,dirv(az,.2))));if(f<.2)continue;const t=fr(A.dripT+i*.17);ctx.moveTo(a[0],lerp(a[1],c[1],t*.6));ctx.lineTo(a[0]+(c[0]-a[0])*.1,lerp(a[1],c[1],t*.6+.3))}ctx.stroke()}
  ctx.restore();rimC(pts,.3,K.rimRgb)}
// the fold where the mantle meets the head: the near half of the line where the two meet, on the screen (from her left to her right)
function foldOf(V0,F,J){const{MF,MRn}=J.M,N=24,pts=[],inH=q=>{const a=(q[0]-HC[0])/HR[0],b=(q[1]-HC[1])/HR[1],c=(q[2]-HC[2])/HR[2];return a*a+b*b+c*c<1};
  for(let k=0;k<N;k++){const t=k/N*TAU,ct=Math.cos(t),st=Math.sin(t),at=e=>ellAt(MC,MRn,MF,[Math.cos(e)*ct,Math.cos(e)*st,Math.sin(e)]);let lo=-PI/2+.02,hi=.45;
    if(inH(at(hi))||!inH(at(lo)))continue;for(let it=0;it<10;it++){const m=(lo+hi)/2;if(inH(at(m)))lo=m;else hi=m}pts.push(V0.P(F.TU(at(hi))))}
  if(pts.length<6)return null;let il=0,ir=0;for(let i=1;i<pts.length;i++){if(pts[i][0]<pts[il][0])il=i;if(pts[i][0]>pts[ir][0])ir=i}
  const ch=(a,b)=>{const out=[];let i=a;for(let n=0;n<=pts.length;n++){out.push(pts[i]);if(i===b)break;i=(i+1)%pts.length}return out};
  const c1=ch(il,ir),c2=ch(ir,il).reverse(),my=c=>c.reduce((s,q)=>s+q[1],0)/c.length;return my(c1)>=my(c2)?c1:c2}
function headDraw(V0,F,A,K,J,face,ch){const{P,F:FF}=V0,top=A.B[2]+HC[2]+HR[2]+2,bot=A.B[2]+HC[2]-HR[2]-3;if(top<0)return;
  let pts;if(A.cut>0&&bot<2){const c=cutPts(ellRowsT(HC,HR,AXES,F.TU,7,16));if(c.length<3)return;pts=hullE(c.map(q=>P(q)),.08)}else pts=ellSil(V0,HC,HR,AXES,F.TU,20);if(pts.length<3)return;
  const fold=J.fold;ctx.save();
  if(fold){ctx.beginPath();ctx.rect(-1e4,-1e4,2e4,2e4);ctx.moveTo(fold[0][0]-.5,fold[0][1]);for(const q of fold)ctx.lineTo(q[0],q[1]);const e=fold[fold.length-1];ctx.lineTo(e[0]+.5,e[1]);ctx.lineTo(e[0]+.5,e[1]-600);ctx.lineTo(fold[0][0]-.5,fold[0][1]-600);ctx.closePath();ctx.clip('evenodd')}
  const hp=svol3(V0,pts,K.skin,{lw:2.8,scr:1});ctx.save();ctx.clip(hp.path);const b=bbox(pts);
  {const g=ctx.createLinearGradient(0,b[1]+(b[3]-b[1])*.45,0,b[3]);g.addColorStop(0,'rgba(4,20,26,0)');g.addColorStop(1,'rgba(4,20,26,.35)');ctx.fillStyle=g;ctx.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1])}
  // the shadow of the mantle on the top of the head, under the fold
  if(fold){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(4,24,30,.32)';ctx.lineWidth=7;ctx.beginPath();fold.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]+2.5):ctx.moveTo(q[0],q[1]+2.5));ctx.stroke()}
  RINGH.forEach(([az,el,r],i)=>{const m=dirv(az+ch,el),n=F.RdU(ellN(HR,AXES,m)),f=FF(n);if(f<.15)return;const c=F.TU(ellAt(HC,HR,AXES,m));ringSpot(V0,add(c,mul(n,.3)),n,r,K,ringLitF(A,K,.02+.03*i),cl((f-.15)*4,0,1))});
  ctx.restore();rimC(pts,.28,K.rimRgb);ctx.restore();
  // the fold: a dark line with a thread of light under it
  if(fold){ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=`rgba(${K.wet},.3)`;ctx.lineWidth=1.1;ctx.beginPath();fold.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]+1.8):ctx.moveTo(q[0],q[1]+1.8));ctx.stroke();
    ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();fold.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}
  J.hH=pts}
// an eye: amber that fills it inside a thin dark ring, the pupil a bar with round ends, the light up left and a smaller one down right,
// the heavy upper lid leaning down toward the middle of the face (a haughty look), the lower lid a little up; drawn on the surface of
// the head (its own tangent plane), never on its outline
function eyeDraw(V0,F,A,K,sd,ch){const{P,F:FF}=V0,m=nrm(rotZ([EYD[0],sd*EYD[1],EYD[2]],ch)),c=F.TU(ellAt(HC,HR,AXES,m)),n=F.RdU(ellN(HR,AXES,m)),v=FF(n);
  if(v<.1||c[2]<.5)return;const al=cl((v-.1)*5,0,1),t1=nrm(cross([0,0,1],n)),t2=cross(n,t1),q=P(c),pa=P(add(c,mul(t1,EYRX*.94))),pb=P(add(c,mul(t2,-EYRY*.92)));
  const ax=pa[0]-q[0],ay=pa[1]-q[1],bx=pb[0]-q[0],by=pb[1]-q[1],tr=()=>ctx.transform(ax,ay,bx,by,q[0],q[1]),inS=-sd;
  const bl=A.blink,lid=Math.min(1.05,A.lid+.2*A.squint+(1.08-A.lid)*(1-bl)),lo=A.lidLo+.12*A.squint+.25*(1-bl);
  glo(K.eyeG,q[0],q[1],EYRY*2.8,.42*A.eyeGlow*al*sstep(.15,.5,bl));
  const a0=ctx.globalAlpha;ctx.globalAlpha=a0*al;
  ctx.save();tr();ctx.beginPath();ctx.arc(0,0,1.13,0,TAU);ctx.fillStyle=K.eyeR;ctx.fill();ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.clip();
  {const g=ctx.createRadialGradient(-.32,-.4,.05,0,.12,1.12);g.addColorStop(0,K.iris.l);g.addColorStop(.45,K.iris.b);g.addColorStop(1,K.iris.d);ctx.fillStyle=g;ctx.fillRect(-1.1,-1.1,2.2,2.2)}
  ctx.strokeStyle=K.iris.d;ctx.globalAlpha*=.55;ctx.lineWidth=.16;ctx.beginPath();ctx.arc(0,0,.93,0,TAU);ctx.stroke();ctx.globalAlpha=a0*al;
  // the pupil: a pill (narrower aiming, wider laughing, round in fear)
  {const lx=A.look[0]*.2,ly=A.look[1]*.14,rd=A.round,hh=lerp(A.pw/2*(K.k2>.5?.85:1),.3,rd),hw=lerp(.375,.3,rd),cx=lx,cy=ly+.04;ctx.fillStyle=K.pupil;ctx.beginPath();
    if(hw-hh>.01){ctx.arc(cx-(hw-hh),cy,hh,PI/2,PI*1.5);ctx.arc(cx+(hw-hh),cy,hh,-PI/2,PI/2)}else ctx.arc(cx,cy,hh,0,TAU);ctx.closePath();ctx.fill()}
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(-.36,-.42,.21,0,TAU);ctx.fill();ctx.globalAlpha*=.85;ctx.beginPath();ctx.arc(.38,.36,.1,0,TAU);ctx.fill();ctx.globalAlpha=a0*al;
  // the lids
  const yl=x=>-1+2*lid+.24*inS*x,ylo=1-2*lo;ctx.fillStyle=K.lid;ctx.beginPath();ctx.moveTo(-1.2,-1.2);ctx.lineTo(1.2,-1.2);ctx.lineTo(1.2,yl(1.2));ctx.lineTo(-1.2,yl(-1.2));ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-1.2,1.2);ctx.lineTo(1.2,1.2);ctx.lineTo(1.2,ylo);ctx.lineTo(-1.2,ylo);ctx.closePath();ctx.fill();
  ctx.strokeStyle=K.lidL;ctx.lineWidth=.17;ctx.beginPath();ctx.moveTo(-1.1,yl(-1.1));ctx.lineTo(1.1,yl(1.1));ctx.stroke();if(lo>.02){ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(-1.1,ylo);ctx.lineTo(1.1,ylo);ctx.stroke()}
  // a soft light on the lid
  ctx.strokeStyle=`rgba(${K.wet},.25)`;ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(-.7,yl(-.7)-.22);ctx.lineTo(.5,yl(.5)-.22);ctx.stroke();
  ctx.restore();ctx.save();tr();ctx.beginPath();ctx.arc(0,0,1.13,0,TAU);ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=a0}
// the brow over an eye: a fold of skin like a capsule from the inner end (lower) to the outer one, a little round papilla curling up and
// back at its outer end (a V that looks down on you); the far one tucked behind the edge of the head
function browDraw(V0,F,A,K,sd,ch){const{P,F:FF}=V0,e0=.78+.07*A.brow-.07*A.squint,e1=.87+.07*A.brow-.02*A.squint,pts=[],rs=[];
  for(let i=0;i<=4;i++){const k=i/4,m=nrm(dirv(sd*lerp(.24,.8,k)+ch,lerp(e0,e1,k)+.025*Math.sin(k*PI))),c=F.TU(add(ellAt(HC,HR,AXES,m),mul(ellN(HR,AXES,m),1.2)));if(c[2]<.5)return;pts.push(c);rs.push(lerp(1.3,1.6,Math.sin(k*PI*.8+.3)))}
  const e=pts[4],m4=nrm(dirv(sd*.8+ch,e1)),up=F.RdU(ellN(HR,AXES,m4)),bk=F.RdU([-.6,sd*.3,.75]);pts.push(add(e,mul(nrm(add(up,bk)),1.8)));rs.push(1.25);pts.push(add(e,mul(nrm(add(mul(up,.5),bk)),3.3)));rs.push(1.05);
  const Q=pts.map(q=>P(q)),pa=new Path2D(),pf=new Path2D();for(let i=0;i<Q.length-1;i++){capP(pa,Q[i],rs[i]+1,Q[i+1],rs[i+1]+1);capP(pf,Q[i],rs[i]-.5,Q[i+1],rs[i+1]-.5)}
  ctx.fillStyle=INK;ctx.fill(pa);ctx.fillStyle=K.skin.b;ctx.fill(pf);ctx.save();ctx.clip(pf);ctx.strokeStyle=K.skin.l;ctx.lineWidth=1.4;ctx.lineCap='round';lineP(Q.map(q=>[q[0],q[1]-1.1]));ctx.stroke();
  ctx.strokeStyle=K.skin.d;ctx.lineWidth=1.2;lineP(Q.map(q=>[q[0],q[1]+1.2]));ctx.stroke();ctx.restore()}
// the mouth: small and turned down at the corners when shut (haughty); open, a dark oval with the beak's two tips, the only fangs
function mouthDraw(V0,F,A,K,ch){const{P,F:FF}=V0,m=nrm(rotZ(MOD,ch)),c=F.TU(ellAt(HC,HR,AXES,m)),n=F.RdU(ellN(HR,AXES,m)),v=FF(n);if(v<.1||c[2]<.5)return;
  const q=P(c),t1=nrm(cross([0,0,1],n)),a=P(add(c,mul(t1,4.6))),ax=a[0]-q[0],ay=a[1]-q[1],al=cl((v-.1)*4,0,1),j=A.jaw,a0=ctx.globalAlpha;ctx.globalAlpha=a0*al;
  if(j<.1){ctx.fillStyle='rgba(4,20,26,.22)';ctx.beginPath();ctx.ellipse(q[0],q[1]+2.2,Math.hypot(ax,ay)*.8,1.5,Math.atan2(ay,ax),0,TAU);ctx.fill();
    ctx.strokeStyle=K.mouth;ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0]-ax,q[1]-ay+1.4);ctx.quadraticCurveTo(q[0],q[1]-1.3,q[0]+ax,q[1]+ay+1.4);ctx.stroke()}
  else{const h=1.6+5.4*j,w=Math.hypot(ax,ay)*.85,ang=Math.atan2(ay,ax);ctx.save();ctx.translate(q[0],q[1]+h*.45);ctx.rotate(ang);ctx.fillStyle=K.mouth;ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,0,w,h,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.clip();ctx.fillStyle='rgba(120,30,60,.5)';ctx.beginPath();ctx.ellipse(0,h*.6,w*.6,h*.45,0,0,TAU);ctx.fill();
    ctx.fillStyle=K.beak.b;ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-w*.32,-h);ctx.lineTo(w*.32,-h);ctx.lineTo(0,-h+Math.min(h*.95,3.4+h*.25));ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=K.beak.d;ctx.beginPath();ctx.moveTo(-w*.26,h);ctx.lineTo(w*.26,h);ctx.lineTo(0,h-Math.min(h*.8,2.6+h*.2));ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  ctx.globalAlpha=a0}
// the siphon: a short tube on her left side, its dark mouth; it breathes, swells, turns to the hero and lights up for the ink
function siphonDraw(V0,F,A,K){const{P,F:FF}=V0,d=nrmS(lerp3(SID,nrm([.72,.6,-.2]),A.siT)),b=F.TU(add(SIB,mul(d,-2.5))),e=F.TU(add(SIB,mul(d,8))),dw=F.RdU(d);if(e[2]<.5)return;
  const r0=3.6*(1+.3*A.siP),r1=3*(1+.5*A.siP),qa=P(b),qb=P(e),pa=new Path2D(),pf=new Path2D();capP(pa,qa,r0+1.2,qb,r1+1.2);capP(pf,qa,r0-.2,qb,r1-.2);
  ctx.fillStyle=INK;ctx.fill(pa);ctx.fillStyle=cmix(K.skin.b,K.skin.l,.25);ctx.fill(pf);
  if(A.siLit>0){ctx.globalAlpha*=A.siLit;ctx.fillStyle=`rgba(${K.sig},.55)`;ctx.fill(pf);ctx.globalAlpha/=A.siLit;glo(K.sig,qb[0],qb[1],14,.7*A.siLit)}
  const f=FF(dw);if(f>.05){const t1=perpOf(dw),t2=cross(dw,t1),c=add(e,mul(dw,.4)),q=P(c),u=P(add(c,mul(t1,r1*.8))),w=P(add(c,mul(t2,r1*.8)));
    ctx.save();ctx.transform(u[0]-q[0],u[1]-q[1],w[0]-q[0],w[1]-q[1],q[0],q[1]);ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.restore();ctx.fillStyle=A.siLit>.3?cmix(K.siph,K.suckOn,A.siLit):K.siph;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke()}
  rimC([[qa[0]-r0,qa[1]-r0],[qb[0]-r1,qb[1]-r1],[qb[0]+r1,qb[1]+r1],[qa[0]+r0,qa[1]+r0]],.15,K.rimRgb)}

// ------------------------------------------------------------------ the crown of the pond (its frame follows the mantle; in the defeat it
// slips off and floats on the water)
function crownOf(F,A,J){const dt=A.ml,b=1+A.mb,def=q=>add(MC,rotY(mul(sub(q,MC),b),-dt)),o=F.TU(def(CR0.c));
  let E=CR0.E.map(e=>nrm(sub(F.TU(def(add(CR0.c,e))),o)));const s=b;
  if(A.crTilt[0]||A.crTilt[1]){const a1=E[1],a0=E[0];E=E.map(e=>rotAx(rotAx(e,a1,A.crTilt[0]),a0,A.crTilt[1]))}
  let O=o,S=s;
  if(A.crOff>=0){const k=ez(A.crOff),W=[-13,17,1.4+(A.crBob||0)],a=.7+(A.crSpin||0),Ef=[[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0],[0,0,1]];
    O=add(lerp3(o,W,k),[0,0,12*Math.sin(PI*Math.min(1,A.crOff*1.15))]);const E2=E.map((e,i)=>lerp3(e,Ef[i],k)),e3=nrm(E2[2]),e1=nrm(sub(E2[0],mul(e3,dot(E2[0],e3))));E=[e1,cross(e3,e1),e3];S=lerp(s,1,k)}
  const at=q=>[O[0]+(E[0][0]*q[0]+E[1][0]*q[1]+E[2][0]*q[2])*S,O[1]+(E[0][1]*q[0]+E[1][1]*q[1]+E[2][1]*q[2])*S,O[2]+(E[0][2]*q[0]+E[1][2]*q[1]+E[2][2]*q[2])*S];
  const dr=v=>nrmS([E[0][0]*v[0]+E[1][0]*v[1]+E[2][0]*v[2],E[0][1]*v[0]+E[1][1]*v[1]+E[2][1]*v[2],E[0][2]*v[0]+E[1][2]*v[1]+E[2][2]*v[2]]);
  return{o:O,E,s:S,at,dir:dr,free:A.crOff>=1}}
// the ring of woven reed: the half that faces us or the other, two tones, the slanted strokes of the weave, the knot behind
function ringDraw(V0,CF,K,near,cutZ){const{P,F}=V0,N=CR0.N,W=[],V=[];for(let i=0;i<=N;i++){const k=i%N,q=CF.at(CR0.ring[k]);W.push(q);const n=CF.free?CF.dir(nrm([CR0.ring[k][0],CR0.ring[k][1],2])):CF.dir(CR0.nrm[k]);V.push(F(n)>0===near&&q[2]>cutZ)}
  const runs=[];let cur=[];for(let i=0;i<=N;i++){if(V[i])cur.push(P(W[i]));else{if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur);
  // the run that wraps round the start of the ring joins its two ends
  if(runs.length>1&&V[0]&&V[N]){const a=runs.shift(),b=runs.pop();runs.push(b.concat(a.slice(1)))}
  if(!runs.length)return;ctx.lineCap='round';ctx.lineJoin='round';const st=(c,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1])}ctx.stroke()};
  st(INK,5.8);st(K.reed.d,3.6);st(K.reed.b,2.4);ctx.save();ctx.translate(-.4,-.7);st(K.reed.l,1);ctx.restore();
  // the weave: short slanted strokes, one way and the other
  ctx.strokeStyle=K.reedD;ctx.lineWidth=.8;ctx.beginPath();for(const r of runs)for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,s=i%2?1:-1;
    for(const t of[.3,.75]){const m=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];ctx.moveTo(m[0]-ux*1.1-uy*1.4*s,m[1]-uy*1.1+ux*1.4*s);ctx.lineTo(m[0]+ux*1.1+uy*1.4*s,m[1]+uy*1.1-ux*1.4*s)}}ctx.stroke();
  // the knot behind
  const kq=CF.at(CR0.ring[N/2]),kn=CF.free?CF.dir([-1,0,.3]):CF.dir(CR0.nrm[N/2]);if((F(kn)>0)===near&&kq[2]>cutZ){const q=P(add(kq,mul(kn,1)));ctx.fillStyle=K.reed.b;ctx.strokeStyle=INK;ctx.lineWidth=1.3;ball(q,2.6);ctx.fill();ctx.stroke();ctx.fillStyle=K.reed.l;ball([q[0]-.7,q[1]-.8],.9);ctx.fill()}}
// a pond snail: the spire along ax (h tall), the mouth at its foot toward out; three turns of brown bands, an iridescent thread on its lit
// edge; lit from within in the second phase. Cut at the water (the fin)
function snailDraw(V0,b,ax,out,h,r,K,A,cutZ){const{P,F}=V0,w=nrm(ax),u=nrm(sub(out,mul(w,dot(out,w)))),v=cross(w,u),W=q=>[b[0]+u[0]*q[0]*r+v[0]*q[1]*r+w[0]*q[2]*h,b[1]+u[1]*q[0]*r+v[1]*q[1]*r+w[1]*q[2]*h,b[2]+u[2]*q[0]*r+v[2]*q[1]*r+w[2]*q[2]*h];
  let pts=SNPTS.map(W);if(cutZ>-1e8){const top=b[2]+w[2]*h;if(top<cutZ)return;if(Math.min(b[2],top)<cutZ){pts=pts.filter(q=>q[2]>=cutZ);const cr=[];for(let i=0;i<12;i++){const t=i/12*TAU,zz=(cutZ-b[2])/(w[2]*h||1);if(zz<0||zz>1)continue;const rr=snR(zz);cr.push(W([Math.cos(t)*rr,Math.sin(t)*rr,zz]))}pts=pts.concat(cr)}}
  if(pts.length<3)return;const H=hullE(pts.map(q=>P(q)),.05);if(H.length<3)return;const hp=svol3(V0,H,K.shell,{lw:1.7,scr:1});
  ctx.save();ctx.clip(hp.path);
  // the bands of the spiral (only on the side that faces us)
  ctx.strokeStyle=K.band;ctx.lineWidth=1.05;ctx.lineCap='round';ctx.beginPath();let on=false;for(let i=0;i<=40;i++){const s=i/40,z=.14+s*.8,t=s*2.6*TAU+.6,rr=snR(z)+.06,c=[Math.cos(t)*rr,Math.sin(t)*rr,z],n=nrm(add(add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),mul(w,.3)));
    const q=P(W(c));if(F(n)>.05&&W(c)[2]>cutZ){on?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);on=true}else on=false}ctx.stroke();
  // the mouth at the foot, toward out: dark, or lit from within
  const mc=W([.95,0,.13]),fm=F(u);if(fm>.05&&mc[2]>cutZ){const q=P(mc),a=P(W([.95,.55,.13])),c2=P(W([.95,0,.33])),L=K.shellLit*(A.shellK||1);ctx.save();ctx.globalAlpha*=cl(fm*3,0,1);
    ctx.transform(a[0]-q[0],a[1]-q[1],c2[0]-q[0],c2[1]-q[1],q[0],q[1]);ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.restore();ctx.fillStyle=L>.05?cmix('#3a2a20','#ffd0f0',Math.min(1,L*.8)):'#3a2a20';ctx.fill();
    if(L>.05)glo(K.shellG,q[0],q[1],h*.9,.55*Math.min(1.4,L));ctx.restore()}
  if(K.shellLit*(A.shellK||1)>.05){const q=P(W([0,0,.4]));glo(K.shellG,q[0],q[1],h*.8,.25*K.shellLit*(A.shellK||1))}
  ctx.restore();ctx.strokeStyle=`rgba(${K.iri},.6)`;ctx.lineWidth=1;rimC(H,.5,K.iri)}
// the river mussel open like a fan (two valves: dark outside with the lines of growth, mother of pearl inside), the pearl at its hinge
function musselDraw(V0,b,up,fw,K,A,cutZ,pearlQ){const{P,F}=V0,side=nrm(cross(up,fw));
  for(const sd of[-1,1]){const d=nrm(add(mul(up,Math.cos(.45)),mul(side,sd*Math.sin(.45)))),s=nrm(cross(fw,d)),bb=add(b,mul(side,sd*1.2));if(add(bb,mul(d,15))[2]<cutZ)continue;
    const pts=leaf(V0,bb,d,mul(s,sd),15,4.4,K.musI.b,{back:K.musO.b,ell:true,lw:1.6,kl:.3,kd:.2,bend:-.2});
    // the lines of growth (outside) or the sheen of the mother of pearl (inside)
    const n=nrm(cross(d,mul(s,sd))),f=F(n);ctx.save();poly(pts);ctx.clip();ctx.lineWidth=.8;
    if(f<0){ctx.strokeStyle=K.musO.l;for(const k of[.45,.7,.9]){ctx.beginPath();for(let i=0;i<=8;i++){const t=-1+i/4,q=P(add(add(bb,mul(d,15*k*(1-.12*t*t))),mul(s,sd*4.4*k*t*.9)));i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke()}}
    else{ctx.strokeStyle=`rgba(${K.iri},.7)`;ctx.lineWidth=1.1;ctx.beginPath();for(let i=0;i<=8;i++){const t=-1+i/4,q=P(add(add(bb,mul(d,14*(1-.12*t*t))),mul(s,sd*4*t*.9)));i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke();
      const g=P(add(bb,mul(d,7)));ctx.fillStyle='rgba(255,255,255,.25)';ball([g[0]-1,g[1]-1],2.6);ctx.fill()}ctx.restore()}
  // the pearl of the pond: it breathes, flashes before every move, trembles when the arms are stuck
  const pc=add(add(b,mul(fw,3.2)),mul(up,2.4));if(pc[2]<cutZ)return;let q=P(pc);if(A.ptr>0){const t=A.ptrT||0;q=[q[0]+.8*A.ptr*Math.sin(TAU*3.5*t),q[1]+.5*A.ptr*Math.sin(TAU*3.5*t+1.3)]}pearlQ.q=q;
  const r=5.5,gl=A.pg+A.pf;glo(K.pearlG,q[0],q[1],r*2.6+10*A.pf,.35+.45*gl);
  ctx.fillStyle=INK;ball(q,r+1.3);ctx.fill();ctx.fillStyle=softBall(q,r,K.pearl,.2,.22);ball(q,r);ctx.fill();
  {const g=ctx.createRadialGradient(q[0],q[1],r*.3,q[0],q[1],r);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,`rgba(${K.k2>.5?'255,170,230':'170,210,255'},.35)`);ctx.fillStyle=g;ball(q,r);ctx.fill()}
  if(A.pf>0){ctx.fillStyle=`rgba(255,255,255,${(.8*A.pf).toFixed(3)})`;ball(q,r*.7);ctx.fill()}
  ctx.fillStyle='#ffffff';ball([q[0]-r*.35,q[1]-r*.38],r*.3);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ball([q[0]+r*.32,q[1]+r*.3],r*.14);ctx.fill()}
// the pink water lily pinned like a brooch (half open; wide open and shining in the second phase; white at the end of the defeat)
function flowerDraw(V0,c,n,K,A,r,open){const{P,F}=V0;let u=perpOf(n);const v=cross(n,u),f=F(n),pet=A.flWhite>0?cmix(K.petal,'#fff6fa',A.flWhite):K.petal,petD=A.flWhite>0?cmix(K.petalD,'#f0d8e6',A.flWhite):K.petalD;
  if(K.fOpen>.3&&A.flWhite<.5){const q=P(c);glo('255,140,220',q[0],q[1],r*2.6,.45*K.fOpen)}
  const lift=lerp(.75,.18,open),L=[];for(let i=0;i<7;i++){const a=i/7*TAU+.2,d=nrm(add(mul(n,Math.sin(lift)),mul(add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),Math.cos(lift)))),s=nrm(cross(n,d)),tip=add(c,mul(d,r));L.push({d,s,dd:V0.D(tip)})}
  L.sort((a,b)=>a.dd-b.dd);for(const e of L)leaf(V0,c,e.d,e.s,r,2.6,pet,{back:petD,ell:true,lw:1.2,kl:.4,kd:.15});
  for(let i=0;i<5;i++){const a=i/5*TAU+.6,d=nrm(add(mul(n,Math.sin(lift+.4)),mul(add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),Math.cos(lift+.4)))),s=nrm(cross(n,d));leaf(V0,c,d,s,r*.62,1.9,petD,{back:petD,ell:true,lw:1,kl:.35,kd:.2})}
  const h=P(add(c,mul(n,1.6)));ctx.strokeStyle=INK;ctx.lineWidth=1.1;ball(h,2.1);ctx.fillStyle=softBall(h,2.1,K.heart,.4,.2);ctx.fill();ctx.stroke()}
// a tuft of algae: two ribbons hanging from the ring and swaying like springs (their own frame: down in the room, out from the crown)
function algaDraw(V0,b,outW,K,A,sd){const sw=LOWFX?0:A.algae,o=A.algaOut||0;
  for(const[L,da,w] of[[18,0,2.2],[13.5,.35,1.8]]){let d=nrm(add(mul([0,0,-1],1-o*.85),mul(outW,.28+o*1.1)));d=rotAx(d,[0,0,1],sd*(da+.25*sw));d=rotAx(d,nrm(cross(d,[0,0,1])),.3*sw*(da?1:-1));
    const s=nrm(cross(d,[0,0,1]));leaf(V0,add(b,mul(s,da*2)),d,s,L,w,K.alga,{back:K.algaD,lw:1.3,bend:.55+.2*sw,kl:.3,kd:.2})}}

// ------------------------------------------------------------------ the water cuts an arm: the points under it are not drawn, the one
// next to the water moves to where the arm goes in, and there a collar of foam
function waterCut(g){const P=g.P;let lo=1e9;for(const q of P)lo=Math.min(lo,q[2]);g.dead=null;g.cuts=null;if(lo>=-.2)return;
  const dead=new Array(NP).fill(false),cuts=[],P2=P.slice();
  for(let j=0;j<NP;j++){if(P[j][2]>=0)continue;const pa=j>0&&P[j-1][2]>=0,pb=j<NS&&P[j+1][2]>=0;
    if(pa){const a=P[j-1],b=P[j],k=a[2]/(a[2]-b[2]);P2[j]=lerp3(a,b,k);cuts.push({c:P2[j],r:g.R[j],j})}else if(pb){const a=P[j+1],b=P[j],k=a[2]/(a[2]-b[2]);P2[j]=lerp3(a,b,k);cuts.push({c:P2[j],r:g.R[j],j})}else dead[j]=true}
  g.P=P2;g.dead=dead;g.cuts=cuts}
function collar(V0,c,r,K,dark){flatEll(V0,[c[0],c[1],0],r+2.2,(r+2.2)*.92,0);ctx.fillStyle=dark||K.water;ctx.fill();ctx.strokeStyle=`rgba(${K.foam},.75)`;ctx.lineWidth=1.4;ctx.stroke()}
// the budget of the suckers (48 a drawing): first the arm that attacks, then the raised ones, then the others
function suckBudget(V0,G,A){const pr=G.map((g,i)=>({g,w:g.runs.length?3:A.hi[i]>.3||g.rings?2:1})).sort((a,b)=>b.w-a.w);let left=SUCK.max;
  for(const{g} of pr){let n=0;for(let i=0;i<8;i++){const u=.2+.093*i;if(u<UP[g.js]||(g.dead&&g.dead[Math.min(NS,Math.round(u*NS))]))continue;const s=armAt(g,u);for(const sg of[-1,1])if(V0.F(rotAx(s.n,s.h,sg*.48))>=.1)n++}g.quota=Math.min(n,left);left-=g.quota}}

// ------------------------------------------------------------------ the effects of the moves, on the water and in the air
function fxDraw(V0,F,A,K,J,L,e){const{P,D}=V0,t=e.t,G=J.G,B0=[A.B[0],A.B[1],0];
  const tip=i=>G[i].P[NS],atU=(i,u)=>armAt(G[i],u).p,drop=(q,r,a)=>{ctx.fillStyle=`rgba(${K.foam},${a.toFixed(3)})`;ball(q,r);ctx.fill()};
  const ring=(c,r,a,w)=>{flatEll(V0,[c[0],c[1],0],r,r*.92,0);ctx.strokeStyle=`rgba(${K.foam},${a.toFixed(3)})`;ctx.lineWidth=w||1.4;ctx.stroke()};
  const splashAt=(c,s,n)=>{ring(c,(6+16*t)*s,.7*(1-t));for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=(4+14*t)*s,z=Math.sin(Math.min(1,t*1.25)*PI)*(10+8*((i*.37)%1))*s;drop(P([c[0]+Math.cos(a)*d,c[1]+Math.sin(a)*d,z]),1.6*(1-.4*t),.85*(1-t*t))}};
  const k=e.k;
  if(k==='vwave')L.add(-9e5,()=>{const ap=e.fin?[B0[0]+14,B0[1],0]:[B0[0]+62,B0[1],0],ln=e.fin?34:30;for(const sd of[-1,1]){const pts=[];for(let i=0;i<=6;i++){const u=i/6;pts.push(P([ap[0]-u*ln,ap[1]+sd*u*ln*.8,0]))}
    ctx.strokeStyle=`rgba(${K.foam},.45)`;ctx.lineWidth=1.6;ctx.setLineDash([5,4]);ctx.lineDashOffset=-t*18;lineP(pts);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0}});
  else if(k==='ring')L.add(-8.5e5,()=>{const c=e.at?add(B0,F.Xf.Rd(e.at)):atU(e.arm,e.u==null?1:e.u);ring(c,(e.r||12)*(.3+.7*t),.75*(1-t))});
  else if(k==='drip'){const c0=tip(e.arm),z=c0[2]-90*t*t;if(z>0)L.add(1e6,()=>{const q=P([c0[0],c0[1],z]);ctx.fillStyle=`rgba(${K.foam},.9)`;ctx.beginPath();ctx.moveTo(q[0],q[1]-3.2);ctx.quadraticCurveTo(q[0]+1.8,q[1]+.5,q[0],q[1]+1.6);ctx.quadraticCurveTo(q[0]-1.8,q[1]+.5,q[0],q[1]-3.2);ctx.fill()});
    else{const tt=cl((t-Math.sqrt(c0[2]/90))*2.5,0,1);if(tt<1)L.add(-8.5e5,()=>ring([c0[0],c0[1]],3+8*tt,.7*(1-tt),1.2))}}
  else if(k==='splashline'){const g=G[e.arm];L.add(1e5+D(tip(e.arm)),()=>{for(let i=0;i<7;i++){const u=.3+i*.115,c=armAt(g,Math.min(1,u)).p,tt=cl(t*1.3-i*.04,0,1);if(tt<=0||tt>=1)continue;
      const base=[c[0],c[1],0];ring(base,5+12*tt,.6*(1-tt));for(let m=0;m<3;m++){const a=m*2.1+i,d=4+10*tt,z=Math.sin(tt*PI)*(9+4*m);drop(P([base[0]+Math.cos(a)*d,base[1]+Math.sin(a)*d,z]),1.5,.85*(1-tt))}
      ctx.fillStyle=`rgba(70,52,40,${(.8*(1-tt)).toFixed(3)})`;const mq=P([base[0]+Math.cos(i*1.7)*(6+8*tt),base[1]+Math.sin(i*1.7)*(6+8*tt),Math.sin(tt*PI)*6]);ball(mq,1.4);ctx.fill()}})}
  else if(k==='pop'){const s=armAt(G[e.arm],.2+.093*(7-e.n));L.add(1e5+D(s.p),()=>{const c=[s.p[0],s.p[1],0];ring(c,2+7*t,.8*(1-t),1.1);drop(P([c[0],c[1],2+9*Math.sin(t*PI)]),1.3,.9*(1-t))})}
  else if(k==='spit'){const c=J.siE;if(!c)return;L.add(1e6,()=>{for(let i=0;i<4;i++){const u=cl(t*1.2-i*.06,0,1);if(u<=0||u>=1)continue;const q=P(add(c,[4*u,(i-1.5)*3*u,4+22*u]));ctx.fillStyle=`rgba(${K.inkRgb},${(.85*(1-u)).toFixed(3)})`;ball(q,2.4+4.5*u);ctx.fill()}
    for(let i=0;i<5;i++){const u=cl(t*1.4-.1,0,1),a=i*1.3,q=P(add(c,[Math.cos(a)*10*u,Math.sin(a)*10*u,8+18*u-26*u*u]));ctx.fillStyle=`rgba(${K.inkRgb},${(1-u).toFixed(3)})`;ball(q,1.2);ctx.fill()}})}
  else if(k==='bubbles'){L.add(e.siph?1e6:-8e5,()=>{const n=e.wide?10:5;for(let i=0;i<n;i++){const u=fr(t*2+i*.29);let c;if(e.siph&&J.siE)c=add(J.siE,[0,0,u*16]);else{const a=i*2.4,r=18+36*fr(i*.618);c=[B0[0]+Math.cos(a)*r,B0[1]+Math.sin(a)*r*.9,0]}
    const q=P(c);ctx.strokeStyle=`rgba(${K.foam},${(.75*(1-u)*sstep(0,.1,t)*(1-sstep(.85,1,t))).toFixed(3)})`;ctx.lineWidth=1;ball([q[0],q[1]-(e.siph?0:u*4)],1+u*2.6);ctx.stroke()}})}
  else if(k==='sibub'){const c=J.siE;if(!c)return;L.add(1e6,()=>{const q=P(add(c,[2*t,0,3+14*t])),r=1.2+2*t;ctx.strokeStyle=`rgba(${K.foam},${(.9*(1-sstep(.8,1,t))).toFixed(3)})`;ctx.lineWidth=1;ball(q,r);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ball([q[0]-r*.35,q[1]-r*.35],.5);ctx.fill()})}
  else if(k==='splash'){const g=G[e.arm],c=g.cuts&&g.cuts.length?g.cuts[0].c:atU(e.arm,e.u||.7);L.add(1e5+D(c),()=>splashAt(c,1,8))}
  else if(k==='suck')L.add(-8.5e5,()=>{for(let i=0;i<3;i++){const u=fr(t*2.5+i/3),r=60-38*u;ring(B0,r,.55*u*(1-sstep(.85,1,t)),1.6)}});
  else if(k==='trail')L.add(-8e5,()=>{for(let i=0;i<6;i++){const u=fr(t+i/6),q=P([B0[0]-6-34*u,B0[1]+Math.sin(i*2.3)*8,0]);ctx.strokeStyle=`rgba(${K.foam},${(.6*(1-u)).toFixed(3)})`;ctx.lineWidth=1;ball([q[0],q[1]-2*u],1+2*u);ctx.stroke()}});
  else if(k==='column'){const h=96*ez(cl(t/.28,0,1))*(1-ez(sstep(.45,1,t))),r=36+8*t;if(h<1)return;
    const cyl=front=>{const pts=[];for(let i=0;i<=16;i++){const a=front?i/16*PI:PI+i/16*PI;pts.push(P(add(B0,[Math.cos(a)*r,Math.sin(a)*r,0])))}for(let i=16;i>=0;i--){const a=front?i/16*PI:PI+i/16*PI;pts.push(P(add(B0,[Math.cos(a)*r*.9,Math.sin(a)*r*.9,h])))}
      ctx.save();ctx.globalAlpha*=front?.28:.45;poly(pts);ctx.fillStyle=`rgba(${K.foam},1)`;ctx.fill();ctx.restore()};
    L.add(-6e5,()=>cyl(0));L.add(1.5e5,()=>{cyl(1);for(let i=0;i<10;i++){const a=i/10*TAU,u=cl(t*1.4-.2,0,1),q=P(add(B0,[Math.cos(a)*(r+10*u),Math.sin(a)*(r+10*u),h+6*Math.sin(u*PI)-30*u*u]));drop(q,1.8,.8*(1-u))}})}
  else if(k==='slap'){L.add(1e5,()=>{const ids=e.hands?[0,1]:[0,1,2,3,4,5,6,7];for(const i of ids){const c=tip(i);splashAt([c[0],c[1],0],.8,5)}})}
  else if(k==='ringsplash')L.add(-8.4e5,()=>{const r=40+80*t;ring(B0,r,.75*(1-t),2.2*(1-t)+.8);for(let i=0;i<14;i++){const a=i/14*TAU,q=P(add(B0,[Math.cos(a)*r,Math.sin(a)*r*.92,Math.sin(Math.min(1,t*1.4)*PI)*10]));drop(q,1.6,.8*(1-t))}});
  else if(k==='spray'){L.add(1e6,()=>{for(let i=0;i<8;i++){const c=tip(i),u=t;for(let m=0;m<2;m++){const a=Math.atan2(c[1]-B0[1],c[0]-B0[0])+(m-.5)*.6,q=P(add(c,[Math.cos(a)*14*u,Math.sin(a)*14*u,14*u-20*u*u]));drop(q,1.4,.8*(1-u))}}})}
  else if(k==='bubstring'){const c=J.siE;if(!c)return;L.add(1e6,()=>{for(let i=0;i<6;i++){const u=fr(t*2+i/6),q=P(add(c,[3+18*u,-2*u,1+3*Math.sin(u*PI)]));ctx.strokeStyle=`rgba(${K.foam},${(.8*sstep(0,.1,t)*(1-sstep(.8,1,t))).toFixed(3)})`;ctx.lineWidth=.9;ball(q,.8+1.2*u);ctx.stroke()}})}
  else if(k==='bigbub'){const c=J.siE;if(!c)return;L.add(1e6,()=>{const q=P(add(c,[22,-2,4]));if(t<.83){const r=1.5+7*sstep(0,.83,t);ctx.strokeStyle=`rgba(${K.foam},.85)`;ctx.lineWidth=1.2;ball(q,r);ctx.stroke();ctx.fillStyle=`rgba(${K.foam},.12)`;ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';ball([q[0]-r*.4,q[1]-r*.4],r*.18+.3);ctx.fill()}
    else{const u=(t-.83)/.17;for(let i=0;i<8;i++){const a=i/8*TAU;drop([q[0]+Math.cos(a)*(8+6*u),q[1]+Math.sin(a)*(8+6*u)],1,.9*(1-u))}}})}
  else if(k==='snap'){const c=atU(e.arm,.85);L.add(1e6,()=>{for(let i=0;i<7;i++){const a=i/7*TAU,q=P(add(c,[Math.cos(a)*12*t,Math.sin(a)*12*t,8*t-14*t*t]));drop(q,1.5,.85*(1-t))}})}
  else if(k==='pearlstar')L.add(2e6,()=>{const q=J.pearl&&J.pearl.q;if(!q)return;const a=(1-t)*(t<.2?t/.2:1),r=4+14*t;ctx.strokeStyle=`rgba(255,255,255,${a.toFixed(3)})`;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<4;i++){const an=i/4*TAU+.4;ctx.moveTo(q[0]+Math.cos(an)*3,q[1]+Math.sin(an)*3);ctx.lineTo(q[0]+Math.cos(an)*r,q[1]+Math.sin(an)*r)}ctx.stroke();glo(K.pearlG,q[0],q[1],20,.7*a)});
  else if(k==='inkcloud')L.add(-8e5,()=>{const a=(t<.35?sstep(0,.35,t):1-sstep(.35,1,t))*.85;for(let i=0;i<8;i++){const an=i/8*TAU+t,r=6+t*30,c=add(B0,[Math.cos(an)*r*.7,Math.sin(an)*r*.6,0]);flatEll(V0,c,10+t*14,(10+t*14)*.9,0);ctx.fillStyle=`rgba(${K.inkRgb},${a.toFixed(3)})`;ctx.fill()}});
  else if(k==='plop')L.add(-8.4e5,()=>{const W=[-13,17,0];splashAt(W,.9,8)});
  else if(k==='lastbub')L.add(1e6,()=>{const q=P([-9,14,2+12*t]),r=1.4+1.5*t;ctx.strokeStyle=`rgba(${K.foam},${(1-sstep(.8,1,t)).toFixed(3)})`;ctx.lineWidth=1;ball(q,r);ctx.stroke()});}

// ------------------------------------------------------------------ the model
function octopus2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';p=cl(+p||0,0,1);const V0=V(face),{P,D,F:FF}=V0,A=oPose(anim,p,o),fxo=fxOn(o);
  if(o.z)A.B[2]+=o.z/sc;A.ptrT=p*DUR[anim];A.dripT=p*DUR[anim]*1.5;
  const K=pal(A.k2,A.pale),F=frames(A),J={M:mantleOf(A)},ch=C3K.cheat(face,.3),deep=A.B[2];
  SUCK.n=0;RINGS.n=0;GL=[];ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const L=[];L.add=(d,f,x2)=>L.push(Object.assign({d,f},x2||{}));
  // ---------------- the pool (and the shadow, when there is no water)
  if(o.noWater){const q=P(A.B[0],A.B[1],0);shadow(q[0],q[1],56,30*KR(),.3)}
  L.add(-1e7,()=>poolDraw(V0,A,K,o,fxo,Math.max(1,Math.round(DUR[anim]/1.5)),p));
  // ---------------- the arms: their geometry, the cuts of the water, the shading; each in three pieces at their own depth
  const G=A.arms.map((S,i)=>{const g=armGeo(S,F,A);g.i=i;g.rings=S.kind==='cobra'||S.kind==='throne';g.suck=true;g.runs=A.runs.filter(r=>r.i===i);g.pop=A.pops&&A.pops.i===i?A.pops:null;g.ringLit=w=>ringLitF(A,K,w);
    const fk=sstep(0,-.7,FF(F.Xf.Rd(nrmS([S.b[0],S.b[1],0]))))*.3;g.fill=fk>0?cmix(K.skin.b,K.skin.d,fk):K.skin.b;g.dk=K.skin.d;g.lt=K.skin.l;waterCut(g);armScreen(V0,g);return g});
  J.G=G;suckBudget(V0,G,A);
  const sRef=F.Xf.T([SKX,0,10]),uRef=F.X.T([-2,0,45]);
  G.forEach((g,i)=>{for(let pi=0;pi<3;pi++){const[a0,b0]=PIECE[pi],a=Math.max(a0,g.js),b=b0;if(b<=a)continue;let ref=[0,0,0],n=0,live=false;for(let j=a;j<=b;j++){ref=add(ref,g.P[j]);n++;if(!g.dead||!g.dead[j])live=true}if(!live)continue;ref=mul(ref,1/n);
    if(A.hi[i]>0)ref=lerp3(ref,g.P[NS],A.hi[i]);const dRel=D(ref)-D(lerp3(sRef,uRef,sstep(15,45,ref[2]))),back=(pi===0||a<3)&&g.under||dRel<=0;
    L.add((back?-1e5:1e5)+D(ref),null,{arm:i,j0:a0,j1:b0})}});
  // ---------------- the body: skirt, mantle, head (cut at the fold), the face, the siphon, the crown
  const hidden=deep<-150;
  if(!hidden&&deep+22>0)L.add(0,()=>skirtDraw(V0,F,A,K,J));
  if(deep+MC[2]+MR[2]>0){J.fold=foldOf(V0,F,J);L.add(100,()=>mantleDraw(V0,F,A,K,J))}
  if(deep+HC[2]+HR[2]>0){L.add(200,()=>headDraw(V0,F,A,K,J,face,ch));
    for(const sd of[-1,1]){const m=nrm(dirv(sd*.52+ch,.84)),nb=F.RdU(ellN(HR,AXES,m)),fb=FF(nb);if(fb<-.25)continue;L.add(fb>.05?206:195,()=>browDraw(V0,F,A,K,sd,ch))}
    L.add(205,()=>{mouthDraw(V0,F,A,K,ch);for(const sd of[-1,1])eyeDraw(V0,F,A,K,sd,ch)});
    {const ns=F.RdU(nrm([-.1,1,-.15])),fs=FF(ns);J.siE=F.TU(add(SIB,mul(nrmS(lerp3(SID,nrm([.72,.6,-.2]),A.siT)),8.5)));L.add(fs>-.05?210:190,()=>siphonDraw(V0,F,A,K))}
    if(A.inkRun>0)L.add(220,()=>inkRunDraw(V0,F,A,K,J))}
  // the crown: its ring and pieces at their depth on the mantle (the far ones before it); floating after the defeat
  J.CF=crownOf(F,A,J);J.pearl={};const CF=J.CF,cutZ=A.cut>0?0:-1e9;
  {const fin=A.fin>0&&A.fin<.99&&deep<-60,CL=fin?[]:L,add2=(d,f)=>CL.push({d,f});
    add2(CF.free?400:50,()=>ringDraw(V0,CF,K,false,cutZ));add2(CF.free?401:300,()=>ringDraw(V0,CF,K,true,cutZ));
    ORN.forEach((g,gi)=>{const c=crownAt(g.t),nW=CF.free?CF.dir([c.out[0],c.out[1],.6]):CF.dir(c.n),near=FF(nW)>0,base=CF.at(c.q),dd=(CF.free?402:near?305:45)+gi*.01;
      if(g.k==='snail'){const axL=nrm(add(mul([0,0,1],Math.cos(g.tilt)),mul(c.out,Math.sin(g.tilt))));add2(dd,()=>snailDraw(V0,add(base,mul(CF.dir(axL),-1.2)),CF.dir(axL),CF.dir(c.out),g.h*(1+A.mb*.4),g.r,K,A,cutZ))}
      else if(g.k==='mussel')add2(CF.free?403:FF(CF.dir(c.n))>-.35?306:44,()=>musselDraw(V0,add(base,CF.dir([0,0,1.5])),CF.dir([0,0,1]),CF.dir(c.out),K,A,cutZ,J.pearl));
      else if(g.k==='flower'){const q2=sub(c.q,[0,0,3.2]),nn=nrm(add(c.n,mul(c.out,.3)));add2(dd,()=>{const cc=CF.at(add(q2,mul(nn,1)));if(cc[2]>cutZ)flowerDraw(V0,cc,CF.dir(nn),K,A,7,lerp(K.fOpen,1,A.flWhite))})}
      else if(g.k==='alga')add2(CF.free?399:near?310:40,()=>{if(base[2]>cutZ+3)algaDraw(V0,base,CF.dir(c.out),K,A,Math.sign(g.t))})});
    if(fin){const q=P(CF.o);L.add(300,()=>fadeDraw(()=>{CL.sort((a,b)=>a.d-b.d);for(const e of CL)e.f();eyesUnder(V0,F,A,K)},q,90,A.fin))}}
  // the eyes under the water, the tip of the hand that taps (the entrance)
  if(A.eyesU>0&&!(A.fin>0&&A.fin<.99&&deep<-60))L.add(-8e5,()=>eyesUnder(V0,F,A,K));
  if(A.tip)L.add(-7e5,()=>tipDraw(V0,A,K));
  if(fxo)for(const e of A.fx)fxDraw(V0,F,A,K,J,L,e);
  // ---------------- draw (pieces of the same arm one after the other are drawn as one), the lights, the halo of the pearl
  L.sort((a,b)=>a.d-b.d);
  for(let i=0;i<L.length;i++){const e=L[i];if(o.dbgArms&&(e.arm==null?o.dbgNoBody:!o.dbgArms.includes(e.arm)))continue;if(e.arm==null){e.f();continue}let j1=e.j1;while(i+1<L.length&&L[i+1].arm===e.arm&&L[i+1].j0===j1){j1=L[i+1].j1;i++}
    const g=G[e.arm];armPiece(V0,g,e.j0,j1,K,A,o);if(g.cuts)for(const c of g.cuts)if(c.j>=e.j0&&c.j<=j1)collar(V0,c.c,c.r,K)}
  glowFlush();
  if(A.halo>0&&!LOWFX){const q=P(add(CF.o,mul(CF.dir([0,0,1]),18)));glo(K.pearlG,q[0],q[1]-8,46,.55*A.halo,64);glo('255,255,255',q[0],q[1],18,.5*A.halo);glowFlush()}
  GL=null;ctx.restore()}
// the light of the pearl running down her left side to the siphon (the ink): only the stretches that face us
function inkRunDraw(V0,F,A,K,J){const{P,F:FF}=V0,{MF,MRn}=J.M,k=A.inkRun,al=A.inkA==null?1:A.inkA;if(al<=.01)return;
  const path=[];for(let i=0;i<=10;i++){const u=i/10;let c,n;if(u<.6){const m=dirv(lerp(.25,1.25,u/.6),lerp(.5,-.05,u/.6));c=ellAt(MC,MRn,MF,m);n=ellN(MRn,MF,m)}else{const m=dirv(lerp(1.15,1.3,(u-.6)/.4),lerp(.45,.05,(u-.6)/.4));c=ellAt(HC,HR,AXES,m);n=ellN(HR,AXES,m)}
    path.push({q:P(F.TU(add(c,mul(n,.8)))),v:FF(F.RdU(n)),u})}
  const runs=[];let cur=[];for(let i=0;i<path.length;i++){const s=path[i];if(s.u<=k+.001&&s.v>.02)cur.push(s.q);else{if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur);
  ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';ctx.lineJoin='round';for(const[w,c] of[[3.4,`rgba(${K.sig},.5)`],[1.6,K.suckOn],[.7,'#ffffff']]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){ctx.moveTo(r[0][0],r[0][1]);for(const q of r)ctx.lineTo(q[0],q[1])}ctx.stroke()}
  if(k<.99){const s=path[Math.min(10,Math.round(k*10))];if(s.v>.02){glo(K.sig,s.q[0],s.q[1],12,.7*al);ctx.fillStyle='#ffffff';ball(s.q,2);ctx.fill()}}ctx.restore()}
// the two amber lights of her eyes under the water (with the bar of the pupil), brighter when they rise
function eyesUnder(V0,F,A,K){const{P}=V0,a=Math.min(1,A.eyesU),b=Math.max(0,A.eyesU-1);for(const sd of[-1,1]){const m=nrm([EYD[0],sd*EYD[1],EYD[2]]),c=F.TU(ellAt(HC,HR,AXES,m)),q=P([c[0],c[1],0]),s=1+.35*A.eyeTop;
  glo(K.eyeG,q[0],q[1],16*s,(.45+.4*b)*a);ctx.fillStyle=`rgba(255,190,90,${(.85*a).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],3.6*s,1.9*s,0,0,TAU);ctx.fill();
  ctx.fillStyle=`rgba(255,240,200,${(.7*a).toFixed(3)})`;ctx.beginPath();ctx.ellipse(q[0]-.6,q[1]-.4,1.4*s,.7*s,0,0,TAU);ctx.fill();ctx.fillStyle=`rgba(22,11,6,${(.8*a).toFixed(3)})`;ctx.fillRect(q[0]-1.7*s,q[1]-.35,3.4*s,.7)}}
// the tip of a hand coming out of the water and tapping it, impatient (the entrance)
function tipDraw(V0,A,K){const T=A.tip,h=T.k,tap=T.tap,S=SH({kind:'hand',b:[44,10,-16+14*h],L:28,rb:4.6,k:[dirv(.5,1.35),dirv(.5,1.2),dirv(.4,.7-.6*tap),dirv(.3,.2-.8*tap)],c:{ax:[0,0,-1],ang:.6*PI,u0:.75,pw:1.5},vb:[1,0,0]});
  const F0=frames({B:[0,0,0],lean:0,roll:0,yaw:0,s:0,spin:0,hy:0,hp:0,hr:0}),g=armGeo(S,F0,{B:[0,0,0],yaw:0,spin:0,skK:0,skOpen:0},true);g.js=0;g.rings=false;g.suck=true;g.runs=[];g.pop=null;g.quota=4;g.fill=K.skin.b;g.dk=K.skin.d;g.lt=K.skin.l;
  waterCut(g);armScreen(V0,g);armPiece(V0,g,0,NS,K,A,{});if(g.cuts)for(const c of g.cuts)collar(V0,c.c,c.r,K)}

reg('octopus2',{n:'La Piovra della Palude',g:'boss',sc:1,p2:true,an:MV.slice(),dur:Object.assign({},DUR),lab:Object.assign({},LAB)},octopus2);
// «prima e dopo»: the drawing of today (once the game puts this model in place of N3.octopus, N3.octopus is the new one)
{const OLD=N3.octopus,M0=N3.meta.octopus;if(OLD&&M0)N3.meta.octopus2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}

// ------------------------------------------------------------------ for the game: the pieces of her attacks, with the same look
// N3.octopus2Arm(x, y, k, a, sc, o): one of her arms bursting out of the floor (the Gabbia). (x, y) the point on the floor, a the angle in
// the room toward which it lashes and its suckers face (it is drawn with V(a)). k: 0-.62 the floor boils (a dark wet stain growing to r
// 14, five cracks, bubbles from the cracks); .62-.68 it bursts out breaking the stone (a ring of chips, a splash) and rises whole (54
// tall, r 9 at the root and 2 at the tip, the tip curled); .68-.84 it stands and sways a little, the suckers lit toward a; .84-.90 it
// lashes (bends 75° toward a); .90-1 back down into the hole: the ring of broken stone with the water stays. o.p2 (magenta suckers and
// rings), o.ink (out of a pool of ink: dark drops, a violet rim), o.seed (varies the bend and the sway)
N3.octopus2Arm=function(x,y,k,a,sc,o){sc=sc||1;o=o||{};k=cl(+k||0,0,1);const V0=V(a==null?PI/2:a),{P}=V0,K=pal(o.p2?1:0,0),sd=o.seed||0,s1=Math.sin(sd*12.9898)*.5,t=G&&G.t||0;
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const st=k<.62?ez(k/.62):1,rS=14*st,out=k>=.62,ink=!!o.ink,fx=!LOWFX;
  // the wet stain (or the pool of ink) and its cracks
  if(rS>.5){flatEll(V0,[0,0,0],rS*1.15,rS,0);ctx.fillStyle=ink?'rgba(29,19,48,.85)':'rgba(10,26,30,.6)';ctx.fill();if(ink){ctx.strokeStyle='rgba(150,80,200,.7)';ctx.lineWidth=1.4;ctx.stroke()}
    ctx.strokeStyle='rgba(12,10,10,.75)';ctx.lineWidth=1.3;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<5;i++){const an=i/5*TAU+s1,L2=rS*(1.05+.35*((i*.37+sd)%1));let q=P([0,0,0]);ctx.moveTo(q[0],q[1]);
      for(let m=1;m<=3;m++){const r=L2*m/3,w=.25*Math.sin(i*3+m*2);q=P([Math.cos(an+w)*r,Math.sin(an+w)*r,0]);ctx.lineTo(q[0],q[1])}}ctx.stroke();
    if(fx&&!out)for(let i=0;i<5;i++){const u=fr(k*6+i*.23),an=i/5*TAU+s1,q=P([Math.cos(an)*rS*.6,Math.sin(an)*rS*.6,0]);ctx.strokeStyle=`rgba(${K.foam},${(.7*(1-u)*st).toFixed(3)})`;ctx.lineWidth=1;ball([q[0],q[1]-u*3],.8+u*2);ctx.stroke()}}
  // the broken stone round the hole
  if(out){const ru=ez(sstep(.62,.68,k));for(let i=0;i<9;i++){const an=i/9*TAU+s1,r=13+3*Math.sin(i*2.1),z=k<.7?Math.sin(sstep(.62,.7,k)*PI)*5:0,q=P([Math.cos(an)*(r+4*(1-ru)),Math.sin(an)*(r+4*(1-ru)),z]);
      ctx.fillStyle=i%2?'#6f6658':'#5a5246';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-2.6,q[1]+1);ctx.lineTo(q[0]-.6,q[1]-2.2);ctx.lineTo(q[0]+2.4,q[1]-1);ctx.lineTo(q[0]+1.6,q[1]+1.8);ctx.closePath();ctx.fill();ctx.stroke()}
    flatEll(V0,[0,0,0],9,8,0);ctx.fillStyle=ink?'#1d1330':'#173f44';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}
  // the arm
  if(out&&k<1){const up=k<.68?ez(sstep(.62,.68,k)):k<.9?1:1-ez(sstep(.9,1,k)),lash=k<.84?0:k<.9?ez(sstep(.84,.9,k)):1-ez(sstep(.9,.96,k)),sw=k>.68&&k<.84?.08*Math.sin(TAU*(k-.68)/.16*1.5+sd):0;
    const L0=54,S0=SH({kind:'cobra',b:[0,0,-L0*(1-up)-2],L:L0+4,rb:9,k:[dirv(0,1.52),dirv(0,1.5+sw),dirv(PI,1.45-sw*1.4),dirv(PI,1.3)],c:{ax:[0,1,0],ang:-.9*PI,u0:.72,pw:1.4},vb:[1,0,0]});
    const S=lash>0?bendS(S0,[0,1,0],[0,.35*lash,.75*lash,1.3*lash]):S0;
    const F0=frames({B:[0,0,0],lean:0,roll:0,yaw:0,s:0,spin:0,hy:0,hp:0,hr:0}),g=armGeo(S,F0,{B:[0,0,0],yaw:0,spin:0,skK:0,skOpen:0});g.js=0;g.rings=true;g.suck=true;
    g.runs=k>.66&&k<.92?[{i:0,u0:0,u1:1,a:1}]:[];g.pop=null;g.quota=16;g.ringLit=()=>o.p2?1:0;g.fill=K.skin.b;g.dk=K.skin.d;g.lt=K.skin.l;waterCut(g);armScreen(V0,g);
    const A0={hi:[0],runs:[]};SUCK.n=0;RINGS.n=0;const gl=GL;GL=[];armPiece(V0,g,0,NS,K,A0,o);if(g.cuts)for(const c of g.cuts)collar(V0,c.c,Math.max(6,c.r),K,ink?'#1d1330':'#173f44');glowFlush();GL=gl;
    if(fx&&k<.72){const u=(k-.62)/.1;for(let i=0;i<8;i++){const an=i/8*TAU,q=P([Math.cos(an)*(8+14*u),Math.sin(an)*(8+14*u),Math.sin(u*PI)*14]);ctx.fillStyle=ink?`rgba(40,24,60,${1-u})`:`rgba(${K.foam},${1-u})`;ball(q,1.6);ctx.fill()}}}
  ctx.restore()};
// N3.octopus2Pad(x, y, k, sc, o): the water lily of the Marea Nera (r 20, the pink flower of her crown, the rim shining a light gold green:
// «here you are safe»). k: 0-.12 it comes up out of a bubble with a splash; .12-.85 it floats (up and down 1.5); .85-1 it sinks with
// bubbles. o.lift (0..1): the wave lifts it (6 up, leaning .15 toward o.wa, the room angle of the wave); o.on: the hero stands on it
N3.octopus2Pad=function(x,y,k,sc,o){sc=sc||1;o=o||{};k=cl(+k||0,0,1);const V0=V(PI/2),{P}=V0,K=pal(0,0),t=G&&G.t||0,lf=cl(o.lift||0,0,1),wa=o.wa||0;
  const app=k<.12?ez(k/.12):1,sink=k>.85?ez((k-.85)/.15):0,s=app*(1-.35*sink),z=1.5*Math.sin(TAU*k*2.2)+6*lf-3*sink,tilt=.15*lf;if(s<=.02){ctx.restore&&0;return}
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalAlpha*=1-sink*.8;
  const n=nrm([Math.cos(wa)*Math.sin(tilt),Math.sin(wa)*Math.sin(tilt),1]),u=perpOf(n),v=cross(n,u),R=20*s,c=[0,0,z];
  // the soft shadow, the leaf with its notch and its veins, the shining rim
  flatEll(V0,[0,0,0],R*1.05,R*1.02,0);ctx.fillStyle='rgba(0,0,0,.22)';ctx.fill();
  const pts=[];for(let i=0;i<=30;i++){const a=.28+i/30*(TAU-.56);pts.push(P(add(c,add(mul(u,Math.cos(a)*R),mul(v,Math.sin(a)*R)))))}pts.push(P(c));
  const on=o.on?1:0;glo('200,255,170',P(c)[0],P(c)[1],R*1.6,(.35+.35*on)*app);
  ctx.lineJoin='round';poly(pts);ctx.fillStyle=grad3(bbox(pts),T3('#9ad46a','#5fae4a','#3f7a2a'));ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
  ctx.save();poly(pts);ctx.clip();ctx.strokeStyle='#3f7a2a';ctx.lineWidth=1;for(let i=1;i<8;i++){const a=.28+i/8*(TAU-.56);seg(P(c),P(add(c,add(mul(u,Math.cos(a)*R*.88),mul(v,Math.sin(a)*R*.88)))));ctx.stroke()}ctx.restore();
  ctx.strokeStyle=`rgba(200,255,170,${(.7+.3*on).toFixed(2)})`;ctx.lineWidth=1.6+on;poly(pts.slice(0,-1).map(q=>[q[0],q[1]+.2]));ctx.stroke();
  const A0={flWhite:0};flowerDraw(V0,add(c,mul(n,1.2)),n,K,A0,7*s,.5);
  if(!LOWFX&&(k<.12||k>.85)){const w=k<.12?k/.12:(k-.85)/.15;for(let i=0;i<6;i++){const a=i/6*TAU,q=P([Math.cos(a)*(R*.6+10*w),Math.sin(a)*(R*.6+10*w),Math.sin(w*PI)*8]);ctx.fillStyle=`rgba(${K.foam},${(.8*(1-w)).toFixed(3)})`;ball(q,1.5);ctx.fill()}}
  ctx.restore()};
// N3.octopus2Blob(x, y, z, k, sc, o): a ball of ink in flight (r 7): dark glossy violet, a light violet shine and a thread of water green; it
// rolls (k·TAU·1.5) and leaves two droplets. o.p2: the magenta shine. The shadow on the floor is the game's
N3.octopus2Blob=function(x,y,z,k,sc,o){sc=sc||1;o=o||{};k=+k||0;const r=7,a=k*TAU*1.5,hi=o.p2?'255,120,220':'176,140,230';ctx.save();ctx.translate(x,y-(z||0)*sc);ctx.scale(sc,sc);
  // two droplets behind (where it comes from: up and back on the screen)
  ctx.fillStyle='#2a1f40';ctx.strokeStyle=INK;ctx.lineWidth=.9;for(const[d,rr] of[[r*1.5,r*.35],[r*2.3,r*.22]]){const an=-PI/2-.5+.3*Math.sin(a);ball([Math.cos(an)*d,Math.sin(an)*d],rr);ctx.fill();ctx.stroke()}
  if(!LOWFX)shine(o.p2?'255,90,220':'130,90,200',0,0,r*2.4,.35);
  ctx.lineWidth=1.6;ctx.strokeStyle=INK;ball([0,0],r);const g=ctx.createRadialGradient(-r*.35,-r*.4,1,0,0,r*1.1);g.addColorStop(0,'#5a4380');g.addColorStop(.5,'#2a1f40');g.addColorStop(1,'#120c1e');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.save();ball([0,0],r-.6);ctx.clip();ctx.strokeStyle='rgba(120,230,210,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,r*.8,r*.3,a,0,PI);ctx.stroke();
  ctx.fillStyle=`rgba(${hi},.55)`;ctx.beginPath();ctx.ellipse(-r*.3,-r*.38,r*.38,r*.2,-.6,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ball([-r*.42,-r*.45],r*.12);ctx.fill();ctx.restore();ctx.restore()};
// N3.octopus2Info: the moments of her moves (p of the model), for the brain
N3.octopus2Dbg={oPose,frames,armGeo,rest,mantleOf,foldOf,crownOf,skirtPts,CR0,ORN,crownAt,headAt,UP,NS};
N3.octopus2Info={dur:DUR,impact:{slam:.60,slam2:[.45,.85],rise:.63,tide:.55,enter:.75},flash:{slam:.035,slam2:[.035,.47],ink:.035,cage:.035,whirl:.04,taunt:.12,rage:[.6,.76],enter:.665,die:.9},
  pops:POPS,ink:{3:INK3,5:INK5},cage:{plant:.33,push:.712,out:.85},whirl:{star:.15,stop:.86},sink:{under:.70,fin:.85},rise:{burst:.63,slap:.80},tide:{up:.3,slam:.55,down:.8},
  taunt:{flash:.12,pop:.62,taps:[.75,.85],call:[.38,.56]},enter:{eyes:.17,taps:[.31,.35,.39],snaps:[.52,.60],pearl:.665,slap:.75,roar:[.82,.92]},die:{clou:.55,pearl:.90,bubble:.95},
  siphon:[-2,28,30],radius:34};
})();
