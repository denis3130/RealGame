// ---------- GLI ZOMBIE SPECIALI nella partita a ondate (Denis, 6 novembre: «Zombie nuovi in partita»): il Gonfio, lo Sputatore e il
// Bruto, disegnati in sprite/mostri/zombie_nuovi.js (le quattro direzioni del 31 ottobre). Prendono il posto di qualche zombie del round:
// partita.js lo fa uscire da una buca e qui, appena nato e ancora sotto terra, diventa speciale; da un round in su e mai troppi insieme.
// - Lo Sputatore (dal round 4; al massimo 2, 3 dal 12): resta a distanza, tira indietro il collo e sputa una palla d'acido che cade dove
//   eri (il cerchio verde a terra lo dice prima); dove cade resta una pozza che brucia per qualche secondo; da vicino graffia piano.
// - Il Gonfio (dal round 6; al massimo 2): lento e pieno di gas; arrivato da te si gonfia e scoppia; se lo uccidi scoppia subito. Lo
//   scoppio fa male a chi gli sta vicino, anche agli altri zombie (e agli altri Gonfi, a catena), e lascia una nube verde che brucia.
// - Il Bruto (dal round 8; uno alla volta, due dal 15): grande e duro; da lontano si curva e la strada della carica si accende a terra,
//   poi carica dritto: se ti prende fa molto male e ti spinge via, se sbatte contro un muro resta stordito con le stelline; da vicino alza
//   il braccio e lo schianta a terra (l'anello di polvere e le crepe).
// Il primo di ogni tipo in una partita esce di sicuro, terzo zombie del suo primo round, e una scritta lo presenta. Più monete per ognuno.
// Agganci nel motore della mappa che senza questo file non fanno niente: ZM.zSpec nel giro degli zombie (il turno di uno speciale quando fa
// una mossa sua) e ZM.ZBOX (il riquadro dipinto di ogni tipo, per l'immagine pronta). Si attacca alla partita avvolgendo ZM.partita
// (update, reset, drawGround, drawTop del direttore), come le abilità (99). Tutti i numeri in ZSP, da regolare giocando. Rispetta LOWFX.
(()=>{if(typeof ZM==='undefined'||!ZM.partita||!window.CR||!CR.gonfio||!CR.sputatore||!CR.bruto)return;
const W=ZM.W,{S,rr,cl,TAU,move,physClear,inGround}=ZM,TP=Math.PI*2;
// ------------------------------------------------------------------ i numeri
// dal: il primo round; p: [round, probabilità] che uno zombie nuovo del round diventi questo; max: quanti insieme; sc, hp, spd: grandezza,
// vita (in punti di danno: la pistola fa 20; poi per la vita del round) e passo (per quello del round, fino a vmax); premio: le monete
const ZSP={
  sputatore:{dal:4,p:[[4,.1],[7,.14]],max:R=>R>=12?3:2,sc:1.15,hp:70,spd:34,vmax:1.6,premio:90,graffio:14,
    sputo:{min:80,max:230,ferma:160,carica:1.15,at:.46,volo:.8,cd:[3,4.2],danno:15,r:22,pozza:{r:24,t:4,danno:5,ogni:.5}}},
  gonfio:{dal:6,p:[[6,.08],[10,.12]],max:()=>2,sc:1.2,hp:140,spd:20,vmax:1.4,premio:80,
    gonfia:{vicino:40,dura:1.25,at:.66},scoppio:{r:64,danno:30,zombie:150,catena:.15,nube:{r:56,t:4.5,danno:4,ogni:.5}}},
  bruto:{dal:8,p:[[8,.06],[12,.09]],max:R=>R>=15?2:1,sc:1.5,hp:480,spd:26,vmax:1.35,premio:220,
    carica:{min:110,max:260,prep:.75,vel:250,dura:1.1,danno:34,spinta:70,cd:[5,7],stordito:1.5},
    schianto:{vicino:44,dura:1.3,at:.5,r:54,danno:38}}};
const KS=['bruto','gonfio','sputatore'],FROM=['zombie','strisciante','minatore'];
const NOMI={sputatore:'Lo Sputatore',gonfio:'Il Gonfio',bruto:'Il Bruto'},
  AVV={sputatore:'Uno Sputatore! Sputa acido: schiva il cerchio verde',gonfio:'Un Gonfio! Fallo scoppiare in mezzo agli altri',
    bruto:'Il Bruto! Quando si curva, spostati'};
// le scritte della mappa vanno a capo invece di uscire dallo schermo (su una riga sola erano troppo lunghe per un telefono)
{const st=document.createElement('style');st.textContent='#mz #mzToast{white-space:normal;width:max-content;max-width:calc(100% - 32px);text-align:center;line-height:1.15}';document.head.appendChild(st)}
// il riquadro dipinto di ogni tipo attorno ai piedi alla sua grandezza (misurato in tutte le mosse, 16 direzioni e tre inclinazioni, più
// 4 px: tests/a50/zbox.js), per l'immagine pronta del motore
const BOX={gonfio:[-56,-79,56,34,1.2],sputatore:[-50,-59,50,14,1.15],bruto:[-69,-96,69,42,1.5]};
if(ZM.ZBOX)for(const k in BOX)if(!ZM.ZBOX[k])ZM.ZBOX[k]=BOX[k];
// le voci: la gola di ognuno (audio_zombie.js prende la sua se c'è)
if(ZM.audio&&ZM.audio.KV){const KV=ZM.audio.KV,z0=KV.zombie;KV.gonfio=KV.gonfio||Object.assign({},z0,{f:[58,80],rasp:.4,br:.55,gurgle:1});
  KV.sputatore=KV.sputatore||Object.assign({},z0,{f:[128,168],rasp:.95,br:.7,gurgle:1});KV.bruto=KV.bruto||Object.assign({},z0,{f:[46,64],rasp:.75,br:.3})}
// ------------------------------------------------------------------ lo stato della partita
const SP={on:false,last:0,seen:{},nR:0,R:-1,spits:[],pools:[],clouds:[],blasts:[],rings:[],cracks:[],puffs:[],push:null,err:0};
const err=e=>{if(SP.err++<3)console.error(e)};
function reset(){Object.assign(SP,{last:0,seen:{},nR:0,R:-1,spits:[],pools:[],clouds:[],blasts:[],rings:[],cracks:[],puffs:[],push:null})}
const dir=()=>W.director;
// quanto fa male questo zombie rispetto al round (partita.js gli mette il danno del round in z.dmg)
const dmK=z=>z.dmK||1;
// il colpo all'eroe che resta nella pozza o nella nube: piano, senza il mezzo secondo in cui non lo tocca più nessuno (D.inv) e senza il
// suono del colpo; se lo finirebbe passa da D.hurtHero, che lo fa cadere (e l'anima lo rialza)
function burn(D,n){const h=W.hero,MD=W.mods||{};if(!D||h.dead||!D.on||D.st==='fine'||(W.dbg&&W.dbg.god)||MD.invis>0)return;if(MD.shield>0)n*=.5;
  if(D.hp-n<=0){D.inv=0;D.hurtHero(n);return}D.hp-=n;D.hurtT=0;D.red=Math.max(D.red||0,.3)}
const sameLv=(a,b)=>(a.lv||0)===(b.lv||0);
// ------------------------------------------------------------------ da zombie a speciale
function convert(z,k,D){const C=ZSP[k],K0=ZM.KINDS.find(q=>q[0]===z.kind)||ZM.KINDS[0],PZ=D&&D.PZ||{danno:{}};
  const hpK=(z.hp0||z.hp)/K0[3],spK=(z.spd0||z.spd)/K0[2],d0=PZ.danno[z.kind]||30;
  z.dmK=z.dmg?z.dmg/d0:1;z.kind=k;z.sc=C.sc;z.hp=z.hp0=C.hp*hpK;z.spd=z.spd0=C.spd*Math.min(spK,C.vmax);z.reward=C.premio;
  z.dmg=(C.graffio||20)*z.dmK;z.zs={st:'cammina',t:0,cd:rr(.6,1.6)};z.spr=null;delete z.au;
  if(!SP.seen[k]){SP.seen[k]=1;W.toast=[AVV[k],3.4]}return z}
// quale speciale diventa lo zombie nuovo numero n del round R (o nessuno)
function pick(R,n){for(const k of KS){const C=ZSP[k];if(R<C.dal)continue;let alive=0;for(const z of W.Z)if(z.kind===k&&!z.die)alive++;if(alive>=C.max(R))continue;
    if(!SP.seen[k]&&n>=3)return k;// il primo della partita, sicuro
    let p=0;for(const[r,v] of C.p)if(R>=r)p=v;if(Math.random()<p)return k}return null}
// ------------------------------------------------------------------ i loro turni (ZM.zSpec dal giro degli zombie del motore: true = fatto
// qui, false = cammina e graffia come gli altri). d, dx, dy: dallo zombie all'eroe
const STEP={
  sputatore(z,dt,d,dx,dy){const C=ZSP.sputatore.sputo,s=z.zs,h=W.hero;s.cd-=dt;
    if(s.st==='mira'){s.t+=dt;if(s.t<C.carica*.35)z.face=Math.atan2(dy,dx);if(z.anim!=='attack')z.anim='attack';const p0=z.p;z.p=Math.min(.999,s.t/C.carica);
      if(p0<C.at&&z.p>=C.at)spit(z);if(s.t>=C.carica){s.st='cammina';s.cd=rr(C.cd[0],C.cd[1]);z.anim='idle';z.p=0}return true}
    if(h.dead||d<34||!sameLv(z,h))return false;
    const see=()=>physClear(z.x,z.y,h.x,h.y,2,null,2);
    if(s.cd<=0&&d>C.min&&d<C.max&&see()){s.st='mira';s.t=0;z.anim='attack';z.p=0;z.face=Math.atan2(dy,dx);snd('rantolo',z);return true}
    // aspetta a distanza, dondolando e guardandoti, finché può sputare di nuovo
    if(s.cd>0&&d<C.ferma&&d>C.min*.6&&see()){z.face=Math.atan2(dy,dx);if(z.anim!=='idle'){z.anim='idle';z.p=0}z.p=(z.p+dt/1.6)%1;return true}
    return false},
  gonfio(z,dt,d,dx,dy){const G=ZSP.gonfio.gonfia,s=z.zs,h=W.hero;
    if(s.st==='gonfia'){s.t+=dt;if(z.anim!=='attack')z.anim='attack';z.p=Math.min(G.at-.001,s.t/G.dura*G.at);z.face=Math.atan2(dy,dx);
      if(d>14)move(z,dx/d*z.spd*.25*dt,dy/d*z.spd*.25*dt,11);if(s.t>=G.dura)burst(z,true);return true}
    if(!h.dead&&d<G.vicino&&sameLv(z,h)){s.st='gonfia';s.t=0;z.anim='attack';z.p=0;snd('gonfia',z);return true}
    return false},
  bruto(z,dt,d,dx,dy){const C=ZSP.bruto,A=C.carica,s=z.zs,h=W.hero,D=dir();s.cd-=dt;
    if(s.st==='prep'){s.t+=dt;if(s.t<A.prep*.7){z.face=Math.atan2(dy,dx);s.dir=z.face}z.anim='charge';z.p=(z.p+dt/.5)%1;
      if(!LOWFX&&Math.random()<dt*14)SP.puffs.push({x:z.x+rr(-10,10),y:z.y+rr(-6,6),t:0,T:rr(.4,.7),r:rr(4,7)});
      if(s.t>=A.prep){s.st='corsa';s.t=0;s.hit=false;s.blk=0;snd('carica',z)}return true}
    if(s.st==='corsa'){s.t+=dt;z.anim='charge';z.p=(z.p+dt/.32)%1;z.face=s.dir;const ux=Math.cos(s.dir),uy=Math.sin(s.dir),v=A.vel*dt,x0=z.x,y0=z.y;
      move(z,ux*v,uy*v,11);const mv=Math.hypot(z.x-x0,z.y-y0);
      if(!LOWFX&&Math.random()<dt*20)SP.puffs.push({x:z.x-ux*12+rr(-6,6),y:z.y-uy*12+rr(-6,6),t:0,T:rr(.4,.8),r:rr(5,8)});
      if(!s.hit&&!h.dead&&sameLv(z,h)&&Math.hypot(h.x-z.x,h.y-z.y)<34){s.hit=true;if(D)D.hurtHero(A.danno*dmK(z));SP.push={ux,uy,left:A.spinta,t:0};snd('botta',z);
        if(D)D.shake=Math.max(D.shake||0,.4);s.st='cammina';s.cd=rr(A.cd[0],A.cd[1]);z.anim='walk';z.p=0;return true}
      if(mv<v*.35){s.blk=(s.blk||0)+dt;if(s.blk>.05){s.st='stordito';s.t=0;s.cd=rr(A.cd[0],A.cd[1]);snd('muro',z);if(D)D.shake=Math.max(D.shake||0,.3);
          SP.rings.push({x:z.x+ux*14,y:z.y+uy*14,t:0,T:.5,r:30,c:'215,200,170'});return true}}else s.blk=0;
      if(s.t>=A.dura){s.st='cammina';s.cd=rr(A.cd[0],A.cd[1]);z.anim='walk';z.p=0}return true}
    if(s.st==='stordito'){s.t+=dt;if(z.anim!=='idle'){z.anim='idle';z.p=0}z.p=(z.p+dt/2.2)%1;if(s.t>=A.stordito){s.st='cammina';z.anim='walk';z.p=0}return true}
    if(s.st==='schianto'){const B=C.schianto;s.t+=dt;if(z.anim!=='attack')z.anim='attack';const p0=z.p;z.p=Math.min(.999,s.t/B.dura);if(z.p<B.at)z.face=Math.atan2(dy,dx);
      if(p0<B.at&&z.p>=B.at)slam(z);if(s.t>=B.dura){s.st='cammina';z.anim='walk';z.p=0}return true}
    if(h.dead||!sameLv(z,h))return false;
    if(d<C.schianto.vicino){s.st='schianto';s.t=0;z.anim='attack';z.p=0;z.face=Math.atan2(dy,dx);return true}
    if(s.cd<=0&&d>A.min&&d<A.max&&physClear(z.x,z.y,h.x,h.y,8,null,2)){s.st='prep';s.t=0;z.anim='charge';z.p=0;z.face=Math.atan2(dy,dx);s.dir=z.face;snd('ruggito',z);return true}
    return false}};
ZM.zSpec=(z,dt,d,dx,dy)=>{const f=STEP[z.kind];if(!f||!z.zs||!SP.on)return false;try{return f(z,dt,d,dx,dy)}catch(e){err(e);return false}};
// ------------------------------------------------------------------ le mosse che fanno male
// lo sputo: dalla bocca a dove sei (un poco avanti se corri), in volo C.volo secondi
function spit(z){const C=ZSP.sputatore.sputo,h=W.hero,lead=h.moving?26:0,tx=h.x+Math.cos(h.face||0)*lead,ty=h.y+Math.sin(h.face||0)*lead,
    fx=Math.cos(z.face),fy=Math.sin(z.face);
  SP.spits.push({x0:z.x+fx*8*z.sc,y0:z.y+fy*8*z.sc,z0:(z.zh||0)+34*z.sc,x1:tx,y1:ty,lv:z.lv||0,t:0,T:C.volo,k:dmK(z)});snd('sputo',z)}
function landSpit(s){const C=ZSP.sputatore.sputo,h=W.hero,D=dir();
  if(D&&!h.dead&&(h.lv||0)===s.lv&&Math.hypot(h.x-s.x1,h.y-s.y1)<C.r)D.hurtHero(C.danno*s.k);
  SP.pools.push({x:s.x1,y:s.y1,lv:s.lv,r:C.pozza.r,t:0,T:C.pozza.t,tick:C.pozza.ogni*.5,k:s.k,a:Math.random()*TP});snd('acido')}
// lo scoppio del Gonfio: self = è arrivato da te e si è gonfiato (niente monete: non l'hai ucciso tu)
function burst(z,self){const s=z.zs||(z.zs={});if(s.boom)return;s.boom=1;const B=ZSP.gonfio.scoppio,h=W.hero,D=dir(),lv=z.lv||0;
  if(!z.die){z.hp=0;z.die=1.09}else z.die=Math.max(z.die,1.09);// il corpo sparisce subito: al suo posto la nube
  SP.blasts.push({x:z.x,y:z.y,z:z.zh||0,lv,t:0});SP.clouds.push({x:z.x,y:z.y,lv,r:B.nube.r,t:0,T:B.nube.t,tick:B.nube.ogni*.6,k:dmK(z),s:Math.random()*9});
  SP.rings.push({x:z.x,y:z.y,t:0,T:.55,r:B.r,c:'150,230,90'});
  if(D&&!h.dead&&(h.lv||0)===lv&&Math.hypot(h.x-z.x,h.y-z.y)<B.r)D.hurtHero(B.danno*dmK(z));
  for(const o of W.Z){if(o===z||o.die||o.idle||o.rise<1||(o.lv||0)!==lv)continue;if(Math.hypot(o.x-z.x,o.y-z.y)<B.r+6){if(o.kind==='gonfio'&&o.zs)o.zs.chain=1;ZM.hurt(o,B.zombie*(o.boss||o.ai?.3:self?.6:1),false)}}
  if(D)D.shake=Math.max(D.shake||0,.35);snd('scoppio',z)}
// lo schianto del Bruto: il pugno davanti a lui
function slam(z){const B=ZSP.bruto.schianto,h=W.hero,D=dir(),px=z.x+Math.cos(z.face)*16*z.sc/1.5,py=z.y+Math.sin(z.face)*16*z.sc/1.5;
  SP.rings.push({x:px,y:py,t:0,T:.6,r:B.r,c:'215,200,170'});SP.cracks.push({x:px,y:py,lv:z.lv||0,t:0,T:3,a:Math.random()*TP,n:LOWFX?4:7});
  if(!LOWFX)for(let i=0;i<8;i++)SP.puffs.push({x:px+rr(-18,18),y:py+rr(-12,12),t:0,T:rr(.5,.9),r:rr(6,10)});
  if(D&&!h.dead&&sameLv(z,h)&&Math.hypot(h.x-px,h.y-py)<B.r)D.hurtHero(B.danno*dmK(z));if(D)D.shake=Math.max(D.shake||0,.45);snd('schianto',z)}
// ------------------------------------------------------------------ ogni fotogramma (dopo il direttore, prima che il motore muova gli zombie)
function update(D,dt){SP.on=!!D.on;if(D.R!==SP.R){SP.R=D.R;SP.nR=0}const h=W.hero;
  // gli zombie nuovi del round: appena nati (sotto terra) qualcuno diventa speciale; non quelli evocati dal Becchino (senza numero)
  for(const z of W.Z){if(z.id==null||z.id<=SP.last)continue;SP.last=Math.max(SP.last,z.id);
    if(!z.q||z.boss||z.ai||z.idle||z.zs||!FROM.includes(z.kind)||D.st!=='round')continue;SP.nR++;const k=pick(D.R,SP.nR);if(k)convert(z,k,D)}
  for(const z of W.Z){if(!z.zs)continue;
    // il Gonfio ucciso scoppia (un attimo dopo, così a catena si vedono uno dopo l'altro)
    if(z.kind==='gonfio'&&z.die&&!z.zs.boom){if(z.zs.at==null)z.zs.at=(W.t||0)+ZSP.gonfio.scoppio.catena*(z.zs.chain?1:0);if((W.t||0)>=z.zs.at)burst(z,false);continue}
    // stordito (la campana, la tagliola, l'anima): la mossa a metà si perde
    if(z.stun>0&&z.zs.st!=='cammina'&&z.zs.st!=='stordito'){z.zs.st='cammina';z.zs.cd=Math.max(z.zs.cd||0,1.5);z.zs.t=0}}
  // la spinta del Bruto: l'eroe vola indietro in un quinto di secondo
  if(SP.push){const P=SP.push,st=Math.min(P.left,P.left*Math.min(1,dt/.12)+60*dt);if(!h.dead)move(h,P.ux*st,P.uy*st,10);P.left-=st;if(P.left<=.5)SP.push=null}
  for(const s of SP.spits){s.t+=dt;if(s.t>=s.T&&!s.done){s.done=1;landSpit(s)}}SP.spits=SP.spits.filter(s=>!s.done);
  for(const p of SP.pools){p.t+=dt;p.tick-=dt;if(p.tick<=0&&p.t<p.T){p.tick=ZSP.sputatore.sputo.pozza.ogni;if((h.lv||0)===p.lv&&Math.hypot(h.x-p.x,h.y-p.y)<p.r)burn(D,ZSP.sputatore.sputo.pozza.danno*p.k)}}
  SP.pools=SP.pools.filter(p=>p.t<p.T+.6);
  for(const c of SP.clouds){c.t+=dt;c.tick-=dt;if(c.tick<=0&&c.t<c.T){c.tick=ZSP.gonfio.scoppio.nube.ogni;if((h.lv||0)===c.lv&&Math.hypot(h.x-c.x,h.y-c.y)<c.r)burn(D,ZSP.gonfio.scoppio.nube.danno*c.k)}}
  SP.clouds=SP.clouds.filter(c=>c.t<c.T+.8);
  for(const L of[SP.blasts,SP.rings,SP.cracks,SP.puffs])for(const f of L)f.t+=dt;
  SP.blasts=SP.blasts.filter(b=>b.t<.9);SP.rings=SP.rings.filter(r=>r.t<r.T);SP.cracks=SP.cracks.filter(c=>c.t<c.T);SP.puffs=SP.puffs.filter(p=>p.t<p.T);
  if(LOWFX&&SP.puffs.length>12)SP.puffs.splice(0,SP.puffs.length-12)}
// ------------------------------------------------------------------ i disegni a terra (nel mondo): cerchi d'avviso, pozze, macchie della nube,
// la strada della carica, anelli di polvere, crepe
function ground(){const h=W.hero,lv=h.lv||0,t=W.t||0;let any=SP.spits.length+SP.pools.length+SP.clouds.length+SP.rings.length+SP.cracks.length+SP.puffs.length;
  for(const z of W.Z)if(z.kind==='bruto'&&z.zs&&z.zs.st==='prep')any++;if(!any)return;
  inGround(()=>{
    for(const c of SP.cracks){if(c.lv!==lv)continue;const a=c.t<.15?c.t/.15:Math.max(0,1-(c.t-2.2)/.8);ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle='rgba(28,20,14,.8)';ctx.lineWidth=2;ctx.lineCap='round';
      for(let i=0;i<c.n;i++){const an=c.a+i/c.n*TP+Math.sin(i*7.3)*.3,L=16+((i*.618)%1)*20;ctx.beginPath();ctx.moveTo(c.x,c.y);let x=c.x,y=c.y;
        for(let k=1;k<=3;k++){const aa=an+Math.sin(i*3.1+k*1.7)*.35;x+=Math.cos(aa)*L/3;y+=Math.sin(aa)*L/3*.9;ctx.lineTo(x,y)}ctx.stroke()}ctx.restore()}
    for(const c of SP.clouds){if(c.lv!==lv)continue;const a=c.t<c.T?Math.min(1,c.t*4):Math.max(0,1-(c.t-c.T)/.8);ctx.fillStyle=`rgba(70,110,30,${(.32*a).toFixed(3)})`;
      ctx.beginPath();ctx.ellipse(c.x,c.y,c.r,c.r*.9,0,0,TP);ctx.fill();ctx.strokeStyle=`rgba(150,220,80,${(.35*a).toFixed(3)})`;ctx.lineWidth=1.6;ctx.setLineDash([6,7]);
      ctx.beginPath();ctx.ellipse(c.x,c.y,c.r,c.r*.9,0,0,TP);ctx.stroke();ctx.setLineDash([])}
    for(const p of SP.pools){if(p.lv!==lv)continue;const a=p.t<p.T?Math.min(1,p.t*6):Math.max(0,1-(p.t-p.T)/.6),r=p.r*(.7+.3*Math.min(1,p.t*5));ctx.save();ctx.globalAlpha*=a;ctx.translate(p.x,p.y);ctx.rotate(p.a);
      ctx.fillStyle='rgba(20,40,8,.55)';ctx.beginPath();ctx.ellipse(1.5,2,r*1.06,r*.82,0,0,TP);ctx.fill();
      ctx.fillStyle='#7fbf2a';ctx.beginPath();for(let i=0;i<=10;i++){const an=i/10*TP,rr2=r*(.86+.14*Math.sin(i*2.7+p.a*3));const x=Math.cos(an)*rr2,y=Math.sin(an)*rr2*.78;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();
      ctx.fillStyle='#b8f04a';ctx.beginPath();ctx.ellipse(-r*.18,-r*.14,r*.5,r*.3,0,0,TP);ctx.fill();
      ctx.fillStyle='rgba(240,255,190,.75)';for(let i=0;i<3;i++){const u=((t*.9+i*.37)%1),x=Math.cos(i*2.1)*r*.45,y=Math.sin(i*2.1)*r*.3;ctx.beginPath();ctx.arc(x,y,1+u*2.4,0,TP);ctx.fill()}
      if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('150,240,60',0,0,r*1.2,.28*(.8+.2*Math.sin(t*5)));}ctx.restore()}
    for(const s of SP.spits){if(s.lv!==lv)continue;const k=s.t/s.T,C=ZSP.sputatore.sputo;ctx.save();ctx.strokeStyle=`rgba(170,240,70,${(.55+.35*Math.sin(t*16)).toFixed(3)})`;ctx.lineWidth=2.2;
      ctx.beginPath();ctx.ellipse(s.x1,s.y1,C.r,C.r*.9,0,0,TP);ctx.stroke();ctx.fillStyle=`rgba(150,230,60,${(.22*k).toFixed(3)})`;ctx.beginPath();ctx.ellipse(s.x1,s.y1,C.r*k,C.r*.9*k,0,0,TP);ctx.fill();ctx.restore()}
    // la strada della carica: si accende mentre si curva, fino al primo muro
    for(const z of W.Z){if(z.kind!=='bruto'||!z.zs||z.zs.st!=='prep'||(z.lv||0)!==lv)continue;const A=ZSP.bruto.carica,s=z.zs,ux=Math.cos(s.dir),uy=Math.sin(s.dir);let L=A.vel*A.dura;
      for(let q=16;q<L;q+=8)if(ZM.hit(z.x+ux*q,z.y+uy*q,10)){L=q;break}const k=Math.min(1,s.t/A.prep),ln=L*(.25+.75*k),w=22;ctx.save();ctx.translate(z.x,z.y);ctx.rotate(s.dir);
      ctx.fillStyle=`rgba(200,40,30,${(.16+.14*k).toFixed(3)})`;ctx.fillRect(14,-w/2,ln-14,w);ctx.strokeStyle=`rgba(255,90,60,${(.4+.4*k*(.6+.4*Math.sin(t*14))).toFixed(3)})`;ctx.lineWidth=2;
      ctx.strokeRect(14,-w/2,ln-14,w);ctx.fillStyle=`rgba(255,120,80,${(.35+.4*k).toFixed(3)})`;for(let q=34;q<ln-6;q+=26){ctx.beginPath();ctx.moveTo(q,-6);ctx.lineTo(q+8,0);ctx.lineTo(q,6);ctx.lineTo(q+3,0);ctx.closePath();ctx.fill()}ctx.restore()}
    for(const r of SP.rings){const k=r.t/r.T;ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle=`rgba(${r.c},.95)`;ctx.lineWidth=4*(1-k)+1;ctx.beginPath();ctx.arc(r.x,r.y,r.r*(.35+.75*k),0,TP);ctx.stroke();ctx.restore()}
    for(const p of SP.puffs){const k=p.t/p.T;ctx.fillStyle=`rgba(170,150,120,${(.35*(1-k)).toFixed(3)})`;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1+k),p.r*(1+k)*.7,0,0,TP);ctx.fill()}})}
// ------------------------------------------------------------------ i disegni sopra (sullo schermo): lo sputo in volo, la nube, lo scoppio,
// le stelline del Bruto stordito
function top(){const h=W.hero,lv=h.lv||0,t=W.t||0;
  for(const s of SP.spits){if(s.lv!==lv)continue;const k=Math.min(1,s.t/s.T),x=s.x0+(s.x1-s.x0)*k,y=s.y0+(s.y1-s.y0)*k,z=s.z0*(1-k)+Math.sin(k*Math.PI)*48,q=S(x,y,z);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('150,240,60',q[0],q[1],12,.7);ctx.restore()}
    for(let i=1;i<=3;i++){const k2=Math.max(0,k-i*.05),x2=s.x0+(s.x1-s.x0)*k2,y2=s.y0+(s.y1-s.y0)*k2,z2=s.z0*(1-k2)+Math.sin(k2*Math.PI)*48,q2=S(x2,y2,z2);ctx.fillStyle=`rgba(150,220,60,${(.5-i*.13).toFixed(2)})`;ctx.beginPath();ctx.arc(q2[0],q2[1],3.2-i*.7,0,TP);ctx.fill()}
    ctx.fillStyle=INK;ctx.beginPath();ctx.arc(q[0],q[1],5,0,TP);ctx.fill();ctx.fillStyle='#8fd62e';ctx.beginPath();ctx.arc(q[0],q[1],3.8,0,TP);ctx.fill();ctx.fillStyle='#e6ffb0';ctx.beginPath();ctx.arc(q[0]-1.2,q[1]-1.3,1.4,0,TP);ctx.fill()}
  for(const c of SP.clouds){if(c.lv!==lv)continue;const a=c.t<c.T?Math.min(1,c.t*3):Math.max(0,1-(c.t-c.T)/.8),n=LOWFX?4:9;
    for(let i=0;i<n;i++){const an=i/n*TP+c.s,rr2=c.r*(.25+.6*((i*.61)%1)),x=c.x+Math.cos(an+t*.25)*rr2,y=c.y+Math.sin(an+t*.25)*rr2*.85,hz=10+((t*.18+i*.13)%1)*26,q=S(x,y,hz),rad=11+5*Math.sin(t*1.3+i);
      ctx.fillStyle=`rgba(${i%2?'120,170,50':'150,200,70'},${(.2*a).toFixed(3)})`;ctx.beginPath();ctx.arc(q[0],q[1],rad,0,TP);ctx.fill()}}
  for(const b of SP.blasts){if(b.lv!==lv)continue;const k=b.t/.9,q=S(b.x,b.y,b.z+20);
    if(!LOWFX&&k<.5){ctx.save();ctx.globalCompositeOperation='lighter';glow('170,255,90',q[0],q[1],70*(1-k),.9*(1-k*2));ctx.restore()}
    const n=LOWFX?6:12;for(let i=0;i<n;i++){const an=i/n*TP+i*.4,sp=60+((i*.37)%1)*70,x=q[0]+Math.cos(an)*sp*k,y=q[1]+Math.sin(an)*sp*k*.6-80*k+160*k*k;
      ctx.fillStyle=i%3?'#3d5a1c':'#6b1f14';ctx.globalAlpha=Math.max(0,1-k);ctx.beginPath();ctx.arc(x,y,2.6-k*1.5,0,TP);ctx.fill()}ctx.globalAlpha=1;
    if(k<.35){ctx.fillStyle=`rgba(190,250,120,${(.55*(1-k/.35)).toFixed(3)})`;ctx.beginPath();ctx.arc(q[0],q[1],18+k*90,0,TP);ctx.fill()}}
  for(const z of W.Z){if(z.kind!=='bruto'||!z.zs||z.zs.st!=='stordito'||z.die||(z.lv||0)!==lv)continue;const q=S(z.x,z.y,(z.zh||0)+86);
    for(let i=0;i<3;i++){const an=t*4+i*TP/3,x=q[0]+Math.cos(an)*14,y=q[1]+Math.sin(an)*5;ctx.fillStyle='#ffe066';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();
      for(let j=0;j<10;j++){const r2=j%2?2:5,a2=j/10*TP-Math.PI/2;ctx.lineTo(x+Math.cos(a2)*r2,y+Math.sin(a2)*r2)}ctx.closePath();ctx.fill();ctx.stroke()}}}
// ------------------------------------------------------------------ i suoni (col suono degli effetti acceso), da dove sono rispetto all'eroe
function snd(w,z){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01,h=W.hero;
  AU.pan=z?cl((z.x-h.x)/240,-.8,.8):0;const far=z?cl(1-Math.hypot(z.x-h.x,z.y-h.y)/700,.35,1):1;
  if(w==='rantolo'){fNoise(t,.55,'bandpass',420,2.2,.3*far,{att:.1});fThump(t+.05,150,95,.3,.22*far,.2)}
  else if(w==='sputo'){fNoise(t,.16,'bandpass',1500,1.4,.42*far);whoosh(t+.02,.4,900,380,.2*far,.2)}
  else if(w==='acido'){fNoise(t,.7,'highpass',2600,.8,.2,{att:.01});fThump(t,95,50,.25,.28,.2)}
  else if(w==='gonfia'){fNoise(t,1.15,'lowpass',240,1.2,.36*far,{brown:true,att:.65});fThump(t+.15,64,112,1.05,.26*far,.4)}
  else if(w==='scoppio'){fThump(t,72,28,.9,1*far,.5);fNoise(t,.95,'lowpass',720,.8,.62*far,{brown:true});fNoise(t+.02,.35,'bandpass',1900,1,.3*far)}
  else if(w==='ruggito'){fNoise(t,.95,'bandpass',250,3,.46*far,{brown:true,att:.16});fThump(t,60,38,.85,.5*far,.4)}
  else if(w==='carica'){for(let i=0;i<4;i++)fThump(t+i*.15,84,40,.2,.42*far,.15)}
  else if(w==='botta'){fThump(t,112,40,.35,1,.3);fNoise(t,.2,'bandpass',900,1.2,.36)}
  else if(w==='muro'){fThump(t,70,30,.6,.95*far,.45);M.stone(t+.02,.9*far)}
  else if(w==='schianto'){fThump(t,60,26,.9,1*far,.5);fNoise(t,.72,'lowpass',520,.7,.55*far,{brown:true});M.stone(t+.03,1*far)}
  AU.pan=0}catch(e){}}
// ------------------------------------------------------------------ attaccato alla partita
function install(D){if(D.__zsp)return;D.__zsp=1;
  const _u=D.update;D.update=function(dt){_u.apply(this,arguments);try{update(D,dt)}catch(e){err(e)}};
  const _r=D.reset;if(_r)D.reset=function(){_r.apply(this,arguments);reset()};
  const _g=D.drawGround;D.drawGround=function(){_g.apply(this,arguments);try{ground()}catch(e){err(e)}};
  const _t=D.drawTop;D.drawTop=function(){_t.apply(this,arguments);try{top()}catch(e){err(e)}}}
{const _p=ZM.partita;ZM.partita=function(){const D=_p.apply(this,arguments);install(D);return D};if(W.director)install(W.director)}
// per le prove: uno speciale vicino all'eroe (a d px, nella direzione a), lo stato
// il nome è ZM.zSpeciali: ZM.speciali è delle armi speciali (armi_speciali.js) e lo usa il fuoco del Draghetto (compagni.js)
ZM.zSpeciali={ZSP,SP,convert,burst,spawn(k,d,a){const D=dir(),h=W.hero;d=d||150;a=a==null?rr(0,TP):a;const x=h.x+Math.cos(a)*d,y=h.y+Math.sin(a)*d;
    const z=ZM.spawn({hole:[x,y,null,null],kind:'zombie',q:1});if(!z)return null;z.rise=1;SP.last=Math.max(SP.last,z.id);if(D&&D.PZ)z.dmg=D.PZ.danno.zombie;return convert(z,k,D)}};
})();
