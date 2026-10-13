# Pixel art from a drawing, v3: python3 pix3.py view   (settings per view in VIEWS)
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage as nd
from skimage.color import rgb2lab
from skimage.morphology import skeletonize
from pix import load,blocks
HEX=lambda h:[int(h[i:i+2],16)/255 for i in (1,3,5)]
PAL={'ol':'#221e29','il':'#2b2634','pp':'#15121c','ed':'#4a3a8c',
  'g0':'#f2ede8','g1':'#d0cac9','g2':'#aca6aa','g3':'#8a8490','g4':'#696373','g5':'#4b4556',
  'v0':'#ebe2f9','v1':'#c8b5ec','v2':'#a58bd6','v3':'#8167b8','v4':'#5e4990',
  'ek':'#2f2649','em':'#8064cc','el':'#c4adf2','ew':'#f4effd','h':'#ffffff'}
GR=['g0','g1','g2','g3','g4','g5'];VI=['v0','v1','v2','v3','v4']
LAB={q:rgb2lab(np.array([[HEX(PAL[q])]]))[0,0] for q in PAL}
VIEWS={'v_front':dict(k=12,eyes=[]),
       'v_back':dict(k=12,eyes=[])}
def nearest(Lab,keys,w=(1,1.6,1.6)):
  P=np.array([LAB[q] for q in keys]);d=((Lab[...,None,:]-P)**2*np.array(w)).sum(-1);return np.array(keys)[d.argmin(-1)]
def run(n,k,eyes=(),ink_t=80,line_f=.1,cov_t=.42,contrast=1.45,chroma_t=13,shift=12,ink_c=24,arrays=None,geo=None,stamps=True):
  a,m=arrays if arrays else load(n)
  if geo:ox,oy,W,H=geo
  else:
    ys,xs=np.where(m);W=int(np.ceil((xs.max()-xs.min()+1)/k))+4;H=int(np.ceil((ys.max()-ys.min()+1)/k))+4;ox=xs.min()-2*k;oy=ys.min()-2*k
  lum=(a[...,0]*.3+a[...,1]*.59+a[...,2]*.11)*255
  sg=k*.3;mb=nd.gaussian_filter(m.astype(np.float32),sg)
  ab=np.stack([nd.gaussian_filter(a[...,c]*m,sg) for c in range(3)],-1)/np.maximum(mb,1e-4)[...,None]
  cov,col=blocks(ab,m,k,ox,oy,W,H);op=cov>=cov_t
  L=rgb2lab(col.clip(0,1));L[...,0]=50+(L[...,0]-50)*contrast-shift
  C=np.hypot(L[...,1],L[...,2])
  # grey or violet by chroma (smoothed so the boundary is clean), then the nearest step of the ramp by lightness
  vio=nd.median_filter((C>chroma_t).astype(np.uint8),size=3)>0
  Lg=np.array([LAB[q][0] for q in GR]);Lv=np.array([LAB[q][0] for q in VI])
  gi=np.abs(L[...,0][...,None]-Lg).argmin(-1);vi=np.abs(L[...,0][...,None]-Lv).argmin(-1)
  lab=np.where(vio,np.array(VI)[vi],np.array(GR)[gi]).astype(object)
  # inner lines: the drawing's dark strokes away from the silhouette, thinned to one pixel
  bnd=m&~nd.binary_erosion(m,iterations=10)
  loc=nd.gaussian_filter(lum,10)
  ink=((lum<ink_t)&(lum<loc-ink_c)&m&~bnd).astype(np.float32)
  _,fr=blocks(np.stack([ink]*3,-1),np.ones_like(m),k,ox,oy,W,H)
  line=skeletonize((fr[...,0]>line_f)&op)
  edge=op&nd.binary_dilation(~op,structure=[[0,1,0],[1,1,1],[0,1,0]])
  # eyes: the most common colour of the drawing in each pixel (not the average), with the highlight favoured
  eyem=np.zeros((H,W),bool)
  for x0,y0,x1,y1 in eyes:
    j0,j1=(x0-ox)//k,(x1-ox)//k+1;i0,i1=(y0-oy)//k,(y1-oy)//k+1
    for i in range(i0,i1):
      for j in range(j0,j1):
        blk=a[oy+i*k:oy+(i+1)*k,ox+j*k:ox+(j+1)*k];mk=m[oy+i*k:oy+(i+1)*k,ox+j*k:ox+(j+1)*k]
        if mk.mean()<.5:continue
        q=nearest(rgb2lab(blk),['ol','ek','em','el','ew','h']+GR)
        vals,cnt=np.unique(q,return_counts=True);cnt=cnt.astype(float)
        for t,wt in (('h',3),('ol',1.15),('ew',1.2)):cnt[vals==t]*=wt
        lab[i,j]=vals[cnt.argmax()];eyem[i,j]=True
  line&=~eyem
  # lines: no lone pixels
  nb=nd.convolve((line|nd.binary_dilation(~op)).astype(int),np.ones((3,3),int),mode='constant')-line
  line&=nb>0
  lab=np.where(line,'il',lab);lab=np.where(edge,'ol',lab)
  # fill: a lone pixel of a step of the ramp takes the commonest step round it
  lab=despeckle(lab,op)
  import eyes as EY
  if stamps:
    for e in getattr(EY,n.split('_')[1].upper(),[]):EY.stamp(lab,op,e)
  return lab,op,(ox,oy,W,H)
def despeckle(lab,op):
  out=lab.copy();H,W=lab.shape
  for y in range(1,H-1):
    for x in range(1,W-1):
      c=lab[y,x]
      if not op[y,x] or c in('ol','il'):continue
      nbh=[lab[y+dy,x+dx] for dy in(-1,0,1) for dx in(-1,0,1) if (dy or dx) and op[y+dy,x+dx] and lab[y+dy,x+dx] not in('ol','il')]
      if nbh and c not in nbh:
        vals,cnt=np.unique(nbh,return_counts=True);out[y,x]=vals[cnt.argmax()]
  return out
def render(lab,op,scale=1,bg=None):
  H,W=lab.shape;rgb=np.zeros((H,W,4),np.uint8)
  for q in PAL:rgb[lab==q,:3]=(np.array(HEX(PAL[q]))*255).astype(np.uint8)
  rgb[...,3]=op*255;im=Image.fromarray(rgb)
  if scale>1:im=im.resize((W*scale,H*scale),Image.NEAREST)
  if bg:b=Image.new('RGBA',im.size,bg);b.alpha_composite(im);im=b
  return im
if __name__=='__main__':
  n=sys.argv[1];kw=dict(VIEWS[n]);kw.update(json.loads(sys.argv[2]) if len(sys.argv)>2 else {})
  lab,op,geo=run(n,**kw)
  render(lab,op).save(n+'_px.png');render(lab,op,8,(60,70,90,255)).save(n+'_px_x8.png')
  np.save(n+'_lab.npy',lab.astype(str));print(n,'size',geo[2],geo[3],'colors',len(set(lab[op])))
