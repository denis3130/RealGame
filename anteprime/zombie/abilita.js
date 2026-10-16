// ---------- LE ABILITÀ della modalità zombie (Denis, 12 ottobre: «si potranno scegliere e sbloccare delle abilità, per esempio lo scatto, con al
// massimo 3 abilità equipaggiate insieme»; 16 ottobre: «Abilità zombie»). Sei abilità, al massimo tre in partita: lo Scatto (di tutti, da subito),
// la Granata, la Tagliola, il Pupazzo, la Cura e l'Adrenalina; si sbloccano, si migliorano (livelli 1-5) e si scelgono nell'Arsenale
// (src/js/99-abilita-zombie.js, che prima della partita mette in W.abil le tre scelte col loro livello). In partita tre bottoni rotondi in basso a
// destra (tasti 1, 2, 3), ognuno col suo disegno; dopo l'uso un'ombra che gira copre il bottone e scende con la ricarica, coi secondi che
// mancano; pronto, il bottone brilla. All'inizio della partita sono tutte pronte. Tutti i numeri stanno in ZAB (ricarica, forza) e in pw/cdOf
// (i livelli: +12% di forza e −6% di ricarica a livello, lo Scatto −8%): da regolare giocando. La forza dei colpi cresce col round come la vita
// degli zombie (hpMul di partita.js), così una granata resta una granata anche al round 20; i boss ne prendono la metà e non ci cascano.
// Gli agganci del motore (motore.js): W.heroHook (lo scatto porta l'eroe), MD.gunK (l'arma più veloce), W.goal (il pupazzo che attira gli
// zombie: il campo delle distanze punta a lui e chi gli arriva vicino lo graffia), W.things e W.drawThing (il pupazzo in piedi nell'ordine
// degli esseri), h.dashP (la mossa «dash» dell'eroe 3D). LOWFX: meno schegge e niente bagliori.
(()=>{const{W,S,SB,CAM,rr,cl,lerp,ez,TAU,inGround,move,hit,physClear,hurt,ball,seg}=ZM;
const ZAB={
  scatto:{n:'Scatto',cd:5,cdL:.08,dist:120,col:['#5aa0f0','#173d78'],rgb:'150,205,255',d:'Uno scatto veloce dove stai andando (da fermo, via dallo zombie più vicino): passi in mezzo agli zombie e per un attimo non ti toccano.'},
  granata:{n:'Granata',cd:20,cdL:.06,dmg:150,r:74,col:['#f08a3a','#6e2a06'],rgb:'255,170,80',d:'Una granata di polvere nera sullo zombie più vicino: scoppia e fa male a tutti quelli intorno.'},
  tagliola:{n:'Tagliola',cd:12,cdL:.06,dmg:110,hold:3.2,max:3,life:45,col:['#a8b4c0','#343c45'],rgb:'225,235,245',d:'Una tagliola di ferro ai tuoi piedi: il primo zombie che ci passa resta preso e si fa male (ne tieni fino a 3).'},
  pupazzo:{n:'Pupazzo',cd:32,cdL:.06,dur:7,dmg:130,r:70,col:['#e6b24a','#5e3c0c'],rgb:'255,205,110',d:'Un pupazzo di paglia col campanello: gli zombie vanno tutti da lui, poi prende fuoco e brucia chi ha intorno.'},
  cura:{n:'Cura',cd:28,cdL:.06,heal:.5,col:['#56cc6e','#124f22'],rgb:'130,255,160',d:'Bende ed erbe del camposanto: ti ridanno metà della salute in un attimo.'},
  adrenalina:{n:'Adrenalina',cd:36,cdL:.06,dur:8,spd:1.3,gun:1.4,col:['#ec4a52','#5e0a12'],rgb:'255,110,100',d:'Il cuore batte forte: per qualche secondo corri più veloce e l\'arma spara e ricarica più in fretta.'}};
const ZAB_IDS=Object.keys(ZAB),ZAB_MAX=5;
const pw=l=>1+.12*((l||1)-1),cdOf=(id,l)=>ZAB[id].cd*(1-ZAB[id].cdL*((l||1)-1)),durOf=(id,l)=>ZAB[id].dur*(1+.08*((l||1)-1));
// la forza del round: come la vita degli zombie (partita.js hpMul)
const rk=()=>{const D=W.director;return D&&D.hpMul?D.hpMul(Math.max(1,D.R||1)):1};
// lo stato della partita: sl le tre abilità ({id, lv, cd, max}), gli oggetti nel mondo, le schegge
const AB={sl:[null,null,null],gren:[],traps:[],dolls:[],fx:[],scorch:[],nums:[],adr:0,hb:0,heal:0,dash:null,inp:null,ui:null,nmT:0,uid:0,used:{}};
const free=()=>{const D=W.director,h=W.hero;return!!D&&D.st!=='fine'&&D.st!=='giu'&&D.st!=='su'&&!h.dead&&!h.cl};
// ------------------------------------------------------------------ i suoni (col bottone Suono acceso)
function suono(w,x,y,v){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01,h=W.hero;v=v==null?1:v;
  AU.pan=x==null?0:cl((S(x,y,0)[0]-S(h.x,h.y,0)[0])/200,-.7,.7);const busy=typeof audioLv==='function'&&audioLv()>1;
  if(w==='scatto'){whoosh(t,.3,420,2600,.22*v);fNoise(t,.22,'lowpass',VR(700,.15),.8,.16*v,{brown:true});fNoise(t+.02,.06,'bandpass',VR(1900,.1),1.4,.1*v)}
  else if(w==='lancio'){whoosh(t,.32,650,1900,.12*v);fNoise(t+.05,.7,'highpass',VR(4200,.1),.8,.035*v,{att:.05})}// il lancio e la miccia che sfrigola
  else if(w==='tonfo'){M.metal(t,.35*v,VR(380,.1),.3);fThump(t,140,80,.08,.25*v)}
  else if(w==='boom'){if(window.ARMI&&ARMI.suono){ARMI.suono('lanciarazzi','esplosione',180+(x==null?0:(S(x,y,0)[0]-S(h.x,h.y,0)[0])),0)}else{fThump(t,62,26,1,1,.4);fNoise(t,1.1,'lowpass',1400,.8,.7,{brown:true,f2:70,rev:.4})}}
  else if(w==='piazza'){M.metal(t,.7*v,VR(520,.08),.6);for(let i=0;i<4;i++)fModal(t+.06+i*.05,VR(2600,.15),[1,2.7],[.05,.03],.035*v,.1);fNoise(t+.25,.04,'highpass',3600,1,.08*v)}
  else if(w==='scatta'){M.metal(t,1.1*v,VR(900,.08),.9);fThump(t,190,70,.12,.5*v);fNoise(t,.12,'bandpass',VR(1500,.1),1.2,.25*v);fNoise(t+.02,.2,'lowpass',600,.8,.2*v,{brown:true})}
  else if(w==='rotta'){M.metal(t,.4*v,VR(700,.1),.3);fNoise(t,.3,'lowpass',VR(900,.2),.8,.08*v,{brown:true,att:.05})}
  else if(w==='campanello'){if(busy)return;vBell(null,t,VR(88,.01),.7,.045*v);vBell(null,t+.09,93,.5,.025*v)}
  else if(w==='fuoco'){fNoise(t,.9,'lowpass',VR(900,.15),.8,.3*v,{brown:true,att:.04,f2:300});fThump(t,90,40,.4,.5*v,.3);for(let i=0;i<6;i++)fNoise(t+.1+Math.random()*.6,.03,'highpass',VR(3000,.3),.7,.05*v)}
  else if(w==='cura'){fNoise(t,.35,'bandpass',VR(2400,.1),1,.08*v,{att:.06});vBell(null,t+.05,79,1.2,.06*v);vBell(null,t+.2,84,1.2,.05*v);vChoir(null,t+.1,[64,67,71],1.4,.035*v)}
  else if(w==='cuore'){fThump(t,58,40,.12,.45*v);fThump(t+.17,52,36,.14,.35*v)}
  else if(w==='adrenalina'){whoosh(t,.5,300,1400,.12*v);fThump(t,62,40,.14,.6*v);fThump(t+.17,56,36,.16,.5*v);fNoise(t+.3,.6,'bandpass',VR(900,.1),2,.05*v,{f2:2400,att:.2})}
  else if(w==='fiato'){whoosh(t,.6,1200,400,.07*v)}
  else if(w==='pronta'){if(busy)return;fModal(t,VR(2100,.05),[1,2.4],[.12,.07],.035*v,.15)}
  else if(w==='no'){fThump(t,130,95,.07,.16*v);fNoise(t,.05,'bandpass',600,2,.05*v)}}catch(e){}}
// ------------------------------------------------------------------ i disegni delle sei abilità (anche nelle icone del menu): un segno semplice
// e pieno, coi contorni d'inchiostro spessi, tre toni e un lume, centrato in (0, 0) in un cerchio di raggio ~24
function glyph(g,id,s){g.save();if(s)g.scale(s,s);g.lineJoin='round';g.lineCap='round';const ink=w=>{g.strokeStyle='#0a0c0b';g.lineWidth=w};
  const fillInk=(f,w)=>{g.fillStyle=f;g.fill();ink(w||3);g.stroke()};
  if(id==='scatto'){// lo stivale con le righe del vento e una nuvoletta di polvere dietro il tallone
    g.strokeStyle='rgba(225,242,255,.95)';g.lineWidth=3.4;for(const[y,x0,l] of[[-13,-27,13],[-4,-30,17],[5,-27,11]]){g.beginPath();g.moveTo(x0,y);g.lineTo(x0+l,y);g.stroke()}
    g.beginPath();g.arc(-16,15,5.5,0,TAU);g.arc(-9,17,4.5,0,TAU);g.fillStyle='rgba(220,210,190,.85)';g.fill();
    g.beginPath();g.moveTo(-6,-21);g.lineTo(9,-21);g.lineTo(9,1);g.quadraticCurveTo(21,3,22,12);g.lineTo(22,17);g.lineTo(-9,17);g.lineTo(-9,6);g.quadraticCurveTo(-8,-6,-6,-21);g.closePath();fillInk('#a8683a',3.2);
    g.beginPath();g.moveTo(-9,11);g.lineTo(22,11);g.lineTo(22,17);g.lineTo(-9,17);g.closePath();fillInk('#3a2414',2.6);
    g.beginPath();g.rect(-8,-24,19,7);fillInk('#6e3e1c',2.6);
    g.strokeStyle='rgba(255,226,190,.55)';g.lineWidth=2;g.beginPath();g.moveTo(-4,-15);g.quadraticCurveTo(-5.5,-4,-5,6);g.stroke();
    g.fillStyle='#e0b04a';g.beginPath();g.arc(4,-20.5,1.8,0,TAU);g.fill()}
  else if(id==='granata'){// la palla di ferro con la miccia accesa
    const gr=g.createRadialGradient(-8,-1,2,-2,5,17);gr.addColorStop(0,'#6c707c');gr.addColorStop(.55,'#383a43');gr.addColorStop(1,'#1c1d22');g.beginPath();g.arc(-2,5,16,0,TAU);fillInk(gr,3.2);
    g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-9,-2,4.2,2.8,-.6,0,TAU);g.fill();
    g.save();g.translate(8,-9);g.rotate(.7);g.beginPath();g.rect(-4.5,-4,9,7);fillInk('#c9a040',2.6);g.restore();
    g.strokeStyle='#0a0c0b';g.lineWidth=5;g.beginPath();g.moveTo(11,-13);g.quadraticCurveTo(14,-22,21,-21);g.stroke();g.strokeStyle='#9a7a46';g.lineWidth=2.6;g.stroke();
    g.save();g.translate(21.5,-21.5);g.fillStyle='#ffd84a';g.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8,r=i%2?2.4:6.4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.fillStyle='#fff6d0';g.beginPath();g.arc(0,0,1.8,0,TAU);g.fill();g.restore()}
  else if(id==='tagliola'){// la tagliola aperta: due ganasce coi denti, la molla, la catena
    g.strokeStyle='#0a0c0b';g.lineWidth=4.5;g.beginPath();g.moveTo(0,14);g.lineTo(4,19);g.lineTo(0,24);g.stroke();g.strokeStyle='#7a838c';g.lineWidth=2.4;g.stroke();
    for(const sd of[-1,1]){g.beginPath();g.arc(0,0,19,sd<0?Math.PI*1.05:Math.PI*.05,sd<0?Math.PI*1.95:Math.PI*.95);g.strokeStyle='#0a0c0b';g.lineWidth=9;g.stroke();g.strokeStyle='#a8b2bc';g.lineWidth=5.4;g.stroke();
      g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1.6;g.beginPath();g.arc(0,0,20.2,sd<0?Math.PI*1.2:Math.PI*.2,sd<0?Math.PI*1.5:Math.PI*.5);g.stroke();
      for(let i=0;i<5;i++){const a=(sd<0?Math.PI*1.18:Math.PI*.18)+i*Math.PI*.16,c=Math.cos(a),s2=Math.sin(a);g.beginPath();g.moveTo(c*16-s2*2.6,s2*16+c*2.6);g.lineTo(c*10.5,s2*10.5);g.lineTo(c*16+s2*2.6,s2*16-c*2.6);g.closePath();fillInk('#dde4ea',1.6)}}
    g.beginPath();g.rect(-25,-2.5,8,5);fillInk('#6a737c',2.2);g.beginPath();g.rect(17,-2.5,8,5);fillInk('#6a737c',2.2);
    g.beginPath();g.arc(0,0,5,0,TAU);fillInk('#c9a040',2.4)}
  else if(id==='pupazzo'){// il pupazzo di paglia: la testa di sacco cucita, le braccia di bastone, il nastro rosso col campanello
    g.strokeStyle='#0a0c0b';g.lineWidth=5;g.beginPath();g.moveTo(0,10);g.lineTo(0,25);g.stroke();g.strokeStyle='#7a5430';g.lineWidth=2.8;g.stroke();
    g.strokeStyle='#0a0c0b';g.lineWidth=5;g.beginPath();g.moveTo(-21,4);g.lineTo(21,4);g.stroke();g.strokeStyle='#8a6038';g.lineWidth=2.8;g.stroke();
    g.strokeStyle='#e8c860';g.lineWidth=2;for(const sx of[-1,1])for(let i=0;i<3;i++){g.beginPath();g.moveTo(sx*20,4);g.lineTo(sx*(25+i),-1+i*4);g.stroke()}
    g.beginPath();g.moveTo(-10,2);g.lineTo(10,2);g.lineTo(8,16);g.lineTo(-8,16);g.closePath();fillInk('#b88a4a',2.6);
    g.beginPath();g.arc(0,-9,12,0,TAU);fillInk('#d6b070',3);g.fillStyle='rgba(120,80,30,.35)';g.beginPath();g.arc(3,-6,9,0,Math.PI*.9);g.fill();
    g.strokeStyle='#e8c860';g.lineWidth=2.2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*3,-19);g.lineTo(i*4.5,-26+Math.abs(i));g.stroke()}
    g.strokeStyle='#1a0e08';g.lineWidth=2.2;for(const ex of[-5,5]){g.beginPath();g.moveTo(ex-2.4,-12.4);g.lineTo(ex+2.4,-7.6);g.moveTo(ex+2.4,-12.4);g.lineTo(ex-2.4,-7.6);g.stroke()}
    g.lineWidth=1.6;g.beginPath();g.moveTo(-6,-3);g.quadraticCurveTo(0,0,6,-3);g.stroke();for(let i=-4;i<=4;i+=2.7){g.beginPath();g.moveTo(i,-3.6);g.lineTo(i+.6,-.6);g.stroke()}
    g.beginPath();g.rect(-9,1,18,4);fillInk('#c8323c',2);g.beginPath();g.arc(0,8,4.6,0,TAU);fillInk('#ffd23c',2.2);g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(-1.4,6.6,1.3,0,TAU);g.fill()}
  else if(id==='cura'){// la croce verde con due foglie e una benda
    g.save();g.rotate(-.5);g.beginPath();g.roundRect(-20,10,26,8,3);fillInk('#efe6d0',2.4);g.strokeStyle='rgba(120,100,70,.5)';g.lineWidth=1.2;for(let i=-16;i<4;i+=5){g.beginPath();g.moveTo(i,11.5);g.lineTo(i,16.5);g.stroke()}g.restore();
    for(const[x,y,a] of[[14,14,.7],[19,6,1.3]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.ellipse(0,0,7,3.6,0,0,TAU);fillInk('#7bd06a',2);g.strokeStyle='#2a5a12';g.lineWidth=1.2;g.beginPath();g.moveTo(-5,0);g.lineTo(5,0);g.stroke();g.restore()}
    g.beginPath();g.moveTo(-6,-20);g.lineTo(6,-20);g.lineTo(6,-6);g.lineTo(20,-6);g.lineTo(20,6);g.lineTo(6,6);g.lineTo(6,20);g.lineTo(-6,20);g.lineTo(-6,6);g.lineTo(-20,6);g.lineTo(-20,-6);g.lineTo(-6,-6);g.closePath();
    const gr=g.createLinearGradient(-12,-20,12,20);gr.addColorStop(0,'#8dff9a');gr.addColorStop(.5,'#3fbf5a');gr.addColorStop(1,'#1d7a32');fillInk(gr,3.2);
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;g.beginPath();g.moveTo(-3,-17);g.lineTo(-3,-6);g.moveTo(-17,-3);g.lineTo(-7,-3);g.stroke()}
  else{// l'Adrenalina: il cuore rosso col fulmine
    g.beginPath();g.moveTo(0,22);g.bezierCurveTo(-30,2,-16,-25,0,-9);g.bezierCurveTo(16,-25,30,2,0,22);const gr=g.createLinearGradient(-14,-18,10,20);gr.addColorStop(0,'#ff8a8e');gr.addColorStop(.5,'#e8323e');gr.addColorStop(1,'#8a0c16');fillInk(gr,3.2);
    g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-10,-8,4,2.6,-.7,0,TAU);g.fill();
    g.beginPath();g.moveTo(3,-16);g.lineTo(-7,2);g.lineTo(0,2);g.lineTo(-4,18);g.lineTo(9,-2);g.lineTo(2,-2);g.lineTo(7,-16);g.closePath();fillInk('#ffd84a',2.4)}
  g.restore()}
// ------------------------------------------------------------------ le abilità
const toast=(t,s)=>{W.toast=[t,s||1.8]};
// dove arriva una cosa lanciata da (x0, y0) verso (x1, y1): prima di un muro si ferma
function clearTo(x0,y0,x1,y1,r){const L=Math.hypot(x1-x0,y1-y0);if(L<1)return[x0,y0];const ux=(x1-x0)/L,uy=(y1-y0)/L;let lx=x0,ly=y0;
  for(let s=6;s<=L;s+=4){const x=x0+ux*s,y=y0+uy*s,o=hit(x,y,r);if(o&&o.tag!=='hole')break;lx=x;ly=y}return[lx,ly]}
// lo zombie più vicino che l'eroe vede, entro r
function nearest(r){const h=W.hero;let best=null,bd=1e9;for(const z of W.Z){if(z.die||z.idle||z.rise<1||!ZM.sameLv(z))continue;const d=Math.hypot(z.x-h.x,z.y-h.y);if(d<r&&d<bd&&physClear(h.x,h.y,z.x,z.y,2)){bd=d;best=z}}return best}
// spinge uno zombie via da (cx, cy) di L px, a passi (contro i muri si ferma)
function push(z,cx,cy,L){if(z.boss||z.idle||z.die||L<=1)return;const dx=z.x-cx,dy=z.y-cy,d=Math.hypot(dx,dy)||1,n=Math.ceil(L/4);for(let i=0;i<n;i++)move(z,dx/d*L/n,dy/d*L/n,11)}
const ACT={
  // (camminando dove va la levetta; da fermo via dallo zombie a cui sta sparando, se è vicino, altrimenti davanti a sé)
  scatto(s){const h=W.hero,iv=AB.inp,z=h.tgZ;let a=h.face||0;if(iv&&Math.hypot(iv.x,iv.y)>.15)a=Math.atan2(iv.y,iv.x);else if(z&&!z.die&&Math.hypot(z.x-h.x,z.y-h.y)<150)a=Math.atan2(h.y-z.y,h.x-z.x);
    AB.dash={a,t:0,T:.42,d:ZAB.scatto.dist,done:0};h.dashP=0;const D=W.director;D.inv=Math.max(D.inv||0,.5);
    if(!LOWFX)for(let i=0;i<5;i++)W.puffs.push({x:h.x+rr(-8,8),y:h.y+rr(-5,5),z:rr(1,5),t:rr(1.6,2.3),r:rr(4,6.5)});suono('scatto')},
  granata(s){const h=W.hero,z=nearest(200);let tx,ty;if(z){tx=z.x+(z.vx||0)*8;ty=z.y+(z.vy||0)*8}else{const a=h.face||0;tx=h.x+Math.cos(a)*130;ty=h.y+Math.sin(a)*130}
    [tx,ty]=clearTo(h.x,h.y,tx,ty,5);const L=Math.hypot(tx-h.x,ty-h.y);
    AB.gren.push({x0:h.x,y0:h.y,z0:(h.lvz||0)+30,tx,ty,zf:h.lvz||0,lv:h.lv||0,t:0,T:.32+L/420,fuse:.55,arc:24+L*.22,dmg:ZAB.granata.dmg*pw(s.lv)*rk(),r:ZAB.granata.r,sp:rr(0,TAU)});suono('lancio',h.x,h.y)},
  tagliola(s){const h=W.hero;if(h.lv){toast('La tagliola si mette a terra');return false}
    const on=AB.traps.filter(t=>t.st!=='rotta');if(on.length>=ZAB.tagliola.max){const o=on.find(t=>t.st==='open')||on[0];if(o.z&&!o.z.die)o.z.stun=0;o.st='rotta';o.bt=0}// (la più vecchia, prima una vuota)
    AB.traps.push({x:h.x,y:h.y,t:0,st:'open',a:rr(0,TAU),life:ZAB.tagliola.life,hold:ZAB.tagliola.hold*(1+.06*(s.lv-1)),dmg:ZAB.tagliola.dmg*pw(s.lv)*rk(),z:null,hT:0,bt:0});suono('piazza',h.x,h.y)},
  pupazzo(s){const h=W.hero;if(h.lv){toast('Il pupazzo si mette a terra');return false}const a=h.face||0;const[tx,ty]=clearTo(h.x,h.y,h.x+Math.cos(a)*85,h.y+Math.sin(a)*85,9);
    const o={i:++AB.uid,k:'pupazzo',x:h.x,y:h.y,zh:28,x0:h.x,y0:h.y,tx,ty,face:Math.atan2(h.y-ty,h.x-tx)||Math.PI/2,t:0,T:.5,st:'volo',dur:durOf('pupazzo',s.lv),dmg:ZAB.pupazzo.dmg*pw(s.lv)*rk(),r:ZAB.pupazzo.r,H:46,hw:10,jig:0,ring:0,burn:0};
    AB.dolls.push(o);(W.things||(W.things=[])).push(o);suono('lancio',h.x,h.y,.7)},
  cura(s){const D=W.director,PZ=D.PZ,h=W.hero;if(D.hp>=PZ.vita-.5){toast('Sei già in piena salute');return false}const v=Math.round(PZ.vita*ZAB.cura.heal*pw(s.lv));D.hp=Math.min(PZ.vita,D.hp+v);AB.heal=1.3;
    AB.nums.push({x:h.x,y:h.y,z:(h.zh||0)+58,n:v,t:0});const n=LOWFX?4:9;for(let i=0;i<n;i++)AB.fx.push({k:i%3?'cross':'leaf',x:h.x+rr(-14,14),y:h.y+rr(-8,8),z:(h.zh||0)+rr(4,40),vx:rr(-8,8),vy:rr(-6,6),vz:rr(28,48),t:0,T:rr(.8,1.3),a:rr(0,TAU)});suono('cura')},
  adrenalina(s){AB.adr=durOf('adrenalina',s.lv);AB.adr0=AB.adr;AB.hb=.62;suono('adrenalina')}};
function nope(i){const b=AB.ui&&AB.ui.b[i];if(b){b.classList.remove('no');void b.offsetWidth;b.classList.add('no')}suono('no')}
function use(i){const s=AB.sl[i];if(!s||!free())return false;if(s.cd>0){nope(i);return false}if(ACT[s.id](s)===false){nope(i);return false}
  s.cd=s.max;AB.used[s.id]=(AB.used[s.id]||0)+1;const b=AB.ui&&AB.ui.b[i];if(b){b.classList.remove('go');void b.offsetWidth;b.classList.add('go')}return true}
// ------------------------------------------------------------------ lo scatto: l'eroe si abbassa, parte, salta un poco e si ferma (la mossa
// «dash» dell'eroe 3D); la strada è nel mezzo della mossa (p da .14 a .62), coi muri che lo fermano come quando cammina
W.heroHook=(h,dt,inp)=>{AB.inp=inp;const A=AB.dash;if(!A){if(h.dashP!=null)h.dashP=null;return}
  if(h.dead||h.cl){AB.dash=null;h.dashP=null;return}A.t+=dt;const p=Math.min(1,A.t/A.T),k=ez(cl((p-.14)/.48,0,1)),want=A.d*k-A.done;
  if(want>0){const n=Math.ceil(want/5),c=Math.cos(A.a),s=Math.sin(A.a);for(let i=0;i<n;i++)move(h,c*want/n,s*want/n,10);A.done+=want;
    if(!LOWFX&&Math.random()<dt*40)AB.fx.push({k:'streak',x:h.x,y:h.y,z:(h.zh||0)+rr(14,40),a:A.a,t:0,T:.22,l:rr(14,24)})}
  h.moving=true;h.face=A.a;h.dashP=p;if(p>=1){AB.dash=null;h.dashP=null}};
// ------------------------------------------------------------------ le granate: volano a parabola, cadono, la miccia sfrigola mezzo secondo e
// scoppiano: tutti quelli nel cerchio (meno sul bordo), spinti via; resta una macchia nera per terra
function boom(g){const R=g.r,D=W.director;for(const z of W.Z){if(z.die||z.rise<1||(z.lv||0)!==g.lv)continue;const d=Math.hypot(z.x-g.tx,z.y-g.ty);if(d>R+8*(z.sc||1))continue;
    hurt(z,g.dmg*(1-.4*cl(d/R,0,1))*(z.boss?.5:1),true);push(z,g.tx,g.ty,34*(1-cl(d/R,0,1)))}
  W.FX.push({k:'boom',tw:[g.tx,g.ty,g.zf],t:.5,t0:.5,r:R});AB.fx.push({k:'flash',x:g.tx,y:g.ty,z:g.zf+8,t:0,T:.32,r:R},{k:'wave',x:g.tx,y:g.ty,z:g.zf,t:0,T:.45,r:R});if(D)D.shake=Math.max(D.shake||0,.4);if(!g.lv)AB.scorch.push({x:g.tx,y:g.ty,t:0,T:8,a:rr(0,TAU),r:R*.42});
  const n=LOWFX?6:16;for(let i=0;i<n;i++){const a=rr(0,TAU),v=rr(60,170);AB.fx.push({k:i%3?'spark':'chunk',x:g.tx,y:g.ty,z:g.zf+4,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:rr(60,170),t:0,T:rr(.4,.8),g:i%3?120:420})}
  if(!LOWFX)for(let i=0;i<6;i++)AB.fx.push({k:'smoke',x:g.tx+rr(-16,16),y:g.ty+rr(-12,12),z:g.zf+rr(4,16),vx:rr(-12,12),vy:rr(-8,8),vz:rr(10,22),t:0,T:rr(1.1,1.7),r:rr(9,15)});
  suono('boom',g.tx,g.ty)}
// ------------------------------------------------------------------ ogni fotogramma
function update(dt){const D=W.director,h=W.hero;if(!AB.ui)AB.ui=mkUI();
  for(const s of AB.sl){if(!s)continue;if(s.cd>0){s.cd=Math.max(0,s.cd-dt);if(s.cd===0){s.pop=.6;suono('pronta')}}if(s.pop>0)s.pop-=dt}
  if(AB.adr>0){AB.adr-=dt;if((AB.hb-=dt)<=0){AB.hb=.62;suono('cuore',null,null,.45)}if(AB.adr<=0){AB.adr=0;suono('fiato')}}
  if(AB.heal>0)AB.heal-=dt;if(AB.nmT>0)AB.nmT-=dt;
  // le granate
  for(const g of AB.gren){g.t+=dt;g.sp+=dt*9;if(g.t>=g.T&&!g.land){g.land=1;suono('tonfo',g.tx,g.ty)}if(g.t>=g.T+g.fuse&&!g.boom){g.boom=1;boom(g)}
    if(!LOWFX&&Math.random()<dt*30){const q=gPos(g);AB.fx.push({k:'spark',x:q[0],y:q[1],z:q[2]+6,vx:rr(-30,30),vy:rr(-30,30),vz:rr(20,60),t:0,T:rr(.15,.3),g:200})}}
  AB.gren=AB.gren.filter(g=>!g.boom);
  // le tagliole: si aprono, prendono il primo zombie che ci passa (i boss solo si fanno male e la rompono), lo tengono e poi si rompono
  for(const tr of AB.traps){tr.t+=dt;
    if(tr.st==='open'){if(tr.t>tr.life){tr.st='rotta';tr.bt=0;continue}if(tr.t<.35)continue;
      for(const z of W.Z){if(z.die||z.idle||z.rise<1||z.lv||z.cl)continue;if(Math.hypot(z.x-tr.x,z.y-tr.y)>15+3*(z.sc||1))continue;
        if(z.boss){hurt(z,tr.dmg*.6,true);tr.st='rotta';tr.bt=0;tr.snap=.25}else{tr.st='presa';tr.z=z;tr.hT=0;tr.f0=z.face;tr.snap=.25;z.stun=Math.max(z.stun||0,tr.hold);hurt(z,tr.dmg,true)}
        suono('scatta',tr.x,tr.y);if(!LOWFX)for(let i=0;i<7;i++){const a=rr(0,TAU);AB.fx.push({k:'spark',x:tr.x,y:tr.y,z:4,vx:Math.cos(a)*rr(40,90),vy:Math.sin(a)*rr(40,90),vz:rr(30,80),t:0,T:rr(.2,.4),g:200})}break}}
    else if(tr.st==='presa'){const z=tr.z;tr.hT+=dt;if(!z||z.die||tr.hT>=tr.hold||!W.Z.includes(z)){tr.st='rotta';tr.bt=0;if(z&&!z.die)z.stun=0;suono('rotta',tr.x,tr.y);continue}
      z.x+=(tr.x-z.x)*Math.min(1,dt*10);z.y+=(tr.y-z.y)*Math.min(1,dt*10);z.stun=Math.max(z.stun||0,tr.hold-tr.hT);z.face=tr.f0+.2*Math.sin(tr.hT*17)+.1*Math.sin(tr.hT*31);// si dimena
      if(Math.floor(tr.hT/.45)!==Math.floor((tr.hT-dt)/.45))z.flash=.1}
    else tr.bt+=dt;if(tr.snap>0)tr.snap-=dt}
  AB.traps=AB.traps.filter(t=>!(t.st==='rotta'&&t.bt>.6));
  // i pupazzi: volano, si piantano, suonano il campanello (gli zombie vanno da loro: W.goal), poi bruciano e scoppiano
  let goal=null;for(const o of AB.dolls){o.t+=dt;
    if(o.st==='volo'){const k=Math.min(1,o.t/o.T);o.x=lerp(o.x0,o.tx,k);o.y=lerp(o.y0,o.ty,k);o.zh=lerp(28,0,k)+Math.sin(k*Math.PI)*34;if(k>=1){o.st='su';o.t=0;o.zh=0;suono('tonfo',o.x,o.y,.6);if(!LOWFX)for(let i=0;i<4;i++)W.puffs.push({x:o.x+rr(-6,6),y:o.y+rr(-4,4),z:2,t:rr(1.8,2.4),r:rr(3,5)})}}
    else if(o.st==='su'){goal=[o.x,o.y];o.jig=Math.max(0,o.jig-dt*2.5);if((o.ring-=dt)<=0){o.ring=.55;o.jig=1;suono('campanello',o.x,o.y)}o.burn=cl((o.t-(o.dur-1.1))/1.1,0,1);
      if(o.burn>0&&!LOWFX&&Math.random()<dt*26)AB.fx.push({k:'flame',x:o.x+rr(-7,7),y:o.y+rr(-3,3),z:rr(8,34),vx:rr(-6,6),vy:rr(-4,4),vz:rr(30,55),t:0,T:rr(.35,.6),r:rr(3,5.5)});
      if(o.t>=o.dur){o.st='fine';burst(o)}}}
  if(AB.dolls.some(o=>o.st==='fine')){AB.dolls=AB.dolls.filter(o=>o.st!=='fine');if(W.things)W.things=W.things.filter(o=>o.k!=='pupazzo'||AB.dolls.includes(o))}W.goal=goal;
  // le schegge, il fumo, le croci della cura
  for(const f of AB.fx){f.t+=dt;if(f.k==='streak')continue;f.x+=(f.vx||0)*dt;f.y+=(f.vy||0)*dt;f.z+=(f.vz||0)*dt;if(f.g){f.vz-=f.g*dt;if(f.z<0){f.z=0;f.vz*=-.3;f.vx*=.5;f.vy*=.5}}if(f.k==='smoke'){f.r+=8*dt;f.vx*=.98}}
  AB.fx=AB.fx.filter(f=>f.t<f.T);for(const s of AB.scorch)s.t+=dt;AB.scorch=AB.scorch.filter(s=>s.t<s.T);for(const n of AB.nums)n.t+=dt;AB.nums=AB.nums.filter(n=>n.t<1.2);
  uiStep(dt)}
// il pupazzo brucia: chi gli sta intorno si fa male, le fiamme salgono
function burst(o){for(const z of W.Z){if(z.die||z.rise<1||z.lv)continue;const d=Math.hypot(z.x-o.x,z.y-o.y);if(d>o.r+8*(z.sc||1))continue;hurt(z,o.dmg*(1-.35*cl(d/o.r,0,1))*(z.boss?.5:1),true);push(z,o.x,o.y,22*(1-cl(d/o.r,0,1)))}
  W.FX.push({k:'boom',tw:[o.x,o.y,0],t:.5,t0:.5,r:o.r});AB.fx.push({k:'flash',x:o.x,y:o.y,z:14,t:0,T:.3,r:o.r*.8,fire:1},{k:'wave',x:o.x,y:o.y,z:0,t:0,T:.4,r:o.r});AB.scorch.push({x:o.x,y:o.y,t:0,T:7,a:rr(0,TAU),r:o.r*.36});const n=LOWFX?6:18;
  for(let i=0;i<n;i++){const a=rr(0,TAU),v=rr(30,110);AB.fx.push({k:i%2?'flame':'straw',x:o.x,y:o.y,z:rr(6,30),vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:rr(50,120),t:0,T:rr(.5,.9),r:rr(3,6),g:i%2?0:260,a:rr(0,TAU)})}
  const D=W.director;if(D)D.shake=Math.max(D.shake||0,.25);suono('fuoco',o.x,o.y)}
// dove sta una granata (in volo o a terra): x, y, z del mondo
function gPos(g){if(g.t>=g.T)return[g.tx,g.ty,g.zf+5];const k=g.t/g.T;return[lerp(g.x0,g.tx,k),lerp(g.y0,g.ty,k),lerp(g.z0,g.zf+5,k)+Math.sin(k*Math.PI)*g.arc]}
// ------------------------------------------------------------------ i disegni
// a terra: le macchie bruciate, le tagliole, il cerchio della granata che sta per scoppiare (dove arriva il colpo), le ombre, il cerchio del pupazzo
function drawGround(){if(!AB.scorch.length&&!AB.traps.length&&!AB.gren.length&&!AB.dolls.length)return;inGround(()=>{
  for(const s of AB.scorch){const a=1-cl((s.t-s.T+2)/2,0,1);ctx.save();ctx.globalAlpha=a*.75;ctx.translate(s.x,s.y);ctx.rotate(s.a);const gr=ctx.createRadialGradient(0,0,2,0,0,s.r*1.5);gr.addColorStop(0,'rgba(12,8,6,.85)');gr.addColorStop(.6,'rgba(20,14,10,.5)');gr.addColorStop(1,'rgba(20,14,10,0)');
    ctx.fillStyle=gr;ctx.beginPath();for(let i=0;i<10;i++){const an=i*TAU/10,r=s.r*1.5*(.75+.25*Math.sin(i*2.7+s.a*3));ctx.lineTo(Math.cos(an)*r,Math.sin(an)*r)}ctx.closePath();ctx.fill();
    if(s.t<1.4&&!LOWFX){ctx.globalCompositeOperation='lighter';glow('255,120,40',0,0,s.r*.9,.5*(1-s.t/1.4))}ctx.restore()}
  for(const f of AB.fx){if(f.k!=='wave')continue;const k=f.t/f.T,r=f.r*(.25+.85*ez(k));ctx.save();ctx.strokeStyle=`rgba(40,26,14,${.5*(1-k)})`;ctx.lineWidth=7*(1-k)+1;ctx.beginPath();ctx.arc(f.x,f.y,r,0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(255,200,120,${.45*(1-k)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,r-3,0,TAU);ctx.stroke();ctx.restore()}
  for(const tr of AB.traps)drawTrap(tr);
  for(const g of AB.gren){const q=gPos(g),hh=Math.max(0,q[2]-g.zf-5);ctx.fillStyle=`rgba(0,0,0,${.32*Math.max(.25,1-hh/60)})`;ctx.beginPath();ctx.ellipse(q[0],q[1],5.5,4,0,0,TAU);ctx.fill();
    if(g.t>=g.T){const k=cl((g.t-g.T)/g.fuse,0,1),R=g.r,bl=.5+.5*Math.sin(W.t*26);ctx.save();ctx.fillStyle=`rgba(255,70,30,${.16+.12*k})`;ctx.beginPath();ctx.arc(g.tx,g.ty,R,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(20,6,2,.55)';ctx.lineWidth=4.4;ctx.stroke();ctx.strokeStyle=`rgba(255,${170-70*k},70,${.75+.25*bl})`;ctx.lineWidth=2.4;ctx.stroke();
      ctx.setLineDash([5,6]);ctx.lineDashOffset=-W.t*36;ctx.strokeStyle=`rgba(255,220,150,${.55+.3*bl})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(g.tx,g.ty,R*.72,0,TAU);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=`rgba(255,120,50,${.22+.25*k})`;ctx.beginPath();ctx.arc(g.tx,g.ty,R*k,0,TAU);ctx.fill();ctx.restore()}}
  for(const o of AB.dolls){if(o.st==='volo'){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(o.x,o.y,8,5,0,0,TAU);ctx.fill();continue}
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(o.x,o.y,10,6,0,0,TAU);ctx.fill();
    // il richiamo: anelli d'oro che partono dal pupazzo a ogni colpo di campanello
    const k=1-cl(o.ring/.55,0,1);ctx.save();ctx.strokeStyle=`rgba(255,214,110,${.5*(1-k)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,14+k*46,0,TAU);ctx.stroke();ctx.restore()}})}
// la tagliola vista dall'alto (nel piano del terreno: girando la telecamera resta appoggiata): aperta, le due ganasce coi denti in cerchio, la
// piastra nel mezzo, le due molle ai lati, la catena al picchetto; chiusa, le ganasce strette in una linea di denti; rotta, si spegne
function drawTrap(tr){const br=tr.st==='rotta'?1-cl(tr.bt/.6,0,1):1;if(br<=0)return;const open=tr.st==='open',arm=ez(cl(tr.t/.35,0,1)),R=13;
  ctx.save();ctx.translate(tr.x,tr.y);ctx.rotate(tr.a);ctx.globalAlpha*=br;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(1,2,R+6,R*.8,0,0,TAU);ctx.fill();
  // la catena e il picchetto
  ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,R*.4);ctx.quadraticCurveTo(6,R+4,15,R+5);ctx.stroke();ctx.strokeStyle='#6a737c';ctx.lineWidth=1.3;ctx.stroke();
  ctx.fillStyle='#3a2a1a';ctx.beginPath();ctx.arc(15.5,R+5,2.6,0,TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.stroke();
  // le molle
  for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(sd*(R-2),-2.4);ctx.lineTo(sd*(R+9),-1.6);ctx.lineTo(sd*(R+9),1.6);ctx.lineTo(sd*(R-2),2.4);ctx.closePath();ctx.fillStyle='#5a636c';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke()}
  if(open){const r=R*(.75+.25*arm);
    for(const sd of[-1,1]){const a0=sd<0?Math.PI:0;ctx.beginPath();ctx.arc(0,0,r,a0+.12,a0+Math.PI-.12);ctx.strokeStyle=INK;ctx.lineWidth=6.4;ctx.stroke();ctx.strokeStyle='#a2acb6';ctx.lineWidth=3.6;ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,r+1,a0+.5,a0+1.4);ctx.stroke();
      for(let i=0;i<6;i++){const a=a0+.3+i*(Math.PI-.6)/5,c=Math.cos(a),s=Math.sin(a);ctx.beginPath();ctx.moveTo(c*(r-1)-s*2,s*(r-1)+c*2);ctx.lineTo(c*(r-5.5),s*(r-5.5));ctx.lineTo(c*(r-1)+s*2,s*(r-1)-c*2);ctx.closePath();ctx.fillStyle='#dfe6ec';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke()}}
    ctx.beginPath();ctx.arc(0,0,4.4,0,TAU);ctx.fillStyle='#b8913a';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='rgba(255,240,200,.5)';ctx.beginPath();ctx.arc(-1.2,-1.2,1.3,0,TAU);ctx.fill();
    // un luccichio che corre sulle ganasce: si vede da lontano
    if(!LOWFX){const a=W.t*2.2+tr.a;ctx.save();ctx.globalCompositeOperation='lighter';glow('230,240,255',Math.cos(a)*r,Math.sin(a)*r,6,.45);ctx.restore()}}
  else{// chiusa: le due ganasce alzate, viste dall'alto una linea di denti incrociati
    ctx.beginPath();ctx.moveTo(-R,0);ctx.quadraticCurveTo(0,-5,R,0);ctx.quadraticCurveTo(0,5,-R,0);ctx.closePath();ctx.fillStyle='#8a949e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle='#e6ecf0';ctx.lineWidth=1.3;ctx.beginPath();for(let i=0;i<=8;i++){const x=-R+3+i*(2*R-6)/8;ctx.lineTo(x,i%2?-1.8:1.8)}ctx.stroke();
    if(tr.snap>0&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,240,200',0,0,18,tr.snap*2.4);ctx.restore()}}
  ctx.restore()}
// in alto: le granate, le schegge e il fumo, le righe dello scatto, le croci e le foglie della cura, i numeri della cura
function drawTop(){
  for(const g of AB.gren){const q=SB(gPos(g)),r=5.2;ctx.save();ctx.translate(q[0],q[1]-r);
    ctx.fillStyle=INK;ctx.beginPath();ctx.arc(0,0,r+1.3,0,TAU);ctx.fill();const gr=ctx.createRadialGradient(-2,-2,.5,0,0,r);gr.addColorStop(0,'#70747f');gr.addColorStop(.6,'#383a43');gr.addColorStop(1,'#1d1e23');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(-1.8,-1.8,1.3,0,TAU);ctx.fill();const fa=g.sp,fx=Math.cos(fa)*r*.9,fy=Math.sin(fa)*r*.6-r*.5;
    ctx.fillStyle='#c9a040';ctx.fillRect(fx-1.4,fy-1.4,2.8,2.8);const sp=.6+.4*Math.sin(W.t*40);ctx.fillStyle='#ffe28a';ctx.beginPath();ctx.arc(fx*1.25,fy*1.25-1.5,1.6*sp+.6,0,TAU);ctx.fill();
    if(!LOWFX){ctx.globalCompositeOperation='lighter';glow('255,200,90',fx*1.25,fy*1.25-1.5,9,.55*sp)}ctx.restore()}
  for(const f of AB.fx){const k=f.t/f.T;
    if(f.k==='wave')continue;
    if(f.k==='flash'){const q=SB(f.x,f.y,f.z),r=f.r*(.35+.75*ez(k)),a=1-k;const gr=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],r);gr.addColorStop(0,`rgba(255,250,220,${.95*a})`);gr.addColorStop(.35,f.fire?`rgba(255,170,60,${.8*a})`:`rgba(255,200,90,${.8*a})`);gr.addColorStop(.7,`rgba(230,90,30,${.45*a})`);gr.addColorStop(1,'rgba(120,30,10,0)');
      ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.8,0,0,TAU);ctx.fill();continue}
    if(f.k==='streak'){const q=SB(f.x,f.y,f.z),dx=-Math.cos(f.a),dy=-Math.sin(f.a),e=S(f.x+dx*f.l,f.y+dy*f.l,f.z),b=S(f.x,f.y,f.z),ox=e[0]-b[0],oy=e[1]-b[1];ctx.strokeStyle=`rgba(225,240,255,${.55*(1-k)})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+ox,q[1]+oy);ctx.stroke();continue}
    const q=SB(f.x,f.y,f.z);
    if(f.k==='spark'){ctx.fillStyle=`rgba(255,${200+Math.round(40*(1-k))},120,${1-k})`;ctx.fillRect(q[0]-1.2,q[1]-1.2,2.4,2.4);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,170,80',q[0],q[1],5,.5*(1-k));ctx.restore()}}
    else if(f.k==='chunk'){ctx.fillStyle=`rgba(40,30,22,${1-k*k})`;ctx.beginPath();ctx.arc(q[0],q[1],1.8,0,TAU);ctx.fill()}
    else if(f.k==='smoke'){ctx.fillStyle=`rgba(60,58,64,${.38*(1-k)})`;ball(q,f.r);ctx.fill()}
    else if(f.k==='flame'){const r=f.r*(1-k*.6);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,140,50',q[0],q[1],r*2.6,.5*(1-k));ctx.restore()}ctx.fillStyle=`rgba(255,${Math.round(220-120*k)},70,${.9*(1-k)})`;ctx.beginPath();ctx.moveTo(q[0],q[1]-r*1.8);ctx.quadraticCurveTo(q[0]+r,q[1],q[0],q[1]+r*.6);ctx.quadraticCurveTo(q[0]-r,q[1],q[0],q[1]-r*1.8);ctx.fill()}
    else if(f.k==='straw'){ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(f.a+f.t*9);ctx.strokeStyle=`rgba(232,200,96,${1-k})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(3,0);ctx.stroke();ctx.restore()}
    else if(f.k==='cross'){ctx.save();ctx.globalAlpha=1-k;ctx.translate(q[0],q[1]);ctx.fillStyle=INK;ctx.fillRect(-3.4,-1.6,6.8,3.2);ctx.fillRect(-1.6,-3.4,3.2,6.8);ctx.fillStyle='#7dff9a';ctx.fillRect(-2.6,-.9,5.2,1.8);ctx.fillRect(-.9,-2.6,1.8,5.2);ctx.restore()}
    else if(f.k==='leaf'){ctx.save();ctx.globalAlpha=1-k;ctx.translate(q[0],q[1]);ctx.rotate(f.a+f.t*3);ctx.fillStyle='#6ccc5a';ctx.beginPath();ctx.ellipse(0,0,3.2,1.5,0,0,TAU);ctx.fill();ctx.restore()}}
  for(const n of AB.nums){const q=SB(n.x,n.y,n.z),k=n.t/1.2,y=q[1]-k*22;ctx.save();ctx.globalAlpha=Math.min(1,(1.2-n.t)/.35);ctx.font='400 15px "Lilita One",system-ui';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3.6;ctx.strokeStyle=INK;ctx.strokeText('+'+n.n,q[0],y);ctx.fillStyle='#8dff9a';ctx.fillText('+'+n.n,q[0],y);ctx.restore()}}
// sull'eroe: l'Adrenalina (un alone rosso che batte col cuore), la Cura (un alone verde), lo scatto (un velo azzurro)
function drawOnHero(q){if(LOWFX&&!AB.adr)return;const t=W.t;
  if(AB.adr>0){const end=Math.min(1,AB.adr/.6),beat=Math.pow(Math.max(0,Math.sin(t*TAU/.62)),6);ctx.save();ctx.globalCompositeOperation='lighter';if(!LOWFX){glow('255,80,70',q[0],q[1]-22,26+8*beat,(.22+.3*beat)*end);glow('255,180,120',q[0],q[1]-30,12,.18*end)}
    ctx.strokeStyle=`rgba(255,120,100,${(.35+.4*beat)*end})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q[0],q[1],15+5*beat,(15+5*beat)*.45*CAM.SP,0,0,TAU);ctx.stroke();ctx.restore()}
  if(AB.heal>0&&!LOWFX){const k=AB.heal/1.3;ctx.save();ctx.globalCompositeOperation='lighter';glow('120,255,150',q[0],q[1]-24,30,.4*k);ctx.restore()}
  if(AB.dash&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('150,205,255',q[0],q[1]-24,22,.25);ctx.restore()}}
// il pupazzo in 3D (la cassetta C3 dei mostri 3D, dipinto come loro: tre toni morbidi, contorno d'inchiostro, bordo illuminato): fermo nel
// mondo, girato verso dove stava l'eroe quando l'ha lanciato; girando la telecamera lo si vede di lato e da dietro, come la Bara. Il palo, il
// sacco legato con la corda, le braccia di bastone con la paglia, la testa di sacco cucita (un bottone nero e una croce di filo per occhi,
// la bocca cucita), la paglia in cima, il nastro rosso col campanello d'oro che dondola e brilla a ogni colpo; volando gira su se stesso,
// alla fine annerisce e prende fuoco. I pezzi si disegnano dal più lontano (C.parts), così il campanello passa dietro quando si gira
function doll(o){const C=window.C3;if(!C)return;const q=SB(o.x,o.y,o.zh||0),fc=(o.face||0)+CAM.yaw+(o.st==='volo'?o.t*9:0),V0=C.V(fc),t=W.t,j=o.jig||0,b=o.burn||0,
    roll=Math.sin(t*15)*.12*j,R=p=>C.rotX(p,roll),X={T:R,Rd:R,Z0:0},D=p=>V0.D(R(p)),dk=c=>b>0?C.cmix(c,'#24140a',b*.75):c,ink=w=>{ctx.strokeStyle=INK;ctx.lineWidth=w};
  ctx.save();ctx.translate(q[0],q[1]);ctx.lineJoin='round';ctx.lineCap='round';
  if(!o.zh){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,1,10,10*.5*CAM.SP,0,0,TAU);ctx.fill()}
  const Lp=C.parts(),straw=(a,bb)=>{const A=V0.P(R(a)),B=V0.P(R(bb));ctx.strokeStyle=dk('#e8c860');ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke()};
  // il palo
  Lp.add(D([-.6,0,7]),()=>C.caps(V0,R([0,0,0]),1.4,R([0,0,16]),1.2,dk('#7a5430'),{lw:2}));
  // le braccia di bastone, mezza per parte, con la paglia che esce dalle maniche
  for(const sd of[-1,1])Lp.add(D([0,sd*8,24]),()=>{C.caps(V0,R([0,0,24]),1.25,R([0,sd*14,24.6]),1.05,dk('#8a6038'),{lw:1.9});for(let i=0;i<4;i++)straw([0,sd*13.5,24.6],[(i-1.5)*1.2,sd*(17+i*.7),24.6+(i-1.5)*2.2])});
  // il sacco del corpo, legato in vita con la corda
  Lp.add(D([0,0,19]),()=>{const prof=[[12.5,3.6],[14,5.2],[17,6.1],[21,6],[24.5,5.1],[26.6,3.6]];C.vol(V0,C.revo(prof,.86,X,0,16),dk('#a87a40'),{kl:.2,kd:.4,lw:2.2});
    C.surfLine(V0,X,a=>({p:[Math.cos(a)*5.65*.86,Math.sin(a)*5.65,15.6],n:[Math.cos(a),Math.sin(a),0]}),dk('#6a4a24'),1.6,false,null,true);
    for(const a0 of[-.6,.2,1,2.2,3.4,4.6])C.surfLine(V0,X,k=>{const z=24-k*8,a=a0+k*.2;return{p:[Math.cos(a)*6.05*.86,Math.sin(a)*6.05,z],n:[Math.cos(a),Math.sin(a),0]}},'rgba(80,50,20,.35)',.9,true);
    // una toppa scura cucita sul davanti
    C.spot(V0,R([5.3*.86,-1.6,20.6]),R([1,-.25,0]),2.3,dk('#6e4a26'),{lw:.9,N:4,v0:.1})});
  // il nastro al collo
  Lp.add(D([0,0,27.2]),()=>C.surfLine(V0,X,a=>({p:[Math.cos(a)*3.9*.9,Math.sin(a)*3.9,27.3],n:[Math.cos(a),Math.sin(a),.2]}),'#c8323c',2.2,false,null,true));
  // la testa di sacco
  Lp.add(D([0,0,33.5]),()=>{const Rh=7.4,hq=C.sball(V0,R([0,0,33.5]),Rh,dk('#d2ac6a'),{kl:.2,kd:.34,lw:2.2});
    // la cucitura sulla nuca, la paglia in cima
    C.surfLine(V0,X,k=>{const a=Math.PI,z=27+k*13,r=Math.sqrt(Math.max(0,Rh*Rh-(z-33.5)*(z-33.5)));return{p:[Math.cos(a)*r,Math.sin(a)*r,z],n:[-1,0,(z-33.5)/Rh]}},'rgba(60,36,14,.55)',.9,true,[1.6,1.4]);
    for(let i=0;i<7;i++){const a=i/7*TAU+.4;straw([Math.cos(a)*1.6,Math.sin(a)*1.6,40.4],[Math.cos(a)*(3.4+i%2),Math.sin(a)*(3.4+i%2),44.5+(i%3)*.8])}
    if(b<.85){const on=d=>C.onHead(V0,hq,Rh,R(d));
      // gli occhi: un bottone nero coi quattro buchi, una croce di filo
      const e1=on([1,.38,.14]);if(e1.v>.12){const r=2*Math.pow(e1.v,.5);ctx.fillStyle='#120a06';ctx.beginPath();ctx.ellipse(e1.q[0],e1.q[1],r,r*1.05,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,240,210,.65)';ctx.fillRect(e1.q[0]-r*.45,e1.q[1]-r*.5,.7,.7);ctx.fillStyle='rgba(210,172,106,.7)';for(const[dx,dy] of[[-.35,-.3],[.35,-.3],[-.35,.3],[.35,.3]])ctx.fillRect(e1.q[0]+dx*r-.25,e1.q[1]+dy*r-.25,.5,.5)}
      const e2=on([1,-.38,.14]);if(e2.v>.12){const r=1.75*Math.pow(e2.v,.5);ctx.strokeStyle='#1a0e08';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(e2.q[0]-r,e2.q[1]-r);ctx.lineTo(e2.q[0]+r,e2.q[1]+r);ctx.moveTo(e2.q[0]+r,e2.q[1]-r);ctx.lineTo(e2.q[0]-r,e2.q[1]+r);ctx.stroke()}
      // la bocca cucita
      const M=[];for(let i=0;i<=7;i++){const s=-.5+i*.143,m=on([1,s,-.36+.08*Math.cos(s*4)]);if(m.v>.08)M.push(m.q)}
      if(M.length>1){ctx.strokeStyle='#1a0e08';ctx.lineWidth=1;ctx.beginPath();M.forEach((m,i)=>i?ctx.lineTo(m[0],m[1]):ctx.moveTo(m[0],m[1]));ctx.stroke();for(const m of M){ctx.beginPath();ctx.moveTo(m[0]-.2,m[1]-.9);ctx.lineTo(m[0]+.2,m[1]+.9);ctx.stroke()}}}});
  // il campanello d'oro appeso al nastro, davanti: dondola a ogni colpo e brilla
  const sw=Math.sin(t*15)*j*.5,bp=[4.2+Math.sin(sw)*1.4,0,24.8-Math.abs(Math.sin(sw))*.6];
  Lp.add(D(bp),()=>{const bq=C.sball(V0,R(bp),2.3,dk('#ffd23c'),{kl:.4,kd:.3,lw:1.4});ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(bq[0]-.7,bq[1]-.8,.6,0,TAU);ctx.fill();
    if(!LOWFX&&b<.6){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,214,110',bq[0],bq[1],7+8*j,.22+.35*j);ctx.restore()}});
  Lp.sort((a,c)=>a.d-c.d);for(const p of Lp)p.f();
  if(b>0&&!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,120,40',0,-26,18+12*b,.2+.4*b);ctx.restore()}
  ctx.restore()}
W.drawThing=o=>{if(o.k==='pupazzo')try{doll(o)}catch(e){}};
// ------------------------------------------------------------------ i bottoni in basso a destra (il primo all'estrema destra, dove arriva il
// pollice): un medaglione di ferro, dentro il colore e il disegno dell'abilità; l'ombra della ricarica gira e scende, coi secondi; pronto, brilla.
// Per i primi secondi della partita sopra ogni bottone c'è il suo nome. Tasti 1, 2, 3
function mkUI(){const ov=document.getElementById('mz');if(!ov)return null;const el=document.createElement('div');el.id='mzAb';el.innerHTML=`<style>
  #mzAb{position:absolute;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:row-reverse;gap:9px;align-items:flex-end;pointer-events:none;z-index:2}
  #mzAb .ab{pointer-events:auto;position:relative;width:60px;height:60px;padding:0;margin:0;border:0;background:none;box-shadow:none;border-radius:50%;touch-action:none;-webkit-tap-highlight-color:transparent;cursor:pointer}
  #mzAb .ab canvas{position:absolute;left:-6px;top:-6px;right:auto;bottom:auto;width:72px;height:72px;transition:transform .08s}
  #mzAb .ab:active{transform:none;box-shadow:none}#mzAb .ab:active canvas{transform:scale(.92)}
  #mzAb .ab.no{animation:mzabno .3s}@keyframes mzabno{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
  #mzAb .ab.go canvas{animation:mzabgo .35s}@keyframes mzabgo{40%{transform:scale(.86)}100%{transform:scale(1)}}
  #mzAb .ab .nm{position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);white-space:nowrap;font:400 12.5px "Lilita One",system-ui;letter-spacing:.02em;color:#efe6d0;text-shadow:0 2px 0 #000,0 0 6px #000;opacity:0;transition:opacity .5s;pointer-events:none;font-style:normal}
  #mzAb.nmon .ab .nm{opacity:1}
  #mzAb .ab .k{position:absolute;left:-2px;top:-2px;width:17px;height:17px;border-radius:50%;background:#1a1714;border:2px solid #000;font:400 11px/13px "Lilita One",system-ui;color:#d8cfb8;text-align:center;font-style:normal;pointer-events:none}
  #mzAb.coarse .ab .k{display:none}#mzAb[hidden],#mzAb .ab[hidden]{display:none!important}
  #mz.game.hasAb .hint{bottom:calc(112px + env(safe-area-inset-bottom,0px))}
  @media (prefers-reduced-motion:reduce){#mzAb .ab.go canvas,#mzAb .ab.no{animation:none}}</style>`;ov.appendChild(el);
  const fine=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);if(!fine)el.classList.add('coarse');
  const b=[];for(let i=0;i<3;i++){const x=document.createElement('button');x.className='ab';x.type='button';x.dataset.i=i;x.hidden=true;x.innerHTML=`<canvas width="144" height="144"></canvas><i class="nm"></i><i class="k">${i+1}</i>`;el.appendChild(x);
    x.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();use(i)});x.addEventListener('contextmenu',e=>e.preventDefault());b.push(x)}
  return{el,b,keys:['','',''],ov}}
function uiStep(dt){const U=AB.ui;if(!U)return;const D=W.director,on=!!D&&D.st!=='fine'&&D.st!=='giu',any=AB.sl.some(Boolean);if(U.el.hidden===(on&&any))U.el.hidden=!(on&&any);U.ov.classList.toggle('hasAb',any);
  U.el.classList.toggle('nmon',AB.nmT>0);const dis=!free();
  for(let i=0;i<3;i++){const s=AB.sl[i],x=U.b[i];if(x.hidden===!!s)x.hidden=!s;if(!s)continue;const nm=x.querySelector('.nm');if(nm.textContent!==ZAB[s.id].n)nm.textContent=ZAB[s.id].n;
    const fr=s.max?cl(s.cd/s.max,0,1):0,key=s.id+'|'+Math.ceil(fr*60)+'|'+Math.ceil(s.cd)+'|'+(dis?1:0)+'|'+(s.pop>0?Math.ceil(s.pop*20):0)+'|'+(s.id==='adrenalina'&&AB.adr>0?Math.ceil(AB.adr*4):0);
    if(key!==U.keys[i]){U.keys[i]=key;drawBtn(x.firstChild,s,fr,dis)}}}
function drawBtn(cv,s,fr,dis){const A=ZAB[s.id],g=cv.getContext('2d'),k=cv.width/72,c=36,R=27;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,72,72);g.lineJoin='round';
  if(s.pop>0){const p=1-s.pop/.6;g.strokeStyle=`rgba(${A.rgb},${.8*(1-p)})`;g.lineWidth=3;g.beginPath();g.arc(c,c,R+3+p*6,0,TAU);g.stroke()}
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(c,c+4,R+3,R+1,0,0,TAU);g.fill();
  g.beginPath();g.arc(c,c,R+3,0,TAU);const rim=g.createLinearGradient(0,c-R,0,c+R);rim.addColorStop(0,'#6a625a');rim.addColorStop(1,'#2a2622');g.fillStyle=rim;g.fill();g.strokeStyle='#000';g.lineWidth=2.6;g.stroke();
  g.beginPath();g.arc(c,c,R-1,0,TAU);const gr=g.createRadialGradient(c-8,c-10,3,c,c,R);gr.addColorStop(0,A.col[0]);gr.addColorStop(1,A.col[1]);g.fillStyle=gr;g.fill();g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1.4;g.stroke();
  g.save();g.beginPath();g.arc(c,c,R-1,0,TAU);g.clip();g.translate(c,c+1);glyph(g,s.id,.82);g.restore();
  g.strokeStyle='rgba(255,245,225,.35)';g.lineWidth=1.4;g.beginPath();g.arc(c,c,R+1.5,Math.PI*1.08,Math.PI*1.6);g.stroke();// il lume sul bordo
  // l'Adrenalina accesa: l'anello rosso che si consuma
  if(s.id==='adrenalina'&&AB.adr>0){const a=AB.adr/(AB.adr0||1);g.strokeStyle='#ff6a5a';g.lineWidth=3.2;g.beginPath();g.arc(c,c,R+3,-Math.PI/2,-Math.PI/2+a*TAU);g.stroke()}
  if(fr>0){g.save();g.beginPath();g.moveTo(c,c);g.arc(c,c,R-1,-Math.PI/2,-Math.PI/2+fr*TAU);g.closePath();g.fillStyle='rgba(8,8,12,.66)';g.fill();g.restore();
    const n=Math.ceil(s.cd);g.font='400 20px "Lilita One",system-ui';g.textAlign='center';g.textBaseline='middle';g.lineWidth=4;g.strokeStyle='#000';g.strokeText(n,c,c+1);g.fillStyle='#fff';g.fillText(n,c,c+1)}
  if(dis){g.fillStyle='rgba(10,10,14,.45)';g.beginPath();g.arc(c,c,R+3,0,TAU);g.fill()}}
// ------------------------------------------------------------------ una partita nuova: le abilità scelte (W.abil, dal menu: [{id, lv}…]; nella
// pagina di prova della mappa lo Scatto, la Granata e il Pupazzo), tutte pronte; niente oggetti nel mondo
function setup(){const L=W.abil||(W.gioco?[]:[{id:'scatto',lv:1},{id:'granata',lv:1},{id:'pupazzo',lv:1}]);
  AB.sl=[0,1,2].map(i=>{const a=L[i];return a&&ZAB[a.id]?{id:a.id,lv:cl(a.lv||1,1,ZAB_MAX),cd:0,max:cdOf(a.id,a.lv||1)*(W.abilCd||1),pop:0}:null});// (W.abilCd: la sfida del giorno «Abilità svelte»)
  Object.assign(AB,{gren:[],traps:[],dolls:[],fx:[],scorch:[],nums:[],adr:0,hb:0,heal:0,dash:null,nmT:6,used:{}});W.goal=null;if(W.things)W.things=W.things.filter(o=>o.k!=='pupazzo');const h=W.hero;if(h)h.dashP=null;
  if(AB.ui){AB.ui.keys=['','','']}}
// l'Adrenalina: corsa e arma più svelte (passa da W.mods, che fortuna.js rifà a ogni fotogramma)
{const _mh=ZM.modsHook;ZM.modsHook=M=>{if(_mh)_mh(M);if(AB.adr>0){M.spd=(M.spd||1)*ZAB.adrenalina.spd;M.gunK=(M.gunK||1)*ZAB.adrenalina.gun}}}
// agganciate alla partita (partita.js D): aggiornamento, disegni, partita nuova
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__ab)return D;D.__ab=1;
  const _u=D.update;D.update=(dt,on)=>{_u(dt,on);try{update(dt)}catch(e){console.error(e)}};
  const _g=D.drawGround;D.drawGround=dt=>{_g(dt);try{drawGround()}catch(e){console.error(e)}};
  const _t=D.drawTop;D.drawTop=dt=>{_t(dt);try{drawTop()}catch(e){console.error(e)}};
  const _h=D.drawOnHero;D.drawOnHero=q=>{try{drawOnHero(q)}catch(e){}_h(q)};
  const _r=D.reset;D.reset=()=>{_r();setup()};setup();return D}}
// i tasti 1, 2, 3 (sopra la mappa accesa, non in pausa)
addEventListener('keydown',e=>{const c=ZM.ctl;if(!c||!c.on||c.paused||!W.director||e.repeat)return;const k=e.code||'',i=/^(Digit|Numpad)[1-3]$/.test(k)?+k.slice(-1)-1:-1;if(i<0)return;e.preventDefault();use(i)},true);
ZM.abil={ZAB,ZAB_IDS,ZAB_MAX,AB,use,glyph,pw,cdOf,durOf,setup}})();
