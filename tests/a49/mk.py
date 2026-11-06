# Builds tests/a49/test_a49.html: the game with the new pieces of the Anteprima 49 (anteprime/mk_anteprima49.py --prova: no ready save, no
# top-up) and window.__E, for the tests in this folder: node tests/a49/abilita.js, sfida.js, abisso.js, eventi.js, musica.js
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(os.path.dirname(here))
subprocess.run([sys.executable,os.path.join(root,'anteprime','mk_anteprima49.py'),'--prova'],check=True)
s=open(os.path.join(root,'anteprime','anteprima49_prova.html'),encoding='utf-8').read();i=s.rfind('})();')
open(os.path.join(here,'test_a49.html'),'w',encoding='utf-8').write(s[:i]+'window.__E=s=>eval(s);'+s[i:])
print('tests/a49/test_a49.html pronto')
