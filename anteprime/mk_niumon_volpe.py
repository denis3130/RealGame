# Costruisce anteprime/niumon_volpe.html: il Niumon di fuoco (disegno di Denis del 13 ottobre, sera) in pixel art nelle 8 direzioni,
# da controllare prima di metterlo nel gioco: confronto col disegno, piattaforma che gira, 8 direzioni a 192 e a 64 px, giro a 16 viste,
# lotta, metodo e domande. Sprite in sprite/niumon/volpe_fuoco/ (si rifanno con sprite/niumon/volpe_fuoco/fai/produci.py);
# la prova di prima (toni dalla luce della base) sta in sprite/niumon/volpe_fuoco/prima/.
# Uso: python3 anteprime/mk_niumon_volpe.py   (la pagina costruita non si salva su git)
import os, base64, json, io
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(here, '..', 'sprite', 'niumon', 'volpe_fuoco')
def b64(path, mime='image/png'): return 'data:%s;base64,' % mime + base64.b64encode(open(path, 'rb').read()).decode()
def sheet(path):
    m = json.load(open(path + '.json')); m['src'] = b64(path + '.png'); return m
S = {}
for size in ('grande', 'mappa'):
    for k in ('giu', 'giu_sinistra', 'sinistra', 'su_sinistra', 'su', 'su_destra', 'destra', 'giu_destra'):
        S[size + '_' + k] = sheet(os.path.join(P, 'direzioni', '%s_%s' % (size, k)))
    S['giro_' + size] = sheet(os.path.join(P, 'giro_' + size))
IM = {'prima': b64(os.path.join(P, 'prima', 'come_il_disegno.png')), 'pixel': b64(os.path.join(P, 'come_il_disegno.png'))}
dis = os.path.join(P, 'fai', 'disegno.png')          # il disegno di Denis: non sta su git, se manca la pagina lo salta
if os.path.exists(dis):
    im = Image.open(dis).convert('RGB'); im.thumbnail((640, 640), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=86); IM['disegno'] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
tpl = open(os.path.join(here, 'niumon_volpe.tpl.html'), encoding='utf-8').read()
page = tpl.replace('__SHEETS__', json.dumps(S, separators=(',', ':'))).replace('__IMAGES__', json.dumps(IM, separators=(',', ':')))
open(os.path.join(here, 'niumon_volpe.html'), 'w', encoding='utf-8').write(page); print('anteprime/niumon_volpe.html pronto (%d KB)' % (len(page) // 1024))
