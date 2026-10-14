// =====================================================================
// THE PACKS (punti 26-28 e 31-32 del piano di Denis): the Classic packs, the Zombie packs (five rarities each) and the Lucky Cards packs
// (four rarities), each with its own cover; they open by dragging a finger along the dashed line at the top (a little above or below the
// line works too), the pack tears, the strip flies off, the cards come out one by one (the same reveal as the chests). A tap ends only the
// step that is playing (src/js/09-apertura-casse.js: CHskip), never the whole opening.
// The covers are painted like the Zombie della lanterna: three tones on every piece, a rim of light, soft glows, the thick dark outline.
// Classic: fantasy, coloured, magic. Zombie: worn, dark, unsettling. Lucky Cards: sealed envelopes of an occult fortune-teller.
// =====================================================================
const PKW=100,PKH=150,PKLINE=21;
const PACKN={classica:{c:'Bustina del Viandante',r:"Bustina dell'Esploratore",e:"Bustina dell'Arcano",l:'Bustina della Fenice',i:"Bustina dell'Eclissi"},
  zombie:{c:'Sacchetto del Becchino',r:'Busta da Trincea',e:'Busta della Quarantena',l:'Reliquiario del Camposanto',i:'Patto di Carne'},
  lucky:{c:'Busta del Ferro di Cavallo',r:"Busta dei Dadi d'Osso",e:'Busta del Gatto Nero',l:"Busta del Quadrifoglio d'Oro"}};
// the light of each pack in the opening (glow, background, sparks) and the size on the screen
const PKFX={classica:{c:{g:'#a6e36e',bg:'#173a12',cols:['#e9ffd0','#a6e36e','#fff6c8']},r:{g:'#79b2ff',bg:'#0f2650',cols:['#ffffff','#79b2ff','#d6e8ff']},
    e:{g:'#c98cff',bg:'#2a1050',cols:['#ffffff','#e2a8ff','#b874e6','#ffd9ff']},l:{g:'#ffc23a',bg:'#3d2600',cols:['#fff6c8','#ffd84a','#ff8a3a','#ffffff']},
    i:{g:'#ff5a2a',bg:'#1a0508',cols:['#ffd06a','#ff6a2a','#ff2a2a','#ffffff','#ffb0f0']}},
  zombie:{c:{g:'#c8a070',bg:'#1a140c',cols:['#d8c0a0','#8a6a4a','#fff0d0']},r:{g:'#a6c070',bg:'#121a0c',cols:['#d0e0a0','#7e8e52','#f0f0d0']},
    e:{g:'#9dff6a',bg:'#0b1a08',cols:['#9dff6a','#e0ff9a','#5aa83a','#ffffff']},l:{g:'#7bffb0',bg:'#06140e',cols:['#7bffb0','#c8ffd8','#f0cf7a','#ffffff']},
    i:{g:'#ff3a3a',bg:'#160404',cols:['#ff4a3a','#8a0a0a','#ffd0c0','#ffffff']}},
  lucky:{c:{g:'#8ae06a',bg:'#0c1a0e',cols:['#b8ff9a','#5fbf4a','#ffffff']},r:{g:'#6ae0ff',bg:'#0a1624',cols:['#c8f4ff','#6ae0ff','#ffffff']},
    e:{g:'#ffd84a',bg:'#150a20',cols:['#ffd84a','#c88cff','#ffffff']},l:{g:'#7dffa0',bg:'#071208',cols:['#7dffa0','#ffd84a','#ffffff','#c8ffd0']}}};
const pkLv=(kind,rar)=>kind==='lucky'?['c','r','e','l'].indexOf(rar):PR.indexOf(rar);
// ------------------------------------------------------------------ painting helpers (pack units: 100 × 150)
const pkG=(g,x0,y0,x1,y1,st)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);for(const[o,c] of st)gr.addColorStop(o,c);return gr};
const pkR=(g,x,y,r0,r1,st)=>{const gr=g.createRadialGradient(x,y,r0,x,y,r1);for(const[o,c] of st)gr.addColorStop(o,c);return gr};
const pkRnd=s=>{let v=s*9301+49297;return()=>{v=(v*9301+49297)%233280;return v/233280}};
function pkInk(g,w){g.strokeStyle=INK;g.lineWidth=w;g.lineJoin='round';g.lineCap='round';g.stroke()}
// a soft light (additive), like the glows of the lantern
function pkGlow(g,x,y,r,col,a){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.fillStyle=pkR(g,x,y,0,r,[[0,col],[1,'rgba(0,0,0,0)']]);g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
// the pouch of the Classic and Zombie packs: puffed at the sides, crimped at the top and the bottom
function pkBody(g){g.beginPath();g.moveTo(7,12);g.bezierCurveTo(30,10.6,70,10.6,93,12);g.bezierCurveTo(97.4,50,97.4,100,93,138);g.bezierCurveTo(70,139.4,30,139.4,7,138);g.bezierCurveTo(2.6,100,2.6,50,7,12);g.closePath()}
function pkCrimp(g,top,P){const y0=top?2.6:136.6,y1=top?13.4:147.4;g.beginPath();
  if(top){g.moveTo(6,y1);for(let i=0;i<=22;i++)g.lineTo(6+i*4,y0+(i%2?2.4:0));g.lineTo(94,y1)}else{g.moveTo(6,y0);g.lineTo(94,y0);for(let i=22;i>=0;i--)g.lineTo(6+i*4,y1-(i%2?2.4:0))}
  g.closePath();g.fillStyle=pkG(g,0,y0,0,y1,[[0,P.cA],[.45,P.cB],[1,P.cC]]);g.fill();
  g.save();g.clip();g.lineWidth=.8;for(let x=7;x<94;x+=2.6){g.strokeStyle='rgba(255,255,255,.2)';g.beginPath();g.moveTo(x,y0);g.lineTo(x,y1);g.stroke();g.strokeStyle='rgba(0,0,0,.28)';g.beginPath();g.moveTo(x+1.3,y0);g.lineTo(x+1.3,y1);g.stroke()}g.restore();
  pkInk(g,2)}
// the body in three tones: lit on the left, the base, the shadow on the right and at the bottom; then the outline and the rim of light
function pkShade(g,P){pkBody(g);g.fillStyle=P.b;g.fill();g.save();pkBody(g);g.clip();
  g.fillStyle=pkG(g,3,0,97,0,[[0,P.a],[.24,P.b],[.68,P.b],[1,P.c]]);g.fillRect(0,0,PKW,PKH);
  g.fillStyle=pkG(g,0,10,0,140,[[0,'rgba(255,255,255,.12)'],[.45,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.34)']]);g.fillRect(0,0,PKW,PKH);g.restore()}
function pkEdge(g,P){g.save();pkBody(g);g.clip();g.strokeStyle=P.rim;g.lineWidth=1.8;g.beginPath();g.moveTo(8.8,17);g.bezierCurveTo(5.2,55,5.2,100,8.8,133);g.stroke();
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;g.beginPath();g.moveTo(91.6,17);g.bezierCurveTo(95,55,95,100,91.6,133);g.stroke();g.restore();pkBody(g);pkInk(g,2.8)}
// the foil's shine passing over the pack (k: how strong)
function pkShine(g,t,k,clip){if(k<=0)return;g.save();clip(g);g.clip();const x=-60+((t*.32)%1.7)*170;g.globalCompositeOperation='lighter';
  g.fillStyle=pkG(g,x-18,0,x+18,40,[[0,'rgba(255,255,255,0)'],[.5,`rgba(255,255,255,${.32*k})`],[1,'rgba(255,255,255,0)']]);g.beginPath();g.moveTo(x-14,0);g.lineTo(x+10,0);g.lineTo(x+40,PKH);g.lineTo(x+16,PKH);g.closePath();g.fill();g.restore()}
// the ribbon with the rarity's name
function pkRibbon(g,y,txt,P,w){w=w||64;const x0=50-w/2,x1=50+w/2;g.beginPath();g.moveTo(x0-7,y-5.5);g.lineTo(x0+2,y-5.5);g.lineTo(x0+2,y+5.5);g.lineTo(x0-7,y+5.5);g.lineTo(x0-4,y);g.closePath();
  g.moveTo(x1+7,y-5.5);g.lineTo(x1-2,y-5.5);g.lineTo(x1-2,y+5.5);g.lineTo(x1+7,y+5.5);g.lineTo(x1+4,y);g.closePath();g.fillStyle=P.rc;g.fill();pkInk(g,1.6);
  g.beginPath();g.rect(x0,y-7,w,14);g.fillStyle=pkG(g,0,y-7,0,y+7,[[0,P.ra],[.5,P.rb],[1,P.rc]]);g.fill();pkInk(g,1.8);
  g.font='9.5px "Lilita One",system-ui';g.textAlign='center';g.textBaseline='middle';g.lineWidth=2.8;g.strokeStyle=INK;g.strokeText(txt,50,y+.6);g.fillStyle=P.rt||'#fff';g.fillText(txt,50,y+.6)}
// a small word (the mode) in the top band
function pkWord(g,txt,y,col,sz){g.font=`${sz||7}px "Lilita One",system-ui`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=2.2;g.strokeStyle=INK;g.strokeText(txt,50,y);g.fillStyle=col;g.fillText(txt,50,y)}
// a gem (rubies, the crystal): facets in three tones and a spark
function pkGem(g,x,y,r,c,n){n=n||6;const pts=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*TAU/n;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}
  g.beginPath();pts.forEach(p=>g.lineTo(p[0],p[1]));g.closePath();g.fillStyle=c[1];g.fill();
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];g.beginPath();g.moveTo(x,y);g.lineTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.closePath();g.fillStyle=i<n/2-1?c[0]:i>n/2?c[2]:c[1];g.globalAlpha=.75;g.fill();g.globalAlpha=1}
  g.beginPath();pts.forEach(p=>g.lineTo(p[0],p[1]));g.closePath();pkInk(g,Math.max(1,r*.28));g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(x-r*.35,y-r*.38,r*.2,0,TAU);g.fill()}
// ------------------------------------------------------------------ the Classic covers
const PKP={
  classica:{c:{a:'#a8e070',b:'#6fae42',c:'#3f7426',cA:'#cfe9a8',cB:'#8cbc5c',cC:'#4f7f30',rim:'rgba(240,255,200,.6)',ra:'#e8c47a',rb:'#c0903e',rc:'#6e4a14'},
    r:{a:'#7fb6ff',b:'#3f7fe0',c:'#1f4594',cA:'#e6efff',cB:'#a9bfdc',cC:'#5d7290',rim:'rgba(220,235,255,.65)',ra:'#8fb8ff',rb:'#3f74d0',rc:'#173a78'},
    e:{a:'#c08cff',b:'#8a4fd6',c:'#4a2482',cA:'#ffe9a0',cB:'#e2b040',cC:'#8a6010',rim:'rgba(255,220,255,.55)',ra:'#f2c860',rb:'#c8901e',rc:'#6e4808'},
    l:{a:'#ffe89a',b:'#eab02c',c:'#a06414',cA:'#fff4c8',cB:'#f0c860',cC:'#a8721a',rim:'rgba(255,250,220,.8)',ra:'#e8463a',rb:'#c4241e',rc:'#7a0e0e',rt:'#fff2c0'},
    i:{a:'#3e2c4c',b:'#1e1426',c:'#0a060e',cA:'#6a5030',cB:'#3a2a18',cC:'#140c06',rim:'rgba(255,140,80,.55)',ra:'#3a0a0a',rb:'#1a0404',rc:'#0a0202',rt:'#ffb050'}},
  zombie:{c:{a:'#c8a678',b:'#9c7a50',c:'#5e4428',cA:'#b8a07a',cB:'#8a704c',cC:'#4a3a24',rim:'rgba(255,236,200,.35)',ra:'#8a7454',rb:'#6a5434',rc:'#3a2814'},
    r:{a:'#7f8f55',b:'#5a683a',c:'#333d1f',cA:'#8a9070',cB:'#5e6448',cC:'#2e3222',rim:'rgba(220,230,180,.35)',ra:'#7e7e62',rb:'#5a5a42',rc:'#2e2e20'},
    e:{a:'#8a9a62',b:'#647440',c:'#34401e',cA:'#3a3a32',cB:'#24241e',cC:'#0e0e0a',rim:'rgba(190,255,140,.4)',ra:'#c83a2a',rb:'#962216',rc:'#5a0e08',rt:'#ffe0d0'},
    l:{a:'#7e5638',b:'#5a3a24',c:'#2e1c10',cA:'#f0cf7a',cB:'#c99a3a',cC:'#6a4a14',rim:'rgba(150,255,200,.4)',ra:'#d8a84a',rb:'#a8781e',rc:'#5a3a08'},
    i:{a:'#dcc4b6',b:'#b39688',c:'#6e5248',cA:'#6a6a70',cB:'#44444a',cC:'#1e1e22',rim:'rgba(255,200,190,.45)',ra:'#7a0a0a',rb:'#4a0404',rc:'#200000',rt:'#ffd0c0'}}};
function pkClassic(g,rar,t,P,fx){const R={c:'COMUNE',r:'RARA',e:'EPICA',l:'LEGGENDARIA',i:'IMPLACABILE'}[rar];
  if(rar==='c'){// the wanderer's linen: a stitched border, the moss sprout in a parchment badge
    g.save();pkBody(g);g.clip();g.strokeStyle='rgba(255,250,220,.75)';g.lineWidth=1.3;g.setLineDash([3,2.4]);g.beginPath();g.moveTo(12,18);g.bezierCurveTo(9,60,9,95,12,132);g.lineTo(88,132);g.bezierCurveTo(91,95,91,60,88,18);g.closePath();g.stroke();g.setLineDash([]);
    g.strokeStyle='rgba(40,70,20,.18)';g.lineWidth=.6;for(let y=16;y<136;y+=3){g.beginPath();g.moveTo(4,y);g.lineTo(96,y+1);g.stroke()}g.restore();
    g.beginPath();g.arc(50,66,25,0,TAU);g.fillStyle=pkR(g,44,58,2,28,[[0,'#fffbe8'],[.6,'#f1e2b6'],[1,'#c9b07a']]);g.fill();pkInk(g,2.4);
    g.strokeStyle='rgba(120,90,40,.5)';g.lineWidth=1;g.setLineDash([2.2,2]);g.beginPath();g.arc(50,66,20.5,0,TAU);g.stroke();g.setLineDash([]);
    // the sprout: a stem and two leaves (three tones each)
    g.beginPath();g.moveTo(50,84);g.bezierCurveTo(49,76,48,70,51,62);g.strokeStyle=INK;g.lineWidth=4.6;g.stroke();g.strokeStyle='#5a9a32';g.lineWidth=2.4;g.stroke();
    const leaf=(dx,s)=>{g.beginPath();g.moveTo(51,64);g.bezierCurveTo(51+dx*4,52,51+dx*14,50,51+dx*19,48);g.bezierCurveTo(51+dx*16,60,51+dx*8,66,51,64);g.closePath();
      g.fillStyle=pkG(g,51,48,51+dx*19,66,[[0,s?'#c8f08a':'#a6e06a'],[.6,'#7bbf4a'],[1,'#3f7426']]);g.fill();pkInk(g,2);g.strokeStyle='rgba(255,255,220,.6)';g.lineWidth=1;g.beginPath();g.moveTo(52,62);g.quadraticCurveTo(51+dx*8,55,51+dx*15,50.5);g.stroke()};
    leaf(-1,1);leaf(1,0);g.fillStyle='#e8fbff';g.beginPath();g.arc(66,50,1.8,0,TAU);g.fill();pkGlow(g,50,62,26,'rgba(200,255,150,.5)',.4);
    pkRibbon(g,112,R,P,58)}
  else if(rar==='r'){// the explorer's blue cloth: silver filigree in the corners, a compass rose with a glowing blue stone, a few stars
    g.save();pkBody(g);g.clip();const rn=pkRnd(7);for(let i=0;i<14;i++){const x=12+rn()*76,y=18+rn()*114,s=.6+rn()*1.2;g.fillStyle=`rgba(220,236,255,${.35+rn()*.4})`;g.beginPath();g.arc(x,y,s,0,TAU);g.fill()}
    const fil=(x,y,sx,sy)=>{g.save();g.translate(x,y);g.scale(sx,sy);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(10,0,14,6,12,12);g.bezierCurveTo(10,16,4,14,6,10);g.moveTo(0,0);g.bezierCurveTo(0,10,6,14,12,12);
      g.strokeStyle=INK;g.lineWidth=3.4;g.stroke();g.strokeStyle='#dfe8f6';g.lineWidth=1.6;g.stroke();g.restore()};fil(10,18,1,1);fil(90,18,-1,1);fil(10,132,1,-1);fil(90,132,-1,-1);g.restore();
    g.beginPath();g.arc(50,66,24,0,TAU);g.fillStyle=pkR(g,44,58,2,26,[[0,'#2c5cb0'],[1,'#14306a']]);g.fill();pkInk(g,2.4);g.strokeStyle='#c9d6ea';g.lineWidth=1.6;g.beginPath();g.arc(50,66,20,0,TAU);g.stroke();
    for(let k=0;k<8;k++){const a=k*TAU/8-Math.PI/2,L=k%2?13:21,w=k%2?3.4:5;g.beginPath();g.moveTo(50+Math.cos(a)*L,66+Math.sin(a)*L);g.lineTo(50+Math.cos(a+Math.PI/2)*w,66+Math.sin(a+Math.PI/2)*w);g.lineTo(50,66);g.closePath();g.fillStyle=k%2?'#9fb0c8':'#f2f6ff';g.fill();
      g.beginPath();g.moveTo(50+Math.cos(a)*L,66+Math.sin(a)*L);g.lineTo(50+Math.cos(a-Math.PI/2)*w,66+Math.sin(a-Math.PI/2)*w);g.lineTo(50,66);g.closePath();g.fillStyle=k%2?'#6e7f98':'#c6d2e6';g.fill()}
    for(let k=0;k<8;k++){const a=k*TAU/8-Math.PI/2,L=k%2?13:21,w=k%2?3.4:5;g.beginPath();g.moveTo(50+Math.cos(a)*L,66+Math.sin(a)*L);g.lineTo(50+Math.cos(a+Math.PI/2)*w,66+Math.sin(a+Math.PI/2)*w);g.lineTo(50,66);g.lineTo(50+Math.cos(a-Math.PI/2)*w,66+Math.sin(a-Math.PI/2)*w);g.closePath();pkInk(g,1.1)}
    pkGem(g,50,66,5.2,['#bfe0ff','#4d97ff','#1d3f78'],6);pkGlow(g,50,66,16,'rgba(120,190,255,.9)',.35+.15*Math.sin(t*2.4));
    pkRibbon(g,112,R,P,48)}
  else if(rar==='e'){// the arcane velvet: a gold frame, runes turning around a magenta crystal that glows
    g.save();pkBody(g);g.clip();g.strokeStyle=INK;g.lineWidth=4.4;g.strokeRect(11,18,78,114);g.strokeStyle=pkG(g,0,18,0,132,[[0,'#fff0b0'],[.5,'#e2b040'],[1,'#8a6010']]);g.lineWidth=2.2;g.strokeRect(11,18,78,114);
    for(const[x,y] of[[11,18],[89,18],[11,132],[89,132]]){g.beginPath();g.arc(x,y,3.4,0,TAU);g.fillStyle='#f0c450';g.fill();pkInk(g,1.4)}
    // the swirling velvet: soft darker curls
    g.strokeStyle='rgba(30,0,60,.25)';g.lineWidth=1.2;for(let i=0;i<5;i++){g.beginPath();g.arc(20+i*16,40+(i%2)*70,14,0,Math.PI*1.4);g.stroke()}g.restore();
    g.save();g.translate(50,64);g.rotate(fx?t*.35:0);g.font='7px serif';g.textAlign='center';g.textBaseline='middle';const RN='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ';
    for(let k=0;k<12;k++){g.save();g.rotate(k*TAU/12);g.fillStyle=`rgba(255,220,140,${.55+.35*Math.sin(t*2+k)})`;g.fillText(RN[k],0,-27);g.restore()}
    g.strokeStyle='rgba(255,210,120,.55)';g.lineWidth=1;g.beginPath();g.arc(0,0,22.5,0,TAU);g.stroke();g.beginPath();g.arc(0,0,31.5,0,TAU);g.stroke();g.restore();
    pkGlow(g,50,64,34,'rgba(230,120,255,.85)',.45+.2*Math.sin(t*3));
    // the crystal: a tall faceted stone in a gold setting
    g.beginPath();g.moveTo(50,42);g.lineTo(61,58);g.lineTo(57,82);g.lineTo(43,82);g.lineTo(39,58);g.closePath();g.fillStyle='#c050e0';g.fill();
    g.beginPath();g.moveTo(50,42);g.lineTo(39,58);g.lineTo(46,62);g.closePath();g.fillStyle='#ffc8ff';g.fill();g.beginPath();g.moveTo(50,42);g.lineTo(46,62);g.lineTo(54,62);g.closePath();g.fillStyle='#ee8cff';g.fill();
    g.beginPath();g.moveTo(50,42);g.lineTo(54,62);g.lineTo(61,58);g.closePath();g.fillStyle='#a030c0';g.fill();g.beginPath();g.moveTo(39,58);g.lineTo(46,62);g.lineTo(43,82);g.closePath();g.fillStyle='#d878f0';g.fill();
    g.beginPath();g.moveTo(61,58);g.lineTo(54,62);g.lineTo(57,82);g.closePath();g.fillStyle='#7a1a98';g.fill();g.beginPath();g.moveTo(50,42);g.lineTo(61,58);g.lineTo(57,82);g.lineTo(43,82);g.lineTo(39,58);g.closePath();pkInk(g,2.2);
    g.beginPath();g.moveTo(36,80);g.lineTo(64,80);g.lineTo(60,88);g.lineTo(40,88);g.closePath();g.fillStyle=pkG(g,0,80,0,88,[[0,'#fff0b0'],[.5,'#e2b040'],[1,'#8a6010']]);g.fill();pkInk(g,1.8);
    g.fillStyle='#fff';g.beginPath();g.arc(46,52,1.6,0,TAU);g.fill();
    if(fx)for(let k=0;k<5;k++){const p=(t*.5+k*.2)%1,x=50+Math.sin(k*2.3+t)*18,y=82-p*50;g.fillStyle=`rgba(255,200,255,${Math.sin(p*Math.PI)*.8})`;g.beginPath();g.arc(x,y,1.1,0,TAU);g.fill()}
    pkRibbon(g,112,R,P,48)}
  else if(rar==='l'){// the phoenix: gold foil with a sunburst, rubies in the corners, the bird spreading its fiery wings
    g.save();pkBody(g);g.clip();g.translate(50,62);for(let k=0;k<24;k++){g.rotate(TAU/24);g.fillStyle=k%2?'rgba(255,250,210,.22)':'rgba(140,80,0,.14)';g.beginPath();g.moveTo(0,0);g.lineTo(-5,-100);g.lineTo(5,-100);g.closePath();g.fill()}g.restore();
    for(const[x,y] of[[15,22],[85,22],[15,128],[85,128]])pkGem(g,x,y,4.6,['#ff9a8a','#e5262a','#7a0a0a'],6);
    pkGlow(g,50,60,36,'rgba(255,140,40,.9)',.5+.2*Math.sin(t*3.2));
    // the tail of flames
    const fl=(x,y,s,c)=>{g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-6*s,y+10*s,x-2*s,y+16*s,x+2*s,y+24*s);g.bezierCurveTo(x+3*s,y+14*s,x+7*s,y+8*s,x,y);g.closePath();g.fillStyle=c;g.fill()};
    for(let k=-2;k<=2;k++){const w=Math.sin(t*5+k)*1.4;g.save();g.translate(50+k*5+w,76);g.rotate(k*.22);fl(0,0,1.15-Math.abs(k)*.12,k%2?'#ff7a2a':'#ffd040');g.restore()}
    // the wings: three feathers a side in three tones
    for(const sd of[-1,1]){for(let f=0;f<3;f++){g.beginPath();g.moveTo(50+sd*5,62);g.bezierCurveTo(50+sd*(16+f*4),50-f*8,50+sd*(28+f*6),40-f*6,50+sd*(38-f*2),30+f*2);g.bezierCurveTo(50+sd*(30-f*2),46-f*2,50+sd*(18),60,50+sd*5,66);g.closePath();
        g.fillStyle=['#ffcf50','#ff8a2a','#e0401a'][f];g.fill();pkInk(g,1.6)}}
    g.beginPath();g.ellipse(50,64,7,11,0,0,TAU);g.fillStyle=pkG(g,44,54,56,74,[[0,'#ffe080'],[.5,'#ff9a30'],[1,'#c0400e']]);g.fill();pkInk(g,1.8);
    g.beginPath();g.arc(50,50,5.6,0,TAU);g.fillStyle='#ffb040';g.fill();pkInk(g,1.6);g.beginPath();g.moveTo(54,50);g.lineTo(60,52);g.lineTo(54,53.4);g.closePath();g.fillStyle='#ffe28a';g.fill();pkInk(g,1.2);
    g.fillStyle=INK;g.beginPath();g.arc(51.6,49,1.2,0,TAU);g.fill();g.beginPath();g.moveTo(48,45);g.quadraticCurveTo(47,38,52,35);g.quadraticCurveTo(50,40,51,45);g.closePath();g.fillStyle='#ffd040';g.fill();pkInk(g,1.1);
    pkRibbon(g,112,R,P,64)}
  else{// the eclipse: obsidian with molten cracks that breathe, a black sun with a burning corona and a crown, embers rising
    g.save();pkBody(g);g.clip();const rn=pkRnd(31),br=.55+.45*Math.sin(t*2.2);
    for(let i=0;i<9;i++){let x=10+rn()*80,y=16+rn()*118;g.beginPath();g.moveTo(x,y);for(let s=0;s<5;s++){x+=(rn()-.5)*22;y+=(rn()-.5)*22;g.lineTo(x,y)}
      g.strokeStyle=`rgba(255,${90+Math.round(80*br)},40,${.35+.4*br})`;g.lineWidth=2.6;g.stroke();g.strokeStyle='rgba(255,230,160,.85)';g.lineWidth=.8;g.stroke()}
    g.restore();
    g.save();pkBody(g);g.clip();g.strokeStyle='#8a6a2a';g.lineWidth=1.4;g.strokeRect(10,17,80,116);g.strokeStyle='rgba(255,200,120,.35)';g.strokeRect(12.5,19.5,75,111);g.restore();
    // the corona: flames all around a black disc
    pkGlow(g,50,62,44,'rgba(255,90,30,.95)',.6+.25*br);
    g.save();g.translate(50,62);for(let k=0;k<20;k++){const a=k*TAU/20+t*.25,L=27+5*Math.sin(t*4+k*1.7);g.save();g.rotate(a);g.beginPath();g.moveTo(-3.4,-19);g.quadraticCurveTo(0,-L-4,3.4,-19);g.closePath();
      g.fillStyle=k%2?'#ff8a2a':'#ffd060';g.fill();g.restore()}g.restore();
    g.beginPath();g.arc(50,62,19,0,TAU);g.fillStyle=pkR(g,46,58,2,20,[[0,'#1a1020'],[1,'#000']]);g.fill();g.strokeStyle='#ffdf90';g.lineWidth=1.6;g.stroke();pkInk(g,.8);
    // the crown above the eclipse
    g.beginPath();g.moveTo(35,40);g.lineTo(37,28);g.lineTo(41.5,36);g.lineTo(45.5,24);g.lineTo(50,35);g.lineTo(54.5,24);g.lineTo(58.5,36);g.lineTo(63,28);g.lineTo(65,40);g.closePath();
    g.fillStyle=pkG(g,0,24,0,40,[[0,'#fff0b0'],[.5,'#d8a838'],[1,'#7a5410']]);g.fill();pkInk(g,1.8);for(const x of[37,45.5,54.5,63]){g.fillStyle='#ff3a2a';g.beginPath();g.arc(x,x===37||x===63?29:25.5,1.4,0,TAU);g.fill()}
    // the eye of the eclipse: a thin red slit that opens a little
    const op=.4+.6*Math.max(0,Math.sin(t*.9));g.beginPath();g.ellipse(50,62,8,2.4*op+.4,0,0,TAU);g.fillStyle='#ff3a1a';g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(50,62,1.2,2*op+.3,0,0,TAU);g.fill();
    if(fx)for(let k=0;k<10;k++){const p=(t*.22+k*.1)%1,x=14+((k*37)%72)+Math.sin(t*1.3+k)*4,y=134-p*118;g.fillStyle=`rgba(255,${150+((k*40)%100)},60,${Math.sin(p*Math.PI)*.9})`;g.beginPath();g.arc(x,y,.9+(k%3)*.4,0,TAU);g.fill()}
    pkRibbon(g,112,R,P,72)}}
// ------------------------------------------------------------------ the Zombie covers
function pkZombie(g,rar,t,P,fx){const R={c:'COMUNE',r:'RARA',e:'EPICA',l:'LEGGENDARIA',i:'IMPLACABILE'}[rar];
  if(rar==='c'){// the gravedigger's paper bag: creases, a coffee ring, tape, a marker drawing of a stitched face
    g.save();pkBody(g);g.clip();const rn=pkRnd(3);for(let i=0;i<12;i++){const x=8+rn()*84,y=16+rn()*118,L=8+rn()*20,a=rn()*Math.PI;g.strokeStyle='rgba(255,240,210,.22)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();
      g.strokeStyle='rgba(50,30,10,.22)';g.beginPath();g.moveTo(x+.8,y+.8);g.lineTo(x+.8+Math.cos(a)*L,y+.8+Math.sin(a)*L);g.stroke()}
    g.strokeStyle='rgba(70,40,15,.35)';g.lineWidth=2.6;g.beginPath();g.ellipse(72,104,12,10,.3,.3,TAU-.6);g.stroke();g.strokeStyle='rgba(70,40,15,.15)';g.lineWidth=5;g.beginPath();g.ellipse(72,104,12,10,.3,0,TAU);g.stroke();
    g.save();g.translate(22,24);g.rotate(-.5);g.fillStyle='rgba(232,218,170,.85)';g.fillRect(-16,-5,32,10);g.strokeStyle='rgba(120,100,60,.5)';g.lineWidth=.8;g.strokeRect(-16,-5,32,10);g.restore();g.restore();
    // the face drawn with a marker: a round head, X eyes, a stitched grin
    g.save();g.translate(50,64);g.strokeStyle='#1a120c';g.lineCap='round';g.lineJoin='round';g.lineWidth=2.4;g.beginPath();g.moveTo(-1,-22);g.bezierCurveTo(16,-24,24,-10,21,6);g.bezierCurveTo(19,19,6,25,-4,23);g.bezierCurveTo(-18,21,-24,8,-21,-6);g.bezierCurveTo(-19,-17,-10,-22,-1,-22);g.stroke();
    for(const sx of[-9,9]){g.beginPath();g.moveTo(sx-4,-8);g.lineTo(sx+4,0);g.moveTo(sx+4,-8);g.lineTo(sx-4,0);g.stroke()}
    g.beginPath();g.moveTo(-12,10);g.quadraticCurveTo(0,17,13,9);g.stroke();g.lineWidth=1.6;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(k*5,10.5+Math.abs(k)*-.6);g.lineTo(k*5-.5,16);g.stroke()}
    g.lineWidth=1.4;g.beginPath();g.moveTo(16,-16);g.lineTo(20,-12);g.moveTo(20,-16);g.lineTo(16,-12);g.stroke();g.restore();
    pkRibbon(g,112,R,P,58)}
  else if(rar==='r'){// the trench bag: olive canvas, a sprayed skull and bones stencil with drips, rivets, a sewn patch
    g.save();pkBody(g);g.clip();g.strokeStyle='rgba(0,0,0,.09)';g.lineWidth=.6;for(let i=0;i<60;i++){g.beginPath();g.moveTo(0,10+i*2.4);g.lineTo(100,10+i*2.4);g.stroke()}for(let i=0;i<44;i++){g.beginPath();g.moveTo(i*2.4,0);g.lineTo(i*2.4,150);g.stroke()}
    g.fillStyle='#4a5530';g.fillRect(62,92,22,18);g.strokeStyle='rgba(230,220,180,.6)';g.lineWidth=.9;g.setLineDash([2,1.6]);g.strokeRect(63.5,93.5,19,15);g.setLineDash([]);g.restore();
    const ST='rgba(232,226,200,.9)';g.save();g.translate(50,62);g.fillStyle=ST;
    for(const s of[-1,1]){g.save();g.rotate(s*.7);g.fillRect(-25,-2.6,50,5.2);for(const e of[-1,1]){g.beginPath();g.arc(e*25,-2.4,3.4,0,TAU);g.arc(e*25,2.4,3.4,0,TAU);g.fill()}g.restore()}
    g.beginPath();g.arc(0,-4,13,0,TAU);g.fill();g.fillRect(-7,4,14,9);g.fillStyle=P.b;g.beginPath();g.arc(-5,-4,3.6,0,TAU);g.arc(5,-4,3.6,0,TAU);g.fill();g.beginPath();g.moveTo(0,1);g.lineTo(-2,5);g.lineTo(2,5);g.closePath();g.fill();
    for(let k=-1;k<=1;k++)g.fillRect(k*4-.8,8,1.6,5);g.fillStyle=ST;const rn=pkRnd(5);for(let i=0;i<40;i++){const a=rn()*TAU,d=16+rn()*14;g.globalAlpha=.25*rn();g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,.6,0,TAU);g.fill()}g.globalAlpha=1;
    for(const[x,L] of[[-6,9],[3,14],[8,6]]){g.fillRect(x-.7,13,1.4,L);g.beginPath();g.arc(x,13+L,1.2,0,TAU);g.fill()}g.restore();
    for(const[x,y] of[[13,20],[87,20],[13,130],[87,130]]){g.beginPath();g.arc(x,y,2.6,0,TAU);g.fillStyle=pkR(g,x-.8,y-.8,.2,2.8,[[0,'#e0e0d0'],[.5,'#9a9a88'],[1,'#4a4a3e']]);g.fill();pkInk(g,1)}
    g.font='9px "Lilita One",system-ui';g.textAlign='center';g.fillStyle='rgba(232,226,200,.55)';g.fillText('N.07',73,103);
    pkRibbon(g,118,R,P,48)}
  else if(rar==='e'){// the quarantine bag: rotten green waxed cloth, a black and yellow band, the plague doctor's mask with green eyes, a red stamp
    g.save();pkBody(g);g.clip();g.fillStyle='#d8c040';g.fillRect(0,18,100,11);g.fillStyle='#141410';for(let k=-2;k<14;k++){g.beginPath();g.moveTo(k*9,18);g.lineTo(k*9+5,18);g.lineTo(k*9+16,29);g.lineTo(k*9+11,29);g.closePath();g.fill()}
    g.strokeStyle=INK;g.lineWidth=1.4;g.strokeRect(-2,18,104,11);const rn=pkRnd(11);for(let i=0;i<10;i++){g.fillStyle=`rgba(40,50,20,${.2+rn()*.2})`;g.beginPath();g.ellipse(10+rn()*80,40+rn()*90,3+rn()*6,2+rn()*4,rn()*3,0,TAU);g.fill()}g.restore();
    pkGlow(g,50,70,34,'rgba(150,255,100,.6)',.3+.15*Math.sin(t*2.6));
    // the mask: a leather hood, the long beak, two round glass eyes
    g.beginPath();g.moveTo(32,52);g.bezierCurveTo(32,38,68,38,68,52);g.lineTo(66,74);g.bezierCurveTo(60,82,40,82,34,74);g.closePath();g.fillStyle=pkG(g,32,40,68,80,[[0,'#5a4636'],[.5,'#3a2c22'],[1,'#1e1610']]);g.fill();pkInk(g,2.2);
    g.beginPath();g.moveTo(43,66);g.bezierCurveTo(46,80,50,96,52,104);g.bezierCurveTo(54,96,58,80,59,66);g.closePath();g.fillStyle=pkG(g,43,66,59,104,[[0,'#6e5a46'],[.5,'#4a3a2c'],[1,'#241a12']]);g.fill();pkInk(g,2);
    g.strokeStyle='rgba(255,230,190,.3)';g.lineWidth=1;g.beginPath();g.moveTo(46,70);g.quadraticCurveTo(49,86,51.5,100);g.stroke();g.strokeStyle='#1e1610';g.beginPath();g.moveTo(45,78);g.lineTo(57,78);g.moveTo(47.5,88);g.lineTo(55,88);g.stroke();
    const eb=.7+.3*Math.sin(t*2.6);for(const x of[42,58]){g.beginPath();g.arc(x,58,6,0,TAU);g.fillStyle='#8a7a5a';g.fill();pkInk(g,1.8);g.beginPath();g.arc(x,58,4.2,0,TAU);g.fillStyle=pkR(g,x-1,57,0,4.4,[[0,'#eaffc8'],[.4,'#9dff6a'],[1,'#2a6a1a']]);g.fill();pkGlow(g,x,58,10,'rgba(160,255,110,1)',.4*eb)}
    g.save();g.translate(74,99);g.rotate(-.25);g.strokeStyle='rgba(200,40,30,.85)';g.lineWidth=1.6;g.strokeRect(-14,-6,28,12);g.font='7px "Lilita One",system-ui';g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(200,40,30,.85)';g.fillText('QUARANTENA',0,.5);g.restore();
    pkRibbon(g,124,R,P,48)}
  else if(rar==='l'){// the reliquary: coffin planks with their grain, brass corners and nails, chains, the lantern with its ghost flame and a crow
    g.save();pkBody(g);g.clip();for(let k=0;k<5;k++){const x=k*21;g.fillStyle=k%2?'rgba(0,0,0,.08)':'rgba(255,220,180,.05)';g.fillRect(x,0,21,150);g.strokeStyle='rgba(20,10,4,.55)';g.lineWidth=1.2;g.beginPath();g.moveTo(x,0);g.lineTo(x,150);g.stroke();
      g.strokeStyle='rgba(30,16,8,.25)';g.lineWidth=.7;for(let s=0;s<4;s++){g.beginPath();g.moveTo(x+4+s*4,0);g.bezierCurveTo(x+2+s*4,50,x+7+s*4,90,x+4+s*4,150);g.stroke()}}g.restore();
    for(const[x,y,sx,sy] of[[7,15,1,1],[93,15,-1,1],[7,135,1,-1],[93,135,-1,-1]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+16*sx,y);g.lineTo(x,y+16*sy);g.closePath();g.fillStyle=pkG(g,x,y,x+12*sx,y+12*sy,[[0,'#f0cf7a'],[.5,'#c99a3a'],[1,'#6a4a14']]);g.fill();pkInk(g,1.6);
      g.fillStyle='#3a2a10';g.beginPath();g.arc(x+4.6*sx,y+4.6*sy,1.2,0,TAU);g.fill()}
    // chains across the lid
    g.save();g.translate(50,92);g.rotate(-.42);for(let k=-6;k<=6;k++){g.beginPath();g.ellipse(k*7,0,4.4,2.6,0,0,TAU);g.strokeStyle=INK;g.lineWidth=2.8;g.stroke();g.strokeStyle=k%2?'#8a8a90':'#b8b8c0';g.lineWidth=1.4;g.stroke()}g.restore();
    // the lantern: an iron cage, the green flame that flickers, the crow on top
    const fl=.8+.2*Math.sin(t*9)+.1*Math.sin(t*23);pkGlow(g,50,64,38,'rgba(110,255,170,.95)',.45*fl);
    g.beginPath();g.moveTo(39,50);g.lineTo(61,50);g.lineTo(58,82);g.lineTo(42,82);g.closePath();g.fillStyle='rgba(30,60,40,.6)';g.fill();
    g.save();g.beginPath();g.moveTo(39,50);g.lineTo(61,50);g.lineTo(58,82);g.lineTo(42,82);g.closePath();g.clip();g.fillStyle=pkR(g,50,70,1,18,[[0,'#ffffff'],[.3,'#b8ffd0'],[1,'rgba(60,200,120,.2)']]);g.fillRect(36,48,28,36);
    g.beginPath();g.moveTo(50,58-4*fl);g.bezierCurveTo(56,66,55,76,50,77);g.bezierCurveTo(45,76,44,66,50,58-4*fl);g.fillStyle='rgba(220,255,230,.9)';g.fill();g.restore();
    g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.moveTo(39,50);g.lineTo(61,50);g.lineTo(58,82);g.lineTo(42,82);g.closePath();g.moveTo(50,50);g.lineTo(50,82);g.moveTo(40.5,66);g.lineTo(59.5,66);g.stroke();
    g.strokeStyle='#4a4a52';g.lineWidth=1.4;g.stroke();g.beginPath();g.moveTo(36,50);g.lineTo(64,50);g.lineTo(58,44);g.lineTo(42,44);g.closePath();g.fillStyle='#2a2a30';g.fill();pkInk(g,1.8);g.beginPath();g.rect(38,82,24,4);g.fillStyle='#2a2a30';g.fill();pkInk(g,1.6);
    g.beginPath();g.arc(50,41,3.6,Math.PI,0);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();
    g.save();g.translate(56,40);g.beginPath();g.ellipse(0,-4,6,4.4,-.3,0,TAU);g.fillStyle='#16141a';g.fill();g.beginPath();g.arc(5,-8,3,0,TAU);g.fill();g.beginPath();g.moveTo(7.6,-8.6);g.lineTo(11,-7.4);g.lineTo(7.6,-6.8);g.closePath();g.fillStyle='#3a3a3a';g.fill();
    g.beginPath();g.moveTo(-5,-3);g.lineTo(-11,1);g.lineTo(-6,0);g.closePath();g.fillStyle='#16141a';g.fill();g.fillStyle='#9dffb0';g.beginPath();g.arc(5.6,-8.6,.9,0,TAU);g.fill();g.restore();
    pkRibbon(g,118,R,P,64)}
  else{// the pact of flesh: pale skin patches stitched together, an eye that looks around and blinks, dark blood, a rusty chain and padlock
    g.save();pkBody(g);g.clip();const rn=pkRnd(17);const cols=['#c9ab9c','#a98a7e','#bfa090','#d2b6a6'];
    const cuts=[[0,40,100,48],[0,96,100,90],[38,0,46,150]];g.fillStyle=cols[1];g.beginPath();g.moveTo(0,48);g.lineTo(100,40);g.lineTo(100,90);g.lineTo(0,96);g.closePath();g.globalAlpha=.55;g.fill();g.globalAlpha=1;
    g.fillStyle='rgba(120,60,60,.2)';for(let i=0;i<14;i++){g.beginPath();g.arc(rn()*100,rn()*150,1+rn()*3,0,TAU);g.fill()}
    for(const[x0,y0,x1,y1] of cuts){g.strokeStyle='rgba(90,40,40,.65)';g.lineWidth=1.6;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();const n=14,dx=(x1-x0)/n,dy=(y1-y0)/n,L=Math.hypot(dx,dy),nx=-dy/L*3.2,ny=dx/L*3.2;
      g.strokeStyle='#1a0e0c';g.lineWidth=1.2;for(let k=1;k<n;k++){const x=x0+dx*k,y=y0+dy*k;g.beginPath();g.moveTo(x-nx,y-ny);g.lineTo(x+nx,y+ny);g.stroke()}}g.restore();
    // the eye
    const bl=(t%3.6)<.16?1-Math.abs((t%3.6)-.08)/.08:0,lx=Math.sin(t*.8)*4.2,ly=Math.sin(t*1.3)*1.6;
    g.beginPath();g.ellipse(50,64,19,12,0,0,TAU);g.fillStyle='#5a2a26';g.fill();pkInk(g,2.4);
    g.save();g.beginPath();g.ellipse(50,64,16,(1-bl)*9.6+.01,0,0,TAU);g.clip();g.fillStyle=pkR(g,48,62,2,18,[[0,'#fff8f0'],[.7,'#e8d0c4'],[1,'#b08070']]);g.fillRect(30,50,40,28);
    g.strokeStyle='rgba(180,30,30,.6)';g.lineWidth=.7;for(let k=0;k<6;k++){g.beginPath();g.moveTo(34+k*6,k%2?57:71);g.quadraticCurveTo(40+k*3,64,46+lx*.4,64);g.stroke()}
    g.beginPath();g.arc(50+lx,64+ly,6.4,0,TAU);g.fillStyle=pkR(g,49+lx,63+ly,.5,6.6,[[0,'#ff7050'],[.6,'#c01a10'],[1,'#5a0404']]);g.fill();g.beginPath();g.arc(50+lx,64+ly,2.6,0,TAU);g.fillStyle='#000';g.fill();
    g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(48+lx,62+ly,1.2,0,TAU);g.fill();g.restore();g.beginPath();g.ellipse(50,64,16,(1-bl)*9.6+.01,0,0,TAU);pkInk(g,1.8);
    // blood from the eye and a stitch, slowly dripping
    const dr=(x,y,L,w)=>{g.beginPath();g.moveTo(x-w,y);g.lineTo(x-w*.7,y+L);g.arc(x,y+L,w*.95,Math.PI,0,true);g.lineTo(x+w,y);g.closePath();g.fillStyle=pkG(g,x-w,0,x+w,0,[[0,'#7a0c0c'],[.4,'#4a0404'],[1,'#200000']]);g.fill();
      g.fillStyle='rgba(255,140,140,.5)';g.beginPath();g.arc(x-w*.35,y+L*.8,w*.3,0,TAU);g.fill()};
    const dl=fx?((t*.12)%1):.6;dr(43,73,8+dl*14,1.7);dr(58,72,5+((dl+.5)%1)*10,1.3);dr(24,47,6,1.2);
    // the chain and the padlock
    g.save();g.translate(50,100);g.rotate(.12);for(let k=-6;k<=6;k++){g.beginPath();g.ellipse(k*7,0,4.4,2.6,0,0,TAU);g.strokeStyle=INK;g.lineWidth=2.8;g.stroke();g.strokeStyle=k%2?'#7a5a44':'#9a7a5a';g.lineWidth=1.4;g.stroke()}g.restore();
    g.beginPath();g.arc(50,100,4.6,Math.PI,0);g.strokeStyle=INK;g.lineWidth=3.6;g.stroke();g.strokeStyle='#8a6a50';g.lineWidth=1.6;g.stroke();
    g.beginPath();g.rect(43.5,100,13,11);g.fillStyle=pkG(g,43,100,57,111,[[0,'#b8906a'],[.5,'#7a5a3a'],[1,'#3a2618']]);g.fill();pkInk(g,1.8);g.fillStyle=INK;g.beginPath();g.arc(50,104.6,1.5,0,TAU);g.fill();g.fillRect(49.4,104.6,1.2,3.6);
    pkRibbon(g,124,R,P,72)}}
// ------------------------------------------------------------------ the Lucky Cards covers: sealed envelopes of a fortune-teller
const LKP={c:{a:'#4d6b4f',b:'#2f4a33',c:'#1a2a1c',seal:['#8ae06a','#3f8a3a','#1a4a1a'],gold:'#c8b070'},r:{a:'#4a6384',b:'#2c3e57',c:'#151f2e',seal:['#9ad8ff','#3a7ac8','#163a6a'],gold:'#d0dceb'},
  e:{a:'#5a3a7a',b:'#3a2350',c:'#1c1028',seal:['#e2a8ff','#8a4fd0','#3a1a66'],gold:'#e8c860'},l:{a:'#2e2e2a',b:'#171714',c:'#060605',seal:['#fff0a0','#e0b030','#6a4a08'],gold:'#f0cf7a'}};
function lkBody(g){g.beginPath();g.moveTo(9,7);g.lineTo(91,7);g.quadraticCurveTo(94,7,94,10);g.lineTo(94,140);g.quadraticCurveTo(94,143,91,143);g.lineTo(9,143);g.quadraticCurveTo(6,143,6,140);g.lineTo(6,10);g.quadraticCurveTo(6,7,9,7);g.closePath()}
function pkLucky(g,rar,t,P,fx){const R={c:'COMUNE',r:'RARA',e:'EPICA',l:'LEGGENDARIA'}[rar];
  lkBody(g);g.fillStyle=P.b;g.fill();g.save();lkBody(g);g.clip();g.fillStyle=pkG(g,6,0,94,0,[[0,P.a],[.25,P.b],[.7,P.b],[1,P.c]]);g.fillRect(0,0,PKW,PKH);
  g.fillStyle=pkG(g,0,7,0,143,[[0,'rgba(255,255,255,.08)'],[.5,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.4)']]);g.fillRect(0,0,PKW,PKH);
  // the paper's fibres and the back flaps of the envelope
  const rn=pkRnd(23+rar.charCodeAt(0));g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=.6;for(let i=0;i<30;i++){const x=rn()*100,y=rn()*150;g.beginPath();g.moveTo(x,y);g.lineTo(x+rn()*8,y+rn()*2);g.stroke()}
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.2;g.beginPath();g.moveTo(6,143);g.lineTo(50,98);g.lineTo(94,143);g.stroke();g.strokeStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(7,141);g.lineTo(50,96.6);g.lineTo(93,141);g.stroke();
  // the gold frame with the little stars of a fortune-teller
  g.strokeStyle=P.gold;g.globalAlpha=.7;g.lineWidth=1;g.strokeRect(11,27,78,111);g.globalAlpha=.4;g.strokeRect(13.5,29.5,73,106);g.globalAlpha=1;
  for(const[x,y] of[[11,27],[89,27],[11,138],[89,138]]){g.fillStyle=P.gold;g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-2,-2,4,4);g.restore()}
  g.font='8px serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=P.gold;g.globalAlpha=.75;[['\u2660',19,35],['\u2665',81,35],['\u2663',19,130],['\u2666',81,130]].forEach(([s,x,y])=>g.fillText(s,x,y));g.globalAlpha=1;g.restore();
  // the flap on top, sealed with wax
  g.beginPath();g.moveTo(6,10);g.quadraticCurveTo(6,7,9,7);g.lineTo(91,7);g.quadraticCurveTo(94,7,94,10);g.lineTo(52,44);g.quadraticCurveTo(50,45.5,48,44);g.closePath();
  g.fillStyle=pkG(g,0,7,0,45,[[0,P.a],[1,P.c]]);g.fill();pkInk(g,2);g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1;g.beginPath();g.moveTo(9,10);g.lineTo(50,41.6);g.lineTo(91,10);g.stroke();
  // the emblem of the rarity
  g.save();g.translate(50,82);
  if(rar==='c'){// an old iron horseshoe with its nails
    pkGlow(g,0,0,30,'rgba(140,230,110,.7)',.3+.12*Math.sin(t*2));g.lineCap='butt';g.beginPath();g.arc(0,2,17,-Math.PI*.18,Math.PI*1.18);g.strokeStyle=INK;g.lineWidth=11;g.stroke();
    g.strokeStyle=pkG(g,-17,-20,17,16,[[0,'#b8aa98'],[.5,'#7a6a5a'],[1,'#3a3028']]);g.lineWidth=7;g.stroke();g.strokeStyle='rgba(150,70,30,.6)';g.lineWidth=3;g.setLineDash([3,6]);g.stroke();g.setLineDash([]);
    for(let k=0;k<6;k++){const a=-Math.PI*.05+k*Math.PI*1.1/5;g.fillStyle='#1a1410';g.beginPath();g.arc(Math.cos(a)*17,2+Math.sin(a)*17,1.3,0,TAU);g.fill()}
    g.strokeStyle='rgba(255,240,220,.45)';g.lineWidth=1.2;g.beginPath();g.arc(0,2,19.5,Math.PI*.55,Math.PI*1.05);g.stroke()}
  else if(rar==='r'){// two bone dice with pips that glow
    pkGlow(g,0,0,30,'rgba(110,224,255,.7)',.35+.15*Math.sin(t*2.4));
    const die=(x,y,a,n)=>{g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.roundRect(-10,-10,20,20,4);g.fillStyle=pkG(g,-10,-10,10,10,[[0,'#fffaf0'],[.5,'#e2d6bc'],[1,'#9a8a6a']]);g.fill();pkInk(g,2);
      const P2={1:[[0,0]],4:[[-5,-5],[5,-5],[-5,5],[5,5]],6:[[-5,-6],[-5,0],[-5,6],[5,-6],[5,0],[5,6]]}[n];for(const[px,py] of P2){g.beginPath();g.arc(px,py,1.9,0,TAU);g.fillStyle='#1d5a8a';g.fill();pkGlow(g,px,py,4,'rgba(140,230,255,1)',.5)}g.restore()};
    die(-9,4,-.3,4);die(10,-6,.35,6)}
  else if(rar==='e'){// a black cat sitting under the moon, its eyes blinking yellow
    g.beginPath();g.arc(8,-14,16,0,TAU);g.fillStyle=pkR(g,4,-18,2,17,[[0,'#fff6d0'],[.7,'#e8d080'],[1,'#a08030']]);g.fill();g.beginPath();g.arc(14,-18,14,0,TAU);g.fillStyle=P.b;g.fill();
    pkGlow(g,0,-6,34,'rgba(255,220,90,.5)',.25);
    g.beginPath();g.moveTo(-6,24);g.bezierCurveTo(-16,24,-16,6,-10,-2);g.bezierCurveTo(-12,-8,-12,-14,-9,-18);g.lineTo(-7,-24);g.lineTo(-3,-18);g.lineTo(3,-18);g.lineTo(7,-24);g.lineTo(9,-18);g.bezierCurveTo(12,-12,12,-6,9,-2);g.bezierCurveTo(16,6,15,24,6,24);g.closePath();
    g.fillStyle=pkG(g,-14,-24,14,24,[[0,'#2a2234'],[.5,'#120e18'],[1,'#050307']]);g.fill();g.strokeStyle='rgba(200,170,255,.45)';g.lineWidth=1.2;g.stroke();
    g.beginPath();g.moveTo(6,22);g.bezierCurveTo(20,22,24,10,18,4);g.strokeStyle='#120e18';g.lineWidth=3.6;g.stroke();
    const bl=(t%4.2)<.18?.15:1;for(const x of[-4.4,4.4]){g.beginPath();g.ellipse(x,-11,2.6,2.2*bl,0,0,TAU);g.fillStyle='#ffd84a';g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(x,-11,.8,1.9*bl,0,0,TAU);g.fill();pkGlow(g,x,-11,6,'rgba(255,220,80,1)',.6*bl)}}
  else{// the golden four-leaf clover under an eye in a triangle with its rays
    g.save();g.translate(0,-26);if(fx)g.rotate(Math.sin(t*.5)*.05);for(let k=0;k<12;k++){g.rotate(TAU/12);g.fillStyle=`rgba(255,220,120,${.18+.1*Math.sin(t*2+k)})`;g.beginPath();g.moveTo(-1.4,-8);g.lineTo(0,-22);g.lineTo(1.4,-8);g.closePath();g.fill()}
    g.beginPath();g.moveTo(0,-9);g.lineTo(9,6);g.lineTo(-9,6);g.closePath();g.fillStyle='#e0b030';g.fill();pkInk(g,1.4);g.beginPath();g.ellipse(0,1.4,4.2,2.6,0,0,TAU);g.fillStyle='#fff';g.fill();g.fillStyle='#1a5a2a';g.beginPath();g.arc(0,1.4,1.5,0,TAU);g.fill();g.restore();
    pkGlow(g,0,8,32,'rgba(120,255,150,.8)',.4+.18*Math.sin(t*2.8));
    for(let k=0;k<4;k++){g.save();g.translate(0,8);g.rotate(k*Math.PI/2+Math.PI/4);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-12,-6,-12,-20,-4,-20);g.quadraticCurveTo(0,-20,0,-15);g.quadraticCurveTo(0,-20,4,-20);g.bezierCurveTo(12,-20,12,-6,0,0);g.closePath();
      g.fillStyle=pkG(g,-12,-20,12,0,[[0,'#fff2b0'],[.45,'#f0c440'],[1,'#8a6010']]);g.fill();pkInk(g,1.6);g.strokeStyle='rgba(60,140,60,.75)';g.lineWidth=1;g.beginPath();g.moveTo(0,-2);g.lineTo(0,-14);g.stroke();g.restore()}
    g.beginPath();g.moveTo(0,10);g.quadraticCurveTo(4,20,1,28);g.strokeStyle=INK;g.lineWidth=3.6;g.stroke();g.strokeStyle='#d0a030';g.lineWidth=1.8;g.stroke();
    if(fx)for(let k=0;k<6;k++){const p=(t*.4+k/6)%1,a=k*1.05+t*.3;g.fillStyle=`rgba(255,250,200,${Math.sin(p*Math.PI)})`;g.save();g.translate(Math.cos(a)*(20+p*8),8+Math.sin(a)*(18+p*6));g.rotate(Math.PI/4);g.fillRect(-1.2,-1.2,2.4,2.4);g.restore()}}
  g.restore();
  // the wax seal on the flap's tip (a little skull pressed in it)
  g.beginPath();for(let k=0;k<14;k++){const a=k*TAU/14,r=8.4+(k%2?.9:-.4);g.lineTo(50+Math.cos(a)*r,43+Math.sin(a)*r)}g.closePath();g.fillStyle=pkR(g,48,41,1,9,[[0,P.seal[0]],[.55,P.seal[1]],[1,P.seal[2]]]);g.fill();pkInk(g,1.8);
  g.beginPath();g.arc(50,42.4,3.4,0,TAU);g.fillStyle='rgba(0,0,0,.35)';g.fill();g.fillStyle=P.seal[0];g.beginPath();g.arc(48.8,41.6,.9,0,TAU);g.arc(51.2,41.6,.9,0,TAU);g.fill();
  // the title
  g.font='10.5px "Lilita One",system-ui';g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle=INK;g.strokeText('LUCKY CARDS',50,59);g.fillStyle=P.gold;g.fillText('LUCKY CARDS',50,59);
  g.font='8px "Lilita One",system-ui';g.lineWidth=2.4;g.strokeText(R,50,124);g.fillStyle='#fff';g.fillText(R,50,124);
  lkBody(g);pkInk(g,2.6);g.save();lkBody(g);g.clip();g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1.4;g.beginPath();g.moveTo(7.6,12);g.lineTo(7.6,140);g.stroke();g.restore()}
// ------------------------------------------------------------------ one whole cover (t: time for its animations, fx: the moving details)
function packArt(g,kind,rar,t,fx){g.save();g.lineJoin='round';g.lineCap='round';
  if(kind==='lucky'){pkLucky(g,rar,t,LKP[rar],fx);pkShine(g,t,.4+pkLv(kind,rar)*.15,lkBody)}
  else{const P=PKP[kind][rar];pkShade(g,P);if(kind==='classica')pkClassic(g,rar,t,P,fx);else pkZombie(g,rar,t,P,fx);pkEdge(g,P);pkCrimp(g,true,P);pkCrimp(g,false,P);
    pkWord(g,kind==='classica'?'MOSSBOUND':'ZOMBIE',8.4,kind==='classica'?'#fff6d0':'#cfe8b0',5.6);
    const sh=kind==='classica'?[.25,.35,.55,.9,.7][PR.indexOf(rar)]:[0,.1,.25,.35,.3][PR.indexOf(rar)];pkShine(g,t,sh,pkBody)}
  g.restore()}
// a cover as a picture (shop, rewards, the end of a match): drawn once for every size
const PKIMG={};
function packImg(kind,rar,h){const k=kind+rar+h;if(PKIMG[k])return PKIMG[k];const d=Math.min(2,window.devicePixelRatio||1),c=document.createElement('canvas');c.width=Math.round(h/1.5*d);c.height=Math.round(h*d);
  const g=c.getContext('2d');g.scale(c.width/PKW,c.height/PKH);try{packArt(g,kind,rar,.6,false)}catch(e){}return PKIMG[k]=c.toDataURL()}
// ------------------------------------------------------------------ the sounds of the packs: foil, cloth or paper tearing, the rarity's chime
const PKS={tear(kind,k){if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime;try{
    if(kind==='zombie')fNoise(t,.07,'bandpass',VR(700,.25),1.4,.07*k,{brown:true});else if(kind==='lucky')fNoise(t,.05,'bandpass',VR(2200,.2),2,.05*k);else fNoise(t,.045,'highpass',VR(3600,.2),1,.05*k)}catch(e){}},
  open(kind,lv){if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime;try{
    if(kind==='zombie'){fNoise(t,.32,'bandpass',900,1.1,.12,{brown:true,f2:300});fThump(t+.02,120,46,.4,.3,.3);vBell(null,t+.12,[45,48,52,55,57][lv],2.8,.05);if(lv>=2)vBrass(null,t+.15,[33,36,40][lv-2]||36,1.6,.05);if(lv>=4)vChoir(null,t+.2,[57,60,64],2.4,.05)}
    else if(kind==='lucky'){fModal(t,520,[1,2.76,5.4],[.14,.09,.05],.08,.3);fNoise(t,.2,'bandpass',2000,1.6,.08,{f2:900});[76,79,83,88].slice(0,2+lv).forEach((m,i)=>vBell(null,t+.12+i*.09,m,1.6,.035));if(lv>=2)vChoir(null,t+.2,[64,67,71],2,.035)}
    else{fNoise(t,.22,'highpass',3000,1,.09,{f2:6000});fThump(t+.02,180,70,.25,.2,.2);[84,88,91,96,100].slice(0,2+lv).forEach((m,i)=>vBell(null,t+.08+i*.07,m,1.8,.045));if(lv>=3)[60,64,67,72].forEach(m=>vBrass(null,t+.1,m,1.2,.035));if(lv>=4)vChoir(null,t+.2,[72,76,79],2.4,.04)}}catch(e){}},
  hint(){if(!AU.ctx||!AU.on.sfx)return;try{fNoise(AU.ctx.currentTime,.06,'bandpass',2600,2,.03)}catch(e){}}};
// ------------------------------------------------------------------ the opening
const PK={on:false,kind:'',rar:'',t:0,last:0,cv:null,buf:null,lo:null,hi:null,done:false,fly:0,flyDir:1,hintT:0,taps:0};
{const st=document.createElement('style');st.textContent=`
.chestWrap.pack{aspect-ratio:2/3;translate:-50% -50%}
.chestWrap.pack canvas{position:absolute;inset:0;width:100%;height:100%;display:block;filter:drop-shadow(0 10px 14px rgba(0,0,0,.55))}
.chestWrap.pack.idle{animation:pkfloat 2.4s ease-in-out infinite}
@keyframes pkfloat{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-7px) rotate(1.2deg)}}
.chestWrap.pack .cbadge{top:auto;bottom:-6px;right:-8px}
#ctap.pkh{bottom:auto;top:calc(50% + min(36vw,175px));font-size:17px}
.sumc.mat{--rc:#7bbf4a;--rc2:#1f3a14}.sumc.mat.rot{--rc:#c8a070;--rc2:#3a2a18}
.sumc.mat img{width:46px;height:46px}
.zlk{display:flex;align-items:center;gap:10px;margin:8px 0 2px;padding:6px 12px 6px 8px;border:2px solid #000;border-radius:12px;background:rgba(10,20,12,.75);text-align:left;max-width:300px}
.zlk img{width:44px;height:auto;filter:drop-shadow(0 3px 0 rgba(0,0,0,.5))}.zlk b{display:block;font:400 15px "Lilita One",system-ui;color:#a6e06a}.zlk span{font-size:12px;opacity:.85}
.zlk.fifth{box-shadow:0 0 0 2px #ffd84a inset}
small.zlk{display:block;background:none;border:0;opacity:.7}
@media (prefers-reduced-motion:reduce){.chestWrap.pack.idle{animation:none}}`;document.head.appendChild(st)}
function pkResize(){const c=PK.cv;if(!c)return;const r=c.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);const w=Math.max(10,Math.round(r.width*d)),h=Math.max(10,Math.round(r.height*d));
  if(c.width!==w||c.height!==h){c.width=w;c.height=h;PK.buf.width=w;PK.buf.height=h}}
// one frame of the pack: the cover drawn again (its animations), then cut along the tear: the body, the slit with light coming out, the strip
// lifted where it is torn; once torn the strip flies away
function pkFrame(now){if(!PK.on)return;const dt=Math.min(.05,(now-(PK.last||now))/1000);PK.last=now;PK.t+=dt;pkResize();const c=PK.cv,g=c.getContext('2d'),b=PK.buf,bg=b.getContext('2d'),W=c.width,H=c.height,s=W/PKW;
  bg.setTransform(1,0,0,1,0,0);bg.clearRect(0,0,W,H);bg.setTransform(s,0,0,H/PKH,0,0);packArt(bg,PK.kind,PK.rar,PK.t,!LOWFX);
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);const ly=PKLINE*H/PKH,lo=PK.lo==null?0:PK.lo*W,hi=PK.hi==null?0:PK.hi*W,torn=hi-lo>1;
  const zig=(g2,x0,x1,dir)=>{const n=Math.max(2,Math.round((x1-x0)/(4*s)));for(let i=0;i<=n;i++){const x=dir>0?x0+(x1-x0)*i/n:x1-(x1-x0)*i/n;g2.lineTo(x,ly+((i%2)?1.6:-1.4)*s)}};
  if(PK.done){// the body without the strip, the strip flying off
    g.save();g.beginPath();g.moveTo(0,ly);zig(g,0,W,1);g.lineTo(W,H);g.lineTo(0,H);g.closePath();g.clip();g.drawImage(b,0,0);g.restore();
    const f=Math.min(1,PK.fly);if(f<1){g.save();g.globalAlpha=1-f;g.translate(W/2+PK.flyDir*f*W*.9,ly-f*H*.55);g.rotate(PK.flyDir*f*1.2);g.translate(-W/2,-ly);
      g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W,ly);zig(g,0,W,-1);g.closePath();g.clip();g.drawImage(b,0,0);g.restore()}
    // light pouring out of the opening
    const F=PKFX[PK.kind][PK.rar];g.save();g.globalCompositeOperation='lighter';g.fillStyle=pkG(g,0,ly-4*s,0,ly+30*s,[[0,F.g],[1,'rgba(0,0,0,0)']]);g.globalAlpha=.55*Math.max(0,1-PK.fly*.4);g.fillRect(4*s,ly-2*s,W-8*s,30*s);g.restore()}
  else{g.save();g.beginPath();g.moveTo(0,0);if(torn){g.lineTo(lo,0);g.lineTo(lo,ly);zig(g,lo,hi,1);g.lineTo(hi,0)}g.lineTo(W,0);g.lineTo(W,H);g.lineTo(0,H);g.closePath();g.clip();g.drawImage(b,0,0);g.restore();
    if(torn){const F=PKFX[PK.kind][PK.rar],k=(hi-lo)/W;
      // the slit: dark inside, the rarity's light, the strip lifted a little above it
      g.save();g.globalCompositeOperation='lighter';g.strokeStyle=F.g;g.lineWidth=(2+k*3)*s;g.globalAlpha=.5+.4*k;g.beginPath();g.moveTo(lo,ly);zig(g,lo,hi,1);g.stroke();g.restore();
      g.save();g.translate(0,-(1.5+3*k)*s);g.beginPath();g.moveTo(lo,0);g.lineTo(hi,0);g.lineTo(hi,ly);zig(g,lo,hi,-1);g.closePath();g.clip();g.drawImage(b,0,0);g.restore();
      g.save();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.1*s;g.beginPath();g.moveTo(lo,ly-(1.5+3*k)*s);zig(g,lo,hi,1);g.stroke();g.restore()}
    // the dashed line with the scissors, pulsing, and the finger showing the way
    if(!PK.done){const a=.55+.35*Math.sin(PK.t*5);g.save();g.setLineDash([5*s,4*s]);g.lineDashOffset=-PK.t*14*s;g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=1.6*s;g.beginPath();g.moveTo(9*s,ly);g.lineTo(W-9*s,ly);g.stroke();
      g.strokeStyle=`rgba(0,0,0,${a*.5})`;g.lineDashOffset-=1*s;g.beginPath();g.moveTo(9*s,ly+1.4*s);g.lineTo(W-9*s,ly+1.4*s);g.stroke();g.restore();
      if(!torn){const p=(PK.t*.55)%1.4,hx=(10+Math.min(1,p)*80)*s,hy=ly+5*s;if(p<1){g.save();g.globalAlpha=Math.min(1,p*4,(1-p)*4);g.translate(hx,hy);g.rotate(-.35);
        g.fillStyle='#fff';g.strokeStyle=INK;g.lineWidth=1.6*s;g.beginPath();g.roundRect(-3.2*s,0,6.4*s,15*s,3.2*s);g.fill();g.stroke();g.beginPath();g.roundRect(-5.4*s,10*s,12*s,13*s,5*s);g.fill();g.stroke();
        g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(0,-1*s,5*s*(1-p*.3),0,TAU);g.fill();g.restore()}}}}
  if(PK.done&&PK.fly<1)PK.fly+=dt*1.8;requestAnimationFrame(pkFrame)}
// waiting for the finger: a drag that stays near the line (above or below it a good way, and past the pack's sides) tears the pack; it is
// open when the torn part covers most of its width. Taps and drags far from the line only show the way again
function pkTear(cw){return new Promise(res=>{const scr=$('chestScr');CHgest=true;PK.lo=PK.hi=null;PK.done=false;let drag=null,lastS=0;
  const geo=()=>{const r=cw.getBoundingClientRect();return{r,ly:r.top+r.height*PKLINE/PKH,tol:r.height*.2+22}};
  const down=e=>{if(e.target.closest('button'))return;const G0=geo();if(Math.abs(e.clientY-G0.ly)>G0.tol*1.15||e.clientX<G0.r.left-50||e.clientX>G0.r.right+50){PK.taps++;PK.t=0;PKS.hint();$('ctap').classList.remove('show');void $('ctap').offsetWidth;$('ctap').classList.add('show');return}
    drag={id:e.pointerId};const x=clamp((e.clientX-G0.r.left)/G0.r.width,0,1);if(PK.lo==null){PK.lo=PK.hi=x}else{PK.lo=Math.min(PK.lo,x);PK.hi=Math.max(PK.hi,x)}try{scr.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()};
  const move=e=>{if(!drag||e.pointerId!==drag.id)return;const G0=geo();if(Math.abs(e.clientY-G0.ly)>G0.tol*1.6)return;const x=clamp((e.clientX-G0.r.left)/G0.r.width,0,1),w0=PK.hi-PK.lo;
    PK.lo=Math.min(PK.lo,x);PK.hi=Math.max(PK.hi,x);const w=PK.hi-PK.lo;if(w-lastS>.06){lastS=w;PKS.tear(PK.kind,.6+w*.6);vib(6)}
    if(w>=.7){finish(x>(PK.lo+PK.hi)/2?1:-1)}};
  const up=e=>{if(drag&&e.pointerId===drag.id)drag=null};
  const key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();PK.lo=0;PK.hi=1;finish(1)}};
  function finish(dir){if(PK.done)return;PK.done=true;PK.fly=0;PK.flyDir=dir;PK.lo=0;PK.hi=1;CHgest=false;scr.removeEventListener('pointerdown',down);scr.removeEventListener('pointermove',move);
    scr.removeEventListener('pointerup',up);scr.removeEventListener('pointercancel',up);removeEventListener('keydown',key);$('ctap').classList.remove('show','pkh');res(dir)}
  scr.addEventListener('pointerdown',down);scr.addEventListener('pointermove',move);scr.addEventListener('pointerup',up);scr.addEventListener('pointercancel',up);addEventListener('keydown',key);
  $('ctap').textContent='Trascina il dito sulla linea';$('ctap').classList.add('show','pkh')})}
// what the opening needs from a pack, in the chests' terms (src/js/09-apertura-casse.js TIER)
function packTier(kind,rar){const lv=pkLv(kind,rar),F=PKFX[kind][rar],big=kind==='lucky'?0:lv;
  return{lvl:Math.min(3,lv),c1:F.g,bg:F.bg,rays:9+lv*4,burst:50+lv*55+(rar==='i'?120:0),charge:1,flash:'#ffffff',coins:0,cols:F.cols,size:[190,198,208,220,240][big]||190}}
// a pack: the roll and the cards are given at once (so nothing is lost if the app closes), then the show. Busy with another opening: the
// pack waits in the save (SAVE.bustine) and opens from the shop
async function openPack(kind,rar,o){o=o||{};if(CHbusy){if(kind!=='lucky'){addPack(kind,rar);toast('La bustina ti aspetta nella Bottega')}return false}
  CHbusy=true;CHskip=false;duckMusic(.3);initAudio();
  const rew=kind==='lucky'?rollLucky(rar):rollPack(kind,rar);grant(rew);renderGold();save();
  const prev={};for(const c of rew.cards){if(c.prev!=null){prev[c.id]=c.prev;continue}const it=SAVE.items[c.id];prev[c.id]=c.isNew?0:it.cards-c.n}
  const T=packTier(kind,rar),scr=$('chestScr'),cw=$('chestWrap');scr.hidden=false;$('cdone').hidden=true;$('csum').innerHTML='';$('csum').hidden=true;$('tray').innerHTML='';$('cardStage').innerHTML='';
  $('ctitle').innerHTML=`<span>${PACKN[kind][rar]}</span>`;$('ctitle').className='ctitle show';
  cw.innerHTML='<canvas></canvas><div class="cbadge" id="cbadge"></div>';cw.style.width=`min(${T.size}px,58vw)`;cw.className='chestWrap pack';cw.getAnimations().forEach(a=>a.cancel());
  Object.assign(PK,{on:true,kind,rar,t:0,last:0,cv:cw.querySelector('canvas'),buf:PK.buf||document.createElement('canvas'),lo:null,hi:null,done:false,fly:0,taps:0});pkResize();requestAnimationFrame(pkFrame);
  Object.assign(FX,{beam:0,plat:0,idle:false,cols:T.cols,size:T.size,on:true,parts:[],rings:[],rayA:0,rayTarget:0,rayN:T.rays,rayCol:T.c1,raySpeed:.25,bg:T.bg,glow:0,glowCol:T.c1,flash:0,shake:0,last:0});
  fxSize();requestAnimationFrame(fxFrame);await csleep(30);[FX.cx,FX.cy]=fxPoint(cw);
  const badge=$('cbadge');let left=rew.cards.length;badge.textContent=left;badge.style.opacity=0;
  // 1. the pack falls in, spinning a little, and floats
  SND.whoosh();
  await canim(cw,[{transform:'translateY(-110vh) rotate(-14deg) scale(.8)'},{transform:'translateY(0) rotate(3deg) scale(1.06,.94)',offset:.78},{transform:'translateY(-3%) rotate(-1deg)',offset:.9},{transform:'none'}],{duration:RM?200:680,easing:'cubic-bezier(.4,0,.7,1)'});
  SND.thump();FX.shake=4+T.lvl*2;FX.plat=1;FX.glow=.3+.1*T.lvl;FX.rayTarget=.12+.05*T.lvl;cw.classList.add('idle');FX.idle=true;
  if(rar==='i'||rar==='l'){FX.flashCol=T.c1;FX.flash=.35;ring(FX.cx,FX.cy,T.c1,360,8)}
  // 2. the tear
  const dir=await pkTear(cw);cw.classList.remove('idle');FX.idle=false;
  // 3. open: the strip flies, the light, the sparks of the rarity
  PKS.open(kind,pkLv(kind,rar));vib(T.lvl>=2?[40,30,90]:30);FX.beam=.6+.15*T.lvl;FX.flashCol=T.c1;FX.flash=.5+.15*T.lvl;FX.shake=8+T.lvl*4;FX.rayTarget=1;FX.raySpeed=.5+T.lvl*.2;FX.glow=1;
  const[ox,oy]=[FX.cx,FX.cy-T.size*.33*FX.d];ring(ox,oy,T.c1,420,12);if(T.lvl>=2)setTimeout(()=>ring(ox,oy,'#ffffff',560,8),130);if(rar==='i')setTimeout(()=>ring(ox,oy,T.c1,720,18),280);
  burst(ox,oy,T.burst,T.cols,{up:true,min:220,max:820,g:800});if(kind==='zombie')burst(ox,oy,24,['#8a7a60'],{kind:'dust',g:-30,min:40,max:200,drag:2.5,life:1});
  if(kind==='lucky')burst(ox,oy,30,T.cols,{kind:'confetti',up:true,min:120,max:420,g:120,drag:1.8,life:1.6});
  await canim(cw,[{transform:'scale(1.06,.94)'},{transform:`scale(.96,1.05) rotate(${dir*2}deg)`,offset:.4},{transform:'none'}],{duration:RM?150:460,easing:'ease-out'});
  await csleep(RM?100:380);
  // 4. the pack goes down, the cards come out one by one
  FX.rayTarget=.45;FX.raySpeed=.25;badge.style.opacity=1;
  await canim(cw,[{transform:'none'},{transform:'translateY(min(30vh,230px)) scale(.62)'}],{duration:RM?150:520,easing:'cubic-bezier(.5,0,.3,1)'});
  [FX.cx,FX.cy]=fxPoint(cw);
  for(let i=0;i<rew.cards.length;i++){left--;badge.textContent=left||'';if(!left)badge.classList.add('gone');else badge.animate([{transform:'scale(1.5)'},{transform:'none'}],{duration:250});await revealCard(rew.cards[i],prev[rew.cards[i].id],T,cw)}
  // 5. what you got (with the materials)
  await summary(rew,T,cw);
  CHbusy=false;if(typeof o.after==='function')o.after();return true}
// the materials in the summary of an opening
const MAT_SVG={ess:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 6h12v7l7 9c3 5 2 17-13 20C9 39 8 27 11 22l7-9z" fill="#2e4a22" stroke="#1b1612" stroke-width="3" stroke-linejoin="round"/><path d="M13 26c4 3 18 3 22 0 1 6-2 13-11 14-9-1-12-8-11-14z" fill="#8fe05a"/><path d="M15 29c3 2 6 2 8 2" stroke="#e9ffd0" stroke-width="2" stroke-linecap="round" fill="none"/><rect x="17" y="3" width="14" height="5" rx="2" fill="#8a5a2a" stroke="#1b1612" stroke-width="2.4"/><path d="M24 22c-1-5 2-8 6-9-1 4-3 7-6 9z" fill="#b8f07a" stroke="#1b1612" stroke-width="1.6"/></svg>`,
  rot:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7l4 1 1 4 4 2 3-2 3 3-2 3 2 4 4 1v4l-4 1-2 4 2 3-3 3-3-2-4 2-1 4h-4l-1-4-4-2-3 2-3-3 2-3-2-4-4-1v-4l4-1 2-4-2-3 3-3 3 2 4-2 1-4z" fill="#8a6a4a" stroke="#1b1612" stroke-width="2.6" stroke-linejoin="round"/><circle cx="24" cy="24" r="6" fill="#2a1e14" stroke="#1b1612" stroke-width="2"/><path d="M12 16c3-4 7-6 11-6" stroke="#d8b890" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 33l9 9" stroke="#1b1612" stroke-width="7" stroke-linecap="round"/><path d="M30 33l9 9" stroke="#b07a4a" stroke-width="3.4" stroke-linecap="round"/></svg>`};
{const _s=summary;summary=async function(rew,T,cw){const p=_s.apply(this,arguments);const M=rew.mat||{};const ks=Object.keys(M).filter(k=>M[k]>0);
  if(ks.length){const sum=$('csum');for(const k of ks){const d=document.createElement('div');d.className='sumc mat '+k;d.innerHTML=`${MAT_SVG[k]}<b>+${M[k]}</b>`;sum.appendChild(d);d.animate([{transform:'scale(0)'},{transform:'scale(1.15)',offset:.7},{transform:'none'}],{duration:380,easing:'ease-out',delay:200})}}
  return p}}
{const _d=$('cdone').onclick;$('cdone').onclick=function(){PK.on=false;return _d.apply(this,arguments)}}
// a pack kept for later (bought while another was opening): opens from the shop
function openKept(mode,rar){if(!SAVE.bustine[mode][rar])return;SAVE.bustine[mode][rar]--;save();openPack(mode,rar)}
