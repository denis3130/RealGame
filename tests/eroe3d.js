// Draws the Classic hero redone in 3D (sprite/eroe3d/disegno_eroe.js with the 3D bow of armi3d.js, the Arciere with the starting gear) into sheets:
// sprite/eroe3d/arciere_<move>.png + fogli.json. Run `python3 tests/mk.py` first. Usage: node tests/eroe3d.js
// Same format as the enemy sheets (tests/nemici.js): 8 rows (front, front-right, right, back-right, back, back-left, left, front-left),
// one frame per column, every frame drawn on its own canvas, one square cell for all the moves with the feet always in the same place.
// 'aim' has one frame per pull (0 = string at rest .. 1 = fully drawn), for the game's P.aiming; the other moves loop on p.
// The sheets have no effects (flying arrow, dust, speed lines): the game draws its own. With other gear the hero is drawn live.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'..','sprite','eroe3d'),MOSTRI=path.join(__dirname,'..','sprite','mostri');
const HERO={sc:1,K:3,W:96,anims:[['idle',10],['walk',8],['shoot',12],['aim',6],['dash',8],['hit',8]]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:50,introSeen:1,runs:3,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1000);
await p.evaluate(c=>__E(c),fs.readFileSync(path.join(MOSTRI,'disegno_mostri.js'),'utf8'));await p.evaluate(c=>__E(c),fs.readFileSync(path.join(OUT,'armi3d.js'),'utf8'));
await p.evaluate(c=>__E(c),fs.readFileSync(path.join(OUT,'disegno_eroe.js'),'utf8'));
await p.evaluate(()=>__E(`
const DIRS=[Math.PI/2,Math.PI/4,0,-Math.PI/4,-Math.PI/2,-3*Math.PI/4,Math.PI,3*Math.PI/4];
window.__frame=function(anim,k,n,r,o){const cv=document.createElement('canvas');cv.width=cv.height=o.W*o.K;const saved=ctx;ctx=cv.getContext('2d');ctx.scale(o.K,o.K);G.t=k*0.08+r*.37;ctx.save();
  try{const aim=anim==='aim';EROE.arciere(o.W/2,o.W*.7,DIRS[r],anim,aim?0:k/n,o.sc,{style:heroStyle('arciere'),noFx:true,pull:aim?k/(n-1):0})}finally{ctx.restore();ctx=saved}return cv};
window.__bbox=function(cv){const w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++){const row=y*w*4;for(let x=0;x<w;x++)if(d[row+x*4+3]>12){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}return[x0,y0,x1,y1]};
window.__sheets=function(o){let B=[1e9,1e9,-1,-1];const edge=[],BA={};
  for(const[a,n] of o.anims){let A=[1e9,1e9,-1,-1];for(let r=0;r<8;r++)for(let k=0;k<n;k++){const b=__bbox(__frame(a,k,n,r,o));A=[Math.min(A[0],b[0]),Math.min(A[1],b[1]),Math.max(A[2],b[2]),Math.max(A[3],b[3])];
    if(b[0]<=0||b[1]<=0||b[2]>=o.W*o.K-1||b[3]>=o.W*o.K-1)edge.push(a+' '+r+' '+k)}BA[a]=A;B=[Math.min(B[0],A[0]),Math.min(B[1],A[1]),Math.max(B[2],A[2]),Math.max(B[3],A[3])]}
  const pad=4,ax=o.W*o.K/2,ay=o.W*.7*o.K,half=Math.max(ax-B[0],B[2]-ax)+pad,hgt=B[3]-B[1]+pad*2;let cell=Math.ceil(Math.max(half*2,hgt));cell+=(6-cell%6)%6;
  const ox=Math.round(ax-cell/2),oy=Math.round(B[1]-pad-(cell-hgt)/2),out={cell,foot:[ax-ox,ay-oy],edge,sheets:{},view:{}};
  for(const[a] of o.anims){const A=BA[a],hf=Math.max(ax-A[0],A[2]-ax)+pad,hh=A[3]-A[1]+pad*2,sz=Math.min(cell,Math.ceil(Math.max(hf*2,hh)));
    let vx=ax-ox-sz/2,vy=A[1]-oy-pad-(sz-hh)/2;vx=Math.max(0,Math.min(cell-sz,vx));vy=Math.max(0,Math.min(cell-sz,vy));out.view[a]=[vx/cell,vy/cell,sz/cell].map(v=>+v.toFixed(4))}
  for(const[a,n] of o.anims){const S=document.createElement('canvas');S.width=cell*n;S.height=cell*8;const g=S.getContext('2d');
    for(let r=0;r<8;r++)for(let k=0;k<n;k++)g.drawImage(__frame(a,k,n,r,o),ox,oy,cell,cell,k*cell,r*cell,cell,cell);out.sheets[a]=S.toDataURL('image/png')}
  return out}`));
const r=await p.evaluate(o=>__E(`__sheets(${JSON.stringify(o)})`),HERO);
for(const[a,d] of Object.entries(r.sheets))fs.writeFileSync(path.join(OUT,`arciere_${a}.png`),Buffer.from(d.split(',')[1],'base64'));
const meta={arciere:{cell:r.cell,foot:r.foot.map(v=>+v.toFixed(1)),scale:HERO.K,size:HERO.sc,anims:Object.fromEntries(HERO.anims),view:r.view}};
fs.writeFileSync(path.join(OUT,'fogli.json'),JSON.stringify(meta,null,1));
console.log('arciere casella',r.cell,'piedi',r.foot,r.edge.length?'TOCCA IL BORDO: '+r.edge.slice(0,4).join(', '):'');
console.log('ERRORS',errs.slice(0,5));await b.close()})();
