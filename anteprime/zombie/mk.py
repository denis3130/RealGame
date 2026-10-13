# Costruisce anteprime/zombie.html, la pagina di prova della mappa zombie: una copia del gioco (index.html, che dal 13 ottobre contiene già il
# motore anteprime/zombie/motore.js, i prop prop.js e prop_fattoria.js, la partita a ondate partita.js e la mappa intera area_mappa.js, più i
# mostri e le armi) che si apre direttamente sulla mappa, coi bottoni di prova. Uso: python3 anteprime/zombie/mk.py [area]   (area: nome del
# file in anteprime/zombie/ senza .js, predefinito area_prova; la mappa intera è area_mappa). Prima costruisce index.html (build.py). Le aree che
# non sono nel gioco (area_prova) si incollano qui. La pagina costruita non si salva su git.
import os,sys,subprocess
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..','..')
subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True,stdout=subprocess.DEVNULL)
rd=lambda *p:open(os.path.join(root,*p),encoding='utf-8').read()
area=sys.argv[1] if len(sys.argv)>1 else 'area_prova'
aid=area[5:] if area.startswith('area_') else area
order=open(os.path.join(root,'src','ordine.txt'),encoding='utf-8').read()
game=rd('index.html');i=game.rfind('})();')
extra='' if ('../anteprime/zombie/'+area+'.js') in order else rd('anteprime','zombie',area+'.js')+'\n'
page=game[:i]+'\n'+extra+"ZM.anteprima('"+aid+"');\n"+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Mappa zombie</title>',1)
open(os.path.join(root,'anteprime','zombie.html'),'w',encoding='utf-8').write(page);print('anteprime/zombie.html pronto (%s)'%area)
