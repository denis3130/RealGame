// close look at the back wall and the skull behind it, plus the menu tabs
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:300,trophies:350,trBest:350,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);const tag=process.argv[2]||'t';
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`);
for(const t of ['tabPlay','tabHero','tabShop','tabRoad','tabProfile']){await E(`setTab('${t}')`);await p.waitForTimeout(700);await p.screenshot({path:`${tag}_menu_${t}.png`})}
await E(`setTab('tabPlay');startRun()`);await p.waitForTimeout(1200);
for(const ch of [1,2,3,4]){await E(`P.inv=999;G.chapter=${ch};G.room=3;G.event=null;rollDark=()=>false;buildRoom();G.enemies=[];P.x=AW/2;P.y=TOP+40;camSnap();$('banner').classList.remove('show')`);await p.waitForTimeout(1300);await p.screenshot({path:`${tag}_top_${ch}.png`,clip:{x:0,y:0,width:390,height:330}})}
console.log(errs);await b.close()})();
