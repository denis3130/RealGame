// =====================================================================
// 110. MOSSBOUND TRIPLA A · IL MOTORE 3D DELLA STANZA (anteprima a parte; Denis, 2 novembre: «rendi tripla A il gioco in sé mossbound»;
// risposte: «fai 3D vero come la visuale ma prima di metterlo nel gioco fammi vedere un'anteprima», le due luci «chiara e colorata, più
// ricca» e «più da film, contrasti forti» fatte a parte per decidere qual è meglio, anche animazioni e colpi, audio, menu, entrate e mosse
// dei boss fatte meglio (niente filmati), «fluido prima di tutto», la mappa zombie per ora com'è, prima anteprima «una stanza completa» del
// primo mondo; da solo, senza agenti).
// La stanza della Classica disegnata dalla scheda grafica (WebGL), come la visuale zombie (105, di cui usa gli attrezzi): una tela 3D sotto
// quella del gioco, che resta sopra trasparente per le scritte, le barre, la levetta. La telecamera è quella del gioco (segue l'eroe come
// sempre) ma guarda dall'alto e un po' da sud come in Archero 2, con la prospettiva; il pavimento è la foto del pavimento di ogni stanza; i
// muri, il cancello con le sbarre che si alzano, le torce con la loro luce vera, l'abisso intorno con la nebbia e la luce del fiume in fondo
// sono volumi 3D. Quello che non è ancora in 3D si disegna come «cartolina» (il disegno del gioco su un foglio in piedi nella scena), così
// la stanza si gioca intera fin dal primo momento; gli altri file (111–114) mettono l'eroe, i nemici, il Golem, gli oggetti e gli effetti
// in 3D vero. Le due luci («Chiara» e «Da film») si cambiano col bottone in alto o col tasto L. Solo le stanze del primo mondo; le altre e gli
// eventi restano come oggi. Fuori da src/ordine.txt: solo nell'anteprima (anteprime/mk_tripla.py).
// =====================================================================
const T3={on:true,ok:null,bad:false,err:0,gl:null,gl2:false,cv:null,cw:2,ch:2,W:1,H:1,vp:null,eye:[0,0,0],tg:[0,0,0],F3:[0,-1,0],R3:[1,0,0],U3:[0,0,1],
  fovy:32*Math.PI/180,pitch:50*Math.PI/180,near:100,far:5000,dist:1000,kpx:1,luce:'chiara',floorV:0,floorTV:-1,arenaK:'',frame:0,ms:0,low:false,slow:0,
  nCard:0,nMesh:0,lights:[],items:[],adds:[],flames:[],dbg:{}};
const t3Err=e=>{if(T3.err++<8)console.error('T3',e)};
// the visuale of the zombie mode (105, with 107's effects and 108's world) is in this preview too (Denis, 3 November: «fammi giocare in prima
// persona e l'altra visuale in 3d»; answers: the Zombie, in this page, the view from above stays): the match starts in first person and the
// «Visuale» button goes on to third person and then from above. It draws with this same WebGL context and canvas (one context only: its
// helpers already build the room's meshes with it): while the match is on, the canvas sits under the map's one (the menu and the rooms
// are not drawn then, 63's loop), and after it goes back where the menu or the room wants it (116's t3Place). 104's aim: only the Zombie's
// (it shoots where you look), not the Classic's, whose room here is in 3D
if(typeof V3!=='undefined'&&typeof v3InitGL==='function'){V3.start='prima';Object.assign(V3NEXT,{prima:'terza',terza:'alto',alto:'prima'});
  v3Init=function(){if(V3.ok!==null)return V3.ok;V3.ok=false;if(!t3Init())return false;V3.cv=T3.cv;V3.gl2=T3.gl2;if(!v3InitGL(T3.gl))return false;
    T3.cv.addEventListener('webglcontextlost',()=>{V3.lost=true});V3.ok=true;return true};
  {const _f=v3Frame;v3Frame=function(){const c=T3.cv;if(c&&typeof T3I!=='undefined'&&T3I.host!=='zombie'){T3I.host='zombie';T3I.live=false;
      c.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';T3.rk=null;T3.fboOk=false}return _f.apply(this,arguments)}}}
if(typeof MIRA!=='undefined')MIRA.cl=false;
// ------------------------------------------------------------------ the two lights (Denis: «fai separatamente le prime due per decidere qual è
// meglio»): «Chiara» bright and colourful as today, only richer (the sky light from above, a warm key from the top left, soft shadows, full
// colours, a light glow); «Da film» deeper shadows and strong lights (the torches, the magic) that stand out, cooler night light, more glow,
// stronger contrast, the edges darker; never a dark room
const T3LUCI={
  chiara:{nome:'Chiara',sky:[.9,.88,.82],gnd:[.5,.5,.44],key:[.36,.33,.27],keyD:[-.42,.38,.82],fog:[.16,.2,.18],fogP:[1700,1900,.85],mist:.12,torch:.85,
    bloom:.5,thr:.8,sat:1.16,con:.05,warm:.025,vig:.2,grain:.01,ink:1,abyss:[.2,.42,.26]},
  film:{nome:'Da film',sky:[.46,.5,.64],gnd:[.15,.15,.19],key:[.34,.38,.52],keyD:[-.55,.22,.8],fog:[.06,.075,.1],fogP:[1500,1700,.92],mist:.3,torch:1.75,
    bloom:1,thr:.62,sat:1.06,con:.17,warm:.06,vig:.42,grain:.026,ink:1,abyss:[.16,.5,.3]}};
const t3L=()=>T3LUCI[T3.luce]||T3LUCI.chiara;
// ------------------------------------------------------------------ the shading of everything in the room: light from the sky (more on what
// faces up), a warm key light from the top left wrapped round the shapes, the lights of the room (torches, braziers, magic, hits) with their
// colour, a wet shine on the stones near them, the distance and the abyss in the mist, the low mist that moves over the floor
const T3SHADE=`uniform vec3 uEye;uniform vec4 uL[12];uniform vec4 uLC[12];uniform vec3 uKey;uniform vec3 uKeyC;uniform vec3 uSky;uniform vec3 uGnd;
uniform vec3 uFogC;uniform vec3 uFogP;uniform sampler2D uNoi;uniform float uT;uniform float uMist;
vec3 lightAt(vec3 P,vec3 N,float wet,out vec3 sp){float ns=min(length(N),1.);vec3 n=ns>.001?N/ns:vec3(0.,0.,1.);
 vec3 amb=mix(uGnd,uSky,mix(.72,n.z*.5+.5,ns));float kd=mix(.6,clamp(dot(n,uKey)*.7+.3,0.,1.),ns);vec3 l=amb+uKeyC*kd;vec3 V=normalize(uEye-P);sp=vec3(0.);
 for(int i=0;i<12;i++){vec4 L=uL[i];if(L.w<=0.)continue;vec3 d=L.xyz-P;float dl=length(d);float q=dl/L.w;if(q>=1.)continue;vec3 ld=d/max(dl,.001);
  float wr=mix(1.,clamp(dot(n,ld)*.8+.2,0.,1.),ns);float a=1.-q;a*=a;l+=uLC[i].rgb*(uLC[i].a*a*wr);
  if(wet>0.){vec3 h=normalize(ld+V);sp+=uLC[i].rgb*(pow(max(dot(n,h),0.),36.)*a*wet*uLC[i].a);}}
 return l;}
vec3 fogIt(vec3 c,vec3 P){float dE=distance(P,uEye);float f=clamp((dE-uFogP.x)/uFogP.y,0.,1.)*uFogP.z;f=max(f,clamp(-P.z/320.,0.,1.)*.96);
 if(uMist>0.){float nz=texture2D(uNoi,P.xy/240.+vec2(uT*.006,uT*.0025)).r*.65+texture2D(uNoi,P.xy/86.-vec2(uT*.011,uT*.004)).r*.35;
  f=max(f,clamp(uMist*exp(-max(P.z,0.)/13.)*(nz*1.5-.25),0.,.5));}
 return mix(c,uFogC,f);}
vec3 shade(vec3 col,vec3 P,vec3 N,float wet){vec3 sp;vec3 l=lightAt(P,N,wet,sp);return fogIt(col*l+sp*.9,P);}`;
// the room's pieces: places, picture, normal, colour (alpha below 1: it glows by itself, as the embers and the river)
const T3VS_GEO=`attribute vec3 aP;attribute vec2 aT;attribute vec3 aN;attribute vec4 aC;uniform mat4 uVP;varying vec2 vT;varying vec3 vN;varying vec4 vC;varying vec3 vW;
void main(){vT=aT;vN=aN;vC=aC;vW=aP;gl_Position=uVP*vec4(aP,1.);}`;
const T3FS_GEO=`precision highp float;uniform sampler2D uTex;uniform float uWet;uniform float uBump;uniform vec2 uTx;varying vec2 vT;varying vec3 vN;varying vec4 vC;varying vec3 vW;${T3SHADE}
void main(){vec4 t=texture2D(uTex,vT);vec3 c=t.rgb*vC.rgb;vec3 N=vN;
 if(uBump>0.){const vec3 W3=vec3(.3,.59,.11);float a=dot(texture2D(uTex,vT+vec2(uTx.x,0.)).rgb,W3),b=dot(texture2D(uTex,vT-vec2(uTx.x,0.)).rgb,W3),u=dot(texture2D(uTex,vT+vec2(0.,uTx.y)).rgb,W3),w=dot(texture2D(uTex,vT-vec2(0.,uTx.y)).rgb,W3);
  N=normalize(vec3(-(a-b)*uBump,(u-w)*uBump,1.))*.55;}
 float wet=uWet*smoothstep(.5,.15,dot(c,vec3(.3,.59,.11)));
 vec3 o=shade(c,vW,N,wet);float em=1.-vC.a;gl_FragColor=vec4(mix(o,fogIt(c*1.15,vW),em),1.);}`;
// the cards (what is not in 3D yet) and the glows: facing the camera; the cards lit as a round thing standing up
const T3VS_BB=`attribute vec3 aP;attribute vec2 aQ;attribute vec2 aT;attribute vec4 aC;uniform mat4 uVP;uniform vec3 uR;uniform vec3 uU;varying vec2 vT;varying vec4 vC;varying vec3 vW;varying vec2 vS;
void main(){vec3 p=aP+uR*aQ.x+uU*aQ.y;vT=aT;vC=aC;vW=p;vS=aQ;gl_Position=uVP*vec4(p,1.);}`;
const T3FS_CARD=`precision highp float;uniform sampler2D uTex;uniform vec3 uR;uniform vec3 uBk;varying vec2 vT;varying vec4 vC;varying vec3 vW;varying vec2 vS;${T3SHADE}
void main(){vec4 t=texture2D(uTex,vT);if(t.a<.5)discard;vec3 N=normalize(uBk+uR*clamp(vC.r*2.-1.,-1.,1.)*.6)*.7;vec3 sp;vec3 l=lightAt(vW,N,0.,sp);
 gl_FragColor=vec4(fogIt(t.rgb*mix(vec3(1.),l*.95+.08,vC.g),vW),1.);}`;
const T3FS_ADD=`precision highp float;uniform sampler2D uTex;uniform vec3 uEye;uniform vec3 uFogP;varying vec2 vT;varying vec4 vC;varying vec3 vW;
void main(){vec4 t=texture2D(uTex,vT)*vC;float d=distance(vW,uEye);float f=clamp((d-uFogP.x)/uFogP.y,0.,1.)*uFogP.z;gl_FragColor=vec4(t.rgb*t.a*(1.-f*.85),1.);}`;
// the characters and the pieces in 3D (the visuale's toon painting: three tones from the key light, the warm rim, the thick dark outline;
// the Arciere's face painted on the ball of his head), then the room's light and mist
const T3VS_TOON=V3VS_TOON;
const T3FS_TOON=`precision highp float;uniform sampler2D uTex;uniform vec4 uTint;uniform vec3 uLd;uniform float uInk;uniform float uFlash;uniform float uAlpha;
uniform float uHead;uniform vec3 uHc;uniform vec3 uFd;uniform vec3 uHf;uniform vec3 uHu;uniform vec3 uHr;uniform vec3 uE1;uniform vec3 uE2;uniform vec3 uG1;uniform vec3 uG2;
uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uMo;uniform vec3 uHood;uniform vec3 uSkin;uniform vec3 uEyeC;uniform vec4 uHE;uniform float uEm;uniform vec3 uFlashC;
varying vec3 vN;varying vec4 vC;varying vec3 vW;varying vec2 vT;${T3SHADE}
float el(vec3 d,vec3 c,float rx,float ry){vec3 q=d-c;float x=dot(q,uHr)/rx,y=dot(q,uHu)/ry;return x*x+y*y;}
void main(){vec3 ink=vec3(.106,.086,.071);if(uInk>.5){gl_FragColor=vec4(fogIt(ink,vW),uAlpha);return;}
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
 float l=dot(n,uLd),k=smoothstep(-.6,.9,l);vec3 dk=mix(base,vec3(.06,.07,.1),.36),lt=mix(base,vec3(1.),.2);
 vec3 c=k<.5?mix(dk,base,k*2.):mix(base,lt,k*2.-1.);c=mix(c,base,flat0*.75);
 float fr=1.-clamp(dot(n,normalize(uEye-vW)),0.,1.);c+=vec3(1.,.88,.66)*pow(fr,2.6)*.3*clamp(l+.35,0.,1.)*(1.-flat0);
 vec3 sp;vec3 L=lightAt(vW,n*.85,0.,sp);vec3 o=c*mix(vec3(1.),L*1.04+.04,.62);
 o=mix(o,uFlashC,uFlash*.5);float em=(1.-vC.a)*(.6+.4*uEm);gl_FragColor=vec4(fogIt(mix(o,base*(1.15+.3*uEm)+vec3(.04),em),vW),uAlpha);}`;
// the last pass: the glow of the bright things, the dark outline where the depth jumps, the colours of the chosen light (saturation, contrast,
// warm lights and cool shadows), the vignette, a little grain; uFx: the glow, the grain, a hit just taken, little life left
const T3FS_POST=`precision highp float;uniform sampler2D uC;uniform sampler2D uD;uniform sampler2D uB1;uniform sampler2D uB2;uniform vec2 uPx;uniform vec2 uNF;uniform float uInk;
uniform float uT;uniform vec4 uFx;uniform vec4 uGr;uniform float uFade;uniform vec3 uFadeC;varying vec2 vU;
float lin(float d){float z=d*2.-1.;return 2.*uNF.x*uNF.y/(uNF.y+uNF.x-z*(uNF.y-uNF.x));}
float far4(vec2 o){return max(max(lin(texture2D(uD,vU+vec2(o.x,0.)).r),lin(texture2D(uD,vU-vec2(o.x,0.)).r)),max(lin(texture2D(uD,vU+vec2(0.,o.y)).r),lin(texture2D(uD,vU-vec2(0.,o.y)).r)));}
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
void main(){vec2 q=vU-.5;vec3 c=texture2D(uC,vU).rgb;
 float d0=lin(texture2D(uD,vU).r);float m=max(far4(uPx),far4(uPx*2.));float e=smoothstep(.02*d0+2.,.045*d0+7.,m-d0)*uInk*step(d0,uNF.y*.95);c=mix(c,vec3(.07,.055,.05),e*.85);
 if(uFx.x>0.)c+=(texture2D(uB1,vU).rgb*.55+texture2D(uB2,vU).rgb*.8)*uFx.x;
 c=c/(1.+c*.14)*1.08;float l=dot(c,vec3(.299,.587,.114));c=max(vec3(0.),mix(vec3(l),c,uGr.x-uFx.w*.5));
 c+=vec3(-.008,.006,.026)*(1.-smoothstep(0.,.45,l))*uGr.z*12.+vec3(.03,.012,-.016)*smoothstep(.45,1.,l)*uGr.z*12.;c=clamp(c,0.,1.);
 c=mix(c,c*c*(3.-2.*c),uGr.y);float v=smoothstep(.34,.95,length(q*vec2(1.,1.12)));c*=1.-uGr.w*v;
 c=mix(c,vec3(.5,.03,.04),uFx.w*(.5+.5*sin(uT*7.))*smoothstep(.2,.9,length(q*vec2(1.,1.3)))*.45);c+=vec3(1.,.86,.8)*uFx.z*.14*(1.-v);
 if(uFx.y>0.)c+=(hash(vU*vec2(1913.,1577.)+fract(uT*7.3)*vec2(91.,37.))-.5)*uFx.y;
 c=mix(c,uFadeC,uFade);gl_FragColor=vec4(c,1.);}`;
// ------------------------------------------------------------------ small tools: matrices (the visuale's), programs, textures
function t3Prog(vs,fs,attrs){const gl=T3.gl,sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o)+'\n'+s.slice(0,160));return o};
  const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));attrs.forEach((a,i)=>gl.bindAttribLocation(p,i,a));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<n;i++){const inf=gl.getActiveUniform(p,i);u[inf.name.replace(/\[0\]$/,'')]=gl.getUniformLocation(p,inf.name)}return{p,u,n:attrs.length}}
function t3Tex(src,mip,w,h,rep){const gl=T3.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  if(src)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const W0=src?src.width:w,H0=src?src.height:h,pot=v=>(v&(v-1))===0,ok=mip&&(T3.gl2||(pot(W0)&&pot(H0)));if(ok)gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,ok?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  if(ok){if(T3.anE===undefined){T3.anE=gl.getExtension('EXT_texture_filter_anisotropic')||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')||null;T3.anM=T3.anE?Math.min(8,gl.getParameter(T3.anE.MAX_TEXTURE_MAX_ANISOTROPY_EXT)||1):0}
    if(T3.anE&&T3.anM>1)gl.texParameterf(gl.TEXTURE_2D,T3.anE.TEXTURE_MAX_ANISOTROPY_EXT,T3.low?Math.min(4,T3.anM):T3.anM)}
  const wr=rep&&(T3.gl2||(pot(W0)&&pot(H0)))?gl.REPEAT:gl.CLAMP_TO_EDGE;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wr);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wr);return t}
function t3RT(w,h){const gl=T3.gl,tex=t3Tex(null,false,w,h),fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);return{tex,fb,w,h}}
function t3Pass(Q,r,src,set){const gl=T3.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,r?r.fb:null);gl.viewport(0,0,r?r.w:T3.cw,r?r.h:T3.ch);gl.useProgram(Q.p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,src);gl.uniform1i(Q.u.uC,0);
  if(set)set(Q.u);gl.bindBuffer(gl.ARRAY_BUFFER,T3.qb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);for(let i=1;i<8;i++)gl.disableVertexAttribArray(i);gl.drawArrays(gl.TRIANGLES,0,3)}
// ------------------------------------------------------------------ start: the canvas under the game's one, the programs, the noise
function t3Init(){if(T3.ok!==null)return T3.ok;T3.ok=false;const c=document.createElement('canvas');c.id='t3cv';
  c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none';
  const o={antialias:false,alpha:false,depth:true,stencil:false,premultipliedAlpha:false,powerPreference:'high-performance'};let gl=null;
  try{gl=c.getContext('webgl2',o)}catch(e){}T3.gl2=!!gl;if(!gl)try{gl=c.getContext('webgl',o)||c.getContext('experimental-webgl',o)}catch(e){}if(!gl)return false;
  T3.cv=c;T3.gl=gl;T3.dext=T3.gl2?null:gl.getExtension('WEBGL_depth_texture');T3.post=T3.gl2||!!T3.dext;
  // (the visuale's helpers build their meshes, tunics and weapons with this same context)
  V3.gl=gl;V3.gl2=T3.gl2;
  try{T3.pG=t3Prog(T3VS_GEO,T3FS_GEO,['aP','aT','aN','aC']);T3.pC=t3Prog(T3VS_BB,T3FS_CARD,['aP','aQ','aT','aC']);T3.pA=t3Prog(T3VS_BB,T3FS_ADD,['aP','aQ','aT','aC']);
    T3.pT=t3Prog(T3VS_TOON,T3FS_TOON,['aP','aN','aO','aT','aC','aP2','aN2','aO2']);
    if(T3.post){T3.pP=t3Prog(V3VS_POST,T3FS_POST,['aP']);T3.pBr=t3Prog(V3VS_POST,V3FS_BRIGHT,['aP']);T3.pBl=t3Prog(V3VS_POST,V3FS_BLUR,['aP'])}}catch(e){t3Err(e);return false}
  T3.qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,T3.qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  T3.db=gl.createBuffer();T3.dyn=new Float32Array(T3Q*6*2400);T3.noi=v3NoiseTex(gl);
  {const w=document.createElement('canvas');w.width=w.height=4;const g=w.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,4,4);T3.white=t3Tex(w,false)}
  T3.glow=t3Tex(t3GlowCv(),true);
  c.addEventListener('webglcontextlost',e=>{e.preventDefault();T3.lost=true});
  const wrap=cv.parentNode;wrap.insertBefore(c,cv);cv.style.position='relative';
  T3.ok=true;return true}
function t3GlowCv(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');
  gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c}
// ------------------------------------------------------------------ the size of the picture: the game's canvas, pixel for pixel (so the
// writings over it fall where the 3D puts things); the post-process buffers
function t3Size(){const gl=T3.gl,cw=cv.width,ch=cv.height,sc=T3.low?.75:1,w=Math.max(2,Math.round(cw*sc)),h=Math.max(2,Math.round(ch*sc));
  const rk=cw+'x'+ch;if(T3.rk!==rk||!T3.rc){T3.rk=rk;T3.rc=cv.getBoundingClientRect()}const r=T3.rc;T3.W=r.width||cw;T3.H=r.height||ch;T3.pxK=cw/(r.width||cw);
  if(T3.cv.width!==w||T3.cv.height!==h){T3.cv.width=w;T3.cv.height=h;T3.fboOk=false}T3.cw=w;T3.ch=h;
  if(T3.post&&!T3.fboOk){if(T3.fbo){gl.deleteFramebuffer(T3.fbo);gl.deleteTexture(T3.fc);gl.deleteTexture(T3.fd)}
    T3.fc=t3Tex(null,false,w,h);T3.fd=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,T3.fd);
    if(T3.gl2)gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,w,h,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);else gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,w,h,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    T3.fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,T3.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,T3.fc,0);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,T3.fd,0);
    T3.post=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    if(T3.bl)for(const r of T3.bl){gl.deleteFramebuffer(r.fb);gl.deleteTexture(r.tex)}const qw=Math.max(8,w>>2),qh=Math.max(8,h>>2);T3.bl=[t3RT(qw,qh),t3RT(qw,qh),t3RT(Math.max(4,qw>>1),Math.max(4,qh>>1)),t3RT(Math.max(4,qw>>1),Math.max(4,qh>>1))];
    T3.fboOk=true}}
// ------------------------------------------------------------------ the camera: the game's own (the middle of what the battle shows, which
// follows the hero, the boss's entrance, the fall), looked at from above and a little from the south as in Archero 2; the screen's width at that
// depth is what the game shows across. Shakes as the game's camera does
function t3Camera(){const s=Math.min(cv.width/VW,cv.height/VH),wW=cv.width/s,asp=cv.width/cv.height,th=Math.tan(T3.fovy/2),hh=Math.atan(th*asp);
  let tx=(G.vx||0)+VW/2,ty=(G.vy||0)+VH/2,zoom=1;
  if(G.state==='dead'&&G.deathT){const k=Math.min(1,G.deathT/.9);tx+=(P.x-tx)*k*.5;ty+=(P.y-ty)*k*.5;zoom=1+.12*k}
  else if(G.cam){const c=G.cam;tx=c.x;ty=c.y;zoom=c.z||1}
  // (the 3D sees more of the room up north than the game: the middle a little north so the hero stays where he is on the screen)
  ty+=T3.lead==null?36:T3.lead;
  const sh=G.shake||0;if(sh>0){tx+=(Math.random()-.5)*sh;ty+=(Math.random()-.5)*sh}
  if(T3.fxCam)T3.fxCam(T3);zoom*=T3.zk||1;
  const D=(wW/2)/Math.tan(hh)/zoom,pc=Math.cos(T3.pitch),ps=Math.sin(T3.pitch),tz=T3.tz||0;
  // (the bottom of the screen not much past the room's south curb: the abyss under the room is for the edges)
  if(!G.cam&&!(G.state==='dead'&&G.deathT)){const dS=D*pc-D*ps/Math.tan(T3.pitch+T3.fovy/2);ty=Math.min(ty,AH+18-dS)}
  const eye=[tx,ty+D*pc,tz+D*ps],at=[tx,ty,tz];T3.dist=D;
  T3.near=Math.max(10,D*.35);T3.far=D+3200;T3.eye=eye;T3.tg=at;const view=v3Look(eye,at,[0,0,1]);T3.vp=v3Mul(v3Persp(T3.fovy,asp,T3.near,T3.far),view);
  const f=[at[0]-eye[0],at[1]-eye[1],at[2]-eye[2]],fl=Math.hypot(...f);T3.F3=[f[0]/fl,f[1]/fl,f[2]/fl];T3.R3=[1,0,0];
  const R=T3.R3,F=T3.F3;T3.U3=[R[1]*F[2]-R[2]*F[1],R[2]*F[0]-R[0]*F[2],R[0]*F[1]-R[1]*F[0]];if(T3.U3[2]<0)T3.U3=T3.U3.map(v=>-v);
  // (pixels of the canvas for one unit at the target's depth)
  T3.kpx=cv.width/wW*zoom}
// a point of the room on the canvas (in the game canvas' own pixels), its depth; null behind the camera
function t3P(x,y,z){const m=T3.vp,cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13],cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<1)return null;
  return[(cx/cw+1)*.5*cv.width,(1-cy/cw)*.5*cv.height,cw]}
// how many canvas pixels a unit is at that depth
const t3K=w=>T3.kpx*T3.dist/Math.max(1,w);
// ------------------------------------------------------------------ the uniforms every program shares: camera, lights, key, sky, mist, noise
function t3Uni(P){const gl=T3.gl,u=P.u,Lc=t3L();gl.uniformMatrix4fv(u.uVP,false,T3.vp);if(u.uEye)gl.uniform3fv(u.uEye,T3.eye);
  if(u.uL){gl.uniform4fv(u.uL,T3.uL);gl.uniform4fv(u.uLC,T3.uLC)}if(u.uKey){const k=Lc.keyD,l=Math.hypot(...k);gl.uniform3f(u.uKey,k[0]/l,k[1]/l,k[2]/l);gl.uniform3fv(u.uKeyC,Lc.key)}
  if(u.uSky){gl.uniform3fv(u.uSky,Lc.sky);gl.uniform3fv(u.uGnd,Lc.gnd)}if(u.uFogC){gl.uniform3fv(u.uFogC,Lc.fog);gl.uniform3fv(u.uFogP,T3.fogP)}else if(u.uFogP)gl.uniform3fv(u.uFogP,T3.fogP);
  if(u.uNoi){gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,T3.noi);gl.uniform1i(u.uNoi,3);gl.activeTexture(gl.TEXTURE0)}if(u.uT)gl.uniform1f(u.uT,((G&&G.t)||0)%1000);
  if(u.uMist)gl.uniform1f(u.uMist,LOWFX?0:Lc.mist*(T3.low?.6:1));if(u.uWet)gl.uniform1f(u.uWet,0);if(u.uBump)gl.uniform1f(u.uBump,0)}
// ------------------------------------------------------------------ the lights of the room: the torches, the braziers and the lanterns of
// the obstacles, then what the other files add this frame (hits, magic, the boss's heart, explosions); the 12 nearest to the middle
function t3Lights(){const Lc=t3L(),L=[],t=G.t||0,tg=T3.tg,add=(x,y,z,r,rgb,a)=>L.push([Math.hypot(x-tg[0],y-tg[1]),x,y,z,r,rgb,a]);
  for(const tc of G.torches||[]){const f=.88+.12*Math.sin(t*9+tc.ph*3)*Math.sin(t*5.3+tc.ph);add(tc.x,T3.wallY+8,52,210*f,[1,.66,.32],.95*Lc.torch*f)}
  for(const k of G.rocks||[]){const f=.9+.1*Math.sin(t*7+(k.seed||0));if(k.kind==='brazier')add(k.x,k.y,kH(k)+6,170*f,[1,.6,.28],.9*Lc.torch*f);else if(k.kind==='crystal')add(k.x,k.y,kH(k)*.6,150,[.45,.85,1],.7*Lc.torch);
    else if(k.kind==='lantern')add(k.x,k.y,kH(k),140,[.75,1,.45],.75*Lc.torch);else if(k.kind==='cauldron'||k.kind==='lavarock')add(k.x,k.y,kH(k),140,[1,.45,.2],.8*Lc.torch)}
  for(const l of T3.lights)add(l.x,l.y,l.z,l.r,l.rgb,l.a);T3.lights.length=0;
  L.sort((a,b)=>a[0]-b[0]);const uL=T3.uL||(T3.uL=new Float32Array(48)),uC=T3.uLC||(T3.uLC=new Float32Array(48));uL.fill(0);uC.fill(0);
  for(let i=0;i<Math.min(T3.low?7:12,L.length);i++){const q=L[i];uL[i*4]=q[1];uL[i*4+1]=q[2];uL[i*4+2]=q[3];uL[i*4+3]=q[4];uC[i*4]=q[5][0];uC[i*4+1]=q[5][1];uC[i*4+2]=q[5][2];uC[i*4+3]=q[6]}}
// another file may add a light for this frame (x, y, z, radius, [r, g, b] 0..1, strength)
function t3Light(x,y,z,r,rgb,a){T3.lights.push({x,y,z,r,rgb,a})}
// ------------------------------------------------------------------ the quads that face the camera (cards, glows), as the visuale's
const T3Q=11;let T3QN=0;
function t3Q(x,y,z,qx0,qy0,qx1,qy1,u0,v0,u1,v1,r,g,b,a){const D=T3.dyn;if(T3QN+T3Q*6>D.length)return;const V=[[qx0,qy0,u0,v1],[qx1,qy0,u1,v1],[qx1,qy1,u1,v0],[qx0,qy0,u0,v1],[qx1,qy1,u1,v0],[qx0,qy1,u0,v0]];
  for(const v of V){D[T3QN++]=x;D[T3QN++]=y;D[T3QN++]=z;D[T3QN++]=v[0];D[T3QN++]=v[1];D[T3QN++]=v[2];D[T3QN++]=v[3];D[T3QN++]=r;D[T3QN++]=g;D[T3QN++]=b;D[T3QN++]=a}}
// four corners in the room (lying on the floor, along a direction)
function t3QW(c,u0,v0,u1,v1,r,g,b,a){const D=T3.dyn;if(T3QN+T3Q*6>D.length)return;const T=[[c[0],u0,v1],[c[1],u1,v1],[c[2],u1,v0],[c[0],u0,v1],[c[2],u1,v0],[c[3],u0,v0]];
  for(const[p,u,v] of T){D[T3QN++]=p[0];D[T3QN++]=p[1];D[T3QN++]=p[2];D[T3QN++]=0;D[T3QN++]=0;D[T3QN++]=u;D[T3QN++]=v;D[T3QN++]=r;D[T3QN++]=g;D[T3QN++]=b;D[T3QN++]=a}}
function t3QFlush(P,tex,uU,uR){const n=T3QN/T3Q;if(!n)return;const gl=T3.gl;gl.useProgram(P.p);t3Uni(P);gl.uniform3fv(P.u.uU,uU||T3.U3);if(P.u.uR)gl.uniform3fv(P.u.uR,uR||T3.R3);
  if(P.u.uBk){const F=T3.F3;gl.uniform3f(P.u.uBk,-F[0],-F[1],-F[2])}
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(P.u.uTex,0);gl.bindBuffer(gl.ARRAY_BUFFER,T3.db);gl.bufferData(gl.ARRAY_BUFFER,T3.dyn.subarray(0,T3QN),gl.DYNAMIC_DRAW);
  const st=T3Q*4;for(let i=0;i<4;i++)gl.enableVertexAttribArray(i);for(let i=4;i<8;i++)gl.disableVertexAttribArray(i);
  gl.vertexAttribPointer(0,3,gl.FLOAT,false,st,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,st,12);gl.vertexAttribPointer(2,2,gl.FLOAT,false,st,20);gl.vertexAttribPointer(3,4,gl.FLOAT,false,st,28);
  gl.drawArrays(gl.TRIANGLES,0,n);T3QN=0}
// ------------------------------------------------------------------ a static mesh of the room (P, T, N, colour): one buffer, drawn whole
function t3GB(){return{P:[],T:[],N:[],C:[]}}
function t3GV(b,p,t,n,c){b.P.push(p[0],p[1],p[2]);b.T.push(t[0],t[1]);b.N.push(n[0],n[1],n[2]);b.C.push(c[0],c[1],c[2],c[3]==null?255:c[3])}
function t3GTri(b,a,c,d,ta,tc,td,col,n){const u=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],v=[d[0]-a[0],d[1]-a[1],d[2]-a[2]];let N=n||RG.nrm([u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]);
  t3GV(b,a,ta,N,col);t3GV(b,c,tc,N,col);t3GV(b,d,td,N,col)}
function t3GQuad(b,a,c,d,e,col,uv){uv=uv||[[0,0],[1,0],[1,1],[0,1]];t3GTri(b,a,c,d,uv[0],uv[1],uv[2],col);t3GTri(b,a,d,e,uv[0],uv[2],uv[3],col)}
function t3GUp(b){const gl=T3.gl,n=b.P.length/3,buf=new ArrayBuffer(n*36),F=new Float32Array(buf),U=new Uint8Array(buf);
  for(let i=0;i<n;i++){const o=i*9;F[o]=b.P[i*3];F[o+1]=b.P[i*3+1];F[o+2]=b.P[i*3+2];F[o+3]=b.T[i*2];F[o+4]=b.T[i*2+1];F[o+5]=b.N[i*3];F[o+6]=b.N[i*3+1];F[o+7]=b.N[i*3+2];
    U[o*4+32]=b.C[i*4];U[o*4+33]=b.C[i*4+1];U[o*4+34]=b.C[i*4+2];U[o*4+35]=b.C[i*4+3]}
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,buf,gl.STATIC_DRAW);return{vb,n}}
function t3GDraw(m,tex,o){if(!m||!m.n)return;const gl=T3.gl,P=T3.pG;o=o||{};gl.useProgram(P.p);t3Uni(P);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex||T3.white);gl.uniform1i(P.u.uTex,0);
  gl.uniform1f(P.u.uWet,LOWFX?0:o.wet||0);gl.uniform1f(P.u.uBump,LOWFX||T3.low?0:o.bump||0);gl.uniform2f(P.u.uTx,o.tx||1/1024,o.ty||1/1024);
  gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);for(let i=0;i<4;i++)gl.enableVertexAttribArray(i);for(let i=4;i<8;i++)gl.disableVertexAttribArray(i);
  gl.vertexAttribPointer(0,3,gl.FLOAT,false,36,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,36,12);gl.vertexAttribPointer(2,3,gl.FLOAT,false,36,20);gl.vertexAttribPointer(3,4,gl.UNSIGNED_BYTE,true,36,32);
  gl.drawArrays(gl.TRIANGLES,0,m.n)}
function t3GFree(m){if(m&&m.vb)T3.gl.deleteBuffer(m.vb)}
// ------------------------------------------------------------------ the room in 3D, made again when the room changes (its size, its world)
// The walls are the stones of the world's palette (ENV: the wall's colours, the mortar), as a picture that repeats on every face: the north
// wall high behind (with the gate in the middle), the side walls lower, the south one a low curb (the camera looks over it); a crest of
// broken stones on top with the moss of the world; under the room the cliff of rock that goes down into the abyss; beside it the ribs of the
// beast rising from the dark; at the bottom the river that glows
const T3WH=92,T3WT=26,T3SH=40,T3BH=16;
function t3StoneCv(E,seed){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');let sd=seed||7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  g.fillStyle=E.mortar||'#1a1612';g.fillRect(0,0,S,S);const rows=8,rh=S/rows;
  for(let i=0;i<rows;i++){let x=-(i%2)*24-r()*12;const y=i*rh;while(x<S){const w=40+r()*34,col=E.wall[Math.floor(r()*E.wall.length)];
      const put=(ox)=>{g.fillStyle=col;g.fillRect(x+ox+2,y+2,w-4,rh-4);g.fillStyle='rgba(255,255,255,.09)';g.fillRect(x+ox+2,y+2,w-4,3);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x+ox+2,y+rh-5,w-4,3);
        for(let k=0;k<6;k++){g.fillStyle=`rgba(${r()<.5?'255,255,255':'0,0,0'},${.04+r()*.05})`;g.fillRect(x+ox+4+r()*(w-10),y+5+r()*(rh-12),2+r()*6,1+r()*3)}
        if(r()<.18){g.strokeStyle='rgba(0,0,0,.42)';g.lineWidth=1.4;g.beginPath();g.moveTo(x+ox+w*.3,y+3);g.lineTo(x+ox+w*.45,y+rh*.5);g.lineTo(x+ox+w*.36,y+rh-3);g.stroke()}};
      put(0);if(x+w>S)put(-S);x+=w}}
  return c}
function t3RockCv(seed){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');let sd=seed||11;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  g.fillStyle='#3a332c';g.fillRect(0,0,S,S);for(let i=0;i<900;i++){const x=r()*S,y=r()*S,w=4+r()*26,h=2+r()*10,v=r();g.fillStyle=v<.5?`rgba(20,16,12,${.15+r()*.25})`:`rgba(120,108,92,${.08+r()*.14})`;
    for(const ox of[-S,0,S])for(const oy of[-S,0,S]){g.beginPath();g.ellipse(x+ox,y+oy,w,h,r()*.6-.3,0,Math.PI*2);g.fill()}}
  for(let i=0;i<30;i++){const x=r()*S,y=r()*S;g.strokeStyle='rgba(10,8,6,.5)';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++)g.lineTo(x+(r()-.5)*30*k,y+r()*14*k);g.stroke()}
  return c}
function t3Box(b,x0,y0,z0,x1,y1,z1,col,o){o=o||{};const WT=o.wt||96,top=o.top||col,sideK=o.sideK==null?1:o.sideK,F=o.faces||'nsewu',c2=k=>[col[0]*k,col[1]*k,col[2]*k,col[3]==null?255:col[3]];
  const uvx=(p)=>[p[0]/WT,-p[2]/WT],uvy=(p)=>[p[1]/WT,-p[2]/WT],uvz=(p)=>[p[0]/WT,p[1]/WT];
  const quad=(a,c,d,e,n,uvf,cc)=>{t3GTri(b,a,c,d,uvf(a),uvf(c),uvf(d),cc,n);t3GTri(b,a,d,e,uvf(a),uvf(d),uvf(e),cc,n)};
  if(F.includes('u'))quad([x0,y0,z1],[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],[0,0,1],uvz,top);
  if(F.includes('s'))quad([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[0,1,0],uvx,c2(sideK));
  if(F.includes('n'))quad([x1,y0,z0],[x0,y0,z0],[x0,y0,z1],[x1,y0,z1],[0,-1,0],uvx,c2(sideK*.8));
  if(F.includes('e'))quad([x1,y1,z0],[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[1,0,0],uvy,c2(sideK*.9));
  if(F.includes('w'))quad([x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1],[-1,0,0],uvy,c2(sideK*.9))}
const t3Hex=(h,a)=>{const q=v3rgb(h);return[q[0],q[1],q[2],a==null?255:a]};
function t3Arena(){const th=themeOf(G.room),E=G.env||ENV.muschio,key=AW+'x'+AH+'|'+th+'|'+G.room+'|'+(G.variant&&G.variant.n);if(T3.ar&&T3.arenaK===key)return T3.ar;
  if(T3.ar)for(const k of['wall','cliff','crest','gate','bars','ribs','river','torch'])t3GFree(T3.ar[k]);T3.arenaK=key;let sd=(G.room*7919+AW)%2147483646+1;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const A={th,E};const WY=TOP-T3WT;T3.wallY=TOP;const dx=AW/2,gw=DOORW;
  // the walls: north (two pieces and the lintel over the gate), west and east, the south curb
  {const b=t3GB(),stone=t3Hex(E.wall[1]),dark=t3Hex(E.mortar);
    t3Box(b,-6,WY,0,dx-gw,TOP,T3WH,stone,{sideK:1,top:t3Hex(E.wall[3])});t3Box(b,dx+gw,WY,0,AW+6,TOP,T3WH,stone,{sideK:1,top:t3Hex(E.wall[3])});
    t3Box(b,dx-gw-4,WY-2,64,dx+gw+4,TOP+3,T3WH+4,t3Hex(E.wall[2]),{top:t3Hex(E.wall[3])});
    // the gate's frame: two pillars a little out of the wall, their caps
    for(const sx of[-1,1]){const x0=dx+sx*gw-(sx<0?10:0),x1=x0+10;t3Box(b,x0,WY-3,0,x1,TOP+6,T3WH+8,t3Hex(E.wall[3]),{top:t3Hex(E.wall[0])})}
    t3Box(b,-30,WY,0,L,AH+4,T3SH,stone,{top:t3Hex(E.side||E.wall[3]),faces:'nsewu'});t3Box(b,R,WY,0,AW+30,AH+4,T3SH,stone,{top:t3Hex(E.side||E.wall[3]),faces:'nsewu'});
    t3Box(b,L,BOT,0,R,AH+4,T3BH,stone,{top:t3Hex(E.side||E.wall[3])});
    // the corridor behind the gate, going into the dark
    t3Box(b,dx-gw,WY-160,-2,dx+gw,WY,0,dark,{faces:'u'});t3Box(b,dx-gw-12,WY-160,0,dx-gw,WY,T3WH,dark,{faces:'e'});t3Box(b,dx+gw,WY-160,0,dx+gw+12,WY,T3WH,dark,{faces:'w'});
    A.wall=t3GUp(b)}
  // the crest: broken stones along the top of the walls, a little turned, with the world's moss on some (muschio, golem)
  {const b=t3GB(),moss=th==='muschio'||th==='golem',mc=t3Hex(th==='golem'?'#4a6a2a':'#5f9e3c'),mc2=t3Hex('#86b84a');
    const crest=(x0,x1,y0,y1,z,alongX)=>{let p=alongX?x0:y0;const end=alongX?x1:y1;while(p<end){const w=10+r()*16,h=3+r()*9,d0=(alongX?y1-y0:x1-x0),inset=r()*3;
        if(r()<.82){const c=t3Hex(E.wall[Math.floor(r()*E.wall.length)]),k=.85+r()*.3,cc=[c[0]*k,c[1]*k,c[2]*k,255];
          if(alongX)t3Box(b,p,y0+inset,z,p+w-1.5,y1-inset,z+h,cc,{top:[cc[0]*1.15,cc[1]*1.15,cc[2]*1.15,255]});else t3Box(b,x0+inset,p,z,x1-inset,p+w-1.5,z+h,cc,{top:[cc[0]*1.15,cc[1]*1.15,cc[2]*1.15,255]});
          if(moss&&r()<.45){const mx=alongX?p+w*.5:(x0+x1)/2,my=alongX?(y0+y1)/2:p+w*.5,mz=z+h,s=4+r()*6;t3Box(b,mx-s,my-s*.7,mz,mx+s,my+s*.7,mz+1.6+r()*1.6,r()<.5?mc:mc2,{top:r()<.5?mc2:mc})}}
        p+=w}};
    crest(-6,dx-gw-4,WY,TOP,T3WH,true);crest(dx+gw+4,AW+6,WY,TOP,T3WH,true);crest(-30,L,TOP,AH,T3SH,false);crest(R,AW+30,TOP,AH,T3SH,false);crest(L,R,BOT,AH,T3BH,true);
    // the moss that hangs down the north wall's face, the tufts at its foot
    if(moss)for(let i=0;i<10;i++){const x=6+r()*(AW-12);if(Math.abs(x-dx)<gw+16||(G.torches||[]).some(t=>Math.abs(t.x-x)<16))continue;let z=T3WH;const len=20+r()*55,w=3+r()*3;
      for(let k=0;z>T3WH-len&&k<12;k++){const h=4+r()*6,ox=(r()-.5)*3;t3Box(b,x+ox-w,TOP,z-h,x+ox+w,TOP+1.4+r()*1.2,z,r()<.5?mc:mc2,{faces:'swe',top:mc});z-=h}}
    A.crest=t3GUp(b)}
  // the cliff under the room: the rock goes down into the abyss, rough, a little in and out
  {const b=t3GB(),rc=[210,200,190,255],ring=[],N=48,cx=AW/2,cy=AH/2+20,ex=AW/2+34,ey=AH/2+70;
    for(let i=0;i<N;i++){const a=i/N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),k=Math.max(Math.abs(ca)/ex,Math.abs(sa)/ey),j=.94+r()*.1;ring.push([cx+ca/k*j,cy+sa/k*j])}
    const lv=[0,-40,-110,-200,-320],sh=[1,1.04,.98,.86,.62];
    for(let l=0;l<lv.length-1;l++)for(let i=0;i<N;i++){const a=ring[i],c=ring[(i+1)%N],k0=sh[l],k1=sh[l+1],P=(q,k,z,jx)=>[cx+(q[0]-cx)*k+jx,cy+(q[1]-cy)*k,z];
      const j1=(r()-.5)*14,j2=(r()-.5)*14,p0=P(a,k0,lv[l],0),p1=P(c,k0,lv[l],0),p2=P(c,k1,lv[l+1],j2),p3=P(a,k1,lv[l+1],j1);
      const u0=i/N*14,u1=(i+1)/N*14,v0=-lv[l]/90,v1=-lv[l+1]/90,nn=RG.nrm([(a[0]+c[0])/2-cx,(a[1]+c[1])/2-cy,.25]);t3GTri(b,p0,p1,p2,[u0,v0],[u1,v0],[u1,v1],rc,nn);t3GTri(b,p0,p2,p3,[u0,v0],[u1,v1],[u0,v1],rc,nn)}
    // the platform's skirt under the floor's edge (so no light gets between floor and cliff)
    for(let i=0;i<N;i++){const a=ring[i],c=ring[(i+1)%N];t3GTri(b,[cx,cy,-1],[c[0],c[1],-1],[a[0],a[1],-1],[0,0],[0,0],[0,0],rc,[0,0,1])}
    A.cliff=t3GUp(b)}
  // the ribs of the beast: great curved bones rising from the abyss beside the room, fading in the mist; the river far below
  {const mb=v3MB(),bone=[214,204,178,255];for(const sx of[-1,1])for(let i=0;i<5;i++){const y=-60+i*(AH+120)/4+(r()-.5)*30,x0=sx<0?-170-r()*40:AW+170+r()*40,P=[];
      for(let k=0;k<=8;k++){const t=k/8,a=t*Math.PI*.62;P.push([x0+sx*(-Math.sin(a)*110),y+(r()-.5)*4,-700+t*820*Math.sin(a+.3)])}
      v3Tube(mb,P,P.map((q,k)=>16-k*1.1),bone,8)}
    A.ribs=v3Up(mb)}
  {const b=t3GB(),c=t3L().abyss,col=[c[0]*255,c[1]*255,c[2]*255,40];for(let i=0;i<24;i++){const y0=-500+i*(AH+1000)/24,y1=y0+(AH+1000)/24,x=AW/2+Math.sin(i*.5)*160,x1=AW/2+Math.sin((i+1)*.5)*160,w=70;
      t3GQuad(b,[x-w,y0,-640],[x+w,y0,-640],[x1+w,y1,-640],[x1-w,y1,-640],col,[[0,0],[1,0],[1,1],[0,1]])}A.river=t3GUp(b)}
  A.stone=t3Tex(t3StoneCv(E,G.room*13+5),true,0,0,true);A.rock=t3Tex(t3RockCv(G.room*7+3),true,0,0,true);
  // the floor: the game's own photo of it (2 pixels a unit), on the room's rectangle
  {const b=t3GB(),w=[255,255,255,255];t3GQuad(b,[0,0,0],[AW,0,0],[AW,AH,0],[0,AH,0],w,[[0,0],[1,0],[1,1],[0,1]]);A.floor=t3GUp(b)}
  T3.ar=A;return A}
// the floor's picture: up again when the game bakes it again (a new room, an obstacle broken, the boss's marks)
{const _rf=renderFloor;renderFloor=function(){const r=_rf.apply(this,arguments);T3.floorV++;return r}}
function t3FloorTex(){if(T3.floorTV===T3.floorV&&T3.floorT)return T3.floorT;const gl=T3.gl;T3.floorTV=T3.floorV;
  if(!T3.floorT){T3.floorT=gl.createTexture()}gl.bindTexture(gl.TEXTURE_2D,T3.floorT);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  let src=floorCv;if(!T3.gl2){const P2=v=>1<<Math.ceil(Math.log2(v));const w=P2(floorCv.width),h=P2(floorCv.height);if(w!==floorCv.width||h!==floorCv.height){const c=T3.fl2||(T3.fl2=document.createElement('canvas'));c.width=w;c.height=h;c.getContext('2d').drawImage(floorCv,0,0,w,h);src=c}}
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(T3.anE===undefined){T3.anE=gl.getExtension('EXT_texture_filter_anisotropic')||null;T3.anM=T3.anE?Math.min(8,gl.getParameter(T3.anE.MAX_TEXTURE_MAX_ANISOTROPY_EXT)||1):0}
  if(T3.anE&&T3.anM>1)gl.texParameterf(gl.TEXTURE_2D,T3.anE.TEXTURE_MAX_ANISOTROPY_EXT,T3.anM);return T3.floorT}
// the gate's bars (they rise when the room is clear, as in drawWallBack), the torches' brackets
function t3GateMesh(){if(T3.ar.bars)return T3.ar.bars;const b=t3GB(),dx=AW/2,gw=DOORW,iron=t3Hex('#6b6f78'),dark=t3Hex('#3a3d44');
  for(let x=dx-gw+5;x<dx+gw-2;x+=8)t3Box(b,x-1.3,TOP-8,0,x+1.3,TOP-5.4,66,iron,{top:dark});t3Box(b,dx-gw,TOP-8.4,40,dx+gw,TOP-5,43.5,dark);t3Box(b,dx-gw,TOP-8.4,18,dx+gw,TOP-5,21,dark);
  for(let x=dx-gw+5;x<dx+gw-2;x+=8){t3Box(b,x-2,TOP-8.6,-3,x+2,TOP-4.8,0,iron)}
  return T3.ar.bars=t3GUp(b)}
function t3TorchMesh(){if(T3.ar.torch)return T3.ar.torch;const b=t3GB(),iron=t3Hex('#4a4f58'),dark=t3Hex('#2e2f34');
  for(const t of G.torches||[]){const x=t.x;t3Box(b,x-4,TOP,30,x+4,TOP+5,44,dark);t3Box(b,x-1.6,TOP+3,44,x+1.6,TOP+10,47,iron);t3Box(b,x-6,TOP+6,46,x+6,TOP+16,49,iron,{top:dark})}
  return T3.ar.torch=t3GUp(b)}
// ------------------------------------------------------------------ the pieces in 3D through the toon painting (the visuale's v3Draw3 with
// this room's light): first the outline (the same pieces a little bigger, seen from inside), then the pieces. items: {m: mesh, M: matrix,
// tex, tint, out: outline, head: the Arciere's painted face, m2/kf: the next pose and how far toward it}. o: {H (the head), al, fl, flc}
function t3Draw3(items,o){if(!items.length)return;o=o||{};const gl=T3.gl,P=T3.pT,{add,mul,nrm}=RG;gl.useProgram(P.p);t3Uni(P);const u=P.u;
  for(let i=5;i<8;i++)gl.disableVertexAttribArray(i);const Lc=t3L(),kd=Lc.keyD,Ld=nrm([kd[0],kd[1]*.6+.25,kd[2]]);gl.uniform3fv(u.uLd,Ld);
  gl.uniform1f(u.uFlash,o.fl||0);gl.uniform3fv(u.uFlashC,o.flc||[1,1,1]);gl.uniform1f(u.uAlpha,o.al==null?1:o.al);gl.uniform1f(u.uEm,o.em==null?1:o.em);gl.uniform1i(u.uTex,0);gl.activeTexture(gl.TEXTURE0);
  for(let i=0;i<5;i++)gl.enableVertexAttribArray(i);gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);
  const H=o.H;if(H&&H.R){const R=H.R,S=R.S,HH=R.head,yr=HH.yaw-H.a,cy=Math.cos(yr),sy=Math.sin(yr),cn=Math.cos(HH.nod),sn=Math.sin(HH.nod),MF=H.MF,
      hl=v=>{v=nrm(v);const x=v[0]*cn+v[2]*sn,y=v[1],z=-v[0]*sn+v[2]*cn;return v3Dir(MF,[x*cy-y*sy,x*sy+y*cy,z])},op=Math.max(.12,HH.blink*(1-.3*HH.squint));
    const E1=hl([1,-.33,.25]),E2=hl([1,.33,.25]),gO=q=>nrm(add(q,add(mul(T3.R3,-.34*.195),mul(T3.U3,.46*.23*op))));
    gl.uniform3fv(u.uHc,H.Hw);gl.uniform3fv(u.uFd,hl(HH.FACE));gl.uniform3fv(u.uHf,hl([1,0,0]));gl.uniform3fv(u.uHu,hl([0,0,1]));gl.uniform3fv(u.uHr,hl([0,1,0]));gl.uniform3fv(u.uE1,E1);gl.uniform3fv(u.uE2,E2);
    gl.uniform3fv(u.uG1,gO(E1));gl.uniform3fv(u.uG2,gO(E2));gl.uniform3fv(u.uC1,hl([1,-.54,.04]));gl.uniform3fv(u.uC2,hl([1,.54,.04]));gl.uniform3fv(u.uMo,hl([1,-.13,-.06]));
    const tt=c=>v3Tint(c).slice(0,3);gl.uniform3fv(u.uHood,tt(S.hood));gl.uniform3fv(u.uSkin,tt(S.skin));gl.uniform3fv(u.uEyeC,tt(HH.eyeCol));gl.uniform4f(u.uHE,op,HH.shut?1:0,HH.mouth,HH.blush?1:0)}
  const draw=ink=>{for(const it of items){const m=it.m,m2=it.m2&&it.m2.nv===m.nv?it.m2:null;gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);
      gl.vertexAttribPointer(0,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,48,12);gl.vertexAttribPointer(2,3,gl.FLOAT,false,48,24);gl.vertexAttribPointer(3,2,gl.FLOAT,false,48,36);gl.vertexAttribPointer(4,4,gl.UNSIGNED_BYTE,true,48,44);
      if(m2){gl.bindBuffer(gl.ARRAY_BUFFER,m2.vb);for(let i=5;i<8;i++)gl.enableVertexAttribArray(i);gl.vertexAttribPointer(5,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(6,3,gl.FLOAT,false,48,12);gl.vertexAttribPointer(7,3,gl.FLOAT,false,48,24);gl.uniform1f(u.uKF,it.kf||0)}
      else{for(let i=5;i<8;i++)gl.disableVertexAttribArray(i);gl.uniform1f(u.uKF,0)}
      const M=it.M,det=M[0]*(M[5]*M[10]-M[6]*M[9])-M[4]*(M[1]*M[10]-M[2]*M[9])+M[8]*(M[1]*M[6]-M[2]*M[5]);gl.frontFace(det<0?gl.CW:gl.CCW);
      gl.uniformMatrix4fv(u.uM,false,M);gl.uniformMatrix3fv(u.uNM,false,v3NM(M));gl.uniform1f(u.uOut,ink?(it.out||0)*(T3.low?.8:1)*T3.outK:0);gl.uniform1f(u.uHead,!ink&&it.head?1:0);
      gl.uniform1f(u.uFlash,it.fl!=null?it.fl:(o.fl||0));gl.uniform1f(u.uEm,it.em!=null?it.em:(o.em==null?1:o.em));
      gl.bindTexture(gl.TEXTURE_2D,it.tex||T3.white);gl.uniform4fv(u.uTint,it.tint||[1,1,1,1]);const f0=it.first||0,cnt=it.count==null?m.n-f0:it.count;if(cnt>0)gl.drawElements(gl.TRIANGLES,cnt,gl.UNSIGNED_SHORT,f0*2)}};
  if(o.ink&&o.al!=null&&o.al<1){gl.cullFace(gl.FRONT);gl.uniform1f(u.uInk,1);draw(true)}
  if(o.al!=null&&o.al<1){gl.cullFace(gl.BACK);gl.uniform1f(u.uInk,0);gl.colorMask(false,false,false,false);draw(false);gl.colorMask(true,true,true,true);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false)}
  else{gl.cullFace(gl.FRONT);gl.uniform1f(u.uInk,1);draw(true)}
  gl.cullFace(gl.BACK);gl.uniform1f(u.uInk,0);draw(false);gl.depthMask(true);
  gl.frontFace(gl.CCW);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);for(let i=1;i<8;i++)gl.disableVertexAttribArray(i);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);T3.nMesh+=items.length}
T3.outK=1;
// ------------------------------------------------------------------ the cards: what is not in 3D yet is painted by the game itself on a sheet
// (its own drawing, at the size it has on the screen) that stands in the room facing the camera, its foot on its ground point; lit by the
// room. One sheet a frame, packed in rows, sent up once
const T3CA={S:2048,cv:null,g:null,tex:null,x:2,y:2,h:0,list:[],used:0};
function t3CardsBegin(){const A=T3CA;if(!A.cv){A.cv=document.createElement('canvas');A.cv.width=A.cv.height=A.S;A.g=A.cv.getContext('2d');A.tex=t3Tex(A.cv,false)}
  if(A.used){A.g.setTransform(1,0,0,1,0,0);A.g.clearRect(0,0,A.S,A.used+4)}A.x=2;A.y=2;A.h=0;A.list.length=0;A.used=0}
// a card: the ground point (x, y, z), the drawing's box round its point in the game's units ([left, top, right, bottom] relative to (x, y)),
// draw() paints with the game's ctx at the game's own coordinates
function t3Card(x,y,z,box,draw,o){o=o||{};const A=T3CA,q=t3P(x,y,z);if(!q)return false;const k=Math.min(3,Math.max(.8,t3K(q[2])*(o.res||1))),bw=box[2]-box[0],bh=box[3]-box[1],w=Math.ceil(bw*k)+2,h=Math.ceil(bh*k)+2;
  if(w>A.S-4||h>A.S-4)return false;if(A.x+w+2>A.S){A.x=2;A.y+=A.h+2;A.h=0}if(A.y+h+2>A.S)return false;const rx=A.x,ry=A.y;A.x+=w+2;A.h=Math.max(A.h,h);A.used=Math.max(A.used,ry+h);
  const sv=ctx,g=A.g;g.save();g.beginPath();g.rect(rx,ry,w,h);g.clip();if(T3.dbgCard){g.fillStyle='rgba(255,0,0,.35)';g.fillRect(rx,ry,w,h)}g.setTransform(k,0,0,k,rx+1-box[0]*k-x*k,ry+1-box[1]*k-y*k);ctx=g;
  try{draw()}catch(e){t3Err(e)}finally{ctx=sv;g.restore()}
  A.list.push({x,y,z,box,rx,ry,w,h,al:o.al==null?1:o.al,lit:o.lit==null?1:o.lit});return true}
function t3CardsEnd(){const A=T3CA,gl=T3.gl;if(!A.list.length)return;gl.bindTexture(gl.TEXTURE_2D,A.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  // (only the rows used this frame go up: copied into a strip of their height, then sent)
  const H=Math.min(A.S,A.used+2),st=A.st||(A.st=document.createElement('canvas'));if(st.width!==A.S)st.width=A.S;if(st.height!==H)st.height=H;const sg=st.getContext('2d');sg.clearRect(0,0,A.S,H);sg.drawImage(A.cv,0,0,A.S,H,0,0,A.S,H);
  gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,st);
  const S=A.S;for(const c of A.list){const b=c.box,u0=(c.rx+1)/S,v0=(c.ry+1)/S,u1=(c.rx+c.w-1)/S,v1=(c.ry+c.h-1)/S;
    // (the card stands on the feet: its bottom edge is box[3] units under the ground point, lifted so that it does not sink into the floor)
    t3Q(c.x,c.y,c.z,b[0],-b[3],b[2],-b[1],u0,v0,u1,v1,.5,c.lit,0,c.al)}
  const gl2=T3.gl;gl2.enable(gl2.DEPTH_TEST);t3QFlush(T3.pC,A.tex);T3.nCard=A.list.length}
// ------------------------------------------------------------------ what is drawn in 3D by the other files (111–114): each registers a
// function that draws its part of the room (and says which entities it took, so they are not drawn again as cards)
const T3H={hero:null,enemy:{},rock:null,pre:[],post:[],ground:[],air:[],over:[]};
// ------------------------------------------------------------------ the room this frame
function t3Active(){if(!T3.on||T3.bad||T3.lost||!G||!started||(typeof INTRO!=='undefined'&&INTRO.on))return false;if(!$('menu').hidden)return false;
  if(G.event||G.mode==='tut'||G.trial)return false;if(G.cn&&(G.cn.tower||G.cn.traps))return false;const th=themeOf(G.room);return th==='muschio'||th==='cristalli'||th==='golem'}
function t3Render(){const gl=T3.gl,t0=performance.now(),PF=T3.prof,pk=PF?(k=>{gl.finish();const t=performance.now();PF[k]=(PF[k]||0)+t-PF._;PF._=t}):()=>{};if(PF){PF._=t0;PF.n=(PF.n||0)+1}t3Size();t3Camera();const A=t3Arena(),Lc=t3L();T3.fogP=Lc.fogP.slice();T3.frame++;T3.nMesh=0;T3.nCard=0;
  for(const f of T3H.pre)try{f()}catch(e){t3Err(e)}
  t3Lights();pk('pre');
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
  if(T3.cv.style.display==='none')T3.cv.style.display='';
  gl.bindFramebuffer(gl.FRAMEBUFFER,T3.post?T3.fbo:null);gl.viewport(0,0,T3.cw,T3.ch);const fc=Lc.fog;gl.clearColor(fc[0],fc[1],fc[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
  // the abyss: the river far below, the ribs, the cliff; the floor; the walls, their crest, the torches' brackets, the gate's bars
  t3GDraw(A.river,T3.white);
  t3Draw3([{m:A.ribs,M:v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,0]),out:.9}],{});
  t3GDraw(A.cliff,A.rock,{bump:1.2,tx:1/256,ty:1/256});
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,2);t3GDraw(A.floor,t3FloorTex(),{wet:.55,bump:1.4,tx:1/floorCv.width,ty:1/floorCv.height});gl.disable(gl.POLYGON_OFFSET_FILL);
  t3GDraw(A.wall,A.stone,{bump:1.6,tx:1/256,ty:1/256});t3GDraw(A.crest,A.stone,{bump:1});t3GDraw(t3TorchMesh(),T3.white);pk('room');
  {const gUp=G.door&&G.gateT>0?1-G.gateT/.6:G.door?1:0;if(gUp<1){const m=t3GateMesh();T3.gateZ=gUp*gUp*70;if(T3.gateZ<1)t3GDraw(m,T3.white);else{T3.gateM=T3.gateM||{};t3GDrawZ(m,T3.gateZ)}}}
  for(const f of T3H.ground)try{f()}catch(e){t3Err(e)}pk('ground');
  // the characters and the things of the room: in 3D where a file draws them, else as cards
  t3CardsBegin();
  try{t3Entities()}catch(e){t3Err(e)}
  t3CardsEnd();pk('entities');
  for(const f of T3H.air)try{f()}catch(e){t3Err(e)}
  // the torches' flames and their halos
  t3Flames();pk('air');
  gl.disable(gl.BLEND);gl.depthMask(true);
  t3Post();pk('post');
  // over it, on the game's canvas: the effects not yet in 3D, the numbers, the bars, the arrows to who is off screen, the stick
  try{t3Over()}catch(e){t3Err(e)}pk('over');
  const ms=performance.now()-t0;T3.ms=T3.ms?T3.ms*.9+ms*.1:ms}
// the gate's bars raised (drawn with an offset in height)
function t3GDrawZ(m,dz){const gl=T3.gl,keep=T3.vp,M=v3Mul(T3.vp,v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,dz]));T3.vp=M;try{t3GDraw(m,T3.white)}finally{T3.vp=keep}}
// the entities, sorted as the game does; those with a 3D drawing (T3H) go to it, the others are cards
function t3Entities(){const list=[];
  for(const k of G.rocks)list.push(['rock',k]);
  for(const e of G.enemies)if(e.spawn<=0||T3H.spawn)list.push(['enemy',e]);
  for(const c of (G.corpses||[]).concat(G.ecorpses||[]))list.push(['corpse',c]);
  if(G.prop)list.push(['prop',G.prop]);if(G.cc)for(const c of G.cc)list.push(['chest',c]);
  for(const st of G.stuck)list.push(['stuck',st]);
  list.push(['hero',P]);for(const pt of G.pets||(G.pet?[G.pet]:[]))list.push(['pet',pt]);
  for(const it of list){const[k,o]=it;let done=false;
    if(k==='hero'&&T3H.hero){try{done=T3H.hero()}catch(e){t3Err(e)}}
    else if(k==='enemy'&&T3H.enemy[o.type]){try{done=T3H.enemy[o.type](o)}catch(e){t3Err(e);T3H.enemy[o.type]=null}}
    else if(k==='rock'&&T3H.rock){try{done=T3H.rock(o)}catch(e){t3Err(e)}}
    else if(k==='corpse'&&T3H.corpse){try{done=T3H.corpse(o)}catch(e){t3Err(e)}}
    else if(k==='pet'&&T3H.pet){try{done=T3H.pet(o)}catch(e){t3Err(e)}}
    if(!done)t3CardOf(k,o)}
  if(T3H.items)T3H.items()}
// a card for one entity, with its own drawing from the game
function t3CardOf(k,o){const sv=noShadow;noShadow=true;try{
  if(k==='rock'){const h=kH(o)+o.r;t3Card(o.x,o.y,0,[-o.r*1.6,-h-o.r*.6,o.r*1.6,o.r*.9],()=>drawRock(o))}
  else if(k==='enemy'){if(o.spawn>0)return;const r=o.r*(o.elite?1.3:1)*(isBoss(o.type)?1.2:1),z=o.z||0;t3Card(o.x,o.y,0,[-r*2.6,-r*4.2-z,r*2.6,r*1.1],()=>drawEnemy(o))}
  else if(k==='corpse'){t3Card(o.x,o.y,0,[-60,-90,60,30],()=>drawCorpse(o))}
  else if(k==='prop'){t3Card(o.x,o.y,0,[-50,-80,50,24],()=>drawProp(o))}
  else if(k==='chest'){t3Card(o.x,o.y,0,[-40,-60,40,20],()=>drawTwinChest(o))}
  else if(k==='stuck'){t3Card(o.k.x,o.k.y,0,[-30,-40,30,16],()=>drawStuck(o))}
  else if(k==='hero'){if(G.door&&P.y<TOP+2)return;t3Card(P.x,P.y,0,[-34,-58,34,16],()=>drawHero())}
  else if(k==='pet'){t3Card(o.x,o.y,0,[-26,-40,26,14],()=>drawPet(o))}}finally{noShadow=sv}}
// ------------------------------------------------------------------ the torches' flames: the game's own little flame drawn as a card, the
// halo added on top
function t3Flames(){const gl=T3.gl,t=G.t||0;gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);const L=t3L();
  for(const tc of G.torches||[]){const f=.85+.15*Math.sin(t*11+tc.ph)*Math.sin(t*7.3+tc.ph*2);const c=G.env&&G.env.light?G.env.light.split(',').map(v=>+v/255):[1,.66,.32];
    t3Q(tc.x,TOP+11,58,-30*f,-30*f,30*f,30*f,0,0,1,1,c[0]*.5*L.torch,c[1]*.5*L.torch,c[2]*.5*L.torch,1);t3Q(tc.x,TOP+11,56,-7*f,-4,7*f,16*f,0,0,1,1,1,.85*f,.5*f,1)}
  t3QFlush(T3.pA,T3.glow);gl.depthMask(true);gl.disable(gl.BLEND)}
// ------------------------------------------------------------------ the last pass: glow, outline, colours of the chosen light, vignette, grain;
// the game's fade to black between rooms
function t3Post(o){o=o||{};const gl=T3.gl;if(!T3.post)return;gl.disable(gl.DEPTH_TEST);const Lc=t3L(),BL=!LOWFX&&T3.bl?T3.bl:null;
  if(BL){const[a,b,c,d]=BL;t3Pass(T3.pBr,a,T3.fc,u=>{gl.uniform2f(u.uPx,1/T3.cw,1/T3.ch);gl.uniform1f(u.uThr,Lc.thr)});
    t3Pass(T3.pBl,b,a.tex,u=>gl.uniform2f(u.uDir,1.3/a.w,0));t3Pass(T3.pBl,a,b.tex,u=>gl.uniform2f(u.uDir,0,1/a.h));
    t3Pass(T3.pBr,c,a.tex,u=>{gl.uniform2f(u.uPx,1/a.w,1/a.h);gl.uniform1f(u.uThr,-1)});t3Pass(T3.pBl,d,c.tex,u=>gl.uniform2f(u.uDir,1.4/c.w,0));t3Pass(T3.pBl,c,d.tex,u=>gl.uniform2f(u.uDir,0,1/c.h))}
  // (o: the menu's islands say themselves: no hit, no little life, no fade of the rooms)
  const hp=P.hp/P.maxhp,low=o.low!=null?o.low:G.state==='dead'?0:Math.max(0,Math.min(1,(.32-hp)/.22)),hit=o.hit!=null?o.hit:P.hurtT!=null?Math.max(0,1-(G.t-P.hurtT)/.35):0;
  t3Pass(T3.pP,null,T3.fc,u=>{gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,T3.fd);gl.uniform1i(u.uD,1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,BL?BL[0].tex:T3.fc);gl.uniform1i(u.uB1,2);
    gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,BL?BL[2].tex:T3.fc);gl.uniform1i(u.uB2,3);gl.activeTexture(gl.TEXTURE0);
    const ik=Math.max(1,Math.round(T3.cw/(T3.W||T3.cw)*1.05));gl.uniform2f(u.uPx,ik/T3.cw,ik/T3.ch);gl.uniform2f(u.uNF,T3.near,T3.far);gl.uniform1f(u.uInk,LOWFX||T3.low?.6:Lc.ink);
    gl.uniform1f(u.uT,(G.t||0)%1000);gl.uniform4f(u.uFx,BL?Lc.bloom*(T3.low?.75:1):0,LOWFX?0:Lc.grain,LOWFX?0:hit,low);gl.uniform4f(u.uGr,Lc.sat,Lc.con,Lc.warm,Lc.vig);
    gl.uniform1f(u.uFade,o.fade!=null?o.fade:Math.max(0,Math.min(1,G.fade||0)));gl.uniform3f(u.uFadeC,12/255,9/255,7/255)});
  for(let i=3;i>=0;i--){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,null)}gl.enable(gl.DEPTH_TEST)}
// ------------------------------------------------------------------ the ground's drawings of the game (the warnings of the attacks, the auras
// of the champions, the zones, the meteors' rings, the slime's trails, the shadows of what falls, the waves) painted as today on a picture
// of the whole room and laid on the floor; up again every frame while there is something
const T3FS_OV=`precision highp float;uniform sampler2D uTex;varying vec2 vT;varying vec4 vC;varying vec3 vW;${T3SHADE}
void main(){vec4 t=texture2D(uTex,vT);if(t.a<.004)discard;gl_FragColor=vec4(fogIt(t.rgb,vW),t.a*vC.a);}`;
function t3GroundOver(){const has=(G.decals&&G.decals.length)||(G.waves&&G.waves.length)||(G.zones&&G.zones.length)||(G.meteors&&G.meteors.length)||(G.lines&&G.lines.length)||
    (G.lobs&&G.lobs.length)||(G.debris&&G.debris.length)||G.enemies.some(e=>e.elite||e.spawn>0||e.aim>0||ETELE[e.type]);if(!has)return;
  const K=T3.low?.42:.55,w=Math.ceil(AW*K),h=Math.ceil(AH*K),c=T3.gcv||(T3.gcv=document.createElement('canvas'));if(c.width!==w||c.height!==h){c.width=w;c.height=h;T3.gtick=0}
  if((T3.gtick=(T3.gtick||0)+1)%2&&T3.gtex){t3GroundLay();return}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.setTransform(K,0,0,K,0,0);const sv=ctx;ctx=g;
  try{for(const d of G.decals){ctx.fillStyle=d.col;ctx.globalAlpha=.35;for(let i=0;i<4;i++){const a=d.seed+i*1.6;ell(d.x+Math.cos(a)*d.r*.5,d.y+Math.sin(a)*d.r*.3,d.r*.5,d.r*.3);ctx.fill()}ctx.globalAlpha=1}
    drawHazardsGround();drawHazards2Ground();drawLobsGround();drawTelegraphs();drawDebris('ground');
    for(const wv of G.waves){if(wv.col==='lvl'){ctx.strokeStyle=`rgba(140,255,190,${.8*(1-wv.r/wv.max)})`;ctx.lineWidth=4;ell(wv.x,wv.y,wv.r,wv.r*.6);ctx.stroke();continue}
      ctx.strokeStyle=`rgba(${wv.rgb||'255,138,60'},${.8*(1-wv.r/wv.max)})`;ctx.lineWidth=9;circ(wv.x,wv.y,wv.r);ctx.stroke();ctx.strokeStyle=wv.rgb?'rgba(255,255,255,.6)':'rgba(255,220,150,.6)';ctx.lineWidth=2;circ(wv.x,wv.y,wv.r);ctx.stroke()}}
  catch(e){t3Err(e)}finally{ctx=sv}
  const gl=T3.gl;if(!T3.gtex)T3.gtex=t3Tex(c,false);else{gl.bindTexture(gl.TEXTURE_2D,T3.gtex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c)}
  t3GroundLay()}
function t3GroundLay(){const gl=T3.gl;if(!T3.pO)T3.pO=t3Prog(T3VS_BB,T3FS_OV,['aP','aQ','aT','aC']);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);t3QW([[0,AH,.6],[AW,AH,.6],[AW,0,.6],[0,0,.6]],0,0,1,1,1,1,1,1);t3QFlush(T3.pO,T3.gtex);gl.depthMask(true);gl.disable(gl.BLEND)}
T3H.ground.push(t3GroundOver);
// ------------------------------------------------------------------ over the 3D, on the game's canvas: what the game draws in the air (its
// effects, the shots not yet in 3D, the numbers) at the place the 3D puts them: each drawing with the scale it has at its depth
function t3At(x,y,h){const q=t3P(x,y+(h||0),h||0);if(!q)return false;const k=t3K(q[2]);ctx.setTransform(k,0,0,k,q[0]-k*x,q[1]-k*y);return true}
// the game's own frame (the battle's camera on the screen): for what belongs to the view, not to a place (the gold timer, the trial's tag)
function t3Frame2D(){const cw=cv.width,ch=cv.height,s=Math.min(cw/VW,ch/VH),ox=Math.round((cw-VW*s)/2),oy=Math.round(Math.max(0,(ch-VH*s)/2));ctx.setTransform(s,0,0,s,ox-(G.vx||0)*s,oy-(G.vy||0)*s);return{s,ox,oy}}
function t3FxItem(f){
  if(f.k==='chunk'){ctx.fillStyle=f.col;circ(f.x,f.y,f.r);ctx.fill()}
  else if(f.k==='puff'){ctx.fillStyle=`rgba(220,210,190,${Math.min(1,f.t*1.4)})`;circ(f.x,f.y,f.r);ctx.fill()}
  else if(f.k==='ghost'){ctx.fillStyle=`rgba(47,179,166,${f.t*2})`;circ(f.x,f.y-8,10);ctx.fill()}
  else if(f.k==='spark'){ctx.fillStyle='#f6ead2';circ(f.x,f.y,2);ctx.fill()}
  else if(f.k==='chain'){const a=f.t/.22;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,140,50,${a})`;ctx.lineWidth=5*a+1;ctx.beginPath();ctx.moveTo(f.x,f.y);const n=5;for(let k=1;k<n;k++)ctx.lineTo(f.x+(f.x2-f.x)*k/n+rand(-7,7),f.y+(f.y2-f.y)*k/n+rand(-7,7));ctx.lineTo(f.x2,f.y2);ctx.stroke();ctx.strokeStyle=`rgba(255,240,180,${a})`;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();glow('255,140,50',f.x2,f.y2,18,.6*a)}
  else if(f.k==='lvl'){ctx.fillStyle=f.gold?`rgba(255,215,90,${Math.min(1,f.t*2.2)})`:`rgba(150,255,195,${Math.min(1,f.t*2.2)})`;circ(f.x,f.y,2.3);ctx.fill()}
  else if(f.k==='bolt')drawBolt(f);
  else if(FXDRAW[f.k])FXDRAW[f.k](f);
  else if(f.k==='flash'||f.k==='ring2'||f.k==='streak'||f.k==='firep'||f.k==='spore'||f.k==='pop')drawFx2(f);
  else if(f.k==='boom'){const p=1-f.t/.35;ctx.fillStyle=`rgba(255,200,90,${.5*(1-p)})`;circ(f.x,f.y,f.r*p);ctx.fill();ctx.strokeStyle=`rgba(255,138,60,${1-p})`;ctx.lineWidth=5;circ(f.x,f.y,f.r*p);ctx.stroke()}}
function t3Over(){const sv=noShadow;noShadow=true;ctx.save();
  try{// the pickups not yet in 3D: the orbs, the coins, the crystals, the hearts, standing at their place
    if(!T3H.pickups){if(t3At(P.x,P.y,0))drawOrbs();
      for(const c0 of G.coins){if(!t3At(c0.x,c0.y,0))continue;if(icoOk(ICO.coin)){const k=.4+.6*Math.abs(Math.cos(G.t*3.2+c0.x*.37+c0.y*.11));ctx.drawImage(ICO.coin,c0.x-6.5*k,c0.y-7,13*k,13)}else{ink(1.8);circ(c0.x,c0.y,4.5);fs('#ffc93c')}}
      for(const g of G.gems){if(!t3At(g.x,g.y,0))continue;const b=g.z>0?0:Math.sin(G.t*3+g.ph)*1.6,y=g.y-g.z-8+b;drawGem(g.x,y,1.15)}
      for(const h of G.hearts){if(!t3At(h.x,h.y,0))continue;const by=Math.sin(G.t*4+h.x)*2;ink(2);ctx.beginPath();const x=h.x,y=h.y-6+by;ctx.moveTo(x,y+7);ctx.bezierCurveTo(x-10,y,x-7,y-7,x,y-3);ctx.bezierCurveTo(x+7,y-7,x+10,y,x,y+7);fs('#e5484d')}}
    // the shots and the effects
    if(!T3H.shots){for(const a of G.arrows)if(t3At(a.x,a.y,0))drawArrow(a);for(const p of G.eproj)if(t3At(p.x,p.y,0))drawEproj(p)}
    for(let i=0;i<P.orbit;i++){const a=G.t*3.6+i*TAU/P.orbit,bx=P.x+Math.cos(a)*(P.storm?60:44),by=P.y-6+Math.sin(a)*(P.storm?60:44);if(!t3At(bx,by,0))continue;ctx.translate(bx,by);ctx.rotate(a+G.t*8);if(P.storm)ctx.scale(1.45,1.45);ink(2);ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(4,0);ctx.lineTo(0,9);ctx.lineTo(-4,0);ctx.closePath();fs('#dfe4ea')}
    if(t3At(T3.tg[0],T3.tg[1],0)){drawPetShots();drawBoulders();drawHazards2Air();drawLobsAir();drawUltRain();drawDebris('air');drawAmbient()}
    if(!T3H.fx)for(const f of G.fx){if(t3At(f.x,f.y,0))t3FxItem(f)}
    for(const f of T3H.over)try{f()}catch(e){t3Err(e)}
    // the bars over the heads, the numbers
    t3Bars();
    ctx.textAlign='center';for(const t of G.texts){if(!t3At(t.x,t.y,26))continue;ctx.globalAlpha=Math.min(1,t.life*2.5);ctx.font=Math.round(t.size*(t.pop?1+1.2*Math.max(0,(t.life-.62)/.18):1))+'px "Lilita One", sans-serif';
      ctx.lineWidth=3.5;ctx.strokeStyle=INK;ctx.strokeText(t.t,t.x,t.y);ctx.fillStyle=t.col;ctx.fillText(t.t,t.x,t.y)}ctx.globalAlpha=1;
    t3Frame2D();drawUltOverlay();if(G.goldRun)drawGoldTimer();if(G.trial)drawTrialTag()}
  catch(e){t3Err(e)}finally{ctx.restore();noShadow=sv}
  const cw=cv.width,ch=cv.height;ctx.setTransform(1,0,0,1,0,0);t3Offscreen();if(G.state==='dead')drawDeathFx(cw,ch);
  if(joy.active){const rc=cv.getBoundingClientRect(),dpr=cw/rc.width,jx=(joy.ox-rc.left)*dpr,jy=(joy.oy-rc.top)*dpr;
    ctx.strokeStyle='rgba(246,234,210,.35)';ctx.lineWidth=3*dpr;circ(jx,jy,JR*dpr);ctx.stroke();ctx.fillStyle='rgba(246,234,210,.4)';circ(jx+joy.dx*JR*dpr,jy+joy.dy*JR*dpr,20*dpr);ctx.fill()}}
// the bars over the heads (as drawBars: the enemies hurt or champions, the skeletons' shield, the hero's life with its number), at the
// place over the head that the 3D gives
function t3Bars(){const at=(x,y,h)=>{const q=t3P(x,y,h);return q?[q[0],q[1],t3K(q[2])]:null};ctx.setTransform(1,0,0,1,0,0);
  for(const e of G.enemies){if(isBoss(e.type)||(e.hp>=e.max&&!e.elite)||e.hidden||e.spawn>0)continue;const fly=e.type==='bat'||e.type==='wisp'?12:0,q=at(e.x,e.y,e.r*2+(e.z||0)+14+fly+(T3H.barH?T3H.barH(e):0));if(!q)continue;
    const k=q[2],w=Math.max(22,e.r*2)*(e.elite?1.3:1)*k,x=q[0]-w/2,y=q[1];ctx.fillStyle=INK;ctx.fillRect(x-k,y,w+2*k,5*k);ctx.fillStyle=e.elite?'#ffc93c':'#e5484d';ctx.fillRect(x,y+k,w*Math.max(0,e.hp/e.max),3*k)}
  if(G.door&&P.y<TOP+2)return;const q=at(P.x,P.y,50);if(!q)return;const k=q[2],w=34*k,x=q[0]-w/2,y=q[1],pct=P.hp/P.maxhp;
  ctx.fillStyle=INK;ctx.fillRect(x-2*k,y,w+4*k,8*k);ctx.fillStyle='#3a2a24';ctx.fillRect(x,y+2*k,w,4*k);{const tp=Math.min(1,(P.hpTrail==null?P.hp:P.hpTrail)/P.maxhp);if(tp>pct){ctx.fillStyle='#fff';ctx.fillRect(x,y+2*k,w*tp,4*k)}}
  ctx.fillStyle=pct>.35?'#7bbf4a':'#e5484d';ctx.fillRect(x,y+2*k,w*pct,4*k);ctx.font=Math.round(11*k)+'px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3*k;ctx.strokeStyle=INK;ctx.strokeText(Math.ceil(P.hp),q[0],y-3*k);ctx.fillStyle='#fff';ctx.fillText(Math.ceil(P.hp),q[0],y-3*k)}
// the little arrows on the edges toward the enemies off screen
function t3Offscreen(){const cw=cv.width,ch=cv.height,m=26*(cw/(T3.W||cw));for(const e of G.enemies){if(e.hidden||e.spawn>0||e.dead)continue;const q=t3P(e.x,e.y,10);if(!q)continue;
    if(q[0]>0&&q[0]<cw&&q[1]>0&&q[1]<ch)continue;const cx=cw/2,cy=ch/2,dx=q[0]-cx,dy=q[1]-cy,k=Math.min((cw/2-m)/Math.max(1,Math.abs(dx)),(ch/2-m)/Math.max(1,Math.abs(dy))),x=cx+dx*k,y=cy+dy*k,a=Math.atan2(dy,dx),s=m*.42;
    ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(s,0);ctx.lineTo(-s*.7,s*.65);ctx.lineTo(-s*.7,-s*.65);ctx.closePath();ctx.fillStyle=isBoss(e.type)?'#ffc93c':'#e5484d';ctx.strokeStyle=INK;ctx.lineWidth=s*.25;ctx.fill();ctx.stroke();ctx.restore()}}
// ------------------------------------------------------------------ the button of the light («Luce: Chiara ▸» / «Luce: Da film ▸») and L
function t3UI(){let b=document.getElementById('t3btn');if(!b){const st=document.createElement('style');st.textContent=`#t3btn{position:absolute;right:10px;top:calc(env(safe-area-inset-top,0px) + 92px);z-index:6;display:none;align-items:center;gap:6px;padding:7px 12px 7px 10px;border-radius:999px;border:2px solid #2a2118;background:linear-gradient(#3b3226,#241d16);color:#f4e9d2;font:800 13px/1 "Baloo 2",system-ui,sans-serif;box-shadow:0 3px 0 #000,inset 0 1px 0 rgba(255,240,210,.18);cursor:pointer;touch-action:manipulation}
    #t3btn:active{transform:translateY(2px);box-shadow:0 1px 0 #000}#t3btn i{width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff7d6,#ffb84a 60%,#a04a10);box-shadow:0 0 8px #ffb84a}#t3btn small{opacity:.7;font-weight:700}
    #t3toast{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);z-index:7;padding:10px 16px;border-radius:14px;background:rgba(18,14,10,.86);border:2px solid #2a2118;color:#f4e9d2;font:800 15px "Baloo 2",system-ui;text-align:center;pointer-events:none;transition:opacity .4s;opacity:0}`;document.head.appendChild(st);
    b=document.createElement('button');b.id='t3btn';b.type='button';b.innerHTML='<i></i><span></span>';b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
    b.addEventListener('click',e=>{e.stopPropagation();t3SetLuce(T3.luce==='chiara'?'film':'chiara')});(cv.parentNode||document.body).appendChild(b)}
  b.querySelector('span').innerHTML='Luce: '+t3L().nome+' <small>▸</small>';return b}
function t3Toast(t,s){let e=document.getElementById('t3toast');if(!e){e=document.createElement('div');e.id='t3toast';(cv.parentNode||document.body).appendChild(e)}e.innerHTML=t;e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>{e.style.opacity=0},(s||1.6)*1000)}
function t3SetLuce(l){T3.luce=T3LUCI[l]?l:'chiara';try{localStorage.setItem('mb_t3_luce',T3.luce)}catch(e){}t3UI();t3Toast('Luce: '+t3L().nome)}
try{const l=localStorage.getItem('mb_t3_luce');if(T3LUCI[l])T3.luce=l}catch(e){}
addEventListener('keydown',e=>{if(e.code==='KeyL'&&!e.repeat&&T3.shown)t3SetLuce(T3.luce==='chiara'?'film':'chiara')});
// ------------------------------------------------------------------ the hook: the game's render asks first whether the room is ours
function t3Hide(){if(T3.cv&&T3.cv.style.display!=='none')T3.cv.style.display='none';const b=document.getElementById('t3btn');if(b)b.style.display='none';T3.shown=false}
{const _r=render;render=function(){if(!t3Active()||!t3Init()){t3Hide();return _r.apply(this,arguments)}
  try{const b=t3UI();if(b.style.display!=='flex')b.style.display='flex';T3.shown=true;t3Render()}
  catch(e){t3Err(e);if(T3.err>4){T3.bad=true;t3Toast('Il 3D si è fermato: torno al disegno di prima',2.6)}t3Hide();return _r.apply(this,arguments)}}}
// a slow phone: smaller picture, softer outline (fluido prima di tutto); the game's own «auto» quality goes on as before
{const _l=hud;hud=function(){const r=_l.apply(this,arguments);if(T3.shown&&!T3.low&&!T3.noLow&&frameEma>.024){T3.slow=(T3.slow||0)+.016;if(T3.slow>1.5){T3.low=true;T3.fboOk=false}}else T3.slow=Math.max(0,(T3.slow||0)-.008);return r}}
window.__T3=T3;
