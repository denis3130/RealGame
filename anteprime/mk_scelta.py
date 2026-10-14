#!/usr/bin/env python3
# Pagina di prova della scelta dell'eroe al primo avvio (src/js/65-scelta-eroe.js): è il gioco vero, ma ogni volta che si apre
# parte da un salvataggio vuoto, così «Chi vuoi essere?» si vede sempre. Dopo la scelta c'è l'intro e poi il menu, con l'eroe scelto
# gratis e l'altro a 3.000 oro nella scheda Eroi. Il bottoncino «Rivedi la scelta» (nel cielo della schermata principale) cancella il
# salvataggio e ricomincia.
# Uso: python3 anteprime/mk_scelta.py  ->  anteprime/scelta.html
import os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(R, 'build.py')], check=True)
s = open(os.path.join(R, 'index.html'), encoding='utf-8').read()
s = s.replace('<title>Mossbound</title>', '<title>Scelta dell\'eroe</title>', 1)
# a brand new player at every load (only the game's save goes; the sound settings stay)
s = s.replace('<script>', "<script>try{localStorage.removeItem('cripta_save_v1')}catch(e){}</script>\n<script>", 1)
again = '''<button id="qaAgain" hidden style="position:fixed;left:50%;top:calc(76px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:9998;
  font:400 13px 'Lilita One',sans-serif;color:#fff;background:rgba(20,16,12,.72);border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px 5px;cursor:pointer">↺ Rivedi la scelta</button>
<script>(()=>{const b=document.getElementById('qaAgain');b.onclick=()=>{try{localStorage.removeItem('cripta_save_v1')}catch(e){}location.reload()};
  setInterval(()=>{const m=document.getElementById('menu');b.hidden=!!document.getElementById('sceScr')||!m||m.hidden||!m.classList.contains('home')},400)})()</script>
'''
i = s.rfind('</body>')
s = s[:i] + again + s[i:] if i >= 0 else s + again
out = os.path.join(R, 'anteprime', 'scelta.html')
open(out, 'w', encoding='utf-8').write(s)
print('anteprime/scelta.html pronta (%d KB)' % (len(s) // 1024))
