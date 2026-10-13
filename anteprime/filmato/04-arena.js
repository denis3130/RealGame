// ------------------------------------------------------------------ 04 · the arena and its guardian
// A huge dark hall under the hill: a ring of walls with tiers, braziers far apart, sand and stone on the floor. The gate rises
// with chains and dust. At the back, in the dark, the guardian waits: a giant of moss and bones (only for the film: it will
// become a real boss later). Its eyes light up red; a little light slides over its shape; then it screams.
const AR={sand:'#3a2e24',sandL:'#7a5f45',wall:'#2e2a2a',wallL:'#6a5c55',fog:'#070405',bone:'#cbbfa8',boneD:'#5a5146',moss:'#16281a',mossL:'#3f7a2e'};
const GATE_UP=33.05,EYES_ON=36.35,REVEAL=36.8,SCREAM2=37.55;

// ---------- the gate seen from inside the arena (7.1)
const GT={x:0,w:112,h:156,z:260};
function gateY(t){return -GT.h*EZ.io(seg01(t,GATE_UP,GATE_UP+1.35))}
function arenaWall(c,x0,x1,yTop,z,o){o=o||{};const F=col=>fogc(col,z);blockWall(c,x0,x1,yTop,z,{col:AR.wall,door:o.door,seed:o.seed||71,rh:34,bw:60});
  // a row of carved teeth along the top: the arena is the guardian's mouth
  c.fillStyle=F(mc(AR.wall,AR.wallL,.2));c.strokeStyle=F(INKC);c.lineWidth=2;for(let x=x0+20;x<x1-10;x+=44){c.beginPath();c.moveTo(x-12,yTop);c.lineTo(x,yTop+22);c.lineTo(x+12,yTop);c.closePath();c.fill();c.stroke()}}
function torch(c,x,y,z,t,seed){const F=col=>fogc(col,z);c.fillStyle=F(CQ.iron);c.strokeStyle=F(INKC);c.lineWidth=2;c.beginPath();c.moveTo(x-6,y);c.lineTo(x+6,y);c.lineTo(x+3,y+16);c.lineTo(x-3,y+16);c.closePath();c.fill();c.stroke();
  c.fillRect(x-1.5,y+16,3,10);flame(c,x,y,18,t,0,seed);glo(c,'255,160,70',x,y-10,60,.6,50)}
function portcullis(c,x,w,h,yOff,z){const F=col=>fogc(col,z);c.save();c.beginPath();c.rect(x-w/2,-h,w,h);c.clip();c.translate(0,yOff);
  c.strokeStyle=F('#0d0a08');c.lineWidth=6;for(let bx=x-w/2+8;bx<=x+w/2-6;bx+=14){c.beginPath();c.moveTo(bx,-h-4);c.lineTo(bx,4);c.stroke()}
  c.lineWidth=5;for(const y of[-h*.3,-h*.7]){c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);c.stroke()}
  c.strokeStyle=F('#5a4c40');c.lineWidth=1.4;for(let bx=x-w/2+8;bx<=x+w/2-6;bx+=14){c.beginPath();c.moveTo(bx-1.4,-h);c.lineTo(bx-1.4,0);c.stroke()}
  // the spikes at the bottom
  c.fillStyle=F('#0d0a08');for(let bx=x-w/2+8;bx<=x+w/2-6;bx+=14){c.beginPath();c.moveTo(bx-3,0);c.lineTo(bx,12);c.lineTo(bx+3,0);c.fill()}c.restore()}
function corridorGlow(c,d,t){// behind the gate: the green corridor the hero came from
  c.save();c.beginPath();c.rect(d.x-d.w/2,-d.h,d.w,d.h);c.clip();const g=c.createRadialGradient(d.x,-d.h*.42,4,d.x,-d.h*.42,d.w*.9);g.addColorStop(0,'#3f8a3a');g.addColorStop(.45,'#163a1c');g.addColorStop(1,'#030806');
  c.fillStyle=g;c.fillRect(d.x-d.w,-d.h,d.w*2,d.h);c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=5;for(let i=1;i<4;i++){const k=1-i*.22;c.beginPath();c.moveTo(d.x-d.w/2*k,0);c.lineTo(d.x-d.w/2*k,-d.h*k*.8);c.quadraticCurveTo(d.x,-d.h*k*.98,d.x+d.w/2*k,-d.h*k*.8);c.lineTo(d.x+d.w/2*k,0);c.stroke()}c.restore()}
const gateDust=mkDust(40,41,-56,56,-150,-2,250,262);
SETS.arenaPorta={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);floorT(X0,-400,400,C.z+3,GT.z,{col:AR.sand,tw:60,seed:21});
    for(const sd of[-1,1]){const q=pr(sd*74,0,GT.z-10),sq=Math.min(1,Math.max(.12,-C.y/Math.max(20,GT.z-C.z)*1.4));glo(X0,'255,140,60',q[0],q[1],110*q[2],.35,110*q[2]*sq)}
    // the green of the corridor spills on the sand when the gate is up
    const op=-gateY(t)/GT.h;if(op>0){const q=pr(0,0,GT.z-20);glo(X0,'90,200,80',q[0],q[1],90*q[2],.3*op,30*q[2])}},
  items(t,sh,lt){const out=[],gy=gateY(t),rising=t>GATE_UP&&t<GATE_UP+1.5;
    out.push({z:GT.z+60,c:(c,s)=>corridorGlow(c,{x:0,w:GT.w,h:GT.h},t)});
    out.push({z:GT.z,c:(c,s)=>{arenaWall(c,-400,400,-330,GT.z,{door:{x:0,w:GT.w,h:GT.h+10},seed:73});portcullis(c,0,GT.w,GT.h,gy,GT.z);
      for(const sd of[-1,1]){torch(c,sd*74,-128,GT.z,t,sd+9);// the chains that pull the gate up
        c.strokeStyle=fogc('#3a332c',GT.z);c.lineWidth=2.6;c.setLineDash([5,3]);c.lineDashOffset=rising?-t*60:0;c.beginPath();c.moveTo(sd*(GT.w/2+10),-GT.h-30);c.lineTo(sd*(GT.w/2+10),gy*.2-60);c.stroke();c.setLineDash([])}}});
    if(rising)dustItems(gateDust,t-GATE_UP,out,null,1.6);
    if(sh.items)sh.items(t,out);return out}};

// ---------- the guardian of moss and bones (a silhouette in the dark, lit only by its own eyes and a thin light)
// card units: its feet on y = 0, about 430 tall, 400 wide. o.eyes 0..1, o.rim 0..1 (the light sliding over its shape), o.jaw 0..1
function bossShape(c,x,t,o){const br=Math.sin(t*1.4)*4,jaw=(o.jaw||0)*16;c.beginPath();
  // the hunched body under the moss, the arms down to the claws
  c.moveTo(x-200,0);c.bezierCurveTo(x-230,-120,x-210,-250+br,x-120,-300+br);c.quadraticCurveTo(x-60,-330+br,x,-322+br);c.quadraticCurveTo(x+60,-330+br,x+120,-300+br);c.bezierCurveTo(x+210,-250+br,x+230,-120,x+200,0);c.closePath();
  for(const sd of[-1,1]){const sx=x+sd*150;c.moveTo(sx,-250+br);c.bezierCurveTo(sx+sd*70,-200,sx+sd*80,-90,sx+sd*40,-10);c.lineTo(sx+sd*10,-10);c.bezierCurveTo(sx+sd*40,-90,sx+sd*10,-170,sx-sd*30,-240+br);c.closePath();
    // the claws resting on the floor
    for(let i=0;i<4;i++){const cx=sx+sd*(18+i*14)-sd*10,cy=-12;c.moveTo(cx-5,cy);c.quadraticCurveTo(cx+sd*4,cy+10,cx+sd*14,cy+14);c.quadraticCurveTo(cx+sd*2,cy+6,cx+5,cy);c.closePath()}}
  // the skull
  const hx=x,hy=-350+br;c.moveTo(hx-58,hy+10);c.bezierCurveTo(hx-64,hy-60,hx-30,hy-86,hx,hy-86);c.bezierCurveTo(hx+30,hy-86,hx+64,hy-60,hx+58,hy+10);c.quadraticCurveTo(hx+40,hy+40+jaw,hx,hy+52+jaw);c.quadraticCurveTo(hx-40,hy+40+jaw,hx-58,hy+10);c.closePath();
  // the antlers of bone
  // the antlers: gnarled branches of bone, thick at the root, forking, with knobs
  for(const sd of[-1,1]){const ax=hx+sd*36,ay=hy-66;const br2=(x0,y0,a,l,w,d)=>{if(d>3||l<12)return;const bend=sd*.18,x1=x0+Math.cos(a)*l,y1=y0+Math.sin(a)*l,mx=(x0+x1)/2+Math.cos(a+Math.PI/2)*l*bend,my=(y0+y1)/2+Math.sin(a+Math.PI/2)*l*bend,nx=-Math.sin(a)*w,ny=Math.cos(a)*w;
      c.moveTo(x0+nx,y0+ny);c.quadraticCurveTo(mx+nx*.6,my+ny*.6,x1+nx*.25,y1+ny*.25);c.lineTo(x1-nx*.25,y1-ny*.25);c.quadraticCurveTo(mx-nx*.6,my-ny*.6,x0-nx,y0-ny);c.closePath();
      c.moveTo(x1+w*.5,y1);c.arc(x1,y1,w*.5,0,FTAU);br2(flp(x0,x1,.55),flp(y0,y1,.55),a+sd*.75,l*.5,w*.62,d+1);br2(x1,y1,a-sd*.3,l*.68,w*.7,d+1);if(d<1)br2(flp(x0,x1,.3),flp(y0,y1,.3),a-sd*.9,l*.35,w*.55,d+2)};
    br2(ax,ay,-Math.PI/2+sd*.62,100,12,0)}}
function drawBoss(c,x,z,t,o){o=o||{};const eyes=o.eyes||0,rim=o.rim||0,br=Math.sin(t*1.4)*4,hy=-350+br;
  // the rim light: the same shape in red, moved toward the light, then the dark shape over it
  if(rim>0){c.save();c.translate(-3*rim,-4*rim);c.fillStyle=`rgba(255,70,40,${.55*rim})`;bossShape(c,x,t,o);c.fill();c.restore();c.save();c.translate(3,-2);c.fillStyle=`rgba(120,255,120,${.18*rim})`;bossShape(c,x,t,o);c.fill();c.restore()}
  c.fillStyle='#050607';bossShape(c,x,t,o);c.fill();
  if(rim>0){c.save();bossShape(c,x,t,o);c.clip();
    // what the thin light shows: the moss mane, the ribs, the bone of the skull
    c.globalAlpha=rim;
    // the ribs under the moss, barely there
    c.strokeStyle=mc(AR.boneD,'#000000',.6);c.lineWidth=7;for(let i=0;i<4;i++){const y=-230+i*30;c.beginPath();c.moveTo(x-8,y);c.quadraticCurveTo(x-80+i*6,y-12,x-96+i*10,y+26);c.moveTo(x+8,y);c.quadraticCurveTo(x+80-i*6,y-12,x+96-i*10,y+26);c.stroke()}
    // the mane of moss: ragged clumps hanging from the shoulders, the edges toward the light catch a little green
    const rr=frng(5);for(let i=0;i<22;i++){const mx=x-170+i*16+rr()*8,my=-300+br+Math.abs(i-11)*5,l=40+rr()*70,w=10+rr()*10,sw=Math.sin(t*1.1+i)*4,lit=Math.max(0,1-Math.abs(i-14)/9);
      c.fillStyle=mc('#0a140c',AR.moss,.4+lit*.6);c.beginPath();c.moveTo(mx-w,my);c.quadraticCurveTo(mx-w*.6+sw*.5,my+l*.5,mx-w*.2+sw,my+l);c.lineTo(mx+sw*.8,my+l*.7);c.lineTo(mx+w*.3+sw,my+l*.95);c.quadraticCurveTo(mx+w*.7+sw*.5,my+l*.45,mx+w,my);c.closePath();c.fill();
      if(lit>.3){c.strokeStyle=rgba(AR.mossL,.45*lit);c.lineWidth=1.4;c.beginPath();c.moveTo(mx+w*.8,my+4);c.quadraticCurveTo(mx+w*.6+sw*.5,my+l*.45,mx+w*.25+sw,my+l*.9);c.stroke()}}
    // the skull only half seen: the light catches its brow and one cheek, the rest stays in the dark
    const g=c.createRadialGradient(x+22,hy-62,4,x+4,hy-30,84);g.addColorStop(0,mc(AR.bone,'#000000',.3));g.addColorStop(.4,mc(AR.boneD,'#000000',.45));g.addColorStop(1,'#080706');c.fillStyle=g;c.beginPath();c.ellipse(x,hy-26,56,60,0,0,FTAU);c.fill();
    // the brow ridge and the cheekbones catch the light; the nose is a dark hole; cracks and moss on the crown
    c.strokeStyle=rgba(AR.bone,.55);c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(x-44,hy-48);c.quadraticCurveTo(x-24,hy-60,x-4,hy-46);c.moveTo(x+4,hy-46);c.quadraticCurveTo(x+24,hy-60,x+44,hy-48);c.stroke();
    c.strokeStyle=rgba(AR.bone,.3);c.lineWidth=4;c.beginPath();c.moveTo(x-46,hy-8);c.quadraticCurveTo(x-36,hy+2,x-22,hy-2);c.moveTo(x+46,hy-8);c.quadraticCurveTo(x+36,hy+2,x+22,hy-2);c.stroke();
    c.fillStyle='#000';c.beginPath();c.moveTo(x,hy-14);c.quadraticCurveTo(x-9,hy-6,x-6,hy+2);c.lineTo(x,hy-2);c.lineTo(x+6,hy+2);c.quadraticCurveTo(x+9,hy-6,x,hy-14);c.fill();
    c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=1.6;c.beginPath();c.moveTo(x+18,hy-84);c.lineTo(x+12,hy-70);c.lineTo(x+20,hy-60);c.moveTo(x-30,hy-78);c.lineTo(x-24,hy-66);c.stroke();
    c.fillStyle=AR.moss;c.beginPath();c.ellipse(x-14,hy-82,30,10,-.15,0,FTAU);c.fill();c.fillStyle=rgba(AR.mossL,.5);c.beginPath();c.ellipse(x-8,hy-86,18,4,-.15,0,FTAU);c.fill();
    // little green spores glowing in the moss
    for(let i=0;i<14;i++){const sx=x-140+((i*53)%280),sy=-280+br+((i*29)%90),a=.4+.4*Math.sin(t*2+i);glo(c,'150,255,110',sx,sy,9,a*.5);c.fillStyle=`rgba(190,255,150,${a})`;c.beginPath();c.arc(sx,sy,1.8,0,FTAU);c.fill()}
    c.restore()}
  // the eye sockets, the teeth, the eyes
  c.fillStyle='#000';for(const sd of[-1,1]){c.beginPath();c.ellipse(x+sd*24,hy-30,17,13,sd*.35,0,FTAU);c.fill()}
  if(rim>.2){c.fillStyle=`rgba(203,191,168,${rim})`;for(let i=-3;i<=3;i++){const tx=x+i*9;c.beginPath();c.moveTo(tx-4,hy+12);c.lineTo(tx,hy+26+Math.abs(i)*-2);c.lineTo(tx+4,hy+12);c.fill()}}
  if(eyes>0){for(const sd of[-1,1]){const ex=x+sd*24,ey=hy-28;glo(c,'255,50,30',ex,ey,60*eyes,.8*eyes);glo(c,'255,120,80',ex,ey,18,eyes);c.fillStyle=`rgba(255,${80+120*eyes},${60*eyes},${eyes})`;c.beginPath();c.ellipse(ex,ey,6*eyes+1,4.5*eyes+.5,sd*.35,0,FTAU);c.fill();
      c.fillStyle=`rgba(255,240,220,${eyes})`;c.beginPath();c.arc(ex-1,ey-1,1.6*eyes,0,FTAU);c.fill()}}
  // its breath in the cold
  if(o.breath)for(let i=0;i<3;i++){const q=((t*.4+i/3)%1);c.fillStyle=`rgba(120,110,110,${.12*(1-q)*o.breath})`;c.beginPath();c.arc(x+Math.sin(i)*10,hy+40-q*30,14+q*40,0,FTAU);c.fill()}}

// ---------- the arena (7.2, 7.3, 7.4): from the gate toward the back, where the guardian waits
const ARN={zb:1250,bx:0,bz:1100};
const BRZ=[[-82,300],[82,300],[-110,560],[110,560],[-140,820],[140,820]];
const arenaDust=mkDust(60,61,-260,260,-200,-3,60,900);
SETS.arena={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);
    // a faint warm haze high up at the back, so the guardian's shape reads against it
    const q=pr(0,-420,ARN.zb),g=X0.createRadialGradient(q[0],q[1],4,q[0],q[1],FM.W*.9);g.addColorStop(0,'rgba(70,30,22,.55)');g.addColorStop(1,'rgba(0,0,0,0)');X0.fillStyle=g;X0.fillRect(-300,-300,FM.W+600,FM.H+600);
    floorT(X0,-460,460,C.z+3,ARN.zb,{col:AR.sand,tw:70,seed:31});wallX(X0,-460,C.z+3,ARN.zb,-520,{col:AR.wall,rh:40,bw:70});wallX(X0,460,C.z+3,ARN.zb,-520,{col:AR.wall,rh:40,bw:70});
    for(const[x,z] of BRZ){const p=pr(x,0,z),sq=Math.min(1,Math.max(.1,-C.y/Math.max(20,z-C.z)*1.4));glo(X0,'255,140,60',p[0],p[1],150*p[2],.34,150*p[2]*sq)}},
  items(t,sh,lt){const out=[];
    // the back wall with tiers and carved teeth
    out.push({z:ARN.zb,c:(c,s)=>{arenaWall(c,-460,460,-520,ARN.zb,{seed:91});c.fillStyle=fogc('#1a1514',ARN.zb);for(let i=0;i<3;i++)c.fillRect(-460,-520-i*40,920,-24)}});
    // two rows of pillars with fire on top, toward the guardian
    for(const[x,z] of BRZ)out.push({z,c:(c,s)=>{pillar(c,x,34,-130,z,x<0?1:-1,t);c.save();c.translate(0,-130);brazier(c,x,z,t,{h:36,seed:x});c.restore()}});
    out.push({z:ARN.bz,c:(c,s)=>{c.save();c.scale(1.55,1.55);drawBoss(c,ARN.bx,ARN.bz,t,sh.boss?sh.boss(t):{});c.restore()}});
    dustItems(arenaDust,t,out,null);
    if(sh.items)sh.items(t,out);return out}};

// ---------- the floor near the altar, very close (3.4: the moss stick falls)
SETS.pavimento={sky(t,sh){const X0=X;X0.fillStyle='#000';X0.fillRect(-300,-300,FM.W+600,FM.H+600);floorT(X0,-200,200,C.z+3,300,{tw:34,seed:5});
    const q=pr(0,0,90);glo(X0,'210,230,255',q[0],q[1],80*q[2],.35,30*q[2]);for(const sd of[-1,1]){const p=pr(sd*70,0,140);glo(X0,'255,150,70',p[0],p[1],110*p[2],.35,40*p[2])}},
  items(t,sh,lt){const out=[];out.push({z:110,c:(c,s)=>{const F=col=>fogc(col,110);stoneBlock(c,-50,-40,100,40,F,77,{lw:2.4})}});
    for(const sd of[-1,1])out.push({z:150,c:(c,s)=>brazier(c,sd*70,150,t,{h:30,seed:sd})});
    if(sh.items)sh.items(t,out);return out}};
// the moss stick on its own (fallen): x, y, z in the world, rotation, how lit
function mossStickW(c,s,x,y,rot,lit,t){c.save();c.translate(x,y);c.rotate(rot);const L=6,R=1;
  c.lineCap='round';c.strokeStyle=INKC;c.lineWidth=R*2+1.2;c.beginPath();c.moveTo(-L/2,0);c.lineTo(L/2,0);c.stroke();c.strokeStyle=lit>0?'#4f8a34':'#3d5a2c';c.lineWidth=R*2;c.stroke();
  c.fillStyle='#8fd14f';for(const k of[-.3,0,.25]){c.fillRect(k*L-.3,-.4,.6,.6)}
  if(lit>0){c.globalCompositeOperation='lighter';glo(c,'150,255,90',L/2,0,6*lit,.7*lit);c.globalCompositeOperation='source-over';c.fillStyle='#c9ff7a';c.beginPath();c.arc(L/2,0,1.05*lit,0,FTAU);c.fill()}
  c.restore()}
