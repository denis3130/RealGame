# Costruisce anteprime/lumbra_lotta.html: Lumbra (progetto Niumon) in pixel art come le creature della lotta che Denis ha mandato il
# 13 ottobre: lo sprite davanti (l'avversario) e quello da dietro (il suo Niumon), animati, in una scena di lotta nel bosco di notte,
# con quattro mosse da provare e la vista «Sprite» per guardarli da vicino. Gli sprite si fanno con sprite/niumon/pixel/ (vedi LEGGIMI).
# Uso: python3 anteprime/mk_lumbra_lotta.py   (la pagina costruita non si salva su git)
import os,base64,json
here=os.path.dirname(os.path.abspath(__file__));px=os.path.join(here,'..','sprite','niumon','pixel')
tpl=open(os.path.join(here,'lumbra_lotta.tpl.html'),encoding='utf-8').read()
def uri(n):return 'data:image/png;base64,'+base64.b64encode(open(os.path.join(px,n),'rb').read()).decode()
page=tpl.replace('__FRONT__',uri('lumbra_davanti.png')).replace('__BACK__',uri('lumbra_dietro.png'))
page=page.replace('__FRONTMETA__',open(os.path.join(px,'lumbra_davanti.json')).read().strip()).replace('__BACKMETA__',open(os.path.join(px,'lumbra_dietro.json')).read().strip())
out=os.path.join(here,'lumbra_lotta.html');open(out,'w',encoding='utf-8').write(page)
print('anteprime/lumbra_lotta.html pronto (%d KB)'%(len(page)//1024))
