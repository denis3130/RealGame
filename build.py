# Riunisce i pezzi di src/ (nell'ordine di src/ordine.txt) in index.html, il file unico che si pubblica.
# Uso: python3 build.py   (tests/mk.py lo chiama da solo prima di costruire tests/test.html)
import os
here=os.path.dirname(os.path.abspath(__file__))
src=os.path.join(here,'src')
order=[l.strip() for l in open(os.path.join(src,'ordine.txt'),encoding='utf-8') if l.strip()]
out=''.join(open(os.path.join(src,f),encoding='utf-8',newline='').read() for f in order)
open(os.path.join(here,'index.html'),'w',encoding='utf-8',newline='').write(out)
print('index.html costruito da %d file (%d righe)'%(len(order),out.count('\n')))
