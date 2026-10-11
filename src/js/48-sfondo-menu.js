// =====================================================================
// MENU BACKDROP: the boards float over the abyss of the beast. Night-blue depth, its ribs curling in from both sides,
// the skull watching from above with eyes of the current chapter's colour, mist drifting and lights rising
// =====================================================================
const MBG={t:0,st:null,key:'',drawn:false,motes:[]};
function drawMenuBg(dt){const cvb=$('mbgCv');if(!cvb||!cvb.clientWidth)return;const dpr=Math.min(2,window.devicePixelRatio||1),W=cvb.clientWidth,H=cvb.clientHeight;
  if(cvb.width!==Math.round(W*dpr)||cvb.height!==Math.round(H*dpr)){cvb.width=Math.round(W*dpr);cvb.height=Math.round(H*dpr)}
  const m=curMode(),rgb=m.glow||'120,220,90',key=W+'x'+H+'|'+rgb;MBG.t+=dt;const t=MBG.t,c=cvb.getContext('2d');
  if(MBG.key!==key){MBG.key=key;const st=document.createElement('canvas');st.width=cvb.width;st.height=cvb.height;const x=st.getContext('2d');x.scale(dpr,dpr);MBG.st=st;x.lineJoin='round';x.lineCap='round';
    let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0f2858');g.addColorStop(.45,'#0a1a3e');g.addColorStop(1,'#040a1a');x.fillStyle=g;x.fillRect(0,0,W,H);
    g=x.createRadialGradient(W/2,H*.2,0,W/2,H*.2,W*.8);g.addColorStop(0,`rgba(${rgb},.16)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(0,0,W,H);
    const sil='#0b1b40',rim='rgba(130,180,255,.28)';
    // ribs curling in from the edges
    for(let y=H*.18;y<H+40;y+=Math.max(70,H/8))for(const sd of [-1,1]){const x0=sd<0?-18:W+18,path=()=>{x.beginPath();x.moveTo(x0,y);x.quadraticCurveTo(x0-sd*W*.2,y-26,x0-sd*W*.24,y+46)};
      path();x.strokeStyle=sil;x.lineWidth=22;x.stroke();path();x.strokeStyle=rim;x.lineWidth=2;x.save();x.translate(0,-9);x.stroke();x.restore()}
    // the skull, high and far
    {const cx=W/2,cy=H*.24,s=Math.min(W,520)/360;x.save();x.translate(cx,cy);x.scale(s,s);
      for(const sd of [-1,1]){x.beginPath();x.moveTo(sd*80,-10);x.bezierCurveTo(sd*130,-20,sd*165,-30,sd*178,-72);x.strokeStyle=sil;x.lineWidth=20;x.stroke();x.strokeStyle=rim;x.lineWidth=2;x.save();x.translate(0,-8);x.stroke();x.restore()}
      x.beginPath();x.ellipse(0,0,100,60,0,0,TAU);x.fillStyle=sil;x.fill();x.strokeStyle=rim;x.lineWidth=2;x.beginPath();x.ellipse(0,0,100,60,0,Math.PI*1.08,Math.PI*1.92);x.stroke();
      x.fillStyle='#030814';for(const sd of [-1,1]){x.beginPath();x.ellipse(sd*40,6,24,18,sd*.25,0,TAU);x.fill()}x.beginPath();x.moveTo(0,24);x.lineTo(-8,38);x.lineTo(8,38);x.closePath();x.fill();
      x.restore()}
    // vignette
    g=x.createRadialGradient(W/2,H*.45,Math.min(W,H)*.35,W/2,H*.45,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=g;x.fillRect(0,0,W,H);
    MBG.motes=[...Array(26)].map((_,i)=>({x:Math.random(),y:Math.random(),v:.012+Math.random()*.02,ph:Math.random()*9,r:1+Math.random()*1.6}))}
  c.setTransform(1,0,0,1,0,0);c.drawImage(MBG.st,0,0);MBG.drawn=true;if(LOWFX)return;c.setTransform(dpr,0,0,dpr,0,0);
  const keep=ctx;ctx=c;try{c.globalCompositeOperation='lighter';
    // the skull's eyes
    const s=Math.min(W,520)/360,ep=.6+.4*Math.sin(t*1.5);for(const sd of [-1,1]){const ex=W/2+sd*40*s,ey=H*.24+6*s;glow(rgb,ex,ey,34*s,ep*.5);glow(rgb,ex,ey,11*s,ep);glow('255,255,255',ex,ey,4*s,ep*.9)}
    // mist drifting across
    for(let k=0;k<4;k++){const fx=((t*(6+k*3)+k*W*.37)%(W+300))-150,fy=H*(.35+k*.17);glow('120,170,255',fx,fy,150,.05,40)}
    // little lights rising out of the dark
    for(const p of MBG.motes){p.y-=p.v*dt;if(p.y<-.05){p.y=1.05;p.x=Math.random()}const px=p.x*W+Math.sin(t*.8+p.ph)*12,py=p.y*H,a=.35+.35*Math.sin(t*2+p.ph);glow(rgb,px,py,p.r*6,a*.5);glow('255,255,255',px,py,p.r,a)}
  }finally{ctx=keep;c.globalCompositeOperation='source-over'}}
