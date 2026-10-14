# Costruisce anteprime/niumon_volpe2d.html: il Niumon di fuoco solo in 2D (il disegno di Denis ridotto a pixel, senza base 3D),
# sprite della lotta (96x96) e della mappa (64x64), animati. Sprite in sprite/niumon/volpe_fuoco/solo2d/
# (si rifanno con: cd sprite/niumon/volpe_fuoco/disegno2d && python3 anima2d.py ../solo2d).
# Uso: python3 anteprime/mk_niumon_volpe2d.py   (la pagina costruita non si salva su git)
import os, base64, json, io
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(here, '..', 'sprite', 'niumon', 'volpe_fuoco')
def b64(p, mime='image/png'): return 'data:%s;base64,' % mime + base64.b64encode(open(p, 'rb').read()).decode()
S = {}
for k, n in (('lotta', 'lotta_fermo'), ('mappa', 'mappa_fermo')):
    m = json.load(open(os.path.join(P, 'solo2d', n + '.json'))); m['src'] = b64(os.path.join(P, 'solo2d', n + '.png')); S[k] = m
IM = {}
dis = os.path.join(P, 'fai', 'disegno.png')
if os.path.exists(dis):
    im = Image.open(dis).convert('RGB'); im.thumbnail((640, 640), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=86); IM['disegno'] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
tpl = open(os.path.join(here, 'niumon_volpe2d.tpl.html'), encoding='utf-8').read()
page = tpl.replace('__SHEETS__', json.dumps(S, separators=(',', ':'))).replace('__IMAGES__', json.dumps(IM, separators=(',', ':')))
open(os.path.join(here, 'niumon_volpe2d.html'), 'w', encoding='utf-8').write(page); print('anteprime/niumon_volpe2d.html pronto (%d KB)' % (len(page) // 1024))
