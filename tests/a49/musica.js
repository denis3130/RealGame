// the zombie match music: it starts on the map, follows the match (calm, round, hard round, boss, low health, down), its loudness
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:3,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',modo:'zombie'}))});
  await p.goto('file://'+D+'test_a49.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s);
  await E(`try{introEnd()}catch(e){};INTRO.on=false;initAudio();AU.on.music=true;AU.on.sfx=false;try{audioSettings()}catch(e){};window.__an=AU.ctx.createAnalyser();__an.fftSize=2048;AU.music.connect(__an);SAVE.modo='zombie';zGo();0`);
  for(let i=0;i<120;i++){await p.waitForTimeout(500);if(await E(`!!(ZG.on&&ZM.W.director&&AU.cur&&AU.cur.name==='zpartita')`))break}
  console.log('sulla mappa:',await E(`JSON.stringify({on:ZG.on,track:AU.cur&&AU.cur.name,st:ZM.W.director&&ZM.W.director.st})`));
  const meas=async(ms)=>{await E(`window.__pk=0;window.__ss=0;window.__n=0;window.__iv=setInterval(()=>{const d=new Float32Array(2048);__an.getFloatTimeDomainData(d);let s=0,pk=0;for(const v of d){s+=v*v;pk=Math.max(pk,Math.abs(v))}__pk=Math.max(__pk,pk);__ss+=s/d.length;__n++},40);0`);
    await p.waitForTimeout(ms);return JSON.parse(await E(`clearInterval(__iv);JSON.stringify({pk:+__pk.toFixed(3),rms:+Math.sqrt(__ss/Math.max(1,__n)).toFixed(4),I:+ZMU.I.toFixed(2)})`))};
  // freeze the match where we want it: no new zombies, the director's state set by hand
  await E(`ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;0`);
  const R=[];
  await E(`const D=ZM.W.director;D.st='pausa';D.t=-999;D.boss=null;D.hp=100;0`);R.push(['pausa',await meas(9000)]);
  await E(`const D=ZM.W.director,h=ZM.W.hero;D.st='round';D.R=2;D.left=0;D.bossT=0;D.t=0;for(let i=0;i<2;i++)ZM.W.Z.push({kind:'zombie',sc:1.1,x:h.x+600+i*30,y:h.y,face:0,p:0,anim:'idle',rise:1,die:0,flash:0,q:1,spd:0,spd0:0,hp:1e6,idle:0});0`);R.push(['round 2',await meas(9000)]);
  await E(`const D=ZM.W.director;D.R=14;for(let i=0;i<6;i++)ZM.W.Z.push({kind:'zombie',x:0,y:0,die:0,idle:0,rise:1});0`);R.push(['round 14, 6 zombie',await meas(9000)]);
  await E(`const D=ZM.W.director;D.boss={kind:'becchino',die:0,hp:1,hp0:1};0`);R.push(['boss',await meas(9000)]);
  await E(`const D=ZM.W.director;D.boss=null;D.hp=20;0`);R.push(['poca vita',await meas(7000)]);
  await E(`const D=ZM.W.director;D.hp=100;D.st='fine';0`);R.push(['caduto',await meas(6000)]);
  for(const[n,v] of R)console.log(n.padEnd(20),'picco',String(v.pk).padEnd(6),'volume',String(v.rms).padEnd(7),'intensità',v.I);
  // the menu music for comparison
  await E(`ZM.W.Z.length=0;0`);
  console.log(errs.slice(0,6).join('\n')||'nessun errore');await b.close()})();
