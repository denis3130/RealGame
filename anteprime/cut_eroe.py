# Cuts the 8 poses of the hooded archer out of Denis's sheet (anteprime/riferimento_eroe.jpg)
# into transparent PNGs in anteprime/eroe_sprite/ (d0..d7), plus meta.json with the body centre of each pose.
from PIL import Image
from collections import deque
import json,pathlib
here=pathlib.Path(__file__).parent
im=Image.open(here/'riferimento_eroe.jpg').convert('RGB');W,H=im.size
def isbg(c):
    r,g,b=c
    return abs((r-g)-6)<=11 and abs((g-b)-11)<=11 and 26<=r<=104
def comps(w,h,ok):
    seen=bytearray(w*h);out=[]
    for sx in range(w):
        for sy in range(h):
            if seen[sy*w+sx] or not ok(sx,sy):continue
            q=deque([(sx,sy)]);seen[sy*w+sx]=1;pts=[]
            while q:
                x,y=q.popleft();pts.append((x,y))
                for nx,ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
                    if 0<=nx<w and 0<=ny<h and not seen[ny*w+nx] and ok(nx,ny):seen[ny*w+nx]=1;q.append((nx,ny))
            out.append(pts)
    return out
meta=[]
for i in range(8):
    x0=round(i*W/8);x1=round((i+1)*W/8)
    cell=im.crop((x0,58,x1,H));w,h=cell.size;p=cell.load()
    a=Image.new('L',(w,h),255);pa=a.load()
    # background: every background-coloured region touching the border, and enclosed ones that are not tiny
    for pts in comps(w,h,lambda x,y:isbg(p[x,y])):
        if any(x in (0,w-1) or y in (0,h-1) for x,y in pts):
            for x,y in pts:pa[x,y]=0
    # enclosed gaps (inside the bow): only the plain background colour itself
    near=lambda c:abs(c[0]-79)<=8 and abs(c[1]-73)<=8 and abs(c[2]-61)<=8
    for pts in comps(w,h,lambda x,y:pa[x,y]>0 and near(p[x,y])):
        if len(pts)>=20:
            for x,y in pts:pa[x,y]=0
    # keep the character, drop specks
    keep=comps(w,h,lambda x,y:pa[x,y]>0);keep.sort(key=len,reverse=True)
    for pts in keep[1:]:
        if len(pts)<60:
            for x,y in pts:pa[x,y]=0
    # soft one-pixel edge where the cut met background-ish colour
    a2=a.copy();pb=a2.load()
    for x in range(1,w-1):
        for y in range(1,h-1):
            if pa[x,y]==255 and min(pa[x+1,y],pa[x-1,y],pa[x,y+1],pa[x,y-1])==0 and isbg(p[x,y]):pb[x,y]=110
    rgba=cell.convert('RGBA');rgba.putalpha(a2);rgba=rgba.crop(rgba.getbbox())
    ww,hh=rgba.size;al=rgba.split()[3].load();sx=n=0
    for y in range(int(hh*.4)):
        for x in range(ww):
            if al[x,y]>200:sx+=x;n+=1
    rgba.save(here/'eroe_sprite'/f'd{i}.png');meta.append({'w':ww,'h':hh,'cx':round(sx/max(1,n),1)})
(here/'eroe_sprite'/'meta.json').write_text(json.dumps(meta))
print(meta)
