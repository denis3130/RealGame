// =====================================================================
// 106. GLI ZOMBIE IN 3D VERO (tripla A, anteprima a parte; Denis, 2 novembre: «rendilo tripla A», e prima per l'eroe: «non può essere in 2d,
// ce l'abbiamo già il modello in 3d usiamo quello»).
// Nella visuale in terza e prima persona (105) gli zombie sono fatti di volumi 3D come l'eroe. La posa è quella dei loro disegni
// (sprite/mostri/disegno_mostri.js: lo scheletro col tronco tra il bacino e il petto, braccia e gambe a due ossa con la IK, ogni mossa che
// dipende solo da p): i numeri della posa sono ricopiati qui, mossa per mossa, senza toccare i disegni (che restano identici al pixel, la
// lanterna compresa). Per ogni posa i pezzi in 3D: il tronco a capsula con l'orlo strappato, le braccia ossute col gomito nodoso, le maniche
// stracciate e le mani ad artiglio coi denti neri delle unghie, le gambe con le scarpe, il collo, la testa con le chiazze, le orbite scure, gli
// occhi che brillano nel buio, la bocca larga coi denti storti, i capelli radi; il piccone, l'elmetto con la lampada che fa luce davvero.
// Ogni posa si fa una volta (24 per mossa, 16 da fermo) e si tiene; tra due pose il disegno scivola dall'una all'altra (105: aP2, uKF), così
// si muovono fluidi come lo schermo. Dipinti come l'eroe: tre toni con la luce dall'alto a sinistra, il bordo caldo, la luna fredda sul bordo,
// il contorno scuro spesso (non su denti, occhi e capelli), poi la notte, le lanterne e la nebbia della mappa. Escono da terra (il terreno li
// copre davvero), muoiono affondando. Chi non ha ancora un modello 3D (o la sua posa non è pronta) resta il disegno dipinto di 105.
// Fuori da src/ordine.txt: solo nell'anteprima della visuale (anteprime/mk_visuale.py), dopo 105.
// =====================================================================
const Z3={on:true,NF:{idle:16,walk:24,attack:24,slam:24,summon:24},M:new Map(),B:{},built:0,ms:0,n:0,maxM:900};
const z3c=(hex,a)=>{const q=v3rgb(hex);return[q[0],q[1],q[2],a==null?255:a]};
// ------------------------------------------------------------------ the kit: pieces into a mesh (v3MB of 105: places, normals, colours,
// triangles turned outward). Every piece makes the same number of corners whatever its pose, so two poses of the same move can be blended
function z3Kit(m){const{add,sub,mul,nrm,dot,cross,len}=RG;m.W=m.W||[];let ow=1;
  // (K.rz: a turn round the up axis for everything that follows, the scarecrow's spin; K.of: a shift)
  const mark=(fn)=>{const s=m.P.length/3;fn();const e=m.P.length/3;for(let i=s;i<e;i++){m.W[i]=ow;if(K.rz){const c=Math.cos(K.rz),sn=Math.sin(K.rz);for(const A of[m.P,m.N]){const x=A[i*3],y=A[i*3+1];A[i*3]=x*c-y*sn;A[i*3+1]=x*sn+y*c}}}};
  const K={m,
    // how thick the outline of what follows (1 the body, less for small things, 0 none)
    ow(w){ow=w;return K},
    // a ball; cf(direction) gives each corner its colour (spots, the rotten patch); sq squashes it (dome: everything below the middle flat)
    ball(c,r,col,nl,nb,cf,o){nl=nl||12;nb=nb||8;o=o||{};mark(()=>{const rows=[];for(let j=0;j<=nb;j++){const th=j/nb*Math.PI,row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2;
        let d=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)],p=add(c,[d[0]*r*(o.sx||1),d[1]*r*(o.sy||1),d[2]*r*(o.sz||1)]),n=d;
        if(o.dome&&d[2]<0){p=[p[0],p[1],c[2]];n=[0,0,-1]}row.push(v3V(m,p,n,cf?cf(d):col))}rows.push(row)}
      for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],cc=rows[j+1][i+1],dd=rows[j+1][i];if(j>0)v3T(m,a,b,cc);if(j<nb-1)v3T(m,a,cc,dd)}});return K},
    // a capsule from a (radius ra) to b (rb): half balls at the ends, the side in between; cf(place) for a colour that changes along it
    cap(a,ra,b,rb,col,N,cf){N=N||10;mark(()=>{const d=sub(b,a),L=len(d)||1e-3,u=mul(d,1/L);let v=cross(u,[0,0,1]);if(len(v)<.2)v=cross(u,[1,0,0]);v=nrm(v);const w=cross(u,v),NC=4,rings=[];
        for(let k=0;k<=NC;k++){const th=-Math.PI/2+k/NC*(Math.PI/2);rings.push([a,ra*Math.sin(th),ra*Math.cos(th),Math.sin(th)])}
        for(let k=0;k<=NC;k++){const th=k/NC*(Math.PI/2);rings.push([b,rb*Math.sin(th),rb*Math.cos(th),Math.sin(th)])}
        const rows=rings.map(([C,ax,rad,ns])=>{const row=[],nc=Math.sqrt(Math.max(0,1-ns*ns));for(let i=0;i<=N;i++){const an=i/N*Math.PI*2,dr=add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),p=add(add(C,mul(u,ax)),mul(dr,rad));
          row.push(v3V(m,p,nrm(add(mul(u,ns),mul(dr,nc))),cf?cf(p):col))}return row});
        for(let j=0;j<rows.length-1;j++)for(let i=0;i<N;i++){v3T(m,rows[j][i],rows[j][i+1],rows[j+1][i+1]);v3T(m,rows[j][i],rows[j+1][i+1],rows[j+1][i])}});return K},
    // a tube along points (radius at each), its ends closed (a cone if the last radius is tiny)
    tube(P,rad,col,N){mark(()=>v3Tube(m,P,rad,col,N||6));return K},
    // a flat ellipse facing n (rx across, ry along `up`), or laid on a ball (on: [centre, radius]) so it follows its curve
    disc(c,n,rx,ry,col,up,on,N){N=N||12;n=nrm(n);let a=up?sub(up,mul(n,dot(up,n))):cross(n,[0,0,1]);if(len(a)<.1)a=cross(n,[1,0,0]);a=nrm(a);const b=cross(a,n);
      const put=p=>on?add(on[0],mul(nrm(sub(p,on[0])),on[1])):p,nn=p=>on?nrm(sub(p,on[0])):n;
      mark(()=>{const c0=put(c),k0=v3V(m,c0,nn(c0),col),ring=[];for(let i=0;i<N;i++){const an=i/N*Math.PI*2,p=put(add(c,add(mul(b,Math.cos(an)*rx),mul(a,Math.sin(an)*ry))));ring.push(v3V(m,p,nn(p),col))}
        for(let i=0;i<N;i++)v3T(m,k0,ring[i],ring[(i+1)%N])});return K},
    // a flat quad with four corners (both faces)
    quad(A,B,C,D,col){mark(()=>{const n=nrm(cross(sub(B,A),sub(D,A)));v3Quad(m,A,B,C,D,n,col);v3Quad(m,A,D,C,B,mul(n,-1),col)});return K},
    // a flat polygon (a fan from its middle, both faces)
    poly(pts,col){mark(()=>{const c=pts.reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/pts.length),n=nrm(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0])));for(const sg of[1,-1]){const nn=mul(n,sg),c0=v3V(m,c,nn,col),r=pts.map(q=>v3V(m,q,nn,col));
      for(let i=0;i<r.length;i++)v3T(m,c0,r[i],r[(i+1)%r.length])}});return K},
    // a skin through rings of points (the same number in each): cloaks, capes, the hat's brim; the normals out from each ring's middle
    loft(R,col,cf,closed,nfix){mark(()=>{const rows=R.map((ring,j)=>{const c=ring.reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/ring.length),up=j<R.length-1?sub(R[j+1].reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/ring.length),c):sub(c,R[j-1].reduce((a,b)=>add(a,b),[0,0,0]).map(v=>v/ring.length));
        return ring.map((q,i)=>{let n=sub(q,c);if(len(up)>1e-4)n=sub(n,mul(nrm(up),dot(n,nrm(up))));return v3V(m,q,nfix||nrm(n),cf?cf(q,i,j):col)})});
      const nI=R[0].length-(closed===false?1:0);for(let j=0;j<rows.length-1;j++)for(let i=0;i<nI;i++){const a=rows[j][i],b=rows[j][(i+1)%R[0].length],c=rows[j+1][(i+1)%R[0].length],d=rows[j+1][i];v3T(m,a,b,c);v3T(m,a,c,d)}});return K},
    // a box: centre and the three half sides (as vectors)
    box(c,X,Y,Z,col){mark(()=>{for(const[A,B,C] of[[X,Y,Z],[Y,Z,X],[Z,X,Y]])for(const sg of[1,-1]){const o=add(c,mul(A,sg)),n=nrm(mul(A,sg));v3Quad(m,add(add(o,B),C),add(sub(o,B),C),sub(sub(o,B),C),add(sub(o,C),B),n,col)}});return K},
    // a hood: a ball of cloth with its front cut away (where it faces n beyond CA), the dark lining inside, the lip round the opening
    hood(H,R,n,CA,col,lin,lipC,nl,nb){nl=nl||18;nb=nb||12;n=nrm(n);mark(()=>{for(const[r,sg,c] of[[R,1,col],[R*.94,-1,lin]]){const rows=[];for(let j=0;j<=nb;j++){const th=j/nb*Math.PI,row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2,d=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)];row.push([v3V(m,add(H,mul(d,r)),mul(d,sg),c),d])}rows.push(row)}
        for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],cc=rows[j+1][i+1],dd=rows[j+1][i],mid=nrm(add(add(a[1],cc[1]),add(b[1],dd[1])));if(dot(mid,n)>CA)continue;if(j>0)v3T(m,a[0],b[0],cc[0]);if(j<nb-1)v3T(m,a[0],cc[0],dd[0])}}});
      let u=cross(n,[0,0,1]);if(len(u)<.2)u=[0,1,0];u=nrm(u);const w=cross(n,u),SA=Math.sqrt(1-CA*CA),lip=[];for(let i=0;i<=24;i++){const th=i/24*Math.PI*2;lip.push(add(H,mul(add(mul(n,CA),add(mul(u,Math.cos(th)*SA),mul(w,Math.sin(th)*SA))),R*.98)))}
      K.tube(lip,lip.map(()=>R*.09),lipC,5);return K}};
  return K}
// the pieces of a zombie, the same as the drawings' helpers (leg, zArm with claw and rag, trunk, neck, zHead)
function z3Leg(K,hip,foot,o){const{add,ik}=RG,[kn,f]=ik(hip,add(foot,[0,0,o.ank||1.6]),o.L1,o.L2,o.pole||[1,0,.15]),c=z3c(o.col),r1=o.w1/2,r2=o.w2/2,rk=(r1+r2)/2;
  K.ow(1).cap(hip,r1,kn,rk,c,8).cap(kn,rk,f,r2,c,8);K.cap(add(f,[-o.heel,0,-.4]),o.sr,add(f,[o.toe,0,-.6]),o.sr*1.08,z3c(o.shoe),9);return{kn,f}}
function z3Claw(K,h,fd,r,col,pd,fl,nailC){const{add,sub,mul,nrm,dot,cross,len,lerp3}=RG;pd=pd||[1,0,-1];let cv=sub(pd,mul(fd,dot(pd,fd)));
  if(len(cv)<.25){const alt=[0,0,-1];cv=sub(alt,mul(fd,dot(alt,fd)));if(len(cv)<.25)cv=[1,0,0]}cv=nrm(cv);const sa=nrm(cross(fd,cv)),L=fl||r*3,w=Math.max(.9,r*.62)/2,nail=z3c(nailC||RG.ZC.nail);
  K.ow(.8).ball(h,r,col,9,6);
  for(let k=-1;k<=1;k++){const d=nrm(add(fd,mul(sa,k*.5))),Lk=L*(k?.86:1),a=add(h,mul(d,r*.5)),b=add(add(h,mul(d,Lk*.75)),mul(cv,-Lk*.05)),c=add(add(h,mul(d,Lk*.97)),mul(cv,Lk*.36));
    K.ow(.5).tube([a,b,c],[w,w*.9,w*.8],col,5);const tp=add(c,mul(nrm(sub(c,b)),w*1.8+.7));K.ow(.3).tube([lerp3(b,c,.55),c,tp],[w*.92,w*.82,.05],nail,5)}}
// a torn sleeve: a tube from the shoulder down the arm, its end in hanging rags
function z3Rag(K,s3,e3,r0,r1,col){const{add,sub,mul,nrm,cross,len}=RG;K.ow(.9).cap(s3,r0,e3,r1,col,8);const u=nrm(sub(e3,s3));let v=cross(u,[0,0,1]);if(len(v)<.2)v=cross(u,[1,0,0]);v=nrm(v);const w=cross(u,v);
  for(let i=0;i<5;i++){const an=i/5*Math.PI*2+.3,d=add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),b=add(e3,mul(d,r1*.9)),L=i%2?1.6:2.5;K.ow(.4).tube([b,add(b,add(mul(u,L),mul(d,-.25)))],[.8,.06],col,4)}}
// a thin dead arm: shoulder, elbow (by the IK), the knob of the elbow when it bends, the clawed hand, the torn sleeve over the top
function z3Arm(K,sh,hd,pole,o){const{add,sub,mul,nrm,len,lerp3,cl,ik}=RG,[el,h]=ik(sh,hd,o.L1,o.L2,pole),skin=z3c(o.skin),r1=o.w1/2,re=o.we/2,r2=o.w2/2;
  K.ow(.9).cap(sh,r1,el,re,skin,7).cap(el,re,h,r2,skin,7);const out=sub(el,lerp3(sh,h,.5)),ol=len(out),bend=cl(ol/(o.L1*.45),0,1);
  K.ball(ol>.05?add(el,mul(out,re*.4*bend/ol)):el,re*(1+.16*bend),skin,8,6);
  if(!o.noHand)z3Claw(K,h,o.fd||nrm(sub(h,el)),o.hand,skin,o.pd,o.fl,o.nail);
  if(o.sleeve)z3Rag(K,sh,lerp3(sh,el,o.sleeveK||.6),o.sleeve/2,o.sleeve/2*.9,z3c(o.cloth));return{el,h}}
// a trunk: the capsule from the pelvis to the chest, the torn hem hanging round the bottom; cf for clothes of two colours
function z3Trunk(K,Pv,rP,Ch,rC,col,teeth,cf){const{add,mul}=RG,c=z3c(col);K.ow(1).cap(Pv,rP,Ch,rC,c,14,cf);
  if(teeth){const n=teeth*2,hc=cf?cf(add(Pv,[0,0,-rP])):c;for(let i=0;i<n;i++){const an=i/n*Math.PI*2+.2,d=[Math.cos(an),Math.sin(an),0],b=add(Pv,add(mul(d,rP*.9),[0,0,-rP*.32])),L=(i%2?1.9:1.1)+(i%4===1?.9:0);
    K.ow(.5).tube([b,add(b,add(mul(d,.6),[0,0,-L]))],[1.5,.08],hc,4)}}}
// old dark blood on the clothes: stains round some directions from the trunk's axis (the shirt's colour elsewhere)
function z3Blood(Pv,Ch,col,dirs){const{sub,nrm,dot,lerp3}=RG,c0=z3c(col),bl=z3c('#3a1214'),bl2=z3c('#55201c'),D=dirs.map(nrm),ax=nrm(sub(Ch,Pv));
  return q=>{const t=Math.max(0,Math.min(1,dot(sub(q,Pv),ax)/(Math.hypot(...sub(Ch,Pv))||1))),cA=lerp3(Pv,Ch,t),d=nrm(sub(q,cA));let best=-1;for(const v of D)best=Math.max(best,dot(d,v)+(Math.sin(q[0]*1.7+q[1]*1.3+q[2]*2.1)*.05));
    return best>.9?bl:best>.84?bl2:c0}}
// a zombie head: the ball with its blotches and the rotten patch, the dark sockets with the eyes that glow (alpha below 255: they light by
// themselves), the mouth stretched wide with the gum and the broken teeth, the hair (the miner has his helmet instead)
function z3Head(K,Hc,R,ph,o){const{add,sub,mul,nrm,dot,cross}=RG,ZC=RG.ZC;o=o||{};const sk=z3c(o.skin||ZC.skin),skD=z3c(o.skinD||ZC.skinD),rot=z3c(ZC.rot),on=[Hc,R+.12];
  const blot=[[[-.45,-.6,.62],.22],[[-.85,.35,.38],.2],[[.15,.8,.55],.16],[[-.3,.15,.95],.15],[[.45,-.85,-.15],.17],[[-.6,-.25,-.75],.2]].map(([d,s])=>[nrm(d),Math.cos(s*1.1)]),rd=nrm([-.15,-.5,.85]);
  K.ow(1).ball(Hc,R,sk,16,12,d=>{if(!o.helmet&&dot(d,rd)>.94)return rot;for(const[b,c] of blot)if(dot(d,b)>c)return skD;return sk});
  for(const sd of[-1,1]){const big=sd>0?1.15:.9,d=nrm([.8,sd*.4,.16]),lit=!(o.deadEye&&sd<0);K.ow(0).disc(add(Hc,mul(d,R)),d,R*.3*big,R*.34*big,z3c(ZC.socket),[0,0,1],on);
    K.ball(add(Hc,mul(d,R*.95)),R*.14*big,lit?z3c(ZC.eye,120):z3c('#2a2620'),7,5)}
  {const n=nrm([.8,0,-.5]),a=nrm(sub([0,0,1],mul(n,dot([0,0,1],n)))),b=nrm(cross(a,n)),op=o.open||0,w=R*.52,hh=R*.22+op*R*.3,c=add(add(Hc,mul(n,R)),mul(a,-hh*.35)),bone=z3c(ZC.bone),onm=[Hc,R+.18];
    K.ow(0).disc(c,n,w,hh,z3c(ZC.mouth),a,on,14);K.disc(add(c,mul(a,hh*.62)),n,w*.8,.5,z3c(ZC.gum),a,onm,8);
    const surf=q=>add(Hc,mul(nrm(sub(q,Hc)),R+.2));
    for(let i=0;i<4;i++){const base=surf(add(add(c,mul(b,-w*.75+i*w*.5)),mul(a,hh*.55))),L=i===1?2.4:1.5;K.tube([base,add(base,mul(a,-L))],[.75,.06],bone,4)}
    for(let i=0;i<3;i++){const base=surf(add(add(c,mul(b,-w*.5+i*w*.5)),mul(a,-hh*.85)));K.tube([base,add(base,mul(a,1.6))],[.7,.06],bone,4)}}
  const ink=z3c('#1b1612'),S=d=>add(Hc,mul(nrm(d),R+.15));
  if(!o.helmet){for(let i=-1.5;i<=1.5;i++){const r=add(Hc,mul(nrm([-.25+Math.abs(i)*.1,i*.5,1]),R*.97)),k=i*1.3+Math.sin(ph+i)*.35;
    K.ow(0).tube([r,add(r,[-.3,i*.8,2.2]),add(r,[-.6,k*1.5,3.4-Math.abs(i)*.6])],[.5,.4,.06],ink,4)}
    // the stitched crack on the back of the head: the crack and three stitches across it
    K.tube([S([-1,-.12,.38]),S([-1,.1,.25]),S([-.98,.32,.36])],[.32,.32,.32],ink,3);for(let i=0;i<3;i++){const c=[-1,-.05+i*.14,.3+(i===1?-.05:0)];K.tube([S([c[0],c[1]-.05,c[2]+.12]),S([c[0],c[1]+.05,c[2]-.12])],[.25,.25],ink,3)}}
  // the scar on the cheek, healed badly (a dark line with two marks)
  if(!o.noScar){K.ow(0).tube([S([.15,1,-.02]),S([.2,1,-.2])],[.26,.26],ink,3);K.tube([S([.12,1,-.14]),S([.24,1,-.1])],[.22,.22],ink,3)}}
// ------------------------------------------------------------------ the zombies, their poses as in their drawings (the same numbers)
const z3ex=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
// ZOMBIE DELLA CRIPTA: the limp, the arms that reach, rearing back and raking down
Z3.B.zombie=(K,anim,p)=>{const{add,mul,nrm,stepper,NOSTEP}=RG,ZC=RG.ZC,ph=p*Math.PI*2,walk=anim==='walk',atk=anim==='attack',ez=z3ex;
  let up=0,reach=0,lunge=0;
  if(atk){if(p<.35){up=ez(p/.35);lunge=-up*2}else if(p<.6){const k=ez((p-.35)/.25);up=1-k*1.3;reach=k;lunge=-2+k*7}else{const k=ez((p-.6)/.4);up=-.3*(1-k);reach=1-k;lunge=5*(1-k)}}
  const st=stepper(p,.56),fL=walk?st(0,2.6,.5):NOSTEP,fR=walk?st(.5,4.2,2.2):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/6.8:0;
  const bob=walk?-spread*1.4:Math.sin(ph)*.35,roll=walk?.3-Math.sin(ph)*1.3:Math.sin(ph)*.5,L=lunge*.6,upP=Math.max(0,up);
  const Pv=[L,roll*.5,13.4+bob],Ch=[L+4.2-upP*3+reach*2,roll,21.4+bob+upP*1.2],Hc=add(Ch,[2.8-upP*1.2,roll*.25+Math.sin(ph*(walk?2:1)+.6)*1.1,12+(walk?Math.cos(ph*2)*.4:0)]);
  for(const[sd,f] of[[-1,fL],[1,fR]])z3Leg(K,add(Pv,[0,sd*3.4,-3.3]),[L*.4+1+f.x,sd*4.4,f.z],{L1:4.8,L2:4.8,w1:4.6,w2:4,col:ZC.pants,shoe:ZC.shoe,heel:1.3,toe:2.6,sr:2.2});
  z3Trunk(K,Pv,6.2,Ch,8.4,ZC.cloth,5,z3Blood(Pv,Ch,ZC.cloth,[[.9,.4,.15],[.7,-.2,-.5],[-.3,.9,-.3]]));
  // the hole in the shirt over the ribs (front, left side), the bumps of the spine on the back
  {const n=nrm([.82,-.55,-.1]),on=[Ch,8.6],c=add(Ch,mul(n,8.6)),a=[0,0,1],b=nrm([n[1],-n[0],0]),bone=z3c('#cfc2a0');K.ow(0).disc(c,n,4.3,3.6,z3c('#1c2116'),[0,0,1],on).disc(c,n,3.6,2.9,z3c('#2c3522'),[0,0,1],[Ch,8.66]);
    for(let i=0;i<3;i++){const y0=-1.4+i*1.5,pts=[-2.9,0,2.9].map((x,j)=>add(Ch,mul(nrm(add(add(n,mul(b,x/8.6)),mul(a,y0/8.6+(j===1?.06:0)))),8.75)));K.tube(pts,[.34,.42,.34],bone,4)}
    for(let i=0;i<3;i++)K.ow(.4).ball(add(Ch,mul(nrm([-1,0,.55-i*.42]),8.1)),1.05,z3c(ZC.skinD),7,5)}
  for(const sd of[-1,1]){const sh=add(Ch,[0,sd*7,3]),sw=walk?Math.sin(ph+(sd>0?Math.PI:0))*1.1:Math.sin(ph+sd)*.4,hd=add(Ch,[10-upP*12+reach*5,sd*(10+upP*2-reach*2),-.5+up*15.5+sw]);
    z3Arm(K,sh,hd,nrm([-.3*upP,sd*.6,-1+1.5*upP]),{L1:5.8,L2:5.8,w1:3.4,we:3,w2:2.2,hand:1.8,fl:5.6,skin:ZC.skin,cloth:ZC.cloth,sleeve:4.6,sleeveK:.36})}
  K.ow(1).cap(add(Ch,[1.6,0,6.8]),3.8,add(Hc,[-.8,0,-5.6]),3.4,z3c(ZC.skin),9);
  z3Head(K,Hc,8.2,ph,{open:atk&&p>.25&&p<.7?1:.45+.2*Math.sin(ph*2)})};
// ZOMBIE STRISCIANTE: only the upper half, it drags itself on its long arms; the spine and the rags trail on the floor
Z3.B.strisciante=(K,anim,p)=>{const{add,nrm,lerp,stepper,NOSTEP}=RG,ZC=RG.ZC,ph=p*Math.PI*2,walk=anim==='walk',atk=anim==='attack',ez=z3ex;
  let rear=0,lunge=0;if(atk){if(p<.35)rear=ez(p/.35);else if(p<.65){const k=ez((p-.35)/.3);rear=1-k;lunge=k*8}else lunge=8*(1-ez((p-.65)/.35))}
  const st=stepper(p,.5),hL=walk?st(0,3.4,2.6):NOSTEP,hR=walk?st(.5,3.4,2.6):NOSTEP,surge=walk?-Math.cos(ph*2)*.7:0,wig=walk?Math.sin(ph):Math.sin(ph)*.3;
  const B=lunge+surge,Ch=[B+1.5,wig*.5,6.8+rear*5],Wb=[B+1.5-9,-wig*.4,4.4+rear*1],Hc=add(Ch,[6,wig*.3,4.6+rear*1.2]),cD=z3c(ZC.clothD),bone=z3c(ZC.bone);
  for(let i=0;i<3;i++){const r=add(Wb,[-2,(i-1)*3.2,-2.5]),e=[Wb[0]-(5-i*1.4),(i-1)*5.2+Math.sin(ph+i)*.8,.4];K.ow(.6).tube([r,e],[1.8,.1],cD,5)}
  for(let i=4;i>=0;i--){const k=i/4,q=add(Wb,[-(3.5+k*8.5),Math.sin(ph+1+k*2)*1.6*k-wig*k,lerp(-1.6,-3.6,k)]),r=lerp(2.1,1.1,k);K.ow(.8).ball(q,r*1.15,bone,8,6,null,{sx:1.25})}
  z3Trunk(K,Wb,5,Ch,7.2,ZC.cloth,0);
  {const c=add(lerp3o(Wb,Ch,.45),[0,0,6.4]);K.ow(0).disc(c,[0,0,1],3.2,2.2,z3c(ZC.rot),[1,0,0]);for(let i=-1;i<=1;i++)K.ball(add(c,[i*1.6,0,.2]),.8,bone,6,4)}
  for(const[sd,f] of[[-1,hL],[1,hR]]){const sh=add(Ch,[1.4,sd*6,1]),hd=[10.1+f.x*1.2+lunge*1.1,sd*8.8,f.z+(atk?lunge*.25:0)];
    z3Arm(K,sh,hd,nrm([-.5,sd,.25]),{L1:7.4,L2:7.8,w1:3.4,we:3,w2:2.2,hand:1.9,fl:6,fd:nrm([1,sd*.3,-.25]),pd:[0,0,-1],skin:ZC.skin,cloth:ZC.cloth,sleeve:4.4,sleeveK:.32})}
  K.ow(1).cap(add(Ch,[3,0,2.4]),3.4,add(Hc,[-2.6,0,-2.6]),3,z3c(ZC.skin),9);
  z3Head(K,Hc,6.8,ph,{open:atk&&p>.25&&p<.7?1:.55+.2*Math.sin(ph*2),noScar:true})};
function lerp3o(a,b,k){return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]}
// ZOMBIE MINATORE: helmet with the lamp, overalls with the bib and the straps, the rusty pick swung over the head and stuck in the floor
const Z3MC={helm:'#d9a628',helmD:'#9a7418',over:'#3e5a7a',shirt:'#6a6458',boot:'#3a2a1a',wood:'#6b4a2a',iron:'#8a9098',ironD:'#5a6068',button:'#c9a040'};
Z3.B.minatore=(K,anim,p)=>{const{add,mul,nrm,lerp3,stepper,NOSTEP}=RG,ZC=RG.ZC,MC=Z3MC,ph=p*Math.PI*2,walk=anim==='walk',atk=anim==='attack',ez=z3ex;
  let a=-.75+(walk?Math.sin(ph+.6)*.2:Math.sin(ph)*.05),crouch=0,lunge=0,jolt=0;
  if(atk){if(p<.18){const k=ez(p/.18);a=-.75-k*.4;crouch=k*1.6}
    else if(p<.42){const k=(p-.18)/.24,o=1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2);a=-1.15+o*3.45;crouch=1.6*(1-k)}
    else if(p<.5){const k=(p-.42)/.08;a=2.3-k*3.3;lunge=k*3}
    else if(p<.68){const k=(p-.5)/.18;a=-1;lunge=3;jolt=1-k}
    else if(p<.84){const k=(p-.68)/.16;a=-1+Math.sin(k*Math.PI*3)*.1;lunge=3-k*1.5}
    else{const k=ez((p-.84)/.16);a=-1+k*.25;lunge=1.5*(1-k)}}
  const st=stepper(p,.56),fL=walk?st(0,4,1.8):NOSTEP,fR=walk?st(.5,4,1.8):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/8:0;
  const bob=(walk?-spread*1.3:Math.sin(ph)*.3)-crouch-jolt*.8,roll=walk?-Math.sin(ph)*1.4:Math.sin(ph)*.4,L=lunge*.6,jx=jolt*Math.sin(p*400)*.5;
  const Pv=[L+jx,roll*.4,12.4+bob],Ch=[L+2.6+lunge*.3+jx,roll,20.2+bob],Hc=add(Ch,[2.8,roll*.3+(walk?Math.sin(ph-1)*.8:Math.sin(ph)*.5),11-crouch*.3]);
  const pose=a=>{const hd=add(Ch,[2.6+Math.cos(a)*6.8,10.6,1+Math.sin(a)*8.8]),dir=nrm([Math.cos(a)*.95,.14,Math.sin(a)]),top=add(hd,mul(dir,15)),u=nrm([-dir[2]*.75,.66,dir[0]*.75]);
    return{a,hd,dir,top,u,tA:add(add(top,mul(u,7.2)),mul(dir,2.2)),tB:add(add(top,mul(u,-7.2)),mul(dir,2.2))}},low=q=>Math.min(q.tA[2],q.tB[2],q.top[2]-1);
  let pk=pose(a);if(low(pk)<.3){let lo=a,hi=Math.PI/2;for(let i=0;i<20;i++){const md=(lo+hi)/2;if(low(pose(md))<.3)lo=md;else hi=md}pk=pose(hi)}
  for(const[sd,f] of[[-1,fL],[1,fR]])z3Leg(K,add(Pv,[0,sd*3.4,-3.3]),[L*.4+1+f.x,sd*4.3,f.z],{L1:4.4,L2:4.6,w1:4.8,w2:4.2,col:MC.over,shoe:MC.boot,heel:1.4,toe:2.6,sr:2.4});
  // the shirt above, the overalls from the waist down; the bib and the straps on the chest, the brass buttons
  const cut=lerp3(Pv,Ch,.45)[2],ov=z3c(MC.over),shirt=z3c(MC.shirt);z3Trunk(K,Pv,6.3,Ch,8.2,MC.shirt,0,q=>q[2]<cut?ov:shirt);
  {const S=(d,o)=>add(Ch,mul(nrm(d),8.2+(o||.25)));K.ow(.4).quad(S([1,-.36,.32]),S([1,.36,.32]),S([1,.46,-.62]),S([1,-.46,-.62]),ov);
    const strap=[[1,.34,.36],[.45,.5,1],[-.45,.48,1],[-1,.34,.3],[-1,.36,-.55]];for(const sd of[-1,1])K.ow(.5).tube(strap.map(d=>S([d[0],d[1]*sd,d[2]],.35)),strap.map(()=>1.05),ov,5);
    for(const sd of[-1,1])K.ow(0).ball(S([1,sd*.36,.32],.6),1,z3c(MC.button),6,4)}
  {const sh=add(Ch,[0,-7.6,1.4]),sw=walk?Math.sin(ph)*2.4:Math.sin(ph)*.3,hd=add(sh,[2.5+sw,-1.6,-11.6+crouch*.5]);
    z3Arm(K,sh,hd,[-1,0,-.1],{L1:6,L2:6.2,w1:3.4,we:3,w2:2.2,hand:1.8,fl:5.4,pd:[.5,1,0],skin:ZC.skin,cloth:MC.shirt,sleeve:4.6,sleeveK:.4})}
  {const sh=add(Ch,[0,7.6,1.4]);z3Arm(K,sh,pk.hd,nrm([-.4,.5,-1]),{L1:6,L2:6.2,w1:3.4,we:3,w2:2.2,noHand:true,skin:ZC.skin,cloth:MC.shirt,sleeve:4.6,sleeveK:.4});
    K.ow(.9).ball(pk.hd,2.3,z3c(ZC.skin),9,6);
    // the pick: the handle and the curved iron head, its collar
    K.ow(.8).tube([add(pk.hd,mul(pk.dir,-4.5)),pk.top],[1.3,1.2],z3c(MC.wood),6);const T=add(pk.top,mul(pk.dir,2.2)),q=k=>lerp3(lerp3(pk.tA,T,k),lerp3(T,pk.tB,k),k);
    K.ow(.7).tube([pk.tA,q(.25),q(.5),q(.75),pk.tB],[.2,.9,1.35,.9,.2],z3c(MC.iron),6);K.ball(add(pk.top,mul(pk.dir,1)),1.7,z3c(MC.ironD),7,5)}
  K.ow(1).cap(add(Ch,[1.6,0,6.6]),3.8,add(Hc,[-.8,0,-5.4]),3.4,z3c(ZC.skin),9);
  z3Head(K,Hc,8,ph,{open:atk&&p>.35&&p<.6?1:.35,helmet:true,deadEye:true});
  // the helmet: the dome, the brim, the ridge, the lamp that shines (and lights the street: Z3.lamps)
  {const R=8,C0=add(Hc,[-.5,0,R*.5]),rd=R*.92,bw=R+1.2;K.ow(1).ball(C0,rd,z3c(MC.helm),14,8,null,{dome:1});K.ow(.6).disc(add(C0,[0,0,-.05]),[0,0,1],bw,bw,z3c(MC.helmD),[1,0,0],null,16).disc(add(C0,[0,0,-.12]),[0,0,-1],bw,bw,z3c(MC.helmD),[1,0,0],null,16);
    const rg=[];for(let i=0;i<=6;i++){const th=.25+i*(Math.PI-.5)/6;rg.push(add(C0,mul([Math.cos(th),0,Math.sin(th)],rd-.05)))}K.ow(0).tube(rg,rg.map(()=>.42),z3c(MC.helmD),4);
    const ld=nrm([1,0,.5]),lc=add(C0,mul(ld,rd*.95));K.ow(.6).ball(lc,2.6,z3c('#5a5f68'),9,6);K.ow(0).disc(add(lc,mul(ld,2.62)),ld,1.7,1.7,z3c('#fff6c8',60),[0,0,1],null,10)}};
// SEGUGIO INFERNALE: the hound of embers, four legs in three bones, the bony tail with its flame, the spikes on the spine, the jaws
const Z3HC={fur:'#302328',furD:'#1f161a',hi:'#4a3740',spike:'#9e2523',ember:'#ff7a2a',eye:'#ff3b2f',horn:'#c4b391',bone:'#e6dcc0',maw:'#4a0a0e',rib:'#604850'};
Z3.B.hound=(K,anim,p)=>{const{add,sub,mul,nrm,lerp3,stepper,NOSTEP,ik}=RG,HC=Z3HC,ph=p*Math.PI*2,gal=anim==='walk',atk=anim==='attack',idle=anim==='idle',ez=z3ex;
  let lift=0,crouch=0,str=0,pitch=0,wig=0,fwd=0,air=0,jaw=gal?.35+.15*Math.sin(ph*2):.2+(idle?Math.max(0,Math.sin(ph*2))*.3:0);
  if(atk){if(p<.28){const k=ez(p/.28);crouch=k;wig=Math.sin(k*Math.PI*5)*k;jaw=.45}
    else if(p<.36){const k=(p-.28)/.08;crouch=1-k;str=k;pitch=k*.4;jaw=.8;fwd=k}
    else if(p<.66){const k=(p-.36)/.3;lift=Math.sin(k*Math.PI)*13;str=1-k*.5;pitch=.4-k*.8;jaw=k<.55?1:Math.max(0,1-(k-.55)*6);fwd=1+k*2;air=Math.sin(k*Math.PI)}
    else if(p<.8){const k=(p-.66)/.14;crouch=Math.sin(k*Math.PI)*.8;pitch=-.4*(1-k);jaw=0;fwd=3}
    else{const k=ez((p-.8)/.2);fwd=3*(1-k);jaw=.2*k}}
  const gp=stepper(p,.5),flex=gal?Math.cos(ph)*1.6:0,bounce=gal?Math.abs(Math.sin(ph))*1.3:Math.sin(ph)*.35,yw=wig*1.2;pitch+=gal?Math.sin(ph)*.12:0;const pz=x0=>x0*pitch*.5;
  const R=[-8-flex*.5-str*1.5+fwd,yw*.4,13.4+lift+bounce-crouch*2.6+pz(-8)],C=[5+flex*.5+str*1.5+fwd,yw,14.4+lift+bounce-crouch*2.2+pz(5)],Hc=[C[0]+7+str*1.5,yw*1.3,C[2]+7.6+pz(7)-crouch*2.4];
  const fur=z3c(HC.fur),furD=z3c(HC.furD),spike=z3c(HC.spike),ember=z3c(HC.ember,70),bone=z3c(HC.bone);
  for(const[sd,fr,ps] of[[-1,0,0],[1,0,.1],[-1,1,.5],[1,1,.6]]){const f=gal?gp(ps,4.6,3):NOSTEP,base=fr?add(C,[1,sd*4.1,-4.2]):add(R,[-.5,sd*3.8,-3]),
      paw=fr?[6.5+fwd+f.x+air*4.5,sd*4.4,f.z+lift*.92+air*2]:[-9+fwd+f.x-air*4.5,sd*4.2,f.z+lift*.92+air*1.2],joint=fr?add(paw,[.6,0,2.2]):add(paw,[-1.6,0,3.4]),
      [kn,j2]=ik(base,joint,fr?4.6:4.4,fr?4.4:3.8,fr?[-1,0,-.1]:[1,0,.1]),pw=add(j2,sub(paw,joint)),lw=fr?[3.8,2.8,2.2]:[4.6,3,2.2];
    K.ow(1).cap(base,lw[0]/2,kn,lw[1]/2,fur,7).cap(kn,lw[1]/2,j2,lw[2]/2,fur,7).cap(j2,lw[2]/2,pw,1.1,fur,7);K.ball(add(pw,[.4,0,-.2]),1.6,furD,8,5,null,{sx:1.5,sz:.7});
    for(let i=-1;i<=1;i++)K.ow(0).tube([add(pw,[1.2,i*.8,-.2]),add(pw,[2.7,i*1.1,-.8])],[.45,.05],bone,4)}
  {const w=gal?Math.sin(ph-1.2)*2.4:Math.sin(ph)*2+wig*3,r0=add(R,[-4.6,0,2.2]),r1=add(R,[-8.6,w*.45,2.2]),r2=add(R,[-11.4,w,.2]);K.ow(1).tube([r0,r1,r2],[1.4,1.1,.9],fur,6);
    for(let i=1;i<3;i++){const b=lerp3(r0,r1,i/2.5);K.ow(.4).tube([b,add(b,[-.6,0,2])],[.9,.05],spike,4)}
    // the flame at the tip of the tail (it glows)
    K.ow(0).tube([r2,add(r2,[-.6,0,2.6]),add(r2,[-.2+Math.sin(ph*3)*.6,0,5.6])],[1.5,1.1,.08],ember,6);K.ball(add(r2,[-.3,0,1.2]),.9,z3c('#ffe28a',60),6,4)}
  // the body: rump and ribcage, the ribs on the flanks, the cracks that glow, the spikes along the spine
  K.ow(1).cap(R,6,C,7.2,fur,14,q=>q[2]<lerp3(R,C,.5)[2]-4?furD:fur);
  for(const sd of[-1,1]){for(let i=0;i<4;i++){const d=nrm([-.1-i*.24,sd,-.05]),c=add(C,mul(d,7.25));K.ow(0).tube([add(c,[0,0,3.2]),add(add(c,mul(d,.4)),[-.8,0,0]),add(c,[0,0,-3])],[.45,.5,.4],z3c(HC.rib),4)}
    for(const[C0,r0,d] of[[C,7.2,[.3,sd*.8,.4]],[R,6,[-.2,sd*.85,.35]]]){const n=nrm(d),c=add(C0,mul(n,r0+.05));K.ow(0).disc(c,n,1.1,2.6,ember,[0,0,1],[C0,r0+.1],8)}}
  for(let i=0;i<6;i++){const u=i/5,q3=add(lerp3(R,C,u),[0,0,(5.2+(6.4-5.2)*u)]),tp=add(q3,[-1.2,0,2.8+(i%2)*1.2+(i===5?.6:0)]);K.ow(.4).tube([q3,tp],[1.6,.06],spike,5)}
  // the neck with its hackles, the head: skull, snout with the upper and lower jaw and the fangs, the nose, the red eyes, ears and horns
  {const n0=add(C,[3.2,0,3.4]),n1=add(Hc,[-2.2,0,-1.8]);K.ow(1).cap(n0,4.4,n1,3.6,fur,10);for(let i=0;i<2;i++){const q3=add(lerp3(n0,n1,.3+i*.35),[0,0,3.4]);K.ow(.4).tube([q3,add(q3,[-1.6,0,3.8])],[1.7,.06],spike,5)}}
  {const Rh=5.6,u0=add(Hc,[2.8,0,-1.6]),u1=add(Hc,[8.4,0,-2.6]),l0=add(Hc,[2.4,0,-3.2]),l1=add(Hc,[7.6,0,-3.8-jaw*3]);
    K.ow(1).ball(Hc,Rh,fur,14,10,d=>d[2]<-.3?furD:fur);K.ow(.9).cap(u0,2.7,u1,1.9,fur,10).cap(l0,2.2,l1,1.5,furD,9);
    K.ow(0).quad(add(u0,[0,0,-1.4]),add(u1,[0,0,-1]),add(l1,[0,0,1]),add(l0,[0,0,1.1]),z3c(HC.maw));
    for(const sd of[-1,1]){for(let i=0;i<4;i++){const b=lerp3(add(u0,[.6,sd*1.7,-1.8]),add(u1,[0,sd*1,-1.3]),i/3);K.ow(0).tube([b,add(b,[0,0,-(i===2?2.8:1.5)-jaw*.6])],[.55,.05],bone,4)}
      for(let i=0;i<3;i++){const b=lerp3(add(l0,[.4,sd*1.2,1.3]),add(l1,[0,sd*.7,1]),.3+i*.3);K.tube([b,add(b,[0,0,1.4+jaw*.6])],[.5,.05],bone,4)}}
    K.ow(.3).ball(add(u1,[.8,0,.9]),1.1,z3c('#1b1612'),7,5);
    for(const sd of[-1,1]){const d=nrm([.62,sd*.5,.5]);K.ow(0).ball(add(Hc,mul(d,Rh*.92)),1.15,z3c(HC.eye,90),7,5,null,{sy:.9,sz:.6});
      const b1=add(Hc,mul(nrm([-.3,sd*.55,.75]),Rh*.9)),b2=add(Hc,mul(nrm([-.7,sd*.35,.65]),Rh*.9)),tp=add(Hc,[-3.4,sd*4.2,7]);K.ow(.4).quad(b1,tp,tp,b2,furD);
      K.ow(.7).tube([add(Hc,mul(nrm([-.2,sd*.6,.8]),Rh*.85)),add(Hc,[-2.8,sd*4.3,6.4]),add(Hc,[-5.4,sd*4.7,6]),add(Hc,[-7.2,sd*4.3,4.4])],[1.1,.8,.5,.06],z3c(HC.horn),6)}}};
// a patch of moss: dark balls, lighter ones on them, a few drips (on the surface at C + d·r)
function z3Moss(K,C,r,d,s){const{add,mul,nrm,cross,len}=RG,n=nrm(d),o=add(C,mul(n,r*.98));let u=cross(n,[0,0,1]);if(len(u)<.2)u=[0,1,0];u=nrm(u);const w=cross(n,u),at=(x,y,z)=>add(o,add(add(mul(u,x*s),mul(w,y*s)),mul(n,z*s)));
  for(const[x,y,r2] of[[-1.5,.5,1.8],[1.2,.2,2],[0,1,1.6]])K.ow(.4).ball(at(x,y,0),r2*s*.75,z3c('#4c6427'),6,4,null,{sz:.6});for(const[x,y,r2] of[[-1.5,0,1.5],[1.2,-.4,1.6]])K.ball(at(x,y,.6),r2*s*.6,z3c('#6f8b3a'),6,4,null,{sz:.6});
  K.ow(0).ball(at(-1.6,-.6,1),.6*s,z3c('#9ab556'),5,4);for(const[x,l] of[[-1.1,2.4],[1.5,1.6]])K.tube([at(x,1.2,0),add(at(x,1.2,0),[0,0,-l*s])],[.5*s,.1],z3c('#6f8b3a'),4)}
// ZOMBIE DELLA LANTERNA (the model of every drawing): the hunched ghoul in the mossy hooded cloak, the staff with the lantern that lights up
// the street (Z3.lamps), the long arm with the big claws, the legs in rags with three claws on each foot, the face inside the hood
const Z3LC={cloak:'#4b3a2b',cloakD:'#33271d',cloakL:'#6e5743',inside:'#1a130e',skin:'#9fb87e',skinD:'#7a9460',eye:'#f6ff9c',mouth:'#2e0b0b',tongue:'#c0393f',tooth:'#efe6cc',
  key:'#b07a40',wood:'#5e432a',iron:'#3c3c44',ironD:'#24242b',light:'#f2ff8a',wrap:'#43362c',band:'#6a5846',foot:'#2f2621',claw:'#1d1814',twig:'#4a3727',leaf:'#7d9c3c'};
Z3.B.lanterna=(K,anim,p)=>{const{add,sub,mul,nrm,lerp,lerp3,stepper,NOSTEP,ik}=RG,LC=Z3LC,ph=p*Math.PI*2,walk=anim==='walk',atk=anim==='attack',ez=z3ex;
  let a=-.25+(walk?Math.sin(ph+.5)*.1:Math.sin(ph)*.04),lean=0,lunge=0,burst=-1,taut=0,shake=0;
  if(atk){if(p<.24){const k=ez(p/.24);a=-.25+k*2.7;lean=k;taut=k*.5}else if(p<.38){const k=(p-.24)/.14;a=2.45;lean=1;shake=Math.sin(k*Math.PI);taut=.5}
    else if(p<.48){const k=(p-.38)/.1;a=2.45-ez(k)*3.45;lean=1-k*1.6;lunge=k*4;taut=.5+k*.5}else if(p<.7){const k=(p-.48)/.22;a=-1;lean=-.6;lunge=4;burst=k;taut=1-k*.7}
    else{const k=ez((p-.7)/.3);a=lerp(-1,-.25,k);lean=-.6*(1-k);lunge=4*(1-k);taut=.3*(1-k)}}
  const st=stepper(p,.56),fL=walk?st(0,4.4,2.4):NOSTEP,fR=walk?st(.5,4.4,2.4):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/8.8:0;
  const bob=walk?-spread*1.8:Math.sin(ph)*.5,roll=walk?-Math.sin(ph)*1.6:Math.sin(ph)*.4,L=lunge*.6,jit=shake*Math.sin(p*300)*.4;
  const Pv=[L-lean*1.5+jit,roll*.5,12+bob],Ch=[L+7-lean*4+jit,roll,19+bob+lean*2.2],Ho=add(Ch,[5-lean*1.6,roll*.3,5+lean*.8]),Hf=add(Ho,[5.2,Math.sin(ph*(walk?2:1)+.4)*.5,-2.4]),Hm=[L*.5-1.5-lean,roll*.3,8.4+bob*.5];
  const pose=a=>{const hd=add(Ch,[2.5+Math.cos(a)*4.6,10.2,-1+Math.sin(a)*7]),dir=nrm([Math.cos(a)*.95,.12,Math.sin(a)]);return{a,hd,dir,tip:add(hd,mul(dir,11.5)),butt:add(hd,mul(dir,-3.2))}};
  const sw=walk?Math.sin(ph*2-1.4)*.32:Math.sin(ph-1)*.1,lant=k=>add(k.tip,mul(nrm(lerp3([sw,sw*.25,-1],k.dir,taut)),5.4)),low=k=>Math.min(lant(k)[2]-3.4,k.tip[2]-1);
  let sv=pose(a);if(low(sv)<.2){let lo=a,hi=Math.PI/2;for(let i=0;i<22;i++){const md=(lo+hi)/2;if(low(pose(md))<.2)lo=md;else hi=md}sv=pose(hi)}
  const Lc=lant(sv),lit=burst>=0?Math.max(0,1-burst*2.5):0,cloak=z3c(LC.cloak),cloakD=z3c(LC.cloakD);
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*4.4,-3.2]),foot=[L*.5+3+f.x,sd*5.4,f.z],[kn,ff]=ik(hip,add(foot,[0,0,2.1]),5.4,5.6,[1,0,.12]),wr=z3c(LC.wrap);
    K.ow(1).cap(hip,2.9,kn,2.7,wr,8).cap(kn,2.7,ff,2.5,wr,8);K.cap(add(ff,[-1.8,0,-.8]),2.9,add(ff,[2.8,0,-1.1]),3.1,z3c(LC.foot),9);
    for(let i=-1;i<=1;i++)K.ow(.4).tube([add(ff,[3.3,i*1.5,-1.2]),add(ff,[5.4,i*2,-2.2])],[.7,.08],z3c(LC.claw),4);
    for(const u of[.35,.62])K.ow(0).ball(lerp3(kn,ff,u),2.75,z3c(LC.band),10,3,null,{sz:.22})}
  // the cloak: one sack from the chest through the pelvis to the hem (it hangs lower at the front), the torn strips under it
  const NR=20,ring=(C,r,tilt)=>{const o=[];for(let i=0;i<NR;i++){const an=i/NR*Math.PI*2;o.push(add(C,[Math.cos(an)*r,Math.sin(an)*r,(tilt||0)*Math.cos(an)]))}return o};
  K.ow(1).loft([ring(Hm,10,3.4),ring(lerp3(Hm,Pv,.5),8.9,1.7),ring(Pv,7.6),ring(lerp3(Pv,Ch,.5),7.9),ring(Ch,8.2),ring(add(Ch,[0,0,3.4]),5.4)],cloak);
  for(let i=0;i<16;i++){const an=i/16*Math.PI*2+.15,d=[Math.cos(an),Math.sin(an),0],L2=1.8+((i*5)%4)*.7+Math.sin(ph+i*1.3)*.3,b=add(add(Hm,[d[0]*10*.95,d[1]*10*.95,3.4*Math.cos(an)]),[0,0,.6]);
    K.ow(.5).tube([b,add(b,[d[0]*.9,d[1]*.9,-L2])],[1.5,.08],i%3?cloak:cloakD,4)}
  // holes showing the skin, moss, the rusty key hanging at the front
  for(const[C0,r0,d] of[[Pv,7.6,[.25,.97,-.05]],[Ch,8.2,[-.35,-.9,-.3]]]){const n=nrm(d);K.ow(0).disc(add(C0,mul(n,r0)),n,2.4,2.8,z3c(LC.skin),[0,0,1],[C0,r0+.1],9)}
  z3Moss(K,Ch,8.2,[.2,-.7,.7],1.2);z3Moss(K,Ch,8.2,[-.6,.55,.6],1);z3Moss(K,Hm,9.6,[.85,.45,.1],.9);z3Moss(K,Hm,9.6,[-.8,-.5,.1],.9);
  {const n=nrm([.8,-.55,-.15]),q=add(Pv,mul(n,7.9)),k=add(q,[Math.sin(ph*2)*.5,0,-3]),key=z3c(LC.key),rg=[];for(let i=0;i<=10;i++){const an=i/10*Math.PI*2;rg.push(add(k,[Math.cos(an)*1.3,0,Math.sin(an)*1.3]))}
    K.ow(0).tube([q,add(k,[0,0,1.3])],[.25,.25],z3c('#1b1612'),3).tube(rg,rg.map(()=>.4),key,4).tube([add(k,[0,0,-1.3]),add(k,[0,0,-5.2])],[.45,.45],key,4).tube([add(k,[0,0,-4]),add(k,[1.5,0,-4])],[.38,.38],key,3).tube([add(k,[0,0,-5]),add(k,[1.1,0,-5])],[.38,.38],key,3)}
  // the long left arm with the big claws, the right one on the staff; the staff, the chain and the lantern with its light
  {const sh=add(Ch,[1.5,-8,3.5]),s2=walk?Math.sin(ph)*2.4:Math.sin(ph)*.6,hd=add(Ch,[7+s2-lean*3,-9.6,-11.5+lean*5]);
    z3Arm(K,sh,hd,[-1,-.2,-.1],{L1:7.6,L2:7.8,w1:3.8,we:3.4,w2:2.5,hand:2.2,fl:6.6,skin:LC.skin,cloth:LC.cloak,nail:LC.claw,pd:[.4,1,-.2],sleeve:5.2,sleeveK:.8})}
  {const sh=add(Ch,[1.5,8,3.5]);z3Arm(K,sh,sv.hd,nrm([-.4,.5,-1]),{L1:6.8,L2:6.8,w1:3.8,we:3.4,w2:2.5,noHand:true,skin:LC.skin,cloth:LC.cloak,sleeve:5.2,sleeveK:.8});
    K.ow(.9).tube([sv.butt,sv.tip],[1.55,1.4],z3c(LC.wood),6).ball(sv.hd,2.6,z3c(LC.skin),9,6);
    const U=nrm(sub(sv.tip,Lc)),X0=nrm(RG.cross(U,[0,1,0])),X=RG.len(X0)>.1?X0:[1,0,0],Y=RG.cross(U,X),w=2.6,h=3.2,iron=z3c(LC.ironD),glass=z3c(lit>.3?'#ffffff':LC.light,lit>.3?20:70);
    K.ow(0).tube([sv.tip,add(Lc,mul(U,h+2.4))],[.3,.3],z3c('#1b1612'),3);
    K.ow(.6).box(Lc,mul(X,w),mul(Y,w),mul(U,h),glass);
    K.ow(0).box(Lc,mul(X,w*.16),mul(Y,w*1.04),mul(U,h*1.02),iron).box(Lc,mul(X,w*1.04),mul(Y,w*.16),mul(U,h*1.02),iron);
    const top=add(Lc,mul(U,h+1.7)),c4=[[1,1],[1,-1],[-1,-1],[-1,1]].map(([i,j])=>add(add(Lc,mul(U,h+.2)),add(mul(X,i*(w+.8)),mul(Y,j*(w+.8)))));
    K.ow(.6);for(let i=0;i<4;i++)K.poly([c4[i],c4[(i+1)%4],top],iron);K.box(sub(Lc,mul(U,h+.5)),mul(X,w+.7),mul(Y,w+.7),mul(U,.6),iron);
    const rg=[];for(let i=0;i<=8;i++){const an=i/8*Math.PI*2;rg.push(add(add(top,mul(U,1.2)),add(mul(X,Math.cos(an)*1.1),mul(U,Math.sin(an)*1.1))))}K.ow(0).tube(rg,rg.map(()=>.3),iron,3)}
  // the cape over the shoulders, its torn edge; the hood with the dark inside and the lip, the moss on it, its point with the twig
  {const top=add(Ho,[-1.5,0,-4.5]),r2=ring(add(Ch,[-.5,0,3]),10.5,1.4);K.ow(1).loft([r2,ring(lerp3(add(Ch,[-.5,0,3]),top,.5),8.6,.7),ring(top,6)],cloak);
    for(let i=0;i<18;i++){const an=i/18*Math.PI*2+.1,d=[Math.cos(an),Math.sin(an),0],b=add(r2[Math.round(i/18*NR)%NR],[0,0,.4]);K.ow(.5).tube([b,add(b,[d[0]*1.2,d[1]*1.2,-(1.6+((i*3)%3)*.8+Math.sin(ph+i)*.25)])],[1.4,.08],i%2?cloak:cloakD,4)}
    z3Moss(K,add(Ch,[-.5,0,3]),9.8,[-.4,-.75,.5],1);z3Moss(K,add(Ch,[-.5,0,3]),9.8,[.3,.85,.4],.9)}
  const Rh=8.6,Rf=7;K.ow(1).hood(Ho,Rh,[1,0,-.2],.47,cloak,z3c(LC.inside),z3c(LC.cloakL));
  for(const[d,sz] of[[[.15,-.45,.88],1.2],[[-.35,.5,.8],1],[[.45,.55,.7],.8]])z3Moss(K,Ho,Rh,d,sz);
  {const tb=add(Ho,mul(nrm([-.6,0,.8]),Rh*.7)),tp=add(Ho,[-Rh*1.25,Math.sin(ph)*.4,Rh*.62]),tw=z3c(LC.twig),lf=z3c(LC.leaf);K.ow(1).cap(tb,Rh*.42,tp,1.4,cloak,9);
    const s1=add(tp,[-1,.3,3.4]),s2=add(s1,[1.1,.5,3.2]),f1=add(s1,[-2.4,-.4,2]),sw2=Math.sin(ph*2)*.5;K.ow(.6).tube([tp,s1,s2],[.8,.6,.3],tw,4).tube([s1,f1],[.5,.3],tw,4);
    for(const[e,l] of[[s2,2.2],[f1,1.8]]){const q=add(e,[sw2,0,-l-1.4]);K.ow(0).tube([e,add(q,[0,0,1.2])],[.12,.12],z3c('#1b1612'),3).ball(q,1.2,lf,6,4,null,{sx:.6,sz:1.5})}}
  // the face inside the hood: the eyes that glow, the mouth with its teeth and the tongue hanging out
  {const sk=z3c(LC.skin),skD=z3c(LC.skinD);K.ow(.8).ball(Hf,Rf,sk,14,10,d=>d[2]<-.45||(d[0]<.2&&d[2]>.5)?skD:sk);
    for(const sd of[-1,1]){const big=sd>0?1.18:.94,d=nrm([.64,sd*.58,.24]);K.ow(0).disc(add(Hf,mul(d,Rf)),d,Rf*.27*big,Rf*.29*big,z3c('#1b1612'),[0,0,1],[Hf,Rf+.1]);K.ball(add(Hf,mul(d,Rf*.93)),Rf*.21*big,z3c(LC.eye,90),7,5,null,{sz:1.1})}
    const op=atk&&p>.3&&p<.75?1:.4+.15*Math.sin(ph*2),mn=nrm([.86,0,-.42]),aa=nrm(sub([0,0,1],mul(mn,RG.dot([0,0,1],mn)))),bb=nrm(RG.cross(aa,mn)),wd=Rf*.42,hh=Rf*.2+op*Rf*.22,c=add(add(Hf,mul(mn,Rf)),mul(aa,-hh*.3));
    K.ow(0).disc(c,mn,wd,hh,z3c(LC.mouth),aa,[Hf,Rf+.12],12);for(let i=0;i<4;i++){const base=add(Hf,mul(nrm(sub(add(add(c,mul(bb,-wd*.7+i*wd*.47)),mul(aa,hh*.55)),Hf)),Rf+.18));K.tube([base,add(base,mul(aa,-1.6))],[.6,.06],z3c(LC.tooth),4)}
    const m0=add(Hf,add(mul(mn,Rf*.95),[0,0,-Rf*.12])),m1=add(m0,[1.1+op*.7,Math.sin(ph*2+1)*.6,-3.2-op*1.2]);K.ow(.6).cap(m0,1.2,m1,1.7,z3c(LC.tongue),8)}};
// IL BECCHINO (boss): the gravedigger in the long coat, the ribcage open on the belly with the green glow, the chain across the chest, the
// shovel in the right hand, the big hand with real fingers, the small head with one huge glowing eye, the stitched grin, the battered top hat,
// the flies round his head
const Z3BC={skin:'#7d9a62',skinD:'#5d7848',coat:'#2e2638',coatD:'#1e1826',coatL:'#463a56',hat:'#1f1a24',band:'#6a1e28',metal:'#8a96a2',metalD:'#5f6a76',wood:'#6b4a2a',
  woodD:'#4a321c',bone:'#e6dcc0',hole:'#0e140c',glow:'#96ff6e',chain:'#7a7f86',boot:'#1b1714',patch:'#6b5a3a'};
// a big hand with four long fingers in two bones that hook toward the palm, a thumb, black claws (bigHand of the drawings)
function z3BigHand(K,h,fd,r,col,pd,o){const{add,sub,mul,nrm,dot,cross,len}=RG;o=o||{};pd=pd||[1,0,-1];fd=nrm(fd);let cv=sub(pd,mul(fd,dot(pd,fd)));if(len(cv)<.25){const alt=[0,0,-1];cv=sub(alt,mul(fd,dot(alt,fd)));if(len(cv)<.25)cv=[1,0,0]}
  cv=nrm(cv);const sa=nrm(cross(fd,cv)),L=o.fl||r*1.6,curl=o.curl==null?.55:o.curl,sp=o.spread||1,w1=Math.max(1,r*.42)/2,w2=Math.max(.8,r*.3)/2,nail=z3c(RG.ZC.nail);
  const bend=(b,d,Lk,cu)=>{const j=add(add(b,mul(d,Lk*.55)),mul(cv,Lk*.14*cu)),d2=nrm(add(mul(d,1-cu*.8),mul(cv,cu))),t=add(j,mul(d2,Lk*.48));K.ow(.6).tube([b,j],[w1,w1*.95],col,5).ball(j,w1*1.1,col,6,4).tube([j,t],[w2*1.1,w2],col,5);
    K.ow(.3).tube([t,add(t,mul(d2,w2*1.6+1.4))],[w2*1.05,.06],nail,4)};
  K.ow(.9).ball(h,r,col,10,7);for(let k=-1.5;k<=1.5;k++){const d=nrm(add(fd,mul(sa,k*.3*sp))),b=add(add(h,mul(d,r*.5)),mul(sa,k*r*.28*sp));bend(b,d,L*(1-Math.abs(k)*.08),curl)}
  if(o.thumb){const sg=o.thumb,d=nrm(add(mul(sa,sg*.95),add(mul(fd,.5),mul(cv,.25))));bend(add(h,mul(sa,sg*r*.75)),d,L*.6,Math.max(.3,curl))}}
Z3.B.becchino=(K,anim,p)=>{const{add,sub,mul,nrm,lerp,lerp3,cross,stepper,NOSTEP,ik,cl}=RG,BC=Z3BC,ZC=RG.ZC,ph=p*Math.PI*2,walk=anim==='walk',slam=anim==='slam',sum=anim==='summon',ez=z3ex;
  let a=-.55+(walk?Math.sin(ph)*.1:Math.sin(ph)*.03),rise=0,shake=0;
  if(slam){if(p<.45){const k=ez(p/.45);a=-.55+k*3.05;rise=k*2}else if(p<.6){const k=(p-.45)/.15;a=2.5-k*4}else{const k=ez((p-.6)/.4);a=lerp(-1.5,-.55,k)+Math.sin(k*Math.PI)*.5;shake=1-k}}
  const armUp=sum?(p<.25?ez(p/.25):p<.8?1:1-ez((p-.8)/.2)):0;
  const stp=stepper(p,.58),fL=walk?stp(0,3.4,2.4):NOSTEP,fR=walk?stp(.5,3.4,2.4):NOSTEP,spread=walk?Math.abs(fL.x-fR.x)/6.8:0;
  const bob=walk?-spread*1.8:Math.sin(ph)*.6,sway=walk?-Math.sin(ph)*1.3:0,jit=shake*Math.sin(p*260)*.7;
  const Pv=[jit,sway*.5,15.4+bob+rise*.4],Ch=[2.2+jit-rise*.6,sway,26.6+bob+rise],Hc=add(Ch,[3.4-rise*.4,sway*.5,15.4]);
  const pose=a=>{const hd=add(Ch,[5.4+Math.cos(a)*6.5,13.6,-5+Math.sin(a)*10]),dir=nrm([Math.cos(a)*.9,.16,Math.sin(a)]),w3=nrm([-dir[2]*.75,.66,dir[0]*.75]);return{a,hd,dir,w3,b0:add(hd,mul(dir,15)),b1:add(hd,mul(dir,25.5))}},
    low=k=>Math.min(k.b1[2]+k.dir[2]*4.4-Math.abs(k.w3[2])*4.2,k.b0[2]);
  let sv=pose(a);if(low(sv)<.3){let lo=a,hi=Math.PI/2;for(let i=0;i<20;i++){const md=(lo+hi)/2;if(low(pose(md))<.3)lo=md;else hi=md}sv=pose(hi)}
  const coat=z3c(BC.coat),coatD=z3c(BC.coatD),skin=z3c(BC.skin);
  for(const[sd,f] of[[-1,fL],[1,fR]])z3Leg(K,add(Pv,[0,sd*6,-7.4]),[1+f.x,sd*7.6,f.z],{L1:4.4,L2:4.4,w1:7,w2:6.2,col:BC.coatD,shoe:BC.boot,heel:2,toe:3.6,sr:3.2,ank:2.2});
  // the long coat with its ragged hem, the open belly with the ribs and the green light inside, the chain, the patch on the back
  z3Trunk(K,Pv,12.2,Ch,12.8,BC.coat,11,q=>q[2]<Pv[2]-6?coatD:coat);
  {const C=lerp3(Pv,Ch,.42),n=nrm([1,0,-.05]),on=[C,12.4],c=add(C,mul(n,12.4)),b=[0,1,0],bone=z3c(BC.bone);K.ow(0).disc(c,n,10.2,9,skin,[0,0,1],on,16).disc(c,n,8,5.9,z3c(BC.hole),[0,0,1],[C,12.5],14).disc(add(c,[0,0,-1.6]),n,4.2,2.6,z3c(BC.glow,40),[0,0,1],[C,12.6],10);
    for(let i=0;i<3;i++){const y0=-3.6+i*3.4,ww=8*(1-Math.abs(i-1)*.16),pts=[-ww,0,ww].map((x,j)=>add(C,mul(nrm(add(add(n,mul(b,x/12.4)),[0,0,(-y0+(j===1?1.2:-1))/12.4])),12.7)));K.tube(pts,[.75,.85,.75],bone,4)}
    for(const sd of[-1,1])for(let i=0;i<3;i++){const q=add(C,mul(nrm(add(add(n,mul(b,sd*9.1/12.4)),[0,0,(4.6-i*3.6)/12.4])),12.6));K.tube([add(q,[0,-sd*1.4,0]),add(q,[0,sd*1.4,-.9])],[.3,.3],z3c('#1b1612'),3)}}
  for(let i=0;i<=20;i++){const u=i/20,front=u<=.5,w=front?u*2:(u-.5)*2,mm=front?0:.85-w*.85,C=lerp3(Ch,Pv,mm),r=lerp(12.8,12.2,mm),d=front?nrm([.8,lerp(-.8,.8,w),.5-Math.sin(w*Math.PI)*.22]):nrm([-.85,lerp(.8,-.85,w),.15]);
    K.ow(0).ball(add(C,mul(d,r*1.03)),1.2,z3c(BC.chain),6,4,null,i%2?{sz:.55}:{sx:.55})}
  {const n=nrm([-1,.35,.05]),c=add(Ch,mul(n,12.85)),u=[0,0,1],v=nrm(cross(u,n));K.ow(0).quad(add(add(c,mul(v,3.4)),mul(u,3.2)),add(add(c,mul(v,-3.4)),mul(u,3.2)),add(add(c,mul(v,-3.4)),mul(u,-2.8)),add(add(c,mul(v,3.4)),mul(u,-2.8)),z3c(BC.patch))}
  // the free arm (left): it hangs and swings, or goes straight up at his side to call the dead
  {const sh=add(Ch,[0,-11.4,3]),swg=walk?Math.sin(ph)*2.2:0,hd=add(Ch,[6-armUp*8,-15+armUp*2.5,-9+armUp*35+swg]),[el,h]=ik(sh,hd,8.6,8.6,nrm([-.4,-.6,-1+armUp*1.4])),w3=lerp3(el,h,.78);
    K.ow(1).cap(sh,3.5,el,3.2,coat,9).cap(el,3.2,w3,3,coat,9);K.ball(w3,3.3,coatD,9,5,null,{sz:.6});const pd=nrm(lerp3([1,0,-1],[.2,0,1],armUp));
    z3BigHand(K,h,nrm(sub(h,el)),3.8,skin,pd,{curl:.6-armUp*.4,spread:1+armUp*.35,thumb:-1})}
  // the shovel arm (right): the sleeve, the fist with its knuckles round the handle, the shovel (the T grip, the iron blade)
  {const sh=add(Ch,[0,11.4,3]),[el,h]=ik(sh,sv.hd,8.6,8.6,nrm([-.4,.5,-1])),w3=lerp3(el,h,.78);K.ow(1).cap(sh,3.5,el,3.2,coat,9).cap(el,3.2,w3,3,coat,9);
    const g=add(sv.hd,mul(sv.dir,-6)),wood=z3c(BC.wood),metal=z3c(BC.metal);K.ow(.9).tube([g,sv.b0],[1.6,1.5],wood,6).tube([add(g,mul(sv.w3,2.8)),add(g,mul(sv.w3,-2.8))],[1.3,1.3],z3c(BC.woodD),5);
    K.ow(.8).poly([add(sv.b0,mul(sv.w3,2.8)),add(sv.b1,mul(sv.w3,4.2)),add(sv.b1,mul(sv.dir,4.8)),add(sv.b1,mul(sv.w3,-4.2)),add(sv.b0,mul(sv.w3,-2.8))],metal);K.ball(sv.b0,2.2,z3c(BC.metalD),7,5);
    K.ow(.9).ball(sv.hd,3.8,skin,10,7);for(let i=0;i<4;i++){const off=(i-1.5)*1.9*1.12,kq=add(add(sv.hd,mul(sv.dir,off)),[0,0,-2.2]);K.ow(.4).ball(kq,1.4,skin,6,4).tube([add(kq,[0,0,-.6]),add(kq,[.3,0,-2.4])],[.6,.05],z3c(ZC.nail),3)}}
  // the neck, the head: the blotches, the two eyes (the huge one), the green light in them, the grin stitched wide with jagged teeth
  K.ow(1).cap(add(Ch,[2,0,9.6]),5.6,add(Hc,[-1,0,-5.4]),4.8,skin,10);
  {const R=8.6,skD=z3c(BC.skinD),bl=[[-.5,-.6,.6],[-.85,.35,.38],[.2,.8,.5],[.45,-.85,-.15]].map(nrm),on=[Hc,R+.12];K.ow(1).ball(Hc,R,skin,16,12,d=>bl.some(b=>RG.dot(d,b)>.92)?skD:skin);
    for(const sd of[-1,1]){const big=sd>0?1.35:.85,d=nrm([.8,sd*.42,.12]);K.ow(0).disc(add(Hc,mul(d,R)),d,R*.3*big,R*.32*big,z3c('#0c120a'),[0,0,1],on);K.ball(add(Hc,mul(d,R*.96)),1.25*big,z3c('#d6ff9a',70),7,5)}
    const op=(slam&&p>.4&&p<.68)||sum?1:.3+.15*Math.sin(ph*2),n=nrm([.8,0,-.45]),aa=nrm(sub([0,0,1],mul(n,RG.dot([0,0,1],n)))),bb=nrm(cross(aa,n)),w=R*.62,hh=1.4+op*2.6,c=add(add(Hc,mul(n,R)),mul(aa,-hh*.3));
    K.ow(0).disc(c,n,w,hh,z3c('#200808'),aa,on,14);const S=q=>add(Hc,mul(nrm(sub(q,Hc)),R+.2));
    for(let i=0;i<5;i++){const base=S(add(add(c,mul(bb,-w*.8+i*w*.4)),mul(aa,hh*.6)));K.tube([base,add(base,mul(aa,-(i%2?2.2:1.4)))],[.65,.06],z3c(BC.bone),4)}
    for(let i=0;i<4;i++){const x=-w*.7+i*w*.47;K.tube([S(add(add(c,mul(bb,x)),mul(aa,hh+1.2))),S(add(add(c,mul(bb,x+.4)),mul(aa,-hh*1.2-1)))],[.3,.3],z3c('#1b1612'),3)}
    // the top hat, tilted toward his left: the brim, the crown a little narrower on top, the red band
    const ax=nrm([.08,-.2,1]),hb=add(Hc,[-.4,0,R-2.2]),hat=z3c(BC.hat);K.ow(1).disc(hb,ax,10.5,10.5,hat,[1,0,0],null,18).disc(add(hb,mul(ax,-.15)),mul(ax,-1),10.5,10.5,hat,[1,0,0],null,18);
    K.cap(add(hb,mul(ax,.5)),6.2,add(hb,mul(ax,12.4)),5.7,hat,14);K.ow(0).cap(add(hb,mul(ax,1.6)),6.4,add(hb,mul(ax,4.2)),6.3,z3c(BC.band),14)}
  // the flies going round his head
  for(let i=0;i<4;i++){const an=ph*2+i*1.6;K.ow(0).ball(add(Hc,[Math.cos(an)*14,Math.sin(an)*14,4+Math.sin(an*1.5)*5]),.7,z3c('#141010'),5,3)}};
// LO SPAVENTAPASSERI (boss): the scarecrow come down off its post: the sack head with the button eye and the torn hole that glows, the
// stitched grin, the straw hat with the crow on its brim, the plaid shirt stuffed with straw, the patched trousers, the rope belt, the bar of
// the post through the sleeves with the bony hands hanging from the cuffs; its attack is a spinning top (the whole skeleton turns)
const Z3SC={sack:'#c9a46a',sackD:'#977645',straw:'#e9c45a',strawD:'#b98f2e',strawL:'#fff0a8',twine:'#e6d29c',hat:'#d8b14e',hatD:'#a07b28',band:'#b8372b',
  shirt:'#c0462f',shirtD:'#86301f',shirtL:'#de6a4c',pants:'#50708f',pantsD:'#37516b',patch:'#7f9c3e',rope:'#b38d50',wood:'#7b5833',woodD:'#523a21',boot:'#3b2b1f',
  button:'#2b2328',thread:'#2c1e14',hole:'#120c08',crow:'#34303f',crowD:'#1b1922',beak:'#f2b13a',crowEye:'#ffd23a'};
// a tuft of straw: thin strands fanned out from b along d
function z3Straw(K,b,d,n,L,spr,seed){const{add,mul,nrm,cross,len,lerp3}=RG,SC=Z3SC;d=nrm(d);let side=cross(d,[0,0,1]);if(len(side)<.2)side=[0,1,0];side=nrm(side);const up=nrm(cross(side,d)),cols=[SC.strawL,SC.straw,SC.strawD].map(c=>z3c(c));
  for(let i=0;i<n;i++){const r1=Math.sin(seed*12.9+i*78.2)*.5+.5,r2=Math.sin(seed*39.3+i*17.7)*.5+.5,f=n>1?i/(n-1)*2-1:0,dir=nrm(add(add(d,mul(side,f*spr+(r1-.5)*.35)),mul(up,(r2-.5)*.5))),l=L*(.7+r2*.55),a=add(b,mul(side,f*.5)),e=add(a,mul(dir,l)),m=add(lerp3(a,e,.55),mul(up,(r1-.5)*.8));
    K.ow(.25).tube([a,m,e],[.42,.36,.1],cols[i%3],3)}}
function z3Crow(K,O,yaw,o){const{add,mul,nrm,lerp3}=RG,SC=Z3SC,S=1.4,c=Math.cos(yaw),s=Math.sin(yaw),q=v=>{const x=v[0]*S,y=v[1]*S;return add(O,[x*c-y*s,x*s+y*c,v[2]*S])},lk=o.look||0,pk=o.peck||0,hdv=[Math.cos(lk),Math.sin(lk),0];
  const crow=z3c(SC.crow),crowD=z3c(SC.crowD);K.ow(.7).cap(q([-1.3,0,2.4]),1.65*S,q([.8,0,2.9]),1.95*S,crow,9);const Hd=q(add([1.5,0,4.6-pk*1.5],mul(hdv,.4*(1+pk))));K.ball(Hd,1.55*S,crow,9,6);
  const hw=v=>{const x=v[0],y=v[1];return[x*c-y*s,x*s+y*c,v[2]]},hd=hw(hdv),op=o.open||0;K.ow(.3).tube([add(Hd,mul(hd,1*S)),add(add(Hd,mul(hd,2.9*S)),[0,0,-.3*S])],[.6*S,.06],z3c(SC.beak),4).tube([add(add(Hd,mul(hd,1*S)),[0,0,-.4*S]),add(add(Hd,mul(hd,2.5*S)),[0,0,-.6*S-op*1.1*S])],[.45*S,.06],z3c('#a8701a'),4);
  for(const sd of[-1,1]){const e=add(Hd,add(mul(hd,.9*S),hw([-hdv[1]*sd*1.1,hdv[0]*sd*1.1,.5])));K.ow(0).ball(e,.55*S,z3c(SC.crowEye,150),5,4)}
  const fl=(o.flick||0)*1.6;K.ow(.5).poly([q([-.3-1.3,-.6,2.5]),q([-4.6,-1.5,2.1+fl]),q([-4.9,0,1.9+fl]),q([-4.6,1.5,2.1+fl]),q([-.3-1.3,.6,2.5])],crowD);
  for(const sd of[-1,1]){const w=o.wing||0,bt=o.beat||0,fo=[[.9,1.45,3.4],[-1.1,1.85,3.1],[-3.3,1.2,2.4],[-2,1.45,1.8],[.3,1.5,2.2]],op2=[[.7,1.2,3.6],[-.3,4.4,3.6+bt*2.4],[-1.4,7,3.2+bt*4.2],[-2.6,4,2.6+bt*2.2],[-1.6,1.4,2.5]];
    K.ow(.5).poly(fo.map((f,i)=>q(lerp3([f[0],f[1]*sd,f[2]],[op2[i][0],op2[i][1]*sd,op2[i][2]],w))),crow)}
  for(const sd of[-1,1])K.ow(0).tube([q([0,sd*.5,0]),q([-.1,sd*.5,1.6])],[.2,.2],z3c('#a8701a'),3)}
Z3.B.spaventapasseri=(K,anim,p)=>{const{add,sub,mul,nrm,lerp,lerp3,cross,stepper,NOSTEP,ik,cl}=RG,SC=Z3SC,ZC=RG.ZC,ph=p*Math.PI*2,walk=anim==='walk',atk=anim==='attack',idle=!walk&&!atk,ez=z3ex,TAU=Math.PI*2;
  let yaw=0,hatX=0,crouch=0,hop=0,lean=0,spin=-1,dizzy=-1,air=0;const yawAt=k=>-.9+(TAU+.9)*ez(cl(k,0,1));
  if(atk){if(p<.2){const k=ez(p/.2);yaw=-.9*k;hatX=.25*k;crouch=k*1.3}else if(p<.7){const k=(p-.2)/.5;yaw=yawAt(k);hatX=.25*(1-k)-.75*Math.sin(k*Math.PI);crouch=1.3*(1-ez(k));hop=Math.sin(k*Math.PI)*1.6;lean=Math.sin(k*Math.PI);spin=k}
    else{const k=(p-.7)/.3,f=(1-k)*(1-k);yaw=TAU+.38*Math.sin(k*Math.PI*3)*f;hatX=.55*Math.sin(k*TAU)*f;dizzy=k}air=p<.12?0:p<.24?ez((p-.12)/.12):p<.8?1:p<.94?1-ez((p-.8)/.14):0}
  const R=8,st=stepper(p,.5),fL=walk?st(0,3.2,2.4):NOSTEP,fR=walk?st(.5,3.2,2.4):NOSTEP;
  const rock=walk?-Math.sin(ph)*2.3:idle?Math.sin(ph)*.6:lean*1.3,bob=walk?Math.abs(Math.sin(ph))*1.1:idle?Math.sin(ph*2)*.25:hop-crouch;
  const Pv=[0,rock*.3,14.6+bob],Ch=[1.2-crouch*.5,rock,22.8+bob-crouch*.3],tk=(Ch[1]-Pv[1])/(Ch[2]-Pv[2]),wob=dizzy>=0?(1-dizzy)*(1-dizzy):0,
    Hc=add(Ch,[1.2+Math.cos(dizzy*TAU*2)*1.4*wob,rock*.35+Math.sin(ph*(walk?2:1)-.9)*(walk?.6:.35)+Math.sin(dizzy*TAU*2)*1.4*wob,15]),barAt=yy=>add(Ch,[-.6,yy,3.4-yy*tk]);
  const hsw=sd=>{if(walk)return[Math.sin(ph+.6)*1.5,-rock*.25,0];if(idle)return[Math.sin(ph+sd)*.6,0,0];const s=spin>=0?Math.sin(spin*Math.PI):0;return[sd*s*2.4,sd*s*1.6,s*1.4+crouch*.3]};
  let cp;if(atk){const sk=cl((p-.04)/.1,0,1)*(1-cl((p-.92)/.08,0,1));cp={wing:air>0?Math.max(air,.5):sk*.6,beat:air>0?.3+.7*Math.sin(p*TAU*8):sk*.3*Math.sin(p*60),look:.3*Math.sin(ph*3),open:p<.3?1:0,flick:sk}}
  else if(walk)cp={wing:.32+.12*Math.sin(ph*2),beat:Math.sin(ph*2)*.6,look:Math.sin(ph)*.35,flick:Math.max(0,Math.sin(ph*2))*.5};
  else cp={look:Math.sin(ph)*.9,open:p>.12&&p<.3?Math.sin((p-.12)/.18*Math.PI):0,peck:p>.55&&p<.8?Math.sin((p-.55)/.25*Math.PI):0,flick:p>.35&&p<.5?Math.sin((p-.35)/.15*Math.PI):0};
  K.rz=yaw;
  // legs: patched trousers, straw out of the cuffs, old boots
  for(const[sd,f] of[[-1,fL],[1,fR]]){const hip=add(Pv,[0,sd*3.3,-3.3]),foot=[1+f.x,sd*4.6,f.z],r=z3Leg(K,hip,foot,{L1:5,L2:5.1,w1:4.4,w2:3.8,col:SC.pants,shoe:SC.boot,heel:1.3,toe:2.8,sr:2.3,pole:[1,0,.12]}),an=add(foot,[0,0,2.3]);
    for(const d of[[-.6,sd*.5,-.7],[.7,sd*.6,-.6],[0,sd,-.5]])z3Straw(K,an,d,3,2.4,.5,sd*3+d[0]*7);
    if(sd<0){const q=lerp3(hip,r.kn,.75),n=[1,0,0];K.ow(0).disc(add(q,[2.4,0,0]),n,1.8,1.6,z3c(SC.patch),[0,0,1])}}
  // the plaid shirt (rings and stripes darker), the trousers from the waist down, the rope belt, the hole with straw, the patch on the back
  const W=lerp3(Pv,Ch,.34),shirt=z3c(SC.shirt),shirtD=z3c(SC.shirtD),pants=z3c(SC.pants),ax=nrm(sub(Ch,Pv));
  z3Trunk(K,Pv,5.4,Ch,7.2,SC.shirt,0,q=>{if(q[2]<W[2])return pants;const an=Math.atan2(q[1]-Ch[1],q[0]-Ch[0]),st2=((an/(Math.PI*2)*12)%1+1)%1,hz=((q[2]-W[2])/2.6)%1;return st2<.22||hz<.2?shirtD:shirt});
  {const rg=[];for(let i=0;i<=16;i++){const an=i/16*TAU;rg.push(add(W,[Math.cos(an)*6.15,Math.sin(an)*6.15,0]))}K.ow(.6).tube(rg,rg.map(()=>.95),z3c(SC.rope),4);
    const kn=add(W,mul(nrm([.85,-.5,0]),6.3));K.ow(.5).ball(kn,1.5,z3c(SC.rope),6,4).tube([kn,add(kn,[.5,-.4,-4.2])],[.6,.5],z3c(SC.rope),3).tube([kn,add(kn,[1.4,.3,-3.6])],[.6,.5],z3c(SC.rope),3);
    for(const[d,s2] of[[[.85,.45,0],13],[[.2,-.98,0],14],[[-.7,.7,0],15]])z3Straw(K,add(W,mul(nrm(d),5.9)),add(d,[0,0,1]),3,2.4,.45,s2)}
  {const n=nrm([.72,.6,-.3]);K.ow(0).disc(add(Ch,mul(n,7.2)),n,2.1,1.8,z3c(SC.hole),[0,0,1],[Ch,7.32],9);z3Straw(K,add(Ch,mul(n,7.1)),add(n,[0,0,-.4]),4,2.6,.6,11);
    const nb=nrm([-.85,-.35,.15]);K.ow(0).disc(add(Ch,mul(nb,7.2)),nb,2.8,2.6,z3c(SC.pants),[0,0,1],[Ch,7.3],4);for(const sd of[-1,1])K.ow(.4).poly([add(Ch,mul(nrm([.6,sd*.34,.72]),7.3)),add(Ch,mul(nrm([.8,sd*.5,.55]),7.4)),add(Ch,mul(nrm([.75,sd*.28,.4]),7.4))],z3c(SC.shirtL))}
  // the bar of the post through both sleeves, its sawn ends; the sleeves, the rope round the cuffs, straw, the bony hands hanging
  {const wood=z3c(SC.wood);K.ow(.8).tube([barAt(-18.4),barAt(18.4)],[1.6,1.6],wood,7);for(const sd of[-1,1])K.ow(0).disc(barAt(sd*18.45),nrm(sub(barAt(sd*20),barAt(sd*18))),1.5,1.5,z3c('#a37c4e'),[0,0,1],null,8);
    for(const sd of[-1,1]){const sh=add(Ch,[-.3,sd*6.4,3.2-sd*6.4*tk]),wr=barAt(sd*15.2),hs=hsw(sd),w3=add(wr,[.2,-sd*.3,-1.4]),h=add(add(w3,[0,0,-2.6]),hs),axs=nrm(sub(wr,sh));
      z3Rag(K,sh,wr,2.9,2.6,shirt);for(let k=0;k<2;k++){const c=add(lerp3(sh,wr,.84),mul(axs,(k-.5)*1.5)),rg=[];let u=cross(axs,[0,0,1]);u=nrm(u);const v=cross(axs,u);for(let i=0;i<=10;i++){const an=i/10*TAU;rg.push(add(c,add(mul(u,Math.cos(an)*2.95),mul(v,Math.sin(an)*2.95))))}K.ow(0).tube(rg,rg.map(()=>.45),z3c(SC.rope),3)}
      z3Straw(K,add(wr,mul(axs,.4)),add(axs,[.2,0,-.55]),4,2.8,.6,sd+20);const sk=z3c(ZC.skin);K.ow(.8).cap(w3,1.3,h,1.05,sk,6);z3Claw(K,h,nrm(add([.15,sd*.12,-1],mul(hs,.12))),1.7,sk,[0,-sd,0],4.8)}}
  // the neck with its ruff of straw and the rope tied round, the sack head
  {const n0=add(Ch,[.8,0,6]),n1=add(Hc,[-.2,0,-R*.82]),Nk=lerp3(n0,n1,.55),Nr=lerp3(n0,n1,.2),sack=z3c(SC.sack);K.ow(1).cap(n0,3.6,n1,3.1,sack,9);
    for(let i=0;i<8;i++){const an=i/8*TAU+.2,d=[Math.cos(an),Math.sin(an),0];z3Straw(K,add(Nr,mul(d,2.6)),add(d,[0,0,-.3]),4,2.6+((i*7)%3)*.5,.55,i+1)}
    const rg=[];for(let i=0;i<=12;i++){const an=i/12*TAU;rg.push(add(Nk,[Math.cos(an)*3.5,Math.sin(an)*3.5,0]))}K.ow(.5).tube(rg,rg.map(()=>.85),z3c(SC.rope),4)}
  {const sack=z3c(SC.sack),sackD=z3c(SC.sackD),on=[Hc,R+.12],S=d=>add(Hc,mul(nrm(d),R+.15)),thread=z3c(SC.thread),twine=z3c(SC.twine);
    K.ow(1).ball(Hc,R,sack,16,12,d=>{const g=(Math.abs(Math.sin(d[0]*24+d[2]*3))<.12||Math.abs(Math.sin(d[1]*24))<.1);return d[2]<-.4?sackD:g?sackD:sack});
    {const n=nrm([-.55,-.72,.3]);K.ow(0).disc(add(Hc,mul(n,R)),n,2.8,2.5,z3c(SC.pants),[0,0,1],on,4)}
    for(let i=0;i<7;i++){const e=-.7+i*.27,c=[-.25,Math.cos(e),Math.sin(e)];K.ow(0).tube([S([c[0]-.05,c[1],c[2]-.08]),S([c[0]+.05,c[1],c[2]+.08])],[.22,.22],thread,3)}
    // the button for the left eye, the torn hole that glows for the right one, the stitched brows
    {const n=nrm([.82,-.44,.12]);K.ow(0).disc(add(Hc,mul(n,R)),n,R*.22,R*.22,z3c(SC.button),[0,0,1],[Hc,R+.3],10);K.tube([S(add(n,[0,-.06,.07])),S(add(n,[0,.06,-.07]))],[.18,.18],twine,3).tube([S(add(n,[0,.06,.07])),S(add(n,[0,-.06,-.07]))],[.18,.18],twine,3)}
    {const n=nrm([.82,.44,.12]);K.ow(0).disc(add(Hc,mul(n,R)),n,R*.25,R*.25,z3c(SC.hole),[0,0,1],on,9);K.ball(add(Hc,mul(n,R*.9)),R*.13,z3c(ZC.eye,100),6,4)}
    for(const sd of[-1,1]){const a=S([.78,sd*.25,.48]),b=S([.74,sd*.56,.32]);K.ow(0).tube([a,b],[.35,.35],thread,3)}
    // the grin: a dark slit stitched across, wider open in the attack
    {const op=atk?(p>.15&&p<.75?1:.3):walk?.35+.15*Math.sin(ph*2):.25,n=nrm([.86,0,-.46]),aa=nrm(sub([0,0,1],mul(n,RG.dot([0,0,1],n)))),bb=nrm(cross(aa,n)),w=R*.62,hh=.8+op*2.4,c=add(Hc,mul(n,R));
      K.ow(0).disc(add(c,mul(aa,-hh*.3)),n,w,hh*.6+.3,z3c(SC.hole),aa,on,14);for(let i=1;i<6;i++){const x=-w+i/6*2*w,u2=x/w;K.tube([S(add(add(c,mul(bb,x-.6)),mul(aa,1.2-1.6*u2*u2))),S(add(add(c,mul(bb,x+.6)),mul(aa,-hh*(1-u2*u2)-1)))],[.22,.22],twine,3)}}
    // the hat (turning a little behind the body): built in the head's frame, turned by hatX round the head and then by the spin; the brim
    // that sags at the back, the crown with a bent tip, the red band, straw out of the brim, the crow on it (while it is not flying)
    const hr=K.rz;K.rz=null;const s0=K.m.P.length/3,hcl=q=>add(Hc,q),NB=24,
      brim=(a,k)=>{const r=10.6*k*(1+.04*Math.sin(a*3+1.3)),dr=1.6*Math.pow(Math.max(0,Math.cos(a+2.3)),2)+1*Math.pow(Math.max(0,Math.cos(a-2)),2)-.5*Math.pow(Math.max(0,Math.cos(a)),2)+.25*Math.sin(a*5+1);return[-.4+Math.cos(a)*r,Math.sin(a)*r,R*.86-dr*k*k]},
      rings=[.5,.75,1].map(k=>{const o=[];for(let i=0;i<NB;i++)o.push(hcl(brim(i/NB*TAU,k)));return o}),hat=z3c(SC.hat),hatD=z3c(SC.hatD);
    K.ow(1).loft(rings,hat,(q,i,j)=>j===2&&i%3===0?hatD:hat,true,[0,0,1]);K.loft(rings,hatD,null,true,[0,0,-1]);
    {const b0=hcl(brim(0,0)),ap=add(b0,[-.6,0,6.2]),rc=5.3,crown=[0,.5,1].map(k=>{const o=[],c=lerp3(add(b0,[0,0,-.2]),ap,k),r=lerp(rc,rc*.72,k);for(let i=0;i<14;i++){const an=i/14*TAU;o.push(add(c,[Math.cos(an)*r,Math.sin(an)*r,0]))}return o});
      K.ow(1).loft(crown,hat);K.poly(crown[2],hatD);const bd=[];for(let i=0;i<=14;i++){const an=i/14*TAU;bd.push(add(add(b0,[0,0,1.2]),[Math.cos(an)*rc*1.01,Math.sin(an)*rc*1.01,0]))}K.ow(0).tube(bd,bd.map(()=>.9),z3c(SC.band),4)}
    for(const[a2,s2] of[[.35,1],[1.95,2],[3.05,3],[4.4,4],[5.5,5]]){const e=hcl(brim(a2,.96)),o2=hcl(brim(a2,1.3));z3Straw(K,e,add(nrm(sub(o2,e)),[0,0,-.25]),2,2.2,.35,s2)}
    z3Crow(K,air<=0?hcl(add(brim(-1.25,.9),[0,0,.3])):[0,0,-300],-1.25-.3,cp);
    {const e0=K.m.P.length/3,ch=Math.cos(hatX),sh2=Math.sin(hatX),cy=Math.cos(yaw),sy=Math.sin(yaw);
      for(let i=s0;i<e0;i++)for(const A of[K.m.P,K.m.N]){const isP=A===K.m.P,x=A[i*3]-(isP?Hc[0]:0),y=A[i*3+1]-(isP?Hc[1]:0);let x2=x*ch-y*sh2,y2=x*sh2+y*ch;if(isP){x2+=Hc[0];y2+=Hc[1]}A[i*3]=x2*cy-y2*sy;A[i*3+1]=x2*sy+y2*cy}}
    K.rz=hr}
  // the crow off the hat while it spins: up into a circle over the head (in the room's frame) and back
  K.rz=null;{const hW=RG.rz(Hc,yaw),perch=add(hW,[0,0,R*.86+.3]),hov=add(hW,[Math.cos(ph*2)*4,Math.sin(ph*2)*4,R*.86+8+Math.sin(ph*6)]),e=ez(Math.max(0,air)),cw=add(lerp3(perch,hov,e),[0,0,Math.sin(Math.max(0,air)*Math.PI)*2]);
    z3Crow(K,air>0?cw:[0,0,-300],ph*2+Math.PI/2,cp)}
  // dizzy: three little stars going round over the hat
  for(let i=0;i<3;i++){const k=dizzy>=0&&dizzy<.9?dizzy/.9:0,an=k*TAU*1.5+i*TAU/3,c0=add(RG.rz(Hc,yaw),[Math.cos(an)*8,Math.sin(an)*8,R*.86+11.5]);K.ow(0).ball(dizzy>=0&&dizzy<.9?c0:[0,0,-200],1.3*Math.sin(Math.max(.01,k)*Math.PI)+.01,z3c('#ffe066',60),5,3)}};
// ------------------------------------------------------------------ the poses: made once, kept (a few a frame, the nearest needed first)
const Z3V=1;// (the version of the poses: bump it when a builder changes)
function z3Key(kind,anim,i){return kind+'|'+anim+'|'+i}
function z3Make(kind,anim,i){const m=v3MB(),K=z3Kit(m),NF=Z3.NF[anim]||24;try{Z3.B[kind](K,anim,i/NF)}catch(e){v3Err(e);return null}
  for(let k=0;k<m.P.length/3;k++)if(m.W[k]==null)m.W[k]=1;if(m.P.length/3>65000)return null;const g=v3Up(m);g.nv0=m.P.length/3;return g}
function z3Get(kind,anim,i,can){const k=z3Key(kind,anim,i);let g=Z3.M.get(k);if(g)return g;if(!can())return null;const t=performance.now();g=z3Make(kind,anim,i);Z3.ms+=performance.now()-t;Z3.built++;
  if(!g){Z3.M.set(k,false);return null}Z3.M.set(k,g);if(Z3.M.size>Z3.maxM){for(const[k0,g0] of Z3.M){if(g0)v3Free(g0);Z3.M.delete(k0);break}}return g}
// the anim the drawing would play (the bosses' own moves keep their names); the pose's number and how far to the next
function z3Anim(z){const a=z.anim||'idle';return Z3.NF[a]?a:'idle'}
// ------------------------------------------------------------------ drawing them: for each zombie its two poses, blended, in its place
// (turned to where it faces, its size, coming out of the ground, sinking when it dies, the white flash and a little jolt when it is hit)
Z3.ok=z=>Z3.on&&!!Z3.B[z.kind]&&V3.mode!=='alto'&&!V3.no3h&&typeof RG!=='undefined';
Z3.draw=function(list){if(!list.length)return;const gl=V3.gl,P=V3.pT||(v3Statics(),V3.pT),t0=performance.now(),W=ZM.W;let left=0;
  const can=()=>performance.now()-t0<(V3.low?3:5),items=[];
  for(const z of list){z.__z3=1;const anim=z3Anim(z);let p=(z.p||0)%1;if(p<0)p+=1;let rise=1,die=0,al=1;
    if(z.rise<1){if(z.rise<=.25)continue;const u=(z.rise-.25)/.75;rise=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2}
    if(z.die){die=Math.min(1,z.die/1.1);al=1-die*die}else if(z.fin>0)al=v3cl(1-z.fin/.9,0,1);if(al<=.02)continue;
    const an=z.rise<1||z.die?'idle':anim,pp=z.rise<1?((W.t*.6)%1):z.die?0:p,NF2=Z3.NF[an],f=pp*NF2,i0=Math.floor(f)%NF2,i1=(i0+1)%NF2;
    let A=z3Get(z.kind,an,i0,can),B=A&&z3Get(z.kind,an,i1,can);if(!A){left++;z.__z3=0;continue}if(!B||B.nv0!==A.nv0)B=A;
    // (dying: it falls backward in the first half, then sinks into the ground)
    const sc=z.sc||1,a=z.face||0,c=Math.cos(a),s=Math.sin(a),dk=die>.45?(die-.45)/.55:0,zz=(z.zh||0)-(1-rise)*52*sc-(dk?(dk<.5?2*dk*dk:1-Math.pow(-2*dk+2,2)/2)*30*sc:0),
      fl=z.flash>0?Math.min(1,z.flash/.12):0,fall=die?z3ex(Math.min(1,die/.45))*(z.kind==='hound'?.9:1.3):0,jolt=fl*.16+fall,cj=Math.cos(jolt),sj=Math.sin(jolt);
    // turned, tilted back a hair by the hit (or forward as it sinks), scaled
    let M=v3M4([c*sc,s*sc,0],[-s*sc,c*sc,0],[0,0,sc],[z.x,z.y,zz]);if(jolt)M=v3Mul(M,v3M4([cj,0,(die?1:-1)*sj],[0,1,0],[(die?-1:1)*sj,0,cj],[0,0,0]));
    items.push({A,B,k:f-Math.floor(f),M,al,fl,out:.62,em:.5+.5*Math.sin((W.t||0)*2.2+(z.id||0)*1.7)})}
  Z3.n=items.length;Z3.left=left;if(!items.length)return;
  gl.useProgram(P.p);v3Uni(P);const u=P.u,{add,mul,nrm}=RG;gl.uniform3fv(u.uLd,nrm(add(add(mul(V3.R3,-.5),[0,0,.85]),mul(V3.F3,-.42))));gl.uniform1i(u.uTex,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,V3.hm.white);
  gl.uniform4fv(u.uTint,[1,1,1,1]);if(u.uHead)gl.uniform1f(u.uHead,0);if(u.uVM)gl.uniform1f(u.uVM,0);for(let i=0;i<8;i++)gl.enableVertexAttribArray(i);gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);
  const bind=it=>{gl.bindBuffer(gl.ARRAY_BUFFER,it.A.vb);gl.vertexAttribPointer(0,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,48,12);gl.vertexAttribPointer(2,3,gl.FLOAT,false,48,24);gl.vertexAttribPointer(3,2,gl.FLOAT,false,48,36);gl.vertexAttribPointer(4,4,gl.UNSIGNED_BYTE,true,48,44);
    gl.bindBuffer(gl.ARRAY_BUFFER,it.B.vb);gl.vertexAttribPointer(5,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(6,3,gl.FLOAT,false,48,12);gl.vertexAttribPointer(7,3,gl.FLOAT,false,48,24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,it.A.ib);gl.uniformMatrix4fv(u.uM,false,it.M);gl.uniformMatrix3fv(u.uNM,false,v3NM(it.M));gl.uniform1f(u.uKF,it.B===it.A?0:it.k);gl.uniform1f(u.uFlash,it.fl);gl.uniform1f(u.uAlpha,it.al);if(u.uEm)gl.uniform1f(u.uEm,it.em)};
  // the solid ones: the outline (the pieces a little bigger, seen from inside), then the pieces
  for(const it of items){if(it.al<1)continue;bind(it);gl.cullFace(gl.FRONT);gl.uniform1f(u.uInk,1);gl.uniform1f(u.uOut,it.out*(V3.low?.8:1));gl.drawElements(gl.TRIANGLES,it.A.n,gl.UNSIGNED_SHORT,0);
    gl.cullFace(gl.BACK);gl.uniform1f(u.uInk,0);gl.uniform1f(u.uOut,0);gl.drawElements(gl.TRIANGLES,it.A.n,gl.UNSIGNED_SHORT,0)}
  // the fading ones (dying): first only their depth, then the nearest surface alone, see-through
  for(const it of items){if(it.al>=1)continue;bind(it);gl.cullFace(gl.BACK);gl.uniform1f(u.uInk,0);gl.uniform1f(u.uOut,0);gl.colorMask(false,false,false,false);gl.drawElements(gl.TRIANGLES,it.A.n,gl.UNSIGNED_SHORT,0);gl.colorMask(true,true,true,true);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.drawElements(gl.TRIANGLES,it.A.n,gl.UNSIGNED_SHORT,0);gl.depthMask(true);gl.disable(gl.BLEND)}
  gl.uniform1f(u.uKF,0);gl.disable(gl.CULL_FACE);for(let i=1;i<8;i++)gl.disableVertexAttribArray(i);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
  // poses not ready yet: a few more in the spare time of this frame (the ones that come next in the move)
  Z3.ms2=performance.now()-t0};
// the miners' lamps light the street in front of them (Z3.lamps: given to 105's lights, the nearest few)
// (and the lantern zombie's lantern: a green-gold light at its side)
Z3.lamps=function(){const W=ZM.W,o=[];for(const z of W.Z){if(z.die||z.rise<1)continue;const a=z.face||0,sc=z.sc||1,c=Math.cos(a),s=Math.sin(a);
  if(z.kind==='minatore')o.push({x:z.x+c*30*sc,y:z.y+s*30*sc,z:14,r:80,rgb:'255,230,150',a:.45});
  else if(z.kind==='lanterna')o.push({x:z.x+(c*11-s*12)*sc,y:z.y+(s*11+c*12)*sc,z:16,r:95,rgb:'225,255,120',a:.5})}return o};
V3.z3=Z3;
