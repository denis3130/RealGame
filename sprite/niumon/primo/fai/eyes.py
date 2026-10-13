# hand-made pixel eyes (and face details), stamped on the sprites. A map: (first column, first row, rows of characters); '.' keeps
EYEC={'O':'ol','k':'ek','d':'ed','m':'em','l':'el','w':'ew','h':'h','p':'pp','i':'il','2':'g2','3':'g3','4':'g4','1':'g1','0':'g0'}
FRONT_L=(11,38,[
 ".O........",
 ".OO.......",
 ".OkO......",
 "OkddO.....",
 "OkdmmO....",
 "OdmmmhO...",
 ".OmmmppO..",
 ".OmlmppO..",
 "..OllmpmO.",
 "..OwllmmmO",
 "...OwlllmO",
 "....OOOOO.",
])
def mirror(e,axis):
  c0,r0,rows=e;w=max(len(r) for r in rows)
  return (axis-(c0+w-1),r0,[r.ljust(w,'.')[::-1] for r in rows])
def stamp(lab,op,e,dx=0,dy=0):
  c0,r0,rows=e
  for i,r in enumerate(rows):
    for j,ch in enumerate(r):
      if ch=='.':continue
      y,x=r0+i+dy,c0+j+dx
      if 0<=y<lab.shape[0] and 0<=x<lab.shape[1]:lab[y,x]=EYEC[ch];op[y,x]=True
# the snout: two little nostrils, the cheeky "w" mouth, the line of the jaw over the chest (cols 19..33, rows 50..54)
FRONT_M=(19,49,[
 "....111....",
 "..1400041..",
 ".i111i111i.",
 "..iii2iii..",
])
FRONT=[FRONT_L,mirror(FRONT_L,48),FRONT_M]
# shut eyes for the blink: the eye becomes fur, with the shut lid as a dark line from the outer corner down to the inner corner
LID_L=[(12,38),(12,39),(13,40),(13,41),(14,42),(15,43),(15,44),(16,45),(17,46),(18,47),(19,47),(20,48)]
def shut(e,lid,skin='2'):
  c0,r0,rows=e;S=set(lid);out=[]
  for i,r in enumerate(rows):
    s=''
    for j,ch in enumerate(r):
      if ch=='.':s+='.';continue
      s+='O' if (c0+j,r0+i) in S else skin
    out.append(s)
  for (c,r) in lid:
    i,j=r-r0,c-c0
    if 0<=i<len(out) and 0<=j<len(out[i]) and out[i][j]=='.':out[i]=out[i][:j]+'O'+out[i][j+1:]
  return (c0,r0,out)
FRONT_SHUT=[shut(FRONT_L,LID_L),shut(mirror(FRONT_L,48),[(48-c,r) for c,r in LID_L])]
