# Put the clean eyes on the battle sprites and the little hand-made eyes on the map sprites.
import numpy as np, pix3
from eyesr import eye
from PIL import Image
def ld(n):return np.load(n+'_lab.npy',allow_pickle=True).astype(object),np.load(n+'_op.npy')
def sv(n,lab,op):np.save(n+'_lab.npy',lab.astype(str));np.save(n+'_op.npy',op);pix3.render(lab,op).save(n+'.png')
B={'spr_idle_battle':[((26.8,60.2),(34.0,48.8),2.7),((14.8,60.5),(10.2,50.5),2.0)],
   'spr_attack_battle':[((27.5,58.8),(33.2,49.8),2.3),((17.6,58.6),(13.4,52.0),1.7)]}
for n,E in B.items():
  lab,op=ld(n)
  for A,Bp,w in E:lab,op=eye(lab,op,A,Bp,w)
  sv(n+'_e',lab,op)
# map sprites: tiny eyes by hand ('.' keeps the pixel)
SH={'#':'ol','K':'ek','D':'ei','M':'em','L':'el','W':'ew','H':'h'}
def stamp(lab,op,x0,y0,rows):
  for i,r in enumerate(rows):
    for j,c in enumerate(r):
      if c!='.':lab[y0+i,x0+j]=SH[c];op[y0+i,x0+j]=True
M={'spr_front_map':[(8,28,['##..','#HM#','.LM#','..##']),(17,28,['..##','#HM#','#ML.','##..'])],
   'spr_left_map':[(5,28,['..##','.#H#','#MM#','#L#.'])],
   'spr_right_map':[(38,24,['##..','#H#.','#MM#','.#L#'])],
   'spr_walk_map':[(6,22,['..##','.#H#','#MM#','#L#.'])]}
for n,S in M.items():
  lab,op=ld(n)
  for y in range(lab.shape[0]):
    for x in range(lab.shape[1]):
      if lab[y,x] in('ek','ei','em','el','ew','h'):lab[y,x]='g3'
  for x0,y0,rows in S:stamp(lab,op,x0,y0,rows)
  sv(n+'_e',lab,op)
print('ok')
