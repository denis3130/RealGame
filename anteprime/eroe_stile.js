// ===================== EROE NUOVO, DISEGNATO COME QUELLO DI PRIMA (anteprima) =====================
// Denis's hooded archer (big pointed hood, pale mask with two big black eyes, scarf, leather gloves, quiver, bow)
// drawn with the same rig, outlines and colours as the old hero, so it moves and turns like before.
window.NEWHERO=true;
const MASK='#f3e8d4',GLOVE='#7a5232',HOOD_IN='#123b37',GOLD='#ffc93c';
function maskHead(S,B){
  const v=B.v,hy=-19;ink(2.5);heroBits(S,B,hy,false);
  const lean={s:0,s34:-3,side:-6,n34:-3,n:0}[v]||0;
  // the pointy tip first, the hood then covers its root
  ctx.beginPath();ctx.moveTo(lean*.3-4.8,hy-8);ctx.quadraticCurveTo(lean*.7-1.5,hy-14,lean*1.25,hy-19);ctx.quadraticCurveTo(lean*.7+2,hy-13,lean*.3+4.8,hy-8);ctx.closePath();fs(S.hood);
  // big hood, flaring onto the shoulders
  const hood=()=>{ctx.beginPath();ctx.moveTo(-11,hy+5);ctx.bezierCurveTo(-12.5,hy-5,-8,hy-12,0,hy-12);ctx.bezierCurveTo(8,hy-12,12.5,hy-5,11,hy+5);ctx.quadraticCurveTo(0,hy+9.5,-11,hy+5);ctx.closePath()};
  hood();fs(S.hood);
  ctx.save();hood();ctx.clip();ctx.fillStyle='rgba(255,255,255,.16)';ell(-4,hy-7,6,3,-.5);ctx.fill();ctx.fillStyle='rgba(0,0,0,.16)';ell(7,hy+5,7,6);ctx.fill();ctx.restore();
  // the opening, the pale mask and the eyes, by view
  const face=(ox,ow,oh,fx,fw,fh,eyes)=>{ell(ox,hy+2,ow,oh);ctx.fillStyle=HOOD_IN;ctx.fill();
    ctx.save();ell(fx,hy+3,fw,fh);ctx.clip();ctx.fillStyle=MASK;ctx.fillRect(fx-fw-1,hy-6,fw*2+2,fh*2+4);ctx.fillStyle='rgba(60,40,30,.22)';ell(fx,hy-3,fw+2,4);ctx.fill();ctx.restore();
    ctx.strokeStyle=INK;ctx.lineWidth=1.6;ell(fx,hy+3,fw,fh);ctx.stroke();
    for(const [ex,ew] of eyes){ctx.fillStyle=INK;ell(ex,hy+3.2,ew,2.7);ctx.fill();ctx.fillStyle='#fff';circ(ex-ew*.35,hy+2,.8);ctx.fill()}ink(2.5)};
  if(v==='s')face(0,8,7.4,0,6.9,6.4,[[-3.1,2.1],[3.1,2.1]]);
  else if(v==='s34')face(3,7.2,7.2,3.6,6,6.2,[[1.3,1.6],[6,2.1]]);
  else if(v==='side')face(6,4.8,6.8,6.7,3.8,5.8,[[7.8,1.7]]);
  else{ctx.strokeStyle='rgba(0,0,0,.28)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,hy-11);ctx.quadraticCurveTo(-1.5,hy,0,hy+10);ctx.stroke();ink(2.5)}
  // small gold diamond on the hood, like the buckle
  if(v!=='n'&&v!=='n34'){const ex={s:0,s34:3.4,side:7}[v],w=v==='side'?1.2:2;ctx.beginPath();ctx.moveTo(ex,hy-9.4);ctx.lineTo(ex+w,hy-7.2);ctx.lineTo(ex,hy-5);ctx.lineTo(ex-w,hy-7.2);ctx.closePath();ctx.fillStyle=GOLD;ctx.fill();ink(1.2);ctx.stroke();ink(2.5)}
  // scarf: two points over the chest in front, one down the back
  ctx.beginPath();
  const sc0={s:[-7,hy+7.5],s34:[-3.5,hy+8],side:[1,hy+8],n:[-5,hy+8],n34:[-5,hy+8]}[v];
  if(v==='s'){ctx.moveTo(...sc0);ctx.lineTo(-3.2,hy+13.5);ctx.lineTo(0,hy+9.8);ctx.lineTo(3.2,hy+13.5);ctx.lineTo(7,hy+7.5)}
  else if(v==='s34'){ctx.moveTo(...sc0);ctx.lineTo(0.8,hy+13.5);ctx.lineTo(3.8,hy+10);ctx.lineTo(7,hy+13);ctx.lineTo(9.5,hy+7)}
  else if(v==='side'){ctx.moveTo(...sc0);ctx.lineTo(4.5,hy+13.5);ctx.lineTo(8.5,hy+7.5)}
  else{ctx.moveTo(...sc0);ctx.lineTo(0,hy+14);ctx.lineTo(5,hy+8)}
  ctx.quadraticCurveTo(0,hy+6,...sc0);ctx.closePath();ctx.fillStyle=S.hood;ctx.fill();ctx.stroke();
  heroBits(S,B,hy,true);
  if(mossOn)mossStick(B,hy+1)}
{const _h=head;head=function(S,B){if(S.mask)return maskHead(S,B);return _h(S,B)}}
{const _r=drawRig;drawRig=function(x,y,face,walk,moving,S,o){
  if(window.NEWHERO&&P&&S===(P.style||HERO))S=Object.assign({},S,{mask:true,skin:GLOVE});
  return _r(x,y,face,walk,moving,S,o)}}
