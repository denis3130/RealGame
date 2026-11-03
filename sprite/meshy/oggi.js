// Mossbound · il nostro zombie di oggi da quattro lati (davanti, tre quarti, lato, dietro) su fondo trasparente, per «Prima e dopo» della pagina
// di Meshy (anteprime/mk_meshy.py). Uso: python3 tests/mk.py, poi node sprite/meshy/oggi.js sprite/meshy/zombie_oggi.webp
const {chromium}=require('playwright');const fs=require('fs');const R='/home/user/RealGame/',OUT=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:50,introSeen:1,runs:3,starter:'arciere',items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
  await p.goto('file://'+R+'tests/test.html');await p.waitForTimeout(1500);
  const d=await p.evaluate(()=>__E(`(()=>{const TW=390,TH=780,O=document.createElement('canvas');O.width=TW*4;O.height=TH;const o=O.getContext('2d');
    const faces=[Math.PI/2,Math.PI/2-0.6,0,-Math.PI/2],boxes=[];const S=1400,K=10;
    const cvs=faces.map(f=>{const cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');const saved=ctx;ctx=g;G.t=0;ctx.save();ctx.translate(S/2,S*.82);ctx.scale(K,K);
      try{CR.zombie(0,0,f,'idle',0,1.1)}finally{ctx.restore();ctx=saved}
      const im=g.getImageData(0,0,S,S),D=im.data;let x0=S,y0=S,x1=-1,y1=-1;for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=(y*S+x)*4;if(D[i+3]<235){D[i+3]=0;continue}D[i+3]=255;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
      g.putImageData(im,0,0);boxes.push([x0,y0,x1,y1]);return cv});
    // one scale for the four (the tallest fills 84% of the tile), feet on the same line
    const hmax=Math.max(...boxes.map(b=>b[3]-b[1]+1)),k=TH*.84/hmax;
    cvs.forEach((cv,i)=>{const[x0,y0,x1,y1]=boxes[i],w=x1-x0+1,h=y1-y0+1;o.imageSmoothingQuality='high';o.drawImage(cv,x0,y0,w,h,i*TW+(TW-w*k)/2,TH*.93-h*k,w*k,h*k)});
    return O.toDataURL('image/webp',.9)})()`));
  fs.writeFileSync(OUT,Buffer.from(d.split(',')[1],'base64'));console.log(OUT,fs.statSync(OUT).size,errs.slice(0,3).join(' | ')||'ok');await b.close()})();
