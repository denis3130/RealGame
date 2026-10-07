// direction sheet: every humanoid drawn facing down, down-right, right, up-right, up, left (rows = characters)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1}}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);
const url=await p.evaluate(()=>__E(`(()=>{const rows=[['Arciere',heroStyle0('arciere'),{}],['Cacciatrice',heroStyle0('cacciatrice'),{}],['Balestriere',heroStyle0('balestriere'),{}],['Druida',heroStyle0('druida'),{}],['Scheletro',SKEL,{}],['Goblin',GOBLIN,{}]].filter(r=>r[1]);
 const dirs=[['davanti',Math.PI/2],['3/4 davanti',Math.PI/4],['lato',0],['3/4 dietro',-Math.PI/4],['dietro',-Math.PI/2],['altro lato',Math.PI]];
 const c=document.createElement('canvas'),S=3,cw=110,chh=120;c.width=(dirs.length*cw+120)*S/1.5;c.height=(rows.length*chh+40)*S/1.5;const x=c.getContext('2d'),saved=ctx;ctx=x;
 x.fillStyle='#2b3a2a';x.fillRect(0,0,c.width,c.height);x.scale(S/1.5,S/1.5);x.font='14px sans-serif';x.fillStyle='#fff';x.textAlign='center';
 dirs.forEach((d,i)=>x.fillText(d[0],120+i*cw+cw/2,22));
 rows.forEach((r,j)=>{x.textAlign='left';x.fillStyle='#fff';x.fillText(r[0],8,40+j*chh+70);dirs.forEach((d,i)=>{x.save();x.translate(120+i*cw+cw/2,40+j*chh+70);x.scale(2.2,2.2);drawRig(0,0,d[1],0,false,r[1],r[2]);x.restore()})});
 ctx=saved;return c.toDataURL()})()`));
require('fs').writeFileSync(process.argv[2]||'dirs.png',Buffer.from(url.split(',')[1],'base64'));console.log(errs);await b.close()})();
