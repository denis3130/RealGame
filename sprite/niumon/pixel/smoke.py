# The smoke of a view: components of the violet part, a geodesic distance from each root (0) to the tip (1), the direction across it.
# python3 smoke.py view -> view_smoke.npz (s, ux, uy, w) and view_smoke.png (debug)
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage.graph import MCP_Geometric
n=sys.argv[1];import json;ROOTS=json.loads(sys.argv[2]) if len(sys.argv)>2 else []
a=np.asarray(Image.open(n+'.png').convert('RGB')).astype(float)
m=np.asarray(Image.open(n+'_mask.png'))>127
lum=a[...,0]*.3+a[...,1]*.59+a[...,2]*.11;ch=a.max(-1)-a.min(-1)
vio=nd.binary_opening(m&(ch>16),iterations=3);vio=nd.binary_closing(vio,iterations=6)&m
lab,k=nd.label(vio);sz=nd.sum(vio,lab,range(1,k+1));order=np.argsort(-sz)
body=nd.binary_erosion(m&~vio,iterations=8);bl,bk=nd.label(body);bsz=nd.sum(body,bl,range(1,bk+1));body=bl==(np.argmax(bsz)+1)
H,W=m.shape;S=np.full((H,W),-1.0);comp=np.zeros((H,W),int);info=[]
dt_body=nd.distance_transform_edt(~body)
for ci,idx in enumerate(order[:6]):
  c=lab==(idx+1)
  if c.sum()<4000:continue
  # the root: the pixel of the component nearest to the body (or the puffs: skip those far from the body)
  dmin=dt_body[c].min()
  if dmin>60:continue
  ys,xs=np.where(c)
  if ROOTS:
    dd=[np.min((xs-rx)**2+(ys-ry)**2) for rx,ry in ROOTS];rx,ry=ROOTS[int(np.argmin(dd))];j=np.argmin((xs-rx)**2+(ys-ry)**2)
  else:j=np.argmin(dt_body[c])
  root=(ys[j],xs[j])
  cost=np.where(c,1.0,np.inf);mcp=MCP_Geometric(cost);dist,_=mcp.find_costs([root])
  d=np.where(c,dist,np.nan);mx=np.nanmax(d[np.isfinite(d)])
  S[c]=np.clip(d[c]/mx,0,1);comp[c]=len(info)+1;info.append(dict(root=(int(root[1]),int(root[0])),size=int(c.sum()),len=float(mx)))
# extend s into the neighbourhood (nearest smoke pixel), smooth, the direction across = perpendicular of the gradient
has=S>=0;di,(iy,ix)=nd.distance_transform_edt(~has,return_indices=True)
Se=S[iy,ix];Ce=comp[iy,ix];near=di<40
Ss=nd.gaussian_filter(np.where(near,Se,0),8)/np.maximum(nd.gaussian_filter(near.astype(float),8),1e-3)
gy,gx=np.gradient(Ss);gl=np.hypot(gx,gy)+1e-9;ux,uy=-gy/gl,gx/gl
w=np.clip(Se/.28,0,1)**1.5*np.clip(1-(di-12)/28,0,1)*near
np.savez_compressed(n+'_smoke.npz',s=Se.astype(np.float32),ux=ux.astype(np.float32),uy=uy.astype(np.float32),w=w.astype(np.float32),comp=Ce.astype(np.int8))
dbg=(a*.35).astype(np.uint8);col=np.zeros_like(dbg);col[...,0]=(Se*255).astype(np.uint8);col[...,2]=((1-Se)*255).astype(np.uint8);col[...,1]=(w*200).astype(np.uint8)
dbg=np.where((w>0)[...,None],col,dbg)
Image.fromarray(dbg).resize((627,627)).save(n+'_smoke.png');print(n,info)
