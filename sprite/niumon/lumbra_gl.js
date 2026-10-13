// MESSO DA PARTE (13 ottobre, sera): il piano degli sprite di Niumon (versione 1.1) vuole creature e personaggi solo in pixel art 2D,
// il 3D solo per il mondo. Questa prova resta qui come esperimento, non è nel gioco né nelle anteprime.
// Lumbra, il Niumon d'ombra, in 3D «a volumi morbidi» (13 ottobre, richiesta di Denis: «prova ad animarlo sia in 2d che in 3d», dopo il
// foglio «nel mio stile»). Il corpo è fatto di volumi che si fondono uno nell'altro come la creta (campo di distanza con unione morbida):
// testa tonda, muso, criniera di fiamme, cresta, collo, petto, corpo, zampe a due ossa, ciuffi a uncino e code di fumo. Si disegna con
// WebGL2 come il foglio: contorno scuro spesso solo sulla sagoma, linea sottile dove una parte ne copre un'altra, quattro toni di grigio
// con la luce dall'alto a sinistra (la luce gira con la telecamera, come nei disegni), pieghe più scure, fumo dal grigio al viola,
// occhi viola a mandorla dipinti sulla testa (sbattono e guardano), ombra viola per terra.
// Misure prese dal foglio (1 unità = 25 px del disegno di lato): x avanti, y verso il fianco sinistro di Lumbra, z in su, zampe a z = 0.
// Uso: const L = new Lumbra3D(canvas); L.draw({yaw, elev, anim, p, scale, cx, cy, q}); yaw 0 = di fronte, π/2 = di lato con la testa a
// sinistra (il «Lato» del foglio), π = da dietro. Ogni mossa dipende solo da p (0..1), così l'ultimo fotogramma si collega al primo.
(function(G){'use strict';
const VS=`#version 300 es
in vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS=`#version 300 es
precision highp float;precision highp int;precision highp sampler2D;
uniform sampler2D uP;uniform int uNG;uniform vec4 uGB[16];uniform ivec2 uGR[16];
uniform vec3 uCo,uCd,uCx,uCy;uniform vec2 uOff;uniform float uPx;uniform vec4 uBS;
uniform float uLW,uLW2;uniform vec3 uL;
uniform vec3 uHO,uHR;uniform mat3 uHM;uniform vec4 uEye,uEye2,uEye3,uMou;
uniform vec4 uSh;uniform int uQ;
out vec4 oC;
const vec3 INK=vec3(.106,.086,.075);
const vec3 F0=vec3(.294,.275,.322),F1=vec3(.545,.525,.565),F2=vec3(.749,.729,.753),F3=vec3(.937,.922,.910);
const vec3 S0=vec3(.290,.200,.533),S1=vec3(.478,.341,.776),S2=vec3(.659,.533,.910),S3=vec3(.863,.804,.984);
vec3 qrot(vec4 q,vec3 v){return v+2.0*cross(q.xyz,cross(q.xyz,v)+q.w*v);}
float sdRC(vec3 p,vec3 a,vec3 b,float r1,float r2){
  vec3 ba=b-a;float l2=dot(ba,ba);float rr=r1-r2;float a2=l2-rr*rr;float il2=1.0/l2;
  vec3 pa=p-a;float y=dot(pa,ba);float z=y-l2;vec3 xv=pa*l2-ba*y;float x2=dot(xv,xv);float y2=y*y*l2;float z2=z*z*l2;
  float k=sign(rr)*rr*rr*x2;
  if(sign(z)*a2*z2>k)return sqrt(x2+z2)*il2-r2;
  if(sign(y)*a2*y2<k)return sqrt(x2+y2)*il2-r1;
  return (sqrt(x2*a2*il2)+y*rr)*il2-r1;}
float sdEl(vec3 p,vec3 r){float k0=length(p/r);float k1=length(p/(r*r));return k0*(k0-1.0)/max(k1,1e-6);}
vec2 map(vec3 p){
  float d=1e5,v=0.0;
  for(int g=0;g<uNG;g++){
    vec4 B=uGB[g];if(length(p-B.xyz)-B.w>d)continue;
    ivec2 GR=uGR[g];
    for(int c=GR.x;c<GR.y;c++){
      vec4 cb=texelFetch(uP,ivec2(c*2,1),0);if(length(p-cb.xyz)-cb.w>d)continue;
      vec4 cr=texelFetch(uP,ivec2(c*2+1,1),0);int i1=int(cr.y);
      for(int i=int(cr.x);i<i1;i++){
        vec4 t0=texelFetch(uP,ivec2(i*4,0),0),t1=texelFetch(uP,ivec2(i*4+1,0),0),t2=texelFetch(uP,ivec2(i*4+2,0),0);
        float di;
        if(t0.x<0.5)di=sdRC(p,t1.xyz,t2.xyz,t1.w,t2.w);
        else if(t0.x>2.5){vec3 nn=texelFetch(uP,ivec2(i*4+3,0),0).xyz;float hn=dot(p-t1.xyz,nn);di=sdRC(p+nn*hn*(1.0/t0.w-1.0),t1.xyz,t2.xyz,t1.w,t2.w)*t0.w;}
        else{vec4 q=texelFetch(uP,ivec2(i*4+3,0),0);di=sdEl(qrot(q,p-t1.xyz),t2.xyz);}
        float k=t0.y;
        if(t0.x>1.5&&t0.x<2.5){float h=clamp(0.5-0.5*(d+di)/k,0.0,1.0);d=mix(d,-di,h)+k*h*(1.0-h);continue;}
        float h=clamp(0.5+0.5*(di-d)/k,0.0,1.0);
        d=mix(di,d,h)-k*h*(1.0-h);v=mix(t0.z,v,h);
      }
    }
  }
  return vec2(d,v);}
vec3 nor(vec3 p){const float e=0.025;const vec2 k=vec2(1,-1);
  return normalize(k.xyy*map(p+k.xyy*e).x+k.yyx*map(p+k.yyx*e).x+k.yxy*map(p+k.yxy*e).x+k.xxx*map(p+k.xxx*e).x);}
float aoF(vec3 p,vec3 n){float o=0.0,s=1.0;for(int i=0;i<5;i++){float h=0.35+0.95*float(i);float d=map(p+n*h).x;o+=(h-d)*s;s*=0.72;}return clamp(1.0-0.11*o,0.0,1.0);}
float shd(vec3 p,vec3 l){float r=1.0,t=0.35;for(int i=0;i<22;i++){float h=map(p+l*t).x;r=min(r,5.0*h/t);t+=clamp(h,0.25,2.5);if(r<0.02||t>26.0)break;}return clamp(r,0.0,1.0);}
vec3 ramp4(float L,vec3 c0,vec3 c1,vec3 c2,vec3 c3,vec3 th,float w){
  vec3 c=mix(c0,c1,smoothstep(th.x-w,th.x+w,L));c=mix(c,c2,smoothstep(th.y-w,th.y+w,L));return mix(c,c3,smoothstep(th.z-w,th.z+w,L));}
// occhi e bocca dipinti sulla testa: coordinate angolari sull'ellissoide del cranio (ph dal davanti verso il fianco, th in su)
vec4 face(vec3 p){
  vec3 q=transpose(uHM)*(p-uHO);vec3 s=q/uHR;
  if(s.x<-0.1)return vec4(0);
  float side=s.y<0.0?-1.0:1.0;
  float ph=atan(s.y*side,s.x),th=atan(s.z,length(s.xy));
  vec4 o=vec4(0);
  // bocca: un sorrisetto largo con una piccola «w» in mezzo
  {float x=s.y/uMou.z;float yc=uMou.x+uMou.y*x*x+0.035*exp(-x*x*30.0);
   float dm=abs(th-yc)*uHR.z;float w=uMou.w*(1.0-smoothstep(0.7,1.0,abs(x)));
   float a=(1.0-smoothstep(w*0.5,w,dm))*(1.0-step(1.0,abs(x)));o=vec4(INK,1.0)*a*0.9;}
  // occhio: angolo interno tondo (in basso, verso il naso), punta esterna aguzza (in alto, verso la tempia)
  float dph=side>0.0?uEye2.z:uEye2.w;vec2 A=uEye.xy+vec2(dph,0.0),B=uEye.zw+vec2(dph,0.0);float cm=cos(0.5*(A.y+B.y));
  vec2 ax=vec2((B.x-A.x)*cm,B.y-A.y);float L=length(ax);vec2 u=ax/L,n=vec2(-u.y,u.x);
  vec2 r=vec2((ph-A.x)*cm,th-A.y);float a=dot(r,u)/L,b=dot(r,n)/L;
  if(a<-0.15||a>1.15)return o;
  float W=uEye3.x;
  float wr=a<0.3?sqrt(max(0.0,1.0-pow((0.3-a)/0.32,2.0))):pow(max(0.0,1.0-(a-0.3)/0.7),1.1);
  float wu=W*wr*0.95,wd=W*wr*1.1;
  float top=mix(wu,-wd*0.8,uEye3.y);
  float din=max(b-top,-wd-b);
  float lw=0.055+0.07*smoothstep(-0.1,0.25,b);
  if(din>lw)return o;
  vec3 c=INK;
  if(din<0.0){
    // iride grande che tocca la palpebra (sguardo cattivo), bianco dell'occhio lilla e in ombra sotto la palpebra
    vec2 ic=vec2(0.40+uEye2.x*0.10,0.04+uEye2.y*0.08);float ir=uEye3.z;
    float di=length(vec2(a,b)-ic)/ir;
    vec3 scl=mix(vec3(.30,.22,.42),vec3(.93,.89,.98),smoothstep(wu*0.2,-wd*0.6,b));
    float g=clamp((ic.y-b)/ir*0.5+0.5,0.0,1.0);
    vec3 iris=mix(vec3(.20,.11,.38),vec3(.50,.34,.82),smoothstep(0.05,0.6,g));
    iris=mix(iris,vec3(.86,.72,.97),smoothstep(0.55,1.0,g)*0.85);
    iris=mix(iris,vec3(.13,.06,.26),smoothstep(0.78,1.0,di)*0.85);
    float pu=length(vec2((a-ic.x)/0.55,b-ic.y))/ir;
    iris=mix(iris,vec3(.07,.03,.14),1.0-smoothstep(0.30,0.40,pu));
    c=mix(scl,iris,1.0-smoothstep(0.95,1.05,di));
    float hl=length(vec2(a,b)-ic-vec2(-0.25,0.30)*ir)/(0.24*ir);c=mix(c,vec3(1.0),1.0-smoothstep(0.75,1.0,hl));
    float hl2=length(vec2(a,b)-ic-vec2(0.32,-0.40)*ir)/(0.12*ir);c=mix(c,vec3(1.0),(1.0-smoothstep(0.6,1.0,hl2))*0.8);
    c*=1.0-0.45*smoothstep(top-0.10,top,b);
    c=mix(c,INK,smoothstep(-lw*0.5,0.0,din));
  }
  return mix(o,vec4(c,1.0),1.0-smoothstep(lw*0.6,lw,din));}
void main(){
  vec2 sp=(gl_FragCoord.xy-uOff)*uPx;
  vec3 ro=uCo+uCx*sp.x+uCy*sp.y,rd=uCd;
  vec4 col=vec4(0);
  if(rd.z<-0.01){float tg=-ro.z/rd.z;vec3 g=ro+rd*tg;vec2 e=(g.xy-uSh.xy)/uSh.zw;float rr=length(e);
    float a=0.34*(1.0-smoothstep(0.25,1.0,rr));col=vec4(vec3(.50,.45,.70)*a,a);}
  vec3 oc=ro-uBS.xyz;float b=dot(oc,rd),c=dot(oc,oc)-uBS.w*uBS.w,disc=b*b-c;
  if(disc>0.0){
    float sq=sqrt(disc),t=max(-b-sq,0.0),t1=-b+sq;
    float dPrev=1e9,dMin=1e9,gz=1e9,tgz=0.0;bool hit=false;vec2 m=vec2(0);
    for(int i=0;i<220;i++){
      vec3 p=ro+rd*t;m=map(p);float d=m.x;
      if(d<0.004){hit=true;break;}
      dMin=min(dMin,d);
      if(d>dPrev&&dPrev<uLW2&&gz>1e8){gz=dPrev;tgz=t;}
      dPrev=d;t+=max(d*0.9,0.003);
      if(t>t1)break;
    }
    if(hit){
      vec3 p=ro+rd*t;vec3 n=nor(p);float vio=clamp(m.y,0.0,1.0);
      float ao=uQ>0?aoF(p,n):1.0;
      float dl=dot(n,uL);
      float sh=(uQ>1&&dl>0.0)?shd(p+n*0.05,uL):1.0;
      float L=0.30+0.56*clamp(dl*0.5+0.5,0.0,1.0)*mix(0.5,1.0,sh);
      L*=mix(0.55,1.0,ao)*mix(0.84,1.0,smoothstep(1.0,15.0,p.z));
      vec3 fur=ramp4(L,F0,F1,F2,F3,vec3(0.36,0.555,0.93),0.045);
      vec3 smk=ramp4(L,S0,S1,S2,S3,vec3(0.34,0.54,0.86),0.06);
      vec3 cc=mix(fur,smk,smoothstep(0.05,0.95,vio));
      float fr=pow(1.0-clamp(dot(n,-rd),0.0,1.0),3.0);
      cc+=vec3(1.0,.92,.82)*fr*0.16*smoothstep(-0.3,0.6,dl);
      if(vio<0.5){vec4 f=face(p);cc=mix(cc,f.rgb,f.a);}
      if(gz<uLW2&&t-tgz>1.6){float la=1.0-smoothstep(uLW2*0.55,uLW2,gz);cc=mix(cc,INK,la);}
      col=vec4(cc,1.0);
    }else if(dMin<uLW){
      float a=1.0-smoothstep(uLW-1.2*uPx,uLW,dMin);
      col=vec4(INK*a,a)+col*(1.0-a);
    }
  }
  oC=col;}`;

// ------------------------------------------------------------------ vettori e rotazioni
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
  dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len=a=>Math.hypot(a[0],a[1],a[2]),nrm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]},lerp=(a,b,t)=>a+(b-a)*t,
  lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],cl=(v,a,b)=>v<a?a:v>b?b:v,
  sstep=(a,b,v)=>{const t=cl((v-a)/(b-a),0,1);return t*t*(3-2*t)},TAU=Math.PI*2;
const M={I:[1,0,0,0,1,0,0,0,1],
  x(a){const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,c,-s,0,s,c]},
  y(a){const c=Math.cos(a),s=Math.sin(a);return[c,0,s,0,1,0,-s,0,c]},
  z(a){const c=Math.cos(a),s=Math.sin(a);return[c,-s,0,s,c,0,0,0,1]},
  m(A,B){const R=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)R.push(A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j]);return R},
  ap(A,v){return[A[0]*v[0]+A[1]*v[1]+A[2]*v[2],A[3]*v[0]+A[4]*v[1]+A[5]*v[2],A[6]*v[0]+A[7]*v[1]+A[8]*v[2]]},
  t(A){return[A[0],A[3],A[6],A[1],A[4],A[7],A[2],A[5],A[8]]}};
function quat(m){const t=m[0]+m[4]+m[8];let x,y,z,w;
  if(t>0){const s=Math.sqrt(t+1)*2;w=.25*s;x=(m[7]-m[5])/s;y=(m[2]-m[6])/s;z=(m[3]-m[1])/s}
  else if(m[0]>m[4]&&m[0]>m[8]){const s=Math.sqrt(1+m[0]-m[4]-m[8])*2;w=(m[7]-m[5])/s;x=.25*s;y=(m[1]+m[3])/s;z=(m[2]+m[6])/s}
  else if(m[4]>m[8]){const s=Math.sqrt(1+m[4]-m[0]-m[8])*2;w=(m[2]-m[6])/s;x=(m[1]+m[3])/s;y=.25*s;z=(m[5]+m[7])/s}
  else{const s=Math.sqrt(1+m[8]-m[0]-m[4])*2;w=(m[3]-m[1])/s;x=(m[2]+m[6])/s;y=(m[5]+m[7])/s;z=.25*s}
  return[x,y,z,w]}
// due ossa con la cinematica inversa: da a verso b, lunghezze l1 e l2, il gomito piega verso hint
function ik2(a,b,l1,l2,hint){let d=sub(b,a),L=len(d);const Lm=(l1+l2)*.999;if(L>Lm){d=mul(d,Lm/L);L=Lm;b=add(a,d)}
  const u=nrm(d),h=nrm(sub(hint,mul(u,dot(hint,u)))),x=(l1*l1-l2*l2+L*L)/(2*L),y=Math.sqrt(Math.max(0,l1*l1-x*x));
  return{j:add(add(a,mul(u,x)),mul(h,y)),b}}

// ------------------------------------------------------------------ i pezzi: tronchi di cono arrotondati (t 0), ellissoidi (t 1), scavi (t 2)
// g = gruppo (testa, corpo, zampe, fumo…), s = mucchietto dentro il gruppo (ogni ciuffo è un mucchietto): il disegnatore salta
// i gruppi e i mucchietti lontani dal punto, così ogni passo del raggio guarda pochi pezzi.
function Bag(){this.P=[];this.g=0;this.s=0;this.n=1}
Bag.prototype.grp=function(g){this.g=g;this.s=this.n++};
Bag.prototype.rc=function(a,ra,b,rb,k,v){const d=len(sub(b,a)),m=Math.abs(ra-rb)*1.05+1e-3;if(d<m){const u=d>1e-4?nrm(sub(b,a)):[0,0,1];b=add(a,mul(u,m))}
  this.P.push({t:0,k:k||.6,v:v||0,a,ra,b,rb,g:this.g,s:this.s})};
Bag.prototype.el=function(ce,r,R,k,v){this.P.push({t:1,k:k||.6,v:v||0,ce,r,q:quat(M.t(R||M.I)),g:this.g,s:this.s})};
Bag.prototype.cut=function(ce,r,R,k){this.P.push({t:2,k:k||.4,v:0,ce,r,q:quat(M.t(R||M.I)),g:this.g,s:this.s})};
Bag.prototype.fc=function(a,ra,b,rb,n,fl,k,v){const d=len(sub(b,a)),m=Math.abs(ra-rb)*1.05+1e-3;if(d<m){const u=d>1e-4?nrm(sub(b,a)):[0,0,1];b=add(a,mul(u,m))}
  this.P.push({t:3,k:k||.6,v:v||0,a,ra,b,rb,n,fl,g:this.g,s:this.s})};
Bag.prototype.chain=function(pts,rad,vio,k){for(let i=0;i<pts.length-1;i++)this.rc(pts[i],rad[i],pts[i+1],rad[i+1],typeof k=='number'?k:k[i],typeof vio=='number'?vio:(vio[i]+vio[i+1])/2)};
Bag.prototype.own=function(f){const s=this.s;this.s=this.n++;f();this.s=s};

// ------------------------------------------------------------------ il corpo a riposo (spazio del corpo)
const PIV=[0,0,14],NECK=[7.5,0,19.5];
// cranio (le misure del disegno: fronte a x 20,4, mento a z 12,8, cima a z 29,2)
const HEAD={c:[12.7,0,20.9],r:[7.5,7.9,8.1]};
// un ciuffo a fiamma: esce dal corpo, si piega e chiude la punta a uncino (le onde del disegno)
function tuft(bag,base,out,bend,L,r0,sw,v,fl){out=nrm(out);bend=nrm(sub(bend,mul(out,dot(bend,out))));
  if(sw)bend=nrm(add(bend,mul(out,sw*.35)));
  const n=nrm(cross(out,bend)),f=(o,b)=>add(base,add(mul(out,L*o),mul(bend,L*b)));
  const P=[sub(base,mul(out,r0*.8)),f(.28,.03),f(.58,.30),f(.70,.70),f(.55,1.02),f(.30,1.08)];
  const R=[r0,r0*.82,r0*.62,r0*.40,r0*.19,r0*.04];
  bag.own(()=>{for(let i=0;i<P.length-1;i++)bag.fc(P[i],R[i],P[i+1],R[i+1],n,i?(fl||.6):1,i?r0*.16:r0*.5,v||0)})}
function onHead(ph,th){const c=Math.cos(th);const n=[c*Math.cos(ph)/HEAD.r[0],c*Math.sin(ph)/HEAD.r[1],Math.sin(th)/HEAD.r[2]];
  return{p:[HEAD.c[0]+HEAD.r[0]*c*Math.cos(ph),HEAD.c[1]+HEAD.r[1]*c*Math.sin(ph),HEAD.c[2]+HEAD.r[2]*Math.sin(th)],n:nrm(n)}}
// una scia di fumo: punti, raggi, viola; si gonfia a tratti come una nuvola
function smoke(bag,pts,rad,vio,k){const r=rad.map((x,i)=>x*(1+.16*Math.sin(i*2.3+.7)));bag.chain(pts,r,vio,k)}

// la posa dei piedi a riposo (il passo del disegno: dal lato vicino le zampe raccolte, dall'altro aperte)
const FEET={FL:[5.6,3.5,0],FR:[13.1,-3.5,0],HL:[-13.0,3.5,0],HR:[-5.4,-3.5,0]};
const HIPS={FL:[4.8,2.9,13.2],FR:[9.4,-2.9,13.2],HL:[-10.4,3.0,13.4],HR:[-7.4,-3.0,13.6]};
// ciuffi a fiamma, pochi e grandi come in una statuina: [x, y, z, uscita, piega, lunghezza, raggio, specchiato?]
const TH=[ // testa (spazio della testa a riposo): ciuffo in cima e criniera a tre fiamme per lato
  [14.4,0,28.0,[.3,0,1],[-1,0,.15],3.2,1.45],
  [12.0,5.0,26.6,[-.35,.6,.72],[-1,0,.3],4.6,1.85,1],[11.8,7.0,21.6,[-.45,.88,.05],[-.5,0,1],5.0,1.95,1],[12.0,5.8,15.6,[-.4,.75,-.5],[-.6,0,-1],4.4,1.8,1]];
const TB=[ // gorgiera sul petto, garrese, pancia
  [14.2,0,9.8,[.45,0,-1],[-1,0,-.2],3.8,1.75],[13.0,2.7,10.6,[.5,.55,-.8],[-.5,0,-1],3.4,1.6,1],
  [-0.6,0,22.0,[-.25,0,1],[-1,0,.05],4.2,1.85],[-1.2,3.0,10.4,[-.1,.3,-1],[-1,0,0],3.0,1.45,1]];
const TR=[ // groppa e cosce
  [-7.8,0,18.0,[-.4,0,1],[-1,0,-.2],4.8,2.0],[-11.8,2.6,11.6,[-1,0,-.3],[0,0,-1],3.0,1.4,1]];

function build(S){
  const bag=new Bag(),D=(S.yawB||0),Rb=M.m(M.z(D),M.m(M.y(S.pitch||0),M.x(S.roll||0))),Tb=[S.fx||0,S.sy||0,S.bob||0];
  const B=p=>add(add(M.ap(Rb,sub(p,PIV)),PIV),Tb),BR=v=>M.ap(Rb,v);
  const Rh=M.m(M.z(S.hYaw||0),M.m(M.y(S.hPitch||0),M.x(S.hRoll||0))),Rhw=M.m(Rb,Rh);
  const H=p=>B(add(M.ap(Rh,sub(p,NECK)),NECK)),HR=v=>M.ap(Rhw,v);
  const br=1+(S.breath||0)*.035,t=S.t||0,sm=S.smoke||0,wob=(i,f)=>Math.sin(t*TAU*(f||2)+i*1.7)*.13;
  const tufts=(L,T,R,i0)=>L.forEach((q,i)=>{for(const s of(q[7]?[1,-1]:[1]))tuft(bag,T([q[0],q[1]*s,q[2]]),R([q[3][0],q[3][1]*s,q[3][2]]),R([q[4][0],q[4][1]*s,q[4][2]]),q[5],q[6],wob(i+(i0||0)+s))});
  // ---- testa
  bag.grp(0);
  bag.el(H(HEAD.c),HEAD.r,Rhw,1.4);
  bag.el(H([16.0,0,16.1]),[4.7,5.2,3.6],M.m(Rhw,M.y(.12)),1.3);                          // muso
  for(const s of[1,-1])bag.el(H([12.4,s*4.9,15.4]),[4.3,3.4,3.3],M.m(Rhw,M.z(s*.25)),1.2); // guance
  // cresta: la punta della testa, una fiamma piatta che sale e si piega all'indietro a uncino
  {const cs=S.crest||0,ny=HR([0,1,0]);
   bag.own(()=>{const P=[H([11.6,0,26.0]),H([10.2,0,30.2]),H([7.9,0,33.3+cs*.12]),H([5.1,.12*cs,34.5+cs*.22]),H([3.1,.25*cs,33.6+cs*.18]),H([2.7,.3*cs,32.3+cs*.1])],
     R=[3.4,2.8,1.95,1.25,.62,.16];for(let i=0;i<P.length-1;i++)bag.fc(P[i],R[i],P[i+1],R[i+1],ny,.62,i?.35:1.0,0)})}
  tufts(TH,H,HR,0);
  // ---- collo, petto e corpo
  bag.grp(1);
  bag.rc(H([8.6,0,19.6]),5.4,B([3.6,0,18.2]),5.7*br,1.6,0);                        // collo
  bag.el(B([4.4,0,16.4]),[6.6,5.7*br,6.3*br],M.m(Rb,M.y(.05)),2.0,0);              // spalle
  bag.el(B([9.6,0,13.4]),[4.6,4.9*br,4.6*br],M.m(Rb,M.y(-.15)),1.8,0);             // petto
  bag.rc(B([0.6,0,16.2]),6.3*br,B([-6.0,0,15.0]),5.0*br,2.0,0);                    // pancia
  tufts(TB,B,BR,10);
  bag.grp(2);
  bag.el(B([-8.3,0,14.3]),[4.1,4.9,3.9],Rb,1.8,0);                                  // groppa
  for(const s of[1,-1])bag.el(B([-8.6,s*2.9,12.4]),[3.7,2.4,4.0],M.m(Rb,M.y(.2)),1.5,0);
  tufts(TR,B,BR,30);
  // ---- zampe: anteriori col gomito indietro, posteriori col ginocchio avanti e il garretto indietro
  const fw=BR([1,0,0]),legs={};
  for(const k of['FL','FR','HL','HR']){
    const fr=k[0]=='F',s=k[1]=='L'?1:-1,hip=B(HIPS[k]),f=(S.feet&&S.feet[k])||FEET[k],paw=[f[0],f[1],f[2]],sd=BR([0,s,0]);
    bag.grp(k=='FL'?3:k=='FR'?4:k=='HL'?5:6);
    if(fr){
      const r=ik2(hip,add(paw,[-.9,0,1.75]),6.2,6.2,mul(fw,-1));
      bag.rc(hip,2.7,r.j,2.0,1.3,0);bag.rc(r.j,2.0,r.b,1.7,.6,0);bag.rc(r.b,1.7,add(paw,[-.4,0,1.2]),1.7,.5,0);
      legs[k]={hip,j:r.j,w:r.b,paw};
      tuft(bag,add(r.j,mul(fw,-1.2)),add(mul(fw,-1),[0,0,-.2]),[0,0,-1],3.0,1.3,wob(40+s));          // gomito
      tuft(bag,add(lerp3(r.j,r.b,.3),mul(sd,1.5)),add(sd,mul(fw,-.4)),[0,0,-1],2.6,1.15,wob(42+s));   // di fianco
    }else{
      const r=ik2(hip,add(paw,[-1.7,0,3.4]),6.4,5.0,fw);
      bag.rc(hip,2.9,r.j,2.1,1.3,0);bag.rc(r.j,2.1,r.b,1.7,.6,0);bag.rc(r.b,1.7,add(paw,[-.3,0,1.2]),1.65,.5,0);
      legs[k]={hip,j:r.j,w:r.b,paw};
      tuft(bag,add(r.b,mul(fw,-1.1)),add(mul(fw,-1),[0,0,-.2]),[0,0,-1],2.9,1.25,wob(43+s));         // garretto
    }
    // la zampa: un guanto tondo con tre dita
    const pr=M.z(D);
    bag.el(add(paw,M.ap(pr,[.75,0,1.45])),[2.9,2.3,1.55],pr,.9,0);
    for(const d of[-1,0,1])bag.el(add(paw,M.ap(pr,[2.35+(d?0:.35),d*1.2,1.0])),[.95,.8,.85],pr,.22,0);
  }
// ---- fumo: la coda (dal grigio al viola, si arriccia in su), il nastro dalla nuca, il fumo della zampa dietro
  bag.grp(7);
  {const P=[[-9.4,0,15.4],[-11.6,.4,15.6],[-13.9,1.3,15.9],[-16.2,2.6,16.6],[-18.4,3.9,18.0],[-20.2,5.0,20.2],[-20.6,5.8,22.6],[-19.4,6.2,24.0],[-17.9,6.4,23.3],[-17.6,6.5,21.9]];
   const pts=P.map((p,i)=>{const k=i/(P.length-1);return B(add(p,[0,Math.sin(TAU*(sm-k*.55))*k*1.4,Math.cos(TAU*(sm-k*.55))*k*1.0]))});
   smoke(bag,pts,[2.3,3.1,3.7,3.3,3.5,2.9,2.3,1.7,1.1,.5],[0,0,.15,.5,.8,1,1,1,1,1],[1.6,.9,.9,.8,.7,.6,.5,.4,.3]);
   tuft(bag,pts[4],nrm(sub(pts[4],pts[3])).map((x,i)=>i==2?x+.9:x),[1,0,.3],2.4,1.1,Math.sin(t*TAU*2)*.15,1);
   tuft(bag,pts[2],[0,.2,-1],[-1,0,0],2.2,1.0,0,.4)}
  bag.grp(8);
  {const P=[[5.0,0,26.4],[2.4,.6,27.4],[-1.4,1.6,27.1],[-4.4,2.8,25.2],[-7.4,4.0,25.2],[-10.4,5.0,27.4],[-12.6,5.8,30.6],[-15.4,6.6,32.5],[-18.8,7.4,32.2],[-21.6,8.0,33.4],[-23.0,8.4,35.3],[-21.6,8.6,36.3],[-20.4,8.7,35.6]];
   const pts=P.map((p,i)=>{const k=i/(P.length-1);return i<1?H(p):B(add(p,[0,Math.sin(TAU*(sm-k*.6))*k*1.6,Math.cos(TAU*(sm-k*.6)+.6)*k*1.2]))});
   pts[1]=lerp3(H(P[1]),pts[1],.5);
   smoke(bag,pts,[2.0,2.2,2.1,1.9,2.2,2.6,2.9,2.6,2.2,1.8,1.3,.8,.35],[0,0,.1,.45,.8,1,1,1,1,1,1,1,1],[1.2,.8,.8,.7,.7,.6,.6,.5,.5,.4,.3,.25]);
   tuft(bag,pts[5],[0,.1,-1],[1,0,0],2.2,1.0,Math.sin(t*TAU*2+1)*.15,1);
   tuft(bag,pts[8],[0,.2,-1],[1,0,0],2.0,.9,Math.sin(t*TAU*2+2)*.15,1)}
  bag.grp(9);
  {const pw=legs.HL.paw,o=add(pw,[-1.6,0,1.2]),P=[[0,0,0],[-2.0,.5,1.2],[-3.6,.9,2.9],[-4.6,1.1,4.9],[-4.2,1.2,6.7],[-5.6,1.3,7.8],[-6.6,1.4,7.4]];
   const pts=P.map((p,i)=>{const k=i/(P.length-1);return add(o,add(p,[0,Math.sin(TAU*(sm*2-k*.7))*k*.8,Math.cos(TAU*(sm*2-k*.7))*k*.5]))});
   smoke(bag,pts,[1.5,1.7,1.7,1.5,1.2,.8,.35],[.55,.75,.9,1,1,1,1],[.8,.6,.5,.4,.35,.3])}
  // sbuffi che salgono e svaniscono
  bag.grp(10);
  const PUF=[[-5.0,3.4,30.4,1.0,0],[-7.0,4.4,31.2,.75,.3],[-24.0,8.5,23.6,1.05,.55],[-24.0,8.0,18.3,.85,.15],[-21.0,6.8,8.6,.6,.7],[-14.6,7.6,34.6,.7,.4]];
  for(const f of PUF){const ph=(sm+f[4])%1,r=f[3]*Math.sin(Math.PI*cl(ph*1.15,0,1))**.6;if(r<.08)continue;bag.own(()=>bag.el(B([f[0]-ph*1.2,f[1]+ph*.6,f[2]+ph*2.4]),[r,r,r],M.I,.2,1))}
  return{bag,Rhw,headO:H(HEAD.c),legs}}

// ------------------------------------------------------------------ le mosse: ogni posa dipende solo da p (0..1)
const ANIM={
  idle(p){const b=Math.sin(TAU*p);return{breath:b*.5+.5,bob:b*.12,hPitch:-.03*Math.sin(TAU*p+.6),hYaw:.05*Math.sin(TAU*p),hRoll:.025*Math.sin(TAU*p+1),
    crest:Math.sin(TAU*p*2),smoke:p,t:p,blink:p>.78&&p<.86?Math.sin((p-.78)/.08*Math.PI):0,gaze:[.25*Math.sin(TAU*p),0]}},
  walk(p){const F={},ph={HL:0,FL:.25,HR:.5,FR:.75},st=.62,L=4.2,hgt=1.6;
    for(const k in FEET){const q=(p+ph[k])%1,f=FEET[k];let x,z;if(q<st){x=lerp(L/2,-L/2,q/st);z=0}else{const s=(q-st)/(1-st);x=lerp(-L/2,L/2,s*s*(3-2*s));z=Math.sin(Math.PI*s)*hgt}
      F[k]=[f[0]+x+(k[0]=='F'?-.8:1.6),f[1],z]}
    const b=Math.cos(TAU*p*2);return{feet:F,bob:-.25+b*.25,pitch:.02*Math.sin(TAU*p*2),roll:.025*Math.sin(TAU*p),hPitch:.04*Math.sin(TAU*p*2+.9),hYaw:.03*Math.sin(TAU*p),
      crest:Math.sin(TAU*p*2),smoke:p,t:p,breath:.5,blink:0,gaze:[0,0]}}
};

// ------------------------------------------------------------------ il disegnatore
function Lumbra3D(cv,o){o=o||{};this.cv=cv;const gl=this.gl=cv.getContext('webgl2',{premultipliedAlpha:true,alpha:true,antialias:false,preserveDrawingBuffer:!!o.keep});
  if(!gl)throw new Error('WebGL2 non disponibile');
  const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x};
  const pr=this.pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
  gl.useProgram(pr);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const al=gl.getAttribLocation(pr,'aP');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  this.TW=2048;this.buf=new Float32Array(this.TW*4*2);this.tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,this.TW,2,0,gl.RGBA,gl.FLOAT,this.buf);
  this.U={};for(const n of['uP','uNG','uGB','uGR','uCo','uCd','uCx','uCy','uOff','uPx','uBS','uLW','uLW2','uL','uHO','uHR','uHM','uEye','uEye2','uEye3','uMou','uSh','uQ'])this.U[n]=gl.getUniformLocation(pr,n)}
Lumbra3D.ANIM=ANIM;Lumbra3D.build=build;
Lumbra3D.prototype.pose=function(o){const a=ANIM[o.anim||'idle']||ANIM.idle;return Object.assign({},a(((o.p||0)%1+1)%1),o.pose||{})};
Lumbra3D.prototype.draw=function(o){const gl=this.gl,U=this.U,W=this.cv.width,Hh=this.cv.height,TW=this.TW;
  const S=this.pose(o),R=build(S),P=R.bag.P.slice(0,TW/4),buf=this.buf;
  P.sort((a,b)=>a.g-b.g||a.s-b.s);
  // riga 0: i pezzi; riga 1: i mucchietti (sfera che li contiene + margine dell'unione, poi da..a); uniform: i gruppi
  for(let i=0;i<P.length;i++){const q=P[i],o4=i*16;
    buf[o4]=q.t;buf[o4+1]=q.k;buf[o4+2]=q.v;buf[o4+3]=0;
    if(q.t===0)buf.set([q.a[0],q.a[1],q.a[2],q.ra,q.b[0],q.b[1],q.b[2],q.rb,0,0,0,0],o4+4);
    else if(q.t===3){buf[o4+3]=q.fl;buf.set([q.a[0],q.a[1],q.a[2],q.ra,q.b[0],q.b[1],q.b[2],q.rb,q.n[0],q.n[1],q.n[2],0],o4+4)}
    else buf.set([q.ce[0],q.ce[1],q.ce[2],0,q.r[0],q.r[1],q.r[2],0,q.q[0],q.q[1],q.q[2],q.q[3]],o4+4)}
  const sphere=q=>q.t===0||q.t===3?[lerp3(q.a,q.b,.5),len(sub(q.b,q.a))/2+Math.max(q.ra,q.rb)]:[q.ce,Math.max(q.r[0],q.r[1],q.r[2])];
  const bound=L=>{const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const[c,r]of L)for(let j=0;j<3;j++){mn[j]=Math.min(mn[j],c[j]-r);mx[j]=Math.max(mx[j],c[j]+r)}
    const C=lerp3(mn,mx,.5);let rr=0;for(const[c,r]of L)rr=Math.max(rr,len(sub(c,C))+r);return[C,rr]};
  const CL=[];let lo=0;
  while(lo<P.length){let hi=lo;while(hi<P.length&&P[hi].g===P[lo].g&&P[hi].s===P[lo].s)hi++;
    const sp=[];let km=0;for(let i=lo;i<hi;i++){sp.push(sphere(P[i]));km=Math.max(km,P[i].k)}const[C,r]=bound(sp);CL.push({g:P[lo].g,C,r,km,lo,hi});lo=hi}
  const row1=TW*4;for(let c=0;c<CL.length;c++){const q=CL[c];buf.set([q.C[0],q.C[1],q.C[2],q.r+q.km,q.lo,q.hi,0,0],row1+c*8)}
  const GB=new Float32Array(16*4),GR=new Int32Array(16*2);let ng=0;lo=0;const all=[];
  while(lo<CL.length&&ng<16){let hi=lo;while(hi<CL.length&&CL[hi].g===CL[lo].g)hi++;
    const sp=[];let km=0;for(let i=lo;i<hi;i++){sp.push([CL[i].C,CL[i].r]);km=Math.max(km,CL[i].km)}const[C,r]=bound(sp);
    GB.set([C[0],C[1],C[2],r+km],ng*4);GR.set([lo,hi],ng*2);ng++;all.push([C,r]);lo=hi}
  const[bc,brad]=bound(all);
  gl.useProgram(this.pr);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,TW,2,gl.RGBA,gl.FLOAT,buf);
  // telecamera ortografica: yaw attorno a Lumbra, elev dall'alto; la luce viene sempre dall'alto a sinistra dello schermo
  const yaw=o.yaw||0,el=o.elev==null?.14:o.elev,cdir=[Math.cos(yaw)*Math.cos(el),Math.sin(yaw)*Math.cos(el),Math.sin(el)],vd=mul(cdir,-1),
    rt=nrm(cross(vd,[0,0,1])),upv=cross(rt,vd),tg=o.target||[0,0,14],co=add(tg,mul(cdir,80));
  const L=nrm(add(add(mul(rt,-.55),mul(upv,.78)),mul(cdir,.42)));
  gl.viewport(0,0,W,Hh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1i(U.uP,0);gl.uniform1i(U.uNG,ng);gl.uniform4fv(U.uGB,GB);gl.uniform2iv(U.uGR,GR);
  gl.uniform3fv(U.uCo,co);gl.uniform3fv(U.uCd,vd);gl.uniform3fv(U.uCx,rt);gl.uniform3fv(U.uCy,upv);
  gl.uniform2f(U.uOff,o.cx==null?W/2:o.cx,o.cy==null?Hh/2:Hh-o.cy);gl.uniform1f(U.uPx,1/(o.scale||25));
  gl.uniform4f(U.uBS,bc[0],bc[1],bc[2],brad+.5);
  gl.uniform1f(U.uLW,o.lw||.42);gl.uniform1f(U.uLW2,o.lw2||.2);gl.uniform3fv(U.uL,L);
  gl.uniform3fv(U.uHO,R.headO);gl.uniform3fv(U.uHR,HEAD.r);
  const Hm=R.Rhw;gl.uniformMatrix3fv(U.uHM,false,new Float32Array([Hm[0],Hm[3],Hm[6],Hm[1],Hm[4],Hm[7],Hm[2],Hm[5],Hm[8]]));
  // gli occhi girano un poco verso chi guarda (trucco dei cartoni in 3D): di fronte si avvicinano, di lato vanno indietro e restano grandi
  const E=o.eye||{},dv=(v,d)=>v==null?d:v,cH=M.ap(M.t(Hm),cdir),k=dv(E.k,.38),sh=s=>cl(k*(Math.atan2(s*cH[1],cH[0])-.75),-.28,.42);
  gl.uniform4f(U.uEye,dv(E.a0,.42),dv(E.b0,-.64),dv(E.a1,1.22),dv(E.b1,-.02));
  const gz=S.gaze||[0,0];gl.uniform4f(U.uEye2,gz[0],gz[1],sh(1),sh(-1));gl.uniform4f(U.uEye3,dv(E.w,.28),S.blink||0,dv(E.ir,.25),0);
  const Mo=o.mouth||{};gl.uniform4f(U.uMou,dv(Mo.y,-.74),dv(Mo.c,.10),dv(Mo.w,.70),dv(Mo.t,.16));
  const lg=R.legs,shx=(lg.FL.paw[0]+lg.FR.paw[0]+lg.HL.paw[0]+lg.HR.paw[0])/4;
  gl.uniform4f(U.uSh,shx-1,0,19,8.5);gl.uniform1i(U.uQ,o.q==null?2:o.q);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  return{n:P.length,nc:CL.length,ng}};
G.Lumbra3D=Lumbra3D;
})(typeof window!='undefined'?window:globalThis);
