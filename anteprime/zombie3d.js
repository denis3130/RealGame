// Pagina di prova degli zombie in 3D vero (Denis, 3 novembre: «mi piace come l'hai fatto il modello in 3d in questa immagine che mi hai
// mandato senza meshy», «non serve accedere a meshy continua cosi»; 4 novembre, lo strisciante: «vai fai»). I modelli li costruiscono
// sprite/mostri3d/zombie.js (il nostro Zombie della cripta), sprite/mostri3d/strisciante.js (lo Zombie strisciante) e sprite/mostri3d/minatore.js
// (lo Zombie minatore, con la lampada che fa luce a terra e le scintille del piccone), con la formula e la cassetta sprite/mostri3d/kit3d.js:
// stesse misure, pezzi e colori dei disegni di oggi. Li disegna sprite/mostri3d/mb3.js col nostro WebGL: notte
// del camposanto, luna, contorno spesso, tre toni, occhi che brillano e pulsano. Tutte le mosse sono nostre. In alto si sceglie il mostro (anche
// con l'indirizzo che finisce con #strisciante o #minatore). Dito: gira intorno; due dita o − e +: vicino e lontano. «Quattro direzioni» e «Prima e dopo» (il
// nostro mostro di oggi sopra, quello in 3D sotto, dagli stessi lati). Costruita da anteprime/mk_zombie3d.py.
(()=>{'use strict';
const $=s=>document.querySelector(s),OGGI={zombie:'__OGGI__',strisciante:'__OGGI_S__',minatore:'__OGGI_M__'};
const back=$('#bk'),cv=$('#cv'),fr=$('#fr'),bx=back.getContext('2d'),fx=fr.getContext('2d');
const gl=cv.getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:true});
if(!gl){$('#msg').hidden=false;$('#msg').textContent='Questo telefono non ha WebGL 2: lo zombie in 3D non si può disegnare.';return}
// ---------- the look of the night (the moon from the upper left, like the zombie map) ----------
const FOG=[.075,.09,.1],LIGHT=(()=>{const v=[-.55,.72,.42],l=Math.hypot(...v);return v.map(x=>x/l)})();
const LOOK={gioco:{toon:1,Lc:[1.1,1.06,1.12],amb:[.36,.38,.52],rim:[.34,.48,.72]},morbida:{toon:0,Lc:[1.12,1.1,1.1],amb:[.42,.42,.5],rim:[.2,.26,.36]}};
let look='gioco',low=false,ink=true,auto=true,four=false,cmp=false,yaw=.35,pitch=.34,dist=1,ms=0,fps=0,nf=0,tf=0,T0=performance.now()/1000;
// ---------- the monsters: the same night and the same size (units of the 2D drawings), each its own framing ----------
// ch: height the camera looks at, cz: how far forward (its middle), dd: how far, pitch: from how high; fd, fk, fp: distance, height of the tile and pitch of «Quattro direzioni»;
// hole: where it comes out of the ground (and how big, hoR); sh: the bones of the soft shadow (two: a long shadow between them); lamp: a lamp
// that lights the ground ahead (lib.lamp); sparks: the move and the moment the pick bites the ground (lib.tip: where)
const MODELS={zombie:{lib:ZB3,nome:'Zombie',sub:'Il nostro zombie base in 3D vero',ch:.86,dd:4.8,pitch:.34,fd:.8,fk:2,fp:.5,hole:[0,.2],hoR:1,sh:['bacino']},
  strisciante:{lib:ZS3,nome:'Strisciante',sub:'Lo zombie strisciante in 3D vero',ch:.3,cz:-.08,dd:5.4,pitch:.5,fd:.66,fk:1.15,fp:.62,hole:[0,-.16],hoR:1.3,sh:['petto','vita']},
  minatore:{lib:ZMI3,nome:'Minatore',sub:'Lo zombie minatore in 3D vero',ch:.84,cz:.06,dd:5,pitch:.34,fd:.8,fk:2,fp:.28,hole:[0,.2],hoR:1.05,sh:['bacino'],lamp:1,sparks:{id:'colpo',p:.5}}};
const H=43,SC=1.7/H,MM=MB3.m4();MM[0]=MM[5]=MM[10]=SC;
let MID=MODELS[location.hash.slice(1)]?location.hash.slice(1):'zombie',MD=MODELS[MID],M=null,R=null,buildMs=0,MOVES=[],JM=null;
function setModel(id){MID=MODELS[id]?id:'zombie';MD=MODELS[MID];if(!MD.M){const t=performance.now();MD.M=MD.lib.build();MD.ms=performance.now()-t}
  M=MD.M;buildMs=MD.ms;MOVES=Object.entries(MD.lib.MOSSE).map(([k,m])=>({id:k,...m}));JM=new Float32Array(MD.lib.BN.length*16);pitch=MD.pitch;cur=null;prev=null;HOLD=null;dirt=[];sparks=[]}
async function useModel(id){setModel(id);R=null;const md=MD;if(!md.R)md.R=await MB3.gpu(gl,md.M);if(md!==MD)return;R=md.R;$('#oggi').src=OGGI[MID];fbo=[];play('sbuca');ui()}
const SEQ=['sbuca','fermo','cammina','corre','urla','colpo','morso','colpito','muore'],SEQT={fermo:6,cammina:4.5,corre:3};
let cur=null,prev=null,blend=1,all=false,seqI=0,flash=0,sink=0,dirt=[],sparks=[],lampK=0,HOLD=null;
const now=()=>performance.now()/1000-T0;
function play(id,keepAll){const m=MOVES.find(x=>x.id===id)||MOVES[0];if(!keepAll)all=false;prev=cur?{...cur}:null;blend=prev?0:1;cur={m,t0:now()};
  if(id==='colpito')flash=1;if(id==='sbuca'){sink=0;spray(14)}if(id!=='muore')sink=0;ui()}
const pOf=(c,t)=>c.m.loop?((t/c.m.dur)%1+1)%1:Math.min(1,t/c.m.dur);
function spark(x,y,z){const n=low?8:18;for(let i=0;i<n;i++){const a=Math.random()*6.283,s=1.2+Math.random()*2.6;sparks.push({x,y,z,vx:Math.cos(a)*s*.6,vy:1.2+Math.random()*2.8,vz:Math.sin(a)*s*.6,l:1})}
  for(let i=0;i<(low?3:6);i++){const a=Math.random()*6.283,s=.4+Math.random()*1;dirt.push({x,y,z,vx:Math.cos(a)*s,vy:1+Math.random()*1.6,vz:Math.sin(a)*s,r:.012+Math.random()*.02,l:1})}}
function spray(n){if(low)n=Math.ceil(n/2);for(let i=0;i<n;i++){const a=Math.random()*6.283,s=.6+Math.random()*1.4;dirt.push({x:MD.hole[0]+Math.cos(a)*.25*MD.hoR,y:.02,z:MD.hole[1]+Math.sin(a)*.25*MD.hoR,vx:Math.cos(a)*s*.8,vy:1.6+Math.random()*2.2,vz:Math.sin(a)*s*.8,r:.02+Math.random()*.04,l:1})}}
// ---------- the stage: the ground of the graveyard (with the hole), the soft shadow, the glow of the eyes ----------
const GVS=`#version 300 es
in vec2 aP;uniform mat4 uVP;out vec3 vW;void main(){vW=vec3(aP.x,0.,aP.y);gl_Position=uVP*vec4(vW,1.);}`;
const GFS=`#version 300 es
precision highp float;in vec3 vW;uniform vec3 uCam,uFog,uL;uniform vec2 uSh,uSh2,uHo,uLm;uniform float uShK,uShR,uHole,uHoR,uLmK,uLmR;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 p=vW.xz;float a=n(p*1.3)*.55+n(p*4.1)*.3+n(p*11.)*.15;
  vec3 gr=mix(vec3(.12,.16,.105),vec3(.2,.25,.135),a),di=mix(vec3(.15,.115,.085),vec3(.23,.18,.125),n(p*6.3));
  float dm=smoothstep(.48,.66,n(p*.62+3.1));vec3 c=mix(gr,di,dm);c*=.82+.36*n(p*23.+1.7);
  float st=step(.8,n(p*9.+7.))*step(.5,n(p*31.));c=mix(c,vec3(.26,.27,.25),st*.5);
  float hd=length(p-uHo)/uHoR,ho=uHole*(1.-smoothstep(.26,.36,hd)),rim=uHole*smoothstep(.22,.34,hd)*(1.-smoothstep(.34,.6,hd));
  c=mix(c,vec3(.27,.2,.13)*(.8+.4*n(p*14.)),rim*.85);c=mix(c,vec3(.03,.025,.02),ho);
  vec2 sa=uSh2-uSh;float sl=dot(sa,sa),sq=sl>1e-6?clamp(dot(p-uSh,sa)/sl,0.,1.):0.;float s=uShK*(1.-smoothstep(0.,uShR,length((p-uSh-sa*sq)*vec2(1.,.85))));c*=1.-.62*s;
  c+=vec3(1.,.82,.5)*uLmK*(1.-smoothstep(0.,uLmR,length(p-uLm)))*(.75+.25*n(p*9.));
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
function camAt(yw,pt,d,ax,ay,aw,ah){const ch=MD.ch,cz=MD.cz||0,dd=MD.dd*d,e=[Math.sin(yw)*Math.cos(pt)*dd,ch+Math.sin(pt)*dd,cz+Math.cos(yw)*Math.cos(pt)*dd];
  MB3.persp(PR,.62,aw/ah,.1,40);MB3.look(VW,e,[0,ch-.04,cz],[0,1,0]);MB3.mul(VP,PR,VW);const sy=ah<cv.height*.9?0:SHIFT;if(sy)for(const i of[1,5,9,13])VP[i]+=sy*VP[i+2];
  return{VP:Float32Array.from(VP),eye:e,px:[2/aw,2/ah],vp:[ax,ay,aw,ah]}}
function frame(){requestAnimationFrame(frame);if(!R||!cur)return;resize();const t0=performance.now(),tt=now(),dt=Math.min(.05,tt-(frame.l||tt));frame.l=tt;
  if(auto&&!drag&&!four)yaw+=dt*.32;
  // which move, at what moment (the sequence of «Tutte»)
  if(HOLD){cur={m:MOVES.find(x=>x.id===HOLD.id),t0:tt-HOLD.p*MOVES.find(x=>x.id===HOLD.id).dur};prev=null;blend=1}
  let c=cur;const tc=tt-c.t0,m=c.m,len=m.loop?(SEQT[m.id]||1e9):m.dur+(m.hold?2.2:0);
  if(all&&tc>len){seqI=(seqI+1)%SEQ.length;play(SEQ[seqI],true);c=cur}
  else if(!m.loop&&tc>len&&!all){play(m.id==='muore'?'sbuca':'fermo');c=cur}
  blend=Math.min(1,blend+dt/.24);flash=Math.max(0,flash-dt*3.2);
  // the pose: where the eye of the camera is, seen from him, so the head snaps towards you
  const lookA=four?0:Math.atan2(Math.sin(yaw),Math.cos(yaw)),L0=MD.lib,P=L0.solve(M,L0.pose(c.m.id,pOf(c,tt-c.t0),{look:lookA}));
  const Pm=prev&&blend<1?L0.mix(P,L0.solve(M,L0.pose(prev.m.id,pOf(prev,tt-prev.t0),{look:lookA})),blend):P;L0.joints(M,Pm,JM);
  // sinking after death: the whole model goes down, what is under the ground is not drawn
  let y=0;const pc=pOf(c,tt-c.t0);if(m.id==='muore'&&tt-c.t0>m.dur+.9){sink=Math.min(1,(tt-c.t0-m.dur-.9)/1.2);y=-sink*.8}
  if(m.id==='sbuca'&&pc<.5&&Math.random()<dt*14)spray(1);
  // the pick bites the ground: sparks and chips of stone where the point went in (once each blow)
  if(MD.sparks&&m.id===MD.sparks.id&&!HOLD&&pc>=MD.sparks.p&&!c.sparked){c.sparked=1;const q=L0.tip(M,Pm);spark(q[0]*SC,Math.max(.01,q[1]*SC),q[2]*SC)}
  Mx.set(MM);Mx[13]+=y;
  // the soft shadow under him: where the hips are (lower and wider when he lies down); the crawler's is long, from the chest to the waist
  const hip=Pm.wp[L0.BI[MD.sh[0]]],hp2=Pm.wp[L0.BI[MD.sh[1]||MD.sh[0]]],hx=hip[0]*SC,hz=hip[2]*SC,hy=hip[1]*SC+y,hx2=hp2[0]*SC,hz2=hp2[2]*SC;
  // the lamp of the miner: a warm spot on the ground ahead of where his head looks (it flickers, and goes out with his eyes)
  let lmp=[0,0,0];lampK=0;if(MD.lamp){const L=L0.lamp(M,Pm),ly=L.p[1]*SC+y,dh=Math.hypot(L.d[0],L.d[2])||1;
    lmp=[L.p[0]*SC+L.d[0]/dh*14*SC,L.p[2]*SC+L.d[2]/dh*14*SC,ly>.05?(.5+.07*Math.sin(tt*9)+.04*Math.sin(tt*23))*Math.max(0,Math.min(1,1-Math.max(0,L.d[1])*2))*Math.max(0,Math.min(1.3,Pm.emK))*(1-sink):0]}
  lampK=lmp[2];
  const W=cv.width,Hh=cv.height;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,Hh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  fx.setTransform(1,0,0,1,0,0);fx.clearRect(0,0,fr.width,fr.height);
  let views=[{yw:yaw,x:0,y:0,w:W,h:Hh,d:dist}];
  // the photo of today starts under the top bar (its height changes with the buttons of the monsters and the width of the screen)
  if(cmp){const t=Math.round($('.top').getBoundingClientRect().bottom+22)+'px';if($('#oggi').style.top!==t)$('#oggi').style.top=t}
  if(four){const r=$('#oggi').getBoundingClientRect(),SW=Math.min(W,640*DPR),x0=cmp&&r.width?Math.round(r.left*DPR):Math.round((W-SW)/2),ww=(cmp&&r.width?r.width*DPR:SW)/4,hh=Math.round(ww*MD.fk),
      yy=cmp?Math.round((r.bottom+26)*DPR):Math.round(Math.max(96*DPR,(Hh*.74-hh)/2));
    views=[0,-.62,-Math.PI/2,Math.PI].map((a,i)=>({yw:a,x:Math.round(x0+i*ww),y:yy,w:Math.round(ww),h:hh,d:MD.fd,lab:['davanti','tre quarti','lato','dietro'][i]}));
    fx.fillStyle='#f1e4c6';fx.font=`400 ${15*DPR}px "Lilita One",system-ui`;fx.textAlign='left';fx.shadowColor='#1b1612';fx.shadowOffsetY=2*DPR;
    if(cmp){fx.fillText('Oggi nel gioco',x0+10*DPR,(r.top-6)*DPR);fx.fillText('In 3D vero',x0+10*DPR,yy-6*DPR)}fx.shadowOffsetY=0}
  const L=LOOK[look],out=ink?(low?1.6:2.6)*DPR*(four?.6:1):0,emK=(1.25+.55*Math.sin(tt*2.1))*Pm.emK,under=(m.id==='sbuca'&&pc<.95)||m.id==='muore'?-.002:undefined;
  for(const v of views){const cam=camAt(v.yw,four?MD.fp:pitch,v.d,v.x,v.y,v.w,v.h);gl.viewport(v.x,Hh-v.y-v.h,v.w,v.h);
    gl.useProgram(PG.p);gl.uniformMatrix4fv(PG.u.uVP,false,cam.VP);gl.uniform3fv(PG.u.uCam,cam.eye);gl.uniform3fv(PG.u.uFog,FOG);gl.uniform3fv(PG.u.uL,LIGHT);
    gl.uniform2f(PG.u.uSh,hx+(-LIGHT[0])*.05,hz+(-LIGHT[2])*.05);gl.uniform2f(PG.u.uSh2,hx2+(-LIGHT[0])*.05,hz2+(-LIGHT[2])*.05);gl.uniform1f(PG.u.uShK,Math.max(0,1-Math.max(0,hy-.6)*1.2)*(1-sink));gl.uniform1f(PG.u.uShR,MD.sh.length>1?.3+Math.max(0,.3-hy)*.4:.36+Math.max(0,.55-hy)*.9);
    gl.uniform2f(PG.u.uHo,MD.hole[0],MD.hole[1]);gl.uniform1f(PG.u.uHoR,MD.hoR);gl.uniform2f(PG.u.uLm,lmp[0],lmp[1]);gl.uniform1f(PG.u.uLmK,lmp[2]);gl.uniform1f(PG.u.uLmR,10*SC);gl.uniform1f(PG.u.uHole,m.id==='sbuca'?1-ZB3.sm((pc-.85)/.15):m.id==='muore'?sink:0);
    gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindVertexArray(vGround);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.bindVertexArray(null);gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    MB3.draw(gl,R,M,JM,cam,{M:Mx,L:LIGHT,Lc:L.Lc,amb:L.amb,rim:L.rim,toon:L.toon,out,emK,flash,fog:[4,10],fogC:FOG,clipY:under,bump:low?0:1});
    if(!low&&!four)glow(cam,emK,v,under);
    if(four&&!cmp){fx.fillStyle='rgba(241,228,198,.8)';fx.font=`700 ${12*DPR}px "Baloo 2",system-ui`;fx.textAlign='center';fx.fillText(v.lab,v.x+v.w/2,v.y+v.h+14*DPR)}}
  // flying soil
  if(dirt.length){const cam=camAt(views[0].yw,four?.12:pitch,views[0].d,0,0,W,Hh);fx.fillStyle='#3a2a1c';for(const d of dirt){d.vy-=9.8*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;if(d.y<0){d.y=0;d.vx*=.4;d.vz*=.4;d.vy=0;d.l-=dt*1.5}
      const V=cam.VP,X=V[0]*d.x+V[4]*d.y+V[8]*d.z+V[12],Y=V[1]*d.x+V[5]*d.y+V[9]*d.z+V[13],Wc=V[3]*d.x+V[7]*d.y+V[11]*d.z+V[15];if(Wc<.1||four)continue;
      fx.globalAlpha=Math.max(0,Math.min(1,d.l));fx.beginPath();fx.arc((X/Wc*.5+.5)*W,(.5-Y/Wc*.5)*Hh,d.r*Hh/Wc*1.4,0,7);fx.fill()}fx.globalAlpha=1;dirt=dirt.filter(d=>d.l>0)}
  // the sparks of the pick: short bright streaks that fall and go out
  if(sparks.length){const cam=camAt(views[0].yw,four?.12:pitch,views[0].d,0,0,W,Hh),V=cam.VP,pr=(x,y,z)=>{const Wc=V[3]*x+V[7]*y+V[11]*z+V[15];return Wc<.1?null:[((V[0]*x+V[4]*y+V[8]*z+V[12])/Wc*.5+.5)*W,(.5-(V[1]*x+V[5]*y+V[9]*z+V[13])/Wc*.5)*Hh]};
    fx.lineCap='round';fx.lineWidth=2*DPR;for(const k of sparks){k.vy-=9.8*dt;k.x+=k.vx*dt;k.y+=k.vy*dt;k.z+=k.vz*dt;if(k.y<0){k.y=0;k.vy*=-.3;k.vx*=.5;k.vz*=.5}k.l-=dt*2.3;if(four)continue;
      const a=pr(k.x,k.y,k.z),b=pr(k.x-k.vx*.035,k.y-k.vy*.035,k.z-k.vz*.035);if(!a||!b)continue;fx.globalAlpha=Math.max(0,Math.min(1,k.l));fx.strokeStyle=k.l>.55?'#fff2b0':'#ffb048';
      fx.beginPath();fx.moveTo(b[0],b[1]);fx.lineTo(a[0],a[1]);fx.stroke()}fx.globalAlpha=1;sparks=sparks.filter(k=>k.l>0)}
  const e=performance.now()-t0;ms=ms?ms*.92+e*.08:e;nf++;if(tt-tf>1){fps=nf/(tt-tf);nf=0;tf=tt;$('#ms').textContent=`${ms.toFixed(1)} ms · ${fps|0} al secondo · ${M.tri} triangoli`}}
// the glow of the eyes: only the light of the eyes, small, blurred, added on top
function glow(cam,emK,v,under){const w=Math.max(8,v.w>>2),h=Math.max(8,v.h>>2);if(!fbo.length||fbo[0].w!==w||fbo[0].h!==h)fbo=[target(w,h,1),target(w,h),target(w,h)];
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[0].f);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  MB3.draw(gl,R,M,JM,{...cam,px:[2/w,2/h]},{M:Mx,L:LIGHT,Lc:[1,1,1],amb:[1,1,1],rim:[0,0,0],out:0,emK,emOnly:1,clipY:under});gl.disable(gl.DEPTH_TEST);
  gl.useProgram(PB.p);gl.bindVertexArray(vQuad);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(PB.u.uT,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[1].f);gl.bindTexture(gl.TEXTURE_2D,fbo[0].t);gl.uniform2f(PB.u.uD,1.6/w,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[2].f);gl.bindTexture(gl.TEXTURE_2D,fbo[1].t);gl.uniform2f(PB.u.uD,0,1.6/h);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(v.x,cv.height-v.y-v.h,v.w,v.h);gl.useProgram(PA.p);gl.bindTexture(gl.TEXTURE_2D,fbo[2].t);gl.uniform1i(PA.u.uT,0);gl.uniform1f(PA.u.uK,1.15);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.disable(gl.BLEND);gl.bindVertexArray(null)}
// ---------- the buttons ----------
function ui(){const mz=$('#mz');mz.innerHTML='';for(const k of Object.keys(MODELS)){const b=document.createElement('button');b.textContent=MODELS[k].nome;b.className=k===MID?'on':'';
    b.onclick=()=>{if(k!==MID){history.replaceState(null,'',k==='zombie'?location.pathname+location.search:'#'+k);useModel(k)}};mz.appendChild(b)}
  $('.sub').textContent=MD.sub+' · trascina per girare';const bar=$('#mv');bar.innerHTML='';for(const m of MOVES){const b=document.createElement('button');b.textContent=m.n;b.className=!all&&cur&&cur.m.id===m.id?'on':'';b.onclick=()=>{play(m.id)};bar.appendChild(b)}
  const a=document.createElement('button');a.textContent='Tutte';a.className=all?'on':'';a.onclick=()=>{all=true;seqI=0;play(SEQ[0],true);ui()};bar.appendChild(a);
  const op=$('#op');op.innerHTML='';const tg=(txt,on,f)=>{const b=document.createElement('button');b.textContent=txt;b.className=on?'on':'';b.onclick=()=>{f();ui()};op.appendChild(b)};
  tg('Quattro direzioni',four&&!cmp,()=>{four=!(four&&!cmp);cmp=false});tg('Prima e dopo',cmp,()=>{cmp=!cmp;four=cmp});tg(look==='gioco'?'Luce: a tre toni':'Luce: morbida',false,()=>look=look==='gioco'?'morbida':'gioco');
  tg('Contorno',ink,()=>ink=!ink);tg('Effetti ridotti',low,()=>{low=!low;W0=0});tg('Gira da solo',auto,()=>auto=!auto);
  $('#oggi').hidden=!cmp;$('#tit').textContent=cmp?'Prima e dopo':'Zombie in 3D'}
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
(async()=>{try{stage();await useModel(MID);$('#load').hidden=true;
    window.__Z3D={get M(){return M},get R(){return R},get MOVES(){return MOVES},play,get buildMs(){return buildMs},get cur(){return cur},get ready(){return !!(R&&cur)},
      get model(){return MID},set model(v){useModel(v)},models:Object.keys(MODELS),get sparks(){return sparks.length},get lamp(){return lampK},set view(v){yaw=v},get view(){return yaw},set pitch(v){pitch=v},set auto(v){auto=v},get ms(){return ms},
      set four(v){four=v;ui()},set cmp(v){cmp=v;four=v;ui()},set low(v){low=v;W0=0;ui()},set dist(v){dist=v},set hold(v){HOLD=v}};requestAnimationFrame(frame)}
  catch(e){$('#msg').hidden=false;$('#msg').textContent='Errore: '+e.message;console.error(e)}})();
})();
