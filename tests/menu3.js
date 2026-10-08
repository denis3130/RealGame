// the new menu (version 45): every tab, every sheet, the wheel, at two phone sizes; page errors are listed
// usage: node menu3.js [out-prefix] [fresh 1/0]
const {chromium}=require('playwright');
const out=process.argv[2]||'m3',fresh=process.argv[3]==='1';
(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h] of [[390,844],[360,640]]){
 const p=await b.newPage({viewport:{width:w,height:h}});
 p.on('pageerror',e=>errs.push(`${w}x${h}: `+e.message+' @'+((e.stack||'').split('\n')[1]||'').trim().slice(-60)));
 p.on('console',m=>{if(m.type()==='error')errs.push(`${w}x${h} console: `+m.text())});
 const today=new Date();const ds=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
 await p.addInitScript(([ds,fresh])=>{if(fresh){localStorage.setItem('cripta_save_v1',JSON.stringify({gold:60,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[{type:'legno',state:'ready'},null,null,null],best:{room:0,gold:0},runs:0,introSeen:1}));return}
  localStorage.setItem('cripta_save_v1',JSON.stringify({gold:4200,gems:260,trophies:820,trBest:820,runs:14,introSeen:1,login:{last:'',n:3},
  items:{arco_frassino:{lvl:4,cards:9},giubba:{lvl:3,cards:2},arco_ricurvo:{lvl:2,cards:5},anello_rame:{lvl:2,cards:1},amuleto_luna:{lvl:1,cards:0}},eq:{arma:'arco_ricurvo',armatura:'giubba',anello:'anello_rame',amuleto:'amuleto_luna'},
  slots:[{type:'legno',state:'ready'},{type:'argento',state:'unlocking',end:Date.now()+1800e3},{type:'oro',state:'locked'},null],best:{room:10,gold:100},best2:{room:10,gold:100},best3:{room:6,gold:80},
  inf:{best:12,top:[{room:12,hero:'arciere',kills:80,d:Date.now()}]},tutDone:1,handSeen:1,heroes:{arciere:1,cacciatrice:1},hero:'arciere',
  pets:{owned:{muschietto:{lvl:3,cards:2},lucciola:{lvl:1,cards:0}},eq:['muschietto','lucciola'],cards:{}},road:{100:1,200:1},done:{c1:true,golem:true}}))},[ds,fresh]);
 await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1600);
 const E=c=>p.evaluate(c=>__E(c),c);
 await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);SHEET=null`);
 const shot=async n=>{await p.waitForTimeout(450);await p.screenshot({path:`${out}_${w}_${n}.png`})};
 await shot('home');
 for(const t of ['tabHero','tabGear','tabPets','tabShop','tabRoad','tabProfile']){await E(`setTab('${t}')`);await shot(t)}
 await E(`setTab('tabPlay')`);
 for(const s of ['mis','chests','login','pass','chal','abyss','more','gems']){await E(`openSheet('${s}')`);await shot('sheet_'+s);await E(`closeSheet()`)}
 await E(`openSheet('mis');misSeg='w';fillMissions()`);await shot('sheet_misW');await E(`closeSheet()`);
 await E(`$('wheelBtn').click()`);await shot('wheel');
 if(w===390){await E(`$('whGo').click()`);await p.waitForTimeout(5200);await shot('wheel_spun');await E(`whClose();CHskip=true`);await p.waitForTimeout(800)}
 await E(`document.querySelectorAll('#whScr,#chestScr').forEach(e=>e.hidden=true);CHbusy=false;setTab('tabPlay')`);
 // tap every button of the home and of the side columns
 const n=await E(`[...document.querySelectorAll('#tabPlay button,#tabPlay [role=button],#topbar button')].filter(b=>b.offsetWidth&&b.id!=='playBtn').length`);
 for(let i=0;i<n;i++){await E(`(()=>{document.querySelectorAll('#sheetScr,#itemScr,#whScr,#chestScr').forEach(e=>e.hidden=true);SHEET=null;CHbusy=false;setTab('tabPlay');const L=[...document.querySelectorAll('#tabPlay button,#tabPlay [role=button],#topbar button')].filter(b=>b.offsetWidth&&b.id!=='playBtn');if(L[${i}])L[${i}].click()})()`);await p.waitForTimeout(250)}
 await p.close()}
console.log('ERRORS',JSON.stringify(errs,null,1));await b.close()})();
