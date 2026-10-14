// ---------- LE ARMI SPECIALI in partita (punto 24 del piano di Denis, anteprima 47): il Lanciafiamme (un cono di fuoco che si ferma ai muri;
// gli zombie che prende continuano a bruciare per un po'), il Fucile a vapore (tra un colpo e l'altro la pressione sale, la lancetta lo mostra:
// il chiodo colpisce più forte e passa attraverso quattro zombie, poi sfiata il vapore), il Risonatore (un'onda che parte dall'eroe e si
// allarga fino al suo raggio, segnato a terra: colpisce, respinge e stordisce ogni zombie nel momento in cui lo raggiunge). La Mitraglietta a
// tamburo spara come le altre. Il motore chiama W.shotHook a ogni colpo (motore.js fireShot); qui anche il fuoco, il vapore e le onde.
(()=>{const{W,S,rr,cl,lerp,ez,TAU,hurt,hit,move,inGround}=ZM;
const SP={fl:[],waves:[],steam:[],sparks:[],pay:0};
const md=()=>W.mods||{};
const wallAt=(x,y)=>{const s0=hit(x,y,1.5);return!!s0&&s0.tag!=='hole'};
function pay(ev){if(!ev.paid&&W.director&&W.director.shotHit){ev.paid=1;W.director.shotHit()}}
function suono(w){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01;AU.pan=0;
  if(w==='brucia')fNoise(t,.12,'bandpass',VR(1800,.3),1.2,.03,{f2:900})
  else if(w==='onda')fThump(t,VR(90,.1),40,.2,.35,.2)}catch(e){}}
W.shotHook=(ev,g,D,o)=>{const h=W.hero,dm=md().dmg||1;
  if(D.flame){// a cone of fire: every zombie in reach and inside the cone takes the flame and catches fire
    const a0=h.aim,half=(D.spread/2+8)*Math.PI/180;let reach=D.range,any=false;
    for(let s=10;s<D.range;s+=6)if(wallAt(h.x+Math.cos(a0)*s,h.y+Math.sin(a0)*s)){reach=s;break}
    for(const z of W.Z){if(z.die||z.rise<1)continue;const dx=z.x-h.x,dy=z.y-h.y,d=Math.hypot(dx,dy);if(d>reach+10*z.sc)continue;let da=Math.atan2(dy,dx)-a0;da=Math.atan2(Math.sin(da),Math.cos(da));
      if(Math.abs(da)>half+Math.atan2(10*z.sc,Math.max(d,1)))continue;hurt(z,D.dmg*dm,false);if(!z.burn)suono('brucia');z.burn=2.6;any=true}
    // the coins of a hit: one flame in four (the flamethrower fires twelve times a second)
    if(any&&(SP.pay=(SP.pay+1)%4)===0)pay(ev);
    const n=LOWFX?2:4;for(let i=0;i<n;i++){const a=a0+rr(-half,half)*.8,sp=rr(.8,1.05)*reach;SP.fl.push({x:h.x+Math.cos(a0)*14,y:h.y+Math.sin(a0)*14,vx:Math.cos(a)*sp*2.3,vy:Math.sin(a)*sp*2.3,z:(h.zh||0)+17,t:0,T:rr(.36,.48),r:rr(3,5)})}
    return true}
  if(D.wave){// the wave: from the hero to D.range in half a second; each zombie is hit once, when the ring reaches it
    SP.waves.push({x:h.x,y:h.y,t:0,T:.5,R:D.range,dmg:D.dmg*dm,hit:new Set(),ev});if(W.director)W.director.shake=Math.max(W.director.shake||0,.32);return true}
  if(D.charge){// the steam bolt: its strength by the pressure, straight on through D.pierce+1 zombies, then the steam out of the vent
    const pr=g.pr==null?1:g.pr,k=.55+.9*pr,a=h.aim+(ev.ang[0]||0),dx=Math.cos(a),dy=Math.sin(a);let end=D.range,left=(D.pierce||0)+1;
    for(let s=12;s<D.range;s+=5)if(wallAt(h.x+dx*s,h.y+dy*s)){end=s;break}
    const L=[];for(const z of W.Z){if(z.die||z.rise<1)continue;const rx=z.x-h.x,ry=z.y-h.y,al=rx*dx+ry*dy;if(al<0||al>end)continue;if(Math.abs(rx*dy-ry*dx)<11*z.sc)L.push([al,z])}L.sort((p,q)=>p[0]-q[0]);
    const cr=md().crit||0;for(const[al,z] of L){const c=cr>0&&Math.random()<cr;hurt(z,D.dmg*k*dm*(c?2:1),true);if(c&&W.onCrit)W.onCrit(z);pay(ev);if(--left<=0){end=al;break}}
    W.FX.push({k:'shot',hw:o.hw,ao:o.ao,tw:[h.x+dx*end,h.y+dy*end,0],bo:[0,o.ty],t:.14,w:1.6+pr*1.6});
    for(let i=0;i<(LOWFX?3:8);i++)SP.steam.push({x:h.x-dx*4+rr(-4,4),y:h.y-dy*4+rr(-4,4),z:(h.zh||0)+20,vx:rr(-24,24)-dx*14,vy:rr(-24,24)-dy*14,vz:rr(14,34),t:0,T:rr(.7,1.2),r:rr(3,6)});
    g.pr=0;return true}
  return false};
// ------------------------------------------------------------------ every frame: the fire, the burning zombies, the waves, the steam, the pressure
function update(dt){const g=ZM.gun(),dm=md().dmg||1;
  for(const f of SP.fl){f.t+=dt;const dr=Math.exp(-3.2*dt);f.vx*=dr;f.vy*=dr;f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=dt*14}SP.fl=SP.fl.filter(f=>f.t<f.T);
  for(const z of W.Z){if(!(z.burn>0))continue;if(z.die){z.burn=0;continue}z.burn-=dt;z.bt=(z.bt||0)-dt;if(z.bt<=0){z.bt=.25;hurt(z,3.5*dm,false)}
    if(!LOWFX&&Math.random()<dt*14)SP.sparks.push({x:z.x+rr(-6,6),y:z.y+rr(-3,3),z:(z.zh||0)+rr(14,40)*z.sc,t:0,T:rr(.3,.55),r:rr(2,3.4)})}
  for(const s of SP.sparks){s.t+=dt;s.z+=dt*26}SP.sparks=SP.sparks.filter(s=>s.t<s.T);
  for(const w of SP.waves){w.t+=dt;const r=w.R*ez(Math.min(1,w.t/w.T));
    for(const z of W.Z){if(z.die||z.rise<1||w.hit.has(z))continue;const dx=z.x-w.x,dy=z.y-w.y,d=Math.hypot(dx,dy)||1;if(d-8*z.sc>r||d>w.R+12)continue;w.hit.add(z);
      hurt(z,w.dmg*(z.boss?.6:1),true);pay(w.ev);suono('onda');
      // the push: harder near the hero; the bosses only stagger
      if(!z.die){const P=(z.boss?18:40+70*(1-d/w.R)),n=Math.ceil(P/4);for(let i=0;i<n;i++)move(z,dx/d*P/n,dy/d*P/n,11);if(!z.ai)z.stun=Math.max(z.stun||0,.9)}
      if(!LOWFX)for(let i=0;i<5;i++)SP.sparks.push({x:z.x,y:z.y,z:(z.zh||0)+rr(10,36),t:0,T:rr(.3,.5),r:rr(1.6,2.8),g:1})}}
  SP.waves=SP.waves.filter(w=>w.t<w.T+.35);
  for(const s of SP.steam){s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.vx*=Math.exp(-2*dt);s.vy*=Math.exp(-2*dt)}SP.steam=SP.steam.filter(s=>s.t<s.T);
  // the steam rifle's pressure rises while it waits (the needle of its gauge shows it)
  if(g&&W.gunId==='vapore'){if(g.pr==null)g.pr=1;if(g.cd<=0&&g.st==='pronta')g.pr=Math.min(1,g.pr+dt/(g.D.charge||1.6));
    if(!g.__pw){const p0=g.pose;g.pose=function(){const q=p0.apply(this,arguments);q.gauge=g.pr==null?1:g.pr;return q};g.__pw=1}}}
// ------------------------------------------------------------------ the drawings
function drawGround(){const h=W.hero,g=ZM.gun();
  if(!SP.waves.length&&!(g&&W.gunId==='risonatore'))return;inGround(()=>{
  // the reach of the resonator, always on the ground around the hero while he holds it
  if(g&&W.gunId==='risonatore'&&!h.dead){ctx.save();ctx.setLineDash([7,6]);ctx.lineDashOffset=-W.t*12;ctx.strokeStyle='rgba(120,255,210,.32)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(h.x,h.y,g.D.range,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore()}
  for(const w of SP.waves){const k=Math.min(1,w.t/w.T),r=w.R*ez(k),a=w.t<w.T?1:1-(w.t-w.T)/.35;ctx.save();
    ctx.globalAlpha=.55*a;ctx.fillStyle='rgba(60,200,160,.18)';ctx.beginPath();ctx.arc(w.x,w.y,r,0,TAU);ctx.fill();
    ctx.globalAlpha=a;ctx.strokeStyle='rgba(150,255,220,.95)';ctx.lineWidth=4*(1-k*.5)+1;ctx.beginPath();ctx.arc(w.x,w.y,r,0,TAU);ctx.stroke();
    if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(120,255,210,.45)';ctx.lineWidth=12*(1-k*.6);ctx.beginPath();ctx.arc(w.x,w.y,r,0,TAU);ctx.stroke()}ctx.restore()}})}
function drawTop(){
  // the fire: hot in the middle, red at the edges, smoke at the end
  if(SP.fl.length){ctx.save();ctx.globalCompositeOperation='lighter';for(const f of SP.fl){const k=f.t/f.T,q=S(f.x,f.y,f.z),r=f.r*(1+k*2.2);
      ctx.fillStyle=k<.35?`rgba(255,240,170,${.75*(1-k)})`:k<.7?`rgba(255,150,40,${.7*(1-k)})`:`rgba(200,60,20,${.5*(1-k)})`;ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.fill()}ctx.restore()}
  // the zombies that burn, the sparks of the waves
  if(SP.sparks.length){ctx.save();ctx.globalCompositeOperation='lighter';for(const s of SP.sparks){const k=s.t/s.T,q=S(s.x,s.y,s.z);ctx.fillStyle=s.g?`rgba(150,255,220,${1-k})`:`rgba(255,${150+Math.round(80*(1-k))},50,${.9*(1-k)})`;
      ctx.beginPath();if(s.g)ctx.arc(q[0],q[1],s.r*(1-k*.5),0,TAU);else{ctx.moveTo(q[0],q[1]-s.r*2);ctx.quadraticCurveTo(q[0]+s.r,q[1],q[0],q[1]+s.r*.6);ctx.quadraticCurveTo(q[0]-s.r,q[1],q[0],q[1]-s.r*2)}ctx.fill()}ctx.restore()}
  // the steam
  for(const s of SP.steam){const k=s.t/s.T,q=S(s.x,s.y,s.z);ctx.save();ctx.globalAlpha=.42*(1-k);ctx.fillStyle='#e8eef2';ctx.beginPath();ctx.arc(q[0],q[1],s.r*(1+k*1.8),0,TAU);ctx.fill();ctx.restore()}
  // the wave seen standing: a glowing wall that runs outward
  if(!LOWFX)for(const w of SP.waves){if(w.t>w.T)continue;const k=w.t/w.T,r=w.R*ez(k),n=26;ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){const a=i/n*TAU,p=S(w.x+Math.cos(a)*r,w.y+Math.sin(a)*r,0),p2=S(w.x+Math.cos(a)*r,w.y+Math.sin(a)*r,16*(1-k));
      const gr=ctx.createLinearGradient(p[0],p[1],p2[0],p2[1]);gr.addColorStop(0,`rgba(150,255,220,${.5*(1-k)})`);gr.addColorStop(1,'rgba(150,255,220,0)');ctx.strokeStyle=gr;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke()}ctx.restore()}}
// agganciati alla partita (come fortuna.js)
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__sp)return D;D.__sp=1;
  const _u=D.update;D.update=(dt,on)=>{_u(dt,on);try{update(dt)}catch(e){console.error(e)}};
  const _g=D.drawGround;D.drawGround=dt=>{_g(dt);drawGround()};const _t=D.drawTop;D.drawTop=dt=>{_t(dt);drawTop()};
  const _r=D.reset;D.reset=()=>{_r();SP.fl.length=0;SP.waves.length=0;SP.steam.length=0;SP.sparks.length=0;for(const z of W.Z)z.burn=0};return D}}
ZM.speciali=SP})();
