// gems found in a run are kept: across rooms, on the floor when leaving, and when the run ends (win, death or quit)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:7,trophies:0,runs:0,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c)=>R.push((c?'OK   ':'FAIL ')+n);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(800);
ok('prima partita: nessun benvenuto che blocca',await E(`G.welcome===undefined&&$('coach')===null`));
await E(`G.gemsRun+=3;G.room++;buildRoom()`);await p.waitForTimeout(300);
await E(`G.gemsRun+=2;G.gems.push({x:100,y:300,z:0,vz:0,vx:0,vy:0,t:0,ph:0},{x:120,y:300,z:0,vz:0,vx:0,vy:0,t:0,ph:0});G.room++;buildRoom()`);await p.waitForTimeout(300);
ok('3 + 2 + 2 rimaste a terra = 7 '+await E('G.gemsRun'),await E('G.gemsRun===7'));
await E(`G.gems.push({x:100,y:300,z:0,vz:0,vx:0,vy:0,t:0,ph:0});endRun(false,false)`);await p.waitForTimeout(800);
const g=await E('SAVE.gems');ok('a fine partita 7 + 8 = 15 '+g,g===15);
ok('schermata finale mostra 8 '+await E(`$('eGems').textContent`),await E(`$('eGems').textContent==='8'`));
await p.reload();await p.waitForTimeout(1200);ok('dopo ricarica restano '+await E('SAVE.gems'),await E('SAVE.gems===15'));
console.log(R.join('\n'),errs);await b.close()})();
