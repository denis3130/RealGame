#!/usr/bin/env python3
# Pagina di prova della creazione dell'eroe al primo avvio (src/js/65-scelta-eroe.js, in stile Dark Souls): è il gioco vero, ma ogni volta
# che si apre parte da un salvataggio vuoto, come un giocatore nuovo: prima l'intro (con i quattro eroi), poi la creazione (classe, aspetto,
# dono e nome), poi il menu. Il barbiere sta nel Profilo → Aspetto (20 cristalli: col dono «Cristalli» si prova subito). Il bottoncino «Rivedi la creazione» (nel cielo della schermata principale) cancella il salvataggio e riapre subito la
# creazione, senza l'intro.
# Uso: python3 anteprime/mk_scelta.py  ->  anteprime/scelta.html
import os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(R, 'build.py')], check=True)
s = open(os.path.join(R, 'index.html'), encoding='utf-8').read()
s = s.replace('<title>Mossbound</title>', '<title>Creazione dell\'eroe</title>', 1)
# a brand new player at every load (only the game's save goes; the sound settings stay); «again» in the session: the intro already seen
s = s.replace('<script>', "<script>try{localStorage.removeItem('cripta_save_v1');if(sessionStorage.getItem('qa_again')){sessionStorage.removeItem('qa_again');localStorage.setItem('cripta_save_v1',JSON.stringify({introSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[{type:'legno',state:'ready'},null,null,null],gold:60,runs:0}))}}catch(e){}</script>\n<script>", 1)
again = '''<button id="qaAgain" hidden style="position:fixed;left:50%;top:calc(76px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:9998;
  font:400 13px 'Lilita One',sans-serif;color:#fff;background:rgba(20,16,12,.72);border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px 5px;cursor:pointer">↺ Rivedi la creazione</button>
<script>(()=>{const b=document.getElementById('qaAgain');b.onclick=()=>{try{sessionStorage.setItem('qa_again',1)}catch(e){}location.reload()};
  setInterval(()=>{const m=document.getElementById('menu');b.hidden=!!document.getElementById('sceScr')||!m||m.hidden||!m.classList.contains('home')},400)})()</script>
'''
i = s.rfind('</body>')
s = s[:i] + again + s[i:] if i >= 0 else s + again
out = os.path.join(R, 'anteprime', 'scelta.html')
open(out, 'w', encoding='utf-8').write(s)
print('anteprime/scelta.html pronta (%d KB)' % (len(s) // 1024))
