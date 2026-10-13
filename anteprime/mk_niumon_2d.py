# Costruisce anteprime/niumon_2d.html: il primo Niumon (dal foglio di Denis del 13 ottobre) come sprite 2D in pixel art dentro un bosco
# 3D di notte in stile HD-2D (WebGL2, nessuna libreria): Lotta (avversario davanti/tre quarti, il tuo da dietro, quattro mosse), Mappa
# (cammina nel bosco col dito, quattro direzioni), Sprite (tutti i fogli da vicino). Gli sprite stanno in sprite/niumon/primo/.
# Uso: python3 anteprime/mk_niumon_2d.py   (la pagina costruita non si salva su git)
import os,base64,json
here=os.path.dirname(os.path.abspath(__file__));sp=os.path.join(here,'..','sprite','niumon','primo')
K={'foeIdle':'lotta_avversario_fermo','foeAtk':'lotta_avversario_attacco','foeHit':'lotta_avversario_colpito','mineBack':'lotta_tuo_dietro',
   'mapGiu':'mappa_giu','mapSu':'mappa_su','mapSx':'mappa_sinistra','mapDx':'mappa_destra','mapPasso':'mappa_passo_sinistra'}
S={}
for k,f in K.items():
  m=json.load(open(os.path.join(sp,f+'.json')));m['src']='data:image/png;base64,'+base64.b64encode(open(os.path.join(sp,f+'.png'),'rb').read()).decode();S[k]=m
tpl=open(os.path.join(here,'niumon_2d.tpl.html'),encoding='utf-8').read()
page=tpl.replace('__SPRITES__',json.dumps(S,separators=(',',':')))
out=os.path.join(here,'niumon_2d.html');open(out,'w',encoding='utf-8').write(page)
print('anteprime/niumon_2d.html pronto (%d KB)'%(len(page)//1024))
