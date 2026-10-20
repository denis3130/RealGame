# Pagina della Classica nuova (Denis, 20 ottobre: «ok creami le cose che mi hai elencato su una cosa a parte senza intaccare il progetto
# principale», poi la seconda versione con le sue risposte): una copia del gioco con src/js/94-classica-nuova.js (la scalata a giro: stanze,
# torre che sale e trappole; Furia a catena, carte con la rarità a sorpresa, evoluzioni spettacolari, la Nemesi che si prende il tuo oro,
# mappa del mondo coi bracieri, menu con «Premi», élite coi poteri, Torre della settimana e Corsa dei boss). Il gioco vero non cambia: 94 non è in
# src/ordine.txt. La pagina parte con un salvataggio suo, già dopo la creazione dell'eroe.
# Dopo 94 mette anche src/js/95-ostacoli-3d.js (gli ostacoli delle stanze in 3D), anche lui fuori dal gioco.
# Uso: python3 anteprime/mk_classica.py [--test] [--build]
#   --test   la pagina per le prove (tests/classica_test.html, con window.__E come tests/test.html)
#   --build  prima ricostruisce index.html (python3 build.py)
# Uscita: anteprime/classica.html (con --test tests/classica_test.html).
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
A=sys.argv[1:];test='--test' in A
if '--build' in A:subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
cn=open(os.path.join(root,'src','js','94-classica-nuova.js'),encoding='utf-8').read()
ob=open(os.path.join(root,'src','js','95-ostacoli-3d.js'),encoding='utf-8').read()   # gli ostacoli in 3D (Denis: «trasforma ogni cosa/ostacolo che è in 2d in 3d anche in game»)
if cn[:300] in s:sys.exit('94-classica-nuova.js è già nel gioco')
seed="""<script>try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1500,gems:60,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,
starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))}catch(e){}</script>"""
assert '<title>Mossbound</title>' in s
s=s.replace('<title>Mossbound</title>','<title>Mossbound · Classica nuova</title>'+seed,1)
i=s.rfind('})();')
s=s[:i]+'\n'+cn+'\n'+ob+'\n'+('window.__E=s=>eval(s);' if test else '')+s[i:]
out=os.path.join(root,'tests','classica_test.html') if test else os.path.join(here,'classica.html')
open(out,'w',encoding='utf-8').write(s)
print(os.path.relpath(out,root),len(s)//1024,'KB')
