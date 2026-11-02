// =====================================================================
// 105. LA VISUALE IN TERZA E PRIMA PERSONA (anteprima a parte, 2 novembre; Denis: «fai un'anteprima a parte facendo vedere come sarebbe la
// modalità zombie se la telecamera fosse tipo in terza persona e prima persona»).
// Nella partita zombie il bottone «Visuale» in alto a destra (o il tasto C) passa tra tre visuali: «Dall'alto» (quella di oggi), «Terza
// persona» (la telecamera dietro le spalle dell'eroe) e «Prima persona» (con gli occhi dell'eroe e l'arma in mano). La partita è la stessa
// (ondate, armi, abilità, Bara, barriere, cancelli): cambia solo come si vede. Il dito a destra gira la visuale come oggi (in su e in giù
// guarda in alto e in basso), la levetta a sinistra cammina rispetto a dove si guarda, si spara da soli dove si guarda (104).
// Come si disegna: la mappa vera, gli stessi pezzi 3D del motore (anteprime/zombie/motore.js), visti in prospettiva con WebGL (il disegno 3D
// del telefono): ogni faccia con la sua texture dipinta (tre toni, segni del materiale), raccolte in fogli grandi; i pannelli coi buchi
// (recinti, cancellate, finestre), i poligoni piatti, le aste come due listelli incrociati, le chiome come dischi dipinti che guardano la
// telecamera; i disegni a mano del motore (tronchi e rami, il mais, i dettagli) dipinti dalla parte da cui li si guarda e messi in piedi come
// cartoline (rifatti quando si gira), quelli piatti stesi a terra; il terreno cotto. La notte come nella vista dall'alto: tutto più scuro e
// blu tranne vicino alle luci e all'eroe; la nebbia con la distanza, più fitta nelle zone chiuse e ai bordi del mondo; il contorno scuro
// intorno a ogni cosa (dove la profondità salta), come i contorni dei disegni. Zombie, eroe e Bara sono i loro disegni dipinti, girati dalla
// parte giusta e inclinati come li vede la telecamera; le fiamme e le luci si accendono sopra.
// Fuori da src/ordine.txt: va solo nella sua anteprima (anteprime/mk_visuale.py). Nel motore della mappa c'è un aggancio che senza questo
// file non fa niente (W.v3: se è acceso il mondo lo disegna lui, il motore poi disegna levette e vignetta sopra). Tutto rispetta LOWFX.
// =====================================================================
const V3={on:false,mode:'alto',ok:null,err:0,built:false,busy:false,low:false,slow:0,W:1,H:1,cw:1,ch:1,frame:0,vp:null,eye:[0,0,0],th:0,pitch:0,
  fovy:1,near:3,far:1900,muz:null,kick:0,flash:0,lastShots:0,vmMuz:null,heroBox:null,boxes:{}};
const V3NAME={alto:"Dall'alto",terza:'Terza persona',prima:'Prima persona'},V3NEXT={alto:'terza',terza:'prima',prima:'alto'};
function v3Err(e){if(V3.err++<6)console.error(e)}
const v3cl=(v,a,b)=>v<a?a:v>b?b:v;
// ------------------------------------------------------------------ matrici (colonne, come le vuole WebGL)
function v3Persp(fy,a,n,f){const t=1/Math.tan(fy/2),nf=1/(n-f);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,0,2*f*n*nf,0])}
// (il mondo della mappa ha x a est, y a sud e z in su: visto davvero è «mancino», quindi la destra della telecamera è z × su e il su è
// destra × z; così guardando a nord l'est sta a destra come nella vista dall'alto, e le facce viste da fuori girano in senso antiorario)
function v3Look(e,c,u){let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2],l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;
  let xx=zy*u[2]-zz*u[1],xy=zz*u[0]-zx*u[2],xz=zx*u[1]-zy*u[0];l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;const yx=xy*zz-xz*zy,yy=xz*zx-xx*zz,yz=xx*zy-xy*zx;
  return new Float32Array([xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*e[0]+xy*e[1]+xz*e[2]),-(yx*e[0]+yy*e[1]+yz*e[2]),-(zx*e[0]+zy*e[1]+zz*e[2]),1])}
function v3Mul(a,b){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
// un punto del mondo sullo schermo (px CSS) e la sua distanza davanti alla telecamera; null se è dietro
function v3P(x,y,z){const m=V3.vp,cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13],cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<V3.near)return null;return[(cx/cw+1)*.5*V3.W,(1-cy/cw)*.5*V3.H,cw]}
// quanti px CSS fa un'unità del mondo a quella distanza
const v3K=d=>V3.H*.5/Math.tan(V3.fovy/2)/Math.max(d,1);
// i colori del motore ('#rgb', '#rrggbb', 'rgb(…)', 'rgba(…)') in [r,g,b,a] da 0 a 255
const V3COL={};
function v3rgb(c){if(!c)return[128,128,128,255];if(V3COL[c])return V3COL[c];let r=128,g=128,b=128,a=1;
  if(c[0]==='#'){const n=c.length<6?c.slice(1).split('').map(x=>x+x).join(''):c.slice(1,7),v=parseInt(n,16);r=v>>16&255;g=v>>8&255;b=v&255}
  else{const m=c.match(/[\d.]+/g);if(m){r=+m[0];g=+m[1];b=+m[2];if(m[3]!=null)a=+m[3]}}return V3COL[c]=[r,g,b,Math.round(a*255)]}
const V3KROT={s:'e',e:'n',n:'w',w:'s',r:'re',re:'rn',rn:'rw',rw:'r'},v3KeyR=(k,q)=>{for(let i=0;i<q;i++)k=V3KROT[k]||k;return k};
const v3Hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>1)%2147483646+1};// come hashS del motore
// ------------------------------------------------------------------ i programmi
// la notte, le luci e la nebbia: la stessa ricetta della vista dall'alto (drawDark, drawLights) fatta per ogni punto del mondo
const V3SHADE=`uniform vec3 uEye;uniform vec4 uL[12];uniform vec4 uLC[12];uniform vec3 uFog;uniform vec3 uDark;uniform float uDarkA;uniform vec3 uFogP;
uniform sampler2D uZone;uniform vec3 uMap;
vec3 shade(vec3 col,vec3 P,float glowK){float lit=0.;vec3 add=vec3(0.);
 for(int i=0;i<12;i++){vec4 L=uL[i];if(L.w<=0.)continue;vec3 d=P-L.xyz;d.z*=.7;float k=clamp(1.-length(d)/L.w,0.,1.);k=k*k*(3.-2.*k);lit=max(lit,k*uLC[i].a);add+=uLC[i].rgb*(k*k*uLC[i].a);}
 col=mix(col,uDark,uDarkA*(1.-clamp(lit,0.,1.)));col+=add*.42*glowK;
 float d=distance(P,uEye);float f=clamp((d-uFogP.x)/uFogP.y,0.,1.);f=f*f*(3.-2.*f)*uFogP.z;
 float zc=texture2D(uZone,clamp(P.xy/uMap.xy,0.,1.)).r;vec2 e=min(P.xy,uMap.xy-P.xy);float ed=1.-clamp(min(e.x,e.y)/uMap.z,0.,1.);
 f=max(f,max(zc*.8,ed*.92));return mix(col,uFog,f);}`;
const V3VS_GEO=`attribute vec3 aP;attribute vec2 aT;attribute vec4 aC;uniform mat4 uVP;varying vec2 vT;varying vec4 vC;varying vec3 vW;
void main(){vT=aT;vC=aC;vW=aP;gl_Position=uVP*vec4(aP,1.);}`;
const V3FS_GEO=`precision highp float;uniform sampler2D uTex;uniform float uCut;varying vec2 vT;varying vec4 vC;varying vec3 vW;${V3SHADE}
void main(){vec4 t=texture2D(uTex,vT)*vC;if(t.a<uCut)discard;gl_FragColor=vec4(shade(t.rgb,vW,1.),1.);}`;
// i cartelli che guardano la telecamera: il punto d'appoggio + lo scarto lungo la destra (uR) e il su (uU) della telecamera
const V3VS_BB=`attribute vec3 aP;attribute vec2 aQ;attribute vec2 aT;attribute vec4 aC;uniform mat4 uVP;uniform vec3 uR;uniform vec3 uU;varying vec2 vT;varying vec4 vC;varying vec3 vW;
void main(){vec3 p=aP+uR*aQ.x+uU*aQ.y;vT=aT;vC=aC;vW=p;gl_Position=uVP*vec4(p,1.);}`;
const V3FS_BB=`precision highp float;uniform sampler2D uTex;uniform float uCut;uniform float uGlow;varying vec2 vT;varying vec4 vC;varying vec3 vW;${V3SHADE}
void main(){vec4 t=texture2D(uTex,vT);if(t.a<uCut)discard;t*=vC;gl_FragColor=vec4(shade(t.rgb,vW,uGlow),t.a);}`;
// le luci sommate (fiamme, aloni): niente notte, solo la nebbia che le spegne in lontananza
const V3FS_ADD=`precision highp float;uniform sampler2D uTex;uniform vec3 uEye;uniform vec3 uFogP;varying vec2 vT;varying vec4 vC;varying vec3 vW;
void main(){vec4 t=texture2D(uTex,vT)*vC;float d=distance(vW,uEye);float f=clamp((d-uFogP.x)/uFogP.y,0.,1.)*uFogP.z;gl_FragColor=vec4(t.rgb*t.a*(1.-f*.85),1.);}`;
// il passaggio finale: il contorno scuro dove la profondità salta (sulla cosa davanti) e la vignetta
const V3VS_POST=`attribute vec2 aP;varying vec2 vU;void main(){vU=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
const V3FS_POST=`precision highp float;uniform sampler2D uC;uniform sampler2D uD;uniform vec2 uPx;uniform vec2 uNF;uniform float uInk;uniform vec3 uFogP;varying vec2 vU;
float lin(float d){float z=d*2.-1.;return 2.*uNF.x*uNF.y/(uNF.y+uNF.x-z*(uNF.y-uNF.x));}
void main(){vec3 c=texture2D(uC,vU).rgb;float d0=lin(texture2D(uD,vU).r);
 float m=max(max(lin(texture2D(uD,vU+vec2(uPx.x,0.)).r),lin(texture2D(uD,vU-vec2(uPx.x,0.)).r)),max(lin(texture2D(uD,vU+vec2(0.,uPx.y)).r),lin(texture2D(uD,vU-vec2(0.,uPx.y)).r)));
 float fg=clamp((d0-uFogP.x)/uFogP.y,0.,1.);float e=smoothstep(.035*d0+2.,.07*d0+6.,m-d0)*uInk*(1.-fg*fg*(3.-2.*fg))*step(d0,uNF.y*.97);c=mix(c,vec3(.055,.045,.04),e*.9);
 vec2 q=vU-.5;float v=smoothstep(.36,.9,length(q*vec2(1.,1.15)));c*=1.-.5*v;gl_FragColor=vec4(c,1.);}`;
function v3Sh(gl,t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)+'\n'+src.slice(0,200));return s}
function v3Prog(gl,vs,fs,attrs){const p=gl.createProgram();gl.attachShader(p,v3Sh(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,v3Sh(gl,gl.FRAGMENT_SHADER,fs));attrs.forEach((a,i)=>gl.bindAttribLocation(p,i,a));
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<n;i++){const inf=gl.getActiveUniform(p,i);u[inf.name.replace(/\[0\]$/,'')]=gl.getUniformLocation(p,inf.name)}return{p,u,n:attrs.length}}
function v3Tex(gl,src,mip,w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  if(src)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const W0=src?src.width:w,H0=src?src.height:h,pot=v=>(v&(v-1))===0,ok=mip&&(V3.gl2||(pot(W0)&&pot(H0)));if(ok)gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,ok?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}
function v3Init(){if(V3.ok!==null)return V3.ok;V3.ok=false;
  const c=document.createElement('canvas');c.id='v3cv';c.style.pointerEvents='none';let gl=null;const o={antialias:false,alpha:false,depth:true,stencil:false,premultipliedAlpha:false,powerPreference:'high-performance'};
  try{gl=c.getContext('webgl2',o)}catch(e){}V3.gl2=!!gl;if(!gl)try{gl=c.getContext('webgl',o)||c.getContext('experimental-webgl',o)}catch(e){}if(!gl)return false;
  V3.cv=c;V3.gl=gl;V3.dext=V3.gl2?null:gl.getExtension('WEBGL_depth_texture');V3.post=V3.gl2||!!V3.dext;
  try{V3.pG=v3Prog(gl,V3VS_GEO,V3FS_GEO,['aP','aT','aC']);V3.pB=v3Prog(gl,V3VS_BB,V3FS_BB,['aP','aQ','aT','aC']);V3.pA=v3Prog(gl,V3VS_BB,V3FS_ADD,['aP','aQ','aT','aC']);
    if(V3.post)V3.pP=v3Prog(gl,V3VS_POST,V3FS_POST,['aP'])}catch(e){v3Err(e);return false}
  V3.qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,V3.qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  V3.db=gl.createBuffer();V3.dyn=new Float32Array(11*6*1200);
  c.addEventListener('webglcontextlost',e=>{e.preventDefault();V3.lost=true});
  V3.ok=true;return true}
// ------------------------------------------------------------------ i fogli delle texture (2048×2048): facce, pannelli, chiome, fiamme, il bianco
const V3A={S:2048,pages:[],byCv:new Map()};
function v3Page(){const c=document.createElement('canvas');c.width=c.height=V3A.S;V3A.pages.push({c,g:c.getContext('2d'),x:3,y:3,h:0,tex:null});return V3A.pages.length-1}
function v3Put(src,dw,dh,sx,sy,sw,sh){const S=V3A.S,pad=4;dw=Math.max(2,Math.round(dw));dh=Math.max(2,Math.round(dh));
  if(dw>S-12){dh=Math.max(2,Math.round(dh*(S-12)/dw));dw=S-12}if(dh>S-12){dw=Math.max(2,Math.round(dw*(S-12)/dh));dh=S-12}
  let pi=V3A.pages.length-1;if(pi<0)pi=v3Page();let P=V3A.pages[pi];if(P.x+dw+pad>S){P.x=pad;P.y+=P.h+pad;P.h=0}if(P.y+dh+pad>S){pi=v3Page();P=V3A.pages[pi]}
  const x=P.x,y=P.y;P.x+=dw+pad;P.h=Math.max(P.h,dh);sx=sx||0;sy=sy||0;sw=sw||src.width;sh=sh||src.height;
  P.g.drawImage(src,sx,sy,sw,sh,x-2,y-2,dw+4,dh+4);P.g.clearRect(x,y,dw,dh);P.g.drawImage(src,sx,sy,sw,sh,x,y,dw,dh);
  return{p:pi,u0:x/S,v0:y/S,u1:(x+dw)/S,v1:(y+dh)/S,x,y,w:dw,h:dh}}
// ------------------------------------------------------------------ la costruzione: una volta, dai pezzi dei prop
// G.pg[i]: i triangoli del foglio i (P posizioni, T coordinate nella texture, C colori) in pezzi {prop, tag, vis, s, n}; i pezzi dello stesso
// prop con la stessa parte della casa stanno di fila, così si accendono e si spengono insieme (prop nascosti, assi, ante, tetti)
const G3={pg:[],balls:[],fns:[],planes:[],plc:new Map(),ground:[],props:[],hg:null};
function v3Buf(pi){return G3.pg[pi]||(G3.pg[pi]={P:[],T:[],C:[],ch:[],cur:null,n:0})}
function v3Tri(pi,prop,tag,vis,a,b,c,ta,tb,tc,col){const B=v3Buf(pi);let ch=B.cur;if(!ch||ch.prop!==prop||ch.tag!==tag||ch.vis!==vis){ch={prop,tag,vis,s:B.n,n:0};B.ch.push(ch);B.cur=ch}
  B.P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);B.T.push(ta[0],ta[1],tb[0],tb[1],tc[0],tc[1]);for(let i=0;i<3;i++)B.C.push(col[0],col[1],col[2],col[3]);B.n+=3;ch.n+=3;
  const bb=prop._v3b;for(const q of[a,b,c]){if(q[0]<bb[0])bb[0]=q[0];if(q[1]<bb[1])bb[1]=q[1];if(q[2]<bb[2])bb[2]=q[2];if(q[0]>bb[3])bb[3]=q[0];if(q[1]>bb[4])bb[4]=q[1];if(q[2]>bb[5])bb[5]=q[2]}}
// la normale verso fuori di una faccia del motore (i suoi angoli girano al contrario della regola della mano destra)
function v3Nrm(c){const a=c[0],b=c[1],d=c[c.length-1],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[d[0]-a[0],d[1]-a[1],d[2]-a[2]],n=[-(u[1]*v[2]-u[2]*v[1]),-(u[2]*v[0]-u[0]*v[2]),-(u[0]*v[1]-u[1]*v[0])],l=Math.hypot(n[0],n[1],n[2])||1;return[n[0]/l,n[1]/l,n[2]/l]}
// un poligono 3D piatto in triangoli (anche concavo: a orecchie), nel suo piano
function v3Ears(P){const n=P.length;if(n<3)return[];if(n===3)return[[0,1,2]];const N=v3Nrm(P),ax=Math.abs(N[0])>Math.abs(N[1])?(Math.abs(N[0])>Math.abs(N[2])?0:2):(Math.abs(N[1])>Math.abs(N[2])?1:2),
    i0=ax===0?1:0,i1=ax===2?1:2,Q=P.map(p=>[p[i0],p[i1]]);let ar=0;for(let i=0;i<n;i++){const p=Q[i],q=Q[(i+1)%n];ar+=p[0]*q[1]-q[0]*p[1]}const sg=ar>0?1:-1,idx=[...Array(n).keys()],out=[];
  const cr=(a,b,c)=>((Q[b][0]-Q[a][0])*(Q[c][1]-Q[a][1])-(Q[b][1]-Q[a][1])*(Q[c][0]-Q[a][0]))*sg;
  const inT=(p,a,b,c)=>{const d1=(Q[b][0]-Q[a][0])*(p[1]-Q[a][1])-(Q[b][1]-Q[a][1])*(p[0]-Q[a][0]),d2=(Q[c][0]-Q[b][0])*(p[1]-Q[b][1])-(Q[c][1]-Q[b][1])*(p[0]-Q[b][0]),d3=(Q[a][0]-Q[c][0])*(p[1]-Q[c][1])-(Q[a][1]-Q[c][1])*(p[0]-Q[c][0]);return(d1*sg>=0)&&(d2*sg>=0)&&(d3*sg>=0)};
  let guard=0;while(idx.length>3&&guard++<500){let cut=false;for(let k=0;k<idx.length;k++){const a=idx[(k+idx.length-1)%idx.length],b=idx[k],c=idx[(k+1)%idx.length];if(cr(a,b,c)<=1e-9)continue;
      let ok=true;for(const j of idx)if(j!==a&&j!==b&&j!==c&&inT(Q[j],a,b,c)){ok=false;break}if(!ok)continue;out.push([a,b,c]);idx.splice(k,1);cut=true;break}if(!cut)break}
  if(idx.length>=3)for(let k=1;k<idx.length-1;k++)out.push([idx[0],idx[k],idx[k+1]]);return out}
// le facce col disegno in più (o.tex) lo prendono la prima volta che si vedono, come nel motore
function v3FaceTex(t,key){const tx=ZM.texture(t.mat,key,t.w,t.h,t.foot,t.texId);if(t.tex&&!tx._x){tx._x=1;const g=tx.getContext('2d'),sv=ctx,k=tx.width/Math.max(1,Math.round(t.w));ctx=g;ctx.save();ctx.setTransform(k,0,0,k,0,0);
    ZM.srand(v3Hash(tx._id+'|x'));try{t.tex(t.w,t.h,t.key)}catch(e){v3Err(e)}finally{ctx.restore();ctx=sv}}return tx}
function v3Region(cv,K){let A=V3A.byCv.get(cv);if(!A){A=v3Put(cv,cv.width*K,cv.height*K);V3A.byCv.set(cv,A)}return A}
// i punti che un disegno a mano tocca (la prova a vuoto, come quella del motore all'avvio)
let V3DUMMY=null;
function v3Dry(t){const rec=[],S2=(x,y,z)=>{if(Array.isArray(x)){z=x[2];y=x[1];x=x[0]}rec.push([x,y,z||0]);return[0,0]};if(!V3DUMMY)V3DUMMY=document.createElement('canvas').getContext('2d');
  const sv=ctx;ctx=V3DUMMY;ctx.save();try{t.f(S2,ctx)}catch(e){}finally{ctx.restore();ctx=sv}return rec}
function v3Build(){const W=ZM.W,K=V3.low?.75:.95,t0=performance.now();V3.tb={};
  const wc=document.createElement('canvas');wc.width=wc.height=8;const wg=wc.getContext('2d');wg.fillStyle='#fff';wg.fillRect(0,0,8,8);const WH=v3Put(wc,8,8);V3.white=[(WH.u0+WH.u1)/2,(WH.v0+WH.v1)/2];V3.whiteP=WH.p;
  const WT=[V3.white,V3.white,V3.white];
  for(const p of ZM.props){const R=p.rot,X=R?(q=>{const dx=q[0]-R.cx,dy=q[1]-R.cy;return[R.cx+dx*R.c-dy*R.s,R.cy+dx*R.s+dy*R.c,q[2]||0]}):(q=>[q[0],q[1],q[2]||0]);
    p._v3b=[1e9,1e9,1e9,-1e9,-1e9,-1e9];G3.props.push(p);const tall=!/^(tree|bush|cornRow|hay|grass)/.test(p.name||'');
    for(const t of p.parts){const tag=t.part||'',vis=t.vis||null,tq=performance.now();
      try{switch(t.k){
        case'face':{const c=t.c.map(X),al=Math.round(255*(t.alpha==null?1:t.alpha));
          if(t.col){const col=v3rgb(t.col);v3Tri(V3.whiteP,p,tag,vis,c[0],c[1],c[2],...WT,[col[0],col[1],col[2],al]);v3Tri(V3.whiteP,p,tag,vis,c[0],c[2],c[3],...WT,[col[0],col[1],col[2],al])}
          else{const tx=v3FaceTex(t,R?v3KeyR(t.key,R.q):t.key),A=v3Region(tx,K/2),C=[255,255,255,al];
            v3Tri(A.p,p,tag,vis,c[0],c[1],c[2],[A.u0,A.v1],[A.u1,A.v1],[A.u1,A.v0],C);v3Tri(A.p,p,tag,vis,c[0],c[2],c[3],[A.u0,A.v1],[A.u1,A.v0],[A.u0,A.v0],C)}
          if(tall&&tag!=='roof')v3HG(c);break}
        case'facepoly':{const c=t.c.map(X),m=ZM.MAT[t.mat]||ZM.MAT.stone,key=R?v3KeyR(t.key,R.q):t.key,col=v3rgb(t.col||ZM.tone(m,key));
          if(t.tex){const B=v3BakePoly(t,c,col);if(B){const tr=v3Ears(c);for(const[a,b,d] of tr)v3Tri(B.A.p,p,tag,vis,c[a],c[b],c[d],B.uv[a],B.uv[b],B.uv[d],[255,255,255,255]);if(tall&&tag!=='roof')v3HG(c);break}}
          for(const[a,b,d] of v3Ears(c))v3Tri(V3.whiteP,p,tag,vis,c[a],c[b],c[d],...WT,col);if(tall&&tag!=='roof')v3HG(c);break}
        case'poly':{const c=t.pts.map(X).map(q=>[q[0],q[1],q[2]<.6?q[2]+.25:q[2]]),col=v3rgb(t.col);for(const[a,b,d] of v3Ears(c)){v3Tri(V3.whiteP,p,tag,vis,c[a],c[b],c[d],...WT,col);v3Tri(V3.whiteP,p,tag,vis,c[a],c[d],c[b],...WT,col)}break}
        case'plane':{let c=t.c.map(X);if(t.host){const n=v3Nrm(t.host.c.map(X));c=c.map(q=>[q[0]+n[0]*.6,q[1]+n[1]*.6,q[2]+n[2]*.6])}
          // (the same picture once, except the windows, whose picture changes on its own with their planks)
          const dyn=/^win/.test(t.texId||''),pk=t.texId+'|'+Math.round(t.w)+'x'+Math.round(t.h),old=!dyn&&G3.plc.get(pk),pc=old?old.cv:v3PlaneCv(t),A=old?old.A:v3Put(pc,t.w*K,t.h*K);if(!dyn&&!old)G3.plc.set(pk,{cv:pc,A});
          const al=Math.round(255*(t.alpha==null?1:t.alpha)),C=[255,255,255,al];if(dyn)G3.planes.push({t,A,id:t.texId});
          const u0=A.u0,u1=A.u1;v3Tri(A.p,p,tag,vis,c[0],c[1],c[2],[u0,A.v1],[u1,A.v1],[u1,A.v0],C);v3Tri(A.p,p,tag,vis,c[0],c[2],c[3],[u0,A.v1],[u1,A.v0],[u0,A.v0],C);
          v3Tri(A.p,p,tag,vis,c[0],c[2],c[1],[u0,A.v1],[u1,A.v0],[u1,A.v1],C);v3Tri(A.p,p,tag,vis,c[0],c[3],c[2],[u0,A.v1],[u0,A.v0],[u1,A.v0],C);break}
        case'line':{const a=X(t.a),b=X(t.b),col=v3rgb(t.col),w=Math.max(.8,t.w||1)*.5,d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(d[0],d[1],d[2])||1;
          let p1=[-d[1],d[0],0],l1=Math.hypot(p1[0],p1[1]);if(l1<1e-3){p1=[1,0,0];l1=1}p1=[p1[0]/l1*w,p1[1]/l1*w,0];
          const p2=[(d[1]*p1[2]-d[2]*p1[1])/L,(d[2]*p1[0]-d[0]*p1[2])/L,(d[0]*p1[1]-d[1]*p1[0])/L];
          for(const q of[p1,p2]){const A0=[a[0]-q[0],a[1]-q[1],a[2]-q[2]],A1=[a[0]+q[0],a[1]+q[1],a[2]+q[2]],B0=[b[0]-q[0],b[1]-q[1],b[2]-q[2]],B1=[b[0]+q[0],b[1]+q[1],b[2]+q[2]];
            v3Tri(V3.whiteP,p,tag,vis,A0,A1,B1,...WT,col);v3Tri(V3.whiteP,p,tag,vis,A0,B1,B0,...WT,col);v3Tri(V3.whiteP,p,tag,vis,A0,B1,A1,...WT,col);v3Tri(V3.whiteP,p,tag,vis,A0,B0,B1,...WT,col)}break}
        case'ball':{const c=X(t.p),A=v3BallSprite(t,K);G3.balls.push({prop:p,tag,vis,x:c[0],y:c[1],z:c[2],r:t.r,sq:t.sq||1,A});const bb=p._v3b;bb[0]=Math.min(bb[0],c[0]-t.r);bb[1]=Math.min(bb[1],c[1]-t.r);bb[3]=Math.max(bb[3],c[0]+t.r);bb[4]=Math.max(bb[4],c[1]+t.r);bb[5]=Math.max(bb[5],c[2]+t.r);bb[2]=Math.min(bb[2],c[2]-t.r);break}
        case'fn':{const pts=v3Dry(t).map(X);if(!pts.length)break;let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);z0=Math.min(z0,q[2]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1]);z1=Math.max(z1,q[2])}
          if(x1-x0>900||y1-y0>900)break;const flat=z1-z0<5&&z1<14;G3.fns.push({t,prop:p,tag,vis,R,b:[x0,y0,z0,x1,y1,z1],flat,cx:(x0+x1)/2,cy:(y0+y1)/2,cap:{},dc:null});
          const bb=p._v3b;bb[0]=Math.min(bb[0],x0);bb[1]=Math.min(bb[1],y0);bb[2]=Math.min(bb[2],z0);bb[3]=Math.max(bb[3],x1);bb[4]=Math.max(bb[4],y1);bb[5]=Math.max(bb[5],z1);break}
      }}catch(e){v3Err(e)}V3.tb[t.k]=(V3.tb[t.k]||0)+performance.now()-tq}
    const bb=p._v3b;if(bb[0]>bb[3]){p._v3s=null;continue}p._v3s=[(bb[0]+bb[3])/2,(bb[1]+bb[4])/2,(bb[2]+bb[5])/2,Math.hypot(bb[3]-bb[0],bb[4]-bb[1],bb[5]-bb[2])/2+4]}
  V3.tb.props=performance.now()-t0;v3FlameSprites();
  const gl=V3.gl;for(const P of V3A.pages){P.tex=v3Tex(gl,P.c,true);P.c.width=P.c.height=0;P.g=null}V3.tb.pages=performance.now()-t0;
  for(const B of G3.pg){if(!B)continue;B.bp=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,B.bp);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(B.P),gl.STATIC_DRAW);
    B.bt=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,B.bt);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(B.T),gl.STATIC_DRAW);
    B.bc=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,B.bc);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(B.C),gl.STATIC_DRAW);B.P=B.T=B.C=null}
  // il terreno: i suoi pezzi cotti (foto da 1026 px per 684 unità), uno per texture
  v3Ground();
  // il velo delle zone chiuse: una casella ogni 16 unità, 1 dove la zona è chiusa
  G3.zw=Math.ceil(W.w/16);G3.zh=Math.ceil(W.h/16);G3.zbuf=new Uint8Array(G3.zw*G3.zh*4);G3.ztex=gl.createTexture();G3.zkey='';v3Zones(true);
  // gli atlanti che cambiano: le cartoline dei disegni a mano (restano finché c'è posto) e i personaggi (rifatti a ogni fotogramma)
  V3.imp={tex:v3Tex(gl,null,false,2048,1024),x:2,y:2,h:0,gen:1};V3.spr={tex:v3Tex(gl,null,false,2048,1024),x:2,y:2,h:0,gen:1,slots:new Map()};
  V3.built=true;V3.tBuild=performance.now()-t0;V3.tb.all=V3.tBuild}
// il terreno: i suoi pezzi cotti (foto da 1026 px per 684 unità), uno per texture; se la mappa non l'ha ancora cotto, si riprova dopo
function v3Ground(){const W=ZM.W,gl=V3.gl,GR=W.ground;if(G3.ground.length||!GR)return;const tl=GR.tiles||[{c:GR,x:0,y:0,w:W.w,h:W.h}],hc=document.createElement('canvas'),hg=hc.getContext('2d');// (at half size: seen in perspective it is plenty)
  for(const t of tl){hc.width=Math.ceil(t.c.width/2);hc.height=Math.ceil(t.c.height/2);hg.drawImage(t.c,0,0,hc.width,hc.height);G3.ground.push({x:t.x,y:t.y,w:t.w,h:t.h,tex:v3Tex(gl,hc,true)})}hc.width=hc.height=0;
  const gb=[];for(const t of G3.ground){gb.push(t.x,t.y,0,0,0, t.x+t.w,t.y,0,1,0, t.x+t.w,t.y+t.h,0,1,1, t.x,t.y,0,0,0, t.x+t.w,t.y+t.h,0,1,1, t.x,t.y+t.h,0,0,1)}
  G3.gbuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,G3.gbuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(gb),gl.STATIC_DRAW)}
// le texture dei pannelli (recinti, finestre, cancellate): come PLANES del motore, il disegno draw(w, h) a 2 pixel per unità
function v3PlaneCv(t){const c=document.createElement('canvas');c.width=Math.max(2,Math.ceil(t.w*2));c.height=Math.max(2,Math.ceil(t.h*2));const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(2,2);
  ZM.srand(v3Hash('P|'+t.texId));try{t.draw(t.w,t.h)}catch(e){v3Err(e)}finally{ctx=sv}return c}
// una faccia piatta col suo disegno (lapidi incise, insegne): dipinta nel suo piano (in orizzontale lungo la faccia, in verticale l'altezza)
function v3BakePoly(t,c,col){const N=v3Nrm(c);let U=[-N[1],N[0],0];const lu=Math.hypot(U[0],U[1]);if(lu<.2)U=[1,0,0];else U=[U[0]/lu,U[1]/lu,0];const Vv=[N[1]*U[2]-N[2]*U[1],N[2]*U[0]-N[0]*U[2],N[0]*U[1]-N[1]*U[0]];
  const V2=Vv[2]>0?Vv.map(v=>-v):Vv,o=c[0],q=c.map(p=>{const d=[p[0]-o[0],p[1]-o[1],p[2]-o[2]];return[d[0]*U[0]+d[1]*U[1]+d[2]*U[2],d[0]*V2[0]+d[1]*V2[1]+d[2]*V2[2]]});
  let u0=1e9,v0=1e9,u1=-1e9,v1=-1e9;for(const p of q){u0=Math.min(u0,p[0]);v0=Math.min(v0,p[1]);u1=Math.max(u1,p[0]);v1=Math.max(v1,p[1])}const w=u1-u0,h=v1-v0;if(w<1||h<1||w>600||h>600)return null;
  const k=3,cv=document.createElement('canvas');cv.width=Math.ceil(w*k)+2;cv.height=Math.ceil(h*k)+2;const g=cv.getContext('2d'),Q=q.map(p=>[(p[0]-u0)*k+1,(p[1]-v0)*k+1]),sv=ctx;
  g.fillStyle=`rgb(${col[0]},${col[1]},${col[2]})`;g.beginPath();Q.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.save();g.clip();ctx=g;
  ZM.srand(v3Hash('fp|'+t.c[0].join(',')+'|'+t.c.length));try{t.tex(Q,t.key)}catch(e){v3Err(e)}finally{ctx=sv;g.restore()}
  const A=v3Put(cv,cv.width/k*1.3,cv.height/k*1.3),uv=Q.map(p=>[A.u0+(A.u1-A.u0)*p[0]/cv.width,A.v0+(A.v1-A.v0)*p[1]/cv.height]);return{A,uv}}
// una chioma (o una zucca, un pomello): il disco a tre toni girato verso la luna, come drawBall del motore, dipinto una volta
function v3BallSprite(b,K){const r=b.r,M=ZM.MAT[b.mat]||ZM.MAT.leaf,k=Math.max(1.2,K*1.35),S=Math.ceil((r*2+8)*k),c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),sv=ctx;ctx=g;
  try{ctx.translate(S/2,S/2);ctx.scale(k,k);const LS=ZM.LS,shape=()=>{if(!b.lobes){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);return}ctx.beginPath();const n=b.lobes,am=b.amp||.14,N=n*6;
      for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,kk=Math.abs(Math.sin(a*n/2+(b.ph||0))),r2=r*(1-am*.5+am*kk),px=Math.cos(a)*r2,py=Math.sin(a)*r2;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()};
    shape();ctx.fillStyle=M.c[1];ctx.fill();ctx.save();ctx.clip();ctx.fillStyle=M.c[0];ctx.beginPath();ctx.ellipse(LS[0]*r*.25,LS[1]*r*.25,r*.88,r*.84,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=M.c[2];ctx.beginPath();ctx.ellipse(LS[0]*r*.45,LS[1]*r*.45,r*.42,r*.34,-.4,0,Math.PI*2);ctx.fill();if(b.tex){ZM.srand(v3Hash('b|'+b.sd));try{b.tex(r)}catch(e){}}ctx.restore();
    if(b.noOut!==true){ctx.strokeStyle=INK;ctx.lineWidth=b.ow||2.4;ctx.lineJoin='round';shape();ctx.stroke()}}catch(e){v3Err(e)}finally{ctx=sv}
  return v3Put(c,S,S)}
// le fiamme (lanterne, candele, torce, il fuoco): sei fotogrammi di una fiammella e un alone morbido, sommati sopra la scena
function v3FlameSprites(){const fr=[];for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=48;c.height=72;const g=c.getContext('2d'),t=i/6*Math.PI*2,sw=Math.sin(t)*2.2,h=1+.12*Math.sin(t*2);
    g.translate(24,64);const gr=g.createRadialGradient(0,-16*h,2,0,-14*h,30);gr.addColorStop(0,'rgba(255,248,210,1)');gr.addColorStop(.35,'rgba(255,190,80,.95)');gr.addColorStop(.7,'rgba(230,90,30,.6)');gr.addColorStop(1,'rgba(160,40,10,0)');
    g.fillStyle=gr;g.beginPath();g.moveTo(0,-54*h);g.quadraticCurveTo(15+sw,-22,11,-4);g.quadraticCurveTo(0,6,-11,-4);g.quadraticCurveTo(-15+sw,-22,sw*.5,-54*h);g.fill();fr.push(v3Put(c,48,72))}
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);V3.flameFr=fr;V3.glowA=v3Put(c,64,64);
  // la luna e le stelle del cielo
  const m=document.createElement('canvas');m.width=m.height=96;const mg=m.getContext('2d'),mr=mg.createRadialGradient(48,48,8,48,48,48);mr.addColorStop(0,'rgba(235,240,255,1)');mr.addColorStop(.32,'rgba(220,228,255,.95)');mr.addColorStop(.36,'rgba(160,180,230,.35)');mr.addColorStop(1,'rgba(120,140,210,0)');
  mg.fillStyle=mr;mg.fillRect(0,0,96,96);mg.fillStyle='rgba(150,160,190,.5)';for(const[x,y,r] of[[40,42,5],[55,52,3.5],[46,58,2.4]]){mg.beginPath();mg.arc(x,y,r,0,Math.PI*2);mg.fill()}V3.moonA=v3Put(m,96,96)}
// la griglia delle altezze (per la telecamera in terza persona: non entra nei muri) e le zone chiuse
function v3HG(c){const W=ZM.W,C=8;if(!G3.hg){G3.hgw=Math.ceil(W.w/C)+1;G3.hgh=Math.ceil(W.h/C)+1;G3.hg=new Float32Array(G3.hgw*G3.hgh)}let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,z1=0;
  for(const q of c){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1]);z1=Math.max(z1,q[2])}if(z1<34)return;
  for(let j=Math.max(0,Math.floor(y0/C));j<=Math.min(G3.hgh-1,Math.floor(y1/C));j++)for(let i=Math.max(0,Math.floor(x0/C));i<=Math.min(G3.hgw-1,Math.floor(x1/C));i++){const k=j*G3.hgw+i;if(G3.hg[k]<z1)G3.hg[k]=z1}}
const v3HAt=(x,y)=>{if(!G3.hg)return 0;const i=Math.floor(x/8),j=Math.floor(y/8);if(i<0||j<0||i>=G3.hgw||j>=G3.hgh)return 0;return G3.hg[j*G3.hgw+i]};
function v3Zones(force){const W=ZM.W;if(!W.zoneIdAt||!W.zoneOpen){if(force){G3.zbuf.fill(0);v3ZUp()}return}const key=JSON.stringify(W.zoneOpen);if(!force&&key===G3.zkey)return;G3.zkey=key;
  for(let j=0;j<G3.zh;j++)for(let i=0;i<G3.zw;i++){const id=W.zoneIdAt(i*16+8,j*16+8),v=id!=null&&W.zoneOpen[id]===false?255:0,k=(j*G3.zw+i)*4;G3.zbuf[k]=G3.zbuf[k+1]=G3.zbuf[k+2]=v;G3.zbuf[k+3]=255}v3ZUp()}
function v3ZUp(){const gl=V3.gl;gl.bindTexture(gl.TEXTURE_2D,G3.ztex);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,G3.zw,G3.zh,0,gl.RGBA,gl.UNSIGNED_BYTE,G3.zbuf);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
// ------------------------------------------------------------------ le cartoline: i disegni a mano dalla parte da cui li si guarda
// (16 direzioni; un'inclinazione bassa, 25°, così quello che sta a terra si schiaccia poco). Le cose piatte (buche, botole) si dipingono
// una volta dall'alto e si stendono a terra. Un posto nel loro atlante, finché c'è; pieno, si ricomincia
const V3EL=25*Math.PI/180,V3SP=Math.SQRT2*Math.sin(V3EL),V3CP=Math.SQRT2*Math.cos(V3EL),V3KI=1.6;
function v3ImpSlot(w,h){const I=V3.imp,S=2048,SH=1024,pad=3;if(w>S-8||h>SH-8)return null;if(I.x+w+pad>S){I.x=pad;I.y+=I.h+pad;I.h=0}if(I.y+h+pad>SH){I.x=I.y=2;I.h=0;I.gen++;for(const f of G3.fns){f.cap={};f.dc=null}}
  const x=I.x,y=I.y;I.x+=w+pad;I.h=Math.max(I.h,h);return{x,y,gen:I.gen}}
let V3CAPC=null;
function v3Capture(f,dir){const flat=f.flat,th=dir*Math.PI/8,c=Math.cos(-Math.PI/2-th),s=Math.sin(-Math.PI/2-th),b=f.b,R=f.R,cx=f.cx,cy=f.cy;
  // where a world point goes in the drawing (world units, from the middle): the engine's projection without the fold, at 25° (or from above)
  const pj=flat?((x,y,z)=>[x-cx,y-cy-(z||0)*.2]):((x,y,z)=>{const dx=x-cx,dy=y-cy;return[dx*c-dy*s,(dx*s+dy*c)*V3SP-(z||0)*V3CP]});
  const S2=(x,y,z)=>{if(Array.isArray(x)){z=x[2];y=x[1];x=x[0]}if(R){const dx=x-R.cx,dy=y-R.cy;x=R.cx+dx*R.c-dy*R.s;y=R.cy+dx*R.s+dy*R.c}return pj(x,y,z||0)};
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const X of[b[0],b[3]])for(const Y of[b[1],b[4]])for(const Z of[b[2],b[5]]){const q=pj(X,Y,Z);u0=Math.min(u0,q[0]);u1=Math.max(u1,q[0]);v0=Math.min(v0,q[1]);v1=Math.max(v1,q[1])}
  const M=7;u0-=M;u1+=M;v0-=M;v1+=M;const k=V3KI*(V3.low?.7:1),w=Math.ceil((u1-u0)*k),h=Math.ceil((v1-v0)*k);if(w<2||h<2||w>700||h>700)return null;
  const sl=v3ImpSlot(w,h);if(!sl)return null;if(!V3CAPC)V3CAPC=document.createElement('canvas');const cv=V3CAPC;cv.width=w;cv.height=h;const g=cv.getContext('2d');
  // the engine's camera like the drawing's, for the helpers that ask it (facing, across, the moon on the screen); then back as it was
  const C=ZM.CAM,keep={yaw:C.yaw,c:C.c,s:C.s,SP:C.SP,CP:C.CP,rot:C.rot},LS=ZM.LS,ls=[LS[0],LS[1]];
  if(!flat){C.yaw=-Math.PI/2-th;C.c=c;C.s=s;C.SP=V3SP;C.CP=V3CP;C.rot=true;const M0=ZM.MOON,u=M0[0]*c-M0[1]*s,v=(M0[0]*s+M0[1]*c)*V3SP,l=Math.hypot(u,v)||1;LS[0]=u/l;LS[1]=v/l}
  const sv=ctx;ctx=g;g.setTransform(k,0,0,k,-u0*k,-v0*k);ZM.srand(v3Hash('f|'+f.t.sd));try{f.t.f(S2,ctx)}catch(e){}finally{ctx=sv;Object.assign(C,keep);LS[0]=ls[0];LS[1]=ls[1]}
  const gl=V3.gl;gl.bindTexture(gl.TEXTURE_2D,V3.imp.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texSubImage2D(gl.TEXTURE_2D,0,sl.x,sl.y,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  const S=2048,SH=1024;return{gen:sl.gen,u0:sl.x/S,v0:sl.y/SH,u1:(sl.x+w)/S,v1:(sl.y+h)/SH,q:[u0,v0,u1,v1]}}
// ------------------------------------------------------------------ i personaggi: zombie, eroe, Bara, dipinti a ogni fotogramma come li vede la telecamera
// la scatola di un disegno (in unità della figura, dai piedi): misurata una volta per tipo, larga per tutte le mosse
function v3BoxOf(key,draw,anims){if(V3.boxes[key])return V3.boxes[key];const c=document.createElement('canvas');c.width=c.height=480;const g=c.getContext('2d'),sv=ctx;ctx=g;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  try{for(const an of anims||['idle','walk','attack','hit'])for(const fc of[0,1.6,3.1,4.7])for(const p of[0,.33,.66]){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,480,480);g.setTransform(1,0,0,1,240,360);try{draw(fc,an,p)}catch(e){}
    const d=g.getImageData(0,0,480,480).data;for(let y=0;y<480;y+=2)for(let x=0;x<480;x+=2)if(d[(y*480+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}}finally{ctx=sv}
  const B=x0>x1?[-46,-120,46,16]:[x0-240-10,(y0-360)*1.12-10,x1-240+10,y1-360+10];return V3.boxes[key]=B}
// la telecamera della figura come la vede la telecamera: CR.cam e RIGCAM (k, zk) dall'inclinazione e = da quanto in alto la si guarda
function v3Tilt(e){e=v3cl(e,.05,1.05);const SP=Math.SQRT2*Math.sin(e),CP=Math.SQRT2*Math.cos(e),kr=Math.sqrt(SP),zk=Math.pow(CP,.25);return{k:.55*kr,kr,zk}}
// un posto nell'atlante dei personaggi, suo finché ha la stessa misura: ridipinto solo quando cambia quello che mostra (key: mossa, posa a
// dodicesimi, verso, inclinazione, grandezza); pieno l'atlante, si ricomincia da capo
function v3SprSlot(w,h){const I=V3.spr,S=2048,SH=1024,pad=2;if(I.x+w+pad>S){I.x=pad;I.y+=I.h+pad;I.h=0}if(I.y+h+pad>SH){I.x=I.y=2;I.h=0;I.gen++;if(I.x+w+pad>S||I.y+h+pad>SH)return null}const x=I.x,y=I.y;I.x+=w+pad;I.h=Math.max(I.h,h);return{x,y,gen:I.gen}}
const V3SC={};// le tele dei personaggi, una per chi si disegna (riusate)
function v3Sprite(id,box,k,paint,key){const w=Math.max(2,Math.ceil((box[2]-box[0])*k)),h=Math.max(2,Math.ceil((box[3]-box[1])*k));if(w>1000||h>1000)return null;const I=V3.spr,S=2048,SH=1024;
  let sl=I.slots.get(id);if(sl&&(sl.gen!==I.gen||sl.w!==w||sl.h!==h))sl=null;if(sl&&key!=null&&sl.key===key)return sl.uv;
  if(!sl){const q=v3SprSlot(w,h);if(!q)return null;sl={x:q.x,y:q.y,w,h,gen:q.gen,key:null,uv:{u0:q.x/S,v0:q.y/SH,u1:(q.x+w)/S,v1:(q.y+h)/SH}};I.slots.set(id,sl)}sl.key=key;
  let cv=V3SC[id];if(!cv)cv=V3SC[id]=document.createElement('canvas');if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);
  g.setTransform(k,0,0,k,-box[0]*k,-box[1]*k);const sv=ctx;ctx=g;try{paint(g)}catch(e){v3Err(e)}finally{ctx=sv}
  const gl=V3.gl;gl.bindTexture(gl.TEXTURE_2D,I.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texSubImage2D(gl.TEXTURE_2D,0,sl.x,sl.y,gl.RGBA,gl.UNSIGNED_BYTE,cv);V3.nPaint=(V3.nPaint||0)+1;return sl.uv}
// ------------------------------------------------------------------ i quadratini dei cartelli (posizione, scarto, texture, colore)
let V3N=0;
function v3Q(x,y,z,qx0,qy0,qx1,qy1,u0,v0,u1,v1,r,g,b,a){const D=V3.dyn;if(V3N+66>D.length)return;const V=[[qx0,qy0,u0,v1],[qx1,qy0,u1,v1],[qx1,qy1,u1,v0],[qx0,qy0,u0,v1],[qx1,qy1,u1,v0],[qx0,qy1,u0,v0]];
  for(const v of V){D[V3N++]=x;D[V3N++]=y;D[V3N++]=z;D[V3N++]=v[0];D[V3N++]=v[1];D[V3N++]=v[2];D[V3N++]=v[3];D[V3N++]=r;D[V3N++]=g;D[V3N++]=b;D[V3N++]=a}}
function v3QFlush(prog,tex,uU,cut,add){const n=V3N/11;if(!n)return;const gl=V3.gl,P=prog;gl.useProgram(P.p);v3Uni(P);gl.uniform3fv(P.u.uU,uU);gl.uniform3fv(P.u.uR,V3.R3);if(P.u.uCut)gl.uniform1f(P.u.uCut,cut);if(P.u.uGlow)gl.uniform1f(P.u.uGlow,.6);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(P.u.uTex,0);gl.bindBuffer(gl.ARRAY_BUFFER,V3.db);gl.bufferData(gl.ARRAY_BUFFER,V3.dyn.subarray(0,V3N),gl.DYNAMIC_DRAW);
  const st=44;gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,st,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,st,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,st,20);
  gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,st,28);gl.drawArrays(gl.TRIANGLES,0,n);gl.disableVertexAttribArray(3);gl.disableVertexAttribArray(2);V3N=0}
// le cose comuni a tutti i programmi: telecamera, luci, nebbia, notte, zone
function v3Uni(P){const gl=V3.gl,u=P.u;gl.uniformMatrix4fv(u.uVP,false,V3.vp);if(u.uEye)gl.uniform3fv(u.uEye,V3.eye);if(u.uL){gl.uniform4fv(u.uL,V3.uL);gl.uniform4fv(u.uLC,V3.uLC)}
  if(u.uFog)gl.uniform3fv(u.uFog,V3.fogC);if(u.uDark){gl.uniform3fv(u.uDark,[10/255,14/255,34/255]);gl.uniform1f(u.uDarkA,.46)}if(u.uFogP)gl.uniform3fv(u.uFogP,V3.fogP);
  if(u.uZone){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,G3.ztex);gl.uniform1i(u.uZone,1);gl.uniform3fv(u.uMap,[ZM.W.w,ZM.W.h,46]);gl.activeTexture(gl.TEXTURE0)}}
// ------------------------------------------------------------------ la telecamera
function v3Camera(dt,Wp,Hp){const W=ZM.W,h=W.hero,C=ZM.CAM,th=-Math.PI/2-C.yaw,fx=Math.cos(th),fy=Math.sin(th),rx=-fy,ry=fx,el=C.el*180/Math.PI,hz=(h.zh||0);
  V3.th=th;V3.R3=[rx,ry,0];const asp=Wp/Hp;let eye,at,up=[0,0,1];
  if(V3.mode==='prima'){const pit=(12-(el-35)*47/27)*Math.PI/180,bob=h.moving&&!h.dead?Math.sin((h.walk||0)*1)*1.4:0,dead=h.dead||h.fall>0?Math.min(1,(h.fall||1)):0;
    V3.pitch=pit;eye=[h.x-fx*2,h.y-fy*2,hz+47+bob-dead*30];at=[eye[0]+fx*Math.cos(pit)*100,eye[1]+fy*Math.cos(pit)*100,eye[2]+Math.sin(pit)*100];V3.fovy=Math.min(80,2*Math.atan(Math.tan(95/2*Math.PI/180)/asp)*180/Math.PI)*Math.PI/180;V3.near=2.5}
  else{const phi=v3cl(13+(el-35)*1.25,8,50)*Math.PI/180,D=150,head=[h.x,h.y,hz+42],sh=17;
    let want=[head[0]-fx*D*Math.cos(phi)+rx*sh,head[1]-fy*D*Math.cos(phi)+ry*sh,head[2]+D*Math.sin(phi)];
    // the camera doesn't go into walls or through roofs: it comes forward to just before the first tall thing in between
    let kk=1;for(let i=1;i<=18;i++){const t=i/18,x=head[0]+(want[0]-head[0])*t,y=head[1]+(want[1]-head[1])*t,z=head[2]+(want[2]-head[2])*t;if(v3HAt(x,y)>z-4){kk=Math.max(.16,(i-1.5)/18);break}}
    V3.camK=V3.camK==null?kk:kk<V3.camK?kk:V3.camK+(kk-V3.camK)*Math.min(1,dt*3);const k=V3.camK;
    eye=[head[0]+(want[0]-head[0])*k,head[1]+(want[1]-head[1])*k,head[2]+(want[2]-head[2])*k];at=[h.x+fx*80+rx*sh*.55,h.y+fy*80+ry*sh*.55,hz+30];
    V3.fovy=Math.min(68,2*Math.atan(Math.tan(88/2*Math.PI/180)/asp)*180/Math.PI)*Math.PI/180;V3.near=3}
  V3.eye=eye;V3.far=V3.mode==='prima'?1500:1700;const view=v3Look(eye,at,up);V3.vp=v3Mul(v3Persp(V3.fovy,asp,V3.near,V3.far),view);
  const f=[at[0]-eye[0],at[1]-eye[1],at[2]-eye[2]],fl=Math.hypot(f[0],f[1],f[2]);V3.F3=[f[0]/fl,f[1]/fl,f[2]/fl];
  // the camera's own up (for the round things that face it all round)
  const R=V3.R3,F=V3.F3;V3.U3=[R[1]*F[2]-R[2]*F[1],R[2]*F[0]-R[0]*F[2],R[0]*F[1]-R[1]*F[0]];if(V3.U3[2]<0)V3.U3=V3.U3.map(v=>-v);
  V3.fogP=V3.mode==='prima'?[150,560,.97]:[230,640,.95];V3.fogC=[16/255,19/255,31/255]}
// in vista (approssimato): davanti alla telecamera, dentro il cono del campo visivo allargato, entro la nebbia
function v3Seen(x,y,z,r){const e=V3.eye,dx=x-e[0],dy=y-e[1],dz=z-e[2],F=V3.F3,d=dx*F[0]+dy*F[1]+dz*F[2];if(d<-r)return false;const D=Math.hypot(dx,dy,dz);if(D-r>V3.fogP[0]+V3.fogP[1]*1.05)return false;
  const half=Math.max(V3.fovy,V3.fovy*V3.W/V3.H)*.5+.35;return D<r||d>=Math.cos(half)*D-r}
// ------------------------------------------------------------------ le luci: le 11 più vicine alla telecamera più quella dell'eroe
function v3Lights(){const W=ZM.W,h=W.hero,e=V3.eye,L=[];for(const l of ZM.lights){if(l.off)continue;if(l.house&&(l.house.a>.6||(l.lvl!=null&&(l.lvl?(l.house.up||0)<.5:(l.house.up||0)>.5))))continue;
    const d=Math.hypot(l.x-e[0],l.y-e[1]);if(d>V3.fogP[0]+V3.fogP[1]+l.r)continue;L.push([d,l])}L.sort((a,b)=>a[0]-b[0]);
  const uL=V3.uL||(V3.uL=new Float32Array(48)),uC=V3.uLC||(V3.uLC=new Float32Array(48));uL.fill(0);uC.fill(0);let n=0;const t=W.t||0,max=V3.low?6:11;
  const put=(x,y,z,r,rgb,a)=>{const c=v3rgb('rgb('+rgb+')');uL[n*4]=x;uL[n*4+1]=y;uL[n*4+2]=z;uL[n*4+3]=r;uC[n*4]=c[0]/255;uC[n*4+1]=c[1]/255;uC[n*4+2]=c[2]/255;uC[n*4+3]=a;n++};
  put(h.x,h.y,(h.zh||0)+16,V3.mode==='prima'?175:160,'255,232,190',.62);
  for(const[,l] of L){if(n>max)break;const fl=l.fl?(.9+.1*Math.sin(t*(l.fl===2?2:9)+l.x)*Math.sin(t*5.3+l.y)):1;put(l.x,l.y,(l.z||10)*.6,l.r*1.25*fl,l.rgb||'255,200,120',Math.min(1,(l.a||.6)*1.1)*fl)}}
// ------------------------------------------------------------------ il fotogramma
function v3Size(Wp,Hp,dpr){const gl=V3.gl,sc=Math.min(dpr,2)*(V3.low?.66:1),cw=Math.max(2,Math.round(Wp*sc)),ch=Math.max(2,Math.round(Hp*sc));V3.W=Wp;V3.H=Hp;
  if(V3.cv.width!==cw||V3.cv.height!==ch){V3.cv.width=cw;V3.cv.height=ch;V3.fboOk=false}V3.cw=cw;V3.ch=ch;
  if(V3.post&&!V3.fboOk){if(V3.fbo){gl.deleteFramebuffer(V3.fbo);gl.deleteTexture(V3.fc);gl.deleteTexture(V3.fd)}V3.fbo=gl.createFramebuffer();V3.fc=v3Tex(gl,null,false,cw,ch);
    V3.fd=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,V3.fd);
    if(V3.gl2)gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,cw,ch,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);else gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,cw,ch,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
    for(const[p,v] of[[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
    gl.bindFramebuffer(gl.FRAMEBUFFER,V3.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,V3.fc,0);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,V3.fd,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){V3.post=false}gl.bindFramebuffer(gl.FRAMEBUFFER,null);V3.fboOk=true}}
function v3Frame(dt,Wp,Hp,dpr){const gl=V3.gl,W=ZM.W,h=W.hero,t0=performance.now();if(!V3.built||V3.lost)return;const PF=V3.prof,pk=PF?(k=>{gl.finish();const t=performance.now();PF[k]=(PF[k]||0)+t-PF._;PF._=t}):null;if(PF)PF._=t0;
  // the WebGL canvas sits right under the map's canvas (which keeps the sticks, the vignette and our overlay)
  if(V3.cv.parentNode!==ctx.canvas.parentNode)ctx.canvas.parentNode.insertBefore(V3.cv,ctx.canvas);
  v3Ground();v3Size(Wp,Hp,dpr);v3Camera(dt,Wp,Hp);V3.frame++;v3Zones(false);v3Lights();v3PlaneTick();
  for(const p of G3.props){const s=p._v3s;p._v3c=!!s&&!p.hide&&v3Seen(s[0],s[1],s[2],s[3])}
  gl.bindFramebuffer(gl.FRAMEBUFFER,V3.post?V3.fbo:null);gl.viewport(0,0,V3.cw,V3.ch);const fc=V3.fogC;gl.clearColor(fc[0],fc[1],fc[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.BLEND);
  // the sky: the moon (west, a little south, up high) and its halo, very far
  {const M=ZM.MOON,e=V3.eye,D=1250,mz=.55,x=e[0]+M[0]*D,y=e[1]+M[1]*D,z=e[2]+D*mz;gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
    const A=V3.moonA,G=V3.glowA,fp=V3.fogP;V3.fogP=[1e5,1,0];v3Q(x,y,z,-170,-170,170,170,G.u0,G.v0,G.u1,G.v1,.16,.19,.32,1);v3QFlush(V3.pA,V3A.pages[G.p].tex,V3.U3,0,true);
    v3Q(x,y,z,-46,-46,46,46,A.u0,A.v0,A.u1,A.v1,1,1,1,1);v3QFlush(V3.pA,V3A.pages[A.p].tex,V3.U3,0,true);V3.fogP=fp;gl.disable(gl.BLEND);gl.depthMask(true)}
  if(pk)pk('cielo');
  // the ground (pushed back a little: what lies on it wins)
  const P=V3.pG;gl.useProgram(P.p);v3Uni(P);gl.uniform1f(P.u.uCut,.02);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2,4);gl.disable(gl.CULL_FACE);
  if(G3.gbuf){gl.bindBuffer(gl.ARRAY_BUFFER,G3.gbuf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,20,12);
  gl.disableVertexAttribArray(2);gl.vertexAttrib4f(2,1,1,1,1);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(P.u.uTex,0);
  G3.ground.forEach((t,i)=>{if(!v3Seen(t.x+t.w/2,t.y+t.h/2,0,Math.hypot(t.w,t.h)/2))return;gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.drawArrays(gl.TRIANGLES,i*6,6)})}gl.disable(gl.POLYGON_OFFSET_FILL);
  if(pk)pk('terreno');
  // the props: one sheet at a time, the visible pieces in runs
  gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CCW);gl.uniform1f(P.u.uCut,.5);
  G3.pg.forEach((B,pi)=>{if(!B)return;gl.bindTexture(gl.TEXTURE_2D,V3A.pages[pi].tex);gl.bindBuffer(gl.ARRAY_BUFFER,B.bp);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,B.bt);gl.vertexAttribPointer(1,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,B.bc);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.UNSIGNED_BYTE,true,0,0);let s=-1,n=0;
    for(const c of B.ch){const ok=c.prop._v3c&&(!c.vis||c.vis())&&(!c.tag||!c.prop.house||v3TagVis(c.prop.house,c.tag));if(ok){if(s>=0&&s+n===c.s)n+=c.n;else{if(n)gl.drawArrays(gl.TRIANGLES,s,n);s=c.s;n=c.n}}}if(n)gl.drawArrays(gl.TRIANGLES,s,n)});
  gl.disable(gl.CULL_FACE);gl.disableVertexAttribArray(2);if(pk)pk('prop');
  // the round things (crowns, pumpkins) facing the camera
  v3Balls();if(pk)pk('chiome');
  // the hand drawings as postcards (from the side they're seen), the flat ones lying on the ground
  v3Fns();if(pk)pk('cartoline');
  v3Decals();if(pk)pk('a terra');
  // the characters: zombies, the hero (in third person), the Bara
  v3Figures();if(pk)pk('figure');
  // the flames and their halos, added on top
  v3Flames();if(pk)pk('fiamme');
  gl.disable(gl.BLEND);gl.depthMask(true);
  // the last pass: the dark outline where the depth jumps, and the vignette
  if(V3.post){gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,V3.cw,V3.ch);gl.disable(gl.DEPTH_TEST);const Q=V3.pP;gl.useProgram(Q.p);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,V3.fc);gl.uniform1i(Q.u.uC,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,V3.fd);gl.uniform1i(Q.u.uD,1);gl.activeTexture(gl.TEXTURE0);
    const ik=Math.max(1,Math.round(V3.cw/Wp*1.1));gl.uniform2f(Q.u.uPx,ik/V3.cw,ik/V3.ch);gl.uniform2f(Q.u.uNF,V3.near,V3.far);gl.uniform1f(Q.u.uInk,LOWFX||V3.low?.6:1);gl.uniform3fv(Q.u.uFogP,V3.fogP);
    gl.bindBuffer(gl.ARRAY_BUFFER,V3.qb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);for(let i=1;i<4;i++)gl.disableVertexAttribArray(i);gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.DEPTH_TEST)}
  if(pk)pk('contorno');
  // over it, in 2D: shots, blood, coins, the sight, the gun in first person
  v3Overlay(dt,Wp,Hp);if(pk)pk('sopra');
  // a slow phone: smaller picture, fewer lights, softer outline
  const ms=performance.now()-t0;V3.ms=V3.ms==null?ms:V3.ms*.9+ms*.1;if(!V3.low&&!V3.noLow){V3.slow=dt>.034?V3.slow+dt:Math.max(0,V3.slow-dt*.5);if(V3.slow>1.6){V3.low=true;V3.fboOk=false}}}
// the house parts with the hero inside: no roof (and on the ground floor nothing of the upper floor); outside everything
function v3TagVis(hs,tag){const inside=(hs.a==null?1:hs.a)<.5,up=(hs.up||0)>.5;if(tag==='roof')return !inside;if(tag==='slab'||tag==='inU'||(tag[0]==='u'&&tag.length===2))return !inside||up;return true}
function v3Balls(){const by={};for(const b of G3.balls){const p=b.prop;if(!p._v3c||(b.vis&&!b.vis())||(b.tag&&p.house&&!v3TagVis(p.house,b.tag)))continue;(by[b.A.p]=by[b.A.p]||[]).push(b)}
  for(const k in by){for(const b of by[k]){const A=b.A,r=b.r+4;v3Q(b.x,b.y,b.z,-r,-r*b.sq,r,r*b.sq,A.u0,A.v0,A.u1,A.v1,1,1,1,1)}v3QFlush(V3.pB,V3A.pages[k].tex,V3.U3,.5)}}
// the windows' panels change when the planks come and go: their picture is painted again in the same place
let V3PT=0;function v3PlaneTick(){if(++V3PT%8)return;const gl=V3.gl;for(const e of G3.planes){if(e.t.texId===e.id)continue;e.id=e.t.texId;const c=v3PlaneCv(e.t),A=e.A,k=document.createElement('canvas');k.width=A.w;k.height=A.h;
  k.getContext('2d').drawImage(c,0,0,A.w,A.h);gl.bindTexture(gl.TEXTURE_2D,V3A.pages[A.p].tex);gl.texSubImage2D(gl.TEXTURE_2D,0,A.x,A.y,gl.RGBA,gl.UNSIGNED_BYTE,k)}}
function v3Fns(){const e=V3.eye,dirNow=((Math.round(V3.th/(Math.PI/8))%16)+16)%16;let budget=V3.low?5:12;const list=[];
  for(const f of G3.fns){const p=f.prop;if(!p._v3c||(f.vis&&!f.vis())||(f.tag&&p.house&&!v3TagVis(p.house,f.tag)))continue;const b=f.b,cz=(b[2]+b[5])/2,d=Math.hypot(f.cx-e[0],f.cy-e[1],cz-e[2]);
    if(d>V3.fogP[0]+V3.fogP[1])continue;list.push([d,f])}list.sort((a,b)=>a[0]-b[0]);
  const gen=V3.imp.gen,R=V3.R3;
  for(const[,f] of list){let C;if(f.flat){C=f.dc&&f.dc.gen===gen?f.dc:null;if(!C&&budget>0){budget--;C=f.dc=v3Capture(f,0)}if(!C)continue;
      const q=C.q,z=f.b[2]+.35;// lying on the ground: a quad in x, y (the drawing's x along the world's x, its y along the world's y)
      v3QFlat(f.cx,f.cy,z,q,C);continue}
    let dir=dirNow;C=f.cap[dir];if(C&&C.gen!==gen)C=null;
    if(!C&&budget>0){budget--;C=f.cap[dir]=v3Capture(f,dir)}
    if(!C){for(let k=1;k<8&&!C;k++)for(const s of[1,-1]){const d2=(dir+s*k+16)%16,c2=f.cap[d2];if(c2&&c2.gen===gen){C=c2;dir=d2;break}}}if(!C)continue;
    // a postcard standing at the middle of the drawing, turned toward the camera; its picture's y is (v·SP − z·CP) → up = −y/CP
    const q=C.q;v3Q(f.cx,f.cy,0,q[0],-q[3]/V3CP,q[2],-q[1]/V3CP,C.u0,C.v0,C.u1,C.v1,1,1,1,1)}
  if(V3N)v3QFlush(V3.pB,V3.imp.tex,[0,0,1],.4)}
// a flat postcard: four corners on the ground (not facing the camera), through the same buffer with a zero right/up and the corners in aP
function v3QFlat(cx,cy,z,q,C){const D=V3.dyn;if(V3N+66>D.length)return;const P=[[cx+q[0],cy+q[3],C.u0,C.v1],[cx+q[2],cy+q[3],C.u1,C.v1],[cx+q[2],cy+q[1],C.u1,C.v0],[cx+q[0],cy+q[3],C.u0,C.v1],[cx+q[2],cy+q[1],C.u1,C.v0],[cx+q[0],cy+q[1],C.u0,C.v0]];
  V3.flat=V3.flat||[];for(const v of P)V3.flat.push(v[0],v[1],z,0,0,v[2],v[3],1,1,1,1)}
function v3Figures(){const W=ZM.W,h=W.hero,e=V3.eye,gl=V3.gl,R0=CR._rig,crk=Object.assign({},R0.cam),rgk=Object.assign({},RIGCAM),list=[];
  // the flat postcards collected by v3Fns go first (they lie on the ground under everyone)
  if(V3.flat&&V3.flat.length){const D=V3.dyn;D.set(V3.flat.slice(0,D.length));V3N=Math.min(V3.flat.length,D.length);V3.flat.length=0;gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);
    const R3=V3.R3;V3.R3=[0,0,0];v3QFlush(V3.pB,V3.imp.tex,[0,0,0],.4);V3.R3=R3;gl.disable(gl.POLYGON_OFFSET_FILL)}
  for(const z of W.Z){const zz=z.zh||0,d=Math.hypot(z.x-e[0],z.y-e[1],zz+30-e[2]);if(d>V3.fogP[0]+V3.fogP[1]||!v3Seen(z.x,z.y,zz+30,60*z.sc))continue;list.push([d,'z',z])}
  if(V3.mode==='terza')list.push([Math.hypot(h.x-e[0],h.y-e[1],(h.zh||0)+30-e[2]),'h',h]);
  const B=ZM.bara&&ZM.bara();if(B&&B.b&&B.E&&!(B.b.posa&&(B.b.posa().sink||0)>=1)){const d=Math.hypot(B.x-e[0],B.y-e[1],20-e[2]);if(d<V3.fogP[0]+V3.fogP[1]&&v3Seen(B.x,B.y,20,70))list.push([d,'b',B])}
  list.sort((a,b)=>b[0]-a[0]);V3.figs=list.map(q=>q[1]).join('');const dpr=Math.min(2,V3.cw/V3.W);
  try{for(const[d,k,o] of list){const zz=k==='b'?0:(o.zh||0),el=Math.round(Math.atan2(e[2]-(zz+28),Math.max(1,Math.hypot(o.x-e[0],o.y-e[1])))/.052)*.052,tl=v3Tilt(el);
      Object.assign(R0.cam,{k:tl.k,zk:tl.zk});RIGCAM.kr=tl.kr;RIGCAM.zk=tl.zk;
      const ang=Math.atan2(o.y-e[1],o.x-e[0]),psi=-Math.PI/2-ang,kpx=Math.round(v3cl(v3K(d)*dpr*(V3.low?.75:.92),.5,4.2)*4)/4;let S=null,box=null,anchor=[o.x,o.y,zz];
      if(k==='z')({S,box}=v3Zombie(o,psi,kpx,el));else if(k==='h')({S,box}=v3Hero(o,psi,kpx));else({S,box}=v3Box(o,ang,kpx));if(!S)continue;
      v3Q(anchor[0],anchor[1],anchor[2],box[0],-box[3],box[2],-box[1],S.u0,S.v0,S.u1,S.v1,1,1,1,1)}}
  finally{Object.assign(R0.cam,crk);Object.assign(RIGCAM,rgk)}
  if(V3N){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);v3QFlush(V3.pB,V3.spr.tex,[0,0,1],.3);gl.disable(gl.BLEND)}}
function v3Zombie(z,psi,k,el){const kind=z.kind,box0=v3BoxOf('z|'+kind,(fc,an,p)=>CR[kind](0,0,fc,an,p,1)),sc=z.sc||1,box=[box0[0]*sc,box0[1]*sc-(z.rise<1?0:0),box0[2]*sc,box0[3]*sc],fc=z.face+psi;
  const pq=Math.floor(((z.p||0)%1)*12)/12,ph=z.rise<1?'r'+Math.round(z.rise*20):z.die?'d'+Math.round(z.die*18):z.fin>0?'f'+Math.round(z.fin*10):'',
    key=kind+'|'+z.anim+'|'+pq+'|'+Math.round(fc/.07)+'|'+k+'|'+el+'|'+ph+'|'+(z.flash>0?1:0);
  const S=v3Sprite('z'+z.id,box,k,g=>{let al=1,dy=0,an=z.anim,p=pq;
    if(z.rise<1){const kk=z.rise;if(kk<=.25)return;const u=(kk-.25)/.75,uu=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;dy=(1-uu)*60*sc;an='idle';p=((ZM.W.t*.6)%1)}
    else if(z.die){const kk=Math.min(1,z.die/1.1);al=1-kk*kk;dy=(kk<.5?2*kk*kk:1-Math.pow(-2*kk+2,2)/2)*50*sc;an='idle';p=0}else if(z.fin>0)al=v3cl(1-z.fin/.9,0,1);
    g.save();if(dy){g.beginPath();g.rect(box[0]-5,box[1]-5,box[2]-box[0]+10,-box[1]+5);g.clip();g.translate(0,dy)}g.globalAlpha=al;CR[kind](0,0,fc,an,p,sc);g.restore();
    if(z.flash>0){g.save();g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,.5)';g.fillRect(box[0],box[1],box[2]-box[0],box[3]-box[1]);g.restore()}},key);
  return{S,box}}
function v3Hero(h,psi,k){const HS=ZM.HSTYLE,g0=ZM.gun();if(typeof EROE==='undefined'||!EROE.arciere)return{S:null};const box=v3BoxOf('hero',(fc,an,p)=>EROE.arciere(0,0,fc,an,p,1,{style:HS,gp:g0?g0.pose():null,noFx:true}),['idle','walk','aim','hit']);
  const W=ZM.W,DI=W.director,f=h.fall||0,ht=DI&&DI.hurtT!=null?DI.hurtT:9,aimOn=(h.aimP!=null?h.aimP:!!h.tgZ)&&!h.moving&&!f&&!h.dead;let anim='idle',p=((W.t/2.4)%1+1)%1;
  const job=!f&&!h.dead&&!h.moving&&h.busy&&h.busy.anim?h.busy:null,bare=job||h.unarmed;
  if(f>0||h.dead){anim='hit';p=.16}else if(ht<.45){anim='hit';p=ht/.45*.5}else if(h.moving){anim='walk';p=(((h.walk||0)/(Math.PI*2))%1+1)%1}else if(job){anim=job.anim;p=v3cl(h.busyP||0,0,.999)}else if(aimOn)anim='aim';
  const out={},inv=W.mods&&W.mods.invis>0;
  const S=v3Sprite('hero',box,k,g=>{g.save();if(inv)g.globalAlpha=.4;if(f>0){g.translate(0,-6);g.rotate(-f*1.42);g.translate(0,6)}
    EROE.arciere(0,0,(h.f3==null?h.face||0:h.f3)+psi,anim,p,1,{style:bare?Object.assign({},HS,{gun:null}):HS,gp:g0&&!bare?g0.pose():null,noFx:true,out,tool:job?job.tool:null});g.restore()});
  // where the muzzle is in the world (for the shots): the drawing's point on the postcard, standing at the hero's feet
  if(out.muzzle){const m=out.muzzle,R=V3.R3;V3.muz=[h.x+R[0]*m[0],h.y+R[1]*m[0],(h.zh||0)-m[1]/RIGCAM.zk]}else V3.muz=null;
  return{S,box}}
function v3Box(B,ang,k){const F=B.F,kk=F.BS,c=Math.cos(B.a),s=Math.sin(B.a),X=B.x,Y=B.y,th=ang,cc=Math.cos(-Math.PI/2-th),ss=Math.sin(-Math.PI/2-th);
  const pj0=(x,y,z)=>{const dx=x-X,dy=y-Y;return[dx*cc-dy*ss,(dx*ss+dy*cc)*V3SP-z*V3CP]},box=[-80,-120,80,30];
  const S=v3Sprite('bara',box,k,g=>{const pj=(u,v,z)=>{const q=pj0(X+kk*(u*c-v*s),Y+kk*(u*s+v*c),kk*z);return[q[0]/kk,q[1]/kk]},dx=6/kk,dy=1.8/kk;
    const C=ZM.CAM,keep={yaw:C.yaw,c:C.c,s:C.s,SP:C.SP,CP:C.CP};C.c=cc;C.s=ss;C.SP=V3SP;C.CP=V3CP;
    try{B.b.x=0;B.b.y=0;B.b.draw(ARMI.vistaBara(pj,[dx*c+dy*s,-dx*s+dy*c]))}finally{Object.assign(C,keep)}});
  return{S,box:[box[0],box[1]/V3CP,box[2],box[3]/V3CP]}}
function v3Flames(){const W=ZM.W,gl=V3.gl,e=V3.eye,t=W.t||0,fr=V3.flameFr,G=V3.glowA;if(!fr)return;gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);
  for(const f of ZM.flames){if(f.off)continue;if(f.house&&f.lvl!=null&&(f.lvl?(f.house.up||0)<.5:(f.house.up||0)>.5))continue;const z=f.z||10,d=Math.hypot(f.x-e[0],f.y-e[1],z-e[2]);
    if(d>V3.fogP[0]+V3.fogP[1]||!v3Seen(f.x,f.y,z,30))continue;const fl=.85+.15*Math.sin(t*11+f.x)*Math.sin(t*7.3+f.y),s=(f.s||1);
    (V3.fl2=V3.fl2||[]).push([f,z,fl,s]);v3Q(f.x,f.y,z+4,-26*s*fl,-26*s*fl,26*s*fl,26*s*fl,G.u0,G.v0,G.u1,G.v1,.55,.32,.1,.9)}
  if(V3N)v3QFlush(V3.pA,V3A.pages[G.p].tex,[0,0,1],0,true);
  // the little flames themselves (their own sheet)
  if(V3.fl2&&V3.fl2.length){const by={};for(const[f,z,fl,s] of V3.fl2){const A=fr[Math.floor(t*10+f.x*.13)%fr.length];(by[A.p]=by[A.p]||[]).push([f,z,fl,s,A])}V3.fl2.length=0;
    for(const k in by){for(const[f,z,fl,s,A] of by[k])v3Q(f.x,f.y,z-1,-3.4*s,-1,3.4*s,9.5*s*fl,A.u0,A.v0,A.u1,A.v1,1,.95,.8,1);v3QFlush(V3.pA,V3A.pages[k].tex,[0,0,1],0,true)}}
  gl.depthMask(true);gl.disable(gl.BLEND)}
// i disegni a terra della partita (gli avvisi del Becchino, il fuoco della Bomba, la Tagliola, l'onda del Rintocco, le crepe): quelli del
// direttore (drawGround), fatti in una tela vista dall'alto intorno all'eroe (600 unità) e stesa a terra; non c'è nessun disegno, niente tela
function v3Decals(){const W=ZM.W,D=W.director;if(!D||!D.drawGround)return;const A=typeof ZABS!=='undefined'?ZABS:null;
  const busy=(A&&(A.fires.length||A.traps.length||A.rings.length||A.puffs.length))||(D.warn&&D.warn.length)||(D.cracks&&D.cracks.length)||(D.burst&&D.burst.length);if(!busy)return;
  const gl=V3.gl,h=W.hero,R=300,S=512,k=S/(2*R),x0=Math.round(h.x-R),y0=Math.round(h.y-R);let cv=V3.decCv;if(!cv){cv=V3.decCv=document.createElement('canvas');cv.width=cv.height=S;V3.decTex=v3Tex(gl,null,false,S,S)}
  const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,S,S);g.setTransform(k,0,0,k,-x0*k,-y0*k);
  const C=ZM.CAM,keep={rot:C.rot,c:C.c,s:C.s,SP:C.SP,CP:C.CP},sv=ctx,mo=typeof MIRA!=='undefined'?MIRA.on:null;C.rot=false;C.c=1;C.s=0;C.SP=1;C.CP=1;ctx=g;if(mo!=null)MIRA.on=false;
  try{D.drawGround(0)}catch(e){v3Err(e)}finally{ctx=sv;Object.assign(C,keep);if(mo!=null)MIRA.on=mo}
  gl.bindTexture(gl.TEXTURE_2D,V3.decTex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  const D3=V3.dyn,x1=x0+2*R,y1=y0+2*R,z=.7,P=[[x0,y1,0,1],[x1,y1,1,1],[x1,y0,1,0],[x0,y1,0,1],[x1,y0,1,0],[x0,y0,0,0]];V3N=0;for(const v of P){D3[V3N++]=v[0];D3[V3N++]=v[1];D3[V3N++]=z;D3[V3N++]=0;D3[V3N++]=0;D3[V3N++]=v[2];D3[V3N++]=v[3];D3[V3N++]=1;D3[V3N++]=1;D3[V3N++]=1;D3[V3N++]=1}
  const R3=V3.R3;V3.R3=[0,0,0];gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-4);
  v3QFlush(V3.pB,V3.decTex,[0,0,0],.01);V3.R3=R3;gl.disable(gl.POLYGON_OFFSET_FILL);gl.depthMask(true);gl.disable(gl.BLEND)}
// ------------------------------------------------------------------ sopra, in 2D: colpi, sangue, monete, il mirino, l'arma in prima persona
function v3Overlay(dt,Wp,Hp){const W=ZM.W,h=W.hero,g=ctx;g.save();
  try{for(const f of W.FX){if(f.k==='shot'){const t=f.tw,b=v3P(t[0],t[1],(t[2]||0)+26);let a=null;
        if(V3.mode==='prima'&&V3.vmMuz)a=V3.vmMuz;else if(V3.muz)a=v3P(V3.muz[0],V3.muz[1],V3.muz[2]);else a=v3P(h.x+Math.cos(h.aim||0)*14,h.y+Math.sin(h.aim||0)*14,(h.zh||0)+30);
        if(!a||!b)continue;const pc=f.pap>=2?'212,139,255':f.pap?'143,230,255':null,w=(f.w||2)*Math.max(.8,Math.min(2.4,v3K(b[2])*1.4));
        g.lineCap='round';g.strokeStyle=pc?`rgba(${pc},.95)`:'rgba(255,230,160,.9)';g.lineWidth=w;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
        if(!LOWFX){g.save();g.globalCompositeOperation='lighter';glow(pc||'255,210,120',a[0],a[1],16,.8);g.restore()}}
      else if(f.k==='boom'){const t=f.tw,q=v3P(t[0],t[1],(t[2]||0)+8);if(!q)continue;const k=1-f.t/f.t0,s=v3K(q[2]);g.save();g.globalCompositeOperation='lighter';glow('255,170,70',q[0],q[1]-6*s,f.r*(.7+k)*s,.9*(1-k));g.restore()}
      else if(f.k==='coin'){const t=f.tw,k=1-f.t/f.t0,q=v3P(t[0],t[1],(t[2]||0)+40+k*22);if(!q)continue;g.save();g.globalAlpha=Math.min(1,f.t/.35);g.font='800 15px "Baloo 2",system-ui';g.textAlign='center';g.lineJoin='round';g.lineWidth=3.6;g.strokeStyle=INK;
        g.strokeText('+'+f.n,q[0],q[1]);g.fillStyle='#ffd65a';g.fillText('+'+f.n,q[0],q[1]);g.restore()}
      else if(f.k==='faro'){const q=v3P(f.tw[0],f.tw[1],60);if(!q)continue;g.save();g.globalCompositeOperation='lighter';glow('120,255,160',q[0],q[1],40*v3K(q[2]),.5);g.restore()}
      else if(f.k==='drop'){const t=f.tw,q=v3P(t[0]+(f.x||0)*.3,t[1],(t[2]||0)+28-(f.y||0)*.6);if(!q)continue;const s=Math.max(1,1.8*v3K(q[2]));g.fillStyle='#3a5a1e';g.beginPath();g.arc(q[0],q[1],s,0,Math.PI*2);g.fill()}}
    // the target the hero is shooting (104): a red ring on its chest
    const tg=typeof MZ!=='undefined'?MZ.tg:null;if(tg&&!tg.die){const q=v3P(tg.x,tg.y,(tg.zh||0)+26*(tg.sc||1));if(q){const r=Math.max(9,15*(tg.sc||1)*v3K(q[2])*.9),t=performance.now()/1000;
      g.strokeStyle='rgba(255,120,100,.85)';g.lineWidth=1.6;g.beginPath();g.arc(q[0],q[1],r,0,Math.PI*2);g.stroke();g.lineWidth=2.2;for(let i=0;i<4;i++){const a=t*1.2+i*Math.PI/2;g.beginPath();g.moveTo(q[0]+Math.cos(a)*(r+2),q[1]+Math.sin(a)*(r+2));g.lineTo(q[0]+Math.cos(a)*(r+7),q[1]+Math.sin(a)*(r+7));g.stroke()}}}
    // the sight in the middle (first person) or a little dot ahead (third person)
    if(!h.dead){const cx=Wp/2,cy=V3.mode==='prima'?Hp/2:Hp*.45,lk=!!tg;g.strokeStyle=lk?'rgba(255,150,130,.95)':'rgba(240,244,255,.8)';g.lineWidth=1.6;g.lineCap='round';
      if(V3.mode==='prima'){for(const[a,b] of[[0,1],[1,0],[0,-1],[-1,0]]){g.beginPath();g.moveTo(cx+a*5,cy+b*5);g.lineTo(cx+a*11,cy+b*11);g.stroke()}}
      g.fillStyle=g.strokeStyle;g.beginPath();g.arc(cx,cy,1.6,0,Math.PI*2);g.fill()}
    if(V3.mode==='prima')v3Viewmodel(dt,Wp,Hp);}catch(e){v3Err(e)}finally{g.restore()}}
// l'arma in prima persona: il modello 3D dell'arma (ARMI3D) visto da dietro, in basso a destra, con le mani; rinculo, vampa, ricarica
function v3Viewmodel(dt,Wp,Hp){const W=ZM.W,h=W.hero,g0=ZM.gun();V3.vmMuz=null;if(!g0||h.dead||typeof ARMI3D==='undefined'||h.unarmed)return;const id=W.gunId||'pistola';if(ARMI3D.ZOMBIE&&!ARMI3D.ZOMBIE.includes(id))return;
  const R0=CR._rig,keep=Object.assign({},R0.cam),gp=g0.pose(),st={};
  if(['pistola','mitraglietta','mitra','tamburo'].includes(id))st.slide=gp.slide||0;if(id==='pistola'&&gp.n===0&&gp.st!=='ricarica')st.slide=1;
  if(id==='revolver'){st.hammer=gp.hammer==null?1:v3cl(gp.hammer,0,1);st.cyl=gp.cyl||0}if(id==='mitragliatrice'){st.spin=gp.spin||0;st.feed=gp.feed||0}
  if(id==='pompa'||id==='tattica')st.pump=gp.pump||0;if(id==='lanciarazzi')st.loaded=gp.loaded==null?1:gp.loaded;
  const rec=v3cl(gp.rec||0,0,1),fl=v3cl(gp.flash||0,0,1),rl=gp.st==='ricarica'?1:0;V3.rl=(V3.rl||0)+(rl-(V3.rl||0))*Math.min(1,dt*6);V3.eq=gp.eq!=null&&gp.eq<1?1-gp.eq:0;
  const m=Math.min(Wp,Hp*.62),s=m/390*8.6,walk=h.moving?(h.walk||0):0,bx=Math.cos(walk*.5)*5*(h.moving?1:0),by=Math.abs(Math.sin(walk*.5))*6*(h.moving?1:0),dip=V3.rl*70+V3.eq*120;
  const ax=Wp*.7+bx,ay=Hp*.84+by+dip+rec*10;
  Object.assign(R0.cam,{k:.36,zk:1.05});const V0=R0.V(.12);
  const aim=[-.62,-1,.3+rec*.25],l=Math.hypot(...aim),A=[aim[0]/l,aim[1]/l,aim[2]/l],fr=ARMI3D.frame([0,0,0],A,[0,0,1],s);
  const skin=(ZM.HSTYLE&&ZM.HSTYLE.skin)||'#e8b48a',sleeve=(ZM.HSTYLE&&(ZM.HSTYLE.tunic||ZM.HSTYLE.cloak))||'#3f6b4f';
  ctx.save();ctx.translate(ax,ay);ctx.rotate(-V3.rl*.5);let kp=null;
  try{// the forearms from the bottom edge to the hands
    const sp=V0.P(fr.O),arm=(x0,y0,x1,y1,w)=>{ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=w+3.2;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.strokeStyle=sleeve;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.14)';ctx.lineWidth=w*.3;ctx.beginPath();ctx.moveTo(x0-w*.18,y0);ctx.lineTo(x1-w*.18,y1);ctx.stroke()};arm(sp[0]+s*7,sp[1]+s*11,sp[0]+s*.5,sp[1]+s*1,s*4.6);
    kp=ARMI3D.draw(id,V0,fr,st,(K,k2)=>{if(k2&&k2.sup&&K&&K.W&&K.P){const q=K.P(K.W(k2.sup));if(q){ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=s*4+3.2;ctx.beginPath();ctx.moveTo(q[0]-s*6,q[1]+s*12);ctx.lineTo(q[0],q[1]+s*.6);ctx.stroke();ctx.strokeStyle=sleeve;ctx.lineWidth=s*4;ctx.beginPath();ctx.moveTo(q[0]-s*6,q[1]+s*12);ctx.lineTo(q[0],q[1]+s*.6);ctx.stroke()}}});
    R0.fist(V0,fr.O,s*2.3,skin);if(kp&&kp.sup)R0.fist(V0,kp.sup,s*2.1,skin);
    if(kp&&kp.muzzle){const q=V0.P(kp.muzzle);V3.vmMuz=[ax+q[0],ay+q[1]];if(fl>0&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,200,110',q[0],q[1],s*9*fl,.95*fl);glow('255,240,200',q[0],q[1],s*3.5*fl,1);ctx.restore()}}}
  catch(e){v3Err(e)}finally{ctx.restore();Object.assign(R0.cam,keep)}}
// ------------------------------------------------------------------ il bottone, il passaggio da una visuale all'altra
function v3UI(){const ov=document.getElementById('mz');if(!ov)return;let b=document.getElementById('v3btn');
  if(!b){if(!document.getElementById('v3css')){const st=document.createElement('style');st.id='v3css';st.textContent=`#v3btn{position:absolute;right:10px;top:calc(env(safe-area-inset-top,0px) + 104px);z-index:6;display:flex;align-items:center;gap:6px;
      padding:7px 12px 7px 9px;border-radius:999px;border:2px solid #2a2118;background:linear-gradient(#3b3226,#241d16);color:#f4e9d2;font:800 13px/1 "Baloo 2",system-ui,sans-serif;box-shadow:0 3px 0 #000,inset 0 1px 0 rgba(255,240,210,.18);cursor:pointer;touch-action:manipulation}
      #v3btn:active{transform:translateY(2px);box-shadow:0 1px 0 #000}#v3btn svg{width:18px;height:18px}#v3btn small{opacity:.7;font-weight:700;margin-left:2px}
      #v3toast{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:7;padding:10px 16px;border-radius:14px;background:rgba(18,14,10,.86);border:2px solid #2a2118;color:#f4e9d2;font:800 15px "Baloo 2",system-ui;text-align:center;pointer-events:none;transition:opacity .4s}`;document.head.appendChild(st)}
    b=document.createElement('button');b.id='v3btn';b.type='button';b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#f4e9d2" stroke-width="2.2" stroke-linecap="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/></svg><span></span>';
    b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();v3Set(V3NEXT[V3.mode])});ov.appendChild(b)}
  b.querySelector('span').innerHTML=V3NAME[V3.mode]+' <small>▸</small>'}
function v3Toast(t,s){const ov=document.getElementById('mz');if(!ov)return;let e=document.getElementById('v3toast');if(!e){e=document.createElement('div');e.id='v3toast';ov.appendChild(e)}e.innerHTML=t;e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>{e.style.opacity=0},(s||1.8)*1000)}
function v3Set(m){if(!m||m===V3.mode)return;const W=ZM.W;
  if(m==='alto'){V3.mode='alto';V3.on=false;if(V3.cv&&V3.cv.parentNode)V3.cv.style.display='none';v3UI();v3Toast(V3NAME.alto);return}
  if(!v3Init()){v3Toast('Questo telefono non sa disegnare in 3D (WebGL)',2.6);return}
  if(!V3.built){if(V3.busy)return;V3.busy=true;v3Toast('Preparo la visuale 3D…',8);setTimeout(()=>{try{v3Build()}catch(e){v3Err(e)}V3.busy=false;if(V3.built){V3.mode=m;V3.on=true;V3.cv.style.display='';v3UI();v3Toast(V3NAME[m])}else v3Toast('Non riesco a preparare la visuale 3D',2.6)},60);return}
  V3.mode=m;V3.on=true;V3.cv.style.display='';V3.camK=null;v3UI();v3Toast(V3NAME[m])}
// ------------------------------------------------------------------ l'aggancio: il motore chiede a W.v3 se disegnare lui
if(typeof ZM!=='undefined'&&ZM.W){const W=ZM.W;W.v3={get on(){if(!V3.auto&&W.ground&&W.director&&W.director.st){V3.auto=1;setTimeout(()=>{if(V3.mode==='alto')v3Set('terza')},500)}return V3.on&&V3.built&&V3.mode!=='alto'},draw:(dt,Wp,Hp,dpr)=>{try{v3Frame(dt,Wp,Hp,dpr)}catch(e){v3Err(e)}}};
  addEventListener('keydown',e=>{if((e.code==='KeyC')&&!e.repeat&&document.getElementById('mz')&&!document.getElementById('mz').hidden&&ZM.W.director&&ZM.W.director.st!=='fine'){v3Set(V3NEXT[V3.mode])}},true);
  if(ZM.partita){const _p=ZM.partita;ZM.partita=function(){const D=_p.apply(this,arguments);if(D&&!D.__v3){D.__v3=1;const _r=D.reset;D.reset=function(){_r.apply(this,arguments);try{v3UI()}catch(e){}}}try{v3UI()}catch(e){}return D};if(W.director)try{v3UI()}catch(e){}}
  window.__V3=V3}
