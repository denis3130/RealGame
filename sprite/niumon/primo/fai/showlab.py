# python3 showlab.py sprite x0 x1 y0 y1 : print the palette keys of a region (eye colours in capitals)
import sys,numpy as np
n=sys.argv[1];x0,x1,y0,y1=map(int,sys.argv[2:6])
lab=np.load(n+'_lab.npy',allow_pickle=True);op=np.load(n+'_op.npy')
SH={'ol':'#','olv':'%','il':'+','ilv':'=','ek':'K','ei':'D','em':'M','el':'L','ew':'W','h':'H','pp':'P','ed':'E'}
print('    '+''.join(str(x%10) for x in range(x0,x1)))
for y in range(y0,y1):
  print('%3d '%y+''.join((SH.get(lab[y,x], lab[y,x][1] if lab[y,x][0] in 'gv' else '?') if lab[y,x][0]!='v' else 'abcdef'[int(lab[y,x][1])]) if op[y,x] else '.' for x in range(x0,x1)))
