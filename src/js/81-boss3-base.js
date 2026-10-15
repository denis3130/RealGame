// =====================================================================
// I 4 BOSS DEL TERZO GIRO NEL GIOCO (Denis, 14 ottobre: «ok perfetto riporta tutto sul gioco», dopo averli visti su carta): le arene
// 9–12 hanno i loro custodi, disegnati in 3D in sprite/nemici3d/boss3.js. Il Burattinaio d'Ombra nella Cripta delle Ombre, la Fenice
// della Forgia nella Forgia degli Dei, la Piovra della Palude nella Palude Maledetta, il Cervo d'Aurora sulla Vetta di Mossbound.
// Questo file li collega al gioco:
// - l'arena sceglie il boss (ARENAS[i].bt); la stanza resta quella del mondo, con un cerchio di rune suo (B3V);
// - l'entrata e la sconfitta le recitano i modelli ('enter', 'die'), con il loro tempo; la barra si rompe a modo suo, la musica è sua;
// - i pericoli nuovi che usano: il filo che spazza la stanza, l'inchiostro, le tende d'aurora, i proiettili (ombre, piume, cristalli),
//   e il burattino d'ombra (il servitore del Burattinaio).
// Le mosse di ogni boss stanno nei file 82–85 (EUPD), la musica nell'86. Ogni stato del boss ha il nome di una mossa del modello
// (prep, slam, strings…): la mossa si vede da sola (64-nemici-3d.js, n3Move) e il colpo vero parte nel suo fotogramma (b3at).
// =====================================================================
const B3T=['puppeteer','phoenix','octopus','stag'],B3S=new Set(B3T);
for(const t of B3T)BOSSES.add(t);
Object.assign(ET,{
  puppeteer:{r:26,hp:6000,cdmg:22,gold:120,name:"Il Burattinaio d'Ombra",title:'Il teatro delle ombre'},
  phoenix:{r:24,hp:6600,cdmg:24,gold:130,name:'La Fenice della Forgia',title:'Rinasce dalla sua cenere'},
  octopus:{r:30,hp:7000,cdmg:24,gold:140,name:'La Piovra della Palude',title:'Signora dello stagno maledetto'},
  stag:{r:30,hp:7600,cdmg:22,gold:160,name:"Il Cervo d'Aurora",title:'Il custode della vetta'},
  puppet:{r:10,hp:32,cdmg:8,gold:1,name:"Burattino d'ombra"}});
Object.assign(ECOL,{puppeteer:'#6a40b0',phoenix:'#ff6a1f',octopus:'#3aa89a',stag:'#e8f4f0',puppet:'#4a2a7a'});
Object.assign(XPV,{puppeteer:100,phoenix:100,octopus:110,stag:120,puppet:1});
Object.assign(MAT_OF,{puppeteer:'spirit',puppet:'spirit',phoenix:'flesh',octopus:'goo',stag:'flesh'});
// the entrance lasts as long as the model's 'enter' move
Object.assign(BOSS_INTRO,{puppeteer:2.4,phoenix:2.6,octopus:3,stag:2.8});
// ---- the arenas: who guards each one (the room's world stays the same: crypt, forge, swamp, ice)
ARENAS[8].bt='puppeteer';ARENAS[8].d="Il Burattinaio d'Ombra tira i fili nel buio. Oro +96%.";
ARENAS[9].bt='phoenix';ARENAS[9].d='La Fenice rinasce nel fuoco degli dei. Oro +108%.';
ARENAS[10].bt='octopus';ARENAS[10].d="La Piovra regna sull'acqua maledetta. Oro +120%.";
ARENAS[11].bt='stag';ARENAS[11].d="Il Cervo d'Aurora veglia sulla cima del mondo. Oro +132%.";
// the boss of room n in this run, when it is one of the new ones (arena mode only: the Abyss and the daily challenge keep theirs)
function boss3At(n){if(!G||G.mode==='inf'||G.daily)return null;if((n==null?G.room:n)<ROOMS)return null;const A=ARENAS[G.arena||0];return A&&A.bt||null}
{const _cf=compositionFor;compositionFor=function(n){const bt=boss3At(n);if(bt&&!G.event)return[bt];return _cf.apply(this,arguments)}}
// ---- the boss room: the room of its world with a circle of runes of its own (no Witch's altar, the pool stays for the Octopus)
const B3V={puppeteer:{n:'Teatro delle Ombre',rune:'ombre',roots:6,bones:3,cracks:4},phoenix:{n:'Nido della Fenice',rune:'fenice',lavaCracks:8,grates:4},
  octopus:{n:'Stagno della Piovra',rune:'piovra',pool:1,reeds:8,bones:2,mud:3},stag:{n:"Prato dell'Aurora",rune:'aurora',icep:4,veins:4,snow:6}};
Object.assign(RUNEC,{ombre:['170,110,255','255,95,200'],fenice:['255,150,60','120,200,255'],piovra:['110,230,210','255,90,220'],aurora:['140,255,200','200,150,255']});
{const _be=buildEnv;buildEnv=function(){_be.apply(this,arguments);const bt=boss3At(G.room);if(bt&&!G.event&&B3V[bt])G.variant=Object.assign({},B3V[bt])}}
// ---- the music: its own theme (tracks in 86-musiche-boss3.js), with the hit of its world when it shows up and its victory chord
Object.assign(BMS,{puppeteer:{m:'burattinaio',ch:[57,60,64],win:[57,61,64,69],fl:'bell'},phoenix:{m:'fenice',ch:[60,64,67],win:[60,64,67,72],fl:'fire'},
  octopus:{m:'piovra',ch:[55,58,62],win:[55,59,62,67],fl:'water'},stag:{m:'cervo',ch:[62,66,69],win:[62,66,69,74],fl:'crystal'}});
for(const t of B3T)BMTRACK[BMS[t].m]=t;
{const _mf=musicFor;musicFor=function(room){const m=_mf.apply(this,arguments),bt=G&&room===G.room?boss3At(room):null;if(bt&&!G.event&&BM.pend)BM.pend=BMS[bt].m;return m}}
// ---- moves: the time inside the move (in the model's seconds: the boss's dt already carries its speed) and «has it just passed p?»
const B3D=(e,a)=>(N3.meta[e.type]&&N3.meta[e.type].dur&&N3.meta[e.type].dur[a])||1;
function b3go(e,st,dur){e.st=st;e.sub='';e.stT=dur==null?B3D(e,st):dur;e.mt=0;e.s3=null;e.mdt=0}
function b3tick(e,dt){e.mdt=dt;e.mt=(e.mt||0)+dt;e.stT-=dt}
const b3k=e=>(e.mt||0)/B3D(e,e.st);
function b3at(e,p){const D=B3D(e,e.st),k1=(e.mt||0)/D,k0=((e.mt||0)-(e.mdt||0))/D;return k0<p&&k1>=p}
// the point where a body-space spot of the model lands in the room (forward = x, left = y), with the face it is drawn with
function b3pt(e,bx,by,face){const f=face!=null?face:e.f3!=null?e.f3:(e.face||0),V0=C3.V(f),q=V0.P([bx,by,0]);return{x:e.x+q[0],y:e.y+8+q[1]}}
// a free spot near (x,y) inside the room, away from the obstacles
function b3spot(x,y,r,tries){for(let i=0;i<(tries||16);i++){const a=rand(0,TAU),d=i?rand(0,r):0,tx=clamp(x+Math.cos(a)*d,L+34,R-34),ty=clamp(y+Math.sin(a)*d,TOP+44,BOT-44);
    if(!G.rocks.some(k=>Math.hypot(k.x-tx,k.y-ty)<k.r+30))return{x:tx,y:ty}}return{x:clamp(x,L+34,R-34),y:clamp(y,TOP+44,BOT-44)}}
// the phase change at half health, the same for all four: banner, rage, the bar goes red
function b3phase(e,title,rgb,snd){if(e.p2||e.hp>=e.max*.5)return false;e.p2=true;banner(title,'Fase 2',1.6);bossRage(e,rgb);$('bossBar').classList.add('rage');shake(8);sfx(snd||'roar',0,e.x);return true}
// ---- the entrance: the model plays 'enter' over the whole of it (its own clock, not the boss speed); the halo and the aura wait until it
// has really arrived (e.em just under 1 hides them, see 51-boss2-mondi.js)
const B3IN={};
{const _bi=bossIntro3;bossIntro3=function(e,t,t0,at,roar){if(B3S.has(e.type)&&B3IN[e.type]){e.st='enter';try{B3IN[e.type](e,t,t0,at,roar)}catch(err){}return true}return _bi.apply(this,arguments)}}
{const _nm=n3Move;n3Move=function(e){if(B3S.has(e.type)&&e.intro>0)return['enter',Math.min(.999,Math.max(0,(e.iT||0)/(BOSS_INTRO[e.type]||2.4)))];return _nm.apply(this,arguments)}}
// ---- the defeat: no photo cut in pieces, the model itself plays 'die' (its whole length), with the particles of each boss (B3DIE)
Object.assign(BDEATH,{puppeteer:{dur:3.4,clou:1.05,snd:'magic'},phoenix:{dur:3.6,clou:1.25,snd:'ignite'},octopus:{dur:3.6,clou:1.1,snd:'bubble'},stag:{dur:4,clou:1.5,snd:'shimmer'}});
const B3DIE={};
{const _sb=snapBoss;snapBoss=function(e){if(B3S.has(e.type))return{live:1};return _sb.apply(this,arguments)}}
for(const t of B3T)BDIE[t]={setup(c){const e=c.e;b3reset();c.face=e.f3!=null?e.f3:(e.face||Math.PI/2);c.p2=!!e.p2;c.live=1;const X=B3DIE[t];if(X&&X.setup)X.setup(c)},
  tick(c,dt,D){const X=B3DIE[t];if(X&&X.tick)X.tick(c,dt,D,Math.min(1,c.t/c.dur))},
  draw(c,D){const p=Math.min(.999,c.t/c.dur),M=N3.meta[t];try{N3[t](c.x,c.y+8,c.face,'die',p,(M&&M.sc)||1,{p2:c.p2,noFx:LOWFX})}catch(err){}const X=B3DIE[t];if(X&&X.draw)X.draw(c,p)}};
{const _dc=drawCorpse;drawCorpse=function(c){if(!B3S.has(c.type))return _dc.apply(this,arguments);try{BDIE[c.type].draw(c,BDEATH[c.type])}catch(err){}drawParts(c)}}
// ---- the bar breaks in its own way; the halo, the aura and the charge ring of the bosses (51-boss2-mondi.js)
Object.assign(BBFX,{puppeteer:{c:'#3e2470',f:'#ffd84a',k:'rise',s:'magic'},phoenix:{c:'#a8341a',f:'#ffd84a',k:'rise',s:'ignite'},octopus:{c:'#1e6a66',f:'#9ff0e0',k:'burst',s:'splash'},
  stag:{c:'#2a6a5a',f:'#e0fff4',k:'rise',s:'shimmer'}});
Object.assign(B2H,{puppeteer:72,phoenix:66,octopus:58,stag:86});
Object.assign(B2T,{puppeteer:[['150,90,230','255,95,200'],'210,160,255'],phoenix:[['255,140,50','120,200,255'],'255,210,130'],octopus:[['90,210,190','255,90,220'],'170,255,230'],
  stag:[['170,255,220','200,160,255'],'220,255,240']});
for(const t of B3T)B2[t]=B2[t]||{br:1.4,bra:.01};
{const _au=b2aura;b2aura=function(e,dt){if(!B3S.has(e.type))return _au.apply(this,arguments);const t=e.type;
  if(t==='puppeteer'&&b2every(e,'au',.16,dt))b2emit(e,{k:'mote',e,a:rand(0,TAU),rad:e.r*rand(1,1.6),h0:rand(0,30),life:1.4,col:e.p2?'255,120,210':'190,140,255'});
  else if(t==='phoenix'&&b2every(e,'au',.08,dt))b2emit(e,{k:'ember',x:e.x+rand(-22,22),y:e.y-rand(4,46),vx:rand(-10,10),vy:-rand(30,55),life:rand(.6,1)});
  else if(t==='octopus'&&b2every(e,'au',.2,dt))b2emit(e,{k:'bubble',x:e.x+rand(-40,40),y:e.y+rand(-6,8),vy:-rand(6,12),life:.9,r:rand(1.6,3.2),col:e.p2?'255,140,230':'170,255,230'});
  else if(t==='stag'&&b2every(e,'au',.12,dt))b2emit(e,{k:'glint',x:e.x+rand(-34,34),y:e.y-rand(20,90),life:.5,r:3.5,col:e.p2?'210,170,255':'190,255,225'})}}
// the generic extra ring of the high arenas stays off for these four: they have their own patterns, and the room must stay readable
{const _bx=bossExtra;bossExtra=function(e){if(B3S.has(e.type))return;return _bx.apply(this,arguments)}}
// ---- the bestiary and the achievements
BEST.push(['puppeteer',"Il Burattinaio d'Ombra",'Boss. Manate che fanno tremare il pavimento, un filo di luce che spazza la stanza (scatta o nasconditi dietro un ostacolo), burattini che escono da terra, e sparisce in una pozza d\'ombra.'],
  ['phoenix','La Fenice della Forgia','Boss. Ventagli di piume di fuoco, picchiate in linea retta, vortici e pioggia di braci. A metà vita rinasce dall\'uovo con le fiamme azzurre.'],
  ['octopus','La Piovra della Palude','Boss. Tentacolate, palle d\'inchiostro che rallentano, un gorgo che ti tira a sé; si immerge e riemerge sotto di te.'],
  ['stag',"Il Cervo d'Aurora",'Boss. Raspa e carica, lancia cristalli, fa scendere tende d\'aurora e si impenna per un anello di ghiaccio.'],
  ['puppet',"Burattino d'ombra",'Esce da terra appeso ai fili del Burattinaio: saltella verso di te. Quando il Burattinaio cade, i fili si spezzano.']);
{const qi=ACH.findIndex(a=>a.id==='queen')+1;ACH.splice(qi,0,
  {id:'pupp',n:'Il sipario cala',d:"Sconfiggi il Burattinaio d'Ombra",v:s=>s.bosses.puppeteer||0,g:1,title:'Tagliafili'},
  {id:'phoe',n:'Dalla cenere',d:'Sconfiggi la Fenice della Forgia',v:s=>s.bosses.phoenix||0,g:1,title:'Domafenici'},
  {id:'octo',n:'Inchiostro asciutto',d:'Sconfiggi la Piovra della Palude',v:s=>s.bosses.octopus||0,g:1,title:'Signore degli abissi'},
  {id:'stag',n:'Aurora di Mossbound',d:"Sconfiggi il Cervo d'Aurora",v:s=>s.bosses.stag||0,g:1,title:'Custode della vetta'})}
Object.assign(ACH_R,{pupp:30,phoe:30,octo:35,stag:50});

// =====================================================================
// THE NEW DANGERS
// =====================================================================
// shots: shadow orbs (violet, a yellow spark inside), fire feathers (blue after the rebirth), ink drops, aurora crystals
Object.assign(TRC,{shadow:'170,110,255',feather:'255,150,60',featherb:'120,200,255',inkb:'90,70,140',crystal:'150,255,210'});
Object.assign(EPDRAW,{
  shadow:p=>{glow('150,90,230',p.x,p.y,p.r*2.8,.45);ink(1.8);circ(p.x,p.y,p.r);fs('#3e2470');ctx.fillStyle='rgba(255,216,74,.9)';circ(p.x+Math.cos(p.a)*p.r*.3,p.y+Math.sin(p.a)*p.r*.3-p.r*.2,p.r*.32);ctx.fill();
    ctx.fillStyle='rgba(220,190,255,.55)';circ(p.x-p.r*.35,p.y-p.r*.4,p.r*.26);ctx.fill()},
  feather:p=>b3feather(p,['#ff7a24','#ffd84a','#e8361c'],'255,140,40'),
  featherb:p=>b3feather(p,['#7fc8ff','#e8f8ff','#3a8ae8'],'120,200,255'),
  inkb:p=>{glow('90,70,140',p.x,p.y,p.r*2.2,.3);ink(1.6);ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*1.15,p.r*.95,p.a,0,TAU);fs('#2a2244');ctx.fillStyle='rgba(180,170,230,.7)';circ(p.x-p.r*.35,p.y-p.r*.35,p.r*.3);ctx.fill()},
  crystal:p=>{glow('150,255,210',p.x,p.y,p.r*2.6,.4);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ink(1.6);ctx.beginPath();ctx.moveTo(p.r*2,0);ctx.lineTo(-p.r*.3,-p.r*.8);ctx.lineTo(-p.r*1.3,0);ctx.lineTo(-p.r*.3,p.r*.8);ctx.closePath();
    const g=ctx.createLinearGradient(-p.r,0,p.r*2,0);g.addColorStop(0,'#7fe8c8');g.addColorStop(.6,'#e0fff4');g.addColorStop(1,'#c8b0ff');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.restore()}});
function b3feather(p,C,rgb){glow(rgb,p.x,p.y,p.r*2.8,.45);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ink(1.6);ctx.beginPath();ctx.moveTo(p.r*2.2,0);ctx.quadraticCurveTo(p.r*.6,-p.r*1.05,-p.r*1.5,-p.r*.35);
  ctx.lineTo(-p.r*1.2,0);ctx.lineTo(-p.r*1.5,p.r*.35);ctx.quadraticCurveTo(p.r*.6,p.r*1.05,p.r*2.2,0);ctx.closePath();const g=ctx.createLinearGradient(-p.r*1.5,0,p.r*2.2,0);g.addColorStop(0,C[2]);g.addColorStop(.5,C[0]);g.addColorStop(1,C[1]);
  ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.r*1.8,0);ctx.lineTo(-p.r*1.1,0);ctx.stroke();ctx.restore()}
// beams (G.lines with a colour): the golden thread, fire (and blue fire), water, aurora
const B3BEAM={gold:['255,210,90','255,250,220'],fire:['255,110,30','255,220,140'],blue:['80,160,255','220,245,255'],water:['70,190,200','210,255,250'],aurora:['90,240,180','230,200,255']};
{const _db=drawBeamLine;drawBeamLine=function(l){const C=B3BEAM[l.col];if(!C)return _db.apply(this,arguments);ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);
  if(l.warn>0){ctx.fillStyle=`rgba(${C[0]},${.12+.1*Math.sin(G.t*22)})`;ctx.fillRect(0,-l.w/2,l.len,l.w);ctx.strokeStyle=`rgba(${C[0]},.75)`;ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(0,-l.w/2,l.len,l.w);ctx.setLineDash([])}
  else{const k=Math.max(0,l.act/(l.act0||.3));ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,-l.w/2,0,l.w/2);g.addColorStop(0,`rgba(${C[0]},0)`);g.addColorStop(.5,`rgba(${C[1]},${.95*k})`);g.addColorStop(1,`rgba(${C[0]},0)`);
    ctx.fillStyle=g;ctx.fillRect(0,-l.w/2,l.len,l.w);ctx.fillStyle=`rgba(255,255,255,${.75*k})`;ctx.fillRect(0,-1.2,l.len,2.4)}
  ctx.restore()}}
// ink puddles: they slow you like slime (kind 'slime' + ink), dark violet with an oily sheen
{const _sz=drawSoftZone;drawSoftZone=function(z,a){if(!z.ink)return _sz.apply(this,arguments);const g=ctx.createRadialGradient(z.x,z.y,z.r*.1,z.x,z.y,z.r);g.addColorStop(0,`rgba(28,20,48,${.75*a})`);g.addColorStop(.8,`rgba(40,30,70,${.55*a})`);g.addColorStop(1,`rgba(60,50,100,0)`);
  ctx.fillStyle=g;ell(z.x,z.y,z.r,z.r*.6);ctx.fill();ctx.fillStyle=`rgba(190,170,255,${.3*a})`;ell(z.x-z.r*.3,z.y-z.r*.18,z.r*.3,z.r*.1);ctx.fill();ctx.fillStyle=`rgba(120,230,210,${.2*a})`;ell(z.x+z.r*.25,z.y+z.r*.1,z.r*.18,z.r*.06);ctx.fill()}}
// the rest lives in G.b3: the threads that sweep the room, the aurora curtains, the ink blobs in flight, the warnings on the floor
function b3reset(){if(G)G.b3={thr:[],aur:[],lob:[],warn:[]}}
{const _br=buildRoom;buildRoom=function(){b3reset();return _br.apply(this,arguments)}}
// a golden thread across the whole room, perpendicular to a, that runs away from (x,y): s grows at sp px/s up to far, then (back) comes home
function b3thread(x,y,a,sp,dmg,o){o=o||{};const ca=Math.cos(a),sa=Math.sin(a),far=Math.max(...[[L,TOP],[R,TOP],[L,BOT],[R,BOT]].map(([cx,cy])=>(cx-x)*ca+(cy-y)*sa))+30;
  G.b3.thr.push({x,y,a,s:o.s0||20,sp,dmg:Math.round(dmg*DMG()),far,back:!!o.back,dir:1,hit:false,t:0,rgb:o.rgb||'255,233,160'})}
// an aurora curtain: a band of light that hangs in the sky (warn), sways, comes down (act) and fades
function b3curtain(pos,h,w,warn,dmg){G.b3.aur.push({pos,h,w,warn,warn0:warn,act:.5,dmg:Math.round(dmg*DMG()),hit:false,ph:rand(0,TAU)})}
// an ink blob thrown in an arc: lands after dur, leaves a puddle that slows
function b3ink(sx,sy,tx,ty,dur,r,dmg,o){o=o||{};G.b3.lob.push({sx,sy,tx:clamp(tx,L+14,R-14),ty:clamp(ty,TOP+14,BOT-14),t:-(o.delay||0),dur,r,dmg:Math.round(dmg*DMG()),h:o.h||80,p2:!!o.p2})}
// a warning on the floor (a circle that fills, or a ring), time t
function b3warn(x,y,r,t,rgb,ring){G.b3.warn.push({x,y,r,t,max:t,rgb:rgb||'229,72,77',ring:!!ring})}
// a warning band on the floor from (x,y) along a (len long, w wide); centred on (x,y) when mid
function b3wline(x,y,a,len,w,t,rgb,mid){G.b3.warn.push({line:true,x,y,a,len,w,t,max:t,rgb:rgb||'229,72,77',mid:!!mid})}
// is the hero hidden behind an obstacle from the thread h (an obstacle just upstream of the hero, on the same line of travel)?
function b3cover(h){const ca=Math.cos(h.a),sa=Math.sin(h.a),pd=(P.x-h.x)*ca+(P.y-h.y)*sa,pl=(P.y-h.y)*ca-(P.x-h.x)*sa;
  for(const k of G.rocks){const kd=(k.x-h.x)*ca+(k.y-h.y)*sa,kl=(k.y-h.y)*ca-(k.x-h.x)*sa,up=(pd-kd)*h.dir;if(up>0&&up<k.r+70&&Math.abs(kl-pl)<k.r+2)return true}return false}
function b3update(dt){if(!G||!G.b3)return;const B=G.b3;if(G.state!=='play'){if(B.thr.length||B.aur.length||B.lob.length||B.warn.length)b3reset();return}
  for(let i=B.thr.length-1;i>=0;i--){const h=B.thr[i];h.t+=dt;const s0=h.s;h.s+=h.sp*dt*h.dir;const ca=Math.cos(h.a),sa=Math.sin(h.a),dp=(P.x-h.x)*ca+(P.y-h.y)*sa;
    if(!h.hit&&(dp-s0)*(dp-h.s)<=0&&P.inv<=0&&P.dashT<=0&&!b3cover(h)){h.hit=true;hurtP(h.dmg)}
    // out of the room: gone, or back home once (the second pass can hit again)
    if(h.dir>0&&h.s>h.far){if(h.back){h.dir=-1;h.hit=false;h.back=false;sfx('shimmer',1,P.x)}else{B.thr.splice(i,1);continue}}
    if(h.dir<0&&h.s<10)B.thr.splice(i,1)}
  for(let i=B.aur.length-1;i>=0;i--){const c=B.aur[i];if(c.warn>0){c.warn-=dt;if(c.warn<=0){shake(2);sfx('shimmer',2,c.h?AW/2:c.pos)}continue}c.act-=dt;
    const inside=c.h?Math.abs(P.y-c.pos)<c.w/2+P.r*.5:Math.abs(P.x-c.pos)<c.w/2+P.r*.5;if(inside&&!c.hit&&c.act>.1&&P.inv<=0&&P.dashT<=0){c.hit=true;hurtP(c.dmg)}
    if(c.act<=0)B.aur.splice(i,1)}
  for(let i=B.lob.length-1;i>=0;i--){const b=B.lob[i];b.t+=dt;if(b.t<b.dur)continue;B.lob.splice(i,1);
    G.zones.push({x:b.tx,y:b.ty,r:b.r*1.15,t:4.5,max:4.5,kind:'slime',ink:true});vfxBlast(b.tx,b.ty,'70,50,120',b.r*1.4,{sparks:8,spcol:['#3a2a6a','#8a7ae0','#2a2244'],dust:0,ring2:false});sfx('splash',0,b.tx);
    if(Math.hypot(P.x-b.tx,P.y-b.ty)<b.r+P.r*.4)hurtP(b.dmg)}
  for(let i=B.warn.length-1;i>=0;i--){const w=B.warn[i];w.t-=dt;if(w.t<=0)B.warn.splice(i,1)}}
{const _u=update;update=function(dt){_u.apply(this,arguments);try{if(G&&G.b3&&started&&!paused)b3update(dt)}catch(err){}}}
// on the floor: the warnings, the shadows of the ink blobs, the aurora curtains' marks while they hang in the sky
function b3ground(){if(!G||!G.b3)return;const B=G.b3;
  for(const w of B.warn){const k=1-w.t/w.max;if(w.line){ctx.save();ctx.beginPath();ctx.rect(L,TOP,R-L,BOT-TOP);ctx.clip();ctx.translate(w.x,w.y);ctx.rotate(w.a);const x0=w.mid?-w.len/2:0;
      ctx.fillStyle=`rgba(${w.rgb},${.07+.16*k})`;ctx.fillRect(x0,-w.w/2,w.len,w.w);ctx.strokeStyle=`rgba(${w.rgb},${.45+.3*Math.sin(G.t*18)})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(x0,-w.w/2,w.len,w.w);ctx.setLineDash([]);ctx.restore();continue}
    ctx.strokeStyle=`rgba(${w.rgb},${.55+.3*Math.sin(G.t*18)})`;ctx.lineWidth=2.5;ell(w.x,w.y,w.r,w.r*.6);ctx.stroke();if(!w.ring){ctx.fillStyle=`rgba(${w.rgb},${.08+.25*k})`;ell(w.x,w.y,w.r*k,w.r*k*.6);ctx.fill()}}
  for(const b of B.lob){if(b.t<0)continue;const p=clamp(b.t/b.dur,0,1);ctx.strokeStyle='rgba(120,90,200,.75)';ctx.lineWidth=2.5;circ(b.tx,b.ty,b.r);ctx.stroke();ctx.fillStyle=`rgba(60,40,110,${.08+p*.3})`;circ(b.tx,b.ty,b.r*p);ctx.fill()}
  for(const c of B.aur){const rect=c.h?[L,c.pos-c.w/2,R-L,c.w]:[c.pos-c.w/2,TOP,c.w,BOT-TOP];
    if(c.warn>0){const k=1-c.warn/c.warn0;ctx.fillStyle=`rgba(120,255,200,${.06+.12*k+.05*Math.sin(G.t*14+c.ph)})`;ctx.fillRect(...rect);ctx.strokeStyle=`rgba(150,255,210,${.4+.3*k})`;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(...rect);ctx.setLineDash([])}}}
// in the air: the threads, the curtains, the ink blobs
function b3air(){if(!G||!G.b3)return;const B=G.b3;
  for(const h of B.thr){const ca=Math.cos(h.a),sa=Math.sin(h.a),cx=h.x+ca*h.s,cy=h.y+sa*h.s,nx=-sa,ny=ca,ext=900,ax=cx+nx*ext,ay=cy+ny*ext,bx=cx-nx*ext,by=cy-ny*ext;
    ctx.save();ctx.beginPath();ctx.rect(L-4,TOP-4,R-L+8,BOT-TOP+8);ctx.clip();ctx.lineCap='round';
    if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${h.rgb},.28)`;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();ctx.globalCompositeOperation='source-over'}
    ctx.strokeStyle='rgba(40,20,10,.55)';ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(ax,ay+3);ctx.lineTo(bx,by+3);ctx.stroke();
    ctx.strokeStyle=`rgba(255,250,225,.95)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
    // little beads of light running along it
    if(!LOWFX){ctx.fillStyle=`rgba(${h.rgb},.9)`;for(let k=-6;k<=6;k++){const d=k*70+((G.t*120)%70);circ(cx+nx*d,cy+ny*d,1.8);ctx.fill()}}
    ctx.restore()}
  for(const c of B.aur){const rect=c.h?[L,c.pos-c.w/2,R-L,c.w]:[c.pos-c.w/2,TOP,c.w,BOT-TOP];ctx.save();ctx.globalCompositeOperation='lighter';
    if(c.warn>0){// hanging high: a soft ribbon that sways and slowly comes down
      const k=1-c.warn/c.warn0,drop=(1-k)*70;for(let i=0;i<3;i++){const x0=c.h?rect[0]:c.pos+Math.sin(G.t*2+c.ph+i)*c.w*.25,y0=c.h?c.pos-drop+Math.sin(G.t*2+c.ph+i)*6:rect[1]-drop;
        const g=c.h?ctx.createLinearGradient(0,y0-c.w,0,y0+c.w*.3):ctx.createLinearGradient(x0-c.w/2,0,x0+c.w/2,0);g.addColorStop(0,'rgba(90,240,180,0)');g.addColorStop(.5,`rgba(${i%2?'200,150,255':'110,255,190'},${.10+.12*k})`);g.addColorStop(1,'rgba(90,240,180,0)');
        ctx.fillStyle=g;if(c.h)ctx.fillRect(rect[0],y0-c.w,rect[2],c.w*1.3);else ctx.fillRect(x0-c.w/2,y0,c.w,rect[3])}}
    else{const k=Math.max(0,c.act/.5);const g=c.h?ctx.createLinearGradient(0,c.pos-c.w/2,0,c.pos+c.w/2):ctx.createLinearGradient(c.pos-c.w/2,0,c.pos+c.w/2,0);
      g.addColorStop(0,'rgba(90,240,180,0)');g.addColorStop(.35,`rgba(140,255,210,${.75*k})`);g.addColorStop(.6,`rgba(210,170,255,${.7*k})`);g.addColorStop(1,'rgba(90,240,180,0)');ctx.fillStyle=g;ctx.fillRect(...rect);
      ctx.fillStyle=`rgba(255,255,255,${.6*k})`;if(c.h)ctx.fillRect(rect[0],c.pos-1,rect[2],2);else ctx.fillRect(c.pos-1,rect[1],2,rect[3])}
    ctx.restore()}
  for(const b of B.lob){if(b.t<0)continue;const p=clamp(b.t/b.dur,0,1),x=b.sx+(b.tx-b.sx)*p,gy=b.sy+(b.ty-b.sy)*p,h=Math.sin(p*Math.PI)*b.h;shadow(x,gy+3,6*(.5+p*.5),2.5,.25);
    ink(1.8);ctx.beginPath();ctx.ellipse(x,gy-h,7,6,p*4,0,TAU);fs(b.p2?'#3a1a4a':'#2a2244');ctx.fillStyle='rgba(190,170,255,.6)';circ(x-2,gy-h-2,2);ctx.fill()}}
{const _g2=drawHazards2Ground;drawHazards2Ground=function(){_g2.apply(this,arguments);try{b3ground()}catch(err){}}}
{const _a2=drawHazards2Air;drawHazards2Air=function(){_a2.apply(this,arguments);try{b3air()}catch(err){}}}

// =====================================================================
// THE SHADOW PUPPET: hops toward you on its strings, now and then lifts its arms and throws a slow shadow orb; after 14 s its strings
// wear out and it falls; when its master falls, the strings snap and it falls too (82-burattinaio.js)
// =====================================================================
EUPD.puppet=(e,dt,sm,a,d)=>{e.cd=(e.cd==null?rand(1.6,2.6):e.cd)-dt*FR();e.life=(e.life==null?14:e.life)-dt;
  if(e.life<=0){if(!LOWFX)vfxBlast(e.x,e.y-8,'120,70,200',26,{sparks:4,spcol:['#ffd84a','#c8a0ff'],dust:4,ring2:false});killE(e,true);return}
  if(e.aim>0){e.moving=false;e.face=a;e.aim-=dt;if(e.aim<=0){shootE(e.x,e.y-14,a,120,6,10,'shadow');e.cd=rand(2.6,3.6)}return}
  const na=navAngle(e);e.face=na;const sp=(e.p2?68:56)*sm;moveCircle(e,Math.cos(na)*sp*dt,Math.sin(na)*sp*dt);e.moving=true;e.walk+=dt*10;
  if(e.cd<=0&&d<260)e.aim=.45};
