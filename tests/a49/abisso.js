// the richer Abyss: the four new bosses in their rooms, the pact after a boss of the Abyss, the treasures at the end of the descent
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1000,gems:10,trophies:900,runs:5,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',done:{c1:true,golem:true},trBest:900,
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],inf:{best:12,top:[]}}))});
  await p.goto('file://'+D+'test_a49.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s);const ok=(t,c,x)=>console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''));
  await E(`try{introEnd()}catch(e){};INTRO.on=false;try{closeSheet()}catch(e){};0`);
  await E(`SAVE.sel='inf';startRun();0`);await p.waitForTimeout(2500);
  const m=JSON.parse(await E(`JSON.stringify({mode:G.mode,room:G.room,b:[5,40,45,50,55,60,65,105,120].map(n=>boss3At(n)),c45:compositionFor(45),z45:zoneOf(45),bossRoom:[45,60].map(isBossRoom)})`));
  ok("nell'Abisso i boss nuovi alle stanze 45, 50, 55, 60 (e di nuovo dalla 105)",m.mode==='inf'&&m.b.join()===',,puppeteer,phoenix,octopus,stag,,puppeteer,stag'&&m.c45[0]==='puppeteer'&&m.bossRoom.every(Boolean),m);
  // the pact: as if the boss of room 5 had just been beaten
  const p0=JSON.parse(await E(`JSON.stringify({atk:P.atk,hp:P.maxhp,aspd:P.aspd,crit:P.crit,gold:P.goldMul})`));
  await E(`G.room=5;onRoomClear();G.corpses=[];0`);for(let i=0;i<20;i++){await p.waitForTimeout(150);if(await E(`!!(document.getElementById('pactScr')&&!document.getElementById('pactScr').hidden)`))break}
  await p.waitForTimeout(700);await p.screenshot({path:D+'ab_patto.png'});
  const pu=JSON.parse(await E(`JSON.stringify({open:!document.getElementById('pactScr').hidden,n:document.querySelectorAll('#pactScr .pc').length,paused,modal,ids:PACT.offer.map(p=>p.id)})`));ok('dopo il boss il patto: tre sigilli, il gioco fermo',pu.open&&pu.n===3&&pu.paused&&pu.modal,pu);
  await E(`PACT.offer[0]=PATTI.find(p=>p.id==='sangue');document.querySelector('#pactScr .pc[data-i="0"]').click();0`);await p.waitForTimeout(300);
  const p1=JSON.parse(await E(`JSON.stringify({atk:P.atk,hp:P.maxhp,pacts:G.pacts,paused,modal,open:!document.getElementById('pactScr').hidden})`));
  ok('il Patto del sangue: Attacco +30%, Salute −20%, il gioco riparte',Math.abs(p1.atk/p0.atk-1.3)<.01&&Math.abs(p1.hp/p0.hp-.8)<.02&&!p1.paused&&!p1.modal&&!p1.open&&p1.pacts[0]==='sangue',{p0,p1});
  // a second pact never offers the same one; the seer's pact makes the bosses stronger
  await E(`G.room=10;onRoomClear();G.corpses=[];0`);for(let i=0;i<20;i++){await p.waitForTimeout(150);if(await E(`!document.getElementById('pactScr').hidden`))break}
  const p2=JSON.parse(await E(`JSON.stringify(PACT.offer.map(p=>p.id))`));ok('il secondo patto non offre di nuovo il primo',!p2.includes('sangue'),p2);
  await E(`PACT.offer[1]=PATTI.find(p=>p.id==='veggente');document.querySelector('#pactScr .pc[data-i="1"]').click();0`);await p.waitForTimeout(200);
  const bh=JSON.parse(await E(`(()=>{const e=makeE('golem',100,100);return JSON.stringify({k:G.pactBoss,hp:e.hp,base:ET.golem.hp*bossMul()})})()`));ok('il Patto del veggente: i boss hanno il 25% di vita in più',Math.abs(bh.hp/bh.base-1.25)<.01,bh);
  // the end of the descent at room 46: the chest, 12 crystals, an Epic Classic pack, the line on the end screen
  const s0=JSON.parse(await E(`JSON.stringify({gems:SAVE.gems,e:SAVE.bustine.classica.e||0})`));
  await E(`G.room=46;G.gemsRun=0;G.gems=[];endRun(false,false);0`);await p.waitForTimeout(900);await p.screenshot({path:D+'ab_fine.png'});
  const s1=JSON.parse(await E(`JSON.stringify({gems:SAVE.gems,e:SAVE.bustine.classica.e||0,txt:(document.getElementById('endAbyss')||{}).textContent})`));
  ok("a fine discesa i tesori dell'Abisso: 12 cristalli e una Bustina Epica",s1.gems-s0.gems>=12&&s1.e-s0.e===1&&/Epica/.test(s1.txt||'')&&/Patti stretti: 2/.test(s1.txt||''),{s0,s1});
  console.log(errs.slice(0,6).join('\n')||'nessun errore');await b.close()})();
