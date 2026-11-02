// =====================================================================
// 111. MOSSBOUND TRIPLA A · L'EROE IN 3D VERO NELLA STANZA (anteprima a parte, con 110).
// L'eroe della Classica fatto di triangoli dai pezzi del suo modello, come nella visuale zombie (EROE.rig3d dà la posa di questo momento;
// il disegno dell'eroe resta identico al pixel): corpo con la giubba, il cappuccio col viso dipinto punto per punto sulla palla della testa,
// i piedi, le mani, e l'arco vero di ARMI3D (lo stesso modello: si piega con la corda, la freccia incoccata, le punte, l'impugnatura). La mossa
// e tutto il resto (direzione, tiro della corda, scatto, colpito, il lampeggio dopo un colpo, il vestito, l'aspetto) li decide il gioco come
// sempre: il suo drawHero si fa una volta «a vuoto» e si legge con cosa chiamerebbe il modello. Gli eroi con la testa diversa (la coda della
// Cacciatrice, l'elmo, le corna, la maschera, l'aspetto cambiato) hanno la testa dipinta del gioco al suo posto, come una palla.
// Sotto l'eroe la sua ombra morbida. Se qualcosa non va, torna la cartolina.
// =====================================================================
const T3E={cap:null,dc:null,bad:false,n:0};
{const _a=EROE.arciere;EROE.arciere=function(x,y,face,anim,p,sc,o){if(T3E.cap){T3E.cap.push({x,y,face,anim,p,sc:sc||1,o:o||{},al:ctx.globalAlpha});return}return _a.apply(this,arguments)}}
// what the game would draw now: drawHero «a vuoto» (on a tiny canvas, the model not called), the last call to the model
function t3HeroCap(){if(!T3E.dc){const c=document.createElement('canvas');c.width=c.height=2;T3E.dc=c.getContext('2d')}T3E.cap=[];const sv=ctx,ns=noShadow;ctx=T3E.dc;noShadow=true;
  try{drawHero()}catch(e){t3Err(e)}finally{ctx=sv;noShadow=ns}const c=T3E.cap;T3E.cap=null;return c.length?c[c.length-1]:null}
// ------------------------------------------------------------------ the soft shadows on the floor (under the hero, the enemies, the obstacles)
const T3FS_SH=`precision mediump float;uniform sampler2D uTex;varying vec2 vT;varying vec4 vC;void main(){float a=texture2D(uTex,vT).a*vC.a;if(a<.004)discard;gl_FragColor=vec4(0.,0.,0.,a);}`;
T3.shadows=[];
function t3Shadow(x,y,rx,ry,a){T3.shadows.push([x,y,rx,ry==null?rx*.62:ry,a==null?.42:a])}
function t3Shadows(){const S=T3.shadows;if(!S.length)return;const gl=T3.gl;if(!T3.pSh)T3.pSh=t3Prog(T3VS_BB,T3FS_SH,['aP','aQ','aT','aC']);
  for(const[x,y,rx,ry,a] of S)t3QW([[x-rx,y+ry,.8],[x+rx,y+ry,.8],[x+rx,y-ry,.8],[x-rx,y-ry,.8]],0,0,1,1,1,1,1,a*(t3L()===T3LUCI.film?1.15:1));
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);t3QFlush(T3.pSh,T3.glow);gl.depthMask(true);gl.disable(gl.BLEND);S.length=0}
T3H.ground.push(t3Shadows);
// ------------------------------------------------------------------ the hero
const T3BK=5.6;
// (the characters a little bigger than their 2D size: seen from above the body is shorter than in the game's drawing, which shows it whole)
const T3CHK=1.2;
// the characters lean back a little, away from the camera (T3.lean: how far north the top goes for each unit of height), their feet planted
// where they are: their drawings see them from about 29° above the floor, the camera from 50°; leaning back their front turns up toward the
// camera (faces, the stem under the mushroom's cap, the hero's back) as in their drawings, while what is flat (a cap, a hood's top) stays flat
T3.lean=.32;
function t3CharM(a,sc,x,y,z){const ca=Math.cos(a),sa=Math.sin(a),k=T3.lean||0;return v3M4([ca*sc,sa*sc,0],[-sa*sc,ca*sc,0],[0,-k*sc,sc],[x,y,z||0])}
function t3HeroItems(c){const S0=c.o.style||{},sc=(c.sc||1)*T3CHK,R=EROE.rig3d(c.face,c.anim,c.p,Object.assign({},c.o,{style:S0}));const M0=t3Statics(),{mul,nrm,add,sub,dot}=RG;
  const a=c.face;let MF=t3CharM(a,sc,c.x,c.y,c.lz||0);
  // fallen (the end of the run): on his side, as the game shows him
  if(G.state==='dead'&&G.deathT!=null){const f=Math.min(1,G.deathT/.5),fa=-f*1.42,cf=Math.cos(fa),sf=Math.sin(fa);MF=v3Mul(MF,v3Mul(v3M4([1,0,0],[0,cf,sf],[0,-sf,cf],[0,0,6]),v3M4([1,0,0],[0,1,0],[0,0,1],[0,0,-6])))}
  const S=R.S,A=R.A,items=[];
  {const cA=Math.cos(A.lean),sA=Math.sin(A.lean),cr=Math.cos(A.roll),sr=Math.sin(A.roll),sz=1+A.s,sxy=1/Math.sqrt(Math.max(.3,sz)),sx=sxy*(1+(A.sx||0)),ZB=R.zb;
    const TU=v3M4([cA,0,-sA],[-sA*sr,cr,-cA*sr],[sA*cr,sr,cA*cr],[A.B[0],A.B[1],ZB+A.B[2]]),SC=v3M4([sx,0,0],[0,sxy,0],[0,0,sz],[0,0,-ZB*sz]);
    let bm=T3E.body&&T3E.body.prof===R.prof?T3E.body.m:null;if(!bm){if(T3E.body)v3Free(T3E.body.m);bm=v3BodyMesh(R.prof,R.bz,R.ax);T3E.body={prof:R.prof,m:bm}}
    items.push({m:bm,M:v3Mul(MF,v3Mul(TU,SC)),tex:v3Tunic(R),out:.62})}
  const Hw=v3Pt(MF,R.Hc),imp=v3NeedImp(R.S0);if(!imp)items.push({m:M0.ball,M:v3M4([R.Rh*sc,0,0],[0,R.Rh*sc,0],[0,0,R.Rh*sc],Hw),head:1,out:.62});
  if(R.feet)for(const fp of R.feet)items.push({m:M0.foot,M:v3Mul(MF,v3M4([1,0,0],[0,1,0],[0,0,1],fp)),tint:v3Tint(S.foot||'#4a3626'),out:.42});
  const ball=(p,r,col)=>items.push({m:M0.ball2,M:v3M4([r*sc,0,0],[0,r*sc,0],[0,0,r*sc],p),tint:v3Tint(col),out:.42});
  for(const[hp,r] of R.hands)ball(v3Pt(MF,hp),r,S.hand);
  if(R.gun){const G0=R.gun,fr=G0.fr,gm=v3GunMesh(G0.id,G0.st);if(gm){const MG=v3Mul(MF,v3M4(mul(fr.X,fr.s),mul(fr.Y,fr.s),mul(fr.Z,fr.s),fr.O));items.push({m:gm.mesh,M:MG,out:.3});
      const hd=G0.hands(gm.kp);if(hd.rh)ball(v3Pt(MG,hd.rh),2.8,S.hand);if(hd.lh)ball(v3Pt(MG,hd.lh),2.7,S.hand);if(gm.kp.muzzle)T3E.muz=v3Pt(MG,gm.kp.muzzle)}}
  else if(R.wid==='arco'){// the bow (the 2D model's own: its frame from the pose's grip, aim and up; its kind and colour from the weapon worn)
    const wk=S0.weapon;let bk=S0.bowKind!==undefined?S0.bowKind:(wk&&EROE.BOWS[wk]?EROE.BOWS[wk][1]:null);if(bk==='plain'||bk==='xbow')bk=null;const bcol=S0.bowCol||(wk&&EROE.BOWS[wk]?EROE.BOWS[wk][0]:EROE.HC.bow);
    const X=R.X,grip=X.T(A.grip),aim=nrm(X.Rd(A.aim)),up=nrm(X.Rd(A.up)),fr=ARMI3D.frame(grip,aim,up,1),hR=X.T(A.hR),loc=q=>{const d=sub(q,grip);return[dot(d,fr.X),dot(d,fr.Y),dot(d,fr.Z)]},strOn=c.anim==='shoot'||c.anim==='aim';
    let pinch=null;if(A.pinch)pinch=loc(hR);else if(A.twang>0)pinch=[-(T3BK+A.draw*1.6)+Math.sin(A.twang*22)*1.2*A.twang,0,0];
    const st={kind:bk||'plain',col:bcol,draw:A.draw||0,pinch,nock:A.nock||0};const gm=v3GunMesh('arco',st);
    if(gm){const MG=v3Mul(MF,v3M4(mul(fr.X,fr.s),mul(fr.Y,fr.s),mul(fr.Z,fr.s),fr.O));items.push({m:gm.mesh,M:MG,out:.28});ball(v3Pt(MF,grip),2.8,S.hand);ball(v3Pt(MF,hR),2.7,S.hand);
      T3E.muz=v3Pt(MG,[7.4,0,0])}}
  return{items,R,MF,a,Hw,imp}}
function t3Statics(){if(T3E.st)return T3E.st;const W=[255,255,255,255],M={};
  {const mb=v3MB();v3Sphere(mb,[0,0,0],1,W,26,18);M.ball=v3Up(mb)}{const mb=v3MB();v3Sphere(mb,[0,0,0],1,W,12,8);M.ball2=v3Up(mb)}
  {const mb=v3MB(),a=[-1,0,3],b=[1.7,0,2.85],ra=3.05,rb=3.15,{add,mul,nrm,sub,cross}=RG,u=nrm(sub(b,a)),v=nrm(cross(u,[0,0,1])),w=cross(u,v),N=14,rows=[];
    for(let k=0;k<=10;k++){const front=k>5,ph=front?(k-5)/5*Math.PI/2:(k/5-1)*Math.PI/2,C=front?b:a,r=front?rb:ra,row=[];
      for(let i=0;i<=N;i++){const an=i/N*Math.PI*2,d=add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),n=add(mul(u,Math.sin(ph)),mul(d,Math.cos(ph)));row.push(v3V(mb,add(C,mul(n,r)),n,W))}rows.push(row)}
    for(let j=0;j<rows.length-1;j++)for(let i=0;i<N;i++){v3T(mb,rows[j][i],rows[j][i+1],rows[j+1][i+1]);v3T(mb,rows[j][i],rows[j+1][i+1],rows[j+1][i])}M.foot=v3Up(mb)}
  {const mb=v3MB();v3Tube(mb,[[0,0,0],[1,0,0]],[1,1],W,8);M.stick=v3Up(mb)}
  // (the visuale's helpers look for these in V3.hm)
  V3.hm=Object.assign(V3.hm||{},M,{white:T3.white});return T3E.st=M}
// the painted head of the heroes with pieces of their own: the game's own head, seen from the side the camera sees it, on a card at its place
function t3HeadCard(R,Hw,a){const r=R.Rh*1.9;
  t3Card(Hw[0],Hw[1],Hw[2],[-r,-r,r,r],()=>{ctx.save();ctx.translate(Hw[0],Hw[1]);R.paintHead(R.head.yaw);ctx.restore()},{lit:1})}
T3H.hero=function(){if(T3E.bad)return false;if(G.door&&P.y<TOP-30)return true;const c=t3HeroCap();if(!c)return true;
  let H;try{H=t3HeroItems(c)}catch(e){t3Err(e);T3E.bad=true;return false}
  const sc=(c.sc||1)*T3CHK;t3Shadow(c.x,c.y,13*sc,7*sc,.45);
  const fl=P.hurtT!=null&&G.t-P.hurtT<.12?1-(G.t-P.hurtT)/.12:0;
  t3Draw3(H.items,{H:H.imp?null:{R:H.R,MF:H.MF,a:H.a,Hw:H.Hw},al:c.al<.99?Math.max(.35,c.al):1,fl,flc:[1,.45,.42]});
  if(H.imp)t3HeadCard(H.R,H.Hw,H.a);
  T3E.n=H.items.length;return true};
