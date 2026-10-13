# the eye regions of a drawing: inside a box, the area closed by the dark lid line. python3 eyes2.py view x0 y0 x1 y1 [...]
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
def eye_mask(a,box):
  x0,y0,x1,y1=box;sub=a[y0:y1,x0:x1];lum=sub[...,0]*.3+sub[...,1]*.59+sub[...,2]*.11;ch=sub.max(-1)-sub.min(-1)
  dk=(lum<.36)|((ch>.075)&(lum<.93))
  dk=nd.binary_closing(dk,structure=np.ones((5,5)))
  f=nd.binary_fill_holes(dk)
  f=nd.binary_opening(f,structure=np.ones((7,7)))
  lab,k=nd.label(f);
  if not k:return np.zeros(a.shape[:2],bool)
  sz=nd.sum(f,lab,range(1,k+1));big=lab==(np.argmax(sz)+1)
  from skimage.morphology import convex_hull_image
  big=convex_hull_image(big)&nd.binary_dilation(big,iterations=14)
  out=np.zeros(a.shape[:2],bool);out[y0:y1,x0:x1]=big;return out
if __name__=='__main__':
  v=sys.argv[1];a=np.asarray(Image.open(v+'.png').convert('RGB')).astype(np.float32)/255
  boxes=[list(map(int,sys.argv[i:i+4])) for i in range(2,len(sys.argv),4)];M=np.zeros(a.shape[:2],bool)
  for b in boxes:M|=eye_mask(a,b)
  Image.fromarray((M*255).astype(np.uint8)).save(v+'_eyes.png')
  dbg=(a*255).astype(np.uint8).copy();dbg[M]=(dbg[M]*.5+np.array([0,255,0])*.5).astype(np.uint8)
  x0=min(b[0] for b in boxes);y0=min(b[1] for b in boxes);x1=max(b[2] for b in boxes);y1=max(b[3] for b in boxes)
  Image.fromarray(dbg).crop((x0,y0,x1,y1)).resize(((x1-x0)*2,(y1-y0)*2)).save(v+'_eyes_dbg.png');print(v,M.sum())
