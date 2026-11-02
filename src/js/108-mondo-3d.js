// =====================================================================
// 108. IL MONDO PIÙ RICCO (tripla A, anteprima a parte; Denis, 2 novembre: «rendilo tripla A»).
// Nella visuale in terza e prima persona (105):
// - l'erba vera: fili 3D dove il terreno è erba (letto dalla foto del terreno; mai sui solidi, nelle case, sui portici e sulle pedane), col
//   colore del terreno sotto, scuri alla radice e chiari in punta, qualche stelo alto e secco; il vento li muove a ondate che corrono sul prato,
//   con le raffiche, e l'eroe e gli zombie li piegano e li schiacciano dove passano (più scuri ai loro piedi). A pezzi di 48 unità intorno a
//   dove si guarda, fatti due alla volta; verso il bordo si abbassano fino a sparire, così non si vede dove finiscono;
// - i coni di luce sotto i lampioni e le lanterne appese: la luce che si vede nella nebbia, più forte vicino al vetro, che trema con la
//   fiamma e respira con la nebbia che ci passa, e il pulviscolo che ci galleggia dentro;
// - le nuvole che passano sulla luna: banchi scuri che scorrono piano nel cielo e coprono le stelle e la luna, col bordo d'argento quando le
//   passano davanti.
// LOWFX: niente erba, coni e pulviscolo, meno nuvole; telefono lento: erba più rada e più vicina, meno pulviscolo. Fuori da src/ordine.txt:
// solo nell'anteprima della visuale (anteprime/mk_visuale.py), dopo 107; senza questo file 105 disegna come prima.
// =====================================================================
const MW={on:true,ch:new Map(),gm:null,bad:false,nB:0,nC:0,nL:0,nM:0,nCl:0,made:0,lamps:null,cl:null,ms:0};
const MWC=48;// the side of a piece of grass
// ------------------------------------------------------------------ the grass
// one blade: five points (two at the root, two halfway, the tip), aB = (half width with its side, height along the blade 0..1, its own
// random number, its height); the root is the same for all five. The wind is a wave that runs over the field along its direction (uWind.xy,
// uWind.z how strong), plus a little flutter; uPush the hero and the nearest zombies (x, y, reach, strength): the blades bend away from them and
// lie down; uCen the centre of the grass and how far it goes (z): towards the edge the blades sink into the ground
const MWVS_GRASS=`attribute vec3 aP;attribute vec4 aB;attribute vec4 aC;uniform mat4 uVP;uniform float uT;uniform vec4 uPush[8];uniform vec3 uWind;uniform vec3 uCen;
varying vec3 vW;varying vec4 vC;varying float vH;varying float vSh;
void main(){float side=aB.x,h=aB.y,ph=aB.z,H=aB.w,a=ph*6.2832;vec2 wd=vec2(cos(a),sin(a)),ld=vec2(-wd.y,wd.x);
 float s=1.-smoothstep(uCen.z*.6,uCen.z,distance(aP.xy,uCen.xy));H*=s;
 vec2 off=vec2(0.);float sh=0.;
 for(int i=0;i<8;i++){vec4 q=uPush[i];if(q.z<=0.)continue;vec2 d=aP.xy-q.xy;float L=length(d)+.001;float k=1.-smoothstep(q.z*.3,q.z,L);off+=d/L*(k*q.w);sh=max(sh,k);}
 float ol=min(1.,length(off)),wv=sin(dot(aP.xy,uWind.xy)*.045-uT*2.2+ph*1.7);
 vec2 sway=uWind.xy*(uWind.z*(.45+.55*wv))+ld*(sin(uT*4.3+ph*37.)*.05);
 vec2 tip=(sway*(1.-ol)+off*1.25+ld*(ph-.5)*.5)*(h*h*H);float bl=length(tip)/max(H,.01);
 vec3 p=vec3(aP.xy+wd*(side*(1.-h)*mix(.5,1.,s))+tip,aP.z+H*h*(1.-.5*ol)*(1.-.3*min(1.,bl*bl)));
 vW=p;vC=aC;vH=h;vSh=sh;gl_Position=uVP*vec4(p,1.);}`;
// dark at the root, light at the tip (the tall dry stems straw-coloured at the top), darker at the feet of who stands in it; the night, the
// lanterns and the mist as on everything else
const MWFS_GRASS=`precision highp float;varying vec3 vW;varying vec4 vC;varying float vH;varying float vSh;${V3SHADE}
void main(){vec3 c=vC.rgb*mix(.5,1.38,vH)+vec3(.03,.045,.01)*vH*vH;c=max(vec3(0.),mix(vec3(dot(c,vec3(.3,.59,.11))),c,1.18))+vec3(.02,.035,.05)*smoothstep(.55,1.,vH);
 if(vC.a>.5)c=mix(c,vec3(.6,.54,.33)*(.55+max(max(vC.r,vC.g),vC.b)),smoothstep(.5,1.,vH)*.7);
 c*=1.-.42*vSh*(1.-vH*.6);gl_FragColor=vec4(shade(c,vW,vec3(0.),1.,0.),1.);}`;
// the ground's photo, small (a pixel every two units): how much grass there is (from its colour, as the ground's shader decides it) and the
// grass's colour under each blade. Remade if the ground is remade
function mwMap(){const W=ZM.W,GR=W.ground;if(!GR)return null;if(MW.gm&&MW.gm.src===GR)return MW.gm;for(const c of MW.ch.values())mwFree(c);MW.ch.clear();
  const K=.5,w=Math.ceil(W.w*K),h=Math.ceil(W.h*K),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(e){}
  for(const t of GR.tiles||[{c:GR,x:0,y:0,w:W.w,h:W.h}])g.drawImage(t.c,t.x*K,t.y*K,t.w*K,t.h*K);
  const d=g.getImageData(0,0,w,h).data;c.width=c.height=0;const gr=new Uint8Array(w*h);
  for(let i=0,j=0;i<w*h;i++,j+=4){const x=(d[j+1]-Math.max(d[j],d[j+2]))/255;gr[i]=Math.round(255*Math.max(0,Math.min(1,(x-.012)/.058)))}
  MW.gm={src:GR,K,w,h,g:gr,d};return MW.gm}
// one piece: its blades (the same ones every time: the seed is the piece), in a buffer, and their order from far to near for the four ways the
// camera can look (the grass writes no depth, so that the dark outline of the last pass does not ink every blade: the far blades first)
function mwChunk(ci,cj){const W=ZM.W,M=mwMap(),gl=V3.gl;if(!M)return{n:0};const dens=V3.low?.1:.2,sp=1/Math.sqrt(dens),x0=ci*MWC,y0=cj*MWC,HS=ZM.houses||[];
  let sd=((Math.imul(ci+512,73856093)^Math.imul(cj+512,19349663))>>>0)%2147483646+1;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;const B=[];
  for(let y=y0;y<y0+MWC-1e-6;y+=sp)for(let x=x0;x<x0+MWC-1e-6;x+=sp){const bx=x+r()*sp,by=y+r()*sp,q0=r(),q1=r(),q2=r(),q3=r(),q4=r(),q5=r(),q6=r();if(bx<3||by<3||bx>W.w-3||by>W.h-3)continue;
    const mi=Math.min(M.w-1,Math.floor(bx*M.K)),mj=Math.min(M.h-1,Math.floor(by*M.K)),k=mj*M.w+mi,gv=M.g[k]/255;if(gv<=.25||q0>smoothstep01((gv-.25)/.6))continue;
    if(ZM.hit(bx,by,1.6)||(ZM.heightAt&&ZM.heightAt(bx,by)>0))continue;let inH=false;
    for(const hs of HS){if(bx>hs.x-3&&bx<hs.x+hs.w+3&&by>hs.y-3&&by<hs.y+hs.d+3){inH=true;break}const p=hs.porch;if(p&&bx>p[0]-2&&bx<p[2]+2&&by>p[1]-2&&by<p[3]+2){inH=true;break}}if(inH)continue;
    const tall=q1<.07,cl=.8+q2*.42,j=k*4;B.push([bx,by,(tall?12+q3*6:5.5+q3*6.5)*(.8+.4*gv),.42+q4*.45,q5,Math.min(1,M.d[j]/255*cl),Math.min(1,M.d[j+1]/255*cl*(.94+q6*.12)),Math.min(1,M.d[j+2]/255*cl),tall])}
  const n=B.length;if(!n)return{n:0,x:x0+MWC/2,y:y0+MWC/2};
  const buf=new ArrayBuffer(n*5*32),F=new Float32Array(buf),U=new Uint8Array(buf),SH=[[-1,0],[1,0],[-1,.5],[1,.5],[0,1]];
  B.forEach((b,i)=>{for(let v=0;v<5;v++){const o=(i*5+v)*8;F[o]=b[0];F[o+1]=b[1];F[o+2]=0;F[o+3]=SH[v][0]*b[3];F[o+4]=SH[v][1];F[o+5]=b[4];F[o+6]=b[2];const u=(o+7)*4;U[u]=b[5]*255;U[u+1]=b[6]*255;U[u+2]=b[7]*255;U[u+3]=b[8]?255:0}});
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,buf,gl.STATIC_DRAW);
  const ib=[[1,0],[0,1],[-1,0],[0,-1]].map(([dx,dy])=>{const ord=B.map((b,i)=>[b[0]*dx+b[1]*dy,i]).sort((a,c)=>c[0]-a[0]),I=new Uint16Array(n*9);
    ord.forEach(([,i],k)=>{const v=i*5;I.set([v,v+1,v+3,v,v+3,v+2,v+2,v+3,v+4],k*9)});const b=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,I,gl.STATIC_DRAW);return b});
  return{n,vb,ib,x:x0+MWC/2,y:y0+MWC/2,used:0}}
function mwFree(c){const gl=V3.gl;if(!c||!c.vb)return;gl.deleteBuffer(c.vb);for(const b of c.ib)gl.deleteBuffer(b);c.vb=null}
function mwProgs(){if(MW.bad)return false;if(MW.pg)return true;const gl=V3.gl;
  try{MW.pg=v3Prog(gl,MWVS_GRASS,MWFS_GRASS,['aP','aB','aC']);MW.pc=v3Prog(gl,MWVS_CONE,MWFS_CONE,['aP']);MW.pk=v3Prog(gl,V3VS_BB,MWFS_CLOUD,['aP','aQ','aT','aC','aS'])}catch(e){v3Err(e);MW.bad=true;return false}
  // the unit cone of the light: 28 slices round, rings closer near the glass
  const RG0=[0,.08,.2,.36,.56,.78,1],N=28,A=[];for(let k=0;k<RG0.length-1;k++)for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2,v0=RG0[k],v1=RG0[k+1];A.push(a0,v0,a1,v0,a1,v1,a0,v0,a1,v1,a0,v1)}
  MW.cb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,MW.cb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(A),gl.STATIC_DRAW);MW.cn=A.length/2;MW.ct=mwCloudTex(gl);return true}
MW.grass=function(dt){MW.nB=MW.nC=0;if(LOWFX||!V3.built||!mwProgs())return;const gl=V3.gl,W=ZM.W,h=W.hero,e=V3.eye,F=V3.F3,t=W.t||0;if(!mwMap())return;
  const fl=Math.hypot(F[0],F[1])||1,fx=F[0]/fl,fy=F[1]/fl,pr=V3.mode==='prima',R=(pr?150:210)*(V3.low?.72:1),cx=pr?e[0]+fx*55:h.x+fx*28,cy=pr?e[1]+fy*55:h.y+fy*28;
  // the pieces round there that the camera sees
  const want=[];for(let j=Math.floor((cy-R)/MWC);j<=Math.floor((cy+R)/MWC);j++)for(let i=Math.floor((cx-R)/MWC);i<=Math.floor((cx+R)/MWC);i++){const mx=(i+.5)*MWC,my=(j+.5)*MWC;
    const dc=Math.hypot(mx-cx,my-cy);if(mx<-MWC||my<-MWC||mx>W.w+MWC||my>W.h+MWC||dc>R+MWC*.71||!v3Seen(mx,my,5,MWC*.75))continue;want.push([i,j,Math.hypot(mx-e[0],my-e[1]),dc])}
  // (made nearest to where we look first, a few milliseconds a frame: all at once when the match starts on a fast phone)
  want.sort((a,b)=>a[3]-b[3]);let made=0,miss=0;const list=[],tb=performance.now();V3.mwF=(V3.mwF||0)+1;
  for(const[i,j,d] of want){const k=i+','+j;let c=MW.ch.get(k);if(!c){if(made>=1&&performance.now()-tb>(V3.low?2:4)){miss++;continue}c=mwChunk(i,j);MW.ch.set(k,c);made++;MW.made++}c.used=V3.mwF;if(c.n)list.push([c,d])}MW.miss=miss;
  // too many in memory: away the ones not seen for longest
  if(MW.ch.size>150){const old=[...MW.ch.entries()].sort((a,b)=>a[1].used-b[1].used).slice(0,MW.ch.size-130);for(const[k,c] of old){mwFree(c);MW.ch.delete(k)}}
  if(!list.length)return;list.sort((a,b)=>b[1]-a[1]);
  const P=MW.pg,u=P.u;gl.useProgram(P.p);v3Uni(P);
  // the wind: it turns slowly, it gusts
  const wa=.7+.35*Math.sin(t*.043),ws=.2+.22*(.5+.5*Math.sin(t*.31))*(.5+.5*Math.sin(t*.17+1.3));gl.uniform3f(u.uWind,Math.cos(wa),Math.sin(wa),ws);gl.uniform3f(u.uCen,cx,cy,R);
  // who bends the grass: the hero and the seven zombies nearest to where we look
  const PU=MW.pu||(MW.pu=new Float32Array(32));PU.fill(0);PU.set([h.x,h.y,17,1.1],0);let np=1;
  const zs=[];for(const z of W.Z||[]){if(z.rise!=null&&z.rise<.4)continue;const d=Math.hypot(z.x-cx,z.y-cy);if(d<R)zs.push([d,z])}zs.sort((a,b)=>a[0]-b[0]);
  for(const[,z] of zs){if(np>=8)break;PU.set([z.x,z.y,15*(z.sc||1),z.die?1.4:1],np*4);np++}gl.uniform4fv(u.uPush,PU);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
  for(let i=3;i<8;i++)gl.disableVertexAttribArray(i);for(let i=0;i<3;i++)gl.enableVertexAttribArray(i);
  const o=Math.abs(fx)>Math.abs(fy)?(fx>0?0:2):(fy>0?1:3);
  for(const[c] of list){gl.bindBuffer(gl.ARRAY_BUFFER,c.vb);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(1,4,gl.FLOAT,false,32,12);gl.vertexAttribPointer(2,4,gl.UNSIGNED_BYTE,true,32,28);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,c.ib[o]);gl.drawElements(gl.TRIANGLES,c.n*9,gl.UNSIGNED_SHORT,0);MW.nB+=c.n;MW.nC++}
  for(let i=1;i<3;i++)gl.disableVertexAttribArray(i);gl.depthMask(true)};
// ------------------------------------------------------------------ the cones of light under the lamps, and the dust in them
// aP: the angle round and how far down (0 at the glass, 1 on the ground); uA the glass, uS (radius at the glass, at the ground, height). Seen
// through, a cone is brightest across its middle and fades at its sides; strongest a little under the glass, gone on the ground (no line where
// it touches); the mist's noise moves through it
const MWVS_CONE=`attribute vec2 aP;uniform mat4 uVP;uniform vec3 uA;uniform vec3 uS;varying vec3 vW;varying vec3 vN;varying float vV;
void main(){float th=aP.x,v=aP.y,r=mix(uS.x,uS.y,v);vec3 p=uA+vec3(cos(th)*r,sin(th)*r,-uS.z*v);vW=p;vV=v;vN=normalize(vec3(cos(th),sin(th),(uS.y-uS.x)/uS.z));gl_Position=uVP*vec4(p,1.);}`;
const MWFS_CONE=`precision highp float;uniform vec3 uEye;uniform vec3 uCol;uniform float uT;uniform sampler2D uNoi;uniform vec3 uFogP;varying vec3 vW;varying vec3 vN;varying float vV;
void main(){vec3 V=normalize(uEye-vW);float k=pow(abs(dot(normalize(vN),V)),1.6),a=smoothstep(0.,.16,vV)*(1.-vV*.62)*(1.-smoothstep(.74,1.,vV));
 float n=texture2D(uNoi,vec2(vW.x+vW.z*.6,vW.y-vW.z*.35)/64.+uT*vec2(.011,-.007)).r*.65+texture2D(uNoi,vec2(vW.x-vW.z*.4,vW.y+vW.z*.5)/23.-uT*vec2(.02,.013)).r*.35;
 float d=distance(vW,uEye),f=clamp((d-uFogP.x)/uFogP.y,0.,1.)*uFogP.z;
 gl_FragColor=vec4(uCol*(k*a*(.35+1.25*n)*(1.-f*.85)*smoothstep(5.,40.,d)),1.);}`;
// the lamps that hang high outside (the glass of the lamp posts, of the lanterns on the walls, of the machines): not the ones indoors
function mwLamps(){if(MW.lamps&&MW.lamps.n===ZM.flames.length)return MW.lamps.l;const l=[];ZM.flames.forEach((f,i)=>{if(f.glass&&!f.indoor&&(f.z||0)>=24)l.push({f,id:i+1,c:v3rgb('rgb('+(f.rgb||'255,200,120')+')')})});
  MW.lamps={n:ZM.flames.length,l};return l}
const mwH=a=>{const s=Math.sin(a*12.9898+78.233)*43758.5453;return s-Math.floor(s)};
MW.shafts=function(){MW.nL=MW.nM=0;if(LOWFX||!V3.built||!mwProgs())return;const gl=V3.gl,W=ZM.W,e=V3.eye,t=W.t||0,far=V3.fogP[0]+V3.fogP[1],G=V3.glowA,lit=[];
  for(const L of mwLamps()){const f=L.f;if(f.off)continue;if(f.house&&(f.house.a>.6||(f.lvl!=null&&(f.lvl?(f.house.up||0)<.5:(f.house.up||0)>.5))))continue;const z=f.z||10,H=z-1;
    if(Math.hypot(f.x-e[0],f.y-e[1])>far||!v3Seen(f.x,f.y,z*.5,H*.75))continue;lit.push([L,z,H,.85+.15*Math.sin(t*11+f.x)*Math.sin(t*7.3+f.y)])}
  if(!lit.length)return;const P=MW.pc,u=P.u;gl.useProgram(P.p);v3Uni(P);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);gl.disable(gl.CULL_FACE);
  gl.bindBuffer(gl.ARRAY_BUFFER,MW.cb);for(let i=1;i<8;i++)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const I=(V3.low?.34:.42)*(MW.kI||1);for(const[L,z,H,fl] of lit){const c=L.c,k=I*fl*(L.f.a!=null?Math.min(1.4,L.f.a/.45):1);gl.uniform3f(u.uA,L.f.x,L.f.y,z+1);gl.uniform3f(u.uS,2.2,Math.min(70,H*.62),H);
    gl.uniform3f(u.uCol,c[0]/255*k,c[1]/255*k,c[2]/255*k);gl.drawArrays(gl.TRIANGLES,0,MW.cn);MW.nL++}
  // the dust floating in the light: slow, turning round, twinkling, only near the camera
  if(G){const NM=V3.low?7:15;for(const[L,z,H,fl] of lit){const f=L.f;if(Math.hypot(f.x-e[0],f.y-e[1],z*.5-e[2])>170)continue;const c=L.c,r1=Math.min(70,H*.62);
      for(let i=0;i<NM;i++){const s=L.id*31.7+i*7.13,a0=mwH(s),b0=mwH(s+1.7),c0=mwH(s+3.1),d0=mwH(s+5.3),v=.12+.8*(.5+.5*Math.sin(t*.09*(.6+c0)+b0*6.28)),th=a0*6.28+t*.07*(c0-.5),rr=(2.2+(r1-2.2)*v)*(.15+.75*d0),
        x=f.x+Math.cos(th)*rr,y=f.y+Math.sin(th)*rr,zz=z+1-H*v,tw=.45+.55*Math.sin(t*(1.1+c0*2.2)+a0*20),b=Math.max(0,tw)*(1-v*.55)*.7*fl,sz=.5+.4*c0;
        if(b<.03)continue;v3Q(x,y,zz,-sz,-sz,sz,sz,G.u0,G.v0,G.u1,G.v1,c[0]/255*b,c[1]/255*b,c[2]/255*b,1);MW.nM++}}
    if(V3N)v3QFlush(V3.pA,V3A.pages[G.p].tex,V3.U3,0,true)}
  V3N=0;gl.depthMask(true);gl.disable(gl.BLEND)};
// ------------------------------------------------------------------ the clouds over the moon
// four cloud shapes in one picture (256 × 64 each): in alpha how thick, in red the thin edge (the silver lining when the moon is behind), in
// green the light on top
function mwCloudTex(gl){const S=256,R=64,d=new Uint8Array(S*S*4);let sd=99;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const NG=24,ng=[];for(let i=0;i<NG*NG;i++)ng.push(r());const vn=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),tx=x-ix,ty=y-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),at=(i,j)=>ng[((j%NG+NG)%NG)*NG+((i%NG+NG)%NG)];
    return(at(ix,iy)*(1-sx)+at(ix+1,iy)*sx)*(1-sy)+(at(ix,iy+1)*(1-sx)+at(ix+1,iy+1)*sx)*sy};
  // (each cloud: a wide flat base of long ellipses, a few rounder puffs on top, eaten at the edges by two sizes of noise; soft edges)
  for(let v=0;v<4;v++){const bl=[],n=7+Math.floor(r()*4);for(let i=0;i<n;i++){const t=(i+.5)/n,rr=(9+11*Math.sin(t*Math.PI))*(.8+r()*.4);bl.push([34+188*t+(r()-.5)*12,50-rr*.3+(r()-.5)*4,rr,1.7+r()*.6])}
    const np=3+Math.floor(r()*3);for(let i=0;i<np;i++){const rr=9+r()*9;bl.push([76+r()*104,40-r()*10,rr,1.05+r()*.3])}const ox=r()*40,oy=r()*40;
    for(let j=0;j<R;j++)for(let i=0;i<S;i++){let den=0;for(const[bx,by,br,ex] of bl){const dx=(i-bx)/(br*ex),dy=(j-by)/br,q=dx*dx+dy*dy;if(q<1)den+=(1-q)*(1-q)}
      den*=smoothstep01((62-j)/10)*smoothstep01(Math.min(i-3,S-4-i)/18)*(.66+.62*vn(i/13+ox,j/8+oy)+.32*(vn(i/4.5+oy,j/3.5+ox)-.5));
      const a=smoothstep01((den-.1)/.75),rim=4*a*(1-a),top=Math.min(1,Math.max(0,(58-j)/46))*.7+.3*a,o=((v*R+j)*S+i)*4;
      d[o]=Math.round(rim*255);d[o+1]=Math.round(top*255);d[o+2]=0;d[o+3]=Math.round(a*255)}}
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,d);
  gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}
function smoothstep01(x){x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
// a cloud: dark blue, lighter on top; its thin edges light up silver when it is near the moon (vC.r: how near), most on the side that faces
// it (uMS: the moon on the screen, in pixels, and how far its light reaches there), vC.a how thick it is
const MWFS_CLOUD=`precision mediump float;uniform sampler2D uTex;uniform vec3 uMS;varying vec2 vT;varying vec4 vC;
void main(){vec4 t=texture2D(uTex,vT);float a=t.a*vC.a;if(a<.004)discard;float dm=distance(gl_FragCoord.xy,uMS.xy)/uMS.z,k=exp(-dm*dm);
 vec3 c=mix(vec3(.026,.033,.066),vec3(.07,.082,.13),t.g)+vec3(.46,.5,.66)*(t.r*vC.r*(.12+.88*k))+vec3(.06,.07,.1)*(t.g*vC.r*k);gl_FragColor=vec4(c,a);}`;
// the clouds all round the sky (always the same ones), drifting east slowly; three of them at the moon's height, a third of the sky apart: one
// is just reaching the moon when the night begins
function mwClouds(){if(MW.cl)return MW.cl;let sd=4711;const r=()=>(sd=(sd*16807)%2147483647)/2147483647,M=ZM.MOON||[-.96,.27],ml=Math.hypot(M[0],M[1],.55),maz=Math.atan2(M[1],M[0]),mel=Math.asin(.55/ml),D=Math.PI/180,o=[];
  for(let i=0;i<24;i++)o.push({az:r()*Math.PI*2,el:(14+r()*28)*D,w:(11+r()*9)*D,v:Math.floor(r()*4),a:.5+r()*.4,sp:.8+r()*.4});
  for(let k=0;k<3;k++)o.push({az:maz-15*D+k*Math.PI*2/3,el:mel+2.2*D+(r()-.5)*1.5*D,w:(14+r()*4)*D,v:k%4,a:.85,sp:1});
  MW.cl={o,md:[M[0]/ml,M[1]/ml,.55/ml]};return MW.cl}
MW.sky=function(){MW.nCl=0;if(!V3.built||!mwProgs())return;const gl=V3.gl,e=V3.eye,F=V3.F3,t=ZM.W.t||0,C=mwClouds(),md=C.md,Dk=1200,om=.5*Math.PI/180;
  gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);const lst=LOWFX?C.o.slice(-12):C.o;
  {const q=v3P(e[0]+md[0]*1250,e[1]+md[1]*1250,e[2]+md[2]*1250);gl.useProgram(MW.pk.p);gl.uniform3f(MW.pk.u.uMS,q?q[0]*V3.cw/V3.W:-1e5,q?(V3.H-q[1])*V3.ch/V3.H:-1e5,V3.ch*.3)}
  for(const c of lst){const az=c.az+t*om*c.sp,ce=Math.cos(c.el),d=[ce*Math.cos(az),ce*Math.sin(az),Math.sin(c.el)];if(d[0]*F[0]+d[1]*F[1]+d[2]*F[2]<-.25)continue;
    const rl=Math.hypot(d[1],d[0])||1,R=[d[1]/rl,-d[0]/rl,0],U=[R[1]*d[2]-R[2]*d[1],R[2]*d[0]-R[0]*d[2],R[0]*d[1]-R[1]*d[0]],hw=Math.tan(c.w)*Dk,hh=hw*.3,P=[e[0]+d[0]*Dk,e[1]+d[1]*Dk,e[2]+d[2]*Dk];
    const cn=(sx,sy)=>[P[0]+R[0]*hw*sx+U[0]*hh*sy,P[1]+R[1]*hw*sx+U[1]*hh*sy,P[2]+R[2]*hw*sx+U[2]*hh*sy],m=d[0]*md[0]+d[1]*md[1]+d[2]*md[2],near=Math.pow(smoothstep01((m-.9)/.098),1.5),
      al=c.a*smoothstep01((c.el*180/Math.PI-10)/9),v0=(c.v*64+.5)/256,v1=((c.v+1)*64-.5)/256;
    v3QW([cn(-1,-1),cn(1,-1),cn(1,1),cn(-1,1)],0,v0,1,v1,near,0,0,al);MW.nCl++}
  if(V3N)v3QFlush(MW.pk,MW.ct,V3.U3,0);V3N=0;gl.disable(gl.BLEND);gl.depthMask(true);gl.enable(gl.DEPTH_TEST)};
V3.mw=MW;
