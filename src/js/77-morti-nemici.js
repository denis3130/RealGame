// =====================================================================
// MORTI DEI NEMICI (punto 4 del piano maestro: «Morte»). Prima ogni nemico normale scoppiava allo stesso modo (un anello del suo colore,
// schegge, pezzetti). Ora ogni nemico in 3D, colpito a morte, viene fotografato una volta nella posa di «colpito» (snapE, in una tela
// riusata) e al suo posto resta per un attimo il suo corpo, che muore secondo la sua famiglia:
// - gelatine (slime, slime grande e di lava, girino): si afflosciano in una pozza che bolle e svapora;
// - in piedi (goblin, negromante, piromante, nano, diavoletto): cadono all'indietro lontano dall'eroe, poi una nuvoletta con le stelline;
// - scheletri e scheletrini: barcollano e si sfasciano in pezzi che rimbalzano;
// - volanti (pipistrello, zanzara, fuoco fatuo, spirito della neve, occhio d'ombra): girano su se stessi cadendo e svaniscono in scintille;
// - piante e funghi (pianta, fungo, fiore occhio): appassiscono piegandosi e lasciano petali o spore;
// - di pietra e di ghiaccio (golem d'ossidiana, sentinella di ghiaccio, scarabeo): si crepano e cadono in pezzi;
// - bestie (lupo, rana, coccodrillo, lumaca): un saltello, si rovesciano sulla schiena, poi la nuvoletta.
// Niente sangue: polvere, stelline, il materiale del nemico. Monete, esperienza, cuori e il colpo ad anello restano quelli di prima.
// Con LOWFX resta lo scoppio di prima. I corpi non ritardano l'apertura della porta (stanno in G.ecorpses, non in G.corpses).
// =====================================================================
const EDF={slime:'goo',bigslime:'goo',magmaslime:'goo',tadpole:'goo',goblin:'fall',necro:'fall',pyro:'fall',bomber:'fall',imp:'fall',skeleton:'bones',bonelet:'bones',
  bat:'fly',mosquito:'fly',wisp:'fly',snowspirit:'fly',shadoweye:'fly',plant:'wilt',mushroom:'wilt',eyeflower:'wilt',obsidian:'crumble',icesentinel:'crumble',beetle:'crumble',
  wolf:'beast',frog:'beast',croc:'beast',snail:'beast'};
// easing (the ones of the monsters' toolkits are inside their closures)
const EZ=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,ESS=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const EDUR={goo:.8,fall:.85,bones:.9,fly:.75,wilt:.85,crumble:.85,beast:.95};
// the photos: canvases kept and reused (W×H units at K pixels per unit; the feet at ox, oy)
const ESN={pool:[],W:150,H:150,K:2,ox:75,oy:118};
function snapE(e){const S=ESN;let cv=S.pool.pop();if(!cv){cv=document.createElement('canvas');cv.width=S.W*S.K;cv.height=S.H*S.K}
  const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);const saved=ctx,ns=noShadow;ctx=g;noShadow=true;
  try{g.scale(S.K,S.K);const M=N3.meta[e.type],big=(e.elite||G.giant)&&!e.type.includes('slime')?1.22:1;N3[e.type](S.ox,S.oy,e.f3!=null?e.f3:(typeof e.face==='number'?e.face:Math.PI/2),'hit',.14,(M.sc||1)*big,{noFx:true})}
  catch(er){}finally{ctx=saved;noShadow=ns}
  return cv}
function addECorpse(e){const fam=EDF[e.type];if(!fam)return;const L=G.ecorpses=G.ecorpses||[];if(L.length>=12){const o=L.shift();ESN.pool.push(o.cv)}
  const dx=e.x-(P?P.x:e.x);L.push({ec:1,type:e.type,fam,x:e.x,y:e.y,z:Math.max(0,e.z||0),r:e.r,col:ECOL[e.type]||'#c9c0b0',t:0,dur:EDUR[fam],dir:dx>=0?1:-1,seed:Math.random()*9,cv:snapE(e),land:false})}
// a pseudo-random number from a seed (the pieces and the puffs do the same thing every frame)
const erand=(s,i)=>{const v=Math.sin(s*12.9898+i*78.233)*43758.5453;return v-Math.floor(v)};
// the photo drawn with its feet at (x, y): turned by rot round the feet, scaled, faded
function eImg(c,x,y,rot,sx,sy,al,sk){if(al<=.01)return;const S=ESN;ctx.save();ctx.globalAlpha*=al;ctx.translate(x,y);if(rot)ctx.rotate(rot);if(sk)ctx.transform(1,0,sk,1,0,0);ctx.scale(sx,sy);
  ctx.drawImage(c.cv,-S.ox,-S.oy,S.W,S.H);ctx.restore()}
// a piece of the photo (the source box in units, round the feet) at a position, turned
function ePiece(c,sx0,sy0,w,h,x,y,rot,al){if(al<=.01)return;const S=ESN;ctx.save();ctx.globalAlpha*=al;ctx.translate(x,y);ctx.rotate(rot);
  ctx.drawImage(c.cv,(S.ox+sx0)*S.K,(S.oy+sy0)*S.K,w*S.K,h*S.K,-w/2,-h/2,w,h);ctx.restore()}
// puffs of dust or smoke round a point (k 0..1)
function ePuffs(x,y,k,n,R,rgb,al){if(k<=0||k>=1)return;for(let i=0;i<n;i++){const a=i/n*TAU+.3,d=R*(.3+k*.9);ctx.fillStyle=`rgba(${rgb},${(al||.55)*(1-k)})`;ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*.55-k*6,2.5+k*5,0,TAU);ctx.fill()}}
// little stars that rise and fade
function eStars(x,y,k,n,col){if(k<=0||k>=1)return;for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*.7,d=6+k*16,q=[x+Math.cos(a)*d,y+Math.sin(a)*d-k*8];ctx.save();ctx.globalAlpha*=1-k;
  ctx.beginPath();for(let j=0;j<10;j++){const an=-Math.PI/2+j*Math.PI/5,rr=j%2?1.3:3;ctx.lineTo(q[0]+Math.cos(an)*rr,q[1]+Math.sin(an)*rr)}ctx.closePath();ctx.fillStyle=col||'#fff3b0';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();ctx.restore()}}
function drawECorpse(c){const k=Math.min(1,c.t/c.dur),x=c.x,y=c.y+8,ez2=v=>EZ(Math.max(0,Math.min(1,v))),fade=(a,b)=>1-ESS(a,b,k),h=Math.max(16,c.r*2.6);
  if(c.fam==='fall'||c.fam==='beast'){const beast=c.fam==='beast',hop=beast&&k<.32?Math.sin(k/.32*Math.PI)*10:0,fk=ez2((k-(beast?.12:0))/(beast?.36:.42)),rot=c.dir*(beast?Math.PI*.9:Math.PI*.5)*fk,
      t1=beast?.48:.42,b=k>t1&&k<t1+.1?Math.sin((k-t1)/.1*Math.PI)*3:0;
    eImg(c,x,y-hop-b,rot,1,beast?1-.12*fk:1-.08*fk,fade(.62,.95));
    const cx=x+c.dir*h*.45*fk,cy=y-4;ePuffs(cx,cy,(k-.55)/.45,7,h*.55,'235,228,215',.6);eStars(cx,cy-h*.3,(k-.5)/.5,3)}
  else if(c.fam==='bones'){const brk=.3;if(k<brk){const w=Math.sin(k/brk*Math.PI*2)*.12*c.dir;eImg(c,x,y,w,1,1,1)}
    else{const u=(k-brk)*c.dur,n=4,top=-h*1.15,bh=(h*1.2)/n;for(let i=0;i<n;i++){const y0=top+bh*(i+.5),vx=(erand(c.seed,i)-.5)*70+c.dir*20,vr=(erand(c.seed,i+9)-.5)*9,
        fall=Math.min(-y0-bh*.5,.5*420*u*u),gy=y0+fall,bounce=fall>=-y0-bh*.5-.1?Math.abs(Math.sin(u*14))*2*(1-k):0;
        ePiece(c,-h*.6,y0-bh/2,h*1.2,bh,x+vx*u,y+gy-bounce,vr*u*(i===n-1?.2:1),fade(.7,1))}
      ePuffs(x,y-2,(k-brk)/(1-brk),6,h*.5,'235,228,215',.45)}}
  else if(c.fam==='goo'){const f=ez2(k/.45),z=c.z*(1-f);eImg(c,x,y-z,0,1+.55*f,1-.82*f,fade(.35,.7));
    const pr=c.r*(1+.6*f)*(1-ESS(.65,1,k)*.6);ctx.save();ctx.globalAlpha*=.55*ESS(.2,.4,k)*fade(.7,1);ctx.fillStyle=c.col;ctx.beginPath();ctx.ellipse(x,y-1,pr*1.3,pr*.55,0,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(x-pr*.4,y-2.5,pr*.35,pr*.12,0,0,TAU);ctx.fill();ctx.restore();
    for(let i=0;i<4;i++){const t0=.3+erand(c.seed,i)*.45,u=(k-t0)/.18;if(u<=0||u>=1)continue;const bx=x+(erand(c.seed,i+4)-.5)*pr*1.6,by=y-2-u*5;ctx.save();ctx.globalAlpha*=1-u;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(bx,by,1.4+u*2.4,0,TAU);ctx.stroke();ctx.restore()}}
  else if(c.fam==='fly'){const f=ez2(k/.6),z=c.z*(1-f)+6*(1-f);eImg(c,x,y-z,c.dir*TAU*1.25*k,1-.55*k,1-.55*k,fade(.5,.9));
    for(let i=0;i<7;i++){const a=i/7*TAU+k*3,d=6+k*20,q=[x+Math.cos(a)*d,y-z-h*.4+Math.sin(a)*d*.6];ctx.save();ctx.globalAlpha*=ESS(.25,.4,k)*fade(.75,1);ctx.fillStyle=i%2?'#fff6c8':c.col;ctx.beginPath();ctx.arc(q[0],q[1],1.6,0,TAU);ctx.fill();ctx.restore()}}
  else if(c.fam==='wilt'){const f=ez2(k/.5);eImg(c,x,y,0,1,1-.45*f,fade(.55,.9),c.dir*.75*f);
    for(let i=0;i<6;i++){const u=(k-.3-i*.04)/.6;if(u<=0||u>=1)continue;const a=(erand(c.seed,i)-.5)*2.2-Math.PI/2,d=4+u*22,q=[x+Math.cos(a)*d+c.dir*u*6,y-h*.45+Math.sin(a)*d*.6-u*8];
      ctx.save();ctx.globalAlpha*=1-u;ctx.translate(q[0],q[1]);ctx.rotate(u*4+i);ctx.fillStyle=c.col;ctx.beginPath();ctx.ellipse(0,0,2.6,1.3,0,0,TAU);ctx.fill();ctx.restore()}}
  else if(c.fam==='crumble'){const brk=.32;if(k<brk){eImg(c,x,y,0,1,1,1);ctx.save();ctx.globalAlpha*=ESS(0,brk,k);ctx.strokeStyle='rgba(28,22,18,.85)';ctx.lineWidth=1.4;ctx.lineJoin='round';
      for(let j=0;j<3;j++){ctx.beginPath();let px=x+(erand(c.seed,j)-.5)*h*.6,py=y-h*(.25+.25*j);ctx.moveTo(px,py);for(let s=0;s<4;s++){px+=(erand(c.seed,j*7+s)-.5)*9;py+=6;ctx.lineTo(px,py)}ctx.stroke()}ctx.restore()}
    else{const u=(k-brk)*c.dur,gx=3,gy=3,top=-h*1.15,pw=h*1.3/gx,ph=h*1.2/gy;for(let j=0;j<gy;j++)for(let i=0;i<gx;i++){const n=j*gx+i,x0=-h*.65+pw*(i+.5),y0=top+ph*(j+.5),
        vx=(x0/(h*.65))*45+(erand(c.seed,n)-.5)*40,vr=(erand(c.seed,n+20)-.5)*8,fall=Math.min(-y0-ph*.4,.5*500*u*u);ePiece(c,x0-pw/2,y0-ph/2,pw,ph,x+x0+vx*u,y+y0+fall,vr*u,fade(.68,1))}
      ePuffs(x,y-3,(k-brk)/(1-brk),7,h*.6,'210,205,200',.5)}}}
// the hooks: the death leaves its body (the old burst of streaks and chunks goes), the bodies age with the game's time, and are drawn in
// the room's depth order among the others (added to G.corpses only while the room is drawn)
{const _k=killE;killE=function(e,noLoot){const n0=G&&G.fx?G.fx.length:0;const r=_k.apply(this,arguments);
  try{if(e&&G&&!isBoss(e.type)&&!LOWFX&&EDF[e.type]&&n3Has(e)&&!(e.spawn>0)){const add=G.fx.splice(n0);for(const f of add)if(f.k!=='streak'&&f.k!=='chunk')G.fx.push(f);addECorpse(e)}}catch(er){}
  return r}}
{const _u=update;update=function(dt){_u(dt);const L=G&&G.ecorpses;if(!L||!L.length)return;for(let i=L.length-1;i>=0;i--){const c=L[i];c.t+=dt;if(c.t>=c.dur){ESN.pool.push(c.cv);L.splice(i,1)}}}}
{const _r=render;render=function(){const L=G&&G.ecorpses;if(!L||!L.length)return _r.apply(this,arguments);const keep=G.corpses;G.corpses=(keep||[]).concat(L);try{return _r.apply(this,arguments)}finally{G.corpses=keep}}}
{const _dc=drawCorpse;drawCorpse=function(c){if(c.ec){try{drawECorpse(c)}catch(er){}return}return _dc.apply(this,arguments)}}
// a new room: the bodies of the room before go
{const _b=buildRoom;buildRoom=function(){const L=G&&G.ecorpses;if(L){for(const c of L)ESN.pool.push(c.cv);L.length=0}return _b.apply(this,arguments)}}
