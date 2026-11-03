# Mossbound tripla A (Denis, 2 novembre: «rendi tripla A il gioco in sé mossbound»): il gioco di oggi con la stanza della Classica in 3D vero
# (src/js/110-t3-motore.js e i pezzi che vengono dopo), come la visuale zombie (di cui usa gli attrezzi: src/js/105-visuale-3d.js, spenta come
# visuale). Prima anteprima: le stanze del primo mondo (muschio, grotte di cristallo e il Golem); le due luci «Chiara» e «Da film» col bottone in
# alto o col tasto L.
# Alla prima apertura c'è già un eroe e il menu è sulla Classica: si tocca Gioca. Il contatore dei fotogrammi è acceso (101).
# Uso: python3 anteprime/mk_tripla.py [cartella]   (--prova: senza salvataggio pronto → tripla_prova.html, per le prove)
#      → anteprime/tripla.html; con la cartella anche la stessa pagina divisa in tre pezzi come il gioco pubblicato (app/mk_claude.py).
# La pagina costruita non si salva su git.
import os,sys,subprocess
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(here);src=os.path.join(root,'src')
NUOVI=['js/105-visuale-3d.js','js/110-t3-motore.js','js/111-t3-eroe.js','js/112-t3-nemici.js','js/113-t3-golem.js','js/114-t3-stanza.js','js/115-t3-effetti.js','js/116-t3-isole.js','js/117-t3-interfaccia.js','js/118-t3-falo.js']
NUOVI=[f for f in NUOVI if os.path.exists(os.path.join(src,f))]
order=[l.strip() for l in open(os.path.join(src,'ordine.txt'),encoding='utf-8') if l.strip()]
extra=[f for f in NUOVI if f not in order]
i=order.index('coda.html')
order=order[:i]+extra+order[i:]
prova='--prova' in sys.argv;args=[x for x in sys.argv[1:] if not x.startswith('--')]
page=''.join(open(os.path.join(src,f),encoding='utf-8',newline='').read() for f in order)
page=page.replace('<title>Mossbound</title>','<title>Mossbound tripla A</title>',1)
# a ready player on the first opening, on the Classic (the save of a player who has already made the hero and played once)
pronto='''window.MB_CONTATORE=1;try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:200,trophies:0,
runs:1,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',modo:'classica',items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},
eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))}catch(e){}
'''
if not prova:page=page.replace('<script>','<script>'+pronto,1)
out=os.path.join(here,'tripla_prova.html' if prova else 'tripla.html')
open(out,'w',encoding='utf-8',newline='').write(page)
print('anteprime/%s pronto (%s)'%(os.path.basename(out),', '.join(extra)))
if args:subprocess.run([sys.executable,os.path.join(root,'app','mk_claude.py'),out,args[0]],check=True)
