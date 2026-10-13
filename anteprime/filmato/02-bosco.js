// ------------------------------------------------------------------ 02 · the forest at night and the crypt from outside
// Old twisted trees covered in moss, a path of moonlit earth, mist on the ground, fireflies, the moon behind thin clouds.
// Far things go into the blue of the night (fog); near things have the thick dark outline and the warm-cold light of the game.
const NT={sky0:'#040912',sky1:'#0a1730',sky2:'#1a3350',fog:'#1b3248',
  trunk:'#1d2834',trunkL:'#7b98b2',trunkD:'#090e15',bark:'#121a24',leaf:'#0e2128',leafL:'#2b5868',leafH:'#4f879c',
  moss:'#3c6e2b',mossL:'#8cc650',mossD:'#20401b',ground:'#0b1416',path:'#363a33',pathL:'#5f6457',grass:'#14281e',grassL:'#4d8253',
  stone:'#4a5566',stoneL:'#9aaec4',stoneD:'#1c232e',ink:'#0c0f14'};

// ---------- trees
function mkTree(x,z,h,w,seed,o){o=o||{};const r=frng(seed),T={x,z,h,w,seed,lean:(r()-.5)*.3+(o.lean||0),kind:o.kind||(r()<.25?1:0),N:12,L:[],R:[],br:[],fol:[],moss:[],beards:[],roots:[]};
  const wig=r()*6;
  for(let i=0;i<=T.N;i++){const k=i/T.N,y=-h*k,cx=x+T.lean*h*k*k*.45+Math.sin(k*3.2+wig)*w*.18,hw=w*.5*(1.22-.55*k)+w*.95*Math.exp(-k*16);T.L.push([cx-hw,y]);T.R.push([cx+hw,y])}
  const at=k=>{const i=Math.min(T.N-1,Math.floor(k*T.N)),u=k*T.N-i,a=T.L[i],b=T.L[i+1],c=T.R[i],d=T.R[i+1];return[(flp(a[0],b[0],u)+flp(c[0],d[0],u))/2,flp(a[1],b[1],u),(flp(c[0],d[0],u)-flp(a[0],b[0],u))/2]};T.at=at;
  // roots spreading on the ground
  const nr=2+Math.floor(r()*3);for(let i=0;i<nr;i++){const sd=i%2?1:-1,l=w*(.9+r()*1.2);T.roots.push({sd,l,h:w*(.25+r()*.25),y:-w*.05})}
  // branches: low ones bare and twisted, high ones carrying the leaves
  const nb=2+Math.floor(r()*3);for(let i=0;i<nb;i++){const k=.42+i/nb*.45+r()*.08,sd=(i+(seed&1))%2?1:-1,len=h*(.16+r()*.2),up=.25+r()*.55;
    const b0=at(k),b1=[b0[0]+sd*len*.55,b0[1]-len*up*.5],b2=[b0[0]+sd*len,b0[1]-len*up];T.br.push({p:[b0,b1,b2],w:w*(.32-.1*k)*(.8+r()*.4),sd});
    if(r()<.75)T.beards.push({x:b1[0],y:b1[1],l:12+r()*26,n:3+Math.floor(r()*3),ph:r()*6});
    const cl=3+Math.floor(r()*4);for(let j=0;j<cl;j++)T.fol.push([b2[0]+(r()-.5)*len*.7,b2[1]+(r()-.6)*len*.5,len*(.16+r()*.16)])}
  {const top=at(1);const cl=6+Math.floor(r()*6);for(let j=0;j<cl;j++)T.fol.push([top[0]+(r()-.5)*h*.46,top[1]+(r()-.3)*h*.22,h*(.06+r()*.06)])}
  // every leaf cluster has small bumps round its edge, so it reads as leaves and not as a ball
  T.bumps=T.fol.map(f=>{const n=7,b=[];for(let i=0;i<n;i++){const a=i/n*FTAU+r()*.4;b.push([f[0]+Math.cos(a)*f[2]*.92,f[1]+Math.sin(a)*f[2]*.92,f[2]*(.32+r()*.18)])}return b});
  // moss patches on the trunk (on the left, the side away from the moon, and at the foot)
  const nm=2+Math.floor(r()*3);for(let i=0;i<nm;i++){const k=.06+r()*.5,q=at(k),mw=q[2]*(.5+r()*.45),mh=w*(.5+r()*.9),cx=q[0]-q[2]+mw*.9,pts=[];
    for(let j=0;j<10;j++){const a=j/10*FTAU,rr=.65+r()*.45;pts.push([cx+Math.cos(a)*mw*rr,q[1]+Math.sin(a)*mh*rr])}T.moss.push({pts,cx,cy:q[1],mw,mh,dots:[r(),r(),r(),r()]})}
  T.mossFoot=w*(.7+r()*.6);T.barkS=[];for(let i=0;i<5;i++)T.barkS.push([r()-.5,.1+r()*.6,.15+r()*.3]);
  return T}
function trunkPath(c,T){c.beginPath();c.moveTo(T.L[0][0],T.L[0][1]);for(const q of T.L)c.lineTo(q[0],q[1]);for(let i=T.R.length-1;i>=0;i--)c.lineTo(T.R[i][0],T.R[i][1]);c.closePath()}
// draw a tree on its card (world units). The detail grows with its size on the screen
function drawTree(c,T,s,t,o){o=o||{};const fk=fz(T.z),lvl=s*T.w*CPX/FM.dpr,F=col=>mc(col,FOGC,fk),wind=Math.sin(t*.9+T.seed)*.6;
  if(o.blur){const col=F(o.col||NT.trunkD);soft(c,o.blur,col,()=>{trunkPath(c,T);for(const b of T.br){c.moveTo(b.p[0][0],b.p[0][1]);c.quadraticCurveTo(b.p[1][0],b.p[1][1],b.p[2][0],b.p[2][1]);c.lineTo(b.p[2][0],b.p[2][1]-b.w*.6);c.quadraticCurveTo(b.p[1][0],b.p[1][1]-b.w,b.p[0][0],b.p[0][1]-b.w*1.4)}
      for(const f of T.fol){c.moveTo(f[0]+f[2],f[1]);c.arc(f[0],f[1],f[2],0,FTAU)}});return}
  const trunk=F(NT.trunk),lit=F(NT.trunkL),dark=F(NT.trunkD),ink=F(NT.ink),det=lvl>5,out=lvl>9&&!o.noOut;
  const b0=T.L[0][0],b1=T.R[0][0];
  // roots
  for(const rt of T.roots){const x0=rt.sd<0?T.L[0][0]+T.w*.3:T.R[0][0]-T.w*.3;c.beginPath();c.moveTo(x0,-rt.h*2.2);c.quadraticCurveTo(x0+rt.sd*rt.l*.35,-rt.h*.6,x0+rt.sd*rt.l,0);c.lineTo(x0-rt.sd*T.w*.2,0);c.closePath();
    c.fillStyle=rt.sd>0?mc(trunk,lit,.18):dark;c.fill();if(out){c.strokeStyle=ink;c.lineWidth=1.8;c.stroke()}}
  // branches behind the leaves
  c.lineCap='round';c.lineJoin='round';
  for(const b of T.br){const p=b.p;if(out){c.strokeStyle=ink;c.lineWidth=b.w+2.6;c.beginPath();c.moveTo(p[0][0],p[0][1]);c.quadraticCurveTo(p[1][0],p[1][1],p[2][0],p[2][1]);c.stroke()}
    c.strokeStyle=b.sd>0?mc(trunk,lit,.22):trunk;c.lineWidth=b.w;c.beginPath();c.moveTo(p[0][0],p[0][1]);c.quadraticCurveTo(p[1][0],p[1][1],p[2][0],p[2][1]);c.stroke();
    if(det&&b.sd>0){c.strokeStyle=rgba(lit,.55);c.lineWidth=b.w*.25;c.beginPath();c.moveTo(p[0][0],p[0][1]-b.w*.3);c.quadraticCurveTo(p[1][0],p[1][1]-b.w*.35,p[2][0],p[2][1]-b.w*.3);c.stroke()}}
  // the trunk: dark on the left, the moon on the right
  trunkPath(c,T);const g=c.createLinearGradient(b0,0,b1,0);g.addColorStop(0,dark);g.addColorStop(.45,trunk);g.addColorStop(.82,mc(trunk,lit,.35));g.addColorStop(1,lit);c.fillStyle=g;c.fill();
  if(det){c.save();trunkPath(c,T);c.clip();
    // bark: long wavy grooves, darker; the lit side gets a thin light edge
    c.strokeStyle=rgba(F(NT.bark),.85);c.lineWidth=Math.max(.6,T.w*.06);for(const[ox,k0,k1] of T.barkS){c.beginPath();for(let k=k0;k<k0+k1*1.6&&k<1;k+=.05){const q=T.at(k);c.lineTo(q[0]+ox*q[2]*1.4+Math.sin(k*20+ox*9)*q[2]*.08,q[1])}c.stroke()}
    // moss: soft green patches that catch a little moonlight on top
    for(const m of T.moss){blob(c,m.pts);c.fillStyle=F(NT.mossD);c.fill();c.save();blob(c,m.pts);c.clip();c.fillStyle=F(NT.moss);c.beginPath();c.ellipse(m.cx+m.mw*.25,m.cy-m.mh*.25,m.mw*.95,m.mh*.8,0,0,FTAU);c.fill();
      c.fillStyle=rgba(F(NT.mossL),.5);for(let i=0;i<4;i++){c.beginPath();c.arc(m.cx+(m.dots[i]-.3)*m.mw,m.cy+(m.dots[(i+1)%4]-.6)*m.mh,Math.max(.6,m.mw*.13),0,FTAU);c.fill()}c.restore()}
    // the moss at the foot: a soft mound with tufts that catch the light
    {const fx=(b0+b1)/2,fw=T.w*1.25,fh=T.mossFoot*.55;c.fillStyle=F(NT.mossD);c.beginPath();c.moveTo(fx-fw,2);c.quadraticCurveTo(fx-fw*.7,-fh*1.1,fx-fw*.1,-fh*.7);c.quadraticCurveTo(fx+fw*.4,-fh*1.2,fx+fw,2);c.closePath();c.fill();
      c.strokeStyle=rgba(F(NT.mossL),.55);c.lineWidth=Math.max(.5,T.w*.04);c.beginPath();for(let i=0;i<9;i++){const x=fx-fw*.8+fw*1.6*i/8,y=-fh*(.55+.4*Math.sin(i*1.9));c.moveTo(x,y+1.5);c.lineTo(x+.8,y-1.8)}c.stroke()}
    c.restore()}
  if(out){trunkPath(c,T);c.strokeStyle=ink;c.lineWidth=Math.max(1.2,T.w*.07+1.2);c.stroke()}
  // moss beards hanging from the branches, moving in the wind
  if(det)for(const bd of T.beards){c.strokeStyle=F(NT.mossD);c.lineWidth=1.6;for(let i=0;i<bd.n;i++){const ox=(i-bd.n/2)*2.2,l=bd.l*(.6+.4*Math.sin(i*2.3+bd.ph)),sw=Math.sin(t*1.3+bd.ph+i)*2.2+wind*2;c.beginPath();c.moveTo(bd.x+ox,bd.y);c.quadraticCurveTo(bd.x+ox+sw*.5,bd.y+l*.5,bd.x+ox+sw,bd.y+l);c.stroke()}
    c.strokeStyle=rgba(F(NT.mossL),.6);c.lineWidth=.8;for(let i=0;i<bd.n;i++){const ox=(i-bd.n/2)*2.2+.6,l=bd.l*(.5+.4*Math.sin(i*2.3+bd.ph)),sw=Math.sin(t*1.3+bd.ph+i)*2.2+wind*2;c.beginPath();c.moveTo(bd.x+ox,bd.y);c.quadraticCurveTo(bd.x+ox+sw*.5,bd.y+l*.5,bd.x+ox+sw,bd.y+l);c.stroke()}}
  // the leaves: lit circles, then the dark ones moved down-left, so the moon catches the upper right edge
  if(T.fol.length){const sw=wind*1.5,L1=F(NT.leafL),L0=F(NT.leaf);
    const all=(dx,dy)=>{c.beginPath();for(let i=0;i<T.fol.length;i++){const f=T.fol[i];c.moveTo(f[0]+sw+dx+f[2],f[1]+dy);c.arc(f[0]+sw+dx,f[1]+dy,f[2],0,FTAU);for(const b of T.bumps[i]){c.moveTo(b[0]+sw+dx+b[2],b[1]+dy);c.arc(b[0]+sw+dx,b[1]+dy,b[2],0,FTAU)}}};
    c.fillStyle=L1;all(0,0);c.fill();c.fillStyle=L0;c.beginPath();for(let i=0;i<T.fol.length;i++){const f=T.fol[i],kk=f[2]*.14;c.moveTo(f[0]+sw-kk+f[2],f[1]+kk);c.arc(f[0]+sw-kk,f[1]+kk,f[2],0,FTAU);for(const b of T.bumps[i]){c.moveTo(b[0]+sw-kk+b[2],b[1]+kk);c.arc(b[0]+sw-kk,b[1]+kk,b[2],0,FTAU)}}c.fill();
    if(det){c.fillStyle=rgba(F(NT.leafH),.45);for(const f of T.fol){c.beginPath();c.arc(f[0]+sw+f[2]*.42,f[1]-f[2]*.48,f[2]*.2,0,FTAU);c.fill()}}}}

// a far pine: a dark stacked triangle, fogged
function drawPine(c,x,h,w,col){c.fillStyle=col;c.beginPath();c.moveTo(x,-h);for(let i=0;i<4;i++){const k=(i+1)/4;c.lineTo(x+w*k*.55,-h+h*k*.8);c.lineTo(x+w*k*.3,-h+h*k*.8)}
  c.lineTo(x+w*.08,0);c.lineTo(x-w*.08,0);for(let i=3;i>=0;i--){const k=(i+1)/4;c.lineTo(x-w*k*.3,-h+h*k*.8);c.lineTo(x-w*k*.55,-h+h*k*.8)}c.closePath();c.fill()}
// a far line of trees: a jagged silhouette (one card)
function drawTreeline(c,seed,x0,x1,h,col){const r=frng(seed);c.fillStyle=col;c.beginPath();c.moveTo(x0,40);let x=x0;while(x<x1){const w=h*(.12+r()*.18),hh=h*(.55+r()*.5);c.lineTo(x,-hh*.55);
    c.quadraticCurveTo(x+w*.15,-hh*1.05,x+w*.5,-hh);c.quadraticCurveTo(x+w*.85,-hh*1.02,x+w,-hh*.6);x+=w*.8}c.lineTo(x1,40);c.closePath();c.fill()}

// ---------- the ground
// the plane y=0 seen from the camera: a gradient from the near colour to the fog at the horizon
function groundGrad(c,near,mul){const yh=FM.H*C.hy,H=FM.H,g=c.createLinearGradient(0,yh,0,H+40),h=-C.y;if(h<=.01){c.fillStyle=near;return}
  const zAt=y=>C.z+C.f*h/Math.max(.01,y-yh);for(const k of[0,.01,.03,.07,.15,.3,.55,1]){const y=yh+(H+40-yh)*k;g.addColorStop(k,mc(near,FOGC,fz(zAt(y))*(mul||1)))}return g}
function drawGround(c,col){const yh=FM.H*C.hy;c.fillStyle=groundGrad(c,col);c.fillRect(-200,yh-1,FM.W+400,FM.H-yh+300)}
// little things lying on the ground (leaves, pebbles, moss): flat ellipses seen in perspective
function drawLitter(c,L,t){const h=-C.y;if(h<=.5)return;for(const q of L){const d=q.z-C.z;if(d<h*2.5+6||d>q.far)continue;const p=pr(q.x,0,q.z),r=Math.min(q.r*p[2],22),ry=r*Math.min(.8,h/d*1.2);
    if(p[0]<-r||p[0]>FM.W+r||p[1]>FM.H+ry||r<.25)continue;const co=Math.cos(q.rot),si=Math.sin(q.rot);c.fillStyle=fogc(q.col,q.z);
    // a leaf: pointed at both ends
    c.beginPath();c.moveTo(p[0]-co*r,p[1]-si*ry);c.quadraticCurveTo(p[0]-si*r*.5,p[1]+co*ry*.9,p[0]+co*r,p[1]+si*ry);c.quadraticCurveTo(p[0]+si*r*.5,p[1]-co*ry*.9,p[0]-co*r,p[1]-si*ry);c.fill();
    if(q.hl&&r>2.5){c.strokeStyle=rgba(fogc(q.hl,q.z),.6);c.lineWidth=Math.max(.5,r*.08);c.beginPath();c.moveTo(p[0]-co*r*.8,p[1]-si*ry*.8);c.lineTo(p[0]+co*r*.8,p[1]+si*ry*.8);c.stroke()}}}
function mkLitter(seed,n,x0,x1,z0,z1,cols,rr0,rr1){const r=frng(seed),L=[];for(let i=0;i<n;i++){const c=cols[Math.floor(r()*cols.length)];
    L.push({x:flp(x0,x1,r()),z:flp(z0,z1,Math.pow(r(),1.6)),r:flp(rr0,rr1,r()),col:c[0],hl:c[1],rot:(r()-.5)*.8,far:2600})}return L}
// a tuft of grass or a fern on its card: blades from the foot, the tips catching the moon
function drawTuft(c,x,h,w,n,col,colL,t,seed,blur){const r=frng(seed),sw=Math.sin(t*1.4+seed)*h*.08;
  const blades=[];for(let i=0;i<n;i++){const a=(i/(n-1||1)-.5)*1.6+(r()-.5)*.3,l=h*(.6+r()*.5);blades.push([x+(i/(n-1||1)-.5)*w*.5,x+Math.sin(a)*l+sw,-Math.cos(a)*l,Math.max(.8,w*.09)])}
  const path=()=>{for(const b of blades){c.moveTo(b[0]-b[3],0);c.quadraticCurveTo((b[0]+b[1])/2,b[2]*.55,b[1],b[2]);c.quadraticCurveTo((b[0]+b[1])/2+b[3]*.6,b[2]*.5,b[0]+b[3],0)}};
  if(blur){c.beginPath();soft(c,blur,col,()=>{c.beginPath();path()});return}
  c.beginPath();path();c.fillStyle=col;c.fill();
  c.strokeStyle=colL;c.lineWidth=Math.max(.5,w*.035);c.lineCap='round';for(const b of blades){c.beginPath();c.moveTo(flp(b[0],b[1],.55),b[2]*.55);c.quadraticCurveTo(flp(b[0],b[1],.8),b[2]*.85,b[1],b[2]);c.stroke()}}
function drawFern(c,x,h,col,colL,t,seed,blur){const r=frng(seed),n=5+Math.floor(r()*3),sw=Math.sin(t*1.1+seed)*.06;
  const path=()=>{for(let i=0;i<n;i++){const a=-Math.PI/2+(i/(n-1)-.5)*2.2+sw,l=h*(.7+r()*.4);let px=x,py=0;const dx=Math.cos(a),dy=Math.sin(a);
      for(let j=0;j<7;j++){const k=j/7,qx=x+dx*l*k+dx*l*k*k*.2*Math.sign(dx),qy=dy*l*k+l*k*k*.35,lw=l*.12*(1-k);c.moveTo(qx,qy);c.lineTo(qx+dy*lw*-1+dx*lw*.6,qy+dx*lw+dy*lw*.6);c.lineTo(qx+dx*l*.08,qy+dy*l*.08);c.lineTo(qx+dy*lw-dx*lw*-.6,qy-dx*lw+dy*lw*.6);c.lineTo(qx,qy);px=qx;py=qy}}};
  if(blur){soft(c,blur,col,()=>{c.beginPath();path()});return}c.beginPath();path();c.fillStyle=col;c.fill();c.strokeStyle=colL;c.lineWidth=.5;c.stroke()}

// a leafy twig hanging in front of the lens: a curved stem with pointed leaves on both sides, out of focus
function drawSpray(c,f,t,col){const rr=frng(f.seed||11),sw=Math.sin(t*1.1+(f.seed||0))*f.w*.02,dir=f.dir||1,L=f.w,n=f.n||14;
  soft(c,f.blur,col,()=>{c.beginPath();const P=k=>[f.x-dir*L/2+dir*L*k+sw*k,f.y+Math.sin(k*2.4)*f.h*.35*k+f.h*.2*k*k];
    {const a=P(0),b=P(1);c.moveTo(a[0],a[1]-f.r*.06);c.quadraticCurveTo(P(.5)[0],P(.5)[1]-f.r*.06,b[0],b[1]);c.quadraticCurveTo(P(.5)[0],P(.5)[1]+f.r*.06,a[0],a[1]+f.r*.06)}
    for(let i=0;i<n;i++){const k=.08+.92*i/n,q=P(k),sd=i%2?1:-1,len=f.r*(1.4-k*.6)*(.8+rr()*.4),ang=(sd>0?.9:-.9)+(rr()-.5)*.5+(dir<0?Math.PI:0)+.35*sd*k,
        tx=q[0]+Math.cos(ang)*len,ty=q[1]+Math.sin(ang)*len*.9+len*.35,nx=-Math.sin(ang)*len*.28,ny=Math.cos(ang)*len*.28;
      c.moveTo(q[0],q[1]);c.quadraticCurveTo((q[0]+tx)/2+nx,(q[1]+ty)/2+ny,tx,ty);c.quadraticCurveTo((q[0]+tx)/2-nx,(q[1]+ty)/2-ny,q[0],q[1])}})}

// ---------- the sky
function drawSky(c,sh,t,o){o=o||{};const W=FM.W,H=FM.H,yh=H*C.hy;const g=c.createLinearGradient(0,Math.min(yh-H*.9,-H*.1),0,yh+2);
  g.addColorStop(0,NT.sky0);g.addColorStop(.55,NT.sky1);g.addColorStop(.88,NT.sky2);g.addColorStop(1,FOGC);c.fillStyle=g;c.fillRect(-200,-400,W+400,H+800);
  // stars
  const r=frng(5);c.fillStyle='#dfe8ff';for(let i=0;i<70;i++){const x=r()*W*1.4-W*.2+(C.hx-.5)*W,y=(r()*1.2-.25)*H*.8+(C.hy-.5)*H*.4,tw=.35+.65*Math.abs(Math.sin(t*(.7+r()*1.6)+i)),s0=r()<.12?1.2:.6;
    if(y>yh-20)continue;c.globalAlpha=tw*.8;c.fillRect(x,y,s0,s0)}c.globalAlpha=1;
  // the moon: a disc with its halo; thin clouds slide in front of it
  if(o.moon){const[mx,my,mr]=o.moon,x=W*mx+(C.hx-.5)*W,y=H*my+(C.hy-.5)*H*.35;glo(c,'150,185,255',x,y,mr*9,.45);glo(c,'210,225,255',x,y,mr*3,.5);
    c.fillStyle='#eef3ff';c.beginPath();c.arc(x,y,mr,0,FTAU);c.fill();c.fillStyle='rgba(160,175,205,.35)';for(const[a,b,rr] of[[-.3,-.2,.28],[.25,.15,.2],[-.05,.38,.16],[.4,-.35,.12]]){c.beginPath();c.arc(x+a*mr,y+b*mr,rr*mr,0,FTAU);c.fill()}
    for(let i=0;i<3;i++){const cx=x+((t*6+i*90)%260)-130,cy=y+(i-1)*mr*.7;c.fillStyle=`rgba(20,32,52,${.55-i*.12})`;c.beginPath();c.ellipse(cx,cy,mr*2.6,mr*.28,0,0,FTAU);c.fill()}}}

// ---------- fireflies and mist
function mkFlies(seed,n,x0,x1,y0,y1,z0,z1){const r=frng(seed),F=[];for(let i=0;i<n;i++)F.push({x:flp(x0,x1,r()),y:flp(y0,y1,r()),z:flp(z0,z1,r()),ph:r()*9,sp:.4+r()*.8,r:.6+r()*.6});return F}
function flyItems(F,t,out,col){col=col||'215,255,140';for(const f of F){const x=f.x+Math.sin(t*f.sp+f.ph)*14,y=f.y+Math.sin(t*f.sp*1.3+f.ph*2)*8,z=f.z+Math.cos(t*f.sp*.7+f.ph)*10,
    bl=.5+.5*Math.sin(t*2.2*f.sp+f.ph*3);if(bl<.15)continue;out.push({z,c:(c,s)=>{const a=bl*(1-fz(z)*.7);glo(c,col,x,y,f.r*7,a*.55);c.fillStyle=`rgba(${col},${a})`;c.beginPath();c.arc(x,y,f.r*.9,0,FTAU);c.fill()}})}}
function mistItem(z,x,y,w,h,a,t,sp,out){out.push({z,c:(c,s)=>{const dx=Math.sin(t*sp+z*.01)*w*.08+t*sp*8;const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(150,180,210,${a})`);g.addColorStop(1,'rgba(150,180,210,0)');
  c.save();c.translate(x+dx,y);c.scale(w,h);c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,FTAU);c.fill();c.restore()}})}
// god rays of moonlight through the leaves (screen units, additive)
function moonRays(c,t,a,x0,ang){if(a<=0||LOWFX)return;const W=FM.W,H=FM.H;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=W*(x0+i*.13)+Math.sin(t*.3+i)*6,w=W*(.05+.03*Math.sin(i*2.1)),al=a*(.5+.5*Math.sin(t*.5+i*1.7));
    const g=c.createLinearGradient(x,-20,x-H*ang,H);g.addColorStop(0,`rgba(170,200,255,${al*.22})`);g.addColorStop(.6,`rgba(170,200,255,${al*.08})`);g.addColorStop(1,'rgba(170,200,255,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(x-w/2,-20);c.lineTo(x+w/2,-20);c.lineTo(x+w*1.8-H*ang,H+40);c.lineTo(x-w*1.8-H*ang,H+40);c.closePath();c.fill()}c.restore()}

// ---------- the crypt from outside: a stone portal in a mossy hill, a green light breathing inside
const CRY={stone:'#55606f',stoneL:'#a3b6cc',stoneD:'#232a36',joint:'#12161d',inside:'#020504'};
function cryptGlow(t){return .72+.18*Math.sin(t*2.1)+.1*Math.sin(t*5.3+1)}
function stoneBlock(c,x,y,w,h,F,seed,o){o=o||{};const r=frng(seed),j=w*.06;c.beginPath();c.moveTo(x+j*r(),y+j*r());c.lineTo(x+w-j*r(),y+j*r());c.lineTo(x+w-j*r(),y+h-j*r());c.lineTo(x+j*r(),y+h-j*r());c.closePath();
  const g=c.createLinearGradient(x+w,y,x,y+h);g.addColorStop(0,F(CRY.stoneL));g.addColorStop(.35,F(CRY.stone));g.addColorStop(1,F(CRY.stoneD));c.fillStyle=g;c.fill();
  if(o.out!==false){c.strokeStyle=F(NT.ink);c.lineWidth=o.lw||2.2;c.stroke()}
  // a crack and a chip
  if(r()<.6){c.strokeStyle=rgba(F(CRY.joint),.6);c.lineWidth=.9;c.beginPath();const sx=x+w*(.2+r()*.6);c.moveTo(sx,y+h*.1);c.lineTo(sx+w*.08,y+h*.45);c.lineTo(sx-w*.05,y+h*.7);c.stroke()}
  c.fillStyle=rgba(F(CRY.stoneL),.35);c.fillRect(x+w*.12,y+h*.1,w*.5,Math.max(.8,h*.06))}
function mossDrape(c,x,y,w,F,t,seed){const r=frng(seed);c.fillStyle=F(NT.moss);c.beginPath();c.moveTo(x,y);const n=Math.max(3,Math.round(w/7));for(let i=0;i<=n;i++){const px=x+w*i/n,l=6+r()*14+Math.sin(t*1.2+i+seed)*1.2;c.lineTo(px-w/n*.3,y+l*.7);c.lineTo(px,y+l)}
  c.lineTo(x+w,y);c.closePath();c.fill();c.fillStyle=rgba(F(NT.mossL),.75);c.beginPath();c.moveTo(x,y);for(let i=0;i<=n;i++){const px=x+w*i/n;c.lineTo(px,y+2.5+r()*2)}c.lineTo(x+w,y-2);c.closePath();c.fill()}
// the portal on its card: centre x, ground y=0. Doorway 84 wide, 124 high
function drawPortal(c,cx,t,z){const F=col=>fogc(col,z),gl=cryptGlow(t);
  // the dark doorway with the light deep inside
  const dw=84,dh=124,top=-dh;c.save();c.beginPath();c.moveTo(cx-dw/2,0);c.lineTo(cx-dw/2,top+dw*.45);c.quadraticCurveTo(cx-dw/2,top,cx,top);c.quadraticCurveTo(cx+dw/2,top,cx+dw/2,top+dw*.45);c.lineTo(cx+dw/2,0);c.closePath();
  c.fillStyle=CRY.inside;c.fill();c.clip();const g=c.createRadialGradient(cx+4,-34,2,cx,-40,dw*.9);g.addColorStop(0,`rgba(170,255,110,${.75*gl})`);g.addColorStop(.25,`rgba(90,190,70,${.42*gl})`);g.addColorStop(.6,`rgba(20,60,25,${.3*gl})`);g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.fillRect(cx-dw,top,dw*2,dh);
  // steps going down into the light
  for(let i=0;i<5;i++){const y=-6-i*9,w=dw*(.95-i*.12);c.fillStyle=`rgba(${60+i*10},${90+i*20},${60+i*8},${.5-i*.07})`;c.fillRect(cx-w/2,y,w,3)}
  c.restore();
  // pillars of big blocks, the lintel with the carved moss sign
  const pw=34;for(const sd of[-1,1]){const px=sd<0?cx-dw/2-pw:cx+dw/2;let y=0;const hs=[38,34,36,30];for(let i=0;i<hs.length;i++){y-=hs[i];stoneBlock(c,px+(i%2?2:-2)*sd,y,pw,hs[i],F,(z|0)+i*7+(sd>0?50:0))}}
  const ly=-146,lw=dw+pw*2+30;stoneBlock(c,cx-lw/2,ly-36,lw,38,F,(z|0)+99,{lw:2.6});
  // the sign: a circle with a leaf, glowing faintly green
  c.strokeStyle=F('#1f2a22');c.lineWidth=3;c.beginPath();c.arc(cx,ly-17,11,0,FTAU);c.stroke();c.strokeStyle=`rgba(160,255,110,${.55*gl})`;c.lineWidth=1.6;c.beginPath();c.arc(cx,ly-17,11,0,FTAU);c.stroke();
  c.beginPath();c.moveTo(cx,ly-25);c.quadraticCurveTo(cx+8,ly-17,cx,ly-9);c.quadraticCurveTo(cx-8,ly-17,cx,ly-25);c.moveTo(cx,ly-23);c.lineTo(cx,ly-10);c.stroke();glo(c,'150,255,90',cx,ly-17,26,.25*gl);
  // moss and roots over the top
  mossDrape(c,cx-lw/2-4,ly-36,lw+8,F,t,31);
  c.strokeStyle=F('#1a1510');c.lineWidth=2.2;for(let i=0;i<5;i++){const x=cx-lw/2+18+i*lw/5.2,l=14+((i*37)%22);c.beginPath();c.moveTo(x,ly-30);c.bezierCurveTo(x+4,ly-14,x-6,ly-4+l*.3,x+2,ly+l*.6);c.stroke()}
  // the light spilling out on the stones next to the door
  glo(c,'120,230,80',cx,-50,dw*1.25,.22*gl,dw*.9)}
// the hill around the portal (a card just behind it)
function drawHill(c,cx,t,z,w,h){const F=col=>fogc(col,z),r=frng(9);
  const edge=k=>{const x=cx-w/2+w*k;let y;if(k<.5){const u=k/.5;y=10+(-h-10)*(1-Math.pow(1-u,2.2))}else{const u=(k-.5)/.5;y=-h+(h+10)*Math.pow(u,2.2)}return[x,y]};
  c.fillStyle=F('#0c1711');c.beginPath();c.moveTo(cx-w/2,12);for(let i=0;i<=90;i++){const q=edge(i/90);c.lineTo(q[0],q[1])}c.lineTo(cx+w/2,12);c.closePath();c.fill();
  // darker clumps of bushes on the slope
  c.fillStyle=F('#09130d');for(let i=0;i<9;i++){const k=.12+r()*.76,q=edge(k);c.beginPath();c.ellipse(q[0],q[1]+h*(.12+r()*.3),18+r()*30,9+r()*14,0,0,FTAU);c.fill()}
  // the grass on top catches the moon: a ragged edge, then a few lit blades
  c.fillStyle=F('#1d3a25');c.beginPath();for(let i=0;i<=90;i++){const q=edge(i/90);c.lineTo(q[0],q[1]+5)}for(let i=90;i>=0;i--){const q=edge(i/90),tip=3+(Math.sin(i*2.7)*.5+.5)*7;c.lineTo(q[0]+(i%2?2:-1),q[1]-(i%2?tip:1))}c.closePath();c.fill();
  c.strokeStyle=rgba(F(NT.grassL),.7);c.lineWidth=1.1;c.beginPath();for(let i=0;i<=90;i+=2){const q=edge(i/90),tip=3+(Math.sin(i*2.7)*.5+.5)*7;c.moveTo(q[0],q[1]);c.lineTo(q[0]+2,q[1]-tip)}c.stroke()}
// glowing mushrooms (the green light of the moss world)
function drawShrooms(c,x,n,t,seed,sz){const r=frng(seed);sz=sz||1;for(let i=0;i<n;i++){const ox=x+(r()-.5)*22*sz,h=(4+r()*7)*sz,cw=(3+r()*3)*sz,pulse=.7+.3*Math.sin(t*2+i+seed);
    c.strokeStyle='#cfe9c0';c.lineWidth=1.3*sz;c.beginPath();c.moveTo(ox,0);c.lineTo(ox,-h);c.stroke();c.fillStyle='#7ff0a8';c.beginPath();c.ellipse(ox,-h,cw,cw*.6,0,Math.PI,FTAU);c.fill();
    glo(c,'120,255,170',ox,-h,cw*4,.35*pulse)}}

// ---------- the forest sets (one per group of shots, each laid out for its camera)
// cfg: seed, trees [[x, z, h, w, opts]], scatter: {n, x0, x1, z0, z1, keep(x,z)}, path: [[x, z], ...], moon: [x, y, r] (screen),
// line: far treelines [[z, h, seed]], tufts/ferns [[x, z, h, ...]], flies, mist [[z, x, y, w, h, a, speed]], fore: blurred near shapes,
// portal: {x, z} (the crypt), rays: moonlight through the leaves
function forestSet(cfg){const r=frng(cfg.seed),T=[];
  for(const q of cfg.trees||[])T.push(mkTree(q[0],q[1],q[2],q[3],(cfg.seed*31+T.length*17)|0,q[4]));
  if(cfg.scatter){const S=cfg.scatter;let tries=0;while(T.length<(cfg.trees||[]).length+S.n&&tries++<S.n*20){const x=flp(S.x0,S.x1,r()),z=flp(S.z0,S.z1,Math.pow(r(),S.pw||1.3));if(S.keep&&!S.keep(x,z))continue;
      if(T.some(o=>Math.hypot(o.x-x,(o.z-z)*.6)<o.w*2.2+12))continue;const big=(z<300?1:1.3)*(cfg.hMul||1);T.push(mkTree(x,z,flp(330,620,r())*big,flp(18,34,r())*(z<200?1:1.2),(cfg.seed*97+T.length*13)|0))}}
  const lit=cfg.litter||mkLitter(cfg.seed+3,cfg.nLitter||260,cfg.lx0||-500,cfg.lx1||500,cfg.lz0||-40,cfg.lz1||700,[[NT.mossD,NT.moss],['#1a1e1c','#2c3330'],['#2a2418','#4a4030'],['#11201a',null]],1.5,6);
  const flies=mkFlies(cfg.seed+5,cfg.flies||16,cfg.fx0||-200,cfg.fx1||200,-60,-6,cfg.fz0||30,cfg.fz1||600);
  return{cfg,T,
    sky(t,sh){drawSky(X,sh,t,{moon:cfg.moon});drawGround(X,NT.ground);
      if(cfg.path){X.save();if(gpoly(X,cfg.path.map(q=>[q[0]*1.25,q[1]]))){X.globalAlpha=.45;X.fillStyle=groundGrad(X,NT.path);X.fill()}X.restore();
        if(gpoly(X,cfg.path)){X.fillStyle=groundGrad(X,NT.path);X.fill()}
        // the moonlit middle of the path
        if(gpoly(X,cfg.path.map(q=>[q[0]*.45+(cfg.pathMid||0),q[1]]))){X.globalAlpha=.35;X.fillStyle=groundGrad(X,NT.pathL);X.fill();X.globalAlpha=1}}
      drawLitter(X,lit,t);if(cfg.sky)cfg.sky(t,sh)},
    items(t,sh,lt){const out=[];
      for(const tr of T)out.push({z:tr.z,c:(c,s)=>drawTree(c,tr,s,t)});
      for(const[z,h,seed] of cfg.line||[])out.push({z,c:(c,s)=>drawTreeline(c,seed,-z*1.4,z*1.4,h,fogc(NT.leaf,z,.92))});
      for(const[x,z,h,n] of cfg.tufts||[])out.push({z,c:(c,s)=>drawTuft(c,x,h,h*.9,n||6,fogc(NT.grass,z),fogc(NT.grassL,z),t,(x*7+z)|0)});
      for(const[x,z,h] of cfg.ferns||[])out.push({z,c:(c,s)=>drawFern(c,x,h,fogc(NT.grass,z),fogc(NT.grassL,z),t,(x*3+z)|0)});
      for(const[x,z,n,sz] of cfg.shrooms||[])out.push({z,c:(c,s)=>drawShrooms(c,x,n,t,(x+z)|0,sz)});
      flyItems(flies,t,out);
      for(const m of cfg.mist||[])mistItem(m[0],m[1],m[2],m[3],m[4],m[5],t,m[6]||1,out);
      if(cfg.portal){const P0=cfg.portal;out.push({z:P0.z+40,c:(c,s)=>drawHill(c,P0.x,t,P0.z+40,P0.hw||560,P0.hh||250)});out.push({z:P0.z,c:(c,s)=>drawPortal(c,P0.x,t,P0.z)})}
      // near things out of focus: big dark trunks, leaves and ferns passing in front of the lens
      for(const f of cfg.fore||[])out.push({z:f.z,c:(c,s)=>{const col=f.col||'#05080c';
        if(f.k==='trunk'){const tr=f.T||(f.T=mkTree(f.x,f.z,f.h||500,f.w||26,f.seed||7,{lean:f.lean||0}));drawTree(c,tr,s,t,{blur:f.blur,col})}
        else if(f.k==='fern')drawFern(c,f.x,f.h,col,col,t,f.seed||3,f.blur);
        else if(f.k==='tuft')drawTuft(c,f.x,f.h,f.h*.9,f.n||7,col,col,t,f.seed||5,f.blur);
        else if(f.k==='leaves')drawSpray(c,f,t,col)}});
      if(cfg.items)cfg.items(t,sh,lt,out);
      return out},
    over(t,sh){if(cfg.rays)moonRays(X,t,cfg.rays,cfg.rayX||.55,cfg.rayAng||.25)}}}

const keepPath=(hw)=>(x,z)=>Math.abs(x)>hw+20;
SETS.bosco1=forestSet({seed:11,moon:[.72,.2,15],rays:.9,rayX:.42,hMul:.8,
  // the crane: near trunks framing the view, a clearing where the hero crosses the path, the forest behind
  trees:[[-150,70,560,34],[178,95,600,38],[-300,180,520,30],[320,210,560,32],[-95,330,480,24],[260,360,540,28]],
  scatter:{n:46,x0:-1300,x1:1300,z0:260,z1:2300,keep:(x,z)=>!(z>380&&z<640&&Math.abs(x)<330)&&!(z<280)},
  path:[[-1200,486],[1200,506],[1200,548],[-1200,532]],pathMid:0,
  line:[[2600,520,3],[3600,640,4]],nLitter:300,lx0:-600,lx1:600,lz0:200,lz1:900,
  tufts:[[-60,500,9,6],[40,560,8,5],[130,470,9,6],[-180,560,10,7],[220,540,9,6]],ferns:[[-120,470,14],[90,575,13],[-250,520,15]],
  shrooms:[[-40,478,4,1],[160,566,3,1]],flies:22,fx0:-300,fx1:300,fz0:250,fz1:800,
  mist:[[420,0,-12,520,26,.22,1.2],[640,-200,-18,700,34,.18,.8],[900,150,-22,900,40,.2,.6],[1400,0,-30,1300,60,.18,.5]],
  fore:[{k:'leaves',z:26,x:-60,y:-560,w:120,h:40,r:16,n:16,blur:3,seed:4,col:'#07111a'},{k:'leaves',z:34,x:66,y:-420,w:130,h:36,r:17,n:16,blur:2.5,seed:8,dir:-1,col:'#07111a'},{k:'leaves',z:20,x:20,y:-300,w:100,h:30,r:14,n:14,blur:4,seed:12,col:'#060e16'}]});
SETS.bosco2=forestSet({seed:23,moon:[.8,.1,13],rays:.6,rayX:.5,
  // the tracking shot: the path runs across, the hero walks along it; near trunks pass in front of the lens
  trees:[[-120,120,520,30],[60,180,560,34],[190,140,500,26],[-260,260,560,32]],
  scatter:{n:40,x0:-900,x1:900,z0:90,z1:1800},
  path:[[-900,-16],[900,-12],[900,18],[-900,14]],line:[[2400,480,6],[3400,600,7]],lx0:-200,lx1:200,lz0:-20,lz1:400,nLitter:340,
  tufts:[[-50,22,10,7],[-12,30,9,6],[20,26,11,7],[-80,40,10,6],[55,44,9,6]],ferns:[[-35,60,16],[40,70,15],[-90,90,18]],shrooms:[[8,32,4,1.1]],flies:14,fx0:-120,fx1:120,fz0:40,fz1:400,
  mist:[[90,-60,-10,260,18,.16,1],[260,40,-14,420,26,.18,.8],[600,0,-24,800,40,.18,.6]],
  fore:[{k:'trunk',z:-30,x:-22,h:520,w:3.2,blur:5,seed:41},{k:'trunk',z:-28,x:6,h:520,w:2.6,blur:5,seed:43},{k:'fern',z:-24,x:-14,h:12,blur:5,seed:9},{k:'tuft',z:-22,x:2,h:9,blur:4,seed:2}]});
SETS.bosco3=forestSet({seed:37,moon:[.6,.13,16],rays:.8,rayX:.36,rayAng:.15,
  // the path comes toward the camera; the hero walks on it, the moon behind him
  trees:[[-70,60,520,26],[82,90,560,30],[-120,170,540,28],[140,220,600,32],[-60,330,480,22],[90,420,500,24]],
  scatter:{n:44,x0:-900,x1:900,z0:120,z1:2200,keep:keepPath(55)},
  path:[[-26,-80],[26,-80],[30,300],[18,800],[10,1600],[-10,1600],[-18,800],[-30,300]],line:[[2600,520,8],[3600,640,9]],lx0:-160,lx1:160,lz0:-30,lz1:500,nLitter:320,
  tufts:[[-34,30,10,7],[36,48,11,6],[-40,80,10,6],[38,120,9,6]],ferns:[[-52,40,18],[56,64,17],[-60,140,18]],shrooms:[[-30,55,4,1.1],[32,96,3,1]],flies:16,fx0:-120,fx1:120,fz0:40,fz1:500,
  mist:[[120,0,-10,200,16,.16,1],[300,20,-16,400,26,.18,.8],[700,0,-24,700,40,.2,.6]]});
SETS.cripta1=forestSet({seed:51,moon:[.82,.12,14],rays:.5,rayX:.6,
  // over the shoulder: the crypt appears between the trees, far away
  trees:[[-150,140,560,32],[110,120,520,28],[-60,250,500,26],[200,300,560,30],[-220,380,540,30]],
  scatter:{n:30,x0:-1000,x1:1000,z0:160,z1:2000,keep:(x,z)=>!(Math.abs(x-40)<240&&z>300&&z<560)&&Math.abs(x)>40},
  path:[[-24,-40],[24,-40],[50,200],[64,430],[16,430],[-6,200]],portal:{x:40,z:470,hw:600,hh:260},line:[[2600,520,10]],lx0:-200,lx1:260,lz0:-20,lz1:500,nLitter:300,
  tufts:[[-32,40,10,7],[46,90,10,6],[80,300,12,7],[0,320,10,6]],ferns:[[-56,70,16],[90,180,18]],shrooms:[[-10,440,5,1.3],[96,446,4,1.2],[60,300,3,1]],flies:18,fx0:-160,fx1:120,fz0:60,fz1:380,
  mist:[[200,20,-10,300,20,.16,1],[420,40,-14,500,30,.2,.7]]});
SETS.cripta2=forestSet({seed:63,moon:[.78,.09,13],rays:.4,rayX:.62,
  // low on the ground in front of the crypt: stones, moss and mushrooms at the door, the hill all round
  trees:[[-170,110,520,30],[180,130,560,32],[-300,220,540,30],[320,260,560,30]],scatter:{n:18,x0:-900,x1:900,z0:200,z1:1500,keep:(x,z)=>Math.abs(x)>260},
  path:[[-30,-80],[30,-80],[44,146],[-44,146]],portal:{x:0,z:150,hw:640,hh:280},line:[[2400,520,12]],lx0:-120,lx1:120,lz0:-60,lz1:150,nLitter:420,
  tufts:[[-40,0,8,7],[42,-14,9,7],[-58,40,10,6],[60,60,9,6],[-50,100,10,7],[52,120,9,6]],ferns:[[-70,70,16],[74,90,16]],shrooms:[[-46,140,5,1.2],[48,142,4,1.2],[-30,30,3,.9],[34,10,3,.9]],flies:12,fx0:-120,fx1:120,fz0:-20,fz1:150,
  mist:[[146,0,-6,90,10,.28,1.4],[120,0,-4,140,12,.2,1]],
  fore:[{k:'tuft',z:-48,x:-10,h:7,n:8,blur:4,seed:21},{k:'tuft',z:-52,x:9,h:6,n:7,blur:4,seed:22},{k:'fern',z:-44,x:-20,h:9,blur:4,seed:23}]});
