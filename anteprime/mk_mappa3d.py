# Costruisce anteprime/mappa3d.html: la mappa zombie nello stile nuovo (anteprime/mappa3d.js) dentro una copia del gioco, con i mostri
# zombie (sprite/mostri/disegno_mostri.js) e le armi (sprite/armi/disegno_armi.js). Uso: python3 anteprime/mk_mappa3d.py
# Prima: python3 build.py (serve index.html aggiornato). La pagina costruita non si salva su git.
import os
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
rd=lambda *p:open(os.path.join(root,*p),encoding='utf-8').read()
game=rd('index.html');i=game.rfind('})();')
page=game[:i]+'\n'+rd('sprite','mostri','disegno_mostri.js')+'\n'+rd('sprite','armi','disegno_armi.js')+'\n'+rd('anteprime','mappa3d.js')+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Mappa zombie</title>',1)
open(os.path.join(here,'mappa3d.html'),'w',encoding='utf-8').write(page);print('anteprime/mappa3d.html pronto')
