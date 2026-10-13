# Idle frames of a pixel sprite, moved by whole pixels like a hand-made sprite: the smoke waves (more toward its tip), its outline is
# redrawn, the body breathes by one pixel, the eyes blink, the little puffs bob. python3 anim2.py name N '{opts}' -> name_idle.png/.json
import sys,json,numpy as np, pix3
from scipy import ndimage as nd
from PIL import Image
from collections import deque
n=sys.argv[1];N=int(sys.argv[2]);o=json.loads(sys.argv[3]) if len(sys.argv)>3 else {}
lab0=np.load(n+'_lab.npy',allow_pickle=True).astype(object);op0=np.load(n+'_op.npy')
H,W=lab0.shape
# tiny specks (a puff that became 1-4 dark pixels) go away
L,k=nd.label(op0,structure=np.ones((3,3)));sz=nd.sum(op0,L,range(1,k+1))
for i in range(1,k+1):
  c=L==i;dark=np.isin(lab0[c],['ol','olv','il','ilv']).mean()
  if sz[i-1]<=4 or (sz[i-1]<=14 and dark>.6):op0[c]=False
for (x0,y0,x1,y1) in o.get('erase',[]):op0[y0:y1,x0:x1]=False
SM=lambda q:q[0]=='v' or q in('ilv','olv')
smk=np.vectorize(SM)(lab0)&op0;fur=op0&~smk
# how far along the smoke from where it leaves the body (0) to its tip (1), per piece
dist=np.full((H,W),-1.0);q=deque()
for y,x in zip(*np.where(smk&nd.binary_dilation(fur,structure=np.ones((3,3))))):dist[y,x]=0;q.append((y,x))
while q:
  y,x=q.popleft()
  for dy,dx in((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
    yy,xx=y+dy,x+dx
    if 0<=yy<H and 0<=xx<W and smk[yy,xx] and dist[yy,xx]<0:dist[yy,xx]=dist[y,x]+(1.41 if dx and dy else 1);q.append((yy,xx))
Ls,ks=nd.label(smk,structure=np.ones((3,3)));S=np.zeros((H,W))
for i in range(1,ks+1):
  c=Ls==i;d=dist[c]
  if (d>=0).any():mx=d.max();S[c]=np.clip(np.where(d>=0,d,mx)/max(mx,1),0,1)
  else:S[c]=1.0   # a free puff
A=o.get('amp',2.0);WV=o.get('waves',1.1);CY=o.get('cyc',1);CUT=o.get('cut',int(H*.72));BL=o.get('blink',[])
def frame(t):
  lab=lab0.copy();op=op0.copy()
  ph=2*np.pi*(CY*t-WV*S)+Ls*1.7;dx=np.rint(A*S**1.3*np.sin(ph)).astype(int);dy=np.rint(.5*A*S**1.3*np.cos(ph*1.0)).astype(int)
  mv=smk&(S>.12)
  L2=lab.copy();O2=op.copy()
  L2[mv]='';O2[mv]=False
  # moved smoke drawn over (smoke in front of the body where the drawing has it in front: keep the body where it was)
  for y,x in zip(*np.where(mv)):
    yy,xx=y+dy[y,x],x+dx[y,x]
    if 0<=yy<H and 0<=xx<W and (not O2[yy,xx] or SM(L2[yy,xx]) or L2[yy,xx] in('ol',) and o.get('front',0)):L2[yy,xx]=lab[y,x];O2[yy,xx]=True
  # holes left inside the smoke take a neighbour's colour; then the outline round the smoke is redrawn
  zone=nd.binary_dilation(mv,iterations=3)
  holes=zone&~O2&nd.binary_fill_holes(O2)
  for y,x in zip(*np.where(holes)):
    nb=[L2[y+u,x+v] for u in(-1,0,1) for v in(-1,0,1) if 0<=y+u<H and 0<=x+v<W and O2[y+u,x+v] and L2[y+u,x+v] not in('ol','olv','')]
    if nb:L2[y,x]=max(set(nb),key=nb.count);O2[y,x]=True
  edge=O2&nd.binary_dilation(~O2,structure=[[0,1,0],[1,1,1],[0,1,0]])
  for y,x in zip(*np.where(zone&O2)):
    c=L2[y,x]
    if edge[y,x]:
      if SM(c):L2[y,x]='olv'
    elif c=='olv':
      nb=[L2[y+u,x+v] for u in(-1,0,1) for v in(-1,0,1) if 0<=y+u<H and 0<=x+v<W and O2[y+u,x+v] and L2[y+u,x+v][0]=='v']
      L2[y,x]=max(set(nb),key=nb.count) if nb else 'v3'
  lab,op=L2,O2
  # breath: everything above the cut goes up one pixel for half the cycle
  if np.sin(2*np.pi*t-.5)>0:
    lab[:CUT-1]=lab[1:CUT].copy();op[:CUT-1]=op[1:CUT].copy()
  return lab,op
frames=[]
for f in range(N):
  t=f/N;lab,op=frame(t)
  if f in BL and o.get('eyes'):
    from eyesr import eye
    for e in o['eyes']:lab,op=eye(lab,op,e[0],e[1],e[2],shut=True)
  frames.append(pix3.render(lab,op))
sheet=Image.new('RGBA',(W*N,H),(0,0,0,0))
for i,fr in enumerate(frames):sheet.paste(fr,(i*W,0))
sheet.save(n+'_idle.png')
a0=np.array(frames[0])[...,3]>0;rows=np.where(a0.any(1))[0];bot=rows.max();cols=np.where(a0[max(0,bot-4):bot+1].any(0))[0]
json.dump({'w':W,'h':H,'n':N,'fps':o.get('fps',8),'foot':[int(round(cols.mean())),int(bot)]},open(n+'_idle.json','w'))
big=[Image.alpha_composite(Image.new('RGBA',(W*4,H*4),(58,66,84,255)),fr.resize((W*4,H*4),Image.NEAREST)) for fr in frames]
big[0].save(n+'_idle_x4.gif',save_all=True,append_images=big[1:],duration=int(1000/o.get('fps',8)),loop=0,disposal=2)
print(n,'frames',N,W,H)
