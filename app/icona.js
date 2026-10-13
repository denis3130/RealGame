// L'icona dell'app: l'Arciere 3D col bastoncino di muschio in bocca (il suo segno nella schermata iniziale), disegnato dal gioco stesso
// (drawRig → EROE.arciere) su uno sfondo della cripta con la luce verde del muschio. iOS arrotonda gli angoli da solo: l'icona è piena.
// Uso: python3 tests/mk.py && node app/icona.js   → app/icona-1024.png, icona-512.png, icona-192.png, icona-180.png
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(path.join(__dirname,'..','tests','test.html')).pipe(r)});
// the hero turned three quarters, at the moment when the moss smoke is light (the arguments are for trying other ones)
const FACE=+(process.argv[2]||-.2),SC=+(process.argv[3]||21),HY=+(process.argv[4]||.88),T=+(process.argv[5]||1.8);
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({introSeen:1,handSeen:1}))});
  await p.goto('http://127.0.0.1:'+srv.address().port+'/');await p.waitForTimeout(1500);
  const draw=(N)=>`(()=>{const N=${N},k=N/1024,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),saved=ctx,t0=G.t;ctx=g;G.t=${T};
    try{
      // the crypt at night, lit green by the moss from behind the hero
      let gr=g.createRadialGradient(N*.5,N*.4,N*.04,N*.5,N*.46,N*.78);gr.addColorStop(0,'#4d8a3c');gr.addColorStop(.32,'#24452a');gr.addColorStop(.72,'#121a14');gr.addColorStop(1,'#0a0908');
      g.fillStyle=gr;g.fillRect(0,0,N,N);
      // a few motes of moss light rising
      for(const[x,y,r,a] of[[.16,.3,9,.55],[.84,.24,7,.5],[.12,.62,6,.4],[.9,.58,10,.45],[.26,.14,5,.4],[.74,.1,6,.35]]){const q=g.createRadialGradient(N*x,N*y,0,N*x,N*y,r*3*k);
        q.addColorStop(0,'rgba(190,255,140,'+a+')');q.addColorStop(1,'rgba(190,255,140,0)');g.fillStyle=q;g.beginPath();g.arc(N*x,N*y,r*3*k,0,Math.PI*2);g.fill();
        g.fillStyle='rgba(225,255,190,'+(a+.3)+')';g.beginPath();g.arc(N*x,N*y,r*.42*k,0,Math.PI*2);g.fill()}
      // the hero, big: head and shoulders
      g.save();g.translate(N/2,N*${HY});g.scale(${SC}*k,${SC}*k);noShadow=true;mossOn=1;drawRig(0,0,Math.PI/2+${FACE},0,false,heroStyle(),{});mossOn=0;noShadow=false;g.restore();
      // a soft dark edge so the corners hold the eye in the middle
      const v=g.createRadialGradient(N*.5,N*.5,N*.42,N*.5,N*.5,N*.74);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=v;g.fillRect(0,0,N,N);
    }finally{ctx=saved;G.t=t0}
    return c.toDataURL('image/png')})()`;
  for(const N of[1024,512,192,180]){const u=await p.evaluate(c=>__E(c),draw(N));fs.writeFileSync(path.join(__dirname,'icona-'+N+'.png'),Buffer.from(u.split(',')[1],'base64'))}
  console.log('icone pronte');await b.close();srv.close()})();
