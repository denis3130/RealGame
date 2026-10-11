// =====================================================================
// CHAPTERS 3 & 4 — Palude delle Lucciole (swamp) and Picchi di Brina (ice)
// environment: palettes, room variants, floor dressing, walls, obstacles, music
// =====================================================================
const SWAMPZ=['palude','rospo','canneto','idra'],ICEZ=['brina','yeti','ghiacciaio','regina'];
const isSwamp=th=>SWAMPZ.includes(th),isIce=th=>ICEZ.includes(th);
Object.assign(ENV,{
  palude:{wall:['#1f2a22','#25322a','#1b251e','#2a382e'],mortar:'#0f1511',side:'#18211b',floor:['#4a4a36','#454530','#504f3a','#3f3f2c'],base:'#33331f',torch:['#3aa800','#b8f04a','#f4ffd0'],light:'190,240,110',ember:'#d8ff7a',dark:.5,amb:{firefly:18,mote:6},fog:'110,140,90',door:'#2e3a2a'},
  rospo:{wall:['#202a1e','#283426','#1c241a','#2e3b2b'],mortar:'#0f140e',side:'#182016',floor:['#4c4b35','#46452f','#52513a','#403f2b'],base:'#34331f',torch:['#6aa800','#d8f04a','#fbffd8'],light:'210,240,110',ember:'#e8ff8a',dark:.48,amb:{firefly:14},fog:'120,150,80',door:'#2e3826'},
  canneto:{wall:['#1c2826','#22302d','#18221f','#283733'],mortar:'#0d1413',side:'#16201e',floor:['#3f4a3e','#3a4539','#465144','#353f34'],base:'#2c352b',torch:['#2aa860','#9cf0b4','#e8fff0'],light:'160,235,170',ember:'#c8ffd8',dark:.52,amb:{firefly:14,mote:8},fog:'120,160,140',door:'#26322e'},
  idra:{wall:['#1e2420','#252c27','#1a1f1c','#2b332d'],mortar:'#0d100e',side:'#161b18',floor:['#383d32','#343a2f','#3f4537','#30352b'],base:'#2a2e25',torch:['#7a2fd0','#c48aff','#f4e8ff'],light:'190,150,255',ember:'#e0c8ff',dark:.58,amb:{firefly:8,spore:10},fog:'90,120,80',door:'#262c26'},
  brina:{wall:['#3a4658','#425066','#34404f','#4a5870'],mortar:'#1c2330',side:'#2c3646',floor:['#c8d6e2','#bccbd8','#d2dfe9','#b2c2d0'],base:'#93a6b8',torch:['#1a62ff','#7fc8ff','#f0fbff'],light:'170,215,255',ember:'#d8f0ff',dark:.3,amb:{snow:34},fog:'210,230,255',door:'#3a4658'},
  yeti:{wall:['#38445a','#404e68','#323d52','#485670'],mortar:'#1a2130',side:'#2a3446',floor:['#bccbd8','#b1c1cf','#c6d4e0','#a8b8c7'],base:'#8c9fb2',torch:['#ff5a14','#ffa632','#fff1c0'],light:'255,190,120',ember:'#ffd8a0',dark:.32,amb:{snow:26},fog:'220,230,250',door:'#38445a'},
  ghiacciaio:{wall:['#2f4a62','#365470','#2a4258','#3e5c7a'],mortar:'#16222e',side:'#243a4e',floor:['#9ec4dc','#93bad4','#a8cde3','#8ab2cc'],base:'#6f93ad',torch:['#1a62ff','#5fb8ff','#e8f8ff'],light:'150,210,255',ember:'#bfe9ff',dark:.38,amb:{snow:14,cmote:12},fog:'190,225,255',door:'#2f4a62'},
  regina:{wall:['#41507a','#4a5a88','#3a476c','#536496'],mortar:'#1c2238',side:'#323e60',floor:['#a9c4e0','#9fbbd8','#b3cde8','#95b2d0'],base:'#7c95b6',torch:['#7a3cff','#b48aff','#f4eeff'],light:'180,165,255',ember:'#e6dcff',dark:.42,amb:{snow:22,cmote:14},fog:'200,190,255',door:'#41507a'}});
Object.assign(VARIANTS,{
  palude:[{n:'Acquitrino',water:4,lilies:9,reeds:6,mud:3,logs:1,grass:5},{n:'Isola dei funghi',water:2,mud:5,shrooms:12,reeds:3,grass:8},{n:'Passerella marcia',water:3,planks:1,reeds:8,lilies:4,mud:2}],
  rospo:[{n:'Trono del Re Rospo',rune:'rospo',water:3,lilies:10,reeds:6,mud:2}],
  canneto:[{n:'Canneto delle lucciole',reeds:14,water:3,lilies:5,shafts:2},{n:'Laguna nebbiosa',water:6,lilies:8,reeds:4,planks:1},{n:'Radura dei totem',mud:5,reeds:6,bones:3,water:2,shrooms:6}],
  idra:[{n:"Pozza dell'Idra",rune:'idra',pool:1,reeds:8,bones:4,mud:3}],
  brina:[{n:'Passo innevato',snow:9,tracks:2,rubble:3,cracks:1},{n:'Lago ghiacciato',icep:4,snow:4,cracks:2},{n:'Bosco di brina',snow:11,twigs:7,tracks:1}],
  yeti:[{n:'Tana dello Yeti',rune:'yeti',snow:10,bones:6,tracks:3}],
  ghiacciaio:[{n:'Ghiacciaio azzurro',icep:6,veins:5,snow:3,shafts:2},{n:'Caverna di cristallo',veins:9,icep:3,snow:2,rubble:3},{n:'Crepaccio',icep:3,snow:5,cracks:5,rubble:4}],
  regina:[{n:'Sala del Trono di Ghiaccio',rune:'regina',icep:5,veins:6,snow:3}]});
Object.assign(KINDS,{
  palude:{big:['deadtree','totem','mudmound'],small:['reeds','lantern','mudmound']},
  rospo:{big:['deadtree'],small:['reeds']},
  canneto:{big:['deadtree','mudmound','swamprock'],small:['reeds','reeds','lantern']},
  idra:{big:['totem'],small:['reeds']},
  brina:{big:['snowpine','iceblock','snowrock'],small:['snowman','crystal','snowrock']},
  yeti:{big:['iceblock'],small:['iceblock']},
  ghiacciaio:{big:['iceblock','frozenstatue','crystal'],small:['crystal','snowman','iceblock']},
  regina:{big:['frozenstatue'],small:['crystal']}});
Object.assign(KH,{deadtree:2.3,totem:2.4,mudmound:.7,reeds:1.5,lantern:1.6,swamprock:.9,iceblock:1.25,snowpine:2.7,frozenstatue:1.9,snowman:1.8,snowrock:.95});
Object.assign(DPAL,{deadtree:['#6b5a48','#4a3c30','#2e251d'],totem:['#8a6038','#c9a26a','#5a3c22'],mudmound:['#5a4a30','#3e3220','#7a6a48'],reeds:['#7a8a3a','#5a6a2a','#8a5a2a'],lantern:['#8a8a78','#5e604c','#c8f04a'],swamprock:['#7d7f68','#5e604c','#3e4033'],
  iceblock:['#e8f6ff','#a8d8f0','#6aa8d0'],snowpine:['#ffffff','#2a4a4a','#e0ecf4'],frozenstatue:['#c9d6e0','#8a9aa8','#e8f6ff'],snowman:['#ffffff','#e0ecf4','#ff8a3c'],snowrock:['#ffffff','#8a96a2','#5e6a76']});
Object.assign(MUSIC,{palude:'palude',rospo:'rospo',canneto:'canneto',idra:'idra',brina:'brina',yeti:'yetiM',ghiacciaio:'ghiacciaio',regina:'regina'});
const RUNEC={golem:['255,160,80','255,122,46'],magma:['255,120,40','255,70,20'],fabbro:['255,170,70','255,60,30'],witch:['123,240,192','255,138,60'],rospo:['200,240,90','255,190,60'],idra:['170,120,255','140,255,120'],yeti:['160,215,255','255,255,255'],regina:['190,170,255','120,220,255']};
// the stone used for rubble and plain rocks in each new world
function stonePal3(t){return isSwamp(t)?{hi:'#7d7f68',mid:'#5e604c',lo:'#3e4033',moss:'#5a7a32'}:t==='regina'?{hi:'#c8d4ec',mid:'#94a4c4',lo:'#64749a',moss:'#e8f4ff'}:{hi:'#c4d0dc',mid:'#8e9cac',lo:'#5e6c7c',moss:'#ffffff'}}

// ----- baked floor dressing -----
function bakeSwamp(c,V){
  const free=(x,y,m)=>!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+(m||10));
  const spot=m=>{for(let i=0;i<40;i++){const x=rand(L+18,R-18),y=rand(TOP+22,BOT-18);if(free(x,y,m))return[x,y]}return[rand(L+18,R-18),rand(TOP+22,BOT-18)]};
  const blob=(x,y,rx,ry,n,j)=>{c.beginPath();for(let k=0;k<n;k++){const a=k/n*TAU,q=1+Math.sin(k*2.7+x*.1)*j;const px=x+Math.cos(a)*rx*q,py=y+Math.sin(a)*ry*q;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()};
  // mud: dark wet patches that the light catches at the edge
  for(let i=0;i<(V.mud||0);i++){const[x,y]=spot(18),rx=rand(18,34),ry=rx*rand(.4,.55);blob(x,y,rx,ry,14,.16);c.fillStyle='rgba(40,32,18,.55)';c.fill();
    c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1.5;c.stroke();c.fillStyle='rgba(255,240,200,.08)';c.beginPath();c.ellipse(x-rx*.3,y-ry*.35,rx*.35,ry*.18,0,0,TAU);c.fill();
    for(let k=0;k<4;k++){c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();c.ellipse(x+rand(-rx*.6,rx*.6),y+rand(-ry*.5,ry*.5),rand(2,4),rand(1,2),0,0,TAU);c.stroke()}}
  // swamp water: murky pools with a lighter rim; they ripple and bubble during play
  const pools=[];
  if(V.pool){const x=AW/2,y=TOP+(BOT-TOP)*.33,rx=74,ry=40;pools.push([x,y,rx,ry]);G.swampPool={x,y,rx,ry}}
  for(let i=0;i<(V.water||0);i++){const[x,y]=spot(30),rx=rand(20,36),ry=rx*rand(.45,.58);pools.push([x,y,rx,ry])}
  for(const[x,y,rx,ry] of pools){
    blob(x,y+2,rx+5,ry+4,16,.1);c.fillStyle='rgba(30,26,14,.55)';c.fill();
    blob(x,y,rx,ry,16,.12);const g=c.createRadialGradient(x,y,2,x,y,rx);g.addColorStop(0,'#16241c');g.addColorStop(.75,'#1f3324');g.addColorStop(1,'#34492e');c.fillStyle=g;c.fill();
    c.strokeStyle='#1b1612';c.lineWidth=2;c.stroke();c.strokeStyle='rgba(190,230,140,.18)';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y-1,rx*.92,ry*.88,0,Math.PI*1.1,Math.PI*1.9);c.stroke();
    c.fillStyle='rgba(220,255,180,.07)';c.beginPath();c.ellipse(x-rx*.3,y-ry*.35,rx*.3,ry*.14,-.1,0,TAU);c.fill();
    G.puddles.push({x,y,rx:rx*.9,ry:ry*.9,swamp:true})}
  // lily pads on the water (and a few flowers)
  for(let i=0;i<(V.lilies||0);i++){const pd=pools.length?pk(pools):null;if(!pd)break;const a=rand(0,TAU),d=rand(0,.7),x=pd[0]+Math.cos(a)*pd[2]*d,y=pd[1]+Math.sin(a)*pd[3]*d,s=rand(4,7),rot=rand(0,TAU);
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x+1,y+1.5,s,s*.6,0,0,TAU);c.fill();
    c.fillStyle=pk(['#4f8a34','#5f9e3c','#3f7a2a']);c.strokeStyle='#1b1612';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,s,s*.6,0,rot,rot+TAU-.6);c.lineTo(x,y);c.closePath();c.fill();c.stroke();
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(rot+1.5)*s*.8,y+Math.sin(rot+1.5)*s*.5);c.stroke();
    if(Math.random()<.25){c.fillStyle=pk(['#f2a0c8','#f6ead2']);for(let k=0;k<5;k++){c.beginPath();c.ellipse(x+Math.cos(k*1.26)*1.8,y-1+Math.sin(k*1.26)*1.1,1.6,1,k*1.26,0,TAU);c.fill()}c.fillStyle='#ffd86b';c.beginPath();c.arc(x,y-1,.9,0,TAU);c.fill()}}
  // wooden boardwalk across the room
  if(V.planks){const y=rand(TOP+170,BOT-170),h=22;c.fillStyle='rgba(0,0,0,.35)';c.fillRect(L,y-h/2+3,R-L,h);
    for(let x=L;x<R;x+=11){const w=10,yy=y-h/2+rand(-1,1);c.fillStyle=pk(['#7a5a3a','#6b4a2a','#8a6844']);c.fillRect(x,yy,w,h);c.strokeStyle='#1b1612';c.lineWidth=1.2;c.strokeRect(x,yy,w,h);
      c.fillStyle='rgba(255,255,255,.08)';c.fillRect(x+1,yy+1,w-2,2);if(Math.random()<.4){c.fillStyle='#2a1f14';c.beginPath();c.arc(x+5,yy+4,.9,0,TAU);c.arc(x+5,yy+h-4,.9,0,TAU);c.fill()}}
    c.strokeStyle='#3a2a1d';c.lineWidth=3;c.beginPath();c.moveTo(L,y-h/2-1);c.lineTo(R,y-h/2-1);c.moveTo(L,y+h/2+1);c.lineTo(R,y+h/2+1);c.stroke()}
  // fallen logs
  for(let i=0;i<(V.logs||0);i++){const[x,y]=spot(30),w=rand(36,52),a=rand(-.5,.5);c.save();c.translate(x,y);c.rotate(a);c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(2,5,w/2+2,6,0,0,TAU);c.fill();
    c.fillStyle='#5a4230';c.strokeStyle='#1b1612';c.lineWidth=1.8;c.beginPath();c.rect(-w/2,-5,w,10);c.fill();c.stroke();c.fillStyle='#c9a26a';c.beginPath();c.ellipse(w/2,0,3.5,5,0,0,TAU);c.fill();c.stroke();
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;for(let k=-w/2+6;k<w/2-4;k+=7){c.beginPath();c.moveTo(k,-3);c.lineTo(k+4,-2);c.stroke()}c.restore()}
  // reed clumps: cattails seen from above, stems leaning
  for(let i=0;i<(V.reeds||0);i++){const[x,y]=Math.random()<.55?[Math.random()<.5?rand(L+6,L+44):rand(R-44,R-6),rand(TOP+20,BOT-14)]:spot(10);
    for(let k=0;k<randi(4,7);k++){const a=-Math.PI/2+rand(-.55,.55),h=rand(10,19),bx=x+rand(-5,5);c.strokeStyle='#1b1612';c.lineWidth=2.6;c.lineCap='round';c.beginPath();c.moveTo(bx,y);c.lineTo(bx+Math.cos(a)*h,y+Math.sin(a)*h);c.stroke();
      c.strokeStyle=pk(['#7a8a3a','#6a7a32','#8a9a44']);c.lineWidth=1.3;c.stroke();if(Math.random()<.5){c.fillStyle='#6b3f22';c.strokeStyle='#1b1612';c.lineWidth=1;c.beginPath();c.ellipse(bx+Math.cos(a)*h,y+Math.sin(a)*h,1.8,3.4,a+Math.PI/2,0,TAU);c.fill();c.stroke()}}}
  // little glowing mushrooms
  for(let i=0;i<(V.shrooms||0);i++){const[x,y]=spot(8),col=pk([['#ff9a3c','255,160,70'],['#7fe0f0','140,230,255'],['#c48ae8','200,140,255']]);
    for(let k=0;k<randi(2,4);k++){const px=x+rand(-5,5),py=y+rand(-3,3),s=rand(1.8,3.2);c.fillStyle='#e8dcc0';c.fillRect(px-.6,py-s,1.2,s+1);c.save();c.shadowColor=col[0];c.shadowBlur=6;c.fillStyle=col[0];c.beginPath();c.ellipse(px,py-s,s,s*.6,0,Math.PI,TAU);c.fill();c.restore()}
    G.lavaLights=G.lavaLights||[];G.shroomLights=(G.shroomLights||[]).concat([{x,y,rgb:col[1]}])}
}
function bakeIce(c,V){
  const free=(x,y,m)=>!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+(m||10));
  const spot=m=>{for(let i=0;i<40;i++){const x=rand(L+18,R-18),y=rand(TOP+22,BOT-18);if(free(x,y,m))return[x,y]}return[rand(L+18,R-18),rand(TOP+22,BOT-18)]};
  // frozen sheets: glassy, slippery
  G.icePatches=[];
  for(let i=0;i<(V.icep||0);i++){const[x,y]=spot(24),rx=rand(26,46),ry=rx*rand(.42,.56);
    c.beginPath();for(let k=0;k<14;k++){const a=k/14*TAU,q=1+Math.sin(k*2.1+x)*.1;const px=x+Math.cos(a)*rx*q,py=y+Math.sin(a)*ry*q;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();
    const g=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);g.addColorStop(0,'rgba(220,245,255,.85)');g.addColorStop(.5,'rgba(150,205,235,.8)');g.addColorStop(1,'rgba(110,170,215,.85)');c.fillStyle=g;c.fill();
    c.strokeStyle='rgba(60,100,140,.55)';c.lineWidth=1.6;c.stroke();
    c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1.4;c.lineCap='round';for(let k=0;k<3;k++){const ox=rand(-rx*.5,rx*.3),oy=rand(-ry*.4,ry*.3);c.beginPath();c.moveTo(x+ox,y+oy);c.lineTo(x+ox+rx*.25,y+oy-ry*.18);c.stroke()}
    c.strokeStyle='rgba(60,110,150,.35)';c.lineWidth=.9;for(let k=0;k<2;k++){let px=x+rand(-rx*.4,rx*.4),py=y+rand(-ry*.3,ry*.3);c.beginPath();c.moveTo(px,py);for(let j=0;j<3;j++){px+=rand(-8,8);py+=rand(-5,5);c.lineTo(px,py)}c.stroke()}
    G.icePatches.push({x,y,rx:rx*.92,ry:ry*.92})}
  // snowdrifts: soft white heaps with a blue shadow on one side
  for(let i=0;i<(V.snow||0);i++){const[x,y]=Math.random()<.5?[Math.random()<.5?rand(L+8,L+50):rand(R-50,R-8),rand(TOP+16,BOT-12)]:spot(12),rx=rand(12,26),ry=rx*rand(.35,.5);
    c.fillStyle='rgba(90,120,160,.35)';c.beginPath();c.ellipse(x+2,y+2,rx,ry,0,0,TAU);c.fill();
    c.fillStyle='#f4f8ff';c.beginPath();for(let k=0;k<12;k++){const a=k/12*TAU,q=1+Math.sin(k*3.1+y)*.14;const px=x+Math.cos(a)*rx*q,py=y+Math.sin(a)*ry*q;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill();
    c.fillStyle='rgba(170,200,230,.5)';c.beginPath();c.ellipse(x+rx*.25,y+ry*.3,rx*.6,ry*.4,0,0,TAU);c.fill();c.fillStyle='#ffffff';c.beginPath();c.ellipse(x-rx*.25,y-ry*.3,rx*.45,ry*.3,0,0,TAU);c.fill()}
  // footprints that wander through the room
  for(let i=0;i<(V.tracks||0);i++){let x=rand(L+20,R-20),y=BOT-10,a=-Math.PI/2+rand(-.4,.4);for(let k=0;k<14;k++){const s=k%2?1:-1,px=x+Math.cos(a+Math.PI/2)*s*4,py=y+Math.sin(a+Math.PI/2)*s*4;
      c.fillStyle='rgba(110,140,180,.35)';c.beginPath();c.ellipse(px,py,2.6,3.6,a+Math.PI/2,0,TAU);c.fill();x+=Math.cos(a)*14;y+=Math.sin(a)*14;a+=rand(-.25,.25);if(y<TOP+20)break}}
  // twigs and pine needles poking out of the snow
  for(let i=0;i<(V.twigs||0);i++){const[x,y]=spot(8);c.strokeStyle='#3a2a1d';c.lineWidth=1.6;c.lineCap='round';const a=rand(0,TAU),l=rand(7,13);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l*.5);c.moveTo(x+Math.cos(a)*l*.5,y+Math.sin(a)*l*.25);c.lineTo(x+Math.cos(a+.7)*l*.8,y+Math.sin(a+.7)*l*.4);c.stroke();
    c.fillStyle='#ffffff';c.beginPath();c.ellipse(x+Math.cos(a)*l*.4,y+Math.sin(a)*l*.2-1,3,1.4,a,0,TAU);c.fill()}
}
// ----- walls -----
function bakeWalls3(c,s,th){
  const avoidDoor=x=>Math.abs(x-AW/2)>DOORW+14&&!G.torches.some(t=>Math.abs(t.x-x)<14);
  if(isSwamp(th)){c.lineCap='round';
    // dark roots and thin vines hanging from the ceiling, a few glowing caps
    for(let i=0;i<6;i++){const x=rand(0,AW);if(!avoidDoor(x))continue;const len=rand(24,TOP+20),w=rand(3,7);
      for(const[col,lw] of [['#1b1612',w+3],['#3a2c1e',w],['rgba(255,220,170,.12)',w*.3]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(x,-4);c.bezierCurveTo(x+rand(-16,16),len*.3,x+rand(-16,16),len*.7,x+rand(-8,8),len);c.stroke()}}
    for(let i=0;i<10;i++){const x=rand(4,AW-4);if(!avoidDoor(x))continue;const len=rand(16,TOP-6);c.strokeStyle='#1b1612';c.lineWidth=2.6;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+rand(-6,6),len*.5,x+rand(-4,4),len);c.stroke();c.strokeStyle='#4a6a2a';c.lineWidth=1.2;c.stroke();
      c.fillStyle='#5a7a32';for(let y=8;y<len;y+=rand(7,12)){c.beginPath();c.ellipse(x+Math.sin(y)*2,y,2.4,1.2,Math.sin(y),0,TAU);c.fill()}}
    c.save();for(let i=0;i<7;i++){const x=rand(10,AW-10);if(!avoidDoor(x))continue;const y=rand(TOP*.45,TOP-8),col=pk(['#ff9a3c','#7fe0f0','#c8f04a']);c.shadowColor=col;c.shadowBlur=8;c.fillStyle=col;c.beginPath();c.ellipse(x,y,3.2,1.8,0,Math.PI,TAU);c.fill();c.shadowBlur=0;c.fillStyle='#e8dcc0';c.fillRect(x-.6,y,1.2,2.5)}c.restore();
    // wooden props shoring up the wall
    for(const x of [52,AW-52]){if(!avoidDoor(x))continue;c.fillStyle='#4a3524';c.strokeStyle='#1b1612';c.lineWidth=2;c.fillRect(x-4,10,8,TOP-10);c.strokeRect(x-4,10,8,TOP-10);c.fillRect(x-14,8,28,6);c.strokeRect(x-14,8,28,6)}
    // side walls: wet stone with dark streaks
    s.save();s.strokeStyle='rgba(20,30,20,.6)';s.lineWidth=2;for(let i=0;i<12;i++){const onLeft=Math.random()<.5,x=onLeft?rand(3,L-3):rand(R+3,AW-3),y=rand(TOP+10,BOT-30);s.beginPath();s.moveTo(x,y);s.lineTo(x+rand(-1,1),y+rand(14,30));s.stroke()}s.restore()}
  if(isIce(th)){
    // snow lying on the top of the wall, frost, a stone ledge with icicles
    c.fillStyle='#f4f8ff';c.beginPath();c.moveTo(0,0);for(let x=0;x<=AW;x+=8)c.lineTo(x,5+Math.sin(x*.21)*2.5+rand(0,2));c.lineTo(AW,0);c.closePath();c.fill();
    c.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<10;i++){c.beginPath();c.ellipse(rand(0,AW),rand(8,TOP-6),rand(8,20),rand(3,6),0,0,TAU);c.fill()}
    const ly=Math.round(TOP*.42);c.fillStyle='#5a6880';c.fillRect(0,ly,AW,5);c.fillStyle='#e8f2ff';c.fillRect(0,ly-2,AW,3);c.strokeStyle='#1b1612';c.lineWidth=1.2;c.strokeRect(-1,ly-2,AW+2,7);
    for(let x=6;x<AW;x+=rand(7,15)){if(!avoidDoor(x))continue;const h=rand(5,16);const g=c.createLinearGradient(x,ly+5,x,ly+5+h);g.addColorStop(0,'#e8f8ff');g.addColorStop(1,'rgba(160,215,255,.6)');c.fillStyle=g;c.beginPath();c.moveTo(x-2.4,ly+5);c.lineTo(x,ly+5+h);c.lineTo(x+2.4,ly+5);c.closePath();c.fill();c.strokeStyle='rgba(60,100,140,.6)';c.lineWidth=.8;c.stroke()}
    if(th==='ghiacciaio'||th==='regina'){c.save();c.shadowColor='#9fe6ff';c.shadowBlur=10;for(let i=0;i<5;i++){const x=rand(10,AW-10);if(!avoidDoor(x))continue;const y=rand(ly+14,TOP-8);for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*.5,h=rand(7,14);c.fillStyle=k===1?'#c9f0ff':'#8fd0f0';c.beginPath();c.moveTo(x+Math.cos(a+1.5)*3,y+Math.sin(a+1.5)*3);c.lineTo(x+Math.cos(a)*h,y+Math.sin(a)*h);c.lineTo(x+Math.cos(a-1.5)*3,y+Math.sin(a-1.5)*3);c.closePath();c.fill()}}c.restore()}
    if(th==='regina'){c.save();c.strokeStyle='rgba(200,180,255,.5)';c.lineWidth=1.4;c.shadowColor='#b48aff';c.shadowBlur=6;for(const x of [96,AW-96]){if(!avoidDoor(x))continue;c.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;c.moveTo(x,30);c.lineTo(x+Math.cos(a)*9,30+Math.sin(a)*9)}c.stroke()}c.restore()}
    // side walls: frost creeping up
    s.fillStyle='rgba(240,248,255,.55)';for(let i=0;i<14;i++){const onLeft=Math.random()<.5,x=onLeft?L-2:R+2,y=rand(TOP+10,BOT-10);s.beginPath();s.ellipse(x,y,4,rand(5,12),0,0,TAU);s.fill()}
    s.fillStyle='#f4f8ff';for(let x=0;x<AW;x+=6){s.beginPath();s.ellipse(x,BOT+2,5,2.5,0,0,TAU);s.fill()}}
}
// ----- obstacles -----
function drawRock3(k,x,y,r,sd,S){
  switch(k.kind){
    case 'deadtree':{const h=kH(k);
      ctx.strokeStyle=INK;ctx.lineWidth=6;const roots=[[-1.2,.25],[1.25,.35],[-.4,.65],[.7,-.05]];for(const[rx,ry] of roots){ctx.beginPath();ctx.moveTo(x,y-4);ctx.quadraticCurveTo(x+rx*r*.7,y+ry*r*.2,x+rx*r,y+ry*r*.4);ctx.stroke()}
      ctx.strokeStyle='#4a3c30';ctx.lineWidth=3;for(const[rx,ry] of roots){ctx.beginPath();ctx.moveTo(x,y-4);ctx.quadraticCurveTo(x+rx*r*.7,y+ry*r*.2,x+rx*r,y+ry*r*.4);ctx.stroke()}
      ink(2.5);const w=r*.55,lean=Math.sin(sd*5)*r*.18;
      ctx.beginPath();ctx.moveTo(x-w*1.25,y);ctx.quadraticCurveTo(x-w*.9,y-h*.5,x-w*.7+lean,y-h);ctx.lineTo(x-w*.1+lean,y-h-6);ctx.lineTo(x+w*.25+lean,y-h+3);ctx.lineTo(x+w*.7+lean,y-h-2);ctx.quadraticCurveTo(x+w,y-h*.5,x+w*1.25,y);ctx.closePath();
      ctx.fillStyle=vGrad(x-w,x+w,'#6b5a48','#4a3c30','#2e251d');ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.4;for(const f of [-.45,.05,.5]){ctx.beginPath();ctx.moveTo(x+f*w,y-3);ctx.quadraticCurveTo(x+f*w+lean*.4+2,y-h*.5,x+f*w*.8+lean,y-h+6);ctx.stroke()}
      // two broken branches
      for(const[s2,hy,len] of [[-1,.62,r*.9],[1,.78,r*.7]]){const bx=x+s2*w*.7+lean*hy,by=y-h*hy;ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx+s2*len*.5,by-len*.1,bx+s2*len,by-len*.5);ctx.stroke();ctx.strokeStyle='#4a3c30';ctx.lineWidth=3;ctx.stroke();
        ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(bx+s2*len*.6,by-len*.25);ctx.lineTo(bx+s2*len*.75,by+len*.05);ctx.stroke();ctx.strokeStyle='#4a3c30';ctx.lineWidth=1.6;ctx.stroke()}
      // a hollow knot and thin dead vines
      ink(2);ctx.beginPath();ctx.ellipse(x+lean*.5,y-h*.42,w*.28,w*.4,0,0,TAU);fs('#1a140e');
      ctx.strokeStyle='rgba(60,70,40,.8)';ctx.lineWidth=1.2;for(const vx of [-.5,.4]){const sx=x+vx*w+lean*.8,sy=y-h*.85;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx+Math.sin(G.t*1.3+vx*5)*2,sy+r*.5,sx+Math.sin(G.t*1.1+vx)*3,sy+r*.9);ctx.stroke()}
      ink(2.5);break}
    case 'totem':{const h=kH(k),w=r*.62;
      ell(x,y,r*.9,r*.36);fs('#3a2a1d');
      ctx.beginPath();ctx.rect(x-w,y-h,w*2,h);ctx.fillStyle=vGrad(x-w,x+w,'#a8784a','#8a6038','#5a3c22');ctx.fill();ctx.stroke();
      const face=(cy,big,col)=>{ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-w,cy+big*.55);ctx.lineTo(x+w,cy+big*.55);ctx.stroke();ink(1.8);
        for(const s2 of [-1,1]){ctx.beginPath();ctx.ellipse(x+s2*w*.42,cy-big*.12,w*.24,big*.16,0,0,TAU);fs(col)}
        ctx.fillStyle=INK;for(const s2 of [-1,1]){circ(x+s2*w*.42,cy-big*.12,w*.09);ctx.fill()}
        ctx.beginPath();ctx.moveTo(x-w*.5,cy+big*.24);ctx.lineTo(x+w*.5,cy+big*.24);ctx.lineTo(x+w*.35,cy+big*.36);ctx.lineTo(x-w*.35,cy+big*.36);ctx.closePath();fs('#2a1a10');
        ctx.fillStyle='#f6ead2';for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*w*.17-2,cy+big*.24);ctx.lineTo(x+i*w*.17,cy+big*.31);ctx.lineTo(x+i*w*.17+2,cy+big*.24);ctx.fill()}ink(2.5)};
      face(y-h*.25,h*.4,'#e5484d');face(y-h*.68,h*.38,'#ffd86b');
      // frog-head top with painted eyes
      ink(2.5);ctx.beginPath();ctx.ellipse(x,y-h,w*1.25,w*.55,0,Math.PI,TAU);ctx.closePath();fs('#5f9e3c');for(const s2 of [-1,1]){circ(x+s2*w*.7,y-h-w*.45,w*.32);fs('#7bbf4a');ctx.fillStyle='#1b1612';circ(x+s2*w*.7,y-h-w*.45,w*.13);ctx.fill();ink(2.5)}
      ctx.strokeStyle='#e5484d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-w*.95,y-h*.48);ctx.lineTo(x+w*.95,y-h*.48);ctx.stroke();ink(2.5);break}
    case 'mudmound':{const h=kH(k)+4;
      ctx.beginPath();ctx.moveTo(x-r*1.1,y+2);ctx.bezierCurveTo(x-r*.9,y-h*1.2,x+r*.9,y-h*1.25,x+r*1.1,y+2);ctx.quadraticCurveTo(x,y+r*.45,x-r*1.1,y+2);ctx.closePath();
      const g=ctx.createLinearGradient(x,y-h,x,y+4);g.addColorStop(0,'#7a6a48');g.addColorStop(.5,'#5a4a30');g.addColorStop(1,'#3a2e1c');ctx.fillStyle=g;ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,240,200,.2)';ell(x-r*.35,y-h*.75,r*.35,r*.14,-.2);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-r*.7,y-h*.3);ctx.quadraticCurveTo(x,y-h*.15,x+r*.7,y-h*.35);ctx.stroke();
      // mud bubbles that swell and pop
      for(let i=0;i<3;i++){const q=(G.t*.55+i*.37+sd)%1,bx=x+Math.sin(i*2.4+sd)*r*.55,by=y-h*(.45+.2*Math.cos(i*1.7)),br=q<.85?1+q*4:0;if(br>0){ink(1.2);circ(bx,by,br);fs('#6a5a3a');ctx.fillStyle='rgba(255,255,255,.35)';circ(bx-br*.35,by-br*.35,br*.3);ctx.fill()}else{ctx.strokeStyle='rgba(120,100,70,.8)';ctx.lineWidth=1;circ(bx,by,5);ctx.stroke()}}
      ink(2.5);break}
    case 'reeds':{const h=kH(k);ell(x,y,r*.85,r*.35);fs('#3e3a24');
      ctx.lineCap='round';const stems=[-.7,-.35,0,.3,.6,-.15,.45];
      stems.forEach((o,i)=>{const sw=Math.sin(G.t*1.4+i*1.3+sd)*2.2,bx=x+o*r,tx=bx+o*4+sw,ty=y-h*(.75+((i*37)%10)/40);
        ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(bx,y);ctx.quadraticCurveTo(bx+sw*.3,y-h*.5,tx,ty);ctx.stroke();ctx.strokeStyle=i%2?'#6a7a32':'#8a9a44';ctx.lineWidth=2;ctx.stroke();
        if(i%2===0){ink(1.8);ctx.save();ctx.translate(tx,ty+4);ctx.rotate(sw*.05);ctx.beginPath();ctx.ellipse(0,0,2.6,6,0,0,TAU);fs('#6b3f22');ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(tx,ty-2);ctx.lineTo(tx+sw*.2,ty-6);ctx.stroke()}
        else{ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx,y-h*.2);ctx.quadraticCurveTo(bx-6*Math.sign(o||1),y-h*.45,bx-9*Math.sign(o||1)+sw,y-h*.5);ctx.stroke();ctx.strokeStyle='#7a8a3a';ctx.lineWidth=1.5;ctx.stroke()}});
      ink(2.5);break}
    case 'lantern':{const h=kH(k),w=r*.5;
      ell(x,y,r*.8,r*.32);fs(S.lo);ctx.beginPath();ctx.rect(x-w*.55,y-h*.55,w*1.1,h*.55);ctx.fillStyle=vGrad(x-w,x+w,S.hi,S.mid,S.lo);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-w*1.2,y-h*.55);ctx.lineTo(x+w*1.2,y-h*.55);ctx.lineTo(x+w*.9,y-h*.62);ctx.lineTo(x-w*.9,y-h*.62);ctx.closePath();fs(S.mid);
      const by=y-h*.62,bh=h*.24;ctx.beginPath();ctx.rect(x-w*.8,by-bh,w*1.6,bh);fs('#2a2a20');
      const p=.75+.25*Math.sin(G.t*3+sd);ctx.save();ctx.globalCompositeOperation='lighter';glow('200,255,110',x,by-bh*.5,26,.55*p);ctx.restore();
      ctx.fillStyle=`rgba(220,255,140,${.75*p})`;ctx.fillRect(x-w*.55,by-bh*.85,w*1.1,bh*.7);
      for(let i=0;i<3;i++){const a=G.t*2.2+i*2.1,fxp=x+Math.cos(a)*w*.35,fyp=by-bh*.5+Math.sin(a*1.3)*bh*.25;ctx.fillStyle='#fbffd8';circ(fxp,fyp,1.2);ctx.fill()}
      ink(2.5);ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(x,by-bh);ctx.lineTo(x,by-bh-2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-w*1.3,by-bh);ctx.quadraticCurveTo(x,by-bh-h*.2,x+w*1.3,by-bh);ctx.closePath();fs(S.mid);break}
    case 'swamprock':{const pts=[];for(let i=0;i<10;i++){const a=i/10*TAU,rr=r*(.86+.14*Math.sin(sd*3+i*2.1));pts.push([x+Math.cos(a)*rr,y-r*.38+Math.sin(a)*rr*.86])}
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();const g=ctx.createLinearGradient(x-r,y-r*1.2,x+r,y+r*.4);g.addColorStop(0,S.hi);g.addColorStop(.5,S.mid);g.addColorStop(1,S.lo);ctx.fillStyle=g;ctx.fill();ctx.stroke();
      // dark wet line where the water reached, and shiny wet spots
      ctx.save();ctx.clip();ctx.fillStyle='rgba(20,30,20,.35)';ctx.fillRect(x-r*1.2,y-r*.15,r*2.4,r);ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.28)';ell(x-r*.38,y-r*.85,r*.3,r*.13,-.3);ctx.fill();ell(x+r*.3,y-r*.4,r*.12,r*.06);ctx.fill();break}
    case 'iceblock':{const h=kH(k),w=r*.95;
      ell(x,y+1,r*1.05,r*.42);ctx.fillStyle='rgba(60,110,150,.35)';ctx.fill();
      const top=y-h,rr=Math.min(6,w*.3);ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x-w,top,w*2,h,rr);else ctx.rect(x-w,top,w*2,h);
      const g=ctx.createLinearGradient(x-w,top,x+w,y);g.addColorStop(0,'rgba(235,250,255,.95)');g.addColorStop(.45,'rgba(160,215,240,.92)');g.addColorStop(1,'rgba(100,160,210,.95)');ctx.fillStyle=g;ctx.fill();ctx.stroke();
      // something frozen inside, chosen by the seed
      ctx.save();ctx.beginPath();ctx.rect(x-w+3,top+3,w*2-6,h-6);ctx.clip();ctx.globalAlpha=.42;const what=Math.floor(sd*3)%3;ink(1.6);
      if(what===0){ctx.save();ctx.translate(x,top+h*.55);ctx.rotate(.3);ctx.beginPath();ctx.ellipse(0,0,w*.5,h*.16,0,0,TAU);fs('#4a6a8a');ctx.beginPath();ctx.moveTo(w*.45,0);ctx.lineTo(w*.75,-h*.14);ctx.lineTo(w*.75,h*.14);ctx.closePath();fs('#4a6a8a');ctx.restore()}
      else if(what===1){circ(x,top+h*.5,w*.32);fs('#c9c2b0');ctx.fillStyle=INK;circ(x-w*.12,top+h*.48,w*.08);ctx.fill();circ(x+w*.12,top+h*.48,w*.08);ctx.fill()}
      else{ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-w*.5,top+h*.75);ctx.lineTo(x+w*.4,top+h*.3);ctx.stroke();ctx.strokeStyle='#c9cfd6';ctx.lineWidth=1.5;ctx.stroke()}
      ctx.restore();ctx.globalAlpha=1;
      ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.moveTo(x-w+4,top+5);ctx.lineTo(x-w*.2,top+5);ctx.lineTo(x-w+4,top+h*.55);ctx.closePath();ctx.fill();
      ctx.fillStyle='#f4f8ff';ctx.beginPath();ctx.moveTo(x-w-1,top+2);for(let i=0;i<=6;i++)ctx.lineTo(x-w+i*w/3,top-2-Math.sin(i*1.7+sd)*2.5);ctx.lineTo(x+w+1,top+2);ctx.closePath();ink(1.6);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(60,100,140,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+w*.3,top+h*.2);ctx.lineTo(x+w*.5,top+h*.5);ctx.lineTo(x+w*.35,top+h*.8);ctx.stroke();ink(2.5);break}
    case 'snowpine':{const h=kH(k);ctx.fillStyle='#4a3524';ctx.beginPath();ctx.rect(x-3.5,y-8,7,10);ink(2);ctx.fill();ctx.stroke();ell(x,y+1,r*.8,r*.3);ctx.fillStyle='rgba(240,248,255,.9)';ctx.fill();
      for(let i=0;i<4;i++){const ty=y-8-i*h*.22,tw=r*(1.15-i*.22),th2=h*.32;
        ctx.beginPath();ctx.moveTo(x-tw,ty);ctx.lineTo(x,ty-th2);ctx.lineTo(x+tw,ty);ctx.quadraticCurveTo(x,ty+4,x-tw,ty);ctx.closePath();ctx.fillStyle=i%2?'#26443f':'#2c4e48';ink(2.2);ctx.fill();ctx.stroke();
        ctx.fillStyle='#f4f8ff';ctx.beginPath();ctx.moveTo(x-tw*.85,ty-1);ctx.lineTo(x,ty-th2+2);ctx.lineTo(x+tw*.85,ty-1);ctx.quadraticCurveTo(x+tw*.4,ty-th2*.35,x+tw*.15,ty-th2*.28);ctx.quadraticCurveTo(x,ty-th2*.45,x-tw*.2,ty-th2*.3);ctx.quadraticCurveTo(x-tw*.5,ty-th2*.4,x-tw*.85,ty-1);ctx.closePath();ctx.fill();ctx.lineWidth=1.2;ctx.stroke()}
      ctx.fillStyle='#ffffff';circ(x,y-8-h*.88,3);ctx.fill();ink(2.5);break}
    case 'frozenstatue':{const fs2={sc:1.25,body:'#8a96a2',hood:'#6e7a86',skin:'#a8b4c0',foot:'#5e6a76',held:'sword',helm:true,belt:'#5e6a76',eyeCol:'#5e6a76',hoodTip:false};
      ell(x,y+1,r*.95,r*.38);fs('#6e7a86');ctx.beginPath();ctx.rect(x-r*.85,y-7,r*1.7,7);fs('#8a96a2');
      const keep=noShadow;noShadow=true;drawRig(x,y-8,Math.PI*.62+((sd*10|0)%3-1)*.4,1.2,false,fs2,{wind:(sd*10|0)%2===0});noShadow=keep;
      const h=kH(k);ctx.beginPath();ctx.moveTo(x-r*.95,y-6);ctx.lineTo(x-r*1.05,y-h*.7);ctx.lineTo(x-r*.5,y-h-6);ctx.lineTo(x+r*.6,y-h-2);ctx.lineTo(x+r*1.05,y-h*.6);ctx.lineTo(x+r*.95,y-6);ctx.closePath();
      ctx.fillStyle='rgba(170,220,250,.38)';ctx.fill();ctx.strokeStyle='rgba(60,110,150,.7)';ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(x-r*.85,y-h*.65);ctx.lineTo(x-r*.45,y-h-2);ctx.lineTo(x-r*.35,y-h*.75);ctx.closePath();ctx.fill();ink(2.5);break}
    case 'snowman':{const h=kH(k);ell(x,y+1,r*.85,r*.34);ctx.fillStyle='rgba(90,120,160,.35)';ctx.fill();
      const ball=(cy,rr)=>{ink(2.2);circ(x,cy,rr);const g=ctx.createRadialGradient(x-rr*.35,cy-rr*.4,rr*.1,x,cy,rr);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c8d8ea');ctx.fillStyle=g;ctx.fill();ctx.stroke()};
      const r1=r*.78,r2=r*.58,r3=r*.42,y1=y-r1*.9,y2=y1-r1*.75-r2*.6,y3=y2-r2*.75-r3*.6;
      ball(y1,r1);ball(y2,r2);
      ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.lineCap='round';const wave=Math.sin(G.t*2+sd)*.12;for(const s2 of [-1,1]){ctx.beginPath();ctx.moveTo(x+s2*r2*.8,y2);ctx.lineTo(x+s2*r2*1.7,y2-r2*(.5+(s2>0?wave:0)));ctx.lineTo(x+s2*r2*2,y2-r2*.95);ctx.stroke();ctx.strokeStyle='#5a3f2a';ctx.lineWidth=1.6;ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=3}
      ink(2);ctx.fillStyle='#1b1612';for(const by of [-.25,.2])circ(x,y2+r2*by,1.6),ctx.fill();
      ball(y3,r3);
      ctx.fillStyle='#e5484d';ctx.beginPath();ctx.rect(x-r3*1.05,y3+r3*.55,r3*2.1,r3*.42);ink(1.6);ctx.fill();ctx.stroke();ctx.beginPath();ctx.rect(x+r3*.35,y3+r3*.8,r3*.42,r3*1);ctx.fill();ctx.stroke();
      ctx.fillStyle='#1b1612';circ(x-r3*.35,y3-r3*.15,1.6);ctx.fill();circ(x+r3*.35,y3-r3*.15,1.6);ctx.fill();
      ctx.fillStyle='#ff8a3c';ctx.beginPath();ctx.moveTo(x,y3+r3*.05);ctx.lineTo(x+r3*1.2,y3+r3*.22);ctx.lineTo(x,y3+r3*.32);ctx.closePath();ink(1.2);ctx.fill();ctx.stroke();
      ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y3+r3*.35,r3*.35,.3,Math.PI-.3);ctx.stroke();
      ctx.fillStyle='#2a2a30';ctx.beginPath();ctx.rect(x-r3*.7,y3-r3*1.55,r3*1.4,r3*.75);ink(1.8);ctx.fill();ctx.stroke();ctx.beginPath();ctx.rect(x-r3*1.05,y3-r3*.85,r3*2.1,r3*.22);ctx.fill();ctx.stroke();
      ink(2.5);break}
    case 'snowrock':{const pts=[];for(let i=0;i<10;i++){const a=i/10*TAU,rr=r*(.86+.14*Math.sin(sd*3+i*2.1));pts.push([x+Math.cos(a)*rr,y-r*.38+Math.sin(a)*rr*.86])}
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();const g=ctx.createLinearGradient(x-r,y-r*1.2,x+r,y+r*.4);g.addColorStop(0,S.hi);g.addColorStop(.5,S.mid);g.addColorStop(1,S.lo);ctx.fillStyle=g;ctx.fill();ctx.stroke();
      ctx.save();ctx.clip();ctx.fillStyle='#f4f8ff';ctx.beginPath();ctx.moveTo(x-r*1.2,y-r*.7);for(let i=0;i<=8;i++)ctx.lineTo(x-r+i*r/4,y-r*.62+Math.sin(i*2.3+sd)*r*.12);ctx.lineTo(x+r*1.2,y-r*1.6);ctx.lineTo(x-r*1.2,y-r*1.6);ctx.closePath();ctx.fill();ctx.restore();
      ink(2.5);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.4)';ell(x-r*.4,y-r*.95,r*.3,r*.1,-.2);ctx.fill();break}
  }
}
function groundPatch3(c,k,th,x,y,r){
  if(isSwamp(th)){c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1.2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(x+rand(-r,r),y+r*.4+rand(-2,3),rand(3,6),rand(1.2,2.2),0,0,TAU);c.stroke()}
    c.lineCap='round';for(let i=0;i<3;i++){const a=rand(0,Math.PI),px=x+Math.cos(a)*r*1.1,py=y+Math.sin(a)*r*.5;c.strokeStyle='#5a6a2a';c.lineWidth=1.4;c.beginPath();c.moveTo(px,py);c.lineTo(px+rand(-3,3),py-rand(5,9));c.stroke()}}
  else if(isIce(th)){c.fillStyle='rgba(245,250,255,.85)';for(let i=0;i<6;i++){const a=rand(0,TAU),px=x+Math.cos(a)*r*1.05,py=y+Math.sin(a)*r*.48;c.beginPath();c.ellipse(px,py,rand(3,7),rand(1.5,3),0,0,TAU);c.fill()}}
}
function groundFront3(th,px,py,i,sd){
  if(isSwamp(th)){ctx.strokeStyle=i%2?'#6a7a32':'#8a9a44';ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+2,py-4,px+1+Math.sin(G.t*1.6+i+sd)*1.2,py-8);ctx.stroke();return true}
  if(isIce(th)){ctx.fillStyle='#f4f8ff';ctx.strokeStyle='rgba(60,90,130,.6)';ctx.lineWidth=.9;ell(px,py,3.2,1.6);ctx.fill();ctx.stroke();return true}
  return false}
// slippery ice: true when the point is on a frozen sheet
function onIce(x,y){if(!G.icePatches)return false;for(const p of G.icePatches){const dx=(x-p.x)/p.rx,dy=(y-p.y)/p.ry;if(dx*dx+dy*dy<1)return true}return false}

// ----- music for the two new worlds -----
Object.assign(TRACKS,{
  palude:{bpm:84,
    pad:[[57,60,64,67],[53,57,60,64],[55,59,62,65],[52,55,59,62]],roots:[45,41,43,40],
    ost:[0,7,12,15,12,7,10,7],
    mel:[[0,72,4],[4,71,2],[6,69,2],[8,67,6],[14,69,2],[16,64,8],[24,67,4],[28,69,4],[32,72,6],[38,74,2],[40,76,4],[44,74,4],[48,72,12]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar];
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.1,700);vBass(tr,t,r-12,spb*10,.21)}
      if(s%2===0)vHarp(tr,t,r+12+this.ost[(s/2)%8],.9,s%8===0?.09:.055);
      if(cyc>0)for(const[ss,m,l] of this.mel)if(ss===loop)vFlute(tr,t,m-(cyc%2?0:12),spb*l*.95,.07);
      if(s===0||s===9)dDrum(tr,t,s?.3:.42,120,70,.22,600,.25);if(s===6||s===14)dTom(tr,t,.14,260);if(s===12)dDrum(tr,t,.18,320,180,.08,1800,.5);dShaker(tr,t,s%2?.04:.02)}},
  canneto:{bpm:72,
    pad:[[62,65,69,72],[60,64,67,71],[58,62,65,69],[57,60,64,67]],roots:[38,36,34,33],
    hi:[[81,84,88,86],[79,83,86,84],[77,81,84,82],[76,79,83,81]],
    mel:[[0,74,8],[8,72,4],[12,69,4],[16,70,8],[24,69,8],[32,74,6],[38,77,2],[40,76,8],[48,72,16]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar];
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.11,1300);vBass(tr,t,r,spb*14,.18)}
      if([0,3,6,10,13].includes(s))vBell(tr,t,this.hi[bar][[0,3,6,10,13].indexOf(s)%4]-12,2,.035);
      if(cyc%2===1)for(const[ss,m,l] of this.mel)if(ss===loop)vFlute(tr,t,m,spb*l*.95,.065);
      if(s===0||s===10)dTom(tr,t,.24,110);dShaker(tr,t,.016)}},
  rospo:{bpm:118,
    pad:[[52,55,59],[52,56,59],[50,53,57],[51,55,58]],roots:[40,40,38,39],
    riff:[0,0,7,0,10,0,7,3],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar],cyc=Math.floor(step/64);
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.09,800);vBell(tr,t,r+36,1.4,.04)}
      if(s%2===0){vBass(tr,t,r+this.riff[s/2],spb*1.5,.2);if(cyc>0&&s%4===0)vBrass(tr,t,r+24+this.riff[s/2],spb*1.2,.06)}
      if(s===3||s===11)dDrum(tr,t,.35,380,140,.09,900,.3);// the "croak" knock
      if([0,6,8,14].includes(s))dTaiko(tr,t,{0:.9,6:.5,8:.8,14:.6}[s]);if(s===4||s===12)dFrame(tr,t,.4);dShaker(tr,t,s%2?.045:.025)}},
  idra:{bpm:100,
    choir:[[53,56,60],[54,58,61],[53,56,60],[51,55,58]],roots:[41,42,41,39],
    pat:[0,12,7,13,12,7,15,12],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar],cyc=Math.floor(step/64);
      if(s===0){vChoir(tr,t,this.choir[bar],spb*16,.13);vBass(tr,t,r-12,spb*14,.23)}
      vHarp(tr,t,r+24+this.pat[s%8],.55,s%4===0?.08:.045);
      if(cyc%2===1&&s===8)vBell(tr,t,r+36,2.4,.045);
      if([0,5,8,11,14].includes(s))dTaiko(tr,t,{0:.95,5:.45,8:.8,11:.5,14:.6}[s]);if(s===2||s===10)dTom(tr,t,.22,140);dShaker(tr,t,s%2?.04:.022)}},
  brina:{bpm:80,
    pad:[[64,67,71,74],[60,64,67,71],[62,66,69,72],[59,62,66,69]],roots:[40,36,38,35],
    hi:[[88,91,95,93],[84,88,91,89],[86,90,93,91],[83,86,90,88]],
    mel:[[0,76,6],[6,74,2],[8,71,8],[16,72,6],[22,71,2],[24,69,8],[32,71,4],[36,74,4],[40,79,6],[46,78,2],[48,76,16]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar];
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.11,1800);vBass(tr,t,r,spb*14,.19)}
      const hits=[0,3,6,8,11,14];if(hits.includes(s)){const k=hits.indexOf(s);vBell(tr,t,this.hi[bar][(k+cyc)%4]-12,2.2,.035+(s===0?.015:0))}
      if(cyc>0)for(const[ss,m,l] of this.mel)if(ss===loop)vFlute(tr,t,m,spb*l*.95,.065);
      if(s===0||s===8)dTom(tr,t,.26,110);if(s===12)dDrum(tr,t,.08,1200,800,.04,5000,.7);dShaker(tr,t,.014)}},
  ghiacciaio:{bpm:68,
    pad:[[59,62,66,69],[57,60,64,67],[55,59,62,66],[54,57,61,64]],roots:[35,33,31,30],
    mel:[[0,78,8],[8,76,8],[16,74,12],[28,73,4],[32,71,8],[40,74,8],[48,76,16]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar];
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.12,2000);vChoir(tr,t,this.pad[bar].slice(0,3),spb*16,.05);vBass(tr,t,r+12,spb*14,.15)}
      if(s%4===2)vBell(tr,t,r+48+[0,7,12,14][(s>>2)%4],2.6,.03);
      if(cyc%2===1)for(const[ss,m,l] of this.mel)if(ss===loop)vBell(tr,t,m,spb*l*1.5,.05);
      if(s===0)dTom(tr,t,.2,90);dShaker(tr,t,.01)}},
  yetiM:{bpm:128,
    pad:[[52,55,59],[53,57,60],[52,55,59],[50,55,58]],roots:[40,41,40,38],
    riff:[0,0,12,0,3,0,5,7],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar],cyc=Math.floor(step/64);
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.09,900);if(bar%2===0)vBell(tr,t,r+36,2,.05)}
      if(s%2===0){vBrass(tr,t,r+12+this.riff[s/2],spb*1.5,.075);vBass(tr,t,r,spb*1.6,.17)}
      if(cyc%2===1&&s%2===1)vBell(tr,t,r+48+[0,3,7,12][(s>>1)%4],.4,.025);
      if([0,3,8,10,12,14].includes(s))dTaiko(tr,t,{0:1,3:.55,8:.85,10:.55,12:.45,14:.65}[s]);if(s===4||s===12)dTom(tr,t,.28,190);dShaker(tr,t,s%2?.05:.03)}},
  regina:{bpm:110,
    choir:[[64,67,71],[62,65,69],[60,64,67],[59,63,66]],roots:[40,38,36,35],
    arp:[0,7,12,16,19,16,12,7],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,r=this.roots[bar],cyc=Math.floor(step/64);
      if(s===0){vChoir(tr,t,this.choir[bar],spb*16,.13);vBass(tr,t,r-12,spb*14,.2);vBell(tr,t,r+48,3,.045)}
      vHarp(tr,t,r+24+this.arp[s%8],.5,s%4===0?.08:.045);
      if(cyc>0&&(s===6||s===14))vBell(tr,t,r+43+(s===14?5:0),1.6,.035);
      if([0,6,8,14].includes(s))dTaiko(tr,t,s===0?.9:.55);if(s===11)dTom(tr,t,.3,160);dShaker(tr,t,s%2?.04:.02)}}});

// =====================================================================
// NEW ENEMIES — chapter 1 (necromancer), chapter 2 (bomber), chapter 3 swamp, chapter 4 ice
// every type has: stats, AI, a drawing with its own frames, shadow, light, hit colour, xp, sound material
// =====================================================================
Object.assign(ET,{
  necro:{r:12,hp:70,cdmg:10,gold:5},bonelet:{r:9,hp:22,cdmg:8,gold:1},
  bomber:{r:12,hp:62,cdmg:10,gold:4},
  frog:{r:12,hp:52,cdmg:11,gold:3},mosquito:{r:10,hp:34,cdmg:11,gold:3},croc:{r:15,hp:100,cdmg:17,gold:5},snail:{r:14,hp:90,cdmg:12,gold:4},tadpole:{r:8,hp:18,cdmg:7,gold:1},
  toad:{r:34,hp:3500,cdmg:22,gold:70,name:'Re Rospo',title:'Sovrano della palude'},
  hydra:{r:30,hp:5600,cdmg:24,gold:110,name:"Idra della Palude",title:'Tre teste, nessuna pietà'},
  wolf:{r:13,hp:74,cdmg:15,gold:4},snowspirit:{r:11,hp:46,cdmg:9,gold:4},icesentinel:{r:16,hp:135,cdmg:14,gold:6},qmirror:{r:18,hp:1,cdmg:10,gold:0},
  yeti:{r:32,hp:4700,cdmg:25,gold:85,name:'Yeti delle Vette',title:'Il ruggito della valanga'},
  icequeen:{r:20,hp:7200,cdmg:22,gold:140,name:'Regina dei Ghiacci',title:'Signora dei Picchi di Brina'}});

Object.assign(ECOL,{necro:'#6a8a4a',bonelet:'#e8e2d0',bomber:'#a8642a',frog:'#5fb84a',mosquito:'#8a4a3a',croc:'#6b7a3a',snail:'#c8b85a',tadpole:'#3a5a2a',toad:'#6a8a3a',hydra:'#3f7a4a',
  wolf:'#9aaabe',snowspirit:'#d8f0ff',icesentinel:'#8fd0f0',qmirror:'#c8e8ff',yeti:'#e8eef6',icequeen:'#bfe0ff'});
Object.assign(XPV,{necro:7,bonelet:2,bomber:6,frog:5,mosquito:5,croc:9,snail:8,tadpole:1,toad:90,hydra:0,wolf:7,snowspirit:7,icesentinel:10,qmirror:0,yeti:100,icequeen:0});
Object.assign(MAT_OF,{necro:'flesh',bonelet:'bone',bomber:'flesh',frog:'goo',mosquito:'shell',croc:'flesh',snail:'goo',tadpole:'goo',toad:'goo',hydra:'flesh',wolf:'flesh',snowspirit:'spirit',icesentinel:'ice',qmirror:'ice',yeti:'flesh',icequeen:'ice'});
Object.assign(BOSS_INTRO,{toad:2.7,hydra:3,yeti:3.1,icequeen:2.9});

const BLOCK={};// arrows that hit a guard: return true and the arrow stops without damage
const EUPD={},EDRAW={},ESHADOW={},ELIGHT={};

