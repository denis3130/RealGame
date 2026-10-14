// ---------- themed obstacles ----------
const KINDS={
  muschio:{big:['boulder','pillar','tomb'],small:['urn','gravestone','stump']},
  golem:{big:['pillar'],small:['pillar']},
  cristalli:{big:['crystal','pillar','boulder'],small:['crystal','brazier','skulls']},
  radici:{big:['stump','thorns'],small:['thorns','brazier']}};
const KH={boulder:.9,pillar:2.6,tomb:1.1,urn:1.1,gravestone:1.6,stump:.7,crystal:1.9,brazier:1.5,skulls:.5,thorns:.9};
function themeOf(room){if(G&&G.event&&room===G.room){const nz=zoneOf(room+1);if(!BOSSZ[nz])return nz;const z=zoneOf(room);return BOSSZ[z]?zoneOf(Math.max(1,room-1)):z}return zoneOf(room)}
function pickKind(th,r){const set=KINDS[th][r>=20?'big':'small'];return set[randi(0,set.length-1)]}
function stonePal(){const t=themeOf(G.room);if(isSwamp(t)||isIce(t))return stonePal3(t);return t==='cenere'||t==='magma'?{hi:'#6e6058',mid:'#4d423c',lo:'#2e2622',moss:'#e8641c'}:t==='forgia'||t==='fabbro'?{hi:'#8a8a92',mid:'#5f5f68',lo:'#3c3c44',moss:'#c9622a'}:t==='cristalli'?{hi:'#9aa3a6',mid:'#6f787a',lo:'#4a5254',moss:'#4f8f86'}:t==='radici'?{hi:'#8f8670',mid:'#6a6250',lo:'#4a4436',moss:'#5f8a34'}:{hi:'#a39684',mid:'#7d7262',lo:'#554c40',moss:'#6fa040'}}
function kH(k){return k.r*(KH[k.kind]||1)}
function lightPools(){
  if(G.prop){const c={fontana:'120,200,255',mercante:'255,200,120',altare:'190,120,255',tesoro:'255,210,90'}[G.prop.kind];glow(c,G.prop.x,G.prop.y-4,95,G.prop.used&&G.prop.kind!=='mercante'?.08:.26,60)}
  for(const k of G.rocks){
    if(k.kind==='crystal')glow('120,220,255',k.x,k.y-6,85,.2+.06*Math.sin(G.t*2+k.seed),60);
    else if(k.kind==='cauldron'||k.kind==='lavarock')glow('255,120,50',k.x,k.y-4,80,.2+.05*Math.sin(G.t*2+k.seed),55);
    else if(k.kind==='brazier')glow('255,160,70',k.x,k.y-4,95,.24+.015*Math.sin(G.t*2.7+k.seed*5)+.008*Math.sin(G.t*6.1+k.seed),70);
    else if(k.kind==='lantern')glow('200,255,120',k.x,k.y-4,85,.22+.05*Math.sin(G.t*3+k.seed),55);
  }
}
function vGrad(x0,x1,c0,c1,c2){const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,c0);g.addColorStop(.45,c1);g.addColorStop(1,c2);return g}
// obstacles wear out as you hit them: 3 stages, each material breaks its own way (stone cracks and chips, wood splinters, metal dents)
// --- worn obstacles: real pieces knocked off the silhouette, the missing pieces lying at the foot
const WEAR={c:document.createElement('canvas'),a:document.createElement('canvas')};
const wearSt=k=>k.kind==='crystal'||k.kind==='brazier'||k.kind==='lantern'||k.kind==='reeds'||k.temp?0:k.dmg>=12?3:k.dmg>=7?2:k.dmg>=3?1:0;
function wearBox(k){const r=k.r,H=kH(k);return{x0:k.x-r*2.4,y0:k.y-H-r*2.2,w:r*4.8,h:H+r*3.4}}
function wearBites(k,st){if(k.bSt===st&&k.bites)return k.bites;k.bSt=st;k.bites=[];
  const b=wearBox(k),S=2,c=WEAR.a;c.width=Math.ceil(b.w*S);c.height=Math.ceil(b.h*S);const o=c.getContext('2d',{willReadFrequently:true});o.setTransform(S,0,0,S,-b.x0*S,-b.y0*S);
  const keep=ctx,hit=k.hit;ctx=o;k.hit=0;k._raw=1;try{drawRock(k)}finally{ctx=keep;k.hit=hit;k._raw=0}
  const d=o.getImageData(0,0,c.width,c.height).data,W=c.width,Hh=c.height,A=(x,y)=>d[(y*W+x)*4+3]>140;
  let top=-1,bot=-1;for(let y=0;y<Hh&&top<0;y++)for(let x=0;x<W;x++)if(A(x,y)){top=y;break}
  for(let y=Hh-1;y>=0&&bot<0;y--)for(let x=0;x<W;x++)if(A(x,y)){bot=y;break}
  if(top<0)return k.bites;
  const row=f=>{const y=Math.round(top+(bot-top)*f);let l=-1,r=-1;for(let x=0;x<W;x++)if(A(x,y)){if(l<0)l=x;r=x}return{y,l,r}};
  const toW=(x,y)=>[x/S+b.x0-k.x,y/S+b.y0-k.y];
  const r0=row(.1),r1=row(.45),bh=(bot-top)/S,bw=(r1.r-r1.l)/S,q=Math.max(4.5,Math.min(bh,bw)*.33),sd=k.seed||1,Rn=i=>{const v=Math.sin(sd*12.9898+i*78.233)*43758.5453;return v-Math.floor(v)};
  let mx=-1;{const cx=Math.round((r0.l+r0.r)/2);for(let y=top;y<bot;y++)if(A(cx,y)){mx=y;break}}
  const left=Rn(1)<.5,TL={c:toW(r0.l,r0.y),dx:-1,dy:-1},TR={c:toW(r0.r,r0.y),dx:1,dy:-1},ML={c:toW(r1.l,r1.y),dx:-1,dy:0},MR={c:toW(r1.r,r1.y),dx:1,dy:0},TC={c:toW((r0.l+r0.r)/2,mx<0?top:mx),dx:0,dy:-1,big:1};
  const order=left?[TL,MR,TC,TR,ML]:[TR,ML,TC,TL,MR],n=st===1?1:st===2?2:4;
  for(let i=0;i<n;i++){const P0=order[i],qq=q*(P0.big?1.35:1)*(.9+Rn(i+5)*.3),cx=P0.c[0]+P0.dx*qq*.3,cy=P0.c[1]+P0.dy*qq*.3,pts=[],pc=[];
    for(let v=0;v<7;v++){const a=v/7*TAU+Rn(i*9+v)*.5,rr=qq*(.6+Rn(i*9+v+30)*.5);pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);pc.push([Math.cos(a)*rr*.5,Math.sin(a)*rr*.38])}
    const side=P0.dx||(Rn(i+60)<.5?-1:1),gx=side*(bw*.5+qq*.4+Rn(i+70)*k.r*.4),gy=k.r*(.25+Rn(i+80)*.35);
    k.bites.push({p:pts,piece:pc,gx,gy,rot:Rn(i+90)*TAU})}
  return k.bites}
function drawRockWorn(k,st){const bites=wearBites(k,st);if(!bites.length){k._raw=1;drawRock(k);k._raw=0;return}
  const b=wearBox(k),T=ctx.getTransform(),dx0=Math.floor(T.a*b.x0+T.c*b.y0+T.e),dy0=Math.floor(T.b*b.x0+T.d*b.y0+T.f),w=Math.ceil(b.w*Math.abs(T.a))+2,h=Math.ceil(b.h*Math.abs(T.d))+2;
  const S=stonePal(),wood=k.kind==='stump'||k.kind==='thorns',metal=k.kind==='anvil'||k.kind==='cauldron'||k.kind==='brazier',pal=k.kind==='thorns'?['#7bd65a','#4f8a34','#2f5a22']:wood?['#8a6a44','#6b4a2a','#4a3220']:metal?['#8a8a92','#5f5f68','#3c3c44']:[S.hi,S.mid,S.lo];
  const sx=k.x+(k.hit>0?Math.sin(G.t*90)*k.hit*14:0),sy=k.y;
  // the pieces that came off lie at the foot of the obstacle
  ctx.save();for(const bt of bites){ctx.save();ctx.translate(k.x+bt.gx,k.y+bt.gy);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,2,k.r*.32,k.r*.12,0,0,TAU);ctx.fill();ctx.rotate(bt.rot*.25);
    ctx.beginPath();bt.piece.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=pal[1];ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.lineJoin='round';ctx.fill();ctx.stroke();
    ctx.fillStyle=pal[0];ctx.beginPath();const p=bt.piece;ctx.moveTo(p[4][0]*.8,p[4][1]*.8);ctx.lineTo(p[5][0]*.8,p[5][1]*.8);ctx.lineTo(p[6][0]*.6,p[6][1]*.6);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.restore()}ctx.restore();
  if(w<4||h<4||w>2400||h>2400){k._raw=1;drawRock(k);k._raw=0;return}
  const c=WEAR.c;if(c.width<w)c.width=w;if(c.height<h)c.height=h;const o=c.getContext('2d');o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.globalAlpha=1;o.clearRect(0,0,w,h);
  o.setTransform(T.a,T.b,T.c,T.d,T.e-dx0,T.f-dy0);
  const keep=ctx;ctx=o;k._raw=1;try{drawRock(k)}finally{ctx=keep;k._raw=0}
  const path=()=>{o.beginPath();for(const bt of bites){bt.p.forEach((p,i)=>i?o.lineTo(sx+p[0],sy+p[1]):o.moveTo(sx+p[0],sy+p[1]));o.closePath()}};
  o.globalAlpha=1;o.globalCompositeOperation='destination-out';path();o.fillStyle='#000';o.fill();
  o.globalCompositeOperation='source-atop';o.lineJoin='round';path();
  o.strokeStyle=wood?'rgba(235,195,135,.45)':'rgba(0,0,0,.16)';o.lineWidth=9;o.stroke();// the broken face, a touch of depth
  o.strokeStyle=INK;o.lineWidth=5;o.stroke();
  o.globalCompositeOperation='source-over';
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(c,0,0,w,h,dx0,dy0,w,h);ctx.restore()}
function drawRock(k){
  if(!k._raw){const st=wearSt(k);if(st){drawRockWorn(k,st);return}}
  const fade=k.temp?Math.min(1,k.life/.6):1;ctx.globalAlpha=fade;ink(2.5);
  const S=stonePal(),x=k.x+(k.hit>0?Math.sin(G.t*90)*k.hit*14:0),y=k.y,r=k.r,sd=k.seed;
  switch(k.kind){
    case 'pillar':{
      const h=kH(k),w=r*1.3,broken=sd%2>1;
      ell(x,y,r*1.15,r*.5);fs(S.lo);ctx.beginPath();ctx.rect(x-r*1.15,y-7,r*2.3,7);fs(S.mid);ell(x,y-7,r*1.15,r*.5);fs(S.hi);
      ctx.beginPath();ctx.rect(x-w/2,y-7-h,w,h);ctx.fillStyle=vGrad(x-w/2,x+w/2,S.hi,S.mid,S.lo);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1.5;for(const f of [-.25,0,.25]){ctx.beginPath();ctx.moveTo(x+f*w,y-9);ctx.lineTo(x+f*w,y-5-h);ctx.stroke()}
      ink(2.5);const ty=y-7-h;
      if(broken){ctx.beginPath();ctx.moveTo(x-w/2,ty+4);for(let i=0;i<=6;i++){const px=x-w/2+w*i/6,py=ty+(i%2?-4:4)+Math.sin(sd*7+i)*3;ctx.lineTo(px,py)}ctx.lineTo(x+w/2,ty+8);ctx.lineTo(x-w/2,ty+8);ctx.closePath();fs(S.hi)}
      else{ctx.beginPath();ctx.rect(x-w*.7,ty-6,w*1.4,7);fs(S.mid);ell(x,ty-6,w*.7,r*.32);fs(S.hi)}
      ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+w*.15,ty+12);ctx.lineTo(x-w*.05,ty+22);ctx.lineTo(x+w*.1,ty+30);ctx.stroke();
      if(themeOf(G.room)==='cristalli'){ctx.fillStyle='rgba(120,220,255,.3)';ctx.fillRect(x-w/2+1,y-9-h*.55,w-2,7);ctx.fillStyle='rgba(160,235,255,.9)';ctx.fillRect(x-w/2+2,y-7-h*.55,w-4,3)}
      if(themeOf(G.room)==='golem'&&G.enemies.some(e=>e.p2)){ctx.strokeStyle='rgba(255,122,46,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-w*.2,y-12);ctx.lineTo(x,y-26);ctx.lineTo(x-w*.15,y-38);ctx.stroke()}
      break}
    case 'tomb':{
      const h=kH(k),d=10;
      ctx.beginPath();ctx.rect(x-r,y-h,r*2,h);ctx.fillStyle=vGrad(x-r,x+r,S.mid,S.mid,S.lo);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-r-2,y-h);ctx.lineTo(x+r+2,y-h);ctx.lineTo(x+r-3,y-h-d);ctx.lineTo(x-r+3,y-h-d);ctx.closePath();fs(S.hi);
      ctx.beginPath();ctx.rect(x-r-2,y-h-2,r*2+4,4);fs(S.mid);
      ink(2);circ(x,y-h*.5,5);fs(S.hi);ctx.fillStyle=INK;circ(x-1.8,y-h*.5-.5,1.3);ctx.fill();circ(x+1.8,y-h*.5-.5,1.3);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+r*.4,y-h-d+2);ctx.lineTo(x+r*.2,y-h-3);ctx.moveTo(x-r*.7,y-4);ctx.lineTo(x-r*.5,y-h+3);ctx.stroke();
      break}
    case 'urn':{
      const pot=(cx,cy,s)=>{ink(2.2);const h=s*1.5;
        ell(cx,cy-h*.45,s*.85,h*.5);ctx.fillStyle=vGrad(cx-s,cx+s,'#d08a58','#a8623a','#6e3e24');ctx.fill();ctx.stroke();
        ctx.beginPath();ctx.rect(cx-s*.38,cy-h*.98,s*.76,h*.18);fs('#9a5634');ell(cx,cy-h*.98,s*.5,s*.18);fs('#3a2216');
        ctx.strokeStyle='#f0c48a';ctx.lineWidth=1.6;ctx.beginPath();for(let i=0;i<=6;i++){const px=cx-s*.75+i*s*.25,py=cy-h*.48+(i%2?3:-1);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke()};
      pot(x-r*.25,y,r*.72);if(r>14)pot(x+r*.55,y+3,r*.45);
      break}
    case 'gravestone':{
      ell(x,y,r*1.05,r*.42);fs('#4a3b2c');const w=r*1.25,h=kH(k);
      ctx.beginPath();ctx.moveTo(x-w/2,y-2);ctx.lineTo(x-w/2,y-h+w/2);ctx.arc(x,y-h+w/2,w/2,Math.PI,0);ctx.lineTo(x+w/2,y-2);ctx.closePath();ctx.fillStyle=vGrad(x-w/2,x+w/2,S.hi,S.mid,S.lo);ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.6;for(const ly of [.45,.62,.76]){ctx.beginPath();ctx.moveTo(x-w*.28,y-h*ly);ctx.lineTo(x+w*.28,y-h*ly);ctx.stroke()}
      ctx.strokeStyle='#5f8a34';ctx.lineWidth=2;for(const gx of [-w*.6,w*.55,-w*.3]){ctx.beginPath();ctx.moveTo(x+gx,y);ctx.lineTo(x+gx-2,y-6);ctx.moveTo(x+gx,y);ctx.lineTo(x+gx+2,y-5);ctx.stroke()}
      break}
    case 'stump':{
      ctx.strokeStyle=INK;ctx.lineWidth=6;const roots=[[-1.3,.3],[1.3,.4],[-.6,.6],[.8,-.1]];
      for(const[rx,ry] of roots){ctx.beginPath();ctx.moveTo(x,y-4);ctx.quadraticCurveTo(x+rx*r*.7,y+ry*r*.2,x+rx*r,y+ry*r*.4);ctx.stroke()}
      ctx.strokeStyle='#6b4a2a';ctx.lineWidth=3;for(const[rx,ry] of roots){ctx.beginPath();ctx.moveTo(x,y-4);ctx.quadraticCurveTo(x+rx*r*.7,y+ry*r*.2,x+rx*r,y+ry*r*.4);ctx.stroke()}
      ink(2.5);const h=kH(k)+8,w=r*.95;ctx.beginPath();ctx.rect(x-w,y-h,w*2,h);ctx.fillStyle=vGrad(x-w,x+w,'#8a6038','#6b4a2a','#4a3220');ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.5;for(const f of [-.5,.1,.6]){ctx.beginPath();ctx.moveTo(x+f*w,y-2);ctx.lineTo(x+f*w+1,y-h+3);ctx.stroke()}
      ink(2.5);ell(x,y-h,w,w*.42);fs('#c9a26a');ctx.strokeStyle='rgba(110,70,40,.55)';ctx.lineWidth=1.3;for(const rr of [.65,.35]){ell(x,y-h,w*rr,w*.42*rr);ctx.stroke()}
      ink(1.8);ell(x+w*.75,y-5,4,2.5);fs('#d65b5b');ctx.fillStyle='#ece0c6';ctx.fillRect(x+w*.75-1,y-4,2,4);
      break}
    case 'crystal':{
      ell(x,y,r*.95,r*.4);fs(S.lo);const glow=.5+.5*Math.sin(G.t*2+sd);
      const shards=[[0,0,1,0],[-.55,.15,.7,-.35],[.55,.2,.75,.3],[.15,.3,.55,.05]];
      {const g=ctx.createRadialGradient(x,y-kH(k)*.5,2,x,y-kH(k)*.5,r*1.8);g.addColorStop(0,`rgba(127,224,240,${.25+glow*.2})`);g.addColorStop(1,'rgba(127,224,240,0)');ctx.fillStyle=g;circ(x,y-kH(k)*.5,r*1.8);ctx.fill()}
      for(const[ox,oy,sz,tilt] of shards){const cx=x+ox*r,cy=y-2+oy*r*.4,h=kH(k)*sz,w=r*.42*sz;ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);
        ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w,-h*.7);ctx.lineTo(0,-h);ctx.lineTo(w,-h*.7);ctx.lineTo(w,0);ctx.closePath();
        const g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#c9f3ff');g.addColorStop(.5,'#6fc9e8');g.addColorStop(1,'#6a4fc4');ctx.fillStyle=g;ctx.fill();ink(2);ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(0,-2);ctx.stroke();ctx.restore()}
      if(k.chmax&&k.chp<k.chmax){const dm=1-k.chp/k.chmax,n=Math.ceil(dm*5),H=kH(k);// cracks spread as it takes hits
        ctx.lineCap='round';ctx.lineJoin='round';for(let i=0;i<n;i++){const ox=Math.sin(sd*3+i*2.1)*r*.45,oy=-H*(.25+((i*.37+sd)%1)*.5),L=r*(.35+dm*.4);
          ctx.beginPath();ctx.moveTo(x+ox,y+oy);ctx.lineTo(x+ox+L*.35,y+oy+L*.3);ctx.lineTo(x+ox+L*.1,y+oy+L*.65);ctx.lineTo(x+ox+L*.45,y+oy+L);
          ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.stroke();ctx.strokeStyle='rgba(235,252,255,.95)';ctx.lineWidth=1.1;ctx.stroke()}
        if(dm>.5){ctx.save();ctx.globalCompositeOperation='lighter';glowAt(ctx,x,y-H*.5,r*1.4,'170,240,255',.12+.2*dm*(.6+.4*Math.sin(G.t*9)));ctx.restore()}}
      ctx.shadowBlur=0;
      break}
    case 'brazier':{
      ctx.strokeStyle=INK;ctx.lineWidth=5;for(const lx of [-.6,0,.6]){ctx.beginPath();ctx.moveTo(x+lx*r,y+2);ctx.lineTo(x+lx*r*.4,y-14);ctx.stroke()}
      ctx.strokeStyle='#5a5f68';ctx.lineWidth=2.5;for(const lx of [-.6,0,.6]){ctx.beginPath();ctx.moveTo(x+lx*r,y+2);ctx.lineTo(x+lx*r*.4,y-14);ctx.stroke()}
      ink(2.5);ctx.beginPath();ctx.moveTo(x-r*.95,y-20);ctx.quadraticCurveTo(x,y-4,x+r*.95,y-20);ctx.closePath();fs('#4a4f58');ell(x,y-20,r*.95,r*.32);fs('#2a1a14');
      ctx.fillStyle='#ff6a2a';for(let i=0;i<4;i++){circ(x-r*.5+i*r*.33,y-20,2.5);ctx.fill()}
      flame(x,y-20,1.45,themeOf(G.room)==='radici'?ENV.radici.torch:ENV.muschio.torch,sd);
      break}
    case 'skulls':{
      ell(x,y,r,r*.4);fs('#3e352b');
      ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-r*.9,y-2);ctx.lineTo(x+r*.8,y-6);ctx.moveTo(x-r*.6,y-8);ctx.lineTo(x+r*.9,y+1);ctx.stroke();
      ctx.strokeStyle='#e8e2d0';ctx.lineWidth=2.5;ctx.stroke();
      const sk=(cx,cy,s)=>{ink(2);circ(cx,cy,s);fs('#e8e2d0');ctx.fillStyle=INK;circ(cx-s*.35,cy,s*.27);ctx.fill();circ(cx+s*.35,cy,s*.27);ctx.fill();ctx.fillRect(cx-s*.3,cy+s*.5,s*.6,s*.18)};
      sk(x-r*.4,y-5,5.5);sk(x+r*.45,y-4,5);sk(x,y-12,6);
      break}
    case 'thorns':{
      const blobs=[[-.5,0,.72],[.5,.05,.66],[0,-.4,.74],[-.15,.18,.6]];
      for(const[ox,oy,s] of blobs){const cx=x+ox*r,cy=y-8+oy*r,rr=r*s;
        ink(2.5);ctx.beginPath();for(let i=0;i<12;i++){const a=i/12*TAU,q=i%2?rr*1.25:rr;const px=cx+Math.cos(a)*q,py=cy+Math.sin(a)*q*.8;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();fs(themeOf(G.room)==='radici'&&G.enemies.some(e=>e.p2)?'#4a5a2a':'#3f6a2a');
        ctx.fillStyle='rgba(255,255,255,.12)';ell(cx-rr*.3,cy-rr*.35,rr*.4,rr*.25);ctx.fill()}
      ctx.fillStyle='#b06ad8';for(const[bx,by] of [[-.3,-.4],[.35,-.2],[0,.1]]){circ(x+bx*r,y-8+by*r,2.4);ctx.fill()}
      break}
    case 'basalt':case 'lavarock':case 'obsidian':case 'anvil':case 'cauldron':case 'crate':drawRock2(k,x,y,r,sd,S);break;
    case 'deadtree':case 'totem':case 'mudmound':case 'reeds':case 'lantern':case 'swamprock':case 'iceblock':case 'snowpine':case 'frozenstatue':case 'snowman':case 'snowrock':drawRock3(k,x,y,r,sd,S);break;
    default:{
      const pts=[];for(let i=0;i<10;i++){const a=i/10*TAU,rr=r*(.86+.14*Math.sin(sd*3+i*2.1));pts.push([x+Math.cos(a)*rr,y-r*.38+Math.sin(a)*rr*.86])}
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
      const g=ctx.createLinearGradient(x-r,y-r*1.2,x+r,y+r*.4);g.addColorStop(0,S.hi);g.addColorStop(.5,S.mid);g.addColorStop(1,S.lo);ctx.fillStyle=g;ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.28)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-r*.1,y-r*1.1);ctx.lineTo(x+r*.15,y-r*.45);ctx.lineTo(x+r*.6,y-r*.2);ctx.moveTo(x+r*.15,y-r*.45);ctx.lineTo(x-r*.25,y+r*.1);ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.22)';ell(x-r*.38,y-r*.85,r*.32,r*.16,-.3);ctx.fill();
      ink(1.8);circ(x+r*.95,y+2,3);fs(S.mid);circ(x-r*.85,y+3,2.2);fs(S.lo);
    }
  }
  groundFront(k);
  ctx.globalAlpha=1;
}
function drawArrow(a){if(a.tr)drawTrail(a,P.fire?'255,140,60':P.ice?'130,210,255':P.trail||'246,234,210',a.big?6:(P.proj==='bolt'?2:2.6));ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.a);if(a.big)ctx.scale(1.8,1.8);
  if(a.blade){ctx.rotate(G.t*20);ink(2);ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(5,0);ctx.lineTo(0,11);ctx.lineTo(-5,0);ctx.closePath();fs('#dfe4ea');ctx.restore();return}
  const pr=P.proj||'arrow',shaft=P.fire?'#ff8a3c':P.ice?'#7fd3f0':pr==='leaf'?'#5f9e3c':'#d9b27a';
  if(pr==='leaf'){glow(P.fire?'255,140,60':'120,240,160',0,0,12,.35);ink(1.6);ctx.beginPath();ctx.moveTo(10,0);ctx.quadraticCurveTo(2,-7,-9,0);ctx.quadraticCurveTo(2,7,10,0);ctx.closePath();fs(P.fire?'#ff9a3c':P.ice?'#9fe0ff':'#7bd65a');
    ctx.strokeStyle='rgba(27,22,18,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-9,0);ctx.stroke();ctx.restore();return}
  if(pr==='thorn'){glow('184,116,230',2,0,11,.32);ink(1.6);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-1,-2.6);ctx.lineTo(-3,-7);ctx.lineTo(-5.5,-2.4);ctx.lineTo(-12,-3.5);ctx.lineTo(-9,0);ctx.lineTo(-12,3.5);ctx.lineTo(-5.5,2.4);ctx.lineTo(-3,7);ctx.lineTo(-1,2.6);ctx.closePath();
    fs(P.fire?'#ff9a3c':P.ice?'#9fe0ff':'#5f9e3c');ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-8,-.8,16,1.2);ctx.fillStyle='#d9a0ff';circ(8.5,0,1.7);ctx.fill();ctx.restore();return}
  if(pr==='flame'){const fl=Math.sin(G.t*38+a.x*.1)*1.6;ctx.save();ctx.globalCompositeOperation='lighter';glow('255,130,40',4,0,16,.6);ctx.restore();
    ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(4,0);ctx.stroke();ctx.strokeStyle='#8a2a1a';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#ff8a2e';ctx.beginPath();ctx.moveTo(12,0);ctx.quadraticCurveTo(5,-7-fl,-3,-1.5);ctx.quadraticCurveTo(3,0,-3,1.5);ctx.quadraticCurveTo(5,7+fl,12,0);ctx.fill();
    ctx.fillStyle='#ffe28a';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(3,-3);ctx.lineTo(3,3);ctx.closePath();ink(1.3);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffb020';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-14,-4.5-fl*.5);ctx.lineTo(-12,0);ctx.lineTo(-14,4.5+fl*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();return}
  if(pr==='bolt'){ctx.strokeStyle=INK;ctx.lineWidth=5.5;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(5,0);ctx.stroke();ctx.strokeStyle=shaft;ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle='#dfe4ea';ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(3,-4.5);ctx.lineTo(3,4.5);ctx.closePath();ink(1.6);ctx.fill();ctx.stroke();ctx.fillStyle=P.pcol||'#c9cfd6';ctx.fillRect(-11,-3.5,3,7);ctx.restore();return}
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(4,0);ctx.stroke();
  ctx.strokeStyle=shaft;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(4,0);ctx.stroke();
  if(P.wk==='arco_tuono'&&!P.fire&&!P.ice){if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('150,210,255',6,0,9,.45);ctx.restore()}
    ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(4,-3.8);ctx.lineTo(5,-1.2);ctx.lineTo(1.4,-2.6);ctx.lineTo(3,0);ctx.lineTo(1.4,2.6);ctx.lineTo(5,1.2);ctx.lineTo(4,3.8);ctx.closePath();ink(1.4);ctx.fill();ctx.stroke();
    ctx.fillStyle=P.pcol||'#9fd4ff';ctx.fillRect(-13,-3,4,2);ctx.fillRect(-13,1,4,2);ctx.restore();return}
  ctx.fillStyle='#e8ecf0';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(2,-3.5);ctx.lineTo(2,3.5);ctx.closePath();ink(1.5);ctx.fill();ctx.stroke();
  ctx.fillStyle=P.pcol||'#f6ead2';ctx.fillRect(-13,-3,4,2);ctx.fillRect(-13,1,4,2);ctx.restore()}
function drawEproj(p){if(p.tr)drawTrail(p,TRC[p.kind]||'229,72,77',p.r*1.5);
  if(EPDRAW[p.kind]){EPDRAW[p.kind](p);return}
  if(p.kind==='arrow'||p.kind==='thorn'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);
    if(p.kind==='arrow'){ctx.strokeStyle=INK;ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(6,0);ctx.stroke();ctx.strokeStyle='#e5484d';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(6,0);ctx.stroke()}
    else{ink(2);ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-7,-4.5);ctx.lineTo(-4,0);ctx.lineTo(-7,4.5);ctx.closePath();fs('#5f9e3c');ctx.fillStyle='rgba(123,240,192,.6)';circ(-6,0,2);ctx.fill()}
    ctx.restore();return}
  if(p.kind==='coinp'){drawCoinProj(p);return}
  if(p.kind==='fire'){glow('255,120,40',p.x,p.y,p.r*3.2,.55);ctx.fillStyle='rgba(255,140,50,.45)';ell(p.x-Math.cos(p.a)*7,p.y-Math.sin(p.a)*7,p.r*.9,p.r*.6,p.a);ctx.fill();ink(2);circ(p.x,p.y,p.r);fs('#ff6a1a');ctx.fillStyle='#ffe6a0';circ(p.x-1,p.y-1,p.r*.48);ctx.fill();return}
  ctx.fillStyle='rgba(229,72,77,.35)';circ(p.x,p.y,p.r+4);ctx.fill();ink(2);circ(p.x,p.y,p.r);fs('#e5484d');ctx.fillStyle='#ffd0d0';circ(p.x-1.5,p.y-1.5,p.r*.4);ctx.fill();
}
function drawHazardsGround(){
  for(const z of G.zones){const a=Math.min(1,z.t/.4)*Math.min(1,(z.max-z.t)/.3+.2);
    if(z.kind==='frost'||z.kind==='slime'){drawSoftZone(z,a);continue}
    const zc=z.kind==='fire'?['255,90,20','255,170,70','255,225,140']:z.kind==='acid'?['120,200,60','170,240,110','210,255,170']:['154,91,200','200,150,240','220,190,250'];
    ctx.fillStyle=`rgba(${zc[0]},${.28*a})`;circ(z.x,z.y,z.r);ctx.fill();ctx.strokeStyle=`rgba(${zc[1]},${.5*a})`;ctx.lineWidth=2;ctx.setLineDash([4,5]);circ(z.x,z.y,z.r);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=`rgba(${zc[2]},${.6*a})`;for(let i=0;i<5;i++){const an=G.t*.8+i*1.3,rr=z.r*(.3+.5*((i*37)%10)/10);circ(z.x+Math.cos(an)*rr,z.y+Math.sin(an)*rr*.7-((G.t*14+i*9)%14),2);ctx.fill()}}
  for(const z of G.zones)if(z.kind==='fire'){const a=Math.min(1,z.t/.4);for(let i=0;i<4;i++){const an=i*1.7+z.x*.1,rr=z.r*.5*((i%2)+.4),fx0=z.x+Math.cos(an)*rr,fy0=z.y+Math.sin(an)*rr*.6,h=(7+Math.sin(G.t*12+i*2+z.x)*3)*a;ctx.fillStyle=`rgba(255,${150+i*20},60,${.75*a})`;ctx.beginPath();ctx.moveTo(fx0-3,fy0);ctx.quadraticCurveTo(fx0-2,fy0-h*.6,fx0,fy0-h);ctx.quadraticCurveTo(fx0+2,fy0-h*.6,fx0+3,fy0);ctx.fill()}}
  for(const b of G.bands){
    const rect=b.h?[L,b.pos-b.w/2,R-L,b.w]:[b.pos-b.w/2,TOP,b.w,BOT-TOP];
    if(b.style==='ice'){drawIceBand(b,rect);continue}
    if(b.warn>0){ctx.fillStyle=`rgba(123,191,74,${.12+.1*Math.sin(G.t*20)})`;ctx.fillRect(...rect);ctx.strokeStyle='rgba(123,191,74,.7)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(...rect);ctx.setLineDash([])}
    else{ctx.fillStyle='rgba(60,40,25,.45)';ctx.fillRect(...rect);ink(2);const len=b.h?R-L:BOT-TOP,sc=Math.min(1,(.45-b.act)/.08+.3);
      for(let s=8;s<len;s+=13){const cx=b.h?L+s:b.pos+((s*7)%9-4),cy=b.h?b.pos+((s*7)%9-4):TOP+s;ctx.beginPath();ctx.moveTo(cx-5,cy+6);ctx.lineTo(cx,cy+6-16*sc);ctx.lineTo(cx+5,cy+6);ctx.closePath();fs(s%26<13?'#5f9e3c':'#7a5a3a')}}}
  for(const b of G.boulders){if(b.t<0)continue;const p=b.t/b.dur;ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=2.5;circ(b.tx,b.ty,22);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.1+p*.25})`;circ(b.tx,b.ty,22*p);ctx.fill()}
}
function drawBoulders(){for(const b of G.boulders){if(b.t<0)continue;const p=clamp(b.t/b.dur,0,1),x=b.sx+(b.tx-b.sx)*p,gy=b.sy+(b.ty-b.sy)*p,h=Math.sin(p*Math.PI)*90;
  shadow(x,gy+6,10*(.6+p*.4),4);ink(2.5);if(b.kind==='anvil'){ctx.save();ctx.translate(x,gy-h);ctx.rotate(p*7);ctx.beginPath();ctx.moveTo(-14,-6);ctx.lineTo(12,-6);ctx.quadraticCurveTo(18,-5,16,-1);ctx.lineTo(6,0);ctx.lineTo(5,4);ctx.lineTo(-6,4);ctx.lineTo(-7,0);ctx.lineTo(-13,-1);ctx.closePath();fs('#6b6f78');ctx.beginPath();ctx.rect(-5,4,10,6);fs('#4a3220');ctx.restore();glow('255,140,60',x,gy-h,16,.35)}else{circ(x,gy-h,11);fs('#857b6c');ctx.fillStyle='rgba(255,255,255,.2)';circ(x-3,gy-h-4,3);ctx.fill()}}}

