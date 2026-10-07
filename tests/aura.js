const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:0,runs:4,introSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);
await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`));await p.waitForTimeout(2600);
await p.evaluate(()=>__E(`G.enemies.forEach(e=>e.hidden=true);P.x=180;P.y=420;paused=true;bannerEl.classList.remove('show')`));
const C=await p.evaluate(()=>__E(`(()=>{const r=cv.getBoundingClientRect(),k=r.width/cv.width,cw=cv.width,ch=cv.height,s=Math.min(cw/AW,ch/AH),ox=(cw-AW*s)/2,oy=Math.max(0,(ch-AH*s)/2);return {x:r.left+(ox+P.x*s)*k,y:r.top+(oy+(P.y-10)*s)*k}})()`));
const ids=['evo_chain','evo_frost','evo_rain','evo_blades','evo_lethal','evo_fan'],T=[.08,.3,.6,1.0,1.5];
for(const id of ids){for(const t of T){await p.evaluate(([id,t])=>__E(`startAura('${id}');Math.random=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();for(let x=0;x<${t};x+=.02){G.t+=.02;updAura(.02)}`),[id,t]);await p.waitForTimeout(60);
 await p.screenshot({path:`au_${id}_${t}.png`,clip:{x:C.x-100,y:C.y-100,width:200,height:200}})}}
console.log(errs);await b.close()})();
