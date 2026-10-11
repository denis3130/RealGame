// =====================================================================
// MORTI DEI BOSS: ogni boss muore a modo suo (richiesta di Denis, piano maestro punto 7).
// Al colpo finale il boss viene fotografato una volta in un'immagine (snapBoss) e tolto dalla stanza; al suo posto resta
// un "corpo" (G.corpses) che recita la sua sequenza: il Golem si crepa e si sgretola in pezzi che cadono, la Strega si
// scioglie dai piedi in foglie e scintille, la Salamandra diventa cenere dalla coda, il Fabbro perde le piastre una a una,
// il Re Rospo si gonfia e scoppia, l'Idra affonda una testa alla volta, lo Yeti gela e va in frantumi, la Regina si spacca
// in schegge di cristallo, il Mimic perde il coperchio e sputa monete. La barra della vita si rompe e l'avviso «sconfitto»
// arrivano nel momento clou di ogni morte (bossBarDie, bossDown), e la stanza si chiude solo quando il corpo ha finito.
// Con LOWFX: stessi momenti, metà dei pezzi e delle particelle.
// =====================================================================
const BDEATH={
  golem:{dur:2.7,clou:.7,snd:'crumble'},witch:{dur:2.5,clou:.55,snd:'bloom'},salamander:{dur:2.6,clou:.55,snd:'ignite'},smith:{dur:2.7,clou:.5,snd:'block'},
  toad:{dur:2.3,clou:.8,snd:'splash'},hydra:{dur:2.7,clou:.1,snd:'bubble'},yeti:{dur:2.6,clou:.85,snd:'icicles'},icequeen:{dur:2.5,clou:.6,snd:'shimmer'},mimic:{dur:2.5,clou:.4,snd:'rock'}};
const corpseLeft=()=>{let m=0;for(const c of G.corpses||[])m=Math.max(m,c.dur-c.t);return m};
// a photo of the boss as it is now, drawn once; the feet are at (ox,oy) inside the picture
function snapBoss(e){const K=2,W=300,H=300,ox=150,oy=196,cv=document.createElement('canvas');cv.width=W*K;cv.height=H*K;
  const saved=ctx,ns=noShadow;ctx=cv.getContext('2d');noShadow=true;ctx.scale(K,K);ctx.translate(ox-e.x,oy-e.y);
  const keep={flash:e.flash,sq:e.sq,dead:e.dead,z:e.z};e.flash=0;e.sq=0;e.dead=false;if(e.z==null||isNaN(e.z))e.z=0;if(e.alpha==null)e.alpha=1;if(e.jump==null)e.jump=0;
  try{drawEnemy0(e)}catch(err){}finally{Object.assign(e,keep);noShadow=ns;ctx=saved}
  // the box of what was really drawn (sampled every 4 px)
  const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let x0=cv.width,y0=cv.height,x1=0,y1=0;
  for(let y=0;y<cv.height;y+=4)for(let x=0;x<cv.width;x+=4)if(d[(y*cv.width+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<x0){x0=ox*K-40;x1=ox*K+40;y0=oy*K-120;y1=oy*K}
  return{cv,K,ox:ox*K,oy:oy*K,bx:x0-4,by:y0-4,bw:x1-x0+8,bh:y1-y0+8}}
// ---- cutting the photo into pieces (polygons in picture pixels), each with its own little physics
function pieceOf(c,poly,o){let cx=0,cy=0;for(const p of poly){cx+=p[0];cy+=p[1]}cx/=poly.length;cy/=poly.length;
  // world position of the centroid: the picture is scaled 1/K around the feet
  const S=c.snap;return Object.assign({poly,cx,cy,x:c.x+(cx-S.ox)/S.K,y:c.y,z:(S.oy-cy)/S.K,vx:0,vy:0,vz:0,rot:0,vr:0,a:1,born:c.t,land:0},o||{})}
function cutGrid(c,nx,ny){const S=c.snap,P=[],J=[];for(let j=0;j<=ny;j++){J.push([]);for(let i=0;i<=nx;i++)J[j].push([S.bx+S.bw*i/nx+(i&&i<nx?rand(-.18,.18)*S.bw/nx:0),S.by+S.bh*j/ny+(j&&j<ny?rand(-.18,.18)*S.bh/ny:0)])}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)P.push(pieceOf(c,[J[j][i],J[j][i+1],J[j+1][i+1],J[j+1][i]]));return P}
function cutShards(c,n,inner){const S=c.snap,cx=S.bx+S.bw/2,cy=S.by+S.bh*.5,P=[],R=Math.hypot(S.bw,S.bh)*.6,ang=[];
  for(let i=0;i<n;i++)ang.push(i/n*TAU+rand(-.2,.2)*TAU/n);
  for(let i=0;i<n;i++){const a0=ang[i],a1=ang[(i+1)%n]+(i===n-1?TAU:0),o=[cx+Math.cos(a0)*R,cy+Math.sin(a0)*R],p=[cx+Math.cos(a1)*R,cy+Math.sin(a1)*R];
    if(inner){const m=rand(.35,.6),q=[cx+Math.cos(a0)*R*m,cy+Math.sin(a0)*R*m],r=[cx+Math.cos(a1)*R*m,cy+Math.sin(a1)*R*m];P.push(pieceOf(c,[[cx,cy],q,r]));P.push(pieceOf(c,[q,o,p,r]))}
    else P.push(pieceOf(c,[[cx,cy],o,p]))}
  return P}
function cutBands(c,n,vertical,from,to){const S=c.snap,P=[];from=from==null?0:from;to=to==null?1:to;
  for(let i=0;i<n;i++){const a=from+(to-from)*i/n,b=from+(to-from)*(i+1)/n;
    P.push(vertical?pieceOf(c,[[S.bx+S.bw*a,S.by],[S.bx+S.bw*b,S.by],[S.bx+S.bw*b,S.by+S.bh],[S.bx+S.bw*a,S.by+S.bh]]):pieceOf(c,[[S.bx,S.by+S.bh*a],[S.bx+S.bw,S.by+S.bh*a],[S.bx+S.bw,S.by+S.bh*b],[S.bx,S.by+S.bh*b]]))}
  return P}
const cutTop=(c,frac)=>cutBands(c,2,false,0,1).map((p,i)=>i?p:p)&&(()=>{const S=c.snap;return[pieceOf(c,[[S.bx,S.by],[S.bx+S.bw,S.by],[S.bx+S.bw,S.by+S.bh*frac],[S.bx,S.by+S.bh*frac]]),pieceOf(c,[[S.bx,S.by+S.bh*frac],[S.bx+S.bw,S.by+S.bh*frac],[S.bx+S.bw,S.by+S.bh],[S.bx,S.by+S.bh]])]})();
// scatter: every piece flies away from the centre (spd), jumps (vz) and spins
function scatter(P,c,spd,vz,spin){for(const p of P){const a=Math.atan2((p.y-p.z)-(c.y-c.snap.bh/c.snap.K*.5),p.x-c.x)||rand(0,TAU),s=rand(.5,1)*spd;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s*.5;p.vz=rand(.6,1.3)*vz;p.vr=rand(-spin,spin)}}
function tickPieces(c,dt,g,bounce){for(const p of c.pieces){if(p.hold>c.t)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=(p.g||g)*dt;p.rot+=p.vr*dt;
    if(p.z<=0&&p.vz<0){p.z=0;if(bounce&&Math.abs(p.vz)>40){p.vz*=-bounce;p.vx*=.6;p.vy*=.6;p.vr*=.5;p.land++;if(!LOWFX&&p.land<3)cpuff(c,p.x,p.y,3,'190,180,160')}else{p.vz=0;p.vx*=.8;p.vy*=.8;p.vr*=.7}}}}
function drawPiece(c,p,filter){const S=c.snap;if(p.a<=0)return;ctx.save();ctx.globalAlpha=p.a;ctx.translate(p.x,p.y-p.z);ctx.rotate(p.rot);ctx.scale(1/S.K,1/S.K);
  ctx.beginPath();p.poly.forEach((q,i)=>i?ctx.lineTo(q[0]-p.cx,q[1]-p.cy):ctx.moveTo(q[0]-p.cx,q[1]-p.cy));ctx.closePath();ctx.clip();
  if(filter&&HASF)ctx.filter=filter;ctx.drawImage(S.cv,-p.cx,-p.cy);ctx.restore()}
// the whole photo, with a clip in picture space (fn draws the clip path) and an optional filter / tint
function drawSnap(c,o){o=o||{};const S=c.snap;ctx.save();ctx.globalAlpha=o.a==null?1:o.a;ctx.translate(c.x+(o.dx||0),c.y+(o.dy||0));if(o.sx||o.sy)ctx.scale(o.sx||1,o.sy||1);ctx.scale(1/S.K,1/S.K);ctx.translate(-S.ox,-S.oy);
  if(o.clip){ctx.beginPath();o.clip(S);ctx.clip()}
  if(o.tint){let T=c._tint;if(!T){T=c._tint=document.createElement('canvas');T.width=S.cv.width;T.height=S.cv.height}const g=T.getContext('2d');g.clearRect(0,0,T.width,T.height);g.globalCompositeOperation='source-over';
    if(o.filter&&HASF)g.filter=o.filter;g.drawImage(S.cv,0,0);g.filter='none';g.globalCompositeOperation='source-atop';g.fillStyle=o.tint;g.fillRect(0,0,T.width,T.height);ctx.drawImage(T,0,0)}
  else{if(o.filter&&HASF)ctx.filter=o.filter;ctx.drawImage(S.cv,0,0)}ctx.restore()}
// ---- the corpse's own particles
function cpart(c,p){if(c.parts.length>(LOWFX?60:160))return;c.parts.push(Object.assign({t:0,life:.8,vx:0,vy:0,vz:0,g:0,r:3},p))}
function cpuff(c,x,y,n,col){for(let i=0;i<n;i++)cpart(c,{k:'puff',x:x+rand(-4,4),y:y+rand(-2,2),vx:rand(-30,30),vy:rand(-14,14),vz:rand(10,40),life:rand(.5,.9),r:rand(4,8),col})}
function tickParts(c,dt){for(let i=c.parts.length-1;i>=0;i--){const p=c.parts[i];p.t+=dt;if(p.t>=p.life){c.parts.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z=(p.z||0)+p.vz*dt;p.vz-=p.g*dt;if(p.sw)p.x+=Math.sin(p.t*p.sw+(p.ph||0))*22*dt;
    if(p.k==='coin'&&p.z<0){p.z=0;p.vz*=-.4;p.vx*=.7;if(Math.abs(p.vz)<20)p.vz=0}}}
function drawParts(c){for(const p of c.parts){const k=1-p.t/p.life,y=p.y-(p.z||0);
    switch(p.k){
      case 'puff':ctx.fillStyle=`rgba(${p.col||'190,180,160'},${.4*k})`;circ(p.x,y,p.r+(1-k)*6);ctx.fill();break;
      case 'ember':ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${k>.5?'255,170,60':'120,60,30'},${.9*k})`;circ(p.x,y,p.r*(.5+k*.5));ctx.fill();ctx.restore();break;
      case 'spark':ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${p.col||'190,255,160'},${k})`;circ(p.x,y,p.r*k+.6);ctx.fill();ctx.restore();break;
      case 'leaf':ctx.save();ctx.translate(p.x,y);ctx.rotate(p.t*4+(p.ph||0));ctx.globalAlpha=Math.min(1,k*2);ctx.fillStyle=p.col||'#6fbe4a';ctx.beginPath();ctx.ellipse(0,0,4,2,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(20,30,12,.6)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();break;
      case 'drop':ctx.fillStyle=p.col||'#7fd34a';ctx.beginPath();ctx.ellipse(p.x,y,p.r,p.r*1.3,0,0,TAU);ctx.fill();ink(1);ctx.stroke();break;
      case 'splat':ctx.fillStyle=`rgba(${p.col||'100,180,60'},${.55*k})`;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1.3-k*.3),p.r*.45,0,0,TAU);ctx.fill();break;
      case 'bubble':ctx.strokeStyle=`rgba(220,245,255,${.8*k})`;ctx.lineWidth=1.2;circ(p.x+Math.sin(p.t*6+(p.ph||0))*2,y,p.r);ctx.stroke();ctx.fillStyle=`rgba(255,255,255,${.5*k})`;circ(p.x-p.r*.3,y-p.r*.3,p.r*.25);ctx.fill();break;
      case 'ripple':ctx.strokeStyle=`rgba(190,230,240,${.7*k})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r+(1-k)*26,(p.r+(1-k)*26)*.38,0,0,TAU);ctx.stroke();break;
      case 'frost':ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(230,248,255,${k})`;ctx.lineWidth=1.2;const r=p.r*(1.3-k*.3);for(let i=0;i<3;i++){const a=i*Math.PI/3+(p.ph||0);ctx.beginPath();ctx.moveTo(p.x-Math.cos(a)*r,y-Math.sin(a)*r);ctx.lineTo(p.x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke()}ctx.restore();break;
      case 'ash':ctx.fillStyle=`rgba(${p.col||'70,62,58'},${.6*k})`;circ(p.x,y,p.r);ctx.fill();break;
      case 'coin':ctx.save();ctx.translate(p.x,y);ctx.scale(Math.abs(Math.cos(p.t*9+(p.ph||0)))*.7+.3,1);ctx.fillStyle='#ffd23c';circ(0,0,4);ctx.fill();ink(1.4);ctx.stroke();ctx.fillStyle='#b8860b';circ(0,0,1.6);ctx.fill();ctx.restore();break;
      case 'steam':ctx.fillStyle=`rgba(225,228,235,${.45*k})`;circ(p.x,y,p.r+(1-k)*9);ctx.fill();break}}}
// ---- the sequences. Every boss: setup(c) once, tick(c,dt) every frame, draw(c) in the room's draw order
const BDIE={
  golem:{setup(c){c.cracks=[];for(let i=0;i<6;i++){const a=rand(0,TAU),pts=[[c.x+rand(-6,6),c.y-rand(20,60)]];for(let k=0;k<4;k++){const q=pts[pts.length-1];pts.push([q[0]+Math.cos(a+rand(-.6,.6))*rand(8,16),q[1]+Math.sin(a+rand(-.6,.6))*rand(8,16)])}c.cracks.push(pts)}},
    tick(c,dt,D){if(c.t<D.clou){c.shake=2.5*(c.t/D.clou);if(!LOWFX&&Math.random()<.5)cpart(c,{k:'ember',x:c.x+rand(-24,24),y:c.y-rand(10,70),vz:rand(20,50),life:.5,r:1.8})}
      else if(!c.pieces){c.pieces=cutGrid(c,LOWFX?3:4,LOWFX?3:4);scatter(c.pieces,c,70,210,5);cpuff(c,c.x,c.y,LOWFX?6:14,'170,165,140');for(let i=0;i<(LOWFX?6:14);i++)cpart(c,{k:'ember',x:c.x+rand(-30,30),y:c.y-rand(0,60),vx:rand(-40,40),vz:rand(60,160),g:160,life:.8,r:2});shake(14);sfx('boom')}
      else{tickPieces(c,dt,560,.35);const f=1-Math.max(0,(c.t-D.dur+.7)/.7);for(const p of c.pieces)p.a=f}},
    draw(c,D){if(!c.pieces){const s=c.shake||0;drawSnap(c,{dx:Math.sin(c.t*70)*s,dy:Math.cos(c.t*53)*s*.4});const k=c.t/D.clou;ctx.save();ctx.lineCap='round';
        for(const pts of c.cracks){ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.strokeStyle=`rgba(255,150,40,${.9*k})`;ctx.lineWidth=3.5*k;ctx.globalCompositeOperation='lighter';ctx.stroke();ctx.globalCompositeOperation='source-over';ctx.strokeStyle=`rgba(20,14,10,${k})`;ctx.lineWidth=1.4;ctx.stroke()}ctx.restore()}
      else for(const p of c.pieces)drawPiece(c,p)}},
  witch:{setup(c){c.edge=1},
    tick(c,dt,D){if(c.t<D.clou){c.rise=(c.t/D.clou)*6}
      else{const k=Math.min(1,(c.t-D.clou)/1.3);c.edge=1-k;c.rise=6+k*10;
        if(k<1)for(let i=0;i<(LOWFX?1:3);i++){const S=c.snap,yy=c.y-c.rise-(S.oy-S.by-S.bh)/S.K-(S.bh/S.K)*k,xx=c.x+rand(-S.bw/S.K*.4,S.bw/S.K*.4);
          cpart(c,Math.random()<.5?{k:'leaf',x:xx,y:yy,vx:rand(-20,20),vz:rand(30,70),g:-20,sw:5,ph:rand(0,6),life:rand(.9,1.5),col:pk(['#6fbe4a','#3f8a2e','#a8d84a'])}:{k:'spark',x:xx,y:yy,vx:rand(-12,12),vz:rand(40,90),sw:7,ph:rand(0,6),life:rand(.5,1),r:2.4})}
        if(!c.hat&&k>=.82){c.hat=cutTop(c,.22)[0];c.hat.vz=70;c.hat.vr=3;c.hat.vx=rand(-20,20);c.pieces=[c.hat];sfx('magic')}
        if(c.pieces){tickPieces(c,dt,520,.3);const f=1-Math.max(0,(c.t-D.dur+.5)/.5);for(const p of c.pieces)p.a=f}}},
    draw(c,D){const S=c.snap,e=c.edge==null?1:c.edge;if(e>0){const top=S.by+S.bh*(1-e)*0;drawSnap(c,{dy:-(c.rise||0),clip:s=>{ctx.rect(s.bx-10,s.by-10,s.bw+20,(s.bh+10)*e+10*(e>0))},a:Math.min(1,e*3)});
        ctx.save();ctx.globalCompositeOperation='lighter';glow('120,255,150',c.x,c.y-(c.rise||0)-S.bh/S.K*.45,40+30*Math.sin(c.t*9),.3+.25*Math.min(1,c.t/D.clou));ctx.restore()}
      if(c.pieces)for(const p of c.pieces)drawPiece(c,p)}},
  salamander:{setup(c){c.dir=Math.cos(c.e.face||0)>=0?1:-1;c.sweep=0},
    tick(c,dt,D){if(c.t<D.clou){c.shake=2*(c.t/D.clou)}
      else{const k=Math.min(1,(c.t-D.clou)/1.25);c.sweep=k;const S=c.snap,x=c.x+((c.dir>0?S.bx+S.bw*(1-k):S.bx+S.bw*k)-S.ox)/S.K;
        if(k<1)for(let i=0;i<(LOWFX?1:3);i++)cpart(c,{k:'ember',x:x+rand(-4,4),y:c.y-rand(4,36),vx:rand(-10,10)+c.dir*-18,vz:rand(40,110),g:30,sw:4,ph:rand(0,6),life:rand(.6,1.1),r:rand(1.5,3)});
        if(k>=1){c.fall=Math.min(1,(c.fall||0)+dt/.7);if(!LOWFX&&Math.random()<.6)cpart(c,{k:'ash',x:c.x+rand(-S.bw/S.K/2,S.bw/S.K/2),y:c.y-rand(0,30),vz:rand(-30,-10),vx:rand(-8,8),life:.9,r:rand(2,4)})}}},
    draw(c,D){const S=c.snap,k=c.sweep||0,s=c.shake||0,dx=Math.sin(c.t*80)*s;if(c.t<D.clou){drawSnap(c,{dx});drawSnap(c,{dx,tint:`rgba(255,240,210,${.6*c.t/D.clou})`});return}
      const cut=c.dir>0?S.bx+S.bw*(1-k):S.bx+S.bw*k;// burnt side: ash; the other side: alive
      drawSnap(c,{clip:s=>{if(c.dir>0)ctx.rect(s.bx-10,s.by-10,cut-s.bx+10,s.bh+20);else ctx.rect(cut,s.by-10,s.bx+s.bw+10-cut,s.bh+20)}});
      drawSnap(c,{a:1-(c.fall||0),filter:'brightness(.28) saturate(.3)',clip:s=>{if(c.dir>0)ctx.rect(cut,s.by-10,s.bx+s.bw+10-cut,s.bh+20);else ctx.rect(s.bx-10,s.by-10,cut-s.bx+10,s.bh+20)},dy:(c.fall||0)*10,sy:1-(c.fall||0)*.5});
      if(k<1){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,140,40',c.x+(cut-S.ox)/S.K,c.y-20,26,.5);ctx.restore()}}},
  smith:{setup(c){c.bands=cutBands(c,6,false);c.bands.forEach((p,i)=>{p.hold=1e9;p.i=i});c.pieces=c.bands;c.next=0},
    tick(c,dt,D){if(c.t<D.clou){c.shake=2*(c.t/D.clou);if(!LOWFX&&Math.random()<.5)cpart(c,{k:'spark',x:c.x+rand(-20,20),y:c.y-rand(10,60),vx:rand(-60,60),vz:rand(20,90),g:300,life:.4,r:1.6,col:'255,230,160'})}
      else{const order=[0,1,2,3],idx=Math.floor((c.t-D.clou)/.2);while(c.next<4&&c.next<=idx){const p=c.bands[order[c.next]];p.hold=0;p.vx=rand(-60,60);p.vy=rand(-10,10);p.vz=rand(40,120);p.vr=rand(-4,4);sfx(c.next%2?'block':'rock');shake(3);c.next++}
        if(c.t>D.clou+1.1&&!c.core){c.core=true;for(const p of [c.bands[4],c.bands[5]]){p.hold=0;p.vz=20;p.vx=rand(-20,20);p.vr=rand(-1,1)}for(let i=0;i<(LOWFX?5:12);i++)cpart(c,{k:'steam',x:c.x+rand(-18,18),y:c.y-rand(0,30),vz:rand(30,70),vx:rand(-15,15),life:rand(.8,1.4),r:rand(4,8)});sfx('groan')}
        tickPieces(c,dt,620,.25);const f=1-Math.max(0,(c.t-D.dur+.6)/.6);for(const p of c.pieces)p.a=f}},
    draw(c,D){const s=c.shake||0;if(c.t<D.clou){drawSnap(c,{dx:Math.sin(c.t*90)*s});return}for(const p of c.pieces)drawPiece(c,p)}},
  toad:{setup(c){c.inf=1},
    tick(c,dt,D){if(c.t<D.clou){const k=c.t/D.clou;c.inf=1+k*.42+Math.sin(c.t*22)*.03*k}
      else if(!c.pop){c.pop=true;const S=c.snap;c.pieces=cutTop(c,.2).slice(0,1);c.pieces[0].vz=260;c.pieces[0].vr=6;c.pieces[0].vx=rand(-30,30);
        for(let i=0;i<(LOWFX?10:26);i++){const a=rand(0,TAU),s=rand(60,200);cpart(c,{k:'drop',x:c.x,y:c.y-30,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,vz:rand(60,220),g:520,life:rand(.5,.9),r:rand(2,4.5),col:pk(['#7fd34a','#5aa83a','#a8e86a'])})}
        for(let i=0;i<(LOWFX?4:10);i++)cpart(c,{k:'bubble',x:c.x+rand(-30,30),y:c.y-rand(10,50),vz:rand(30,70),ph:rand(0,6),life:rand(.8,1.5),r:rand(3,7)});
        for(let i=0;i<(LOWFX?4:9);i++)cpart(c,{k:'splat',x:c.x+rand(-50,50),y:c.y+rand(-10,16),life:1.4,r:rand(5,11)});
        fxPush({k:'ring2',x:c.x,y:c.y-20,rgb:'160,255,120',r0:10,r1:90,t:.4,max:.4,w:6});sfx('bubble');shake(8)}
      else{tickPieces(c,dt,560,.3);const f=1-Math.max(0,(c.t-D.dur+.5)/.5);for(const p of c.pieces)p.a=f}},
    draw(c,D){if(!c.pop){const k=c.t/D.clou;drawSnap(c,{sx:c.inf,sy:c.inf,tint:`rgba(140,230,80,${.35*k})`});return}for(const p of c.pieces)drawPiece(c,p)}},
  hydra:{setup(c){const S=c.snap;c.heads=cutBands(c,3,true,0,1);// three vertical strips, cut at the water line: the top part sinks, the body stays
      const line=S.by+S.bh*.55;c.heads=c.heads.map(p=>pieceOf(c,[[p.poly[0][0],S.by],[p.poly[1][0],S.by],[p.poly[1][0],line],[p.poly[0][0],line]]));c.body=pieceOf(c,[[S.bx,line],[S.bx+S.bw,line],[S.bx+S.bw,S.by+S.bh],[S.bx,S.by+S.bh]]);
      c.pieces=[...c.heads,c.body];c.order=[1,0,2];c.sunk=[0,0,0];c.bodyK=0;c.line=c.y-(S.oy-line)/S.K},
    tick(c,dt,D){for(let i=0;i<3;i++){const st=.1+i*.4,k=Math.min(1,Math.max(0,(c.t-st)/.55));if(k>0&&!c.sunk[i]){c.sunk[i]=1;sfx('bubble');const p=c.heads[c.order[i]];cpart(c,{k:'ripple',x:p.x,y:c.line,life:.8,r:6})}
        const p=c.heads[c.order[i]];p.sink=k;if(k>0&&k<1&&Math.random()<(LOWFX?.3:.7))cpart(c,{k:'bubble',x:p.x+rand(-8,8),y:c.line,vz:rand(20,50),ph:rand(0,6),life:rand(.5,1),r:rand(1.5,4)})}
      if(c.t>1.4){const k=Math.min(1,(c.t-1.4)/.8);if(!c.bodyK&&k>0){sfx('splash');for(let i=0;i<(LOWFX?6:14);i++)cpart(c,{k:'drop',x:c.x+rand(-30,30),y:c.line,vx:rand(-60,60),vy:rand(-20,20),vz:rand(80,200),g:520,life:.7,r:rand(2,4),col:'#5fc8d8'});cpart(c,{k:'ripple',x:c.x,y:c.line,life:1.2,r:16})}c.bodyK=k;
        if(k<1&&Math.random()<.5)cpart(c,{k:'bubble',x:c.x+rand(-24,24),y:c.line,vz:rand(20,50),ph:rand(0,6),life:rand(.5,1),r:rand(2,5)})}},
    draw(c,D){const S=c.snap,ground=c.y+(S.by+S.bh-S.oy)/S.K+2;// the heads slide down behind the body (clipped at the water line), then the body sinks into the floor
      for(const p of c.heads){const k=p.sink||0;ctx.save();ctx.beginPath();ctx.rect(c.x-200,c.y-400,400,c.line-(c.y-400));ctx.clip();ctx.translate(0,k*(S.bh*.55/S.K+6));ctx.globalAlpha=1-k*.15;drawPiece(c,p);ctx.restore()}
      {const k=c.bodyK||0;ctx.save();ctx.beginPath();ctx.rect(c.x-200,c.y-400,400,ground-(c.y-400));ctx.clip();ctx.translate(0,k*(S.bh*.45/S.K+10));ctx.globalAlpha=1-k*.3;drawPiece(c,c.body);ctx.restore()}}},
  yeti:{setup(c){c.frz=0},
    tick(c,dt,D){if(c.t<D.clou){c.frz=c.t/D.clou;c.shake=2.2*(1-c.frz);if(c.t<.1&&!c.snd){c.snd=1;sfx('freeze')}if(!LOWFX&&Math.random()<.6){const S=c.snap;cpart(c,{k:'frost',x:c.x+rand(-S.bw/S.K/2,S.bw/S.K/2),y:c.y-rand(0,S.bh/S.K),life:rand(.6,1.2),r:rand(2,4),ph:rand(0,3)})}}
      else if(!c.pieces){c.pieces=cutShards(c,LOWFX?6:10,!LOWFX);scatter(c.pieces,c,110,230,7);cpuff(c,c.x,c.y,LOWFX?6:14,'230,240,255');for(let i=0;i<(LOWFX?6:16);i++)cpart(c,{k:'frost',x:c.x+rand(-30,30),y:c.y-rand(0,60),vx:rand(-60,60),vz:rand(40,160),g:200,life:rand(.5,1),r:rand(2,4),ph:rand(0,3)});shake(12);sfx('boom')}
      else{tickPieces(c,dt,620,.2);const f=1-Math.max(0,(c.t-D.dur+.6)/.6);for(const p of c.pieces)p.a=f}},
    draw(c,D){if(!c.pieces){const s=c.shake||0,k=c.frz||0;drawSnap(c,{dx:Math.sin(c.t*75)*s,filter:k>0?`saturate(${1-k*.85}) brightness(${1+k*.18}) contrast(${1+k*.1})`:null});drawSnap(c,{dx:Math.sin(c.t*75)*s,tint:`rgba(150,205,255,${.42*k})`});return}
      for(const p of c.pieces)drawPiece(c,p,'saturate(.3) brightness(1.15)')}},
  icequeen:{setup(c){const S=c.snap;c.crk=[[S.bx+S.bw*.3,S.by],[S.bx+S.bw*.55,S.by+S.bh*.45],[S.bx+S.bw*.42,S.by+S.bh]]},
    tick(c,dt,D){if(c.t<D.clou){if(c.t<.1&&!c.snd){c.snd=1;sfx('shimmer')}}
      else if(!c.pieces){c.pieces=cutShards(c,LOWFX?8:14,!LOWFX);scatter(c.pieces,c,130,300,9);for(const p of c.pieces)p.g=170;for(let i=0;i<(LOWFX?8:20);i++)cpart(c,{k:'spark',x:c.x+rand(-30,30),y:c.y-rand(0,80),vx:rand(-50,50),vz:rand(30,120),g:60,life:rand(.5,1.1),r:2,col:'220,245,255'});
        fxPush({k:'ring2',x:c.x,y:c.y,rgb:'200,240,255',r0:8,r1:110,t:.5,max:.5,w:5});for(let i=0;i<(LOWFX?5:12);i++)cpart(c,{k:'frost',x:c.x+rand(-60,60),y:c.y+rand(-14,14),life:rand(1,1.8),r:rand(3,6),ph:rand(0,3)});shake(10);sfx('frost')}
      else{tickPieces(c,dt,170,0);const f=1-Math.max(0,(c.t-D.dur+.7)/.7);for(const p of c.pieces)p.a=f}},
    draw(c,D){if(!c.pieces){drawSnap(c);const k=c.t/D.clou,S=c.snap;ctx.save();ctx.translate(c.x,c.y);ctx.scale(1/S.K,1/S.K);ctx.translate(-S.ox,-S.oy);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(c.crk[0][0],c.crk[0][1]);const n=Math.min(1,k*1.2);ctx.lineTo(c.crk[0][0]+(c.crk[1][0]-c.crk[0][0])*Math.min(1,n*2),c.crk[0][1]+(c.crk[1][1]-c.crk[0][1])*Math.min(1,n*2));if(n>.5)ctx.lineTo(c.crk[1][0]+(c.crk[2][0]-c.crk[1][0])*(n-.5)*2,c.crk[1][1]+(c.crk[2][1]-c.crk[1][1])*(n-.5)*2);
        ctx.strokeStyle=`rgba(220,245,255,${.9*k})`;ctx.lineWidth=5*S.K*k;ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1.6*S.K;ctx.stroke();ctx.restore();return}
      for(const p of c.pieces)drawPiece(c,p,'brightness(1.2) saturate(.8)')}},
  mimic:{setup(c){const two=cutTop(c,.34);c.lid=two[0];c.body=two[1];c.lid.hold=1e9;c.pieces=[c.lid];c.sq=1},
    tick(c,dt,D){if(c.t<D.clou){c.shake=2*(c.t/D.clou)}
      else{if(!c.open){c.open=true;c.lid.hold=0;c.lid.vz=240;c.lid.vr=-7;c.lid.vx=rand(-50,-20);c.lid.vy=-20;sfx('click');shake(6)}
        if(c.t<D.clou+1.0&&Math.random()<(LOWFX?.35:.8))cpart(c,{k:'coin',x:c.x+rand(-14,14),y:c.y-20,vx:rand(-90,90),vy:rand(-30,30),vz:rand(120,300),g:560,ph:rand(0,6),life:rand(1.2,1.9)});
        if(c.t>D.clou+.1&&c.t<D.clou+.9&&Math.random()<.12)sfx('coin');
        if(c.t>D.clou+1.2){const k=Math.min(1,(c.t-D.clou-1.2)/.6);c.sq=1-k*.72;if(!c.thud&&k>.95){c.thud=true;sfx('rock');cpuff(c,c.x,c.y,LOWFX?5:10,'120,90,60')}}
        tickPieces(c,dt,560,.25);const f=1-Math.max(0,(c.t-D.dur+.5)/.5);c.lid.a=f;c.bodyA=f}},
    draw(c,D){const s=c.shake||0;if(!c.open){drawSnap(c,{dx:Math.sin(c.t*85)*s});return}
      ctx.save();ctx.globalAlpha=c.bodyA==null?1:c.bodyA;ctx.translate(c.x,c.y);ctx.scale(1,c.sq);ctx.translate(-c.x,-c.y);drawPiece(c,c.body);ctx.restore();drawPiece(c,c.lid)}}};
// ---- hooks: start a death, advance all corpses, draw them
function bossDie(e){const D=BDEATH[e.type];if(!D||LOWFX&&!BDIE[e.type]){bossDown(ET[e.type].name);bossBarDie(e.type);return}
  let snap;try{snap=snapBoss(e)}catch(err){bossDown(ET[e.type].name);bossBarDie(e.type);return}
  const c={type:e.type,e,x:e.x,y:e.y,t:0,dur:D.dur,snap,parts:[],pieces:null,clou:false};
  (G.corpses=G.corpses||[]).push(c);try{BDIE[e.type].setup(c)}catch(err){}
  fxPush({k:'flash',x:e.x,y:e.y-20,rgb:'255,235,180',r:55,t:.12,max:.12});fxPush({k:'ring2',x:e.x,y:e.y-10,rgb:'255,255,255',r0:10,r1:80,t:.3,max:.3,w:3});sfx('boom')}
function tickCorpses(dt){const L=G.corpses;if(!L||!L.length)return;const fin=G.mode!=='inf'&&G.room===ROOMS;
  for(let i=L.length-1;i>=0;i--){const c=L[i],D=BDEATH[c.type];c.t+=dt;
    if(!c.clou&&c.t>=D.clou){c.clou=true;bossDown(ET[c.type].name);bossBarDie(c.type);if(D.snd)sfx(D.snd);if(fin&&!G.winShown){G.winShown=true;setTimeout(()=>{if(G&&!G.ended)banner('Vittoria!','',2)},500)}}
    try{BDIE[c.type].tick(c,dt,D)}catch(err){}tickParts(c,dt);
    if(c.t>=c.dur)L.splice(i,1)}}
function drawCorpse(c){const D=BDEATH[c.type];shadow(c.x,c.y+6,30,10,.3*Math.max(0,1-c.t/c.dur));try{BDIE[c.type].draw(c,D)}catch(err){}drawParts(c)}
