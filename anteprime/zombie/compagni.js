// ---------- I COMPAGNI sulla mappa zombie (punto 41 del piano di Denis, anteprima 47): le creature si usano in tutte e due le modalità, con le
// stesse carte e gli stessi livelli (SAVE.pets, src/js/34-compagni.js). Seguono l'eroe un passo dietro di lui, girano con la telecamera come gli
// zombie e attaccano lo zombie più vicino che vedono: lo Spiritello lancia fiammelle verdi che lo inseguono, il Funghetto soffia una nuvola di
// spore che colpisce tutti quelli intorno, la Lucciola scintille che inseguono e ogni 8 secondi rimette un po' di vita all'eroe, il Corvetto
// piume d'osso velocissime che passano attraverso due zombie, il Draghetto fiammate che li fanno bruciare (il fuoco di armi_speciali.js).
// I compagni si disegnano coi modelli 3D (N3) nell'ordine degli esseri (motore.js: W.pets e W.drawPet). Numeri in ZP, da regolare giocando.
(()=>{const{W,S,CAM,rr,cl,TAU,hurt,hit,move,physClear,heightAt}=ZM;
// cd: secondi tra un attacco e l'altro; dmg: danno (la pistola fa 20 a colpo); v: velocità del colpo; hom: insegue; pierce: zombie in più
// che passa; splash: raggio della nuvola; cone: portata della fiammata; heal: vita rimessa ogni hcd secondi. Il livello del compagno aggiunge
// il 10% a livello, il round il 5% a round
const ZP={spiritello:{cd:1.4,dmg:16,shot:'wisp',v:250,hom:1},funghetto:{cd:1.8,dmg:12,shot:'spore',v:190,splash:34},
  lucciola:{cd:1.6,dmg:9,shot:'spark',v:280,hom:1,heal:8,hcd:8},corvetto:{cd:1.2,dmg:15,shot:'feather',v:430,pierce:2},draghetto:{cd:2.6,dmg:22,cone:84,burn:1.6}};
const ZC={ids:null,shots:[],fx:[],ZP};
const lvlK=id=>1+.1*((typeof petLvl==='function'&&typeof SAVE!=='undefined'&&SAVE.pets?petLvl(id):1)-1),
  roundK=()=>1+.05*Math.max(0,((W.director&&W.director.R)||1)-1);
// chi viene: nel gioco quelli portati dal menu (gli stessi della Classica), nelle pagine di prova quelli di ZM.compagni.ids
function wanted(){if(ZC.ids)return ZC.ids.slice();if(W.gioco&&typeof petEq==='function')try{return petEq().slice()}catch(e){}return[]}
function make(){const h=W.hero;return wanted().filter(id=>typeof N3!=='undefined'&&N3[id]&&ZP[id]).map((id,i)=>{const s=i?1:-1;
  return{id,i,slot:i,x:h.x+s*26,y:h.y+10,zh:0,face:-Math.PI/2,fs:-Math.PI/2,t:i*.7,cd:1+i*.5,hcd:(ZP[id].hcd||0),att:0,happy:0,hop:0,moving:false,scan:0,tg:null,anim:'idle'}})}
const alive=z=>z&&!z.die&&!(z.rise<1)&&!z.idle&&z.hp>0;
const wall=(x,y)=>{const s=hit(x,y,1.5);return!!s&&s.tag!=='hole'};
// ------------------------------------------------------------------ i suoni (col bottone Suono acceso)
function suono(w,x){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01;AU.pan=0;
  if(w==='wisp'){whoosh(t,.35,600,2200,.08,.12);vBell(null,t+.02,88,.5,.03)}
  else if(w==='spore')fNoise(t,.3,'bandpass',VR(1400,.3),1.1,.06,{f2:500})
  else if(w==='spark')vBell(null,t,91,.35,.035)
  else if(w==='feather')whoosh(t,.18,1800,4200,.07,.08)
  else if(w==='fire')fNoise(t,.5,'lowpass',VR(900,.2),.8,.12,{brown:true,att:.05})
  else if(w==='heal'){vBell(null,t,84,.8,.05);vBell(null,t+.1,88,.8,.04)}}catch(e){}}
// ------------------------------------------------------------------ ogni fotogramma
function update(dt,on,D){const h=W.hero;if(!h)return;if(W.pets==null)W.pets=make();const P=W.pets;if(!P.length&&!ZC.shots.length)return;
  const play=on&&!h.dead&&D.st!=='fine'&&D.st!=='giu';
  // contenti alla fine di un round
  if(D.st!==ZC.st){if(ZC.st==='round'&&D.st==='pausa')for(const pt of P)pt.happy=.8;ZC.st=D.st}
  for(const pt of P){pt.t+=dt;pt.att=Math.max(0,pt.att-dt);pt.happy=Math.max(0,pt.happy-dt);
    // il posto, come nella Classica: accanto all'eroe sullo schermo (dalla parte opposta a dove guarda) e un poco verso di noi, così non gli
    // vola mai sulla testa; con la telecamera girata il posto gira con lei
    const cy=Math.cos(CAM.yaw),sy0=Math.sin(CAM.yaw),fx=Math.cos((h.face||0)+CAM.yaw);if(Math.abs(fx)>.2)ZC.side=fx>=0?-1:1;
    const sd=(ZC.side||-1)*(pt.slot?-1:1),ox=sd*26,oy=10+(pt.slot?6:0);
    let tx=h.x+ox*cy+oy*sy0,ty=h.y-ox*sy0+oy*cy;if(wall(tx,ty)){tx=h.x+(ox*cy+oy*sy0)*.45;ty=h.y+(-ox*sy0+oy*cy)*.45}
    if((pt.lv||0)!==(h.lv||0)&&!h.cl){pt.x=tx;pt.y=ty;pt.puff=.4;pt.stuck=0;pt.lv=h.lv||0}// (l'eroe è salito o sceso: il compagno lo raggiunge in uno sbuffo)
    const dx=tx-pt.x,dy=ty-pt.y,dd=Math.hypot(dx,dy);
    // rimasto indietro (troppo lontano, o fermo contro un muro per più di un secondo): ricompare accanto all'eroe in uno sbuffo
    if(dd>170||pt.stuck>1){pt.x=tx;pt.y=ty;pt.puff=.4;pt.stuck=0}
    else if(dd>4){const sp=Math.min(dd*4,230)*dt,x0=pt.x,y0=pt.y;move(pt,dx/dd*sp,dy/dd*sp,5);pt.moving=dd>8;pt.hop+=dt*12;
      pt.stuck=dd>50&&Math.hypot(pt.x-x0,pt.y-y0)<sp*.3?(pt.stuck||0)+dt:0}else{pt.moving=false;pt.stuck=0}
    pt.zh=pt.lv?(h.lvH||0):heightAt?heightAt(pt.x,pt.y):0;pt.puff=Math.max(0,(pt.puff||0)-dt);
    // il bersaglio: lo zombie più vicino che vede, cercato cinque volte al secondo
    if((pt.scan-=dt)<=0){pt.scan=.2;let best=null,bd=200;if(play)for(const z of W.Z){if(!alive(z))continue;const d=Math.hypot(z.x-pt.x,z.y-pt.y);if(d<bd&&ZM.sameLv(z,pt)&&physClear(pt.x,pt.y,z.x,z.y,2)){bd=d;best=z}}pt.tg=best}
    if(!alive(pt.tg))pt.tg=null;const tg=pt.tg;
    const fw=tg?Math.atan2(tg.y-pt.y,tg.x-pt.x):pt.moving?Math.atan2(dy,dx):(h.face!=null?h.face:pt.face);pt.face=fw;
    const df=Math.atan2(Math.sin(pt.face-pt.fs),Math.cos(pt.face-pt.fs));pt.fs+=df*Math.min(1,dt*10);
    pt.cd-=dt;if(!tg)pt.cd=Math.max(pt.cd,.35);
    if(play&&tg&&pt.cd<=0){const Z=ZP[pt.id],dmg=Z.dmg*lvlK(pt.id)*roundK()*((W.mods&&W.mods.dmg)||1);pt.cd=Z.cd;pt.att=.3;attack(pt,tg,Z,dmg)}
    if(ZP[pt.id].heal&&play){pt.hcd-=dt;if(pt.hcd<=0){pt.hcd=ZP[pt.id].hcd;const vita=(D.PZ&&D.PZ.vita)||100;if(D.hp<vita){D.hp=Math.min(vita,D.hp+ZP[pt.id].heal*lvlK(pt.id));pt.happy=.8;suono('heal');
      for(let i=0;i<10;i++)ZC.fx.push({k:'heal',x:h.x+rr(-10,10),y:h.y+rr(-6,6),z:(h.zh||0)+rr(6,30),vz:rr(20,50),t:0,T:rr(.5,.8)})}}}
    pt.anim=pt.att>0?'attack':pt.happy>0?'happy':pt.moving?'walk':'idle'}
  // i colpi: volano, inseguono (fiammelle e scintille), si fermano ai muri, colpiscono
  for(let i=ZC.shots.length-1;i>=0;i--){const s=ZC.shots[i];s.life-=dt;s.t+=dt;
    if(s.hom&&alive(s.tg)){const da=Math.atan2(Math.sin(Math.atan2(s.tg.y-s.y,s.tg.x-s.x)-s.a),Math.cos(Math.atan2(s.tg.y-s.y,s.tg.x-s.x)-s.a));s.a+=cl(da,-7*dt,7*dt)}
    s.x+=Math.cos(s.a)*s.v*dt;s.y+=Math.sin(s.a)*s.v*dt;let gone=s.life<=0||wall(s.x,s.y);
    if(!gone)for(const z of W.Z){if(!alive(z)||s.hit.has(z)||!ZM.sameLv(z,s))continue;if(Math.hypot(z.x-s.x,z.y-s.y)<10*z.sc+3){s.hit.add(z);
      if(s.splash){for(const z2 of W.Z)if(alive(z2)&&ZM.sameLv(z2,s)&&Math.hypot(z2.x-s.x,z2.y-s.y)<s.splash)hurt(z2,z2===z?s.dmg:s.dmg*.6,z2===z);for(let k=0;k<(LOWFX?6:14);k++){const a=rr(0,TAU),r=rr(4,s.splash);ZC.fx.push({k:'spore',x:s.x+Math.cos(a)*r*.4,y:s.y+Math.sin(a)*r*.4,vx:Math.cos(a)*r*1.6,vy:Math.sin(a)*r*1.6,z:rr(4,20),vz:rr(6,22),t:0,T:rr(.6,1)})}gone=true;break}
      hurt(z,s.dmg,true);if(s.pierce>0){s.pierce--;s.dmg*=.8}else{gone=true;break}}}
    if(gone){ZC.shots.splice(i,1);if(!s.splash)for(let k=0;k<(LOWFX?2:5);k++)ZC.fx.push({k:'hit',kind:s.kind,x:s.x,y:s.y,z:s.z,vx:rr(-50,50),vy:rr(-50,50),vz:rr(-10,40),t:0,T:rr(.2,.35)})}}
  for(const f of ZC.fx){f.t+=dt;if(f.vx){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=Math.exp(-4*dt);f.vy*=Math.exp(-4*dt)}if(f.vz)f.z+=f.vz*dt}ZC.fx=ZC.fx.filter(f=>f.t<f.T)}
function attack(pt,tg,Z,dmg){const a=Math.atan2(tg.y-pt.y,tg.x-pt.x),fly=pt.id!=='funghetto';
  if(Z.cone){// la fiammata del Draghetto: tutti quelli davanti a lui prendono fuoco (il fuoco e le fiamme di armi_speciali.js)
    for(const z of W.Z){if(!alive(z))continue;const ex=z.x-pt.x,ey=z.y-pt.y,ed=Math.hypot(ex,ey);let d2=Math.atan2(ey,ex)-a;d2=Math.atan2(Math.sin(d2),Math.cos(d2));
      if(ed<Z.cone&&Math.abs(d2)<.55&&ZM.sameLv(z,pt)&&physClear(pt.x,pt.y,z.x,z.y,2)){hurt(z,dmg,false);if(!z.die)z.burn=Math.max(z.burn||0,Z.burn)}}
    const SP=ZM.speciali;if(SP)for(let i=0;i<(LOWFX?3:7);i++){const aa=a+rr(-.4,.4),sp=rr(.7,1)*Z.cone;SP.fl.push({x:pt.x+Math.cos(a)*8,y:pt.y+Math.sin(a)*8,vx:Math.cos(aa)*sp*2.3,vy:Math.sin(aa)*sp*2.3,z:(pt.zh||0)+18,t:0,T:rr(.3,.42),r:rr(2.5,4)})}
    suono('fire',pt.x);return}
  ZC.shots.push({x:pt.x+Math.cos(a)*6,y:pt.y+Math.sin(a)*6,z:(pt.zh||0)+(fly?22:14),a,v:Z.v,kind:Z.shot,dmg,lv:pt.lv||0,zh:pt.zh||0,life:1.4,hom:!!Z.hom,tg,pierce:Z.pierce||0,splash:Z.splash||0,hit:new Set(),t:0});suono(Z.shot,pt.x)}
// ------------------------------------------------------------------ i disegni: i compagni nel loro posto nell'ordine degli esseri (motore.js),
// i colpi e le scintille sopra
W.drawPet=pt=>{if(typeof N3==='undefined'||!N3[pt.id])return;const q=ZM.SB(pt.x,pt.y,pt.zh||0),t=W.t||0,a=pt.anim,M=N3.meta&&N3.meta[pt.id]||{},d=(M.dur&&M.dur[a])||2;
  const p=Math.min(.999,Math.max(0,a==='walk'?((pt.hop/(TAU*2))%1+1)%1:a==='attack'?1-pt.att/.3:a==='happy'?1-Math.min(1,pt.happy/.8):(((t+pt.i*.37)/d)%1+1)%1)),fc=pt.fs+CAM.yaw;
  if(pt.a3!==a){if(pt.a3!=null){pt.b3=pt.a3;pt.b3p=pt.p3;pt.b3t=t}pt.a3=a}pt.p3=p;
  try{if(pt.b3&&t-pt.b3t>=0&&t-pt.b3t<.12){const a0=ctx.globalAlpha;ctx.globalAlpha=a0*.6*(1-(t-pt.b3t)/.12);N3[pt.id](q[0],q[1],fc,pt.b3,pt.b3p,1,{noFx:true});ctx.globalAlpha=a0}
    N3[pt.id](q[0],q[1],fc,a,p,1,{noFx:LOWFX})}catch(e){console.error(e)}
  if(pt.puff>0){const k=1-pt.puff/.4;ctx.save();ctx.globalAlpha=.6*(1-k);ctx.fillStyle='#e8f0e4';for(let i=0;i<6;i++){const aa=i*TAU/6;ctx.beginPath();ctx.arc(q[0]+Math.cos(aa)*(6+k*12),q[1]-12+Math.sin(aa)*(4+k*7),3+k*3,0,TAU);ctx.fill()}ctx.restore()}};
const COL={wisp:'150,255,190',spark:'220,255,110',feather:'240,232,214',spore:'190,255,140'};
function glowAt(rgb,x,y,r,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)}
function drawTop(){if(!ZC.shots.length&&!ZC.fx.length)return;
  for(const s of ZC.shots){const q=ZM.SB(s.x,s.y,s.z),sa=Math.atan2(CAM.SP*Math.sin(s.a+CAM.yaw),Math.cos(s.a+CAM.yaw));ctx.save();
    if(s.kind==='feather'){ctx.translate(q[0],q[1]);ctx.rotate(sa);ctx.strokeStyle='rgba(27,22,18,.9)';ctx.lineWidth=1.2;ctx.fillStyle='#efe6d2';ctx.beginPath();ctx.moveTo(7,0);ctx.quadraticCurveTo(0,-3.2,-7,-1.2);ctx.lineTo(-5,0);ctx.lineTo(-7,1.2);ctx.quadraticCurveTo(0,3.2,7,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(120,100,70,.7)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-6,0);ctx.stroke();if(!LOWFX){ctx.globalAlpha=.35;ctx.fillStyle='#fff';ctx.fillRect(-18,-.6,10,1.2)}}
    else if(s.kind==='spore'){ctx.globalCompositeOperation='lighter';if(!LOWFX)glowAt(COL.spore,q[0],q[1],10,.55);for(let i=0;i<4;i++){const a=s.t*7+i*1.6;ctx.fillStyle=`rgba(${COL.spore},.9)`;ctx.beginPath();ctx.arc(q[0]+Math.cos(a)*2.6,q[1]+Math.sin(a)*2,1.6,0,TAU);ctx.fill()}}
    else{ctx.globalCompositeOperation='lighter';const rgb=COL[s.kind]||COL.wisp;glowAt(rgb,q[0],q[1],s.kind==='wisp'?11:9,.75);ctx.fillStyle=s.kind==='wisp'?'#eafff2':'#fbffd8';ctx.beginPath();
      if(s.kind==='wisp'){ctx.translate(q[0],q[1]);ctx.rotate(sa);ctx.moveTo(4,0);ctx.quadraticCurveTo(0,-3.4,-8,0);ctx.quadraticCurveTo(0,3.4,4,0);ctx.fill()}else{ctx.arc(q[0],q[1],1.9,0,TAU);ctx.fill()}}
    ctx.restore()}
  ctx.save();for(const f of ZC.fx){const k=f.t/f.T,q=ZM.SB(f.x,f.y,f.z);
    if(f.k==='spore'){ctx.globalAlpha=.8*(1-k);ctx.fillStyle=`rgb(${COL.spore})`;ctx.beginPath();ctx.arc(q[0],q[1],1.4+k*2,0,TAU);ctx.fill()}
    else if(f.k==='heal'){ctx.globalAlpha=1-k;ctx.fillStyle='#c8f04a';ctx.fillRect(q[0]-.8,q[1]-3,1.6,6);ctx.fillRect(q[0]-3,q[1]-.8,6,1.6)}
    else{ctx.globalAlpha=1-k;ctx.fillStyle=`rgb(${COL[f.kind]||COL.wisp})`;ctx.beginPath();ctx.arc(q[0],q[1],1.6*(1-k*.5),0,TAU);ctx.fill()}}ctx.restore()}
// agganciati alla partita (come fortuna.js e armi_speciali.js)
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__pt)return D;D.__pt=1;
  const _u=D.update;D.update=(dt,on)=>{_u(dt,on);try{update(dt,on,D)}catch(e){console.error(e)}};
  const _t=D.drawTop;D.drawTop=dt=>{_t(dt);try{drawTop()}catch(e){console.error(e)}};
  const _r=D.reset;D.reset=()=>{_r();W.pets=null;ZC.shots.length=0;ZC.fx.length=0;ZC.st=null};return D}}
ZM.compagni=ZC})();
