// =====================================================================
// IL FILMATO B: l'allenamento all'alba (Denis, 14 ottobre). L'Arciere e la Cacciatrice si allenano insieme nel bosco: la corsa,
// il tiro ai bersagli, la gara a chi colpisce prima, gli scatti e le schivate, poi seduti su un tronco con la cripta lontana.
// Il protagonista è l'eroe che hai scelto (pensa, in corsivo in basso); l'altro è il compagno e parla (in alto, col suo nome).
// Usa il motore del filmato A (anteprime/filmato/01, 02, 06): qui la luce dell'alba, il campo di allenamento e i suoi oggetti.
// =====================================================================

// ------------------------------------------------------------------ 10 · the dawn and the training ground
// the forest of the first film, in the warm light of the morning: the same trees and moss, the sun low on the right, a golden haze
Object.assign(NT,{sky0:'#4d6fb3',sky1:'#f0a07c',sky2:'#ffd49a',fog:'#efc6a0',
  trunk:'#6e4c34',trunkL:'#ffc07c',trunkD:'#33231a',bark:'#4c3424',leaf:'#3c7634',leafL:'#89c853',leafH:'#e6f78e',
  moss:'#66a63b',mossL:'#c8ee78',mossD:'#3b6b2a',ground:'#587434',path:'#a27c52',pathL:'#e6b47c',grass:'#4f8e34',grassL:'#c0ec70',
  stone:'#8f9298',stoneL:'#f0e6d4',stoneD:'#44474d',ink:'#1b1612'});
const DAWN={fog:'#efc6a0',haze:'255,226,190',sun:'255,214,150',mote:'255,236,170'};
const LIT_DAWN=[[NT.mossD,NT.moss],['#7a5a3a','#b38a5c'],['#c98a3e','#f4c06a'],['#5f7a34',null],['#8a4a3a','#c87050']];

// ---------- the sky at dawn: blue on top, peach and gold down to the haze, the sun just over the trees, long lit clouds, birds
function dawnSky(t,sh,o){o=o||{};const c=X,W=FM.W,H=FM.H,yh=H*C.hy,g=c.createLinearGradient(0,Math.min(yh-H*.95,-H*.1),0,yh+2);
  g.addColorStop(0,'#3d61ab');g.addColorStop(.36,'#8d8cc6');g.addColorStop(.62,'#f2a487');g.addColorStop(.86,'#ffd39c');g.addColorStop(1,FOGC);c.fillStyle=g;c.fillRect(-200,-400,W+400,H+800);
  const px=(C.hx-.5)*W,py=(C.hy-.5)*H*.35;
  // clouds: long streaks, lavender on top and lit pink-gold underneath, drifting
  const r=frng(17);for(let i=0;i<6;i++){const cy=H*(.08+r()*.3)+py,cw=W*(.35+r()*.5),ch=6+r()*9,cx=((r()*W*1.6+t*(3+i*1.2))%(W*1.9))-W*.45+px;
    const cg=c.createLinearGradient(0,cy-ch,0,cy+ch);cg.addColorStop(0,'rgba(150,140,200,.55)');cg.addColorStop(.6,'rgba(255,170,150,.6)');cg.addColorStop(1,'rgba(255,224,170,.75)');
    c.fillStyle=cg;c.beginPath();c.ellipse(cx,cy,cw/2,ch,0,0,FTAU);c.ellipse(cx-cw*.22,cy-ch*.5,cw*.24,ch*.9,0,0,FTAU);c.ellipse(cx+cw*.18,cy-ch*.35,cw*.2,ch*.8,0,0,FTAU);c.fill()}
  // the sun with its halo, then a soft bloom over the horizon
  if(o.sun){const[sx,sy,sr]=o.sun,x=W*sx+px,y=H*sy+py;glo(c,DAWN.sun,x,y,sr*16,.5);glo(c,'255,240,200',x,y,sr*5.5,.75);
    c.fillStyle='#fff7df';c.beginPath();c.arc(x,y,sr,0,FTAU);c.fill();glo(c,'255,250,235',x,y,sr*1.8,.6)}
  glo(c,DAWN.haze,W*.5+px,yh,W*.9,.35,H*.14);
  // a few birds far away, flapping
  if(o.birds!==false)for(let i=0;i<5;i++){const u=((t*.035+i*.21)%1),bx=W*(-.1+u*1.2)+px,by=H*(.12+.06*Math.sin(i*2.3))+py+Math.sin(t*1.3+i)*4,fl=Math.sin(t*9+i*1.7);
    c.strokeStyle='rgba(60,50,70,.6)';c.lineWidth=1.1;c.lineCap='round';c.beginPath();c.moveTo(bx-4,by-2*fl);c.quadraticCurveTo(bx-2,by-1.5,bx,by);c.quadraticCurveTo(bx+2,by-1.5,bx+4,by-2*fl);c.stroke()}}

// ---------- the training things (cards, world units; ground at y=0). F = the colour seen through the haze at that depth
const TGT={straw:'#e6bb5c',strawL:'#fde49c',strawD:'#a9792f',white:'#f7eedb',red:'#e5484d',redD:'#a92e36',gold:'#ffd84a',goldD:'#d99a1c',
  wood:'#8a5a34',woodL:'#c88c54',woodD:'#4b2e1c',rope:'#d8c79a',fl:'#e5484d',flW:'#f6ead2',shaft:'#d9b27a',tip:'#c9cfd6'};
const INKB='#1b1612';
// a straw target on its easel: a thick round bale with painted rings; hits: arrows stuck in it [x, y (−1..1 of r), angle, length, colour]
function drawTarget(c,x,y,r,o){o=o||{};const F=o.F||(v=>v),yaw=o.yaw||0,sq=Math.max(.2,Math.cos(yaw)),ink=F(INKB),rnd=frng(o.seed||3);
  c.lineCap='round';c.lineJoin='round';
  const leg=(x0,y0,x1,y1,w,col)=>{c.strokeStyle=ink;c.lineWidth=w+2.4;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke()};
  if(o.legs!==false){const gy=o.gy==null?0:o.gy;leg(x+r*.1*sq,y,x+r*.25,gy,3,F(TGT.woodD));
    leg(x-r*.48*sq,y+r*.5,x-r*.92*sq,gy,3.4,F(TGT.wood));leg(x+r*.48*sq,y+r*.5,x+r*.92*sq,gy,3.4,F(TGT.woodL));
    leg(x-r*.78*sq,y+r*1.45,x+r*.78*sq,y+r*1.45,2.2,F(TGT.wood))}
  c.save();c.translate(x,y);c.rotate(o.rot||0);
  // the side of the bale, when it is turned
  const th=r*.42*Math.sin(yaw);if(Math.abs(th)>.3){c.fillStyle=F(TGT.strawD);c.beginPath();c.ellipse(-th*.5,0,r*sq+Math.abs(th)*.5,r,0,0,FTAU);c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke()}
  c.scale(sq,1);
  // the face: straw with its texture, then the painted rings, a little uneven like paint on straw
  const fg=c.createRadialGradient(-r*.35,-r*.4,r*.1,0,0,r);fg.addColorStop(0,F(TGT.strawL));fg.addColorStop(.55,F(TGT.straw));fg.addColorStop(1,F(TGT.strawD));
  c.fillStyle=fg;c.beginPath();c.arc(0,0,r,0,FTAU);c.fill();
  c.lineWidth=Math.max(.35,r*.035);for(let i=0;i<34;i++){const a=rnd()*FTAU,rr=r*(.84+rnd()*.16),l=r*(.08+rnd()*.1);c.strokeStyle=F(i%2?TGT.strawD:TGT.strawL);c.beginPath();c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);c.lineTo(Math.cos(a+l/r)*rr,Math.sin(a+l/r)*rr);c.stroke()}
  const ring=(k,col)=>{c.fillStyle=F(col);c.beginPath();for(let i=0;i<=24;i++){const a=i/24*FTAU,w=1+.025*Math.sin(a*5+k*7);const px=Math.cos(a)*r*k*w,py=Math.sin(a)*r*k*w;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill()};
  ring(.8,TGT.white);ring(.64,TGT.red);ring(.48,TGT.white);ring(.32,TGT.red);ring(.17,TGT.gold);
  c.strokeStyle=rgba(F(TGT.redD),.5);c.lineWidth=Math.max(.3,r*.02);for(const k of[.64,.32]){c.beginPath();c.arc(0,0,r*k,0,FTAU);c.stroke()}
  c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.ellipse(-r*.38,-r*.42,r*.3,r*.16,-.6,0,FTAU);c.fill();
  c.strokeStyle=ink;c.lineWidth=Math.max(1,r*.09);c.beginPath();c.arc(0,0,r,0,FTAU);c.stroke();
  c.restore();
  // the arrows stuck in it (they come out toward us, short because we see them almost end on)
  for(const h of o.hits||[])stuckArrow(c,x+(h[0]*r*sq)*Math.cos(o.rot||0)-h[1]*r*Math.sin(o.rot||0),y+h[0]*r*sq*Math.sin(o.rot||0)+h[1]*r*Math.cos(o.rot||0),h[2],h[3]*r,F,h[4],r)}
function stuckArrow(c,x,y,a,len,F,col,r){const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len,w=Math.max(.8,r*.07),ink=F(INKB);
  c.fillStyle='rgba(40,25,10,.45)';c.beginPath();c.ellipse(x,y,w*1.3,w,0,0,FTAU);c.fill();
  c.lineCap='round';c.strokeStyle=ink;c.lineWidth=w+1.6;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.strokeStyle=F(col||TGT.shaft);c.lineWidth=w;c.stroke();
  const nx=-Math.sin(a),ny=Math.cos(a),fw=w*2.2;for(const[sd,fc] of[[1,TGT.fl],[-1,TGT.flW]]){c.fillStyle=F(fc);c.strokeStyle=ink;c.lineWidth=.9;c.beginPath();
    c.moveTo(ex-Math.cos(a)*w*2.6,ey-Math.sin(a)*w*2.6);c.lineTo(ex+nx*fw*sd,ey+ny*fw*sd);c.lineTo(ex+Math.cos(a)*w*.6+nx*fw*.6*sd,ey+Math.sin(a)*w*.6+ny*fw*.6*sd);c.closePath();c.fill();c.stroke()}}
// a target hanging from a branch by two ropes, swinging by `ang` round the branch
function drawHanging(c,px,py,r,len,ang,o){o=o||{};const F=o.F||(v=>v),cx=px+Math.sin(ang)*len,cy=py+Math.cos(ang)*len,ux=Math.cos(ang),uy=-Math.sin(ang);
  c.lineCap='round';for(const sd of[-1,1]){const tx=cx-Math.sin(ang)*r*.92+ux*r*.45*sd,ty=cy-Math.cos(ang)*r*.92+uy*r*.45*sd;
    c.strokeStyle=F(INKB);c.lineWidth=2.2;c.beginPath();c.moveTo(px+sd*3,py);c.lineTo(tx,ty);c.stroke();c.strokeStyle=F(TGT.rope);c.lineWidth=1;c.stroke()}
  drawTarget(c,cx,cy,r,{...o,legs:false,rot:-ang})}
// a thick branch from a trunk, with bark and moss on top
function drawBranch(c,x0,y0,x1,y1,w,F,t){const mx=(x0+x1)/2,my=Math.min(y0,y1)-Math.abs(x1-x0)*.08,ink=F(INKB);c.lineCap='round';
  c.strokeStyle=ink;c.lineWidth=w+3;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(mx,my,x1,y1);c.stroke();
  c.strokeStyle=F(NT.trunk);c.lineWidth=w;c.stroke();c.strokeStyle=rgba(F(NT.trunkL),.6);c.lineWidth=w*.3;c.beginPath();c.moveTo(x0,y0-w*.25);c.quadraticCurveTo(mx,my-w*.3,x1,y1-w*.25);c.stroke();
  c.strokeStyle=F(NT.moss);c.lineWidth=w*.35;c.setLineDash([w*1.6,w*1.1]);c.beginPath();c.moveTo(x0,y0-w*.45);c.quadraticCurveTo(mx,my-w*.5,x1,y1-w*.45);c.stroke();c.setLineDash([])}
// a hay bale: a round-cornered block with straw lines and two cords
function drawBale(c,x,w,h,F,seed){const r=frng(seed||5),ink=F(INKB),x0=x-w/2,top=-h,d=h*.32;
  c.fillStyle=F(TGT.strawL);c.beginPath();c.moveTo(x0+4,top-d);c.lineTo(x0+w-2,top-d);c.lineTo(x0+w,top);c.lineTo(x0,top);c.closePath();c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();
  rr(c,x0,top,w,h,4);const g=c.createLinearGradient(0,top,0,0);g.addColorStop(0,F(TGT.straw));g.addColorStop(1,F(TGT.strawD));c.fillStyle=g;c.fill();c.strokeStyle=ink;c.lineWidth=2.2;c.stroke();
  c.lineWidth=.7;for(let i=0;i<26;i++){const px=x0+3+r()*(w-6),py=top+3+r()*(h-6),l=3+r()*6;c.strokeStyle=F(i%2?TGT.strawD:TGT.strawL);c.beginPath();c.moveTo(px,py);c.lineTo(px+l,py+(r()-.5)*1.4);c.stroke()}
  for(const k of[.27,.73]){const bx=x0+w*k;c.strokeStyle=F('#6b4a2a');c.lineWidth=2.2;c.beginPath();c.moveTo(bx,top-d*.9);c.lineTo(bx+1,top);c.lineTo(bx,0);c.stroke()}}
// a wooden fence: posts with pointed tops and two sagging rails, a little moss here and there
function drawFence(c,x0,x1,h,F,seed){const r=frng(seed||7),ink=F(INKB),n=Math.max(2,Math.round((x1-x0)/46)),xs=[];for(let i=0;i<=n;i++)xs.push(x0+(x1-x0)*i/n+(r()-.5)*6);
  for(const k of[.36,.76])for(let i=0;i<n;i++){const a=xs[i],b=xs[i+1],ya=-h*k+(r()-.5)*2,yb=-h*k+(r()-.5)*2;c.lineCap='round';c.strokeStyle=ink;c.lineWidth=6;c.beginPath();c.moveTo(a,ya);c.quadraticCurveTo((a+b)/2,(ya+yb)/2+2.5,b,yb);c.stroke();
    c.strokeStyle=F(TGT.wood);c.lineWidth=3.6;c.stroke();c.strokeStyle=rgba(F(TGT.woodL),.7);c.lineWidth=1.1;c.beginPath();c.moveTo(a,ya-1);c.quadraticCurveTo((a+b)/2,(ya+yb)/2+1.5,b,yb-1);c.stroke()}
  for(const px of xs){const ph=h*(.95+r()*.15),pw=5;c.beginPath();c.moveTo(px-pw/2,0);c.lineTo(px-pw/2,-ph+3);c.lineTo(px,-ph-2);c.lineTo(px+pw/2,-ph+3);c.lineTo(px+pw/2,0);c.closePath();
    const g=c.createLinearGradient(px-pw/2,0,px+pw/2,0);g.addColorStop(0,F(TGT.woodD));g.addColorStop(.6,F(TGT.wood));g.addColorStop(1,F(TGT.woodL));c.fillStyle=g;c.fill();c.strokeStyle=ink;c.lineWidth=1.8;c.stroke();
    if(r()<.5){c.fillStyle=F(NT.moss);c.beginPath();c.ellipse(px,-ph*.15,pw*.8,3,0,0,FTAU);c.fill()}}}
// a banner on a pole: a green pennant with the leaf of Mossbound, waving
function drawBanner(c,x,h,F,t){const ink=F(INKB);c.lineCap='round';c.strokeStyle=ink;c.lineWidth=5;c.beginPath();c.moveTo(x,0);c.lineTo(x,-h);c.stroke();c.strokeStyle=F(TGT.wood);c.lineWidth=3;c.stroke();
  c.fillStyle=F(TGT.gold);c.beginPath();c.arc(x,-h-3,3,0,FTAU);c.fill();c.strokeStyle=ink;c.lineWidth=1.4;c.stroke();
  const fw=44,fh=26,y0=-h+4;c.beginPath();c.moveTo(x,y0);for(let i=0;i<=10;i++){const k=i/10;c.lineTo(x+fw*k,y0+fh*k*.5+Math.sin(t*3.2-k*4)*4*k)}
  for(let i=10;i>=0;i--){const k=i/10;c.lineTo(x+fw*k*.98,y0+fh-fh*k*.5+Math.sin(t*3.2-k*4)*4*k)}c.closePath();
  const g=c.createLinearGradient(x,y0,x+fw,y0+fh);g.addColorStop(0,F('#3f8a3a'));g.addColorStop(1,F('#7bc24a'));c.fillStyle=g;c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();
  const lx=x+14,ly=y0+fh*.5+Math.sin(t*3.2-1.3)*1.3;c.fillStyle=F('#f6ead2');c.beginPath();c.moveTo(lx,ly-6);c.quadraticCurveTo(lx+6,ly,lx,ly+6);c.quadraticCurveTo(lx-6,ly,lx,ly-6);c.fill()}
// a pine cone: an egg with its scales
function drawCone(c,x,y,r,rot,F){F=F||(v=>v);c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=F('#8a5a30');c.beginPath();c.ellipse(0,0,r*.72,r,0,0,FTAU);c.fill();
  c.strokeStyle=F('#4e2f16');c.lineWidth=Math.max(.4,r*.12);for(let i=-2;i<=2;i++){c.beginPath();c.arc(0,i*r*.36-r*.2,r*.62,.35,Math.PI-.35);c.stroke()}
  c.fillStyle=rgba(F('#d89a5a'),.55);for(let i=-1;i<=1;i++){c.beginPath();c.ellipse(-r*.18,i*r*.4,r*.2,r*.1,0,0,FTAU);c.fill()}
  c.strokeStyle=F(INKB);c.lineWidth=Math.max(.6,r*.14);c.beginPath();c.ellipse(0,0,r*.72,r,0,0,FTAU);c.stroke();c.restore()}
// a wicker basket full of pine cones
function drawBasket(c,x,F){const ink=F(INKB),w=26,h=15;for(let i=0;i<5;i++)drawCone(c,x-9+i*4.5,-h-2+Math.abs(i-2)*1.2,4,(i-2)*.4,F);
  c.beginPath();c.moveTo(x-w/2,-h);c.lineTo(x+w/2,-h);c.lineTo(x+w/2-3,0);c.lineTo(x-w/2+3,0);c.closePath();const g=c.createLinearGradient(0,-h,0,0);g.addColorStop(0,F('#c89a5a'));g.addColorStop(1,F('#8a6034'));c.fillStyle=g;c.fill();
  c.strokeStyle=rgba(F('#5a3a1c'),.8);c.lineWidth=.8;for(let i=1;i<4;i++){c.beginPath();c.moveTo(x-w/2+i*.8,-h+i*h/4);c.lineTo(x+w/2-i*.8,-h+i*h/4);c.stroke()}for(let i=1;i<7;i++){c.beginPath();c.moveTo(x-w/2+i*w/7,-h);c.lineTo(x-w/2+3+i*(w-6)/7,0);c.stroke()}
  c.strokeStyle=ink;c.lineWidth=2;c.beginPath();c.moveTo(x-w/2,-h);c.lineTo(x+w/2,-h);c.lineTo(x+w/2-3,0);c.lineTo(x-w/2+3,0);c.closePath();c.stroke()}
// a fallen trunk to sit on: bark below, moss on top, the cut end with its rings
function drawLog(c,x0,x1,yc,rr0,F,t,seed){const r=frng(seed||9),ink=F(INKB),top=yc-rr0,bot=yc+rr0;
  c.beginPath();c.moveTo(x0,top+2);c.lineTo(x1,top);c.lineTo(x1,bot);c.lineTo(x0,bot+1);c.quadraticCurveTo(x0-rr0*.5,yc,x0,top+2);c.closePath();
  const g=c.createLinearGradient(0,top,0,bot);g.addColorStop(0,F(NT.trunkL));g.addColorStop(.25,F(NT.trunk));g.addColorStop(1,F(NT.trunkD));c.fillStyle=g;c.fill();c.strokeStyle=ink;c.lineWidth=2.4;c.stroke();
  c.strokeStyle=rgba(F(NT.bark),.85);c.lineWidth=1;for(let i=0;i<7;i++){const y=top+rr0*.5+i*rr0*.22,a=x0+r()*(x1-x0)*.3;c.beginPath();c.moveTo(a,y);for(let x=a;x<x1-4;x+=8)c.lineTo(x,y+Math.sin(x*.21+i)*1.2);c.stroke()}
  // the moss blanket on top, with tufts catching the sun
  c.fillStyle=F(NT.mossD);c.beginPath();c.moveTo(x0+4,top+3);for(let x=x0+4;x<=x1-6;x+=6)c.lineTo(x,top-2-Math.abs(Math.sin(x*.13+seed))*3);c.lineTo(x1-6,top+5);
  for(let x=x1-6;x>=x0+4;x-=7)c.lineTo(x,top+4+Math.abs(Math.sin(x*.29))*5);c.closePath();c.fill();
  c.fillStyle=F(NT.moss);c.beginPath();c.ellipse((x0+x1)/2,top-1,(x1-x0)*.42,3,0,0,FTAU);c.fill();
  c.strokeStyle=rgba(F(NT.mossL),.8);c.lineWidth=.9;c.beginPath();for(let x=x0+8;x<x1-8;x+=5){const h=2+Math.abs(Math.sin(x*.7))*3;c.moveTo(x,top-1);c.lineTo(x+.6,top-1-h)}c.stroke();
  // the cut end
  c.fillStyle=F('#d8a66a');c.beginPath();c.ellipse(x1,yc,rr0*.55,rr0,0,0,FTAU);c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();
  c.strokeStyle=rgba(F('#8a5a30'),.8);c.lineWidth=.8;for(const k of[.75,.5,.25]){c.beginPath();c.ellipse(x1,yc,rr0*.55*k,rr0*k,0,0,FTAU);c.stroke()}}
// the arrow flying (a screen item): from the nock a to the point b in the world, with a faint trail
function arrowS(c,a,b,o){o=o||{};const A=pr(a[0],a[1],a[2]),B=pr(b[0],b[1],b[2]);if(A[2]<=0||B[2]<=0)return;const s=(A[2]+B[2])/2,w=Math.max(.9,.9*s),dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,nx=-uy,ny=ux;
  if(o.trail){const g=c.createLinearGradient(A[0]-ux*o.trail*s,A[1]-uy*o.trail*s,A[0],A[1]);g.addColorStop(0,'rgba(255,248,225,0)');g.addColorStop(1,`rgba(255,248,225,${o.trailA||.45})`);c.strokeStyle=g;c.lineWidth=w*1.4;c.lineCap='round';c.beginPath();c.moveTo(A[0]-ux*o.trail*s,A[1]-uy*o.trail*s);c.lineTo(A[0],A[1]);c.stroke()}
  c.lineCap='round';c.strokeStyle=INKB;c.lineWidth=w+1.6;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();c.strokeStyle=o.col||TGT.shaft;c.lineWidth=w;c.stroke();
  // the steel head
  c.fillStyle=TGT.tip;c.strokeStyle=INKB;c.lineWidth=1;c.beginPath();c.moveTo(B[0]+ux*w*3.2,B[1]+uy*w*3.2);c.lineTo(B[0]+nx*w*1.5,B[1]+ny*w*1.5);c.lineTo(B[0]-nx*w*1.5,B[1]-ny*w*1.5);c.closePath();c.fill();c.stroke();
  // the fletching near the nock
  for(const[sd,fc] of[[1,o.fl||TGT.fl],[-1,TGT.flW]]){c.fillStyle=fc;c.beginPath();c.moveTo(A[0]+ux*w*5,A[1]+uy*w*5);c.lineTo(A[0]+nx*w*2*sd,A[1]+ny*w*2*sd);c.lineTo(A[0]+ux*w*.6+nx*w*1.2*sd,A[1]+uy*w*.6+ny*w*1.2*sd);c.closePath();c.fill();c.stroke()}}
// straw and splinters flying out of a hit (u: seconds since the hit; on the target's card)
function strawBurst(c,x,y,r,u,seed,n,F){if(u<0||u>1.2)return;const R=frng(seed);F=F||(v=>v);for(let i=0;i<(n||14);i++){const a=-Math.PI*(.05+.9*R()),sp=(30+R()*50)*r/16,px=x+Math.cos(a)*sp*u,py=y+Math.sin(a)*sp*u+140*u*u*r/16,al=1-u/1.2;
    c.save();c.translate(px,py);c.rotate(R()*6+u*(R()*14-7));c.globalAlpha=al;c.fillStyle=F(R()<.5?TGT.strawL:TGT.straw);c.fillRect(-r*.09,-r*.02,r*.18,r*.04);c.restore()}}
// the far crypt on its hill at the end of the valley (the hill and the portal of the first film, far away in the haze)
function drawCryptFar(c,cx,z,t,w,h){drawHill(c,cx,t,z,w||560,h||250);c.save();c.translate(cx,-h*.62+28);c.scale(.62,.62);c.translate(-cx,0);drawPortal(c,cx,t,z);c.restore()}
// god rays of the morning sun through the leaves
const sunRays=(t,a,x0,ang)=>moonRays(X,t,a,x0,ang,DAWN.sun);
