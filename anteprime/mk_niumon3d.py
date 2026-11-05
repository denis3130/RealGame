# Costruisce anteprime/niumon3d.html: il niumon di fuoco in 3D vero (sprite/mostri3d/niumon_fuoco.js, il cucciolo di fuoco dell'immagine di
# Denis del 5 novembre, scolpito nel codice con sprite/mostri3d/scultura.js e la cassetta sprite/mostri3d/kit3d.js, disegnato da
# sprite/mostri3d/mb3.js) nella pagina dei modelli in 3D (anteprime/zombie3d.js) con la grotta, la vista «Pixel» come l'immagine, le braci
# che salgono dalle fiamme, la fiammata, «Quattro direzioni», «Viso da vicino» e «Con l'immagine» (sprite/mostri3d/niumon_rif.webp).
# Uso: python3 anteprime/mk_niumon3d.py [uscita.html]. La pagina costruita non si salva su git.
import base64,os,sys
here=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,here)
import mk_zombie3d as Z
rif='data:image/webp;base64,'+base64.b64encode(open(os.path.join(here,'..','sprite','mostri3d','niumon_rif.webp'),'rb').read()).decode()
Z.pagina(sys.argv[1] if len(sys.argv)>1 else os.path.join(here,'niumon3d.html'),libs=['scultura.js','niumon_fuoco.js'],
  cfg={'titolo':'Niumon di fuoco','modelli':['niumon'],'scena':'grotta','scene':['grotta','notte','studio'],'pixel':'spento'},titolo='Niumon di fuoco',
  sotto='Il niumon della tua immagine in 3D vero',carica='Il niumon si accende…',rif=rif)
