// Mossbound nel telefono (versione d6ae3cf50d). La prima volta tiene da parte la pagina, le icone e il manifest; i font la prima volta che servono.
// A ogni apertura la pagina chiede la versione nuova (al massimo 4 secondi): se c'è la usa e la tiene da parte, se non arriva (niente rete)
// usa quella tenuta da parte, così si gioca anche senza internet. Gli altri file: prima la copia tenuta da parte, poi si rinfresca.
const V='mossbound-d6ae3cf50d',CORE=['./','index.html','manifest.webmanifest','icona-180.png','icona-192.png','icona-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mossbound-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(r.mode==='navigate'||(u.origin===location.origin&&/\/(index\.html)?$/.test(u.pathname))){e.respondWith(page(r));return}
  e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res});
    if(hit){net.catch(()=>{});return hit}return net})))});
function page(r){return caches.open(V).then(c=>new Promise(done=>{let sent=false;const send=x=>{if(!sent){sent=true;done(x)}};
  const kept=()=>c.match('index.html').then(h=>send(h||Response.error()));const t=setTimeout(kept,4000);
  fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(n=>{if(n&&n.ok){c.put('index.html',n.clone());clearTimeout(t);send(n)}else{clearTimeout(t);kept()}}).catch(()=>{clearTimeout(t);kept()})}))}
