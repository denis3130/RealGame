// I vestiti nuovi dell'eroe (punti 39 e 40 del piano di Denis, anteprima 47): non variazioni di colore ma vestiti con una personalità, fatti
// di pezzi veri sul corpo 3D dell'Arciere (sprite/eroe3d/disegno_eroe.js): toppe cucite, strappi con i fili, cuciture, cappucci con i
// lacci, mantelli che ondeggiano, code del frac, fusciacche, catene, stampe che brillano. Cinque scuri e strappati (più adatti alla modalità
// Zombie) e quattro swag; si usano in tutte e due le modalità. Ognuno dà al corpo i suoi colori (body, hood, belt), gli stivali (foot,
// foot2), i guanti (glove), la cinghia della faretra (strap), la fibbia (buckle) e disegna i suoi pezzi in quattro momenti: tunic (sulla
// tunica, sotto la cinghia e la cintura), over (sopra la cintura), parts (pezzi con la loro profondità: mantelli, code, nodi) e hood
// (sul cappuccio: 'back' dietro, 'in' sulla stoffa, 'front' davanti). Tutto segue la mossa (A.sway, p), così il vestito resta attaccato
// al corpo da fermo, mentre cammina, tira, scatta, viene colpito e seduto al falò. Lo stile li chiede con style.outfit = id.
(()=>{if(typeof EROE==='undefined'||!EROE.VESTITI)return;
const R=CR._rig,{TAU,cl,lerp,add,sub,mul,nrm,cross,ball,seg,shine}=R,{surf,surfLine,dk,lt,line,poly,sp,capPath,ZB}=EROE.kit;
const fr=(s,i)=>{const v=Math.sin(s*12.9898+i*78.233)*43758.5453;return v-Math.floor(v)};// a fixed «random» number from a seed
// a point of the tunic on the screen and how much it faces us
const at=(K,t,z,out)=>{const s=surf(t,z,out==null?.14:out);return[K.P(K.X.T(s.p)),K.F(K.X.Rd(s.n))]};
// a flat piece sewn on the tunic: corners [t, z]; it fades out softly as it turns away
function piece(K,pts,fill,o){o=o||{};const q=[];let vm=1;for(const[t,z] of pts){const[a,v]=at(K,t,z,o.out);q.push(a);vm=Math.min(vm,v)}if(vm<.05)return null;
  ctx.save();ctx.globalAlpha*=cl((vm-.05)*6,0,1);poly(q);ctx.fillStyle=fill;ctx.fill();if(o.lw){ctx.strokeStyle=o.ink||INK;ctx.lineWidth=o.lw;ctx.lineJoin='round';ctx.stroke()}
  if(o.stitch){ctx.setLineDash([.9,1.1]);ctx.strokeStyle=o.stitch;ctx.lineWidth=.6;const c=q.reduce((a,b)=>[a[0]+b[0]/q.length,a[1]+b[1]/q.length],[0,0]);poly(q.map(p=>[lerp(p[0],c[0],.2),lerp(p[1],c[1],.2)]));ctx.stroke();ctx.setLineDash([])}
  ctx.restore();return q}
// a square patch with its stitches all round
const patch=(K,t,z,w,h,col,th)=>piece(K,[[t-w,z-h],[t+w,z-h*.92],[t+w*.96,z+h],[t-w*1.04,z+h*1.05]],col,{lw:1,stitch:th||'rgba(240,226,190,.85)'});
// a tear: a ragged hole that shows the dark under it, with loose threads round the edge
function rip(K,t,z,w,h,seed,under,thread){const[c,v]=at(K,t,z);if(v<.12)return;const q=[];for(let i=0;i<10;i++){const a=i/10*TAU,k=.55+.45*fr(seed,i)*(i%2?1:.6);q.push(at(K,t+Math.cos(a)*w*k,z+Math.sin(a)*h*k)[0])}
  ctx.save();ctx.globalAlpha*=cl((v-.12)*5,0,1);poly(q);ctx.fillStyle=under;ctx.fill();ctx.strokeStyle='rgba(20,16,14,.75)';ctx.lineWidth=.8;ctx.lineJoin='miter';ctx.stroke();
  ctx.strokeStyle=thread;ctx.lineWidth=.55;ctx.lineCap='round';for(let i=0;i<q.length;i+=2){const p=q[i],d=[p[0]-c[0],p[1]-c[1]],l=Math.hypot(d[0],d[1])||1;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+d[0]/l*1.3+fr(seed,i+3)-.5,p[1]+d[1]/l*1.3+.4);ctx.stroke()}ctx.restore()}
// a short straight mark on the surface (two points only: fringes, ribs, threads), drawn where it faces us
function tick(K,t0,z0,t1,z1,col,w,out){const[a,v]=at(K,t0,z0,out),[b,v2]=at(K,t1,z1,out);if(Math.min(v,v2)<.05)return;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
// a cord on the surface (open line from t0,z0 to t1,z1)
const cord=(K,t0,z0,t1,z1,col,w,dash)=>surfLine(K.V0,K.X,k=>surf(lerp(t0,t1,k),lerp(z0,z1,k),.3),col,w,1,dash);
// a soft light on the tunic (the neon print, the runes)
function glowAt(K,t,z,rgb,r,a){if(LOWFX)return;const[q,v]=at(K,t,z);if(v>.1)shine(rgb,q[0],q[1],r,a*cl(v*2,0,1))}
// a hanging piece of cloth with its own depth: from two points on the body down to a hem that follows the sway
function flap(K,parts,top,len,w,col,o){o=o||{};const{V0,X,P,D,A}=K,sw=(A.sway||0),tt=K.X.T(top);
  parts.push({d:D(tt)+(o.dd||0),f:()=>{const dn=nrm(X.Rd([-.25-.08*sw*(o.k||1),.05*sw*(o.k||1),-1])),side=nrm(X.Rd(o.side||[0,1,0])),N=o.n||3,pts=[];
    const a=add(tt,mul(side,-w)),b=add(tt,mul(side,w));pts.push(P(a));
    for(let i=0;i<=N*2;i++){const k=i/(N*2),pos=add(lerp3(a,b,k),mul(dn,len*(i%2?.82:1)*(o.taper?1-.5*Math.abs(k-.5):1)));pts.push(P(pos))}
    pts.push(P(b));ink(1.8);poly(pts);let y0=1e9,y1=-1e9;for(const q of pts){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,lt(col,.12));g.addColorStop(1,dk(col,.3));ctx.fillStyle=g;ctx.fill();ctx.stroke();
    if(o.after)o.after(pts)}})}
const lerp3=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k)];
// on the hood: a point of the hood's ball (direction m in the head's own frame) and how much it faces us
const hAt=(H,m,r)=>{const n=H.nod(nrm(m));return[sp(H.Vh,H.h,H.Rh*(r||.99),n),H.F(n)]};
function hRip(H,m,w,seed,under,thread){const[c,v]=hAt(H,m);if(v<.15)return;const q=[];for(let i=0;i<9;i++){const a=i/9*TAU,k=.5+.5*fr(seed,i);q.push([c[0]+Math.cos(a)*w*k*(.5+.5*v),c[1]+Math.sin(a)*w*k*.8])}
  ctx.save();ctx.globalAlpha*=cl((v-.15)*5,0,1);poly(q);ctx.fillStyle=under;ctx.fill();ctx.strokeStyle='rgba(20,16,14,.7)';ctx.lineWidth=.7;ctx.stroke();ctx.strokeStyle=thread;ctx.lineWidth=.5;
  for(let i=0;i<q.length;i+=3){const p=q[i];ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[0]+(p[0]-c[0])*.35,p[1]+(p[1]-c[1])*.35+.4);ctx.stroke()}ctx.restore()}
// a ring round the hood (a band, the goggles' strap, a stripe): the circle of directions round an axis, only where it faces us
function hRing(H,ax,lat,col,w,dash){const a=nrm(ax);let u=cross(a,[0,1,0]);if(Math.hypot(...u)<.2)u=cross(a,[1,0,0]);u=nrm(u);const v=cross(a,u),c=Math.cos(lat),s=Math.sin(lat),runs=[];let cur=[];
  for(let i=0;i<=40;i++){const th=i/40*TAU,m=add(mul(a,s),add(mul(u,c*Math.cos(th)),mul(v,c*Math.sin(th)))),[q,f]=hAt(H,m,1.01);if(f>.02)cur.push(q);else if(cur.length){runs.push(cur);cur=[]}}if(cur.length)runs.push(cur);
  ctx.lineCap='round';if(dash)ctx.setLineDash(dash);for(const r of runs){if(r.length<2)continue;ctx.strokeStyle=INK;ctx.lineWidth=w+1.4;line(r);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=w;line(r);ctx.stroke()}if(dash)ctx.setLineDash([])}

const V=EROE.VESTITI;
// ---------------------------------------------------------------- SCURI E STRAPPATI
// LA GIACCA NERA STRACCIATA: pelle nera consumata sopra una felpa marrone (il cappuccio), la cerniera storta, due strappi con i fili, le
// spille da balia che li tengono, le borchie sulle spalle, la cintura con la fibbia d'acciaio
V.stracciato={n:'Giacca nera stracciata',rar:2,group:'scuro',body:'#34343c',hood:'#5a4636',belt:'#1a1a1e',foot:'#2a221c',foot2:'#1e1814',glove:'#2e2a2a',strap:'#4a3a2a',buckle:'#c8ccd2',noGiubba:true,
  tunic(K){const{V0,X}=K;
    // the leather: worn lighter on the edges of the front, two creases
    surfLine(V0,X,k=>surf(lerp(-.9,-.3,k),ZB+11.8-k*.6,.12),'rgba(120,120,135,.35)',.8,1);surfLine(V0,X,k=>surf(lerp(.4,1,k),ZB+8.6+k*.5,.12),'rgba(120,120,135,.3)',.8,1);
    // the jacket is open: the brown hoodie shows down the front, with the zip of the jacket on one edge
    piece(K,[[-.3,ZB+13.9],[.3,ZB+13.9],[.22,ZB+.9],[-.2,ZB+.9]],'#5a4636',{lw:1});tick(K,-.12,ZB+12.6,-.1,ZB+2,'rgba(40,28,20,.35)',.6);
    cord(K,.3,ZB+13.6,.24,ZB+1,'#a8acb4',.8,[1,.6]);
    // the leather shines on the shoulders
    surfLine(V0,X,k=>surf(lerp(-1.4,-.5,k),ZB+12.4-k*.8,.12),'rgba(150,150,170,.45)',1.1,1);
    rip(K,-.75,ZB+7.6,.2,1.7,3,'#4a3828','rgba(200,200,210,.85)');rip(K,1.9,ZB+9.4,.2,1.4,7,'#4a3828','rgba(200,200,210,.85)');rip(K,2.9,ZB+4.4,.25,1.3,11,'#4a3828','rgba(200,200,210,.85)');
    // the safety pins over the tears
    for(const[t,z] of[[-.75,ZB+7.9],[1.9,ZB+9.6]]){const[q,v]=at(K,t,z,.3);if(v>.2){ctx.strokeStyle='#d8dce2';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(q[0],q[1],1.6,.6,-.3,0,TAU);ctx.stroke();ctx.fillStyle='#e8ecf0';ball([q[0]+1.5,q[1]-.5],.45);ctx.fill()}}
    // the studs on the shoulders
    for(const sd of[-1,1])for(let i=0;i<4;i++){const[q,v]=at(K,sd*(.95+i*.22),ZB+12.6-i*.5,.3);if(v>.15){ctx.fillStyle='#d8dce2';ink(.5);ball(q,.55);ctx.fill();ctx.stroke()}}},
  hoodFx(H,ph){if(ph==='in'){hRip(H,[-.2,-.8,.5],2.2,5,'#2a1e18','rgba(210,190,160,.8)');
    // the hoodie's drawstring channel round the opening, a stitched seam
    hRing(H,[1,0,.27],.62,'rgba(60,46,36,.9)',.7,[1,1])}}};
// LA FELPA STRAPPATA: grigio antracite con le toppe nere, la tasca a marsupio davanti, i lacci del cappuccio coi puntali, il polsino a
// costine in fondo, strappi che mostrano la maglia rossa sotto
V.felpa={n:'Felpa strappata',rar:1,group:'scuro',body:'#3a3a44',hood:'#30303a',belt:null,foot:'#26262c',foot2:'#1c1c22',strap:'#2a2a30',noGiubba:true,
  tunic(K){const{V0,X}=K;
    // the ribbed band at the hem
    surfLine(V0,X,t=>surf(t,ZB+1.2,.16),'#2c2c34',2.2,0);for(let i=0;i<20;i++){const t=i/20*TAU;tick(K,t,ZB+.5,t,ZB+1.9,'rgba(20,20,26,.5)',.5,.2)}
    // the kangaroo pocket
    piece(K,[[-.7,ZB+2.6],[.7,ZB+2.6],[.55,ZB+5.4],[-.55,ZB+5.4]],'#34343e',{lw:.9});cord(K,-.58,ZB+5.2,-.72,ZB+2.8,'rgba(0,0,0,.35)',.8);cord(K,.58,ZB+5.2,.72,ZB+2.8,'rgba(0,0,0,.35)',.8);
    // the black patch on the side, the tears with the red shirt under them
    patch(K,-1.55,ZB+8.4,.28,1.5,'#1e1e24','rgba(150,150,160,.8)');
    rip(K,.55,ZB+9.2,.24,1.6,2,'#7a1e22','rgba(190,190,200,.85)');rip(K,-2.4,ZB+5.6,.2,1.2,9,'#7a1e22','rgba(190,190,200,.85)');rip(K,2.6,ZB+10.4,.22,1.3,13,'#7a1e22','rgba(190,190,200,.85)')},
  over(K){// the hood's drawstrings with their metal tips, swinging a little
    const sw=(K.A.sway||0)*.04;for(const sd of[-1,1]){const t0=sd*.2,t1=sd*.24+sw;cord(K,t0,ZB+13.2,t1,ZB+9.4,'#e8e8ee',.9);const[q,v]=at(K,t1,ZB+9.2,.3);if(v>.2){ctx.fillStyle='#b8bcc4';ink(.5);ctx.fillRect(q[0]-.45,q[1]-.3,.9,1.6);ctx.strokeRect(q[0]-.45,q[1]-.3,.9,1.6)}}},
  hoodFx(H,ph){if(ph==='in'){hRip(H,[-.45,.75,.45],2.4,4,'#7a1e22','rgba(190,190,200,.8)');hRip(H,[-.9,-.2,.4],1.6,8,'#7a1e22','rgba(190,190,200,.8)')}}};
// LA TENUTA DEL SOPRAVVISSUTO: giacca verde militare con le toppe cucite, la cartucciera a tracolla con le cartucce rosse, il fazzoletto al
// collo annodato dietro, gli occhialoni sulla fronte, guanti senza dita e scarponi
V.sopravvissuto={n:'Tenuta del Sopravvissuto',rar:2,group:'scuro',body:'#55603e',hood:'#46502f',belt:'#3a2c1c',foot:'#3a2c1e',foot2:'#2a2014',glove:'#4a3a2a',strap:'#3a3226',buckle:'#a8a090',noGiubba:true,
  tunic(K){const{V0,X}=K;
    // the pockets on the chest with their flaps, a darker patch on the belly, the frayed hem
    for(const sd of[-1,1]){piece(K,[[sd*.25,ZB+8.6],[sd*.8,ZB+8.6],[sd*.78,ZB+10.8],[sd*.27,ZB+10.8]],'#4c5636',{lw:.8});piece(K,[[sd*.23,ZB+10.4],[sd*.82,ZB+10.4],[sd*.8,ZB+11.4],[sd*.25,ZB+11.4]],'#5e6a44',{lw:.8})}
    patch(K,2.3,ZB+7,.3,1.6,'#6a5a3a');patch(K,-2.5,ZB+9.6,.24,1.2,'#3e4a2c');
    for(let i=0;i<18;i++){const t=i/18*TAU+.1;tick(K,t,ZB+.7,t+.04,ZB-.1-fr(4,i)*.7,'rgba(70,80,50,.9)',.8,.05)}},
  over(K){const{V0,X}=K;// the bandolier: from the right shoulder to the left hip, with the red shells in their loops
    const bt=k=>surf(lerp(.95,-2.3,k),lerp(ZB+12.4,ZB+4.6,k)+1.2*Math.sin(k*Math.PI),.45);surfLine(V0,X,bt,'#5a4430',2.4,1,null,true);
    for(let i=1;i<10;i++){const s=bt(i/10),v=K.F(K.X.Rd(s.n));if(v<.2)continue;const q=K.P(K.X.T(s.p));ctx.fillStyle='#b8322a';ink(.5);ctx.fillRect(q[0]-.7,q[1]-1.4,1.4,2.2);ctx.strokeRect(q[0]-.7,q[1]-1.4,1.4,2.2);ctx.fillStyle='#e0b050';ctx.fillRect(q[0]-.7,q[1]+.5,1.4,.6)}
    // the scarf round the neck
    surfLine(V0,X,t=>surf(t,ZB+13.1,.5),'#8a2a1e',2.4,0,null,true)},
  parts(K,parts){flap(K,parts,[-3.2,0,ZB+13.4],4.6,.9,'#8a2a1e',{n:2,k:1.4,taper:1,dd:-.2})},
  hoodFx(H,ph){if(ph==='in')hRing(H,[.32,0,1],.28,'#2a2a26',1.3);
    if(ph==='front'){// the goggles on the forehead: two round lenses on the strap, above the face
      for(const sd of[-1,1]){const[q,v]=hAt(H,[.62,sd*.34,.72],1.04);if(v<.15)continue;ctx.save();ctx.globalAlpha*=cl((v-.15)*5,0,1);ink(1);ctx.fillStyle='#6a5a40';ctx.beginPath();ctx.ellipse(q[0],q[1],2.5*(.5+.5*v),2.1,0,0,TAU);ctx.fill();ctx.stroke();
        ctx.fillStyle='#7ab0b8';ctx.beginPath();ctx.ellipse(q[0],q[1],1.6*(.5+.5*v),1.3,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ball([q[0]-.5,q[1]-.5],.45);ctx.fill();ctx.restore()}}}};
// IL MANTELLO LOGORO: un mantello lungo color ardesia, consumato e sfrangiato in fondo, con le toppe e i buchi, la mantellina sulle spalle
// e il fermaglio a teschio di corvo; l'orlo del cappuccio sfilacciato
V.mantello={n:'Mantello logoro',rar:3,group:'scuro',body:'#3e3c4a',hood:'#33313e',belt:'#4a3a2e',foot:'#2c2620',foot2:'#201c18',strap:'#2a2630',noGiubba:true,
  tunic(K){const{V0,X}=K;// the capelet: a band over the shoulders with a ragged lower edge
    const cl0=t=>ZB+10.6-.6*fr(2,Math.round(t*7))*(Math.abs(Math.cos(t))>.2?1:.5);
    surfLine(V0,X,t=>surf(t,ZB+12.2,.32),'#46434f',3.4,0);for(let i=0;i<18;i++){const t=i/18*TAU;tick(K,t,ZB+11.4,t+.05,cl0(t),'#46434f',1.6,.3)}
    surfLine(V0,X,t=>surf(t,ZB+13.3,.3),'rgba(20,18,24,.55)',.8,0)},
  over(K){// the crow-skull clasp at the throat
    const[q,v]=at(K,0,ZB+12.9,.6);if(v>.2){ctx.save();ctx.globalAlpha*=cl((v-.2)*4,0,1);ink(.9);ctx.fillStyle='#e8e0cc';ctx.beginPath();ctx.ellipse(q[0],q[1],1.9,1.5,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(q[0]-.6,q[1]+.9);ctx.lineTo(q[0],q[1]+3);ctx.lineTo(q[0]+.6,q[1]+.9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#1a1418';ball([q[0]-.7,q[1]-.1],.45);ctx.fill();ball([q[0]+.7,q[1]-.1],.45);ctx.fill();ctx.restore()}},
  parts(K,parts){const{V0,X,P,D,A}=K;
    parts.push({d:D(X.T([-14,0,ZB+4])),f:()=>{const sw=A.sway||0,top=[],bot=[],N=12;
      for(let i=0;i<=N;i++){const a=-1+2*i/N,t=Math.PI+a*1.75,ws=Math.sin(a*Math.PI*1.5+sw*2)*.8;top.push(P(X.T(surf(t,ZB+13-Math.abs(a)*1.4,.7).p)));
        const s=surf(t,ZB+.2,1.4+(1-Math.abs(a))*1.8+ws*.4).p,rag=(i%2?1:0)*1.4+fr(6,i)*1.6;bot.push(P(X.T([s[0]-sw*.8,s[1],s[2]-2.4+rag+ws*.4])))}
      const pts=top.concat(bot.reverse());ink(2.2);poly(pts);let y0=1e9,y1=-1e9;for(const q of pts){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
      const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#4e4a5c');g.addColorStop(.55,'#353240');g.addColorStop(1,'#24212c');ctx.fillStyle=g;ctx.fill();ctx.stroke();
      // a patch and two holes in the cloth, and the light along the folds
      const m=k=>[lerp(top[Math.round(k*N)][0],bot[N-Math.round(k*N)][0],.55),lerp(top[Math.round(k*N)][1],bot[N-Math.round(k*N)][1],.55)];
      {const c=m(.3);ctx.fillStyle='#4a4656';ink(.8);ctx.fillRect(c[0]-2,c[1]-2,4,4);ctx.strokeRect(c[0]-2,c[1]-2,4,4);ctx.setLineDash([.8,.9]);ctx.strokeStyle='rgba(220,210,190,.7)';ctx.lineWidth=.5;ctx.strokeRect(c[0]-1.4,c[1]-1.4,2.8,2.8);ctx.setLineDash([])}
      for(const k of[.62,.8]){const c=m(k);ctx.fillStyle='#16141a';ctx.beginPath();ctx.ellipse(c[0],c[1]+2,1.1,1.5,.3,0,TAU);ctx.fill()}
      ctx.strokeStyle='rgba(120,114,140,.35)';ctx.lineWidth=.8;for(const k of[.25,.5,.75]){const a=top[Math.round(k*N)],b=bot[N-Math.round(k*N)];ctx.beginPath();ctx.moveTo(a[0],a[1]+2);ctx.lineTo(lerp(a[0],b[0],.85),lerp(a[1],b[1],.85));ctx.stroke()}}})},
  hoodFx(H,ph){if(ph==='in'){// a darned tear and a patch on the hood
    hRip(H,[-.5,.7,.5],2,6,'#1a181f','rgba(200,195,210,.75)');const[q,v]=hAt(H,[-.6,-.6,.55]);if(v>.25){ctx.save();ctx.globalAlpha*=cl((v-.25)*4,0,1);ctx.fillStyle='#4a4656';ink(.8);ctx.fillRect(q[0]-1.8,q[1]-1.6,3.6,3.2);ctx.strokeRect(q[0]-1.8,q[1]-1.6,3.6,3.2);
      ctx.setLineDash([.8,.9]);ctx.strokeStyle='rgba(220,210,190,.7)';ctx.lineWidth=.5;ctx.strokeRect(q[0]-1.2,q[1]-1,2.4,2);ctx.setLineDash([]);ctx.restore()}}}};
// L'ABITO DEL BECCHINO: il frac nero con le code lunghe, il panciotto rosso scuro coi bottoni d'ottone, la catena dell'orologio, i guanti
// grigi e il cilindro con il nastro
V.becchino={n:'Abito del Becchino',rar:3,group:'scuro',body:'#1e1a1c',hood:'#2c2628',belt:null,foot:'#141012',foot2:'#0e0b0c',glove:'#8a8a92',strap:'#141012',noGiubba:true,
  tunic(K){// the waistcoat in a V, its brass buttons, the lapels of the coat
    piece(K,[[-.5,ZB+13.4],[.5,ZB+13.4],[.42,ZB+3.4],[0,ZB+2.4],[-.42,ZB+3.4]],'#5a1a22',{lw:.9});
    for(const z of[ZB+11.4,ZB+9,ZB+6.6,ZB+4.4]){const[q,v]=at(K,0,z,.3);if(v>.2){ctx.fillStyle='#d8a838';ink(.5);ball(q,.65);ctx.fill();ctx.stroke()}}
    for(const sd of[-1,1])piece(K,[[sd*.48,ZB+13.4],[sd*.85,ZB+13],[sd*.6,ZB+8.2],[sd*.44,ZB+8.6]],'#121012',{lw:.8})},
  over(K){// the watch chain from a button to the pocket
    const{V0,X}=K;surfLine(V0,X,k=>surf(lerp(0,.52,k),ZB+6.6-1.6*Math.sin(k*Math.PI),.4),'#e8c050',.7,1,[.8,.6]);const[q,v]=at(K,.52,ZB+6.6,.4);if(v>.2){ctx.fillStyle='#e8c050';ink(.5);ball(q,.8);ctx.fill();ctx.stroke()}},
  parts(K,parts){for(const sd of[-1,1])flap(K,parts,[-7.2,sd*3.4,ZB+5.4],7.6,2.3,'#1e1a1c',{n:1,k:1.1,side:[0,1,0],dd:-.4})},
  hoodFx(H,ph){if(ph!=='front')return;// the top hat: brim, crown and band, sitting a little back on the hood
    const up=H.nod(nrm([-.18,0,1])),c3=mul(up,H.Rh*.86),u0=nrm(cross(up,[0,1,0])),v0=cross(up,u0),ring=(r,h)=>{const q=[];for(let i=0;i<24;i++){const a=i/24*TAU;q.push(sp(H.Vh,H.h,1,add(add(c3,mul(up,h)),add(mul(u0,Math.cos(a)*r),mul(v0,Math.sin(a)*r)))))}return q},
      hull2=(A,B)=>{const all=A.concat(B);all.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],hi=[];for(const p of all){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(let i=all.length-1;i>=0;i--){const p=all[i];while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p)}return lo.slice(0,-1).concat(hi.slice(0,-1))};
    const brim=ring(H.Rh*.95,0),b0=ring(H.Rh*.55,.4),b1=ring(H.Rh*.6,H.Rh*1.05),top=ring(H.Rh*.6,H.Rh*1.05);
    ink(1.8);poly(brim);ctx.fillStyle='#1a1618';ctx.fill();ctx.stroke();
    const side=hull2(b0,b1);poly(side);let x0=1e9,x1=-1e9;for(const q of side){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0])}const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#3a3236');g.addColorStop(.45,'#221c1f');g.addColorStop(1,'#120e10');ctx.fillStyle=g;ctx.fill();ctx.stroke();
    const band=hull2(ring(H.Rh*.56,H.Rh*.18),ring(H.Rh*.57,H.Rh*.42));poly(band);ctx.fillStyle='#6a1a22';ctx.fill();ctx.lineWidth=.8;ctx.stroke();
    poly(top);ctx.fillStyle='#2a2427';ctx.fill();ink(1.6);ctx.stroke()}};
// ---------------------------------------------------------------- SWAG
// L'HOODIE NEON: nero con la grande foglia di muschio stampata che si accende verde, i lacci verdi, la riga neon sul polsino, le scarpe
// bianche; sul cappuccio il bordo luminoso intorno all'apertura e il simbolo sul lato
V.neon={n:'Hoodie Neon',rar:2,group:'swag',body:'#1e1e26',hood:'#18181f',belt:null,foot:'#eeeef2',foot2:'#c8c8d2',strap:'#2a2a34',noGiubba:true,
  tunic(K){const{V0,X}=K;surfLine(V0,X,t=>surf(t,ZB+1.2,.16),'#2a2a34',2.2,0);surfLine(V0,X,t=>surf(t,ZB+1.9,.18),'#7dff6a',.7,0);
    // the leaf print: an outline that glows, the midrib and veins
    const lf=(k,s)=>surf(lerp(-.42,.42,k),ZB+8.6+s*1.9*Math.sin(k*Math.PI)+k*.6,.2);
    glowAt(K,0,ZB+8.9,'125,255,106',9,.38);surfLine(V0,X,k=>lf(k,1),'#7dff6a',1,1);surfLine(V0,X,k=>lf(k,-1),'#7dff6a',1,1);surfLine(V0,X,k=>surf(lerp(-.42,.42,k),ZB+8.6+k*.6,.22),'#c8ffbc',.6,1);
    for(const k of[.3,.5,.7])surfLine(V0,X,j=>surf(lerp(-.42,.42,k)+j*.08,ZB+8.6+k*.6+j*1.3,.22),'rgba(200,255,188,.8)',.45,1)},
  over(K){const sw=(K.A.sway||0)*.04;for(const sd of[-1,1]){const t1=sd*.24+sw;cord(K,sd*.2,ZB+13.2,t1,ZB+9.8,'#7dff6a',.8);const[q,v]=at(K,t1,ZB+9.6,.3);if(v>.2){ctx.fillStyle='#e8ffe2';ball(q,.55);ctx.fill()}}},
  hoodFx(H,ph){if(ph==='in'){const[q,v]=hAt(H,[-.25,-.9,.3]);if(v>.2){ctx.save();ctx.globalAlpha*=cl((v-.2)*4,0,1);ctx.strokeStyle='#7dff6a';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(q[0]-1.6,q[1]+1);ctx.quadraticCurveTo(q[0],q[1]-2.6,q[0]+1.6,q[1]+1);ctx.quadraticCurveTo(q[0],q[1]+.2,q[0]-1.6,q[1]+1);ctx.stroke();ctx.restore()}}
    if(ph==='front'){const fd=H.nod([1,0,.27]),fv=H.F(nrm(fd));if(fv<.15)return;const c=capPath(H.Vh,H.h,H.Rh*1.0,fd,.86);if(c&&c.rim&&c.rim.length>1){ctx.save();ctx.globalAlpha*=cl((fv-.15)*4,0,1);if(!LOWFX){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(125,255,106,.22)';ctx.lineWidth=2;line(c.rim);if(c.full)ctx.closePath();ctx.stroke();ctx.globalCompositeOperation='source-over'}ctx.strokeStyle='#7dff6a';ctx.lineWidth=.75;ctx.lineCap='round';line(c.rim);if(c.full)ctx.closePath();ctx.stroke();ctx.restore()}}}};
// LA GIACCA VARSITY: bordeaux col cappuccio color panna, la grande M di ciniglia sul petto, i bottoni a pressione, le righe sul polsino
// a costine; scarpe bianche
V.varsity={n:'Giacca Varsity',rar:2,group:'swag',body:'#7a1e2e',hood:'#efe3c8',belt:null,foot:'#f2f2f4',foot2:'#cfcfd6',glove:null,strap:'#efe3c8',noGiubba:true,
  tunic(K){const{V0,X}=K;// the ribbed hem with two cream stripes, the snap buttons
    surfLine(V0,X,t=>surf(t,ZB+1.1,.16),'#5a1622',2.4,0);surfLine(V0,X,t=>surf(t,ZB+.7,.2),'#efe3c8',.6,0);surfLine(V0,X,t=>surf(t,ZB+1.6,.2),'#efe3c8',.6,0);
    surfLine(V0,X,t=>surf(t,ZB+13.4,.3),'#5a1622',1.6,0);surfLine(V0,X,t=>surf(t,ZB+13.1,.32),'#efe3c8',.5,0);
    for(const z of[ZB+11.6,ZB+9.4,ZB+7.2,ZB+5,ZB+2.8]){const[q,v]=at(K,.06,z,.3);if(v>.2){ctx.fillStyle='#efe3c8';ink(.5);ball(q,.6);ctx.fill();ctx.stroke()}}
    // the chenille M on the left of the chest: cream with a bordeaux and a cream edge
    const M=[[-.95,ZB+7.6],[-.9,ZB+10.4],[-.68,ZB+8.6],[-.46,ZB+10.4],[-.41,ZB+7.6]];
    for(const[w,c] of[[2.2,'#5a1622'],[1.4,'#efe3c8']])surfLine(V0,X,k=>{const n=M.length-1,i=Math.min(n-1,Math.floor(k*n)),u=k*n-i;return surf(lerp(M[i][0],M[i+1][0],u),lerp(M[i][1],M[i+1][1],u),.3)},c,w,1)},
  hoodFx(H,ph){if(ph==='in')hRing(H,[-.2,0,1],.0,'#7a1e2e',1.1)}};
// IL PIUMINO DELLE RUNE: un piumino viola con le trapuntature gonfie, le rune d'oro ricamate che si accendono piano, la catena d'oro con il
// ciondolo a runa di muschio; scarpe nere col bordo d'oro
V.rune={n:'Piumino delle Rune',rar:3,group:'swag',body:'#4e2c90',hood:'#3e2274',belt:null,foot:'#1c1824',foot2:'#141018',strap:'#2e1e4e',noGiubba:true,
  tunic(K){const{V0,X}=K;// the quilting: puffed bands, a darker seam and a light over each band
    for(let z=ZB+1.6;z<ZB+13.4;z+=2.3){surfLine(V0,X,t=>surf(t,z,.14),'rgba(24,10,50,.55)',.9,0);surfLine(V0,X,t=>surf(t,z+1.15,.2),'rgba(190,160,255,.22)',1.4,0)}
    // the runes: little golden marks that breathe
    const br=.55+.45*Math.sin(K.p*TAU);for(const[t,z,s] of[[-.75,ZB+9.4,1],[.9,ZB+5.2,2],[2.4,ZB+8.2,3],[-2.2,ZB+4.4,4],[3.3,ZB+10.6,5]]){const[q,v]=at(K,t,z,.3);if(v<.2)continue;
      glowAt(K,t,z,'255,210,90',4,.35*br);ctx.save();ctx.globalAlpha*=cl((v-.2)*4,0,1);ctx.strokeStyle='#ffd25a';ctx.lineWidth=.7;ctx.lineCap='round';ctx.beginPath();
      ctx.moveTo(q[0],q[1]-1.6);ctx.lineTo(q[0],q[1]+1.6);if(s%2){ctx.moveTo(q[0],q[1]-.6);ctx.lineTo(q[0]+1.1,q[1]-1.5)}else{ctx.moveTo(q[0]-1.1,q[1]+.4);ctx.lineTo(q[0]+1.1,q[1]-.6)}if(s>2){ctx.moveTo(q[0],q[1]+.5);ctx.lineTo(q[0]-1,q[1]+1.4)}ctx.stroke();ctx.restore()}},
  over(K){const{V0,X}=K;// the gold chain and the pendant
    surfLine(V0,X,k=>surf(lerp(-1.1,1.1,k),ZB+12.6-2.2*Math.sin(k*Math.PI),.55),'#f0c850',1,1,[1,.5],true);
    const[q,v]=at(K,0,ZB+10.2,.8);if(v>.2){glowAt(K,0,ZB+10.2,'125,255,106',6,.4);ctx.fillStyle='#f0c850';ink(.8);ctx.beginPath();ctx.moveTo(q[0],q[1]-2);ctx.lineTo(q[0]+1.6,q[1]);ctx.lineTo(q[0],q[1]+2.2);ctx.lineTo(q[0]-1.6,q[1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#7dff6a';ball(q,.7);ctx.fill()}},
  hoodFx(H,ph){if(ph==='in'){for(const lat of[.2,.55,.85])hRing(H,[-.15,0,1],lat,'rgba(30,12,60,.6)',.6);const[q,v]=hAt(H,[-.4,.7,.6]);if(v>.25){ctx.strokeStyle='#ffd25a';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q[0],q[1]-1.4);ctx.lineTo(q[0],q[1]+1.4);ctx.moveTo(q[0]-1,q[1]-.4);ctx.lineTo(q[0]+1,q[1]+.4);ctx.stroke()}}}};
// IL KIMONO DEL DRAGO: cremisi, il colletto incrociato bianco e oro, le nuvole d'oro ricamate, la fusciacca nera larga col nodo dietro e le
// due code che pendono; sandali di legno
V.drago={n:'Kimono del Drago',rar:4,group:'swag',body:'#a8222c',hood:'#7a1820',belt:'#1a1a20',foot:'#6a4426',foot2:'#4a2e18',strap:'#3a1a1a',buckle:'#e8c050',noGiubba:true,
  tunic(K){const{V0,X}=K;// the crossed collar: from the left shoulder down to the right of the belt (and the other under it)
    surfLine(V0,X,k=>surf(lerp(-.55,.45,k),lerp(ZB+13.6,ZB+6.4,k),.3),'#f4ead8',2.2,1,null,true);surfLine(V0,X,k=>surf(lerp(-.55,.45,k)+.1,lerp(ZB+13.6,ZB+6.4,k),.34),'#e8c050',.6,1);
    surfLine(V0,X,k=>surf(lerp(.55,.15,k),lerp(ZB+13.6,ZB+10.6,k),.26),'#f4ead8',2,1,null,true);
    // the golden clouds: little spirals with a tail
    for(const[t,z,s] of[[.9,ZB+10.4,1],[-1.2,ZB+3.4,-1],[2.2,ZB+11,1],[-2.6,ZB+8.6,-1],[3,ZB+3.6,1],[1.4,ZB+3,-1]]){const[q,v]=at(K,t,z,.3);if(v<.2)continue;ctx.save();ctx.globalAlpha*=cl((v-.2)*4,0,1);ctx.strokeStyle='#e8c050';ctx.lineWidth=.7;ctx.lineCap='round';ctx.beginPath();
      for(let i=0;i<=16;i++){const a=i/16*TAU*1.3,r=.3+i*.1;ctx.lineTo(q[0]+s*Math.cos(a)*r,q[1]+Math.sin(a)*r*.8)}ctx.lineTo(q[0]+s*3.6,q[1]+.8);ctx.stroke();ctx.restore()}},
  over(K){const{V0,X}=K;// the wide sash: a band wider than the belt, with the gold cord across it
    surfLine(V0,X,t=>surf(t,ZB+5.6,.42),'#1a1a20',4.6,0,null,true);surfLine(V0,X,t=>surf(t,ZB+5.6,.5),'#e8c050',.7,0)},
  parts(K,parts){const{X,P,D,A}=K,c3=X.T([-8.6,0,ZB+5.8]);// the knot behind and its two tails
    parts.push({d:D(c3)-.3,f:()=>{const q=P(c3);ink(1.6);ctx.fillStyle='#24242a';ctx.beginPath();ctx.ellipse(q[0]-2.4,q[1],2.4,1.6,-.3,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(q[0]+2.4,q[1],2.4,1.6,.3,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#1a1a20';ball(q,1.3);ctx.fill();ctx.stroke()}});
    for(const sd of[-1,1])flap(K,parts,[-8.4,sd*1.2,ZB+5.2],6.4,.8,'#1e1e24',{n:1,k:1.3,taper:1,dd:-.5})},
  hoodFx(H,ph){if(ph==='in'){const[q,v]=hAt(H,[-.3,.85,.4]);if(v>.25){ctx.strokeStyle='#e8c050';ctx.lineWidth=.7;ctx.beginPath();for(let i=0;i<=14;i++){const a=i/14*TAU*1.2,r=.3+i*.12;ctx.lineTo(q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8)}ctx.stroke()}}}};
})();
