// ---------- experience, event rooms, elites ----------
const XPV={slime:4,bigslime:8,bat:3,goblin:5,plant:6,skeleton:7,mushroom:5,wisp:6,beetle:4,golem:70,witch:0};
const needXp=l=>Math.round(18+8*(l-1));
function dropXp(e){const v=(XPV[e.type]||4)*(e.elite?3:1);if(!v)return;const n=Math.min(7,Math.ceil(v/3));
  for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(30,90);G.orbs.push({x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,v:v/n,ph:rand(0,6)})}}
function gainXp(v){P.xp+=v;let up=0;while(P.xp>=P.need){P.xp-=P.need;P.lvl++;P.need=needXp(P.lvl);P.pendingLv++;up++}
  if(up&&G.state!=='dead'){banner('Livello '+P.lvl+'!','Nuova abilità',1.2);sfx('levelup');P.hp=Math.min(P.maxhp,P.hp+Math.round(P.maxhp*.06));
    for(let i=0;i<22;i++){const a=i/22*TAU;G.fx.push({k:'lvl',x:P.x,y:P.y-8,vx:Math.cos(a)*170,vy:Math.sin(a)*110,t:.5})}
    G.waves.push({x:P.x,y:P.y,r:6,max:90,dmg:0,hit:true,col:'lvl'});G.lvlT=Math.max(G.lvlT||0,.45)}}
function updOrbs(dt){
  const all=G.state!=='play';
  for(let i=G.orbs.length-1;i>=0;i--){const o=G.orbs[i];o.t+=dt;const dx=P.x-o.x,dy=P.y-6-o.y,d=Math.hypot(dx,dy)||1;
    if(o.t>.4&&(d<80||all)){const sp=170+o.t*260;o.x+=dx/d*sp*dt;o.y+=dy/d*sp*dt}
    else{o.x+=o.vx*dt;o.y+=o.vy*dt;o.vx*=.9;o.vy*=.9;o.x=clamp(o.x,L+6,R-6);o.y=clamp(o.y,TOP+6,BOT-6)}
    if(d<14&&o.t>.3){G.orbs.splice(i,1);sfx('xp');gainXp(o.v)}}
  if(G.lvlT>0&&!modal){G.lvlT-=dt;if(G.lvlT<=0&&P.pendingLv>0&&G.state!=='dead'&&G.state!=='trans'){P.pendingLv--;openSkills('level')}}
}
function drawOrbs(){for(const o of G.orbs){const b=Math.sin(G.t*5+o.ph)*1.5;glow('120,255,170',o.x,o.y-3+b,9,.5);
  ctx.save();ctx.translate(o.x,o.y-3+b);ctx.rotate(G.t*2+o.ph);ink(1.4);ctx.beginPath();ctx.moveTo(0,-4.5);ctx.lineTo(3.2,0);ctx.lineTo(0,4.5);ctx.lineTo(-3.2,0);ctx.closePath();fs('#6ff0a8');ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(-1,-3,1.5,2.5);ctx.restore()}}
// --- run structure: combat rooms with event rooms in between ---
const EVENTS={
  fontana:{n:'Fontana della vita',sub:'Bevi per recuperare metà della salute'},
  mercante:{n:'Il Mercante errante',sub:"Spendi l'oro raccolto in questa partita"},
  altare:{n:'Altare maledetto',sub:'Due abilità in cambio di una maledizione'},
  tesoro:{n:'Stanza del tesoro',sub:'Apri lo scrigno'}};
const CURSES=[
  {n:'Vita fragile',d:'Salute massima -25%',f:()=>{P.maxhp=Math.round(P.maxhp*.75);P.hp=Math.min(P.hp,P.maxhp)}},
  {n:'Passo pesante',d:'Ricarica dello scatto +50%',f:()=>{P.dashMax*=1.5}},
  {n:'Orda furiosa',d:'Nemici con il 25% di salute in più',f:()=>{G.curseHp=(G.curseHp||1)*1.25}},
  {n:'Mano tremante',d:"Velocità d'attacco -15%",f:()=>{P.aspd*=.85}}];
function makeSeq(){const ev=shuffle(Object.keys(EVENTS)).slice(0,3),seq=[];
  // beginners never meet the flawless trial right after room 2: move it to a later slot
  if(ev[0]==='sfida'&&((SAVE.trBest||0)<400||(SAVE.runs||0)<8)){const j=1+((Math.random()*2)|0);[ev[0],ev[j]]=[ev[j],ev[0]]}
  for(let r=1;r<=ROOMS;r++){seq.push({c:r});if(r===2)seq.push({e:ev[0]});if(r===5)seq.push({e:ev[1]});if(r===7)seq.push({e:ev[2]})}return seq}
function nextStep(){G.si++;if(P.roomHeal&&!G.event)P.hp=Math.min(P.maxhp,P.hp+Math.round(P.maxhp*P.roomHeal));const st=G.seq[G.si];if(st.c){G.room=st.c;G.event=null}else G.event=st.e;buildRoom()}
function setupEvent(){
  const ev=G.event;if(ev==='oro'){setupGoldRoom();return}if(ev==='sfida'){setupTrial();return}G.state='cleared';G.clearT=0;G.door=true;
  G.prop={kind:ev,x:AW/2,y:TOP+(BOT-TOP)*.42,used:false,inside:false,r:ev==='mercante'?16:22};
  if(ev==='mercante'){G.shopOffer=null;G.shopSold={}}
  if(ev==='altare')G.curse=CURSES[randi(0,CURSES.length-1)];
}
function updEvent(dt){
  if(G.goldRun)updGoldRoom(dt);
  const p=G.prop;if(!p)return;const f=PROP_FOOT[p.kind],near=f?touching(P,{x:p.x,y:p.y+f[2],rx:f[0],ry:f[1]},8):Math.hypot(P.x-p.x,P.y-p.y)<p.r+26;
  if(near&&!p.inside&&!modal){p.inside=true;
    if(p.kind==='fontana'&&!p.used){p.used=true;const v=Math.round(P.maxhp*.5);P.hp=Math.min(P.maxhp,P.hp+v);text(P.x,P.y-40,'+'+v,'#7bbf4a',18);sfx('heal');for(let i=0;i<16;i++)G.fx.push({k:'lvl',x:p.x,y:p.y-10,vx:rand(-80,80),vy:rand(-120,-20),t:.6})}
    else if(p.kind==='tesoro'&&!p.used){p.used=true;sfx('door');for(let i=0;i<26;i++){const a=rand(0,TAU),s=rand(60,170);G.coins.push({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0})}G.hearts.push({x:p.x+20,y:p.y+16,t:0});shake(4);setTimeout(()=>openSkills('treasure'),450)}
    else if(p.kind==='mercante')openSkills('shop');
    else if(p.kind==='altare'&&!p.used)openSkills('altar')}
  if(!near)p.inside=false;
}
function drawProp(p){
  const x=p.x,y=p.y;ink(2.5);
  if(p.kind==='fontana'){
    ell(x,y,34,15);fs('#6f7a7a');ell(x,y-4,30,12);fs('#5d6868');
    ctx.save();ell(x,y-4,26,10);ctx.clip();ctx.fillStyle=p.used?'#2a4450':'#3a8fb0';ctx.fillRect(x-30,y-16,60,24);
    ctx.strokeStyle='rgba(220,245,255,.5)';ctx.lineWidth=1.3;for(let k=0;k<3;k++){const r=((G.t*12+k*8)%24);ell(x,y-4,r,r*.4);ctx.stroke()}ctx.restore();
    ink(2.5);ctx.beginPath();ctx.rect(x-5,y-34,10,30);fs('#7d8888');ell(x,y-34,9,4);fs('#8f9a9a');
    if(!p.used){ctx.strokeStyle='rgba(170,225,255,.85)';ctx.lineWidth=2;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(x,y-36);ctx.quadraticCurveTo(x+s*14,y-46,x+s*18,y-8);ctx.stroke()}
      ctx.fillStyle='#d8f4ff';for(let k=0;k<4;k++){const q=(G.t*1.6+k*.25)%1;circ(x+(k%2?1:-1)*(4+q*14),y-38+q*30,1.4);ctx.fill()}}
  }else if(p.kind==='mercante'){
    ctx.fillStyle='#7a2f2a';ctx.beginPath();ctx.ellipse(x,y+6,40,14,0,0,TAU);ctx.fill();ctx.strokeStyle='#d9a64a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+6,34,11,0,0,TAU);ctx.stroke();
    for(const[ox,col] of [[-24,'#e5484d'],[-14,'#4d97ff'],[22,'#6cc24a']]){ink(1.6);ctx.beginPath();ctx.rect(x+ox-3,y+2,6,8);fs(col);ctx.beginPath();ctx.rect(x+ox-1.5,y-1,3,3);fs('#c9cfd6')}
    ink(2.5);ctx.beginPath();ctx.rect(x-22,y-30,16,26);fs('#6b4a2a');ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-22,y-20);ctx.lineTo(x-6,y-20);ctx.stroke();
    drawRig(x,y,Math.atan2(P.y-y,P.x-x),0,false,MERCHANT,{});
    if(!p.inside){const b=Math.sin(G.t*4)*3;ctx.fillStyle='#ffc93c';ctx.font='18px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('$',x,y-50+b);ctx.fillText('$',x,y-50+b)}
  }else if(p.kind==='altare'){
    ctx.beginPath();ctx.rect(x-26,y-24,52,24);fs('#3a3440');ctx.beginPath();ctx.moveTo(x-30,y-24);ctx.lineTo(x+30,y-24);ctx.lineTo(x+26,y-32);ctx.lineTo(x-26,y-32);ctx.closePath();fs('#4a4252');
    ctx.strokeStyle=p.used?'rgba(140,90,180,.3)':'rgba(190,120,255,.85)';ctx.lineWidth=2;for(const ox of [-14,0,14]){ctx.beginPath();ctx.moveTo(x+ox-4,y-18);ctx.lineTo(x+ox,y-8);ctx.lineTo(x+ox+4,y-18);ctx.stroke()}
    for(const ox of [-34,34]){ink(1.5);circ(x+ox,y-2,5);fs('#e0d9c4');ctx.fillStyle=INK;circ(x+ox-1.8,y-2,1.2);ctx.fill();circ(x+ox+1.8,y-2,1.2);ctx.fill()}
    if(!p.used)flame(x,y-30,1.3,['#7a2fd0','#c07aff','#f4e6ff'],1);
  }else{
    const open=p.used;ctx.beginPath();ctx.rect(x-24,y-24,48,24);fs('#b0791c');ctx.strokeStyle='#ffe08a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-12,y-24);ctx.lineTo(x-12,y);ctx.moveTo(x+12,y-24);ctx.lineTo(x+12,y);ctx.stroke();ink(2.5);ctx.strokeRect(x-24,y-24,48,24);
    if(open){ctx.beginPath();ctx.moveTo(x-24,y-24);ctx.lineTo(x+24,y-24);ctx.lineTo(x+20,y-46);ctx.lineTo(x-20,y-46);ctx.closePath();fs('#8a5a10');ctx.fillStyle='#ffd84a';ell(x,y-24,20,5);ctx.fill()}
    else{ctx.beginPath();ctx.moveTo(x-24,y-24);ctx.quadraticCurveTo(x,y-44,x+24,y-24);ctx.closePath();fs('#8a5a10');ctx.beginPath();ctx.rect(x-5,y-28,10,10);fs('#e5484d');glow('255,210,90',x,y-20,40,.25+.1*Math.sin(G.t*3))}
  }
  if(!p.used||p.kind==='mercante'){ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;const t=EVENTS[p.kind].n;ctx.strokeText(t,x,y+30);ctx.fillStyle='#f6ead2';ctx.fillText(t,x,y+30)}
}
// --- elites ---
function eliteRoll(t){const n=effRoom();if(isBoss(t)||n<DIFF.eliteFrom||(G.mode!=='inf'&&!G.arena&&!G.daily&&G.room<DIFF.eliteFirstArena))return false;return Math.random()<Math.min(DIFF.eliteMax,(DIFF.eliteBase+(n-DIFF.eliteFrom)*DIFF.eliteRoom)*(G.eliteBoost||1))}
function drawEliteAura(e){if(!e.elite||e.spawn>0||e.hidden)return;const p=.5+.5*Math.sin(G.t*4+e.t);
  glow('255,200,60',e.x,e.y+2,e.r*2.2,.28+.15*p,e.r*1.1);ctx.strokeStyle=`rgba(255,201,60,${.5+.3*p})`;ctx.lineWidth=2;ell(e.x,e.y+3,e.r*1.5,e.r*.62);ctx.stroke()}

// ---------- mechanics ----------
// special-room objects are solid: each one has an elliptical footprint you bump into and walk around
const PROP_FOOT={fontana:[34,15,0],mercante:[24,11,2],altare:[38,11,-4],tesoro:[26,11,-4]};
function propSolids(){const S=[];const p=G.prop;if(p){const f=PROP_FOOT[p.kind];if(f)S.push({x:p.x,y:p.y+f[2],rx:f[0],ry:f[1]})}
  if(G.cc)for(const c of G.cc)if(c.st!=='drop'&&c.st!=='poof'&&c.st!=='gone'&&c.t>=0)S.push({x:c.x,y:c.y-2,rx:22,ry:11});return S}
function touching(o,s,m){const ax=s.rx+o.r+m,ay=s.ry+o.r+m,dx=(o.x-s.x)/ax,dy=(o.y-s.y)/ay;return dx*dx+dy*dy<1}
function moveCircle(o,dx,dy,ignoreRocks){
  o.x+=dx;o.y+=dy;
  if(!ignoreRocks)for(const s of propSolids()){const ax=s.rx+o.r,ay=s.ry+o.r,ex=o.x-s.x,ey=(o.y-s.y)*ax/ay,d=Math.hypot(ex,ey);if(d<ax&&d>.001){o.x=s.x+ex/d*ax;o.y=s.y+ey/d*ax*ay/ax}}
  if(!ignoreRocks)for(const k of G.rocks){const ex=o.x-k.x,ey=o.y-k.y,d=Math.hypot(ex,ey),m=o.r+k.r;if(d<m&&d>.001){o.x=k.x+ex/d*m;o.y=k.y+ey/d*m}}
  o.x=clamp(o.x,L+o.r,R-o.r);
  if(o===P&&G.door&&Math.abs(o.x-AW/2)<DOORW-o.r+1){o.y=clamp(o.y,TOP-50,BOT-o.r);if(o.y<TOP+o.r)o.x=clamp(o.x,AW/2-DOORW+o.r,AW/2+DOORW-o.r)}
  else o.y=clamp(o.y,TOP+o.r,BOT-o.r);
}
