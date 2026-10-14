// ---------- PROP del BORGO DEI LUMI e della SEGHERIA DEL FIUME (anteprima 48, punti 10-17 del piano di Denis): le due zone nuove a est della
// mappa zombie. Un costruttore di edifici (P.edificio: muri a uno o due piani con porte, finestre che sono barriere, tetto a due falde, arredi
// dentro che compaiono quando si entra) per la Locanda del Corvo, la Cappella e la Segheria; la Fucina aperta sulla strada, i banchi del
// mercato, la bacheca, la carrozza della scuola bruciata, il carretto rovesciato, la ruota del mulino sul fiume, le cataste di tronchi, la gru,
// il carro dei tronchi, le rovine oltre il bordo; le tre barriere a pagamento tra le zone (carri e assi, tronchi incatenati, il cancello della
// segheria) con la loro apertura. Porte più alte di prima (72 px, l'eroe è alto circa 58: non sembra più grande della porta) e piani di 92.
// Mondo antico: legno, pietra, ferro battuto, lanterne; niente motori. Costruiti come prop.js e prop_fattoria.js.
(()=>{const{T,S,decals,stand,rr,srand,ink,path,face,hullOf,ballAt,line3,poly3,fn3,box,prismX,prismY,plane,cyl,prop,solid,shade,shadeR,lights,flames,holes,houses,smokes,perches,MAT,material,wa,mix,cl,lerp,ez,TAU,ball,seg,facing,onGround,W}=ZM,P=ZM.P,G=ZM.G;
const E=(a,...b)=>a.push(...b),tag=(parts,t)=>{for(const p of parts)p.part=t;return parts};
const ANIM=ZM.anim=ZM.anim||[];
// (difetti 48) gli edifici (BLD) sono un gruppo: tutto quello che si costruisce dentro (muri, tetto, interni, scala, candele, il piano di sopra,
// l'edificio interno di locanda e cappella) prende lo stesso ref, nel mondo (r.w), e chi li costruisce lo ritrova in .ref per attaccarci altre
// cose (campanile, Forgia, armi a muro, Credenza) con ZM.group. KZ: un edificio più alto di KZ px si piega meno (r.k = KZ/altezza), così la cima
// ondeggia girando la visuale quanto quella della casa e del fienile delle prime due zone (alte circa 150 px)
const BLD=new Set(['edificio','locanda','cappella','fucina','campanile']),KZ=155,kOf=(r,zt)=>{if(r)r.k=Math.min(r.k||1,KZ/Math.max(KZ,zt))};
const def=(name,f,rf)=>{rf=rf||(a=>typeof a[0]==='number'&&typeof a[1]==='number'?[a[0],a[1]]:a[0]&&typeof a[0]==='object'?[a[0].x+a[0].w/2,a[0].y+a[0].d/2]:null);P[name]=function(...a){const N=ZM.NAMES,sv=N.cur,sr=N.ref,sg=N.grp;N.cur=name;let r=N.grp||rf(a);
    if(!N.grp&&r&&r.length<4&&BLD.has(name)){const q=ZM.toWorld(r[0],r[1]);r=[q[0],q[1]];r.w=true;N.grp=r}N.ref=r;
    try{const out=f.apply(this,a);if(out&&typeof out==='object'&&!out.ref&&r)out.ref=r;return out}finally{N.cur=sv;N.ref=sr;N.grp=sg}}};
const prng=s=>{s=(Math.abs(Math.round(s))%2147483646)+1;return()=>(s=(s*16807)%2147483647)/2147483647};
material('sidingG',['#4b5446','#30372e','#66725e'],'siding');material('sidingR',['#5a3a32','#3a2420','#7a5246'],'siding');
material('chapelStone',['#6a6870','#47464e','#8c8a94'],'stone');material('sawWood',['#6a5440','#463626','#8a7258'],'plank');
material('charred',['#2a2220','#161210','#3e3430'],'plank');material('canvasR',['#7a3a32','#52241e','#9a5048'],'cloth');material('canvasB',['#3a4a6a','#262f46','#52648a'],'cloth');
material('logEnd',['#8a6a44','#5e4428','#a8865a'],'flat');material('bark2',['#4a3a2a','#2c2218','#6a5640'],'bark');
// ------------------------------------------------------------------ le finestre degli edifici nuovi: la stessa finestra della casa (telaio a
// croce, davanzale, persiana storta, vetro scuro o acceso, assi), solo più grande (44 × 42: con le porte alte di prima era piccola)
const WW=44,WH=42,WZ=26;
const winPaint=(lit,boards)=>(w2,h2)=>{ctx.save();ctx.scale(w2/40,h2/34);const fx=7,fy=2,fw=26,fh=26;
  if(lit&&!boards){const ga=ctx.createRadialGradient(fx+13,fy+13,10,fx+13,fy+13,24);ga.addColorStop(0,'rgba(255,170,90,.28)');ga.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=ga;ctx.fillRect(0,0,40,34)}
  ctx.fillStyle=lit?'#ffcf7a':'#141018';ctx.fillRect(fx,fy,fw,fh);
  if(lit){const g=ctx.createRadialGradient(fx+13,fy+13,2,fx+13,fy+13,22);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(1,'rgba(255,150,60,.3)');ctx.fillStyle=g;ctx.fillRect(fx,fy,fw,fh)}
  else{ctx.fillStyle='rgba(120,150,210,.18)';ctx.beginPath();ctx.moveTo(fx+3,fy+fh-3);ctx.lineTo(fx+fw-6,fy+2);ctx.lineTo(fx+fw-2,fy+2);ctx.lineTo(fx+8,fy+fh-3);ctx.closePath();ctx.fill()}
  ink(2.2);ctx.strokeRect(fx,fy,fw,fh);ctx.fillStyle='#46321e';ctx.fillRect(fx+12,fy,2.4,fh);ctx.fillRect(fx,fy+12,fw,2.4);
  ctx.fillStyle='#93714c';ctx.fillRect(fx-3,fy+fh-1,fw+6,4);ink(1.6);ctx.strokeRect(fx-3,fy+fh-1,fw+6,4);
  if(boards){for(let j=0;j<2;j++){ctx.save();ctx.translate(fx+fw/2,fy+7+j*12);ctx.rotate(j?-.2:.14);ctx.fillStyle=j?'#6e5236':'#93714c';ctx.fillRect(-18,-3,36,6);ink(1.5);ctx.strokeRect(-18,-3,36,6);ctx.restore()}}
  else{ctx.save();ctx.translate(fx-1,fy);ctx.transform(1,.08,0,1,0,0);ctx.fillStyle='#54402c';ctx.fillRect(-7,0,7,fh);ink(1.6);ctx.strokeRect(-7,0,7,fh);ctx.fillStyle='rgba(20,12,6,.5)';for(let yy=3;yy<fh;yy+=4)ctx.fillRect(-6,yy,5,1);ctx.restore()}
  ctx.restore()};
// le ante delle porte (aperte, girate verso fuori di 90°: chi passa non ci sbatte)
const leafPaint=col=>(W2,H2)=>{ctx.fillStyle=col||'#46321e';ctx.fillRect(0,0,W2,H2);ink(1.8);ctx.strokeRect(1,1,W2-2,H2-2);ctx.fillStyle='rgba(20,12,6,.55)';ctx.fillRect(2.5,4,W2-5,H2*.38);ctx.fillRect(2.5,H2*.5,W2-5,H2*.42);
  ctx.fillStyle=wa(.12);ctx.fillRect(2.5,4,W2-5,1);ctx.fillStyle='#34363e';ctx.fillRect(0,8,4,2.4);ctx.fillRect(0,H2-14,4,2.4);ctx.fillStyle='#8a8a94';ctx.beginPath();ctx.arc(W2-3,H2*.52,1.4,0,TAU);ctx.fill()};
// ------------------------------------------------------------------ P.edificio: un edificio dove si entra. o: {x, y, w, d, H (un piano, 92),
// fl (piani, 1 o 2), wall, inner (dentro), roof, rh (il tetto), th (muri), dw, dh (porte), op: [{s:'n'|'s'|'e'|'w', at (dal lato nord-ovest),
// k:'door'|'big'|'win', w, lit, boards, deco (una vetrata: solo disegnata, non è una barriera)}], chim (camino: [x, y]), name}. Ogni muro è un prop a sé col suo tag (wN, wS, wE, wW: con l'eroe dentro
// si fanno trasparenti quelli verso la telecamera), il tetto ha il tag roof, gli arredi (B.in) il tag in. Le finestre del pianterreno sono
// barriere (barriere.js, P.winBar); quelle del piano di sopra sono disegnate. Restituisce B: {hs, x, y, w, d, H, HT, in(parts, bx), door(k)}
// (anteprima 48, punto 15) o.up: il piano di sopra si visita. I muri si dividono in due (sotto wN…, sopra uN…: con l'eroe dentro al pianterreno la
// parte alta sparisce come il tetto); il solaio (tag slab) col buco della scala o.hole [x0, y0, x1, y1]; i solidi di sopra hanno lv:1 (i quattro
// muri pieni; i mobili con B.solidUp); B.up(parts, bx) i mobili di sopra (tag inU); le finestre di sopra si vedono anche da dentro
def('edificio',function(o){const x=o.x,y=o.y,w=o.w,d=o.d,H=o.H||92,FL=o.fl||1,HT=H*FL,th=o.th||10,ov=12,rh=o.rh||Math.min(72,d*.34),wall=o.wall||'siding',inner=o.inner||'plaster',roof=o.roof||'shingle',DW=o.dw||40,DH=o.dh||72;
  const UP=!!o.up&&FL>1,hs={x,y,w,d,H:HT,rh,a:1,inside:false,porch:null,fl:FL,Hf:H,name:o.name||'',upF:UP,up:0};houses.push(hs);shade(x,y,w,d,HT+rh*.6,.55);
  const eave=(w2,h2)=>{const g=ctx.createLinearGradient(0,0,0,9);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w2,9);
    if(FL>1&&h2>H+6){const yy=h2-H;ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,yy-1,w2,4);ctx.fillStyle='rgba(255,240,220,.1)';ctx.fillRect(0,yy-2.2,w2,1.2)}};// la trave tra i piani
  const EAV={s:eave,e:eave,n:eave,w:eave};
  // con il piano di sopra: la trave tra i piani divisa tra la cima del pezzo di sotto e il fondo di quello di sopra
  const beamL=(w2,h2)=>{ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,0,w2,3)},beamU=(w2,h2)=>{eave(w2,h2);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,h2-1,w2,1);ctx.fillStyle='rgba(255,240,220,.1)';ctx.fillRect(0,h2-2.2,w2,1.2)};
  const LOW={tex:{s:beamL,e:beamL,n:beamL,w:beamL},texId:'pt'},HIGH={tex:{s:beamU,e:beamU,n:beamU,w:beamU},texId:'pu'};
  const WALL=(r,t,parts,zt)=>prop({bx:[r[0]-1,r[1]-1,r[2]+1,r[3]+1,(zt||HT)+6],ky:r[3],parts:tag(parts,t),house:hs});
  const SD={s:{hz:1,fix:y+d-th,a0:x,a1:x+w,t:'wS',n:[0,1],m:{n:inner}},n:{hz:1,fix:y,a0:x,a1:x+w,t:'wN',n:[0,-1],m:{s:inner}},e:{hz:0,fix:x+w-th,a0:y+th,a1:y+d-th,t:'wE',n:[1,0],m:{w:inner}},w:{hz:0,fix:x,a0:y+th,a1:y+d-th,t:'wW',n:[-1,0],m:{e:inner}}};
  const B={hs,x,y,w,d,H,HT,th,doors:{},wins:[],inN:[],ref:ZM.NAMES.ref},INW=[];
  const WB=(Sd,a,b,z0,z1,extra)=>Sd.hz?box(a,Sd.fix,z0,b-a,th,z1-z0,wall,Object.assign({ow:2.2,tex:EAV,m:Sd.m,noFoot:z0>0},extra)):box(Sd.fix,a,z0,th,b-a,z1-z0,wall,Object.assign({ow:2.2,tex:EAV,m:Sd.m,noFoot:z0>0},extra));
  const R=(Sd,a,b)=>Sd.hz?[a,Sd.fix,b,Sd.fix+th]:[Sd.fix,a,Sd.fix+th,b];
  const wpt=(Sd,c)=>Sd.hz?[c,Sd.fix+th/2]:[Sd.fix+th/2,c];
  // la finestra sulla faccia di fuori del lato (il piano disegnato), alla quota z
  const winPlane=(k,c,z,lit,boards,id)=>{const draw=winPaint(lit,boards),tid='winE'+id+(lit?'L':'')+(boards?'B':'');
    if(k==='s')return plane(c-WW/2,y+d+.4,z,WW,WH,'x',tid,draw);if(k==='n')return plane(c+WW/2,y-.4,z,WW,WH,Math.PI,tid,draw);
    if(k==='e')return plane(x+w+.4,c-WW/2,z,WW,WH,'y',tid,draw);return plane(x-.4,c+WW/2,z,WW,WH,-Math.PI/2,tid,draw)};
  for(const k of['n','w','e','s']){const Sd=SD[k],ops=(o.op||[]).filter(q=>q.s===k).map(q=>Object.assign({c:(Sd.hz?x:y)+q.at},q)).sort((a,b)=>a.c-b.c);
    const doors=ops.filter(q=>q.k==='door'||q.k==='big'),wins=ops.filter(q=>q.k==='win');let cur=Sd.a0;const spans=[];
    for(const q of doors){const hw=(q.w||(q.k==='big'?DW*1.8:DW))/2;spans.push([cur,q.c-hw]);q.hw=hw;cur=q.c+hw}spans.push([cur,Sd.a1]);
    // i pezzi pieni: dal pavimento al tetto, con le finestre (barriere) nei loro vani; per ogni pezzo il solido spezzato dalle finestre
    for(const[a,b] of spans){if(b-a<1)continue;const parts=UP?WB(Sd,a,b,0,H,LOW):WB(Sd,a,b,0,HT),upP=UP?WB(Sd,a,b,H,HT,HIGH):parts;const ws=wins.filter(q=>q.c>a+18&&q.c<b-18);let sc=a;
      if(UP&&k==='n')for(const t of upP)if(t.k==='face'&&t.key==='s')B.inN.push({a,b,face:t});// (la faccia di dentro del muro nord, di sopra: ci va l'arma col gesso)
      for(const q of ws){const pl=winPlane(k,q.c,WZ,!!q.lit,!!q.boards,'g'+Math.round(q.c)+k);parts.push(pl);if(q.deco){B.wins.push(q);continue}const hw=WW/2-7;const r1=R(Sd,sc,q.c-hw);solid(r1[0],r1[1],r1[2]-r1[0],r1[3]-r1[1]);
        const rb=R(Sd,q.c-hw,q.c+hw),sol=solid(rb[0],rb[1],rb[2]-rb[0],rb[3]-rb[1]);sc=q.c+hw;
        if(P.winBar)P.winBar(sol,{c:q.c,along:Sd.hz?'x':'y',pl,lit:!!q.lit,boards:!!q.boards,draw:pl.draw,at:ZM.toWorld(...wpt(Sd,q.c)),n:ZM.dirWorld(...Sd.n),hs,half:hw,zfx:WZ+20,sx:WW/40,sy:WH/34});B.wins.push(q)}
      const rl=R(Sd,sc,b);solid(rl[0],rl[1],rl[2]-rl[0],rl[3]-rl[1]);
      // le finestre del piano di sopra (disegnate), sopra quelle di sotto e a metà dei pezzi lunghi senza finestre
      if(FL>1){const ups=ws.length?ws.map(q=>q.c):b-a>120?[(a+b)/2]:[];for(const c of ups){upP.push(winPlane(k,c,H+WZ,((c*7+k.charCodeAt(0))%5)<2,false,'u'+Math.round(c)+k));if(UP)INW.push([k,c])}}
      WALL(R(Sd,a,b),Sd.t,parts,UP?H:HT);if(UP)WALL(R(Sd,a,b),'u'+k.toUpperCase(),upP)}
    // le porte: l'architrave sopra il vano, gli stipiti e la traversa appena fuori dal muro, l'anta aperta verso fuori
    for(const q of doors){const a=q.c-q.hw,b=q.c+q.hw,parts=WB(Sd,a,b,DH,UP?H:HT,UP?LOW:null);WALL(R(Sd,a,b),Sd.t,parts,UP?H:HT);if(UP)WALL(R(Sd,a,b),'u'+k.toUpperCase(),WB(Sd,a,b,H,HT,HIGH));B.doors[q.id||k]={c:q.c,s:k,hw:q.hw,at:ZM.toWorld(...wpt(Sd,q.c))};
      const nn=Sd.n,ox=Sd.hz?0:nn[0]*(th/2+.2),oy=Sd.hz?nn[1]*(th/2+.2):0,fx=Sd.hz?null:Sd.fix+th/2+ox,fy=Sd.hz?Sd.fix+th/2+oy:null;
      const post=u=>Sd.hz?box(u-2,fy-.8,0,4,1.6,DH,'wood',{ow:1.4}):box(fx-.8,u-2,0,1.6,4,DH,'wood',{ow:1.4});
      WALL(Sd.hz?[a-4,fy-.8,b+4,fy+.8]:[fx-.8,a-4,fx+.8,b+4],Sd.t,[...post(a-2),...post(b+2),...(Sd.hz?box(a-4,fy-.8,DH,b-a+8,1.6,4,'wood',{noFoot:true,ow:1.4}):box(fx-.8,a-4,DH,1.6,b-a+8,4,'wood',{noFoot:true,ow:1.4}))]);
      // l'anta (o le due ante del portone) aperta verso fuori, perpendicolare al muro
      const LW=q.k==='big'?q.hw-2:Math.min(q.hw*2-6,30),dir=Sd.hz?nn[1]:nn[0];
      for(const side of q.k==='big'?[-1,1]:[-1]){const hu=side<0?a+1:b-1,pl=Sd.hz?plane(hu,fy+dir*1.2,0,LW,DH-2,dir>0?Math.PI/2:-Math.PI/2,'antaE'+Math.round(LW)+(q.k==='big'?'B':''),leafPaint(q.col)):plane(fx+dir*1.2,hu,0,LW,DH-2,dir>0?0:Math.PI,'antaE'+Math.round(LW)+(q.k==='big'?'B':''),leafPaint(q.col));
        const ex=Sd.hz?[hu-2,fy+(dir>0?0:-LW),hu+2,fy+(dir>0?LW:0)]:[fx+(dir>0?0:-LW),hu-2,fx+(dir>0?LW:0),hu+2];WALL(ex,Sd.t,[pl])}}}
  if(UP){const ix0=x+th,iy0=y+th,ix1=x+w-th,iy1=y+d-th,[hx0,hy0,hx1,hy1]=o.hole||[ix0,iy0,ix0,iy0];
    // il solaio: assi spesse 5 px intorno al buco della scala, un prop per pezzo (ognuno con la sua impronta)
    for(const[a0,b0,a1,b1] of[[ix0,iy0,ix1,hy0],[ix0,hy1,ix1,iy1],[ix0,hy0,hx0,hy1],[hx1,hy0,ix1,hy1]])if(a1-a0>1&&b1-b0>1)prop({bx:[a0,b0,a1,b1,H+2],parts:tag(box(a0,b0,H-5,a1-a0,b1-b0,5,'plank',{noFoot:true,ow:1.2}),'slab'),house:hs});
    for(const r of[[x,y,w,th],[x,y+d-th,w,th],[x,y,th,d],[x+w-th,y,th,d]])solid(...r).lv=1;
    for(const[k,c] of INW){const draw=winPaint(false,false),tid='winI'+Math.round(c)+k,z=H+WZ;let pl,bx;
      if(k==='n'){pl=plane(c-WW/2,y+th+.4,z,WW,WH,'x',tid,draw);bx=[c-WW/2,y+th,c+WW/2,y+th+1]}else if(k==='s'){pl=plane(c+WW/2,y+d-th-.4,z,WW,WH,Math.PI,tid,draw);bx=[c-WW/2,y+d-th-1,c+WW/2,y+d-th]}
      else if(k==='w'){pl=plane(x+th+.4,c-WW/2,z,WW,WH,'y',tid,draw);bx=[x+th,c-WW/2,x+th+1,c+WW/2]}else{pl=plane(x+w-th-.4,c+WW/2,z,WW,WH,-Math.PI/2,tid,draw);bx=[x+w-th-1,c-WW/2,x+w-th,c+WW/2]}
      prop({bx:[...bx,z+WH+2],parts:tag([pl],'inU'),house:hs})}}
  // il tetto: due mezze falde (come la casa), il colmo; il camino che fuma
  {const L=x-ov,len=w+ov*2,Y0=y-ov,Y1=y+d+ov,ym=y+d/2,hl=(Y1-Y0)/2,parts=[];
    E(parts,hullOf([[L,Y0,HT],[L+len,Y0,HT],[L+len,Y1,HT],[L,Y1,HT],[L,ym,HT+rh],[L+len,ym,HT+rh]],2.6));
    const north=prismY(L,Y0,len,[[0,HT],[hl,HT],[hl,HT+rh]],roof,{noOut:true,m:{e:wall,w:wall}}).filter(t=>!(t.k==='face'&&t.key==='s'));
    const south=prismY(L,ym,len,[[0,HT],[hl,HT],[0,HT+rh]],roof,{noOut:true,m:{e:wall,w:wall}}).filter(t=>!(t.k==='face'&&t.key==='n'));
    E(parts,...north,...south,line3([L,ym,HT+rh+1],[L+len,ym,HT+rh+1],'#2a2630',3,{ink:true}));
    if(o.chim){const[cx0,cy0]=o.chim,zr=HT+rh-Math.abs(cy0-ym)*rh/hl;E(parts,...box(cx0-7,cy0-7,zr-12,14,14,34,'brick',{noFoot:true,ow:1.8}),...box(cx0-9,cy0-9,zr+22,18,18,4,'stoneWD',{noFoot:true,ow:1.4}));smokes.push({x:cx0,y:cy0,z:zr+28,t:0})}
    prop({bx:[L-4,Y0-4,L+len+4,Y1+4,HT+rh+40],ky:Y1,parts:tag(parts,'roof'),house:hs})}
  B.in=(parts,bx,ky)=>prop({bx,ky:ky==null?bx[3]:ky,parts:tag(parts,'in'),house:hs,ref:B.ref});/* (anche chiamati da fuori, come gli interni della segheria: col ref dell'edificio) */
  B.up=(parts,bx,ky)=>prop({bx,ky:ky==null?bx[3]:ky,parts:tag(parts,'inU'),house:hs,ref:B.ref});kOf(B.ref,HT+rh);B.solidUp=(a,b,c,e)=>{const so=solid(a,b,c,e);so.lv=1;return so};
  return B});
// ------------------------------------------------------------------ gli arredi (con B.in: compaiono quando l'eroe entra)
const table=(B,x,y,w,d,z,round)=>{solid(x,y,w,d);const parts=[];for(const[dx,dy] of[[2,2],[w-5,2],[2,d-5],[w-5,d-5]])E(parts,...box(x+dx,y+dy,0,3,3,z-3,'wood',{noOut:true}));
  if(round)E(parts,...cyl(x+w/2,y+d/2,z-3,w/2,3,'wood',{n:12}));else E(parts,...box(x,y,z-3,w,d,3,'wood',{noFoot:true,ow:1.6}));B.in(parts,[x-2,y-2,x+w+2,y+d+2,z+12],y+d)};
const stool=(B,x,y)=>{solid(x-4,y-4,8,8);B.in([...cyl(x,y,0,4,13,'wood',{n:7,r1:4.6})],[x-6,y-6,x+6,y+6,14],y+4)};
const candle=(B,x,y,z)=>{const lvl=B.hs.upF?(z>=B.H-1?1:0):undefined;flames.push({x,y,z:z+7,r:1.6,rgb:'255,180,90',house:B.hs,indoor:1,ky:y+1,lvl,ref:ZM.NAMES.ref});lights.push({x,y,z:z+6,r:55,rgb:'255,170,80',a:.32,fl:1,house:B.hs,lvl});return cyl(x,y,z,1.5,6,'bone',{n:6})};
const bottles=(x,y,z,n,along)=>{const out=[];const C=['#3a6a4a','#6a3a2a','#3a3a6a','#7a6a2a','#5a2a4a'];for(let i=0;i<n;i++){const id='bot'+(i%5);if(!MAT[id])material(id,[C[i%5],mix(C[i%5],'#000000',.35),mix(C[i%5],'#ffffff',.3)],'flat');
  const px=along==='y'?x:x+i*6,py=along==='y'?y+i*6:y;E(out,...cyl(px,py,z,2,6+(i%3),id,{n:6,r1:1.6,ink:.5}))}return out};
// ------------------------------------------------------------------ la LOCANDA DEL CORVO: due piani di assi grigio-verdi col tetto d'ardesia,
// porta sulla strada, porta sul retro, porta a ovest; dentro il banco col bancone e gli scaffali delle bottiglie, i tavoli con gli sgabelli,
// il camino acceso, la scala verso il piano di sopra lungo il muro nord. Sopra l'ingresso l'insegna col corvo e la lanterna
def('locanda',function(x,y,w,d){const H=92,sx0=x+14,sy0=y+12,SL=118;// (la scala: dal muro ovest, lunga SL, larga 30)
  const B=P.edificio({x,y,w,d,H,fl:2,up:1,hole:[sx0+12,y+10,sx0+SL+2,sy0+32],wall:'sidingG',roof:'slate',rh:76,name:'Locanda del Corvo',chim:[x+194,y+16],
    op:[{s:'s',at:w*.5,k:'door',id:'strada'},{s:'s',at:62,k:'win',lit:1},{s:'s',at:w-64,k:'win'},{s:'n',at:w-42,k:'door',id:'retro'},{s:'n',at:w*.6,k:'win'},{s:'w',at:d*.62,k:'door',id:'ovest'},{s:'w',at:d*.26,k:'win'},{s:'e',at:d*.17,k:'win',lit:1},{s:'e',at:d*.83,k:'win'}]});
  B.kind='locanda';const th=B.th;
  // il bancone (da nord a sud, a est) e dietro gli scaffali con le bottiglie contro il muro est
  const bx=x+w-118;solid(bx,y+th+66,14,d-th*2-120);B.in([...box(bx,y+th+66,0,14,d-th*2-120,24,'plankD',{ow:1.8}),...box(bx-2,y+th+64,24,18,d-th*2-116,3,'wood',{noFoot:true,ow:1.4}),...bottles(bx+7,y+th+74,27,5,'y')],[bx-4,y+th+60,bx+20,y+d-th-50,40]);
  {const sx=x+w-th-12,sy=y+th+56,sl=d-th*2-112;solid(sx,sy,12,sl);B.in([...box(sx,sy,0,12,sl,52,'plankD',{ow:1.8}),...box(sx-1,sy+2,18,12,sl-4,2,'wood',{noFoot:true,noOut:true}),...box(sx-1,sy+2,34,12,sl-4,2,'wood',{noFoot:true,noOut:true}),...bottles(sx+6,sy+10,20,8,'y'),...bottles(sx+6,sy+10,36,8,'y')],[sx-4,sy-4,sx+14,sy+sl+4,56])}
  // il camino contro il muro nord, acceso
  {const fx=x+170;solid(fx,y+th,48,16);B.in([...box(fx,y+th,0,48,16,60,'brick',{tex:{s:(w2,h2)=>{ctx.fillStyle='#120804';ctx.fillRect(10,h2-24,28,24);ink(1.6);ctx.strokeRect(10,h2-24,28,24);const g2=ctx.createRadialGradient(w2/2,h2*.8,2,w2/2,h2*.8,w2*.5);g2.addColorStop(0,'rgba(255,140,50,.35)');g2.addColorStop(1,'rgba(255,140,50,0)');ctx.fillStyle=g2;ctx.fillRect(0,0,w2,h2)}}}),...box(fx-3,y+th,60,54,19,4,'plankD',{noFoot:true})],[fx-4,y+th,fx+52,y+th+20,66]);
    flames.push({x:fx+24,y:y+th+17,z:4,r:9,rgb:'255,140,50',fire:1,house:B.hs,ky:y+th+18,n:[0,1],lvl:0});lights.push({x:fx+24,y:y+th+44,r:130,rgb:'255,140,60',a:.5,fl:1,house:B.hs,lvl:0})}
  // i tavoli con gli sgabelli e le candele
  for(const[tx,ty] of[[x+150,y+120],[x+222,y+92],[x+120,y+175]]){table(B,tx-14,ty-14,28,28,22,true);B.in(candle(B,tx,ty,22),[tx-3,ty-3,tx+3,ty+3,30]);for(const a of[0,2.1,4.2]){const sx2=tx+Math.cos(a)*24,sy2=ty+Math.sin(a)*24;stool(B,sx2,sy2)}}
  // la scala lungo il muro nord, da est verso ovest: dieci gradini fino al piano di sopra (il pianerottolo nell'angolo nord-ovest). Si vede anche
  // da sopra, nel buco del solaio (tag st); al piede il bottone «Sali al piano di sopra», sul pianerottolo «Scendi» (motore.js, ZM.scala)
  {const L=SL,n=10,parts=[];solid(sx0,sy0,L,30);for(let i=0;i<n;i++){const u=L-(i+1)*L/n,z=(i+1)*H/n;E(parts,...box(sx0+u,sy0,0,L/n+.5,30,z,'plankD',{noOut:i<n-1,ow:1.6}))}
    E(parts,line3([sx0+L,sy0+31,0],[sx0+L,sy0+31,24],'#5e4128',2.4,{ink:true}),line3([sx0+L,sy0+31,24],[sx0+6,sy0+31,H+22],'#5e4128',2.2,{ink:true}),line3([sx0+6,sy0+31,H],[sx0+6,sy0+31,H+22],'#5e4128',2.4,{ink:true}));
    prop({bx:[sx0-2,sy0-2,sx0+L+2,sy0+34,H+24],ky:sy0+32,parts:tag(parts,'st'),house:B.hs});B.stairs={x0:sx0,y0:sy0,L,w:30,bottom:[sx0+L+16,sy0+15],top:[sx0+14,sy0+15]};
    B.scala=ZM.scala?ZM.scala({hs:B.hs,H,bot:[sx0+L+16,sy0+15],foot:[sx0+L,sy0+15],head:[sx0+6,sy0+15],land:[sx0+22,sy0+48]}):null}
  // il piano di sopra: le camere della locanda (tre letti, l'armadio, il baule, lo scrittoio sotto la finestra con la candela, la Pompa tattica
  // col gesso sul muro nord) e la ringhiera intorno al buco della scala; i solidi sono di sopra (lv:1). Le cose alte stanno contro il muro nord
  // (dietro a tutto, per la telecamera), davanti al pianerottolo niente
  {const U=H;
    const bed=(bx,by,flip)=>{B.solidUp(bx,by,34,58);B.up([...box(bx,by,U,34,58,12,'wood',{ow:1.8}),...box(bx+2,by+2,U+12,30,54,5,'canvas',{noFoot:true,ow:1.4}),...box(bx+5,flip?by+46:by+5,U+17,24,8,4,'bone',{noFoot:true,ow:1.2}),
      ...box(bx+2,flip?by+2:by+20,U+17,30,36,2.5,'red',{noFoot:true,ow:1.2}),...box(bx,flip?by+54:by,U,34,4,28,'wood',{ow:1.6})],[bx-2,by-2,bx+36,by+60,U+30])};
    bed(x+150,y+th);bed(x+352,y+th);bed(x+300,y+d-th-58,true);
    {const ax=x+190,ay=y+th;B.solidUp(ax,ay,32,20);B.up([...box(ax,ay,U,32,20,66,'wood',{ow:1.8}),...box(ax+1,ay+20,U+4,14.5,.8,58,'plankD',{noFoot:true,noOut:true}),...box(ax+16.5,ay+20,U+4,14.5,.8,58,'plankD',{noFoot:true,noOut:true})],[ax-2,ay-2,ax+34,ay+22,U+68])}// (l'armadio contro il muro nord: dietro a tutto, non copre mai l'eroe)
    B.solidUp(x+152,y+th+62,30,16);B.up([...box(x+152,y+th+62,U,30,16,14,'plankD',{ow:1.6}),...box(x+151,y+th+61,U+14,32,18,3,'wood',{noFoot:true,ow:1.4})],[x+150,y+th+60,x+184,y+th+80,U+18]);
    {const dx=x+w*.6-18,dy=y+th+2;B.solidUp(dx,dy,36,20);B.up([...box(dx,dy,U+20,36,20,3,'wood',{noFoot:true,ow:1.6}),...box(dx+2,dy+2,U,3,3,20,'wood',{noOut:true}),...box(dx+31,dy+2,U,3,3,20,'wood',{noOut:true}),...box(dx+2,dy+15,U,3,3,20,'wood',{noOut:true}),...box(dx+31,dy+15,U,3,3,20,'wood',{noOut:true}),...candle(B,dx+8,dy+8,U+23)],[dx-2,dy-2,dx+38,dy+22,U+32]);
      B.solidUp(dx+14,dy+28,8,8);B.up([...cyl(dx+18,dy+32,U,4,13,'wood',{n:7,r1:4.6})],[dx+12,dy+26,dx+24,dy+38,U+14])}
    {const yR=sy0+33,xR=sx0+SL+2,parts=[];for(const px of[sx0+16,sx0+52,sx0+88,xR])E(parts,line3([px,yR,U],[px,yR,U+24],'#5e4128',2.4,{ink:true}));
      E(parts,line3([sx0+16,yR,U+24],[xR,yR,U+24],'#5e4128',2.2,{ink:true}),line3([sx0+16,yR,U+12],[xR,yR,U+12],'#5e4128',1.6,{ink:true}),line3([xR,yR,U+24],[xR,y+th+1,U+24],'#5e4128',2.2,{ink:true}),line3([xR,yR,U+12],[xR,y+th+1,U+12],'#5e4128',1.6,{ink:true}));
      B.up(parts,[sx0+14,y+th,xR+2,yR+2,U+26],yR+1);B.solidUp(sx0+10,y+th,SL-8,yR-y-th+2)}
    {const gx=x+320,f=B.inN.find(q=>gx>q.a+30&&gx<q.b-2);if(P.wallGun)P.wallGun(gx,y+th+.6,U+34,'x','tattica',2000,f&&f.face,B.hs);B.gunUp=[gx,y+th+34]}}
  // fuori: l'insegna col corvo appesa sopra la porta sulla strada e la lanterna
  {const cx=x+w*.5,yy=y+d,parts=[line3([cx-30,yy+1,H+8],[cx-30,yy+16,H+8],'#34363e',2.4,{ink:true}),line3([cx-30,yy+16,H+8],[cx-30,yy+16,H-2],'#1d1e23',1.2),plane(cx-48,yy+16,H-28,36,26,'x','insegnaCorvo',(w2,h2)=>{ctx.fillStyle='#2e1e16';ctx.fillRect(0,0,w2,h2);ink(1.6);ctx.strokeRect(1,1,w2-2,h2-2);
      ctx.fillStyle='#14100c';ctx.beginPath();ctx.ellipse(w2/2,h2*.52,7,4.6,-.2,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(w2/2+5,h2*.45);ctx.lineTo(w2/2+12,h2*.36);ctx.lineTo(w2/2+6,h2*.55);ctx.fill();ctx.beginPath();ctx.arc(w2/2-6,h2*.42,3.2,0,TAU);ctx.fill();
      ctx.fillStyle='#c8a850';ctx.beginPath();ctx.moveTo(w2/2-9,h2*.4);ctx.lineTo(w2/2-12.5,h2*.44);ctx.lineTo(w2/2-9,h2*.46);ctx.fill();ctx.fillStyle='#ff5040';ctx.fillRect(w2/2-7,h2*.38,1.2,1.2);
      ctx.font='400 5.5px "Lilita One",system-ui';ctx.textAlign='center';ctx.fillStyle='#c8a850';ctx.fillText('LOCANDA',w2/2,h2*.2);ctx.fillText('DEL CORVO',w2/2,h2*.92)})];
    ZM.lanternParts(parts,cx+30,yy+12,H-20,{s:1,r:150,a:.5});E(parts,line3([cx+30,yy+1,H+2],[cx+30,yy+12,H+2],'#34363e',2.2,{ink:true}));prop({bx:[cx-52,yy,cx+40,yy+20,H+12],parts,noSplit:true})}
  return B},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);
// ------------------------------------------------------------------ la CAPPELLA: navata di pietra alta col tetto d'ardesia, portale a ovest con
// le ante, finestre a nord e a sud (barriere), il campanile staccato a nord-est con la campana che dondola; dentro le panche e l'altare
// con le candele (davanti all'altare la Bara delle Sorprese quando è lì)
def('cappella',function(x,y,w,d){const H=118;
  const B=P.edificio({x,y,w,d,H,fl:1,wall:'chapelStone',inner:'stoneWD',roof:'slate',rh:84,name:'Cappella',dw:46,dh:84,
    op:[{s:'w',at:d*.5,k:'door',id:'portale',w:46,col:'#3a2418'},{s:'n',at:w*.3,k:'win'},{s:'n',at:w*.72,k:'win'},{s:'s',at:w*.42,k:'win',lit:1,deco:1},{s:'e',at:d*.5,k:'win',lit:1,deco:1}]});
  B.kind='cappella';const th=B.th;
  for(let r=0;r<4;r++)for(const side of[-1,1]){const px=x+th+34+r*40,py=y+d/2+side*38-9;solid(px,py,16,18);B.in([...box(px,py,0,16,18,12,'wood',{ow:1.6}),...box(px+12,py,12,4,18,12,'wood',{noFoot:true,ow:1.4})],[px-2,py-2,px+18,py+20,26])}
  {const ax=x+w-th-36,ay=y+d/2-24;solid(ax,ay,22,48);const parts=[...box(ax,ay,0,22,48,26,'chapelStone',{ow:2}),...box(ax-2,ay-2,26,26,52,3,'bone',{noFoot:true,ow:1.4})];for(const dy of[6,24,42])E(parts,...candle(B,ax+11,ay+dy,29));
    E(parts,line3([ax+11,ay+24,29],[ax+11,ay+24,52],'#c8a850',2,{ink:true}),line3([ax+11,ay+17,45],[ax+11,ay+31,45],'#c8a850',2,{ink:true}));B.in(parts,[ax-4,ay-4,ax+26,ay+52,56])}
  return B},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);
def('campanile',function(x,y,s){const H=196,parts=[];solid(x,y,s,s);shade(x,y,s,s,H+40,.55);E(parts,...box(x,y,0,s,s,H-40,'chapelStone',{ow:2.2}),...box(x-3,y-3,H-40,s+6,s+6,4,'stoneWD',{noFoot:true,ow:1.6}));
  // la cella campanaria aperta (quattro pilastri) e la campana che dondola, il tetto a piramide
  for(const[dx,dy] of[[0,0],[s-7,0],[0,s-7],[s-7,s-7]])E(parts,...box(x+dx,y+dy,H-36,7,7,30,'chapelStone',{noFoot:true,ow:1.6}));
  E(parts,fn3(S2=>{const sw=Math.sin(W.t*1.3)*.35,c=S2(x+s/2,y+s/2,H-10),b=S2(x+s/2+Math.sin(sw)*9,y+s/2,H-10-Math.cos(sw)*14);ctx.fillStyle='#8a7030';ink(2);ctx.beginPath();ctx.moveTo(c[0]-3,c[1]);ctx.lineTo(c[0]+3,c[1]);ctx.lineTo(b[0]+8,b[1]);ctx.quadraticCurveTo(b[0],b[1]+3,b[0]-8,b[1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,236,170,.4)';ctx.fillRect(c[0]-2,c[1]+2,1.5,(b[1]-c[1])*.7)},{fp:[[x+4,y+4],[x+s-4,y+4],[x+s-4,y+s-4],[x+4,y+s-4]],z:[H-30,H-6]}));
  E(parts,...box(x-3,y-3,H-6,s+6,s+6,4,'stoneWD',{noFoot:true,ow:1.6}),poly3([[x-4,y-4,H-2],[x+s+4,y-4,H-2],[x+s/2,y+s/2,H+40]],'#3c4552',{ink:2}),poly3([[x+s+4,y-4,H-2],[x+s+4,y+s+4,H-2],[x+s/2,y+s/2,H+40]],'#2b323c',{ink:2}),poly3([[x-4,y+s+4,H-2],[x+s+4,y+s+4,H-2],[x+s/2,y+s/2,H+40]],'#535f6e',{ink:2}),poly3([[x-4,y-4,H-2],[x-4,y+s+4,H-2],[x+s/2,y+s/2,H+40]],'#3c4552',{ink:2}));
  E(parts,line3([x+s/2,y+s/2,H+40],[x+s/2,y+s/2,H+56],'#34363e',2,{ink:true}),line3([x+s/2-6,y+s/2,H+50],[x+s/2+6,y+s/2,H+50],'#34363e',2,{ink:true}));
  prop({bx:[x-6,y-6,x+s+6,y+s+6,H+60],parts,noSplit:true});perches.push({x:x+s/2,y:y+s/2,z:H+42,t:1});kOf(ZM.NAMES.ref,H+56)});
// ------------------------------------------------------------------ la FUCINA: una tettoia di travi aperta sulla strada (nord), il muro di mattoni
// in fondo (sud) e mezzi muri ai lati; dentro gli attrezzi appesi, il barile dell'acqua, il mucchio di carbone, i ferri di cavallo
// (la Forgia delle Anime ci va sotto, macchine.js)
def('fucina',function(x,y,w,d){const H=82,th=10,parts=[];shade(x,y,w,d,H,.45);
  // è una casa per la telecamera (hs): con l'eroe sotto la tettoia o dietro, la tettoia sfuma e i muri verso la telecamera si fanno trasparenti
  const hs={x,y,w,d,H,rh:6,a:1,inside:false,porch:null,fl:1,Hf:H,name:'Fucina'};houses.push(hs);
  // il muro in fondo e i due fianchi bassi (a metà)
  for(const[r,t] of[[[x,y+d-th,w,th,H],'wS'],[[x,y+28,th,d-28-th,46],'wW'],[[x+w-th,y+28,th,d-28-th,46],'wE']]){solid(r[0],r[1],r[2],r[3]);prop({bx:[r[0]-1,r[1]-1,r[0]+r[2]+1,r[1]+r[3]+1,r[4]+4],parts:tag(box(r[0],r[1],0,r[2],r[3],r[4],'brick',{ow:2.2}),t),house:hs})}
  // i pali davanti e la tettoia a una falda che scende verso la strada
  for(const px of[x,x+w/2-3,x+w-6]){solid(px,y,6,6);prop({bx:[px-1,y-1,px+7,y+7,H-8],parts:box(px,y,0,6,6,H-14,'post',{ow:1.6})})}/* (difetti 48) pali e tettoia si piegano come i muri: con lk .8 scivolavano sui muri girando */
  const zt=v=>H-18*v/d;prop({bx:[x-10,y-10,x+w+10,y+d+4,H+6],parts:[...prismY(x-10,y-12,w+20,[[0,zt(0)-14],[d+12,zt(d+12)+4],[d+12,zt(d+12)+9],[0,zt(0)-9]],'shingle',{m:{e:'plankD',w:'plankD'},ow:1.8})].map(t=>{t.part='roof';return t}),house:hs});
  // gli attrezzi sul muro in fondo (tenaglie, martelli, ferri di cavallo) e il barile, il carbone
  const wy=y+d-th-.4;E(parts,fn3(S2=>{for(let i=0;i<6;i++){const ax=x+40+i*26,a=S2(ax,wy,58),b=S2(ax+(i%2?3:-3),wy,30+(i%3)*4);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=3;seg(a,b);ctx.stroke();ctx.strokeStyle=i%2?'#5a5c66':'#7d5a38';ctx.lineWidth=1.4;seg(a,b);ctx.stroke();
      if(i%2){ctx.fillStyle='#4a4c56';ink(1.2);ctx.fillRect(b[0]-4,b[1]-2,8,4);ctx.strokeRect(b[0]-4,b[1]-2,8,4)}}
    for(let i=0;i<4;i++){const c=S2(x+w-60+i*12,wy,64);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(c[0],c[1],3.6,Math.PI*.15,Math.PI*.85,true);ctx.stroke();ctx.strokeStyle='#6a6e7a';ctx.lineWidth=1.4;ctx.stroke()}},{fp:[[x+30,wy-2],[x+w-20,wy-2],[x+w-20,wy+.5],[x+30,wy+.5]],z:[24,70]}));
  prop({bx:[x+20,wy-3,x+w-10,wy+1,72],parts,noSplit:true});
  const bxx=x+w-38,byy=y+d-th-24;solid(bxx-11,byy-11,22,22).round=true;prop({bx:[bxx-12,byy-12,bxx+12,byy+12,26],parts:[...cyl(bxx,byy,0,11,22,'stave',{n:10,m:{t:'water'},ink:.45})]});
  {const cx=x+30,cy=y+d-th-22,parts2=[];solid(cx-16,cy-10,32,18);E(parts2,fn3(S2=>{const r=prng(cx);for(let i=0;i<34;i++){const a=r()*TAU,rad=r()*14,q=S2(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.6,r()*8*(1-rad/15));ctx.fillStyle=i%3?'#141216':'#2a2830';ball(q,1.8+r()*1.6);ctx.fill()}},{fp:[[cx-16,cy-10],[cx+16,cy-10],[cx+16,cy+8],[cx-16,cy+8]],z:[0,10]}));prop({bx:[cx-18,cy-12,cx+18,cy+10,12],parts:parts2})}
  return{x,y,w,d,wallY:y+d-th}},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);
// ------------------------------------------------------------------ la botola della cantina (nel vicolo della Locanda): due ante di assi nel telaio a
// terra; quando ne esce uno zombie (bang) si spalancano per un paio di secondi (le ante dritte, il buco nero) con le schegge e un tonfo
def('botola',function(x,y){const st={t:0},w=30,d=22,x0=x-w/2,y0=y-d/2,parts=[];shade(x0-2,y0-2,w+4,d+4,3,.3);
  E(parts,...box(x0-3,y0-3,0,w+6,d+6,2.2,'oldwood',{ow:1.4}));
  for(const t of[...box(x0,y0,2.2,w/2-.6,d,1.6,'plankD',{noFoot:true,ow:1.2}),...box(x0+w/2+.6,y0,2.2,w/2-.6,d,1.6,'plankD',{noFoot:true,ow:1.2})]){t.vis=()=>!(st.t>0);parts.push(t)}
  const pit=fn3(S2=>{const a=S2(x0,y0,2.4),b=S2(x0+w,y0,2.4),c=S2(x0+w,y0+d,2.4),e=S2(x0,y0+d,2.4);ctx.fillStyle='#060403';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...e);ctx.closePath();ctx.fill()},{fp:[[x0,y0],[x0+w,y0],[x0+w,y0+d],[x0,y0+d]],z:[2,3]});pit.vis=()=>st.t>0;parts.push(pit);
  for(const pl of[plane(x0-.5,y0+d,2.2,d,w/2-.6,-Math.PI/2,'botolaA',leafPaint('#3a2a1a')),plane(x0+w+.5,y0,2.2,d,w/2-.6,Math.PI/2,'botolaA',leafPaint('#3a2a1a'))]){pl.vis=()=>st.t>0;parts.push(pl)}
  prop({bx:[x0-4,y0-4,x0+w+4,y0+d+4,20],parts,noSplit:true});ANIM.push(dt=>{if(st.t>0)st.t-=dt});
  return{bang(){st.t=2.2;if(ZM.barriere)ZM.barriere.burst('truciolo',x,y,6,6,[0,0],20);try{if(AU.ctx&&AU.on.sfx){const t=AU.ctx.currentTime+.01;fThump(t,70,40,.5,.5,.3)}}catch(e){}}}});
// ------------------------------------------------------------------ il MERCATO: banchi col tendone a strisce strappato, casse di roba marcia, la
// bacheca con i fogli dei dispersi, il carretto rovesciato (da sotto escono gli zombie)
def('bancarella',function(x,y,col){const w=56,d=30,parts=[];solid(x,y+6,w,d-6);shade(x,y,w,d,58,.4);
  for(const[dx,dy] of[[0,0],[w-4,0],[0,d-4],[w-4,d-4]])E(parts,...box(x+dx,y+dy,0,4,4,dy?44:56,'post',{ow:1.4}));
  E(parts,...box(x,y+8,18,w,d-8,3,'plankD',{noFoot:true,ow:1.6}),...box(x,y+8,0,w,2.4,18,'oldwood',{ow:1.4}));
  const tex=(w2,h2)=>{ctx.fillStyle=col==='B'?'#3a4a6a':'#7a3a32';ctx.fillRect(0,0,w2,h2);ctx.fillStyle='rgba(230,220,200,.75)';for(let u=0;u<w2;u+=10)ctx.fillRect(u,0,5,h2);ctx.fillStyle='#0b0a10';ctx.beginPath();ctx.moveTo(w2*.6,h2);ctx.lineTo(w2*.66,h2*.4);ctx.lineTo(w2*.74,h2);ctx.fill()};
  E(parts,poly3([[x-3,y-3,58],[x+w+3,y-3,58],[x+w+3,y+d+3,44],[x-3,y+d+3,44]],col==='B'?'#3a4a6a':'#7a3a32',{ink:2}),plane(x-3,y+d+3,36,w+6,8,'x','tendone'+col,(w2,h2)=>{ctx.fillStyle=col==='B'?'#3a4a6a':'#7a3a32';ctx.fillRect(0,0,w2,h2);ctx.fillStyle='rgba(230,220,200,.75)';for(let u=0;u<w2;u+=10)ctx.fillRect(u,0,5,h2-2);for(let u=2;u<w2;u+=7){ctx.fillStyle=col==='B'?'#3a4a6a':'#7a3a32';ctx.beginPath();ctx.moveTo(u,h2-2);ctx.lineTo(u+3.5,h2);ctx.lineTo(u+7,h2-2);ctx.fill()}}));
  for(let i=0;i<4;i++)E(parts,ballAt([x+10+i*12,y+20,23],4.2,i%2?'pumpkin':'leafA',{ow:1.2}));
  prop({bx:[x-6,y-6,x+w+6,y+d+6,62],parts,noSplit:true})});
def('bacheca',function(x,y){const parts=[];solid(x-22,y-4,44,8);E(parts,...box(x-22,y-2,0,4,4,52,'post',{ow:1.4}),...box(x+18,y-2,0,4,4,52,'post',{ow:1.4}),...box(x-22,y-1,22,44,2,30,'plankD',{noFoot:true,ow:1.6,tex:{s:(w2,h2)=>{const r=prng(x+y);
    for(let i=0;i<5;i++){const px=2+r()*(w2-14),py=2+r()*(h2-14),pw=9+r()*4,ph=11+r()*3;ctx.save();ctx.translate(px+pw/2,py+ph/2);ctx.rotate((r()-.5)*.3);ctx.fillStyle=i%2?'#d8ceb0':'#c8bc9a';ctx.fillRect(-pw/2,-ph/2,pw,ph);ctx.fillStyle='rgba(40,30,20,.7)';
      ctx.beginPath();ctx.ellipse(0,-ph*.15,2.4,3,0,0,TAU);ctx.fill();for(let k=0;k<3;k++)ctx.fillRect(-pw*.35,ph*.12+k*1.8,pw*.7,.6);ctx.fillStyle='#a02a22';ctx.beginPath();ctx.arc(0,-ph/2+.6,.8,0,TAU);ctx.fill();ctx.restore()}}}}),...box(x-25,y-4,52,50,8,3,'plankD',{noFoot:true,ow:1.4}));
  prop({bx:[x-26,y-6,x+26,y+6,56],parts,noSplit:true})});
def('carrettoRovesciato',function(x,y){const parts=[],w=60,d=34;solid(x,y,w,d);shade(x,y,w,d,26,.4);
  // il cassone a pancia in su, una ruota per aria che gira piano, l'altra a terra spezzata, le stanghe rotte; sacchi e cavoli sparsi
  E(parts,...box(x,y,0,w,d,22,'plankD',{ow:1.8,tex:{t:(w2,h2)=>{ctx.strokeStyle='rgba(20,12,6,.5)';ctx.lineWidth=1;for(let u=8;u<w2;u+=8){ctx.beginPath();ctx.moveTo(u,0);ctx.lineTo(u,h2);ctx.stroke()}}}}),...box(x+6,y+4,22,6,d-8,4,'wood',{noFoot:true,ow:1.4}),...box(x+w-12,y+4,22,6,d-8,4,'wood',{noFoot:true,ow:1.4}));
  E(parts,fn3(S2=>ZM.cartWheel(x+w*.5,y-1,30+.0001*Math.sin(W.t),14,(a,b,c)=>{const t=W.t*.6,ca=Math.cos(t),sa=Math.sin(t),dx=a-(x+w*.5),dz=c-30;return S2(x+w*.5+dx*ca-dz*sa,b,30+dx*sa+dz*ca)}),{fp:[[x+w*.5-15,y-2],[x+w*.5+15,y-2],[x+w*.5+15,y],[x+w*.5-15,y]],z:[16,46]}));
  E(parts,line3([x+w,y+8,4],[x+w+28,y+2,0],'#5e4128',3,{ink:true}),line3([x+w,y+d-8,4],[x+w+14,y+d-2,10],'#5e4128',3,{ink:true}));
  for(const[sx,sy] of[[x-10,y+d+4],[x+w+6,y+d+10],[x-6,y-8]])E(parts,ballAt([sx,sy,6],7,'sack',{sq:.7,ow:1.6}));
  prop({bx:[x-18,y-14,x+w+30,y+d+16,48],parts,noSplit:true})});
// ------------------------------------------------------------------ la CARROZZA DELLA SCUOLA bruciata: il lungo carro coperto con le panche, nero di
// fuoco, il tetto sfondato, le ruote storte, la scritta SCUOLA mezza bruciata, il fumo che esce ancora; dalla porta in fondo escono gli zombie
def('carrozzaScuola',function(x,y){const w=150,d=56,zb=18,parts=[];solid(x,y,w,d);shade(x,y,w,d,60,.45);
  E(parts,...box(x,y,zb,w,d,4,'charred',{noFoot:true,ow:2}),...box(x,y,zb+4,w,3,30,'charred',{noFoot:true,ow:1.8,tex:{n:null}}),...box(x,y+d-3,zb+4,w,3,30,'charred',{noFoot:true,ow:1.8,tex:{s:(w2,h2)=>{ctx.fillStyle='#14100c';for(let i=0;i<6;i++)ctx.fillRect(10+i*23,5,15,10);
      ctx.font='400 9px "Lilita One",system-ui';ctx.fillStyle='rgba(200,170,90,.55)';ctx.fillText('SC   LA',w2*.38,h2-6);ctx.fillStyle='rgba(255,120,40,.25)';for(let i=0;i<5;i++)ctx.fillRect(12+i*28,h2-4,6,2)}}}),...box(x,y+3,zb+4,3,d-6,30,'charred',{noFoot:true,ow:1.8}),...box(x+w-3,y+3,zb+4,3,12,30,'charred',{noFoot:true,ow:1.8}),...box(x+w-3,y+d-15,zb+4,3,12,30,'charred',{noFoot:true,ow:1.8}));
  // il tetto: metà ancora su (le centine), metà crollata dentro; le panche nere dentro
  for(let i=0;i<7;i++){const u=x+8+i*22;E(parts,line3([u,y,zb+34],[u,y+d,zb+34],'#1a1412',2.6,{ink:true}))}
  E(parts,poly3([[x,y,zb+34],[x+w*.45,y,zb+34],[x+w*.45,y+d,zb+34],[x,y+d,zb+34]],'#2a2220',{ink:2}),poly3([[x+w*.5,y+4,zb+6],[x+w*.8,y+6,zb+20],[x+w*.78,y+d-4,zb+26],[x+w*.52,y+d-6,zb+8]],'#1e1816',{ink:1.6}));
  for(let i=0;i<5;i++)E(parts,...box(x+12+i*26,y+10,zb+4,14,10,8,'charred',{noFoot:true,noOut:true}),...box(x+12+i*26,y+d-20,zb+4,14,10,8,'charred',{noFoot:true,noOut:true}));
  for(const[wx,wy,tilt] of[[x+24,y-2,0],[x+w-30,y-2,.2],[x+24,y+d+2,-.15],[x+w-30,y+d+2,0]])E(parts,fn3(S2=>ZM.cartWheel(wx,wy,14,14,(a,b,c)=>S2(a,b+(c-14)*tilt,c)),{fp:[[wx-15,wy-1],[wx+15,wy-1],[wx+15,wy+1],[wx-15,wy+1]],z:[0,28]}));
  E(parts,line3([x,y+18,zb],[x-40,y+14,2],'#1a1412',3,{ink:true}),line3([x,y+d-18,zb],[x-38,y+d-12,0],'#1a1412',3,{ink:true}));
  if(!LOWFX)smokes.push({x:x+w*.6,y:y+d*.5,z:zb+20,t:0});lights.push({x:x+w*.6,y:y+d*.5,z:zb+10,r:60,rgb:'255,110,40',a:.22,fl:2});
  prop({bx:[x-44,y-6,x+w+4,y+d+6,zb+40],parts,noSplit:true})});
// ------------------------------------------------------------------ la SEGHERIA: la ruota del mulino sul fiume, le cataste di tronchi, la gru, il
// carro dei tronchi abbandonato, il banco della sega circolare (dentro l'edificio)
def('ruotaMulino',function(x,y){const R=40,parts=[];solid(x-8,y-6,16,12);
  E(parts,...box(x-10,y+6,0,20,10,52,'stoneW',{ow:1.8}),fn3(S2=>{const a0=W.t*.5,N=12,P3=(a,r)=>S2(x+Math.cos(a)*r,y,R+8+Math.sin(a)*r),c=S2(x,y,R+8);
    for(const r of[R,R-7]){ctx.beginPath();for(let i=0;i<=30;i++){const q=P3(i/30*TAU,r);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.strokeStyle=INK;ctx.lineWidth=4.4;ctx.stroke();ctx.strokeStyle='#5e4128';ctx.lineWidth=2.4;ctx.stroke()}
    for(let i=0;i<N;i++){const a=a0+i*TAU/N,p0=P3(a,R-7),p1=P3(a,R+4),q=P3(a,6);ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(c,q);ctx.stroke();seg(q,p0);ctx.stroke();ctx.strokeStyle='#7d5a38';ctx.lineWidth=1.2;seg(q,p0);ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=5;seg(p0,p1);ctx.stroke();ctx.strokeStyle='#6a5440';ctx.lineWidth=3;seg(p0,p1);ctx.stroke()}
    ctx.fillStyle='#34363e';ink(1.6);ctx.beginPath();ctx.arc(c[0],c[1],4,0,TAU);ctx.fill();ctx.stroke();
    if(!LOWFX){const b=P3(Math.PI*.5,R);for(let i=0;i<4;i++){ctx.fillStyle=`rgba(190,215,240,${.35-i*.07})`;ctx.beginPath();ctx.ellipse(b[0]+rr(-8,8),b[1]+4+i*2,6-i,2,0,0,TAU);ctx.fill()}}},{fp:[[x-R-4,y-2],[x+R+4,y-2],[x+R+4,y+2],[x-R-4,y+2]],z:[4,2*R+12]}));
  prop({bx:[x-R-6,y-8,x+R+6,y+18,2*R+16],parts,noSplit:true})});
def('cataste',function(x,y,w,d){const parts=[];solid(x,y,w,d);shade(x,y,w,d,34,.45);const r=prng(x*3+y),ends=(w2,h2)=>{ctx.fillStyle='#2a1c12';ctx.fillRect(0,0,w2,h2);const rr2=5.2;for(let row=0;row*rr2*1.75<h2+2;row++)for(let k=0;k*rr2*2<w2+4;k++){const cx=k*rr2*2+(row%2?rr2:0)+1,cy=h2-rr2-row*rr2*1.7;ctx.fillStyle=['#8a6a44','#7a5a38','#a07a50'][(k+row)%3];ctx.beginPath();ctx.arc(cx,cy,rr2-.6,0,TAU);ctx.fill();ctx.strokeStyle='rgba(40,24,10,.6)';ctx.lineWidth=.6;ctx.beginPath();ctx.arc(cx,cy,rr2*.45,0,TAU);ctx.stroke()}};
  E(parts,...box(x,y,0,w,d,30,'bark2',{ow:2,tex:{s:ends,n:ends}}),...box(x+6,y-3,0,4,d+6,40,'post',{ow:1.4}),...box(x+w-10,y-3,0,4,d+6,40,'post',{ow:1.4}));
  prop({bx:[x-2,y-5,x+w+2,y+d+5,42],parts,noSplit:true})});
def('gru',function(x,y){const parts=[];solid(x-7,y-7,14,14);E(parts,...box(x-6,y-6,0,12,12,96,'post',{ow:1.8}),line3([x,y,92],[x-56,y+18,104],'#5e4128',4.2,{ink:true}),line3([x,y,62],[x-40,y+12,98],'#5e4128',2.6,{ink:true}),
  fn3(S2=>{const sw=Math.sin(W.t*.8)*3,a=S2(x-54,y+18,103),b=S2(x-54+sw,y+18,46);ctx.strokeStyle='#2a2830';ctx.lineWidth=1.4;seg(a,b);ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(b[0],b[1]+4,3.4,-Math.PI*.2,Math.PI*1.1);ctx.stroke();ctx.strokeStyle='#6a6e7a';ctx.lineWidth=1.4;ctx.stroke()},{fp:[[x-60,y+14],[x-48,y+14],[x-48,y+22],[x-60,y+22]],z:[40,106]}));
  prop({bx:[x-62,y-8,x+8,y+24,110],parts,noSplit:true});perches.push({x:x-30,y:y+12,z:100,t:3})});
def('carroTronchi',function(x,y){const w=96,d=40,zb=16,parts=[];solid(x,y,w,d);shade(x,y,w,d,40,.42);
  E(parts,...box(x,y,zb,w,d,3,'plankD',{noFoot:true,ow:1.8}),...box(x+4,y,zb+3,4,4,22,'post',{noFoot:true,ow:1.2}),...box(x+w-8,y,zb+3,4,4,22,'post',{noFoot:true,ow:1.2}),...box(x+4,y+d-4,zb+3,4,4,22,'post',{noFoot:true,ow:1.2}),...box(x+w-8,y+d-4,zb+3,4,4,22,'post',{noFoot:true,ow:1.2}));
  for(let i=0;i<5;i++){const yy=y+5+i*7.4,zz=zb+3+(i%2?10:4.5);E(parts,...prismY(x-6,yy-4,w+12,[[0,zz],[3,zz-3.5],[7,zz],[3,zz+3.5]],'bark2',{m:{e:'logEnd',w:'logEnd'},ow:1.4}))}
  for(const[wx,wy] of[[x+22,y-2],[x+w-24,y-2],[x+22,y+d+2],[x+w-24,y+d+2]])E(parts,fn3(S2=>ZM.cartWheel(wx,wy,14,14,S2),{fp:[[wx-15,wy-1],[wx+15,wy-1],[wx+15,wy+1],[wx-15,wy+1]],z:[0,28]}));
  E(parts,line3([x,y+12,zb],[x-34,y+8,2],'#5e4128',3,{ink:true}),line3([x,y+d-12,zb],[x-34,y+d-8,1],'#5e4128',3,{ink:true}));
  prop({bx:[x-38,y-6,x+w+8,y+d+6,46],parts,noSplit:true})});
def('bancoSega',function(B,x,y){const parts=[];solid(x,y,96,34);E(parts,...box(x,y,0,96,34,24,'sawWood',{ow:2}),...box(x-2,y-2,24,100,38,3,'plankD',{noFoot:true,ow:1.6}));
  // la lama circolare che spunta dal banco e gira piano (si è fermata da sola, a metà di un tronco)
  E(parts,fn3(S2=>{const c=S2(x+48,y+17,27),a=W.t*.8,R=13;ctx.save();ctx.translate(c[0],c[1]);ctx.scale(1,.5);ctx.fillStyle='#8a8e98';ctx.beginPath();for(let i=0;i<24;i++){const t=a+i*TAU/24,rr2=i%2?R:R+2.6;ctx.lineTo(Math.cos(t)*rr2,Math.sin(t)*rr2)}ctx.closePath();ctx.fill();ink(1.4);ctx.stroke();ctx.fillStyle='#34363e';ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();ctx.restore()},{fp:[[x+33,y+5],[x+63,y+5],[x+63,y+29],[x+33,y+29]],z:[26,30]}));
  E(parts,...prismY(x+64,y+10,30,[[0,31],[6,27],[14,31],[6,35]],'bark2',{m:{e:'logEnd',w:'logEnd'},ow:1.4}));
  B.in(parts,[x-4,y-4,x+100,y+40,40])});
// le ROVINE oltre il bordo (si vedono, non ci si va): mezzi muri di pietra, una trave, un camino rimasto in piedi
def('rovine',function(x,y,w,d){const parts=[],r=prng(x+y*7);for(const[a,b,c,e,h] of[[x,y,w*.6,8,30+r()*24],[x,y,8,d*.7,22+r()*30],[x+w-8,y+d*.3,8,d*.7,14+r()*20]])E(parts,...box(a,b,0,c,e,h,'stoneW',{ow:2}));
  E(parts,...box(x+w*.5,y+4,0,14,14,70,'brick',{ow:2}),line3([x+8,y+10,26],[x+w*.6,y+d*.6,2],'#3c2817',4,{ink:true}));prop({bx:[x-2,y-2,x+w+2,y+d+2,74],parts})});
// ------------------------------------------------------------------ le BARRIERE A PAGAMENTO tra le zone (punto 16). k: 'carri' (un carro di fieno
// rovesciato con assi inchiodate e casse), 'tronchi' (tronchi incatenati di traverso), 'cancello' (il portone di legno della segheria con la catena).
// Lungo x (orizzontale) o lungo y. open(): la catena o le assi cadono, i pezzi si spostano di lato (0,9 s), polvere e schegge, poi i solidi
// della barriera spariscono; restano i pezzi spostati ai lati (coi loro solidi). close(): com'era. Ritorna {open, close, state, x, y}
def('barriera',function(x0,y0,x1,y1,k,price){const hor=Math.abs(y1-y0)<1,L=hor?x1-x0:y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2,st={open:false,t:-1},PR=ZM.props,SO=ZM.solids;
  const sets={shut:[],open:[]},sol={shut:[],open:[]},mark=(kk,f)=>{const i=PR.length,ns=SO.length;f();for(let j=i;j<PR.length;j++)sets[kk].push(PR[j]);for(let j=ns;j<SO.length;j++)sol[kk].push(SO[j])};
  const at=(u,v,z)=>hor?[x0+u,cy+v,z]:[cx+v,y0+u,z];// u lungo il varco, v di traverso
  const movers=[];// i pezzi che si spostano aprendo: {pts (parti con c), du, dv, dz, rot}
  const board=(w,h)=>{ctx.fillStyle='#2e2620';ctx.fillRect(0,0,w,h);ink(1.6);ctx.strokeRect(.8,.8,w-1.6,h-1.6);ctx.font='400 9.5px "Lilita One",system-ui';ctx.textAlign='center';ctx.textBaseline='middle';const s=String(price);ctx.fillStyle='rgba(235,232,222,.9)';ctx.fillText(s,w/2+3,h/2+.6);
    ctx.strokeStyle='rgba(235,232,222,.85)';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(w/2-ctx.measureText(s).width/2-1.5,h/2+.4,2.2,0,TAU);ctx.stroke()};
  mark('shut',()=>{const s=hor?solid(x0,cy-14,L,28):solid(cx-14,y0,28,L);s.noAO=true;const parts=[];
    if(k==='carri'){// il carro di fieno rovesciato di traverso, le assi inchiodate sopra, due casse
      const pbox=(u,v,z,a,b,c,m,o2)=>hor?box(x0+u,cy+v,z,a,b,c,m,o2):box(cx+v,y0+u,z,b,a,c,m,o2);
      E(parts,...pbox(6,-12,0,L-12,24,26,'plankD',{ow:2}),...pbox(4,-14,26,L-8,6,8,'hay',{noFoot:true,ow:1.4}));
      for(let i=0;i<3;i++){const z=6+i*9;E(parts,...(hor?prismX(x0-2,cy+13,2.4,[[0,z+(i%2?-2:2)],[L+4,z+(i%2?2:-2)],[L+4,z+5+(i%2?2:-2)],[0,z+5+(i%2?-2:2)]],i%2?'plankN':'oldwood',{ow:1.3}):prismY(cx+13,y0-2,2.4,[[0,z+(i%2?-2:2)],[L+4,z+(i%2?2:-2)],[L+4,z+5+(i%2?2:-2)],[0,z+5+(i%2?-2:2)]],i%2?'plankN':'oldwood',{ow:1.3})))}
      E(parts,...pbox(L*.15,16,0,20,18,18,'plank',{ow:1.6}),...pbox(L*.65,17,0,16,14,14,'plank',{ow:1.6}))}
    else if(k==='tronchi'){// la catasta di tronchi di traverso (come quelle della segheria): le teste dei tronchi ai due capi, tre tronchi sopra, la catena col lucchetto
      const ends=(w2,h2)=>{ctx.fillStyle='#2a1c12';ctx.fillRect(0,0,w2,h2);const rr2=5.2;for(let row=0;row*rr2*1.75<h2+2;row++)for(let q=0;q*rr2*2<w2+4;q++){const ex=q*rr2*2+(row%2?rr2:0)+1,ey=h2-rr2-row*rr2*1.7;ctx.fillStyle=['#8a6a44','#7a5a38','#a07a50'][(q+row)%3];ctx.beginPath();ctx.arc(ex,ey,rr2-.6,0,TAU);ctx.fill();ctx.strokeStyle='rgba(40,24,10,.6)';ctx.lineWidth=.6;ctx.beginPath();ctx.arc(ex,ey,rr2*.45,0,TAU);ctx.stroke()}};
      E(parts,...(hor?box(x0-4,cy-13,0,L+8,26,30,'bark2',{ow:2,tex:{e:ends,w:ends}}):box(cx-13,y0-4,0,26,L+8,30,'bark2',{ow:2,tex:{s:ends,n:ends}})));
      for(const o2 of[5,13,21]){const pr=[[o2-5,30],[o2+5,30],[o2+3.5,33.5],[o2,35],[o2-3.5,33.5]];E(parts,...(hor?prismY(x0-7,cy-13,L+14,pr,'bark2',{m:{e:'logEnd',w:'logEnd'},ow:1.4}):prismX(cx-13,y0-7,L+14,pr,'bark2',{m:{s:'logEnd',n:'logEnd'},ow:1.4})))}
      const link=(S2,u,v,z,a)=>{const p=S2(...at(u,v,z));ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(p[0],p[1],2.3,1.3,a,0,TAU);ctx.stroke();ctx.strokeStyle='#6a6e7a';ctx.lineWidth=1;ctx.stroke()};
      E(parts,fn3(S2=>{const u=L*.5;for(let i=0;i<4;i++)link(S2,u,-13.6,6+i*7,1.5+i%2);for(let i=0;i<7;i++)link(S2,u+(i%2?1:-1),-12+i*4,36,i*.8);for(let i=0;i<4;i++)link(S2,u,13.6,27-i*7,1.5+i%2);
        const q=S2(...at(u,0,37));ctx.fillStyle='#7a6224';ink(1.4);ctx.fillRect(q[0]-4,q[1]-4,8,7);ctx.strokeRect(q[0]-4,q[1]-4,8,7)},{fp:[at(L*.5-4,-15,0),at(L*.5+4,-15,0),at(L*.5+4,15,0),at(L*.5-4,15,0)],z:[0,40]}))}
    else{// il cancello di legno della segheria: due ante di assi con la croce, chiuse dalla catena col lucchetto
      const leaf=(w,h)=>{ctx.fillStyle='#5a4a3a';ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(20,12,6,.55)';ctx.lineWidth=1;for(let u=7;u<w;u+=7){ctx.beginPath();ctx.moveTo(u,0);ctx.lineTo(u,h);ctx.stroke()}ctx.strokeStyle='#3c2817';ctx.lineWidth=4;ctx.strokeRect(2,2,w-4,h-4);seg([3,h-3],[w-3,3]);ctx.stroke();ink(1.4);ctx.strokeRect(.7,.7,w-1.4,h-1.4)};
      E(parts,hor?plane(x0,cy,0,L/2,56,'x','cancSeg'+Math.round(L),leaf):plane(cx,y0,0,L/2,56,'y','cancSeg'+Math.round(L),leaf),hor?plane(x0+L/2,cy,0,L/2,56,'x','cancSeg'+Math.round(L),leaf):plane(cx,y0+L/2,0,L/2,56,'y','cancSeg'+Math.round(L),leaf));
      E(parts,fn3(S2=>{for(let i=0;i<7;i++){const p=S2(...at(L/2+(i%2?3:-3),i%2?1.6:-1.6,26+i*2.2));ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(p[0],p[1],2.4,1.3,i*.7,0,TAU);ctx.stroke();ctx.strokeStyle=i%2?'#6a6e7a':'#4a4e58';ctx.lineWidth=1;ctx.stroke()}
        const q=S2(...at(L/2,3,22));ctx.fillStyle='#7a6224';ink(1.4);ctx.fillRect(q[0]-4,q[1]-4,8,7);ctx.strokeRect(q[0]-4,q[1]-4,8,7)},{fp:[at(L/2-6,-4,0),at(L/2+6,-4,0),at(L/2+6,5,0),at(L/2-6,5,0)],z:[18,44]}))}
    // la tavoletta col prezzo, appesa davanti
    const bp=hor?plane(cx-12,cy+15,30,24,12,'x','tavB'+price,board):plane(cx-12,k==='tronchi'?y1+4.6:y1-5.4,12,24,12,'x','tavB'+price,board);E(parts,bp);// (di traverso: inchiodata in fondo, verso sud)
    const pr=prop({bx:hor?[x0-8,cy-16,x1+8,cy+20,60]:[cx-16,y0-8,cx+20,y1+8,60],parts,noSplit:true});movers.push(pr)});
  // aperta: i pezzi spostati ai due lati (carro e casse, tronchi, ante spalancate) e i loro solidi
  mark('open',()=>{const side=(u0,u1,v0,v1,h,m)=>{const a=at(u0,v0,0),b=at(u1,v1,0),xa=Math.min(a[0],b[0]),ya=Math.min(a[1],b[1]),wa2=Math.abs(b[0]-a[0]),da=Math.abs(b[1]-a[1]);solid(xa,ya,wa2,da);prop({bx:[xa-2,ya-2,xa+wa2+2,ya+da+2,h+4],parts:box(xa,ya,0,wa2,da,h,m,{ow:2})})};
    if(k==='carri'){side(-6,10,18,40,24,'plankD');side(L-16,L+4,18,38,18,'plank')}
    else if(k==='tronchi'){side(-30,-4,-12,12,14,'bark2');side(L+4,L+30,-12,12,14,'bark2')}
    else{side(-4,2,-2,40,56,'oldwood');side(L-2,L+4,-2,40,56,'oldwood')}});
  for(const p of sets.open)p.hide=true;for(const s of sol.open)s.off=true;
  const ctl={state:st,x:cx,y:cy,open(){if(st.open)return;st.open=true;st.t=0;for(const s of sol.shut)s.off=true;for(const s of sol.open)s.off=false;if(ZM.barriere)ZM.barriere.burst(k==='tronchi'?'scheggia':'truciolo',cx,cy,20,14,[0,1],60)},
    close(){st.open=false;st.t=-1;st.done=false;for(const s of sol.shut)s.off=false;for(const s of sol.open)s.off=true;for(const p of sets.shut){p.hide=false;p.fade=1}for(const p of sets.open)p.hide=true},
    update(dt){if(st.t<0||st.done)return;st.t+=dt;const kk=cl(st.t/.9,0,1);for(const p of sets.shut)p.fade=1-kk;if(kk>=1){st.done=true;for(const p of sets.shut)p.hide=true;for(const p of sets.open)p.hide=false}}};
  ANIM.push(dt=>ctl.update(dt));return ctl},()=>null);
// ------------------------------------------------------------------ i pennelli del terreno delle zone nuove: il fiume con le increspature, la
// riva fangosa, la segatura, la strada di terra battuta coi solchi
G.river=(x0,y0,x1,y1)=>{const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#0e1622');g.addColorStop(.5,'#16243a');g.addColorStop(1,'#1a2a40');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0);
  for(let i=0;i<(x1-x0)*(y1-y0)/220;i++){const x=rr(x0,x1),y=rr(y0+4,y1-4);ctx.strokeStyle=`rgba(${rr(0,1)<.5?'90,130,170':'140,170,200'},${rr(.08,.22)})`;ctx.lineWidth=rr(.8,1.6);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+rr(6,14),y-rr(1,2.5),x+rr(14,28),y);ctx.stroke()}
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x0,y1-6,x1-x0,6)};
G.bank=(x0,y0,x1,y1)=>{ctx.fillStyle='#3a3226';ctx.fillRect(x0,y0,x1-x0,y1-y0);for(let i=0;i<(x1-x0)*(y1-y0)/40;i++){ctx.fillStyle=rr(0,1)<.5?'rgba(20,14,8,.35)':'rgba(90,80,60,.25)';ctx.beginPath();ctx.ellipse(rr(x0,x1),rr(y0,y1),rr(1,3),rr(.6,1.6),rr(0,3),0,TAU);ctx.fill()}
  for(let i=0;i<(x1-x0)/9;i++){const x=rr(x0,x1),y=rr(y0,y0+6);ctx.strokeStyle='rgba(70,90,50,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y+6);ctx.lineTo(x+rr(-2,2),y-rr(4,9));ctx.stroke()}};
G.sawdust=(cx,cy,rx,ry)=>{for(let i=0;i<rx*ry/6;i++){const a=rr(0,TAU),d=Math.pow(rr(0,1),.6),x=cx+Math.cos(a)*rx*d,y=cy+Math.sin(a)*ry*d;ctx.fillStyle=rr(0,1)<.5?'rgba(200,170,110,.5)':'rgba(170,140,90,.45)';ctx.fillRect(x,y,rr(1,2.4),rr(.6,1.4))}};
G.ruts=(x0,y0,x1,y1)=>{ctx.fillStyle='#3a332b';ctx.fillRect(x0,y0,x1-x0,y1-y0);for(const f of[.3,.7]){const y=y0+(y1-y0)*f;ctx.strokeStyle='rgba(20,14,10,.45)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x0,y);for(let x=x0;x<=x1;x+=30)ctx.lineTo(x,y+Math.sin(x*.03)*2);ctx.stroke()}};
})();
