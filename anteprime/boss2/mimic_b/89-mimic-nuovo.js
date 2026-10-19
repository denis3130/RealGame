// =====================================================================
// IL MIMIC RIFATTO: «la cassa sbagliata» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano timore nello
// sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). ANTEPRIMA: questo file e il
// modello sprite/nemici3d/mimic2.js entrano solo nella copia del gioco fatta da anteprime/mk_boss2.py; nel gioco vero dopo il sì di Denis
// (il modello prende il posto di 'mimic' e questo file va in src/ordine.txt). Design: docs/boss-classici-design/mimic.md.
// Il vecchio forziere della cripta su lunghe gambe pallide: fermo come un mobile e poi veloce come un ragno, avido e beffardo. Esce come
// oggi da una delle casse gemelle (42), una volta per partita. Il suo cuore è il tesoro: prima di ogni colpo «tin-tin», la luce corre
// nell'ottone fino alla parte che colpirà. Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma. Mosse:
// - Il Morso (chomp): una corsia rossa verso di te con tre impronte di denti che si accendono; corre lungo la corsia mordendo tre volte;
//   contro un ostacolo lo morde (trema, si crepa). Nella fase 2 due corse di fila.
// - La Frustata (tongue): una linea rossa dalla bocca verso di te fino al primo ostacolo; la lingua schiocca lungo il pavimento.
//   Gli ostacoli la fermano. Nella fase 2 la Frustata a tre (tongue3): tre linee a ventaglio che schioccano in fila.
// - L'Assaggio (grab, gulp): se gli stai addosso, un ventaglio rosso davanti; se ti prende ti mette in bocca, ti mastica e ti risputa.
// - Sputo d'oro (coins): sette linee tratteggiate a ventaglio fin dove si fermerà ogni moneta; le monete che restano a terra sono tue
//   per 3 s. Nella fase 2 la Pioggia d'oro: nove monete e sei cerchi dove ne ricadono altre.
// - La Tagliola (leap, stuck): due balzi (tre nella fase 2) con un cerchio rosso dove sei; all'ultimo resta coi denti nel pavimento:
//   «Colpo in bocca!» da ogni lato.
// - Il Gioco delle Casse (hide, chest, pop, daze; fase 2): torna cassa, ne cadono due finte, si scambiano di posto; tocca la vera e resta
//   stordito, sbagli e ti salta addosso.
// - Ha fame! (rage, a metà vita): la serratura si apre ed era un occhio; da lì tutto 1,3 volte più rapido (il Gioco delle Casse e lo
//   stordito in secondi veri).
// Il punto debole: «Colpo in bocca!» (+50%) colpendolo da davanti quando spalanca la bocca. Ogni danno ha un avviso a terra di almeno
// 0,8 s nella fase 1 e 0,6 s nella fase 2; una mossa alla volta; tra due mosse corre 1,1–1,5 s.
// =====================================================================
const MI2ON=typeof N3!=='undefined'&&!!N3.mimic2;
// (in the second phase the Lash of three before the Rain of gold: with its 900 of health the fight is short, and the second phase showed
// all its moves only now and then)
const MI2={seq1:['chomp','coins','tongue','leap'],seq2:['shell','chomp','tongue3','coins','leap'],red:'229,72,77',gold:'255,196,70',fire:'255,120,60',
  // the two «tin-tin» of the treasure waking up, the moment the model lights it (in the move's own clock)
  TIN:{chomp:[.03,.10],tongue:[.03,.10],tongue3:[.03,.09],grab:[.03,.09],coins:[.03,.10],leap:[.02]},
  // the mouth wide open, the weak point (from the front; from any side when stuck or dazed)
  OPEN:{chomp:[0,.45],tongue:[0,.5],tongue3:[0,.36],coins:[0,.5],taunt:[.12,.6]},
  // the damage of each blow before DMG(): the design's numbers ×1.5 (with them a hero standing still lost a third of what the Mimic of today
  // takes from him, which hits often with many small blows and jumps on you: tests/boss2diff.js mimic); to be tuned by playing
  D:{bite:33,lash:30,lash3:27,gulp:36,coin:18,rain:24,leap:30,leapL:36,fake:21}};
if(MI2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.mimic.old for the pages)
  const old=N3.mimic,oldM=N3.meta.mimic;N3.mimic=N3.mimic2;N3.meta.mimic=Object.assign({},N3.meta.mimic2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  Object.assign(ET.mimic,{r:30,cdmg:20});BOSS_INTRO.mimic=2.8;Object.assign(BDEATH,{mimic:{dur:3.4,clou:2.2,snd:'coin'}});
  // its light comes out of its mouth (little at rest, much with the mouth wide open; none when it hides)
  ELIGHT.mimic=(e,Lt)=>{if(e.hidden||e.st==='hide'||e.st==='chest')return;Lt(e.x,e.y-34,50+60*mi2open(e),e.p2?.75:.55)};
  // the model lifts itself (o.z); what the game passes to it: the length and the turn of the tongue, the three of the second phase, the last
  // leap, the material of the room, the eyes, the slide and the breath of the closed chest; the scuttle follows its own clock
  N3G.zm.mimic=1;N3G.wp.mimic=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  N3G.opt.mimic=e=>({reach:e.mreach||150,tang:e.mtang||0,reach3:e.mreach3,fan:e.mfan,last:!!e.mlast,mat:mi2mat(),real:e.mreal||0,slide:e.mslide||0,breath:e.mbreath||0});
  for(const s of['stuck','hide','chest','pop','daze','gulp','lure'])B2CALM.add(s);
}
// ---- helpers
const mi2sp=e=>e&&e.p2?1.3:1;
function mi2mat(){const t=themeOf(G.room);return isIce(t)?'frost':isSwamp(t)?'mud':t==='cenere'||t==='magma'||t==='forgia'||t==='fabbro'?'ash':'moss'}
// how wide its mouth is (for its light): from the move it is in
function mi2open(e){const k=b3k(e),O=MI2.OPEN[e.st];if(e.st==='stuck'||e.st==='daze'||e.st==='gulp'&&k>.7)return 1;if(O)return k>=O[0]&&k<O[1]?1:.2;return e.p2?.45:.2}
// a world vector (the length L along the world angle a) as the model's own floor vector, seen from its face f: the model draws on the floor
// with the camera's squash, so a line drawn by the model matches the line drawn by the game on the floor
function mi2model(f,a,L){const c=Math.cos(f),s=Math.sin(f),k=C3.cam.k,X=Math.cos(a)*L,Y=Math.sin(a)*L,x=X*c+Y/k*s,y=-X*s+Y/k*c;return{ang:Math.atan2(y,x),len:Math.hypot(x,y)}}
// how far from (x,y) along a before a wall or an obstacle (r: the room the thing needs)
function mi2reach(x,y,a,max,r){const ca=Math.cos(a),sa=Math.sin(a);r=r||4;let s=0;for(;s<(max||900);s+=5){const px=x+ca*s,py=y+sa*s;if(px<L+r||px>R-r||py<TOP+r||py>BOT-r)break;
    if(G.rocks.some(k=>!k.temp&&Math.hypot(k.x-px,k.y-py)<k.r+r))break}return s}
const mi2free=(x,y,r)=>x>L+r&&x<R-r&&y>TOP+r&&y<BOT-r&&!G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+r);
function mi2reset(){if(G)G.m2={warn:[],lanes:[],lines:[],fans:[],circles:[],coins:[],floor:[],rain:[],gulp:null,shell:null}}
{const _br=buildRoom;buildRoom=function(){mi2reset();return _br.apply(this,arguments)}}
const mi2mouth=(e,d)=>({x:e.x+Math.cos(e.face)*(d||26),y:e.y+Math.sin(e.face)*(d||26)});
function mi2walk(e,dur){b3go(e,'walk',dur==null?rand(.8,1.1)*mi2sp(e):dur);e.moving=false}
// the sounds of coins and wood: the «tin» of the treasure waking, a jingle, a wooden thud
function mi2tin(t,v){fModal(t,VR(2350,.03),[1,2.76,5.4,8.9],[.18,.11,.07,.04],.06*v,.35)}
function mi2coinSnd(x,v){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;try{const t=AU.ctx.currentTime+.01;AU.pan=clamp((x-(G.vx||0)-VW/2)/200,-.7,.7);for(let i=0;i<3;i++)mi2tin(t+i*.045+Math.random()*.02,(v||1)*(1-i*.2));AU.pan=0}catch(err){}}
function mi2thud(x){if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;try{const t=AU.ctx.currentTime+.01;fThump(t,VR(120,.08),55,.16,.22);fNoise(t,.12,'lowpass',VR(500,.1),.8,.12,{brown:true})}catch(err){}}
// the marks on the floor, baked into it: the print of a bite (a ring of little teeth), three scratches, gold dust
function mi2mark(kind,x,y,a){const c=fx;if(!c)return;c.save();c.setTransform(2,0,0,2,0,0);
  if(kind==='bite'){c.strokeStyle='rgba(30,18,10,.55)';c.lineWidth=1.4;c.beginPath();c.ellipse(x,y,18,9,0,0,TAU);c.stroke();c.fillStyle='rgba(20,12,6,.6)';
    for(let i=0;i<14;i++){const t=i/14*TAU,px=x+Math.cos(t)*18,py=y+Math.sin(t)*9,ix=x+Math.cos(t)*13,iy=y+Math.sin(t)*6.5;c.beginPath();c.moveTo(px+Math.sin(t)*2,py-Math.cos(t)*1);c.lineTo(ix,iy);c.lineTo(px-Math.sin(t)*2,py+Math.cos(t)*1);c.closePath();c.fill()}}
  else if(kind==='scratch'){const ca=Math.cos(a||0),sa=Math.sin(a||0);c.strokeStyle='rgba(28,18,10,.5)';c.lineWidth=1.3;c.lineCap='round';for(const o of[-6,0,6]){c.beginPath();c.moveTo(x-sa*o,y+ca*o*.55);c.lineTo(x-sa*o-ca*16,y+ca*o*.55-sa*9);c.stroke()}
    c.strokeStyle='rgba(220,200,170,.25)';c.lineWidth=.6;for(const o of[-6,0,6]){c.beginPath();c.moveTo(x-sa*o+.6,y+ca*o*.55+.6);c.lineTo(x-sa*o-ca*16+.6,y+ca*o*.55-sa*9+.6);c.stroke()}}
  else if(kind==='gold'){for(let i=0;i<14;i++){const t=rand(0,TAU),d=rand(0,22),px=x+Math.cos(t)*d,py=y+Math.sin(t)*d*.55;c.fillStyle=`rgba(255,${randi(190,230)},90,${rand(.35,.7).toFixed(2)})`;c.beginPath();c.arc(px,py,rand(.6,1.5),0,TAU);c.fill()}}
  c.restore()}
// a few splinters of wood (a strong blow, the bursting fakes)
function mi2planks(x,y,n){for(let i=0;i<B3N(n);i++)G.m2.coins.push({k:'plank',x,y,z:rand(10,30),vx:rand(-90,90),vy:rand(-60,40),vz:rand(60,140),rot:rand(0,TAU),vr:rand(-9,9),t:0,life:rand(.7,1.1),band:Math.random()<.3})}

// ---- the brain
function mi2rage(e){e.p2=true;e.shell=9;banner('Il Mimic ha fame!','Fase 2',1.6);bossRage(e,MI2.fire);$('bossBar').classList.add('rage');G.eproj=[];
  const B=G.m2;if(B){B.warn=[];B.lanes=[];B.lines=[];B.fans=[];B.circles=[];B.coins=B.coins.filter(c=>c.k==='plank');B.rain=[]}e.lane=null;e.si=-1;b3go(e,'rage');e.moving=false;b3say(e,'angry')}
function mi2start(e,nx,a){const B=G.m2,sp=mi2sp(e),D=s=>B3D(e,s)/sp;e.moving=false;e.ca=a;e.face=a;
  if(nx==='chomp'){mi2chompSetup(e,a);e.cn=e.p2?2:1;b3go(e,'chomp');return}
  if(nx==='tongue'||nx==='tongue3'){const m=mi2mouth(e,24),offs=nx==='tongue3'?[-.45,0,.45]:[0],L3=offs.map(o=>Math.min(240,mi2reach(m.x,m.y,a+o,240,3))),snaps=nx==='tongue3'?[.40,.56,.72]:[.5];
    e.tl=offs.map((o,i)=>({a:a+o,len:L3[i],hit:false,t0:snaps[i]}));offs.forEach((o,i)=>B.lines.push({x:m.x,y:m.y,a:a+o,len:L3[i],w:18,t:snaps[i]*D(nx),max:snaps[i]*D(nx),hot:.15}));
    const M=offs.map((o,i)=>mi2model(a,a+o,L3[i]+4));if(nx==='tongue'){e.mreach=M[0].len;e.mtang=M[0].ang}else{e.mreach3=M.map(q=>q.len);e.mfan=M.map(q=>q.ang)}
    b3go(e,nx);return}
  if(nx==='coins'){const m=mi2mouth(e,26),n=e.p2?9:7,span=70*Math.PI/180;e.cl=[];for(let i=0;i<n;i++){const an=a+(i-(n-1)/2)*span/(n-1),len=Math.min(rand(170,230),mi2reach(m.x,m.y,an,240,4));e.cl.push({a:an,len})}
    B.fans.push({k:'coins',x:m.x,y:m.y,L:e.cl,t:.5*D('coins'),max:.5*D('coins')});
    if(e.p2){const C=[],add=(x,y)=>{x=clamp(x,L+22,R-22);y=clamp(y,TOP+22,BOT-22);if(mi2free(x,y,20)&&C.every(q=>Math.hypot(q.x-x,q.y-y)>34))C.push({x,y})};
      add(P.x,P.y);add(P.x+(P.vxs||0)*.8,P.y+(P.vys||0)*.8);for(let i=0;i<24&&C.length<(LOWFX?4:6);i++){const an=rand(0,TAU),r=rand(50,90);add(P.x+Math.cos(an)*r,P.y+Math.sin(an)*r)}e.rc=C}
    b3go(e,'coins');return}
  if(nx==='leap'){e.leaps=e.p2?3:2;e.leapN=0;mi2leapSetup(e);b3go(e,'leap');return}
  if(nx==='grab'){B.fans.push({k:'grab',x:e.x,y:e.y,a,r:72,span:130*Math.PI/180,t:.58*D('grab'),max:.58*D('grab')});b3go(e,'grab');return}
  if(nx==='shell'){mi2shellStart(e,a);return}
  b3go(e,nx)}
function mi2chompSetup(e,a){const sp=mi2sp(e),run=clamp(mi2reach(e.x,e.y,a,400,24)-30,30,180),warn=.45*B3D(e,'chomp')/sp;
  G.m2.lanes.push({x:e.x,y:e.y,a,w:44,len:run+30,marks:[62,117,172].map(s=>s*run/180),t:warn,max:warn});e.lane={run,s:0,done:0,a};e.ca=a;e.face=a;e.bit=0}
function mi2leapSetup(e){const sp=mi2sp(e),max=e.p2?260:220,dx=P.x-e.x,dy=P.y-e.y,dd=Math.hypot(dx,dy),k=dd>max?max/dd:1;let tx=clamp(e.x+dx*k,L+36,R-36),ty=clamp(e.y+dy*k,TOP+40,BOT-36);
  if(!mi2free(tx,ty,30)){const s=b3spot(tx,ty,60,20);if(s){tx=s.x;ty=s.y}}const last=e.leapN+1>=e.leaps,warn=.93*B3D(e,'leap')/sp;
  e.lt={sx:e.x,sy:e.y,tx,ty,last};e.mlast=last&&!e.noStuck;G.m2.circles.push({k:'leap',x:tx,y:ty,r:36,t:warn,max:warn});e.face=Math.atan2(ty-e.y,tx-e.x);e.ca=e.face}
const mi2line=(x,y,a,len,w)=>{const ux=P.x-x,uy=P.y-y,ca=Math.cos(a),sa=Math.sin(a),u=ux*ca+uy*sa,v=Math.abs(uy*ca-ux*sa);return u>-4&&u<len+4&&v<w};
if(MI2ON)mimicUpd=function(e,dt,a,d){if(!G.m2)mi2reset();const B=G.m2,real=B.shell&&B.shell.on,sp=real||e.st==='daze'?1:mi2sp(e);dt*=sp;
  const busy=e.st==='leap'||e.st==='gulp'||e.st==='stuck'||real||e.st==='rage'||(e.st==='chomp'&&b3k(e)>=.4&&b3k(e)<.76);
  if(!e.p2&&e.hp<e.max*.5&&!busy){mi2rage(e);return}
  b3tick(e,dt);
  // the game of the chests drives it (mi2shellUpdate, in real seconds)
  if(real)return;
  const k=b3k(e),p2=e.p2;e.air=0;e.hidden=false;
  switch(e.st){
  // ---- LA CORSA A SCATTI: a dash toward a spot at your side (the side changes every two dashes), then a dead stop facing you
  case 'walk':{const w0=e.wt||0;e.wt=w0+dt;const Dw=B3D(e,'walk'),ph0=((w0%Dw)+Dw)%Dw/Dw,ph=(e.wt%Dw)/Dw,nc=ph<ph0;
    if(nc||!e.wtg){e.wn=(e.wn||0)+1;if(e.wn%2===0)e.wside=-(e.wside||1);const base=Math.atan2(e.y-P.y,e.x-P.x),an=base+(e.wside||1)*rand(.3,1.05),r=rand(80,120);
      e.wtg={x:clamp(P.x+Math.cos(an)*r,L+e.r,R-e.r),y:clamp(P.y+Math.sin(an)*r,TOP+e.r,BOT-e.r)};mi2coinSnd(e.x,.35)}
    if(ph<.55){const dx=e.wtg.x-e.x,dy=e.wtg.y-e.y,dd=Math.hypot(dx,dy);if(dd>4){const v=Math.min(dd,140*dt);e.face=Math.atan2(dy,dx);e.moving=true;moveCircle(e,dx/dd*v,dy/dd*v)}else e.moving=false}
    else{e.moving=false;e.face=a}
    for(const s of[.11,.22,.33,.44])if(ph0<s&&ph>=s||nc&&s<=ph)sfx('mimicStep',1,e.x);
    if(ph0<.55&&ph>=.55){e.wstop=(e.wstop||0)+1;if(e.wstop%3===0){const q=mi2mouth(e,14);mi2mark('scratch',q.x,q.y+6,e.face)}}
    e.spT=(e.spT==null?rand(2,3):e.spT)-dt;if(e.spT<=0&&!LOWFX){e.spT=rand(2,3);const q=mi2mouth(e,20);fxPush({k:'lvl',x:q.x,y:q.y-90,vx:rand(-30,30),vy:rand(-70,-30),t:.45,gold:true})}
    if(e.stT<=0&&ph>=.55){e.moving=false;mi2next(e,a,d)}break}
  // ---- IL MORSO: the lane toward you (its three bites light up), the run along it biting at .50 .58 .66; against an obstacle it bites it
  case 'chomp':{e.moving=false;const Ln=e.lane;if(k<.45)e.face=e.ca;
    if(k>=.45&&k<.72&&Ln&&!Ln.done){e.air=1;e.face=e.ca;const v=380*dt,ca=Math.cos(e.ca),sa=Math.sin(e.ca),st=Math.min(v,Ln.run-Ln.s);
      if(st<=.01)Ln.done=1;else{const ox=e.x,oy=e.y;moveCircle(e,ca*st,sa*st);Ln.s+=st;e.moving=true;if(Math.hypot(e.x-ox,e.y-oy)<st*.5){Ln.done=1;mi2biteRock(e)}}
      if(!LOWFX&&Math.random()<.5)fxPush({k:'puff',x:e.x-ca*20,y:e.y+8,vx:-ca*30,vy:-8,t:.35,r:rand(4,7)})}
    for(const b of[.50,.58,.66])if(b3at(e,b)){sfx('chomp',0,e.x);shake(2);const m=mi2mouth(e,28);if(!e.bit&&Math.hypot(P.x-m.x,P.y-m.y)<24+P.r*.5&&P.inv<=0&&P.dashT<=0){e.bit=1;hurtP(Math.round(MI2.D.bite*DMG()))}}
    if(b3at(e,.74)){const m=mi2mouth(e,26);mi2mark('bite',m.x,m.y+4);dustRing(m.x,m.y,10);shake(3);mi2thud(e.x)}
    if(e.stT<=0){e.lane=null;if(p2&&(e.cn=(e.cn||1)-1)>0){mi2chompSetup(e,a);b3go(e,'chomp')}else mi2walk(e)}break}
  // ---- LA FRUSTATA (and the three of the second phase): each line snaps once at its moment; the obstacles stop it
  case 'tongue':case 'tongue3':{e.moving=false;e.face=e.ca;const W=e.st==='tongue3'?.07:.12;
    for(const l of e.tl||[]){if(b3at(e,l.t0)){sfx('dash',0,e.x);const q={x:e.x+Math.cos(l.a)*(24+l.len),y:e.y+Math.sin(l.a)*(24+l.len)};dustRing(q.x,q.y,6);shake(1.5)}
      if(k>=l.t0&&k<l.t0+W&&!l.hit&&P.inv<=0&&P.dashT<=0){const m=mi2mouth(e,24);if(mi2line(m.x,m.y,l.a,l.len,9+P.r*.5)){l.hit=true;hurtP(Math.round((e.st==='tongue3'?MI2.D.lash3:MI2.D.lash)*DMG()))}}}
    if(e.st==='tongue'&&(b3at(e,.6)||b3at(e,.7))&&e.tl){const l=e.tl[0],q={x:e.x+Math.cos(l.a)*(24+l.len),y:e.y+Math.sin(l.a)*(24+l.len)};dustRing(q.x,q.y,5)}
    if(e.stT<=0){e.tl=null;mi2walk(e)}break}
  // ---- L'ASSAGGIO: the fan in front; at .58 if you are in it, it has you (the morsel); else it scratches the floor
  case 'grab':{e.moving=false;if(k<.5)e.face=e.ca;
    if(b3at(e,.58)){const dx=P.x-e.x,dy=P.y-e.y,dd=Math.hypot(dx,dy),da=Math.abs(angDiff(e.face,Math.atan2(dy,dx)));
      if(dd<72+P.r*.5&&da<65*Math.PI/180&&P.inv<=0&&P.dashT<=0){mi2gulpStart(e);break}else{const q=mi2mouth(e,40);mi2mark('scratch',q.x,q.y,e.face)}}
    if(e.stT<=0)mi2walk(e);break}
  case 'gulp':{e.moving=false;e.hidden=true;const g=B.gulp;
    if(b3at(e,.75)&&g)mi2spit(e,true);
    if(e.stT<=0){if(B.gulp)mi2spit(e,false);e.hidden=false;b3taunt(e)}break}
  // ---- SPUTO D'ORO / PIOGGIA D'ORO: the coins along the dashed lines (.50), the fountain onto the circles (.55)
  case 'coins':{e.moving=false;e.face=e.ca;
    if(b3at(e,.5)&&e.cl){const m=mi2mouth(e,26);for(const l of e.cl)B.coins.push({k:'spit',x:m.x,y:m.y,a:l.a,len:l.len,s:0,v:190,z:12,hit:false,spin:rand(0,TAU)});mi2coinSnd(e.x,1);sfx('coin',0,e.x);
      if(e.p2&&e.rc){for(const c of e.rc)B.circles.push({k:'rain',x:c.x,y:c.y,r:18,t:1.05,max:1.05})}}
    if(b3at(e,.55)&&e.p2&&e.rc){const m=mi2mouth(e,10);e.rc.forEach((c,i)=>B.rain.push({x0:m.x,y0:m.y,x:c.x,y:c.y,t:-i*.03,dur:1,hit:false,spin:rand(0,TAU)}));e.rc=null}
    if(e.stT<=0){e.cl=null;mi2walk(e)}break}
  // ---- LA TAGLIOLA: each leap to its circle (flight .20–.93, the height for the model), the landing; the last one stays stuck
  case 'leap':{e.moving=false;const T=e.lt;if(!T){mi2walk(e);break}e.face=T.last&&k>=.93?e.face:Math.atan2(T.ty-T.sy,T.tx-T.sx);
    if(k>=.2&&k<.93){const u=(k-.2)/.73,q=u*u*(3-2*u);e.x=T.sx+(T.tx-T.sx)*q;e.y=T.sy+(T.ty-T.sy)*q;e.z=80*Math.sin(Math.PI*u);e.air=1}else e.z=0;
    if(b3at(e,.2)&&e.leapN===0&&!e.noVoice)b3say(e,'c_hop');
    if(b3at(e,.93)){e.x=T.tx;e.y=T.ty;e.z=0;moveCircle(e,0,0);if(Math.hypot(P.x-e.x,P.y-e.y)<36+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round((T.last?MI2.D.leapL:MI2.D.leap)*DMG()));
      shake(5);sfx('boom',0,e.x);mi2thud(e.x);vib([40,30,60]);{const m=mi2mouth(e,20);mi2mark('bite',m.x,m.y+4)}dustRing(e.x,e.y,18);
      if(BOSS2){ENV2.fall(B3N(4));ENV2.rocks(e.x,e.y,120,1.5)}}
    if(e.stT<=0){e.z=0;e.leapN++;if(e.leapN<e.leaps){mi2leapSetup(e);b3go(e,'leap')}else if(e.mlast){e.mlast=false;b3go(e,'stuck')}else{e.noStuck=0;mi2walk(e)}}break}
  case 'stuck':{e.moving=false;if(b3at(e,.8)){shake(4);sfx('rock',0,e.x);mi2thud(e.x);mi2planks(e.x+Math.cos(e.face)*20,e.y,5);if(BOSS2){const S=stonePal();ENV2.chunks(e.x,e.y,B3N(8),[S.hi,S.mid,S.lo],90)}}
    if(e.stT<=0)mi2walk(e);break}
  // ---- IL GIOCO DELLE CASSE: the states are driven by the game of the chests (mi2shellUpdate, in real seconds)
  case 'hide':case 'chest':{e.moving=false;mi2walk(e);break}
  // (after the game of the chests: dazed for 2 real seconds, or a leap of the Trap at you without getting stuck)
  case 'pop':{e.moving=false;e.face=a;if(e.stT<=0){const nx=e.popNext;e.popNext=null;if(nx==='daze')b3go(e,'daze',2);else if(nx==='leap'){e.leaps=1;e.leapN=0;e.noStuck=1;mi2leapSetup(e);b3go(e,'leap')}else mi2walk(e)}break}
  case 'daze':{e.moving=false;if(e.stT<=0)mi2walk(e,rand(.3,.55));break}
  // ---- HA FAME! (second phase): no damage, no attacks; the lock opens (.47), the lid creaks (.60), the roar and the hands (.75 .78 .86)
  case 'rage':{e.moving=false;e.face=a;
    if(b3at(e,.2))b3torch('gold',.8);if(b3at(e,.47)){sfx('click',0,e.x);try{if(typeof qGlass==='function'&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running')qGlass(AU.ctx.currentTime+.01,1760,.7,.4)}catch(err){}}
    if(b3at(e,.6))sfx('door',0,e.x);
    if(b3at(e,.75)){b3torch('fire',4);shake(8);if(BOSS2)ENV2.rocks(e.x,e.y,400,2);mi2mark('gold',e.x,e.y+10);mi2coinSnd(e.x,1)}
    if(b3at(e,.78)||b3at(e,.86)){shake(4);mi2thud(e.x)}
    if(e.stT<=0){e.shell=0;e.si=-1;mi2next(e,a,d)}break}
  case 'lure':{e.moving=false;e.face=a;if(k>.25&&k<.75&&Math.random()<.04)mi2coinSnd(e.x,.25);if(e.stT<=0){e.lureT=1;mi2walk(e,rand(.3,.5))}break}
  case 'taunt':{e.moving=false;e.face=a;if(b3at(e,.82)){mi2coinSnd(e.x,.4);const m=mi2mouth(e,30);B.floor.push({x:m.x,y:m.y+6,t:3,spin:rand(0,TAU)})}if(e.stT<=0)mi2walk(e,rand(.3,.55));break}
  default:mi2walk(e)}};
function mi2next(e,a,d){const now=G.t||0;
  if(d<85&&now-(e.grabT==null?-99:e.grabT)>(e.p2?4:6)){e.grabT=now;mi2start(e,'grab',a);return}
  if(e.lureT){e.lureT=0;if(d>=140){mi2start(e,e.p2?'tongue3':'tongue',a);return}}
  // the game of the chests waits for room for its three chests (it comes at the first move that finds it)
  if(e.shellPend&&(e.shells||0)<2&&mi2shellSpots(e,a)){e.shellPend=0;mi2start(e,'shell',a);return}
  const seq=e.p2?MI2.seq2:MI2.seq1;let nx=seq[(e.si=(e.si==null?-1:e.si)+1)%seq.length];
  if(nx==='shell'){if((e.shells||0)<2&&mi2shellSpots(e,a)){mi2start(e,'shell',a);return}if((e.shells||0)<2)e.shellPend=1;nx=seq[(e.si=e.si+1)%seq.length]}
  mi2start(e,nx,a)}
// biting an obstacle at the end of the run: it shakes and cracks, splinters of wood and stone, the print on the floor
function mi2biteRock(e){const m=mi2mouth(e,30);let best=null,bd=1e9;for(const k of G.rocks){const dd=Math.hypot(k.x-m.x,k.y-m.y)-k.r;if(dd<bd){bd=dd;best=k}}
  shake(3);sfx('chomp',0,e.x);mi2mark('bite',m.x,m.y+4);
  if(best&&bd<26&&BOSS2){ENV2.rocks(best.x,best.y,60,1.5);const S=stonePal();ENV2.chunks(best.x,best.y,B3N(8),[S.hi,S.mid,S.lo],90);stamp('cracks',best.x,best.y+4,14)}mi2planks(m.x,m.y,2)}
// the morsel: the hero in its mouth (no hero, no dash, no Super), chewed, spat out in front with the damage
function mi2gulpStart(e){const B=G.m2;B.gulp={t:0};b3go(e,'gulp',B3D(e,'gulp'));e.hidden=true;text(e.x,e.y-100,'Gnam!','#ffd84a',18);b3say(e,'c_gnam',1);sfx('chomp',0,e.x);shake(4);vib([40,20,40]);
  // in its mouth for 0.9 s (0.7 in the second phase): the spit comes at .75 of the move
  e.gulpK=1}
function mi2spit(e,hurt){const B=G.m2;if(!B||!B.gulp)return;B.gulp=null;e.hidden=false;
  let q=mi2mouth(e,70);if(!mi2free(q.x,q.y,16)){const s=b3spot(q.x,q.y,70,20);if(s)q=s}P.x=clamp(q.x,L+P.r,R-P.r);P.y=clamp(q.y,TOP+P.r,BOT-P.r);P.hopT=.38;
  if(hurt){P.inv=0;hurtP(Math.round(MI2.D.gulp*DMG()));P.inv=1;text(P.x,P.y-40,'Bleah!','#ffb0c0',16);b3say(e,'c_spit',1)}else P.inv=Math.max(P.inv,1)}
// while it has you: you stay in its mouth (after every update), invulnerable, unseen; no dash, no Super
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(MI2ON&&G&&G.m2&&started&&!paused)mi2update(dt)}catch(err){console.error(err)}}}
{const _d=dash;dash=function(){if(G&&G.m2&&G.m2.gulp)return;return _d.apply(this,arguments)}}
{const _ul=useUlt;useUlt=function(){if(G&&G.m2&&G.m2.gulp)return;return _ul.apply(this,arguments)}}
{const _dh=drawHero;drawHero=function(){if(G&&G.m2&&G.m2.gulp&&G.state==='play')return;return _dh.apply(this,arguments)}}
// its own shadow is the model's (the real chest and the fakes must cast the same)
{const _sf=shadowFor;shadowFor=function(e){if(MI2ON&&e.type==='mimic')return;return _sf.apply(this,arguments)}}

// ---- the dangers in flight and on the floor, the game of the chests, the morsel
function mi2update(dt){const B=G.m2;if(!B)return;const e=G.enemies.find(q=>q.type==='mimic'&&!q.dead);
  if(G.state!=='play'){if(B.gulp){if(e)mi2spit(e,false);else B.gulp=null}if(B.shell)mi2shellEnd(true);
    if(B.warn.length||B.lanes.length||B.lines.length||B.fans.length||B.circles.length||B.rain.length){B.warn=[];B.lanes=[];B.lines=[];B.fans=[];B.circles=[];B.rain=[];B.coins=B.coins.filter(c=>c.k==='plank')}}
  if(B.gulp){if(!e){B.gulp=null}else{const m=mi2mouth(e,24);P.x=m.x;P.y=m.y;P.inv=Math.max(P.inv,.35);P.dashT=0}}
  for(const A of[B.warn,B.lanes,B.lines,B.fans,B.circles])for(let i=A.length-1;i>=0;i--){A[i].t-=dt;if(A[i].t<=-.12)A.splice(i,1)}
  // the coins spat along their lines: skimming the floor with two bounces; they hurt only in flight; then they lie there, yours for 3 s
  for(let i=B.coins.length-1;i>=0;i--){const c=B.coins[i];
    if(c.k==='plank'){c.t+=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vz-=420*dt;c.z+=c.vz*dt;c.rot+=c.vr*dt;if(c.z<0){c.z=0;c.vz*=-.3;c.vx*=.6;c.vy*=.6}if(c.t>c.life)B.coins.splice(i,1);continue}
    c.s+=c.v*dt;const u=c.s/Math.max(1,c.len);c.spin+=dt*14;c.z=u<.5?14*Math.sin(Math.PI*u/.5):u<.8?6*Math.sin(Math.PI*(u-.5)/.3):0;
    const x=c.x+Math.cos(c.a)*c.s,y=c.y+Math.sin(c.a)*c.s;
    if(!c.hit&&c.z<18&&Math.hypot(P.x-x,P.y-y)<7+P.r*.4&&P.inv<=0&&P.dashT<=0){c.hit=true;hurtP(Math.round(MI2.D.coin*DMG()))}
    if(c.s>=c.len){B.coins.splice(i,1);mi2floorCoin(x,y)}}
  for(let i=B.rain.length-1;i>=0;i--){const r=B.rain[i];r.t+=dt;r.spin+=dt*10;if(r.t<r.dur)continue;B.rain.splice(i,1);
    if(Math.hypot(P.x-r.x,P.y-r.y)<18+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(MI2.D.rain*DMG()));mi2floorCoin(r.x,r.y);dustRing(r.x,r.y,6);mi2coinSnd(r.x,.4)}
  // the coins on the floor: picked up at 16 px (1 gold each), gone after 3 s in a glint
  for(let i=B.floor.length-1;i>=0;i--){const f=B.floor[i];f.t-=dt;if(Math.hypot(P.x-f.x,P.y-f.y)<16&&!B.gulp){B.floor.splice(i,1);G.gold=(G.gold||0)+1;G.goldRun=(G.goldRun||0)+1;sfx('coin');if(!LOWFX)fxPush({k:'lvl',x:f.x,y:f.y-6,vx:0,vy:-60,t:.4,gold:true});continue}
    if(f.t<=0){B.floor.splice(i,1);if(!LOWFX)fxPush({k:'lvl',x:f.x,y:f.y-4,vx:0,vy:-30,t:.3,gold:true})}}
  if(B.shell)mi2shellUpdate(dt,e)}
function mi2floorCoin(x,y){const B=G.m2;x=clamp(x,L+8,R-8);y=clamp(y,TOP+8,BOT-8);B.floor.push({x,y,t:3,spin:rand(0,TAU)});if(B.floor.length>12)B.floor.shift()}

// ---- IL GIOCO DELLE CASSE (second phase, at most twice, in real seconds): it hides, two fakes fall, they swap places, you choose
function mi2shellSpots(e,a){const ok=q=>q.x>L+40&&q.x<R-40&&q.y>TOP+40&&q.y<BOT-40&&Math.hypot(q.x-P.x,q.y-P.y)>=130&&!G.rocks.some(k=>Math.hypot(k.x-q.x,k.y-q.y)<k.r+26);
  // its own place (or one it first runs back to, away from you), the two others at its sides, across the line toward you
  const ax0=Math.atan2(e.y-P.y,e.x-P.x),d0=Math.hypot(P.x-e.x,P.y-e.y);
  // (against a wall the row turns, up to along the line toward you)
  for(const rw of[0,.5,-.5,1,-1,1.57])for(const tw of[0,.3,-.3,.6,-.6])for(const far of[Math.max(150,d0),190,230]){const ax=ax0+tw,base={x:clamp(P.x+Math.cos(ax)*far,L+50,R-50),y:clamp(P.y+Math.sin(ax)*far,TOP+50,BOT-50)},
      px=-Math.sin(ax+rw),py=Math.cos(ax+rw);
    for(const d of[125,110,140]){const S=[base,{x:base.x+px*d,y:base.y+py*d},{x:base.x-px*d,y:base.y-py*d}];if(S.every(ok)){e.shellS=S;return true}}}
  // else anywhere in the room, far from you: a row across the room
  for(let gy=TOP+70;gy<BOT-60;gy+=40)for(const d of[125,110]){const S=[{x:(L+R)/2,y:gy},{x:(L+R)/2-d,y:gy},{x:(L+R)/2+d,y:gy}];if(S.every(ok)){e.shellS=S;return true}}
  return false}
function mi2shellStart(e,a){const S=e.shellS;if(!S){mi2start(e,'chomp',a);return}e.shells=(e.shells||0)+1;const B=G.m2;
  // the real one in one of the three places (the middle one at first), the two fakes fall on the other two
  B.shell={on:true,t:0,e,ph:'run',S,real:0,pos:[0,1,2],fk:[],swaps:e.shells>1?4:3,sw:e.shells>1?.42:.5,swi:-1,choice:false,res:null,run:Math.hypot(S[0].x-e.x,S[0].y-e.y)>8};
  for(const i of[1,2])B.circles.push({k:'fake',x:S[i].x,y:S[i].y,r:26,t:.8+(B.shell.run?.4:0),max:.8+(B.shell.run?.4:0)});
  if(!B.shell.run){B.shell.ph='hide';b3go(e,'hide');b3say(e,'laugh2',1)}else{b3go(e,'walk',.4);e.moving=true}}
function mi2shellUpdate(dt,e){const B=G.m2,S=B.shell;if(!e||e.dead){mi2shellEnd(true);return}S.t+=dt;e.hidden=S.ph!=='run';e.air=1;e.z=e.z||0;
  if(S.ph==='run'){const q=S.S[0],dx=q.x-e.x,dy=q.y-e.y,dd=Math.hypot(dx,dy);e.st='walk';e.moving=true;e.wt=(e.wt||0)+dt*1.4;if(dd>3){const v=Math.min(dd,300*dt);e.face=Math.atan2(dy,dx);moveCircle(e,dx/dd*v,dy/dd*v)}
    if(dd<=3||S.t>.4){e.x=q.x;e.y=q.y;S.ph='hide';S.t=0;b3go(e,'hide');b3say(e,'laugh2',1)}return}
  if(S.ph==='hide'){if(S.t>=.5&&!S.thud){S.thud=1;mi2thud(e.x);shake(2)}
    // the two fakes fall from above (.25–.80)
    if(S.t>=.25&&!S.fk.length){for(const i of[1,2]){const c={x:S.S[i].x,y:S.S[i].y,st:'m2',t:0,k:0,drop:1,z:260,fake:true,slot:i,real:0,breath:0,slide:0};S.fk.push(c);(G.cc||(G.cc=[])).push(c)}}
    for(const c of S.fk){c.t+=dt;c.z=Math.max(0,260*(1-Math.min(1,c.t/.55))**2);if(c.t>=.55&&c.drop){c.drop=0;c.z=0;shake(4);sfx('boom',0,c.x);dustRing(c.x,c.y,16);
      if(Math.hypot(P.x-c.x,P.y-c.y)<26+P.r*.4&&P.inv<=0&&P.dashT<=0)hurtP(Math.round(MI2.D.fake*DMG()))}}
    if(S.t>=.8&&e.st==='hide'){b3go(e,'chest',99)}
    if(S.t>=1){S.ph='swap';S.t=0;banner('Tre casse!','Trova quella vera',1.6)}return}
  if(S.ph==='swap'){const n=Math.floor(S.t/S.sw);if(n!==S.swi&&n<S.swaps){S.swi=n;
      // two of the three swap places along two arcs (one in front, one behind) with a hop; the real one's eyes flash at the start
      const pairs=[[0,1],[1,2],[0,2]];const[a,b]=pairs[randi(0,2)];S.pa=a;S.pb=b;S.from=S.pos.slice();e.mreal=1;S.flash=.1;mi2thud(e.x);setTimeout(()=>{if(G&&G.m2&&G.m2.shell)mi2thud(e.x)},S.sw*500);
      if(Math.random()<.6)b3say(e,'laugh2',1)}
    if(S.flash>0){S.flash-=dt;if(S.flash<=0)e.mreal=0}
    const u=Math.min(1,(S.t-S.swi*S.sw)/S.sw),sw=S.swi>=0&&S.swi<S.swaps;
    // the chests: index 0 is the real one (the Mimic), 1 and 2 the fakes; pos[i] is the place of chest i
    const chests=[{o:e,i:0},{o:S.fk[0],i:1},{o:S.fk[1],i:2}];
    if(sw&&u<1){for(const c of chests){const at=S.from[c.i];if(at!==S.pa&&at!==S.pb){const q=S.S[at];c.o.x=q.x;c.o.y=q.y;mi2chestZ(c.o,0,0);continue}
        const to=at===S.pa?S.pb:S.pa,A=S.S[at],Bq=S.S[to],q=u*u*(3-2*u),side=at===S.pa?1:-1,nx=-(Bq.y-A.y),ny=Bq.x-A.x,nl=Math.hypot(nx,ny)||1;
        c.o.x=A.x+(Bq.x-A.x)*q+nx/nl*side*28*Math.sin(Math.PI*u);c.o.y=A.y+(Bq.y-A.y)*q+ny/nl*side*14*Math.sin(Math.PI*u);mi2chestZ(c.o,16*Math.sin(Math.PI*u),side*(Bq.x>A.x?1:-1))}}
    if(sw&&u>=1){for(const c of chests){const at=S.from[c.i];if(at===S.pa)S.pos[c.i]=S.pb;else if(at===S.pb)S.pos[c.i]=S.pa}
      for(const c of chests){const q=S.S[S.pos[c.i]];c.o.x=q.x;c.o.y=q.y;mi2chestZ(c.o,0,0)}}
    if(S.t>=S.swaps*S.sw){for(const c of chests){const q=S.S[S.pos[c.i]];c.o.x=q.x;c.o.y=q.y;mi2chestZ(c.o,0,0)}S.ph='choose';S.t=0;S.choice=true}return}
  if(S.ph==='choose'){// three seconds to choose by touching a chest; the real one lifts its lid by 2° every 0.9 s
    e.mbreath=(S.t%.9)<.25?Math.sin((S.t%.9)/.25*Math.PI):0;
    const pick=[{o:e,real:1}].concat(S.fk.map(o=>({o,real:0}))).find(c=>touching(P,{x:c.o.x,y:c.o.y-2,rx:24,ry:12},6));
    if(pick){if(pick.real){text(e.x,e.y-70,'Trovato!','#ffd84a',20);sfx('victory');for(const f of S.fk)mi2burst(f);S.fk=[];mi2shellEnd(false,'daze')}
      else{mi2burst(pick.o);S.fk=S.fk.filter(f=>f!==pick.o);for(const f of S.fk)mi2burst(f);S.fk=[];mi2shellEnd(false,'leap')}return}
    if(S.t>=3){for(const f of S.fk)mi2burst(f);S.fk=[];mi2shellEnd(false,'leap')}}}
function mi2chestZ(o,z,sl){if(o.type==='mimic'){o.z=z;o.mslide=sl}else{o.z=z;o.slide=sl}}
// a fake bursts: «Vuota!», a puff, planks and three real coins
function mi2burst(c){text(c.x,c.y-50,'Vuota!','#e8dcc4',15);sfx('rock',0,c.x);mi2thud(c.x);for(let i=0;i<12;i++)fxPush({k:'puff',x:c.x+rand(-14,14),y:c.y-rand(4,20),vx:rand(-50,50),vy:rand(-50,10),t:rand(.3,.55),r:rand(5,9)});
  mi2planks(c.x,c.y,6);for(let i=0;i<3;i++){const a=rand(0,TAU),s=rand(60,140);G.coins.push({x:c.x,y:c.y-10,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:-.1})}
  if(G.cc)G.cc=G.cc.filter(q=>q!==c)}
function mi2shellEnd(abort,next){const B=G.m2,S=B&&B.shell;if(!S)return;const e=S.e;for(const f of S.fk||[]){if(G.cc)G.cc=G.cc.filter(q=>q!==f)}B.shell=null;
  B.circles=B.circles.filter(c=>c.k!=='fake');if(!e||e.dead)return;e.hidden=false;e.air=0;e.z=0;e.mreal=0;e.mslide=0;e.mbreath=0;
  if(abort){mi2walk(e);return}
  e.popNext=next;b3go(e,'pop');sfx('roar',0,e.x);shake(3)}

// ---- the weak point: the mouth wide open, hit from the front (from any side when stuck or dazed): +50%
{const _h=hurtE;hurtE=function(e,d){if(MI2ON&&e&&e.type==='mimic'&&!e.dead){const k=b3k(e),O=MI2.OPEN[e.st];let open=e.st==='stuck'&&k<.8||e.st==='daze';
    if(!open&&O&&k>=O[0]&&k<O[1]&&P){const da=Math.abs(angDiff(e.face,Math.atan2(P.y-e.y,P.x-e.x)));open=da<70*Math.PI/180}
    if(open){const A=[...arguments];A[1]=d*1.5;if(!G.mi2txt){G.mi2txt=1;text(e.x,e.y-110,'Colpo in bocca!','#ffd84a',18)}
      try{if(AU.ctx&&AU.on.sfx&&AU.ctx.state==='running')mi2tin(AU.ctx.currentTime+.01,.8)}catch(err){}if(!LOWFX)fxPush({k:'lvl',x:e.x+Math.cos(e.face)*20,y:e.y-50,vx:rand(-40,40),vy:-80,t:.4,gold:true});
      if(Math.random()<.3)mi2planks(e.x,e.y,2);return _h.apply(this,A)}}return _h.apply(this,arguments)}}

// ---- the drawings: on the floor the warnings (the lanes with their bite prints, the lines of the tongues, the dashed fan of the coins, the
// fan of the grab, the circles with their crown of little teeth), the coins lying there; in the air the coins, the rain, the planks
function mi2ground(){const B=G.m2;if(!B)return;const red=MI2.red,pu=.55+.3*Math.sin(G.t*18);
  for(const l of B.lanes){if(l.t<0)continue;const k=1-l.t/l.max;ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);ctx.fillStyle=`rgba(${red},${(.08+.14*k).toFixed(3)})`;ctx.fillRect(0,-l.w/2,l.len,l.w);
    ctx.strokeStyle=`rgba(${red},${pu.toFixed(3)})`;ctx.lineWidth=2;ctx.strokeRect(0,-l.w/2,l.len,l.w);
    l.marks.forEach((s,i)=>{const on=k>=(i+1)/3,a=on?.95:.45;ctx.strokeStyle=on?`rgba(255,240,210,${a})`:`rgba(${red},${a})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(s,0,9,13,0,-Math.PI/2,Math.PI/2);ctx.stroke();
      ctx.fillStyle=ctx.strokeStyle;for(let j=0;j<5;j++){const t=-Math.PI/2+(j+.5)/5*Math.PI;ctx.beginPath();ctx.moveTo(s+Math.cos(t)*9,Math.sin(t)*13);ctx.lineTo(s+Math.cos(t)*5.5,Math.sin(t)*9);ctx.lineTo(s+Math.cos(t+.25)*9,Math.sin(t+.25)*13);ctx.fill()}});ctx.restore()}
  for(const l of B.lines){const k=1-Math.max(0,l.t)/l.max,hot=l.t<l.hot&&l.t>-.1;ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);ctx.fillStyle=`rgba(${red},${(.07+.12*k+(hot?.15:0)).toFixed(3)})`;ctx.fillRect(0,-l.w/2,l.len,l.w);
    ctx.strokeStyle=`rgba(${red},${hot?(Math.sin(G.t*40)>0?.95:.55):pu*.85})`;ctx.lineWidth=hot?2.6:1.8;ctx.strokeRect(0,-l.w/2,l.len,l.w);ctx.restore()}
  for(const f of B.fans){const k=1-Math.max(0,f.t)/f.max;
    if(f.k==='coins'){for(const l of f.L){const ca=Math.cos(l.a),sa=Math.sin(l.a),ln=l.len*Math.min(1,k*1.3);ctx.strokeStyle=`rgba(${red},${pu.toFixed(3)})`;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+ca*ln,f.y+sa*ln);ctx.stroke();ctx.setLineDash([]);
        ctx.beginPath();ctx.ellipse(f.x+ca*l.len,f.y+sa*l.len,5,3,0,0,TAU);ctx.stroke()}}
    else{ctx.fillStyle=`rgba(${red},${(.1+.2*k).toFixed(3)})`;ctx.strokeStyle=`rgba(${red},${pu.toFixed(3)})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.ellipse(f.x,f.y,f.r,f.r*.62,0,f.a-f.span/2,f.a+f.span/2);ctx.closePath();ctx.fill();ctx.stroke()}}
  for(const c of B.circles){if(c.t<0)continue;const k=1-c.t/c.max;ctx.fillStyle=`rgba(${red},${(.1+.22*k).toFixed(3)})`;ctx.beginPath();ctx.ellipse(c.x,c.y,c.r*k,c.r*k*.6,0,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(${red},${pu.toFixed(3)})`;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(c.x,c.y,c.r,c.r*.6,0,0,TAU);ctx.stroke();
    if(c.k==='leap'){ctx.fillStyle=`rgba(0,0,0,${(.12+.25*k).toFixed(3)})`;ctx.beginPath();ctx.ellipse(c.x,c.y,c.r*(.3+.7*k)*.85,c.r*(.3+.7*k)*.5,0,0,TAU);ctx.fill();
      for(let i=0;i<8;i++){const a=-Math.PI/2+i*TAU/8,on=k>=(i+1)/8,px=c.x+Math.cos(a)*c.r*1.08,py=c.y+Math.sin(a)*c.r*.65;ctx.fillStyle=on?'rgba(255,248,230,.95)':`rgba(${red},.6)`;ctx.beginPath();ctx.moveTo(px-2.2,py);ctx.lineTo(px,py-(on?5:3.5));ctx.lineTo(px+2.2,py);ctx.closePath();ctx.fill()}}}
  // the coins lying on the floor, glinting (gone in their last half second)
  const Ck=N3.mimicCoin;for(const f of B.floor){const g=Math.max(0,Math.sin((G.t+f.spin)*3))**8;if(Ck)Ck(f.x,f.y,0,0,1,{floor:true,glint:g,a:Math.min(1,f.t/.4)})}}
function mi2air(){const B=G.m2;if(!B)return;const Ck=N3.mimicCoin,Pk=N3.mimicPlank;
  for(const c of B.coins){if(c.k==='plank'){if(Pk)Pk(c.x,c.y,c.z,c.rot,.8,{band:c.band,a:Math.min(1,(c.life-c.t)/.25)});continue}
    const x=c.x+Math.cos(c.a)*c.s,y=c.y+Math.sin(c.a)*c.s;shadow(x,y+2,4,1.6,.25);if(Ck)Ck(x,y,c.z,c.spin,1,{})}
  for(const r of B.rain){if(r.t<0)continue;const u=r.t/r.dur,x=lerp(r.x0,r.x,u),y=lerp(r.y0,r.y,u),z=150*Math.sin(Math.PI*u)*(1-u*.4)+40*(1-u);shadow(r.x,r.y+2,4*u,1.6*u,.25*u);if(Ck)Ck(x,y,z,r.spin,1,{})}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(MI2ON)mi2ground()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(MI2ON)mi2air()}catch(err){}}}

// ---- the twin chests (42 does not change): drawn with the model's closed chest, the good one opening on velvet and gold, the wrong one
// shaking; and the fakes of the game of the chests, drawn exactly like the real one
if(MI2ON){const _dt=drawTwinChest;drawTwinChest=function(c){const C=N3.mimicChest;if(!C)return _dt.apply(this,arguments);
    if(c.st==='m2'){try{C(c.x,c.y+8,c.z||0,Math.PI/2,1,{mat:mi2mat(),slide:c.slide||0,breath:0,p2:true})}catch(err){}return}
    if(c.t<0)return;const drop=c.st==='drop'?Math.max(0,1-c.t/.55):0,z=drop*drop*260,sq=c.st==='poof'?Math.max(0,1-c.k/.5):1;
    const o={mat:mi2mat()};if(c.st==='open'){o.good=1;o.lid=Math.min(1,c.k/.35);o.gold=Math.min(1,c.k/.35)}if(c.st==='shake')o.shake=Math.min(1,c.k/1.1);
    try{if(sq<1){ctx.save();ctx.translate(c.x,c.y+8);ctx.scale(sq,sq);ctx.translate(-c.x,-(c.y+8))}C(c.x,c.y+8,z,Math.PI/2,1,o);if(sq<1)ctx.restore()}catch(err){return _dt.apply(this,arguments)}
    if(c.st==='idle'&&G.state==='cleared'&&!G.ccChosen){const b=Math.sin(G.t*5)*3;ctx.fillStyle='#ffc93c';ink(2.5);ctx.beginPath();ctx.moveTo(c.x,c.y-74+b);ctx.lineTo(c.x-7,c.y-84+b);ctx.lineTo(c.x+7,c.y-84+b);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('?',c.x,c.y-88+b);ctx.fillStyle='#fff';ctx.fillText('?',c.x,c.y-88+b)}};
  // the bigger chest crushes what is round it when it falls
  const _sp=spawnTwinChests;spawnTwinChests=function(){const r=_sp.apply(this,arguments);try{for(const c of G.cc||[])c.crush=G.rocks.filter(k=>!k.temp&&Math.hypot(k.x-c.x,k.y-c.y)<k.r+36)}catch(err){}return r};
  // the «?» over the three chests while you choose
  const _dh2=drawHazards2Air;drawHazards2Air=function(){_dh2.apply(this,arguments);try{const S=G.m2&&G.m2.shell;if(S&&S.ph==='choose'){const b=Math.sin(G.t*5)*3;
    for(const o of[S.e].concat(S.fk)){ctx.fillStyle='#ffc93c';ink(2.5);ctx.beginPath();ctx.moveTo(o.x,o.y-74+b);ctx.lineTo(o.x-7,o.y-84+b);ctx.lineTo(o.x+7,o.y-84+b);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.font='13px "Lilita One", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.strokeText('?',o.x,o.y-88+b);ctx.fillStyle='#fff';ctx.fillText('?',o.x,o.y-88+b)}}}catch(err){}}}

// ---- the entrance (2.8 s, the model's 'enter'): the closed chest leaps back, shakes, its eyes light up, it rises on its legs in three
// jerks, the arms unroll, the lid opens wide, the hands slam the floor and it screams
if(MI2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='mimic')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.mimic;if(e.iT==null){e.iT=0;e._snW=1;const dx=e.x-P.x,dy=e.y-P.y,dd=Math.hypot(dx,dy)||1;let q={x:clamp(e.x+dx/dd*50,L+40,R-40),y:clamp(e.y+dy/dd*50,TOP+50,BOT-40)};
    if(!mi2free(q.x,q.y,26)){const s=b3spot(q.x,q.y,50,16);if(s)q=s}e.i0={x:e.x,y:e.y,tx:q.x,ty:q.y}}
  const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s*T&&t>=s*T;e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;e.em=t<T*.98?.999:1;
  if(e.i0&&t<.28){const u=Math.min(1,t/.28),q=u*u*(3-2*u);e.x=e.i0.x+(e.i0.tx-e.i0.x)*q;e.y=e.i0.y+(e.i0.ty-e.i0.y)*q}else if(e.i0){e.x=e.i0.tx;e.y=e.i0.ty;e.i0=null;moveCircle(e,0,0)}
  for(const s of[.10,.25,.33,.41])if(at(s)){mi2thud(e.x);shake(2)}
  for(const s of[.46,.53])if(at(s))sfx('click',0,e.x);
  if(at(.62))sfx('mimicWake',1,e.x);
  if(at(.82)){shake(4);dustRing(e.x,e.y,22);vib([50,30,60]);mi2thud(e.x)}
  if(at(.84)){if(!b3say(e,'cry'))sfx('roar');shake(6);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-30,rgb:'255,220,140',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
  if(e.intro<=0){e.z=0;e.em=null;e.si=-1;e.iT=null;mi2walk(e,.9)}}}
// what the model plays: every state on its own clock (the brain's), the scuttle on its own, the entrance over its whole length
if(MI2ON){const _nm=n3Move;n3Move=function(e){if(e.type!=='mimic')return _nm.apply(this,arguments);
  if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.mimic))];if(e.st==='walk')return['walk',N3G.wp.mimic(e)];
  const M=N3.meta.mimic;if(!M.an.includes(e.st))return['idle',((G.t||0)/3)%1];const k=(e.mt||0)/B3D(e,e.st);return[e.st,e.st==='chest'||e.st==='daze'?k%1:Math.min(.999,Math.max(0,k))]}}

// ---- the defeat (3.4 s, the model's 'die'): it folds up, the lid jumps off, a fountain of coins; the reward stays the game's
if(MI2ON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='mimic')return{live:1};return _sb.apply(this,arguments)}
  BDIE.mimic={setup(c){const e=c.e;const B=G.m2;if(B&&B.gulp)mi2spit(e,false);if(B&&B.shell)mi2shellEnd(true);mi2reset();c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;b3say(c,'die')},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur);if(p>.4&&!c.thud){c.thud=1;shake(5);mi2thud(c.x);dustRing(c.x,c.y,18)}
      if(p>.65&&p<.95&&Math.random()<(LOWFX?.25:.6)){cpart(c,{k:'coin',x:c.x+rand(-10,10),y:c.y-rand(40,60),vx:rand(-90,90),vz:rand(60,160),life:rand(.6,1)});if(Math.random()<.3)mi2coinSnd(c.x,.4)}},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.mimic;try{N3.mimic(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX,mat:mi2mat()})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='mimic')return _dc.apply(this,arguments);try{BDIE.mimic.draw(c,BDEATH.mimic)}catch(err){}drawParts(c)}}

// ---- the voice and the personality, like the new bosses (88-boss3-voci.js): wood, teeth and coins, never horror. A creaking roar that
// booms as in a barrel when it arrives; teeth chattering «ka-ka-ka-ka» with the coins when it mocks you; «hm-hm?» with the coins shaken
// when it calls you (and its bait); a hollow «bonk» when you hit it hard; a deflating moan and a cascade of coins when it falls
if(MI2ON){B3S.add('mimic');
  const ka=(n,t0,step,f,v)=>[...Array(n)].map((_,i)=>({t:t0+i*step,d:.07,noise:1,v:v||'k',a:1-i*.06,hs:.7,f:[f,f*.9]}));
  B3VO.VB.mimic={base:{tn:.4,br:.35,ji:.08,lp:.6,ro:.5},k:{
    cry:[[1.7,[{t:0,d:.3,noise:1,v:'h',a:.8,hs:.6},{t:.22,d:1.4,f:[150,230,120],v:['o','a','o'],ro:.85,vib:[.03,5],rel:.4,h:.05}],.66]],
    angry:[[1.7,[{t:0,d:.22,noise:1,v:'i',a:.9,hs:.9},{t:.2,d:1.45,f:[170,250,140],v:['a','o'],ro:.85,vib:[.035,6],rel:.35}],.66]],
    laugh:[[.9,[...ka(6,0,.11,1600),{t:.68,d:.2,f:[300,240],v:'a',a:.5,ro:.4}],.5]],
    laugh2:[[.8,[{t:0,d:.22,f:[220,260],v:'m',ro:.5},{t:.3,d:.36,f:[230,300],v:['m','u'],ro:.5,h:.1}],.5]],
    hurt:[[.32,[{t:0,d:.06,noise:1,v:'h',a:.8},{t:.04,d:.26,f:[180,120],v:'o',ro:.8,h:.2}],.5]],
    c_chomp:[[.36,[{t:0,d:.1,noise:1,v:'k',a:.9},{t:.06,d:.28,f:[210,160],v:['a','o'],ro:.6,h:.25}],.5]],
    c_slurp:[[.46,[{t:0,d:.44,noise:1,v:'s',a:.6,hs:.4,f:[900,2600]}],.48]],
    c_gnam:[[.4,[{t:0,d:.16,f:[200,170],v:'m',ro:.5},{t:.18,d:.2,f:[230,180],v:'a',ro:.5}],.5]],
    c_spit:[[.42,[{t:0,d:.08,noise:1,v:'p',a:.8},{t:.06,d:.34,f:[260,180],v:['e','a'],ro:.45,h:.2}],.5]],
    c_blorgh:[[.6,[{t:0,d:.56,f:[150,120,170],v:['o','u','o'],ro:.7,am:[.4,18],h:.15}],.5]],
    c_hop:[[.3,[{t:0,d:.26,f:[240,320],v:['o','a'],ro:.4,h:.3}],.48]],
    die:[[2.1,[{t:0,d:2,f:[200,140,70],v:['a','o','u'],ro:.7,vib:[.05,3.5],rel:.6,br:.5}],.58]],
    win:[[1.3,[...ka(8,0,.15,1300),{t:1.15,d:.15,f:[260,200],v:'a',a:.4,ro:.4}],.52]]}};
  B3CUE.mimic={chomp:'c_chomp',tongue:'c_slurp',tongue3:'c_slurp',coins:'c_blorgh'};
  // under its big cries the coins and the wood
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='mimic')return _m.apply(this,arguments);
    if(k==='cry'||k==='angry'||k==='laugh'||k==='win'||k==='die')for(let i=0;i<(k==='die'?7:4);i++)mi2tin(t+.08+i*(k==='die'?.14:.07)+Math.random()*.03,.6);
    if(k==='cry'||k==='angry')fNoise(t+.05,1,'bandpass',VR(420,.1),3,.08,{brown:true})}}
  // the treasure waking before every move («tin-tin», in the boss's time)
  {const _g=b3go;b3go=function(e,st){_g.apply(this,arguments);try{const B=e.type==='mimic'&&!(e.intro>0)&&MI2.TIN[st];if(B&&!(st==='leap'&&e.leapN>0)&&AU.ctx&&AU.on.sfx&&AU.ctx.state==='running'){
    const k=B3D(e,st)/mi2sp(e),t=AU.ctx.currentTime+.01,v=Math.max(.55,enemyAt(e));B.forEach(c=>mi2tin(t+c*k,.9*v))}}catch(err){}}}
  // the voices get ready in the room of the twin chests (and at once when it is there)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{if(G&&(G.mode==='inf'?G.room%10===7:G.room===G.ccRoom)||G&&(G.enemies||[]).some(q=>q.type==='mimic'))B3VO.prep('mimic')}catch(err){}return r}}
  // its mocking gesture; its bait when it calls you (then the Lash, if you keep far)
  {const _t=b3taunt;b3taunt=function(e,k){if(e.type==='mimic'&&k==='laugh2'&&e.st==='walk'){const S=e.b3s||(e.b3s={});S.tauntT=G.t||0;S.pend=0;b3go(e,'lure');e.moving=false;b3say(e,'laugh2');return}return _t.apply(this,arguments)}}
  // the defeat with its voice is in BDIE.mimic.setup
}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into its room (the fourth of the first arena,
// cleared, with the twin chests or straight with the Mimic), which moves it has in each phase, which dangers it puts in the room, its voice
if(MI2ON){const R=window.BCL||(window.BCL={});R.mimic={n:'Il Mimic',arena:0,p2:true,
  enter(o){G.arena=0;G.chapter=ARENAS[0].ch;G.diff=ARENAS[0].diff;G.bossLvl=null;G.room=4;G.ccRoom=4;G.event=null;buildRoom();G.enemies=[];G.eproj=[];G.door=false;
    if(o&&o.casse){G.state='cleared';spawnTwinChests();return}
    const x=AW/2,y=TOP+(BOT-TOP)*.45,m=makeE('mimic',x,y+4,0);m.hp=m.max=Math.round(900*(1+(effRoom()-1)*.14));m.intro=BOSS_INTRO.mimic;G.enemies.push(m);G.state='play';G.door=false;
    bossBarReset();$('bossBar').hidden=false;$('bossBar').classList.remove('rage');$('bossName').textContent=ET.mimic.name;banner(ET.mimic.name,ET.mimic.title,2);bmIn('mimic')},
  // in the game of the chests the test's hero walks onto the real one (the daze)
  hero(e){const S=G.m2&&G.m2.shell;return S&&S.ph==='choose'&&S.t>.6?{x:e.x,y:e.y+4}:null},
  // (its second phase is short: the test keeps it alive until it has seen every move)
  keep:true,
  moves:['chomp','coins','tongue','leap','stuck','grab','gulp'],moves2:['rage','hide','chest','pop','daze','tongue3'],
  hz(){const B=G.m2||{};return{avvisi:(B.lanes||[]).length+(B.lines||[]).length+(B.fans||[]).length+(B.circles||[]).length,corsie:(B.lanes||[]).length,linee:(B.lines||[]).length,ventagli:(B.fans||[]).length,
    cerchi:(B.circles||[]).length,monete_in_volo:(B.coins||[]).filter(c=>c.k!=='plank').length,monete_a_terra:(B.floor||[]).length,pioggia:(B.rain||[]).length,
    casse_finte:B.shell?(B.shell.fk||[]).length:0,inghiottito:B.gulp?1:0}},
  voice:['cry','laugh','angry','die']}}
