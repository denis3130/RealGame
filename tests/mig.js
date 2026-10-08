const {chromium}=require('playwright');
const cases={old:JSON.stringify({gold:120,items:{arco_frassino:{lvl:2,cards:3},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],best:{room:4,gold:30},runs:3}),
 garbage:'{not json',partial:JSON.stringify({gold:50,items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino'}}),
 nulls:JSON.stringify({gold:null,gems:null,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],pass:null,chal:null,daily:null,inf:null,stats:null})};
(async()=>{const b=await chromium.launch();
for(const [k,v] of Object.entries(cases)){const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' @'+((e.stack||'').split('\n')[1]||'').trim().slice(-50)));
 await p.addInitScript((v)=>{if(!sessionStorage.getItem('x')){sessionStorage.setItem('x',1);localStorage.setItem('cripta_save_v1',v)}},v);
 await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);await p.mouse.click(195,600);await p.waitForTimeout(800);
 const sk=await p.$('#iSkip');if(sk&&await sk.isVisible())await sk.click();await p.waitForTimeout(1200);
 await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`));
 for(const t of ['tabHero','tabGear','tabPets','tabShop','tabRoad','tabProfile','tabPlay']){await p.evaluate(t=>__E(`setTab('${t}')`),t);await p.waitForTimeout(300)}
 await p.screenshot({path:`mig_${k}.png`});
 await p.evaluate(()=>__E(`startRun()`));await p.waitForTimeout(3000);await p.evaluate(()=>__E(`endRun(false,true)`));await p.waitForTimeout(2500);
 console.log(k,'errors:',JSON.stringify(errs),await p.evaluate(()=>__E(`JSON.stringify({menu:!$('menu').hidden,end:!$('endScr').hidden,gold:SAVE.gold,gems:SAVE.gems})`)));await p.close()}
for(const [w,h] of [[320,568],[412,915],[768,1024],[1366,768],[844,390]]){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,trophies:350,runs:4,introSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[{type:'legno',state:'ready'},null,null,null]}))});
 await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);await p.evaluate(()=>__E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`));await p.waitForTimeout(300);
 await p.screenshot({path:`vp_${w}x${h}_menu.png`});await p.evaluate(()=>__E(`setTab('tabHero')`));await p.waitForTimeout(400);await p.screenshot({path:`vp_${w}x${h}_hero.png`});
 await p.evaluate(()=>__E(`setTab('tabPlay');startRun()`));await p.waitForTimeout(3000);await p.screenshot({path:`vp_${w}x${h}_game.png`});
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight+2);
 console.log(w,h,'overflow',ov,errs);await p.close()}
await b.close()})();
