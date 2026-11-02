# Builds tests/t3/test_t3.html: the tripla A preview (anteprime/mk_tripla.py --prova: no ready save) with window.__E, for node tests/t3/*.js
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(os.path.dirname(here))
subprocess.run([sys.executable,os.path.join(root,'anteprime','mk_tripla.py'),'--prova'],check=True)
s=open(os.path.join(root,'anteprime','tripla_prova.html'),encoding='utf-8').read();i=s.rfind('})();')
open(os.path.join(here,'test_t3.html'),'w',encoding='utf-8').write(s[:i]+'window.__E=s=>eval(s);'+s[i:])
print('tests/t3/test_t3.html pronto')
