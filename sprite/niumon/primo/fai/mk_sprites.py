# All the pixel sprites of the first Niumon from Denis's sheet: TV smoothing (no pencil grain, lines kept) then the pixel step of pix3.
# python3 mk_sprites.py [only] -> spr_<pose>_<set>.png (+ _lab.npy/_op.npy), contact.png
import sys,json,numpy as np, pix3
from pix import load
from PIL import Image
from skimage.restoration import denoise_tv_chambolle
EYES={'front':[[62,264,107,335],[148,264,198,335]],'left':[[38,268,94,334]],'right':[[345,268,388,334]],
  'idle':[[48,206,82,254],[110,200,150,254]],'walk':[[38,164,86,216]],'attack':[[58,208,95,244],[120,202,160,246]],'hit':[],'back':[]}
SETS={'battle':{'idle':4,'attack':4,'hit':4,'back':6},
      'map':{'front':9.5,'back':9.5,'left':9.5,'right':9.5,'walk':7.5}}
P=dict(contrast=1.3,shift=16,chroma_t=9,line_f=.12,ink_t=95,ink_c=20)
def tv(a,m,w):
  out=np.stack([denoise_tv_chambolle(a[...,c],weight=w) for c in range(3)],-1);return np.where(m[...,None],out,a)
def fix_lilac(lab,op):
  # light lilac read as grey inside the smoke: a grey pixel with mostly violet neighbours becomes the violet of its lightness
  G2V={'g0':'v0','g1':'v0','g2':'v1','g3':'v2','g4':'v3','g5':'v4'};H,W=lab.shape;out=lab.copy()
  for it in range(2):
    src=out.copy()
    for y in range(1,H-1):
      for x in range(1,W-1):
        c=src[y,x]
        if not op[y,x] or c not in G2V:continue
        nb=[src[y+u,x+v] for u in(-1,0,1) for v in(-1,0,1) if (u or v) and op[y+u,x+v]]
        nv=sum(1 for q in nb if q[0]=='v');ng=sum(1 for q in nb if q[0]=='g')
        if nv>=4 and nv>ng:out[y,x]=G2V[c]
  # small islands of grey inside the smoke (its light spots) become light violet
  from scipy import ndimage as nd
  g=np.isin(out,list(G2V))&op;L,k=nd.label(g)
  for i in range(1,k+1):
    c=L==i
    if c.sum()>18:continue
    ring=nd.binary_dilation(c,structure=np.ones((3,3)))&~c&op
    rv=np.array([q[0]=='v' or q in('ilv','olv') for q in out[ring]]);rl=np.array([q in('il','ol') for q in out[ring]])
    if ring.sum() and (rv.sum()+.5*rl.sum())/ring.sum()>.6:
      for y,x in zip(*np.where(c)):out[y,x]=G2V[out[y,x]]
  return out
def make(n,k,setn,extra=None):
  a,m=load(n);w=.12 if setn=='battle' else .16
  kw=dict(P);kw.update(extra or {})
  ki=int(round(k)) if abs(k-round(k))<1e-6 else None
  if ki is None:
    # fractional k: resample the drawing so that k becomes a whole number of pixels
    f=round(k)/k;W,H=int(a.shape[1]*f),int(a.shape[0]*f)
    a=np.asarray(Image.fromarray((a*255).astype(np.uint8)).resize((W,H),Image.LANCZOS)).astype(np.float32)/255
    m=np.asarray(Image.fromarray((m*255).astype(np.uint8)).resize((W,H),Image.BILINEAR))>127
    eyes=[[int(v*f) for v in b] for b in EYES[n]];ki=int(round(k))
  else:eyes=EYES[n]
  a2=tv(a,m,w)
  lab,op,geo=pix3.run(n,ki,eyes=eyes,arrays=(a2,m),stamps=False,**kw)
  lab=fix_lilac(lab,op)
  tag='spr_%s_%s'%(n,setn);pix3.render(lab,op).save(tag+'.png');np.save(tag+'_lab.npy',lab.astype(str));np.save(tag+'_op.npy',op)
  return pix3.render(lab,op,6,(58,66,84,255))
if __name__=='__main__':
  only=sys.argv[1:] 
  out=[]
  for s,poses in SETS.items():
    for n,k in poses.items():
      if only and n not in only and s not in only:continue
      im=make(n,k,s);out.append(im);print(s,n,im.size[0]//6,im.size[1]//6)
  H=max(i.size[1] for i in out);W=sum(i.size[0] for i in out)+10*len(out);c=Image.new('RGB',(W,H),(30,34,44));x=0
  for i in out:c.paste(i,(x,0));x+=i.size[0]+10
  c.save('contact.png');print(c.size)
