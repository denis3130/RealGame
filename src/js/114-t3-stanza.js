// =====================================================================
// 114. MOSSBOUND TRIPLA A · GLI OSTACOLI DELLA STANZA IN 3D VERO (anteprima a parte, con 110–113).
// Le cose del primo mondo fatte di volumi veri, come le dipinge oggi il gioco (95-ostacoli-3d.js: stesse forme, stessi colori del mondo):
// il masso col muschio in cima e i due sassi ai piedi; la colonna con lo zoccolo, il fusto scanalato e il capitello o la cima spezzata,
// il collare di muschio alla base; il sarcofago col coperchio a due falde e il sigillo col teschietto; le urne di terracotta con la bocca
// scura e lo zig zag chiaro; la lapide ad arco sul suo mucchio di terra con le tre righe incise e i ciuffi d'erba; il ceppo con le radici,
// la corteccia, gli anelli del taglio e il funghetto rosso. Ognuno è fatto una volta (le stesse misure lo riusano) e trema quando lo
// colpiscono come nel gioco. Quello che non è ancora rifatto resta una cartolina.
// =====================================================================
const T3S={K:new Map(),bad:{},n:0};
// a body of revolution round z: the profile [[z, r], ...] (o.sub: rows added between, so painted bands can be thin), N sides, colour
// col(z, a, r) or one colour, o.wob(a, z): a factor on the radius (flutes, bark), o.top: a cap on top in that colour (o.topz: its height)
function t3Lathe(mb,C,prof,N,col,o){o=o||{};const{nrm}=RG,P=[];const sub=o.sub||1;for(let j=0;j<prof.length;j++){P.push(prof[j]);if(j<prof.length-1)for(let s=1;s<sub;s++){const k=s/sub;P.push([prof[j][0]+(prof[j+1][0]-prof[j][0])*k,prof[j][1]+(prof[j+1][1]-prof[j][1])*k])}}
  const rows=[];for(let j=0;j<P.length;j++){const[z,r]=P[j],a0=P[Math.max(0,j-1)],a1=P[Math.min(P.length-1,j+1)],dz=a1[0]-a0[0],dr=a1[1]-a0[1],row=[];
    for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),rr=r*(o.wob?o.wob(a,z):1);row.push(v3V(mb,[C[0]+ca*rr,C[1]+sa*rr,C[2]+z],nrm([ca*dz,sa*dz,-dr]),typeof col==='function'?col(z,a,r):col))}rows.push(row)}
  for(let j=0;j<rows.length-1;j++)for(let i=0;i<N;i++){v3T(mb,rows[j][i],rows[j][i+1],rows[j+1][i+1]);v3T(mb,rows[j][i],rows[j+1][i+1],rows[j+1][i])}
  // (the cap in rings from the middle out, so a colour by the distance from the middle draws rings: the stump's growth rings, an urn's mouth)
  if(o.top){const[z,r]=P[P.length-1],zt=o.topz==null?z:o.topz,F=o.rings||[0,1],tc=(f,a)=>typeof o.top==='function'?o.top(f,a):o.top,R=F.map(f=>{const row=[];for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,rr=r*f*(o.wob?o.wob(a,z):1);
      row.push(v3V(mb,[C[0]+Math.cos(a)*rr,C[1]+Math.sin(a)*rr,C[2]+zt+(z-zt)*f],[0,0,1],tc(f,a)))}return row});
    for(let j=0;j<R.length-1;j++)for(let i=0;i<N;i++){v3T(mb,R[j][i],R[j][i+1],R[j+1][i+1]);v3T(mb,R[j][i],R[j+1][i+1],R[j+1][i])}}}
// a box turned by a round z (half sizes [x, y, z], the bottom at C[2]); flat faces
function t3BoxA(mb,C,a,H,col,o){o=o||{};const ca=Math.cos(a),sa=Math.sin(a),T=(x,y,z)=>[C[0]+x*ca-y*sa,C[1]+x*sa+y*ca,C[2]+z],R=(x,y,z)=>[x*ca-y*sa,x*sa+y*ca,z],[hx,hy,hz]=H;
  const F=[[[1,0,0],[[hx,-hy,0],[hx,hy,0],[hx,hy,2*hz],[hx,-hy,2*hz]]],[[-1,0,0],[[-hx,hy,0],[-hx,-hy,0],[-hx,-hy,2*hz],[-hx,hy,2*hz]]],[[0,1,0],[[hx,hy,0],[-hx,hy,0],[-hx,hy,2*hz],[hx,hy,2*hz]]],
    [[0,-1,0],[[-hx,-hy,0],[hx,-hy,0],[hx,-hy,2*hz],[-hx,-hy,2*hz]]],[[0,0,1],[[hx,-hy,2*hz],[hx,hy,2*hz],[-hx,hy,2*hz],[-hx,-hy,2*hz]]]];
  for(const[n,q] of F){const c=typeof col==='function'?col(n):col;v3Quad(mb,...q.map(p=>T(...p)),R(...n),c)}}
// faceted triangles (a rock): each its own normal
// (ctr: a point inside the solid, so every face looks outward)
function t3Facet(mb,a,b,c,col,ctr){const{sub,cross,nrm,dot}=RG;let n=nrm(cross(sub(b,a),sub(c,a)));if(ctr&&dot(n,sub(a,ctr))<0)n=RG.mul(n,-1);const k=typeof col==='function'?col(n,a,b,c):col;const i=v3V(mb,a,n,k),j=v3V(mb,b,n,k),l=v3V(mb,c,n,k);v3T(mb,i,j,l)}
const t3hash=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
// a rock: a low ball pushed about by its seed, its faces flat; moss on the faces that look up (o.moss)
function t3Rock(mb,C,R,seed,col,o){o=o||{};const nl=o.nl||11,nb=o.nb||7,pts=[];for(let j=0;j<=nb;j++){const th=j/nb*Math.PI*.62,row=[];for(let i=0;i<nl;i++){const ph=i/nl*Math.PI*2+(j%2)*.3,k=j===0?1:.86+.26*t3hash(i*7+j*13,seed);
      row.push([C[0]+Math.sin(th)*Math.cos(ph)*R[0]*k,C[1]+Math.sin(th)*Math.sin(ph)*R[1]*k,C[2]+Math.cos(th)*R[2]*k*(j===0?1:1)-(j===nb?R[2]*.05:0)])}pts.push(row)}
  // (the top row is the crown point, the rest rings down to the floor; the lowest ring sits just under the floor)
  for(let i=0;i<nl;i++)pts[nb][i][2]=Math.min(pts[nb][i][2],C[2]-.5);
  const cf=(n)=>o.moss&&n[2]>.62?o.moss:col;
  for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const i1=(i+1)%nl,a=pts[j][i],b=pts[j][i1],c=pts[j+1][i1],d=pts[j+1][i];const ct=[C[0],C[1],C[2]+R[2]*.3];if(j===0)t3Facet(mb,a,c,d,cf,ct);else{t3Facet(mb,a,b,c,cf,ct);t3Facet(mb,a,c,d,cf,ct)}}}
const t3S=(h)=>t3c(h);
const t3OQ=(sx,sd,z)=>[sd||0,-(sx||0),z||0];
// ------------------------------------------------------------------ the obstacles of the first world
const T3OB={
  boulder(mb,k,r,h,sd,S,th){const mo=th==='muschio'||th==='radici'?t3S(S.moss||'#5f8a34'):null;t3Rock(mb,[0,0,0],[r*1.02,r*.92,Math.max(h,r*.95)],sd,t3S(S.mid),{moss:mo});
    t3Rock(mb,t3OQ(-r*.86,r*.62,0),[r*.17,r*.15,r*.16],sd+5,t3S(S.lo),{nl:7,nb:4});t3Rock(mb,t3OQ(r*.78,r*.45,0),[r*.12,r*.11,r*.11],sd+9,t3S(S.lo),{nl:6,nb:4})},
  pillar(mb,k,r,h,sd,S,th){const w=r*.65,br=sd%2>1,H=h+7,mid=t3S(S.mid),hi=t3S(S.hi);
    t3Lathe(mb,[0,0,0],[[0,r*1.15],[7,r*1.12]],20,mid,{top:mid});
    t3Lathe(mb,[0,0,0],[[7,w],[H-(br?4:0),w*.95]],36,mid,{sub:3,wob:a=>1-.045*Math.max(0,Math.cos(a*18))});
    if(br){const N=12,top=[0,0,H+.5],R=[],T=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2;R.push([Math.cos(a)*w*.95,Math.sin(a)*w*.95,H-4]);T.push([Math.cos(a)*w*.93,Math.sin(a)*w*.93,H+(i%2?-3:3)+Math.sin(sd*7+i)*2.5])}
      const ct=[0,0,H-6];for(let i=0;i<N;i++){const j=(i+1)%N;t3Facet(mb,R[i],R[j],T[j],mid,ct);t3Facet(mb,R[i],T[j],T[i],mid,ct);t3Facet(mb,top,T[i],T[j],hi,ct)}}
    else{t3Lathe(mb,[0,0,0],[[H,w*.98],[H+3,w*1.28]],20,hi);t3Lathe(mb,[0,0,0],[[H+3,w*1.36],[H+9,w*1.36]],20,hi,{top:hi})}
    if(th==='muschio'||th==='radici'){const mo=t3S(S.moss||'#5f8a34');t3Lathe(mb,[0,0,0],[[0,r*1.24],[2.6,r*1.2],[4.2,r*1.13]],22,mo,{wob:a=>1+.05*Math.sin(a*5+sd)+.03*Math.sin(a*11)})}},
  tomb(mb,k,r,h,sd,S){const D=r*1.1,W=r*2,a=(t3hash(1,sd)-.5)*.5,mid=t3S(S.mid),hi=t3S(S.hi),ca=Math.cos(a),sa=Math.sin(a),T=(x,y,z)=>[x*ca-y*sa,x*sa+y*ca,z];
    t3BoxA(mb,[0,0,0],a,[D/2,W/2,h/2],mid);t3BoxA(mb,[0,0,h],a,[D*.56,W*.54,1.75],n=>n[2]>.5?hi:mid);
    const hw=D*.56,hd=W*.54,z0=h+3.5,z1=z0+5;const gc=[0,0,z0-1];t3Facet(mb,T(hw,-hd,z0),T(hw,hd,z0),T(0,hd,z1),hi,gc);t3Facet(mb,T(hw,-hd,z0),T(0,hd,z1),T(0,-hd,z1),hi,gc);
    t3Facet(mb,T(-hw,hd,z0),T(-hw,-hd,z0),T(0,-hd,z1),hi,gc);t3Facet(mb,T(-hw,hd,z0),T(0,-hd,z1),T(0,hd,z1),hi,gc);t3Facet(mb,T(hw,hd,z0),T(-hw,hd,z0),T(0,hd,z1),hi,gc);t3Facet(mb,T(-hw,-hd,z0),T(hw,-hd,z0),T(0,-hd,z1),hi,gc);
    // the seal with the little skull on both long sides
    for(const s of[1,-1]){const n=[ca*s,sa*s,0],c=add3(T(s*D/2,0,h*.5),RG.mul(n,.2));t3Dot(mb,c,n,W*.13,h*.2,hi,{th:.9});t3Dot(mb,add3(c,RG.mul(n,.5),T(0,-.06*W,.02*h)),n,W*.03,h*.045,t3c('#1b1612'),{th:.5});t3Dot(mb,add3(c,RG.mul(n,.5),T(0,.06*W,.02*h)),n,W*.03,h*.045,t3c('#1b1612'),{th:.5})}},
  urn(mb,k,r,h,sd,S){const pot=(c,s)=>{const H=s*1.5,zig=(z,a)=>Math.abs(z-H*(.46+.04*Math.sin(a*8)))<H*.035?t3c('#f0c48a'):t3c('#a8623a');
      t3Lathe(mb,c,[[0,s*.42],[H*.18,s*.76],[H*.45,s*.86],[H*.72,s*.62],[H*.8,s*.4]],18,zig,{sub:4});t3Lathe(mb,c,[[H*.78,s*.36],[H*.95,s*.36]],14,t3c('#9a5634'));
      t3Lathe(mb,c,[[H*.93,s*.5],[H,s*.52]],16,t3c('#c07a4a'),{top:(f)=>f<.75?t3c('#3a2216'):t3c('#c07a4a'),topz:H,rings:[0,.7,.74,.76,1]})};
    pot(t3OQ(-r*.25,0,0),r*.72);if(r>14)pot(t3OQ(r*.55,r*.35,0),r*.45)},
  gravestone(mb,k,r,h,sd,S){const w=r*1.25,d=r*.42,a=(t3hash(2,sd)-.5)*.5,ca=Math.cos(a),sa=Math.sin(a),T=(x,y,z)=>[x*ca-y*sa,x*sa+y*ca,z],mid=t3S(S.mid);
    t3Ell(mb,[0,0,0],[r*.7,r*1.05,r*.24],t3c('#4a3b2c'),{nl:14,nb:6,w:.6});
    const prof=[[-w/2,0],[w/2,0],[w/2,h-w/2]];for(let i=1;i<12;i++){const t=i/12*Math.PI;prof.push([Math.cos(t)*w/2,h-w/2+Math.sin(t)*w/2])}prof.push([-w/2,h-w/2]);
    const fr=prof.map(([y,z])=>T(d/2,y,z+1)),bk=prof.map(([y,z])=>T(-d/2,y,z+1)),cF=T(d/2,0,h*.45+1),cB=T(-d/2,0,h*.45+1),nf=[ca,sa,0],nb=[-ca,-sa,0];
    {const c0=v3V(mb,cF,nf,mid),c1=v3V(mb,cB,nb,mid),N=prof.length;for(let i=0;i<N;i++){const j=(i+1)%N;v3T(mb,c0,v3V(mb,fr[i],nf,mid),v3V(mb,fr[j],nf,mid));v3T(mb,c1,v3V(mb,bk[j],nb,mid),v3V(mb,bk[i],nb,mid));
      const e=RG.sub(fr[j],fr[i]),sn=RG.nrm(RG.cross(e,[ca,sa,0])),s2=RG.dot(sn,RG.sub(fr[i],cF))<0?RG.mul(sn,-1):sn;v3Quad(mb,fr[i],fr[j],bk[j],bk[i],s2,mid)}}
    for(const ly of[.45,.62,.76])t3BoxA(mb,T(d/2+.1,0,h*ly+.4),a,[.25,w*.28,.35],t3c('#2a2622'));
    for(const[sx,sy] of[[-w*.62,r*.25],[w*.58,r*.3],[-w*.28,r*.42]])for(const s of[-1,1]){const b=t3OQ(sx,sy+r*.2,0);t3Cone(mb,b,[b[0]+s*1.6,b[1]+s*1.2,6],1.1,t3c('#5f8a34'),{N:4})}},
  stump(mb,k,r,h,sd,S){const H=h+8,w=r*.95,bark=t3c('#6b4a2a'),cut=t3c('#c9a26a'),ring=t3c('#a07a48');
    t3Lathe(mb,[0,0,0],[[0,w*1.04],[H*.5,w*.98],[H,w*.95]],22,bark,{sub:2,wob:(a,z)=>1+.04*Math.max(0,Math.cos(a*7+z*.15)),top:(f)=>Math.abs(f-.65)<.04||Math.abs(f-.35)<.04?ring:cut,rings:[0,.3,.33,.35,.37,.4,.6,.63,.65,.67,.7,1]});
    for(const[i,t] of[-2.4,-1.1,.3,1.7].entries()){const a=t+sd*.3,p0=[Math.cos(a)*w*.8,Math.sin(a)*w*.8,5],p2=[Math.cos(a)*r*1.3,Math.sin(a)*r*1.3,0],p1=[(p0[0]+p2[0])*.55,(p0[1]+p2[1])*.55,2.6];v3Tube(mb,[p0,p1,p2],[4,2.6,1.2],bark,8)}
    // the little red mushroom on the cut
    {const c=[w*.35,-w*.2,H];t3Lathe(mb,c,[[0,.9],[2.2,.8]],8,t3c('#efe6d0'));t3Ell(mb,[c[0],c[1],c[2]+2.6],[2.2,2.2,1.4],t3c('#d8402e'),{nl:10,nb:6,w:.4})}}};
// the crystal caves (rooms 6-9 of the first world): the crystals, the braziers, the piles of skulls
// a hexagonal shard with a pointed tip (base at c, height H, radius R, leaning by `lean`), the side toward the light paler, glowing a little
function t3Shard(mb,c,R,H,tip,a0,lean,o){o=o||{};const{add,mul}=RG,N=6,side=t3c('#6fc4e6',238),lit=t3c('#b8ecff',232),dark=t3c('#6a4fc4',244),top=t3c('#e6fbff',215),up=[lean[0],lean[1],1],
    at=(i,z)=>{const a=a0+i/N*Math.PI*2;return add(add(c,[Math.cos(a)*R,Math.sin(a)*R,0]),mul(up,z))},ct=add(c,mul(up,H*.4)),apex=add(c,mul(up,H+tip));
  for(let i=0;i<N;i++){const j=(i+1)%N,a=a0+(i+.5)/N*Math.PI*2,cs=Math.cos(a+.6),col=cs>.35?lit:cs<-.35?dark:side;t3Facet(mb,at(i,0),at(j,0),at(j,H),col,ct);t3Facet(mb,at(i,0),at(j,H),at(i,H),col,ct);
    if(tip>0)t3Facet(mb,at(i,H),at(j,H),apex,cs>0?top:col,ct);else t3Facet(mb,at(i,H),at(j,H),add(c,mul(up,H)),top,ct)}}
const T3CRY=[[0,0,1,0],[-.55,.15,.7,-.35],[.55,.2,.75,.3],[.15,.3,.55,.05]],T3CRYL=[3,1,2];
Object.assign(T3OB,{
  crystal(mb,k,r,h,sd,S){t3Ell(mb,[0,0,0],[r*.6,r*.95,2.5],t3S(S.lo),{nl:14,nb:4,w:.5});const left=k.cs==null?4:k.cs,lost=T3CRYL.slice(0,4-left);
    T3CRY.forEach(([ox,oy,sz,tl],i)=>{const c=t3OQ(ox*r,oy*r*1.1,0),H=h*sz,R=r*.36*sz,ln=[0,-tl*.6];if(lost.includes(i))t3Shard(mb,c,R,H*.2,0,sd+i,ln);else t3Shard(mb,c,R,H*.72,H*.28,sd+i,ln)})},
  brazier(mb,k,r,h,sd,S){const iron=t3c('#5a5f68'),bowl=t3c('#4a4f58');for(let i=0;i<3;i++){const t=-Math.PI/2+i*Math.PI*2/3+.3;v3Tube(mb,[[Math.cos(t)*r*.72,Math.sin(t)*r*.72,0],[Math.cos(t)*r*.3,Math.sin(t)*r*.3,15]],[1.9,1.6],iron,6)}
    t3Lathe(mb,[0,0,13],[[0,r*.32],[3.5,r*.72],[7,r*.95]],20,bowl,{top:t3c('#2a1a14'),topz:6.6});
    for(let i=0;i<6;i++){const t=i/6*Math.PI*2+sd;t3Sph(mb,[Math.cos(t)*r*.48,Math.sin(t)*r*.55,20.5],2.3,i%2?t3c('#ff6a2a',90):t3c('#c8401a',120),{nl:7,nb:5,w:.3})}},
  skulls(mb,k,r,h,sd,S){const bone=t3c('#e8e2d0'),dk=t3c('#1b1612');t3Ell(mb,[0,0,0],[r*.6,r,2.4],t3c('#3e352b'),{nl:14,nb:4,w:.5});
    for(const[a,b] of[[t3OQ(-r*.9,-r*.1,2.5),t3OQ(r*.8,r*.25,2.5)],[t3OQ(-r*.6,r*.35,2.5),t3OQ(r*.9,-r*.2,2.5)]]){v3Tube(mb,[a,b],[2.4,2.4],bone,7);t3Sph(mb,a,2.8,bone,{w:.5});t3Sph(mb,b,2.8,bone,{w:.5})}
    for(const[sx,sdp,z,s0] of[[0,-r*.2,11,6],[-r*.4,r*.15,5.5,5.5],[r*.45,r*.25,5,5]]){const c=t3OQ(sx,sdp,z);t3Ell(mb,c,[s0*.95,s0,s0*.95],bone,{nl:14,nb:10,w:.8});
      for(const e of[-1,1]){const n=RG.nrm([.9,e*.3,.15]);t3Dot(mb,add3(c,RG.mul(n,s0*.9)),n,s0*.27,s0*.3,dk,{th:.5})}t3Dot(mb,add3(c,[s0*.88,0,-s0*.35]),RG.nrm([1,0,-.3]),s0*.12,s0*.1,dk,{th:.4})}}});
const add3=(...v)=>v.reduce((s,q)=>[s[0]+q[0],s[1]+q[1],s[2]+q[2]],[0,0,0]);
function t3RockMesh(k){const th=themeOf(G.room),S=stonePal(),r=k.r,h=kH(k),sd=k.seed||1,key=[k.kind,r.toFixed(1),h.toFixed(1),sd,th,k.cs==null?4:k.cs].join('|');let m=T3S.K.get(key);if(m)return m;
  const mb=v3MB();T3OB[k.kind](mb,k,r,h,sd,S,th);if(!mb.P.length)return null;m=v3Up(mb);T3S.K.set(key,m);if(T3S.K.size>80){const k0=T3S.K.keys().next().value;v3Free(T3S.K.get(k0));T3S.K.delete(k0)}return m}
T3H.rock=function(k){if(!T3OB[k.kind]||T3S.bad[k.kind]||k.g2||k.f2||k.oc||k.qk||k.sl2husk)return false;let m;try{m=t3RockMesh(k)}catch(e){t3Err(e);T3S.bad[k.kind]=1;return false}if(!m)return false;
  const x=k.x+(k.hit>0?Math.sin(G.t*90)*k.hit*14:0);t3Shadow(k.x+3,k.y+2,k.r*1.25,k.r*.8,.38);t3Draw3([{m,M:v3M4([0,1,0],[-1,0,0],[0,0,1],[x,k.y,0]),out:.65}],{});T3S.n++;return true};
// the braziers' flames, glowing quads over the coals (as the torches')
T3H.air.push(()=>{const B=(G.rocks||[]).filter(k=>k.kind==='brazier');if(!B.length)return;const gl=T3.gl,t=G.t||0,L=t3L();gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);
  for(const k of B){const f=.85+.15*Math.sin(t*11+k.seed)*Math.sin(t*7.3+k.seed*2),z=24;t3Q(k.x,k.y,z+4,-26*f,-26*f,26*f,26*f,0,0,1,1,.5*L.torch,.3*L.torch,.13*L.torch,1);t3Q(k.x,k.y,z,-6*f,-4,6*f,15*f,0,0,1,1,1,.8*f,.45*f,1)}
  t3QFlush(T3.pA,T3.glow);gl.depthMask(true);gl.disable(gl.BLEND)});
