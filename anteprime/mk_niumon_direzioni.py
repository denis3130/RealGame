# Costruisce anteprime/niumon_direzioni.html: il primo Niumon (foglio di Denis del 13 ottobre) in pixel art nelle 8 direzioni, da
# controllare prima di metterlo nel gioco: la piattaforma che gira, le 8 direzioni a grandezza di dettaglio e di gioco, il metodo,
# le due viste della lotta. Sprite in sprite/niumon/primo/direzioni/ (e i due della lotta in sprite/niumon/primo/).
# Uso: python3 anteprime/mk_niumon_direzioni.py   (la pagina costruita non si salva su git)
import os,base64,json
here=os.path.dirname(os.path.abspath(__file__));P=os.path.join(here,'..','sprite','niumon','primo')
def sheet(path):
  m=json.load(open(path+'.json'));m['src']='data:image/png;base64,'+base64.b64encode(open(path+'.png','rb').read()).decode();return m
S={}
for size in ('grande','mappa'):
  for k in ('giu','giu_sinistra','sinistra','su_sinistra','su','destra'):S[size+'_'+k]=sheet(os.path.join(P,'direzioni','%s_%s'%(size,k)))
S['lotta_avversario']=sheet(os.path.join(P,'lotta_avversario_fermo'));S['lotta_tuo']=sheet(os.path.join(P,'lotta_tuo_dietro'))
tpl=open(os.path.join(here,'niumon_direzioni.tpl.html'),encoding='utf-8').read()
page=tpl.replace('__SHEETS__',json.dumps(S,separators=(',',':')))
open(os.path.join(here,'niumon_direzioni.html'),'w',encoding='utf-8').write(page);print('anteprime/niumon_direzioni.html pronto (%d KB)'%(len(page)//1024))
