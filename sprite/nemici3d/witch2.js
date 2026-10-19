// LA STREGA DELLE RADICI rifatta: «la Signora delle Radici» (Denis, 15 ottobre: «rivisita tutti i boss, rendili più creepy e fatti meglio
// sia da fermi che nelle animazioni», «un po' più cupi», «falli possenti, belli, fighi, che diano timore nello sfidarli»; 16 ottobre, dopo il
// Golem: «sì, fai gli altri 12»). Secoli fa ha piantato il suo trono nel santuario e ha lasciato che il bosco le crescesse addosso: una
// strega altissima (tre volte e mezzo l'eroe), dritta e calma, che non cammina ma scivola, tirata da un groviglio di radici vive che le fanno
// da piedi e da strascico. Abito di corteccia coperto di foglie verde bosco, un collare di foglie a ventaglio dietro la testa, il viso
// pallido di betulla con due occhi verde menta sotto palpebre prugna, un alto cappello a punta storto intrecciato di rami coi boccioli viola
// accesi e tre lanterne di spore appese alla tesa (la corona di rami e le lanterne della Strega di prima). Sul petto il Seme del Bosco, il
// suo cuore: prima di ogni incantesimo la sua luce corre nelle vene della corteccia fino alla parte che colpirà (il suo avviso). A metà vita
// arriva il suo autunno: foglie color brace, corna di rami sul cappello con lanterne arancioni, quattro radici guardiane che le girano
// intorno nel pavimento. Resta della Classica: forme tonde da giocattolo, colori pieni, occhi con la lucina, due zannette, niente sangue.
// Metodo dello spaventapasseri: scheletro 3D proiettato con V(face), braccia a due ossa (ik), testa e cappello con la loro telecamera,
// ordine di disegno dalla posa di riposo (i quattro volumi grandi, gonna, corsetto, testa e cappello, e ogni altro pezzo davanti o dietro
// a ciascuno secondo il piano del suo contorno: fuori da un volume convesso quel lato cambia solo lontano dal contorno, così niente salta
// girando); dipinta come la lanterna (tre toni, bordo caldo, bagliori morbidi solo dove contano). L'abito è di foglie larghe a scaglie
// (mai a mandorla, che sembrano occhi), tre giri che si coprono come tegole; il collare è un ventaglio di foglie tonde dietro la testa.
// Costo: le foglie di un giro, le radici dello strascico e dei piedi, le guardiane, le ciocche di dietro si dipingono insieme (pochi
// tratti per tutte), così il disegno sta sotto 1,3 ms come il Golem (tests/foglio3d.js).
// Mosse: idle, walk, hit, hand (Mano del Bosco), spiral (Spirale di Spine), sink / fin / rise (Sprofonda, la punta del cappello, Riaffiora),
// fix (Cappello storto), roots (Radici della Cripta), sow (Il Giardino), rite (Rito delle Rune, fase 2), rage (L'autunno), taunt (Presa in
// giro), enter (Il Risveglio), die (L'ultimo autunno).
// Opzioni: o.p2 (seconda fase), o.noFx (niente effetti della mossa), o.z (altezza data dal gioco), o.mv (direzione del moto rispetto a dove
// guarda, nel walk), o.orb e o.guard (radici guardiane), o.hands (1 destra, -1 sinistra, 2 tutte e due), o.spin (verso della Spirale),
// o.neat (in rise il cappello resta dritto), o.k (in fin, quanto cappello esce). Con LOWFX niente bagliori, foglie che cadono, luce da
// sotto sul viso; due giri di foglie sulla gonna, capelli e lanterne fermi, dita a due pezzi.
// Disegni per il gioco con lo stesso aspetto: N3.witchThorn, witchSeed, witchHand, witchBump, witchRoot, witchHusk, witchSprout, witchLeaf
// (anche coi nomi N3.witch2Thorn, ...). Nel gioco prende il nome 'witch' (src/js/89-strega-nuova.js).
(()=>{const C=C3,{TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,V,ball,seg,tri,hull,rim,run,cmix,poly,bbox,rotX,rotY,rotZ,look,blink,keys,
  sstep,hitK,ellAt,ellN,AXES,chain,eyes,floor,parts,reg,shine,smooth,chull,ik,revo,revoAt,surfLine,glowTop,wa}=C;
const{shadeLimb}=C.R;

// ------------------------------------------------------------------ helpers (as in golem2.js)
const fxOn=o=>!o.noFx&&!LOWFX;
const cheat=(face,k)=>{const dv=Math.atan2(Math.sin(Math.PI/2-face),Math.cos(Math.PI/2-face));return k*Math.sin(dv)*cl((Math.PI-Math.abs(dv))/(Math.PI/2),0,1)};
const pls=(p,c,w)=>{const d=Math.abs(p-c)/(w/2);return d>=1?0:.5+.5*Math.cos(d*Math.PI)};
const rise=(p,a,b,c,d)=>sstep(a,b,p)*(1-sstep(c,d,p));
const flash=(p,a,w)=>p<a||p>a+w?0:1-(p-a)/w;
const trem=(p,a,b,hz,dur)=>{const w=Math.min(.03,(b-a)/3);return sstep(a,a+w,p)*(1-sstep(b-w,b,p))*Math.sin((p-a)*TAU*hz*dur)};
const ga=(k,f)=>{if(k<=.004)return;const a0=ctx.globalAlpha;ctx.globalAlpha=a0*Math.min(1,k);f();ctx.globalAlpha=a0};
const strokeRuns=(runs,col,w)=>{if(!runs.length)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const r of runs){ctx.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)ctx.lineTo(r[i][0],r[i][1])}ctx.stroke()};
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const kv=(K,p)=>keys(K,p);
// rotations as matrices (the columns are where the axes go): lean (the top goes forward), roll (the top goes to its right), yaw (the front
// goes to its right). A frame turns points round a pivot, moves them, then hands them to its parent (the waist to the hem, the head to the
// neck): every piece hangs on a point of the body, so nothing comes off as it turns
function mkM(lean,roll,yaw){const f=v=>rotZ(rotX(rotY(v,lean||0),-(roll||0)),yaw||0);return[f([1,0,0]),f([0,1,0]),f([0,0,1])]}
const mv3=(M,v)=>[M[0][0]*v[0]+M[1][0]*v[1]+M[2][0]*v[2],M[0][1]*v[0]+M[1][1]*v[1]+M[2][1]*v[2],M[0][2]*v[0]+M[1][2]*v[1]+M[2][2]*v[2]];
const mmul=(A,B)=>[mv3(A,B[0]),mv3(A,B[1]),mv3(A,B[2])];
function frm(pv,M,off,par){const lo=mv3(M,pv),o0=[pv[0]+off[0]-lo[0],pv[1]+off[1]-lo[1],pv[2]+off[2]-lo[2]],Mf=par?mmul(par.M,M):M,of=par?add(mv3(par.M,o0),par.o):o0;
  const a=Mf[0],b=Mf[1],c=Mf[2];return{M:Mf,o:of,T:q=>[a[0]*q[0]+b[0]*q[1]+c[0]*q[2]+of[0],a[1]*q[0]+b[1]*q[1]+c[1]*q[2]+of[1],a[2]*q[0]+b[2]*q[1]+c[2]*q[2]+of[2]],
    Rd:v=>[a[0]*v[0]+b[0]*v[1]+c[0]*v[2],a[1]*v[0]+b[1]*v[1]+c[1]*v[2],a[2]*v[0]+b[2]*v[1]+c[2]*v[2]]}}

// ------------------------------------------------------------------ painting (as in golem2.js): three tones, smooth outlines, the warm rim
function grad3(b,T){const w=b[2]-b[0],h=b[3]-b[1],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,R=Math.max(w,h,2)*.64,g=ctx.createRadialGradient(cx-w*.24,cy-h*.26,R*.06,cx-w*.04,cy+h*.04,R);
  g.addColorStop(0,T.l);g.addColorStop(.34,T.b);g.addColorStop(.9,T.d);return g}
const SILT={};
function ellSil(V0,C0,Rd,F,T,n){F=F||AXES;n=n||14;const tp=T||(q=>q),o=V0.P(tp(C0));let sxx=0,sxy=0,syy=0;
  for(let k=0;k<3;k++){const ax=k===0?F.u:k===1?F.v:F.w,r=Rd[k],q=V0.P(tp([C0[0]+ax[0]*r,C0[1]+ax[1]*r,C0[2]+ax[2]*r])),dx=q[0]-o[0],dy=q[1]-o[1];sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy}
  const l11=Math.sqrt(Math.max(sxx,1e-6)),l21=sxy/l11,l22=Math.sqrt(Math.max(syy-l21*l21,1e-6));let tb=SILT[n];if(!tb){tb=SILT[n]=[];for(let i=0;i<n;i++){const t=(i+.5)/n*TAU;tb.push([Math.cos(t),Math.sin(t)])}}
  const out=new Array(n);for(let i=0;i<n;i++){const c=tb[i][0],s=tb[i][1];out[i]=[o[0]+l11*c,o[1]+l21*c+l22*s]}return out}
const CRP={};const crp=(q,r,n)=>{n=n||8;let t=CRP[n];if(!t){t=CRP[n]=[];for(let i=0;i<n;i++)t.push([Math.cos(i/n*TAU),Math.sin(i/n*TAU)])}return t.map(c=>[q[0]+c[0]*r,q[1]+c[1]*r])};
function hullE(pts,E){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];E=E||0;
  for(const q of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=E)lo.pop();lo.push(q)}
  for(let i=pts.length-1;i>=0;i--){const q=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=E)up.pop();up.push(q)}
  lo.pop();up.pop();return lo.concat(up)}
function smoothP(pts){const n=pts.length,pa=new Path2D();pa.moveTo((pts[n-1][0]+pts[0][0])/2,(pts[n-1][1]+pts[0][1])/2);
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];pa.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}pa.closePath();return pa}
function rimP(pts,al){const[x0,y0,x1,y1]=bbox(pts),cx=(x0+x1)/2,cy=(y0+y1)/2,Rr=Math.max(x1-x0,y1-y0)/2,g=ctx.createLinearGradient(cx-Rr*.8,cy-Rr*.8,cx+Rr*.15,cy+Rr*.15),kx=1-1.9/Math.max(1,(x1-x0)/2),ky=1-1.9/Math.max(1,(y1-y0)/2);
  g.addColorStop(0,wa(al));g.addColorStop(1,wa(0));ctx.beginPath();for(const q of pts)ctx.lineTo(cx+(q[0]-cx)*kx,cy+(q[1]-cy)*ky);ctx.closePath();ctx.strokeStyle=g;ctx.lineWidth=1.3;ctx.stroke()}
// a convex volume from screen points: the smooth hull filled in three tones, the thick outline, the warm rim; returns the hull (with .path)
function svol(pts,T,o){o=o||{};const H=o.hull?pts:hullE(pts,.08);if(H.length<3)return H;ctx.lineJoin='round';const pa=H.path=smoothP(H);ctx.fillStyle=o.fill||grad3(bbox(H),T);ctx.fill(pa);
  if(!o.noInk){ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2.6;ctx.stroke(pa)}if(o.rim)rimP(H,o.rim);return H}
// how lit a face with the unit normal n is (the warm light from the upper left, a little from the front)
function lit(V0,n){const q=V0.P(n);return cl(.55+.45*(-.55*q[0]-.7*q[1])+.2*V0.F(n),0,1)}
const tone=(T,k)=>{let r=T._r;if(!r){r=T._r=[];for(let i=0;i<=16;i++){const u=i/16;r.push(u<.5?cmix(T.d,T.b,u*2):cmix(T.b,T.l,u*2-1))}}return r[Math.round(cl(k,0,1)*16)]};
// a limb's shading across it: from the lit side (upper left) through the base to the dark side
function limbGrad(qa,qb,r,T){let nx=-(qb[1]-qa[1]),ny=qb[0]-qa[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx+ny>0){nx=-nx;ny=-ny}const mx=(qa[0]+qb[0])/2,my=(qa[1]+qb[1])/2;
  if(l<r*.6){nx=-.7;ny=-.7}const g=ctx.createLinearGradient(mx+nx*r,my+ny*r,mx-nx*r,my-ny*r);g.addColorStop(0,T.l);g.addColorStop(.42,T.b);g.addColorStop(1,T.d);return g}
// a soft limb (a chain of capsules: every outline, then every fill) painted in three tones across it, the dark side and the warm light
// a capsule round two screen circles added to the current path (all of them filled at once: the same turning, so they join)
function hullAdd(a,ra,b,rb){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<=Math.abs(ra-rb)+.01){const q=ra>=rb?a:b,r=Math.max(ra,rb);ctx.moveTo(q[0]+r,q[1]);ctx.arc(q[0],q[1],r,0,TAU);return}
  const an=Math.atan2(dy,dx),f=Math.acos(cl((ra-rb)/d,-1,1));ctx.moveTo(a[0]+Math.cos(an+f)*ra,a[1]+Math.sin(an+f)*ra);ctx.arc(a[0],a[1],ra,an+f,an+TAU-f);ctx.arc(b[0],b[1],rb,an-f,an+f);ctx.closePath()}
function limb3(V0,pts3,rs,T,o){o=o||{};const P2=pts3.map(q=>V0.P(q)),n=P2.length,lw=o.lw||2.4;if(n<2)return P2;
  ctx.fillStyle=INK;ctx.beginPath();for(let i=0;i<n-1;i++)hullAdd(P2[i],rs[i]+lw/2,P2[i+1],rs[i+1]+lw/2);ctx.fill();
  ctx.fillStyle=o.flat?cmix(T.b,T.l,.45):limbGrad(P2[0],P2[n-1],Math.max(rs[0],rs[n-1])*1.2,T);ctx.beginPath();for(let i=0;i<n-1;i++)hullAdd(P2[i],Math.max(.3,rs[i]-lw/2+.1),P2[i+1],Math.max(.3,rs[i+1]-lw/2+.1));ctx.fill()
  if(!o.noShade){const n=P2.length,N2=[];for(let i=0;i<n;i++){const a=P2[Math.max(0,i-1)],b=P2[Math.min(n-1,i+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx+ny<0){nx=-nx;ny=-ny}N2.push([nx,ny])}
    ctx.lineCap='round';ctx.lineJoin='round';for(const[k,col,wk,ofk] of[[0,o.dark||'rgba(20,8,4,.34)',.62,.36],[1,wa(o.al||.2),.3,-.5]]){ctx.strokeStyle=col;ctx.beginPath();let w=0;
      for(let i=0;i<n;i++){const r=Math.max(.3,rs[i]-lw/2);if(r<1.4)continue;const q=[P2[i][0]+N2[i][0]*r*ofk,P2[i][1]+N2[i][1]*r*ofk];w+=r;if(i&&rs[i-1]-lw/2>=1.4)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1])}
      if(w>0){ctx.lineWidth=Math.max(.6,w/n*wk);ctx.stroke()}}}
  return P2}
// puffs round a 3D point (k 0..1: spreading and fading)
function dust(V0,c,k,n,r,rgb,al){if(k<0||k>=1)return;for(let i=0;i<n;i++){const a=i/n*TAU+.4,d=r*(.4+k*.9),q=V0.P(add(c,[Math.cos(a)*d,Math.sin(a)*d,k*6+(i%2)*2]));ctx.fillStyle=`rgba(${rgb||'150,130,120'},${(al||.5)*(1-k)})`;ball(q,2.2+k*4);ctx.fill()}}

// ------------------------------------------------------------------ flat pieces: one path made once, drawn through the projection of its two
// axes (the camera is parallel, so a flat piece projects exactly with an affine map and its outline stays as thick)
const ALM=[['M',0,0],['Q',.4,2,1,0],['Q',.4,-2,0,0]];
// the round petal of the collar (no lance point: nothing may look like an ear)
const PET=[['M',0,0],['C',.02,.9,.55,1.18,.86,.86],['C',1.03,.64,1.06,.24,1,0],['C',1.06,-.24,1.03,-.64,.86,-.86],['C',.55,-1.18,.02,-.9,0,0]];
// the serrated leaf of the autumn collar
const SER=(()=>{const N=6,w=u=>Math.sin(Math.PI*Math.pow(u,.75))*1.02,o=[['M',0,0]];for(let i=1;i<=N*2;i++){const u=i/(N*2);o.push(['L',u,w(u)*(i%2?1.12:.78)])}for(let i=N*2-1;i>0;i--){const u=i/(N*2);o.push(['L',u,-w(u)*(i%2?1.12:.78)])}return o})();
const KC=.5523;const CIRC=[['M',1,0],['C',1,KC,KC,1,0,1],['C',-KC,1,-1,KC,-1,0],['C',-1,-KC,-KC,-1,0,-1],['C',KC,-1,1,-KC,1,0]];
// a little flame (a candle on a fingertip), a teardrop (buds, the seed): pointing up
const FLM=[['M',0,-1],['C',.55,-.45,.62,.35,0,.62],['C',-.62,.35,-.55,-.45,0,-1]];
const TEAR=[['M',0,-1.4],['C',.5,-.85,.95,-.15,.95,.25],['C',.95,.75,.52,1,0,1],['C',-.52,1,-.95,.75,-.95,.25],['C',-.95,-.15,-.5,-.85,0,-1.4]];
// the leaf of the gown and of the sleeves: a broad ovate leaf (a round base, the widest at .44, a point), never an almond (that reads as an eye)
const OVL=[['M',0,0],['C',.02,.62,.2,1.02,.44,1],['C',.68,.98,.88,.5,1,0],['C',.88,-.5,.68,-.98,.44,-1],['C',.2,-1.02,.02,-.62,0,0]];
// a flat shape added to a Path2D through an affine map (many shapes, one fill)
function traceTo(pa,sh,a,b,c,d,e,f){for(const k of sh){if(k[0]==='M')pa.moveTo(a*k[1]+c*k[2]+e,b*k[1]+d*k[2]+f);else if(k[0]==='L')pa.lineTo(a*k[1]+c*k[2]+e,b*k[1]+d*k[2]+f);
  else if(k[0]==='Q')pa.quadraticCurveTo(a*k[1]+c*k[2]+e,b*k[1]+d*k[2]+f,a*k[3]+c*k[4]+e,b*k[3]+d*k[4]+f);else pa.bezierCurveTo(a*k[1]+c*k[2]+e,b*k[1]+d*k[2]+f,a*k[3]+c*k[4]+e,b*k[3]+d*k[4]+f,a*k[5]+c*k[6]+e,b*k[5]+d*k[6]+f)}pa.closePath()}
function trace(sh,a,b,c,d,e,f,noBegin){if(!noBegin)ctx.beginPath();const X=(x,y)=>a*x+c*y+e,Y=(x,y)=>b*x+d*y+f;
  for(const k of sh){if(k[0]==='M')ctx.moveTo(X(k[1],k[2]),Y(k[1],k[2]));else if(k[0]==='L')ctx.lineTo(X(k[1],k[2]),Y(k[1],k[2]));else if(k[0]==='Q')ctx.quadraticCurveTo(X(k[1],k[2]),Y(k[1],k[2]),X(k[3],k[4]),Y(k[3],k[4]));
    else ctx.bezierCurveTo(X(k[1],k[2]),Y(k[1],k[2]),X(k[3],k[4]),Y(k[3],k[4]),X(k[5],k[6]),Y(k[5],k[6]))}ctx.closePath()}
// traces a flat shape through the projection of its two 3D axes (the camera is parallel: a flat piece projects exactly with an affine map,
// and its outline, stroked after, stays as thick); the path is left in the context
function flatPath(V0,shape,o,a,b,noBegin){const q=V0.P(o),A2=V0.P(a),B2=V0.P(b);trace(shape,A2[0],A2[1],B2[0],B2[1],q[0],q[1],noBegin)}
// the same on the screen: a shape at q turned by a, scaled by sx, sy
function scrPath(shape,q,a,sx,sy){const c=Math.cos(a),s=Math.sin(a);trace(shape,c*sx,s*sx,-s*sy,c*sy,q[0],q[1])}
// lines painted on a surface, made once: sets of {p, n} in the piece's own space; drawn where they face us, all in one stroke
function drawLines(V0,X,set,col,w,dash,inked){const runs=[];for(const L0 of set){let cur=[];for(const s of L0){if(V0.F(X.Rd(s.n))>.02)cur.push(V0.P(X.T(s.p)));else if(cur.length){if(cur.length>1)runs.push(cur);cur=[]}}if(cur.length>1)runs.push(cur)}
  if(!runs.length)return;if(dash)ctx.setLineDash(dash);if(inked)strokeRuns(runs,INK,w+1.8);strokeRuns(runs,col,w);if(dash)ctx.setLineDash([])}
// a flat leaf: the base b, along d (length Ln), across s (half width W); one tone from how it faces the light (its back side in o.back), the
// outline, the vein (o.vk lights it with the running light)
function leafF(V0,path,b,d,s,Ln,W,T,K,o){o=o||{};flatPath(V0,path,b,mul(d,Ln),mul(s,W));const n=nrm(cross(d,s)),f=V0.F(n);
  ctx.fillStyle=o.col||(f<0&&o.backT?tone(o.backT,lit(V0,mul(n,-1))+(o.kbb||0)):f<0&&o.back?o.back:tone(T,lit(V0,f<0?mul(n,-1):n)+(o.kb||0)));ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=o.lw||2;ctx.stroke();
  if(o.vein!==false&&Math.abs(f)>.08){const a=V0.P(add(b,mul(d,Ln*.12))),e=V0.P(add(b,mul(d,Ln*(o.vl||.78)))),vk=o.vk||0;if(o.veins&&vk<=.05){o.veins.push([a,e]);return}ctx.lineCap='round';
    if(vk>.05&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${K.vG},${.4*vk})`;ctx.lineWidth=3.4;seg(a,e);ctx.stroke();ctx.restore()}
    ctx.strokeStyle=vk>0?cmix(K.nerv,K.vOn,vk):K.nerv;ctx.lineWidth=1;seg(a,e);ctx.stroke()}
}

// ------------------------------------------------------------------ colours
const T3=(l,b,d)=>({l,b,d}),mixT=(a,b,k)=>k<=0?a:k>=1?b:T3(cmix(a.l,b.l,k),cmix(a.b,b.b,k),cmix(a.d,b.d,k));
const mixRgb=(a,b,k)=>{if(k<=0)return a;if(k>=1)return b;const A=a.split(',').map(Number),B=b.split(',').map(Number);return A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')};
// phase 1: a cold forest green on the mauve floor of the arena, dark reddish bark, a pale birch face, mint and violet lights only where
// they count
const K1={bark:T3('#9a6040','#52301f','#24120b'),groove:'#170c07',vOff:'#3a2016',vOn:'#7bf0c0',vG:'123,240,192',
  hat:T3('#b07a4e','#6a4228','#2e180c'),thread:'#1f120c',
  leaf:T3('#5fae6c','#2a6a44','#10351f'),nerv:'#8fd8a0',back:'#3a7a52',backT:T3('#62a072','#3a7a52','#1d4a30'),dryL:'#2a6a44',
  moss:'#4f8a34',mossD:'#3f6a2a',mossT:'#86b84a',
  skin:T3('#e6efd8','#b6c9a4','#6d8468'),cheek:'rgba(70,40,70,.22)',
  lid:'#3a2440',lidE:'#5a3460',lip:'#4a2a40',mIn:'#2a1424',tongue:'#b0506a',fang:'#fff6e8',
  eye:'#7bf0c0',eyeIn:'#c8ffe8',eyeG:'123,240,192',
  hair:'#1e2a1c',hairL:'#3f5a34',hairT:'#55703e',
  bud:T3('#e0b0ff','#a15ad0','#5a2a8a'),budG:'190,120,255',
  lant:T3('#62ad8c','#3f8a6a','#2a5e48'),calyx:'#2a6a44',lantC:'#c8ffe8',lantG:'123,240,192',
  seed:T3('#c48ae8','#8a4ab8','#4a2070'),seedC:'#7bf0c0',seedG:'123,240,192',
  cap:'#9a5ad0',capD:'#7a3ab0',dots:'#e8c8ff',stem:'#e8dcc8',capG:'190,110,255',
  nail:'#efe3c8',spine:'#efe3c8',knot:'#7bf0c0',flame:'#e8fff4',flameG:'123,240,192',dust:'150,128,120'};
// phase 2, the autumn: ember leaves, deeper bark with orange veins, amber eyes, a golden seed, orange lanterns (winter cherries)
const K2={bark:T3('#8a5a3a','#4e2e1e','#22120b'),groove:'#170c07',vOff:'#4a2414',vOn:'#ff8a3c',vG:'255,138,60',
  hat:T3('#a06a40','#5a3420','#26140a'),thread:'#1f120c',
  leaf:T3('#ffb04a','#d0602a','#7a2a18'),nerv:'#ffd27a',back:'#b8502a',backT:T3('#f0904c','#b8502a','#6a2814'),dryL:'#9a6a3a',
  moss:'#6a7a2e',mossD:'#4f5a24',mossT:'#c0a040',
  skin:K1.skin,cheek:K1.cheek,lid:'#3a2034',lidE:'#5a3050',lip:'#4a2a3a',mIn:'#2a1420',tongue:'#b0506a',fang:'#fff6e8',
  eye:'#ffb03c',eyeIn:'#ffe0a0',eyeG:'255,150,60',
  hair:'#2a2418',hairL:'#5a4a2a',hairT:'#7a6030',
  bud:T3('#ffd27a','#ff8a3c','#a3401a'),budG:'255,170,80',
  lant:T3('#ffd27a','#ff8a3c','#a3401a'),calyx:'#7a4a1a',lantC:'#fff0c0',lantG:'255,170,80',
  seed:T3('#ffd27a','#d88a34','#7a3a14'),seedC:'#ffcf6a',seedG:'255,190,90',
  cap:'#ff9a3c',capD:'#c2561c',dots:'#ffe0b0',stem:'#e8dcc8',capG:'255,150,60',
  nail:'#efe3c8',spine:'#efe3c8',knot:'#ff8a3c',flame:'#fff0d0',flameG:'255,170,80',dust:'170,130,100'};
// the defeat: dry leaves and dry grey bark
const KD={leaf:T3('#c49a64','#8a6a3e','#4a3420'),backT:T3('#c8a878','#a07a4a','#5a4228'),bark:T3('#8a7a6a','#5a4e42','#2a221a'),hat:T3('#9a8a76','#625646','#2e261c'),nerv:'#d8bc8a',back:'#a07a4a',dryL:'#8a6a3e',
  moss:'#6a6a4a',mossD:'#4a4a34',mossT:'#8a8a64',hair:'#2a2a24',hairL:'#4a4a3e',hairT:'#5a5a4a'};
const PALC={};
function pal(k2,dry){k2=Math.round(cl(k2,0,1)*24)/24;dry=Math.round(cl(dry||0,0,1)*24)/24;const id=k2+'|'+dry;if(PALC[id])return PALC[id];const K={};
  for(const k in K1){const a=K1[k],b=K2[k];K[k]=typeof a==='string'?(a[0]==='#'?cmix(a,b,k2):a.startsWith('rgba')?a:mixRgb(a,b,k2)):mixT(a,b,k2)}
  if(dry>0)for(const k in KD){const a=K[k],b=KD[k];K[k]=typeof a==='string'?cmix(a,b,dry):mixT(a,b,dry)}
  return PALC[id]=K}

// ------------------------------------------------------------------ the body at rest (x forward, y to her right, z up; 0,0,0 the floor point)
const SKP=[[0,23],[8,22],[18,19.5],[30,15.5],[42,11.5],[52,8.5]],SKA=.92;          // the skirt: a bell of bark (profile [z, r], depth AX)
const RINGS=[{z:17,n:10,L:18.5,W:6.6,off:.5,o:.9},{z:30,n:9,L:16,W:5.8,off:0,o:.7},{z:42.5,n:7,L:13.5,W:5.2,off:.5,o:.55}];   // the leaves on it, bottom to top
const BC=[0,0,64],BRD=[8,11.5,13];                                                 // the corset
const SHN=[-1,14.5,74],SHR=4.7,UA=18,FA=18;                                         // the shoulder knots (y × side), the arm bones
const NK0=[0,0,73],NK1=[1.5,0,79];                                                  // the neck
const HC=[3,0,89],HRD=[9.5,10,13],HPV=[1.5,0,79];                                   // the head (its own camera round the top of the neck)
const HAT0=[1,0,98],HATT=-.18;                                                      // the hat on the head, leaning back
const HATP=[[0,11.5],[5,9.2],[10,7],[15,5],[20,3.4],[23,2.6]];
const TIP1=[[0,0,22],[-2.5,-1,26.5],[-5.5,-2.5,29],[-7.5,-3.5,30.5],[-8.5,-2.5,29.5]],TIP2=[[0,0,22],[-1.4,-.6,27.5],[-2.8,-1.4,32],[-3.6,-2,35.2],[-3.8,-1.6,36.6]],TIPR=[2.6,2,1.5,1.1,.9];
const BUDS=[[5.5,-6,9],[-4,6.5,13],[3,3,18]],BRIM=15.5;
const HTW=Array.from({length:5},(_,k)=>Array.from({length:6},(_,i)=>revoAt(HATP,1,0,k*1.26+i/5*.5,i/5*21.5,.12)));                   // the twigs up the cone
const HRG=[6.5,14].map(z=>Array.from({length:15},(_,i)=>revoAt(HATP,1,0,i/14*TAU,z,.15)));                                        // the rings of braid
const HBD=[Array.from({length:17},(_,i)=>revoAt(HATP,1,0,i/16*TAU,1.4,.7))];                                                      // the band
const HATC=[[0,11.5],[10,7],[20,3.4],[23,2.6]];                                                                                   // the rings of the cone's outline
const TWIGS=[[1.1,4,1],[1.75,3.5,-1],[2.45,5,1],[3.1,6,-.5],[-2.6,4.5,.8],[-1.95,5.5,-1],[-1.25,3.8,.6]];   // round the brim: angle, length, up/down
const LANTS=[{a:-1.80,r:16.2,th:7,ph:0},{a:-1.2,r:16,th:6,ph:2.1},{a:2.03,r:16.3,th:8,ph:4.2}];    // two at her left, one at her right behind
const HORNS=[{sd:-1,pts:[[0,-8,8],[-.6,-12.5,12],[.4,-15,17],[-1.4,-17.5,22.5],[-2.6,-19,27]]},{sd:1,pts:[[0,8,8],[-.8,12.8,11.5],[.2,15.6,15.5],[-1.6,18,19.5]]}];
// the collar: five broad round leaves planted round the back of the neck, opening in a fan behind the head (the middle one straight up and
// back, the others leaning out): from the front they frame the head and the hat, from the back they cover the nape
const COL=[{g:-.66,b:[-4.6,-9.6,72.5],L:21.5,W:7.6},{g:-.33,b:[-7.7,-5.6,74.5],L:25,W:8.4},{g:0,b:[-9,0,75.5],L:28,W:9},{g:.33,b:[-7.7,5.6,74.5],L:25,W:8.4},{g:.66,b:[-4.6,9.6,72.5],L:21.5,W:7.6}];
const HAIRF=[[1.2,10.3,94],[2.4,12.3,86],[3.4,13.4,77.5],[3.8,13.7,69],[3.4,13.1,61]],HAIRFR=[2.8,2.6,2.2,1.8,1.3];
const HAIRB=[[[-7,0,90],[-9.8,0,81],[-10.6,0,72],[-10,0,64]],[[-6,-5,89],[-8.8,-5.7,80.5],[-9.6,-6.1,73],[-9.2,-6,67]],[[-6,5,89],[-8.8,5.7,80.5],[-9.6,6.1,73],[-9.2,6,67]]],HAIRBR=[4.2,3.7,2.8,1.8];
const HW0=[5,9.6,55];                                                               // the wrists at rest: the hands joined to a point in front of the waist
const FEET=[{pts:[[10,7,3],[24,10,2],[33,12,.5],[37,13,0]],rs:[4.4,3.4,2.4,1.5],big:1},{pts:[[2,20,2],[6,27,.5],[7,31,0]],rs:[3,2,1.2],big:0}];
// the train: three thick roots plaited together and two thin ones, from under the back of the hem
const TRS=[{a:[-16,-5,4],b:[-64,-8,0],r0:5,r1:1.6,ph:0,th:1},{a:[-16,0,4.5],b:[-66,0,0],r0:5,r1:1.6,ph:2.1,th:1},{a:[-16,5,4],b:[-64,8,0],r0:5,r1:1.6,ph:4.2,th:1},
  {a:[-14,-12,3],b:[-52,-18,0],r0:2.6,r1:1,ph:1,th:0},{a:[-14,12,3],b:[-52,18,0],r0:2.6,r1:1,ph:3,th:0}];
const SHROOMS=[{s:0,u:.52,r:3},{s:2,u:.66,r:2.5},{s:1,u:.84,r:2}];

// ------------------------------------------------------------------ the moves (every one depends only on p; idle and walk close on themselves)
const MV=['idle','walk','hit','hand','spiral','sink','fin','rise','fix','roots','sow','rite','rage','taunt','enter','die'];
const DUR={idle:3.2,walk:1.4,hit:.6,hand:3,spiral:3.2,sink:1.1,fin:.6,rise:1.2,fix:1,roots:2.8,sow:1.8,rite:4.8,rage:2.8,taunt:1.2,enter:3.2,die:4};
// the hands' poses (her right hand; hp(n,-1) mirrors it): W the wrist, u along the fingers, w the back of the hand, c the curl of the
// three fingers and the thumb, sp how far they open, pole where the elbow goes
const HP={rest:{W:[5,9.6,55],u:[.82,-.52,.1],w:[0,.42,.9],c:[.16,.14,.18,.3],sp:-.25,pole:[-.45,1,-.4]},
  claw:{W:[0,21,120],u:[.3,-.05,.95],w:[-.92,.1,.35],c:[.85,.8,.85,.6],sp:.3,pole:[-.3,1,-.2]},
  reach:{W:[19,11,46],u:[.75,-.05,-.66],w:[.6,.1,.8],c:[.1,.1,.1,.4],sp:.4,pole:[-.2,1,.3]},
  wide:{W:[4,33,80],u:[.2,.55,.81],w:[-.95,.1,.2],c:[.05,.05,.08,.15],sp:.6,pole:[-.4,.6,-.7]},
  snap:{W:[9,3,114],u:[.25,-.5,.83],w:[.1,.85,.5],c:[.4,.6,.7,.3],sp:0,pole:[-.1,1,-.5]},
  sky:{W:[2,17,121],u:[.05,.22,.97],w:[-.97,0,.05],c:[.05,.05,.08,.15],sp:.5,pole:[-.2,1,-.3]},
  cross:{W:[9,-6,66],u:[-.2,-.9,.3],w:[.9,0,.4],c:[.35,.3,.35,.3],sp:0,pole:[.6,1,-.6]},
  hat:{W:[3,14.5,100],u:[.1,-.3,.95],w:[0,.97,.2],c:[.6,.6,.65,.5],sp:0,pole:[-.2,1,-.6]},
  mouth:{W:[15,9,71],u:[.15,-.3,.94],w:[.95,.2,-.1],c:[.05,.05,.1,.5],sp:.15,pole:[.2,1,-.8]},
  beck:{W:[20,8,66],u:[.98,-.15,.1],w:[0,0,-1],c:[1.2,1.3,1.3,.6],sp:0,pole:[-.2,1,-.5]},
  cup:{W:[11,4.5,63],u:[.45,-.5,.74],w:[.75,.6,-.2],c:[.5,.55,.6,.4],sp:0,pole:[.1,1,-.6]},
  low:{W:[11,19,40],u:[.7,.45,-.25],w:[.15,-.2,.97],c:[.2,.2,.25,.3],sp:.4,pole:[-.6,1,-.1]},
  bud:{W:[3,12.5,103],u:[.2,-.5,.84],w:[.2,.85,.5],c:[.3,.25,.5,.5],sp:0,pole:[-.2,1,-.5]},
  throw:{W:[24,16,72],u:[.9,.3,.3],w:[0,-.3,.95],c:[.05,.05,.1,.2],sp:.5,pole:[-.3,1,-.4]},
  grip:{W:[9,4,66],u:[0,-1,.1],w:[.95,0,.3],c:[.8,.8,.85,.6],sp:0,pole:[.2,1,-.7]},
  twig:{W:[-2,23,120],u:[.05,.5,.86],w:[-.97,0,.05],c:[.15,.25,.1,.2],sp:.9,pole:[-.2,1,-.3]}};
function hp(n,sd){const h=HP[n];return{W:[h.W[0],sd*h.W[1],h.W[2]],u:nrm([h.u[0],sd*h.u[1],h.u[2]]),w:[h.w[0],sd*h.w[1],h.w[2]],curl:h.c.slice(),spread:h.sp,pole:nrm([h.pole[0],sd*h.pole[1],h.pole[2]]),tips:[0,0,0,0],ext:0,tgt:null,twig:0}}
function hmix(a,b,k){if(k<=0)return a;if(k>=1)return b;return{W:lerp3(a.W,b.W,k),u:nrm(lerp3(a.u,b.u,k)),w:lerp3(a.w,b.w,k),curl:a.curl.map((c,i)=>lerp(c,b.curl[i],k)),spread:lerp(a.spread,b.spread,k),
  pole:nrm(lerp3(a.pole,b.pole,k)),tips:a.tips.map((t,i)=>lerp(t,b.tips[i],k)),ext:lerp(a.ext,b.ext,k),tgt:a.tgt||b.tgt,twig:lerp(a.twig,b.twig,k)}}
// keyframes of hand poses on p: [[p, name], ...]
function hkeys(K,p,sd){for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(p<=b[0])return hmix(hp(a[1],sd),hp(b[1],sd),ez(cl((p-a[0])/Math.max(1e-6,b[0]-a[0]),0,1)))}return hp(K[K.length-1][1],sd)}
const TOFF={hand:1,spiral:1,sink:1,rise:1,roots:1,sow:1,rite:1,rage:1,taunt:1,enter:1,die:1};
function wPose(anim,p,o){const ph=p*TAU,P2=!!o.p2&&anim!=='enter',A={B:[0,0,0],spin:0,sink:0,lean:0,roll0:0,bl:-.04,broll:0,byaw:0,bz:0,
    hy:0,hp:0,hr:0,hx:0,hz:0,blink:1,squint:0,eye:1,eyeFl:0,eyeK2:null,mouth:0,smile:1,under:0,blow:0,
    hat:{tilt:0,roll:0,yaw:0,off:[0,0,0],k:1,crack:0,free:null,sw:0,droop:0},horns:P2?1:0,tipUp:P2?1:0,bud:[0,0,0],budOn:[1,1,1,1],budHide:[0,0,0],budPh:ph,lantPh:ph,lantA:.2,lantK:1,lantOn:[1,1,1],budK2:null,
    collar:0,ruff:0,hairPh:ph,hR:hp('rest',1),hL:hp('rest',-1),
    vein:{aR:null,aL:null,neck:null,dn:null,skirt:0},arm:{},seed:0,seedFl:0,glow:1,
    halo:0,haloRot:0,haloPulse:0,bell:0,skTw:0,hem:0,
    tr:{mode:'lie',mv:o.mv||0,wave:0,curl:0,k:0,up:0,dive:0,sign:0,lit:0,litRev:0},trK:1,ftK:1,ft:[{e:0,l:0,g:0},{e:0,l:0,g:0}],ftSide:[0,0],tap:0,ftTuck:0,
    k2:P2?1:0,k2z:null,guard:P2?(o.guard==null?1:cl(o.guard,0,1)):0,guardK:null,orb:o.orb||0,fall:P2?1:0,
    dry:0,leafK:1,col:null,bud0:null,fin:0,seedsIn:0,smoke:null,flies:-1,sprout:0,fx:[]};
  const fx=(k,t,o2)=>{if(t>=0&&t<1)A.fx.push(Object.assign({k,t},o2||{}))};
  const both=K=>{A.hR=hkeys(K,p,1);A.hL=hkeys(K,p,-1)};
  // the light that runs from the seed: up the corset (the first 35% of the way), then down the arm to the fingertips
  const armLight=(sd,f,al)=>{A.vein[sd>0?'aR':'aL']=[0,cl(f/.35,0,1),al];if(f>.35)A.arm[sd]=[0,cl((f-.35)/.65,0,1),al]};
  if(anim==='walk'){// SCIVOLA SULLE RADICI: the body glides, the front roots reach out by turns and pull
    const mv=A.tr.mv,bob=Math.cos(TAU*2*p);A.B[2]=.5-.5*bob;A.lean=.06*Math.cos(mv);A.roll0=.06*Math.sin(mv);
    for(let i=0;i<2;i++){const q=((p-(i?.5:0))%1+1)%1,F=A.ft[i];// 0: her left (from .00), 1: her right (from .50)
      if(q<.22){const k=q/.22;F.e=ez(k);F.l=Math.sin(Math.PI*k)*3}else if(q<.5){const k=(q-.22)/.28;F.e=1-ez(sstep(.1,1,k));F.g=sstep(0,.2,k)*(1-sstep(.8,1,k))}else{F.e=0}
      fx('dust',((p-(i?.75:.25))%1+1)%1/.2,{at:[40,(i?1:-1)*15,0],n:4,r:5,al:.4})}
    A.ftSide=[Math.sin(TAU*(p-.12))*.5+.5,Math.sin(TAU*(p-.62))*.5+.5];A.hem=.1;A.tr.wave=1;A.lantPh=ph*2;A.lantA=.26;A.hairPh=ph*2;A.seed=.4*pls(p,.25,.1)+.4*pls(p,.75,.1);
    if(P2)fx('fall',p)}
  else if(anim==='hit'){const k=hitK(p);A.bl-=.21*k;A.hp-=.12*k;A.squint=.9*(1-sstep(.36,.44,p));A.ruff=k;A.hat.tilt=-.15*Math.sin(p*TAU*2.2)*Math.exp(-p*3);A.mouth=.25*k;A.smile=1-k;
    fx('hitleaves',p/.45)}
  else if(anim==='hand'){// MANO DEL BOSCO: the light runs down the arm, the hand goes up and hooks, then down: the fingers grow into roots in
    // the floor; it holds them (trembling), squeezes (.80: the hand of branches closes in the game) and tears them out
    const two=o.hands===2,sd0=o.hands===-1?-1:1;
    const side=(sd,tS,tO)=>{const H=hkeys([[0,'rest'],[.22,'claw'],[.24,'claw'],[.32,'reach'],[tO,'reach'],[1,'rest']],p,sd);
      H.ext=sstep(.25,.32,p)*(1-sstep(tO,tO+.07,p));H.tgt=[0,1,2].map(j=>[30+(j-1)*3.2,sd*(9+(j-1)*3.4),0]);
      const sq=sstep(tS-.012,tS+.012,p)*(1-sstep(tO,tO+.03,p));H.W=add(H.W,[-4*sq,sd*1.5*sq,-1.5*sq]);
      if(p>.32&&p<tO)H.W=add(H.W,[0,0,.6*trem(p,.32,tO,6,3)]);
      const lit=sstep(.1,.13,p)*(1-sstep(.24,.28,p));H.tips=[lit,lit,lit,lit*.8];armLight(sd,sstep(0,.12,p),(1-.6*sstep(.14,.3,p))*(1-sstep(.9,1,p)));return H};
    if(two){A.hR=side(1,.80,.88);A.hL=side(-1,.90,.92)}else{const H=side(sd0,.80,.88);if(sd0>0)A.hR=H;else A.hL=H}
    A.bl=kv([[0,-.04],[.24,-.12],[.32,.27],[.8,.27],[.82,.18],[.88,.22],[1,-.04]],p);A.hp=kv([[0,0],[.2,.08],[.32,-.17],[.86,-.17],[1,0]],p);A.hr=sd0*.1*rise(p,.05,.2,.3,.4);
    A.smile=1.3;A.under=rise(p,.08,.18,.3,.36);A.squint=.25*rise(p,.32,.4,.85,.95);A.seed=Math.max(pls(p,.04,.08),.3*rise(p,.1,.2,.85,.95));
    for(const sd of two?[-1,1]:[sd0])for(let j=0;j<3;j++)fx('crack',(p-.25-j*.012)/.6,{at:[30+(j-1)*3.2,sd*(9+(j-1)*3.4),0],big:j===1});
    fx('pebs',(p-.88)/.12,{at:[30,sd0*9,0]});if(two)fx('pebs',(p-.92)/.08,{at:[30,-9,0]})}
  else if(anim==='spiral'){// SPIRALE DI SPINE: the light runs up both arms, the arms go wide like a conductor's, the eight fingertips light one
    // by one, the halo of thorns grows behind the collar and turns; the wrists turn, the gown flares; in the autumn, a snap over the head
    const sp=(o.spin||1)>0?1:-1,rv=P2?sstep(.535,.565,p):0,th=q=>q*3.2*2.2;
    both([[0,'rest'],[.1,'rest'],[.27,'wide'],[.85,'wide'],[1,'rest']]);
    const turn=p>.27&&p<.85?(p-.27)/.58*TAU*1.5*sp*(1-2*rv):0,amp=rise(p,.27,.33,.8,.85);
    for(const[H,sd] of[[A.hR,1],[A.hL,-1]]){H.W=add(H.W,[3.5*Math.cos(turn+sd)*amp,0,3.5*Math.sin(turn+sd)*amp]);H.u=nrm(add(H.u,[.25*Math.sin(turn*1.3)*amp,0,0]))}
    if(P2){const sn=rise(p,.48,.535,.565,.62);A.hR=hmix(A.hR,hp('snap',1),sn);A.hL=hmix(A.hL,hp('snap',-1),sn);fx('snap',(p-.55)/.12)}
    for(const sd of[-1,1])armLight(sd,sstep(0,.1,p),(1-.6*sstep(.12,.26,p))*(1-sstep(.85,.95,p)));
    for(let k=0;k<8;k++){const t=.11+k*.02,H=k%2?A.hL:A.hR,j=Math.floor(k/2);H.tips[j]=sstep(t,t+.015,p)*(1-sstep(.85,.92,p))}
    A.halo=sstep(.1,.25,p)*(1-sstep(.85,.97,p));A.haloRot=sp*(th(Math.min(p,.55))-(P2?1:-1)*0+(p>.55?(P2?-1:1)*(th(p)-th(.55)):0));A.haloPulse=P2?pls(p,.46,.07):0;
    A.bz=-2*sstep(.1,.27,p)*(1-sstep(.85,1,p));A.bell=.08*amp;A.skTw=.22*Math.sin(turn)*amp;A.byaw=.12*Math.sin(turn)*amp;A.mouth=.12*amp*(.5+.5*Math.sin(p*60));A.under=amp*.8;A.smile=1.2;
    A.seed=Math.max(pls(p,.04,.08),.4*amp)}
  else if(anim==='sink'){// SPROFONDA: she hugs herself, the train winds round her like a cocoon, her lights go out (the buds of the hat stay lit);
    // she turns half round and the earth pulls her down; at .75 only the top of the hat is out, then the earth closes round it
    const k=sstep(0,.25,p);both([[0,'rest'],[.22,'cross'],[1,'cross']]);A.tr.mode='coc';A.tr.k=k;A.ftTuck=k;A.glow=1-sstep(.04,.24,p);A.squint=.5*k;A.smile=1.3;A.mouth=.18*rise(p,.12,.18,.24,.3);
    A.spin=Math.PI*ez(sstep(.25,.75,p));A.sink=kv([[0,0],[.25,0],[.5,80],[.75,110],[1,110]],p);A.fin=sstep(.75,1,p);A.hat.tilt=.18*sstep(.7,1,p);if(!P2)A.tipUp=.5*sstep(.7,1,p);fx('swirl',(p-.25)/.75)}
  else if(anim==='fin'){// LA PUNTA DEL CAPPELLO: only the crooked tip of the hat is out, swaying like a shark's fin; a wave of earth in front
    const k=o.k==null?1:cl(o.k,0,1);A.sink=110+18*(1-k);A.spin=Math.PI;A.hat.roll=.14*Math.sin(ph);A.hat.tilt=.18;if(!P2)A.tipUp=.5;A.tr.mode='coc';A.tr.k=1;A.ftTuck=1;A.glow=0;both([[0,'cross'],[1,'cross']]);A.fin=1;A.finK=k}
  else if(anim==='rise'){// RIAFFIORA: the tip comes up, a column of twisted roots rises round her (the blow at .12) turning, opens like a bud in
    // five petals: inside she stands with her arms crossed; she throws them open (.58: the ring of seeds), the roots fall back into train and feet
    A.spin=Math.PI+Math.PI*ez(sstep(0,.3,p));A.sink=kv([[0,110],[.12,92],[.3,64],[.55,0],[1,0]],p);A.fin=1-sstep(0,.12,p);A.hat.tilt=.18*(1-sstep(0,.3,p));if(!P2)A.tipUp=.5*(1-sstep(0,.3,p));
    A.col={h:sstep(0,.12,p),up:sstep(.12,.3,p),open:sstep(.3,.55,p),fall:sstep(.62,.9,p),gone:sstep(.84,1,p),tw:ez(sstep(0,.3,p))*2.2};
    both([[0,'cross'],[.55,'cross'],[.6,'wide'],[.7,'wide'],[1,'rest']]);
    const lit=sstep(.53,.58,p)*(1-sstep(.72,.85,p));for(const H of[A.hR,A.hL])H.tips=[lit,lit,lit,lit];
    A.glow=sstep(.45,.58,p);A.trK=sstep(.68,1,p);A.ftK=sstep(.62,.95,p);A.mouth=.5*rise(p,.54,.58,.64,.7);A.smile=1.3;A.eyeFl=flash(p,.57,.08);
    if(!o.neat){const c=sstep(.3,.42,p);A.hat.roll=-.4*c;A.hat.droop=c}fx('ring',(p-.12)/.3);fx('ring',(p-.57)/.25,{rgb:'123,240,192'})}
  else if(anim==='fix'){// CAPPELLO STORTO: annoyed, she looks up at the crooked hat, takes it with both hands and puts it straight with two tugs
    // (the arms up: the seed on the chest is bare and shines); then the hands back together, a smug smile
    const neat=o.neat?0:1,t1=sstep(.34,.4,p),t2=sstep(.56,.62,p);A.hat.roll=-.4*neat*(1-.55*t1-.45*t2);A.hat.droop=neat*(1-.5*t1-.5*t2);
    both([[0,'rest'],[.18,'rest'],[.3,'hat'],[.72,'hat'],[.9,'rest'],[1,'rest']]);
    for(const[c,k] of[[.37,t1],[.59,t2]]){const y=pls(p,c,.08);A.hR.W=add(A.hR.W,[0,0,2.2*y]);A.hL.W=add(A.hL.W,[0,0,2.2*y]);A.hat.off=add(A.hat.off,[0,0,1.2*y])}
    A.hp=kv([[0,0],[.12,-.22],[.3,-.12],[.72,-.12],[.85,0],[1,0]],p);A.hr=.12*rise(p,.2,.3,.68,.78);A.squint=.45*rise(p,.05,.15,.7,.78);A.smile=kv([[0,.6],[.7,-.4],[.8,1.4],[1,1.2]],p);
    A.mouth=.12*rise(p,.36,.4,.62,.68);A.seedFl=rise(p,.24,.32,.7,.78);A.seed=.5*A.seedFl}
  else if(anim==='roots'){// RADICI DELLA CRIPTA: the light runs down the gown, the train rears behind her like a knot of snakes (lit from its
    // tip to the hips), whips down and dives into the floor (.20-.26); she holds with the hands low, the fingers trembling; it comes out
    A.vein.dn=[0,sstep(0,.05,p),1-sstep(.9,1,p)];A.vein.skirt=sstep(.03,.1,p)*(1-.55*sstep(.2,.32,p))*(1-sstep(.9,1,p));A.tr.up=sstep(.1,.2,p)*(1-sstep(.2,.26,p));A.tr.dive=sstep(.2,.26,p)*(1-sstep(.9,1,p));
    A.tr.litRev=sstep(.1,.2,p)*(1-sstep(.88,.95,p));A.B[2]=-4*sstep(.2,.26,p)*(1-sstep(.9,1,p));A.bl=kv([[0,-.04],[.2,-.1],[.26,.08],[.9,.08],[1,-.04]],p);
    both([[0,'rest'],[.18,'rest'],[.26,'low'],[.9,'low'],[1,'rest']]);
    if(p>.26&&p<.9)for(const H of[A.hR,A.hL])H.curl=H.curl.map((c,i)=>c+.25*Math.sin(p*2.8*TAU*7+i*1.7)*rise(p,.26,.3,.86,.9));
    A.eye=1+.6*rise(p,.24,.3,.86,.92);A.squint=.3*rise(p,.24,.3,.86,.92);A.mouth=.1*rise(p,.18,.22,.3,.4);A.seed=pls(p,.03,.08);fx('dust',(p-.21)/.2,{at:[-28,0,0],n:8,r:16,al:.5})}
  else if(anim==='sow'){// IL GIARDINO DELLA STREGA: the light runs up the neck into the hat; the hands cupped on the chest go up to the hat, two buds
    // swell and glow, she picks them and sows them with a flick of the wrists (.50); she watches them fall, smiling
    A.vein.neck=[0,sstep(0,.13,p),1-sstep(.4,.5,p)];const sw=sstep(.15,.35,p)*(1-sstep(.4,.42,p));A.bud[1]=sw;A.bud[2]=sw;A.budHide=[0,sstep(.4,.42,p)*(1-sstep(.88,1,p)),sstep(.4,.42,p)*(1-sstep(.88,1,p))];
    both([[0,'rest'],[.15,'cup'],[.3,'bud'],[.44,'bud'],[.5,'throw'],[.62,'throw'],[1,'rest']]);A.seedsIn=p>=.41&&p<.5?1:0;
    A.hp=kv([[0,0],[.25,-.15],[.45,-.1],[.55,.12],[.9,.12],[1,0]],p);A.smile=1.3;A.seed=pls(p,.04,.08);A.under=rise(p,.3,.38,.46,.52)*.6}
  else if(anim==='rite'){// RITO DELLE RUNE (autumn): the arms to the sky, the train opens into the three arms of her sign down into the floor; she
    // sings with her head back, the hat ablaze; at every burst of the rays (.27, .36 ... .92) the arms come down and up
    both([[0,'rest'],[.08,'sky'],[.95,'sky'],[1,'rest']]);A.tr.sign=sstep(0,.08,p)*(1-sstep(.95,1,p));
    for(const t of[.27,.36,.45,.55,.64,.74,.83,.92]){const y=pls(p,t,.045);A.hR.W=add(A.hR.W,[6*y,4*y,-16*y]);A.hL.W=add(A.hL.W,[6*y,-4*y,-16*y])}
    const sing=rise(p,.08,.14,.9,.96);A.hp=-.3*sing;A.mouth=sing*(.45+.15*Math.sin(p*4.8*TAU*1.5));A.bl=-.04-.06*sing;A.lantA=.3;A.eyeFl=.5*sing;A.seed=.5+.5*sing;
    for(const H of[A.hR,A.hL])H.tips=[sing,sing,sing,sing];for(const sd of[-1,1])armLight(sd,1,.45*sing)}
  else if(anim==='rage'){// L'AUTUNNO DELLA STREGA: she clutches her chest (the seed flashes twice), takes her hat and screams with her head back: a
    // wave of colour runs down from the hat to the hem; horns of branches grow out of the hat, the buds burst into orange lanterns, half the
    // leaves fall in a storm, the collar turns to thorny leaves, the eyes go amber; the four guardian roots break out of the floor
    const wv=sstep(.22,.48,p);A.k2=0;A.k2z=wv>=1?null:lerp(140,-12,wv);if(wv>=1)A.k2=1;A.eyeK2=sstep(.6,.64,p);
    both([[0,'rest'],[.1,'grip'],[.2,'grip'],[.28,'hat'],[.48,'hat'],[.6,'wide'],[.8,'wide'],[1,'rest']]);
    A.seedFl=Math.max(pls(p,.06,.04),pls(p,.14,.04));A.seed=.4+.6*rise(p,0,.04,.18,.22);
    const scr=rise(p,.24,.28,.42,.47);A.hp=-.35*scr;A.mouth=.95*scr;A.bl=-.04-.12*scr+.08*rise(p,0,.08,.16,.22);A.squint=.6*rise(p,0,.06,.16,.22);
    A.horns=sstep(.45,.6,p);A.tipUp=sstep(.45,.6,p);A.budK2=[.47,.51,.55].map(t=>sstep(t,t+.02,p));A.fall=sstep(.55,.8,p);
    A.guardK=[.62,.66,.7,.74].map(t=>sstep(t,t+.04,p));A.guard=1;A.smile=kv([[0,0],[.8,0],[.92,1.4],[1,1.2]],p);
    fx('storm',(p-.55)/.3);for(const t of[.62,.66,.7,.74])fx('burst',(p-t)/.14,{i:Math.round((t-.62)/.04)});fx('ring',(p-.26)/.25,{rgb:'255,170,90'})}
  else if(anim==='taunt'){// PRESA IN GIRO: the right hand at her mouth, the four fingertips lit like candles; she blows them out one by one (a thread
    // of smoke each), smiles with the fangs, crooks the index finger twice («vieni, vieni…»); the candles light again
    A.hR=hkeys([[0,'rest'],[.15,'mouth'],[.55,'mouth'],[.7,'beck'],[.95,'beck'],[1,'rest']],p,1);
    const outs=[.22,.31,.40,.49];A.hR.tips=outs.map(t=>sstep(.03,.1,p)*(1-sstep(t,t+.02,p))+rise(p,.84,.9,.95,1));A.smoke=outs.map(t=>(p-t)/.3);
    for(const t of[.76,.88]){const y=pls(p,t,.09);A.hR.curl[0]=lerp(A.hR.curl[0],-.1,1-y*0)+1.3*y}
    if(p>.7&&p<.95)A.hR.curl[0]=.1+1.3*Math.max(pls(p,.76,.09),pls(p,.88,.09));
    A.blow=rise(p,.17,.2,.5,.54);A.squint=.55*rise(p,.55,.6,.9,.96);A.smile=kv([[0,1],[.5,.5],[.6,1.6],[1,1.2]],p);A.mouth=.25*rise(p,.56,.6,.66,.7);A.hy=.15*rise(p,.15,.25,.5,.6);A.hr=.1*rise(p,.6,.7,.9,1)}
  else if(anim==='enter'){// IL RISVEGLIO: a big closed bud of dark leaves and roots rises out of the floor, beats with mint light inside and opens
    // a leaf at a time; inside she is curled up: she rises slowly (the petals become the gown, the roots her train and feet), her eyes light,
    // the hat snaps straight, the buds light one by one, she cracks her fingers, throws her arms wide and screams
    A.bud0={h:sstep(0,.2,p),op:[.3,.34,.38,.42,.45].map(t=>sstep(t,t+.06,p)),fall:sstep(.48,.72,p),pulse:Math.max(pls(p,.27,.05),pls(p,.38,.05)),hide:sstep(.62,.74,p)};
    A.sink=kv([[0,140],[.3,128],[.45,70],[.7,0],[1,0]],p);const cu=1-sstep(.45,.7,p);A.bl=-.04+.42*cu;A.hp=.55*(1-sstep(.62,.74,p));A.hat.tilt=.45*(1-sstep(.745,.755,p))-.12*pls(p,.765,.03);
    A.trK=sstep(.5,.72,p);A.ftK=sstep(.48,.7,p);A.glow=sstep(.7,.72,p);A.eyeFl=Math.max(flash(p,.72,.04),flash(p,.735,.04));A.budOn=[.75,.765,.78,.795].map(t=>sstep(t,t+.01,p));A.lantOn=[.77,.79,.81].map(t=>sstep(t,t+.01,p));
    both([[0,'cross'],[.7,'cross'],[.76,'rest'],[.81,'rest'],[.86,'wide'],[.94,'wide'],[1,'rest']]);
    for(const[t,j] of[[.76,0],[.78,1],[.8,2]]){const y=pls(p,t,.02);A.hR.curl[j]-=.5*y;A.hL.curl[j]-=.5*y}
    const scr=rise(p,.84,.86,.92,.95);A.mouth=.95*scr;A.hp-=.25*scr;A.smile=1.2;fx('ring',(p-.84)/.15,{rgb:'123,240,192'});fx('flyleaves',(p-.83)/.17);
    for(const t of[.27,.38])fx('beat',(p-t)/.1)}
  else if(anim==='die'){// L'ULTIMO AUTUNNO: the blow, a long scream bending back (the eyes flicker); she clutches the hat, a crack runs through it,
    // its lights go out; it breaks at the band and falls (clou 1.8 s: it lies crooked on the floor in front of her); the leaves dry and fall in a
    // storm, the gown turns to dry grey bark, the arms rise to the sky and the fingers turn into twigs: a bare tree; two fireflies leave her
    // eyes; at her feet a sprout opens and three little flowers bloom
    const scr=rise(p,0,.02,.1,.14);A.mouth=.95*scr;A.bl=-.04-.22*scr+.12*sstep(.4,.75,p);A.hp=-.3*scr;A.eye=scr>0?.55+.45*Math.cos(sstep(0,.12,p)*TAU*2):1;
    both([[0,'rest'],[.12,'rest'],[.2,'hat'],[.3,'hat'],[.42,'rest'],[.48,'rest'],[.75,'twig'],[1,'twig']]);const tw=sstep(.45,.75,p);A.hR.twig=A.hL.twig=tw;
    A.hat.crack=sstep(.12,.3,p);A.budOn=[.16,.21,.26,.26].map(t=>1-sstep(t,t+.02,p));A.lantOn=[.16,.21,.26].map(t=>1-sstep(t,t+.02,p));
    if(p>=.3){const k=sstep(.3,.45,p),pos=kv([[.3,[2,0,98]],[.36,[12,-5,64]],[.4,[22,-8,15.5]],[.425,[25,-9,20]],[.45,[27,-10,15.5]],[1,[27,-10,15.5]]],p),tl=kv([[.3,[-.18,0,0]],[.4,[.9,.3,1.6]],[.45,[1,.42,2]],[1,[1,.42,2]]],p);
      A.hat.free={pos,tilt:tl[0],roll:tl[1],yaw:tl[2]};A.hatK=k}
    A.dry=sstep(.4,.62,p);A.leafK=1-sstep(.45,.75,p);A.B[2]=-10*sstep(.4,.75,p);A.tr.mode='trunk';A.tr.k=tw;A.glow=1-sstep(.75,.9,p);A.flies=(p-.75)/.22;A.sprout=sstep(.9,1,p);
    A.squint=.5*sstep(.75,.9,p);A.smile=.4;A.guard*=1-sstep(0,.14,p);fx('storm',(p-.45)/.3,{dry:1});fx('dust',(p-.4)/.15,{at:[22,-8,0],n:6,r:10,al:.5})}
  else{// FERMO: two breaths, the seed beats, the head looks round, the fingers drum, the right root taps, the tip of the train curls
    const b=-Math.cos(TAU*2*p);A.bz=.5+.5*b;A.collar=.07*b;A.seed=Math.max(pls(p,.2,.08),pls(p,.7,.08));
    A.hy=look(p,.3);A.hr=.06*Math.sin(ph+1);A.blink=blink(p,.62,.08);
    for(const[j,t] of[[0,.32],[1,.38],[2,.44]])A.hR.curl[j]-=.5*pls(p,t,.07);for(const[j,t] of[[0,.57],[1,.63],[2,.69]])A.hL.curl[j]-=.5*pls(p,t,.07);
    A.tap=Math.max(pls(p,.30,.05),pls(p,.36,.05));A.tr.curl=rise(p,.70,.80,.85,.95);A.hat.sw=.05*Math.sin(ph);
    for(const c of[.30,.36])fx('dust',(p-c)/.08,{at:[37,13,0],n:3,r:3,al:.35});
    fx('leafDrop',(p-.1)/.5);if(P2)fx('fall',p)}
  if(P2&&anim!=='rage'&&anim!=='die'){A.k2=1}
  return A}

// ------------------------------------------------------------------ the parts
// the four big volumes in the order they are painted (each covers the ones before it where they meet); every other piece goes before the
// first of them it overlaps and is behind, else after the last it overlaps. Behind or in front: the side of the plane of the volume's outline
// (the plane through its centre conjugate to the view): outside a convex volume that side only changes away from its outline
function bodiesOf(V0,X0,XU,XH,XT){const w=[V0.D(1,0,0),V0.D(0,1,0),V0.D(0,0,1)],ax=X=>[X.Rd([1,0,0]),X.Rd([0,1,0]),X.Rd([0,0,1])];
  const B=[{X:X0,C:[0,0,24],R:[20,22,28],r:27,d:0},{X:XU,C:BC,R:[8.6,12.5,13.5],r:16,d:10},{X:XH,C:HC,R:HRD,r:13,d:20},{X:XT,C:[0,0,10],R:[11.5,11.5,13],r:14,d:30}];
  for(const b of B){b.Cw=b.X.T(b.C);b.U=ax(b.X);b.wU=b.U.map(u=>dot(w,u));b.q=V0.P(b.Cw)}
  const front=(b,q)=>{const d=sub(q,b.Cw);let s=0;for(let i=0;i<3;i++)s+=dot(d,b.U[i])*b.wU[i]/(b.R[i]*b.R[i]);return s>0};
  // the depth of a piece round the 3D point q (screen radius r)
  const slot=(q,r)=>{const s=V0.P(q);let lo=-1,hi=4,near=0,bz=1e9;
    for(let i=0;i<4;i++){const b=B[i],dz=Math.abs(q[2]-b.Cw[2]);if(dz<bz){bz=dz;near=i}const ov=Math.hypot(s[0]-b.q[0],s[1]-b.q[1])<r+b.r;if(!ov)continue;if(front(b,q))lo=Math.max(lo,i);else hi=Math.min(hi,i)}
    if(lo<0&&hi>3){if(front(B[near],q))lo=near;else hi=near}
    const k=hi<=3&&hi<=lo?hi-1:lo;return 10*(k+1)-5+V0.D(q)*.002};
  return{B,front,slot,w}}

// the skirt: the bark bell under three rings of leaves laid like shingles (each ring hangs over the one below). A ring is painted in one go:
// its leaves never overlap each other, so they are filled by tone (dark, mid, light: how much each faces the light) and outlined in one
// stroke; the leaves at the back that stick out of the bell's outline go first, in one dark batch. The rootlets of the hem go with the floor
const SKV=Array.from({length:7},(_,i)=>{const t=(i+.2)/7*TAU;return Array.from({length:8},(_,j)=>{const k=j/7;return revoAt(SKP,SKA,0,t+.25*Math.sin(k*3),lerp(51,31,k),.1)})});
const rnd=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
function skirtProf(A){const b=A.bell||0;return b?SKP.map(([z,r])=>[z,r*(1+b*(1-z/52))]):SKP}
const SKH=[0,1,2,3,5];                                                              // the rings of the profile that make the bell's outline
// how far a leaf has come off (-1 still on, 0..1 falling, >=1 gone): the top ring and the outer collar leaves in the autumn, every leaf at the end
function offK(A,thr,top){let u=-1;if(top&&A.fall>0)u=A.fall>=1?2:(A.fall-thr*.8)/.2;if(A.leafK<1){const v=((1-A.leafK)-thr*.85)/.15;if(v>u)u=v}return u<0?-1:u}
// the leaves, made once: angle round the bell, a little jitter; their place at rest is kept (the bell flares only in the Spiral)
const LEAFC=RINGS.map((R0,ri)=>Array.from({length:R0.n},(_,i)=>({ri,i,jr:rnd(i*3.1,ri+4)-.5,thr:rnd(i,ri),t:(i+R0.off)/R0.n*TAU})));
function leafGeo(prof,R0,c,A,mvx){const t=c.t+(A.skTw||0)*(1+c.ri*.25),s0=revoAt(prof,SKA,0,t,R0.z,R0.o),s1=revoAt(prof,SKA,0,t,R0.z-4,R0.o);
  let d=nrm(add(mul(nrm(sub(s1.p,s0.p)),.95),mul(s0.n,.36)));if(mvx&&c.ri===0)d=nrm(add(d,[-mvx[0]*A.hem,-mvx[1]*A.hem,0]));
  d=nrm(add(d,mul(nrm(cross(s0.n,d)),c.jr*.28)));return{b:s0.p,n:s0.n,d,sv:nrm(cross(s0.n,d))}}
function leafRings(V0,X0,A,K){const prof=skirtProf(A),nr=LOWFX?2:3,mvx=A.hem?[Math.cos(A.tr.mv),Math.sin(A.tr.mv)]:null,dyn=!!(A.bell||A.skTw||A.hem),R={back:[[],[],[]],rings:[[],[],[]],fall:[]};
  for(let ri=0;ri<nr;ri++){const R0=RINGS[ri],top=ri===2;
    for(const c of LEAFC[ri]){const off=offK(A,c.thr,top);if(off>=1)continue;const g=dyn||off>=0?leafGeo(prof,R0,c,A,mvx):(c.g||(c.g=leafGeo(SKP,R0,c,A,null)));
      let b=g.b,dd=g.d;if(off>=0){const u=ez(off);b=add(b,add(mul(g.n,9*u),[0,0,-(R0.z-2)*u*u]));dd=nrm(add(mul(g.d,Math.cos(u*2.6)),mul(g.n,Math.sin(u*2.6))))}
      const nw=X0.Rd(g.n),f=V0.F(nw);if(off<0&&f<-.55)continue;
      const e={ri,b:X0.T(b),d:X0.Rd(dd),s:X0.Rd(g.sv),n:nw,f,L:R0.L*(1+.12*c.jr),W:R0.W*(1-.06*c.jr),z:R0.z};
      if(off>=0){e.al=1-sstep(.7,1,off);e.dep=V0.D(e.b);R.fall.push(e)}else(f<0?R.back:R.rings)[ri].push(e)}}
  return R}
// a batch of flat leaves of one ring: filled by tone, one outline, the veins in one stroke (lit by the running light: vk)
const RTC=(T,ri)=>{const dk=[.2,.08,0][ri];return[cmix(cmix(T.d,T.b,.45),T.d,dk),cmix(T.b,T.d,dk),cmix(cmix(T.b,T.l,.45),T.d,dk*.6)]};
const ringTone=(V0,T,ri,n)=>{const l=lit(V0,V0.F(n)<0?mul(n,-1):n);return RTC(T,ri)[l<.44?0:l<.7?1:2]};
function leafBatch(V0,list,K,ri,dark,vk,sh){if(!list.length)return;const T=K.leaf,cols=dark?[cmix(T.d,T.b,.2)]:RTC(T,ri);
  const PS=cols.map(()=>null),VS=[];
  for(const e of list){const ti=dark?0:(()=>{const l=lit(V0,e.n);return l<.44?0:l<.7?1:2})(),q=V0.P(e.b),a=V0.P(mul(e.d,e.L)),b=V0.P(mul(e.s,e.W));
    traceTo(PS[ti]||(PS[ti]=new Path2D()),sh||OVL,a[0],a[1],b[0],b[1],q[0],q[1]);if(!dark&&e.f>.12){const m=V0.P(add(e.b,mul(e.d,e.L*.14))),n=V0.P(add(e.b,mul(e.d,e.L*.74)));VS.push([m,n])}}
  ctx.lineJoin='round';for(let i=0;i<PS.length;i++)if(PS[i]){ctx.fillStyle=cols[i];ctx.fill(PS[i])}
  ctx.strokeStyle=INK;ctx.lineWidth=1.7;for(const pa of PS)if(pa)ctx.stroke(pa);
  if(VS.length){if(vk>.05&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns(VS,`rgba(${K.vG},${.34*vk})`,2.3);ctx.restore()}strokeRuns(VS,vk>0?cmix(K.nerv,K.vOn,vk):cmix(K.nerv,T.b,.25),1)}}
function drawSkirt(V0,X0,A,K,KZ,LR){const prof=skirtProf(A),pts=[];for(const i of SKH){const[z,r]=prof[i];for(let j=0;j<10;j++){const t=j/10*TAU;pts.push(V0.P(X0.T([Math.cos(t)*r*SKA,Math.sin(t)*r,z])))}}
  for(let ri=0;ri<3;ri++)leafBatch(V0,LR.back[ri],KZ(RINGS[ri].z),ri,true,0);
  const dr=A.dry,H=svol(pts,T3(cmix(cmix(K.bark.b,K.leaf.d,.5),K.bark.l,dr),cmix(cmix(K.bark.d,K.leaf.d,.55),K.bark.b,dr),cmix('#0a140c',K.bark.d,dr)),{lw:2.8,rim:.3});
  {const b=bbox(H),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,'rgba(16,8,4,.15)');g.addColorStop(.6,'rgba(16,8,4,0)');g.addColorStop(1,'rgba(16,8,4,.38)');ctx.fillStyle=g;ctx.fill(H.path)}
  // the autumn (where the top ring has fallen) and the tree: the bark with its grooves, the veins lit in the autumn
  if(A.fall>.3||A.dry>.3){const Kz=KZ(46),al=Math.max(sstep(.3,.8,A.fall)*(1-A.dry),sstep(.3,.8,A.dry));ctx.save();ctx.clip(H.path);ctx.globalAlpha=al;drawLines(V0,X0,SKV,Kz.groove,2.2);
    if(A.dry<.5){if(!LOWFX){ctx.globalCompositeOperation='lighter';drawLines(V0,X0,SKV,`rgba(${Kz.vG},.35)`,3.4);ctx.globalCompositeOperation='source-over'}drawLines(V0,X0,SKV,Kz.vOn,1)}else drawLines(V0,X0,SKV,'rgba(200,190,170,.35)',.8);ctx.restore()}
  for(let ri=0;ri<3;ri++){const R0=RINGS[ri],vk=A.vein.skirt>0?cl((A.vein.skirt-(1-R0.z/52)*.8)*4,0,1):0;leafBatch(V0,LR.rings[ri],KZ(R0.z),ri,false,vk)}
  return H}
// the belt: three roots plaited round the waist
const BELT=[0,1,2].map(k=>Array.from({length:25},(_,i)=>{const t=i/24*TAU,z=52+1.3*Math.sin(3*t+k*TAU/3);return revoAt(SKP,SKA,0,t,Math.min(51.6,z),1.6+.4*Math.cos(3*t+k*TAU/3))}));
const BELTL=BELT.map(L0=>L0.map(s=>({p:add(s.p,[0,0,.7]),n:s.n})));
function drawBelt(V0,X0,A,K){drawLines(V0,X0,BELT,K.bark.b,2.6,null,true);drawLines(V0,X0,BELTL,K.bark.l,.8)}

// the corset: the hull of the bark body from the shoulders to the waist; plaques, the grooves (veins), the seed
const ellM=(m)=>({p:ellAt(BC,BRD,AXES,nrm(m)),n:ellN(BRD,AXES,nrm(m))});
const PLAQ=(()=>{const out=[];for(const[e,n,r] of[[-.6,7,2.9],[-.1,8,3.1],[.42,7,2.7]])for(let i=0;i<n;i++){const t=(i+.5*(n%2))/n*TAU;if(Math.abs(wrapA(t))<.35&&e>-.3&&e<.2)continue;
  const m=[Math.cos(e)*Math.cos(t),Math.cos(e)*Math.sin(t),Math.sin(e)],s=ellM(m);let u=cross(s.n,[0,0,1]);if(len(u)<.2)u=[1,0,0];u=nrm(u);out.push({p:s.p,n:s.n,u,v:nrm(cross(s.n,u)),r:r*(.85+.15*Math.cos(i*2.1))})}return out})();
const SEEDM=nrm([1,0,.16]);
function vpath(ks,n){const pts=[];for(let k=0;k<ks.length-1;k++)for(let j=0;j<n;j++){const m=nrm(lerp3(nrm(ks[k]),nrm(ks[k+1]),j/n));pts.push(ellM(m))}pts.push(ellM(ks[ks.length-1]));
  let Lt=0;const f=[0];for(let i=1;i<pts.length;i++){Lt+=len(sub(pts[i].p,pts[i-1].p));f.push(Lt)}pts.forEach((s,i)=>s.f=f[i]/(Lt||1));return pts}
// the veins from the seed: 0 up to her right shoulder, 1 up to her left, 2 up the neck, 3-4 down to the waist
const VEINS=[vpath([SEEDM,[.85,.35,.38],[.42,.62,.68],[-.05,.66,.75]],4),vpath([SEEDM,[.85,-.35,.38],[.42,-.62,.68],[-.05,-.66,.75]],4),vpath([SEEDM,[.8,0,.5],[.45,0,.86]],4),
  vpath([SEEDM,[.88,.26,-.3],[.6,.4,-.78]],4),vpath([SEEDM,[.88,-.26,-.3],[.6,-.4,-.78]],4)];
function vrun(V0,X,S,a,b){const out=[];let cur=[];const cut=()=>{if(cur.length>1)out.push(cur);cur=[]};
  for(let i=1;i<S.length;i++){const r=S[i-1],s=S[i],lo=Math.max(a,r.f),hi=Math.min(b,s.f);if(hi<=lo||(V0.F(X.Rd(r.n))+V0.F(X.Rd(s.n)))/2<=.05){cut();continue}
    const ra=V0.P(X.T(r.p)),sa=V0.P(X.T(s.p)),k0=(lo-r.f)/((s.f-r.f)||1),k1=(hi-r.f)/((s.f-r.f)||1),q0=[lerp(ra[0],sa[0],k0),lerp(ra[1],sa[1],k0)],q1=[lerp(ra[0],sa[0],k1),lerp(ra[1],sa[1],k1)];
    if(!cur.length)cur.push(q0);cur.push(q1);if(hi<s.f)cut()}cut();return out}
// a vein lit from the seed outward; its head is a pearl of light (the warning: it runs even on slow phones, without the halo)
function veinLight(R,K,al,head,th){if(!R.length||al<=.01)return;const w=th||1;ctx.save();ctx.globalAlpha*=Math.min(1,al);if(!LOWFX){ctx.globalCompositeOperation='lighter';strokeRuns(R,`rgba(${K.vG},.35)`,4.6*w);ctx.globalCompositeOperation='source-over'}
  strokeRuns(R,K.vOn,2*w);strokeRuns(R,'#eafff6',.7*w);
  if(head){const r=R[R.length-1],q=r[r.length-1];if(!LOWFX)shine(K.vG,q[0],q[1],8,.55);ctx.fillStyle='#f4fffa';ball(q,2.1);ctx.fill()}ctx.restore()}
function drawBust(V0,XU,A,K,J){const pts=ellSil(V0,BC,BRD,null,XU.T,14);for(const sd of[-1,1])for(const q of crp(V0.P(XU.T([-1,sd*12.6,72])),5.2,8))pts.push(q);
  for(let i=0;i<10;i++){const t=i/10*TAU;pts.push(V0.P(XU.T([Math.cos(t)*8.5*SKA,Math.sin(t)*8.5,52.5])))}
  const H=svol(pts,K.bark,{lw:2.8,rim:.32});J.bust=H;ctx.save();ctx.clip(H.path);
  {const b=bbox(H),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,'rgba(14,6,4,.42)');g.addColorStop(.3,'rgba(14,6,4,0)');g.addColorStop(.8,'rgba(14,6,4,0)');g.addColorStop(1,'rgba(14,6,4,.3)');ctx.fillStyle=g;ctx.fill(H.path)}
  // the plaques of carved bark: a lighter round, a soft groove round it
  const pc=cmix(K.bark.b,K.bark.l,.32);ctx.fillStyle=pc;ctx.strokeStyle='rgba(23,12,7,.55)';ctx.lineWidth=.9;
  ctx.beginPath();for(const pq of PLAQ){const f=V0.F(XU.Rd(pq.n));if(f<=.2)continue;flatPath(V0,CIRC,XU.T(add(pq.p,mul(pq.n,.2))),mul(XU.Rd(pq.u),pq.r),mul(XU.Rd(pq.v),pq.r*.86),true)}
  ctx.globalAlpha=.7;ctx.fill();ctx.stroke();ctx.globalAlpha=1;
  // the grooves of the veins (always there), lit by the running light
  const VR=VEINS.map(S=>vrun(V0,XU,S,0,1)),all=[].concat(...VR);strokeRuns(all,K.groove,2.4);strokeRuns(all,K.vOff,1);
  const lv=[A.vein.aR,A.vein.aL,A.vein.neck,A.vein.dn,A.vein.dn];for(let i=0;i<5;i++){const w=lv[i];if(!w||w[2]<=.01||w[1]<=w[0])continue;veinLight(vrun(V0,XU,VEINS[i],w[0],Math.min(1,w[1])),K,w[2],w[1]<.995)}
  if(A.k2>.5&&A.k2z==null&&A.dry<.5)strokeRuns(all,`rgba(${K.vG},.6)`,1.1);
  ctx.restore();return H}
// the Seed of the Wood: a pointed violet seed with two seams, the mint heart glowing through it, two little leaves beside it
function drawSeed(V0,XU,A,K,J){const s=ellM(SEEDM),n=XU.Rd(s.n),f=V0.F(n);if(f<=-.15)return;const c=XU.T(add(s.p,mul(s.n,1.2))),q=V0.P(c),up=XU.Rd([0,0,1]),al=cl((f+.15)*5,0,1);
  ctx.save();ctx.globalAlpha*=al;
  for(const sd of[-1,1]){const d=nrm(add(XU.Rd([0,sd,0]),mul(up,-.2))),b=add(c,add(mul(XU.Rd([0,sd,0]),1.6),mul(up,-1.4)));leafF(V0,OVL,b,d,nrm(cross(n,d)),6.5,1.7,K.leaf,K,{lw:1.5,vein:false,back:K.back,kb:-.1})}
  const gl=(A.seed+A.seedFl*1.5)*A.glow;if(!LOWFX&&gl>.02)shine(K.seedG,q[0],q[1],10+7*Math.min(1.5,gl),.25+.45*Math.min(1,gl));
  const u=V0.P(up),a=Math.atan2(u[0],-u[1]),r=3.3,g1=Math.min(1,gl);scrPath(TEAR,q,a,r*.95,r*1.05);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(a);
  const g=ctx.createRadialGradient(0,r*.3,0,0,r*.1,r*1.3);
  const core=A.glow>.05?cmix(K.seed.b,cmix(K.seedC,'#ffffff',.3*g1),.45+.55*A.glow):K.seed.b;g.addColorStop(0,core);g.addColorStop(.28+.12*g1,cmix(K.seed.b,K.seedC,.35*A.glow));g.addColorStop(.62,K.seed.b);g.addColorStop(1,K.seed.d);ctx.fillStyle=g;ctx.fill();ctx.save();
  ctx.strokeStyle=cmix(K.seed.d,K.seedC,.3*g1);ctx.lineWidth=.8;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(0,-r*1.3);ctx.quadraticCurveTo(sd*r*.55,0,sd*r*.2,r*.95);ctx.stroke()}
  ctx.restore();ctx.restore();scrPath(TEAR,q,a,r*.95,r*1.05);ctx.strokeStyle=INK;ctx.lineWidth=1.7;ctx.stroke();ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(a);ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.ellipse(-r*.35,-r*.35,r*.17,r*.32,.3,0,TAU);ctx.fill();ctx.restore();
  ctx.restore();J.seedQ=q}

// the arm: the shoulder knot, two bones (ik), the elbow knot, the sleeves of long leaves under the elbow, the hand
function armGeo(X0,XU,A,sd){const H=sd>0?A.hR:A.hL,S=XU.T([SHN[0]+.5,sd*(SHN[1]-1.5),SHN[2]-1]),W=XU.T(H.W),pole=XU.Rd(H.pole||nrm([-.45,sd,-.4])),[E,W2]=ik(S,W,UA,FA,pole);return{S,E,W:W2,H,tgt:H.tgt?H.tgt.map(X0.T):null}}
// the running light along the arm: f over shoulder (0), elbow (.45), wrist (.9), fingertips (1)
function armRun(V0,g,w,K,part){if(!w||w[2]<=.01)return;const f=w[1],seg2=part?[g.E,g.W,.45,.9]:[g.S,g.E,0,.45],a=seg2[2],b=seg2[3];if(f<=a)return;const k=cl((f-a)/(b-a),0,1),q0=V0.P(seg2[0]),q1=V0.P(lerp3(seg2[0],seg2[1],k));
  let nx=-(q1[1]-q0[1]),ny=q1[0]-q0[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if(nx+ny>0){nx=-nx;ny=-ny}const o2=part?.8:1;veinLight([[[q0[0]+nx*o2,q0[1]+ny*o2],[q1[0]+nx*o2,q1[1]+ny*o2]]],K,w[2],f<b&&f<.995,.62)}
function drawUpper(V0,g,K,A,sd){limb3(V0,[g.S,g.E],[3.8,3.2],K.bark,{lw:2.4});armRun(V0,g,A.arm[sd],K,0)}
function drawKnot(V0,c,r,K){const q=V0.P(c);ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.fillStyle=K.bark.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();ctx.fillStyle=K.bark.l;ball([q[0]-r*.32,q[1]-r*.36],r*.42);ctx.fill()}
// the sleeves: three long leaves round the forearm, from its middle back toward the elbow (a cuff that flares), the way the arm goes:
// they lie on the forearm, never hang off it like sticks
function drawSleeves(V0,g,K,A){const ax=nrm(sub(g.W,g.E)),dn=[0,0,-1];let out=nrm(sub(dn,mul(ax,dot(dn,ax))));if(len(out)<.1)out=nrm(sub([-1,0,0],mul(ax,dot([-1,0,0],ax))));const side=nrm(cross(ax,out)),pa=new Path2D();let any=0,tn=1,VS=null;
  for(let i=0;i<3;i++){const off=offK(A,rnd(i+7,5),false);if(off>=1)continue;const th=[-.95,0,.95][i],r=add(mul(out,Math.cos(th)),mul(side,Math.sin(th))),Ln=[15.5,17,15.5][i];
    let b=add(lerp3(g.E,g.W,.62),mul(r,2.6)),d=nrm(add(add(mul(ax,-.8),mul(dn,.3)),mul(r,.42)));const s=nrm(cross(r,d));
    if(off>=0){const u=ez(off);b=add(b,[0,0,-30*u*u]);d=nrm(add(d,mul(side,u*2)));ga(1-sstep(.7,1,off),()=>leafF(V0,OVL,b,d,s,Ln,4.6,K.leaf,K,{back:K.back,lw:1.8,kb:-.18,vein:i===1}));continue}
    const q=V0.P(b),a2=V0.P(mul(d,Ln)),b2=V0.P(mul(s,4.6));traceTo(pa,OVL,a2[0],a2[1],b2[0],b2[1],q[0],q[1]);any=1;
    if(i===1){const f=V0.F(r);tn=lit(V0,r);if(f>.1)VS=[[V0.P(add(b,mul(d,Ln*.14))),V0.P(add(b,mul(d,Ln*.74)))]]}}
  if(!any)return;ctx.lineJoin='round';ctx.fillStyle=tone(K.leaf,tn-.18);ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke(pa);if(VS)strokeRuns(VS,K.nerv,1)}
// the hand: a light palm, three long fingers and the thumb in three pieces (two on slow phones), a dark ring of bark on the knuckle, light
// thorn nails, the fingertips lit like candles when she casts; they grow into roots (the Hand of the Wood) and into twigs (the tree)
function handGeo(g,XU,sd){const H=g.H,W=g.W,u=nrm(XU.Rd(H.u));let w=XU.Rd(H.w);w=nrm(sub(w,mul(u,dot(w,u))));const v=cross(w,u),th=mul(v,-sd);
  const F=[],bases=[[6.2,2.1,4.3,3.4,2.6],[6.5,0,4.8,3.7,2.8],[6.1,-2.1,4.1,3.2,2.4]],ex=H.ext||0,tw=H.twig||0,tl=1+.9*tw;
  for(let j=0;j<3;j++){const[b0,o,l0,l1,l2]=bases[j],c=H.curl[j]||0,sp=((H.spread||0)+tw*.6)*(1-j)*.32;let d=nrm(add(u,mul(th,sp))),q=add(add(W,mul(u,b0)),add(mul(th,o),mul(w,.35))),pts=[q];
    if(ex>0&&g.tgt){const t=g.tgt[j],N=5,c1=add(q,mul(d,6+10*ex));for(let k=1;k<=N;k++){const s2=k/N,a=lerp3(lerp3(q,c1,s2),lerp3(c1,t,s2),s2),fr=add(q,mul(d,(l0+l1+l2)*s2*.9));pts.push(lerp3(fr,a,ex))}F.push(pts);continue}
    const ang=[c*.55,c*.75,c*.6],ls=(LOWFX?[l0+l1*.5,l2+l1*.5]:[l0,l1,l2]).map(l=>l*tl),as=LOWFX?[ang[0]+ang[1]*.5,ang[2]+ang[1]*.5]:ang;let a=0;
    for(let k=0;k<ls.length;k++){a+=as[k]+tw*.18*(k%2?1:-1)*(j-1);const dk=nrm(add(mul(d,Math.cos(a)),mul(w,-Math.sin(a))));q=add(q,mul(dk,ls[k]));pts.push(q)}F.push(pts)}
  {const c=H.curl[3]||0,b=add(add(W,mul(u,2.6)),mul(th,2.5)),d0=nrm(add(mul(u,.75),mul(th,.7))),a1=c*.6,d1=nrm(add(mul(d0,Math.cos(a1)),mul(nrm(add(mul(w,-1),mul(th,-.3))),Math.sin(a1)))),p1=add(b,mul(d0,4.2*tl)),p2=add(p1,mul(d1,3.4*tl));F.push([b,p1,p2])}
  return{W,u,v,w,F}}
function drawHand(V0,hg,H,K,A){const NL=[],HL=[],KN=[],{W,u,v,w,F}=hg,fw=V0.F(w),L=parts(),ex=H.ext||0,tw=H.twig||0,Ts=tw>0?mixT(K.skin,K.bark,tw):K.skin;
  const base=cmix(Ts.b,Ts.l,.3),pc=add(W,mul(u,3.3));
  // the palm: a soft light oval, its back lit at the upper left
  L.add(V0.D(pc),()=>{const pts=ellSil(V0,pc,[3.8,2.9,1.7],{u,v,w},null,10);ctx.lineJoin='round';poly(pts);ctx.fillStyle=base;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();
    const b=bbox(pts);ctx.fillStyle=cmix(Ts.l,'#ffffff',.25);ctx.beginPath();ctx.ellipse(b[0]+(b[2]-b[0])*.38,b[1]+(b[3]-b[1])*.36,(b[2]-b[0])*.18,(b[3]-b[1])*.13,0,0,TAU);ctx.fill()});
  F.forEach((pts,j)=>{const isT=j===3,n=pts.length,root=!isT&&ex>0&&n>4,r0=isT?[2.15,1.8,1.45]:root?pts.map((q,k)=>lerp(2.4,lerp(1.3,2,ex),k/(n-1))*(1+.45*ex*Math.sin(Math.PI*k/(n-1)))):LOWFX?[2.15,1.8,1.35]:[2.2,1.9,1.6,1.3];
    const r=tw>0?r0.map((x,k)=>x*(1-.35*tw*k/(r0.length-1))):r0,mid=pts[1],dep=V0.D(mid)+(dot(sub(mid,pc),w)*fw<0?-.4:.4);
    L.add(dep,()=>{let P2;
      if(root)P2=limb3(V0,pts,r,mixT(Ts,K.bark,cl(ex*1.3,0,1)),{lw:1.6,dark:'rgba(40,24,16,.36)',al:.22});
      else{// a toy finger: one outline, one fill (its knuckle ring, the light along it and the nail come after, all fingers at once)
        P2=pts.map(V0.P);ctx.fillStyle=INK;ctx.beginPath();for(let i=0;i<P2.length-1;i++)hullAdd(P2[i],r[i]+.72,P2[i+1],r[i+1]+.72);ctx.fill();
        ctx.fillStyle=base;ctx.beginPath();for(let i=0;i<P2.length-1;i++)hullAdd(P2[i],Math.max(.4,r[i]-.62),P2[i+1],Math.max(.4,r[i+1]-.62));ctx.fill();
        if(P2.length>2){const a=P2[0],b=P2[2],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*r[1]*.85,ny=dx/l*r[1]*.85;KN.push([[P2[1][0]-nx,P2[1][1]-ny],[P2[1][0]+nx,P2[1][1]+ny]]);
          const sx=nx+ny>0?-1:1;HL.push([[a[0]+sx*nx*.45,a[1]+sx*ny*.45],[lerp(a[0],b[0],.8)+sx*nx*.4,lerp(a[1],b[1],.8)+sx*ny*.4]])}}
      const e=P2[P2.length-1],pr=P2[P2.length-2],dx=e[0]-pr[0],dy=e[1]-pr[1],l=Math.hypot(dx,dy)||1;
      if(!root&&tw<.6){const nk=1-tw/.6,nx=-dy/l*1.15*nk,ny=dx/l*1.15*nk,x0=e[0]-dx/l*.6,y0=e[1]-dy/l*.6;NL.push([[x0+nx,y0+ny],[e[0]+dx/l*1.9*nk,e[1]+dy/l*1.9*nk],[x0-nx,y0-ny]])}
      const tk=(H.tips[j]||0)*A.glow;if(tk>.02&&!root)flameAt([e[0]+dx/l*1.6,e[1]+dy/l*1.6],tk,K)})});
  run(L);if(KN.length)strokeRuns(KN,cmix(K.bark.b,base,.25),1);if(HL.length)strokeRuns(HL,cmix(Ts.l,'#ffffff',.4),.8);
  if(NL.length){ctx.beginPath();for(const t of NL){ctx.moveTo(t[0][0],t[0][1]);ctx.lineTo(t[1][0],t[1][1]);ctx.lineTo(t[2][0],t[2][1]);ctx.closePath()}ctx.fillStyle=K.nail;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke()}}
function flameAt(q,k,K){if(!LOWFX)shine(K.flameG,q[0],q[1]-2,7*k+2,.55*k);scrPath(FLM,[q[0],q[1]-1.6*k],0,2.2*k+.4,3.2*k+.5);ctx.fillStyle=`rgba(${K.flameG},${.85*Math.min(1,k*1.5)})`;ctx.fill();
  ctx.fillStyle=K.flame;ball([q[0],q[1]-1.2*k],1.1*k);ctx.fill()}

// the head: an egg with the pointed chin, the pale face lit at the chin and shaded under the hat, the black moss of the hair over the top,
// the mint eyes (almonds slanting down to the nose under heavy plum lids: her V, the outer corner drawn out like make-up), the long thin
// nose, the crooked smile with two little fangs. With her lights out the eyes are shut (smug lids): never dark holes, never a skull
const HAIRL=Array.from({length:24},(_,i)=>{const t=i/24*TAU,e=lerp(.66,-.3,(1-Math.cos(t))/2)+.08*Math.cos(2*t);return[Math.cos(t)*Math.cos(e),Math.sin(t)*Math.cos(e),Math.sin(e)]});
const EYEM=[-1,1].map(sd=>nrm([1,sd*.4,.07]));
function drawHead(V0,XH,A,K,J){const T=XH.T,P=V0.P,F=V0.F,fwd=F(XH.Rd([1,0,0])),hq=P(T(HC)),gl=A.glow;
  const pts=ellSil(V0,HC,HRD,null,T,14);for(const q of crp(P(T([8.2,0,78.6])),3,8))pts.push(q);for(const q of crp(P(T([9.8,0,75.6])),1.7,6))pts.push(q);
  const H=svol(pts,K.skin,{lw:2.6,rim:.3});J.head=H;
  const NP=[[10.4,0,91.2],[13.2,0,87.8],[14.3,0,85.2],[13.7,0,84]].map(T),NR=[1.75,1.4,1.15,.95];
  ctx.save();ctx.clip(H.path);
  // the hair over the top and the back of the head: the region above the hairline (the part of it that faces us, out to the top of the head)
  {const R=HAIRL.map(m=>({q:P(T(ellAt(HC,HRD,null,m))),v:F(XH.Rd(ellN(HRD,null,m)))}));let s0=-1;for(let i=0;i<R.length;i++)if(R[i].v>0&&R[(i+R.length-1)%R.length].v<=0){s0=i;break}
    ctx.beginPath();if(s0<0){if(R[0].v>0){for(const r of R)ctx.lineTo(r.q[0],r.q[1])}}else{let i=s0,first=null,last=null;while(R[i%R.length].v>0&&i<s0+R.length){const q=R[i%R.length].q;if(!first)first=q;last=q;ctx.lineTo(q[0],q[1]);i++}
      if(first){ctx.lineTo(last[0],last[1]-60);ctx.lineTo(first[0],first[1]-60)}}ctx.closePath();ctx.fillStyle=K.hair;ctx.fill();ctx.strokeStyle=K.hairL;ctx.lineWidth=.9;ctx.stroke()}
  if(fwd>-.45){
    {const top=P(T([4,0,101])),bot=P(T([9,0,76])),g=ctx.createLinearGradient(top[0],top[1],bot[0],bot[1]);g.addColorStop(0,'rgba(48,22,48,.55)');g.addColorStop(.36,'rgba(48,22,48,.12)');g.addColorStop(.62,'rgba(48,22,48,0)');g.addColorStop(1,'rgba(255,236,214,.22)');ctx.fillStyle=g;ctx.fill(H.path)}
    for(const sd of[-1,1]){const n=XH.Rd(nrm([.62,sd*.72,-.25])),f=F(n);if(f<.08)continue;const q=P(T([9.3,sd*6.4,84.4]));ctx.fillStyle=`rgba(70,40,70,${.26*cl((f-.08)*4,0,1)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],2.9*Math.pow(f,.6),1.3,0,0,TAU);ctx.fill()}
    if(A.under>.02&&!LOWFX&&gl>.1){const q=P(T([10,0,80]));ctx.save();ctx.globalCompositeOperation='lighter';shine(K.flameG,q[0],q[1],12,.5*A.under*gl,9);ctx.restore()}
    const eK=A.eyeK2,eye=eK==null?K.eye:cmix(K1.eye,K2.eye,eK),eyeIn=eK==null?K.eyeIn:cmix(K1.eyeIn,K2.eyeIn,eK),eyeG=eK==null?K.eyeG:mixRgb(K1.eyeG,K2.eyeG,eK);
    const on=cl(gl*A.eye,0,1.6),op=A.blink*(1-.4*A.squint)*sstep(.12,.42,on),E=[],nb=P(T([12.2,0,90.6]));
    for(const m of EYEM){const q=P(T(ellAt(HC,HRD,null,m))),v=F(XH.Rd(ellN(HRD,null,m)));if(v>.1)E.push({q,v,rx:3.8*Math.pow(v,.7)})}
    E.sort((a,b)=>b.v-a.v);if(E.length)E[0].q=C.inward(hq,10.4,E[0].q,.6,.74);
    if(E.length>1){const n=E[0],f=E[1];f.q=C.inward(hq,10.4,f.q,.5,.66);f.rx=Math.min(f.rx,Math.max(0,Math.hypot(f.q[0]-n.q[0],f.q[1]-n.q[1])-n.rx-1.4))}
    for(const e of E){if(e.rx<.7)continue;eyeDraw(e.q,e.rx,nb[0]>=e.q[0]?1:-1,op,on,A.squint,eye,eyeIn,eyeG,K,Math.min(1,e.v*2),A.eyeFl)}
    J.eyes=E;
    if(fwd>0){const N2=NP.map(P),sx=F(XH.Rd([0,1,0]))>0?1:-1,k=cl(fwd*3,0,1);ctx.save();ctx.globalAlpha*=k;ctx.strokeStyle='rgba(70,60,80,.38)';ctx.lineWidth=1.2;ctx.lineCap='round';const n0=lerp3(NP[0],NP[1],.45),q0=P(n0);ctx.beginPath();ctx.moveTo(q0[0]+sx*1.2,q0[1]);ctx.quadraticCurveTo(N2[1][0]+sx*1.4,N2[1][1],N2[2][0]+sx*1.2,N2[2][1]);ctx.stroke();
      const tq=N2[2];ctx.fillStyle=K.skin.l;ball([tq[0],tq[1]-.2],1.25);ctx.fill();ctx.fillStyle='rgba(60,40,60,.32)';ctx.beginPath();ctx.ellipse(tq[0],tq[1]+1.6,1.6,.65,0,0,TAU);ctx.fill();ctx.fillStyle='#ffffff';ball([tq[0]-.5,tq[1]-.7],.45);ctx.fill();ctx.restore()}}
  ctx.restore();
  if(fwd>-.45)mouthDraw(V0,XH,A,K);
  if(fwd>-.65&&fwd<.6){ctx.save();const cp=new Path2D();cp.rect(-1e4,-1e4,2e4,2e4);cp.addPath(H.path);ctx.clip(cp,'evenodd');limb3(V0,NP,NR,K.skin,{lw:1.8,dark:'rgba(70,84,66,.35)',al:.25});ctx.restore()}
  return H}
// one eye at q (half width rx, inn = the side of the nose): a mint almond, its inner corner lower (the V), the light inside and a point of
// light, the heavy plum lid over its top third with the outer corner drawn out; shut (op 0) it is a smug lid line
function eyeDraw(q,rx,inn,op,on,sq,eye,eyeIn,eyeG,K,vis,fl){const ry=2.75,ic=[q[0]+inn*rx,q[1]+.55],oc=[q[0]-inn*rx,q[1]-.75],wing=[oc[0]-inn*2.1,q[1]-2.5];
  ctx.lineCap='round';ctx.lineJoin='round';
  if(op<.22){// shut: the lid is down, a curve bowing down from the drawn-out outer corner to the nose
    ctx.fillStyle=K.lid;ctx.beginPath();ctx.moveTo(oc[0],oc[1]-.2);ctx.quadraticCurveTo(q[0],q[1]-ry*.9,ic[0],ic[1]-.2);ctx.quadraticCurveTo(q[0],q[1]+1.5,oc[0],oc[1]-.2);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(wing[0],wing[1]+.6);ctx.lineTo(oc[0],oc[1]);ctx.quadraticCurveTo(q[0],q[1]+1.7,ic[0],ic[1]);ctx.stroke();return}
  const sy=ry*Math.min(1,op),col=cmix('#1f4a3a',eye,cl(on,0,1));
  if(on>.05&&vis>.2)shine(eyeG,q[0],q[1]+.3,7.5,(.28+.3*(fl||0))*Math.min(1,on)*vis);
  ctx.beginPath();ctx.moveTo(ic[0],ic[1]);ctx.quadraticCurveTo(q[0]-inn*rx*.15,q[1]-sy*2.05,oc[0],oc[1]);ctx.quadraticCurveTo(q[0]+inn*rx*.1,q[1]+sy*1.55,ic[0],ic[1]);ctx.closePath();
  ctx.fillStyle=col;ctx.fill();ctx.save();ctx.clip();
  if(on>.05){ctx.fillStyle=cmix(col,eyeIn,cl(on,0,1));ctx.beginPath();ctx.ellipse(q[0]+inn*rx*.1,q[1]+sy*.35,rx*.55,sy*.62,0,0,TAU);ctx.fill()}
  // the lid: everything above its edge, which runs from high at the outer corner down to the inner one
  const d=.45*(1-op)+.4*sq,l0=[oc[0]-inn*.6,q[1]-sy*(.8-d)],l1=[ic[0]+inn*.4,q[1]-sy*(.12-d)];ctx.fillStyle=K.lid;ctx.beginPath();ctx.moveTo(l0[0],l0[1]);ctx.lineTo(l1[0],l1[1]);ctx.lineTo(l1[0],q[1]-sy*3);ctx.lineTo(l0[0],q[1]-sy*3);ctx.closePath();ctx.fill();
  ctx.strokeStyle=K.lidE;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(l0[0],l0[1]-.5);ctx.lineTo(l1[0],l1[1]-.5);ctx.stroke();ctx.restore();
  if(on>.3&&op>.5){ctx.fillStyle='#ffffff';ball([q[0]+inn*rx*.18,q[1]+sy*.22],Math.min(.85,.42+rx*.12));ctx.fill()}
  ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(ic[0],ic[1]);ctx.quadraticCurveTo(q[0]+inn*rx*.1,q[1]+sy*1.55,oc[0],oc[1]);ctx.stroke();
  ctx.lineWidth=1.35;ctx.beginPath();ctx.moveTo(wing[0],wing[1]);ctx.lineTo(l0[0],l0[1]);ctx.lineTo(l1[0],l1[1]);ctx.stroke()}
function mouthDraw(V0,XH,A,K){const T=XH.T,P=V0.P,F=V0.F,mc=[10.1,0,80.6],n=XH.Rd(nrm([.86,0,-.5])),f=F(n);if(f<.1)return;const k=cl((f-.1)*4,0,1);
  const cL=P(T([9.6,-2.9,80.9])),cR=P(T([9.6,2.9,80.4])),c=P(T(mc)),op=A.mouth||0;ctx.save();ctx.globalAlpha*=k;ctx.lineCap='round';ctx.lineJoin='round';
  if(A.blow>.05){const r=.7+.8*A.blow;ctx.fillStyle=K.mIn;ctx.strokeStyle=K.lip;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(c[0],c[1]+.3,r*.9,r*1.15,0,0,TAU);ctx.fill();ctx.stroke()}
  else if(op>.08){const w=Math.hypot(cR[0]-cL[0],cR[1]-cL[1])/2*.95,h=1.1+op*3.2,cx=(cL[0]+cR[0])/2,cy=(cL[1]+cR[1])/2+h*.35;ctx.fillStyle=K.mIn;ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(cx,cy,w,h,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.save();ctx.clip();ctx.fillStyle=K.tongue;ctx.beginPath();ctx.ellipse(cx,cy+h*.9,w*.6,h*.55,0,0,TAU);ctx.fill();ctx.fillStyle=K.fang;ctx.strokeStyle=INK;ctx.lineWidth=.6;for(const sd of[-1,1])tri(cx+sd*w*.45,cy-h-.2,cx+sd*w*.45,cy-h+Math.min(h*.8,1.9),.85);ctx.restore()}
  else{const sm=A.smile,lo=[c[0]+(cL[1]>cR[1]?.2:-.2),c[1]+1.3*sm],a=[cL[0],cL[1]-1*sm],b=[cR[0],cR[1]+.5*sm];
    // the two little fangs hang from the lip, then the lip over them
    if(f>.42){const dn=P(XH.Rd([0,0,-1.6])),dl=Math.hypot(dn[0],dn[1])||1,fx=dn[0]/dl*1.6,fy=dn[1]/dl*1.6;ctx.globalAlpha*=cl((f-.42)*5,0,1);ctx.fillStyle=K.fang;ctx.strokeStyle='rgba(27,22,18,.55)';ctx.lineWidth=.5;
      for(const u of[.38,.6]){const x0=(1-u)*(1-u)*a[0]+2*u*(1-u)*lo[0]+u*u*b[0],y0=(1-u)*(1-u)*a[1]+2*u*(1-u)*lo[1]+u*u*b[1];tri(x0-fx*.25,y0-fy*.25,x0+fx,y0+fy,.8)}ctx.globalAlpha=k}
    ctx.strokeStyle=K.lip;ctx.lineWidth=1.25;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(lo[0],lo[1],b[0],b[1]);ctx.stroke()}
  ctx.restore()}
// the collar of leaves round the back of the neck: the inside faces her (the leaf colour), the outside is the lighter back
function collarGeo(XU,A){const out=[];COL.forEach((c,i)=>{const outer=i===0||i===4,off=offK(A,outer?.15+.5*rnd(i,9):.4+.6*rnd(i,9),outer);if(off>=1)return;
    const g=c.g*(1+.25*A.ruff+.6*A.collar),be=.42+.12*A.collar+.2*A.ruff,d=nrm([-Math.sin(be)*Math.cos(g),Math.sin(g),Math.cos(be)*Math.cos(g)]),s=nrm(cross(d,[1,0,0]));
    let b=c.b,dd=d;if(off>=0){const u=ez(off),rad=nrm([c.b[0],c.b[1],0]);b=add(b,add(mul(rad,10*u),[0,0,-60*u*u]));dd=nrm(add(mul(d,Math.cos(u*2.4)),mul(rad,Math.sin(u*2.4))))}
    const bw=XU.T(b),dw=XU.Rd(dd),sw=XU.Rd(s);out.push({i,b:bw,d:dw,s:sw,L:c.L,W:c.W,mid:XU.T(add(b,mul(dd,c.L*.5))),z:c.b[2]+c.L*.5,al:off>=0?1-sstep(.7,1,off):1})});return out}
// the hair of black moss: two locks down in front of the shoulders, three down the back under the collar (from the head to the body)
function lock(XH,XU,pts,ph,amp){return pts.map((q,i)=>{const u=i/(pts.length-1),h=XH.T(q),b=XU.T(q),w=sstep(.25,.85,u),s=Math.sin(ph-u*2.4)*amp*u;return add(lerp3(h,b,w),[s*.3,s,0])})}
function drawLock(V0,pts,rs,K){drawLocks(V0,[pts],rs,K)}
// locks of hair side by side (the three down her back): one outline, one fill, the strands and the light tips in one stroke each
function drawLocks(V0,PL,rs,K){const PS=PL.map(pts=>pts.map(q=>V0.P(q))),lw=2.1;ctx.fillStyle=INK;ctx.beginPath();for(const P2 of PS)for(let i=0;i<P2.length-1;i++)hullAdd(P2[i],rs[i]+lw/2,P2[i+1],rs[i+1]+lw/2);ctx.fill();
  ctx.fillStyle=cmix(cmix(K.hair,K.hairL,.25),K.hair,.5);ctx.beginPath();for(const P2 of PS)for(let i=0;i<P2.length-1;i++)hullAdd(P2[i],Math.max(.3,rs[i]-lw/2+.1),P2[i+1],Math.max(.3,rs[i+1]-lw/2+.1));ctx.fill();
  ctx.strokeStyle=K.hairL;ctx.lineWidth=.8;ctx.lineCap='round';ctx.beginPath();for(const P2 of PS)for(let i=0;i<P2.length-1;i++){const a=P2[i],b=P2[i+1];ctx.moveTo(lerp(a[0],b[0],.1)-rs[i]*.3,lerp(a[1],b[1],.1));ctx.lineTo(lerp(a[0],b[0],.9)-rs[i+1]*.3,lerp(a[1],b[1],.9))}ctx.stroke();
  ctx.fillStyle=K.hairT;ctx.beginPath();const re=rs[rs.length-1]*.7;for(const P2 of PS){const e=P2[P2.length-1];ctx.moveTo(e[0]+re,e[1]);ctx.arc(e[0],e[1],re,0,TAU)}ctx.fill()}

// the halo of thorns of the Spiral: eight thorns on a ring of bark in the plane behind the collar (leaning back with it), turning; a soft
// light runs from thorn to thorn (one fires every 0.11 s: a chase of light, never the whole halo flashing)
const HALC=[-13,0,97],HALU=[0,1,0],HALV=nrm([-.41,0,.91]);
function drawHalo(V0,XU,A,K,p){const k=A.halo;if(k<=.01)return;const c=XU.T(HALC),u=XU.Rd(HALU),v=XU.Rd(HALV),R0=19*(.4+.6*k),Lh=9.5*k,ch=((p-.27)*3.2/.11)%8,P=V0.P;
  const at=(t,r)=>P(add(c,add(mul(u,Math.cos(t)*r),mul(v,Math.sin(t)*r))));const qc=P(c);
  if(!LOWFX)shine(K.vG,qc[0],qc[1],R0+10,.14*k+.35*A.haloPulse);
  const ring=[];for(let i=0;i<16;i++)ring.push(at(i/16*TAU,R0));ctx.lineJoin='round';poly(ring);ctx.strokeStyle=INK;ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle=K.bark.b;ctx.lineWidth=1.4;ctx.stroke();
  const TH=[],TL=[],LT=[];for(let i=0;i<8;i++){const a=A.haloRot+i*TAU/8,b=at(a,R0),e=at(a,R0+Lh),b1=at(a-.13*k,R0),b2=at(a+.13*k,R0);TH.push([b1,e,b2]);TL.push([[lerp(b[0],e[0],.2),lerp(b[1],e[1],.2)],[lerp(b[0],e[0],.85),lerp(b[1],e[1],.85)]]);
    const d=Math.min(Math.abs(ch-i),8-Math.abs(ch-i)),lt=(p>.27&&p<.85?Math.max(0,1-d*.9):0)+A.haloPulse;if(lt>.05)LT.push([e,lt])}
  ctx.beginPath();for(const t of TH){ctx.moveTo(t[0][0],t[0][1]);ctx.lineTo(t[1][0],t[1][1]);ctx.lineTo(t[2][0],t[2][1]);ctx.closePath()}ctx.fillStyle=K.bark.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke();
  strokeRuns(TL,K.spine,.7);
  for(const[e,lt] of LT){if(!LOWFX)shine(K.vG,e[0],e[1],6,.6*Math.min(1,lt));ctx.fillStyle=cmix(K.spine,K.vOn,Math.min(1,lt));ball(e,1.2);ctx.fill()}}
// the hat: its own camera on the head (it leans back so the brim lifts off the eyes); a cone of plaited twigs on a thick woven brim, the
// crooked tip with a big bud, the twigs of the brim, three lanterns of spores hanging from them; in the autumn two crooked horns of branches
function hatFrame(A,XH){const h=A.hat;if(h.free)return frm([0,0,0],mkM(h.free.tilt,h.free.roll,h.free.yaw),h.free.pos,null);return frm([0,0,0],mkM(HATT+h.tilt,h.roll,h.yaw),add(HAT0,h.off),XH)}
function tipPts(A){const k=A.tipUp,sw=A.hat.sw||0,dr=A.hat.droop||0;return TIP1.map((q,i)=>{let r=lerp3(q,TIP2[i],k);if(!i)return r;r=sub(r,[0,0,22]);r=rotY(r,sw*i*.5-dr*.32*i);if(dr)r=rotX(r,dr*.2*i);return add(r,[0,0,22])})}
function lantPos(XT,A,i){const l=LANTS[i],b=XT.T([Math.cos(l.a)*l.r,Math.sin(l.a)*l.r,.6]),th=(LOWFX?0:A.lantA*Math.sin(A.lantPh+l.ph))*A.lantK,ax=XT.Rd([Math.cos(l.a),Math.sin(l.a),0]);
  const d=nrm(add([0,0,-1],mul(ax,Math.sin(th)*1.4)));return{b,c:add(b,mul(d,l.th)),d}}
function drawLantern(V0,L0,K,k,big){const qb=V0.P(L0.b),qc=V0.P(L0.c),r=(big||2.6);ctx.lineCap='round';ctx.strokeStyle='#14201a';ctx.lineWidth=1.3;seg(qb,qc);ctx.stroke();
  if(!LOWFX&&k>.02)shine(K.lantG,qc[0],qc[1]+r,r*3.4,.45*k);
  ctx.beginPath();ctx.ellipse(qc[0],qc[1]+r*.8,r*.9,r*1.05,0,0,TAU);ctx.fillStyle=k>.02?cmix(K.lant.b,K.lant.l,.3):K.lant.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();
  if(k>.02){ctx.fillStyle=cmix(K.lant.l,K.lantC,k);ball([qc[0]-r*.12,qc[1]+r*.9],r*.42);ctx.fill()}
  ctx.fillStyle=K.calyx;ctx.beginPath();ctx.moveTo(qc[0]-r*.95,qc[1]+r*.55);ctx.quadraticCurveTo(qc[0]-r*.3,qc[1]-r*.5,qc[0],qc[1]-r*.15);ctx.quadraticCurveTo(qc[0]+r*.3,qc[1]-r*.5,qc[0]+r*.95,qc[1]+r*.55);
  ctx.lineTo(qc[0]+r*.35,qc[1]+r*.2);ctx.lineTo(qc[0],qc[1]+r*.6);ctx.lineTo(qc[0]-r*.35,qc[1]+r*.2);ctx.closePath();ctx.fill()}
// a bud: a violet teardrop pointing along up (screen), a little green calyx round its foot, a glint; it glows (k)
function drawBud(V0,c,up,r,K,k,KL){const q=V0.P(c),u=V0.P(up),a=Math.atan2(u[0],-u[1]),ca=Math.cos(a),sa=Math.sin(a),R=(x,y)=>[q[0]+x*ca-y*sa,q[1]+x*sa+y*ca];if(!LOWFX&&k>.02)shine(K.budG,q[0],q[1],r*3.2,.45*k);
  const T=k>.02?K.bud:T3(cmix(K.bud.l,K.bud.d,.5),cmix(K.bud.b,K.bud.d,.5),K.bud.d);scrPath(TEAR,q,a,r,r);ctx.fillStyle=cmix(T.b,T.l,.3*Math.min(1,k)+.1);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  const h=R(-r*.32,-r*.25);ctx.fillStyle=cmix(T.l,'#ffffff',.55*k);ball(h,r*.3);ctx.fill();
  if(KL){const pts=[[-r*.95,r*.45],[-r*.55,r*1.2],[0,r*1.15],[r*.55,r*1.2],[r*.95,r*.45],[r*.3,r*.75],[0,r*.4],[-r*.3,r*.75]].map(v=>R(v[0],v[1]));ctx.fillStyle=KL.calyx;poly(pts);ctx.fill()}}
// the bud of the hat as it bursts into a winter-cherry lantern (the autumn): k2 0 the violet bud .. 1 the orange lantern
function hatBud(V0,c,up,r,k,lit,k2){if(k2<=0){drawBud(V0,c,up,r,K1,lit,K1);return}if(k2>=1){drawBud(V0,c,up,r*1.15,K2,lit,K2);return}drawBud(V0,c,up,r*(1+.15*k2+.25*Math.sin(k2*Math.PI)),pal(k2,0),lit+.5*Math.sin(k2*Math.PI),pal(k2,0))}
function twigRun(V0,XT,t){const a=t[0],l=t[1],u=t[2],R0=BRIM-1,b=[Math.cos(a)*R0,Math.sin(a)*R0,-.2],m=[Math.cos(a)*(R0+l*.5),Math.sin(a)*(R0+l*.5),-.2+u*1.2],e=[Math.cos(a+.15*u)*(R0+l),Math.sin(a+.15*u)*(R0+l),-.2+u*2.6];return[b,m,e].map(q=>V0.P(XT.T(q)))}
function drawTwigs(R,K){if(!R.length)return;strokeRuns(R,INK,3.4);strokeRuns(R,K.hat.b,1.6)}
function drawHorn(V0,XT,h,K,k){const pts=h.pts.map(XT.T),n=pts.length,k1=cl(k,0,1);if(k1<=0)return;const rs=[2.4,2,1.6,1.3,1.1];let P3=pts;
  if(k1<1){const f=k1*(n-1),m=Math.floor(f),u=f-m;P3=pts.slice(0,m+1);if(m<n-1)P3.push(lerp3(pts[m],pts[m+1],u));if(P3.length<2)P3=[pts[0],lerp3(pts[0],pts[1],Math.max(.05,u))]}
  limb3(V0,P3,rs.slice(0,P3.length).map(r=>r*(.6+.4*k1)),K.hat,{lw:2});
  if(k1>.6){const s=pts[2],e=XT.T(add(h.pts[2],[1.5,h.sd*2.2,3.6].map(v=>v*sstep(.6,1,k1))));limb3(V0,[s,e],[1.1,.7],K.hat,{lw:1.6,noShade:true})}}
function drawHat(V0,XT,A,K,J,Kp){const P=V0.P,F=V0.F;
  // the brim: a thick woven disc (its underside shows under the top), one ring of the weave, the warm light on its front edge
  const brim=()=>{const c0=P(XT.T([0,0,-.7])),c1=P(XT.T([0,0,-2.6])),ax=P(XT.Rd([BRIM,0,0])),ay=P(XT.Rd([0,BRIM,0])),hx=Math.hypot(ax[0],ay[0]),hy=Math.hypot(ax[1],ay[1]);ctx.lineJoin='round';
    trace(CIRC,ax[0],ax[1],ay[0],ay[1],c1[0],c1[1]);ctx.fillStyle=K.hat.d;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();
    trace(CIRC,ax[0],ax[1],ay[0],ay[1],c0[0],c0[1]);ctx.fillStyle=grad3([c0[0]-hx,c0[1]-hy,c0[0]+hx,c0[1]+hy],T3(K.hat.b,cmix(K.hat.b,K.hat.d,.45),K.hat.d));ctx.fill();ctx.stroke();
    const k=.83;trace(CIRC,ax[0]*k,ax[1]*k,ay[0]*k,ay[1]*k,c0[0],c0[1]);ctx.setLineDash([2.4,1.8]);ctx.strokeStyle=K.thread;ctx.lineWidth=.9;ctx.stroke();ctx.setLineDash([])};
  const cone=()=>{const pts=[];for(const[z,r] of HATC)for(let i=0;i<8;i++){const t=(i+.5)/8*TAU;pts.push(P(XT.T([Math.cos(t)*r,Math.sin(t)*r,z])))}const H=svol(pts,K.hat,{lw:2.6,rim:.3});J.hat=H;ctx.save();ctx.clip(H.path);
    drawLines(V0,XT,HTW,K.thread,.9);drawLines(V0,XT,HRG,K.thread,1.1,[2.2,1.6]);
    {const b=bbox(H),g=ctx.createLinearGradient(0,b[1],0,b[3]);g.addColorStop(0,'rgba(20,10,4,0)');g.addColorStop(.7,'rgba(20,10,4,.08)');g.addColorStop(1,'rgba(20,10,4,.42)');ctx.fillStyle=g;ctx.fill(H.path)}
    // the crack of the defeat: a jagged line of light up the cone
    if(A.hat.crack>.01){const n=7,m=Math.max(2,Math.ceil(n*A.hat.crack)),R=[];for(let i=0;i<m;i++){const z=i/(n-1)*21,t=.15+.35*Math.sin(i*2.3),s=revoAt(HATP,1,0,t,z,.3);R.push(P(XT.T(s.p)))}
      ctx.globalAlpha=1-sstep(.9,1,A.hat.crack)*.4;strokeRuns([R],'rgba(10,6,4,.9)',2.2);strokeRuns([R],K.vOn,.9);ctx.globalAlpha=1}
    ctx.restore();drawLines(V0,XT,HBD,K.hat.d,2.4,null,true)};
  const back=[],front=[],TB=[],TF=[];const put=(rad,f)=>{(F(XT.Rd(rad))<0?back:front).push(f)};
  TWIGS.forEach(t=>(F(XT.Rd([Math.cos(t[0]),Math.sin(t[0]),0]))<0?TB:TF).push(twigRun(V0,XT,t)));back.push(()=>drawTwigs(TB,K));front.push(()=>drawTwigs(TF,K));
  if(A.horns>0)HORNS.forEach(h=>put([0,h.sd,.3],()=>drawHorn(V0,XT,h,K,A.horns)));
  for(const f of back)f();
  brim();
  const tp=tipPts(A).map(XT.T),tipB=tp[tp.length-1],up=XT.Rd([0,0,1]);
  limb3(V0,tp,TIPR,K.hat,{lw:2.2});
  const tipBudBack=V0.D(tipB)<V0.D(XT.T([0,0,18])),bk2=A.budK2,lit0=(A.budOn[0]||0)*(.8+.2*Math.sin(A.budPh*2));
  const tipBud=()=>hatBud(V0,add(tipB,XT.Rd([-.6,0,.6])),nrm(sub(tipB,tp[tp.length-2])),2.7*(1+.2*A.bud[0]),0,lit0,bk2?bk2[0]:Kp);
  if(tipBudBack)tipBud();
  cone();
  BUDS.forEach((b,i)=>{if(A.budHide[i]>.5)return;const n=XT.Rd(nrm([b[0],b[1],2])),f=F(n);if(f<-.1)return;ga(cl((f+.1)*5,0,1),()=>hatBud(V0,XT.T(b),up,2.1*(1+.35*(A.bud[i]||0)),0,(A.budOn[i+1]==null?1:A.budOn[i+1])*(.7+.3*Math.sin(A.budPh*2+i*2.1))+.6*(A.bud[i]||0),bk2?bk2[i%bk2.length]:Kp))});
  for(const[t,z] of[[.9,6.5],[-1.4,12.5],[2.7,15]]){const s2=revoAt(HATP,1,0,t,z,.3),n=XT.Rd(s2.n),f=F(n);if(f<.1)continue;const b=XT.T(s2.p),d=nrm(add(mul(up,.7),mul(n,.5))),sv=nrm(cross(n,up));
    leafF(V0,OVL,b,d,sv,6,1.7,K.leaf,K,{lw:1.5,vein:false})}
  if(!tipBudBack)tipBud();
  for(const f of front)f()}

// the roots of her feet: two big ones in front and two small ones at the sides, the moss down their backs; they reach and grip
function footPts(A,sd,i){const F0=FEET[i],F=i===0?A.ft[sd>0?1:0]:null,e=F?F.e:0,l=F?F.l:0,g=F?F.g:0,side=i===1?A.ftSide[sd>0?1:0]:0,mv=A.tr.mv,ca=Math.cos(mv*.35),sa=Math.sin(mv*.35),gk=A.ftK;
  return F0.pts.map((q,j)=>{const u=j/(F0.pts.length-1);let x=q[0],y=sd*q[1],z=q[2];if(i===0){x+=9*e*u;z+=l*u*u+(j===F0.pts.length-1?-g*.5:j===F0.pts.length-2?g*1.6:0)}else{x+=2*side*u;z+=.8*side*u}
    if(i===0&&sd>0&&A.tap>0)z+=3*A.tap*u*u;const tk=Math.max(A.ftTuck,1-gk);if(tk>0){x=lerp(x,q[0]*.35,tk);y=lerp(y,sd*q[1]*.55,tk)}
    const rx=x*ca-y*sa*u,ry=x*sa*u+y*ca;return[i===0?lerp(x,rx,e):x,i===0?lerp(y,ry,e):y,Math.max(0,z)]})}
// many roots at once (the train lying on the floor, the four roots of her feet): one outline round all of them, one fill in three tones
// across the bundle, the dark side and the light along each, the moss down their backs and its tufts (a few strokes for all of them)
function rootBundle(V0,R,K,o){o=o||{};const lw=o.lw||2.2,PS=R.map(r=>r.pts.map(q=>V0.P(q)));if(!PS.length)return PS;let sr=0,nr=0;
  ctx.fillStyle=INK;ctx.beginPath();PS.forEach((P2,j)=>{const rs=R[j].rs;for(let i=0;i<P2.length-1;i++)hullAdd(P2[i],rs[i]+lw/2,P2[i+1],rs[i+1]+lw/2)});ctx.fill();
  const m=PS[o.main||0],rm=R[o.main||0].rs[0];ctx.fillStyle=limbGrad(m[0],m[m.length-1],rm*1.2,K.bark);
  ctx.beginPath();PS.forEach((P2,j)=>{const rs=R[j].rs;for(let i=0;i<P2.length-1;i++)hullAdd(P2[i],Math.max(.3,rs[i]-lw/2+.1),P2[i+1],Math.max(.3,rs[i+1]-lw/2+.1))});ctx.fill();
  const DK=[],LT=[],M1=[],M2=[],TF=[];
  PS.forEach((P2,j)=>{const rs=R[j].rs,n=P2.length,d=[],l=[];for(let i=0;i<n;i++){const a=P2[Math.max(0,i-1)],b=P2[Math.min(n-1,i+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const ll=Math.hypot(nx,ny)||1;nx/=ll;ny/=ll;if(nx+ny<0){nx=-nx;ny=-ny}
      const r=Math.max(.3,rs[i]-lw/2);sr+=r;nr++;if(r<1.2)break;d.push([P2[i][0]+nx*r*.36,P2[i][1]+ny*r*.36]);l.push([P2[i][0]-nx*r*.5,P2[i][1]-ny*r*.5])}if(d.length>1){DK.push(d);LT.push(l)}
    if(!o.noMoss){const top=R[j].pts.map((q,i)=>V0.P([q[0],q[1],q[2]+rs[i]*.62])),h=Math.ceil(n/2);M1.push(top.slice(0,h));M2.push(top.slice(h-1,n-1));for(let i=1;i<n-1;i++)TF.push([top[i][0]-.4,top[i][1]-.3,Math.max(.6,rs[i]*.22)])}});
  const ar=sr/Math.max(1,nr);ctx.lineCap='round';ctx.lineJoin='round';strokeRuns(DK,'rgba(20,8,4,.34)',Math.max(.6,ar*.62));strokeRuns(LT,wa(.2),Math.max(.6,ar*.3));
  if(!o.noMoss){strokeRuns(M1,K.mossD,Math.max(1,ar*.75));strokeRuns(M2,K.mossD,Math.max(.8,ar*.42));ctx.fillStyle=K.mossT;ctx.beginPath();for(const t of TF){ctx.moveTo(t[0]+t[2],t[1]);ctx.arc(t[0],t[1],t[2],0,TAU)}ctx.fill()}
  return PS}
function drawRoot(V0,pts,rs,K,o){o=o||{};const P2=limb3(V0,pts,rs,K.bark,{lw:2.2});
  const top=pts.map((q,i)=>V0.P(add(q,[0,0,rs[i]*.62])));ctx.strokeStyle=K.mossD;ctx.lineWidth=Math.max(1,rs[1]*.7);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();for(let i=0;i<top.length-1;i++){const a=top[i],b=top[i+1];if(i===0)ctx.moveTo(lerp(a[0],b[0],.25),lerp(a[1],b[1],.25));ctx.lineTo(i===top.length-2?lerp(a[0],b[0],.7):b[0],i===top.length-2?lerp(a[1],b[1],.7):b[1])}ctx.stroke();
  ctx.fillStyle=K.mossT;ctx.beginPath();for(let i=1;i<top.length-1;i++){const r=Math.max(.6,rs[i]*.22);ctx.moveTo(top[i][0]-.4+r,top[i][1]-.3);ctx.arc(top[i][0]-.4,top[i][1]-.3,r,0,TAU)}ctx.fill()
  // the running light along it (from its root, or from its tip with o.rev)
  if(o.lit>0){const n=P2.length,R=[];const rev=o.rev,Q=rev?P2.slice().reverse():P2,k=o.lit*(n-1);R.push(Q[0]);for(let i=1;i<n;i++){if(i<=k)R.push(Q[i]);else{const u=k-(i-1);if(u>0)R.push([lerp(Q[i-1][0],Q[i][0],u),lerp(Q[i-1][1],Q[i][1],u)]);break}}veinLight([R],K,o.al==null?1:o.al,o.lit<.99)}}

// the train: soft shadow under it, the three plaited roots and the two thin ones, moss on their backs, leaflets and three violet mushrooms
// that glow like the ones of the sanctuary. It bends away from the way she moves (o.mv), a wave running from the hips to its tip; it can
// wind round her (the cocoon of Sprofonda, the trunk of the tree), rear up behind her like a knot of snakes, dive into the floor, open into
// the three arms of her sign (the Rite)
function trainGeo(A,p){const tr=A.tr,del=1.22*Math.sin(tr.mv||0),out=[],sk=A.fall>=.5?1.15:1,gk=A.trK,prof=skirtProf(A);
  TRS.forEach((s,i)=>{const N=s.th?6:4,pts=[],rs=[],ii=s.th?i:i-3;
    for(let k=0;k<N;k++){const u=k/(N-1);let x=lerp(s.a[0],s.b[0],u*gk),y=lerp(s.a[1],s.b[1],u*gk)+(s.th?2.6*Math.sin(u*TAU*1.15+s.ph)*sstep(0,.25,u):0),z=lerp(s.a[2],s.b[2],Math.pow(u*gk,.6));
      if(tr.curl&&u>.6){const c=tr.curl*(u-.6)/.4;z+=6*c*c;x+=8*c*c}
      const ang=del*Math.pow(u,.8)+(tr.wave?.16*Math.sin(TAU*(p-u*.75))*u:0),dx=x-s.a[0],dy=y;const c=Math.cos(ang),sn=Math.sin(ang);x=s.a[0]+dx*c-dy*sn;y=dx*sn+dy*c;
      let q=[x,y,z];
      // rearing up behind her: S curves rising to 50, the tips curling forward like heads
      if(tr.up>0){const yy=s.th?(i-1)*7:(i===3?-13:13),hh=s.th?50-6*Math.abs(i-1):30,up=[-17-14*u+6*u*u*u,yy*(1+.4*u)+3.5*Math.sin(u*TAU+i*1.7),4+hh*Math.sin(Math.PI*.62*u)+4*Math.sin(u*TAU*1.5+i)];q=lerp3(q,up,ez(tr.up))}
      // diving into the floor behind her (cut where it goes in)
      if(tr.dive>0){const yy=s.th?(i-1)*8:(i===3?-15:15),xe=s.th?-30:-27,dv=[lerp(-16,xe,u),lerp(s.a[1],yy,u),Math.max(0,4.5*Math.sin(Math.PI*u*.9)+4*(1-u)-1.2*u)+.4*Math.sin(p*90+i)*(u>.6?1:0)];q=lerp3(q,dv,ez(tr.dive))}
      // the three arms of her sign at 120 degrees (thick), the thin ones between
      if(tr.sign>0){const aa=s.th?Math.PI+(i-1)*TAU/3:Math.PI+(i===3?-1:1)*TAU/6,r0=lerp(15,s.th?42:32,u),sg=[Math.cos(aa)*r0*SKA,Math.sin(aa)*r0,Math.max(0,4*(1-u)+3*Math.sin(Math.PI*u)-2*u)];q=lerp3(q,sg,ez(tr.sign))}
      // winding round her, up the gown
      if((tr.mode==='coc'||tr.mode==='trunk')&&tr.k>0){const tk=tr.mode==='trunk',zz=(tk?3+u*26:3+u*40)*(s.th?1:.7),th0=Math.PI+(s.th?(i-1)*2.1:(i===3?-1.05:1.05)),th=th0+u*TAU*(tk?.9:1.25)*(s.th?1:.6),rr=revoAt(prof,SKA,0,th,zz,2.6+(s.th?0:1)).p;
        let cq=rr;if(tk&&!s.th){const a2=th0,r2=lerp(21,40,u);cq=[Math.cos(a2)*r2,Math.sin(a2)*r2,Math.max(0,2*(1-u))]}q=lerp3(q,cq,ez(tr.k))}
      pts.push(q);rs.push(lerp(s.r0,s.r1,Math.pow(u,.85))*sk*(.4+.6*gk))}
    out.push({i,pts,rs,th:s.th})});return out}
function trainHidden(V0,X0,s){const c=V0.P(X0.T([0,0,0])),dc=V0.D(X0.T([0,0,20]));for(const q3 of s.pts){const w=X0.T(q3);if(V0.D(w)>dc)return false;const q=V0.P(w),sy=q[1]-c[1],hw=lerp(21,8,cl(-sy/50,0,1));if(sy>-2||sy<-48||Math.abs(q[0]-c[0])>hw-7)return false}return true}
function drawTrain(V0,X0,G0,K,A,only){const P=V0.P;ctx.lineCap='round';ctx.lineJoin='round';const lying=A.tr.up<.3&&A.tr.k<.3;G0=G0.map(s=>lying&&trainHidden(V0,X0,s)?Object.assign({},s,{hid:1}):s);
  if(!only&&lying)for(const th of[0,1]){const R=[];for(const s of G0)if(!s.hid&&s.th===th)R.push(s.pts.map(q=>{const w=P(X0.T([q[0],q[1],0]));return[w[0]+1,w[1]+2]}));if(R.length)strokeRuns(R,'rgba(8,4,8,.22)',th?14:9.2)}
  const order=[3,4,0,2,1],lit=A.tr.litRev||0,SP=[];
  if(lying&&!only){const R=[];for(const i of order){const s=G0[i];if(!s.hid)R.push({pts:s.pts.map(X0.T),rs:s.rs,th:s.th,i})}const PS=rootBundle(V0,R,K,{main:R.length-1});
    // the running light along each root, from its tip (Radici della Cripta)
    if(lit>0)R.forEach((r,j)=>{const Q=PS[j].slice().reverse(),n=Q.length,k=cl(lit*1.15-(r.i===1?0:.12),0,1)*(n-1),RR=[Q[0]];for(let i=1;i<n;i++){if(i<=k)RR.push(Q[i]);else{const u=k-(i-1);if(u>0)RR.push([lerp(Q[i-1][0],Q[i][0],u),lerp(Q[i-1][1],Q[i][1],u)]);break}}if(RR.length>1)veinLight([RR],K,1,k<n-1.01)});
    if(A.fall>=.5&&A.dry<.5)for(const r of R)if(r.th)for(let k=1;k<r.pts.length-1;k+=2)SP.push([P(r.pts[k]),P(add(r.pts[k],[0,0,r.rs[k]+2.6]))])}
  else for(const i of order){const s=G0[i];if(s.hid||(only&&!only(s)))continue;const pts=s.pts.map(X0.T);drawRoot(V0,pts,s.rs,K,{lit:lit>0?cl(lit*1.15-(i===1?0:.12),0,1):0,rev:true,al:lit>0?1:0});
    if(A.fall>=.5&&s.th&&A.dry<.5)for(let k=1;k<pts.length-1;k+=2)SP.push([P(pts[k]),P(add(pts[k],[0,0,s.rs[k]+2.6]))])}
  if(SP.length){ctx.beginPath();for(const[q,e] of SP){const dx=e[0]-q[0]+1,dy=e[1]-q[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*1.1,ny=dx/l*1.1;ctx.moveTo(q[0]-1+nx,q[1]+ny);ctx.lineTo(e[0],e[1]);ctx.lineTo(q[0]-1-nx,q[1]-ny);ctx.closePath()}ctx.fillStyle=K.spine;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke()}
  if(only||!lying||A.trK<.6)return;
  {const pa=new Path2D();let any=0;for(const[si,u] of[[2,.3],[1,.56],[0,.74]]){const s=G0[si];if(s.hid)continue;const k=Math.min(s.pts.length-2,Math.floor(u*(s.pts.length-1))),q=V0.P(X0.T(add(s.pts[k],[0,0,s.rs[k]*.7]))),d=V0.P(X0.Rd(mul(nrm([.3*Math.sin(k+si),.9,.35]),6))),sv=V0.P(X0.Rd([1.7,0,0]));traceTo(pa,OVL,d[0],d[1],sv[0],sv[1],q[0],q[1]);any=1}
    if(any){ctx.fillStyle=K.leaf.b;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.stroke(pa)}}
  {const MS=[];for(const m of SHROOMS){const s=G0[m.s];if(s.hid)continue;const f=m.u*(s.pts.length-1),k=Math.min(s.pts.length-2,Math.floor(f)),u=f-k,c=X0.T(add(lerp3(s.pts[k],s.pts[k+1],u),[0,0,lerp(s.rs[k],s.rs[k+1],u)*.8])),b=V0.P(c);MS.push([b,[b[0],b[1]-m.r*1.1],m.r])}
    if(MS.length){if(!LOWFX)for(const[,t,r] of MS)shine(K.capG,t[0],t[1],r*3.4,.4);strokeRuns(MS.map(m=>[m[0],m[1]]),K.stem,2);ctx.beginPath();for(const[,t,r] of MS){ctx.moveTo(t[0]+r,t[1]+.2);ctx.ellipse(t[0],t[1]+.2,r,r*.72,0,TAU,Math.PI,true);ctx.closePath()}
      ctx.fillStyle=K.cap;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle=K.dots;ctx.beginPath();for(const[,t,r] of MS){ctx.moveTo(t[0]-r*.15,t[1]-r*.4);ctx.arc(t[0]-r*.35,t[1]-r*.4,r*.2,0,TAU);ctx.moveTo(t[0]+r*.45,t[1]-r*.5);ctx.arc(t[0]+r*.3,t[1]-r*.5,r*.15,0,TAU)}ctx.fill()}}
  // where the train goes into the floor: the dark holes and the broken slabs
  const hk=Math.max(sstep(.25,.75,A.tr.dive),sstep(.25,.75,A.tr.sign));if(hk>.01)for(const s of G0){const e=P(X0.T(s.pts[s.pts.length-1]));ctx.fillStyle=`rgba(12,6,4,${.85*hk})`;ctx.beginPath();ctx.ellipse(e[0],e[1],s.rs[0]*1.1+1.5,(s.rs[0]*1.1+1.5)*.5,0,0,TAU);ctx.fill()}}
function shroom(V0,c,r,K){const b=V0.P(c),t=[b[0],b[1]-r*1.1];if(!LOWFX)shine(K.capG,t[0],t[1],r*3.4,.4);ctx.lineCap='round';ctx.strokeStyle=K.stem;ctx.lineWidth=r*.8;seg(b,t);ctx.stroke();
  ctx.beginPath();ctx.ellipse(t[0],t[1]+.2,r,r*.72,0,Math.PI,TAU);ctx.closePath();ctx.fillStyle=K.cap;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle=K.dots;ctx.beginPath();ctx.arc(t[0]-r*.35,t[1]-r*.4,r*.2,0,TAU);ctx.moveTo(t[0]+r*.45,t[1]-r*.5);ctx.arc(t[0]+r*.3,t[1]-r*.5,r*.15,0,TAU);ctx.fill()}
function drawRootlets(V0,X0,A,K){const prof=skirtProf(A),r0=prof[0][1];for(let i=0;i<8;i++){const t=(i+.3)/8*TAU,c=Math.cos(t),s=Math.sin(t),pts=[[c*(r0-1.5)*SKA,s*(r0-1.5),1.6],[c*(r0+2.5)*SKA,s*(r0+2.5),1.2],[c*(r0+5.5)*SKA+s*1.2,s*(r0+5.5)-c*1.2,0]].map(X0.T);
  RL.push(pts.map(V0.P))}strokeRuns(RL,INK,3.8);strokeRuns(RL,K.bark.b,2);RL.length=0}const RL=[];

// the guardian roots (the autumn): four thorny roots breaking out of the floor round her at 58, like fins: thick at the floor, leaning back
// and hooking forward (the way they turn) to a light point, a groove up the bark, three light thorns on the back, a lit orange knot at two
// thirds; in front of each a bow wave of earth and two leaves thrown up, behind it the furrow. The ones on the same side of her are painted
// together (a few strokes for all of them)
function guardGeo(Vw,c,a,k,t){const dir=[-Math.sin(a),Math.cos(a),0],out=[Math.cos(a),Math.sin(a),0],h=26*k,pts=[],rs=[];
  for(let i=0;i<5;i++){const u=i/4,hh=h*(1-Math.pow(1-u,1.6)),fw=(-5*u+15*u*u*u)*k,ow=Math.sin(t*2.6+u*2)*.9*u*k;pts.push(add(c,add(add([0,0,hh],mul(dir,fw)),mul(out,ow))));rs.push([6.2,4.4,3,1.9,.8][i]*(.55+.45*k))}
  return{c,a,k,t,dir,out,pts,rs}}
function drawGuards(Vw,G,K){if(!G.length)return;const P=Vw.P;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.fillStyle='rgba(20,10,6,.5)';ctx.beginPath();for(const g of G){const b0=P(add(g.c,mul(g.dir,-12*g.k))),b1=P(add(g.c,mul(g.dir,8*g.k))),mx=(b0[0]+b1[0])/2,my=(b0[1]+b1[1])/2+1,rx=12*g.k+2.5,ry=4.6*C.KR()*g.k+1.5,an=Math.atan2(b1[1]-b0[1],b1[0]-b0[0]);
    ctx.moveTo(mx+Math.cos(an)*rx,my+Math.sin(an)*rx);ctx.ellipse(mx,my,rx,ry,an,0,TAU)}ctx.fill();
  strokeRuns(G.map(g=>[P(add(g.c,mul(g.dir,-6*g.k))),P(add(g.c,mul(g.dir,-20*g.k)))]),'rgba(12,6,4,.7)',2.6*G[0].k+.6);
  ctx.beginPath();for(const g of G)for(let i=0;i<4;i++){const q=P(add(g.c,add(mul(g.dir,(5.5+i%2*2.2)*g.k),mul(g.out,(i-1.5)*3.4*g.k)))),rx=(2.8-Math.abs(i-1.5)*.5)*g.k+.6;ctx.moveTo(q[0]+rx,q[1]-.6);ctx.ellipse(q[0],q[1]-.6,rx,1.8*g.k+.4,0,0,TAU)}ctx.fillStyle='#4a3424';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();
  // the roots: one outline, one fill, the light and the dark along them, the groove
  const PS=G.map(g=>g.pts.map(q=>P(q)));ctx.fillStyle=INK;ctx.beginPath();PS.forEach((P2,j)=>{const rs=G[j].rs;for(let i=0;i<4;i++)hullAdd(P2[i],rs[i]+1.15,P2[i+1],rs[i+1]+1.15)});ctx.fill();
  ctx.fillStyle=K.bark.b;ctx.beginPath();PS.forEach((P2,j)=>{const rs=G[j].rs;for(let i=0;i<4;i++)hullAdd(P2[i],Math.max(.3,rs[i]-1.05),P2[i+1],Math.max(.3,rs[i+1]-1.05))});ctx.fill();
  const DK=[],LT=[],GR=[];PS.forEach((P2,j)=>{const rs=G[j].rs,d=[],l=[],gr=[];for(let i=0;i<4;i++){const a=P2[Math.max(0,i-1)],b=P2[i+1];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const ll=Math.hypot(nx,ny)||1;nx/=ll;ny/=ll;if(nx+ny<0){nx=-nx;ny=-ny}const r=Math.max(.3,rs[i]-1.1);
    d.push([P2[i][0]+nx*r*.4,P2[i][1]+ny*r*.4]);l.push([P2[i][0]-nx*r*.5,P2[i][1]-ny*r*.5]);gr.push([P2[i][0]-nx*r*.05,P2[i][1]-ny*r*.05])}DK.push(d);LT.push(l);GR.push(gr)});
  strokeRuns(DK,'rgba(20,8,4,.4)',2.2);strokeRuns(LT,wa(.24),1.2);strokeRuns(GR,cmix(K.bark.d,'#000000',.2),.9);
  // the thorns on their backs and the light point of each
  ctx.beginPath();for(const g of G){const sv=[g.dir[1],-g.dir[0],0];for(const[u,sd] of[[.3,1],[.5,-1],[.68,1]]){const i=Math.min(3,Math.floor(u*4)),f=u*4-i,q=lerp3(g.pts[i],g.pts[i+1],f),r=lerp(g.rs[i],g.rs[i+1],f),e=add(q,add(add(mul(sv,sd*(r+3.4)),mul(g.dir,-r*.8)),[0,0,1.2])),qa=P(q),qe=P(e),dx=qe[0]-qa[0],dy=qe[1]-qa[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*1.4,ny=dx/l*1.4;
      ctx.moveTo(qa[0]+nx,qa[1]+ny);ctx.lineTo(qe[0],qe[1]);ctx.lineTo(qa[0]-nx,qa[1]-ny);ctx.closePath()}}
  PS.forEach(P2=>{const e=P2[4],pr=P2[3],dx=e[0]-pr[0],dy=e[1]-pr[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*1.3,ny=dx/l*1.3;ctx.moveTo(pr[0]*.4+e[0]*.6+nx,pr[1]*.4+e[1]*.6+ny);ctx.lineTo(e[0]+dx/l*2.6,e[1]+dy/l*2.6);ctx.lineTo(pr[0]*.4+e[0]*.6-nx,pr[1]*.4+e[1]*.6-ny);ctx.closePath()});
  ctx.fillStyle=K.spine;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();
  // the lit knots
  const KQ=G.map(g=>P(lerp3(g.pts[2],g.pts[3],.35)));if(!LOWFX)for(const q of KQ)shine(K.vG,q[0],q[1],8,.5);ctx.beginPath();for(const q of KQ){ctx.moveTo(q[0]+2.1,q[1]);ctx.arc(q[0],q[1],2.1,0,TAU)}ctx.fillStyle=K.knot;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();for(const q of KQ){ctx.moveTo(q[0]-.6+.6,q[1]-.6);ctx.arc(q[0]-.6,q[1]-.6,.6,0,TAU)}ctx.fillStyle='#fff6e0';ctx.fill();
  // two leaves thrown up by each wave
  const pa=new Path2D();for(const g of G)for(let i=0;i<2;i++){const q=P(add(g.c,add(mul(g.dir,(7+i*3)*g.k),[g.out[0]*(i?4:-4)*g.k,g.out[1]*(i?4:-4)*g.k,(3+2*i)*g.k+1.5*Math.sin(g.t*3+i)]))),r=Math.sin(g.t*4+i*2)*1.2+i,cr=Math.cos(r),sr=Math.sin(r);
    traceTo(pa,OVL,4.2*g.k*cr,4.2*g.k*sr,-1.8*g.k*sr,1.8*g.k*cr,q[0]-2.1*g.k*cr,q[1]-2.1*g.k*sr)}ctx.fillStyle=K.leaf.b;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke(pa)}
// the column of Riaffiora: five twisted roots out of the floor round her, closed at the top like a bud; they open in petals and fall back
function colPetal(A,i){const c=A.col,a0=i*TAU/5+c.tw,H=70*(.25+.75*c.up),dz=-H*(1-c.h),pts=[],rs=[];let prev=null;
  for(let k=0;k<6;k++){const u=k/5,a=a0+1.1*u*(1-c.open)+.3*c.open*u,rc=17*(1-.88*Math.pow(u,1.4)),zc=H*u,ro=17+24*u*u,zo=H*(u-.62*u*u),rf=17+36*u,zf=Math.max(1.5,4*(1-u));
    let r=lerp(rc,ro,ez(c.open)),z=lerp(zc,zo,ez(c.open));r=lerp(r,rf,ez(c.fall));z=lerp(z,zf,ez(c.fall));r*=1-.5*c.gone;const q=[Math.cos(a)*r,Math.sin(a)*r,z+dz],rr=lerp(6.5,2.2,u)*(1-.7*c.gone);
    if(q[2]>=0){if(prev&&prev.q[2]<0){const f=prev.q[2]/(prev.q[2]-q[2]);pts.push(lerp3(prev.q,q,f));rs.push(lerp(prev.r,rr,f))}pts.push(q);rs.push(rr)}prev={q,r:rr}}
  return{pts,rs,a0}}
function colRoot(V0,pts,rs,K,A){const P2=limb3(V0,pts,rs,K.bark,{lw:2.4});ctx.strokeStyle=K.bark.l;ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();
  for(let i=0;i<P2.length-1;i++){const a=P2[i],b=P2[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,o=Math.sin(i*1.9)*rs[i]*.45;ctx.moveTo(a[0]-dy/l*o,a[1]+dx/l*o);ctx.lineTo(b[0]+dy/l*o*.5,b[1]-dx/l*o*.5)}ctx.stroke();
  const e=P2[P2.length-1];ctx.fillStyle=K.spine;ctx.strokeStyle=INK;ctx.lineWidth=.9;const pr=P2[P2.length-2];tri(pr[0],pr[1],e[0]+(e[0]-pr[0])*.5,e[1]+(e[1]-pr[1])*.5,1.2)}
// the bud of the entrance: five big dark petals closed round her, opening one by one, then falling onto her (they become the gown)
function budPetal(A,i,X0){const b=A.bud0,a=i*TAU/5+.3,H=60*b.h,op=b.op[i],fl=b.fall,rad=[Math.cos(a),Math.sin(a),0],tg=[-Math.sin(a),Math.cos(a),0],base=[rad[0]*12,rad[1]*12,0];
  const lean=lerp(-.38,1.25,ez(op)),d=nrm(add(mul([0,0,1],Math.cos(lean)),mul(rad,Math.sin(lean)))),sz=(1-.75*ez(fl))*(H/60),bb=add(base,mul(rad,-4*fl));return{b:X0.T(bb),d:X0.Rd(d),s:X0.Rd(tg),L:64*sz,W:12*sz,n:X0.Rd(nrm(cross(d,tg))),mid:X0.T(add(bb,mul(d,30*sz)))}}

// the sprout, the three little flowers and the fireflies of the defeat
function drawSprout(V0,X0,k,KD0){if(k<=.01)return;const P=V0.P,b=X0.T([16,4,0]),q=P(b),h=12*ez(k);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.quadraticCurveTo(q[0]+2,q[1]-h*.6,q[0]+.5,q[1]-h);ctx.stroke();ctx.strokeStyle='#7fd36a';ctx.lineWidth=1.3;ctx.stroke();
  const t=[q[0]+.5,q[1]-h];for(const sd of[-1,1]){ctx.fillStyle='#7fd36a';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(t[0]+sd*2.4*k,t[1]+1.5,2.6*k,1.2*k,sd*.5,0,TAU);ctx.fill();ctx.stroke()}
  const op=sstep(.4,1,k);if(!LOWFX)shine('123,240,192',t[0],t[1]-1.5,7,.5*op);ctx.fillStyle=cmix('#3f8a6a','#7bf0c0',op);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(t[0],t[1]-1.6,1.6+.8*op,2+.4*op,0,0,TAU);ctx.fill();ctx.stroke();
  if(op>.3){ctx.fillStyle='#e8fff4';ball([t[0]-.5,t[1]-2.2],.7*op);ctx.fill()}
  [[10,-12,0],[24,-3,.2],[6,16,.4]].forEach(([x,y,d],i)=>{const f=sstep(d*.6,d*.6+.5,k);if(f<=0)return;const c=P(X0.T([x,y,0])),r=3.3*f;ctx.fillStyle=i%2?'#c48ae8':'#f4ecff';ctx.strokeStyle=INK;ctx.lineWidth=1;
    ctx.beginPath();for(let j=0;j<5;j++){const a=j/5*TAU+i,px=c[0]+Math.cos(a)*r*.75,py=c[1]+Math.sin(a)*r*.42-1.2;ctx.moveTo(px+r*.5,py);ctx.ellipse(px,py,r*.5,r*.34,0,0,TAU)}ctx.fill();ctx.stroke();ctx.fillStyle='#ffd23c';ctx.beginPath();ctx.arc(c[0],c[1]-1.2,r*.32,0,TAU);ctx.fill();ctx.strokeStyle='rgba(27,22,18,.6)';ctx.lineWidth=.6;ctx.stroke()})}

// ------------------------------------------------------------------ the model
function witch2(x,y,face,anim,p,sc,o){sc=sc||1;o=o||{};anim=MV.includes(anim)?anim:'idle';p=cl(p||0,0,1);
  const A=wPose(anim,p,o),fx=fxOn(o),Vw=V(face),V0=A.spin?V(face+A.spin):Vw,{P,D,F}=V0,lift=o.z!=null?o.z/sc:0;
  const X0=frm([0,0,0],mkM(A.lean,A.roll0||0,0),[A.B[0],A.B[1],A.B[2]-A.sink+lift],null),XU=frm([0,0,52],mkM(A.bl,A.broll,A.byaw),[0,0,A.bz],X0),
    XH=frm(HPV,mkM(A.hp,A.hr,A.hy+cheat(face+A.spin,.25)),[A.hx,0,A.hz],XU),XT=hatFrame(A,XH),XF=frm([0,0,0],mkM(0,0,0),[A.B[0],A.B[1],lift],null);
  const KZ=z=>pal(A.k2z==null?A.k2:sstep(A.k2z-6,A.k2z+6,z),A.dry),K=KZ(64),KH=KZ(110),KLow=KZ(10);
  const sk=A.sink,below=z=>sk>z;   // a piece whose top (at rest) is under the floor is not drawn
  floor(Vw,x,y,sc,[A.B[0],A.B[1],0],30,12,.32*(1-cl(sk/60,0,.8)),lift);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);const L=parts(),J={},BD=bodiesOf(V0,X0,XU,XH,XT),slot=BD.slot,backF=F(XU.Rd([-1,0,0]))>0;
  // ---------------- the floor: the train, the rootlets of the hem, the roots of the feet (they come out from under the hem: before it)
  if(!below(A.tr.mode==='coc'||A.tr.mode==='trunk'?44:8)&&A.trK>.02){const TG=trainGeo(A,p),md=A.tr.mode;
    if(A.tr.up>.3){const m=TG[1].pts[3];L.add(slot(X0.T(m),20),()=>drawTrain(V0,X0,TG,KLow,A))}
    else if((md==='coc'||md==='trunk')&&A.tr.k>.05){// wound round her: the runs that face us go over the gown, the others under it
      const seg2=[];for(const s of TG){let cur=null;s.pts.forEach((q,k)=>{const rad=nrm([q[0],q[1],0]),f=F(X0.Rd(rad))>0;if(!cur||cur.f!==f){if(cur){cur.pts.push(q);cur.rs.push(s.rs[k])}cur={f,pts:[],rs:[],th:s.th,i:s.i};seg2.push(cur)}cur.pts.push(q);cur.rs.push(s.rs[k])})}
      for(const g of seg2)if(g.pts.length>1)L.add(g.f?9.6+g.i*.01:-60,()=>{const pts=g.pts.map(X0.T);drawRoot(V0,pts,g.rs,KLow)})}
    else L.add(-60,()=>drawTrain(V0,X0,TG,KLow,A))}
  if(!below(3))L.add(-59,()=>drawRootlets(V0,X0,A,KLow));
  if(!below(6)&&A.ftK>.02){const R=[];for(const sd of[-1,1])for(let i=1;i>=0;i--)R.push({pts:footPts(A,sd,i).map(X0.T),rs:FEET[i].rs.map(r=>r*(.35+.65*A.ftK))});L.add(-58,()=>rootBundle(V0,R,KLow,{main:1}))}
  // ---------------- the four volumes
  const LR=below(54)?null:leafRings(V0,X0,A,K);
  if(LR){L.add(0,()=>{J.skirt=drawSkirt(V0,X0,A,K,KZ,LR)});for(const e of LR.fall)L.add(e.dep>D(0,0,30)?8:-1,()=>{const Kz=KZ(e.z);ga(e.al,()=>leafF(V0,OVL,e.b,e.d,e.s,e.L,e.W,Kz.leaf,Kz,{col:ringTone(V0,Kz.leaf,e.ri,e.n),lw:1.7}))});L.add(9.5,()=>drawBelt(V0,X0,A,K))}
  if(!below(79)){L.add(10,()=>{drawBust(V0,XU,A,K,J);drawSeed(V0,XU,A,K,J)});
    L.add(12,()=>{const a=XU.T(NK0),b=XU.T(NK1);limb3(V0,[a,b],[3.6,3.1],A.dry?mixT(K.skin,K.bark,A.dry):K.skin,{lw:2.4,dark:'rgba(60,70,60,.3)'})})}
  if(!below(106))L.add(20,()=>drawHead(V0,XH,A,A.dry?Object.assign({},KH,{skin:mixT(KH.skin,T3('#c8c0ae','#9a907e','#5a5246'),A.dry)}):KH,J));
  if(!A.hat.free||true)L.add(A.hat.free?(D(XT.T([0,0,8]))>D(0,0,20)?99:-55):30,()=>drawHat(V0,XT,A,KH,J,A.k2z!=null?sstep(A.k2z-6,A.k2z+6,110):A.k2));
  // ---------------- the arms and the hands
  if(!below(79))for(const sd of[-1,1]){const g=armGeo(X0,XU,A,sd),mid=lerp3(g.S,g.E,.5),Ka=A.dry?K:K;
    L.add(slot(mid,4),()=>{drawUpper(V0,g,Ka,A,sd);drawKnot(V0,XU.T([SHN[0],sd*SHN[1],SHN[2]]),SHR,Ka)});
    const hg=handGeo(g,XU,sd),hc=add(g.W,mul(hg.u,5));
    L.add(slot(hc,8),()=>{drawSleeves(V0,g,Ka,A);const fwE=F(sub(g.W,g.E)),fore=()=>{limb3(V0,[g.E,g.W],[3.2,2.6],Ka.bark,{lw:2.4});armRun(V0,g,A.arm[sd],Ka,1)};
      if(fwE>0){drawKnot(V0,g.E,3.4,Ka);fore()}else{fore();drawKnot(V0,g.E,3.4,Ka)}drawHand(V0,hg,g.H,Ka,A);
      if(A.seedsIn){const e=hg.F[0][hg.F[0].length-1],q=add(e,[0,0,1.5]);seedBall(V0,q,3.2,A.k2>.5)}})}
  // ---------------- the hair, the collar, the halo
  if(!below(104)){const ph=LOWFX?0:A.hairPh;for(const sd of[-1,1]){const pts=lock(XH,XU,HAIRF.map(q=>[q[0],sd*q[1],q[2]]),ph+sd,.35),top=pts[0];
      const inH=BD.front(BD.B[2],add(top,XH.Rd([0,sd*2.4,0]))),inB=BD.front(BD.B[1],add(pts[3],XU.Rd([2,sd*2,0])));L.add((inH?25:inB?15:4.5)+D(top)*.001,()=>drawLock(V0,pts,HAIRFR,A.dry?pal(0,A.dry):K))}
    const bk=BD.front(BD.B[2],XH.T([-9,0,88]));if(bk||F(XU.Rd([-1,0,0]))>-.55){const PL=HAIRB.map((h,i)=>lock(XH,XU,h,ph+i*1.3,.4));L.add(bk?24.5:3.8,()=>drawLocks(V0,PL,HAIRBR,A.dry?pal(0,A.dry):K))}
    for(const c of collarGeo(XU,A)){const Kc=KZ(c.z),path=A.fall>=.5?SER:PET;L.add(slot(c.mid,9),()=>ga(c.al,()=>leafF(V0,path,c.b,c.d,c.s,c.L,c.W,Kc.leaf,Kc,{backT:Kc.backT,lw:2.1,vl:.86,kb:-.62,kbb:-.05})))}
    if(A.fall>=.5&&A.dry<.5)for(const sd of[-1,1]){const a=Math.PI+sd*1.02,b=XU.T([Math.cos(a)*8,Math.sin(a)*9,72]),e=XU.T([Math.cos(a)*15,Math.sin(a)*17,92]),m=XU.T([Math.cos(a)*11,Math.sin(a)*12.5,82]);
      const inner=F(XU.Rd([-Math.cos(a),-Math.sin(a),.3]))>0;L.add(inner?2.9:37,()=>{limb3(V0,[b,m,e],[1.6,1.2,.8],K.bark,{lw:1.8,noShade:true});const q=P(m),qe=P(add(m,XU.Rd([0,sd*2.5,1.5])));ctx.fillStyle=K.spine;ctx.strokeStyle=INK;ctx.lineWidth=.8;tri(q[0],q[1],qe[0],qe[1],1)})}
    if(A.halo>.01)L.add(backF?39:2.5,()=>drawHalo(V0,XU,A,K,p))}
  // ---------------- the lanterns of spores, hanging from the twigs of the brim
  if(!below(112)){for(let i=0;i<3;i++){const L0=lantPos(XT,A,i);L.add(A.hat.free?(D(XT.T([0,0,8]))>D(0,0,20)?99.5:-54.5):slot(L0.c,4),()=>drawLantern(V0,L0,KH,A.lantK*(A.lantOn[i]==null?1:A.lantOn[i])))}
    if(A.horns>.5)HORNS.forEach(h=>{for(const u of[.55,1]){const k=Math.min(h.pts.length-1,Math.round(u*(h.pts.length-1))),b=XT.T(h.pts[k]),L0={b,c:add(b,[0,0,-5*sstep(.5,1,A.horns)]),d:[0,0,-1]};L.add(slot(L0.c,4)+.01,()=>drawLantern(V0,L0,K2,sstep(.6,1,A.horns),2.2))}})}
  // ---------------- the column of Riaffiora, the bud of the entrance: petals in front of her or behind her
  const dc=D(A.B[0],A.B[1],40);
  if(A.col&&A.col.gone<1&&A.col.h>.01)for(let i=0;i<5;i++){const cp=colPetal(A,i);if(cp.pts.length<2)continue;const pts=cp.pts.map(XF.T),mid=pts[Math.min(2,pts.length-1)];L.add(D(mid)>dc?98+D(mid)*.001:-61+D(mid)*.001,()=>colRoot(V0,pts,cp.rs,KLow,A))}
  if(A.bud0&&A.bud0.h>.01&&A.bud0.hide<1){for(let i=0;i<5;i++){const bp=budPetal(A,i,XF),f=F(bp.n);L.add(D(bp.mid)>dc?98+D(bp.mid)*.001:-61+D(bp.mid)*.001,()=>ga(1-A.bud0.hide,()=>leafF(V0,PET,bp.b,bp.d,bp.s,bp.L,bp.W,KLow.leaf,KLow,{back:'#20402a',lw:2.4,kb:-.3,vl:.9})))}
    if(A.bud0.pulse>.02&&!LOWFX)L.add(97,()=>{const q=P(XF.T([0,0,26*A.bud0.h]));ctx.save();ctx.globalCompositeOperation='lighter';shine('123,240,192',q[0],q[1],34,.5*A.bud0.pulse,26);ctx.restore()});
    L.add(-62,()=>{const q=P(XF.T([0,0,0]));ctx.fillStyle='rgba(14,8,6,.55)';ctx.beginPath();ctx.ellipse(q[0],q[1],24*A.bud0.h,13*A.bud0.h,0,0,TAU);ctx.fill()})}
  // ---------------- the autumn: the guardian roots round her, sorted with the floor (behind) or over everything (in front)
  if(A.guard>0){const t=(G.t||0),dcw=Vw.D(A.B[0],A.B[1],0),GB=[],GF=[];for(let k=0;k<4;k++){const gk=A.guard*(A.guardK?A.guardK[k]:1);if(gk<=.01)continue;const a=A.orb+k*Math.PI/2-face,c=[A.B[0]+58*Math.cos(a),A.B[1]+58*Math.sin(a),0];
    (Vw.D(c)>dcw?GF:GB).push(guardGeo(Vw,c,a,gk,t+k))}if(GB.length)L.add(-61,()=>drawGuards(Vw,GB,KLow));if(GF.length)L.add(99,()=>drawGuards(Vw,GF,KLow))}
  // ---------------- the defeat: the sprout and the flowers at her feet, the fireflies out of her eyes
  if(A.sprout>0)L.add(D(X0.T([16,4,0]))>dc?96:-57,()=>drawSprout(V0,X0,A.sprout));
  if(A.flies>=0&&A.flies<1)L.add(99,()=>{for(let i=0;i<2;i++){const u=cl(A.flies*1.1-i*.1,0,1);if(u<=0||u>=1)continue;const e=J.eyes&&J.eyes[i]?J.eyes[i].q:P(XH.T([11,i?-3:3,90])),q=[e[0]+Math.sin(u*7+i*2)*8*u+(i?-6:6)*u,e[1]-u*60];
    if(!LOWFX)shine('123,240,192',q[0],q[1],8,.6*Math.sin(u*Math.PI));ctx.fillStyle=`rgba(200,255,232,${Math.sin(u*Math.PI)})`;ball(q,1.4);ctx.fill()}});
  // ---------------- the effects of the moves
  if(fx)for(const e of A.fx)fxDraw(V0,X0,XU,XH,L,e,A,K,J,p);
  // under the floor (Sprofonda, the fin, Riaffiora): the hole first, every piece cut at the floor, the ring of earth over the cut
  if(sk>.5){const zl=sk,rc=Math.max(7,zl<52?skirtProf(A).reduce((r,q)=>q[0]<=zl?q[1]:r,23)+2:zl<80?15:zl<98?13:zl<101?BRIM+2:Math.max(3.5,(HATP.find(q=>q[0]>=zl-98)||[0,2.6])[1]+2)),c0=P(A.B[0],A.B[1],0),ry=rc*.55*C.KR();
    const fl=L.filter(e=>e.d<-56),bd=L.filter(e=>e.d>=-56&&e.d<90),up=L.filter(e=>e.d>=90);run(fl);
    ctx.fillStyle='rgba(10,6,4,.85)';ctx.beginPath();ctx.ellipse(c0[0],c0[1],rc,ry,0,0,TAU);ctx.fill();
    // what is above the floor shows (above the front edge of the cut, and anything over the back of the hole), the rest is under the floor
    ctx.save();ctx.beginPath();ctx.moveTo(c0[0]-rc,c0[1]);ctx.lineTo(c0[0]-rc,c0[1]-ry*1.05);ctx.lineTo(c0[0]-400,c0[1]-ry*1.05);ctx.lineTo(c0[0]-400,c0[1]-600);ctx.lineTo(c0[0]+400,c0[1]-600);ctx.lineTo(c0[0]+400,c0[1]-ry*1.05);
    ctx.lineTo(c0[0]+rc,c0[1]-ry*1.05);ctx.lineTo(c0[0]+rc,c0[1]);ctx.ellipse(c0[0],c0[1],rc,ry,0,0,Math.PI,false);ctx.closePath();ctx.clip();run(bd);ctx.restore();
    earthRing(Vw,c0,rc,ry,p,A,KLow);run(up)}
  else run(L);
  ctx.restore()}
// the ring of earth and leaves round the cut where she goes into the floor (and the wave in front of the fin)
function earthRing(Vw,c0,rc,ry,p,A,K){ctx.lineJoin='round';ctx.lineCap='round';const fk=A.fin||0,rk=1-fk;
  if(rk>.02){ctx.save();ctx.globalAlpha*=rk;ctx.strokeStyle='rgba(30,18,10,.9)';ctx.lineWidth=3.2;ctx.beginPath();ctx.ellipse(c0[0],c0[1],rc+1,ry+.6,0,0,TAU);ctx.stroke();
    const n=LOWFX?6:10;ctx.beginPath();for(let i=0;i<n;i++){const a=i/n*TAU+p*TAU*.8,r=rc+1.8,q=[c0[0]+Math.cos(a)*r,c0[1]+Math.sin(a)*r*.55];if(Math.sin(a)<-.2)continue;ctx.moveTo(q[0]+2.6,q[1]);ctx.ellipse(q[0],q[1],2.6,1.6,0,0,TAU)}
    ctx.fillStyle='#4a3424';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.1;ctx.stroke();ctx.restore()}
  if(fk>.02){// the fin: a bow wave of earth with chips of slab in front (the way she goes), the furrow behind with her light in the cracks
    const mv=A.tr.mv||0,cm=Math.cos(mv),sm=Math.sin(mv),at=(d,s,z)=>{const q=Vw.P([cm*d-sm*s,sm*d+cm*s,z||0]);return[c0[0]+q[0],c0[1]+q[1]]};ctx.save();ctx.globalAlpha*=fk;
    const f0=at(-5,0),f1=at(-15,0),f2=at(-27,0);ctx.strokeStyle='rgba(12,6,4,.75)';ctx.lineWidth=4.2;ctx.beginPath();ctx.moveTo(f0[0],f0[1]);ctx.quadraticCurveTo(f1[0],f1[1],f2[0],f2[1]);ctx.stroke();
    if(!LOWFX){const g=at(-14,0);shine(K.vG,g[0],g[1],12,.42)}ctx.strokeStyle=K.vOn;ctx.lineWidth=1.1;ctx.beginPath();const c1=at(-7,1.2),c2=at(-13,-1.4),c3=at(-19,1),c4=at(-24,-.6);ctx.moveTo(c1[0],c1[1]);ctx.lineTo(c2[0],c2[1]);ctx.lineTo(c3[0],c3[1]);ctx.lineTo(c4[0],c4[1]);ctx.stroke();
    ctx.beginPath();for(let i=0;i<5;i++){const sd=(i-2)*3.4,q=at(7.4-Math.abs(sd)*.32,sd),rx=2.9-Math.abs(i-2)*.35;ctx.moveTo(q[0]+rx,q[1]-.7);ctx.ellipse(q[0],q[1]-.7,rx,1.9,0,0,TAU)}ctx.fillStyle='#4a3424';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();
    ctx.beginPath();for(let i=0;i<3;i++){const h=1.5+2.5*Math.abs(Math.sin(p*TAU+i*2.1)),q=at(10.5+i%2*2,(i-1)*5.5,h);ctx.moveTo(q[0]-2.4,q[1]+1);ctx.lineTo(q[0]-.2,q[1]-1.9);ctx.lineTo(q[0]+2.6,q[1]+.6);ctx.closePath()}ctx.fillStyle='#69575e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
    for(let i=0;i<2;i++){const q=at(8+i*3,(i?6:-6),4+2*Math.sin(p*TAU*2+i));const pa=new Path2D();traceTo(pa,OVL,3.6*Math.cos(p*9+i),1.4*Math.sin(p*9+i),-1.4*Math.sin(p*9+i)*.6,1.5,q[0],q[1]);ctx.fillStyle=K.leaf.b;ctx.fill(pa);ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke(pa)}
    ctx.restore()}}
// the seed in flight (N3.witchSeed) and in her hands (Il Giardino): a glossy violet seed with the mint heart; in the autumn an orange lantern
function seedBall(V0,q3,r,p2,spin){const q=V0&&V0.P?V0.P(q3):q3;if(p2){drawLantern(V0,{b:add(q3,[0,0,r*1.2]),c:q3,d:[0,0,-1]},K2,1,r*.9);return}
  if(!LOWFX)shine(K1.seedG,q[0],q[1],r*3,.45);scrPath(TEAR,q,spin||0,r*.9,r);const g=ctx.createRadialGradient(q[0],q[1]+r*.3,0,q[0],q[1]+r*.1,r*1.3);
  g.addColorStop(0,'#c8ffe8');g.addColorStop(.35,cmix(K1.seed.b,K1.seedC,.35));g.addColorStop(.65,K1.seed.b);g.addColorStop(1,K1.seed.d);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();
  ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(spin||0);ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.ellipse(-r*.32,-r*.35,r*.16,r*.3,.3,0,TAU);ctx.fill();ctx.restore()}

// ------------------------------------------------------------------ the effects of the moves
function fxDraw(V0,X0,XU,XH,L,e,A,K,J,p){const{P,D}=V0,t=e.t;
  if(e.k==='dust'){const c=X0.T(e.at);L.add(-57,()=>dust(V0,c,t,e.n||5,e.r||8,K.dust,e.al||.45))}
  else if(e.k==='leafDrop'){const b=XU.T([-9,-7,92]),z=lerp(b[2],1,ez(cl(t/.92,0,1))),q3=[b[0]-6*t,b[1]-14*t+5*Math.sin(t*9),z],rot=Math.sin(t*8)*1.2+t*2;L.add(t<.5?2.8:-50,()=>leafDraw(V0,q3,rot,K,{al:1-sstep(.85,1,t)}))}
  else if(e.k==='fall'){const s=(t*1.7)%1,a=t*5.3,b=X0.T([Math.cos(a)*14,Math.sin(a)*15,40]),q3=[b[0]+8*s,b[1]+6*Math.sin(s*7),lerp(40,1,s)];L.add(D(q3)>D(0,0,30)?8:-50,()=>leafDraw(V0,q3,s*7,K,{al:1-sstep(.85,1,s)}))}
  else if(e.k==='hitleaves'){for(let i=0;i<3;i++){const a=i*2.1+.4,q3=XU.T([-4+Math.cos(a)*10*t,Math.sin(a)*16*t,92+10*t-20*t*t+i*2]);L.add(40,()=>leafDraw(V0,q3,t*6+i,K,{al:1-t}))}}
  else if(e.k==='crack'){// where the fingers of root go into the floor: the slab cracks, the light in the cracks, chips lifted
    const c=X0.T(e.at),k=sstep(0,.12,t),al=1-sstep(.85,1,t);L.add(-57,()=>{const q=P(c);ctx.save();ctx.globalAlpha*=al;ctx.lineCap='round';
      for(let i=0;i<4;i++){const a=i/4*TAU+.6+e.at[0];ctx.beginPath();ctx.moveTo(q[0],q[1]);for(let j=1;j<=3;j++){const r=j*3.2*k*(e.big?1.3:1),aa=a+Math.sin(j*2.1+i)*.3;ctx.lineTo(q[0]+Math.cos(aa)*r,q[1]+Math.sin(aa)*r*.55)}ctx.strokeStyle='rgba(16,10,6,.85)';ctx.lineWidth=1.8;ctx.stroke();ctx.strokeStyle=K.vOn;ctx.lineWidth=.7;ctx.stroke()}
      if(!LOWFX)shine(K.vG,q[0],q[1],9,.4*k);ctx.fillStyle='rgba(12,6,4,.9)';ctx.beginPath();ctx.ellipse(q[0],q[1],2.6,1.4,0,0,TAU);ctx.fill();ctx.restore()})}
  else if(e.k==='pebs'){const c=X0.T(e.at);for(let i=0;i<5;i++){const a=i*1.3+.4,v=10+i*3,q3=[c[0]+Math.cos(a)*v*t,c[1]+Math.sin(a)*v*t,2+30*t-50*t*t];if(q3[2]<0)continue;L.add(40,()=>{const q=P(q3);ctx.fillStyle='#5b4b51';ctx.strokeStyle=INK;ctx.lineWidth=1;ball(q,1.6);ctx.fill();ctx.stroke()})}}
  else if(e.k==='snap'){const c=XU.T([9,0,118]);L.add(41,()=>{const q=P(c);if(!LOWFX)shine(K.vG,q[0],q[1],14,.6*(1-t));ctx.strokeStyle=`rgba(255,240,200,${1-t})`;ctx.lineWidth=1.4;ctx.lineCap='round';for(let i=0;i<6;i++){const a=i/6*TAU,r0=3+t*6,r1=6+t*10;seg([q[0]+Math.cos(a)*r0,q[1]+Math.sin(a)*r0],[q[0]+Math.cos(a)*r1,q[1]+Math.sin(a)*r1]);ctx.stroke()}})}
  else if(e.k==='swirl'){const n=6;for(let i=0;i<n;i++){const a=i/n*TAU+t*9,r=22-8*t,q3=X0.T([Math.cos(a)*r,Math.sin(a)*r,A.sink+3+3*Math.sin(t*12+i)]);if(q3[2]<1)continue;L.add(D(q3)>D(0,0,A.sink)?95:-55,()=>leafDraw(V0,q3,a*2,K,{al:Math.sin(Math.PI*t)}))}}
  else if(e.k==='ring'){L.add(-56.5,()=>{const r=14+t*60,pts=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push(P([A.B[0]+Math.cos(a)*r,A.B[1]+Math.sin(a)*r,0]))}ctx.strokeStyle=`rgba(${e.rgb||'150,128,120'},${.55*(1-t)})`;ctx.lineWidth=3.4*(1-t)+1;poly(pts);ctx.stroke()})}
  else if(e.k==='storm'){const n=e.dry?16:12;for(let i=0;i<n;i++){const u=(t*1.3+i/n)%1,a=i*2.4+t*4,r=16+u*30,q3=X0.T([Math.cos(a)*r,Math.sin(a)*r,lerp(100-i*3,2,u)]);L.add(D(q3)>D(0,0,50)?92:-50,()=>leafDraw(V0,q3,u*9+i,e.dry?Object.assign({},K,{leaf:KD.leaf,back:KD.back,nerv:KD.nerv}):K,{al:Math.sin(Math.PI*Math.min(1,t*1.2))}))}}
  else if(e.k==='burst'){const a=A.orb+e.i*Math.PI/2,c=[A.B[0]+58*Math.cos(a),A.B[1]+58*Math.sin(a),0];for(let i=0;i<5;i++){const b=i*1.3,v=12+i*2,q3=[c[0]+Math.cos(b)*v*t,c[1]+Math.sin(b)*v*t,3+34*t-60*t*t];if(q3[2]<0)continue;L.add(94,()=>{const q=P(q3);ctx.fillStyle=i%2?'#69575e':'#4a3424';ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q[0]-2.4,q[1]+1);ctx.lineTo(q[0],q[1]-2);ctx.lineTo(q[0]+2.6,q[1]+.8);ctx.closePath();ctx.fill();ctx.stroke()})}}
  else if(e.k==='flyleaves'){for(let i=0;i<8;i++){const a=i/8*TAU+.3,q3=X0.T([Math.cos(a)*(20+t*40),Math.sin(a)*(20+t*40),60+i*4+20*t-30*t*t]);L.add(D(q3)>D(0,0,60)?93:-49,()=>leafDraw(V0,q3,t*8+i,K,{al:1-t}))}}
  else if(e.k==='beat'){}}
// a falling leaf (the fx and N3.witchLeaf): an almond seen from wherever it turns, with its vein
function leafDraw(V0,q3,rot,K,o){o=o||{};const d=[Math.cos(rot),Math.sin(rot)*.6,Math.sin(rot*.7)*.5],s=nrm(cross(d,[Math.sin(rot*1.3),.3,1]));ctx.save();ctx.globalAlpha*=o.al==null?1:o.al;
  leafF(V0,OVL,q3,nrm(d),s,7,2.1,K.leaf,K,{lw:1.5,back:K.back});ctx.restore()}

// ------------------------------------------------------------------ for the game: the pieces of her spells, with the same look
const VF=()=>V(Math.PI/2);
// N3.witchThorn(x, y, a, sc, o): a thorn in flight along a (screen angle): long 12, dark with a light thread and a light point, a violet trail;
// in the autumn its point is an ember and the trail orange
N3.witchThorn=function(x,y,a,sc,o){o=o||{};sc=sc||1;const p2=!!o.p2;ctx.save();ctx.translate(x,y);ctx.rotate(a||0);ctx.scale(sc,sc);ctx.lineCap='round';
  const tr=p2?'255,150,60':'184,116,230',g=ctx.createLinearGradient(-20,0,-3,0);g.addColorStop(0,`rgba(${tr},0)`);g.addColorStop(1,`rgba(${tr},.55)`);ctx.strokeStyle=g;ctx.lineWidth=3.2;seg([-20,0],[-3,0]);ctx.stroke();
  if(!LOWFX&&p2)shine('255,138,60',5,0,6,.5);
  ctx.beginPath();ctx.moveTo(-6,-1.6);ctx.quadraticCurveTo(1,-1.3,6.4,0);ctx.quadraticCurveTo(1,1.3,-6,1.6);ctx.quadraticCurveTo(-7.2,0,-6,-1.6);ctx.closePath();ctx.fillStyle=K1.bark.b;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  ctx.strokeStyle=K1.spine;ctx.lineWidth=.7;seg([-4.6,-.3],[3,-.2]);ctx.stroke();ctx.fillStyle=p2?'#ff8a3c':K1.spine;ctx.beginPath();ctx.moveTo(2.6,-.9);ctx.lineTo(6.4,0);ctx.lineTo(2.6,.9);ctx.closePath();ctx.fill();ctx.restore()};
// N3.witchSeed(x, y, z, sc, o): the seed in flight (x, y on the floor, z its height): a glossy violet seed with the mint heart, r 4; in the
// autumn an orange winter-cherry lantern; o.spin: its roll
N3.witchSeed=function(x,y,z,sc,o){o=o||{};sc=sc||1;z=z||0;const k=1-cl(z/60,0,.7);shadow(x,y,4.5*sc*k,2*sc*k,.28*k);ctx.save();ctx.translate(x,y-z);ctx.scale(sc,sc);
  if(o.p2){const V0=VF();drawLantern(V0,{b:[0,0,4.6],c:[0,0,0],d:[0,0,-1]},K2,1,3.6)}else seedBall({P:null},[0,0],4,false,o.spin||0);ctx.restore()};
// N3.witchHand(x, y, k, sc, o): the giant hand of branches out of the floor: three fingers and the thumb, 60 tall, on a ring of 38 round the
// point; k .00-.18 they come out open, .18-.30 close over the middle (the blow at .30), .30-.85 a closed knot of branches 44 tall (the
// obstacle), .85-1 it crumbles into leaves and goes back in. o.side (mirror), o.p2, o.seed
N3.witchHand=function(x,y,k,sc,o){o=o||{};sc=sc||1;k=cl(k||0,0,1);const V0=VF(),{P,D}=V0,K=o.p2?K2:K1,sd=o.side<0?-1:1,sg=o.seed||0,L=parts();
  const out=sstep(0,.18,k),cls=sstep(.18,.3,k),gone=sstep(.85,1,k),grow=out*(1-gone*.85);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  // the cracked floor and the dark ring where the fingers come out
  {const r=38;ctx.fillStyle=`rgba(14,8,6,${.45*(1-gone)})`;ctx.beginPath();ctx.ellipse(0,0,r+8,(r+8)*.55,0,0,TAU);ctx.fill();if(!LOWFX&&k<.85)shine(K.vG,0,0,30,.25*out)}
  const FG=[{a:-.3,L:60,th:0},{a:1.35,L:62,th:0},{a:3.0,L:58,th:0},{a:4.55,L:46,th:1}];
  for(const f of FG){const a=f.a*sd+sg,base=[38*Math.cos(a),38*Math.sin(a),0],rad=[Math.cos(a),Math.sin(a),0],Ln=f.L*grow,pts=[base];
    // open: up and leaning out; closed: bending over the middle, the tips together at 44
    for(let i=1;i<=3;i++){const u=i/3,op=add(base,add(mul([0,0,1],Ln*u*.92),mul(rad,Ln*u*.22))),tip=[Math.cos(a+.25*sd)*4*(1-u*.4),Math.sin(a+.25*sd)*4*(1-u*.4),44*grow],ar=lerp3(add(base,mul([0,0,1],34*u*grow)),tip,u*u),
      cq=add(lerp3(add(base,[0,0,44*grow*Math.sin(u*Math.PI*.5)]),tip,u*.85),mul(rad,-(1-u)*u*8*grow));pts.push(lerp3(op,lerp3(ar,cq,.5),ez(cls)))}
    const rs=[7,5.8,4.7,3.6].map(r=>r*(f.th?.85:1)*(.5+.5*grow));L.add(D(lerp3(pts[1],pts[2],.5)),()=>{const P2=limb3(V0,pts,rs,K.bark,{lw:2.6});
      // knots, moss on its back, the light point
      ctx.fillStyle=K.bark.d;for(let i=1;i<3;i++){ctx.beginPath();ctx.ellipse(P2[i][0],P2[i][1],rs[i]*.9,rs[i]*.45,0,0,TAU);ctx.fill()}
      const top=pts.map((q,i)=>P(add(q,mul(rad,rs[i]*.6))));strokeRuns([top.slice(0,3)],K.mossD,2.2);
      const e=P2[3],pr=P2[2],dx=e[0]-pr[0],dy=e[1]-pr[1],l=Math.hypot(dx,dy)||1;ctx.fillStyle=K.spine;ctx.strokeStyle=INK;ctx.lineWidth=1.1;tri(e[0]-dx/l*1.5,e[1]-dy/l*1.5,e[0]+dx/l*3.4,e[1]+dy/l*3.4,2.2)})}
  run(L);
  // it crumbles: leaves fly off
  if(gone>0&&!LOWFX)for(let i=0;i<10;i++){const a=i*2.4+sg,r=10+30*gone,q3=[Math.cos(a)*r,Math.sin(a)*r,lerp(40,2,gone)+6*Math.sin(i)];leafDraw(V0,q3,a+gone*5,o.p2?K2:K1,{al:1-gone})}
  ctx.restore()};
// N3.witchBump(x, y, a, k, sc, o): the hump running under the floor along a (k its cycle): chips of slab lifted round it, rootlets peeping out,
// the crack lit behind it (orange in the autumn). o.stone: the three colours of the slab [light, base, dark]
N3.witchBump=function(x,y,a,k,sc,o){o=o||{};sc=sc||1;const st=o.stone||['#69575e','#5b4b51','#3f3338'],K=o.p2?K2:K1,c=Math.cos(a||0),s=Math.sin(a||0),bob=Math.sin((k||0)*TAU);
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.lineCap='round';ctx.lineJoin='round';
  // the crack behind, lit
  const cr=[[0,0],[-10,2],[-18,-2],[-26,1.5]].map(([u,v])=>[u*c-v*s*.55,u*s*.55+v*c]);if(!LOWFX)shine(K.vG,cr[2][0],cr[2][1],12,.4);strokeRuns([cr],'rgba(16,10,6,.9)',2.6);strokeRuns([cr],K.vOn,1);
  ctx.fillStyle='rgba(20,10,6,.55)';ctx.beginPath();ctx.ellipse(0,0,13,7,0,0,TAU);ctx.fill();
  ctx.fillStyle='#4a3424';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,-1.5-bob,10,5.5,0,Math.PI,TAU);ctx.closePath();ctx.fill();ctx.stroke();
  for(let i=0;i<5;i++){const t=i/5*TAU+.4,r=9+2*Math.sin(i*1.7),q=[Math.cos(t)*r,Math.sin(t)*r*.55-2-1.5*Math.abs(Math.sin((k||0)*TAU+i))],tl=t+.6,w=3.6-.3*i;
    ctx.fillStyle=st[i%3];ctx.beginPath();ctx.moveTo(q[0]-Math.cos(tl)*w,q[1]-Math.sin(tl)*w*.6+1.4);ctx.lineTo(q[0]+Math.cos(tl)*w,q[1]+Math.sin(tl)*w*.6-1.6);ctx.lineTo(q[0]+Math.cos(tl+1.4)*w*.8,q[1]+Math.sin(tl+1.4)*w*.5+1);ctx.closePath();ctx.fill();ctx.stroke()}
  for(let i=0;i<3;i++){const q=[(i-1)*5,-3-bob],e=[q[0]+(i-1)*2,q[1]-5-1.5*Math.sin((k||0)*TAU*2+i)];strokeRuns([[q,e]],INK,3);strokeRuns([[q,e]],K1.bark.b,1.4)}
  ctx.restore()};
// N3.witchRoot(x0, y0, x1, y1, k, sc, o): the thorny root that comes out in arches along a stretch of floor (the stripes, the arms of the Rite):
// k .00-.30 it comes out in a wave from the first end, .30-.70 stays, .70-1 goes back in. Arches 40 long and 14 high, two thorns and moss on
// each. o.w its thickness (1 = a stripe of 26), o.gaps [[d0, d1], ...] stretches where it stays under (the obstacles), o.p2, o.seed
N3.witchRoot=function(x0,y0,x1,y1,k,sc,o){o=o||{};sc=sc||1;k=cl(k||0,0,1);const K=o.p2?K2:K1,dx=x1-x0,dy=y1-y0,Lt=Math.hypot(dx,dy)||1,ux=dx/Lt,uy=dy/Lt,w=o.w==null?1:o.w,gaps=o.gaps||[],AL=40*sc,n=Math.max(1,Math.round(Lt/AL)),al=Lt/n;
  const front=k<.3?(k/.3)*(Lt+al):Lt+al,back=k>.7?((k-.7)/.3)*(Lt+al):-1,H=14*sc*(.75+.25*w),R=4.6*sc*w;
  const arcs=[];for(let i=0;i<n;i++){const d0=i*al,d1=d0+al;if(gaps.some(g=>g[1]>d0+2&&g[0]<d1-2))continue;const up=cl((front-d0)/al,0,1)*(1-cl((back-d0)/al,0,1));if(up<=.01)continue;arcs.push({d0,d1,up})}
  if(!arcs.length)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  const pt=(d,h)=>[x0+ux*d,y0+uy*d-h],N=LOWFX?4:6,R3=[],Rh=[];
  for(const a of arcs){const pts=[];for(let j=0;j<=N;j++){const u=j/N;pts.push(pt(lerp(a.d0+2,a.d1-2,u),H*a.up*Math.sin(Math.PI*u)))}R3.push(pts);a.pts=pts;
    for(const d of[a.d0+2,a.d1-2]){const q=pt(d,0);Rh.push(q)}}
  ctx.fillStyle='rgba(14,8,6,.75)';for(const q of Rh){ctx.beginPath();ctx.ellipse(q[0],q[1],R+1.5,(R+1.5)*.5,0,0,TAU);ctx.fill()}
  strokeRuns(R3,INK,2*R+2.6);strokeRuns(R3,K.bark.d,2*R);strokeRuns(R3.map(p=>p.map(q=>[q[0],q[1]-R*.25])),K.bark.b,R*1.25);strokeRuns(R3.map(p=>p.map(q=>[q[0],q[1]-R*.6])),K.mossD,R*.5);
  ctx.beginPath();for(const a of arcs){for(const u of[.35,.68]){const j=u*N,i0=Math.floor(j),f=j-i0,q=[lerp(a.pts[i0][0],a.pts[i0+1][0],f),lerp(a.pts[i0][1],a.pts[i0+1][1],f)-R*.7],t=[q[0]+ux*2.2,q[1]-R*.9-3.2*a.up];
    ctx.moveTo(q[0]-1.3,q[1]);ctx.lineTo(t[0],t[1]);ctx.lineTo(q[0]+1.3,q[1]);ctx.closePath()}}ctx.fillStyle=K.spine;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();
  ctx.restore()};
// N3.witchHusk(x, y, face, k, sc, o): the empty husk of bark she leaves when she sinks (autumn), her shape, 70 tall, dry leaves on it; k .00-.60
// whole (o.glow 0..1 lights its cracks), .60-.70 it splits, .70-1 it crumbles
N3.witchHusk=function(x,y,face,k,sc,o){o=o||{};sc=sc||1;k=cl(k||0,0,1);const V0=V(face==null?Math.PI/2:face),{P}=V0,KD0=pal(1,.8),gl=o.glow||0,sp=sstep(.6,.7,k),cr=sstep(.7,1,k);
  shadow(x,y,18*sc*(1-cr*.5),7*sc*(1-cr*.5),.3*(1-cr));ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  const piece=(sd)=>{const off=[0,sd*sp*4+sd*cr*6,-cr*24],X={T:q=>add([q[0],q[1],q[2]*(1-cr*.4)],off),Rd:v=>v},prof=SKP.map(([z,r])=>[z*.55,r*.62]);
    ctx.save();const c=P(off);ctx.beginPath();if(sd<0)ctx.rect(-200,-200,200+c[0],400);else ctx.rect(c[0],-200,200,400);ctx.clip();
    // her shape in dry bark: the bell of the gown with the corset, the head, the brim and the crooked cone of the hat
    const pts=revo(prof,SKA,X,0,10).map(q=>P(q));for(const q of ellSil(V0,[0,0,35],[4.6,6.8,7.5],null,X.T,10))pts.push(q);svol(pts,KD0.bark,{lw:2.4,rim:.25});
    svol(ellSil(V0,[1.6,0,48.5],[5.2,5.5,7.2],null,X.T,12),KD0.bark,{lw:2.2});
    const bt=[],bb=[];for(let i=0;i<14;i++){const t=i/14*TAU;bt.push(P(X.T([1+Math.cos(t)*9,Math.sin(t)*9,54])));bb.push(P(X.T([1+Math.cos(t)*9,Math.sin(t)*9,53])))}svol(bt.concat(bb),KD0.hat,{lw:2.2});
    const hp=revo(HATP.map(([z,r])=>[z*.6,r*.6]),1,{T:q=>X.T(add(q,[0,0,54]))},0,8).map(q=>P(q));svol(hp,KD0.hat,{lw:2.2});
    const tp=TIP1.map(q=>X.T(add([q[0]*.6,q[1]*.6,q[2]*.6],[0,0,54])));limb3(V0,tp,TIPR.map(r=>r*.6),KD0.hat,{lw:1.8,flat:1,noShade:1});
    // the cracks, lit from inside
    const C2=[[0,0,6],[2,1,18],[0,-1,30],[1.5,.5,42],[0,0,52],[0,0,62]].map(q=>P(X.T([q[2]<44?5:6,q[1]+sd*.5,q[2]])));strokeRuns([C2],'rgba(12,6,4,.9)',2);if(gl>.02){if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';strokeRuns([C2],`rgba(255,138,60,${.4*gl})`,4.5);ctx.restore()}strokeRuns([C2],cmix('#5a3a24','#ffb04a',gl),1)}
    ctx.restore()};
  ctx.save();ctx.globalAlpha*=1-sstep(.75,1,k);piece(-1);piece(1);ctx.restore();
  // dry leaves on it and falling off
  for(let i=0;i<6;i++){const a=i*1.1,q3=[Math.cos(a)*9,Math.sin(a)*10,12+i*6-cr*30*(i%2+1)];if(q3[2]<1)continue;leafDraw(V0,q3,a*3+cr*6,Object.assign({},K1,{leaf:KD.leaf,back:KD.back,nerv:KD.nerv}),{al:1-cr})}
  if(sp>0&&sp<1&&!LOWFX)shine('255,170,80',0,-30,26,.6*Math.sin(sp*Math.PI));
  ctx.restore()};
// N3.witchSprout(x, y, k, sc, o): the rootlets and leaves turning in the circle where she will come up (k a cycle); o.p2
N3.witchSprout=function(x,y,k,sc,o){o=o||{};sc=sc||1;const K=o.p2?K2:K1,t=(k||0)*TAU;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(!LOWFX)shine(K.vG,0,0,26,.25);
  const R=[];for(let i=0;i<6;i++){const a=t+i*TAU/6,r=24+3*Math.sin(t*2+i),b=[Math.cos(a)*r,Math.sin(a)*r*.55],e=[Math.cos(a+.5)*(r-9),Math.sin(a+.5)*(r-9)*.55-5-2*Math.sin(t*3+i)];R.push([b,[(b[0]+e[0])/2,(b[1]+e[1])/2-3],e])}
  strokeRuns(R,INK,3.4);strokeRuns(R,K.bark.b,1.6);
  const V0=VF();for(let i=0;i<4;i++){const a=-t*1.3+i*TAU/4,q3=[Math.sin(a)*18,Math.cos(a)*18,3+2*Math.sin(t*2+i)];leafDraw(V0,q3,a*2,K,{al:.95})}ctx.restore()};
// N3.witchLeaf(x, y, z, rot, sc, o): a falling leaf (o.p2 the autumn, o.dry a dry one)
N3.witchLeaf=function(x,y,z,rot,sc,o){o=o||{};sc=sc||1;const K=o.dry?Object.assign({},K1,{leaf:KD.leaf,back:KD.back,nerv:KD.nerv}):o.p2?K2:K1;ctx.save();ctx.translate(x,y-(z||0));ctx.scale(sc,sc);leafDraw(VF(),[0,0,0],rot||0,K,{al:o.al==null?1:o.al});ctx.restore()};
// the same with the model's name (N3.witch2Thorn, ...)
for(const n of['Thorn','Seed','Hand','Bump','Root','Husk','Sprout','Leaf'])N3['witch2'+n]=N3['witch'+n];

reg('witch2',{n:'Strega delle Radici',g:'boss',sc:1,an:MV.slice(),dur:Object.assign({},DUR),
  lab:{idle:'Fermo',walk:'Scivola sulle radici',hit:'Colpita',hand:'Mano del Bosco',spiral:'Spirale di Spine',sink:'Sprofonda',fin:'La punta del cappello',rise:'Riaffiora',
    fix:'Cappello storto',roots:'Radici della Cripta',sow:'Il Giardino della Strega',rite:'Rito delle Rune (fase 2)',rage:"L'autunno della Strega (fase 2)",taunt:'Presa in giro',enter:'Il Risveglio',die:"L'ultimo autunno"}},witch2);
// «Prima e dopo»: the Witch of today
{const OLD=N3.witch,M0=N3.meta.witch;if(OLD&&M0)N3.meta.witch2.old=(x,y,f,a,pp)=>OLD(x,y,f,M0.an.includes(a)?a:'idle',pp,M0.sc||1,{})}
})();
