const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:0,runs:4,introSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);
await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`));await p.waitForTimeout(2500);
// the bad order: skills open, then the wheel opens on top
await p.evaluate(()=>__E(`openSkills('level');openWheel()`));await p.waitForTimeout(300);
await p.click('#whGo');await p.waitForTimeout(5500);await p.click('#whGo');await p.waitForTimeout(400);
const a=await p.evaluate(()=>__E(`({sk:!$('skScr').hidden,modal,paused,n:Object.keys(P.skills).length})`));
await p.screenshot({path:'ws1.png'});
await p.locator('#skList > *').first().click();await p.waitForTimeout(400);
const b2=await p.evaluate(()=>__E(`({sk:!$('skScr').hidden,modal,paused,n:Object.keys(P.skills).length})`));
console.log('dopo ruota:',JSON.stringify(a),'dopo scelta:',JSON.stringify(b2),errs);await b.close()})();
