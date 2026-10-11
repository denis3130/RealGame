// ---------- ANTEPRIMA: un angolo della mappa zombie nello stile 3D dei mostri nuovi (anteprime/mk_mappa3d.py lo incolla in una copia del gioco)
// Denis (11 ottobre): «fammi solo una piccola area», poi «più dettagli, meno piatto, più 3D, cose belle da vedere».
// Il mondo è un plastico di terra sospeso nella nebbia (10×10 caselle da 64): un pezzo di cimitero con la cripta e il muretto con la
// cancellata, un sentiero di sassi con le pozzanghere, una casa con il portico in cui si entra, il pozzo, gli alberi, le zucche intagliate.
// La telecamera è quella dei mostri girata di lato (PSI): lo schermo è (x·cos−y·sin, (x·sin+y·cos)·0,55 − z), così di ogni volume si
// vedono il tetto, il lato sud e il lato est. Ogni faccia prende la sua luce (luna fredda da ovest e dall'alto), ha i tre toni, i segni
// del materiale disegnati in 3D sulla faccia, il contorno scuro spesso sul profilo; ombre morbide sul terreno verso est.
// I pezzi fermi sono disegnati una volta in immagini; luci, fuochi, fumo, nebbia, lucciole, corvo, zombie ed eroe dal vivo.
// La mappa intera di 25×25 della prima prova sta nella storia di git (commit a916cae).
(()=>{
const R0=CR._rig,{TAU,cl,ez,lerp,mix,ball,seg}=R0,wa=R0.wa;
const T=64,N=10,WW=T*N,K=.55,PSI=.42,cs=Math.cos(PSI),sn=Math.sin(PSI),SS=2,GT=2,DEEP=78;
const S=(x,y,z)=>Array.isArray(x)?S(x[0],x[1],x[2]):[x*cs-y*sn,(x*sn+y*cs)*K-(z||0)];
const Dp=(x,y)=>x*sn+y*cs;
const VIS=n=>n[0]*sn+n[1]*cs+n[2]*K>1e-3;
const LG=(()=>{const v=[-.78,.22,.82],l=Math.hypot(...v);return v.map(a=>a/l)})();
const lum=n=>n[0]*LG[0]+n[1]*LG[1]+n[2]*LG[2];
const nrm3=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646},rr=(a,b)=>a+(b-a)*rnd();
const M={grass:['#36452b','#26311e','#4d6338'],stone:['#6d6a72','#45434b','#9a97a2'],stoneD:['#55535b','#36353b','#7c7a84'],
  plank:['#6e5236','#46321e','#93714c'],plankD:['#54402c','#34261a','#735a3e'],shingle:['#5a3a46','#3a2430','#7d5464'],brick:['#7d3a2c','#52241b','#a35440'],
  iron:['#34363e','#1d1e23','#6a6e7a'],wood:['#5e4128','#3c2817','#7d5a38'],soil:['#4a3a2a','#2e2419','#64503a'],bark:['#4a3b2e','#2c231b','#6a5644'],
  leaf:['#365a2c','#22391b','#52803e'],pumpkin:['#e0761c','#9e4a0e','#ffa448'],glass:['#ffcf7a','#e09040','#fff0c0'],cloth:['#5a3a5e','#3a243e','#7a5a80'],bone:['#d9cfb4','#a69a7c','#f0e8d2']};
const tone=(m,n)=>{const k=lum(n);return k>=0?mix(m[0],m[2],Math.min(1,k*1.05)):mix(m[0],m[1],Math.min(1,.1-k*1.25))};
function ink(w){ctx.strokeStyle=INK;ctx.lineWidth=w||2.4;ctx.lineJoin='round';ctx.lineCap='round'}
function path(P){ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath()}
function hull(P){const p=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}up.pop();lo.pop();return lo.concat(up)}
const L3=(a,b,col,w)=>{const A=S(a),B=S(b);ctx.strokeStyle=col;ctx.lineWidth=w||1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke()};
const add3=(a,b,k)=>[a[0]+b[0]*(k==null?1:k),a[1]+b[1]*(k==null?1:k),a[2]+b[2]*(k==null?1:k)];
// a flat face: 3D points, outward normal, material; o.tex draws marks on it (clipped); vertical faces darken at their foot
function face(P3,n,m,o){o=o||{};if(!VIS(n))return false;const P=P3.map(S);path(P);ctx.fillStyle=o.col||tone(m,n);ctx.fill();
  ctx.save();ctx.clip();if(o.tex)o.tex();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of P){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
  if(o.ao!==false&&Math.abs(n[2])<.5){let zmin=1e9;for(const p of P3)zmin=Math.min(zmin,p[2]);const g=ctx.createLinearGradient(0,y1-Math.min(26,y1-y0),0,y1);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${zmin<=1?.35:.12})`);ctx.fillStyle=g;ctx.fillRect(x0-2,y0-2,x1-x0+4,y1-y0+4)}
  if(n[2]>.5&&o.sheen!==false){const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,wa(.22));g.addColorStop(.6,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0)}
  ctx.restore();path(P);ctx.strokeStyle=o.edge||'rgba(15,12,10,.55)';ctx.lineWidth=o.ew||1.1;ctx.stroke();return true}
function outline(P3,w){const H=hull(P3.map(S));path(H);ink(w||2.6);ctx.stroke()}
const FACES=[['t',[0,0,1]],['s',[0,1,0]],['e',[1,0,0]],['w',[-1,0,0]],['n',[0,-1,0]]];
function box(x,y,z,w,d,h,m,o){o=o||{};const v=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],
    F={t:[[4,5,6,7],[x,y,z+h],[w,0,0],[0,d,0]],s:[[3,2,6,7],[x,y+d,z],[w,0,0],[0,0,h]],e:[[2,1,5,6],[x+w,y+d,z],[0,-d,0],[0,0,h]],w:[[0,3,7,4],[x,y,z],[0,d,0],[0,0,h]],n:[[1,0,4,5],[x+w,y,z],[-w,0,0],[0,0,h]]};
  for(const[k,n] of FACES){const f=F[k];face(f[0].map(i=>v[i]),n,o.m&&o.m[k]||m,{tex:o.tex&&o.tex[k]?()=>o.tex[k](f[1],f[2],f[3]):null,ao:o.ao})}
  if(!o.noOut)outline(v,o.ow);return v}
function cyl(x,y,z,r,h,m,o){o=o||{};const n=o.n||12,r1=o.r1==null?r:o.r1,v=[],v1=[];for(let i=0;i<n;i++){const a=i/n*TAU;v.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);v1.push([x+Math.cos(a)*r1,y+Math.sin(a)*r1])}
  for(let i=0;i<n;i++){const j=(i+1)%n,a=(i+.5)/n*TAU;face([[...v[i],z],[...v[j],z],[...v1[j],z+h],[...v1[i],z+h]],[Math.cos(a),Math.sin(a),(r-r1)/Math.max(1,h)],m,{edge:'rgba(0,0,0,0)',ao:o.ao})}
  if(o.top!==false)face(v1.map(q=>[...q,z+h]),[0,0,1],o.mt||m,{edge:'rgba(0,0,0,.35)'});
  if(o.tex)o.tex();if(!o.noOut)outline(v.map(q=>[...q,z]).concat(v1.map(q=>[...q,z+h])),o.ow)}
function prismX(x,y,t,prof,m,o){o=o||{};const fr=prof.map(([u,z])=>[x+u,y+t,z]),bk=prof.map(([u,z])=>[x+u,y,z]);
  face(fr,[0,1,0],m,{tex:o.texF,ao:o.ao});face(bk.slice().reverse(),[0,-1,0],m,{ao:o.ao});
  for(let i=0;i<prof.length;i++){const j=(i+1)%prof.length,du=prof[j][0]-prof[i][0],dz=prof[j][1]-prof[i][1];face([bk[i],bk[j],fr[j],fr[i]],nrm3([dz,0,-du]),o.ms||m,{ao:o.ao})}
  if(!o.noOut)outline(fr.concat(bk),o.ow);return{fr,bk}}
function prismY(x,y,len,prof,m,o){o=o||{};const a=prof.map(([v,z])=>[x,y+v,z]),b=prof.map(([v,z])=>[x+len,y+v,z]);
  face(b,[1,0,0],o.me||m,{tex:o.texE});face(a.slice().reverse(),[-1,0,0],o.me||m,{});
  for(let i=0;i<prof.length;i++){const j=(i+1)%prof.length,dv=prof[j][0]-prof[i][0],dz=prof[j][1]-prof[i][1];const n=nrm3([0,dz,-dv]);face([a[i],b[i],b[j],a[j]],n,m,{tex:o.texS?()=>o.texS(a[i],b[i],a[j],n):null,ao:false})}
  if(!o.noOut)outline(a.concat(b),o.ow);return{a,b}}
const LS=(()=>{const q=S(LG[0],LG[1],LG[2]),l=Math.hypot(q[0],q[1]);return[q[0]/l,q[1]/l]})();
function blob(q,r,m,sq,o){o=o||{};ctx.save();ctx.translate(q[0],q[1]);ctx.scale(1,sq||1);ball([0,0],r);ctx.fillStyle=m[1];ctx.fill();ctx.save();ctx.clip();
  ctx.fillStyle=m[0];ctx.beginPath();ctx.ellipse(LS[0]*r*.25,LS[1]*r*.25,r*.88,r*.84,0,0,TAU);ctx.fill();
  ctx.fillStyle=m[2];ctx.beginPath();ctx.ellipse(LS[0]*r*.45,LS[1]*r*.45,r*.42,r*.34,-.4,0,TAU);ctx.fill();ctx.restore();if(!o.noOut){ink(o.ow||2.4);ball([0,0],r);ctx.stroke()}ctx.restore()}
const linesU=(O,U,V,step,col,w)=>{const lu=Math.hypot(...U),n=Math.floor(lu/step);for(let i=1;i<=n;i++){const k=i*step/lu;L3(add3(O,U,k),add3(add3(O,U,k),V),col,w)}};
const linesV=(O,U,V,step,col,w)=>{const lv=Math.hypot(...V),n=Math.floor(lv/step);for(let i=1;i<=n;i++){const k=i*step/lv;L3(add3(O,V,k),add3(add3(O,V,k),U),col,w)}};
const texPlank=(O,U,V)=>{linesU(O,U,V,9,'rgba(20,12,6,.55)',1.1);const lu=Math.hypot(...U);for(let i=0;i<lu/9;i++){const k=(i+.5)*9/lu;for(const kv of[.15,.85]){const q=S(add3(add3(O,U,k),V,kv));ctx.fillStyle='rgba(10,8,6,.6)';ball(q,.7);ctx.fill()}}};
const texSiding=(O,U,V)=>{linesV(O,U,V,8,'rgba(20,12,6,.55)',1.1);const lv=Math.hypot(...V);for(let i=0;i<lv/8;i++){const k=(i+.5)*8/lv;L3(add3(add3(O,V,k),U,.02),add3(add3(O,V,k),U,.98),wa(.08),1)}
  for(let i=0;i<4;i++){const q=S(add3(add3(O,U,rnd()),V,rnd()*.9));ctx.strokeStyle='rgba(20,12,6,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(q[0],q[1],2.2,.9,0,0,TAU);ctx.stroke()}};
const texStone=(O,U,V)=>{const lu=Math.hypot(...U),lv=Math.hypot(...V);for(let r=0,z=0;z<lv;r++,z+=9){const k0=z/lv,k1=Math.min(1,(z+9)/lv);L3(add3(O,V,k1),add3(add3(O,V,k1),U),'rgba(10,10,14,.5)',1);
    for(let u=(r%2?7:14);u<lu;u+=15+rnd()*6){const ku=u/lu;L3(add3(add3(O,U,ku),V,k0),add3(add3(O,U,ku),V,k1),'rgba(10,10,14,.5)',1)}}
  for(let i=0;i<5;i++){const q=S(add3(add3(O,U,rnd()),V,rnd()*.4));ctx.fillStyle='rgba(90,140,60,.45)';ctx.beginPath();ctx.ellipse(q[0],q[1],rr(2,5),rr(1,2),0,0,TAU);ctx.fill()}};
const texBrick=(O,U,V)=>{const lu=Math.hypot(...U),lv=Math.hypot(...V);for(let r=0,z=0;z<lv;r++,z+=5){const k0=z/lv,k1=Math.min(1,(z+5)/lv);L3(add3(O,V,k1),add3(add3(O,V,k1),U),'rgba(30,10,8,.55)',.9);for(let u=(r%2?4:9);u<lu;u+=10){const ku=u/lu;L3(add3(add3(O,U,ku),V,k0),add3(add3(O,U,ku),V,k1),'rgba(30,10,8,.55)',.9)}}};
function sprite(bx,draw){const[x0,y0,x1,y1]=bx,c=document.createElement('canvas');c.width=Math.max(1,Math.ceil((x1-x0)*SS));c.height=Math.max(1,Math.ceil((y1-y0)*SS));const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(SS,SS);ctx.translate(-x0,-y0);try{draw()}catch(e){console.error(e)}finally{ctx=sv}return{c,x0,y0,w:x1-x0,h:y1-y0}}
const blit=(sp,a)=>{if(a!=null&&a<.999){ctx.save();ctx.globalAlpha*=a;ctx.drawImage(sp.c,sp.x0,sp.y0,sp.w,sp.h);ctx.restore()}else ctx.drawImage(sp.c,sp.x0,sp.y0,sp.w,sp.h)};
const sbox=(b,m)=>{m=m==null?26:m;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const x of[b[0],b[2]])for(const y of[b[1],b[3]])for(const z of[-2,b[4]]){const q=S(x,y,z);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}return[x0-m,y0-m,x1+m,y1+m]};
const things=[],solids=[],shadows=[],lights=[],holes=[],houses=[],crows=[],flames=[],smokes=[],mushrooms=[];
function thing(b,draw,o){o=o||{};const t=Object.assign({k:o.k!=null?o.k:Dp((b[0]+b[2])/2,(b[1]+b[3])/2),sp:sprite(sbox(b,o.m),draw)},o);things.push(t);return t}
const solid=(x,y,w,d)=>{solids.push({x,y,w,d})};
const shade=(x,y,w,d,h,a)=>shadows.push({x,y,w,d,h,a});
const shadeR=(x,y,r,h,a)=>shadows.push({x,y,r,h,a});

// ------------------------------------------------------------------ pieces
function wall(x0,y0,x1,y1,rail){const hor=y0===y1,len=hor?x1-x0:y1-y0,n=Math.max(1,Math.round(len/T)),th=12,h=18;
  for(let i=0;i<n;i++){const a=i*len/n,b=(i+1)*len/n,x=hor?x0+a:x0-th/2,y=hor?y0-th/2:y0+a,w=hor?b-a:th,d=hor?th:b-a;solid(x,y,w,d);shade(x,y,w,d,h+(rail?30:0),.55);
    thing([x,y,x+w,y+d,h+44],()=>{box(x,y,0,w,d,h,M.stone,{tex:{s:texStone,e:texStone,w:texStone,n:texStone}});box(x-1.5,y-1.5,h,w+3,d+3,4,M.stoneD,{});
      for(let k=0;k<3;k++){const q=S(x+rnd()*w,y+rnd()*d,h+4);ctx.fillStyle='rgba(98,140,64,.75)';ctx.beginPath();ctx.ellipse(q[0],q[1],rr(2,5),rr(1,2.2),0,0,TAU);ctx.fill()}
      if(rail){const bars=Math.max(2,Math.round((hor?w:d)/11));for(const z of[h+10,h+28]){const A=hor?[x,y+d/2,z]:[x+w/2,y,z],B=hor?[x+w,y+d/2,z]:[x+w/2,y+d,z];L3(A,B,INK,3.4);L3(A,B,M.iron[2],1.3)}
        for(let j=0;j<=bars;j++){const k=j/bars,P=hor?[x+w*k,y+d/2]:[x+w/2,y+d*k],A=[...P,h+4],B=[...P,h+32];L3(A,B,INK,3.2);L3(A,B,M.iron[0],1.5);const t=S(...P,h+32);ctx.fillStyle=M.iron[2];ink(1.2);ctx.beginPath();ctx.moveTo(t[0]-2.4,t[1]+1);ctx.lineTo(t[0],t[1]-6);ctx.lineTo(t[0]+2.4,t[1]+1);ctx.closePath();ctx.fill();ctx.stroke()}}})}}
function pillar(x,y){solid(x-11,y-11,22,22);shade(x-11,y-11,22,22,62,.55);thing([x-14,y-14,x+14,y+14,70],()=>{box(x-10,y-10,0,20,20,46,M.stone,{tex:{s:texStone,e:texStone,w:texStone}});box(x-13,y-13,46,26,26,6,M.stoneD);
  blob(S(x,y,60),8.5,M.stone);const q=S(x,y,60);ctx.fillStyle='rgba(98,140,64,.6)';ctx.beginPath();ctx.ellipse(q[0]-2,q[1]-5,5,2,0,0,TAU);ctx.fill()})}
function gateLeaf(hx,hy,len,ang){const e=[hx+Math.cos(ang)*len,hy+Math.sin(ang)*len];thing([Math.min(hx,e[0])-4,Math.min(hy,e[1])-4,Math.max(hx,e[0])+4,Math.max(hy,e[1])+4,56],()=>{
  for(const z of[6,24,40]){L3([hx,hy,z],[...e,z],INK,3.4);L3([hx,hy,z],[...e,z],M.iron[2],1.3)}for(let i=0;i<=6;i++){const k=i/6,P=[hx+(e[0]-hx)*k,hy+(e[1]-hy)*k],tz=44+Math.sin(k*Math.PI)*6;L3([...P,2],[...P,tz],INK,3);L3([...P,2],[...P,tz],M.iron[0],1.4)}
  const m=S((hx+e[0])/2,(hy+e[1])/2,50);for(const sd of[-1,1]){ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.arc(m[0]+sd*5,m[1],4,0,TAU*.8);ctx.stroke();ctx.strokeStyle=M.iron[2];ctx.lineWidth=1.2;ctx.stroke()}})}
function grave(x,y,kind,o){o=o||{};const lean=o.lean||0;solid(x-12,y-6,24,10);shade(x-12,y-4,24,8,kind===3?52:30,.5);
  thing([x-18,y-8,x+18,y+30,64],()=>{const mq=S(x,y+16,0);ctx.save();ctx.translate(mq[0],mq[1]);ctx.fillStyle=M.soil[1];ctx.beginPath();ctx.ellipse(0,0,15,6.5,-PSI*.5,0,TAU);ctx.fill();ctx.fillStyle=M.soil[0];ctx.beginPath();ctx.ellipse(-1,-1.6,13,5,-PSI*.5,0,TAU);ctx.fill();ctx.fillStyle=M.soil[2];ctx.beginPath();ctx.ellipse(-3,-2.8,7,2.4,-PSI*.5,0,TAU);ctx.fill();
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#5c7a3a':'#3e5428';ctx.beginPath();ctx.ellipse(rr(-11,11),rr(-4,3),rr(1.5,3),rr(.8,1.4),0,0,TAU);ctx.fill()}ctx.restore();
    box(x-12,y-5,0,24,10,4,M.stoneD,{});const sk=(u,z)=>[u+lean*z,z];
    if(kind===0){const P=[[-9,0],[9,0]];for(let i=0;i<=8;i++){const a=i/8*Math.PI;P.push([Math.cos(a)*9,20+Math.sin(a)*9])}prismX(x,y-3,6,P.map(([u,z])=>sk(u,z+4)),M.stone,{texF:()=>{for(let i=0;i<3;i++)L3([x-5+lean*(14+i*4),y+3.05,18-i*4],[x+5+lean*(14+i*4),y+3.05,18-i*4],'rgba(10,10,14,.6)',1.1)}})}
    else if(kind===1)prismX(x,y-3,6,[[-8,0],[8,0],[8,24],[0,33],[-8,24]].map(([u,z])=>sk(u,z+4)),M.stone,{texF:()=>{L3([x,y+3.05,10],[x,y+3.05,26],'rgba(10,10,14,.6)',1.1);L3([x-4,y+3.05,21],[x+4,y+3.05,21],'rgba(10,10,14,.6)',1.1)}});
    else if(kind===2){box(x-2.5,y-2,4,5,5,34,M.stone,{});box(x-10,y-2,24,20,5,5,M.stone,{})}
    else{box(x-7,y-5,4,14,10,8,M.stoneD,{});prismX(x,y-3.5,7,[[-5,0],[5,0],[3.6,38],[-3.6,38]].map(([u,z])=>[u,z+12]),M.stone,{});const t=S(x,y,58),A=S(x-3.6,y+3.5,50),B=S(x+3.6,y+3.5,50),C=S(x+3.6,y-3.5,50);ctx.fillStyle=M.stone[2];ink(1.8);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(C[0],C[1]);ctx.lineTo(t[0],t[1]);ctx.closePath();ctx.fill();ctx.stroke()}
    for(let i=0;i<3;i++){const q=S(x+rr(-7,7),y+3,rr(6,20));ctx.fillStyle=i?'rgba(150,170,110,.5)':'rgba(90,130,60,.6)';ctx.beginPath();ctx.ellipse(q[0],q[1],rr(1.5,3.5),rr(1,2),0,0,TAU);ctx.fill()}
    if(o.wreath){const q=S(x,y+8,4);ctx.save();ctx.translate(q[0],q[1]);ctx.strokeStyle=INK;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,6,3,0,0,TAU);ctx.stroke();ctx.strokeStyle='#3e5a2a';ctx.lineWidth=3;ctx.stroke();for(let i=0;i<5;i++){const a=i/5*TAU;ctx.fillStyle=['#c84a5a','#e8d070','#c84a5a','#f0f0f0','#b04ad0'][i];ball([Math.cos(a)*6,Math.sin(a)*3],1.4);ctx.fill()}ctx.restore()}
    if(o.candle){box(x+8,y+6,0,6,6,9,M.iron,{});const g=S(x+11,y+9,4);ctx.fillStyle='rgba(255,210,140,.85)';ctx.fillRect(g[0]-1.8,g[1]-3,3.6,4)}},{m:30});
  if(o.candle){flames.push({x:x+11,y:y+9,z:13,r:1.4,rgb:'255,170,80'});lights.push({x:x+11,y:y+9,r:46,rgb:'255,170,80',a:.45,fl:1})}}
function tree(x,y,dead,s){s=s||1;solid(x-9*s,y-9*s,18*s,18*s);shade(x-10*s,y-10*s,20*s,20*s,dead?90*s:70*s,.4);if(!dead)shadeR(x+30*s,y-12*s,40*s,0,.35);
  thing([x-80*s,y-80*s,x+80*s,y+40*s,150*s],()=>{
    for(let i=0;i<5;i++){const a=i/5*TAU+.4,e=[x+Math.cos(a)*22*s,y+Math.sin(a)*22*s,0],m=[x+Math.cos(a)*10*s,y+Math.sin(a)*10*s,5*s];const A=S(x,y,8*s),B=S(...m),C=S(...e);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=7*s;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.quadraticCurveTo(B[0],B[1],C[0],C[1]);ctx.stroke();ctx.strokeStyle=M.bark[i%2?0:1];ctx.lineWidth=4*s;ctx.stroke()}
    cyl(x,y,0,9*s,dead?66*s:52*s,M.bark,{r1:6*s,n:10,tex:()=>{for(let i=0;i<5;i++){const a=-PSI+Math.PI/2+rr(-1,1),z=rnd()*40*s;L3([x+Math.cos(a)*8*s,y+Math.sin(a)*8*s,z],[x+Math.cos(a)*7*s,y+Math.sin(a)*7*s,z+10*s],'rgba(15,10,6,.55)',1)}}});
    if(dead){const B0=[x,y,62*s],br=[[-34,-8,40],[30,6,46],[-10,24,58],[16,-22,62],[38,-14,22],[-30,18,18]];
      for(const[dx,dy,dz] of br){const e=[x+dx*s,y+dy*s,B0[2]+dz*s],m=[x+dx*s*.45,y+dy*s*.45,B0[2]+dz*s*.7];const A=S(...B0),Mq=S(...m),E=S(...e);ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=6.5*s;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.quadraticCurveTo(Mq[0],Mq[1],E[0],E[1]);ctx.stroke();ctx.strokeStyle=M.bark[1];ctx.lineWidth=3.6*s;ctx.stroke();ctx.strokeStyle='rgba(180,190,220,.25)';ctx.lineWidth=1.2*s;ctx.stroke();
        for(const k of[.55,.85]){const P=[(1-k)*(1-k)*A[0]+2*(1-k)*k*Mq[0]+k*k*E[0],(1-k)*(1-k)*A[1]+2*(1-k)*k*Mq[1]+k*k*E[1]];ctx.strokeStyle=INK;ctx.lineWidth=3*s;ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(P[0]+(dx>0?8:-8)*s,P[1]-10*s);ctx.stroke();ctx.strokeStyle=M.bark[0];ctx.lineWidth=1.4*s;ctx.stroke()}}
      const hb=S(x-34*s*.75,y-8*s*.75,B0[2]+40*s*.9);ctx.strokeStyle='#a08a5a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(hb[0],hb[1]);ctx.lineTo(hb[0],hb[1]+26);ctx.stroke();ctx.beginPath();ctx.ellipse(hb[0],hb[1]+30,3.5,4.5,0,0,TAU);ctx.stroke()}
    else{const c=[[0,0,56],[-18,-6,48],[16,10,50],[-6,16,62],[10,-14,64],[-14,8,74],[6,4,82],[16,-4,72]];for(const[dx,dy,dz] of c.sort((a,b)=>Dp(a[0],a[1])+a[2]*.2-Dp(b[0],b[1])-b[2]*.2))blob(S(x+dx*s,y+dy*s,dz*s),17*s,M.leaf);
      for(let i=0;i<16;i++){const q=S(x+rr(-26,26)*s,y+rr(-26,26)*s,rr(50,86)*s);ctx.fillStyle=rnd()<.5?'#6a9a4e':'#2c4a24';ctx.beginPath();ctx.ellipse(q[0],q[1],2.6,1.6,rnd()*3,0,TAU);ctx.fill()}}},{m:20})}
function lamp(x,y){solid(x-7,y-7,14,14);shade(x-6,y-6,12,12,92,.45);lights.push({x,y,z:84,r:150,rgb:'255,196,110',a:.55,fl:1});flames.push({x:x+16,y,z:68,r:4,rgb:'255,200,120',glass:1});
  thing([x-30,y-30,x+40,y+30,110],()=>{cyl(x,y,0,9,8,M.stone,{n:8});cyl(x,y,8,4,78,M.iron,{n:8,r1:3});box(x-2,y-2,80,20,4,3,M.iron,{});
    const g=[x+16,y];box(g[0]-5,g[1]-5,60,10,10,16,M.glass,{m:{t:M.iron,s:M.glass,e:M.glass,w:M.glass,n:M.glass},ow:1.8});box(g[0]-6,g[1]-6,58,12,12,2.5,M.iron,{ow:1.4});
    const c0=S(g[0],g[1],86),a=S(g[0]-7,g[1]+7,76),b=S(g[0]+7,g[1]+7,76),c=S(g[0]+7,g[1]-7,76);ctx.fillStyle=M.iron[0];ink(1.8);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(c0[0],c0[1]);ctx.closePath();ctx.fill();ctx.stroke();L3([g[0],g[1],80],[g[0],g[1],83],INK,2)},{m:30})}
function pumpkin(x,y,s,carved){s=s||1;solid(x-8*s,y-8*s,16*s,16*s);shadeR(x+6*s,y-3*s,12*s,0,.4);thing([x-14*s,y-14*s,x+14*s,y+14*s,26*s],()=>{const q=S(x,y,9*s);ctx.save();ctx.translate(q[0],q[1]);
    for(const dx of[-6,6,0])blob([dx*s*.85,0],(dx?8:9.5)*s,M.pumpkin,.82,{ow:2});ctx.strokeStyle='rgba(120,50,10,.6)';ctx.lineWidth=1;for(const dx of[-3,3]){ctx.beginPath();ctx.ellipse(dx*s,0,2.5*s,7.5*s,0,-1.2,1.2);ctx.stroke()}
    ctx.strokeStyle=INK;ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(0,-7*s);ctx.quadraticCurveTo(1*s,-11*s,4*s,-12*s);ctx.stroke();ctx.strokeStyle='#4a6a2a';ctx.lineWidth=1.8;ctx.stroke();
    if(carved){ctx.fillStyle='#ffb440';for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(sd*3.5*s,-3*s);ctx.lineTo(sd*6*s,0);ctx.lineTo(sd*1.5*s,0);ctx.closePath();ctx.fill()}ctx.beginPath();ctx.moveTo(-6*s,2.5*s);for(let i=0;i<=6;i++)ctx.lineTo(-6*s+i*2*s,(i%2?5.5:3)*s);ctx.lineTo(6*s,4*s);ctx.quadraticCurveTo(0,8*s,-6*s,4*s);ctx.closePath();ctx.fill()}ctx.restore()},{m:16});
  if(carved){flames.push({x,y,z:9*s,r:5*s,rgb:'255,150,40',pump:s});lights.push({x,y,r:60*s,rgb:'255,140,40',a:.35,fl:1})}}
const crate=(x,y,s)=>{s=s||1;box(x,y,0,20*s,18*s,18*s,M.plank,{tex:{s:texPlank,e:texPlank,t:texPlank}});L3([x+1,y+18*s,1],[x+20*s-1,y+18*s,18*s-1],M.plank[1],2.2);L3([x+20*s,y+17*s,1],[x+20*s,y+1,18*s-1],M.plank[1],2.2)};
const barrel=(x,y,s)=>{s=s||1;cyl(x,y,0,10*s,22*s,M.wood,{n:12,mt:M.plankD,tex:()=>{for(const z of[4,11,18])for(let i=0;i<12;i++){const a=i/12*TAU,b=(i+1)/12*TAU;if(!VIS([Math.cos((a+b)/2),Math.sin((a+b)/2),0]))continue;const A=[x+Math.cos(a)*10.3*s,y+Math.sin(a)*10.3*s,z*s],B=[x+Math.cos(b)*10.3*s,y+Math.sin(b)*10.3*s,z*s];L3(A,B,INK,2.4);L3(A,B,'#6a6e7a',1)}}})};
function crypt(x,y,w,d){const H=50;solid(x,y,w,d);shade(x,y,w,d,H+30,.6);lights.push({x:x+w/2,y:y+d+10,r:80,rgb:'120,255,140',a:.45,fl:2});
  thing([x-14,y-14,x+w+14,y+d+30,H+40],()=>{box(x,y,0,w,d,H,M.stone,{tex:{s:texStone,e:texStone,w:texStone}});
    box(x+w*.2,y+d,0,w*.6,10,4,M.stoneD,{});box(x+w*.25,y+d,4,w*.5,5,3,M.stoneD,{});
    const dx=x+w/2,door=[];for(let i=0;i<=10;i++){const t=i/10*Math.PI;door.push([dx+Math.cos(t)*11,y+d+.1,24+Math.sin(t)*11])}const DP=[[dx+11,y+d+.1,0]].concat(door).concat([[dx-11,y+d+.1,0]]).map(S);
    path(DP);ctx.fillStyle='#0a1410';ctx.fill();ctx.save();ctx.clip();const q=S(dx,y+d,12);const g=ctx.createRadialGradient(q[0],q[1],1,q[0],q[1],30);g.addColorStop(0,'rgba(140,255,150,.75)');g.addColorStop(1,'rgba(40,120,60,0)');ctx.fillStyle=g;ctx.fillRect(q[0]-30,q[1]-40,60,60);ctx.restore();ink(2);path(DP);ctx.stroke();
    for(let i=-2;i<=2;i++)L3([dx+i*4.4,y+d+.2,0],[dx+i*4.4,y+d+.2,24+Math.sqrt(Math.max(0,121-(i*4.4)**2))],INK,1.6);L3([dx-11,y+d+.2,16],[dx+11,y+d+.2,16],INK,1.6);
    for(const cx of[x+5,x+w-5]){cyl(cx,y+d+4,0,4,H,M.stone,{n:10});box(cx-6,y+d-2,H-3,12,12,4,M.stoneD,{})}
    box(x-4,y-4,H,w+8,d+12,5,M.stoneD,{});
    prismX(x-4,y-4,d+12,[[0,H+5],[w+8,H+5],[(w+8)/2,H+27]],M.stone,{ms:M.stoneD,texF:()=>{const c=S(x+w/2,y+d+8.1,H+12);ctx.fillStyle=M.bone[0];ink(1.4);ctx.beginPath();ctx.ellipse(c[0],c[1],5,4,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=INK;ball([c[0]-1.8,c[1]-.3],1.1);ctx.fill();ball([c[0]+1.8,c[1]-.3],1.1);ctx.fill()}});
    const tq=S(x+w/2,y+d,H-6);ctx.fillStyle='rgba(10,10,14,.6)';ctx.fillRect(tq[0]-12,tq[1]-2,24,2);
    for(let i=0;i<10;i++){const q2=S(x+rnd()*w,y+d,H-rnd()*30);ctx.fillStyle=rnd()<.5?'rgba(80,120,50,.7)':'rgba(50,90,40,.7)';ctx.beginPath();ctx.ellipse(q2[0],q2[1],rr(1.5,3.5),rr(1,2),0,0,TAU);ctx.fill()}},{k:Dp(x+w,y+d),m:30});
  flames.push({x:x+w/2,y:y+d+1,z:12,r:7,rgb:'120,255,140',crypt:1})}
function house(x,y,w,d){const H=74,th=10,door=x+w*.5,dw=34,rh=56,ov=12,o={x,y,w,d,H};const h={o,a:1,inside:false};houses.push(h);
  const wallPc=(a,b,W,D,part)=>{solid(a,b,W,D);thing([a,b,a+W,b+D,H+4],()=>box(a,b,0,W,D,H,M.plank,{tex:{s:texSiding,e:texSiding,w:texSiding,n:texSiding},ow:2.2}),{house:h,part,m:20})};
  const run=(x0,y0,x1,y1,part)=>{const hor=y0===y1,len=hor?x1-x0:y1-y0,n=Math.max(1,Math.round(len/T));for(let i=0;i<n;i++)wallPc(x0+(hor?i*len/n:0),y0+(hor?0:i*len/n),hor?len/n:th,hor?th:len/n,part)};
  run(x,y,x+w,y,'back');run(x,y+th,x,y+d-th,'back');
  thing([x+w*.6,y+th,x+w*.6+50,y+th+18,60],()=>{box(x+w*.6,y+th,0,44,14,54,M.brick,{tex:{s:texBrick,e:texBrick,w:texBrick}});const a=S(x+w*.6+10,y+th+14.1,0),b=S(x+w*.6+34,y+th+14.1,22);ctx.fillStyle='#120804';ctx.fillRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);ink(1.6);ctx.strokeRect(a[0],b[1],b[0]-a[0],a[1]-b[1]);box(x+w*.6-3,y+th,54,50,17,4,M.plankD,{})},{house:h,part:'back',m:20});
  flames.push({x:x+w*.6+22,y:y+th+15,z:4,r:8,rgb:'255,140,50',fire:1,house:h});lights.push({x:x+w*.6+22,y:y+th+40,r:110,rgb:'255,140,60',a:.5,fl:1,house:h});
  thing([x+12,y+20,x+w-12,y+d-14,50],()=>{const r=[[x+50,y+60,0],[x+150,y+60,0],[x+150,y+120,0],[x+50,y+120,0]];face(r,[0,0,1],M.cloth,{col:'#6a2e3a',sheen:false});
    box(x+80,y+76,16,40,26,4,M.wood,{});for(const[a,b] of[[2,2],[34,2],[2,22],[34,22]])box(x+80+a,y+76+b,0,4,4,16,M.wood,{noOut:true});box(x+66,y+82,0,10,14,10,M.wood,{});box(x+66,y+82,10,3,14,14,M.wood,{});
    box(x+18,y+26,0,34,56,12,M.wood,{});box(x+20,y+28,12,30,50,5,M.cloth,{});box(x+22,y+30,17,26,12,4,M.bone,{});
    box(x+w-30,y+70,0,16,40,44,M.plankD,{});for(const z of[14,28])box(x+w-31,y+70,z,18,40,2,M.wood,{noOut:true});for(let i=0;i<3;i++){const q=S(x+w-22,y+78+i*12,31);ctx.fillStyle=['#5a8a6a','#8a5a3a','#6a6a9a'][i];ctx.fillRect(q[0]-3,q[1]-8,6,8);ink(1);ctx.strokeRect(q[0]-3,q[1]-8,6,8)}},{house:h,part:'in',k:Dp(x+w/2,y+d/2),m:20});
  flames.push({x:x+100,y:y+89,z:24,r:1.5,rgb:'255,170,80',house:h,indoor:1});
  const a=door-dw/2;wallPc(x,y+d-th,a-x,th,'front');wallPc(a+dw,y+d-th,x+w-a-dw,th,'front');
  thing([a-4,y+d-th,a+dw+4,y+d+4,H],()=>{box(a,y+d-th,48,dw,th,H-48,M.plank,{tex:{s:texSiding},ow:2.2});box(a-3,y+d-1,0,3,3,50,M.plankD,{});box(a+dw,y+d-1,0,3,3,50,M.plankD,{});box(a-3,y+d-1,48,dw+6,3,4,M.plankD,{});
    path([[a,y+d,0],[a+dw,y+d,0],[a+dw,y+d,48],[a,y+d,48]].map(S));ctx.fillStyle='#0c0806';ctx.fill();
    face([[a+1,y+d,0],[a+5,y+d-24,0],[a+5,y+d-24,46],[a+1,y+d,46]],nrm3([1,.17,0]),M.plankD,{edge:INK,ew:1.8})},{house:h,part:'front',k:Dp(door,y+d)});
  run(x+w-th,y+th,x+w-th,y+d-th,'front');
  const win=(cx,cy,fc,lit,boards)=>{const U=fc==='s'?[1,0,0]:[0,-1,0],n=fc==='s'?[0,1,0]:[1,0,0],O=fc==='s'?[cx-13,cy+.5,30]:[cx+.5,cy+13,30],P=(u,z)=>[O[0]+U[0]*u,O[1]+U[1]*u,O[2]+z];
    thing([cx-24,cy-24,cx+24,cy+24,H],()=>{const pts=[P(0,0),P(26,0),P(26,26),P(0,26)];path(pts.map(S));ctx.fillStyle=lit?'#ffcf7a':'#141018';ctx.fill();
      if(lit){ctx.save();ctx.clip();const c=S(P(13,13)),g=ctx.createRadialGradient(c[0],c[1],2,c[0],c[1],22);g.addColorStop(0,'rgba(255,240,200,.95)');g.addColorStop(1,'rgba(255,150,60,.35)');ctx.fillStyle=g;ctx.fillRect(c[0]-30,c[1]-30,60,60);
        ctx.fillStyle='rgba(40,20,10,.55)';const s0=S(P(16,0)),s1=S(P(16,15));ctx.beginPath();ctx.ellipse(s1[0],s1[1],4,5,0,0,TAU);ctx.fill();ctx.fillRect(s0[0]-5,s1[1],10,s0[1]-s1[1]);ctx.restore()}
      ink(2.2);path(pts.map(S));ctx.stroke();L3(P(13,0),P(13,26),M.plankD[1],2.4);L3(P(0,13),P(26,13),M.plankD[1],2.4);
      L3(P(-3,-1),P(29,-1),INK,5);L3(P(-3,-1),P(29,-1),M.plank[2],2.6);
      if(boards){for(let j=0;j<2;j++){const A=P(-4,6+j*12+(j?3:-2)),B=P(30,6+j*12+(j?-3:2));L3(A,B,INK,6.5);L3(A,B,M.plank[j?0:2],4)}}
      else face([P(-2,0),P(-13,2),P(-13,27),P(-2,26)],n,M.plankD,{edge:INK,ew:1.6})},{house:h,part:'front',k:Dp(cx,cy)+.5,m:24});
    if(lit)lights.push({x:cx+(fc==='s'?0:22),y:cy+(fc==='s'?24:0),r:70,rgb:'255,180,90',a:.4,fl:0})};
  win(x+w*.2,y+d,'s',true,false);win(x+w*.82,y+d,'s',false,true);win(x+w,y+d*.45,'e',true,false);
  thing([door-34,y+d,door+34,y+d+34,10],()=>{box(door-30,y+d,0,60,24,6,M.plankD,{tex:{t:texPlank,s:texPlank}});box(door-20,y+d+24,0,40,8,3,M.plankD,{})},{k:Dp(door,y+d+24),m:20});
  for(const px of[door-27,door+27]){solid(px-3,y+d+18,6,6);thing([px-5,y+d+16,px+5,y+d+26,64],()=>cyl(px,y+d+21,6,2.6,52,M.wood,{n:8}),{k:Dp(px,y+d+21),m:16})}
  thing([door-36,y+d-6,door+36,y+d+30,70],()=>{prismY(door-34,y+d-4,68,[[0,64],[30,55],[30,58],[0,67]],M.shingle,{me:M.plankD,texS:(a2,b2,c2)=>{for(let k=.25;k<1;k+=.25)L3([a2[0],lerp(a2[1],c2[1],k),lerp(a2[2],c2[2],k)],[b2[0],lerp(a2[1],c2[1],k),lerp(a2[2],c2[2],k)],'rgba(10,6,8,.5)',1)}})},{house:h,part:'roof',k:Dp(door,y+d+30),m:16});
  flames.push({x:door+14,y:y+d+14,z:43,r:3,rgb:'255,190,110',glass:1});lights.push({x:door+14,y:y+d+22,r:90,rgb:'255,180,100',a:.45,fl:1});
  thing([door+8,y+d+8,door+20,y+d+20,60],()=>{L3([door+14,y+d+14,55],[door+14,y+d+14,48],INK,1.2);box(door+11,y+d+11,38,6,6,10,M.glass,{m:{t:M.iron,s:M.glass,e:M.glass},ow:1.6});box(door+10,y+d+10,48,8,8,2,M.iron,{ow:1.4})},{k:Dp(door+14,y+d+25),m:12});
  thing([x-ov-6,y-ov-6,x+w+ov+6,y+d+ov+6,H+rh+40],()=>{const L=x-ov,len=w+ov*2,Y0=y-ov,Y1=y+d+ov,ym=y+d/2;
    prismY(L,Y0,len,[[0,H],[Y1-Y0,H],[(Y1-Y0)/2,H+rh]],M.shingle,{me:M.plank,texE:()=>{texSiding([L+len,Y1-1,H],[0,-(Y1-Y0)+2,0],[0,0,rh*.8]);const c=S(L+len+.5,ym,H+rh*.45);ctx.fillStyle='#ffcf7a';ink(1.8);ctx.beginPath();ctx.arc(c[0],c[1],5,0,TAU);ctx.fill();ctx.stroke();L3([L+len+.5,ym-5,H+rh*.45],[L+len+.5,ym+5,H+rh*.45],INK,1.2)},
      texS:(a2,b2,c2)=>{for(let k=.12;k<1;k+=.12){const A=[a2[0],lerp(a2[1],c2[1],k),lerp(a2[2],c2[2],k)],k2=Math.min(1,k+.12),A2=[a2[0],lerp(a2[1],c2[1],k2),lerp(a2[2],c2[2],k2)];L3(A,[b2[0],A[1],A[2]],'rgba(10,6,8,.6)',1.1);
          for(let u=(Math.round(k/.12)%2?6:12);u<len;u+=12)L3([A[0]+u,A[1],A[2]],[A2[0]+u,A2[1],A2[2]],'rgba(10,6,8,.4)',.9)}
        for(let i=0;i<9;i++){const k=rnd(),u=rnd(),q=S(a2[0]+u*len,lerp(a2[1],c2[1],k),lerp(a2[2],c2[2],k));ctx.fillStyle='rgba(98,140,64,.55)';ctx.beginPath();ctx.ellipse(q[0],q[1],rr(2,6),rr(1,2.4),0,0,TAU);ctx.fill()}}});
    L3([L,ym,H+rh+1],[L+len,ym,H+rh+1],INK,5);L3([L,ym,H+rh+1],[L+len,ym,H+rh+1],M.shingle[2],2.6);
    const hc=S(x+w*.3,ym+d*.28,H+rh*.45);ctx.fillStyle='#0a0608';ctx.beginPath();ctx.moveTo(hc[0]-12,hc[1]-3);ctx.lineTo(hc[0]-3,hc[1]-8);ctx.lineTo(hc[0]+13,hc[1]-4);ctx.lineTo(hc[0]+6,hc[1]+6);ctx.lineTo(hc[0]-9,hc[1]+4);ctx.closePath();ctx.fill();ink(1.8);ctx.stroke();ctx.strokeStyle=M.wood[2];ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(hc[0]-8,hc[1]-6);ctx.lineTo(hc[0]+5,hc[1]+5);ctx.stroke();
    box(x+w*.66,ym-24,H+rh*.35,20,18,rh*.95,M.brick,{tex:{s:texBrick,e:texBrick}});box(x+w*.66-2,ym-26,H+rh*1.3,24,22,4,M.stoneD,{})},{house:h,part:'roof',k:Dp(x+w+ov,y+d+ov)+1,m:20});
  smokes.push({x:x+w*.66+10,y:y+d/2-15,z:H+rh*1.34,t:0});return h}
function fence(x0,y0,x1,y1){const hor=y0===y1,len=hor?x1-x0:y1-y0,n=Math.max(1,Math.round(len/T));for(let i=0;i<n;i++){const a=i*len/n,b=(i+1)*len/n,x=hor?x0+a:x0,y=hor?y0:y0+a,W=hor?b-a:4,D=hor?4:b-a;solid(x-(hor?0:3),y-(hor?3:0),W+(hor?0:6),D+(hor?6:0));shade(x,y,W,D,26,.4);
  thing([x-4,y-4,x+W+4,y+D+4,34],()=>{const k=Math.max(2,Math.round((hor?W:D)/10));if(hor){box(x,y-1,8,W,2,4,M.plank,{ow:1.6});box(x,y-1,18,W,2,4,M.plank,{ow:1.6})}else{box(x-1,y,8,2,D,4,M.plank,{ow:1.6});box(x-1,y,18,2,D,4,M.plank,{ow:1.6})}
    for(let j=0;j<k;j++){const c=(j+.5)/k,h2=22+((j*5)%3)*1.5,tl=((j*7)%5-2)*.04;if(hor)prismX(x+W*c,y,3,[[-3.5,0],[3.5,0],[3.5,h2],[0,h2+5],[-3.5,h2]].map(([u,z])=>[u+tl*z,z]),j%4?M.plank:M.plankD,{ow:1.8});
      else{const yy=y+D*c;box(x-1.5,yy-3.5,0,3,7,h2,j%4?M.plank:M.plankD,{ow:1.8});const t=S(x,yy,h2+5),p=S(x+1.5,yy-3.5,h2),q=S(x+1.5,yy+3.5,h2);ctx.fillStyle=M.plank[0];ink(1.6);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(t[0],t[1]);ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill();ctx.stroke()}}},{m:16})}}
function well(x,y){solid(x-22,y-22,44,44);shadeR(x+16,y-8,26,40,.5);thing([x-34,y-34,x+34,y+34,90],()=>{cyl(x,y,0,22,22,M.stone,{n:16,mt:M.stoneD,tex:()=>{for(const z of[7,14])for(let i=0;i<16;i++){const a=i/16*TAU,b=(i+1)/16*TAU;if(VIS([Math.cos((a+b)/2),Math.sin((a+b)/2),0]))L3([x+Math.cos(a)*22.2,y+Math.sin(a)*22.2,z],[x+Math.cos(b)*22.2,y+Math.sin(b)*22.2,z],'rgba(10,10,14,.5)',1)}}});
    const t=S(x,y,22);ctx.fillStyle='#050607';ctx.beginPath();ctx.ellipse(t[0],t[1],16,16*K,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(80,120,160,.35)';ctx.beginPath();ctx.ellipse(t[0]+3,t[1]+2,8,8*K*.8,0,0,TAU);ctx.fill();
    for(const sx of[-19,19])box(x+sx-2,y-2,22,4,4,40,M.wood,{});box(x-23,y-2,58,46,4,4,M.wood,{});
    prismY(x-26,y-16,52,[[0,62],[32,62],[16,78]],M.shingle,{me:M.plankD});
    L3([x,y,58],[x+4,y,36],'#a08a5a',1.3);cyl(x+4,y,26,5,9,M.wood,{n:8,r1:6})},{m:20})}
function barrow(x,y){solid(x-20,y-12,44,24);shade(x-20,y-10,40,20,18,.45);thing([x-30,y-20,x+34,y+20,50],()=>{
    for(const sd of[-1,1]){L3([x+16,y+sd*9,10],[x-28,y+sd*7,14],INK,3.4);L3([x+16,y+sd*9,10],[x-28,y+sd*7,14],M.wood[0],1.6);L3([x-8,y+sd*8,10],[x-10,y+sd*8,0],INK,2.6)}
    const q=S(x+20,y,6);ctx.strokeStyle=INK;ctx.lineWidth=3.6;ctx.beginPath();ctx.ellipse(q[0],q[1],6,6,0,0,TAU);ctx.stroke();ctx.strokeStyle=M.wood[2];ctx.lineWidth=1.6;ctx.stroke();
    prismY(x-12,y-12,28,[[0,10],[24,10],[28,22],[-4,22]],M.iron,{me:M.iron});
    blob(S(x-2,y-2,25),7,M.pumpkin,.8,{ow:2});blob(S(x+8,y+4,24),6,M.pumpkin,.8,{ow:2});
    L3([x-14,y-6,20],[x+10,y-14,46],INK,3.4);L3([x-14,y-6,20],[x+10,y-14,46],M.wood[2],1.6)},{m:20})}
function openGrave(x,y){holes.push([x,y]);solid(x+16,y-10,22,20);thing([x+10,y-16,x+44,y+16,50],()=>{const q=S(x+26,y,0);ctx.save();ctx.translate(q[0],q[1]);ctx.fillStyle=M.soil[1];ctx.beginPath();ctx.ellipse(0,0,17,9,-.3,0,TAU);ctx.fill();ink(2);ctx.stroke();ctx.fillStyle=M.soil[0];ctx.beginPath();ctx.ellipse(-2,-4,14,7,-.3,0,TAU);ctx.fill();ctx.fillStyle=M.soil[2];ctx.beginPath();ctx.ellipse(-5,-7,7,3.4,-.3,0,TAU);ctx.fill();
    for(let i=0;i<7;i++){ctx.fillStyle=i%2?M.soil[2]:'#6a5a4a';ball([rr(-14,14),rr(-8,5)],rr(1,2.2));ctx.fill()}ctx.restore();
    L3([x+30,y,6],[x+36,y-6,44],INK,3.6);L3([x+30,y,6],[x+36,y-6,44],M.wood[2],1.8);face([[x+25,y+1,2],[x+35,y+1,2],[x+34,y+1,14],[x+26,y+1,14]],[0,1,0],M.iron,{edge:INK,ew:1.8});L3([x+34,y-4,44],[x+39,y-9,44],INK,3)},{k:Dp(x+26,y+8),m:16})}
function sign(x,y){solid(x-5,y-5,10,10);shade(x-4,y-4,8,8,60,.45);thing([x-50,y-30,x+50,y+30,70],()=>{cyl(x,y,0,3.4,62,M.wood,{n:8});
  const board=(z,dir,txt)=>{const len=42,x0=dir>0?x:x-len,P=[[x0,y+2,z],[x0+len,y+2,z],[x0+len+(dir>0?6:0),y+2,z+5],[x0+len,y+2,z+10],[x0,y+2,z+10],[x0-(dir<0?6:0),y+2,z+5]];
    face(P,[0,1,0],M.plank,{edge:INK,ew:2,ao:false});const o=S(x0+5,y+2,z+2.6),ux=S(x0+6,y+2,z+2.6),vz=S(x0+5,y+2,z+3.6);ctx.save();ctx.transform(ux[0]-o[0],ux[1]-o[1],-(vz[0]-o[0]),-(vz[1]-o[1]),o[0],o[1]);ctx.scale(1,-1);ctx.fillStyle='#2a1a0c';ctx.font='800 7.5px "Baloo 2",system-ui';ctx.textBaseline='bottom';ctx.fillText(txt,dir>0?2:5,0);ctx.restore()};
  board(48,-1,'Cimitero');board(34,1,'Casa')},{m:20})}
function build(){seed=11;
  wall(0,.35*T,3.7*T,.35*T,true);wall(0,7.3*T,3.7*T,7.3*T,true);wall(3.7*T,.35*T,3.7*T,4.85*T,true);wall(3.7*T,6.15*T,3.7*T,7.3*T,true);
  pillar(3.7*T,4.95*T);pillar(3.7*T,6.05*T);gateLeaf(3.7*T,4.95*T,30,-2.1);gateLeaf(3.7*T,6.05*T,30,2.2);
  crypt(.35*T,.8*T,1.9*T,1.35*T);
  for(const[x,y,k,o] of[[2.9*T,1.4*T,1],[1*T,3.2*T,0,{wreath:1}],[1.9*T,3.3*T,2],[2.85*T,3.25*T,3],[.95*T,5*T,1,{lean:.12}],[2.9*T,5.1*T,0,{candle:1}],[1*T,6.5*T,2,{lean:-.15}],[2.85*T,6.55*T,0]])grave(x,y,k,o);
  openGrave(1.6*T,4.95*T);tree(3*T,2.25*T,true,1.05);sign(4.3*T,6.8*T);
  house(5.5*T,1*T,3.7*T,2.5*T);
  fence(5.2*T,4.25*T,6.65*T,4.25*T);fence(8.05*T,4.25*T,9.6*T,4.25*T);fence(9.6*T,.9*T,9.6*T,4.25*T);
  pumpkin(6.85*T,4.05*T,1,true);pumpkin(7.85*T,4.1*T,1.2,true);pumpkin(9.25*T,4.7*T,.9,false);
  lamp(4.2*T,4.3*T);lamp(5.35*T,8.6*T);well(8.4*T,6.2*T);barrow(6.3*T,5.75*T);
  thing([8.9*T,4.6*T,9.7*T,5.4*T,40],()=>{crate(8.95*T,4.7*T);crate(9.32*T,4.74*T,.8);barrel(9.5*T,5.2*T)},{k:Dp(9.4*T,5.3*T)});solid(8.95*T,4.65*T,50,44);shade(8.95*T,4.7*T,50,40,24,.45);
  tree(8.9*T,8.6*T,false,1.05);tree(.7*T,9.1*T,false,.85);
  holes.push([8.1*T,7.9*T],[2.3*T,9.2*T]);
  for(const[x,y] of[[2.7*T,2.65*T],[.6*T,3.9*T],[8.55*T,9.15*T],[1.6*T,6.9*T],[3.2*T,5.6*T]])mushrooms.push({x,y,ph:rnd()*6});
  crows.push({x:2*T,y:7.3*T,z:52,face:0,t:0});
  solid(-200,-200,WW+400,200);solid(-200,WW,WW+400,200);solid(-200,0,200,WW);solid(WW,0,200,WW);
  things.sort((a,b)=>a.k-b.k)}
let groundTex=null,sides=null,backdrop=null;
function bakeGround(){const c=document.createElement('canvas');c.width=c.height=WW*GT;const g=c.getContext('2d'),sv=ctx;ctx=g;ctx.scale(GT,GT);seed=5;
  try{const inCem=(x,y)=>x<3.7*T&&y>.35*T&&y<7.3*T,onPath=(x,y)=>(x>3.85*T&&x<4.95*T&&y>4.2*T)||(y>5.05*T&&y<6*T&&x>3.6*T&&x<5*T)||(y>4.2*T&&y<5.15*T&&x>3.85*T&&x<7.75*T)||(x>6.95*T&&x<7.75*T&&y>3.4*T&&y<5*T);
    ctx.fillStyle=M.grass[0];ctx.fillRect(0,0,WW,WW);for(let i=0;i<500;i++){ctx.globalAlpha=.35;ctx.fillStyle=rnd()<.5?M.grass[1]:M.grass[2];ctx.beginPath();ctx.ellipse(rnd()*WW,rnd()*WW,rr(8,26),rr(6,18),rnd()*3,0,TAU);ctx.fill()}ctx.globalAlpha=1;
    ctx.fillStyle='rgba(60,58,50,.55)';ctx.fillRect(0,.35*T,3.7*T,6.95*T);for(let i=0;i<180;i++){ctx.fillStyle=rnd()<.5?'rgba(40,38,30,.4)':'rgba(110,100,70,.25)';ctx.beginPath();ctx.ellipse(rnd()*3.7*T,.35*T+rnd()*6.95*T,rr(4,14),rr(3,9),0,0,TAU);ctx.fill()}
    ctx.fillStyle='#2a2826';for(let y=0;y<WW;y+=4)for(let x=0;x<WW;x+=4)if(onPath(x+2,y+2))ctx.fillRect(x,y,4.5,4.5);
    for(let y=4;y<WW;y+=11)for(let x=(Math.round(y/11)%2)*6;x<WW;x+=12){const px=x+rr(-1.5,1.5),py=y+rr(-1.5,1.5);if(!onPath(px,py))continue;const r=rr(4,5.5),col=mix(M.stone[0],M.stone[2],rnd()*.5);
      ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(px+1.4,py-.8,r,r*.85,0,0,TAU);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(px,py,r,r*.85,rnd(),0,TAU);ctx.fill();ctx.fillStyle='rgba(255,240,220,.18)';ctx.beginPath();ctx.ellipse(px-1.6,py+1,r*.5,r*.35,0,0,TAU);ctx.fill()}
    for(let i=0;i<300;i++){const x=rnd()*WW,y=rnd()*WW;if(!onPath(x,y))continue;ctx.fillStyle='rgba(90,130,60,.6)';ctx.beginPath();ctx.ellipse(x,y,rr(1,2.5),rr(.8,1.6),0,0,TAU);ctx.fill()}
    for(let i=0;i<1800;i++){const x=rnd()*WW,y=rnd()*WW;if(onPath(x,y))continue;const cem=inCem(x,y);ctx.strokeStyle=cem?(rnd()<.5?'#5a5a3e':'#3a3c2c'):(rnd()<.5?'#5a7a3e':'#24301c');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rr(-2,2),y+rr(2,5));ctx.stroke()}
    for(let i=0;i<240;i++){const a=rnd()*TAU,d=rnd()*90,big=rnd()<.6,cx=big?8.9*T:3*T,cy=big?8.6*T:2.2*T,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(x<0||y<0||x>WW||y>WW)continue;ctx.fillStyle=['#a8562a','#c87a2a','#7a4a22','#d0a040'][Math.floor(rnd()*4)];ctx.save();ctx.translate(x,y);ctx.rotate(rnd()*TAU);ctx.beginPath();ctx.ellipse(0,0,2.6,1.3,0,0,TAU);ctx.fill();ctx.restore()}
    const h=houses[0].o;ctx.fillStyle=M.plank[1];ctx.fillRect(h.x,h.y,h.w,h.d);for(let y=h.y;y<h.y+h.d;y+=7){ctx.fillStyle=Math.round(y/7)%2?M.plank[0]:mix(M.plank[0],M.plank[1],.4);ctx.fillRect(h.x,y,h.w,6.3)}
    for(const[x,y] of holes){ctx.fillStyle=M.soil[1];ctx.beginPath();ctx.ellipse(x,y,22,13,.3,0,TAU);ctx.fill();ctx.fillStyle='#090706';ctx.beginPath();ctx.ellipse(x,y,15,8,.3,0,TAU);ctx.fill();ctx.strokeStyle='rgba(120,100,70,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y,15,8,.3,Math.PI,TAU);ctx.stroke()}
    const sx=-LG[0]/LG[2],sy=-LG[1]/LG[2];ctx.save();if('filter' in ctx)ctx.filter='blur(3px)';
    for(const s of shadows){ctx.fillStyle=`rgba(0,0,0,${(s.a||.4)*.9})`;if(s.r){ctx.beginPath();ctx.ellipse(s.x+sx*s.h*.5,s.y+sy*s.h*.5,s.r,s.r*.8,0,0,TAU);ctx.fill();continue}
      const o=[sx*s.h,sy*s.h],P=[[s.x,s.y],[s.x+s.w,s.y],[s.x+s.w,s.y+s.d],[s.x,s.y+s.d]];path(hull(P.concat(P.map(p=>[p[0]+o[0],p[1]+o[1]]))));ctx.fill()}
    if('filter' in ctx)ctx.filter='blur(2px)';for(const s of solids){if(s.w>300||s.d>300)continue;ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(s.x-1,s.y-1,s.w+2,s.d+2)}ctx.restore()
  }finally{ctx=sv}groundTex=c;
  sides=sprite(sbox([0,0,WW,WW,0],DEEP+40),()=>{const lay=(O,U,n)=>{const P=[O,add3(O,U),add3(add3(O,U),[0,0,-DEEP]),add3(O,[0,0,-DEEP])];
      face(P,n,M.soil,{ao:false,tex:()=>{for(let i=1;i<6;i++){const z=-i*DEEP/6+rr(-3,3);ctx.strokeStyle=i%2?'rgba(0,0,0,.35)':'rgba(140,110,80,.25)';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<=24;k++){const q=S(add3(add3(O,U,k/24),[0,0,z+Math.sin(k*1.3+i)*2.5]));k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke()}
        for(let i=0;i<46;i++){const q=S(add3(add3(O,U,rnd()),[0,0,-rnd()*DEEP]));ctx.fillStyle=rnd()<.5?'#7a7068':'#5a524a';ctx.beginPath();ctx.ellipse(q[0],q[1],rr(2,6),rr(1.5,4),rnd(),0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1;ctx.stroke()}
        for(let i=0;i<10;i++){const a=S(add3(add3(O,U,rnd()),[0,0,-2])),b=[a[0]+rr(-10,10),a[1]+rr(18,44)];ctx.strokeStyle='#2a1e14';ctx.lineWidth=rr(1.5,3);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(a[0]+rr(-12,12),(a[1]+b[1])/2,b[0],b[1]);ctx.stroke()}
        const y0=Math.min(S(O)[1],S(add3(O,U))[1]),g=ctx.createLinearGradient(0,y0,0,y0+DEEP+60);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(8,10,16,.95)');ctx.fillStyle=g;ctx.fillRect(-4000,-4000,9000,9000)}});
      for(let i=0;i<70;i++){const q=S(add3(O,U,rnd()));ctx.strokeStyle=rnd()<.5?'#4d6338':'#36452b';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(q[0],q[1]-1);ctx.lineTo(q[0]+rr(-2,2),q[1]+rr(3,9));ctx.stroke()}};
    lay([0,WW,0],[WW,0,0],[0,1,0]);lay([WW,WW,0],[0,-WW,0],[1,0,0]);outline([[0,WW,0],[WW,WW,0],[WW,0,0],[0,WW,-DEEP],[WW,WW,-DEEP],[WW,0,-DEEP]],3);
    // the ground laid with the camera's slant, baked together with the sides: the camera only moves and zooms
    ctx.save();ctx.transform(cs,K*sn,-sn,K*cs,0,0);ctx.drawImage(groundTex,0,0,WW,WW);ctx.restore()})}
function bakeBackdrop(W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');seed=9;
  const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#0d1020');sk.addColorStop(.55,'#1a1c2c');sk.addColorStop(1,'#0b0c12');g.fillStyle=sk;g.fillRect(0,0,W,H);
  for(let i=0;i<140;i++){g.fillStyle=`rgba(220,230,255,${rr(.2,.8)})`;g.fillRect(rnd()*W,rnd()*H*.5,1.4,1.4)}
  const mx=W*.78,my=H*.13,mr=Math.min(W,H)*.06,mg=g.createRadialGradient(mx,my,mr*.5,mx,my,mr*5);mg.addColorStop(0,'rgba(200,215,255,.35)');mg.addColorStop(1,'rgba(200,215,255,0)');g.fillStyle=mg;g.fillRect(0,0,W,H);
  g.fillStyle='#e8ecff';g.beginPath();g.arc(mx,my,mr,0,TAU);g.fill();g.fillStyle='rgba(150,160,200,.35)';for(const[dx,dy,r] of[[-.3,-.2,.22],[.25,.15,.15],[.05,.35,.1]]){g.beginPath();g.arc(mx+dx*mr,my+dy*mr,r*mr,0,TAU);g.fill()}
  const hills=(y,col,amp,f)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,y+Math.sin(x*f+y)*amp+Math.sin(x*f*2.7)*amp*.4);g.lineTo(W,H);g.closePath();g.fill()};
  hills(H*.36,'#151827',18*W/400,.008*400/W);
  const cx=W*.2,cy=H*.36,u=W/400;g.fillStyle='#10121c';g.fillRect(cx-22*u,cy-30*u,44*u,34*u);g.beginPath();g.moveTo(cx-6*u,cy-30*u);g.lineTo(cx,cy-74*u);g.lineTo(cx+6*u,cy-30*u);g.fill();g.fillStyle='rgba(255,200,120,.8)';g.fillRect(cx-2*u,cy-24*u,4*u,7*u);
  hills(H*.43,'#10131d',14*u,.012/u);for(let i=0;i<14;i++){const x=rnd()*W,y=H*.43+Math.sin(x*.012/u+H*.43)*14*u;g.strokeStyle='#0b0d15';g.lineWidth=2.5*u;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-rr(18,34)*u);g.stroke();g.lineWidth=1.4*u;for(let k=0;k<3;k++){g.beginPath();g.moveTo(x,y-rr(10,28)*u);g.lineTo(x+rr(-10,10)*u,y-rr(24,40)*u);g.stroke()}}
  const mist=g.createLinearGradient(0,H*.4,0,H);mist.addColorStop(0,'rgba(60,70,100,0)');mist.addColorStop(.4,'rgba(60,70,100,.25)');mist.addColorStop(1,'rgba(10,12,20,.9)');g.fillStyle=mist;g.fillRect(0,0,W,H);backdrop=c}
const hero={x:4.4*T,y:8.4*T,face:-Math.PI/2,walk:0,moving:false,aim:0,fireCd:0},cam={x:0,y:0,z:1},Z=[],FX=[],flies=[],leaves=[],puffs=[];let coins=0;
const KINDS=[['zombie',1.1,30,4],['strisciante',1.1,24,3],['minatore',1.1,28,5],['lanterna',1.55,22,7],['hound',1.05,64,3]];
function hit(x,y,r){for(const s of solids){const cx=cl(x,s.x,s.x+s.w),cy=cl(y,s.y,s.y+s.d);if((x-cx)**2+(y-cy)**2<r*r)return s}return null}
function move(o,dx,dy,r){o.x+=dx;if(hit(o.x,o.y,r))o.x-=dx;o.y+=dy;if(hit(o.x,o.y,r))o.y-=dy}
function spawn(){const c=holes.filter(([x,y])=>Math.hypot(x-hero.x,y-hero.y)>110);if(!c.length)return;const p=c[Math.floor(rnd()*c.length)],k=KINDS[Math.floor(rnd()*KINDS.length)];
  if(Z.some(z=>Math.hypot(z.x-p[0],z.y-p[1])<30))return;Z.push({kind:k[0],sc:k[1],spd:k[2],hp:k[3],x:p[0],y:p[1],face:0,p:rnd(),anim:'walk',rise:0,die:0,flash:0})}
{const _h=held;held=function(St,o,B){if(St.gun&&window.ARMI)return ARMI.inMano(St.gun,B,o.gp||{},o.aim);return _h(St,o,B)}}
const HSTYLE=Object.assign({},HERO,{held:null,quiver:false,gun:'pistola'});let gunState=null,spawnT=1.2,zOn=true;
for(let i=0;i<16;i++)flies.push({x:rnd()*WW,y:rnd()*WW,z:rr(6,40),a:rnd()*TAU,ph:rnd()*TAU});
const scrAng=(dx,dy)=>{const a=S(dx,dy,0);return Math.atan2(a[1],a[0])};
function update(dt,inp){G.t+=dt;
  const m=Math.hypot(inp.x,inp.y);hero.moving=m>.15;if(hero.moving){const sp=150*Math.min(1,m),ux=inp.x/m,uy=inp.y/m/K,wx=cs*ux+sn*uy,wy=-sn*ux+cs*uy,wl=Math.hypot(wx,wy);
    move(hero,wx/wl*sp*dt,wy/wl*sp*dt,10);hero.face=Math.atan2(inp.y,inp.x);hero.walk+=dt*12}
  hero.fireCd-=dt;let tgt=null,bd=230;for(const z of Z){if(z.rise<1||z.die)continue;const d=Math.hypot(z.x-hero.x,z.y-hero.y);if(d<bd){bd=d;tgt=z}}
  if(gunState)gunState.update(dt,!hero.moving&&!!tgt);
  if(tgt){hero.aim=scrAng(tgt.x-hero.x,tgt.y-hero.y);if(!hero.moving)hero.face=hero.aim}
  if(!hero.moving&&tgt&&hero.fireCd<=0){hero.fireCd=.36;tgt.hp--;tgt.flash=.12;const hs=S(hero.x,hero.y,0),ts=S(tgt.x,tgt.y,24);FX.push({k:'shot',a:[hs[0]+Math.cos(hero.aim)*16,hs[1]-14+Math.sin(hero.aim)*16],b:ts,t:.08});
    for(let i=0;i<5;i++)FX.push({k:'drop',x:ts[0],y:ts[1],vx:rr(-40,40),vy:rr(-60,-10),t:.5});if(tgt.hp<=0){tgt.die=.001;coins+=60}}
  spawnT-=dt;if(zOn&&spawnT<=0&&Z.length<5){spawn();spawnT=rr(2,3.5)}
  for(const z of Z){if(z.flash>0)z.flash-=dt;if(z.die){z.die+=dt;continue}if(z.rise<1){z.rise=Math.min(1,z.rise+dt/1.3);z.face=Math.atan2(hero.y-z.y,hero.x-z.x);continue}
    const dx=hero.x-z.x,dy=hero.y-z.y,d=Math.hypot(dx,dy);z.face=Math.atan2(dy,dx);
    if(d<30){if(z.anim!=='attack'){z.anim='attack';z.p=0}z.p+=dt/1.4}else{if(z.anim!=='walk'){z.anim='walk';z.p=0}z.p+=dt/(z.kind==='hound'?.6:1.1);move(z,dx/d*z.spd*dt,dy/d*z.spd*dt,11)}
    for(const o of Z)if(o!==z&&!o.die){const ex=z.x-o.x,ey=z.y-o.y,e=Math.hypot(ex,ey);if(e>0&&e<24)move(z,ex/e*(24-e)*.5,ey/e*(24-e)*.5,11)}z.p%=1}
  for(let i=Z.length-1;i>=0;i--)if(Z[i].die>1.1||(!zOn&&Z[i].rise<1))Z.splice(i,1);
  for(const f of FX){f.t-=dt;if(f.k==='drop'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt}}for(let i=FX.length-1;i>=0;i--)if(FX[i].t<=0)FX.splice(i,1);
  for(const h of houses){const{x,y,w,d}=h.o;h.inside=hero.x>x&&hero.x<x+w&&hero.y>y&&hero.y<y+d+4;h.a+=((h.inside?0:1)-h.a)*Math.min(1,dt*7)}
  for(const c of crows){c.t+=dt;c.face=Math.sin(c.t*.7)*.8+(Math.sin(c.t*2.3)>.9?1.2:0)}
  if(!LOWFX){for(const f of flies){f.a+=dt*(Math.sin(G.t*.7+f.ph)*1.6);f.x+=Math.cos(f.a)*14*dt;f.y+=Math.sin(f.a)*14*dt;f.z=cl(f.z+Math.sin(G.t*2+f.ph)*8*dt,4,50);if(f.x<0)f.x=WW;if(f.x>WW)f.x=0;if(f.y<0)f.y=WW;if(f.y>WW)f.y=0}
    for(const s of smokes){s.t-=dt;if(s.t<=0){s.t=.22;puffs.push({x:s.x+rr(-3,3),y:s.y+rr(-3,3),z:s.z,t:0,r:rr(4,6)})}}
    for(const p of puffs){p.t+=dt;p.z+=16*dt;p.x+=10*dt;p.r+=5*dt}for(let i=puffs.length-1;i>=0;i--)if(puffs[i].t>3.2)puffs.splice(i,1);
    if(Math.random()<dt*1.5)leaves.push({x:8.9*T+rr(-40,40),y:8.6*T+rr(-40,40),z:rr(70,90),t:0,ph:rnd()*6,c:['#a8562a','#c87a2a','#d0a040'][Math.floor(rnd()*3)]});
    for(const l of leaves){l.t+=dt;l.z-=14*dt;l.x+=Math.sin(l.t*3+l.ph)*20*dt+6*dt}for(let i=leaves.length-1;i>=0;i--)if(leaves[i].z<0)leaves.splice(i,1)}}
function drawFlame(f){const h0=houses[0];if(f.house&&h0.a>.9)return;const q=S(f.x,f.y,f.z),fl=.85+.15*Math.sin(G.t*11+f.x)*Math.sin(G.t*7.3+f.y);
  if(f.fire){for(let i=0;i<5;i++){const a=G.t*6+i*1.3,h=10+4*Math.sin(a),xx=q[0]+(i-2)*3.2;ctx.fillStyle=i%2?'#ffb040':'#ff7a20';ctx.beginPath();ctx.moveTo(xx-3,q[1]);ctx.quadraticCurveTo(xx-2,q[1]-h*.6,xx+Math.sin(a)*1.5,q[1]-h);ctx.quadraticCurveTo(xx+2,q[1]-h*.6,xx+3,q[1]);ctx.closePath();ctx.fill()}}
  else if(f.r<2){ctx.fillStyle='#fff2c0';ctx.beginPath();ctx.ellipse(q[0],q[1]-2,f.r*1.1,f.r*2.4*fl,0,0,TAU);ctx.fill()}
  if(LOWFX)return;ctx.save();ctx.globalCompositeOperation='lighter';glow(f.rgb,q[0],q[1]-2,(f.crypt?26:f.fire?28:f.pump?16*f.pump:f.glass?22:12)*fl,(f.crypt?.5+.2*Math.sin(G.t*1.4):f.pump?.7:.6)*fl);ctx.restore()}
function drawCrow(q,c){ctx.save();ctx.translate(q[0],q[1]);ink(1.6);ctx.fillStyle='#16151c';ctx.beginPath();ctx.ellipse(0,-5,5,4,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(-10,1);ctx.lineTo(-8,-3);ctx.closePath();ctx.fill();ctx.stroke();
  const d=Math.cos(c.face)>=0?1:-1,hx=3*Math.cos(c.face),hy=-10;ctx.beginPath();ctx.arc(hx,hy,3.2,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#d8b040';ctx.beginPath();ctx.moveTo(hx+2.6*d,hy-1);ctx.lineTo(hx+7*d,hy+.5);ctx.lineTo(hx+2.6*d,hy+1);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ff5040';ball([hx+1.2*d,hy-.8],.8);ctx.fill();ctx.strokeStyle='#d8b040';ctx.lineWidth=1;for(const sx of[-1.5,1.5]){ctx.beginPath();ctx.moveTo(sx,-1.5);ctx.lineTo(sx,1);ctx.stroke()}ctx.restore()}
function drawWorld(){const h0=houses[0];
  blit(sides);
  for(const[x,y,r] of[[4.4*T,7.6*T,14],[5.6*T,4.7*T,11],[4.3*T,5.5*T,9]]){const q=S(x,y,0);ctx.save();ctx.translate(q[0],q[1]);ctx.fillStyle='#141a28';ctx.beginPath();ctx.ellipse(0,0,r,r*K*.9,-.2,0,TAU);ctx.fill();ctx.strokeStyle='rgba(160,180,220,.3)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,r,r*K*.9,-.2,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
    if(!LOWFX){ctx.fillStyle=`rgba(255,200,120,${.3+.1*Math.sin(G.t*3+x)})`;ctx.beginPath();ctx.ellipse(r*.2,0,r*.35,r*K*.18,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(200,215,255,.25)';ctx.lineWidth=.8;const w=(G.t*.6+x)%1;ctx.beginPath();ctx.ellipse(-r*.2,0,r*.5*w,r*K*.4*w,0,0,TAU);ctx.stroke()}ctx.restore()}
  if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';for(const L of lights){if(L.house&&h0.a>.6)continue;const q=S(L.x,L.y,0),f=L.fl?(.9+.1*Math.sin(G.t*(L.fl===2?2:9)+L.x)*Math.sin(G.t*5.3+L.y)):1,a=L.a*(L.house?1-h0.a:1)*.8;glow(L.rgb,q[0],q[1],L.r*f,a*f,L.r*f*K)}ctx.restore()}
  const list=[];for(const t of things)list.push({k:t.k,t});for(const z of Z)list.push({k:Dp(z.x,z.y)+.01,z});list.push({k:Dp(hero.x,hero.y)+.01,hero:1});
  for(const c of crows)list.push({k:Dp(c.x,c.y)+2,crow:c});for(const f of flames)list.push({k:f.indoor?Dp(f.x,f.y)+3:Dp(f.x,f.y)+.6,fl:f});for(const m of mushrooms)list.push({k:Dp(m.x,m.y),mu:m});
  list.sort((a,b)=>a.k-b.k);
  for(const e of list){if(e.t){const t=e.t;if(t.house){if(t.part==='roof'){if(h0.a>.02)blit(t.sp,h0.a);continue}if(t.part==='front'){blit(t.sp,.22+.78*h0.a);continue}if(t.part==='in'&&h0.a>.95)continue}blit(t.sp);continue}
    if(e.hero){const q=S(hero.x,hero.y,0);drawRig(q[0],q[1]-8,hero.face,hero.walk,hero.moving,HSTYLE,{gp:gunState?gunState.pose():{},aim:hero.aim});continue}
    if(e.crow){drawCrow(S(e.crow.x,e.crow.y,e.crow.z),e.crow);continue}
    if(e.fl){drawFlame(e.fl);continue}
    if(e.mu){const m=e.mu,q=S(m.x,m.y,0);for(let i=0;i<3;i++){const p=[q[0]+(i-1)*4,q[1]+(i%2)*2];ctx.fillStyle='#c8d8b0';ctx.fillRect(p[0]-.8,p[1]-4,1.6,4);ctx.fillStyle='#7ae0c0';ink(1);ctx.beginPath();ctx.ellipse(p[0],p[1]-4,3,1.8,0,Math.PI,TAU);ctx.closePath();ctx.fill();ctx.stroke()}
      if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('120,255,210',q[0],q[1]-4,14,.35+.15*Math.sin(G.t*1.6+m.ph));ctx.restore()}continue}
    const z=e.z,q=S(z.x,z.y,0),face=z.face+PSI;
    if(z.rise<1){const k=z.rise;ctx.fillStyle=M.soil[0];ctx.beginPath();ctx.ellipse(q[0],q[1],18+k*8,7+k*3,0,0,TAU);ctx.fill();for(let i=0;i<6;i++){const a=i*1.05+z.x,r=10+k*16;ctx.fillStyle=M.soil[2];ball([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.45-Math.sin(k*Math.PI)*6],2.4);ctx.fill()}
      if(k>.25){const u=ez((k-.25)/.75);ctx.save();ctx.beginPath();ctx.rect(q[0]-60,q[1]-150,120,151);ctx.clip();ctx.translate(0,(1-u)*60*z.sc);CR[z.kind](q[0],q[1],face,'idle',(G.t*.6)%1,z.sc);ctx.restore()}continue}
    if(z.die){const k=Math.min(1,z.die/1.1);ctx.save();ctx.globalAlpha=1-k*k;ctx.beginPath();ctx.rect(q[0]-60,q[1]-150,120,151);ctx.clip();ctx.translate(0,ez(k)*50*z.sc);CR[z.kind](q[0],q[1],face,'idle',0,z.sc);ctx.restore();continue}
    CR[z.kind](q[0],q[1],face,z.anim,z.p,z.sc);if(z.flash>0){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,255,255',q[0],q[1]-24*z.sc,22*z.sc,.5);ctx.restore()}}
  if(!LOWFX){for(const p of puffs){const q=S(p.x,p.y,p.z);ctx.fillStyle=`rgba(150,150,165,${.28*(1-p.t/3.2)})`;ball(q,p.r);ctx.fill()}
    for(const l of leaves){const q=S(l.x,l.y,l.z);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(l.t*4+l.ph);ctx.fillStyle=l.c;ctx.beginPath();ctx.ellipse(0,0,2.6,1.2,0,0,TAU);ctx.fill();ctx.restore()}
    ctx.save();ctx.globalCompositeOperation='lighter';for(const f of flies){const q=S(f.x,f.y,f.z),b=.5+.5*Math.sin(G.t*3+f.ph);glow('170,255,120',q[0],q[1],9,.5*b);ctx.fillStyle=`rgba(230,255,190,${.9*b})`;ctx.fillRect(q[0]-.8,q[1]-.8,1.6,1.6)}ctx.restore()}
  for(const f of FX){if(f.k==='shot'){ctx.strokeStyle='rgba(255,230,160,.9)';ctx.lineWidth=2;seg(f.a,f.b);ctx.stroke();if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('255,210,120',f.a[0],f.a[1],14,.8);ctx.restore()}}else{ctx.fillStyle='#3a5a1e';ball([f.x,f.y],1.8);ctx.fill()}}}
let dark=null;
function drawDark(W0,H0,toScr0){if(LOWFX)return;const Q=3,W=Math.ceil(W0/Q),H=Math.ceil(H0/Q),toScr=(x,y,r)=>toScr0(x,y,r).map(v=>v/Q);if(!dark)dark=document.createElement('canvas');if(dark.width!==W||dark.height!==H){dark.width=W;dark.height=H}const g=dark.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.fillStyle='rgba(10,14,34,.4)';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='destination-out';const h0=houses[0],hole=(x,y,r,a)=>{const[sx,sy,sr0]=toScr(x,y,r),sr=Math.max(1,sr0||1);const gr=g.createRadialGradient(sx,sy,0,sx,sy,sr);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill()};
  for(const L of lights){if(L.house&&h0.a>.6)continue;const q=S(L.x,L.y,(L.z||0)*.5);hole(q[0],q[1],L.r*1.2,.85*(L.house?1-h0.a:1))}const hq=S(hero.x,hero.y,10);hole(hq[0],hq[1],120,.6);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(dark,0,0,W0,H0);ctx.restore()}
const mists=[];for(let i=0;i<9;i++)mists.push({x:rr(-100,WW+100),y:rr(0,WW),r:rr(80,160),v:rr(6,14)});
let mistImg=null;function drawMist(dt){if(LOWFX)return;if(!mistImg){mistImg=document.createElement('canvas');mistImg.width=mistImg.height=64;const g=mistImg.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(170,180,210,.10)');gr.addColorStop(1,'rgba(170,180,210,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)}
  for(const m of mists){m.x+=m.v*dt;if(m.x>WW+180)m.x=-180;const q=S(m.x,m.y,6);ctx.drawImage(mistImg,q[0]-m.r,q[1]-m.r*.4,m.r*2,m.r*.8)}}
function boot(){try{INTRO.on=false;paused=true}catch(e){}try{AU.on.music=false;AU.on.sfx=false}catch(e){}
  build();bakeGround();if(window.ARMI){try{gunState=ARMI.nuova('pistola')}catch(e){gunState=null}}
  const ov=document.createElement('div');ov.id='mz';ov.innerHTML=`<style>
  #mz{position:fixed;inset:0;z-index:99999;background:#0b0c12;font-family:"Baloo 2",system-ui,sans-serif;color:#efe6d0;touch-action:none;user-select:none;-webkit-user-select:none}
  #mz canvas{position:absolute;inset:0;width:100%;height:100%}
  #mz .top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;background:linear-gradient(rgba(8,8,12,.85),rgba(8,8,12,0));pointer-events:none}
  #mz h1{margin:0;font-family:"Lilita One",system-ui;font-weight:400;font-size:19px;letter-spacing:.02em;text-shadow:0 2px 0 #000}
  #mz .cash{font:800 14px "Baloo 2",system-ui;color:#ffd65a;text-shadow:0 2px 0 #000;white-space:nowrap}
  #mz .bar{position:absolute;left:0;right:0;bottom:0;padding:10px 10px calc(20px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap;gap:6px;justify-content:center;background:linear-gradient(rgba(8,8,12,0),rgba(8,8,12,.9))}
  #mz button{font:700 14px "Baloo 2",system-ui;color:#efe6d0;background:#33302e;border:2px solid #000;border-radius:12px;padding:8px 12px;box-shadow:0 3px 0 #000}
  #mz button.on{background:#4a6a2a;color:#eaffd0}#mz button:active{transform:translateY(2px);box-shadow:0 1px 0 #000}
  #mz .hint{position:absolute;left:0;right:0;bottom:100px;text-align:center;font-size:13px;opacity:.65;pointer-events:none}
  </style><canvas></canvas><div class="top"><h1>Angolo zombie · prova</h1><span class="cash" id="mzCash"></span></div>
  <div class="hint">Trascina per camminare · fermo spara</div><div class="bar" id="mzBar"></div>`;document.body.appendChild(ov);
  const cv=ov.querySelector('canvas'),barEl=ov.querySelector('#mzBar');let low=false,whole=false;
  const ui=()=>{barEl.innerHTML='';const mk=(t,on,f)=>{const b=document.createElement('button');b.textContent=t;b.className=on?'on':'';b.onclick=()=>{f();ui()};barEl.appendChild(b)};
    mk('Zombie',zOn,()=>{zOn=!zOn});mk('Effetti bassi',low,()=>{low=!low});mk('Vista intera',whole,()=>{whole=!whole})};ui();
  const stick={on:false,x0:0,y0:0,x:0,y:0};
  ov.addEventListener('pointerdown',e=>{if(e.target.closest('.bar'))return;stick.on=true;stick.x0=stick.x=e.clientX;stick.y0=stick.y=e.clientY});
  ov.addEventListener('pointermove',e=>{if(stick.on){stick.x=e.clientX;stick.y=e.clientY}});const up=()=>{stick.on=false};ov.addEventListener('pointerup',up);ov.addEventListener('pointercancel',up);
  const keys={};addEventListener('keydown',e=>keys[e.key]=1);addEventListener('keyup',e=>keys[e.key]=0);
  const dpr=Math.min(2,window.devicePixelRatio||1);let last=performance.now(),ms=0;const ctrW=S(WW/2,WW/2,0);
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const W=ov.clientWidth,H=ov.clientHeight;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);backdrop=null}
    if(!backdrop)bakeBackdrop(cv.width,cv.height);
    let ix=0,iy=0;if(stick.on){const dx=stick.x-stick.x0,dy=stick.y-stick.y0,l=Math.hypot(dx,dy);if(l>6){ix=dx/Math.max(l,50);iy=dy/Math.max(l,50)}}
    if(keys.ArrowLeft||keys.a)ix=-1;if(keys.ArrowRight||keys.d)ix=1;if(keys.ArrowUp||keys.w)iy=-1;if(keys.ArrowDown||keys.s)iy=1;
    const saved=ctx,lf=LOWFX;ctx=cv.getContext('2d');LOWFX=low;const t0=performance.now();
    try{update(dt,{x:ix,y:iy});
      const hq=S(hero.x,hero.y,0),z=whole?Math.min(W/(WW*1.2),H/(WW*.95)):W/330,tx=whole?ctrW[0]:hq[0],ty=whole?ctrW[1]+10:hq[1]-20;cam.z+=(z-cam.z)*Math.min(1,dt*8);cam.x+=(tx-cam.x)*Math.min(1,dt*6);cam.y+=(ty-cam.y)*Math.min(1,dt*6);
      ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(backdrop,0,0);
      ctx.setTransform(dpr*cam.z,0,0,dpr*cam.z,dpr*(W/2-cam.x*cam.z),dpr*(H/2-cam.y*cam.z));
      drawWorld();drawMist(dt);
      drawDark(cv.width,cv.height,(x,y,r)=>[dpr*(W/2+(x-cam.x)*cam.z),dpr*(H/2+(y-cam.y)*cam.z),r*cam.z*dpr]);
      ctx.setTransform(dpr,0,0,dpr,0,0);if(stick.on){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(stick.x0,stick.y0,42,0,TAU);ctx.stroke();const dx=stick.x-stick.x0,dy=stick.y-stick.y0,l=Math.min(42,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);ctx.fillStyle='rgba(255,255,255,.4)';ball([stick.x0+Math.cos(a)*l,stick.y0+Math.sin(a)*l],18);ctx.fill()}
      const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.4,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)
    }catch(e){console.error(e)}finally{ms=ms*.93+(performance.now()-t0)*.07;ctx=saved;LOWFX=lf}
    ov.querySelector('#mzCash').textContent='● '+coins.toLocaleString('it-IT')+'  ·  '+ms.toFixed(1)+' ms';requestAnimationFrame(frame)}
  requestAnimationFrame(frame);window.__MZ={hero,Z,houses,cam,setWhole:v=>{whole=v;ui()},tp:(x,y)=>{hero.x=x;hero.y=y},zombies:v=>{zOn=v;ui()}}}
if(document.readyState==='complete')setTimeout(boot,300);else window.addEventListener('load',()=>setTimeout(boot,300))})();
