# Same clean eyes on every direction (detail size): inner corner A, outer corner B, half width w
import numpy as np, pix3
from eyesr import eye
E={'spr_front_dir':[((17.6,54.6),(13.2,47.6),2.1),((28.4,54.6),(32.8,47.6),2.1)],
   'spr_left_dir':[((9.2,55.0),(13.6,47.4),2.2)],'spr_right_dir':[((68.0,48.6),(65.4,40.8),1.9)],
   'spr_sw_dir':[((17.2,52.6),(21.4,46.6),1.8),((10.4,53.4),(7.0,49.6),1.25)],'spr_nw_dir':[],'spr_back_dir':[]}
for n,L in E.items():
  lab=np.load(n+'_lab.npy',allow_pickle=True).astype(object);op=np.load(n+'_op.npy')
  for A,B,w in L:lab,op=eye(lab,op,A,B,w)
  np.save(n+'_e_lab.npy',lab.astype(str));np.save(n+'_e_op.npy',op);pix3.render(lab,op).save(n+'_e.png')
print('ok')
