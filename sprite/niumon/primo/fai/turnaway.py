# Back three-quarter view from the side drawing: the face turns away (the front of the muzzle is cut off along a round line, the eye
# and the mouth become fur), the smoke comes forward over the body, the figure is narrowed like the front three-quarter one.
import json,sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
from matplotlib.path import Path
o=json.loads(sys.argv[1]) if len(sys.argv)>1 else {}
A=np.asarray(Image.open('left.png').convert('RGB')).astype(np.float32);MA=np.asarray(Image.open('left_mask.png'))>127;H,W=MA.shape
def poly(pts):
  yy,xx=np.mgrid[0:H,0:W];return Path(pts).contains_points(np.stack([xx.ravel(),yy.ravel()],-1)).reshape(H,W)
cut=poly(o.get('cut',[[0,225],[22,240],[40,272],[46,310],[40,348],[24,374],[0,384]]))
m=MA&~cut
inp=poly(o.get('inp',[[30,250],[100,250],[104,300],[98,350],[60,356],[28,350]]))&m
keep=m&~nd.binary_dilation(inp,iterations=2)
_,(iy,ix)=nd.distance_transform_edt(~keep,return_indices=True)
fill=A[iy,ix];fill=nd.gaussian_filter(fill,[4,4,0])
# a little of the pencil grain back, borrowed from the cheek just behind
tex=A[np.clip(np.arange(H)[:,None]+0,0,H-1),np.clip(np.arange(W)[None,:]+70,0,W-1)]
gl=tex.mean(-1,keepdims=True);fill=fill+(gl-nd.gaussian_filter(gl,[4,4,0]))*.8
out=np.where(inp[...,None],fill,A)
out[~m]=[250,248,245]
f=o.get('narrow',.82);Wn=int(W*f)
o3=Image.fromarray(out.clip(0,255).astype(np.uint8)).resize((Wn,H),Image.LANCZOS);m3=Image.fromarray((m*255).astype(np.uint8)).resize((Wn,H),Image.BILINEAR)
c=np.asarray(o3).copy();mm=np.asarray(m3)>127;c[~mm]=[250,248,245]
Image.fromarray(c).save('nw.png');Image.fromarray((mm*255).astype(np.uint8)).save('nw_mask.png');print('nw',c.shape)
