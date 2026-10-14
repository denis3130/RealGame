# Costruisce anteprime/niumon_bosco360.html: la radura della lotta nel bosco di notte in 3D (WebGL2, nessuna libreria), fatta solo
# di sprite in pixel art messi nel mondo; la telecamera gira a 360 gradi col dito. Le due volpi di fuoco prendono la vista giusta
# (davanti o di spalle, girate a destra o a sinistra) da dove guarda la telecamera; la lotta si gioca. Seconda scheda: tutti gli
# sprite da vicino.
# Sprite: sprite/niumon/volpe_fuoco/solo2d/ (le volpi), sprite/niumon/ambiente/bosco_notte/ (il bosco: python3 fai.py),
# sprite/niumon/effetti/fuoco/ (gli effetti delle mosse: python3 effetti.py fai).
# Uso: python3 anteprime/mk_niumon_bosco360.py   (la pagina costruita non si salva su git)
import os, base64, json
here = os.path.dirname(os.path.abspath(__file__)); N = os.path.join(here, '..', 'sprite', 'niumon')

def b64(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def volpe(nome):
    p = os.path.join(N, 'volpe_fuoco', 'solo2d', nome)
    m = json.load(open(p + '.json')); m['src'] = b64(p + '.png'); return m

B = os.path.join(N, 'ambiente', 'bosco_notte')
idx = json.load(open(os.path.join(B, 'bosco_notte.json')))
atl = json.load(open(os.path.join(B, 'atlante.json')))
from PIL import Image
env = dict(atlas=dict(src=b64(os.path.join(B, 'atlante.png')), w=atl['w'], h=atl['h'], rect=atl['rect']), sprite=[], tiles={}, soft={})
for m in idx['sprite']:
    q = {k: m[k] for k in ('nome', 'cartella', 'category', 'frame_width', 'frame_height', 'frames', 'fps', 'pivot', 'unita_per_pixel') if k in m}
    for k in ('morbido', 'brilla', 'billboard'):
        if k in m: q[k] = m[k]
    env['sprite'].append(q)
    if m['category'] == 'tileset': env['tiles'][m['nome']] = b64(os.path.join(B, m['file']))
    elif m.get('morbido'):
        im = Image.open(os.path.join(B, m['file'])); env['soft'][m['nome']] = dict(src=b64(os.path.join(B, m['file'])), w=im.size[0], h=im.size[1])
F = os.path.join(N, 'effetti', 'fuoco')
fx = {}
for m in json.load(open(os.path.join(F, 'effetti_fuoco.json')))['sprite']:
    q = dict(m); q['src'] = b64(os.path.join(F, m['file'])); fx[m['nome']] = q
D = dict(volpe=dict(davanti=volpe('lotta_davanti'), spalle=volpe('lotta_spalle')), env=env, fx=fx)
tpl = open(os.path.join(here, 'niumon_bosco360.tpl.html'), encoding='utf-8').read()
page = tpl.replace('__DATA__', json.dumps(D, separators=(',', ':')))
open(os.path.join(here, 'niumon_bosco360.html'), 'w', encoding='utf-8').write(page)
print('anteprime/niumon_bosco360.html pronto (%d KB)' % (len(page) // 1024))
