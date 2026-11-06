# Builds tests/a50/test_a50.html: the game with the new pieces of the Anteprima 50 (anteprime/mk_anteprima50.py --prova: no ready save, no
# shortcuts) and window.__E, for the tests in this folder: node tests/a50/speciali.js, menu.js, zbox.js
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(os.path.dirname(here))
subprocess.run([sys.executable,os.path.join(root,'anteprime','mk_anteprima50.py'),'--prova'],check=True)
s=open(os.path.join(root,'anteprime','anteprima50_prova.html'),encoding='utf-8').read();i=s.rfind('})();')
open(os.path.join(here,'test_a50.html'),'w',encoding='utf-8').write(s[:i]+'window.__E=s=>eval(s);'+s[i:])
print('tests/a50/test_a50.html pronto')
