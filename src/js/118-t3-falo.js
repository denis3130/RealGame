// =====================================================================
// 118. MOSSBOUND TRIPLA A · IL FALÒ DEL MENU ZOMBIE IN 3D (anteprima a parte, con 105, 106, 110–117).
// Denis (2 novembre), fra le parti del menu: «Menu Zombie»; poi (3 novembre): «miglioralo non mi piace», «Falò del menu Zombie, rifai tutto
// meglio», «Sembra di plastica, Inquadratura», «Rifinisco il 3D». Rifatto da capo: tutta la scena è in 3D vero (non più il dipinto di 66 come
// fondale) e dipinta come il gioco, non di plastica: ogni pezzo ha il disegno del suo materiale (corteccia, assi, pietra, intonaco, tegole,
// tela, ferro, terra, erba, legno bruciato) preso dal posto dove sta (triplanare, tre toni chiari che il colore del pezzo tinge), la luce della
// luna in due toni con l'orlo sfrangiato come una pennellata, la luce del fuoco a fasce morbide, l'orlo freddo della luna sui bordi, le cime
// più chiare, il buio alla base delle cose, il contorno scuro spesso. La telecamera è più lontana e più bassa: l'eroe seduto sul tronco un po'
// più piccolo, il fuoco alla sua destra, e dietro di loro la notte intera: il prato con l'erba alta, la staccionata rotta, le tombe, il
// sentiero dove passano gli zombie in 3D (106: camminano, si fermano, si girano di scatto verso di te col verso, ripartono; gli occhi che
// brillano), lo spaventapasseri che ogni tanto gira la testa e la piega troppo di lato, la fattoria in rovina col tetto sfondato e una
// finestra accesa, il mulino con le pale che girano (una è rotta), l'albero morto, le colline con la cappella in rovina, la luna con l'alone,
// le nuvole che le passano davanti, le stelle, i corvi in volo e sui pali, la nebbia bassa sul prato. Il campo: il tronco col taglio e gli
// anelli, il muschio e i funghetti, la tenda di tela, lo zaino con la coperta, la pala piantata, il ceppo con l'ascia, la catasta, la cassa
// delle munizioni coi bossoli, la lanterna spenta, il pentolino col vapore, la pistola appoggiata al tronco (ARMI3D); il fuoco: le pietre, la
// cenere, i ceppi a capanna con le crepe di brace, le fiamme a lingue (rosse, arancio, gialle, il cuore bianco), le scintille, il fumo, la
// luce che trema su tutto quello che ha vicino. La prima volta la scena si prepara a pezzetti (anche durante il passaggio tra le modalità):
// intanto resta il disegno di 66. LOWFX: niente nebbia, fumo, corvi in volo, meno scintille.
// =====================================================================
const T3F={on:true,bad:false,ready:false,q:null,zq:null,zok:{},X:{},cv:{},S:[],G:{},Z:[],zT:0,zInit:0,cr:[],crT:6,perch:[],sp:[],sm:[],ms:0,hy:0,top:0,zW:160,
  sc:{st:'idle',t:0,next:7,yaw:0,tilt:0,glow:0},bladeA:0,prof:null};
function t3FaloOk(){return T3F.on&&!T3F.bad&&T3F.ready&&t3IslOk()}
// the places (the hero sits at 0,0; x east, y toward us, z up; the hero is ~40 tall sitting)
const T3FL={fire:[21,13],seat:7.4,fence:-200,path:-244,lamp:[46,-268],farm:[-58,-600],mill:[136,-740],scare:[88,-318],tree:[-76,-96]};
// the camera: the hero's size against 66's drawing (k), how far above HOME_Y the camp sits (up, in hs), the horizon's place between the top
// bar and the hero (hor), the bounds of the tilt
const T3FC={fovy:50,k:.7,up:4,hor:.24,p0:9,p1:22,tz:6};
// the two lights: the night of the camp (the sky and the earth dark and cool, the moon behind on the right, the fire does the rest)
const T3F_LUCE={chiara:{sky:[.15,.19,.27],gnd:[.06,.055,.05],key:[.3,.37,.46],keyD:[.42,-.8,.32],fog:[.085,.11,.14],mist:.5,torch:1.25,bloom:.7,thr:.7,sat:1.14,con:.08,warm:.035,vig:.32,grain:.012,ink:1,
    top:'#060a16',mid:'#122038',hor:'#2e4a4c',fire:1.45},
  film:{sky:[.09,.11,.17],gnd:[.03,.03,.035],key:[.27,.35,.5],keyD:[.45,-.8,.3],fog:[.05,.065,.088],mist:.6,torch:1.6,bloom:1,thr:.6,sat:1.06,con:.18,warm:.06,vig:.46,grain:.024,ink:1,
    top:'#03050c',mid:'#0a1324',hor:'#223a3a',fire:1.75}};
const t3Fss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function t3FN(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,h=(a,b)=>t3IH(a*57+b*131,1.7),u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return h(xi,yi)*(1-u)*(1-v)+h(xi+1,yi)*u*(1-v)+h(xi,yi+1)*(1-u)*v+h(xi+1,yi+1)*u*v}
const t3FPathY=x=>T3FL.path+5*Math.sin(x/97)+3*Math.sin(x/41+1);
// ------------------------------------------------------------------ the pictures of the materials, painted once (light, so the colour of the
// piece tints them; seamless: what goes over an edge comes back on the other side)
function t3FCv(S){const c=document.createElement('canvas');c.width=c.height=S;return c}
function t3FW(S,x,y,r,f){for(const ox of[0,-S,S])for(const oy of[0,-S,S]){const X=x+ox,Y=y+oy;if(X<-r||X>S+r||Y<-r||Y>S+r)continue;f(X,Y)}}
function t3FBlots(g,S,r,n,r0,r1,cols){for(let i=0;i<n;i++){const x=r()*S,y=r()*S,R=r0+r()*(r1-r0),c=cols[Math.floor(r()*cols.length)],c0=c.replace(/[\d.]+$/,'0');
  t3FW(S,x,y,R,(a,b)=>{const gr=g.createRadialGradient(a,b,0,a,b,R);gr.addColorStop(0,`rgba(${c})`);gr.addColorStop(1,`rgba(${c0})`);g.fillStyle=gr;g.fillRect(a-R,b-R,2*R,2*R)})}}
function t3FStrokes(g,S,r,n,f){for(let i=0;i<n;i++){const o=f(r,i);t3FW(S,o.x,o.y,o.r||12,(a,b)=>{g.strokeStyle=o.c;g.lineWidth=o.w;g.beginPath();g.moveTo(a,b);for(const p of o.p)g.lineTo(a+p[0],b+p[1]);g.stroke()})}}
// vertical lines that wave and come back at the bottom where they left at the top (bark, grain)
function t3FWave(g,S,x,k,ph,am,stroke,fill){for(const ox of[0,-S,S]){if(x+ox<-14||x+ox>S+14)continue;g.beginPath();for(let y=0;y<=S;y+=8)g.lineTo(x+ox+Math.sin(y/S*TAU*k+ph)*am,y);
  if(fill){for(let y=S;y>=0;y-=8)g.lineTo(x+ox+fill.w+Math.sin(y/S*TAU*k+ph+.6)*am,y);g.closePath();g.fillStyle=fill.c;g.fill()}else{g.strokeStyle=stroke.c;g.lineWidth=stroke.w;g.stroke()}}}
const T3FTX={
  grass(g,S,r){g.fillStyle='rgb(196,202,184)';g.fillRect(0,0,S,S);t3FBlots(g,S,r,46,12,40,['50,62,36,.24','255,255,226,.16','120,104,64,.16']);g.lineCap='round';
    t3FStrokes(g,S,r,2600,r=>{const a=-Math.PI/2+(r()-.5)*1.3,l=3+r()*8,c=r();return{x:r()*S,y:r()*S,w:.7+r()*1.1,c:c<.34?'rgba(52,66,36,.55)':c<.6?'rgba(110,128,76,.5)':c<.84?'rgba(236,240,206,.42)':'rgba(176,152,96,.5)',
      p:[[Math.cos(a)*l*.5+(r()-.5),Math.sin(a)*l*.5],[Math.cos(a)*l,Math.sin(a)*l]],r:l+2}});t3FBlots(g,S,r,30,2,5,['40,30,20,.35'])},
  dirt(g,S,r){g.fillStyle='rgb(206,196,182)';g.fillRect(0,0,S,S);t3FBlots(g,S,r,60,8,36,['80,62,44,.22','255,250,232,.16']);
    for(let i=0;i<520;i++){const x=r()*S,y=r()*S,rx=.7+r()*2.6,ry=rx*(.55+r()*.4),ro=r()*3,c=r(),f=c<.42?'rgba(130,110,88,.6)':c<.78?'rgba(244,236,218,.62)':'rgba(70,56,42,.55)';
      t3FW(S,x,y,rx+2,(a,b)=>{g.fillStyle='rgba(40,30,20,.3)';g.beginPath();g.ellipse(a+.6,b+.8,rx,ry,ro,0,TAU);g.fill();g.fillStyle=f;g.beginPath();g.ellipse(a,b,rx,ry,ro,0,TAU);g.fill()})}
    g.lineCap='round';t3FStrokes(g,S,r,26,r=>{const a=r()*TAU,l=6+r()*12;return{x:r()*S,y:r()*S,w:.8+r()*.8,c:'rgba(60,44,30,.5)',p:[[Math.cos(a)*l*.5,Math.sin(a)*l*.5+(r()-.5)*2],[Math.cos(a)*l,Math.sin(a)*l]],r:l+2}})},
  stone(g,S,r){g.fillStyle='rgb(206,208,204)';g.fillRect(0,0,S,S);t3FBlots(g,S,r,80,8,36,['40,46,54,.2','255,255,248,.14','90,100,70,.12']);
    for(let i=0;i<2200;i++){g.fillStyle=r()<.5?'rgba(40,40,44,.35)':'rgba(255,255,255,.35)';g.fillRect(r()*S,r()*S,1,1)}
    g.lineJoin='round';t3FStrokes(g,S,r,18,r=>{const p=[];let x=0,y=0;for(let k=0;k<5;k++){x+=(r()-.5)*18;y+=4+r()*8;p.push([x,y])}return{x:r()*S,y:r()*S,w:1+r()*.8,c:'rgba(28,28,32,.55)',p,r:50}});
    t3FBlots(g,S,r,40,2,6,['170,190,110,.4','226,214,150,.35'])},
  barkV(g,S,r){g.fillStyle='rgb(190,180,168)';g.fillRect(0,0,S,S);const k=2+Math.floor(r()*2);
    for(let x=0;x<S;){const w=7+r()*11,ph=r()*TAU,am=1.5+r()*2.5,hi=r()<.5,lw=1.4+r()*1.6;t3FWave(g,S,x,k,ph,am,null,{w,c:hi?'rgba(255,248,236,.2)':'rgba(110,92,76,.16)'});
      t3FWave(g,S,x,k,ph,am,{c:'rgba(40,28,20,.55)',w:lw});x+=w}
    g.lineCap='round';t3FStrokes(g,S,r,80,r=>({x:r()*S,y:r()*S,w:1,c:'rgba(40,28,20,.45)',p:[[3+r()*6,(r()-.5)*2]],r:12}));
    for(let i=0;i<4;i++){const x=r()*S,y=r()*S,rx=3+r()*3,ry=rx*1.6;t3FW(S,x,y,ry+3,(a,b)=>{g.fillStyle='rgba(50,36,26,.6)';g.beginPath();g.ellipse(a,b,rx,ry,0,0,TAU);g.fill();g.strokeStyle='rgba(90,70,54,.5)';g.lineWidth=1;g.beginPath();g.ellipse(a,b,rx+2,ry+3,0,0,TAU);g.stroke()})}},
  woodV(g,S,r){g.fillStyle='rgb(212,202,188)';g.fillRect(0,0,S,S);t3FBlots(g,S,r,30,10,40,['120,112,104,.16','255,250,236,.14']);const k=1+Math.floor(r()*2);
    for(let i=0;i<90;i++){const x=r()*S,ph=r()*TAU,am=1+r()*3,lw=.5+r()*1.4,c=r()<.6?'rgba(90,70,52,.32)':'rgba(255,250,240,.3)';t3FWave(g,S,x,k,ph,am,{c,w:lw})}
    for(let i=0;i<3;i++){const x=r()*S,y=r()*S,rx=2+r()*2.5,ry=rx*1.8;t3FW(S,x,y,ry+8,(a,b)=>{g.fillStyle='rgba(70,50,34,.6)';g.beginPath();g.ellipse(a,b,rx,ry,0,0,TAU);g.fill();g.strokeStyle='rgba(90,70,50,.4)';g.lineWidth=1;
      for(const q of[2,4]){g.beginPath();g.ellipse(a,b,rx+q,ry+q*1.5,0,0,TAU);g.stroke()}})}},
  planks(g,S,r){g.fillStyle='rgb(206,196,180)';g.fillRect(0,0,S,S);const ph=32;for(let i=0;i<S/ph;i++){const y=i*ph;g.fillStyle=r()<.5?'rgba(90,70,50,.12)':'rgba(255,250,236,.1)';g.fillRect(0,y,S,ph);
      for(let k=0;k<9;k++){const f=.15+r()*.7,p0=r()*TAU,am=.6+r()*1.4,kk=1+Math.floor(r()*2);g.strokeStyle=r()<.6?'rgba(90,70,52,.3)':'rgba(255,250,240,.28)';g.lineWidth=.6+r();g.beginPath();for(let x=0;x<=S;x+=8)g.lineTo(x,y+ph*f+Math.sin(x/S*TAU*kk+p0)*am);g.stroke()}
      g.fillStyle='rgba(40,30,22,.7)';g.fillRect(0,y,S,2);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,y+2,S,1);const jx=r()*S;g.fillStyle='rgba(40,30,22,.6)';g.fillRect(jx,y,1.6,ph);
      for(const nx of[jx+5,jx-6]){g.fillStyle='rgba(30,26,24,.8)';g.fillRect((nx+S)%S,y+6,2,2);g.fillRect((nx+S)%S,y+ph-8,2,2)}}},
  plaster(g,S,r){g.fillStyle='rgb(214,208,194)';g.fillRect(0,0,S,S);t3FBlots(g,S,r,70,10,44,['90,80,64,.18','255,252,240,.14']);
    for(let i=0;i<9;i++){const x=r()*S,y=r()*S,w=20+r()*30,h=14+r()*20,st=[];for(let k=0;k<9;k++)st.push([(r()-.5)*w*.8,(r()-.5)*h*.8,4+r()*6,3+r()*3,r()]);
      t3FW(S,x,y,w,(a,b)=>{g.fillStyle='rgba(80,72,60,.5)';g.beginPath();g.ellipse(a,b,w/2,h/2,0,0,TAU);g.fill();for(const[ox,oy,sw,sh,c] of st){g.fillStyle=c<.5?'rgba(170,160,146,.95)':'rgba(136,128,116,.95)';g.fillRect(a+ox-sw/2,b+oy-sh/2,sw,sh)}})}
    t3FStrokes(g,S,r,40,r=>({x:r()*S,y:r()*S,w:2+r()*4,c:'rgba(70,62,50,.14)',p:[[0,10+r()*50]],r:70}));
    g.lineJoin='round';t3FStrokes(g,S,r,12,r=>{const p=[];let x=0,y=0;for(let k=0;k<4;k++){x+=(r()-.5)*14;y+=4+r()*9;p.push([x,y])}return{x:r()*S,y:r()*S,w:1,c:'rgba(40,34,28,.5)',p,r:46}})},
  shingle(g,S,r){g.fillStyle='rgb(60,54,50)';g.fillRect(0,0,S,S);const rh=16;for(let row=0;row<S/rh;row++){let x=row%2?-9:0;const y=row*rh;while(x<S){const w=12+r()*10,v=r(),miss=r()<.04,
      c=miss?'rgb(24,20,18)':`rgb(${170+v*50|0},${160+v*44|0},${148+v*40|0})`;for(const ox of[0,-S]){g.fillStyle=c;g.fillRect(x+ox+1,y+1,w-2,rh-1);if(!miss){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x+ox+1,y+rh-4,w-2,3);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+ox+1,y+1,w-2,2)}}x+=w}}
    t3FBlots(g,S,r,20,4,12,['80,100,50,.4'])},
  canvas(g,S,r){g.fillStyle='rgb(220,212,196)';g.fillRect(0,0,S,S);for(let i=0;i<S;i+=2){g.fillStyle=i%4?'rgba(0,0,0,.05)':'rgba(255,255,255,.06)';g.fillRect(0,i,S,1);g.fillRect(i,0,1,S)}
    t3FBlots(g,S,r,40,8,30,['90,74,52,.18','255,255,240,.1']);for(let i=0;i<3;i++){const y=r()*S;g.strokeStyle='rgba(60,46,32,.5)';g.lineWidth=1.2;g.setLineDash([3,3]);g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke()}g.setLineDash([])},
  metal(g,S,r){g.fillStyle='rgb(196,200,206)';g.fillRect(0,0,S,S);t3FBlots(g,S,r,50,6,30,['50,54,60,.2','255,255,255,.12']);
    t3FStrokes(g,S,r,160,r=>{const a=r()*TAU,l=4+r()*20;return{x:r()*S,y:r()*S,w:.6,c:r()<.6?'rgba(255,255,255,.35)':'rgba(30,30,34,.3)',p:[[Math.cos(a)*l,Math.sin(a)*l]],r:l+1}});t3FBlots(g,S,r,26,4,16,['160,88,46,.42','120,60,30,.3'])},
  char(g,S,r){g.fillStyle='rgb(92,84,78)';g.fillRect(0,0,S,S);const rh=10;for(let row=0;row<Math.ceil(S/rh);row++){let x=(row%2)*6;const y=row*rh;while(x<S){const w=8+r()*10,c=r()<.5?'rgba(40,34,30,.4)':'rgba(140,132,124,.35)';
      for(const ox of[0,-S]){g.fillStyle=c;g.fillRect(x+ox+1,y+1,w-2,rh-2)}g.fillStyle='rgba(10,8,6,.7)';g.fillRect(x,y,1.4,rh);x+=w}g.fillStyle='rgba(10,8,6,.7)';g.fillRect(0,y,S,1.4)}
    t3FBlots(g,S,r,20,4,14,['210,206,200,.25'])},
  plain(g,S,r){g.fillStyle='rgb(218,218,216)';g.fillRect(0,0,S,S);t3FBlots(g,S,r,40,8,40,['60,60,60,.14','255,255,255,.12'])}};
// (how many units one picture covers)
const T3FTS={grass:44,dirt:30,stone:22,barkV:20,barkH:20,woodV:16,woodH:16,planks:26,plaster:42,shingle:24,canvas:12,metal:14,char:9,plain:30};
function t3FPaint(k){const S=256,c=t3FCv(S),g=c.getContext('2d');T3FTX[k](g,S,t3IRnd(k.length*911+k.charCodeAt(0)*37));T3F.cv[k]=c;return c}
function t3FRot(src){const S=src.width,c=t3FCv(S),g=c.getContext('2d');g.translate(S,0);g.rotate(Math.PI/2);g.drawImage(src,0,0);return c}
function t3FMoonCv(){const S=128,c=t3FCv(S),g=c.getContext('2d'),r=t3IRnd(812),gr=g.createRadialGradient(54,50,4,64,64,60);gr.addColorStop(0,'#fbfff0');gr.addColorStop(.7,'#e4ecd2');gr.addColorStop(1,'#bfcdac');
  g.save();g.beginPath();g.arc(64,64,58,0,TAU);g.clip();g.fillStyle=gr;g.fillRect(0,0,S,S);
  for(const[x,y,R,a] of[[46,50,16,.24],[78,44,11,.2],[70,78,18,.22],[44,84,9,.18],[90,70,7,.16]]){const q=g.createRadialGradient(x,y,0,x,y,R);q.addColorStop(0,`rgba(110,132,104,${a})`);q.addColorStop(1,'rgba(110,132,104,0)');g.fillStyle=q;g.fillRect(x-R,y-R,2*R,2*R)}
  for(let i=0;i<14;i++){const x=20+r()*88,y=20+r()*88,R=1.5+r()*4;g.strokeStyle='rgba(104,124,96,.3)';g.lineWidth=1;g.beginPath();g.arc(x,y,R,0,TAU);g.stroke()}g.restore();return c}
// ------------------------------------------------------------------ the painting of the night (not plastic): the material's picture from
// where the piece is (on its three sides), the moon in two tones with a ragged edge like a stroke, the fire's light in soft bands, the cool
// rim of the moon, the tops lighter, the bottom of things darker, the low mist that moves on the field (not on the camp)
const T3FS_FP=`precision highp float;uniform sampler2D uTex;uniform sampler2D uTex2;uniform float uTS;uniform float uTS2;uniform float uMode;uniform float uInk;uniform float uAlpha;
uniform float uAO;uniform float uEm;uniform vec2 uCamp;uniform float uMist2;varying vec3 vN;varying vec4 vC;varying vec3 vW;varying vec2 vT;${T3SHADE}
vec3 tri(sampler2D s,vec3 p,vec3 n,float k){vec3 b=pow(abs(n),vec3(4.));b/=b.x+b.y+b.z+1e-4;return texture2D(s,p.yz/k).rgb*b.x+texture2D(s,p.xz/k).rgb*b.y+texture2D(s,p.xy/k).rgb*b.z;}
vec3 fog2(vec3 c,vec3 P){float dE=distance(P,uEye);float f=clamp((dE-uFogP.x)/uFogP.y,0.,1.)*uFogP.z;
 if(uMist2>0.){float nz=texture2D(uNoi,P.xy/260.+vec2(uT*.007,uT*.003)).r*.6+texture2D(uNoi,P.xy/90.-vec2(uT*.012,uT*.005)).r*.4;
  f=max(f,clamp(uMist2*exp(-max(P.z,0.)/11.)*(nz*1.6-.3)*smoothstep(70.,170.,length(P.xy-uCamp)),0.,.62));}
 return mix(c,uFogC,f);}
void main(){vec3 ink=vec3(.05,.045,.055);if(uInk>.5){gl_FragColor=vec4(fog2(ink,vW),uAlpha);return;}
 vec3 n=normalize(vN);vec3 tx;
 if(uMode>1.5){vec3 g=texture2D(uTex,vW.xy/uTS).rgb*.6+texture2D(uTex,vW.xy/(uTS*3.7)).rgb*.4,d=texture2D(uTex2,vW.xy/uTS2).rgb;tx=mix(g,d,clamp(vT.x,0.,1.));}
 else if(uMode>.5)tx=texture2D(uTex,vT/uTS).rgb;else tx=tri(uTex,vW,n,uTS);
 vec3 base=vC.rgb*tx*1.22;base*=.84+.32*texture2D(uNoi,vW.xy/530.+vW.z/700.).r;
 float nz=texture2D(uNoi,vW.xy/19.+vec2(vW.z/27.,vW.z/41.)).r-.5;
 float lm=dot(n,uKey)+nz*.3;float km=smoothstep(-.04,.08,lm)*.58+smoothstep(.34,.46,lm)*.42;
 vec3 L=mix(uGnd,uSky,n.z*.5+.5)+uKeyC*km;
 for(int i=0;i<12;i++){vec4 Q=uL[i];if(Q.w<=0.)continue;vec3 d=Q.xyz-vW;float dl=length(d);float q=dl/Q.w;if(q>=1.)continue;vec3 ld=d/max(dl,.001);
  float w=smoothstep(.28,.6,dot(n,ld)*.5+.5+nz*.14)*.8+.2;float a=1.-q;a*=a;a=mix(a,floor(a*4.+.5)/4.,.14);L+=uLC[i].rgb*(uLC[i].a*a*w);}
 float ao=mix(1.,mix(.5,1.,smoothstep(0.,15.,vW.z)),uAO);
 vec3 c=base*L*ao;c+=base*uKeyC*.5*smoothstep(.6,.95,n.z)*km;
 vec3 V=normalize(uEye-vW);float fr=1.-clamp(dot(n,V),0.,1.);c+=uKeyC*pow(fr,3.)*clamp(dot(n,uKey)+.5,0.,1.)*.7*ao;
 float em=1.-vC.a;c=mix(c,vC.rgb*(tx*.5+.6)*(.75+.5*uEm),em);
 gl_FragColor=vec4(fog2(c,vW),uAlpha);}`;
function t3FProg(){return T3F.P||(T3F.P=t3Prog(V3VS_TOON,T3FS_FP,['aP','aN','aO','aT','aC','aP2','aN2','aO2']))}
T3F.I=v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,0]);
// items: {m, mat (its picture), mat2/mode 2 (the ground: grass and earth mixed), ts, out (the outline's thickness), ao, em, M}
function t3FDraw(items,o){if(!items.length)return;o=o||{};const gl=T3.gl,P=t3FProg(),u=P.u,X=T3F.X;gl.useProgram(P.p);t3Uni(P);
  gl.uniform2f(u.uCamp,T3FL.fire[0]*.5,T3FL.fire[1]*.5-8);gl.uniform1f(u.uMist2,LOWFX?0:o.mist==null?t3L().mist:o.mist);gl.uniform1i(u.uTex,0);gl.uniform1i(u.uTex2,1);gl.uniform1f(u.uKF,0);
  for(let i=0;i<5;i++)gl.enableVertexAttribArray(i);for(let i=5;i<8;i++)gl.disableVertexAttribArray(i);gl.enable(gl.CULL_FACE);
  const bind=it=>{const m=it.m;gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);
    gl.vertexAttribPointer(0,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,48,12);gl.vertexAttribPointer(2,3,gl.FLOAT,false,48,24);gl.vertexAttribPointer(3,2,gl.FLOAT,false,48,36);gl.vertexAttribPointer(4,4,gl.UNSIGNED_BYTE,true,48,44);
    const M=it.M||T3F.I,det=M[0]*(M[5]*M[10]-M[6]*M[9])-M[4]*(M[1]*M[10]-M[2]*M[9])+M[8]*(M[1]*M[6]-M[2]*M[5]);gl.frontFace(det<0?gl.CW:gl.CCW);gl.uniformMatrix4fv(u.uM,false,M);gl.uniformMatrix3fv(u.uNM,false,v3NM(M))};
  // the outline first (the pieces a little bigger, seen from inside), then the pieces
  gl.cullFace(gl.FRONT);gl.uniform1f(u.uInk,1);gl.uniform1f(u.uAlpha,1);for(const it of items){if(!(it.out>0))continue;bind(it);gl.uniform1f(u.uOut,it.out*(T3.low?.8:1));gl.drawElements(gl.TRIANGLES,it.m.n,gl.UNSIGNED_SHORT,0)}
  gl.cullFace(gl.BACK);gl.uniform1f(u.uInk,0);gl.uniform1f(u.uOut,0);
  for(const it of items){bind(it);const t=X[it.mat]||X.plain;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,it.mat2?X[it.mat2]:t);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,t);
    gl.uniform1f(u.uTS,it.ts||T3FTS[it.mat]||20);gl.uniform1f(u.uTS2,it.ts2||T3FTS[it.mat2]||20);gl.uniform1f(u.uMode,it.mode||0);gl.uniform1f(u.uAO,it.ao==null?1:it.ao);gl.uniform1f(u.uEm,it.em==null?1:it.em);
    gl.drawElements(gl.TRIANGLES,it.m.n,gl.UNSIGNED_SHORT,0)}
  gl.frontFace(gl.CCW);gl.disable(gl.CULL_FACE);for(let i=1;i<8;i++)gl.disableVertexAttribArray(i);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);gl.activeTexture(gl.TEXTURE0);T3.nMesh+=items.length}
// ------------------------------------------------------------------ building: one mesh for each material
function t3FGet(){const B={},get=k=>B[k]||(B[k]=v3MB());get.B=B;return get}
function t3FUp(get,o){const L=[];for(const k in get.B){const mb=get.B[k];if(!mb.I.length)continue;L.push(Object.assign({m:v3Up(mb),mat:k},o||{}))}return L}
// a beam from a to b (w across, h up), a prism (a shape in x, z of a frame, from y0 to y1)
function t3FBeam(mb,a,b,w,h,col,up){const{sub,nrm,cross,add,mul,len}=RG,d=sub(b,a),L=len(d),U=nrm(d);let V=cross(up||[0,0,1],U);if(len(V)<.1)V=cross([1,0,0],U);V=nrm(V);const W=cross(U,V);
  t3IBox(mb,mul(add(a,b),.5),U,V,W,L/2,w/2,h/2,col,{uv:1})}
function t3FPrism(mb,F,D,pts,y0,y1,col){const n=pts.length,cz=pts.reduce((s,p)=>[s[0]+p[0]/n,s[1]+p[1]/n],[0,0]);
  for(const[y,nn] of[[y0,D(0,-1,0)],[y1,D(0,1,0)]]){const c=v3V(mb,F(cz[0],y,cz[1]),nn,col),R=pts.map(p=>v3V(mb,F(p[0],y,p[1]),nn,col));for(let i=0;i<n;i++)v3T(mb,c,R[i],R[(i+1)%n])}
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;let nx=dz/l,nz=-dx/l;if(nx*((a[0]+b[0])/2-cz[0])+nz*((a[1]+b[1])/2-cz[1])<0){nx=-nx;nz=-nz}
    v3Quad(mb,F(a[0],y0,a[1]),F(b[0],y0,b[1]),F(b[0],y1,b[1]),F(a[0],y1,a[1]),D(nx,0,nz),col)}}
// a headstone: the round top, a little thick, leaning; moss at its foot
function t3FStone(mb,c,yaw,w,h,th,tilt,col,moss){const N=8,prof=[[-w/2,0],[w/2,0],[w/2,h-w/2]];for(let k=1;k<N;k++){const a=k/N*Math.PI;prof.push([Math.cos(a)*w/2,h-w/2+Math.sin(a)*w/2])}prof.push([-w/2,h-w/2]);
  const ca=Math.cos(yaw),sa=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt),R=(x,y,z)=>{const z2=z*ct-y*st,y2=y*ct+z*st;return[x*ca-y2*sa,x*sa+y2*ca,z2]},P=(x,y,z)=>{const q=R(x,y,z);return[c[0]+q[0],c[1]+q[1],c[2]+q[2]]},
    cf=z=>z<2.6?moss:col;
  for(const s of[1,-1]){const n=R(0,s,0),c0=v3V(mb,P(0,s*th/2,h*.45),n,cf(h*.45)),Rr=prof.map(p=>v3V(mb,P(p[0],s*th/2,p[1]),n,cf(p[1])));for(let i=0;i<Rr.length;i++)v3T(mb,c0,Rr[i],Rr[(i+1)%Rr.length])}
  for(let i=0;i<prof.length;i++){const a=prof[i],b=prof[(i+1)%prof.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;v3Quad(mb,P(a[0],th/2,a[1]),P(b[0],th/2,b[1]),P(b[0],-th/2,b[1]),P(a[0],-th/2,a[1]),R(dz/l,0,-dx/l),cf((a[1]+b[1])/2))}}
// a dead tree: the trunk that twists, branches that split thinner and thinner, a few roots
function t3FTree(mb,base,h,sd,col){const R=t3IRnd(sd*977+5),{add,mul,nrm}=RG;
  const br=(p,d,L,r,dp)=>{const n=dp?4:6,pts=[p],rs=[r];let q=p,dd=d;for(let k=1;k<=n;k++){dd=nrm(add(dd,[(R()-.5)*.42,(R()-.5)*.42,(R()-.5)*.2+(dp>1?-.05:.03)]));q=add(q,mul(dd,L/n));pts.push(q);rs.push(Math.max(.22,r*(1-k/n*.72)))}
    v3Tube(mb,pts,rs,col,dp<1?9:dp<2?6:4);
    if(dp<3){const nb=dp===0?3:2+(R()<.4?1:0);for(let i=0;i<nb;i++){const at=Math.max(1,Math.floor(n*(.4+R()*.5))),a=R()*TAU,nd=nrm(add(mul(dd,.6),[Math.cos(a)*.85,Math.sin(a)*.85,.2+R()*.35]));br(pts[at],nd,L*(.48+R()*.22),rs[at]*.66,dp+1)}}};
  for(let i=0;i<4;i++){const a=i/4*TAU+R();v3Tube(mb,[add(base,[0,0,3]),add(base,[Math.cos(a)*h*.06,Math.sin(a)*h*.06,.5]),add(base,[Math.cos(a)*h*.12,Math.sin(a)*h*.12,-1.5])],[h*.04,h*.025,h*.01],col,5)}
  br(base,[0,0,1],h*.52,h*.05,0)}
// a tuft of grass: blades that lean out
function t3FTuft(mb,c,h,sd,cols){for(let k=0;k<6;k++){const a=t3IH(k,sd)*TAU,r=.6+t3IH(k,sd+1)*1.6,l=h*(.6+t3IH(k,sd+2)*.6),lean=.25+t3IH(k,sd+3)*.45,b=[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,c[2]-.2];
  t3Cone(mb,b,[b[0]+Math.cos(a)*l*lean,b[1]+Math.sin(a)*l*lean,c[2]+l],.5+h*.03,cols[k%cols.length],{N:3,w:.25})}}
// ------------------------------------------------------------------ the ground: one sheet from the camp to the hills, the grass and the
// earth mixed by the corners (the trampled clearing round the camp, the path, bare patches), the ring burnt round the fire
function t3FGround(){const b=v3MB(),NX=84,NY=72,xs=[],ys=[];for(let i=0;i<NX;i++){const u=i/(NX-1)*2-1;xs.push(Math.sign(u)*Math.pow(Math.abs(u),2.1)*2100)}
  for(let j=0;j<NY;j++){const v=j/(NY-1);ys.push(130-Math.pow(v,1.85)*3400)}
  const F=T3FL.fire,cc=[F[0]*.4-2,F[1]*.3-6],idx=[];
  for(let j=0;j<NY;j++){const row=[];for(let i=0;i<NX;i++){const x=xs[i],y=ys[j];
      const ang=Math.atan2(y-cc[1],x-cc[0]),rr=50*(1+.16*Math.sin(ang*3+1)+.09*Math.sin(ang*7)),dc=Math.hypot((x-cc[0])/1.3,y-cc[1]),clear=1-t3Fss(rr*.62,rr,dc);
      const pd=Math.abs(y-t3FPathY(x)),path=(1-t3Fss(8,17,pd))*(1-t3Fss(900,1400,Math.abs(x))),patch=t3Fss(.7,.9,t3FN(x/140+3,y/110))*.75,
        farm=1-t3Fss(40,90,Math.hypot(x-T3FL.farm[0],(y-T3FL.farm[1])*1.4)),mill=1-t3Fss(30,60,Math.hypot(x-T3FL.mill[0],y-T3FL.mill[1]));
      const dirt=Math.max(clear,path*.95,patch,farm*.8,mill*.7),z=(t3FN(x/300,y/260)-.5)*18*t3Fss(900,1500,Math.abs(y));
      const g0=t3FN(x/90+5,y/70),g1=t3FN(x/31,y/27),gk=.72+.4*t3FN(x/64+9,y/48),gc=[(58+g0*30-g1*12)*gk,(72+g0*26-g1*10)*gk,(44+g0*12)*gk],dc0=[112+g1*16,90+g1*12,68+g1*8],burn=1-t3Fss(5,13,Math.hypot(x-F[0],y-F[1]));
      let c=t3Im(gc,dc0,dirt);c=t3Ik(c,1-burn*.72);row.push(v3V(b,[x,y,z],[0,0,1],[c[0],c[1],c[2],255],[dirt,0]))}idx.push(row)}
  for(let j=0;j<NY-1;j++)for(let i=0;i<NX-1;i++){v3T(b,idx[j][i],idx[j][i+1],idx[j+1][i+1]);v3T(b,idx[j][i],idx[j+1][i+1],idx[j+1][i])}
  return[{m:v3Up(b),mat:'grass',mat2:'dirt',mode:2,ao:0,out:0}]}
// ------------------------------------------------------------------ the hills far away: three ridges one behind the other, dead trees on the
// first, a ruined chapel on the second
function t3FHills(){const get=t3FGet(),ridges=[[-1350,70,'#2a3a32',4],[-1850,120,'#24323a',7],[-2500,190,'#202a36',2]];
  for(const[y0,amp,col,sd] of ridges){const mb=get('grass'),c=t3Ic(col),pts=[];for(let x=-3200;x<=3200;x+=50){const h=amp*(.55+.3*Math.sin(x/340+sd)+.18*Math.sin(x/131+sd*2)+.07*Math.sin(x/47+sd*3));pts.push([x,y0+Math.sin(x/260+sd)*60,h])}
    for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];v3Quad(mb,[a[0],a[1]+60,-40],[b[0],b[1]+60,-40],[b[0],b[1],b[2]],[a[0],a[1],a[2]],RG.nrm([0,.8,.55]),c);
      v3Quad(mb,[a[0],a[1],a[2]],[b[0],b[1],b[2]],[b[0],b[1]-140,b[2]*.7],[a[0],a[1]-140,a[2]*.7],[0,0,1],c)}
    if(sd===4)for(let k=0;k<9;k++){const p=pts[Math.floor(t3IH(k,9)*pts.length)];t3FTree(get('barkV'),[p[0],p[1]-6,p[2]-4],34+t3IH(k,3)*30,k+40,t3Ic('#2a2826'))}}
  {const x0=70,h=120*(.55+.3*Math.sin(x0/340+7)+.18*Math.sin(x0/131+14)+.07*Math.sin(x0/47+21)),c=[x0,-1850+Math.sin(x0/260+7)*60,0],st=t3Ic('#4a4e52'),mb=get('stone'),F=(x,y,z)=>[c[0]+x,c[1]+y,h+z-6],D=(x,y,z)=>[x,y,z];
    t3IBox(mb,F(0,0,14),[1,0,0],[0,1,0],[0,0,1],20,13,14,st);t3FPrism(mb,F,D,[[-21,28],[21,28],[0,44]],-13,13,st);t3IBox(mb,F(-14,0,30),[1,0,0],[0,1,0],[0,0,1],5,5,30,st);
    t3Lathe(mb,F(-14,0,60),[[0,6],[22,.5]],4,st);t3IBox(mb,F(6,13.5,16),[1,0,0],[0,1,0],[0,0,1],4,.6,8,t3Ic('#0c0c10'))}
  return t3FUp(get,{out:0,ao:0})}
// ------------------------------------------------------------------ the farmhouse in ruins: the stone foundation, plastered walls with
// their timbers, the gable toward us, the roof of shingles fallen in on one side (the rafters show), the chimney, the door boarded up, a
// broken shutter, one window lit inside, a rain barrel, shingles fallen on the ground
function t3FFarm(){const get=t3FGet(),[cx,cy]=T3FL.farm,a=.32,ca=Math.cos(a),sa=Math.sin(a),F=(x,y,z)=>[cx+x*ca-y*sa,cy+x*sa+y*ca,z],D=(x,y,z)=>[x*ca-y*sa,x*sa+y*ca,z],U=D(1,0,0),V=D(0,1,0),Wz=[0,0,1],
    hw=34,hd=26,Hw=36,rh=26,box=(mat,x,y,z,hx,hy,hz,col,o)=>t3IBox(get(mat),F(x,y,z),U,V,Wz,hx,hy,hz,col,Object.assign({uv:1},o||{})),
    pl=t3Ic('#bcb29a'),st=t3Ic('#8e8e86'),tim=t3Ic('#5c4a3a'),rf=t3Ic('#857466'),dk=t3Ic('#100c0e'),lit=t3Ic('#ffb45a',36);
  box('stone',0,0,3,hw+1.6,hd+1.6,3,st);box('plaster',0,0,(6+Hw)/2,hw,hd,(Hw-6)/2,pl);
  t3FPrism(get('plaster'),F,D,[[-hw,Hw],[hw,Hw],[0,Hw+rh]],-hd,hd,pl);
  // the timbers: corners, the beam round the top, braces on the front
  for(const sx of[-1,1])for(const sy of[-1,1])box('woodV',sx*(hw-.2),sy*(hd-.2),(6+Hw)/2,1.6,1.6,(Hw-6)/2+.6,tim);
  for(const sy of[-1,1])box('woodH',0,sy*(hd+.4),Hw-.6,hw+1,1.1,1.4,tim);for(const sx of[-1,1])box('woodH',sx*(hw+.4),0,Hw-.6,1.1,hd+1,1.4,tim);
  for(const sx of[-1,1])t3FBeam(get('woodV'),F(sx*(hw-2),hd+.5,8),F(sx*(hw-14),hd+.5,Hw-2),2.4,1.6,tim,D(0,1,0));
  // the roof: the left side whole, the right one with a hole (the rafters), the ridge beam
  const sl=Math.hypot(hw+5,rh+3),ang=Math.atan2(rh+3,hw+5);
  for(const s of[-1,1]){const cxr=s*(hw+5)/2,czr=Hw-3+(rh+3)/2+1.2,UU=[-s*Math.cos(ang)*U[0],-s*Math.cos(ang)*U[1],Math.sin(ang)],Wn=[s*Math.sin(ang)*U[0],s*Math.sin(ang)*U[1],Math.cos(ang)];
    const seg=(y0,y1)=>t3IBox(get('shingle'),F(cxr,(y0+y1)/2,czr),UU,V,Wn,sl/2+1,(y1-y0)/2,1.3,rf,{uv:1});
    if(s<0)seg(-hd-5,hd+5);else{seg(-hd-5,-8);seg(12,hd+5);for(const ry of[-4,4,10])t3FBeam(get('woodV'),F(2,ry,Hw+rh-1),F(hw+3,ry,Hw-1),1.8,1.8,tim);
      t3IBox(get('shingle'),F(cxr+4,-1,czr-9),UU,V,Wn,sl/3,5,1.2,t3Ik(rf,.9),{uv:1})}}
  t3FBeam(get('woodH'),F(0,-hd-6,Hw+rh+.8),F(0,hd+6,Hw+rh+.8),2.2,2.2,tim);
  box('stone',-hw+9,-8,(Hw+rh+10)/2+6,4.2,4.2,(Hw+rh+10)/2-6,st);box('stone',-hw+9,-8,Hw+rh+11,5.2,5.2,1.2,t3Ik(st,.85));T3F.chim=F(-hw+9,-8,Hw+rh+13);
  // the door boarded up, its frame, the steps
  box('plain',0,hd+.2,15,6.5,.4,10,dk);for(const sx of[-1,1])box('woodV',sx*7.6,hd+.8,15.5,1.2,.9,10.5,tim);box('woodH',0,hd+.8,26.6,8.8,.9,1.2,tim);
  for(const[z,r] of[[12,.35],[20,-.28]]){const Ub=D(Math.cos(r),0,0),Wb=D(-Math.sin(r),0,0);t3IBox(get('planks'),F(0,hd+1.3,z),[Ub[0],Ub[1],Math.sin(r)],V,[Wb[0],Wb[1],Math.cos(r)],9.5,.5,1.8,t3Ic('#8a7458'),{uv:1})}
  box('stone',0,hd+3,1.6,8,3,1.6,st);box('stone',0,hd+6,.6,8,2,.6,t3Ik(st,.9));
  // the windows: the lit one on the left (warm, it trembles), the broken one on the right with its shutter hanging, one on the side
  box('plain',-20,hd+.25,19,5,.3,5.5,lit);box('plain',20,hd+.25,19,5,.3,5.5,dk);box('plain',hw+.25,-4,19,.3,5,5.5,dk);
  for(const sx of[-20,20]){box('woodV',sx,hd+.7,19,.6,.5,5.6,tim);box('woodH',sx,hd+.7,19,5.2,.5,.6,tim);box('woodH',sx,hd+1,12.8,6.4,1.2,.8,tim);for(const ex of[-1,1])box('woodV',sx+ex*5.4,hd+.7,19,.7,.6,6.2,tim)}
  {const Us=D(Math.cos(.5),Math.sin(.5)*.6,0),Vs=D(-Math.sin(.5),Math.cos(.5),0);t3IBox(get('planks'),F(28.2,hd+2.4,15.5),RG.nrm(Us),RG.nrm(Vs),[0,0,1],2.8,.5,6,t3Ic('#7a6450'),{uv:1})}
  T3F.win={p:F(-20,hd+2,19),l:F(-20,hd+8,18)};
  // the rain barrel, shingles fallen
  t3Lathe(get('woodV'),F(hw+5,hd-4,0),[[0,4.2],[5,4.8],[10,4.2]],10,t3Ic('#7a6248'),{top:t3Ic('#2a3236')});for(const z of[2,8])t3Lathe(get('metal'),F(hw+5,hd-4,z),[[0,4.5],[.8,4.6]],10,t3Ic('#5a5c60'));
  for(let k=0;k<5;k++){const p=F(hw+8+t3IH(k,2)*12,-10+t3IH(k,3)*24,.6);t3BoxA(get('shingle'),p,t3IH(k,4)*3,[3.4,2,.5],rf)}
  return t3FUp(get,{out:.9})}
// ------------------------------------------------------------------ the windmill: the stone base, the tapering plastered tower, the cap of
// shingles, the door, the dark windows, the shaft toward us (the blades turn: their own mesh)
function t3FMill(){const get=t3FGet(),[cx,cy]=T3FL.mill,c=[cx,cy,0],pl=t3Ic('#b0a896'),st=t3Ic('#82827a'),rf=t3Ic('#74645a'),tim=t3Ic('#5c4a3a'),dk=t3Ic('#100c0e');
  t3Lathe(get('stone'),c,[[0,25],[7,24]],12,st,{wob:a=>1+.03*Math.sin(a*5)});t3Lathe(get('plaster'),c,[[7,23],[40,18.5],[76,14]],12,pl,{wob:(a,z)=>1+.02*Math.sin(a*3+z*.1)});
  t3Lathe(get('woodH'),c,[[74,15.4],[78.5,15.4]],12,tim);t3Lathe(get('shingle'),c,[[78.5,16.6],[86,14.2],[96,7.4],[102,1]],12,rf);
  const P=(r,a,z)=>[cx+Math.sin(a)*r,cy+Math.cos(a)*r,z];
  t3IBox(get('plain'),P(23.2,0,9),[1,0,0],[0,1,0],[0,0,1],5,.6,9,dk);t3IBox(get('woodV'),P(23.8,0,18.6),[1,0,0],[0,1,0],[0,0,1],6.4,.9,1,tim,{uv:1});
  for(const[a,z] of[[.5,38],[-.6,56],[.2,64]]){const r=23-z*.12;t3BoxA(get('plain'),P(r,a,z-3),-a,[2.6,.6,3],dk)}
  v3Tube(get('woodH'),[[cx,cy+8,88],[cx,cy+24,88]],[2.2,2.2],tim,8);T3F.hub=[cx,cy+24.5,88];
  return t3FUp(get,{out:.9})}
function t3FBlades(){const get=t3FGet(),tim=t3Ic('#6a5640'),sail=t3Ic('#b8ae96'),iron=t3Ic('#4a4c50'),{add,mul}=RG;
  t3Sph(get('woodV'),[0,0,0],3,tim);t3Lathe(get('metal'),[0,1,0],[[0,2.6],[1.6,1.6]],8,iron);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.3,ax=[Math.cos(a),0,Math.sin(a)],px=[-Math.sin(a),0,Math.cos(a)],L=k===2?30:62,O=(r,s,y)=>add(add(mul(ax,r),mul(px,s)),[0,y||0,0]);
    t3IBox(get('woodV'),O(L/2+2,0,1.5),ax,[0,1,0],px,L/2,1.1,1.4,tim,{uv:1});
    for(const s of[3.5,13])t3IBox(get('woodV'),O((14+L)/2,s,1.5),ax,[0,1,0],px,(L-14)/2,.7,.7,tim,{uv:1});
    for(let r=14;r<=L;r+=6)t3IBox(get('woodV'),O(r,8.2,1.5),px,[0,1,0],ax,5.4,.6,.6,tim,{uv:1});
    // the sail cloth: torn, some cells missing (both sides)
    const mb=get('canvas');for(let r=14;r<L-5;r+=6){if(t3IH(k*13+r,5)<(k===2?.6:.22))continue;const s0=4.2,s1=12.4,r1=r+6;for(const sy of[1,-1]){const y=1.5+sy*.35,n=[0,sy,0];
      v3V(mb,O(r,s0,y),n,sail,[r,s0]);v3V(mb,O(r1,s0,y),n,sail,[r1,s0]);v3V(mb,O(r1,s1,y),n,sail,[r1,s1]);v3V(mb,O(r,s1,y),n,sail,[r,s1]);const i=mb.P.length/3-4;v3T(mb,i,i+1,i+2);v3T(mb,i,i+2,i+3)}}
    if(k===2){t3FBeam(get('woodV'),O(L+2,0,1.5),O(L+7,2.5,1.5),2,2.4,tim);for(const sy of[1,-1]){const y=1.5+sy*.35,n=[0,sy,0],i=mb.P.length/3;v3V(mb,O(L-4,4,y),n,sail,[0,0]);v3V(mb,O(L-4,12,y),n,sail,[8,0]);v3V(mb,O(L-14,16,y),n,sail,[12,8]);v3T(mb,i,i+1,i+2)}}}
  return t3FUp(get,{out:.7,mode:1,ts:14})}
// ------------------------------------------------------------------ the field: the fence broken, the graves, tall grass, the big dead tree
function t3FField(){const get=t3FGet(),R=t3IRnd(611),wd=t3Ic('#8a7a66'),wd2=t3Ic('#776654'),st=t3Ic('#90928c'),ms=t3Ic('#5c6c40'),posts=[];
  for(let x=-560;x<=560;){if(R()>.1){const h=17+R()*6,lean=(R()-.5)*.32,y=T3FL.fence+(R()-.5)*4;posts.push([x,y,lean,h]);const top=[x+Math.sin(lean)*h,y,Math.cos(lean)*h];
      t3FBeam(get('woodV'),[x,y,-1],top,2.8,2.8,wd,[0,1,0]);t3Cone(get('woodV'),top,[top[0]+Math.sin(lean)*2.4,y,top[2]+2.4],1.9,wd,{N:4})}else posts.push(null);x+=22+R()*9}
  for(let i=0;i<posts.length-1;i++){const a=posts[i],b=posts[i+1];if(!a||!b||R()<.16)continue;for(const h of[6,13]){if(R()<.14)continue;const pa=[a[0]+Math.sin(a[2])*h,a[1]+1.6,h],pb=[b[0]+Math.sin(b[2])*h,b[1]+1.6,h];
      if(R()<.22){const m=[pa[0]+(pb[0]-pa[0])*.55,pa[1]+1,Math.max(1.2,h-5-R()*4)];t3FBeam(get('woodH'),pa,m,1.2,3,wd2)}else t3FBeam(get('woodH'),pa,pb,1.2,3,R()<.5?wd2:wd)}}
  T3F.posts=posts.filter(Boolean);
  // the graves: three stones and crosses on the right, one on the left; the mounds
  for(const[x,y,yaw,w,h,tilt] of[[64,-124,.1,9,13,.12],[86,-140,-.15,8,11,-.1],[104,-118,.25,10,15,.05],[-60,-138,-.2,8,10,-.16]]){t3FStone(get('stone'),[x,y,0],yaw,w,h,2.6,tilt,st,ms);
    t3Ell(get('dirt'),[x,y+8,0],[w*.55,8,2.4],t3Ic('#6a5440'),{nl:12,nb:6,floor:0,w:.4})}
  for(const[x,y,lean,h] of[[76,-112,.18,14],[118,-150,-.22,12],[-42,-128,.12,13]]){const b=[x,y,-1],tp=[x+Math.sin(lean)*h,y,h];t3FBeam(get('woodV'),b,tp,2,2,wd2,[0,1,0]);
    const m=[x+Math.sin(lean)*h*.72,y+.4,h*.72];t3FBeam(get('woodH'),[m[0]-4.5,m[1],m[2]+lean*4],[m[0]+4.5,m[1],m[2]-lean*4],1.6,1.6,wd2)}
  // tall grass: thicker by the fence and the graves, none on the camp; a few big tufts close to us
  const gc=[t3Ic('#5e7040'),t3Ic('#6e7c48'),t3Ic('#7c7c4c'),t3Ic('#4e6236')];
  for(let i=0;i<150;i++){const x=(R()-.5)*620,y=R()<.5?T3FL.fence+6+R()*10:40-R()*R()*300;if(Math.hypot((x-6)/1.3,y+4)<60||Math.abs(y-t3FPathY(x))<12)continue;t3FTuft(get('grass'),[x,y,0],5+R()*7,i*1.7,gc)}
  for(let i=0;i<20;i++){const x=(R()-.5)*240,y=26+R()*90;if(Math.hypot((x-6)/1.3,y+4)<58)continue;t3FTuft(get('grass'),[x,y,0],5+R()*6,i*3.1+40,gc.map(c=>t3Ik(c,1.25)))}
  t3FTree(get('barkV'),[T3FL.tree[0],T3FL.tree[1],0],104,7,t3Ic('#5a4a3e'));
  for(const[x,y,yaw,w,h,tilt] of[[-30,-152,.2,7,9,.2],[-6,-166,-.1,8,11,-.08]]){t3FStone(get('stone'),[x,y,0],yaw,w,h,2.4,tilt,st,ms);t3Ell(get('dirt'),[x,y+7,0],[w*.55,7,2],t3Ic('#5e4a3a'),{nl:10,nb:5,floor:0,w:.3})}
  // the lantern on its post by the path: the post, the arm, the iron lantern with its flame (it lights who passes under it)
  {const[lx,ly]=T3FL.lamp,wd3=t3Ic('#5e4c3c'),ir=t3Ic('#2e3034'),top=[lx,ly,34];t3FBeam(get('woodV'),[lx,ly,-1],top,2.6,2.6,wd3,[0,1,0]);t3FBeam(get('woodH'),[lx-1,ly,31],[lx+9,ly,31],1.6,1.6,wd3);
    t3FBeam(get('woodV'),[lx+.5,ly,24],[lx+6,ly,31],1.2,1.2,wd3);const L=[lx+8,ly,24.5];T3F.lamp=[L[0],L[1],L[2]+1];t3Line(get('metal'),[[L[0],ly,31],[L[0],ly,28.6]],.25,ir,{w:.1});
    t3IBox(get('metal'),[L[0],ly,28.2],[1,0,0],[0,1,0],[0,0,1],1.9,1.9,.4,ir,{uv:1});t3IBox(get('plain'),[L[0],ly,25.4],[1,0,0],[0,1,0],[0,0,1],1.4,1.4,2.4,t3Ic('#ffc070',40),{uv:1});
    t3IBox(get('metal'),[L[0],ly,22.8],[1,0,0],[0,1,0],[0,0,1],1.8,1.8,.35,ir,{uv:1});for(const sx of[-1,1])for(const sy of[-1,1])t3IBox(get('metal'),[L[0]+sx*1.5,ly+sy*1.5,25.4],[1,0,0],[0,1,0],[0,0,1],.25,.25,2.6,ir,{uv:1})}
  return t3FUp(get,{out:.55})}
// the scarecrow in the field: the pole, the arms, the ragged coat with straw coming out; the head is its own (it turns)
function t3FScareBody(){const get=t3FGet(),[cx,cy]=T3FL.scare,wd=t3Ic('#6e5c48'),coat=t3Ic('#4a4438'),coat2=t3Ic('#3a3630'),straw=[t3Ic('#d8b45a'),t3Ic('#b8943e'),t3Ic('#e8cc78')],rope=t3Ic('#8a7650'),P=(x,y,z)=>[cx+x,cy+y,z];
  t3FBeam(get('woodV'),P(0,0,-1),P(0,0,44),3,3,wd,[0,1,0]);t3FBeam(get('woodH'),P(-17,0,34),P(17,0,34),2.4,2.4,wd);
  t3Ell(get('canvas'),P(0,.5,25),[7.5,4.6,11],coat,{nl:12,nb:8,w:.6});for(const s of[-1,1]){v3Tube(get('canvas'),[P(s*4,0,33),P(s*10,0,33.6),P(s*16,0,33)],[3.4,2.8,2.4],coat2,8);
    for(let k=0;k<5;k++){const a=k/5*TAU;t3Cone(get('grass'),P(s*16,0,33),P(s*(19+t3IH(k,s+3)*2),Math.cos(a)*2.6,33+Math.sin(a)*2.6),.7,straw[k%3],{N:3,w:.2})}}
  for(let k=0;k<7;k++){const x=-5+k*1.7;t3Cone(get('canvas'),P(x,4.4,16),P(x+(t3IH(k,7)-.5)*2,4.8,10.5-t3IH(k,8)*3),1.2,coat,{N:3,w:.3})}
  for(let k=0;k<6;k++){const x=-4+k*1.6;t3Cone(get('grass'),P(x,3.6,15),P(x+(t3IH(k,9)-.5)*3,5,8-t3IH(k,4)*3),.6,straw[k%3],{N:3,w:.2})}
  v3Tube(get('canvas'),[P(-7,4.2,21),P(0,4.9,20.6),P(7,4.2,21)],[.6,.6,.6],rope,5);
  return t3FUp(get,{out:.5})}
function t3FScareHead(){const get=t3FGet(),sack=t3Ic('#b49c74'),dk=t3Ic('#1a1012'),hat=t3Ic('#8a7440'),band=t3Ic('#6a2a24'),thr=t3Ic('#2e2016'),straw=t3Ic('#d8b45a');
  t3Ell(get('canvas'),[0,0,5],[5.2,5,6],sack,{nl:14,nb:10,w:.6});t3Cone(get('canvas'),[0,0,-.6],[0,0,1.6],2.4,sack,{N:6,w:.3});
  for(const s of[-1,1]){t3Sph(get('plain'),[4.4,s*1.9,6.6],1.25,dk,{nl:8,nb:6,w:0});t3Sph(get('plain'),[4.9,s*1.9,6.6],.42,t3Ic('#ff5a2a',150),{nl:6,nb:4,w:0})}
  {const pts=[];for(let k=0;k<=8;k++){const y=-3.2+k*.8;pts.push([4.9-Math.abs(y)*.18,y,2.6+(k%2?.45:-.45)])}t3Line(get('plain'),pts,.24,thr,{w:.2})}
  t3Lathe(get('grass'),[0,0,9.6],[[0,8.4],[.9,8.6]],14,hat,{top:hat});t3Lathe(get('grass'),[0,0,10.4],[[0,4.6],[1.6,4.7],[6.4,3.4],[6.8,0]],12,hat);t3Lathe(get('canvas'),[0,0,10.6],[[0,4.75],[1.4,4.75]],12,band);
  for(let k=0;k<7;k++){const a=k/7*TAU+.4;t3Cone(get('grass'),[Math.cos(a)*4.2,Math.sin(a)*4.2,9],[Math.cos(a)*7,Math.sin(a)*7,6.4],.5,straw,{N:3,w:.15})}
  return t3FUp(get,{out:.45})}
// ------------------------------------------------------------------ the camp: the log the hero sits on (the bark, the sawn ends with their
// rings, moss, little mushrooms), the tent of canvas, the backpack with the red blanket, the shovel stuck in the earth, the stump with the
// axe, the woodpile, the crate of ammunition with its rounds, the lantern out, the pot by the fire; the stones of the fire, the ash
function t3FLog(){const{add,mul,nrm}=RG,f=T3F.face,fwd=[Math.cos(f),Math.sin(f),0],la=nrm([1,-.18,0]),C=[-1.6*fwd[0],-1.6*fwd[1],3.9];return{la,C,LC:add(C,mul(la,-5)),fwd}}
function t3FCamp(){const get=t3FGet(),{add,mul,nrm,cross}=RG,{la,LC}=t3FLog(),F3=[T3FL.fire[0],T3FL.fire[1],0],bark=t3Ic('#6e5846'),cut=t3Ic('#d2aa72'),ring=t3Ic('#a07a4c'),
    moss=t3Ic('#6a8a3c'),wood=t3Ic('#9a7a52'),canv=t3Ic('#7a7652'),iron=t3Ic('#7e848c'),st=t3Ic('#8a8a84'),R=t3IRnd(73);
  // the log
  {const a=add(LC,mul(la,23)),b=add(LC,mul(la,-23));v3Tube(get('barkH'),[a,add(LC,mul(la,8)),add(LC,mul(la,-8)),b],[4.2,4.4,4.5,4.1],bark,16);
    for(const[e,s,r] of[[a,1,4.2],[b,-1,4.1]]){const n=mul(la,s),u=nrm(cross(n,[0,0,1])),w=cross(n,u),mb=get('plain'),c0=v3V(mb,add(e,mul(n,.06)),n,cut),RR=[0,.33,.62,.86,1].map((k,j)=>{const row=[];for(let i=0;i<18;i++){const q=i/18*TAU;row.push(v3V(mb,add(e,add(mul(n,.06),add(mul(u,Math.cos(q)*r*k),mul(w,Math.sin(q)*r*k)))),n,j===4?bark:j%2?ring:cut))}return row});
      for(let i=0;i<18;i++)v3T(mb,c0,RR[1][i],RR[1][(i+1)%18]);for(let j=1;j<4;j++)for(let i=0;i<18;i++){v3T(mb,RR[j][i],RR[j][(i+1)%18],RR[j+1][(i+1)%18]);v3T(mb,RR[j][i],RR[j+1][(i+1)%18],RR[j+1][i])}}
    v3Tube(get('barkV'),[add(LC,add(mul(la,-12),[0,0,3])),add(LC,add(mul(la,-15),[0,-2,9]))],[1.4,.7],bark,6);
    for(const k of[14,-6,-17])t3Ell(get('grass'),add(LC,add(mul(la,k),[0,-1.2,3.9])),[4.4,2.6,1.1],moss,{nl:10,nb:6,w:.3});
    for(const[k,s] of[[-9,1],[-19,1.3],[4,.8]]){const p=add(LC,add(mul(la,k),[0,4.6,-3.9]));t3Lathe(get('plain'),p,[[0,.5*s],[2.2*s,.45*s]],6,t3Ic('#e6dcc4'));t3Ell(get('plain'),add(p,[0,0,2.4*s]),[1.6*s,1.6*s,1*s],t3Ic('#a8c27a',200),{nl:8,nb:5,low:.2,w:.25})}}
  // the tent behind on the left: an A of canvas, its front toward us (one flap closed, the other tied back on the dark inside), the poles,
  // the ridge, the ropes and pegs, the red blanket peeping out
  {const cx=-33,y0=-32,y1=-62,z=22,hw=14,wd=t3Ic('#6a5640'),dkc=t3Ic('#2a2620'),mb=get('canvas'),N=6;for(const y of[y0,y1])t3FBeam(get('woodV'),[cx,y,-1],[cx,y,z+2],1.5,1.5,wd,[1,0,0]);
    t3FBeam(get('woodH'),[cx,y0+3,z+.6],[cx,y1-3,z+.6],1.3,1.3,wd,[1,0,0]);
    for(const s of[-1,1])for(const sd of[1,-1]){const rows=[];for(let k=0;k<=N;k++){const f=k/N,row=[];for(let i=0;i<=6;i++){const g=i/6,sag=Math.sin(f*Math.PI)*Math.sin(g*Math.PI)*1.2;row.push([cx+s*(hw*f+.2)-s*sag*.5,y0+(y1-y0)*g,z*(1-f)+.3-sag])}rows.push(row)}
      const n=nrm([s*sd*.84,0,sd*.55]),idx=rows.map(r=>r.map(p=>v3V(mb,add(p,mul(n,.22)),n,sd>0?canv:dkc)));for(let k=0;k<N;k++)for(let i=0;i<6;i++){v3T(mb,idx[k][i],idx[k][i+1],idx[k+1][i+1]);v3T(mb,idx[k][i],idx[k+1][i+1],idx[k+1][i])}}
    {const n=[0,1,0],q=(x,zz)=>[x,y1+.5,zz];v3Quad(mb,q(cx-hw,0),q(cx+hw,0),q(cx,z),q(cx,z),n,dkc);const i=v3V(mb,q(cx-hw+.5,.2),n,dkc),j=v3V(mb,q(cx+hw-.5,.2),n,dkc),l=v3V(mb,q(cx,z-.6),n,dkc);v3T(mb,i,j,l)}
    {const n=nrm([0,1,.05]);for(const sd of[1,-1]){const nn=mul(n,sd),i=v3V(mb,[cx-hw+.4,y0+.4*sd,.2],nn,canv),j=v3V(mb,[cx-.2,y0+.4*sd,.2],nn,canv),l=v3V(mb,[cx-.2,y0+.4*sd,z-.4],nn,canv);v3T(mb,i,j,l)}
      for(const sd of[1,-1]){const nn=mul(n,sd),i=v3V(mb,[cx+hw-.4,y0+2+.4*sd,.2],nn,canv),j=v3V(mb,[cx+hw*.55,y0+3.2+.4*sd,.2],nn,canv),l=v3V(mb,[cx+.3,y0+.4*sd,z-.6],nn,canv);v3T(mb,i,j,l)}}
    t3Ell(get('plain'),[cx,y0-14,0],[hw-1,15,.5],t3Ic('#141210'),{nl:10,nb:4,floor:0,w:0});
    for(const s of[-1,1]){const px=cx+s*(hw+8);t3Line(get('plain'),[[cx,y0,z+1],[px,y0+9,0]],.22,t3Ic('#3a3028'),{w:.15});t3FBeam(get('woodV'),[px,y0+9,-1],[px,y0+9,2.4],1,1,wd,[0,1,0])}
    v3Tube(get('canvas'),[[cx+2,y0-8,1.8],[cx+5,y0-.5,1.8]],[1.8,1.8],t3Ic('#8a3a32'),10)}
  // the backpack at the left end of the log, the red blanket rolled on it
  {const p=add(LC,add(mul(la,-27),[0,-6,-3.9])),pk=t3Ic('#5e6640');t3Ell(get('canvas'),add(p,[0,0,4.6]),[4.8,3.6,5],pk,{nl:12,nb:8,w:.6});t3Ell(get('canvas'),add(p,[0,1.8,6.6]),[3.8,1.8,2.6],t3Ik(pk,1.12),{nl:10,nb:6,w:.4});
    t3IBox(get('canvas'),add(p,[0,3.3,3]),[1,0,0],[0,1,0],[0,0,1],2.4,.5,1.5,t3Ik(pk,.8),{uv:1});for(const s of[-1,1])v3Tube(get('canvas'),[add(p,[s*2.3,-3.2,8.4]),add(p,[s*2.5,-3.8,3]),add(p,[s*2.3,-2.6,.8])],[.5,.5,.5],t3Ic('#3a3a28'),5);
    v3Tube(get('canvas'),[add(p,[-5,0,10.6]),add(p,[5,0,10.6])],[2.4,2.4],t3Ic('#a8443a'),10);for(const x of[-2.4,2.4])v3Tube(get('canvas'),[add(p,[x-.3,0,10.6]),add(p,[x+.3,0,10.6])],[2.55,2.55],t3Ic('#4a3a2a'),10)}
  // the shovel stuck behind on the left, the stump with the axe further back
  {const g0=[-14,-17,0],top=[-12,-18.5,27];t3FBeam(get('woodV'),add(g0,[0,0,3]),top,1.5,1.5,t3Ic('#7a5a36'),[0,1,0]);t3FBeam(get('woodH'),add(top,[-2.4,0,-.4]),add(top,[2.4,0,.4]),1.2,1.2,t3Ic('#7a5a36'));
    t3IBox(get('metal'),add(g0,[.2,-.1,1.4]),[1,0,0],[0,1,0],[0,0,1],2.8,.4,4.4,iron,{uv:1});t3Ell(get('dirt'),[g0[0],g0[1]+1,0],[5,3.6,1.2],t3Ic('#6a5440'),{nl:10,nb:5,floor:0,w:.3})}
  {const s=[56,-20,0];t3Lathe(get('barkV'),s,[[0,7],[2,6],[9,5.8]],14,bark,{top:f=>f<.3?cut:f<.55?ring:f<.8?cut:ring,rings:[0,.3,.55,.8,1],wob:a=>1+.05*Math.sin(a*4)});
    t3FBeam(get('woodV'),add(s,[1,0,9.4]),add(s,[7,5,19]),1.3,1.3,t3Ic('#8a6a40'));t3IBox(get('metal'),add(s,[.6,-.5,10.6]),RG.nrm([.8,.6,0]),[0,0,1],RG.nrm([-.6,.8,0]),3.4,1.6,.5,iron,{uv:1})}
  // the woodpile behind the fire on the right, the crate with its rounds and the lantern on it, the pot by the fire
  {const p=[33,-24,0],cut2=t3Ic('#a88458'),ring2=t3Ic('#7e5e3c');let k=0;for(const[row,n] of[[0,4],[1,3],[2,2]])for(let i=0;i<n;i++){const y=p[1]-n*2.6+i*5.2+2.6,z=2.4+row*4.4,c=[p[0],y,z],wd=k++%2?t3Ic('#6e5440'):t3Ic('#7a5e46');
      v3Tube(get('barkH'),[add(c,[-8,0,0]),add(c,[8,0,0])],[2.3,2.3],wd,7);for(const s of[-1,1]){const mb=get('plain'),n0=[s,0,0],e=add(c,[s*8.05,0,0]),c0=v3V(mb,e,n0,cut2),rr=[];for(let q=0;q<7;q++){const an=q/7*TAU;rr.push(v3V(mb,add(e,[0,Math.cos(an)*2.2,Math.sin(an)*2.2]),n0,q%2?ring2:cut2))}for(let q=0;q<7;q++)v3T(mb,c0,rr[q],rr[(q+1)%7])}}}
  {const c=[43,-1,0];t3IBox(get('planks'),add(c,[0,0,3]),[1,0,0],[0,1,0],[0,0,1],5.5,3.6,3,wood,{uv:1,top:t3Ik(wood,1.1)});for(const z of[1.8,4.4])t3IBox(get('metal'),add(c,[0,0,z]),[1,0,0],[0,1,0],[0,0,1],5.6,3.7,.3,t3Ic('#4a4c50'),{uv:1});
    t3IBox(get('plain'),add(c,[0,3.75,3]),[1,0,0],[0,1,0],[0,0,1],2.2,.08,1.1,t3Ic('#2a2018'));for(let i=0;i<3;i++)t3Lathe(get('metal'),add(c,[-3.4+i*1.6,-1.6,6]),[[0,.7],[2.6,.7],[3.3,.32]],8,t3Ic('#d8a03a'),{top:t3Ic('#eab44a')});
    const L=add(c,[2.4,.4,6]),gl=t3Ic('#c8d4c8',230);t3IBox(get('metal'),add(L,[0,0,.5]),[1,0,0],[0,1,0],[0,0,1],1.8,1.8,.5,t3Ic('#3a3c40'),{uv:1});t3IBox(get('plain'),add(L,[0,0,3.4]),[1,0,0],[0,1,0],[0,0,1],1.4,1.4,2.4,gl,{uv:1});
    t3Lathe(get('metal'),add(L,[0,0,5.8]),[[0,2.2],[1.8,.4]],4,t3Ic('#3a3c40'));t3Line(get('metal'),[add(L,[-1.4,0,7.2]),add(L,[0,0,9.2]),add(L,[1.4,0,7.2])],.2,t3Ic('#2a2c30'),{w:.1})}
  {const pc=add(F3,[-10.5,8.5,0]);t3Rock(get('stone'),pc,[4.6,4,1.4],5,st);t3Lathe(get('metal'),add(pc,[0,0,1.3]),[[0,2.4],[1.4,3.6],[4.2,3.7],[4.8,3.4]],12,t3Ic('#3a3c40'),{top:t3Ic('#5a4632')});
    t3Line(get('metal'),[add(pc,[-3.6,0,5.6]),add(pc,[0,0,9.4]),add(pc,[3.6,0,5.6])],.3,t3Ic('#26282c'),{w:.15})}
  // the ring of stones, the ash, the earth burnt (the burning logs are their own: their embers breathe)
  for(let i=0;i<10;i++){const a=i/10*TAU+.2;t3Rock(get('stone'),add(F3,[Math.cos(a)*8.6,Math.sin(a)*8.6,-.3]),[2.6+.3*Math.sin(a*3),2.3,2.3],i*7+3,t3Ik(st,.9+.2*t3IH(i,4)),{nl:8,nb:5})}
  t3Lathe(get('char'),add(F3,[0,0,-.4]),[[0,7.6],[.7,6.8],[.9,0]],16,t3Ic('#4e4a46'));
  // pebbles and twigs in the clearing
  for(let i=0;i<22;i++){const a=R()*TAU,r=12+R()*34,p=[6+Math.cos(a)*r*1.2,-2+Math.sin(a)*r*.8,0];if(Math.hypot(p[0]-F3[0],p[1]-F3[1])<12)continue;t3Rock(get('stone'),p,[.7+R()*1.3,.6+R(),.5+R()*.7],i+90,t3Ik(st,.8+R()*.3),{nl:6,nb:3})}
  for(let i=0;i<9;i++){const a=R()*TAU,r=14+R()*30,p=[6+Math.cos(a)*r*1.2,-2+Math.sin(a)*r*.8,.4],b=R()*TAU;t3Line(get('barkH'),[p,[p[0]+Math.cos(b)*5,p[1]+Math.sin(b)*5,.4]],.35,t3Ic('#5a4632'),{w:.2})}
  return t3FUp(get,{out:.38})}
function t3FFireLogs(){const get=t3FGet(),{add,mul}=RG,F3=[T3FL.fire[0],T3FL.fire[1],0],ch=t3Ic('#3a302a'),emb=t3Ic('#ff6a24',70),emb2=t3Ic('#ffa040',90);
  for(let i=0;i<5;i++){const a=i/5*TAU+.5,p=add(F3,[Math.cos(a)*7.2,Math.sin(a)*7.2,1.2]),q=add(F3,[Math.cos(a)*1.2,Math.sin(a)*1.2,9.5]),d=add(q,mul(p,-1));v3Tube(get('char'),[p,add(p,mul(d,.55)),q],[1.5,1.35,.9],ch,8);
    t3Sph(get('plain'),add(p,mul(d,.82)),1.05,emb,{nl:6,nb:4,w:0});t3Sph(get('plain'),add(p,mul(d,.5)),.8,emb2,{nl:6,nb:4,w:0})}
  for(let i=0;i<9;i++){const a=i*1.9,r=1+(i%4)*1.2;t3Sph(get('plain'),add(F3,[Math.cos(a)*r,Math.sin(a)*r,.5]),.8+(i%3)*.25,i%2?emb:emb2,{nl:6,nb:4,w:0})}
  return t3FUp(get,{out:.3})}
// ------------------------------------------------------------------ the crows: the body, the head with its beak and its red eye, the tail, the
// wings that beat (six poses, blended) and the one that sits with the wings folded
function t3FCrow(f,sit){const mb=v3MB(),blk=t3Ic('#1e1c26'),blk2=t3Ic('#2c2a38'),bk=t3Ic('#c0a050'),eye=t3Ic('#ff4a2a',60);
  t3Ell(mb,[0,0,0],[4.2,1.9,1.9],blk,{nl:10,nb:7,w:.5});t3Sph(mb,[3.7,0,1.3],1.65,blk,{nl:8,nb:6,w:.5});t3Cone(mb,[5,0,1.2],[7.4,0,.7],.6,bk,{N:4,w:.3});
  for(const s of[-1,1])t3Sph(mb,[4.7,s*.95,1.7],.36,eye,{nl:5,nb:3,w:0});
  t3Strip(mb,[[-3.4,-.9,.3],[-3.4,.9,.3]],[[-7.2,-2.4,sit?-1.4:.7],[-7.2,2.4,sit?-1.4:.7]],[0,0,1],blk2,{w:.3});t3Strip(mb,[[-3.4,.9,.3],[-3.4,-.9,.3]],[[-7.2,2.4,sit?-1.5:.6],[-7.2,-2.4,sit?-1.5:.6]],[0,0,-1],blk2,{w:.3});
  const a=sit?-.2:Math.sin(f*TAU)*.95;for(const s of[-1,1]){const r=k=>[k[0],s*k[1],k[2]],w1=sit?[[1,1.6,.6],[-1.5,2.2,.3],[-4.6,2.3,-.2]]:[[1,1.4,.6],[-.6,1.4+5*Math.cos(a),.6+5*Math.sin(a)],[-2.8,1.4+10*Math.cos(a*1.15),.6+10*Math.sin(a*1.15)]],
      w0=sit?[[1.4,1.2,1.2],[-1,2,.9],[-4.6,2.1,.2]]:[[2.6,1.4,.5],[1.6,1.4+5*Math.cos(a),.5+5*Math.sin(a)],[-.4,1.4+9*Math.cos(a*1.15),.5+9*Math.sin(a*1.15)]];
    t3Strip(mb,w0.map(r),w1.map(r),[0,0,1],blk2,{w:.35});t3Strip(mb,w1.map(r),w0.map(r),[0,0,-1],blk2,{w:.35})}
  if(sit)for(const s of[-1,1])t3Line(mb,[[.6,s*.8,-1.6],[.8,s*.8,-3.4]],.3,bk,{w:.1});else for(const s of[-1,1])t3Line(mb,[[-1.4,s*.6,-1.4],[-3,s*.5,-1.8]],.28,bk,{w:.1});
  return v3Up(mb)}
// ------------------------------------------------------------------ the work of the first time, a little each frame (the drawing of 66 in
// the meantime), then the poses of the zombies (their kinds walk on the path as soon as their poses are ready)
function t3FJobs(){const J=[],X=T3F.X,S=T3F.S;
  for(const k of Object.keys(T3FTX))J.push(()=>{X[k]=t3Tex(t3FPaint(k),true,0,0,true)});
  J.push(()=>{X.barkH=t3Tex(t3FRot(T3F.cv.barkV),true,0,0,true);X.woodH=t3Tex(t3FRot(T3F.cv.woodV),true,0,0,true);X.moon=t3Tex(t3FMoonCv(),true);T3F.cv={}});
  J.push(()=>{T3F.face=Math.atan2(T3FL.fire[1],T3FL.fire[0]);S.push(...t3FGround())});
  J.push(()=>S.push(...t3FHills()));J.push(()=>S.push(...t3FFarm()));J.push(()=>S.push(...t3FMill()));J.push(()=>{T3F.G.blades=t3FBlades()});
  J.push(()=>S.push(...t3FField()));J.push(()=>{S.push(...t3FScareBody());T3F.G.head=t3FScareHead()});J.push(()=>S.push(...t3FCamp()));J.push(()=>{T3F.G.logs=t3FFireLogs()});
  J.push(()=>{T3F.G.crow=[0,1,2,3,4,5].map(i=>t3FCrow(i/6,false));T3F.G.crowSit=t3FCrow(0,true)});
  J.push(()=>{const p=T3F.posts||[];T3F.perch=[{p:[T3FL.scare[0]+15,T3FL.scare[1],35.6],yaw:2.6,t:0}].concat([p[Math.floor(p.length*.36)],p[Math.floor(p.length*.62)]].filter(Boolean).map((q,i)=>({p:[q[0]+Math.sin(q[2])*q[3],q[1],Math.cos(q[2])*q[3]+3.4],yaw:i?.6:2.2,t:i*3})))});
  J.push(()=>{T3F.ready=true});return J}
// (one pose in two of 106's: the drawing slides between them all the same, and the phone keeps half the memory)
function t3FZJobs(){const J=[];for(const k of['zombie','lanterna','strisciante','minatore']){for(const an of['walk','idle'])for(let i=0;i<Z3.NF[an];i+=2)J.push(()=>z3Get(k,an,i,()=>true));J.push(()=>{T3F.zok[k]=1})}return J}
function t3FBuild(ms){if(!T3F.q){T3F.q=t3FJobs();T3F.qi=0}const t0=performance.now();
  while(T3F.qi<T3F.q.length&&performance.now()-t0<ms){try{T3F.q[T3F.qi++]()}catch(e){t3Err(e);T3F.bad=true;return}}}
function t3FZBuild(ms){if(!T3F.zq){T3F.zq=t3FZJobs();T3F.zi=0}const t0=performance.now();while(T3F.zi<T3F.zq.length&&performance.now()-t0<ms){try{T3F.zq[T3F.zi++]()}catch(e){t3Err(e);T3F.zi=T3F.zq.length}}}
// ------------------------------------------------------------------ the camera: low, from the south, a little farther than 66's drawing; the
// camp where 66 has it (the hero a little above the «Cambia» pill), the horizon under the top bar so the sky shows between
function t3FaloCam(F){const cw=campCv.width,ch=campCv.height,asp=cw/ch,C=T3FC,fovy=C.fovy*Math.PI/180,th=Math.tan(fovy/2),fpx=(ch/2)/th,spx=F.hs*F.u*C.k,
    S0=[F.ox+156*F.u,F.oy+(HOME_Y-C.up*F.hs)*F.u],cr=campCv.getBoundingClientRect(),top=Math.max(0,($('topbar').getBoundingClientRect().bottom-cr.top)*F.dpr),
    want=top+(S0[1]-top)*C.hor,pit=Math.max(C.p0,Math.min(C.p1,Math.atan2(S0[1]-want,fpx)*180/Math.PI))*Math.PI/180,D=fpx/spx,tg=[0,0,C.tz],eye=[tg[0],tg[1]+D*Math.cos(pit),tg[2]+D*Math.sin(pit)];
  T3.eye=eye;T3.tg=tg;T3.dist=D;T3.near=Math.max(6,D*.2);T3.far=D+5400;const q=v3Mul(v3Persp(fovy,asp,T3.near,T3.far),v3Look(eye,tg,[0,0,1]));
  const P=tg,cx=q[0]*P[0]+q[4]*P[1]+q[8]*P[2]+q[12],cy=q[1]*P[0]+q[5]*P[1]+q[9]*P[2]+q[13],cwv=q[3]*P[0]+q[7]*P[1]+q[11]*P[2]+q[15],dx=(2*S0[0]/cw-1)-cx/cwv,dy=(1-2*S0[1]/ch)-cy/cwv;
  T3.vp=v3Mul(new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,dx,dy,0,1]),q);
  const f=[tg[0]-eye[0],tg[1]-eye[1],tg[2]-eye[2]],fl=Math.hypot(...f);T3.F3=[f[0]/fl,f[1]/fl,f[2]/fl];T3.R3=[1,0,0];const R=T3.R3,Fv=T3.F3;T3.U3=[R[1]*Fv[2]-R[2]*Fv[1],R[2]*Fv[0]-R[0]*Fv[2],R[0]*Fv[1]-R[1]*Fv[0]];if(T3.U3[2]<0)T3.U3=T3.U3.map(x=>-x);
  T3.kpx=cw/(2*D*th*asp);const hz=t3IProj([eye[0],eye[1]-1e5,eye[2]]);T3F.hy=hz?hz[1]:ch*.2;T3F.top=top;T3F.zW=(eye[1]-T3FL.path)*th*asp*1.1+30}
// ------------------------------------------------------------------ the sky: from the sick green haze on the horizon to the deep blue, the
// stars that twinkle, the moon's light round it; then the moon, the clouds that pass (lit on their edge near the moon)
const T3FS_FSKY=`precision mediump float;uniform vec3 uTop;uniform vec3 uMid;uniform vec3 uHor;uniform float uHy;uniform float uT;uniform vec2 uRes;uniform vec3 uMoon;varying vec2 vU;
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){float y=gl_FragCoord.y/uRes.y,e=y-uHy;vec3 c=mix(uHor,uMid,smoothstep(-.01,.16,e));c=mix(c,uTop,smoothstep(.12,.5,e));
 vec2 fc=gl_FragCoord.xy/uRes.y*75.;vec2 g=floor(fc),l=fract(fc)-.5;float h=h1(g);
 if(h>.86){vec2 o=vec2(h1(g+3.1),h1(g+7.7))-.5;float d=length(l-o*.55);float tw=.55+.45*sin(uT*(.8+h*2.5)+h*70.);c+=vec3(.86,.92,1.)*smoothstep(.13,0.,d)*tw*(h>.97?1.:.55)*smoothstep(.03,.25,e);}
 vec2 mp=(gl_FragCoord.xy-uMoon.xy)/uRes.y;float md=length(mp);c+=vec3(.5,.62,.6)*(exp(-md*md*90.)*.5+exp(-md*9.)*.12)*uMoon.z;gl_FragColor=vec4(c,1.);}`;
const T3VS_SCR=`attribute vec2 aP;attribute vec2 aT;attribute vec4 aC;varying vec2 vT;varying vec4 vC;void main(){vT=aT;vC=aC;gl_Position=vec4(aP,0.,1.);}`;
const T3FS_SCR=`precision mediump float;uniform sampler2D uTex;varying vec2 vT;varying vec4 vC;void main(){vec4 t=texture2D(uTex,vT);float a=t.a*vC.a;if(a<.003)discard;gl_FragColor=vec4(vC.rgb*t.rgb,a);}`;
// quads on the screen (in the menu canvas' pixels): [x, y, w, h, r, g, b, a]
function t3FScr(list,tex,add){if(!list.length)return;const gl=T3.gl;if(!T3F.pScr)T3F.pScr=t3Prog(T3VS_SCR,T3FS_SCR,['aP','aT','aC']);const P=T3F.pScr,D=[],W=campCv.width,H=campCv.height;
  for(const[x,y,w,h,r,g,b,a] of list){const X0=x/W*2-1,X1=(x+w)/W*2-1,Y0=1-y/H*2,Y1=1-(y+h)/H*2;for(const[px,py,u,v] of[[X0,Y0,0,0],[X1,Y0,1,0],[X1,Y1,1,1],[X0,Y0,0,0],[X1,Y1,1,1],[X0,Y1,0,1]])D.push(px,py,u,v,r,g,b,a)}
  gl.useProgram(P.p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(P.u.uTex,0);gl.bindBuffer(gl.ARRAY_BUFFER,T3.db);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(D),gl.DYNAMIC_DRAW);
  for(let i=0;i<3;i++)gl.enableVertexAttribArray(i);for(let i=3;i<8;i++)gl.disableVertexAttribArray(i);gl.vertexAttribPointer(0,2,gl.FLOAT,false,32,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,32,8);gl.vertexAttribPointer(2,4,gl.FLOAT,false,32,16);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,add?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,D.length/8);gl.disable(gl.BLEND)}
const T3F_CL=[[.05,.3,.62,.11,4,.72],[.48,.12,.5,.09,6.5,.66],[.8,.55,.55,.1,3,.7],[.3,.72,.7,.12,5,.62],[.66,.86,.48,.09,7.5,.6],[.15,.95,.6,.1,4.4,.55]];
function t3FSky(t){const gl=T3.gl,L=T3F_LUCE[T3.luce]||T3F_LUCE.chiara;if(!T3F.pSky)T3F.pSky=t3Prog(V3VS_POST,T3FS_FSKY,['aP']);const Q=T3F.pSky,ch=campCv.height,cw=campCv.width,hy=T3F.hy,tp=T3F.top,
    mx=cw*.6,my=hy-(hy-tp)*.58,R=ch*.028;
  gl.useProgram(Q.p);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.uniform3fv(Q.u.uTop,t3I01(t3Ic(L.top)));gl.uniform3fv(Q.u.uMid,t3I01(t3Ic(L.mid)));gl.uniform3fv(Q.u.uHor,t3I01(t3Ic(L.hor)));
  gl.uniform1f(Q.u.uHy,1-hy/ch);gl.uniform1f(Q.u.uT,t%1000);gl.uniform2f(Q.u.uRes,T3.cw,T3.ch);gl.uniform3f(Q.u.uMoon,mx/cw*T3.cw,(1-my/ch)*T3.ch,1);
  gl.bindBuffer(gl.ARRAY_BUFFER,T3.qb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);for(let k=1;k<8;k++)gl.disableVertexAttribArray(k);gl.drawArrays(gl.TRIANGLES,0,3);
  t3FScr([[mx-R*4.2,my-R*4.2,R*8.4,R*8.4,.45,.6,.52,.55]],T3.glow,true);t3FScr([[mx-R,my-R,R*2,R*2,1,1,1,1]],T3F.X.moon,false);
  const X=t3ITx(),cl=[];for(const[x0,yk,wk,hk,sp,a] of T3F_CL){const w=cw*wk,h=ch*hk,x=((x0*(cw+w*2)+t*sp*(LOWFX?0:1)*cw/390)%(cw+w*2))-w,y=tp+(hy-tp)*yk-h*.5,cx=x+w/2,cy=y+h/2,k=Math.exp(-((cx-mx)**2+(cy-my)**2)/(R*R*60));
    cl.push([x,y,w,h,.1+k*.34,.13+k*.4,.17+k*.38,a*(.75+k*.25)])}t3FScr(cl,X.cloud,false);gl.enable(gl.DEPTH_TEST);gl.depthMask(true)}
// ------------------------------------------------------------------ the zombies on the path: they walk, stop, snap round to look at you (or
// at the hero by the fire) with a groan, and walk on; the scarecrow's head; the crows
const T3F_ZK=['zombie','lanterna','strisciante','zombie','minatore'];
const T3F_EYE={zombie:[[13.9,-1.6,34.8],[13.9,3,34.8]],strisciante:[[13.3,-2.2,12.5],[13.3,2.2,12.5]],minatore:[[12.2,3.3,32.5]],lanterna:[[21.9,-2.6,23.3],[21.9,3,23.3]]};
function t3FZNew(mid){const ks=T3F_ZK.filter(k=>T3F.zok[k]);if(!ks.length)return null;const kind=ks[Math.floor(Math.random()*ks.length)],dir=Math.random()<.5?1:-1,W=T3F.zW,x=mid?(Math.random()-.5)*W:dir>0?-W-20-Math.random()*30:W+20+Math.random()*30;
  return{id:Math.floor(Math.random()*97),kind,x,y:t3FPathY(x)+(Math.random()-.5)*8,dir,face:dir>0?0:Math.PI,st:'walk',t:0,next:3+Math.random()*5,p:Math.random(),spd:(kind==='strisciante'?4.5:6.5)+Math.random()*3,look:0,sc:kind==='lanterna'?1.05:.96+Math.random()*.08}}
function t3FZombies(dt){const Z=T3F.Z,W=T3F.zW;if(!T3F.zInit&&T3F.zok.zombie){T3F.zInit=1;const z=t3FZNew(1);if(z)Z.push(z)}
  if(Z.length<3&&(T3F.zT-=dt)<=0){const z=t3FZNew(0);if(z)Z.push(z);T3F.zT=5+Math.random()*7}
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];z.t+=dt;if(z.x<-W-90||z.x>W+90){Z.splice(i,1);continue}
    if(z.st==='walk'){z.x+=z.dir*z.spd*dt;z.y+=(t3FPathY(z.x)-z.y)*Math.min(1,dt*.5);z.p=(z.p+dt/(z.kind==='strisciante'?2.2:1.7))%1;if(z.t>z.next&&Math.abs(z.x)<W*.7){z.st='stop';z.t=0;z.next=.7+Math.random()*1.2}}
    else if(z.st==='stop'){z.p=(z.p+dt/2.4)%1;if(z.t>z.next){z.st='look';z.t=0;z.next=1.8+Math.random()*2.2;z.look=Math.random()<.55?1:2;try{sndZGroan({x:180+z.x*.9})}catch(e){}}}
    else if(z.st==='look'){z.p=(z.p+dt/2.4)%1;if(z.t>z.next){z.st='back';z.t=0}}
    else if(z.st==='back'){z.p=(z.p+dt/2.4)%1;if(z.t>.6){z.st='walk';z.t=0;z.next=5+Math.random()*7}}
    const tgt=z.st==='look'?(z.look===1?Math.atan2(T3.eye[1]-z.y,T3.eye[0]-z.x):Math.atan2(-z.y,-z.x)):z.dir>0?0:Math.PI,k=z.st==='look'?Math.min(1,dt*16):Math.min(1,dt*2.6);
    let d=tgt-z.face;d=Math.atan2(Math.sin(d),Math.cos(d));z.face+=d*k}}
function t3FZItems(t){const items=[];for(const z of T3F.Z){const an=z.st==='walk'?'walk':'idle',NF=Z3.NF[an],f=(z.p%1)*NF/2,i0=(Math.floor(f)*2)%NF,i1=(i0+2)%NF,A=Z3.M.get(z3Key(z.kind,an,i0)),B=Z3.M.get(z3Key(z.kind,an,i1));if(!A){z.M=null;continue}
    const sc=z.sc,a=z.face,c=Math.cos(a),s=Math.sin(a);z.M=v3M4([c*sc,s*sc,0],[-s*sc,c*sc,0],[0,0,sc],[z.x,z.y,0]);z.em=(z.st==='look'?.85:.5)+.45*Math.sin(t*2.2+z.id*1.7);
    items.push({m:A,m2:B&&B.nv0===A.nv0?B:A,kf:f-Math.floor(f),M:z.M,out:.62,em:z.em})}return items}
// the scarecrow: now and then it turns its head to you all at once and bends it too far to the side, its eyes light up; then slowly back
function t3FScare(dt){const S=T3F.sc;S.t+=dt;if(S.st==='idle'&&S.t>S.next){S.st='turn';S.t=0;try{sndZGroan({x:180+T3FL.scare[0]*.9})}catch(e){}}
  else if(S.st==='turn'&&S.t>2.6){S.st='back';S.t=0}else if(S.st==='back'&&S.t>2.2){S.st='idle';S.t=0;S.next=8+Math.random()*7}
  const want=S.st==='turn'?[Math.atan2(T3.eye[1]-T3FL.scare[1],T3.eye[0]-T3FL.scare[0]),.62,1]:[Math.PI*.5+.75,.16,0],k=S.st==='turn'?Math.min(1,dt*14):Math.min(1,dt*1.2);
  S.yaw+=(want[0]-S.yaw)*k;S.tilt+=(want[1]-S.tilt)*k;S.glow+=(want[2]-S.glow)*Math.min(1,dt*(S.st==='turn'?6:2))}
function t3FScareM(){const S=T3F.sc,c=Math.cos(S.yaw),s=Math.sin(S.yaw),ct=Math.cos(S.tilt),st=Math.sin(S.tilt);
  return v3Mul(v3M4([c,s,0],[-s,c,0],[0,0,1],[T3FL.scare[0],T3FL.scare[1],37.5]),v3M4([1,0,0],[0,ct,st],[0,-st,ct],[0,0,0]))}
function t3FCrows(dt,t){if(!LOWFX&&(T3F.crT-=dt)<=0){T3F.crT=13+Math.random()*13;const dir=Math.random()<.5?1:-1,y0=-420-Math.random()*120,z0=92+Math.random()*40,W=(T3.eye[1]-y0)*Math.tan(T3FC.fovy*Math.PI/360)*.6+60;
    for(let i=0;i<3+Math.floor(Math.random()*3);i++)T3F.cr.push({x:-dir*(W+i*16),y:y0+(Math.random()-.5)*40,z:z0+(Math.random()-.5)*14,dir,ph:Math.random(),v:46+Math.random()*12,W:W+80})}
  for(let i=T3F.cr.length-1;i>=0;i--){const c=T3F.cr[i];c.x+=c.dir*c.v*dt;c.ph=(c.ph+dt*2.3)%1;c.z+=Math.sin(t*1.7+i)*dt*3;if(Math.abs(c.x)>c.W+40&&Math.sign(c.x)===c.dir)T3F.cr.splice(i,1)}
  for(const p of T3F.perch){p.t+=dt;if(p.t>4+((p.p[0]*7)%5+5)%5){p.t=0;p.yaw+=(Math.random()-.5)*2.2}}}
function t3FCrowItems(){const items=[],G=T3F.G;if(!G.crow)return items;
  for(const c of T3F.cr){const f=c.ph*6,i0=Math.floor(f)%6,a=c.dir>0?0:Math.PI,cs=Math.cos(a),sn=Math.sin(a),s=.9;items.push({m:G.crow[i0],m2:G.crow[(i0+1)%6],kf:f-Math.floor(f),M:v3M4([cs*s,sn*s,0],[-sn*s,cs*s,0],[0,0,s],[c.x,c.y,c.z]),out:.4})}
  for(const p of T3F.perch){const a=p.yaw,cs=Math.cos(a),sn=Math.sin(a),s=.82;items.push({m:G.crowSit,M:v3M4([cs*s,sn*s,0],[-sn*s,cs*s,0],[0,0,s],p.p),out:.4})}return items}
// ------------------------------------------------------------------ the frame
function t3FaloFrame(dt,k){const t0=performance.now(),F=campFrame(),t=CAMP.t,PF=T3F.prof,pk=PF?(q=>{T3.gl.finish();const n=performance.now();PF[q]=(PF[q]||0)+n-PF._;PF._=n}):()=>{};if(PF){PF._=t0;PF.n=(PF.n||0)+1}FALO.t+=dt;
  t3Place('menu');T3I.seen++;T3I.live=true;if(T3.cv.style.display==='none')T3.cv.style.display='block';t3IslSize();
  const gl=T3.gl,key=T3.luce,keep=T3LUCI[key],L0=T3F_LUCE[key]||T3F_LUCE.chiara,lean=T3.lean;T3LUCI[key]=Object.assign({},keep,L0);T3.lean=0;
  try{t3FaloCam(F);T3.fogP=[T3.dist+240,3000,.9];const Lc=t3L(),fl=.86+.08*Math.sin(t*13.1)+.05*Math.sin(t*7.7+1)+.04*Math.sin(t*23.3),F3=[T3FL.fire[0],T3FL.fire[1],0];T3.frame++;T3.nMesh=0;T3.nCard=0;
    t3FZBuild(LOWFX?2:3);t3FZombies(dt);t3FCrows(dt,t);t3FScare(dt);T3F.bladeA-=dt*.32;
    // the lights: the fire (it flickers and breathes), its glow low on the ground, the lit window of the farm, the lamps the zombies carry
    T3I.Lt=[];t3IL([F3[0],F3[1],12],175*fl,[1,.54,.22],L0.fire*fl);t3IL([F3[0]-2,F3[1]+2,3],80,[1,.42,.16],.9*fl);
    if(T3F.win){const f2=.8+.2*Math.sin(t*3.1)*Math.sin(t*1.7+.5);t3IL(T3F.win.l,70,[1,.6,.28],.95*f2)}
    if(T3F.lamp){const f3=.85+.15*Math.sin(t*7.3)*Math.sin(t*3.1+1);t3IL(T3F.lamp,68,[1,.7,.36],1.05*f3)}
    for(const z of T3F.Z){const a=z.face,c=Math.cos(a),s=Math.sin(a),P=q=>[z.x+(c*q[0]-s*q[1])*z.sc,z.y+(s*q[0]+c*q[1])*z.sc,q[2]*z.sc];
      if(z.kind==='lanterna')t3IL(P([24.5,11.5,9]),75,[.85,1,.5],.75);else if(z.kind==='minatore')t3IL(P([30,0,20]),70,[1,.9,.6],.55)}
    t3ILights();
    gl.bindFramebuffer(gl.FRAMEBUFFER,T3.fbo);gl.viewport(0,0,T3.cw,T3.ch);const fc=Lc.fog;gl.clearColor(fc[0],fc[1],fc[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    t3FSky(t);pk('sky');
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.BLEND);
    // the world: the ground, the hills, the farm, the windmill and its blades, the field, the camp, the burning logs, the scarecrow's head
    {const H=T3F.hub,a=T3F.bladeA,ca=Math.cos(a),sa=Math.sin(a),MH=t3FScareM(),list=T3F.S.concat(T3F.G.blades.map(it=>Object.assign({},it,{M:v3M4([ca,0,-sa],[0,1,0],[sa,0,ca],H)})),
        T3F.G.logs.map(it=>Object.assign({},it,{em:.55+.45*fl})),T3F.G.head.map(it=>Object.assign({},it,{M:MH})));t3FDraw(list)}
    pk('world');
    // the zombies and the crows (in the mist), then the hero by the fire and his gun (no mist on the camp)
    {const zi=t3FZItems(t).concat(t3FCrowItems());if(zi.length)t3Draw3(zi,{})}pk('zombies');
    {const L=T3LUCI[key],m0=L.mist;L.mist=0;try{t3FHero(t,k,F)}finally{L.mist=m0}}pk('hero');
    t3FAir(dt,t,fl,F3);pk('fx');
    t3Post({hit:0,low:0,fade:CAMP.walk>0&&t-CAMP.walk>.9?Math.min(1,(t-CAMP.walk-.9)/.6):0})}
  finally{T3LUCI[key]=keep;T3.lean=lean}
  campX.setTransform(1,0,0,1,0,0);campX.clearRect(0,0,campCv.width,campCv.height);
  T3F.ms=T3F.ms?T3F.ms*.9+(performance.now()-t0)*.1:performance.now()-t0}
// the hero on the log (k: 0 standing, 1 sitting): his clothes are the ones he wears, no weapon in his hands; the gun on the log at his left.
// Going to play he stands up and walks off into the dark, the gun in his hand
function t3FHero(t,k,F){const{add,mul,nrm}=RG,{la,C,fwd}=t3FLog(),f=T3F.face,st=Object.assign({},heroStyle(),{gun:null,held:null,quiver:false}),P9=(t%9)/9,kk=k==null?1:k,items=[];
  if(!(CAMP.walk>0)&&typeof ARMI3D!=='undefined'&&typeof v3GunMesh==='function'){const gm=v3GunMesh(FALO.gun,{});if(gm){const at=add(C,add(mul(la,-12),[0,0,4.4])),fr=ARMI3D.frame(add(at,[0,0,.9]),nrm(add(mul(la,-1),mul(fwd,.3))),nrm(add(fwd,[0,0,.25])),.92);
    items.push({m:gm.mesh,M:v3M4(mul(fr.X,fr.s),mul(fr.Y,fr.s),mul(fr.Z,fr.s),fr.O),out:.25})}}
  if(items.length)t3Draw3(items,{});
  let c,al=1;const wk=CAMP.walk>0?clamp((Math.min(1,(t-CAMP.walk)/1.5)-.3)/.7,0,1):0,ks=CAMP.walk>0?Math.min(kk,1-Math.min(1,Math.min(1,(t-CAMP.walk)/1.5)/.3)):kk;
  if(wk>0){c={x:-30*wk,y:-46*wk,lz:0,face:Math.atan2(-46,-30),anim:'walk',p:(t*1.4)%1,sc:1/T3CHK,o:{style:Object.assign({},st,{gun:FALO.gun})}};al=1-wk*wk}
  else if(ks>=.999)c={x:0,y:0,lz:0,face:f,anim:'sit',p:P9,sc:1/T3CHK,o:{style:st,seat:T3FL.seat}};
  else c={x:0,y:0,lz:0,face:f,anim:'idle',p:(t/2.4)%1,sc:1/T3CHK,o:{style:st,seat:T3FL.seat,mix:['sit',P9,ks]}};
  const dS=G.deathT;G.deathT=null;let H=null;try{H=t3HeroItems(c)}catch(e){t3Err(e)}finally{G.deathT=dS}
  if(H&&al>.02){t3Draw3(H.items,{H:H.imp?null:{R:H.R,MF:H.MF,a:H.a,Hw:H.Hw},al:al<.99?Math.max(.3,al):1});if(H.imp){t3CardsBegin();t3HeadCard(H.R,H.Hw,H.a);t3CardsEnd()}}
  const q=t3IProj([0,0,0]);if(q){const s=t3IKpx(q[2]);CAMP.hero={x:q[0],y:q[1]-7*s,w:20*s,h:44*s,dpr:F.dpr}}}
// ------------------------------------------------------------------ in the air: the mist low on the field, the flames, the glows, the sparks,
// the smoke, the steam of the pot, the eyes of the zombies and of the scarecrow, the lit window
const T3FS_FLAME=`precision highp float;uniform float uT;varying vec2 vT;varying vec4 vC;varying vec3 vW;varying vec2 vS;
void main(){float v=vT.y,u=vT.x,sw=vC.a*2.-1.;float cx=sw*v*v*.65+sin(v*6.5-uT*11.+sw*7.)*.07*v;float b=clamp(v/.26,0.,1.);
 float w=sqrt(b*(2.-b))*pow(max(0.,1.-v),.72)*1.12;float d=abs(u-cx)-w;float a=1.-smoothstep(-.1,0.,d);if(a<.02)discard;gl_FragColor=vec4(vC.rgb,a);}`;
const T3F_TONG=[[-3.2,10,1.3,0],[3,11,1.1,1.7],[-.6,15,1.5,3.1],[1.6,12.5,1.2,4.6],[-2,8,1,5.9]],T3F_FLAY=[[[.78,.14,.05],1.18,0],[[1,.42,.08],.92,.6],[[1,.72,.2],.66,1.2],[[1,.96,.74],.34,1.7]];
function t3FAir(dt,t,fl,F3){const gl=T3.gl,X=t3ITx(),R3=T3.R3;if(!T3I.pCl)T3I.pCl=t3Prog(T3VS_BB,T3FS_ICL,['aP','aQ','aT','aC']);if(!T3F.pFl)T3F.pFl=t3Prog(T3VS_BB,T3FS_FLAME,['aP','aQ','aT','aC']);
  gl.enable(gl.BLEND);gl.depthMask(false);
  // the mist: sheets lying low on the field, drifting
  if(!LOWFX){gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);for(let i=0;i<12;i++){const h=q=>t3IH(i*7+q,5.3),w=150+h(1)*120,d=60+h(2)*50,y=-90-h(3)*420,x=((h(4)*900+t*(3+h(5)*4))%900)-450,z=3+h(6)*9,a=.16+.12*Math.sin(t*.3+i);
      t3QW([[x-w,y+d,z],[x+w,y+d,z],[x+w,y-d,z],[x-w,y-d,z]],0,0,1,1,.5,.62,.62,a)}t3QFlush(T3I.pCl,X.cloud)}
  // the flames: tongues in four colours, the red behind, the white heart in front
  {const S=1.45,b=[F3[0],F3[1],3.5];for(const[col,kk,dz] of T3F_FLAY)for(const[ox,h,w,ph] of T3F_TONG){const H=h*kk*(.82+.18*Math.sin(t*9+ph)+.08*Math.sin(t*23+ph*2))*fl*S,W=w*2.1*kk*S,sw=Math.sin(t*5.3+ph)*.5+Math.sin(t*11+ph)*.2;
      t3Q(b[0]+R3[0]*ox*kk*S,b[1]+R3[1]*ox*kk*S,b[2]+dz*.6,-W,0,W,H,-1,1,1,0,col[0],col[1],col[2],.5+.5*Math.max(-1,Math.min(1,sw))*.7)}
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);t3QFlush(T3F.pFl,T3.white)}
  // the glows: round the fire, the lit window, the eyes that glow in the dark
  gl.blendFunc(gl.ONE,gl.ONE);
  t3Q(F3[0],F3[1],10,-50*fl,-38*fl,50*fl,44*fl,0,0,1,1,.3*fl,.13*fl,.04*fl,1);t3Q(F3[0],F3[1],9,-13*fl,-10*fl,13*fl,16*fl,0,0,1,1,.36*fl,.2*fl,.07*fl,1);
  t3QW([[F3[0]-46,F3[1]+34,.5],[F3[0]+46,F3[1]+34,.5],[F3[0]+46,F3[1]-34,.5],[F3[0]-46,F3[1]-34,.5]],0,0,1,1,.16*fl,.07*fl,.02*fl,1);
  if(T3F.win){const w=T3F.win.p,f2=.8+.2*Math.sin(t*3.1)*Math.sin(t*1.7+.5);t3Q(w[0],w[1],w[2],-14,-12,14,12,0,0,1,1,.5*f2,.3*f2,.1*f2,1);t3Q(w[0],w[1],w[2],-5,-6,5,6,0,0,1,1,.6*f2,.42*f2,.2*f2,1)}
  if(T3F.lamp){const w=T3F.lamp,f3=.85+.15*Math.sin(t*7.3)*Math.sin(t*3.1+1);t3Q(w[0],w[1],w[2],-16,-14,16,16,0,0,1,1,.42*f3,.27*f3,.1*f3,1);t3Q(w[0],w[1],w[2],-4,-4,4,5,0,0,1,1,.7*f3,.52*f3,.26*f3,1)}
  const MP=(M,q)=>[M[0]*q[0]+M[4]*q[1]+M[8]*q[2]+M[12],M[1]*q[0]+M[5]*q[1]+M[9]*q[2]+M[13],M[2]*q[0]+M[6]*q[1]+M[10]*q[2]+M[14]];
  for(const z of T3F.Z){if(!z.M||Math.cos(z.face-Math.atan2(T3.eye[1]-z.y,T3.eye[0]-z.x))<-.2)continue;const k=.5+.5*z.em;
    for(const q of T3F_EYE[z.kind]||[]){const p=MP(z.M,q);t3Q(p[0],p[1],p[2],-4.5,-4.5,4.5,4.5,0,0,1,1,.32*k,.5*k,.16*k,1);t3Q(p[0],p[1],p[2],-1.6,-1.6,1.6,1.6,0,0,1,1,.6*k,.8*k,.4*k,1)}
    if(z.kind==='lanterna'){const p=MP(z.M,[24.5,11.5,8]);t3Q(p[0],p[1],p[2],-16,-16,16,16,0,0,1,1,.3,.42,.14,1)}}
  {const S=T3F.sc;if(S.glow>.02){const M=t3FScareM();for(const s of[-1,1]){const p=MP(M,[4.9,s*1.9,6.6]);t3Q(p[0],p[1],p[2],-4,-4,4,4,0,0,1,1,.6*S.glow,.18*S.glow,.06*S.glow,1)}}}
  // the sparks that shoot up and swirl
  {const nS=LOWFX?2:8;if(Math.random()<dt*nS*2)T3F.sp.push({x:F3[0]+(Math.random()-.5)*5,y:F3[1]+(Math.random()-.5)*5,z:10,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*6,vz:24+Math.random()*26,l:.7+Math.random()});
    for(let i=T3F.sp.length-1;i>=0;i--){const e=T3F.sp[i];e.l-=dt;if(e.l<=0){T3F.sp.splice(i,1);continue}e.vx+=Math.sin(t*3+i)*9*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.z+=e.vz*dt;e.vz*=1-dt*.6;const a=Math.min(1,e.l*1.6);
      t3Q(e.x,e.y,e.z,-.6,-.6,.6,.6+Math.min(2,e.vz*.05),0,0,1,1,1*a,(.66+(i%3)*.1)*a,.3*a,1)}}
  t3QFlush(T3.pA,T3.glow);
  // the smoke rising and drifting away, the steam of the pot
  if(!LOWFX){gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);if(Math.random()<dt*1.6)T3F.sm.push({x:F3[0]+(Math.random()-.5)*4,y:F3[1],z:18,l:0,s:0});if(Math.random()<dt*.9)T3F.sm.push({x:F3[0]-10.5,y:F3[1]+8.5,z:7,l:0,s:1});if(T3F.chim&&Math.random()<dt*.7){const c=T3F.chim;T3F.sm.push({x:c[0],y:c[1],z:c[2],l:0,s:2})}
    for(let i=T3F.sm.length-1;i>=0;i--){const m=T3F.sm[i];if(m.s===2){m.l+=dt/7;if(m.l>=1){T3F.sm.splice(i,1);continue}m.z+=dt*6;m.x+=dt*(4+m.l*8);const r=4+m.l*16;t3Q(m.x,m.y,m.z,-r,-r*.8,r,r*.8,0,0,1,1,.16,.18,.2,.32*Math.sin(m.l*Math.PI));continue}
      m.l+=dt/(m.s?2.2:4.2);if(m.l>=1){T3F.sm.splice(i,1);continue}m.z+=dt*(m.s?5:8);m.x+=dt*(m.s?1.5:3+m.l*6);const r=m.s?1.5+m.l*4:3.5+m.l*13,a=(m.s?.2:.3)*Math.sin(m.l*Math.PI),w=Math.max(0,1-m.l*2.2);
      t3Q(m.x,m.y,m.z,-r,-r*.8,r,r*.8,0,0,1,1,m.s?.8:.2+w*.3,m.s?.82:.2+w*.14,m.s?.82:.22,a)}t3QFlush(T3I.pCl,X.cloud)}
  gl.depthMask(true);gl.disable(gl.BLEND)}
// ------------------------------------------------------------------ the hook: 66's Zombie home asks first; while the scene is being made the
// drawing of always (and a little of the work each frame, even during the sweep between the modes)
// When the 3D comes in after the drawing of always (the first time, at the end of the sweep between the modes) the two cross: the drawing
// stays a moment over the 3D and fades away (the menu's canvas goes see-through), so there is no jump
{const _z=drawCampZ,op=v=>{const c=campCv.style;if(c.opacity!==v)c.opacity=v};drawCampZ=function(dt,k){
  if(!MM.tr&&T3F.on&&!T3F.bad&&!T3F.ready&&T3.ok!==false&&T3I.on&&!T3I.bad&&t3Init()&&T3.post)try{t3FBuild(8)}catch(e){t3Err(e);T3F.bad=true}
  if(!t3FaloOk()){T3F.shown=false;op('');return _z.apply(this,arguments)}
  if(!T3F.shown){T3F.shown=true;T3F.fi=0}
  try{t3FaloFrame(dt,k)}catch(e){t3Err(e);T3F.bad=true;op('');return _z.apply(this,arguments)}
  if(T3F.fi<1){T3F.fi=Math.min(1,T3F.fi+dt/.55);if(T3F.fi<1){const h=CAMP.hero;try{_z.apply(this,arguments)}finally{CAMP.hero=h}op(String(1-T3F.fi*T3F.fi*(3-2*T3F.fi)))}else op('')}}}
// The work of the first time is done earlier too, in the spare moments of the Classic's menu (65's IDLE: never in a battle or on the zombie
// map), once its islands are in 3D: going to the Zombie the scene is often ready already. Never during the sweep between the modes
function t3FPump(){if(T3F.bad||!T3F.on||MM.tr){if(!T3F.bad&&T3F.on)setTimeout(()=>IDLE.add(t3FPump),800);return}
  if(!T3F.ready)t3FBuild(4);else if(!T3F.zq||T3F.zi<T3F.zq.length)t3FZBuild(4);else return;IDLE.add(t3FPump)}
{const _ci=cnIsles;cnIsles=function(){const r=_ci.apply(this,arguments);if(T3I.live&&!T3F.pre&&T3F.on&&!T3F.bad){T3F.pre=true;setTimeout(()=>IDLE.add(t3FPump),2500)}return r}}
// (back in the Classic the menu's canvas is whole again)
{const _dc=drawCamp;drawCamp=function(){if(!zMode()&&campCv.style.opacity)campCv.style.opacity='';return _dc.apply(this,arguments)}}
