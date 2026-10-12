// ---------- humanoid rig (hero, goblin, skeleton, witch) ----------
const HERO={sc:1,body:'#2fb3a6',hood:'#23877d',skin:'#f2c9a0',foot:'#4a3626',foot2:'#3a2a1d',quiver:true,held:'bow',bowCol:'#a4703d',hoodTip:false,bighood:false,belt:'#8a5a20'};
const GOBLIN={sc:.95,body:'#a8443a',hood:'#7e2f28',skin:'#7bbf4a',foot:'#3d2a1d',ears:true,held:'bow',bowCol:'#6b4a2a',eyeCol:'#e5484d',belt:'#4a3626'};
const SKEL={sc:1,body:'#d9d2c0',skull:true,skin:'#e8e2d0',foot:'#cfc7b2',ribs:true,held:'xbow',bowCol:'#6b4a2a',shield:true,eyeCol:'#e5484d'},SKEL_NS={...SKEL,shield:false};
const MERCHANT={sc:1.08,body:'#5a3f7a',hood:'#3a2a52',skin:'#e8c0a0',foot:'#3a2a1d',held:'staff',eyeCol:'#ffc93c',belt:'#8a5a20',hoodTip:true};
const WITCH={sc:1.35,body:'#3d2f4f',hood:'#2c3a24',skin:'#b7d9a8',float:true,robe:true,crown:true,held:'staff',eyeCol:'#7bf0c0'};
// camera of the rig (the zombie map sets it when it tilts): kr = how much the floor is squashed compared with the default view (steps,
// shadow, hand), zk = how tall the character is drawn (uniform scale from the feet, so the head stays round). With 1 and 1 every number
// is the same as before: the Classic mode does not change by a pixel.
const RIGCAM={kr:1,zk:1};
function drawRig(x,y,face,walk,moving,S,o){
  o=o||{};const B=basis(face),v=B.v,kr=RIGCAM.kr,zk=RIGCAM.zk;
  const w=moving?Math.sin(walk):0,bob=moving&&!S.float?Math.abs(Math.sin(walk))*1.6:0,fl=S.float?8+Math.sin(G.t*2.5)*3:0;
  shadow(x,y+8*S.sc,13*S.sc*zk,5*S.sc*kr*zk,S.float?.22:.32);
  ctx.save();if(zk===1){ctx.translate(x,y-bob-fl);ctx.scale(B.f*S.sc,S.sc)}
  else{ctx.translate(x,y+8*S.sc);ctx.scale(B.f*S.sc*zk,S.sc*zk);ctx.translate(0,-8-(bob+fl)/S.sc)}ink(2.5);
  if(S.ring)ringAura(S);
  if(!S.float){let a,b;
    if(B.side){a=[w*5,7];b=[-w*5,7]}else if(v==='s34'||v==='n34'){a=[-4+w*3,7+w*1.2*kr];b=[4-w*3,7-w*1.2*kr]}else{a=[-5,7+w*2*kr];b=[5,7-w*2*kr]}
    circ(b[0],b[1],3.6);fs(S.foot2||S.foot);circ(a[0],a[1],3.6);fs(S.foot)}
  if(B.back){held(S,o,B);if(S.shield)shieldPart(B,S)}
  if(S.quiver&&(B.side||v==='s34'))quiver(B.side?-9:-8,-6,B.side?-.5:-.3);
  const bw=B.side?8:v==='s'||v==='n'?11:9.5;
  const bodyPath=()=>{ctx.beginPath();
    if(S.robe){ctx.moveTo(-bw-6,8);ctx.quadraticCurveTo(-bw-1,-10,0,-12);ctx.quadraticCurveTo(bw+1,-10,bw+6,8);ctx.quadraticCurveTo(0,12,-bw-6,8)}
    else{ctx.moveTo(-bw,5);ctx.quadraticCurveTo(-bw-2,-9,0,-11);ctx.quadraticCurveTo(bw+2,-9,bw,5);ctx.quadraticCurveTo(0,9,-bw,5)}
    ctx.closePath()};
  if(S.armor==='mantello_ombra'&&!B.back)cape(B,bw,w);
  bodyPath();fs(S.body);if(S.skinId&&!B.back){ctx.fillStyle=S.skinId==='stellato'?'#ffffff':'#f6ff9a';for(const[sx,sy] of [[-4,-5],[3,-2],[-1,2],[5,-7],[-6,0]]){circ(sx+(B.side?2:0),sy,.9);ctx.fill()}ink(2.5)}
  ctx.fillStyle='rgba(0,0,0,.18)';ell(B.side?-3:0,S.robe?5:3,bw*.8,3.5);ctx.fill();
  if(S.robe){ctx.strokeStyle='rgba(123,191,74,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-bw-4,6);ctx.quadraticCurveTo(0,10,bw+4,6);ctx.stroke();ink(2.5)}
  if(S.ribs&&!B.back){ctx.strokeStyle='rgba(27,22,18,.55)';ctx.lineWidth=1.6;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-bw*.55+(B.side?2:0),-7+i*3.5);ctx.lineTo(bw*.55+(B.side?2:0),-7+i*3.5);ctx.stroke()}ink(2.5)}
  if(S.ribs&&B.back){ctx.strokeStyle='rgba(27,22,18,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(0,3);ctx.stroke();ink(2.5)}
  if(S.belt&&!B.back){ctx.fillStyle=S.belt;ctx.fillRect(-bw+1,-1,bw*2-2,3);ctx.fillStyle='#ffc93c';ctx.fillRect(B.side?3:v==='s34'?2:-1.5,-1.5,3,4)}
  if(S.belt&&B.back){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(v==='n'?0:-2,4);ctx.stroke();ink(2.5)}
  if(S.cracks){ctx.strokeStyle=S.p2?'#ffd86b':'#ff7a2e';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-bw*.5,-8);ctx.lineTo(-bw*.2,-3);ctx.lineTo(-bw*.4,2);ctx.moveTo(bw*.4,-6);ctx.lineTo(bw*.2,0);ctx.stroke();ink(2.5)}
  armorBits(S,B,bw,bodyPath);amulet(S,B);
  if(S.armor==='mantello_ombra'&&B.back){cape(B,bw,w);ink(2.5)}
  if(!B.back)held(S,o,B);
  head(S,B);
  if(S.quiver&&B.back&&S.armor!=='mantello_ombra')quiverBack(v);
  if(!B.back&&S.shield)shieldPart(B,S);
  ctx.restore();
}
function quiver(x,y,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ink(2);ctx.beginPath();ctx.roundRect?ctx.roundRect(-3.5,-9,7,16,2):ctx.rect(-3.5,-9,7,16);fs('#6b4a2a');
  ctx.fillStyle='#f6ead2';for(const fx of [-2,1.5]){ctx.beginPath();ctx.moveTo(fx,-9);ctx.lineTo(fx-1.5,-14);ctx.lineTo(fx+1.5,-14);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}
// the quiver seen from behind: slung across the back, arrows poking out over the right shoulder, beside the head
function quiverBack(v){const n=v==='n';ctx.save();ink(2);
  // strap from the left shoulder across the back
  ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(n?-8:-6,-10);ctx.lineTo(n?6:5,2);ctx.stroke();ctx.strokeStyle='#4a321e';ctx.lineWidth=1.8;ctx.stroke();
  ctx.translate(n?6.5:5.5,-6);ctx.rotate(n?.42:.32);ink(2);
  // arrows first, then the leather tube over their shafts
  for(const[ax,h,c] of [[-2.2,7.5,'#f6ead2'],[.3,9.5,'#e5484d'],[2.4,7,'#f6ead2']]){ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(ax,-8);ctx.lineTo(ax,-8-h);ctx.stroke();ctx.strokeStyle='#c9a26a';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=c;ink(1.4);ctx.beginPath();ctx.moveTo(ax,-8-h-1);ctx.lineTo(ax-2.4,-8-h+4.4);ctx.lineTo(ax,-8-h+3.2);ctx.lineTo(ax+2.4,-8-h+4.4);ctx.closePath();ctx.fill();ctx.stroke()}
  ink(2);ctx.beginPath();ctx.roundRect?ctx.roundRect(-4,-9,8,18,2.5):ctx.rect(-4,-9,8,18);fs('#7a5232');
  ctx.fillStyle='#5a3a22';ctx.fillRect(-4,-9,8,2.6);ctx.strokeRect(-4,-9,8,2.6);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(-2.6,-5.5,1.6,12);
  ctx.fillStyle='#c9a040';ctx.fillRect(-4,3,8,1.6);ctx.restore();ink(2.5)}
function held(S,o,B){
  if(!S.held)return;
  const hx=B.lx*10,hy=-5+B.ly*5*RIGCAM.kr;
  ctx.save();ctx.translate(hx,hy);ctx.rotate(B.la);
  if(S.held==='bow'){const pull=o.pull||0,bk=S.bowKind;
    if(bk==='phoenix'){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,130,40',2,0,22,.3+.08*Math.sin(G.t*9));ctx.restore()}
    ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.arc(-4,0,12,-1.15,1.15);ctx.stroke();
    ctx.strokeStyle=S.bowCol;ctx.lineWidth=3;ctx.beginPath();ctx.arc(-4,0,12,-1.15,1.15);ctx.stroke();
    const ex=-4+Math.cos(1.15)*12,ey=Math.sin(1.15)*12;bowTrim(bk,ex,ey,S);
    ctx.strokeStyle='#f6ead2';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ex,-ey);ctx.lineTo(ex-pull,0);ctx.lineTo(ex,ey);ctx.stroke();
    if(pull>2){ctx.strokeStyle=INK;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(ex-pull,0);ctx.lineTo(13,0);ctx.stroke();ctx.strokeStyle='#d9b27a';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(ex-pull,0);ctx.lineTo(13,0);ctx.stroke()}
    ink(2);circ(8,0,3);fs(S.skin);ringOn(S,8,0);if(pull>2){circ(ex-pull,0,2.6);fs(S.skin)}
  }else if(S.held==='sword'){
    ctx.rotate(o.wind?-1.3:o.lunge?.25:0);
    ink(2.5);ctx.beginPath();ctx.moveTo(2,-2);ctx.lineTo(22,-1.5);ctx.lineTo(25,0);ctx.lineTo(22,1.5);ctx.lineTo(2,2);ctx.closePath();fs('#cfd6de');
    ctx.fillStyle='#6b4a2a';ctx.fillRect(-2,-4,4,8);ctx.strokeRect(-2,-4,4,8);circ(0,0,3);fs(S.skin);
  }else if(S.held==='xbow'){const pull=o.pull||0;
    ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(15,0);ctx.stroke();ctx.strokeStyle=S.bowCol||'#6b4a2a';ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(11,-11);ctx.quadraticCurveTo(6,0,11,11);ctx.stroke();ctx.strokeStyle='#a7b0ba';ctx.lineWidth=2.5;ctx.stroke();
    ctx.strokeStyle='#f6ead2';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(11,-11);ctx.lineTo(5-pull*.5,0);ctx.lineTo(11,11);ctx.stroke();
    if(pull>2){ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(18,0);ctx.stroke();ctx.strokeStyle='#dfe4ea';ctx.lineWidth=1.6;ctx.stroke()}
    ink(2);circ(1,0,3);fs(S.skin);ringOn(S,1,0);
  }else if(S.held==='hammer'){
    ctx.rotate(o.wind?-1.7:o.slam?.6:0);
    ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(19,0);ctx.stroke();ctx.strokeStyle='#6b4a2a';ctx.lineWidth=3;ctx.stroke();
    ink(2.5);ctx.beginPath();ctx.rect(15,-9,11,18);fs('#5a5f68');ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(16,-8,3,16);
    if(S.p2||o.wind){ctx.fillStyle='#ff8a3c';ctx.fillRect(23,-8,2.5,16)}
    circ(0,0,3.4);fs(S.skin);
  }else if(S.held==='staff'){
    ink(3);ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-16,3);ctx.lineTo(14,-1);ctx.stroke();
    ctx.strokeStyle='#6b4a2a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-16,3);ctx.lineTo(14,-1);ctx.stroke();
    ctx.fillStyle=S.eyeCol;ctx.shadowColor=S.eyeCol;ctx.shadowBlur=12;circ(17,-1.5,4.5);ctx.fill();ctx.shadowBlur=0;ink(2);ctx.stroke();
    circ(4,0,3);fs(S.skin);ringOn(S,4,0);
  }
  ctx.restore();
}
// --- gear you can see: bow trims, rings, armour, cape, amulet
function bowTrim(bk,ex,ey,S){
  if(bk==='recurve'){for(const s of[-1,1]){ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(ex,s*ey);ctx.quadraticCurveTo(ex-1.5,s*(ey+4.5),ex+4.5,s*(ey+5));ctx.stroke();ctx.strokeStyle=S.bowCol;ctx.lineWidth=2.2;ctx.stroke()}
    ctx.strokeStyle='#6cc24a';ctx.lineWidth=3.4;ctx.beginPath();ctx.arc(-4,0,12,-.32,.32);ctx.stroke()}
  else if(bk==='thorn'){ink(1.3);ctx.fillStyle='#2f5a22';for(const q of[-.95,-.55,-.15,.25,.65,1.0]){ctx.beginPath();ctx.moveTo(-4+Math.cos(q-.09)*13,Math.sin(q-.09)*13);ctx.lineTo(-4+Math.cos(q+.05)*18,Math.sin(q+.05)*18);ctx.lineTo(-4+Math.cos(q+.12)*13,Math.sin(q+.12)*13);ctx.closePath();ctx.fill();ctx.stroke()}
    ctx.fillStyle='#b874e6';for(let i=0;i<5;i++){const a=i*TAU/5+G.t*.6;circ(ex+Math.cos(a)*2.3,-ey-1+Math.sin(a)*2.3,1.7);ctx.fill();ctx.stroke()}ctx.fillStyle='#ffe28a';circ(ex,-ey-1,1.2);ctx.fill()}
  else if(bk==='phoenix'){for(const s of[-1,1]){const fl=Math.sin(G.t*14+s*2)*1.6;ctx.fillStyle='#ffb020';ctx.beginPath();ctx.moveTo(ex-2.5,s*(ey-1));ctx.quadraticCurveTo(ex-7-fl,s*(ey+5),ex-2,s*(ey+10+fl));ctx.quadraticCurveTo(ex+4,s*(ey+4),ex+1.5,s*(ey-1));ctx.closePath();ink(1.4);ctx.fill();ctx.stroke();ctx.fillStyle='#fff1a8';circ(ex-1.6,s*(ey+3.5),1.3);ctx.fill()}
    ctx.strokeStyle='#ffd86b';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(-4,0,12,-.5,.5);ctx.stroke()}
  ink(2)}
function ringOn(S,x,y){const it=S.ring&&ITEM[S.ring];if(!it)return;ctx.save();ink(1.3);ctx.fillStyle=it.tint.a;circ(x+1.5,y+2.4,1.9);ctx.fill();ctx.stroke();ctx.fillStyle=it.tint.b;circ(x+1.5,y+2.4,1);ctx.fill();
  if(it.rar>=2){ctx.globalCompositeOperation='lighter';const b=.5+.5*Math.sin(G.t*5+x);glow(S.ring==='anello_gelo'?'160,220,255':S.ring==='anello_vento'?'150,240,240':'120,170,255',x+1.5,y+2.4,6,.35*b)}ctx.restore()}
function ringAura(S){const r=S.ring;if(r==='anello_vento'){ctx.save();ctx.lineCap='round';for(let i=0;i<2;i++){const a=G.t*5+i*Math.PI;ctx.strokeStyle=`rgba(190,245,255,${.5-i*.15})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,8,15,5,0,a,a+1.6);ctx.stroke()}ctx.restore()}
  else if(r==='anello_gelo'){ctx.save();ctx.strokeStyle='#d8f3ff';ctx.lineWidth=1.1;for(let i=0;i<3;i++){const ph=(G.t*.55+i/3)%1,x=Math.sin(i*2.3+G.t*1.3)*13,y=6-ph*30,al=Math.sin(ph*Math.PI);ctx.globalAlpha=al*.9;ctx.beginPath();for(let k=0;k<3;k++){const a=k*Math.PI/3+G.t;ctx.moveTo(x-Math.cos(a)*2.2,y-Math.sin(a)*2.2);ctx.lineTo(x+Math.cos(a)*2.2,y+Math.sin(a)*2.2)}ctx.stroke()}ctx.restore()}}
function cape(B,bw,w){const sw=Math.sin(G.t*3)*1.5+w*2;ink(2.2);ctx.beginPath();
  if(B.side){ctx.moveTo(-1,-11);ctx.quadraticCurveTo(-bw-5,-3,-bw-9+sw,11);ctx.lineTo(-bw-5+sw,9);ctx.lineTo(-bw-2+sw,12.5);ctx.quadraticCurveTo(-2,5,3,-9)}
  else{ctx.moveTo(-bw+1,-10);ctx.quadraticCurveTo(-bw-5,1,-bw-4+sw,12);ctx.lineTo(-bw*.45+sw,9.5);ctx.lineTo(sw,13.5);ctx.lineTo(bw*.45+sw,9.5);ctx.lineTo(bw+4+sw,12);ctx.quadraticCurveTo(bw+5,1,bw-1,-10)}
  ctx.closePath();ctx.fillStyle=vGrad(-bw-5,bw+5,'#6a54a0','#3a2c58','#241a3a');ctx.fill();ctx.stroke();
  ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const ph=(G.t*.7+i/3)%1;glow('140,90,230',(i-1)*bw*.7+sw,13-ph*10,4+ph*3,.28*(1-ph))}ctx.restore()}
function armorBits(S,B,bw,bodyPath){const v=B.v,A=S.armor;if(!A)return;ctx.save();
  if(A==='cotta'){ctx.save();bodyPath();ctx.clip();ctx.strokeStyle='rgba(20,26,34,.38)';ctx.lineWidth=1;for(let r=0;r<5;r++)for(let c=-4;c<=4;c++){ctx.beginPath();ctx.arc(c*3.2+(r%2)*1.6,-9+r*3,1.6,0,Math.PI);ctx.stroke()}ctx.restore();
    const pd=x=>{ink(2);ell(x,-8,4.6,3.4);ctx.fillStyle=vGrad(x-4,x+4,'#dfe4ea','#9aa3ad','#5d6872');ctx.fill();ctx.stroke()};if(B.side)pd(1);else{pd(-bw+1);pd(bw-1)}}
  else if(A==='giubba'&&!B.back){ctx.strokeStyle='rgba(27,22,18,.45)';ctx.lineWidth=1;ctx.setLineDash([1.6,1.6]);const cx=B.side?3:v==='s34'?1.5:0;ctx.beginPath();ctx.moveTo(cx,-8);ctx.lineTo(cx,4);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='rgba(27,22,18,.5)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(cx-4,-10);ctx.lineTo(cx,-6);ctx.lineTo(cx+4,-10);ctx.stroke();ctx.fillStyle='#d9b27a';for(const y of[-4,0])circ(cx+1.6,y,.9),ctx.fill()}
  else if(A==='corazza_muschio'){const moss=(x,y,k)=>{ink(1.6);ctx.fillStyle='#5f9e3c';for(let i=0;i<3;i++){circ(x+(i-1)*2.6*k,y-(i===1?1.4:0),2.8*k);ctx.fill();ctx.stroke()}ctx.fillStyle='#9fe06a';circ(x-1,y-1.6,1);ctx.fill();circ(x+2,y-.5,.8);ctx.fill()};
    if(B.side)moss(1,-9,1.1);else{moss(-bw+1,-9,1);moss(bw-1,-9,1)}
    if(!B.back){ctx.save();bodyPath();ctx.clip();ctx.fillStyle='rgba(95,158,60,.55)';ell(B.side?2:-2,2,5,3);ctx.fill();ctx.fillStyle='rgba(159,224,106,.7)';for(const[x,y]of[[-3,1],[0,3],[2,0]]){circ(x+(B.side?3:0),y,.9);ctx.fill()}ctx.restore()}
    ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.fillStyle='#7bd65a';const lf=(x,y,a)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(3,-3,6,0);ctx.quadraticCurveTo(3,3,0,0);ctx.fill();ctx.stroke();ctx.restore()};
    if(!B.side){lf(-bw-1,-11,-2.4+Math.sin(G.t*2)*.15);lf(bw+1,-11,-.7-Math.sin(G.t*2)*.15)}else lf(-1,-12,-2)}
  ctx.restore();ink(2.5)}
function amulet(S,B){const id=S.amu;if(!id||B.back)return;const v=B.v,px=B.side?3.5:v==='s34'?2:0,py=-4;ctx.save();
  ctx.strokeStyle='rgba(27,22,18,.75)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(px-(B.side?2:4.5),-10);ctx.lineTo(px,py-2.5);ctx.lineTo(px+(B.side?2:4.5),-10);ctx.stroke();ink(1.4);
  if(id==='amuleto_osso'){ctx.fillStyle='#efe8d6';ctx.beginPath();ctx.moveTo(px-2,py-2.5);ctx.quadraticCurveTo(px-2.4,py+2,px,py+4.5);ctx.quadraticCurveTo(px+2.4,py+2,px+2,py-2.5);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(id==='amuleto_luna'){ctx.globalCompositeOperation='lighter';glow('170,190,255',px,py+1,7,.35);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#e6ecff';ctx.beginPath();ctx.arc(px,py+1,3.2,.6,Math.PI*2-.6);ctx.arc(px+1.8,py+1,2.4,Math.PI*2-.9,.9,true);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(id==='amuleto_lame'){ctx.fillStyle='#dfe4ea';ctx.beginPath();ctx.moveTo(px,py-3);ctx.lineTo(px+2.4,py+1);ctx.lineTo(px,py+5);ctx.lineTo(px-2.4,py+1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(px-.4,py-1.5,.8,4)}
  else if(id==='cuore_drago'){const b=.5+.5*Math.sin(G.t*4);ctx.globalCompositeOperation='lighter';glow('255,60,50',px,py+1,8+b*3,.35+b*.25);ctx.globalCompositeOperation='source-over';ctx.fillStyle='#ffd86b';ell(px,py+1,3.6,4.2);ctx.fill();ctx.stroke();ctx.fillStyle=`rgb(${200+55*b|0},50,60)`;ell(px,py+1,2.2,2.8);ctx.fill();ctx.fillStyle='#fff';circ(px-.8,py,.7);ctx.fill()}
  ctx.restore();ink(2.5)}
function shieldPart(B,S){
  const v=B.v,sx=B.back?B.lx*-4-6:B.lx*11,sy=-4+(B.back?-2:B.ly*4),rx=v==='side'?3.5:v==='s'||v==='n'?9:7,dmg=S&&S.shDmg||0;
  ink(2.5);ell(sx,sy,rx,10);fs(B.back?'#6b4a2a':'#8a5a32');
  if(!B.back){ctx.strokeStyle='#9aa3ad';ctx.lineWidth=2;ell(sx,sy,rx-2,8);ctx.stroke();ink(2);circ(sx,sy,2.5);fs('#c9cfd6');
    if(dmg>0&&rx>4){ctx.strokeStyle=INK;ctx.lineWidth=1.3;ctx.lineCap='round';const n=Math.ceil(dmg*4);// cracks spread as the shield wears out
      for(let i=0;i<n;i++){const a=-1.9+i*1.25,r1=rx*.95;ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*2.5,sy+Math.sin(a)*3);ctx.lineTo(sx+Math.cos(a+.25)*r1*.55,sy+Math.sin(a+.25)*5.5);ctx.lineTo(sx+Math.cos(a-.1)*r1,sy+Math.sin(a-.1)*9.5);ctx.stroke()}ink(2)}}
  if(S&&S.shHit>0){ctx.fillStyle=`rgba(255,255,255,${S.shHit*3})`;ell(sx,sy,rx,10);ctx.fill()}
}
function eye(x,y,col,r){ctx.fillStyle=col;circ(x,y,r||1.7);ctx.fill()}
function head(S,B){
  if(S.bighood)return bigHood(S,B);
  const v=B.v,hy=-19,E=S.eyeCol||INK;ink(2.5);heroBits(S,B,hy,false);
  if(S.ears){ctx.fillStyle=S.skin;const ear=(s)=>{ctx.beginPath();ctx.moveTo(s*6,hy-2);ctx.lineTo(s*19,hy-8);ctx.lineTo(s*7,hy+4);ctx.closePath();ctx.fill();ctx.stroke()};
    if(B.side)ear(-1);else{ear(-1);ear(1)}}
  if(S.crown){ctx.strokeStyle=INK;ctx.lineWidth=5;const ant=(s)=>{ctx.beginPath();ctx.moveTo(s*4,hy-7);ctx.lineTo(s*9,hy-20);ctx.lineTo(s*15,hy-25);ctx.moveTo(s*8,hy-17);ctx.lineTo(s*3,hy-25);ctx.stroke()};
    ant(-1);ant(1);ctx.strokeStyle='#7a5a3a';ctx.lineWidth=2.5;ant(-1);ant(1);
    ctx.fillStyle=S.p2?'#ff8a3c':'#7bbf4a';for(const[s,x,y] of [[-1,15,-25],[1,15,-25],[-1,3,-25],[1,3,-25]]){circ(s*x,hy+y,2.4);ctx.fill()}ink(2.5)}
  circ(0,hy,10);fs(S.skull?S.skin:S.hood);
  if(S.skull){
    ctx.fillStyle=INK;
    if(v==='s'){ell(-3.5,hy+1,2.8,3.2);ctx.fill();ell(3.5,hy+1,2.8,3.2);ctx.fill();eye(-3.5,hy+1.5,E,1.2);eye(3.5,hy+1.5,E,1.2)}
    else if(v==='s34'){ell(0,hy+1,2.4,3);ctx.fill();ell(5.5,hy+1,2.6,3.2);ctx.fill();eye(5.5,hy+1.5,E,1.2);eye(0,hy+1.5,E,1)}
    else if(v==='side'){ell(5,hy+1,2.6,3.2);ctx.fill();eye(5.5,hy+1.5,E,1.2)}
    if(!B.back){ctx.strokeStyle=INK;ctx.lineWidth=1.5;const jx=v==='s'?0:v==='s34'?3:6;ctx.beginPath();ctx.moveTo(jx-4,hy+6);ctx.lineTo(jx+4,hy+6);for(let i=-3;i<=3;i+=2){ctx.moveTo(jx+i,hy+4.5);ctx.lineTo(jx+i,hy+7.5)}ctx.stroke()}
    else{ctx.strokeStyle='rgba(27,22,18,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-2,hy-7);ctx.lineTo(1,hy-2);ctx.lineTo(-1,hy+2);ctx.stroke()}
    ink(2.5);return}
  const glow=S.crown;if(glow){ctx.shadowColor=E;ctx.shadowBlur=8}
  if(v==='s'){ell(0,hy+2,7,6.5);fs(S.skin);eye(-3,hy+2,E);eye(3,hy+2,E)}
  else if(v==='s34'){ell(3,hy+2,6,6.3);fs(S.skin);eye(1,hy+2,E);eye(5.5,hy+2,E)}
  else if(v==='side'){ell(5,hy+2,4.5,6);fs(S.skin);eye(6.5,hy+1.5,E);ctx.fillStyle=S.skin;circ(9.6,hy+3.5,1.6);ctx.fill()}
  else if(v==='n34'){ell(8,hy+2,2,4.5);fs(S.skin)}
  ctx.shadowBlur=0;
  // hood tip: always on top of the head, leaning a little backwards (away from where the hero looks)
  if(S.hoodTip){const lean={s:0,s34:-2.5,side:-5,n34:-2.5,n:0}[v]||0;ctx.beginPath();ctx.moveTo(lean*.3-3.5,hy-8);ctx.lineTo(lean,hy-15);ctx.lineTo(lean*.3+3.5,hy-8);ctx.closePath();fs(S.hood)}
  heroBits(S,B,hy,true);
  if(mossOn&&!S.skull&&!S.ears)mossStick(B,hy);
}
// the Arciere's hood (from Denis's picture): bigger and rounder, with a soft point that falls back behind the head;
// the face stays the classic one, sitting in the dark opening of the hood. The same shape seen from every side
var RIGW={w:0,mv:false};
function bigHood(S,B){const v=B.v,hy=-19;ink(2.5);heroBits(S,B,hy,false);
  // the point: a wide flap of cloth falling back and down behind the head, away from where the hero looks
  const C0={s:[-15.5,-9],s34:[-18,-4],side:[-20,1],n34:[-17,-5],n:[-14,-9]}[v]||[-15.5,-9],R0=RIGW||{w:0,mv:false},sw=LOWFX?0:R0.mv?Math.sin(R0.w*2)*1.3:Math.sin(((G&&G.t)||0)*1.7)*.45,C=[C0[0]+sw*.7,C0[1]+Math.abs(sw)*.7];
  ctx.beginPath();ctx.moveTo(1.5,hy-12.8);ctx.quadraticCurveTo(-9,hy-19,C[0],hy+C[1]);ctx.quadraticCurveTo(-12,hy+C[1]*.35-1,-12.4,hy-2);ctx.closePath();fs(S.hood);
  ctx.save();ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-4,hy-13.2);ctx.quadraticCurveTo(-11,hy-14,C[0]*.85,hy+C[1]-1);ctx.stroke();ctx.restore();ink(2.5);
  // the hood itself, flaring a little over the shoulders
  const hood=()=>{ctx.beginPath();ctx.moveTo(-12,hy+6.5);ctx.bezierCurveTo(-14,hy-4.5,-9,hy-13.2,0,hy-13.2);ctx.bezierCurveTo(9,hy-13.2,14,hy-4.5,12,hy+6.5);ctx.quadraticCurveTo(0,hy+11,-12,hy+6.5);ctx.closePath()};
  hood();fs(S.hood);
  ctx.save();hood();ctx.clip();ctx.fillStyle='rgba(255,255,255,.15)';ell(-4.5,hy-8.5,7,3,-.45);ctx.fill();ctx.fillStyle='rgba(0,0,0,.17)';ell(8.5,hy+5.5,8.5,7);ctx.fill();ctx.restore();
  hood();ink(2.5);ctx.stroke();
  // the classic face, sitting in the dark opening of the hood
  const E=S.eyeCol||INK,rim=(x,rx,ry)=>{ell(x,hy+2,rx,ry);ctx.fillStyle='rgba(10,26,24,.9)';ctx.fill()};
  if(v==='s'){rim(0,8.4,7.9);ell(0,hy+2,7,6.5);fs(S.skin);eye(-3,hy+2,E);eye(3,hy+2,E)}
  else if(v==='s34'){rim(3,7.4,7.7);ell(3,hy+2,6,6.3);fs(S.skin);eye(1,hy+2,E);eye(5.5,hy+2,E)}
  else if(v==='side'){rim(5.2,5.8,7.4);ell(5,hy+2,4.5,6);fs(S.skin);eye(6.5,hy+1.5,E);ctx.fillStyle=S.skin;circ(9.6,hy+3.5,1.6);ctx.fill()}
  else if(v==='n34'){ell(8,hy+2,2,4.5);fs(S.skin)}
  else{ctx.strokeStyle='rgba(0,0,0,.26)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-1,hy-12.6);ctx.quadraticCurveTo(-2.5,hy-1,0,hy+9.5);ctx.stroke();ink(2.5)}
  heroBits(S,B,hy,true);
  if(mossOn)mossStick(B,hy)}
// the hero's trademark (home screen only): a small rolled stick of moss, always lit.
// mossOn is switched on only around the drawRig calls that should show it.
let mossOn=0;
function mossRect(x,y,w,hh,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,hh,r);else ctx.rect(x,y,w,hh)}
function mossStick(B,hy){const v=B.v,P={s:[2.2,6.4,.42],s34:[5.2,6.2,.36],side:[8.3,5.5,.3],n34:[9.2,5.3,.3]}[v],t=G.t,cyc=t%5.2,
  inh=cyc<1.1?Math.sin(cyc/1.1*Math.PI):0,pulse=.72+.12*Math.sin(t*3.1)+.55*inh;
  let tx,ty,mx=1.5,my=hy-3;
  if(P){const[ax,ay,a]=P,len=v==='n34'?3.4:5.6;mx=ax;my=hy+ay;tx=ax+Math.cos(a)*(len+.2);ty=my+Math.sin(a)*(len+.2);
    ctx.save();ctx.translate(ax,my);ctx.rotate(a);mossRect(-.5,-.95,len+.5,1.9,.9);ctx.fillStyle='#4f8a34';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#8fd14f';for(let i=0;i<3&&i*1.6+.5<len;i++)ctx.fillRect(.4+i*1.6,-.55+(i%2)*.45,.8,.55);ctx.restore()}
  else{tx=10.5;ty=hy+4;mx=10;my=hy+3}// seen from behind: only a glow peeking past the cheek
  ctx.save();ctx.globalCompositeOperation='lighter';glow('150,255,90',tx,ty,(P?4.5:3.5)*pulse,(P?.55:.35)*pulse);ctx.restore();
  if(P){ctx.fillStyle=inh>.3?'#f4ffc8':'#c9ff7a';circ(tx,ty,.95);ctx.fill()}
  for(let k=0;k<3;k++){const q=(t*.42+k/3)%1;ctx.fillStyle=`rgba(185,238,150,${(1-q)*.3})`;circ(tx+q*2+Math.sin(t*2.1+k*2)*1.6*q,ty-1.5-q*12,.55+q*2);ctx.fill()}
  // exhale after each drag
  if(cyc>1.2&&cyc<3.2){const e=(cyc-1.2)/2;for(let k=0;k<3;k++){const q=e*1.25-k*.14;if(q<=0||q>=1)continue;ctx.fillStyle=`rgba(190,240,160,${(1-q)*.34})`;circ(mx+2+q*7+Math.sin(q*5+k)*1.5,my-1-q*13,1.3+q*4.5);ctx.fill()}}}

