// bosses in the big arenas: every chapter's bosses, entrance framed by the camera, then the fight
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c)=>R.push((c?'OK   ':'FAIL ')+n);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1500);
const only=process.argv[2];
for(const ch of [1,2,3,4]){const rooms=JSON.parse(await E(`G.chapter=${ch};JSON.stringify([...Array(12)].map((_,i)=>i+1).filter(r=>isBossRoom(r)))`));
  for(const room of rooms){if(only&&only!=ch+'_'+room)continue;await E(`P.inv=999;P.hp=P.maxhp=1e6;G.chapter=${ch};G.room=${room};G.event=null;buildRoom()`);await p.waitForTimeout(700);
    const st=JSON.parse(await E(`JSON.stringify({w:AW,h:AH,b:(G.enemies.find(e=>isBoss(e.type))||{}).type,vy:Math.round(G.vy)})`));ok(`cap ${ch} stanza ${room} boss ${st.b} arena ${st.w}x${st.h}`,st.w===460);
    await p.screenshot({path:`bb_${ch}_${room}_a.png`});await p.waitForTimeout(3500);await p.screenshot({path:`bb_${ch}_${room}_b.png`});
    await E(`P.x=AW-60;P.y=BOT-40`);await p.waitForTimeout(4000);await p.screenshot({path:`bb_${ch}_${room}_c.png`});}}
console.log(R.join('\n'),errs);await b.close()})();
