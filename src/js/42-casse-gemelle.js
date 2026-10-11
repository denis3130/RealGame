// ---------- the twin chests: once per run, after a cleared room ----------
const ccIsRoom=()=>!G.event&&!isBossRoom(G.room)&&(G.mode==='inf'?G.room%10===7:G.room===G.ccRoom);
function spawnTwinChests(){const y=TOP+(BOT-TOP)*.56,bad=Math.random()<.5?0:1;G.cc=[0,1].map(i=>({x:i?AW*.72:AW*.28,y,bad:i===bad,t:-i*.15,st:'drop',k:0}));G.ccDone=G.room;
  for(const c of G.cc)c.crush=G.rocks.filter(k=>!k.temp&&Math.hypot(k.x-c.x,k.y-c.y)<k.r+28);
  banner('Due casse!','Una nasconde un tesoro, l\'altra un mostro',2.4);sfx('door')}
function updTwinChests(dt){if(!G.cc)return;
  for(const c of G.cc){c.t+=dt;
    if(c.st==='drop'&&c.t>=.55){c.st='idle';shake(4);sfx('boom');for(const k of c.crush)shatterRock(k);vfxBlast(c.x,c.y,'255,225,160',58,{sparks:10,debris:'stone',n:10,dust:16});stamp('crater',c.x,c.y+2,20)}
    if(c.st==='idle'&&G.state==='cleared'&&!G.ccChosen){
      if(touching(P,{x:c.x,y:c.y-2,rx:22,ry:11},8)){G.ccChosen=true;c.st=c.bad?'shake':'open';c.k=0;for(const o of G.cc)if(o!==c){o.st='poof';o.k=0;for(let i=0;i<14;i++)G.fx.push({k:'puff',x:o.x,y:o.y-10,vx:rand(-60,60),vy:rand(-60,20),t:rand(.3,.6),r:rand(4,8)})}
        if(!c.bad){sfx('victory');vib([30,30,60]);const n=24+effRoom()*2;for(let i=0;i<n;i++){const a=rand(-Math.PI,0),s=rand(80,220);G.coins.push({x:c.x,y:c.y-12,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:-.2})}
          for(let i=0;i<24;i++)G.fx.push({k:'lvl',x:c.x,y:c.y-14,vx:rand(-120,120),vy:rand(-180,-40),t:.7,gold:true});G.hearts.push({x:c.x,y:c.y+18,t:0});
          setTimeout(()=>{if(G&&G.state==='cleared'){G.door=true;banner('Tesoro!','La porta è aperta',1.6);sfx('door')}},900)}
        else{sfx('roar');vib([50,40,50])}}}
    if(c.st==='open'||c.st==='poof'||c.st==='shake')c.k+=dt;
    if(c.st==='shake'&&c.k>1.1){c.st='gone';const m=makeE('mimic',c.x,c.y+4,0);m.hp=m.max=Math.round(900*(1+(effRoom()-1)*.14));m.intro=1.3;G.enemies.push(m);G.state='play';G.door=false;
      shake(9);dustRing(c.x,c.y,22);for(let i=0;i<18;i++)G.fx.push({k:'chunk',x:c.x,y:c.y-10,vx:rand(-140,140),vy:rand(-160,40),t:rand(.3,.6),r:rand(2,4),col:'#7a4e2a'});
      bossBarReset();$('bossBar').hidden=false;$('bossBar').classList.remove('rage');$('bossName').textContent=ET.mimic.name;banner(ET.mimic.name,ET.mimic.title,2);playMusic('golem')}}
  G.cc=G.cc.filter(c=>c.st!=='gone'&&!(c.st==='poof'&&c.k>.5))}
function drawTwinChest(c){const drop=c.st==='drop'?Math.max(0,1-c.t/.55):0,h=drop*drop*260;if(c.t<0)return;
  const sh=c.st==='shake'?Math.sin(c.k*(30+c.k*30))*(1+c.k*3):0,sq=c.st==='poof'?Math.max(0,1-c.k/.5):1,open=c.st==='open'?Math.min(1,c.k/.35):0,grow=c.st==='shake'?1+c.k*.12:1;
  if(drop<1)shadow(c.x,c.y+6,22*(1-drop*.6),7,.35);
  ctx.save();ctx.translate(c.x+sh,c.y-h);ctx.scale(sq*grow*1.35,sq*grow*1.35);ink(2.5);
  const wood='#7a4e2a',band='#d9a640';
  ctx.beginPath();ctx.rect(-18,-14,36,20);ctx.fillStyle=vGrad(-18,18,wood,'#5a3620','#3e2414');ctx.fill();ctx.stroke();
  for(const bx of [-14,10.5]){ctx.fillStyle=band;ctx.fillRect(bx,-14,3.5,20);ctx.strokeRect(bx,-14,3.5,20)}
  if(open>0){glow('255,215,90',0,-18,40,.6*open);ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.ellipse(0,-14,16,4,0,0,TAU);ctx.fill()}
  ctx.save();ctx.translate(0,-14);ctx.rotate(-open*1.1);ctx.beginPath();ctx.moveTo(-18,0);ctx.quadraticCurveTo(0,-13,18,0);ctx.closePath();ctx.fillStyle=wood;ctx.fill();ctx.stroke();
  ctx.strokeStyle=band;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,0);ctx.quadraticCurveTo(0,-13,18,0);ctx.stroke();ink(2.5);ctx.restore();
  if(open<.1){ctx.fillStyle=band;ctx.fillRect(-3.5,-17,7,7);ctx.strokeRect(-3.5,-17,7,7);ctx.fillStyle=INK;circ(0,-13.5,1.3);ctx.fill()}
  if(c.st==='shake'){const k=Math.min(1,c.k/.8);ctx.fillStyle=`rgba(229,48,26,${k})`;ctx.beginPath();ctx.ellipse(-6,-14,2.4,1.4*k+.2,0,0,TAU);ctx.ellipse(6,-14,2.4,1.4*k+.2,0,0,TAU);ctx.fill();
    ctx.fillStyle='#f4ecd8';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-14+i*7,-14);ctx.lineTo(-11.5+i*7,-14+3*k);ctx.lineTo(-9+i*7,-14);ctx.fill()}}
  ctx.restore();
  if(c.st==='idle'&&G.state==='cleared'&&!G.ccChosen){const b=Math.sin(G.t*5)*3;glow('255,215,90',c.x,c.y-10,34,.25+.1*Math.sin(G.t*4));ctx.fillStyle='#ffc93c';ink(2.5);ctx.beginPath();ctx.moveTo(c.x,c.y-34+b);ctx.lineTo(c.x-7,c.y-44+b);ctx.lineTo(c.x+7,c.y-44+b);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('?',c.x,c.y-48+b);ctx.fillStyle='#fff';ctx.fillText('?',c.x,c.y-48+b)}}

