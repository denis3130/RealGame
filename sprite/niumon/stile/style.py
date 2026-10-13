# Lumbra nel mio stile: un disegno di Denis ridipinto come i mostri di Mossbound (stesse forme). Uso: python3 style.py vista
# Lumbra in the style of the Mossbound monsters, from Denis's drawings: the same shapes (his silhouettes and his strokes), painted like
# the 3D monsters: three soft tones (from the drawing's own light, smoothed and simplified), a thick dark outline, the warm rim on the
# lit side, clean ink lines inside, violet smoke, clean eyes. python3 style.py view [out]
import sys,numpy as np
from PIL import Image
from scipy import ndimage as nd
n=sys.argv[1];out=sys.argv[2] if len(sys.argv)>2 else n+'_sty.png'
a=np.asarray(Image.open(n+'.png').convert('RGB')).astype(np.float32)/255
m0=np.asarray(Image.open(n+'_mask.png'))>127
H,W=m0.shape
lum=a[...,0]*.3+a[...,1]*.59+a[...,2]*.11;ch=a.max(-1)-a.min(-1)
# a clean silhouette: the mask smoothed (no pencil fuzz), small holes closed
import os
m0=nd.binary_opening(m0,structure=np.ones((7,7)))
mf=nd.gaussian_filter(m0.astype(np.float32),2.4);m=mf>.5
E=(np.asarray(Image.open(n+'_eyes.png'))>127) if os.path.exists(n+'_eyes.png') else np.zeros_like(m)
# what is smoke: violet, smoothed into a soft 0..1 field
vt=np.clip((nd.gaussian_filter(ch*m,5)/np.maximum(nd.gaussian_filter(m.astype(np.float32),5),1e-3)-.07)/.11,0,1)
# the light: the drawing's own (without the pencil grain) and the roundness of the shape (lit from the upper left), mixed
def mblur(x,sg):return nd.gaussian_filter(x*m,sg)/np.maximum(nd.gaussian_filter(m.astype(np.float32),sg),1e-3)
from skimage.restoration import denoise_tv_chambolle
L=mblur(denoise_tv_chambolle(np.where(m,lum,np.median(lum[m])),weight=.45),3)
lo,hi=np.percentile(L[m],[4,97]);sd=np.clip((L-lo)/(hi-lo),0,1)
dt=nd.distance_transform_edt(m);hgt=np.sqrt(np.minimum(dt,90)/90)
gy,gx=np.gradient(nd.gaussian_filter(hgt,4));nz=np.full_like(gx,.03);nn=np.sqrt(gx*gx+gy*gy+nz*nz);
li=np.array([-.55,-.62,.56]);li/=np.linalg.norm(li);si=np.clip((-gx*li[0]-gy*li[1]+nz*li[2])/nn,0,1)
s=np.clip(.6*sd+.4*si,0,1)
# three tones with soft steps (the 3D monsters' painting): dark, base, light, and a small highlight
def ramp(s,cols,stops,w):
  c=np.zeros(s.shape+(3,),np.float32)+np.array(cols[0])
  for k,t in enumerate(stops):
    k2=np.clip((s-t)/w+.5,0,1);k2=k2*k2*(3-2*k2);c=c*(1-k2[...,None])+np.array(cols[k+1])*k2[...,None]
  return c
hx=lambda h:[int(h[i:i+2],16)/255 for i in (1,3,5)]
FUR=[hx('#4b4652'),hx('#8b8690'),hx('#bfbac0'),hx('#efebe8')]
SMK=[hx('#4a3388'),hx('#7a57c6'),hx('#a888e8'),hx('#dccdfb')]
cf=ramp(s,FUR,[.22,.52,.86],.22);cs=ramp(s,SMK,[.22,.5,.84],.2)
col=cf*(1-vt[...,None])+cs*vt[...,None]
# ink lines inside: the drawing's own lines found as dark ridges (the pencil grain left out), small bits dropped, redrawn clean and even
from skimage.morphology import skeletonize
from skimage.filters import sato,apply_hysteresis_threshold
rid=sato(lum,sigmas=[1.5,2.5,3.5],black_ridges=True)
lines=apply_hysteresis_threshold(rid*(nd.gaussian_filter(lum,1.5)<.3),.06,.14)&nd.binary_erosion(m,iterations=10)
lab,k=nd.label(lines,structure=np.ones((3,3)));sz=nd.sum(lines,lab,range(1,k+1));keep=np.zeros(k+1,bool);keep[1:]=sz>260;lines=keep[lab]
sk=skeletonize(lines);lab2,k2=nd.label(sk,structure=np.ones((3,3)));sz2=nd.sum(sk,lab2,range(1,k2+1));kp=np.zeros(k2+1,bool);kp[1:]=sz2>45;sk=kp[lab2]
sk=nd.gaussian_filter(sk.astype(np.float32),1.4)>.12
lw=np.clip(2.4-nd.distance_transform_edt(~sk),0,1)
# the eyes: the drawing's own, cleaned (a median against the pencil grain, a little more contrast), with a clean dark rim round them
eo=np.stack([nd.median_filter(a[...,c],size=5) for c in range(3)],-1);eo=np.clip((eo-.5)*1.18+.5+.02,0,1)
INK=np.array(hx('#1b1612'))
# the eyes keep the drawing's colours (they are already clean): where the drawing is violet-dark and saturated inside the head
lw=lw*(~nd.binary_dilation(E,iterations=3))
col=col*(1-lw[...,None]*.92)+INK*lw[...,None]*.92
Es=nd.gaussian_filter(E.astype(np.float32),1.2)
col=col*(1-Es[...,None])+eo*Es[...,None]
er=np.clip(1-np.abs(nd.distance_transform_edt(~E)-1.6)/1.8,0,1)*(~E)
col=col*(1-er[...,None]*.9)+INK*er[...,None]*.9
# the warm rim on the lit side: inside the silhouette, near the edge, where the edge faces up-left
dt=nd.distance_transform_edt(m);gy,gx=np.gradient(nd.gaussian_filter(dt,3));gl=np.hypot(gx,gy)+1e-6
face=np.clip(((gx/gl)*.6+(gy/gl)*.8),0,1)  # inward normal points down-right where the edge is up-left
rim=np.clip(1-np.abs(dt-3)/3,0,1)*face*m
col=col+(np.array(hx('#fff1d8'))-col)*rim[...,None]*.22
# the thick outline round the silhouette
d_out=nd.distance_transform_edt(~m)
OWp=9.0
ink_al=np.clip(OWp+.5-d_out,0,1)*(~m)
img=np.ones((H,W,4),np.float32);img[...,:3]=1;img[...,3]=0
# the soft violet shadow on the floor under the paws (as in the drawings)
rows=np.where(m.any(1))[0];yb_=rows.max();band=m[yb_-60:yb_+1];cols=np.where(band.any(0))[0];cx=(cols.min()+cols.max())/2;rx=(cols.max()-cols.min())/2*1.08+30;ry=max(26,rx*.09)
yy,xx=np.mgrid[0:H,0:W];e=((xx-cx)/rx)**2+((yy-(yb_-6))/ry)**2;sh=np.clip(1-e,0,1)**1.4*.42
img[...,:3]=np.array(hx('#5b4a8a'));img[...,3]=sh
img[...,:3]=np.where(m[...,None],col,img[...,:3]);img[...,3]=np.where(m,1,img[...,3])
img[...,:3]=img[...,:3]*(1-ink_al[...,None])+INK*ink_al[...,None];img[...,3]=np.maximum(img[...,3],ink_al)
Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8),'RGBA').save(out);print('saved',out)
