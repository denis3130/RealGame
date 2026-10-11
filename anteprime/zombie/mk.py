# Costruisce anteprime/zombie.html: il motore della mappa zombie (anteprime/zombie/motore.js), i prop (prop.js) e un'area dentro una copia del
# gioco, con i mostri zombie e le armi. Uso: python3 anteprime/zombie/mk.py [area]   (area: nome del file in anteprime/zombie/ senza .js,
# predefinito area_prova). Prima: python3 build.py. La pagina costruita non si salva su git.
import os,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..','..')
rd=lambda *p:open(os.path.join(root,*p),encoding='utf-8').read()
area=sys.argv[1] if len(sys.argv)>1 else 'area_prova'
game=rd('index.html');i=game.rfind('})();')
page=game[:i]+'\n'+rd('sprite','mostri','disegno_mostri.js')+'\n'+rd('sprite','armi','disegno_armi.js')+'\n'+rd('anteprime','zombie','motore.js')+'\n'+rd('anteprime','zombie','prop.js')+'\n'+rd('anteprime','zombie',area+'.js')+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Mappa zombie</title>',1)
open(os.path.join(root,'anteprime','zombie.html'),'w',encoding='utf-8').write(page);print('anteprime/zombie.html pronto (%s)'%area)
