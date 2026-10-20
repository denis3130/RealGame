// ---------- environment: variants, baked dressing, ambient life, lighting ----------
const GLOW={};let LOWFX=false;
const VIG=document.createElement('canvas');VIG.width=AW/4;VIG.height=AH/4;{const v=VIG.getContext('2d'),g=v.createRadialGradient(AW/8,AH/8,AH*.3/4,AW/8,AH/8,AH*.72/4);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');v.fillStyle=g;v.fillRect(0,0,AW/4,AH/4)}
function glowSprite(rgb){if(GLOW[rgb])return GLOW[rgb];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(.45,`rgba(${rgb},.42)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(0,0,64,64);return GLOW[rgb]=c}
function glow(rgb,x,y,r,a,ry){if(a<=0)return;ctx.globalAlpha=Math.min(1,a);ctx.drawImage(glowSprite(rgb),x-r,y-(ry||r),r*2,(ry||r)*2);ctx.globalAlpha=1}
const hexRgb=h=>{const n=parseInt(h.slice(1,7),16);return `${n>>16},${(n>>8)&255},${n&255}`};
const ENV={
  muschio:{wall:['#2e2721','#352d25','#2a231d','#3a3129'],mortar:'#1a1612',side:'#221d18',floor:['#5a5143','#554c40','#5f5647','#51493d'],base:'#3e372e',torch:['#ff5a14','#ffa632','#fff1c0'],light:'255,170,80',ember:'#ffb347',dark:.42,amb:{firefly:9,mote:12},fog:null},
  golem:{wall:['#30281f','#382e24','#2b241c','#3d3328'],mortar:'#1b1611',side:'#241e18',floor:['#5c5244','#564c3f','#625849','#50473b'],base:'#3e372e',torch:['#ff3c10','#ff8a22','#ffe6a0'],light:'255,140,60',ember:'#ff9a3c',dark:.38,amb:{mote:16},fog:null},
  cristalli:{wall:['#232b2c','#2a3334','#1f2627','#2f393a'],mortar:'#141a1b',side:'#1c2324',floor:['#4d5452','#485050','#525a57','#444c4b'],base:'#353b3a',torch:['#1a62ff','#5fb8ff','#e8f8ff'],light:'110,180,255',ember:'#9fe0ff',dark:.5,amb:{cmote:16},fog:'159,208,224'},
  radici:{wall:['#262c22','#2d3428','#21271d','#323a2c'],mortar:'#161a13',side:'#1d2219',floor:['#4f564a','#4a5145','#565e50','#454b40'],base:'#353b30',torch:['#129a50','#4fe08f','#dcffe6'],light:'80,220,150',ember:'#7bf0a8',dark:.55,amb:{spore:18},fog:'122,154,106'}};
const VARIANTS={
  muschio:[{n:'Sala del muschio',grass:14,puddles:1,bones:2,rubble:4,cracks:3},{n:'Ossario',grass:4,bones:16,rubble:6,cracks:4,skullsWall:1},
    {n:'Galleria allagata',grass:6,puddles:5,bones:1,rubble:2,cracks:2},{n:'Giardino sepolto',grass:26,flowers:12,puddles:1,rubble:2,cracks:1,shafts:3}],
  golem:[{n:'Arena del Guardiano',rune:'golem',rubble:10,cracks:9,bones:3}],
  cristalli:[{n:'Grotta di cristallo',veins:9,puddles:2,rubble:4,cracks:2,shafts:2},{n:'Lago sotterraneo',veins:3,puddles:8,rubble:2,cracks:1},
    {n:'Miniera abbandonata',veins:5,rubble:10,bones:3,cracks:4,rails:1}],
  radici:[{n:'Santuario delle Radici',rune:'witch',roots:12,bones:4,cracks:3}]};
const pk=a=>a[randi(0,a.length-1)];
function buildEnv(){
  const th=themeOf(G.room),E=ENV[th];G.env=E;G.variant=pk(VARIANTS[th]);
  Object.assign(G,{amb:[],debris:[],stuck:[],ripples:[],puddles:[],embers:[],dripT:1,leafT:1.5,stepT:0,emberT:0,runeAt:null,icePatches:[],shroomLights:[],swampPool:null,bubT:.5});
  G.torches=(BOSSZ[th]?[48,118,242,312]:[74,286]).map(x=>({x:x*AW/VW,y:38,ph:rand(0,9)}));
  for(const k in E.amb)for(let i=0;i<E.amb[k];i++)G.amb.push({k,x:rand(L+10,R-10),y:rand(TOP+10,BOT-10),vx:rand(-6,6),vy:k==='spore'?rand(-14,-6):k==='ember'?rand(-24,-8):k==='ash'?rand(6,14):k==='snow'?rand(14,28):rand(-5,5),ph:rand(0,TAU),t:0});
  G.fogs=E.fog?Array.from({length:6},()=>({x:rand(L-40,R+40),y:rand(TOP,BOT),r:rand(80,140),vx:rand(4,10)*(Math.random()<.5?-1:1),a:rand(.05,.09)})):[];
  G.shafts=Array.from({length:G.variant.shafts||0},()=>({x:rand(L+30,R-90),w:rand(26,48),ph:rand(0,9)}));
}
// ----- baked floor dressing -----
function bakeDressing(){
  const c=fx,th=themeOf(G.room),V=G.variant,free=(x,y,m)=>!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+(m||10));
  const spot=m=>{for(let i=0;i<30;i++){const x=rand(L+12,R-12),y=rand(TOP+16,BOT-12);if(free(x,y,m))return[x,y]}return[rand(L+12,R-12),rand(TOP+16,BOT-12)]};
  const ell2=(x,y,rx,ry,col,rot)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);c.fill()};
  // long cracks across the floor
  for(let i=0;i<(V.cracks||0);i++){let[x,y]=spot(0);const a0=rand(0,TAU);
    c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=2;c.beginPath();c.moveTo(x,y);const pts=[[x,y]];
    for(let k=0;k<7;k++){x+=Math.cos(a0+rand(-.7,.7))*rand(8,16);y+=Math.sin(a0+rand(-.7,.7))*rand(8,16);c.lineTo(x,y);pts.push([x,y])}c.stroke();
    c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0]+1,p[1]+1):c.moveTo(p[0]+1,p[1]+1));c.stroke()}
  // puddles
  for(let i=0;i<(V.puddles||0);i++){const[x,y]=spot(26),rx=rand(16,32),ry=rx*rand(.45,.6);
    // water lying in a hollow of the floor: a wet dark ring, a sunken shadowed rim at the top, the room reflected on the surface
    const shape=(sc)=>{c.beginPath();for(let k=0;k<12;k++){const a=k/12*TAU,q=1+Math.sin(k*2.3+x)*.12;const px=x+Math.cos(a)*rx*q*sc,py=y+Math.sin(a)*ry*q*sc;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()};
    shape(1.22);c.fillStyle='rgba(0,0,0,.16)';c.fill();
    const wg=c.createLinearGradient(0,y-ry,0,y+ry),ice=isIce(th),cr=th==='cristalli';wg.addColorStop(0,ice?'rgba(200,230,250,.9)':cr?'rgba(16,40,56,.92)':'rgba(16,22,28,.9)');wg.addColorStop(.55,ice?'rgba(150,200,235,.85)':cr?'rgba(40,90,110,.85)':'rgba(44,58,66,.82)');wg.addColorStop(1,ice?'rgba(225,242,255,.9)':cr?'rgba(90,150,170,.7)':'rgba(92,110,116,.62)');
    shape(1);c.fillStyle=wg;c.fill();
    c.save();shape(1);c.clip();c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=3;c.beginPath();c.ellipse(x,y+2.5,rx*1.02,ry*1.02,0,Math.PI*1.05,-Math.PI*.05);c.stroke();
    c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=1.4;c.lineCap='round';for(let k=0;k<3;k++){const yy=y+ry*(.15+k*.22),w=rx*(.5-k*.12);c.beginPath();c.moveTo(x-w+k*3,yy);c.lineTo(x+w*.4+k*3,yy);c.stroke()}c.restore();
    c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=1;c.beginPath();c.ellipse(x,y+1,rx*.98,ry*.98,0,Math.PI*.1,Math.PI*.9);c.stroke();
    G.puddles.push({x,y,rx:rx*.92,ry:ry*.92})}
  // crystal veins glowing in the floor
  for(let i=0;i<(V.veins||0);i++){let[x,y]=spot(0);const a0=rand(0,TAU);c.save();c.shadowColor='#7fe0f0';c.shadowBlur=8;c.strokeStyle='rgba(127,224,240,.75)';c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);
    for(let k=0;k<5;k++){x+=Math.cos(a0+rand(-.9,.9))*rand(6,13);y+=Math.sin(a0+rand(-.9,.9))*rand(6,13);c.lineTo(x,y)}c.stroke();c.fillStyle='#c9f3ff';c.beginPath();c.moveTo(x,y-4);c.lineTo(x+2.5,y);c.lineTo(x,y+2);c.lineTo(x-2.5,y);c.closePath();c.fill();c.restore()}
  // mine rails
  if(V.rails){const y=rand(TOP+150,BOT-150);c.fillStyle='#4a3524';for(let x=L;x<R;x+=14){c.fillRect(x,y-9,7,18);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x,y+7,7,2);c.fillStyle='#4a3524'}
    for(const dy of [-5,5]){c.fillStyle='#1b1612';c.fillRect(L,y+dy-1.8,R-L,3.6);c.fillStyle='#8a929c';c.fillRect(L,y+dy-1.2,R-L,1.6)}}
  // roots crawling over the floor
  for(let i=0;i<(V.roots||0);i++){const side=randi(0,3);let x=side===0?L:side===1?R:rand(L,R),y=side<2?rand(TOP,BOT):side===2?TOP:BOT;
    const tx=rand(L+40,R-40),ty=rand(TOP+60,BOT-60),w=rand(4,8);
    for(const[col,lw] of [['#1b1612',w+3],['#5a3f2a',w],['rgba(255,220,170,.18)',w*.3]]){c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+(tx-x)*.3+rand(-40,40),y+(ty-y)*.3+rand(-40,40),x+(tx-x)*.7+rand(-40,40),y+(ty-y)*.7+rand(-40,40),tx,ty);c.stroke()}}
  // rune circles in the boss arenas
  if(V.rune){const cx=AW/2,cy=TOP+(BOT-TOP)*.45;G.runeAt={x:cx,y:cy};c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=3;
    for(const rr of [110,92,40]){c.beginPath();c.ellipse(cx,cy,rr,rr*.62,0,0,TAU);c.stroke()}
    c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=1.5;for(const rr of [111,93]){c.beginPath();c.ellipse(cx,cy+1.5,rr,rr*.62,0,0,TAU);c.stroke()}
    c.fillStyle='rgba(0,0,0,.4)';for(let k=0;k<12;k++){const a=k/12*TAU,px=cx+Math.cos(a)*101,py=cy+Math.sin(a)*101*.62;c.save();c.translate(px,py);c.rotate(a);c.fillRect(-1.5,-5,3,10);c.fillRect(-4,-1.5,8,3);c.restore()}}
  // rubble clusters
  for(let i=0;i<(V.rubble||0);i++){const[x,y]=spot(14);for(let k=0;k<randi(3,6);k++){const px=x+rand(-9,9),py=y+rand(-5,5),s=rand(1.8,4.2);
    // a chipped stone lying flat: soft shadow, lit top facet, dark lower edge
    ell2(px+1,py+s*.55,s*1.15,s*.5,'rgba(0,0,0,.3)');c.save();c.translate(px,py);c.rotate(rand(0,TAU));c.beginPath();c.moveTo(-s,s*.2);c.lineTo(-s*.5,-s*.6);c.lineTo(s*.6,-s*.55);c.lineTo(s,s*.25);c.lineTo(0,s*.65);c.closePath();
    c.fillStyle=pk(ENV[th]?ENV[th].floor:G.env.floor);c.fill();c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.moveTo(-s,s*.2);c.lineTo(s,s*.25);c.lineTo(0,s*.65);c.closePath();c.fill();
    c.fillStyle='rgba(255,255,255,.16)';c.beginPath();c.moveTo(-s*.5,-s*.6);c.lineTo(s*.6,-s*.55);c.lineTo(s*.2,-s*.1);c.closePath();c.fill();c.restore()}}
  // bones and skulls
  for(let i=0;i<(V.bones||0);i++){const[x,y]=spot(12);c.save();c.translate(x,y);c.rotate(rand(0,TAU));
    if(Math.random()<.3){c.restore();ell2(x+1,y+4,6,2.5,'rgba(0,0,0,.3)');c.fillStyle='#e0d9c4';c.strokeStyle='#1b1612';c.lineWidth=1.3;c.beginPath();c.arc(x,y,5,0,TAU);c.fill();c.stroke();c.fillStyle='#1b1612';c.beginPath();c.arc(x-1.8,y,1.3,0,TAU);c.arc(x+1.8,y,1.3,0,TAU);c.fill();continue}
    c.fillStyle='rgba(0,0,0,.3)';c.fillRect(-7,2,14,3);c.fillStyle='#e0d9c4';c.strokeStyle='#1b1612';c.lineWidth=1.2;c.fillRect(-6,-1.2,12,2.4);c.strokeRect(-6,-1.2,12,2.4);
    for(const s of [-1,1])for(const d of [-1,1]){c.beginPath();c.arc(s*6.5,d*1.3,1.8,0,TAU);c.fill();c.stroke()}c.restore()}
  // grass tufts and flowers
  const grassCol=LAVAZ.includes(th)?['#5a4a3a','#4a3a2e']:th==='cristalli'?['#4f8f86','#3f7a72']:isSwamp(th)?['#6a7a32','#5a6a2a','#7a8a3a']:isIce(th)?['#9fb8c8','#c8d8e4','#7a9ab0']:['#6fa040','#5a8a32','#86b84a'];
  for(let i=0;i<(V.grass||0);i++){const[x,y]=Math.random()<.6?[Math.random()<.5?rand(L+4,L+50):rand(R-50,R-4),rand(TOP+10,BOT-10)]:spot(8);grassTuft(c,x,y,grassCol,rand(.8,1.4))}
  for(let i=0;i<(V.flowers||0);i++){const[x,y]=spot(8);for(let k=0;k<5;k++){c.fillStyle=pk(['#f2d36b','#e8a0d0','#f6ead2']);c.beginPath();c.arc(x+Math.cos(k*1.26)*2.2,y+Math.sin(k*1.26)*1.6,1.5,0,TAU);c.fill()}c.fillStyle='#d9862e';c.beginPath();c.arc(x,y,1.2,0,TAU);c.fill()}
  if(LAVAZ.includes(th))bakeLava(c,V);
  if(isSwamp(th))bakeSwamp(c,V);if(isIce(th))bakeIce(c,V);
  // ground around every obstacle so it sits in the floor instead of floating
  for(const k of G.rocks)if(!k.temp)groundPatch(c,k,th);
}
function grassTuft(c,x,y,cols,s){c.lineCap='round';for(let b=0;b<5;b++){const a=-Math.PI/2+rand(-.7,.7),h=rand(4,9)*s;c.strokeStyle=pk(cols);c.lineWidth=1.4;c.beginPath();c.moveTo(x+b-2,y);c.quadraticCurveTo(x+b-2+Math.cos(a)*h*.4,y-h*.5,x+b-2+Math.cos(a)*h,y+Math.sin(a)*h);c.stroke()}}
// groundPatch (baked under each obstacle) and groundFront (in front of its base) are defined with the obstacle sprites, near the end of the file
// ----- baked walls -----
const wallCv=document.createElement('canvas');wallCv.width=AW*2;wallCv.height=AH*2;const wx=wallCv.getContext('2d');
const sideCv=document.createElement('canvas');sideCv.width=AW*2;sideCv.height=AH*2;const sx2=sideCv.getContext('2d');
function bakeWalls(){
  const E=G.env,th=themeOf(G.room),V=G.variant,c=wx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,wallCv.width,wallCv.height);c.setTransform(2,0,0,2,0,0);
  c.fillStyle=E.mortar;c.fillRect(0,0,AW,TOP);
  for(let row=0;row*13<TOP;row++){const y=row*13;let x=-(row%2)*14-rand(0,10);
    while(x<AW){const w=rand(22,36);const broken=Math.random()<.06;
      c.fillStyle=broken?'#14100d':pk(E.wall);c.fillRect(x+1,y+1,w-2,11);
      if(!broken){c.fillStyle='rgba(255,255,255,.07)';c.fillRect(x+1,y+1,w-2,2);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+1,y+10,w-2,2);
        if(Math.random()<.15){c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;c.beginPath();c.moveTo(x+w*.3,y+2);c.lineTo(x+w*.45,y+6);c.lineTo(x+w*.35,y+11);c.stroke()}}
      x+=w}}
  const shade=c.createLinearGradient(0,0,0,TOP);shade.addColorStop(0,'rgba(0,0,0,.45)');shade.addColorStop(.6,'rgba(0,0,0,0)');c.fillStyle=shade;c.fillRect(0,0,AW,TOP);
  // theme decoration on the wall face
  const avoidDoor=x=>Math.abs(x-AW/2)>DOORW+14&&!G.torches.some(t=>Math.abs(t.x-x)<14);
  if(th==='muschio'||th==='golem'){
    for(let i=0;i<9;i++){const x=rand(4,AW-4);if(!avoidDoor(x))continue;const len=rand(14,TOP+16);
      c.strokeStyle='#1b1612';c.lineWidth=3.5;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+rand(-8,8),len*.3,x+rand(-8,8),len*.7,x+rand(-5,5),len);c.stroke();
      c.strokeStyle=th==='golem'?'#4a6a2a':'#5f9e3c';c.lineWidth=2;c.stroke();
      for(let y=6;y<len;y+=rand(5,9)){const s=Math.random()<.5?-1:1;c.fillStyle=pk(['#6fa040','#86b84a','#4f8a34']);c.beginPath();c.ellipse(x+s*3+Math.sin(y)*2,y,3.4,1.8,s*.6,0,TAU);c.fill()}}
    for(let i=0;i<6;i++){const x=rand(0,AW),y=rand(0,TOP-8);c.fillStyle='rgba(110,160,60,.45)';c.beginPath();c.ellipse(x,y,rand(6,14),rand(2.5,5),0,0,TAU);c.fill()}}
  if(th==='golem'){c.save();c.shadowColor='#ff7a2e';c.shadowBlur=6;c.strokeStyle='rgba(255,122,46,.55)';c.lineWidth=2;
    for(const x of [86,274]){c.beginPath();c.arc(x,30,10,0,TAU);c.moveTo(x-6,30);c.lineTo(x+6,30);c.moveTo(x,24);c.lineTo(x,36);c.stroke()}c.restore();
    for(const x of [20,340]){c.strokeStyle='#1b1612';c.lineWidth=4;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+6,TOP*.6,x,TOP-4);c.stroke();c.strokeStyle='#6b6f78';c.lineWidth=2;c.setLineDash([4,3]);c.stroke();c.setLineDash([])}}
  if(th==='cristalli'){c.save();c.shadowColor='#7fe0f0';c.shadowBlur=10;
    for(let i=0;i<6;i++){const x=rand(10,AW-10);if(!avoidDoor(x))continue;const y=rand(12,TOP-10);
      for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*.5,h=rand(8,16);c.fillStyle=k===1?'#9fe6ff':'#6fb8e8';c.beginPath();c.moveTo(x+Math.cos(a+1.5)*3,y+Math.sin(a+1.5)*3);c.lineTo(x+Math.cos(a)*h,y+Math.sin(a)*h);c.lineTo(x+Math.cos(a-1.5)*3,y+Math.sin(a-1.5)*3);c.closePath();c.fill()}}
    c.restore();c.fillStyle='rgba(120,180,200,.1)';for(let i=0;i<8;i++){const x=rand(0,AW);c.fillRect(x,rand(0,20),rand(2,4),rand(20,TOP))}}
  if(th==='radici'){c.lineCap='round';for(let i=0;i<7;i++){const x=rand(0,AW);if(!avoidDoor(x))continue;const len=rand(30,TOP+30),w=rand(4,9);
      for(const[col,lw] of [['#1b1612',w+3],['#4a3524',w],['rgba(255,220,170,.15)',w*.3]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(x,-4);c.bezierCurveTo(x+rand(-20,20),len*.3,x+rand(-20,20),len*.7,x+rand(-10,10),len);c.stroke()}}
    c.save();c.shadowColor='#b06ad8';c.shadowBlur=8;c.fillStyle='#c48ae8';for(let i=0;i<6;i++){c.beginPath();c.arc(rand(0,AW),rand(6,TOP-6),rand(2,3.5),0,TAU);c.fill()}c.restore()}
  if(LAVAZ.includes(th)){c.save();c.lineCap='round';
    for(let i=0;i<7;i++){let x=rand(6,AW-6);if(!avoidDoor(x))continue;let y=0;c.shadowColor='#ff6a1a';c.shadowBlur=8;c.strokeStyle='#ff7a2e';c.lineWidth=rand(1.4,2.6);c.beginPath();c.moveTo(x,y);while(y<TOP-4){x+=rand(-6,6);y+=rand(6,12);c.lineTo(x,Math.min(y,TOP-4))}c.stroke()}
    c.shadowBlur=0;if(th==='forgia'||th==='fabbro'){for(const x of [40,AW-40,120,AW-120]){if(!avoidDoor(x))continue;c.strokeStyle='#1b1612';c.lineWidth=4;c.beginPath();c.moveTo(x,0);c.lineTo(x,rand(30,TOP-14));c.stroke();c.strokeStyle='#6b6f78';c.lineWidth=2.4;c.setLineDash([4,3]);c.stroke();c.setLineDash([])}
      for(let i=0;i<4;i++){const x=rand(20,AW-20);if(!avoidDoor(x))continue;const y=rand(14,TOP-22);c.fillStyle='#4a4a52';c.strokeStyle='#1b1612';c.lineWidth=1.5;c.beginPath();c.arc(x,y,7,0,TAU);c.fill();c.stroke();c.fillStyle='#2a2a30';c.fillRect(x-1.5,y-5,3,10);c.fillRect(x-5,y-1.5,10,3)}}
    else{c.fillStyle='rgba(20,12,10,.5)';for(let i=0;i<10;i++){c.beginPath();c.ellipse(rand(0,AW),rand(0,TOP),rand(8,18),rand(3,6),0,0,TAU);c.fill()}}
    c.restore()}
  if(V.skullsWall){for(let i=0;i<8;i++){const x=rand(10,AW-10);if(!avoidDoor(x))continue;const y=rand(10,TOP-14);c.fillStyle='#e0d9c4';c.strokeStyle='#1b1612';c.lineWidth=1.3;c.beginPath();c.arc(x,y,5,0,TAU);c.fill();c.stroke();c.fillStyle='#1b1612';c.beginPath();c.arc(x-1.8,y,1.3,0,TAU);c.arc(x+1.8,y,1.3,0,TAU);c.fill()}}
  // cobwebs in the corners
  for(const[cx,dir] of [[0,1],[AW,-1]]){c.strokeStyle='rgba(230,230,230,.22)';c.lineWidth=1;for(let k=0;k<5;k++){const a=k/4*Math.PI/2;c.beginPath();c.moveTo(cx,0);c.lineTo(cx+dir*Math.cos(a)*30,Math.sin(a)*30);c.stroke()}
    for(const rr of [10,18,26]){c.beginPath();for(let k=0;k<=4;k++){const a=k/4*Math.PI/2;const px=cx+dir*Math.cos(a)*rr,py=Math.sin(a)*rr;k?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}}
  // side + bottom walls
  const s=sx2;s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,sideCv.width,sideCv.height);s.setTransform(2,0,0,2,0,0);
  s.fillStyle=E.side;s.fillRect(0,TOP-5,L,AH);s.fillRect(R,TOP-5,AW-R,AH);s.fillRect(0,BOT,AW,AH-BOT);
  for(let y=TOP;y<AH;y+=12){for(const x0 of [0,R]){s.fillStyle=pk(E.wall);s.fillRect(x0+1,y+1,L-2,10);s.fillStyle='rgba(0,0,0,.3)';s.fillRect(x0+1,y+9,L-2,2)}}
  for(let x=-(Math.random()*20);x<AW;x+=26){s.fillStyle=pk(E.wall);s.fillRect(x+1,BOT+3,24,10);s.fillRect(x+14,BOT+15,24,10)}
  s.fillStyle='rgba(255,255,255,.08)';s.fillRect(L-3,TOP,3,BOT-TOP);s.fillRect(R,TOP,3,BOT-TOP);s.fillRect(L,BOT,R-L,3);
  if(LAVAZ.includes(th)){s.save();s.shadowColor='#ff6a1a';s.shadowBlur=6;s.strokeStyle='rgba(255,122,46,.8)';s.lineWidth=1.5;for(let i=0;i<8;i++){const onLeft=Math.random()<.5;let x=onLeft?rand(4,L-4):rand(R+4,AW-4),y=rand(TOP+20,BOT-40);s.beginPath();s.moveTo(x,y);for(let k=0;k<4;k++){x+=rand(-3,3);y+=rand(6,12);s.lineTo(x,y)}s.stroke()}s.restore()}
  else if(th!=='cristalli'&&!isIce(th)&&!isSwamp(th))for(let i=0;i<10;i++){const onLeft=Math.random()<.5,x=onLeft?L-2:R+2,y=rand(TOP+20,BOT-20);s.fillStyle=th==='radici'?'rgba(80,110,50,.7)':'rgba(110,160,60,.6)';s.beginPath();s.ellipse(x,y,4,rand(6,12),0,0,TAU);s.fill()}
  bakeWalls3(c,s,th);
}
// ----- finished walls: a cornice on top, pilasters carrying the torches, a stone plinth where the wall meets the floor, clean edges on the side walls -----
{const _bw=bakeWalls;bakeWalls=function(){_bw();const c=wx,s=sx2,S=stonePal(),E=G.env;c.setTransform(2,0,0,2,0,0);s.setTransform(2,0,0,2,0,0);
  // plinth along the foot of the back wall
  c.fillStyle=S.lo;c.fillRect(0,TOP-12,AW,7);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(0,TOP-12,AW,1.5);c.fillStyle='rgba(0,0,0,.3)';for(let x=rand(0,20);x<AW;x+=rand(26,40))c.fillRect(x,TOP-12,1.5,7);
  // pilasters: one under every torch and one in each corner
  const xs=[...G.torches.map(t=>t.x),L*.5,AW-L*.5];
  for(const x of xs){const w=x<L||x>R?L:20;
    const sh=c.createLinearGradient(x+w/2,0,x+w/2+9,0);sh.addColorStop(0,'rgba(0,0,0,.4)');sh.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sh;c.fillRect(x+w/2,0,9,TOP-5);
    c.fillStyle=vGrad(x-w/2,x+w/2,S.hi,S.mid,S.lo);c.fillRect(x-w/2,4,w,TOP-14);
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.2;for(let y=18;y<TOP-12;y+=15){c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);c.stroke()}
    c.fillStyle='rgba(255,255,255,.14)';c.fillRect(x-w/2+1,4,2,TOP-14);
    c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(x-w/2,4,w,TOP-14);
    for(const[y,h] of [[0,7],[TOP-14,9]]){c.fillStyle=y?S.mid:S.hi;c.fillRect(x-w/2-3,y,w+6,h);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(x-w/2-3,y,w+6,1.6);c.strokeStyle=INK;c.lineWidth=2;c.strokeRect(x-w/2-3,y,w+6,h)}}
  // cornice along the top of the back wall
  {const cg=c.createLinearGradient(0,0,0,7);cg.addColorStop(0,'rgba(0,0,0,.55)');cg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=cg;c.fillRect(0,0,AW,7)}
  // side and bottom walls: a stone cap with a clean dark edge toward the floor and a lit rim
  for(const[x0,x1] of [[0,L],[R,AW]]){for(let y=TOP-6;y<AH;y+=rand(18,28)){s.fillStyle='rgba(0,0,0,.4)';s.fillRect(x0,y,x1-x0,1.4)}
    s.fillStyle='rgba(255,255,255,.07)';s.fillRect(x0+2,TOP-6,x1-x0-4,AH);}
  for(let x=rand(0,20);x<AW;x+=rand(26,40)){s.fillStyle='rgba(0,0,0,.4)';s.fillRect(x,BOT,1.4,AH-BOT)}
  s.fillStyle=INK;s.fillRect(L-2,TOP-6,2.4,BOT-TOP+8);s.fillRect(R-.4,TOP-6,2.4,BOT-TOP+8);s.fillRect(L-2,BOT-.4,R-L+4,2.4);
  s.fillStyle='rgba(255,255,255,.16)';s.fillRect(L-4.4,TOP-6,1.6,BOT-TOP+6);s.fillRect(R+2,TOP-6,1.6,BOT-TOP+6);s.fillRect(L-4,BOT+2,R-L+8,1.6)}}
// the faint living light of the floor: the emblem's grooves breathe, the glowing cracks pulse
function drawFloorGlow(){const f=G.floorGlow,t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';
  if(f){const a=.1+.06*Math.sin(t*1.3);glow(f.rgb,f.x,f.y,f.r*1.05,a,f.r*.66);for(let k=0;k<6;k++){const an=t*.25+k/6*TAU;glow(f.rgb,f.x+Math.cos(an)*f.r*.9,f.y+Math.sin(an)*f.r*.9*.62,10,.25+.15*Math.sin(t*2+k))}}
  for(const c of G.floorCracks||[]){const a=.18+.12*Math.sin(t*1.8+c.ph);for(let k=1;k<c.pts.length;k+=2)glow(c.rgb,c.pts[k][0],c.pts[k][1],16,a)}
  ctx.restore()}
// ----- stamps applied to the floor during play -----
function stamp(kind,x,y,r){const c=fx;c.setTransform(2,0,0,2,0,0);
  if(kind==='crater'){const g=c.createRadialGradient(x,y,2,x,y,r*1.3);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,r*1.3,r*.75,0,0,TAU);c.fill();
    c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1.6;for(let i=0;i<7;i++){const a=i/7*TAU+rand(-.3,.3);let px=x+Math.cos(a)*r*.4,py=y+Math.sin(a)*r*.25;c.beginPath();c.moveTo(px,py);for(let j=0;j<3;j++){px+=Math.cos(a+rand(-.4,.4))*r*.35;py+=Math.sin(a+rand(-.4,.4))*r*.2;c.lineTo(px,py)}c.stroke()}}
  else if(kind==='cracks'){c.lineCap='round';for(let i=0;i<9;i++){const a=i/9*TAU+rand(-.3,.3);let px=x,py=y;c.beginPath();c.moveTo(px,py);const Ln=r*rand(.6,1.3);for(let j=0;j<4;j++){px+=Math.cos(a+rand(-.5,.5))*Ln/4;py+=Math.sin(a+rand(-.5,.5))*Ln/4*.6;c.lineTo(px,py)}c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=2.2;c.stroke();c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=.8;c.stroke()}}
  else if(kind==='scorch'){const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'rgba(20,10,5,.55)');g.addColorStop(.7,'rgba(40,20,10,.25)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.6,0,0,TAU);c.fill()}
}
// ----- hits on obstacles -----
const DPAL={urn:['#d08a58','#a8623a','#6e3e24'],stump:['#c9a26a','#8a6038','#6b4a2a'],crystal:['#c9f3ff','#6fc9e8','#b8a0ff'],brazier:['#ffd86b','#ff8a3c','#5a5f68'],skulls:['#e8e2d0','#cfc7b2'],thorns:['#5f9e3c','#3f6a2a','#86b84a']};
function rockHit(k,x,y,a,big){
  const S=stonePal(),pal=DPAL[k.kind]||[S.hi,S.mid,S.lo],n=(big?10:5)+(k.kind==='crystal'?4:0);
  for(let i=0;i<n;i++){const ang=a+Math.PI+rand(-1.2,1.2),sp=rand(40,140)*(big?1.4:1);
    G.debris.push({x,y:y+2,z:rand(6,18),vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp*.7,vz:rand(70,180),col:pk(pal),s:rand(1.3,3),rot:rand(0,TAU),vr:rand(-18,18),life:rand(1.2,2.2),glow:k.kind==='crystal'||k.kind==='brazier'||k.kind==='lavarock'||k.kind==='cauldron',leaf:k.kind==='thorns'&&Math.random()<.6})}
  if(G.debris.length>240)G.debris.splice(0,G.debris.length-240);
  G.fx.push({k:'puff',x,y,vx:-Math.cos(a)*20,vy:-Math.sin(a)*20-8,t:.4,r:5});
  k.hit=.14;if(!k.temp)k.dmg=(k.dmg||0)+(big?2:1);{const ns=wearSt(k);if(ns>(k.lastSt||0)){k.lastSt=ns;k.hit=.24;shake(2);G.fx.push({k:'puff',x:k.x,y:k.y-kH(k)*.6,vx:0,vy:-14,t:.5,r:9});for(let i=0;i<8;i++){const ang=rand(0,TAU),sp=rand(60,150);G.debris.push({x:k.x,y:k.y,z:kH(k)*.7,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp*.6,vz:rand(60,140),col:pk(pal),s:rand(2.2,3.6),rot:rand(0,TAU),vr:rand(-14,14),life:rand(1.4,2.4),leaf:k.kind==='thorns'})}}}
  sfx('rock',k.kind,x);
  if(k.kind==='crystal'&&!k.temp&&!k.breaking){if(!k.chmax){k.chmax=k.r>=20?8:5;k.chp=k.chmax}k.chp-=big?2:1;if(k.chp<=0)breakCrystal(k)}
  if((k.kind==='stump'||k.kind==='thorns'||k.kind==='tomb'||k.kind==='urn')&&G.stuck.length<30)G.stuck.push({x,y,a,life:4,k});
}
function inPuddle(x,y){return G.puddles.find(p=>((x-p.x)/p.rx)**2+((y-p.y)/p.ry)**2<1)}
function splash(x,y,n,col){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(20,60);G.debris.push({x,y,z:1,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,vz:rand(60,120),col,s:1.3,rot:0,vr:0,life:.5,wet:true})}}
function stepFx(x,y,heavy){const pd=inPuddle(x,y);
  if(pd){G.ripples.push({x,y,r:3,max:heavy?40:20,a:1});splash(x,y,heavy?10:4,'#9fc7e0')}
  else{G.fx.push({k:'puff',x:x+rand(-4,4),y,vx:rand(-15,15),vy:rand(-10,-2),t:.35,r:heavy?7:3.2});if(heavy)dustRing(x,y,8)}}
function fallingPebbles(n){const S=stonePal();for(let i=0;i<n;i++)G.debris.push({x:rand(L+10,R-10),y:rand(TOP+10,BOT-10),z:rand(160,280),vx:0,vy:0,vz:-10,col:pk([S.hi,S.mid,S.lo]),s:rand(1.6,3),rot:rand(0,TAU),vr:rand(-6,6),life:3.2,fall:true})}
// ----- per-frame update -----
function updEnv(dt){
  const th=themeOf(G.room),E=G.env;
  for(const a of G.amb){a.t+=dt;
    if(a.k==='firefly'){a.vx=clamp(a.vx+rand(-40,40)*dt,-18,18);a.vy=clamp(a.vy+rand(-40,40)*dt,-18,18)}
    else if(a.k==='spore')a.vx=Math.sin(a.t*.8+a.ph)*9;
    else if(a.k==='ember')a.vx=Math.sin(a.t*1.7+a.ph)*12;
    else if(a.k==='ash')a.vx=Math.sin(a.t*.9+a.ph)*7+4;
    else if(a.k==='snow')a.vx=Math.sin(a.t*1.1+a.ph)*10-4;
    a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.x<L)a.x=R;if(a.x>R)a.x=L;if(a.y<TOP)a.y=BOT;if(a.y>BOT)a.y=TOP}
  if(th==='muschio'){G.leafT-=dt;if(G.leafT<=0){G.leafT=rand(1,2.6);G.debris.push({x:rand(L+10,R-60),y:rand(TOP+20,BOT-40),z:rand(160,240),vx:15,vy:0,vz:-30,col:pk(['#7bbf4a','#a8c04a','#c99a3a','#d9862e']),s:3.2,rot:rand(0,TAU),vr:2,life:7,leaf:true})}}
  if(th==='cristalli'){G.dripT-=dt;if(G.dripT<=0){G.dripT=rand(.4,1.2);const pd=G.puddles.length&&Math.random()<.65?pk(G.puddles):null;
    const x=pd?pd.x+rand(-pd.rx*.6,pd.rx*.6):rand(L+10,R-10),y=pd?pd.y+rand(-pd.ry*.5,pd.ry*.5):rand(TOP+10,BOT-10);G.debris.push({x,y,z:280,vx:0,vy:0,vz:-80,col:'#bfe9ff',s:1.6,rot:0,vr:0,life:3,drop:true})}}
  if(isSwamp(th)&&G.puddles.length){G.bubT-=dt;if(G.bubT<=0){G.bubT=rand(.25,.7);const pd=pk(G.puddles);const x=pd.x+rand(-pd.rx*.6,pd.rx*.6),y=pd.y+rand(-pd.ry*.5,pd.ry*.5);G.fx.push({k:'bub',x,y,t:.6,r:rand(1.5,3)});if(Math.random()<.4)G.ripples.push({x,y,r:2,max:12,a:.8})}}
  G.emberT-=dt;if(G.emberT<=0){G.emberT=.05;
    const srcs=(G.dark?[]:G.torches).map(t=>[t.x,t.y-16,1]).concat(G.rocks.filter(k=>k.kind==='brazier').map(k=>[k.x,k.y-46,1.4]),G.rocks.filter(k=>k.kind==='cauldron').map(k=>[k.x,k.y-30,.8]),(G.lavaLights||[]).filter((l,i)=>(i+Math.floor(G.t*3))%4===0).map(l=>[l.x,l.y,.6]));
    for(const[x,y,s] of srcs){if(Math.random()<.45)G.embers.push({k:'ember',x:x+rand(-3,3)*s,y,vx:rand(-12,12),vy:rand(-55,-25)*s,life:rand(.6,1.3),max:1.3,ph:rand(0,9)});
      if(Math.random()<.1)G.embers.push({k:'smoke',x,y:y-4*s,vx:rand(-4,4),vy:rand(-20,-10),life:rand(1,1.8),max:1.8,r:3*s})}}
  for(let i=G.embers.length-1;i>=0;i--){const e=G.embers[i];e.life-=dt;if(e.life<=0){G.embers.splice(i,1);continue}e.x+=(e.vx+(e.k==='ember'?Math.sin(G.t*6+e.ph)*14:0))*dt;e.y+=e.vy*dt;if(e.k==='smoke')e.r+=dt*6}
  for(let i=G.debris.length-1;i>=0;i--){const d=G.debris[i];d.life-=dt;
    if(d.leaf&&d.z>0){d.vz=-26;d.vx=Math.sin(G.t*2+d.rot)*22+10;d.vr=Math.sin(G.t*3+d.x)*3}
    else if(!d.leaf)d.vz-=(d.drop?900:d.fall?700:420)*dt;
    d.z+=d.vz*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.rot+=d.vr*dt;
    if(d.z<=0){d.z=0;
      if(d.drop){G.ripples.push({x:d.x,y:d.y,r:2,max:16,a:1});splash(d.x,d.y,4,'#bfe9ff');G.debris.splice(i,1);continue}
      if(d.wet){G.debris.splice(i,1);continue}
      if(d.fall){d.fall=false;G.fx.push({k:'puff',x:d.x,y:d.y,vx:0,vy:-6,t:.35,r:4});d.vz=Math.abs(d.vz)*.3}
      else if(d.vz<-30&&!d.leaf){d.vz*=-.32;d.vx*=.55;d.vy*=.55;d.vr*=.5}else{d.vz=0;const f=Math.pow(.02,dt);d.vx*=f;d.vy*=f;d.vr*=f}}
    if(d.life<=0)G.debris.splice(i,1)}
  for(let i=G.ripples.length-1;i>=0;i--){const r=G.ripples[i];r.r+=(r.max-r.r)*Math.min(1,dt*3);r.a-=dt*1.3;if(r.a<=0)G.ripples.splice(i,1)}
  for(const f of G.fogs){f.x+=f.vx*dt;if(f.x<L-160)f.x=R+150;if(f.x>R+160)f.x=L-150}
  for(const k of G.rocks)if(k.hit>0)k.hit-=dt;
  for(let i=G.stuck.length-1;i>=0;i--){const s=G.stuck[i];s.life-=dt;if(s.life<=0||!G.rocks.includes(s.k))G.stuck.splice(i,1)}
  if(P.moving&&P.dashT<=0){G.stepT-=dt;if(G.stepT<=0){G.stepT=.24;stepFx(P.x,P.y+8,false)}}
}
// ----- drawing -----
function flame(x,y,s,cols,ph){
  const t=G.t,n=k=>Math.sin(t*11+k+ph)*.5+Math.sin(t*17.3+k*2+ph)*.3+Math.sin(t*5.1+k*3)*.2;
  ctx.save();ctx.globalCompositeOperation='lighter';
  glow(hexRgb(cols[1]),x,y-8*s,30*s*(1+.08*n(9)),.55);
  const layer=(w,h,col,k)=>{const tip=n(k)*3*s,hh=h*s*(1+.18*n(k+1));ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w*s,y);
    ctx.bezierCurveTo(x-w*s*1.15,y-hh*.45,x+tip-w*s*.35,y-hh*.75,x+tip,y-hh);ctx.bezierCurveTo(x+tip+w*s*.35,y-hh*.75,x+w*s*1.15,y-hh*.45,x+w*s,y);ctx.closePath();ctx.fill()};
  layer(7,25,cols[0]+'dd',1);layer(5.2,18,cols[1]+'ee',4);layer(2.8,10,cols[2],7);
  for(let i=0;i<2;i++){const lick=(t*2.2+i*.5+ph)%1;ctx.fillStyle=cols[1]+Math.round((1-lick)*200).toString(16).padStart(2,'0');circ(x+Math.sin(t*9+i*3)*3*s,y-(14+lick*18)*s,(2.6-lick*2)*s);ctx.fill()}
  ctx.restore();
}
function drawTorch(t){
  const x=t.x,y=t.y,E=G.env;
  ink(2);ctx.fillStyle='#2e2f34';ctx.fillRect(x-4,y+4,8,12);ctx.strokeRect(x-4,y+4,8,12);
  ctx.strokeStyle='#1b1612';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y+8);ctx.lineTo(x,y-2);ctx.stroke();ctx.strokeStyle='#5a5f68';ctx.lineWidth=2;ctx.stroke();
  ink(2);ctx.beginPath();ctx.moveTo(x-7,y-4);ctx.lineTo(x+7,y-4);ctx.lineTo(x+4,y+3);ctx.lineTo(x-4,y+3);ctx.closePath();fs('#4a4f58');
  ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(x-5,y-3,3,2);
  if(G.dark){if(Math.random()<.04)G.embers.push({k:'smoke',x,y:y-8,vx:rand(-3,3),vy:-12,life:1.4,max:1.4,r:2})}else flame(x,y-4,1,E.torch,t.ph);
}
function torchLight(){
  const c=G.env.light;
  if(!G.dark)for(const t of G.torches){const f=.2+Math.sin(G.t*2.3+t.ph)*.012+Math.sin(G.t*5.9+t.ph)*.007;glow(c,t.x,TOP+30,190,f,150)}
  for(const s of G.shafts){const a=.07+.03*Math.sin(G.t*.7+s.ph);ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createLinearGradient(0,TOP,0,BOT);g.addColorStop(0,`rgba(255,250,220,${a*1.6})`);g.addColorStop(1,'rgba(255,250,220,0)');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(s.x,TOP);ctx.lineTo(s.x+s.w,TOP);ctx.lineTo(s.x+s.w+90,BOT);ctx.lineTo(s.x+90,BOT);ctx.closePath();ctx.fill();ctx.restore()}
}
function drawEnvGround(){
  for(const p of G.puddles){ctx.save();ctx.beginPath();ctx.ellipse(p.x,p.y,p.rx,p.ry,0,0,TAU);ctx.clip();
    ctx.strokeStyle=`rgba(200,230,255,${.09+.025*Math.sin(G.t*1.2+p.x)})`;ctx.lineWidth=1.5;
    for(let k=0;k<3;k++){const o=((G.t*6+k*9+p.x)%(p.rx*2))-p.rx;ctx.beginPath();ctx.moveTo(p.x+o-6,p.y-p.ry*.3+k*4);ctx.lineTo(p.x+o+6,p.y-p.ry*.3+k*4);ctx.stroke()}
    for(const t of G.torches){const dx=t.x-p.x;if(Math.abs(dx)<p.rx+40){glow(G.env.light,p.x+dx*.3,p.y,4,.32+.03*Math.sin(G.t*2.1+t.ph)+.015*Math.sin(G.t*5.3+t.ph*2),p.ry*.85)}}
    ctx.restore()}
  for(const r of G.ripples){ctx.strokeStyle=`rgba(210,235,255,${r.a*.7})`;ctx.lineWidth=1.5;ell(r.x,r.y,r.r,r.r*.5);ctx.stroke()}
  if(G.runeAt){const p2=G.enemies.some(e=>e.p2),rn=G.variant.rune,col=(RUNEC[rn]||RUNEC.witch)[p2?1:0],a=(p2?.45:.18)+.1*Math.sin(G.t*2);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${col},${a*.35})`;ctx.lineWidth=9;
    ctx.beginPath();ctx.ellipse(G.runeAt.x,G.runeAt.y,101,101*.62,0,0,TAU);ctx.stroke();ctx.strokeStyle=`rgba(${col},${a})`;ctx.lineWidth=2.5;ctx.stroke();
    for(let k=0;k<12;k++){const an=k/12*TAU+(G.variant.rune==='witch'?G.t*.2:0);circ(G.runeAt.x+Math.cos(an)*101,G.runeAt.y+Math.sin(an)*101*.62,2.5);ctx.fillStyle=`rgba(${col},${a+.2})`;ctx.fill()}
    ctx.restore()}
}
function drawStuck(s){const L1=13,bx=s.x-Math.cos(s.a)*L1,by=s.y-Math.sin(s.a)*L1;ctx.globalAlpha=Math.min(1,s.life);
  ctx.strokeStyle=INK;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(s.x,s.y);ctx.stroke();ctx.strokeStyle='#d9b27a';ctx.lineWidth=1.8;ctx.stroke();
  ctx.fillStyle='#f6ead2';ctx.save();ctx.translate(bx,by);ctx.rotate(s.a);ctx.fillRect(-2,-3,4,2);ctx.fillRect(-2,1,4,2);ctx.restore();ctx.globalAlpha=1}
function drawDebris(layer){
  for(const d of G.debris){const a=Math.min(1,d.life/.5),air=d.z>.5||d.drop||d.wet;
    if(layer==='ground'){if((d.z>1||d.fall)&&!d.wet){const k=1-Math.min(1,d.z/280);ctx.fillStyle=`rgba(0,0,0,${.28*k*a})`;ell(d.x,d.y,d.s*(1.6-k*.6),d.s*.6);ctx.fill()}if(air)continue}
    else if(!air)continue;
    ctx.globalAlpha=a;
    if(d.drop){ctx.strokeStyle='rgba(191,233,255,.85)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(d.x,d.y-d.z);ctx.lineTo(d.x,d.y-d.z-9);ctx.stroke()}
    else if(d.wet){ctx.fillStyle=d.col;circ(d.x,d.y-d.z,1.2);ctx.fill()}
    else if(d.leaf){ctx.save();ctx.translate(d.x,d.y-d.z);ctx.rotate(d.rot);ctx.fillStyle=d.col;ell(0,0,3.6,1.8);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(3,0);ctx.stroke();ctx.restore()}
    else{ctx.save();ctx.translate(d.x,d.y-d.z);ctx.rotate(d.rot);
      const s=d.s;ctx.fillStyle=d.col;ctx.beginPath();ctx.moveTo(-s,-s*.6);ctx.lineTo(s*.8,-s*.8);ctx.lineTo(s,s*.5);ctx.lineTo(-s*.5,s*.8);ctx.closePath();ctx.fill();
      if(s>2){ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke()}ctx.restore()}
    ctx.globalAlpha=1}
}
function drawAmbient(){
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const a of (LOWFX?[]:G.amb)){
    if(a.k==='firefly'){const b=(Math.sin(a.t*3+a.ph)+1)/2;glow('220,255,120',a.x,a.y,10,.6*b);ctx.fillStyle=`rgba(250,255,200,${b})`;circ(a.x,a.y,1.3);ctx.fill()}
    else if(a.k==='ember'){const b=.5+.5*Math.sin(a.t*5+a.ph);glow('255,130,50',a.x,a.y,6,.5*b);ctx.fillStyle=`rgba(255,${170+60*b|0},90,${.6+.4*b})`;circ(a.x,a.y,1.2);ctx.fill()}
    else if(a.k==='ash'){ctx.fillStyle=`rgba(150,140,135,${.12+.08*Math.sin(a.t+a.ph)})`;ctx.fillRect(a.x,a.y,2,1.4)}
    else if(a.k==='mote'){ctx.fillStyle=`rgba(255,220,170,${.14+.12*Math.sin(a.t*2+a.ph)})`;circ(a.x,a.y,1.1);ctx.fill()}
    else if(a.k==='snow'){ctx.fillStyle=`rgba(255,255,255,${.55+.25*Math.sin(a.t*1.7+a.ph)})`;circ(a.x,a.y,1+((a.ph*7)%1)*1.2);ctx.fill()}
    else{const col=a.k==='spore'?'200,140,255':'140,220,255',b=.4+.3*Math.sin(a.t*2.5+a.ph);glow(col,a.x,a.y,7,.55*b);ctx.fillStyle=`rgba(${col},${b})`;circ(a.x,a.y,1.2);ctx.fill()}}
  for(const e of G.embers)if(e.k==='ember'){const a=e.life/e.max;ctx.fillStyle=G.env.ember;ctx.globalAlpha=a;circ(e.x,e.y,1.3);ctx.fill()}
  ctx.globalAlpha=1;ctx.restore();
  for(const e of G.embers)if(e.k==='smoke'){ctx.fillStyle=`rgba(90,85,80,${.13*e.life/e.max})`;circ(e.x,e.y,e.r);ctx.fill()}
  if(!LOWFX)for(const f of G.fogs)glow(G.env.fog,f.x,f.y,f.r,f.a*1.4,f.r*.55);
}
const lc=document.createElement('canvas');lc.width=AW/3;lc.height=AH/3;const lx=lc.getContext('2d');lx.scale(1/3,1/3);
// resize the room: every canvas sized on the room follows it
const BIG={w:460,h:820,m:72};
function setWorld(w,h){if(w===AW&&h===AH)return;AW=w;AH=h;R=AW-24;BOT=AH-26;GC=Math.ceil((R-L)/CELL);GRW=Math.ceil((BOT-TOP)/CELL);fields={};
  for(const c of [floorCv,wallCv,sideCv]){c.width=AW*2;c.height=AH*2}lc.width=Math.ceil(AW/3);lc.height=Math.ceil(AH/3);lx.setTransform(1/3,0,0,1/3,0,0)}
const bigOn=()=>!SAVE.set||SAVE.set.big!==false;
// camera: top-left corner of the view inside the room; a little margin lets the chapter landscape show past the walls
function camTarget(){const m=BIG.m;let fx=P.x,fy=P.y;
  // while a boss makes its entrance the camera frames it together with the hero
  const bo=G.enemies&&G.enemies.find(e=>isBoss(e.type)&&e.intro>0&&!e.dead);if(bo){fx=bo.x*.75+P.x*.25;fy=bo.y*.75+P.y*.25+60}
  const ax=AW>VW?clamp(fx-VW/2,-m,AW+m-VW):0,ay=AH>VH?clamp(fy-VH*.55,-m,AH+m-VH):0;return[ax,ay]}
function camSnap(){const[a,b]=camTarget();G.vx=a;G.vy=b}
function camStep(dt){if(G.vx==null){camSnap();return}const[a,b]=camTarget(),k=1-Math.exp(-dt*6);G.vx+=(a-G.vx)*k;G.vy+=(b-G.vy)*k}
function drawLighting(pass){
  if(LOWFX&&!G.dark){const s=Math.min(cv.width/VW,cv.height/VH),ex=(cv.width-VW*s)/2/s+2,ey=Math.max(0,(cv.height-VH*s)/2)/s+2;ctx.drawImage(VIG,(G.vx||0)-ex,(G.vy||0)-ey,VW+ex*2,VH+ey*2);return}
  if(pass==='out'){ctx.save();ctx.beginPath();ctx.rect(-20,-20,AW+40,AH+40);ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip('evenodd');ctx.drawImage(lc,0,0,AW,AH);ctx.restore();return}
  lx.globalCompositeOperation='source-over';lx.clearRect(0,0,AW,AH);lx.fillStyle=`rgba(8,5,14,${G.dark?.95:G.env.dark})`;lx.fillRect(0,0,AW,AH);
  lx.globalCompositeOperation='destination-out';
  const spr=glowSprite('0,0,0'),Lt=(x,y,r,a)=>{lx.globalAlpha=Math.min(1,a*1.25);lx.drawImage(spr,x-r,y-r,r*2,r*2)};
  if(!G.dark)for(const t of G.torches){const f=1+Math.sin(G.t*2.3+t.ph)*.015+Math.sin(G.t*5.9+t.ph)*.008;Lt(t.x,t.y-6,60*f,1);Lt(t.x,TOP+30,170*f,.9)}
  for(const l of (G.lavaLights||[]))Lt(l.x,l.y,l.r*1.3,.55+.1*Math.sin(G.t*1.6+l.x));
  for(const k of G.rocks){if(k.kind==='cauldron'||k.kind==='lavarock')Lt(k.x,k.y-14,100,.8);if(k.kind==='brazier')Lt(k.x,k.y-20,135*(1+Math.sin(G.t*2.7+k.seed)*.015),.95);else if(k.kind==='crystal')Lt(k.x,k.y-12,95,.75);else if(k.kind==='lantern')Lt(k.x,k.y-kH(k)*.7,115,.85)}
  for(const m of (G.shroomLights||[]))Lt(m.x,m.y,40,.45);for(const b of G.lobs)if(b.t>=0&&(b.kind==='poison'||b.kind==='bomb'))Lt(b.tx,b.ty,30,.4);
  for(const s of G.shafts)Lt(s.x+s.w/2+45,(TOP+BOT)/2,140,.5);
  Lt(P.x,P.y-12,G.dark?95:110,G.dark?1:.8);for(const pt of G.pets||(G.pet?[G.pet]:[])){const lu=pt.id==='lucciola';Lt(pt.x,pt.y-(lu?26:12),lu?(G.dark?125:70):30,lu?.95:.4)}if(G.dark){Lt(P.x,P.y-12,48,1);for(const e of G.enemies)if(!e.hidden)Lt(e.x,e.y-14,20,.28);for(const a of G.arrows)Lt(a.x,a.y,18,.5)}
  for(const e of G.enemies){if(e.hidden)continue;if(e.type==='witch')Lt(e.x,e.y-20,90,.75);else if(e.type==='golem'&&e.p2)Lt(e.x,e.y-25,110,.7);else if(e.type==='wisp')Lt(e.x,e.y-14,55,.6*e.alpha);else if(e.type==='beetle'&&e.arm>0)Lt(e.x,e.y,55,.6);else if(e.type==='salamander')Lt(e.x,e.y-10,110,.8);else if(e.type==='smith')Lt(e.x,e.y-30,e.p2?140:100,.75);else if(e.type==='magmaslime'||e.type==='imp')Lt(e.x,e.y-8,48,.55);else if(ELIGHT[e.type])ELIGHT[e.type](e,Lt)}
  for(const m of G.meteors)if(m.t>=0)Lt(m.x,m.y,m.r*1.4,.5*m.t/m.dur);
  for(const l of G.lines)if(l.warn<=0)Lt(l.x+Math.cos(l.a)*l.len/2,l.y+Math.sin(l.a)*l.len/2,l.len*.6,.6);
  for(let i=0;i<G.eproj.length&&i<50;i++){const p=G.eproj[i];Lt(p.x,p.y,26,.55)}
  if(P.fire)for(let i=0;i<G.arrows.length&&i<20;i++){const a=G.arrows[i];Lt(a.x,a.y,22,.5)}
  for(const f of G.fx)if(f.k==='boom')Lt(f.x,f.y,f.r*1.6,.9);
  for(const z of G.zones)Lt(z.x,z.y,z.r*1.1,.3);
  if(G.door)Lt(AW/2,TOP-6,70,.85);
  if(G.prop)Lt(G.prop.x,G.prop.y-18,130,.9);
  lx.globalAlpha=1;lx.globalCompositeOperation='source-over';
  if(pass==='in'){ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.drawImage(lc,0,0,AW,AH);ctx.restore()}else ctx.drawImage(lc,0,0,AW,AH);
}

