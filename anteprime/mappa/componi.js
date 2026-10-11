// Tavole per Denis con gli sprite della mappa zombie. Si esegue dentro il gioco con __E, dopo disegno_mostri.js (CR) e
// disegno_mappa.js (MAPPA). Ogni tavola si disegna su una tela a parte (ctx viene scambiato e poi rimesso) e torna come PNG.
window.FOTO=(()=>{
const M=MAPPA,TAU=Math.PI*2,FT='"Lilita One","Baloo 2",system-ui,sans-serif',FB='"Baloo 2",system-ui,sans-serif',T0=1.7;
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function tela(W,H,draw,sc){sc=sc||2;const c=document.createElement('canvas');c.width=W*sc;c.height=H*sc;
  const old=ctx,ns=noShadow,lf=LOWFX,gt=G.t;ctx=c.getContext('2d');noShadow=false;LOWFX=false;G.t=T0;
  try{ctx.setTransform(sc,0,0,sc,0,0);sfondo(W,H);draw(W,H)}finally{ctx=old;noShadow=ns;LOWFX=lf;G.t=gt}
  return c.toDataURL('image/png')}
// the board itself: dark warm stone like the crypt menu
function sfondo(W,H){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#262019');g.addColorStop(1,'#17130f');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const R=M.rng(9);for(let i=0;i<W*H/700;i++){ctx.fillStyle=R()<.5?'rgba(255,240,210,.025)':'rgba(0,0,0,.14)';ctx.beginPath();ctx.ellipse(R()*W,R()*H,2+R()*9,1+R()*4,0,0,TAU);ctx.fill()}}
function titolo(x,y,txt,s){s=s||28;ctx.save();ctx.font=`${s}px ${FT}`;ctx.lineJoin='round';ctx.lineWidth=s*.22;ctx.strokeStyle=INK;ctx.strokeText(txt,x,y);ctx.fillStyle='#f4e6c2';ctx.fillText(txt,x,y);ctx.restore()}
function riga(x,y,txt,s,col,al){ctx.save();ctx.font=`600 ${s||13}px ${FB}`;ctx.textAlign=al||'left';ctx.fillStyle=col||'#cbb994';ctx.fillText(txt,x,y);ctx.restore()}
function etichetta(cx,y,txt,s){s=s||16;ctx.save();ctx.font=`${s}px ${FT}`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=s*.28;ctx.strokeStyle=INK;ctx.strokeText(txt,cx,y);ctx.fillStyle='#f0dcae';ctx.fillText(txt,cx,y);ctx.restore()}
// a framed patch of ground with things on it; zoom=[cx,cy,z] makes it a close-up (ground and things grow together around cx,cy)
function pannello(x,y,w,h,zona,seed,draw,zoom,op){ctx.save();ctx.fillStyle='rgba(0,0,0,.45)';rr(x+3,y+5,w,h,12);ctx.fill();
  ctx.save();rr(x,y,w,h,10);ctx.clip();
  if(zoom){const[zx,zy,z]=zoom,pad=14/z;ctx.translate(zx,zy);ctx.scale(z,z);ctx.translate(-zx,-zy);M.terreno(zx-(zx-x)/z-pad,zy-(zy-y)/z-pad,w/z+2*pad,h/z+2*pad,zona,seed,op)}
  else M.terreno(x,y,w,h,zona,seed,op);
  if(draw)draw();ctx.restore();
  ctx.save();rr(x,y,w,h,10);ctx.clip();const g=ctx.createRadialGradient(x+w/2,y+h/2,Math.min(w,h)*.4,x+w/2,y+h/2,Math.max(w,h)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.32)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);ctx.restore();
  ctx.lineWidth=3.5;ctx.strokeStyle=INK;rr(x,y,w,h,10);ctx.stroke();ctx.lineWidth=1.2;ctx.strokeStyle='rgba(240,222,180,.22)';rr(x+3,y+3,w-6,h-6,8);ctx.stroke();ctx.restore()}
// the real hero and the real zombies, for size (feet on the ground at x,y)
function eroe(x,y,face,walk,mov){const S=heroStyle();drawRig(x,y-8*S.sc,face,walk||0,!!mov,S,{})}
function zombi(x,y,face,anim,p,sc){CR.zombie(x,y,face,anim||'idle',p||0,sc||1.1)}
const CASA={w:168,d:118,H:56,muro:'assi',tetto:'tegole',extra:'casa',seed:7};

// ---------------------------------------------------------------- 1. the houses: the roof goes away when you go in
function tavolaCase(){return tela(760,812,(W,H)=>{
  titolo(20,42,'Mappa zombie · le case',30);
  riga(22,66,'Si entra senza cambiare stanza: sulla soglia il tetto sfuma e si vede dentro. Uscendo torna.',13.5);
  [[1,'Fuori'],[.45,'Sulla soglia'],[0,'Dentro']].forEach(([roof,lab],i)=>{const px=16+i*248,py=84,pw=232,ph=300,o={...CASA,armadioAperto:roof===0},
      x0=px+(pw-o.w)/2-7,y0=py+88,dx=x0+o.w*.5+13;
    if(roof===0)o.dentro=()=>{const zx=x0+32,zy=y0+44,hx=dx,hy=y0+o.d-8;zombi(zx,zy,Math.atan2(hy-zy,hx-zx),'walk',.3);eroe(hx,hy,Math.atan2(zy-hy,zx-hx),0,false)};
    pannello(px,py,pw,ph,'quartiere',11+i,()=>{
      M.edificio(x0,y0,o,roof,T0);
      if(roof===1)eroe(dx,y0+o.d+26,-Math.PI/2,1.2,true);
      else if(roof<1&&roof>0)eroe(dx,y0+o.d-3,-Math.PI/2,2.4,true)},null,{marciapiede:[y0+o.d-34,y0+o.d+38]});
    etichetta(px+pw/2,py+ph+26,lab,18)});
  const py2=438,ph2=300;
  pannello(16,py2,360,ph2,'cimitero',21,()=>{const R=M.rng(5),o={w:124,d:108,H:60,muro:'pietra',tetto:'ardesia',extra:'cappella',seed:3},x0=16+(360-124)/2-7,y0=py2+114;
    M.albero(58,py2+214,.95,R,T0);M.edificio(x0,y0,o,1,T0);
    M.lapide(302,py2+248,.9,.08,R);M.lapide(62,py2+266,.85,-.1,R);M.croce(344,py2+274,.85,R);M.lapide(300,py2+292,.8,-.05,R)});
  etichetta(196,py2+ph2+26,'Cappella: pietra e ardesia',18);
  pannello(384,py2,360,ph2,'fattoria',31,()=>{const R=M.rng(8),o={w:172,d:108,H:62,muro:'rosso',tetto:'scandole',extra:'fienile',seed:5},x0=384+(360-172)/2-7,y0=py2+110;
    M.edificio(x0,y0,o,1,T0);M.spaventapasseri(420,py2+284,R,T0);M.fieno(702,py2+262,R);M.zucca(672,py2+290,T0)});
  etichetta(564,py2+ph2+26,'Fienile: assi rosse e scandole',18);
  riga(22,H-14,"Nel gioco i pezzi fermi si disegnano una volta in un'immagine, come le rocce; fiamme, corvo, cespugli e buche restano animati.",13)})}

// ---------------------------------------------------------------- 2. ground of the zones and things on the map
function tavolaOggetti(){return tela(760,918,(W,H)=>{
  titolo(20,42,'Mappa zombie · terreno e oggetti',30);
  riga(22,66,'Tre zone, ognuna col suo terreno. Il terreno resta più spento: personaggi e oggetti devono risaltare.',13.5);
  [['cimitero','Cimitero'],['quartiere','Quartiere'],['fattoria','Fattoria']].forEach(([z,l],i)=>{const px=16+i*248;pannello(px,84,232,140,z,41+i);etichetta(px+116,250,l,18)});
  titolo(20,300,'Oggetti',24);
  const IT=[['cimitero','Lapide',1.75,(x,y,R,t)=>M.lapide(x,y,1,-.06,R)],
    ['cimitero','Croce',1.75,(x,y,R,t)=>M.croce(x,y,1,R)],
    ['cimitero','Recinto rotto',1.55,(x,y,R,t)=>M.recinto(x-36,y,72,R)],
    ['cimitero','Cancello',1.5,(x,y,R,t)=>M.cancello(x,y,R)],
    ['cimitero','Albero col gufo',1.12,(x,y,R,t)=>M.albero(x,y,1,R,t)],
    ['cimitero','Cespuglio',1.8,(x,y,R,t)=>M.cespuglio(x,y,1,R,t,false)],
    ['quartiere','Lampione',1.25,(x,y,R,t)=>M.lampione(x+4,y,t,'255,200,110',1)],
    ['quartiere','Botte',2.1,(x,y,R,t)=>M.botte(x,y,1)],
    ['quartiere','Cassa',2.1,(x,y,R,t)=>M.cassa(x,y,1)],
    ['quartiere','Baule',1.9,(x,y,R,t)=>M.baule(x,y,t)],
    ['fattoria','Carretto',1.45,(x,y,R,t)=>M.carretto(x-4,y,R)],
    ['fattoria','Pozzo',1.5,(x,y,R,t)=>M.pozzo(x,y,R,t)],
    ['fattoria','Spaventapasseri',1.45,(x,y,R,t)=>M.spaventapasseri(x,y,R,t)],
    ['fattoria','Fieno',1.9,(x,y,R,t)=>M.fieno(x,y,R)],
    ['fattoria','Zucca',2.2,(x,y,R,t)=>M.zucca(x,y,t)]];
  IT.forEach(([z,l,Z,f],i)=>{const c=i%5,r=Math.floor(i/5),px=16+c*148,py=318+r*186,pw=136,ph=150,zx=px+pw/2,zy=py+ph/2;
    pannello(px,py,pw,ph,z,60+i,()=>f(zx-2,zy+(ph/2-26)/Z,M.rng(70+i),T0),[zx,zy,Z],{pulito:true});etichetta(px+pw/2,py+ph+22,l,15)});
  riga(22,H-32,"Tutti dipinti come lo Zombie della lanterna: luce calda dall'alto a sinistra, tre toni, un filo di luce nel contorno,",13);
  riga(22,H-13,"contorno scuro spesso. Qui sono ingranditi per vederli bene; nelle scene sul telefono hanno la misura vera.",13)})}

// ---------------------------------------------------------------- 3. zombies coming out of the ground
function zombieTerra(){return tela(760,348,(W,H)=>{
  titolo(20,42,'Gli zombie escono da terra',30);
  riga(22,66,"Prima la terra si gonfia e trema (è l'avviso), poi si apre e lo zombie si arrampica fuori: mai dal nulla davanti all'eroe.",13.5);
  [[.15,'1 · trema'],[.36,'2 · si apre'],[.56,'3 · le mani'],[.8,'4 · si tira su'],[1,'5 · eccolo'],[-1,'dal cespuglio']].forEach(([k,l],i)=>{
    const px=14+i*124,py=84,pw=116,ph=208,cx=px+pw/2,cy=py+ph/2+6,t=T0+i*.13;
    pannello(px,py,pw,ph,'cimitero',90+i,()=>{
      if(k<0){zombi(cx-5,cy+12,Math.PI/2+.25,'walk',.15);M.cespuglio(cx,cy+30,1.2,M.rng(4),t,true);return}
      if(k===1){M.buca(cx,cy-8,1,t,null);zombi(cx+5,cy+34,Math.PI/2-.3,'walk',.62);return}
      M.buca(cx,cy+16,k,t,(x,y,q)=>zombi(x,y,Math.PI/2,'attack',q<.4?.3:.5))},[cx,cy,1.9]);
    etichetta(cx,py+ph+26,l,15)})})}

// ---------------------------------------------------------------- 4. two phone screens: outside and inside, same framing
function mondo(dentro){const t=T0;
  M.terreno(0,0,360,640,'cimitero',5);
  const o={...CASA,armadioAperto:dentro},x0=96,y0=118,dx=x0+o.w*.5+13,lz={x:272,y:516},zb={x:104,y:478},z2={x:56,y:568};
  const hx=dentro?dx:186,hy=dentro?y0+o.d-8:590;
  if(dentro)o.dentro=()=>{const zx=x0+32,zy=y0+44;zombi(zx,zy,Math.atan2(hy-zy,hx-zx),'walk',.3);eroe(hx,hy,Math.atan2(zy-hy,zx-hx),0,false)};
  const L=[],add=(y,f)=>L.push({y,f});
  add(240,()=>M.albero(40,240,1.1,M.rng(3),t));
  add(y0+o.d,()=>M.edificio(x0,y0,o,dentro?0:1,t));
  add(250,()=>M.zucca(150,250,t));
  add(258,()=>M.lampione(300,258,t,'255,200,110',1.1));
  add(306,()=>M.recinto(6,306,140,M.rng(21)));
  add(306.1,()=>M.cancello(dx,306,M.rng(22)));
  add(306.2,()=>M.recinto(236,306,118,M.rng(23)));
  for(const[x,y,s,tl,k] of [[64,392,1,-.08,'l'],[300,386,1,0,'c'],[134,418,.95,.06,'l'],[246,440,1,.1,'l'],[332,464,.9,0,'c'],[34,476,.9,-.12,'l'],[178,502,.9,.04,'l']])
    add(y,()=>k==='l'?M.lapide(x,y,s,tl,M.rng(x)):M.croce(x,y,s,M.rng(x)));
  add(zb.y,()=>M.buca(zb.x,zb.y,.74,t,(x,y,q)=>zombi(x,y,Math.PI/2-.3,'attack',.52)));
  add(lz.y,()=>CR.lanterna(lz.x,lz.y,Math.atan2(hy-lz.y,hx-lz.x),'walk',.35,1.55));
  add(z2.y,()=>zombi(z2.x,z2.y,Math.atan2(hy-z2.y,hx-z2.x),'walk',.7));
  add(604,()=>M.cespuglio(330,604,1.15,M.rng(7),t,true));
  if(!dentro)add(hy,()=>eroe(hx,hy,Math.atan2(lz.y-hy,lz.x-hx),0,false));
  L.sort((a,b)=>a.y-b.y).forEach(e=>e.f());
  notte(dentro,{x0,y0,o,hx,hy,lz})}
// night: a dark veil with holes where the lights are; inside the house the veil goes away, outside it gets darker
function notte(dentro,s){const sc=2,c=document.createElement('canvas');c.width=360*sc;c.height=640*sc;const d=c.getContext('2d');d.scale(sc,sc);
  d.fillStyle=dentro?'rgba(6,8,22,.66)':'rgba(6,8,22,.5)';d.fillRect(0,0,360,640);d.globalCompositeOperation='destination-out';
  const hole=(x,y,r,a)=>{const g=d.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=g;d.fillRect(x-r,y-r,r*2,r*2)};
  const lx=dentro?s.lz.x-8:s.lz.x-38,ly=dentro?s.lz.y-30:s.lz.y-12;hole(310,192,120,.95);hole(150,242,46,.7);hole(lx,ly,dentro?70:92,dentro?.6:.85);hole(s.hx,s.hy-14,dentro?60:100,.8);
  if(dentro){const{x0,y0,o}=s;d.filter='blur(6px)';d.fillStyle='rgba(0,0,0,.9)';d.fillRect(x0-8,y0-o.H-7,o.w+16,o.H+7+o.d);d.filter='none'}
  ctx.drawImage(c,0,0,360,640);
  ctx.save();ctx.globalCompositeOperation='lighter';glow('255,190,100',310,192,90,.16);glow('255,170,80',lx,ly,60,dentro?.06:.14);ctx.restore();
  const g=ctx.createRadialGradient(180,330,170,180,330,420);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=g;ctx.fillRect(0,0,360,640)}
function scene(){return tela(776,778,(W,H)=>{
  titolo(20,42,'Così sul telefono',30);
  riga(22,66,"Stessa inquadratura, di notte: a sinistra l'eroe è fuori, a destra è entrato e il tetto non c'è più.",13.5);
  [[0,'Fuori'],[1,'Dentro']].forEach(([den,l],i)=>{const fx=16+i*384,fy=84;
    ctx.save();ctx.fillStyle='rgba(0,0,0,.5)';rr(fx+4,fy+6,360,640,22);ctx.fill();ctx.translate(fx,fy);rr(0,0,360,640,20);ctx.clip();mondo(!!den);ctx.restore();
    ctx.lineWidth=4;ctx.strokeStyle=INK;rr(fx,fy,360,640,20);ctx.stroke();
    etichetta(fx+180,fy+640+30,l,20)})})}
return{tavolaCase,tavolaOggetti,zombieTerra,scene,tela,mondo}})();
