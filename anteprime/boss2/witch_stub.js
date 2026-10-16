// A pretend model for the brain's tests while the new model is not there yet: the Witch of today plays every move of the new one, with
// the lengths of the design (anteprime/mk_boss2.py witch --stub). Sinking, the fin and rising are the Witch of today clipped at the floor
// and pushed under it; the drawings the brain reads from the model (N3.witch2Thorn, Seed, Hand, Bump, Root, Husk, Sprout, Leaf) are simple
// shapes with the moments of the design, so the brain's calls are tried with the real signatures.
(()=>{const map={hand:'attack',spiral:'summon',sink:'summon',fin:'idle',rise:'summon',fix:'idle',roots:'summon',sow:'attack',rite:'summon',rage:'hit',
    taunt:'attack',enter:'idle',die:'hit'};
  const og=N3.witch,OM=N3.meta.witch,cl=(v,a,b)=>v<a?a:v>b?b:v,ss=u=>{u=cl(u,0,1);return u*u*(3-2*u)},TAU=Math.PI*2;
  // how deep under the floor (0 out, 1 only the crown out) in each move
  const depth=(a,p,o)=>a==='sink'?ss((p-.25)/.5):a==='fin'?1-.25*(o.k==null?1:o.k):a==='rise'?1-ss((p-.04)/.4):a==='enter'?1-ss((p-.4)/.32):a==='die'?ss((p-.4)/.5)*.7:0;
  N3.witch2=(x,y,f,a,p,sc,o)=>{o=o||{};const an=map[a]||a,d=depth(a,p,o),pp=a==='rage'?(p*4)%1:a==='spiral'?(p*2)%1:cl(p,0,.999);
    // the guardians of the second phase: four little spikes turning round her on the floor
    if(o.p2&&o.guard>0)for(let k=0;k<4;k++){const an2=(o.orb||0)+k*Math.PI/2,gx=x+Math.cos(an2)*58,gy=y+Math.sin(an2)*58*.55,h=26*o.guard;
      ctx.save();ctx.lineJoin='round';ctx.strokeStyle='#1b1612';ctx.lineWidth=2.2;ctx.fillStyle='#8a5a3a';ctx.beginPath();ctx.moveTo(gx-5,gy);ctx.lineTo(gx+1,gy-h);ctx.lineTo(gx+5,gy);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#ff8a3c';ctx.beginPath();ctx.arc(gx+.5,gy-h*.66,1.8,0,TAU);ctx.fill();ctx.restore()}
    if(d<=0)return og(x,y,f,OM.an.includes(an)?an:'idle',pp,OM.sc||1,o);
    const k=(sc||1)*(OM.sc||1.35);ctx.save();ctx.beginPath();ctx.rect(x-90*k,y-160*k,180*k,160*k+1.5);ctx.clip();og(x,y+d*46*k,f,OM.an.includes(an)?an:'idle',pp,OM.sc||1,o);ctx.restore();
    // the ring of earth round the cut
    ctx.save();ctx.strokeStyle='rgba(60,40,24,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,16*k*(1-d*.6),6*k*(1-d*.6),0,0,TAU);ctx.stroke();ctx.restore()};
  N3.meta.witch2={n:'Strega delle Radici',g:'boss',sc:1,
    an:['idle','walk','hit','hand','spiral','sink','fin','rise','fix','roots','sow','rite','rage','taunt','enter','die'],
    dur:{idle:3.2,walk:1.4,hit:.6,hand:3,spiral:3.2,sink:1.1,fin:.6,rise:1.2,fix:1,roots:2.8,sow:1.8,rite:4.8,rage:2.8,taunt:1.2,enter:3.2,die:4},lab:{}};
  N3.order.push('witch2');
  const INK='#1b1612',C=p2=>p2?['#ffb04a','#d0602a','#7a2a18','255,138,60']:['#5fae6c','#2a6a44','#10351f','123,240,192'];
  const ln=(w,col)=>{ctx.strokeStyle=col||INK;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round'};
  // a thorn flying along a
  N3.witch2Thorn=(x,y,a,sc,o)=>{o=o||{};const s=(sc||1)*6;ctx.save();ctx.translate(x,y);ctx.rotate(a);ln(1.8);ctx.beginPath();ctx.moveTo(s*1.4,0);ctx.lineTo(-s*.8,-s*.5);ctx.lineTo(-s*.5,0);ctx.lineTo(-s*.8,s*.5);ctx.closePath();
    ctx.fillStyle='#52301f';ctx.fill();ctx.stroke();ctx.fillStyle=o.p2?'#ff8a3c':'#efe3c8';ctx.beginPath();ctx.arc(s*1.1,0,1.3,0,TAU);ctx.fill();ctx.restore()};
  // a seed in flight (z its height): violet with a mint heart, an autumn lantern in the second phase
  N3.witch2Seed=(x,y,z,sc,o)=>{o=o||{};const s=(sc||1)*4,yy=y-(z||0);ctx.save();ctx.translate(x,yy);ctx.rotate(o.spin||0);ln(1.6);ctx.beginPath();ctx.ellipse(0,0,s,s*1.25,0,0,TAU);
    ctx.fillStyle=o.p2?'#ff8a3c':'#8a4ab8';ctx.fill();ctx.stroke();ctx.fillStyle=o.p2?'#fff0c0':'#7bf0c0';ctx.beginPath();ctx.arc(0,0,s*.45,0,TAU);ctx.fill();ctx.restore()};
  // the giant hand of branches: four fingers on a ring of 38 round the point; out .00–.18, closing .18–.30, a knot .30–.85, crumbling .85–1
  N3.witch2Hand=(x,y,k,sc,o)=>{o=o||{};const s=sc||1,c=C(o.p2),out=ss(k/.18),cls=ss((k-.18)/.12),gone=ss((k-.85)/.15);if(gone>=1)return;
    ctx.save();ctx.globalAlpha*=1-gone;for(let i=0;i<4;i++){const an=-Math.PI*.15+i*Math.PI*.43*(o.side||1),bx=x+Math.cos(an)*38*s,by=y+Math.sin(an)*38*s*.55,
        tx=x+(bx-x)*(1-cls)*.9,ty=y-(60-16*cls)*s*out+(by-y)*(1-cls)*.9;
      ln(7*s);ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo((bx+tx)/2,by-30*s*out,tx,ty);ctx.stroke();ln(4.4*s,'#52301f');ctx.stroke();
      ctx.fillStyle='#efe3c8';ctx.beginPath();ctx.arc(tx,ty,2.2*s,0,TAU);ctx.fill()}ctx.restore()};
  // the bump running under the floor: a heave of earth with lifted chips and a glowing crack behind
  N3.witch2Bump=(x,y,a,k,sc,o)=>{o=o||{};const s=sc||1,st=o.stone||['#8f8670','#6a6250','#4a4436'];ctx.save();ctx.translate(x,y);
    ctx.strokeStyle=o.p2?'rgba(255,138,60,.8)':'rgba(123,240,192,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-Math.cos(a)*20*s,-Math.sin(a)*11*s);ctx.stroke();
    ctx.fillStyle='rgba(30,20,12,.55)';ctx.beginPath();ctx.ellipse(0,0,13*s,6*s,0,0,TAU);ctx.fill();
    for(let i=0;i<5;i++){const an=i/5*TAU+k*TAU,px=Math.cos(an)*9*s,py=Math.sin(an)*4*s-3-2*Math.sin(k*TAU*2+i);ln(1.2);ctx.fillStyle=st[i%3];ctx.beginPath();ctx.moveTo(px-3,py+1);ctx.lineTo(px,py-3);ctx.lineTo(px+3,py+1);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()};
  // a thorny root bursting out in arcs along a stretch of floor: out .00–.30 (a wave from the start), stays, back in .70–1; o.gaps under obstacles
  N3.witch2Root=(x0,y0,x1,y1,k,sc,o)=>{o=o||{};const len=Math.hypot(x1-x0,y1-y0);if(len<1)return;const a=Math.atan2(y1-y0,x1-x0),fr=k<.3?k/.3*len:len,h=14*(k<.7?1:1-(k-.7)/.3)*(o.w||1),c=C(o.p2),G0=o.gaps||[];
    if(h<=.2)return;ctx.save();ctx.translate(x0,y0);ctx.rotate(a);for(let d=0;d+30<fr;d+=40){if(G0.some(g=>d+30>g[0]&&d<g[1]))continue;
      ln(7*(o.w||1));ctx.beginPath();ctx.moveTo(d,0);ctx.quadraticCurveTo(d+20,-h*2,d+40,0);ctx.stroke();ln(4*(o.w||1),'#52301f');ctx.stroke();
      ctx.fillStyle='#efe3c8';ctx.beginPath();ctx.arc(d+20,-h,1.6,0,TAU);ctx.fill()}ctx.restore()};
  // the husk of bark left where she sank (second phase): whole .00–.60 (o.glow lights its cracks), breaks .60–.70, crumbles .70–1
  N3.witch2Husk=(x,y,face,k,sc,o)=>{o=o||{};const s=sc||1,gone=ss((k-.7)/.3),br=ss((k-.6)/.1);if(gone>=1)return;ctx.save();ctx.globalAlpha*=1-gone;ln(2.6);ctx.beginPath();ctx.moveTo(x-18*s,y);
    ctx.lineTo(x-7*s-br*6,y-70*s);ctx.lineTo(x+7*s+br*6,y-70*s);ctx.lineTo(x+18*s,y);ctx.closePath();ctx.fillStyle='#5a4e42';ctx.fill();ctx.stroke();
    if(o.glow){ctx.strokeStyle=`rgba(255,138,60,${o.glow})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y-8);ctx.lineTo(x+2,y-30);ctx.lineTo(x-3,y-52);ctx.stroke()}ctx.restore()};
  // the rootlets turning in the circle where she will come back up (k a cycle)
  N3.witch2Sprout=(x,y,k,sc,o)=>{o=o||{};const s=sc||1;for(let i=0;i<5;i++){const an=k*TAU+i/5*TAU,px=x+Math.cos(an)*24*s,py=y+Math.sin(an)*24*s*.55;ln(3);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+2,py-7);ctx.stroke();ln(1.6,o.p2?'#d0602a':'#5fae6c');ctx.stroke()}};
  // a falling leaf
  N3.witch2Leaf=(x,y,z,rot,sc,o)=>{o=o||{};const s=sc||1,c=o.dry?['#c49a64','#8a6a3e']:C(o.p2);ctx.save();ctx.translate(x,y-(z||0));ctx.rotate(rot||0);ln(1.2);ctx.beginPath();ctx.ellipse(0,0,4.2*s,2*s,0,0,TAU);
    ctx.fillStyle=c[0];ctx.fill();ctx.stroke();ctx.restore()}})();
