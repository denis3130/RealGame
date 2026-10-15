// Foglio di un modello 3D dei nemici (sprite/nemici3d): le 4 direzioni (davanti, tre quarti, lato, dietro) da fermo, la fase 2, e ogni
// mossa in 8 momenti (p da 0 a 1) da tre quarti e di lato, su un pavimento scuro come quello delle arene; più il tempo di disegno medio
// (tela pulita a ogni disegno, come nel gioco). Serve a vedere un modello mentre lo si disegna.
// Uso: python3 tests/mk.py && node tests/foglio3d.js <nome> [uscita.png] [--file percorso/modello.js ...] [--mosse idle,walk,...] [--sc 1.6]
//   --file  carica prima nel gioco uno o più file di modelli che non sono ancora nel gioco (es. sprite/nemici3d/golem2.js)
//   --mosse solo queste mosse (di solito tutte quelle di N3.meta[nome].an)
//   --sc    grandezza del disegno (1 = come nel gioco; di solito 1.6 per vedere i dettagli)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const args=process.argv.slice(2);const id=args[0];if(!id){console.log('uso: node tests/foglio3d.js <nome> [uscita.png] [--file x.js] [--mosse a,b] [--sc 1.6]');process.exit(1)}
let out=null,files=[],moves=null,sc=1.6;
for(let i=1;i<args.length;i++){if(args[i]==='--file')files.push(args[++i]);else if(args[i]==='--mosse')moves=args[++i].split(',');else if(args[i]==='--sc')sc=+args[++i];else if(!out)out=args[i]}
out=out||path.join(__dirname,`f3_${id}.png`);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1200);
  for(const f of files){const src=fs.readFileSync(path.resolve(f),'utf8');const r=await p.evaluate(s=>{try{__E(s);return 'ok'}catch(e){return 'ERRORE: '+e.message}},src);if(r!=='ok'){console.log(f,r);process.exit(2)}}
  const res=await p.evaluate(([id,moves,sc])=>__E(`(()=>{const id=${JSON.stringify(id)};if(!N3[id])return JSON.stringify({err:'modello sconosciuto: '+id});const M=N3.meta[id];
    const mv=${JSON.stringify(moves)}||M.an,W=Math.round(150*${sc}),H=Math.round(170*${sc}),cols=8,dirs=[['davanti',Math.PI/2],['tre quarti',Math.PI/4],['lato',0],['dietro',-Math.PI/2]];
    const rows=2+mv.length*2,cv2=document.createElement('canvas');cv2.width=W*cols;cv2.height=H*rows+16;const g=cv2.getContext('2d'),sv=ctx;ctx=g;
    const floor=(x0,y0)=>{g.setTransform(1,0,0,1,0,0);const gr=g.createLinearGradient(0,y0,0,y0+H);gr.addColorStop(0,'#2a2622');gr.addColorStop(1,'#3a342c');g.fillStyle=gr;g.fillRect(x0,y0,W,H);g.strokeStyle='rgba(0,0,0,.25)';g.strokeRect(x0+.5,y0+.5,W-1,H-1)};
    const lab=(t,x,y)=>{g.setTransform(1,0,0,1,0,0);g.font='bold 12px sans-serif';g.fillStyle='#ffe9b0';g.fillText(t,x+4,y+13)};
    const draw=(x0,y0,f,an,pp,o)=>{floor(x0,y0);g.save();try{N3[id](x0+W/2,y0+H*.84,f,an,pp,(M.sc||1)*${sc},o||{})}catch(e){g.restore();g.setTransform(1,0,0,1,0,0);g.fillStyle='#f66';g.fillText('errore: '+e.message.slice(0,40),x0+4,y0+30);return}g.restore()};
    // row 1: the four directions standing (and the same from the other side), row 2: the second phase
    dirs.forEach(([n,f],i)=>{draw(i*W,0,f,'idle',.25);lab(n,i*W,0)});[['davanti',Math.PI/2],['tre quarti (altro lato)',Math.PI*.75],['lato (altro)',Math.PI],['dietro tre quarti',-Math.PI/4]].forEach(([n,f],i)=>{draw((i+4)*W,0,f,'idle',.6);lab(n,(i+4)*W,0)});
    dirs.forEach(([n,f],i)=>{draw(i*W,H,f,'idle',.25,{p2:true});lab('fase 2 · '+n,i*W,H)});[['walk',Math.PI/4],['walk',Math.PI/2],['hit',Math.PI/4],['hit',Math.PI/2]].forEach(([a,f],i)=>{if(!M.an.includes(a))return;draw((i+4)*W,H,f,a,.4,{p2:true});lab('fase 2 · '+a,(i+4)*W,H)});
    // then each move in 8 moments, from three quarters and from the side
    let r=2;for(const a of mv){for(const[fn,f] of [['tre quarti',Math.PI/4],['lato',0]]){for(let k=0;k<cols;k++){const pp=Math.min(.999,k/(cols-1));draw(k*W,r*H,f,a,pp);if(k===0)lab((M.lab&&M.lab[a]||a)+' · '+fn+' · p '+pp.toFixed(2),0,r*H);else lab('p '+pp.toFixed(2),k*W,r*H)}r++}}
    // the drawing time: every move, a clean canvas each time
    const tc=document.createElement('canvas');tc.width=tc.height=400;const tg=tc.getContext('2d');ctx=tg;const T=[];for(let i=0;i<240;i++){tg.setTransform(1,0,0,1,0,0);tg.clearRect(0,0,400,400);const a=mv[i%mv.length],t0=performance.now();try{N3[id](200,320,i*.21,a,(i*.037)%1,M.sc||1,{})}catch(e){}T.push(performance.now()-t0)}
    ctx=sv;T.sort((a,b)=>a-b);g.setTransform(1,0,0,1,0,0);g.fillStyle='#fff';g.font='12px sans-serif';const med=T[T.length>>1];g.fillText(M.n+' · '+mv.join(', ')+' · disegno mediano '+med.toFixed(2)+' ms',4,H*rows+12);
    return JSON.stringify({url:cv2.toDataURL('image/png'),med:+med.toFixed(3),p90:+T[Math.floor(T.length*.9)].toFixed(3),moves:mv,name:M.n})})()`),[id,moves,sc]);
  const R=JSON.parse(res);if(R.err){console.log(R.err);process.exit(3)}
  fs.writeFileSync(out,Buffer.from(R.url.split(',')[1],'base64'));
  console.log(`${R.name}: ${out}\nmosse: ${R.moves.join(', ')}\ndisegno: mediano ${R.med} ms, 90% sotto ${R.p90} ms\nERR ${JSON.stringify(errs.slice(0,6))}`);await b.close()})();
