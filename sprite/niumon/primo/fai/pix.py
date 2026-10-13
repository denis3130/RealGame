# Helpers for the pixel art (load a drawing and its mask, average blocks of k×k pixels). Run alone: python3 pix.py name k -> a raw
# downscale name_k.png, name_k_x8.png (the first step, before the palette, the outline and the hand-made eyes of pix3.py)
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
def load(n):
  a=np.asarray(Image.open(n+'.png').convert('RGB')).astype(np.float32)/255
  m=np.asarray(Image.open(n+'_mask.png'))>127
  return a,m
def blocks(a,m,k,ox,oy,W,H):
  # crop the grid: block (i,j) covers rows oy+i*k .. +k, cols ox+j*k .. +k (outside the image = empty)
  Hh,Ww=m.shape;pad=k*4
  A=np.zeros((H*k,W*k,3),np.float32);M=np.zeros((H*k,W*k),np.float32)
  y0,x0=oy,ox
  ys=slice(max(0,y0),min(Hh,y0+H*k));xs=slice(max(0,x0),min(Ww,x0+W*k))
  A[ys.start-y0:ys.stop-y0,xs.start-x0:xs.stop-x0]=a[ys,xs];M[ys.start-y0:ys.stop-y0,xs.start-x0:xs.stop-x0]=m[ys,xs]
  Ab=(A*M[...,None]).reshape(H,k,W,k,3).sum((1,3));Mb=M.reshape(H,k,W,k).sum((1,3))
  cov=Mb/(k*k);col=Ab/np.maximum(Mb,1e-6)[...,None]
  return cov,col
if __name__=='__main__':
  n=sys.argv[1];k=int(sys.argv[2])
  a,m=load(n);ys,xs=np.where(m)
  W=int(np.ceil((xs.max()-xs.min()+1)/k))+4;H=int(np.ceil((ys.max()-ys.min()+1)/k))+4
  ox=xs.min()-2*k;oy=ys.min()-2*k
  # soften the pencil grain inside the mask (mask-aware blur) before averaging
  sg=k*.3;mb=nd.gaussian_filter(m.astype(np.float32),sg)
  ab=np.stack([nd.gaussian_filter(a[...,c]*m,sg) for c in range(3)],-1)/np.maximum(mb,1e-4)[...,None]
  cov,col=blocks(ab,m,k,ox,oy,W,H)
  op=cov>=.45
  out=np.zeros((H,W,4),np.uint8);out[...,:3]=(col*255).clip(0,255).astype(np.uint8);out[...,3]=op*255
  Image.fromarray(out).save('%s_%d.png'%(n,k))
  big=Image.fromarray(out).resize((W*8,H*8),Image.NEAREST)
  bg=Image.new('RGBA',big.size,(60,70,90,255));bg.alpha_composite(big);bg.save('%s_%d_x8.png'%(n,k))
  print(n,k,'size',W,H)
