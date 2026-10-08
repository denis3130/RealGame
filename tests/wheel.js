// the wheel of fortune in the menu: one free spin a day, then videos (3) and crystals (rising price); chests open after the spin
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' @'+((e.stack||'').split('\n')[1]||'').trim().slice(-60)));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:300,trophies:0,runs:4,introSeen:1,handSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],best:{room:3,gold:20}}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1500);
const E=c=>p.evaluate(c=>__E(c),c),R=[],ok=(n,c)=>R.push((c?'OK   ':'FAIL ')+n);
const finishChest=async()=>{for(let t=0;t<60&&!(await E(`$('chestScr').hidden`));t++){if(await E(`!$('cdone').hidden`))await p.click('#cdone');else await p.mouse.click(195,520);await p.waitForTimeout(220)}};
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true)`);
ok('ruota pronta nel menu',await E(`!$('wheelBang').hidden&&$('wheelBtn').classList.contains('hot')`));
await p.click('#wheelBtn');await p.waitForTimeout(400);
ok('giro gratis visibile',await E(`!$('whScr').hidden&&!$('whGo').hidden&&$('whAd').hidden&&$('whGem').hidden`));
await p.click('#whGo');await p.waitForTimeout(5300);await p.screenshot({path:'wh_1.png'});
let s=await E(`({free:SAVE.wheel.free,res:$('whRes').textContent,prize:WH.prize,ad:!$('whAd').hidden,gem:!$('whGem').hidden,gems:SAVE.gems})`);
ok('giro gratis usato: '+s.res,s.free===1&&s.res.length>3);
if(s.prize){await p.click('#whGo');await p.waitForTimeout(600);await finishChest();ok('cassa della ruota aperta',await E(`$('chestScr').hidden`));await p.click('#wheelBtn');await p.waitForTimeout(400)}
ok('dopo il gratis: video e cristalli',await E(`!$('whAd').hidden&&!$('whGem').hidden&&$('whGo').hidden`));
await E(`WH.prize=null`);const g0=await E('SAVE.gems');await p.click('#whGem');await p.waitForTimeout(5300);
s=await E(`({paid:SAVE.wheel.paid,gems:SAVE.gems,cost:$('whGem').textContent})`);ok('giro con i cristalli (20, poi '+s.cost+')',s.paid===1&&s.gems<=g0-20+25&&/40/.test(s.cost));
if(await E('!!WH.prize')){await p.click('#whGo');await p.waitForTimeout(600);await finishChest();await p.click('#wheelBtn');await p.waitForTimeout(400)}
await E(`WH.prize=null;whButtons()`);await p.click('#whAd');await p.waitForTimeout(1200);await p.screenshot({path:'wh_ad.png'});ok('video segnaposto',await E(`!$('whAdScr').hidden`));
await p.waitForTimeout(9500);s=await E(`({ads:SAVE.wheel.ads,spin:WH.spin})`);ok('giro dopo il video',s.ads===1&&!s.spin);await p.screenshot({path:'wh_2.png'});
await E(`WH.prize=null;$('whScr').hidden=true;$('chestScr').hidden=true;CHbusy=false`);
// in a run the boss never opens the wheel any more
ok('niente ruota dopo il boss',!(await E(`String(update).includes('openWheel')`)));
console.log(R.join('\n'));console.log('ERRORS',JSON.stringify(errs));await b.close()})();
