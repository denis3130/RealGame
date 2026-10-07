// micro animations: HP trail after a hit, gate opening with dust, coin flying to the counter, level-up hop
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:6,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(2500);
await E(`P.inv=0;hurtP(80)`);await p.waitForTimeout(150);const tr=await E(`JSON.stringify({hp:P.hp,trail:P.hpTrail})`);await p.screenshot({path:'mi_trail.png'});
await E(`G.coins.push({x:P.x,y:P.y,vx:0,vy:0,t:1})`);await p.waitForTimeout(250);const fly=await E(`document.querySelectorAll('.flyCoin').length`);await p.screenshot({path:'mi_coin.png'});
await E(`gainXp(P.need)`);await p.waitForTimeout(120);const hop=await E(`P.hopT>0`);await p.screenshot({path:'mi_hop.png'});await p.waitForTimeout(900);await p.click('#skScr .sk >> nth=0').catch(()=>E(`pick(0)`));await p.waitForTimeout(600);
await E(`for(const e of G.enemies)hurtE(e,1e6,false)`);let gate=false;for(let i=0;i<30&&!gate;i++){await p.waitForTimeout(100);gate=await E(`G.gateT>0.2`)}await p.screenshot({path:'mi_gate.png'});
console.log('scia',tr,'monete in volo',fly,'saltello',hop,'cancello',gate,errs);await b.close()})();
