# The standing three-quarter views made from Denis's own drawings: the side body (LEFT) with its head swapped for a three-quarter head
# (IDLE, front) or the back of the head (BACK), then the whole thing narrowed a little (the body seen at an angle).
# python3 collage.py which '{opts}' -> which.png + which_mask.png (crop-like, white paper)
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage as nd
which=sys.argv[1];o=json.loads(sys.argv[2]) if len(sys.argv)>2 else {}
def ld(n):return np.asarray(Image.open(n+'.png').convert('RGB')).astype(np.float32),np.asarray(Image.open(n+'_mask.png'))>127
A,MA=ld('left');H,W=MA.shape
def ell(shape,cx,cy,rx,ry):
  yy,xx=np.mgrid[0:shape[0],0:shape[1]];return ((xx-cx)/rx)**2+((yy-cy)/ry)**2<=1
from matplotlib.path import Path
def poly(shape,pts):
  yy,xx=np.mgrid[0:shape[0],0:shape[1]];return Path(pts).contains_points(np.stack([xx.ravel(),yy.ravel()],-1)).reshape(shape)
# 1. take away the side head (and its crest) from the side body
hc=o.get('hc',[128,250,128,150])
headL=MA&(poly(MA.shape,o['hp']) if 'hp' in o else ell(MA.shape,*hc))
base=A.copy();bm=MA&~headL
base[~bm]=255
# 2. the new head, cut out of its drawing, scaled and placed where the old head was
src=o.get('src','idle');B,MB=ld(src)
if 'sym' in o:
  # the back of the head is symmetric: its left half (no smoke there) mirrored makes the right half
  xm=o['sym'];Wb=B.shape[1];idx=np.arange(Wb);mi=np.where(idx>xm,np.clip(2*xm-idx,0,Wb-1),idx)
  B=B[:,mi];MB=MB[:,mi]
sc=o.get('sc',[128,175,112,140])
cut=MB&(poly(MB.shape,o['sp']) if 'sp' in o else ell(MB.shape,*sc))
# keep only the head piece (biggest part) and its puffs near it
L,k=nd.label(cut);sz=nd.sum(cut,L,range(1,k+1));cut=L==(np.argmax(sz)+1)
s=o.get('scale',1.18);sx=o.get('sx',1.0)
ys,xs=np.where(cut);cy,cx=ys.mean(),xs.mean()
if o.get('novio'):
  chb=B.max(-1)-B.min(-1);vb=nd.binary_closing(nd.binary_opening((chb>26)&MB,iterations=2),iterations=4)&cut
  keep=cut&~nd.binary_dilation(vb,iterations=3)
  _,(iy,ix)=nd.distance_transform_edt(~keep,return_indices=True);B=np.where(vb[...,None]|nd.binary_dilation(vb,iterations=3)[...,None],B[iy,ix],B)
  B=np.where((nd.binary_dilation(vb,iterations=4)&cut)[...,None],nd.gaussian_filter(B,[3,3,0]),B)
fe=o.get('feather',0)
alpha=cut.astype(np.float32)
if fe:
  # soft only where the cut goes through the creature (not along its own outline)
  inner=nd.binary_erosion(MB,iterations=6);soft=np.clip(nd.distance_transform_edt(cut)/fe,0,1)
  alpha=np.where(inner,soft,alpha)*cut
img=Image.fromarray(np.dstack([B,alpha[...,None]*255]).astype(np.uint8),'RGBA')
nw,nh=int(B.shape[1]*s*sx),int(B.shape[0]*s)
img=img.resize((nw,nh),Image.LANCZOS)
if o.get('mirror'):img=img.transpose(Image.FLIP_LEFT_RIGHT);cx=B.shape[1]-cx
tx,ty=o.get('at',[125,245])
ox,oy=int(round(tx-cx*s*sx)),int(round(ty-cy*s))
canvas=Image.fromarray(base.astype(np.uint8)).convert('RGBA')
over=Image.new('RGBA',(W,H),(0,0,0,0));over.alpha_composite(img,(max(0,ox),max(0,oy)),(max(0,-ox),max(0,-oy)))
hm=np.asarray(over)[...,3]>40
out=np.asarray(canvas).astype(np.float32).copy()
ov=np.asarray(over).astype(np.float32);al=ov[...,3:4]/255
out[...,:3]=out[...,:3]*(1-al)+ov[...,:3]*al
m=bm|hm
# 3. the smoke of the side view in front (back three-quarter: it comes toward us) or left behind
if o.get('smoke_front'):
  ch=A.max(-1)-A.min(-1);vio=nd.binary_closing(nd.binary_opening((ch>28)&MA,iterations=2),iterations=3)&MA&~headL
  out[...,:3]=np.where(vio[...,None],A,out[...,:3]);m|=vio
# 4. narrow the whole figure (seen at an angle)
f=o.get('narrow',.8);Wn=int(W*f)
o3=Image.fromarray(out[...,:3].clip(0,255).astype(np.uint8)).resize((Wn,H),Image.LANCZOS)
m3=Image.fromarray((m*255).astype(np.uint8)).resize((Wn,H),Image.BILINEAR)
canvas=np.asarray(o3).copy();mm=np.asarray(m3)>127;canvas[~mm]=[250,248,245]
Image.fromarray(canvas).save(which+'.png');Image.fromarray((mm*255).astype(np.uint8)).save(which+'_mask.png');print(which,canvas.shape)
