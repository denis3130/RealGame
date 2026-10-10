// Armi della modalità zombie di Mossbound: Pistola, Revolver, Mitraglietta, Mitra, Mitragliatrice, Pompa da caccia, Pompa tattica,
// Lanciarazzi, le loro munizioni (proiettili in volo, vampe, bossoli, caricatori, razzi, esplosioni, casse di munizioni), i loro suoni
// e la Bara delle Sorprese.
// Every gun is a side profile pointing +x with the shooting hand on the grip at (0,0), like the crossbow in the hero's hand: the hero
// turns it to its aim direction and mirrors it when aiming left, so the top of the gun always stays up and every piece stays where it is.
// Painted like the Zombie della lanterna: every piece has its colour, a darker lower part away from the light, a warm light along the
// top, the thick dark outline; small marks (grooves, screws, wood grain, checkering) and soft glows only where there is a light.
// Units are game pixels at scale 1 (the hero is about 30 tall, a zombie about 46).
// Drawn with the game's own primitives (ctx, ink, glow, INK, LOWFX); sounds with the game's foley (fNoise, fThump, fModal, M, ...), so it
// runs inside index.html's main function (like disegno_mostri.js) or after poligono/shim.js. Use: g=ARMI.nuova(id) for each gun in hand
// (g.update(dt,trigger) every frame, g.ricarica(), g.pose()), ARMI.inMano(id,B,g.pose()) in the hero's held(), ARMI.suono / motore for
// the sounds, ARMI.FX with fxUpdate / fxDraw for cases, magazines, smoke and blasts, ARMI.nuovaBara(x,y) for the coffin.
// Everything it gives is listed in sprite/armi/LEGGIMI.md.
window.ARMI=(()=>{
const TAU=Math.PI*2,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,ez=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,
  eo=k=>1-Math.pow(1-cl(k,0,1),3),bump=k=>Math.sin(cl(k,0,1)*Math.PI);
const WARM='255,238,205',LITK=.55,wa=a=>'rgba('+WARM+','+(a*LITK).toFixed(3)+')';
const MX={},rgbOf=h=>{if(h[0]==='#'){const n=parseInt(h.slice(1,7),16);return[n>>16,(n>>8)&255,n&255]}const m=h.match(/\d+/g);return[+m[0],+m[1],+m[2]]};
function mix(a,b,k){k=Math.round(cl(k,0,1)*16)/16;if(k<=0)return a;if(k>=1)return b;const id=a+b+k;if(MX[id])return MX[id];
  const A=rgbOf(a),B=rgbOf(b);return MX[id]=`rgb(${Math.round(A[0]+(B[0]-A[0])*k)},${Math.round(A[1]+(B[1]-A[1])*k)},${Math.round(A[2]+(B[2]-A[2])*k)})`}
function poly(q){ctx.beginPath();for(const p of q)ctx.lineTo(p[0],p[1]);ctx.closePath()}
function ball(p,r){ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.05,r),0,TAU)}
function seg(a,b){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}
function shine(rgb,x,y,r,a,ry){if(OUT||LOWFX||a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,r,a,ry);ctx.restore()}
// a closed outline with rounded corners (r: one radius, or one per corner)
function rp(pts,r){const n=pts.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],s=m(pts[n-1],pts[0]);ctx.beginPath();ctx.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n],mm=m(p,q);ctx.arcTo(p[0],p[1],mm[0],mm[1],Array.isArray(r)?r[i]:r)}ctx.closePath()}
function rb(x0,y0,x1,y1,r){rp([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],Math.min(r,(x1-x0)/2,(y1-y0)/2))}

// ------------------------------------------------------------------ painting
// colours of the materials: [dark side, colour, light]
const C={
  acciaio:['#3c4550','#66727f','#a3b0bd'],brunito:['#222c39','#3e4f64','#6d84a0'],lucido:['#6f7a86','#a9b4bf','#e4ebf1'],
  nero:['#1f2226','#3b4047','#5f6670'],gomma:['#1d1a17','#36312b','#56504a'],
  legno:['#71401f','#a86833','#d99a58'],legnoR:['#6a2817','#a5482b','#d77a55'],
  oliva:['#46532a','#6c7f3c','#9db261'],ottone:['#9a6b1e','#d39a33','#f6cf6c'],rame:['#7d3a1c','#b8612f','#e48d58'],
  rosso:['#8a221b','#cf3b30','#f27566'],verde:['#1f5a2c','#33904a','#62c574'],giallo:['#a87d16','#e8b52a','#ffe07a'],
  teal:['#1a5a66','#2a8c9c','#5cc6d4'],arancio:['#9c4416','#e26a24','#ff9d55'],cera:['#b7a888','#e8dcbe','#fff6e2'],osso:['#a8986f','#dccda4','#f6edd2']};
// Every gun is drawn twice: first all its pieces as one dark silhouette with the thick outline (OUT), then every piece painted, with
// thin lines where it meets the others: a crisp toy outline round the whole gun and no heavy black where pieces overlap.
// GS: the guns are drawn at this size (units below are a little smaller than game pixels); LO/LI: outer and inner line widths
let OUT=false;const GS=1.35,LO=.95,LI=.5;
// a piece: its colour, the darker lower part, the warm light along the top, then the outline over it.
// path() makes the outline, box = [x0,y0,x1,y1]; o: {dk where the dark part starts (0..1 of the height), hi strength of the light,
// lw outline width, gl a bright glint along the top (metal)}
function paint(path,box,m,o){o=o||{};if(OUT){path();ctx.fillStyle=INK;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=LO*2;ctx.lineJoin='round';ctx.stroke();return}
  const T=C[m]||C.acciaio,[x0,y0,x1,y1]=box,h=y1-y0,w=x1-x0;path();ctx.fillStyle=o.col||T[1];ctx.fill();
  ctx.save();path();ctx.clip();ctx.fillStyle=o.colD||T[0];ctx.fillRect(x0-3,y0+h*(o.dk==null?.6:o.dk),w+6,h+3);
  ctx.fillStyle=o.colL||T[2];ctx.fillRect(x0-3,y0-1,w+6,1+h*(o.lt==null?.24:o.lt));
  const hi=o.hi==null?.6:o.hi;if(hi>0){ctx.fillStyle=wa(hi);ctx.fillRect(x0-3,y0+.25,w+6,Math.max(.45,h*.1))}
  if(o.gl){ctx.strokeStyle=wa(1.6);ctx.lineWidth=Math.max(.35,h*.09);ctx.lineCap='round';seg([x0+w*.12,y0+h*.2],[x0+w*(o.gl===2?.9:.55),y0+h*.2]);ctx.stroke()}
  ctx.restore();path();ctx.strokeStyle='rgba(27,22,18,.85)';ctx.lineWidth=(o.lw||1)*LI;ctx.lineJoin='round';ctx.stroke()}
const PB=(x0,y0,x1,y1,r,m,o)=>paint(()=>rb(x0,y0,x1,y1,r),[x0,y0,x1,y1],m,o);
function PP(pts,r,m,o){let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const p of pts){a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])}paint(()=>rp(pts,r),[a,b,c,d],m,o)}
// thin dark lines (grooves, slots, wood grain) and screws
function lines(L,col,w){if(OUT)return;ctx.strokeStyle=col||'rgba(20,14,10,.55)';ctx.lineWidth=w||.4;ctx.lineCap='round';for(const[a,b,c,d] of L){seg([a,b],[c,d]);ctx.stroke()}}
function screw(x,y,r,col){if(OUT)return;ctx.fillStyle=INK;ball([x,y],r+.28);ctx.fill();ctx.fillStyle=col||'#9aa6b2';ball([x,y],r);ctx.fill();ctx.fillStyle=wa(1.4);ball([x-r*.35,y-r*.35],r*.4);ctx.fill()}
// wood grain inside a box
function grain(x0,y0,x1,y1,n){if(OUT)return;ctx.strokeStyle='rgba(60,28,10,.38)';ctx.lineWidth=.32;for(let i=1;i<=n;i++){const y=lerp(y0,y1,i/(n+1));ctx.beginPath();
  for(let k=0;k<=6;k++){const x=lerp(x0,x1,k/6);ctx.lineTo(x,y+Math.sin(k*1.9+i*2.3)*.22)}ctx.stroke()}}
// checkering on a grip, inside the current clip
function checker(x0,y0,x1,y1,col){if(OUT)return;ctx.strokeStyle=col||'rgba(25,12,4,.45)';ctx.lineWidth=.3;for(let i=-4;i<=8;i++){const s=x0+i*.9;seg([s,y0],[s+(y1-y0)*.5,y1]);ctx.stroke();seg([s+(y1-y0)*.5,y0],[s,y1]);ctx.stroke()}}
// the trigger guard (a loop under the frame) and the trigger
function guard(x0,x1,y,dip,m){const p=()=>{ctx.beginPath();ctx.moveTo(x0,y);ctx.quadraticCurveTo(x0,y+dip,x0+(x1-x0)*.5,y+dip);ctx.quadraticCurveTo(x1+.2,y+dip,x1+.3,y)};
  ctx.lineCap='round';const tx=x0+(x1-x0)*.4,tr=()=>{ctx.beginPath();ctx.moveTo(tx,y-.2);ctx.quadraticCurveTo(tx+.7,y+dip*.4,tx+.2,y+dip*.72)};
  if(OUT){p();ctx.strokeStyle=INK;ctx.lineWidth=.75+LO*2;ctx.stroke();tr();ctx.lineWidth=.45+LO*2;ctx.stroke();return}
  p();ctx.strokeStyle=INK;ctx.lineWidth=.75+LI*1.6;ctx.stroke();p();ctx.strokeStyle=(C[m]||C.nero)[1];ctx.lineWidth=.75;ctx.stroke();tr();ctx.strokeStyle=(C[m]||C.nero)[2];ctx.lineWidth=.45;ctx.stroke()}
// the hand of whoever holds it: the hero's (a round fist like the bow's) or a bony one
function hand(x,y,o){if(!o||o.hands===false)return;if(o.hands==='ossa')return handBone(x,y);ink(1.6);ball([x,y],2.4);ctx.fillStyle=o.skin||'#f2c9a0';ctx.fill();ctx.stroke();
  ctx.save();ball([x,y],2.4);ctx.clip();ctx.fillStyle='rgba(120,60,30,.22)';ball([x+.9,y+1.1],2.1);ctx.fill();ctx.fillStyle=wa(.9);ball([x-.8,y-.9],.9);ctx.fill();ctx.restore()}
function handBone(x,y){ctx.lineCap='round';for(const[w,c] of[[2.6,INK],[1.15,C.osso[1]]])for(let i=0;i<3;i++){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x-1.4,y-1.6+i*1.4);ctx.quadraticCurveTo(x+1.6,y-2.2+i*1.4,x+1.5,y-.2+i*1.4);ctx.stroke()}
  ink(1.1);ctx.fillStyle=C.osso[1];ball([x-1.6,y-.2],1.5);ctx.fill();ctx.stroke();ctx.fillStyle=wa(1);ball([x-2,y-.7],.5);ctx.fill()}
// 0 -> 1 between a and b, stays 1 until c, back to 0 at d (smooth)
const tz=(k,a,b,c,d)=>k<a||k>d?0:k<b?ez((k-a)/(b-a)):k<c?1:1-ez((k-c)/(d-c));
const LP=(p,q,t)=>{t=ez(cl(t,0,1));return[lerp(p[0],q[0],t),lerp(p[1],q[1],t)]};
// the other hand during a magazine change (k 0..1 along the reload, the same timeline as nuova()): it goes to the magazine, takes the old
// one down, fetches a new one, pushes it in, then pulls the bolt or the slide and lets it go. s: where it rests (null: it is only seen
// during the reload), m: the bottom of the seated magazine, d: how far the magazine slides out, b: the bolt or slide handle
function magHand(k,s,m,d,b){const md=f=>[m[0]+d[0]*f,m[1]+d[1]*f+1.6],rest=s||[m[0]-1.5,m[1]+9],away=[m[0]-3.5,m[1]+d[1]*1.6+5];
  if(k<.1)return LP(rest,md(0),k/.1);if(k<.2)return md(ez((k-.1)/.1)*.6);if(k<.32)return LP(md(.6),away,(k-.2)/.12);if(k<.45)return LP(away,md(1),(k-.32)/.13);
  if(k<.55)return md(1);if(k<.75)return md(1-ez((k-.55)/.2));if(k<.8)return LP(md(0),b,(k-.75)/.05);if(k<.97)return b;return s?LP(b,s,(k-.97)/.03):null}

// ------------------------------------------------------------------ the guns
// draw(o): the profile for a state o {slide 0..1 (slide or bolt back), pump 0..1 (forend back), mag 0..1 (magazine out), cyl (cylinder
// turn), hammer 0..1 (cocked), swing 0..1 (cylinder swung out), rounds (rounds in the open cylinder), spin (barrels' turn), feed (belt
// step), loaded 0..1 (the rocket in the tube: 1 seated, less = still sliding in, 0 = empty), saddle (shells on the side), glow}.
// muzzle: where the shots leave; eject: where the cases fly out; sup: where the other hand holds it; len: front and back ends
const G={
  pistola:{muzzle:[9.7,-3.75],eject:[3.8,-5.3],sup:null,len:[-3.9,9.6],magP:[-.9,1.9],magD:[.6,6],
    supR:(o,k,s)=>magHand(k,s,[-.9,5.4],[.6,6],[-3.4-(o.slide||0)*2.6,-4.4]),
    draw(o){const sl=-(o.slide||0)*2.6,md=o.mag||0,ma=o.magA==null?1:o.magA;
    if(md>0&&ma>0){ctx.save();ctx.globalAlpha*=ma;PB(-2.3+md*.6,-.8+md*6,.5+md*.6,4.6+md*6,.3,'nero',{hi:.25});PB(-2.6+md*.6,4.1+md*6,.8+md*.6,5.4+md*6,.4,'nero',{col:'#4a5058'});ctx.restore()}
    PP([[-3.3,-1.6],[.9,-1.6],[1.8,4.2],[1.5,4.9],[-2.3,5.2],[-2.8,4.6]],.6,'legno',{dk:.66});
    ctx.save();rp([[-3.3,-1.6],[.9,-1.6],[1.8,4.2],[1.5,4.9],[-2.3,5.2],[-2.8,4.6]],.6);ctx.clip();checker(-3,-.6,1.6,3.8);ctx.restore();screw(-.7,1.7,.5,'#e8b52a');
    guard(1.1,4.6,-1.2,2.6,'nero');
    PB(-3.1,-2.7,8.6,-1.1,.5,'nero',{hi:.3});
    PB(8.2,-4.5,9.6,-3,.3,'brunito',{hi:.2});
    PB(-3.9+sl,-5.3,9.4+sl,-2.5,.9,'acciaio',{gl:1});
    lines([[-3.1+sl,-4.9,-3.1+sl,-3],[-2.4+sl,-4.9,-2.4+sl,-3],[-1.7+sl,-4.9,-1.7+sl,-3]],'rgba(20,24,30,.6)',.35);
    if(!OUT){ctx.fillStyle='#14171b';rb(2.6+sl,-5.15,5+sl,-4.25,.25);ctx.fill()}
    PB(8.2+sl,-5.85,9+sl,-5.1,.2,'nero',{hi:0});if(!OUT){ctx.fillStyle=C.giallo[2];ball([8.6+sl,-5.5],.22);ctx.fill()}PB(-3.4+sl,-5.85,-2.3+sl,-5.1,.2,'nero',{hi:0})}},
  revolver:{muzzle:[15.7,-4.15],eject:null,sup:null,len:[-4.6,15.6],magP:[3.9,2.75],magD:[0,0],
    cylC:sw=>[1.5+sw*2.4,-3.65+sw*6.4],
    supR:(o,k)=>{const c=G.revolver.cylC(o.swing||0),e=[c[0]+2.7,c[1]+1.9];if(k<.04||k>.94)return null;
      if(k<.2)return LP([c[0]+3,c[1]+8],e,(k-.04)/.08);if(k<.3)return LP(e,[c[0]+3.5,c[1]+7.5],(k-.2)/.1);
      if(k<.82){const f=((k-.3)/.5*6.99)%1;return k<.32?LP([c[0]+3.5,c[1]+7.5],e,(k-.3)/.02):[e[0]-bump(f)*.7,e[1]-bump(f)*.55]}
      return LP(e,[5,.4],(k-.82)/.1)},
    post(o){const sw=o.swing||0,cy=o.cyl||0;if(sw<.5)return;const[cx,c0]=G.revolver.cylC(sw),R=2.75;
      paint(()=>{ctx.beginPath();ctx.ellipse(cx,c0,R,R*.96,0,0,TAU)},[cx-R,c0-R,cx+R,c0+R],'lucido',{gl:1});
      if(!OUT){for(let i=0;i<6;i++){const a=i/6*TAU+cy*TAU/6,q=[cx+Math.cos(a)*R*.58,c0+Math.sin(a)*R*.56];ctx.fillStyle='#16191d';ball(q,.66);ctx.fill();
          if(i<(o.rounds||0)){ctx.fillStyle=C.ottone[1];ball(q,.48);ctx.fill();ctx.fillStyle=wa(1.2);ball([q[0]-.14,q[1]-.14],.17);ctx.fill()}}
        ctx.fillStyle='#16191d';ball([cx,c0],.38);ctx.fill()}},
    draw(o){const hm=o.hammer||0,sw=o.swing||0,cy=o.cyl||0;
    paint(()=>{ctx.beginPath();ctx.moveTo(-2.6,-1.6);ctx.lineTo(.8,-1.6);ctx.quadraticCurveTo(1.3,2.6,.3,4.6);ctx.lineTo(-2.5,4.9);ctx.quadraticCurveTo(-4.2,4.4,-3.9,2.6);ctx.quadraticCurveTo(-4,0,-2.6,-1.6);ctx.closePath()},[-4.2,-1.6,1.3,4.9],'legnoR',{dk:.62});
    ctx.save();ctx.beginPath();ctx.moveTo(-2.6,-1.6);ctx.lineTo(.8,-1.6);ctx.quadraticCurveTo(1.3,2.6,.3,4.6);ctx.lineTo(-2.5,4.9);ctx.quadraticCurveTo(-4.2,4.4,-3.9,2.6);ctx.closePath();ctx.clip();grain(-4,-1,1,4.4,3);ctx.restore();
    screw(-1.5,1.7,.7,C.giallo[1]);
    guard(.8,4.4,-1.2,2.2,'lucido');
      ctx.save();ctx.translate(-2.4,-4.3);ctx.rotate(-hm*.55);PP([[.5,.3],[-.9,-2.5],[-2.3,-2.1],[-1.2,.7]],.4,'brunito',{hi:.3});ctx.restore();
    PP([[-3.4,-4.1],[-2.3,-5.4],[4.8,-5.4],[4.8,-1.4],[-3,-1.4]],.5,'lucido',{gl:1});
    PB(4.8,-3.25,10.6,-2.3,.4,'lucido',{hi:.3});
    PB(4.5,-5.15,15.5,-3.15,.7,'lucido',{gl:2});PP([[14.1,-5.1],[14.9,-6.3],[15.15,-5.1]],.1,'rosso',{hi:0,lw:.8});
    if(sw>0&&!OUT){ctx.save();ctx.globalAlpha*=cl(sw*3,0,1);ctx.fillStyle='#1d2127';rb(-1,-5.05,4,-2.05,.7);ctx.fill();ctx.restore()}
    const dx=sw*2.4,dy=sw*6.4;
    if(sw<.5){PB(-1.25+dx,-5.7+dy,4.25+dx,-1.6+dy,1,'lucido',{gl:1});
      if(!OUT){ctx.save();rb(-1.25+dx,-5.7+dy,4.25+dx,-1.6+dy,1);ctx.clip();for(let i=0;i<3;i++){const u=((i/3+cy*.5)%1),x=-.9+dx+u*4.8;lines([[x,-5.2+dy,x,-2.1+dy]],'rgba(30,36,44,.55)',.55)}ctx.restore()}}}},
  mitraglietta:{muzzle:[12.4,-3.9],eject:[3.8,-6.2],sup:[6.9,.6],len:[-10.6,12.3],magP:[-1.1,2.7],magD:[.3,7],
    supR:(o,k,s)=>magHand(k,s,[-1.25,7.2],[.3,7],[2.05-(o.slide||0)*2,-6.9]),
    draw(o){const bo=-(o.slide||0)*2,md=o.mag||0,ma=o.magA==null?1:o.magA;
    ctx.lineCap='round';ctx.lineJoin='round';const ws=()=>{ctx.beginPath();ctx.moveTo(-4.4,-5);ctx.lineTo(-9.4,-5.2);ctx.lineTo(-9.8,-1.8);ctx.lineTo(-4.4,-2.3)};
    if(OUT){ws();ctx.strokeStyle=INK;ctx.lineWidth=.85+LO*2;ctx.stroke()}else{ws();ctx.strokeStyle=INK;ctx.lineWidth=.85+LI*1.6;ctx.stroke();ws();ctx.strokeStyle=C.teal[1];ctx.lineWidth=.85;ctx.stroke()}
    PB(-10.6,-5.9,-9.1,-1.1,.5,'teal',{hi:.4});
    if(ma>0){ctx.save();ctx.translate(md*.3,md*7);ctx.globalAlpha*=ma;PP([[-2.4,-1.8],[.6,-1.8],[.25,6.6],[-2.75,6.6]],.4,'nero',{dk:.75,hi:.25});PB(-3.15,6.2,.65,7.2,.4,'nero',{col:'#4a5058'});ctx.restore()}
    PB(-2.7,-1.9,.85,2.3,.6,'teal');
    guard(.9,4.2,-1.6,1.9,'nero');
    PB(6,-2,7.8,2.2,.6,'gomma',{hi:.3});lines([[6.1,.3,7.7,.3]],C.teal[1],.45);
    PB(-4.7,-6.3,8.9,-1.7,1.1,'nero',{hi:.45});
    PB(-3.8,-4.7,6.9,-2.55,.5,'teal',{dk:.62});
    if(!OUT){ctx.fillStyle='#121417';rb(2.6,-5.95,4.9,-5.05,.25);ctx.fill()}screw(-2.9,-3.6,.35,'#7f8a96');screw(5.9,-3.6,.35,'#7f8a96');
    PB(1.2+bo,-7.3,2.9+bo,-6.15,.4,'nero',{hi:.4});
    PB(8.7,-4.8,11.4,-3,.5,'acciaio',{gl:1});PB(10.8,-5.25,12.3,-2.55,.45,'nero',{hi:.3})}},
  mitra:{muzzle:[22.3,-3.65],eject:[3.8,-5.7],sup:[11.8,-1.25],len:[-13.3,22.1],magP:[5.3,2.6],magD:[1.2,8],
    supR:(o,k,s)=>magHand(k,s,[7.4,6.6],[1.2,8],[5.7-(o.slide||0)*2.2,-3.1]),
    draw(o){const bo=-(o.slide||0)*2.2,md=o.mag||0,ma=o.magA==null?1:o.magA;
    const st=[[-4,-5.2],[-11.8,-4.6],[-12.6,-3.9],[-12.6,.6],[-11.9,1.25],[-4,-1.6]];PP(st,[.3,.5,.6,.6,.5,.3],'legno',{dk:.62});
    ctx.save();rp(st,.5);ctx.clip();grain(-12.4,-4.6,-4,0,4);ctx.restore();PB(-13.3,-4.9,-12.3,1.45,.4,'gomma',{hi:.2});
    PP([[-3,-1.7],[-.4,-1.7],[.8,3.8],[-1.8,4.2]],.5,'legno',{dk:.66});
    guard(-.6,2.1,-1.5,1.6,'nero');
    if(ma>0){ctx.save();ctx.translate(md*1.2,md*8);ctx.globalAlpha*=ma;
      paint(()=>{ctx.beginPath();ctx.moveTo(2.4,-1.7);ctx.lineTo(5.6,-1.7);ctx.quadraticCurveTo(6.2,2.4,8.6,6);ctx.lineTo(6,7);ctx.quadraticCurveTo(3.6,3.2,2.4,-1.7);ctx.closePath()},[2.4,-1.7,8.6,7],'rame',{dk:.7});
      ctx.strokeStyle='rgba(60,20,6,.55)';ctx.lineWidth=.4;for(const k of[.35,.65]){ctx.beginPath();ctx.moveTo(lerp(2.4,6,k)+.3,lerp(-1.7,7,k)*.95);ctx.lineTo(lerp(5.6,8.6,k),lerp(-1.7,6,k));ctx.stroke()}ctx.restore()}
    PB(-4.2,-5.6,8.1,-1.6,.7,'brunito',{gl:1});PB(-3.8,-6.45,7.2,-5.35,.5,'brunito',{hi:.8});
    if(!OUT){ctx.fillStyle='#10141a';rb(2.4,-4.95,5.2,-4.1,.25);ctx.fill()}screw(-3,-2.7,.33,'#8494a6');screw(6.9,-2.7,.33,'#8494a6');
    paint(()=>ball([5.7+bo,-3.6],.75),[4.95+bo,-4.35,6.45+bo,-2.85],'acciaio',{lw:1.2});
    PB(8,-6.45,14.4,-5.2,.5,'acciaio',{hi:.5});
    PB(8,-5.25,15.4,-2.1,.8,'legno',{dk:.6});grain(8.4,-4.9,15,-2.5,2);lines([[10,-3.55,11.6,-3.55],[12.4,-3.55,14,-3.55]],'#2a1408',.55);
    PB(15.3,-4.3,20.6,-3,.4,'acciaio',{gl:2});
    PP([[17.6,-4.3],[17.9,-6.7],[18.6,-6.7],[18.8,-4.3]],.2,'acciaio',{hi:.4,lw:1});
    PB(20.2,-4.75,22.1,-2.55,.4,'nero',{hi:.3});lines([[21.1,-4.4,21.1,-2.9]],'#0c0d10',.45);
    PB(-.4,-7.15,4,-6.2,.3,'nero',{hi:.2});PB(0,-9.6,3.6,-6.8,.7,'nero',{hi:.5});
    const gl=o.glow==null?1:o.glow;shine('255,90,60',3.1,-8.2,3.6,.55*gl);if(!OUT){ctx.fillStyle=INK;ball([3.05,-8.2],1.2);ctx.fill();ctx.fillStyle='#ff6a4a';ball([3.05,-8.2],.95);ctx.fill();ctx.fillStyle='#ffd0c2';ball([2.8,-8.45],.3);ctx.fill()}}},
  mitragliatrice:{muzzle:[28.5,-4.6],eject:[4.6,-1.3],sup:[16.3,1.2],len:[-7.3,28.3],magP:[6.6,1.75],magD:[0,7],
    supR:(o,k,s)=>magHand(k,s,[6.6,4.8],[0,7],[8.6,-1.4+Math.sin((o.feed||0)*TAU)*.3]),
    draw(o){const sp=o.spin||0,fd=o.feed||0,md=o.mag||0,ma=o.magA==null?1:o.magA;
    PP([[-2.2,-1.8],[.5,-1.8],[1.2,3.4],[-1.4,3.8]],.5,'gomma',{dk:.66,hi:.3});guard(.7,3,-1.6,1.6,'nero');
    if(ma>0){ctx.save();ctx.translate(0,md*7);ctx.globalAlpha*=ma;
      PB(3.4,-1.3,9.8,4.8,.8,'oliva',{dk:.62});lines([[3.6,.3,9.6,.3]],'rgba(20,26,8,.55)',.4);PB(4.4,2,8.8,3,.2,'giallo',{hi:0,lw:.8});screw(9,1.4,.32,'#c9cf9a');
    ctx.restore()}
    PB(-7.3,-7.3,-5.6,-2.1,.6,'arancio');
    PB(-6.2,-8.1,7.4,-1.4,1.6,'acciaio',{gl:1});lines([[-4.2,-6.6,-4.2,-3.2],[-3.3,-6.6,-3.3,-3.2],[-2.4,-6.6,-2.4,-3.2]],'#1c2127',.5);screw(5.6,-2.7,.36,'#aab4be');
    const arch=()=>{ctx.beginPath();ctx.moveTo(-3.2,-8);ctx.quadraticCurveTo(-3,-11,0.6,-11);ctx.quadraticCurveTo(4.3,-11,4.5,-8)};ctx.lineCap='round';if(OUT){arch();ctx.strokeStyle=INK;ctx.lineWidth=1+LO*2;ctx.stroke()}else{arch();ctx.strokeStyle=INK;ctx.lineWidth=1+LI*1.6;ctx.stroke();arch();ctx.strokeStyle=C.nero[2];ctx.lineWidth=1;ctx.stroke()}
    ctx.save();
      if(md<.05&&ma>.5){const pts=[];for(let i=0;i<5;i++){const k=(i+fd)/5,x=lerp(9.2,6.2,k),y=lerp(-.9,-3.4,k)-Math.sin(k*Math.PI)*1.1;pts.push([x,y])}
        for(const[x,y] of pts){PB(x-.55,y-1.8,x+.55,y+.4,.25,'ottone',{hi:.4,lw:.8});PB(x-.5,y-2.6,x+.5,y-1.7,.45,'rame',{hi:.3,lw:.8})}}
    ctx.restore();
    const br=[];for(let i=0;i<4;i++){const a=sp+i*TAU/4;br.push({y:-4.6+Math.cos(a)*1.65,z:Math.sin(a)})}br.sort((a,b)=>a.z-b.z);
    for(const b of br)PB(7,b.y-.72,27,b.y+.72,.6,'acciaio',{col:mix(C.acciaio[0],C.acciaio[1],.5+b.z*.5),hi:b.z>.3?.5:.1,lw:1});
    PB(11.4,-6.95,12.8,-2.25,.5,'nero',{hi:.3});PB(24.6,-6.95,26,-2.25,.5,'nero',{hi:.3});
    PB(26.6,-6.6,28.3,-2.6,.6,'nero',{hi:.4});
    PP([[15.2,-2.4],[17.2,-2.4],[17.4,3.4],[15.4,3.6]],.6,'gomma',{hi:.3})}},
  pompa:{muzzle:[29.9,-4.2],eject:[4,-5],sup:[14.8,-.6],len:[-13.3,29.7],port:{p0:[5,9],p1:[6,1],p2:[9.2,-2.7],y:-1.2,k:'cart'},
    supR:(o,k,s)=>shellHand(G.pompa.port,o,s),mid:o=>shellIn(G.pompa.port,o),draw(o){const p=-(o.pump||0)*3.2;
    const st=[[-.6,-5],[-11.6,-3.9],[-12.6,-3],[-12.6,1.4],[-11.8,2],[-3,.6],[-.6,-1.2]];PP(st,[.3,.5,.6,.6,.6,.8,.3],'legno',{dk:.6});
    ctx.save();rp(st,.5);ctx.clip();grain(-12.4,-4,-1,1.5,4);checker(-3.6,-1.4,-.8,.6,'rgba(40,18,6,.4)');ctx.restore();PB(-13.3,-3.9,-12.3,2.3,.4,'gomma',{hi:.2});
    guard(1.5,4.4,-1.1,1.9,'brunito');
    PB(-.6,-5,8.6,-1.2,.8,'brunito',{gl:1});lines([[0,-2.05,8,-2.05]],C.ottone[1],.4);if(!OUT){ctx.fillStyle='#0e1217';rb(2.4,-4.6,5.4,-3.75,.2);ctx.fill()}
    PB(8.4,-3.3,25.3,-2,.5,'acciaio',{hi:.3,dk:.5});PB(24.8,-3.55,25.8,-1.8,.4,'acciaio',{hi:.2});
    PB(8.4,-5,29.7,-3.4,.7,'acciaio',{gl:2});paint(()=>ball([29.1,-5.35],.55),[28.55,-5.9,29.65,-4.8],'ottone',{hi:.3,lw:.8});
    PB(11+p,-3.9,18.6+p,-1,.9,'legno',{dk:.55});lines([0,1,2,3].map(i=>[12.4+p+i*1.6,-3.5,12.4+p+i*1.6,-1.4]),'rgba(50,20,6,.6)',.5)}},
  tattica:{muzzle:[21,-4.4],eject:[1.6,-5.3],sup:[9.3,-.5],len:[-7.8,20.8],port:{p0:[4,8.6],p1:[4.6,.8],p2:[7.6,-2.9],y:-1.4,k:'cartV'},
    supR:(o,k,s)=>shellHand(G.tattica.port,o,s),mid:o=>shellIn(G.tattica.port,o),draw(o){const p=-(o.pump||0)*2.6,ns=o.saddle==null?4:o.saddle;
    PB(-7,-4.8,-3.4,-1.6,.6,'nero',{hi:.35});PB(-7.8,-5.2,-6.6,-1.2,.4,'arancio');
    PP([[-2.6,-1.8],[.2,-1.8],[1,3.8],[-1.8,4.2]],.5,'gomma',{dk:.66,hi:.3});lines([[-1.9,-.8,-.9,3.4]],C.arancio[1],.5);
    guard(.4,3.2,-1.6,1.7,'nero');
    PB(-3.6,-5.2,5.6,-1.4,.8,'nero',{hi:.5});
    for(let i=0;i<4;i++){if(i>=ns)continue;const x=-2.7+i*1.9;PB(x,-4.85,x+1.5,-2.7,.45,'verde',{lw:.8,hi:.5});PB(x,-2.95,x+1.5,-2.15,.2,'ottone',{lw:.8,hi:.3})}
    PB(5.4,-5.1,18.8,-3.5,.6,'brunito',{gl:2});
    PB(6.2,-6.05,16.6,-4,.6,'nero',{hi:.45});if(!OUT){ctx.fillStyle='#0b0c0e';for(let i=0;i<4;i++){ball([7.8+i*2.5,-5.05],.48);ctx.fill()}}
    PP([[18.6,-5.6],[20.8,-6.15],[20.8,-2.65],[18.6,-3.1]],.4,'nero',{hi:.4});PB(18.15,-5.7,18.95,-2.95,.2,'arancio',{lw:.8,hi:.2});
    PB(5.4,-3.4,13.4,-2.2,.5,'nero',{hi:.25});
    PB(6.4+p,-3.85,12.2+p,-.9,.8,'nero',{hi:.4});lines([[8.2+p,-3.5,8.2+p,-1.3],[10.4+p,-3.5,10.4+p,-1.3]],C.arancio[1],.55);
    PB(0,-6.7,2.6,-5.2,.4,'nero',{hi:.4});const gl=o.glow==null?1:o.glow;shine('255,90,60',2.1,-5.95,2.6,.5*gl);if(!OUT){ctx.fillStyle='#ff6a4a';ball([2.15,-5.95],.48);ctx.fill()}}},
  lanciarazzi:{muzzle:[15.6,-6.5],back:[-17.8,-6.5],eject:null,sup:[7.3,.8],len:[-17.9,22.6],
    supR:(o,k,s)=>{const ld=o.loaded||0,off=(1-eo(ld))*9;if(k<.3)return LP(s,[22,1.5],k/.3);if(k<.86)return[18.4+off,-4.3];return LP([18.4,-4.3],s,(k-.86)/.12)},
    draw(o){const ld=o.loaded==null?1:o.loaded;
    PP([[-14.4,-8.6],[-17.6,-10.2],[-17.6,-2.8],[-14.4,-4.4]],.5,'acciaio',{hi:.3});if(!OUT){ctx.fillStyle='#121417';rb(-17.95,-9.8,-17.25,-3.2,.2);ctx.fill()}
    if(ld>0){const off=(1-eo(ld))*9;ctx.save();ctx.globalAlpha*=cl(ld*3,0,1);
      paint(()=>{ctx.beginPath();ctx.moveTo(15+off,-8.45);ctx.lineTo(17.6+off,-8.45);ctx.quadraticCurveTo(21.4+off,-8.3,22.6+off,-6.5);ctx.quadraticCurveTo(21.4+off,-4.7,17.6+off,-4.55);ctx.lineTo(15+off,-4.55);ctx.closePath()},[15+off,-8.45,22.6+off,-4.55],'rosso',{gl:1});
      if(!OUT){ctx.fillStyle=C.cera[1];ctx.fillRect(16+off,-8.4,.7,3.8)}paint(()=>ball([22.4+off,-6.5],.5),[21.9+off,-7,22.9+off,-6],'lucido',{hi:.2,lw:.8});ctx.restore()}
    PB(-14.6,-9.2,15.4,-3.8,1.4,'oliva',{gl:2});
    if(!OUT){ctx.save();rb(-14.6,-9.2,15.4,-3.8,1.4);ctx.clip();ctx.fillStyle=C.giallo[1];ctx.fillRect(11.6,-9.3,3,5.6);ctx.fillStyle=INK;for(let i=0;i<4;i++){const x=11+i*1.3;poly([[x,-3.7],[x+.65,-3.7],[x+2.6,-9.3],[x+1.95,-9.3]]);ctx.fill()}
      ctx.fillStyle=C.cera[1];ctx.fillRect(-12.2,-9.3,1,5.6);ctx.fillStyle='rgba(20,26,8,.35)';ctx.fillRect(-14.7,-6.1,30.2,.35);ctx.restore()}
    lines([[11.6,-9.2,11.6,-3.8],[14.6,-9.2,14.6,-3.8]],INK,.5);for(const x of[-9,-3,3,9])screw(x,-8.35,.33,C.oliva[2]);
    PB(-3.2,-11.8,3.4,-9,.6,'nero',{hi:.5});const gl=o.glow==null?1:o.glow;shine('120,255,140',0,-10.4,4.2,.5*gl);PB(-1.8,-11.2,1.8,-9.6,.4,'verde',{col:'#7dffa0',colD:'#3fc06a',colL:'#d8ffe2',hi:0,lw:.9});
    PP([[-1.4,-3.8],[1.2,-3.8],[1.8,3.2],[-1,3.6]],.5,'gomma',{dk:.66,hi:.3});guard(1.3,3.9,-3.6,1.5,'nero');
    PP([[6.2,-3.9],[8.2,-3.9],[8.4,2.2],[6.4,2.4]],.6,'gomma',{hi:.3})}}};
// the shell going into a shotgun: from below in the other hand, under the loading port, up into it (cut where it enters the gun)
function shellPos(P,f){if(f<.45){const q=LP(P.p0,P.p1,f/.45);return[q[0],q[1],lerp(-1,0,ez(f/.45))]}if(f<.8){const q=LP(P.p1,P.p2,(f-.45)/.35);return[q[0],q[1],-.35*ez((f-.45)/.35)]}return null}
function shellIn(P,o){const f=o.shell;if(f==null||f<0)return;const q=shellPos(P,f);if(!q)return;ctx.save();ctx.beginPath();ctx.rect(-20,P.y,60,30);ctx.clip();munizione(P.k,q[0],q[1],.75,q[2]);ctx.restore()}
function shellHand(P,o,s){const f=o.shell;if(f==null||f<0)return s;const q=shellPos(P,f);if(q)return[q[0]-Math.cos(q[2])*2.6,q[1]-Math.sin(q[2])*2.6+.9];return LP(P.p2,P.p0,(f-.8)/.2)}
// the other hand: where it rests (sup) and, during the reload, where the gun's own supR puts it (null: not seen)
function supAt(id,M,o){let s=M.sup&&!o.oneHand?[M.sup[0]-(id==='pompa'?(o.pump||0)*3.2:id==='tattica'?(o.pump||0)*2.6:0),M.sup[1]]:null;
  if(M.supR&&((o.rk!=null&&o.rk>=0)||(o.shell!=null&&o.shell>=0))){const r=M.supR(o,o.rk,s);if(r!==undefined)s=r}return s}
function two(f){OUT=true;try{ctx.save();f();ctx.restore()}finally{OUT=false}ctx.save();f();ctx.restore()}
// a gun in the current transform (pointing +x, grip at 0,0): the recoil pushes it back and up, tilt turns its muzzle up (reloads),
// then the gun, what the other hand brings (mid), the hand on the grip, what sits in front of it (post: the open cylinder), the other
// hand, the flash. o: the pose (nuova().pose()) and hands (true: the hero's, 'ossa': a bony one), skin
function held(id,o){o=o||{};const M=G[id],D=DATI[id],rec=o.rec||0;ctx.save();ctx.translate(-rec*(D.kick||2),0);ctx.rotate(-rec*(D.kickR||.1)-(o.tilt||0));
  ctx.scale(GS,GS);ctx.lineJoin='round';ctx.lineCap='round';
  two(()=>M.draw(o));if(M.mid)M.mid(o);
  const hs=o.hands!==false&&o.hands!=null;if(hs)hand(0,0,o);
  if(M.post)two(()=>M.post(o));
  if(hs){const s=supAt(id,M,o);if(s)hand(s[0],s[1],o)}
  if(o.flash>0)vampa(id,M.muzzle[0],M.muzzle[1],o.flash,o.seed||1);
  if(id==='lanciarazzi'&&o.flash>0)vampa('retro',M.back[0],M.back[1],o.flash,o.seed||1);ctx.restore()}
// a point of the gun (its own units) in the frame held() is drawn in, with the recoil and the tilt
function pt(id,o,q){if(!q)return null;const D=DATI[id],rec=o.rec||0,th=-rec*(D.kickR||.1)-(o.tilt||0),c=Math.cos(th),s=Math.sin(th);
  return[-rec*(D.kick||2)+GS*(q[0]*c-q[1]*s),GS*(q[0]*s+q[1]*c)]}
const magPt=M=>M.magP?[M.magP[0]+M.magD[0]*.6,M.magP[1]+M.magD[1]*.6]:null;
// a gun at screen x,y (the grip), turned to angle `ang` (0 = right), mirrored when it points left so its top stays up.
// o: {sc, ...the pose}. Returns its key points on the screen: muzzle, eject (where cases fly out), back (the rocket's back-blast),
// mag (where a dropped magazine starts, or the revolver's cases)
function arma(id,x,y,ang,o){o=o||{};const sc=o.sc||1,fl=Math.cos(ang)<-.02?-1:1;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc*fl);held(id,o);ctx.restore();return punti(id,x,y,ang,o)}
function punti(id,x,y,ang,o){o=o||{};const M=G[id],sc=o.sc||1,fl=Math.cos(ang)<-.02?-1:1,ca=Math.cos(ang),sa=Math.sin(ang),
    T=q=>{const p=pt(id,o,q);if(!p)return null;const lx=p[0]*sc,ly=p[1]*sc*fl;return[x+lx*ca-ly*sa,y+lx*sa+ly*ca]};
  return{muzzle:T(M.muzzle),eject:T(M.eject),back:T(M.back),mag:T(magPt(M)),fl,ang}}
// in the hero's hand, for the game's held(S,o,B): in the hero's own frame (drawRig's, already turned and mirrored with B.f). The hand goes
// round the body like the bow's, a little wider when the hero looks away so the gun shows beside the head; looking straight up the gun
// is turned over (its top to the outside), for the same reason
function manoPos(B){const v=B.v;if(v==='n')return[9,-11,true];if(v==='n34')return[B.lx*13,-8.5,false];return[B.lx*10,-5+B.ly*5,false]}
function inMano(id,B,o){const[hx,hy,mir]=manoPos(B);ctx.save();ctx.translate(hx,hy);ctx.rotate(B.la);if(mir)ctx.scale(1,-1);held(id,o);ctx.restore()}
// the same key points in the hero's frame: on the screen they are x*B.f*S.sc and y*S.sc from where drawRig put the hero
function inManoPunti(id,B,o){o=o||{};const M=G[id],[hx,hy,mir]=manoPos(B),c=Math.cos(B.la),s=Math.sin(B.la),m=mir?-1:1,
  T=q=>{const p=pt(id,o,q);if(!p)return null;const lx=p[0],ly=p[1]*m;return[hx+lx*c-ly*s,hy+lx*s+ly*c]};
  return{muzzle:T(M.muzzle),eject:T(M.eject),back:T(M.back),mag:T(magPt(M)),grip:[hx,hy]}}

// ------------------------------------------------------------------ what every gun does (values to tune by playing)
// n: name, rar: rarity (0 Comune .. 4 Leggendario, like the game's cards), d: what it is like, dmg: damage of a bullet (of each pellet),
// rate: shots a second, mag: rounds in the magazine, res: spare rounds, rel: reload seconds (shotguns: seconds for each shell), spread:
// degrees, pel: pellets a shot, spd: bullet speed (px/s), range: how far it reaches (px), auto: keeps firing while you hold, pierce: zombies
// it goes through, splash: blast radius, kick/kickR: how far the recoil pushes it back and up, slow: how much it slows you down,
// spin: seconds the barrels need to spin up, colpo: the look of the bullet, bossolo: the case it throws out, mun: its ammunition
const DATI={
  pistola:{n:'Pistola',rar:0,d:'Precisa e veloce da ricaricare: la compagna di sempre.',dmg:20,rate:4,mag:12,res:72,rel:1.1,spread:3,pel:1,spd:520,range:300,
    colpo:'p9',bossolo:'ottone',mun:'piccole',kick:1.6,kickR:.12,vampa:{len:5,w:3,pts:4}},
  revolver:{n:'Revolver',rar:1,d:'Sei colpi potentissimi che passano attraverso due zombie.',dmg:55,rate:1.6,mag:6,res:36,rel:2.2,spread:1.5,pel:1,spd:600,range:340,pierce:1,
    colpo:'p44',bossolo:null,mun:'piccole',kick:2.6,kickR:.32,vampa:{len:7,w:4.4,pts:6}},
  mitraglietta:{n:'Mitraglietta',rar:0,d:'Piccola e rapidissima: una pioggia di colpi da vicino.',dmg:11,rate:13,mag:32,res:192,rel:1.4,spread:8,pel:1,spd:480,range:220,auto:true,
    colpo:'smg',bossolo:'ottone',mun:'piccole',kick:.9,kickR:.05,vampa:{len:4,w:2.5,pts:3}},
  mitra:{n:'Mitra',rar:2,d:'Il fucile automatico: forte, preciso e affidabile.',dmg:24,rate:9,mag:30,res:180,rel:1.8,spread:3.5,pel:1,spd:640,range:360,auto:true,
    colpo:'rif',bossolo:'ottone',mun:'grosse',kick:1.4,kickR:.07,vampa:{len:6,w:3.2,pts:4,lati:1}},
  mitragliatrice:{n:'Mitragliatrice',rar:3,d:'Le canne girano e non si fermano più: cento colpi di fila.',dmg:26,rate:16,mag:100,res:300,rel:3.4,spread:6,pel:1,spd:620,range:340,auto:true,pierce:1,spin:.45,slow:.25,
    colpo:'lmg',bossolo:'ottone',mun:'grosse',kick:1.2,kickR:.04,vampa:{len:7.5,w:4.4,pts:4,lati:1}},
  pompa:{n:'Pompa da caccia',rar:1,d:'Un colpo, otto pallini: spazza via tutto quello che ha davanti.',dmg:16,rate:1.2,mag:6,res:36,rel:.42,spread:16,pel:8,spd:470,range:190,pump:.3,
    colpo:'pal',bossolo:'cartuccia',mun:'cartucce',kick:3,kickR:.2,vampa:{len:8,w:6,pts:7}},
  tattica:{n:'Pompa tattica',rar:2,d:'Corta e veloce da pompare, con il mirino rosso e le cartucce sul fianco.',dmg:14,rate:1.8,mag:8,res:48,rel:.32,spread:22,pel:7,spd:480,range:160,pump:.22,
    colpo:'pal',bossolo:'cartucciaV',mun:'cartucce',kick:2.4,kickR:.18,vampa:{len:6.5,w:5.4,pts:6}},
  lanciarazzi:{n:'Lanciarazzi',rar:4,d:'Un razzo che esplode e lancia via tutti gli zombie intorno.',dmg:240,rate:.55,mag:1,res:8,rel:2.2,spread:0,pel:1,spd:150,acc:520,range:420,splash:46,slow:.15,
    colpo:'razzo',bossolo:null,mun:'razzi',kick:3.4,kickR:.14,vampa:{len:6,w:5.6,pts:6}},
  retro:{vampa:{len:9,w:6,pts:7}}};
const ORDINE=['pistola','revolver','mitraglietta','mitra','mitragliatrice','pompa','tattica','lanciarazzi'];
const RAR=[{n:'Comune',c:'#b5b8bb'},{n:'Non comune',c:'#6cc24a'},{n:'Raro',c:'#4d97ff'},{n:'Epico',c:'#b874e6'},{n:'Leggendario',c:'#ffb020'}];
// a little random generator from a seed, so the same shot always looks the same
function rnd(seed){let x=(Math.floor(seed*9301+49297)%233280+233280)%233280||1;return()=>{x=(x*9301+49297)%233280;return x/233280}}
// the muzzle flash in the gun's own frame, pointing +x (the rocket's back-blast points -x): a star of fire with longer flames forward
// (and to the sides for the rifles), a yellow middle, a white core, a warm glow. k: 1 when the shot leaves, down to 0
function vampa(id,x,y,k,seed){if(k<=0)return;const back=id==='retro',V=DATI[id].vampa,r=rnd(seed||7),L=V.len*(.55+.45*k),W=V.w*(.6+.4*k),dir=back?-1:1;
  shine('255,180,70',x+dir*L*.4,y,L*1.4+W,.7*k);shine('255,245,210',x+dir*L*.2,y,W*1.1,.55*k);
  const n=V.pts*2,ln=[];for(let i=0;i<n;i++){const a=i/n*TAU,c=Math.cos(a),side=V.lati&&Math.abs(Math.sin(a))>.97;ln.push(i%2?W*.3:(c>.9?L:W*(.42+.3*r())+(L-W*.45)*Math.pow(Math.max(0,c),3))*(side?1.45:1))}
  ctx.save();ctx.translate(x,y);ctx.scale(dir,1);ctx.globalAlpha*=Math.min(1,k*1.6);
  for(const[s,col] of[[1,'#ff7d24'],[.7,'#ffd23f'],[.4,'#fffbea']]){ctx.beginPath();for(let i=0;i<n;i++){const a=i/n*TAU,rr=ln[i]*s;ctx.lineTo(L*.12+Math.cos(a)*rr,Math.sin(a)*rr*.8)}ctx.closePath();ctx.fillStyle=col;ctx.fill()}
  ctx.restore()}

// ------------------------------------------------------------------ a gun in someone's hands
// nuova(id) -> g. Every frame: ev=g.update(dt,fire) (fire: the trigger is held), draw with arma(id,x,y,ang,g.pose()) or inMano(id,B,g.pose());
// g.ricarica() starts a reload. update() returns what happened this frame, for the game to act on:
//  {k:'sparo',ang:[pellet angle offsets, radians],seed}  {k:'bossolo',n} (cases fly out: from the eject point, the revolver's from its
//  cylinder)  {k:'caricatore'} (the empty magazine falls, from the mag point)  {k:'suono',w:'sparo'|'ricarica'|'vuoto'|'pompa'|'giri'|
//  'cartuccia'}  {k:'pronta'} (reload done)
// Reload timeline of the magazine guns (k = 0..1 of D.rel), the same in the drawings, the hand and the sounds: .1 the magazine starts
// out, .2 it falls (and vanishes from the gun), .45 the hand brings the new one, .55-.75 it goes in, .8-.97 the bolt or slide is pulled.
function nuova(id){const D=DATI[id],sh=id==='pompa'||id==='tattica';
  const g={id,D,mag:D.mag,res:D.res,st:'pronta',t:0,cd:0,rec:0,flash:0,slide:0,pump:0,magOut:0,magA:1,cyl:0,hammer:0,swing:0,rounds:D.mag,spin:0,spinV:0,feed:0,loaded:1,shell:-1,tilt:0,
    prev:false,seed:1,q:[],
    tot:()=>g.mag+g.res,
    ricarica(){if(g.st==='ricarica'||g.mag>=D.mag||g.res<=0)return false;g.empty=g.mag<=0;g.st='ricarica';g.t=0;g.dropped=0;g.cnt=0;g.q.push({k:'suono',w:'ricarica'});return true},
    annulla(){if(g.st!=='ricarica')return;g.st='pronta';g.t=0;g.magOut=0;g.magA=1;g.swing=0;g.slide=0;g.shell=-1;g.tilt=0;g.dropped=0;g.rounds=g.mag;g.loaded=g.mag>0?1:0},
    rk:()=>g.st==='ricarica'&&!sh&&g.t>=0?cl(g.t/D.rel,0,1):-1,
    pose(){return{rec:g.rec,flash:g.flash,slide:g.slide,pump:g.pump,mag:g.magOut,magA:g.magA,cyl:g.cyl,hammer:g.hammer,swing:g.swing,rounds:g.rounds,spin:g.spin,feed:g.feed,
      loaded:g.loaded,saddle:Math.min(4,g.res),seed:g.seed,glow:.8+.2*Math.sin(G_t()*3),tilt:g.tilt,rk:g.rk(),shell:g.shell}},
    update(dt,fire){const ev=g.q.splice(0);const press=fire&&!g.prev;g.prev=fire;g.t+=dt;g.cd=Math.max(0,g.cd-dt);
      g.rec=Math.max(0,g.rec-dt*(id==='lanciarazzi'?3:id==='revolver'||sh?5:9));g.flash=Math.max(0,g.flash-dt*(id==='mitragliatrice'?26:16));
      if(g.slide>0&&g.st!=='ricarica')g.slide=Math.max(0,g.slide-dt*(id==='pistola'?9:14));if(id==='revolver')g.hammer=g.st==='ricarica'?0:1-g.cd*D.rate;
      // the machine gun's barrels spin up while the trigger is held, and keep turning a little after
      if(id==='mitragliatrice'){const want=fire&&g.mag>0&&g.st==='pronta'?1:0,was=g.spinV;g.spinV=cl(g.spinV+(want?dt/D.spin:-dt/1.1),0,1);g.spin+=g.spinV*dt*26;
        if(want&&was===0)ev.push({k:'suono',w:'giri'})}
      if(g.st==='pompa'&&g.t>=0){if(!g.ps){g.ps=1;ev.push({k:'suono',w:'pompa'})}const k=g.t/D.pump;g.pump=bump(k);if(k>=.5&&!g.ej){g.ej=1;ev.push({k:'bossolo',n:1})}if(k>=1){g.st='pronta';g.pump=0}}
      if(g.st==='ricarica')rel(dt,ev,fire,press);
      if(g.st!=='ricarica'){g.tilt=Math.max(0,g.tilt-dt*3);g.shell=-1}
      if(g.st==='pronta'&&fire&&g.cd<=0){const can=D.auto?fire:press;
        if(can){if(g.mag<=0){if(g.res>0)g.ricarica();else if(press)ev.push({k:'suono',w:'vuoto'})}
          else if(id!=='mitragliatrice'||g.spinV>=1)shoot(ev)}}
      ev.push(...g.q.splice(0));return ev}};
  function shoot(ev){g.mag--;g.cd=1/D.rate;g.rec=1;g.flash=1;g.seed=(g.seed*7+3)%997;const r=rnd(g.seed),sp=D.spread*Math.PI/180,a=[];
    for(let i=0;i<D.pel;i++)a.push((r()-.5)*sp*(D.pel>1?1:2*Math.min(1,.4+r())));
    ev.push({k:'sparo',ang:a,seed:g.seed},{k:'suono',w:'sparo'});
    if(id==='revolver'){g.cyl+=1/6;g.hammer=0;g.rounds=g.mag}else g.slide=1;
    if(id==='mitragliatrice')g.feed=(g.feed+.34)%1;
    if(D.bossolo&&!sh)ev.push({k:'bossolo',n:1});
    if(sh){g.st='pompa';g.t=-.16;g.ej=0;g.ps=0}
    if(id==='lanciarazzi'){g.loaded=0;if(g.res>0){g.st='ricarica';g.t=-.35;g.dropped=0;ev.push({k:'suono',w:'ricarica'})}}}
  // reloading: magazines drop out and go in, the revolver tips up, opens and fills, shotguns take one shell at a time (a shot stops it),
  // the machine gun swaps its box and feeds the belt, the rocket is pushed into the tube; the gun tips its muzzle up a little meanwhile
  function rel(dt,ev,fire,press){const R=D.rel;
    if(sh){if(press&&g.mag>0){g.st='pronta';g.shell=-1;return}g.tilt=Math.min(.16,g.tilt+dt*1.2);const f=g.t/R;g.shell=Math.min(f,.999);
      if(f>=.8&&!g.cnt){g.cnt=1;g.mag++;g.res--;ev.push({k:'suono',w:'cartuccia'})}
      if(f>=1){g.t-=R;g.cnt=0;if(g.mag>=D.mag||g.res<=0){g.shell=-1;ev.push({k:'pronta'});if(g.empty){g.st='pompa';g.t=-.12;g.ej=1;g.ps=0}else g.st='pronta'}}return}
    if(g.t<0)return;const k=g.t/R;
    if(id==='revolver'){g.tilt=.55*tz(k,.02,.14,.82,.92);g.swing=k<.16?ez((k-.02)/.14):k<.82?1:1-ez((k-.82)/.1);g.hammer=0;
      if(k>=.2&&!g.dropped){g.dropped=1;g.rounds=0;ev.push({k:'bossolo',n:6})}if(k>=.3&&k<.82)g.rounds=Math.min(Math.min(6,g.mag+g.res),Math.floor((k-.3)/.5*6.99));
      if(k>=.92)g.cyl+=dt*4}
    else if(id==='lanciarazzi'){g.tilt=.1*tz(k,0,.15,.8,.95);g.loaded=k<.3?0:Math.min(1,(k-.3)/.55)}
    else{g.tilt=(id==='mitragliatrice'?.1:.2)*tz(k,0,.1,.72,.84);
      g.magOut=k<.1?0:k<.2?ez((k-.1)/.1)*.6:k<.55?1:k<.75?1-ez((k-.55)/.2):0;g.magA=k<.2||k>=.55?1:k<.45?0:(k-.45)/.1;
      if(k>=.2&&!g.dropped){g.dropped=1;ev.push({k:'caricatore'})}
      g.slide=k>=.8?bump((k-.8)/.17):0;if(id==='mitragliatrice'&&k>.8)g.feed=(k-.8)*5%1}
    if(k>=1){const n=Math.min(D.mag-g.mag,g.res);g.mag+=n;g.res-=n;g.st='pronta';g.dropped=0;g.magOut=0;g.magA=1;g.swing=0;g.slide=0;g.rounds=g.mag;g.loaded=g.mag>0?1:0;ev.push({k:'pronta'})}}
  return g}
const G_t=()=>typeof G!=='undefined'&&G.t!=null?G.t:performance.now()/1000;

// ------------------------------------------------------------------ the bullets
// a bullet in flight: a glowing streak with a dark edge (so it shows on every floor), its head at x,y, flying along dx,dy on the screen
const COLPI={p9:{len:7,w:1.7,col:'255,214,74',glow:'255,200,80'},p44:{len:10,w:2.5,col:'255,170,70',glow:'255,150,60'},smg:{len:6,w:1.3,col:'255,230,130',glow:'255,215,120'},
  rif:{len:10,w:1.8,col:'255,240,160',glow:'255,220,120'},lmg:{len:12,w:2.1,col:'255,130,60',glow:'255,110,50'},pal:{len:4.5,w:1.7,col:'255,236,170',glow:'255,220,140'}};
function colpo(kind,x,y,dx,dy,a){const B=COLPI[kind]||COLPI.p9,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,tx=x-ux*B.len,ty=y-uy*B.len;a=a==null?1:a;
  shine(B.glow,x,y,B.w*3.2,.55*a);ctx.save();ctx.globalAlpha*=a;ctx.lineCap='round';
  ctx.strokeStyle='rgba(27,22,18,.6)';ctx.lineWidth=B.w+1.4;seg([x-ux*B.len*.55,y-uy*B.len*.55],[x,y]);ctx.stroke();
  const g=ctx.createLinearGradient(tx,ty,x,y);g.addColorStop(0,`rgba(${B.col},0)`);g.addColorStop(.6,`rgba(${B.col},.75)`);g.addColorStop(1,`rgba(${B.col},1)`);
  ctx.strokeStyle=g;ctx.lineWidth=B.w;seg([tx,ty],[x,y]);ctx.stroke();ctx.strokeStyle='#fffbea';ctx.lineWidth=B.w*.45;seg([x-ux*B.len*.35,y-uy*B.len*.35],[x,y]);ctx.stroke();ctx.restore()}
// the rocket in flight, nose at x,y, flying at angle ang: olive body, red head, fins, a flickering flame and its glow
function razzo(x,y,ang,t){ctx.save();ctx.translate(x,y);ctx.rotate(ang);if(Math.cos(ang)<-.02)ctx.scale(1,-1);const f=.8+.25*Math.sin(t*60)+.1*Math.sin(t*23);
  shine('255,160,60',-10,0,9*f,.8);
  for(const[s,col] of[[1,'#ff7d24'],[.65,'#ffd23f'],[.35,'#fffbea']]){ctx.beginPath();ctx.moveTo(-8.2,-1.3*s);ctx.quadraticCurveTo(-8.2-4*s*f,-1*s,-8.2-7.5*s*f,0);ctx.quadraticCurveTo(-8.2-4*s*f,1*s,-8.2,1.3*s);ctx.closePath();ctx.fillStyle=col;ctx.fill()}
  for(const out of[true,false]){OUT=out;try{
    PP([[-8.4,-1.4],[-6.2,-1.6],[-5.4,-3.4],[-4.4,-3.4],[-4.6,-1.6],[-4.6,1.6],[-4.4,3.4],[-5.4,3.4],[-6.2,1.6],[-8.4,1.4]],.3,'oliva',{hi:.3,lw:.9});
    PB(-6.6,-1.6,-.6,1.6,.5,'oliva',{gl:1,lw:.9});
    paint(()=>{ctx.beginPath();ctx.moveTo(-.8,-1.6);ctx.quadraticCurveTo(2.6,-1.5,3.6,0);ctx.quadraticCurveTo(2.6,1.5,-.8,1.6);ctx.closePath()},[-.8,-1.6,3.6,1.6],'rosso',{gl:1,lw:.9});
    if(!OUT){ctx.fillStyle=C.cera[1];ctx.fillRect(-1.3,-1.55,.55,3.1)}}finally{OUT=false}}
  ctx.restore()}
// a puff of smoke (k: 0 born .. 1 gone), dark or light
function fumo(x,y,k,r,dark){if(k>=1)return;const rr=r*(.45+.8*ez(Math.min(1,k*1.4))),a=(1-k)*(dark?.5:.42);ctx.fillStyle=dark?`rgba(46,40,36,${a})`:`rgba(205,198,186,${a})`;ball([x,y-k*r*.6],rr);ctx.fill();
  ctx.fillStyle=dark?`rgba(80,72,66,${a*.6})`:`rgba(240,236,228,${a*.55})`;ball([x-rr*.25,y-k*r*.6-rr*.25],rr*.55);ctx.fill()}
// a spent case: a brass case, or a shotgun shell (red or green) with its brass base; ang: how it lies
function bossolo(kind,x,y,ang,a){if(!kind||a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(ang);ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.lineWidth=.7;
  if(kind==='ottone'){ctx.fillStyle=C.ottone[1];ctx.beginPath();ctx.rect(-1.35,-.6,2.7,1.2);ctx.fill();ctx.stroke();ctx.fillStyle=C.ottone[2];ctx.fillRect(-1.1,-.45,2.1,.35);ctx.fillStyle=C.ottone[0];ctx.fillRect(-1.35,-.6,.45,1.2)}
  else{ctx.fillStyle=kind==='cartucciaV'?C.verde[1]:C.rosso[1];ctx.beginPath();ctx.rect(-1.9,-.85,2.9,1.7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(-1.7,-.65,2.5,.4);
    ctx.fillStyle=C.ottone[1];ctx.beginPath();ctx.rect(1,-.9,1,1.8);ctx.fill();ctx.stroke()}
  ctx.restore()}
// the explosion of a rocket at progress k (0..1): a flash, a ring along the floor, a ball of fire made of puffs (one dark outline round all
// of them, hotter in the middle), then smoke rising, sparks and bits of stone flying out
function esplosione(x,y,k,s,seed){if(k>=1)return;const r=rnd(seed||3),R=(s||46)*.5;ctx.save();
  if(k<.5){const g=(1-k*2);ctx.strokeStyle=`rgba(255,220,150,${.7*g})`;ctx.lineWidth=3*g+1;ctx.beginPath();ctx.ellipse(x,y,R*(.3+k*2.2),R*(.3+k*2.2)*.5,0,0,TAU);ctx.stroke()}
  if(!LOWFX)glow('255,170,70',x,y-R*.4,R*(1.6+k),.9*(1-k));
  const fk=Math.min(1,k/.55),bl=[];
  for(let i=0;i<(LOWFX?6:10);i++){const a=r()*TAU,d=R*(.12+.5*r())*(.35+fk),rr=R*(.3+.22*r())*(1.15-fk*.55);bl.push([x+Math.cos(a)*d,y-R*.3-Math.abs(Math.sin(a))*d*.55-fk*R*.55*r(),rr,d])}
  if(k>.22)for(const b of bl)fumo(b[0],b[1]-R*.15,Math.min(1,(k-.22)/.78),b[2]*1.7,true);
  if(k<.6){const hot=1-fk;ctx.fillStyle=INK;for(const b of bl){ball(b,b[2]+1.1);ctx.fill()}
    for(const b of bl){ctx.fillStyle=mix(mix('#e0442a','#ffa630',hot),'#fff1b8',cl(hot*1.4-b[3]/R*.6,0,1));ball(b,b[2]);ctx.fill()}
    for(const b of bl){ctx.fillStyle=`rgba(255,250,215,${.5*hot+.15})`;ball([b[0]-b[2]*.3,b[1]-b[2]*.32],b[2]*.42);ctx.fill()}}
  if(k<.16){shine('255,250,230',x,y-R*.3,R*(1+k*4),1-k*6);ctx.fillStyle=`rgba(255,248,220,${.85*(1-k*6)})`;ball([x,y-R*.3],R*(.35+k*2.4));ctx.fill()}
  for(let i=0;i<(LOWFX?5:10);i++){const a=r()*TAU,sp=R*(1+r()*1.4),px=x+Math.cos(a)*sp*k*1.3,py=y+Math.sin(a)*sp*k*.6-Math.sin(Math.min(1,k*1.6)*Math.PI)*R*.9*r();
    if(i<6){ctx.fillStyle=`rgba(255,226,140,${1-k})`;ball([px,py],1.1);ctx.fill()}else{ctx.fillStyle=INK;ctx.fillRect(px-1.1,py-1.1,2.2,2.2);ctx.fillStyle='#6b5a48';ctx.fillRect(px-.7,py-.7,1.4,1.4)}}
  ctx.restore()}
// small sparks where a bullet hits something hard
function scintille(x,y,k,seed){if(k>=1)return;const r=rnd(seed||5);ctx.save();ctx.lineCap='round';shine('255,210,120',x,y,6,(1-k)*.7);
  for(let i=0;i<6;i++){const a=r()*TAU,d=(2+r()*6)*(.3+k);ctx.strokeStyle=`rgba(255,${200+r()*55|0},120,${1-k})`;ctx.lineWidth=1;seg([x+Math.cos(a)*d*.5,y+Math.sin(a)*d*.5],[x+Math.cos(a)*d,y+Math.sin(a)*d]);ctx.stroke()}ctx.restore()}

// ------------------------------------------------------------------ effects: cases bouncing on the floor, magazines falling, smoke, sparks,
// explosions, the rocket's trail. Things on the floor live at x,y (the floor) and z (how high above it).
// spawn(k, ...) adds one; fxUpdate(dt) moves them; fxDraw('suolo') draws what lies on the floor (before the bodies), fxDraw('aria') the rest
const FX=[];
function fxAdd(p){p.t=0;FX.push(p);const max=LOWFX?140:360;if(FX.length>max)FX.splice(0,FX.length-max);return p}
// cases thrown out of gun `id` from ex,ey on the screen, h above the floor (the floor under them is at ey+h): they jump up and land on the
// side of the gun that faces the camera (to the hero's right when aiming up or down), a little behind; n>1 (the revolver's) just fall
function espelli(id,ex,ey,ang,fl,h,n){const D=DATI[id],kind=D.bossolo||'ottone',r=Math.random,ca=Math.cos(ang),sa=Math.sin(ang),px=-sa*fl,py=ca*fl;
  for(let i=0;i<(n||1);i++){const many=n>1,s=many?.25:1,side=(28+r()*18)*s,back=(6+r()*10)*s;
    fxAdd({k:'bossolo',kind,x:ex+(many?(r()-.5)*3:0),y:ey+h,z:h,vx:px*side-ca*back+(r()-.5)*8,vy:(py*side-sa*back)*.55+(r()-.5)*5,vz:many?r()*10:42+r()*26,
      r:r()*TAU,vr:(r()-.5)*(many?14:34),g:240,life:3.4,b:0})}}
// the empty magazine falling out of gun `id` (from its mag point, h above the floor), turning a little
function espelliCar(id,mx,my,ang,fl,h){const r=Math.random;fxAdd({k:'caricatore',id,x:mx,y:my+h,z:h,vx:(r()-.5)*8-Math.cos(ang)*4,vy:(r()-.5)*4,vz:-6,r:ang,vr:(r()-.5)*4,g:260,life:4.5,b:0,fl})}
// a dropped magazine lying (or falling) at x,y: the pistol's and the small machine gun's black ones, the rifle's copper banana, the machine
// gun's olive box
function caricatore(id,x,y,ang,a,fl){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.rotate(ang);ctx.scale(GS,GS*(fl||1));ctx.lineJoin='round';
  two(()=>{if(id==='pistola'){PB(-1.4,-2.7,1.4,2.2,.3,'nero',{hi:.25});PB(-1.7,1.9,1.7,3.1,.4,'nero',{col:'#4a5058'})}
    else if(id==='mitraglietta'){PP([[-1.5,-4.2],[1.5,-4.2],[1.15,3.6],[-1.85,3.6]],.4,'nero',{dk:.75,hi:.25});PB(-2.25,3.2,1.55,4.2,.4,'nero',{col:'#4a5058'})}
    else if(id==='mitra'){paint(()=>{ctx.beginPath();ctx.moveTo(-3,-4.3);ctx.lineTo(.2,-4.3);ctx.quadraticCurveTo(.8,-.2,3.2,3.4);ctx.lineTo(.6,4.4);ctx.quadraticCurveTo(-1.8,.6,-3,-4.3);ctx.closePath()},[-3,-4.3,3.2,4.4],'rame',{dk:.7})}
    else{PB(-3.2,-3,3.2,3,.8,'oliva',{dk:.62});lines([[-3,-1.4,3,-1.4]],'rgba(20,26,8,.55)',.4);PB(-2.2,.3,2.2,1.3,.2,'giallo',{hi:0,lw:.8})}});
  ctx.restore()}
function fxUpdate(dt){for(let i=FX.length-1;i>=0;i--){const p=FX[i];p.t+=dt;if(p.t>=p.life){FX.splice(i,1);continue}
  if(p.g){p.vz-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.r+=p.vr*dt;
    if(p.z<=0){p.z=0;if(p.vz<-25&&p.b<3){p.vz=-p.vz*.36;p.vx*=.5;p.vy*=.5;p.vr*=.55;p.b++;if(p.onBounce)p.onBounce(p)}else{p.vz=0;p.vx*=Math.pow(.02,dt);p.vy*=Math.pow(.02,dt);p.vr*=Math.pow(.02,dt)}}}
  else if(p.vx!=null){p.x+=p.vx*dt;p.y+=p.vy*dt;const dr=p.drag||2;p.vx*=Math.pow(1/(1+dr),dt);p.vy*=Math.pow(1/(1+dr),dt)}}}
function fxDraw(layer){for(const p of FX){const k=p.t/p.life,a=k>.82?1-(k-.82)/.18:1;
  if(layer==='suolo'){if(p.k==='bossolo'||p.k==='caricatore'){const big=p.k==='caricatore'?(p.id==='mitragliatrice'?3:1.7):1;ctx.fillStyle=`rgba(0,0,0,${.22*a})`;ctx.beginPath();ctx.ellipse(p.x,p.y,2.4*big,1*big,0,0,TAU);ctx.fill();
      if(p.k==='bossolo')bossolo(p.kind,p.x,p.y-p.z,p.r,a);else caricatore(p.id,p.x,p.y-p.z,p.r,a,p.fl)}
    else if(p.k==='bruciatura'){ctx.fillStyle=`rgba(20,14,10,${.45*(1-k)})`;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.5,0,0,TAU);ctx.fill()}}
  else{if(p.k==='fumo')fumo(p.x,p.y,k,p.r,p.dark);else if(p.k==='scintille')scintille(p.x,p.y,k,p.seed);else if(p.k==='esplosione')esplosione(p.x,p.y,k,p.s,p.seed);
    else if(p.k==='schizzo'){ctx.fillStyle=p.col||'rgba(140,200,90,.9)';ctx.globalAlpha=1-k;for(let j=0;j<5;j++){const an=j*1.26+p.seed,d=2+k*7;ball([p.x+Math.cos(an)*d,p.y+Math.sin(an)*d*.6-k*3],1.3*(1-k*.6));ctx.fill()}ctx.globalAlpha=1}}}}

// ------------------------------------------------------------------ ammunition: the round of every gun (cards, the counter, pickups)
// and the boxes of ammunition that zombies drop: 'piccole' (pistols, revolver, small machine gun), 'grosse' (rifle, machine gun),
// 'cartucce' (shotguns), 'razzi' (rocket launcher)
function munizione(kind,x,y,sc,ang){ctx.save();ctx.translate(x,y);ctx.rotate(ang||0);ctx.scale(sc||1,sc||1);ctx.lineJoin='round';
  for(const out of[true,false]){OUT=out;try{
    if(kind==='p9'||kind==='smg'){const L=kind==='smg'?2.3:2.6;PB(-L,-1.2,.8,1.2,.3,'ottone',{gl:1,lw:.9});paint(()=>{ctx.beginPath();ctx.moveTo(.6,-1.15);ctx.quadraticCurveTo(2.7,-1,2.9,0);ctx.quadraticCurveTo(2.7,1,.6,1.15);ctx.closePath()},[.6,-1.15,2.9,1.15],'rame',{gl:1,lw:.9})}
    else if(kind==='p44'){PB(-3.2,-1.35,1.6,1.35,.3,'ottone',{gl:1,lw:.9});PB(-3.6,-1.6,-3,1.6,.2,'ottone',{lw:.8});paint(()=>{ctx.beginPath();ctx.moveTo(1.4,-1.25);ctx.quadraticCurveTo(3.2,-1.1,3.4,0);ctx.quadraticCurveTo(3.2,1.1,1.4,1.25);ctx.closePath()},[1.4,-1.25,3.4,1.25],'acciaio',{gl:1,lw:.9})}
    else if(kind==='rif'||kind==='lmg'){const n=kind==='lmg'?3:1;for(let i=0;i<n;i++){const v=(i-(n-1)/2)*2.7;ctx.save();ctx.translate(0,v);
        PP([[-3.6,-1],[.4,-1],[1.2,-.55],[1.2,.55],[.4,1],[-3.6,1]],.25,'ottone',{gl:1,lw:.9});paint(()=>{ctx.beginPath();ctx.moveTo(1.1,-.55);ctx.quadraticCurveTo(3.6,-.4,4.2,0);ctx.quadraticCurveTo(3.6,.4,1.1,.55);ctx.closePath()},[1.1,-.55,4.2,.55],'rame',{lw:.8,hi:.3});
        if(n>1)PB(-1.9,-1.35,-1.1,1.35,.2,'nero',{lw:.8,hi:.2});ctx.restore()}}
    else if(kind==='cart'||kind==='cartV'){PB(-1.4,-1.55,3.4,1.55,.4,kind==='cartV'?'verde':'rosso',{gl:1,lw:.9});PB(-3,-1.6,-1.2,1.6,.3,'ottone',{gl:1,lw:.9});PB(-3.4,-1.8,-2.9,1.8,.2,'ottone',{lw:.8,hi:.2});
      if(!OUT){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.3;for(let i=0;i<3;i++)seg([-.6+i*1.2,-1.3],[-.6+i*1.2,1.3]),ctx.stroke()}}
    else if(kind==='razzo'){ctx.restore();ctx.save();ctx.translate(x,y);ctx.rotate(ang||0);ctx.scale((sc||1)*.62,(sc||1)*.62);ctx.translate(2.4,0);OUT=false;
      PP([[-8.4,-1.4],[-6.2,-1.6],[-5.4,-3.4],[-4.4,-3.4],[-4.6,-1.6],[-4.6,1.6],[-4.4,3.4],[-5.4,3.4],[-6.2,1.6],[-8.4,1.4]],.3,'oliva',{hi:.3,lw:1.4});
      PB(-6.6,-1.6,-.6,1.6,.5,'oliva',{gl:1,lw:1.4});paint(()=>{ctx.beginPath();ctx.moveTo(-.8,-1.6);ctx.quadraticCurveTo(2.6,-1.5,3.6,0);ctx.quadraticCurveTo(2.6,1.5,-.8,1.6);ctx.closePath()},[-.8,-1.6,3.6,1.6],'rosso',{gl:1,lw:1.4});break}
  }finally{OUT=false}}
  ctx.restore()}
// a box of ammunition lying on the floor at x,y (its foot), bobbing a little, with a soft light under it so it stands out.
// tipo: 'piccole' (yellow box of small rounds), 'grosse' (olive ammo can), 'cartucce' (red box with shells sticking out), 'razzi'
// (wooden crate with a rocket on top). t: seconds, for the bob and the glint
const MUNC={piccole:{rgb:'255,214,74',r:'p9'},grosse:{rgb:'255,160,70',r:'rif'},cartucce:{rgb:'255,110,90',r:'cart'},razzi:{rgb:'140,255,120',r:'razzo'}};
function cassaMun(tipo,x,y,t,sc){sc=sc||1;const M=MUNC[tipo],bob=Math.sin(t*3)*1.2;ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,0,8-bob*.4,2.8,0,0,TAU);ctx.fill();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(M.rgb,0,0,13,.28+.08*Math.sin(t*4),5);ctx.restore()}
  ctx.translate(0,-4.5+bob);ctx.lineJoin='round';
  for(const out of[true,false]){OUT=out;try{
    if(tipo==='razzi'){PB(-7,-3,7,3.4,.6,'legno',{dk:.6});if(!OUT){lines([[-6.6,-.2,6.6,-.2],[-6.6,1.6,6.6,1.6]],'rgba(60,28,10,.45)',.35);grain(-6.6,-2.6,6.6,3,2)}
      PB(-7.4,-3.6,-5.6,3.8,.4,'legno',{col:C.legno[2],hi:.3});PB(5.6,-3.6,7.4,3.8,.4,'legno',{col:C.legno[2],hi:.3});
      paint(()=>{ctx.beginPath();ctx.moveTo(-7,-3);ctx.lineTo(7,-3);ctx.lineTo(5.6,-5.2);ctx.lineTo(-5.6,-5.2);ctx.closePath()},[-7,-5.2,7,-3],'legno',{col:C.legno[2],colD:C.legno[1],hi:.5})}
    else if(tipo==='grosse'){PB(-6.4,-3,6.4,3.6,.9,'oliva',{dk:.62,gl:1});PB(-6.8,-3.6,6.8,-2,.6,'oliva',{col:C.oliva[2],hi:.6});PB(-4,.2,4,1.6,.2,'giallo',{lw:.8,hi:.2});
      const hdl=()=>{ctx.beginPath();ctx.moveTo(-2.6,-3.6);ctx.quadraticCurveTo(0,-6.4,2.6,-3.6)};if(OUT){hdl();ctx.strokeStyle=INK;ctx.lineWidth=.9+LO*2;ctx.stroke()}else{hdl();ctx.strokeStyle=INK;ctx.lineWidth=1.7;ctx.stroke();hdl();ctx.strokeStyle=C.nero[2];ctx.lineWidth=.9;ctx.stroke()}}
    else if(tipo==='cartucce'){for(let i=0;i<4;i++){const xx=-4.2+i*2.8;PB(xx-1,-6.2-(i%2)*.8,xx+1,-2,.45,'rosso',{lw:.8,hi:.5});PB(xx-1.05,-2.8,xx+1.05,-1.9,.2,'ottone',{lw:.7,hi:.3})}
      PB(-6.2,-3,6.2,3.6,.6,'rosso',{dk:.6,col:'#e8e0cc',colD:'#b8ab8c',colL:'#fff8e8'});PB(-6.2,-.6,6.2,1.4,.2,'rosso',{lw:.8,hi:.2})}
    else{PB(-5.8,-3,5.8,3.6,.6,'giallo',{dk:.6});PB(-6.2,-3.7,6.2,-2.1,.5,'giallo',{col:C.giallo[2],hi:.5});PB(-5.8,.1,5.8,1.5,.2,'rosso',{lw:.8,hi:.2})}
  }finally{OUT=false}}
  // the round painted on the side, and a glint sweeping over the box now and then
  if(tipo!=='razzi'&&tipo!=='cartucce')munizione(M.r,0,1.1+(tipo==='grosse'?-.3:0),.62,0);if(tipo==='razzi')munizione('razzo',.6,-6.3,.9,0);
  const gk=(t*.45)%1;if(gk<.25){ctx.save();rb(-6.6,-5.4,6.6,3.8,.8);ctx.clip();ctx.fillStyle=wa(1.4);ctx.beginPath();const gx=-10+gk/.25*20;ctx.moveTo(gx,-6);ctx.lineTo(gx+2.2,-6);ctx.lineTo(gx-1.2,4);ctx.lineTo(gx-3.4,4);ctx.closePath();ctx.fill();ctx.restore()}
  ctx.restore()}


// ------------------------------------------------------------------ sounds, made like the game's foley (fNoise, fThump, fModal, M, whoosh)
// A shot is a sharp crack of air, the body of the blast (a low thump and rumbling noise), the room answering, and the gun's own mechanics
// after it: the slide or the bolt, the pump, the belt; then the spent case ringing on the floor. Every call varies a little.
// what: 'sparo' (shot), 'ricarica' (the reload, timed on the animation), 'vuoto' (empty click), 'pompa' (the pump), 'cartuccia' (one shell
// pushed in), 'giri' (the machine gun spinning up), 'bossolo' (a case landing), 'esplosione' (the rocket's blast), 'presa' (ammo picked up).
// x: where it happens (for the left-right pan), dt: start this many seconds later (scheduled on the audio clock)
function crack(t,f,v){fNoise(t,.032,'bandpass',f,.7,v,{att:.0008});fNoise(t,.014,'highpass',5200,.7,v*.55,{att:.0005})}
function tail(t,d,v,rv){fNoise(t+.02,d,'lowpass',VR(900,.1),.7,v,{brown:true,f2:180,att:.012,rev:rv||.55})}
function case_(t,n,v,shell){for(let i=0;i<n;i++){const tt=t+i*.06+Math.random()*.05;
  if(shell){fThump(tt,VR(560,.12),300,.035,v*2.2);fNoise(tt,.03,'bandpass',VR(2000,.15),1.5,v*1.2);fThump(tt+VR(.13,.2),VR(640,.12),330,.025,v*1.2)}
  else{fModal(tt,VR(4300,.08),[1,2.71,4.05],[.13,.08,.05],v,.15);fModal(tt+VR(.11,.25),VR(4600,.08),[1,2.71],[.07,.05],v*.6,.1)}}}
function clack(t,f,v,len){M.metal(t,v,VR(Math.min(f,2300),.04),len||.2);fNoise(t,.02,'highpass',3800,.7,v*.25)}
function suono(id,what,x,dt){if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.005+(dt||0),D=DATI[id]||{},R=D.rel||1;AU.pan=x==null?0:cl((x-180)/200,-.7,.7);
  try{if(what==='vuoto'){clack(t,2600,.7,.07);fThump(t,300,200,.02,.18)}
  else if(what==='bossolo'){case_(t,1,id==='pompa'||id==='tattica'?.05:.04,id==='pompa'||id==='tattica')}
  else if(what==='presa'){fNoise(t,.05,'bandpass',1800,1.2,.18);for(let i=0;i<5;i++)fModal(t+.03+i*.035,VR(3800,.12),[1,2.7],[.06,.04],.03,.1);vBell(null,t+.08,88,.7,.05);vBell(null,t+.15,93,.8,.04)}
  else if(what==='esplosione'){fThump(t,VR(62,.05),26,1.1,1,.4);fNoise(t,1.2,'lowpass',1400,.8,.7,{brown:true,f2:70,rev:.45});fNoise(t,.1,'bandpass',2200,.8,.4);fNoise(t,.5,'lowpass',700,.8,.4,{brown:true,f2:90,rev:.3});
    for(let i=0;i<10;i++)fNoise(t+.12+Math.random()*.7,.04,'lowpass',VR(1500,.3),.8,.12*(1-i/12),{brown:true})}
  else if(what==='giri'){const c=AU.ctx,o=osc('sawtooth',90,t,t+.6),bp=filt('bandpass',700,3),g=c.createGain();o.frequency.exponentialRampToValueAtTime(420,t+.45);bp.frequency.exponentialRampToValueAtTime(2200,t+.45);
    o.connect(bp);bp.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.08,t+.15);g.gain.exponentialRampToValueAtTime(.0005,t+.58);route(g,null,.1);clack(t,800,.3,.2)}
  else if(what==='pompa'){const f=id==='tattica';fNoise(t,.08,'bandpass',VR(f?2200:1700,.08),1.2,.2,{f2:f?1100:850});
    if(!f)M.wood(t,.55,VR(300,.05));clack(t+.005,f?1300:900,.45,.2);const t2=t+(D.pump||.3)*.55;clack(t2,f?1500:1100,.62,.25);fThump(t2,180,90,.05,.25);if(!f)M.wood(t2,.45,VR(340,.05));
    case_(t+(D.pump||.3)*.5+.3,1,.05,true)}
  else if(what==='cartuccia'){fNoise(t,.06,'bandpass',VR(1600,.1),1.2,.14,{f2:900});clack(t+.05,1500,.3,.1);fThump(t+.05,220,140,.03,.12)}
  else if(what==='ricarica'){
    if(id==='revolver'){clack(t+.05,2700,.34,.1);case_(t+.46,6,.03);for(let i=0;i<6;i++)clack(t+.7+i*.18,2100,.16,.06);clack(t+1.95,1500,.5,.25);for(let i=0;i<6;i++)clack(t+2.04+i*.03,2900,.09,.03)}
    else if(id==='pompa'||id==='tattica'){fNoise(t,.05,'bandpass',1400,1.2,.08)}
    else if(id==='lanciarazzi'){const s=t+.35;fNoise(s+.6,1.1,'bandpass',600,1,.18,{f2:1300,att:.3});clack(s+1.85,500,.6,.4);fThump(s+1.85,120,60,.1,.4);clack(s+2.05,1800,.38,.15)}
    else if(id==='mitragliatrice'){clack(t+.05,700,.5,.4);fNoise(t+.1,.25,'bandpass',900,2,.1,{f2:600});fThump(t+R*.3,140,70,.1,.35);M.metal(t+R*.3,.4,420,.5);
      clack(t+R*.74,650,.6,.3);fThump(t+R*.74,150,70,.08,.35);for(let i=0;i<6;i++)clack(t+R*.8+i*.09,3200,.12,.05);clack(t+R*.98,1600,.55,.25);fNoise(t+R*.98,.05,'bandpass',2500,1.2,.15)}
    else{clack(t+.02,1300,.32,.15);fNoise(t+.03,.07,'bandpass',VR(2500,.1),1.4,.12,{f2:1500});
      fThump(t+R*.38,VR(260,.05),140,.05,.2);M.metal(t+R*.38,.3,VR(id==='pistola'?900:700,.05),.3);
      fThump(t+R*.73,VR(220,.05),110,.04,.25);clack(t+R*.73,1000,.48,.2);clack(t+R*.86,id==='pistola'?2200:1800,.58,.25);fNoise(t+R*.86,.04,'highpass',3500,.7,.15)}}
  else if(what==='sparo'){
    if(id==='pistola'){crack(t,VR(2600,.08),.75);fThump(t,VR(170,.06),60,.1,.85,.15);fNoise(t,.14,'lowpass',2200,.8,.45,{brown:true,f2:400});tail(t,.35,.12);clack(t+.045,2300,.42,.18)}
    else if(id==='revolver'){crack(t,VR(1900,.06),.9);fThump(t,VR(118,.05),42,.3,1.1,.3);fNoise(t,.32,'lowpass',1400,.8,.62,{brown:true,f2:170,rev:.35});tail(t,.75,.2,.7);M.metal(t+.01,.28,VR(1500,.05),.6);clack(t+.26,2800,.22,.12)}
    else if(id==='mitraglietta'){crack(t,VR(3600,.1),.5);fThump(t,VR(230,.08),95,.055,.55);fNoise(t,.06,'bandpass',VR(1200,.1),1,.3);clack(t+.02,3000,.2,.1)}
    else if(id==='mitra'){crack(t,VR(2900,.08),.56);fThump(t,VR(150,.06),55,.11,.75,.2);fNoise(t,.12,'bandpass',VR(900,.08),.9,.45);tail(t,.28,.1);clack(t+.03,1700,.25,.15)}
    else if(id==='mitragliatrice'){crack(t,VR(2400,.08),.6);fThump(t,VR(115,.05),40,.12,.9,.2);fNoise(t,.12,'lowpass',1500,.8,.5,{brown:true,f2:160});tail(t,.25,.08);fNoise(t+.02,.03,'bandpass',VR(4200,.2),2,.06);clack(t+.03,3400,.12,.08)}
    else if(id==='pompa'||id==='tattica'){const f=id==='tattica';crack(t,VR(f?1800:1500,.06),.75);fThump(t,VR(f?110:95,.05),34,f?.3:.38,1,.35);fNoise(t,f?.36:.45,'lowpass',f?1500:1200,.8,.75,{brown:true,f2:110,rev:.4});
      fNoise(t,.08,'bandpass',600,.8,.4);tail(t,f?.7:.9,.22,.7)}
    else if(id==='lanciarazzi'){fThump(t,VR(80,.05),30,.4,.9,.3);whoosh(t,.35,500,3200,.45,.2);fNoise(t,.12,'bandpass',900,.8,.5);fNoise(t+.05,.9,'highpass',2500,.7,.18,{f2:6000,att:.05,rev:.3});
      fNoise(t+.05,1,'lowpass',500,.8,.3,{brown:true,f2:200,att:.08})}}}catch(e){}
  AU.pan=0}
// the machine gun's motor while the barrels turn: one humming voice for each gun, its pitch following how fast they spin (call every frame)
function motore(g,x){if(typeof AU==='undefined'||!AU.ctx)return;const c=AU.ctx,on=AU.on.sfx&&g.spinV>.01;
  if(on&&!g.mot){try{const o=c.createOscillator(),o2=c.createOscillator(),bp=filt('bandpass',900,2.5),gg=c.createGain();o.type='sawtooth';o2.type='square';o2.detune.value=702;
      gg.gain.value=.0001;o.connect(bp);o2.connect(bp);bp.connect(gg);route(gg,null,.08);o.start();o2.start();g.mot={o,o2,bp,gg}}catch(e){}}
  if(!g.mot)return;const t=c.currentTime,v=on?g.spinV:0;g.mot.o.frequency.setTargetAtTime(60+v*240,t,.05);g.mot.o2.frequency.setTargetAtTime(30+v*120,t,.05);g.mot.bp.frequency.setTargetAtTime(500+v*1700,t,.05);
  g.mot.gg.gain.setTargetAtTime(.0001+v*.05,t,.06);if(!on){const m=g.mot;g.mot=null;try{m.gg.gain.setTargetAtTime(.0001,t,.08);m.o.stop(t+.5);m.o2.stop(t+.5)}catch(e){}}}

// ------------------------------------------------------------------ LA BARA DELLE SORPRESE
// A coffin chained shut, with a living skull for a padlock. You pay: the coins fly into the skull's mouth and it chews them, laughs
// and lets the chain fall, the lid bursts open on a green light, and a bony hand comes out juggling the guns (each swap in a puff of
// green smoke, quick at first, then slower and slower) until it offers you one. Sometimes the hand comes out empty: it waves goodbye,
// the skull laughs and spits your coins back, the lid slams shut and the coffin sinks into the ground, to come out somewhere else.
// Drawn in the game's view (the floor squashed to .55, heights straight up), painted like the guns and the Zombie della lanterna.
// nuovaBara(x,y) -> b: b.paga(px,py,current gun) starts it (the coins fly from px,py); b.prendi() takes the gun it offers;
// b.update(dt) returns what happened: {k:'suono',w} {k:'offerta',id} {k:'presa',id,x,y} (the gun leaves from x,y) {k:'rimborso',n}
// {k:'via'} (sunk) {k:'qui',x,y} (came out again at x,y); b.draw(); b.vicino(px,py).
// Times in seconds and how often each gun comes out (values to tune by playing). vuota: how often the hand comes out empty; never in
// the first `prime` openings, so nobody loses their coins right away
const BARA={prezzo:750,paga:.8,apre:.95,gira:3.4,offre:8,prende:.6,chiude:.8,scappa:3.5,sotto:1.8,sale:1.3,colpi:13,
  peso:{pistola:14,revolver:13,mitraglietta:14,pompa:13,mitra:10,tattica:10,mitragliatrice:7,lanciarazzi:4},vuota:.12,prime:2};
const BS=1.9,BH=[[16,4.2],[9,6.6],[-17,3.8],[-17,-3.8],[9,-6.6],[16,-4.2]],HB=6,HL=1.6,YAW=.3,CY=Math.cos(YAW),SY=Math.sin(YAW),LIDA=1.75;
const bsc=(p,k)=>p.map(q=>[q[0]*k,q[1]*k]),BL=bsc(BH,1.05),BI=bsc(BH,.86),BP=bsc(BH,.72);
const WOOD=['#3a1c13','#6b3524','#a35a3a'],WOODL=['#4a2416','#7d4129','#b86b45'],FERRO=['#22262c','#454c56','#7d8794'],FODERA=['#4a0f18','#7e1d2c','#b8414f'];
const GREEN='125,255,160';
// ---- the view: u along the coffin (its head at +u), v across (+ toward the camera), z up; the coffin is turned a little (YAW) so its
// head shows too
const PJ=(u,v,z)=>[u*CY-v*SY,(u*SY+v*CY)*.55-z];
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul3=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],nrm3=a=>mul3(a,1/(Math.hypot(a[0],a[1],a[2])||1));
const TOWARD=nrm3([SY,CY,.55]);
// turn p round the line through A along the unit axis k by angle f
function rot3(p,A,k,f){const d=sub3(p,A),c=Math.cos(f),s=Math.sin(f);return add3(A,add3(add3(mul3(d,c),mul3(cross3(k,d),s)),mul3(k,dot3(k,d)*(1-c))))}
const HA=[BL[3][0],BL[3][1],HB],HK=nrm3(sub3([BL[4][0],BL[4][1],HB],HA));
// the faces of a slab (an outline from z0 to z1), each with its outward normal; tf turns its points (the lid's hinge)
function slab(out,z0,z1,tf){const n=out.length,cu=out.reduce((a,p)=>a+p[0],0)/n,cv=out.reduce((a,p)=>a+p[1],0)/n,T=tf||(p=>p),F=[];
  const top=out.map(p=>T([p[0],p[1],z1])),bot=out.map(p=>T([p[0],p[1],z0]));
  F.push({k:'top',pts:top,n:nrm3(sub3(T([cu,cv,z1+1]),T([cu,cv,z1])))});F.push({k:'bot',pts:bot.slice().reverse(),n:mul3(F[0].n,-1)});
  for(let i=0;i<n;i++){const a=out[i],b=out[(i+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;let nu=b[1]-a[1],nv=-(b[0]-a[0]);if(nu*(mx-cu)+nv*(my-cv)<0){nu=-nu;nv=-nv}
    const q=nrm3([nu,nv,0]),c0=T([mx,my,(z0+z1)/2]),c1=T([mx+q[0],my+q[1],(z0+z1)/2]);F.push({k:'s'+i,i,pts:[bot[i],bot[(i+1)%n],top[(i+1)%n],top[i]],n:sub3(c1,c0)})}
  return F}
const seen=f=>dot3(f.n,TOWARD)>.02;
function ppath(pts,dz){ctx.beginPath();for(const p of pts){const q=PJ(p[0],p[1],p[2]+(dz||0));ctx.lineTo(q[0],q[1])}ctx.closePath()}
function pbox(pts,dz){let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const p of pts){const q=PJ(p[0],p[1],p[2]+(dz||0));a=Math.min(a,q[0]);b=Math.min(b,q[1]);c=Math.max(c,q[0]);d=Math.max(d,q[1])}return[a,b,c,d]}
// a face painted like a piece of the guns (its colour, darker low, a warm light high, the outline), with the colours given
function face(pts,cols,o,dz){o=Object.assign({col:cols[1],colD:cols[0],colL:cols[2]},o||{});paint(()=>ppath(pts,dz),pbox(pts,dz),'legno',o)}
// a line on a face, between two points of the face (planks, grain)
function fline(a,b,col,w,dz){if(OUT)return;const p=PJ(a[0],a[1],a[2]+(dz||0)),q=PJ(b[0],b[1],b[2]+(dz||0));ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';seg(p,q);ctx.stroke()}
const L3=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)];
// a little iron stud with its glint
function stud(p,r,dz){const q=PJ(p[0],p[1],p[2]+(dz||0));if(OUT){ctx.fillStyle=INK;ball(q,r+LO);ctx.fill();return}ctx.fillStyle=INK;ball(q,r+.32);ctx.fill();ctx.fillStyle=FERRO[1];ball(q,r);ctx.fill();ctx.fillStyle=wa(1.5);ball([q[0]-r*.35,q[1]-r*.35],r*.42);ctx.fill()}

// ---- the parts of the coffin
// the body: the inside when it is open (back wall, floor, green light), then the two walls that face the camera, with planks, nails,
// iron corners and brass handles
function baraDentro(a,dz){const F=slab(BI,1,HB);ctx.save();
  for(const f of F){if(f.k==='bot'||f.k==='top')continue;if(dot3(f.n,TOWARD)<-.02){face(f.pts,WOOD,{dk:.3,hi:.15,colD:'#24110b',col:'#3c1d12',colL:'#5a2c1a'},dz)}}
  face(F[1].pts.map(p=>[p[0],p[1],1]),WOOD,{dk:.2,hi:0,col:'#2a140d',colD:'#1d0d08',colL:'#3a1c12'},dz);
  if(!OUT&&a.light>0){ctx.save();ppath(BI.map(p=>[p[0],p[1],HB]),dz);ctx.clip();const c=PJ(0,-1.5,2+(dz||0));
    ctx.globalCompositeOperation='lighter';glow(GREEN,c[0],c[1],22,.55*a.light,9);glow('220,255,230',c[0],c[1]+1,10,.35*a.light,4);ctx.restore()}
  ctx.restore()}
function baraRim(dz){// the top of the walls round the opening (seen when the lid is open)
  paint(()=>{ctx.beginPath();for(const p of BH){const q=PJ(p[0],p[1],HB+(dz||0));ctx.lineTo(q[0],q[1])}ctx.closePath();for(let i=BI.length-1;i>=0;i--){const q=PJ(BI[i][0],BI[i][1],HB+(dz||0));i===BI.length-1?ctx.moveTo(q[0],q[1]):ctx.lineTo(q[0],q[1])}ctx.closePath()},
    pbox(BH.map(p=>[p[0],p[1],HB]),dz),'legno',{col:WOODL[1],colD:WOODL[0],colL:WOODL[2],dk:.85,hi:.5})}
function baraMuri(dz){const F=slab(BH,0,HB);
  for(const f of F){if(f.k==='top'||f.k==='bot'||!seen(f))continue;face(f.pts,WOOD,{dk:.62,hi:.45},dz);
    if(!OUT){const[b0,b1,t1,t0]=f.pts;for(const h of[.36,.7])fline(L3(b0,t0,h),L3(b1,t1,h),'rgba(20,8,4,.6)',.42,dz);
      for(let i=0;i<3;i++){const h=.18+i*.34;for(const e of[.04,.96]){const p=L3(L3(b0,b1,e),L3(t0,t1,e),h);const q=PJ(p[0],p[1],p[2]+(dz||0));ctx.fillStyle='rgba(20,8,4,.7)';ball(q,.32);ctx.fill();ctx.fillStyle=wa(1);ball([q[0]-.1,q[1]-.1],.13);ctx.fill()}}
      // wood grain
      ctx.save();ppath(f.pts,dz);ctx.clip();for(let i=0;i<4;i++){const h=.12+i*.22;const p=L3(b0,t0,h),q=L3(b1,t1,h+.04);fline(L3(p,q,.1),L3(p,q,.45),'rgba(255,200,160,.08)',.3,dz)}ctx.restore()}}
  // brass handles on the long wall: a plate and a ring hanging from it
  for(const k of[.16,.8]){const p=L3([BH[1][0],BH[1][1],0],[BH[2][0],BH[2][1],0],k),q=PJ(p[0],p[1]+.12,HB*.55+(dz||0));
    paint(()=>{ctx.beginPath();ctx.ellipse(q[0],q[1]-.4,1.1,.7,0,0,TAU)},[q[0]-1.1,q[1]-1.1,q[0]+1.1,q[1]+.3],'ottone',{hi:.4,lw:.9});
    const ring=()=>{ctx.beginPath();ctx.ellipse(q[0],q[1]+1.2,1.15,1.35,0,0,TAU)};if(OUT){ring();ctx.strokeStyle=INK;ctx.lineWidth=.55+LO*2;ctx.stroke()}else{ring();ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.stroke();ring();ctx.strokeStyle=C.ottone[1];ctx.lineWidth=.55;ctx.stroke();
      ctx.strokeStyle=C.ottone[2];ctx.lineWidth=.3;ctx.beginPath();ctx.ellipse(q[0],q[1]+1.2,1.15,1.35,0,3.4,4.6);ctx.stroke()}}}
// the lid: a slab with a raised panel and iron studs on top, a quilted purple lining underneath; f: how far it is open (radians)
function baraCoperchio(f,lift,dz){const T=p=>{const q=f?rot3(p,HA,HK,f):p;return[q[0],q[1],q[2]+lift]},F=slab(BL,HB,HB+HL,T),top=F[0],bot=F[1];
  for(const s of F){if(s.k==='top'||s.k==='bot'||!seen(s))continue;face(s.pts,WOODL,{dk:.55,hi:.5},dz)}
  if(seen(top)){face(top.pts,WOODL,{dk:.78,lt:.16,hi:.35},dz);
    const P=slab(BP,HB+HL,HB+HL+.7,T);for(const s of P){if(s.k==='bot'||!seen(s))continue;face(s.pts,WOODL,s.k==='top'?{dk:.8,lt:.2,hi:.4,col:'#86482d',colD:'#6b3524',colL:'#b06a44'}:{dk:.5,hi:.4},dz)}
    if(!OUT){const tp=P[0].pts;for(let i=0;i<3;i++){const h=.25+i*.25;fline(L3(tp[2],tp[3],h),L3(tp[1],tp[0],h),'rgba(20,8,4,.42)',.38,dz)}
      for(const p of top.pts)stud(L3(p,[0,0,p[2]],.07).map((v,i)=>i===2?p[2]+.1:v),.42,dz)}}
  else if(seen(bot)){face(bot.pts,FODERA,{dk:.7,lt:.2,hi:.3},dz);// the lining, quilted with buttons
    if(!OUT){ctx.save();ppath(bot.pts,dz);ctx.clip();const c=bot.pts.reduce((a,p)=>add3(a,mul3(p,1/bot.pts.length)),[0,0,0]);
      for(let i=-2;i<=2;i++)for(let j=-1;j<=1;j++){const p2=rot3([i*5.6,j*3,HB],HA,HK,f);const q=PJ(p2[0],p2[1],p2[2]+lift+(dz||0));ctx.fillStyle='rgba(30,4,8,.5)';ball([q[0]+.12,q[1]+.15],.62);ctx.fill();ctx.fillStyle=C.giallo[1];ball(q,.42);ctx.fill();ctx.fillStyle=C.giallo[2];ball([q[0]-.12,q[1]-.12],.18);ctx.fill()}
      ctx.restore()}}
  return F}
// the chain round the middle of the coffin: across the lid and down the front wall to the skull padlock and on to the ground.
// fall: 0 on, up to 1 fallen to the ground and gone; links fall one after the other
function catena(fall,lift,dz,seed){if(fall>=1)return;const u=-2,r=rnd(seed||11),pts=[],top=HB+HL+lift;
  const vF=lerp(BH[2][1],BH[1][1],(u-BH[2][0])/(BH[1][0]-BH[2][0])),vL=vF*1.05,vB=lerp(BL[3][1],BL[4][1],(u-BL[3][0])/(BL[4][0]-BL[3][0]));
  for(let i=0;i<=5;i++){const v=lerp(vB+.4,vL,i/5);pts.push([u,v,top+.15])}
  for(let i=1;i<=6;i++)pts.push([u-.12*i,vF+.2,lerp(top,0,i/6)]);
  const ground=PJ(u,vF+1.5,0)[1];
  for(let i=0;i<pts.length;i++){const p=pts[i],q=PJ(p[0],p[1],p[2]+(dz||0)),d=cl(fall*1.6-i*.04,0,1),gy=ground+(r()-.3)*2,yy=lerp(q[1],gy,d*d),xx=q[0]+(r()-.5)*3*d,a=1-cl((fall-.65)/.35,0,1);
    if(a<=0)continue;ctx.save();ctx.globalAlpha*=a;const flat=i%2===0,vertical=i>5;
    const lk=()=>{ctx.beginPath();if(flat)ctx.ellipse(xx,yy,vertical?.78:.95,vertical?.95:.62,0,0,TAU);else ctx.ellipse(xx,yy,vertical?.26:.95,vertical?.95:.26,0,0,TAU)};
    if(OUT){lk();ctx.strokeStyle=INK;ctx.lineWidth=(flat?.55:.5)+LO*.9;ctx.stroke()}else{lk();ctx.strokeStyle=C.acciaio[1];ctx.lineWidth=flat?.55:.5;ctx.stroke();if(flat){ctx.strokeStyle=C.acciaio[2];ctx.lineWidth=.24;ctx.beginPath();ctx.ellipse(xx,yy,.78,.5,0,3.5,4.9);ctx.stroke()}}
    ctx.restore()}}
// the skull padlock on the front wall: the shackle through the chain, the skull with glowing green eyes and a jaw that chews, laughs
// and spits. a: {jaw 0..1, eyes 0..1, shackle 0..1 (open), look -1..1, laugh 0..1, blink 0..1}
function teschio(x,y,a,t,s){s=s||1;ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineJoin='round';const jaw=a.jaw||0,lk=(a.look||0)*.45,sh=a.shackle||0,bl=a.blink||0;
  two(()=>{// shackle: a U of iron coming out of the top of the skull, through the chain; it pops up and turns when open
    const sh0=()=>{ctx.save();ctx.translate(1.15,-2.4-sh*1.1);ctx.rotate(-sh*.9);ctx.translate(-1.15,0);ctx.beginPath();ctx.moveTo(-1.15,0);ctx.lineTo(-1.15,-1.5);ctx.arc(0,-1.5,1.15,Math.PI,0);ctx.lineTo(1.15,0);ctx.restore()};
    if(OUT){sh0();ctx.strokeStyle=INK;ctx.lineWidth=.7+LO*2;ctx.stroke()}else{sh0();ctx.strokeStyle=FERRO[1];ctx.lineWidth=.7;ctx.stroke();sh0();ctx.strokeStyle=FERRO[2];ctx.lineWidth=.22;ctx.stroke()}
    // the jaw (under the skull), lower when open
    const jy=jaw*1.7;paint(()=>{ctx.beginPath();ctx.moveTo(-1.55,.8+jy);ctx.quadraticCurveTo(-1.6,2.4+jy,0,2.6+jy);ctx.quadraticCurveTo(1.6,2.4+jy,1.55,.8+jy);ctx.closePath()},[-1.6,.8+jy,1.6,2.6+jy],'osso',{dk:.55,hi:.3,lw:.9});
    if(!OUT){ctx.fillStyle='#2a1e14';for(let i=0;i<4;i++){const xx=-1.05+i*.7;ctx.fillRect(xx,.8+jy,.08,.55)}}
    // the skull
    paint(()=>{ctx.beginPath();ctx.moveTo(-1.7,1.1);ctx.quadraticCurveTo(-2.7,.4,-2.6,-1);ctx.quadraticCurveTo(-2.5,-3.1,0,-3.15);ctx.quadraticCurveTo(2.5,-3.1,2.6,-1);ctx.quadraticCurveTo(2.7,.4,1.7,1.1);ctx.quadraticCurveTo(0,1.6,-1.7,1.1);ctx.closePath()},[-2.7,-3.15,2.7,1.6],'osso',{dk:.68,hi:.7,gl:1});
    if(!OUT){// teeth on the upper jaw, cracks, the eye holes and the nose (the keyhole)
      ctx.fillStyle='#f6edd2';ctx.strokeStyle='rgba(40,30,20,.7)';ctx.lineWidth=.16;for(let i=0;i<4;i++){const xx=-1.2+i*.62;ctx.beginPath();ctx.rect(xx,.72,.56,.55);ctx.fill();ctx.stroke()}
      ctx.strokeStyle='rgba(90,70,40,.6)';ctx.lineWidth=.18;ctx.beginPath();ctx.moveTo(.9,-3);ctx.lineTo(.6,-2.4);ctx.lineTo(.95,-2);ctx.stroke();
      for(const sd of[-1,1]){ctx.fillStyle='#1a120c';ctx.beginPath();ctx.ellipse(sd*1.05+lk*.3,-1.05,.82,.9*(1-bl*.85)+.05,0,0,TAU);ctx.fill()}
      const ey=(a.eyes==null?.6:a.eyes);if(ey>0&&bl<.8){ctx.save();ctx.globalCompositeOperation='lighter';for(const sd of[-1,1])glow(GREEN,sd*1.05+lk*.5,-1.05,2.2+ey*1.6,.55*ey);ctx.restore();
        for(const sd of[-1,1]){ctx.fillStyle=`rgba(${GREEN},${.6+ey*.4})`;ball([sd*1.05+lk*.5,-1.05],.42*(1-bl));ctx.fill();ctx.fillStyle='#f2fff6';ball([sd*1.05+lk*.5-.12,-1.17],.15*(1-bl));ctx.fill()}}
      ctx.fillStyle='#1a120c';ctx.beginPath();ctx.moveTo(0,-.35);ctx.lineTo(-.38,.32);ctx.lineTo(.38,.32);ctx.closePath();ctx.fill()}});
  ctx.restore()}
// a candle with a green flame and its light; o: 0..1 lit
function candela(x,y,h,o,t,seed){const fl=Math.sin(t*9+seed)*.12+Math.sin(t*23+seed*2)*.06;
  two(()=>{PB(x-.85,y-h,x+.85,y,.4,'cera',{dk:.62,hi:.5,lw:.9});if(!OUT){ctx.fillStyle=C.cera[0];ctx.beginPath();ctx.ellipse(x+.3,y-h+.9,.32,.75,0,0,TAU);ctx.fill()}});
  if(o<=0)return;if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(GREEN,x,y-h-1.4,6.5,.42*o);ctx.restore()}
  ctx.save();ctx.translate(x,y-h-.15);ctx.scale(o,o*(1+fl));ctx.fillStyle=INK;ctx.beginPath();ctx.moveTo(0,-2.6);ctx.quadraticCurveTo(1.2,-1,.8,0);ctx.quadraticCurveTo(0,.6,-.8,0);ctx.quadraticCurveTo(-1.2,-1,0,-2.6);ctx.fill();
  ctx.fillStyle='#5dff8f';ctx.beginPath();ctx.moveTo(0,-2.2);ctx.quadraticCurveTo(.9,-.9,.55,-.1);ctx.quadraticCurveTo(0,.3,-.55,-.1);ctx.quadraticCurveTo(-.9,-.9,0,-2.2);ctx.fill();
  ctx.fillStyle='#e8fff0';ctx.beginPath();ctx.ellipse(0,-.55,.28,.5,0,0,TAU);ctx.fill();ctx.restore()}
// the bony arm coming out of the coffin: two forearm bones from inside up to the wrist at wx,wy (screen units of the coffin)
function avambraccio(wx,wy,bx,by){ctx.lineCap='round';for(const[w,c] of[[1.9+LO*1.4,INK],[1.15,C.osso[1]]])for(const o of[-.45,.45]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(bx+o,by);ctx.quadraticCurveTo(lerp(bx,wx,.5)+o*1.3,lerp(by,wy,.5),wx+o*.5,wy);ctx.stroke()}
  ctx.strokeStyle=wa(1.2);ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(bx-.6,by);ctx.quadraticCurveTo(lerp(bx,wx,.5)-.9,lerp(by,wy,.5),wx-.4,wy+.2);ctx.stroke();
  ink(1);ctx.fillStyle=C.osso[1];ball([wx,wy],1);ctx.fill();ctx.stroke()}
// an empty bony hand: open with the fingers spread (wave: it swings at the wrist), or closed with the thumb up
function manoOssa(x,y,ang,kind){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.lineCap='round';
  const bone=(pts,w)=>{for(const[lw,c] of[[w+LO*1.5,INK],[w,C.osso[1]]]){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()}};
  if(kind==='su'){for(let i=0;i<4;i++)bone([[-1.2+i*.05,-.9+i*.75],[.9,-1.1+i*.75],[1.1,-.2+i*.75]],.75);bone([[-.9,-1.4],[-1.1,-3.2],[-.9,-4.2]],.8)}
  else{for(let i=0;i<4;i++){const a=-1.95+i*.36;bone([[Math.cos(a)*1.2,Math.sin(a)*1.2],[Math.cos(a)*2.6,Math.sin(a)*2.6],[Math.cos(a+.05)*3.5,Math.sin(a+.05)*3.5]],.62)}bone([[-.9,.1],[-2.2,-.7],[-3,-1.5]],.7)}
  ink(1.1);ctx.fillStyle=C.osso[1];ctx.beginPath();ctx.ellipse(0,0,1.45,1.25,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=wa(1);ball([-.45,-.4],.45);ctx.fill();ctx.restore()}

const vFront=u=>lerp(BH[2][1],BH[1][1],(u-BH[2][0])/(BH[1][0]-BH[2][0])),TPOS=()=>PJ(-2,vFront(-2)+.3,HB-2.4);
// ---- the whole coffin for a pose `a` at x,y (the middle of its foot on the floor)
// a: {lid (open, radians), lift (the lid jumping), shake, sink 0..1, light 0..1, chain 0..1 (0 on, 1 fallen), skull {jaw,eyes,shackle,look,
// laugh,blink}, hand 0..1 (how far out), gun (id or null), pop 0..1 (a swap), offer 0..1, wave (angle), thumb, candles 0..1, hole 0..1}
function disegnaBara(x,y,a,t){const sk=Math.sin(t*61)*(a.shake||0)*.5,sink=a.sink||0,dz=-sink*17,hole=a.hole||0,mound=a.mound||0;
  ctx.save();ctx.translate(x+sk*BS,y);ctx.scale(BS,BS);ctx.lineJoin='round';ctx.lineCap='round';
  // the ground: a patch of dark earth (a hole when it sinks), its shadow
  const rim=bsc(BH,1.12);if(sink<1){ctx.fillStyle=`rgba(0,0,0,${.32*(1-sink)})`;ctx.beginPath();for(const p of bsc(BH,1.25)){const q=PJ(p[0],p[1]+1,0);ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fill()}
  // the earth put back where it went down: a low mound with a few stones, fading away
  if(mound>0){ctx.save();ctx.globalAlpha*=mound;const mp=bsc(BH,1.05);two(()=>{paint(()=>{ctx.beginPath();for(const p of mp){const q=PJ(p[0],p[1],0);ctx.lineTo(q[0],q[1]-1.2*Math.cos(p[1]/7))}ctx.closePath()},pbox(mp.map(p=>[p[0],p[1],1.4])),'legno',{col:'#5b3f27',colD:'#3f2a18',colL:'#7d5a3a',dk:.6,hi:.3})});
    if(!OUT){const r=rnd(5);for(let i=0;i<9;i++){const p=PJ((r()-.5)*28,(r()-.5)*7,.8);ctx.fillStyle=INK;ball(p,.75);ctx.fill();ctx.fillStyle=r()<.5?'#8a7a68':'#6b5a48';ball(p,.5);ctx.fill()}}ctx.restore()}
  if(sink>=1){ctx.restore();return}
  if(hole>0){ctx.save();ctx.globalAlpha*=hole;ctx.fillStyle='#24180f';ctx.beginPath();for(const p of rim){const q=PJ(p[0],p[1],0);ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fill();ctx.strokeStyle='#4a3420';ctx.lineWidth=1.2;ctx.stroke();ctx.restore()}
  // below the ground nothing shows: cut along the front of the hole
  if(a.sink>0){ctx.save();ctx.beginPath();const fr=[rim[2],rim[1],rim[0]].map(p=>PJ(p[0],p[1],0));ctx.moveTo(fr[0][0]-30,fr[0][1]);for(const q of fr)ctx.lineTo(q[0],q[1]);ctx.lineTo(fr[2][0]+30,fr[2][1]);ctx.lineTo(fr[2][0]+30,-120);ctx.lineTo(fr[0][0]-30,-120);ctx.closePath();ctx.clip()}
  else ctx.save();
  const cand=a.candles==null?1:a.candles;
  candela(PJ(18.4,-3.4,0)[0],PJ(18.4,-3.4,dz)[1],5.2,cand,t,1);
  const open=(a.lid||0)>.04;
  if(open){two(()=>baraDentro(a,dz));if(a.light>0&&!LOWFX&&!OUT){ctx.save();ctx.globalCompositeOperation='lighter';const c=PJ(0,-1,HB+dz);glow(GREEN,c[0],c[1]-4,26,.35*a.light,16);
      // soft rays fanning up out of the coffin, breathing
      for(let i=0;i<5;i++){const an=-Math.PI/2+(i-2)*.32+Math.sin(t*.9+i)*.05,L=22+6*Math.sin(t*1.7+i*1.3);ctx.fillStyle=`rgba(${GREEN},${.07*a.light})`;ctx.beginPath();ctx.moveTo(c[0]+(i-2)*2.6,c[1]);
        ctx.lineTo(c[0]+Math.cos(an-.07)*L,c[1]+Math.sin(an-.07)*L);ctx.lineTo(c[0]+Math.cos(an+.07)*L,c[1]+Math.sin(an+.07)*L);ctx.closePath();ctx.fill()}ctx.restore()}
    two(()=>baraCoperchio(a.lid,a.lift||0,dz));two(()=>baraRim(dz))}
  // the hand and what it holds, coming out of the coffin
  if(open&&a.hand>0){const hz=lerp(-3,15,eo(a.hand)),bob=Math.sin(t*2.2)*.5*a.hand,M=a.gun?G[a.gun]:null,pk=a.pop||0,sc=(.62+.12*(a.offer||0))*(1-pk*.35),
      mid=M?(M.len[0]+M.len[1])/2:0,wu=M?-mid*GS*sc:-1,w=PJ(wu,-.5,HB+hz+bob+dz),base=PJ(wu*.4-1.2,0,1+dz);
    ctx.save();avambraccio(w[0]-1.1,w[1]+1.3,base[0],base[1]);
    if(a.gun){const g=a.gun;
      ctx.save();ctx.translate(w[0],w[1]);ctx.rotate(Math.sin(t*1.9)*.06-.05);ctx.scale(sc,sc);
      if((a.offer||0)>0&&!OUT){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,240,190',mid*GS,-3,18+4*Math.sin(t*5),.35*a.offer);ctx.restore()}
      held(g,{hands:'ossa',oneHand:true,glow:1});ctx.restore()}
    else{ctx.save();ctx.translate(w[0],w[1]-.8);ctx.scale(1.5,1.5);manoOssa(0,0,a.wave||0,a.thumb?'su':'aperta');ctx.restore()}
    ctx.restore()}
  // the walls facing the camera, the closed lid, the chain, the padlock, the front candle
  two(()=>baraMuri(dz));
  if(!open)two(()=>baraCoperchio(0,a.lift||0,dz));
  if(open&&a.pop>0&&!OUT){const w=PJ(-1,-.5,HB+15+dz);for(let i=0;i<6;i++){const an=i/6*TAU+t,d=3+a.pop*-2;fumo(w[0]+Math.cos(an)*d*1.6,w[1]+Math.sin(an)*d,1-a.pop,3.2,false)}}
  catena(a.chain||0,a.lift||0,dz,7);
  const tl=TPOS();teschio(tl[0],tl[1]-dz,a.skull||{},t,1);
  candela(PJ(17.6,5.6,0)[0],PJ(17.6,5.6,dz)[1],4.4,cand,t,2);
  ctx.restore();ctx.restore()}

// ---- what it does
function scegliArma(not){const ids=ORDINE.filter(i=>i!==not);let tot=0;for(const i of ids)tot+=BARA.peso[i];let r=Math.random()*tot;for(const i of ids){r-=BARA.peso[i];if(r<=0)return i}return ids[0]}
// the times of the swaps: quick at first, slower and slower
const scatto=i=>BARA.gira*(.12+.88*(.3*i/BARA.colpi+.7*Math.pow(i/BARA.colpi,2.2)));
function nuovaBara(x,y){const b={x,y,st:'ferma',t:0,T:0,usi:0,gun:null,fin:null,vuota:false,coins:[],pk:0,tick:0,pay:null,next:null,
  vicino:(px,py)=>Math.hypot(px-b.x,(py-b.y)*1.3)<52,
  pronta:()=>b.st==='ferma',
  paga(px,py,cur){if(b.st!=='ferma')return false;b.st='paga';b.t=0;b.usi++;b.pay=[px,py];b.cur=cur;b.vuota=b.usi>BARA.prime&&Math.random()<BARA.vuota;b.fin=scegliArma(cur);b.tick=0;b.gun=null;
    b.coins=[];for(let i=0;i<5;i++)b.coins.push({t:-i*.09,x0:px+(Math.random()-.5)*8,y0:py-14,eaten:false});return true},
  prendi(){if(b.st!=='offre')return null;b.st='prende';b.t=0;const id=b.gun;return id},
  forza(v){b.vuota=v},
  update(dt){const ev=[];b.t+=dt;b.T+=dt;const t=b.t,S=(w)=>ev.push({k:'suono',w});b.pk=Math.max(0,b.pk-dt*5);
    if(b.st==='ferma'){if(Math.floor((b.T-dt)/6.5)!==Math.floor(b.T/6.5)&&b.T>2)S('bussa')}
    else if(b.st==='paga'){for(const c of b.coins){c.t+=dt;if(c.t>=.42&&!c.eaten){c.eaten=true;S('moneta')}}if(t>=BARA.paga){b.st='apre';b.t=0;S('sblocca')}}
    else if(b.st==='apre'){if(t>=.32&&!b.lidS){b.lidS=1;S('coperchio')}if(t>=BARA.apre){b.st='gira';b.t=0;b.lidS=0;b.tick=0;b.gun=scegliArma(b.cur);b.pk=1}}
    else if(b.st==='gira'){while(b.tick<BARA.colpi&&t>=scatto(b.tick+1)){b.tick++;b.pk=1;S('scatto'+b.tick);b.gun=b.tick===BARA.colpi?(b.vuota?null:b.fin):scegliArma(b.gun)}
      if(t>=BARA.gira+.15){if(b.vuota){b.st='scappa';b.t=0;b.gun=null;S('risata')}else{b.st='offre';b.t=0;S('arma');ev.push({k:'offerta',id:b.gun})}}}
    else if(b.st==='offre'){if(t>=BARA.offre){b.st='chiude';b.t=0;b.gun=null;S('chiude')}}
    else if(b.st==='prende'){if(t<dt*1.5){ev.push({k:'presa',id:b.gun,x:b.x-2*BS,y:b.y-(HB+15)*BS});S('presa')}if(t>=BARA.prende){b.st='chiude';b.t=0;b.gun=null;S('chiude')}}
    else if(b.st==='chiude'){if(t>=BARA.chiude){b.st='ferma';b.t=0}}
    else if(b.st==='scappa'){if(t>=1.05&&!b.ref){b.ref=1;ev.push({k:'rimborso',n:BARA.prezzo});S('sputa')}if(t>=1.75&&!b.sl){b.sl=1;S('sbatte')}if(t>=2.05&&!b.sk){b.sk=1;S('sprofonda')}
      if(t>=BARA.scappa){b.st='sotto';b.t=0;b.ref=b.sl=b.sk=0;ev.push({k:'via'})}}
    else if(b.st==='sotto'){if(t>=BARA.sotto){b.st='sale';b.t=0;if(b.next){b.x=b.next[0];b.y=b.next[1]}S('sale');ev.push({k:'qui',x:b.x,y:b.y})}}
    else if(b.st==='sale'){if(t>=BARA.sale){b.st='ferma';b.t=0}}
    return ev},
  // everything that moves, from the state and the time in it
  posa(){const t=b.t,T=b.T,a={lid:0,lift:0,shake:0,sink:0,light:0,chain:0,hand:0,gun:null,pop:b.pk,offer:0,wave:0,thumb:false,candles:1,hole:0,
      skull:{jaw:0,eyes:.55+.15*Math.sin(T*2.3),shackle:0,look:Math.sin(T*.7)*.6,laugh:0,blink:(T%4.3)<.12?1:0}};const s=a.skull;
    if(b.st==='ferma'){const k=T%6.5;if(T>2)a.lift=(k<.12?bump(k/.12)*.9:0)+(k>.22&&k<.34?bump((k-.22)/.12)*.7:0);a.light=0}
    else if(b.st==='paga'){let open=0;for(const c of b.coins){const k=c.t/.42;if(k>.5&&k<1.35)open=Math.max(open,bump((k-.5)/.85))}s.jaw=open;s.eyes=.8;s.look=0}
    else if(b.st==='apre'){s.eyes=1;s.jaw=t<.35?bump(t/.35):0;s.shackle=eo(t/.25);a.chain=cl(t/.7,0,.98);a.lid=t<.3?Math.sin(t*60)*.03*cl(t/.15,0,1):LIDA*eo((t-.3)/.32)+Math.sin(cl((t-.62)/.33,0,1)*Math.PI*2)*.08*(t>.62?1:0);
      a.light=cl((t-.3)/.3,0,1);a.shake=t<.3?.6:0;a.lift=t<.3?Math.abs(Math.sin(t*40))*.4:0}
    else if(b.st==='gira'||b.st==='offre'||b.st==='prende'||b.st==='scappa'){a.lid=LIDA;a.light=1;a.chain=1;s.shackle=1;s.eyes=1;a.hand=1;a.gun=b.gun;
      if(b.st==='gira'){a.hand=cl(t/.35,0,1);s.look=Math.sin(t*9)*.8}
      if(b.st==='offre'){a.offer=cl(t/.3,0,1);a.hand=1-Math.max(0,(t-(BARA.offre-2.2))/2.2)*.85;s.look=0}
      if(b.st==='prende'){a.gun=null;a.thumb=true;a.hand=1-cl((t-.25)/.35,0,1)}
      if(b.st==='scappa'){a.gun=null;a.wave=t<1.6?Math.sin(t*11)*.45:0;a.hand=t<1.5?1:1-cl((t-1.5)/.25,0,1);s.laugh=1;s.jaw=t<2.6?.35+.35*Math.abs(Math.sin(t*14)):0;
        if(t>1.6){const k=cl((t-1.6)/.18,0,1);a.lid=LIDA*(1-k*k);a.light=1-k}a.shake=t>1.8&&t<3.3?.9:0;a.sink=ez(cl((t-2.05)/1.3,0,1));a.hole=cl((t-1.9)/.3,0,1);a.candles=1-cl((t-1.9)/.4,0,1);
        if(t>1.78){a.chain=1-cl((t-1.78)/.2,0,1);s.shackle=1-cl((t-1.8)/.15,0,1)}}}
    else if(b.st==='chiude'){const k=cl(t/.4,0,1);a.lid=LIDA*(1-k*k);a.light=1-k;a.chain=1-cl((t-.45)/.3,0,1);s.shackle=1-cl((t-.6)/.15,0,1);s.eyes=1-.4*cl((t-.5)/.3,0,1)}
    else if(b.st==='sotto'){a.sink=1;a.hole=1-cl(t/.35,0,1);a.mound=1-cl((t-BARA.sotto+.5)/.5,0,1);a.candles=0}
    else if(b.st==='sale'){a.sink=1-eo(t/1);a.hole=1-cl((t-.9)/.4,0,1);a.shake=t<1?.7:0;a.candles=cl((t-.9)/.3,0,1)}
    return a},
  draw(){const a=b.posa();disegnaBara(b.x,b.y,a,b.T);
    // the coins flying in an arc into the skull's mouth
    const tp=TPOS(),m=[b.x+tp[0]*BS,b.y+(tp[1]+1.2)*BS];
    if(b.st==='paga')for(const c of b.coins){const k=c.t/.42;if(k<0||k>1)continue;const e=ez(k),px=lerp(c.x0,m[0],e),py=lerp(c.y0,m[1],e)-Math.sin(k*Math.PI)*30;moneta(px,py,1-k*.4,b.T*12+c.x0)}
    // the coins spat back
    if(b.st==='scappa'&&b.t>1.05&&b.t<1.75){const k=(b.t-1.05)/.7;for(let i=0;i<5;i++){const an=-Math.PI/2+(i-2)*.45,d=k*30;moneta(m[0]+Math.cos(an)*d,m[1]+Math.sin(an)*d*.7-Math.sin(k*Math.PI)*12,1-k*.3,b.T*14+i)}}
    // dirt flying when it sinks or comes out
    const dig=b.st==='scappa'&&b.t>2.05&&b.t<3.4?1:b.st==='sale'&&b.t<1.05?1:0;
    if(dig&&!LOWFX){const r=rnd(Math.floor(b.T*20));for(let i=0;i<5;i++){const u=(r()-.5)*34,px=b.x+u*BS,py=b.y+(r()*.5+.4)*7*BS,h=r()*14;ctx.fillStyle=INK;ctx.fillRect(px-1.4,py-h-1.4,2.8,2.8);ctx.fillStyle=r()<.5?'#6b4a2e':'#8a6440';ctx.fillRect(px-.9,py-h-.9,1.8,1.8)}
      for(let i=0;i<3;i++)fumo(b.x+(r()-.5)*50*BS*.5,b.y+r()*6*BS,(b.T*2+i/3)%1,10,false)}}};
  return b}
// a gold coin seen from the front, spinning (s: size)
function moneta(x,y,s,ph){const w=Math.abs(Math.cos(ph))*.85+.15;ctx.save();ctx.translate(x,y);ctx.scale(s*w,s);ctx.lineWidth=1.4/Math.max(.2,w);ctx.strokeStyle=INK;ctx.fillStyle=C.giallo[1];ctx.beginPath();ctx.arc(0,0,3.4,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=C.giallo[2];ctx.beginPath();ctx.arc(-.6,-.6,2,0,TAU);ctx.fill();ctx.fillStyle=C.giallo[0];ctx.fillRect(-.5,-1.6,1,3.2);ctx.restore()}

// ---- its sounds: a knock from inside, coins being chewed, the lock and the chain, the lid, the bone xylophone of the swaps (a little
// tune that climbs), the gun's bell, the skull's laugh, the slam, the earth swallowing it and giving it back
const PENTA=[57,60,62,64,67,69,72,74,76,79,81,84,86,88];
function risata(t,n,v){const c=AU.ctx;for(let i=0;i<n;i++){const s=t+i*.15,f0=VR(300-i*14,.04),o=osc('sawtooth',f0,s,s+.14),f1=filt('bandpass',VR(760,.05),5),f2=filt('bandpass',VR(1180,.05),6),g=c.createGain();
  o.frequency.setValueAtTime(f0,s);o.frequency.exponentialRampToValueAtTime(f0*.78,s+.11);o.connect(f1);o.connect(f2);f1.connect(g);f2.connect(g);g.gain.setValueAtTime(.0001,s);g.gain.linearRampToValueAtTime(v,s+.015);g.gain.exponentialRampToValueAtTime(.0005,s+.12);route(g,null,.25);
  M.bone(s+.01,.5,VR(1300,.1))}}
function suonoBara(w,x,dt){if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.005+(dt||0);AU.pan=x==null?0:cl((x-180)/200,-.7,.7);
  try{if(w==='bussa'){M.wood(t,1.3,VR(170,.05));fThump(t,110,70,.12,.5,.2);M.wood(t+.22,1,VR(190,.05));fThump(t+.22,120,75,.1,.4,.2)}
  else if(w==='moneta'){coinClink(t,1.1);M.bone(t+.06,.8,VR(950,.1));fThump(t+.06,200,120,.05,.2)}
  else if(w==='sblocca'){clack(t,1800,.7,.15);M.metal(t+.03,.5,1500,.3);for(let i=0;i<9;i++)fModal(t+.12+i*.055+Math.random()*.03,VR(2600,.15),[1,2.4,4.1],[.08,.05,.03],.05,.2);fThump(t+.62,160,90,.08,.25)}
  else if(w==='coperchio'){fNoise(t,.28,'bandpass',300,8,.25,{f2:900});fThump(t+.22,120,58,.22,.65,.3);M.wood(t+.22,1.2,150);whoosh(t+.18,.55,400,2600,.28,.4);
    vChoir(null,t+.22,[69,72,76],1.3,.07);for(let i=0;i<5;i++)vBell(null,t+.3+i*.07,PENTA[8+i],.6,.03)}
  else if(w.startsWith('scatto')){const i=+w.slice(6),n=PENTA[Math.min(PENTA.length-1,i)];fModal(t,mtof(n),[1,3.9,9.2],[.2,.07,.03],.16,.25);fNoise(t,.07,'bandpass',VR(1300,.1),1.2,.08,{f2:500})}
  else if(w==='arma'){vBell(null,t,84,1.3,.1);vBell(null,t+.09,88,1.1,.08);vBell(null,t+.18,91,1,.06);for(let i=0;i<6;i++)fModal(t+.05+i*.06,VR(5200,.1),[1,2.3],[.08,.05],.03,.4)}
  else if(w==='presa'){whoosh(t,.3,700,3200,.25,.2);coinClink(t+.25,.8);vBell(null,t+.27,91,.6,.05)}
  else if(w==='chiude'){fThump(t+.32,130,70,.12,.5,.2);M.wood(t+.32,1,180);for(let i=0;i<5;i++)fModal(t+.5+i*.05,VR(2500,.15),[1,2.4],[.06,.04],.04,.2);clack(t+.66,1600,.45,.12)}
  else if(w==='risata'){risata(t+.15,7,.16)}
  else if(w==='sputa'){fNoise(t,.12,'bandpass',900,2,.2,{f2:400});for(let i=0;i<5;i++)coinClink(t+.05+i*.06,.7)}
  else if(w==='sbatte'){fThump(t,95,50,.3,.9,.35);M.wood(t,1.5,140);fNoise(t,.2,'lowpass',800,.7,.4,{brown:true})}
  else if(w==='sprofonda'){fNoise(t,1.5,'lowpass',260,.7,.6,{brown:true,att:.2});for(let i=0;i<7;i++)M.stone(t+.1+i*.18+Math.random()*.08,.5);fNoise(t,.9,'bandpass',220,6,.15,{f2:90,att:.1});risata(t+.5,4,.08)}
  else if(w==='sale'){fNoise(t,1.1,'lowpass',260,.7,.5,{brown:true,att:.15});for(let i=0;i<5;i++)M.stone(t+.05+i*.17,.45);fNoise(t+.4,.6,'bandpass',300,7,.15,{f2:700});fThump(t+1,120,60,.15,.5);M.wood(t+1,1,160)}}catch(e){}
  AU.pan=0}
return{G,DATI,ORDINE,RAR,held,arma,punti,inMano,inManoPunti,manoPos,pt,espelliCar,caricatore,vampa,nuova,colpo,razzo,fumo,bossolo,esplosione,scintille,FX,fxAdd,fxUpdate,fxDraw,espelli,munizione,cassaMun,suono,motore,mix,wa,C,paint,rp,rb,poly,ball,seg,shine,rnd,cl,lerp,ez,eo,TAU,BARA,nuovaBara,disegnaBara,suonoBara,moneta,teschio}})();
