// close look at obstacles and walls in every chapter (high resolution)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1500);
const tag=process.argv[2]||'o';
for(const [ch,room] of [[1,2],[1,7],[2,3],[3,3],[4,3]]){await E(`P.inv=999;P.hp=P.maxhp=1e6;G.chapter=${ch};G.room=${room};G.event=null;rollDark=()=>false;buildRoom();G.enemies=[];P.x=AW/2;P.y=AH/2;camSnap();$('banner').classList.remove('show')`);await p.waitForTimeout(2600);
  await p.screenshot({path:`${tag}_${ch}_${room}.png`})}
console.log(errs);await b.close()})();
