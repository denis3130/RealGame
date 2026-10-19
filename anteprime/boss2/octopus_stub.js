// A pretend model for the brain's tests while the new model is not there yet: the Octopus of today plays every move of the new one, with
// the lengths of the design (anteprime/mk_boss2.py octopus --stub; docs/boss-classici-design/octopus.md, «MODELLO FINTO»). Each boss has
// one like this: anteprime/boss2/<type>_stub.js. Stuck is her idle, the double slam her slam, the cage her prep, sinking, swimming and
// rising are pieces of her dive, the Black Tide her whirl, the rage her hit (the colours turn halfway). It also gives the pieces the brain
// asks the model for, with the signatures of the design (N3.octopus2Arm, the arm out of the floor of the cage; N3.octopus2Pad, the lily
// pad of the Black Tide; N3.octopus2Blob, the ink ball in flight), as simple shapes with the moments of the design, and N3.octopus2Info
// (the moments of the moves the brain reads).
(()=>{const map={stuck:'idle',slam2:'slam',cage:'prep',tide:'whirl',rage:'hit'};
  const og=N3.octopus,OM=N3.meta.octopus,cl=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2,INK0='#1b1612';
  N3.octopus2=(x,y,f,a,p,sc,o)=>{o=o||{};let an=map[a]||a,pp=p,p2=!!o.p2;
    if(a==='sink'){an='dive';pp=p*.32}else if(a==='swim'){an='dive';pp=.5}else if(a==='rise'){an='dive';pp=.66+p*.34}
    if(a==='enter')p2=false;else if(a==='rage')p2=p>.5;
    return og(x,y,f,OM.an.includes(an)?an:'idle',cl(pp,0,.999),sc,{p2,noFx:o.noFx,noWater:o.noWater,z:o.z})};
  N3.meta.octopus2={n:'La Piovra della Palude',g:'boss',sc:1,
    an:['idle','walk','hit','slam','stuck','slam2','ink','cage','whirl','sink','swim','rise','tide','rage','taunt','enter','die'],
    dur:{idle:3,walk:1.2,hit:.6,slam:1.8,stuck:1.4,slam2:2.6,ink:1.6,cage:2.2,whirl:2.8,sink:.9,swim:.8,rise:1.6,tide:3.2,rage:2.8,taunt:1.1,enter:3.4,die:4},
    lab:{idle:'Ferma',walk:'Scivola',hit:'Colpita',slam:'Tentacolata',stuck:'Ventose attaccate',slam2:'Doppia tentacolata',ink:"Pioggia d'inchiostro",cage:'Gabbia degli abissi',
      whirl:'Gorgo',sink:'Si immerge',swim:"Sott'acqua",rise:'Agguato',tide:'Marea Nera',rage:'Furia',taunt:'Presa in giro',enter:'Entrata',die:'Sconfitta'}};
  N3.order.push('octopus2');
  // the moments of the design: the blows, the pops of the suckers, the shots of the ink, the cage (centre, out, whip, down), the rise, the
  // tide, when she goes under in the sink, the whirl (lamp, damage from, damage to, the undertow)
  N3.octopus2Info={slam:.6,splash:.66,pops:[.2,.29,.38,.47,.56,.65,.74,.83],stuck:.15,slam2:[.45,.85],ink3:[.4,.47,.54],ink5:[.36,.42,.48,.54,.6],
    cage:[.25,.715,.88,.925],sink:.5,rise:.63,riseAir:.75,tide:.55,whirl:[.15,.36,.85,.88]};
  const SK=p2=>p2?['#45aebd','#1d6a80','#0b3448']:['#58bdb0','#1d8080','#0c4552'],LIT=p2=>p2?'#ff7ae0':'#8ffbe9';
  // one of her arms out of the floor (the cage): x, y the point on the floor, a the face it whips to (V(a)), k 0..1: boils (to .62), bursts
  // out and rises (.62-.68), stands (.68-.84), whips (.84-.90), goes back down (.90-1)
  N3.octopus2Arm=(x,y,k,a,sc,o)=>{o=o||{};const s=sc||1,p2=!!o.p2,C=SK(p2),t=G&&G.t||0;ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    const R=14*cl(k/.4,0,1);ctx.fillStyle=o.ink?'rgba(40,22,64,.8)':'rgba(10,34,38,.75)';ctx.beginPath();ctx.ellipse(0,0,R,R*.55,0,0,TAU);ctx.fill();
    if(k<.62){if(!LOWFX)for(let i=0;i<4;i++){const u=(t*1.7+i*.27)%1;ctx.strokeStyle=`rgba(200,240,230,${.7*(1-u)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(Math.sin(i*2.1)*R*.5,-u*6+Math.cos(i*1.3)*2,1.5+u*2,0,TAU);ctx.stroke()}
      ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1;for(let i=0;i<5;i++){const an=i*1.26+.3;ctx.beginPath();ctx.moveTo(Math.cos(an)*R*.8,Math.sin(an)*R*.45);ctx.lineTo(Math.cos(an)*(R+6),Math.sin(an)*(R+6)*.55);ctx.stroke()}}
    else{ctx.strokeStyle='#3e4033';ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(0,0,15,8,0,0,TAU);ctx.stroke();ctx.fillStyle=o.ink?'rgba(70,40,110,.6)':'rgba(30,70,70,.6)';ctx.beginPath();ctx.ellipse(0,0,11,6,0,0,TAU);ctx.fill()}
    const h=k<.62?0:k<.68?54*(k-.62)/.06:k<.9?54:54*(1-(k-.9)/.1);
    if(h>1){const dir=Math.atan2(Math.sin(a)*.55,Math.cos(a)),bend=k>=.84&&k<.9?1.31*(k-.84)/.06:k>=.9?1.31*(1-(k-.9)/.1):.15*Math.sin(t*3+(o.seed||0)),n=8,pts=[];let px=0,py=0;
      for(let i=0;i<=n;i++){pts.push([px,py,9-7*i/n]);const th=bend*(i/n),st=h/n;px+=Math.sin(th)*Math.cos(dir)*st;py+=-Math.cos(th)*st+Math.sin(th)*Math.sin(dir)*.55*st}
      const Lf=[],Rt=[];for(let i=0;i<=n;i++){const q=pts[i],q2=pts[Math.min(n,i+1)],q1=pts[Math.max(0,i-1)],dx=q2[0]-q1[0],dy=q2[1]-q1[1],l=Math.hypot(dx,dy)||1;Lf.push([q[0]-dy/l*q[2],q[1]+dx/l*q[2]]);Rt.push([q[0]+dy/l*q[2],q[1]-dx/l*q[2]])}
      ctx.beginPath();Lf.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=Rt.length-1;i>=0;i--)ctx.lineTo(Rt[i][0],Rt[i][1]);ctx.closePath();
      const g=ctx.createLinearGradient(-9,0,9,0);g.addColorStop(0,C[0]);g.addColorStop(.5,C[1]);g.addColorStop(1,C[2]);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=INK0;ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle=LIT(p2);for(let i=1;i<n;i+=2){ctx.beginPath();ctx.arc(Rt[i][0]*.7+pts[i][0]*.3,Rt[i][1]*.7+pts[i][1]*.3,1.8,0,TAU);ctx.fill()}}
    ctx.restore()};
  // the lily pad of the Black Tide (radius 20): k 0..1 pops up (to .12), floats (to .85), sinks; o.lift the wave lifting it toward o.wa,
  // o.on the hero on it (the rim shines more)
  N3.octopus2Pad=(x,y,k,sc,o)=>{o=o||{};const s=sc||1,up=cl(k/.12,0,1),dn=cl((k-.85)/.15,0,1),r=20*s*(.5+.5*up)*(1-.25*dn),lift=(o.lift||0)*6*s,bob=k>=.12&&k<.85?Math.sin((G&&G.t||0)*2.4)*1.5:0;
    if(up<=0)return;ctx.save();ctx.globalAlpha*=up*(1-dn*.9);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+2,r,r*.5,0,0,TAU);ctx.fill();
    ctx.translate(x,y-lift-bob+dn*4);const tl=(o.lift||0)*.15;ctx.rotate(Math.cos(o.wa||0)*tl);
    if(!LOWFX){ctx.save();ctx.globalCompositeOperation='lighter';glow('200,255,170',0,0,r*1.3,o.on?.5:.25,r*.7);ctx.restore()}
    ctx.beginPath();ctx.ellipse(0,0,r,r*.55,0,.35,TAU-.35);ctx.lineTo(0,0);ctx.closePath();ctx.fillStyle='#4f8a34';ctx.fill();ctx.strokeStyle=INK0;ctx.lineWidth=1.8;ctx.stroke();
    ctx.strokeStyle=o.on?'rgba(220,255,190,.95)':'rgba(200,255,170,.7)';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,0,r-2,r*.55-1.5,0,.45,TAU-.45);ctx.stroke();
    ctx.fillStyle='#ff9ad8';for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(Math.cos(i*1.05)*3.5,-3+Math.sin(i*1.05)*1.8,3,1.6,i*1.05,0,TAU);ctx.fill()}ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.arc(0,-3,1.6,0,TAU);ctx.fill();
    ctx.restore()};
  // the ink ball in flight: x, y its point on the floor, z its height, k 0..1 along the flight (it rolls)
  N3.octopus2Blob=(x,y,z,k,sc,o)=>{o=o||{};const s=(sc||1)*7,yy=y-(z||0),an=k*TAU*1.5;ctx.save();ctx.translate(x,yy);ctx.rotate(an);
    ctx.fillStyle='rgba(42,31,64,.7)';for(const d of[1,2]){ctx.beginPath();ctx.arc(-s*(.9+.7*d),s*.2*d,s*.22/d+1,0,TAU);ctx.fill()}
    ctx.beginPath();ctx.ellipse(0,0,s,s*.9,0,0,TAU);ctx.fillStyle='#2a1f40';ctx.fill();ctx.strokeStyle=INK0;ctx.lineWidth=1.6;ctx.stroke();
    ctx.fillStyle=o.p2?'#ff7ad0':'#b9a6e8';ctx.beginPath();ctx.ellipse(-s*.3,-s*.35,s*.35,s*.2,-.4,0,TAU);ctx.fill();ctx.strokeStyle='rgba(140,250,232,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,s*.7,.4,1.6);ctx.stroke();
    ctx.restore()}})();
