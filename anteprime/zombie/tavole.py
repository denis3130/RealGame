# compone le tavole della vetrina: per ogni prop una riga con le quattro viste; quattro prop per tavola. python3 tavole.py
from PIL import Image,ImageDraw
import os
import sys
D=__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'vetrina')+'/';props=['albero_morto','albero_vivo','carriola','cartello','casa','casse_botte','cripta','finestre_porta','fossa','lampione','lapidi','muro_cancello','portico','pozzo','sasso_cespuglio_fieno','zucche_recinto']
lab=['eroe a sinistra','eroe a destra','eroe sopra','eroe sotto'];H=700
for b in range(4):
    rows=[]
    for name in props[b*4:b*4+4]:
        ims=[Image.open(D+name+'_%d.png'%i).convert('RGB') for i in range(4)];ims=[im.resize((int(im.width*H/im.height),H)) for im in ims]
        W=sum(im.width for im in ims)+40*3;row=Image.new('RGB',(W,H+20),(24,24,28));d=ImageDraw.Draw(row);x=0
        for i,im in enumerate(ims):row.paste(im,(x,20));d.text((x+4,4),name+' · '+lab[i],fill=(230,230,230));x+=im.width+40
        rows.append(row)
    W=max(r.width for r in rows);board=Image.new('RGB',(W,sum(r.height+6 for r in rows)),(24,24,28));y=0
    for r in rows:board.paste(r,(0,y));y+=r.height+6
    board.save(D+'board%d.jpg'%(b+1),quality=82)
print('tavole pronte')
