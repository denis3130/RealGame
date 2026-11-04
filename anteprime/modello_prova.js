// Pagina di prova del modello della foto del 3 novembre (Denis: «fammi vedere lo stesso modello dell'immagine in un'anteprima»): un modello
// non nostro, scaricato per provare il programma che disegna i modelli 3D: «Vanguard», un soldato di Mixamo (Adobe), dagli esempi di three.js,
// con le sue mosse (Idle, Walk, Run). Nostro è il modo di disegnarlo (sprite/mostri3d/mb3.js: notte, luna, contorno spesso, tre toni, rilievo)
// e il «Morso» con la testa che scatta verso di te. Il modello non va nel gioco. Costruita da anteprime/mk_modello_prova.py.
(()=>{'use strict';
const $=s=>document.querySelector(s),GLB='__GLB__',OGGI='__OGGI__',INFO=__INFO__;
const back=$('#bk'),cv=$('#cv'),fr=$('#fr'),bx=back.getContext('2d'),fx=fr.getContext('2d');
const gl=cv.getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:true});
if(!gl){$('#msg').hidden=false;$('#msg').textContent='Questo telefono non ha WebGL 2: lo zombie in 3D non si può disegnare.';return}
// ---------- the look of the night (the moon from the upper left, like the zombie map) ----------
const SKY=[.055,.07,.085],FOG=[.075,.09,.1],LIGHT=(()=>{const v=[-.55,.72,.42],l=Math.hypot(...v);return v.map(x=>x/l)})();
const LOOK={gioco:{toon:1,Lc:[1.08,1.04,1.12],amb:[.34,.36,.5],rim:[.32,.46,.7]},meshy:{toon:0,Lc:[1.12,1.1,1.1],amb:[.42,.42,.48],rim:[.18,.24,.34]}};
let look='gioco',low=false,ink=true,auto=true,four=false,cmp=false,yaw=.35,pitch=.2,dist=1,ms=0,fps=0,nf=0,tf=0,T0=performance.now()/1000;
// ---------- the model ----------
const b64=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
const M=MB3.model(MB3.readGLB(b64(GLB)));let R=null;
const clip={};M.clips.forEach(c=>{clip[c.name]=c});
// the real size of the zombie standing (the skinned vertices of the rest pose): feet on the ground, 1.7 tall, in the middle
const rest=MB3.pose(M,{a:null,w:1});
const box=(()=>{const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const q of M.prims){const P=q.pos,Jt=q.jnt,Wt=q.wgt,st=Math.max(1,(P.length/3/4000)|0);
  for(let v=0;v<P.length/3;v+=st){const p=[0,0,0];for(let k=0;k<4;k++){const w=Wt?Wt[v*4+k]:k?0:1;if(!w)continue;const J=rest.J?rest.J.subarray((Jt?Jt[v*4+k]:0)*16):MB3.m4(),x=P[v*3],y=P[v*3+1],z=P[v*3+2];
      p[0]+=w*(J[0]*x+J[4]*y+J[8]*z+J[12]);p[1]+=w*(J[1]*x+J[5]*y+J[9]*z+J[13]);p[2]+=w*(J[2]*x+J[6]*y+J[10]*z+J[14])}
    for(let c=0;c<3;c++){if(p[c]<mn[c])mn[c]=p[c];if(p[c]>mx[c])mx[c]=p[c]}}}return{mn,mx}})();
// the soldier of the test looks along -z: turned round, so he faces you (FACE: the turn round the up axis)
const FACE=INFO.face===undefined?Math.PI:INFO.face,cF=Math.cos(FACE),sF=Math.sin(FACE);
const H=box.mx[1]-box.mn[1]||1,SC=1.7/H,MM=MB3.m4(),cx=(box.mn[0]+box.mx[0])/2,cz=(box.mn[2]+box.mx[2])/2;MM[0]=cF*SC;MM[2]=-sF*SC;MM[5]=SC;MM[8]=sF*SC;MM[10]=cF*SC;
MM[12]=-(cF*cx+sF*cz)*SC;MM[13]=-box.mn[1]*SC;MM[14]=-(-sF*cx+cF*cz)*SC;
// the bones we move ourselves (found by name: Meshy's skeleton is like Mixamo's)
const bone=(...re)=>{for(const r of re){const n=M.nodes.find(n=>r.test(n.name)&&(!M.skin||M.skin.joints.includes(n.i)));if(n)return n.i}return -1};
const B={hips:bone(/hips/i,/pelvis/i),sp1:bone(/^spine$/i,/spine0?1?$/i),sp2:bone(/spine0?2$/i,/spine1$/i,/chest/i),neck:bone(/neck/i),head:bone(/^head$/i,/head(?!.*(end|top))/i),
  la:bone(/left.?arm$/i,/arm.?l$/i,/l.?upperarm/i),ra:bone(/right.?arm$/i,/arm.?r$/i,/r.?upperarm/i),lf:bone(/left.?fore/i,/forearm.?l/i,/l.?lowerarm/i),rf:bone(/right.?fore/i,/forearm.?r/i,/r.?lowerarm/i),
  lh:bone(/left.?hand$/i,/hand.?l$/i),rh:bone(/right.?hand$/i,/hand.?r$/i)};
// ---------- the moves: Meshy's, and ours on top ----------
const MOVES=[
  {id:'fermo',n:'Fermo',src:'la sua mossa «Idle», più la testa che scatta verso di te (nostra)',clip:'fermo',loop:1,lay:'fermo'},
  {id:'cammina',n:'Cammina',src:'la sua mossa «Walk», con la testa piegata (nostra)',clip:'cammina',loop:1,lay:'cammina'},
  {id:'scatto',n:'Corre',src:'la sua mossa «Run»',clip:'corre',loop:1},
  {id:'morso',n:'Morso',src:'fatto da noi: si tira indietro, scatta, morde, torna',clip:'fermo',lay:'morso',dur:1.6}].filter(m=>clip[m.clip]);
const SEQ=['fermo','cammina','scatto','morso'],SEQT={fermo:4,cammina:4,scatto:3};
let cur=null,prev=null,blend=1,all=false,seqI=0,flash=0,rise=0,sink=0,dirt=[];
const now=()=>performance.now()/1000-T0;
function play(id,keepAll){const m=MOVES.find(x=>x.id===id)||MOVES.find(x=>x.id==='fermo')||MOVES[0];if(!m)return;if(!keepAll)all=false;
  prev=cur?{...cur,clip:cur.clip}:null;blend=prev?0:1;cur={m,clip:clip[m.clip],t0:now(),t:0,done:false};
  if(m.flash)flash=1;if(m.id==='sbuca'){rise=1;sink=0;spray(14)}if(m.id!=='muore')sink=0;ui()}
function movT(c,t){const m=c.m,d=m.dur||c.clip.dur/(m.sp||1);if(m.loop)return((t*(m.sp||1))%c.clip.dur+c.clip.dur)%c.clip.dur;return Math.min(c.clip.dur,t*(m.sp||1)*(m.dur?c.clip.dur/m.dur/(m.sp||1):1))}
// ---------- our pieces on top of Meshy's moves (all depend only on the time of the move) ----------
const sm=x=>x<=0?0:x>=1?1:x*x*(3-2*x),hz=(t,f,s)=>Math.sin(t*f*6.283+s)*Math.sin(t*f*2.7+s*1.7);
function layers(c,t,tw,tr){const L=c.m.lay,q=(n,ax,ay,az,a)=>{if(n<0||!a)return;const r=MB3.qaxis(ax,ay,az,a);tw[n]=tw[n]?MB3.qmul(r,tw[n]):r};
  const toCam=Math.atan2(Math.sin(yaw),Math.cos(yaw));// where you are, seen from him (turned to face you, he looks along +z of the world)
  if(L==='fermo'){// still… then the head snaps towards you, stays, and slowly comes back; now and then a tremor
    const P=6.2,k=t%P,g=k<3.4?0:k<3.52?sm((k-3.4)/.12):k<4.9?1:1-sm((k-4.9)/1.2),a=Math.max(-1.1,Math.min(1.1,toCam));
    q(B.neck,0,1,0,a*.45*g);q(B.head,0,1,0,a*.55*g);q(B.head,0,0,1,-.32*g);q(B.head,1,0,0,.12*g);
    const tr1=k>1.2&&k<1.9?1:0;q(B.rh,0,0,1,tr1*.22*hz(t,9,1));q(B.head,0,0,1,tr1*.05*hz(t,13,2))}
  if(L==='cammina'){// the head bent too far to one side, and a jerk now and then
    const P=2.7,k=t%P,j=k<.1?sm(k/.1):k<.5?1-sm((k-.1)/.4):0;q(B.head,0,0,1,.42+.25*j);q(B.neck,0,0,1,.12);q(B.head,1,0,0,.18-.2*j);q(B.lf,1,0,0,-.08*j)}
  if(L==='morso'){// back, back… snap! bite, and back again
    const d=c.m.dur,p=Math.min(1,t/d),pr=sm(p/.42),st=p<.42?0:p<.52?sm((p-.42)/.1):p<.7?1:1-sm((p-.7)/.3),bk=pr*(1-st);
    q(B.sp1,1,0,0,-.22*bk+.38*st);q(B.sp2,1,0,0,-.16*bk+.3*st);q(B.neck,1,0,0,-.35*bk+.25*st);q(B.head,1,0,0,-.3*bk+.42*st);q(B.head,0,0,1,.18*bk);
    q(B.la,1,0,0,-1.15*Math.max(bk,st*.8));q(B.ra,1,0,0,-1.25*Math.max(bk,st*.85));q(B.la,0,0,1,-.25*bk);q(B.ra,0,0,1,.25*bk);
    q(B.lf,1,0,0,-.5*bk+.3*st);q(B.rf,1,0,0,-.55*bk+.3*st);if(B.hips>=0){const n=M.nodes[B.hips],u=(H/1.7)*.0;tr[B.hips]=[0,-.03*bk/SC,(-.1*bk+.32*st)/SC]}}
  if(L==='sbuca'){/* the rise is done on the whole model: see frame() */}}
function spray(n){if(low)n=Math.ceil(n/2);for(let i=0;i<n;i++){const a=Math.random()*6.283,s=.6+Math.random()*1.4;dirt.push({x:Math.cos(a)*.25,y:.02,z:Math.sin(a)*.25,vx:Math.cos(a)*s*.8,vy:1.6+Math.random()*2.2,vz:Math.sin(a)*s*.8,r:.02+Math.random()*.04,l:1})}}
// ---------- the stage: the ground of the graveyard (with the hole), the soft shadow, the glow of the eyes ----------
const GVS=`#version 300 es
in vec2 aP;uniform mat4 uVP;out vec3 vW;void main(){vW=vec3(aP.x,0.,aP.y);gl_Position=uVP*vec4(vW,1.);}`;
const GFS=`#version 300 es
precision highp float;in vec3 vW;uniform vec3 uCam,uFog,uL;uniform vec2 uSh,uHo;uniform float uShK,uShR,uHole,uT;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 p=vW.xz;float a=n(p*1.3)*.55+n(p*4.1)*.3+n(p*11.)*.15;
  vec3 gr=mix(vec3(.12,.16,.105),vec3(.2,.25,.135),a),di=mix(vec3(.15,.115,.085),vec3(.23,.18,.125),n(p*6.3));
  float dm=smoothstep(.48,.66,n(p*.62+3.1));vec3 c=mix(gr,di,dm);c*=.82+.36*n(p*23.+1.7);
  float st=step(.8,n(p*9.+7.))*step(.5,n(p*31.));c=mix(c,vec3(.26,.27,.25),st*.5);
  float hd=length(p-uHo),ho=uHole*(1.-smoothstep(.26,.36,hd)),rim=uHole*smoothstep(.22,.34,hd)*(1.-smoothstep(.34,.6,hd));
  c=mix(c,vec3(.27,.2,.13)*(.8+.4*n(p*14.)),rim*.85);c=mix(c,vec3(.03,.025,.02),ho);
  float s=uShK*(1.-smoothstep(0.,uShR,length((p-uSh)*vec2(1.,1.15))));c*=1.-.62*s;
  c*=.9+.2*smoothstep(-.2,.9,dot(normalize(vec3(p.x,2.,p.y)),uL));
  float d=length(vW-uCam),f=smoothstep(3.,8.5,d);c=mix(c,uFog,f);float r=length(p),al=1.-smoothstep(2.6,4.4,r);o=vec4(c*al,al);}`;
const QVS=`#version 300 es
in vec2 aP;out vec2 vU;void main(){vU=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
const BFS=`#version 300 es
precision mediump float;in vec2 vU;uniform sampler2D uT;uniform vec2 uD;out vec4 o;
void main(){vec3 c=texture(uT,vU).rgb*.227;c+=(texture(uT,vU+uD).rgb+texture(uT,vU-uD).rgb)*.194;c+=(texture(uT,vU+uD*2.).rgb+texture(uT,vU-uD*2.).rgb)*.122;
  c+=(texture(uT,vU+uD*3.).rgb+texture(uT,vU-uD*3.).rgb)*.054;c+=(texture(uT,vU+uD*4.).rgb+texture(uT,vU-uD*4.).rgb)*.016;o=vec4(c,1.);}`;
const AFS=`#version 300 es
precision mediump float;in vec2 vU;uniform sampler2D uT;uniform float uK;out vec4 o;void main(){vec3 c=texture(uT,vU).rgb*uK;o=vec4(c,max(c.r,max(c.g,c.b)));}`;
function prog(vs,fs){const mk=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x};
  const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,vs));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);
  const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name)}return{p,u}}
let PG,PB,PA,vGround,vQuad,fbo=[];
function stage(){PG=prog(GVS,GFS);PB=prog(QVS,BFS);PA=prog(QVS,AFS);
  const va=(d)=>{const v=gl.createVertexArray();gl.bindVertexArray(v);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.bindVertexArray(null);return v};
  vGround=va([-5,-5,5,-5,-5,5,5,5]);vQuad=va([-1,-1,1,-1,-1,1,1,1])}
function target(w,h,depth){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
  if(depth){const r=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,r);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,r)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);return{t,f,w,h}}
// ---------- the painted night behind (sky, moon, hills, crooked tombstones, a dead tree) ----------
function paintBack(W,Hh,dpr){back.width=W*dpr;back.height=Hh*dpr;const c=bx;c.setTransform(dpr,0,0,dpr,0,0);
  const g=c.createLinearGradient(0,0,0,Hh);g.addColorStop(0,'#0b1016');g.addColorStop(.55,'#141c22');g.addColorStop(1,'#11171a');c.fillStyle=g;c.fillRect(0,0,W,Hh);
  const mx=W*.24,my=Hh*.17,mr=Math.min(W,Hh)*.07;let r=c.createRadialGradient(mx,my,mr*.6,mx,my,mr*5);r.addColorStop(0,'rgba(190,215,235,.22)');r.addColorStop(1,'rgba(190,215,235,0)');c.fillStyle=r;c.fillRect(0,0,W,Hh);
  c.fillStyle='#dfe9ee';c.beginPath();c.arc(mx,my,mr,0,7);c.fill();c.fillStyle='rgba(150,170,185,.45)';for(const[a,b,s]of[[.3,-.2,.22],[-.35,.25,.16],[.1,.4,.12]]){c.beginPath();c.arc(mx+a*mr,my+b*mr,s*mr,0,7);c.fill()}
  c.save();c.beginPath();c.arc(mx,my,mr+.5,0,7);c.clip();c.fillStyle='rgba(14,20,26,.55)';c.beginPath();c.arc(mx+mr*.55,my-mr*.25,mr*.95,0,7);c.fill();c.restore();
  const hz=Hh*.5,hill=(y0,amp,col,sd)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,Hh);for(let x=0;x<=W;x+=W/40)c.lineTo(x,y0-amp*(Math.sin(x/W*5+sd)*.6+Math.sin(x/W*13+sd*2)*.25+.4));c.lineTo(W,Hh);c.fill()};
  hill(hz-6,26,'#10171b',1);hill(hz+8,16,'#0c1215',4);
  c.fillStyle='#0a0f12';for(const[x,w,h,t]of[[.12,.05,.07,.1],[.2,.035,.05,-.15],[.78,.05,.08,.12],[.88,.04,.06,-.1],[.66,.03,.045,.05]]){c.save();c.translate(W*x,hz+12);c.rotate(t);
    c.beginPath();c.moveTo(-W*w/2,0);c.lineTo(-W*w/2,-Hh*h+W*w/2);c.arc(0,-Hh*h+W*w/2,W*w/2,Math.PI,0);c.lineTo(W*w/2,0);c.fill();c.restore()}
  c.strokeStyle='#0a0f12';c.lineCap='round';const tr=(x,y,l,a,w,d)=>{if(d>4||l<4)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
    tr(x2,y2,l*.72,a-.45-d*.05,w*.65,d+1);tr(x2,y2,l*.66,a+.5,w*.6,d+1)};tr(W*.93,hz+14,Hh*.09,-1.62,5,0);
  const v=c.createRadialGradient(W/2,Hh*.55,Math.min(W,Hh)*.3,W/2,Hh*.55,Math.max(W,Hh)*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');c.fillStyle=v;c.fillRect(0,0,W,Hh)}
// ---------- one frame ----------
let W0=0,H0=0,DPR=1,SHIFT=.17;const VP=new Float32Array(16),PR=new Float32Array(16),VW=new Float32Array(16),Mx=new Float32Array(16);
function resize(){const W=innerWidth,Hh=innerHeight,dpr=Math.min(low?1:2,devicePixelRatio||1);if(W===W0&&Hh===H0&&dpr===DPR)return;W0=W;H0=Hh;DPR=dpr;
  for(const c of[cv,fr]){c.width=Math.round(W*dpr);c.height=Math.round(Hh*dpr)}paintBack(W,Hh,dpr);fbo=[]}
function camAt(yw,pt,d,ax,ay,aw,ah){const ch=.86,dd=4.8*d,e=[Math.sin(yw)*Math.cos(pt)*dd,ch+Math.sin(pt)*dd,Math.cos(yw)*Math.cos(pt)*dd];
  MB3.persp(PR,.62,aw/ah,.1,40);MB3.look(VW,e,[0,ch-.04,0],[0,1,0]);MB3.mul(VP,PR,VW);const sy=ah<cv.height*.9?0:SHIFT;if(sy)for(const i of[1,5,9,13])VP[i]+=sy*VP[i+2];
  return{VP:Float32Array.from(VP),eye:e,px:[2/aw,2/ah],vp:[ax,ay,aw,ah]}}
function frame(){requestAnimationFrame(frame);if(!R||!cur)return;resize();const t0=performance.now(),tt=now(),dt=Math.min(.05,tt-(frame.l||tt));frame.l=tt;
  if(auto&&!drag&&!four)yaw+=dt*.32;
  // which move, at what moment (the sequence of «Tutte»)
  let c=cur;c.t=tt-c.t0;const m=c.m,len=m.loop?(SEQT[m.id]||1e9):(m.dur||c.clip.dur/(m.sp||1))+(m.hold||0);
  if(all&&c.t>len){seqI=(seqI+1)%SEQ.length;play(SEQ[seqI],true);c=cur}
  else if(!m.loop&&c.t>len&&!all){play('fermo');c=cur}
  blend=Math.min(1,blend+dt/.22);flash=Math.max(0,flash-dt*3.2);
  const st={a:{clip:c.clip,t:movT(c,c.t)},b:prev&&blend<1?{clip:prev.clip,t:movT(prev,tt-prev.t0)}:null,w:blend,tw:{},tr:{}};
  layers(c,c.t,st.tw,st.tr);if(prev&&blend<1&&prev.m.lay&&prev.m.lay!=='morso'){const tw2={},tr2={};layers(prev,tt-prev.t0,tw2,tr2);
    for(const k in tw2){const a=tw2[k],b=st.tw[k]||[0,0,0,1];st.tw[k]=MB3.nlerp([0,0,0,1],a,b,blend)}}
  const P=MB3.pose(M,st);
  // rising from the ground / sinking after death: the whole model moves, what is under the ground is not drawn
  let y=0;if(m.id==='sbuca'){const k=Math.min(1,c.t/(c.clip.dur*.55));y=-(1-sm(k))*1.05;if(c.t<c.clip.dur*.5&&Math.random()<dt*14)spray(1)}
  if(m.id==='muore'&&c.t>c.clip.dur+.9){sink=Math.min(1,(c.t-c.clip.dur-.9)/1.2);y=-sink*.8}
  Mx.set(MM);Mx[13]+=y;
  // the light of the moon and the shadow under the body (where the hips are)
  const hp=B.hips>=0?P.W.subarray(B.hips*16+12,B.hips*16+15):[0,0,0],hx=MM[0]*hp[0]+MM[8]*hp[2]+MM[12],hz=MM[2]*hp[0]+MM[10]*hp[2]+MM[14],hy=hp[1]*SC+MM[13]+y;
  const W=cv.width,Hh=cv.height;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,Hh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  fx.setTransform(1,0,0,1,0,0);fx.clearRect(0,0,fr.width,fr.height);
  // (four sides: the same as the picture of our zombie of today; the 3/4 and the side look to the right like there)
  let views=[{yw:yaw,x:0,y:0,w:W,h:Hh,d:dist}];
  if(four){const ww=W/4,hh=Math.round(ww*2),r=$('#oggi').getBoundingClientRect(),yy=cmp?Math.round((r.bottom+26)*DPR):Math.round(Math.max(96*DPR,(Hh*.74-hh)/2));
    views=[0,-.62,-Math.PI/2,Math.PI].map((a,i)=>({yw:a+(auto?0:yaw*0),x:Math.round(i*ww),y:yy,w:Math.round(ww),h:hh,d:.74,lab:['davanti','tre quarti','lato','dietro'][i]}));
    fx.fillStyle='#f1e4c6';fx.font=`400 ${15*DPR}px "Lilita One",system-ui`;fx.textAlign='left';fx.shadowColor='#1b1612';fx.shadowOffsetY=2*DPR;
    if(cmp){fx.fillText('Oggi nel gioco',10*DPR,(r.top-6)*DPR);fx.fillText('Con Meshy',10*DPR,yy-6*DPR)}fx.shadowOffsetY=0}
  const L=LOOK[look],out=ink?(low?1.6:2.6)*DPR*(four?.6:1):0,emK=1.25+.55*Math.sin(tt*2.1)+(m.id==='urla'?.6:0);
  for(const v of views){const cam=camAt(v.yw,four?.12:pitch,v.d,v.x,v.y,v.w,v.h);gl.viewport(v.x,Hh-v.y-v.h,v.w,v.h);
    // the ground
    gl.useProgram(PG.p);gl.uniformMatrix4fv(PG.u.uVP,false,cam.VP);gl.uniform3fv(PG.u.uCam,cam.eye);gl.uniform3fv(PG.u.uFog,FOG);gl.uniform3fv(PG.u.uL,LIGHT);
    gl.uniform2f(PG.u.uSh,hx+(-LIGHT[0])*.05,hz+(-LIGHT[2])*.05);gl.uniform1f(PG.u.uShK,Math.max(0,1-Math.max(0,y+hy-.9)*.8)*(1-sink));gl.uniform1f(PG.u.uShR,.42+Math.max(0,.9-hy)*.6);
    gl.uniform2f(PG.u.uHo,0,0);gl.uniform1f(PG.u.uHole,m.id==='sbuca'?1-sm((c.t-c.clip.dur*.6)/1.5):m.id==='muore'?sink:0);gl.uniform1f(PG.u.uT,tt);
    gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindVertexArray(vGround);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.bindVertexArray(null);gl.disable(gl.BLEND);
    // the zombie
    gl.enable(gl.DEPTH_TEST);
    MB3.draw(gl,R,M,P.J,cam,{M:Mx,L:LIGHT,Lc:L.Lc,amb:L.amb,rim:L.rim,toon:L.toon,out,emK,flash,fog:[4,10],fogC:FOG,ny:NY,noNrm:low,clipY:m.id==='sbuca'||m.id==='muore'?-.002:undefined});
    if(!low&&!four)glow(cam,P,emK,v);
    if(four&&!cmp){fx.fillStyle='rgba(241,228,198,.8)';fx.font=`700 ${12*DPR}px "Baloo 2",system-ui`;fx.textAlign='center';fx.fillText(v.lab,v.x+v.w/2,v.y+v.h+14*DPR)}}
  // flying soil
  if(dirt.length){const cam=camAt(views[0].yw,four?.12:pitch,views[0].d,0,0,W,Hh);fx.fillStyle='#3a2a1c';for(const d of dirt){d.vy-=9.8*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;if(d.y<0){d.y=0;d.vx*=.4;d.vz*=.4;d.vy=0;d.l-=dt*1.5}
      const V=cam.VP,X=V[0]*d.x+V[4]*d.y+V[8]*d.z+V[12],Y=V[1]*d.x+V[5]*d.y+V[9]*d.z+V[13],Wc=V[3]*d.x+V[7]*d.y+V[11]*d.z+V[15];if(Wc<.1||four)continue;
      fx.globalAlpha=Math.max(0,Math.min(1,d.l));fx.beginPath();fx.arc((X/Wc*.5+.5)*W,(.5-Y/Wc*.5)*Hh,d.r*Hh/Wc*1.4,0,7);fx.fill()}fx.globalAlpha=1;dirt=dirt.filter(d=>d.l>0)}
  const e=performance.now()-t0;ms=ms?ms*.92+e*.08:e;nf++;if(tt-tf>1){fps=nf/(tt-tf);nf=0;tf=tt;$('#ms').textContent=`${ms.toFixed(1)} ms · ${fps|0} al secondo`}}
// the glow of the eyes: only the light of the eyes, small, blurred, added on top
function glow(cam,P,emK,v){const w=Math.max(8,v.w>>2),h=Math.max(8,v.h>>2);if(!fbo.length||fbo[0].w!==w||fbo[0].h!==h)fbo=[target(w,h,1),target(w,h),target(w,h)];
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[0].f);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  MB3.draw(gl,R,M,P.J,{...cam,px:[2/w,2/h]},{M:Mx,L:LIGHT,Lc:[1,1,1],amb:[1,1,1],rim:[0,0,0],out:0,emK,emOnly:1,clipY:cur&&(cur.m.id==='sbuca'||cur.m.id==='muore')?-.002:undefined});gl.disable(gl.DEPTH_TEST);
  gl.useProgram(PB.p);gl.bindVertexArray(vQuad);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(PB.u.uT,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[1].f);gl.bindTexture(gl.TEXTURE_2D,fbo[0].t);gl.uniform2f(PB.u.uD,1.6/w,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[2].f);gl.bindTexture(gl.TEXTURE_2D,fbo[1].t);gl.uniform2f(PB.u.uD,0,1.6/h);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(v.x,cv.height-v.y-v.h,v.w,v.h);gl.useProgram(PA.p);gl.bindTexture(gl.TEXTURE_2D,fbo[2].t);gl.uniform1i(PA.u.uT,0);gl.uniform1f(PA.u.uK,1.7);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.disable(gl.BLEND);gl.bindVertexArray(null)}
const NY=INFO.ny||1;
// ---------- the buttons ----------
function ui(){const bar=$('#mv');bar.innerHTML='';for(const m of MOVES){const b=document.createElement('button');b.textContent=m.n;b.className=!all&&cur&&cur.m.id===m.id?'on':'';b.onclick=()=>{play(m.id)};bar.appendChild(b)}
  const a=document.createElement('button');a.textContent='Tutte';a.className=all?'on':'';a.onclick=()=>{all=true;seqI=0;play(SEQ[0],true);ui()};bar.appendChild(a);
  $('#src').textContent=cur?cur.m.src:'';
  const op=$('#op');op.innerHTML='';const tg=(txt,on,f)=>{const b=document.createElement('button');b.textContent=txt;b.className=on?'on':'';b.onclick=()=>{f();ui()};op.appendChild(b)};
  tg('Quattro direzioni',four,()=>{four=!four;cmp=false});tg(look==='gioco'?'Luce: a tre toni':'Luce: morbida',false,()=>look=look==='gioco'?'meshy':'gioco');
  tg('Contorno',ink,()=>ink=!ink);tg('Effetti ridotti',low,()=>{low=!low;W0=0});tg('Gira da solo',auto,()=>auto=!auto);
  $('#oggi').hidden=true;$('#tit').textContent='Modello di prova'}
// ---------- the finger ----------
let drag=null,pinch=null;const pts=new Map();
cv.parentNode.addEventListener('pointerdown',e=>{if(e.target.closest('.ui'))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===1){drag={x:e.clientX,y:e.clientY,yw:yaw,pt:pitch};auto=false;ui()}
  else if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),k:dist};drag=null}});
addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pinch&&pts.size===2){const[a,b]=[...pts.values()];dist=Math.max(.45,Math.min(1.8,pinch.k*pinch.d/Math.max(20,Math.hypot(a[0]-b[0],a[1]-b[1]))))}
  else if(drag){yaw=drag.yw-(e.clientX-drag.x)*.011;pitch=Math.max(-.05,Math.min(1.05,drag.pt+(e.clientY-drag.y)*.006))}});
const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size)drag=null};addEventListener('pointerup',up);addEventListener('pointercancel',up);
addEventListener('wheel',e=>{dist=Math.max(.45,Math.min(1.8,dist*(1+Math.sign(e.deltaY)*.08)))},{passive:true});
$('#zm').onclick=()=>{dist=Math.min(1.8,dist*1.2)};$('#zp').onclick=()=>{dist=Math.max(.45,dist/1.2)};
addEventListener('keydown',e=>{const k=e.key;if(k==='ArrowLeft')yaw+=.2;if(k==='ArrowRight')yaw-=.2;if(k==='ArrowUp')pitch=Math.min(1.05,pitch+.08);if(k==='ArrowDown')pitch=Math.max(-.05,pitch-.08);
  const i=parseInt(k,10);if(i>=1&&i<=MOVES.length)play(MOVES[i-1].id)});
// ---------- start ----------
(async()=>{try{R=await MB3.gpu(gl,M);stage();play('fermo');$('#load').hidden=true;window.__MPV={M,R,B,MOVES,play,get cur(){return cur},set view(v){yaw=v},get ms(){return ms}};requestAnimationFrame(frame)}
  catch(e){$('#msg').hidden=false;$('#msg').textContent='Errore: '+e.message;console.error(e)}})();
})();
