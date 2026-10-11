// =====================================================================
// THE WITCH'S SANCTUARY: an ancient floor swallowed by the forest. A ritual dais of stone in the middle with her sign
// (three roots knotted together) carved and glowing; thick roots coming out of the walls and breaking the slabs;
// glowing purple mushrooms, moss, flowers and fallen petals; the lights breathe while she lives
// =====================================================================
VARIANTS.radici.forEach(v=>{v.roots=0});
function bakeWitchFloor(){const c=fx,cx=AW/2,cy=TOP+(BOT-TOP)*.45,R0=101,ry=.62,lights=[];G.witchLights=lights;c.save();c.setTransform(2,0,0,2,0,0);c.lineCap='round';c.lineJoin='round';
  // the sanctuary is darker and violet at the edges
  {const g=c.createRadialGradient(cx,cy,60,cx,cy,Math.max(AW,AH)*.75);g.addColorStop(0,'rgba(20,10,30,0)');g.addColorStop(1,'rgba(20,8,32,.5)');c.fillStyle=g;c.fillRect(0,0,AW,AH)}
  // moss carpets in the corners and along the walls
  for(let i=0;i<70;i++){const edge=Math.random()<.7,x=edge?(Math.random()<.5?rand(L,L+70):rand(R-70,R)):rand(L,R),y=rand(TOP,BOT),r=rand(5,14);c.fillStyle=pk(['rgba(63,106,42,.55)','rgba(79,138,52,.5)','rgba(47,82,32,.6)']);c.beginPath();c.ellipse(x,y,r,r*.55,0,0,TAU);c.fill();c.fillStyle='rgba(140,200,90,.18)';c.beginPath();c.ellipse(x-r*.2,y-r*.2,r*.5,r*.25,0,0,TAU);c.fill()}
  // thick living roots: out of the walls, across the slabs, towards the dais
  const rubble=(sx,sy,w)=>{for(let i=0;i<5;i++){const a=rand(0,TAU),px=sx+Math.cos(a)*w*rand(.7,1.3),py=sy+Math.sin(a)*w*.55,s=rand(3,6.5);c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(px+1,py+2,s,s*.45,0,0,TAU);c.fill();c.fillStyle=pk(G.env.floor);c.beginPath();c.moveTo(px-s,py);c.lineTo(px-s*.3,py-s*.75);c.lineTo(px+s,py-s*.35);c.lineTo(px+s*.5,py+s*.45);c.closePath();c.fill();c.strokeStyle='#1b1612';c.lineWidth=1.1;c.stroke();c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(px-s*.3,py-s*.75);c.lineTo(px+s,py-s*.35);c.lineTo(px,py-s*.2);c.closePath();c.fill()}
    c.fillStyle='rgba(10,6,4,.75)';c.beginPath();c.ellipse(sx,sy+1,w*.75,w*.32,0,0,TAU);c.fill()};
  const root=(x0,y0,x1,y1,w)=>{const mx=(x0+x1)/2+rand(-50,50),my=(y0+y1)/2+rand(-30,30),N=44,P=[],ph=rand(0,9),len=Math.hypot(x1-x0,y1-y0);
    for(let i=0;i<=N;i++){const u=i/N,bx=(1-u)**2*x0+2*(1-u)*u*mx+u*u*x1,by=(1-u)**2*y0+2*(1-u)*u*my+u*u*y1,ux=(1-u)**2,dx=2*(1-u)*(mx-x0)+2*u*(x1-mx),dy=2*(1-u)*(my-y0)+2*u*(y1-my),dl=Math.hypot(dx,dy)||1,wig=Math.sin(u*len*.045+ph)*7*(1-u*.5);
      P.push([bx-dy/dl*wig,by+dx/dl*wig,w*(1-u*.72)])}
    // the root dives under the floor and comes back up: visible arcs
    const vis=u=>!(u>.34&&u<.42)&&!(u>.66&&u<.72);
    const seg=(from,to,fn)=>{for(let i=from+1;i<=to;i++)fn(P[i-1],P[i],i)};
    const runs=[];let st=null;for(let i=0;i<=N;i++){const v=vis(i/N);if(v&&st===null)st=i;if((!v||i===N)&&st!==null){runs.push([st,v?i:i-1]);st=null}}
    for(const[a0,a1] of runs){
      seg(a0,a1,(p0,p1)=>{c.strokeStyle='rgba(0,0,0,.38)';c.lineWidth=p1[2]+5;c.beginPath();c.moveTo(p0[0]+4,p0[1]+6);c.lineTo(p1[0]+4,p1[1]+6);c.stroke()});
      for(const[col,add,lift] of [['#1b1612',3.6,0],['#4a3424',0,0],['#5f4430',-.35,.12],['#7a5a3e',-.7,.24]])seg(a0,a1,(p0,p1)=>{c.strokeStyle=col;c.lineWidth=Math.max(1,p1[2]*(1+Math.min(0,add))+(add>0?add:0));c.beginPath();c.moveTo(p0[0],p0[1]-p0[2]*lift);c.lineTo(p1[0],p1[1]-p1[2]*lift);c.stroke()});
      // bark: grooves running along the root
      for(const off of [-.28,.05,.3]){c.strokeStyle='rgba(25,15,8,.5)';c.lineWidth=1;c.beginPath();seg(a0,a1,(p0,p1,i)=>{if(i===a0+1)c.moveTo(p0[0],p0[1]+p0[2]*off);if(i%3)c.lineTo(p1[0],p1[1]+p1[2]*off);else c.moveTo(p1[0],p1[1]+p1[2]*off)});c.stroke()}
      // moss on its back, little rootlets
      for(let i=a0+2;i<a1-1;i+=5){const[x,y,ww]=P[i];if(Math.random()<.7){c.fillStyle='#3f6a2a';c.beginPath();c.ellipse(x,y-ww*.3,ww*.5,ww*.2,0,0,TAU);c.fill();c.fillStyle='#6fa040';c.beginPath();c.ellipse(x-ww*.1,y-ww*.38,ww*.28,ww*.1,0,0,TAU);c.fill()}
        if(Math.random()<.45){const a=rand(0,TAU),l=rand(12,22);for(const[col,lw] of [['#1b1612',3.6],['#4a3424',1.8]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.6,y+Math.sin(a)*l*.3+4,x+Math.cos(a)*l,y+Math.sin(a)*l*.5);c.stroke()}}}
      // where it goes under or comes out, the slabs are broken
      if(a0>0)rubble(P[a0][0],P[a0][1],P[a0][2]);if(a1<N)rubble(P[a1][0],P[a1][1],P[a1][2])}
    rubble(P[2][0],P[2][1],P[2][2]*.9);return P};
  const ends=[[L-4,rand(TOP+40,TOP+160)],[R+4,rand(TOP+60,TOP+200)],[L-4,rand(BOT-260,BOT-120)],[R+4,rand(BOT-240,BOT-100)],[rand(L+40,cx-60),TOP-2],[rand(cx+60,R-40),TOP-2],[rand(L+60,R-60),BOT+2]];
  const roots=ends.map(([x,y])=>{const a=Math.atan2(cy-y,cx-x),d=Math.hypot(cx-x,(cy-y))-R0*1.05;return root(x,y,x+Math.cos(a)*d,y+Math.sin(a)*d*.9,rand(19,26))});
  // the ritual dais
  {c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx+3,cy+5,R0+8,(R0+8)*ry,0,0,TAU);c.fill();
    const g=c.createLinearGradient(0,cy-R0*ry,0,cy+R0*ry);g.addColorStop(0,'#6e7466');g.addColorStop(1,'#4a5046');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,R0+6,(R0+6)*ry,0,0,TAU);c.fill();c.strokeStyle='#1b1612';c.lineWidth=2.6;c.stroke();
    c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1.2;for(let k=0;k<16;k++){const a=k/16*TAU;c.beginPath();c.moveTo(cx+Math.cos(a)*(R0*.82),cy+Math.sin(a)*R0*.82*ry);c.lineTo(cx+Math.cos(a)*(R0+6),cy+Math.sin(a)*(R0+6)*ry);c.stroke()}
    c.fillStyle='#3a4038';c.beginPath();c.ellipse(cx,cy,R0*.8,R0*.8*ry,0,0,TAU);c.fill();c.strokeStyle='#1b1612';c.lineWidth=2;c.stroke();
    c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=1.4;c.beginPath();c.ellipse(cx,cy-1.5,R0+4,(R0+4)*ry,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
    // runes carved in the outer ring
    c.strokeStyle='rgba(20,10,30,.7)';c.lineWidth=1.8;for(let k=0;k<16;k++){const a=k/16*TAU+TAU/32,px=cx+Math.cos(a)*R0*.91,py=cy+Math.sin(a)*R0*.91*ry;c.save();c.translate(px,py);c.scale(1,ry);c.rotate(a+Math.PI/2);c.beginPath();const g2=k%4;
      if(g2===0){c.moveTo(-3,3);c.lineTo(0,-4);c.lineTo(3,3)}else if(g2===1){c.moveTo(0,-4);c.lineTo(0,4);c.moveTo(-3,-1);c.lineTo(3,1)}else if(g2===2){c.arc(0,0,3,0,Math.PI*1.5)}else{c.moveTo(-3,-3);c.lineTo(3,3);c.moveTo(3,-3);c.lineTo(-3,3)}c.stroke();c.restore();lights.push({x:px,y:py,r:7,rgb:'190,120,255',ph:k})}
    // her sign: three roots knotted together
    c.save();c.translate(cx,cy);c.scale(1,ry);for(let k=0;k<3;k++){const a=k/3*TAU-Math.PI/2;c.save();c.rotate(a);for(const[col,lw] of [['#1b1612',7],['#2a1f2e',4]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(R0*.55,-R0*.2,R0*.55,R0*.35,R0*.1,R0*.42);c.stroke()}c.restore()}
    c.strokeStyle='rgba(140,255,200,.55)';c.lineWidth=1.4;for(let k=0;k<3;k++){const a=k/3*TAU-Math.PI/2;c.save();c.rotate(a);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(R0*.55,-R0*.2,R0*.55,R0*.35,R0*.1,R0*.42);c.stroke();c.restore()}
    c.fillStyle='#1b1612';c.beginPath();c.arc(0,0,9,0,TAU);c.fill();c.fillStyle='#7bf0c0';c.beginPath();c.arc(0,0,4.5,0,TAU);c.fill();c.restore();lights.push({x:cx,y:cy,r:46,rgb:'120,240,190',ph:0,big:1})}
  // glowing mushrooms where the roots meet the floor, purple flowers and petals
  const shroom=(x,y,s)=>{for(let i=0;i<3;i++){const px=x+(i-1)*s*1.4+rand(-2,2),py=y+(i%2)*2,h=s*(1+(i===1)*.5);c.fillStyle='#e8dcc8';c.strokeStyle='#1b1612';c.lineWidth=1.2;c.beginPath();c.rect(px-1.2,py-h*1.2,2.4,h*1.2);c.fill();c.stroke();
    c.beginPath();c.ellipse(px,py-h*1.2,h*.85,h*.55,0,Math.PI,0);c.closePath();c.fillStyle=i%2?'#7a3ab0':'#9a5ad0';c.fill();c.stroke();c.fillStyle='#e8c8ff';for(const[dx,dy] of [[-.35,-.25],[.3,-.4],[0,-.15]]){c.beginPath();c.arc(px+dx*h,py-h*1.2+dy*h,.9,0,TAU);c.fill()}lights.push({x:px,y:py-h*1.2,r:12+h,rgb:'190,110,255',ph:rand(0,9)})}};
  for(const P of roots){const[x,y,w]=P[Math.floor(rand(8,20))];shroom(x+rand(-6,6),y+w*.6+4,rand(5,6.5))}
  for(let i=0;i<4;i++)shroom(rand(L+20,R-20),Math.random()<.5?rand(TOP+20,TOP+80):rand(BOT-80,BOT-20),rand(4.5,6));
  for(let i=0;i<26;i++){const x=rand(L+10,R-10),y=rand(TOP+10,BOT-10);if(Math.hypot(x-cx,(y-cy)/ry)<R0+10)continue;if(Math.random()<.5){c.fillStyle=pk(['#c48ae8','#e8a0d0','#a15ad0']);for(let k=0;k<5;k++){c.beginPath();c.arc(x+Math.cos(k*1.26)*2,y+Math.sin(k*1.26)*1.5,1.4,0,TAU);c.fill()}c.fillStyle='#ffd23c';c.beginPath();c.arc(x,y,.9,0,TAU);c.fill()}
    else{c.fillStyle=pk(['rgba(196,138,232,.75)','rgba(232,160,208,.7)']);c.beginPath();c.ellipse(x,y,2.4,1.2,rand(0,3),0,TAU);c.fill()}}
  c.restore()}
{const _mt=makeTufts;makeTufts=function(){_mt();if(G.witchLights&&G.tufts){const cx=AW/2,cy=TOP+(BOT-TOP)*.45;G.tufts=G.tufts.filter(t=>Math.hypot(t.x-cx,(t.y-cy)/.62)>112)}}}
{const _rf=renderFloor;renderFloor=function(){_rf();if(BOSS2&&themeOf(G.room)==='radici'&&G.variant&&G.variant.rune==='witch')bakeWitchFloor();else G.witchLights=null}}
{const _fg=drawFloorGlow;drawFloorGlow=function(){_fg();const W=BOSS2&&G.witchLights;if(!W)return;const t=G.t||0,p2=G.enemies&&G.enemies.some(e=>e.p2);ctx.save();ctx.globalCompositeOperation='lighter';
  for(const l of W){const a=l.big?.22+.1*Math.sin(t*1.4):.32+.22*Math.sin(t*2+l.ph);glow(p2&&!l.big?'255,140,60':l.rgb,l.x,l.y,l.r,a,l.big?l.r*.62:l.r*.7)}
  for(let k=0;k<5;k++)glow('130,70,180',AW/2+Math.sin(t*.3+k*1.3)*(AW*.35),TOP+(BOT-TOP)*(.2+k*.15)+Math.cos(t*.25+k)*20,90,.07,40);ctx.restore()}}

