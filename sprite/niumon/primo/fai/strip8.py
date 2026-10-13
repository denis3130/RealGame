# python3 strip8.py set zoom out : the 8 directions in a row (S SW W NW N NE E SE), mirrored ones flipped
import sys,numpy as np, pix3
from PIL import Image
st=sys.argv[1];z=int(sys.argv[2]);out=sys.argv[3];suf=sys.argv[4] if len(sys.argv)>4 else ''
def im(n,mir=False):
  try:lab=np.load(n+suf+'_lab.npy',allow_pickle=True);op=np.load(n+suf+'_op.npy')
  except FileNotFoundError:lab=np.load(n+'_lab.npy',allow_pickle=True);op=np.load(n+'_op.npy')
  if mir:lab=lab[:,::-1];op=op[:,::-1]
  return pix3.render(lab,op,z)
L=[('spr_front_'+st,0),('spr_sw_'+st,0),('spr_left_'+st,0),('spr_nw_'+st,0),('spr_back_'+st,0),('spr_nw_'+st,1),('spr_right_'+st,0),('spr_sw_'+st,1)]
ims=[im(n,m) for n,m in L];H=max(i.size[1] for i in ims);W=sum(i.size[0] for i in ims)+8*z*len(ims)
c=Image.new('RGBA',(W,H+4*z),(58,66,84,255));x=0
for i in ims:c.alpha_composite(i,(x,H-i.size[1]));x+=i.size[0]+8*z
c.save(out);print(out,c.size)
