// Mossbound · un nostro mostro di oggi da quattro lati (davanti, tre quarti, lato, dietro) su fondo trasparente, per «Prima e dopo» della pagina
// degli zombie in 3D (anteprime/mk_zombie3d.py). Uso: python3 tests/mk.py, poi node sprite/mostri3d/oggi.js [nome] <uscita.webp>
// (nome: zombie, il mostro di sempre, o strisciante): sprite/mostri3d/zombie_oggi.webp, sprite/mostri3d/strisciante_oggi.webp
const {chromium}=require('playwright');const fs=require('fs');const R='/home/user/RealGame/',ONE=process.argv.length<4,NAME=ONE?'zombie':process.argv[2],OUT=ONE?process.argv[2]:process.argv[3];
// the tiles: tall for the zombie, low and wide for the crawler
const TILE={zombie:[390,780],strisciante:[390,300]}[NAME]||[390,780];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:50,introSeen:1,runs:3,starter:'arciere',items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
  await p.goto('file://'+R+'tests/test.html');await p.waitForTimeout(1500);
  const d=await p.evaluate(([nm,tw,th])=>__E(`(()=>{const TW=${tw},TH=${th},O=document.createElement('canvas');O.width=TW*4;O.height=TH;const o=O.getContext('2d');
    const faces=[Math.PI/2,Math.PI/2-0.6,0,-Math.PI/2],boxes=[];const S=1400,K=10;
    const cvs=faces.map(f=>{const cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');const saved=ctx;ctx=g;G.t=0;ctx.save();ctx.translate(S/2,S*.82);ctx.scale(K,K);
      try{CR.${nm}(0,0,f,'idle',0,1.1)}finally{ctx.restore();ctx=saved}
      const im=g.getImageData(0,0,S,S),D=im.data;let x0=S,y0=S,x1=-1,y1=-1;for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=(y*S+x)*4;if(D[i+3]<235){D[i+3]=0;continue}D[i+3]=255;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
      g.putImageData(im,0,0);boxes.push([x0,y0,x1,y1]);return cv});
    // one scale for the four (the tallest fills 84% of the tile; the widest of the crawler no more than 94%), feet on the same line
    const hmax=Math.max(...boxes.map(b=>b[3]-b[1]+1)),wmax=Math.max(...boxes.map(b=>b[2]-b[0]+1)),k=Math.min(TH*.84/hmax,${nm==='zombie'?1e9:'TW*.94/wmax'});
    cvs.forEach((cv,i)=>{const[x0,y0,x1,y1]=boxes[i],w=x1-x0+1,h=y1-y0+1;o.imageSmoothingQuality='high';o.drawImage(cv,x0,y0,w,h,i*TW+(TW-w*k)/2,TH*.93-h*k,w*k,h*k)});
    return O.toDataURL('image/webp',.9)})()`),[NAME,TILE[0],TILE[1]]);
  fs.writeFileSync(OUT,Buffer.from(d.split(',')[1],'base64'));console.log(OUT,fs.statSync(OUT).size,errs.slice(0,3).join(' | ')||'ok');await b.close()})();
