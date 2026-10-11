// Mappa della modalità zombie (bozza da mostrare a Denis): terreno delle zone, case con il tetto che si toglie,
// oggetti della mappa e zombie che escono da terra.
// Disegnati con le funzioni del gioco (ctx, ink, glow, ell, INK, LOWFX, G.t) e dipinti come lo Zombie della lanterna:
// luce calda dall'alto a sinistra, tre toni per ogni pezzo, un filo di luce dentro il contorno, contorno scuro spesso.
// Nel gioco i pezzi fermi si cuociono una volta in immagini (come rockSprite) e la mappa le ridisegna; quelli che si
// muovono (fiamme, cespugli, buche) restano disegnati dal vivo.
window.MAPPA=(()=>{
const TAU=Math.PI*2,cl=(v,a,b)=>v<a?a:v>b?b:v;
const rng=seed=>{let s=(Math.imul(seed|0||1,2654435761)>>>0)||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}};
const hx=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]};
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const dk=(c,k)=>mix(c,'#0d0a08',k),lt=(c,k)=>mix(c,'#fff1d2',k);
function poly(p){ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath()}
function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
function bb(p){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}return[x0,y0,x1-x0,y1-y0]}
// a piece painted like the lantern zombie: its colour, light from the upper left, shade on the lower right,
// a warm thread of light inside the outline on the lit side, then the thick dark outline
function paint(path,col,box,o){o=o||{};const[x,y,w,h]=box;ctx.save();path();ctx.fillStyle=col;ctx.fill();ctx.clip();
  const g=ctx.createLinearGradient(x,y,x+w*.55,y+h);g.addColorStop(0,`rgba(255,232,180,${o.lit??.22})`);g.addColorStop(.42,'rgba(255,232,180,0)');
  g.addColorStop(.58,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(10,6,4,${o.dark??.34})`);ctx.fillStyle=g;ctx.fillRect(x-4,y-4,w+8,h+8);
  if(o.inner)o.inner();
  if(o.rim!==false){ctx.translate(1.4,1.5);path();ctx.strokeStyle=`rgba(255,226,160,${o.rimA??.36})`;ctx.lineWidth=1.8;ctx.stroke()}
  ctx.restore();if(o.ink!==false){path();ink(o.lw||2.5);ctx.stroke()}}
const pp=(p,c,o)=>paint(()=>poly(p),c,bb(p),o);
// the game's glow ends with globalAlpha=1: this one keeps the alpha it found (the roof fades with alpha)
function gl(rgb,x,y,r,a,ry){const A=ctx.globalAlpha;glow(rgb,x,y,r,a*A,ry);ctx.globalAlpha=A}
// soft shadow on the ground
function gshadow(path,a){ctx.save();ctx.fillStyle=`rgba(0,0,0,${a||.32})`;if(!LOWFX&&'filter' in ctx)ctx.filter='blur(3px)';path();ctx.fill();ctx.restore()}
function oval(x,y,rx,ry,a){gshadow(()=>ell(x,y,rx,ry),a)}

// ---------------------------------------------------------------- small things that live on the ground
function tuft(x,y,s,c1,c2,R){const n=4+Math.floor(R()*4);ctx.lineCap='round';
  for(let i=0;i<n;i++){const a=-Math.PI/2+(i/(n-1)-.5)*1.4+(R()-.5)*.3,l=(5+R()*5)*s,bx=x+(i-(n-1)/2)*1.3*s,ex=bx+Math.cos(a)*l,ey=y+Math.sin(a)*l;
    ctx.strokeStyle='rgba(16,12,8,.6)';ctx.lineWidth=2.6*s;ctx.beginPath();ctx.moveTo(bx,y);ctx.quadraticCurveTo(bx+Math.cos(a)*l*.4,y+Math.sin(a)*l*.7,ex,ey);ctx.stroke();
    ctx.strokeStyle=i%2?c1:c2;ctx.lineWidth=1.3*s;ctx.stroke()}}
function pebble(x,y,s,R,c){c=c||mix('#7a7468','#5c574e',R());ctx.save();ctx.translate(x,y);ctx.rotate((R()-.5)*1.2);ell(0,0,3*s,2*s);ctx.fillStyle=c;ctx.fill();
  ctx.strokeStyle='rgba(16,12,8,.75)';ctx.lineWidth=1.1;ctx.stroke();ctx.fillStyle='rgba(255,240,210,.28)';ell(-.8*s,-.7*s,1.4*s,.7*s);ctx.fill();ctx.restore()}
function leaf(x,y,R){ctx.save();ctx.translate(x,y);ctx.rotate(R()*TAU);ell(0,0,3.2,1.6);ctx.fillStyle=['#8a5a2a','#a8742e','#6e4a24','#7d6a2a'][Math.floor(R()*4)];ctx.fill();
  ctx.strokeStyle='rgba(30,20,10,.6)';ctx.lineWidth=.8;ctx.stroke();ctx.beginPath();ctx.moveTo(-2.6,0);ctx.lineTo(2.6,0);ctx.stroke();ctx.restore()}
function flower(x,y,c){ctx.strokeStyle='#3f6a2a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-5);ctx.stroke();for(let i=0;i<5;i++){const a=i/5*TAU;ctx.fillStyle=c;ell(x+Math.cos(a)*1.8,y-5+Math.sin(a)*1.8,1.4,1.4);ctx.fill()}ctx.fillStyle='#ffd86b';ell(x,y-5,1,1);ctx.fill()}
function moss(x,y,r,R){for(let i=0;i<6;i++){const a=R()*TAU,d=R()*r;ctx.fillStyle=i%2?'#4f7a30':'#5f8f38';ell(x+Math.cos(a)*d,y+Math.sin(a)*d*.6,r*.45,r*.3);ctx.fill()}
  ctx.fillStyle='rgba(200,255,140,.35)';for(let i=0;i<3;i++){ell(x+(R()-.5)*r,y-r*.2+(R()-.5)*r*.4,1,1);ctx.fill()}}

// ---------------------------------------------------------------- the ground of each zone (in the game: baked in big pieces)
// nothing scattered at random: grass, pebbles and leaves grow along the edges of the path, in a few clumps and at the foot of things
const GR1='#7f8c4c',GR2='#5f7038';
// point on a cubic bezier and the normal to it
function bez(B,k){const u=1-k,a=u*u*u,b=3*u*u*k,c=3*u*k*k,d=k*k*k,px=a*B[0][0]+b*B[1][0]+c*B[2][0]+d*B[3][0],py=a*B[0][1]+b*B[1][1]+c*B[2][1]+d*B[3][1];
  const tx=3*u*u*(B[1][0]-B[0][0])+6*u*k*(B[2][0]-B[1][0])+3*k*k*(B[3][0]-B[2][0]),ty=3*u*u*(B[1][1]-B[0][1])+6*u*k*(B[2][1]-B[1][1])+3*k*k*(B[3][1]-B[2][1]),l=Math.hypot(tx,ty)||1;
  return[px,py,-ty/l,tx/l]}
// life at the foot of things: a few tufts and a pebble hugging the base
function piede(x,y,w,R,n){n=n||3+Math.floor(w/10);for(let i=0;i<n;i++){const px=x+(i/(n-1||1)-.5)*w+(R()-.5)*4,py=y+.5+R()*2.5;if(R()<.72)tuft(px,py,.7+R()*.2,GR1,GR2,R);else pebble(px,py+1,.65,R)}}
function terreno(x,y,w,h,zona,seed,o){o=o||{};const R=rng(seed||3);ctx.save();rr(x,y,w,h,10);ctx.clip();
  if(zona==='cimitero'){ctx.fillStyle='#38352a';ctx.fillRect(x,y,w,h);
    // big soft blotches of damp and dry earth, low contrast
    for(let i=0;i<w*h/1400;i++){const px=x+R()*w,py=y+R()*h,r=16+R()*30;ctx.fillStyle=R()<.5?'rgba(84,72,50,.14)':'rgba(16,14,10,.13)';ell(px,py,r,r*.6);ctx.fill()}
    // the worn path, and the life along its edges
    const B=[[x-10,y+h*.78],[x+w*.3,y+h*.55],[x+w*.62,y+h*.98],[x+w+10,y+h*.62]];
    ctx.beginPath();ctx.moveTo(B[0][0],B[0][1]);ctx.bezierCurveTo(B[1][0],B[1][1],B[2][0],B[2][1],B[3][0],B[3][1]);ctx.lineCap='round';
    ctx.strokeStyle='rgba(96,82,60,.55)';ctx.lineWidth=22;ctx.stroke();ctx.strokeStyle='rgba(120,104,78,.3)';ctx.lineWidth=10;ctx.stroke();
    for(let i=0;i<w/7;i++){const[px,py,nx,ny]=bez(B,R()),sd=R()<.5?-1:1,off=12+R()*4,gx=px+nx*off*sd,gy=py+ny*off*sd;
      if(R()<.62)tuft(gx,gy,.85,GR1,GR2,R);else pebble(gx,gy,.75+R()*.6,R)}
    // a few clumps of grass, thicker at the rim
    for(let i=0;i<Math.max(2,Math.round(w*h/14000));i++){const px=x+R()*w,py=y+R()*h,r=14+R()*16;ctx.fillStyle='rgba(70,84,44,.4)';ell(px,py,r,r*.55);ctx.fill();
      for(let j=0;j<8;j++){const a=R()*TAU;tuft(px+Math.cos(a)*r*.8,py+Math.sin(a)*r*.45,.85,GR1,GR2,R)}
      if(R()<.6)moss(px+(R()-.5)*r*.6,py+(R()-.5)*r*.3,6,R)}
    // fallen leaves in little drifts, pebbles in little groups
    for(let i=0;i<Math.max(1,Math.round(w*h/26000));i++){const px=x+R()*w,py=y+R()*h;for(let j=0;j<7;j++)leaf(px+(R()-.5)*24,py+(R()-.5)*10,R)}
    for(let i=0;i<Math.max(1,Math.round(w*h/22000));i++){const px=x+R()*w,py=y+R()*h;for(let j=0;j<3;j++)pebble(px+(R()-.5)*12,py+(R()-.5)*6,.8+R()*.8,R)}}
  else if(zona==='quartiere'){ctx.fillStyle='#29251f';ctx.fillRect(x,y,w,h);
    const cw=16,ch=11,mp=o.marciapiede||[y,y+Math.round(h*.28)],m0=mp[0],top=mp[1];
    // cobbles; grass only in the seams
    for(let r=-Math.ceil((top-y)/ch)-1;top+r*ch<y+h+ch;r++)for(let c=-1;c*cw<w+cw;c++){const cx=x+c*cw+(r%2?cw/2:0)+(R()-.5)*2,cy=top+r*ch+(R()-.5)*1.4,ww=cw-3+(R()-.5)*2,hh=ch-3;
      rr(cx,cy,ww,hh,4);ctx.fillStyle=mix('#6f685c','#565148',R());ctx.fill();
      ctx.fillStyle='rgba(255,240,210,.13)';rr(cx+1,cy+1,ww-3,hh*.45,3);ctx.fill();ctx.fillStyle='rgba(0,0,0,.24)';rr(cx+1,cy+hh*.62,ww-2,hh*.38,3);ctx.fill();
      if(R()<.1){ctx.strokeStyle='rgba(16,12,8,.6)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(cx+2,cy+2);ctx.lineTo(cx+ww*.5,cy+hh*.6);ctx.lineTo(cx+ww-2,cy+hh*.4);ctx.stroke()}
      if(R()<.07)tuft(cx+ww,cy+hh+1,.6,'#6f8a44','#55703a',R)}
    // the pavement: square slabs in staggered rows, then the kerb
    ctx.fillStyle='#4e4942';ctx.fillRect(x,m0,w,top-m0);if(m0>y){ctx.fillStyle='#8c8577';ctx.fillRect(x,m0-2,w,4);ctx.fillStyle='rgba(16,12,8,.5)';ctx.fillRect(x,m0+2,w,1.5)}
    ctx.save();ctx.beginPath();ctx.rect(x,m0,w,top-m0);ctx.clip();
    const sw=24,sh=17;for(let r=0;m0+r*sh<top;r++)for(let c=-1;c*sw<w+sw;c++){const sx=x+c*sw+(r%2?sw/2:0),sy=m0+r*sh;
      rr(sx+1,sy+1,sw-2,sh-2,2.5);ctx.fillStyle=mix('#7e776a','#67615a',R());ctx.fill();
      ctx.fillStyle='rgba(255,240,210,.1)';ctx.fillRect(sx+2.5,sy+2,sw-6,1.6);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(sx+2,sy+sh-4,sw-5,2);
      if(R()<.14){ctx.strokeStyle='rgba(16,12,8,.55)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(sx+3+R()*6,sy+2);ctx.lineTo(sx+sw*.5,sy+sh*.5);ctx.lineTo(sx+sw-3,sy+sh-3);ctx.stroke()}
      if(R()<.06)tuft(sx+sw-1,sy+sh,.55,'#6f8a44','#55703a',R)}
    ctx.restore();ctx.fillStyle='#8c8577';ctx.fillRect(x,top-7,w,6);ctx.fillStyle='rgba(255,240,210,.2)';ctx.fillRect(x,top-7,w,1.3);ctx.fillStyle='rgba(16,12,8,.6)';ctx.fillRect(x,top-1,w,2.5);
    for(let k=R()*20;k<w;k+=34+R()*20){ctx.fillStyle='rgba(16,12,8,.45)';ctx.fillRect(x+k,top-7,1.2,6)}
    // a puddle with the moon in it, a drain at the kerb
    if(!o.pulito){const px=x+w*(.35+R()*.45),py=top+(y+h-top)*(.45+R()*.35);
    ctx.save();ell(px,py,26,9);ctx.fillStyle='#1b272d';ctx.fill();ctx.clip();ctx.fillStyle='rgba(120,160,190,.18)';ell(px+4,py+3,22,6);ctx.fill();ctx.fillStyle='rgba(200,230,245,.5)';ell(px-8,py-2,5,1.8);ctx.fill();ctx.restore();
    ell(px,py,26,9);ctx.strokeStyle='rgba(16,12,8,.5)';ctx.lineWidth=1.2;ctx.stroke();ctx.strokeStyle='rgba(170,210,230,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(px,py,24,7.5,0,Math.PI*1.1,Math.PI*1.7);ctx.stroke();
    const gx=x+w*(.1+R()*.5),gy=top+1;rr(gx,gy,18,9,2);ctx.fillStyle='#2a2826';ctx.fill();ink(1.5);ctx.stroke();ctx.strokeStyle='#5a5650';ctx.lineWidth=1.2;for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(gx+i*3.6,gy+2);ctx.lineTo(gx+i*3.6,gy+7);ctx.stroke()}}}
  else{ctx.fillStyle='#42582e';ctx.fillRect(x,y,w,h);
    for(let i=0;i<w;i+=22){ctx.fillStyle=(i/22)%2?'rgba(255,255,200,.03)':'rgba(0,0,0,.045)';ctx.fillRect(x+i,y,22,h)}
    const fx=x+Math.round(w*.52);ctx.fillStyle='#4a3626';ctx.fillRect(fx,y,w,h);
    for(let yy=y+3;yy<y+h;yy+=10){ctx.fillStyle='#634a30';ctx.fillRect(fx,yy,w,4);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(fx,yy+4,w,2);
      for(let xx=fx+6;xx<x+w;xx+=13)if(R()<.55){ctx.strokeStyle='#3f6a2a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(xx,yy+3);ctx.lineTo(xx-2,yy-1);ctx.moveTo(xx,yy+3);ctx.lineTo(xx+2,yy-1);ctx.stroke()}}
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(fx-2,y,4,h);
    // the grass grows thick along the edge of the field, in a few clumps elsewhere
    for(let yy=y+3;yy<y+h;yy+=6+R()*6)tuft(fx-3-R()*7,yy,.85,'#78a04a','#5a8038',R);
    for(let i=0;i<Math.max(2,Math.round(w*h/9000));i++){const px=x+R()*(fx-x-14),py=y+R()*h;for(let j=0;j<5;j++)tuft(px+(R()-.5)*18,py+(R()-.5)*8,.8,'#78a04a','#5a8038',R)}
    // flowers in little groups, straw blown against the edge of the field
    for(let i=0;i<Math.max(1,Math.round(w*h/20000));i++){const px=x+R()*(fx-x-14),py=y+R()*h;for(let j=0;j<3;j++)flower(px+(R()-.5)*14,py+(R()-.5)*8,['#f2e6ff','#ffd86b','#ff9ab0'][(i+j)%3])}
    for(let i=0;i<h/12;i++){const px=fx+2+R()*8,py=y+R()*h,a=R()*TAU;ctx.strokeStyle='rgba(214,180,90,.75)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a)*5,py+Math.sin(a)*2);ctx.stroke()}}
  // the ground stays darker than everything standing on it
  ctx.fillStyle='rgba(8,8,16,.12)';ctx.fillRect(x,y,w,h);ctx.restore()}

// ---------------------------------------------------------------- buildings: roof on from outside, roof off when you are inside
// o: {w,d,H, muro:'assi'|'pietra'|'rosso', tetto:'tegole'|'ardesia'|'scandole', extra:'casa'|'cappella'|'fienile', seed}
// (x0,y0) is the back-left corner of the house on the ground; roof: 1 = from outside, 0 = inside, in between = fading
function edificio(x0,y0,o,roof,t){const w=o.w,d=o.d,H=o.H;
  gshadow(()=>poly([[x0+4,y0+d],[x0+w+4,y0+d],[x0+w+22,y0+d-10],[x0+w+22,y0-H+6],[x0+w,y0-H-4]]),.38);
  if(roof<1){interno(x0,y0,o,t);if(o.dentro)o.dentro(t)}
  if(roof>0){ctx.save();ctx.globalAlpha*=roof;esterno(x0,y0,o,t);ctx.restore()}
  if(roof<1){ctx.save();ctx.globalAlpha*=(1-roof);muroBasso(x0,y0,o);ctx.restore()}}
const MURO={assi:'#7d5c3f',pietra:'#8a8274',rosso:'#8a3a2e'},TETTO={tegole:'#8c3d2c',ardesia:'#4c5866',scandole:'#6e5034'};
function facciata(x0,y0,o){const w=o.w,d=o.d,H=o.H,R=rng(o.seed+11),fy=y0+d-H,c=MURO[o.muro]||MURO.assi;
  const box=[x0,fy,w,H];
  paint(()=>{ctx.beginPath();ctx.rect(x0,fy,w,H)},c,box,{inner:()=>{
    if(o.muro==='pietra'){for(let r=0;r*9<H;r++)for(let k=-1;k*18<w;k++){const bx=x0+k*18+(r%2?9:0),by=fy+r*9;rr(bx+1,by+1,16,7,2);ctx.fillStyle=mix(c,R()<.5?'#a49c8c':'#6e675c',R()*.6);ctx.fill();ctx.strokeStyle='rgba(16,12,8,.45)';ctx.lineWidth=1;ctx.stroke()}}
    else if(o.muro==='rosso'){for(let k=0;k*9<w;k++){ctx.fillStyle=mix(c,k%2?'#a04634':'#702e24',.5+R()*.3);ctx.fillRect(x0+k*9,fy,9,H);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x0+k*9+8,fy,1.2,H)}}
    else{for(let r=0;r*7<H;r++){const by=fy+r*7;ctx.fillStyle=mix(c,r%2?'#94704e':'#664a32',.3+R()*.4);ctx.fillRect(x0,by,w,7);ctx.fillStyle='rgba(0,0,0,.32)';ctx.fillRect(x0,by+6,w,1.2);
      ctx.fillStyle='rgba(20,14,10,.6)';for(let k=0;k<w;k+=34+R()*20){ell(x0+k+R()*8,by+3.4,.8,.8);ctx.fill()}
      if(R()<.12){const gx=x0+R()*(w-30);ctx.fillStyle='#1a1410';ctx.fillRect(gx,by+1,14+R()*16,5)}}}
    // the bottom gets dirty and mossy, a stone foundation
    const g=ctx.createLinearGradient(0,fy+H-14,0,fy+H);g.addColorStop(0,'rgba(30,40,20,0)');g.addColorStop(1,'rgba(30,40,20,.45)');ctx.fillStyle=g;ctx.fillRect(x0,fy+H-14,w,14);
    if(o.muro!=='pietra')for(let k=0;k*12<w;k++){rr(x0+k*12+(R()-.5)*2,fy+H-7,11,7,2.5);ctx.fillStyle=mix('#857e72','#5f5a52',R());ctx.fill();ctx.strokeStyle='rgba(16,12,8,.55)';ctx.lineWidth=1;ctx.stroke()}}});
  // corner beams
  for(const bx of [x0-1,x0+w-6])pp([[bx,fy-2],[bx+7,fy-2],[bx+7,fy+H],[bx,fy+H]],o.muro==='rosso'?'#e8dcc4':'#4e3826',{lw:2})}
function finestra(x,y,ww,hh,kind,R,lit){pp([[x-3,y-3],[x+ww+3,y-3],[x+ww+3,y+hh+3],[x-3,y+hh+3]],'#9a7a52',{lw:2.2});
  ctx.save();ctx.beginPath();ctx.rect(x,y,ww,hh);ctx.fillStyle=lit?'#5a4a2a':'#16232a';ctx.fill();ctx.clip();
  if(lit){ctx.globalCompositeOperation='lighter';gl(lit,x+ww/2,y+hh/2,ww,.55);ctx.globalCompositeOperation='source-over'}
  else{ctx.strokeStyle='rgba(170,215,235,.45)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-2,y+hh*.7);ctx.lineTo(x+ww*.6,y-2);ctx.stroke();ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+ww*.4,y+hh+2);ctx.lineTo(x+ww+2,y+hh*.2);ctx.stroke()}
  if(kind==='rotta'){ctx.fillStyle='#07090b';poly([[x+ww*.2,y],[x+ww*.55,y+hh*.45],[x+ww*.35,y+hh*.6],[x+ww*.7,y+hh],[x+ww,y+hh],[x+ww,y],[x+ww*.75,y],[x+ww*.6,y+hh*.25],[x+ww*.45,y]]);ctx.fill()}
  ctx.restore();ink(1.4);ctx.beginPath();ctx.moveTo(x+ww/2,y);ctx.lineTo(x+ww/2,y+hh);ctx.moveTo(x,y+hh/2);ctx.lineTo(x+ww,y+hh/2);ctx.stroke();
  if(kind==='assi'){for(const[a,b,c2,d2] of [[x-4,y+2,x+ww+4,y+hh-3],[x-4,y+hh-1,x+ww+4,y+3]]){const ang=Math.atan2(d2-b,c2-a),L=Math.hypot(c2-a,d2-b);ctx.save();ctx.translate(a,b);ctx.rotate(ang);
    paint(()=>{ctx.beginPath();ctx.rect(0,-2.6,L,5.2)},'#8a6844',[0,-3,L,6],{lw:1.8});ctx.fillStyle='#2a1c12';ell(3,0,.9,.9);ctx.fill();ell(L-3,0,.9,.9);ctx.fill();ctx.restore()}}}
function porta(x,yB,ww,hh,o,ajar){ctx.save();ctx.beginPath();ctx.rect(x,yB-hh,ww,hh);ctx.fillStyle='#0d0a09';ctx.fill();ctx.clip();
  const g=ctx.createLinearGradient(0,yB-hh,0,yB);g.addColorStop(0,'rgba(60,40,24,.0)');g.addColorStop(1,'rgba(60,40,24,.55)');ctx.fillStyle=g;ctx.fillRect(x,yB-hh,ww,hh);ctx.restore();
  ink(2.2);ctx.beginPath();ctx.rect(x,yB-hh,ww,hh);ctx.stroke();
  if(ajar){const lx=x,leaf=[[lx,yB-hh],[lx-ww*.42,yB-hh+5],[lx-ww*.42,yB+3],[lx,yB]];pp(leaf,o.extra==='cappella'?'#5a3a24':'#6e4c30',{lw:2.2});
    ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;for(let k=1;k<3;k++){ctx.beginPath();ctx.moveTo(lx-ww*.14*k,yB-hh+2*k);ctx.lineTo(lx-ww*.14*k,yB+1);ctx.stroke()}
    ctx.fillStyle='#c9a040';ell(lx-ww*.34,yB-hh*.45,1.3,1.3);ctx.fill()}
  // steps
  pp([[x-5,yB],[x+ww+5,yB],[x+ww+3,yB+5],[x-3,yB+5]],'#6f6a60',{lw:1.8})}
function lanternaMuro(x,y,t,rgb){ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-6,y-8);ctx.lineTo(x,y-8);ctx.lineTo(x,y-5);ctx.stroke();
  pp([[x-4,y-5],[x+4,y-5],[x+3,y+5],[x-3,y+5]],'#3a3a40',{lw:1.8,rim:false});const f=.75+.25*Math.sin(t*9)+.1*Math.sin(t*23);
  ctx.save();ctx.globalCompositeOperation='lighter';gl(rgb,x,y,20*f,.55);gl('255,250,220',x,y,3.5,.9);ctx.restore()}
function tetto(x0,y0,o,t){const w=o.w,d=o.d,H=o.H,R=rng(o.seed+5),ov=7,top=y0-H-ov,bot=y0+d-H+5,L=x0-ov,Rr=x0+w+ov,cy=(top+bot)/2,rise=Math.min(26,d*.2),ry=cy-rise,
    rx0=x0+w*(o.extra==='cappella'?.18:.26),rx1=x0+w*(o.extra==='cappella'?.82:.74),base=TETTO[o.tetto]||TETTO.tegole;
  const N=[[L,top],[Rr,top],[rx1,ry],[rx0,ry]],S=[[L,bot],[rx0,ry],[rx1,ry],[Rr,bot]],W=[[L,top],[rx0,ry],[L,bot]],E=[[Rr,top],[Rr,bot],[rx1,ry]];
  const rows=(p,col,step)=>()=>{const[bx,by,bw,bh]=bb(p);
    if(o.tetto==='ardesia'){for(let yy=by;yy<by+bh+6;yy+=6){const off=(Math.round((yy-by)/6)%2)*5;for(let xx=bx-10+off;xx<bx+bw+10;xx+=10){rr(xx+.5,yy+.5,9,5.6,1.2);ctx.fillStyle=mix(col,R()<.5?'#6a7888':'#323c48',R()*.5);ctx.fill();ctx.strokeStyle='rgba(10,10,14,.55)';ctx.lineWidth=.9;ctx.stroke()}}}
    else if(o.tetto==='scandole'){for(let yy=by;yy<by+bh+6;yy+=5.5){const off=(Math.round((yy-by)/5.5)%2)*3.5;for(let xx=bx-8+off;xx<bx+bw+8;xx+=7){ctx.fillStyle=mix(col,R()<.5?'#8a6a48':'#4a3424',R()*.5);ctx.fillRect(xx,yy,6.2,6);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(xx,yy+5,6.2,1)}}}
    else{for(let yy=by;yy<by+bh+6;yy+=step){const off=(Math.round((yy-by)/step)%2)*4;for(let xx=bx-10+off;xx<bx+bw+10;xx+=8){ctx.beginPath();ctx.arc(xx,yy,4.2,0,Math.PI);ctx.fillStyle=mix(col,R()<.5?'#a64e36':'#6a2c20',R()*.45);ctx.fill();
      ctx.strokeStyle='rgba(16,8,6,.6)';ctx.lineWidth=1;ctx.stroke();ctx.strokeStyle='rgba(255,210,170,.18)';ctx.beginPath();ctx.arc(xx,yy,3,Math.PI*.95,Math.PI*.55,true);ctx.stroke()}}}};
  pp(N,dk(base,.35),{inner:rows(N,dk(base,.3),5),lit:.1,dark:.4});
  pp(E,dk(base,.25),{inner:rows(E,dk(base,.2),5),lit:.08,dark:.38});
  pp(W,lt(base,.06),{inner:rows(W,lt(base,.05),5),lit:.3,dark:.2});
  pp(S,base,{inner:()=>{rows(S,base,5.5)();
    // holes where tiles fell, moss where the rain stays
    for(let i=0;i<(o.extra==='casa'?3:1);i++){const hx=x0+w*(.2+R()*.6),hy=ry+(bot-ry)*(.3+R()*.45),hw=7+R()*7;ctx.fillStyle='#120d0a';poly([[hx-hw,hy],[hx-hw*.4,hy-hw*.6],[hx+hw*.5,hy-hw*.4],[hx+hw,hy+hw*.2],[hx+hw*.2,hy+hw*.6],[hx-hw*.6,hy+hw*.4]]);ctx.fill();
      ctx.strokeStyle='#6b4a2a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hx-hw*.8,hy-1);ctx.lineTo(hx+hw*.8,hy+2);ctx.stroke()}
    for(let i=0;i<4;i++)moss(x0+w*(.1+R()*.8),ry+(bot-ry)*(.4+R()*.55),6+R()*5,R)},lit:.26,dark:.3});
  // ridge and hips: a row of cap tiles
  for(const[a,b] of [[[rx0,ry],[rx1,ry]],[[L,top],[rx0,ry]],[[Rr,top],[rx1,ry]],[[L,bot],[rx0,ry]],[[Rr,bot],[rx1,ry]]]){ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=6.5;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.strokeStyle=lt(base,.12);ctx.lineWidth=3.2;ctx.stroke()}
  // eave board along the front
  pp([[L-1,bot-1],[Rr+1,bot-1],[Rr+1,bot+3.5],[L-1,bot+3.5]],dk(base,.45),{lw:2,rim:false});
  return{ry,rx0,rx1,top,bot,L,Rr}}
function esterno(x0,y0,o,t){const w=o.w,d=o.d,H=o.H,R=rng(o.seed+21),fy=y0+d-H;
  facciata(x0,y0,o);
  if(o.extra==='casa'){finestra(x0+w*.12,fy+11,22,17,'assi',R);finestra(x0+w*.8,fy+11,22,17,'rotta',R);porta(x0+w*.5,y0+d,26,36,o,true);lanternaMuro(x0+w*.5+34,fy+16,t,'255,190,90');
    // ivy up the left corner
    ctx.strokeStyle='#2e4a22';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0+3,y0+d);ctx.bezierCurveTo(x0+12,y0+d-14,x0-2,y0+d-26,x0+10,fy+4);ctx.stroke();for(let k=0;k<9;k++){const q=k/8,lx=x0+3+Math.sin(q*6)*6+q*6,ly=y0+d-q*(H-4);ctx.fillStyle=k%2?'#4f8a34':'#3f7a2a';ell(lx+(k%2?3:-3),ly,3.2,2.2,k);ctx.fill();ctx.strokeStyle='rgba(16,12,8,.6)';ctx.lineWidth=.8;ctx.stroke()}}
  else if(o.extra==='cappella'){porta(x0+w*.5-14,y0+d,28,38,o,false);ink(2);ctx.beginPath();ctx.moveTo(x0+w*.5,y0+d-38);ctx.lineTo(x0+w*.5,y0+d);ctx.stroke();
    // round window with coloured glass
    const cx=x0+w*.5,cy=fy+12;ctx.save();ell(cx,cy,9,9);ctx.fillStyle='#1a1422';ctx.fill();ctx.clip();const cols=['#5fd0f0','#c98af7','#ffd86b','#7bd65a','#ff8a6a','#5fd0f0'];
    for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,9,i/6*TAU,(i+1)/6*TAU);ctx.closePath();ctx.fillStyle=cols[i];ctx.globalAlpha=.55;ctx.fill()}ctx.globalAlpha=1;ctx.restore();
    ell(cx,cy,9,9);ink(2.2);ctx.stroke();ink(1.2);for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(i/6*TAU)*9,cy+Math.sin(i/6*TAU)*9);ctx.stroke()}
    ctx.save();ctx.globalCompositeOperation='lighter';gl('190,140,255',cx,cy,18,.25+.08*Math.sin(t*2));ctx.restore();
    finestra(x0+12,fy+16,10,18,'',R);finestra(x0+w-22,fy+16,10,18,'',R)}
  else if(o.extra==='fienile'){const dx=x0+w*.5-22,dy=y0+d;pp([[dx,dy-34],[dx+44,dy-34],[dx+44,dy],[dx,dy]],'#7a3226',{lw:2.4,inner:()=>{ctx.strokeStyle='#e8dcc4';ctx.lineWidth=3;ctx.strokeRect(dx+2,dy-32,19,30);ctx.strokeRect(dx+23,dy-32,19,30);
      ctx.beginPath();ctx.moveTo(dx+2,dy-32);ctx.lineTo(dx+21,dy-2);ctx.moveTo(dx+21,dy-32);ctx.lineTo(dx+2,dy-2);ctx.moveTo(dx+23,dy-32);ctx.lineTo(dx+42,dy-2);ctx.moveTo(dx+42,dy-32);ctx.lineTo(dx+23,dy-2);ctx.stroke()}});
    ink(2);ctx.beginPath();ctx.moveTo(dx+22,dy-34);ctx.lineTo(dx+22,dy);ctx.stroke();
    // hay spilling out of the loft
    for(let i=0;i<14;i++){const a=R()*Math.PI,l=4+R()*7;ctx.strokeStyle=i%2?'#e0c060':'#b89040';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(dx+22+(R()-.5)*30,dy+1);ctx.lineTo(dx+22+(R()-.5)*30+Math.cos(a)*l,dy+2+Math.sin(a)*3);ctx.stroke()}}
  const T=tetto(x0,y0,o,t);
  if(o.extra==='casa'){// chimney with a crow on it
    const cx=x0+w*.7,cyb=T.ry+5;pp([[cx,cyb-24],[cx+14,cyb-24],[cx+14,cyb],[cx,cyb]],'#7a4a3a',{lw:2.2,inner:()=>{ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let k=1;k<5;k++){ctx.beginPath();ctx.moveTo(cx,cyb-24+k*5);ctx.lineTo(cx+14,cyb-24+k*5);ctx.stroke()}}});
    pp([[cx-2,cyb-28],[cx+16,cyb-28],[cx+16,cyb-24],[cx-2,cyb-24]],'#5a3a2e',{lw:2});ctx.fillStyle='#120d0a';ctx.fillRect(cx+1,cyb-28,12,2.5);
    corvo(cx+9,cyb-28,t)}
  else if(o.extra==='cappella'){// bell tower on the ridge
    const bx=(T.rx0+T.rx1)/2-10,by=T.ry+4;pp([[bx,by-30],[bx+20,by-30],[bx+20,by],[bx,by]],'#8a8274',{lw:2.2});
    ctx.fillStyle='#120d0a';ctx.beginPath();ctx.moveTo(bx+5,by-6);ctx.lineTo(bx+5,by-20);ctx.arc(bx+10,by-20,5,Math.PI,0);ctx.lineTo(bx+15,by-6);ctx.closePath();ctx.fill();
    pp([[bx+7.5,by-12],[bx+12.5,by-12],[bx+13,by-8],[bx+7,by-8]],'#c9a040',{lw:1.4,rim:false});
    pp([[bx-3,by-30],[bx+23,by-30],[bx+10,by-48]],'#4c5866',{lw:2.2});
    ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(bx+10,by-48);ctx.lineTo(bx+10,by-60);ctx.moveTo(bx+5.5,by-55);ctx.lineTo(bx+14.5,by-55);ctx.stroke();ctx.strokeStyle='#c9a040';ctx.lineWidth=1.6;ctx.stroke()}
  else if(o.extra==='fienile'){const lx=x0+w*.5-10,ly=T.ry+(T.bot-T.ry)*.35;pp([[lx,ly],[lx+20,ly],[lx+20,ly+16],[lx,ly+16]],'#7a3226',{lw:2.2,inner:()=>{ctx.strokeStyle='#e8dcc4';ctx.lineWidth=2;ctx.strokeRect(lx+2,ly+2,16,12)}});
    ctx.fillStyle='#120d0a';ctx.fillRect(lx+4,ly+4,12,8);for(let i=0;i<8;i++){ctx.strokeStyle='#e0c060';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(lx+5+i*1.4,ly+12);ctx.lineTo(lx+3+i*2,ly+18+(i%3));ctx.stroke()}}}
function corvo(x,y,t){ctx.save();ctx.translate(x,y);const b=Math.sin(t*1.7)*.6;ink(1.6);ell(0,-5+b*.2,5.5,4);ctx.fillStyle='#1c1a22';ctx.fill();ctx.stroke();
  ell(4,-9+b,3.2,3);ctx.fill();ctx.stroke();ctx.fillStyle='#e8a41c';poly([[6.6,-9.6+b],[10,-8.8+b],[6.6,-8+b]]);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ell(4.6,-10+b,.9,.9);ctx.fill();
  ctx.strokeStyle='#1c1a22';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-5,-4);ctx.lineTo(-9,-2);ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-1,-1);ctx.lineTo(-1,1);ctx.moveTo(1.5,-1);ctx.lineTo(1.5,1);ctx.stroke();ctx.restore()}
// inside: floor, the back wall seen from the front, the side walls as thick tops, the furniture
function interno(x0,y0,o,t){const w=o.w,d=o.d,H=o.H,R=rng(o.seed+31);
  // floor planks running away from you
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,d);ctx.clip();ctx.fillStyle='#6a4a30';ctx.fillRect(x0,y0,w,d);
  for(let k=0;k*10<w;k++){ctx.fillStyle=mix('#7a5638','#5a3c26',R());ctx.fillRect(x0+k*10,y0,10,d);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x0+k*10+9,y0,1.2,d);
    for(let yy=y0+R()*30;yy<y0+d;yy+=26+R()*30){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x0+k*10,yy,9,1);ctx.fillStyle='rgba(30,20,12,.7)';ell(x0+k*10+2,yy+3,.7,.7);ctx.fill();ell(x0+k*10+7,yy+3,.7,.7);ctx.fill()}
    ctx.fillStyle='rgba(255,230,190,.06)';ctx.fillRect(x0+k*10,y0,2,d)}
  // a hole in the floor, the earth under it
  const hx=x0+w*.64,hy=y0+d*.42;ctx.fillStyle='#1a120c';poly([[hx-10,hy-6],[hx+6,hy-9],[hx+14,hy-2],[hx+8,hy+7],[hx-8,hy+6]]);ctx.fill();ctx.strokeStyle='#8a6440';ctx.lineWidth=1.4;ctx.stroke();
  // the faded rug
  const ux=x0+w*.2,uy=y0+d*.4,uw=w*.34,uh=d*.38;rr(ux,uy,uw,uh,3);ctx.fillStyle='#7a2e2a';ctx.fill();ctx.strokeStyle='#c9a040';ctx.lineWidth=1.6;rr(ux+4,uy+4,uw-8,uh-8,2);ctx.stroke();ctx.fillStyle='rgba(255,220,160,.12)';ctx.fillRect(ux+8,uy+8,uw*.4,uh-16);
  ctx.strokeStyle='#d8c9a0';ctx.lineWidth=.9;for(let xx=ux+2;xx<ux+uw;xx+=3){ctx.beginPath();ctx.moveTo(xx,uy+uh);ctx.lineTo(xx,uy+uh+3);ctx.stroke()}
  // moonlight from the back window
  ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(150,190,230,.13)';poly([[x0+w*.62,y0],[x0+w*.62+20,y0],[x0+w*.62+44,y0+d*.6],[x0+w*.62+16,y0+d*.6]]);ctx.fill();ctx.globalCompositeOperation='source-over';
  // dust, splinters and a cobweb in the corner
  for(let i=0;i<30;i++){ctx.fillStyle='rgba(210,190,150,.18)';ell(x0+R()*w,y0+R()*d,1+R()*2,.6+R());ctx.fill()}
  ctx.restore();
  // back wall from the front: old wallpaper, a wooden skirting, a window with the moon
  const by=y0-H;paint(()=>{ctx.beginPath();ctx.rect(x0,by,w,H)},'#55654a',[x0,by,w,H],{inner:()=>{
    for(let xx=x0+4;xx<x0+w;xx+=8){ctx.fillStyle='rgba(255,240,200,.08)';ctx.fillRect(xx,by,2,H-12);ctx.fillStyle='rgba(255,230,160,.18)';ell(xx+5,by+8+((xx/8)%2)*10,1.2,1.2);ctx.fill()}
    // torn wallpaper showing the planks
    ctx.fillStyle='#5e432c';poly([[x0+w*.32,by+6],[x0+w*.42,by+4],[x0+w*.45,by+18],[x0+w*.38,by+26],[x0+w*.3,by+20]]);ctx.fill();ctx.strokeStyle='#d8d0a8';ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle='#5a3e28';ctx.fillRect(x0,by+H-11,w,11);ctx.fillStyle='rgba(255,230,190,.15)';ctx.fillRect(x0,by+H-11,w,2);ctx.fillStyle='rgba(0,0,0,.3)';for(let xx=x0;xx<x0+w;xx+=20)ctx.fillRect(xx,by+H-11,1.2,11);
    // stains
    ctx.fillStyle='rgba(40,50,30,.35)';ell(x0+w*.85,by+10,9,6);ctx.fill();ell(x0+w*.12,by+H*.5,7,10);ctx.fill()}});
  finestra(x0+w*.62,by+9,20,16,'',R);
  // a crooked painting
  ctx.save();ctx.translate(x0+w*.22,by+16);ctx.rotate(-.12);pp([[-9,-8],[9,-8],[9,8],[-9,8]],'#c9a040',{lw:2,inner:()=>{ctx.fillStyle='#2a3a4a';ctx.fillRect(-6,-5,12,10);ctx.fillStyle='#e8dcc4';ell(-1,0,2.5,3);ctx.fill();ctx.fillStyle='#120d0a';ell(-2,-1,.6,.6);ctx.fill();ell(0,-1,.6,.6);ctx.fill()}});ctx.restore();
  // fireplace with green embers
  const fx=x0+w*.42,fyb=y0+2;pp([[fx,fyb-30],[fx+30,fyb-30],[fx+30,fyb],[fx,fyb]],'#7a7468',{lw:2.2,inner:()=>{ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;for(let k=1;k<5;k++){ctx.beginPath();ctx.moveTo(fx,fyb-30+k*6);ctx.lineTo(fx+30,fyb-30+k*6);ctx.stroke()}}});
  ctx.fillStyle='#0c0908';ctx.beginPath();ctx.moveTo(fx+6,fyb);ctx.lineTo(fx+6,fyb-16);ctx.arc(fx+15,fyb-16,9,Math.PI,0);ctx.lineTo(fx+24,fyb);ctx.closePath();ctx.fill();
  pp([[fx-3,fyb-33],[fx+33,fyb-33],[fx+33,fyb-29],[fx-3,fyb-29]],'#5a5650',{lw:2});
  ctx.save();ctx.globalCompositeOperation='lighter';gl('120,255,140',fx+15,fyb-4,16,.4+.12*Math.sin(t*5));for(let i=0;i<4;i++){gl('190,255,160',fx+10+i*3.5,fyb-3,2.2,.8)}ctx.restore();
  // cobwebs in the top corners
  for(const[cx,s] of [[x0,1],[x0+w,-1]]){ctx.strokeStyle='rgba(230,225,215,.55)';ctx.lineWidth=.8;for(let k=1;k<5;k++){ctx.beginPath();ctx.arc(cx,by,k*4.5,s>0?0:Math.PI/2,s>0?Math.PI/2:Math.PI);ctx.stroke()}for(let a=0;a<=4;a++){const an=(s>0?0:Math.PI/2)+a/4*Math.PI/2;ctx.beginPath();ctx.moveTo(cx,by);ctx.lineTo(cx+Math.cos(an)*20,by+Math.sin(an)*20);ctx.stroke()}}
  // side walls seen from above: thick tops running from the back to the front
  for(const sx of [x0-8,x0+w]){pp([[sx,by-5],[sx+8,by-5],[sx+8,y0+d],[sx,y0+d]],dk(MURO[o.muro]||MURO.assi,.1),{lw:2.2,inner:()=>{ctx.fillStyle='rgba(255,230,190,.16)';ctx.fillRect(sx+1,by-5,3,d+H)}})}
  pp([[x0-8,by-7],[x0+w+8,by-7],[x0+w+8,by],[x0-8,by]],lt(MURO[o.muro]||MURO.assi,.05),{lw:2.2});
  // furniture
  armadio(x0+14,y0+4,t,o.armadioAperto);letto(x0+w-40,y0+12);tavolo(ux+uw/2,uy+uh/2+4,t);
  sedia(ux+uw/2-21,uy+uh/2+8,false);sedia(x0+w-46,y0+d*.58,true);baule(x0+22,y0+d-22,t);botte(x0+w-22,y0+d-12,1);cassa(x0+w-44,y0+d-10,1)}
function muroBasso(x0,y0,o){const w=o.w,d=o.d,c=MURO[o.muro]||MURO.assi,h=10,dx=x0+w*.5,dw=26;
  for(const[a,b] of [[x0-8,dx],[dx+dw,x0+w+8]]){pp([[a,y0+d-h],[b,y0+d-h],[b,y0+d],[a,y0+d]],c,{lw:2.2});pp([[a,y0+d-h-5],[b,y0+d-h-5],[b,y0+d-h],[a,y0+d-h]],lt(c,.12),{lw:2})}
  // splinters where the wall was cut
  ctx.strokeStyle=INK;ctx.lineWidth=1.4;for(const sx of [dx,dx+dw]){ctx.beginPath();ctx.moveTo(sx,y0+d-h-5);ctx.lineTo(sx+(sx===dx?-3:3),y0+d-h-9);ctx.lineTo(sx+(sx===dx?-5:5),y0+d-h-5);ctx.stroke()}}
// ---------------------------------------------------------------- furniture
function armadio(x,yB,t,aperto){pp([[x,yB-44],[x+30,yB-44],[x+30,yB],[x,yB]],'#5e3e26',{lw:2.4});
  if(aperto){ctx.fillStyle='#0b0807';ctx.fillRect(x+3,yB-40,24,36);ctx.save();ctx.globalCompositeOperation='lighter';gl('255,230,90',x+11,yB-26,5,.9);gl('255,230,90',x+19,yB-26,5,.9);ctx.restore();ctx.fillStyle='#fff7c0';ell(x+11,yB-26,1.6,1.2);ctx.fill();ell(x+19,yB-26,1.6,1.2);ctx.fill();
    pp([[x+3,yB-40],[x-9,yB-36],[x-9,yB-2],[x+3,yB-4]],'#6e4c30',{lw:2});pp([[x+27,yB-40],[x+38,yB-36],[x+38,yB-2],[x+27,yB-4]],'#6e4c30',{lw:2})}
  else{ink(1.6);ctx.beginPath();ctx.moveTo(x+15,yB-40);ctx.lineTo(x+15,yB-4);ctx.stroke();ctx.fillStyle='#c9a040';ell(x+12,yB-22,1.2,1.2);ctx.fill();ell(x+18,yB-22,1.2,1.2);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.strokeRect(x+4,yB-38,8,14);ctx.strokeRect(x+18,yB-38,8,14)}
  pp([[x-2,yB-48],[x+32,yB-48],[x+32,yB-44],[x-2,yB-44]],'#4e3220',{lw:2})}
function letto(x,y){pp([[x,y],[x+32,y],[x+32,y+48],[x,y+48]],'#5e3e26',{lw:2.2});pp([[x+3,y+3],[x+29,y+3],[x+29,y+44],[x+3,y+44]],'#8a9aa8',{lw:1.8,inner:()=>{ctx.fillStyle='#6a5a8a';ctx.fillRect(x+3,y+17,26,27);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x+3,y+21+k*6);ctx.lineTo(x+29,y+20+k*6);ctx.stroke()}}});
  pp([[x+6,y+5],[x+26,y+5],[x+26,y+14],[x+6,y+14]],'#e8e0d0',{lw:1.6});pp([[x-2,y-8],[x+34,y-8],[x+34,y+1],[x-2,y+1]],'#4e3220',{lw:2})}
function tavolo(x,y,t){oval(x+3,y+12,22,6,.3);for(const lx of [-15,13])pp([[x+lx,y-2],[x+lx+3,y-2],[x+lx+3,y+12],[x+lx,y+12]],'#4e3220',{lw:1.6,rim:false});
  pp([[x-18,y-12],[x+18,y-12],[x+18,y-2],[x-18,y-2]],'#7a5638',{lw:2.2});pp([[x-18,y-2],[x+18,y-2],[x+18,y+2],[x-18,y+2]],'#5a3c26',{lw:2});
  // a candle and a plate
  ell(x+8,y-7,4.5,2);ctx.fillStyle='#d8d0c0';ctx.fill();ink(1.2);ctx.stroke();pp([[x-7,y-15],[x-4,y-15],[x-4,y-7],[x-7,y-7]],'#f0e6cc',{lw:1.2,rim:false});
  const f=1+.15*Math.sin(t*11)+.08*Math.sin(t*27);ctx.save();ctx.globalCompositeOperation='lighter';gl('255,190,90',x-5.5,y-17,26*f,.5);gl('255,240,190',x-5.5,y-17,3.5,1);ctx.restore()}
function sedia(x,y,giu){if(giu){ctx.save();ctx.translate(x,y);ctx.rotate(1.25);pp([[-6,-6],[6,-6],[6,0],[-6,0]],'#6e4a30',{lw:1.8});pp([[-6,-16],[-4,-16],[-4,-6],[-6,-6]],'#5a3c26',{lw:1.6});pp([[4,-16],[6,-16],[6,-6],[4,-6]],'#5a3c26',{lw:1.6});ctx.restore();return}
  pp([[x-6,y-18],[x+6,y-18],[x+6,y-8],[x-6,y-8]],'#5a3c26',{lw:1.8});pp([[x-6,y-8],[x+6,y-8],[x+6,y-4],[x-6,y-4]],'#7a5638',{lw:1.8});for(const lx of [-6,4])pp([[x+lx,y-4],[x+lx+2,y-4],[x+lx+2,y+3],[x+lx,y+3]],'#4e3220',{lw:1.4,rim:false})}
function baule(x,y,t){oval(x+2,y+3,15,4,.3);pp([[x-13,y-12],[x+13,y-12],[x+13,y+1],[x-13,y+1]],'#6e4a2a',{lw:2.2});pp([[x-13,y-18],[x+13,y-18],[x+13,y-12],[x-13,y-12]],'#7e5a34',{lw:2.2});
  for(const bx of [-9,7])pp([[x+bx,y-18],[x+bx+2.6,y-18],[x+bx+2.6,y+1],[x+bx,y+1]],'#c9a040',{lw:1.4,rim:false});pp([[x-2.5,y-14],[x+2.5,y-14],[x+2.5,y-9],[x-2.5,y-9]],'#ffd86b',{lw:1.4,rim:false});
  ctx.save();ctx.globalCompositeOperation='lighter';gl('255,216,107',x,y-10,14,.25+.1*Math.sin(t*3));ctx.restore()}
// ---------------------------------------------------------------- things on the map (feet on the ground at x,y)
function botte(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(2,1,10,3.5,.3);
  paint(()=>{ctx.beginPath();ctx.moveTo(-8,0);ctx.quadraticCurveTo(-11,-10,-8,-20);ctx.lineTo(8,-20);ctx.quadraticCurveTo(11,-10,8,0);ctx.closePath()},'#7a5232',[-11,-20,22,20],{lw:2.2,inner:()=>{ctx.fillStyle='#3a3a40';ctx.fillRect(-11,-17,22,2.4);ctx.fillRect(-11,-5,22,2.4);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-3,-20,1,20);ctx.fillRect(3,-20,1,20)}});
  ell(0,-20,8,2.6);ctx.fillStyle='#8a6440';ctx.fill();ink(2);ctx.stroke();ctx.restore()}
function cassa(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(2,1,11,3.5,.3);pp([[-9,-14],[9,-14],[9,0],[-9,0]],'#8a6a44',{lw:2.2,inner:()=>{ctx.strokeStyle='#5a3e24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-13);ctx.lineTo(8,-1);ctx.moveTo(8,-13);ctx.lineTo(-8,-1);ctx.stroke()}});
  pp([[-9,-14],[9,-14],[12,-18],[-6,-18]],'#a07e52',{lw:2});ctx.restore()}
function lapide(x,y,s,tilt,R){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(3,1,14,4,.32);ctx.save();ctx.rotate(tilt||0);
  const side=()=>{ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(13,-3);ctx.lineTo(13,-21);ctx.arc(2,-21,11,0,-Math.PI*.5,true);ctx.lineTo(0,-32);ctx.arc(0,-21,11,-Math.PI*.5,0);ctx.lineTo(11,0);ctx.closePath()};
  paint(side,'#5a554c',[0,-33,14,33],{lw:2.2,rim:false});
  const face=()=>{ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-11,-21);ctx.arc(0,-21,11,Math.PI,0);ctx.lineTo(11,0);ctx.closePath()};
  paint(face,'#8a8478',[-11,-32,22,32],{lw:2.5,inner:()=>{ctx.strokeStyle='rgba(20,16,12,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(0,-10);ctx.moveTo(-5,-21);ctx.lineTo(5,-21);ctx.stroke();
    ctx.strokeStyle='rgba(255,240,210,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(1,-26);ctx.lineTo(1,-10);ctx.stroke();
    ctx.strokeStyle='rgba(20,16,12,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(6,-31);ctx.lineTo(4,-24);ctx.lineTo(7,-18);ctx.stroke();
    moss(-5,-29,6,R);moss(6,-2,5,R);moss(-8,-2,4,R)}});ctx.restore();piede(1,0,26,R,4);ctx.restore()}
function croce(x,y,s,R){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(2,2,14,4,.3);
  paint(()=>ell(0,0,13,5),'#5a4430',[-13,-5,26,10],{lw:2,rim:false});flower(-7,-1,'#f2e6ff');
  ctx.rotate(.12);pp([[-2.5,-30],[2.5,-30],[2.5,0],[-2.5,0]],'#7a5a3a',{lw:2.2});pp([[-10,-23],[10,-23],[10,-18],[-10,-18]],'#86643f',{lw:2.2});ctx.fillStyle='#2a1c12';ell(0,-20.5,1,1);ctx.fill();ctx.rotate(-.12);piede(0,3,26,R,4);ctx.restore()}
function recinto(x,y,len,R){const posts=Math.max(2,Math.round(len/20));oval(x+len/2,y+2,len/2+6,4,.25);
  const rail=(yy,broken)=>{if(broken){ctx.save();ctx.translate(x+len*.55,y+yy);ctx.rotate(.5);pp([[0,-2.2],[len*.3,-2.2],[len*.3,2.2],[0,2.2]],'#7d6a52',{lw:2});ctx.restore();pp([[x,y+yy-2.2],[x+len*.55,y+yy-2.2],[x+len*.55,y+yy+2.2],[x,y+yy+2.2]],'#7d6a52',{lw:2});return}
    pp([[x,y+yy-2.2],[x+len,y+yy-2.2],[x+len,y+yy+2.2],[x,y+yy+2.2]],'#7d6a52',{lw:2})};
  rail(-16,false);
  for(let i=0;i<posts;i++){const px=x+i*(len/(posts-1))-2.5,h=22+(R()-.5)*4,lean=(R()-.5)*1.5;pp([[px,y],[px+5,y],[px+5+lean,y-h],[px+2.5+lean,y-h-4],[px+lean,y-h]],'#6a5a46',{lw:2})}
  rail(-7,true);for(let i=0;i<posts;i++)if(R()<.7)piede(x+i*(len/(posts-1)),y,8,R,2)}
function cancello(x,y,R){const pw=12,ph=40,gw=44;
  for(const px of [x-gw/2-pw,x+gw/2]){oval(px+pw/2+3,y+2,9,3,.3);pp([[px,y-ph],[px+pw,y-ph],[px+pw,y],[px,y]],'#7a7468',{lw:2.2,inner:()=>{ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;for(let k=1;k<5;k++){ctx.beginPath();ctx.moveTo(px,y-ph+k*8);ctx.lineTo(px+pw,y-ph+k*8);ctx.stroke()}}});
    pp([[px-2,y-ph-5],[px+pw+2,y-ph-5],[px+pw+2,y-ph],[px-2,y-ph]],'#5f5a52',{lw:2});ctx.fillStyle='#e8e0cc';ell(px+pw/2,y-ph-9,4.5,4);ctx.fill();ink(1.6);ctx.stroke();ctx.fillStyle=INK;ell(px+pw/2-1.6,y-ph-9,1.1,1.3);ctx.fill();ell(px+pw/2+1.6,y-ph-9,1.1,1.3);ctx.fill();piede(px+pw/2,y,pw+6,R,3)}
  // iron bars with spear tips, an arch on top
  for(let i=0;i<=6;i++){const bx=x-gw/2+3+i*(gw-6)/6,top=y-ph+4-Math.sin(i/6*Math.PI)*8;ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(bx,y);ctx.lineTo(bx,top);ctx.stroke();ctx.strokeStyle='#4a4a52';ctx.lineWidth=1.6;ctx.stroke();
    pp([[bx,top-5],[bx+2.2,top],[bx-2.2,top]],'#5a5a62',{lw:1.4,rim:false});if(R()<.4){ctx.fillStyle='rgba(150,80,40,.7)';ell(bx,y-10-R()*20,1.2,2.4);ctx.fill()}}
  for(const yy of [y-8,y-24]){ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(x-gw/2,yy);ctx.lineTo(x+gw/2,yy);ctx.stroke();ctx.strokeStyle='#4a4a52';ctx.lineWidth=1.6;ctx.stroke()}
  ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(x,y-24,5,Math.PI,0);ctx.stroke();ctx.strokeStyle='#5a5a62';ctx.lineWidth=1.2;ctx.stroke()}
function albero(x,y,s,R,t){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(12,2,30,8,.3);
  const ramo=(bx,by,a,l,wd,dpt)=>{const ex=bx+Math.cos(a)*l,ey=by+Math.sin(a)*l,mx=bx+Math.cos(a+.3)*l*.5,my=by+Math.sin(a+.3)*l*.5;
    ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=wd+2.6;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();ctx.strokeStyle='#5a4636';ctx.lineWidth=wd;ctx.stroke();
    ctx.strokeStyle='rgba(255,226,170,.22)';ctx.lineWidth=Math.max(.6,wd*.3);ctx.beginPath();ctx.moveTo(bx-wd*.2,by-wd*.2);ctx.quadraticCurveTo(mx-wd*.2,my-wd*.2,ex,ey);ctx.stroke();
    if(dpt>0){ramo(ex,ey,a-.45-R()*.3,l*.68,wd*.62,dpt-1);ramo(ex,ey,a+.4+R()*.3,l*.62,wd*.58,dpt-1)}};
  // roots and trunk
  for(const[a,l] of [[2.8,12],[.3,13],[1.9,8]])ramo(0,-2,a,l,4,0);
  paint(()=>{ctx.beginPath();ctx.moveTo(-7,0);ctx.quadraticCurveTo(-5,-22,-6,-44);ctx.lineTo(5,-46);ctx.quadraticCurveTo(4,-22,8,0);ctx.closePath()},'#5a4636',[-7,-46,15,46],{lw:2.6,inner:()=>{ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-3+k*2.5,-4);ctx.quadraticCurveTo(-4+k*2.5,-24,-2+k*2,-42);ctx.stroke()}}});
  ramo(-4,-42,-2.1,22,5,2);ramo(3,-44,-1.0,24,5,2);ramo(1,-30,-.2,16,3.4,1);
  // a little owl in a hollow
  ctx.fillStyle='#120d0a';ell(-.5,-25,4.5,6);ctx.fill();ink(1.6);ctx.stroke();
  ctx.fillStyle='#8a6a4a';ell(-.5,-24,3.4,4.4);ctx.fill();const bl=Math.sin(t*.8)>.96;
  for(const ex of [-2,1]){ctx.fillStyle='#ffd84a';ell(ex,-25.5,1.4,bl?.2:1.4);ctx.fill();if(!bl){ctx.fillStyle=INK;ell(ex,-25.5,.6,.6);ctx.fill()}}
  ctx.save();ctx.globalCompositeOperation='lighter';gl('255,216,74',-.5,-25.5,6,.35);ctx.restore();piede(1,1,30,R,5);ctx.restore()}
function cespuglio(x,y,s,R,t,fruscia){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(3,1,22,6,.3);const sh=fruscia?Math.sin(t*28)*1.4:Math.sin(t*1.3)*.4;
  const balls=[[-12,-8,9],[12,-8,9],[0,-12,11],[-6,-18,8],[7,-18,8],[0,-4,10]];
  for(const[bx,by,r] of balls){const ox=sh*(by<-10?1:.5);paint(()=>{ctx.beginPath();for(let i=0;i<=14;i++){const a=i/14*TAU,rr2=r+(i%2?1.2:0);ctx.lineTo(bx+ox+Math.cos(a)*rr2,by+Math.sin(a)*rr2*.85)}ctx.closePath()},'#3f6a2e',[bx-r,by-r,r*2,r*2],{lw:2.2,lit:.3})}
  ctx.fillStyle='#c83a4a';for(const[bx,by] of [[-8,-10],[9,-14],[2,-6]]){ell(bx+sh,by,1.8,1.8);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke()}
  if(fruscia)for(let i=0;i<4;i++){ctx.save();ctx.translate((R()-.5)*40,-20-R()*16);ctx.rotate(R()*3);ell(0,0,2.8,1.4);ctx.fillStyle='#5f8f38';ctx.fill();ctx.restore()}
  ctx.restore()}
function lampione(x,y,t,rgb,s){ctx.save();ctx.translate(x,y);ctx.scale(s||1,s||1);oval(4,1,9,3,.35);
  pp([[-5,0],[5,0],[3.5,-4],[-3.5,-4]],'#3a3a42',{lw:2});ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(0,-62);ctx.quadraticCurveTo(0,-68,8,-68);ctx.stroke();ctx.strokeStyle='#4a4a54';ctx.lineWidth=2.4;ctx.stroke();
  ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-4,-40);ctx.quadraticCurveTo(0,-44,4,-40);ctx.stroke();
  const f=1+.08*Math.sin(t*8)+.05*Math.sin(t*19);
  pp([[4,-66],[14,-66],[12,-54],[6,-54]],'#2a2a32',{lw:2,rim:false});
  ctx.save();ctx.globalCompositeOperation='lighter';gl(rgb,9,-60,34*f,.6);gl('255,250,225',9,-60,4,1);ctx.restore();
  pp([[3,-68],[15,-68],[9,-73]],'#3a3a42',{lw:1.8,rim:false});ctx.restore()}
function carretto(x,y,R){oval(x+6,y+2,32,8,.32);
  // tipped box
  ctx.save();ctx.translate(x,y-8);ctx.rotate(-.18);pp([[-24,-16],[22,-16],[22,4],[-24,4]],'#7a5a3a',{lw:2.4,inner:()=>{ctx.fillStyle='rgba(0,0,0,.3)';for(let k=1;k<4;k++)ctx.fillRect(-24,-16+k*5,46,1)}});
  pp([[22,-16],[30,-20],[30,0],[22,4]],'#5e4228',{lw:2.2});ctx.restore();
  // hay spilled, one wheel fallen, one broken
  for(let i=0;i<16;i++){const a=R()*Math.PI,l=4+R()*6;ctx.strokeStyle=i%2?'#e0c060':'#b89040';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-22+R()*14,y+1);ctx.lineTo(x-22+R()*14+Math.cos(a)*l,y+Math.sin(a)*2);ctx.stroke()}
  const ruota=(wx,wy,r,rot,rotta)=>{ctx.save();ctx.translate(wx,wy);ctx.scale(1,.5);ctx.rotate(rot);ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,r,0,rotta?TAU*.7:TAU);ctx.stroke();ctx.strokeStyle='#6e4c30';ctx.lineWidth=3;ctx.stroke();
    for(let i=0;i<6;i++){if(rotta&&i===5)continue;const a=i/6*TAU;ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();ctx.strokeStyle='#6e4c30';ctx.lineWidth=1.6;ctx.stroke()}
    ell(0,0,3,3);ctx.fillStyle='#3a3a40';ctx.fill();ink(1.4);ctx.stroke();ctx.restore()};
  ruota(x+30,y+2,11,.3,false);ruota(x-8,y-2,10,1.2,true)}
function pozzo(x,y,R,t){oval(x+4,y+2,22,7,.32);
  // stone ring, dark water
  paint(()=>ell(x,y-6,19,8),'#7a7468',[x-19,y-14,38,16],{lw:2.4,inner:()=>{for(let i=0;i<10;i++){const a=i/10*TAU;ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*13,y-6+Math.sin(a)*5);ctx.lineTo(x+Math.cos(a)*19,y-6+Math.sin(a)*8);ctx.stroke()}}});
  ell(x,y-7,12,4.6);ctx.fillStyle='#0e1418';ctx.fill();ink(1.6);ctx.stroke();ctx.fillStyle='rgba(150,200,220,.35)';ell(x-3,y-8,4,1.2);ctx.fill();
  pp([[x-19,y-6],[x+19,y-6],[x+19,y+2],[x-19,y+2]],'#6a645a',{lw:2.4,inner:()=>{ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let k=-15;k<19;k+=8){ctx.beginPath();ctx.moveTo(x+k,y-6);ctx.lineTo(x+k,y+2);ctx.stroke()}}});
  for(const px of [x-16,x+13])pp([[px,y-38],[px+3.5,y-38],[px+3.5,y-4],[px,y-4]],'#6e4c30',{lw:2});
  pp([[x-22,y-38],[x+22,y-38],[x+16,y-48],[x-16,y-48]],'#6e5034',{lw:2.2});
  ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-13,y-33);ctx.lineTo(x+13,y-33);ctx.stroke();ctx.strokeStyle='#8a6a44';ctx.lineWidth=1.2;ctx.stroke();
  ctx.strokeStyle='#c9b48a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+3,y-33);ctx.lineTo(x+3,y-20);ctx.stroke();pp([[x,y-20],[x+6,y-20],[x+5,y-14],[x+1,y-14]],'#7a5232',{lw:1.6});piede(x,y+2,40,R,5)}
function spaventapasseri(x,y,R,t){oval(x+3,y+2,12,4,.32);const sw=Math.sin(t*1.2)*.04;ctx.save();ctx.translate(x,y);ctx.rotate(sw);
  pp([[-2,0],[2,0],[2,-44],[-2,-44]],'#6e4c30',{lw:2});pp([[-22,-34],[22,-34],[22,-30],[-22,-30]],'#6e4c30',{lw:2});
  pp([[-12,-36],[12,-36],[14,-16],[-14,-16]],'#4a6a8a',{lw:2.4,inner:()=>{ctx.fillStyle='#8a4a3a';ctx.fillRect(-9,-30,6,6);ctx.strokeStyle='#e8dcc4';ctx.lineWidth=.8;ctx.strokeRect(-9,-30,6,6);ctx.fillStyle='#c9a040';ctx.fillRect(2,-24,5,5)}});
  for(const sx of [-1,1]){pp([[sx*12,-36],[sx*22,-34],[sx*22,-29],[sx*12,-30]],'#4a6a8a',{lw:2});for(let i=0;i<4;i++){ctx.strokeStyle='#e0c060';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(sx*22,-31);ctx.lineTo(sx*(25+i),-33+i*2);ctx.stroke()}}
  paint(()=>ell(0,-43,8,8),'#c9b48a',[-8,-51,16,16],{lw:2.4,inner:()=>{ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-4,-40);ctx.lineTo(4,-40);ctx.stroke();for(let i=-3;i<=3;i+=1.5){ctx.beginPath();ctx.moveTo(i,-41.5);ctx.lineTo(i,-38.5);ctx.stroke()}ctx.fillStyle=INK;ell(-3,-45,1.4,1.4);ctx.fill();ell(3,-45,1.4,1.4);ctx.fill()}});
  pp([[-12,-48],[12,-48],[8,-51],[-8,-51]],'#b8903a',{lw:2});pp([[-6,-51],[6,-51],[4,-58],[-4,-58]],'#a8802e',{lw:2});ctx.restore();piede(x,y,14,R,3);corvo(x+18,y-35,t+1)}
function fieno(x,y,R){oval(x+3,y+2,18,5,.3);pp([[-15+x,y-14],[15+x,y-14],[15+x,y],[-15+x,y]],'#c9a24a',{lw:2.4,inner:()=>{for(let i=0;i<22;i++){ctx.strokeStyle=i%2?'rgba(120,90,30,.6)':'rgba(255,240,170,.45)';ctx.lineWidth=1;const sx=x-14+R()*28,sy=y-13+R()*12;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+4+R()*4,sy+(R()-.5)*2);ctx.stroke()}
    ctx.fillStyle='#7a3226';ctx.fillRect(x-7,y-14,2,14);ctx.fillRect(x+5,y-14,2,14)}});
  pp([[-15+x,y-14],[15+x,y-14],[19+x,y-19],[-11+x,y-19]],'#d8b45a',{lw:2.2});piede(x,y,32,R,4)}
function zucca(x,y,t){oval(x+2,y+1,12,4,.3);paint(()=>{ctx.beginPath();ctx.ellipse(x,y-8,11,8.5,0,0,TAU)},'#e07a1c',[x-11,y-17,22,17],{lw:2.4,inner:()=>{ctx.strokeStyle='rgba(120,40,0,.5)';ctx.lineWidth=1.2;for(const k of [-5,0,5]){ctx.beginPath();ctx.ellipse(x+k*.6,y-8,Math.abs(k)+2,8.5,0,-Math.PI/2,Math.PI/2,k<0);ctx.stroke()}
    const f=.8+.2*Math.sin(t*7);ctx.fillStyle=`rgb(255,${190+40*f|0},80)`;poly([[x-6,y-11],[x-3,y-11],[x-4.5,y-8]]);ctx.fill();poly([[x+3,y-11],[x+6,y-11],[x+4.5,y-8]]);ctx.fill();poly([[x-6,y-5],[x+6,y-5],[x+4,y-2],[x+1.5,y-4],[x-1,y-2],[x-4,y-4]]);ctx.fill()}});
  pp([[x-1.5,y-16],[x+1.5,y-16],[x+3,y-20],[x,y-20]],'#4f6a2a',{lw:1.6,rim:false});piede(x,y+1,24,rng(x*7|0),3);ctx.save();ctx.globalCompositeOperation='lighter';gl('255,160,60',x,y-8,16,.35+.1*Math.sin(t*7));ctx.restore()}
// ---------------------------------------------------------------- a zombie coming out of the ground: k 0..1 (0.25 the ground swells, 0.45 it opens, then he climbs out)
// the swelling is the warning: the mound trembles, puffs dust and a sick green light comes out of its cracks
function buca(x,y,k,t,zombieFn){const R=rng(77),q0=cl(k/.25,0,1),q1=cl((k-.25)/.2,0,1),q2=cl((k-.45)/.55,0,1),rx=17,ry=6,mh=k<.25?q0*5:5*(1-q1*.7);
  oval(x+2,y+2,24,7,.25);
  const sh=k<.45?Math.sin(t*55+k*40)*1.1:0,top=y-2-mh*.5;
  ctx.save();ctx.translate(sh,0);
  paint(()=>ell(x,y-1-mh*.4,rx+5+q0*3,ry+2+q0*2+mh*.3),'#5a4430',[x-rx-8,y-12-mh,2*rx+16,20+mh],{lw:2.2,rim:false,lit:.15});
  if(k<.45){ctx.fillStyle=`rgba(150,122,84,${.4*q0})`;ell(x-4,y-3-mh*.8,rx*.55,ry*.45);ctx.fill();
    const cr=[];for(let i=0;i<7;i++){const a=i/7*TAU+.3,l=(5+R()*8)*q0;cr.push([[x,top],[x+Math.cos(a)*l*.6,top+Math.sin(a)*l*.25],[x+Math.cos(a+.2)*l,top+Math.sin(a+.2)*l*.38]])}
    const line=c=>{ctx.beginPath();ctx.moveTo(c[0][0],c[0][1]);ctx.lineTo(c[1][0],c[1][1]);ctx.lineTo(c[2][0],c[2][1]);ctx.stroke()};
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle=`rgba(140,255,110,${.5*q0})`;ctx.lineWidth=3.4;cr.forEach(line);gl('140,255,110',x,top,22,.3*q0);ctx.restore();
    ctx.strokeStyle='rgba(16,10,6,.85)';ctx.lineWidth=1.4;cr.forEach(line);
    for(let i=0;i<5;i++){const a=R()*TAU,hop=Math.abs(Math.sin(t*20+i*2))*4*q0;pebble(x+Math.cos(a)*(rx+2),y-1+Math.sin(a)*ry-hop,1,R,'#6a5440')}
    for(let i=0;i<4;i++){const a=i/4*TAU+.6,ph=(t*1.3+i*.25)%1;ctx.fillStyle=`rgba(170,150,118,${.3*q0*(1-ph)})`;ell(x+Math.cos(a)*(rx+6+ph*6),y-4+Math.sin(a)*ry-ph*8,4+ph*4,3+ph*3);ctx.fill()}}
  ctx.restore();
  if(k>=.25){// the hole, with the same green light coming up from inside
    ell(x,y-1,rx*q1+2,ry*q1+.5);ctx.fillStyle='#0d0907';ctx.fill();
    ctx.save();ctx.globalCompositeOperation='lighter';gl('120,255,100',x,y-2,(rx+4)*q1+4,.3*(1-q2*.7),((ry+3)*q1+3));ctx.restore();
    if(q1<1&&k<.5)for(let i=0;i<8;i++){const a=-Math.PI*(.15+R()*.7),d=(10+R()*26)*q1;ctx.fillStyle=i%2?'#6a5038':'#4a3626';ell(x+Math.cos(a)*d,y-6+Math.sin(a)*d*1.2,2.4,1.8);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke()}
    if(q2>0&&zombieFn){// he climbs out: drawn only above the front lip of the hole
      const sink=(1-Math.min(1,q2*1.15))*46;ctx.save();ctx.beginPath();ctx.rect(x-80,y-200,160,200-1+ry*.2);ctx.clip();zombieFn(x,y+sink,q2);ctx.restore()}
    // clods on the front lip, over his legs
    for(let i=0;i<9;i++){const a=Math.PI*(.05+i/8*.9),lx=x+Math.cos(a)*(rx*q1+3),ly=y-1+Math.sin(a)*(ry*q1+2);ctx.fillStyle=i%2?'#6a5038':'#56402c';ell(lx,ly,4.2,2.8);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke()}}}
return{terreno,edificio,tetto,interno,esterno,lapide,croce,recinto,cancello,albero,cespuglio,lampione,carretto,pozzo,spaventapasseri,fieno,zucca,botte,cassa,baule,buca,rng,paint,pp,oval,moss,tuft,pebble,mix}})();
