# Clean pixel eyes drawn from a few numbers: inner corner A (round, toward the nose), outer corner B (pointed, toward the temple),
# half-width w. Rasterised 8× finer and brought back to pixels with priorities (outline, highlight, pupil first).
import numpy as np
EYEK=('ek','ei','em','el','ew','h')
def eye(lab,op,A,B,w,iris=1.12,look=(0,0),lid=1.5,shut=False):
  A=np.array(A,float);B=np.array(B,float);s=8;ab=B-A;L=np.linalg.norm(ab);u=ab/L;n=np.array([-u[1],u[0]])
  if n[1]>0:n=-n
  x0,x1=int(min(A[0],B[0])-w-3),int(max(A[0],B[0])+w+3);y0,y1=int(min(A[1],B[1])-w-3),int(max(A[1],B[1])+w+3)
  H,W=lab.shape;C=A+ab*.42-n*(.1*w)+np.array(look,float)*w*.35;r=iris*w
  # the old eye goes back to fur first
  for y in range(max(y0,0),min(y1,H)):
    for x in range(max(x0,0),min(x1,W)):
      if lab[y,x] in EYEK:lab[y,x]='g3'
  for y in range(max(y0,0),min(y1,H)):
    for x in range(max(x0,0),min(x1,W)):
      cnt={}
      for i in range(s):
        for j in range(s):
          P=np.array([x+(j+.5)/s,y+(i+.5)/s]);d=P-A;t=d@ab/(L*L);e=d@n
          wr=w*(np.sqrt(max(0,1-((.3-t)/.32)**2)) if t<.3 else max(0,1-(t-.3)/.7)**1.1)
          wu,wd=wr*.95,wr*1.1
          if shut:
            # a closed eye: just the lid line, slightly curved
            mid=-(wd*.35);c='ol' if (abs(e-mid)<.55 and -.02<t<1.02) else None
          else:
            inside=(-wd<=e<=wu) and (-.03<=t<=1.0)
            outer=(-(wd+1.0)<=e<=wu+lid) and (-.03-1.0/L<=t<=1.0+.6/L)
            c=None
            if inside:
              q=P-C;dq=np.linalg.norm(q)
              if dq<r:
                g=(q[1]/r+1)/2   # 0 top .. 1 bottom
                c='ei' if (dq>.86*r or g<.3) else ('em' if g<.68 else 'el')
                if dq<.36*r:c='ek'
                if np.linalg.norm(q-np.array([-.38*r,-.42*r]))<.34*r:c='h'
              else:c='ek' if e>wu*.1 else 'el'
            elif outer:c='ol'
          if c:cnt[c]=cnt.get(c,0)+1
      tot=s*s;get=lambda k:cnt.get(k,0)/tot
      cov=sum(cnt.values())/tot
      if cov<.3:continue
      if get('ol')>=.34:lab[y,x]='ol'
      elif get('h')>=.18:lab[y,x]='h'
      elif get('ek')>=.28:lab[y,x]='ek'
      else:
        k=max((v,k) for k,v in cnt.items() if k!='ol')[1] if any(k!='ol' for k in cnt) else 'ol';lab[y,x]=k
      op[y,x]=True
  return lab,op
