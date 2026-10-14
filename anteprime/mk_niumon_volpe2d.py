# Costruisce anteprime/niumon_volpe2d.html: il Niumon di fuoco tutto in 2D. Lotta (fermo e fiammata) fatta dal disegno di Denis
# (sprite/niumon/volpe_fuoco/disegno2d/: anima2d.py e anima_lotta.py), mappa in 8 direzioni (corsa e fermo) fatta col burattino 2D
# (sprite/niumon/volpe_fuoco/burattino2d/produci2d.py). Fogli in sprite/niumon/volpe_fuoco/solo2d/.
# Uso: python3 anteprime/mk_niumon_volpe2d.py   (la pagina costruita non si salva su git)
import os, base64, json, io
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(here, '..', 'sprite', 'niumon', 'volpe_fuoco', 'solo2d')
def b64(p, mime='image/png'): return 'data:%s;base64,' % mime + base64.b64encode(open(p, 'rb').read()).decode()
def sheet(path):
    m = json.load(open(path + '.json')); m['src'] = b64(path + '.png'); return m
S = {'lotta': sheet(os.path.join(P, 'lotta_fermo')), 'mappa': sheet(os.path.join(P, 'mappa_fermo')), 'mossa': sheet(os.path.join(P, 'lotta_fiammata'))}
for a in ('corsa', 'fermo'):
    for k in ('giu', 'giu_sinistra', 'sinistra', 'su_sinistra', 'su', 'su_destra', 'destra', 'giu_destra'):
        S['%s_%s' % (a, k)] = sheet(os.path.join(P, 'mappa', '%s_%s' % (a, k)))
IM = {}
dis = os.path.join(P, '..', 'fai', 'disegno.png')
if os.path.exists(dis):
    im = Image.open(dis).convert('RGB'); im.thumbnail((640, 640), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=86); IM['disegno'] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
tpl = open(os.path.join(here, 'niumon_volpe2d.tpl.html'), encoding='utf-8').read()
page = tpl.replace('__SHEETS__', json.dumps(S, separators=(',', ':'))).replace('__IMAGES__', json.dumps(IM, separators=(',', ':')))
open(os.path.join(here, 'niumon_volpe2d.html'), 'w', encoding='utf-8').write(page); print('anteprime/niumon_volpe2d.html pronto (%d KB)' % (len(page) // 1024))
