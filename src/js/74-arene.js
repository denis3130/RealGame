// =====================================================================
// LE ARENE CON LA LORO PERSONALITÀ (punto 3 del piano di Denis, anteprima 47): prima le arene 5-12 erano le stanze dei primi quattro mondi
// con un altro colore. Ora ogni arena ha i suoi pezzi sul muro di fondo e sui muri laterali, il suo pavimento vivo, le sue particelle e la
// sua luce: rampicanti con i fiori e funghi che brillano nella Cripta di Muschio, colate di lava e catene nel Cuore del Vulcano, lucciole,
// canne e ninfee nella Palude, ghiaccioli e neve sui Picchi di Brina, radici viola e candele nella Cripta Risvegliata, stendardi, catene e
// grate della forgia nel Vulcano Furioso, pozze di veleno che ribollono nella Palude Avvelenata, cristalli e aurora nel Ghiacciaio, occhi che
// sbattono nel buio e lanterne azzurre nella Cripta delle Ombre, rune d'oro e raggi nella Forgia degli Dei, gabbie appese e fuochi fatui
// nella Palude Maledetta, bandiere al vento e foglie d'oro sulla Vetta. Tutto sta ai bordi (muri, angoli): il centro resta libero e i
// nemici, i colpi e l'eroe restano leggibili. Le particelle seguono formule del tempo (niente stato da aggiornare); con LOWFX restano solo
// i pezzi fermi. ARST[i] è la ricetta dell'arena i; G.ars i pezzi della stanza.
// =====================================================================
const ARST=[
  {wall:[['vines','#4f8a34','#f6f2e0'],['vines','#5f9e3c','#ffd8f0']],side:['vines','#4f8a34'],ground:[['shrooms','140,240,220']],air:[['leaves',10,['#7bbf4a','#c8d84a','#5f9e3c']]],light:{shafts:'255,240,190'}},
  {wall:[['lavafall'],['chains','#3a3438']],side:['lava'],ground:[['cracks','255,110,30']],air:[['embers',16],['ash',10]],light:{pulse:'255,90,30'}},
  {wall:[['strands','#4a6a2a'],['reeds']],side:['reeds'],ground:[['lilies']],air:[['fireflies',16,'210,255,110'],['mist',5,'160,200,140']],light:{pulse:'190,255,120'}},
  {wall:[['icicles']],side:['ice'],ground:[['glitter','220,245,255']],air:[['snow',24],['wind',5]],light:{cold:'170,215,255'}},
  {wall:[['roots','#6a4a7a','#e0a8ff'],['candles','190,120,255']],side:['roots','#5a3a6a'],ground:[['flowers','#c48ae8']],air:[['motes',14,'200,140,255']],light:{pulse:'170,110,255'}},
  {wall:[['banners','#b8281e','hammer'],['chains','#2a2428'],['lavafall',1]],side:['braziers'],ground:[['grates','255,120,40']],air:[['sparks',1],['embers',10]],light:{pulse:'255,70,40'}},
  {wall:[['drips','#5a7a2a','150,255,90']],side:['drips'],ground:[['pools','#3c7a2a','150,255,90']],air:[['bubbles',12,'170,255,110'],['mist',5,'170,120,210']],light:{pulse:'150,255,90'}},
  {wall:[['crystals','#7f9cff','150,190,255'],['aurora']],side:['crystals'],ground:[['glitter','190,210,255']],air:[['dust',22,'210,230,255']],light:{cold:'150,170,255'}},
  {wall:[['eyes','170,210,255'],['lanterns','110,170,255']],side:['shadow'],ground:[['glyphs','110,170,255']],air:[['wisps',10,'20,24,40'],['motes',10,'130,180,255']],light:{pulse:'110,160,255'}},
  {wall:[['banners','#c8a030','eye'],['runes','127,240,192']],side:['pillars'],ground:[['circle','127,240,192']],air:[['runes',12,'127,240,192']],light:{shafts:'160,255,220'}},
  {wall:[['cages'],['roots','#5a3a5a','#ff9af0']],side:['roots','#4a304a'],ground:[['shrooms','255,140,230']],air:[['willo',7,'255,140,230'],['mist',5,'220,130,220']],light:{pulse:'255,120,220'}},
  {wall:[['flags'],['banners','#d8a830','leaf']],side:['grass'],ground:[['sun']],air:[['petals',18,['#ffd84a','#ffb84a','#9fe06a']],['wind',6]],light:{sun:'255,220,140'}}];
const arsOn=()=>!!(G&&G.ars&&G.ars.st);
// a fixed «random» number from a seed, and the room's own seeded random
const ahash=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v)};
// ------------------------------------------------------------------ the pieces of a room (when it is built)
function arsBuild(){G.ars=null;if(!G||G.mode==='inf'||G.daily||INTRO.on)return;const i=G.arena||0,st=ARST[i];if(!st)return;
  const seed=(G.room||1)*31+i*7,dx=AW/2,tx=(G.torches||[]).map(t=>t.x),free=x=>Math.abs(x-dx)>DOORW+16&&tx.every(t=>Math.abs(x-t)>16)&&x>L+10&&x<R-10;
  const slots=[];for(let k=0;k<14;k++){const x=L+12+(R-L-24)*(k+.5)/14;if(free(x))slots.push(x)}
  G.ars=arsMake(st,seed,slots,(x,y)=>!(G.rocks||[]).some(r=>Math.hypot(r.x-x,r.y-y)<r.r+18))}
// the pieces of an arena: where each one hangs on the back wall (slots: the free places), where the floor pieces lie (in the corners, not on
// an obstacle)
function arsMake(st,seed,slots,okRock){
  // each piece takes its places from the same list, so two pieces never hang in the same spot
  const take=n=>{const out=[];for(let k=0;k<n&&slots.length;k++){const j=Math.floor(ahash(seed,k+out.length*3+slots.length)*slots.length);out.push(slots.splice(j,1)[0])}return out.sort((a,b)=>a-b)};
  const A={st,seed,wall:[],ground:[]};
  for(const[k,...p] of st.wall){const n={vines:4,strands:5,reeds:3,lavafall:p[0]||2,chains:3,icicles:0,roots:3,candles:3,banners:2,drips:4,crystals:3,aurora:0,eyes:4,lanterns:2,runes:4,cages:2,flags:0}[k];
    A.wall.push({k,p,xs:n?take(n):[]})}
  const corners=[[L+26,TOP+26],[R-26,TOP+26],[L+24,BOT-22],[R-24,BOT-22]];
  for(const[k,...p] of st.ground){const pts=[];
    if(k==='circle'||k==='sun'){pts.push([AW/2,(TOP+BOT)/2])}
    else{for(const c of corners){const x=c[0]+(ahash(seed,c[0])-.5)*14,y=c[1]+(ahash(seed,c[1])-.5)*10;if(okRock(x,y))pts.push([x,y])}
      if(k==='glitter'||k==='glyphs'||k==='flowers'||k==='cracks')for(let j=0;j<6;j++){const x=L+20+ahash(seed,j+40)*(R-L-40),y=TOP+20+ahash(seed,j+60)*(BOT-TOP-40);if(okRock(x,y))pts.push([x,y])}}
    A.ground.push({k,p,pts})}
  return A}

// ------------------------------------------------------------------ the back wall
const AW_=()=>G.t||0;
function wallVines(xs,col,fl,len){const t=AW_();ctx.lineCap='round';for(const[j,x] of xs.entries()){const L2=len||(26+ahash(x,3)*30),sw=Math.sin(t*1.2+x*.07)*3;
    ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,6);ctx.quadraticCurveTo(x+sw*.5+4,6+L2*.5,x+sw,6+L2);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.stroke();
    for(let k=1;k<5;k++){const u=k/5,px=x+sw*u*u+(4*u*(1-u))*2,py=6+L2*u,s=k%2?1:-1;ctx.fillStyle=k%2?col:CR._rig.mix(col,'#fff8e6',.25);ctx.beginPath();ctx.ellipse(px+s*3,py,3.4,1.8,s*.6,0,TAU);ctx.fill();ctx.strokeStyle='rgba(20,30,10,.5)';ctx.lineWidth=.6;ctx.stroke()}
    if(fl){const px=x+sw,py=6+L2;ctx.fillStyle=fl;for(let q=0;q<5;q++){const a=q/5*TAU+j;ctx.beginPath();ctx.arc(px+Math.cos(a)*1.9,py+Math.sin(a)*1.9,1.3,0,TAU);ctx.fill()}ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.arc(px,py,1,0,TAU);ctx.fill()}}}
function wallRoots(xs,col,bud){const t=AW_();ctx.lineCap='round';for(const x of xs){const sw=Math.sin(t*.8+x)*1.5;
    for(const[o,w,l] of[[0,6,TOP-6],[-8,3.6,TOP*.62],[9,3,TOP*.5]]){ctx.strokeStyle=INK;ctx.lineWidth=w+2.2;ctx.beginPath();ctx.moveTo(x+o,0);ctx.bezierCurveTo(x+o+8,l*.3,x+o-8+sw,l*.6,x+o+sw*.6,l);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()}
    const b=.6+.4*Math.sin(t*2+x);ctx.save();ctx.globalCompositeOperation='lighter';glow(hexToRgbA(bud),x+sw*.6,TOP-6,9,.5*b);ctx.restore();ctx.fillStyle=bud;ctx.beginPath();ctx.arc(x+sw*.6,TOP-6,2.4,0,TAU);ctx.fill();ink(1);ctx.stroke()}}
const hexToRgbA=h=>{const n=parseInt(h.slice(1),16);return`${n>>16},${n>>8&255},${n&255}`};
function wallStrands(xs,col){const t=AW_();for(const x of xs){const l=20+ahash(x,5)*26,sw=Math.sin(t*1.1+x*.1)*2.5;ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.lineCap='round';
    for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(x+k*3,4);ctx.quadraticCurveTo(x+k*3+sw,4+l*.5,x+k*4+sw*1.4,4+l*(k?0.8:1));ctx.stroke()}}}
function wallReeds(xs){const t=AW_();for(const x of xs)for(let k=0;k<5;k++){const bx=x+(k-2)*4,h=18+ahash(x,k)*14,sw=Math.sin(t*1.4+x+k)*2;ctx.strokeStyle=INK;ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(bx,TOP-2);ctx.quadraticCurveTo(bx+sw*.4,TOP-2-h*.5,bx+sw,TOP-2-h);ctx.stroke();
    ctx.strokeStyle='#5f8a3a';ctx.lineWidth=1.4;ctx.stroke();if(k%2===0){ctx.fillStyle='#6a4426';ctx.beginPath();ctx.ellipse(bx+sw,TOP-2-h,1.8,4,0,0,TAU);ctx.fill();ink(1);ctx.stroke()}}}
function wallLavafall(xs){const t=AW_();for(const x of xs){const w=9;ctx.save();ctx.globalCompositeOperation='lighter';glow('255,110,30',x,TOP-20,30,.35+.1*Math.sin(t*3+x));ctx.restore();
    const g=ctx.createLinearGradient(0,0,0,TOP);g.addColorStop(0,'#ff4a10');g.addColorStop(.5,'#ff8a24');g.addColorStop(1,'#ffd27a');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-w*.6,0);
    for(let y=0;y<=TOP;y+=6)ctx.lineTo(x-w*.5-Math.sin(y*.2+t*4)*1.5-(y/TOP)*2,y);for(let y=TOP;y>=0;y-=6)ctx.lineTo(x+w*.5+Math.sin(y*.21+t*4+1)*1.5+(y/TOP)*2,y);ctx.closePath();ctx.fill();ink(1.6);ctx.stroke();
    ctx.strokeStyle='rgba(255,250,200,.85)';ctx.lineWidth=1;for(let k=0;k<3;k++){const y0=((t*40+k*26)%TOP);ctx.beginPath();ctx.moveTo(x-1+k,y0);ctx.lineTo(x-1+k,y0+8);ctx.stroke()}
    ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.ellipse(x,TOP-2,w*.9,2.6,0,0,TAU);ctx.fill()}}
function wallChains(xs,col){const t=AW_();for(const x of xs){const l=TOP*.55+ahash(x,9)*20,sw=Math.sin(t*1.3+x)*2.4;ctx.lineWidth=1.6;
    for(let y=4;y<l;y+=4.2){const k=y/l,px=x+sw*k*k,o=(Math.round(y/4.2)%2);ctx.strokeStyle=INK;ctx.beginPath();ctx.ellipse(px,y,o?1.2:2,2.4,0,0,TAU);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(px,y,o?.8:1.5,1.9,0,0,TAU);ctx.stroke();ctx.lineWidth=1.6}
    const hx=x+sw;ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(hx+2,l+4,4,Math.PI*.9,Math.PI*2.3);ctx.stroke();ctx.strokeStyle='#8a8e96';ctx.lineWidth=1.6;ctx.stroke()}}
function wallIcicles(){const t=AW_();for(let x=L+4;x<R-4;x+=7){if(Math.abs(x-AW/2)<DOORW+4)continue;const h=6+ahash(x,2)*14;ctx.fillStyle='rgba(220,245,255,.9)';ctx.beginPath();ctx.moveTo(x-3,TOP-4);ctx.lineTo(x,TOP-4+h);ctx.lineTo(x+3,TOP-4);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(60,110,150,.7)';ctx.lineWidth=.8;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(x-1.4,TOP-4,1,h*.6);if(ahash(x,7)>.82){const k=((t*.7+ahash(x,8))%1);if(k<.4){ctx.fillStyle=`rgba(200,240,255,${1-k/.4})`;ctx.beginPath();ctx.arc(x,TOP-4+h+k*30,1.2,0,TAU);ctx.fill()}}}
  ctx.fillStyle='rgba(240,250,255,.75)';for(let x=L;x<R;x+=5){if(Math.abs(x-AW/2)<DOORW)continue;ctx.beginPath();ctx.arc(x,TOP-5,2.4+ahash(x,4)*1.6,Math.PI,0);ctx.fill()}}
function wallCandles(xs,rgb){const t=AW_();for(const x of xs)for(let k=0;k<3;k++){const cx=x+(k-1)*5,h=6+((k*7)%3)*2,y=TOP-6;ctx.fillStyle='#e8e0cc';ink(1);ctx.fillRect(cx-1.4,y-h,2.8,h);ctx.strokeRect(cx-1.4,y-h,2.8,h);
    const f=.8+.2*Math.sin(t*11+cx)+.1*Math.sin(t*23+k);ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,cx,y-h-3,10*f,.5);ctx.restore();ctx.fillStyle=`rgb(${rgb})`;ctx.beginPath();ctx.ellipse(cx,y-h-3,1.5,3*f,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(cx,y-h-2.4,.6,1.3*f,0,0,TAU);ctx.fill()}}
function wallBanners(xs,col,em){const t=AW_();for(const x of xs){const w=16,h=34,y0=10;ctx.fillStyle='#3a2a1c';ink(1.4);ctx.fillRect(x-w/2-3,y0-2,w+6,3);ctx.strokeRect(x-w/2-3,y0-2,w+6,3);
    const wv=k=>Math.sin(t*2+x*.1+k*3)*1.6*k;ctx.beginPath();ctx.moveTo(x-w/2,y0);ctx.lineTo(x+w/2,y0);ctx.lineTo(x+w/2+wv(1),y0+h);ctx.lineTo(x+wv(1),y0+h-6);ctx.lineTo(x-w/2+wv(1),y0+h);ctx.closePath();
    const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,CR._rig.mix(col,'#fff8e6',.18));g.addColorStop(1,CR._rig.mix(col,'#140f0c',.35));ctx.fillStyle=g;ctx.fill();ink(1.6);ctx.stroke();
    const cy=y0+h*.42;ctx.strokeStyle='rgba(255,236,170,.85)';ctx.fillStyle='rgba(255,236,170,.85)';ctx.lineWidth=1.2;
    if(em==='hammer'){ctx.fillRect(x-4,cy-4,8,4);ctx.fillRect(x-.8,cy,1.6,8)}else if(em==='eye'){ctx.beginPath();ctx.ellipse(x,cy,5,3,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(x,cy,1.5,0,TAU);ctx.fill()}
    else{ctx.beginPath();ctx.moveTo(x,cy-6);ctx.quadraticCurveTo(x+6,cy,x,cy+6);ctx.quadraticCurveTo(x-6,cy,x,cy-6);ctx.fill()}}}
function wallDrips(xs,col,rgb){const t=AW_();for(const x of xs){if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,TOP*.55,16,.25+.1*Math.sin(t*2+x));ctx.restore()}
    const sl=()=>{ctx.beginPath();ctx.moveTo(x-3,0);ctx.quadraticCurveTo(x+1,TOP*.3,x-2,TOP*.55);ctx.quadraticCurveTo(x-1,TOP*.72,x+.5,TOP*.7);ctx.quadraticCurveTo(x+2,TOP*.5,x+3,0);ctx.closePath()};
    sl();ctx.fillStyle=`rgba(${rgb},.85)`;ctx.fill();ctx.strokeStyle='rgba(20,40,10,.7)';ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle='rgba(240,255,220,.6)';ctx.fillRect(x-1.6,4,1,TOP*.4);
    ctx.fillStyle=`rgba(${rgb},.7)`;ctx.beginPath();ctx.ellipse(x,TOP-2,7,2.2,0,0,TAU);ctx.fill();
    const k=(t*.8+ahash(x,1))%1,y=TOP*.7+k*k*60;ctx.fillStyle=`rgba(${rgb},${1-k})`;ctx.beginPath();ctx.ellipse(x-1,y,1.4,2.2,0,0,TAU);ctx.fill()}}
function wallCrystals(xs,col,rgb){const t=AW_();for(const x of xs){const b=.6+.4*Math.sin(t*1.6+x);ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,TOP-14,24,.4*b);ctx.restore();
    for(const[o,h,a] of[[-6,16,-.3],[0,26,0],[6,18,.32],[3,10,.6]]){ctx.save();ctx.translate(x+o,TOP-3);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-3.4,0);ctx.lineTo(-2.6,-h*.8);ctx.lineTo(0,-h);ctx.lineTo(2.6,-h*.8);ctx.lineTo(3.4,0);ctx.closePath();
      const g=ctx.createLinearGradient(-3,0,3,0);g.addColorStop(0,CR._rig.mix(col,'#ffffff',.5));g.addColorStop(1,CR._rig.mix(col,'#101030',.3));ctx.fillStyle=g;ctx.fill();ink(1.2);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(-1.6,-h*.75,1,h*.6);ctx.restore()}}}
function wallAurora(){if(LOWFX)return;const t=AW_();ctx.save();ctx.globalCompositeOperation='lighter';for(let b=0;b<3;b++){const cols=['120,255,200','150,140,255','200,120,255'][b];ctx.beginPath();
    for(let x=-40;x<=AW+40;x+=12){const y=-46+b*11+Math.sin(x*.022+t*.5+b)*9+Math.sin(x*.07-t*.8)*3;x>-40?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=`rgba(${cols},${.28+.1*Math.sin(t+b)})`;ctx.lineWidth=14;ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle=`rgba(${cols},.45)`;ctx.stroke()}
  const g=ctx.createLinearGradient(0,0,0,TOP);g.addColorStop(0,`rgba(150,200,255,${.12+.05*Math.sin(t*.7)})`);g.addColorStop(1,'rgba(150,200,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,AW,TOP);ctx.restore()}
function wallEyes(xs,rgb){const t=AW_();for(const[j,x] of xs.entries()){const y=18+ahash(x,3)*(TOP-34),ph=(t*.35+ahash(x,6)*3)%3,open=ph<2.6?1:Math.abs(Math.sin((ph-2.6)/.4*Math.PI))<.5?0:1,look=Math.sin(t*.7+j)*1.4;
    ctx.fillStyle='rgba(8,8,16,.85)';ctx.beginPath();ctx.ellipse(x,y,9,5,0,0,TAU);ctx.fill();if(!open){ctx.strokeStyle=`rgba(${rgb},.6)`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x-1,y);ctx.moveTo(x+1,y);ctx.lineTo(x+6,y);ctx.stroke();continue}
    ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,10,.5);ctx.restore();for(const s of[-1,1]){ctx.fillStyle=`rgb(${rgb})`;ctx.beginPath();ctx.ellipse(x+s*3.4+look,y,1.8,1.3,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+s*3.4+look,y,.6,0,TAU);ctx.fill()}}}
function wallLanterns(xs,rgb){const t=AW_();for(const x of xs){const sw=Math.sin(t*1.2+x)*1.5,y=TOP-28;ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x+sw,y-6);ctx.stroke();const f=.8+.2*Math.sin(t*7+x);
    ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x+sw,y,22*f,.5);ctx.restore();ctx.fillStyle='#2a2e38';ink(1.2);ctx.fillRect(x+sw-4,y-6,8,11);ctx.strokeRect(x+sw-4,y-6,8,11);ctx.fillStyle=`rgba(${rgb},.9)`;ctx.fillRect(x+sw-2.6,y-4,5.2,7);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x+sw,y-.5,1,2*f,0,0,TAU);ctx.fill()}}
function wallRunes(xs,rgb){const t=AW_();for(const[j,x] of xs.entries()){const y=16+((j*13)%3)*12+Math.sin(t*1.3+j)*3,b=.55+.45*Math.sin(t*2+j*1.7);ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,12,.45*b);ctx.strokeStyle=`rgba(${rgb},${.6+.4*b})`;ctx.lineWidth=1.4;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);if(j%2){ctx.moveTo(x,y-2);ctx.lineTo(x+4,y-5);ctx.moveTo(x,y+1);ctx.lineTo(x-4,y-2)}else{ctx.moveTo(x-4,y+3);ctx.lineTo(x+4,y-3);ctx.moveTo(x-3,y-3);ctx.lineTo(x,y)}ctx.stroke();ctx.restore()}}
function wallCages(xs){const t=AW_();for(const x of xs){const sw=Math.sin(t*.9+x)*.12,l=TOP*.42;ctx.save();ctx.translate(x,2);ctx.rotate(sw);ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,l);ctx.stroke();
    const w=13,h=20,b=.6+.4*Math.sin(t*2.2+x);ctx.fillStyle='rgba(10,8,14,.55)';ctx.fillRect(-w/2,l,w,h);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,140,230',0,l+h*.55,14,.55*b);ctx.restore();ctx.fillStyle=`rgba(255,190,240,${.6+.4*b})`;ctx.beginPath();ctx.arc(0,l+h*.55,2.2,0,TAU);ctx.fill();
    ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.strokeRect(-w/2,l,w,h);ctx.strokeStyle='#a898a8';ctx.lineWidth=1.3;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*3.3,l);ctx.lineTo(k*3.3,l+h);ctx.stroke()}
    ctx.beginPath();ctx.moveTo(-w/2,l);ctx.quadraticCurveTo(0,l-7,w/2,l);ctx.stroke();ctx.strokeRect(-w/2,l,w,h);ctx.restore()}}
function wallFlags(){const t=AW_(),cols=['#e5484d','#ffd84a','#7bbf4a','#4d97ff','#c48ae8'];ctx.strokeStyle='#3a2a1c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,8);ctx.quadraticCurveTo(AW/2,26,R,8);ctx.stroke();
  for(let k=1;k<14;k++){const u=k/14,x=L+(R-L)*u,y=8+18*4*u*(1-u),w=Math.sin(t*3+k)*1.4;ctx.fillStyle=cols[k%5];ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.lineTo(x+w,y+9);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(20,16,12,.6)';ctx.lineWidth=.7;ctx.stroke()}}
// ------------------------------------------------------------------ the side and bottom walls
function sideDecor(k,p){const t=AW_(),ys=[];for(let y=TOP+30;y<BOT-20;y+=68)ys.push(y);
  for(const[side,x] of[[-1,L-2],[1,R+2]])for(const[j,y] of ys.entries()){const s=ahash(y,side+5);
    if(k==='vines'||k==='roots'){const col=p[0]||'#4f8a34',sw=Math.sin(t*1.1+y*.05)*2;ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y-20);ctx.quadraticCurveTo(x-side*(6+sw),y,x-side*2,y+22);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
      if(k==='vines')for(let q=0;q<3;q++){ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x-side*(4+q),y-12+q*12,3,1.6,side*.7,0,TAU);ctx.fill()}}
    else if(k==='lava'){const b=.5+.5*Math.sin(t*2+y);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,100,30',x,y,16,.3*b);ctx.restore();ctx.strokeStyle=`rgba(255,${140+60*b|0},60,.9)`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x-side*3,y-4);ctx.lineTo(x,y+6);ctx.lineTo(x-side*2,y+14);ctx.stroke()}
    else if(k==='reeds'||k==='grass'){for(let q=0;q<4;q++){const bx=x-side*(1+q*2.4),h=12+s*10,sw=Math.sin(t*1.6+y+q)*2;ctx.strokeStyle=k==='grass'?'#c8a84a':'#5f8a3a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(bx,y+10);ctx.quadraticCurveTo(bx+sw*.5,y+10-h*.5,bx+sw,y+10-h);ctx.stroke()}}
    else if(k==='ice'||k==='crystals'){ctx.fillStyle=k==='ice'?'rgba(225,245,255,.85)':'rgba(170,190,255,.9)';for(let q=0;q<3;q++){const h=6+((j+q)%3)*4;ctx.beginPath();ctx.moveTo(x,y+q*7);ctx.lineTo(x-side*h,y+q*7+2);ctx.lineTo(x,y+q*7+4);ctx.closePath();ctx.fill()}
      if(Math.sin(t*2+y)>.92){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-side*4,y+4,1.2,0,TAU);ctx.fill()}}
    else if(k==='braziers'){if(j%2)continue;const f=.8+.2*Math.sin(t*9+y);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',x-side*6,y-8,20*f,.45);ctx.restore();ctx.fillStyle='#2a2428';ink(1.2);ctx.beginPath();ctx.moveTo(x-side*1,y);ctx.lineTo(x-side*11,y);ctx.lineTo(x-side*9,y+6);ctx.lineTo(x-side*3,y+6);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#ff8a24';ctx.beginPath();ctx.ellipse(x-side*6,y-3,3.4,5*f,0,0,TAU);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.ellipse(x-side*6,y-2,1.5,2.6*f,0,0,TAU);ctx.fill()}
    else if(k==='drips'){const kk=(t*.7+s)%1;ctx.fillStyle=`rgba(150,255,90,${(1-kk)*.9})`;ctx.beginPath();ctx.ellipse(x-side*2,y+kk*30,1.3,2,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(90,140,40,.8)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y-10);ctx.lineTo(x-side*2,y);ctx.stroke()}
    else if(k==='shadow'){if(LOWFX)continue;ctx.fillStyle='rgba(8,8,18,.5)';ctx.beginPath();ctx.moveTo(x,y-26);for(let q=0;q<=6;q++){const yy=y-26+q*9,o=(4+4*Math.sin(t*1.6+q+y*.1))*(q%2?1:.4);ctx.lineTo(x-side*o-side*2,yy)}ctx.lineTo(x,y+28);ctx.closePath();ctx.fill()}
    else if(k==='pillars'){if(j%2)continue;const b=.6+.4*Math.sin(t*1.5+y);ctx.save();ctx.globalCompositeOperation='lighter';glow('127,240,192',x-side*4,y,18,.3*b);ctx.restore();ctx.strokeStyle='#d8b040';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-side*3,y-14);ctx.lineTo(x-side*3,y+14);ctx.stroke()}}}
// ------------------------------------------------------------------ the floor
function groundDecor(gd){const t=AW_(),{k,p,pts}=gd;
  for(const[j,[x,y]] of pts.entries()){
    if(k==='shrooms'){for(let q=0;q<3;q++){const mx=x+(q-1)*7,my=y+(q%2)*4,h=5+q*2;ctx.fillStyle='#e8dcc0';ink(1);ctx.fillRect(mx-1.2,my-h,2.4,h);ctx.strokeRect(mx-1.2,my-h,2.4,h);const col=p[0],b=.6+.4*Math.sin(t*1.8+x+q);
      ctx.fillStyle=`rgba(${col},.95)`;ctx.beginPath();ctx.ellipse(mx,my-h,4.4,3,0,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(mx-1.4,my-h-1.4,.8,0,TAU);ctx.fill();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(col,mx,my-h,12,.35*b);ctx.restore()}}}
    else if(k==='lilies'){for(let q=0;q<3;q++){const lx=x+(q-1)*10,ly=y+(q%2)*6,a=.4+q;ctx.fillStyle='#4f8a3a';ctx.beginPath();ctx.ellipse(lx,ly,7,4,0,a,a+TAU-.6);ctx.lineTo(lx,ly);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(16,24,12,.6)';ctx.lineWidth=1;ctx.stroke()}
      ctx.fillStyle='#ffd8f0';for(let q=0;q<5;q++){const a=q/5*TAU;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*2.4,y-1+Math.sin(a)*1.4,2,1.2,a,0,TAU);ctx.fill()}ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.arc(x,y-1,1.2,0,TAU);ctx.fill()}
    else if(k==='glitter'){if(LOWFX)continue;for(let q=0;q<4;q++){const ph=(t*.9+ahash(x,q))%1;if(ph>.3)continue;const sx=x+(ahash(x,q+9)-.5)*30,sy=y+(ahash(y,q+9)-.5)*18,a=Math.sin(ph/.3*Math.PI);ctx.strokeStyle=`rgba(${p[0]},${a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx-3,sy);ctx.lineTo(sx+3,sy);ctx.moveTo(sx,sy-3);ctx.lineTo(sx,sy+3);ctx.stroke()}}
    else if(k==='flowers'){for(let q=0;q<4;q++){const fx=x+(ahash(x,q)-.5)*20,fy=y+(ahash(y,q)-.5)*12;ctx.strokeStyle='#3f6a2a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx,fy-5);ctx.stroke();ctx.fillStyle=p[0];ctx.beginPath();ctx.arc(fx,fy-6,1.8,0,TAU);ctx.fill()}}
    else if(k==='cracks'||k==='grates'||k==='glyphs'){const b=.5+.5*Math.sin(t*1.5+x*.1),rgb=p[0];
      if(k==='grates'){ctx.fillStyle='#1a1416';ctx.fillRect(x-12,y-7,24,14);ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,20,.45*b);ctx.restore();ctx.strokeStyle='#4a4448';ctx.lineWidth=2;for(let q=-2;q<=2;q++){ctx.beginPath();ctx.moveTo(x+q*5,y-7);ctx.lineTo(x+q*5,y+7);ctx.stroke()}ink(1.4);ctx.strokeRect(x-12,y-7,24,14)}
      else if(k==='glyphs'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${rgb},${.25+.25*b})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.stroke();ctx.restore()}
      else{ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${rgb},${.35+.35*b})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x-3,y-3);ctx.lineTo(x+2,y+2);ctx.lineTo(x+10,y-1);ctx.stroke();ctx.restore()}}
    else if(k==='pools'){const col=p[0],rgb=p[1];ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,16,8,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(20,30,10,.6)';ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='rgba(200,255,150,.25)';ctx.beginPath();ctx.ellipse(x-4,y-2,6,2.4,0,0,TAU);ctx.fill();
      if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,22,.25);ctx.restore();for(let q=0;q<3;q++){const ph=(t*.8+q/3+ahash(x,q))%1,bx=x+(ahash(x,q+5)-.5)*20,by=y+(ahash(y,q+5)-.5)*8,r=1+ph*2.6;ctx.strokeStyle=`rgba(${rgb},${1-ph})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx,by-ph*2,r,0,TAU);ctx.stroke()}}}
    else if(k==='circle'||k==='sun'){if(LOWFX)continue;const b=.5+.5*Math.sin(t*.9);ctx.save();ctx.globalCompositeOperation='lighter';
      if(k==='sun'){glow('255,220,140',x,y,140,.08+.04*b)}else{ctx.strokeStyle=`rgba(${p[0]},${.12+.1*b})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,90,56,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,70,43,0,0,TAU);ctx.stroke();
        for(let q=0;q<8;q++){const a=q/8*TAU+t*.15;ctx.beginPath();ctx.arc(x+Math.cos(a)*80,y+Math.sin(a)*49.5,2,0,TAU);ctx.fillStyle=`rgba(${p[0]},${.3+.2*b})`;ctx.fill()}}ctx.restore()}}}
// ------------------------------------------------------------------ the air: particles that follow the clock (no state), never over the HUD
function airDecor(a){if(LOWFX)return;const t=AW_(),[k,n,c]=a,W=R-L,H=BOT-TOP+40,seed=G.ars.seed;
  for(let i=0;i<n;i++){const r1=ahash(seed+i,1),r2=ahash(seed+i,2),r3=ahash(seed+i,3),ph=r3*TAU;
    if(k==='leaves'||k==='petals'){const wind=k==='petals'?24:6,vy=k==='petals'?12:16,y=TOP-20+((r2*H+t*vy)%H),x=L+((r1*W+t*wind+Math.sin(t*.9+ph)*14)%W+W)%W,rot=t*2+ph,col=c[i%c.length];
      ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=.85;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,0,k==='petals'?2.6:3.4,k==='petals'?1.6:1.7,0,0,TAU);ctx.fill();ctx.restore()}
    else if(k==='snow'||k==='dust'){const vy=k==='snow'?22+r3*14:6,y=TOP-20+((r2*H+t*vy)%H),x=L+((r1*W+Math.sin(t*.8+ph)*16+t*(k==='snow'?6:2))%W+W)%W,s=k==='snow'?1+r3*1.4:.9;
      ctx.fillStyle=k==='snow'?'rgba(255,255,255,.8)':`rgba(${c},${.4+.4*Math.sin(t*3+ph)})`;ctx.beginPath();ctx.arc(x,y,s,0,TAU);ctx.fill();if(k==='dust'&&Math.sin(t*3+ph)>.85){ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-2.5,y);ctx.lineTo(x+2.5,y);ctx.moveTo(x,y-2.5);ctx.lineTo(x,y+2.5);ctx.stroke()}}
    else if(k==='embers'||k==='sparks'||k==='bubbles'||k==='runes'){const up=k==='bubbles'?14:k==='runes'?10:26,y=BOT+10-((r2*H+t*up)%H),x=L+((r1*W+Math.sin(t*1.3+ph)*10)%W+W)%W,b=.5+.5*Math.sin(t*5+ph);
      if(k==='bubbles'){ctx.strokeStyle=`rgba(${c},.55)`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,1.6+r3*2,0,TAU);ctx.stroke()}
      else if(k==='runes'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${c},${.35+.4*b})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.moveTo(x-2,y-1);ctx.lineTo(x+2,y+1);ctx.stroke();ctx.restore()}
      else if(k==='sparks'){// a burst from the grates every 3 s
        const gp=(G.ars.ground.find(g=>g.k==='grates')||{pts:[]}).pts;for(const[gi,[gx,gy]] of gp.entries()){const ph2=(t/3+gi*.37)%1;if(ph2>.35)continue;for(let q=0;q<8;q++){const a=-Math.PI/2+(ahash(gi,q)-.5)*1.6,v=40+ahash(q,gi)*50,u=ph2/.35*.6;
          ctx.fillStyle=`rgba(255,${200-q*8},90,${1-ph2/.35})`;ctx.beginPath();ctx.arc(gx+Math.cos(a)*v*u,gy+Math.sin(a)*v*u+60*u*u,1.2,0,TAU);ctx.fill()}}break}
      else{ctx.save();ctx.globalCompositeOperation='lighter';glow('255,130,50',x,y,5,.45*b);ctx.restore();ctx.fillStyle=`rgba(255,${170+60*b|0},90,${.6+.4*b})`;ctx.beginPath();ctx.arc(x,y,1.1,0,TAU);ctx.fill()}}
    else if(k==='ash'){const y=TOP-20+((r2*H+t*8)%H),x=L+((r1*W+t*4)%W);ctx.fillStyle='rgba(150,140,135,.2)';ctx.fillRect(x,y,2,1.4)}
    else if(k==='fireflies'||k==='motes'||k==='willo'){const x=L+10+r1*(W-20)+Math.sin(t*.5+ph)*24,y=TOP+10+r2*(BOT-TOP-20)+Math.cos(t*.42+ph*1.3)*18,b=(Math.sin(t*(k==='willo'?1.4:3)+ph)+1)/2;
      ctx.save();ctx.globalCompositeOperation='lighter';glow(c,x,y,k==='willo'?16:9,(k==='willo'?.55:.5)*b);ctx.restore();ctx.fillStyle=`rgba(${c},${.5+.5*b})`;ctx.beginPath();ctx.arc(x,y,k==='willo'?2.2:1.2,0,TAU);ctx.fill()}
    else if(k==='wisps'){const x=L+((r1*W+t*9)%W),y=TOP+20+r2*(BOT-TOP-40)+Math.sin(t*.8+ph)*12;ctx.fillStyle=`rgba(${c},.35)`;ctx.beginPath();ctx.ellipse(x,y,9,4,Math.sin(t+ph)*.3,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(x-8,y+1,5,2.4,0,0,TAU);ctx.fill()}
    else if(k==='mist'){const x=L+((r1*W+t*7*(r3>.5?1:-1))%W+W)%W,y=TOP+30+r2*(BOT-TOP-60);glow(c,x,y,80,.05)}
    else if(k==='wind'){const y=TOP+20+r2*(BOT-TOP-40),ph2=(t*.5+r1)%1,x=L-60+ph2*(W+120);ctx.strokeStyle=`rgba(255,255,255,${.22*Math.sin(ph2*Math.PI)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+20,y-4,x+44,y);ctx.stroke()}}}
// ------------------------------------------------------------------ the light of the arena (over the room, soft)
function arsLight(lt){if(LOWFX||!lt)return;const t=AW_();ctx.save();ctx.globalCompositeOperation='lighter';
  if(lt.shafts||lt.sun){const rgb=lt.shafts||lt.sun;for(let k=0;k<3;k++){const x=L+40+k*(R-L-80)/2+Math.sin(t*.2+k)*10,a=.05+.025*Math.sin(t*.6+k*2);
    if(stripFast('as|'+rgb+'|'+(lt.sun?1:0)+'|'+TOP+'|'+BOT,[[x,TOP-10],[x+30,TOP-10],[x+(lt.sun?140:90),BOT],[x+(lt.sun?80:50),BOT]],rgb,TOP,BOT,a*1.6,'lighter'))continue;const g=ctx.createLinearGradient(0,TOP,0,BOT);g.addColorStop(0,`rgba(${rgb},${a*1.6})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(x,TOP-10);ctx.lineTo(x+30,TOP-10);ctx.lineTo(x+(lt.sun?140:90),BOT);ctx.lineTo(x+(lt.sun?80:50),BOT);ctx.closePath();ctx.fill()}}
  if(lt.pulse){const b=.5+.5*Math.sin(t*1.1);for(const[x,y] of[[L,BOT],[R,BOT],[L,TOP+30],[R,TOP+30]])glow(lt.pulse,x,y,120,.06+.05*b)}
  if(lt.cold&&!stripFast('ac|'+lt.cold+'|'+AW+'|'+TOP,[[0,TOP-20],[AW,TOP-20],[AW,TOP+120],[0,TOP+120]],lt.cold,TOP-20,TOP+120,.12,'lighter')){const g=ctx.createLinearGradient(0,TOP-20,0,TOP+120);g.addColorStop(0,`rgba(${lt.cold},.12)`);g.addColorStop(1,`rgba(${lt.cold},0)`);ctx.fillStyle=g;ctx.fillRect(0,TOP-20,AW,140)}
  ctx.restore()}
// ------------------------------------------------------------------ hooked to the room and to the drawing
{const _be=buildEnv;buildEnv=function(){_be.apply(this,arguments);try{arsBuild()}catch(e){console.error(e);G.ars=null}}}
function arsWallAll(){for(const w of G.ars.wall){const p=w.p;
  if(w.k==='vines')wallVines(w.xs,p[0],p[1]);else if(w.k==='roots')wallRoots(w.xs,p[0],p[1]);else if(w.k==='strands')wallStrands(w.xs,p[0]);else if(w.k==='reeds')wallReeds(w.xs);else if(w.k==='lavafall')wallLavafall(w.xs);
  else if(w.k==='chains')wallChains(w.xs,p[0]);else if(w.k==='icicles')wallIcicles();else if(w.k==='candles')wallCandles(w.xs,p[0]);else if(w.k==='banners')wallBanners(w.xs,p[0],p[1]);else if(w.k==='drips')wallDrips(w.xs,p[0],p[1]);
  else if(w.k==='crystals')wallCrystals(w.xs,p[0],p[1]);else if(w.k==='aurora')wallAurora();else if(w.k==='eyes')wallEyes(w.xs,p[0]);else if(w.k==='lanterns')wallLanterns(w.xs,p[0]);else if(w.k==='runes')wallRunes(w.xs,p[0]);
  else if(w.k==='cages')wallCages(w.xs);else if(w.k==='flags')wallFlags()}}
{const _wb=drawWallBack;drawWallBack=function(){_wb.apply(this,arguments);if(!G.ars)return;try{arsWallAll()}catch(e){console.error(e);G.ars=null}}}
{const _wf=drawWallFront;drawWallFront=function(){_wf.apply(this,arguments);if(!G.ars)return;try{const s=G.ars.st.side;if(s)sideDecor(s[0],s.slice(1))}catch(e){console.error(e);G.ars=null}}}
{const _eg=drawEnvGround;drawEnvGround=function(){_eg.apply(this,arguments);if(!G.ars)return;try{for(const g of G.ars.ground)groundDecor(g)}catch(e){console.error(e);G.ars=null}}}
{const _am=drawAmbient;drawAmbient=function(){_am.apply(this,arguments);if(!G.ars)return;try{for(const a of G.ars.st.air)airDecor(a);arsLight(G.ars.st.light)}catch(e){console.error(e);G.ars=null}}}
// ------------------------------------------------------------------ the emblem engraved in the middle of the floor: one for each arena (in
// the Abyss and in the daily challenge, the one of the chapter's first arena); drawn as grooves by renderFloor (eng: a path, cut into stone)
function floorEmblem(eng,s,f0,i0){const i=i0!=null?i0:G&&G.mode!=='inf'&&!G.daily?(G.arena||0):Math.max(0,((G&&G.chapter)||1)-1),f=f0||fx;
  const E=[
    ()=>{eng(()=>{f.moveTo(0,-s);f.quadraticCurveTo(s*.85,-s*.3,0,s*.75);f.quadraticCurveTo(-s*.85,-s*.3,0,-s)});eng(()=>{f.moveTo(0,-s*.8);f.lineTo(0,s*1.05)});for(const k of[-1,1])for(const y of[-.35,.05,.4])eng(()=>{f.moveTo(0,s*y);f.lineTo(k*s*.42,s*(y-.28))})},
    ()=>{eng(()=>{f.moveTo(0,-s*1.05);f.bezierCurveTo(s*.55,-s*.45,s*.75,s*.15,s*.45,s*.7);f.quadraticCurveTo(0,s*1.05,-s*.45,s*.7);f.bezierCurveTo(-s*.75,s*.15,-s*.2,-s*.25,-s*.1,-s*.55);f.quadraticCurveTo(-s*.05,-s*.85,0,-s*1.05)});eng(()=>{f.moveTo(0,-s*.2);f.quadraticCurveTo(s*.3,s*.25,0,s*.62);f.quadraticCurveTo(-s*.3,s*.25,0,-s*.2)})},
    ()=>{eng(()=>{f.arc(0,s*.25,s*.8,-1.9,Math.PI*1.4)});eng(()=>{f.moveTo(0,s*.25);f.lineTo(s*.1,-s*.55)});for(let k=0;k<5;k++){const a=k/5*TAU-Math.PI/2;eng(()=>{f.ellipse(Math.cos(a)*s*.22,-s*.15+Math.sin(a)*s*.22,s*.18,s*.09,a,0,TAU)})}},
    ()=>{for(let k=0;k<3;k++){const a=k*Math.PI/3;eng(()=>{f.moveTo(-Math.cos(a)*s,-Math.sin(a)*s);f.lineTo(Math.cos(a)*s,Math.sin(a)*s)});for(const sd of[-1,1])for(const r of[.55,.8])eng(()=>{const px=sd*Math.cos(a)*s*r,py=sd*Math.sin(a)*s*r,b=a+Math.PI/2;f.moveTo(px+Math.cos(b+.5*sd)*s*.18-Math.cos(a)*sd*s*.12,py+Math.sin(b+.5*sd)*s*.18-Math.sin(a)*sd*s*.12);f.lineTo(px,py);f.lineTo(px-Math.cos(b-.5*sd)*s*.18-Math.cos(a)*sd*s*.12,py-Math.sin(b-.5*sd)*s*.18-Math.sin(a)*sd*s*.12)})}},
    ()=>{eng(()=>{f.moveTo(-s,s*.1);f.quadraticCurveTo(0,-s*.75,s,s*.1);f.quadraticCurveTo(0,s*.75,-s,s*.1)});eng(()=>{f.arc(0,s*.1,s*.3,0,TAU)});eng(()=>{f.arc(0,-s*.95,s*.35,Math.PI*.15,Math.PI*1.25)})},
    ()=>{eng(()=>{f.rect(-s*.7,s*.25,s*1.4,s*.38)});eng(()=>{f.moveTo(-s*.45,s*.63);f.lineTo(-s*.25,s*.95);f.lineTo(s*.25,s*.95);f.lineTo(s*.45,s*.63)});eng(()=>{f.rect(-s*.45,-s*.95,s*.9,s*.42)});eng(()=>{f.moveTo(0,-s*.53);f.lineTo(0,s*.2)})},
    ()=>{for(const k of[-1,0,1])eng(()=>{f.moveTo(k*s*.3,s*.95);f.quadraticCurveTo(k*s*1.1,s*.1,k*s*.62,-s*.55);f.arc(k*s*.62,-s*.7,s*.16,Math.PI*.5,Math.PI*2.5)})},
    ()=>{eng(()=>{f.moveTo(-s*.85,s*.55);f.lineTo(-s*.85,-s*.2);f.lineTo(-s*.45,s*.1);f.lineTo(-s*.2,-s*.85);f.lineTo(0,s*.05);f.lineTo(s*.2,-s*.85);f.lineTo(s*.45,s*.1);f.lineTo(s*.85,-s*.2);f.lineTo(s*.85,s*.55);f.closePath()});eng(()=>{f.moveTo(-s*.85,s*.3);f.lineTo(s*.85,s*.3)})},
    ()=>{eng(()=>{f.moveTo(-s*.9,0);f.quadraticCurveTo(0,-s*.6,s*.9,0);f.quadraticCurveTo(0,s*.6,-s*.9,0)});eng(()=>{f.arc(0,0,s*.24,0,TAU)});for(let k=0;k<8;k++){const a=k/8*TAU;eng(()=>{f.moveTo(Math.cos(a)*s*1.05,Math.sin(a)*s*.85);f.lineTo(Math.cos(a)*s*1.3,Math.sin(a)*s*1.05)})}},
    ()=>{eng(()=>{f.arc(0,-s*.3,s*.55,0,TAU)});eng(()=>{f.rect(-s*.4,-s*.55,s*.8,s*.4)});eng(()=>{f.moveTo(0,-s*.15);f.lineTo(0,s*1)});for(let k=0;k<6;k++){const a=-Math.PI/2+(k-2.5)*.4;eng(()=>{f.moveTo(Math.cos(a)*s*.7,-s*.3+Math.sin(a)*s*.7);f.lineTo(Math.cos(a)*s*1,-s*.3+Math.sin(a)*s*1)})}},
    ()=>{eng(()=>{f.arc(0,0,s*.85,Math.PI*.3,Math.PI*1.7);f.arc(s*.35,0,s*.7,Math.PI*1.6,Math.PI*.4,true)});eng(()=>{f.moveTo(-s*.75,-s*.25);f.lineTo(-s*.45,-s*.05);f.lineTo(-s*.62,s*.15);f.lineTo(-s*.3,s*.35)})},
    ()=>{eng(()=>{f.moveTo(-s,s*.7);f.lineTo(-s*.35,-s*.35);f.lineTo(-s*.05,s*.1);f.lineTo(s*.35,-s*.6);f.lineTo(s,s*.7);f.closePath()});eng(()=>{f.moveTo(-s*.15,-s*.4+s*.12);f.lineTo(s*.35,-s*.6);f.lineTo(s*.6,-s*.18)});eng(()=>{f.arc(-s*.6,-s*.75,s*.22,0,TAU)})}];
  (E[i]||E[0])()}
// ------------------------------------------------------------------ the arena's pieces in its preview (arenaScene, src/js/61-anteprime-arene.js):
// the same back wall, floor pieces, particles and light, scaled so the game's wall height fits the preview's; the room's size and clock are
// lent for the drawing and given back
function arsPreview(i,W,H,wh,t){const st=ARST[i];if(!st)return;const k=wh/TOP,sv={AW,R,BOT,ars:G.ars,gt:G.t,tor:G.torches};
  try{AW=W/k;R=AW-24;BOT=H/k-12;G.t=t;const dx=AW/2,gw=W*.14/k,tx=[W*.22/k,W*.78/k],slots=[];
    for(let q=0;q<14;q++){const x=L+12+(R-L-24)*(q+.5)/14;if(Math.abs(x-dx)>gw+10&&tx.every(t0=>Math.abs(x-t0)>16))slots.push(x)}
    G.ars=arsMake(st,i*7+31,slots,()=>true);G.torches=tx.map(x=>({x,y:38,ph:0}));
    ctx.save();ctx.scale(k,k);for(const g of G.ars.ground)groundDecor(g);arsWallAll();for(const a of st.air)airDecor(a);arsLight(st.light);ctx.restore()}
  catch(e){console.error(e)}finally{AW=sv.AW;R=sv.R;BOT=sv.BOT;G.ars=sv.ars;G.t=sv.gt;G.torches=sv.tor}}
// the emblem of the arena engraved in the preview's floor, in the middle, with its two rings
function arsEmblem(c,i,cx,cy,R0){c.save();c.translate(cx,cy);c.scale(1,.62);for(const[r,w] of[[R0,3],[R0*.8,2]]){c.beginPath();c.arc(0,0,r,0,TAU);c.strokeStyle='rgba(0,0,0,.42)';c.lineWidth=w;c.stroke()}
  const eng=f=>{c.beginPath();f();c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=2.4;c.stroke();c.save();c.translate(0,1.4);c.beginPath();f();c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;c.stroke();c.restore()};
  try{floorEmblem(eng,R0*.42,c,i)}catch(e){}c.restore()}
// ------------------------------------------------------------------ «Nuova arena sbloccata!» as a little show (punto 9): the screen opens on
// two heavy doors with the arena's emblem split between them; a line of light shines through the middle, the doors slide open with dust
// and a shake, the room appears with its pieces, the boss shows its blow; then the name of the arena drops in, the lines follow and last
// the button (it waits a moment, so a tap meant for something else does not close it). A tap on the picture jumps to the end
function auDoors(c,W,H,k,A,i,t){if(k>=1)return;const col=A.col,half=W/2*(1-k),bw=Math.max(0,half);
  for(const sd of[-1,1]){const x0=sd<0?0:W-bw;c.save();c.beginPath();c.rect(x0,0,bw,H);c.clip();
    const g=c.createLinearGradient(x0,0,x0+bw,0);g.addColorStop(0,'#2a2420');g.addColorStop(.5,'#3a322a');g.addColorStop(1,'#1e1a16');c.fillStyle=g;c.fillRect(x0,0,bw,H);
    // planks, iron bands with rivets, and the half of the emblem on the inner edge
    c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=2;for(let x=sd<0?half-22:W-half+22;sd<0?x>0:x<W;x+=sd<0?-22:22){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
    for(const y of[H*.18,H*.82]){c.fillStyle='#4a4a52';c.fillRect(x0,y-7,bw,14);c.fillStyle='#8a8e96';for(let x=(sd<0?half-12:W-half+12);sd<0?x>0:x<W;x+=sd<0?-22:22){c.beginPath();c.arc(x,y,2.2,0,TAU);c.fill()}}
    c.restore()}
  // the emblem on the doors, split in two, glowing with the arena's colour; then the light through the gap
  const cx=W/2,cy=H*.5;c.save();c.beginPath();c.rect(0,0,half,H);c.rect(W-half,0,half,H);c.clip();c.save();c.translate(-W/2*k,0);c.beginPath();c.rect(0,0,W/2,H);c.clip();arsEmblemGlow(c,i,cx,cy,col,t);c.restore();
  c.save();c.translate(W/2*k,0);c.beginPath();c.rect(W/2,0,W/2,H);c.clip();arsEmblemGlow(c,i,cx,cy,col,t);c.restore();c.restore();
  const a=k>0?1-k:Math.min(1,t/.35)*.8;c.save();c.globalCompositeOperation='lighter';const gg=c.createLinearGradient(cx-30-half*.2,0,cx+30+half*.2,0);gg.addColorStop(0,'rgba(255,240,200,0)');gg.addColorStop(.5,`rgba(255,240,200,${.85*a})`);gg.addColorStop(1,'rgba(255,240,200,0)');
  c.fillStyle=gg;c.fillRect(cx-30-half,0,60+half*2,H);c.restore();c.strokeStyle='#0a0806';c.lineWidth=3;c.beginPath();c.moveTo(half,0);c.lineTo(half,H);c.moveTo(W-half,0);c.lineTo(W-half,H);c.stroke()}
function arsEmblemGlow(c,i,cx,cy,col,t){const rgb=hexToRgbA(col);c.save();c.globalCompositeOperation='lighter';glowOn(c,rgb,cx,cy,70,.25+.1*Math.sin(t*6));c.restore();
  c.save();c.translate(cx,cy);const eng=f=>{c.beginPath();f();c.strokeStyle='#120e0a';c.lineWidth=5;c.stroke();c.beginPath();f();c.strokeStyle=col;c.lineWidth=2.2;c.stroke()};try{floorEmblem(eng,38,c,i)}catch(e){}c.restore()}
function glowOn(c,rgb,x,y,r,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r)}
showArenaUp=function(i){const A=ARENAS[i],el=$('arenaUpScr'),z=A.boss||'radici';
  el.innerHTML=`<div class="vsRays"></div><div class="auBox auSeq"><span class="vsKind">Nuova arena sbloccata!</span><div class="auPic"><canvas id="auCv" width="360" height="270"></canvas><span class="auNum">Arena ${i+1}</span></div><span class="ribbon" style="--ac:${A.col}">${A.n}</span><p>${A.d}</p><p class="auBoss">Custode: <b>${(A.bt?ET[A.bt].name:CUSTODE_INTRO[z]||'').replace(/^(Il|La|Lo|L')\s?/,'')}</b></p><p class="auTr">${TROPHY}${A.t} coppe</p><button class="btn go" id="auOk">Fantastico!</button></div>`;
  el.hidden=false;const cv=$('auCv'),c=cv.getContext('2d'),ok=$('auOk');let t0=performance.now(),said={};ok.disabled=true;setTimeout(()=>{ok.disabled=false},LOWFX?300:1700);
  cv.onclick=()=>{t0=Math.min(t0,performance.now()-1800);ok.disabled=false};
  const frame=()=>{if(el.hidden||!cv.isConnected)return;const t=LOWFX?2:(performance.now()-t0)/1000,k=CR._rig.ez(Math.min(1,Math.max(0,(t-.45)/.85)));
    if(t>.45&&!said.d){said.d=1;sfx('door');vib(40)}if(t>1.6&&!said.r){said.r=1;sfx('roar');vib([30,20,60])}
    const sh=t>.45&&t<1.35&&!LOWFX?(1.35-t)*5:0;c.setTransform(1,0,0,1,0,0);c.save();if(sh)c.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
    try{arenaScene(cv,i,Math.max(0,t-.6))}catch(e){}c.setTransform(1,0,0,1,0,0);if(sh)c.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
    // the dust of the doors along the floor
    if(t>.45&&t<1.9&&!LOWFX){const u=(t-.45)/1.45;for(let q=0;q<14;q++){const x=360/2+(q%2?1:-1)*(20+q*9)*(.4+u),y=262-ahash(q,3)*16-u*14;c.fillStyle=`rgba(210,195,170,${.45*(1-u)})`;c.beginPath();c.arc(x,y,4+u*9+ahash(q,5)*4,0,TAU);c.fill()}}
    auDoors(c,360,270,k,A,i,t);c.restore();
    if(!LOWFX)requestAnimationFrame(frame)};
  frame();sfx('victory');vib([40,30,40,30,120]);ok.onclick=()=>{if(ok.disabled)return;sfx('ui');el.hidden=true;renderPlay()}};
{const st=document.createElement('style');st.textContent=`
.auSeq .ribbon{animation:auDrop .55s 1.15s cubic-bezier(.2,1.4,.4,1) backwards}
.auSeq>p{animation:auFade .4s 1.45s ease backwards}.auSeq>p.auBoss{animation-delay:1.65s}.auSeq>p.auTr{animation-delay:1.8s}
.auSeq #auOk{animation:auFade .35s 1.75s ease backwards}.auSeq #auOk:disabled{opacity:.55}
.auSeq .auPic{animation:auPop .45s .05s cubic-bezier(.2,1.3,.4,1) backwards}
@keyframes auDrop{from{opacity:0;transform:translateY(-26px) scale(1.4)}to{opacity:1;transform:none}}
@keyframes auFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes auPop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.auSeq .ribbon,.auSeq>p,.auSeq #auOk,.auSeq .auPic{animation:none}}`;document.head.appendChild(st)}
