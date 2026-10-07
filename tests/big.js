// big arenas: camera at the top near the door, a dark room, each chapter's landscape, small rooms setting
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c)=>R.push((c?'OK   ':'FAIL ')+n);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(2500);
ok('stanza 1 grande '+await E('AW+"x"+AH'),await E('AW>VW&&AH>VH'));
await E(`G.enemies.forEach(e=>{e.x=AW-40;e.y=TOP+30})`);await p.waitForTimeout(400);await p.screenshot({path:'big_arrows.png'});
await E(`for(const e of G.enemies)hurtE(e,1e6,false)`);await p.waitForTimeout(1500);await E(`P.x=AW/2;P.y=TOP+30`);await p.waitForTimeout(900);await p.screenshot({path:'big_top.png'});
ok('telecamera in alto',await E('G.vy<0'));
for(const [ch,room] of [[2,3],[3,3],[4,3]]){await E(`G.chapter=${ch};G.room=${room};G.event=null;buildRoom();P.x=30;P.y=BOT-20`);await p.waitForTimeout(900);await p.screenshot({path:'big_ch'+ch+'.png'})}
await E(`G.chapter=1;G.room=4;G.event=null;rollDark=()=>true;buildRoom()`);await p.waitForTimeout(900);await p.screenshot({path:'big_dark.png'});ok('stanza buia grande',await E('G.dark&&AW>VW'));
await E(`G.room=5;buildRoom()`);await p.waitForTimeout(600);ok('boss: stanza normale',await E('AW===VW&&AH===VH&&G.vx===0'));
await E(`SAVE.set.big=false;G.room=6;buildRoom()`);await p.waitForTimeout(300);ok('impostazione stanze piccole',await E('AW===VW'));
console.log(R.join('\n'),errs);await b.close()})();
