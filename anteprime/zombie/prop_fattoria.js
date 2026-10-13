// ---------- PROP della Fattoria dei Corvi e delle aggiunte all'area di partenza: cancello di ferro col prezzo, armi a muro col gesso,
// granturco, spaventapasseri sul palo, mulino, fienile, pompa, abbeveratoio, cuccia, pollaio, tettoia col carretto del Becchino, rimessa con la
// mola, sacchi, catasta, ceppo con l'accetta, stendibiancheria, latrina, lanterna sul palo. Costruiti come quelli di prop.js (volumi 3D che si
// piegano via dall'eroe, tre toni per faccia, contorno scuro, la luna a ovest); in fondo i pennelli del terreno della fattoria.
// Mondo antico: lanterne, candele, legno, ferro battuto; niente motori.
(()=>{
const{T,S,LS,decals,stand,add3,rnd,rr,srand,ink,path,hull,face,hullOf,ballAt,line3,poly3,fn3,box,prismX,prismY,plane,cyl,prop,solid,shade,shadeR,lights,flames,holes,houses,smokes,perches,MAT,material,wa,mix,cl,lerp,ez,TAU,ball,seg,grp,facing,across,onGround,W,CAM}=ZM,P=ZM.P,G=ZM.G;
const E=(a,...b)=>a.push(...b),tag=(parts,t)=>{for(const p of parts)p.part=t;return parts};
const ANIM=ZM.anim=ZM.anim||[];// le cose che si muovono da sole (ante, porte): f(dt) a ogni fotogramma (l'area le chiama in update)
// come in prop.js: il nome del prop e il punto (o il riquadro) della sua piega mentre si costruisce
const def=(name,f,rf)=>{rf=rf||(a=>typeof a[0]==='number'&&typeof a[1]==='number'?[a[0],a[1]]:null);P[name]=function(...a){const N=ZM.NAMES,sv=N.cur,sr=N.ref;N.cur=name;N.ref=N.grp||rf(a);try{return f.apply(this,a)}finally{N.cur=sv;N.ref=sr}}};
// un generatore a caso tutto suo (le immagini fatte una volta non toccano il seme del motore)
const prng=s=>{s=(s%2147483646)+1;return()=>(s=(s*16807)%2147483647)/2147483647};
material('barnRed',['#7b2e26','#521c17','#9c4236'],'plank');material('barnRoof',['#3e3a42','#262328','#56505a'],'shingle');material('trim',['#a39a84','#716a5a','#c4bba4'],'wood');
material('canvas',['#b0a68c','#7e765f','#d0c7ae'],'cloth');material('sack',['#8a7a5a','#5e5238','#a8987a'],'cloth');material('millWood',['#5a4a3a','#36291e','#7a6a56'],'plank');
material('water',['#141a28','#0a0e18','#2a3448'],'flat');material('brass',['#8a7030','#5a4818','#c8a850'],'iron');
const bar=(a,b,wd,c)=>{ctx.strokeStyle=INK;ctx.lineWidth=wd+2;seg(a,b);ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=wd;seg(a,b);ctx.stroke()};
const glassTex=(w2,h2)=>{const gr=ctx.createRadialGradient(w2/2,h2*.55,1,w2/2,h2*.55,w2*.7);gr.addColorStop(0,'rgba(255,245,210,.9)');gr.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,w2,h2);ctx.fillStyle='#1d1e23';ctx.fillRect(w2/2-.6,0,1.2,h2)};
// una lanterna appesa (vetri accesi, cappello di ferro, anello): i pezzi, la fiamma e la luce. c: [x,y,z] del fondo; rgb del vetro
// (o.glass==='dark': vetro scuro, la luce la danno solo la fiamma e il bagliore, che si possono spegnere: la Lanterna delle Anime)
const darkGlass=(w2,h2)=>{ctx.fillStyle='rgba(18,30,26,.92)';ctx.fillRect(0,0,w2,h2);ctx.strokeStyle='rgba(200,255,225,.22)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(w2*.2,h2*.85);ctx.lineTo(w2*.45,h2*.15);ctx.stroke();ctx.fillStyle='#1d1e23';ctx.fillRect(w2/2-.6,0,1.2,h2)};
function lantern(parts,x,y,z,o){o=o||{};const s=o.s||1,g=o.rgb||'255,200,120',gl=o.glass==='dark'?darkGlass:o.rgb?((w2,h2)=>{const gr=ctx.createRadialGradient(w2/2,h2*.55,1,w2/2,h2*.55,w2*.7);gr.addColorStop(0,`rgba(${g},.95)`);gr.addColorStop(1,`rgba(${g},0)`);ctx.fillStyle=gr;ctx.fillRect(0,0,w2,h2);ctx.fillStyle='#1d1e23';ctx.fillRect(w2/2-.6,0,1.2,h2)}):glassTex;
  E(parts,...box(x-4*s,y-4*s,z,8*s,8*s,11*s,o.rgb?'red':'glass',{noFoot:true,ink:1.2,tex:{s:gl,e:gl,w:gl,n:gl}}),...box(x-5*s,y-5*s,z+11*s,10*s,10*s,2*s,'iron',{noFoot:true,ow:1.4}),...box(x-5*s,y-5*s,z-2*s,10*s,10*s,2*s,'iron',{noFoot:true,ow:1.4}),ballAt([x,y,z+15*s],1.8*s,'iron',{ow:1.2}));
  flames.push({x,y,z:z+5*s,r:3*s,rgb:o.flame||g,glass:1,ky:y+5*s+1,lk:o.lk});lights.push({x,y:y+8,z:z+6,r:o.r||110,rgb:o.light||g,a:o.a||.45,fl:1,lk:o.lk,house:o.house||null})}

// ------------------------------------------------------------------ il cancello della Fattoria dei Corvi: due pilastri di pietra con la palla (su
// quello a ovest la lanterna), l'arco di ferro col nome e i corvi, due ante a sbarre con le punte a lancia che salgono verso il centro. Chiuso:
// la catena girata intorno alle sbarre di mezzo, il lucchetto, la tavoletta col prezzo scritto col gesso. open(): la catena cade, le ante si
// spalancano verso nord e restano aperte, catena e lucchetto a terra. Ritorna {open(), state}. Pezzi e solidi per punto (piega di ogni punto per
// conto suo, come muri e pilastri): così l'arco resta incollato alle palle e le ante ai pilastri
def('farmGate',function(x0,x1,y,price,name){const xm=(x0+x1)/2,L=xm-1-(x0+14),Hl=70,PR=ZM.props,st={open:false,t:-1},sets={shut:[],open:[]},sol={shut:[],open:[]};
  const mark=(k,f)=>{const i=PR.length,ns=ZM.solids.length;f();for(let j=i;j<PR.length;j++)sets[k].push(PR[j]);for(let j=ns;j<ZM.solids.length;j++)sol[k].push(ZM.solids[j])};
  // i pilastri
  for(const[px,lamp] of[[x0,1],[x1,0]]){solid(px-12,y-12,24,24);shade(px-12,y-12,24,24,84,.45);const parts=[];
    E(parts,...box(px-11,y-11,0,22,22,8,'stoneWD'),...box(px-10,y-10,8,20,20,54,'stoneW',{noFoot:true,tex:{s:(w2,h2)=>{ctx.strokeStyle='rgba(10,10,14,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w2*.3,0);ctx.lineTo(w2*.36,h2*.3);ctx.lineTo(w2*.28,h2*.5);ctx.stroke()}}}),...box(px-13,y-13,62,26,26,6,'stoneWD',{noFoot:true}),ballAt([px,y,76.5],8.5,'stoneW'));
    E(parts,fn3(S2=>{const q=S2(px,y,68);ctx.fillStyle='rgba(72,104,48,.55)';ctx.beginPath();ctx.ellipse(q[0]-3,q[1]-1,6,2.2,0,0,TAU);ctx.fill();for(const dx of[-7,5]){const a=S2(px+dx,y+13.3,62),b=S2(px+dx,y+13.3,62-rr(8,16));ctx.strokeStyle='rgba(56,86,40,.6)';ctx.lineWidth=2;seg(a,b);ctx.stroke()}}));
    if(lamp){// la mensola di ferro verso sud e la lanterna appesa: fa luce sul cancello e sul prezzo
      E(parts,line3([px,y+10,56],[px,y+22,56],'#34363e',2.6,{ink:true}),line3([px,y+10,48],[px,y+20,55],'#34363e',1.8,{ink:true}),line3([px,y+22,56],[px,y+22,52],'#1d1e23',1.2));
      lantern(parts,px,y+22,38,{s:1,r:130,a:.5})}
    prop({bx:[px-16,y-16,px+16,y+(lamp?30:16),88],parts,lk:.6,noSplit:true})}
  // l'arco di ferro col nome, appoggiato sulle due palle; due corvi in cima
  const arch=(w2,h2)=>{const cx=w2/2,ry0=h2-3,rx0=w2/2-1,rx1=rx0-11,ry1=ry0-11;ctx.lineCap='round';
      const ell=(rx,ry)=>{ctx.beginPath();ctx.ellipse(cx,h2,rx,ry,0,Math.PI,TAU)};ctx.strokeStyle=INK;ctx.lineWidth=4.4;ell(rx0,ry0);ctx.stroke();ell(rx1,ry1);ctx.stroke();ctx.strokeStyle='#3e424c';ctx.lineWidth=2.2;ell(rx0,ry0);ctx.stroke();ell(rx1,ry1);ctx.stroke();
      ctx.strokeStyle='rgba(200,215,255,.3)';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(cx,h2,rx0,ry0,0,Math.PI*1.05,Math.PI*1.5);ctx.stroke();
      for(let i=1;i<8;i++){const a=Math.PI+i/8*Math.PI,p0=[cx+Math.cos(a)*rx1,h2+Math.sin(a)*ry1],p1=[cx+Math.cos(a)*rx0,h2+Math.sin(a)*ry0];ctx.strokeStyle=INK;ctx.lineWidth=2.6;seg(p0,p1);ctx.stroke();ctx.strokeStyle='#3e424c';ctx.lineWidth=1;seg(p0,p1);ctx.stroke()}
      const txt=(name||'FATTORIA DEI CORVI').toUpperCase(),n=txt.length,rm=(rx0+rx1)/2,rym=(ry0+ry1)/2;ctx.font='400 7.6px "Lilita One",system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
      for(let i=0;i<n;i++){const a=Math.PI*1.12+(i+.5)/n*Math.PI*.76,px=cx+Math.cos(a)*rm,py=h2+Math.sin(a)*rym;if(txt[i]===' ')continue;ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI/2);ctx.lineWidth=2.6;ctx.strokeStyle=INK;ctx.strokeText(txt[i],0,0);ctx.fillStyle='#565a66';ctx.fillText(txt[i],0,0);ctx.fillStyle='rgba(200,215,255,.35)';ctx.fillText(txt[i],-.4,-.5);ctx.restore()}
      ctx.fillStyle='rgba(140,70,30,.45)';ctx.fillRect(cx+rx1*.5,h2-ry1*.6,2,5)};
  prop({bx:[x0-4,y-4,x1+4,y+4,128],parts:[plane(x0,y,85,x1-x0,40,'x','arco'+Math.round(x1-x0),arch)],lk:.6});
  perches.push({x:xm,y,z:124,t:0},{x:xm+22,y,z:118,t:2.2});
  // le ante: la texture (origine in alto a sinistra) va dalla cerniera (u=0) al centro (u=w); flip: l'anta a est, disegnata a specchio
  const leafTex=flip=>(w,h)=>{const X=u=>flip?w-u:u,top=u=>h-(56+10*Math.pow(u/w,1.3));ctx.lineCap='round';
    for(const z of[6,30,50])bar([X(0),h-z],[X(w),h-z],2,'#4a4e58');bar([X(1),h-6],[X(w-1),h-50],1.4,'#34363e');
    const nb=6;for(let j=0;j<=nb;j++){const u=1+j/nb*(w-2),tz=top(u);bar([X(u),h],[X(u),tz+5],1.7,'#34363e');ctx.strokeStyle='rgba(200,215,255,.22)';ctx.lineWidth=.6;seg([X(u)-.6,h],[X(u)-.6,tz+6]);ctx.stroke();
      ctx.fillStyle='#6a6e7a';ink(1.2);ctx.beginPath();ctx.moveTo(X(u)-2.8,tz+6);ctx.lineTo(X(u),tz-1);ctx.lineTo(X(u)+2.8,tz+6);ctx.closePath();ctx.fill();ctx.stroke();if(j%2===1){ctx.fillStyle='rgba(140,70,30,.5)';ctx.fillRect(X(u)-1,h-24,2,9)}}
    for(let j=0;j<nb;j++){const u=(j+.5)/nb*(w-2)+1,c=[X(u),h-56];ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(c[0],c[1],2.4,0,TAU*.8);ctx.stroke();ctx.strokeStyle='#4a4e58';ctx.lineWidth=1.1;ctx.stroke()}
    bar([X(0),h],[X(0),h-58],2.4,'#3a3e48');bar([X(w),h],[X(w),h-66],2.4,'#3a3e48')};
  // un'anta: la cerniera (hx, y), il verso dall'asse dalla cerniera al capo libero (angolo a); i due capi del pannello nell'ordine della texture
  const leafPts=(hx,a,east)=>{const ex=hx+Math.cos(a)*L,ey=y+Math.sin(a)*L,A=east?[ex,ey]:[hx,y],B=east?[hx,y]:[ex,ey];return[[A[0],A[1],0],[B[0],B[1],0],[B[0],B[1],Hl],[A[0],A[1],Hl]]};
  const HW=x0+14,HE=x1-14,OPEN=75*Math.PI/180;// aperte di tre quarti: da sud si vedono (a 90° sarebbero di taglio)
  const leaves={};mark('shut',()=>{solid(x0+12,y-3,x1-x0-24,6).noAO=true;
    for(const[k,hx,a,east] of[['w',HW,0,0],['e',HE,Math.PI,1]]){const pl=plane(0,0,0,L,Hl,'x','anta'+Math.round(L)+k,leafTex(east));pl.c=leafPts(hx,a,east);leaves[k]={pl,hx,a,east};
      prop({bx:[Math.min(hx,xm)-4,y-4,Math.max(hx,xm)+4,y+4,Hl+4],parts:[pl],lk:.6})}
    // la catena: tre giri intorno alle due sbarre di mezzo (la metà dietro e la metà davanti sono due pezzi: girando ognuna va dalla parte giusta delle
    // ante), il pezzo che pende col lucchetto; la tavoletta col prezzo appesa con due fili. Quando si apre cade (st.t)
    const fall=(z,i)=>{if(st.t<0)return z;const t=Math.max(0,st.t-i*.015);return Math.max(1,z-300*t*t)};
    const links=(front,S2)=>{const sw=st.t<0?Math.sin(W.t*1.7)*.8:0;for(let k=0;k<3;k++)for(let i=0;i<=6;i++){const a=(front?0:Math.PI)+i/6*Math.PI,zc=fall(27+k*4+i*.5,k*7+i),p=S2(xm+Math.cos(a)*5.5,y+Math.sin(a)*3.2,zc),an=(i%2?.9:-.3)+a;
        ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(p[0],p[1],2.3,1.3,an,0,TAU);ctx.stroke();ctx.strokeStyle=i%2?'#6a6e7a':'#4a4e58';ctx.lineWidth=1.1;ctx.stroke()}
      if(!front)return;for(let i=0;i<4;i++){const p=S2(xm+sw*.3*i,y+3.6,fall(25-i*3.4,20+i));ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(p[0],p[1],1.3,2.2,0,0,TAU);ctx.stroke();ctx.strokeStyle=i%2?'#6a6e7a':'#4a4e58';ctx.lineWidth=1.1;ctx.stroke()}
      const q=S2(xm+sw,y+3.8,fall(9,26));ctx.save();ctx.translate(q[0],q[1]);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-6.2,3,Math.PI,TAU);ctx.stroke();ctx.strokeStyle='#8a8e98';ctx.lineWidth=1.3;ctx.stroke();
        ctx.fillStyle='#7a6224';ink(1.6);ctx.beginPath();ctx.moveTo(-4.4,-6);ctx.lineTo(4.4,-6);ctx.lineTo(4.8,1.5);ctx.quadraticCurveTo(0,4.5,-4.8,1.5);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='rgba(255,230,150,.35)';ctx.fillRect(-3.4,-5,2,5);ctx.fillStyle=INK;ctx.beginPath();ctx.arc(0,-2.4,1.1,0,TAU);ctx.fill();ctx.fillRect(-.5,-2.4,1,2.6);ctx.restore()};
    const board=(w,h)=>{ctx.fillStyle='#2e2620';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(255,240,220,.06)';for(let yy=3;yy<h;yy+=4)ctx.fillRect(0,yy,w,.8);ink(1.6);ctx.strokeRect(.8,.8,w-1.6,h-1.6);
      ctx.font='400 9.5px "Lilita One",system-ui';ctx.textAlign='center';ctx.textBaseline='middle';const s=String(price);ctx.fillStyle='rgba(235,232,222,.9)';ctx.fillText(s,w/2+3,h/2+.6);
      ctx.strokeStyle='rgba(235,232,222,.85)';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(w/2-ctx.measureText(s).width/2-1.5,h/2+.4,2.2,0,TAU);ctx.stroke();
      const r=prng(price);ctx.fillStyle='#2e2620';for(let i=0;i<26;i++)ctx.fillRect(4+r()*(w-8),2+r()*(h-4),.7,.7)};// il gesso ruvido
    const bp=plane(xm-12,y+5.5,38,24,12,'x','tavola'+price,board),wires=fn3(S2=>{if(st.t>=0)return;for(const dx of[-9,9]){const a=S2(xm+dx,y+5.5,50),b=S2(xm+dx*.5,y,58);ctx.strokeStyle='rgba(40,40,46,.9)';ctx.lineWidth=.8;seg(a,b);ctx.stroke()}});
    prop({bx:[xm-14,y-6,xm+14,y+8,60],parts:[fn3(S2=>links(0,S2),{fp:[[xm-6,y-4],[xm+6,y-4],[xm+6,y-.6],[xm-6,y-.6]],z:[24,38]}),fn3(S2=>links(1,S2),{fp:[[xm-6,y+.6],[xm+6,y+.6],[xm+6,y+5],[xm-6,y+5]],z:[2,38]}),bp,wires],lk:.6,name:'catena'});leaves.board=bp;leaves.board0=bp.c.map(q=>q.slice())});
  // aperto: le ante girate verso nord, i solidi lungo le ante, catena, lucchetto e tavoletta a terra davanti al cancello
  mark('open',()=>{for(const[k,hx,a,east] of[['w',HW,-OPEN,0],['e',HE,Math.PI+OPEN,1]]){const c=leafPts(hx,a,east),pl=plane(0,0,0,L,Hl,'x','anta'+Math.round(L)+k,leafTex(east));pl.c=c;
      for(let s=4;s<=L;s+=6){const px=hx+Math.cos(a)*s,py=y+Math.sin(a)*s;solid(px-2.5,py-2.5,5,5).noAO=true}
      prop({bx:[Math.min(c[0][0],c[1][0])-4,Math.min(c[0][1],c[1][1])-4,Math.max(c[0][0],c[1][0])+4,Math.max(c[0][1],c[1][1])+4,Hl+4],parts:[pl],lk:.6})}
    prop({bx:[xm-30,y+6,xm+30,y+34,3],floor:true,parts:[fn3(S2=>{const r=prng(9);for(let i=0;i<26;i++){const a=i*.55,rad=3+i*.42,p=S2(xm-8+Math.cos(a)*rad,y+18+Math.sin(a)*rad*.7,1);ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(p[0],p[1],2.2,1.2,a+(i%2?1:0),0,TAU);ctx.stroke();ctx.strokeStyle=i%2?'#6a6e7a':'#4a4e58';ctx.lineWidth=1;ctx.stroke()}
        const q=S2(xm+9,y+22,1);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(.5);ctx.fillStyle='#7a6224';ink(1.5);ctx.beginPath();ctx.ellipse(0,0,4.6,3.4,0,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(-3,-2.5,2.8,Math.PI*.9,Math.PI*1.9);ctx.stroke();ctx.strokeStyle='#8a8e98';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
        onGround(S2,xm-24,y+24,.5,()=>{ctx.rotate(-.25);ctx.fillStyle='#2e2620';ctx.fillRect(0,0,22,11);ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.strokeRect(0,0,22,11);ctx.strokeStyle='rgba(235,232,222,.8)';ctx.lineWidth=1.1;seg([3,3],[19,8]);ctx.stroke();seg([3,8],[19,3]);ctx.stroke()})},{fp:[[xm-28,y+8],[xm+16,y+8],[xm+16,y+32],[xm-28,y+32]]})]})});
  for(const p of sets.open)p.hide=true;for(const s of sol.open)s.off=true;
  // l'apertura: la catena cade (0–0,6 s), le ante si spalancano (0,5–1,6 s, i pannelli girati sul posto), poi restano gli aperti
  const ctl={state:st,open(){if(st.open)return;st.open=true;st.t=0;for(const s of sol.shut)s.off=true;for(const s of sol.open)s.off=false},
    // di nuovo chiuso col lucchetto (una partita nuova): ante, catena, tavoletta e solidi come all'inizio
    close(){st.open=false;st.t=-1;st.done=false;for(const s of sol.shut)s.off=false;for(const s of sol.open)s.off=true;for(const p of sets.shut)p.hide=false;for(const p of sets.open)p.hide=true;
      for(const lf of[leaves.w,leaves.e])lf.pl.c=leafPts(lf.hx,lf.a,lf.east);if(leaves.board)leaves.board.c=leaves.board0.map(q=>q.slice())},
    update(dt){if(st.t<0||st.done)return;st.t+=dt;const k=ez(cl((st.t-.5)/1.1,0,1));for(const lf of[leaves.w,leaves.e]){const a=lf.east?Math.PI+OPEN*k:-OPEN*k;lf.pl.c=leafPts(lf.hx,a,lf.east)}
      if(leaves.board){const kb=cl(st.t/.5,0,1),zb=38-36*kb*kb;leaves.board.c=[[xm-12,y+5.5+kb*8,zb],[xm+12,y+5.5+kb*8,zb],[xm+12,y+5.5+kb*8,zb+12*(1-kb*.9)],[xm-12,y+5.5+kb*8,zb+12*(1-kb*.9)]]}
      if(st.t>=1.7){st.done=true;for(const p of sets.shut)p.hide=true;for(const p of sets.open)p.hide=false}}};
  ANIM.push(dt=>ctl.update(dt));return ctl},()=>null);

// ------------------------------------------------------------------ l'arma a muro: la sagoma dell'arma vera (ARMI) ripassata col gesso, la cornice
// e il prezzo, su un pannello appena fuori dalla faccia del muro (host: si disegna solo se si vede la faccia). along 'x' (muro che guarda a nord o a
// sud) o 'y' (a est o a ovest); (x, y) il centro del pannello sul muro, z la sua base
const CHALK={};
function chalkGun(id){if(CHALK[id])return CHALK[id];const A=document.createElement('canvas');A.width=320;A.height=170;const sv=ctx;ctx=A.getContext('2d');
  try{ctx.translate(120,95);ctx.scale(2.4,2.4);if(window.ARMI)ARMI.held(id,{})}catch(e){}finally{ctx=sv}
  const d=A.getContext('2d').getImageData(0,0,A.width,A.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let j=0;j<A.height;j++)for(let i=0;i<A.width;i++)if(d[(j*A.width+i)*4+3]>40){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}
  if(x1<0){x0=y0=0;x1=y1=10}const w=x1-x0+9,h=y1-y0+9,Sil=document.createElement('canvas');Sil.width=w;Sil.height=h;const s=Sil.getContext('2d');s.drawImage(A,x0-4,y0-4,w,h,0,0,w,h);s.globalCompositeOperation='source-in';s.fillStyle='#f2efe6';s.fillRect(0,0,w,h);
  const O=document.createElement('canvas');O.width=w;O.height=h;const o=O.getContext('2d');for(let k=0;k<10;k++){const a=k/10*TAU;o.drawImage(Sil,Math.cos(a)*2.2,Math.sin(a)*2.2)}o.globalCompositeOperation='destination-out';o.drawImage(Sil,0,0);
  o.globalCompositeOperation='source-over';o.globalAlpha=.3;o.drawImage(Sil,0,0);o.globalAlpha=1;o.globalCompositeOperation='destination-out';const r=prng(id.length*97+w);for(let i=0;i<w*h/14;i++){o.globalAlpha=r()*.8;o.fillRect(r()*w,r()*h,1.4,1.4)}
  return CHALK[id]=O}
def('wallGun',function(x,y,z,along,id,price,host){const W2=58,H2=34,draw=(w,h)=>{const r=prng(price+w);ctx.strokeStyle='rgba(236,232,220,.8)';ctx.lineWidth=1;ctx.lineJoin='round';
    for(let k=0;k<2;k++){ctx.beginPath();ctx.moveTo(2+r()*1.5,2+r());ctx.lineTo(w-2-r()*1.5,2+r()*1.5);ctx.lineTo(w-2-r(),h-2-r());ctx.lineTo(2+r(),h-2-r()*1.5);ctx.closePath();ctx.stroke()}// la cornice ripassata due volte
    const im=chalkGun(id),k=Math.min((w-10)/im.width,(h-15)/im.height);ctx.drawImage(im,w/2-im.width*k/2,3+(h-15-im.height*k)/2,im.width*k,im.height*k);
    ctx.font='400 7.4px "Lilita One",system-ui';ctx.textAlign='center';ctx.textBaseline='alphabetic';const t=price.toLocaleString('it-IT');ctx.fillStyle='rgba(236,232,220,.88)';ctx.fillText(t,w/2+3.4,h-3.6);
    ctx.lineWidth=.8;ctx.beginPath();ctx.arc(w/2-ctx.measureText(t).width/2-.6,h-6.1,2,0,TAU);ctx.stroke()};
  const p0=along==='x'?[x-W2/2,y]:[x,y-W2/2];prop({bx:[x-W2/2-2,y-W2/2-2,x+W2/2+2,y+W2/2+2,z+H2+2],ob:along==='x'?[x-W2/2,y-1,x+W2/2,y+1,z+H2]:[x-1,y-W2/2,x+1,y+W2/2,z+H2],parts:[plane(p0[0],p0[1],z,W2,H2,along,'arma_'+id,draw,{host})]})});

// ------------------------------------------------------------------ granturco: cespi di tre piante dipinti una volta (sei varianti: verdi,
// ingialliti, secchi, con la pannocchia, uno spezzato che pende), appoggiati come cartelloni sul loro piede e piegati come le cose alte; in cima
// ondeggiano col vento, e forte quando uno zombie ci cammina in mezzo
const CORN=[],CK=2,CW=58,CH=98;
function cornImg(v){if(CORN[v])return CORN[v];const c=document.createElement('canvas');c.width=CW*CK;c.height=CH*CK;const sv=ctx;ctx=c.getContext('2d');ctx.scale(CK,CK);const r=prng(7000+v*131),R=(a,b)=>a+(b-a)*r();
  try{const dry=v>=4,cols=dry?['#8a7a44','#6e5e34','#a8965a']:v>=2?['#7a7a3a','#5a5c2a','#9a9a52']:['#4e6a2c','#344a1e','#6a8a3c'];
    const stalks=[[-11,.86],[12,.8],[0,.97]];
    for(const[si,[dx,hf]] of stalks.entries()){const bx=CW/2+dx,top=CH-CH*hf,cx=bx+R(-4,4),broken=v===5&&si===2,sk=broken?.58:1;
      const at=t=>{const u=1-t;return[u*u*bx+2*u*t*(bx+R(-1,1)*0+(cx-bx)*.4)+t*t*cx,CH-(CH-top)*t]};
      const pts=[];for(let i=0;i<=10;i++)pts.push(at(i/10*sk));
      // le foglie: lunghe, piegate, a coppie sfalsate; le più alte più corte; quelle secche strappate
      const leaf=(t,side,len,col)=>{const p=at(t),L2=len,tip=[p[0]+side*L2,p[1]+L2*R(.05,.35)],mid=[p[0]+side*L2*.5,p[1]-L2*R(.2,.45)],w0=R(2.4,3.4);
        ctx.beginPath();ctx.moveTo(p[0],p[1]-w0/2);ctx.quadraticCurveTo(mid[0],mid[1]-w0,tip[0],tip[1]);ctx.quadraticCurveTo(mid[0],mid[1]+w0*.6,p[0],p[1]+w0/2);ctx.closePath();
        ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='rgba(12,10,8,.85)';ctx.lineWidth=1.1;ctx.stroke();ctx.strokeStyle='rgba(255,250,200,.18)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.quadraticCurveTo(mid[0],mid[1]-w0*.3,tip[0],tip[1]);ctx.stroke()};
      const nl=7;for(let k=0;k<nl;k++){const t=.14+k*.11;if(t>sk)break;const side=(k+si)%2?1:-1,col=k%3===0?cols[1]:k%3===1?cols[0]:cols[2];leaf(t,side*(side<0?1:1),R(15,24)*(1-t*.35),dry&&r()<.4?'#8a6a3a':col)}
      ctx.lineCap='round';ctx.strokeStyle='rgba(12,10,8,.9)';ctx.lineWidth=3.6;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
      ctx.strokeStyle=dry?'#7a6a3c':'#5e6e30';ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle='rgba(220,230,160,.3)';ctx.lineWidth=.7;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0]-.6,q[1]):ctx.moveTo(q[0]-.6,q[1]));ctx.stroke();
      if(broken){// spezzato: la cima pende di lato
        const b=pts[pts.length-1],h2=[b[0]+14,b[1]+18];ctx.strokeStyle='rgba(12,10,8,.9)';ctx.lineWidth=3.2;seg(b,h2);ctx.stroke();ctx.strokeStyle='#7a6a3c';ctx.lineWidth=1.8;seg(b,h2);ctx.stroke();
        for(let k=0;k<3;k++){ctx.strokeStyle='#8a7a44';ctx.lineWidth=1.4;seg([h2[0]-k*3,h2[1]-k*4],[h2[0]-k*3+R(-6,6),h2[1]-k*4+R(4,9)]);ctx.stroke()}}
      else{const tp=pts[pts.length-1];for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.38;ctx.strokeStyle='rgba(12,10,8,.7)';ctx.lineWidth=1.8;seg(tp,[tp[0]+Math.cos(a)*R(6,9),tp[1]+Math.sin(a)*R(6,9)]);ctx.stroke();ctx.strokeStyle=dry?'#c8b070':'#b8a860';ctx.lineWidth=.8;seg(tp,[tp[0]+Math.cos(a)*R(6,9),tp[1]+Math.sin(a)*R(6,9)]);ctx.stroke()}}// il pennacchio
      if((v===1||v===3)&&si!==2||v===2&&si===2){// la pannocchia nelle sue foglie, col ciuffo secco
        const p=at(.48),side=si===0?-1:1;ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(side*.5);ctx.fillStyle='#b8a050';ctx.strokeStyle='rgba(12,10,8,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(side*4,-7,3,7.5,0,0,TAU);ctx.fill();ctx.stroke();
        ctx.fillStyle=dry?'#8a7a44':'#6a8a3c';ctx.beginPath();ctx.moveTo(side*1,0);ctx.quadraticCurveTo(side*8,-6,side*5,-14);ctx.quadraticCurveTo(side*2,-6,side*1,0);ctx.fill();ctx.stroke();
        ctx.strokeStyle='#6a4a2a';ctx.lineWidth=1;for(let k=0;k<3;k++)seg([side*4,-14],[side*4+R(-3,3),-18-R(0,3)]),ctx.stroke();ctx.restore()}}
  }finally{ctx=sv}return CORN[v]=c}
// una fila di granturco da x0 a x1 alla y data (cespi ogni ~30 px, un po' a caso); seed: per variare le file
def('cornRow',function(x0,x1,y,seed,skip){const r=prng(seed||(x0*7+y*13)),parts=[];// skip(x,y): dove non nasce (il poggio del mulino, i pali)
  for(let x=x0+r()*10;x<x1;x+=26+r()*10){const cx=x,cy=y+(r()-.5)*9,v=Math.floor(r()*6),Hc=CH*(.9+r()*.18),ph=r()*6;if(skip&&skip(cx,cy))continue;
    E(parts,fn3(S2=>{const q0=S2(cx,cy,0),q1=S2(cx,cy,Hc);let sw=Math.sin(W.t*1.25+ph)*1.6+Math.sin(W.t*2.7+ph*2)*.6;
      if(!LOWFX)for(const z of W.Z){if(z.die||z.rise<1)continue;const dx=z.x-cx,dy=z.y-cy;if(dx*dx<1600&&dy*dy<900)sw+=Math.sin(W.t*13+ph)*4*(1-Math.abs(dx)/40)}
      const im=cornImg(v),hI=im.height,tx=q1[0]+sw;ctx.save();ctx.transform(1/CK*(Hc/CH),0,(q0[0]-tx)/hI,(q0[1]-q1[1])/hI,tx,q1[1]);ctx.drawImage(im,-im.width/2,0);ctx.restore()},
      {fp:[[cx-20,cy-4],[cx+20,cy-4],[cx+20,cy+4],[cx-20,cy+4]],z:[0,Hc]}))}
  if(parts.length)prop({bx:[x0-30,y-12,x1+30,y+12,CH*1.1],parts,lk:.35})},()=>null);

// ------------------------------------------------------------------ lo spaventapasseri sul palo: è proprio lui (CR.spaventapasseri, fermo,
// che si guarda intorno col corvo sul cappello), alzato su un palo piantato nel granturco
def('scarecrowPole',function(x,y){solid(x-6,y-6,12,12);shade(x-4,y-4,8,8,96,.4);const ph=26,parts=[...cyl(x,y,0,3.4,ph+6,'post',{n:6,r1:2.8})];
  E(parts,fn3(S2=>{const q=S2(x,y,ph);if(!window.CR||!CR.spaventapasseri)return;const keep=noShadow;noShadow=true;try{CR.spaventapasseri(q[0],q[1],Math.PI/2+CAM.yaw,'idle',(W.t*.2+x*.013)%1,1.15)}finally{noShadow=keep}},
    {fp:[[x-14,y-8],[x+14,y-8],[x+14,y+8],[x-14,y+8]],z:[ph,ph+72]}));
  prop({bx:[x-34,y-16,x+34,y+16,108],parts,lk:.4,noSplit:true})});

// ------------------------------------------------------------------ il mulino a vento sul poggio: base di pietra, torre di assi a otto lati che si
// stringe, porta e finestrella, ballatoio, cappello a cupola di scandole, pale di legno e tela strappata che girano piano verso sud
def('windmill',function(x,y){const R0=30,R1=21,H=118,hz=H+4,hy=y+R1+9,parts=[];solid(x-R0,y-R0,2*R0,2*R0).round=true;shade(x-R0,y-R0,2*R0,2*R0,H+30,.5);
  prop({bx:[x-96,y-70,x+96,y+70,16],floor:true,parts:[ballAt([x,y+6,0],84,'grass',{sq:.2,ow:2,tex:r=>{const q=prng(x);for(let i=0;i<40;i++){ctx.strokeStyle=i%2?'#5a7140':'#293520';ctx.lineWidth=1;const a=q()*TAU,d=q()*r*.9;ctx.beginPath();ctx.moveTo(Math.cos(a)*d,Math.sin(a)*d);ctx.lineTo(Math.cos(a)*d+q()*2-1,Math.sin(a)*d-3);ctx.stroke()}}})]});
  const boards=(w2,h2)=>{ctx.strokeStyle='rgba(20,12,6,.45)';ctx.lineWidth=1;for(let yy=6;yy<h2;yy+=7){ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w2,yy+.5);ctx.stroke()}};
  E(parts,...cyl(x,y,0,R0,16,'stoneW',{n:8,r1:R0-1,ink:.4}),...cyl(x,y,16,R0-2,H-16,'millWood',{n:8,r1:R1,tex:boards,ink:.5}));
  E(parts,fn3(S2=>{// la porta ad arco a sud e la finestrella, sul fianco della torre (si vedono solo da sud)
    const f=facing(0,1);if(f<.15)return;ctx.save();ctx.globalAlpha*=cl((f-.15)*4,0,1);const dp=[];for(let i=0;i<=8;i++){const a=Math.PI+i/8*Math.PI;dp.push(S2(x+Math.cos(a)*7,y+R0-1.6,30+Math.sin(a)*-7))}
    const DP=[S2(x-7,y+R0-1.2,16)].concat(dp).concat([S2(x+7,y+R0-1.2,16)]);path(DP);ctx.fillStyle='#120c08';ctx.fill();ink(1.6);ctx.stroke();
    const w=[S2(x-4,y+R1+6,80),S2(x+4,y+R1+6,80),S2(x+4,y+R1+6,90),S2(x-4,y+R1+6,90)];path(w);ctx.fillStyle='#ffcf7a';ctx.fill();ink(1.4);ctx.stroke();ctx.restore()},{fp:[[x-8,y+R0-3],[x+8,y+R0-3],[x+8,y+R0],[x-8,y+R0]],z:[16,92]}));
  lights.push({x,y:y+R0+14,r:60,rgb:'255,180,90',a:.3,fl:0});
  E(parts,...cyl(x,y,H,R1+5,3,'plankD',{n:8,ow:1.8}),...cyl(x,y,H+3,R1+3,24,'barnRoof',{n:8,r1:5,ink:.4}),ballAt([x,y,H+29],3.2,'iron',{ow:1.6}));
  // le pale: quattro bracci con il traliccio e la tela strappata, il mozzo; il loro disco sta in un piano verticale davanti al cappello
  E(parts,fn3(S2=>{const a0=W.t*.55,P3=(u,v)=>{const a=a0;return S2(x+u,hy,hz+v)};
    for(let i=0;i<4;i++){const a=a0+i*Math.PI/2,c=Math.cos(a),s=Math.sin(a),n=[-s,c],at=(u,v)=>S2(x+c*u+n[0]*v,hy,hz+s*u+n[1]*v);
      const fr=[at(12,0),at(86,0),at(86,15),at(12,12)];path(fr);ctx.fillStyle='rgba(40,30,22,.35)';ctx.fill();
      ctx.save();path(fr);ctx.clip();const cl1=[at(14,1),at(i===1?60:84,1),at(i===1?52:84,13),at(14,11)];path(cl1);ctx.fillStyle=i%2?'#a89e86':'#b8ae94';ctx.fill();ctx.strokeStyle='rgba(60,50,40,.5)';ctx.lineWidth=.8;for(let k=1;k<5;k++){const a1=at(14+k*14,0),b1=at(14+k*14,14);seg(a1,b1);ctx.stroke()}ctx.restore();
      ctx.strokeStyle=INK;ctx.lineWidth=2.6;path(fr);ctx.stroke();for(let k=0;k<=6;k++){const a1=at(12+k*12.3,0),b1=at(12+k*12.3,14);ctx.strokeStyle=INK;ctx.lineWidth=2;seg(a1,b1);ctx.stroke();ctx.strokeStyle='#5e4128';ctx.lineWidth=.9;seg(a1,b1);ctx.stroke()}
      const sp0=at(0,0),sp1=at(90,0);ctx.strokeStyle=INK;ctx.lineWidth=4.4;seg(sp0,sp1);ctx.stroke();ctx.strokeStyle='#6e5236';ctx.lineWidth=2.4;seg(sp0,sp1);ctx.stroke()}
    const h=S2(x,hy,hz);ctx.fillStyle='#34363e';ink(1.8);ctx.beginPath();ctx.arc(h[0],h[1],4.4,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(200,215,255,.35)';ball([h[0]-1.2,h[1]-1.2],1.2);ctx.fill()},
    {fp:[[x-92,hy-2],[x+92,hy-2],[x+92,hy+2],[x-92,hy+2]],z:[hz-92,hz+92]}));
  E(parts,line3([x,y+R1-2,hz],[x,hy,hz],'#3a2c22',4,{ink:true}));// l'asse
  prop({bx:[x-100,y-36,x+100,hy+6,hz+96],parts,lk:.45})});

// ------------------------------------------------------------------ il fienile rosso: assi verticali rosse, angoli bianchi, zoccolo di pietra,
// tetto a mansarda (due falde per lato) col colmo nord–sud, portone a ovest con le ante scorrevoli aperte e la lanterna rossa, sul timpano a sud
// la porta del fienile con la trave e la carrucola. Si entra (il tetto sfuma come quello della casa): stalle, fieno, scala, lanterna
def('barn',function(x,y,w,d){const H=78,th=8,ov=10,ov2=7,dy0=y+d*.36,dy1=y+d*.64,dw=dy1-dy0,Hd=66,xm=x+w/2;
  const hs={x,y,w,d,H,a:1,inside:false,porch:[x-34,dy0,x,dy1]};houses.push(hs);shade(x,y,w,d,H+70,.55);
  const eave=(w2,h2)=>{const g=ctx.createLinearGradient(0,0,0,10);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w2,10)};
  const corners=(w2,h2)=>{eave(w2,h2);ctx.fillStyle='#a39a84';ctx.fillRect(0,0,4.5,h2);ctx.fillRect(w2-4.5,0,4.5,h2);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(4.5,0,1,h2);ctx.fillRect(w2-5.5,0,1,h2);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,h2-7,w2,7)};
  const EAV={s:corners,e:corners,n:corners,w:corners};
  const wb=(a,b,W2,D2,inner)=>box(a,b,0,W2,D2,H,'barnRed',{ow:2.4,tex:EAV,m:inner});
  const WALL=(r,t,parts)=>prop({bx:[r[0]-1,r[1]-1,r[2]+1,r[3]+1,H+6],ky:r[3],parts:tag(parts,t),house:hs});
  WALL([x,y,x+w,y+th],'wN',wb(x,y,w,th,{s:'plankD'}));solid(x,y,w,th);
  WALL([x,y+d-th,x+w,y+d],'wS',wb(x,y+d-th,w,th,{n:'plankD'}));solid(x,y+d-th,w,th);
  WALL([x+w-th,y+th,x+w,y+d-th],'wE',wb(x+w-th,y+th,th,d-2*th,{w:'plankD'}));solid(x+w-th,y+th,th,d-2*th);
  WALL([x,y+th,x+th,dy0],'wW',wb(x,y+th,th,dy0-y-th,{e:'plankD'}));solid(x,y+th,th,dy0-y-th);
  WALL([x,dy1,x+th,y+d-th],'wW',wb(x,dy1,th,y+d-th-dy1,{e:'plankD'}));solid(x,dy1,th,y+d-th-dy1);
  WALL([x,dy0,x+th,dy1],'wW',box(x,dy0,Hd,th,dw,H-Hd,'barnRed',{noFoot:true,ow:2.4,tex:{w:eave,e:eave},m:{e:'plankD'}}));
  // il vano del portone: stipiti e traversa bianchi appena fuori dal muro; le due ante scorrevoli aperte, sul binario di ferro
  for(const[a,b] of[[dy0-4,dy0],[dy1,dy1+4]])WALL([x-1.6,a,x,b],'wW',box(x-1.6,a,0,1.6,4,Hd,'trim',{ow:1.4}));
  WALL([x-1.6,dy0-4,x,dy1+4],'wW',box(x-1.6,dy0-4,Hd,1.6,dw+8,4,'trim',{noFoot:true,ow:1.4}));
  const leafT=(w2,h2)=>{ctx.fillStyle='#6a2620';ctx.fillRect(0,0,w2,h2);ctx.strokeStyle='rgba(20,8,6,.55)';ctx.lineWidth=1;for(let u=6;u<w2;u+=6){ctx.beginPath();ctx.moveTo(u,0);ctx.lineTo(u,h2);ctx.stroke()}
    ctx.strokeStyle='#a39a84';ctx.lineWidth=3;ctx.strokeRect(2,2,w2-4,h2-4);seg([3,3],[w2-3,h2-3]);ctx.stroke();seg([w2-3,3],[3,h2-3]);ctx.stroke();ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=.8;ctx.strokeRect(3.6,3.6,w2-7.2,h2-7.2);
    ctx.fillStyle='rgba(0,0,0,.35)';const g=ctx.createLinearGradient(0,h2,0,h2-14);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w2,h2);ctx.fillStyle='#34363e';ctx.fillRect(w2*.5-1.5,h2*.5-4,3,8)};
  const lw=dw*.55+2;WALL([x-3.4,dy0-lw+2,x-1.8,dy0+2],'wW',[plane(x-2.6,dy0-lw+2,0,lw,Hd-1,'y','portaFienile',leafT)]);WALL([x-3.4,dy1-2,x-1.8,dy1+lw-2],'wW',[plane(x-2.6,dy1-2,0,lw,Hd-1,'y','portaFienile',leafT)]);
  WALL([x-5,dy0-lw,x-1.6,dy1+lw],'wW',[line3([x-3.2,dy0-lw,Hd+3],[x-3.2,dy1+lw,Hd+3],'#34363e',2,{ink:true})]);
  {const ly=dy0-lw-12,parts=[line3([x-1.6,ly,Hd+12],[x-14,ly,Hd+12],'#34363e',2.4,{ink:true}),line3([x-1.6,ly,Hd+5],[x-11,ly,Hd+12],'#34363e',1.6,{ink:true}),line3([x-14,ly,Hd+12],[x-14,ly,Hd+8],'#1d1e23',1.2)];
    lantern(parts,x-14,ly,Hd-6,{rgb:'255,90,70',light:'255,80,60',r:130,a:.5});prop({bx:[x-24,ly-8,x,ly+8,Hd+20],parts,noSplit:true})}
  // il tetto: due mezze falde a mansarda (ognuna un gruppo convesso: falda bassa ripida, falda alta dolce), i timpani rossi coi listelli e la
  // cornice bianca, la porta del fienile e la trave con la carrucola sul timpano sud, il colmo
  {const L=x-ov,hm=xm-L,k1=46,zk=H+52,zr=H+76,parts=[],y0=y-ov2,len=d+2*ov2;
    const gable=south=>q=>{const yy=south?y0+len+.3:y0-.3,zt=u=>u<k1?H+(zk-H)*u/k1:u<hm?zk+(zr-zk)*(u-k1)/(hm-k1):u<2*hm-k1?zr-(zr-zk)*(u-hm)/(hm-k1):zk-(zk-H)*(u-(2*hm-k1))/k1;
      ctx.strokeStyle='rgba(20,8,6,.5)';ctx.lineWidth=1;for(let u=6;u<2*hm;u+=7){const a=S(L+u,yy,H),b=S(L+u,yy,zt(u)+1);seg(a,b);ctx.stroke()}
      const ed=[[0,H],[k1,zk],[hm,zr],[2*hm-k1,zk],[2*hm,H]].map(([u,z])=>S(L+u,yy,z-2.4));ctx.strokeStyle='#a39a84';ctx.lineWidth=3.4;ctx.lineJoin='round';ctx.beginPath();ed.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
      if(south){const dd=[[-15,H+8],[15,H+8],[15,H+44],[-15,H+44]].map(([u,z])=>S(xm+u,yy,z));path(dd);ctx.fillStyle='#3a1a14';ctx.fill();ctx.strokeStyle='#a39a84';ctx.lineWidth=2.6;ctx.stroke();
        ctx.lineWidth=2;seg(dd[0],dd[2]);ctx.stroke();seg(dd[1],dd[3]);ctx.stroke();const mid=S(xm,yy,H+26);ctx.fillStyle='#1d1e23';ctx.fillRect(mid[0]-1,mid[1]-3,2,6)}};
    const west=prismX(L,y0,len,[[0,H],[hm,H],[hm,zr],[k1,zk]],'barnRoof',{noOut:true,m:{s:'barnRed',n:'barnRed'},texF:gable(1)}).filter(t=>!(t.k==='face'&&t.key==='e'));
    const east=prismX(L,y0,len,[[hm,H],[2*hm,H],[2*hm-k1,zk],[hm,zr]],'barnRoof',{noOut:true,m:{s:'barnRed',n:'barnRed'},texF:gable(1)}).filter(t=>!(t.k==='face'&&t.key==='w'));
    for(const part of west.concat(east))if(part.k==='facepoly'&&part.key==='n')part.tex=gable(0);
    E(parts,hullOf([[L,y0,H],[L+2*hm,y0,H],[L+2*hm,y0+len,H],[L,y0+len,H],[L+k1,y0,zk],[L+k1,y0+len,zk],[xm,y0,zr],[xm,y0+len,zr],[L+2*hm-k1,y0,zk],[L+2*hm-k1,y0+len,zk]],2.8),...west,...east);
    E(parts,line3([xm,y0,zr+1],[xm,y0+len,zr+1],'#2a2630',3,{ink:true}),line3([L+k1,y0,zk+.6],[L+k1,y0+len,zk+.6],'rgba(200,215,255,.22)',1),line3([L+2*hm-k1,y0,zk+.6],[L+2*hm-k1,y0+len,zk+.6],'rgba(0,0,0,.3)',1));
    E(parts,...box(xm-3,y0+len,zr-12,6,14,6,'wood',{noFoot:true,ow:1.6}),line3([xm,y0+len+12,zr-12],[xm,y0+len+12,H+30],'#8a7448',1.2,{ink:true}),ballAt([xm,y0+len+12,zr-15],2.6,'iron',{ow:1.4}));
    prop({bx:[L-6,y0-6,L+2*hm+6,y0+len+20,zr+10],ky:y0+len+1,parts:tag(parts,'roof'),house:hs})}
  // dentro: tre stalle contro il muro est, la scala appoggiata al muro nord, il fieno, la lanterna appesa (accesa solo quando si entra)
  for(let i=0;i<3;i++){const sy=y+th+36+i*62,sx=x+w-th-74;solid(sx,sy,74,4);prop({bx:[sx-2,sy-2,sx+76,sy+6,40],parts:[...box(sx,sy,0,74,4,34,'plankD',{ow:1.8}),...box(sx-5,sy-1,0,5,6,40,'wood',{ow:1.6})]})}
  prop({bx:[x+60,y+th,x+92,y+th+12,80],parts:[line3([x+64,y+th+9,0],[x+66,y+th+2,74],'#7d5a38',2.4,{ink:true}),line3([x+86,y+th+9,0],[x+88,y+th+2,74],'#7d5a38',2.4,{ink:true}),...Array.from({length:8},(_,k)=>line3([x+64.2+k*.25,y+th+9-k*.85,6+k*9],[x+86.2+k*.25,y+th+9-k*.85,6+k*9],'#5e4128',1.6,{ink:true}))]});
  lights.push({x:x+w*.55,y:y+d*.5,z:60,r:150,rgb:'255,180,90',a:.5,fl:1,house:hs});
  return hs},a=>[a[0],a[1],a[0]+a[2],a[1]+a[3]]);

// ------------------------------------------------------------------ la pompa dell'acqua a mano (ghisa su un dado di pietra, becco, leva, una
// goccia che cade) e l'abbeveratoio di assi con l'acqua scura e la luna dentro
def('pump',function(x,y){solid(x-7,y-7,14,14);shadeR(x+4,y+2,9,.4);const parts=[];
  E(parts,...box(x-7,y-7,0,14,14,6,'stoneD'),...cyl(x,y,6,3.6,26,'iron',{n:8,r1:3}),...cyl(x,y,32,4.6,4,'iron',{n:8,r1:3.4}),ballAt([x,y,39],2.6,'iron',{ow:1.6}));
  E(parts,line3([x+3,y,28],[x+11,y,26],'#34363e',3,{ink:true}),line3([x+11,y,26],[x+12,y,21],'#34363e',2.6,{ink:true}),line3([x-2,y,35],[x-16,y,42],'#34363e',2.2,{ink:true}),ballAt([x-16,y,42],1.8,'iron',{ow:1.2}));
  E(parts,fn3(S2=>{const k=(W.t*.9+x*.01)%1,a=S2(x+12,y,20-k*14);ctx.fillStyle=`rgba(170,200,230,${.85*(1-k)})`;ball(a,1.1);ctx.fill()},{fp:[[x+11,y-1],[x+13,y-1],[x+13,y+1],[x+11,y+1]],z:[6,20]}));
  prop({bx:[x-20,y-10,x+16,y+10,46],parts,lk:.6,noSplit:true})});
def('trough',function(x,y,w,d){solid(x,y,w,d);shade(x,y,w,d,12,.4);const parts=[...box(x,y,0,w,d,12,'plankD',{tex:{s:(w2,h2)=>{ctx.fillStyle='rgba(20,12,6,.5)';ctx.fillRect(0,h2*.5,w2,1)}}})];
  E(parts,fn3(S2=>{const q=[[x+2.5,y+2.5],[x+w-2.5,y+2.5],[x+w-2.5,y+d-2.5],[x+2.5,y+d-2.5]].map(([a,b])=>S2(a,b,12.1));path(q);ctx.fillStyle='#0e1420';ctx.fill();ctx.save();ctx.clip();
    const c=S2(x+w*.35,y+d*.45,12.1);ctx.fillStyle='rgba(210,225,255,.5)';ctx.beginPath();ctx.ellipse(c[0],c[1],3,1.4,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(160,180,220,.25)';ctx.lineWidth=.8;const k=(W.t*.4)%1;ctx.beginPath();ctx.ellipse(c[0]+6,c[1],3+k*8,1.4+k*3,0,0,TAU);ctx.stroke();ctx.restore()},{fp:[[x+2,y+2],[x+w-2,y+2],[x+w-2,y+d-2],[x+2,y+d-2]],z:[12,12.2]}));
  prop({bx:[x-2,y-2,x+w+2,y+d+2,14],parts})},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);

// ------------------------------------------------------------------ la cuccia: casetta di assi col tetto a due falde, l'ingresso nero ad arco col
// nome, la catena che va al picchetto, la ciotola rovesciata e il collare rotto
def('kennel',function(x,y,stake){const w=28,d=24,h=16,parts=[];solid(x,y,w,d);shade(x,y,w,d,26,.4);
  E(parts,...box(x,y,0,w,d,h,'oldwood',{tex:{s:(w2,h2)=>{ctx.fillStyle='#0a0806';ctx.beginPath();ctx.moveTo(w2*.3,h2);ctx.lineTo(w2*.3,h2*.45);ctx.arc(w2*.5,h2*.45,w2*.2,Math.PI,0);ctx.lineTo(w2*.7,h2);ctx.closePath();ctx.fill();
      ctx.font='700 3.8px "Baloo 2",system-ui';ctx.textAlign='center';ctx.fillStyle='#d8cfb4';ctx.fillText('BRUNO',w2*.5,3.6)}}}));
  E(parts,...prismY(x-3,y-3,w+6,[[0,h],[d/2+3,h],[d/2+3,h+11]],'shingle',{m:{e:'oldwood',w:'oldwood'}}).filter(t=>!(t.k==='face'&&t.key==='s')),...prismY(x-3,y+d/2,w+6,[[0,h],[d/2+3,h],[0,h+11]],'shingle',{m:{e:'oldwood',w:'oldwood'}}).filter(t=>!(t.k==='face'&&t.key==='n')));
  prop({bx:[x-4,y-4,x+w+4,y+d+4,h+14],parts});
  const sx=stake[0],sy=stake[1];prop({bx:[Math.min(x,sx)-4,Math.min(y+d,sy)-4,Math.max(x+w,sx)+4,Math.max(y+d,sy)+8,8],floor:true,parts:[fn3(S2=>{const a=[x+w/2,y+d+1],n=12;for(let i=0;i<=n;i++){const t=i/n,p=S2(lerp(a[0],sx,t)+Math.sin(t*Math.PI)*6,lerp(a[1],sy,t),1.2);ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(p[0],p[1],2,1.1,i%2?.8:-.6,0,TAU);ctx.stroke();ctx.strokeStyle=i%2?'#6a6e7a':'#4a4e58';ctx.lineWidth=.9;ctx.stroke()}
      const s=S2(sx,sy,0),s2=S2(sx,sy,6);ctx.strokeStyle=INK;ctx.lineWidth=3;seg(s,s2);ctx.stroke();ctx.strokeStyle='#5a4a3a';ctx.lineWidth=1.6;seg(s,s2);ctx.stroke();
      const b=S2(x+w+10,y+d+8,1);ctx.fillStyle='#4a4e58';ink(1.4);ctx.beginPath();ctx.ellipse(b[0],b[1],5,2.6,.3,0,TAU);ctx.fill();ctx.stroke();const c=S2(x-8,y+d+6,.5);ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(c[0],c[1],3.4,.6,TAU-.6);ctx.stroke();ctx.strokeStyle='#7a2e26';ctx.lineWidth=1.4;ctx.stroke()},
    {fp:[[Math.min(x,sx)-2,Math.min(y+d,sy)-2],[Math.max(x+w,sx)+12,Math.min(y+d,sy)-2],[Math.max(x+w,sx)+12,Math.max(y+d,sy)+10],[Math.min(x,sx)-10,Math.max(y+d,sy)+10]]})]})});

// ------------------------------------------------------------------ il pollaio: casetta di assi su quattro pali, tetto a una falda, la porticina
// con la rampa a listelli, la cassetta delle uova sul fianco; piume a terra (nel terreno)
def('coop',function(x,y,w,d){const z0=12,h=24,parts=[];solid(x,y,w,d);shade(x,y,w,d,z0+h+10,.45);
  for(const[px,py] of[[x+3,y+3],[x+w-6,y+3],[x+3,y+d-6],[x+w-6,y+d-6]])E(parts,...box(px,py,0,3,3,z0,'wood',{ow:1.4}));
  E(parts,...box(x,y,z0,w,d,h,'oldwood',{noFoot:true,tex:{e:(w2,h2)=>{ctx.fillStyle='#0a0806';ctx.fillRect(w2*.55,h2*.35,9,h2*.65-1);ink(1.2);ctx.strokeRect(w2*.55,h2*.35,9,h2*.65-1)},s:(w2,h2)=>{ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(w2*.25,h2*.3,1,1);ctx.fillRect(w2*.4,h2*.62,1.2,1)}}}));
  E(parts,...prismY(x-4,y-4,w+8,[[0,z0+h+11],[d+8,z0+h+3],[d+8,z0+h],[0,z0+h+8]],'shingle',{m:{e:'oldwood',w:'oldwood'}}));
  E(parts,...box(x-10,y+d*.3,z0+4,10,d*.4,9,'oldwood',{noFoot:true,ow:1.6}),...box(x-11,y+d*.3-1,z0+13,11,d*.4+2,2.5,'shingle',{noFoot:true,ow:1.4}));// la cassetta delle uova sul fianco ovest
  const ry=y+d*.55+4;E(parts,poly3([[x+w,ry-5,z0],[x+w,ry+5,z0],[x+w+20,ry+5,0],[x+w+20,ry-5,0]],'#5a4a3a',{ink:1.4}),fn3(S2=>{for(let k=1;k<5;k++){const a=S2(x+w+k*4,ry-5,z0*(1-k/5)),b=S2(x+w+k*4,ry+5,z0*(1-k/5));ctx.strokeStyle='#2a2018';ctx.lineWidth=1.3;seg(a,b);ctx.stroke()}},{fp:[[x+w+1,ry-5],[x+w+20,ry-5],[x+w+20,ry+5],[x+w+1,ry+5]],z:[0,z0]}));// la rampa a est
  prop({bx:[x-14,y-6,x+w+22,y+d+6,z0+h+14],parts})},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);

// ------------------------------------------------------------------ la tettoia (quattro pali, tetto di assi a una falda verso sud) e il carretto del
// Becchino: cassone di assi, due ruote a raggi, le stanghe a terra, i sacchi col teschio, la pala e la lanterna spenta
def('shelter',function(x,y,w,d){const zb=76,zf=70,parts=[];// i pali sono prop a sé: insieme facevano un'impronta piena che conteneva il carretto
  for(const[px,py,h] of[[x,y,63],[x+w-5,y,63],[x,y+d-5,63],[x+w-5,y+d-5,63]]){solid(px,py,5,5);shade(px,py,5,5,h,.35);prop({bx:[px-1,py-1,px+6,py+6,h+1],parts:box(px,py,0,5,5,h,'post',{ow:1.6}),lk:.8})}
  // il tetto: tre puntoni lungo la pendenza (sui pali) e sopra le assi di traverso, con le fessure e qualche asse che manca: da sopra si vede il carretto
  const D2=d+16,zt=v=>zb-(zb-zf)*v/D2;for(const rx of[x,x+w/2-2,x+w-5])E(parts,...prismY(rx,y-8,5,[[0,zt(0)-.5],[D2,zt(D2)-.5],[D2,zt(D2)-6],[0,zt(0)-6]],'wood',{ow:1.6}));
  for(let v=0,k=0;v<D2-4;v+=13,k++){if(k===2||k===5)continue;const v1=Math.min(D2,v+10);E(parts,...prismY(x-8,y-8,w+16,[[v,zt(v)+2.5],[v1,zt(v1)+2.5],[v1,zt(v1)],[v,zt(v)]],k%2?'plankD':'oldwood',{m:{e:'plankD',w:'plankD'},ow:1.6}))}
  shade(x-8,y-8,w+16,d+16,zb,.3);
  prop({bx:[x-10,y-10,x+w+10,y+d+10,zb+6],parts,lk:.8})},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);
function wheel(x,y,zc,r,S2){const P3=a=>S2(x+Math.cos(a)*r,y,zc+Math.sin(a)*r),N=20;ctx.beginPath();for(let i=0;i<=N;i++){const q=P3(i/N*TAU);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}
  ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#5e4128';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#34363e';ctx.lineWidth=1;ctx.stroke();
  const c=S2(x,y,zc);for(let i=0;i<8;i++){const q=P3(i/8*TAU+.2);ctx.strokeStyle=INK;ctx.lineWidth=2.4;seg(c,q);ctx.stroke();ctx.strokeStyle='#7d5a38';ctx.lineWidth=1.2;seg(c,q);ctx.stroke()}ctx.fillStyle='#34363e';ink(1.4);ctx.beginPath();ctx.arc(c[0],c[1],2.6,0,TAU);ctx.fill();ctx.stroke()}
def('cart',function(x,y){const w=70,d=36,zb=16,r=15,parts=[];solid(x,y-4,w,d+8);shade(x,y,w,d,30,.4);
  E(parts,fn3(S2=>wheel(x+w*.45,y-2,r,r,S2),{fp:[[x+w*.45-r,y-3],[x+w*.45+r,y-3],[x+w*.45+r,y-1],[x+w*.45-r,y-1]],z:[0,2*r]}));
  E(parts,...box(x,y,zb,w,d,3,'plankD',{noFoot:true,ow:1.8}),...box(x,y,zb+3,w,2.5,12,'plank',{noFoot:true,ow:1.6}),...box(x,y+2.5,zb+3,2.5,d-5,12,'plank',{noFoot:true,ow:1.6}),...box(x+w-2.5,y+2.5,zb+3,2.5,d-5,12,'plank',{noFoot:true,ow:1.6}));
  for(const[sx,sy,s] of[[x+16,y+13,.9],[x+36,y+16,.85],[x+26,y+23,.92]])E(parts,ballAt([sx,sy,zb+10*s],10*s,'sack',{sq:.75,ow:1.8,tex:r2=>{ctx.strokeStyle='rgba(30,20,10,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-r2*.5,-r2*.2);ctx.lineTo(r2*.4,-r2*.1);ctx.stroke();
    ctx.fillStyle='rgba(30,20,14,.6)';ctx.beginPath();ctx.ellipse(r2*.1,r2*.15,r2*.28,r2*.24,0,0,TAU);ctx.fill();ctx.fillStyle='#8a7a5a';ball([r2*.02,r2*.12],r2*.07);ctx.fill();ball([r2*.18,r2*.12],r2*.07);ctx.fill()}}));
  E(parts,line3([x+46,y+20,zb+4],[x+30,y+6,zb+40],'#7d5a38',1.8,{ink:true}),poly3([[x+46,y+18,zb+2],[x+52,y+22,zb+2],[x+50,y+24,zb+9],[x+44,y+20,zb+9]],'#4a4d56',{ink:1.4}));
  E(parts,...box(x,y+d-2.5,zb+3,w,2.5,12,'plank',{noFoot:true,ow:1.6}));
  E(parts,fn3(S2=>wheel(x+w*.45,y+d+2,r,r,S2),{fp:[[x+w*.45-r,y+d+1],[x+w*.45+r,y+d+1],[x+w*.45+r,y+d+3],[x+w*.45-r,y+d+3]],z:[0,2*r]}));
  E(parts,line3([x,y+8,zb+1],[x-34,y+6,1],'#5e4128',3,{ink:true}),line3([x,y+d-8,zb+1],[x-34,y+d-6,1],'#5e4128',3,{ink:true}));
  prop({bx:[x-40,y-8,x+w+4,y+d+8,zb+42],parts,noSplit:true})});

// ------------------------------------------------------------------ la rimessa: tre muri di assi e il tetto a una falda, aperta a ovest; dentro la
// mola di pietra sul suo telaio con la manovella, e gli attrezzi appoggiati al muro (falce, forcone, sega)
def('shed',function(x,y,w,d){const H=58,th=6,parts=[];shade(x,y,w,d,H+12,.5);
  const plk=(w2,h2)=>{const g=ctx.createLinearGradient(0,0,0,9);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w2,9)};
  for(const r of[[x,y,w,th],[x,y+d-th,w,th],[x+w-th,y+th,th,d-2*th]]){solid(...r);prop({bx:[r[0]-1,r[1]-1,r[0]+r[2]+1,r[1]+r[3]+1,H+4],parts:box(r[0],r[1],0,r[2],r[3],H,'oldwood',{ow:2,tex:{s:plk,n:plk,e:plk,w:plk}})})}
  prop({bx:[x-8,y-8,x+w+8,y+d+8,H+16],parts:[...prismX(x-8,y-8,d+16,[[0,H],[w+16,H],[w+16,H+14],[0,H+3]],'shingle',{m:{s:'oldwood',n:'oldwood'}})]});
  const gx=x+w*.45,gy=y+d*.5;solid(gx-14,gy-8,28,16);prop({bx:[gx-18,gy-12,gx+18,gy+12,34],parts:[...box(gx-13,gy-7,0,3,14,20,'wood',{ow:1.4}),...box(gx+10,gy-7,0,3,14,20,'wood',{ow:1.4}),
    fn3(S2=>{const a=W.t*.35;wheelStone(gx,gy,22,9,S2,a)},{fp:[[gx-2,gy-9],[gx+2,gy-9],[gx+2,gy+9],[gx-2,gy+9]],z:[13,31]}),line3([gx+13,gy,22],[gx+19,gy,22],'#34363e',2,{ink:true}),line3([gx+19,gy,22],[gx+19,gy+5,16],'#34363e',1.8,{ink:true})]});
  prop({bx:[x+w-th-14,y+th,x+w-th,y+d-th,52],noSplit:true,parts:[line3([x+w-th-2,y+16,0],[x+w-th-6,y+22,48],'#7d5a38',1.6,{ink:true}),poly3([[x+w-th-6,y+22,48],[x+w-th-8,y+44,42],[x+w-th-7,y+43,39]],'#8a8e98',{ink:1.2}),
    line3([x+w-th-2,y+56,0],[x+w-th-7,y+58,44],'#7d5a38',1.6,{ink:true}),line3([x+w-th-7,y+54,44],[x+w-th-7,y+62,44],'#4a4e58',1.2,{ink:true}),...[54,57,60,63].map(yy=>line3([x+w-th-7,y+yy-4,44],[x+w-th-7,y+yy-4,50],'#4a4e58',1,{ink:true}))]})},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);
function wheelStone(x,y,zc,r,S2,a){const P3=t=>S2(x,y+Math.cos(t)*r,zc+Math.sin(t)*r),N=22,pts=[];for(let i=0;i<N;i++)pts.push(P3(i/N*TAU));path(pts);ctx.fillStyle='#6d6a72';ctx.fill();ink(2.2);ctx.stroke();
  const c=S2(x,y,zc);ctx.strokeStyle='rgba(20,20,26,.5)';ctx.lineWidth=1;for(let k=0;k<3;k++){const q=P3(a+k*TAU/3),q2=P3(a+k*TAU/3+.4);ctx.beginPath();ctx.moveTo((c[0]+q[0])/2,(c[1]+q[1])/2);ctx.lineTo((c[0]+q2[0])/2,(c[1]+q2[1])/2);ctx.stroke()}
  ctx.fillStyle='#34363e';ink(1.2);ctx.beginPath();ctx.arc(c[0],c[1],2.2,0,TAU);ctx.fill();ctx.stroke()}

// ------------------------------------------------------------------ sacchi di terra (quelli del Becchino col teschio stampato), la catasta di legna
// con i due paletti, il ceppo con l'accetta piantata e le schegge
def('sack',function(x,y,s,skull){s=s||1;solid(x-8*s,y-6*s,16*s,12*s).round=true;shadeR(x+4*s,y+2*s,9*s,.35);
  prop({bx:[x-12*s,y-10*s,x+12*s,y+10*s,24*s],parts:[ballAt([x,y,9*s],10*s,'sack',{sq:.85,ow:2,tex:r2=>{if(!skull)return;ctx.fillStyle='rgba(30,20,14,.6)';ctx.beginPath();ctx.ellipse(0,r2*.05,r2*.3,r2*.26,0,0,TAU);ctx.fill();ctx.fillRect(-r2*.15,r2*.25,r2*.3,r2*.14);ctx.fillStyle='#8a7a5a';ball([-r2*.1,0],r2*.08);ctx.fill();ball([r2*.1,0],r2*.08);ctx.fill()}}),
    ballAt([x,y,19*s],3*s,'sack',{ow:1.6}),fn3(S2=>{const a=S2(x,y,17*s);ctx.strokeStyle='#5e4a2a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(a[0]-3,a[1]);ctx.lineTo(a[0]+3,a[1]+.5);ctx.stroke()})]})});
def('woodpile',function(x,y,w,d,h){solid(x,y,w,d);shade(x,y,w,d,h,.4);const ends=(w2,h2)=>{const r=prng(w2*7+h2),rr2=4.2;ctx.fillStyle='#2a1c12';ctx.fillRect(0,0,w2,h2);
    for(let yy=h2-rr2;yy>0;yy-=rr2*1.75)for(let xx=rr2+(Math.round(yy)%2)*2;xx<w2;xx+=rr2*2+.4){const R=rr2*(.85+r()*.3);ctx.fillStyle=r()<.5?'#a08060':'#8a6a48';ctx.beginPath();ctx.arc(xx,yy,R,0,TAU);ctx.fill();ctx.strokeStyle='rgba(20,12,6,.8)';ctx.lineWidth=.9;ctx.stroke();ctx.strokeStyle='rgba(60,40,20,.5)';ctx.lineWidth=.5;ctx.beginPath();ctx.arc(xx,yy,R*.5,0,TAU);ctx.stroke()}};
  const side=(w2,h2)=>{const n=Math.max(2,Math.round(h2/7));for(let i=0;i<n;i++){const y0=i*h2/n;ctx.fillStyle=i%2?'#4a3b2e':'#3e3024';ctx.fillRect(0,y0,w2,h2/n);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,y0+h2/n-1.2,w2,1.2);ctx.fillStyle='rgba(190,200,230,.12)';ctx.fillRect(0,y0+.5,w2,.8)}};
  const parts=box(x,y,0,w,d,h,'bark',{tex:{s:ends,n:ends,e:side,w:side,t:side}});// i ciocchi messi di traverso: sui lati lunghi si vedono le teste
  for(const px of[x-3,x+w])E(parts,...box(px,y+d/2-1.5,0,3,3,h+8,'post',{ow:1.4}));
  prop({bx:[x-5,y-3,x+w+5,y+d+3,h+10],parts})},a=>[a[0]+a[2]/2,a[1]+a[3]/2]);
def('chopBlock',function(x,y){solid(x-10,y-9,20,18).round=true;shadeR(x+5,y+2,11,.4);const parts=cyl(x,y,0,10,13,'bark',{n:10,ink:.5,m:{t:'wood'}});
  E(parts,fn3(S2=>{const t=S2(x,y,13.1);ctx.strokeStyle='rgba(60,40,20,.55)';ctx.lineWidth=.8;for(const r of[3,6,8.5]){ctx.beginPath();ctx.ellipse(t[0],t[1],r,r*CAM.SP,0,0,TAU);ctx.stroke()}ctx.strokeStyle='rgba(10,8,6,.7)';ctx.lineWidth=1.2;seg([t[0]-2,t[1]-1],[t[0]+5,t[1]+2]);ctx.stroke()},{fp:[[x-9,y-9],[x+9,y-9],[x+9,y+9],[x-9,y+9]],z:[13,13.2]}));
  E(parts,line3([x+1,y,15],[x-10,y+4,36],'#7d5a38',2.2,{ink:true}),poly3([[x-2,y-.5,13],[x+5,y-.5,13.5],[x+5,y+.5,19],[x-1,y+.5,18]],'#5a5e68',{ink:1.4}));
  prop({bx:[x-14,y-12,x+14,y+12,40],parts,lk:.7,noSplit:true})});

// ------------------------------------------------------------------ lo stendibiancheria: due pali a T, la corda che pende, tre lenzuola strappate e
// macchiate che il vento gonfia piano
def('clothesline',function(x0,x1,y){const H=50,zc=44,parts=[];for(const px of[x0,x1]){solid(px-3,y-3,6,6);shade(px-2,y-2,4,4,H,.35);E(parts,...box(px-2,y-2,0,4,4,H-4,'post',{ow:1.6}),...box(px-2,y-10,H-4,4,20,3,'post',{noFoot:true,ow:1.4}))}
  const sag=t=>zc-Math.sin(t*Math.PI)*5;
  E(parts,fn3(S2=>{const N=10;ctx.beginPath();for(let i=0;i<=N;i++){const t=i/N,q=S2(lerp(x0,x1,t),y,sag(t));i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.stroke();ctx.strokeStyle='#b8ae94';ctx.lineWidth=.9;ctx.stroke()},{fp:[[x0,y-1],[x1,y-1],[x1,y+1],[x0,y+1]],z:[zc-6,zc]}));
  const L=x1-x0;for(const[a,b,col,ph] of[[.12,.38,'#d0c8b4',0],[.44,.64,'#b8b4a8',1.7],[.7,.9,'#c8bca4',3.1]]){const sx0=x0+L*a,sx1=x0+L*b;
    E(parts,fn3(S2=>{const r=prng(Math.round(sx0)),N=8,hang=(sx1-sx0)*1.15,wv=t=>Math.sin(W.t*1.6+ph+t*4)*(LOWFX?0:2.2),top=[],bot=[];
      for(let i=0;i<=N;i++){const t=i/N,x=lerp(sx0,sx1,t),zt=sag((x-x0)/L)-1,zb=zt-hang*(.62+.08*Math.sin(i*1.7+ph))+(i%3===1?4:0);top.push(S2(x,y,zt));bot.push(S2(x,y+wv(t),zb))}
      const P2=top.concat(bot.reverse());path(P2);ctx.fillStyle=col;ctx.fill();ink(1.6);ctx.stroke();ctx.save();path(P2);ctx.clip();
      const c=S2(lerp(sx0,sx1,.5),y,sag(.5)-hang*.35);ctx.fillStyle='rgba(90,20,24,.45)';ctx.beginPath();ctx.ellipse(c[0]+r()*6-3,c[1]+4,4,7,.3,0,TAU);ctx.fill();ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(c[0]-30,c[1]+8,60,20);
      ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1;for(let k=1;k<4;k++){const q0=S2(lerp(sx0,sx1,k/4),y,sag(.5)-1),q1=S2(lerp(sx0,sx1,k/4),y,sag(.5)-hang*.6);seg(q0,q1);ctx.stroke()}ctx.restore();
      for(const t of[.05,.95]){const q=S2(lerp(sx0,sx1,t),y,sag((lerp(sx0,sx1,t)-x0)/L));ctx.fillStyle='#5e4128';ctx.fillRect(q[0]-.8,q[1]-2.5,1.6,4)}},{fp:[[sx0,y-2],[sx1,y-2],[sx1,y+3],[sx0,y+3]],z:[zc-(sx1-sx0)*1.2,zc]}))}
  prop({bx:[x0-12,y-12,x1+12,y+12,H+6],parts,lk:.7})},()=>null);

// ------------------------------------------------------------------ la latrina: casotto di assi col tetto a una falda e la luna intagliata nella
// porta (a sud, così si vede); dentro il buio, due occhi verdi nella luna ogni tanto; quando ne esce uno zombie la porta si spalanca (bang())
def('outhouse',function(x,y){const w=40,d=44,H=64,parts=[],st={t:9};solid(x,y,w,d);shade(x,y,w,d,H+6,.45);
  const plk=(w2,h2)=>{ctx.strokeStyle='rgba(20,12,6,.5)';ctx.lineWidth=1;for(let u=7;u<w2;u+=7){ctx.beginPath();ctx.moveTo(u,0);ctx.lineTo(u,h2);ctx.stroke()}const g=ctx.createLinearGradient(0,0,0,8);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w2,8)};
  E(parts,...box(x,y,0,w,d,H,'oldwood',{tex:{n:plk,e:plk,w:plk,s:(w2,h2)=>{plk(w2,h2);ctx.fillStyle='#0a0806';ctx.fillRect(w2*.18,h2*.25,w2*.64,h2*.75)}}}));
  E(parts,...prismX(x-6,y-6,d+12,[[0,H+12],[w+12,H+3],[w+12,H],[0,H+9]],'shingle',{m:{s:'oldwood',n:'oldwood'}}));
  // la porta: un pannello sul lato sud incernierato a ovest; chiusa sta appoggiata, quando sbatte si apre di colpo verso sud e torna piano
  const dl=w*.64,dh=H*.75,door=plane(0,0,0,dl,dh,'x','portaLatrina',(w2,h2)=>{ctx.fillStyle='#4a3b2e';ctx.fillRect(0,0,w2,h2);ctx.strokeStyle='rgba(20,12,6,.6)';ctx.lineWidth=1;for(let u=6;u<w2;u+=6){ctx.beginPath();ctx.moveTo(u,0);ctx.lineTo(u,h2);ctx.stroke()}ink(1.6);ctx.strokeRect(1,1,w2-2,h2-2);
    ctx.fillStyle='#0a0806';ctx.beginPath();ctx.arc(w2*.5,h2*.2,4,Math.PI*.35,Math.PI*1.65);ctx.arc(w2*.5+2.2,h2*.2,3.2,Math.PI*1.45,Math.PI*.55,true);ctx.closePath();ctx.fill();ctx.fillStyle='#34363e';ctx.fillRect(1,h2*.3,3,2);ctx.fillRect(1,h2*.75,3,2)});
  const hx=x+w*.18,hy=y+d+.6,ang=a=>{const ex=hx+Math.cos(a)*dl,ey=hy+Math.sin(a)*dl;return[[hx,hy,0],[ex,ey,0],[ex,ey,dh],[hx,hy,dh]]};door.c=ang(0);E(parts,door);
  E(parts,fn3(S2=>{if(st.t<4||Math.sin(W.t*.4+x)<.7)return;const q=S2(x+w*.5,y+d+.8,H*.6);ctx.fillStyle='rgba(150,255,150,.9)';ball([q[0]-1.2,q[1]],.7);ctx.fill();ball([q[0]+1,q[1]],.7);ctx.fill()},{fp:[[x+w*.4,y+d+.6],[x+w*.6,y+d+.6],[x+w*.6,y+d+1],[x+w*.4,y+d+1]],z:[H*.55,H*.65],host:parts.find(t=>t.k==='face'&&t.key==='s')}));
  ANIM.push(dt=>{st.t+=dt;const k=st.t<.18?ez(st.t/.18):st.t<.6?1:Math.max(0,1-(st.t-.6)/1.2),a=k*1.75+(st.t>.6&&st.t<1.8?Math.sin(st.t*14)*.08*(1-(st.t-.6)/1.2):0);door.c=ang(a)});
  prop({bx:[x-8,y-8,x+w+8,y+d+34,H+14],parts,lk:.8});return{bang(){st.t=0}}});

// ------------------------------------------------------------------ la lanterna sul palo: palo di legno, braccio con la mensola, lanterna appesa
def('lanternPole',function(x,y,dir){dir=dir||1;solid(x-5,y-5,10,10).round=true;shade(x-4,y-4,8,8,80,.4);const parts=[...cyl(x,y,0,3.6,74,'post',{n:6,r1:2.8})];
  E(parts,line3([x,y,70],[x+16*dir,y,70],'#4e3f30',3.2,{ink:true}),line3([x,y,60],[x+10*dir,y,70],'#4e3f30',2.2,{ink:true}),line3([x+15*dir,y,70],[x+15*dir,y,64],'#1d1e23',1.2));
  lantern(parts,x+15*dir,y,48,{r:120,a:.48,lk:.5});prop({bx:[x-20,y-10,x+24,y+12,84],parts,lk:.5,noSplit:true})});
// la Lanterna delle Anime (la rianimazione della partita a ondate): un altare basso di pietra con la lanterna di ferro e la fiamma verde
// dell'anima, due candele, il prezzo scritto col gesso sul davanti. Ritorna {x, y, z, set(acceso)}: comprata, la fiamma esce e segue l'eroe e
// la lanterna resta spenta finché l'anima non viene usata
def('soulLantern',function(x,y,price){price=price||1500;solid(x-14,y-11,28,22);shade(x-13,y-10,26,20,30,.45);const parts=[];
  const base=box(x-12,y-9,0,24,18,19,'stone',{ow:1.8}),top=box(x-14,y-11,19,28,22,3.5,'stone',{noFoot:true,ow:1.6});E(parts,...base,...top);
  const front=base.find(t=>t.k==='face'&&t.key==='s');
  // il gesso sul davanti: la fiammella, la scritta, il prezzo
  const draw=(w,h)=>{const r=prng(price+7);ctx.strokeStyle='rgba(236,232,220,.85)';ctx.lineWidth=.9;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(w/2,2.5+r());ctx.quadraticCurveTo(w/2+4.2,6.5,w/2+2.6,9.2);ctx.quadraticCurveTo(w/2,11,w/2-2.6,9.2);ctx.quadraticCurveTo(w/2-4.2,6.5,w/2,2.5+r());ctx.stroke();
    ctx.font='400 6.6px "Lilita One",system-ui';ctx.textAlign='center';ctx.fillStyle='rgba(236,232,220,.88)';const t=price.toLocaleString('it-IT');ctx.fillText(t,w/2+3,h-2.6);
    ctx.beginPath();ctx.arc(w/2-ctx.measureText(t).width/2-.4,h-4.9,1.7,0,TAU);ctx.stroke()};
  E(parts,plane(x-9,y+9,3,18,15,'x','anima_'+price,draw,{host:front}));
  // due candele agli angoli davanti, sempre accese
  for(const cx of[x-10,x+10]){E(parts,...cyl(cx,y+7,22.5,1.7,5,'bone',{n:6}));flames.push({x:cx,y:y+7,z:28.6,r:1.4,rgb:'255,215,140',ky:y+8.5})}
  // la lanterna dell'anima
  lantern(parts,x,y-1,22.5,{rgb:'120,255,160',glass:'dark',flame:'120,255,160',light:'110,255,150',r:95,a:.5,s:1.25});const fl=flames[flames.length-1],li=lights[lights.length-1];
  prop({bx:[x-15,y-12,x+15,y+12,44],parts,noSplit:true});
  return{x,y,z:30,set(v){fl.off=!v;li.off=!v}}});
// i paletti caduti di una staccionata rotta (a terra, nei varchi)
def('fallenPickets',function(x,y,n){prop({bx:[x-18,y-10,x+18,y+10,3],floor:true,parts:[fn3(S2=>{const r=prng(Math.round(x*3+y));for(let i=0;i<n;i++){const a=r()*TAU,cx=x+r()*24-12,cy=y+r()*12-6,L=18+r()*6,p0=S2(cx-Math.cos(a)*L/2,cy-Math.sin(a)*L/2,1),p1=S2(cx+Math.cos(a)*L/2,cy+Math.sin(a)*L/2,1);
    ctx.strokeStyle=INK;ctx.lineWidth=5.6;seg(p0,p1);ctx.stroke();ctx.strokeStyle=i%2?'#4a3d30':'#5a4a3a';ctx.lineWidth=3.6;seg(p0,p1);ctx.stroke()}},{fp:[[x-16,y-9],[x+16,y-9],[x+16,y+9],[x-16,y+9]]})]})});

// ------------------------------------------------------------------ pennelli del terreno della fattoria (dentro bakeGround, coordinate del mondo)
G.cornSoil=(x0,y0,x1,y1,rows)=>{ctx.fillStyle='#2e271e';ctx.fillRect(x0,y0,x1-x0,y1-y0);// terra scura tra le file, il dorso delle file più chiaro, foglie secche
  for(const ry of rows){const g=ctx.createLinearGradient(0,ry-12,0,ry+12);g.addColorStop(0,'rgba(70,58,40,0)');g.addColorStop(.5,'rgba(70,58,40,.75)');g.addColorStop(1,'rgba(70,58,40,0)');ctx.fillStyle=g;ctx.fillRect(x0,ry-12,x1-x0,24)}
  {const Q=[new Path2D(),new Path2D()];for(let i=0;i<(x1-x0)*(y1-y0)/220;i++){const x=rr(x0,x1),y=rr(y0,y1),a=rr(0,TAU),p=Q[rnd()<.5?0:1],r=rr(4,8);p.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);p.ellipse(x,y,r,1.1,a,0,TAU)}ctx.fillStyle='#6e5e34';ctx.fill(Q[0]);ctx.fillStyle='#8a7a44';ctx.fill(Q[1])}
  for(let i=0;i<(x1-x0)*(y1-y0)/600;i++){const x=rr(x0,x1),y=rr(y0,y1);ctx.fillStyle='#1c1812';ball([x+.6,y+.6],1.3);ctx.fill();ctx.fillStyle='#55504a';ball([x,y],1.2);ctx.fill()}};
// l'aia: terra battuta con la paglia, solchi delle ruote, impronte; inside(x,y) dice dove sta (bordo che sfuma nell'erba)
G.yard=(w,h,inside,ruts)=>{for(let y=0;y<h;y+=4)for(let x=0;x<w;x+=4){const c=inside(x+2,y+2);if(c===1){ctx.fillStyle='#463b2c';ctx.fillRect(x,y,4.5,4.5)}else if(c===2){ctx.fillStyle='rgba(70,59,44,.55)';ctx.fillRect(x,y,4.5,4.5)}}
  for(let i=0;i<w*h/2600;i++){const x=rr(0,w),y=rr(0,h);if(inside(x,y)!==1)continue;const r=rr(20,60),g=ctx.createRadialGradient(x,y,0,x,y,r),c=rnd()<.5?'30,24,18':'96,82,60';g.addColorStop(0,`rgba(${c},.3)`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)}
  for(const pts of ruts||[])for(const off of[-9,9]){ctx.strokeStyle='rgba(20,15,10,.45)';ctx.lineWidth=3.2;ctx.lineCap='round';ctx.beginPath();pts.forEach((p,i)=>{const q=[p[0]+off*(p[2]||0),p[1]+off*(p[3]||1)];i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.stroke();ctx.strokeStyle='rgba(150,130,100,.12)';ctx.lineWidth=1;ctx.stroke()}
  {const Q=[new Path2D(),new Path2D()];for(let i=0;i<w*h/90;i++){const x=rr(0,w),y=rr(0,h);if(inside(x,y)!==1)continue;const p=Q[rnd()<.6?0:1],a=rr(0,TAU),L=rr(2,5);p.moveTo(x,y);p.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L)}ctx.lineWidth=.9;ctx.strokeStyle='rgba(200,170,90,.55)';ctx.stroke(Q[0]);ctx.strokeStyle='rgba(140,110,50,.5)';ctx.stroke(Q[1])}
  for(let i=0;i<w*h/1400;i++){const x=rr(0,w),y=rr(0,h);if(inside(x,y)!==1)continue;ctx.fillStyle='#221c16';ball([x+.6,y+.7],1.4);ctx.fill();ctx.fillStyle=rnd()<.5?'#6b6258':'#5a544c';ball([x,y],1.3);ctx.fill()}};
// l'orto: dorsi e solchi con le foglie delle zucche che strisciano
G.furrows=(x0,y0,x1,y1)=>{ctx.fillStyle='#30271c';ctx.fillRect(x0,y0,x1-x0,y1-y0);for(let y=y0+8;y<y1;y+=16){ctx.fillStyle='rgba(84,68,48,.8)';ctx.fillRect(x0+4,y-3,x1-x0-8,6);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x0+4,y+3,x1-x0-8,2)}
  for(let i=0;i<(x1-x0)*(y1-y0)/500;i++){const x=rr(x0+8,x1-8),y=rr(y0+6,y1-6);ctx.strokeStyle='rgba(60,90,40,.8)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+6,y-6,x+12,y+4,x+18,y-2);ctx.stroke();ctx.fillStyle=rnd()<.5?'#3a5a2a':'#4e6e34';ctx.beginPath();ctx.ellipse(x+9,y-3,4,2.6,rnd(),0,TAU);ctx.fill()}};
// il fango dei maiali: scuro, lucido, con le pozze e le impronte
G.mud=(x0,y0,x1,y1)=>{const cx=(x0+x1)/2,cy=(y0+y1)/2,g=ctx.createRadialGradient(cx,cy,10,cx,cy,Math.max(x1-x0,y1-y0)*.6);g.addColorStop(0,'rgba(34,26,18,.95)');g.addColorStop(1,'rgba(34,26,18,.0)');ctx.fillStyle=g;ctx.fillRect(x0-20,y0-20,x1-x0+40,y1-y0+40);
  ctx.fillStyle='rgba(30,22,16,.85)';ctx.fillRect(x0,y0,x1-x0,y1-y0);for(let i=0;i<(x1-x0)*(y1-y0)/700;i++){const x=rr(x0,x1),y=rr(y0,y1);ctx.fillStyle='rgba(12,9,6,.6)';ctx.beginPath();ctx.ellipse(x,y,2.2,1.4,0,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(x+3,y,2.2,1.4,0,0,TAU);ctx.fill()}
  for(let i=0;i<(x1-x0)*(y1-y0)/300;i++){const x=rr(x0,x1),y=rr(y0,y1);ctx.fillStyle='rgba(160,170,190,.12)';ctx.beginPath();ctx.ellipse(x,y,rr(2,5),rr(.6,1.2),rr(-.3,.3),0,TAU);ctx.fill()}};
// la nebbia ai lati dell'area di partenza: l'erba che sfuma nel buio (dir: +1 il buio a destra, −1 a sinistra)
G.voidFog=(x0,y0,x1,y1,dir)=>{const g=ctx.createLinearGradient(dir>0?x0:x1,0,dir>0?x1:x0,0);g.addColorStop(0,'rgba(11,12,18,0)');g.addColorStop(.35,'rgba(11,12,18,.6)');g.addColorStop(.75,'rgba(11,12,18,.94)');g.addColorStop(1,'rgba(11,12,18,1)');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0)};
G.voidFogV=(x0,y0,x1,y1)=>{const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(11,12,18,0)');g.addColorStop(.3,'rgba(11,12,18,.55)');g.addColorStop(.7,'rgba(11,12,18,.93)');g.addColorStop(1,'rgba(11,12,18,1)');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0)};
G.feathers=(x,y,r,n)=>{for(let i=0;i<n;i++){const a=rnd()*TAU,d=rnd()*r,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.7;ctx.save();ctx.translate(px,py);ctx.rotate(rnd()*TAU);ctx.fillStyle=rnd()<.6?'rgba(220,214,200,.8)':'rgba(120,90,60,.8)';ctx.beginPath();ctx.ellipse(0,0,2.4,.9,0,0,TAU);ctx.fill();ctx.restore()}};
G.chips=(x,y,r,n)=>{for(let i=0;i<n;i++){const a=rnd()*TAU,d=rnd()*r,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.7;ctx.save();ctx.translate(px,py);ctx.rotate(rnd()*TAU);ctx.fillStyle=rnd()<.5?'#a08060':'#c8a878';ctx.fillRect(-1.6,-.6,3.2,1.2);ctx.restore()}};
})();
