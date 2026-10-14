# Costruisce anteprime/niumon_volpe2d.html: il Niumon di fuoco tutto in 2D. Lotta (fermo e fiammata) fatta dal disegno di Denis
# (sprite/niumon/volpe_fuoco/disegno2d/: anima2d.py e anima_lotta.py), mappa in 8 direzioni (corsa e fermo) fatta col burattino 2D
# (sprite/niumon/volpe_fuoco/burattino2d/produci2d.py, volpe_hd.py). Fogli in sprite/niumon/volpe_fuoco/solo2d/.
# «Prima»: gli stessi fogli com'erano nel commit 3facba8 (meno pixel), presi da git per il confronto.
# Uso: python3 anteprime/mk_niumon_volpe2d.py   (la pagina costruita non si salva su git)
import os, base64, json, io, subprocess
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(here, '..', 'sprite', 'niumon', 'volpe_fuoco', 'solo2d')
REL = 'sprite/niumon/volpe_fuoco/solo2d/'; PRIMA = '3facba8'
def b64(data, mime='image/png'): return 'data:%s;base64,' % mime + base64.b64encode(data).decode()
def sheet(name):
    m = json.load(open(os.path.join(P, name + '.json'))); m['src'] = b64(open(os.path.join(P, name + '.png'), 'rb').read()); return m
def old(name):
    try:
        js = subprocess.run(['git', 'show', '%s:%s%s.json' % (PRIMA, REL, name)], cwd=here, capture_output=True, check=True).stdout
        png = subprocess.run(['git', 'show', '%s:%s%s.png' % (PRIMA, REL, name)], cwd=here, capture_output=True, check=True).stdout
    except Exception:
        return None
    m = json.loads(js); m['src'] = b64(png); return m
NAMES = {'lotta': 'lotta_fermo', 'mappa': 'mappa_fermo', 'mossa': 'lotta_fiammata'}
for a in ('corsa', 'fermo'):
    for k in ('giu', 'giu_sinistra', 'sinistra', 'su_sinistra', 'su', 'su_destra', 'destra', 'giu_destra'):
        NAMES['%s_%s' % (a, k)] = 'mappa/%s_%s' % (a, k)
S = {k: sheet(n) for k, n in NAMES.items()}
OLD = {}
for k, n in NAMES.items():
    o = old(n)
    if o is not None: OLD[k] = o
# il foglio della lotta di prima non aveva le misure nel .json: 96x96, 8 fotogrammi
for k in ('lotta', 'mappa'):
    if k in OLD and 'w' not in OLD[k]:
        im = Image.open(io.BytesIO(base64.b64decode(OLD[k]['src'].split(',')[1]))); h = im.height
        OLD[k].update(w=h, h=h, n=im.width // h)
IM = {}
dis = os.path.join(P, '..', 'fai', 'disegno.png')
if os.path.exists(dis):
    im = Image.open(dis).convert('RGB'); im.thumbnail((640, 640), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=86); IM['disegno'] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
tpl = open(os.path.join(here, 'niumon_volpe2d.tpl.html'), encoding='utf-8').read()
page = (tpl.replace('__SHEETS__', json.dumps(S, separators=(',', ':'))).replace('__OLD__', json.dumps(OLD, separators=(',', ':')))
        .replace('__IMAGES__', json.dumps(IM, separators=(',', ':'))))
open(os.path.join(here, 'niumon_volpe2d.html'), 'w', encoding='utf-8').write(page)
print('anteprime/niumon_volpe2d.html pronto (%d KB, %d fogli di prima)' % (len(page) // 1024, len(OLD)))
