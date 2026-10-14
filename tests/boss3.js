// Fogli dei boss nuovi del terzo giro (sprite/nemici3d/boss3.js), per guardarli prima di mostrarli a Denis:
//   tests/nb_<id>_dir.png   le quattro direzioni (davanti, lato, dietro, altro lato), fase 1 sopra e fase 2 sotto, più la vista di tre quarti
//   tests/nb_<id>_mosse.png ogni mossa in 8 fotogrammi (p = 0 … 7/8), visto di tre quarti
// Uso: python3 tests/mk.py && node tests/boss3.js [id ...]   (senza id: tutti i boss del gruppo 'boss3')
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:300}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);
const src=fs.readFileSync(path.join(__dirname,'..','sprite','nemici3d','boss3.js'),'utf8');
await p.evaluate(s=>__E(s+'\n;0'),src);
const ids=process.argv.slice(2).length?process.argv.slice(2):await p.evaluate(()=>__E(`N3.order.filter(id=>N3.meta[id].g==='boss3')`));
for(const id of ids){
  const out=await p.evaluate(id=>__E(`(()=>{const M=N3.meta['${id}'],sv=ctx,R={};LOWFX=false;
    const sheet=(W,H,f)=>{const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.fillStyle='#3b3631';g.fillRect(0,0,W,H);
      g.strokeStyle='rgba(255,255,255,.05)';for(let x=0;x<W;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=0;y<H;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
      ctx=g;try{f(g)}catch(e){ctx=sv;throw e}ctx=sv;return cv.toDataURL('image/png')};
    const lab=(g,t,x,y)=>{g.fillStyle='#f6ead2';g.font='600 13px sans-serif';g.textAlign='center';g.fillText(t,x,y)};
    const CW=230,CH=250,faces=[[Math.PI/2,'davanti'],[0,'lato'],[-Math.PI/2,'dietro'],[Math.PI,'altro lato'],[Math.PI/2-.55,'tre quarti']];
    R.dir=sheet(CW*5,CH*2+20,g=>{for(let r=0;r<2;r++)faces.forEach(([f,n],i)=>{G.t=1.3;N3['${id}'](CW*i+CW/2,CH*r+CH-34,f,'idle',.25,1.3,{p2:r===1});lab(g,(r?'fase 2 · ':'')+n,CW*i+CW/2,CH*r+CH-8)})});
    const an=M.an,FW=170,FH=230;
    R.mosse=sheet(FW*8,FH*an.length,g=>{an.forEach((a,r)=>{for(let k=0;k<8;k++){G.t=k*.13;g.save();g.beginPath();g.rect(FW*k,FH*r,FW,FH);g.clip();N3['${id}'](FW*k+FW/2,FH*r+FH-40,Math.PI/2-.55,a,k/8,1,{});g.restore();if(k===0)lab(g,(M.lab&&M.lab[a]||a)+' (p=0)',FW/2,FH*r+FH-12);else lab(g,'p='+(k/8).toFixed(2),FW*k+FW/2,FH*r+FH-12)}})});
    return R})()`),id);
  for(const[k,d] of Object.entries(out))fs.writeFileSync(path.join(__dirname,`nb_${id}_${k}.png`),Buffer.from(d.split(',')[1],'base64'));
  console.log(id,'ok')}
console.log('ERR',JSON.stringify(errs));await b.close()})();
