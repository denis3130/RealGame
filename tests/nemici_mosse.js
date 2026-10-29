// a sheet of the enemies' moves (Denis, 29 ottobre: «Nemici più vivi»): one row per enemy, the moves at the given moments, one face
// usage: node tests/nemici_mosse.js out.png id1,id2,... [moves e.g. prep:0,.25,.5,.75;die:0,.2,.4,.6,.8,1] [face]   (Z=2 bigger)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const out=process.argv[2],ids=process.argv[3].split(','),spec=(process.argv[4]||'idle:.25;prep:0,.25,.5,.75;die:0,.15,.3,.45,.6,.8,1').split(';').map(s=>{const[a,ps]=s.split(':');return[a,ps.split(',').map(Number)]}),
    face=process.argv[5]!=null?+process.argv[5]:Math.PI/2-.5;
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:400}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+__dirname+'/test.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(600);
  const url=await p.evaluate(([ids,spec,face,z])=>__E(`(()=>{const ids=${JSON.stringify(ids)},spec=${JSON.stringify(spec)},face=${face};const cw=118*${z},ch=132*${z},S=1.45*${z},cols=spec.reduce((a,s)=>a+s[1].length,0);
    const cv=document.createElement('canvas');cv.width=cw*cols+90;cv.height=ch*ids.length+24;const g=cv.getContext('2d');g.fillStyle='#3d4a3a';g.fillRect(0,0,cv.width,cv.height);
    const keep=ctx;ctx=g;g.font='12px sans-serif';g.fillStyle='#fff';let c=0;for(const[a,ps] of spec)for(const pp of ps){g.fillText(a+' '+pp,90+c*cw+6,14);c++}
    ids.forEach((id,r)=>{const M=N3.meta[id];g.fillStyle='#fff';g.fillText(id,6,24+r*ch+ch/2);let c=0;
      for(const[a,ps] of spec)for(const pp of ps){const x=90+c*cw+cw/2,y=24+r*ch+ch*.78;g.save();g.fillStyle=(c%2)?'#46553f':'#4a5a43';g.fillRect(90+c*cw,24+r*ch,cw,ch);
        g.strokeStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(90+c*cw,y);g.lineTo(90+(c+1)*cw,y);g.stroke();
        try{const an=M.an.includes(a)?a:null;if(an)N3[id](x,y,face,an,pp,S*(M.sc||1),{});else{g.fillStyle='#f88';g.fillText('—',x-4,y-30)}}catch(e){g.fillStyle='#f44';g.fillText('ERR',x-12,y-30);console.error(id,a,e.message)}
        g.restore();c++}});
    ctx=keep;return cv.toDataURL()})()`),[ids,spec,face,+(process.env.Z||1)]);
  fs.writeFileSync(out,Buffer.from(url.split(',')[1],'base64'));console.log(errs.slice(0,8).join('\n')||'nessun errore');await b.close()})();
