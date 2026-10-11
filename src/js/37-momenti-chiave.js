// =====================================================================
// KEY MOMENTS: the hero's fall in slow motion and the save code
// =====================================================================
// --- falling in slow motion: the world keeps drifting, the hero topples, colour drains away
function deathTick(dt){G.deathT=(G.deathT||0)+dt;const d=dt*.25;
  for(const f of G.fx){f.t-=d;if(f.vx!==undefined){if(f.g)f.vy+=f.g*d;f.x+=f.vx*d;f.y+=f.vy*d}}G.fx=G.fx.filter(f=>f.t>0);
  for(const t of G.texts){t.life-=d;t.y-=40*d}G.texts=G.texts.filter(t=>t.life>0);for(const e of G.enemies)e.t+=d;
  for(const p of G.eproj){p.x+=p.vx*d;p.y+=p.vy*d}for(const a of G.arrows){a.x+=a.vx*d;a.y+=a.vy*d}G.shake=Math.max(0,G.shake-dt*20);G.t+=d}
function drawFallenHero(){const k=Math.min(1,(G.deathT||0)/.7),x=P.x,y=P.y,side=Math.cos(P.face)<0?-1:1;
  ctx.save();ctx.translate(x,y+8);ctx.rotate(side*k*Math.PI/2*.92);ctx.translate(-x,-(y+8));ctx.globalAlpha=1-k*.15;drawRig(x,y,P.face,0,false,P.style||HERO,{});ctx.restore();ctx.globalAlpha=1;
  if(k>.95&&Math.random()<.2)G.fx.push({k:'puff',x:x+side*16,y:y+6,vx:rand(-10,10),vy:-6,t:.4,r:4})}
function drawDeathFx(cw,ch){const k=Math.min(1,(G.deathT||0)/.9);if(k<=0)return;
  ctx.fillStyle=`rgba(40,0,6,${.38*k})`;ctx.fillRect(0,0,cw,ch);const g=ctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.15,cw/2,ch/2,Math.max(cw,ch)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${.7*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,cw,ch)}


// --- a brand-new player: three wordless seconds that show how to play

// --- the save code: copy it somewhere safe, paste it back on another phone
const saveCode=()=>btoa(unescape(encodeURIComponent(JSON.stringify(SAVE))));
function readCode(code){try{const o=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));return o&&o.items&&o.eq?o:null}catch(e){return null}}


