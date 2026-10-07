# Builds tests/test.html from ../index.html, exposing window.__E (eval inside the game) for the test scripts.
import os
here=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(here,'..','index.html'),encoding='utf-8').read()
i=s.rfind('})();')
open(os.path.join(here,'test.html'),'w',encoding='utf-8').write(s[:i]+'window.__E=s=>eval(s);'+s[i:])
print('tests/test.html pronto')
