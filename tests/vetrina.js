// showcase: the same obstacles of every chapter, always in the same places, seen up close (node vetrina.js tag)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.addInitScript(()=>{if(sessionStorage.getItem('x'))return;sessionStorage.setItem('x',1);localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:null,anello:null,amuleto:null},slots:[null,null,null,null]}))});
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1200);const E=s=>p.evaluate(s=>__E(s),s);
await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun()`);await p.waitForTimeout(1500);
const tag=process.argv[2]||'v';
const sets={1:[['pillar',20],['boulder',20],['tomb',20],['urn',14],['gravestone',14],['stump',14]],2:[['basalt',20],['lavarock',18],['obsidian',18],['anvil',16],['cauldron',16],['crate',14]],3:[['deadtree',18],['totem',16],['mudmound',18],['reeds',14],['lantern',14],['swamprock',18]],4:[['iceblock',18],['snowpine',18],['frozenstatue',16],['snowman',16],['snowrock',18],['crystal',14]]};
for(const ch of [1,2,3,4]){await E(`(()=>{let sd=7;Math.random=()=>(sd=(sd*16807)%2147483647)/2147483647;P.inv=999;P.hp=P.maxhp=1e6;SAVE.set.big=false;G.chapter=${ch};G.room=3;G.event=null;rollDark=()=>false;buildRoom();G.enemies=[];
  const S=${JSON.stringify(sets[ch])};G.rocks=S.map(([kind,r],i)=>({x:i%2?250:110,y:220+Math.floor(i/2)*140,r,seed:i*1.7+.3,kind}));fields={};renderFloor();P.x=180;P.y=600;camSnap();$('banner').classList.remove('show');G.texts=[]})()`);
  await p.waitForTimeout(1500);await p.screenshot({path:`${tag}_${ch}.png`,clip:{x:15,y:150,width:360,height:520}})}
console.log(errs);await b.close()})();
