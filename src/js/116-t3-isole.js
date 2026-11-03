// =====================================================================
// 116. MOSSBOUND TRIPLA A · IL CAMMINO DELLE ISOLE IN 3D VERO (anteprima a parte, con 110–115).
// Denis (2 novembre): «migliora il ponte ed il menu ora», alle domande: «3D vero come la stanza», del ponte «sembra piatto», «poco
// spettacolare», «troppo piccolo o lontano», nell'anteprima tripla A. La schermata principale della Classica disegnata con WebGL come la
// stanza: le isole sospese nell'abisso, ognuna col suo mondo (prato e querce, cenere e vulcano, palude e canne, neve e cristalli), la rupe
// a strati e il sasso che pende sotto; il ponte sospeso di assi in volumi veri (le due torri di tronchi col tetto e lo stendardo, le 64 assi
// con la pancia, le travi e la crociera sotto, i pali, le funi del parapetto, i due cavi grandi coi tiranti e le bandierine, i balconi a
// sinistra coi premi e le lanterne); la mini isola del traguardo con l'altare, il tesoro e il palo dello stendardo; le cinque pietre
// sospese; l'isola dopo nella nebbia. La telecamera è più vicina e più bassa e guarda lungo il ponte: le assi vicine grandi, il ponte che
// corre lontano nella nebbia. L'eroe in 3D col bastoncino di muschio, il custode che dorme, le luci delle lanterne e dei bracieri, le due
// luci della stanza («Chiara» e «Da film»). La logica resta quella di 94 (ISL: dove guardi, l'eroe, le assi, i premi, lo spettacolo, i
// tocchi): qui cambia soltanto il disegno. Le scritte restano quelle di 94, sopra.
// =====================================================================
const T3I={on:true,bad:false,host:null,live:false,seen:0,M:new Map(),tx:{},ms:0,Lt:[],lab:[],zz:[],sh:[],gw:[],dust:[],nV:0};
// a point of the path (n north of island lo's middle, e east, z up) in the 3D world: x east, y south (as in the room), z up
const t3IW=(lo,n,e,z)=>[e,-(lo*CNI_GAP+n),z||0];
// island i's own coordinates (94's, turned a little for the camera) into the world; dn: the little island after it, CNI_MN further north
const t3IslM=(i,dn,dz)=>v3M4([CNI_C,CNI_S,0],[-CNI_S,CNI_C,0],[0,0,1],[0,-(i*CNI_GAP+(dn||0)),dz||0]);
// the path's own coordinates of island i (x east, y = -north, z up) into the world
const t3PathM=i=>v3M4([1,0,0],[0,1,0],[0,0,1],[0,-i*CNI_GAP,0]);
const t3IPP=(n,e,z)=>[e,-n,z||0];
const t3IMP=(M,p)=>[M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12],M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]+M[14]];
const t3IMD=(M,n)=>[M[0]*n[0]+M[4]*n[1]+M[8]*n[2],M[1]*n[0]+M[5]*n[1]+M[9]*n[2],M[2]*n[0]+M[6]*n[1]+M[10]*n[2]];
const t3ITr=(x,y,z)=>v3M4([1,0,0],[0,1,0],[0,0,1],[x,y,z]);
// (while the menu sweeps from one mode to the other both scenes are on the screen at once: the drawing of always, for that second)
function t3IslOk(){return T3I.on&&!T3I.bad&&T3.on&&!T3.bad&&!T3.lost&&!(typeof MM!=='undefined'&&MM.tr)&&t3Init()&&!!T3.post}
// the canvas of the 3D goes where it is needed: under the menu's picture (campCv) or under the game's (cv)
function t3Place(host){const c=T3.cv;if(!c||T3I.host===host)return;T3I.host=host;
  if(host==='menu'){campCv.parentNode.insertBefore(c,campCv);c.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block'}
  else{cv.parentNode.insertBefore(c,cv);c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none';T3I.live=false}
  T3.rk=null;T3.fboOk=false}
{const _r=t3Render;t3Render=function(){t3Place('game');return _r.apply(this,arguments)}}
{const _h=t3Hide;t3Hide=function(){if(T3I.host==='menu'&&T3I.live)return;return _h.apply(this,arguments)}}
// when the home is not on the screen any more (another page of the menu, the game), its picture goes; with a sheet open over it the menu does
// not draw the home, its last picture stays behind the sheet (as the drawing of always does)
(function t3IWatch(){try{if(T3I.host==='menu'&&T3.cv&&T3.cv.style.display!=='none'&&(campCv.offsetParent===null||$('menu').hidden||$('tabPlay').hidden)){T3.cv.style.display='none';T3I.live=false}}catch(e){}requestAnimationFrame(t3IWatch)})();
// the size of the picture: the menu's canvas pixel for pixel (the words of 94 over it fall where the 3D puts things)
function t3IslSize(){const cw=campCv.width,ch=campCv.height,sc=T3.low?.75:1,w=Math.max(2,Math.round(cw*sc)),h=Math.max(2,Math.round(ch*sc));
  T3.W=campCv.clientWidth||cw;T3.H=campCv.clientHeight||ch;T3.pxK=cw/(T3.W||cw);
  if(T3.cv.width!==w||T3.cv.height!==h){T3.cv.width=w;T3.cv.height=h;T3.fboOk=false}T3.cw=w;T3.ch=h;
  if(T3.post&&!T3.fboOk)t3SizeFbo(w,h)}
// (the post-process buffers for a size: the same as t3Size's)
function t3SizeFbo(w,h){const gl=T3.gl;if(T3.fbo){gl.deleteFramebuffer(T3.fbo);gl.deleteTexture(T3.fc);gl.deleteTexture(T3.fd)}
  T3.fc=t3Tex(null,false,w,h);T3.fd=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,T3.fd);
  if(T3.gl2)gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,w,h,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);else gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,w,h,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
  for(const[k,v] of[[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  T3.fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,T3.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,T3.fc,0);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,T3.fd,0);
  T3.post=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  if(T3.bl)for(const r of T3.bl){gl.deleteFramebuffer(r.fb);gl.deleteTexture(r.tex)}const qw=Math.max(8,w>>2),qh=Math.max(8,h>>2);
  T3.bl=[t3RT(qw,qh),t3RT(qw,qh),t3RT(Math.max(4,qw>>1),Math.max(4,qh>>1)),t3RT(Math.max(4,qw>>1),Math.max(4,qh>>1))];T3.fboOk=true}
// ------------------------------------------------------------------ the camera: behind the island you look at, low and close, looking north
// along its bridge (the near planks big, the bridge running away into the mist); as close as the phone's width lets the island fit (wd: how
// much of it across the screen); the island's middle falls where 94 puts it on the screen (L.cy: the words fit round it)
const T3IC={pitch:14*Math.PI/180,fovy:52*Math.PI/180,ahead:80,wd:240,lift:0};
function t3IslCam(L,t){const v=ISL.view,cw=campCv.width,ch=campCv.height,asp=cw/ch,P=T3IC,ps=Math.sin(P.pitch),pc=Math.cos(P.pitch),th=Math.tan(P.fovy/2);
  // (the distance that shows wd units across at the island's middle)
  const dI=P.wd/(2*th*asp),dist=dI+P.ahead*pc;
  const tn=v*CNI_GAP+P.ahead,tg=[0,-tn,P.lift],eye=[0,-tn+dist*pc,P.lift+dist*ps];T3.eye=eye;T3.tg=tg;T3.dist=dist;T3.near=24;T3.far=7000;
  const view=v3Look(eye,tg,[0,0,1]),pr=v3Persp(P.fovy,asp,T3.near,T3.far);
  // the island where 94 has it: the picture moved down (a shift of the lens, the perspective stays the same)
  const isl=[0,-(v*CNI_GAP),0],q=v3Mul(pr,view),cy=q[1]*isl[0]+q[5]*isl[1]+q[9]*isl[2]+q[13],cwv=q[3]*isl[0]+q[7]*isl[1]+q[11]*isl[2]+q[15],ndc=cy/cwv,want=1-2*L.cy/ch,dy=want-ndc;
  const sh=new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,dy,0,1]);T3.vp=v3Mul(sh,q);
  const f=[tg[0]-eye[0],tg[1]-eye[1],tg[2]-eye[2]],fl=Math.hypot(...f);T3.F3=[f[0]/fl,f[1]/fl,f[2]/fl];T3.R3=[1,0,0];
  const R=T3.R3,F=T3.F3;T3.U3=[R[1]*F[2]-R[2]*F[1],R[2]*F[0]-R[0]*F[2],R[0]*F[1]-R[1]*F[0]];if(T3.U3[2]<0)T3.U3=T3.U3.map(x=>-x);
  T3.kpx=cw/(2*dist*th*asp)}
// a point of the world on the menu's canvas (its pixels), its depth; null behind the camera; how many pixels a unit is at that depth
function t3IProj(p){const m=T3.vp,x=p[0],y=p[1],z=p[2],cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13],cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<1)return null;
  return[(cx/cw+1)*.5*campCv.width,(1-cy/cw)*.5*campCv.height,cw]}
const t3IKpx=w=>T3.kpx*T3.dist/Math.max(1,w);
// ------------------------------------------------------------------ small tools: colours (0–255; alpha under 255 glows by itself)
const t3Ic=(h,a)=>{const q=v3rgb(h);return[q[0],q[1],q[2],a==null?255:a]};
const t3Ik=(c,k)=>[Math.min(255,c[0]*k),Math.min(255,c[1]*k),Math.min(255,c[2]*k),c[3]==null?255:c[3]];
const t3Im=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[3]==null?255:a[3]];
const t3IH=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
const t3I01=c=>[c[0]/255,c[1]/255,c[2]/255];
// ------------------------------------------------------------------ the pictures painted once (light, so the colour of the world tints them)
function t3ICv(S){const c=document.createElement('canvas');c.width=c.height=S;return c}
function t3IRnd(s){let sd=(Math.abs(s|0)%2147483646)+1;return()=>(sd=(sd*16807)%2147483647)/2147483647}
const t3IWrap=(S,f,x,y,r)=>{const X=[0],Y=[0];if(x==null||x<r)X.push(S);if(x==null||x>S-r)X.push(-S);if(y==null||y<r)Y.push(S);if(y==null||y>S-r)Y.push(-S);for(const ox of X)for(const oy of Y)f(ox,oy)};
function t3IBlot(g,S,x,y,r,rgb,a){t3IWrap(S,(ox,oy)=>{const gr=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,r);gr.addColorStop(0,`rgba(${rgb},${a})`);gr.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=gr;g.fillRect(x+ox-r,y+oy-r,2*r,2*r)},x,y,r)}
// the top of an island: grass and moss (1), ash and cracks (2), wet moss of the swamp (3), snow with its blue shadows and glints (4)
function t3ITopCv(ch){const S=512,c=t3ICv(S),g=c.getContext('2d'),r=t3IRnd(ch*977+13);g.fillStyle=ch===4?'rgb(246,248,252)':'rgb(226,226,222)';g.fillRect(0,0,S,S);
  const blots=(n,r0,r1,list)=>{for(let k=0;k<n;k++){const[rgb,a]=list[k%list.length];t3IBlot(g,S,r()*S,r()*S,r0+r()*(r1-r0),rgb,a)}};
  const strokes=(n,l0,list,w,ang,spr)=>{g.lineCap='round';for(let k=0;k<n;k++){const x=r()*S,y=r()*S,a=ang+(r()-.5)*spr,l=l0*(.5+r()),bx=(r()-.5)*2,[rgb,al]=list[k%list.length];g.strokeStyle=`rgba(${rgb},${al})`;g.lineWidth=w*(.6+r()*.8);
    t3IWrap(S,(ox,oy)=>{g.beginPath();g.moveTo(x+ox,y+oy);g.quadraticCurveTo(x+ox+Math.cos(a)*l*.5+bx,y+oy+Math.sin(a)*l*.5,x+ox+Math.cos(a)*l,y+oy+Math.sin(a)*l);g.stroke()},x,y,l+4)}};
  const dots=(n,rad,list)=>{for(let k=0;k<n;k++){const x=r()*S,y=r()*S,rr=rad*(.5+r()),[rgb,a]=list[k%list.length];g.fillStyle=`rgba(${rgb},${a})`;t3IWrap(S,(ox,oy)=>{g.beginPath();g.arc(x+ox,y+oy,rr,0,TAU);g.fill()},x,y,rr+1)}};
  const cracks=(n,list)=>{g.lineJoin='round';g.lineCap='round';for(let k=0;k<n;k++){let x=r()*S,y=r()*S,a=r()*TAU;const pts=[[x,y]];for(let q=0;q<7;q++){a+=(r()-.5)*1.3;x+=Math.cos(a)*(8+r()*14);y+=Math.sin(a)*(8+r()*14);pts.push([x,y])}
    const[rgb,al]=list[k%list.length];g.strokeStyle=`rgba(${rgb},${al})`;g.lineWidth=.8+r()*1.6;t3IWrap(S,(ox,oy)=>{g.beginPath();pts.forEach((p,q)=>q?g.lineTo(p[0]+ox,p[1]+oy):g.moveTo(p[0]+ox,p[1]+oy));g.stroke()},pts[0][0],pts[0][1],160)}};
  if(ch===1){blots(34,26,80,[['255,255,236',.5],['160,176,140',.42],['200,214,180',.4]]);strokes(1700,7,[['120,140,96',.5],['255,255,240',.55],['150,170,120',.45]],1.5,-Math.PI/2,1.4);dots(140,1.4,[['255,255,250',.4],['90,110,70',.35]])}
  else if(ch===2){blots(26,30,90,[['255,240,230',.32],['120,100,96',.4]]);cracks(70,[['60,44,40',.65],['90,70,64',.5]]);dots(500,1.2,[['250,240,235',.4],['70,56,52',.45]]);dots(30,2.6,[['40,30,28',.4]])}
  else if(ch===3){blots(30,30,90,[['120,140,110',.5],['250,255,230',.4],['170,190,150',.4]]);strokes(1200,6,[['110,130,90',.5],['240,250,220',.45]],1.4,-Math.PI/2,1.4);dots(160,1.6,[['90,110,80',.4],['255,255,240',.3]])}
  else{blots(30,30,100,[['200,214,236',.5],['255,255,255',.6],['214,226,244',.45]]);strokes(260,16,[['255,255,255',.5],['210,222,240',.4]],1.2,0,.3);dots(220,1,[['255,255,255',.9]])}
  return c}
// the rock of the cliffs: layers across, a light edge on each, cracks going down, stains
function t3IRockCv(){const S=256,c=t3ICv(S),g=c.getContext('2d'),r=t3IRnd(4211);const H=[];let s=0;while(s<S){const h=8+r()*22;H.push(h);s+=h}const k=S/s;let y=0;
  for(const h0 of H){const h=h0*k,v=168+r()*72|0;g.fillStyle=`rgb(${v},${v-3},${v-8})`;g.fillRect(0,y,S,h+1);g.fillStyle='rgba(255,255,250,.24)';g.fillRect(0,y,S,1.6);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,y+h-1.8,S,1.8);y+=h}
  for(let q=0;q<46;q++){const x=r()*S,y0=r()*S,l=10+r()*40,pts=[];let xx=x,yy=y0;for(let j=0;j<5;j++){pts.push([xx,yy]);xx+=(r()-.5)*7;yy+=l/5}g.strokeStyle=`rgba(40,34,30,${.25+r()*.3})`;g.lineWidth=.8+r()*1.2;
    t3IWrap(S,(ox,oy)=>{g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p[0]+ox,p[1]+oy):g.moveTo(p[0]+ox,p[1]+oy));g.stroke()})}
  for(let q=0;q<28;q++)t3IBlot(g,S,r()*S,r()*S,12+r()*30,q%2?'60,52,46':'255,250,240',.18+r()*.14);
  return c}
// wood (the grain along the plank) and bark (grooves along the log)
function t3IWoodCv(){const S=256,c=t3ICv(S),g=c.getContext('2d'),r=t3IRnd(77);g.fillStyle='rgb(224,216,206)';g.fillRect(0,0,S,S);
  for(let q=0;q<120;q++){const y=r()*S,a=.6+r()*1.8,w=.6+r()*1.4,v=r()<.55?'120,96,74':'255,248,236',al=.12+r()*.24,ph=r()*TAU,f=1+(r()*3|0);g.strokeStyle=`rgba(${v},${al})`;g.lineWidth=w;
    for(const oy of[-S,0,S]){g.beginPath();for(let x=0;x<=S;x+=8){const yy=y+oy+Math.sin(x/S*TAU*f+ph)*a;x?g.lineTo(x,yy):g.moveTo(x,yy)}g.stroke()}}
  for(let q=0;q<5;q++){const x=r()*S,y=r()*S;t3IWrap(S,(ox,oy)=>{g.fillStyle='rgba(110,84,62,.35)';g.beginPath();g.ellipse(x+ox,y+oy,7,3,0,0,TAU);g.fill();g.strokeStyle='rgba(110,84,62,.3)';g.lineWidth=1;g.beginPath();g.ellipse(x+ox,y+oy,11,5,0,0,TAU);g.stroke()})}
  return c}
function t3IBarkCv(){const S=128,c=t3ICv(S),g=c.getContext('2d'),r=t3IRnd(91);g.fillStyle='rgb(216,208,198)';g.fillRect(0,0,S,S);
  for(let q=0;q<46;q++){const x=r()*S,w=1+r()*2.6,v=r()<.6?'90,72,58':'255,250,240',al=.2+r()*.3,ph=r()*TAU;g.strokeStyle=`rgba(${v},${al})`;g.lineWidth=w;
    for(const ox of[-S,0,S]){g.beginPath();for(let y=0;y<=S;y+=6){const xx=x+ox+Math.sin(y/S*TAU*2+ph)*2.2;y?g.lineTo(xx,y):g.moveTo(xx,y)}g.stroke()}}
  return c}
// a soft cloud (some round puffs together)
function t3ICloudCv(){const S=128,c=t3ICv(S),g=c.getContext('2d');for(const[x,y,r,a] of[[64,70,40,.9],[40,74,28,.8],[88,76,30,.8],[54,56,26,.7],[78,58,24,.7],[64,84,34,.6]]){const gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(.6,`rgba(255,255,255,${a*.5})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}return c}
function t3ITx(){const X=T3I.tx;if(X.ok)return X;const T=[];X.top=new Proxy(T,{get:(o,k)=>{const ch=+k;if(ch>=1&&ch<=4){if(!o[ch])o[ch]=t3Tex(t3ITopCv(ch),true,0,0,true);return o[ch]}return o[k]}});X.rock=t3Tex(t3IRockCv(),true,0,0,true);
  X.wood=t3Tex(t3IWoodCv(),true,0,0,true);X.bark=t3Tex(t3IBarkCv(),true,0,0,true);X.cloud=t3Tex(t3ICloudCv(),true);X.ok=true;return X}
// ------------------------------------------------------------------ the ground of an island: the top (a gentle dome, little bumps toward the
// edge), the lip of grass (or ash, or snow) that bulges over the edge, the cliff with its layers, and the rock that hangs under it to a point
// far below; in the world's own places (baked: the light and the mist need them), the colours of its world
const t3IRim=(R,sd,a)=>R*(1+.07*Math.sin(a*3+sd)+.045*Math.sin(a*7+sd*2.1)+.025*Math.sin(a*13+sd*.7));
const t3IGzF=(f,a,sd)=>1.2*(1-f*f)+(f>.55&&f<.97?.7*Math.sin(a*5+sd+f*6)*Math.sin((f-.55)/.42*Math.PI):0);
function t3IGz(R,SY,sd,p){const a=Math.atan2(p[1]/SY,p[0]),f=Math.hypot(p[0],p[1]/SY)/t3IRim(R,sd,a);return f>=1?0:t3IGzF(f,a,sd)}
// a grid of rows of points into triangles: smooth normals from the neighbours (hint: which way is out), its picture and colours, into the world
function t3IGridGeo(b,rows,M,uvF,colF,hintF){const{sub,cross,dot,mul}=RG,NJ=rows.length,NI=rows[0].length,N=[];
  for(let j=0;j<NJ;j++){const r=[];for(let i=0;i<NI;i++){const pi0=rows[j][i?i-1:NI-2],pi1=rows[j][i<NI-1?i+1:1],pj0=rows[Math.max(0,j-1)][i],pj1=rows[Math.min(NJ-1,j+1)][i];
      let n=cross(sub(pi1,pi0),sub(pj1,pj0));const l=Math.hypot(n[0],n[1],n[2]),h=hintF(j,i);n=l>1e-6?mul(n,1/l):h;if(dot(n,h)<0)n=mul(n,-1);r.push(n)}N.push(r)}
  const V=(j,i)=>[t3IMP(M,rows[j][i]),uvF(j,i),RG.nrm(t3IMD(M,N[j][i])),colF(j,i)];
  for(let j=0;j<NJ-1;j++)for(let i=0;i<NI-1;i++){const a=V(j,i),c=V(j,i+1),d=V(j+1,i+1),e=V(j+1,i);for(const q of[a,c,d,a,d,e])t3GV(b,q[0],q[1],q[2],q[3])}}
function t3IGround(M,R,SY,DEP,HU,sd,cTop,cEdge,cSide,dark){const NA=88,TF=[0,.14,.28,.42,.56,.68,.78,.86,.92,.96,.985,1],nT=TF.length,NC=6,NU=8,
    P=(a,f,z,dx,dy)=>{const r=t3IRim(R,sd,a)*f;return[Math.cos(a)*r+(dx||0),Math.sin(a)*r*SY+(dy||0),z]},row=fn=>{const o=[];for(let i=0;i<=NA;i++)o.push(fn(i/NA*TAU));return o},
    dk=dark?c=>[c[0]*.13+3,c[1]*.14+4,c[2]*.17+8,255]:c=>c;
  const T=TF.map(f=>row(a=>P(a,f,t3IGzF(f,a,sd))));T.push(row(a=>P(a,1.012,-1.3)),row(a=>P(a,1.02,-3.6)));
  const C=[T[T.length-1]];
  for(let j=1;j<=NC;j++){const u=j/NC;C.push(row(a=>P(a,1.02-.03*u+.016*Math.sin(a*17+j*1.7+sd)+.011*Math.sin(a*29-j+sd*2),-3.6-(DEP-3.6)*u+Math.sin(a*6+sd+j)*.7)))}
  for(let j=1;j<=NU;j++){const u=j/NU,tx=Math.sin(sd)*12*u*u,ty=Math.cos(sd*1.3)*10*u*u;C.push(row(a=>{if(j===NU)return[tx,ty,-DEP-HU*1.02];
    const lob=1+.16*Math.sin(a*3+sd*1.7)+.08*Math.sin(a*7-u*3+sd),f=.99*Math.pow(1-u,.8)*(1+.1*Math.sin(a*4+sd+u*2.5)+.06*Math.sin(a*11-u*5+sd*.5));
    return P(a,f,-DEP-HU*Math.pow(u,1.05)*lob,tx,ty)}))}
  const Mk=(rows,uvF,colF,hintF)=>{const b=t3GB();t3IGridGeo(b,rows,M,uvF,colF,hintF);return t3GUp(b)};
  const top=Mk(T,(j,i)=>[T[j][i][0]/110,T[j][i][1]/110],(j,i)=>dk(j<nT?t3Ik(cTop,1-.12*Math.max(0,(TF[j]-.86)/.14)):j===nT?cEdge:t3Im(cEdge,cSide,.6)),
    (j,i)=>{const a=i/NA*TAU;return j<nT?[0,0,1]:RG.nrm([Math.cos(a)*.6,Math.sin(a)/SY*.6,.6])});
  const cliff=Mk(C,(j,i)=>[i/NA*7,-C[j][i][2]/40],(j,i)=>dk(j<=NC?t3Ik(cSide,1-.16*j/NC):t3Ik(cSide,.8*(1-.42*(j-NC)/NU))),
    (j,i)=>{const a=i/NA*TAU;return j<=NC?RG.nrm([Math.cos(a),Math.sin(a)/SY,0]):RG.nrm([Math.cos(a),Math.sin(a),-.7])});
  return{top,cliff}}
// ------------------------------------------------------------------ the pieces of the islands (their own units; the front, toward you, is +x)
const t3IQ=(mb,A,B,C,D,n,col,uv)=>{uv=uv||[[0,0],[1,0],[1,1],[0,1]];const a=v3V(mb,A,n,col,uv[0]),b=v3V(mb,B,n,col,uv[1]),c=v3V(mb,C,n,col,uv[2]),d=v3V(mb,D,n,col,uv[3]);v3T(mb,a,b,c);v3T(mb,a,c,d)};
// a box from its middle and three axes (half sizes along them); uv: how many units one picture covers; the top lighter, the sides darker
function t3IBox(mb,C,U,V,W,hu,hv,hw,col,o){o=o||{};const{add,mul}=RG,P=(a,b,c)=>add(C,add(mul(U,a*hu),add(mul(V,b*hv),mul(W,c*hw)))),s=o.uv||32,top=o.top||col,cs=t3Ik(col,o.sk==null?.86:o.sk),ce=t3Ik(col,(o.sk==null?.86:o.sk)*.92),bot=t3Ik(col,.7);
  const F=[[W,[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],top,[hu,hv]],[mul(W,-1),[[-1,1,-1],[1,1,-1],[1,-1,-1],[-1,-1,-1]],bot,[hu,hv]],
    [V,[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]],cs,[hw,hu]],[mul(V,-1),[[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,-1,-1]],cs,[hw,hu]],
    [U,[[1,1,-1],[1,1,1],[1,-1,1],[1,-1,-1]],ce,[hw,hv]],[mul(U,-1),[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],ce,[hw,hv]]];
  for(const[n,q,c,[a,b]] of F){if(o.skip&&o.skip(n))continue;t3IQ(mb,...q.map(p=>P(...p)),n,c,[[0,0],[2*a/s,0],[2*a/s,2*b/s],[0,2*b/s]])}}
// a block with six flat faces from its back four corners and its front four (the stones of an arch)
function t3IHexa(mb,A,B,col){const c=[0,0,0];for(const p of A.concat(B)){c[0]+=p[0]/8;c[1]+=p[1]/8;c[2]+=p[2]/8}const F=[[A[0],A[1],A[2],A[3]],[B[0],B[1],B[2],B[3]]];for(let k=0;k<4;k++){const j=(k+1)%4;F.push([A[k],A[j],B[j],B[k]])}
  for(const q of F){t3Facet(mb,q[0],q[1],q[2],col,c);t3Facet(mb,q[0],q[2],q[3],col,c)}}
// a piece made at its own origin put into another mesh: turned round z by a, s times bigger, moved to p
function t3IApp(dst,src,M){const n0=dst.P.length/3,n=src.P.length/3;
  for(let i=0;i<n;i++){const p=t3IMP(M,[src.P[i*3],src.P[i*3+1],src.P[i*3+2]]),q=RG.nrm(t3IMD(M,[src.N[i*3],src.N[i*3+1],src.N[i*3+2]]));dst.P.push(p[0],p[1],p[2]);dst.N.push(q[0],q[1],q[2]);dst.T.push(src.T[i*2],src.T[i*2+1]);
    dst.C.push(src.C[i*4],src.C[i*4+1],src.C[i*4+2],src.C[i*4+3]);if(src.W&&src.W[i]!=null)(dst.W||(dst.W=[]))[n0+i]=src.W[i]}
  for(const k of src.I)dst.I.push(k+n0)}
function t3IPut(dst,fn,p,a,s){const tmp=v3MB();fn(tmp);const S=s||1,c=Math.cos(a||0)*S,sn=Math.sin(a||0)*S;t3IApp(dst,tmp,v3M4([c,sn,0],[-sn,c,0],[0,0,S],[p[0],p[1],p[2]||0]))}
// a flat stone of a path (rx across, ry along, h high, turned by a): its top, its bevel, its sides
function t3ISlab(mb,c,rx,ry,h,a,col,sd){const N=9,ca=Math.cos(a),sa=Math.sin(a),pts=[];for(let k=0;k<N;k++){const t=k/N*TAU,r=1+.12*Math.sin(t*3+sd)+.07*Math.sin(t*5+sd*2);pts.push([Math.cos(t)*rx*r,Math.sin(t)*ry*r])}
  const T=(x,y,z)=>[c[0]+x*ca-y*sa,c[1]+x*sa+y*ca,c[2]+z],top=t3Ik(col,.86),side=t3Ik(col,.66),ctr=T(0,0,h*.3),tc=v3V(mb,T(0,0,h+.2),[0,0,1],top);
  for(let k=0;k<N;k++){const p=pts[k],q=pts[(k+1)%N],p1=T(p[0]*.86,p[1]*.86,h),q1=T(q[0]*.86,q[1]*.86,h),p0=T(p[0],p[1],-.8),q0=T(q[0],q[1],-.8),pm=T(p[0],p[1],h*.6),qm=T(q[0],q[1],h*.6);
    v3T(mb,tc,v3V(mb,p1,[0,0,1],top),v3V(mb,q1,[0,0,1],top));t3Facet(mb,p1,pm,qm,side,ctr);t3Facet(mb,p1,qm,q1,side,ctr);t3Facet(mb,pm,p0,q0,side,ctr);t3Facet(mb,pm,q0,qm,side,ctr)}}
// an oak heavy with moss: the trunk with its roots, three branches, the crown of round clumps (three greens by how they face the light)
function t3IOak(mb,c,sd,lf){const bark=t3Ic('#5e4630'),L=lf.map(h=>t3Ic(h)),mo=t3Ic('#7cb24a');
  t3Lathe(mb,c,[[0,6.4],[2.5,4.6],[10,3.8],[20,3.2],[26,2.8]],10,bark,{wob:(a,z)=>1+.08*Math.sin(a*5+sd+z*.2)});
  for(const[dx,dy,dz] of[[-8,4,30],[7,-5,32],[2,7,36]])v3Tube(mb,[[c[0],c[1],c[2]+20],[c[0]+dx*.5,c[1]+dy*.5,c[2]+dz-6],[c[0]+dx,c[1]+dy,c[2]+dz]],[2.6,1.9,1.2],bark,6);
  [[0,0,40,17],[-10,6,34,13],[10,-6,35,13],[3,10,38,12],[-4,-9,44,12],[0,0,50,11]].forEach(([dx,dy,z,r],k)=>t3Ell(mb,[c[0]+dx,c[1]+dy,c[2]+z],[r*1.08,r,r*.82],n=>n[2]>.45?L[0]:n[2]>-.2?L[1]:L[2],
    {nl:12,nb:8,shp:(d,ph,th)=>1+.07*Math.sin(ph*5+k+sd)*Math.sin(th*3),w:.8}));
  for(let k=0;k<6;k++){const a=k/6*TAU+sd,x=c[0]+Math.cos(a)*13,y=c[1]+Math.sin(a)*12,z=c[2]+30;t3Line(mb,[[x,y,z],[x+Math.cos(a)*1.5,y+Math.sin(a)*1.5,z-5],[x+Math.cos(a)*2,y+Math.sin(a)*2,z-10-k%3*2]],[1.3,1,.6],mo,{w:.4})}}
// a pine (with snow on its tiers, 4)
function t3IPine(mb,c,h,sd,snow){const bark=t3Ic('#5a4030'),gr=[t3Ic('#2f5a46'),t3Ic('#3d7058')],sn=t3Ic('#f4faff');t3Lathe(mb,c,[[0,3],[h*.3,2.2]],8,bark);
  for(let k=0;k<4;k++){const z0=h*(.18+.2*k),R=h*(.36-.07*k),H=h*.34,C=[c[0],c[1],c[2]+z0];t3Lathe(mb,C,[[0,R*.55],[H*.08,R],[H*.22,R*.82],[H,1]],12,gr[k%2],{wob:a=>1+.1*Math.sin(a*6+k+sd)});
    if(snow)t3Lathe(mb,[c[0],c[1],c[2]+z0+H*.18],[[0,R*.86],[H*.12,R*.64],[H*.82,1]],12,sn,{wob:a=>1+.12*Math.sin(a*6+k+sd)})}}
// a dead tree of the volcano, its branch tips still burning
function t3IDeadTree(mb,c,h,sd){const w=t3Ic('#2c2422'),em=t3Ic('#ff6a2a',80);v3Tube(mb,[c,[c[0]+2,c[1]-1,c[2]+h*.45],[c[0]-1,c[1]+2,c[2]+h*.8],[c[0]+1,c[1]+1,c[2]+h]],[3.4,2.6,1.8,.8],w,6);
  for(const[dx,dy,z,l] of[[1,0,.5,.45],[-1,.4,.66,.38],[.3,-1,.8,.3]]){const b=[c[0],c[1],c[2]+h*z],e=[b[0]+dx*h*l,b[1]+dy*h*l,b[2]+h*l*.5];v3Tube(mb,[b,[(b[0]+e[0])/2,(b[1]+e[1])/2,b[2]+h*l*.4],e],[1.6,1.1,.5],w,5);t3Sph(mb,e,1.1,em,{nl:6,nb:4,w:0})}}
// the volcano: a cone of dark rock with its crater, the lava glowing in it and running down its side
function t3IVolcano(mb,c,sd){const rock=t3Ic('#5a3e36'),dk=t3Ic('#3a2824'),lava=t3Ic('#ff7a2a',60),lava2=t3Ic('#ffb040',50);
  t3Lathe(mb,c,[[0,30],[6,25],[14,17],[22,11],[27,9],[28.5,8.4]],20,z=>z>23?dk:rock,{sub:2,wob:(a,z)=>1+.08*Math.sin(a*5+sd)+.05*Math.sin(a*11+z*.3)});
  t3Lathe(mb,[c[0],c[1],c[2]],[[28.5,8.4],[26,6],[24.5,5.2]],16,dk);t3Lathe(mb,[c[0],c[1],c[2]+24.4],[[0,5.3],[.2,5.3]],16,lava,{top:lava2});
  for(const a of[.5+sd,2.1+sd]){const P=[];for(let k=0;k<=8;k++){const u=k/8,z=26-u*24,r=(8.6+u*21)*1.02;P.push([c[0]+Math.cos(a+Math.sin(u*4)*.12)*r,c[1]+Math.sin(a+Math.sin(u*4)*.12)*r,c[2]+z])}t3Line(mb,P,P.map((_,k)=>1.6+k*.18),lava,{N:5,w:0})}}
// swamp: the crooked tree with its moss beards, the reeds, the totem
function t3ISwampTree(mb,sd){const w=t3Ic('#4e3e30'),lf=[t3Ic('#4a6a2e'),t3Ic('#3a5626')],mo=t3Ic('#6a8a4a'),b=IP(104,-56),tp=IP(102,-56,46);
  v3Tube(mb,[b,[b[0],b[1]+1,20],tp],[5.5,4,2.8],w,8);
  for(const[dx,z,l] of[[12,30,17],[-14,36,14],[6,44,11]]){const s=IP(102,-56,z),e=IP(102+dx,-56-l*.3,z+l*.7);v3Tube(mb,[s,e],[2.1,.8],w,6);t3Ell(mb,e,[7,7,5],n=>n[2]>.3?lf[0]:lf[1],{nl:10,nb:6,w:.7});
    for(let k=0;k<3;k++){const q=[e[0]+(k-1)*3,e[1]+(t3IH(k,sd+dx)-.5)*4,e[2]-3];t3Line(mb,[q,[q[0],q[1],q[2]-6],[q[0]+.5,q[1],q[2]-11-k*2]],[.9,.7,.4],mo)}}}
function t3IReeds(mb,c,sd){const g=t3Ic('#6a8a3a'),br=t3Ic('#6a4a2a');for(let k=0;k<7;k++){const a=t3IH(k,sd)*TAU,r=t3IH(k,sd+1)*4,b=[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,c[2]],h=16+t3IH(k,sd+2)*12,lx=(t3IH(k,sd+3)-.5)*5,ly=(t3IH(k,sd+4)-.5)*5;
  t3Cone(mb,b,[b[0]+lx,b[1]+ly,b[2]+h],.8,g,{N:4,w:.3});if(k%2===0)t3Ell(mb,[b[0]+lx*.8,b[1]+ly*.8,b[2]+h*.8],[1.2,1.2,3],br,{nl:6,nb:4,w:.4})}}
function t3ITotem(mb,c){const w=t3Ic('#7a5a3a'),w2=t3Ic('#8a6a44'),dk=t3Ic('#2a1e16'),bk=t3Ic('#c8402a');for(let k=0;k<3;k++){const z=c[2]+k*12;t3BoxA(mb,[c[0],c[1],z],0,[5,5.5,5.8],k===1?w2:w);
    for(const s of[-1,1])t3Sph(mb,[c[0]+5.2,c[1]+s*2.2,z+8],1.1,dk,{nl:6,nb:4,w:0});t3Cone(mb,[c[0]+5,c[1],z+5],[c[0]+9,c[1],z+4],1.5,bk,{N:4})}
  t3BoxA(mb,[c[0],c[1],c[2]+36],0,[2,12,1.6],w)}
// ice: the snowman, the mounds of snow
function t3ISnowman(mb,c){const w=t3Ic('#f6fbff'),dk=t3Ic('#2a2a30'),or=t3Ic('#ff8a2a'),br=t3Ic('#6a4a30'),sc=t3Ic('#d8402e');
  t3Sph(mb,[c[0],c[1],c[2]+6],7,w,{nl:12,nb:8});t3Sph(mb,[c[0],c[1],c[2]+15.5],5.2,w,{nl:12,nb:8});t3Sph(mb,[c[0],c[1],c[2]+23],3.8,w,{nl:10,nb:7});t3Lathe(mb,[c[0],c[1],c[2]+19.4],[[0,4.4],[1.6,4.2]],12,sc);
  for(const s of[-1,1])t3Sph(mb,[c[0]+3.3,c[1]+s*1.4,c[2]+24],.6,dk,{nl:5,nb:3,w:0});t3Cone(mb,[c[0]+3.4,c[1],c[2]+23],[c[0]+8,c[1],c[2]+22.4],.9,or,{N:6});
  for(const s of[-1,1])v3Tube(mb,[[c[0],c[1]+s*4.6,c[2]+16],[c[0],c[1]+s*9,c[2]+19],[c[0],c[1]+s*11,c[2]+22]],[.6,.5,.3],br,4)}
// little things: a mushroom, a fern, a tuft of grass, a flower
function t3IShroom(mb,c,col,s){s=s||1;const st=t3Ic('#efe6d0'),cap=t3Ic(col),dot=t3Ic('#fff8ee');t3Lathe(mb,c,[[0,1.6*s],[3*s,1.2*s],[5*s,1.3*s]],8,st);t3Ell(mb,[c[0],c[1],c[2]+5*s],[4.2*s,4.2*s,2.8*s],cap,{nl:12,nb:7,low:.25,w:.6});
  for(let k=0;k<4;k++){const a=k/4*TAU+.5;t3Sph(mb,[c[0]+Math.cos(a)*2.6*s,c[1]+Math.sin(a)*2.6*s,c[2]+7*s],.7*s,dot,{nl:6,nb:4,w:0})}}
function t3IFern(mb,c,col,sd){const g=t3Ic(col);for(let k=0;k<6;k++){const a=k/6*TAU+sd;t3Leaf(mb,c,[Math.cos(a),Math.sin(a),.9],[-Math.sin(a),Math.cos(a),0],9,2.8,.3,g,{nl:5,nr:6,bend:.5})}}
function t3ITuft(mb,c,col,sd){const g=t3Ic(col);for(let k=0;k<4;k++){const a=k/4*TAU+sd,l=3+t3IH(k,sd)*2.5;t3Cone(mb,[c[0]+Math.cos(a)*.8,c[1]+Math.sin(a)*.8,c[2]-.3],[c[0]+Math.cos(a)*2.4,c[1]+Math.sin(a)*2.4,c[2]+l],.7,g,{N:3,w:0})}}
function t3IFlower(mb,c,col){t3Line(mb,[c,[c[0],c[1],c[2]+3.2]],.35,t3Ic('#4a7a30'));t3Sph(mb,[c[0],c[1],c[2]+3.6],1.25,t3Ic(col),{nl:6,nb:4,w:.3});t3Sph(mb,[c[0],c[1],c[2]+4.3],.55,t3Ic('#ffe680'),{nl:5,nb:3,w:0})}
// the pool of the world (water, lava, ice) with the stones round it; the stream to the edge and the fall down the cliff
function t3IPool(mb,c,rx,ry,ch,sd){const N=20,rim=t3Ic(CNI_FALL[ch][2]),wat=ch===2?t3Ic('#ff7a2a',60):ch===4?t3Ic('#bfe6ff',225):t3Ic(CNI_FALL[ch][0],200),P=(t,k)=>[c[0]+Math.cos(t)*rx*k,c[1]+Math.sin(t)*ry*k];
  const ctr=v3V(mb,[c[0],c[1],c[2]+.35],[0,0,1],wat),ring=[];for(let k=0;k<N;k++){const q=P(k/N*TAU,1);ring.push(v3V(mb,[q[0],q[1],c[2]+.35],[0,0,1],wat))}for(let k=0;k<N;k++)v3T(mb,ctr,ring[k],ring[(k+1)%N]);
  for(let k=0;k<11;k++){const q=P(k/11*TAU+sd,1.1);t3Rock(mb,[q[0],q[1],c[2]-.6],[2.6+t3IH(k,sd)*1.6,2.3+t3IH(k,sd+1)*1.4,2.3],sd+k,rim,{nl:7,nb:4})}}
function t3IFall(mb,ch,E,S0,gz){const wat=ch===2?t3Ic('#ff8a3a',70):ch===4?t3Ic('#d8f2ff',225):t3Ic(CNI_FALL[ch][1],190),wat2=ch===2?t3Ic('#ffb050',60):ch===4?t3Ic('#cdeaff',230):t3Ic(CNI_FALL[ch][0],205),
    dir=RG.nrm([E[0]-S0[0],E[1]-S0[1],0]),sv=[-dir[1],dir[0],0],A=[],B=[];
  for(let k=0;k<=8;k++){const u=k/8,x=S0[0]+(E[0]-S0[0])*u,y=S0[1]+(E[1]-S0[1])*u,w=2.6+Math.sin(u*9)*.5,z=gz([x,y])+.4;A.push([x+sv[0]*w,y+sv[1]*w,z]);B.push([x-sv[0]*w,y-sv[1]*w,z])}t3Strip(mb,A,B,[0,0,1],wat2,{w:0});
  const F1=[],F2=[];for(let k=0;k<=12;k++){const u=k/12,out=2.5+u*u*16,z=.3-u*(CNI_DEP+80),x=E[0]+dir[0]*out,y=E[1]+dir[1]*out,w=3+u*4.5;F1.push([x+sv[0]*w,y+sv[1]*w,z]);F2.push([x-sv[0]*w,y-sv[1]*w,z])}
  t3Strip(mb,F1,F2,dir,wat,{w:0});t3Strip(mb,F2,F1,RG.mul(dir,-1),wat,{w:0})}
// the gate of the arena: two pillars of stones, an arch of nine, the arena's gem in the key stone, the dark mouth with its light low inside
function t3IGate(mb,stone,ac,sd){const st=t3Ic(stone),dk=t3Ik(st,.76),lt=t3Ik(st,1.12),gem=t3Ic(ac,90),zc=27.2;t3BoxA(mb,[0,0,-.6],0,[7.5,24,1.2],dk);
  for(const s of[-1,1])for(let k=0;k<4;k++)t3BoxA(mb,[(t3IH(k,sd+s)-.5)*1.4,s*17.5+(t3IH(k+3,sd+s)-.5)*1.2,.6+k*6.6],(t3IH(k+7,sd+s)-.5)*.14,[4.6,4.4,3.1],k%2?st:dk);
  for(let k=0;k<9;k++){const a0=k/9*Math.PI+.012,a1=(k+1)/9*Math.PI-.012,Q=(a,r,x)=>[x,Math.cos(a)*r,zc+Math.sin(a)*r];
    t3IHexa(mb,[Q(a0,13,-4.4),Q(a1,13,-4.4),Q(a1,21.5,-4.4),Q(a0,21.5,-4.4)],[Q(a0,13,4.4),Q(a1,13,4.4),Q(a1,21.5,4.4),Q(a0,21.5,4.4)],k===4?lt:k%2?st:dk)}
  t3Sph(mb,[4.9,0,zc+17.2],2.2,gem,{nl:8,nb:6,w:.5});
  const dark=t3Ic('#0a0808'),low=t3Ic(ac,140),ctr=v3V(mb,[-2.5,0,10],[1,0,0],t3Im(dark,low,.3)),R=[[-2.5,13.2,.2]];for(let k=0;k<=16;k++){const a=k/16*Math.PI;R.push([-2.5,Math.cos(a)*13.2,zc+Math.sin(a)*13.2])}R.push([-2.5,-13.2,.2]);
  const iv=R.map(p=>v3V(mb,p,[1,0,0],p[2]<4?low:dark));for(let k=0;k<iv.length;k++)v3T(mb,ctr,iv[k],iv[(k+1)%iv.length])}
// the lock of an island still closed: two chains across the gate's mouth, the padlock
function t3ILockMesh(){if(T3I.lock)return T3I.lock;const mb=v3MB(),gold=t3Ic('#d8a23a'),ch=t3Ic('#8a8f98');
  for(const s of[-1,1]){const P=[];for(let k=0;k<=8;k++){const u=k/8;P.push([3,s*(14-28*u),6+u*26-Math.sin(u*Math.PI)*3])}v3Tube(mb,P,P.map(()=>1),ch,6)}
  t3BoxA(mb,[4,0,13],0,[1.6,4.4,4.2],gold);v3Tube(mb,[[4,-2.6,21],[4,-2.6,24],[4,0,26.5],[4,2.6,24],[4,2.6,21]],[1,1,1,1,1],t3Ic('#c8ccd4'),6);t3Sph(mb,[5.7,0,16.5],.9,t3Ic('#2a2420'),{nl:6,nb:4,w:0});
  return T3I.lock=v3Up(mb)}
// a lantern of stone along the path (its window glows), a brazier of stone (its coals glow once the arena is won)
function t3IStoneLantern(mb,c,stone){const st=t3Ic(stone),dk=t3Ik(st,.74),glow=t3Ic('#ffd27a',100),T=(x,y,z)=>[c[0]+x,c[1]+y,c[2]+z];
  t3BoxA(mb,T(0,0,0),0,[5,5,1.4],dk);t3Lathe(mb,T(0,0,2.8),[[0,2.5],[13,2]],8,st);t3BoxA(mb,T(0,0,15.6),0,[4.6,4.6,.9],dk);t3BoxA(mb,T(0,0,17.4),0,[2.9,2.9,3.2],glow);
  for(const[a,b] of[[1,1],[1,-1],[-1,1],[-1,-1]])t3BoxA(mb,T(a*3.2,b*3.2,17.4),0,[.85,.85,3.2],st);t3Lathe(mb,T(0,0,23.8),[[0,6.6],[1,6.4],[4.6,1]],4,dk,{top:dk})}
function t3IBrazier(mb,c,stone,lit,sd){const st=t3Ic(stone),coal=lit?t3Ic('#ff6a2a',80):t3Ic('#4a4440'),coal2=lit?t3Ic('#c8401a',110):t3Ic('#3a3634');
  t3Lathe(mb,c,[[0,8.5],[3,7.5],[4,5],[12,3.8]],12,st);t3Lathe(mb,[c[0],c[1],c[2]+12],[[0,4.5],[3,8.5],[6,11.5],[7.5,11]],14,t3Ic('#45403e'),{top:lit?t3Ic('#4a1e0a'):t3Ic('#1e1a18'),topz:7.2});
  for(let k=0;k<7;k++){const a=k/7*TAU+sd,r=k%2?3:6;t3Sph(mb,[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,c[2]+19.6],1.8,k%2?coal:coal2,{nl:6,nb:4,w:.3})}}
// roots and grass hanging from the front of the edge (1, 3), icicles (4)
function t3IEdge(mb,R,SY,sd,ch,n){for(let j=0;j<n;j++){const a=-Math.PI*.44+j/(n-1)*Math.PI*.88,r=t3IRim(R,sd,a)*1.012,o=[Math.cos(a),Math.sin(a)*SY],p=[o[0]*r,o[1]*r,-2.4];
  if(ch===4){const l=7+t3IH(j,sd+6)*14;t3Cone(mb,p,[p[0]+o[0]*.6,p[1]+o[1]*.6,p[2]-l],2+t3IH(j,sd+5)*2.2,t3Ic('#d4ecfb',232),{N:5,w:.4})}
  else if(ch===1||ch===3){const l=12+t3IH(j,sd+9)*16;t3Line(mb,[p,[p[0]+o[0]*3,p[1]+o[1]*3,p[2]-l*.55],[p[0]+o[0]*1.5,p[1]+o[1]*1.5+(t3IH(j,sd+8)-.5)*6,p[2]-l]],[1.1,.8,.4],t3Ic(ch===1?'#5a8a3a':'#4a6a2a'),{w:.3})}}}
// ------------------------------------------------------------------ the things standing on an island (its own units): the path, the pool and
// the fall, the gate, the brazier, the lanterns, and the world's own (1: the old oak, the columns, the graves, mushrooms, moss, ferns and
// flowers; 2: the volcano, the basalt, the dead tree, the obsidian; 3: the crooked tree, reeds, the totem, lily pads; 4: pines, crystals,
// the snowman, the mounds)
function t3IIslDeco(i,won){const mb=v3MB(),ch=ARENAS[i].ch||1,Wd=cnIslW(i),g=cnIslG(i),ac=ARENAS[i].col,mix=(c,q)=>g?cnMixC(c,ac,q*g):c,sd=i*1.7+.4,
    stone=mix(Wd.stone,.12),SP=cnIslPal(ch),TH=cnIslTh(ch),gz=p=>t3IGz(CNI_R,CNI_SY,sd,p),at=(sx,sy,dz)=>{const p=IP(sx,sy);p[2]=gz(p)+(dz||0);return p},
    put=(fn,p,a,s)=>t3IPut(mb,fn,p,a,s),obs=(kind,p,r,h,s2)=>{if(T3OB[kind])put(m=>T3OB[kind](m,{cs:4},r,h,s2,SP,TH),p)},
    free=(sx,sy)=>typeof cnIslFree!=='function'||cnIslFree(sx,sy);
  // the path, from where the bridge from the south lands to the bridge going north; the branch to the gate
  {const nS=-cnIslRim(i,false)+8,nN=cnIslRim(i,true)-8,pc=t3Ic(mix(Wd.path,.08));for(let j=0;j<=10;j++){const n=plerp(nS,nN,j/10),e=Math.sin(j*1.7+sd)*3,c=cnChain(n,e);c[2]=gz(c);t3ISlab(mb,c,(15+(j%3)*1.5)*.6,(15+(j%3)*1.5)*.42,1.8,CN_NA+Math.PI/2+(t3IH(j,sd)-.5)*.5,pc,sd+j)}
    const b0=cnChain(-6,0),gf=IP(-92+4,-36+12);for(let j=1;j<=4;j++){const u=j/5,c=[plerp(b0[0],gf[0],u),plerp(b0[1],gf[1],u),0];c[2]=gz(c);t3ISlab(mb,c,6.6,4.8,1.6,Math.atan2(gf[1]-b0[1],gf[0]-b0[0])+Math.PI/2,pc,sd+20+j)}}
  // the pool of the world, its stream and its fall
  {const E=cnIslFallPt(i),S0=[E[0]*.56,E[1]*.56,0];S0[2]=gz(S0);t3IPool(mb,S0,ch===2?13:15,ch===2?24:28,ch,sd);t3IFall(mb,ch,E,S0,gz);
    if(ch===3)for(const[dx,dy,r,f] of[[-12,2,5,'#ff8ad8'],[9,-5,4.2,0],[15,6,3.4,'#ffe066'],[-4,-9,3,0]]){const c=[S0[0]+dy,S0[1]-dx,S0[2]+.5];t3Lathe(mb,c,[[0,r],[.4,r]],12,t3Ic('#4f8a34'),{top:t3Ic('#6aa648')});if(f)t3Sph(mb,[c[0],c[1],c[2]+1.2],1.4,t3Ic(f),{nl:7,nb:5,w:.3})}}
  // the gate, its brazier, the lanterns
  put(m=>t3IGate(m,stone,ac,sd),at(-92,-36),0);
  put(m=>t3IBrazier(m,[0,0,0],stone,won,sd),at(-112,18));
  if(ch===1||ch===3)for(const[n,e] of CNI_LAMPS){const c=cnChain(n,e);c[2]=gz(c);t3IStoneLantern(mb,c,stone)}
  t3IEdge(mb,CNI_R,CNI_SY,sd,ch,ch===4?26:15);
  const scatter=(n,s,f)=>{for(let j=0;j<n;j++){const a=t3IH(j,sd+s)*TAU,r=.22+t3IH(j,sd+s+1)*.72,sx=Math.cos(a)*r*CNI_R*CNI_SY,sy=Math.sin(a)*r*CNI_R;if(free(sx,sy))f(sx,sy,j)}};
  if(ch===1){for(const[sx,sy,h] of[[-124,-10,34],[102,-62,22],[-74,-66,15]])obs('pillar',at(sx,sy),6,h,sd+sx);
    for(const[sx,sy,a] of[[118,4,.15],[124,-24,-.2],[40,-70,.2],[68,-76,-.1],[-52,-58,.1]])put(m=>T3OB.gravestone(m,{},6.4,13,sd+sx,SP,TH),at(sx,sy),a);
    t3IOak(mb,at(-114,-52),sd,['#8cc85a','#62a040','#3e7a2e']);
    for(const[sx,sy,c] of[[-80,64,'#ff5a4a'],[-66,74,'#ffb040'],[-104,-26,'#c060f0'],[18,-80,'#ffb040'],[106,58,'#ff5a4a'],[-124,32,'#c060f0']])if(free(sx,sy))t3IShroom(mb,at(sx,sy),c,1);
    for(const[sx,sy] of[[-128,46],[128,-46],[30,-90],[-24,78]])if(free(sx,sy))t3Rock(mb,at(sx,sy,-.5),[9,8,7],sd+sx,t3Ic(mix('#8a8676',.1)),{moss:t3Ic('#6aa04a')});
    scatter(9,30,(sx,sy,j)=>t3IFern(mb,at(sx,sy),j%2?'#5f9a3c':'#4f8a34',sd+j));
    scatter(36,9,(sx,sy,j)=>{t3ITuft(mb,at(sx,sy),j%2?'#9ad86a':'#7cc050',sd+j);if(j%3===0)t3IFlower(mb,at(sx+3,sy+1),Wd.deco[j%Wd.deco.length])})}
  else if(ch===2){t3IVolcano(mb,at(64,-66),sd);
    for(const[sx,sy,hh] of[[-118,-26,30],[-104,-12,20],[-128,-6,14],[-100,-36,25],[-114,-44,17]]){const c=at(sx,sy);t3Lathe(mb,c,[[0,6],[hh,6]],6,t3Ic(mix('#3e3639',.1)),{top:t3Ic('#5a4e52')})}
    for(const[sx,sy] of[[118,22],[-96,48],[30,-88],[-30,80]])if(free(sx,sy)){t3Rock(mb,at(sx,sy,-.5),[8,7,6],sd+sx,t3Ic('#2e2628'));t3Sph(mb,at(sx,sy,5),1.4,t3Ic('#ff7a30',70),{nl:6,nb:4,w:0})}
    for(const[sx,sy,h] of[[-66,70,16],[122,-6,14]]){const c=at(sx,sy);for(let k=0;k<3;k++){const a=k*2.1+sx;t3Cone(mb,[c[0]+Math.cos(a)*3,c[1]+Math.sin(a)*3,c[2]-.5],[c[0]+Math.cos(a)*4.5,c[1]+Math.sin(a)*4.5,c[2]+h*(.6+k*.2)],3.2,t3Ic('#1e1a24'),{N:5,w:.6})}}
    t3IDeadTree(mb,at(-78,-78),44,sd);
    if(g>=1){const c=at(18,-62);t3BoxA(mb,c,0,[4,3,4],t3Ic('#3a3d42'));t3BoxA(mb,[c[0],c[1],c[2]+8],0,[4,9,3],t3Ic('#4a4f56'))}
    scatter(10,5,(sx,sy,j)=>t3Rock(mb,at(sx,sy,-.4),[2+t3IH(j,sd)*2,2,1.8],sd+j,t3Ic('#2a2224'),{nl:6,nb:4}))}
  else if(ch===3){t3ISwampTree(mb,sd);
    for(const[sx,sy] of[[30,6],[124,36],[-84,-62],[-126,8]])if(free(sx,sy))t3IReeds(mb,at(sx,sy),sd+sx);
    for(const[sx,sy,c] of[[-76,66,'#d070ff'],[-106,-40,'#ffd040'],[-118,40,'#d070ff']])if(free(sx,sy))t3IShroom(mb,at(sx,sy),c,1.1);
    t3ITotem(mb,at(-80,-70));obs('stump',at(-120,30),8,10,sd+2);obs('stump',at(124,-14),7,8,sd+3);
    scatter(26,9,(sx,sy,j)=>{t3ITuft(mb,at(sx,sy),j%2?'#7aa04a':'#5f8a3a',sd+j);if(j%4===0)t3IFlower(mb,at(sx+3,sy+1),Wd.deco[j%Wd.deco.length])})}
  else{for(const[sx,sy,r,hh] of[[64,-70,10,44],[80,-58,7,28],[48,-60,5,18],[118,-40,7,26],[40,-80,4,14]])if(Math.hypot(sx-84,sy+28)>30){const c=at(sx,sy,-.5);t3Shard(mb,c,r*.62,hh*.72,hh*.28,sx*.1,[0,-.08])}
    for(const[sx,sy,r] of[[-70,66,14],[-120,-6,11],[110,50,9],[-40,-70,9]])if(free(sx,sy))t3Lathe(mb,at(sx,sy,-.6),[[0,r],[r*.4,r*.82],[r*.7,r*.42],[r*.82,.1]],16,t3Ic('#f6fbff'));
    t3IPine(mb,at(-118,-34),44,sd+1,true);t3IPine(mb,at(-84,-72),34,sd+2,true);t3IPine(mb,at(124,30),36,sd+3,true);t3ISnowman(mb,at(98,8));t3Rock(mb,at(-128,36,-.5),[9,8,7],sd+5,t3Ic('#8a9aab'),{moss:t3Ic('#f6fbff')});
    scatter(8,6,(sx,sy,j)=>{const c=at(sx,sy,-.3);t3Shard(mb,c,1.6+t3IH(j,sd)*1,3+t3IH(j,sd+1)*3,2,sx,[0,0])})}
  T3I.nV=Math.max(T3I.nV,mb.P.length/3);return v3Up(mb)}
// an island's meshes (made again when it is won, opened, or the effects change)
function t3IIslMesh(i,won,op){const key='i'+i+'|'+(won?1:0)+(op?1:0)+(LOWFX?1:0);let m=T3I.M.get(key);if(m){T3I.M.delete(key);T3I.M.set(key,m);return m}
  const ch=ARENAS[i].ch||1,Wd=cnIslW(i),g=cnIslG(i),ac=ARENAS[i].col,mix=(c,q)=>g?cnMixC(c,ac,q*g):c,sd=i*1.7+.4;
  const gr=t3IGround(t3IslM(i),CNI_R,CNI_SY,CNI_DEP,150,sd,t3Ic(mix(Wd.top,.14)),t3Ic(Wd.edge),t3Ic(mix(Wd.side,.1)),!op);
  m={top:gr.top,cliff:gr.cliff,deco:t3IIslDeco(i,won),ch,free(){t3GFree(this.top);t3GFree(this.cliff);v3Free(this.deco)}};t3IKeep(key,m);return m}
// (the big ones, islands and bridges, are many: the small ones, stones, prizes, flags, are kept as long as there is room)
function t3IKeep(key,m){T3I.M.set(key,m);T3I.built=(T3I.built||0)+1;while(T3I.M.size>160){const k0=T3I.M.keys().next().value,o=T3I.M.get(k0);T3I.M.delete(k0);try{o.free()}catch(e){}}}
// ------------------------------------------------------------------ the bridge in true 3D (the path's own units of island i: x east, y south)
// 1. the planks: one after the other, all with the same corners (the show and the bridge being built draw as many as are in), each a little
// different (length, place, turn, colour), lying on the deck's hang, with their nails; 2. the frame: two beams under them, a cross beam every
// four planks (its ends carry the posts), the bracing underneath, the world's dress on the beam ends; 3. the posts and their caps, the arms of
// the lanterns; 4. the ropes of the railing between the posts, the two big cables from the towers' tops with their hangers, the little flags;
// 5. the towers of logs with their roofs, the beams between them, the banner of the arena it leads to; 6. the balconies of the prizes, on the
// left; 7. the anchors on the little island
function t3IBridgeMesh(i){const key='b'+i+'|'+(LOWFX?1:0);let B=T3I.M.get(key);if(B){T3I.M.delete(key);T3I.M.set(key,B);return B}
  const G0=cnBrGeo(i),W=cnBrW(i),ch=ARENAS[i].ch||1,N=G0.N,pitch=G0.pitch,a0=G0.a0,a1=G0.a1,sd=i*3.1+.7,P=t3IPP,DZ=n=>cnDeckZ(G0,n),{nrm,cross,mul}=RG,
    wood=t3Ic(W.wood),wdk=t3Ik(wood,.78),rope=t3Ic(W.rope),cab=t3Ic(W.cable),stone=t3Ic(cnMixC(W.stone,'#8a8070',.15)),A1=ARENAS[i+1],acH=A1?A1.col:'#c0392b',ac=t3Ic(acH),
    th=CNB.pt+.8,nT=cnIslRim(i,true)-6,UP=[0,0,1],E=[1,0,0],Nn=sl=>[0,-Math.cos(sl),Math.sin(sl)],slope=n=>Math.atan2(DZ(n+pitch*.5)-DZ(n-pitch*.5),pitch);
  // 1. the planks
  const mp=v3MB();let per=0;
  for(let g=0;g<N;g++){const i0=mp.I.length,n=cnPlankN(G0,g),z=DZ(n),sl=slope(n),col=t3Ik(t3Ic(W.plank[Math.floor(t3IH(g,i+2)*4)%4]),.9+t3IH(g,sd+3)*.18),
      hu=CNB.hw+(t3IH(g,sd)-.5)*3.2,off=(t3IH(g,sd+5)-.5)*2.6,rot=(t3IH(g,sd+7)-.5)*.06,U=[Math.cos(rot),Math.sin(rot),0],V0=[Math.sin(rot),-Math.cos(rot),0],
      V=nrm([V0[0]*Math.cos(sl),V0[1]*Math.cos(sl),Math.sin(sl)]),Wv=mul(cross(U,V),1),Wu=Wv[2]<0?mul(Wv,-1):Wv,hv=CNB.pd/2-.2,C=RG.add(P(n,off,z-th/2),[0,0,0]);
    t3IBox(mp,C,U,V,Wu,hu,hv,th/2,col,{top:t3Ik(col,1.06),uv:40});
    const nail=t3Ic('#2a2420');for(const a of[-1,1])for(const b of[-1,1]){const c=RG.add(C,RG.add(mul(U,a*(hu-3.4)),RG.add(mul(V,b*(hv-2.4)),mul(Wu,th/2+.06))));t3IQ(mp,RG.add(c,RG.add(mul(U,-.6),mul(V,-.6))),RG.add(c,RG.add(mul(U,.6),mul(V,-.6))),RG.add(c,RG.add(mul(U,.6),mul(V,.6))),RG.add(c,RG.add(mul(U,-.6),mul(V,.6))),Wu,nail)}
    if(!g)per=mp.I.length-i0}
  // 2. the frame
  const mf=v3MB();
  for(const s of[-1,1]){const pts=[];for(let n=a0-6;n<=a1+6.01;n+=pitch)pts.push(P(n,s*30,DZ(n)-th-2.6));v3Tube(mf,pts,pts.map(()=>2.5),wdk,6)}
  const XB=[];for(let j=0;j<=16;j++)XB.push(a0+4*j*pitch);
  XB.forEach((n,j)=>{if(!j||j===16)return;const sl=slope(n),V=Nn(sl);t3IBox(mf,P(n,0,DZ(n)-th-1.6),E,V,mul(nrm(cross(E,V)),-1),53,2.1,1.9,wood,{uv:40})});
  for(let j=0;j<16;j++){const n0=XB[j],n1=XB[j+1],s=j%2?1:-1;t3Line(mf,[P(n0,-30*s,DZ(n0)-th-5),P(n1,30*s,DZ(n1)-th-5)],1.1,wdk,{w:.5,N:5})}
  // (the world's dress on the beam ends: moss and its beards, chains with glowing coals, vines with flowers, icicles and snow)
  XB.forEach((n,j)=>{if(!j||j===16)return;for(const s of[-1,1]){const c=P(n,s*53.5,DZ(n)-th-1.6),h=t3IH(j*2+(s>0),sd+11);
    if(ch===1){t3Ell(mf,[c[0],c[1],c[2]+1.6],[2.6,3,1.6],t3Ic('#7cb24a'),{nl:8,nb:5,w:.4});t3Line(mf,[[c[0],c[1],c[2]],[c[0]+s*.6,c[1],c[2]-5],[c[0]+s,c[1]+.5,c[2]-8-h*7]],[.9,.7,.4],t3Ic('#6aa040'))}
    else if(ch===2){const l=9+h*9;t3Line(mf,[[c[0],c[1],c[2]-1],[c[0],c[1],c[2]-l]],.55,t3Ic('#3a3434'),{w:.3});t3Sph(mf,[c[0],c[1],c[2]-l-1.6],1.9,t3Ic('#ff6a2a',70),{nl:7,nb:5,w:.4})}
    else if(ch===3){const l=12+h*10;t3Line(mf,[[c[0],c[1],c[2]],[c[0]+s*1.5,c[1],c[2]-l*.5],[c[0]+s*.5,c[1]+1,c[2]-l]],[.8,.6,.4],t3Ic('#4f8a34'));t3Sph(mf,[c[0]+s*1.4,c[1],c[2]-l*.5],1.2,t3Ic('#ff8ad8'),{nl:6,nb:4,w:.3});t3Sph(mf,[c[0]+s*.5,c[1]+1,c[2]-l],1,t3Ic('#ffe066'),{nl:6,nb:4,w:.3})}
    else{t3Ell(mf,[c[0],c[1],c[2]+2],[2.2,3.2,1.2],t3Ic('#f6fbff'),{nl:8,nb:5,w:.4});for(let k=0;k<2;k++)t3Cone(mf,[c[0]+(k-.5)*2,c[1],c[2]-1.6],[c[0]+(k-.5)*2,c[1],c[2]-6-h*7-k*3],1.1,t3Ic('#d4ecfb',232),{N:5,w:.3})}}});
  // 3. the posts
  const mpo=v3MB(),posts=cnBrPosts(G0);
  for(const q of posts){const z0=DZ(q.n)-th-3.2,z1=DZ(q.n)+CNB.ph;t3IBox(mpo,P(q.n,q.e,(z0+z1)/2),E,[0,-1,0],UP,1.8,1.8,(z1-z0)/2,wood,{uv:24});t3IBox(mpo,P(q.n,q.e,z1+.8),E,[0,-1,0],UP,2.5,2.5,.8,wdk);
    t3Sph(mpo,P(q.n,q.e,z1+2.4),1.4,wdk,{nl:7,nb:5,w:.4});if(ch===4)t3Ell(mpo,P(q.n,q.e,z1+3.2),[2.6,2.6,1.1],t3Ic('#f6fbff'),{nl:8,nb:5,w:.3});
    if(q.lamp){const s=Math.sign(q.e);t3IBox(mpo,P(q.n,q.e+s*CNB.lo*.55,z1-2.6),E,[0,-1,0],UP,CNB.lo*.55+1,.7,.7,wdk)}}
  // 4. the ropes: the railing on both sides (along the posts; on the left it opens where the balconies are), the cables and their hangers
  const mr=v3MB(),rail=(pts,dip)=>{const out=[];for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),dp=dip+L*.018,S=Math.max(3,Math.ceil(L/12));
      for(let s=k?1:0;s<=S;s++){const u=s/S;out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u-dp*4*u*(1-u)])}}return out};
  const tie=(e,hz)=>{const L=[];L.push({n:nT+5.5,e:Math.sign(e)*(CNB.pe-3),z:hz*1.15});for(const q of posts)if(Math.sign(q.e)===Math.sign(e))L.push({n:q.n,e:q.e,z:DZ(q.n)+hz});
    if(e<0)G0.Z.forEach(c=>{L.push({n:c-(CNB.bd-2.5),e:-CNB.bal+CNB.bw-4,z:DZ(c)+hz*.62,gapA:1});L.push({n:c+(CNB.bd-2.5),e:-CNB.bal+CNB.bw-4,z:DZ(c)+hz*.62,gapB:1})});
    L.push({n:G0.ae,e:Math.sign(e)*CNB.pe,z:CNB.stump-1-(hz<20?8:0)});L.sort((a,b)=>a.n-b.n);return L};
  for(const s of[-1,1])for(const[hz,r,dip] of[[CNB.ph-1,.8,1.6],[CNB.ph*.5,.6,1.2]]){const L=tie(s*CNB.pp,hz);let seg=[];
    for(const q of L){seg.push(t3IPP(q.n,q.e,q.z));if(q.gapA){if(seg.length>1)t3Line(mr,rail(seg,dip),r,rope,{N:5,w:.3});seg=[]}}if(seg.length>1)t3Line(mr,rail(seg,dip),r,rope,{N:5,w:.3})}
  const CAB=[];for(const s of[-1,1]){const pts=[P(nT,s*CNB.pe,CNB.gate-4)];for(let k=0;k<=44;k++){const n=a0+(a1-a0)*k/44;pts.push(P(n,s*cnCableE(G0,n),cnCableZ(G0,n)))}pts.push(P(G0.ae,s*CNB.pe,CNB.stump-1));
    t3Line(mr,pts,1.6,cab,{N:6,w:.45});CAB.push(pts)}
  for(const q of posts){const cz=cnCableZ(G0,q.n),pz=DZ(q.n)+CNB.ph;if(cz-pz>3)t3Line(mr,[P(q.n,Math.sign(q.e)*cnCableE(G0,q.n),cz),P(q.n,q.e,pz+1)],.45,rope,{N:4})}
  // (little flags of the arena it leads to, hanging from the cables, facing you)
  if(!LOWFX)for(const s of[-1,1])for(let k=1;k<12;k++){const n=a0+(a1-a0)*k/12,c=P(n,s*cnCableE(G0,n),cnCableZ(G0,n)-1.2),col=k%2?ac:t3Ik(t3Ic(W.rope),1.15),A=[c[0]-3.6,c[1],c[2]],B2=[c[0]+3.6,c[1],c[2]],T=[c[0]+(t3IH(k,sd)-.5)*1.5,c[1],c[2]-9];
    for(const nn of[[0,1,0],[0,-1,0]]){const a=v3V(mr,A,nn,col),b=v3V(mr,B2,nn,col),t=v3V(mr,T,nn,col);v3T(mr,a,b,t)}}
  // 5. the towers: four logs each, the rings and the crosses, the platform and the roof; between them two beams and the banner
  const mt=v3MB(),bark=t3Ic(W.wood),roof=t3Ic(ch===4?'#c4d4e4':ch===2?'#4a2a24':ch===3?'#4a5a2e':'#7a3a2a'),roof2=t3Ik(roof,1.25);
  for(const s of[-1,1]){const ce=s*CNB.pe,L4=[[-5.5,-5.5],[-5.5,5.5],[5.5,-5.5],[5.5,5.5]];
    t3IBox(mt,P(nT,ce,1.6),E,[0,-1,0],UP,10.5,10.5,3.2,stone,{uv:20});
    for(const[dn,de] of L4)v3Tube(mt,[P(nT+dn,ce+de,2),P(nT+dn,ce+de,50),P(nT+dn*.9,ce+de*.9,98)],[2.9,2.6,2.3],bark,8);
    for(const z of[34,66,96]){for(const[a,b] of[[0,1],[2,3]]){const p=L4[a],q=L4[b];t3Line(mt,[P(nT+p[0],ce+p[1]*1.05,z),P(nT+q[0],ce+q[1]*1.05,z)],1.5,wdk,{N:6,w:.5})}
      for(const[a,b] of[[0,2],[1,3]]){const p=L4[a],q=L4[b];t3Line(mt,[P(nT+p[0]*1.05,ce+p[1],z),P(nT+q[0]*1.05,ce+q[1],z)],1.5,wdk,{N:6,w:.5})}}
    for(const[z0,z1] of[[6,34],[34,66]]){t3Line(mt,[P(nT+5.8,ce-5.5,z0),P(nT+5.8,ce+5.5,z1)],1.05,wdk,{N:5,w:.4});t3Line(mt,[P(nT+5.8,ce+5.5,z0),P(nT+5.8,ce-5.5,z1)],1.05,wdk,{N:5,w:.4});
      t3Line(mt,[P(nT-5.8,ce-5.5,z0),P(nT-5.8,ce+5.5,z1)],1.05,wdk,{N:5,w:.4});t3Line(mt,[P(nT+5.5,ce+s*5.8,z0),P(nT-5.5,ce+s*5.8,z1)],1.05,wdk,{N:5,w:.4})}
    t3IBox(mt,P(nT,ce,99),E,[0,-1,0],UP,8,8,1.4,wood,{uv:20});
    // the roof: four slopes from wide eaves to the top, the ridge cap
    {const z0=100.6,z1=118,ew=10.5,tp=P(nT,ce,z1),C4=[P(nT-ew,ce-ew,z0),P(nT-ew,ce+ew,z0),P(nT+ew,ce+ew,z0),P(nT+ew,ce-ew,z0)],ctr=P(nT,ce,z0+4);for(let k=0;k<4;k++){const a=C4[k],b=C4[(k+1)%4];t3Facet(mt,a,b,tp,k%2?roof:roof2,ctr)}
      t3IBox(mt,P(nT,ce,z0-.3),E,[0,-1,0],UP,ew,ew,.5,t3Ik(roof,.7));t3Sph(mt,P(nT,ce,z1+1.4),2,t3Ic('#e8c070'),{nl:8,nb:6,w:.5});if(ch===4)t3Ell(mt,P(nT,ce,z0+6),[9,9,4],t3Ic('#f6fbff'),{nl:10,nb:6,w:.4})}
    // the arm of the tower's lantern, outside
    t3IBox(mt,P(nT,ce+s*14,92),E,[0,-1,0],UP,7,.9,.9,wdk);t3Line(mt,[P(nT,ce+s*8,86),P(nT,ce+s*16,92)],.7,wdk,{N:4})}
  for(const z of[84,94])t3IBox(mt,P(nT+5.5,0,z),E,[0,-1,0],UP,CNB.pe-4,2.2,2.2,wood,{uv:40});
  // the banners: one long banner of the arena it leads to down the front of each tower (the view along the bridge stays open between them):
  // the arena's colour, a lighter band, its round sign, cut in a point at the bottom, both sides
  for(const s of[-1,1]){const n=nT-7.6,ec=s*CNB.pe,w=6.6,z0=90,z1=36,band=t3Ik(ac,1.35),sign=t3Ic('#f6e7c4'),Q=(e,z)=>P(n,ec+e,z),pts=[[-w,z0],[w,z0],[w,z1+7],[0,z1],[-w,z1+7]];
    for(const[nn,dn] of[[[0,1,0],.25],[[0,-1,0],-.25]]){const c0=v3V(mt,RG.add(Q(0,(z0+z1)/2+3),[0,dn,0]),nn,ac),vs=pts.map(([e,z])=>v3V(mt,RG.add(Q(e,z),[0,dn,0]),nn,ac));for(let k=0;k<vs.length;k++)v3T(mt,c0,vs[k],vs[(k+1)%vs.length]);
      for(const zb of[z0-4,z1+12])t3IQ(mt,RG.add(Q(-w,zb),[0,dn*1.6,0]),RG.add(Q(w,zb),[0,dn*1.6,0]),RG.add(Q(w,zb-2.6),[0,dn*1.6,0]),RG.add(Q(-w,zb-2.6),[0,dn*1.6,0]),nn,band);
      const cc=RG.add(Q(0,z0-17),[0,dn*1.8,0]),cv0=v3V(mt,cc,nn,sign),R=[];for(let k=0;k<14;k++){const a=k/14*TAU;R.push(v3V(mt,RG.add(cc,[Math.cos(a)*4.6,0,Math.sin(a)*4.6]),nn,sign))}for(let k=0;k<14;k++)v3T(mt,cv0,R[k],R[(k+1)%14]);
      const cr=RG.add(Q(0,z0-17),[0,dn*2.1,0]),cv1=v3V(mt,cr,nn,ac),R2=[];for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4;R2.push(v3V(mt,RG.add(cr,[Math.cos(a)*2.6,0,Math.sin(a)*2.6]),nn,ac))}for(let k=0;k<4;k++)v3T(mt,cv1,R2[k],R2[(k+1)%4])}
    t3Line(mt,[Q(-w-1.2,z0+1.4),Q(w+1.2,z0+1.4)],1,wdk,{N:5});for(const e of[-w-1.2,w+1.2])t3Sph(mt,Q(e,z0+1.4),1.3,t3Ic('#e8c070'),{nl:6,nb:4,w:.4})}
  // 7. the anchors on the little island: a block of stone, a log post
  for(const s of[-1,1]){const n=G0.ae,e=s*CNB.pe;t3IBox(mt,P(n,e,2.2),E,[0,-1,0],UP,6.5,6,3,stone,{uv:16});v3Tube(mt,[P(n,e,4),P(n,e,CNB.stump)],[3,2.6],bark,8);t3Sph(mt,P(n,e,CNB.stump+1),2.2,wdk,{nl:7,nb:5})}
  // 6. the balconies: the floor of four planks across, the struts under it, the round stone in the middle (its ring of the prize's colour
  // glows), two tall posts on the far side with the arch between them and a lantern on each, two short ones near, the ropes round it
  const mb2=v3MB(),Ebal=-CNB.bal,bw=CNB.bw,bd=CNB.bd,ah=40,rh=15;
  G0.Z.forEach((c,b)=>{const dz=DZ(c),pc=t3Ic(cnPrizeCol(cnBrPrize(i,b+1)),110);
    for(let k=0;k<4;k++){const n=c-bd+(k+.5)*bd/2,col=t3Ic(W.plank[(k+b+1)%4]);t3IBox(mb2,P(n,Ebal,dz-1.6),E,[0,-1,0],UP,bw,bd/4-.7,1.6,col,{top:t3Ik(col,1.06),uv:40})}
    for(const dn of[bd-5,-(bd-5)]){t3Line(mb2,[P(c+dn,Ebal-bw+6,dz-4),P(c+dn,-CNB.hw+3,dz-22)],1.9,wdk,{N:6,w:.5});t3Line(mb2,[P(c+dn,-CNB.hw+10,dz-5.5),P(c+dn,Ebal-bw-2,dz-5.5)],2.4,wdk,{N:6,w:.5})}
    t3Lathe(mb2,P(c,Ebal,dz),[[0,10.5],[1.6,10.5],[2.2,9.6],[3.2,9.6]],16,t3Ic(cnMixC(W.stone,'#3e3a36',.35)),{top:f=>f>.72&&f<.84?pc:t3Ic(cnMixC(W.stone,'#5a5650',.2)),rings:[0,.72,.74,.82,.84,1]});
    const C4=[[bd-2.5,Ebal+bw-4],[bd-2.5,Ebal-bw+2.5],[-(bd-2.5),Ebal-bw+2.5],[-(bd-2.5),Ebal+bw-4]];
    for(let k=0;k<4;k++){const[dn,e]=C4[k],h=k<2?ah:rh;t3IBox(mb2,P(c+dn,e,dz+h/2-1),E,[0,-1,0],UP,1.9,1.9,h/2+1,wood,{uv:24});t3IBox(mb2,P(c+dn,e,dz+h+.6),E,[0,-1,0],UP,2.5,2.5,.7,wdk)}
    {const n=c+bd-2.5;t3Line(mb2,[P(n,C4[0][1],dz+ah-3),P(n,Ebal,dz+ah+3),P(n,C4[1][1],dz+ah-3)],1.6,wdk,{N:6,w:.5});
      // the little banner hanging from the arch
      const bn=n-.4,w=7,z0=dz+ah+1,z1=dz+ah-17,pts=[[-w,z0],[w,z0],[w,z1+5],[0,z1],[-w,z1+5]].map(([e,z])=>[Ebal+e,z]);for(const[nn,dd] of[[[0,1,0],.2],[[0,-1,0],-.2]]){const c0=v3V(mb2,P(bn-dd,Ebal,(z0+z1)/2),nn,ac),vs=pts.map(([e,z])=>v3V(mb2,P(bn-dd,e,z),nn,ac));for(let k=0;k<vs.length;k++)v3T(mb2,c0,vs[k],vs[(k+1)%vs.length])}}
    for(const[hz,r] of[[rh-1,.75],[rh*.5,.6]]){const pts=[C4[3],C4[2],C4[1],C4[0]].map(([dn,e],k)=>P(c+dn,e,dz+hz+(k>1?0:0)));t3Line(mb2,rail(pts,1.2),r,rope,{N:5,w:.3})}});
  B={planks:v3Up(mp),per,frame:v3Up(mf),posts:v3Up(mpo),ropes:v3Up(mr),towers:v3Up(mt),balc:v3Up(mb2),G0,nT,free(){for(const k of['planks','frame','posts','ropes','towers','balc'])v3Free(this[k])}};
  T3I.nV=Math.max(T3I.nV,mp.P.length/3,mf.P.length/3,mr.P.length/3,mt.P.length/3,mb2.P.length/3);t3IKeep(key,B);return B}
// the lanterns: hanging from their hook (the origin) or standing on a post; lit (the glass glows) or not
function t3ILampMesh(on){const k=on?'lampOn':'lampOff';if(T3I[k])return T3I[k];const mb=v3MB(),iron=t3Ic('#3a3430'),glass=on?t3Ic('#ffd27a',90):t3Ic('#6a5a48');
  t3Lathe(mb,[0,0,-1.6],[[0,.7],[1.6,.7]],6,iron);t3Lathe(mb,[0,0,-4],[[0,3],[2.4,.6]],8,iron);t3Lathe(mb,[0,0,-10.6],[[0,2.4],[6.6,2.4]],10,glass,{top:glass});
  for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4;t3Line(mb,[[Math.cos(a)*2.6,Math.sin(a)*2.6,-10.8],[Math.cos(a)*2.6,Math.sin(a)*2.6,-4]],.42,iron,{N:4,w:.3})}t3Lathe(mb,[0,0,-11.8],[[0,3],[1.4,3]],10,iron,{top:iron});
  return T3I[k]=v3Up(mb)}
// a loose plank (its middle at the origin) for the ones that fly into their places
function t3IPlankMesh(i,g){const key='pl'+i+'|'+g%4;let m=T3I.M.get(key);if(m)return m;const W=cnBrW(i),mb=v3MB(),col=t3Ic(W.plank[Math.floor(t3IH(g,i+2)*4)%4]);
  t3IBox(mb,[0,0,0],[1,0,0],[0,-1,0],[0,0,1],CNB.hw,CNB.pd/2-.2,(CNB.pt+.8)/2,col,{top:t3Ik(col,1.06),uv:40});m=v3Up(mb);m.free=function(){v3Free(this)};t3IKeep(key,m);return m}
// ------------------------------------------------------------------ the little island of the checkpoint (in the next world), its altar, the pole
// of the banner, its braziers; the five stones that rise to the next island
function t3IMiniMesh(i,up){const lit=up>.5,key='m'+i+'|'+(lit?1:0)+(LOWFX?1:0);let m=T3I.M.get(key);if(m){T3I.M.delete(key);T3I.M.set(key,m);return m}
  const j=i+1,Wd=cnIslW(j),ch=ARENAS[j].ch||1,g=cnIslG(j),ac=ARENAS[j].col,mix=(c,q)=>g?cnMixC(c,ac,q*g):c,sd=cnMiniSd(i),R=CNI_MR,SY=CNI_MSY,stone=mix(Wd.stone,.12),Wb=cnBrW(i),
    gz=p=>t3IGz(R,SY,sd,p),at=(n,e,dz)=>{const p=cnChain(n,e);p[2]=gz(p)+(dz||0);return p};
  const gr=t3IGround(t3IslM(i,CNI_MN),R,SY,CNI_MDEP,96,sd,t3Ic(mix(Wd.top,.14)),t3Ic(Wd.edge),t3Ic(mix(Wd.side,.1)),false),mb=v3MB();
  {const rS=cnMiniRim(i,false),rN=cnMiniRim(i,true),pc=t3Ic(mix(Wd.path,.08));for(let q=0;q<=5;q++){const n=plerp(-rS+7,rN-7,q/5),c=at(n,Math.sin(q*1.9+sd)*2);t3ISlab(mb,c,8,5.4,1.6,CN_NA+Math.PI/2,pc,sd+q)}
    for(const s of[-1,1])t3IBrazier(mb,at(rN-15,s*24),stone,lit,sd+s)}
  {const c=at(CNM_ALT[0],CNM_ALT[1]),st=t3Ic(stone),dk=t3Ik(st,.72),lt=t3Ik(st,1.1),rune=t3Ic(ac,90);t3BoxA(mb,c,0,[13,16,1.6],dk);t3BoxA(mb,[c[0],c[1],c[2]+3.2],0,[9.5,12.5,2.2],st);t3BoxA(mb,[c[0],c[1],c[2]+7.6],0,[11,14,.8],lt);
    for(let k=0;k<3;k++)t3BoxA(mb,[c[0]+9.6,c[1]+(k-1)*7,c[2]+3.6],0,[.15,1.6,1.4],rune)}
  {const c=at(CNM_POLE[0],CNM_POLE[1]),w=t3Ic(Wb.wood);t3Lathe(mb,c,[[0,5],[2.6,4.2],[3.4,2.6]],10,t3Ic('#8a8070'));v3Tube(mb,[[c[0],c[1],c[2]+2],[c[0],c[1],c[2]+CNM_PH]],[2,1.5],w,8);
    t3Sph(mb,[c[0],c[1],c[2]+CNM_PH+1.6],2.4,t3Ic('#e8c070'),{nl:8,nb:6});v3Tube(mb,[[c[0],c[1]-15,c[2]+CNM_PH-4],[c[0],c[1]+15,c[2]+CNM_PH-4]],[1.1,1.1],w,6)}
  t3IEdge(mb,R,SY,sd,ch,ch===4?14:9);
  // a little of its world: stones, tufts, a tree
  for(let q=0;q<10;q++){const a=t3IH(q,sd)*TAU,r=.3+t3IH(q,sd+1)*.55,n=Math.cos(a)*r*R,e=Math.sin(a)*r*R*SY;if(Math.abs(e)<14||Math.hypot(n-CNM_ALT[0],e-CNM_ALT[1])<22||Math.hypot(n-CNM_POLE[0],e-CNM_POLE[1])<12)continue;const c=at(n,e);
    if(q%3===0)t3Rock(mb,[c[0],c[1],c[2]-.4],[4,3.6,3.2],sd+q,t3Ic(stone),{moss:ch===4?t3Ic('#f6fbff'):ch===2?null:t3Ic('#6aa04a'),nl:7,nb:4});else if(ch!==2)t3ITuft(mb,c,ch===4?'#e8f4ff':'#8ac858',sd+q);else t3Sph(mb,c,1.1,t3Ic('#ff7a30',80),{nl:5,nb:4,w:0})}
  {const c=at(-30,-46);if(ch===1)t3IOak(mb,c,sd,['#8cc85a','#62a040','#3e7a2e']);else if(ch===4)t3IPine(mb,c,30,sd,true);else if(ch===2)t3IDeadTree(mb,c,30,sd);else t3IReeds(mb,c,sd)}
  m={top:gr.top,cliff:gr.cliff,deco:v3Up(mb),ch,free(){t3GFree(this.top);t3GFree(this.cliff);v3Free(this.deco)}};T3I.nV=Math.max(T3I.nV,mb.P.length/3);t3IKeep(key,m);return m}
// the banner of the pole (the arena's colour, its sign): hanging from the crossbar (the origin), unrolled by its scale
function t3IFlagMesh(col){const key='f'+col;let m=T3I.M.get(key);if(m)return m;const mb=v3MB(),ac=t3Ic(col),band=t3Ik(ac,1.35),sign=t3Ic('#f6e7c4'),w=13,h=34;
  for(const[nn,dd] of[[[1,0,0],.2],[[-1,0,0],-.2]]){const pts=[[-w,0],[w,0],[w,-h+7],[0,-h],[-w,-h+7]],c0=v3V(mb,[dd,0,-h/2],nn,ac),vs=pts.map(([y,z])=>v3V(mb,[dd,y,z],nn,ac));for(let k=0;k<vs.length;k++)v3T(mb,c0,vs[k],vs[(k+1)%vs.length]);
    t3IQ(mb,[dd*2,-w,-3],[dd*2,w,-3],[dd*2,w,-6],[dd*2,-w,-6],nn,band);const cc=[dd*2.2,0,-15],cv0=v3V(mb,cc,nn,sign),R=[];for(let k=0;k<14;k++){const a=k/14*TAU;R.push(v3V(mb,[cc[0],Math.cos(a)*5.6,cc[2]+Math.sin(a)*5.6],nn,sign))}for(let k=0;k<14;k++)v3T(mb,cv0,R[k],R[(k+1)%14])}
  m=v3Up(mb);m.free=function(){v3Free(this)};t3IKeep(key,m);return m}
// a stepping stone: its top of the next world, a lip, the rock under it to a point
function t3IStoneMesh(i,j,r){const key='s'+i+'|'+j;let m=T3I.M.get(key);if(m)return m;const Wd=cnIslW(i+1),mb=v3MB(),sd=i*5.3+j*1.7;
  t3Lathe(mb,[0,0,0],[[-r*1.7,.4],[-r*1.1,r*.45],[-r*.5,r*.85],[-4,r*.98],[-1.6,r*1.04],[0,r]],12,z=>z>-1.7?t3Ic(Wd.edge):t3Ik(t3Ic(Wd.side),z<-r*.6?.8:1),{top:t3Ic(Wd.top),wob:(a,z)=>1+.12*Math.sin(a*3+sd)+.06*Math.sin(a*7+z*.3)});
  if(Wd.top!=='#634238')for(let k=0;k<3;k++){const a=k*2.2+sd;t3ITuft(mb,[Math.cos(a)*r*.5,Math.sin(a)*r*.5,0],Wd===CN_ISW[4]?'#e8f4ff':'#8ac858',sd+k)}
  m=v3Up(mb);m.free=function(){v3Free(this)};t3IKeep(key,m);return m}
// ------------------------------------------------------------------ the prizes in 3D: the chest (its colours, the lid that opens on its hinge,
// the gold inside), the sack of gold with its coins, the gems on their little stone, the jar of moss essence that glows
function t3IPrizeMesh(p,open){const t=p.t||'',key='p|'+p.k+'|'+t+'|'+(open?1:0);let m=T3I.M.get(key);if(m)return m;const mb=v3MB();
  if(p.k==='cassa'||p.k==='tesoro'){const C=CHC[t]||CN_CHC[t]||CHC.legno,body=t3Ic(C.body),dark=t3Ic(C.dark),band=t3Ic(C.band),lock=t3Ic(C.lock),U=[1,0,0],V=[0,1,0],Z=[0,0,1];
    t3IBox(mb,[0,0,5.5],U,V,Z,11,7,5.5,body,{uv:30});for(const s of[-1,1])t3IBox(mb,[s*6,0,5.6],U,V,Z,1.3,7.3,5.7,band);
    // the lid: half a log on the hinge at the back, turned open (as much as open says)
    const ang=open?-1.95:0,hz=11,hy=-7,rot=(q)=>{const y=q[1]-hy,z=q[2]-hz,c=Math.cos(ang),s=Math.sin(ang);return[q[0],hy+y*c-z*s,hz+y*s+z*c]};
    const rotD=d=>{const c=Math.cos(ang),s=Math.sin(ang);return[d[0],d[1]*c-d[2]*s,d[1]*s+d[2]*c]},tmp=v3MB();
    // (a half cylinder along x: the lathe turned on its side)
    {const N=10,rows=[];for(let a=0;a<=N;a++){const th=a/N*Math.PI,row=[];for(const x of[-11,11]){const q=[x,Math.cos(th)*7,hz+Math.sin(th)*7];row.push(v3V(tmp,rot(q),rotD([0,Math.cos(th),Math.sin(th)]),body))}rows.push(row)}
      for(let a=0;a<N;a++)v3T(tmp,rows[a][0],rows[a][1],rows[a+1][1]),v3T(tmp,rows[a][0],rows[a+1][1],rows[a+1][0]);
      for(const x of[-11,11]){const nn=rotD([Math.sign(x),0,0]),c0=v3V(tmp,rot([x,0,hz]),nn,dark),R=[];for(let a=0;a<=N;a++){const th=a/N*Math.PI;R.push(v3V(tmp,rot([x,Math.cos(th)*7,hz+Math.sin(th)*7]),nn,dark))}for(let a=0;a<N;a++)v3T(tmp,c0,R[a],R[a+1])}
      for(const s of[-1,1]){const R=[];for(let a=0;a<=N;a++){const th=a/N*Math.PI;R.push(rot([s*6,Math.cos(th)*7.3,hz+Math.sin(th)*7.3]))}t3Line(tmp,R,1.3,band,{N:4,w:.5})}}
    t3IApp(mb,tmp,v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,0]));
    if(!open){t3IBox(mb,[0,7.4,8],U,V,Z,2.2,.6,2.6,lock);t3Sph(mb,[0,8.1,7.6],.8,t3Ic('#1a1410'),{nl:6,nb:4,w:0})}
    else{t3IQ(mb,[-10,-6,10.9],[10,-6,10.9],[10,6,10.9],[-10,6,10.9],[0,0,1],t3Ic('#2a1a10'));for(let k=0;k<7;k++)t3Sph(mb,[(t3IH(k,3)-.5)*16,(t3IH(k,5)-.5)*9,11.6+t3IH(k,7)*1.2],1.8,t3Ic('#ffd84a',150),{nl:6,nb:4,w:.3})}}
  else if(p.k==='oro'){t3Lathe(mb,[0,0,0],[[0,6.6],[2,8.6],[6,9],[9.5,7.6],[11.5,4.2],[12.5,2.8],[13.5,3.2],[15,4.6]],16,t3Ic('#c09a62'),{top:t3Ic('#d8b880')});t3Lathe(mb,[0,0,11.6],[[0,4.2],[1.6,4]],12,t3Ic('#7a5a30'));
    for(const[x,y,z] of[[0,-1.4,15.4],[1,1.6,15.8],[-1.2,.6,16.4]])t3Sph(mb,[x,y,z],1.9,t3Ic('#ffc93c',190),{nl:7,nb:5,w:.4});
    for(const[x,y,a] of[[-9,-6,.2],[-6,8,-.4],[-10,3,.9],[7,-8,.5]])t3Lathe(mb,[y,x,0],[[0,2.6],[.9,2.6]],12,t3Ic('#ffc93c',200),{top:t3Ic('#ffe48a',190)});
    t3Sph(mb,[0,9,5.4],2.2,t3Ic('#ffc93c',170),{nl:7,nb:5,w:.4})}
  else if(p.k==='gem'){t3Lathe(mb,[0,0,0],[[0,8],[2,7],[3.4,3]],12,t3Ic('#6a6a72'),{top:t3Ic('#8a8a92')});t3Shard(mb,[2,4,2],2.6,8,3,.3,[.08,-.18]);t3Shard(mb,[2,-4,2],2.4,7,2.6,1.1,[.06,.2]);t3Shard(mb,[-1,0,2.4],3.4,11,4,.6,[0,0])}
  else{t3Lathe(mb,[0,0,0],[[0,4.8],[1.2,6.2],[7,6.4],[9.6,4.6],[10.8,2.8],[11.6,3.2]],16,t3Ic('#7fd860',150),{top:t3Ic('#a0f080',140)});t3Lathe(mb,[0,0,11.2],[[0,2.6],[2.4,2.4],[3,1.6]],10,t3Ic('#a07a4a'),{top:t3Ic('#b88a5a')});
    t3Sph(mb,[3.4,-2.6,6],1.2,t3Ic('#ffffff',200),{nl:5,nb:4,w:0})}
  m=v3Up(mb);m.free=function(){v3Free(this)};t3IKeep(key,m);return m}
// ------------------------------------------------------------------ this frame: the lights (lanterns, braziers, the gate's mouth, lava, the
// treasure), the soft shadows, the glows that are added on top (flames, the lanterns' halos, the island's life), the clouds of the abyss
function t3IL(p,r,rgb,a){T3I.Lt.push([p,r,rgb,a])}
function t3ILights(){const tg=T3.tg,L=T3I.Lt.map(q=>[Math.hypot(q[0][0]-tg[0],q[0][1]-tg[1]),q]);L.sort((a,b)=>a[0]-b[0]);const uL=T3.uL||(T3.uL=new Float32Array(48)),uC=T3.uLC||(T3.uLC=new Float32Array(48));uL.fill(0);uC.fill(0);
  for(let k=0;k<Math.min(T3.low?7:12,L.length);k++){const[p,r,rgb,a]=L[k][1];uL[k*4]=p[0];uL[k*4+1]=p[1];uL[k*4+2]=p[2];uL[k*4+3]=r;uC[k*4]=rgb[0];uC[k*4+1]=rgb[1];uC[k*4+2]=rgb[2];uC[k*4+3]=a}}
function t3IGlow(p,r,rgb,a,hy){T3I.gw.push([p,r,rgb,a,hy||1])}
function t3IShadow(p,rx,ry,a){T3I.sh.push([p,rx,ry,a])}
const T3FS_ICL=`precision highp float;uniform sampler2D uTex;varying vec2 vT;varying vec4 vC;varying vec3 vW;varying vec2 vS;${T3SHADE}
void main(){vec4 t=texture2D(uTex,vT);float a=t.a*vC.a;if(a<.004)discard;gl_FragColor=vec4(fogIt(vC.rgb*(.8+.2*t.r),vW),a);}`;
const T3FS_ISKY=`precision mediump float;uniform vec3 uTop;uniform vec3 uBot;uniform vec3 uGlw;uniform float uT;uniform float uSh;uniform vec2 uRes;varying vec2 vU;
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 c=mix(uBot,uTop,smoothstep(.0,1.,vU.y));vec2 fc=gl_FragCoord.xy/uRes.y*70.+vec2(0.,uSh);vec2 g=floor(fc),l=fract(fc)-.5;float h=h1(g);
 if(h>.88){vec2 o=vec2(h1(g+3.1),h1(g+7.7))-.5;float d=length(l-o*.6);float tw=.55+.45*sin(uT*(1.+h*2.)+h*90.);c+=vec3(1.,.96,.86)*smoothstep(.1,.0,d)*tw*.75*smoothstep(.3,.8,vU.y);}
 float gl=exp(-pow(length((vU-vec2(.5,.08))*vec2(1.,1.5))*2.,2.));c+=uGlw*gl*.4;gl_FragColor=vec4(c,1.);}`;
function t3ISky(sk0,sk1,glw,t,v){const gl=T3.gl;if(!T3I.pSky)T3I.pSky=t3Prog(V3VS_POST,T3FS_ISKY,['aP']);const Q=T3I.pSky;gl.useProgram(Q.p);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
  gl.uniform3fv(Q.u.uTop,t3I01(sk0));gl.uniform3fv(Q.u.uBot,t3I01(sk1));gl.uniform3fv(Q.u.uGlw,glw);gl.uniform1f(Q.u.uT,t%1000);gl.uniform1f(Q.u.uSh,v*14);gl.uniform2f(Q.u.uRes,T3.cw,T3.ch);
  gl.bindBuffer(gl.ARRAY_BUFFER,T3.qb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);for(let k=1;k<8;k++)gl.disableVertexAttribArray(k);gl.drawArrays(gl.TRIANGLES,0,3);gl.depthMask(true);gl.enable(gl.DEPTH_TEST)}
function t3IShadows(){const S=T3I.sh;if(!S.length)return;const gl=T3.gl;if(!T3.pSh)T3.pSh=t3Prog(T3VS_BB,T3FS_SH,['aP','aQ','aT','aC']);
  for(const[p,rx,ry,a] of S)t3QW([[p[0]-rx,p[1]+ry,p[2]+.5],[p[0]+rx,p[1]+ry,p[2]+.5],[p[0]+rx,p[1]-ry,p[2]+.5],[p[0]-rx,p[1]-ry,p[2]+.5]],0,0,1,1,1,1,1,a);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);t3QFlush(T3.pSh,T3.glow);gl.disable(gl.POLYGON_OFFSET_FILL);gl.depthMask(true);gl.disable(gl.BLEND);S.length=0}
function t3IGlows(){const S=T3I.gw;if(!S.length)return;const gl=T3.gl;gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);
  for(const[p,r,c,a,hy] of S)t3Q(p[0],p[1],p[2],-r,-r*hy,r,r*hy,0,0,1,1,c[0]*a,c[1]*a,c[2]*a,1);t3QFlush(T3.pA,T3.glow);gl.depthMask(true);gl.disable(gl.BLEND);S.length=0}
function t3IDust(){const S=T3I.dust;if(!S.length)return;const gl=T3.gl,X=t3ITx();if(!T3I.pCl)T3I.pCl=t3Prog(T3VS_BB,T3FS_ICL,['aP','aQ','aT','aC']);
  for(const[p,r,a] of S)t3Q(p[0],p[1],p[2],-r,-r*.8,r,r*.8,0,0,1,1,.89,.83,.72,a);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);t3QFlush(T3I.pCl,X.cloud);gl.depthMask(true);gl.disable(gl.BLEND);S.length=0}
function t3IClouds(v,t,fog){if(LOWFX)return;const gl=T3.gl,X=t3ITx();if(!T3I.pCl)T3I.pCl=t3Prog(T3VS_BB,T3FS_ICL,['aP','aQ','aT','aC']);const i0=Math.floor(v)-1;
  for(let i=i0;i<=i0+3;i++)for(let k=0;k<10;k++){const h=q=>t3IH(k*7+q,i*3.3+1.1),side=k%2?1:-1,x=side*(130+h(1)*420)+Math.sin(t*.05+k)*24,y=-(i*CNI_GAP+h(2)*CNI_GAP),z=-50-h(4)*170,r=120+h(5)*170,
      c=[Math.min(1,fog[0]*2+.1),Math.min(1,fog[1]*2+.1),Math.min(1,fog[2]*2+.12)];t3Q(x,y,z,-r,-r*.5,r,r*.5,0,0,1,1,c[0],c[1],c[2],.55+h(6)*.35)}
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);t3QFlush(T3I.pCl,X.cloud);gl.depthMask(true);gl.disable(gl.BLEND)}
// far rocks floating in the abyss, at both sides and below, a little of the world on them: they give the depth (hazy in the mist)
function t3IFarMesh(k){const key='far'+k;let m=T3I.M.get(key);if(m)return m;const mb=v3MB(),sd=k*3.7+1.3,Wd=CN_ISW[k%4+1];
  t3Lathe(mb,[0,0,0],[[-2.4,.3],[-1.9,.36],[-1.1,.74],[-.4,.96],[-.12,1.03],[0,1]],12,z=>z>-.1?t3Ic(Wd.edge):t3Ik(t3Ic(Wd.side),z<-1?.75:.95),{top:t3Ic(Wd.top),wob:(a,z)=>1+.16*Math.sin(a*3+sd)+.08*Math.sin(a*7+z*2)});
  if(k%2)t3Rock(mb,[.2,-.1,0],[.28,.24,.3],sd,t3Ic(Wd.stone),{nl:7,nb:4});else t3Ell(mb,[-.15,.1,.32],[.3,.3,.34],t3Ic(k%4===3?'#2f5a46':'#4a7a34'),{nl:8,nb:6});
  m=v3Up(mb);m.free=function(){v3Free(this)};t3IKeep(key,m);return m}
function t3IFar(v,t){const i0=Math.floor(v)-1,items=[];for(let i=i0;i<=i0+3;i++)for(let k=0;k<6;k++){const h=q=>t3IH(k*11+q,i*5.1+2.3),side=k%2?1:-1,s=16+h(1)*34,
    x=side*(230+h(2)*520),y=-(i*CNI_GAP+h(3)*CNI_GAP),z=-90+h(4)*150+Math.sin(t*.3+k+i)*3,a=h(5)*TAU+t*.02*(k%3-1),ca=Math.cos(a)*s,sa=Math.sin(a)*s;
    items.push({m:t3IFarMesh(k+i*2&7),M:v3M4([ca,sa,0],[-sa,ca,0],[0,0,s],[x,y,z]),out:.5})}
  t3Draw3(items,{})}
// ------------------------------------------------------------------ one island: its ground, its things, its guardian asleep (in 3D the Golem,
// the others painted by the game on a card in their place), its lights and glows, its life
function t3IIsland(i,t,L){const won=cnWon(i),op=cnOpenShown(i),M=t3IslM(i),c=t3IMP(M,[0,0,0]),q=t3IProj([c[0],c[1],-60]);if(!q||q[2]>T3.far*.8)return;
  {const SH=ISL.brA;if(SH&&SH.done&&SH.i+1===i&&SH.lit&&SH.litT<1&&!LOWFX){const c2=t3IMP(M,[0,0,40]),lc=cnIslW(i).light.split(',').map(v=>+v/255),u=SH.litT;t3IGlow(c2,140+160*u,lc,1.2*(1-u)*(1-u))}}
  const ms=t3IIslMesh(i,won,op),X=t3ITx(),ch=ms.ch,sd=i*1.7+.4,gz=p=>t3IGz(CNI_R,CNI_SY,sd,p),W=p=>t3IMP(M,[p[0],p[1],gz(p)+(p[2]||0)]);
  t3GDraw(ms.top,X.top[ch],{bump:1,tx:1/512,ty:1/512});t3GDraw(ms.cliff,X.rock,{bump:1.3,tx:1/256,ty:1/256});
  t3Draw3([{m:ms.deco,M,out:.42,tint:op?null:[.13,.14,.18,1],em:op?1:0}],{});
  if(!op){const g=IP(-92,-36);g[2]=gz(g);t3Draw3([{m:t3ILockMesh(),M:v3Mul(M,t3ITr(g[0],g[1],g[2])),out:.4}],{});return}
  // lights and glows of the island
  const Wd=cnIslW(i),fl=.85+.15*Math.sin(t*9+i)*Math.sin(t*5.3+i*2);
  {const g=W(IP(-92,-36));const ac=cnRgb(ARENAS[i].col).split(',').map(v=>+v/255);t3IGlow([g[0],g[1],g[2]+5],16,ac,.25)}
  if(won){const b=W(IP(-112,18));t3IGlow([b[0],b[1],b[2]+27],22*fl,[1,.55,.22],.6,1.2);t3IGlow([b[0],b[1],b[2]+24],7*fl,[1,.9,.55],1,1.8)}
  if(ch===1||ch===3)for(const[n,e] of CNI_LAMPS){const p=cnChain(n,e),w=W(p);t3IGlow([w[0],w[1],w[2]+19],9,[1,.8,.45],.45)}
  if(ch===2){const E=cnIslFallPt(i),S0=W([E[0]*.56,E[1]*.56]),vv=W(IP(64,-66,0));t3IGlow([vv[0],vv[1],vv[2]+30],18,[1,.45,.18],.5)}
  // the life: fireflies over the moss and the swamp, embers in the volcano, glints on the snow
  if(!LOWFX){const n=ch===2?14:ch===4?8:10;for(let k=0;k<n;k++){const h=q=>t3IH(k,sd+q),sx=(h(1)-.5)*210+Math.sin(t*(.21+h(2)*.2)+h(3)*6)*26,sy=(h(4)-.5)*130+Math.cos(t*(.17+h(5)*.18)+h(6)*6)*18;
      if(!cnOnIsl(sx,sy,.9))continue;if(ch===2){const u=(t*(.25+h(7)*.2)+h(8))%1,p=W([...IP(sx*.5+20,sy*.5-40),u*60]);t3IGlow(p,2.4*(1-u),[1,.55,.2],1.2*(1-u))}
      else if(ch===4){const b=Math.max(0,Math.sin(t*(1.3+h(9))+h(10)*9));if(b>.6){const p=W([...IP(sx,sy)]);p[2]+=1;t3IGlow(p,3*b,[.9,.95,1],b)}}
      else{const z=10+h(7)*28+Math.sin(t*(.8+h(8))+k)*5,b=Math.max(0,Math.sin(t*(.9+h(9)*.8)+h(10)*9));if(b*b>.05){const p=W([...IP(sx,sy),0]);p[2]+=z;t3IGlow(p,4.5,ch===1?[.7,1,.45]:[.9,1,.45],b*b*.9)}}}}
  // the guardian asleep
  const bt=cnBoss(i),MD=N3.meta&&N3.meta[bt],pb=W(CI_BOSS),face=Math.PI/2+.75,pp=(t*.18+i*.13)%1;if(!N3[bt])return;
  const sc=(MD&&MD.sc||1)*CNI_BOSS*.92;t3IShadow(pb,24*sc,15*sc,.4);
  if(bt==='golem'&&!T3GL.bad&&t3GK()){try{const R=t3GolemItems({id:'golem',anim:'idle',p:pp,o:{},sc,x:pb[0],y:pb[1],face},t3CharM(face,sc,pb[0],pb[1],pb[2]));t3Draw3(R.items,{})}catch(e){t3Err(e);T3GL.bad=true}}
  else{const bb=cnBossBox(bt,sc);t3Card(pb[0],pb[1],pb[2],[bb.x0,bb.y0,bb.x1,bb.y1],()=>N3[bt](pb[0],pb[1],face,'idle',pp,sc,{noFx:true}),{lit:1})}
  const hd=t3IProj([pb[0],pb[1],pb[2]+70*sc]);if(hd)T3I.zz.push([hd[0],hd[1],t3IKpx(hd[2])])}
// the mast of your banners (the bridges you finished: the arena each led to) on the island where the hero is: its foot of stones, the log
// that grows with them, the gold rings and knob; the banners waving east, the one just won coming up from the foot
function t3IPennant(col){const key='pn'+col;let m=T3I.M.get(key);if(m)return m;const mb=v3MB(),ac=t3Ic(col),band=t3Ik(ac,1.35),sign=t3Ic('#f6e7c4'),L=22,H=12;
  for(const[nn,dd] of[[[0,1,0],.2],[[0,-1,0],-.2]]){const pts=[[0,H/2],[L,H/2],[L-5,0],[L,-H/2],[0,-H/2]],c0=v3V(mb,[L*.4,dd,0],nn,ac),vs=pts.map(([x,z])=>v3V(mb,[x,dd,z],nn,ac));for(let k=0;k<vs.length;k++)v3T(mb,c0,vs[k],vs[(k+1)%vs.length]);
    t3IQ(mb,[1.5,dd*2,H/2-1.4],[L-2,dd*2,H/2-1.4],[L-2,dd*2,H/2-3],[1.5,dd*2,H/2-3],nn,band);const cc=[8,dd*2.2,-.6],cv0=v3V(mb,cc,nn,sign),R=[];for(let k=0;k<12;k++){const a=k/12*TAU;R.push(v3V(mb,[8+Math.cos(a)*3,dd*2.2,-.6+Math.sin(a)*3],nn,sign))}for(let k=0;k<12;k++)v3T(mb,cv0,R[k],R[(k+1)%12])}
  m=v3Up(mb);m.free=function(){v3Free(this)};t3IKeep(key,m);return m}
function t3IStds(i,t,L){const all=cnStdList();if(!all.length||!cnOpenShown(i))return;const ks=all.slice(-CI_STDN),n=ks.length,M=t3IslM(i),sd=i*1.7+.4,c=CI_STD,z0=t3IGz(CNI_R,CNI_SY,sd,c),T=ISL.stdT==null?9:ISL.stdT,
    er=LOWFX?1:cnEaseBack(clamp(T/.5,0,1)),NW=ISL.stdNew,h=38+15*n,top=h*er,wv=cnWind(t),W=cnBrW(i),stone=t3Ic(cnMixC(cnIslW(i).stone,'#6a6258',.3)),items=[],base=t3IMP(M,[c[0],c[1],z0]);
  if(!T3I.mast){const mb=v3MB();t3Lathe(mb,[0,0,0],[[0,7.4],[2.4,6.8],[4.4,4]],10,t3Ic('#8a8070'));v3Tube(mb,[[0,0,3.5],[0,0,1]],[2.5,1.8],t3Ic('#7a5634'),8);T3I.mast=v3Up(mb)}
  // (the log: a unit tube scaled to its height)
  if(!T3I.pole){const mb=v3MB();v3Tube(mb,[[0,0,0],[0,0,1]],[1,.75],t3Ic('#ffffff'),8);T3I.pole=v3Up(mb)}
  items.push({m:T3I.mast,M:t3ITr(base[0],base[1],base[2]),out:.4,tint:[stone[0]/138,stone[1]/128,stone[2]/112,1]});
  items.push({m:T3I.pole,M:v3M4([2.5,0,0],[0,2.5,0],[0,0,Math.max(1,top-3.5)],[base[0],base[1],base[2]+3.5]),out:.4,tint:t3I01(t3Ic(W.wood)).concat(1)});
  if(!T3I.knob){const mb=v3MB();t3Sph(mb,[0,0,0],1,t3Ic('#ffd84a'),{nl:10,nb:7});T3I.knob=v3Up(mb)}
  items.push({m:T3I.knob,M:v3M4([2.8,0,0],[0,2.8,0],[0,0,2.8],[base[0],base[1],base[2]+top+2.4]),out:.4});
  for(let j=0;j<n;j++){const kk=ks[j];let z=top-4-15*j;if(NW&&NW.k===kk){const u=clamp(NW.t/1.1,0,1);if(u<=0)continue;z=plerp(15,z,1-Math.pow(1-u,3))}if(z<15)continue;
    const a=(LOWFX?0:Math.sin(t*2.3+j*1.3+kk*.7)*.22*(.5+wv)),ca=Math.cos(a),sa=Math.sin(a),sk=1+.06*Math.sin(t*3.1+j);items.push({m:t3IPennant(ARENAS[kk].col),M:v3M4([ca*sk,sa*sk,0],[-sa,ca,0],[0,0,1],[base[0]+1.6,base[1],base[2]+z]),out:.3})}
  t3Draw3(items,{});const q=t3IProj([base[0],base[1],base[2]+h*.55]);if(q)(ISL.prz||(ISL.prz=[])).push({x:q[0],y:q[1],r:Math.max(24*L.dpr,h*.42*t3IKpx(q[2])),txt:cnStdTxt(all)})}
// the bridge after island i: its pieces, the planks laid, the lanterns lit as the planks reach them, the prizes on the balconies
function t3IBridge(i,t,L){if(!ARENAS[i+1])return;const B=t3IBridgeMesh(i),G0=B.G0,M=t3PathM(i),X=t3ITx(),laid=cnBrLaidNow(i),A=ISL.brA&&ISL.brA.i===i?ISL.brA:null,DZ=n=>cnDeckZ(G0,n),Lc=t3L();
  const items=[{m:B.frame,M,out:.4,tex:X.wood},{m:B.posts,M,out:.38,tex:X.wood},{m:B.ropes,M,out:.26},{m:B.towers,M,out:.44,tex:X.bark},{m:B.balc,M,out:.4,tex:X.wood}];
  // (the planks landed a moment ago settle with a little dip: drawn on their own until they are still)
  let still=Math.min(G0.N,laid);const bn=A&&A.bn?Object.keys(A.bn).map(Number).filter(g=>g<laid):[];if(bn.length)still=Math.min(still,Math.min(...bn));
  if(still>0)items.push({m:B.planks,M,out:.36,tex:X.wood,count:still*B.per});
  for(let g=still;g<Math.min(G0.N,laid);g++){const b=A&&A.bn&&A.bn[g],u=b?Math.min(1,b.t/(CN_SHOW.bnc*A.sp)):1,n=cnPlankN(G0,g),dz=-1.6*Math.sin(u*Math.PI)*(1-u)-(b&&!b.nail?.6:0),sl=Math.atan2(DZ(n+G0.pitch*.5)-DZ(n-G0.pitch*.5),G0.pitch),cs=Math.cos(sl),ss=Math.sin(sl),
      w=t3IW(i,n,(t3IH(g,i*3.1+5.7)-.5)*2.6,DZ(n)-(CNB.pt+.8)/2+dz);items.push({m:t3IPlankMesh(i,g),M:v3Mul(t3ITr(w[0],w[1],w[2]),v3M4([1,0,0],[0,cs,ss],[0,-ss,cs],[0,0,0])),out:.36,tex:X.wood})}
  if(A&&A.fx)for(const f of A.fx){if(f.t<0)continue;const u=f.t/f.T;
    if(f.k==='puff'){const w=t3IW(i,f.n+f.vn*f.t,f.e+f.ve*f.t,f.z+f.vz*f.t);T3I.dust.push([w,(f.r+u*5)*1.3,.55*(1-u)])}
    else if(f.k==='spark'&&!LOWFX){for(const sg of[-1,1]){const e=sg*(CNB.hw-3);for(let j=0;j<4;j++){const a=(j-1.5)*.55+sg*.4,w=t3IW(i,f.n+Math.sin(a)*u*9,e+sg*Math.cos(a)*u*4,DZ(f.n)+1+Math.cos(a)*u*9);t3IGlow(w,1.9,[1,.82+j*.04,.5],1.4*(1-u))}}}}
  // the planks in flight (the show): from your island, low over the ones laid, turning on the way, flattening into their places
  if(A&&A.fl&&A.fl.length){const T=CN_SHOW.fly*A.sp;for(const f of A.fl){const u=Math.min(1,f.t/T),e=1-Math.pow(1-u,3),n1=cnPlankN(G0,f.g),n0=n1-150-60*f.s,side=f.g%2?1:-1,n=plerp(n0,n1,e),
      ee=side*(12+10*f.s)*(1-e),z=plerp(DZ(n0)+22,DZ(n1),e)+9*Math.sin(Math.PI*e),spin=side*(1-e)*1.5,roll=(1-e)*1.1,cs=Math.cos(spin),ss=Math.sin(spin),cr=Math.cos(roll),sr=Math.sin(roll);
      const R=v3Mul(v3M4([cs,ss,0],[-ss,cs,0],[0,0,1],[0,0,0]),v3M4([1,0,0],[0,cr,sr],[0,-sr,cr],[0,0,0])),w=t3IW(i,n,ee,z-(CNB.pt+.8)/2);
      items.push({m:t3IPlankMesh(i,f.g),M:v3Mul(t3ITr(w[0],w[1],w[2]),R),out:.36,tex:X.wood});if(!LOWFX)t3IGlow([w[0],w[1],w[2]+2],10+8*(1-e),[1,.88,.6],.35*Math.min(1,u*5)*(1-e*.7))}}
  // the lanterns: on the posts (hanging from their arms), on the balconies' arches (standing), on the towers' arms
  const fl=k=>.88+.12*Math.sin(t*8+k*1.7)*Math.sin(t*5.1+k);
  for(const[k,q] of cnBrLamps(G0).entries()){const lit=laid>=q.g,dz=DZ(q.n),w=q.post?t3IW(i,q.n,q.e,dz+CNB.ph-2.6):t3IW(i,q.n,q.e,dz+51.6);items.push({m:t3ILampMesh(lit),M:t3ITr(w[0],w[1],w[2]),out:.3});
    if(lit){t3IGlow([w[0],w[1],w[2]-7],8*fl(k),[1,.8,.45],.55)}}
  for(const s of[-1,1]){const w=t3IW(i,B.nT,s*(CNB.pe+20),90.4);items.push({m:t3ILampMesh(true),M:t3ITr(w[0],w[1],w[2]),out:.3});t3IGlow([w[0],w[1],w[2]-7],9*fl(s+5),[1,.8,.45],.6)}
  // the prizes on the balconies (a third bigger), bobbing; their labels and where a tap finds them
  for(let b=0;b<3;b++){const j=b+1;if(cnPrizeTaken(i,j)&&!(A&&A.pop&&A.pop.p.j===j))continue;const c=G0.Z[b],p=cnBrPrize(i,j),dz=DZ(c),ps=4/3,pop=A&&A.pop&&A.pop.p.j===j?A.pop:null,
      bob=LOWFX?0:Math.sin(t*2.2+j*1.7)*1.3,sw=pop?1+.35*Math.sin(Math.min(1,pop.t/.3)*Math.PI*.5):1,w=t3IW(i,c,-CNB.bal,dz+3.2+bob),ang=-.45+Math.sin(t*.6+j)*.12,ca=Math.cos(ang)*ps*sw,sa=Math.sin(ang)*ps*sw;
    items.push({m:t3IPrizeMesh(p,false),M:v3M4([ca,sa,0],[-sa,ca,0],[0,0,ps*sw],w),out:.4});
    const pc=cnRgb(cnPrizeCol(p)).split(',').map(v=>+v/255);if(!LOWFX)t3IGlow([w[0],w[1],w[2]+8],16,pc,.18+.06*Math.sin(t*3+j));
    t3IPrizeTap(i,j,p,w,30*ps,L)}
  t3Draw3(items,{})}
// a prize's place on the screen: its label above it (fading under the name of the arena), the tap, where the show makes it burst
function t3IPrizeTap(i,j,p,w,top,L){const q=t3IProj(w),qt=t3IProj([w[0],w[1],w[2]+top]);if(!q||!qt)return;const k=t3IKpx(q[2]),d=L.dpr,T4=p.k==='tesoro';
  (ISL.przAt||(ISL.przAt={}))[i+'_'+j]=[q[0],q[1]-14*k,k];const la=clamp((qt[1]-L.titleB-18*d)/(26*d),0,1)*clamp((L.info-qt[1])/(30*d),0,1);
  if(la>.02&&!(ISL.brA&&ISL.brA.pop&&ISL.brA.pop.p.j===j&&ISL.brA.i===i)){T3I.lab.push([qt[0],qt[1],p,la]);
    (ISL.prz||(ISL.prz=[])).push({x:q[0],y:q[1]-18*k,r:Math.max(26*d,(T4?32:26)*k),txt:`${T4?'Tesoro del traguardo':'Premio del ponte'}: ${cnPrizeTxt(p)} · tuo a ${cnBrTh(i,j)} assi (ne hai ${cnBrHave(i)})`})}}
// the little island after i and its stones
function t3IMini(i,t,L){if(!ARENAS[i+1])return;const M=t3IslM(i,CNI_MN),c=t3IMP(M,[0,0,0]),q=t3IProj([c[0],c[1],-40]);if(!q||q[2]>T3.far*.8)return;
  const up=cnMiniUp(i),ms=t3IMiniMesh(i,up),X=t3ITx(),sd=cnMiniSd(i),gz=p=>t3IGz(CNI_MR,CNI_MSY,sd,p),W=p=>t3IMP(M,[p[0],p[1],gz(p)+(p[2]||0)]),j=i+1,ac=ARENAS[j].col,Lc=t3L(),A=ISL.brA&&ISL.brA.i===i?ISL.brA:null;
  t3GDraw(ms.top,X.top[ms.ch],{bump:1,tx:1/512,ty:1/512});t3GDraw(ms.cliff,X.rock,{bump:1.3,tx:1/256,ty:1/256});
  const items=[{m:ms.deco,M,out:.4}];
  // the banner: rolled up until the checkpoint is reached, then unrolled
  {const pc=cnChain(CNM_POLE[0],CNM_POLE[1]),p=W([pc[0],pc[1]]),u=Math.max(.06,up),ca=Math.cos(CN_NA+Math.PI),sa=Math.sin(CN_NA+Math.PI),Mf=v3Mul(M,v3M4([ca,sa,0],[-sa,ca,0],[0,0,u],[pc[0],pc[1],gz(pc)+CNM_PH-4]));items.push({m:t3IFlagMesh(ac),M:Mf,out:.3})}
  // the treasure on the altar (open and empty once taken)
  {const took=cnPrizeTaken(i,4),ap=cnChain(CNM_ALT[0],CNM_ALT[1]),w=W([ap[0],ap[1],8.4]),p=cnBrPrize(i,4),pop=A&&A.pop&&A.pop.p.j===4?A.pop:null,o=took?1:pop?Math.min(1,pop.t/.5):0,s=1.45,ang=-.3,ca=Math.cos(ang)*s,sa=Math.sin(ang)*s;
    items.push({m:t3IPrizeMesh({k:'tesoro',t:p.t},o>.5),M:v3M4([ca,sa,0],[-sa,ca,0],[0,0,s],w),out:.42});
    if(!took){if(!LOWFX)t3IGlow([w[0],w[1],w[2]+12],26,[1,.82,.4],.22+.06*Math.sin(t*2.4));t3IPrizeTap(i,4,p,w,40,L)}}
  if(up>.5)for(const s of[-1,1]){const rN=cnMiniRim(i,true),b=W(cnChain(rN-15,s*24)),f=.85+.15*Math.sin(t*9+s)*Math.sin(t*5.3+s*2);t3IGlow([b[0],b[1],b[2]+25],18*f,[1,.55,.22],.55,1.2);t3IGlow([b[0],b[1],b[2]+22],6*f,[1,.9,.55],.9,1.8)}
  // the stones to the next island: under, in the dark, until the checkpoint; then they rise one by one
  const G0=cnBrGeo(i);for(const s of G0.st){const u=cnStoneUp(i,s.j),z=-(1-u)*(1-u)*110+(LOWFX?0:Math.sin(t*.8+s.j)*1.2),w=t3IW(i,s.n,s.e,z);items.push({m:t3IStoneMesh(i,s.j,s.r),M:t3ITr(w[0],w[1],w[2]),out:.36,tint:u<.99?[.4+.6*u,.4+.6*u,.45+.55*u,1]:null})}
  t3Draw3(items,{})}
// ------------------------------------------------------------------ the hero (in 3D, his own model: idle on his island with the stick of moss in
// his mouth, walking over the bridges and the stones, jumping far), his companions as cards beside him
function t3IHeroCap(face,ph,mv){if(!T3E.dc){const c=document.createElement('canvas');c.width=c.height=2;T3E.dc=c.getContext('2d')}T3E.cap=[];const sv=ctx,ns=noShadow,mo=typeof mossOn!=='undefined'?mossOn:0;ctx=T3E.dc;noShadow=true;mossOn=1;
  try{drawRig(0,0,face,ph,mv,heroStyle(),{})}catch(e){t3Err(e)}finally{ctx=sv;noShadow=ns;mossOn=mo}const c=T3E.cap;T3E.cap=null;return c.length?c[c.length-1]:null}
// the island's ground under a point of the path (its islands, the little island; on the bridges the path has its own height)
function t3IGzPath(lo,n,e){let i=lo,nn=n;while(nn>CNI_GAP*.5&&ARENAS[i+1]){nn-=CNI_GAP;i++}if(Math.abs(nn)<CNI_R*1.1){const p=cnChain(nn,e);return t3IGz(CNI_R,CNI_SY,i*1.7+.4,p)}
  const m=nn-CNI_MN;if(Math.abs(m)<CNI_MR*1.1){const p=cnChain(m,e);return t3IGz(CNI_MR,CNI_MSY,cnMiniSd(i),p)}return 0}
function t3IStick(){if(T3I.stick)return T3I.stick;const mb=v3MB();v3Tube(mb,[[0,0,0],[.7,0,0],[1,0,0]],[1,1,.9],t3Ic('#5fae3a'),6);t3Sph(mb,[1,0,0],1.05,t3Ic('#b8ff7a',120),{nl:6,nb:4,w:0});return T3I.stick=v3Up(mb)}
function t3IHero(L,t){const J=ISL.jump,SH=ISL.brA;let w,face=Math.PI/2-.2,ph=0,mv=false,al=1,sc=CNI_HERO*.86,idle=false;CAMP.hero=null;
  const homeW=i=>{const p=CI_HERO,z=t3IGz(CNI_R,CNI_SY,i*1.7+.4,p);return t3IMP(t3IslM(i),[p[0],p[1],z])};
  if(J&&J.way){const W=J.way,u=Math.min(1,J.t/J.dur),dd=cnWayDD(J),p=cnWayAt(W,dd);w=t3IW(W.lo,p[0],p[1],p[2]+(p[2]>.5?0:t3IGzPath(W.lo,p[0],p[1])));face=J.fs!=null?J.fs:face;ph=dd*.046*Math.min(1,300/Math.max(1,W.len/J.dur));mv=u<.985}
  else if(J){const u=Math.min(1,J.t/J.dur),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,a=homeW(J.a),b=homeW(J.b);w=[plerp(a[0],b[0],e),plerp(a[1],b[1],e),plerp(a[2],b[2],e)+Math.sin(u*Math.PI)*260];mv=true;ph=u*6}
  else if(SH&&SH.at==='mini'){const n=CNM_HERO[0],e=CNM_HERO[1],p=cnChain(n,e);w=t3IMP(t3IslM(SH.i,CNI_MN),[p[0],p[1],t3IGz(CNI_MR,CNI_SY,cnMiniSd(SH.i),p)]);idle=true}
  else{w=homeW(ISL.cur);idle=true}
  if(CAMP.walk>0&&!J){const q=Math.min(1,(t-CAMP.walk)/1.4),g=t3IMP(t3IslM(ISL.cur),[...IP(-92,-36),0]);w=[plerp(w[0],g[0],q),plerp(w[1],g[1],q),w[2]];face=Math.atan2(g[1]-w[1],g[0]-w[0]);mv=true;ph=q*5;al=q<.7?1:Math.max(0,1-(q-.7)/.3);idle=false}
  // (idle: the home's own little life, as in 94: breathing, looking about, a hop now and then)
  let hop=0;if(idle){const look=Math.sin(t*.37)*.42+Math.sin(t*.13)*.2,k=(t+2.1)%8;hop=k<.42?Math.sin(k/.42*Math.PI)*3.2*sc:0;face=Math.PI/2-.2+look}
  const c=t3IHeroCap(face,ph,mv);if(!c||al<=.02)return;const pos=[w[0],w[1],w[2]+hop];
  const cap={x:pos[0],y:pos[1],lz:pos[2],face:c.face,anim:c.anim,p:c.p,sc:sc/T3CHK,o:c.o,al:al};
  const dS=G.state,dT=G.deathT;G.deathT=null;let H;try{H=t3HeroItems(cap)}catch(e){t3Err(e);return}finally{G.state=dS;G.deathT=dT}
  t3IShadow([w[0],w[1],w[2]],12*sc*.8,7*sc*.8,.42*al);
  // the stick of moss in his mouth (the home only), glowing at its tip
  if(!H.imp&&idle){const R=H.R,HH=R.head,yr=HH.yaw-H.a,cy=Math.cos(yr),sy=Math.sin(yr),cn=Math.cos(HH.nod),sn=Math.sin(HH.nod),{nrm,add,mul,cross}=RG,
      hl=v=>{v=nrm(v);const x=v[0]*cn+v[2]*sn,y=v[1],z=-v[0]*sn+v[2]*cn;return nrm(v3Dir(H.MF,[x*cy-y*sy,x*sy+y*cy,z]))},rr=R.Rh*sc,mo=add(H.Hw,mul(hl([1,-.13,-.12]),rr*.97)),fw=hl([1,0,0]),rt=hl([0,1,0]),up=hl([0,0,1]),
      dir=nrm(add(add(mul(fw,.8),mul(rt,-.5)),mul(up,-.18))),len=rr*.85,X=mul(dir,len),Y=mul(nrm(cross(dir,up)),.16*sc),Z=mul(nrm(cross(Y,dir)),.16*sc);
    H.items.push({m:t3IStick(),M:v3M4(X,Y,Z,add(mo,mul(dir,-len*.15))),out:.25});const tip=add(mo,mul(dir,len*.85));if(!LOWFX)t3IGlow(tip,3.6,[.55,1,.35],.5)}
  t3Draw3(H.items,{H:H.imp?null:{R:H.R,MF:H.MF,a:H.a,Hw:H.Hw},al:al<.99?Math.max(.3,al):1});
  if(H.imp)t3HeadCard(H.R,H.Hw,H.a);
  // his companions beside him (cards: their own drawings)
  if(SAVE.pets&&!J)petEq().forEach((id,k)=>{const s=k?-1:1,pw=[w[0]+s*24,w[1]+4,w[2]],ps=sc*.5;t3IShadow(pw,9*ps,4*ps,.3);t3Card(pw[0],pw[1],pw[2],[-26*ps,-40*ps,26*ps,14*ps],()=>{ctx.save();ctx.translate(pw[0],pw[1]);ctx.scale(ps,ps);drawPetSprite(id,0,0,{t:t+k*.7,face:k?0:Math.PI,moving:false,att:0,happy:0,hop:0});ctx.restore()},{lit:1})});
  if(idle&&al>.99){const q=t3IProj(w);if(q){const s=t3IKpx(q[2])*sc;CAMP.hero={x:q[0],y:q[1],w:18*s,h:50*s,dpr:L.dpr}}}}
// ------------------------------------------------------------------ the frame of the islands in 3D: 94's own steps (the finger, the camera,
// the jumps, the show), then the picture, then 94's words over it
function t3IslFrame(dt){const t0=performance.now();campResize();CAMP.t+=dt;const t=CAMP.t;if(G)G.t=t;const L=ISL.lay=cnIslLay();ISL.prz=[];
  if(ISL.cur==null)cnIslSync(false);
  cnIslStep(dt,L);
  {const gp=Math.floor((t+3)/11);if(ISL.gp!==gp){if(ISL.gp!=null&&!LOWFX&&prH(gp,5)<.66)cnBrSnd('vento');ISL.gp=gp}}
  t3Place('menu');T3I.seen++;T3I.live=true;if(T3.cv.style.display==='none')T3.cv.style.display='block';
  const v=ISL.view,i0=Math.max(0,Math.floor(v)),i1=Math.min(ARENAS.length-1,i0+1),f=v-i0,A=cnIslW(i0),B=cnIslW(i1),key=T3.luce,keep=T3LUCI[key],lean=T3.lean,outK=T3.outK;
  // the light of the islands: the chosen one, its mist the colour of the abyss of the world you look at
  const sk0=t3Im(t3Ic(A.sky[0]),t3Ic(B.sky[0]),f),sk1=t3Im(t3Ic(A.sky[1]),t3Ic(B.sky[1]),f),wf=t3Im(A.fog.split(',').map(Number),B.fog.split(',').map(Number),f),
    fog=t3I01(t3Im(t3Im(sk0,sk1,.62),wf,key==='film'?.16:.26)),glw=t3I01(t3Im(cnIslW(f<.5?i0:i1).light.split(',').map(Number),[0,0,0],key==='film'?.35:.5));
  T3LUCI[key]=Object.assign({},keep,{fog,mist:keep.mist*.5});T3.lean=0;
  try{t3IslSize();t3IslCam(L,t);T3.fogP=[560,1500,.93];t3IslDraw(L,t,v,sk0,sk1,glw,fog)}
  finally{T3LUCI[key]=keep;T3.lean=lean;T3.outK=outK}
  // over it, on the menu's canvas: the labels of the prizes, the guardian's z, 94's words
  const saved=ctx;ctx=campX;try{ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,L.W,L.H);t3IslOver(L,t,A,B,f,v)}finally{ctx.setTransform(1,0,0,1,0,0);ctx=saved}
  ISL.pv=ISL.view;T3I.ms=T3I.ms?T3I.ms*.9+(performance.now()-t0)*.1:performance.now()-t0}
function t3IslDraw(L,t,v,sk0,sk1,glw,fog){const gl=T3.gl;T3.frame++;T3.nMesh=0;T3.nCard=0;T3I.lab=[];T3I.zz=[];T3I.Lt=[];T3I.gw.length=0;T3I.sh.length=0;
  gl.bindFramebuffer(gl.FRAMEBUFFER,T3.fbo);gl.viewport(0,0,T3.cw,T3.ch);gl.clearColor(fog[0],fog[1],fog[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  t3ISky(sk0,sk1,glw,t,v);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
  const vr=Math.round(v),list=[];for(let i=Math.min(ARENAS.length-1,vr+2);i>=Math.max(0,vr-1);i--)list.push(i);
  // (the lights first: they light everything; the meshes of this frame add theirs before they are drawn, so collect, then draw)
  t3IPreLights(list,t);t3ILights();
  t3CardsBegin();
  if(!LOWFX)t3IFar(v,t);
  for(const i of list){t3IIsland(i,t,L);if(i===(ISL.stdI==null?ISL.cur:ISL.stdI))try{t3IStds(i,t,L)}catch(e){t3Err(e)}if(ARENAS[i+1]){t3IBridge(i,t,L);t3IMini(i,t,L)}}
  t3IHero(L,t);
  t3IShadows();t3CardsEnd();
  t3IClouds(v,t,fog);t3IDust();t3IGlows();
  gl.disable(gl.BLEND);gl.depthMask(true);
  t3Post({hit:0,low:0,fade:0})}
// the lights must be known before the first mesh is drawn: a quick pass that only places them (the same places as the drawing)
function t3IPreLights(list,t){T3I.Lt=[];const Lc=t3L(),fl=.85+.15*Math.sin(t*9)*Math.sin(t*5.3);
  for(const i of list){const op=cnOpenShown(i),M=t3IslM(i),sd=i*1.7+.4,W=p=>t3IMP(M,[p[0],p[1],t3IGz(CNI_R,CNI_SY,sd,p)+(p[2]||0)]),ch=ARENAS[i].ch||1;if(!op)continue;
    {const g=W(IP(-92,-36));t3IL([g[0],g[1],g[2]+6],80,cnRgb(ARENAS[i].col).split(',').map(v=>+v/255),.5)}
    if(cnWon(i)){const b=W(IP(-112,18));t3IL([b[0],b[1],b[2]+26],150*fl,[1,.58,.26],.95*Lc.torch)}
    if(ch===1||ch===3)for(const[n,e] of CNI_LAMPS){const w=W(cnChain(n,e));t3IL([w[0],w[1],w[2]+19],100,[1,.8,.45],.7*Lc.torch)}
    if(ch===2){const E=cnIslFallPt(i),S0=W([E[0]*.56,E[1]*.56]);t3IL([S0[0],S0[1],S0[2]+8],120,[1,.45,.18],.8)}
    if(!ARENAS[i+1])continue;const G0=cnBrGeo(i),laid=cnBrLaidNow(i),nT=cnIslRim(i,true)-6;
    for(const s of[-1,1]){const w=t3IW(i,nT,s*(CNB.pe+20),83.4);t3IL(w,150,[1,.74,.38],.9*Lc.torch)}
    for(const q of cnBrLamps(G0))if(laid>=q.g){const dz=cnDeckZ(G0,q.n),w=q.post?t3IW(i,q.n,q.e,dz+CNB.ph-9.6):t3IW(i,q.n,q.e,dz+44.6);t3IL(w,110,[1,.76,.4],.8*Lc.torch)}
    if(cnMiniUp(i)>.5){const Mm=t3IslM(i,CNI_MN),rN=cnMiniRim(i,true);for(const s of[-1,1]){const p=cnChain(rN-15,s*24),b=t3IMP(Mm,[p[0],p[1],0]);t3IL([b[0],b[1],b[2]+24],120,[1,.58,.26],.85*Lc.torch)}}
    if(!cnPrizeTaken(i,4)){const ap=cnChain(CNM_ALT[0],CNM_ALT[1]),w=t3IMP(t3IslM(i,CNI_MN),[ap[0],ap[1],20]);t3IL(w,90,[1,.85,.4],.7)}}}
// over the 3D: the prizes' labels, the guardian's sleep, the fade under the island, the Incubo, the snow, 94's words, the show's title
function t3IslOver(L,t,A,B,f,v){const d=L.dpr;
  for(const[x,y,k] of T3I.zz){const op=cnOpenShown(Math.round(v));if(!op)break;for(let j=0;j<3;j++){const u=((t*.35+j/3)%1),zx=x-8*k+u*16*k+Math.sin(u*5+j)*4*k,zy=y-(u*40)*k;ctx.save();ctx.globalAlpha=Math.sin(u*Math.PI)*.85;
    ctx.font=`${Math.round((8+u*6)*k)}px "Lilita One", sans-serif`;ctx.textAlign='center';ctx.lineWidth=2*d;ctx.strokeStyle=INK;ctx.strokeText('z',zx,zy);ctx.fillStyle='#e8f0ff';ctx.fillText('z',zx,zy);ctx.restore()}}
  for(const[x,y,p,a] of T3I.lab)cnPrizeLabel(x,y,p,d,a);
  {const SA=ISL.brA;if(SA&&SA.fx)for(const f of SA.fx){if(f.t<0)continue;const u=f.t/f.T;
    if(f.k==='burst'){const s=f.s;ctx.save();ctx.globalCompositeOperation='lighter';if(!LOWFX){glow(f.col,f.x,f.y,(30+u*40)*s,.7*(1-u));ctx.strokeStyle=`rgba(${f.col},${(.9*(1-u)).toFixed(2)})`;ctx.lineWidth=3*s*(1-u)+1;
        for(let j=0;j<10;j++){const a=j/10*TAU+SA.i,r0=(8+u*30)*s,r1=(14+u*46)*s;ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0*.7);ctx.lineTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1*.7);ctx.stroke()}}
      ctx.strokeStyle=`rgba(255,250,220,${(1-u).toFixed(2)})`;ctx.lineWidth=2*s;ctx.beginPath();ctx.ellipse(f.x,f.y,(10+u*42)*s,(6+u*26)*s,0,0,TAU);ctx.stroke();ctx.restore()}
    else if(f.k==='drop'){const x=f.x+f.vx*f.t,y=f.y+f.vy*f.t+.5*f.g*f.t*f.t,s=f.s;ctx.save();ctx.globalAlpha=Math.min(1,(1-u)*3);ctx.translate(x,y);ctx.rotate(f.r+f.t*6);ctx.fillStyle=f.c;ctx.strokeStyle=INK;ctx.lineWidth=.9*s;ctx.beginPath();
      if(f.gem){ctx.moveTo(0,-3.2*s);ctx.lineTo(2.4*s,0);ctx.lineTo(0,3.2*s);ctx.lineTo(-2.4*s,0);ctx.closePath()}else ctx.ellipse(0,0,2.8*s,Math.max(.4,2.8*s*Math.abs(Math.cos(f.t*9+f.r))),0,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
    else if(f.k==='txt'){ctx.save();ctx.globalAlpha=Math.min(1,(1-u)*2.5);ctx.font=`${Math.round(14*d)}px "Lilita One", sans-serif`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3.4*d;ctx.strokeStyle=INK;
      const y=f.y-(16+u*40)*d;ctx.strokeText(f.txt,f.x,y);ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,y);ctx.restore()}}}
  cnIslFadeLow(Object.assign({},L,{info:L.info+16*d}),A,B,f);
  if(cnIncView())cnIncSky(L,t,1-Math.min(1,Math.abs(v-Math.round(v))*2.2));
  const i0=Math.max(0,Math.floor(v)),i1=Math.min(ARENAS.length-1,i0+1),ice=(ARENAS[i0].ch===4?1-f:0)+(ARENAS[i1].ch===4?f:0);cnSnow(L,t,ice,v,true);
  cnIslText(L,t);if(ISL.brA&&ISL.brA.ttl)cnShowTitle(L,t,ISL.brA);cnPlayLbl()}
// 94's frame of the islands: in 3D when the 3D can, else as always
{const _ci=cnIsles;cnIsles=function(dt){if(!t3IslOk()){if(T3I.live){T3I.live=false;if(T3.cv)T3.cv.style.display='none'}return _ci.apply(this,arguments)}
  try{t3IslFrame(dt)}catch(e){t3Err(e);T3I.bad=true;T3I.live=false;if(T3.cv)T3.cv.style.display='none';const s=ctx;ctx=campX;try{ctx.setTransform(1,0,0,1,0,0)}finally{ctx=s}return _ci.call(this,0)}}}
