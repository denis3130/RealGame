// skeleton check: one room full of crossbow skeletons, screenshots while they shoot and dash
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:6,introSeen:1,tutDone:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(2500);
await E(`G.enemies=[];for(const [x,y] of [[90,200],[270,200],[180,150]]){const e=makeE('skeleton',x,y,0);G.enemies.push(e)}G.state='play';P.x=180;P.y=500`);
let st={shots:0,dash:0};for(let i=0;i<12;i++){await p.waitForTimeout(500);const r=JSON.parse(await E(`JSON.stringify({n:G.eproj.filter(q=>q.kind==='arrow').length,d:G.enemies.filter(e=>e.lunge>0||e.wind>0).length,hp:P.hp})`));st.shots=Math.max(st.shots,r.n);st.dash+=r.d;await E(`P.hp=P.maxhp`);if(i===5||i===9)await p.screenshot({path:'sk_'+i+'.png'})}
console.log(JSON.stringify(st),errs);await b.close()})();
