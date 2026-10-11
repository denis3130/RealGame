// ---------- creatures ----------
function drawSlime(e){
  const B=basis(e.face),r=e.r,x=e.x,y=e.y;
  shadow(x,y+r*.55,r*(1-e.z/40),r*.4*(1-e.z/40));
  ctx.save();ctx.translate(x,y-e.z);ink(2.5);
  const s=e.jump>0?0:Math.sin(e.t*6)*.06,sx=e.jump>0?.9:1+s,sy=e.jump>0?1.12:1-s;
  ell(0,-r*.2,r*1.08*sx,r*.92*sy);fs(e.slow>0?'#9fd6d6':ECOL[e.type]);
  ctx.fillStyle='rgba(255,255,255,.4)';ell(-r*.35,-r*.6,r*.25,r*.15);ctx.fill();
  if(B.v!=='n'&&B.v!=='n34'){const cx=Math.cos(B.qa)*r*.42,cy=Math.sin(B.qa)*r*.18-r*.25,sp=B.side?r*.2:r*.32;
    for(const k of B.side?[0]:[-1,1]){ctx.fillStyle='#fff';circ(cx+k*sp,cy,r*.22);ctx.fill();ctx.fillStyle=INK;circ(cx+k*sp+Math.cos(B.qa)*r*.07,cy+Math.sin(B.qa)*r*.06,r*.11);ctx.fill()}
    if(!B.side){ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy+r*.3,r*.15,.2,Math.PI-.2);ctx.stroke()}}
  else{ctx.fillStyle='rgba(0,0,0,.12)';ell(0,-r*.1,r*.6,r*.4);ctx.fill()}
  if(e.type==='magmaslime'){ctx.fillStyle='#3d3430';ell(-r*.45,-r*.72,r*.3,r*.14,.3);ctx.fill();ell(r*.5,-r*.55,r*.22,r*.12,-.4);ctx.fill();ell(r*.05,-r*.95,r*.2,r*.1);ctx.fill();
    ctx.strokeStyle='#ffe08a';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-r*.7,-r*.3);ctx.lineTo(-r*.45,-r*.1);ctx.moveTo(r*.6,-r*.2);ctx.lineTo(r*.75,0);ctx.stroke()}
  ctx.restore();if(e.type==='magmaslime')glow('255,120,40',x,y-e.z-r*.2,r*2.2,.28);
}
function drawBat(e){
  const B=basis(e.face),x=e.x,y=e.y-14+Math.sin(e.t*5)*3,fl=Math.sin(e.t*22)*6;
  shadow(e.x,e.y+6,10,4,.25);ctx.save();ctx.translate(x,y);ink(2.5);
  ctx.fillStyle=B.back?'#4a2f70':'#5b3a87';
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*6,-2);ctx.lineTo(s*21,-8+fl);ctx.lineTo(s*17,3);ctx.lineTo(s*12,-1);ctx.lineTo(s*8,5);ctx.closePath();ctx.fill();ctx.stroke()}
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*3,-7);ctx.lineTo(s*7,-15);ctx.lineTo(s*8,-5);ctx.closePath();fs('#8a5bc4')}
  circ(0,0,e.r);fs(e.slow>0?'#a0a8d8':B.back?'#74489f':'#8a5bc4');
  if(!B.back){const cx=Math.cos(B.qa)*4,cy=Math.sin(B.qa)*1.5,sp=B.side?0:3.5;
    for(const k of B.side?[1]:[-1,1]){ctx.fillStyle='#ffc93c';circ(cx+k*sp,cy-1,2.3);ctx.fill()}
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(cx-2,cy+4);ctx.lineTo(cx-1,cy+7);ctx.lineTo(cx,cy+4);ctx.moveTo(cx+1,cy+4);ctx.lineTo(cx+2,cy+7);ctx.lineTo(cx+3,cy+4);ctx.fill()}

  ctx.restore();
}
function drawPlant(e){
  const B=basis(e.face),x=e.x,y=e.y,sw=e.cd<.4?1.15:1;shadow(x,y+8,16,5);
  ctx.save();ctx.translate(x,y);ink(2.5);
  ctx.fillStyle='#4f8a34';for(const s of [-1,1]){ell(s*13,5,10,5,s*.4);ctx.fill();ctx.stroke()}
  ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,6);ctx.quadraticCurveTo(-3,-4,0,-12);ctx.stroke();ctx.strokeStyle='#5f9e3c';ctx.lineWidth=3;ctx.stroke();ink(2.5);
  ctx.translate(0,-16);ctx.scale(sw,sw);
  const cx=Math.cos(B.qa)*4,cy=Math.sin(B.qa)*3;
  for(let i=0;i<7;i++){const a=i/7*TAU+e.t*.3;ell(Math.cos(a)*10-cx*.4,Math.sin(a)*9-cy*.4,7,5,a);fs(B.back?'#a8467f':'#d65ba8')}
  if(!B.back){circ(cx,cy,8);fs('#f2d36b');ctx.fillStyle='#5a1f2e';ell(cx+Math.cos(B.qa)*2,cy+Math.sin(B.qa)*2+1,4.5,e.cd<.4?4:2.5);ctx.fill();
    ctx.fillStyle='#fff';for(const k of [-2,0,2]){ctx.beginPath();ctx.moveTo(cx+k-1,cy-1);ctx.lineTo(cx+k,cy+1.5);ctx.lineTo(cx+k+1,cy-1);ctx.fill()}}
  else{circ(-cx*.3,-cy*.3,7);fs('#4f8a34')}

  ctx.restore();
}
function drawMushroom(e){
  const B=basis(e.face),x=e.x,y=e.y,w=e.moving?Math.sin(e.walk):0,bob=e.moving?Math.abs(w)*1.5:0,sw=e.puff>0?1+(.6-e.puff)*.35:1;
  shadow(x,y+8,14,5);ctx.save();ctx.translate(x,y-bob);ctx.scale(B.f,1);ink(2.5);
  if(B.side){circ(w*4,7,3.4);fs('#c9b89a');circ(-w*4,7,3.4);fs('#b3a283')}else{circ(-5,7+w*1.5,3.4);fs('#c9b89a');circ(5,7-w*1.5,3.4);fs('#c9b89a')}
  ctx.beginPath();ctx.ellipse(0,-3,B.side?7:9,10,0,0,TAU);fs('#ece0c6');
  if(!B.back){const fx=B.v==='s'?0:B.v==='s34'?3:5;
    if(B.side)eye(fx+1,-4,INK,1.7);else{eye(fx-3,-4,INK,1.7);eye(fx+3,-4,INK,1.7)}
    ctx.fillStyle='#c0807a';if(!B.side){circ(fx-5,-1,1.6);ctx.fill();circ(fx+5,-1,1.6);ctx.fill()}
    ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(fx,0,2,.2,Math.PI-.2);ctx.stroke();ink(2.5)}
  ctx.save();ctx.translate(0,-12);ctx.scale(sw,sw);
  ctx.beginPath();ctx.moveTo(-17,2);ctx.quadraticCurveTo(-16,-17,0,-17);ctx.quadraticCurveTo(16,-17,17,2);ctx.quadraticCurveTo(0,6,-17,2);ctx.closePath();fs(e.slow>0?'#a8a0d8':'#9a5bc8');
  ctx.fillStyle='#efe4f7';const off=B.side?-3:B.back?0:2;for(const[sx,sy,sr] of [[-9,-8,3],[1,-12,3.6],[9,-6,2.6],[-2,-4,2]]){circ(sx+off,sy,sr);ctx.fill()}
  ctx.restore();

  ctx.restore();
}
function drawWisp(e){
  const B=basis(e.face),x=e.x,y=e.y-14+Math.sin(e.t*3)*3;
  if(e.ph==='tele')return;
  if(e.alpha<=.02)return;
  ctx.globalAlpha=Math.max(0,Math.min(1,e.alpha));shadow(e.x,e.y+6,9,3.5,.2);
  ctx.save();ctx.translate(x,y);ink(2.5);
  const sw=Math.sin(e.t*7)*3;
  ctx.beginPath();ctx.moveTo(0,10);ctx.bezierCurveTo(-13,10,-12,-6,-3+sw*.3,-12);ctx.quadraticCurveTo(sw,-22,2+sw,-24);ctx.quadraticCurveTo(4,-14,8,-10);ctx.bezierCurveTo(13,-4,12,10,0,10);ctx.closePath();
  const g=ctx.createLinearGradient(0,-24,0,10);g.addColorStop(0,'#c7b3f2');g.addColorStop(1,'#7fd3f0');ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.55)';ell(-4,-4,3,5);ctx.fill();
  if(!B.back){const cx=Math.cos(B.qa)*4,cy=Math.sin(B.qa)*2,sp=B.side?0:3.5;for(const k of B.side?[1]:[-1,1]){ctx.fillStyle='#2a1f4a';ell(cx+k*sp,cy-1,1.8,2.8);ctx.fill()}}

  ctx.restore();ctx.globalAlpha=1;
}
function drawBeetle(e){
  const qa=Q8(e.face)*Math.PI/4,x=e.x,y=e.y,armed=e.arm>0,blink=armed&&Math.floor(e.arm*14)%2===0;

  shadow(x,y+5,14,6);ctx.save();ctx.translate(x,y-2);ctx.rotate(qa);ink(2);
  const sc=armed?1+(.75-e.arm)*.25:1;ctx.scale(sc,sc);
  const w=e.moving?Math.sin(e.walk):0;ctx.strokeStyle=INK;ctx.lineWidth=2.2;
  for(const s of [-1,1])for(let i=-1;i<=1;i++){const lw=(i%2===0?w:-w)*3*s;ctx.beginPath();ctx.moveTo(i*5,s*6);ctx.lineTo(i*5+lw+2,s*13);ctx.stroke()}
  ink(2.5);circ(11,0,5);fs('#3a2a24');ctx.fillStyle='#ffc93c';circ(13,-2.5,1.2);ctx.fill();circ(13,2.5,1.2);ctx.fill();
  ell(-1,0,12,9);fs(blink?'#fff2d0':e.slow>0?'#8fb4c8':'#e0662a');
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(9,0);ctx.stroke();
  ctx.fillStyle='#3a2a24';for(const[sx,sy] of [[-5,-4.5],[1,-5],[-5,4.5],[1,5]]){circ(sx,sy,1.8);ctx.fill()}
  ctx.strokeStyle='#6b4a2a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,0);ctx.quadraticCurveTo(-17,-3,-18,-7);ctx.stroke();
  ctx.fillStyle=Math.sin(G.t*30)>0?'#ffd86b':'#ff8a3c';circ(-18,-7,2.4);ctx.fill();

  ctx.restore();
}
function drawGolem(e){
  const B=basis(e.face),v=B.v,x=e.x,y=e.y,stone=e.p2?'#6e655c':'#7d7568',dark=e.p2?'#544c45':'#625b50',accent=e.p2?'#ff7a2e':'#6fa040',eyeC=e.p2?'#ff5a3d':'#7fe0f0';
  const sz=1-Math.min(.5,e.z/200);shadow(x,y+6,40*sz,13*sz,.4);


  ctx.save();ctx.translate(x,y-e.z);
  if(e.st==='roll'&&(e.sub==='roll'||e.sub==='c'&&e.stT>.25)){
    ink(3);circ(0,-26,32);fs(stone);ctx.save();ctx.translate(0,-26);ctx.rotate(e.spin);
    ctx.strokeStyle=dark;ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,22-i*7,i,i+2.2);ctx.stroke()}
    ctx.fillStyle=accent;ell(12,-14,8,4,.6);ctx.fill();ell(-14,10,6,3,-.4);ctx.fill();ctx.restore();
  
    ctx.restore();return}
  ctx.scale(B.f,1);ink(3);
  const w=e.moving?Math.sin(e.walk):0,crouch=(e.st==='leap'&&e.sub==='a')||(e.st==='roll'&&e.sub==='a')?7:0,armUp=e.st==='throw'&&e.sub==='a';
  const fist=(fx,fy,r)=>{circ(fx,fy,r);fs(stone);ctx.fillStyle='rgba(0,0,0,.2)';circ(fx+2,fy+3,r*.55);ctx.fill();ink(3)};
  if(B.side){ell(-w*9,2,9,7);fs(dark);ell(w*9,2,9,7);fs(dark)}else{ell(-14,2+w*3,10,7);fs(dark);ell(14,2-w*3,10,7);fs(dark)}
  if(B.side)fist(-21,-16+crouch,11);
  if(B.back){circ(v==='n'?0:-5,-50+crouch,12);fs(stone)}
  ell(0,-25+crouch,B.side?24:31,25-crouch*.5);fs(stone);
  ctx.fillStyle=accent;if(e.p2){ctx.shadowColor=accent;ctx.shadowBlur=10}
  ell(-14,-44+crouch,10,5,-.2);ctx.fill();ell(13,-46+crouch,9,4,.2);ctx.fill();
  if(!B.back){ctx.strokeStyle=accent;ctx.lineWidth=2.5;const rx=v==='s'?0:v==='s34'?6:10;ctx.beginPath();ctx.moveTo(rx-6,-22+crouch);ctx.lineTo(rx,-30+crouch);ctx.lineTo(rx+6,-22+crouch);ctx.lineTo(rx,-14+crouch);ctx.closePath();ctx.stroke()}
  else{ctx.strokeStyle=e.p2?accent:'rgba(0,0,0,.3)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-10,-34+crouch);ctx.lineTo(-2,-24+crouch);ctx.lineTo(-8,-12+crouch);ctx.moveTo(8,-38+crouch);ctx.lineTo(12,-26+crouch);ctx.stroke()}
  ctx.shadowBlur=0;ink(3);
  if(!B.back){const hx=v==='s'?0:v==='s34'?7:12,hy=-48+crouch;circ(hx,hy,12);fs(stone);
    ctx.fillStyle=eyeC;ctx.shadowColor=eyeC;ctx.shadowBlur=10;
    if(v==='s'){ell(hx-5,hy+1,3,2);ctx.fill();ell(hx+5,hy+1,3,2);ctx.fill()}else if(v==='s34'){ell(hx-2,hy+1,2.6,2);ctx.fill();ell(hx+6,hy+1,3,2);ctx.fill()}else{ell(hx+7,hy+1,3,2);ctx.fill()}
    ctx.shadowBlur=0;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(hx-9+(B.side?6:0),hy-4);ctx.lineTo(hx+9,hy-4);ctx.stroke();ink(3)}
  if(armUp){fist(B.side?6:26,-66,12);ink(3);circ(B.side?6:26,-82,11);fs('#857b6c');if(!B.side)fist(-33,-16+crouch,12)}
  else if(B.side)fist(22,-12+crouch,12);else{fist(-33,-16+crouch,12);fist(33,-16+crouch,12)}

  ctx.restore();
}
function drawWitch(e){

  const a=e.hidden?.12:1;ctx.globalAlpha=a;
  const aura=ctx.createRadialGradient(e.x,e.y-20,4,e.x,e.y-20,48);aura.addColorStop(0,e.p2?'rgba(255,138,60,.3)':'rgba(123,240,192,.25)');aura.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=aura;circ(e.x,e.y-20,48);ctx.fill();
  drawRig(e.x,e.y,e.face,e.walk,e.moving,{...WITCH,p2:e.p2},{});

  ctx.globalAlpha=1;
  if(e.p2&&!e.hidden)for(let i=0;i<4;i++){const an=e.orb+i*TAU/4,tx=e.x+Math.cos(an)*60,ty=e.y-12+Math.sin(an)*60;
    ctx.save();ctx.translate(tx,ty);ctx.rotate(an+Math.PI/2);ink(2);ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(5,4);ctx.lineTo(-5,4);ctx.closePath();fs('#4f8a34');ctx.restore()}
}
// ground layer: every warning that is painted on the floor, drawn under obstacles and characters
function drawTelegraphs(){
  for(const e of G.enemies){const x=e.x,y=e.y;drawEliteAura(e);if(ETELE[e.type]&&!(e.spawn>0))ETELE[e.type](e);
    if(e.spawn>0){const p=e.spawn/.8;ctx.strokeStyle=`rgba(229,72,77,${.4+.4*Math.sin(G.t*20)})`;ctx.lineWidth=3;circ(x,y,e.r+8*p);ctx.stroke();ctx.fillStyle='rgba(229,72,77,.18)';circ(x,y,e.r);ctx.fill()}
    if(e.type==='goblin'&&e.aim>0){ctx.strokeStyle=`rgba(229,72,77,${e.aim>.25?.35:.8})`;ctx.lineWidth=e.aim>.25?2:3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+Math.cos(e.aimA)*420,y-8+Math.sin(e.aimA)*420);ctx.stroke();ctx.setLineDash([])}
    if(e.xWarn>0){const p=1-e.xWarn/.7;ctx.strokeStyle=`rgba(255,120,200,${.45+.4*Math.sin(G.t*30)})`;ctx.lineWidth=4;circ(x,y,e.r+6+p*16);ctx.stroke()}
    if(e.type==='skeleton'&&e.wind>0){ctx.strokeStyle='rgba(255,230,160,.7)';ctx.lineWidth=2.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(e.la)*60,y+Math.sin(e.la)*60);ctx.stroke();ctx.setLineDash([])}
    if(e.type==='wisp'){if(e.ph==='tele'){const p=1-e.phT/.55;ctx.strokeStyle=`rgba(138,91,196,${.4+.4*Math.sin(G.t*25)})`;ctx.lineWidth=3;circ(e.tx,e.ty,20-p*8);ctx.stroke();ctx.fillStyle='rgba(138,91,196,.2)';circ(e.tx,e.ty,10);ctx.fill()}}
    if(e.type==='beetle'){const armed=e.arm>0,blink=armed&&Math.floor(e.arm*14)%2===0;if(armed){ctx.strokeStyle=`rgba(229,72,77,${blink?.8:.35})`;ctx.lineWidth=2.5;ctx.setLineDash([5,5]);circ(x,y,e.elite?72:52);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(229,72,77,.12)';circ(x,y,e.elite?72:52);ctx.fill()}}
    if(e.type==='golem'){if(e.st==='leap'&&e.sub==='air'){const p=1-e.stT/.9;ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=3;circ(e.tx,e.ty,e.r+16);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.1+p*.25})`;circ(e.tx,e.ty,(e.r+16)*p);ctx.fill()}if(e.st==='roll'&&e.sub==='a'){ctx.save();ctx.translate(x,y);ctx.rotate(e.ra);ctx.fillStyle='rgba(229,72,77,.22)';ctx.fillRect(0,-e.r,340,e.r*2);ctx.restore()}}
    if(e.type==='mimic'&&e.st==='chomp'&&e.sub==='a'){ctx.save();ctx.translate(x,y);ctx.rotate(e.ca);ctx.fillStyle=`rgba(229,72,77,${.15+.12*Math.sin(G.t*22)})`;ctx.fillRect(0,-20,150,40);ctx.strokeStyle='rgba(229,72,77,.75)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-20,150,40);ctx.setLineDash([]);ctx.restore()}
    if(e.type==='obsidian'&&e.wind>0){ctx.save();ctx.translate(x,y);ctx.rotate(e.ca);ctx.fillStyle=`rgba(255,110,40,${.14+.12*Math.sin(G.t*22)})`;ctx.fillRect(0,-e.r,180,e.r*2);ctx.strokeStyle='rgba(255,140,60,.7)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-e.r,180,e.r*2);ctx.setLineDash([]);ctx.restore()}
    if(e.type==='salamander'&&e.st==='burrow'&&e.sub==='under'){const p=1-e.stT/.9;ctx.strokeStyle=`rgba(255,110,40,${.5+.4*Math.sin(G.t*25)})`;ctx.lineWidth=3;circ(e.tx,e.ty,46);ctx.stroke();ctx.fillStyle=`rgba(255,90,30,${.1+p*.3})`;circ(e.tx,e.ty,46*p);ctx.fill()}
    if(e.type==='smith'&&e.st==='slam'&&e.sub==='a'){const p=1-e.stT/.85;ctx.strokeStyle='rgba(255,110,40,.8)';ctx.lineWidth=3;circ(e.sx,e.sy,62);ctx.stroke();ctx.fillStyle=`rgba(255,90,30,${.1+p*.3})`;circ(e.sx,e.sy,62*p);ctx.fill()}
    if(e.type==='witch'){if(e.hidden&&e.sub==='b'){const p=1-e.stT/.55;ctx.strokeStyle=`rgba(123,240,192,${.4+.4*Math.sin(G.t*25)})`;ctx.lineWidth=3;circ(e.x,e.y,30-p*12);ctx.stroke()}}
  }
}
function drawEnemy(e){if(e.spawn>0)return;
  if(e.intro>0&&e.type==='golem'&&e.z>0){const k=Math.max(0,Math.min(1,(e.iT||0)/1.15)),R=e.r*(.4+1.1*k);
    ctx.save();ctx.fillStyle=`rgba(0,0,0,${.15+.4*k})`;ctx.beginPath();ctx.ellipse(e.x,e.y+4,R*1.2,R*.45,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(255,90,70,${(.35+.35*Math.sin(G.t*14))*(1-k*.3)})`;ctx.lineWidth=2.5;ctx.setLineDash([7,6]);ctx.beginPath();ctx.ellipse(e.x,e.y+4,e.r*1.7,e.r*.65,0,0,TAU);ctx.stroke();ctx.restore();
    if(e.z>700)return}
  if(e.intro>0&&e.hole>0&&e.em!=null){const k=e.hole*(e.em>=1?Math.max(0,1-(e.iT-1.8)*2):1);if(k>0){ctx.save();
    const glowC=e.type==='salamander'?'255,120,40':'123,240,192';ctx.globalCompositeOperation='lighter';glow(glowC,e.x,e.y,e.r*2*k,.45*k);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#0d0a08';ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<12;i++){const a=i/12*TAU,rr=e.r*1.25*k*(.85+.2*Math.sin(i*2.7));i?ctx.lineTo(e.x+Math.cos(a)*rr,e.y+2+Math.sin(a)*rr*.42):ctx.moveTo(e.x+Math.cos(a)*rr,e.y+2+Math.sin(a)*rr*.42)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}}
  const em=e.intro>0&&e.em!=null?e.em:1,fa=e.intro>0&&e.fa!=null?e.fa:1;if(em>=1&&fa>=1){drawEnemy0(e);return}
  ctx.save();if(em<1){ctx.beginPath();ctx.rect(e.x-300,e.y-500,600,500+10);ctx.clip();ctx.translate(0,(1-em)*e.r*3.6)}ctx.globalAlpha=fa;drawEnemy0(e);ctx.restore();ctx.globalAlpha=1}
function drawEnemy0(e){
  const x=e.x,y=e.y;
  if(e.spawn>0)return;


  if(e.poisonT>0){for(let q=0;q<Math.min(3,e.poisonS);q++){const qq=(G.t*.9+q*.33)%1;ctx.fillStyle=`rgba(150,230,90,${.8*(1-qq)})`;circ(x+Math.sin(q*2.3+G.t*2)*e.r*.6,y-e.r*1.6-e.z-qq*14,2.2);ctx.fill()}}
  if(e.burn>0){ctx.fillStyle='rgba(255,138,60,.6)';circ(x+rand(-5,5),y-e.r*2-e.z+rand(-3,3),3);ctx.fill()}
  const hf=e.flash>0;if(hf){ctx.save();ctx.translate(Math.sin(G.t*130)*2.2,0);if(HASF)ctx.filter='brightness(1.85) saturate(.6)'}
  const esc=(e.elite||G.giant&&!isBoss(e.type))&&!e.type.includes('slime');if(esc){ctx.save();ctx.translate(x,y);ctx.scale(1.22,1.22);ctx.translate(-x,-y)}
  switch(e.type){
    case 'slime':case 'bigslime':case 'magmaslime':drawSlime(e);break;
    case 'imp':drawImp(e);break;
    case 'obsidian':drawObsidian(e);break;
    case 'pyro':drawPyro(e);break;
    case 'salamander':drawSalamander(e);break;
    case 'smith':drawSmith(e);break;
    case 'eyeflower':drawEyeflower(e);break;
    case 'shadoweye':drawShadoweye(e);break;
    case 'mimic':drawMimic(e);break;
    case 'bat':drawBat(e);break;
    case 'plant':drawPlant(e);break;
    case 'mushroom':drawMushroom(e);break;
    case 'wisp':drawWisp(e);break;
    case 'beetle':drawBeetle(e);break;
    case 'golem':drawGolem(e);break;
    case 'witch':drawWitch(e);break;
    case 'goblin':drawRig(x,y,e.face,e.walk,e.moving,e.slow>0?{...GOBLIN,skin:'#a8d8c0'}:GOBLIN,{pull:e.aim>0&&e.aim<.6?5:0});break;
    case 'skeleton':{const sh=skShield(e);if(e.shHit>0)e.shHit=Math.max(0,e.shHit-1/60);const S=sh<=0?SKEL_NS:sh<e.shMax||e.shHit>0?{...SKEL,shDmg:1-sh/e.shMax,shHit:e.shHit}:SKEL;
      drawRig(x+(e.stun>0?Math.sin(G.t*40)*1.5:0),y,e.face,e.walk,e.moving,S,{pull:e.aim>0?5:0});break}
    default:if(EDRAW[e.type])EDRAW[e.type](e);
  }
  if(esc)ctx.restore();
  if(hf)ctx.restore();
  if(e.root>0)drawRoots(e);
  if(e.frozen>0)drawFrozen(e);
}
function shadowFor(e){
  const x=e.x,y=e.y;
  switch(e.type){
    case 'imp':shadow(x,y+6,9,3.5,.22);break;
    case 'obsidian':shadow(x,y+5,17,6.5);break;
    case 'pyro':shadow(x,y+8,13,5);break;
    case 'salamander':if(!(e.st==='burrow'&&e.sub==='under'))shadow(x,y+2,30,11,.36);break;
    case 'smith':shadow(x,y+15,26,9.5,.4);break;
    case 'eyeflower':shadow(x,y+7,16,5);break;
    case 'shadoweye':shadow(x,y+6,11,4,.22);break;
    case 'mimic':shadow(x,y+16,32*(1-e.z/90),10,.38);break;
    case 'slime':case 'bigslime':case 'magmaslime':shadow(x,y+e.r*.55,e.r*(1-e.z/40),e.r*.4*(1-e.z/40));break;
    case 'bat':shadow(x,y+6,10,4,.25);break;
    case 'plant':shadow(x,y+8,16,5);break;
    case 'mushroom':shadow(x,y+8,14,5);break;
    case 'wisp':if(e.ph!=='tele'&&e.alpha>.05)shadow(x,y+6,9,3.5,.2*e.alpha);break;
    case 'beetle':shadow(x,y+5,14,6);break;
    case 'golem':{const sz=1-Math.min(.5,e.z/200);shadow(x,y+6,40*sz,13*sz,.4);break}
    case 'witch':if(!e.hidden)shadow(x,y+11,17,6.5,.22);break;
    case 'goblin':shadow(x,y+7.6,12.4,4.8);break;
    case 'skeleton':shadow(x,y+8,13,5);break;
    default:if(ESHADOW[e.type])ESHADOW[e.type](e);
  }
}
function drawBars(){
  for(const e of G.enemies){if(e.type!=='skeleton'||e.hidden||e.spawn>0||e.dead||!(e.sh>0||e.sh==null))continue;const mx=skShield(e),sh=e.sh;
    const hpOn=e.hp<e.max||e.elite,w=Math.max(22,e.r*2)*(e.elite?1.3:1),hy=e.y-e.r*2-e.z-14-(hpOn?7:0),jit=e.shHit>0?Math.sin(G.t*90)*1.5:0,x0=e.x-w/2+5+jit,ww=w-5,seg=ww/mx;
    ctx.fillStyle=INK;ctx.fillRect(x0-1,hy,ww+2,5);for(let i=0;i<mx;i++){ctx.fillStyle=i<sh?(e.shHit>0&&i===sh-1?'#ffffff':'#c9cfd6'):'rgba(201,207,214,.22)';ctx.fillRect(x0+i*seg+.5,hy+1,seg-1,3)}
    ink(1.5);ctx.beginPath();ctx.moveTo(x0-9,hy-1.5);ctx.lineTo(x0-2,hy-1.5);ctx.lineTo(x0-2,hy+3);ctx.quadraticCurveTo(x0-5.5,hy+7.5,x0-5.5,hy+7.5);ctx.quadraticCurveTo(x0-9,hy+5,x0-9,hy+3);ctx.closePath();fs('#8a5a32');ctx.fillStyle='#c9cfd6';ctx.fillRect(x0-6.3,hy-.5,1.6,5)}
  for(const e of G.enemies){if(isBoss(e.type)||(e.hp>=e.max&&!e.elite)||e.hidden||e.spawn>0||G.dark&&Math.hypot(e.x-P.x,e.y-P.y)>105)continue;
    const w=Math.max(22,e.r*2)*(e.elite?1.3:1),hy=e.y-e.r*2-e.z-14-(e.type==='bat'||e.type==='wisp'||e.type==='mosquito'||e.type==='snowspirit'?12:0);ctx.fillStyle=INK;ctx.fillRect(e.x-w/2-1,hy,w+2,5);ctx.fillStyle=e.elite?'#ffc93c':'#e5484d';ctx.fillRect(e.x-w/2,hy+1,w*Math.max(0,e.hp/e.max),3);if(e.elite){ctx.font='12px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('★',e.x-w/2-7,hy+6);ctx.fillStyle='#ffc93c';ctx.fillText('★',e.x-w/2-7,hy+6)}}
  if(INTRO.on)return;const x=P.x,y=P.y,w=34,pct=P.hp/P.maxhp;ctx.fillStyle=INK;ctx.fillRect(x-w/2-2,y-48,w+4,8);ctx.fillStyle='#3a2a24';ctx.fillRect(x-w/2,y-46,w,4);
  {const tp=Math.min(1,(P.hpTrail==null?P.hp:P.hpTrail)/P.maxhp);if(tp>pct){ctx.fillStyle='#fff';ctx.fillRect(x-w/2,y-46,w*tp,4)}}ctx.fillStyle=pct>.35?'#7bbf4a':'#e5484d';ctx.fillRect(x-w/2,y-46,w*pct,4);
  ctx.font='11px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText(Math.ceil(P.hp),x,y-51);ctx.fillStyle='#fff';ctx.fillText(Math.ceil(P.hp),x,y-51);
}
function drawHero(){
  if(G.state==='dead'&&G.deathT!=null){drawFallenHero();return}
  const x=P.x,y=P.y;
  if(P.inv>0&&P.dashT<=0&&Math.floor(G.t*20)%2)ctx.globalAlpha=.45;
  const pull=P.aiming?(P.fireCd>0?clamp(1-P.fireCd*P.aspd,0,1)*5:5):0;
  if(INTRO.on&&INTRO.stick)mossOn=1;drawRig(x,y,P.face,P.walk,P.moving,P.style||HERO,{pull});mossOn=0;
  ctx.globalAlpha=1;
  if(P.shield&&P.shCd<=0){const pu=.5+.5*Math.sin(G.t*3);ctx.strokeStyle=`rgba(150,230,120,${.35+.2*pu})`;ctx.lineWidth=2;ell(x,y-10,20,23);ctx.stroke();ctx.fillStyle='rgba(150,230,120,.07)';ctx.fill()}
}

