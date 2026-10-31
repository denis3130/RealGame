# L'Anteprima 49 (Denis, 31 ottobre, alla domanda «cosa possiamo fare per migliorare il gioco?»): il gioco di oggi più i pezzi nuovi
# che non sono ancora nel gioco (i file di src/js elencati in NUOVI, messi prima della chiusura), così Denis li prova dal telefono prima
# di dire sì. Alla prima apertura c'è già un eroe (l'Arciere) e niente prologo né creazione, per arrivare subito alle cose nuove.
# Uso: python3 anteprime/mk_anteprima49.py [cartella]
#      → anteprime/anteprima49.html; con la cartella anche la stessa pagina divisa in tre pezzi come il gioco pubblicato (pagina piccola,
#        stile.css, gioco.js: app/mk_claude.py), da pubblicare con «files».
# La pagina costruita non si salva su git.
import os,sys,subprocess
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(here);src=os.path.join(root,'src')
NUOVI=['js/98-musica-zombie.js','js/99-abilita-zombie.js']
order=[l.strip() for l in open(os.path.join(src,'ordine.txt'),encoding='utf-8') if l.strip()]
extra=[f for f in NUOVI if f not in order]
i=order.index('coda.html')
order=order[:i]+extra+order[i:]
# (only in the preview) once: gold, Rottami and a round record, so the zombie abilities can all be unlocked and tried at once
spinta='''
// (solo nell'Anteprima 49) una volta sola: oro, Rottami e il record 15 della Zombie, per sbloccare e provare subito le abilità
try{if(!SAVE.__a49){SAVE.__a49=1;SAVE.gold=(SAVE.gold||0)+10000;SAVE.mat.rot=(SAVE.mat.rot||0)+600;SAVE.zRec=Math.max(SAVE.zRec||0,15);save()}}catch(e){}
'''
page=''.join(open(os.path.join(src,f),encoding='utf-8',newline='').read()+(spinta if f==extra[-1] else '') for f in order) if extra else \
  ''.join(open(os.path.join(src,f),encoding='utf-8',newline='').read() for f in order)
page=page.replace('<title>Mossbound</title>','<title>Mossbound Anteprima 49</title>',1)
# a ready player on the first opening (the save of a player who has already made the hero and played once)
# (at the top of the game's own script, which runs before the game reads its save: the page keeps one script, as app/mk_claude.py wants)
# (the game takes a save only if it has the items: loadSave in 07; the starting bow and tunic, as the tests' saves)
pronto='''try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:5000,gems:200,trophies:0,
runs:1,introSeen:1,handSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},
eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))}catch(e){}
'''
page=page.replace('<script>','<script>'+pronto,1)
out=os.path.join(here,'anteprima49.html')
open(out,'w',encoding='utf-8',newline='').write(page)
print('anteprime/anteprima49.html pronto (%s)'%(', '.join(extra) or 'niente di nuovo: è il gioco di oggi'))
if len(sys.argv)>1:subprocess.run([sys.executable,os.path.join(root,'app','mk_claude.py'),out,sys.argv[1]],check=True)
