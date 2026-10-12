// La verità a z-buffer per le prove dell'ordine di disegno (ordine.js, giro.js): una libreria da iniettare nella pagina (page.addScriptTag),
// presa da agenti/ordine/lib.js e tess.js. window.__TR.raster(voce) rifà una voce di __MZ.entries() come z-buffer (facce tagliate in triangoli
// da 8 px e scartate se girate di spalle come fa il motore, linee, sfere, i punti dei disegni a mano; esseri come cartelloni: eroe ±8 × 56,
// zombie ±9·sc × 46·sc), con la geometria di __MZ.prims e la piega di __MZ.proj; overlap(a,b) conta i pixel in comune [a davanti, b davanti,
// in comune]; evaluate() valuta l'ultimo fotogramma (coppie disegnate nell'ordine sbagliato, con le categorie).
module.exports=String.raw`window.__TR=(()=>{
function earClip(P){const n=P.length;if(n<3)return[];if(n===3)return[[0,1,2]];let nx=0,ny=0,nz=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1])}
  const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);const pj=ax>=ay&&ax>=az?(p=>[p[1],p[2]]):ay>=az?(p=>[p[2],p[0]]):(p=>[p[0],p[1]]);const Q=P.map(pj);
  let area=0;for(let i=0;i<n;i++){const a=Q[i],b=Q[(i+1)%n];area+=a[0]*b[1]-b[0]*a[1]}const sg=area>=0?1:-1;const idx=[...Array(n).keys()],tris=[];const cr=(a,b,c)=>((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))*sg;
  const inside=(p,a,b,c)=>cr(a,b,p)>=-1e-9&&cr(b,c,p)>=-1e-9&&cr(c,a,p)>=-1e-9;let guard=0;
  while(idx.length>3&&guard++<500){let cut=false;for(let k=0;k<idx.length;k++){const i0=idx[(k+idx.length-1)%idx.length],i1=idx[k],i2=idx[(k+1)%idx.length];const a=Q[i0],b=Q[i1],c=Q[i2];if(cr(a,b,c)<=1e-9)continue;let ok=true;for(const j of idx){if(j===i0||j===i1||j===i2)continue;if(inside(Q[j],a,b,c)){ok=false;break}}if(!ok)continue;tris.push([i0,i1,i2]);idx.splice(k,1);cut=true;break}if(!cut)break}
  if(idx.length===3)tris.push([idx[0],idx[1],idx[2]]);return tris}
function subTri(a,b,c,maxL,out){const l=Math.max(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),Math.hypot(b[0]-c[0],b[1]-c[1],b[2]-c[2]),Math.hypot(c[0]-a[0],c[1]-a[1],c[2]-a[2]));
  if(l<=maxL){out.push([a,b,c]);return}const m=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2],ab=m(a,b),bc=m(b,c),ca=m(c,a);subTri(a,ab,ca,maxL,out);subTri(ab,b,bc,maxL,out);subTri(ca,bc,c,maxL,out);subTri(ab,bc,ca,maxL,out)}
function tess(P,maxL){const out=[];for(const[i,j,k] of earClip(P))subTri(P[i],P[j],P[k],maxL||8,out);return out}
function rasterTri(R,A,B,C){const{x0,y0,w,h,D}=R,det=(B[0]-A[0])*(C[1]-A[1])-(C[0]-A[0])*(B[1]-A[1]);if(Math.abs(det)<1e-6)return;
  const i0=Math.max(0,Math.floor(Math.min(A[0],B[0],C[0])-x0)),i1=Math.min(w-1,Math.ceil(Math.max(A[0],B[0],C[0])-x0)),j0=Math.max(0,Math.floor(Math.min(A[1],B[1],C[1])-y0)),j1=Math.min(h-1,Math.ceil(Math.max(A[1],B[1],C[1])-y0));
  for(let j=j0;j<=j1;j++){const py=y0+j+.5;for(let i=i0;i<=i1;i++){const px=x0+i+.5;const l1=((px-A[0])*(C[1]-A[1])-(C[0]-A[0])*(py-A[1]))/det,l2=((B[0]-A[0])*(py-A[1])-(px-A[0])*(B[1]-A[1]))/det,l0=1-l1-l2;if(l0<-1e-6||l1<-1e-6||l2<-1e-6)continue;const d=l0*A[2]+l1*B[2]+l2*C[2],k=j*w+i;if(d>D[k])D[k]=d}}}
function fillPoly(R,q){const{x0,y0,w,h,D}=R,n=q.length;if(n<3)return;let best=0,A,B,Cc;for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++){const ar=Math.abs((q[b][0]-q[a][0])*(q[c][1]-q[a][1])-(q[c][0]-q[a][0])*(q[b][1]-q[a][1]));if(ar>best){best=ar;A=q[a];B=q[b];Cc=q[c]}}
  if(best<.6)return;const det=(B[0]-A[0])*(Cc[1]-A[1])-(Cc[0]-A[0])*(B[1]-A[1]);const ga=((B[2]-A[2])*(Cc[1]-A[1])-(Cc[2]-A[2])*(B[1]-A[1]))/det,gb=((Cc[2]-A[2])*(B[0]-A[0])-(B[2]-A[2])*(Cc[0]-A[0]))/det;
  let dmin=1e9,dmax=-1e9,ymin=1e9,ymax=-1e9;for(const p of q){dmin=Math.min(dmin,p[2]);dmax=Math.max(dmax,p[2]);ymin=Math.min(ymin,p[1]);ymax=Math.max(ymax,p[1])}
  const j0=Math.max(0,Math.floor(ymin-y0)),j1=Math.min(h-1,Math.ceil(ymax-y0));
  for(let j=j0;j<=j1;j++){const sy=y0+j+.5,xs=[];for(let k=0;k<n;k++){const p=q[k],r=q[(k+1)%n];if((p[1]<=sy)!==(r[1]<=sy))xs.push(p[0]+(sy-p[1])/(r[1]-p[1])*(r[0]-p[0]))}xs.sort((a,b)=>a-b);
    for(let m=0;m+1<xs.length;m+=2){const i0=Math.max(0,Math.ceil(xs[m]-x0-.5)),i1=Math.min(w-1,Math.floor(xs[m+1]-x0-.5));for(let i=i0;i<=i1;i++){const sx=x0+i+.5;let d=A[2]+ga*(sx-A[0])+gb*(sy-A[1]);d=Math.max(dmin,Math.min(dmax,d));const k=j*w+i;if(d>D[k])D[k]=d}}}}
function disc(R,cx,cy,rx,ry,dc,dz){const{x0,y0,w,h,D}=R,i0=Math.max(0,Math.floor(cx-rx-x0)),i1=Math.min(w-1,Math.ceil(cx+rx-x0)),j0=Math.max(0,Math.floor(cy-ry-y0)),j1=Math.min(h-1,Math.ceil(cy+ry-y0));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const px=(x0+i+.5-cx)/rx,py=(y0+j+.5-cy)/ry,r2=px*px+py*py;if(r2>1)continue;const d=dc+dz*Math.sqrt(1-r2),k=j*w+i;if(d>D[k])D[k]=d}}
const shoe=q=>{let a=0;for(let k=0;k<q.length;k++){const p=q[k],r=q[(k+1)%q.length];a+=p[0]*r[1]-r[0]*p[1]}return a};
// lo z-buffer di una voce (null se non disegna niente di solido)
function raster(e,T){const M=__MZ;
  if(e.kind==='H'||e.kind==='Z'||e.kind==='C'||e.kind==='F'){const hw=e.kind==='H'?8:e.kind==='Z'?9*e.sc:e.kind==='C'?5:3,H=e.kind==='H'?56:e.kind==='Z'?(e.zkind==='hound'?30:46)*e.sc:e.kind==='C'?14:8,zk=e.zk||1;
    const f=M.proj(e.id,[[e.x,e.y,e.zh||0]])[0],ds=Math.sin(M.CAM.el),Hs=H*zk,x0=Math.floor(f[0]-hw),x1=Math.ceil(f[0]+hw),y0=Math.floor(f[1]-Hs),y1=Math.ceil(f[1]+2),w=x1-x0,h=y1-y0,D=new Float32Array(w*h).fill(-Infinity);
    for(let j=0;j<h;j++){const sy=y0+j+.5,z=Math.max(0,(f[1]-sy)/zk),hh=(f[1]-sy)>Hs*.8?hw*.62:hw;for(let i=0;i<w;i++){const sx=x0+i+.5;if(Math.abs(sx-f[0])>hh)continue;D[j*w+i]=f[2]+z*ds}}return{x0,y0,w,h,D}}
  const P=M.prims(e.id);if(!P)return null;const tris=[],polys=[],discs=[];let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;const ext=(x,y)=>{if(x<bx0)bx0=x;if(x>bx1)bx1=x;if(y<by0)by0=y;if(y>by1)by1=y};
  for(const p of P){if(p.al<.5)continue;
    if(p.t==='face'||p.t==='poly'){if(p.t==='face'){const q=M.proj(e.id,p.pts);if(shoe(q)>=0)continue}const ts=tess(p.pts,8),flat=[];for(const t of ts)flat.push(t[0],t[1],t[2]);const q=M.proj(e.id,flat);for(let k=0;k<q.length;k+=3){tris.push([q[k],q[k+1],q[k+2]]);for(let m=0;m<3;m++)ext(q[k+m][0],q[k+m][1])}}
    else if(p.t==='line'){const[a,b]=M.proj(e.id,[p.p0,p.p1]),hw=(p.w+2.2)/2;let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx=nx/l*hw;ny=ny/l*hw;
      polys.push([[a[0]+nx,a[1]+ny,a[2]],[b[0]+nx,b[1]+ny,b[2]],[b[0]-nx,b[1]-ny,b[2]],[a[0]-nx,a[1]-ny,a[2]]]);discs.push([a[0],a[1],hw,hw,a[2],0],[b[0],b[1],hw,hw,b[2],0]);ext(a[0]-hw,a[1]-hw);ext(a[0]+hw,a[1]+hw);ext(b[0]-hw,b[1]-hw);ext(b[0]+hw,b[1]+hw)}
    else if(p.t==='ball'){const c=M.proj(e.id,[p.p])[0];discs.push([c[0],c[1],p.r,p.r*p.sq,c[2],p.r*.5]);ext(c[0]-p.r,c[1]-p.r);ext(c[0]+p.r,c[1]+p.r)}
    else if(p.t==='pts'){const q=M.proj(e.id,p.pts),r=p.rad,big=r>=6;for(let k=0;k<q.length;k++){discs.push([q[k][0],q[k][1],r,r,q[k][2],big?r*.5:0]);ext(q[k][0]-r,q[k][1]-r);ext(q[k][0]+r,q[k][1]+r);
        if(!big&&k>0){const A=p.pts[k-1],B=p.pts[k];if(Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2])<30){const a=q[k-1],b=q[k];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx=nx/l*1.6;ny=ny/l*1.6;polys.push([[a[0]+nx,a[1]+ny,a[2]],[b[0]+nx,b[1]+ny,b[2]],[b[0]-nx,b[1]-ny,b[2]],[a[0]-nx,a[1]-ny,a[2]]])}}}}}
  if(bx0>bx1)return null;const x0=Math.floor(bx0)-1,y0=Math.floor(by0)-1,w=Math.ceil(bx1)-x0+2,h=Math.ceil(by1)-y0+2,R={x0,y0,w,h,D:new Float32Array(w*h).fill(-Infinity)};
  for(const q of polys)fillPoly(R,q);for(const t of tris)rasterTri(R,t[0],t[1],t[2]);for(const d of discs)disc(R,...d);return R}
function overlap(ra,rb){if(!ra||!rb)return[0,0,0];const x0=Math.max(ra.x0,rb.x0),x1=Math.min(ra.x0+ra.w,rb.x0+rb.w),y0=Math.max(ra.y0,rb.y0),y1=Math.min(ra.y0+ra.h,rb.y0+rb.h);if(x0>=x1||y0>=y1)return[0,0,0];
  let na=0,nb=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const a=ra.D[(y-ra.y0)*ra.w+x-ra.x0],b=rb.D[(y-rb.y0)*rb.w+x-rb.x0];if(a===-Infinity||b===-Infinity)continue;n++;if(a>b+1)na++;else if(b>a+1)nb++}return[na,nb,n]}
const BEING=k=>k==='H'||k==='Z';
// valuta l'ultimo fotogramma: errori per coppia, con le categorie
function evaluate(o){o=o||{};const M=__MZ,E=M.entries().filter(e=>!e.floor&&e.kind!=='O'&&(e.kind==='H'||e.kind==='Z'||e.kind==='C'||e.kind==='F'||(e.alpha==null||e.alpha>=.5))),ord=M.order(),pos=new Map(ord.map((id,i)=>[id,i]));
  const R=E.map(e=>raster(e)),res={tot:0,ess:0,corvi:0,casa:0,stesso:0,bad:[],truth:o.truth?[]:null};
  for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++){const a=E[i],b=E[j],[na,nb,n]=overlap(R[i],R[j]);if(!n)continue;const first=pos.get(a.id)<pos.get(b.id)?i:j,wrong=first===i?na:nb;
    if(res.truth&&n>=3)res.truth.push([a.id<b.id?a.id:b.id,a.id<b.id?b.id:a.id,a.id<b.id?na:nb,a.id<b.id?nb:na,pos.get(a.id<b.id?a.id:b.id)<pos.get(a.id<b.id?b.id:a.id)?-1:1]);
    if(wrong<3)continue;const same=a.pi!=null&&a.pi===b.pi,ess=BEING(a.kind)||BEING(b.kind),crow=a.kind==='C'||b.kind==='C',house=a.prop==='house'||b.prop==='house';
    if(same){res.stesso+=wrong;if(o.same)res.bad.push({a:a.id+(a.prop?'('+a.prop+')':''),b:b.id+(b.prop?'('+b.prop+')':''),first:E[first].id,wrong,other:first===i?nb:na,same:1});continue}res.tot+=wrong;if(ess)res.ess+=wrong;if(crow)res.corvi+=wrong;if(house)res.casa+=wrong;
    res.bad.push({a:a.id+(a.prop?'('+a.prop+')':''),b:b.id+(b.prop?'('+b.prop+')':''),first:E[first].id,wrong,other:first===i?nb:na})}
  res.bad.sort((p,q)=>q.wrong-p.wrong);res.bad=res.bad.slice(0,o.top||6);return res}
return{raster,overlap,evaluate}})();`;
