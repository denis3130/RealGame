# L'app per il telefono: il gioco come app web da installare (su iPhone: Safari → Condividi → «Aggiungi alla schermata Home»), servita da
# GitHub Pages dal ramo gh-pages: https://denis3130.github.io/RealGame/
# Costruisce app/sito/ partendo da index.html e aggiunge quello che su claude.ai mette la cornice o che serve a un'app: la riga viewport
# (senza, l'iPhone mostra la pagina rimpicciolita), il manifest con nome e icone, l'icona per iPhone, schermo intero sotto la tacca, e il
# service worker (sw.js) che tiene il gioco nel telefono: si gioca anche senza internet e ogni apertura con la rete prende la versione nuova.
# index.html non cambia: tutto questo sta solo nella copia dell'app.
# Uso: python3 app/mk_app.py              → costruisce index.html (build.py) e poi app/sito/
#      python3 app/mk_app.py --pubblica    → come sopra, poi carica app/sito/ sul ramo gh-pages (un commit in più, mai forzato)
# Le icone (app/icona-*.png) si rifanno con: python3 tests/mk.py && node app/icona.js
import os,sys,json,shutil,hashlib,subprocess,tempfile
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(here);out=os.path.join(here,'sito')
subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
html=open(os.path.join(root,'index.html'),encoding='utf-8',newline='').read()
ICONS=['icona-180.png','icona-192.png','icona-512.png']
for f in ICONS:
  if not os.path.exists(os.path.join(here,f)):sys.exit('manca app/%s: python3 tests/mk.py && node app/icona.js'%f)
# the version: changes when the game or the icons change, so the phone knows there is something new
h=hashlib.sha1(html.encode('utf-8'))
for f in ICONS:h.update(open(os.path.join(here,f),'rb').read())
ver=h.hexdigest()[:10]

HEAD='''<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#1b1612">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Mossbound">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icona-180.png">
<link rel="icon" type="image/png" sizes="192x192" href="icona-192.png">
<style>html,body{-webkit-touch-callout:none;overscroll-behavior:none}
/* the whole screen, notch and home bar included: #wrap goes to the edges (the menu's top bar, tab bar, purse and the sheets already keep
   their buttons clear of the notch and of the home bar with env(safe-area-inset-*): before, the margin was there twice); the battle HUD
   and buttons move inward by the same amount; the hidden achievement popup goes all the way up, out of sight */
#wrap{top:0!important;bottom:0!important}
#hud,#bossBar,#xpBar,#hint,#csum{margin-top:env(safe-area-inset-top,0px)}
#dashBtn,#ultBtn,#tray,#ctap,#cdone,#toast{margin-bottom:env(safe-area-inset-bottom,0px)}
.sheet{padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}
#achPop{top:calc(10px + env(safe-area-inset-top,0px));transform:translate(-50%,calc(-100% - 40px - env(safe-area-inset-top,0px)))}
#achPop.show{transform:translate(-50%,0)}
/* installed on the iPhone (navigator.standalone): with the see-through status bar iOS gives the page a height shorter than the screen by
   the status bar, so a band stays empty under the tab bar; the page takes the real height of the screen (--appH, set below) */
html.app,html.app body{height:var(--appH,100%)!important;background:#403c34}
html.app #wrap{bottom:auto!important;height:var(--appH,100%)}
html.app #mz{bottom:auto!important;height:var(--appH,100%)}</style>
<script>(function(){if(!navigator.standalone)return;var d=document.documentElement;d.classList.add('app');
  function fit(){var a=Math.max(screen.width,screen.height),b=Math.min(screen.width,screen.height),h=innerHeight>innerWidth?a:b;d.style.setProperty('--appH',Math.max(h,innerHeight)+'px')}
  fit();addEventListener('resize',fit);addEventListener('orientationchange',function(){setTimeout(fit,250)})})();</script>
'''
# the service worker only on a real address (https) or on this computer for the tests; on claude.ai there is no app copy anyway
TAIL='''<script>if('serviceWorker' in navigator&&(location.protocol==='https:'||/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>
'''
CH='<meta charset="utf-8">\n'
assert html.startswith(CH),'index.html non comincia con il charset: controlla src/pagina.html'
app=CH+HEAD+html[len(CH):]+TAIL
ver=hashlib.sha1((ver+HEAD+TAIL).encode('utf-8')).hexdigest()[:10]  # the app's own lines count too

MANIFEST={'name':'Mossbound','short_name':'Mossbound','lang':'it','start_url':'./','scope':'./','display':'standalone','orientation':'portrait',
  'background_color':'#1b1612','theme_color':'#1b1612','icons':[{'src':'icona-192.png','sizes':'192x192','type':'image/png'},
  {'src':'icona-512.png','sizes':'512x512','type':'image/png'},{'src':'icona-512.png','sizes':'512x512','type':'image/png','purpose':'maskable'}]}

SW='''// Mossbound nel telefono (versione %s). La prima volta tiene da parte la pagina, le icone e il manifest; i font la prima volta che servono.
// A ogni apertura la pagina chiede la versione nuova (al massimo 4 secondi): se c'è la usa e la tiene da parte, se non arriva (niente rete)
// usa quella tenuta da parte, così si gioca anche senza internet. Gli altri file: prima la copia tenuta da parte, poi si rinfresca.
const V='mossbound-%s',CORE=['./','index.html','manifest.webmanifest','icona-180.png','icona-192.png','icona-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mossbound-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(r.mode==='navigate'||(u.origin===location.origin&&/\\/(index\\.html)?$/.test(u.pathname))){e.respondWith(page(r));return}
  e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res});
    if(hit){net.catch(()=>{});return hit}return net})))});
function page(r){return caches.open(V).then(c=>new Promise(done=>{let sent=false;const send=x=>{if(!sent){sent=true;done(x)}};
  const kept=()=>c.match('index.html').then(h=>send(h||Response.error()));const t=setTimeout(kept,4000);
  fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(n=>{if(n&&n.ok){c.put('index.html',n.clone());clearTimeout(t);send(n)}else{clearTimeout(t);kept()}}).catch(()=>{clearTimeout(t);kept()})}))}
'''%(ver,ver)

if os.path.isdir(out):shutil.rmtree(out)
os.makedirs(out)
open(os.path.join(out,'index.html'),'w',encoding='utf-8',newline='').write(app)
open(os.path.join(out,'manifest.webmanifest'),'w',encoding='utf-8').write(json.dumps(MANIFEST,ensure_ascii=False,indent=1))
open(os.path.join(out,'sw.js'),'w',encoding='utf-8').write(SW)
open(os.path.join(out,'.nojekyll'),'w').write('')
for f in ICONS:shutil.copy(os.path.join(here,f),os.path.join(out,f))
print('app/sito pronta (versione %s, %d KB)'%(ver,sum(os.path.getsize(os.path.join(out,f)) for f in os.listdir(out))//1024))

if '--pubblica' in sys.argv:
  # the gh-pages branch in a worktree of its own: the files of the app replace the old ones, one more commit, push
  g=lambda *a,**k:subprocess.run(['git']+list(a),cwd=k.get('cwd',root),check=k.get('check',True),capture_output=True,text=True)
  wt=tempfile.mkdtemp(prefix='gh-pages-')
  has=g('fetch','origin','gh-pages',check=False).returncode==0
  try:
    if has:g('worktree','add','-B','gh-pages',wt,'origin/gh-pages')
    else:g('worktree','add','--orphan','-b','gh-pages',wt)
    for f in os.listdir(wt):
      if f!='.git':p=os.path.join(wt,f);shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    for f in os.listdir(out):shutil.copy(os.path.join(out,f),os.path.join(wt,f))
    g('add','-A',cwd=wt)
    if g('diff','--cached','--quiet',cwd=wt,check=False).returncode==0:print('gh-pages è già aggiornato')
    else:
      g('commit','-q','-m','App: versione %s\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01Dgjf4PuqZowPts7C7dSiaz'%ver,cwd=wt)
      r=g('push','-u','origin','gh-pages',cwd=wt,check=False);print((r.stdout+r.stderr).strip().splitlines()[-1] if (r.stdout+r.stderr).strip() else 'push fatto')
      if r.returncode:sys.exit('push non riuscito')
      print('pubblicata: https://denis3130.github.io/RealGame/')
  finally:
    g('worktree','remove','--force',wt,check=False);shutil.rmtree(wt,ignore_errors=True)
