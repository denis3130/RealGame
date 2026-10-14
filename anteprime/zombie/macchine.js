// ---------- LE MACCHINE della mappa zombie (punti 22 e 23 del piano di Denis, anteprima 48).
// La CREDENZA DEGLI ELISIR (i perk): un armadietto da speziale di legno scuro, ante a vetri con otto boccette che brillano, la manovella
// d'ottone sul fianco, il banco con lo scivolo e l'insegna. Si tiene premuto e si paga (1.500 il primo, poi 500 in più per ognuno che hai):
// la manovella gira, le boccette tintinnano, ne scende una a caso tra quelle che non hai, vola all'eroe che la beve e la sua icona si accende
// in alto a sinistra. Al massimo 4 insieme: con 4 il bottone lo dice e non vende. Gli otto: Doppi Danni, Cuore di Pietra (vita × 2,5), Mani
// Svelte (ricarica in metà tempo), Colpo Vampirico (ogni colpo a segno ridà un po' di vita), Istinto Mortale (molti più critici), Impulso
// Difensivo (quando ti colpiscono, a volte respingi gli zombie), Doppio Impatto (i colpi passano uno zombie in più e lo spingono indietro),
// Passo Svelto (corsa più veloce). Durano tutta la partita (niente a che fare con le Lucky Cards, che bruciano).
// La FORGIA DELLE ANIME (il potenziamento delle armi): forno di mattoni col fuoco verde delle anime, incudine, maglio a vapore e volano.
// Serve il vapore: la VALVOLA DELLA CALDAIA sta in un'altra zona e si apre gratis tenendo premuto (la ruota gira, la lancetta sale, il fuoco si
// accende, la caldaia fischia e sbuffa; la Forgia si accende anche lei). Poi la Forgia si sblocca pagando (1.000) e potenzia l'arma che hai in
// mano due volte (2.500 e 5.000): l'arma va sull'incudine, il maglio batte, scintille e vapore, e l'arma torna più forte col suo nome nuovo
// (livello 1, «temprata»: danno × 2, colpi azzurri che scintillano, uno sparo che squilla; livello 2, «delle Anime»: danno × 3,2, colpi viola
// che saltano allo zombie più vicino). Mentre lavora l'eroe ha la pistola (o niente, se forgia la pistola); l'arma resta sull'incudine finché
// non la prendi. Tutti i numeri in EL e FG, da regolare giocando.
(()=>{const{P,W,S,rr,srand,cl,lerp,ez,TAU,prop,solid,shade,shadeR,box,cyl,line3,ballAt,fn3,plane,material,lights,flames,smokes,buyable,move,ink,seg,ball,mix,facing}=ZM;
const E=(a,...b)=>a.push(...b);
material('elixWood',['#4a2e2a','#2e1a18','#6a443a'],'plank');
const EL={prezzo:n=>1500+500*n,max:4,vamp:2.5,pushCd:5,pushP:.55,pushR:110};
const FG={sblocca:1000,costo:[2500,5000],mul:[1,2,3.2],lavora:3.8,catena:.35};
// ------------------------------------------------------------------ gli otto elisir: nome, cosa fa, colore della boccetta, simbolo dell'icona
const PERK=[{id:'furia',n:'Doppi Danni',d:'ogni arma fa il doppio del danno',col:'#d8452e',sym:'teschio'},
  {id:'cuore',n:'Cuore di Pietra',d:'vita due volte e mezzo',col:'#8a96a6',sym:'cuore'},
  {id:'mani',n:'Mani Svelte',d:'ricarichi in metà tempo',col:'#e0a23a',sym:'giro'},
  {id:'vampiro',n:'Colpo Vampirico',d:'ogni colpo a segno ti ridà vita',col:'#a01c44',sym:'zanna'},
  {id:'istinto',n:'Istinto Mortale',d:'molti più colpi critici',col:'#7a4ac0',sym:'occhio'},
  {id:'impulso',n:'Impulso Difensivo',d:'colpito, a volte respingi gli zombie',col:'#3a86d8',sym:'onda'},
  {id:'impatto',n:'Doppio Impatto',d:'i colpi passano uno zombie in più e lo spingono',col:'#d0782a',sym:'freccia'},
  {id:'passo',n:'Passo Svelto',d:'corri più veloce',col:'#3aa860',sym:'piuma'}];
const PK={own:[],vbase:null,boost:null,lastHp:null,pushCd:0,fly:[],rings:[],ui:null,uk:''};
const has=id=>PK.own.includes(id);
const owned=()=>PK.own.length+PK.fly.filter(f=>!f.done).length+ELI.filter(e=>e.wait).length;// (anche quelli che stanno arrivando)
const ELI=[],FORGE=[],VALVES=[];
let POWER=false;
// ------------------------------------------------------------------ i suoni (vicino forte, lontano piano: ZM.audio.place)
function suono(w,x,y,k2){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const P0=x!=null&&ZM.audio?ZM.audio.place(x,y):(AU.pan=0,{k:1,rev:.2}),k=P0.k,t=AU.ctx.currentTime+.01;if(k<.01)return;
  if(w==='manovella'){for(let i=0;i<9;i++)M.wood(t+i*.09,.35*k,VR(900,.08));for(let i=0;i<6;i++)M.glass(t+.1+i*.13+Math.random()*.04,.5*k,VR(2400+i*120,.1))}
  else if(w==='scende'){M.glass(t,.9*k,VR(1900,.05));fNoise(t,.25,'bandpass',VR(1400,.1),2,.06*k,{f2:600});M.wood(t+.22,.4*k,VR(500,.1))}
  else if(w==='beve'){fNoise(t,.06,'bandpass',1800,2,.12);fThump(t+.05,420,200,.05,.12);for(let i=0;i<3;i++){fThump(t+.25+i*.22,VR(160,.08),90,.12,.18);fNoise(t+.25+i*.22,.1,'lowpass',500,.8,.06,{brown:true})}vChoir(null,t+.85,[k2||60,(k2||60)+4,(k2||60)+7],1.6,.06);vBell(null,t+.9,(k2||60)+24,1.2,.07)}
  else if(w==='no'){fThump(t,140,90,.12,.25);M.wood(t+.08,.6,VR(240,.05))}
  else if(w==='impulso'){fThump(t,130,40,.45,.5,.3);whoosh(t,.5,300,2600,.22,.3)}
  else if(w==='valvola'){for(let i=0;i<8;i++)M.metal(t+i*.16,.4*k,VR(520,.06),.3);fNoise(t+.2,1.2,'lowpass',380,.8,.18*k,{brown:true,att:.4})}
  else if(w==='fischio'){const o=osc('sine',1180,t,t+1.6),g=AU.ctx.createGain();o.frequency.setValueAtTime(1180,t);o.frequency.linearRampToValueAtTime(1320,t+.3);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09*k,t+.12);g.gain.setValueAtTime(.09*k,t+1.1);g.gain.exponentialRampToValueAtTime(.0005,t+1.55);o.connect(g);route(g,null,.35);
    fNoise(t,1.6,'bandpass',2600,1.2,.12*k,{att:.1,rev:.3});fThump(t+.05,90,40,.6,.3*k,.3)}
  else if(w==='sbuffo')fNoise(t,.5,'bandpass',VR(1800,.2),1,.08*k,{f2:600,att:.03})
  else if(w==='sblocca'){for(let i=0;i<3;i++)M.metal(t+i*.12,.8*k,VR(300,.05),.8);vChoir(null,t+.3,[45,52,57],2,.06*k);fThump(t,70,40,.8,.4*k,.4)}
  else if(w==='maglio'){M.metal(t,1.1*k,VR(380,.05),.7);M.metal(t+.003,.6*k,VR(1150,.05),.4);fThump(t,120,50,.15,.35*k);fNoise(t,.08,'highpass',5000,.7,.1*k)}
  else if(w==='pronta'){vBell(null,t,72,1.6,.1*k);vBell(null,t+.15,79,1.6,.08*k);vChoir(null,t+.1,[60,64,67,71],2.2,.07*k);whoosh(t,.6,600,3400,.12*k,.4)}
  else if(w==='prendi'){M.metal(t,.7,VR(900,.05),.4);fThump(t,180,80,.1,.2)}}catch(e){}}
// ------------------------------------------------------------------ le icone degli elisir: una boccetta tonda col tappo, il liquido del colore,
// il simbolo bianco sull'etichetta (g: dove disegnare, x, y il centro, s la grandezza)
function sym(g,k,s){g.save();g.scale(s,s);g.fillStyle='#fff';g.strokeStyle='#fff';g.lineWidth=1.2;g.lineCap='round';g.lineJoin='round';g.beginPath();
  if(k==='teschio'){g.arc(0,-.6,3,Math.PI*.95,Math.PI*2.05);g.lineTo(2,2.6);g.lineTo(-2,2.6);g.closePath();g.fill();g.fillStyle='#000';g.beginPath();g.arc(-1.1,-.5,.8,0,TAU);g.arc(1.1,-.5,.8,0,TAU);g.fill()}
  else if(k==='cuore'){g.moveTo(0,3);g.bezierCurveTo(-4.2,0,-2.6,-3.6,0,-1.6);g.bezierCurveTo(2.6,-3.6,4.2,0,0,3);g.fill()}
  else if(k==='giro'){g.arc(0,0,2.6,-.4,Math.PI*1.5);g.stroke();g.beginPath();g.moveTo(0,-4.1);g.lineTo(1.9,-2.6);g.lineTo(-.2,-1.2);g.closePath();g.fill()}
  else if(k==='zanna'){g.moveTo(-2.6,-2.6);g.lineTo(-1,2.2);g.lineTo(0,-1.6);g.lineTo(1,2.2);g.lineTo(2.6,-2.6);g.closePath();g.fill();g.beginPath();g.arc(1.2,3.2,.7,0,TAU);g.fill()}
  else if(k==='occhio'){g.ellipse(0,0,3.4,2,0,0,TAU);g.stroke();g.beginPath();g.arc(0,0,1.1,0,TAU);g.fill();g.beginPath();g.moveTo(-4,0);g.lineTo(-3.4,0);g.moveTo(3.4,0);g.lineTo(4,0);g.stroke()}
  else if(k==='onda'){for(const r of[1.2,2.5,3.8]){g.beginPath();g.arc(0,1.6,r,Math.PI*1.15,Math.PI*1.85);g.stroke()}}
  else if(k==='freccia'){for(const dx of[-1.3,1.3]){g.beginPath();g.moveTo(dx-1.6,2.4);g.lineTo(dx+1.4,0);g.lineTo(dx-1.6,-2.4);g.stroke()}}
  else if(k==='piuma'){g.moveTo(2.8,-3);g.quadraticCurveTo(-2.6,-1.6,-2.4,3);g.quadraticCurveTo(1.6,1.2,2.8,-3);g.fill();g.strokeStyle='#000';g.lineWidth=.5;g.beginPath();g.moveTo(-2.4,3);g.lineTo(1.8,-1.8);g.stroke()}
  g.restore()}
function bottle(g,x,y,s,col,k,a){g.save();g.translate(x,y);g.scale(s,s);if(a!=null)g.globalAlpha*=a;
  g.fillStyle='#14100c';g.beginPath();g.arc(0,2,6.6,0,TAU);g.rect(-2.6,-8.2,5.2,5.6);g.fill();// il contorno
  const gr=g.createRadialGradient(-1.8,.4,1,0,2,6);gr.addColorStop(0,mix(col,'#ffffff',.45));gr.addColorStop(.6,col);gr.addColorStop(1,mix(col,'#000000',.4));g.fillStyle=gr;g.beginPath();g.arc(0,2,5.4,0,TAU);g.fill();
  g.fillStyle='rgba(220,235,255,.35)';g.fillRect(-1.6,-7,3.2,4.6);g.fillStyle='#8a5a2e';g.fillRect(-2,-8.6,4,2.2);g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-2.6,0,1,2,.4,0,TAU);g.fill();
  g.translate(0,2.2);sym(g,k,.62);g.restore()}
// ------------------------------------------------------------------ la Credenza degli Elisir (un prop: volumi 3D, tre toni, contorno scuro)
// la faccia sud: due ante a vetri, tre ripiani con le boccette degli otto colori, la cornice e la serratura d'ottone
const credFront=(w,h)=>{const g=ctx;g.fillStyle='#120b0a';g.fillRect(4,4,w-8,h-10);srand(77);
  for(let r=0;r<3;r++){const y0=6+r*(h-14)/3,yb=y0+(h-14)/3-2;g.fillStyle='#3a241e';g.fillRect(4,yb,w-8,2);g.fillStyle='rgba(255,220,170,.15)';g.fillRect(4,yb,w-8,.6);
    for(let i=0;i<5;i++){const c=PERK[(r*5+i*3)%8].col,x=7+i*(w-14)/4.2,hh=rr(7,10),tall=(r+i)%2;g.fillStyle='#000';if(tall){g.fillRect(x-1.7,yb-hh-1,3.4,hh+1)}else{g.beginPath();g.arc(x,yb-3.3,3.4,0,TAU);g.fill();g.fillRect(x-1,yb-8,2,3)}
      g.fillStyle=c;if(tall)g.fillRect(x-1.1,yb-hh*.75,2.2,hh*.75-.3);else{g.beginPath();g.arc(x,yb-3.3,2.6,0,TAU);g.fill()}g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x-1,yb-(tall?hh-1:6),.7,2)}}
  // il vetro: riflessi in diagonale; le ante: telaio, montante in mezzo, maniglie d'ottone
  g.fillStyle='rgba(170,200,230,.1)';g.beginPath();g.moveTo(6,h-12);g.lineTo(14,6);g.lineTo(18,6);g.lineTo(10,h-12);g.fill();g.beginPath();g.moveTo(w/2+4,h-12);g.lineTo(w/2+12,6);g.lineTo(w/2+14,6);g.lineTo(w/2+6,h-12);g.fill();
  g.strokeStyle='#2a1810';g.lineWidth=2.2;g.strokeRect(4,4,w-8,h-10);g.beginPath();g.moveTo(w/2,4);g.lineTo(w/2,h-6);g.stroke();g.strokeStyle='rgba(255,220,170,.25)';g.lineWidth=.6;g.strokeRect(5.2,5.2,w-10.4,h-12.4);
  g.fillStyle='#c8a850';g.fillRect(w/2-3,h*.5,1.6,4);g.fillRect(w/2+1.4,h*.5,1.6,4);g.fillStyle='#2a1810';g.fillRect(4,h-6,w-8,4)};
// l'insegna sul cappello: «ELISIR» d'oro su legno scuro, col bordo
const credSign=(w,h)=>{const g=ctx;g.fillStyle='#2e1a18';g.beginPath();g.moveTo(1,h-1);g.lineTo(1,4);g.quadraticCurveTo(w/2,-3,w-1,4);g.lineTo(w-1,h-1);g.closePath();g.fill();g.strokeStyle='#c8a850';g.lineWidth=1;g.stroke();
  g.font='400 7px "Lilita One",system-ui';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#e8c860';g.fillText('ELISIR',w/2,h*.62);g.fillStyle='rgba(255,240,200,.35)';g.fillText('ELISIR',w/2,h*.62-.6)};
P.elisir=function(x,y){solid(x-21,y-9,42,18);solid(x-15,y+9,30,7);shade(x-20,y-8,40,22,58,.5);const m={x,y,rot:0,spin:0,use:0,col:null,pk:null,i:ELI.length,chute:ZM.toWorld(x,y+12)};ELI.push(m);/* (girata con ZM.turn: i punti usati fuori dal prop sono nel mondo) */const parts=[];
  for(const[dx,dy] of[[-19,-7],[16,-7],[16,4],[-19,4]])E(parts,...box(x+dx,y+dy,0,3,3,4,'elixWood',{ow:1.2}));
  const body=box(x-20,y-8,4,40,15,52,'elixWood',{tex:{s:credFront},ow:2});E(parts,...body,...box(x-22,y-10,56,44,19,4,'elixWood',{noFoot:true,ow:1.6}),...box(x-21,y-9,60,42,17,1.6,'brass',{noFoot:true,ow:1}));
  E(parts,plane(x-13,y-1,61,26,13,'x','elisir_insegna',credSign));
  // il banco davanti con lo scivolo d'ottone, la candela sul cappello
  E(parts,...box(x-15,y+8,0,30,7,17,'elixWood',{ow:1.6}),...box(x-16,y+7,17,32,9,2,'brass',{noFoot:true,ow:1.2}),fn3(S2=>chute(S2,m),{fp:[[x-6,y+8,17],[x+6,y+16,26]]}));
  E(parts,...cyl(x+15,y-4,61.6,1.7,6,'bone',{n:6}));flames.push({x:x+15,y:y-4,z:68.5,r:1.7,rgb:'255,190,110',ky:y-3});
  // la manovella d'ottone sul fianco est (gira quando versa) e il bagliore delle boccette dietro i vetri
  E(parts,fn3(S2=>crank(S2,m),{fp:[[x+20,y-8,20],[x+28,y+8,44]]}),fn3(S2=>glowFront(S2,m),{fp:[[x-18,y+7,8],[x+18,y+7,54]]}));
  lights.push({x,y:y+14,z:34,r:110,rgb:'255,170,110',a:.36,fl:1});
  prop({bx:[x-24,y-11,x+30,y+17,74],parts,noSplit:true});
  const bq=ZM.toWorld(x,y+24);buyable({id:'elisir'+m.i,x:bq[0],y:bq[1],r:56,show:()=>!!W.director&&W.director.st!=='fine'&&!W.hero.dead&&!(m.use>0),label:()=>'Credenza degli Elisir',price:()=>owned()>=EL.max?0:EL.prezzo(owned()),
    sub:()=>owned()>=EL.max?'Hai già '+EL.max+' elisir: non ne puoi bere altri':null,
    act(){if(owned()>=EL.max){W.toast=['Puoi portare al massimo '+EL.max+' elisir',2.4];suono('no');return false}const pr=EL.prezzo(owned());if(W.coins<pr)return false;W.coins-=pr;pour(m);return true}});
  return m};
function crank(S2,m){const c=S2(m.x+21,m.y+1,32),f=facing(1,0),a=m.rot;if(f<-.2)return;const R=6,p=[c[0]+Math.cos(a)*R*.5*Math.max(.3,Math.abs(f)),c[1]+Math.sin(a)*R];
  ctx.fillStyle='#8a7030';ctx.strokeStyle=INK;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(c[0],c[1],2.6*Math.max(.35,Math.abs(f)),2.6,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.lineWidth=3;ctx.lineCap='round';seg(c,p);ctx.stroke();ctx.strokeStyle='#c8a850';ctx.lineWidth=1.4;seg(c,p);ctx.stroke();ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.arc(p[0],p[1],1.9,0,TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke()}
function chute(S2,m){if(!(m.use>0)||!m.pk)return;const k=1-m.use/1.6;if(k<.35||k>.75)return;const u=(k-.35)/.4,c=S2(m.x,m.y+12,19+(1-u)*10);bottle(ctx,c[0],c[1]-3,.42,m.pk.col,m.pk.sym,Math.min(1,(1-u)*3))}
function glowFront(S2,m){if(LOWFX)return;if(facing(0,1)<.1)return;const t=W.t;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let r=0;r<3;r++){const q=S2(m.x-8+r*8,m.y+7.2,14+r*14),c=PERK[(r*3+Math.floor(t*.3))%8].col;glow(hexRgb(c),q[0],q[1],9+(m.use>0?6:0),.16+.08*Math.sin(t*2+r)+(m.use>0?.2:0))}ctx.restore()}
const hexRgb=h=>{const n=parseInt(h.slice(1),16);return((n>>16)&255)+','+((n>>8)&255)+','+(n&255)};
// versa un elisir: la manovella corre, una boccetta scende nello scivolo e vola all'eroe, che la beve; poi l'effetto e l'icona
function pour(m){const busy=PK.fly.map(f=>f.pk.id).concat(ELI.filter(e=>e.wait).map(e=>e.wait.pk.id)),left=PERK.filter(p=>!has(p.id)&&!busy.includes(p.id)),pk=left[Math.floor(Math.random()*left.length)];
  m.use=1.6;m.spin=14;m.col=pk.col;m.pk=pk;m.wait={pk,t:.7};suono('manovella',m.x,m.y)}
function drink(pk){const D=W.director;if(!D||D.st==='fine'||has(pk.id)||PK.own.length>=EL.max)return;PK.own.push(pk.id);
  if(pk.id==='cuore'){PK.vbase=D.PZ.vita;PK.boost=Math.round(D.PZ.vita*2.5);D.PZ.vita=PK.boost;D.hp=PK.boost}
  suono('beve',null,null,[60,62,64,65,67,69,71,72][PERK.indexOf(pk)]);W.toast=[pk.n+': '+pk.d,2.8];PK.rings.push({x:W.hero.x,y:W.hero.y,t:0,col:pk.col});PK.uk=''}
// ------------------------------------------------------------------ gli effetti degli elisir e della Forgia nel motore: W.mods (fortuna.js li
// ricalcola ogni fotogramma e poi chiama questo), il vampiro sui colpi a segno, l'impulso quando la vita scende
ZM.modsHook=M=>{if(has('furia'))M.dmg=(M.dmg||1)*2;if(has('impatto')){M.dmg=(M.dmg||1)*1.2;M.pierce=(M.pierce||0)+1;M.kb=7}if(has('istinto'))M.crit=Math.min(.6,(M.crit||0)+.22);
  if(has('passo'))M.spd=(M.spd||1)*1.25;if(has('mani'))M.relK=2;const g=ZM.gun();if(g&&g.pap)M.dmg=(M.dmg||1)*FG.mul[g.pap]};
function impulse(){const h=W.hero;PK.rings.push({x:h.x,y:h.y,t:0,col:'#7fd0ff',big:1});suono('impulso',h.x,h.y);
  for(const z of W.Z){if(z.die||z.idle||z.rise<1)continue;const dx=z.x-h.x,dy=z.y-h.y,d=Math.hypot(dx,dy)||1;if(d>EL.pushR)continue;const L=(EL.pushR+20-d)*.8,n=Math.ceil(L/4);for(let i=0;i<n;i++)move(z,dx/d*L/n,dy/d*L/n,11);if(!z.ai)z.stun=1.1}}
// ------------------------------------------------------------------ la valvola della caldaia (il vapore per la Forgia)
// una caldaia di ferro chiodata su un focolare di mattoni, il manometro, la ruota rossa della valvola sul tubo, il fischietto in cima
P.valvola=function(x,y){solid(x-17,y-17,34,34).round=true;shadeR(x+10,y+5,24,.45);const v={x,y,rot:0,t:-1,i:VALVES.length,smkAt:ZM.toWorld(x+4,y-2)};VALVES.push(v);const parts=[];
  E(parts,...box(x-17,y-17,0,34,34,9,'brick',{ow:1.8}),...cyl(x,y,9,14,40,'iron',{n:12,ink:.4}),...cyl(x,y,49,9,6,'iron',{n:10,r1:6}),...cyl(x+4,y-2,55,1.6,7,'brass',{n:6}));
  for(const z of[16,30,44])for(let i=0;i<12;i++){const a=i/12*TAU;E(parts,ballAt([x+Math.cos(a)*14.3,y+Math.sin(a)*14.3,z],.7,'iron'))}
  E(parts,line3([x,y+14,26],[x,y+26,26],'#3a3c44',3.4,{ink:true}),fn3(S2=>wheel(S2,v),{fp:[[x-9,y+25,17],[x+9,y+28,35]]}),fn3(S2=>gauge(S2,v),{fp:[[x-6,y+13,36],[x+6,y+15,46]]}),fn3(S2=>firebox(S2,v),{fp:[[x-12,y+17,1],[x+12,y+17,8]]}));
  E(parts,line3([x+14,y+4,20],[x+24,y+4,20],'#3a3c44',3,{ink:true}),line3([x+24,y+4,20],[x+24,y+4,0],'#3a3c44',3,{ink:true}));// il tubo che va sotto terra, verso la Forgia
  prop({bx:[x-19,y-19,x+26,y+30,64],parts,noSplit:true});
  const bq=ZM.toWorld(x,y+40);buyable({id:'valvola'+v.i,x:bq[0],y:bq[1],r:52,hold:1.1,show:()=>!POWER&&!W.hero.dead&&(!W.director||W.director.st!=='fine'),label:()=>'Valvola della caldaia',price:()=>0,sub:()=>'Tieni premuto: dai il vapore alla Forgia',
    act(){if(POWER)return false;power(v);return true}});
  return v};
function wheel(S2,v){const c=S2(v.x,v.y+27,26),R=8,a=v.rot,f=facing(0,1);ctx.save();ctx.translate(c[0],c[1]);ctx.scale(1,Math.max(.45,Math.abs(f)));
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.stroke();ctx.strokeStyle='#a02a22';ctx.lineWidth=2.4;ctx.stroke();ctx.strokeStyle='rgba(255,160,140,.5)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,0,R,-2.6,-1.4);ctx.stroke();
  for(let i=0;i<4;i++){const b=a+i*Math.PI/2;ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(b)*R,Math.sin(b)*R);ctx.stroke();ctx.strokeStyle='#7a1e18';ctx.lineWidth=1.2;ctx.stroke()}
  ctx.fillStyle='#3a3c44';ctx.beginPath();ctx.arc(0,0,2.2,0,TAU);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();ctx.restore()}
function gauge(S2,v){if(facing(0,1)<.05)return;const c=S2(v.x,v.y+14.2,41),k=POWER?cl(.25+.6*(v.t<0?1:Math.min(1,v.t/1.5))+.03*Math.sin(W.t*7),0,1):.04;
  ctx.fillStyle='#e8dcc0';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(c[0],c[1],4.4,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#c8a850';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(c[0],c[1],3.6,0,TAU);ctx.stroke();
  ctx.strokeStyle='#a02a22';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(c[0],c[1],3,Math.PI*.15,Math.PI*.45);ctx.stroke();const a=Math.PI*.8+k*Math.PI*1.4;ctx.strokeStyle='#14100c';ctx.lineWidth=1;seg(c,[c[0]+Math.cos(a)*3.2,c[1]+Math.sin(a)*3.2]);ctx.stroke()}
function firebox(S2,v){if(facing(0,1)<.05)return;const a=S2(v.x-7,v.y+17.1,1.5),b=S2(v.x+7,v.y+17.1,7.5);ctx.fillStyle='#0a0606';ctx.fillRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);
  if(POWER){const f=.75+.25*Math.sin(W.t*11)+.1*Math.sin(W.t*23);ctx.fillStyle=`rgba(255,${Math.round(120+60*f)},40,${.85*f})`;ctx.fillRect(a[0]+1,b[1]+1.5,b[0]-a[0]-2,a[1]-b[1]-2);if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,140,50',(a[0]+b[0])/2,a[1],16,.4*f);ctx.restore()}}
  ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.strokeRect(a[0],b[1],b[0]-a[0],a[1]-b[1])}
// la valvola si apre: la ruota gira, la lancetta sale, il fuoco si accende, fischia e sbuffa; la Forgia si accende (luce, volano, fumo)
function power(v){POWER=true;v.t=0;suono('valvola',v.x,v.y);setTimeout(()=>{suono('fischio',v.x,v.y);for(const f of FORGE)suono('sblocca',f.x,f.y)},1200);
  W.toast=['La caldaia fischia: la Forgia delle Anime ha il vapore',3.2];smokes.push(v.smk={x:v.smkAt[0],y:v.smkAt[1],z:63,t:0,_t:1});for(const f of FORGE)if(!f.smk)smokes.push(f.smk={x:f.smkAt[0],y:f.smkAt[1],z:78,t:0,_t:1})}
// ------------------------------------------------------------------ la Forgia delle Anime
const GEN={pistola:'a',revolver:'o',mitraglietta:'a',mitra:'o',mitragliatrice:'a',pompa:'a',tattica:'a',lanciarazzi:'o',tamburo:'a',lanciafiamme:'o',vapore:'o',risonatore:'o'};
const nomeF=(id,lvl)=>{const n=window.ARMI&&ARMI.DATI[id]?ARMI.DATI[id].n:id;return lvl>=2?n+' delle Anime':n+' temprat'+(GEN[id]||'o')};
// la bocca del forno sulla faccia sud: arco nero, con il fuoco dentro dal vivo (fn3)
const forgeMouth=(w,h)=>{const g=ctx;g.fillStyle='#0a0606';g.beginPath();g.moveTo(w*.28,h);g.lineTo(w*.28,h*.45);g.quadraticCurveTo(w*.5,h*.05,w*.72,h*.45);g.lineTo(w*.72,h);g.closePath();g.fill();g.strokeStyle='#14100c';g.lineWidth=2;g.stroke();
  g.fillStyle='#3a3c44';for(let i=0;i<5;i++){const a=Math.PI+i*Math.PI/4;g.fillRect(w*.5+Math.cos(a)*w*.25-1.5,h*.45+Math.sin(a)*h*.4-1.5,3,3)}};
P.forgia=function(x,y){solid(x-25,y-14,50,22);solid(x-15,y+8,22,9);shade(x-24,y-13,48,30,64,.5);
  const f={x,y,st:'fredda',t:0,item:null,open:false,rot:0,hit:0,i:FORGE.length,anvil:ZM.toWorld(x-3,y+13),smkAt:ZM.toWorld(x+10,y-5)};FORGE.push(f);const parts=[];
  E(parts,...box(x-24,y-13,0,48,20,16,'stoneD',{ow:2}),...box(x-19,y-11,16,38,16,24,'brick',{tex:{s:forgeMouth},ow:2}),...box(x-21,y-13,40,42,20,4,'iron',{noFoot:true,ow:1.6}),...cyl(x+10,y-5,44,5.5,30,'iron',{n:8,ink:.4}),...cyl(x+10,y-5,74,7,3,'iron',{n:8}));
  E(parts,fn3(S2=>forgeFire(S2,f),{fp:[[x-8,y+5,16],[x+8,y+6,38]]}));
  // l'incudine davanti (piede, corpo, piano con il corno) e l'arma che ci sta sopra
  E(parts,...box(x-9,y+10,0,10,6,9,'iron',{ow:1.6}),...box(x-13,y+9,9,18,8,4.5,'iron',{noFoot:true,ow:1.6}),line3([x+5,y+13,11.2],[x+10,y+13,11.6],'#34363e',3,{ink:true}),fn3(S2=>anvilGun(S2,f),{fp:[[x-14,y+8,13],[x+6,y+17,30]]}));
  // il maglio: palo a ovest, braccio che si alza e batte sull'incudine; il volano a est con i raggi
  E(parts,...box(x-25,y+6,0,4,4,38,'wood',{ow:1.4}),fn3(S2=>hammer(S2,f),{fp:[[x-25,y+4,20],[x-2,y+16,44]]}),fn3(S2=>flywheel(S2,f),{fp:[[x+24,y-12,4],[x+27,y+8,30]]}));
  E(parts,line3([x+27,y+10,0],[x+27,y+10,14],'#5d8a76',2.6,{ink:true}),line3([x+27,y+10,14],[x+19,y+5,14],'#5d8a76',2.6,{ink:true}));// il tubo del vapore che arriva dalla caldaia
  prop({bx:[x-28,y-15,x+30,y+18,80],parts,noSplit:true});
  lights.push(f.light={x,y:y+18,z:20,r:120,rgb:'110,255,190',a:0,fl:1});
  const bq=ZM.toWorld(x,y+30);buyable({id:'forgia'+f.i,x:bq[0],y:bq[1],r:56,show:()=>f.st!=='lavora'&&!W.hero.dead&&(!W.director||W.director.st!=='fine'),
    label:()=>{if(!POWER)return'Forgia delle Anime';if(!f.open)return'Forgia delle Anime';if(f.st==='pronta')return'Prendi: '+f.item.nome;const g=ZM.gun();return g&&(g.pap||0)>=2?'Al massimo: '+(g.nome||g.D.n):'Forgia: '+(g&&(g.nome||g.D.n)||'')},
    price:()=>{if(!POWER||f.st==='pronta')return 0;if(!f.open)return FG.sblocca;const g=ZM.gun();return!g||(g.pap||0)>=2?0:FG.costo[g.pap||0]},
    sub:()=>!POWER?'Serve il vapore: trova la valvola della caldaia':f.st==='pronta'?'Tieni premuto':null,
    act(){if(!POWER){W.toast=['Fredda: serve il vapore della caldaia',2.4];suono('no');return false}
      if(f.st==='pronta'){take(f);return true}
      if(!f.open){if(W.coins<FG.sblocca)return false;W.coins-=FG.sblocca;f.open=true;suono('sblocca',f.x,f.y);W.toast=['La Forgia delle Anime è aperta',2.4];return true}
      const g=ZM.gun();if(!g)return false;const lv=g.pap||0;if(lv>=2){W.toast=['Questa arma è già al massimo',2.2];suono('no');return false}const pr=FG.costo[lv];if(W.coins<pr)return false;W.coins-=pr;forge(f,g,lv+1);return true}});
  return f};
function forgeFire(S2,f){if(facing(0,1)<.05)return;const on=POWER,w=f.st==='lavora',k=on?(w?1:.55):0,a=S2(f.x-8,f.y+5.2,16.5),b=S2(f.x+8,f.y+5.2,33);if(k<=0)return;const t=W.t,fl=.8+.2*Math.sin(t*9)+.1*Math.sin(t*21);
  ctx.save();ctx.beginPath();ctx.moveTo(a[0]+3,a[1]);ctx.lineTo(a[0]+3,(a[1]+b[1])/2);ctx.quadraticCurveTo((a[0]+b[0])/2,b[1]-2,b[0]-3,(a[1]+b[1])/2);ctx.lineTo(b[0]-3,a[1]);ctx.closePath();ctx.clip();
  const g=ctx.createLinearGradient(0,a[1],0,b[1]);g.addColorStop(0,`rgba(150,255,200,${.9*k*fl})`);g.addColorStop(1,`rgba(40,120,120,${.5*k})`);ctx.fillStyle=g;ctx.fillRect(a[0],b[1]-4,b[0]-a[0],a[1]-b[1]+6);
  for(let i=0;i<4;i++){const x=lerp(a[0]+4,b[0]-4,(i+.5)/4),hh=(a[1]-b[1])*(.4+.25*Math.sin(t*7+i*2));ctx.fillStyle=`rgba(220,255,235,${.6*k})`;ctx.beginPath();ctx.ellipse(x,a[1]-hh*.4,1.6,hh*.4,0,0,TAU);ctx.fill()}ctx.restore();
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('110,255,190',(a[0]+b[0])/2,(a[1]+b[1])/2,22+(w?12:0),.4*k*fl);ctx.restore()}}
function anvilGun(S2,f){const it=f.item;if(!it||!window.ARMI)return;const c=S2(f.x-3,f.y+13,15+(f.st==='pronta'?3+Math.sin(W.t*3)*1.2:0)),hot=f.st==='lavora'?1:.6;
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(it.lvl>=2?'200,140,255':'140,230,255',c[0],c[1]-2,18,.45*hot);ctx.restore()}
  try{ctx.save();ctx.translate(c[0],c[1]);ctx.scale(.55,.55);ARMI.arma(it.id,0,0,0,{});ctx.restore()}catch(e){ctx.restore()}}
function hammer(S2,f){const piv=[f.x-23,f.y+8,38],w=f.st==='lavora',T=f.t%(FG.lavora/6),up=w?(T<.42?ez(T/.42):1-ez(Math.min(1,(T-.42)/.1))):POWER?.15+.05*Math.sin(W.t*2):0,a=lerp(-.08,.9,up);
  const tip=[piv[0]+Math.cos(a)*20,piv[1]+2,piv[2]-Math.sin(-a)*20-4],P0=S2(piv),P1=S2(tip);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4;seg(P0,P1);ctx.stroke();ctx.strokeStyle='#5e4128';ctx.lineWidth=2.2;seg(P0,P1);ctx.stroke();
  const h0=S2([tip[0],tip[1],tip[2]-4]),h1=S2([tip[0],tip[1],tip[2]+4]);ctx.strokeStyle=INK;ctx.lineWidth=7;seg(h0,h1);ctx.stroke();ctx.strokeStyle='#4a4c56';ctx.lineWidth=5;seg(h0,h1);ctx.stroke();ctx.strokeStyle='rgba(220,225,240,.4)';ctx.lineWidth=1;seg(h0,h1);ctx.stroke();
  ctx.fillStyle='#3a3c44';ball(P0,2.2);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke()}
function flywheel(S2,f){const c=[f.x+25.5,f.y-2,17],R=12,a=f.rot,P=[];for(let i=0;i<16;i++){const b=i/16*TAU;P.push(S2([c[0],c[1]+Math.cos(b)*R,c[2]+Math.sin(b)*R]))}
  ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.stroke();ctx.strokeStyle='#4a4c56';ctx.lineWidth=2.2;ctx.stroke();
  const C=S2(c);for(let i=0;i<6;i++){const b=a+i*TAU/6,q=S2([c[0],c[1]+Math.cos(b)*R,c[2]+Math.sin(b)*R]);ctx.strokeStyle=INK;ctx.lineWidth=2.4;seg(C,q);ctx.stroke();ctx.strokeStyle='#5a5c66';ctx.lineWidth=1.1;seg(C,q);ctx.stroke()}
  ctx.fillStyle='#34363e';ball(C,2.6);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke()}
// l'arma sull'incudine: l'eroe tiene la pistola (o niente, se forgia la pistola) finché non riprende la sua
function forge(f,g,lvl){const id=W.gunId;f.item={id,lvl,nome:nomeF(id,lvl)};f.st='lavora';f.t=0;f.hit=0;suono('sblocca',f.x,f.y);
  if(id!=='pistola'){ZM.equip('pistola');W.toast=['La tua arma è sull\'incudine',2.2]}else{W.hero.unarmed=true;W.toast=['La pistola è sull\'incudine',2.2]}}
function take(f){const it=f.item;if(!it)return;W.hero.unarmed=false;ZM.equip(it.id);const g=ZM.gun();if(g){g.pap=it.lvl;g.nome=it.nome;g.mag=g.D.mag;g.res=g.D.res*(it.lvl+1)}W.toast=[it.nome,2.6];suono('prendi',f.x,f.y);f.item=null;f.st='calda';f.t=0;PK.rings.push({x:W.hero.x,y:W.hero.y,t:0,col:it.lvl>=2?'#d48bff':'#8fe6ff'})}
// i colpi delle armi forgiate: una scintilla azzurra sullo zombie (livello 1), viola e un arco che salta allo zombie più vicino (livello 2)
const ARCS=[];
W.papHit=(z,g,dmg)=>{const lv=g.pap||0;if(!lv)return;PK.rings.push({x:z.x,y:z.y,t:.35,col:lv>=2?'#d48bff':'#8fe6ff',small:1});if(lv<2)return;
  let best=null,bd=80;for(const o of W.Z){if(o===z||o.die||o.rise<1||o.idle)continue;const d=Math.hypot(o.x-z.x,o.y-z.y);if(d<bd){bd=d;best=o}}
  if(best){ZM.hurt(best,dmg*FG.catena,false);ARCS.push({a:[z.x,z.y,(z.zh||0)+22],b:[best.x,best.y,(best.zh||0)+22],t:0,sd:Math.random()*99})}};
// lo sparo delle armi forgiate squilla (livello 1) o crepita (livello 2)
if(window.ARMI&&ARMI.suono){const _s=ARMI.suono;ARMI.suono=function(id,w){const r=_s.apply(this,arguments);try{const g=ZM.gun();if(w==='sparo'&&g&&g.pap&&AU.ctx&&AU.on.sfx){const t=AU.ctx.currentTime+.005;
  if(g.pap>=2){fNoise(t,.14,'bandpass',VR(3200,.1),3,.05,{f2:900});vBell(null,t,84+Math.floor(Math.random()*3),.5,.035)}else M.metal(t,.28,VR(2200,.05),.25)}}catch(e){}return r}}
// ------------------------------------------------------------------ le icone degli elisir in alto a sinistra, sotto la vita
function mkUI(){const ov=document.getElementById('mz');if(!ov)return null;const el=document.createElement('div');el.id='mzPerk';el.innerHTML=`<style>
  #mzPerk{position:absolute;left:12px;top:calc(88px + env(safe-area-inset-top,0px));display:flex;gap:3px;pointer-events:none}
  #mzPerk canvas{position:relative;inset:auto;width:24px;height:30px;display:block;animation:mzpk .5s cubic-bezier(.3,1.6,.5,1)}
  @keyframes mzpk{from{transform:scale(.2)}}@media (prefers-reduced-motion:reduce){#mzPerk canvas{animation:none}}</style>`;ov.appendChild(el);return{el}}
function drawUI(){if(!PK.ui)PK.ui=mkUI();const U=PK.ui;if(!U)return;const k=PK.own.join(',');if(k===PK.uk)return;PK.uk=k;U.el.querySelectorAll('canvas').forEach(c=>c.remove());
  for(const id of PK.own){const pk=PERK.find(p=>p.id===id),c=document.createElement('canvas');c.width=48;c.height=60;c.title=pk.n;const g=c.getContext('2d');bottle(g,24,34,2.6,pk.col,pk.sym);U.el.appendChild(c)}}
// ------------------------------------------------------------------ ogni fotogramma e i disegni (agganciati alla partita come fortuna.js)
function update(dt){const D=W.director,h=W.hero;
  for(const m of ELI){m.use=Math.max(0,m.use-dt);m.spin+=(0-m.spin)*Math.min(1,dt*1.2);m.rot+=m.spin*dt;if(m.wait&&(m.wait.t-=dt)<=0){suono('scende',m.x,m.y);PK.fly.push({m,pk:m.wait.pk,t:0});m.wait=null}}
  for(const v of VALVES){if(v.t>=0){v.t+=dt;v.rot+=dt*(v.t<1.4?6:.0)}if(POWER&&v.smk&&Math.random()<dt*.4)suono('sbuffo',v.x,v.y)}
  for(const f of FORGE){f.light.a=POWER?(f.st==='lavora'?.6:.32)+.06*Math.sin(W.t*5):0;f.rot+=dt*(POWER?(f.st==='lavora'?5:1.2):0);
    if(f.st==='lavora'){f.t+=dt;const n=Math.floor(f.t/(FG.lavora/6));if(n>f.hit&&n<=6){f.hit=n;suono('maglio',f.x,f.y);ZM.barriere&&burstSparks(f)}
      if(f.t>=FG.lavora){f.st='pronta';f.t=0;suono('pronta',f.x,f.y);W.toast=['L\'arma è pronta: '+f.item.nome,2.6]}}}
  for(const fl of PK.fly){fl.t+=dt;if(fl.t>=.9&&!fl.done){fl.done=1;drink(fl.pk)}}PK.fly=PK.fly.filter(f=>f.t<1);
  for(const r of PK.rings)r.t+=dt;PK.rings=PK.rings.filter(r=>r.t<.7);for(const a of ARCS)a.t+=dt;for(let i=ARCS.length-1;i>=0;i--)if(ARCS[i].t>.18)ARCS.splice(i,1);
  // il vampiro e l'impulso: la vita che scende per un colpo
  if(D&&D.st!=='fine'){PK.pushCd-=dt;if(PK.lastHp!=null&&D.hp<PK.lastHp-.5&&!h.dead&&has('impulso')&&PK.pushCd<=0&&Math.random()<EL.pushP){PK.pushCd=EL.pushCd;impulse()}PK.lastHp=D.hp}
  drawUI()}
function burstSparks(f){const B=ZM.barriere;if(!B||!B.FX)return;for(let i=0;i<(LOWFX?3:9);i++){const a=rr(-Math.PI,0),v=rr(40,110);B.FX.push({k:'scintilla',x:f.anvil[0],y:f.anvil[1],z:14,vx:Math.cos(a)*v,vy:rr(-20,30),vz:rr(40,120),r:rr(.8,1.8),t:0,T:rr(.3,.6),rot:rr(0,TAU),vr:rr(-10,10)})}}
function drawTop(){const h=W.hero;
  // la boccetta che vola dallo scivolo all'eroe
  for(const fl of PK.fly){const k=ez(Math.min(1,fl.t/.9)),a=S(fl.m.chute[0],fl.m.chute[1],24),b=S(h.x,h.y,(h.zh||0)+40),x=lerp(a[0],b[0],k),y=lerp(a[1],b[1],k)-Math.sin(k*Math.PI)*36;
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow(hexRgb(fl.pk.col),x,y,14,.5);ctx.restore()}bottle(ctx,x,y,.62,fl.pk.col,fl.pk.sym,1-Math.max(0,fl.t-.85)*6)}
  // gli anelli (elisir bevuto, arma forgiata, impulso, colpi delle armi forgiate)
  for(const r of PK.rings){const k=r.t/.7,q=S(r.x,r.y,r.small?20:4),R=r.small?4+k*12:r.big?20+k*120:14+k*40;ctx.save();ctx.globalAlpha=(1-k)*(r.small?.9:.8);ctx.strokeStyle=r.col;ctx.lineWidth=r.small?1.6:2.6;ctx.beginPath();ctx.ellipse(q[0],q[1],R,R*(r.small?.8:.55),0,0,TAU);ctx.stroke();ctx.restore()}
  // gli archi viola che saltano tra gli zombie (livello 2)
  for(const a of ARCS){const p=S(a.a),q=S(a.b),n=6;let s=a.sd;const r=()=>{s=(s*16807+7)%2147483647;return s/2147483647};ctx.save();if(!LOWFX)ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(212,139,255,${1-a.t/.18})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p[0],p[1]);
    for(let i=1;i<n;i++){const k=i/n;ctx.lineTo(lerp(p[0],q[0],k)+(r()-.5)*10,lerp(p[1],q[1],k)+(r()-.5)*10)}ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore()}}
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__mac)return D;D.__mac=1;
  const _u=D.update;D.update=(dt,on)=>{_u(dt,on);try{update(dt)}catch(e){console.error(e)}};
  const _t=D.drawTop;D.drawTop=dt=>{_t(dt);try{drawTop()}catch(e){}};
  // il vampiro: ogni sparo a segno ridà un po' di vita
  const _sh=D.shotHit;D.shotHit=()=>{_sh();if(has('vampiro')&&!W.hero.dead)D.hp=Math.min(D.PZ.vita,D.hp+EL.vamp)};
  // una partita nuova: niente elisir, la vita di prima, la caldaia spenta, la Forgia fredda e chiusa, l'arma non più sull'incudine
  const _r=D.reset;D.reset=()=>{_r();if(PK.vbase!=null&&D.PZ.vita===PK.boost){D.PZ.vita=PK.vbase;D.hp=PK.vbase}Object.assign(PK,{own:[],vbase:null,boost:null,lastHp:null,pushCd:0,fly:[],rings:[],uk:null});ARCS.length=0;
    POWER=false;for(const v of VALVES){v.t=-1;v.rot=0;if(v.smk){const i=smokes.indexOf(v.smk);if(i>=0)smokes.splice(i,1);v.smk=null}}
    for(const f of FORGE){f.st='fredda';f.t=0;f.item=null;f.open=false;f.rot=0;f.hit=0;if(f.smk){const i=smokes.indexOf(f.smk);if(i>=0)smokes.splice(i,1);f.smk=null}}W.hero.unarmed=false;for(const m of ELI){m.use=0;m.spin=0;m.wait=null}if(PK.ui)drawUI()};return D}}
ZM.macchine={PERK,PK,EL,FG,ELI,FORGE,VALVES,power:()=>POWER,setPower:v=>{if(v&&!POWER&&VALVES[0])power(VALVES[0]);else POWER=!!v},drink,has,nomeF,bottle}})();
