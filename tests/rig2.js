// Proposal for the new humanoid rig (NOT in the game yet: Denis must approve the four directions first).
// Every part has a fixed point on the body (x = character's left/right, y = height, z = forward) and is turned
// with the character, so nothing can drift away from where it belongs when the facing changes.
// Loaded into the game page by rig2sheet.js through window.__E, so it can use ctx, ink, fs, circ, ell, INK, TAU.
global.__RIG2 = `
window.rig2=function(x,y,face,walk,moving,S,o){o=o||{};
  const yaw=Math.PI/2-face,cs=Math.cos(yaw),sn=Math.sin(yaw);
  const pr=(px,py,pz)=>[px*cs+pz*sn,py,-px*sn+pz*cs];            // -> screen x, screen y, depth (>0 = towards us)
  const w=moving?Math.sin(walk):0,bob=moving?Math.abs(Math.sin(walk))*1.8:0,sc=S.sc||1;
  const D=[];const add=(z,f)=>D.push({z,f});
  const OL=3;                                                    // thick dark outline, Clash Royale style
  const shade=(col,amt)=>{const n=parseInt(col.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,k=v=>Math.max(0,Math.min(255,Math.round(v+amt*(amt>0?255-v:v))));return 'rgb('+k(r)+','+k(g)+','+k(b)+')'};
  const lit=(fn,col)=>{fn();ctx.fillStyle=col;ctx.fill();ctx.save();fn();ctx.clip();ctx.fillStyle='rgba(0,0,0,.2)';fn();ctx.translate(0,0);ctx.fillRect(-40,2,80,40);ctx.restore();ctx.save();fn();ctx.clip();ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(-3,-6,7,4,-.4,0,TAU);ctx.fill();ctx.restore();ctx.lineWidth=OL;ctx.strokeStyle=INK;fn();ctx.stroke()};
  const HY=-21,HR=11.5;                                          // head centre and radius
  // ---- feet (always first: they stand on the ground)
  const feet=[[-4.5,w*4],[4.5,-w*4]].map(([fx,fz])=>pr(fx,8,fz)).sort((a,b)=>a[2]-b[2]);
  // ---- torso
  const bw=8.5+2.5*Math.abs(cs);
  const torso=()=>{ctx.beginPath();ctx.moveTo(-bw,5);ctx.quadraticCurveTo(-bw-2.5,-10,0,-12.5);ctx.quadraticCurveTo(bw+2.5,-10,bw,5);ctx.quadraticCurveTo(0,10,-bw,5);ctx.closePath()};
  add(0,()=>{lit(torso,S.body);
    if(S.belt){ctx.save();torso();ctx.clip();ctx.fillStyle=S.belt;ctx.fillRect(-20,-1,40,3.5);ctx.restore();const b=pr(0,0,bw*.9);if(b[2]>1){ctx.fillStyle='#ffc93c';ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.rect(b[0]-2,-1.5,4,4.5);ctx.fill();ctx.stroke()}}
    if(S.ribs){const c=pr(0,0,bw);if(c[2]>0){ctx.strokeStyle='rgba(27,22,18,.55)';ctx.lineWidth=1.6;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(c[0]-bw*.5*Math.abs(cs)-1,-8+i*3.5);ctx.lineTo(c[0]+bw*.5*Math.abs(cs)+1,-8+i*3.5);ctx.stroke()}}}
    const n=pr(0,-11,bw*.7);if(n[2]>2&&!S.skull){ctx.fillStyle=S.hood;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(n[0]-5*Math.abs(cs)-1.5,-12);ctx.lineTo(n[0],-6);ctx.lineTo(n[0]+5*Math.abs(cs)+1.5,-12);ctx.closePath();ctx.fill();ctx.stroke()}});
  // ---- quiver on the back, arrows over the right shoulder
  if(S.quiver){const q=pr(1.5,-2,-bw+1),tip=pr(-4.5,-15,-bw+1);add(-cs-.2,()=>{ctx.save();ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(tip[0],tip[1]+3);ctx.stroke();ctx.strokeStyle='#7a5230';ctx.lineWidth=4.6;ctx.stroke();ctx.strokeStyle='#ffc93c';ctx.lineWidth=1.6;ctx.beginPath();const mx=(q[0]+tip[0])/2,my=(q[1]+tip[1]+3)/2;ctx.moveTo(mx-2.5,my-1);ctx.lineTo(mx+2.5,my+1);ctx.stroke();
    for(const d of[-2,0,2]){ctx.fillStyle='#f6ead2';ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(tip[0]+d-1.6,tip[1]+1);ctx.lineTo(tip[0]+d,tip[1]-5);ctx.lineTo(tip[0]+d+1.6,tip[1]+1);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()})}
  // ---- ponytail / hood tip / cape bits hanging on the back of the head
  if(S.ponytail){const a=pr(0,HY-2,-HR+1),b=pr(0,HY+12,-HR-5);add(a[2]-.5,()=>{ctx.beginPath();ctx.moveTo(a[0]-4,a[1]);ctx.quadraticCurveTo(b[0]-6,b[1]-6,b[0],b[1]);ctx.quadraticCurveTo(b[0]+6,b[1]-6,a[0]+4,a[1]);ctx.closePath();ctx.fillStyle=S.hair;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=INK;ctx.stroke()})}
  // ---- arms and what the hands hold
  const H=S.held,pull=o.pull||0;
  const hands=H==='bow'?{L:[7,-5,10],R:pull?[3,-6,5-pull*.6]:null}:H==='xbow'?{L:[4,-5,10],R:[-4,-5,7]}:H==='staff'?{L:null,R:[-8,-4,6]}:H==='sword'?{L:null,R:[-8,-3,5]}:{L:null,R:null};
  const restL=[9.5,-1,1],restR=[-9.5,-1,1];
  for(const side of['L','R']){const sh=pr(side==='L'?8:-8,-8,0),hd=pr(...(hands[side]||(side==='L'?restL:restR)).map((v,i)=>i===2&&!hands[side]?v+(side==='L'?-w*3:w*3):v));
    add((sh[2]+hd[2])/2+.01,()=>{ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=8.5;ctx.beginPath();ctx.moveTo(sh[0],sh[1]);ctx.lineTo(hd[0],hd[1]);ctx.stroke();ctx.strokeStyle=S.sleeve||shade(S.body,-.15);ctx.lineWidth=5;ctx.stroke();
      ctx.fillStyle=S.skull?S.skin:S.glove||S.skin;ctx.strokeStyle=INK;ctx.lineWidth=2.5;circ(hd[0],hd[1],3.4);ctx.fill();ctx.stroke()})}
  if(H==='bow'){const g=pr(7,-5,10),top=pr(7,-18,7.5),bot=pr(7,8,7.5),str=hands.R?pr(...hands.R):null;
    add(g[2]+.02,()=>{ctx.lineCap='round';const bend=(Math.abs(sn)<.3?5:6*Math.abs(sn))*(sn>=0?1:-1)*(cs<-.3?-1:1);ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(top[0],top[1]);ctx.quadraticCurveTo(g[0]+bend*1.6,g[1],bot[0],bot[1]);ctx.stroke();ctx.strokeStyle=S.bowCol||'#a4703d';ctx.lineWidth=3.2;ctx.stroke();
      ctx.strokeStyle='#f6ead2';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(top[0],top[1]);if(str)ctx.lineTo(str[0],str[1]);ctx.lineTo(bot[0],bot[1]);ctx.stroke();ctx.fillStyle=S.glove||S.skin;ctx.strokeStyle=INK;ctx.lineWidth=2.5;circ(g[0],g[1],3.4);ctx.fill();ctx.stroke()})}
  if(H==='xbow'){const s0=pr(0,-5,3),s1=pr(0,-5,16),lA=pr(-9,-5,13),lB=pr(9,-5,13);
    add(s1[2]+.02,()=>{ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=6.5;ctx.beginPath();ctx.moveTo(s0[0],s0[1]);ctx.lineTo(s1[0],s1[1]);ctx.stroke();ctx.strokeStyle=S.bowCol||'#6b4a2a';ctx.lineWidth=3.5;ctx.stroke();
      ctx.strokeStyle=INK;ctx.lineWidth=5.5;ctx.beginPath();ctx.moveTo(lA[0],lA[1]+1);ctx.quadraticCurveTo(s1[0],s1[1]-3,lB[0],lB[1]+1);ctx.stroke();ctx.strokeStyle='#a7b0ba';ctx.lineWidth=2.8;ctx.stroke();
      ctx.strokeStyle='#f6ead2';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(lA[0],lA[1]+1);ctx.lineTo(s0[0]+(s1[0]-s0[0])*(.35-pull*.03),s0[1]);ctx.lineTo(lB[0],lB[1]+1);ctx.stroke();
      for(const hd of[pr(...hands.L),pr(...hands.R)]){ctx.fillStyle=S.skull?S.skin:S.glove||S.skin;ctx.strokeStyle=INK;ctx.lineWidth=2.5;circ(hd[0],hd[1],3.4);ctx.fill();ctx.stroke()}})}
  if(H==='staff'){const hd=pr(-8,-4,6),top=pr(-8,-27,6),bot=pr(-8,9,6);
    add(hd[2]+.02,()=>{ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(bot[0],bot[1]);ctx.lineTo(top[0],top[1]);ctx.stroke();ctx.strokeStyle='#6b4a2a';ctx.lineWidth=3;ctx.stroke();
      ctx.save();ctx.globalCompositeOperation='lighter';glow('150,255,120',top[0],top[1]-2,12,.45);ctx.restore();ctx.fillStyle=S.eyeCol||'#9fff7a';ctx.strokeStyle=INK;ctx.lineWidth=2.5;circ(top[0],top[1]-2,4.2);ctx.fill();ctx.stroke();
      ctx.fillStyle=S.glove||S.skin;circ(hd[0],hd[1],3.4);ctx.fill();ctx.stroke()})}
  if(H==='sword'){const hd=pr(-8,-3,5),tip=pr(-8,-24,10);
    add(hd[2]+.02,()=>{ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(hd[0],hd[1]);ctx.lineTo(tip[0],tip[1]);ctx.stroke();ctx.strokeStyle='#dfe4ea';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=S.skin;ctx.strokeStyle=INK;ctx.lineWidth=2.5;circ(hd[0],hd[1],3.4);ctx.fill();ctx.stroke()})}
  if(S.shield){const c=pr(10,-4,5),rx=2.5+6.5*Math.abs(cs);add(c[2]+.03,()=>{ctx.fillStyle='#8a5a32';ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(c[0],c[1],rx,8.5,0,0,TAU);ctx.fill();ctx.stroke();
    if(rx>4){ctx.strokeStyle='#a7b0ba';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(c[0],c[1],rx-2.4,6,0,0,TAU);ctx.stroke();ctx.fillStyle='#c9cfd6';ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(c[0],c[1],Math.max(1,rx*.3),2.4,0,0,TAU);ctx.fill();ctx.stroke()}})}
  // ---- head: always drawn over the torso; face, ears, antlers and helmet are fixed points on it
  add(.5,()=>{
    if(S.ears){for(const s of[-1,1]){const a=pr(s*9,HY,0),t=pr(s*20,HY-7,-2);ctx.beginPath();ctx.moveTo(a[0],a[1]-4);ctx.lineTo(t[0],t[1]);ctx.lineTo(a[0],a[1]+4);ctx.closePath();ctx.fillStyle=S.skin;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=INK;ctx.stroke();ctx.fillStyle=shade(S.skin,-.2);ctx.beginPath();ctx.moveTo(a[0],a[1]-1.5);ctx.lineTo(a[0]+(t[0]-a[0])*.6,a[1]+(t[1]-a[1])*.6);ctx.lineTo(a[0],a[1]+2);ctx.fill()}}
    if(S.antlers)for(const s of[-1,1]){const a=pr(s*6,HY-8,-1),b=pr(s*11,HY-20,-2),c=pr(s*16,HY-25,-3),d=pr(s*6,HY-24,-1);ctx.lineCap='round';
      for(const[lw,col]of[[5.5,INK],[2.8,'#d8b27a']]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.moveTo(b[0]+(a[0]-b[0])*.3,b[1]+(a[1]-b[1])*.3);ctx.lineTo(d[0],d[1]);ctx.stroke()}}
    const hc=()=>{ctx.beginPath();ctx.arc(0,HY,HR,0,TAU)};
    lit(hc,S.skull?S.skin:S.hood);
    const f=pr(0,HY+2,HR*.62);                                   // centre of the face
    if(S.skull){if(f[2]>-2){const k=Math.abs(cs);ctx.fillStyle=INK;for(const s of[-1,1]){const e=pr(s*3.8,HY+1,HR*.85);if(e[2]>1){ctx.beginPath();ctx.ellipse(e[0],e[1],2.9*(.5+.5*k),3.4,0,0,TAU);ctx.fill();ctx.fillStyle=S.eyeCol||'#e5484d';circ(e[0],e[1]+.5,1.2);ctx.fill();ctx.fillStyle=INK}}
        const m=pr(0,HY+7,HR*.8);if(m[2]>2){ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(m[0]-4*k-1,m[1]);ctx.lineTo(m[0]+4*k+1,m[1]);for(let i=-1;i<=1;i++){ctx.moveTo(m[0]+i*2.4*k,m[1]-1.6);ctx.lineTo(m[0]+i*2.4*k,m[1]+1.6)}ctx.stroke()}}
      else{const c=pr(0,HY-5,-HR*.7);ctx.strokeStyle='rgba(27,22,18,.45)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(c[0]-2,c[1]-3);ctx.lineTo(c[0]+1,c[1]+1);ctx.lineTo(c[0]-1,c[1]+4);ctx.stroke()}}
    else if(f[2]>-3){const k=Math.max(.35,Math.abs(cs));ctx.save();hc();ctx.clip();ctx.fillStyle=S.skin;ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(f[0],f[1],7.5*k+.5,7.2,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
      if(S.hair&&!S.helm){const hh=pr(0,HY-6,HR*.55);if(hh[2]>0){ctx.fillStyle=S.hair;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(hh[0],hh[1]+1,6.5*k+.5,2.6,0,Math.PI,TAU);ctx.fill();ctx.stroke()}}
      for(const s of[-1,1]){const e=pr(s*3.2,HY+1.5,HR*.9);if(e[2]>2.5){ctx.fillStyle='#fff';ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(e[0],e[1],2.2*(.55+.45*k),2.7,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=S.eyeCol&&S.eyeCol!==INK?S.eyeCol:'#2a1a12';circ(e[0]+sn*.6,e[1]+.4,1.4);ctx.fill();ctx.fillStyle='#fff';circ(e[0]+sn*.6-.5,e[1]-.4,.55);ctx.fill()}}
      const m=pr(0,HY+6,HR*.85);if(m[2]>3){ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(m[0],m[1]-1.2,1.8,.3,Math.PI-.3);ctx.stroke()}
      const ck=pr(0,HY+4,HR*.8);if(ck[2]>2){ctx.fillStyle='rgba(255,120,120,.35)';for(const s of[-1,1]){const c=pr(s*5,HY+4.5,HR*.75);if(c[2]>2){ctx.beginPath();ctx.ellipse(c[0],c[1],1.6,1,0,0,TAU);ctx.fill()}}}
      if(o.moss){const ms=pr(1.5,HY+6,HR*.95),me=pr(1.5+7,HY+8,HR*.95+4);if(ms[2]>2){ctx.lineCap='round';ctx.strokeStyle=INK;ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(ms[0],ms[1]);ctx.lineTo(me[0],me[1]);ctx.stroke();ctx.strokeStyle='#8cff4a';ctx.lineWidth=2.4;ctx.stroke()}}}
    if(S.helm){ctx.save();hc();ctx.clip();ctx.fillStyle='#9aa3ad';ctx.fillRect(-20,HY-20,40,17);ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(-8,HY-12,6,4);ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-HR-1,HY-3);ctx.lineTo(HR+1,HY-3);ctx.stroke();hc();ctx.lineWidth=OL;ctx.stroke()}
    if(S.hoodTip&&!S.antlers){const a=pr(0,HY-HR+2,-3),t=pr(0,HY-HR-7,-9);ctx.beginPath();ctx.moveTo(a[0]-4,a[1]+1);ctx.lineTo(t[0],t[1]);ctx.lineTo(a[0]+4,a[1]+1);ctx.closePath();ctx.fillStyle=S.hood;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=INK;ctx.stroke()}
    if(S.crown){for(const s of[-1,1]){const a=pr(s*5,HY-9,0),t=pr(s*9,HY-17,0);ctx.beginPath();ctx.moveTo(a[0]-2.5,a[1]);ctx.lineTo(t[0],t[1]);ctx.lineTo(a[0]+2.5,a[1]);ctx.closePath();ctx.fillStyle='#ffc93c';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.stroke()}}});
  // ---- draw: ground shadow, feet, then everything back to front
  ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,9*sc,14*sc,5*sc,0,0,TAU);ctx.fill();ctx.translate(0,-bob);ctx.scale(sc,sc);ctx.lineJoin='round';
  for(const ft of feet){ctx.fillStyle=S.foot||'#4a3626';ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(ft[0],ft[1],4.2,3.4,0,0,TAU);ctx.fill();ctx.stroke()}
  D.sort((a,b)=>a.z-b.z);for(const d of D)d.f();
  ctx.restore()};
`;
