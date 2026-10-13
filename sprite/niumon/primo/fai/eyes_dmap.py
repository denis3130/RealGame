# Tiny hand-made eyes on the map-size directions
import numpy as np, pix3
SH={'#':'ol','K':'ek','D':'ei','M':'em','L':'el','W':'ew','H':'h'}
EYE=('ek','ei','em','el','ew','h')
M={'spr_front_dmap':[(8,29,['##..','#HM#','.LM#','..##']),(17,29,['..##','#HM#','#ML.','##..'])],
   'spr_left_dmap':[(5,28,['..##','.#H#','#MM#','#L#.'])],
   'spr_right_dmap':[(38,24,['##..','#H#.','#MM#','.#L#'])],
   'spr_sw_dmap':[(10,28,['..##','#HM#','#ML.','##..']),(5,29,['#.','M#','L#'])],'spr_nw_dmap':[],'spr_back_dmap':[]}
for n,S in M.items():
  lab=np.load(n+'_lab.npy',allow_pickle=True).astype(object);op=np.load(n+'_op.npy')
  lab=np.where(np.isin(lab,EYE),'g3',lab)
  for x0,y0,rows in S:
    for i,r in enumerate(rows):
      for j,c in enumerate(r):
        if c!='.':lab[y0+i,x0+j]=SH[c];op[y0+i,x0+j]=True
  np.save(n+'_e_lab.npy',lab.astype(str));np.save(n+'_e_op.npy',op);pix3.render(lab,op).save(n+'_e.png')
print('ok')
