// La schermata d'avvio e i caricamenti (src/js/65-caricamento.js, punti 52 e 53 del piano): la schermata compare prima che il gioco sia letto,
// la barra va avanti per davvero, «Tocca per iniziare» apre il menu con la sua musica (la prima volta il prologo), i fotogrammi del menu
// dopo il tocco sono lisci; l'ingresso nella mappa zombie è fatto a pezzi dietro la schermata zombie (avanzamento che cresce, nessun blocco
// lungo); quando l'app va in secondo piano la foto del terreno zombie viene buttata e rientrando torna identica al pixel.
// Qui il browser di prova si fa passare per un telefono vero (navigator.webdriver falso): le altre prove partono subito, senza schermata.
// Uso: python3 tests/mk.py && node tests/avvio.js [cartella delle foto]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(path.join(__dirname,'test.html')).pipe(r)});
const OUT=process.argv[2]||path.join(__dirname,'avvio_foto');fs.mkdirSync(OUT,{recursive:true});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
const SAVE={gold:900,gems:40,introSeen:1,handSeen:1,runs:3,trophies:120,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+srv.address().port+'/';const b=await chromium.launch();const errs=[];
  const page=async save=>{const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await c.newPage();
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|net::/.test(m.text()))errs.push(m.text())});
    await p.addInitScript(s=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});if(s)localStorage.setItem('cripta_save_v1',s);
      window.__LT=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__LT.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true})}catch(e){}},save?JSON.stringify(save):null);
    return p};
  const st=p=>p.evaluate(()=>{const b=document.getElementById('boot');return{shown:!!b&&!b.hidden,cls:b?b.className:'',go:!!b&&!b.querySelector('.bt-go').hidden,
    bar:b?parseFloat(b.querySelector('.bt-bar i').style.width)||0:0,txt:b?b.querySelector('.bt-txt').textContent:'',tip:b?b.querySelector('.bt-tip').textContent:'',logo:b?b.querySelector('.bt-logo').textContent:'',
    game:typeof window.__E==='function',menu:!document.getElementById('menu').hidden}});
  // 1. un giocatore che torna: la schermata subito, la barra, «Tocca per iniziare», il menu con la sua musica
  let p=await page(SAVE);await p.goto(url,{waitUntil:'commit'});
  await p.waitForSelector('#boot',{state:'attached',timeout:20000});const s0=await st(p);
  ok(s0.shown&&/classic/.test(s0.cls)&&s0.logo==='Mossbound','la schermata d\'avvio si vede subito (classica, col nome del gioco)');
  await p.waitForFunction(()=>{const b=document.getElementById('boot');return b&&!b.querySelector('.bt-go').hidden},null,{timeout:30000});const s1=await st(p);
  ok(s1.game&&s1.bar>=99.9&&s1.txt==='Pronto!'&&s1.tip.length>10,'il gioco è pronto dietro la schermata: barra piena, «Pronto!», un consiglio in basso');
  ok(s1.menu,'il menu è già pronto sotto la schermata');
  ok(await p.evaluate(()=>__E('BOOTS.frames>=8&&BOOTS.ready&&!BOOTS.gone')),'il menu è stato disegnato qualche volta prima di dire «Pronto!»');
  await p.screenshot({path:path.join(OUT,'1_avvio.png')});
  await p.mouse.click(195,700);await p.waitForTimeout(700);const s2=await st(p);
  ok(!s2.shown&&s2.menu,'un tocco e la schermata sparisce sul menu');
  ok(await p.evaluate(()=>__E("AU.ctx&&AU.cur&&AU.cur.name==='menu'")),'col tocco parte la musica del menu');
  const F=await p.evaluate(()=>new Promise(res=>{const F=[];let l=performance.now();const f=()=>{const n=performance.now();F.push(n-l);l=n;if(F.length<30)requestAnimationFrame(f);else res(F)};requestAnimationFrame(f)}));
  ok(Math.max(...F)<60,'i primi fotogrammi del menu dopo il tocco sono lisci (il più lento '+Math.round(Math.max(...F))+' ms)');
  await p.screenshot({path:path.join(OUT,'2_menu.png')});
  // 2. l'ingresso nella mappa zombie a pezzi, con la schermata zombie
  await p.evaluate(()=>__E("window.__K=[];{const _p=LOAD.prog.bind(LOAD);LOAD.prog=k=>{__K.push(k);_p(k)}}document.querySelectorAll('#sheetScr').forEach(e=>e.hidden=true);window.__LT=[];SAVE.modo='zombie';zGo()"));
  await p.waitForFunction(()=>{const b=document.getElementById('boot');return b&&!b.hidden&&b.classList.contains('zombie')},null,{timeout:15000});const z0=await st(p);
  ok(z0.logo==='Camposanto dei Corvi'&&/risveglia/.test(z0.txt)&&z0.tip.length>10,'entrando nella Zombie la schermata zombie: il nome della mappa, la scritta e un consiglio');
  await p.waitForFunction(()=>__E('LOAD.k>.3'),null,{timeout:60000});await p.screenshot({path:path.join(OUT,'3_carica_zombie.png')});
  await p.waitForFunction(()=>__E('ZG.on&&!LOAD.on'),null,{timeout:120000,polling:100});
  const K=await p.evaluate(()=>__E('__K')),LT=await p.evaluate(()=>window.__LT.filter(x=>true));
  ok(K.length>20&&K.every((k,i)=>!i||k>=K[i-1])&&K[K.length-1]===1,'la barra va avanti a piccoli passi fino in fondo ('+K.length+' passi)');
  const lt=LT.map(x=>x[1]).sort((a,b)=>b-a);
  ok(!lt.length||lt[1]==null||lt[1]<200,'il caricamento non blocca il telefono: blocchi lunghi '+lt.length+', i più lunghi '+lt.slice(0,3).join(', ')+' ms (il primo è la prima immagine della mappa, dietro la schermata)');
  await p.waitForTimeout(1500);ok(await p.evaluate(()=>document.getElementById('boot').hidden&&!document.getElementById('mz').hidden&&__E("$('menu').hidden")),'poi la mappa, con la schermata sparita');
  await p.screenshot({path:path.join(OUT,'4_mappa.png')});
  // 3. la memoria: con l'app in secondo piano e la mappa spenta la foto del terreno se ne va; rientrando torna uguale
  // (anteprima 48: la foto del terreno è a riquadri, W.ground.tiles)
  const hash=()=>p.evaluate(()=>__E(`(()=>{const G=ZM.W.ground,cs=G.tiles?G.tiles.map(t=>t.c):[G];let h=0;for(const c of cs){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=0;i<d.length;i+=89)h=(h*31+d[i])|0}return G.width+'x'+G.height+':'+h})()`));
  const h1=await hash();await p.evaluate(()=>__E('zExit()'));await p.waitForTimeout(800);
  await p.evaluate(()=>__E("Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden"));
  ok(await p.evaluate(()=>__E('ZM.W.ground===null&&!!ZG.ctl')),'in secondo piano la foto del terreno zombie viene buttata (la mappa resta pronta)');
  await p.evaluate(()=>__E('zGo()'));await p.waitForFunction(()=>__E('ZG.on&&!LOAD.on'),null,{timeout:120000,polling:100});
  ok(await hash()===h1,'rientrando il terreno viene rifatto identico al pixel');
  await p.evaluate(()=>__E('zExit()'));await p.waitForTimeout(600);
  ok(await p.evaluate(()=>__E("!ZG.on&&!$('menu').hidden&&document.getElementById('boot').hidden")),'e si torna al menu');
  await p.context().close();
  // 4. la prima volta in assoluto: dopo il tocco parte il prologo, con la sua musica
  p=await page(null);await p.goto(url,{waitUntil:'commit'});
  await p.waitForFunction(()=>{const b=document.getElementById('boot');return b&&!b.querySelector('.bt-go').hidden},null,{timeout:30000});
  await p.mouse.click(195,700);await p.waitForTimeout(1200);
  ok(await p.evaluate(()=>__E("INTRO.on&&INTRO.pro&&!INTRO.splash&&$('menu').hidden&&AU.cur&&AU.cur.name==='prologo'")),'la prima volta il tocco fa partire il prologo con la sua musica (senza un secondo «tocca»)');
  await p.screenshot({path:path.join(OUT,'5_filmato.png')});
  await p.context().close();
  console.log('\nERR',JSON.stringify(errs.slice(0,6)));if(errs.length)fails++;console.log(fails?`${fails} prove non passate`:'tutte le prove passate');await b.close();srv.close();process.exit(fails?1:0)})();
