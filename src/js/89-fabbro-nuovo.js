// =====================================================================
// IL FABBRO INFERNALE RIFATTO: «il Gigante della Forgia» (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano
// timore nello sfidarli», «migliora anche le loro abilità speciali»; 16 ottobre, dopo il Golem: «sì, fai gli altri 12»). NEL GIOCO dal 20
// ottobre (Denis: «Tutto nel gioco»): questo file e il modello sprite/nemici3d/smith2.js sono in src/ordine.txt e il modello prende il
// posto di 'smith' (prima stavano solo nella copia del gioco di anteprime/mk_boss2.py). Design e numeri:
// docs/boss-classici-design/smith.md.
// Un gigante di bronzo con la fornace nel petto: prima di ogni colpo il metallo che colpirà si arroventa (bianco vuol dire adesso), ogni
// mossa carica la pressione (le feritoie accese, e.press) e con tre file accese sfiata e la fornace resta aperta: è lì che si colpisce.
// Ogni stato ha il nome di una mossa del modello; il colpo vero parte nel suo fotogramma (b3at, 81-boss3-base.js). Mosse:
// - Martellata rovente (slam, poi stuck): un cerchio rosso davanti a lui che si scalda col maglio e tre linee (cinque nella fase 2); il
//   maglio cala, e lungo le linee corrono le crepe di lava (nella fase 2 restano lava). Si schiva di lato, non indietro.
// - Incudini dal cielo (anvil): tre DONG (quattro nella fase 2, l'ultimo doppio ai tuoi lati), ogni DONG un'incudine dal soffitto col suo
//   cerchio; a terra restano 9 s come ripari.
// - Lancio del maglio (swing, hold, yank): un cerchio ti segue e si ferma, il maglio arriva sulla catena; poi la striscia della catena si
//   accende e il maglio torna strisciando (nella fase 2 la catena rovente lascia il fuoco). Prima esci dal cerchio, poi dalla linea.
// - Sfiatata delle costole (vent, doppia nella fase 2): otto corsie a stella, getti di vapore e fuoco; poi la fornace resta aperta (open):
//   i colpi fanno +50% («Colpo alla fornace!»).
// - Turbine del maglio (spinup, spin, dizzy, solo fase 2): un disco rosso intorno a lui, gira su se stesso avanzando verso di te, poi
//   barcolla con la fornace spalancata (+50%).
// - Si arroventa (rage, a metà vita): il cappuccio brucia, la criniera di fuoco, tutto il bronzo rovente; poi tutto 1,15 volte più svelto.
// Entrata (enter): è già lì, di spalle, al lavoro sull'incudine; l'hai disturbato. L'incudine da lavoro resta nella stanza come riparo.
// Sconfitta (die): in ginocchio sul maglio, la fornace si spegne in un grande sospiro di vapore. È il boss dell'arena 6: mai due attacchi
// insieme, ogni danno ha un avviso di almeno 0,6 s veri (anche nella fase 2, con la velocità dell'arena), dopo ogni mossa la camminata.
// Gli avvisi tondi sul pavimento sono ellissi 1 : 0,6 e colpiscono esattamente dove si vedono.
// =====================================================================
const F2ON=typeof N3!=='undefined'&&!!N3.smith2;
// (the line of the victory, 06-ui.js: the way it falls now)
if(F2ON)VINTO.fabbro='La fornace del Fabbro Infernale si è spenta. Il vulcano tace.';
const F2={seq1:['slam','anvil','throw','vent'],seq2:['spin','slam','anvil','throw','vent2'],red:'229,72,77',hot:'255,170,60',K:.6};
if(F2ON){
  // the new model in place of the old one (its drawing of today stays as N3.meta.smith.old for the pages)
  const old=N3.smith,oldM=N3.meta.smith;N3.smith=N3.smith2;N3.meta.smith=Object.assign({},N3.meta.smith2,{old:(x,y,f,a,p)=>old(x,y,f,oldM.an.includes(a)?a:'idle',p,oldM.sc||1,{})});
  ET.smith.r=34;ET.smith.cdmg=20;BOSS_INTRO.smith=3.2;Object.assign(BDEATH,{smith:{dur:4,clou:2.0,snd:'block'}});
  // the bar, the halo, the bar that breaks into shards of bronze; the 2D mane, smoke, embers and glow of the old smith go (the model draws
  // all of it), and the pink ring of spheres of the arenas 5-8 (B3S: body, voice and mocking like the new bosses)
  B2H.smith=100;if(typeof B2!=='undefined'&&B2.smith){B2.smith.back=()=>{};B2.smith.front=()=>{}}
  BBFX.smith={c:'#9a5e28',f:'#ffd27a',k:'fall',s:'block'};B3S.add('smith');
  // the furnace lights the room round its feet, more with the door open
  ELIGHT.smith=(e,Lt)=>{if(e.hidden||e.intro>0&&(e.iT||0)<2.2)return;const op=e.st==='open'||e.st==='dizzy'?1:0;Lt(e.x+Math.cos(e.f3||e.face||0)*20,e.y-10,(e.p2?110:90)*(1+.35*op),(e.p2?.5:.38)+.25*op)};
  // what the game passes to the model: the pressure (the vents lit); the walk follows its own clock
  N3G.opt.smith=e=>({press:e.press||0});
  N3G.wp.smith=e=>{const d=B3D(e,'walk');return(((e.wt||0)%d)+d)%d/d};
  // (its line in the guide is in 44-guida.js, BEST2, with the others)
}
// ---- helpers
// the model's own drawings of the pieces of its attacks (design: Anvil(x,y,z,rot,sc,o), Maul(x,y,z,rot,sc,o), Chain(ax,ay,az,bx,by,bz,sc,o),
// Hand(face,anim,p,o), Crack(x,y,a,len,k,sc,o), Jet(x,y,a,len,k,sc,o)); the game's simple drawings if the model has none
const f2art=n=>N3['smith'+n]||N3['smith2'+n]||null;
const f2pt=(e,bx,by,bz,face)=>{const f=face!=null?face:e.f3!=null?e.f3:(e.face||0),q=C3.V(f).P([bx,by,bz||0]);return{x:e.x+q[0],y:e.y+8+q[1]}};
// model time per real second (the second phase 1.15 times faster, times the speed of the arena)
const f2sp=e=>(e.p2?1.15:1)*((G.bossLvl||bossLvl()||{}).spd||1);
// a point of its hand or of its maul now (from the model), as a game point on the screen
function f2hand(e,anim,p){const H=f2art('Hand');if(!H)return{h:{x:e.x+8,y:e.y-40},m:{x:e.x+14,y:e.y-22}};const r=H(e.f3!=null?e.f3:e.face||0,anim,p,{p2:!!e.p2});
  return{h:{x:e.x+r.h[0],y:e.y+8+r.h[1]},m:r.m?{x:e.x+r.m[0],y:e.y+8+r.m[1]}:null}}
const f2D=(x,y,X,Y)=>Math.hypot(X-x,(Y-y)/F2.K);   // distances on the floor as they look (a circle on the floor is an ellipse 1 : .6)
// between two blows a few steps toward you; already close, only a beat (he turns to you and breathes) before the next one
function f2walk(e){e.wt=0;const near=Math.hypot(P.x-e.x,P.y-e.y)<120;b3go(e,'walk',near?(e.p2?rand(.32,.45):rand(.42,.6)):(e.p2?rand(.55,.85):rand(.75,1.05)))}
// how far from (x,y) along a before a wall or an obstacle (soft: the temporary ones do not stop it)
function f2reach(x,y,a,max,soft){const ca=Math.cos(a),sa=Math.sin(a);let s=0;for(;s<(max||900);s+=5){const px=x+ca*s,py=y+sa*s;if(px<L+4||px>R-4||py<TOP+4||py>BOT-4)break;
    if(G.rocks.some(k=>(!soft||!k.temp||k.f2work)&&Math.hypot(k.x-px,k.y-py)<k.r))break}return s}
// the distance of (px,py) from the segment from (x,y) along a for len
function f2seg(x,y,a,len,px,py){const ca=Math.cos(a),sa=Math.sin(a),u=clamp((px-x)*ca+(py-y)*sa,0,len),qx=x+ca*u,qy=y+sa*u;return Math.hypot(px-qx,py-qy)}
const f2can=()=>P.inv<=0&&P.dashT<=0;
function f2reset(){if(G)G.f2={warn:[],slam:null,cracks:[],falls:[],maul:null,lanes:null,jets:[],disc:null,fog:[],runes:[],tgt:null,strip:null,trail:[]}}
{const _br=buildRoom;buildRoom=function(){f2reset();return _br.apply(this,arguments)}}
const f2B=()=>G.f2||(f2reset(),G.f2);
// a temporary anvil on the floor (9 s, a shelter): at most six, the oldest crumbles; the work anvil of the entrance stays and never counts
function f2anvil(x,y,p2){const T=G.rocks.filter(k=>k.temp&&k.f2&&!k.f2work);if(T.length>=6){const o=T.sort((a,b)=>a.life-b.life)[0];o.brk=.001;o.life=Math.min(o.life,.5)}
  G.rocks.push({x,y,r:16,seed:Math.random()*10,temp:true,life:9,kind:'anvil',f2:1,p2:!!p2,born:G.t||0,rot:rand(-.6,.6)});fields={}}
function f2smash(k){if(!k||k.f2work)return;k.life=Math.min(k.life,.35);k.brk=k.brk||.001;dustRing(k.x,k.y,8);sfx('block',0,k.x);fields={}}
// a free spot for an anvil: away from the other anvils (46), the walls and the obstacles (20)
function f2spot(x,y,taken){const ok=(tx,ty)=>tx>=L+24&&tx<=R-24&&ty>=TOP+30&&ty<=BOT-24&&taken.every(q=>Math.hypot(q.x-tx,q.y-ty)>=46)&&!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+20);
  if(ok(x,y))return{x,y};for(let i=0;i<24;i++){const a=rand(0,TAU),d=rand(20,70),tx=clamp(x+Math.cos(a)*d,L+24,R-24),ty=clamp(y+Math.sin(a)*d,TOP+30,BOT-24);if(ok(tx,ty))return{x:tx,y:ty}}return null}
// the pressure: +1 at the end of the Martellata, of the Incudini and of the Lancio; with three rows lit the next move is the Sfiatata
const f2press=e=>{e.press=Math.min(3,(e.press||0)+1)};
// ---- the brain
const f2rage=e=>{e.p2=true;e.shell=9;banner('Il Fabbro si arroventa!','Fase 2',1.6);bossRage(e,'255,120,40');$('bossBar').classList.add('rage');shake(8);sfx('boom',0,e.x);G.eproj=[];
  const B=f2B();B.lanes=null;B.disc=null;B.tgt=null;b3go(e,'rage');e.moving=false;b3say(e,'angry');if(BOSS2){ENV2.torches(['#ffffff','#ff8a22','#ff3c10'],'255,140,60',3);ENV2.fall(10)}};
function f2next(e,a){const seq=e.p2?F2.seq2:F2.seq1;let nx;if((e.press||0)>=3)nx=e.p2?'vent2':'vent';else{nx=seq[(e.si=(e.si==null?-1:e.si)+1)%seq.length];if(nx==='vent'||nx==='vent2'){if((e.press||0)<3){e.si++;nx=seq[e.si%seq.length]}}}
  e.lf=a;const B=f2B();
  if(nx==='throw'){b3go(e,'swing');B.tgt=null}
  else if(nx==='spin'){b3go(e,'spinup');B.disc={r:74,on:false,t:0}}
  else b3go(e,nx)}
if(F2ON)smithUpd=function(e,dt,a,d){const sp=e.p2?1.15:1;dt*=sp;const B=f2B(),p2=!!e.p2,real=f2sp(e);
  if(!e.p2&&e.hp<e.max*.5&&e.st==='walk'){f2rage(e);return}
  b3tick(e,dt);const k=b3k(e);
  switch(e.st){
  // too close (after the Turbine, or when you walk into him): he turns and walks off to his working distance, never parks on you
  case 'walk':{const far=d>80,near=d<64;e.face=far?navAngle(e):near?a+Math.PI:a;e.moving=far||near;const w0=e.wt||0;e.wt=w0+dt;const D=B3D(e,'walk'),ph0=(w0%D)/D,ph1=(e.wt%D)/D;
    if(ph1<ph0||(ph0<.5&&ph1>=.5)){stepFx(e.x,e.y+4,true);G.shake=Math.max(G.shake,1.5);f2puff(e)}
    if(far||near)moveCircle(e,Math.cos(e.face)*34*dt,Math.sin(e.face)*34*dt);
    if(e.stT<=0){e.moving=false;f2next(e,a)}break}
  // ---- MARTELLATA ROVENTE: the circle in front of him (.05) that heats with the maul, the lines (.12); the blow (.62); the cracks run
  case 'slam':{e.moving=false;if(k<.03){e.face=a;e.lf=a}else e.face=e.lf;
    if(b3at(e,.05)){const c=f2pt(e,50,0,0,e.lf);B.slam={x:c.x,y:c.y,r:56,lines:null,p2,t0:G.t||0};sfx('ignite',0,e.x)}
    if(b3at(e,.12)&&B.slam){const s=B.slam,ang=e.lf,os=p2?[0,-.489,.489,-.977,.977]:[0,-.489,.489];s.lines=os.map(o=>{const an=ang+o;return{a:an,len:Math.min(320,f2reach(s.x,s.y,an,320,false))}})}
    if(B.slam)B.slam.heat=C3.keys([[0,0],[.1,0],[.22,.35],[.32,.7],[.42,1],[1,1]],k);
    if(b3at(e,.62)&&B.slam){const s=B.slam,x=s.x,y=s.y;if(f2D(P.x,P.y,x,y)<56+P.r*.4&&f2can())hurtP(Math.round(32*DMG()));
      for(const l of s.lines||[])B.cracks.push({x,y,a:l.a,len:l.len,s:0,hit:false,p2,t:0,next:40});
      B.runes.push({x,y,t:0});stamp('crater',x,y,36);vfxBlast(x,y,'255,170,70',110,{debris:'lava',n:22,sparks:30,cracks:60,fire:8});dustRing(x,y,16);
      if(BOSS2){ENV2.mark('cracks',x,y,60);ENV2.mark('scorch',x,y,30);ENV2.rocks(x,y,170,3);ENV2.fall(B3N(8));ENV2.chunks(x,y,B3N(16),['#3a3a42','#ff7a2e','#5f5f68'],150);ENV2.torches(['#ffffff','#ffd86b','#ff8a22'],'255,220,160',1.2)}
      shake(9);sfx('boom',0,x);vib([50,30,70]);B.slam=null}
    if(e.stT<=0){B.slam=null;b3go(e,'stuck')}break}
  case 'stuck':{e.moving=false;if(e.stT<=0){f2press(e);f2walk(e)}break}
  // ---- INCUDINI DAL CIELO: every DONG a circle on the floor; the anvil falls 1 s (real) later
  case 'anvil':{e.moving=false;e.face=a;const DG=p2?[.22,.38,.54,.70]:[.28,.50,.72];
    DG.forEach((c,i)=>{if(!b3at(e,c))return;sfx('block',0,e.x);shake(1.5);
      // the anvils of the room ring and jump a little at every DONG; some dust from the ceiling
      if(BOSS2){for(const r of G.rocks)if(r.f2&&Math.hypot(r.x-e.x,r.y-e.y)<220)r.hit=Math.max(r.hit||0,.2);ENV2.fall(2)}
      const taken=B.falls.map(f=>({x:f.x,y:f.y})).concat(G.rocks.filter(r=>r.f2).map(r=>({x:r.x,y:r.y})));let T=[];
      if(p2&&i===3){const ang=Math.atan2(P.y-e.y,P.x-e.x)+Math.PI/2;for(const s of[-1,1]){const q=f2spot(clamp(P.x+Math.cos(ang)*70*s,L+24,R-24),clamp(P.y+Math.sin(ang)*70*s*.85,TOP+30,BOT-24),taken.concat(T));if(q)T.push(q)}}
      else if(i===0){const q=f2spot(clamp(P.x,L+24,R-24),clamp(P.y,TOP+30,BOT-24),taken);if(q)T.push(q)}
      else{const vx=(P.vxs||0),vy=(P.vys||0),vl=Math.hypot(vx,vy),ahead=Math.min(60,vl*.5),tx=P.x+(vl>1?vx/vl*ahead:0),ty=P.y+(vl>1?vy/vl*ahead:0),q=f2spot(clamp(tx,L+24,R-24),clamp(ty,TOP+30,BOT-24),taken);if(q)T.push(q)}
      for(const q of T){B.falls.push({x:q.x,y:q.y,t:0,dur:1,p2,rot:rand(-.6,.6)});B.warn.push({k:'land',x:q.x,y:q.y,r:26,t:1,max:1})}});
    if(e.stT<=0){f2press(e);f2walk(e)}break}
  // ---- LANCIO DEL MAGLIO: the circle on you (.10) follows you until .45, flashes (.48, .54); the throw (.60); then the taut chain, the yank
  case 'swing':{e.moving=false;e.face=e.lf;if(k<.1)e.lf=a;
    if(b3at(e,.10)){const h=f2hand(e,'swing',.1).h,an=Math.atan2(P.y-h.y,P.x-h.x),dd=Math.hypot(P.x-h.x,P.y-h.y),r=clamp(dd,100,320),lim=f2reach(h.x,h.y,an,r,true);
      B.tgt={x:h.x+Math.cos(an)*Math.min(r,lim),y:h.y+Math.sin(an)*Math.min(r,lim),r:40,lock:false,fl:0}}
    if(B.tgt&&k<.45){const t=B.tgt,dx=P.x-t.x,dy=P.y-t.y,dd=Math.hypot(dx,dy),st=Math.min(dd,110*dt/real);if(dd>1){t.x+=dx/dd*st;t.y+=dy/dd*st}
      const h=f2hand(e,'swing',Math.min(.6,k)).h,an=Math.atan2(t.y-h.y,t.x-h.x),dh=Math.hypot(t.x-h.x,t.y-h.y),lim=f2reach(h.x,h.y,an,320,true);if(dh>Math.min(320,lim)){t.x=h.x+Math.cos(an)*Math.min(320,lim);t.y=h.y+Math.sin(an)*Math.min(320,lim)}
      t.x=clamp(t.x,L+20,R-20);t.y=clamp(t.y,TOP+24,BOT-20)}
    if(B.tgt&&b3at(e,.45)){B.tgt.lock=true;sfx('click',0,e.x)}if(b3at(e,.48)||b3at(e,.54)){if(B.tgt)B.tgt.fl=.12;sfx('click',0,e.x)}
    if(b3at(e,.60)&&B.tgt){const m=f2hand(e,'swing',.6).m||{x:e.x,y:e.y-40};B.maul={st:'fly',x0:m.x,y0:m.y,tx:B.tgt.x,ty:B.tgt.y,t:0,dur:.5,p2,spin:0};sfx('dash',0,e.x)}
    if(e.stT<=0){if(B.maul){b3go(e,'hold',.65*real)}else{B.tgt=null;f2walk(e)}}break}
  case 'hold':{e.moving=false;e.face=e.lf;if(B.maul&&B.maul.st==='planted'){const h=f2hand(e,'hold',.5).h;B.strip={x0:B.maul.x,y0:B.maul.y,x1:h.x,y1:h.y+20,fl:0}}
    if(e.stT<=0){if(B.maul&&B.maul.st==='fly'){e.stT=.05;break}b3go(e,'yank');if(B.maul){const h=f2hand(e,'yank',.4).m||{x:e.x,y:e.y};B.maul.st='back';B.maul.bx=B.maul.x;B.maul.by=B.maul.y;B.maul.ex=h.x;B.maul.ey=h.y;B.maul.hit=false}}break}
  case 'yank':{e.moving=false;e.face=e.lf;const M=B.maul;
    if(M&&M.st==='back'){const u=Math.min(1,k/.4),x=M.bx+(M.ex-M.bx)*u,y=M.by+(M.ey-M.by)*u;
      // the trail of fire of the red-hot chain (second phase), a scratch along the floor
      if(p2&&Math.hypot(x-(M.lx==null?M.bx:M.lx),y-(M.ly==null?M.by:M.ly))>=22){addZone(x,y,11,1.2,'fire');M.lx=x;M.ly=y}
      if(!M.sc||Math.hypot(x-M.sc.x,y-M.sc.y)>40){stamp('cracks',x,y,10);M.sc={x,y}}
      for(const r of G.rocks)if(r.f2&&!r.f2work&&r.temp&&Math.hypot(r.x-x,r.y-y)<r.r+13)f2smash(r);
      if(!M.hit&&Math.hypot(P.x-x,P.y-y)<13+P.r*.4&&f2can()){M.hit=true;hurtP(Math.round(17*DMG()))}
      M.x=x;M.y=y;if(u>=1){B.maul=null;B.strip=null;B.tgt=null}}
    if(e.stT<=0){B.maul=null;B.strip=null;B.tgt=null;f2press(e);f2walk(e)}break}
  // ---- SFIATATA: the eight lanes (.06; in the double one A at .04 and B at .40, turned 22.5°); the jets
  case 'vent':case 'vent2':{e.moving=false;e.face=e.lf;const two=e.st==='vent2';
    const mk=off=>{const base=Math.atan2(P.y-e.y,P.x-e.x)+off,L0=[];for(let i=0;i<8;i++){const an=base+i*Math.PI/4;L0.push({a:an,len:Math.min(260,f2reach(e.x,e.y,an,260,false))})}return L0};
    if(b3at(e,two?.04:.06)){B.lanes={L:mk(0),hit:false,on:false,t:0};B.warn.push({k:'lanes',ref:'A',t:(two?.36:.49)*B3D(e,e.st)/real,max:(two?.36:.49)*B3D(e,e.st)/real});sfx('hiss',0,e.x)}
    const jets=(a0,a1,key)=>{if(k>=a0&&k<a1&&B.lanes){if(!B.lanes['on'+key]){B.lanes['on'+key]=1;shake(5);sfx('hiss',0,e.x);sfx('boom',0,e.x);B.jets.push({L:B.lanes.L,t:0,dur:(a1-a0)*B3D(e,e.st)/real,p2});
        if(BOSS2){ENV2.torches(['#ffe6c0','#ffd27a','#ff8a22'],'255,230,190',.8);for(const l of B.lanes.L)for(let s=40;s<=Math.min(90,l.len);s+=25)stamp('scorch',e.x+Math.cos(l.a)*s,e.y+Math.sin(l.a)*s,6)}}
      if(!B.lanes['hit'+key]&&f2can())for(const l of B.lanes.L)if(f2seg(e.x,e.y,l.a,l.len,P.x,P.y)<11+P.r*.4&&Math.hypot(P.x-e.x,P.y-e.y)>18){B.lanes['hit'+key]=1;hurtP(Math.round(23*DMG()));break}}};
    if(two){jets(.40,.55,'A');if(b3at(e,.40)){const off=Math.PI/8;B.lanesB={L:mk(off)};B.warn.push({k:'lanes',ref:'B',t:.36*B3D(e,e.st)/real,max:.36*B3D(e,e.st)/real})}
      if(k>=.55&&B.lanesB&&B.lanes&&!B.lanes.swapped){B.lanes={L:B.lanesB.L,hit:false,swapped:1};B.lanesB=null}jets(.76,.90,'B')}
    else jets(.55,.80,'A');
    if(e.stT<=0){if(!LOWFX)B.fog.push({x:e.x,y:e.y,t:0,dur:2});B.lanes=null;B.lanesB=null;b3go(e,'open')}break}
  case 'open':{e.moving=false;e.face=a;if(e.stT<=0){e.press=0;f2walk(e)}break}
  // ---- TURBINE (second phase): the red disc round him (spinup), three turns forward (spin), then it staggers (dizzy)
  case 'spinup':{e.moving=false;e.face=a;if(B.disc){B.disc.x=e.x;B.disc.y=e.y}if(e.stT<=0){if(B.disc)B.disc.on=true;b3go(e,'spin',3*B3D(e,'spin'));e.turn=-1;sfx('dash',0,e.x)}break}
  case 'spin':{e.moving=false;e.face=a;const turn=Math.floor((e.mt||0)/B3D(e,'spin'));if(turn!==e.turn){e.turn=turn;e.sHit=false;sfx('dash',0,e.x)}
    // forward until the disc covers you (it hurts at 74 on the floor), never on top of you (contact at 42)
    const v=(f2D(P.x,P.y,e.x,e.y)>66&&d>47?75:0)*dt/real,an=Math.atan2(P.y-e.y,P.x-e.x),nx=e.x+Math.cos(an)*v,ny=e.y+Math.sin(an)*v;
    for(const r of G.rocks)if(r.f2&&r.temp&&!r.f2work&&Math.hypot(r.x-nx,r.y-ny)<r.r+74*.7)f2smash(r);
    moveCircle(e,Math.cos(an)*v,Math.sin(an)*v);if(B.disc){B.disc.x=e.x;B.disc.y=e.y}
    if(!e.sHit&&f2D(P.x,P.y,e.x,e.y)<74+P.r*.4&&f2can()){e.sHit=true;hurtP(Math.round(26*DMG()))}
    if(!LOWFX&&Math.random()<.5)fxPush({k:'puff',x:e.x+rand(-40,40),y:e.y+rand(-10,14),vx:rand(-20,20),vy:-14,t:.4,r:rand(4,8)});
    if(Math.random()<.25)stamp('cracks',e.x+Math.cos(G.t*9)*62,e.y+Math.sin(G.t*9)*37,8);
    if(e.stT<=0){B.disc=null;b3go(e,'dizzy');sfx('block',0,e.x);shake(3)}break}
  // staggering, he totters back a little (away from you)
  case 'dizzy':{e.moving=false;e.face=a;if(k<.6&&d<96)moveCircle(e,-Math.cos(a)*30*dt/real,-Math.sin(a)*30*dt/real);if(e.stT<=0)f2walk(e);break}
  // ---- SI ARROVENTA (second phase): no damage, no blows; the clang (.30), the roar (.78)
  case 'rage':{e.moving=false;e.face=a;
    if(b3at(e,.30)){fxPush({k:'flash',x:e.x,y:e.y-120,r:90,rgb:'255,240,200',t:.25,max:.25});sfx('block',0,e.x);shake(5);vfxBlast(e.x,e.y-110,'255,200,120',60,{sparks:24,ring2:false})}
    if(b3at(e,.78)){shake(8);sfx('roar');vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,170,90',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
    if(e.stT<=0){e.shell=0;e.press=0;e.si=0;b3go(e,'spinup');B.disc={r:74,on:false}}break}
  default:f2walk(e)}};
// the furnace open, staggering: the blows hurt more (and the first time in the run, the words)
{const _h=hurtE;hurtE=function(e,d){if(F2ON&&e&&e.type==='smith'&&(e.st==='open'||e.st==='dizzy')){const A=[...arguments];A[1]=d*1.5;if(!G.f2txt){G.f2txt=1;text(e.x,e.y-130,'Colpo alla fornace!','#ffd84a',18)}return _h.apply(this,A)}return _h.apply(this,arguments)}}
// the «ciuff» of a chimney at each step (the heart of its walk)
function f2puff(e){try{if(!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const t=AU.ctx.currentTime+.01,v=Math.max(.4,enemyAt(e));fNoise(t,.16,'bandpass',VR(700,.15),1.4,.12*v);fThump(t,70,44,.1,.12*v);AU.pan=0}catch(err){}}
// ---- the dangers in flight and on the floor
function f2update(dt){const B=G.f2;if(!B)return;if(G.state!=='play'){if(B.falls.length||B.maul||B.cracks.length)f2reset();return}
  for(let i=B.warn.length-1;i>=0;i--){B.warn[i].t-=dt;if(B.warn[i].t<=0)B.warn.splice(i,1)}
  for(const r of B.runes)r.t+=dt;B.runes=B.runes.filter(r=>r.t<4);for(const f of B.fog)f.t+=dt;B.fog=B.fog.filter(f=>f.t<f.dur);
  if(B.tgt&&B.tgt.fl>0)B.tgt.fl-=dt;
  // the cracks of lava: the front runs at 520 px/s; it hurts once per crack when it passes you; in the second phase they stay lava 1.2 s
  for(let i=B.cracks.length-1;i>=0;i--){const c=B.cracks[i];c.t+=dt;const s0=c.s;c.s=Math.min(c.len,c.s+520*dt);
    if(!c.hit&&f2can()){const ca=Math.cos(c.a),sa=Math.sin(c.a);for(let s=s0;s<=c.s;s+=6){const x=c.x+ca*s,y=c.y+sa*s;if(Math.hypot(P.x-x,P.y-y)<11+P.r*.4){c.hit=true;hurtP(Math.round(17*DMG()));break}}}
    while(c.next<=c.s){const x=c.x+Math.cos(c.a)*c.next,y=c.y+Math.sin(c.a)*c.next;stamp('cracks',x,y,12);c.next+=40}
    if(c.p2&&!c.zoned&&c.s>=c.len){c.zoned=1;for(let s=12;s<c.len;s+=24)addZone(c.x+Math.cos(c.a)*s,c.y+Math.sin(c.a)*s,12,1.2,'fire')}
    if(c.t>(c.p2?2.6:1.6))B.cracks.splice(i,1)}
  // the anvils from the ceiling: 1 s after the DONG they land (in the last .4 s you see them come down)
  for(let i=B.falls.length-1;i>=0;i--){const f=B.falls[i];f.t+=dt;if(f.t<f.dur)continue;B.falls.splice(i,1);const hit=Math.hypot(P.x-f.x,(P.y-f.y)/F2.K)<26+P.r*.4;
    if(hit&&f2can())hurtP(Math.round(26*DMG()));stamp('crater',f.x,f.y,18);dustRing(f.x,f.y,10);vfxBlast(f.x,f.y,'230,200,160',46,{debris:'stone',n:8,sparks:10,dust:8});shake(3);sfx('block',0,f.x);
    if(BOSS2)ENV2.rocks(f.x,f.y,80,2);if(!hit)f2anvil(f.x,f.y,f.p2)}
  // the maul: in flight (an arc 70 high, two turns, .5 s), planted, coming back (the brain moves it in 'yank')
  const M=B.maul;if(M&&M.st==='fly'){M.t+=dt;const u=Math.min(1,M.t/M.dur);M.x=M.x0+(M.tx-M.x0)*u;M.y=M.y0+(M.ty-M.y0)*u;M.z=70*Math.sin(Math.PI*u);M.spin=u*TAU*2;
    if(u>=1){M.st='planted';M.z=0;M.x=M.tx;M.y=M.ty;if(f2D(P.x,P.y,M.x,M.y)<40+P.r*.4&&f2can())hurtP(Math.round(29*DMG()));
      stamp('crater',M.x,M.y,22);vfxBlast(M.x,M.y,'255,170,70',60,{debris:'lava',n:10,sparks:16,dust:8});shake(5);sfx('boom',0,M.x);
      for(const r of G.rocks)if(r.f2&&Math.hypot(r.x-M.x,r.y-M.y)<70)r.hit=Math.max(r.hit||0,.25);B.tgt=null}}
  for(const j of B.jets)j.t+=dt;B.jets=B.jets.filter(j=>j.t<j.dur);
  // the anvils on the floor cool down (orange to iron in 3 s); the crumbling ones break
  for(const r of G.rocks)if(r.f2&&r.brk>0)r.brk=Math.min(1,r.brk+dt*2.2)}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(F2ON&&G&&G.f2&&started&&!paused)f2update(dt)}catch(err){console.error(err)}}}
// the anvils on the floor (the work anvil of the entrance too) with the model's own drawing
if(F2ON){const _dr=drawRock;drawRock=function(k){const A=k.f2&&f2art('Anvil');if(!A)return _dr.apply(this,arguments);
  ctx.save();ctx.globalAlpha*=Math.min(1,k.life/.6);try{const age=(G.t||0)-(k.born||0);A(k.x,k.y,0,k.rot||0,1,{hot:k.f2work?0:Math.max(0,1-age/3),p2:k.p2,brk:k.brk||0,work:!!k.f2work})}
  catch(err){ctx.restore();return _dr.apply(this,arguments)}ctx.restore()}}
// ---- on the floor: the warnings (the circle of the Martellata that heats with the maul and its lines, the circles of the anvils with their
// shadow, the circle of the throw with the dashed chain, the strip of the return, the eight lanes, the disc of the Turbine), the cracks
function f2ground(){const B=G.f2;if(!B)return;const e=G.enemies&&G.enemies.find(q=>q.type==='smith'&&!q.dead),pu=.55+.3*Math.sin((G.t||0)*18),red=F2.red;
  const Crack=f2art('Crack');
  for(const r of B.runes){const k=1-r.t/4;ctx.save();ctx.globalAlpha*=k;if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,170,70,${.8*k})`;ctx.lineWidth=2.2;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(r.x-14,r.y);ctx.lineTo(r.x+14,r.y);for(const s of[-1,1]){ctx.moveTo(r.x+s*9,r.y-4);ctx.lineTo(r.x+s*14,r.y);ctx.lineTo(r.x+s*9,r.y+4)}ctx.stroke();ctx.restore()}
  for(const c of B.cracks){if(Crack){try{Crack(c.x,c.y,c.a,c.s,Math.min(.999,.2*Math.min(1,c.s/c.len)+.8*Math.max(0,(c.t-c.len/520)/(c.p2?2.2:1.2))),1,{p2:c.p2});continue}catch(err){}}
    ctx.strokeStyle='rgba(255,150,60,.9)';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x+Math.cos(c.a)*c.s,c.y+Math.sin(c.a)*c.s);ctx.stroke()}
  if(B.slam){const s=B.slam,h=s.heat||0,col=h<.5?red:h<.85?'255,140,50':'255,240,210';ctx.fillStyle=`rgba(${col},${.12+.25*h})`;ell(s.x,s.y,s.r,s.r*F2.K);ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.5;ell(s.x,s.y,s.r,s.r*F2.K);ctx.stroke();
    for(const l of s.lines||[]){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(l.a);ctx.fillStyle=`rgba(${red},${.12+.12*h})`;ctx.fillRect(0,-11,l.len,22);ctx.strokeStyle=`rgba(${red},.7)`;ctx.lineWidth=1.6;ctx.setLineDash([7,6]);ctx.strokeRect(0,-11,l.len,22);ctx.setLineDash([]);ctx.restore()}}
  for(const w of B.warn){const k=1-w.t/w.max;
    if(w.k==='land'){ctx.fillStyle=`rgba(${red},${.1+.22*k})`;ell(w.x,w.y,w.r*k,w.r*k*F2.K);ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.4;ell(w.x,w.y,w.r,w.r*F2.K);ctx.stroke();
      ctx.fillStyle=`rgba(0,0,0,${.15+.3*k})`;ell(w.x,w.y,w.r*(.3+.7*k)*.85,w.r*(.3+.7*k)*.45);ctx.fill()}
    else if(w.k==='lanes'){const Ls=w.ref==='B'?(B.lanesB||B.lanes):B.lanes;if(!Ls||!e)continue;for(const l of Ls.L){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(l.a);ctx.fillStyle=`rgba(${red},${.1+.22*k})`;ctx.fillRect(18,-11,l.len-18,22);
      ctx.strokeStyle=`rgba(${red},.75)`;ctx.lineWidth=1.6;ctx.strokeRect(18,-11,l.len-18,22);ctx.fillStyle=`rgba(255,255,255,${.4+.4*k})`;ctx.beginPath();ctx.moveTo(l.len-4,0);ctx.lineTo(l.len-16,-7);ctx.lineTo(l.len-16,7);ctx.closePath();ctx.fill();ctx.restore()}}}
  if(B.tgt&&e){const t=B.tgt,fl=t.fl>0?(Math.sin((G.t||0)*60)>0?.4:.15):0;ctx.fillStyle=`rgba(${red},${.1+(t.lock?.2:.08)+fl})`;ell(t.x,t.y,t.r,t.r*F2.K);ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.4;ell(t.x,t.y,t.r,t.r*F2.K);ctx.stroke();
    ctx.strokeStyle=`rgba(${red},.65)`;ctx.lineWidth=1.6;ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.setLineDash([])}
  if(B.strip&&e&&e.st==='hold'){const s=B.strip,a=Math.atan2(s.y1-s.y0,s.x1-s.x0),l=Math.hypot(s.x1-s.x0,s.y1-s.y0),fl=Math.sin((G.t||0)*30)>0?.34:.16;ctx.save();ctx.translate(s.x0,s.y0);ctx.rotate(a);ctx.fillStyle=`rgba(${red},${fl})`;ctx.fillRect(0,-13,l,26);ctx.strokeStyle=`rgba(${red},.8)`;ctx.lineWidth=2;ctx.strokeRect(0,-13,l,26);ctx.restore()}
  if(B.disc&&e){const r=B.disc.r,on=B.disc.on;ctx.fillStyle=`rgba(${red},${on?.16:.1+.12*Math.max(0,Math.sin((G.t||0)*12))})`;ell(e.x,e.y,r,r*F2.K);ctx.fill();ctx.strokeStyle=`rgba(${red},${pu})`;ctx.lineWidth=2.2;ctx.setLineDash([8,6]);ell(e.x,e.y,r,r*F2.K);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='rgba(20,10,6,.4)';ctx.lineWidth=3;ell(e.x,e.y,62,62*F2.K);ctx.stroke()}
  for(const f of B.fog){const k=1-f.t/f.dur;for(let i=0;i<6;i++){const a=i/6*TAU+f.t*.3,q=[f.x+Math.cos(a)*(50+f.t*20),f.y+Math.sin(a)*(30+f.t*12)];ctx.fillStyle=`rgba(236,240,244,${.16*k})`;ell(q[0],q[1],34,16);ctx.fill()}}}
// in the air: the anvils falling, the maul in flight, planted and coming back with its chain, the jets
function f2air(){const B=G.f2;if(!B)return;const e=G.enemies&&G.enemies.find(q=>q.type==='smith'&&!q.dead);const An=f2art('Anvil'),Mu=f2art('Maul'),Ch=f2art('Chain'),Jet=f2art('Jet');
  for(const f of B.falls){const left=f.dur-f.t;if(left>.4)continue;const z=300*(left/.4)*(left/.4);if(An){try{An(f.x,f.y,z,f.rot,1,{hot:.3,p2:f.p2,shadow:true});continue}catch(err){}}ctx.fillStyle='#5b6673';ctx.fillRect(f.x-14,f.y-z-16,28,16)}
  const M=B.maul;if(M&&e){const hand=f2hand(e,e.st==='swing'?'swing':e.st==='yank'?'yank':'hold',Math.min(.999,b3k(e))).h,hot=M.p2?1:.55;
    if(Ch){try{const pz=M.st==='fly'?M.z+8:4;Ch(hand.x,hand.y,0,M.x,M.y-pz,0,1,{sag:M.st==='fly'?.2:M.st==='planted'?0:.1,hot:M.p2?1:.3})}catch(err){}}
    if(Mu){try{if(M.st==='fly')Mu(M.x,M.y,M.z,M.spin,1,{hot,p2:M.p2});else if(M.st==='planted')Mu(M.x,M.y,0,0,1,{planted:1,hot,p2:M.p2});else Mu(M.x,M.y,0,0,1,{drag:1,a:Math.atan2(hand.y-M.y,hand.x-M.x),hot,p2:M.p2})}catch(err){}}}
  if(Jet&&e)for(const j of B.jets){const k=Math.min(.999,j.t/j.dur);for(const l of j.L){try{Jet(e.x,e.y,l.a,l.len,k,1,{p2:j.p2})}catch(err){}}}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{if(F2ON)f2ground()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{if(F2ON)f2air()}catch(err){}}}
// ---- the entrance (3.2 s, the model's 'enter'): it is already there, turned away, at work on the anvil; you disturbed it
if(F2ON){const _bi=bossIntro;bossIntro=function(e,dt,a){if(e.type!=='smith')return _bi.apply(this,arguments);
  const T=BOSS_INTRO.smith;if(e.iT==null){e.iT=0}const t0=e.iT;e.iT+=dt;const t=e.iT,at=s=>t0<s&&t>=s;e.intro=Math.max(0,T-t);e.face=a;e.st='enter';e.z=0;
  for(const s of[.19,.61,1.02])if(at(s)){sfx('block',0,e.x);shake(1.5);const q=f2pt(e,-36,0,30);vfxBlast(q.x,q.y,'255,210,120',30,{sparks:14,ring2:false});if(BOSS2)ENV2.torches(['#ffffff','#ffd86b','#ff8a22'],'255,220,160',.3)}
  if(at(1.54)){sfx('click',0,e.x);setTimeout(()=>sfx('click',0,e.x),90)}
  if(at(2.24)||at(2.34))f2puff(e);if(at(2.43))sfx('ignite',0,e.x);
  if(at(2.5)){if(!b3say(e,'cry'))sfx('roar');shake(6);vib([60,40,120]);for(let i=0;i<3;i++)setTimeout(()=>{if(G&&G.fx)fxPush({k:'ring2',x:e.x,y:e.y-e.r,rgb:'255,220,160',r0:e.r,r1:e.r*5,t:.45,max:.45,w:6-i*1.5})},i*170)}
  // the work anvil becomes an obstacle where the model drew it (it stays the whole fight: the first shelter)
  if(at(3.1)&&!G.rocks.some(k=>k.f2work)){const q=f2pt(e,-36,0,0);const x=clamp(q.x,L+24,R-24),y=clamp(q.y-8,TOP+30,BOT-24);if(Math.hypot(P.x-x,P.y-y)>30){G.rocks.push({x,y,r:16,seed:1,temp:true,life:1e9,kind:'anvil',f2:1,f2work:1,born:G.t||0,rot:(e.face||0)});fields={}}}
  if(e.intro<=0){e.z=0;e.si=-1;e.press=0;b3go(e,'walk',.9)}}}
// what the model plays: the entrance over its whole length; every move on the brain's clock (the second phase is 1.15 times faster); the
// taut chain and the Turbine go round in a cycle
if(F2ON){const CYC={hold:1,spin:1};const _nm=n3Move;n3Move=function(e){if(e.type==='smith'){if(e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/BOSS_INTRO.smith))];
    if(e.st&&e.st!=='walk'&&N3.meta.smith.an.includes(e.st))return[e.st,CYC[e.st]?((e.mt||0)/B3D(e,e.st))%1:Math.min(.999,Math.max(0,b3k(e)))]}return _nm.apply(this,arguments)}}
// ---- the defeat (4 s, the model's 'die'): the forge goes out
if(F2ON){const _sb=snapBoss;snapBoss=function(e){if(e.type==='smith')return{live:1};return _sb.apply(this,arguments)}
  BDIE.smith={setup(c){const e=c.e;f2reset();c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.press=e.press||0;c.live=1;sfx('block',0,c.x)},
    tick(c,dt,D){const p=Math.min(1,c.t/c.dur);if(p>.5&&p<.95&&Math.random()<(LOWFX?.2:.5))cpart(c,{k:'dust',x:c.x+rand(-30,30),y:c.y-rand(40,90),vz:rand(20,40),life:rand(.8,1.2),r:rand(5,9)});
      if(p>.5&&!c.clou){c.clou=1;shake(6);sfx('hiss',0,c.x);fxPush({k:'flash',x:c.x,y:c.y-60,r:80,rgb:'255,250,235',t:.3,max:.3})}},
    draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta.smith;try{N3.smith(c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,press:c.press,noFx:LOWFX})}catch(err){}}};
  const _dc=drawCorpse;drawCorpse=function(c){if(c.type!=='smith')return _dc.apply(this,arguments);try{BDIE.smith.draw(c,BDEATH.smith)}catch(err){}drawParts(c)}}
// ---- the voice and the personality, like the four new bosses (88-boss3-voci.js): deep and metallic, a bell with the breath of the bellows
// under it. The roar that booms in the hood and ends in a whistle of steam; «HO-HO-HO» when it hits you and mocks you (the model's
// 'taunt': it blows on the maul like on a smoking gun); a «Hm!» under every DONG; a growl and the «vvv» of the chain; the in-breath with the
// whistle of the boiler before the blast; a long cry in the Turbine; a moan that fades into a hiss of steam when it falls
if(F2ON){
  const ha=(n,t0,step,d,fa,fb,v,o)=>[...Array(n)].map((_,i)=>{const f=fa+(fb-fa)*i/Math.max(1,n-1);return{t:t0+i*step,d,f:[f*1.04,f*.94],v,a:1-i*.08,h:.25,...(o||{})}});
  B3VO.VB.smith={base:{br:.45,ro:.65,ji:.12,lp:.42},k:{
    cry:[[2,[{t:0,d:.3,noise:1,v:'h',a:.55},{t:.26,d:1.4,f:[52,95,62],v:['u','o','a','o'],h:.06,ro:.8,vib:[.03,4],rel:.4},{t:1.6,d:.36,noise:1,v:'s',a:.45}],.66]],
    angry:[[2.1,[{t:0,d:.5,f:[50,58],v:'o',a:.85,ro:.9,ji:.25},{t:.48,d:1.3,f:[66,112,60],v:['o','a','o'],ro:.85,h:.06,vib:[.035,5],rel:.4},{t:1.72,d:.3,noise:1,v:'s',a:.4}],.66]],
    laugh:[[1.05,[...ha(3,0,.25,.18,88,72,'o',{ro:.6}),{t:.75,d:.3,f:[70,56],v:['o','u'],a:.7,ro:.7,rel:.5}],.52]],
    laugh2:[[.9,[...ha(2,0,.32,.2,80,70,'o',{ro:.55}),{t:.66,d:.14,noise:1,v:'s',a:.35}],.5]],
    hurt:[[.3,[{t:0,d:.28,f:[100,64],v:['u','o'],ro:.6,h:.12}],.5],[.28,[{t:0,d:.06,noise:1,v:'h',a:.7},{t:.05,d:.22,f:[92,66],v:'o',ro:.65,h:.2}],.5]],
    c_slam:[[.62,[{t:0,d:.36,f:[62,74],v:'m',ro:.6,h:.2},{t:.34,d:.26,f:[110,80],v:['a','o'],ro:.45,h:.25}],.5]],
    c_anvil:[[.22,[{t:0,d:.2,f:[84,70],v:'m',ro:.5,h:.25}],.46]],
    c_throw:[[.6,[{t:0,d:.32,f:[66,72],v:'o',ro:.75,am:[.5,16]},{t:.3,d:.28,f:[90,70],v:'a',ro:.5}],.48]],
    c_vent:[[.9,[{t:0,d:.5,noise:1,v:'h',a:.6},{t:.4,d:.48,f:[60,64],v:'u',ro:.7,h:.1}],.5]],
    c_spin:[[1.1,[{t:0,d:1.05,f:[70,104,88],v:['o','a','o'],ro:.55,vib:[.04,6],h:.06,rel:.25}],.52]],
    die:[[2.3,[{t:0,d:1.8,f:[90,70,38],v:['o','u'],ro:.55,vib:[.05,3.5],rel:.6,br:.5},{t:1.7,d:.6,noise:1,v:'s',a:.45}],.58]],
    win:[[1.4,[...ha(3,0,.36,.24,82,68,'o',{ro:.6}),{t:1.06,d:.3,f:[64,50],v:'u',a:.6,ro:.6,rel:.5}],.56]]}};
  B3CUE.smith={slam:'c_slam',anvil:'c_anvil',swing:'c_throw',vent:'c_vent',vent2:'c_vent',spinup:'c_spin'};
  // under its big cries the boiler hisses
  {const _m=b3sayMore;b3sayMore=function(e,k,t){if(e.type!=='smith')return _m.apply(this,arguments);
    if(k==='cry'||k==='angry'||k==='die')fNoise(t+.1,k==='die'?2:1.4,'highpass',VR(2400,.15),.8,.05)}}
  // the voices get ready in the rooms of its arena (and at once in its room)
  {const _br=buildRoom;buildRoom=function(){const r=_br.apply(this,arguments);try{const A=G&&G.mode!=='inf'&&!G.daily&&ARENAS[G.arena||0];
    if(A&&BOSSZ[A.boss]==='smith'||G&&(G.enemies||[]).some(q=>q.type==='smith'))B3VO.prep('smith')}catch(err){}return r}}
  // its mocking gesture in its brain (a pause in its walk, never between two blows)
  {const _su=smithUpd;smithUpd=function(e,dt,a,d){if(e.st!=='taunt')return _su.apply(this,arguments);b3tick(e,dt*(e.p2?1.15:1));e.moving=false;e.face=a;if(e.stT<=0)b3go(e,'walk',rand(.6,1))}}
  {const _s=BDIE.smith.setup;BDIE.smith.setup=function(c){_s.apply(this,arguments);b3say(c,'die')}}}
// ---- for the previews (anteprime/mk_boss2.py) and the tests (tests/boss2gioco.js): how to get into its room, its moves, its dangers
if(F2ON){const R=window.BCL||(window.BCL={});R.smith={n:'Il Fabbro Infernale',arena:5,p2:true,
  enter(){G.arena=5;G.chapter=ARENAS[5].ch;G.diff=ARENAS[5].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()},
  moves:['slam','stuck','anvil','swing','hold','yank','vent','open'],moves2:['rage','spinup','spin','dizzy','vent2'],
  hz(){const B=G.f2||{};return{cerchi:(B.warn||[]).length+(B.slam?1:0)+(B.tgt?1:0),incudini_in_volo:(B.falls||[]).length,incudini_a_terra:G.rocks.filter(k=>k.f2&&!k.f2work).length,
    crepe:(B.cracks||[]).length,corsie:B.lanes?8:0,maglio:B.maul?1:0,disco:B.disc?1:0,zone_di_fuoco:G.zones.filter(z=>z.kind==='fire').length}},
  voice:['cry','laugh','angry','die']}}
