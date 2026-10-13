# python3 mask.py name yband  -> name_mask.png (creature + puffs, without paper and floor shadow), name_dbg.png
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
n=sys.argv[1];yb=int(sys.argv[2]);import json;OV=json.loads(sys.argv[3]) if len(sys.argv)>3 else []
a=np.asarray(Image.open(n+'.png').convert('RGB')).astype(np.float32)
lum=a[...,0]*.3+a[...,1]*.59+a[...,2]*.11;ch=a.max(-1)-a.min(-1)
def fill_small(m,mx):
  h=nd.binary_fill_holes(m)&~m;lab,k=nd.label(h)
  if k:
    sz=nd.sum(h,lab,range(1,k+1));ok=np.zeros(k+1,bool);ok[1:]=sz<mx;m=m|ok[lab]
  return m
pl=(lum<85)&(ch<24)
dark=lum<128;dark[yb:]=pl[yb:]
sat=nd.binary_opening((ch>28)&(lum<238),iterations=2);sat[yb:]=False
F=nd.binary_fill_holes(nd.binary_dilation(dark,iterations=6))
m=(F&(lum<243))|sat
m=nd.binary_closing(m,iterations=3)
m=fill_small(m,5000)
# the floor: below yb only the paws (closed by their dark grey outlines), never the lilac pencil shadow
Fa=nd.binary_fill_holes(nd.binary_dilation(lum<128,iterations=6))
P=Fa&(lum<243)&((ch<18)|(lum<80))
P=nd.binary_opening(P,iterations=3)
keepcol=np.zeros_like(m)
for (x0,x1,y1) in OV:keepcol[yb:y1,x0:x1]=True
m[yb:]=np.where(keepcol[yb:],m[yb:],P[yb:])
m=fill_small(m,5000)
lab,k=nd.label(m);sz=nd.sum(m,lab,range(1,k+1))
keep=np.zeros(k+1,bool);keep[1:]=sz>150
m=keep[lab]
Image.fromarray((m*255).astype(np.uint8)).save(n+'_mask.png')
dbg=a.copy();dbg[~m]=dbg[~m]*.25+np.array([255,0,0])*.75
Image.fromarray(dbg.astype(np.uint8)).resize((627,627)).save(n+'_dbg.png')
lab,k=nd.label(m);sz=nd.sum(m,lab,range(1,k+1))
ys,xs=np.where(m);print(n,'components',k,'sizes',sorted([int(x) for x in sz],reverse=True)[:12],'bbox',xs.min(),ys.min(),xs.max(),ys.max())
