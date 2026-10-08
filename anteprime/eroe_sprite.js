// ===================== EROE DA IMMAGINE: l'arciere incappucciato di Denis, le sue 8 pose (anteprima) =====================
window.NEWHERO=true;
const HSPR=HSPR_SRC.map(src=>{const im=new Image();im.src=src;return im});
// facing sector (0=E,1=SE,2=S,3=SW,4=W,5=NW,6=N,7=NE) -> [pose, mirrored]
const HDIR=[[4,true],[1,false],[2,false],[3,false],[4,false],[5,false],[6,false],[7,false]];
const HERO_H=40;
// the bow in each pose, in the picture's own pixels: string ends (side and back poses, where the game draws the string),
// where the arrow sits, which way it flies and which way the string is pulled
const HBOW={
  4:{t1:[25,45],t2:[25,106],n:[25,77],aim:[-1,0]},
  5:{t1:[25,47],t2:[25,107],n:[26,78],aim:[-.95,-.3]},
  7:{t1:[86,46],t2:[86,104],n:[86,77],aim:[.95,-.3]},
  2:{n:[50,92],aim:[0,1]},1:{n:[82,88],aim:[.6,.8]},3:{n:[31,88],aim:[-.6,.8]},
  6:{n:[40,26],aim:[-.12,-1],over:true}};
const HS={last:0,rel:0,stepSide:0,lastFace:2};
function hArrow(x0,y0,ax,ay,c){const len=34,hx=x0+ax*len,hy=y0+ay*len,nx=-ay,ny=ax;
  ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.4;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(hx,hy);ctx.stroke();ctx.strokeStyle='#d9b27a';ctx.lineWidth=2.2;ctx.stroke();
  // feathers
  ctx.fillStyle='#f4efe4';ctx.strokeStyle=INK;ctx.lineWidth=1.6;for(const sd of [-1,1]){ctx.beginPath();ctx.moveTo(x0+ax*2,y0+ay*2);ctx.lineTo(x0+ax*9+nx*sd*4.5,y0+ay*9+ny*sd*4.5);ctx.lineTo(x0+ax*11,y0+ay*11);ctx.closePath();ctx.fill();ctx.stroke()}
  // head, it heats up while the bow is drawn
  ctx.fillStyle=c>.95?'#fff4c8':'#c9cfd6';ctx.beginPath();ctx.moveTo(hx+ax*7,hy+ay*7);ctx.lineTo(hx+nx*3.6,hy+ny*3.6);ctx.lineTo(hx-nx*3.6,hy-ny*3.6);ctx.closePath();ctx.fill();ctx.stroke();
  return[hx+ax*4,hy+ay*4]}
function hBowFx(pose,c,rel){const B=HBOW[pose];if(!B)return;const [ax,ay]=B.aim,pull=c*13;
  const nx=B.n[0]-ax*pull,ny=B.n[1]-ay*pull;
  if(B.t1){const vib=rel>0?Math.sin(rel*90)*rel*22:0;ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(...B.t1);ctx.lineTo(nx+vib,ny);ctx.lineTo(...B.t2);ctx.stroke();ctx.strokeStyle='#ece4d2';ctx.lineWidth=1.3;ctx.stroke()}
  if(c>.04&&rel<=0){const h=hArrow(nx,ny,ax,ay,c),g=ctx.createRadialGradient(h[0],h[1],0,h[0],h[1],8+16*c);g.addColorStop(0,`rgba(255,226,150,${.25+.55*c})`);g.addColorStop(1,'rgba(255,226,150,0)');
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(h[0]-26,h[1]-26,52,52);ctx.restore()}
  if(rel>0){const k=rel/.14,hx=B.n[0]+ax*40,hy=B.n[1]+ay*40,g=ctx.createRadialGradient(hx,hy,0,hx,hy,22);g.addColorStop(0,`rgba(255,240,200,${.8*k})`);g.addColorStop(1,'rgba(255,240,200,0)');
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(hx-22,hy-22,44,44);ctx.strokeStyle=`rgba(255,250,230,${k})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(B.n[0],B.n[1]);ctx.lineTo(hx+ax*20,hy+ay*20);ctx.stroke();ctx.restore()}}
function drawSpriteHero(x,y,face,walk,moving){
  const sec=((Math.round(face/(Math.PI/4))%8)+8)%8,[i,mir]=HDIR[sec],im=HSPR[i],m=HSPR_META[i];if(!im.complete||!im.naturalWidth)return false;
  const k=HERO_H/m.h,t=G.t||0,dt=Math.max(0,t-(HS.t||t));HS.t=t;
  // bow: charge follows the shot timer, a short snap when the arrow leaves
  const c=P.aiming?(P.fireCd>0?clamp(1-P.fireCd*(P.aspd||1),0,1):1):0;
  if((P.fireCd||0)>HS.last+.04)HS.rel=.14;HS.last=P.fireCd||0;HS.rel=Math.max(0,HS.rel-dt);
  // legs: the two boots step on the floor, the body rides above them
  const sw=moving?Math.sin(walk):0,cw=moving?Math.cos(walk):0,side=i===4,bob=moving?Math.abs(cw)*3.2:Math.sin(t*2.4)*.6;
  const lean=moving?(mir?-1:1)*(side?-.07:0)+(Math.cos(face)*.05):-(HBOW[i]?HBOW[i].aim[0]:0)*.05*c;
  // a puff of dust each time a boot lands
  const ss=sw>0?1:-1;if(moving&&ss!==HS.stepSide&&!LOWFX){const fx0=x+(ss>0?4:-4),fy0=y+8;for(let q=0;q<2;q++)G.fx.push({k:'puff',x:fx0+rand(-2,2),y:fy0,vx:rand(-18,18)-Math.cos(face)*20,vy:rand(-14,-4),t:rand(.2,.32),r:rand(2,3.4)})}HS.stepSide=ss;
  const breath=moving?0:Math.sin(t*2.4)*.015,dash=P.dashT>0?.1:0;
  shadow(x,y+8,12-Math.abs(cw)*1.2,4.2,.34);
  const ox=-m.cx,oy=-m.h+3;
  ctx.save();ctx.translate(x,y+8.5);ctx.scale((mir?-1:1)*k,k);
  // boots
  for(const f of [0,1]){const s=f?1:-1,pos=sw*s,lift=moving?Math.max(0,cw*s)*5:0;
    const dx=side?pos*6:pos*1.2,dy=side?0:-pos*2;
    ctx.save();ctx.beginPath();ctx.rect(f?ox+m.fx:ox-4,oy+m.ft-5,f?m.w:m.fx+4,30);ctx.clip();ctx.drawImage(im,ox+dx,oy+dy-lift);ctx.restore()}
  // body, cut just above the boots
  ctx.save();ctx.translate(0,-bob);ctx.rotate(lean);ctx.scale(1-breath*.6-dash*.15,1+breath+dash*.25);
  ctx.beginPath();ctx.rect(ox-20,oy-40,m.w+40,m.ft+40);ctx.clip();ctx.drawImage(im,ox,oy);ctx.restore();
  ctx.save();ctx.translate(0,-bob);ctx.rotate(lean);ctx.translate(ox,oy);hBowFx(i,c,HS.rel);ctx.restore();
  ctx.restore();return true}
{const _dh=drawHero;drawHero=function(){
  if(!window.NEWHERO||(G.state==='dead'&&G.deathT!=null)||INTRO.on)return _dh();
  const x=P.x,y=P.y;if(P.inv>0&&P.dashT<=0&&Math.floor(G.t*20)%2)ctx.globalAlpha=.45;
  const ok=drawSpriteHero(x,y,P.face,P.walk,P.moving);ctx.globalAlpha=1;if(!ok)return _dh();
  if(P.shield&&P.shCd<=0){const pu=.5+.5*Math.sin(G.t*3);ctx.strokeStyle=`rgba(150,230,120,${.35+.2*pu})`;ctx.lineWidth=2;ell(x,y-8,20,24);ctx.stroke();ctx.fillStyle='rgba(150,230,120,.07)';ctx.fill()}}}
