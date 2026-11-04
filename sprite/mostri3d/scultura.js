// Mossbound · scolpire nel codice (SCU): i corpi veri della formula del 3D (Denis, 4 novembre: «Corpo più vero», «Solo il codice»). Un corpo
// è una forma fatta di distanze (per ogni punto: quanto è lontano dalla pelle, negativo dentro): forme morbide (palle, ovali, coni arrotondati)
// unite con una saldatura morbida e scavate (orbite, guance, bocca), così muscoli, ossa e pelle diventano un'unica superficie liscia. Poi:
// la superficie di triangoli (surface nets su una griglia, prima larga e poi fine solo vicino alla pelle), le normali dalla forma, l'ombra
// morbida dalla forma stessa (quanto spazio libero c'è fuori), il punto sulla pelle più vicino, i pesi delle ossa (quanto un punto segue
// ogni osso, dalla distanza dalle ossa). I vestiti sono la stessa forma gonfiata di poco, tagliata dove finiscono (orli e strappi).
// La usa sprite/mostri3d/zombie_vero.js (con kit3d.js); va caricata dopo kit3d.js. Spazio dei modelli: x a sinistra, y in su, z davanti.
(function(root){'use strict';
const K3D=(typeof root.K3D!=='undefined'&&root.K3D)||(typeof require==='function'?require('./kit3d.js'):null);
const {add,sub,mul,dot,cross,len,nrm,cl,lerp,sm}=K3D;
// ---------------------------------------------------------------- soft shapes: f(x,y,z) → distance; c, r: a ball that holds the shape
const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25};
const smax=(a,b,k)=>-smin(-a,-b,k);
function ball(c,r){return{c,r,f:(x,y,z)=>Math.hypot(x-c[0],y-c[1],z-c[2])-r}}
// an ellipsoid with radii rad along the axes ax=[X,Y,Z] (a good guess of the distance, Inigo Quilez's way)
function ell(c,rad,ax){const A=ax||[[1,0,0],[0,1,0],[0,0,1]],R=Math.max(...rad);
  return{c,r:R,f:(x,y,z)=>{const dx=x-c[0],dy=y-c[1],dz=z-c[2],u=(dx*A[0][0]+dy*A[0][1]+dz*A[0][2]),v=(dx*A[1][0]+dy*A[1][1]+dz*A[1][2]),w=(dx*A[2][0]+dy*A[2][1]+dz*A[2][2]);
    const k0=Math.hypot(u/rad[0],v/rad[1],w/rad[2]),k1=Math.hypot(u/(rad[0]*rad[0]),v/(rad[1]*rad[1]),w/(rad[2]*rad[2]));return k1<1e-9?-Math.min(...rad):k0*(k0-1)/k1}}}
// a cone with round ends from a (radius ra) to b (radius rb): arms, legs, necks, muscles
function cone(a,b,ra,rb){const ba=sub(b,a),l2=dot(ba,ba),L=Math.sqrt(l2),rr=ra-rb,a2=l2-rr*rr,il2=1/l2,c=lerp3(a,b,.5),R=L/2+Math.max(ra,rb);
  return{c,r:R,f:(x,y,z)=>{const pax=x-a[0],pay=y-a[1],paz=z-a[2],yy=pax*ba[0]+pay*ba[1]+paz*ba[2],zz=yy-l2,qx=pax*l2-ba[0]*yy,qy=pay*l2-ba[1]*yy,qz=paz*l2-ba[2]*yy,
    x2=qx*qx+qy*qy+qz*qz,y2=yy*yy*l2,z2=zz*zz*l2,k=Math.sign(rr)*rr*rr*x2;
    if(Math.sign(zz)*a2*z2>k)return Math.sqrt(x2+z2)*il2-rb;if(Math.sign(yy)*a2*y2<k)return Math.sqrt(x2+y2)*il2-ra;return(Math.sqrt(x2*a2*il2)+yy*rr)*il2-ra}}}
const lerp3=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)];
// a sculpture: shapes added (soft weld k) and dug (soft cut k), in order; d(x,y,z) the distance. A shape far from the point (farther than the
// weld) cannot change it, so it is skipped: that keeps it fast
function Sculpt(){const ops=[];const S={ops,
  add(s,k){ops.push({s,k:k||0,dig:0});return S},dig(s,k){ops.push({s,k:k||0,dig:1});return S},
  d(x,y,z){let d=1e9;for(let i=0;i<ops.length;i++){const o=ops[i],s=o.s,dx=x-s.c[0],dy=y-s.c[1],dz=z-s.c[2],lb=Math.sqrt(dx*dx+dy*dy+dz*dz)-s.r;
      if(!o.dig){if(lb>d+o.k)continue;const v=s.f(x,y,z);d=o.k>0?smin(d,v,o.k):Math.min(d,v)}
      else{if(lb>o.k-d&&lb>o.k)continue;const v=s.f(x,y,z);d=o.k>0?smax(d,-v,o.k):Math.max(d,-v)}}return d},
  // the same distances, faster: a grid of cells over box, each keeping only the shapes that can matter in it (a shape farther than margin
  // from a cell cannot change the distance there near the skin, nor whether a point is inside); outside the box the slow way
  fast(box,cell,margin){cell=cell||1;margin=margin||3.5;const nx=Math.max(1,Math.ceil((box[3]-box[0])/cell)),ny=Math.max(1,Math.ceil((box[4]-box[1])/cell)),nz=Math.max(1,Math.ceil((box[5]-box[2])/cell)),
      L=new Array(nx*ny*nz),hd=cell*Math.sqrt(3)/2;
    for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const cx=box[0]+(i+.5)*cell,cy=box[1]+(j+.5)*cell,cz=box[2]+(k+.5)*cell,l=[];
      for(const o of ops){const c=o.s.c;if(Math.hypot(cx-c[0],cy-c[1],cz-c[2])-o.s.r-hd<margin+o.k)l.push(o)}L[(k*ny+j)*nx+i]=l}
    return(x,y,z)=>{const i=Math.floor((x-box[0])/cell),j=Math.floor((y-box[1])/cell),k=Math.floor((z-box[2])/cell);if(i<0||j<0||k<0||i>=nx||j>=ny||k>=nz)return S.d(x,y,z);
      const l=L[(k*ny+j)*nx+i];let d=1e9;for(let q=0;q<l.length;q++){const o=l[q],s=o.s,dx=x-s.c[0],dy=y-s.c[1],dz=z-s.c[2],lb=Math.sqrt(dx*dx+dy*dy+dz*dz)-s.r;
        if(!o.dig){if(lb>d+o.k)continue;const v=s.f(x,y,z);d=o.k>0?smin(d,v,o.k):Math.min(d,v)}
        else{if(lb>o.k-d&&lb>o.k)continue;const v=s.f(x,y,z);d=o.k>0?smax(d,-v,o.k):Math.max(d,-v)}}return l.length?d:S.d(x,y,z)}}};return S}
// ---------------------------------------------------------------- the skin from the distances (surface nets)
// D(x,y,z) the distance; box [x0,y0,z0,x1,y1,z1]; h the size of a cell; o.keep(p) → false where the surface is not wanted (the end of a
// sleeve, a hole, a hem: there the surface stays open). → {P (places), I (triangles, seen from outside)}
function nets(D,box,h,o){o=o||{};const nx=Math.ceil((box[3]-box[0])/h)+1,ny=Math.ceil((box[4]-box[1])/h)+1,nz=Math.ceil((box[5]-box[2])/h)+1,N=nx*ny*nz,V=new Float32Array(N);
  const X=i=>box[0]+i*h,Y=j=>box[1]+j*h,Z=k=>box[2]+k*h,id=(i,j,k)=>(k*ny+j)*nx+i;
  // first a coarse grid; fine distances only near the skin (far away the coarse one tells the side well enough)
  const S=4,cx=Math.ceil((nx-1)/S)+1,cy=Math.ceil((ny-1)/S)+1,cz=Math.ceil((nz-1)/S)+1,C=new Float32Array(cx*cy*cz);
  for(let k=0;k<cz;k++)for(let j=0;j<cy;j++)for(let i=0;i<cx;i++)C[(k*cy+j)*cx+i]=D(X(i*S),Y(j*S),Z(k*S));
  const near=1.9*S*h;
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const ci=Math.min(cx-1,Math.round(i/S)),cj=Math.min(cy-1,Math.round(j/S)),ck=Math.min(cz-1,Math.round(k/S)),c=C[(ck*cy+cj)*cx+ci];
    V[id(i,j,k)]=Math.abs(c)>near?c:D(X(i),Y(j),Z(k))}
  // one point in every cell the skin goes through: the middle of where the skin crosses its edges
  const cell=new Int32Array((nx-1)*(ny-1)*(nz-1)).fill(-1),cid=(i,j,k)=>(k*(ny-1)+j)*(nx-1)+i,P=[];
  const E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],cor=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],v8=new Float32Array(8);
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){let m=0;for(let q=0;q<8;q++){const c=cor[q];v8[q]=V[id(i+c[0],j+c[1],k+c[2])];if(v8[q]<0)m|=1<<q}
    if(m===0||m===255)continue;let sx=0,sy=0,sz=0,n=0;
    for(const[a,b] of E){if((v8[a]<0)===(v8[b]<0))continue;const t=v8[a]/(v8[a]-v8[b]),ca=cor[a],cb=cor[b];sx+=ca[0]+(cb[0]-ca[0])*t;sy+=ca[1]+(cb[1]-ca[1])*t;sz+=ca[2]+(cb[2]-ca[2])*t;n++}
    cell[cid(i,j,k)]=P.length/3;P.push(X(i)+sx/n*h,Y(j)+sy/n*h,Z(k)+sz/n*h)}
  // a quad across every edge of the grid the skin crosses, made of the points of the four cells round it
  const I=[],keep=o.keep;
  const quad=(a,b,c,d,flip)=>{if(a<0||b<0||c<0||d<0)return;if(keep){const mx=(P[a*3]+P[c*3])/2,my=(P[a*3+1]+P[c*3+1])/2,mz=(P[a*3+2]+P[c*3+2])/2;if(!keep([mx,my,mz]))return}
    if(flip)I.push(a,c,b,a,d,c);else I.push(a,b,c,a,c,d)};
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const v0=V[id(i,j,k)],in0=v0<0;
    if(i<nx-1&&(V[id(i+1,j,k)]<0)!==in0)quad(cell[cid(i,j-1,k-1)],cell[cid(i,j,k-1)],cell[cid(i,j,k)],cell[cid(i,j-1,k)],!in0);
    if(j<ny-1&&(V[id(i,j+1,k)]<0)!==in0)quad(cell[cid(i-1,j,k-1)],cell[cid(i-1,j,k)],cell[cid(i,j,k)],cell[cid(i,j,k-1)],!in0);
    if(k<nz-1&&(V[id(i,j,k+1)]<0)!==in0)quad(cell[cid(i-1,j-1,k)],cell[cid(i,j-1,k)],cell[cid(i,j,k)],cell[cid(i-1,j,k)],!in0)}
  // only the points that some triangle uses
  const used=new Int32Array(P.length/3).fill(-1),P2=[];let n2=0;for(let t=0;t<I.length;t++){const v=I[t];if(used[v]<0){used[v]=n2++;P2.push(P[v*3],P[v*3+1],P[v*3+2])}I[t]=used[v]}
  return{P:P2,I}}
// the way out of the skin at p (the slope of the distances)
function normal(D,p,e){e=e||.05;const x=p[0],y=p[1],z=p[2];return nrm([D(x+e,y,z)-D(x-e,y,z),D(x,y+e,z)-D(x,y-e,z),D(x,y,z+e)-D(x,y,z-e)])}
// the point on the skin nearest to p (a few steps along the slope)
function onSkin(D,p){let q=p;for(let i=0;i<6;i++){const d=D(q[0],q[1],q[2]);if(Math.abs(d)<.002)break;q=sub(q,mul(normal(D,q),d))}return q}
// the soft shadow from the shape itself: how much the space just outside the skin is taken by the body (armpits, under the chin, folds)
function occl(D,p,n){let o=0;for(const[t,w] of[[.22,.5],[.5,.32],[.95,.2],[1.7,.12],[2.8,.07]]){const d=D(p[0]+n[0]*t,p[1]+n[1]*t,p[2]+n[2]*t);o+=w*Math.max(0,t-d)/t}return cl(o*1.15,0,1)}
// the weights of the bones for a point: its distance to each bone (a segment), measured in the thickness of that bone; the nearest bones
// share the point, softly. bones = [{i, a, b, s (thickness)}]; only (optional) lists the bones the point may follow
function weights(p,bones,only,sig){sig=sig||.55;let best=1e9;const ds=[];
  for(const B of bones){if(only&&!only.includes(B.i))continue;const ab=sub(B.b,B.a),t=cl(dot(sub(p,B.a),ab)/(dot(ab,ab)||1),0,1),d=len(sub(p,add(B.a,mul(ab,t))))/B.s;ds.push([B.i,d]);if(d<best)best=d}
  const w=ds.map(([i,d])=>[i,Math.exp(-Math.pow((d-best)/sig,2))]).filter(x=>x[1]>.03).sort((a,b)=>b[1]-a[1]).slice(0,4);return w}
// a little value noise in 3D, for torn edges, folds and blotches (the same every time)
const hash3=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s)};
function noise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
  const L=(a,b,t)=>a+(b-a)*t,h=(a,b,c)=>hash3(ix+a,iy+b,iz+c);
  return L(L(L(h(0,0,0),h(1,0,0),u),L(h(0,1,0),h(1,1,0),u),v),L(L(h(0,0,1),h(1,0,1),u),L(h(0,1,1),h(1,1,1),u),v),w)}
const fbm=(x,y,z)=>noise(x,y,z)*.55+noise(x*2.1+3.1,y*2.1,z*2.1)*.3+noise(x*4.3+7.7,y*4.3,z*4.3)*.15;
const SCU={smin,smax,ball,ell,cone,Sculpt,nets,normal,onSkin,occl,weights,noise,fbm};
if(typeof module!=='undefined'&&module.exports)module.exports=SCU;else root.SCU=SCU;
})(typeof window!=='undefined'?window:this);
