// draws the proposal sheet of the new rig (rig2.js): every character in every direction, plus a walking row
const {chromium}=require('playwright');require('./rig2.js');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1}}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);
await p.evaluate(s=>__E(s),global.__RIG2||window.__RIG2);
const old=process.argv[3]==='old';
const url=await p.evaluate(old=>__E(`(()=>{const rows=[['Arciere',heroStyle0('arciere')],['Cacciatrice',heroStyle0('cacciatrice')],['Balestriere',heroStyle0('balestriere')],['Druida',heroStyle0('druida')],['Scheletro',SKEL],['Goblin',GOBLIN]];
 const dirs=[['DAVANTI',Math.PI/2],['3/4',Math.PI/4],['LATO',0],['3/4 dietro',-Math.PI/4],['DIETRO',-Math.PI/2],['ALTRO LATO',Math.PI]];
 const S=3,cw=120,chh=130,W=(dirs.length*cw+130),Hh=(rows.length*chh+50);const c=document.createElement('canvas');c.width=W*S/1.5;c.height=Hh*S/1.5;const x=c.getContext('2d'),saved=ctx;ctx=x;
 x.fillStyle='#3a4a34';x.fillRect(0,0,c.width,c.height);x.scale(S/1.5,S/1.5);x.font='bold 14px sans-serif';x.fillStyle='#fff';x.textAlign='center';
 dirs.forEach((d,i)=>{x.fillStyle=d[0]===d[0].toUpperCase()?'#ffe27a':'#cfd8c0';x.fillText(d[0],130+i*cw+cw/2,26)});
 rows.forEach((r,j)=>{x.textAlign='left';x.fillStyle='#fff';x.fillText(r[0],10,50+j*chh+64);dirs.forEach((d,i)=>{const cx=130+i*cw+cw/2,cy=50+j*chh+72;x.fillStyle='rgba(0,0,0,.12)';x.fillRect(cx-56,cy-68,112,124);x.save();x.translate(cx,cy);x.scale(2.3,2.3);
   if(${old})drawRig(0,0,d[1],0,false,r[1],{});else rig2(0,0,d[1],0,false,r[1],{});x.restore()})});
 ctx=saved;return c.toDataURL()})()`),old);
require('fs').writeFileSync(process.argv[2]||'rig2.png',Buffer.from(url.split(',')[1],'base64'));console.log(errs);await b.close()})();
