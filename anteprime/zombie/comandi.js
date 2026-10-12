// Prova dei comandi della telecamera 3D: due dita vere (Input.dispatchTouchEvent di Chrome con hasTouch), tastiera, mouse, bussola, ganci __MZ.
// Uso: python3 anteprime/zombie/mk.py && node anteprime/zombie/comandi.js [pagina] [cartella]  → stampa i controlli (OK/NO) e salva cm_*.png
// (predefiniti: anteprime/zombie.html e anteprime/zombie/vetrina/comandi, non su git)
const {chromium}=require('../../node_modules/playwright');const path=require('path'),fs=require('fs');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html')),D=path.resolve(process.argv[3]||path.join(__dirname,'vetrina','comandi'));fs.mkdirSync(D,{recursive:true});
const ok=[],ko=[];const check=(name,cond,info)=>{(cond?ok:ko).push(name+(info!==undefined?' → '+JSON.stringify(info):''))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  const p=await ctx.newPage();await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+PAGE);await p.waitForTimeout(2500);
  await p.evaluate(()=>{__MZ.zombies(false);__MZ.W.dbg.noShoot=true});
  const cdp=await ctx.newCDPSession(p);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
  const V=()=>p.evaluate(()=>__MZ.view()),C=()=>p.evaluate(()=>__MZ.ctl()),W8=ms=>p.waitForTimeout(ms);
  const drag=async(x,y,dx,dy,n,id,keep)=>{id=id||5;await T('touchStart',[{x,y,id}]);for(let i=1;i<=n;i++){await T('touchMove',[{x:x+dx*i/n,y:y+dy*i/n,id}]);await W8(16)}if(!keep)await T('touchEnd',[])};
  const hs=()=>p.evaluate(()=>{const h=__MZ.W.hero;return __MZ.toScreen(h.x,h.y,0)});
  // 1 trascinare a destra: gira a destra (ψ scende), il terreno sotto l'eroe va a destra col dito
  // dopo il salto dell'eroe la visuale lo raggiunge piano (in headless i fotogrammi sono lenti): si aspetta che il perno sia sull'eroe, altrimenti
  // girando lo scarto rimasto fa muovere l'eroe sullo schermo e il controllo «resta fermo» fallisce per il tempo della prova, non per la telecamera
  await p.evaluate(()=>{__MZ.tp(4.4*64,7.2*64);__MZ.view(0,45)});await W8(700);
  for(let i=0;i<120;i++){if(await p.evaluate(()=>{const C=__MZ.CAM,h=__MZ.W.hero;return Math.hypot(C.x-h.x,C.y-h.y)<.15}))break;await W8(50)}
  const s0=await p.evaluate(()=>{const h=__MZ.W.hero;return __MZ.toScreen(h.x,h.y+60,0)});const h0=await hs();
  await drag(300,640,100,0,10);await W8(400);let v=await V();
  const s1=await p.evaluate(()=>{const h=__MZ.W.hero;return __MZ.toScreen(h.x,h.y+60,0)});const h1=await hs();
  check('destra = gira a destra (ψ<0)',v.yaw<-45&&v.yaw>-70,v.yaw.toFixed(1));check('il terreno sotto l\'eroe segue il dito',s1[0]-s0[0]>20,[s0,s1].map(a=>a.map(Math.round)));
  check('l\'eroe resta fermo sullo schermo mentre gira',Math.hypot(h1[0]-h0[0],h1[1]-h0[1])<2,[h0,h1].map(a=>a.map(Math.round)));
  // 2 lasciata, resta dove l'ho lasciata
  await W8(1000);const v2=await V();check('resta dove la lasci',Math.abs(v2.yaw-v.yaw)<.01,[v.yaw,v2.yaw]);
  await p.screenshot({path:D+'/cm_1_gira.png'});
  // 3 su: più di lato fino al limite (si tira oltre e torna a 35); giù: fino a 62
  await drag(300,700,0,-220,12,5,true);await W8(100);const vr=await V();await T('touchEnd',[]);await W8(500);v=await V();
  check('su = più di lato, oltre il limite si tira un poco',vr.elT<35&&vr.elT>31,vr.elT.toFixed(2));check('e torna al limite',Math.abs(v.el-35)<.05,v.el.toFixed(2));
  await p.screenshot({path:D+'/cm_2_lato.png'});
  await drag(300,400,0,320,14);await W8(500);v=await V();check('giù = più dall\'alto fino a 62',Math.abs(v.el-62)<.05,v.el.toFixed(2));
  await p.screenshot({path:D+'/cm_3_alto.png'});
  // 4 quasi dritto in orizzontale: l'inclinazione non si muove
  await p.evaluate(()=>__MZ.view(0,45));await drag(260,640,110,14,10);await W8(400);v=await V();check('dito quasi orizzontale non inclina',Math.abs(v.el-45)<.6,v.el.toFixed(2));
  await drag(300,600,8,-120,10);await W8(400);const v4=await V();check('dito quasi verticale non gira',Math.abs(v4.yaw-v.yaw)<2,[v.yaw,v4.yaw].map(x=>+x.toFixed(1)));
  // 5 tocco fermo: niente
  const vt0=await V();await T('touchStart',[{x:300,y:600,id:9}]);await W8(150);await T('touchMove',[{x:304,y:603,id:9}]);await T('touchEnd',[]);await W8(300);const vt1=await V();
  check('un tocco fermo non gira',Math.abs(vt1.yaw-vt0.yaw)<.01&&Math.abs(vt1.el-vt0.el)<.01);
  // 6 bussola: toccata, torna a nord e a 45° in mezzo secondo, senza girare col dito
  await p.evaluate(()=>__MZ.view(-150,58));await W8(100);const nb=await p.evaluate(()=>{const r=document.querySelector('#mzNord').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2,r.width,getComputedStyle(document.querySelector('#mzNord')).opacity]});
  await p.screenshot({path:D+'/cm_4_bussola_prima.png',clip:{x:nb[0]-60,y:nb[1]-40,width:100,height:80}});
  await T('touchStart',[{x:nb[0],y:nb[1],id:3}]);const c6=await C();await T('touchEnd',[]);await W8(250);const mid=await V();await W8(500);v=await V();
  check('la bussola non apre il comando della telecamera',c6.look.id==null);check('la bussola torna a nord',Math.abs(v.yaw)<.01&&Math.abs(v.el-45)<.01,[mid.yaw.toFixed(1),v.yaw,v.el]);check('il ritorno è un movimento (non uno scatto)',Math.abs(mid.yaw)>5&&Math.abs(mid.yaw)<145,mid.yaw.toFixed(1));
  await p.screenshot({path:D+'/cm_5_bussola_nord.png',clip:{x:nb[0]-60,y:nb[1]-40,width:100,height:80}});
  // 7 due dita insieme: sinistra cammina verso destra sullo schermo, destra gira
  await p.evaluate(()=>{__MZ.tp(4.4*64,7.6*64);__MZ.view(90,45)});await W8(700);const a0=await hs();const w0=await p.evaluate(()=>[__MZ.W.hero.x,__MZ.W.hero.y]);
  await T('touchStart',[{x:80,y:640,id:1}]);await T('touchStart',[{x:80,y:640,id:1},{x:300,y:640,id:2}]);
  for(let i=1;i<=6;i++){await T('touchMove',[{x:80+i*8,y:640,id:1},{x:300,y:640,id:2}]);await W8(16)}const c7=await C();
  for(let i=1;i<=10;i++){await T('touchMove',[{x:128,y:640,id:1},{x:300-i*6,y:640,id:2}]);await W8(30)}
  await T('touchEnd',[{x:128,y:640,id:1}]);await W8(50);const c7b=await C();await T('touchEnd',[]);await W8(200);
  const w1=await p.evaluate(()=>[__MZ.W.hero.x,__MZ.W.hero.y]);v=await V();
  check('due dita: una levetta e una telecamera',c7.stick.id!=null&&c7.look.id!=null);check('due dita: gira mentre cammina',v.yaw>100,v.yaw.toFixed(1));check('alzato il primo dito, il secondo resta',c7b.stick.id==null&&c7b.look.id!=null);
  // a ψ=90 «destra sullo schermo» è il nord del mondo (−y)
  check('levetta relativa allo schermo: a ψ=90° destra = nord',w1[1]<w0[1]-8&&Math.abs(w1[0]-w0[0])<Math.abs(w1[1]-w0[1])*.6,[w0,w1].map(a=>a.map(Math.round)));
  // 8 levetta relativa allo schermo per molte viste: la direzione sullo schermo è quella del pollice (anche inclinato)
  const err=await p.evaluate(()=>{let mx=0;const M=__MZ,h=M.W.hero;for(const y of[0,45,90,135,180,-120,-37])for(const e of[35,45,62]){M.view(y,e);
      for(const[ix,iy] of[[1,0],[0,-1],[.7,.7],[-.6,.8]]){M.tp(5.2*64,6.4*64);const a=M.toScreen(h.x,h.y,0);M.walk(ix,iy,6,1/60);const b2=M.toScreen(h.x,h.y,0);
        const d=Math.abs(((Math.atan2(b2[1]-a[1],b2[0]-a[0])-Math.atan2(iy,ix))*180/Math.PI+540)%360-180);if(d>mx)mx=d}}M.view(0,45);return mx});
  check('levetta: errore massimo di direzione sullo schermo < 1,5°',err<1.5,err.toFixed(2));
  // 9 il pollice destro passa la metà: se la sua metà è occupata prende il comando libero
  await p.evaluate(()=>__MZ.view(0,45));await T('touchStart',[{x:80,y:640,id:1}]);await T('touchStart',[{x:80,y:640,id:1},{x:170,y:640,id:2}]);const c9=await C();
  for(let i=1;i<=8;i++){await T('touchMove',[{x:80,y:640,id:1},{x:170+i*10,y:640,id:2}]);await W8(16)}await T('touchEnd',[]);await W8(300);v=await V();
  check('secondo dito a sinistra con la levetta occupata = telecamera',c9.look.id!=null&&c9.stick.id!=null&&v.yaw<-20,v.yaw.toFixed(1));
  // 10 i bottoni in basso non aprono comandi
  const bb=await p.evaluate(()=>{const r=document.querySelector('#mzBar button:last-child').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
  await T('touchStart',[{x:bb[0],y:bb[1],id:4}]);const c10=await C();await T('touchEnd',[]);await W8(100);
  check('tocco su un bottone: nessun comando',c10.look.id==null&&c10.stick.id==null);
  // 11 vista intera: lo zoom resta fermo mentre il dito gira, si riassesta quando si lascia
  const wv=await p.evaluate(()=>__MZ.CAM.z);check('Vista intera accesa dal bottone',wv<0.9,wv);await W8(2500);const z0=await p.evaluate(()=>__MZ.CAM.z);
  await drag(300,500,90,0,10,6,true);await W8(300);const z1=await p.evaluate(()=>__MZ.CAM.z);await p.screenshot({path:D+'/cm_6_intera_gira.png'});await T('touchEnd',[]);await W8(2500);const z2=await p.evaluate(()=>__MZ.CAM.z);
  check('vista intera: zoom fermo mentre gira',Math.abs(z1-z0)<1e-3,[z0,z1].map(x=>+x.toFixed(4)));check('vista intera: dopo si riassesta',Math.abs(z2-z0)>.01,[z0,z2].map(x=>+x.toFixed(4)));
  await p.screenshot({path:D+'/cm_7_intera.png'});await p.evaluate(()=>__MZ.setWhole(false));
  // 12 tastiera: E gira a destra, R più di lato, N nord
  await p.evaluate(()=>__MZ.view(0,45));await p.keyboard.down('KeyE');await W8(500);await p.keyboard.up('KeyE');await p.keyboard.down('KeyR');await W8(300);await p.keyboard.up('KeyR');await W8(300);v=await V();
  check('tastiera: E gira a destra, R più di lato',v.yaw<-50&&v.yaw>-100&&v.el<40,[v.yaw.toFixed(1),v.el.toFixed(1)]);
  await p.keyboard.press('KeyN');await W8(700);v=await V();check('tastiera: N torna a nord',Math.abs(v.yaw)<.01&&Math.abs(v.el-45)<.01,[v.yaw,v.el]);
  // 13 tasto destro del mouse: telecamera anche a sinistra
  await p.mouse.move(100,500);await p.mouse.down({button:'right'});for(let i=1;i<=8;i++){await p.mouse.move(100-i*10,500);await W8(16)}await p.mouse.up({button:'right'});await W8(300);v=await V();
  check('mouse: tasto destro trascinato = telecamera',v.yaw>20,v.yaw.toFixed(1));
  // 14 qualche vista per gli occhi
  for(const[n,y,e] of[['a',-60,35],['b',120,62],['c',200,45]]){await p.evaluate(([y,e])=>__MZ.view(y,e),[y,e]);await W8(400);await p.screenshot({path:D+'/cm_v'+n+'.png'})}
  // il comando della telecamera disegnato col dito sopra
  await p.evaluate(()=>__MZ.view(-30,40));await drag(300,640,-40,30,6,7,true);await W8(100);await p.screenshot({path:D+'/cm_8_dito.png',clip:{x:200,y:540,width:190,height:200}});await T('touchEnd',[]);
  check('nessun errore nella pagina',!errs.length,errs.slice(0,4));
  console.log('OK '+ok.length+'\n  '+ok.join('\n  '));console.log('NO '+ko.length+'\n  '+ko.join('\n  '));await b.close()})();
