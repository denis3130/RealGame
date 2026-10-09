// the hero walks out of the door: frames while he enters the doorway and the screen fades
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:100,runs:3,introSeen:1,handSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],best:{room:3,gold:20},set:{big:false,mv:.5,sv:.5,q:'alta',vib:0}}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);
const E=c=>p.evaluate(c=>__E(c),c);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1500);
await E(`for(const e of G.enemies)hurtE(e,e.hp+1,false)`);await p.waitForTimeout(2500);await E(`if(G.cc){G.ccChosen=1;G.ccDone=G.room}G.door=true`);
await E(`P.x=AW/2+6;P.y=TOP+9;paused=true`);
const ys=[];for(let i=0;i<7;i++){await E(`paused=false`);await p.waitForTimeout(90);await E(`paused=true`);ys.push(await E(`({y:Math.round(P.y),st:G.state,f:+G.fade.toFixed(2),d:G.door,ev:G.event,cc:!!G.cc})`));await p.screenshot({path:`exit_${i}.png`,clip:{x:95,y:0,width:200,height:300}})}
await E(`paused=false`);await p.waitForTimeout(1500);ys.push(await E(`({room:G.room,st:G.state,y:Math.round(P.y)})`));
console.log(JSON.stringify(ys),errs);await b.close()})();
