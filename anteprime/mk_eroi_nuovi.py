#!/usr/bin/env python3
# Pagina di prova dei sei eroi nuovi del 16 ottobre (Paladino, Mago del ghiaccio, Berserker, Corsaro, Domatore, Monaco: src/js/93-eroi-sei.js)
# e della gittata dei colpi (src/js/94-gittata.js). È il gioco vero, ma tutti i tredici eroi sono già tuoi (si scelgono nella scheda Eroi)
# e ci sono 20.000 oro e 300 cristalli per provare il resto; i sei eroi nuovi hanno già la maestria al livello 10 (la Super III, con
# l'effetto nuovo) e l'Arciere al 6 (Super II), gli altri partono da zero. I progressi restano tra un'apertura e l'altra; a ogni apertura gli eroi
# tornano tutti tuoi. Il bottoncino «Rivedi la creazione» (nel cielo della schermata principale) riparte da un giocatore nuovo, senza
# il prologo: si vedono il dono della Lucciola e i copricapi e i capelli nuovi. Ci sono anche le tredici armi proprie (in mano quella
# del Paladino; portando in campo un altro eroe prende la sua).
# Uso: python3 anteprime/mk_eroi_nuovi.py  ->  anteprime/eroi_nuovi.html (un file solo, per le prove) e anteprime/eroi_nuovi/ (la stessa
#      pagina divisa in tre pezzi come il gioco su claude.ai, app/mk_claude.py: è quella che si pubblica)
import os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.run([sys.executable, os.path.join(R, 'build.py')], check=True)
s = open(os.path.join(R, 'index.html'), encoding='utf-8').read()
s = s.replace('<title>Mossbound</title>', '<title>Mossbound Anteprima eroi</title>', 1)
HEROES = ['arciere', 'cacciatrice', 'balestriere', 'druida', 'bardo', 'alchimista', 'ninja', 'paladino', 'mago', 'berserker', 'corsaro', 'domatore', 'monaco']
# before the game reads the save: a new player gets a save with every hero; an old one gets every hero back (not after «Rivedi la creazione»,
# which must start from nothing, as a new player: the same save as anteprime/mk_scelta.py, a save without items is taken for a broken one)
patch = ("try{const K='cripta_save_v1',H=%s,all=()=>{const o={};H.forEach(h=>o[h]=1);return o};"
         "if(sessionStorage.getItem('qa_again')){sessionStorage.removeItem('qa_again');localStorage.setItem(K,JSON.stringify({introSeen:1,items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},"
         "eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[{type:'legno',state:'ready'},null,null,null],gold:60,runs:0}))}"
         "else{let o=null;try{o=JSON.parse(localStorage.getItem(K)||'null')}catch(e){}"
         "if(!o)o={introSeen:1,handSeen:1,tutDone:1,runs:1,starter:'arciere',dono:'oro',hero:'paladino',gold:20000,gems:300,"
         "items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}};"
         "const B=o.v===2?(o.classica=o.classica||{}):o;B.heroes=Object.assign(B.heroes||{},all());"
         "if(!B.maestria)B.maestria={paladino:4400,mago:4400,berserker:4400,corsaro:4400,domatore:4400,monaco:4400,arciere:1400};"
         "B.items=B.items||{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}};for(const w of %s)if(!B.items[w])B.items[w]={lvl:1,cards:0};"
         "if(!B.ownSeen){B.ownSeen=1;B.eq=B.eq||{};B.eq.arma='martello_alba'};"
         "localStorage.setItem(K,JSON.stringify(o))}}catch(e){}\n") % (repr(HEROES).replace("'", '"'), "['arco_stelle','arco_luna','balestra_drago','bastone_salice','liuto_oro','fiala_arcobaleno','stelle_ombra','martello_alba','bastone_bufera','asce_tuono','sciabola_capitano','frusta_zanna','grani_quiete']")
s = s.replace('<script>', '<script>' + patch, 1)
again = '''<button id="qaAgain" hidden style="position:fixed;left:50%;top:calc(76px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:9998;
  font:400 13px 'Lilita One',sans-serif;color:#fff;background:rgba(20,16,12,.72);border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px 5px;cursor:pointer">↺ Rivedi la creazione</button>
<script>(()=>{const b=document.getElementById('qaAgain');b.onclick=()=>{try{sessionStorage.setItem('qa_again',1)}catch(e){}location.reload()};
  setInterval(()=>{const m=document.getElementById('menu');b.hidden=!!document.getElementById('sceScr')||!m||m.hidden||!m.classList.contains('home')},400)})()</script>
'''
i = s.rfind('</body>')
s = s[:i] + again + s[i:] if i >= 0 else s + again
out = os.path.join(R, 'anteprime', 'eroi_nuovi.html')
open(out, 'w', encoding='utf-8', newline='').write(s)
print('anteprime/eroi_nuovi.html pronta (%d KB)' % (len(s) // 1024))
subprocess.run([sys.executable, os.path.join(R, 'app', 'mk_claude.py'), out, os.path.join(R, 'anteprime', 'eroi_nuovi')], check=True)
