// ------------------------------------------------------------------ 11 · who's who, the sets of the training film and its shots
// FM.prot: the hero you chose (the protagonist, who only thinks); the other one is the companion (who speaks). Their looks are the
// game's: the Arciere with the leather jacket and the ash bow, the Cacciatrice with her golden hood, the ponytail and the pink bow.
// The Balestriere (helmet, crossbow) and the Druida (antlers, staff) train with them (Denis, 14 October: «aggiungi anche gli altri pg
// nel filmato»): they wait at the training ground, watch the contest, laugh with them and sit on the log at the end; one line each.
const B_ID=()=>FM.prot==='cacciatrice'?'cacciatrice':'arciere',B_CO=()=>B_ID()==='arciere'?'cacciatrice':'arciere';
const BST={arciere:{...HERO,armor:'giubba',ring:null,amu:null,held:'bow',quiver:true,bowCol:'#a4703d',bowKind:null},
  cacciatrice:{...HERO,...HERO_BY.cacciatrice.style,hid:'cacciatrice',armor:'giubba',ring:null,amu:null,held:'bow',quiver:true,bowKind:null},
  balestriere:{...HERO,...HERO_BY.balestriere.style,hid:'balestriere',armor:'giubba',ring:null,amu:null},
  druida:{...HERO,...HERO_BY.druida.style,hid:'druida',armor:'giubba',ring:null,amu:null,eyes:HERO_BY.druida.style.eyeCol}};
const BNAME={arciere:'Arciere',cacciatrice:'Cacciatrice',balestriere:'Balestriere',druida:'Druida'},BCOL={arciere:'#5cdec8',cacciatrice:'#ff8cbe',balestriere:'#a9c8ff',druida:'#7bf0a8'};
// the light of the morning on them: a warm tint, the sun's edge on the right; against the sun a darker tint and a golden outline
const BTINT='#fff1df',BRIM=['#ffd08a',.6,1,-1,1.3],BBACK='#cdb7bf',BRIMB=[['#ffd590',.85,1,-1,1.5],['#ffe2b0',.5,-1,-.4,1.1]];
function bHead(H,dy){return pr(H.x,-(dy==null?27:dy)-(H.y||0),H.z)}
const sunWash=(H,a)=>{const q=bHead(H,24);return['#ffb46a',a==null?.22:a,q[0]+q[2]*10,q[1]-q[2]*8,q[2]*30]};
// a point of a hero's body in the world (x forward, y right, z up, feet at 0), for what leaves his hands (arrows, pine cones)
function bodyW(H,q){const f=H.face,cs=Math.cos(f),sn=Math.sin(f);return[H.x+q[0]*cs-q[1]*sn,-q[2]-(H.y||0),H.z-q[0]*sn-q[1]*cs]}
// the facing that looks from (x, z) toward (tx, tz) (π/2 is toward our camera)
const faceTo=(x,z,tx,tz)=>Math.atan2(-(tz-z),tx-x);
// running: the walk of the game, faster, leaning in, longer steps and a bigger bounce
const RUN=.42,RUNV=48;const runP=(lt,ph)=>((((lt+(ph||0))/RUN)%1)+1)%1;
function runPose(A,k){k=k==null?1:k;A.lean=flp(A.lean,.3,k);A.B=[A.B[0],A.B[1],A.B[2]*(1+1.3*k)+.6*k];A.fL=[A.fL[0]*(1+.8*k),A.fL[1],A.fL[2]*(1+.7*k)];A.fR=[A.fR[0]*(1+.8*k),A.fR[1],A.fR[2]*(1+.7*k)];A.hp=flp(A.hp,.13,k)}
function bHero(id,o){const H=Object.assign({st:BST[id],moss:id===B_ID(),el:14,tint:BTINT,rim:BRIM,shadow:.32},o);return H}
const fogB=d=>({fog:DAWN.fog,fogD:d||900});
const walkP=(lt,cyc)=>((lt/cyc)%1+1)%1;// a slow move that loops (breathing, idle)

// ---------- the sets
const forestB=cfg=>forestSet({...cfg,skyFn:(t,sh)=>dawnSky(t,sh,{sun:cfg.sun||[.8,.32,15],birds:cfg.birds}),litCols:LIT_DAWN,flyCol:DAWN.mote,mistCol:DAWN.haze,rayCol:DAWN.sun,flies:cfg.flies||12});
// the opening: the crane comes down from the sky at sunrise to the path where the two come running
SETS.bAlba=forestB({seed:71,sun:[.74,.36,17],rays:.9,rayX:.5,rayAng:-.18,hMul:.8,
  trees:[[-160,80,560,34],[190,100,600,38],[-310,190,520,30],[330,220,560,32],[-100,340,480,24],[270,370,540,28]],
  scatter:{n:44,x0:-1300,x1:1300,z0:260,z1:2300,keep:(x,z)=>!(z>380&&z<640&&Math.abs(x)<340)&&!(z<280)},
  path:[[-1200,486],[1200,506],[1200,550],[-1200,534]],line:[[2600,520,3],[3600,640,4]],nLitter:300,lx0:-600,lx1:600,lz0:200,lz1:900,
  tufts:[[-60,500,9,6],[40,560,8,5],[130,470,9,6],[-180,560,10,7],[220,540,9,6]],ferns:[[-120,470,14],[90,575,13],[-250,520,15]],flies:18,fx0:-300,fx1:300,fz0:250,fz1:800,
  mist:[[420,0,-12,520,26,.16,1.2],[640,-200,-18,700,34,.14,.8],[900,150,-22,900,40,.16,.6],[1400,0,-30,1300,60,.14,.5]],
  fore:[{k:'leaves',z:30,x:70,y:-430,w:110,h:30,r:13,n:14,blur:2.5,seed:8,dir:-1,col:'#3c5226'}]});
// the run, seen from the side: the path goes across, near trunks pass in front of the lens
SETS.bCorsa=forestB({seed:83,sun:[.86,.2,13],rays:.7,rayX:.45,rayAng:-.2,
  trees:[[-140,130,520,30],[40,190,560,34],[230,150,500,26],[-300,260,560,32],[420,240,540,30],[650,170,520,28],[860,230,560,32],[1080,160,520,30]],
  scatter:{n:60,x0:-700,x1:2000,z0:110,z1:1800},
  path:[[-900,-18],[2400,-12],[2400,20],[-900,16]],line:[[2400,480,6],[3400,600,7]],lx0:-300,lx1:1600,lz0:-20,lz1:400,nLitter:420,
  tufts:[[-50,24,10,7],[60,30,9,6],[200,26,11,7],[350,40,10,6],[520,30,9,6],[700,34,10,7],[880,28,9,6]],ferns:[[-35,62,16],[160,70,15],[420,80,17],[640,66,16],[900,74,15]],flies:14,fx0:-200,fx1:1400,fz0:40,fz1:400,
  mist:[[90,-60,-10,260,18,.12,1],[260,300,-14,420,26,.14,.8],[600,700,-24,800,40,.14,.6]],
  fore:[{k:'trunk',z:-70,x:-30,h:520,w:4,blur:5,seed:41,col:'#3a2a1e'},{k:'trunk',z:-66,x:150,h:520,w:3.2,blur:5,seed:43,col:'#3a2a1e'},{k:'trunk',z:-72,x:420,h:520,w:4.4,blur:5,seed:47,col:'#3a2a1e'},
    {k:'trunk',z:-68,x:690,h:520,w:3.6,blur:5,seed:49,col:'#3a2a1e'},{k:'fern',z:-60,x:260,h:14,blur:5,seed:9,col:'#33461f'},{k:'tuft',z:-58,x:560,h:10,blur:4,seed:2,col:'#33461f'}]});
// the run toward us: the path comes to the camera, the sun behind them
SETS.bCorsa2=forestB({seed:97,sun:[.56,.3,16],rays:.9,rayX:.3,rayAng:.12,
  trees:[[-150,90,520,26],[160,120,560,30],[-170,210,540,28],[190,260,600,32],[-110,380,480,22],[130,460,500,24]],
  scatter:{n:44,x0:-900,x1:900,z0:130,z1:2200,keep:keepPath(90)},
  path:[[-30,-200],[30,-200],[34,300],[20,800],[12,1600],[-12,1600],[-20,800],[-34,300]],line:[[2600,520,8],[3600,640,9]],lx0:-160,lx1:160,lz0:-60,lz1:500,nLitter:330,
  tufts:[[-38,30,10,7],[40,52,11,6],[-44,90,10,6],[42,130,9,6],[-40,-20,10,7],[44,-40,9,6]],ferns:[[-58,44,18],[62,70,17],[-66,150,18]],flies:14,fx0:-120,fx1:120,fz0:0,fz1:500,
  mist:[[120,0,-10,200,16,.12,1],[300,20,-16,400,26,.14,.8],[700,0,-24,700,40,.16,.6]]});
// the training ground: a clearing with straw targets, hay bales, a fence, a banner and a target hanging from a branch
const CAMPO={t1:{x:0,z:170,y:-30,r:15},hang:{x:46,z:300,py:-138,len:74,r:14},bales:[[-128,80,40,22],[-152,118,30,17],[142,62,42,22]],basket:{x:132,z:58},
  decor:[{x:-74,z:212,y:-29,r:14,yaw:.38,hits:[[.3,-.2,-2.2,.55],[-.45,.4,-2.6,.5]]},{x:84,z:232,y:-28,r:14,yaw:-.32,hits:[[-.1,.3,-.9,.55]]}],
  banner:{x:-112,z:268,h:84},fence:[-320,320,440,30]};
const hangAng=t=>.26*Math.sin(t*2.1)+.05*Math.sin(t*5.3);
SETS.bCampo=forestB({seed:109,sun:[.84,.24,15],rays:.6,rayX:.55,rayAng:-.12,
  trees:[[-250,160,560,34],[262,200,600,38],[150,330,620,40],[-200,420,560,32],[360,460,600,34],[-420,300,540,30],[480,320,560,32]],
  scatter:{n:46,x0:-1400,x1:1400,z0:480,z1:2400,keep:(x,z)=>!(Math.abs(x)<300&&z<560)},
  path:[[-90,-120],[90,-120],[70,60],[30,190],[-30,190],[-70,60]],line:[[2200,520,12],[3200,620,13]],lx0:-420,lx1:420,lz0:-120,lz1:520,nLitter:360,
  tufts:[[-110,-20,9,6],[120,10,10,7],[-170,140,10,6],[170,150,9,6],[-40,250,9,6],[60,270,10,6],[-220,40,11,7],[230,90,10,6]],ferns:[[-190,90,16],[200,120,16],[-260,240,18]],
  flies:16,fx0:-260,fx1:260,fz0:-40,fz1:420,mist:[[380,0,-12,600,26,.1,.8],[700,0,-24,900,40,.12,.6]],
  items(t,sh,lt,out){const F=z=>col=>fogc(col,z),H=CAMPO.hang,st=sh.campo||{};
    out.push({z:CAMPO.fence[2],c:c=>drawFence(c,CAMPO.fence[0],CAMPO.fence[1],CAMPO.fence[3],F(CAMPO.fence[2]),5)});
    out.push({z:CAMPO.banner.z,c:c=>drawBanner(c,CAMPO.banner.x,CAMPO.banner.h,F(CAMPO.banner.z),t)});
    for(const[x,z,w,h] of CAMPO.bales)out.push({z,c:c=>drawBale(c,x,w,h,F(z),(x+z)|0)});
    out.push({z:CAMPO.basket.z-1,c:c=>{c.save();c.translate(0,-22);drawBasket(c,CAMPO.basket.x,F(CAMPO.basket.z));c.restore()}});
    for(const d of CAMPO.decor)out.push({z:d.z,c:c=>drawTarget(c,d.x,d.y,d.r,{yaw:d.yaw,F:F(d.z),seed:(d.x+d.z)|0,hits:d.hits})});
    // the main target (its hits and its wobble come from the shot)
    {const T=CAMPO.t1,wob=st.t1wob?st.t1wob(t):0;out.push({z:T.z,c:c=>{drawTarget(c,T.x,T.y,T.r,{F:F(T.z),seed:31,rot:wob,hits:st.t1hits?st.t1hits(t):[]});if(st.t1burst)st.t1burst(c,t)}})}
    // the branch and the target hanging from it
    out.push({z:H.z+2,c:c=>drawBranch(c,H.x+120,H.py-30,H.x-22,H.py+4,9,F(H.z+2),t)});
    out.push({z:H.z,c:c=>{drawHanging(c,H.x,H.py,H.r,H.len,st.hangAng?st.hangAng(t):hangAng(t),{F:F(H.z),seed:57,hits:st.hangHits?st.hangHits(t):[]});if(st.hangFx)st.hangFx(c,t)}})}});
// the end: a mossy trunk at the edge of the forest, the valley in the morning haze, the crypt far away on its hill
SETS.bTronco=forestB({seed:131,sun:[.8,.22,15],rays:.5,rayX:.62,rayAng:-.1,birds:true,
  trees:[[-210,90,600,36],[230,110,620,38],[-360,180,560,32],[390,200,580,34]],scatter:{n:10,x0:-900,x1:900,z0:200,z1:500,keep:(x,z)=>Math.abs(x)>330},
  line:[[760,120,21],[2300,420,23],[3200,520,24]],lx0:-200,lx1:200,lz0:-40,lz1:140,nLitter:200,
  tufts:[[-60,-10,9,7],[70,-6,10,7],[-30,24,9,6],[40,30,9,6],[-120,40,11,7],[130,50,10,7]],ferns:[[-90,10,16],[96,20,16]],flies:10,fx0:-150,fx1:150,fz0:-20,fz1:200,
  mist:[[500,0,-20,900,40,.2,.4],[1000,200,-40,1500,60,.22,.3]],
  items(t,sh,lt,out){out.push({z:1250,c:c=>drawCryptFar(c,150,1250,t,760,250)});
    out.push({z:-4,c:c=>drawLog(c,-70,62,-6,8,col=>fogc(col,-4),t,9)})}});
SETS.nero={items:()=>[]};
