// Prova dell'app (app/sito, costruita da app/mk_app.py) servita da questo computer come la servirà GitHub Pages: la pagina con la riga
// viewport e il manifest, il service worker che prende il controllo, il gioco che si apre di nuovo senza internet, nessun errore.
// Uso: python3 app/mk_app.py && node app/prova.js
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const DIR=path.join(__dirname,'sito'),TYPE={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';const p=path.join(DIR,f);
  if(!p.startsWith(DIR)||!fs.existsSync(p)){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':TYPE[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(r)});
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+srv.address().port+'/';
  const b=await chromium.launch();const cx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await cx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|net::|ERR_INTERNET_DISCONNECTED/.test(m.text()))errs.push(m.text())});
  await p.goto(url);await p.waitForTimeout(2500);
  ok(await p.evaluate(()=>!!document.querySelector('meta[name=viewport]')&&innerWidth===390),'riga viewport: la pagina è larga quanto il telefono');
  const man=await p.evaluate(()=>fetch('manifest.webmanifest').then(r=>r.json()).catch(()=>null));
  ok(man&&man.name==='Mossbound'&&man.display==='standalone'&&man.icons.length===3,'manifest: nome, schermo intero, icone');
  ok(await p.evaluate(()=>Promise.all(['icona-180.png','icona-192.png','icona-512.png'].map(u=>fetch(u).then(r=>r.ok&&r.headers.get('content-type')==='image/png'))).then(a=>a.every(Boolean))),'icone servite');
  ok(await p.evaluate(()=>navigator.serviceWorker.ready.then(r=>!!r.active)),'service worker attivo');
  await p.reload();await p.waitForTimeout(2000);
  ok(await p.evaluate(()=>!!navigator.serviceWorker.controller),'dopo la riapertura il service worker controlla la pagina');
  ok(await p.evaluate(()=>caches.keys().then(k=>k.some(x=>x.startsWith('mossbound-')))),'gioco tenuto da parte nel telefono');
  ok(await p.evaluate(()=>!document.getElementById('menu').hidden||!!document.querySelector('#cv')),'il gioco è partito');
  // without internet: the game opens again from the copy kept on the phone
  await cx.setOffline(true);await p.reload();await p.waitForTimeout(2500);
  ok(await p.evaluate(()=>document.title==='Mossbound'&&!!document.getElementById('cv')&&!!document.getElementById('menu')),'senza internet il gioco si apre lo stesso');
  await p.screenshot({path:path.join(__dirname,'sito_senza_rete.png')});
  await cx.setOffline(false);
  ok(!errs.length,'nessun errore'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close();srv.close();console.log(fails?fails+' NO':'tutto ok');process.exit(fails?1:0)})();
