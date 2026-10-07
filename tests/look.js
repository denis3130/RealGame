const {chromium}=require('playwright');const tag=process.argv[2]||'lk';(async()=>{const b=await chromium.launch();const errs=[];
for(const [tro,ch] of [[0,1],[300,2],[700,3],[1200,4]]){const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript((tro)=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:tro,trBest:tro,runs:4,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],pets:{owned:{muschietto:{lvl:1,cards:0}},sel:'muschietto'}}))},tro);
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);
await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`));await p.waitForTimeout(300);await p.screenshot({path:`${tag}_menu${ch}.png`});
await p.evaluate(()=>__E(`startRun();const idx=G.seq.findIndex(s=>s.c===3);G.si=idx-1;nextStep()`));await p.waitForTimeout(4200);
await p.evaluate(()=>__E(`bannerEl.classList.remove('show')`));await p.screenshot({path:`${tag}_room${ch}.png`});await p.close()}
console.log(errs);await b.close()})();
