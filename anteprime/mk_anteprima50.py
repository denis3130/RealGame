# L'Anteprima 50 (Denis, 6 novembre, alla domanda «cosa miglioreresti nel gioco?»): il gioco di oggi più i pezzi nuovi che non sono ancora
# nel gioco (i file elencati in NUOVI, messi prima della chiusura), così Denis li prova dal telefono prima di dire sì:
# - gli zombie nuovi in partita (sprite/mostri/zombie_nuovi.js, i disegni; anteprime/zombie/speciali.js, le mosse nella partita);
# - il menu che si apre piano (src/js/120-menu-graduale.js).
# Alla prima apertura si parte da giocatore nuovo, col menu che si apre piano (niente prologo né creazione: l'eroe c'è già); nella pagina il
# bottoncino «Anteprima: sali di livello» fa vedere gli sblocchi uno dopo l'altro, e gli zombie nuovi escono prima (dal round 2, 3 e 4).
# Uso: python3 anteprime/mk_anteprima50.py [cartella]   (--prova: senza salvataggio pronto né scorciatoie → anteprima50_prova.html, per le prove)
#      → anteprime/anteprima50.html; con la cartella anche la stessa pagina divisa in tre pezzi come il gioco pubblicato (app/mk_claude.py).
# La pagina costruita non si salva su git.
import os,sys,subprocess
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(here);src=os.path.join(root,'src')
NUOVI=['../sprite/mostri/zombie_nuovi.js','../anteprime/zombie/speciali.js','js/120-menu-graduale.js']
order=[l.strip() for l in open(os.path.join(src,'ordine.txt'),encoding='utf-8') if l.strip()]
extra=[f for f in NUOVI if f not in order]
i=order.index('coda.html')
order=order[:i]+extra+order[i:]
prova='--prova' in sys.argv;args=[x for x in sys.argv[1:] if not x.startswith('--')]
# (solo nell'anteprima) gli zombie nuovi prima: lo Sputatore dal round 2, il Gonfio dal 3, il Bruto dal 4
presto='''
// (solo nell'Anteprima 50) gli zombie nuovi escono prima, per vederli subito
try{if(ZM.speciali){const Z=ZM.speciali.ZSP;Z.sputatore.dal=2;Z.gonfio.dal=3;Z.bruto.dal=4}}catch(e){}
'''
page=''.join(open(os.path.join(src,f),encoding='utf-8',newline='').read()+(presto if not prova and f==NUOVI[1] else '') for f in order)
page=page.replace('<title>Mossbound</title>','<title>Mossbound Anteprima 50</title>',1)
# un giocatore nuovo che ha già fatto l'eroe (il menu che si apre piano è acceso: SAVE.apre), e i bottoncini dell'anteprima
pronto='''window.MB_ANTEPRIMA=1;try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:300,gems:30,trophies:0,
runs:0,introSeen:1,starter:'arciere',heroes:{arciere:1},hero:'arciere',items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},
eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null],apre:{on:1,seen:{},nuovo:{}}}))}catch(e){}
'''
if not prova:page=page.replace('<script>','<script>'+pronto,1)
out=os.path.join(here,'anteprima50_prova.html' if prova else 'anteprima50.html')
open(out,'w',encoding='utf-8',newline='').write(page)
print('anteprime/%s pronto (%s)'%(os.path.basename(out),', '.join(extra) or 'niente di nuovo: è il gioco di oggi'))
if args:subprocess.run([sys.executable,os.path.join(root,'app','mk_claude.py'),out,args[0]],check=True)
