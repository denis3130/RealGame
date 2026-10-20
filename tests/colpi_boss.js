// I colpi dei 13 boss rifatti con src/js/93-colpi-unici.js (pagina di prova: python3 anteprime/mk_colpi.py --test → tests/colpi_test.html):
// per ogni boss entra nella sua stanza (BCL[tipo].enter), poi spara a mano i suoi colpi come li spara il suo cervello (shootE mentre il
// boss è quello aggiornato) e guarda il modo nuovo: le schegge pesanti del Golem che cadono dopo 130 px, quelle dello Yeti che rimbalzano
// una volta, i semi della Strega che accelerano, le tre ondate dell'Idra, i rombi del Burattinaio che vanno, si fermano e tornano, le bolle
// d'inchiostro della Piovra, le schegge del Cervo; che ogni boss abbia il suo suono di sparo; poi lascia combattere ogni boss 12 s (eroe che
// non muore) e conta gli errori. Foto tests/cub_<tipo>.png. Uso: node tests/colpi_boss.js [tipo ...]
const {chromium}=require('playwright');const path=require('path');
const ONLY=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'colpi_test.html'));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:20000});await p.waitForTimeout(600);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`)),W=ms=>p.waitForTimeout(ms);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x!=null?'  '+x:''));
  await E(`initAudio();AU.on.music=false;audioSettings();document.querySelectorAll('#cpPan').forEach(q=>q.hidden=true);modal=false;paused=false;
    window.__snd={};for(const k in CUSND){const f=CUSND[k];CUSND[k]=function(){__snd[k]=(__snd[k]||0)+1;return f.apply(this,arguments)}}
    const w=document.getElementById('cpWalk');w.checked=false;w.onchange({target:w});0`);
  const want=t=>!ONLY.length||ONLY.includes(t);
  const enter=async t=>{await E(`CPgo('b','${t}');0`);await W(900);await E(`(()=>{const e=(BCL['${t}'].find&&BCL['${t}'].find())||G.enemies.find(q=>q.type==='${t}');if(e){e.intro=0;e.hidden=false;e.alpha=1;e.z=0}P.x=(L+R)/2;P.y=BOT-80;return 0})()`);await W(300)};
  // fire like the brain: shootE while this boss is the one being updated
  const fire=(t,code)=>E(`(()=>{const e=(BCL['${t}'].find&&BCL['${t}'].find())||G.enemies.find(q=>q.type==='${t}');const k=CU.cur,n=CU.n;CU.cur=e;CU.n=0;try{${code}}finally{CU.cur=k;CU.n=n}return 0})()`);
  const BOSS=`((BCL[T].find&&BCL[T].find())||G.enemies.find(q=>q.type===T))`;
  if(want('golem')){await enter('golem');await E(`G.eproj=[];CU.fx.length=0;0`);await fire('golem',`shootE(e.x,e.y-10,-Math.PI/2+.3,150,7,10,'stone');window.__g={x:e.x,y:e.y-10}`);
    let mx=0,gone=false;for(let i=0;i<30;i++){await W(80);const s=await J(`(()=>{const q=G.eproj.find(q=>q.kind==='stone');return q?{d:Math.round(Math.hypot(q.x-__g.x,q.y-__g.y)),v:Math.round(Math.hypot(q.vx,q.vy))}:null})()`);if(s)mx=Math.max(mx,s.d);else{gone=true;break}}
    const chip=await J(`CU.fx.some(f=>f.k==='chip')`);ok('Golem: la scheggia pesante cade a terra dopo circa 130 px',gone&&chip&&mx>100&&mx<=140,`fino a ${mx} px, sparita ${gone}, sassolini ${chip}`)}
  if(want('yeti')){await enter('yeti');await E(`G.eproj=[];0`);await fire('yeti',`shootE(L+60,(TOP+BOT)/2,Math.PI,140,6,10,'yice')`);let bo=null;
    for(let i=0;i<30;i++){await W(80);bo=await J(`(()=>{const q=G.eproj.find(q=>q.kind==='yice');return q?{vx:Math.round(q.vx),b:q.cuBounce,x:Math.round(q.x)}:null})()`);if(bo&&bo.vx>0)break}
    ok('Yeti: la scheggia rimbalza sul muro e torna indietro',bo&&bo.vx>0&&bo.b===0,JSON.stringify(bo))}
  if(want('witch')){await enter('witch');await E(`G.eproj=[];0`);await fire('witch',`shootE(e.x,e.y-6,Math.PI/2,140,6,12,'wseed')`);await W(120);
    const v1=await J(`(()=>{const q=G.eproj.find(q=>q.kind==='wseed');return q?Math.round(Math.hypot(q.vx,q.vy)):0})()`);await W(1100);
    const v2=await J(`(()=>{const q=G.eproj.find(q=>q.kind==='wseed');return q?Math.round(Math.hypot(q.vx,q.vy)):0})()`);ok('Strega: i semi partono piano e accelerano',v1>0&&v2>v1*1.8,`${v1} → ${v2} px/s`)}
  if(want('hydra')){await enter('hydra');await E(`G.eproj=[];0`);await fire('hydra',`for(let i=0;i<16;i++)shootE(e.x,e.y-14,i*TAU/16,135,6,10,'hyglob')`);
    const n0=await J(`G.eproj.filter(q=>q.kind==='hyglob').length`);await W(160);const n1=await J(`G.eproj.filter(q=>q.kind==='hyglob').length`);await W(260);const n2=await J(`G.eproj.filter(q=>q.kind==='hyglob').length`);
    ok('Idra: l\'anello esce in tre ondate',n0>0&&n0<n1&&n1<n2&&n2===16,`${n0} → ${n1} → ${n2}`)}
  if(want('puppeteer')){await enter('puppeteer');await E(`G.eproj=[];CU.fx.length=0;0`);await fire('puppeteer',`for(let i=0;i<12;i++)shootE(e.x,e.y-16,i*TAU/12,135,7,12,'shadow');window.__pu={x:e.x,y:e.y-16}`);
    let far=0,hold=false,back=false,end=false;for(let i=0;i<40;i++){await W(80);const s=await J(`(()=>{const A=G.eproj.filter(q=>q.kind==='shadow');if(!A.length)return null;const q=A[0];return{n:A.length,look:q.cuLook,d:Math.round(Math.hypot(q.x-__pu.x,q.y-__pu.y)),v:Math.round(Math.hypot(q.vx,q.vy)),age:+q.age.toFixed(2)}})()`);
      if(!s){end=true;break}far=Math.max(far,s.d);if(s.v<2)hold=true;if(hold&&s.d<far-20)back=true;if(i===8)await p.screenshot({path:path.join(__dirname,'cub_puppeteer.png')})}
    ok('Burattinaio: i rombi vanno, si fermano, tornano da lui e spariscono',far>90&&hold&&back&&end,`fino a ${far} px, fermi ${hold}, ritorno ${back}, spariti ${end}`)}
  if(want('octopus')){await enter('octopus');await E(`G.eproj=[];0`);await fire('octopus',`for(let i=0;i<6;i++)shootE(e.x,e.y-14,i*TAU/6,115,7,11,'bubble')`);await W(300);
    const lk=await J(`G.eproj.filter(q=>q.kind==='bubble').map(q=>q.cuLook)`);ok('Piovra: bolle d\'inchiostro',lk.length===6&&lk.every(l=>l==='inkb'),JSON.stringify(lk));await p.screenshot({path:path.join(__dirname,'cub_octopus.png')})}
  if(want('stag')){await enter('stag');await E(`G.eproj=[];0`);await fire('stag',`for(let i=0;i<12;i++){const a=i*Math.PI/6;sgShoot(e.x+Math.cos(a)*60,e.y+Math.sin(a)*60-8,a,150,6,12,'ice',true)}`);await W(200);
    const lk=await J(`G.eproj.filter(q=>q.kind==='ice').map(q=>q.cuLook)`);ok('Cervo: l\'anello usa le sue schegge di cristallo',lk.length===12&&lk.every(l=>l==='stag'),JSON.stringify(lk.slice(0,3)))}
  // the sounds: every boss that shoots, its own
  if(!ONLY.length){await enter('salamander');await fire('salamander',`sl2shoot(e.x,e.y-14,1,165,12,30,false)`);await W(200);await enter('phoenix');await fire('phoenix',`shootE(e.x,e.y-30,1,220,6,13,'pfeather')`);await W(150);
    await fire('phoenix',`shootE(e.x,e.y-20,2,140,7,12,'pshard')`);await W(200);await enter('witch');await fire('witch',`shootE(e.x,e.y-16,1,120,6,11,'wthorn')`);await W(200);
    await enter('stag');await fire('stag',`sgShoot(e.x,e.y-20,1,170,6,12,'crystal',false)`);await W(200);
    const snd=await J(`__snd`),need=['bStone','bClack','bYice','bTink','bSeed','bThorn','bVenom','bBell','bTug','bBlub','bAurora','bMagma','bFeather','bPshard'];
    ok('ogni boss ha il suo suono di sparo',need.every(k=>snd[k]),'mancano: '+need.filter(k=>!snd[k]).join(', '))}
  // each boss fights 12 s with the new shots (the hero does not die), half of them in the second phase
  const ALL=['golem','salamander','toad','yeti','witch','smith','hydra','icequeen','mimic','puppeteer','phoenix','octopus','stag'].filter(want);
  for(const t of ALL){const e0=errs.length;await enter(t);await E(`window.__iv&&clearInterval(__iv);window.__iv=setInterval(()=>{P.hp=P.maxhp;if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},100);0`);
    await W(6000);await E(`(()=>{const T='${t}',e=${BOSS};if(e&&!e.p2)e.hp=Math.min(e.hp,e.max*.48);return 0})()`);await W(6000);await p.screenshot({path:path.join(__dirname,`cub_${t}.png`)});
    const st=await J(`(()=>{const T='${t}',e=${BOSS};return{vivo:!!e,p2:!!(e&&e.p2),colpi:G.eproj.length}})()`);ok(`${t}: 12 s di lotta senza errori`,errs.length===e0,JSON.stringify(st)+(errs.length>e0?' '+errs.slice(e0).join(' | '):''))}
  await E(`window.__iv&&clearInterval(__iv);0`);
  console.log(R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
