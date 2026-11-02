# Builds tests/v3/test_v3.html: the visuale preview (anteprime/mk_visuale.py --prova: no ready save) with window.__E, for node tests/v3/visuale.js
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(os.path.dirname(here))
subprocess.run([sys.executable,os.path.join(root,'anteprime','mk_visuale.py'),'--prova'],check=True)
s=open(os.path.join(root,'anteprime','visuale_prova.html'),encoding='utf-8').read();i=s.rfind('})();')
open(os.path.join(here,'test_v3.html'),'w',encoding='utf-8').write(s[:i]+'window.__E=s=>eval(s);'+s[i:])
print('tests/v3/test_v3.html pronto')
