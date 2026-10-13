// =====================================================================
// MENU BACKDROP (the pages behind the boards: Eroi, Armeria, Compagni, Bottega…). Since the 13 October preview (punto 42 del piano: no
// more giant skull or ribs) each mode has its own: the Classic one is a sky at dusk over floating islands far away, soft clouds and little
// lights of the arena's colour rising; the Zombie one is a night of fog over a dead wood and a broken fence, a pale moon, ash drifting down.
// The picture is painted once (MBG.st), the lights move live; with LOWFX it stays still.
// =====================================================================
const MBG={t:0,st:null,key:'',drawn:false,motes:[]};
function mbgIsland(x,cx,cy,w,top,bot,rim){x.beginPath();x.moveTo(cx-w,cy);x.quadraticCurveTo(cx-w*.6,cy-top,cx,cy-top*1.1);x.quadraticCurveTo(cx+w*.6,cy-top,cx+w,cy);
  x.quadraticCurveTo(cx+w*.5,cy+bot*.4,cx+w*.15,cy+bot);x.quadraticCurveTo(cx,cy+bot*1.3,cx-w*.2,cy+bot*.9);x.quadraticCurveTo(cx-w*.6,cy+bot*.5,cx-w,cy);x.closePath();x.fill();
  x.strokeStyle=rim;x.lineWidth=1.5;x.beginPath();x.moveTo(cx-w*.9,cy-top*.25);x.quadraticCurveTo(cx-w*.5,cy-top,cx,cy-top*1.08);x.stroke()}
function drawMenuBg(dt){const cvb=$('mbgCv');if(!cvb||!cvb.clientWidth)return;const dpr=Math.min(2,window.devicePixelRatio||1),W=cvb.clientWidth,H=cvb.clientHeight;
  if(cvb.width!==Math.round(W*dpr)||cvb.height!==Math.round(H*dpr)){cvb.width=Math.round(W*dpr);cvb.height=Math.round(H*dpr)}
  const z=typeof zMode==='function'&&zMode(),m=curMode(),rgb=z?'150,230,110':(m.glow||'120,220,90'),key=W+'x'+H+'|'+rgb+'|'+z;MBG.t+=dt;const t=MBG.t,c=cvb.getContext('2d');
  if(MBG.key!==key){MBG.key=key;const st=document.createElement('canvas');st.width=cvb.width;st.height=cvb.height;const x=st.getContext('2d');x.scale(dpr,dpr);MBG.st=st;x.lineJoin='round';x.lineCap='round';
    let s0=7;const R=()=>{s0=(s0*16807)%2147483647;return(s0-1)/2147483646};
    if(!z){// the Classic: a sky at dusk, far floating islands with little trees and waterfalls, clouds lit from below
      let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1d2a5c');g.addColorStop(.5,'#4a3f7a');g.addColorStop(.85,'#a8687a');g.addColorStop(1,'#d88a6a');x.fillStyle=g;x.fillRect(0,0,W,H);
      g=x.createRadialGradient(W/2,H*.9,0,W/2,H*.9,W*.9);g.addColorStop(0,'rgba(255,200,140,.35)');g.addColorStop(1,'rgba(255,200,140,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
      for(let i=0;i<70;i++){x.fillStyle=`rgba(255,250,235,${(.2+R()*.5)*(1-i/90)})`;x.fillRect(R()*W,R()*H*.5,1.2,1.2)}
      const isl=[[.18,.34,.16,'#2a2c5a'],[.82,.28,.12,'#2a2c5a'],[.62,.52,.2,'#3a3466'],[.3,.66,.13,'#4a3a6e']];
      for(const[px,py,w,col] of isl){const cx=px*W,cy=py*H,ww=w*W;x.fillStyle=col;mbgIsland(x,cx,cy,ww,ww*.18,ww*.55,'rgba(255,200,170,.35)');
        x.fillStyle=col;for(let k=0;k<3;k++){const tx=cx-ww*.5+k*ww*.45+R()*ww*.1,th=ww*(.18+R()*.1);x.beginPath();x.moveTo(tx,cy-ww*.15);x.lineTo(tx-th*.3,cy-ww*.15);x.lineTo(tx,cy-ww*.15-th);x.lineTo(tx+th*.3,cy-ww*.15);x.closePath();x.fill()}
        x.strokeStyle='rgba(190,220,255,.35)';x.lineWidth=2;x.beginPath();x.moveTo(cx+ww*.2,cy+ww*.05);x.lineTo(cx+ww*.22,cy+ww*.75);x.stroke()}
      for(let i=0;i<6;i++){const cx=R()*W,cy=H*(.12+R()*.75),w=60+R()*90;x.fillStyle='rgba(255,220,230,.08)';x.beginPath();x.ellipse(cx,cy,w,10,0,0,TAU);x.ellipse(cx-w*.3,cy-6,w*.4,8,0,0,TAU);x.fill()}}
    else{// the Zombie: night and fog, a pale moon, a dead wood and a broken fence along the bottom
      let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#030507');g.addColorStop(.55,'#0b1411');g.addColorStop(1,'#16241c');x.fillStyle=g;x.fillRect(0,0,W,H);
      const mx=W*.78,my=H*.14;g=x.createRadialGradient(mx,my,0,mx,my,W*.5);g.addColorStop(0,'rgba(190,230,190,.22)');g.addColorStop(1,'rgba(190,230,190,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
      x.fillStyle='#d6e2c4';x.beginPath();x.arc(mx,my,Math.min(W,H)*.05,0,TAU);x.fill();
      for(let i=0;i<60;i++){x.fillStyle=`rgba(220,235,220,${.1+R()*.35})`;x.fillRect(R()*W,R()*H*.45,1,1)}
      x.fillStyle='#070b09';for(let i=0;i<9;i++){const tx=R()*W,ty=H*(.8+R()*.08),th=H*(.12+R()*.16);x.save();x.strokeStyle='#070b09';const br=(px,py,a,l,lw,d)=>{if(d>3)return;const ex=px+Math.cos(a)*l,ey=py+Math.sin(a)*l;x.lineWidth=lw;x.beginPath();x.moveTo(px,py);x.lineTo(ex,ey);x.stroke();for(const da of[-.5,.45])br(ex,ey,a+da+(R()-.5)*.4,l*.6,lw*.6,d+1)};br(tx,ty,-Math.PI/2+(R()-.5)*.2,th*.5,5,0);x.restore()}
      x.fillStyle='#0a100c';x.fillRect(0,H*.88,W,H*.12);
      for(let px=-10;px<W+20;px+=28+R()*10){const lean=(R()-.5)*.3;x.strokeStyle='#050806';x.lineWidth=5;x.beginPath();x.moveTo(px,H*.9);x.lineTo(px+Math.sin(lean)*30,H*.9-30);x.stroke()}
      x.strokeStyle='#0c120e';x.lineWidth=4;for(const yy of[H*.9-10,H*.9-22]){x.beginPath();x.moveTo(-10,yy);for(let px=0;px<W+20;px+=40)x.lineTo(px,yy+(R()-.5)*6);x.stroke()}}
    g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.35,W/2,H*.45,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${z?.6:.35})`);x.fillStyle=g;x.fillRect(0,0,W,H);
    MBG.motes=[...Array(26)].map((_,i)=>({x:Math.random(),y:Math.random(),v:.012+Math.random()*.02,ph:Math.random()*9,r:1+Math.random()*1.6}))}
  c.setTransform(1,0,0,1,0,0);c.drawImage(MBG.st,0,0);MBG.drawn=true;if(LOWFX)return;c.setTransform(dpr,0,0,dpr,0,0);
  const keep=ctx;ctx=c;try{
    if(!z){c.globalCompositeOperation='lighter';
      // soft clouds drifting, little lights of the arena's colour rising
      for(let k=0;k<4;k++){const fx=((t*(5+k*2)+k*W*.37)%(W+300))-150,fy=H*(.2+k*.2);glow('255,210,190',fx,fy,140,.04,30)}
      for(const p of MBG.motes){p.y-=p.v*dt;if(p.y<-.05){p.y=1.05;p.x=Math.random()}const px=p.x*W+Math.sin(t*.8+p.ph)*12,py=p.y*H,a=.35+.35*Math.sin(t*2+p.ph);glow(rgb,px,py,p.r*6,a*.5);glow('255,255,255',px,py,p.r,a)}}
    else{// fog rolling, ash drifting down
      for(let k=0;k<4;k++){const fx=((t*(4+k*2)+k*W*.37)%(W+300))-150,fy=H*(.55+k*.1);c.globalAlpha=.06;c.drawImage(glowSprite('150,175,160'),fx-170,fy-30,340,60);c.globalAlpha=1}
      for(const p of MBG.motes){p.y+=p.v*dt*.6;if(p.y>1.05){p.y=-.05;p.x=Math.random()}const px=p.x*W+Math.sin(t*.6+p.ph)*16,py=p.y*H;c.fillStyle=`rgba(190,195,185,${(.25+.2*Math.sin(t+p.ph)).toFixed(3)})`;c.fillRect(px,py,p.r*1.3,p.r*1.3)}}
  }finally{ctx=keep;c.globalCompositeOperation='source-over';c.globalAlpha=1}}
