# python3 grid.py pose x0 y0 x1 y1 scale -> pose_grid.png : crop with a labelled 10 px grid
import sys
from PIL import Image, ImageDraw
n=sys.argv[1];x0,y0,x1,y1,sc=map(int,sys.argv[2:7])
im=Image.open(n+'.png').convert('RGB').crop((x0,y0,x1,y1));im=im.resize(((x1-x0)*sc,(y1-y0)*sc),Image.NEAREST)
d=ImageDraw.Draw(im)
for x in range((x0//10+1)*10,x1,10):
  X=(x-x0)*sc;d.line([(X,0),(X,im.size[1])],fill=(255,0,0) if x%50==0 else (255,170,170),width=1)
  if x%50==0:d.text((X+2,2),str(x),fill=(200,0,0))
for y in range((y0//10+1)*10,y1,10):
  Y=(y-y0)*sc;d.line([(0,Y),(im.size[0],Y)],fill=(0,0,255) if y%50==0 else (170,170,255),width=1)
  if y%50==0:d.text((2,Y+2),str(y),fill=(0,0,200))
im.save(n+'_grid.png');print(im.size)
