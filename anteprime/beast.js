// =====================================================================
// THE BEAST OF THE ABYSS (preview): the colossal skeleton under the arena wakes up and becomes the boss.
// Its horned skull leans over the back wall with the jaw inside the arena: that is where you hit it.
// Phase 1: the ribs come down from the sides like claws. Phase 2: it breathes the abyss and bones rain down.
// Phase 3: the tail sweeps the floor and the floor breaks into the abyss, the arena shrinks.
// =====================================================================
BOSSES.add('beast');
Object.assign(ET,{beast:{r:44,hp:3400,cdmg:18,gold:220,name:"La Bestia dell'Abisso",title:'Il paesaggio si sveglia'}});
Object.assign(ECOL,{beast:'#d8cfb2'});Object.assign(XPV,{beast:0});Object.assign(MAT_OF,{beast:'bone'});Object.assign(BOSS_INTRO,{beast:4.6});
const BE={col:['120,235,80','190,110,255','255,80,50'],name:['','Si alza dalle ossa','La furia dell’abisso']};
const bePh=e=>e.hp>e.max*.66?0:e.hp>e.max*.33?1:2;
const beCanHurt=()=>P.inv<=0&&P.dashT<=0;
const beMouth=e=>({x:e.x,y:e.y+18});
function beAdd(h){(G.beH=G.beH||[]).push(Object.assign({t:0,hit:false},h))}
// --- the fight
EUPD.beast=(e,dt,sm,a,d)=>{e.x=AW/2;e.y=TOP+34;e.face=Math.PI/2;e.moving=false;const ph=bePh(e);
  if(ph>(e.ph||0)){e.ph=ph;banner(ET.beast.name,BE.name[ph],1.8);bossRage(e,BE.col[ph]);$('bossBar').classList.toggle('rage',ph===2);shake(12);sfx('roar',0,e.x);ENV2.fall(14);e.st='walk';e.stT=1.6;G.beH=(G.beH||[]).filter(h=>h.k==='pit');
    if(ph===2)for(let i=0;i<10;i++)setTimeout(()=>{if(G&&G.fx)ENV2.chunks(rand(L,R),BOT-10,6,['#3d443d','#272c29'],140)},i*90)}
  const sp=ph===2?1.25:1;e.stT=(e.stT==null?2:e.stT)-dt*sp;e.jaw=Math.max(0,(e.jaw||0)-dt*1.5);
  if(e.st==='walk'){if(e.stT<=0){const seqs=[['ribs','bones','ribs','bones'],['ribs','breath','rain','ribs','breath'],['tail','ribs','breath','pits','rain','tail','breath']];
      const sq=seqs[ph];e.st=sq[(e.si=(e.si||0)+1)%sq.length];e.sub='a';e.stT=.8}}
  else if(e.st==='ribs'){// the ribs come down from the walls, one side then the other
    if(e.sub==='a'){const n=ph===0?2:3;for(let i=0;i<n;i++){const side=(i+(e.si||0))%2?1:-1,y=clamp(P.y+(i?rand(-140,140):0),TOP+90,BOT-40);beAdd({k:'rib',side,y,w:38,len:(R-L)*(ph===0?.62:.72),warn:1+i*.55,act:.55})}
      e.sub='b';e.stT=1+n*.55;sfx('creep',0,e.x)}
    else if(e.stT<=0){e.st='walk';e.stT=rand(1.2,1.8)}}
  else if(e.st==='bones'){// a fan of bone shards spat from the mouth
    e.jaw=1;if(e.stT<=0){const m=beMouth(e),n=ph===0?7:9,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let k=0;k<n;k++)shootE(m.x,m.y,a0+(k-(n-1)/2)*.17,170,7,12,'arrow');sfx('chomp',0,e.x);e.st='walk';e.stT=rand(1.4,2)}}
  else if(e.st==='breath'){// the abyss breathes out of the jaw: three wide streams that sweep slowly
    if(e.sub==='a'){e.jaw=1;const m=beMouth(e),a0=Math.atan2(P.y-m.y,P.x-m.x),n=ph===2?4:3;for(let k=0;k<n;k++)beAdd({k:'breath',a:a0+(k-(n-1)/2)*.42,sw:(k%2?1:-1)*.22,len:520,w:30,warn:1,act:1.3});e.sub='b';e.stT=2.4;sfx('incoming',0,e.x)}
    else{e.jaw=1;if(e.stT<=0){e.st='walk';e.stT=rand(1.2,1.6)}}}
  else if(e.st==='rain'){// bones and skulls fall from the dark onto the arena
    if(e.sub==='a'){const n=ph===2?9:6;for(let i=0;i<n;i++){const x=i===0?P.x:rand(L+30,R-30),y=i===0?P.y:rand(TOP+90,BOT-40);beAdd({k:'fall',x,y,r:26,warn:1.1+i*.12,act:.01})}e.sub='b';e.stT=2;sfx('quake',0,e.x)}
    else if(e.stT<=0){e.st='walk';e.stT=rand(1,1.5)}}
  else if(e.st==='tail'){// the tail of vertebrae sweeps across the arena, from one side to the other
    if(e.sub==='a'){const side=Math.random()<.5?-1:1,y=clamp(P.y,TOP+120,BOT-30);beAdd({k:'tail',side,y,w:44,warn:1.1,act:.9});if(Math.random()<.5)beAdd({k:'tail',side:-side,y:clamp(y+rand(-200,-120),TOP+120,BOT-30),w:44,warn:2.2,act:.9});e.sub='b';e.stT=3.2;sfx('creep',2,e.x)}
    else if(e.stT<=0){e.st='walk';e.stT=rand(1,1.4)}}
  else if(e.st==='pits'){// the floor breaks off into the abyss, starting from the bottom: the arena shrinks
    if(e.sub==='a'){const pits=(G.beH||[]).filter(h=>h.k==='pit').length;if(pits<8){for(let i=0;i<2;i++){const row=Math.floor(pits/4),x=L+40+((pits+i)%4)*((R-L-80)/3)+rand(-14,14),y=BOT-36-row*70;beAdd({k:'pit',x,y,r:34,warn:1.4,act:1e9})}sfx('quake',0,e.x)}e.sub='b';e.stT=1.6}
    else if(e.stT<=0){e.st='walk';e.stT=rand(1,1.4)}}};
// hazards: warnings, then the blow
{const _u=update;update=function(dt){_u(dt);if(!G||!G.beH||!G.beH.length)return;if(!G.enemies.some(e=>e.type==='beast'&&!e.dead)){G.beH=G.beH.filter(h=>h.k==='pit');if(!G.beH.length)return}
  for(let i=G.beH.length-1;i>=0;i--){const h=G.beH[i];if(h.warn>0){h.warn-=dt;if(h.warn<=0)beFire(h);continue}h.t+=dt;
    if(h.k==='rib'){if(!h.hit&&beCanHurt()&&Math.abs(P.y-h.y)<h.w/2+P.r*.5&&(h.side<0?P.x<L+h.len:P.x>R-h.len)){h.hit=true;hurtP(Math.round(22*DMG()))}}
    else if(h.k==='breath'){const m=beMouth(G.enemies.find(e=>e.type==='beast')||{x:AW/2,y:TOP+34}),a=h.a+h.sw*Math.sin(h.t/h.act*Math.PI),dx=Math.cos(a)*h.len,dy=Math.sin(a)*h.len,u=clamp(((P.x-m.x)*dx+(P.y-m.y)*dy)/(dx*dx+dy*dy),0,1);h.cur=a;
      if(beCanHurt()&&Math.hypot(m.x+dx*u-P.x,m.y+dy*u-P.y)<h.w/2+P.r*.4){h.tick=(h.tick||0)-dt;if(h.tick<=0){h.tick=.35;hurtP(Math.round(10*DMG()))}}}
    else if(h.k==='tail'){const u=h.t/h.act,x=h.side<0?L-30+(R-L+60)*u:R+30-(R-L+60)*u;h.x=x;if(!h.hit&&beCanHurt()&&Math.abs(P.y-h.y)<h.w/2+P.r*.5&&Math.abs(P.x-x)<40){h.hit=true;hurtP(Math.round(24*DMG()));P.x=clamp(P.x+(h.side<0?40:-40),L+10,R-10)}
      if(Math.random()<.6)G.fx.push({k:'puff',x,y:h.y+12,vx:rand(-20,20),vy:-10,t:.4,r:rand(4,8)})}
    else if(h.k==='pit'){const dd=Math.hypot(P.x-h.x,(P.y-h.y)*1.4);if(dd<h.r){const a=Math.atan2(P.y-h.y,P.x-h.x)||-Math.PI/2;P.x=clamp(h.x+Math.cos(a)*(h.r+4),L+8,R-8);P.y=clamp(h.y+Math.sin(a)*(h.r+4)/1.4,TOP+8,BOT-8);if(beCanHurt()){hurtP(Math.round(12*DMG()));text(P.x,P.y-40,"L'abisso!",'#c48ae8',13)}}}
    if(h.t>=h.act)G.beH.splice(i,1)}}}
function beFire(h){
  if(h.k==='rib'){shake(7);sfx('boom',0,h.side<0?L:R);const x0=h.side<0?L:R;for(let s=10;s<h.len;s+=24){const x=x0-h.side*-s;ENV2.chunks(h.side<0?L+s:R-s,h.y,2,['#d8cfb2','#9c9078'],90)}ENV2.mark('cracks',h.side<0?L+h.len*.7:R-h.len*.7,h.y,30);ENV2.rocks(h.side<0?L+h.len/2:R-h.len/2,h.y,h.len/2,1)}
  else if(h.k==='fall'){shake(4);sfx('rock','urn',h.x);ENV2.chunks(h.x,h.y,10,['#d8cfb2','#9c9078','#f6eed6'],120);ENV2.mark('crater',h.x,h.y,16);if(beCanHurt()&&Math.hypot(P.x-h.x,P.y-h.y)<h.r+P.r*.4)hurtP(Math.round(16*DMG()))}
  else if(h.k==='tail'){sfx('boom',0,h.side<0?L:R);shake(5)}
  else if(h.k==='breath'){sfx('roar',0,AW/2)}
  else if(h.k==='pit'){shake(9);sfx('crumble',1.2,h.x);ENV2.chunks(h.x,h.y,16,[stonePal().hi,stonePal().mid,stonePal().lo],120);
    const c=fx;c.save();c.setTransform(2,0,0,2,0,0);c.fillStyle='#050308';c.beginPath();for(let k=0;k<14;k++){const a=k/14*TAU,q=h.r*(.86+.2*Math.sin(k*2.7+h.x));k?c.lineTo(h.x+Math.cos(a)*q,h.y+Math.sin(a)*q*.7):c.moveTo(h.x+Math.cos(a)*q,h.y+Math.sin(a)*q*.7)}c.closePath();c.fill();
    c.strokeStyle='#1b1612';c.lineWidth=3;c.stroke();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1.2;c.stroke();c.restore();
    for(const k of G.rocks)if(!k.temp&&Math.hypot(k.x-h.x,k.y-h.y)<h.r+k.r){k.dmg=99;k.hit=.4}}}
// --- drawing: the hazards on the floor
const beBone=(pts,w)=>{ctx.lineCap='round';ctx.lineJoin='round';const path=()=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y))};
  path();ctx.strokeStyle=INK;ctx.lineWidth=w+6;ctx.stroke();path();ctx.strokeStyle='#cbc69c';ctx.lineWidth=w;ctx.stroke();ctx.save();ctx.translate(-w*.12,-w*.2);path();ctx.strokeStyle='#ece7be';ctx.lineWidth=w*.3;ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(0,w*.22);path();ctx.strokeStyle='rgba(127,123,88,.8)';ctx.lineWidth=w*.3;ctx.stroke();ctx.restore()};
{const _hg=drawHazards2Ground;drawHazards2Ground=function(){_hg();if(!G.beH)return;const t=G.t||0,e=G.enemies.find(e=>e.type==='beast'),col=e?BE.col[bePh(e)]:'190,110,255';
  for(const h of G.beH){const warn=h.warn>0,blink=.45+.35*Math.sin(t*22);
    if(h.k==='rib'){const x0=h.side<0?L:R-h.len;if(warn){ctx.fillStyle=`rgba(229,72,77,${.12+.1*blink})`;ctx.fillRect(x0,h.y-h.w/2,h.len,h.w);ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(x0,h.y-h.w/2,h.len,h.w);ctx.setLineDash([])}
      else{ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x0,h.y-h.w*.3+8,h.len,h.w*.6)}}
    else if(h.k==='fall'&&warn){const p=1-h.warn/1.3;ctx.strokeStyle=`rgba(229,72,77,${.5+.3*blink})`;ctx.lineWidth=2.5;circ(h.x,h.y,h.r);ctx.stroke();ctx.fillStyle=`rgba(229,72,77,${.08+p*.25})`;circ(h.x,h.y,h.r*clamp(p,0,1));ctx.fill()}
    else if(h.k==='tail'&&warn){ctx.fillStyle=`rgba(229,72,77,${.1+.1*blink})`;ctx.fillRect(L,h.y-h.w/2,R-L,h.w);ctx.strokeStyle='rgba(229,72,77,.7)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(L,h.y-h.w/2,R-L,h.w);ctx.setLineDash([]);
      ctx.fillStyle='rgba(229,72,77,.8)';const ax=h.side<0?L+20:R-20;for(let k=0;k<3;k++){const xx=ax-h.side*(-k*14-((t*60)%14));ctx.beginPath();ctx.moveTo(xx,h.y-8);ctx.lineTo(xx-h.side*-10,h.y);ctx.lineTo(xx,h.y+8);ctx.fill()}}
    else if(h.k==='breath'&&warn&&e){const m=beMouth(e);ctx.save();ctx.translate(m.x,m.y);ctx.rotate(h.a);ctx.fillStyle=`rgba(${col},${.1+.08*blink})`;ctx.fillRect(0,-h.w/2,h.len,h.w);ctx.strokeStyle=`rgba(${col},.6)`;ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-h.w/2,h.len,h.w);ctx.setLineDash([]);ctx.restore()}
    else if(h.k==='pit'){if(warn){ctx.strokeStyle=`rgba(229,72,77,${.5+.3*blink})`;ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ell(h.x,h.y,h.r,h.r*.7);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=1.6;for(let k=0;k<6;k++){const a=k/6*TAU+h.x;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(h.x+Math.cos(a)*h.r*(1-h.warn/1.4),h.y+Math.sin(a)*h.r*.7*(1-h.warn/1.4));ctx.stroke()}}
      else{ctx.save();ctx.globalCompositeOperation='lighter';glow('150,80,220',h.x,h.y+4,h.r*.9,.22+.08*Math.sin(t*2+h.x),h.r*.5);ctx.restore()}}}}}
{const _ha=drawHazards2Air;drawHazards2Air=function(){_ha();if(!G.beH)return;const t=G.t||0,e=G.enemies.find(e=>e.type==='beast'),col=e?BE.col[bePh(e)]:'190,110,255';
  for(const h of G.beH){
    if(h.k==='rib'){// the rib: its tip pokes out of the wall and shakes during the warning, then the whole arch slams down in the band
      const wall=h.side<0?L-4:R+4,tip=h.side<0?L+h.len:R-h.len,dir=h.side<0?1:-1;
      if(h.warn>0){const k=clamp(1-h.warn/1,0,1),sh=Math.sin(t*40)*2*k,len=18+k*26;beBone([[wall-dir*10,h.y+sh],[wall+dir*len*.5,h.y-10+sh],[wall+dir*len,h.y-4+sh]],20);ink(2.5);circ(wall+dir*len,h.y-4+sh,9);fs('#cbc69c')}
      else{const fade=Math.min(1,(h.act-h.t)/.2),drop=Math.max(0,1-h.t/.08)*-40;ctx.globalAlpha=fade;const mid=(wall+tip)/2;
        beBone([[wall-dir*14,h.y+drop],[wall+dir*(h.len*.25),h.y-30+drop],[mid+dir*h.len*.15,h.y-34+drop],[tip,h.y-2+drop]],24);ink(2.5);circ(tip,h.y-2+drop,12);fs('#cbc69c');
        ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=2;for(const u of [.3,.55,.8]){const xx=wall+dir*h.len*u;ctx.beginPath();ctx.moveTo(xx,h.y-34+drop+8);ctx.lineTo(xx+dir*4,h.y-24+drop);ctx.stroke()}ctx.globalAlpha=1}}
    else if(h.k==='fall'&&h.warn>0){const p=1-h.warn/1.3,yy=h.y-(1-clamp(p,0,1))*320;if(p>.3){ink(2.2);circ(h.x,yy-10,8);fs('#e0d9c4');ctx.fillStyle=INK;circ(h.x-3,yy-10,2);ctx.fill();circ(h.x+3,yy-10,2);ctx.fill()}}
    else if(h.k==='tail'&&h.warn<=0&&h.x!=null){// a chain of vertebrae sweeping through
      for(let k=0;k<7;k++){const x=h.x+h.side*k*26,y=h.y+Math.sin(t*12+k)*4;if(x<L-40||x>R+40)continue;ink(2.6);ctx.beginPath();ctx.ellipse(x,y,15-k,11-k*.6,0,0,TAU);fs('#cbc69c');ctx.beginPath();ctx.moveTo(x-5,y-8);ctx.lineTo(x,y-22+k);ctx.lineTo(x+5,y-8);ctx.closePath();fs('#cbc69c');ctx.fillStyle='rgba(127,123,88,.8)';ell(x,y+4,9-k*.5,3);ctx.fill()}}
    else if(h.k==='breath'&&h.warn<=0&&e){const m=beMouth(e),a=h.cur!=null?h.cur:h.a;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(a);ctx.globalCompositeOperation='lighter';
      for(let s=10;s<h.len;s+=18){const w=h.w*(.5+s/h.len*.7);glow(col,s,Math.sin(t*20+s*.05)*4,w*.8,.5*(1-s/h.len*.6),w*.55)}
      ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(20,8,30,.35)`;for(let s=20;s<h.len;s+=40){ctx.beginPath();ctx.arc(s+((t*200)%40),Math.sin(t*9+s)*6,4+s/h.len*6,0,TAU);ctx.fill()}ctx.restore()}}}}
// --- drawing the beast: the horned skull leans over the wall, the jaw comes down into the arena
EDRAW.beast=e=>{const t=G.t||0,x=e.x,ph=bePh(e),col=BE.col[ph],it=e.intro>0?(e.iT||0):9,rise=e.intro>0?clamp((it-.6)/1.6,0,1):1,eyeK=e.intro>0?clamp((it-1.6)/.7,0,1):1,
    jaw=e.intro>0?(it>3.2&&it<4.3?1:0):(e.jaw||0)*.9+.08+.04*Math.sin(t*1.4),breath=Math.sin(t*1.1)*1.5,cy=TOP-34+(1-rise)*-40+breath,K=INK,bone='#cbc69c',bs='#7f7b58',bh='#ece7be',dmg=1-e.hp/e.max;
  ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x,TOP+12,140,22,0,0,TAU);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(x,cy);ctx.lineJoin='round';ctx.lineCap='round';
  // horns
  for(const sd of [-1,1]){const p=()=>{ctx.beginPath();ctx.moveTo(sd*92,-16);ctx.bezierCurveTo(sd*140,-22,sd*176,-30,sd*186,-82)};p();ctx.strokeStyle=K;ctx.lineWidth=26;ctx.stroke();p();ctx.strokeStyle=bs;ctx.lineWidth=19;ctx.stroke();ctx.save();ctx.translate(-sd*2,-3);p();ctx.strokeStyle=bone;ctx.lineWidth=9;ctx.stroke();ctx.restore()}
  // jaw (behind the cranium), hinged at the sides, opening down into the arena
  ctx.save();ctx.translate(0,30+jaw*30);ctx.beginPath();ctx.moveTo(-84,-26);ctx.quadraticCurveTo(-90,30,-40,48);ctx.lineTo(40,48);ctx.quadraticCurveTo(90,30,84,-26);ctx.closePath();ctx.fillStyle=bs;ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle=bone;ctx.beginPath();ctx.moveTo(-76,-20);ctx.quadraticCurveTo(-80,24,-38,40);ctx.lineTo(38,40);ctx.quadraticCurveTo(80,24,76,-20);ctx.closePath();ctx.fill();
  ctx.fillStyle='#efe6c8';ctx.strokeStyle=K;ctx.lineWidth=2;for(let i=0;i<9;i++){const tx=-58+i*14.5,h=10+(i%2)*5;ctx.beginPath();ctx.moveTo(tx-6,-22);ctx.lineTo(tx,-22-h);ctx.lineTo(tx+6,-22);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore();
  // the dark of the throat between the jaws, glowing with the abyss
  if(jaw>.15){ctx.fillStyle='#08040c';ctx.beginPath();ctx.ellipse(0,40,70,8+jaw*26,0,0,TAU);ctx.fill();ctx.save();ctx.globalCompositeOperation='lighter';glow(col,0,44,60,.45*jaw,26);ctx.restore()}
  // cranium, with volume: lit from above, darker below and toward the edges, a rim of the abyss light
  ctx.beginPath();ctx.ellipse(0,0,124,74,0,0,TAU);{const g=ctx.createRadialGradient(-30,-40,10,0,0,140);g.addColorStop(0,'#e9e2c4');g.addColorStop(.55,bone);g.addColorStop(1,'#8f8a66');ctx.fillStyle=g}ctx.fill();ctx.strokeStyle=K;ctx.lineWidth=4.5;ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(0,0,124,74,0,0,TAU);ctx.clip();
  ctx.beginPath();ctx.ellipse(0,30,130,52,0,0,TAU);ctx.fillStyle='rgba(60,56,38,.45)';ctx.fill();
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${col},.22)`;ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,4,120,70,0,Math.PI*.15,Math.PI*.85);ctx.stroke();ctx.restore();
  ctx.beginPath();ctx.ellipse(-34,-42,48,14,-.15,Math.PI*1.05,Math.PI*1.85);ctx.strokeStyle=bh;ctx.lineWidth=7;ctx.stroke();
  // upper teeth
  ctx.fillStyle='#efe6c8';ctx.strokeStyle=K;ctx.lineWidth=2;for(let i=0;i<10;i++){const tx=-63+i*14,h=12+(i%3===1?6:0);ctx.beginPath();ctx.moveTo(tx-6,56);ctx.lineTo(tx,56+h);ctx.lineTo(tx+6,56);ctx.closePath();ctx.fill();ctx.stroke()}
  // cracks that spread with the damage, glowing with the phase colour
  const cracks=[[[20,-72],[28,-54],[20,-44],[34,-30]],[[-62,-52],[-48,-44],[-52,-30]],[[70,-40],[60,-26],[72,-12],[64,0]],[[-90,-10],[-76,0],[-84,14]],[[0,-74],[-6,-60],[4,-50]]];
  cracks.forEach((c,i)=>{if(dmg<i*.17)return;ctx.beginPath();c.forEach(([a,b],j)=>j?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.strokeStyle=K;ctx.lineWidth=2.6;ctx.stroke();if(ph>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${col},.75)`;ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}});
  // brows and sockets
  for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(sd*52,-18,32,25,sd*.25,0,TAU);ctx.fillStyle=K;ctx.fill();
    ctx.beginPath();ctx.moveTo(sd*18,-42);ctx.quadraticCurveTo(sd*52,-58-(ph===2?6:0),sd*88,-34);ctx.strokeStyle=K;ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle=bone;ctx.lineWidth=5.5;ctx.stroke()}
  ctx.fillStyle=K;ctx.beginPath();ctx.moveTo(0,22);ctx.lineTo(-12,42);ctx.lineTo(12,42);ctx.closePath();ctx.fill();
  // eyes: they light up when it wakes, and look at the hero
  if(eyeK>0){const lx=clamp((P.x-x)/120,-1,1)*6,ly=clamp((P.y-cy)/300,-1,1)*4;ctx.save();ctx.globalCompositeOperation='lighter';
    for(const sd of [-1,1]){const ex=sd*52+lx,ey=-16+ly,a=eyeK*(.9+.1*Math.sin(t*2));glow(col,ex,ey,34,a*.7,26);glow(col,ex,ey,16,a);glow('255,255,255',ex,ey,6,a*.9)}ctx.restore()}
  ctx.restore();
  // dust and pebbles falling from it while it moves
  if(e.intro>0&&it>.6&&it<2.4&&Math.random()<.5)G.debris.push({x:x+rand(-110,110),y:TOP+rand(0,30),z:rand(40,90),vx:0,vy:rand(0,20),vz:0,col:pk(['#cbc69c','#7f7b58']),s:rand(1.5,3),rot:0,vr:4,life:1.4})};
ESHADOW.beast=()=>{};ELIGHT.beast=(e,Lt)=>{Lt(e.x,e.y-20,170,.7)};
// entrance: the room trembles, the skull lifts out of the dark, the eyes light up, the jaw drops, a roar
{const _bi3=bossIntro3;bossIntro3=function(e,t,t0,at,roar){if(e.type!=='beast')return _bi3(e,t,t0,at,roar);
  if(t0===0){sfx('quake',0,e.x);shake(3);fallingPebbles(10)}if(t<2.4&&Math.random()<.3)fallingPebbles(1);
  if(at(.6)){sfx('creep',0,e.x);shake(5)}if(at(1.6)){sfx('shimmer',2,e.x);shake(4)}
  if(at(3.2)){roar();sfx('roar',0,e.x);shake(14);ENV2.fall(16);G.hitstop=Math.max(G.hitstop||0,.12)}return true}}
// the backdrop skull hides its own eyes while the beast is awake (the boss is drawn on top of it)
{const _de=drawBeastEyes;drawBeastEyes=function(){if(G.enemies&&G.enemies.some(e=>e.type==='beast'))return;_de()}}
// the arrows stop at the skull, the room does not move it
BLOCK.beast=()=>false;
function startBeast(){G.event=null;G.chapter=G.chapter||1;
  // the whole arena fits the screen, so the skull is always in view
  const sb=SAVE.set&&SAVE.set.big;if(SAVE.set)SAVE.set.big=false;buildRoom();if(SAVE.set)SAVE.set.big=sb;G.enemies=[];G.beH=[];G.rocks=G.rocks.filter(k=>k.y>TOP+150&&Math.abs(k.x-AW/2)>120);fields={};
  const e=makeE('beast',AW/2,TOP+34,0);G.enemies.push(e);bossBarReset();$('bossBar').hidden=false;$('bossBar').classList.remove('rage');$('bossName').textContent=ET.beast.name;banner(ET.beast.name,ET.beast.title,2.6);
  P.x=AW/2;P.y=BOT-60;camSnap();playMusic('golem');return e}
