// =====================================================================
// 118. MOSSBOUND TRIPLA A · IL FALÒ DEL MENU ZOMBIE IN 3D (anteprima a parte, con 110–117).
// Denis (2 novembre), fra le parti del menu: «Menu Zombie». La scena lontana resta il dipinto di oggi (66: il cielo di notte con la luna e
// le nuvole, le colline, la fattoria in rovina, il mulino, gli zombie che camminano sul sentiero coi loro occhi accesi, la staccionata, la
// nebbia, i corvi), dipinta a metà grandezza un fotogramma sì e uno no e messa come fondale. Davanti, il campo in 3D vero, dove era: il
// tronco con la corteccia e il taglio, l'eroe seduto (il suo modello 3D, la mossa «seduto» del gioco, il vestito che porta, niente arma in
// mano), la pistola appoggiata al tronco (il modello di ARMI3D), lo zaino, la pala piantata in terra, la cassa delle munizioni coi bossoli,
// il pentolino; il fuoco: la terra bruciata, l'anello di pietre, i ceppi che ardono con le punte di brace, le fiamme, le scintille che salgono,
// il fumo. La luce è quella della notte (fredda, dalla luna alle spalle) e del fuoco, che trema e scalda tutto quello che ha vicino: l'eroe,
// il tronco, le pietre. Andando a giocare l'eroe si alza e se ne va nel buio, come oggi.
// =====================================================================
const T3F={on:true,bad:false,far:null,tex:null,k:0,M:{},sp:[],sm:[],ms:0};
function t3FaloOk(){return T3F.on&&!T3F.bad&&t3IslOk()}
// (66's own measures of its far pictures: its constants live inside its block)
const T3F_Z=[-30,-330,420,600];
// (the far picture is laid behind everything, looked up by the screen's place: it shows as it is painted)
const T3VS_FARW=`attribute vec3 aP;uniform mat4 uVP;void main(){gl_Position=uVP*vec4(aP,1.);}`;
const T3FS_FAR=`precision mediump float;uniform sampler2D uC;uniform vec2 uRes;void main(){vec2 v=gl_FragCoord.xy/uRes;gl_FragColor=vec4(texture2D(uC,vec2(v.x,1.-v.y)).rgb,1.);}`;
// the night of the camp: the sky and the earth dark and cold, the moon behind on the right a cool key light; the fire does the rest
const T3F_LUCE={chiara:{sky:[.2,.25,.27],gnd:[.07,.08,.08],key:[.16,.21,.24],keyD:[.5,-.6,.62],fog:[.035,.05,.05],mist:0,torch:1.25,bloom:.8,thr:.7,sat:1.1,con:.08,warm:.03,vig:.34,grain:.012,ink:1},
  film:{sky:[.13,.17,.2],gnd:[.04,.05,.06],key:[.14,.2,.27],keyD:[.55,-.65,.55],fog:[.02,.03,.035],mist:0,torch:1.6,bloom:1.1,thr:.58,sat:1.04,con:.18,warm:.06,vig:.45,grain:.026,ink:1}};
// ------------------------------------------------------------------ the far picture: the same as 66, half size
function t3FaloFar(dt,F,t){const W=campCv.width,H=campCv.height,hw=Math.max(2,W>>1),hh=Math.max(2,H>>1);let c=T3F.far;
  if(!c||c.width!==hw||c.height!==hh){c=T3F.far=document.createElement('canvas');c.width=hw;c.height=hh;if(T3F.tex)T3.gl.deleteTexture(T3F.tex);T3F.tex=t3Tex(c,false);T3F.up=0}
  zfZombies(dt);if((T3F.k=(T3F.k+1)&1)&&T3F.up)return;
  const g=c.getContext('2d'),sv=ctx;ctx=g;const hs=F.hs;
  try{g.setTransform(1,0,0,1,0,0);g.fillStyle='#020407';g.fillRect(0,0,hw,hh);g.setTransform(F.u*.5,0,0,F.u*.5,F.ox*.5,F.oy*.5);
    g.fillStyle='#0c120f';g.fillRect(-400,200,SW+800,900);g.drawImage(zfBack(),...T3F_Z);
    {const mx=268,my=-108;if(!LOWFX){g.save();g.globalCompositeOperation='lighter';glow('170,220,180',mx,my,80,.16);glow('220,240,210',mx,my,36,.3);g.restore()}
      g.fillStyle='#d9e4c8';circ(mx,my,19);g.fill();g.fillStyle='rgba(60,80,60,.18)';for(const[a,b,r] of[[-6,-5,4.5],[6,3,3.4],[-1,9,2.6],[8,-8,2]]){circ(mx+a,my+b,r);g.fill()}
      for(let k=0;k<4;k++){const cx=((k*121+t*(2.2+k*.7))%520)-80,cy=-150+k*30,w=70+k*18;g.fillStyle='rgba(24,36,34,.6)';g.beginPath();g.ellipse(cx,cy,w,8,0,0,TAU);g.ellipse(cx-w*.3,cy-6,w*.42,7,0,0,TAU);g.ellipse(cx+w*.28,cy-5,w*.36,6,0,0,TAU);g.fill()}}
    {FALO.blades+=dt*.35*2;const mx=304,my=44,a0=FALO.blades;g.lineCap='round';for(let i=0;i<4;i++){const a=a0+i*Math.PI/2,L=i===2?17:30,ex=mx+Math.cos(a)*L,ey=my+Math.sin(a)*L;
        g.strokeStyle='#0a1210';g.lineWidth=2.2;g.beginPath();g.moveTo(mx,my);g.lineTo(ex,ey);g.stroke();g.lineWidth=5.5;const ax=mx+Math.cos(a)*L*.35,ay=my+Math.sin(a)*L*.35,o=[Math.cos(a+1.57)*2.4,Math.sin(a+1.57)*2.4];
        g.strokeStyle='rgba(12,20,18,.92)';g.beginPath();g.moveTo(ax+o[0],ay+o[1]);g.lineTo(ex+o[0],ey+o[1]);g.stroke()}g.fillStyle='#0a1210';circ(mx,my,2.4);g.fill()}
    for(const z of FALO.Z.slice().sort((a,b)=>a.y-b.y)){const f=CR[z.kind];if(!f)continue;g.save();g.globalAlpha=.9;try{zfZDraw(z,f,z.st==='walk'?'walk':'idle',hs*.3)}catch(e){}g.restore()}
    g.drawImage(zfFence(),...T3F_Z);
    if(!LOWFX){const im=glowSprite('150,175,160');g.save();for(let k=0;k<5;k++){const w=150+k*30,fx=((k*137+t*(4+k*1.6))%(360+w*2))-w,fy=132+k*9;g.globalAlpha=.1+.03*Math.sin(t*.3+k);g.drawImage(im,fx,fy-12,w*2,26)}g.restore();g.globalAlpha=1}
    if(!LOWFX){g.save();g.globalCompositeOperation='lighter';for(const z of FALO.Z){const k=.6+.4*Math.sin(t*2.2+z.x*.1),sc=hs*.3,e=CR._rig.V(z.face).P(4.6,0,0),hxz=z.x+e[0]*sc,hyz=z.y-34*sc+e[1]*sc;
        if(Math.cos(z.face-Math.PI/2)>-.3){glow('200,255,120',hxz,hyz,3.2*sc,.5*k);glow('220,255,160',hxz,hyz,1.1*sc,.9*k)}}g.restore()}
    // (the night over the far field: a little darker than the camp, as in 66 where the fire's light does not reach)
    g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(2,6,8,.12)';g.fillRect(0,0,hw,hh)}
  finally{ctx=sv}
  const gl=T3.gl;gl.bindTexture(gl.TEXTURE_2D,T3F.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);T3F.up=1}
// ------------------------------------------------------------------ the camera: the hero where 66 has him, as big as there (the camp's 3D seen
// from the south and a little from above, as the monsters' camera of the 2D)
function t3FaloCam(F){const hs=F.hs,u=F.u,cw=campCv.width,ch=campCv.height,asp=cw/ch,fovy=30*Math.PI/180,th=Math.tan(fovy/2),pit=29*Math.PI/180,cy0=HOME_Y-FALO.up*hs,
    S0=[F.ox+156*u,F.oy+cy0*u],spx=hs*u*.94,fpx=(ch/2)/th,D=fpx/spx,tg=[2,6,10],eye=[tg[0],tg[1]+D*Math.cos(pit),tg[2]+D*Math.sin(pit)];
  T3.eye=eye;T3.tg=tg;T3.dist=D;T3.near=Math.max(4,D*.3);T3.far=D+900;const view=v3Look(eye,tg,[0,0,1]),q=v3Mul(v3Persp(fovy,asp,T3.near,T3.far),view);
  const P=[0,0,0],cx=q[0]*P[0]+q[4]*P[1]+q[8]*P[2]+q[12],cy=q[1]*P[0]+q[5]*P[1]+q[9]*P[2]+q[13],cwv=q[3]*P[0]+q[7]*P[1]+q[11]*P[2]+q[15],dx=(2*S0[0]/cw-1)-cx/cwv,dy=(1-2*S0[1]/ch)-cy/cwv;
  T3.vp=v3Mul(new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, dx,dy,0,1]),q);
  const f=[tg[0]-eye[0],tg[1]-eye[1],tg[2]-eye[2]],fl=Math.hypot(...f);T3.F3=[f[0]/fl,f[1]/fl,f[2]/fl];T3.R3=[1,0,0];const R=T3.R3,Fv=T3.F3;T3.U3=[R[1]*Fv[2]-R[2]*Fv[1],R[2]*Fv[0]-R[0]*Fv[2],R[0]*Fv[1]-R[1]*Fv[0]];if(T3.U3[2]<0)T3.U3=T3.U3.map(x=>-x);
  T3.kpx=cw/(2*D*th*asp)}
// ------------------------------------------------------------------ the camp's pieces (the hero's units: he sits at the origin, the fire is
// in front of him on the right, FALO.fire): made once
function t3FaloMeshes(){if(T3F.M.ok)return T3F.M;const M=T3F.M,{add,mul,nrm,cross}=RG,f=FALO.face,fwd=[Math.cos(f),Math.sin(f),0],la=nrm([-1,.3,0]),C=[-1.6*fwd[0],-1.6*fwd[1],3.7],F3=[FALO.fire[0],FALO.fire[1],0];
  // the ground: trampled earth round the fire and the log, dark grass beyond, into the dark (world places, the moss's own picture)
  {const b=t3GB(),NA=48,RR=[0,8,16,24,32,40,48],cen=[5,10];const rows=RR.map((r,j)=>{const o=[];for(let i=0;i<=NA;i++){const a=i/NA*TAU,w=1+.12*Math.sin(a*3+1)+.07*Math.sin(a*7);o.push([cen[0]+Math.cos(a)*r*w,cen[1]+Math.sin(a)*r*w*.8,j>4?-.4*(j-4):0])}return o});
    t3IGridGeo(b,rows,v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,0]),(j,i)=>[rows[j][i][0]/60,rows[j][i][1]/60],(j,i)=>{const p=rows[j][i],d=Math.hypot(p[0]-F3[0],p[1]-F3[1]),k=Math.max(0,1-j/6)*Math.max(0,1-j/6),dirt=Math.max(0,1-d/26);
      const c0=[70*dirt+48*(1-dirt),52*dirt+62*(1-dirt),36*dirt+46*(1-dirt)],e=[14,19,16];return[c0[0]*k+e[0]*(1-k),c0[1]*k+e[1]*(1-k),c0[2]*k+e[2]*(1-k),255]},()=>[0,0,1]);M.ground=t3GUp(b)}
  const mb=v3MB(),bark=t3Ic('#5a4030'),cut=t3Ic('#c9a26a'),ring=t3Ic('#9a7448');
  // the log the hero sits on: bark along it, the cut ends with their rings
  {const LC=add(C,mul(la,6)),a=add(LC,mul(la,22)),b2=add(LC,mul(la,-22));v3Tube(mb,[a,LC,b2],[4,4.2,3.9],bark,14);
    for(const[e,s] of[[a,1],[b2,-1]]){const n=mul(la,s),c0=v3V(mb,add(e,mul(n,.05)),n,cut),R=[],u=nrm(cross(n,[0,0,1])),w=cross(n,u);for(let k=0;k<16;k++){const q=k/16*TAU;R.push(v3V(mb,add(e,add(mul(u,Math.cos(q)*3.9),mul(w,Math.sin(q)*3.9))),n,k%2?cut:ring))}for(let k=0;k<16;k++)v3T(mb,c0,R[k],R[(k+1)%16])}
    // a branch stub and moss on it
    v3Tube(mb,[add(LC,add(mul(la,-12),[0,0,3])),add(LC,add(mul(la,-15),[0,-2,8]))],[1.4,.8],bark,6);t3Ell(mb,add(LC,add(mul(la,10),[0,-1,3.6])),[5,3,1.4],t3Ic('#3e5a2e'),{nl:10,nb:6,w:.5})}
  // the shovel stuck in the earth behind on the left, the backpack leaning on the log's end
  {const g0=add(C,add(mul(la,-8),[-2,-10,-3.7])),top=add(g0,[1,-.5,26]);v3Tube(mb,[g0,top],[.8,.8],t3Ic('#6b4a2a'),6);t3BoxA(mb,[top[0],top[1],top[2]-1],0,[3.4,.6,.6],t3Ic('#6b4a2a'));
    t3IBox(mb,add(g0,[0,0,1.2]),[1,0,0],[0,1,0],[0,0,1],2.6,.35,4.4,t3Ic('#7a7f86'))}
  {const p=add(C,add(mul(la,22),[0,-6.5,-3.7]));t3Ell(mb,add(p,[0,0,4.4]),[4.6,3.4,4.8],t3Ic('#4b5232'),{nl:12,nb:8,w:.7});t3Ell(mb,add(p,[0,1.8,6.4]),[3.6,1.6,2.4],t3Ic('#5a6240'),{nl:10,nb:6,w:.5});
    t3IBox(mb,add(p,[0,3.1,3]),[1,0,0],[0,1,0],[0,0,1],2.2,.5,1.4,t3Ic('#3c4128'));for(const s of[-1,1])v3Tube(mb,[add(p,[s*2.2,-3,8]),add(p,[s*2.4,-3.6,3]),add(p,[s*2.2,-2.4,.8])],[.5,.5,.5],t3Ic('#2e3220'),5)}
  // the crate of ammunition beyond the fire, the cartridges on it
  {const c=add(F3,[14,-5,0]),wd=t3Ic('#7a5a36');t3IBox(mb,add(c,[0,0,2.75]),[1,0,0],[0,1,0],[0,0,1],4.5,3,2.75,wd,{top:t3Ic('#94703f')});for(const z of[1.8,3.7])t3IBox(mb,add(c,[0,0,z]),[1,0,0],[0,1,0],[0,0,1],4.6,3.1,.25,t3Ic('#4a3622'));
    for(let i=0;i<3;i++)t3Lathe(mb,add(c,[-1.6+i*1.6,-.6,5.5]),[[0,.7],[2.6,.7],[3.2,.35]],8,t3Ic('#d39a33'),{top:t3Ic('#e8b24a')})}
  // the fire: the scorched earth, the ring of ten stones, the little pot on its stones
  {const N=10;for(let i=0;i<N;i++){const a=i/N*TAU+.2;t3Rock(mb,add(F3,[Math.cos(a)*8,Math.sin(a)*8,-.2]),[2.5+.3*Math.sin(a*3),2.3,2.2],i*7+3,t3Ic('#5c5650'),{nl:8,nb:5})}
    const b0=v3V(mb,add(F3,[0,0,.12]),[0,0,1],t3Ic('#16110d')),R=[];for(let k=0;k<20;k++){const q=k/20*TAU;R.push(v3V(mb,add(F3,[Math.cos(q)*7.4,Math.sin(q)*7.4,.12]),[0,0,1],t3Ic('#1e1812')))}for(let k=0;k<20;k++)v3T(mb,b0,R[k],R[(k+1)%20]);
    const pc=add(F3,[-7.5,6.5,1.6]);t3Lathe(mb,pc,[[0,2.6],[1.6,3.9],[4.4,4],[5,3.7]],12,t3Ic('#2a2c2e'),{top:t3Ic('#5a4632')});v3Tube(mb,[add(pc,[-3.8,0,4.8]),add(pc,[0,0,9]),add(pc,[3.8,0,4.8])],[.35,.35,.35],t3Ic('#1a1c1e'),5)}
  M.camp=v3Up(mb);
  // the burning logs: charred, their tips glowing (alpha: they glow by themselves)
  {const fb=v3MB();for(let i=0;i<4;i++){const a=i/4*TAU+.6,p=add(F3,[Math.cos(a)*7,Math.sin(a)*7,1.6]),q=add(F3,[Math.cos(a)*1.2,Math.sin(a)*1.2,3.2]);v3Tube(fb,[p,add(p,mul(add(q,mul(p,-1)),.6)),q],[1.45,1.4,1.2],t3Ic('#2a1e16'),8);
      t3Sph(fb,q,1.3,t3Ic('#ff6a2a',60),{nl:8,nb:6,w:.2});t3Sph(fb,add(p,mul(add(q,mul(p,-1)),.75)),.9,t3Ic('#ff8a3a',80),{nl:6,nb:4,w:0})}
    for(let i=0;i<6;i++){const a=i*1.7,r=1.5+i%3;t3Sph(fb,add(F3,[Math.cos(a)*r,Math.sin(a)*r,.9]),.9,t3Ic(i%2?'#ff7a2a':'#ffb050',70),{nl:6,nb:4,w:0})}M.logs=v3Up(fb)}
  M.ok=true;return M}
// ------------------------------------------------------------------ the frame
function t3FaloFrame(dt,k){const t0=performance.now(),F=campFrame(),t=CAMP.t,hs=F.hs,PF=T3F.prof,pk=PF?(k=>{T3.gl.finish();const q=performance.now();PF[k]=(PF[k]||0)+q-PF._;PF._=q}):()=>{};if(PF){PF._=t0;PF.n=(PF.n||0)+1}FALO.t+=dt;
  t3Place('menu');T3I.seen++;T3I.live=true;if(T3.cv.style.display==='none')T3.cv.style.display='block';t3IslSize();
  t3FaloFar(dt,F,t);pk('far');const gl=T3.gl,key=T3.luce,keep=T3LUCI[key],L0=T3F_LUCE[key]||T3F_LUCE.chiara,lean=T3.lean;T3LUCI[key]=Object.assign({},keep,L0);T3.lean=0;
  try{t3FaloCam(F);T3.fogP=[T3.dist+200,700,.6];const fl=.86+.08*Math.sin(t*13.1)+.05*Math.sin(t*7.7+1)+.04*Math.sin(t*23.3),F3=[FALO.fire[0],FALO.fire[1],0],M=t3FaloMeshes(),Lc=t3L();
    // the lights: the fire (it flickers and breathes), a little of it on the hero's side, the moon behind
    T3I.Lt=[];t3IL([F3[0],F3[1],9],120*fl,[1,.56,.26],1.7*fl*Lc.torch/1.25);t3IL([F3[0]-3,F3[1]-4,5],46,[1,.45,.2],.9*fl);t3ILights();
    gl.bindFramebuffer(gl.FRAMEBUFFER,T3.fbo);gl.viewport(0,0,T3.cw,T3.ch);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    // the far picture behind everything
    if(!T3F.pFar){T3F.pFar=t3Prog(T3VS_FARW,T3FS_FAR,['aP']);T3F.wb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,T3F.wb);const y=-84,a=-3000,b=3000,lo=-600,hi=1600;gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([a,y,lo,b,y,lo,b,y,hi,a,y,lo,b,y,hi,a,y,hi]),gl.STATIC_DRAW)}
    const Q=T3F.pFar;gl.useProgram(Q.p);gl.uniformMatrix4fv(Q.u.uVP,false,T3.vp);gl.uniform2f(Q.u.uRes,T3.cw,T3.ch);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T3F.tex);gl.uniform1i(Q.u.uC,0);
    gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.bindBuffer(gl.ARRAY_BUFFER,T3F.wb);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);for(let i=1;i<8;i++)gl.disableVertexAttribArray(i);gl.drawArrays(gl.TRIANGLES,0,6);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    // the ground, the camp, the burning logs
    pk('back');const X=t3ITx();gl.depthMask(false);t3GDraw(M.ground,X.top[1],{bump:.8,tx:1/512,ty:1/512});gl.depthMask(true);
    const items=[{m:M.camp,M:v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,0]),out:.32},{m:M.logs,M:v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,0]),out:.3}];
    // the gun leaning on the log, on his right (toward us)
    {const{add,mul,nrm}=RG,f=FALO.face,fwd=[Math.cos(f),Math.sin(f),0],la=nrm([-1,.3,0]),C=[-1.6*fwd[0],-1.6*fwd[1],3.7],id=FALO.gun;
      if(!(CAMP.walk>0)&&typeof ARMI3D!=='undefined'&&typeof v3GunMesh==='function'){const gm=v3GunMesh(id,{});if(gm){const at=add(C,add(mul(la,11),[0,0,3.7])),fr=ARMI3D.frame(add(at,[0,0,.9]),nrm(add(la,mul(fwd,.3))),nrm(add(fwd,[0,0,.25])),.92);
        items.push({m:gm.mesh,M:v3M4(mul(fr.X,fr.s),mul(fr.Y,fr.s),mul(fr.Z,fr.s),fr.O),out:.25})}}}
    t3Draw3(items,{});pk('camp');
    // the hero on the log (k: 0 standing, 1 sitting); going to play he stands up and walks off into the dark, the gun in his hand
    {const st=Object.assign({},heroStyle(),{gun:null,held:null,quiver:false}),P9=(t%9)/9,kk=k==null?1:k;let c,al=1;
      const wk=CAMP.walk>0?clamp((Math.min(1,(t-CAMP.walk)/1.5)-.3)/.7,0,1):0,ks=CAMP.walk>0?Math.min(kk,1-Math.min(1,Math.min(1,(t-CAMP.walk)/1.5)/.3)):kk;
      if(wk>0){c={x:-26*wk,y:-30*wk,lz:0,face:Math.atan2(-30,-26),anim:'walk',p:(t*1.4)%1,sc:1/T3CHK,o:{style:Object.assign({},st,{gun:FALO.gun})}};al=1-wk*wk}
      else if(ks>=.999)c={x:0,y:0,lz:0,face:FALO.face,anim:'sit',p:P9,sc:1/T3CHK,o:{style:st,seat:FALO.seat}};
      else c={x:0,y:0,lz:0,face:FALO.face,anim:'idle',p:(t/2.4)%1,sc:1/T3CHK,o:{style:st,seat:FALO.seat,mix:['sit',P9,ks]}};
      const dS=G.deathT;G.deathT=null;let H=null;try{H=t3HeroItems(c)}catch(e){t3Err(e)}finally{G.deathT=dS}
      if(H&&al>.02){t3Draw3(H.items,{H:H.imp?null:{R:H.R,MF:H.MF,a:H.a,Hw:H.Hw},al:al<.99?Math.max(.3,al):1});if(H.imp){t3CardsBegin();t3HeadCard(H.R,H.Hw,H.a);t3CardsEnd()}}
      pk('hero');const q=t3IProj([0,0,0]);if(q){const s=t3IKpx(q[2]);CAMP.hero={x:q[0],y:q[1]-7*s,w:20*s,h:44*s,dpr:F.dpr}}}
    // the game's own flames (66) standing in the fire on a card, not lit (they are the light)
    t3CardsBegin();t3Card(F3[0],F3[1]+.5,1,[-9,-26,9,2],()=>zfFlames([F3[0],F3[1]-2],1.15,t,fl),{lit:0,res:1.3});t3CardsEnd();
    // the glow round the flames, the sparks that shoot up, the smoke
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);
    t3Q(F3[0],F3[1],8,-30*fl,-22*fl,30*fl,26*fl,0,0,1,1,.3*fl,.14*fl,.05*fl,1);
    t3Q(F3[0],F3[1],7,-8*fl,-9*fl,8*fl,10*fl,0,0,1,1,.32*fl,.2*fl,.08*fl,1);
    const nS=LOWFX?2:7;if(Math.random()<dt*nS*2)T3F.sp.push({x:F3[0]+(Math.random()-.5)*5,y:F3[1]+(Math.random()-.5)*5,z:8,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*6,vz:22+Math.random()*24,l:.6+Math.random()*.9});
    for(let i=T3F.sp.length-1;i>=0;i--){const e=T3F.sp[i];e.l-=dt;if(e.l<=0){T3F.sp.splice(i,1);continue}e.vx+=Math.sin(t*3+i)*8*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.z+=e.vz*dt;e.vz*=1-dt*.6;const a=Math.min(1,e.l*1.6);
      t3Q(e.x,e.y,e.z,-.55,-.55,.55,.55+Math.min(1.6,e.vz*.04),0,0,1,1,1*a,(.7+(i%3)*.08)*a,.32*a,1)}
    t3QFlush(T3.pA,T3.glow);
    if(!LOWFX){if(Math.random()<dt*1.4)T3F.sm.push({x:F3[0]+(Math.random()-.5)*4,y:F3[1],z:16,l:0});for(let i=T3F.sm.length-1;i>=0;i--){const m=T3F.sm[i];m.l+=dt/4;if(m.l>=1){T3F.sm.splice(i,1);continue}m.z+=dt*7;m.x+=dt*(3+m.l*5);
        const r=3+m.l*12;T3I.dust.push([[m.x,m.y,m.z],r,.22*Math.sin(m.l*Math.PI)])}
      if(T3I.dust.length){for(const[p,r,a] of T3I.dust)t3Q(p[0],p[1],p[2],-r,-r,r,r,0,0,1,1,.16,.17,.16,a);T3I.dust.length=0;gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);if(!T3I.pCl)T3I.pCl=t3Prog(T3VS_BB,T3FS_ICL,['aP','aQ','aT','aC']);t3QFlush(T3I.pCl,X.cloud)}}
    gl.depthMask(true);gl.disable(gl.BLEND);
    pk('fx');t3Post({hit:0,low:0,fade:CAMP.walk>0&&t-CAMP.walk>.9?Math.min(1,(t-CAMP.walk-.9)/.6):0})}
  finally{T3LUCI[key]=keep;T3.lean=lean}
  // over it: nothing of the old drawing (the menu's words and buttons are the page's)
  campX.setTransform(1,0,0,1,0,0);campX.clearRect(0,0,campCv.width,campCv.height);
  T3F.ms=T3F.ms?T3F.ms*.9+(performance.now()-t0)*.1:performance.now()-t0}
{const _z=drawCampZ;drawCampZ=function(dt,k){if(!t3FaloOk())return _z.apply(this,arguments);try{t3FaloFrame(dt,k)}catch(e){t3Err(e);T3F.bad=true;return _z.apply(this,arguments)}}}
