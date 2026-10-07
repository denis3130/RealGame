// every boss fights for a while: capture the arena after its moves (marks on the floor, cracked obstacles, fire...)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test_b2.html');await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
const only=process.argv[2];
for(const id of ['golem','witch','salamander','smith','toad','hydra','yeti','icequeen','mimic']){if(only&&!only.split(',').includes(id))continue;await E(`__b2show('${id}')`);await p.waitForTimeout(800);
  // fast forward the fight, the hero dodging around the boss
  await E(`(()=>{for(let i=0;i<60*14;i++){const b=G.enemies.find(e=>isBoss(e.type));if(b){const a=G.t*.7;P.x=clamp(b.x+Math.cos(a)*120,L+20,R-20);P.y=clamp(b.y+Math.sin(a)*90+60,TOP+20,BOT-20)}update(1/60)}const b=G.enemies.find(e=>isBoss(e.type));P.x=b.x;P.y=Math.min(BOT-30,b.y+170);camSnap()})()`);
  await p.waitForTimeout(500);await p.screenshot({path:`mv_${id}.png`})}
console.log(errs);await b.close()})();
