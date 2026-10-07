const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.goto('file://'+__dirname+'/../anteprime/boss_nuovi.html');await p.waitForTimeout(1500);await p.screenshot({path:'b2g_0.png'});
for(const id of ['golem','witch','salamander','smith','toad','hydra','yeti','icequeen','mimic']){await p.click(`[data-b="${id}"]`);await p.waitForTimeout(4200);await p.screenshot({path:`b2g_${id}.png`})}
await p.click('#b2tog');await p.waitForTimeout(800);await p.screenshot({path:'b2g_off.png'});await p.click('#b2tog');await p.click('#b2again');await p.waitForTimeout(1500);
console.log(errs);await b.close()})();
