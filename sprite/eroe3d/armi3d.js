// Armi in 3D per l'eroe 3D (prova, non ancora nel gioco): le otto armi della modalità zombie (rifatte dai profili di
// sprite/armi/disegno_armi.js, stessi pezzi, colori e misure), la balestra leggera e il bastone del Druida. Ogni arma è fatta di volumi
// veri (prismi estrusi, cilindri, sfere, aste) visti dalla stessa telecamera dell'eroe (CR._rig: V(face)), quindi gira a 360 gradi e da
// ogni lato mostra il pezzo giusto. Come le armi zombie: un solo contorno scuro intorno a tutta l'arma, poi i pezzi dipinti (facce in
// tre toni con la luce dall'alto a sinistra dello schermo, righe sottili dove i pezzi si toccano, viti, venature, zigrinature).
// Anche i quattro archi della Classica sono qui (modello 'arco': si piega con la corda, punte, impugnatura, spine, fiamme).
// Uso (dentro la funzione principale del gioco, dopo disegno_mostri.js):
//   ARMI3D.draw(id, V0, fr, st) disegna l'arma id con la telecamera V0; fr = {O (dove sta la mano sull'impugnatura, nella stanza),
//   X (avanti, lungo la canna), Y (su), Z (di lato), s (grandezza)}; st: lo stato delle parti che si muovono (slide, pump, spin, cyl,
//   hammer, loaded, feed, draw, bolt, glow, kind, col, pinch, nock); extra(K, punti) aggiunge altri pezzi prima di disegnare (le mani,
//   la vampa) così si mettono in ordine con quelli dell'arma. Restituisce i punti utili nella stanza: muzzle (bocca), eject (bossoli),
//   sup (l'altra mano), back. ARMI3D.frame(O, aim, up, s) fa fr da dove sta la mano, dove punta e dov'è il su.
window.ARMI3D=(()=>{
const R=CR._rig,{cam,TAU,cl,ez,lerp,add,sub,mul,len,nrm,dot,cross,lerp3,mix,ball,seg,shine,wa,fist}=R;
// colours of the materials: [dark side, colour, light] (the zombie guns' own, plus the woods of the crossbow and of the staff)
const MAT={acciaio:['#3c4550','#66727f','#a3b0bd'],brunito:['#222c39','#3e4f64','#6d84a0'],lucido:['#6f7a86','#a9b4bf','#e4ebf1'],
  nero:['#1f2226','#3b4047','#5f6670'],gomma:['#1d1a17','#36312b','#56504a'],legno:['#71401f','#a86833','#d99a58'],legnoR:['#6a2817','#a5482b','#d77a55'],
  oliva:['#46532a','#6c7f3c','#9db261'],ottone:['#9a6b1e','#d39a33','#f6cf6c'],rame:['#7d3a1c','#b8612f','#e48d58'],rosso:['#8a221b','#cf3b30','#f27566'],
  verde:['#1f5a2c','#33904a','#62c574'],giallo:['#a87d16','#e8b52a','#ffe07a'],teal:['#1a5a66','#2a8c9c','#5cc6d4'],arancio:['#9c4416','#e26a24','#ff9d55'],
  cera:['#b7a888','#e8dcbe','#fff6e2'],noce:['#4a2c17','#6b4a2a','#97693f'],corteccia:['#3b2817','#5c3f26','#86603c'],foglia:['#2f6a24','#4f9a3a','#8fd45e'],
  sfera:['#3fae5a','#9fff7a','#eaffd6'],corda:['#a8987a','#e6dcc2','#fffaee'],stoffa:['#2c5a1e','#4f8a34','#7fbf52'],ossidiana:['#120e18','#2a2236','#4c4060'],cristallo:['#1f8a76','#4fe0c0','#c8fff0']};
// a material: its name, or the three tones themselves; tones(c): dark, colour and light made from one colour (the bows, the cards' tints)
const TT=m=>Array.isArray(m)?m:(MAT[m]||MAT.acciaio),tones=c=>[mix(c,'#1b1612',.42),c,mix(c,'#fff6e0',.36)];
const LW=2.2,EDGE='rgba(27,22,18,.85)';
// ------------------------------------------------------------------ small helpers
const poly=q=>{ctx.beginPath();for(const p of q)ctx.lineTo(p[0],p[1]);ctx.closePath()},line=q=>{ctx.beginPath();for(const p of q)ctx.lineTo(p[0],p[1])};
function chull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const q of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  for(let i=pts.length-1;i>=0;i--){const q=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
  lo.pop();up.pop();return lo.concat(up)}
// a quadratic curve sampled in n points (2D or 3D)
const qpts=(a,c,b,n)=>{const o=[];for(let i=0;i<n;i++){const t=i/(n-1),u=1-t;o.push(a.map((v,j)=>u*u*v+2*u*t*c[j]+t*t*b[j]))}return o};
// a polygon with rounded corners (r: one radius or one per corner), and a rounded rectangle; counter-clockwise with y up
function rp(pts,r){const n=pts.length,o=[];for(let i=0;i<n;i++){const a=pts[(i+n-1)%n],c=pts[i],b=pts[(i+1)%n],rr=Array.isArray(r)?r[i]:r;
    if(!rr){o.push(c);continue}const la=Math.hypot(a[0]-c[0],a[1]-c[1])||1,lb=Math.hypot(b[0]-c[0],b[1]-c[1])||1,da=Math.min(rr,la*.45),db=Math.min(rr,lb*.45);
    const p=[c[0]+(a[0]-c[0])/la*da,c[1]+(a[1]-c[1])/la*da],q=[c[0]+(b[0]-c[0])/lb*db,c[1]+(b[1]-c[1])/lb*db];o.push(...qpts(p,c,q,3))}return o}
const rr=(x0,y0,x1,y1,r)=>rp([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],Math.min(r==null?.3:r,(x1-x0)/2,(y1-y0)/2));
function ccw(p){let a=0;for(let i=0;i<p.length;i++){const q=p[i],w=p[(i+1)%p.length];a+=q[0]*w[1]-w[0]*q[1]}return a<0?p.slice().reverse():p}
// the trigger guard of the zombie guns (their profile numbers: x0, x1, the y of the frame, how deep it dips) as a 3D line
function guardPts(x0,x1,y,dip){const a=qpts([x0,-y],[x0,-y-dip],[(x0+x1)/2,-y-dip],5),b=qpts([(x0+x1)/2,-y-dip],[x1+.2,-y-dip],[x1+.3,-y],5);return a.concat(b.slice(1)).map(p=>[p[0],p[1],0])}
// details painted on a face, in the face's own units (the canvas is turned to the face): grooves, screws, wood grain, checkering
const L2={line(x0,y0,x1,y1,col,w){ctx.strokeStyle=col||'rgba(20,14,10,.55)';ctx.lineWidth=w||.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke()},
  rect(x0,y0,x1,y1,col,r){ctx.fillStyle=col;ctx.beginPath();for(const p of rr(x0,y0,x1,y1,r||.2))ctx.lineTo(p[0],p[1]);ctx.closePath();ctx.fill()},
  dot(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()},
  screw(x,y,r,col){L2.dot(x,y,r+.28,INK);L2.dot(x,y,r,col||'#9aa6b2');L2.dot(x-r*.35,y+r*.35,r*.4,wa(1.4))},
  grain(x0,y0,x1,y1,n){ctx.strokeStyle='rgba(60,28,10,.38)';ctx.lineWidth=.32;for(let i=1;i<=n;i++){const y=lerp(y0,y1,i/(n+1));ctx.beginPath();for(let k=0;k<=6;k++){const x=lerp(x0,x1,k/6);ctx.lineTo(x,y+Math.sin(k*1.9+i*2.3)*.22)}ctx.stroke()}},
  checker(x0,y0,x1,y1,col){ctx.strokeStyle=col||'rgba(25,12,4,.45)';ctx.lineWidth=.3;for(let i=-4;i<=8;i++){const s=x0+i*.9;ctx.beginPath();ctx.moveTo(s,y0);ctx.lineTo(s+(y1-y0)*.5,y1);ctx.moveTo(s+(y1-y0)*.5,y0);ctx.lineTo(s,y1);ctx.stroke()}}};

// ------------------------------------------------------------------ the kit
// The weapon is built in its own frame: x along the barrel, y up, z to the side; fr = {O, X, Y, Z, s} puts it in the room. Every piece is
// a part {d (depth), out (dark silhouette with the thick outline), paint}; draw() sorts them and runs all the outlines, then all the
// paint, so the weapon gets one crisp outline round it and thin lines where its pieces meet.
function kit(V0,fr,parts){const{P,D,F}=V0,O=fr.O,X=fr.X,Y=fr.Y,Z=fr.Z,s=fr.s,LO=typeof LOWFX!=='undefined'&&LOWFX;parts=parts||[];
  const W=q=>[O[0]+(X[0]*q[0]+Y[0]*q[1]+Z[0]*q[2])*s,O[1]+(X[1]*q[0]+Y[1]*q[1]+Z[1]*q[2])*s,O[2]+(X[2]*q[0]+Y[2]*q[1]+Z[2]*q[2])*s];
  const Rd=n=>[X[0]*n[0]+Y[0]*n[1]+Z[0]*n[2],X[1]*n[0]+Y[1]*n[1]+Z[1]*n[2],X[2]*n[0]+Y[2]*n[1]+Z[2]*n[2]];
  // the light, fixed to the screen: from the upper left and a little from the camera
  const Rw=[V0.c,-V0.s,0],Tw=nrm([V0.s,V0.c,cam.k/cam.zk]),Lt=nrm(add(add(mul(Rw,-.5),[0,0,.85]),mul(Tw,.4))),lum=n=>dot(n,Lt);
  const tone=(m,l)=>{const T=TT(m);return l<0?mix(T[1],T[0],cl(-l*1.4,0,1)):mix(T[1],T[2],cl(l*.85,0,1))};
  const K={W,Rd,P,D,F,parts,s,V0,
    // a second frame inside this one (o: where, x and y: its axes, in this frame's units): its pieces go in the same list
    frame(o,x,y,ss){x=nrm(x);y=nrm(sub(y,mul(x,dot(y,x))));const z=cross(x,y);return kit(V0,{O:W(o),X:nrm(Rd(x)),Y:nrm(Rd(y)),Z:nrm(Rd(z)),s:s*(ss||1)},parts)},
    // a polygon in the x,y plane pushed out from z0 to z1. o: dk/lt/hi (dark lower part, light top band, warm light), col/colD/colL,
    // det(L2) details on the side that faces us, concave (outline made of every face instead of the hull), db (a nudge in the order)
    prism(pts,z0,z1,m,o){o=o||{};pts=ccw(pts);const n=pts.length,T=TT(m);
      const SA=pts.map(p=>P(W([p[0],p[1],z0]))),SB=pts.map(p=>P(W([p[0],p[1],z1])));
      let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
      const zc=(z0+z1)/2,nz=Rd([0,0,1]),fz=F(nz),walls=[];
      for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nw=Rd([dy/l,-dx/l,0]);if(F(nw)<=.002)continue;
        walls.push({q:[SA[i],SA[(i+1)%n],SB[(i+1)%n],SB[i]],d:D(W([(a[0]+b[0])/2,(a[1]+b[1])/2,zc])),c:tone(o.wm||m,lum(nw)*.9+(o.wl||0))})}
      walls.sort((a,b)=>a.d-b.d);
      const capS=fz>=0?SB:SA,capZ=fz>=0?z1:z0,capN=fz>=0?nz:mul(nz,-1);
      parts.push({d:D(W([(x0+x1)/2,(y0+y1)/2,zc]))+(o.db||0),
        out(){ctx.fillStyle=INK;ctx.strokeStyle=INK;ctx.lineWidth=LW;ctx.lineJoin='round';
          if(o.concave){poly(SA);ctx.fill();ctx.stroke();poly(SB);ctx.fill();ctx.stroke();for(const w of walls){poly(w.q);ctx.fill();ctx.stroke()}}
          else{poly(chull(SA.concat(SB)));ctx.fill();ctx.stroke()}},
        paint(){for(const w of walls){poly(w.q);ctx.fillStyle=w.c;ctx.fill();ctx.strokeStyle=w.c;ctx.lineWidth=.4;ctx.stroke()}
          if(Math.abs(fz)<.04)return;const Oq=P(W([0,0,capZ])),ax=P(W([1,0,capZ])),ay=P(W([0,1,capZ])),h=y1-y0,w=x1-x0;
          ctx.save();ctx.transform(ax[0]-Oq[0],ax[1]-Oq[1],ay[0]-Oq[0],ay[1]-Oq[1],Oq[0],Oq[1]);
          poly(pts);ctx.fillStyle=o.col||tone(m,lum(capN)*.5);ctx.fill();ctx.save();poly(pts);ctx.clip();
          ctx.globalAlpha=.85;ctx.fillStyle=o.colD||T[0];ctx.fillRect(x0-1,y0-1,w+2,h*(1-(o.dk==null?.6:o.dk))+1);ctx.globalAlpha=1;
          ctx.fillStyle=o.colL||T[2];ctx.fillRect(x0-1,y1-h*(o.lt==null?.22:o.lt),w+2,h+1);
          if(o.hi!==0){ctx.fillStyle=wa(o.hi==null?.6:o.hi);ctx.fillRect(x0-1,y1-Math.max(.4,h*.1)-.25,w+2,Math.max(.4,h*.1))}
          if(o.det&&!LO)o.det(L2,fz);ctx.restore();ctx.restore();
          poly(capS);ctx.strokeStyle=EDGE;ctx.lineWidth=.6;ctx.stroke()}});
      return K},
    box(x0,y0,x1,y1,z0,z1,m,o,r){return K.prism(rr(x0,y0,x1,y1,r),z0,z1,m,o)},
    // a tube from a to b (radius r, or r to o.r2: a cone); o.hole / o.holeA: the end at b / at a is open (a muzzle); o.det(t) for marks
    // on its surface (t: {v, w, u, A, B, ra, rb, at(k, an, out)} gives the room point at k along it, angle an round it)
    cyl(a,b,r,m,o){o=o||{};const A=W(a),B=W(b),u=nrm(sub(B,A));let t=cross(u,[0,0,1]);if(len(t)<.25)t=cross(u,[1,0,0]);const v=nrm(t),w=cross(u,v);
      const ra=r*s,rb=(o.r2==null?r:o.r2)*s,N=o.n||(LO?10:14),ca=[],cb=[],T=TT(m);
      for(let i=0;i<N;i++){const an=i/N*TAU,dd=add(mul(v,Math.cos(an)),mul(w,Math.sin(an)));ca.push(P(add(A,mul(dd,ra))));cb.push(P(add(B,mul(dd,rb))))}
      const H=chull(ca.concat(cb)),fu=F(u),PA=P(A),PB=P(B),at=(k,an,out)=>add(lerp3(A,B,k),mul(add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),lerp(ra,rb,k)+(out||0)*s));
      parts.push({d:D(lerp3(A,B,.5))+(o.db||0),
        out(){poly(H);ctx.fillStyle=INK;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=LW;ctx.lineJoin='round';ctx.stroke()},
        paint(){poly(H);ctx.fillStyle=o.col||T[1];ctx.fill();ctx.save();poly(H);ctx.clip();
          let ex=PB[0]-PA[0],ey=PB[1]-PA[1];const el=Math.hypot(ex,ey),R0=Math.max(ra,rb)*1.08;let g;
          if(el>R0*.5){ex/=el;ey/=el;let px=-ey,py=ex;if(px+py>0){px=-px;py=-py}const mx=(PA[0]+PB[0])/2,my=(PA[1]+PB[1])/2;
            g=ctx.createLinearGradient(mx+px*R0,my+py*R0,mx-px*R0,my-py*R0)}
          else{const c=fu>0?PB:PA;g=ctx.createRadialGradient(c[0]-R0*.4,c[1]-R0*.45,R0*.1,c[0],c[1],R0*1.3)}
          g.addColorStop(0,o.colL||T[2]);g.addColorStop(.36,o.col||T[1]);g.addColorStop(1,o.colD||T[0]);ctx.fillStyle=g;
          let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;for(const q of H){bx0=Math.min(bx0,q[0]);by0=Math.min(by0,q[1]);bx1=Math.max(bx1,q[0]);by1=Math.max(by1,q[1])}
          ctx.fillRect(bx0-1,by0-1,bx1-bx0+2,by1-by0+2);
          if(o.det&&!LO)o.det({v,w,u,A,B,ra,rb,at,P,F});ctx.restore();
          if(Math.abs(fu)>.03){const cap=fu>0?cb:ca,cn=fu>0?u:mul(u,-1);poly(cap);ctx.fillStyle=o.capCol||tone(m,lum(cn)*.6+.15);ctx.fill();ctx.strokeStyle=EDGE;ctx.lineWidth=.6;ctx.stroke();
            if((fu>0&&o.hole)||(fu<0&&o.holeA)){const c=fu>0?PB:PA,k=o.holeK||.55;ctx.beginPath();for(const q of cap)ctx.lineTo(c[0]+(q[0]-c[0])*k,c[1]+(q[1]-c[1])*k);ctx.closePath();ctx.fillStyle='#121417';ctx.fill()}
            if(o.capDet)o.capDet(fu>0?PB:PA,fu>0?b:a)}}});
      return K},
    sph(c,r,m,o){o=o||{};const p=W(c),q=P(p),R=r*s,T=TT(m);
      parts.push({d:D(p)+(o.db||0),out(){ball(q,R);ctx.fillStyle=INK;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=LW;ctx.stroke()},
        paint(){ball(q,R);const g=ctx.createRadialGradient(q[0]-R*.35,q[1]-R*.4,R*.1,q[0],q[1],R);g.addColorStop(0,o.colL||T[2]);g.addColorStop(.5,o.col||T[1]);g.addColorStop(1,o.colD||T[0]);ctx.fillStyle=g;ctx.fill()}});
      return K},
    // a thin rod along the points (wire, string, the trigger guard), w its thickness
    rod(pts,w,m,o){o=o||{};const S=pts.map(p=>P(W(p))),T=TT(m),ww=w*s,c=[0,0,0];for(const p of pts)for(let j=0;j<3;j++)c[j]+=p[j]/pts.length;
      parts.push({d:D(W(c))+(o.db||0),out(){if(o.noOut)return;line(S);ctx.strokeStyle=INK;ctx.lineWidth=ww+LW;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()},
        paint(){line(S);ctx.lineCap='round';ctx.lineJoin='round';if(!o.noOut&&!o.noEdge){ctx.strokeStyle=EDGE;ctx.lineWidth=ww+.9;ctx.stroke()}ctx.strokeStyle=o.col||T[1];ctx.lineWidth=ww;ctx.stroke();
          if(ww>.8&&o.hi!==0&&!LO){ctx.save();ctx.translate(-ww*.16,-ww*.2);line(S);ctx.strokeStyle=o.colL||T[2];ctx.lineWidth=ww*.32;ctx.stroke();ctx.restore()}}});
      return K},
    // a bent tube through the points with its own thickness at each (a bow's stave, a branch): thick outline, colour, the dark side
    // toward the lower right and a light line toward the upper left
    tube(pts,ws,m,o){o=o||{};const S=pts.map(p=>P(W(p))),T=TT(m),w=ws.map(v=>v*s),c=[0,0,0],n=pts.length;for(const p of pts)for(let j=0;j<3;j++)c[j]+=p[j]/n;
      const segs=f=>{for(let i=0;i<n-1;i++)f(S[i],S[i+1],(w[i]+w[i+1])/2)};
      parts.push({d:D(W(c))+(o.db||0),out(){ctx.strokeStyle=INK;ctx.lineCap='round';segs((a,b,ww)=>{ctx.lineWidth=ww+LW;seg(a,b);ctx.stroke()})},
        paint(){ctx.lineCap='round';ctx.strokeStyle=EDGE;segs((a,b,ww)=>{ctx.lineWidth=ww+.8;seg(a,b);ctx.stroke()});ctx.strokeStyle=o.col||T[1];segs((a,b,ww)=>{ctx.lineWidth=ww;seg(a,b);ctx.stroke()});
          if(LO)return;ctx.strokeStyle=o.colD||T[0];segs((a,b,ww)=>{if(ww<1.1)return;ctx.lineWidth=ww*.38;seg([a[0]+ww*.2,a[1]+ww*.24],[b[0]+ww*.2,b[1]+ww*.24]);ctx.stroke()});
          if(o.hi!==0){ctx.strokeStyle=o.colL||T[2];segs((a,b,ww)=>{if(ww<1.1)return;ctx.lineWidth=ww*.3;seg([a[0]-ww*.16,a[1]-ww*.22],[b[0]-ww*.16,b[1]-ww*.22]);ctx.stroke()})}}});
      return K},
    // a hand (the hero's round fist, r in game pixels) holding the weapon at c: it sorts with the weapon's pieces; db: a nudge toward us
    hand(c,r,col,db,ring){const p=W(c);parts.push({d:D(p)+(db==null?1.2:db),out(){},paint(){fist(V0,p,r,col);if(ring)ring(p)}});return K},
    // a flat round mark on a face (the holes of the machine gun's barrels, the lens of a sight), only from the side it faces
    disc(c,n,r,col,o){o=o||{};const p=W(c),nw=nrm(Rd(n));if(F(nw)<=.02)return K;let t=cross(nw,[0,0,1]);if(len(t)<.25)t=cross(nw,[1,0,0]);const v=nrm(t),w=cross(nw,v),pts=[];
      for(let i=0;i<14;i++){const an=i/14*TAU;pts.push(P(add(p,mul(add(mul(v,Math.cos(an)),mul(w,Math.sin(an))),r*s))))}
      parts.push({d:D(p)+(o.db||.05),out(){},paint(){poly(pts);ctx.fillStyle=col;ctx.fill();if(o.edge){ctx.strokeStyle=EDGE;ctx.lineWidth=.5;ctx.stroke()}}});return K},
    // something painted only (a glow, a flame), at the depth of point c
    fx(c,f,db){const p=W(c);parts.push({d:D(p)+(db||0),out(){},paint(){f(P(p))}});return K},
    draw(){parts.sort((a,b)=>a.d-b.d);for(const q of parts)q.out();for(const q of parts)q.paint()},
    // a point of this frame in the room, and a room point in this frame (for a hand that holds the string)
    loc:p=>{const d=sub(p,O);return[dot(d,X)/s,dot(d,Y)/s,dot(d,Z)/s]}};
  return K}

// ------------------------------------------------------------------ the guns of the zombie mode
// The same pieces as the profiles in sprite/armi/disegno_armi.js (their numbers, with y turned upward), now with a thickness: the hand
// on the grip is at 0,0,0. Each returns its key points: muzzle, eject (where the cases fly out), sup (the other hand, or null), back
// (the rocket's back-blast). st: slide 0..1 (slide or bolt back), pump 0..1, spin (barrels' turn), cyl (cylinder turn), hammer 0..1,
// loaded 0..1 (the rocket), feed (the belt), glow
// The reload (Denis, 14 ottobre: «miglioriamo le animazioni delle pistole, cioè la ricarica»): the magazine (the box of the machine gun,
// the drum, the fuel tank, the clip of bolts, the crystal) is a piece of its own. It slides out of its well along dir by st.mag (0 seated ..
// 1 free, len units), then goes where the hand carries it (st.magAt, added); st.magOff: there is none in the gun (the old one fell, the
// hand is fetching a new one). draw(k, b) draws it in its own frame k; b goes from -1 (seated) to 0 (out of the well, or in the hand): a
// nudge back in the order so the gun covers the part still in its well. The gun returns magSeat (where the hand holds the seated magazine), magDir, magLen and rack (the slide,
// the bolt or the handle the hand pulls, where it is now), so the hero's hand can follow them.
function magPart(K,st,dir,len,grab,draw){if(st.magOff)return null;const m=st.mag||0,a=st.magAt,o=[dir[0]*len*m+(a?a[0]:0),dir[1]*len*m+(a?a[1]:0),dir[2]*len*m+(a?a[2]:0)],mv=m>0||!!a;
  draw(mv?K.frame(o,[1,0,0],[0,1,0]):K,a?0:-(1-m));return add(grab,o)}
// the shell the hand pushes into a shotgun's loading port: st.shellAt where its brass base is (it points forward, nose first), st.shellIn
// 0..1 how much of it is already inside (only the rest is drawn)
// (a little bigger than true, like the toys of the game, so it shows in the hand)
function shellPart(K,st,col){const b=st.shellAt;if(!b)return;const L=5.2*(1-cl(st.shellIn||0,0,1));if(L<.2)return;
  K.cyl(b,[b[0]+Math.min(1.4,L),b[1],b[2]],1.22,'ottone',{db:.3,hi:0});if(L>1.4)K.cyl([b[0]+1.4,b[1],b[2]],[b[0]+L,b[1],b[2]],1.14,col,{db:.3})}
const PMD=nrm([.9,-5.8,0]),DN=[0,-1,0],magKeys=(o,dir,len,grab)=>Object.assign(o,{magSeat:grab,magDir:nrm(dir),magLen:len});
const M={
  pistola(K,st){const sl=-(st.slide||0)*2.6;
    // the magazine in the grip (raked like it): only its base plate shows under the grip when it is in
    const mg=magPart(K,st,PMD,6.4,[.1,-7.2,-.8],(k,b)=>{k.prism([[-2.5,1],[.4,1],[1.24,-4.4],[-1.66,-4.4]],-.8,.8,'brunito',{hi:.35,db:2*b});
      k.box(-2.05,-5.5,1.6,-4.3,-1.12,1.12,'nero',{col:'#4a5058',hi:.2,db:.4*b},.4)});
    K.prism(rp([[-3.3,1.6],[.9,1.6],[1.8,-4.2],[1.5,-4.9],[-2.3,-5.2],[-2.8,-4.6]],.6),-1.25,1.25,'legno',{dk:.66,det:L=>{L.checker(-3,-3.8,1.6,.6);L.screw(-.7,-1.7,.5,'#e8b52a')}});
    K.rod(guardPts(1.1,4.6,-1.2,2.6),.75,'nero');K.rod([[2.6,1.1,0],[3.2,.1,0],[2.7,-.7,0]],.42,'nero',{db:.02});
    K.box(-3.1,1.1,8.6,2.7,-1.05,1.05,'nero',{hi:.3},.5);
    K.cyl([7.9,3.75,0],[9.75,3.75,0],.78,'brunito',{hole:1});
    K.box(-3.9+sl,2.5,9.4+sl,5.3,-1.2,1.2,'acciaio',{det:L=>{for(const x of[-3.1,-2.4,-1.7])L.line(x+sl,3,x+sl,4.9,'rgba(20,24,30,.6)',.35);L.rect(2.6+sl,4.25,5+sl,5.15,'#14171b',.25)}},.9);
    K.box(8.2+sl,5.1,9+sl,5.85,-.4,.4,'nero',{hi:0},.2);K.box(-3.4+sl,5.1,-2.3+sl,5.85,-.75,.75,'nero',{hi:0},.2);
    K.disc([8.6+sl,5.5,.42],[0,0,1],.22,'#ffe07a');K.disc([8.6+sl,5.5,-.42],[0,0,-1],.22,'#ffe07a');
    return magKeys({muzzle:[9.9,3.75,0],eject:[3.8,5.3,1.2],sup:null,mag:mg,rack:[-2.6+sl,4.4,-1.7],rackDir:[-1,0,0]},PMD,6.4,[.1,-7.2,-.8])},
  revolver(K,st){const hm=st.hammer==null?1:st.hammer,cy=st.cyl||0;
    K.prism(rp([[-2.6,1.6],[.8,1.6],...qpts([1.05,-.5],[1.3,-2.6],[.3,-4.6],4),[-2.5,-4.9],...qpts([-3.3,-4.7],[-4.2,-4.4],[-3.9,-2.6],4),[-3.4,-.2]],.4),-1.3,1.3,'legnoR',{dk:.62,
      det:L=>{L.grain(-3.8,-4.4,1,1,3);L.screw(-1.5,-1.7,.7,'#e8b52a')}});
    K.rod(guardPts(.8,4.4,-1.2,2.2),.75,'lucido');K.rod([[2.2,1.1,0],[2.8,.1,0],[2.3,-.6,0]],.42,'lucido',{db:.02});
    {const a=-hm*.55,c=Math.cos(a),sn=Math.sin(a),T=p=>[-2.4+p[0]*c-(-p[1])*sn,4.3-(p[0]*sn+(-p[1])*c)];K.prism(rp([[.5,.3],[-.9,-2.5],[-2.3,-2.1],[-1.2,.7]].map(T),.3),-.45,.45,'brunito',{hi:.3})}
    // the frame: solid with the cylinder in; with the cylinder swung out the window where it sits shows (the shield at the back, the top
    // strap, the bottom, the front post, dark inside)
    const sw=cl(st.swing||0,0,1),ej=st.eject||0,nr=st.rounds==null?6:st.rounds;
    if(sw<.02)K.prism(rp([[-3.4,4.1],[-2.3,5.4],[4.8,5.4],[4.8,1.4],[-3,1.4]],.5),-1.2,1.2,'lucido',{det:L=>L.screw(.5,2.3,.4,'#cfd6de')});
    else{K.prism(rp([[-3.4,4.1],[-2.3,5.4],[-1.25,5.4],[-1.25,1.4],[-3,1.4]],[.5,.5,0,0,.5]),-1.2,1.2,'lucido',{det:L=>L.screw(-2.3,2.3,.4,'#cfd6de')});
      K.box(-1.4,4.95,4.8,5.4,-1.2,1.2,'lucido',{hi:.4},.15);K.box(-1.4,1.4,4.8,1.9,-1.2,1.2,'lucido',{hi:.2},.15);K.box(4.25,1.4,4.8,5.4,-1.2,1.2,'lucido',{hi:.3},.15);
      K.box(-1.25,1.9,4.25,4.95,-.35,.35,['#0e1013','#1a1d22','#2a2f36'],{hi:0,db:-.4},.1)}
    K.cyl([4.5,4.15,0],[15.5,4.15,0],1.02,'lucido',{hole:1,holeK:.42});
    K.prism([[14.1,5.1],[14.6,6.3],[15.15,6.3],[15.15,5.1]],-.3,.3,'rosso',{hi:0});
    // the crane: the cylinder and its ejector rod swing out to the left (-z) round a pivot under the frame (st.swing 0..1: 100 degrees);
    // C is their frame, the cylinder's axis at y=ax[0], z=ax[1] in it
    const PV=[0,1.6,-1.3],ph=-sw*1.75,k2=sw>.002?K.frame(PV,[1,0,0],[0,Math.cos(ph),Math.sin(ph)]):null,C=k2||K,ax=k2?[2.05,1.3]:[3.65,0],
      ch=(i,x)=>{const an=i/6*TAU+cy*TAU;return[x,ax[0]+Math.cos(an)*1.2,ax[1]+Math.sin(an)*1.2]},PT=q=>k2?K.loc(k2.W(q)):q;
    C.cyl([4.8-ej*2.6,ax[0]-.87,ax[1]],[10.6-ej*2.6,ax[0]-.87,ax[1]],.48,'lucido');if(k2)C.rod([[4.5,.05,0],[4.5,ax[0]-.7,ax[1]*.8]],.9,'lucido',{db:-.05});
    // the cylinder: six chambers seen from the back (brass and the primer where a round is in, when it is open), three flutes that turn
    // with each shot
    C.cyl([-1.25,ax[0],ax[1]],[4.25,ax[0],ax[1]],2.05,'lucido',{db:.05,det:t=>{for(let i=0;i<3;i++){const an=(cy+i/3)*TAU;const n=add(mul(t.v,Math.cos(an)),mul(t.w,Math.sin(an)));if(t.F(n)<.15)continue;
        const p0=t.P(t.at(.12,an,.02)),p1=t.P(t.at(.88,an,.02));ctx.strokeStyle='rgba(30,36,44,.6)';ctx.lineWidth=.9;ctx.lineCap='round';seg(p0,p1);ctx.stroke()}},
      capDet:(c,e)=>{if(e[0]>0)return;for(let i=0;i<6;i++){const q=C.P(C.W(ch(i,e[0])));ctx.fillStyle='#16191d';ball(q,.62*K.s);ctx.fill();
        if(sw>.3&&i<nr&&ej<=0){ctx.fillStyle=MAT.ottone[1];ball(q,.5*K.s);ctx.fill();ctx.fillStyle=MAT.ottone[2];ball([q[0]-.12*K.s,q[1]-.12*K.s],.2*K.s);ctx.fill()}}}});
    // the six spent cases pushed out at the back by the ejector (st.eject 0..1), the round the hand is pushing in (st.roundIn 0..1, into
    // chamber nr)
    if(ej>.02)for(let i=0;i<6;i++){const a=ch(i,-1.25-ej*2.6),b=ch(i,-1.15);C.cyl(a,b,.52,'ottone',{db:.07,hi:0})}
    if(st.roundIn!=null&&nr<6){const x0=-1.25-(1-st.roundIn)*3.2-.5,a=ch(nr,x0),b=ch(nr,Math.min(x0+2.5,-1.15));C.cyl(a,b,.52,'ottone',{db:.08});
      if(x0+2.5<-1.2)C.sph(ch(nr,x0+2.6),.48,'rame',{db:.08})}
    return{muzzle:[15.7,4.15,0],eject:null,sup:null,cylSide:PT([1.6,ax[0],ax[1]-2.9]),rod:PT([12.2-ej*2.6,ax[0]-.87,ax[1]]),chs:[0,1,2,3,4,5].map(i=>PT(ch(i,-1.25)))}},
  mitraglietta(K,st){const bo=-(st.slide||0)*2;
    for(const z of[-.9,.9])K.rod([[-4.4,5,z],[-9.4,5.2,z],[-9.8,1.8,z],[-4.4,2.3,z]],.85,'teal');
    K.box(-10.6,1.1,-9.1,5.9,-1.4,1.4,'teal',{hi:.4},.5);
    const UMD=nrm([.3,-7,0]),mg=magPart(K,st,UMD,6.8,[-1.15,-8.9,-.8],(k,b)=>{k.prism(rp([[-2.4,1.8],[.6,1.8],[.25,-6.6],[-2.75,-6.6]],.4),-.9,.9,'nero',{dk:.75,hi:.25,db:1.5*b});
      k.box(-3.15,-7.2,.65,-6.2,-1.1,1.1,'nero',{col:'#4a5058',db:.2*b},.4)});
    K.box(-2.7,-2.3,.85,1.9,-1.15,1.15,'teal',{},.6);
    K.rod(guardPts(.9,4.2,-1.6,1.9),.75,'nero');K.rod([[2.2,1.5,0],[2.8,.5,0],[2.3,-.3,0]],.42,'nero',{db:.02});
    K.box(6,-2.2,7.8,2,-1,1,'gomma',{hi:.3,det:L=>L.line(6.1,-.3,7.7,-.3,'#2a8c9c',.45)},.6);
    K.box(-4.7,1.7,8.9,6.3,-1.3,1.3,'nero',{hi:.45,det:L=>{L.rect(2.6,5.05,4.9,5.95,'#121417',.25);L.screw(-2.9,3.6,.35,'#7f8a96');L.screw(5.9,3.6,.35,'#7f8a96')}},1.1);
    K.box(-3.8,2.55,6.9,4.7,-1.38,1.38,'teal',{dk:.62,db:.03},.5);
    K.box(1.2+bo,6.15,2.9+bo,7.3,-.5,.5,'nero',{hi:.4},.4);
    K.cyl([8.7,3.9,0],[11.4,3.9,0],.9,'acciaio');K.cyl([10.8,3.9,0],[12.3,3.9,0],1.35,'nero',{hole:1,holeK:.45});
    return magKeys({muzzle:[12.4,3.9,0],eject:[3.8,6.2,1.3],sup:[6.9,-.6,0],mag:mg,rack:[2.05+bo,8.6,-1.1],rackDir:[-1,0,0]},UMD,6.8,[-1.15,-8.9,-.8])},
  mitra(K,st){const bo=-(st.slide||0)*2.2;
    K.prism(rp([[-4,5.2],[-11.8,4.6],[-12.6,3.9],[-12.6,-.6],[-11.9,-1.25],[-4,1.6]],[.3,.5,.6,.6,.5,.3]),-1.1,1.1,'legno',{dk:.62,det:L=>L.grain(-12.4,0,-4,4.6,4)});
    K.box(-13.3,-1.45,-12.3,4.9,-1.15,1.15,'gomma',{hi:.2},.4);
    K.prism(rp([[-3,1.7],[-.4,1.7],[.8,-3.8],[-1.8,-4.2]],.5),-1,1,'legno',{dk:.66});
    K.rod(guardPts(-.6,2.1,-1.5,1.6),.75,'nero');K.rod([[.5,1.4,0],[1,.5,0],[.6,-.2,0]],.42,'nero',{db:.02});
    const RMD=nrm([1.2,-8,0]),mg=magPart(K,st,RMD,6.6,[7.6,-8.3,-.8],(k,b)=>k.prism(rp([[2.4,1.7],[5.6,1.7],...qpts([5.75,.6],[6.2,-2.4],[8.6,-6],4),[6,-7],...qpts([5.2,-5.6],[3.6,-3.2],[2.6,.6],4)],.4),-.9,.9,'rame',{dk:.7,concave:1,db:.8*b,
      det:L=>{for(const k of[.35,.65])L.line(lerp(2.4,6,k)+.3,-lerp(-1.7,7,k)*.95,lerp(5.6,8.6,k),-lerp(-1.7,6,k),'rgba(60,20,6,.55)',.4)}}));
    K.box(-4.2,1.6,8.1,5.6,-1.2,1.2,'brunito',{det:L=>{L.rect(2.4,4.1,5.2,4.95,'#10141a',.25);L.screw(-3,2.7,.33,'#8494a6');L.screw(6.9,2.7,.33,'#8494a6')}},.7);
    K.box(-3.8,5.35,7.2,6.45,-1,1,'brunito',{hi:.8},.5);
    K.sph([5.7+bo,3.6,1.75],.75,'acciaio');
    K.cyl([8,5.82,0],[14.4,5.82,0],.62,'acciaio');
    K.box(8,2.1,15.4,5.25,-1.25,1.25,'legno',{dk:.6,det:L=>{L.grain(8.4,2.5,15,4.9,2);L.line(10,3.55,11.6,3.55,'#2a1408',.55);L.line(12.4,3.55,14,3.55,'#2a1408',.55)}},.8);
    K.cyl([15.3,3.65,0],[20.6,3.65,0],.65,'acciaio');
    K.prism([[17.6,4.3],[17.9,6.7],[18.6,6.7],[18.8,4.3]],-.35,.35,'acciaio',{hi:.4});
    K.cyl([20.2,3.65,0],[22.1,3.65,0],1.1,'nero',{hole:1,holeK:.45});
    // the red dot sight on top
    K.box(-.4,6.2,4,7.15,-.7,.7,'nero',{hi:.2},.3);
    K.cyl([0,8.2,0],[3.6,8.2,0],1.4,'nero',{capDet:(c,e)=>{const g=st.glow==null?1:st.glow,r=1.0*K.s;shine('255,90,60',c[0],c[1],r*3.2,.55*g);ctx.fillStyle='#ff6a4a';ball(c,r*.75);ctx.fill();ctx.fillStyle='#ffd0c2';ball([c[0]-r*.2,c[1]-r*.25],r*.25);ctx.fill()}});
    return magKeys({muzzle:[22.3,3.65,0],eject:[3.8,5.7,1.2],sup:[11.8,1.25,0],mag:mg,rack:[5.9+bo,3.9,3.9],rackDir:[-1,0,0]},RMD,6.6,[7.6,-8.3,-.8])},
  mitragliatrice(K,st){const sp=st.spin||0,fd=st.feed||0;
    K.prism(rp([[-2.2,1.8],[.5,1.8],[1.2,-3.4],[-1.4,-3.8]],.5),-1,1,'gomma',{dk:.66,hi:.3});
    K.rod(guardPts(.7,3,-1.6,1.6),.75,'nero');K.rod([[1.6,1.5,0],[2.1,.6,0],[1.7,-.1,0]],.42,'nero',{db:.02});
    const mg=magPart(K,st,DN,6.8,[6.6,-6.8,-1.2],(k,b)=>k.box(3.4,-4.8,9.8,1.3,-2.1,2.1,'oliva',{dk:.62,db:.6*b,det:L=>{L.line(3.6,-.3,9.6,-.3,'rgba(20,26,8,.55)',.4);L.rect(4.4,-3,8.8,-2,'#e8b52a',.2);L.screw(9,-1.4,.32,'#c9cf9a')}},.8)),
      seated=!st.magOff&&!(st.mag>0)&&!st.magAt;
    K.box(-7.3,2.1,-5.6,7.3,-1.9,1.9,'arancio',{},.6);
    K.box(-6.2,1.4,7.4,8.1,-2,2,'acciaio',{det:L=>{for(const x of[-4.2,-3.3,-2.4])L.line(x,3.2,x,6.6,'#1c2127',.5);L.screw(5.6,2.7,.36,'#aab4be')}},1.6);
    K.rod([...qpts([-3.2,8,0],[-3,11,0],[.6,11,0],5),...qpts([.6,11,0],[4.3,11,0],[4.5,8,0],5).slice(1)],1,'nero');
    // the belt of rounds from the box up into the gun, on its right side
    if(seated)for(let i=0;i<5;i++){const k=(i+fd)/5,x=lerp(9.2,6.2,k),y=lerp(.9,3.4,k)+Math.sin(k*Math.PI)*1.1;K.box(x-.55,y-.4,x+.55,y+1.8,2.05,2.6,'ottone',{hi:.4},.25);K.box(x-.5,y+1.7,x+.5,y+2.6,2.05,2.55,'rame',{hi:.3},.4)}
    // four barrels that really turn round their axis
    for(let i=0;i<4;i++){const a=sp+i*TAU/4;K.cyl([7,4.6+Math.cos(a)*1.65,Math.sin(a)*1.65],[27,4.6+Math.cos(a)*1.65,Math.sin(a)*1.65],.72,'acciaio',{hole:1,holeK:.5})}
    K.cyl([11.4,4.6,0],[12.8,4.6,0],2.45,'nero',{db:.1});K.cyl([24.6,4.6,0],[26,4.6,0],2.45,'nero',{db:.1});
    K.cyl([26.6,4.6,0],[28.3,4.6,0],2.25,'nero',{db:.12,capDet:(c,e)=>{if(e[0]<27)return;for(let i=0;i<4;i++){const a=sp+i*TAU/4;const q=K.P(K.W([28.3,4.6+Math.cos(a)*1.65,Math.sin(a)*1.65]));ctx.fillStyle='#121417';ball(q,.5*K.s);ctx.fill()}}});
    K.prism(rp([[15.2,2.4],[17.2,2.4],[17.4,-3.4],[15.4,-3.6]],.6),-.9,.9,'gomma',{hi:.3});
    return magKeys({muzzle:[28.5,4.6,0],eject:[4.6,1.3,2.4],sup:[16.3,-1.2,0],mag:mg,rack:[lerp(9.4,7,fd),3,4.4],rackDir:[-1,.5,0]},DN,6.8,[6.6,-6.8,-1.2])},
  pompa(K,st){const p=-(st.pump||0)*3.2;
    K.prism(rp([[-.6,5],[-11.6,3.9],[-12.6,3],[-12.6,-1.4],[-11.8,-2],[-3,-.6],[-.6,1.2]],[.3,.5,.6,.6,.6,.8,.3]),-1.1,1.1,'legno',{dk:.6,concave:1,det:L=>{L.grain(-12.4,-1.5,-1,4,4);L.checker(-3.6,-.6,-.8,1.4,'rgba(40,18,6,.4)')}});
    K.box(-13.3,-2.3,-12.3,3.9,-1.15,1.15,'gomma',{hi:.2},.4);
    K.rod(guardPts(1.5,4.4,-1.1,1.9),.75,'brunito');K.rod([[2.7,1,0],[3.2,.1,0],[2.8,-.6,0]],.42,'brunito',{db:.02});
    K.box(-.6,1.2,8.6,5,-1.2,1.2,'brunito',{det:L=>{L.line(0,2.05,8,2.05,'#d39a33',.4);L.rect(2.4,3.75,5.4,4.6,'#0e1217',.2)}},.8);
    K.cyl([8.4,2.65,0],[25.3,2.65,0],.65,'acciaio');K.cyl([24.8,2.65,0],[25.8,2.65,0],.88,'acciaio',{db:.02});
    K.cyl([8.4,4.2,0],[29.7,4.2,0],.8,'acciaio',{hole:1,holeK:.5});K.sph([29.1,5.35,0],.55,'ottone',{db:.05});
    K.box(11+p,1,18.6+p,3.9,-1.3,1.3,'legno',{dk:.55,det:L=>{for(let i=0;i<4;i++)L.line(12.4+p+i*1.6,1.4,12.4+p+i*1.6,3.5,'rgba(50,20,6,.6)',.5)}},.9);
    shellPart(K,st,'rosso');
    return{muzzle:[29.9,4.2,0],eject:[4,5,1.2],sup:[14.8+p,.9,0],port:[6.4,1.2,0]}},
  tattica(K,st){const p=-(st.pump||0)*2.6,ns=st.saddle==null?4:st.saddle;
    K.box(-7,1.6,-3.4,4.8,-1,1,'nero',{hi:.35},.6);K.box(-7.8,1.2,-6.6,5.2,-1.15,1.15,'arancio',{},.4);
    K.prism(rp([[-2.6,1.8],[.2,1.8],[1,-3.8],[-1.8,-4.2]],.5),-1,1,'gomma',{dk:.66,hi:.3,det:L=>L.line(-1.9,.8,-.9,-3.4,'#e26a24',.5)});
    K.rod(guardPts(.4,3.2,-1.6,1.7),.75,'nero');K.rod([[1.6,1.5,0],[2.1,.6,0],[1.7,-.1,0]],.42,'nero',{db:.02});
    K.box(-3.6,1.4,5.6,5.2,-1.2,1.2,'nero',{hi:.5},.8);
    // the spare shells on the left side of the receiver
    for(let i=0;i<4;i++){if(i>=ns)continue;const x=-2.7+i*1.9;K.box(x,2.7,x+1.5,4.85,-1.75,-1.2,'verde',{hi:.5},.45);K.box(x,2.15,x+1.5,2.95,-1.75,-1.2,'ottone',{hi:.3},.2)}
    K.cyl([5.4,4.3,0],[18.8,4.3,0],.8,'brunito');
    K.box(6.2,4,16.6,6.05,-1,1,'nero',{hi:.45,det:L=>{for(let i=0;i<4;i++)L.dot(7.8+i*2.5,5.05,.48,'#0b0c0e')}},.6);
    K.prism(rp([[18.6,5.6],[20.8,6.15],[20.8,2.65],[18.6,3.1]],.4),-1.1,1.1,'nero',{hi:.4});
    K.box(18.15,2.95,18.95,5.7,-1.18,1.18,'arancio',{hi:.2,db:.02},.2);
    K.cyl([5.4,2.8,0],[13.4,2.8,0],.6,'nero');
    K.box(6.4+p,.9,12.2+p,3.85,-1.3,1.3,'nero',{hi:.4,det:L=>{L.line(8.2+p,1.3,8.2+p,3.5,'#e26a24',.55);L.line(10.4+p,1.3,10.4+p,3.5,'#e26a24',.55)}},.8);
    K.box(0,5.2,2.6,6.7,-.8,.8,'nero',{hi:.4},.4);
    K.fx([2.15,5.95,0],q=>{const g=st.glow==null?1:st.glow;shine('255,90,60',q[0],q[1],2.6*K.s,.5*g)},.3);
    K.disc([2.6,5.95,0],[1,0,0],.48,'#ff6a4a');K.disc([0,5.95,0],[-1,0,0],.48,'#ff6a4a');
    shellPart(K,st,'verde');
    return{muzzle:[21,4.4,0],eject:[1.6,5.3,1.2],sup:[9.3+p,.9,0],port:[3.4,1.4,0],sad:[0,1,2,3].map(i=>[-1.95+i*1.9,3.8,-3.2])}},
  lanciarazzi(K,st){const ld=st.loaded==null?1:st.loaded;
    K.cyl([-14.4,6.5,0],[-17.6,6.5,0],2.1,'acciaio',{r2:3.7,hole:1,holeK:.8});
    const ra=st.rocketAt,off=(1-ez(ld))*9+(ra?ra[0]:0),ry=6.5+(ra?ra[1]:0),rz=ra?ra[2]:0;
    if(ld>0||ra){K.cyl([15+off,ry,rz],[17.6+off,ry,rz],1.95,'rosso',{db:-.05});K.cyl([17.4+off,ry,rz],[22.6+off,ry,rz],1.95,'rosso',{r2:.2,db:-.04});
      K.cyl([16+off,ry,rz],[16.7+off,ry,rz],1.98,'cera',{db:-.03});
      // out of the tube the hand holds it whole: the olive motor behind the head, with its fins
      if(ra){K.cyl([6.8+off,ry,rz],[15.2+off,ry,rz],1.2,'oliva',{db:-.06});for(let i=0;i<3;i++){const a=i/3*TAU+.5;K.rod([[7.2+off,ry+Math.cos(a)*1.1,rz+Math.sin(a)*1.1],[8.6+off,ry+Math.cos(a)*2.3,rz+Math.sin(a)*2.3],[10+off,ry+Math.cos(a)*1.1,rz+Math.sin(a)*1.1]],.42,'oliva',{db:-.05})}}}
    K.cyl([-14.6,6.5,0],[15.4,6.5,0],2.7,'oliva',{hole:ld<.99,holeK:.78,det:t=>{
      // the yellow and black band near the front, a white band at the back, screws along the top
      const band=(k0,k1,col)=>{const pts=[];for(let i=0;i<=8;i++){const an=-Math.PI*.95+i/8*Math.PI*1.9,n=add(mul(t.v,Math.cos(an)),mul(t.w,Math.sin(an)));if(t.F(n)<-.05)continue;pts.push([an])}};
      const ring=(k,an0,an1,col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();let on=false;for(let i=0;i<=20;i++){const an=lerp(an0,an1,i/20),n=add(mul(t.v,Math.cos(an)),mul(t.w,Math.sin(an)));
        if(t.F(n)<0){on=false;continue}const q=t.P(t.at(k,an,.03));if(!on){ctx.moveTo(q[0],q[1]);on=true}else ctx.lineTo(q[0],q[1])}ctx.stroke()};
      const kk=x=>(x+14.6)/30;for(let i=0;i<7;i++)ring(kk(11.7+i*.42),0,TAU,'#e8b52a',.5*K.s+1.1);
      for(let i=0;i<4;i++){ctx.strokeStyle=INK;ctx.lineWidth=.7*K.s;ctx.beginPath();let on=false;for(let j=0;j<=12;j++){const an=j/12*TAU,n=add(mul(t.v,Math.cos(an)),mul(t.w,Math.sin(an)));if(t.F(n)<0){on=false;continue}
        const q=t.P(t.at(kk(11.8+i*.75+j/12*.7),an,.04));if(!on){ctx.moveTo(q[0],q[1]);on=true}else ctx.lineTo(q[0],q[1])}ctx.stroke()}
      ring(kk(-11.7),0,TAU,'#e8dcbe',1*K.s+.6)}});
    K.box(-3.2,9,3.4,11.8,-1,1,'nero',{hi:.5},.6);
    K.fx([0,10.4,0],q=>{const g=st.glow==null?1:st.glow;shine('120,255,140',q[0],q[1],4.2*K.s,.5*g)},.2);K.disc([-3.2,10.4,0],[-1,0,0],.75,'#7dffa0',{edge:1});
    K.prism(rp([[-1.4,3.8],[1.2,3.8],[1.8,-3.2],[-1,-3.6]],.5),-1,1,'gomma',{dk:.66,hi:.3});
    K.rod(guardPts(1.3,3.9,-3.6,1.5),.75,'nero');
    K.prism(rp([[6.2,3.9],[8.2,3.9],[8.4,-2.2],[6.4,-2.4]],.6),-.9,.9,'gomma',{hi:.3});
    return{muzzle:[15.6,6.5,0],back:[-17.8,6.5,0],eject:null,sup:[7.3,-.8,0],rocket:[18.6+off,ry-2.6,rz]}},
  // ---------------------------------------------------------------- the four new guns (punto 24; profiles in sprite/armi/disegno_armi.js)
  // the flamethrower: the red tank under the body with brass caps and the hose, the iron body with the gauge, the copper pipe in its
  // perforated shield, the flared nozzle with the blue pilot flame
  lanciafiamme(K,st){const tt=typeof G!=='undefined'&&G&&G.t!=null?G.t:performance.now()/1000;
    const mg=magPart(K,st,DN,6.4,[-7,-8.3,-.8],(k,b)=>{k.cyl([-12.4,-4.1,0],[-1.6,-4.1,0],2.5,'rosso',{db:.6*b});k.cyl([-13,-4.1,0],[-11.4,-4.1,0],2.2,'ottone',{db:.05+.6*b});k.cyl([-2.6,-4.1,0],[-1,-4.1,0],2.2,'ottone',{db:.05+.6*b})});
    if(!st.magOff&&!(st.mag>0)&&!st.magAt)K.rod(qpts([-2,-2.4,1.3],[1.5,-1.2,1.7],[3.6,1.2,1.1],5),1.1,'gomma');
    K.prism(rp([[-2.6,1.4],[.6,1.4],[1.4,-4.6],[-1.6,-5]],.5),-1,1,'legno',{dk:.66});K.rod(guardPts(.9,4.2,-1.3,2.2),.75,'nero');
    K.box(-4,1.2,10.6,4.6,-1.4,1.4,'nero',{hi:.4},1);
    K.cyl([-1.6,6,-.65],[-1.6,6,.65],1.9,'ottone',{capDet:c=>{ctx.fillStyle='#f4ecd0';ball(c,1.25*K.s);ctx.fill();const a=-2.6+(st.glow==null?.8:st.glow)*1.4;ctx.strokeStyle='#c0301e';ctx.lineWidth=.35*K.s;seg(c,[c[0]+Math.cos(a)*K.s,c[1]+Math.sin(a)*K.s]);ctx.stroke()}});
    K.cyl([10,2.85,0],[24.4,2.85,0],.85,'rame');
    K.cyl([11.6,2.85,0],[20.6,2.85,0],2.05,'acciaio',{det:t=>{for(let i=0;i<5;i++)for(let j=0;j<5;j++){const an=j/5*TAU+.3,n=add(mul(t.v,Math.cos(an)),mul(t.w,Math.sin(an)));if(t.F(n)<.25)continue;ctx.fillStyle='#14171b';ball(t.P(t.at(.12+i*.19,an,.05)),.38*K.s);ctx.fill()}}});
    K.cyl([24,2.85,0],[27.4,2.85,0],1,'ottone',{r2:1.9,hole:1,holeK:.62});
    K.prism(rp([[12.4,.8],[14.2,.8],[14.4,-3.6],[12.6,-3.8]],.6),-1,1,'legno',{dk:.6});
    K.fx([26.4,-.3,0],q=>{const f=.8+.2*Math.sin(tt*31);shine('120,180,255',q[0],q[1],2.6*K.s,.7);ctx.fillStyle='#7ab8ff';ctx.beginPath();ctx.ellipse(q[0],q[1],.55*K.s,f*K.s,0,0,TAU);ctx.fill();ctx.fillStyle='#e8f4ff';ctx.beginPath();ctx.ellipse(q[0],q[1]+.2*K.s,.25*K.s,.5*f*K.s,0,0,TAU);ctx.fill()},.3);
    return magKeys({muzzle:[27.6,2.85,0],eject:null,sup:[13.3,-1.6,0],mag:mg,rack:[-1.6,7.4,-1.8],rackDir:[0,0,0]},DN,6.4,[-7,-8.3,-.8])},
  // the drum gun: the wire stock, the wooden grips, the big steel drum with its brass key, the finned barrel and the brake
  tamburo(K,st){const bo=-(st.slide||0)*2;
    K.box(-8.4,.2,-7.2,4.6,-1.3,1.3,'gomma',{hi:.2},.4);for(const z of[-.9,.9]){K.rod([[-7.4,4,z],[-3.6,4,z]],.6,'acciaio');K.rod([[-7.4,.7,z],[-3.6,.7,z]],.6,'acciaio')}
    K.prism(rp([[-2.4,1.4],[.6,1.4],[1.3,-4.6],[-1.4,-5]],.5),-1,1,'legnoR',{dk:.66});K.rod(guardPts(.9,4,-1.3,2.2),.75,'nero');
    const mg=magPart(K,st,DN,6.6,[4.4,-8.2,-1],(k,b)=>k.cyl([4.4,-2.8,-1.7],[4.4,-2.8,1.7],3.7,'acciaio',{db:.8*b,capDet:c=>{const a=st.key||0,dx=Math.cos(a)*.7*K.s,dy=Math.sin(a)*.7*K.s;
      ctx.strokeStyle='rgba(20,24,30,.55)';ctx.lineWidth=.35*K.s;ctx.beginPath();ctx.arc(c[0],c[1],2.6*K.s,0,TAU);ctx.stroke();ctx.fillStyle=MAT.ottone[1];ball(c,1.1*K.s);ctx.fill();ctx.strokeStyle=MAT.ottone[0];seg([c[0]-dx,c[1]-dy],[c[0]+dx,c[1]+dy]);ctx.stroke()}}));
    K.box(-4,1.4,9.4,5.6,-1.3,1.3,'nero',{hi:.45,det:L=>L.rect(2+bo,4.5,4.6+bo,5.4,'#121417',.25)},.9);
    K.box(1.2+bo,5.4,2.6+bo,6.6,-.5,.5,'acciaio',{hi:.4},.35);
    K.prism(rp([[9.4,1.4],[11.2,1.4],[11.4,-3.4],[9.6,-3.6]],.6),-1,1,'legnoR',{dk:.6});
    K.cyl([9.2,3.3,0],[17.2,3.3,0],1.1,'brunito',{det:t=>{for(let i=0;i<6;i++){const q=t.P(t.at(.12+i*.14,Math.PI*.5,.05));ctx.fillStyle='#14171b';ball(q,.34*K.s);ctx.fill()}}});
    K.cyl([16.8,3.3,0],[19.4,3.3,0],1.6,'nero',{hole:1,holeK:.45});
    return magKeys({muzzle:[19.6,3.3,0],eject:[3.2,5.4,1.3],sup:[10.3,-1.6,0],mag:mg,rack:[1.9+bo,8.2,-1.2],rackDir:[-1,0,0]},DN,6.6,[4.4,-8.2,-1])},
  // the steam rifle: the stock, the brass body with rivets, the clip of bolts, the copper tank with its bands, the barrel with the copper
  // coils, the gauge (st.gauge: the pressure), the red valve wheel
  vapore(K,st){const pr=st.gauge==null?.6:st.gauge;
    K.prism(rp([[-4,5],[-11.8,4.4],[-12.8,3.6],[-12.8,-.8],[-12,-1.5],[-4,1.6]],[.3,.5,.6,.6,.5,.3]),-1.1,1.1,'legno',{dk:.62,det:L=>L.grain(-12.4,-.6,-4,4.4,4)});
    K.box(-13.6,-1.6,-12.5,4,-1.15,1.15,'ottone',{hi:.3},.4);
    const mg=magPart(K,st,DN,6.2,[.6,-6,-.8],(k,b)=>{k.box(-.8,-4.2,2,1.6,-.9,.9,'nero',{hi:.3,db:.6*b},.4);if(b>-.6)for(let i=0;i<3;i++)k.cyl([-.25+i*.8,1.4,0],[-.25+i*.8,2.3,0],.32,'acciaio',{db:.02})});
    K.prism(rp([[-3.2,1.4],[-.6,1.4],[.4,-4.4],[-2.4,-4.8]],.5),-1,1,'legno',{dk:.66});K.rod(guardPts(-.4,3.2,-1.3,2),.75,'ottone');
    K.box(-4.2,1.3,9,5.8,-1.4,1.4,'ottone',{det:L=>{for(const x of[-3,0,3,6,8])L.screw(x,5,.3,'#f6cf6c')}},1);
    K.cyl([6,-.8,0],[19,-.8,0],2,'rame',{det:t=>{for(const k of[.2,.5,.8]){ctx.strokeStyle=MAT.ottone[1];ctx.lineWidth=.9*K.s;seg(t.P(t.at(k,Math.PI*.5,.05)),t.P(t.at(k,-Math.PI*.5,.05)));ctx.stroke()}}});
    K.cyl([9,3.65,0],[28.2,3.65,0],.75,'brunito');
    for(let i=0;i<6;i++){const x=12+i*1.4;K.rod(qpts([x,4.95,0],[x+.5,3.65,1.6],[x+.2,2.35,0],4),.45,'rame',{noOut:true,db:.2})}
    K.cyl([26.8,3.65,0],[28.6,3.65,0],1.3,'ottone',{hole:1,holeK:.45});
    K.cyl([2,8,-.7],[2,8,.7],2.3,'ottone',{capDet:c=>{ctx.fillStyle='#f4ecd0';ball(c,1.6*K.s);ctx.fill();const a=Math.PI*(.8+cl(pr,0,1)*1.4);ctx.strokeStyle='#c0301e';ctx.lineWidth=.32*K.s;seg(c,[c[0]+Math.cos(a)*1.3*K.s,c[1]+Math.sin(a)*1.3*K.s]);ctx.stroke();ctx.fillStyle=INK;ball(c,.3*K.s);ctx.fill()}});
    K.box(1.6,5.6,2.4,6.1,-.3,.3,'ottone',{hi:0},.1);
    K.cyl([5.4,-.6,1.4],[5.4,-.6,2],1.3,'rosso',{capDet:c=>{const a=st.valve||0,r=1*K.s;ctx.strokeStyle='#5a1210';ctx.lineWidth=.32*K.s;for(const d of[0,Math.PI/2]){const dx=Math.cos(a+d)*r,dy=Math.sin(a+d)*r;seg([c[0]-dx,c[1]-dy],[c[0]+dx,c[1]+dy]);ctx.stroke()}}});
    return magKeys({muzzle:[28.8,3.65,0],eject:null,sup:[15.4,-3.4,0],mag:mg,rack:[5.4,-.6,4],rackDir:[0,0,0]},DN,6.2,[.6,-6,-.8])},
  // the resonator: the black stone body with the glowing veins, the crystal core, the brass rings, the leather grip, three prongs round
  // the orb that pulses (st.glow) and flares
  risonatore(K,st){const gl=st.glow==null?1:st.glow,tt=typeof G!=='undefined'&&G&&G.t!=null?G.t:performance.now()/1000;
    const mg=magPart(K,st,DN,6.6,[-3.4,-4.4,-.8],(k,b)=>k.prism(rp([[-3.4,4.6],[-1.8,2.6],[-3.4,-2.6],[-5,2.6]],.3),-.8,.8,'cristallo',{hi:.5,db:.6*b}));
    const vein=(L,a,b,c,d,al)=>L.line(a,b,c,d,`rgba(120,255,210,${al})`,.45);
    K.prism(rp([[-6.6,3.4],[-4,6.4],[4,7],[12,6],[16.4,4.6],[16.4,1.6],[12,.4],[4,-.2],[-4,.4]],[.6,.8,.8,.6,.4,.4,.6,.8,.6]),-1.6,1.6,'ossidiana',{det:L=>{const al=.5+.35*gl;
      vein(L,-4,3.6,0,4.8,al);vein(L,0,4.8,4,3.8,al);vein(L,4,3.8,8,5,al);vein(L,8,5,14,3.4,al);vein(L,-3,1.6,2,2.2,al*.85);vein(L,2,2.2,7,1.4,al*.85);vein(L,7,1.4,13,2,al*.85)}});
    K.prism(rp([[-2.2,.2],[.8,.2],[1.4,-4.8],[-1.4,-5.2]],.5),-1,1,'gomma',{dk:.6});K.rod(guardPts(.9,4,-.1,2),.75,'ottone');
    K.cyl([2.7,3.4,0],[3.4,3.4,0],2.1,'ottone');K.cyl([11.3,3.2,0],[12.1,3.2,0],1.8,'ottone');
    for(let i=0;i<3;i++){const a=i/3*TAU+Math.PI/2,c=Math.cos(a),s=Math.sin(a);K.tube([[15.6,3.2+c*1.4,s*1.4],[19,3.2+c*3.4,s*3.4],[21.6,3.2+c*2.4,s*2.4],[22.8,3.2+c*1.1,s*1.1]],[1.2,1,.8,.5],'ossidiana')}
    K.cyl([15.2,3.2,0],[19.4,3.2,0],.6,'ottone');
    K.fx([21,3.2,0],q=>{const p=.8+.2*Math.sin(tt*5);shine('140,255,220',q[0],q[1],(7*p*gl+2)*K.s,.75);ctx.fillStyle='#bfffe8';ball(q,1.5*p*K.s);ctx.fill();ctx.fillStyle='#fff';ball([q[0]-.4*K.s,q[1]-.4*K.s],.6*K.s);ctx.fill()},.2);
    return magKeys({muzzle:[21.4,3.2,0],eject:null,sup:[8.6,-2,0],mag:mg,rack:[3.05,3.4,-3.3],rackDir:[0,0,0]},DN,6.6,[-3.4,-4.4,-.8])},

// ------------------------------------------------------------------ the weapons of the Classic mode: the crossbow, the Druid's staff, the bows
  // the light crossbow: a walnut tiller with a pistol grip and a groove for the bolt, a steel prod across the front, thick in the middle,
  // its tips swept back as the string is drawn; the string to the nut; a stirrup at the front; a steel bolt with blue fletching (the
  // colour of its card) when it is cocked. st.draw: 1 cocked .. 0 just shot; st.bolt: the bolt in the groove (when cocked, if not given)
  balestra(K,st){const dr=st.draw==null?1:st.draw,bolt=st.bolt==null?dr>.97:st.bolt,T=st.col?tones(st.col):'noce';
    K.prism(rp([[-8.4,2.2],[11,2.2],[11.6,1.5],[11,.5],[2.4,.3],[1.5,-.5],[.9,-3.9],[-1.3,-4.2],[-1.4,-.6],[-5.4,-.5],[-8.4,-1.7],[-9.2,-.9],[-9.2,1.5]],[.3,.3,.3,.3,.5,.4,.5,.5,.4,.8,.5,.4,.4]),-1.05,1.05,T,
      {concave:1,det:L=>{L.grain(-8.8,-1.2,10.6,2,3);L.line(-1.6,2.05,9.6,2.05,'rgba(30,16,6,.55)',.45);L.screw(5.2,1.2,.32,'#c9cfd6');L.screw(-6.4,.6,.32,'#c9cfd6')}});
    K.rod([[2.2,.2,0],[2.8,-1,0],[2.3,-1.8,0]],.5,'acciaio',{db:.02});K.rod(guardPts(1.4,4.2,-.2,1.9),.6,'acciaio');
    // the prod: thick in the middle, thin at the brass-capped tips
    const bk=.8+dr*1.4,tl=[10.4-bk,2.2,-9.6],tr=[10.4-bk,2.2,9.6],c=[13.8,2.2,0],pr=qpts(tl,c,tr,13);
    K.tube(pr,pr.map((_,i)=>.95+1.25*Math.pow(Math.sin(i/12*Math.PI),1.4)),'lucido');K.sph(tl,.75,'ottone',{db:.02});K.sph(tr,.75,'ottone',{db:.02});
    K.box(10.4,1.1,13.4,3.1,-1.55,1.55,'acciaio',{hi:.45,db:.04},.4);
    // the string through the nut, the nut, the stirrup
    const nut=[lerp(10.2,-.6,dr),2.9,0];K.rod([tl,nut,tr],.6,'corda',{hi:0,noOut:1,db:-.02});
    K.box(-1.3,2.1,.7,3.4,-.8,.8,'acciaio',{hi:.3,db:.05},.3);
    K.rod([[11.6,1,-1.4],[14.2,.2,-1.9],[15.2,-.3,0],[14.2,.2,1.9],[11.6,1,1.4]],.7,'acciaio');
    // the bolt: a steel shaft, a sharp head, three blue vanes
    if(bolt){const x0=nut[0]+.4,y=3.05,bl=['#1d3f78','#4d97ff','#a9cdff'];K.rod([[x0,y,0],[13.9,y,0]],.62,'lucido',{db:.06});K.cyl([13.7,y,0],[15.9,y,0],.62,'lucido',{r2:.06,db:.07});
      const fl=K.frame([x0,y,0],[1,0,0],[0,0,1]);fl.prism([[.3,0],[2.9,0],[.8,1.5]],-.07,.07,bl,{hi:0,dk:.7,db:.09});fl.prism([[.3,0],[.8,-1.5],[2.9,0]],-.07,.07,bl,{hi:0,dk:.7,db:.09});
      K.prism([[x0+.3,y],[x0+2.9,y],[x0+.8,y+1.4]],-.07,.07,bl,{hi:0,dk:.7,db:.09})}
    return{muzzle:[16,3.05,0],eject:null,sup:[7.6,.9,0],nut}},
  // the Druid's staff: a crooked branch, thicker at the foot, with two knots and a green cloth wrap where the hand holds it; at the top the
  // wood swells and opens in three prongs that cup a glowing orb (the colour of the Druid's eyes); two leaves. x goes up the staff, the
  // hand is at 0,0,0. st.glow: how bright the orb is (it flares when the staff casts), st.orbCol
  bastone(K,st){const g=st.glow==null?1:st.glow,oc=st.orbCol||'#9fff7a',OT=[mix(oc,'#0d2a12',.5),oc,mix(oc,'#ffffff',.72)],rgb=hexRgb(oc),T='corteccia';
    K.tube([[-15.5,0,0],[-10,.5,.2],[-4,-.3,-.2],[2,.3,.1],[8,-.3,0],[12.6,.1,0]],[2.6,2.5,2.35,2.25,2.15,2.35],T);
    K.sph([-8.2,1.05,.3],.9,T,{db:.02});K.sph([5,-1.05,-.2],.85,T,{db:.02});
    K.cyl([-2.3,0,0],[2.3,0,0],1.55,'stoffa',{det:t=>{ctx.strokeStyle='rgba(16,40,10,.5)';ctx.lineWidth=.5*K.s;ctx.lineCap='round';
      for(let i=0;i<5;i++){ctx.beginPath();let on=false;for(let j=0;j<=10;j++){const an=j/10*TAU,n=add(mul(t.v,Math.cos(an)),mul(t.w,Math.sin(an)));if(t.F(n)<0){on=false;continue}
        const q=t.P(t.at(cl((i+.15+j/10*.7)/5,0,1),an,.02));if(!on){ctx.moveTo(q[0],q[1]);on=true}else ctx.lineTo(q[0],q[1])}ctx.stroke()}}});
    K.sph([13,0,0],1.75,T,{db:.02});
    const C=[17.4,0,0],RR=2.9;
    for(let k=0;k<3;k++){const a=k*TAU/3+.45,ca=Math.cos(a),sa=Math.sin(a),q=(x,r)=>[x,ca*r,sa*r];K.tube([q(13.2,.9),q(14.8,2.6),q(17,3.45),q(19.2,2.85),q(20.4,1.3)],[1.55,1.35,1.15,.95,.75],T)}
    K.fx(C,q=>shine(rgb,q[0],q[1],(6+2.5*g)*K.s,.22+.3*g),-5);
    K.sph(C,RR,OT);
    K.fx(C,q=>{ctx.fillStyle=`rgba(255,255,255,${.5+.3*g})`;ball([q[0]-RR*.36*K.s,q[1]-RR*.42*K.s],RR*.24*K.s);ctx.fill()},.05);
    const LEAF=[[0,0],[1.2,.85],[2.6,1.05],[3.8,.7],[4.8,0],[3.8,-.7],[2.6,-1.05],[1.2,-.85]];
    for(const[o,d,u] of[[[12.4,1.2,.7],[.5,1,.55],[0,-.4,1]],[[11.2,-1.1,-.6],[.35,-1,-.45],[0,.3,1]]])
      K.frame(o,d,u).prism(LEAF,-.08,.08,'foglia',{hi:.35,dk:.55,det:L=>L.line(.3,0,4.2,0,'rgba(20,60,10,.55)',.32)});
    return{muzzle:C,orb:C,eject:null,sup:null}},
  // the mages' staff (necromancer, pyromancer, the Witch, the Ice Queen; held 'staff' of the game's rig): a straight dark stick with an
  // iron collar under a big glowing orb (the colour of their eyes, st.orbCol); x goes up the staff, the hand at 0,0,0; st.glow as the Druid's
  scettro(K,st){const g=st.glow==null?1:st.glow,oc=st.orbCol||'#9fff7a',OT=[mix(oc,'#0d1418',.5),oc,mix(oc,'#ffffff',.72)],rgb=hexRgb(oc);
    K.tube([[-15.5,0,0],[-6,.15,0],[4,-.1,0],[13.4,0,0]],[2.4,2.3,2.2,2.3],'noce');
    K.cyl([-1.8,0,0],[1.8,0,0],1.45,['#2a2230','#463a52','#6e5f80'],{db:.02});K.cyl([12.6,0,0],[14.2,0,0],1.7,'brunito',{db:.03});
    const C=[18.2,0,0],RR=4.1;K.fx(C,q=>shine(rgb,q[0],q[1],(7+3.2*g)*K.s,.25+.32*g),-5);
    K.sph(C,RR,OT);K.fx(C,q=>{ctx.fillStyle=`rgba(255,255,255,${.5+.3*g})`;ball([q[0]-RR*.36*K.s,q[1]-RR*.42*K.s],RR*.24*K.s);ctx.fill()},.05);
    return{muzzle:C,orb:C,eject:null,sup:null}},
  // the Fabbro's hammer: a long walnut handle wrapped at the grip, an iron ring, a big iron head across its end (x along the handle, the
  // head's long side along y); st.hot 0..1: the far end of the head glows like the forge (in his second phase, when he raises it)
  martello(K,st){const hot=st.hot||0;
    K.tube([[-7,0,0],[4,0,0],[16,0,0]],[2.7,2.6,2.5],'noce');K.cyl([-2,0,0],[2,0,0],1.6,'gomma',{db:.02});K.cyl([14.2,0,0],[15.8,0,0],1.75,'brunito',{db:.02});
    K.box(15.6,-9,25.8,9,-5.4,5.4,['#2c3036','#5a5f68','#a3abb5'],{hi:.45,det:L=>{L.line(16.6,-8,16.6,8,'rgba(255,255,255,.3)',1.1);L.line(24.6,-8,24.6,8,'rgba(10,12,16,.4)',.8)}},1.4);
    if(hot>.02){K.box(23.2,-9.15,25.95,9.15,-5.55,5.55,[mix('#5a5f68','#b8401a',hot),mix('#5a5f68','#ff7a2e',hot),mix('#a3abb5','#ffd86b',hot)],{hi:0,db:.04},1.2);
      K.fx([25.8,0,0],q=>shine('255,140,50',q[0],q[1],14*K.s*hot,.55*hot),.2)}
    return{muzzle:[20.7,0,0],face:[20.7,-9,0],eject:null,sup:[7,0,0]}},
  // the dwarf's bomb: a round black iron bomb with a little neck, a short fuse and a spark at its tip, sitting in the hand (at 0,0,0);
  // st.has 0..1: how much of it is there (a new one pops into the hand after a throw)
  bomba(K,st){const k=st.has==null?1:st.has;if(k<=.02)return{muzzle:[0,0,0],eject:null,sup:null};
    const R0=4.8*k,C=[1.6,R0*.75,0];K.sph(C,R0,['#141418','#2e2e36','#767684']);K.cyl([1.6,R0*1.55,0],[1.6,R0*1.95,0],1.5*k,'nero',{db:.02});
    const f0=[1.6,R0*1.9,0],f1=[3.1,R0*1.9+2.4*k,.3];K.rod([f0,f1],.75,['#5a4228','#8a6a44','#b8956a'],{hi:0,db:.03});
    K.fx(f1,q=>{const fl=.8+.2*Math.sin(G.t*30);shine('255,200,90',q[0],q[1],6*fl*K.s,.85);ctx.fillStyle='#fff3c0';ball(q,1.1*K.s*k);ctx.fill()},.05);
    return{muzzle:C,eject:null,sup:null}},
  // the Bard's lute: a pear-shaped body of warm wood with its bowl behind (three slabs, smaller and darker, so from the side it reads
  // round), a dark sound hole in a golden rosette, the bridge, a neck with its fingerboard, the pegbox bent back with its pegs, four
  // strings. x along the neck (the pegbox at +x), y out of the soundboard, z across the strings; the body's middle at 0,0,0. st.strum:
  // where the strumming hand is across the strings (-1..1, the hand drawn by the hero); st.ring 0..1: the strings still shaking
  liuto(K,st){const BODY=[[-8,0],[-7.5,-3],[-5.8,-5],[-3,-5.7],[0,-5.2],[2.8,-3.6],[5,-1.7],[5.8,0],[5,1.7],[2.8,3.6],[0,5.2],[-3,5.7],[-5.8,5],[-7.5,3]],
      W=['#8a4a1e','#c8803e','#f2b46a'],B=['#4a2410','#7a3e1a','#a85a2a'],S=K.frame([0,0,0],[1,0,0],[0,0,1]),rg=st.ring||0;
    const sc=(k,dx)=>BODY.map(p=>[p[0]*k+dx,p[1]*k]);
    // the bowl (behind the soundboard: the sub-frame's z goes into it), then the soundboard
    S.prism(sc(.5,-1.2),3.4,4.3,B,{hi:0,dk:.5});S.prism(sc(.74,-.7),2.2,3.4,B,{hi:0,dk:.55});S.prism(sc(.9,-.3),.9,2.2,B,{hi:.2,dk:.6});
    S.prism(BODY,0,.9,W,{hi:.5,dk:.62,det:L=>{L.line(-6.9,-1.9,-6.9,1.9,'rgba(40,20,8,.35)',.35);for(const x of[-4.5,-1.5])L.line(x,-4.6,x,4.6,'rgba(120,60,20,.12)',.3)}});
    K.disc([1,.03,0],[0,1,0],2.25,'#e8c060',{db:.02});K.disc([1,.04,0],[0,1,0],1.75,'#2a1a10',{db:.03});
    K.fx([1,.05,0],q=>{ctx.strokeStyle='rgba(255,226,140,.55)';ctx.lineWidth=.4*K.s;ball(q,1.25*K.s);ctx.stroke()},.04);
    S.box(-6.2,-2.3,-5.2,2.3,-.75,0,B,{hi:.3,db:.05},.3);
    // the neck and the fingerboard, the pegbox bent back with three pegs a side
    S.box(5,-1,16.4,1,-.15,1.3,'noce',{hi:.3});S.box(5.2,-.85,16.2,.85,-.55,-.15,['#1d1612','#3a2e26','#5e4c40'],{hi:.2,db:.02});
    const PB=K.frame([16.2,-.3,0],[.82,-.57,0],[0,0,1]);PB.box(0,-1.1,5,1.1,-.75,.75,'noce',{hi:.3},.4);
    for(const x of[1.2,2.5,3.8])for(const sd of[-1,1])PB.sph([x,0,sd*1.35],.45,'cera',{db:.02});
    // the strings, a little above the soundboard, shaking after the strum
    for(const z of[-.66,-.22,.22,.66]){const w=rg>0?Math.sin(rg*40+z*9)*.32*rg:0;K.rod([[-5.6,.8,z],[1,.95,z+w],[16.2,.62,z]],.22,['#cdbf9f','#f6ead2','#fffaf0'],{noOut:1,hi:0,db:.25})}
    return{muzzle:[1,1.2,0],strum:[-2.4,1.9,cl(st.strum==null?.3:st.strum,-1,1)*2.6],sup:[12.4,1.7,0],eject:null}},
  // the Alchemist's flask: a round belly of glass with the liquid glowing inside (st.col), bubbles rising, a narrow neck and a cork; in
  // the hand at 0,0,0 (y up). st.has 0..1: how much of it there is (a new one pops into the hand after a throw)
  fiala(K,st){const k=st.has==null?1:st.has;if(k<=.02)return{muzzle:[0,0,0],eject:null,sup:null};const col=st.col||'#7bf06a',rgb=hexRgb(col),
      GL=['#7f9ea6','#c4e0e6','#ffffff'],R0=3.3*k,C=[1.3,R0*.95,0];
    K.fx(C,q=>shine(rgb,q[0],q[1],R0*2.4*K.s,.32),-4);
    K.sph(C,R0,GL);
    K.fx(C,q=>{const r=R0*K.s*.84;ctx.save();ball(q,r);ctx.clip();const g=ctx.createLinearGradient(0,q[1]-r*.2,0,q[1]+r);g.addColorStop(0,mix(col,'#ffffff',.35));g.addColorStop(1,mix(col,'#0d1418',.35));
      ctx.fillStyle=g;ctx.fillRect(q[0]-r,q[1]-r*.15,r*2,r*1.3);ctx.fillStyle='rgba(255,255,255,.65)';
      for(let i=0;i<3;i++){const u=((G.t*.8+i/3)%1),x=q[0]+Math.sin(i*2.3+G.t*2)*r*.35;ball([x,q[1]+r*.75-u*r*.95],r*.11*(1-u*.4));ctx.fill()}ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.8)';ball([q[0]-r*.42,q[1]-r*.45],r*.2);ctx.fill()},.05);
    K.cyl([1.3,R0*1.65,0],[1.3,R0*2.55,0],1.05*k,GL,{db:.02});
    K.cyl([1.3,R0*2.45,0],[1.3,R0*3,0],1.25*k,'legno',{db:.03});
    return{muzzle:C,eject:null,sup:null}},
  // the Ninja's star: four points of dark steel round a hole, the edges bright; in the hand at 0,0,0. st.has 0..1, st.spin its turn
  stellina(K,st){const k=st.has==null?1:st.has;if(k<=.02)return{muzzle:[0,0,0],eject:null,sup:null};const r=4.4*k,c=[2.2,1.4,0],a0=st.spin||0,pts=[];
    for(let i=0;i<8;i++){const a=i/8*TAU+a0,rr=i%2?r*.3:r;pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}
    const F=K.frame(c,[1,0,0],[0,1,0]);
    F.prism(pts,-.32,.32,['#262b33','#5c6672','#c9d2dc'],{hi:.55,dk:.55,det:L=>{for(let i=0;i<4;i++){const a=i/4*TAU+a0;L.line(Math.cos(a)*r*.25,Math.sin(a)*r*.25,Math.cos(a)*r*.9,Math.sin(a)*r*.9,'rgba(255,255,255,.35)',.3)}}});
    F.disc([0,0,.34],[0,0,1],.85*k,'#121417',{db:.02});F.disc([0,0,-.34],[0,0,-1],.85*k,'#121417',{db:.02});
    return{muzzle:c,eject:null,sup:null}},
  // the bows, bent in the plane of x (where the belly points, toward the target) and y (along the string), held at 0,0,0: a stave thick in
  // the middle and thin at the tips, the grip wrapped, the string from tip to tip (through st.pinch, the hand that draws it, a point in
  // this frame) and the arrow on it (st.nock). st.kind: 'plain' (frassino: horn tips), 'recurve' (tips that curl forward, green grip,
  // gold rings), 'thorn' (thorns on the belly, a purple flower at the top), 'phoenix' (flames at the tips, a golden grip with a red gem,
  // a warm glow, embers). st.col: the stave's colour (the card's tint); st.draw 0..1; st.twang: the string still shaking after the shot
  arco(K,st){const kind=st.kind||'plain',T=tones(st.col||'#a4703d'),dr=st.draw||0,L=st.L||11.2,bk=(st.bk||5.6)+dr*1.6;
    const top=[-bk,L,0],bot=[-bk,-L,0],ctl=[bk,0,0],at=t=>{const u=1-t;return[u*u*top[0]+2*u*t*ctl[0]+t*t*bot[0],u*u*top[1]+2*u*t*ctl[1]+t*t*bot[1],0]},
      tg=t=>nrm([2*(1-t)*(ctl[0]-top[0])+2*t*(bot[0]-ctl[0]),2*(1-t)*(ctl[1]-top[1])+2*t*(bot[1]-ctl[1]),0]);
    const N=17,pts=[],ws=[];for(let i=0;i<N;i++){const t=i/(N-1);pts.push(at(t));ws.push(1.4+1.9*Math.pow(Math.sin(t*Math.PI),.7))}
    if(kind==='phoenix')K.fx([0,0,0],q=>shine('255,130,40',q[0],q[1],18*K.s,.3+.08*Math.sin(G.t*9)),-6);
    if(kind==='thunder')K.fx([0,0,0],q=>shine('110,170,255',q[0],q[1],17*K.s,.22+.07*Math.sin(G.t*11)),-6);
    K.tube(pts,ws,T);
    // the grip: a wrap round the middle (leather; green for the recurve, dark green for the thorn bow, gold for the phoenix)
    const gc=kind==='recurve'?'#6cc24a':kind==='thorn'?'#2f5a22':kind==='phoenix'?'#ffb020':kind==='thunder'?'#d9a520':'#5a3a22',wrap=[];for(let i=0;i<=6;i++)wrap.push(at(.36+i/6*.28));
    K.tube(wrap,wrap.map(_=>3.7),tones(gc),{db:.04});
    if(kind==='recurve'||kind==='phoenix'||kind==='thunder')for(const t of[.355,.645]){const c=at(t),d=tg(t);K.cyl(sub(c,mul(d,.38)),add(c,mul(d,.38)),2.2,'ottone',{db:.06})}
    if(kind==='plain'||kind==='thorn')for(const t of[0,1]){const c=at(t),d=tg(t);K.cyl(c,add(c,mul(d,t?1:-1)),.9,'cera',{r2:.55,db:.03})}
    if(kind==='recurve')for(const sg of[1,-1]){const h=qpts([-bk,sg*L,0],[-bk-.8,sg*(L+3.4),0],[-bk+3.4,sg*(L+4.4),0],6);K.tube(h,[1.4,1.3,1.25,1.15,1.05,.95],T);K.sph(h[5],.62,'ottone',{db:.02})}
    // the thunder bow: golden caps on the tips with sparks that flicker, a golden zigzag on the belly of each limb
    if(kind==='thunder'){for(const t of[0,1]){const c=at(t),d=tg(t);K.cyl(c,add(c,mul(d,t?1.2:-1.2)),1.05,'ottone',{r2:.5,db:.03});
        K.fx(c,q=>{if(LOWFX)return;const k=Math.floor(G.t*12+t*3)%5;if(k<2){const s=t?1:-1;ctx.strokeStyle='#e8f6ff';ctx.lineWidth=1;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[0]+2.4,q[1]+s*2.4);ctx.lineTo(q[0]+1,q[1]+s*3.4);ctx.lineTo(q[0]+3.4,q[1]+s*6);ctx.stroke()}},.5)}
      for(const t of[.2,.8])K.fx(at(t),q=>{ctx.strokeStyle=INK;ctx.lineWidth=2.2;ctx.lineJoin='round';const z=()=>{ctx.beginPath();ctx.moveTo(q[0]-2.4,q[1]-1.6);ctx.lineTo(q[0]-.6,q[1]+.4);ctx.lineTo(q[0]+.6,q[1]-.8);ctx.lineTo(q[0]+2.4,q[1]+1.4)};z();ctx.stroke();ctx.strokeStyle='#ffd84a';ctx.lineWidth=1;z();ctx.stroke()},.3)}
    if(kind==='thorn'){for(const t of[.13,.27,.73,.87]){const c=at(t),d=tg(t),n=[-d[1],d[0],0];K.cyl(add(c,mul(n,.5)),add(c,mul(n,3.3)),.9,['#4a2766','#9a5ad0','#d6b0f6'],{r2:.06,db:.02})}
      K.fx(add(top,[-.4,1.2,0]),q=>{ink(1);for(let i=0;i<5;i++){const a=i*TAU/5+G.t*.6;ctx.fillStyle='#b874e6';ball([q[0]+Math.cos(a)*2,q[1]+Math.sin(a)*2],1.45);ctx.fill();ctx.stroke()}
        ctx.fillStyle='#ffe28a';ball(q,1.1);ctx.fill()},.4)}
    if(kind==='phoenix'){for(const t of[0,1])K.fx(at(t),q=>{const fl=Math.sin(G.t*14+q[1])*1.4;ink(1.2);
        for(const[k,col] of[[1,'#ff6a1a'],[.72,'#ffb020']]){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(q[0]-2*k,q[1]+.5);ctx.quadraticCurveTo(q[0]-(5+fl)*k,q[1]-4*k,q[0]+fl*.5*k,q[1]-9*k);ctx.quadraticCurveTo(q[0]+3.2*k,q[1]-3*k,q[0]+2*k,q[1]+.5);ctx.closePath();ctx.fill();if(k===1)ctx.stroke()}
        ctx.fillStyle='#fff1a8';ball([q[0]-.4,q[1]-3],1.15);ctx.fill()},.5);
      K.sph([1.25,0,0],1.05,['#7a1408','#ff5a2a','#ffd8a8'],{db:.08});K.fx([1.25,0,0],q=>shine('255,120,60',q[0],q[1],4.5*K.s,.5),.09);
      if(!LOWFX)K.fx([0,0,0],()=>{for(let i=0;i<4;i++){const u=(G.t*.55+i/4)%1,b=K.P(K.W(at(.12+i*.25)));ctx.fillStyle=`rgba(255,${170+60*(1-u)|0},80,${((1-u)*.8).toFixed(3)})`;
        ball([b[0]+Math.sin(G.t*3+i*2)*1.6*u,b[1]-u*10],.9*(1-u)+.3);ctx.fill()}},.5)}
    // the string and the arrow on it
    const pin=st.pinch||[-bk+(st.twang?Math.sin(st.twang*22)*1.2*st.twang:0),0,0];
    K.rod([top,pin,bot],1.1,['#cdbf9f','#f6ead2','#fffaf0'],{noOut:1,hi:0,db:-.01});
    if((st.nock||0)>.5){const a=pin;K.rod([a,[4.6,0,0]],1.05,['#a47a46','#d9b27a','#f3d9a8'],{db:.3,hi:0});K.cyl([4.6,0,0],[7.4,0,0],1.25,'lucido',{r2:.08,db:.31});
      K.prism([[a[0]+.9,.15],[a[0]+3.9,.35],[a[0]+.3,2.1]],-.07,.07,['#8a221b','#e5484d','#f27566'],{hi:0,dk:.8,db:.32});
      K.prism([[a[0]+.9,-.15],[a[0]+.3,-2.1],[a[0]+3.9,-.35]],-.07,.07,['#b7a888','#f6ead2','#fffaf0'],{hi:0,dk:.8,db:.32})}
    return{grip:[0,0,0],nock:pin,muzzle:[7.4,0,0],top,bot}}};
const hexRgb=h=>{const n=parseInt(h.slice(1),16);return`${n>>16},${n>>8&255},${n&255}`};

// ------------------------------------------------------------------ drawing one
// fr = {O, X, Y, Z, s}: X forward, Y up, Z to the side (unit vectors in the room); extra(K, its key points) can add pieces (the hands,
// the flash) before it is drawn. Returns the key points in the room
function draw(id,V0,fr,st,extra){const K=kit(V0,fr),f=M[id];if(!f)return null;st=st||{};const pts=f(K,st);if(extra)extra(K,pts);K.draw();const o={};
  for(const k in pts){const v=pts[k];o[k]=v&&v.length===3&&typeof v[0]==='number'?K.W(v):null}return o}
// the key points of weapon id in its own frame for the state st, without drawing it (a kit that projects nothing)
const NOV={P:()=>[0,0],D:()=>0,F:()=>0,c:1,s:0};
function keys(id,st){const f=M[id];if(!f)return{};return f(kit(NOV,{O:[0,0,0],X:[1,0,0],Y:[0,1,0],Z:[0,0,1],s:1}),st||{})||{}}
// the frame of a weapon held at O (a room point), pointing along aim, its top toward up (made square to aim); s: its size
function frame(O,aim,up,s){const X=nrm(aim),Y=nrm(sub(up,mul(X,dot(up,X))));return{O,X,Y,Z:cross(Y,X),s:s||1}}
const DATI_N={tamburo:'Mitraglietta a tamburo',lanciafiamme:'Lanciafiamme',vapore:'Fucile a vapore',risonatore:'Risonatore',pistola:'Pistola',revolver:'Revolver',mitraglietta:'Mitraglietta',mitra:'Mitra',mitragliatrice:'Mitragliatrice',pompa:'Pompa da caccia',tattica:'Pompa tattica',lanciarazzi:'Lanciarazzi',balestra:'Balestra leggera',bastone:'Bastone del Druida',arco:'Arco',scettro:'Bastone dei maghi',martello:'Martello del Fabbro',bomba:'Bomba',liuto:'Liuto del Bardo',fiala:"Fiala dell'Alchimista",stellina:'Stellina del Ninja'};
return{draw,keys,frame,M,MAT,kit,tones,nomi:DATI_N,ZOMBIE:['pistola','revolver','mitraglietta','mitra','mitragliatrice','pompa','tattica','lanciarazzi','tamburo','lanciafiamme','vapore','risonatore']}})();
