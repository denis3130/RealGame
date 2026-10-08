// the first-run hand: shows on the very first run, goes away on touch, never again
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:0,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c)=>R.push((c?'OK   ':'FAIL ')+n);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1800);
ok('la manina compare alla prima partita',await E(`!!$('hand1')&&$('hand1').classList.contains('on')`));await p.screenshot({path:'hand_1.png'});
await p.mouse.move(195,600);await p.mouse.down();await p.waitForTimeout(500);ok('sparisce al primo tocco',await E(`!$('hand1').classList.contains('on')`));await p.mouse.up();
await E(`endRun(false,true)`);await p.waitForTimeout(500);await E(`$('endScr').hidden=true;startRun()`);await p.waitForTimeout(1800);ok('non torna più',await E(`!$('hand1').classList.contains('on')`));
console.log(R.join('\n'),errs);await b.close()})();
