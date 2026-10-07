// =====================================================================
// BOSS 2 (preview): richer bosses. Every boss breathes; each one gets its own living details, anchored to its body:
// orbiting stones, smoke, embers, drool, flies, frost breath, glints... Particles respect LOWFX.
// =====================================================================
let BOSS2=true;
const B2={};
function b2tick(e){const now=G.t||0,dt=Math.min(.05,Math.max(0,now-(e._b2t==null?now:e._b2t)));e._b2t=now;if(!e._b2p)e._b2p=[];
  const L=e._b2p;for(let i=L.length-1;i>=0;i--){const p=L[i];p.t+=dt;if(p.gy!=null&&p.y>=p.gy&&p.k==='drip'){L[i]={k:'splash',x:p.x,y:p.gy,t:0,life:.35,vx:0,vy:0,col:p.col};continue}
    if(p.t>=p.life){L.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||0)*dt;if(p.drag){p.vx*=1-p.drag*dt;p.vy*=1-p.drag*dt}}
  return dt}
const b2emit=(e,p)=>{if(LOWFX||!e._b2p||e._b2p.length>70)return;e._b2p.push(Object.assign({t:0,vx:0,vy:0},p))};
const b2every=(e,key,per,dt)=>{e['_b2'+key]=(e['_b2'+key]||0)+dt;if(e['_b2'+key]>=per){e['_b2'+key]=0;return true}return false};
function b2draw(e){const L=e._b2p;if(!L||!L.length)return;
  for(const p of L){const k=1-p.t/p.life;
    switch(p.k){
      case 'smoke':ctx.fillStyle=`rgba(${p.col||'70,62,58'},${.38*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*7);ctx.fill();break;
      case 'vapor':ctx.fillStyle=`rgba(235,246,255,${.55*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*6);ctx.fill();break;
      case 'dust':ctx.fillStyle=`rgba(${p.col||'205,195,175'},${.42*k})`;circ(p.x,p.y,(p.r||3)+(1-k)*5);ctx.fill();break;
      case 'pebble':ink(1.4);circ(p.x,p.y,p.r||2);fs(p.col||'#7d7568');break;
      case 'drip':ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(p.x,p.y,1.8,2.6,0,0,TAU);ctx.fill();break;
      case 'splash':ctx.strokeStyle=p.col;ctx.globalAlpha=k;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,2+(1-k)*7,1+(1-k)*3,0,0,TAU);ctx.stroke();ctx.globalAlpha=1;break;
      case 'snow':ctx.fillStyle=`rgba(255,255,255,${.9*Math.min(1,k*3)})`;circ(p.x+Math.sin(p.t*3+p.ph)*3,p.y,p.r||1.5);ctx.fill();break;
      case 'leaf':ctx.save();ctx.translate(p.x+Math.sin(p.t*2.5+p.ph)*6,p.y);ctx.rotate(p.t*3+p.ph);ctx.globalAlpha=Math.min(1,k*2);ink(1);ell(0,0,3.6,1.8);fs(p.col||'#6fa040');ctx.restore();ctx.globalAlpha=1;break;
      case 'bubble':ctx.strokeStyle=`rgba(${p.col||'190,255,170'},${.8*k})`;ctx.lineWidth=1.2;circ(p.x,p.y,p.r||2);ctx.stroke();break;
      case 'coin':ctx.fillStyle=`rgba(255,215,90,${k})`;ctx.beginPath();ctx.ellipse(p.x,p.y,2.6*Math.abs(Math.cos(p.t*8+p.ph))+.4,2.6,0,0,TAU);ctx.fill();break;
      case 'ember':case 'spark':case 'glint':ctx.save();ctx.globalCompositeOperation='lighter';
        if(p.k==='ember'){glow(p.col||'255,140,50',p.x,p.y,6*k+2,.8*k);ctx.fillStyle=`rgba(255,230,170,${k})`;circ(p.x,p.y,1.1);ctx.fill()}
        else if(p.k==='spark'){ctx.strokeStyle=`rgba(255,220,120,${k})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);ctx.stroke()}
        else{const s=(p.r||5)*Math.sin(k*Math.PI);ctx.strokeStyle=`rgba(255,255,255,${k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(p.x-s,p.y);ctx.lineTo(p.x+s,p.y);ctx.moveTo(p.x,p.y-s);ctx.lineTo(p.x,p.y+s);ctx.stroke();glow(p.col||'255,255,255',p.x,p.y,s*1.6,.5*k)}
        ctx.restore();break}}}
{const _de=drawEnemy;drawEnemy=function(e){const S=B2[e.type];if(!BOSS2||!S||e.dead){_de(e);return}
  const dt=b2tick(e),hide=e.hidden||(e.st==='burrow'&&e.sub==='under')||(e.spawn>0);
  if(S.back&&!hide)S.back(e,dt);
  const br=e.intro>0||hide?0:Math.sin((G.t||0)*(S.br||2.2)+e.x*.013)*(S.bra||.02);
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(1-br*.6,1+br);ctx.translate(-e.x,-e.y);_de(e);ctx.restore();
  if(S.front&&!hide)S.front(e,dt);b2draw(e)}}
const b2add=(rgb,x,y,r,a)=>{ctx.save();ctx.globalCompositeOperation='lighter';glow(rgb,x,y,r,a);ctx.restore()};

// --- GOLEM: stones orbiting him, moss with a flower and a mushroom on the shoulders, glowing eyes and rune, pebbles falling as he walks
{const rocks=(e,front)=>{if(e.st==='roll')return;const z=e.z||0;for(let i=0;i<3;i++){const a=(G.t||0)*1.1+i*TAU/3,s=Math.sin(a);if((s>0)!==front)continue;
    const px=e.x+Math.cos(a)*46,py=e.y-30-z+s*13+Math.sin((G.t||0)*2+i)*3,r=5+i%2*1.5;
    ctx.fillStyle='rgba(0,0,0,.18)';ell(px,e.y+4,r,r*.4);ctx.fill();
    ink(2);ctx.beginPath();for(let k=0;k<6;k++){const q=k/6*TAU+a,rr=r*(.8+.2*Math.sin(k*2.3+i));k?ctx.lineTo(px+Math.cos(q)*rr,py+Math.sin(q)*rr*.85):ctx.moveTo(px+Math.cos(q)*rr,py+Math.sin(q)*rr*.85)}ctx.closePath();fs(e.p2?'#6e655c':'#857b6c');
    ctx.fillStyle='rgba(255,255,255,.22)';ell(px-r*.3,py-r*.35,r*.4,r*.22);ctx.fill();
    if(e.p2){ctx.strokeStyle='#ff7a2e';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(px-r*.5,py);ctx.lineTo(px,py-r*.3);ctx.lineTo(px+r*.4,py+r*.2);ctx.stroke();b2add('255,120,40',px,py,10,.5)}
    else{ctx.fillStyle='#6fa040';ell(px+r*.1,py-r*.6,r*.5,r*.22);ctx.fill()}}};
  B2.golem={br:1.6,bra:.022,back:e=>rocks(e,false),front:(e,dt)=>{rocks(e,true);if(e.st==='roll'){if(b2every(e,'d',.06,dt))b2emit(e,{k:'dust',x:e.x+rand(-20,20),y:e.y+2,vx:rand(-20,20),vy:-rand(5,20),life:.6,r:4});return}
    const B=basis(e.face),v=B.v,f=B.f,z=e.z||0,cr=(e.st==='leap'&&e.sub==='a')||(e.st==='roll'&&e.sub==='a')?7:0,W=(lx,ly)=>[e.x+lx*f,e.y-z+ly];
    // moss, a flower and a little mushroom on the shoulders (lava cracks in phase 2)
    const sh=[W(-14,-48+cr),W(13,-50+cr)];
    if(!e.p2){ctx.lineCap='round';for(const[i,[sx,sy]] of sh.entries())for(let b=0;b<4;b++){const sw=Math.sin((G.t||0)*2.4+b+i)*1.4;ctx.strokeStyle=b%2?'#5a8a32':'#86c050';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx-4+b*2.6,sy+2);ctx.lineTo(sx-5+b*2.8+sw,sy-4-b%2*2.5);ctx.stroke()}
      {const[fx,fy]=sh[0];ctx.strokeStyle='#4f8a34';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(fx+2,fy+1);ctx.lineTo(fx+3+Math.sin((G.t||0)*2)*1.5,fy-9);ctx.stroke();const px=fx+3+Math.sin((G.t||0)*2)*1.5,py=fy-10;ctx.fillStyle='#f2a0c8';for(let k=0;k<5;k++){circ(px+Math.cos(k*1.26)*2,py+Math.sin(k*1.26)*1.6,1.5);ctx.fill()}ctx.fillStyle='#ffd23c';circ(px,py,1.2);ctx.fill()}
      {const[mx,my]=sh[1];ink(1.4);ctx.fillStyle='#efe3c8';ctx.fillRect(mx+1,my-5,2.4,5);ctx.strokeRect(mx+1,my-5,2.4,5);ctx.beginPath();ctx.ellipse(mx+2.2,my-5,4.6,3,0,Math.PI,0);ctx.closePath();fs('#d65b5b');ctx.fillStyle='#fff';circ(mx+.8,my-6.5,.8);ctx.fill()}}
    else for(const[i,[sx,sy]] of sh.entries())if(b2every(e,'em'+i,.18,dt))b2emit(e,{k:'ember',x:sx+rand(-6,6),y:sy,vx:rand(-8,8),vy:-rand(25,45),life:rand(.6,1),col:'255,130,50'});
    if(!B.back){const hx=v==='s'?0:v==='s34'?7:12,hy=-48+cr,eyeC=e.p2?'255,90,60':'127,224,240',pul=.6+.4*Math.sin((G.t||0)*3);
      const eyes=v==='s'?[hx-5,hx+5]:v==='s34'?[hx-2,hx+6]:[hx+7];for(const ex of eyes){const[a,b]=W(ex,hy+1);b2add(eyeC,a,b,9,.55*pul)}
      const rx=v==='s'?0:v==='s34'?6:10,[cx,cy]=W(rx,-22+cr);b2add(e.p2?'255,120,40':'140,220,90',cx,cy,16,.35+.25*Math.sin((G.t||0)*2.2))}
    if(e.moving&&b2every(e,'p',.25,dt))b2emit(e,{k:'pebble',x:e.x+rand(-22,22),y:e.y-z-rand(20,44),vy:rand(-20,10),g:420,gy:e.y,life:.6,r:rand(1.4,2.4),col:e.p2?'#6e655c':'#857b6c'})}}}

// --- WITCH: roots writhing at her feet, three spore lanterns circling her, leaves falling around
B2.witch={br:1.8,bra:.02,back:e=>{const t=G.t||0;ctx.lineCap='round';for(let i=0;i<6;i++){const a=i/6*TAU+.3,bx=e.x+Math.cos(a)*16,by=e.y+Math.sin(a)*6,len=16+6*Math.sin(t*1.7+i),sw=Math.sin(t*2.2+i*1.7)*7;
    const ex=bx+Math.cos(a)*len+sw,ey=by+Math.sin(a)*len*.45-6-Math.abs(Math.sin(t*1.3+i))*6,cx=bx+Math.cos(a)*len*.5-sw*.5,cy=by-8;
    for(const[c,w] of [[INK,5],[e.p2?'#6a3a2a':'#5a3f2a',2.8],['rgba(255,220,170,.25)',1]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(cx,cy,ex,ey);ctx.stroke()}
    if(i%2===0){ctx.fillStyle=e.p2?'#ff8a3c':'#7bbf4a';ell(ex,ey,2.6,1.4,a);ctx.fill()}}},
  front:(e,dt)=>{const t=G.t||0,rgb=e.p2?'255,140,60':'123,240,192';
    for(let i=0;i<3;i++){const a=t*1.3+i*TAU/3,px=e.x+Math.cos(a)*30,py=e.y-34+Math.sin(a)*10+Math.sin(t*2.6+i)*3;
      ctx.strokeStyle='rgba(30,40,30,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py-6);ctx.lineTo(px,py-11);ctx.stroke();
      ink(1.6);ctx.beginPath();ctx.ellipse(px,py,3.6,5,0,0,TAU);fs(e.p2?'#c45a20':'#3f8a6a');b2add(rgb,px,py,13,.5+.3*Math.sin(t*4+i));ctx.fillStyle='rgba(255,255,230,.9)';circ(px-1,py-1.5,1.1);ctx.fill()}
    if(b2every(e,'lf',.35,dt))b2emit(e,{k:'leaf',x:e.x+rand(-30,30),y:e.y-rand(50,70),vy:rand(14,24),life:2.4,ph:rand(0,9),col:e.p2?pk(['#c4602a','#e08a3a']):pk(['#6fa040','#86b84a','#4f8a34'])})}};

// --- SALAMANDER: smoke from the nostrils, embers lifting off her back, the dorsal spikes lighting up in a wave
B2.salamander={br:3,bra:.012,front:(e,dt)=>{const t=G.t||0,tr=e.trail||[{x:e.x,y:e.y}];
    for(let i=7;i>=1;i--){const p=tr[Math.max(0,tr.length-1-i*6)],r=e.r*(1-i*.1),w=Math.max(0,Math.sin(t*5-i*.9));b2add('255,170,60',p.x,p.y-8-r*.9,7+w*6,.25+w*.5)}
    if(b2every(e,'em',.07,dt)){const p=tr[Math.max(0,tr.length-1-randi(1,7)*6)];b2emit(e,{k:'ember',x:p.x+rand(-6,6),y:p.y-14,vx:rand(-10,10),vy:-rand(30,60),life:rand(.6,1.1)})}
    if(b2every(e,'sm',.22,dt)){const a=Q8(e.face)*Math.PI/4;for(const s of [-1,1]){const lx=e.r*1.18,ly=s*e.r*.22;b2emit(e,{k:'smoke',x:e.x+Math.cos(a)*lx-Math.sin(a)*ly,y:e.y-10+Math.sin(a)*lx+Math.cos(a)*ly,vx:Math.cos(a)*14,vy:-rand(14,24),life:.9,r:2,col:'60,52,48'})}}}};

// --- SMITH: the forge in his chest breathes fire, smoke puffs from his shoulders, sparks fly when the hammer lands
B2.smith={br:1.7,bra:.016,front:(e,dt)=>{const t=G.t||0;b2add('255,120,40',e.x,e.y-30,20,.35+.2*Math.sin(t*3)+(e.p2?.15:0));
    if(b2every(e,'sm',.5,dt))for(const s of [-1,1])b2emit(e,{k:'smoke',x:e.x+s*11,y:e.y-50,vx:s*4,vy:-rand(18,26),life:1.2,r:2.4,col:'60,56,54'});
    if(b2every(e,'em',.16,dt))b2emit(e,{k:'ember',x:e.x+rand(-12,12),y:e.y-rand(30,50),vx:rand(-10,10),vy:-rand(25,45),life:rand(.7,1.1)});
    const slam=e.st==='slam'&&e.sub==='b';if(slam&&!e._b2slam){e._b2slam=1;const sx=e.sx!=null?e.sx:e.x,sy=e.sy!=null?e.sy:e.y;for(let i=0;i<16;i++){const a=rand(-Math.PI,0),s=rand(80,190);b2emit(e,{k:'spark',x:sx,y:sy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:380,life:rand(.35,.6)})}}if(!slam)e._b2slam=0}};

// --- TOAD KING: flies buzzing around his head, a glint on the crown, drool dripping from the corners of his mouth, bubbles at his feet
B2.toad={br:2,bra:.028,front:(e,dt)=>{const t=G.t||0,B=basis(e.face),z=e.z||0,ox=B.side?6:B.v==='s34'?Math.cos(B.qa)*6*B.f:0,sf=B.side?B.f:1;
    for(let i=0;i<3;i++){const a=t*(2.4+i*.5)+i*2.1,fx=e.x+Math.cos(a)*(30+i*5),fy=e.y-z-56+Math.sin(a*1.7)*10;ctx.fillStyle='rgba(255,255,255,.7)';const fl=Math.abs(Math.sin(t*60+i));ell(fx-2,fy-2,2.4,1.2*fl+.3,-.5);ctx.fill();ell(fx+2,fy-2,2.4,1.2*fl+.3,.5);ctx.fill();ctx.fillStyle=INK;circ(fx,fy,1.6);ctx.fill()}
    if(b2every(e,'gl',1.6,dt))b2emit(e,{k:'glint',x:e.x+ox*.5*sf+rand(-6,6),y:e.y-z-64,life:.5,r:5,col:'255,230,120'});
    if(!B.back&&!z&&b2every(e,'dr',.9,dt)){const s=B.side?1:pk([-1,1]),mx=e.x+(B.side?30*B.f:ox+s*23),my=e.y-29;b2emit(e,{k:'drip',x:mx,y:my,vy:10,g:200,gy:e.y+2,life:2,col:'rgba(200,240,170,.9)'})}
    if(b2every(e,'bu',.5,dt))b2emit(e,{k:'bubble',x:e.x+rand(-34,34),y:e.y+rand(0,6),vy:-rand(6,12),life:.8,r:rand(1.5,3)})}};

// --- HYDRA: venom dripping from every mouth into the water, bubbles and mist on the pool, eyes that glow
B2.hydra={br:1.5,bra:.012,back:e=>{const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';glow(e.p2?'170,120,255':'150,255,170',e.x,e.y-4,70,.12+.05*Math.sin(t*1.4),26);ctx.restore()},
  front:(e,dt)=>{if(!e.heads)return;const t=G.t||0,sink=e.sink||0;
    for(const h of e.heads){const p=hydraHead(e,h);b2add(e.p2?'190,140,255':'200,255,120',p.x,p.y-2,10,.35+.2*Math.sin(t*3+h.s));
      if(sink<.3&&b2every(e,'v'+(h.s+1),.6+.25*(h.s+1),dt))b2emit(e,{k:'drip',x:p.x+rand(-3,3),y:p.y+8,vy:20,g:260,gy:e.y+rand(-2,6),life:2,col:e.p2?'rgba(200,160,255,.95)':'rgba(170,255,120,.95)'})}
    if(b2every(e,'bu',.25,dt))b2emit(e,{k:'bubble',x:e.x+rand(-46,46),y:e.y+rand(-6,8),vy:-rand(5,10),life:.9,r:rand(1.4,3),col:e.p2?'210,180,255':'190,255,170'})}};

// --- YETI: frosty breath clouds, snow falling around him, frost glittering on his fur
B2.yeti={br:1.7,bra:.022,front:(e,dt)=>{const B=basis(e.face),v=B.v,z=e.z||0,cr=e.st==='leap'&&e.sub==='a'?8:0;
    if(!B.back&&b2every(e,'br',1.3,dt)){const hx=v==='s'?0:v==='s34'?7:12,mx=e.x+(hx+(B.side?12:0))*B.f,my=e.y-z-50+cr,dir=B.side?B.f:Math.cos(e.face)*.6;for(let i=0;i<4;i++)b2emit(e,{k:'vapor',x:mx,y:my,vx:dir*rand(14,26)+rand(-5,5),vy:rand(2,10),drag:1.5,life:rand(.7,1),r:2+i*.6})}
    if(b2every(e,'sn',.12,dt))b2emit(e,{k:'snow',x:e.x+rand(-50,50),y:e.y-z-rand(70,90),vy:rand(18,28),life:2.4,ph:rand(0,9),r:rand(1,1.8)});
    if(b2every(e,'gl',.45,dt))b2emit(e,{k:'glint',x:e.x+rand(-24,24),y:e.y-z-30+rand(-24,20),life:.45,r:3.5,col:'200,240,255'})}};

// --- ICE QUEEN: three big crystals orbiting her (in front and behind), freezing mist at her feet, frost falling from her wings
{const shards=(e,front)=>{const t=G.t||0;for(let i=0;i<3;i++){const a=t*.9+i*TAU/3,s=Math.sin(a);if((s>0)!==front)continue;const px=e.x+Math.cos(a)*42,py=e.y-34+s*12+Math.sin(t*2+i)*3;
    ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(t+i)*.3);ink(1.8);ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(4.5,-1);ctx.lineTo(2.5,8);ctx.lineTo(-2.5,8);ctx.lineTo(-4.5,-1);ctx.closePath();fs(e.p2?'#c8b8ff':'#bfe6ff');
    ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(2,-1);ctx.lineTo(0,5);ctx.closePath();ctx.fill();ctx.restore();b2add(e.p2?'190,160,255':'170,225,255',px,py,14,.35*(e.alpha==null?1:e.alpha))}};
  B2.icequeen={br:1.4,bra:.012,back:e=>{if(e.hidden)return;const t=G.t||0;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++)glow('200,235,255',e.x+Math.sin(t*.7+i*2)*16,e.y+8,26,.16,8);ctx.restore();shards(e,false)},
    front:(e,dt)=>{if(e.hidden)return;shards(e,true);if(b2every(e,'fr',.15,dt))b2emit(e,{k:'snow',x:e.x+rand(-28,28),y:e.y-rand(36,50),vy:rand(14,24),life:1.6,ph:rand(0,9),r:rand(.9,1.5)})}}}

// --- MIMIC: gold glinting inside its mouth, drool from its tongue, a sly glint on the lock to lure you in, dust when it lands
B2.mimic={br:2.6,bra:.03,front:(e,dt)=>{const t=e.t||0,B=basis(e.face),side=B.side,z=e.z||0,m=e.intro>0?1:(e.mouth||0),chew=e.st==='walk'?Math.abs(Math.sin(t*6))*.35:0,op=Math.max(m,chew),S=1.4,W=(lx,ly)=>[e.x+lx*S*B.f,e.y-z+ly*S],H=13,bw=side?17*.8:17;
    if(!B.back&&op>=.05){const ex=side?bw*.35:0;
      for(const dx of [-6,0,6]){const[cx,cy]=W(ex+dx,-H+1);ctx.fillStyle='#ffd23c';ink(1.2);ctx.beginPath();ctx.ellipse(cx,cy,2.4,1.4,0,0,TAU);ctx.fill();ctx.stroke()}
      if(b2every(e,'gl',.5,dt)){const[cx,cy]=W(ex+rand(-8,8),-H);b2emit(e,{k:'glint',x:cx,y:cy,life:.4,r:3.5,col:'255,220,120'})}
      const tg=Math.sin(t*8)*3,[tx,ty]=W(ex+(side?14:5)+tg,-H+10+op*8);if(b2every(e,'dr',.45,dt))b2emit(e,{k:'drip',x:tx,y:ty,vy:15,g:240,gy:e.y+4,life:2,col:'rgba(240,200,210,.95)'})}
    else if(!B.back&&!z){if(b2every(e,'lu',1.4,dt)){const[lx,ly]=W(0,-H);b2emit(e,{k:'glint',x:lx,y:ly-2,life:.6,r:6,col:'255,230,140'})}if(b2every(e,'co',.5,dt)){const[lx,ly]=W(rand(-12,12),-H);b2emit(e,{k:'coin',x:lx,y:ly,vy:-rand(14,24),life:.9,ph:rand(0,9)})}}
    if(e._b2z>6&&z<1)for(let i=0;i<8;i++){const a=i/8*TAU;b2emit(e,{k:'dust',x:e.x+Math.cos(a)*18,y:e.y+4+Math.sin(a)*6,vx:Math.cos(a)*30,vy:Math.sin(a)*10-5,drag:3,life:.5,r:3})}e._b2z=z}};
