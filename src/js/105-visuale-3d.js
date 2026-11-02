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
// intorno a ogni cosa (dove la profondità salta), come i contorni dei disegni. L'eroe in terza persona e l'arma in prima persona sono in 3D
// vero (Denis: «metti il pg in 3d, non può essere in 2d»): i pezzi del modello dell'Arciere e delle armi 3D fatti di triangoli (sotto, «l'eroe
// in 3D vero»); zombie e Bara sono i loro disegni dipinti, girati dalla parte giusta e inclinati come li vede la telecamera; le fiamme e le luci
// si accendono sopra; il cielo va dalla nebbia dell'orizzonte al blu della notte, con le stelle; la vampa di ogni colpo illumina intorno.
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
// the sky behind everything: the fog's colour at the horizon (uHy: where it is on the screen, 0 at the bottom), the night's blue up high
const V3FS_SKY=`precision mediump float;uniform vec3 uFog;uniform vec3 uTop;uniform float uHy;varying vec2 vU;
void main(){float t=smoothstep(uHy-.03,uHy+.55,vU.y);gl_FragColor=vec4(mix(uFog,uTop,t*t*(3.-2.*t)),1.);}`;
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
    if(V3.post)V3.pP=v3Prog(gl,V3VS_POST,V3FS_POST,['aP']);V3.pS=v3Prog(gl,V3VS_POST,V3FS_SKY,['aP'])}catch(e){v3Err(e);return false}
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
  // the soft shadow under the characters
  {const c2=document.createElement('canvas');c2.width=c2.height=64;const g2=c2.getContext('2d'),r2=g2.createRadialGradient(32,32,0,32,32,31);r2.addColorStop(0,'rgba(4,6,12,.62)');r2.addColorStop(.55,'rgba(4,6,12,.42)');r2.addColorStop(1,'rgba(4,6,12,0)');
    g2.fillStyle=r2;g2.fillRect(0,0,64,64);V3.shadowA=v3Put(c2,64,64)}
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
  else{const phi=v3cl(13+(el-35)*1.25,8,50)*Math.PI/180,D=V3.dbgD||150,head=[h.x,h.y,hz+42],sh=17;
    let want=[head[0]-fx*D*Math.cos(phi)+rx*sh,head[1]-fy*D*Math.cos(phi)+ry*sh,head[2]+D*Math.sin(phi)];
    // the camera doesn't go into walls or through roofs: it comes forward to just before the first tall thing in between
    let kk=1;for(let i=1;i<=18;i++){const t=i/18,x=head[0]+(want[0]-head[0])*t,y=head[1]+(want[1]-head[1])*t,z=head[2]+(want[2]-head[2])*t;if(v3HAt(x,y)>z-4){kk=Math.max(.16,(i-1.5)/18);break}}
    V3.camK=V3.camK==null?kk:kk<V3.camK?kk:V3.camK+(kk-V3.camK)*Math.min(1,dt*3);const k=V3.camK;
    eye=[head[0]+(want[0]-head[0])*k,head[1]+(want[1]-head[1])*k,head[2]+(want[2]-head[2])*k];at=[h.x+fx*80+rx*sh*.55,h.y+fy*80+ry*sh*.55,hz+30];
    // (for the photos of the tests: the camera round the hero, looking at him)
    if(V3.dbgCam){const dd=V3.dbgCam;at=[h.x,h.y,hz+20];eye=[h.x-fx*dd*Math.cos(phi),h.y-fy*dd*Math.cos(phi),hz+20+dd*Math.sin(phi)]}
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
  // the flash of each shot lights up what is round the muzzle for a moment
  if(V3.muzF>.05&&V3.muz&&!LOWFX)put(V3.muz[0],V3.muz[1],V3.muz[2],60+110*V3.muzF,'255,196,110',Math.min(1,.7*V3.muzF));
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
  // the sky: from the misty horizon (the colour of the fog) up to the deep blue of the night, the stars that twinkle, the moon (west, a
  // little south, up high) and its halo, very far
  if(V3.pS){const S=V3.pS,e=V3.eye,F=V3.F3,l=Math.hypot(F[0],F[1])||1,hz=v3P(e[0]+F[0]/l*1000,e[1]+F[1]/l*1000,e[2]),hy=hz?1-hz[1]/V3.H:(V3.F3[2]>0?-1:2);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
    gl.useProgram(S.p);gl.uniform3fv(S.u.uFog,V3.fogC);gl.uniform3f(S.u.uTop,.022,.03,.075);gl.uniform1f(S.u.uHy,hy);gl.bindBuffer(gl.ARRAY_BUFFER,V3.qb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    for(let i=1;i<4;i++)gl.disableVertexAttribArray(i);gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.DEPTH_TEST);gl.depthMask(true)}
  {const M=ZM.MOON,e=V3.eye,D=1250,mz=.55,x=e[0]+M[0]*D,y=e[1]+M[1]*D,z=e[2]+D*mz;gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
    const A=V3.moonA,G=V3.glowA,fp=V3.fogP;V3.fogP=[1e5,1,0];
    if(!LOWFX){const ST=V3.stars||(V3.stars=(()=>{let sd=7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647,o=[];for(let i=0;i<240;i++){const az=r()*Math.PI*2,el=Math.asin(.12+r()*.86);o.push([Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el),9+r()*r()*16,.45+r()*.55,r()*9])}return o})()),t=W.t||0;
      for(const[dx,dy,dz,sz,br,ph] of ST){const k=br*(.72+.28*Math.sin(t*(1.3+ph*.2)+ph))*v3cl((dz-.1)/.25,0,1);if(k<.03)continue;v3Q(e[0]+dx*1300,e[1]+dy*1300,e[2]+dz*1300,-sz,-sz,sz,sz,G.u0,G.v0,G.u1,G.v1,1.05*k,1.1*k,1.25*k,1)}}
    v3Q(x,y,z,-170,-170,170,170,G.u0,G.v0,G.u1,G.v1,.16,.19,.32,1);v3QFlush(V3.pA,V3A.pages[G.p].tex,V3.U3,0,true);
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
  // the soft shadows under the hero, the zombies and the Bara
  {const h0=W.hero;if(V3.mode==='terza'&&!h0.dead)v3Blob(h0.x,h0.y,h0.zh||0,14);for(const z of W.Z){if(z.rise<1||z.die)continue;const zz=z.zh||0;if(Math.hypot(z.x-V3.eye[0],z.y-V3.eye[1])>V3.fogP[0]+V3.fogP[1]||!v3Seen(z.x,z.y,zz,30))continue;v3Blob(z.x,z.y,zz,12*(z.sc||1))}
    v3Blobs()}if(pk)pk('ombre');
  // the hero in 3D (in third person), then the characters still painted: zombies and the Bara (and the hero if the 3D one cannot be made)
  V3.h3ok=false;try{V3.h3ok=v3Hero3()}catch(e){v3Err(e);V3.no3h=true}if(pk)pk('eroe 3D');
  v3Figures();if(pk)pk('figure');
  // the flames and their halos, added on top
  v3Flames();if(pk)pk('fiamme');
  // the weapon in first person, in 3D, in front of everything
  V3.vm3=false;if(V3.mode==='prima'){try{v3View3(dt)}catch(e){v3Err(e);V3.no3h=true}}if(pk)pk('arma 3D');
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
  if(V3.mode==='terza'&&!V3.h3ok)list.push([Math.hypot(h.x-e[0],h.y-e[1],(h.zh||0)+30-e[2]),'h',h]);
  const B=ZM.bara&&ZM.bara();if(B&&B.b&&B.E&&!(B.b.posa&&(B.b.posa().sink||0)>=1)){const d=Math.hypot(B.x-e[0],B.y-e[1],20-e[2]);if(d<V3.fogP[0]+V3.fogP[1]&&v3Seen(B.x,B.y,20,70))list.push([d,'b',B])}
  list.sort((a,b)=>b[0]-a[0]);V3.figs=list.map(q=>q[1]).join('')+(V3.h3ok?'h':'');const dpr=Math.min(2,V3.cw/V3.W);
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
// ------------------------------------------------------------------ l'eroe in 3D vero (Denis, 2 novembre: «metti il pg in 3d, non può essere in
// 2d, ce l'abbiamo già il modello in 3d usiamo quello»). I pezzi del modello dell'Arciere (sprite/eroe3d/disegno_eroe.js) fatti di triangoli:
// EROE.rig3d dà la posa di questo momento (la stessa del disegno: respiro, passi, mira, rinculo, ricarica, colpito), e qui diventano volumi
// veri nella scena: il corpo a goccia con la giubba (la sua texture: orlo, colletto, cucitura, bottoni, cinghia, cintura e fibbia), il
// cappuccio tondo col viso nell'apertura (occhi grandi con la luce, guance, bocca quando lo colpiscono: fatti punto per punto sulla palla della
// testa), i piedi tondi, le mani, l'arma vera di ARMI3D (gli stessi pezzi: prismi, cilindri, sfere, aste, coi colori dei materiali, il
// carrello, la pompa, il tamburo, il caricatore che esce). Dipinti come i disegni del gioco: tre toni che sfumano con la luce dall'alto a
// sinistra, il bordo chiaro, il contorno scuro spesso (lo stesso corpo un poco più grande, girato al rovescio), poi la notte, le luci e la
// nebbia come tutto il resto. Le teste con pezzi propri (capelli dell'aspetto, cappelli, coda, corna, elmo, piuma, maschera, occhiali) sono
// la testa dipinta del gioco, vista dalla parte giusta come una palla
const V3VS_TOON=`attribute vec3 aP;attribute vec3 aN;attribute vec3 aO;attribute vec2 aT;attribute vec4 aC;uniform mat4 uVP;uniform mat4 uM;uniform mat3 uNM;uniform float uOut;
varying vec3 vN;varying vec4 vC;varying vec3 vW;varying vec2 vT;
void main(){vec3 n=normalize(uNM*aN);vec3 p=(uM*vec4(aP,1.)).xyz+normalize(uNM*aO)*uOut;vN=n;vC=aC;vT=aT;vW=p;gl_Position=uVP*vec4(p,1.);}`;
const V3FS_TOON=`precision highp float;uniform sampler2D uTex;uniform vec4 uTint;uniform vec3 uLd;uniform float uInk;uniform float uFlash;uniform float uAlpha;
uniform float uHead;uniform vec3 uHc;uniform vec3 uFd;uniform vec3 uHf;uniform vec3 uHu;uniform vec3 uHr;uniform vec3 uE1;uniform vec3 uE2;uniform vec3 uG1;uniform vec3 uG2;
uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uMo;uniform vec3 uHood;uniform vec3 uSkin;uniform vec3 uEyeC;uniform vec4 uHE;
varying vec3 vN;varying vec4 vC;varying vec3 vW;varying vec2 vT;${V3SHADE}
float el(vec3 d,vec3 c,float rx,float ry){vec3 q=d-c;float x=dot(q,uHr)/rx,y=dot(q,uHu)/ry;return x*x+y*y;}
void main(){vec3 ink=vec3(.106,.086,.071);if(uInk>.5){gl_FragColor=vec4(shade(ink,vW,0.),uAlpha);return;}
 vec3 n=normalize(vN);vec3 base=(texture2D(uTex,vT)*vC*uTint).rgb;float flat0=0.;
 if(uHead>.5){vec3 d=normalize(vW-uHc);n=d;base=uHood;
  float sa=atan(dot(d,uHu),dot(d,uHf));if(abs(dot(d,uHr))<.045&&sa>.9&&sa<3.)base=mix(uHood,vec3(.051,.078,.094),.22);
  float a=acos(clamp(dot(d,uFd),-1.,1.));
  if(a<.79){base=uSkin*(1.-.16*smoothstep(.2,.62,dot(d-uFd,uHu)));
   if(uHE.w>.5){float b1=el(d,uC1,.17,.1),b2=el(d,uC2,.17,.1);base=mix(base,vec3(1.,.47,.43),.2*(1.-smoothstep(.5,1.,min(b1,b2))));}
   float op=uHE.x;
   if(uHE.y>.5){for(int i=0;i<2;i++){vec3 e=i==0?uE1:uE2;vec3 q=d-e;float x=dot(q,uHr),y=dot(q,uHu);if(abs(x)<.18&&abs(y-abs(x)*.35+.03)<.028){base=uEyeC;flat0=1.;}}}
   else{float e1=el(d,uE1,.195,.23*op),e2=el(d,uE2,.195,.23*op);if(min(e1,e2)<1.){base=uEyeC;flat0=1.;
     if(op>.45){vec3 g=e1<e2?uG1:uG2;if(distance(d,g)<.04){base=vec3(.99,.965,.91);}}}}
   if(uHE.z>.05){float m=el(d,uMo,.13,.06+.11*uHE.z);if(m<1.){base=m>.62?ink:vec3(.353,.125,.125);flat0=1.;}}}
  if(a>.745&&a<.97){base=ink;flat0=1.;}}
 float l=dot(n,uLd),k=smoothstep(-.6,.9,l);vec3 dk=mix(base,vec3(.051,.078,.094),.34),lt=mix(base,vec3(1.),.22);
 vec3 c=k<.5?mix(dk,base,k*2.):mix(base,lt,k*2.-1.);c=mix(c,base,flat0*.75);
 float fr=1.-clamp(dot(n,normalize(uEye-vW)),0.,1.);c+=vec3(1.,.85,.6)*pow(fr,2.6)*.32*clamp(l+.35,0.,1.)*(1.-flat0);
 c=mix(c,vec3(1.),uFlash*.32);gl_FragColor=vec4(shade(c,vW,.6),uAlpha);}`;
const RG=CR._rig;
// a mesh being built: places, normals, texture points, colours, triangles (always turned outward: the same side as the faces of the map)
function v3MB(){return{P:[],N:[],T:[],C:[],I:[]}}
function v3V(m,p,n,c,t){m.P.push(p[0],p[1],p[2]);m.N.push(n[0],n[1],n[2]);m.T.push(t?t[0]:.5,t?t[1]:.5);m.C.push(c[0],c[1],c[2],c[3]==null?255:c[3]);return m.P.length/3-1}
function v3T(m,a,b,c){const P=m.P,N=m.N,ax=P[a*3],ay=P[a*3+1],az=P[a*3+2],ux=P[b*3]-ax,uy=P[b*3+1]-ay,uz=P[b*3+2]-az,vx=P[c*3]-ax,vy=P[c*3+1]-ay,vz=P[c*3+2]-az,
  nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,s=nx*(N[a*3]+N[b*3]+N[c*3])+ny*(N[a*3+1]+N[b*3+1]+N[c*3+1])+nz*(N[a*3+2]+N[b*3+2]+N[c*3+2]);if(s>0)m.I.push(a,c,b);else m.I.push(a,b,c)}
function v3Quad(m,A,B,C,D,n,col){const a=v3V(m,A,n,col),b=v3V(m,B,n,col),c=v3V(m,C,n,col),d=v3V(m,D,n,col);v3T(m,a,b,c);v3T(m,a,c,d)}
function v3Sphere(m,c,r,col,nl,nb){const rows=[];for(let j=0;j<=nb;j++){const th=j/nb*Math.PI,row=[];for(let i=0;i<=nl;i++){const ph=i/nl*Math.PI*2,d=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)];
    row.push(v3V(m,[c[0]+d[0]*r,c[1]+d[1]*r,c[2]+d[2]*r],d,col))}rows.push(row)}
  for(let j=0;j<nb;j++)for(let i=0;i<nl;i++){const a=rows[j][i],b=rows[j][i+1],cc=rows[j+1][i+1],d=rows[j+1][i];if(j>0)v3T(m,a,b,cc);if(j<nb-1)v3T(m,a,cc,d)}}
// a tube along the points (radius at each), its rings carried along without twisting, the two ends closed
function v3Tube(m,P,rad,col,N){const n=P.length;if(n<2)return;const{sub,nrm,cross,add,mul,dot,len}=RG;const tg=P.map((p,i)=>nrm(sub(P[Math.min(n-1,i+1)],P[Math.max(0,i-1)])));
  let v=cross(tg[0],[0,0,1]);if(len(v)<.2)v=cross(tg[0],[1,0,0]);v=nrm(v);const rings=[];
  for(let i=0;i<n;i++){if(i){v=sub(v,mul(tg[i],dot(v,tg[i])));if(len(v)<1e-4){v=cross(tg[i],[0,0,1]);if(len(v)<.2)v=cross(tg[i],[1,0,0])}v=nrm(v)}const w=cross(tg[i],v),ring=[];
    for(let k=0;k<=N;k++){const an=k/N*Math.PI*2,d=add(mul(v,Math.cos(an)),mul(w,Math.sin(an)));ring.push(v3V(m,add(P[i],mul(d,rad[i])),d,col))}rings.push(ring)}
  for(let i=0;i<n-1;i++)for(let k=0;k<N;k++){v3T(m,rings[i][k],rings[i][k+1],rings[i+1][k+1]);v3T(m,rings[i][k],rings[i+1][k+1],rings[i+1][k])}
  for(const[i,sg] of[[0,-1],[n-1,1]]){const nn=mul(tg[i],sg),c0=v3V(m,P[i],nn,col),ring=[];for(let k=0;k<N;k++){const q=m.P.slice(rings[i][k]*3,rings[i][k]*3+3);ring.push(v3V(m,q,nn,col))}
    for(let k=0;k<N;k++)v3T(m,c0,ring[k],ring[(k+1)%N])}}
// into the graphics card: places, normals, the outline's normals (the mean of the normals in the same place, so the contour has no gaps at the
// corners), texture points and colours, 48 bytes each
function v3Up(mb){const gl=V3.gl,n=mb.P.length/3,buf=new ArrayBuffer(n*48),F=new Float32Array(buf),U=new Uint8Array(buf),acc=new Map();
  for(let i=0;i<n;i++){const k=Math.round(mb.P[i*3]*40)+','+Math.round(mb.P[i*3+1]*40)+','+Math.round(mb.P[i*3+2]*40);let a=acc.get(k);if(!a)acc.set(k,a=[0,0,0,[]]);a[0]+=mb.N[i*3];a[1]+=mb.N[i*3+1];a[2]+=mb.N[i*3+2];a[3].push(i)}
  for(const a of acc.values()){let l=Math.hypot(a[0],a[1],a[2]);if(l<1e-5){a[0]=mb.N[a[3][0]*3];a[1]=mb.N[a[3][0]*3+1];a[2]=mb.N[a[3][0]*3+2];l=1}for(const i of a[3]){F[i*12+6]=a[0]/l;F[i*12+7]=a[1]/l;F[i*12+8]=a[2]/l}}
  for(let i=0;i<n;i++){const o=i*12;F[o]=mb.P[i*3];F[o+1]=mb.P[i*3+1];F[o+2]=mb.P[i*3+2];F[o+3]=mb.N[i*3];F[o+4]=mb.N[i*3+1];F[o+5]=mb.N[i*3+2];F[o+9]=mb.T[i*2];F[o+10]=mb.T[i*2+1];
    U[o*4+44]=mb.C[i*4];U[o*4+45]=mb.C[i*4+1];U[o*4+46]=mb.C[i*4+2];U[o*4+47]=mb.C[i*4+3]}
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,buf,gl.STATIC_DRAW);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(mb.I),gl.STATIC_DRAW);return{vb,ib,n:mb.I.length,nv:n}}
function v3Free(m){const gl=V3.gl;if(m){gl.deleteBuffer(m.vb);gl.deleteBuffer(m.ib)}}
// matrices: four columns (x, y, z, the place), and the normals' matrix (the columns made unit long: the turn without the squash)
const v3M4=(X,Y,Z,O)=>new Float32Array([X[0],X[1],X[2],0,Y[0],Y[1],Y[2],0,Z[0],Z[1],Z[2],0,O[0],O[1],O[2],1]);
function v3NM(M){const o=new Float32Array(9);for(let c=0;c<3;c++){const l=Math.hypot(M[c*4],M[c*4+1],M[c*4+2])||1;for(let r=0;r<3;r++)o[c*3+r]=M[c*4+r]/l}return o}
const v3Pt=(M,p)=>[M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12],M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]+M[14]];
const v3Dir=(M,p)=>RG.nrm([M[0]*p[0]+M[4]*p[1]+M[8]*p[2],M[1]*p[0]+M[5]*p[1]+M[9]*p[2],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]]);
// the weapon as a mesh: ARMI3D's own models (the same pieces, measures and colours), built by a kit that makes triangles instead of drawing
const v3TT=m=>Array.isArray(m)?m:(ARMI3D.MAT[m]||ARMI3D.MAT.acciaio);
function v3RP(pts,r){const n=pts.length,o=[];for(let i=0;i<n;i++){const a=pts[(i+n-1)%n],c=pts[i],b=pts[(i+1)%n],rr=Array.isArray(r)?r[i]:r;if(!rr){o.push(c);continue}
  const la=Math.hypot(a[0]-c[0],a[1]-c[1])||1,lb=Math.hypot(b[0]-c[0],b[1]-c[1])||1,da=Math.min(rr,la*.45),db=Math.min(rr,lb*.45),p=[c[0]+(a[0]-c[0])/la*da,c[1]+(a[1]-c[1])/la*da],q=[c[0]+(b[0]-c[0])/lb*db,c[1]+(b[1]-c[1])/lb*db];
  for(let k=0;k<3;k++){const t=k/2,u=1-t;o.push([u*u*p[0]+2*u*t*c[0]+t*t*q[0],u*u*p[1]+2*u*t*c[1]+t*t*q[1]])}}return o}
function v3CCW(p){let a=0;for(let i=0;i<p.length;i++){const q=p[i],w=p[(i+1)%p.length];a+=q[0]*w[1]-w[0]*q[1]}return a<0?p.slice().reverse():p}
function v3Kit(mb,fr){const{add,sub,mul,nrm,dot,cross,len}=RG,O=fr.O,X=fr.X,Y=fr.Y,Z=fr.Z,s=fr.s;
  const W=q=>[O[0]+(X[0]*q[0]+Y[0]*q[1]+Z[0]*q[2])*s,O[1]+(X[1]*q[0]+Y[1]*q[1]+Z[1]*q[2])*s,O[2]+(X[2]*q[0]+Y[2]*q[1]+Z[2]*q[2])*s];
  const Rd=n=>[X[0]*n[0]+Y[0]*n[1]+Z[0]*n[2],X[1]*n[0]+Y[1]*n[1]+Z[1]*n[2],X[2]*n[0]+Y[2]*n[1]+Z[2]*n[2]],col=(m,c)=>v3rgb(c||v3TT(m)[1]);
  const K={W,Rd,s,P:()=>[0,0],D:()=>0,F:()=>0,V0:null,parts:[],
    frame(o,x,y,ss){x=nrm(x);y=nrm(sub(y,mul(x,dot(y,x))));const z=cross(x,y);return v3Kit(mb,{O:W(o),X:nrm(Rd(x)),Y:nrm(Rd(y)),Z:nrm(Rd(z)),s:s*(ss||1)})},
    prism(pts,z0,z1,m,o){o=o||{};pts=v3CCW(pts);const n=pts.length;if(n<3)return K;const zt=Math.max(z0,z1),zb=Math.min(z0,z1),cc=col(m,o.col),cw=col(o.wm||m);
      for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<1e-5)continue;const nw=nrm(Rd([dy/l,-dx/l,0]));
        v3Quad(mb,W([a[0],a[1],zb]),W([b[0],b[1],zb]),W([b[0],b[1],zt]),W([a[0],a[1],zt]),nw,cw)}
      const tr=v3Ears(pts.map(p=>[p[0],p[1],0])),nz=nrm(Rd([0,0,1])),nd=mul(nz,-1),top=pts.map(p=>v3V(mb,W([p[0],p[1],zt]),nz,cc)),bot=pts.map(p=>v3V(mb,W([p[0],p[1],zb]),nd,cc));
      for(const[a,b,c] of tr){v3T(mb,top[a],top[b],top[c]);v3T(mb,bot[a],bot[b],bot[c])}return K},
    box(x0,y0,x1,y1,z0,z1,m,o,r){const rr=Math.min(r==null?.3:r,(x1-x0)/2,(y1-y0)/2);return K.prism(v3RP([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],rr),z0,z1,m,o)},
    cyl(a,b,r,m,o){o=o||{};const A=W(a),B=W(b),dd0=sub(B,A),L=len(dd0);if(L<1e-5)return K;const u=mul(dd0,1/L);let t=cross(u,[0,0,1]);if(len(t)<.25)t=cross(u,[1,0,0]);const v=nrm(t),w=cross(u,v);
      const ra=r*s,rb=(o.r2==null?r:o.r2)*s,N=10,cs=col(m,o.col),cp=o.capCol?v3rgb(o.capCol):cs,sl=(ra-rb)/L,ia=[],ib=[],dir=k=>add(mul(v,Math.cos(k/N*Math.PI*2)),mul(w,Math.sin(k/N*Math.PI*2)));
      for(let i=0;i<=N;i++){const d=dir(i),nn=nrm(add(d,mul(u,sl)));ia.push(v3V(mb,add(A,mul(d,ra)),nn,cs));ib.push(v3V(mb,add(B,mul(d,rb)),nn,cs))}
      for(let i=0;i<N;i++){v3T(mb,ia[i],ia[i+1],ib[i+1]);v3T(mb,ia[i],ib[i+1],ib[i])}
      // the ends; an open one (a muzzle) dark in the middle
      for(const[C,rr,nn,hole] of[[A,ra,mul(u,-1),o.holeA],[B,rb,u,o.hole]]){const k=hole?(o.holeK||.55):0,ring=[],inr=[];for(let i=0;i<N;i++){ring.push(v3V(mb,add(C,mul(dir(i),rr)),nn,cp));inr.push(v3V(mb,add(C,mul(dir(i),rr*k)),nn,hole?[18,20,23,255]:cp))}
        if(hole){const ri=[];for(let i=0;i<N;i++)ri.push(v3V(mb,add(C,mul(dir(i),rr*k)),nn,cp));for(let i=0;i<N;i++){const j=(i+1)%N;v3T(mb,ring[i],ring[j],ri[j]);v3T(mb,ring[i],ri[j],ri[i])}}
        const c0=v3V(mb,C,nn,hole?[18,20,23,255]:cp),src=hole?inr:ring;for(let i=0;i<N;i++)v3T(mb,c0,src[i],src[(i+1)%N])}
      return K},
    sph(c,r,m,o){o=o||{};v3Sphere(mb,W(c),r*s,col(m,o.col),9,6);return K},
    rod(pts,w,m,o){o=o||{};v3Tube(mb,pts.map(W),pts.map(()=>Math.max(.12,w*s/2)),col(m,o.col),6);return K},
    tube(pts,ws,m,o){o=o||{};v3Tube(mb,pts.map(W),ws.map(x=>Math.max(.12,x*s/2)),col(m,o.col),7);return K},
    hand(){return K},fx(){return K},draw(){},
    disc(c,n,r,cl,o){const p=W(c),nw=nrm(Rd(n)),q=add(p,mul(nw,.07*s));let t=cross(nw,[0,0,1]);if(len(t)<.25)t=cross(nw,[1,0,0]);const v=nrm(t),w=cross(nw,v),cc=v3rgb(cl),c0=v3V(mb,q,nw,cc),ring=[];
      for(let i=0;i<10;i++){const an=i/10*Math.PI*2;ring.push(v3V(mb,add(q,mul(add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),r*s)),nw,cc))}for(let i=0;i<10;i++)v3T(mb,c0,ring[i],ring[(i+1)%10]);return K},
    loc:p=>{const d=sub(p,O);return[dot(d,X)/s,dot(d,Y)/s,dot(d,Z)/s]}};
  return K}
// the weapon's meshes, one for each state of its moving parts (slide, pump, cylinder, magazine…), kept while they are used
// (each moving part in a few steps, so every pose of the weapon is built once and then reused while shooting: the slide or the pump in
// tenths, the turns of the barrels, the drum's key, the valve and the belt in a few steps of what repeats, the hand's magazine to half a
// unit; the glows are not in the mesh)
const V3GM=new Map(),V3QP={spin:[Math.PI/2,6],key:[Math.PI*2,12],valve:[Math.PI*2,12],cyl:[1/6,6],feed:[1,5]};
function v3GunState(st){const o={};for(const k in st){const v=st[k];if(k==='glow'||k==='gauge'||k==='hot')continue;
    if(typeof v==='number'){const P=V3QP[k];o[k]=P?(Math.round(((v%P[0])+P[0])%P[0]/P[0]*P[1])%P[1])/P[1]*P[0]:Math.round(v*10)/10}else if(Array.isArray(v))o[k]=v.map(x=>typeof x==='number'?Math.round(x*2)/2:x);else o[k]=v}return o}
function v3GunMesh(id,st0){const st=v3GunState(st0),key=id+'|'+JSON.stringify(st);let g=V3GM.get(key);if(g){V3GM.delete(key);V3GM.set(key,g);return g}
  const mb=v3MB(),K=v3Kit(mb,{O:[0,0,0],X:[1,0,0],Y:[0,1,0],Z:[0,0,1],s:1});let kp={};try{kp=ARMI3D.M[id](K,Object.assign({},st))||{}}catch(e){v3Err(e)}
  if(mb.P.length/3>65000)return null;g={mesh:v3Up(mb),kp};V3GM.set(key,g);V3.nGun=(V3.nGun||0)+1;if(V3GM.size>64){const k0=V3GM.keys().next().value;v3Free(V3GM.get(k0).mesh);V3GM.delete(k0)}return g}
// the meshes that stay: the body (rings of the tunic, from the hem up: the texture goes round it, the front in the middle), the ball (head,
// hands), the shoe (two balls joined, like the game's foot), the stick (the hammer)
function v3BodyMesh(prof,bz,ax){const mb=v3MB(),top=prof[prof.length-1][0],rad=dz=>{const P=prof;if(dz<=P[0][0])return P[0][1];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(dz<=b[0])return a[1]+(b[1]-a[1])*(dz-a[0])/(b[0]-a[0])}return P[P.length-1][1]};
  const zs=[];for(let i=0;i<prof.length-1;i++)for(let k=0;k<3;k++)zs.push(prof[i][0]+(prof[i+1][0]-prof[i][0])*k/3);zs.push(top);const NS=28,rows=[];
  for(const dz of zs){const r=rad(dz),sl=rad(dz+.5)-rad(dz-.5),row=[];for(let i=0;i<=NS;i++){const t=-Math.PI+i/NS*Math.PI*2;row.push(v3V(mb,[Math.cos(t)*r*ax,Math.sin(t)*r,bz+dz],RG.nrm([Math.cos(t)/ax,Math.sin(t),-sl]),[255,255,255,255],[i/NS,1-dz/top]))}rows.push(row)}
  for(let j=0;j<rows.length-1;j++)for(let i=0;i<NS;i++){v3T(mb,rows[j][i],rows[j][i+1],rows[j+1][i+1]);v3T(mb,rows[j][i],rows[j+1][i+1],rows[j+1][i])}
  for(const[j,sg] of[[0,-1],[rows.length-1,1]]){const dz=zs[j],r=rad(dz),c0=v3V(mb,[0,0,bz+dz],[0,0,sg],[255,255,255,255],[.5,sg<0?.985:.02]),ring=[];
    for(let i=0;i<NS;i++){const t=-Math.PI+i/NS*Math.PI*2;ring.push(v3V(mb,[Math.cos(t)*r*ax,Math.sin(t)*r,bz+dz],[0,0,sg],[255,255,255,255],[.5,sg<0?.985:.02]))}for(let i=0;i<NS;i++)v3T(mb,c0,ring[i],ring[(i+1)%NS])}
  return v3Up(mb)}
function v3Statics(){if(V3.hm)return V3.hm;const W=[255,255,255,255],M={};
  {const mb=v3MB();v3Sphere(mb,[0,0,0],1,W,26,18);M.ball=v3Up(mb)}{const mb=v3MB();v3Sphere(mb,[0,0,0],1,W,12,8);M.ball2=v3Up(mb)}
  {const mb=v3MB(),a=[-1,0,3],b=[1.7,0,2.85],ra=3.05,rb=3.15,{add,mul,nrm,sub,cross}=RG,u=nrm(sub(b,a)),v=nrm(cross(u,[0,0,1])),w=cross(u,v),N=14,rows=[];
    for(let k=0;k<=10;k++){const front=k>5,ph=front?(k-5)/5*Math.PI/2:(k/5-1)*Math.PI/2,C=front?b:a,r=front?rb:ra,row=[];
      for(let i=0;i<=N;i++){const an=i/N*Math.PI*2,d=add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),n=add(mul(u,Math.sin(ph)),mul(d,Math.cos(ph)));row.push(v3V(mb,add(C,mul(n,r)),n,W))}rows.push(row)}
    for(let j=0;j<rows.length-1;j++)for(let i=0;i<N;i++){v3T(mb,rows[j][i],rows[j][i+1],rows[j+1][i+1]);v3T(mb,rows[j][i],rows[j+1][i+1],rows[j+1][i])}M.foot=v3Up(mb)}
  {const mb=v3MB();v3Tube(mb,[[0,0,0],[1,0,0]],[1,1],W,8);M.stick=v3Up(mb)}
  const gl=V3.gl,wc=document.createElement('canvas');wc.width=wc.height=4;const g=wc.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,4,4);M.white=v3Tex(gl,wc,false);
  V3.pT=v3Prog(gl,V3VS_TOON,V3FS_TOON,['aP','aN','aO','aT','aC']);return V3.hm=M}
// the tunic as a picture that goes round the body: x the angle (the front in the middle), y the height (the hem at the bottom); the hem,
// the collar and the seam with the buttons of the leather jacket, the strap of the quiver, the belt with its golden buckle (as in arciere0)
const V3TT={};
function v3Tunic(R){const S=R.S,S0=R.S0,OF=R.OF,top=R.prof[R.prof.length-1][0],key=[S.body,S.belt,R.arm,S0.strap,OF&&OF.strap,OF&&OF.buckle,OF&&OF.noGiubba,top].join('|');if(V3TT[key])return V3TT[key];
  const Wc=512,Hc=128,c=document.createElement('canvas');c.width=Wc;c.height=Hc;const g=c.getContext('2d'),X=t=>(t/(Math.PI*2)+.5)*Wc,Y=dz=>(1-dz/top)*Hc,pu=Hc/top,mx=(a,b,k)=>RG.mix(a,b,k);
  g.fillStyle=S.body;g.fillRect(0,0,Wc,Hc);g.lineCap='round';g.lineJoin='round';
  const band=(dz,w,col)=>{g.fillStyle=col;g.fillRect(0,Y(dz)-w*pu/2,Wc,w*pu)},path=(f,n,w,col,dash)=>{g.strokeStyle=col;g.lineWidth=w*pu;if(dash)g.setLineDash(dash.map(v=>v*pu));g.beginPath();for(let i=0;i<=n;i++){const q=f(i/n);g.lineTo(X(q[0]),Y(q[1]))}g.stroke();g.setLineDash([])};
  band(.9,2.2,mx(S.body,'#0d1418',.24));
  if(R.arm==='giubba'&&!(OF&&OF.noGiubba)){for(const sd of[-1,1])path(k=>[sd*(.62+(.04-.62)*k),13.2+(10.8-13.2)*k],8,1.3,'rgba(27,22,18,.5)');path(k=>[.04,10.8+(6.8-10.8)*k],8,1,'rgba(27,22,18,.42)',[1.6,1.6]);
    for(const dz of[9.9,8]){g.fillStyle=INK;g.beginPath();g.ellipse(X(.17),Y(dz),(.95+.35)*pu*.8,(.95+.35)*pu,0,0,Math.PI*2);g.fill();g.fillStyle='#d9b27a';g.beginPath();g.ellipse(X(.17),Y(dz),.95*pu*.8,.95*pu,0,0,Math.PI*2);g.fill()}}
  if(S0.strap!==false)path(k=>{const t=-Math.PI+k*Math.PI*2;return[t,8.4-4.6*Math.sin(t)]},64,1.4,OF&&OF.strap||'#4a321e');
  if(S.belt){band(5.6,4.5,INK);band(5.6,2.7,S.belt);const bw=3.4*pu*.75,bh=4*pu,bx=X(0),by=Y(5.6);g.fillStyle=INK;g.fillRect(bx-bw/2-pu*.5,by-bh/2-pu*.5,bw+pu,bh+pu);
    g.fillStyle=OF&&OF.buckle||'#ffc93c';g.fillRect(bx-bw/2,by-bh/2,bw,bh);g.fillStyle='#fff3c0';g.fillRect(bx-bw*.32,by-bh*.35,bw*.3,bh*.25);g.fillStyle='#8a5a20';g.fillRect(bx-bw*.15,by-bh*.1,bw*.3,bh*.4)}
  return V3TT[key]=v3Tex(V3.gl,c,true)}
// the hero this frame: his pose from the model, his pieces in the room. Returns false if there is no 3D hero (then the painted one)
function v3NeedImp(S0){return !!(S0.look||S0.ponytail||S0.plume||S0.goggles||S0.helm||S0.antlers||S0.mask||S0.bandana||S0.hoodTip||S0.crown||S0.tiara||S0.ears||S0.skull||S0.beard)}
// the move of this moment, as the engine's drawHero chooses it (falling, hit, walking, the repairs, aiming, standing), and the hero's pieces
function v3HeroRig(dy){const W=ZM.W,h=W.hero,HS=ZM.HSTYLE,g0=ZM.gun(),DI=W.director,f=h.fall||0,ht=DI&&DI.hurtT!=null?DI.hurtT:9,aimOn=(h.aimP!=null?h.aimP:!!h.tgZ)&&!h.moving&&!f&&!h.dead;
  let anim='idle',p=((W.t/2.4)%1+1)%1;const job=!f&&!h.dead&&!h.moving&&h.busy&&h.busy.anim?h.busy:null,bare=job||h.unarmed;
  if(f>0||h.dead){anim='hit';p=.16}else if(ht<.45){anim='hit';p=ht/.45*.5}else if(h.moving){anim='walk';p=(((h.walk||0)/(Math.PI*2))%1+1)%1}else if(job){anim=job.anim;p=v3cl(h.busyP||0,0,.999)}else if(aimOn)anim='aim';
  const a=(h.f3==null?h.face||0:h.f3)+(dy||0);return{a,f,R:EROE.rig3d(a,anim,p,{style:bare?Object.assign({},HS,{gun:null}):HS,gp:g0&&!bare?g0.pose():null,tool:job?job.tool:null})}}
const v3Tint=c=>{const q=v3rgb(c);return[q[0]/255,q[1]/255,q[2]/255,1]};
function v3Hero3(){const W=ZM.W,h=W.hero,gl=V3.gl;if(V3.mode!=='terza'||typeof EROE==='undefined'||!EROE.rig3d||typeof ARMI3D==='undefined'||V3.no3h)return false;
  const hz=h.zh||0;if(!v3Seen(h.x,h.y,hz+22,40))return true;
  let Q;try{Q=v3HeroRig(V3.dbgYaw)}catch(er){v3Err(er);return false}const{a,f,R}=Q;
  const M0=v3Statics(),{mul,nrm}=RG,c=Math.cos(a),s=Math.sin(a);let MF=v3M4([c,s,0],[-s,c,0],[0,0,1],[h.x,h.y,hz]);
  if(f>0){const fa=-f*1.42,cf=Math.cos(fa),sf=Math.sin(fa);MF=v3Mul(MF,v3Mul(v3M4([1,0,0],[0,cf,sf],[0,-sf,cf],[0,0,6]),v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,-6])))}
  const S=R.S,A=R.A,items=[];
  // the body: the rings of rest moved by the pose's frame (squash, lean, roll, the step's lift): T(q) = turn(q·scale) + B, round the hem
  {const ca=Math.cos(A.lean),sa=Math.sin(A.lean),cr=Math.cos(A.roll),sr=Math.sin(A.roll),sz=1+A.s,sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0)),ZB=R.zb;
    const TU=v3M4([ca,0,-sa],[-sa*sr,cr,-ca*sr],[sa*cr,sr,ca*cr],[A.B[0],A.B[1],ZB+A.B[2]]),SC=v3M4([sx,0,0],[0,sxy,0],[0,0,sz],[0,0,-ZB*sz]);
    const bk=R.prof===V3.bodyProf?V3.bodyMesh:null;if(!bk){if(V3.bodyMesh)v3Free(V3.bodyMesh);V3.bodyProf=R.prof;V3.bodyMesh=v3BodyMesh(R.prof,R.bz,R.ax)}
    items.push({m:V3.bodyMesh,M:v3Mul(MF,v3Mul(TU,SC)),tex:v3Tunic(R),out:.62})}
  // the head: the ball with the face computed point by point (or the game's painted head for the heads with pieces of their own)
  const Hw=v3Pt(MF,R.Hc),imp=v3NeedImp(R.S0);if(!imp)items.push({m:M0.ball,M:v3M4([R.Rh,0,0],[0,R.Rh,0],[0,0,R.Rh],Hw),head:1,out:.62});
  // the feet, the hands (on the weapon, or at the sides), the hammer of the repairs
  if(R.feet)for(const fp of R.feet)items.push({m:M0.foot,M:v3Mul(MF,v3M4([1,0,0],[0,1,0],[0,0,1],fp)),tint:v3Tint(S.foot||'#4a3626'),out:.42});
  const ball=(p,r,col)=>items.push({m:M0.ball2,M:v3M4([r,0,0],[0,r,0],[0,0,r],p),tint:v3Tint(col),out:.42});
  for(const[hp,r] of R.hands)ball(v3Pt(MF,hp),r,S.hand);
  if(R.tool){const seg=(p0,p1,r,col)=>items.push(v3SegItem(v3Pt(MF,p0),v3Pt(MF,p1),r,col,.32));seg(R.tool.a,R.tool.b,.75,'#8a6a42');seg(R.tool.k0,R.tool.k1,1.4,'#4a4c56')}
  V3.muz=null;V3.muzF=0;
  if(R.gun){const G0=R.gun,fr=G0.fr,gm=v3GunMesh(G0.id,G0.st);if(gm){const MG=v3Mul(MF,v3M4(mul(fr.X,fr.s),mul(fr.Y,fr.s),mul(fr.Z,fr.s),fr.O));items.push({m:gm.mesh,M:MG,out:.3});
      const hd=G0.hands(gm.kp);if(hd.rh)ball(v3Pt(MG,hd.rh),2.8,S.hand);if(hd.lh)ball(v3Pt(MG,hd.lh),2.7,S.hand);
      if(gm.kp.muzzle){V3.muz=v3Pt(MG,gm.kp.muzzle);V3.muzF=G0.flash||0}}}
  const inv=W.mods&&W.mods.invis>0;v3Draw3(items,{R,MF,a,Hw},inv?.42:1,R.flash||0);
  if(imp)v3HeadImp(R,Hw,a);
  V3.h3=items.length;return true}
// a stick from p0 to p1 (radius r): the hammer's handle and head, the sleeves in first person
function v3SegItem(A0,B0,r,col,out){const{sub,cross,nrm,len,mul}=RG,d=sub(B0,A0),u=nrm(d);let v=cross(u,[0,0,1]);if(len(v)<.2)v=cross(u,[1,0,0]);v=nrm(v);const w=cross(u,v);
  return{m:V3.hm.stick,M:v3M4(d,mul(v,r),mul(w,r),A0),tint:v3Tint(col),out}}
// the pieces through the toon painting: first the outline (the same pieces a little bigger, seen from inside), then the pieces. H: the head
// (its directions in the room: face, eyes, cheeks, mouth), al: see-through (the invisibility), fl: the white flash of a hit
function v3Draw3(items,H,al,fl,near){const gl=V3.gl,P=V3.pT,M0=V3.hm,{add,mul,nrm}=RG;gl.useProgram(P.p);v3Uni(P);const u=P.u;
  const Ld=nrm(add(add(mul(V3.R3,-.5),[0,0,.85]),mul(V3.F3,-.42)));gl.uniform3fv(u.uLd,Ld);gl.uniform1f(u.uFlash,fl||0);gl.uniform1f(u.uAlpha,al);gl.uniform1i(u.uTex,0);gl.activeTexture(gl.TEXTURE0);
  for(let i=0;i<5;i++)gl.enableVertexAttribArray(i);gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);if(near)gl.depthRange(0,.03);
  if(H&&H.R){const R=H.R,S=R.S,HH=R.head,yr=HH.yaw-H.a,cy=Math.cos(yr),sy=Math.sin(yr),cn=Math.cos(HH.nod),sn=Math.sin(HH.nod),MF=H.MF,
      hl=v=>{v=nrm(v);const x=v[0]*cn+v[2]*sn,y=v[1],z=-v[0]*sn+v[2]*cn;return v3Dir(MF,[x*cy-y*sy,x*sy+y*cy,z])},op=Math.max(.12,HH.blink*(1-.3*HH.squint));
    const E1=hl([1,-.33,.25]),E2=hl([1,.33,.25]),gO=q=>nrm(add(q,add(mul(V3.R3,-.34*.195),mul(V3.U3,.46*.23*op))));
    gl.uniform3fv(u.uHc,H.Hw);gl.uniform3fv(u.uFd,hl(HH.FACE));gl.uniform3fv(u.uHf,hl([1,0,0]));gl.uniform3fv(u.uHu,hl([0,0,1]));gl.uniform3fv(u.uHr,hl([0,1,0]));gl.uniform3fv(u.uE1,E1);gl.uniform3fv(u.uE2,E2);
    gl.uniform3fv(u.uG1,gO(E1));gl.uniform3fv(u.uG2,gO(E2));gl.uniform3fv(u.uC1,hl([1,-.54,.04]));gl.uniform3fv(u.uC2,hl([1,.54,.04]));gl.uniform3fv(u.uMo,hl([1,-.13,-.06]));
    const t3=c=>v3Tint(c).slice(0,3);gl.uniform3fv(u.uHood,t3(S.hood));gl.uniform3fv(u.uSkin,t3(S.skin));gl.uniform3fv(u.uEyeC,t3(HH.eyeCol));gl.uniform4f(u.uHE,op,HH.shut?1:0,HH.mouth,HH.blush?1:0)}
  const draw=ink=>{for(const it of items){const m=it.m;gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);
      gl.vertexAttribPointer(0,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,48,12);gl.vertexAttribPointer(2,3,gl.FLOAT,false,48,24);gl.vertexAttribPointer(3,2,gl.FLOAT,false,48,36);gl.vertexAttribPointer(4,4,gl.UNSIGNED_BYTE,true,48,44);
      // (the weapons' frame is mirrored: its third axis is aim × up turned round, so their faces turn the other way)
      const M=it.M,det=M[0]*(M[5]*M[10]-M[6]*M[9])-M[4]*(M[1]*M[10]-M[2]*M[9])+M[8]*(M[1]*M[6]-M[2]*M[5]);gl.frontFace(det<0?gl.CW:gl.CCW);
      gl.uniformMatrix4fv(u.uM,false,M);gl.uniformMatrix3fv(u.uNM,false,v3NM(M));gl.uniform1f(u.uOut,ink?it.out*(V3.low?.8:1):0);gl.uniform1f(u.uHead,!ink&&it.head?1:0);
      gl.bindTexture(gl.TEXTURE_2D,it.tex||M0.white);gl.uniform4fv(u.uTint,it.tint||[1,1,1,1]);gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_SHORT,0)}};
  if(al<1){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA)}
  else{gl.cullFace(gl.FRONT);gl.uniform1f(u.uInk,1);draw(true)}
  gl.cullFace(gl.BACK);gl.uniform1f(u.uInk,0);draw(false);
  gl.frontFace(gl.CCW);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);if(near)gl.depthRange(0,1);for(let i=1;i<5;i++)gl.disableVertexAttribArray(i);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null)}
// the weapon in first person in 3D: the same weapon (the same mesh, its moving parts, the reload of the free hand) held low on the right,
// pointing at the middle of the screen, with the two hands and the sleeves of the tunic; it bobs with the steps, kicks with every shot,
// goes down and turns on its side for the reload, comes up from below when taken. Drawn in front of everything (its depth squeezed near)
// the place of the weapon in first person, by how it is held: the hand (right, up, forward from the eye), how much the barrel turns toward the
// middle (yw) and up (pt), its roll (rl), its size (sc)
const V3VM={one:{p:[2.4,-4.9,12.5],yw:.34,pt:.06,rl:.1,sc:.48},long:{p:[2.4,-4.9,12.5],yw:.3,pt:.05,rl:.12,sc:.5},shoulder:{p:[2.8,-3.4,12],yw:.22,pt:.04,rl:.06,sc:.46}};
function v3View3(dt){const W=ZM.W,h=W.hero,g0=ZM.gun();V3.vmMuz=null;V3.vm3=false;if(!g0||h.dead||h.unarmed||typeof EROE==='undefined'||!EROE.rig3d||typeof ARMI3D==='undefined'||V3.no3h)return;
  const id=W.gunId||'pistola';if(ARMI3D.ZOMBIE&&!ARMI3D.ZOMBIE.includes(id))return;let Q;try{Q=v3HeroRig(0)}catch(er){v3Err(er);return}const R=Q.R,G0=R.gun;if(!G0)return;
  const M0=v3Statics(),gm=v3GunMesh(G0.id,G0.st);if(!gm)return;const{add,mul,nrm,sub}=RG,E=V3.eye,Rr=V3.R3,U=V3.U3,F=V3.F3,gp=g0.pose();
  const V=(x,y,z)=>[E[0]+Rr[0]*x+U[0]*y+F[0]*z,E[1]+Rr[1]*x+U[1]*y+F[1]*z,E[2]+Rr[2]*x+U[2]*y+F[2]*z];
  const rl=G0.rl||0,eq=gp.eq!=null&&gp.eq<1?1-Math.min(1,gp.eq/.55):0,rec=v3cl(G0.rec||0,0,1),kk=G0.kick||[0,0],walk=h.moving?(h.walk||0):0,mv=h.moving?1:0;
  V3.vrl=(V3.vrl||0)+(rl-(V3.vrl||0))*Math.min(1,dt*8);const b=V3.vrl,K=V3.dbgVM||V3VM[G0.cls]||V3VM.long;
  // where the hand holds it (low on the right, its place by the kind of weapon), where the barrel points (toward the middle, so its side
  // shows), the steps, the kick of the shot, the reload (down, nearer the middle, on its side, the muzzle up), the weapon just taken (from below)
  const ax=K.p[0]+Math.cos(walk*.5)*.35*mv-b*1.3,ay=K.p[1]+Math.abs(Math.sin(walk*.5))*.4*mv+b*1.7-eq*7,az=K.p[2]-kk[0]*rec*.55+b*1.4,yw=K.yw+b*.12,pt=K.pt+kk[1]*rec*.9+b*.28-eq*.7;
  const O=V(ax,ay,az),aimV=[-Math.sin(yw)*Math.cos(pt),Math.sin(pt),Math.cos(yw)*Math.cos(pt)];
  let aimW=nrm(sub(V(aimV[0],aimV[1],aimV[2]),E)),upW=nrm(sub(V(0,1,0),E));
  // the roll: a little to the left at rest, much more in the reload (the bottom of the weapon toward the free hand)
  const roll=-K.rl-b*.85,side=nrm(RG.cross(upW,aimW));upW=nrm(add(mul(upW,Math.cos(roll)),mul(side,Math.sin(roll))));
  const sc=K.sc,fr=ARMI3D.frame(O,aimW,upW,(G0.s||1)*sc),MG=v3M4(mul(fr.X,fr.s),mul(fr.Y,fr.s),mul(fr.Z,fr.s),fr.O),S=R.S,items=[{m:gm.mesh,M:MG,out:.14}];
  const hd=G0.hands(gm.kp),hand=(q,r)=>{const p=v3Pt(MG,q);r*=sc;items.push({m:M0.ball2,M:v3M4([r,0,0],[0,r,0],[0,0,r],p),tint:v3Tint(S.hand),out:.15});return p};
  // the arms: the sleeves from below the screen to the wrists, a cuff of the darker colour
  const sleeve=(p,from)=>{const dn=nrm(sub(from,p)),wr=add(p,mul(dn,1.5*sc));items.push(v3SegItem(from,wr,1.75*sc,S.body,.15));items.push(v3SegItem(add(wr,mul(dn,-.2*sc)),add(wr,mul(dn,1*sc)),1.95*sc,RG.mix(S.body,'#0d1418',.28),.15))};
  if(hd.rh){const p=hand(hd.rh,2.6);sleeve(p,V(ax+5,ay-9,az-6))}if(hd.lh){const p=hand(hd.lh,2.5);sleeve(p,V(ax-7,ay-10,az-4))}
  v3Draw3(items,null,1,0,true);
  if(gm.kp.muzzle){const mz=v3Pt(MG,gm.kp.muzzle),q=v3P(mz[0],mz[1],mz[2]);V3.vmMuz=q?[q[0],q[1]]:null;V3.muz=mz;V3.muzF=G0.flash||0;
    // the flash at the muzzle: two soft lights added on top
    const fl=v3cl(G0.flash||0,0,1);if(fl>0&&!LOWFX){const gl=V3.gl,G=V3.glowA;gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);gl.depthRange(0,.03);
      v3Q(mz[0],mz[1],mz[2],-9*fl,-9*fl,9*fl,9*fl,G.u0,G.v0,G.u1,G.v1,1,.62,.25,1);v3Q(mz[0],mz[1],mz[2],-3.4*fl,-3.4*fl,3.4*fl,3.4*fl,G.u0,G.v0,G.u1,G.v1,1,.95,.8,1);
      const fp=V3.fogP;V3.fogP=[1e5,1,0];v3QFlush(V3.pA,V3A.pages[G.p].tex,V3.U3,0,true);V3.fogP=fp;gl.depthRange(0,1);gl.depthMask(true);gl.disable(gl.BLEND)}}
  V3.vm3=true}
// the painted head of the game, seen from the right side as a ball standing in its place (a little toward the camera, so the shoulders
// never cover it): for the heroes whose heads have pieces of their own
function v3HeadImp(R,Hw,a){const e=V3.eye,R0=CR._rig,crk=Object.assign({},R0.cam),rgk=Object.assign({},RIGCAM),dx=Hw[0]-e[0],dy=Hw[1]-e[1],dz=Hw[2]-e[2],d=Math.hypot(dx,dy,dz);
  const el=Math.round(Math.atan2(-dz,Math.max(1,Math.hypot(dx,dy)))/.052)*.052,tl=v3Tilt(el),psi=-Math.PI/2-Math.atan2(dy,dx),ang=R.head.yaw+psi,dpr=Math.min(2,V3.cw/V3.W),box=[-26,-34,26,20];
  const pull=Math.min(R.Rh*.9,d*.5),k=v3cl(v3K(d)*dpr,.5,6),sc=(d-pull)/d,cx=Hw[0]-dx/d*pull,cy=Hw[1]-dy/d*pull,cz=Hw[2]-dz/d*pull;let S=null;
  try{Object.assign(R0.cam,{k:tl.k,zk:tl.zk});RIGCAM.kr=tl.kr;RIGCAM.zk=tl.zk;S=v3Sprite('hhead',box,k,()=>R.paintHead(ang),null)}finally{Object.assign(R0.cam,crk);Object.assign(RIGCAM,rgk)}
  if(!S)return;const gl=V3.gl;v3Q(cx,cy,cz,box[0]*sc,-box[3]*sc,box[2]*sc,-box[1]*sc,S.u0,S.v0,S.u1,S.v1,1,1,1,1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  v3QFlush(V3.pB,V3.spr.tex,V3.U3,.3);gl.disable(gl.BLEND)}
// a soft round shadow on the floor under someone
function v3Blob(x,y,z,r){const S=V3.shadowA;if(!S)return;(V3.blobs=V3.blobs||[]).push([x,y,z,r])}
function v3Blobs(){const B=V3.blobs,S=V3.shadowA;if(!B||!B.length||!S)return;const gl=V3.gl,R3=V3.R3;V3.R3=[1,0,0];for(const[x,y,z,r] of B)v3Q(x,y,z+.45,-r,-r,r,r,S.u0,S.v0,S.u1,S.v1,1,1,1,1);B.length=0;
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-3);
  v3QFlush(V3.pB,V3A.pages[S.p].tex,[0,1,0],.01);V3.R3=R3;gl.disable(gl.POLYGON_OFFSET_FILL);gl.depthMask(true);gl.disable(gl.BLEND)}
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
    if(!h.dead&&!V3.dbgCam){const cx=Wp/2,cy=V3.mode==='prima'?Hp/2:Hp*.45,lk=!!tg;g.strokeStyle=lk?'rgba(255,150,130,.95)':'rgba(240,244,255,.8)';g.lineWidth=1.6;g.lineCap='round';
      if(V3.mode==='prima'){for(const[a,b] of[[0,1],[1,0],[0,-1],[-1,0]]){g.beginPath();g.moveTo(cx+a*5,cy+b*5);g.lineTo(cx+a*11,cy+b*11);g.stroke()}}
      g.fillStyle=g.strokeStyle;g.beginPath();g.arc(cx,cy,1.6,0,Math.PI*2);g.fill()}
    if(V3.mode==='prima'&&!V3.vm3)v3Viewmodel(dt,Wp,Hp);}catch(e){v3Err(e)}finally{g.restore()}}
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
