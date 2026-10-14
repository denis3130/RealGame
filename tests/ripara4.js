// La mossa nuova dell'Arciere 3D sulla mappa zombie (anteprima 48): «ripara», col martello, quando tiene premuto «Ripara la finestra» o
// «Ripara il varco». Foglio per Denis nelle quattro direzioni (davanti, lato, dietro, altro lato) e in quattro momenti della mossa (prende
// l'asse, alza il martello, il colpo, il ritorno), con l'arma zombie messa via come nel gioco. Uso: python3 tests/mk.py && node tests/ripara4.js
// → tests/ripara_4dir.png
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,handSeen:1}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1800);
  const url=await p.evaluate(()=>__E(`(()=>{const C=document.createElement('canvas'),W0=4*170,H0=4*190+40;C.width=W0*2;C.height=H0*2;const g=C.getContext('2d');g.scale(2,2);
    g.fillStyle='#27303a';g.fillRect(0,0,W0,H0);g.font='600 13px system-ui';g.fillStyle='#e8e2d4';g.textAlign='center';
    const dirs=[['davanti',Math.PI/2],['lato',0],['dietro',-Math.PI/2],['altro lato',Math.PI]],ps=[[0,'prende l\\'asse'],[.3,'alza il martello'],[.5,'il colpo'],[.8,'ritorno']];
    dirs.forEach((d,i)=>g.fillText(d[0],i*170+85,22));
    const st=Object.assign({},HERO,{hid:'arciere',held:null,quiver:false,gun:null});/* lo stile della mappa zombie (motore.js HSTYLE) con l'arma messa via */const sv=ctx;ctx=g;
    try{ps.forEach((pp,j)=>{dirs.forEach((d,i)=>{const x=i*170+85,y=40+j*190+150;g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,26,8,0,0,Math.PI*2);g.fill();g.restore();
        EROE.arciere(x,y,d[1],'ripara',pp[0],1.55,{style:st,noFx:true,tool:'martello'})});g.textAlign='left';g.fillStyle='#b8b0a0';g.fillText(pp[1],8,40+j*190+20);g.textAlign='center';g.fillStyle='#e8e2d4'})}finally{ctx=sv}
    return C.toDataURL('image/png')})()`));
  require('fs').writeFileSync(path.join(__dirname,'ripara_4dir.png'),Buffer.from(url.split(',')[1],'base64'));
  console.log('tests/ripara_4dir.png','ERR',JSON.stringify(errs));await b.close()})();
