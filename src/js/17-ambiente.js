// ---------- environment ----------
const floorCv=document.createElement('canvas');floorCv.width=AW*2;floorCv.height=AH*2;const fx=floorCv.getContext('2d');
// colour grade, baked once per room: richer colours, and a key light that makes the middle of the room glow and the corners fall away
// living grass: a few tufts that sway in the draught and bend away when someone walks through them
const TUFT={muschio:['#4f8a2a','#9fd65a'],radici:['#4a7a28','#9ccf55'],golem:['#4f8a2a','#9fd65a'],palude:['#6a7a22','#c8d84a'],canneto:['#6a7a22','#c8d84a'],rospo:['#5a7a2a','#b8d050'],idra:['#4a6a3a','#9cc070'],brina:['#7f9fb8','#eaf6ff'],ghiacciaio:['#7f9fb8','#eaf6ff'],yeti:['#7f9fb8','#eaf6ff'],regina:['#7f9fb8','#eaf6ff']};
function makeTufts(){G.tufts=[];const th=themeOf(G.room),C=TUFT[th];if(!C||LOWFX)return;const n=th==='brina'||th==='ghiacciaio'||th==='yeti'||th==='regina'?7:13;
  for(let i=0,tries=0;i<n&&tries<200;tries++){const edge=Math.random()<.6,x=edge?(Math.random()<.5?rand(L+8,L+50):rand(R-50,R-8)):rand(L+20,R-20),y=rand(TOP+30,BOT-20);
    if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+14)||(G.puddles||[]).some(p=>Math.abs(p.x-x)<p.rx+8&&Math.abs(p.y-y)<p.ry+8)||G.tufts.some(t=>Math.hypot(t.x-x,t.y-y)<26))continue;
    G.tufts.push({x,y,n:randi(4,7),h:rand(7,12),ph:rand(0,TAU),b:0,c:C});i++}}
function drawTufts(){if(!G.tufts||!G.tufts.length)return;ctx.lineCap='round';
  for(const t of G.tufts){let tg=Math.sin(G.t*1.6+t.ph)*.14+Math.sin(G.t*3.1+t.ph*2)*.05;
    for(const a of [P,...G.enemies]){if(!a||a.dead||a.z>4)continue;const dx=t.x-a.x,dy=t.y-a.y,d=Math.hypot(dx,dy);if(d<24&&d>.1)tg+=dx/d*(1-d/24)*1.1}
    t.b+=(tg-t.b)*.18;
    const path=()=>{ctx.beginPath();for(let i=0;i<t.n;i++){const f=(i/(t.n-1)-.5),l=t.h*(.7+.3*Math.cos(f*2.2)),bx=t.x+f*9,tx=bx+f*7+t.b*l*1.1,ty=t.y-l*(1-Math.abs(t.b)*.25);ctx.moveTo(bx,t.y);ctx.quadraticCurveTo(bx+f*2,t.y-l*.6,tx,ty)}};
    path();ctx.strokeStyle='rgba(27,22,18,.85)';ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle=t.c[0];ctx.lineWidth=1.8;ctx.stroke();
    ctx.save();ctx.beginPath();ctx.rect(t.x-20,t.y-t.h-6,40,t.h*.55+6);ctx.clip();path();ctx.strokeStyle=t.c[1];ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}}
function gradeRoom(){makeTufts();const E=G.env||{},lt=E.light||'255,200,140';
  if(HASF&&!LOWFX)for(const cv0 of [floorCv,wallCv,sideCv]){const t=document.createElement('canvas');t.width=cv0.width;t.height=cv0.height;const x=t.getContext('2d');x.filter='saturate(1.22) contrast(1.06)';x.drawImage(cv0,0,0);const c=cv0.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv0.width,cv0.height);c.drawImage(t,0,0);c.restore()}
  const c=floorCv.getContext('2d'),W=floorCv.width,H=floorCv.height;c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='soft-light';
  const g=c.createRadialGradient(W/2,H*.5,W*.04,W/2,H*.52,W*.95);const ice=isIce(themeOf(G.room));g.addColorStop(0,`rgba(${lt},${ice?.25:.6})`);g.addColorStop(.55,'rgba(128,128,128,0)');g.addColorStop(1,`rgba(0,0,0,${ice?.6:.45})`);c.fillStyle=g;c.fillRect(0,0,W,H);c.restore()}
function arenaTint(){const A=G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];if(!A||!A.tint||!HASF)return;
  for(const cv0 of [floorCv,wallCv,sideCv]){const t=document.createElement('canvas');t.width=cv0.width;t.height=cv0.height;const x=t.getContext('2d');x.filter=A.tint;x.drawImage(cv0,0,0);const c=cv0.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv0.width,cv0.height);c.drawImage(t,0,0);c.restore()}}
function renderFloor(){
  const th0=themeOf(G.room),cool=th0==='cristalli'||th0==='radici',lava=LAVAZ.includes(th0),swamp=isSwamp(th0),icy=isIce(th0),pal=G.env.floor;
  fx.setTransform(2,0,0,2,0,0);fx.fillStyle=G.env.base;fx.fillRect(0,0,AW,AH);
  // flagstones of different sizes (1x1, 2x1, 1x2, 2x2) instead of a plain grid: each one a slab with lit and shaded edges, texture, chips and cracks
  const ts=34,nc=Math.ceil((R-L)/ts),nr=Math.ceil((BOT-TOP)/ts),used=new Uint8Array(nc*nr),U=(i,j)=>i>=nc||j>=nr||used[j*nc+i];
  const slab=(x,y,w,h)=>{const x1=Math.min(x+w,R+2),y1=Math.min(y+h,BOT+2);w=x1-x;h=y1-y;
    fx.fillStyle=pal[randi(0,3)];fx.fillRect(x+1,y+1,w-2,h-2);
    fx.fillStyle=Math.random()<.5?`rgba(255,255,255,${rand(0,.045)})`:`rgba(0,0,0,${rand(0,.07)})`;fx.fillRect(x+1,y+1,w-2,h-2);
    const tg=fx.createLinearGradient(x,y,x+w,y+h);tg.addColorStop(0,'rgba(255,255,255,.06)');tg.addColorStop(1,'rgba(0,0,0,.14)');fx.fillStyle=tg;fx.fillRect(x+1,y+1,w-2,h-2);
    for(let q=0;q<(w*h)/500;q++){fx.fillStyle=Math.random()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.035)';fx.beginPath();fx.ellipse(x+rand(6,w-6),y+rand(6,h-6),rand(3,9),rand(2,5),rand(0,3),0,TAU);fx.fill()}
    for(let q=0;q<(w*h)/160;q++){fx.fillStyle=Math.random()<.5?'rgba(0,0,0,.18)':'rgba(255,255,255,.07)';fx.fillRect(x+rand(3,w-4),y+rand(3,h-4),1.2,1.2)}
    fx.fillStyle='rgba(255,255,255,.085)';fx.fillRect(x+1,y+1,w-2,2);fx.fillRect(x+1,y+3,2,h-4);
    fx.fillStyle='rgba(0,0,0,.3)';fx.fillRect(x+1,y+h-3.5,w-2,2.5);fx.fillRect(x+w-3.5,y+1,2.5,h-4);
    for(let q=0;q<2;q++)if(Math.random()<.24){const cx=Math.random()<.5?x+1:x+w-1,cy=Math.random()<.5?y+1:y+h-1,sx=cx===x+1?1:-1,sy=cy===y+1?1:-1,k=rand(3,7);fx.fillStyle=G.env.base;fx.beginPath();fx.moveTo(cx,cy);fx.lineTo(cx+sx*k,cy);fx.lineTo(cx,cy+sy*k*.8);fx.closePath();fx.fill()}
    if(icy&&Math.random()<.3){fx.fillStyle='rgba(255,255,255,.16)';fx.beginPath();fx.moveTo(x+4,y+h-6);fx.lineTo(x+w-10,y+4);fx.lineTo(x+w-6,y+4);fx.lineTo(x+8,y+h-6);fx.closePath();fx.fill()}
    if(Math.random()<(w*h>ts*ts?.3:.12)){let cx=x+rand(6,w-6),cy=y+rand(6,h-6);const pts=[[cx,cy]];for(let k=0;k<4;k++){cx=clamp(cx+rand(-10,10),x+3,x+w-3);cy=clamp(cy+rand(-10,10),y+3,y+h-3);pts.push([cx,cy])}
      fx.strokeStyle=icy?'rgba(60,90,130,.35)':'rgba(0,0,0,.42)';fx.lineWidth=1.4;fx.beginPath();pts.forEach((p,k)=>k?fx.lineTo(p[0],p[1]):fx.moveTo(p[0],p[1]));fx.stroke();
      fx.strokeStyle='rgba(255,255,255,.07)';fx.lineWidth=1;fx.beginPath();pts.forEach((p,k)=>k?fx.lineTo(p[0]+.9,p[1]+.9):fx.moveTo(p[0]+.9,p[1]+.9));fx.stroke()}};
  for(let j=0;j<nr;j++)for(let i=0;i<nc;i++){if(used[j*nc+i])continue;let w=1,h=1;const q=Math.random();
    if(q<.14&&!U(i+1,j)&&!U(i,j+1)&&!U(i+1,j+1)){w=2;h=2}else if(q<.34&&!U(i+1,j))w=2;else if(q<.46&&!U(i,j+1))h=2;
    for(let b=0;b<h;b++)for(let a=0;a<w;a++)used[(j+b)*nc+i+a]=1;slab(L+i*ts,TOP+j*ts,w*ts,h*ts)}
  // a carved border runs round the room, a hand's width from the walls
  for(const[o,al] of [[11,.38],[12.2,.07]]){fx.strokeStyle=al>.2?`rgba(0,0,0,${al})`:`rgba(255,255,255,${al})`;fx.lineWidth=al>.2?2.2:1;fx.strokeRect(L+o,TOP+o,R-L-o*2,BOT-TOP-o*2)}
  // the beast's emblem engraved in the middle of the floor, its grooves glowing faintly with the chapter's light
  {const kind=lava?'lava':swamp?'swamp':icy?'ice':'moss',rgb=BDPAL[kind].eye;G.floorGlow=null;
    if(!G.variant.rune&&!G.event){const cx=AW/2,cy=TOP+(BOT-TOP)*.5,R0=Math.min(84,(R-L)*.3),ry=.62;G.floorGlow={x:cx,y:cy,r:R0,rgb};
      const ring=(rr,lw,al)=>{fx.beginPath();fx.ellipse(cx,cy,rr,rr*ry,0,0,TAU);fx.strokeStyle=`rgba(0,0,0,${al})`;fx.lineWidth=lw;fx.stroke();fx.beginPath();fx.ellipse(cx,cy+1.2,rr,rr*ry,0,0,TAU);fx.strokeStyle='rgba(255,255,255,.06)';fx.lineWidth=1;fx.stroke()};
      fx.fillStyle='rgba(0,0,0,.1)';fx.beginPath();fx.ellipse(cx,cy,R0,R0*ry,0,0,TAU);fx.fill();
      ring(R0,3,.42);ring(R0*.8,2,.38);
      fx.strokeStyle='rgba(0,0,0,.42)';fx.lineWidth=1.6;fx.lineCap='round';for(let k=0;k<18;k++){const a=k/18*TAU,rr=R0*.9,px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr*ry;fx.save();fx.translate(px,py);fx.scale(1,ry);fx.rotate(a+Math.PI/2);fx.beginPath();
        const g=k%3;if(g===0){fx.moveTo(-3,-3);fx.lineTo(0,3);fx.lineTo(3,-3)}else if(g===1){fx.moveTo(-3,0);fx.lineTo(3,0);fx.moveTo(0,-3);fx.lineTo(0,3)}else{fx.arc(0,0,2.6,0,Math.PI*1.4)}fx.stroke();fx.restore()}
      // the arena's own emblem, engraved (src/js/74-arene.js): the beast's skull is gone from the floors
      fx.save();fx.translate(cx,cy);fx.scale(1,ry);const s=R0*.42,eng=(f)=>{fx.beginPath();f();fx.strokeStyle='rgba(0,0,0,.45)';fx.lineWidth=2.4;fx.stroke();fx.save();fx.translate(0,1.4);fx.beginPath();f();fx.strokeStyle='rgba(255,255,255,.06)';fx.lineWidth=1;fx.stroke();fx.restore()};
      floorEmblem(eng,s);
      fx.restore();
      fx.save();fx.globalCompositeOperation='lighter';fx.strokeStyle=`rgba(${rgb},.14)`;fx.lineWidth=1.2;fx.beginPath();fx.ellipse(cx,cy,R0*.8,R0*.8*ry,0,0,TAU);fx.stroke();fx.restore()}
    // two or three cracks with the chapter's light seeping out of them
    G.floorCracks=[];if(!lava)for(let i=0;i<3;i++){let x=rand(L+40,R-40),y=rand(TOP+60,BOT-60);if(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+30))continue;const a0=rand(0,TAU),pts=[[x,y]];
      for(let k=0;k<6;k++){x+=Math.cos(a0+rand(-.6,.6))*rand(8,15);y+=Math.sin(a0+rand(-.6,.6))*rand(6,12);pts.push([x,y])}
      const path=()=>{fx.beginPath();pts.forEach((p,k)=>k?fx.lineTo(p[0],p[1]):fx.moveTo(p[0],p[1]))};
      path();fx.strokeStyle='rgba(0,0,0,.6)';fx.lineWidth=3;fx.lineCap='round';fx.stroke();path();fx.save();fx.shadowColor=`rgb(${rgb})`;fx.shadowBlur=6;fx.strokeStyle=`rgba(${rgb},.55)`;fx.lineWidth=1.1;fx.stroke();fx.restore();
      G.floorCracks.push({pts,rgb,ph:rand(0,9)})}}
  for(let i=0;i<14;i++){const x=Math.random()<.5?rand(L,L+60):rand(R-60,R),y=rand(TOP,BOT);
    for(let k=0;k<5;k++){fx.fillStyle=lava?`rgba(15,10,8,${rand(.25,.45)})`:icy?`rgba(245,250,255,${rand(.35,.6)})`:swamp?`rgba(70,80,40,${rand(.25,.45)})`:`rgba(${cool?'90,140,120':'110,150,60'},${rand(.2,.4)})`;fx.beginPath();fx.ellipse(x+rand(-14,14),y+rand(-10,10),rand(5,12),rand(4,8),0,0,TAU);fx.fill()}}
  for(let i=0;i<10;i++){fx.fillStyle='rgba(0,0,0,.25)';fx.beginPath();fx.arc(rand(L,R),rand(TOP,BOT),rand(1.5,3),0,TAU);fx.fill()}
  if(th0==='radici'){fx.strokeStyle='rgba(60,90,40,.6)';fx.lineWidth=3;for(let i=0;i<8;i++){fx.beginPath();let x=rand(L,R),y=rand(TOP,BOT);fx.moveTo(x,y);for(let k=0;k<4;k++){x+=rand(-30,30);y+=rand(-30,30);fx.lineTo(x,y)}fx.stroke()}}
  bakeDressing();
  const g=fx.createLinearGradient(0,TOP,0,TOP+34);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');fx.fillStyle=g;fx.fillRect(L,TOP,R-L,34);
  // the side and bottom walls shade the floor next to them too
  for(const[x0,x1] of [[L,L+22],[R,R-22]]){const gs=fx.createLinearGradient(x0,0,x1,0);gs.addColorStop(0,'rgba(0,0,0,.42)');gs.addColorStop(1,'rgba(0,0,0,0)');fx.fillStyle=gs;fx.fillRect(Math.min(x0,x1),TOP,22,BOT-TOP)}
  {const gb=fx.createLinearGradient(0,BOT,0,BOT-16);gb.addColorStop(0,'rgba(0,0,0,.35)');gb.addColorStop(1,'rgba(0,0,0,0)');fx.fillStyle=gb;fx.fillRect(L,BOT-16,R-L,16)}
}
function doorPath(){const dx=AW/2;ctx.beginPath();ctx.moveTo(dx-DOORW,TOP);ctx.lineTo(dx-DOORW,26);ctx.arc(dx,26,DOORW,Math.PI,0);ctx.lineTo(dx+DOORW,TOP);ctx.closePath()}
function doorFrame(){
  const th0=themeOf(G.room),dx=AW/2,stone=G.env.door||(th0==='cristalli'||th0==='radici'?'#4a5250':'#5a4f42');ink(2.5);
  for(const s of [-1,1]){const x=dx+s*(DOORW+4);ctx.beginPath();ctx.rect(x-4,24,8,TOP-24);fs(stone);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.5;for(let y=38;y<TOP;y+=14){ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.stroke()}ink(2.5)}
  ctx.strokeStyle=INK;ctx.lineWidth=12;ctx.beginPath();ctx.arc(dx,26,DOORW+4,Math.PI,0);ctx.stroke();
  ctx.strokeStyle=stone;ctx.lineWidth=7;ctx.beginPath();ctx.arc(dx,26,DOORW+4,Math.PI,0);ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;for(let i=1;i<6;i++){const a=Math.PI+i*Math.PI/6;ctx.beginPath();ctx.moveTo(dx+Math.cos(a)*(DOORW+.5),26+Math.sin(a)*(DOORW+.5));ctx.lineTo(dx+Math.cos(a)*(DOORW+7.5),26+Math.sin(a)*(DOORW+7.5));ctx.stroke()}
  ink(2.5);ctx.beginPath();ctx.moveTo(dx-5,-4);ctx.lineTo(dx+5,-4);ctx.lineTo(dx+4,6);ctx.lineTo(dx-4,6);ctx.closePath();fs(G.door?'#ffc93c':stone);
}
function doorDark(strong){
  ctx.save();doorPath();ctx.clip();
  const g=ctx.createLinearGradient(0,0,0,TOP+4);g.addColorStop(0,'rgba(10,7,5,1)');g.addColorStop(strong?.75:.55,'rgba(10,7,5,.75)');g.addColorStop(1,'rgba(10,7,5,0)');
  ctx.fillStyle=g;ctx.fillRect(AW/2-DOORW,0,DOORW*2,TOP+4);ctx.restore();
}
// Back layer: everything the characters stand in front of (top wall, door opening, torches)
function drawWallBack(){
  const th0=themeOf(G.room),cool=th0==='cristalli'||th0==='radici',dx=AW/2;
  ctx.drawImage(wallCv,0,0,AW*2,(TOP+40)*2,0,0,AW,TOP+40);
  ctx.fillStyle='#16120f';ctx.fillRect(0,TOP-5,dx-DOORW,5);ctx.fillRect(dx+DOORW,TOP-5,AW-dx-DOORW,5);
  // door opening: a corridor that continues into the dark
  ctx.save();doorPath();ctx.clip();
  ctx.fillStyle=G.env.door?'#2e2826':cool?'#3d4443':'#4a4236';ctx.fillRect(dx-DOORW,0,DOORW*2,TOP);
  ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;
  for(let k=0;k<6;k++){const y=TOP-Math.pow(k/6,.8)*(TOP-6);ctx.beginPath();ctx.moveTo(dx-DOORW,y);ctx.lineTo(dx+DOORW,y);ctx.stroke()}
  ctx.beginPath();ctx.moveTo(dx-8,TOP);ctx.lineTo(dx-4,6);ctx.moveTo(dx+8,TOP);ctx.lineTo(dx+4,6);ctx.stroke();
  ctx.restore();
  if(G.door){ctx.save();doorPath();ctx.clip();const g=ctx.createRadialGradient(dx,10,2,dx,10,40);g.addColorStop(0,'rgba(255,201,60,.35)');g.addColorStop(1,'rgba(255,201,60,0)');ctx.fillStyle=g;ctx.fillRect(dx-DOORW,0,DOORW*2,TOP);ctx.restore()}
  doorDark(false);
  const gUp=G.door&&G.gateT>0?1-G.gateT/.6:G.door?1:0;if(gUp<1){ctx.save();if(gUp>0){doorPath();ctx.clip();ctx.translate(0,-gUp*gUp*70)}
  {ctx.strokeStyle=INK;ctx.lineWidth=5;for(let x=dx-DOORW+7;x<dx+DOORW;x+=9){ctx.beginPath();ctx.moveTo(x,TOP+2);ctx.lineTo(x,4+Math.abs(x-dx)*.7);ctx.stroke()}
    ctx.strokeStyle='#6b6f78';ctx.lineWidth=3;for(let x=dx-DOORW+7;x<dx+DOORW;x+=9){ctx.beginPath();ctx.moveTo(x,TOP+2);ctx.lineTo(x,4+Math.abs(x-dx)*.7);ctx.stroke()}
    ctx.beginPath();ctx.moveTo(dx-DOORW+2,TOP-22);ctx.lineTo(dx+DOORW-2,TOP-22);ctx.stroke();
    ctx.fillStyle='#6b6f78';for(let x=dx-DOORW+7;x<dx+DOORW;x+=9){ctx.beginPath();ctx.moveTo(x-2.5,TOP+2);ctx.lineTo(x,TOP+7);ctx.lineTo(x+2.5,TOP+2);ctx.fill()}}ctx.restore()}
  doorFrame();
  if(G.door){ctx.fillStyle='#ffc93c';const by=TOP+24+Math.sin(G.t*6)*4;ctx.beginPath();ctx.moveTo(dx,by-12);ctx.lineTo(dx+11,by);ctx.lineTo(dx+4,by);ctx.lineTo(dx+4,by+10);ctx.lineTo(dx-4,by+10);ctx.lineTo(dx-4,by);ctx.lineTo(dx-11,by);ctx.closePath();ink(2.5);ctx.globalAlpha=P.y<TOP+60?.35:1;ctx.fill();ctx.stroke();ctx.globalAlpha=1}
  for(const t of G.torches)drawTorch(t);
}
// Front layer: side and bottom walls, which sit in front of anything near the edges
function drawWallFront(){
  ctx.drawImage(sideCv,0,(TOP-6)*2,L*2,(AH-TOP+6)*2,0,TOP-6,L,AH-TOP+6);ctx.drawImage(sideCv,R*2,(TOP-6)*2,(AW-R)*2,(AH-TOP+6)*2,R,TOP-6,AW-R,AH-TOP+6);ctx.drawImage(sideCv,L*2,BOT*2,(R-L)*2,(AH-BOT)*2,L,BOT,R-L,AH-BOT);
}
