// =====================================================================
// I DISEGNI DEGLI OGGETTI CLASSICI (punto 38 del piano di Denis, anteprima 47): prima tutti gli oggetti di uno stesso tipo avevano la
// stessa sagoma ricolorata. Ora ognuno ha la sua: gli archi e la balestra sono i modelli 3D che l'eroe tiene in mano (sprite/eroe3d/
// armi3d.js), visti di tre quarti; armature, anelli e amuleti sono dipinti come i personaggi (tre toni con la luce dall'alto a sinistra,
// contorno scuro spesso, bordo illuminato, materiali diversi: cuoio, maglia d'acciaio, stoffa d'ombra, muschio, rame, argento, oro,
// gemme, osso). itemSVG resta la stessa: dà ancora un <svg>, con dentro il disegno, così tutti i posti dove compare (collezione, scheda,
// casse, negozio, Armeria) restano della stessa misura.
// =====================================================================
const ITIMG={};
function itemArt(it){if(ITIMG[it.id])return ITIMG[it.id];if(!ITART[it.id])return null;const c=document.createElement('canvas');c.width=c.height=144;const x=c.getContext('2d'),sv=ctx;ctx=x;
  try{x.scale(1.5,1.5);ITART[it.id](x,it)}catch(e){console.error(e)}finally{ctx=sv}return ITIMG[it.id]=c.toDataURL()}
{const _is=itemSVG;itemSVG=function(it){if(!it||!it.id||!ITART[it.id])return _is(it);const u=itemArt(it);return u?`<svg viewBox="0 0 48 48" aria-hidden="true"><image href="${u}" x="0" y="0" width="48" height="48"/></svg>`:_is(it)}}
// ------------------------------------------------------------------ painting helpers (in a 96 × 96 square)
const IK='#1b1612',imix=(a,b,k)=>CR._rig.mix(a,b,k),idk=(c,k)=>imix(c,'#140f0c',k),ilt=(c,k)=>imix(c,'#fff8e6',k);
// a shape filled in three tones (light from the upper left), the thick dark outline and a thin light edge on its upper left
function paint(x,path,col,o){o=o||{};const b=o.box||[8,8,88,88],g=x.createLinearGradient(b[0],b[1],b[2],b[3]);g.addColorStop(0,ilt(col,o.kl==null?.3:o.kl));g.addColorStop(.45,col);g.addColorStop(1,idk(col,o.kd==null?.38:o.kd));
  path();x.fillStyle=g;x.fill();if(o.lw!==0){x.lineJoin='round';x.lineCap='round';x.strokeStyle=IK;x.lineWidth=o.lw||3.4;x.stroke()}
  if(o.rim!==false){x.save();path();x.clip();x.strokeStyle='rgba(255,250,235,.38)';x.lineWidth=2.2;x.translate(1.4,1.6);path();x.stroke();x.restore()}}
const iglow=(x,rgb,cx,cy,r,a)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(cx-r,cy-r,2*r,2*r)};
const ishadow=(x,cx,cy,rx,ry)=>{x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,TAU);x.fill()};
// a faceted gem: an outline, a lighter top facet and a sparkle
function gem(x,cx,cy,r,col,shape){const pts=shape==='round'?null:shape==='heart'?null:[[0,-1],[.85,-.35],[.55,.85],[-.55,.85],[-.85,-.35]];
  const path=()=>{x.beginPath();if(shape==='round')x.arc(cx,cy,r,0,TAU);else if(shape==='heart'){x.moveTo(cx,cy+r);x.bezierCurveTo(cx-r*1.6,cy-r*.2,cx-r*.7,cy-r*1.3,cx,cy-r*.45);x.bezierCurveTo(cx+r*.7,cy-r*1.3,cx+r*1.6,cy-r*.2,cx,cy+r)}else{for(const p of pts)x.lineTo(cx+p[0]*r,cy+p[1]*r);x.closePath()}};
  paint(x,path,col,{box:[cx-r,cy-r,cx+r,cy+r],kl:.45,kd:.45,lw:2.6,rim:false});
  x.save();path();x.clip();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.moveTo(cx-r,cy-r*.15);x.lineTo(cx+r,cy-r*.55);x.lineTo(cx+r,cy-r*2);x.lineTo(cx-r,cy-r*2);x.closePath();x.fill();
  x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1;x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx-r*.3,cy+r);x.moveTo(cx,cy-r);x.lineTo(cx+r*.35,cy+r);x.stroke();x.restore();
  x.fillStyle='#fff';x.beginPath();x.arc(cx-r*.35,cy-r*.35,Math.max(1.2,r*.16),0,TAU);x.fill()}
// a ring seen three quarters: the band (an ellipse with a hole), its metal in three tones, the inside darker
function iRing(x,cx,cy,rx,ry,w,col){const path=()=>{x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,TAU);x.ellipse(cx,cy+1,rx-w,ry-w*.62,0,0,TAU,true)};
  paint(x,path,col,{box:[cx-rx,cy-ry,cx+rx,cy+ry],kl:.5,kd:.5,lw:3,rim:false});x.fillStyle=idk(col,.55);x.beginPath();x.ellipse(cx,cy+1,rx-w,ry-w*.62,0,Math.PI*1.05,Math.PI*1.95);x.ellipse(cx,cy+1+w*.35,rx-w,ry-w*.62,0,Math.PI*1.95,Math.PI*1.05,true);x.fill();
  x.strokeStyle='rgba(255,252,240,.7)';x.lineWidth=1.6;x.beginPath();x.ellipse(cx,cy,rx-w*.45,ry-w*.3,0,Math.PI*.95,Math.PI*1.45);x.stroke()}
// a cord or a chain hanging from the top of the square to the pendant
function cord(x,cx,cy,col,chain){x.lineCap='round';for(const s of[-1,1]){x.strokeStyle=IK;x.lineWidth=chain?4.6:4;x.beginPath();x.moveTo(cx+s*30,4);x.quadraticCurveTo(cx+s*24,cy-10,cx,cy);x.stroke();
  x.strokeStyle=col;x.lineWidth=chain?2.4:2;if(chain)x.setLineDash([3,1.6]);x.beginPath();x.moveTo(cx+s*30,4);x.quadraticCurveTo(cx+s*24,cy-10,cx,cy);x.stroke();x.setLineDash([])}}
// the body of a shirt / jacket / armour seen from the front (shoulders, short sleeves, the hem): the base shape of the armours
const torso=(x,w,h)=>()=>{const L=48-w,Rr=48+w;x.beginPath();x.moveTo(L+8,20);x.lineTo(40,15);x.quadraticCurveTo(48,24,56,15);x.lineTo(Rr-8,20);x.lineTo(Rr+8,36);x.lineTo(Rr-2,43);x.lineTo(Rr-4,h);
  x.quadraticCurveTo(48,h+6,L+4,h);x.lineTo(L+2,43);x.lineTo(L-8,36);x.closePath()};
// ------------------------------------------------------------------ the bows and the crossbow: the 3D models, cut to what was drawn and fitted
function bow3d(x,id,st,rot){if(typeof ARMI3D==='undefined')return false;const c=document.createElement('canvas');c.width=c.height=300;const g=c.getContext('2d'),sv=ctx;ctx=g;
  try{g.translate(150,150);g.scale(5,5);const V0=CR._rig.V(-.35),fr=ARMI3D.frame([0,0,0],[1,0,0],[0,0,1],1);ARMI3D.draw(id,V0,fr,st)}finally{ctx=sv}
  const D=g.getImageData(0,0,300,300).data;let x0=300,y0=300,x1=0,y1=0;for(let y=0;y<300;y+=2)for(let xx=0;xx<300;xx+=2)if(D[(y*300+xx)*4+3]>20){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<=x0)return false;const w=x1-x0+4,h=y1-y0+4,s=Math.min(80/Math.max(w,h*.8),80/Math.max(h,w*.8));x.save();x.translate(48,48);x.rotate(rot||0);x.drawImage(c,x0-2,y0-2,w,h,-w*s/2,-h*s/2,w*s,h*s);x.restore();return true}
const ITART={
  arco_frassino:x=>bow3d(x,'arco',{kind:'plain',col:'#a4703d',draw:0,nock:1},.62),
  arco_ricurvo:x=>bow3d(x,'arco',{kind:'recurve',col:'#7a4a2a',draw:0,nock:1},.62),
  arco_spine:x=>{iglow(x,'184,116,230',48,48,40,.25);bow3d(x,'arco',{kind:'thorn',col:'#4f8a34',draw:0,nock:1},.62)},
  arco_fenice:x=>{iglow(x,'255,140,40',48,48,42,.32);bow3d(x,'arco',{kind:'phoenix',col:'#d9442e',draw:0,nock:1},.62)},
  balestra:x=>bow3d(x,'balestra',{draw:1,bolt:true},-.5),
  // the obsidian bow: black glassy wood with embers in its cracks
  arco_ossidiana:x=>{iglow(x,'255,122,46',48,48,40,.3);bow3d(x,'arco',{kind:'plain',col:'#3a3044',draw:0,nock:1},.62);
    for(const[cx,cy,r] of[[30,22,2.2],[66,70,2],[24,60,1.6],[72,30,1.4],[58,14,1.2]]){iglow(x,'255,140,50',cx,cy,r*4,.6);x.fillStyle='#ffd27a';x.beginPath();x.arc(cx,cy,r*.6,0,TAU);x.fill()}},
  // the leather jacket: the V collar, the seam with two buttons, the belt with the golden buckle, stitches on the shoulders
  giubba:x=>{ishadow(x,48,88,26,4);paint(x,torso(x,24,82),'#2fb3a6');
    paint(x,()=>{x.beginPath();x.moveTo(40,15);x.lineTo(48,36);x.lineTo(44,17);x.closePath();x.moveTo(56,15);x.lineTo(48,36);x.lineTo(52,17);x.closePath()},'#23877d',{lw:2,rim:false});
    x.setLineDash([2.4,2]);x.strokeStyle='rgba(20,60,56,.6)';x.lineWidth=1.4;x.beginPath();x.moveTo(48,37);x.lineTo(48,62);x.stroke();x.strokeStyle='rgba(220,255,250,.45)';x.beginPath();x.moveTo(30,22);x.lineTo(40,19);x.moveTo(66,22);x.lineTo(56,19);x.stroke();x.setLineDash([]);
    for(const y of[44,54]){x.fillStyle='#ffc93c';x.strokeStyle=IK;x.lineWidth=1.4;x.beginPath();x.arc(51,y,2.2,0,TAU);x.fill();x.stroke()}
    paint(x,()=>{x.beginPath();x.rect(25,63,46,8)},'#8a5a20',{lw:2.4,rim:false});paint(x,()=>{x.beginPath();x.rect(43,61.5,10,11)},'#ffc93c',{lw:2,rim:false});x.fillStyle='#8a5a20';x.fillRect(46,64.5,4,5)},
  // the chain mail: the sleeves to the elbow, rings all over, a leather collar, steel plates on the shoulders with rivets
  cotta:x=>{ishadow(x,48,88,27,4);const p=torso(x,25,82);paint(x,p,'#8a97a2');x.save();p();x.clip();x.strokeStyle='rgba(30,38,46,.42)';x.lineWidth=1;
      for(let r=0;r<16;r++)for(let k=0;k<14;k++){const cx=14+k*5.4+(r%2)*2.7,cy=20+r*4.2;x.beginPath();x.arc(cx,cy,2.3,0,Math.PI);x.stroke()}
      x.strokeStyle='rgba(255,255,255,.22)';for(let r=0;r<16;r++)for(let k=0;k<14;k++){const cx=14+k*5.4+(r%2)*2.7,cy=20+r*4.2;x.beginPath();x.arc(cx,cy-.6,2.3,Math.PI*1.1,Math.PI*1.6);x.stroke()}x.restore();
    paint(x,()=>{x.beginPath();x.moveTo(38,15);x.quadraticCurveTo(48,30,58,15);x.lineTo(54,14);x.quadraticCurveTo(48,22,42,14);x.closePath()},'#7a4a2a',{lw:2,rim:false});
    for(const s of[-1,1]){paint(x,()=>{x.beginPath();x.ellipse(48+s*22,25,11,8,s*.35,0,TAU)},'#9aa3ad',{box:[48+s*22-11,17,48+s*22+11,33],kl:.5});for(const k of[-1,1]){x.fillStyle='#e8ecf0';x.strokeStyle=IK;x.lineWidth=1;x.beginPath();x.arc(48+s*22+k*5,27,1.4,0,TAU);x.fill();x.stroke()}}},
  // the cloak of shadow: a deep hood with darkness inside, the cloth that falls and opens, a ragged hem, purple wisps, a golden clasp
  mantello_ombra:x=>{ishadow(x,48,89,28,4);iglow(x,'140,90,230',48,58,44,.28);
    const cl=()=>{x.beginPath();x.moveTo(48,8);x.bezierCurveTo(66,8,72,22,70,34);x.quadraticCurveTo(80,58,84,84);x.lineTo(76,80);x.lineTo(70,87);x.lineTo(62,81);x.lineTo(55,88);x.lineTo(48,82);x.lineTo(41,88);x.lineTo(34,81);x.lineTo(26,87);x.lineTo(20,80);x.lineTo(12,84);x.quadraticCurveTo(16,58,26,34);x.bezierCurveTo(24,22,30,8,48,8);x.closePath()};
    paint(x,cl,'#5a4682',{kl:.25,kd:.5});x.save();cl();x.clip();x.strokeStyle='rgba(30,20,50,.5)';x.lineWidth=1.6;for(const s of[-1,1]){x.beginPath();x.moveTo(48+s*8,46);x.quadraticCurveTo(48+s*14,66,48+s*20,84);x.stroke()}x.restore();
    paint(x,()=>{x.beginPath();x.ellipse(48,30,14,15,0,0,TAU)},'#241a3a',{lw:2.4,rim:false,kl:.1});x.fillStyle='rgba(190,150,255,.85)';for(const s of[-1,1]){x.beginPath();x.ellipse(48+s*5,30,2,1.2,0,0,TAU);x.fill()}
    iglow(x,'190,150,255',48,30,9,.35);paint(x,()=>{x.beginPath();x.arc(48,47,4,0,TAU)},'#ffc93c',{lw:2,rim:false});
    for(const[wx,wy] of[[22,70],[74,66],[60,78]]){x.fillStyle='rgba(170,120,255,.6)';x.beginPath();x.moveTo(wx-3,wy);x.quadraticCurveTo(wx-4,wy-8,wx,wy-13);x.quadraticCurveTo(wx+4,wy-6,wx+3,wy);x.closePath();x.fill()}},
  // the moss armour: a rounded breastplate, moss growing on the shoulders and the edges, a leaf in the middle, little lights
  corazza_muschio:x=>{ishadow(x,48,88,26,4);const p=()=>{x.beginPath();x.moveTo(26,22);x.quadraticCurveTo(48,12,70,22);x.quadraticCurveTo(76,52,66,80);x.quadraticCurveTo(48,90,30,80);x.quadraticCurveTo(20,52,26,22);x.closePath()};
    paint(x,p,'#5f9e3c',{kl:.35});x.strokeStyle='rgba(30,60,20,.55)';x.lineWidth=1.6;x.beginPath();x.moveTo(48,20);x.lineTo(48,84);x.moveTo(30,50);x.quadraticCurveTo(48,56,66,50);x.stroke();
    paint(x,()=>{x.beginPath();x.moveTo(48,34);x.quadraticCurveTo(60,44,48,62);x.quadraticCurveTo(36,44,48,34);x.closePath()},'#9fe06a',{lw:2.2,rim:false,box:[38,34,58,62]});x.strokeStyle='#4a8a30';x.lineWidth=1.2;x.beginPath();x.moveTo(48,37);x.lineTo(48,60);x.stroke();
    for(const[cx,cy,r] of[[26,24,7],[33,18,6],[70,24,7],[63,18,6],[29,80,5],[67,80,5],[48,86,4]]){paint(x,()=>{x.beginPath();x.arc(cx,cy,r,0,TAU)},'#4f8a34',{lw:2,rim:false,box:[cx-r,cy-r,cx+r,cy+r],kl:.45})}
    for(const[cx,cy] of[[24,21],[69,21],[31,15],[65,15]]){x.fillStyle='#c8f08a';x.beginPath();x.arc(cx,cy,1.4,0,TAU);x.fill()}iglow(x,'200,240,138',48,48,10,.25)},
  // the lava armour: a dark breastplate of cooled rock, its cracks glowing orange
  corazza_lava:x=>{ishadow(x,48,88,26,4);iglow(x,'255,122,46',48,52,40,.3);const p=()=>{x.beginPath();x.moveTo(26,22);x.quadraticCurveTo(48,12,70,22);x.quadraticCurveTo(76,52,66,80);x.quadraticCurveTo(48,90,30,80);x.quadraticCurveTo(20,52,26,22);x.closePath()};
    paint(x,p,'#6a2a1e',{kl:.25,kd:.5});x.save();p();x.clip();x.lineCap='round';x.lineJoin='round';
    for(const cr of[[[34,26],[40,40],[36,52],[42,66]],[[60,24],[56,38],[62,50],[58,64],[62,78]],[[48,46],[52,56],[46,70]]]){x.strokeStyle='rgba(255,122,46,.45)';x.lineWidth=5;x.beginPath();for(const q of cr)x.lineTo(q[0],q[1]);x.stroke();x.strokeStyle='#ffb04a';x.lineWidth=1.8;x.beginPath();for(const q of cr)x.lineTo(q[0],q[1]);x.stroke()}x.restore();
    for(const s of[-1,1])paint(x,()=>{x.beginPath();x.ellipse(48+s*20,23,10,7,s*.35,0,TAU)},'#4a2018',{lw:2.4,rim:false,box:[48+s*20-10,16,48+s*20+10,30]})},
  // the rings: copper with an engraved line; silver with the blue gem between two little wings; silver with the gem of the wind and its
  // streaks; gold with a cluster of ice
  anello_rame:x=>{ishadow(x,48,82,24,4);iRing(x,48,56,26,20,8,'#c87533');x.strokeStyle='rgba(90,40,10,.55)';x.lineWidth=1.2;x.setLineDash([3,2.4]);x.beginPath();x.ellipse(48,56,22,16.5,0,Math.PI*.15,Math.PI*.85);x.stroke();x.setLineDash([])},
  anello_brace:x=>{ishadow(x,48,84,24,4);iglow(x,'255,122,46',48,36,28,.4);iRing(x,48,60,25,18,7.5,'#c87533');paint(x,()=>{x.beginPath();x.ellipse(48,42,10,6,0,0,TAU)},'#8a4a20',{lw:2.4,rim:false});
    gem(x,48,35,10,'#ff7a2e','round');iglow(x,'255,220,120',46,33,6,.7);for(const[cx,cy] of[[34,18],[60,14],[66,26],[30,30]]){x.fillStyle='#ffb04a';x.beginPath();x.arc(cx,cy,1.5,0,TAU);x.fill()}},
  anello_falco:x=>{ishadow(x,48,84,24,4);iRing(x,48,60,25,18,7.5,'#c9cfd6');
    for(const s of[-1,1])paint(x,()=>{x.beginPath();x.moveTo(48+s*8,38);x.quadraticCurveTo(48+s*24,26,48+s*30,32);x.quadraticCurveTo(48+s*22,34,48+s*24,40);x.quadraticCurveTo(48+s*16,40,48+s*8,44);x.closePath()},'#e8ecf0',{lw:2.2,rim:false,box:[30,26,66,44]});
    paint(x,()=>{x.beginPath();x.ellipse(48,42,10,6,0,0,TAU)},'#9aa3ad',{lw:2.4,rim:false});gem(x,48,36,10,'#4d97ff')},
  anello_vento:x=>{ishadow(x,48,84,24,4);iglow(x,'127,224,240',48,36,28,.3);iRing(x,48,60,25,18,7.5,'#c9cfd6');paint(x,()=>{x.beginPath();x.ellipse(48,42,10,6,0,0,TAU)},'#9aa3ad',{lw:2.4,rim:false});
    gem(x,48,35,11,'#7fe0f0','round');x.strokeStyle='#ffffff';x.lineWidth=1.6;x.beginPath();for(let i=0;i<=14;i++){const a=i/14*TAU*1.4,r=1+i*.48;x.lineTo(48+Math.cos(a)*r,35+Math.sin(a)*r)}x.stroke();
    x.strokeStyle='rgba(200,250,255,.85)';x.lineWidth=2;x.lineCap='round';for(const[y,l] of[[22,16],[30,22],[50,14]]){x.beginPath();x.moveTo(14,y);x.quadraticCurveTo(14+l/2,y-4,14+l,y);x.stroke();x.beginPath();x.moveTo(82,y+6);x.quadraticCurveTo(82-l/2,y+2,82-l,y+6);x.stroke()}},
  anello_gelo:x=>{ishadow(x,48,84,24,4);iglow(x,'191,233,255',48,34,32,.42);iRing(x,48,62,25,17,7.5,'#ffd86b');
    for(const[dx,h,a] of[[-10,18,-.35],[10,18,.35],[0,26,0],[-4,14,-.12],[5,15,.15]])paint(x,()=>{x.save();x.translate(48+dx,48);x.rotate(a);x.beginPath();x.moveTo(-4,0);x.lineTo(0,-h);x.lineTo(4,0);x.closePath();x.restore()},'#bfe9ff',{lw:2.2,rim:false,kl:.6,box:[30,20,66,50]});
    x.fillStyle='#fff';for(const[cx,cy] of[[30,26],[68,22],[72,40],[24,42]]){x.save();x.translate(cx,cy);for(let i=0;i<3;i++){x.rotate(Math.PI/3);x.fillRect(-.5,-3,1,6)}x.restore()}},
  // the amulets: a bone fang on a cord with beads; the silver crescent with its pale light; the medallion with three blades round a red
  // stone; the dragon's heart in golden claws, glowing
  amuleto_osso:x=>{cord(x,48,40,'#8a6a4a');for(const s of[-1,1]){x.fillStyle='#c8a070';x.strokeStyle=IK;x.lineWidth=1.4;x.beginPath();x.arc(48+s*12,30,3,0,TAU);x.fill();x.stroke()}
    paint(x,()=>{x.beginPath();x.moveTo(40,42);x.quadraticCurveTo(48,36,56,42);x.quadraticCurveTo(58,64,46,86);x.quadraticCurveTo(44,62,40,42);x.closePath()},'#e8e2d0',{box:[40,40,58,86]});
    x.strokeStyle='rgba(120,100,70,.5)';x.lineWidth=1.2;for(const y of[52,60,68]){x.beginPath();x.moveTo(44,y);x.lineTo(52,y-1.5);x.stroke()}paint(x,()=>{x.beginPath();x.arc(48,41,4,0,TAU)},'#8a6a4a',{lw:2,rim:false})},
  amuleto_luna:x=>{iglow(x,'199,210,255',50,58,34,.45);cord(x,48,32,'#c9cfd6',true);
    paint(x,()=>{x.beginPath();x.arc(48,58,24,Math.PI*.35,Math.PI*1.65);x.arc(58,54,20,Math.PI*1.55,Math.PI*.45,true);x.closePath()},'#dfe4f0',{box:[24,34,72,82],kl:.5});
    gem(x,64,58,6,'#c7d2ff','round');paint(x,()=>{x.beginPath();x.arc(48,34,4,0,TAU)},'#c9cfd6',{lw:2,rim:false});x.fillStyle='#fff';for(const[cx,cy] of[[22,30],[76,34],[80,76]]){x.beginPath();x.arc(cx,cy,1.4,0,TAU);x.fill()}},
  amuleto_lame:x=>{cord(x,48,30,'#9aa3ad',true);
    for(let i=0;i<3;i++){const a=i*TAU/3-Math.PI/2;paint(x,()=>{x.save();x.translate(48,58);x.rotate(a);x.beginPath();x.moveTo(6,-4);x.quadraticCurveTo(26,-10,32,6);x.quadraticCurveTo(22,0,6,5);x.closePath();x.restore()},'#dfe4ea',{lw:2.4,rim:false,kl:.6,box:[20,30,76,86]})}
    paint(x,()=>{x.beginPath();x.arc(48,58,12,0,TAU)},'#9aa3ad',{kl:.5});gem(x,48,58,6.5,'#e5484d','round');paint(x,()=>{x.beginPath();x.arc(48,32,4,0,TAU)},'#9aa3ad',{lw:2,rim:false})},
  cuore_drago:x=>{iglow(x,'255,120,60',48,60,38,.5);cord(x,48,30,'#ffd86b',true);
    gem(x,48,60,19,'#e5484d','heart');
    for(const[s,y] of[[-1,50],[1,50],[-1,68],[1,68]])paint(x,()=>{x.beginPath();x.moveTo(48+s*16,y-6);x.quadraticCurveTo(48+s*26,y,48+s*14,y+8);x.quadraticCurveTo(48+s*20,y,48+s*12,y-2);x.closePath()},'#ffd86b',{lw:2,rim:false,box:[28,40,68,80]});
    paint(x,()=>{x.beginPath();x.arc(48,34,4.5,0,TAU)},'#ffd86b',{lw:2,rim:false});iglow(x,'255,220,120',42,54,8,.6)},
};
// ------------------------------------------------------------------ the zombie accessories, painted the same way: the leather holster with
// the pistol's grip, the canvas backpack with its rolled blanket, the worn boots with laces and buckles, the charm with the glowing stone
const ZART={
  fondina:x=>{ishadow(x,48,88,20,4);paint(x,()=>{x.beginPath();x.moveTo(30,14);x.lineTo(62,14);x.lineTo(60,22);x.lineTo(34,22);x.closePath()},'#5a3a20',{lw:2.6,rim:false});
    paint(x,()=>{x.beginPath();x.moveTo(36,6);x.quadraticCurveTo(52,2,60,10);x.lineTo(58,30);x.lineTo(40,30);x.closePath()},'#3a3d44',{kl:.45,box:[36,4,60,30]});
    x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1.2;for(const y of[13,18,23]){x.beginPath();x.moveTo(42,y);x.lineTo(55,y-1);x.stroke()}
    paint(x,()=>{x.beginPath();x.moveTo(32,26);x.lineTo(64,26);x.quadraticCurveTo(66,60,58,86);x.quadraticCurveTo(48,92,40,86);x.quadraticCurveTo(30,60,32,26);x.closePath()},'#8a5a32',{box:[30,26,66,90]});
    x.setLineDash([2.4,2]);x.strokeStyle='rgba(255,230,190,.6)';x.lineWidth=1.2;x.beginPath();x.moveTo(36,30);x.quadraticCurveTo(35,60,42,83);x.moveTo(60,30);x.quadraticCurveTo(61,60,55,83);x.stroke();x.setLineDash([]);
    paint(x,()=>{x.beginPath();x.moveTo(44,24);x.lineTo(56,24);x.lineTo(56,42);x.quadraticCurveTo(50,46,44,42);x.closePath()},'#6a4024',{lw:2.2,rim:false});
    paint(x,()=>{x.beginPath();x.arc(50,38,3,0,TAU)},'#c9cfd6',{lw:1.6,rim:false})},
  zaino:x=>{ishadow(x,48,90,28,4);paint(x,()=>{x.beginPath();x.ellipse(48,18,24,8,0,0,TAU)},'#8a4a3a',{lw:2.6,rim:false,box:[24,10,72,26]});x.strokeStyle='rgba(40,20,10,.5)';x.lineWidth=1.2;for(const k of[-12,0,12]){x.beginPath();x.moveTo(48+k,11);x.lineTo(48+k,25);x.stroke()}
    paint(x,()=>{x.beginPath();x.moveTo(26,26);x.quadraticCurveTo(48,18,70,26);x.lineTo(72,80);x.quadraticCurveTo(48,90,24,80);x.closePath()},'#6c7a44',{box:[24,22,72,88]});
    paint(x,()=>{x.beginPath();x.moveTo(26,26);x.quadraticCurveTo(48,18,70,26);x.lineTo(70,48);x.quadraticCurveTo(48,56,26,48);x.closePath()},'#7d8c4e',{lw:2.4,box:[26,20,70,56]});
    for(const s of[-1,1]){paint(x,()=>{x.beginPath();x.rect(48+s*12-3,44,6,14)},'#4a3a24',{lw:1.8,rim:false});paint(x,()=>{x.beginPath();x.rect(48+s*12-4,52,8,5)},'#c9a050',{lw:1.4,rim:false})}
    for(const s of[-1,1])paint(x,()=>{x.beginPath();x.moveTo(48+s*22,58);x.lineTo(48+s*30,60);x.lineTo(48+s*30,78);x.lineTo(48+s*22,80);x.closePath()},'#5a6638',{lw:2.2,rim:false,box:[18,56,78,82]});
    x.setLineDash([2,2]);x.strokeStyle='rgba(230,240,200,.5)';x.lineWidth=1;x.beginPath();x.moveTo(30,64);x.quadraticCurveTo(48,70,66,64);x.stroke();x.setLineDash([])},
  stivali:x=>{ishadow(x,48,88,32,4);for(const[dx,flip] of[[-15,1],[15,-1]]){const bx=48+dx;
      paint(x,()=>{x.beginPath();x.moveTo(bx-9,14);x.lineTo(bx+7,14);x.lineTo(bx+8,62);x.quadraticCurveTo(bx+8+flip*0,64,bx+8+(flip>0?12:0),70);x.lineTo(bx+8+(flip>0?14:2),80);x.lineTo(bx-10-(flip<0?12:0),80);x.lineTo(bx-10,70);x.closePath()},'#7a4a26',{box:[bx-20,12,bx+22,82]});
      paint(x,()=>{x.beginPath();x.rect(bx-11-(flip<0?12:0),78,(flip>0?37:33),6)},'#2a1e16',{lw:2.2,rim:false});
      x.strokeStyle='#e8dcc0';x.lineWidth=1.3;for(let i=0;i<4;i++){const y=24+i*8;x.beginPath();x.moveTo(bx-5,y);x.lineTo(bx+4,y+3);x.moveTo(bx+4,y);x.lineTo(bx-5,y+3);x.stroke()}
      paint(x,()=>{x.beginPath();x.rect(bx-10,52,18,4)},'#3a2a1c',{lw:1.4,rim:false});paint(x,()=>{x.beginPath();x.rect(bx-2,51,5,6)},'#c9cfd6',{lw:1.2,rim:false});
      x.strokeStyle='rgba(255,230,190,.35)';x.lineWidth=1;x.beginPath();x.moveTo(bx-6,64);x.lineTo(bx-2,67);x.stroke()}},
  talismano:x=>{iglow(x,'125,255,140',48,52,30,.4);cord(x,48,24,'#8a6a4a');
    paint(x,()=>{x.beginPath();x.moveTo(48,24);x.lineTo(66,44);x.lineTo(58,70);x.lineTo(38,70);x.lineTo(30,44);x.closePath()},'#b89a6a',{box:[30,24,66,70]});
    x.strokeStyle='rgba(90,60,30,.5)';x.lineWidth=1.1;for(const[a,b2,c2,d] of[[36,46,44,40],[60,46,52,40],[40,64,56,64]]){x.beginPath();x.moveTo(a,b2);x.lineTo(c2,d);x.stroke()}
    gem(x,48,50,8,'#5dff8a','round');x.fillStyle='#0a1a10';x.beginPath();x.ellipse(48,50,2,4.5,0,0,TAU);x.fill();iglow(x,'160,255,170',48,50,10,.5);
    for(const[fx,a] of[[38,-.25],[48,0],[58,.25]]){x.save();x.translate(fx,72);x.rotate(a);paint(x,()=>{x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(5,10,0,22);x.quadraticCurveTo(-5,10,0,0);x.closePath()},a?'#3a3a40':'#5a2a2a',{lw:1.8,rim:false,box:[-5,0,5,22]});x.restore()}}};
{const _za=zAccIcon;zAccIcon=function(id){if(!ZART[id])return _za(id);return iconCv('za3:'+id,x=>{x.save();ZART[id](x);x.restore()})}}
