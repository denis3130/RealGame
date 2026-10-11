// ---------- ANTEPRIMA: la mappa zombie nello stile nuovo (anteprime/mk_mappa3d.py la incolla in una copia del gioco) ----------
// Mappa di 25×25 caselle (casella = 64): Cimitero in alto a sinistra, Quartiere in alto a destra, Piazza al centro (partenza, Bara delle
// Sorprese, arma al muro), Fattoria in basso. Ogni cosa è un volume 3D visto dalla stessa telecamera dei mostri (V(face) di
// disegno_mostri.js: lo schermo è x, y·0,55 − z), dipinto come la lanterna: tre toni su ogni faccia, luce calda in alto a sinistra,
// bordo illuminato, contorno scuro spesso, ombre morbide sul terreno. I pezzi fermi sono disegnati una volta in immagini; le luci, gli
// zombie e l'eroe dal vivo. Si entra nelle case camminando: il tetto sfuma e il muro davanti si fa trasparente. Le zone si aprono
// togliendo le barricate con le monete. Gli zombie escono da terra intorno all'eroe.
(()=>{
const R0=CR._rig,{TAU,cl,ez,lerp,mix,shine,ball,seg,tri,rim,glowTop,wa}=R0;
const SMALL=true;// Denis: «fammi solo una piccola area» — un angolo di 10×10 caselle; false = la mappa intera di 25×25
const T=64,N=SMALL?10:25,WW=T*N,K=.55,GS=1.5,SS=2,MARG=420;   // tile, tiles, world size, depth squash, ground and sprite resolution, outside margin
const S=(x,y,z)=>[x,y*K-(z||0)];                       // world -> screen (the monsters' camera)
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646},rr=(a,b)=>a+(b-a)*rnd();
// ------------------------------------------------------------------ palette: night, sick greens, cold greys, warm lamps
const PAL={grass:['#38432a','#2f3923','#46532f'],soil:['#353a2e','#2c3027','#41463a'],dirt:['#4a3e30','#3c3227','#584a39'],cobble:['#4c4c52','#3b3b41','#606068'],
  field:['#4a3a29','#3b2e21','#594633'],wood:['#5a4330','#46331f','#6c523b'],stone:['#4f4c55','#3e3c44','#615e68'],
  brick:['#8a3a2e','#6a2a22','#a8503f'],plank:['#6e5236','#523b25','#87683f'],slate:['#3c4552','#2b323c','#535f6e'],tile:['#7a3527','#5a2519','#96503a'],
  iron:'#2d2f36',ironL:'#5d616c',lamp:'255,196,110',candle:'255,170,80',sick:'150,255,110',moon:'#c9d4ff'};
// ------------------------------------------------------------------ zones
const ZN={cim:{n:'Cimitero',price:750},qua:{n:'Quartiere',price:1000},fat:{n:'Fattoria',price:1250},pia:{n:'Piazza',price:0}};
const zoneAt=(x,y)=>SMALL?'pia':y<10*T?(x<12*T?'cim':'qua'):y<14.2*T?'pia':'fat';
const open={pia:true,cim:false,qua:false,fat:false};
// ------------------------------------------------------------------ painting helpers in screen space (inside sprites)
function ink2(w){ctx.strokeStyle=INK;ctx.lineWidth=w||2.4;ctx.lineJoin='round';ctx.lineCap='round'}
function polyP(pts){ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath()}
// a face of a volume: flat colour, darker toward the bottom (k0..k1 of the face's height), a warm light at the top, the outline
function face(pts,col,dark,light,o){o=o||{};polyP(pts);ctx.fillStyle=col;ctx.fill();ctx.save();ctx.clip();let y0=1e9,y1=-1e9,x0=1e9,x1=-1e9;for(const q of pts){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0])}
  if(o.tex)o.tex(x0,y0,x1,y1);const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(0,0,0,0)');g.addColorStop(1,dark);ctx.fillStyle=g;ctx.fillRect(x0-2,y0-2,x1-x0+4,y1-y0+4);
  if(light){const g2=ctx.createLinearGradient(x0,y0,x0+(x1-x0)*.6,y0+(y1-y0)*.6);g2.addColorStop(0,light);g2.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g2;ctx.fillRect(x0-2,y0-2,x1-x0+4,y1-y0+4)}
  ctx.restore();polyP(pts);ink2(o.lw||2.4);ctx.stroke()}
// a box (world x,y,z = the north-west-bottom corner, w along x, d along y, h up): the top and the south face are the ones the camera sees
function box(x,y,z,w,d,h,c,o){o=o||{};const A=S(x,y+d,z),B=S(x+w,y+d,z),C=S(x+w,y+d,z+h),D=S(x,y+d,z+h),E=S(x,y,z+h),F=S(x+w,y,z+h);
  face([A,B,C,D],c[0],'rgba(0,0,0,.42)',wa(.12),{tex:o.tex,lw:o.lw});
  if(o.noTop)return;face([D,C,F,E],c[2],'rgba(0,0,0,.1)',wa(.3),{tex:o.texTop,lw:o.lw});
  ctx.strokeStyle=wa(.5);ctx.lineWidth=1.1;seg([D[0]+1.5,D[1]+.8],[C[0]-1.5,C[1]+.8]);ctx.stroke()}
// a vertical cylinder (post, trunk, well), lit from the left
function cyl(x,y,z,r,h,c){const a=S(x,y,z),b=S(x,y,z+h),ry=r*K;ctx.beginPath();ctx.ellipse(a[0],a[1],r,ry,0,0,Math.PI);ctx.lineTo(b[0]-r,b[1]);ctx.ellipse(b[0],b[1],r,ry,0,Math.PI,0,true);ctx.closePath();
  ctx.fillStyle=c[0];ctx.fill();ctx.save();ctx.clip();const g=ctx.createLinearGradient(a[0]-r,0,a[0]+r,0);g.addColorStop(0,wa(.3));g.addColorStop(.35,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=g;ctx.fillRect(a[0]-r,b[1]-ry,2*r,a[1]-b[1]+2*ry);ctx.restore();
  ink2(2.2);ctx.stroke();ctx.beginPath();ctx.ellipse(b[0],b[1],r,ry,0,0,TAU);ctx.fillStyle=c[2];ctx.fill();ink2(2);ctx.stroke()}
// a ball (foliage, a pumpkin), three tones and the rim
function bal(q,r,c,sq){ctx.save();ctx.translate(q[0],q[1]);ctx.scale(1,sq||1);ink2(2.4);ball([0,0],r);ctx.fillStyle=c[0];ctx.fill();ctx.stroke();ctx.save();ball([0,0],r-1);ctx.clip();ctx.fillStyle=c[1];ctx.beginPath();ctx.ellipse(r*.35,r*.55,r,r*.65,0,0,TAU);ctx.fill();glowTop([0,0],r,.28);ctx.restore();rim([0,0],r,[0,0],r,.3);ctx.restore()}
// ------------------------------------------------------------------ sprites: a static thing drawn once into its own canvas
function sprite(bx,draw){const[x0,y0,x1,y1]=bx,c=document.createElement('canvas');c.width=Math.ceil((x1-x0)*SS);c.height=Math.ceil((y1-y0)*SS);const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(SS,SS);ctx.translate(-x0,-y0);try{draw()}finally{ctx=sv}return{c,x0,y0,w:x1-x0,h:y1-y0}}
const blit=(sp,a)=>{if(a!=null&&a<1){ctx.save();ctx.globalAlpha*=a;ctx.drawImage(sp.c,sp.x0,sp.y0,sp.w,sp.h);ctx.restore()}else ctx.drawImage(sp.c,sp.x0,sp.y0,sp.w,sp.h)};
// ------------------------------------------------------------------ the world: things, solids, lights, spawn holes
const things=[],solids=[],lights=[],holes=[],bars=[],houses=[];
const solid=(x,y,w,d,tag)=>{const s={x,y,w,d,tag};solids.push(s);return s};
// a static thing: its sort key is the world y of its front edge
function thing(ky,bx,draw,o){const t=Object.assign({ky,sp:sprite(bx,draw)},o||{});things.push(t);return t}
// shadows baked into the ground: a soft polygon pushed down-right from a footprint
const shadows=[];const shadowRect=(x,y,w,d,h)=>shadows.push({x,y,w,d,h});const shadowOval=(x,y,r)=>shadows.push({x,y,r});

// gravestone: a slab with a rounded top, a cross, or a fallen one
function grave(x,y,kind){const w=kind===2?14:22,h=kind===2?30:24+rnd()*8,lean=(rnd()-.5)*.25;shadowRect(x-w/2,y-4,w,8,h);solid(x-w/2,y-5,w,9);
  thing(y+4,[x-30,y*K-h-16,x+30,y*K+12],()=>{const c=PAL.stone;ctx.save();const b=S(x,y+4,0);ctx.translate(b[0],b[1]);ctx.rotate(lean);ctx.translate(-b[0],-b[1]);
    if(kind===2){box(x-2.5,y-2,0,5,5,h,c);box(x-8,y-2,h*.62,16,5,5,c)}
    else{const A=S(x-w/2,y+4,0),B=S(x+w/2,y+4,0),C=S(x+w/2,y+4,h-w/2),D=S(x-w/2,y+4,h-w/2),Tp=S(x,y+4,h-w/2);
      // the stone's thickness on top, then the face with its round top
      ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(C[0],C[1]);ctx.arc(Tp[0],Tp[1],w/2,0,Math.PI,true);ctx.closePath();ctx.fillStyle=c[2];ctx.save();ctx.translate(0,-4);ctx.fill();ink2();ctx.stroke();ctx.restore();
      ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(C[0],C[1]);ctx.arc(Tp[0],Tp[1],w/2,0,Math.PI,true);ctx.closePath();ctx.fillStyle=c[0];ctx.fill();
      ctx.save();ctx.clip();const g=ctx.createLinearGradient(0,Tp[1]-w/2,0,A[1]);g.addColorStop(0,wa(.22));g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=g;ctx.fillRect(A[0]-2,Tp[1]-w/2-2,w+4,A[1]-Tp[1]+w);
      // carved lines, a crack, moss at the foot
      ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=1.2;for(let i=0;i<3;i++){seg([Tp[0]-w*.28,Tp[1]+3+i*4],[Tp[0]+w*.28,Tp[1]+3+i*4]);ctx.stroke()}
      if(rnd()<.5){ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Tp[0]+w*.3,Tp[1]-w*.3);ctx.lineTo(Tp[0]+w*.1,Tp[1]+4);ctx.lineTo(Tp[0]+w*.22,Tp[1]+9);ctx.stroke()}
      ctx.fillStyle='rgba(90,130,60,.55)';ctx.beginPath();ctx.ellipse(A[0]+w*.3,A[1]-1,w*.35,3,0,0,TAU);ctx.fill();ctx.restore();
      ink2();ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(C[0],C[1]);ctx.arc(Tp[0],Tp[1],w/2,0,Math.PI,true);ctx.closePath();ctx.stroke();
      ctx.strokeStyle=wa(.4);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(Tp[0],Tp[1],w/2-1.5,Math.PI*1.05,Math.PI*1.6);ctx.stroke()}
    // the grave mound in front
    const m=S(x,y+16,0);ctx.fillStyle=PAL.dirt[1];ctx.beginPath();ctx.ellipse(m[0],m[1],w*.55,5,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.05)';ctx.beginPath();ctx.ellipse(m[0]-2,m[1]-1.5,w*.4,2.5,0,0,TAU);ctx.fill();ctx.restore()})}
// a dead tree or a living one: trunk cylinder, branches, foliage balls
function tree(x,y,dead,s){s=s||1;shadowOval(x+18*s,y+10,34*s);solid(x-8*s,y-6,16*s,12);const H=60*s;
  thing(y+6,[x-70*s,y*K-H-80*s,x+70*s,y*K+16],()=>{cyl(x,y,0,7*s,H*.62,[PAL.wood[1],0,PAL.wood[0]]);
    if(dead){ctx.lineCap='round';const b=S(x,y,H*.55),br=[[-30,-34],[26,-40],[-14,-58],[12,-62],[34,-18],[-38,-14]];for(const[dx,dy] of br){const e=[b[0]+dx*s,b[1]+dy*s*.9],m=[b[0]+dx*s*.45,b[1]+dy*s*.55-4];ctx.strokeStyle=INK;ctx.lineWidth=6*s;ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.quadraticCurveTo(m[0],m[1],e[0],e[1]);ctx.stroke();ctx.strokeStyle=PAL.wood[0];ctx.lineWidth=3*s;ctx.stroke();ctx.strokeStyle=wa(.25);ctx.lineWidth=1;ctx.stroke()}}
    else{const c=['#2f4a26','#20341a','#45663a'],b=S(x,y,H*.55);for(const[dx,dy,r] of [[-18,-6,22],[18,-8,21],[0,-26,26],[-12,-40,19],[14,-42,18],[0,-56,16]])bal([b[0]+dx*s,b[1]+dy*s],r*s,c)}})}
// iron fence along x (y fixed) from x0 to x1: posts with spear tips and two rails
function fenceIron(x0,x1,y){solid(x0,y-4,x1-x0,8);shadows.push({x:x0,y:y-2,w:x1-x0,d:4,h:30});
  thing(y+3,[x0-10,y*K-50,x1+10,y*K+10],()=>{const n=Math.max(2,Math.round((x1-x0)/14));for(const z of[8,26]){const a=S(x0,y,z),b=S(x1,y,z);ctx.strokeStyle=INK;ctx.lineWidth=4;seg(a,b);ctx.stroke();ctx.strokeStyle=PAL.ironL;ctx.lineWidth=1.6;seg(a,b);ctx.stroke()}
    for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,a=S(x,y,0),b=S(x,y,34);ctx.strokeStyle=INK;ctx.lineWidth=4.2;seg(a,b);ctx.stroke();ctx.strokeStyle=PAL.iron;ctx.lineWidth=2;seg(a,b);ctx.stroke();ctx.strokeStyle=wa(.35);ctx.lineWidth=.8;seg([a[0]-.6,a[1]],[b[0]-.6,b[1]]);ctx.stroke();ctx.fillStyle=PAL.ironL;ink2(1.4);tri(b[0],b[1]+1,b[0],b[1]-7,2.6)}})}
// wooden picket fence along x
function fenceWood(x0,x1,y){solid(x0,y-4,x1-x0,8);shadows.push({x:x0,y:y-2,w:x1-x0,d:4,h:24});
  thing(y+3,[x0-10,y*K-40,x1+10,y*K+10],()=>{const n=Math.max(2,Math.round((x1-x0)/12));box(x0,y-1,9,x1-x0,2,4,PAL.plank,{lw:1.8});box(x0,y-1,19,x1-x0,2,4,PAL.plank,{lw:1.8});
    for(let i=0;i<n;i++){const x=x0+(x1-x0)*(i+.5)/n,h=22+((i*7)%3);box(x-4,y,0,8,3,h,i%3?PAL.plank:[PAL.plank[1],PAL.plank[1],PAL.plank[0]],{lw:1.8});const t=S(x,y+3,h);ctx.fillStyle=PAL.plank[2];ink2(1.6);tri(t[0]-4,t[1],t[0],t[1]-5,0);ctx.beginPath();ctx.moveTo(t[0]-4,t[1]);ctx.lineTo(t[0],t[1]-5);ctx.lineTo(t[0]+4,t[1]);ctx.closePath();ctx.fill();ctx.stroke()}})}
// a stone wall (box) with courses of stones
const stoneTex=(x0,y0,x1,y1)=>{ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let y=y0+7,r=0;y<y1;y+=8,r++){seg([x0,y],[x1,y]);ctx.stroke();for(let x=x0+(r%2?6:12);x<x1;x+=16){seg([x,y-8],[x,y]);ctx.stroke()}}};
const plankTex=(x0,y0,x1,y1)=>{ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let x=x0+7;x<x1;x+=8){seg([x,y0],[x,y1]);ctx.stroke()}ctx.fillStyle='rgba(0,0,0,.4)';for(let x=x0+3;x<x1;x+=16){ball([x,y0+5],.8);ctx.fill();ball([x,y1-5],.8);ctx.fill()}};
const brickTex=(x0,y0,x1,y1)=>{ctx.strokeStyle='rgba(30,10,8,.45)';ctx.lineWidth=1;for(let y=y0+5,r=0;y<y1;y+=6,r++){seg([x0,y],[x1,y]);ctx.stroke();for(let x=x0+(r%2?4:10);x<x1;x+=12){seg([x,y-6],[x,y]);ctx.stroke()}}};
const slateTex=(x0,y0,x1,y1)=>{ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let y=y0+6,r=0;y<y1;y+=7,r++){seg([x0,y],[x1,y]);ctx.stroke();for(let x=x0+(r%2?5:11);x<x1;x+=12){seg([x,y-7],[x,y]);ctx.stroke()}}};
function wallStone(x,y,w,d,h){solid(x,y,w,d);shadowRect(x,y,w,d,h);thing(y+d,[x-10,y*K-h-10,x+w+10,(y+d)*K+10],()=>box(x,y,0,w,d,h,PAL.stone,{tex:stoneTex}))}
// ------------------------------------------------------------------ houses: walls you can walk into, interior, a roof that fades
// o: {x,y,w,d,H, wall:'brick'|'plank'|'stone', roof:'slate'|'tile', door: x offset of the door, furn: fn(x,y) drawing the interior}
function house(o){const{x,y,w,d,H}=o,th=10,dw=40,dx=x+o.door-dw/2,wc=PAL[o.wall],tex=o.wall==='brick'?brickTex:o.wall==='plank'?plankTex:stoneTex,rc=PAL[o.roof],rh=o.rh||46;
  solid(x,y,w,th);solid(x,y,th,d);solid(x+w-th,y,th,d);solid(x,y+d-th,dx-x,th);solid(dx+dw,y+d-th,x+w-dx-dw,th);shadowRect(x,y,w,d,H+rh);
  const h={o,a:1,inside:false,lights:[]};houses.push(h);
  // back part: back wall seen from inside, side walls' tops, the furniture (drawn before anyone inside)
  h.back=thing(y+th,[x-20,y*K-H-rh-30,x+w+20,(y+d)*K+20],()=>{box(x,y,0,w,th,H,wc,{tex});box(x,y+th,0,th,d-th*2,H,wc,{tex,noTop:false});box(x+w-th,y+th,0,th,d-th*2,H,wc,{tex});
    // windows on the back wall: boarded, a little light between the planks
    for(let i=1;i<=2;i++){const cx=x+w*i/3,a=S(cx-14,y+th,H*.38),b=S(cx+14,y+th,H*.38+26);ctx.fillStyle='#120e14';ctx.fillRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);ink2(2);ctx.strokeRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);
      for(let j=0;j<3;j++){ctx.save();ctx.translate((a[0]+b[0])/2,b[1]+5+j*8);ctx.rotate((j-1)*.12);ctx.fillStyle=PAL.plank[0];ctx.fillRect(-17,-3,34,6);ink2(1.4);ctx.strokeRect(-17,-3,34,6);ctx.restore()}}
    if(o.furn)o.furn(x,y)},{house:h,part:'back'});
  // front part: the front wall with the door and the windows; then the roof (each its own sprite so they fade apart)
  h.front=thing(y+d,[x-20,y*K-H-rh-30,x+w+20,(y+d)*K+20],()=>{box(x,y+d-th,0,dx-x,th,H,wc,{tex});box(dx+dw,y+d-th,0,x+w-dx-dw,th,H,wc,{tex});box(dx,y+d-th,48,dw,th,H-48,wc,{tex});
    // the door: open dark hole with a broken door hanging
    const a=S(dx,y+d,0),b=S(dx+dw,y+d,48);ctx.fillStyle='#0c0a0e';ctx.fillRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);ink2(2.4);ctx.strokeRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);
    ctx.save();ctx.translate(a[0]+2,b[1]+2);ctx.transform(1,.18,0,1,0,0);ctx.fillStyle=PAL.plank[1];ctx.fillRect(0,0,12,44);ink2(1.8);ctx.strokeRect(0,0,12,44);ctx.restore();
    // front windows: some boarded, some broken with a warm light inside
    for(const fx of[x+(dx-x)/2,dx+dw+(x+w-dx-dw)/2]){if(Math.abs(fx-(dx+dw/2))<40)continue;const p=S(fx-15,y+d,H*.38),q=S(fx+15,y+d,H*.38+28);ctx.fillStyle='#1a1208';ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1]);
      const g=ctx.createRadialGradient((p[0]+q[0])/2,(p[1]+q[1])/2,2,(p[0]+q[0])/2,(p[1]+q[1])/2,20);g.addColorStop(0,'rgba(255,190,100,.7)');g.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=g;ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1]);
      ink2(2.2);ctx.strokeRect(p[0],q[1],q[0]-p[0],p[1]-q[1]);ctx.strokeStyle=PAL.plank[1];ctx.lineWidth=2.4;seg([(p[0]+q[0])/2,q[1]],[(p[0]+q[0])/2,p[1]]);ctx.stroke();
      for(let j=0;j<2;j++){ctx.save();ctx.translate((p[0]+q[0])/2,q[1]+8+j*13);ctx.rotate(j?-.25:.18);ctx.fillStyle=PAL.plank[0];ctx.fillRect(-19,-3,38,6);ink2(1.4);ctx.strokeRect(-19,-3,38,6);ctx.restore()}
      ctx.fillStyle=PAL.plank[2];ctx.fillRect(p[0]-3,p[1],q[0]-p[0]+6,4);ink2(1.4);ctx.strokeRect(p[0]-3,p[1],q[0]-p[0]+6,4)}},{house:h,part:'front'});
  // the roof: two slopes along x with the ridge in the middle, tiles or slates, a chimney
  h.roof=thing(y+d+.5,[x-24,y*K-H-rh-40,x+w+24,(y+d)*K-H+30],()=>{const ov=10,L=x-ov,Rr=x+w+ov,yN=y-ov,yS=y+d+ov,ym=y+d/2,zE=H,zR=H+rh;
    const N1=S(L,yN,zE),N2=S(Rr,yN,zE),M1=S(L,ym,zR),M2=S(Rr,ym,zR),S1=S(L,yS,zE),S2=S(Rr,yS,zE);
    face([N1,N2,M2,M1],rc[2],'rgba(0,0,0,.05)',wa(.25),{tex:o.roof==='slate'?slateTex:brickTex});face([M1,M2,S2,S1],rc[0],'rgba(0,0,0,.4)',wa(.1),{tex:o.roof==='slate'?slateTex:brickTex});
    ctx.strokeStyle=wa(.5);ctx.lineWidth=1.4;seg([M1[0]+2,M1[1]+1],[M2[0]-2,M2[1]+1]);ctx.stroke();
    // a hole in the roof on some houses, moss on the ridge
    if(o.hole){const c=S(x+w*.7,ym+d*.22,zE+rh*.45);ctx.fillStyle='#0c0a0e';ctx.beginPath();ctx.moveTo(c[0]-14,c[1]-4);ctx.lineTo(c[0]-2,c[1]-9);ctx.lineTo(c[0]+15,c[1]-3);ctx.lineTo(c[0]+6,c[1]+7);ctx.lineTo(c[0]-10,c[1]+5);ctx.closePath();ctx.fill();ink2(1.8);ctx.stroke();
      ctx.strokeStyle=PAL.wood[0];ctx.lineWidth=2.2;seg([c[0]-8,c[1]-6],[c[0]+4,c[1]+5]);ctx.stroke()}
    for(let i=0;i<6;i++){const q=S(L+(Rr-L)*rnd(),ym,zR);ctx.fillStyle='rgba(90,130,60,.6)';ctx.beginPath();ctx.ellipse(q[0],q[1]+1,4+rnd()*5,2,0,0,TAU);ctx.fill()}
    if(o.chim){box(x+w*.22,ym-12,zE+rh*.4,18,16,rh*.9,PAL.brick,{tex:brickTex})}},{house:h,part:'roof'});
  return h}
// furniture helpers (world coords)
const table=(x,y)=>{shadowRect(x,y,40,26,18);box(x,y,16,40,26,4,PAL.wood);for(const[a,b] of[[2,22],[34,22]])box(x+a,y+b,0,4,4,16,PAL.wood)};
const bed=(x,y)=>{box(x,y,0,34,56,12,PAL.wood);box(x+2,y+2,12,30,50,5,['#6e6a78','#4e4a58','#8a86a0']);box(x+4,y+4,17,26,12,4,['#c9c2b0','#9a9282','#e0dccc'])};
const crate=(x,y,s)=>{s=s||1;box(x,y,0,20*s,18*s,18*s,PAL.plank,{tex:plankTex});const a=S(x,y+18*s,0),b=S(x+20*s,y+18*s,18*s);ctx.strokeStyle=PAL.plank[1];ctx.lineWidth=2;seg([a[0]+2,a[1]-2],[b[0]-2,b[1]+2]);ctx.stroke()};
const barrel=(x,y)=>{cyl(x,y,0,10,20,['#5e4128',0,'#7a5634']);const a=S(x,y,6),b=S(x,y,14);for(const q of[a,b]){ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(q[0],q[1],10,10*K,0,0,Math.PI);ctx.stroke()}};
const pew=(x,y)=>{box(x,y,0,56,10,10,PAL.wood);box(x,y-4,10,56,4,12,PAL.wood)};
const hay=(x,y)=>{box(x,y,0,34,22,18,['#b8913a','#8a6a24','#d6b45a'],{tex:(x0,y0,x1,y1)=>{ctx.strokeStyle='rgba(90,60,20,.4)';ctx.lineWidth=1;for(let i=0;i<14;i++){const xx=x0+rnd()*(x1-x0),yy=y0+rnd()*(y1-y0);seg([xx,yy],[xx+3,yy-3]);ctx.stroke()}}})};

// ------------------------------------------------------------------ build the map
function build(){seed=7;if(SMALL)return buildSmall();
  // CIMITERO: the chapel, rows of graves, dead trees, open graves, the iron fence with the gate
  const ch=house({x:3*T,y:1*T,w:4.5*T,d:3*T,H:84,rh:58,wall:'stone',roof:'slate',door:2.25*T,hole:true,furn:(x,y)=>{for(let r=0;r<3;r++){pew(x+30,y+50+r*36);pew(x+4.5*T-86,y+50+r*36)}
    box(x+2.25*T-30,y+14,0,60,22,26,PAL.stone,{tex:stoneTex});for(const cx of[-20,0,20]){const q=S(x+2.25*T+cx,y+25,26);ctx.fillStyle='#e6dcc0';ctx.fillRect(q[0]-2,q[1]-10,4,10);ink2(1);ctx.strokeRect(q[0]-2,q[1]-10,4,10)}}});
  ch.lights=[[3*T+2.25*T,1*T+25,40,PAL.candle,52]];
  for(let r=0;r<4;r++)for(let c=0;c<9;c++){const x=.9*T+c*1.15*T+(r%2)*20+rr(-6,6),y=5.2*T+r*1.05*T+rr(-6,6);if(Math.abs(x-6*T)<70)continue;if(rnd()<.12)continue;grave(x,y,rnd()<.25?2:rnd()<.5?1:0)}
  tree(1*T,1.5*T,true,1.2);tree(10.5*T,2*T,true,1);tree(9.5*T,4.4*T,true,.9);tree(.6*T,9.2*T,true,.8);
  holes.push([2.4*T,4.4*T],[9.6*T,8.6*T],[4.6*T,7.6*T],[10.4*T,6.2*T]);
  fenceIron(0,5*T,10*T);fenceIron(7*T,12*T,10*T);
  wallStone(11.85*T,0,.3*T,10*T,40);
  // QUARTIERE: four houses, lampposts, bins, crates, picket fences, trees
  house({x:13*T,y:1*T,w:4*T,d:2.8*T,H:72,wall:'brick',roof:'slate',door:1.3*T,chim:true,furn:(x,y)=>{table(x+150,y+60);bed(x+30,y+40);barrel(x+220,y+60)}});
  house({x:20.4*T,y:.9*T,w:4.2*T,d:3*T,H:76,wall:'plank',roof:'tile',door:2.6*T,hole:true,furn:(x,y)=>{table(x+40,y+70);crate(x+200,y+40);crate(x+222,y+50,.8);bed(x+130,y+30)}});
  house({x:13.2*T,y:5.6*T,w:3.8*T,d:2.6*T,H:66,wall:'plank',roof:'slate',door:2.5*T,furn:(x,y)=>{table(x+40,y+50);barrel(x+190,y+45)}});
  house({x:20.6*T,y:5.8*T,w:3.8*T,d:2.6*T,H:68,wall:'brick',roof:'tile',door:1.2*T,chim:true,furn:(x,y)=>{bed(x+180,y+30);crate(x+40,y+40)}});
  for(const[x,y] of[[18*T,2.6*T],[18*T,7*T],[20.2*T,4.6*T],[3.5*T,12*T],[21.5*T,12*T],[12.5*T,15.4*T]])lamp(x,y);
  fenceWood(13*T,17*T,4.25*T);fenceWood(20.4*T,24.6*T,4.3*T);fenceWood(13.2*T,17*T,8.6*T);fenceWood(20.6*T,24.6*T,8.8*T);
  for(const[x,y] of[[17.4*T,9.1*T],[17.9*T,9.2*T],[12.8*T,4.6*T]])thing(y+8,[x-16,y*K-30,x+16,y*K+12],()=>{cyl(x,y,0,8,20,['#3e5a3a',0,'#56785a'])}),solid(x-8,y-6,16,12);
  tree(24.2*T,9.4*T,false,.9);tree(12.6*T,8.9*T,false,.8);
  holes.push([15*T,9.4*T],[22.5*T,4.8*T],[19*T,.6*T]);
  fenceWood(12.15*T,18*T,10*T);fenceWood(20*T,25*T,10*T);
  // PIAZZA: the Bara delle Sorprese, a wall with a weapon drawn on it, crates
  wallStone(6*T,13.1*T,2.6*T,.35*T,52);
  // the weapon on the wall: chalk outline, the gun inside, its price
  things.push({ky:13.1*T+.35*T+1,live:()=>{const a=S(6*T+.5*T,13.1*T+.35*T,12),b=S(6*T+2.1*T,13.1*T+.35*T,46);ctx.save();ctx.strokeStyle='rgba(235,235,225,.75)';ctx.lineWidth=1.6;ctx.setLineDash([5,3]);ctx.strokeRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);ctx.setLineDash([]);
    if(window.ARMI){ctx.globalAlpha=.9;ARMI.arma('mitraglietta',(a[0]+b[0])/2-12,(a[1]+b[1])/2-3,0,{sc:1.1})}ctx.globalAlpha=1;ctx.fillStyle='#ffd65a';ctx.font='800 10px "Baloo 2",system-ui';ctx.textAlign='center';ctx.fillText('● 1.200',(a[0]+b[0])/2,a[1]-3);ctx.restore()}});
  // FATTORIA: barn, field with pumpkins and wheat, haystacks, well, cart, the scarecrow in the field
  fenceWood(0,11.5*T,14.2*T);fenceWood(13.5*T,25*T,14.2*T);
  house({x:1.6*T,y:16*T,w:5.4*T,d:4*T,H:92,rh:66,wall:'plank',roof:'tile',door:2.7*T,hole:true,furn:(x,y)=>{hay(x+30,y+40);hay(x+70,y+44);hay(x+40,y+130);hay(x+260,y+50);crate(x+220,y+150);crate(x+240,y+160,.8)}});
  for(const[x,y] of[[9*T,17*T],[10.2*T,22.4*T],[8*T,24*T]]){solid(x,y,34,22);shadowRect(x,y,34,22,18);thing(y+22,[x-10,y*K-30,x+44,(y+22)*K+10],()=>hay(x,y))}
  {const x=11.2*T,y=20*T;solid(x-22,y-14,44,28);shadowOval(x+10,y+6,30);thing(y+14,[x-40,y*K-80,x+40,y*K+20],()=>{cyl(x,y,0,22,22,PAL.stone);const t=S(x,y,22);ctx.fillStyle='#08070a';ctx.beginPath();ctx.ellipse(t[0],t[1],16,16*K,0,0,TAU);ctx.fill();
    for(const sx of[-20,20])box(x+sx-2,y-2,22,4,4,34,PAL.wood);box(x-24,y-3,56,48,6,5,PAL.wood);box(x-14,y-8,58,28,16,14,PAL.tile,{tex:brickTex})})}
  {const x=7.5*T,y=22.4*T;solid(x-30,y-14,62,28);shadowRect(x-30,y-14,62,28,24);thing(y+16,[x-50,y*K-50,x+50,y*K+24],()=>{box(x-30,y-12,10,60,24,14,PAL.plank,{tex:plankTex});for(const s of[-1,1]){const q=S(x+s*0,y+(s>0?14:-12),12);ctx.save();ink2(2.4);ctx.fillStyle=PAL.wood[1];ctx.beginPath();ctx.ellipse(q[0]-14,q[1],11,11,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}})}
  tree(.8*T,23.4*T,true,1);tree(24*T,15.6*T,false,1.1);
  holes.push([16*T,18*T],[21*T,22.5*T],[5*T,22.8*T],[12*T,17*T]);
  for(let c=0;c<9;c++)for(let r=0;r<6;r++){const x=14.6*T+c*1.05*T,y=16.4*T+r*1.15*T;if(Math.abs(x-18.6*T)<40&&Math.abs(y-19.6*T)<60)continue;
    if((c+r)%3===0){thing(y+6,[x-16,y*K-20,x+16,y*K+10],()=>{bal(S(x,y,8),9,['#e07a1c','#a84f10','#ffa040'],.8);ctx.strokeStyle='#3a5a24';ctx.lineWidth=2.4;const t=S(x,y,15);seg(t,[t[0]+2,t[1]-5]);ctx.stroke()})}
    else thing(y+4,[x-12,y*K-30,x+12,y*K+8],()=>{for(let i=-2;i<=2;i++){const b=S(x+i*3,y,0),t=S(x+i*4.5,y,22+(i%2)*4);ctx.strokeStyle=INK;ctx.lineWidth=3;seg(b,t);ctx.stroke();ctx.strokeStyle='#a8913a';ctx.lineWidth=1.4;seg(b,t);ctx.stroke();ctx.fillStyle='#c9a84a';ctx.beginPath();ctx.ellipse(t[0],t[1]-2,1.6,4,0,0,TAU);ctx.fill()}})}
  // the barricades at the three gates: planks with a price sign
  bar('cim',5*T,10*T,2*T);bar('qua',18*T,10*T,2*T);bar('fat',11.5*T,14.2*T,2*T);
  // the outer border
  solid(-200,-200,WW+400,200);solid(-200,WW,WW+400,200);solid(-200,0,200,WW);solid(WW,0,200,WW);
  things.sort((a,b)=>a.ky-b.ky)}
// the small corner: a piece of graveyard with its fence, a cobbled path, a house you can walk into, a lamp, trees, two open graves
function buildSmall(){
  for(let r=0;r<2;r++)for(let c=0;c<3;c++)grave(.7*T+c*1.05*T+(r%2)*18,1.6*T+r*1.4*T+rr(-5,5),c===1&&r===1?2:rnd()<.5?1:0);
  grave(1.2*T,5.6*T,0);grave(2.6*T,6.1*T,2);
  tree(.6*T,.6*T,true,1.1);fenceIron(0,3.7*T,7.4*T);
  holes.push([2.1*T,4.6*T],[8.4*T,6.6*T]);
  house({x:6*T,y:1*T,w:3.4*T,d:2.6*T,H:70,wall:'plank',roof:'tile',door:1.7*T,hole:true,chim:true,furn:(x,y)=>{table(x+40,y+50);bed(x+150,y+24);barrel(x+190,y+120)}});
  fenceWood(5.6*T,7.25*T,4.2*T);fenceWood(8.15*T,9.8*T,4.2*T);
  lamp(3.9*T,4.2*T);lamp(6.1*T,8.6*T);
  for(const[x,y] of[[9*T,5*T]])thing(y+18,[x-30,y*K-30,x+40,(y+18)*K+12],()=>{crate(x,y);crate(x+22,y+4,.8);barrel(x-12,y+14)}),solid(x-20,y-4,60,26);
  tree(8.8*T,7.2*T,false,.9);tree(.5*T,9.3*T,false,.8);
  solid(-200,-200,WW+400,200);solid(-200,WW,WW+400,200);solid(-200,0,200,WW);solid(WW,0,200,WW);
  things.sort((a,b)=>a.ky-b.ky)}
function lamp(x,y){solid(x-5,y-4,10,8);shadowOval(x+14,y+6,12);lights.push([x,y,60,PAL.lamp,150]);
  thing(y+4,[x-30,y*K-110,x+30,y*K+12],()=>{cyl(x,y,0,7,10,PAL.stone);cyl(x,y,10,3,70,[PAL.iron,0,PAL.ironL]);box(x-1.5,y-1,78,18,3,3,[PAL.iron,PAL.iron,PAL.ironL],{lw:2});
    const c=S(x+16,y,62);ctx.fillStyle='#ffe2a0';ink2(2);ctx.beginPath();ctx.moveTo(c[0]-6,c[1]-2);ctx.lineTo(c[0]+6,c[1]-2);ctx.lineTo(c[0]+4,c[1]+10);ctx.lineTo(c[0]-4,c[1]+10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=PAL.iron;ctx.beginPath();ctx.moveTo(c[0]-8,c[1]-2);ctx.lineTo(c[0],c[1]-9);ctx.lineTo(c[0]+8,c[1]-2);ctx.closePath();ctx.fill();ctx.stroke()})}
function bar(z,x,y,w){const s=solid(x,y-8,w,16,'bar'),b={z,x,y,w,s,k:0,open:false};bars.push(b);
  b.t=thing(y+6,[x-20,y*K-70,x+w+20,y*K+16],()=>{for(const sx of[4,w-12])box(x+sx,y-3,0,8,6,40,PAL.wood);for(let i=0;i<4;i++){const a=S(x-4,y+3,8+i*9),c=S(x+w+4,y+3,8+i*9+(i%2?6:-6));ctx.save();ctx.lineCap='butt';ctx.strokeStyle=INK;ctx.lineWidth=9;seg(a,c);ctx.stroke();ctx.strokeStyle=PAL.plank[i%2?0:2];ctx.lineWidth=6;seg(a,c);ctx.stroke();ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;seg([a[0],a[1]+1.5],[c[0],c[1]+1.5]);ctx.stroke();ctx.restore()}
    // the price on a little board nailed in the middle
    const q=S(x+w/2,y+4,30);ctx.fillStyle=PAL.plank[2];ctx.fillRect(q[0]-24,q[1]-10,48,18);ink2(2);ctx.strokeRect(q[0]-24,q[1]-10,48,18);ctx.fillStyle='#ffd65a';ball([q[0]-14,q[1]-1],4.5);ctx.fill();ink2(1.2);ctx.stroke();
    ctx.fillStyle='#1b1612';ctx.font='700 11px "Baloo 2",system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(ZN[z].price.toLocaleString('it-IT'),q[0]-8,q[1])},{bar:b})}

// ------------------------------------------------------------------ the ground: tiles, paths, plaza, field, outside; shadows baked in
let ground=null;
function bakeGround(){const W=WW+MARG*2,H=WW*K+MARG*2,c=document.createElement('canvas');c.width=Math.ceil(W*GS);c.height=Math.ceil(H*GS);const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(GS,GS);ctx.translate(MARG,MARG);seed=3;
  try{// outside: dark fields, dead trees and fog toward the edges
    ctx.fillStyle='#14161a';ctx.fillRect(-MARG,-MARG,W,H);for(let i=0;i<260;i++){const x=rr(-MARG,WW+MARG),y=rr(-MARG,WW*K+MARG);if(x>-20&&x<WW+20&&y>-20&&y<WW*K+20)continue;ctx.fillStyle=rnd()<.5?'#1c2018':'#191b1f';ctx.beginPath();ctx.ellipse(x,y,rr(20,60),rr(8,20),0,0,TAU);ctx.fill()}
    for(let i=0;i<70;i++){const x=rr(-MARG+20,WW+MARG-20),y=rr(-MARG+40,WW*K+MARG-10);if(x>-40&&x<WW+40&&y>-60&&y<WW*K+30)continue;const s=rr(.6,1.3);ctx.strokeStyle='#0b0c0e';ctx.lineCap='round';ctx.lineWidth=5*s;seg([x,y],[x,y-50*s]);ctx.stroke();
      for(const[dx,dy] of[[-20,-40],[18,-46],[-10,-58],[14,-30]]){ctx.lineWidth=2.5*s;seg([x,y-(30+rnd()*14)*s],[x+dx*s,y+dy*s-10*s]);ctx.stroke()}}
    // tiles
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=i*T,y=j*T,z=zoneAt(x+T/2,y+T/2);let p=z==='cim'?PAL.soil:z==='pia'?PAL.cobble:PAL.grass;
      if(SMALL){p=(i<4&&j<8)?PAL.soil:(i===4||i===5||j===8)?PAL.cobble:PAL.grass;if(i>=6&&i<10&&j===4)p=PAL.grass;if(i===7&&j>=4&&j<8)p=PAL.dirt}
      else if(z==='qua'&&i>=18&&i<20)p=PAL.cobble;if(z==='cim'&&i>=5&&i<7)p=PAL.dirt;if(z==='fat'&&i>=14&&i<24&&j>=16&&j<23)p=PAL.field;if(z==='fat'&&((i>=11&&i<14&&j<17)||(j>=17&&j<19&&i<14)))p=PAL.dirt;
      const sy=y*K,th=T*K;ctx.fillStyle=p[0];ctx.fillRect(x,sy,T+.5,th+.5);
      if(p===PAL.cobble){for(let r=0;r<4;r++)for(let q=0;q<4;q++){const cx=x+q*16+(r%2)*8+rr(-2,2),cy=sy+r*th/4+th/8;ctx.fillStyle=mix(p[0],p[2],rnd()*.6);ctx.beginPath();ctx.ellipse(cx,cy,7,th/9,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle=wa(.1);ctx.beginPath();ctx.ellipse(cx-2,cy-1.5,3.5,1.5,0,0,TAU);ctx.fill()}}
      else if(p===PAL.field){for(let r=0;r<5;r++){ctx.fillStyle=p[1];ctx.fillRect(x,sy+r*th/5+th/10,T+.5,2.5);ctx.fillStyle=p[2];ctx.fillRect(x,sy+r*th/5+th/10-2,T+.5,1.2)}}
      else{for(let k=0;k<5;k++){ctx.fillStyle=rnd()<.5?p[1]:p[2];ctx.globalAlpha=.5;ctx.beginPath();ctx.ellipse(x+rnd()*T,sy+rnd()*th,rr(6,16),rr(3,7),0,0,TAU);ctx.fill()}ctx.globalAlpha=1;
        if(p!==PAL.dirt)for(let k=0;k<5;k++){const tx=x+rnd()*T,ty=sy+rnd()*th;ctx.strokeStyle=rnd()<.5?'#55663a':'#26301c';ctx.lineWidth=1.3;for(let b=-1;b<=1;b++){seg([tx,ty],[tx+b*2.5,ty-4-rnd()*3]);ctx.stroke()}}
        else for(let k=0;k<4;k++){ctx.fillStyle='#5f5446';ctx.beginPath();ctx.ellipse(x+rnd()*T,sy+rnd()*th,2,1.3,0,0,TAU);ctx.fill()}}}
    // floors inside the houses (hidden by the roof until you walk in)
    for(const h of houses){const{x,y,w,d}=h.o,fl=h.o.wall==='stone'?PAL.stone:PAL.wood;ctx.fillStyle=fl[0];ctx.fillRect(x,y*K,w,d*K);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;
      if(fl===PAL.wood)for(let yy=y*K+5;yy<(y+d)*K;yy+=7){seg([x,yy],[x+w,yy]);ctx.stroke()}else for(let yy=y*K;yy<(y+d)*K;yy+=16)for(let xx=x;xx<x+w;xx+=28){ctx.strokeRect(xx+(yy/16%2)*14,yy,28,16)}
      ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x,y*K,w,12)}
    // the open graves where the dead come out: dark holes with the soil thrown around
    for(const[x,y] of holes){const q=S(x,y,0);ctx.fillStyle='#3e3326';ctx.beginPath();ctx.ellipse(q[0],q[1],26,12,0,0,TAU);ctx.fill();ctx.fillStyle='#0b0908';ctx.beginPath();ctx.ellipse(q[0],q[1],16,7,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.5;ctx.stroke();
      for(let i=0;i<7;i++){ctx.fillStyle='#51432f';ctx.beginPath();ctx.ellipse(q[0]+rr(-26,26),q[1]+rr(-11,11),rr(2,4),rr(1.5,2.5),0,0,TAU);ctx.fill()}}
    // soft shadows, light from the top left
    ctx.fillStyle='rgba(0,0,0,.3)';for(const s of shadows){if(s.r){const q=S(s.x,s.y,0);ctx.beginPath();ctx.ellipse(q[0],q[1],s.r,s.r*.45,0,0,TAU);ctx.fill();continue}
      const o=s.h*.45;polyP([S(s.x,s.y+s.d,0),S(s.x+s.w,s.y+s.d,0),S(s.x+s.w+o,s.y+s.d+o*.5,0),S(s.x+o*.7,s.y+s.d+o*.5,0)]);ctx.fill();polyP([S(s.x+s.w,s.y,0),S(s.x+s.w+o,s.y+o*.3,0),S(s.x+s.w+o,s.y+s.d+o*.5,0),S(s.x+s.w,s.y+s.d,0)]);ctx.fill()}
    // the edge of the map: a dark lip
    const g2=ctx.createLinearGradient(0,-30,0,0);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=g2;ctx.fillRect(0,-30,WW,30);ctx.strokeStyle='#0a0a0c';ctx.lineWidth=4;ctx.strokeRect(0,0,WW,WW*K)
  }finally{ctx=sv}ground=c}

// ------------------------------------------------------------------ the living things: hero, zombies, bullets, the coffin
const hero={x:SMALL?4.5*T:10*T,y:SMALL?8.5*T:12*T,face:0,walk:0,moving:false,aim:0,fireCd:0,gun:'pistola'},cam={x:0,y:0,z:1},Z=[],FX=[];let coins=5000,bara=null,zonePrev='pia',banner=null;
const KINDS=[['zombie',1.1,32,4],['strisciante',1.1,26,3],['minatore',1.1,30,5],['lanterna',1.55,24,7],['hound',1.05,70,3]];
function spawn(){const hz=zoneAt(hero.x,hero.y);let best=null;
  // a hole in an open zone at a good distance, otherwise a random spot near the hero
  const cand=holes.filter(([x,y])=>open[zoneAt(x,y)]&&Math.hypot(x-hero.x,y-hero.y)>(SMALL?110:160)&&Math.hypot(x-hero.x,y-hero.y)<520);
  if(cand.length&&rnd()<.6)best=cand[Math.floor(rnd()*cand.length)];
  for(let i=0;i<20&&!best;i++){const a=rnd()*TAU,d=SMALL?rr(120,230):rr(170,300),x=hero.x+Math.cos(a)*d,y=hero.y+Math.sin(a)*d;if(x<30||y<30||x>WW-30||y>WW-30)continue;if(!open[zoneAt(x,y)])continue;if(hit(x,y,14))continue;best=[x,y]}
  if(!best)return;const k=KINDS[Math.floor(rnd()*KINDS.length)];Z.push({kind:k[0],sc:k[1],spd:k[2],hp:k[3],x:best[0],y:best[1],face:Math.atan2(hero.y-best[1],hero.x-best[0]),p:rnd(),anim:'walk',rise:0,die:0,flash:0})}
function hit(x,y,r){for(const s of solids){if(s.off)continue;const cx=cl(x,s.x,s.x+s.w),cy=cl(y,s.y,s.y+s.d);if((x-cx)**2+(y-cy)**2<r*r)return s}return null}
function move(o,dx,dy,r){o.x+=dx;let s=hit(o.x,o.y,r);if(s)o.x-=dx;o.y+=dy;s=hit(o.x,o.y,r);if(s)o.y-=dy}
// the hero carries a gun in the zombie mode: the game's held() draws the gun from sprite/armi when the style has one
{const _h=held;held=function(St,o,B){if(St.gun&&window.ARMI)return ARMI.inMano(St.gun,B,o.gp||{},o.aim);return _h(St,o,B)}}
const HSTYLE=Object.assign({},HERO,{held:null,quiver:false,gun:'pistola'});
let gunState=null;
// ------------------------------------------------------------------ update
let spawnT=1,zOn=true;
function update(dt,inp){G.t+=dt;
  // hero walks with the stick (world y squashed on the screen, so the stick's y is stretched back)
  const m=Math.hypot(inp.x,inp.y);hero.moving=m>.15;if(hero.moving){const sp=150*Math.min(1,m);move(hero,inp.x/m*sp*dt,inp.y/m*sp*dt/K,11);hero.face=Math.atan2(inp.y,inp.x);hero.walk+=dt*12}
  // shoots the nearest zombie in sight when standing still
  hero.fireCd-=dt;let tgt=null,bd=260;for(const z of Z){if(z.rise<1||z.die)continue;const d=Math.hypot(z.x-hero.x,(z.y-hero.y)*K);if(d<bd){bd=d;tgt=z}}
  if(gunState)gunState.update(dt,!hero.moving&&!!tgt);
  if(tgt){hero.aim=Math.atan2((tgt.y-hero.y)*K,tgt.x-hero.x);if(!hero.moving)hero.face=hero.aim}
  if(!hero.moving&&tgt&&hero.fireCd<=0){hero.fireCd=.36;tgt.hp--;tgt.flash=.12;const hs=S(hero.x,hero.y,0),ts=S(tgt.x,tgt.y,22);FX.push({k:'shot',a:[hs[0]+Math.cos(hero.aim)*16,hs[1]-14+Math.sin(hero.aim)*16],b:ts,t:.08});
    for(let i=0;i<4;i++)FX.push({k:'drop',x:ts[0],y:ts[1],vx:rr(-40,40),vy:rr(-60,-10),t:.5,c:'#3a5a1e'});if(tgt.hp<=0){tgt.die=.001;coins+=60}}
  // zombies: rise from the ground, walk to the hero, attack when close, sink back when killed
  spawnT-=dt;if(zOn&&spawnT<=0&&Z.length<6){spawn();spawnT=rr(1.6,3.2)}
  for(const z of Z){if(z.flash>0)z.flash-=dt;if(z.die){z.die+=dt;continue}if(z.rise<1){z.rise=Math.min(1,z.rise+dt/1.3);continue}
    const dx=hero.x-z.x,dy=hero.y-z.y,d=Math.hypot(dx,dy);z.face=Math.atan2(dy,dx);
    if(d<34){if(z.anim!=='attack'){z.anim='attack';z.p=0}z.p+=dt/1.4}else{if(z.anim!=='walk'){z.anim='walk';z.p=0}z.p+=dt/(z.kind==='hound'?.6:1.1);move(z,dx/d*z.spd*dt,dy/d*z.spd*dt,12)}
    for(const o of Z)if(o!==z&&!o.die){const ex=z.x-o.x,ey=z.y-o.y,e=Math.hypot(ex,ey);if(e>0&&e<26){move(z,ex/e*(26-e)*.5,ey/e*(26-e)*.5,12)}}z.p%=1}
  for(let i=Z.length-1;i>=0;i--)if(Z[i].die>1.1||(!zOn&&Z[i].rise<1))Z.splice(i,1);
  for(const f of FX){f.t-=dt;if(f.k==='drop'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt}}for(let i=FX.length-1;i>=0;i--)if(FX[i].t<=0)FX.splice(i,1);
  // houses: the roof fades while the hero is inside
  for(const h of houses){const{x,y,w,d}=h.o;h.inside=hero.x>x&&hero.x<x+w&&hero.y>y&&hero.y<y+d+6;h.a+=((h.inside?0:1)-h.a)*Math.min(1,dt*7)}
  for(const b of bars)if(b.open)b.k=Math.min(1,b.k+dt*2);
  const zn=zoneAt(hero.x,hero.y);if(zn!==zonePrev){zonePrev=zn;banner={t:2.2,n:ZN[zn].n}}if(banner)banner.t-=dt;
  if(bara)bara.update(dt)}
// ------------------------------------------------------------------ draw
function drawWorld(W,H){const vw=360/cam.z;
  ctx.drawImage(ground,0,0,ground.width,ground.height,-MARG,-MARG,ground.width/GS,ground.height/GS);
  // pools of lamp light on the ground
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';for(const[x,y,z,rgb,r] of lights){const f=.85+.15*Math.sin(G.t*7+x)*Math.sin(G.t*3.3+y);const q=S(x,y,0);glow(rgb,q[0],q[1],r*f,.32,r*f*K*1.1)}
    for(const h of houses)if(h.a<.6)for(const[x,y,z,rgb,r] of h.lights){const q=S(x,y,0);glow(rgb,q[0],q[1],r,.4*(1-h.a),r*K)}ctx.restore()}
  // everything that stands, sorted by its front edge; the living ones mixed in
  const list=[];for(const t of things)list.push({ky:t.ky,t});
  for(const z of Z)list.push({ky:z.y,z});list.push({ky:hero.y,hero:1});if(bara)list.push({ky:bara.wy,bara:1});
  list.sort((a,b)=>a.ky-b.ky);
  for(const e of list){if(e.t){const t=e.t;if(t.live){t.live();continue}if(t.bar){const b=t.bar;if(b.k>=1)continue;if(b.k>0){ctx.save();ctx.globalAlpha=1-b.k;ctx.translate(0,b.k*14);blit(t.sp);ctx.restore();continue}}
      if(t.house){const h=t.house;if(t.part==='roof'){if(h.a>.02)blit(t.sp,h.a);continue}if(t.part==='front'){blit(t.sp,.28+.72*h.a);continue}}blit(t.sp);continue}
    if(e.hero){const q=S(hero.x,hero.y,0);drawRig(q[0],q[1]-8,hero.face,hero.walk,hero.moving,HSTYLE,{gp:gunState?gunState.pose():{},aim:hero.aim});continue}
    if(e.bara){bara.draw();continue}
    const z=e.z,q=S(z.x,z.y,0);
    if(z.rise<1){// coming out of the ground: a mound of soil that breaks, then the body pushed up, cut at the ground line
      const k=z.rise;ctx.fillStyle='#3e3326';ctx.beginPath();ctx.ellipse(q[0],q[1],18+k*8,7+k*3,0,0,TAU);ctx.fill();ctx.fillStyle='#0b0908';ctx.beginPath();ctx.ellipse(q[0],q[1],10*k+2,4*k+1,0,0,TAU);ctx.fill();
      for(let i=0;i<6;i++){const a=i*1.05+z.x,r=10+k*16;ctx.fillStyle='#51432f';ball([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.45-Math.sin(k*Math.PI)*6],2.4);ctx.fill()}
      if(k>.25){const u=ez((k-.25)/.75);ctx.save();ctx.beginPath();ctx.rect(q[0]-60,q[1]-140,120,140);ctx.clip();ctx.translate(0,(1-u)*60*z.sc);CR[z.kind](q[0],q[1],z.face,'idle',(G.t*.6)%1,z.sc);ctx.restore()}continue}
    if(z.die){const k=Math.min(1,z.die/1.1);ctx.save();ctx.globalAlpha=1-k*k;ctx.beginPath();ctx.rect(q[0]-60,q[1]-140,120,140);ctx.clip();ctx.translate(0,ez(k)*50*z.sc);CR[z.kind](q[0],q[1],z.face,'idle',0,z.sc);ctx.restore();
      if(!LOWFX)shine(PAL.sick,q[0],q[1],24*(1-k),.4*(1-k));continue}
    CR[z.kind](q[0],q[1],z.face,z.anim,z.p,z.sc);if(z.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,255,255',q[0],q[1]-24*z.sc,22*z.sc,.5);ctx.restore()}}
  // shots and drops
  for(const f of FX){if(f.k==='shot'){ctx.strokeStyle='rgba(255,230,160,.9)';ctx.lineWidth=2;seg(f.a,f.b);ctx.stroke();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,210,120',f.a[0],f.a[1],14,.8);ctx.restore()}}
    else{ctx.fillStyle=f.c;ball([f.x,f.y],1.8);ctx.fill()}}}
// darkness with holes of light (lamps, candles in houses with the roof off, a soft light round the hero)
let dark=null;
function drawDark(W,H,toScr){if(LOWFX)return;if(!dark)dark=document.createElement('canvas');if(dark.width!==W||dark.height!==H){dark.width=W;dark.height=H}const g=dark.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.fillStyle='rgba(8,8,22,.38)';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='destination-out';const hole=(x,y,r,a)=>{const[sx,sy,sr]=toScr(x,y,r);const gr=g.createRadialGradient(sx,sy,0,sx,sy,sr);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill()};
  for(const[x,y,z,rgb,r] of lights)hole(x,y*K,r*1.25,.9);hole(hero.x,hero.y*K-10,150,.75);for(const h of houses)if(h.a<.6)for(const[x,y,z,rgb,r] of h.lights)hole(x,y*K,r*2.2,.8*(1-h.a));
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(dark,0,0);ctx.restore()}

// ------------------------------------------------------------------ the page
function boot(){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}
  build();bakeGround();if(window.ARMI){try{gunState=ARMI.nuova('pistola')}catch(e){gunState=null}try{if(SMALL)throw 0;const q=S(12.6*T,12*T,0);bara=ARMI.nuovaBara(q[0],q[1]);bara.wy=12*T;solid(12.6*T-30,12*T-14,60,28)}catch(e){bara=null}}
  const ov=document.createElement('div');ov.id='mz';ov.innerHTML=`<style>
  #mz{position:fixed;inset:0;z-index:99999;background:#0c0c10;font-family:"Baloo 2",system-ui,sans-serif;color:#efe6d0;touch-action:none;user-select:none;-webkit-user-select:none}
  #mz canvas{position:absolute;inset:0;width:100%;height:100%}
  #mz .top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(rgba(8,8,12,.92),rgba(8,8,12,0));pointer-events:none}
  #mz h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:19px;letter-spacing:.02em;text-shadow:0 2px 0 #000}
  #mz .cash{font:800 16px "Baloo 2",system-ui;color:#ffd65a;text-shadow:0 2px 0 #000;white-space:nowrap}
  #mz .zone{position:absolute;left:0;right:0;top:calc(64px + env(safe-area-inset-top,0px));text-align:center;font-family:"Lilita One",system-ui;font-size:30px;color:#c8f0a0;text-shadow:0 3px 0 #000,0 0 18px rgba(120,255,90,.45);opacity:0;transition:opacity .4s;pointer-events:none}
  #mz .bar{position:absolute;left:0;right:0;bottom:0;padding:10px 10px calc(20px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:linear-gradient(rgba(8,8,12,0),rgba(8,8,12,.92))}
  #mz button{font:700 14px "Baloo 2",system-ui;color:#efe6d0;background:#33302e;border:2px solid #000;border-radius:12px;padding:8px 12px;box-shadow:0 3px 0 #000}
  #mz button.on{background:#4a6a2a;color:#eaffd0}#mz button.buy{background:#8a6a1e;color:#fff3c0}#mz button:active{transform:translateY(2px);box-shadow:0 1px 0 #000}
  #mz .hint{position:absolute;left:0;right:0;bottom:96px;text-align:center;font-size:13px;opacity:.7;pointer-events:none}
  </style><canvas></canvas><div class="top"><h1>Angolo zombie · prova</h1><span class="cash" id="mzCash"></span></div><div class="zone" id="mzZone"></div>
  <div class="hint" id="mzHint">Trascina per camminare · fermo spara</div><div class="bar" id="mzBar"></div>`;document.body.appendChild(ov);
  const cv=ov.querySelector('canvas'),barEl=ov.querySelector('#mzBar');let low=false,whole=false,buyB=null;
  const ui=()=>{barEl.innerHTML='';const mk=(t,on,f,cls)=>{const b=document.createElement('button');b.textContent=t;b.className=cls||(on?'on':'');b.onclick=()=>{f();ui()};barEl.appendChild(b);return b};
    mk('Zombie',zOn,()=>{zOn=!zOn});mk('Effetti bassi',low,()=>{low=!low});mk('Vista intera',whole,()=>{whole=!whole});
    const nb=bars.find(b=>!b.open&&Math.hypot(hero.x-(b.x+b.w/2),hero.y-b.y)<120);buyB=nb;if(nb)mk('Apri '+ZN[nb.z].n+' · '+ZN[nb.z].price.toLocaleString('it-IT'),false,()=>{if(coins>=ZN[nb.z].price){coins-=ZN[nb.z].price;nb.open=true;nb.s.off=true;open[nb.z]=true}},'buy')};ui();
  // stick: drag anywhere on the map
  const stick={on:false,x0:0,y0:0,x:0,y:0};
  ov.addEventListener('pointerdown',e=>{if(e.target.closest('.bar'))return;stick.on=true;stick.x0=stick.x=e.clientX;stick.y0=stick.y=e.clientY});
  ov.addEventListener('pointermove',e=>{if(stick.on){stick.x=e.clientX;stick.y=e.clientY}});const up=()=>{stick.on=false};ov.addEventListener('pointerup',up);ov.addEventListener('pointercancel',up);
  const keys={};addEventListener('keydown',e=>keys[e.key]=1);addEventListener('keyup',e=>keys[e.key]=0);
  const dpr=Math.min(2,window.devicePixelRatio||1);let last=performance.now(),ms=0,uiT=0;
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const W=ov.clientWidth,H=ov.clientHeight;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
    let ix=0,iy=0;if(stick.on){const dx=stick.x-stick.x0,dy=stick.y-stick.y0,l=Math.hypot(dx,dy);if(l>6){ix=dx/Math.max(l,50);iy=dy/Math.max(l,50)}}
    if(keys.ArrowLeft||keys.a)ix=-1;if(keys.ArrowRight||keys.d)ix=1;if(keys.ArrowUp||keys.w)iy=-1;if(keys.ArrowDown||keys.s)iy=1;
    const saved=ctx,lf=LOWFX;ctx=cv.getContext('2d');LOWFX=low;const t0=performance.now();
    try{update(dt,{x:ix,y:iy});
      // camera: follows the hero (or shows the whole map)
      const z=whole?Math.min(W/(WW+120),H/(WW*K+200)):W/360,tx=whole?WW/2:hero.x,ty=whole?WW*K/2:hero.y*K-20;cam.z=z;cam.x+=(tx-cam.x)*Math.min(1,dt*(whole?20:6));cam.y+=(ty-cam.y)*Math.min(1,dt*(whole?20:6));
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0c0c10';ctx.fillRect(0,0,W,H);ctx.setTransform(dpr*z,0,0,dpr*z,dpr*(W/2-cam.x*z),dpr*(H/2-cam.y*z));
      drawWorld(W,H);
      drawDark(cv.width,cv.height,(x,y,r)=>[dpr*(W/2+(x-cam.x)*z),dpr*(H/2+(y-cam.y)*z),r*z*dpr]);
      // the stick, the vignette
      ctx.setTransform(dpr,0,0,dpr,0,0);if(stick.on){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(stick.x0,stick.y0,42,0,TAU);ctx.stroke();const dx=stick.x-stick.x0,dy=stick.y-stick.y0,l=Math.min(42,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);ctx.fillStyle='rgba(255,255,255,.4)';ball([stick.x0+Math.cos(a)*l,stick.y0+Math.sin(a)*l],18);ctx.fill()}
      const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)
    }catch(e){console.error(e)}finally{ms=ms*.93+(performance.now()-t0)*.07;ctx=saved;LOWFX=lf}
    ov.querySelector('#mzCash').textContent='● '+coins.toLocaleString('it-IT')+'  ·  '+ms.toFixed(1)+' ms';
    const zEl=ov.querySelector('#mzZone');if(banner&&banner.t>0){zEl.textContent=banner.n;zEl.style.opacity=Math.min(1,banner.t*2)}else zEl.style.opacity=0;
    uiT-=dt;if(uiT<=0){uiT=.25;const nb=bars.find(b=>!b.open&&Math.hypot(hero.x-(b.x+b.w/2),hero.y-b.y)<120);if(nb!==buyB)ui()}
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame);window.__MZ={hero,Z,bars,open,houses,cam,setWhole:v=>{whole=v;ui()},tp:(x,y)=>{hero.x=x;hero.y=y}}}
if(document.readyState==='complete')setTimeout(boot,300);else window.addEventListener('load',()=>setTimeout(boot,300))})();
