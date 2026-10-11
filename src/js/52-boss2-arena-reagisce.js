// =====================================================================
// THE ARENA REACTS: every blow of a boss leaves a mark on the room. Obstacles shake and crack, stones and icicles fall
// from above, fire scorches the floor and sets wood alight, grass burns, frost spreads, roots and flowers stay on the floor,
// water splashes into new puddles, the torches change colour with the magic
// =====================================================================
const ENV2={
  rocks(x,y,R,dmg){for(const k of G.rocks){const d=Math.hypot(k.x-x,k.y-y)-k.r;if(d>R)continue;const f=1-Math.max(0,d)/R;k.hit=Math.max(k.hit||0,.1+.22*f);if(!k.temp&&dmg)k.dmg=(k.dmg||0)+dmg*f;
    for(let i=0;i<2;i++)G.fx.push({k:'puff',x:k.x+rand(-k.r,k.r)*.6,y:k.y-kH(k)*rand(.4,1),vx:rand(-24,24),vy:rand(-14,6),t:rand(.3,.6),r:rand(3,6)});
    if(isIce(themeOf(G.room)))for(let i=0;i<3;i++)G.debris.push({x:k.x+rand(-k.r,k.r),y:k.y,z:kH(k)*rand(.6,1),vx:rand(-30,30),vy:rand(-10,10),vz:rand(40,90),col:'#ffffff',s:rand(1.4,2.4),rot:0,vr:rand(-6,6),life:1.4})}},
  // chunks of floor thrown up around an impact
  chunks(x,y,n,cols,R){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(40,R||120);G.debris.push({x:x+Math.cos(a)*8,y:y+Math.sin(a)*4,z:2,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,vz:rand(120,260),col:pk(cols),s:rand(1.8,3.4),rot:rand(0,TAU),vr:rand(-12,12),life:2.2})}},
  // things falling from the ceiling: stones, or icicles in the frozen rooms
  fall(n,ice){if(!ice){fallingPebbles(n);return}for(let i=0;i<n;i++)G.debris.push({x:rand(L+10,R-10),y:rand(TOP+10,BOT-10),z:rand(180,300),vx:0,vy:0,vz:-10,col:pk(['#e8f6ff','#bfe9ff','#ffffff']),s:rand(2.2,3.6),rot:Math.PI/2,vr:0,life:3.2,fall:true})},
  // the torches burn in the colour of the magic for a while
  torches(cols,light,sec){if(!G.env)return;if(!G.env._base)G.env={...G.env,_base:G.env};G.env.torch=cols;G.env.light=light;G._tT=sec;for(const t of G.torches||[])for(let i=0;i<5;i++)G.embers.push({k:'ember',x:t.x+rand(-3,3),y:t.y-16,vx:rand(-20,20),vy:rand(-70,-30),life:rand(.5,1),max:1,ph:rand(0,9)})},
  burnGrass(x,y,r){if(!G.tufts)return;for(let i=G.tufts.length-1;i>=0;i--){const t=G.tufts[i];if(Math.hypot(t.x-x,(t.y-y)*1.6)<r){G.tufts.splice(i,1);for(let k=0;k<3;k++)G.embers.push({k:'ember',x:t.x+rand(-4,4),y:t.y-4,vx:rand(-10,10),vy:rand(-50,-20),life:rand(.4,.9),max:.9,ph:rand(0,9)});G.fx.push({k:'puff',x:t.x,y:t.y-4,vx:0,vy:-14,t:.5,r:4})}}},
  wiltGrass(x,y,r){if(!G.tufts)return;for(let i=G.tufts.length-1;i>=0;i--){const t=G.tufts[i];if(Math.hypot(t.x-x,(t.y-y)*1.6)<r){G.tufts.splice(i,1);G.debris.push({x:t.x,y:t.y,z:6,vx:rand(-10,10),vy:0,vz:20,col:'#6a5a2a',s:2,rot:0,vr:2,life:1.6,leaf:true})}}},
  ignite(x,y,r){for(const k of G.rocks){if(!WOOD2[k.kind]||k.temp)continue;if(Math.hypot(k.x-x,k.y-y)<r+k.r&&!(k.burn>0)){k.burn=4.5;k.burnt=1}}},
  // marks left on the floor for the rest of the fight
  mark(kind,x,y,r){const c=fx;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';c.lineJoin='round';
    if(kind==='scorch'||kind==='cracks'||kind==='crater'){c.restore();stamp(kind,x,y,r);return}
    if(kind==='frost'){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(235,248,255,.55)');g.addColorStop(1,'rgba(235,248,255,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.5,0,0,TAU);c.fill();
      c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1.2;for(let i=0;i<9;i++){const a=i/9*TAU+rand(-.2,.2),L0=r*rand(.6,1);c.beginPath();c.moveTo(x,y);const ex=x+Math.cos(a)*L0,ey=y+Math.sin(a)*L0*.5;c.lineTo(ex,ey);for(const u of [.45,.7]){const bx=x+(ex-x)*u,by=y+(ey-y)*u;for(const s of [-1,1]){c.moveTo(bx,by);c.lineTo(bx+Math.cos(a+s*.8)*5,by+Math.sin(a+s*.8)*2.5)}}c.stroke()}}
    else if(kind==='roots'){for(let i=0;i<5;i++){const a=rand(0,TAU),len=r*rand(.6,1.1),cx=x+Math.cos(a+.5)*len*.5,cy=y+Math.sin(a+.5)*len*.25,ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len*.5;for(const[col,w] of [['#1b1612',4.5],['#4a3424',2.4]]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(cx,cy,ex,ey);c.stroke()}
      if(Math.random()<.6){c.fillStyle='#4f8a34';c.beginPath();c.ellipse(ex,ey,3,1.6,a,0,TAU);c.fill()}}}
    else if(kind==='bloom'){for(let i=0;i<7;i++){const a=rand(0,TAU),d=rand(.2,1)*r,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.5;c.strokeStyle='#4f8a34';c.lineWidth=1.2;c.beginPath();c.moveTo(px,py+3);c.lineTo(px,py);c.stroke();const col=pk(['#c48ae8','#f2a0c8','#f6ead2']);c.fillStyle=col;for(let k=0;k<5;k++){c.beginPath();c.arc(px+Math.cos(k*1.26)*1.9,py+Math.sin(k*1.26)*1.5,1.3,0,TAU);c.fill()}c.fillStyle='#ffd23c';c.beginPath();c.arc(px,py,.9,0,TAU);c.fill()}}
    else if(kind==='toxic'){for(let i=0;i<4;i++){const px=x+rand(-r,r)*.6,py=y+rand(-r,r)*.3,rr=r*rand(.3,.55);const g=c.createRadialGradient(px,py,0,px,py,rr);g.addColorStop(0,'rgba(120,200,60,.5)');g.addColorStop(1,'rgba(120,200,60,0)');c.fillStyle=g;c.beginPath();c.ellipse(px,py,rr,rr*.5,0,0,TAU);c.fill()}}
    else if(kind==='puddle'){const rx=r,ry=r*.5,pts=[...Array(12)].map((_,k)=>{const a=k/12*TAU,q=1+rand(-.12,.12);return[x+Math.cos(a)*rx*q,y+Math.sin(a)*ry*q]});const sh=(sc)=>{c.beginPath();pts.forEach(([px,py],k)=>{const X=x+(px-x)*sc,Y=y+(py-y)*sc;k?c.lineTo(X,Y):c.moveTo(X,Y)});c.closePath()};
      sh(1.2);c.fillStyle='rgba(0,0,0,.16)';c.fill();const g=c.createLinearGradient(0,y-ry,0,y+ry);g.addColorStop(0,'rgba(20,34,28,.88)');g.addColorStop(1,'rgba(80,110,90,.6)');sh(1);c.fillStyle=g;c.fill();c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=1.2;c.beginPath();c.moveTo(x-rx*.4,y+ry*.2);c.lineTo(x+rx*.1,y+ry*.2);c.stroke();
      (G.puddles=G.puddles||[]).push({x,y,rx:rx*.9,ry:ry*.9})}
    else if(kind==='coins'){for(let i=0;i<8;i++){const px=x+rand(-r,r),py=y+rand(-r,r)*.45;c.fillStyle=pk(['#ffd23c','#f2b800','#c98a0c']);c.strokeStyle='#1b1612';c.lineWidth=.8;c.beginPath();c.ellipse(px,py,2.6,1.3,0,0,TAU);c.fill();c.stroke()}}
    c.restore()},
  splash(x,y,n,col){for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(30,110);G.debris.push({x,y,z:4,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,vz:rand(120,240),col,s:1.8,rot:0,vr:0,life:2,drop:true})}for(let k=0;k<3;k++)G.ripples.push({x,y,r:4+k*6,max:30+k*16,a:1})}};
const WOOD2={stump:1,crate:1,deadtree:1,totem:1,reeds:1,thorns:1};
const ICE_T=['#7fd3f0','#c9f3ff','#ffffff'],ICE_L='140,210,255';
// when each boss changes move: [from state|sub] -> [to state|sub]
function b2react(e,ps,pb,ns,nb){const x=e.x,y=e.y,ice=isIce(themeOf(G.room)),S=stonePal(),stone=[S.hi,S.mid,S.lo];
  switch(e.type){
    case 'golem':
      if(ps==='leap'&&pb==='air'){ENV2.rocks(x,y,190,3);ENV2.fall(e.p2?14:9);ENV2.chunks(x,y,18,stone,150);ENV2.mark('cracks',x,y,60);ENV2.wiltGrass(x,y,70);for(const t of G.torches||[])t.ph+=2}
      if(ns==='roll'&&nb==='roll')e._rollMark=0;break;
    case 'witch':
      if(ns==='blink'&&nb==='a'){ENV2.mark('roots',x,y+4,34);ENV2.wiltGrass(x,y,50)}
      if(ps==='blink'){ENV2.mark('bloom',x,y+4,26);for(let i=0;i<10;i++)G.debris.push({x:x+rand(-20,20),y,z:rand(30,60),vx:rand(-30,30),vy:0,vz:rand(10,40),col:pk(['#c48ae8','#7bbf4a']),s:2,rot:rand(0,TAU),vr:3,life:2,leaf:true})}
      if(ns==='spiral'||ns==='summon')ENV2.torches(e.p2?['#ff3c10','#ff8a22','#ffe6a0']:['#7a2fd0','#c07aff','#f4e6ff'],e.p2?'255,120,60':'190,120,255',3);
      if(ns==='roots'){ENV2.mark('roots',P.x,P.y+4,40);ENV2.rocks(P.x,P.y,90,1);ENV2.chunks(P.x,P.y,10,['#4a3424','#5a3f2a',S.mid],90)}break;
    case 'salamander':
      if(ps==='burrow'&&pb==='under'){ENV2.mark('scorch',x,y,40);ENV2.rocks(x,y,120,2);ENV2.chunks(x,y,16,['#3a2a24','#ff7a2e','#5a4038'],140);ENV2.burnGrass(x,y,70);ENV2.ignite(x,y,70)}
      if(ns==='burrow'&&nb==='a')ENV2.mark('cracks',x,y,30);break;
    case 'smith':
      if(ps==='slam'&&pb==='a'){const sx=e.sx!=null?e.sx:x,sy=e.sy!=null?e.sy:y;ENV2.rocks(sx,sy,150,4);ENV2.mark('cracks',sx,sy,62);ENV2.mark('scorch',sx,sy,36);ENV2.chunks(sx,sy,16,['#3a3a42','#ff7a2e','#5f5f68'],160);ENV2.fall(8);ENV2.burnGrass(sx,sy,70);ENV2.ignite(sx,sy,80);
        ENV2.torches(['#ffffff','#ffd86b','#ff8a22'],'255,220,160',1.2)}
      if(ns==='rain'||ns==='anvil')ENV2.fall(6);break;
    case 'toad':
      if((ps==='flop'||ps==='mega')&&pb==='air'){const big=ps==='mega';ENV2.splash(x,y,big?26:14,'#bfe9d0');ENV2.rocks(x,y,big?200:120,big?3:1.5);ENV2.mark('puddle',x+rand(-10,10),y+8,big?40:26);ENV2.chunks(x,y,8,['#46432a','#68643c'],110);if(big)ENV2.fall(8)}break;
    case 'hydra':
      if(ns==='dive'&&nb==='under'||ps==='dive'&&pb==='under'){ENV2.splash(x,y,22,'#cfe9d8');for(const p of G.puddles||[])G.ripples.push({x:p.x,y:p.y,r:3,max:p.rx,a:.9});ENV2.rocks(x,y,140,1)}
      if(ns==='breath'){const a=Math.atan2(P.y-y,P.x-x);for(let d=60;d<260;d+=50){const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;ENV2.mark('toxic',px,py,30);ENV2.wiltGrass(px,py,30)}}break;
    case 'yeti':
      if((ps==='leap'&&pb==='air')||(ps==='pound'&&pb==='a')){ENV2.rocks(x,y,180,3);ENV2.fall(10,true);ENV2.mark('frost',x,y,ps==='pound'?80:60);ENV2.chunks(x,y,14,ICE_T,140)}
      if(ns==='roar'&&nb==='b'){for(const k of G.rocks){const a=Math.atan2(k.y-y,k.x-x);for(let i=0;i<4;i++)G.debris.push({x:k.x,y:k.y,z:kH(k)*.9,vx:Math.cos(a)*rand(60,120),vy:Math.sin(a)*rand(30,60),vz:rand(30,80),col:'#ffffff',s:2,rot:0,vr:4,life:1.6})}ENV2.rocks(x,y,400,0);ENV2.torches(['#1a62ff','#7fc8ff','#f0fbff'],ICE_L,2)}
      if(ns==='avalanche')ENV2.fall(16,true);break;
    case 'icequeen':
      if(ns==='nova'&&nb==='b'||ps==='nova'){ENV2.mark('frost',x,y,90);ENV2.torches(['#1a62ff','#7fc8ff','#f0fbff'],ICE_L,2.5);ENV2.rocks(x,y,160,1)}
      if(ns==='blizzard'||ns==='storm'){ENV2.fall(8,true);ENV2.torches(['#5fb8ff','#bfe6ff','#ffffff'],ICE_L,3)}break;
    case 'mimic':
      // the mouth now sits high on its legs: the tongue and the coins come out of it
      if(ns==='tongue')for(const l of G.lines)if(l.col==='red'&&Math.abs(l.y-(y-8))<.5)l.y=y-30;
      if(ps==='coins')for(const p of G.eproj)if(Math.abs(p.y-(y-14))<.5&&Math.hypot(p.x-x,p.y-y)<30)p.y=y-28;
      if(ns==='quake'||ps==='quake'&&pb==='a'){ENV2.rocks(x,y,180,2);ENV2.fall(8);ENV2.mark('cracks',x,y,44);ENV2.chunks(x,y,12,[S.hi,S.mid,S.lo],140)}
      if(ps==='chomp'&&pb==='a'){for(const k of G.rocks)if(Math.hypot(k.x-x,k.y-y)<k.r+e.r+30&&!k.temp){k.hit=.3;k.dmg=(k.dmg||0)+3;ENV2.chunks(k.x,k.y,6,['#8a6038','#6b4a2a'],80)}}break}}
{const _u=update;update=function(dt){_u(dt);if(!BOSS2||!G||!G.enemies)return;
  // torches go back to their colour
  if(G._tT>0){G._tT-=dt;if(G._tT<=0&&G.env&&G.env._base)G.env=G.env._base}
  for(const e of G.enemies){if(!B2[e.type]||e.dead)continue;const key=e.st+'|'+e.sub;if(e._b2k!==key){const[ps,pb]=(e._b2k||'|').split('|');e._b2k=key;if(!(e.intro>0))b2react(e,ps,pb,e.st,e.sub)}
    // the golem's roll grinds a trail into the floor and knocks chips off the walls when it bounces
    if(e.type==='golem'&&e.st==='roll'&&e.sub==='roll'){e._rollMark=(e._rollMark||0)+dt;if(e._rollMark>.07){e._rollMark=0;ENV2.mark('cracks',e.x,e.y+6,10)}
      const sx=Math.sign(e.vx),sy=Math.sign(e.vy);if(e._rsx!=null&&(sx!==e._rsx||sy!==e._rsy)){ENV2.rocks(e.x,e.y,80,2);ENV2.chunks(e.x,e.y,8,[stonePal().mid,stonePal().lo],120);ENV2.fall(3)}e._rsx=sx;e._rsy=sy}
    // the salamander scorches the ground she crawls on
    if(e.type==='salamander'&&e.st!=='burrow'&&e.moving){e._sc=(e._sc||0)+dt;if(e._sc>.18){e._sc=0;ENV2.burnGrass(e.x,e.y,22);ENV2.ignite(e.x,e.y,8)}}}
  // fire: zones scorch the floor once, burn grass and light up wood; burning wood smokes and wears
  for(const z of G.zones||[]){if(z.kind==='fire'){if(!z._sc){z._sc=1;ENV2.mark('scorch',z.x,z.y,z.r*.8)}ENV2.burnGrass(z.x,z.y,z.r);ENV2.ignite(z.x,z.y,z.r*.6)}else if(z.kind==='frost'&&!z._sc){z._sc=1;ENV2.mark('frost',z.x,z.y,z.r)}}
  for(const k of G.rocks){if(k.burn>0){k.burn-=dt;if(Math.random()<.5)fxPush({k:'firep',x:k.x+rand(-k.r,k.r)*.6,y:k.y-kH(k)*rand(.4,1),r:rand(4,8),t:.5,max:.5});if(Math.random()<.15)G.embers.push({k:'smoke',x:k.x,y:k.y-kH(k),vx:rand(-4,4),vy:rand(-24,-12),life:1.6,max:1.8,r:4});
    if(k.burn<=0){k.dmg=(k.dmg||0)+5;k.hit=.2;ENV2.mark('scorch',k.x,k.y+2,k.r*1.3)}}}
  // boulders and falling anvils or meteors: the impact cracks what is around
  const live=new Set([...(G.boulders||[]),...(G.meteors||[])]);for(const b of G._b2live||[])if(!live.has(b)){const x=b.tx!=null?b.tx:b.x,y=b.ty!=null?b.ty:b.y;ENV2.rocks(x,y,70,2);ENV2.chunks(x,y,8,[stonePal().mid,stonePal().lo],100);if(b.r||b.kind==='anvil'){ENV2.burnGrass(x,y,30);ENV2.ignite(x,y,30)}}G._b2live=live}}
// burning wood: real flames on the obstacle
{const _dr=drawRock;drawRock=function(k){_dr(k);if(BOSS2&&k.burn>0&&ctx===MAINCTX){const t=G.t||0,h=kH(k),f=Math.min(1,k.burn/1.2);ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',k.x,k.y-h*.6,k.r*2.2,.45*f);ctx.restore();
  for(let i=-1;i<=1;i++)b2fl(k.x+i*k.r*.45,k.y-h*(.55+.25*(i===0)),k.r*.32*f*(1+.2*Math.sin(t*12+i*2)),Math.sin(t*9+i)*2.4)}}}

