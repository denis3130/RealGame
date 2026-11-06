// the Night Challenge of the zombie mode: the button and the sheet in the Zombie, the rules in a real match, the medals and their prizes, the exit
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1000,gems:0,trophies:0,runs:3,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',modo:'zombie',zRec:4,zN:2,
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],mat:{ess:0,rot:0}}))});
  await p.goto('file://'+D+'test_a49.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s);const ok=(t,c,x)=>console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''));
  await E(`try{introEnd()}catch(e){};INTRO.on=false;try{closeSheet()}catch(e){};SAVE.modo='zombie';try{applyModeUI()}catch(e){};setTab('tabPlay');try{renderModesRow()}catch(e){};0`);await p.waitForTimeout(600);
  const btn=await E(`document.getElementById('chalBtn').textContent`);ok('nella Zombie il bottone Sfida è la Sfida della notte',/Sfida/.test(btn)&&/Nuova/.test(btn),btn);
  await E(`document.getElementById('chalBtn').click();0`);await p.waitForTimeout(500);await p.screenshot({path:D+'sf_foglio.png'});
  const sh=await E(`document.getElementById('sheet').innerText`);ok('il foglio: titolo, regola di stanotte, tre medaglie, domani',/Sfida della notte/.test(sh)&&/Bronzo/.test(sh)&&/Argento/.test(sh)&&/Oro/.test(sh)&&/Domani/.test(sh),sh.slice(0,140).replace(/\n/g,' | '));
  // the rule 'fragile' (60 life, crits) for the first match
  await E(`ZCH_R.push(ZCH_R.splice(ZCH_R.findIndex(r=>r.id==='fragile'),1)[0]);0`);
  await E(`(()=>{const R=ZCH_R.find(r=>r.id==='fragile');ZCH.on=true;ZCH.rule=R;closeSheet();zGo()})()`);
  for(let i=0;i<120;i++){await p.waitForTimeout(500);if(await E(`!!(ZG.on&&ZM.W.director&&ZM.W.director.st)`))break}await p.waitForTimeout(1200);
  const f=JSON.parse(await E(`JSON.stringify({vita:ZM.W.director.PZ.vita,hp:ZM.W.director.hp,crit:ZM.W.mods.crit,hud:!document.getElementById('mzSfida').hidden,txt:document.getElementById('mzSfida').textContent})`));
  ok('Cuore fragile: 60 di vita, colpi critici, la scritta della sfida',f.vita===60&&f.hp===60&&f.crit>=.33&&f.hud,f);await p.screenshot({path:D+'sf_partita.png'});
  // 'orda': zombies faster, double coins (Rigioca keeps the challenge, we change rule by hand)
  await E(`ZCH.rule=ZCH_R.find(r=>r.id==='orda');ZM.ctl.nuova();ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;0`);await p.waitForTimeout(400);
  const o=JSON.parse(await E(`(()=>{const h=ZM.W.hero,k=window.__MZ.addZombie('zombie',h.x+120,h.y,30),z=ZM.W.Z[k];return JSON.stringify({s0:z.spd})})()`));await p.waitForTimeout(300);
  const o2=JSON.parse(await E(`JSON.stringify({s1:ZM.W.Z[ZM.W.Z.length-1].spd,cash:ZM.W.mods.cash,vita:ZM.W.director.PZ.vita})`));ok('Orda famelica: zombie più veloci, monete doppie, vita di nuovo 100',Math.abs(o2.s1/o.s0-1.35)<.01&&o2.cash===2&&o2.vita===100,Object.assign(o,o2));
  // 'pistola': the pistol in hand, the wall guns' prompts never show
  await E(`ZCH.rule=ZCH_R.find(r=>r.id==='pistola');ZM.W.startGun='mitra';ZM.ctl.nuova();0`);await p.waitForTimeout(300);
  const pi=JSON.parse(await E(`JSON.stringify({gun:ZM.W.gunId,muri:ZM.buys.filter(b=>String(b.id).startsWith('muro_')).map(b=>b.show()),bara:(ZM.buys.find(b=>b.id==='bara')||{show:()=>null}).show()})`));
  ok('Solo pistola: la pistola in mano, armi a muro e Bara chiuse',pi.gun==='pistola'&&pi.muri.every(v=>!v)&&pi.bara===false,pi);
  // 'becchini': a boss at round 3, none at round 5
  await E(`ZCH.rule=ZCH_R.find(r=>r.id==='becchini');ZM.W.startGun=null;ZM.ctl.nuova();ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;ZM.W.director.startRound(3);0`);await p.waitForTimeout(300);
  const b3=JSON.parse(await E(`JSON.stringify({k:ZM.W.director.bossK,t:ZM.W.director.bossT})`));await E(`ZM.W.director.startRound(5);0`);await p.waitForTimeout(300);const b5=JSON.parse(await E(`JSON.stringify({k:ZM.W.director.bossK,left:ZM.W.director.left})`));
  ok('Notte dei becchini: il boss al round 3, niente boss al 5',b3.k==='becchino'&&b3.t>0&&!b5.k&&b5.left>10,{b3,b5});
  // the end at round 11: bronze and silver, their prizes, the line on the end screen
  const g0=JSON.parse(await E(`JSON.stringify({gold:SAVE.gold,rot:SAVE.mat.rot,r:SAVE.bustine.zombie.r||0})`));
  await E(`ZM.W.director.R=11;ZM.W.director.abbandona();0`);await p.waitForTimeout(1600);await p.screenshot({path:D+'sf_fine.png'});
  const g1=JSON.parse(await E(`JSON.stringify({gold:SAVE.gold,rot:SAVE.mat.rot,r:SAVE.bustine.zombie.r||0,got:SAVE.zchal.got,best:SAVE.zchal.best,txt:(document.querySelector('#mzPartita .zchEnd')||{}).innerText})`));
  ok('alla fine: bronzo e argento, 10 Rottami e una Bustina Rara, la riga sulla fine',g1.got[0]&&g1.got[1]&&!g1.got[2]&&g1.rot-g0.rot===10&&g1.r-g0.r===1&&/argento/.test(g1.txt||''),{g0,g1});
  // the same medals don't pay twice in the same night
  await E(`ZM.ctl.nuova();0`);await p.waitForTimeout(300);await E(`ZM.W.director.R=12;ZM.W.director.abbandona();0`);await p.waitForTimeout(800);
  const g2=JSON.parse(await E(`JSON.stringify({rot:SAVE.mat.rot,r:SAVE.bustine.zombie.r||0})`));ok('le stesse medaglie non pagano due volte nella stessa notte',g2.rot===g1.rot&&g2.r===g1.r,g2);
  // Menu: back to the menu, the challenge closed, the life back to 100, the next match normal
  await E(`(document.querySelector('#mzPartita .fine button[data-a="menu"]')||{click(){}}).click();0`);await p.waitForTimeout(1200);
  const ex=JSON.parse(await E(`JSON.stringify({on:ZCH.on,vita:ZM.W.director.PZ.vita,rig:ZM.W.director.PZ.rigenera,menu:!document.getElementById('menu').hidden})`));ok('dal menu la sfida è chiusa e tutto torna normale',!ex.on&&ex.vita===100&&ex.rig>0&&ex.menu,ex);
  await E(`zGo();0`);for(let i=0;i<60;i++){await p.waitForTimeout(400);if(await E(`!!ZG.on`))break}await p.waitForTimeout(800);
  const nm=JSON.parse(await E(`JSON.stringify({hud:document.getElementById('mzSfida')?document.getElementById('mzSfida').hidden:true,muri:ZM.buys.filter(b=>String(b.id).startsWith('muro_')).some(b=>b.show())})`));ok('la partita normale dopo: niente scritta della sfida, armi a muro di nuovo in vendita',nm.hud&&nm.muri,nm);
  console.log(errs.slice(0,6).join('\n')||'nessun errore');await b.close()})();
