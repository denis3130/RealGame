// I modi di sparare dei colpi unici (src/js/93-colpi-unici.js) messi alla prova uno a uno nella pagina di prova
// (python3 anteprime/mk_colpi.py --test → tests/colpi_test.html): la riga di mira del goblin, le tre frecce in fila dell'élite, i dardi
// piantati nei muri, i semi che rallentano, le fiammelle che danzano, il teschietto che segue, lo sputo della rana che fa male solo a terra,
// i fiocchi a spirale, le schegge della sentinella che partono e ricrescono, i petali che si chiudono, la palla di fuoco che si spacca, lo
// spillo a zig zag, il raggio dell'occhio, le meteore e le bombe; e che ogni colpo abbia il suo suono. Uso: node tests/colpi_moto.js
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,tutDone:1,handSeen:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'colpi_test.html'));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:20000});await p.waitForTimeout(600);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`)),W=ms=>p.waitForTimeout(ms);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x!=null?'  '+x:''));
  await E(`initAudio();AU.on.music=false;audioSettings();document.querySelectorAll('#cpPan').forEach(q=>q.hidden=true);modal=false;paused=false;
    window.__snd={};for(const k in CUSND){const f=CUSND[k];CUSND[k]=function(){__snd[k]=(__snd[k]||0)+1;return f.apply(this,arguments)}}
    window.__hits=0;{const _h=hurtP;hurtP=function(){__hits++;return _h.apply(this,arguments)}}
    const w=document.getElementById('cpWalk');w.checked=false;w.onchange({target:w});0`);
  const el=async v=>E(`(()=>{const c=document.getElementById('cpEl');c.checked=${v};c.onchange({target:c});return 0})()`);
  const go=async(t,v)=>{await el(!!v);await E(`CPgo('e','${t}');0`);await W(700)};
  const demo=`G.enemies.find(q=>q.cuDemo)`;
  // the goblin: the dotted line while it aims, then three arrows on one line (elite)
  await go('goblin',true);let aimSeen=false,arrows=[];
  for(let i=0;i<60;i++){await W(80);const s=await J(`(()=>{const e=${demo};return{aim:e&&e.aim,ar:G.eproj.filter(q=>q.cuK==='cuArrow').map(q=>[Math.round(q.x),Math.round(q.y),+q.a.toFixed(3)])}})()`);
    if(s.aim>0&&s.aim<.6&&!aimSeen){aimSeen=true;await p.screenshot({path:path.join(__dirname,'cu_m_mira.png')})}if(s.ar.length>arrows.length)arrows=s.ar;if(arrows.length>=3)break}
  ok('goblin: riga di mira mentre mira',aimSeen);
  ok('goblin élite: tre frecce in fila sulla stessa riga',arrows.length===3&&arrows.every(q=>Math.abs(q[2]-arrows[0][2])<1e-3),JSON.stringify(arrows));
  // the skeleton: bolts stuck in the wall
  await go('skeleton');await E(`(()=>{const e=${demo};CU.cur=null;for(const a of[Math.PI,0,-Math.PI/2])CU.shoot(e.x,e.y-12,a,165,5,12,'cuBolt');return 0})()`);
  let st=0;for(let i=0;i<40&&st<3;i++){await W(100);st=await J(`CU.stuck.length`)}ok('scheletro: i dardi restano piantati nei muri',st>=3,st);
  // the elite skeleton: three parallel bolts
  await go('skeleton',true);let bo=[];for(let i=0;i<60;i++){await W(80);bo=await J(`G.eproj.filter(q=>q.cuK==='cuBolt'&&q.age<.05).map(q=>[+q.a.toFixed(3),Math.round(q.x),Math.round(q.y)])`);if(bo.length>=3)break}
  ok('scheletro élite: tre dardi paralleli',bo.length>=3&&bo.every(q=>q[0]===bo[0][0]),JSON.stringify(bo));
  // the plant: the seeds slow down to half
  await go('plant');let sd=null;for(let i=0;i<60;i++){await W(80);sd=await J(`G.eproj.filter(q=>q.cuK==='cuSeed').map(q=>[+q.age.toFixed(2),Math.round(Math.hypot(q.vx,q.vy)),Math.round(q.cuV0||0)])`);if(sd.some(q=>q[0]>1))break}
  ok('pianta: i semi rallentano fino a metà',sd&&sd.some(q=>q[0]>1&&Math.abs(q[1]-q[2]*.5)<3),JSON.stringify(sd&&sd.slice(0,3)));
  // the wisp: the little flames weave
  await go('wisp');let wo=null;for(let i=0;i<80;i++){await W(60);wo=await J(`G.eproj.filter(q=>q.cuK==='cuWisp').map(q=>[+q.age.toFixed(2),+(Math.abs(((q.ma-q.a+9.42)%6.283)-3.14)).toFixed(2)])`);if(wo.some(q=>q[0]>.25))break}
  ok('fuoco fatuo: le fiammelle danzano (la direzione oscilla intorno a quella del tiro)',wo&&wo.some(q=>q[1]>.08),JSON.stringify(wo));
  // the necromancer: the little skull follows a little
  await go('necro');const hk=await J(`(()=>{const e=${demo};G.eproj=[];CU.cur=null;const a=Math.atan2(P.y-e.y,P.x-e.x)+.9,q=CU.shoot(e.x,e.y-20,a,135,7,11,'cuSkull',{cuHome:{w:1.25,t:1.8}});return{a0:+(.9).toFixed(2)}})()`);
  await W(900);const hk2=await J(`(()=>{const q=G.eproj.find(q=>q.cuK==='cuSkull');if(!q)return null;return{off:+Math.abs(angDiff(Math.atan2(q.vy,q.vx),Math.atan2(P.y-6-q.y,P.x-q.x))).toFixed(2)}})()`);
  ok('negromante: il teschietto ti segue (l\'angolo verso di te si chiude)',hk2&&hk2.off<.5,JSON.stringify(hk2));
  // the frog: the gob hurts only when it lands
  await go('frog');const fr=await J(`(()=>{const e=${demo};e.cd=99;e.crouch=0;e.jump=0;G.eproj=[];CU.cur=null;P.x=200;P.y=500;P.inv=0;P.dashT=0;__hits=0;const sp=170*Math.min(1.7,1+(effRoom()-1)*.035),per=.34;
    // the hero half a hop away: the gob passes over him in the air
    const d=sp*per*.5;CU.shoot(P.x-d,P.y-6,0,170,6,11,'cuGob',{cuHop:{per,h:15},r0:6,life:per*4-.005,z:0});window.__fr={d,sp};return __fr})()`);
  await W(380);const h1=await J(`__hits`);await E(`(()=>{G.eproj=[];P.inv=0;__hits=0;const per=.34,d=__fr.sp*per;CU.shoot(P.x-d,P.y-6,0,170,6,11,'cuGob',{cuHop:{per,h:15},r0:6,life:per*4-.005,z:0});return 0})()`);
  await W(450);const h2=await J(`__hits`);ok('rana: lo sputo in aria passa sopra l\'eroe, quando tocca terra fa male',h1===0&&h2>=1,`in aria ${h1}, a terra ${h2}`);
  // the snow spirit: the ring turns as it opens
  await go('snowspirit');let fl=null;for(let i=0;i<80;i++){await W(80);fl=await J(`G.eproj.filter(q=>q.cuK==='cuFlake').map(q=>[+q.age.toFixed(2),+angDiff(q.a0||(q.a0=q.a),Math.atan2(q.vy,q.vx)).toFixed(2)])`);if(fl.some(q=>q[0]>1))break}
  ok('spirito della neve: la corona gira a spirale',fl&&fl.some(q=>q[0]>1&&Math.abs(q[1])>.6),JSON.stringify(fl&&fl.slice(0,3)));
  // the ice sentinel: its shards fly off one after another and grow back
  await go('icesentinel');let sh0=null;for(let i=0;i<70;i++){await W(80);sh0=await J(`(()=>{const e=${demo};return{n:G.eproj.filter(q=>q.cuK==='cuShard').length,hp:e.shards.map(s=>s.hp)}})()`);if(sh0.n>=3)break}
  ok('sentinella: lancia le sue tre schegge',sh0&&sh0.n>=3&&sh0.hp.every(h=>h<=0),JSON.stringify(sh0));
  await W(1700);const sh1=await J(`(()=>{const e=${demo};return e.shards.map(s=>s.hp)})()`);ok('sentinella: le schegge ricrescono',sh1.filter(h=>h>0).length>=2,JSON.stringify(sh1));
  // the eye flower: the petals close where you were
  await go('eyeflower',true);await E(`P.x=(L+R)/2;P.y=TOP+420;0`);let pm=null;
  for(let i=0;i<80;i++){await W(50);const s=await J(`(()=>{const A=G.eproj.filter(q=>q.cuK==='cuPetal'&&q.cuCurve!==undefined||q.cuK==='cuPetal');if(A.length<5)return null;let m=1e9;for(const a of A)for(const c of A)if(a!==c)m=Math.min(m,Math.hypot(a.x-c.x,a.y-c.y));return{n:A.length,m:Math.round(m),age:+A[0].age.toFixed(2)}})()`);if(s){pm=pm&&pm.m<s.m?pm:s}if(s&&s.age>1.6)break}
  ok('fiore occhio: i petali si chiudono (si avvicinano tra loro)',pm&&pm.m<16,JSON.stringify(pm));
  // the imp: the fireball splits
  await go('imp');let em=0;for(let i=0;i<70;i++){await W(80);em=await J(`G.eproj.filter(q=>q.cuK==='cuEmber').length`);if(em>=3)break}ok('diavoletto: la palla di fuoco si spacca in tre braci',em>=3,em);
  await go('imp',true);em=0;for(let i=0;i<70;i++){await W(80);em=await J(`G.eproj.filter(q=>q.cuK==='cuEmber').length`);if(em>=5)break}ok('diavoletto élite: in cinque',em>=5,em);
  // the puppet: the pin zigzags
  await go('puppet');let pz=null;for(let i=0;i<80;i++){await W(60);pz=await J(`G.eproj.filter(q=>q.cuK==='cuPin').map(q=>[+q.age.toFixed(2),+angDiff(q.a,q.ma==null?q.a:q.ma).toFixed(2)])`);if(pz.some(q=>q[0]>.3))break}
  ok('burattino: lo spillo va a zig zag',pz&&pz.some(q=>Math.abs(q[1])>.1),JSON.stringify(pz));
  // the stare, the meteors and the bombs
  await go('shadoweye');let ey=0;for(let i=0;i<60;i++){await W(80);ey=await J(`G.lines.filter(l=>l.col==='cuEye').length`);if(ey)break}ok('occhio d\'ombra: il raggio suo',ey>0,ey);await W(1200);
  await go('pyro');let me=0;for(let i=0;i<60;i++){await W(80);me=await J(`G.meteors.filter(m=>m.cu==='pyro').length`);if(me)break}ok('piromante: la meteora sua',me>0,me);
  await go('bomber');let bm=0;for(let i=0;i<60;i++){await W(80);bm=await J(`G.lobs.filter(m=>m.cu==='bomber').length`);if(bm)break}ok('nano: la bomba sua',bm>0,bm);await W(1600);
  await go('bat',true);await W(3200);
  // every shot its own sound
  const snd=await J(`__snd`);const need=['cuArrow','cuBolt','tock','cuScreech','cuSeed','cuWisp','cuSkull','cuGob','cuFlake','cuShard','cuPetal','cuFire','pop','cuPin','eyeCharge','eyeZap','meteor','fuse'];
  ok('ogni colpo ha il suo suono',need.every(k=>snd[k]),'mancano: '+need.filter(k=>!snd[k]).join(', ')+' · '+JSON.stringify(snd));
  console.log(R.join('\n'));console.log(errs.length?'ERRORI:\n'+[...new Set(errs)].slice(0,20).join('\n'):'nessun errore');await b.close()})();
