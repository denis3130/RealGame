// ---------- LE BARRIERE della mappa zombie (punti 18 e 19 del piano di Denis, anteprima 48): le finestre delle case, che gli zombie rompono per
// entrare (il vetro si rompe una volta sola, poi la finestra resta rotta) e che l'eroe sbarra con le assi; i varchi delle staccionate di legno
// e della cancellata di ferro, che gli zombie sfondano e l'eroe ripara (assi inchiodate, sbarre di ferro ribattute). Il motore (barrier,
// barCheck, barStep in motore.js) fa passare gli zombie: il campo della navigazione attraversa la barriera con un costo, lo zombie si ferma
// davanti, colpisce (ogni colpo rompe il vetro o strappa un'asse; una sbarra di ferro regge due colpi) e scavalca quando è aperta.
// L'eroe si avvicina e tiene premuto «Ripara»: a ogni asse il martello batte i chiodi (la mossa 'ripara' dell'Arciere 3D), il suono del legno
// o del ferro, le schegge o le scintille, e 10 monete (al massimo 120 a round, come in CoD). I colpi passano le finestre e le assi (si spara a
// chi sta rompendo), e un colpo rompe il vetro intatto. Tutti i numeri in BZ, da regolare giocando.
(()=>{const{P,W,S,rr,srand,cl,lerp,ez,TAU,prop,solid,shade,prismX,prismY,line3,ballAt,material,holes,buyable,barrier,ink,seg,ball}=ZM;
const BZ={vetro:{max:5,hold:.5,nome:'la finestra'},legno:{max:4,hold:.5,nome:'la staccionata'},ferro:{max:3,hold:.7,nome:'la cancellata',vita:2},
  monete:10,tetto:120};// monete per ogni asse rimessa, al massimo a round
material('plankN',['#a27c4e','#6e5232','#c8a06a'],'plank');// le assi nuove dell'eroe, più chiare di quelle vecchie
material('ironR',['#5a4034','#3a2820','#7e5a46'],'iron');// il ferro arrugginito
const ALL=[];
// ------------------------------------------------------------------ i suoni (forti vicino, piano lontano, a destra o a sinistra: ZM.audio.place)
function suono(w,x,y){try{if(typeof AU==='undefined'||!AU.ctx||!AU.on.sfx||AU.ctx.state!=='running')return;const P0=ZM.audio?ZM.audio.place(x,y):{k:1,rev:.2},k=P0.k,t=AU.ctx.currentTime+.01;if(k<.01)return;
  // (difetti 48) con l'audio carico (src/js/05-audio.js audioLv) meno schegge di vetro e il legno senza il secondo tonfo
  const lv=typeof audioLv==='function'?audioLv():0;
  if(w==='vetro'){fThump(t,320,110,.07,.22*k,.2);fNoise(t,.55,'highpass',4200,.7,.16*k,{rev:P0.rev});for(let i=0,n=lv>1?3:lv?5:11;i<n;i++)M.glass(t+.01+Math.random()*.42,(1-i*.06)*k,VR(1700+i*190,.18))}
  else if(w==='asse'){fNoise(t,.13,'bandpass',VR(1100,.15),1.3,.3*k);M.wood(t,1.1*k,VR(230,.08));fNoise(t+.02,.3,'bandpass',VR(480,.2),2.2,.1*k,{f2:220});if(!lv)M.wood(t+.34,.45*k,VR(170,.1))}
  else if(w==='ammacca'){M.metal(t,.9*k,VR(430,.06),.5);fThump(t,190,70,.1,.22*k)}
  else if(w==='sbarra'){M.metal(t,1.2*k,VR(300,.05),.9);fNoise(t,.42,'bandpass',VR(2400,.1),3,.12*k,{f2:900});M.metal(t+.32,.5*k,VR(620,.08),.4);M.metal(t+.44,.3*k,VR(700,.08),.3)}
  else if(w==='inchioda'){M.wood(t,.55*k,VR(260,.06));for(let i=0;i<3;i++){M.wood(t+.05+i*.11,.75*k,VR(430,.05));M.metal(t+.05+i*.11,.22*k,VR(1900,.05),.18)}}
  else if(w==='ribatte'){for(let i=0;i<3;i++){M.metal(t+i*.13,.7*k,VR(720,.05),.6);fNoise(t+i*.13,.05,'highpass',5200,.7,.06*k)}}
  else if(w==='sfonda'){fThump(t,120,40,.3,.5*k,.3);M.wood(t,1.2*k,VR(160,.08));fNoise(t,.5,'lowpass',900,.7,.3*k,{brown:true})}
  else if(w==='moneta')coinClink(t,.8)}catch(e){}}
// ------------------------------------------------------------------ i pezzi che volano: vetri, schegge, assi strappate, scintille (nel mondo, con la gravità)
const FX=[];
function burst(k,x,y,z,n,dir,sp){if(LOWFX)n=Math.ceil(n/3);for(let i=0;i<n;i++){const a=Math.atan2(dir[1],dir[0])+rr(-.9,.9),v=rr(.4,1)*(sp||70);
  FX.push({k,x,y,z:z+rr(-6,6),vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:k==='gesso'?rr(-10,20):rr(20,90),r:k==='asse'?rr(10,14):k==='vetro'?rr(1.4,3.2):k==='gesso'?rr(2,4):rr(.8,1.8),t:0,T:k==='scintilla'?rr(.25,.5):k==='asse'?1.6:rr(.7,1.2),rot:rr(0,TAU),vr:rr(-12,12),col:k==='asse'?(Math.random()<.5?'#6e5236':'#93714c'):null})}}
function fxStep(dt){for(const f of FX){f.t+=dt;f.vz-=320*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.rot+=f.vr*dt;if(f.z<0){f.z=0;f.vz*=-.3;f.vx*=.5;f.vy*=.5;f.vr*=.5}}for(let i=FX.length-1;i>=0;i--)if(FX[i].t>=FX[i].T)FX.splice(i,1)}
function fxDraw(){for(const f of FX){const q=S(f.x,f.y,f.z),a=Math.min(1,(f.T-f.t)/.3);ctx.save();ctx.globalAlpha*=a;ctx.translate(q[0],q[1]);ctx.rotate(f.rot);
  if(f.k==='vetro'){ctx.fillStyle='rgba(200,220,250,.8)';ctx.strokeStyle='rgba(20,24,34,.7)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-f.r,f.r*.6);ctx.lineTo(f.r*.3,-f.r);ctx.lineTo(f.r,f.r*.4);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(f.k==='asse'){ctx.fillStyle=f.col;ctx.fillRect(-f.r/2,-1.8,f.r,3.6);ink(1.2);ctx.strokeRect(-f.r/2,-1.8,f.r,3.6)}
  else if(f.k==='scintilla'){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,${190+Math.round(60*a)},90,1)`;ctx.fillRect(-f.r,-.5,f.r*2,1)}
  else if(f.k==='gesso'){ctx.fillStyle='rgba(236,232,220,.55)';ctx.beginPath();ctx.arc(0,0,f.r*(1+f.t*3),0,TAU);ctx.fill()}
  else{ctx.fillStyle=f.k==='truciolo'?'#c8a06a':'#8a7a62';ctx.fillRect(-f.r,-f.r*.4,f.r*2,f.r*.8)}ctx.restore()}}
// ------------------------------------------------------------------ una barriera: lo stato, i colpi degli zombie, la riparazione dell'eroe
// o: {kind 'vetro'|'legno'|'ferro', x, y, nx, ny (fuori), half, th, reach, n0 (assi o sbarre all'inizio, vecchie), glass (vetro intatto all'inizio),
// sol (il solido del vano), z (l'altezza dei pezzi che volano), onTex() (la finestra cambia faccia)}
function mkBar(o){const D=BZ[o.kind];const B=barrier({x:o.x,y:o.y,nx:o.nx,ny:o.ny,half:o.half,th:o.th,reach:o.reach,hop:o.hop,
  kind:o.kind,max:D.max,z:o.z||16,
  reset(){this.glass=!!o.glass;this.pl=Array.from({length:o.n0||0},()=>1);this.n=this.pl.length;this.hp=D.vita||1;this.used=false;this.tex()},
  tex(){if(o.onTex)o.onTex(this)},
  open(){return!this.glass&&this.n<=0},
  // passarla costa (in px di strada): aperta poco, col vetro o con le assi di più, il ferro ancora di più
  cost(){return this.open()?16:40+(this.glass?60:0)+this.n*(this.kind==='ferro'?60:30)},
  out(s){return[this.nx*s,this.ny*s]},
  // un colpo di zombie (z: chi colpisce; da che parte sta dice dove volano i pezzi)
  hit(z){const s=(z.x-this.x)*this.nx+(z.y-this.y)*this.ny>=0?-1:1,d=this.out(s);this.used=true;
    if(this.glass){this.glass=false;suono('vetro',this.x,this.y);burst('vetro',this.x,this.y,this.z+8,14,d,80);this.tex();return}
    if(this.n<=0)return;
    if(this.kind==='ferro'){if(--this.hp>0){suono('ammacca',this.x,this.y);burst('scintilla',this.x,this.y,this.z,6,d,90);return}this.hp=D.vita;this.n--;this.pl.pop();suono('sbarra',this.x,this.y);burst('scintilla',this.x,this.y,this.z,10,d,110)}
    else{this.n--;this.pl.pop();suono('asse',this.x,this.y);burst('asse',this.x,this.y,this.z+4,1,d,70);burst('scheggia',this.x,this.y,this.z,7,d,60)}
    this.tex()},
  // un boss la sfonda tutta in un colpo
  smash(z){if(this.open())return;this.glass=false;this.n=0;this.pl=[];this.used=true;const s=(z.x-this.x)*this.nx+(z.y-this.y)*this.ny>=0?-1:1,d=this.out(s);suono('sfonda',this.x,this.y);
    burst('asse',this.x,this.y,this.z,3,d,90);burst('scheggia',this.x,this.y,this.z,12,d,90);this.tex()},
  // un colpo dell'eroe che passa: il vetro intatto si rompe
  shot(){if(!this.glass)return;this.glass=false;suono('vetro',this.x,this.y);const h=W.hero,s=(h.x-this.x)*this.nx+(h.y-this.y)*this.ny>=0?-1:1;burst('vetro',this.x,this.y,this.z+8,12,this.out(s),70);this.tex()},
  canFix(){return!this.glass&&this.n<this.max},
  // l'eroe rimette un'asse (o una sbarra): le monete del round fino al tetto
  fix(){if(!this.canFix())return false;this.pl.push(0);this.n++;this.hp=D.vita||1;const h=W.hero,s=(h.x-this.x)*this.nx+(h.y-this.y)*this.ny>=0?1:-1,d=this.out(s);
    if(this.kind==='ferro'){suono('ribatte',this.x,this.y);burst('scintilla',this.x,this.y,this.z,8,d,70)}else{suono('inchioda',this.x,this.y);burst('truciolo',this.x,this.y,this.z,5,d,40)}
    const R=W.director?W.director.R||0:0;if(TT.r!==R){TT.r=R;TT.n=0}if(TT.n<BZ.tetto){const m=Math.min(BZ.monete,BZ.tetto-TT.n);TT.n+=m;W.coins+=m;W.FX.push({k:'coin',tw:[h.x,h.y,(h.zh||0)+44],n:m,t:.9,t0:.9});suono('moneta',h.x,h.y)}
    this.tex();return true}});
  B.sol=o.sol;o.sol.bar=B;B.reset();ALL.push(B);
  // il bottone «Ripara»: vicino alla barriera, quando c'è un'asse da mettere; si tiene premuto e le assi vanno una dopo l'altra
  buyable({id:'ripara'+ALL.length,x:B.x,y:B.y,r:o.r||48,rep:true,hold:D.hold,anim:'ripara',tool:'martello',show:()=>B.canFix()&&!W.hero.dead&&(!W.director||W.director.st!=='fine'),
    label:()=>'Ripara '+D.nome,price:()=>0,sub:()=>{const R=W.director?W.director.R||0:0,left=TT.r===R?BZ.tetto-TT.n:BZ.tetto;return'Tieni premuto · '+B.n+'/'+B.max+(left>0?' · <b>+'+BZ.monete+' ●</b>':'')},act:()=>B.fix()});
  return B}
const TT={r:-1,n:0};// le monete della riparazione in questo round
// ------------------------------------------------------------------ le finestre delle case (prop.js P.house le passa qui col vano del muro)
// la faccia della finestra cambia con lo stato: intatta è il disegno di prima; rotta, i vetri rimasti nel telaio, la croce spezzata, la
// persiana più storta; sopra le assi (le vecchie scure, le nuove dell'eroe chiare), ognuna al suo posto e storta a modo suo
const PL=[{y:6,a:.14,dx:0,l:37},{y:18,a:-.2,dx:1,l:36},{y:12,a:.06,dx:-1,l:35},{y:24,a:.27,dx:0,l:34},{y:9,a:-.36,dx:2,l:33}];
function paintWin(w2,h2,lit,pl){const fx=7,fy=2,fw=26,fh=26;
  ctx.fillStyle=lit?'#3a2414':'#0a090d';ctx.fillRect(fx,fy,fw,fh);
  if(lit){const g=ctx.createRadialGradient(fx+13,fy+16,2,fx+13,fy+16,22);g.addColorStop(0,'rgba(255,170,90,.6)');g.addColorStop(1,'rgba(255,120,40,.06)');ctx.fillStyle=g;ctx.fillRect(fx,fy,fw,fh)}
  else{const g=ctx.createLinearGradient(0,fy,0,fy+fh);g.addColorStop(0,'rgba(60,70,90,.25)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(fx,fy,fw,fh)}
  // i vetri rimasti nel telaio: punte storte dai bordi
  ctx.fillStyle='rgba(175,200,235,.42)';ctx.strokeStyle='rgba(20,24,34,.8)';ctx.lineWidth=.7;
  for(const[a,b,c] of[[[fx,fy],[fx+9,fy],[fx+2,fy+8]],[[fx+fw,fy],[fx+fw-6,fy],[fx+fw-1,fy+11]],[[fx,fy+fh],[fx,fy+fh-9],[fx+7,fy+fh]],[[fx+fw,fy+fh],[fx+fw-11,fy+fh],[fx+fw-2,fy+fh-6]],[[fx+12,fy],[fx+17,fy],[fx+14,fy+6]],[[fx,fy+12],[fx+5,fy+14],[fx,fy+17]]]){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();ctx.stroke()}
  // il telaio, la croce spezzata (il montante a metà, la traversa che pende)
  ink(2.2);ctx.strokeRect(fx,fy,fw,fh);ctx.fillStyle='#46321e';ctx.fillRect(fx+12,fy,2.4,11);ctx.save();ctx.translate(fx+1,fy+12);ctx.rotate(.55);ctx.fillRect(0,0,13,2.4);ink(.8);ctx.strokeRect(0,0,13,2.4);ctx.restore();
  ctx.fillStyle='#93714c';ctx.fillRect(fx-3,fy+fh-1,fw+6,4);ink(1.6);ctx.strokeRect(fx-3,fy+fh-1,fw+6,4);ctx.fillStyle='rgba(20,12,6,.55)';ctx.fillRect(fx+4,fy+fh,6,1.2);// il davanzale scheggiato
  // la persiana che pende da un cardine solo
  ctx.save();ctx.translate(fx-1,fy);ctx.transform(1,.18,0,1,0,0);ctx.rotate(.08);ctx.fillStyle='#54402c';ctx.fillRect(-7,0,7,fh-3);ink(1.6);ctx.strokeRect(-7,0,7,fh-3);ctx.fillStyle='rgba(20,12,6,.5)';for(let yy=3;yy<fh-3;yy+=4)ctx.fillRect(-6,yy,5,1);ctx.restore();
  // le assi
  pl.forEach((old,i)=>{const q=PL[i];ctx.save();ctx.translate(fx+fw/2+q.dx,fy+q.y);ctx.rotate(q.a);ctx.fillStyle=old?(i%2?'#6e5236':'#93714c'):(i%2?'#b08858':'#c69c66');ctx.fillRect(-q.l/2,-3,q.l,6);
    ctx.fillStyle=old?'rgba(20,12,6,.3)':'rgba(255,240,200,.25)';ctx.fillRect(-q.l/2,-3,q.l,1.2);ctx.fillStyle='rgba(20,12,6,.35)';ctx.fillRect(-q.l/2+4,0,q.l*.4,.8);ink(1.5);ctx.strokeRect(-q.l/2,-3,q.l,6);
    ctx.fillStyle='rgba(10,8,6,.75)';ctx.beginPath();ctx.arc(-q.l/2+3,0,.95,0,TAU);ctx.arc(q.l/2-3,0,.95,0,TAU);ctx.fill();if(!old){ctx.fillStyle='rgba(220,220,230,.8)';ctx.fillRect(-q.l/2+2.6,-.5,.8,.8);ctx.fillRect(q.l/2-3.4,-.5,.8,.8)}ctx.restore()})}
P.winBar=function(sol,wi){const kind='vetro',pl=wi.pl,id0=pl.texId,d0=pl.draw,sx=wi.sx||1,sy=wi.sy||1;
  mkBar({kind,x:wi.at[0],y:wi.at[1],nx:wi.n[0],ny:wi.n[1],half:wi.half||13,th:10,reach:30,hop:14,z:wi.zfx||44,glass:!wi.boards,n0:wi.boards?3:0,sol,
    // (le finestre più grandi degli edifici nuovi, prop_borgo.js: la stessa finestra disegnata più grande, sx × sy)
    onTex(B){if(B.glass){pl.texId=id0;pl.draw=d0;return}const key=B.pl.map(o=>o?'o':'f').join('');pl.texId='winR'+(wi.lit?'L':'')+'|'+key+'|'+Math.round(pl.w)+'x'+Math.round(pl.h);
      pl.draw=(w2,h2)=>{ctx.save();ctx.scale(sx,sy);paintWin(w2/sx,h2/sy,wi.lit,B.pl.slice());ctx.restore()}}})};
// ------------------------------------------------------------------ i varchi delle recinzioni: assi di legno o sbarre di ferro tra due pali
// (ax, ay)–(bx, by): il varco (lungo x o lungo y); o: {kind 'legno'|'ferro', out [nx, ny] (da dove vengono gli zombie), n0, z0 (la base),
// reach (il corridoio: deve arrivare fino alla buca da cui escono), hop}. Le assi si vedono dalla parte dell'eroe; i pezzi ci sono tutti nel
// prop e si accendono con vis() (vecchi e nuovi), così l'ordine di disegno resta quello calcolato una volta
P.barricade=function(ax,ay,bx,by,o){const kind=o.kind||'legno',hor=Math.abs(by-ay)<1,L=hor?bx-ax:by-ay,cx=(ax+bx)/2,cy=(ay+by)/2,nx=o.out[0],ny=o.out[1],th=o.th||6;
  const sol=hor?solid(ax,cy-th/2,L,th):solid(cx-th/2,ay,th,L);const B=mkBar({kind,x:cx,y:cy,nx,ny,half:L/2,th,reach:o.reach||32,hop:o.hop||10,z:o.zfx||16,n0:o.n0||0,sol});
  const inS=-1,parts=[],add=(arr,i,old)=>{for(const t of arr){t.vis=()=>B.n>i&&!!B.pl[i]===old;parts.push(t)}};// le assi sul lato di dentro (verso l'eroe)
  const z0=o.z0||0,mk=(u0,u1,za,zb,hh,t2,mat)=>{// un pezzo storto da u0 a u1 lungo il varco, alto hh, spesso t2, appena dentro la linea
    const prof=[[u0,za],[u1,zb],[u1,zb+hh],[u0,za+hh]];
    return hor?prismX(ax,cy+(inS*ny>0?th/2:-th/2-t2),t2,prof,mat,{ow:1.3}):prismY(cx+(inS*nx>0?th/2:-th/2-t2),ay,t2,prof,mat,{ow:1.3})};
  if(kind==='legno'){const Z=[6,12.5,19,25.5],T=[[-1.2,1.6],[1.4,-1],[-.6,1.8],[1.2,-.8]];
    for(let i=0;i<B.max;i++)for(const old of[true,false])add(mk(-2,L+2,z0+Z[i]+T[i][0],z0+Z[i]+T[i][1],4.6,2.2,old?'oldwood':'plankN'),i,old)}
  else{// ferro: ogni pezzo è una sbarra della cancellata rimessa in piedi (un po' storta, con la punta a lancia) e una traversa che la tiene,
    // ribattuta ai due capi; sono linee, così si vedono da ogni lato anche su un varco che va da nord a sud
    const Z=[12,26,40],U=[.22,.52,.8],TL=[.6,-.9,.4];
    for(let i=0;i<B.max;i++)for(const old of[true,false]){const col=old?'#5a4034':'#3a3c44',hi=old?'#8a5a3e':'#6a6e7a',at=(u,z)=>hor?[ax+u,cy+(inS*ny>0?th/2+1.5:-th/2-1.5),z]:[cx+(inS*nx>0?th/2+1.5:-th/2-1.5),ay+u,z];
      const u=L*U[i],a=at(u,z0),b=at(u+TL[i]*3,z0+46),arr=[line3(a,b,col,1.7,{ink:true}),{k:'facepoly',c:[at(u+TL[i]*3-2.6,z0+44.5),at(u+TL[i]*3+2.6,z0+44.5),at(u+TL[i]*3,z0+50.5)],mat:old?'ironR':'iron',key:'s',col:hi},
        line3(at(-1,z0+Z[i]+.6*TL[i]),at(L+1,z0+Z[i]-.6*TL[i]),col,2.4,{ink:true})];
      for(const e of[-1,L+1])arr.push(ballAt(at(e,z0+Z[i]),1.4,old?'ironR':'iron',{ow:1}));add(arr,i,old)}}
  prop({bx:hor?[ax-3,cy-th/2-4,bx+3,cy+th/2+4,z0+52]:[cx-th/2-4,ay-3,cx+th/2+4,by+3,z0+52],ky:hor?cy+th/2:by,parts,noSplit:true});
  // il muro crollato (ferro): sassi del muretto e una sbarra piegata a terra, dalle due parti del varco (dipinti nel terreno)
  if(kind==='ferro')ZM.decals.push(()=>{srand(Math.round(cx*7+cy*3));for(let i=0;i<16;i++){const u=rr(-4,L+4),v=rr(-22,22)*(i%2?1:.6),x=hor?ax+u:cx+v,y=hor?cy+v:ay+u,r=rr(2.2,4.6);
      ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+1.5,y+1.2,r,r*.7,0,0,TAU);ctx.fill();ctx.fillStyle=['#5c5f6a','#4a4c56','#6d6a72'][i%3];ctx.beginPath();ctx.ellipse(x,y,r,r*.7,rr(0,3),0,TAU);ctx.fill();ctx.strokeStyle='rgba(20,20,26,.8)';ctx.lineWidth=.8;ctx.stroke()}
    const x0=hor?cx-8:cx-18,y0=hor?cy+14:cy+6;ctx.strokeStyle='rgba(20,18,20,.85)';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+9,y0+4);ctx.lineTo(x0+20,y0+1);ctx.stroke();ctx.strokeStyle='#5a4034';ctx.lineWidth=1.5;ctx.stroke()});
  return B};
// ------------------------------------------------------------------ ogni fotogramma e i disegni (agganciati alla partita come fortuna.js)
{const _p=ZM.partita;ZM.partita=function(o){const D=_p(o);if(D.__bar)return D;D.__bar=1;
  const _u=D.update;D.update=(dt,on)=>{_u(dt,on);try{fxStep(dt)}catch(e){console.error(e)}};
  const _t=D.drawTop;D.drawTop=dt=>{_t(dt);if(FX.length)try{fxDraw()}catch(e){}};
  const _r=D.reset;D.reset=()=>{_r();FX.length=0;TT.r=-1;TT.n=0};return D}}
ZM.barriere={ALL,BZ,FX,mkBar,burst}})();
