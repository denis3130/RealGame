# Ritaglia le 8 pose dal foglio di Denis (1536×1024, il «primo Niumon»): python3 ritaglia.py foglio.png -> front.png, left.png, ...
import sys,json
from PIL import Image
B={'front':(10,0,345,582),'left':(345,0,815,582),'back':(815,0,1105,582),'right':(1105,0,1536,582),
   'idle':(0,612,385,962),'walk':(385,612,770,962),'attack':(770,612,1200,962),'hit':(1200,612,1536,962)}
im=Image.open(sys.argv[1]).convert('RGB')
for k,b in B.items():im.crop(b).save(k+'.png')
print('fatto:',', '.join(B))
