// the new missions and the event of the week: the zombie missions (only after a zombie match), their progress, the event's coin, the sheet,
// the prizes along the way, the button on the home screen in both modes
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1000,gems:10,trophies:900,runs:5,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',done:{c1:true,golem:true},trBest:900,zN:0,
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
  await p.goto('file://'+D+'test_a49.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s);const ok=(t,c,x)=>console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''));
  await E(`try{introEnd()}catch(e){};INTRO.on=false;try{closeSheet()}catch(e){};0`);
  // never played the Zombie: the daily and weekly draws never give zombie missions, the lists stay whole
  const a=JSON.parse(await E(`(()=>{const L0=MPOOL.length,W0=WPOOL.length;let z=0;for(let k=0;k<6;k++){SAVE.daily.day='x'+k;ensureDaily();if(SAVE.daily.list.some(m=>m.i>=ZMP0))z++;SAVE.weekly=null;const W=ensureWeekly();if(W.list.some(m=>m.i>=ZMW0))z++}return JSON.stringify({z,L:MPOOL.length===L0,W:WPOOL.length===W0,n:ZMIS_D.length})})()`));
  ok('senza partite nel camposanto niente missioni della Zombie, elenchi interi',a.z===0&&a.L&&a.W&&a.n===5,a);
  // after a zombie match: a zombie mission in today's list moves with the end of the match
  const m=JSON.parse(await E(`(()=>{SAVE.zN=1;SAVE.daily.list=[{i:ZMP0,p:0,done:false,claimed:false,r:0},{i:ZMP0+1,p:0,done:false,claimed:false,r:0},{i:ZMP0+2,p:0,done:false,claimed:false,r:0}];
    zFine(100,6,70);const L=SAVE.daily.list;return JSON.stringify(L.map(x=>[MPOOL[x.i].k,x.p,x.done]))})()`));
  ok('round 6 e 70 zombie: le missioni del round e degli zombie fatte',m[0][2]&&m[1][2]&&!m[2][2],m);
  // the event: today it is the night of the pumpkins; rooms, bosses and rounds give pumpkins
  const ev=JSON.parse(await E(`(()=>{const C=evCur();const t0=evSave().tok;mprog('room',null,3,true);mprog('boss','golem',1);const t1=evSave().tok;return JSON.stringify({id:C.id,end:C.end.toISOString().slice(0,10),dz:t0,d1:t1-t0})})()`));
  ok('oggi è la Notte delle zucche (fino al 7 novembre); una stanza 1 zucca, un boss 3',ev.id==='zucche'&&ev.d1===4&&ev.dz===12,ev);
  // the button in both modes, with the "!" when a prize is ready
  await E(`SAVE.evt.tok=25;evBtnK='';renderSide();0`);await p.waitForTimeout(300);
  const bt=JSON.parse(await E(`JSON.stringify({vis:document.getElementById('evtBtn').offsetParent!==null,pip:!!document.querySelector('#evtBtn .pip'),hot:document.getElementById('evtBtn').classList.contains('hot')})`));
  await p.screenshot({path:D+'ev_home_c.png'});await E(`SAVE.modo='zombie';try{applyModeUI()}catch(e){};try{renderPlay()}catch(e){};renderSide();0`);await p.waitForTimeout(800);
  const bz=await E(`document.getElementById('evtBtn').offsetParent!==null`);await p.screenshot({path:D+'ev_home_z.png'});ok('il bottone Evento nelle due modalità, col «!» quando c\'è un premio',bt.vis&&bt.pip&&bt.hot&&bz,Object.assign(bt,{zombie:bz}));
  // the sheet: take the first prize (300 gold)
  await E(`openSheet('evento');0`);await p.waitForTimeout(500);await p.screenshot({path:D+'ev_foglio.png'});
  const g0=await E(`SAVE.gold`);await E(`document.querySelector('#sheet button[data-evget="0"]').click();0`);await p.waitForTimeout(300);
  const g1=JSON.parse(await E(`JSON.stringify({gold:SAVE.gold,got:SAVE.evt.got,again:!!document.querySelector('#sheet button[data-evget="0"]')})`));ok('preso il primo premio: 300 oro, non si riprende',g1.gold-g0===300&&g1.got[0]===1&&!g1.again,{g0,g1});
  // all the way: the frame of the pumpkin in the Profile
  await E(`SAVE.evt.tok=210;fillEvento();for(let i=0;i<5;i++){const b=document.querySelector('#sheet button[data-evget]');if(b)b.click()}0`);await p.waitForTimeout(300);
  const fr=JSON.parse(await E(`JSON.stringify({got:SAVE.evt.got,fr:SAVE.xframes,bus:SAVE.bustine})`));ok('fino in fondo: tutti i premi e la cornice «Zucca»',fr.got.every(Boolean)&&(fr.fr||[]).includes('zucca'),fr);
  console.log(errs.slice(0,6).join('\n')||'nessun errore');await b.close()})();
