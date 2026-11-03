// La partita zombie della pagina tripla A in prima persona (Denis, 3 novembre: «fammi giocare in prima persona e l'altra visuale in 3d»):
// prima python3 tests/t3/mk.py, poi node tests/t3/prima.js.
// La visuale 3D della Zombie (105, con 107 e 108) disegna con lo stesso contesto 3D della pagina; la partita parte da sola in prima persona;
// in prima persona l'arma 3D in mano e si spara allo zombie che si guarda; il bottone «Visuale» passa alla terza persona (l'eroe in 3D) e alla
// vista dall'alto, poi di nuovo alla prima; uscendo dalla partita il menu torna in 3D (l'assedio, poi le isole della Classica); la mira di 104
// solo nella Zombie. Foto tests/t3/tr_prima.jpg (prima persona, terza persona, dall'alto).
const {chromium}=require('playwright');const D=__dirname+'/';
let ok=0,ko=0;const ck=(c,m)=>{if(c){ok++;console.log('  sì  '+m)}else{ko++;console.log('  NO  '+m)}};
const SAVE={gold:5000,gems:500,trophies:900,runs:12,introSeen:1,handSeen:1,starter:'arciere',hero:'arciere',heroes:{arciere:1},modo:'classica',tutDone:1,zRec:6,zN:3,
  cn:{br:{0:40},stars:{0:1},pick:0},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});// (3D without a graphics card: slow, so 1×)
  const p=await b.newPage({viewport:{width:390,height:763},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200))});
  await p.addInitScript(s=>{localStorage.setItem('cripta_save_v1',s)},JSON.stringify(SAVE));
  await p.goto('file://'+D+'test_t3.html');await p.waitForTimeout(3000);const E=s=>p.evaluate(s=>window.__E(s),s),J=async s=>JSON.parse(await E(s));
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);0`);
  // (on this computer a frame can take a second: wait for the next ones, not for a fixed time)
  await p.waitForFunction(()=>__E('T3I.live'),null,{timeout:90000}).catch(()=>{});
  // (the siege of the Zombie menu made at once, as the spare moments of the menu would make it)
  for(let k=0;k<80;k++){if(await E(`(()=>{if(!T3F.ready)t3FBuild(40);else if(!T3F.zq||T3F.zi<T3F.zq.length)t3FZBuild(40);return T3F.ready&&T3F.zq&&T3F.zi>=T3F.zq.length?1:0})()`))break}
  console.log('La visuale nella pagina tripla A');
  let s=await J(`JSON.stringify({same:__V3.gl===__T3.gl,start:__V3.start,cl:MIRA.cl,next:V3NEXT})`);
  ck(s.same&&s.start==='prima'&&s.cl===false&&s.next.prima==='terza'&&s.next.terza==='alto'&&s.next.alto==='prima','la visuale zombie usa lo stesso disegno 3D della pagina, parte in prima persona, la mira della Classica è spenta '+JSON.stringify(s));
  // the match: it starts by itself in first person
  console.log('La partita');
  await E(`try{closeSheet()}catch(e){};SAVE.modo='zombie';zGo();0`);
  await p.waitForFunction(()=>__E('!!(ZG.on&&ZM.W.director&&ZM.W.director.st&&__V3.built&&__V3.on)'),null,{timeout:240000}).catch(()=>{});
  s=await J(`JSON.stringify({zg:ZG.on,built:__V3.built,mode:__V3.mode,on:ZM.W.v3.on,btn:(document.getElementById('v3btn')||{}).textContent||'',cv:__T3.cv.parentNode&&__T3.cv.parentNode.id,host:T3I.host})`);
  ck(s.zg&&s.built&&s.mode==='prima'&&s.on&&/Prima persona/.test(s.btn)&&s.cv==='mz'&&s.host==='zombie','la partita parte da sola in prima persona, col bottone «Visuale» e il disegno 3D sotto la mappa '+JSON.stringify(s));
  await E(`ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);
  const put=(off,dist)=>E(`(()=>{const h=ZM.W.hero,f=__V3.th+(${off});for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const k=window.__MZ.addZombie('zombie',h.x+Math.cos(f)*${dist},h.y+Math.sin(f)*${dist},0);const z=ZM.W.Z[k];z.hp=99999;z.q=1;z.stun=999;return 1})()`);
  // first person: the 3D gun in the hand, the zombie in front shot
  await E(`window.__MZ.view(0);0`);await p.waitForTimeout(1500);await put(.04,140);await p.waitForTimeout(800);const m0=await E(`MZ.shots`);
  await p.waitForFunction(m=>__E(`MZ.shots>${m}`),m0,{timeout:60000}).catch(()=>{});await p.waitForTimeout(1500);
  s=await J(`JSON.stringify({shots:MZ.shots-${m0},vm3:__V3.vm3===true,vm:Array.isArray(__V3.vmMuz),figs:__V3.figs||''})`);const sh1=await p.screenshot();
  ck(s.shots>=1&&s.vm3&&s.vm&&!/h/.test(s.figs)&&/z/.test(s.figs),'in prima persona l\'arma 3D in mano, niente eroe, e si spara allo zombie che si guarda '+JSON.stringify(s));
  // the «Visuale» button: third person (the 3D hero), from above, first person again
  await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);document.getElementById('v3btn').click();0`);
  await p.waitForFunction(()=>__E(`__V3.mode==='terza'&&__V3.h3ok===true`),null,{timeout:60000}).catch(()=>{});await p.waitForTimeout(1500);
  s=await J(`JSON.stringify({mode:__V3.mode,h3:__V3.h3ok,btn:document.getElementById('v3btn').textContent})`);const sh2=await p.screenshot();
  ck(s.mode==='terza'&&s.h3&&/Terza persona/.test(s.btn),'«Visuale»: la terza persona, con l\'eroe in 3D '+JSON.stringify(s));
  await E(`document.getElementById('v3btn').click();0`);await p.waitForTimeout(2500);
  s=await J(`JSON.stringify({mode:__V3.mode,on:ZM.W.v3.on,cv:__T3.cv.style.display,btn:document.getElementById('v3btn').textContent})`);const sh3=await p.screenshot();
  ck(s.mode==='alto'&&!s.on&&s.cv==='none'&&/Dall'alto/.test(s.btn),'poi la vista dall\'alto di sempre '+JSON.stringify(s));
  await E(`document.getElementById('v3btn').click();0`);await p.waitForFunction(()=>__E(`__V3.mode==='prima'&&ZM.W.v3.on`),null,{timeout:30000}).catch(()=>{});
  ck(await E(`__V3.mode==='prima'&&ZM.W.v3.on&&__T3.cv.style.display===''`),'e di nuovo la prima persona');
  // out of the match: the menu in 3D again (the siege, then the islands of the Classic)
  console.log('Dopo la partita');
  await E(`zExit();0`);await p.waitForFunction(()=>__E('!ZG.on&&T3F.shown'),null,{timeout:120000}).catch(()=>{});await p.waitForTimeout(1500);
  s=await J(`JSON.stringify({zg:ZG.on,shown:T3F.shown,host:T3I.host,cv:__T3.cv.parentNode===campCv.parentNode,disp:__T3.cv.style.display})`);
  ck(!s.zg&&s.shown&&s.host==='menu'&&s.cv&&s.disp==='block','fuori dalla partita l\'assedio del menu Zombie torna in 3D '+JSON.stringify(s));
  await E(`document.querySelectorAll('#sheetScr').forEach(e=>e.hidden=true);0`);await p.click('#cSprout',{force:true}).catch(()=>{});
  await p.waitForFunction(()=>__E('!MM.tr&&!zMode()&&T3I.live'),null,{timeout:240000}).catch(()=>{});
  ck(await E(`!MM.tr&&!zMode()&&T3I.live&&__T3.cv.style.display==='block'`),'e le isole della Classica in 3D col germoglio');
  s=await J(`JSON.stringify({v3:__V3.err,t3:__T3.err})`);ck(!s.v3&&!s.t3&&!errs.length,'nessun errore '+JSON.stringify(s)+(errs.length?' '+errs.slice(0,3).join(' | '):''));
  // the photo: first person, third person, from above
  {const html=`<body style="margin:0;background:#111;display:flex;gap:6px">${[sh1,sh2,sh3].map(x=>`<img style="width:390px" src="data:image/png;base64,${x.toString('base64')}">`).join('')}</body>`;
    const q=await b.newPage({viewport:{width:1182,height:763}});await q.setContent(html);await q.waitForTimeout(300);await q.screenshot({path:D+'tr_prima.jpg',type:'jpeg',quality:84});await q.close()}
  console.log(`\n${ok} sì, ${ko} no`);await b.close();process.exit(ko?1:0)})();
