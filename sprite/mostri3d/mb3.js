// Mossbound · i modelli fatti con Meshy: un glTF binario (.glb) con lo scheletro e le mosse, letto e disegnato col nostro WebGL,
// senza librerie (come il resto del gioco); anche i modelli costruiti da noi nel codice (sprite/mostri3d/zombie.js). Note in sprite/mostri3d/LEGGIMI.md.
// MB3.readGLB(buf) → {json, bin}; MB3.model(g) → modello (nodi, scheletro, pezzi, materiali, immagini, mosse);
// MB3.pose(m, st, out) → le matrici delle ossa per un momento (una mossa, oppure due che sfumano, più i ritocchi fatti da noi);
// MB3.gpu(gl, m) prepara buffer, texture e programmi; MB3.draw(gl, R, m, J, cam, o) disegna (contorno spesso, tre toni, bordo di luna,
// occhi che brillano). Gira anche in Node (lettura e mosse, per sprite/mostri3d/prepara.js); il disegno solo nel browser (WebGL 2).
(function(root){
'use strict';
// ---------- 1. little maths (matrices by columns, as GL wants them) ----------
const m4=()=>{const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m};
function mul(o,a,b){const r=o===a||o===b?new Float32Array(16):o;for(let c=0;c<4;c++)for(let i=0;i<4;i++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+i]*b[c*4+k];r[c*4+i]=s}if(r!==o)o.set(r);return o}
function trs(o,t,q,s){const x=q[0],y=q[1],z=q[2],w=q[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
  o[0]=(1-(yy+zz))*s[0];o[1]=(xy+wz)*s[0];o[2]=(xz-wy)*s[0];o[3]=0;o[4]=(xy-wz)*s[1];o[5]=(1-(xx+zz))*s[1];o[6]=(yz+wx)*s[1];o[7]=0;
  o[8]=(xz+wy)*s[2];o[9]=(yz-wx)*s[2];o[10]=(1-(xx+yy))*s[2];o[11]=0;o[12]=t[0];o[13]=t[1];o[14]=t[2];o[15]=1;return o}
function persp(o,fy,asp,n,f){const t=1/Math.tan(fy/2);o.fill(0);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o}
function look(o,e,c,u){let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2],l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;
  let xx=u[1]*zz-u[2]*zy,xy=u[2]*zx-u[0]*zz,xz=u[0]*zy-u[1]*zx;l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
  o[0]=xx;o[1]=yx;o[2]=zx;o[3]=0;o[4]=xy;o[5]=yy;o[6]=zy;o[7]=0;o[8]=xz;o[9]=yz;o[10]=zz;o[11]=0;
  o[12]=-(xx*e[0]+xy*e[1]+xz*e[2]);o[13]=-(yx*e[0]+yy*e[1]+yz*e[2]);o[14]=-(zx*e[0]+zy*e[1]+zz*e[2]);o[15]=1;return o}
const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const qaxis=(ax,ay,az,an)=>{const l=Math.hypot(ax,ay,az)||1,s=Math.sin(an/2)/l;return[ax*s,ay*s,az*s,Math.cos(an/2)]};
function nlerp(o,a,b,w){const d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],k=d<0?-w:w,u=1-w;let x=a[0]*u+b[0]*k,y=a[1]*u+b[1]*k,z=a[2]*u+b[2]*k,v=a[3]*u+b[3]*k;const l=Math.hypot(x,y,z,v)||1;o[0]=x/l;o[1]=y/l;o[2]=z/l;o[3]=v/l;return o}
// a rotation of a whole bone about its own root, given in the space of the model (so it does not matter how the bone's axes are set)
function rotAbout(W,q){const p0=W[12],p1=W[13],p2=W[14],R=trs(new Float32Array(16),[0,0,0],q,[1,1,1]);W[12]=W[13]=W[14]=0;mul(W,R,W);W[12]+=p0;W[13]+=p1;W[14]+=p2;return W}
// ---------- 2. reading a .glb ----------
function readGLB(buf){const ab=buf instanceof ArrayBuffer?buf:buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),dv=new DataView(ab);
  if(dv.getUint32(0,true)!==0x46546C67)throw new Error('non è un .glb');let o=12,json=null,bin=null;
  while(o+8<=ab.byteLength){const n=dv.getUint32(o,true),ty=dv.getUint32(o+4,true),ch=ab.slice(o+8,o+8+n);
    if(ty===0x4E4F534A)json=JSON.parse(typeof TextDecoder!=='undefined'?new TextDecoder().decode(ch):Buffer.from(ch).toString('utf8'));else if(ty===0x004E4942)bin=ch;o+=8+n}
  return{json,bin}}
const CT={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
// an accessor as its own typed array (copied, never interleaved); with `fl` the integers come back as floats (0..1 when normalized)
function accessor(g,i,fl){const a=g.json.accessors[i],C=CT[a.componentType],n=NC[a.type],cnt=a.count*n;let out=new C(cnt);
  if(a.bufferView!==undefined){const bv=g.json.bufferViews[a.bufferView],bo=(bv.byteOffset||0)+(a.byteOffset||0),es=C.BYTES_PER_ELEMENT,st=bv.byteStride||n*es;
    if(st===n*es&&bo%es===0)out.set(new C(g.bin,bo,cnt));else{const dv=new DataView(g.bin),rd={5120:'getInt8',5121:'getUint8',5122:'getInt16',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType];
      for(let e=0;e<a.count;e++)for(let c=0;c<n;c++)out[e*n+c]=dv[rd](bo+e*st+c*es,true)}}
  if(fl&&!(out instanceof Float32Array)){const f=new Float32Array(cnt),d=a.normalized?{5120:127,5121:255,5122:32767,5123:65535}[a.componentType]||1:1;for(let k=0;k<cnt;k++)f[k]=Math.max(-1,out[k]/d)||0;if(a.normalized)out=f;else{for(let k=0;k<cnt;k++)f[k]=out[k];out=f}}
  out.n=n;return out}
// ---------- 3. the model: nodes, skeleton, pieces, materials, images, moves ----------
function model(g){const J=g.json,nodes=(J.nodes||[]).map((n,i)=>({i,name:n.name||('nodo'+i),t:n.translation?n.translation.slice():[0,0,0],r:n.rotation?n.rotation.slice():[0,0,0,1],
    s:n.scale?n.scale.slice():[1,1,1],m:n.matrix?Float32Array.from(n.matrix):null,kids:n.children||[],parent:-1,mesh:n.mesh,skin:n.skin}));
  nodes.forEach(n=>n.kids.forEach(k=>{nodes[k].parent=n.i}));
  const order=[],seen=new Uint8Array(nodes.length),walk=i=>{if(seen[i])return;seen[i]=1;order.push(i);nodes[i].kids.forEach(walk)};nodes.forEach(n=>{if(n.parent<0)walk(n.i)});
  const sk=(J.skins||[])[0],skin=sk?{joints:sk.joints.slice(),ibm:sk.inverseBindMatrices!==undefined?accessor(g,sk.inverseBindMatrices,true):null}:null;
  if(skin&&!skin.ibm){skin.ibm=new Float32Array(skin.joints.length*16);for(let j=0;j<skin.joints.length;j++)skin.ibm.set(m4(),j*16)}
  const imgs=(J.images||[]).map(im=>{if(im.bufferView===undefined)return null;const bv=J.bufferViews[im.bufferView];return{mime:im.mimeType||'image/png',bytes:new Uint8Array(g.bin,bv.byteOffset||0,bv.byteLength)}});
  const tex=t=>t&&J.textures&&J.textures[t.index]?J.textures[t.index].source:undefined;
  const mats=(J.materials||[]).map(ma=>{const p=ma.pbrMetallicRoughness||{};return{name:ma.name||'',base:tex(p.baseColorTexture),baseF:p.baseColorFactor||[1,1,1,1],nrm:tex(ma.normalTexture),
    em:tex(ma.emissiveTexture),emF:ma.emissiveFactor||[0,0,0],mr:tex(p.metallicRoughnessTexture),dbl:!!ma.doubleSided,alpha:ma.alphaMode||'OPAQUE'}});
  const prims=[];let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  nodes.forEach(n=>{if(n.mesh===undefined)return;for(const p of J.meshes[n.mesh].primitives){const A=p.attributes;if(A.POSITION===undefined)continue;
    const pos=accessor(g,A.POSITION,true),q={node:n.i,mat:p.material,pos,nrm:A.NORMAL!==undefined?accessor(g,A.NORMAL,true):null,uv:A.TEXCOORD_0!==undefined?accessor(g,A.TEXCOORD_0,true):null,
      jnt:A.JOINTS_0!==undefined?accessor(g,A.JOINTS_0,true):null,wgt:A.WEIGHTS_0!==undefined?accessor(g,A.WEIGHTS_0,true):null,idx:p.indices!==undefined?accessor(g,p.indices):null,mode:p.mode===undefined?4:p.mode};
    if(!q.idx){q.idx=new Uint32Array(pos.length/3);for(let k=0;k<q.idx.length;k++)q.idx[k]=k}
    if(!q.nrm)q.nrm=flatNormals(pos,q.idx);
    for(let k=0;k<pos.length;k+=3)for(let c=0;c<3;c++){if(pos[k+c]<mn[c])mn[c]=pos[k+c];if(pos[k+c]>mx[c])mx[c]=pos[k+c]}
    prims.push(q)}});
  const m={nodes,order,skin,imgs,mats,prims,box:{mn,mx},byName:{}};nodes.forEach(n=>{m.byName[n.name]=n.i});
  m.clips=(J.animations||[]).map((a,k)=>clipOf(g,a,k));return m}
function flatNormals(p,ix){const n=new Float32Array(p.length);for(let k=0;k<ix.length;k+=3){const a=ix[k]*3,b=ix[k+1]*3,c=ix[k+2]*3,
  ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2],x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;for(const e of[a,b,c]){n[e]+=x;n[e+1]+=y;n[e+2]+=z}}
  for(let k=0;k<n.length;k+=3){const l=Math.hypot(n[k],n[k+1],n[k+2])||1;n[k]/=l;n[k+1]/=l;n[k+2]/=l}return n}
// a move of the file: for every channel the times and the values (translation, rotation or scale of one node)
function clipOf(g,a,k){const ch=[];let dur=0;for(const c of a.channels){const s=a.samplers[c.sampler],p=c.target.path;if(c.target.node===undefined||!/^(translation|rotation|scale)$/.test(p))continue;
    const t=accessor(g,s.input,true),v=accessor(g,s.output,true);if(t.length)dur=Math.max(dur,t[t.length-1]);ch.push({node:c.target.node,path:p,t,v,n:p==='rotation'?4:3,cs:s.interpolation==='CUBICSPLINE',st:s.interpolation==='STEP',last:0})}
  return{name:a.name||('mossa'+k),dur,ch}}
// the value of a channel at time t (straight lines between the keys; rotations on the sphere)
function sample(c,t,o){const T=c.t,n=c.n,N=T.length;if(!N)return o;let i=c.last;if(i>=N||T[i]>t)i=0;while(i+1<N&&T[i+1]<=t)i++;c.last=i;
  const V=c.v,sp=c.cs?3:1,off=c.cs?n:0;if(i+1>=N||t<=T[0]){const e=(t<=T[0]?0:N-1)*n*sp+off;for(let k=0;k<n;k++)o[k]=V[e+k];return o}
  const w=c.st?0:(t-T[i])/((T[i+1]-T[i])||1),a=i*n*sp+off,b=(i+1)*n*sp+off;
  if(n===4)return nlerp(o,[V[a],V[a+1],V[a+2],V[a+3]],[V[b],V[b+1],V[b+2],V[b+3]],w);for(let k=0;k<n;k++)o[k]=V[a+k]+(V[b+k]-V[a+k])*w;return o}
// ---------- 4. the pose of a moment ----------
// st = {a:{clip,t}, b:{clip,t}|null, w (how much of a over b), tw:{node:quaternion in the space of the model}, tr:{node:[x,y,z] added to the translation}}
// out (optional): Float32Array(nodes*16) for the matrices of the nodes; returns {W, J} (J = the matrices of the bones for the drawing)
function pose(m,st,out){const N=m.nodes.length,W=out&&out.W||new Float32Array(N*16),L=new Float32Array(16),T=[0,0,0],R=[0,0,0,1],S=[1,1,1],ta=[0,0,0],ra=[0,0,0,1];
  const tA=locals(m,st.a),tB=st.b&&st.w<1?locals(m,st.b):null;
  for(const i of m.order){const n=m.nodes[i];let has=false;
    if(tA[i]||tB&&tB[i]){has=true;const a=tA[i]||{},b=tB&&tB[i]||{};
      for(let c=0;c<3;c++){T[c]=n.t[c];S[c]=n.s[c]}R[0]=n.r[0];R[1]=n.r[1];R[2]=n.r[2];R[3]=n.r[3];
      if(tB){mixInto(T,b.t,n.t,a.t,st.w,3);mixInto(S,b.s,n.s,a.s,st.w,3);const rb=b.r||n.r,rA=a.r||n.r;nlerp(R,rb,rA,st.w)}
      else{if(a.t)for(let c=0;c<3;c++)T[c]=a.t[c];if(a.s)for(let c=0;c<3;c++)S[c]=a.s[c];if(a.r)for(let c=0;c<4;c++)R[c]=a.r[c]}}
    if(st.tr&&st.tr[i]){if(!has){has=true;for(let c=0;c<3;c++){T[c]=n.t[c];S[c]=n.s[c]}for(let c=0;c<4;c++)R[c]=n.r[c]}const d=st.tr[i];T[0]+=d[0];T[1]+=d[1];T[2]+=d[2]}
    const Wi=W.subarray(i*16,i*16+16);if(has)trs(L,T,R,S);else if(n.m)L.set(n.m);else trs(L,n.t,n.r,n.s);
    if(n.parent>=0)mul(Wi,W.subarray(n.parent*16,n.parent*16+16),L);else Wi.set(L);
    if(st.tw&&st.tw[i])rotAbout(Wi,st.tw[i])}
  let Jm=null;if(m.skin){const nj=m.skin.joints.length;Jm=out&&out.J||new Float32Array(nj*16);for(let j=0;j<nj;j++){const k=m.skin.joints[j];mul(Jm.subarray(j*16,j*16+16),W.subarray(k*16,k*16+16),m.skin.ibm.subarray(j*16,j*16+16))}}
  return{W,J:Jm}}
function mixInto(o,b,rest,a,w,n){const B=b||rest,A=a||rest;for(let c=0;c<n;c++)o[c]=B[c]+(A[c]-B[c])*w}
function locals(m,s){const r={};if(!s||!s.clip)return r;const c=s.clip,t=Math.max(0,Math.min(c.dur,s.t||0));
  for(const h of c.ch){const e=r[h.node]||(r[h.node]={});const v=h.n===4?[0,0,0,1]:[0,0,0];sample(h,t,v);e[h.path==='translation'?'t':h.path==='rotation'?'r':'s']=v}return r}
// ---------- 5. on the screen (WebGL 2) ----------
const VS=nj=>`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec2 aT;layout(location=3) in vec4 aJ;layout(location=4) in vec4 aW;
layout(location=5) in vec4 aC;layout(location=6) in vec4 aK;
uniform mat4 uVP,uM;uniform mat4 uJ[${nj}];uniform float uOut;uniform vec2 uPx;
out vec3 vN;out vec2 vT;out vec3 vW;out vec3 vR;out vec4 vC;out vec4 vK;
void main(){mat4 S=aW.x*uJ[int(aJ.x)]+aW.y*uJ[int(aJ.y)]+aW.z*uJ[int(aJ.z)]+aW.w*uJ[int(aJ.w)];mat4 MS=uM*S;
  vec4 w=MS*vec4(aP,1.);vec3 n=normalize(mat3(MS)*aN);vec4 c=uVP*w;
  if(uOut>0.){vec2 d=(uVP*vec4(n,0.)).xy;float l=length(d);if(l>1e-5)d/=l;c.xy+=d*uOut*aK.w*uPx*c.w;}
  vN=n;vT=aT;vW=w.xyz;vR=aP;vC=aC;vK=aK;gl_Position=c;}`;
// the paint of the pieces we build ourselves (aK.x = what it is): the marks stay on the body because they come from its place in the rest
// pose (vR): 1 skin (blotches, mottling, thin veins), 2 shirt (folds round the body, weave), 3 trousers (folds, mud at the bottom),
// 4 leather, 5 bone and teeth, 6 dark inside (mouth, sockets), 9 light (the eyes: they glow, no shading). aK.y blood, aK.z the soft
// shadow baked where pieces meet, aK.w how thick the outline is there. Models from a file (no aC, aK) are just their textures.
const FS=`#version 300 es
precision highp float;
in vec3 vN;in vec2 vT;in vec3 vW;in vec3 vR;in vec4 vC;in vec4 vK;
uniform sampler2D uBase,uNrm,uEm;uniform vec4 uBaseF;uniform float uHasN,uHasE,uNy,uEmK,uToon,uOut,uFlash,uEmOnly,uFogN,uFogF,uClipY,uNs,uBump;
uniform vec3 uEmF,uL,uLc,uAmb,uRim,uCam,uInk,uFogC,uTint;
out vec4 o;
mat3 cf(vec3 N,vec3 p,vec2 uv){vec3 a=dFdx(p),b=dFdy(p);vec2 c=dFdx(uv),d=dFdy(uv);vec3 b2=cross(b,N),a2=cross(N,a);vec3 T=b2*c.x+a2*d.x,B=b2*c.y+a2*d.y;
  float k=inversesqrt(max(max(dot(T,T),dot(B,B)),1e-20));return mat3(T*k,B*k,N);}
float h3(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){return n3(p)*.55+n3(p*2.07+3.1)*.3+n3(p*4.3+7.7)*.15;}
float bh(vec3 p,float K){if(K<1.5)return fb(p*1.6)+.35*n3(p*7.);if(K<2.5)return .6*sin(atan(p.x,p.z)*9.+fb(p*.7)*4.)*.5+.5*n3(p*vec3(9.,2.5,9.));if(K<3.5)return .5*sin(p.y*7.+fb(p)*3.)+.5*n3(p*8.);return fb(p*2.);}
vec3 bump(vec3 n,vec3 p,float K,float a){const float e=.06;float h=bh(p,K);vec3 g=vec3(bh(p+vec3(e,0,0),K)-h,bh(p+vec3(0,e,0),K)-h,bh(p+vec3(0,0,e),K)-h)/e;g-=n*dot(g,n);return normalize(n-g*a);}
void main(){if(vW.y<uClipY)discard;if(uOut>.5){o=vec4(uInk,1.);return;}
  vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;
  vec4 b=texture(uBase,vT)*uBaseF;b.rgb*=uTint*vC.rgb;
  float K=vK.x,sp=0.;vec3 R=vR*uNs;
  if(K>.5&&K<1.5){b.rgb*=mix(1.,.74,smoothstep(.5,.66,fb(R*.9)));b.rgb*=.9+.18*n3(R*6.2);float vv=fb(R*2.3+5.);b.rgb*=1.-.2*smoothstep(.465,.49,vv)*(1.-smoothstep(.49,.515,vv));sp=.12;}
  else if(K>1.5&&K<2.5){float an=atan(vR.x,vR.z),fo=sin(an*9.+fb(R*.7)*4.+vR.y*.15);b.rgb*=.8+.2*fo+.06*sin(an*23.+vR.y*.6);b.rgb*=.9+.14*n3(R*15.);}
  else if(K>2.5&&K<3.5){b.rgb*=.88+.12*n3(R*12.);b.rgb*=.9+.1*sin(vR.y*2.2+fb(R)*3.);b.rgb=mix(b.rgb,b.rgb*.55+vec3(.035,.03,.02),smoothstep(5.,1.,vR.y)*.65);}
  else if(K>3.5&&K<4.5){b.rgb*=.88+.16*n3(R*5.);sp=.3;}
  else if(K>4.5&&K<5.5){b.rgb*=.88+.14*n3(R*8.);sp=.4;}
  b.rgb=mix(b.rgb,vec3(.2,.045,.035),smoothstep(.55,.68,fb(R*.75+11.))*vK.y*.9);b.rgb*=1.-.62*vK.z;
  if(uBump>0.&&K>.5&&K<5.5)n=bump(n,R,K,uBump*(K<1.5?.045:K<2.5?.05:K<3.5?.04:.03));
  if(uHasN>.5){vec3 q=texture(uNrm,vT).xyz*2.-1.;q.y*=uNy;n=normalize(cf(n,vW,vT)*q);}
  vec3 e=uHasE>.5?texture(uEm,vT).rgb*uEmF:vec3(0.);if(K>8.5)e+=b.rgb*.5;
  if(uEmOnly>.5){o=vec4(e*uEmK,1.);return;}
  if(K>8.5){o=vec4(mix(b.rgb*(.82+.12*uEmK),vec3(1.),uFlash),1.);return;}
  float d=dot(n,uL),k1=smoothstep(-.14,.06,d),k2=smoothstep(.40,.58,d);
  vec3 sh=b.rgb*uAmb,li=b.rgb*uLc,mi=mix(sh,li,.55);vec3 c=mix(sh,mix(mi,li,k2),k1);
  vec3 sf=b.rgb*(uAmb+(uLc-uAmb)*clamp(d*.5+.5,0.,1.)*1.1);c=mix(sf,c,uToon);
  vec3 v=normalize(uCam-vW);float r=pow(1.-max(dot(n,v),0.),3.);
  if(K>5.5&&K<6.5){c=b.rgb*(.55+.45*k1);r*=.2;}
  c+=uRim*r*(.3+.7*smoothstep(-.3,.3,dot(n,normalize(vec3(-uL.x,.25,-uL.z)))));
  if(sp>0.){float s=pow(max(dot(n,normalize(uL+v)),0.),28.);c+=uLc*sp*smoothstep(.45,.6,s)*k1;}
  c+=e*uEmK;c=mix(c,vec3(1.,.97,.92),uFlash);
  float f=smoothstep(uFogN,uFogF,length(vW-uCam));c=mix(c,uFogC,f);o=vec4(c,1.);}`;
function sh(gl,t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error('shader: '+gl.getShaderInfoLog(x));return x}
function prog(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,sh(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('programma: '+gl.getProgramInfoLog(p));const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i),nm=a.name.replace(/\[0\]$/,'');u[nm]=gl.getUniformLocation(p,a.name)}return{p,u}}
async function texOf(gl,im,lin){const blob=new Blob([im.bytes],{type:im.mime});let src;
  try{src=await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'})}catch(e){src=await new Promise((ok,ko)=>{const I=new Image();I.onload=()=>ok(I);I.onerror=ko;I.src=URL.createObjectURL(blob)})}
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);const an=gl.getExtension('EXT_texture_filter_anisotropic');if(an)gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,4);
  if(src.close)src.close();return t}
async function gpu(gl,m){const nj=m.skin?m.skin.joints.length:1,P=prog(gl,VS(nj),FS),R={P,nj,prims:[],tex:[],white:null,black:null};
  const solid=c=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(c));return t};
  R.white=solid([255,255,255,255]);R.black=solid([0,0,0,255]);R.tex=await Promise.all(m.imgs.map(im=>im?texOf(gl,im):null));
  for(const q of m.prims){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const buf=(loc,a,n)=>{if(!a){gl.disableVertexAttribArray(loc);return}const b=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0)};
    buf(0,q.pos,3);buf(1,q.nrm,3);buf(2,q.uv,2);buf(3,q.jnt,4);buf(4,q.wgt,4);buf(5,q.col,4);buf(6,q.knd,4);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
    const ix=q.idx instanceof Uint32Array&&q.pos.length/3<65536?Uint16Array.from(q.idx):q.idx;gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,ix,gl.STATIC_DRAW);gl.bindVertexArray(null);
    R.prims.push({vao,n:ix.length,type:ix instanceof Uint32Array?gl.UNSIGNED_INT:ix instanceof Uint16Array?gl.UNSIGNED_SHORT:gl.UNSIGNED_BYTE,mat:m.mats[q.mat]||{},skinned:!!(q.jnt&&q.wgt),col:!!q.col,knd:!!q.knd,node:q.node})}
  return R}
// cam = {VP, eye, px:[2/w,2/h]}; o = {M (place of the model), L (towards the light), Lc, amb, rim, ink, out (outline width in pixels), toon (0..1),
//   emK (strength of the eyes), flash, fog:[near,far], fogC, tint, emOnly, ny (sign of the green of the normal map), clipY (nothing under it is drawn),
//   bump (how much the painted relief catches the light: 0 with reduced effects)}
const I16=m4();
function draw(gl,R,m,Jm,cam,o){const {p,u}=R.P;gl.useProgram(p);gl.uniformMatrix4fv(u.uVP,false,cam.VP);gl.uniformMatrix4fv(u.uM,false,o.M||I16);
  if(Jm)gl.uniformMatrix4fv(u.uJ,false,Jm);gl.uniform2fv(u.uPx,cam.px);gl.uniform3fv(u.uL,o.L);gl.uniform3fv(u.uLc,o.Lc);gl.uniform3fv(u.uAmb,o.amb);gl.uniform3fv(u.uRim,o.rim);
  gl.uniform3fv(u.uCam,cam.eye);gl.uniform3fv(u.uInk,o.ink||[.07,.06,.06]);gl.uniform1f(u.uToon,o.toon===undefined?1:o.toon);gl.uniform1f(u.uEmK,o.emK===undefined?1:o.emK);
  gl.uniform1f(u.uFlash,o.flash||0);gl.uniform1f(u.uNs,m.ns||.3);gl.uniform1f(u.uBump,o.bump===undefined?1:o.bump);gl.uniform1f(u.uClipY,o.clipY===undefined?-1e9:o.clipY);gl.uniform1f(u.uEmOnly,o.emOnly?1:0);gl.uniform1f(u.uNy,o.ny===undefined?1:o.ny);gl.uniform3fv(u.uTint,o.tint||[1,1,1]);
  const fg=o.fog||[1e5,2e5];gl.uniform1f(u.uFogN,fg[0]);gl.uniform1f(u.uFogF,fg[1]);gl.uniform3fv(u.uFogC,o.fogC||[0,0,0]);
  gl.uniform1i(u.uBase,0);gl.uniform1i(u.uNrm,1);gl.uniform1i(u.uEm,2);
  const pass=(out)=>{gl.uniform1f(u.uOut,out);for(const q of R.prims){const ma=q.mat;
      if(!q.skinned){gl.vertexAttrib4f(3,0,0,0,0);gl.vertexAttrib4f(4,1,0,0,0)}if(!q.col)gl.vertexAttrib4f(5,1,1,1,1);if(!q.knd)gl.vertexAttrib4f(6,0,0,0,1);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,ma.base!==undefined&&R.tex[ma.base]||R.white);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,ma.nrm!==undefined&&R.tex[ma.nrm]||R.white);
      gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,ma.em!==undefined&&R.tex[ma.em]||R.black);
      gl.uniform1f(u.uHasN,ma.nrm!==undefined&&R.tex[ma.nrm]&&!o.noNrm?1:0);gl.uniform1f(u.uHasE,ma.em!==undefined&&R.tex[ma.em]?1:0);
      gl.uniform3fv(u.uEmF,ma.emF&&(ma.emF[0]||ma.emF[1]||ma.emF[2])?ma.emF:[1,1,1]);gl.uniform4fv(u.uBaseF,ma.baseF||[1,1,1,1]);
      gl.bindVertexArray(q.vao);gl.drawElements(gl.TRIANGLES,q.n,q.type,0)}gl.bindVertexArray(null)};
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);
  if(o.out>0&&!o.emOnly){gl.cullFace(gl.FRONT);pass(o.out);gl.cullFace(gl.BACK)}
  gl.uniform1f(u.uOut,0);pass(0);gl.disable(gl.CULL_FACE)}
const MB3={readGLB,accessor,model,pose,sample,gpu,draw,m4,mul,trs,persp,look,qmul,qaxis,nlerp,rotAbout,flatNormals};
if(typeof module!=='undefined'&&module.exports)module.exports=MB3;else root.MB3=MB3;
})(typeof window!=='undefined'?window:this);
