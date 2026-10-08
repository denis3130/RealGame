const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test_b2.html');await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
await E(`__b2show('witch')`);await p.waitForTimeout(3500);await p.screenshot({path:'wr_1.png'});
await E(`P.y=TOP+(BOT-TOP)*.45+180;P.x=AW/2;G.enemies.forEach(e=>{e.x=AW/2+90;e.y=TOP+60});camSnap()`);await p.waitForTimeout(600);await p.screenshot({path:'wr_2.png'});
console.log(errs);await b.close()})();
