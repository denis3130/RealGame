// =====================================================================
// SPECIAL ROOMS: the gold rush, the flawless trial, the dark room
// =====================================================================
Object.assign(EVENTS,{
  oro:{n:"Stanza dell'oro",sub:'15 secondi: raccogli tutte le monete che piovono!'},
  sfida:{n:'Prova del coraggio',sub:'Sconfiggili senza farti colpire'}});
function setupGoldRoom(){G.prop=null;G.door=false;G.state='cleared';G.clearT=0;G.goldRun={t:15,spawnT:.6,got:0,rockT:2.5};sfx('coin');setTimeout(()=>sfx('coin'),120)}
function updGoldRoom(dt){const g=G.goldRun;if(!g)return;g.t-=dt;g.spawnT-=dt;g.rockT-=dt;
  if(g.t>0&&g.spawnT<=0){g.spawnT=rand(.42,.6);const big=Math.random()<.16,tx=rand(L+24,R-24),ty=rand(TOP+30,BOT-40);lob(tx,ty,tx,ty,{kind:big?'sack':'coins',dur:.75,r:big?18:14,dmg:0,h:0})}
  if(g.t>1.5&&g.rockT<=0){g.rockT=rand(1.6,2.4);const tx=clamp(P.x+rand(-50,50),L+20,R-20),ty=clamp(P.y+rand(-50,50),TOP+20,BOT-20);lob(tx,ty,tx,ty,{kind:'rock',dur:1,r:20,dmg:14,h:0})}
  if(g.t<=0){G.goldRun=null;G.lobs=G.lobs.filter(b=>b.kind==='rock');for(const c of G.coins)G.fx.push({k:'puff',x:c.x,y:c.y,vx:0,vy:-10,t:.35,r:4});G.coins=[];G.door=true;banner(`${g.got} oro raccolto!`,'La porta è aperta',2);sfx('victory');vib([40,30,80])}}
function goldLand(b){if(b.kind==='rock'){vfxBlast(b.tx,b.ty,'230,210,180',40,{debris:'stone',n:10,sparks:6,dust:8,ring2:false});shake(3);sfx('rock','boulder',b.tx);if(Math.hypot(P.x-b.tx,P.y-b.ty)<b.r+P.r*.4)hurtP(Math.round(b.dmg*DMG()));return}
  const n=b.kind==='sack'?10:randi(3,5);for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(40,140);G.coins.push({x:b.tx,y:b.ty,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,gr:1})}
  if(b.kind==='sack'&&Math.random()<.2){G.gems.push({x:b.tx,y:b.ty,z:10,vz:180,vx:rand(-60,60),vy:rand(-40,40),t:0,ph:rand(0,9)})}
  G.fx.push({k:'puff',x:b.tx,y:b.ty,vx:0,vy:-8,t:.35,r:6});sfx('coin',0,b.tx)}
function drawTrialTag(){const ok=!G.trial.hit,x=AW/2,y=TOP+14;ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;const s=ok?'Prova: nessun colpo':'Prova: colpito';ctx.strokeText(s,x,y);ctx.fillStyle=ok?'#9cef5e':'#ff7a6a';ctx.fillText(s,x,y)}
function drawGoldTimer(){const g=G.goldRun;if(!g)return;const k=Math.max(0,g.t/15),w=150,x=AW/2-w/2,y=TOP+10;
  ctx.fillStyle='rgba(11,19,38,.75)';ctx.fillRect(x-4,y-4,w+8,30);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(x-4,y-4,w+8,30);
  ctx.fillStyle='#3a2a10';ctx.fillRect(x,y+15,w,7);ctx.fillStyle=g.t<4?'#ff7a4a':'#ffd23c';ctx.fillRect(x,y+15,w*k,7);
  ctx.font='15px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;const s=`${Math.ceil(g.t)}s · ${g.got} oro`;ctx.strokeText(s,AW/2,y+11);ctx.fillStyle='#ffe08a';ctx.fillText(s,AW/2,y+11)}

function setupTrial(){G.prop=null;G.door=false;G.state='play';G.trial={hit:false};const ch=G.mode==='inf'?1+Math.floor(((G.room-1)/5)%8/2):G.chapter||1;
  const pools={1:['skeleton','goblin','wisp','beetle'],2:['imp','pyro','obsidian','bomber'],3:['frog','mosquito','croc','snail'],4:['wolf','snowspirit','icesentinel','wolf']},pool=pools[ch]||pools[1];
  const n=3+Math.min(3,Math.floor(G.room/3));for(let i=0;i<n;i++){const t=pk(pool),s=freeSpot(ET[t].r,TOP+40,TOP+300);G.enemies.push(makeE(t,s.x,s.y,1.2+i*.12))}}
function trialReward(){const ok=G.trial&&!G.trial.hit;G.trial=null;
  setTimeout(()=>{if(!G||G.ended)return;if(ok){banner('Perfetto!','Nessun colpo subito: cassa d\'argento e 4 cristalli',2.4);const c=earnChest('argento');G.gemsRun=(G.gemsRun||0)+4;sfx('victory');vib([40,30,40,30,120]);
      for(let i=0;i<20;i++)G.fx.push({k:'lvl',x:P.x,y:P.y-10,vx:rand(-140,140),vy:rand(-160,-20),t:.7,gold:true});if(c&&c.full)toast('Slot pieni: cassa convertita in oro')}
    else{banner('Prova superata','Ti hanno colpito: solo 25 oro',2);G.gold+=25;sfx('coin')}},650)}

// the dark room: torches out, the enemies are only shadows; gold counts double
function rollDark(boss){return false; // dark rooms removed for good (Denis)
  if(INTRO.on)return false;if(G.allDark)return !boss&&!G.event;if(boss||G.event||G.room<3||(G.darkN||0)>=2||G.daily&&G.daily.mod==='dark')return false;if(Math.random()<.16){G.darkN=(G.darkN||0)+1;return true}return false}


