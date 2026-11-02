// =====================================================================
// 107. GLI EFFETTI DI BATTAGLIA IN 3D E LA TELECAMERA VIVA (tripla A, anteprima a parte; Denis, 2 novembre: «rendilo tripla A»).
// Nella visuale in terza e prima persona (105) i colpi e quello che succede intorno sono cose del mondo, non disegni sopra lo schermo:
// - la scia di ogni colpo è un fascio di luce 3D dalla bocca dell'arma a dove arriva (più fine e lunga per i fucili, a ventaglio per le pompe),
//   con la vampa a stella sulla bocca;
// - dove il colpo si ferma contro un muro: scintille che rimbalzano e uno sbuffo di polvere; dove prende uno zombie: uno schizzo di sangue
//   scuro che cade e lascia le macchie a terra (restano un po', poi sbiadiscono); i bossoli d'ottone che saltano dall'arma e tintinnano a terra;
// - le esplosioni (il lanciarazzi): la palla di fuoco, il lampo che illumina tutto intorno, l'anello d'urto a terra, il fumo che sale, i
//   detriti, la bruciatura che resta;
// - gli zombie che escono da terra sollevano zolle; quelli che muoiono cadono all'indietro e lasciano la pozza;
// - la telecamera vive: trema con le esplosioni, i colpi grossi e quando ti colpiscono (D.shake del direttore compreso), in prima persona lo
//   sguardo rincula a ogni colpo e torna; i segni sul mirino quando colpisci (rosso quando uccidi), e un arco rosso sul bordo dello schermo
//   dalla parte da cui ti hanno colpito.
// Tutto rispetta LOWFX (meno particelle, niente tremolio della telecamera) e il telefono lento. Fuori da src/ordine.txt: solo nell'anteprima
// della visuale (anteprime/mk_visuale.py), dopo 105 e 106; senza questo file 105 disegna i colpi come prima.
// =====================================================================
const FX3={on:true,P:[],D:[],L:[],done:new WeakSet(),shk:0,kick:0,marks:[],hurts:[],lastHT:9,lastKill:0,n:0,nd:0,sh:[0,0,0]};
// ------------------------------------------------------------------ the effects' little pictures (one texture: 4 × 2 cells of 64)
// 0 soft glow · 1 splash of blood · 2 the muzzle's star · 3 the shock ring · 4 burn and hole · 5 the beam (soft across, even along) ·
// 6 a puff of dust (rough edges) · 7 a casing
function fx3Tex(){if(FX3.tex)return FX3.tex;const S=64,c=document.createElement('canvas');c.width=S*4;c.height=S*2;const g=c.getContext('2d');let sd=31;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const cell=(i,f)=>{g.save();g.translate((i%4)*S,Math.floor(i/4)*S);g.beginPath();g.rect(0,0,S,S);g.clip();f();g.restore()};
  cell(0,()=>{const gr=g.createRadialGradient(32,32,0,32,32,31);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)});
  cell(1,()=>{g.fillStyle='#fff';for(let i=0;i<9;i++){const a=r()*6.28,d=r()*14,rr=6+r()*9;g.beginPath();g.arc(32+Math.cos(a)*d,32+Math.sin(a)*d,rr,0,6.28);g.fill()}
    for(let i=0;i<14;i++){const a=r()*6.28,d=16+r()*12,rr=1+r()*3.2;g.beginPath();g.arc(32+Math.cos(a)*d,32+Math.sin(a)*d,rr,0,6.28);g.fill()}});
  cell(2,()=>{g.translate(32,32);const gr=g.createRadialGradient(0,0,0,0,0,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,240,200,.9)');gr.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gr;
    g.beginPath();for(let i=0;i<12;i++){const a=i/12*6.28,rr=i%2?7:30-(i%4)*5;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath();g.fill()});
  cell(3,()=>{const gr=g.createRadialGradient(32,32,18,32,32,31);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.6,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)});
  cell(4,()=>{const gr=g.createRadialGradient(32,32,0,32,32,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;
    g.beginPath();for(let i=0;i<16;i++){const a=i/16*6.28,rr=22+r()*9;g.lineTo(32+Math.cos(a)*rr,32+Math.sin(a)*rr)}g.closePath();g.fill()});
  cell(5,()=>{const gr=g.createLinearGradient(0,0,0,S);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)});
  cell(6,()=>{for(let i=0;i<10;i++){const a=r()*6.28,d=r()*10,rr=9+r()*8,gr=g.createRadialGradient(32+Math.cos(a)*d,32+Math.sin(a)*d,0,32+Math.cos(a)*d,32+Math.sin(a)*d,rr);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S)}});
  cell(7,()=>{g.fillStyle='#fff';g.fillRect(24,14,16,36);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(24,14,16,6)});
  const t=v3Tex(V3.gl,c,true);FX3.tex=t;return t}
const fx3UV=i=>{const u0=(i%4)/4,v0=Math.floor(i/4)/2;return[u0+.004,v0+.008,u0+.25-.004,v0+.5-.008]};
const fx3R=(a,b)=>a+Math.random()*(b-a);
// ------------------------------------------------------------------ the particles: {k, x, y, z, vx, vy, vz, t, T, s, c:[r,g,b], g (gravity), add (light)}
function fx3P(o){const max=LOWFX?140:V3.low?260:520;if(FX3.P.length>=max)FX3.P.shift();o.t=0;FX3.P.push(o);return o}
function fx3Decal(o){const max=LOWFX?20:60;if(FX3.D.length>=max)FX3.D.shift();o.t=0;o.a=o.a==null?Math.random()*6.28:o.a;FX3.D.push(o);return o}
// sparks against a wall (they bounce), a puff of the wall's dust
function fx3Sparks(x,y,z,dx,dy,n){for(let i=0;i<n;i++){const a=Math.atan2(-dy,-dx)+fx3R(-1.3,1.3),v=fx3R(60,180);fx3P({k:'spark',x,y,z,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:fx3R(10,120),T:fx3R(.18,.42),s:fx3R(.25,.45),c:[1,.78,.4],g:260,add:1,bounce:.35})}
  fx3P({k:'dust',x:x-dx*2,y:y-dy*2,z,vx:-dx*12,vy:-dy*12,vz:10,T:.7,s:3,s1:9,c:[.55,.5,.44],a:.5});fx3P({k:'flash',x:x-dx*1.5,y:y-dy*1.5,z,T:.07,s:7,c:[1,.85,.55],add:1})}
// blood: the spray out of the zombie (dark), the drops that fall and leave the stains on the ground
function fx3Blood(x,y,z,dx,dy,n,zom){const c=zom?[.34,.09,.06]:[.5,.05,.05];for(let i=0;i<n;i++){const a=Math.atan2(dy,dx)+fx3R(-.8,.8),v=fx3R(30,110);fx3P({k:'blood',x,y,z,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:fx3R(-10,70),T:1.4,s:fx3R(.9,1.7),c,g:300,zom,stain:i%3===0})}
  fx3P({k:'mist',x,y,z,vx:dx*20,vy:dy*20,vz:6,T:.4,s:5,s1:15,c:zom?[.4,.12,.08]:[.55,.07,.07],a:.7})}
// an explosion: the ball of fire, the light, the shock ring, the smoke, the debris, the burn on the ground; the camera shakes by the distance
function fx3Boom(x,y,z,r){const R=Math.max(30,r||40);fx3P({k:'fire',x,y,z:z+8,T:.45,s:R*.5,s1:R*1.15,c:[1,.62,.22],add:1});fx3P({k:'fire',x,y,z:z+12,T:.3,s:R*.3,s1:R*.7,c:[1,.92,.7],add:1});
  fx3P({k:'ring',x,y,z:z+.6,T:.38,s:R*.3,s1:R*1.5,c:[1,.8,.55],add:1,flat:1});
  for(let i=0;i<(LOWFX?3:9);i++){const a=Math.random()*6.28,v=fx3R(10,40);fx3P({k:'smoke',x:x+Math.cos(a)*R*.2,y:y+Math.sin(a)*R*.2,z:z+10,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:fx3R(14,34),T:fx3R(1.4,2.4),s:R*.25,s1:R*.75,c:[.16,.14,.14],a:.62})}
  for(let i=0;i<(LOWFX?4:14);i++){const a=Math.random()*6.28,v=fx3R(60,190);fx3P({k:'spark',x,y,z:z+6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:fx3R(60,200),T:fx3R(.4,.9),s:fx3R(.4,.8),c:[1,.72,.3],g:280,add:1,bounce:.3})}
  for(let i=0;i<(LOWFX?2:7);i++){const a=Math.random()*6.28,v=fx3R(40,120);fx3P({k:'chunk',x,y,z:z+4,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:fx3R(60,160),T:1.2,s:fx3R(.8,1.6),c:[.14,.12,.1],g:320,bounce:.25})}
  fx3Decal({x,y,r:R*.75,T:30,cell:4,c:[.06,.05,.04],al:.75});FX3.L.push({x,y,z:z+18,r:R*4.5,rgb:'255,170,80',a:1,t:0,T:.35});
  const h=ZM.W.hero,d=Math.hypot(h.x-x,h.y-y);FX3.shk=Math.max(FX3.shk,.85*v3cl(1-d/300,0,1))}
// ------------------------------------------------------------------ every frame: read the game's effects once, move what flies
const FX3K={pistola:[.07,1.1],revolver:[.16,2.2],mitraglietta:[.05,.6],tamburo:[.05,.6],mitra:[.06,.7],mitragliatrice:[.07,.55],pompa:[.22,2.6],tattica:[.18,2],lanciarazzi:[.3,3],lanciafiamme:[.02,0],vapore:[.15,1.6],risonatore:[.1,.8]};
const FX3EJ={pistola:1,mitraglietta:1,tamburo:1,mitra:1,mitragliatrice:1,pompa:2,tattica:2};
FX3.step=function(dt){if(FX3.freeze)dt=0;const W=ZM.W,h=W.hero,g=ZM.gun&&ZM.gun(),gid=W.gunId||'pistola',D=W.director;FX3.tracers=FX3.tracers||[];
  // the shots: a beam each, the casing, the kick; where it ends: a zombie (blood) or a wall (sparks)
  let shotNow=0;for(const f of W.FX){if(FX3.done.has(f))continue;FX3.done.add(f);
    if(f.k==='shot'){shotNow=1;const t=f.tw,A=V3.muz?V3.muz.slice():[h.x,h.y,(h.zh||0)+30],B=[t[0],t[1],(t[2]||0)+26];
      // (the beam goes from the muzzle to the end, a little lower at the end if it hit nothing: down the line of sight)
      FX3.tracers.push({A,B,t:0,T:(f.t||.08)*2.2,w:(f.w||2)*.5,pc:f.pap>=2?[.83,.55,1]:f.pap?[.56,.9,1]:null});
      const dx=B[0]-A[0],dy=B[1]-A[1],dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl;let hz=null;
      for(const z of W.Z){if(z.die||z.rise<1)continue;if(Math.hypot(z.x-t[0],z.y-t[1])<12*(z.sc||1)+4){hz=z;break}}
      if(hz)fx3Blood(t[0],t[1],(hz.zh||0)+24*(hz.sc||1),ux,uy,LOWFX?3:8,true);
      else if(g&&g.D&&Math.hypot(t[0]-h.x,t[1]-h.y)<g.D.range-8)fx3Sparks(t[0]-ux*2,t[1]-uy*2,(t[2]||0)+fx3R(16,34),ux,uy,LOWFX?3:7)}
    else if(f.k==='boom')fx3Boom(f.tw[0],f.tw[1],f.tw[2]||0,f.r)}
  if(shotNow){const K=FX3K[gid]||[.06,1];FX3.shk=Math.max(FX3.shk,K[0]*(V3.mode==='prima'?.6:1));FX3.kick=Math.min(5,FX3.kick+K[1]);
    // the casing out of the right side, spinning, falling, bouncing with a tinkle of brass
    const ej=FX3EJ[gid];if(ej&&!LOWFX&&V3.muz){const R=V3.R3,F=V3.F3,m=V3.muz,b=[m[0]-F[0]*6,m[1]-F[1]*6,m[2]+1];for(let i=0;i<(ej===2?1:1);i++)fx3P({k:'casing',x:b[0],y:b[1],z:b[2],vx:R[0]*fx3R(50,80)-F[0]*10,vy:R[1]*fx3R(50,80)-F[1]*10,vz:fx3R(50,90),T:2.2,s:ej===2?.95:.6,c:ej===2?[.75,.18,.14]:[.86,.66,.28],g:330,bounce:.42,spin:fx3R(-14,14)})}}
  // the director's own shake (the Becchino's slam, a boss down), a hit on the hero
  if(D){if(D.shake)FX3.shk=Math.max(FX3.shk,Math.min(1,D.shake*1.2));const ht=D.hurtT!=null?D.hurtT:9;if(ht<FX3.lastHT&&ht<.2){FX3.shk=Math.max(FX3.shk,.38);
      let best=null,bd=90;for(const z of W.Z){if(z.die)continue;const d=Math.hypot(z.x-h.x,z.y-h.y);if(d<bd){bd=d;best=z}}FX3.hurts.push({a:best?Math.atan2(best.y-h.y,best.x-h.x):null,t:0})}FX3.lastHT=ht}
  // the zombies: out of the ground (clods of earth), hit (the mark on the sight), dead (they fall, the pool of blood, the red mark)
  for(const z of W.Z){if(z.rise<1&&z.rise>.25&&!LOWFX&&Math.random()<dt*14){const a=Math.random()*6.28,v=fx3R(20,60);fx3P({k:'chunk',x:z.x+Math.cos(a)*6,y:z.y+Math.sin(a)*6,z:2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:fx3R(40,110),T:1,s:fx3R(.7,1.4),c:[.2,.15,.1],g:300,bounce:.2})}
    if(z.rise<1&&!z.__fxr){z.__fxr=1;fx3Decal({x:z.x,y:z.y,r:14*(z.sc||1),T:9,cell:4,c:[.07,.05,.04],al:.7})}
    if(z.flash>.1&&!z.__fxf){z.__fxf=1;FX3.marks.push({t:0,kill:0})}else if(z.flash<=0)z.__fxf=0;
    if(z.die&&!z.__fxd){z.__fxd=1;FX3.marks.push({t:0,kill:1});fx3Decal({x:z.x+Math.cos(z.face||0)*-10,y:z.y+Math.sin(z.face||0)*-10,r:12*(z.sc||1),T:25,cell:1,c:[.16,.2,.08],al:.8})}}
  // move: gravity, the floor (bounce or stop; the blood leaves its stain), the time
  for(const p of FX3.P){p.t+=dt;if(p.g){p.vz-=p.g*dt}if(p.vx!=null){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=(p.vz||0)*dt}
    if(p.drag)p.vx*=1-p.drag*dt;if((p.k==='smoke'||p.k==='dust'||p.k==='mist')&&p.vx!=null){p.vx*=1-1.8*dt;p.vy*=1-1.8*dt;p.vz*=1-.6*dt}
    if(p.g&&p.z<.3){if(p.k==='blood'){if(p.stain)fx3Decal({x:p.x,y:p.y,r:fx3R(2.6,5.4),T:22,cell:1,c:p.c.map(v=>v*.75),al:.85});p.t=p.T}else if(p.bounce&&Math.abs(p.vz)>18){p.z=.3;p.vz=-p.vz*p.bounce;p.vx*=.6;p.vy*=.6;if(p.k==='casing'&&!p.tk){p.tk=1;FX3.tink=(FX3.tink||0)+1}}else{p.z=.3;p.vz=0;p.vx*=.8;p.vy*=.8}}}
  FX3.P=FX3.P.filter(p=>p.t<p.T);for(const d of FX3.D)d.t+=dt;FX3.D=FX3.D.filter(d=>d.t<d.T);for(const l of FX3.L)l.t+=dt;FX3.L=FX3.L.filter(l=>l.t<l.T);
  for(const t of FX3.tracers)t.t+=dt;FX3.tracers=FX3.tracers.filter(t=>t.t<t.T);for(const m of FX3.marks)m.t+=dt;FX3.marks=FX3.marks.filter(m=>m.t<.3);for(const m of FX3.hurts)m.t+=dt;FX3.hurts=FX3.hurts.filter(m=>m.t<.9);
  FX3.shk*=Math.pow(.02,dt);FX3.kick*=Math.pow(.0005,dt);if(FX3.shk<.004)FX3.shk=0}
// ------------------------------------------------------------------ the camera: the shake and, in first person, the kick of the shot
FX3.cam=function(eye,at,dt){FX3.step(Math.min(.05,dt||0));if(V3.dbgCam)return;const t=(ZM.W.t||0),k=LOWFX?0:FX3.shk,m=V3.mode==='prima'?1.4:2.6;
  if(k>0){const o=[Math.sin(t*41)*.6+Math.sin(t*23.3)*.4,Math.sin(t*37.7+1)*.6+Math.sin(t*19.1)*.4,Math.sin(t*45.1+2)*.5],a=k*k*m;for(let i=0;i<3;i++){eye[i]+=o[i]*a;at[i]+=o[i]*a*.6}}
  if(V3.mode==='prima'&&FX3.kick>0){const d=Math.hypot(at[0]-eye[0],at[1]-eye[1],at[2]-eye[2]);at[2]+=Math.tan(FX3.kick*Math.PI/180)*d}}
// ------------------------------------------------------------------ the lights of the effects (the explosions' flash)
FX3.lights=function(){return FX3.L.map(l=>({x:l.x,y:l.y,z:l.z/.6,r:l.r*(.6+.4*(1-l.t/l.T)),rgb:l.rgb,a:l.a*(1-l.t/l.T)}))};
// ------------------------------------------------------------------ drawing: the stains on the ground (with the night's light), then what
// flies (dust, smoke, blood: shaded; sparks, fire, beams: added light)
FX3.decals=function(){if(!FX3.D.length)return;const gl=V3.gl,T=fx3Tex(),R3=V3.R3,e=V3.eye,far=V3.fogP[0]+V3.fogP[1];V3.R3=[0,0,0];
  for(const d of FX3.D){if(Math.hypot(d.x-e[0],d.y-e[1])>far)continue;const[u0,v0,u1,v1]=fx3UV(d.cell),c=Math.cos(d.a)*d.r,s=Math.sin(d.a)*d.r,f=d.t<.15?d.t/.15:Math.min(1,(d.T-d.t)/3),z=.32;
    v3QW([[d.x-c+s,d.y-s-c,z],[d.x+c+s,d.y+s-c,z],[d.x+c-s,d.y+s+c,z],[d.x-c-s,d.y-s+c,z]],u0,v0,u1,v1,d.c[0],d.c[1],d.c[2],(d.al||.8)*f)}
  if(V3N){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-5);v3QFlush(V3.pB,T,[0,0,0],.01);gl.disable(gl.POLYGON_OFFSET_FILL);gl.depthMask(true);gl.disable(gl.BLEND)}
  V3.R3=R3;FX3.nd=FX3.D.length};
FX3.draw=function(){const gl=V3.gl,T=fx3Tex(),e=V3.eye,F=V3.F3,{cross,nrm,sub,add,mul}=RG;let nA=0;FX3.n=FX3.P.length+(FX3.tracers?FX3.tracers.length:0);if(!FX3.n&&!(V3.muzF>0))return;
  // a quad along a segment (the beams, the sparks' streaks): its width across the line of sight
  const seg=(A,B,w,cell,r,g,b,a)=>{const m=[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],sd=nrm(cross(sub(B,A),sub(m,e)));if(!isFinite(sd[0]))return;const o=mul(sd,w),[u0,v0,u1,v1]=fx3UV(cell);
    v3QW([sub(A,o),sub(B,o),add(B,o),add(A,o)],u0,v0,u1,v1,r,g,b,a)};
  gl.enable(gl.BLEND);gl.depthMask(false);
  // 1. shaded, see-through: dust, smoke, the mist of blood, the drops, the chunks, the casings
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  for(const p of FX3.P){if(p.add)continue;const k=p.t/p.T,s=p.s1?p.s+(p.s1-p.s)*Math.sqrt(k):p.s,[u0,v0,u1,v1]=fx3UV(p.k==='casing'?7:p.k==='blood'||p.k==='chunk'?0:6),
      al=(p.a||1)*(p.k==='blood'||p.k==='chunk'||p.k==='casing'?Math.min(1,(p.T-p.t)*4):1-k);v3Q(p.x,p.y,p.z,-s,-s*(p.k==='casing'?1.6:1),s,s*(p.k==='casing'?1.6:1),u0,v0,u1,v1,p.c[0],p.c[1],p.c[2],al)}
  if(V3N)v3QFlush(V3.pB,T,V3.U3,.003);
  // 2. added light: the beams of the shots (a wide soft one and a bright core), the muzzle's star, sparks, fire, the shock ring
  gl.blendFunc(gl.ONE,gl.ONE);
  // (in first person the beam starts a little ahead of the muzzle and is thinner, as the eye is right behind it)
  for(const t of FX3.tracers||[]){const k=1-t.t/t.T,c=t.pc||[1,.86,.55],fp=V3.mode==='prima',d=sub(t.B,t.A),L=Math.hypot(d[0],d[1],d[2])||1,A=fp?add(t.A,mul(d,Math.min(.5,14/L))):t.A,w=t.w*(fp?.45:1);
    seg(A,t.B,w*2.6,5,c[0]*.5*k,c[1]*.42*k,c[2]*.3*k,1);seg(A,t.B,w*.7,5,c[0]*k,c[1]*.95*k,c[2]*.85*k,1)}
  if(V3.muzF>.05&&V3.muz&&V3.mode==='terza'){const m=V3.muz,s=6+8*V3.muzF,[u0,v0,u1,v1]=fx3UV(2);v3Q(m[0],m[1],m[2],-s,-s,s,s,u0,v0,u1,v1,1,.85,.55,1)}
  for(const p of FX3.P){if(!p.add)continue;const k=p.t/p.T;
    if(p.k==='spark'){const L=Math.max(1.5,Math.hypot(p.vx,p.vy,p.vz)*.025);seg([p.x,p.y,p.z],[p.x-p.vx*L/60,p.y-p.vy*L/60,p.z-p.vz*L/60],p.s,5,p.c[0]*(1-k),p.c[1]*(1-k),p.c[2]*(1-k),1);continue}
    const s=p.s1?p.s+(p.s1-p.s)*Math.sqrt(k):p.s,[u0,v0,u1,v1]=fx3UV(p.k==='ring'?3:p.k==='flash'?2:0),f=p.k==='fire'?(1-k)*(1-k):1-k;
    if(p.flat){const z=p.z;v3QW([[p.x-s,p.y-s,z],[p.x+s,p.y-s,z],[p.x+s,p.y+s,z],[p.x-s,p.y+s,z]],u0,v0,u1,v1,p.c[0]*f,p.c[1]*f,p.c[2]*f,1)}
    else v3Q(p.x,p.y,p.z,-s,-s,s,s,u0,v0,u1,v1,p.c[0]*f,p.c[1]*f,p.c[2]*f,1)}
  if(V3N){const R3=V3.R3;v3QFlush(V3.pA,T,V3.U3,0,true);V3.R3=R3}
  gl.depthMask(true);gl.disable(gl.BLEND)};
// ------------------------------------------------------------------ over the screen: the marks of a hit on the sight (red when it kills), the
// red arc on the edge from where the hit came
FX3.ui=function(g,Wp,Hp){const cx=Wp/2,cy=V3.mode==='prima'?Hp/2:Hp*.45;g.save();g.lineCap='round';
  for(const m of FX3.marks){const k=m.t/.3,r=7+k*5,a=1-k;g.strokeStyle=m.kill?`rgba(255,70,60,${a})`:`rgba(255,255,255,${a*.9})`;g.lineWidth=m.kill?2.6:1.8;
    for(const[sx,sy] of[[1,1],[1,-1],[-1,1],[-1,-1]]){g.beginPath();g.moveTo(cx+sx*r,cy+sy*r);g.lineTo(cx+sx*(r+5),cy+sy*(r+5));g.stroke()}}
  for(const m of FX3.hurts){if(m.a==null)continue;const k=m.t/.9,a=(1-k)*.85,rel=m.a-V3.th,R=Math.min(Wp,Hp)*.42,ac=-Math.PI/2+Math.atan2(Math.sin(rel),Math.cos(rel));
    const gr=g.createRadialGradient(cx,Hp/2,R*.75,cx,Hp/2,R*1.15);gr.addColorStop(0,'rgba(200,20,20,0)');gr.addColorStop(.5,`rgba(220,30,30,${a})`);gr.addColorStop(1,'rgba(200,20,20,0)');
    g.strokeStyle=gr;g.lineWidth=R*.18;g.beginPath();g.arc(cx,Hp/2,R*.95,ac-.42,ac+.42);g.stroke()}
  g.restore()};
FX3.mk={sparks:fx3Sparks,blood:fx3Blood,boom:fx3Boom,decal:fx3Decal,p:fx3P};
V3.fx=FX3;
