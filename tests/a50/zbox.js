// the painted box of each new zombie around its feet (for the engine's ready image, ZM.ZBOX): every move (the Gonfio's swelling only up to
// the burst, .66: the game shows the burst with its own cloud), 21 moments, 16 directions and three tilts (35°, 45°, 62°), all drawn on one
// canvas, then 4 px more. Prints the boxes to put in anteprime/zombie/speciali.js (BOX) and checks the ones there.
// python3 tests/a50/mk.py, then node tests/a50/zbox.js
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+D+'test_a50.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1200);
  const R=JSON.parse(await p.evaluate(()=>__E(`(()=>{const W=700,H=700,ox=350,oy=470,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),out={},keep=Object.assign({},CR.cam);
    const tilts=[35,45,62].map(e=>{const el=e*Math.PI/180,SP=Math.SQRT2*Math.sin(el),CP=Math.SQRT2*Math.cos(el),kr=Math.abs(SP-1)<1e-9?1:Math.sqrt(SP),zk=Math.abs(CP-1)<1e-9?1:Math.pow(CP,.25);return{k:kr===1?.55:.55*kr,zk}});
    const K=[['gonfio',1.2,[['idle',1],['walk',1],['attack',.659]]],['sputatore',1.15,[['idle',1],['walk',1],['attack',.999]]],['bruto',1.5,[['idle',1],['walk',1],['charge',1],['attack',.999]]]];
    for(const[k,sc,an] of K){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);
      for(const T of tilts){Object.assign(CR.cam,T);for(const[a,pm] of an)for(let i=0;i<=20;i++)for(let f=0;f<16;f++){g.setTransform(1,0,0,1,ox,oy);const sv=ctx;ctx=g;try{CR[k](0,0,f/16*Math.PI*2,a,i/20*pm,sc)}finally{ctx=sv}}}
      const d=g.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>4){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
      out[k]=[x0-ox-4,y0-oy-4,x1-ox+5,y1-oy+5,sc];out[k+'_bordo']=x0<=1||y0<=1||x1>=W-2||y1>=H-2}
    Object.assign(CR.cam,keep);return JSON.stringify({out,cur:{gonfio:ZM.ZBOX.gonfio,sputatore:ZM.ZBOX.sputatore,bruto:ZM.ZBOX.bruto}})})()`)));
  console.log('misurati:',JSON.stringify(R.out));console.log('in speciali.js:',JSON.stringify(R.cur));
  let bad=0;for(const k of['gonfio','sputatore','bruto']){const m=R.out[k],c=R.cur[k];if(R.out[k+'_bordo']){console.log('NO  '+k+': il disegno tocca il bordo della tela di misura');bad++}
    const inside=c&&c[0]<=m[0]&&c[1]<=m[1]&&c[2]>=m[2]&&c[3]>=m[3]&&Math.abs(c[4]-m[4])<1e-6;console.log((inside?'OK  ':'NO  ')+k+': il riquadro di speciali.js contiene tutto il disegno');if(!inside)bad++}
  if(errs.length){console.log('NO  errori',errs.slice(0,3));bad++}await b.close();process.exit(bad?1:0)})();
