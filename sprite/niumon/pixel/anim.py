# Idle animation frames of a view, moved in pixels like a hand-made sprite: the smoke waves by whole pixels (the displacement of the
# drawing's smoke, sampled at the sprite's pixels and rounded), the outline is redrawn round the moved smoke, a one-pixel breath,
# a blink, the puffs bobbing. python3 anim.py view N [cfg] -> view_idle.png (sheet), view_idle.json, view_idle_x4.gif
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage as nd
import pix3,eyes as EY
from pix import load
n=sys.argv[1];N=int(sys.argv[2]);CFG=json.loads(sys.argv[3]) if len(sys.argv)>3 else {}
k=pix3.VIEWS[n]['k'];a,m=load(n);Z=np.load(n+'_smoke.npz')
lab0,op0,(ox,oy,W,H)=pix3.run(n,k)
# the smoke fields at the centre of each sprite pixel
cy=(oy+k*np.arange(H)+k//2).clip(0,m.shape[0]-1);cx=(ox+k*np.arange(W)+k//2).clip(0,m.shape[1]-1)
F={q:Z[q][np.ix_(cy,cx)] for q in ('s','ux','uy','w','comp')}
A=CFG.get('amp',1.35);WAVES=CFG.get('waves',1.3);CYC=CFG.get('cyc',2);YCUT=CFG.get('ycut',int(H*.74));BLINK=CFG.get('blink',[N-5,N-4])
FILL=[q for q in pix3.PAL if q[0] in 'gv']
def warp(lab,op,t):
  ph=2*np.pi*(CYC*t-WAVES*F['s'])+F['comp']*1.9;amp=A*F['w']*np.sin(ph)
  dx=np.rint(amp*F['ux']).astype(int);dy=np.rint(amp*F['uy']).astype(int)
  moving=F['w']>.02;ii,jj=np.mgrid[0:H,0:W];si=(ii-dy).clip(0,H-1);sj=(jj-dx).clip(0,W-1)
  L2=np.where(moving,lab[si,sj],lab);O2=np.where(moving,op[si,sj],op)
  # the outline round the moved smoke: opaque pixels touching the outside are outline, old outline now inside takes a fill colour
  zone=nd.binary_dilation(moving,iterations=2)
  edge=O2&nd.binary_dilation(~O2,structure=[[0,1,0],[1,1,1],[0,1,0]])
  inner=zone&O2&~edge&(L2=='ol')
  for y,x in zip(*np.where(inner)):
    nb=[L2[y+u,x+v] for u in(-1,0,1) for v in(-1,0,1) if 0<=y+u<H and 0<=x+v<W and L2[y+u,x+v] in FILL]
    L2[y,x]=max(set(nb),key=nb.count) if nb else 'v3'
  L2=np.where(zone&edge,'ol',L2)
  return L2,O2
frames=[]
for f in range(N):
  t=f/N;lab,op=warp(lab0.copy(),op0.copy(),t)
  if f in BLINK:
    for e in getattr(EY,n.split('_')[1].upper()+'_SHUT',[]):EY.stamp(lab,op,e)
  # the puffs (pieces not joined to the body) bob by a pixel, each with its own phase
  L,nc=nd.label(op,structure=np.ones((3,3)));sz=nd.sum(op,L,range(1,nc+1));main=np.argmax(sz)+1
  for ci in range(1,nc+1):
    if ci==main or sz[ci-1]>60:continue
    msk=L==ci;yc,xc=nd.center_of_mass(msk);d=int(round(np.sin(2*np.pi*t*2+xc*.7+yc*.3)))
    if d:
      lab2=lab.copy();op2=op.copy();yy,xx=np.where(msk);op2[yy,xx]=False
      ok=(yy+d>=0)&(yy+d<H);op2[yy[ok]+d,xx[ok]]=True;lab2[yy[ok]+d,xx[ok]]=lab[yy[ok],xx[ok]];lab,op=lab2,op2
  # the breath: everything above the knees goes up a pixel for half the cycle (the row at the cut is stretched)
  if np.sin(2*np.pi*t-.6)>0:
    lab[:YCUT-1]=lab[1:YCUT].copy();op[:YCUT-1]=op[1:YCUT].copy()
  frames.append(pix3.render(lab,op))
sheet=Image.new('RGBA',(W*N,H),(0,0,0,0))
for i,fr in enumerate(frames):sheet.paste(fr,(i*W,0))
sheet.save(n+'_idle.png')
# the ground point: the bottom of the paws, the middle of the columns the paws stand on
op0=np.array(frames[0])[...,3]>0;rows=np.where(op0.any(1))[0];bot=rows.max();cols=np.where(op0[bot-5:bot+1].any(0))[0]
json.dump({'w':W,'h':H,'n':N,'fps':CFG.get('fps',10),'foot':[int(round(cols.mean())),int(bot)]},open(n+'_idle.json','w'))
big=[Image.alpha_composite(Image.new('RGBA',(W*4,H*4),(60,70,90,255)),fr.resize((W*4,H*4),Image.NEAREST)) for fr in frames]
big[0].save(n+'_idle_x4.gif',save_all=True,append_images=big[1:],duration=100,loop=0,disposal=2)
print('done',W,H,N)
