# Costruisce anteprime/viandante3d.html: il Viandante in 3D vero (sprite/mostri3d/viandante.js, il personaggio dell'immagine di Denis del
# 4 novembre, scolpito nel codice con sprite/mostri3d/scultura.js e la cassetta sprite/mostri3d/kit3d.js, disegnato da sprite/mostri3d/mb3.js)
# nella stessa pagina degli zombie in 3D (anteprime/zombie3d.js) con la scena «studio» chiara come l'immagine, le mosse, il dito che gira,
# «Quattro direzioni» e «Con l'immagine» (l'immagine di Denis accanto a lui nella stessa posa, sprite/mostri3d/viandante_rif.webp).
# Uso: python3 anteprime/mk_viandante3d.py [uscita.html]. La pagina costruita non si salva su git.
import base64,os,sys
here=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,here)
import mk_zombie3d as Z
rif='data:image/webp;base64,'+base64.b64encode(open(os.path.join(here,'..','sprite','mostri3d','viandante_rif.webp'),'rb').read()).decode()
Z.pagina(sys.argv[1] if len(sys.argv)>1 else os.path.join(here,'viandante3d.html'),libs=['scultura.js','viandante.js'],
  cfg={'titolo':'Il Viandante in 3D','modelli':['viandante'],'scena':'studio','luce':'morbida'},titolo='Il Viandante in 3D',sotto='Il personaggio della tua immagine in 3D vero',
  carica='Il viandante si prepara…',rif=rif)
