// ===================== EROE DA IMMAGINE: l'arciere incappucciato di Denis, le sue 8 pose (anteprima) =====================
window.NEWHERO=true;
// poses cut from Denis's sheet; E is the W pose mirrored
const HSPR=HSPR_SRC.map(src=>{const im=new Image();im.src=src;return im});
// facing sector (0=E,1=SE,2=S,3=SW,4=W,5=NW,6=N,7=NE) -> [pose, mirrored]
const HDIR=[[4,true],[1,false],[2,false],[3,false],[4,false],[5,false],[6,false],[7,false]];
const HERO_H=48;
function drawSpriteHero(x,y,face,walk,moving){
  const sec=((Math.round(face/(Math.PI/4))%8)+8)%8,[i,mir]=HDIR[sec],im=HSPR[i],m=HSPR_META[i];if(!im.complete||!im.naturalWidth)return false;
  const k=HERO_H/m.h,t=G.t||0;
  // walking: a small bounce and a rock from side to side; standing: a slow breath; dash: stretched
  const b=moving?Math.abs(Math.sin(walk)):0,rock=moving?Math.sin(walk)*.06:0,breath=moving?0:Math.sin(t*2.4)*.018;
  const dash=P.dashT>0?.12:0,shot=P.fireCd>0&&P.aiming?Math.max(0,P.fireCd*P.aspd-.75)*.25:0;
  const sy=1+breath-b*.05+dash*.3-shot,sx=1-breath*.6+b*.04-dash*.15+shot*.6;
  shadow(x,y+8,13-b*1.5,4.6,.32);
  ctx.save();ctx.translate(x,y+8.5-b*3.2);ctx.rotate(rock);ctx.scale((mir?-1:1)*k*sx,k*sy);
  ctx.drawImage(im,-m.cx,-m.h+3);ctx.restore();return true}
{const _dh=drawHero;drawHero=function(){
  if(!window.NEWHERO||(G.state==='dead'&&G.deathT!=null)||INTRO.on)return _dh();
  const x=P.x,y=P.y;if(P.inv>0&&P.dashT<=0&&Math.floor(G.t*20)%2)ctx.globalAlpha=.45;
  const ok=drawSpriteHero(x,y,P.face,P.walk,P.moving);ctx.globalAlpha=1;if(!ok)return _dh();
  if(P.shield&&P.shCd<=0){const pu=.5+.5*Math.sin(G.t*3);ctx.strokeStyle=`rgba(150,230,120,${.35+.2*pu})`;ctx.lineWidth=2;ell(x,y-10,22,27);ctx.stroke();ctx.fillStyle='rgba(150,230,120,.07)';ctx.fill()}}}
