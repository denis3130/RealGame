# La visuale in terza e prima persona della modalità zombie (Denis, 2 novembre: «fai un'anteprima a parte facendo vedere come sarebbe la
# modalità zombie se la telecamera fosse tipo in terza persona e prima persona»): l'Anteprima 49 (il gioco di oggi più i suoi pezzi nuovi)
# più src/js/105-visuale-3d.js, che nella partita zombie aggiunge il bottone «Visuale» (Dall'alto, Terza persona, Prima persona).
# Alla prima apertura c'è già un eroe e il menu è sulla Zombie: si tocca Gioca e la partita parte in terza persona.
# Uso: python3 anteprime/mk_visuale.py [cartella]   (--prova: senza salvataggio pronto → visuale_prova.html, per le prove)
#      → anteprime/visuale.html; con la cartella anche la stessa pagina divisa in tre pezzi come il gioco pubblicato (app/mk_claude.py).
# La pagina costruita non si salva su git.
import os,sys,subprocess
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(here);src=os.path.join(root,'src')
NUOVI=['js/98-musica-zombie.js','js/99-abilita-zombie.js','js/100-sfida-zombie.js','js/102-abisso-ricco.js','js/103-missioni-eventi.js','js/104-mira.js','js/105-visuale-3d.js','js/106-zombie-3d.js','js/107-effetti-3d.js','js/108-mondo-3d.js']
order=[l.strip() for l in open(os.path.join(src,'ordine.txt'),encoding='utf-8') if l.strip()]
extra=[f for f in NUOVI if f not in order]
i=order.index('coda.html')
order=order[:i]+extra+order[i:]
prova='--prova' in sys.argv;args=[x for x in sys.argv[1:] if not x.startswith('--')]
page=''.join(open(os.path.join(src,f),encoding='utf-8',newline='').read() for f in order)
page=page.replace('<title>Mossbound</title>','<title>Mossbound Visuale zombie</title>',1)
# a ready player on the first opening, with the menu on the Zombie tab (the save of a player who has already made the hero and played once)
pronto='''try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:200,trophies:0,
runs:1,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',modo:'zombie',items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},
eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))}catch(e){}
'''
if not prova:page=page.replace('<script>','<script>'+pronto,1)
out=os.path.join(here,'visuale_prova.html' if prova else 'visuale.html')
open(out,'w',encoding='utf-8',newline='').write(page)
print('anteprime/%s pronto (%s)'%(os.path.basename(out),', '.join(extra)))
if args:subprocess.run([sys.executable,os.path.join(root,'app','mk_claude.py'),out,args[0]],check=True)
