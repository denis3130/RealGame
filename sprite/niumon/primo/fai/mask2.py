# python3 mask2.py name yband -> name_mask.png: the creature with its smoke and puffs, without paper and the lilac pencil shadow
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
n=sys.argv[1];yb=int(sys.argv[2])
a=np.asarray(Image.open(n+'.png').convert('RGB')).astype(np.float32)
lum=a.mean(-1);ch=a.max(-1)-a.min(-1)
def fill_small(m,mx):
  h=nd.binary_fill_holes(m)&~m;lab,k=nd.label(h)
  if k:
    sz=nd.sum(h,lab,range(1,k+1));ok=np.zeros(k+1,bool);ok[1:]=sz<mx;m=m|ok[lab]
  return m
m=(lum<236)|(ch>22)
# under the band: only grey or dark (the paws and their outline) and strong violet (smoke), never the lilac hatching on the floor
band=np.zeros_like(m);band[yb:]=True
keep=((ch<15)&(lum<236))|(lum<95)|((ch>42)&(lum<215))
m=np.where(band,keep,m)
m=nd.binary_opening(m,iterations=1)
m=nd.binary_closing(m,iterations=3)
m=fill_small(m,1500)
m=nd.binary_opening(m,iterations=2)
lab,k=nd.label(m);sz=nd.sum(m,lab,range(1,k+1))
big=np.argmax(sz)+1
# keep the body and the pieces near it (puffs), drop lone specks and anything touching the crop edge far from the body
dist=nd.distance_transform_edt(lab!=big)
ok=np.zeros(k+1,bool)
for i in range(1,k+1):
  c=lab==i;ys,xs=np.where(c)
  edge=ys.min()==0 or xs.min()==0 or xs.max()==m.shape[1]-1
  if i==big or (sz[i-1]>60 and dist[c].min()<70 and not edge):ok[i]=True
m=ok[lab]
Image.fromarray((m*255).astype(np.uint8)).save(n+'_mask.png')
dbg=a.copy();dbg[~m]=dbg[~m]*.3+np.array([255,40,40])*.7
Image.fromarray(dbg.astype(np.uint8)).save(n+'_dbg.png')
ys,xs=np.where(m);print(n,'parts',int(ok.sum()),'bbox',xs.min(),ys.min(),xs.max(),ys.max())
