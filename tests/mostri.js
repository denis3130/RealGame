// Draws the zombie-mode monsters (sprite/mostri/disegno_mostri.js) into sprite sheets: sprite/mostri/<monster>_<move>.png + fogli.json.
// Run `python3 tests/mk.py` first. Usage: node tests/mostri.js [monster ...]   (no names = all of them)
// Every frame is drawn on its own canvas, so nothing bleeds into the next cell. All frames of a monster share one square cell:
// the union of every frame's bounding box, with the foot point always in the same place, so nothing is cut and nothing jumps.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'..','sprite','mostri');
const CRE={
  zombie:{sc:1.1,K:3,W:150,anims:[['idle',6],['walk',8],['attack',8]]},
  strisciante:{sc:1.1,K:3,W:150,anims:[['idle',6],['walk',8],['attack',8]]},
  minatore:{sc:1.1,K:3,W:150,anims:[['idle',8],['walk',12],['attack',14]]},
  hound:{sc:1.05,K:3,W:150,anims:[['idle',8],['walk',12],['attack',14]]},
  becchino:{sc:1.9,K:2,W:330,anims:[['idle',6],['walk',8],['slam',10],['summon',10]]},
  lanterna:{sc:1.55,K:3,W:220,anims:[['idle',8],['walk',12],['attack',14]]}};
(async()=>{const only=process.argv.slice(2),kinds=Object.keys(CRE).filter(k=>!only.length||only.includes(k));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:50,introSeen:1,runs:3,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1000);
await p.evaluate(c=>__E(c),fs.readFileSync(path.join(OUT,'disegno_mostri.js'),'utf8'));
await p.evaluate(()=>__E(`
const DIRS=[Math.PI/2,Math.PI/4,0,-Math.PI/4,-Math.PI/2,-3*Math.PI/4,Math.PI,3*Math.PI/4];
window.__frame=function(kind,anim,k,n,r,o){const cv=document.createElement('canvas');cv.width=cv.height=o.W*o.K;const saved=ctx;ctx=cv.getContext('2d');ctx.scale(o.K,o.K);G.t=k*0.08+r*.37;ctx.save();
  try{CR[kind](o.W/2,o.W*.66,DIRS[r],anim,k/n,o.sc)}finally{ctx.restore();ctx=saved}return cv};
window.__bbox=function(cv){const w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++){const row=y*w*4;for(let x=0;x<w;x++)if(d[row+x*4+3]>12){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}return[x0,y0,x1,y1]};
window.__sheets=function(kind,o){let B=[1e9,1e9,-1,-1];const edge=[],BA={};
  for(const[a,n] of o.anims){let A=[1e9,1e9,-1,-1];for(let r=0;r<8;r++)for(let k=0;k<n;k++){const b=__bbox(__frame(kind,a,k,n,r,o));A=[Math.min(A[0],b[0]),Math.min(A[1],b[1]),Math.max(A[2],b[2]),Math.max(A[3],b[3])];
    if(b[0]<=0||b[1]<=0||b[2]>=o.W*o.K-1||b[3]>=o.W*o.K-1)edge.push(a+' '+r+' '+k)}BA[a]=A;B=[Math.min(B[0],A[0]),Math.min(B[1],A[1]),Math.max(B[2],A[2]),Math.max(B[3],A[3])]}
  const pad=4,ax=o.W*o.K/2,ay=o.W*.66*o.K,half=Math.max(ax-B[0],B[2]-ax)+pad,hgt=B[3]-B[1]+pad*2;let cell=Math.ceil(Math.max(half*2,hgt));cell+=(6-cell%6)%6;
  const ox=Math.round(ax-cell/2),oy=Math.round(B[1]-pad-(cell-hgt)/2),out={cell,foot:[ax-ox,ay-oy],edge,sheets:{},view:{}};
  // a tighter square per move (fractions of the cell), centred on the feet, for previews that want the monster bigger
  for(const[a] of o.anims){const A=BA[a],hf=Math.max(ax-A[0],A[2]-ax)+pad,hh=A[3]-A[1]+pad*2,sz=Math.min(cell,Math.ceil(Math.max(hf*2,hh)));
    let vx=ax-ox-sz/2,vy=A[1]-oy-pad-(sz-hh)/2;vx=Math.max(0,Math.min(cell-sz,vx));vy=Math.max(0,Math.min(cell-sz,vy));out.view[a]=[vx/cell,vy/cell,sz/cell].map(v=>+v.toFixed(4))}
  for(const[a,n] of o.anims){const S=document.createElement('canvas');S.width=cell*n;S.height=cell*8;const g=S.getContext('2d');
    for(let r=0;r<8;r++)for(let k=0;k<n;k++)g.drawImage(__frame(kind,a,k,n,r,o),ox,oy,cell,cell,k*cell,r*cell,cell,cell);out.sheets[a]=S.toDataURL('image/png')}
  return out}`));
let meta={};try{meta=JSON.parse(fs.readFileSync(path.join(OUT,'fogli.json'),'utf8'))}catch(e){}
for(const k of kinds){const r=await p.evaluate(([k,o])=>__E(`__sheets(${JSON.stringify(k)},${JSON.stringify(o)})`),[k,CRE[k]]);
  for(const[a,d] of Object.entries(r.sheets))fs.writeFileSync(path.join(OUT,`${k}_${a}.png`),Buffer.from(d.split(',')[1],'base64'));
  meta[k]={cell:r.cell,foot:r.foot.map(v=>+v.toFixed(1)),scale:CRE[k].K,size:CRE[k].sc,anims:Object.fromEntries(CRE[k].anims),view:r.view};
  console.log(k,'casella',r.cell,'piedi',r.foot,r.edge.length?'TOCCA IL BORDO: '+r.edge.slice(0,4).join(', '):'')}
fs.writeFileSync(path.join(OUT,'fogli.json'),JSON.stringify(meta,null,1));
console.log('ERRORS',errs.slice(0,5));await b.close()})();
