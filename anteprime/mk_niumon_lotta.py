# Costruisce anteprime/niumon_lotta.html: la volpe di fuoco in pixel art pulita (80x80, come lo screenshot di riferimento di Denis)
# dentro una scena di lotta nel bosco di notte: la tua di spalle in primo piano (3x), quella selvatica davanti più lontana (1x),
# quattro mosse con gli effetti, nebbia, luce del fuoco, braci. Sotto: i due sprite da vicino e com'era prima.
# Fogli in sprite/niumon/volpe_fuoco/solo2d/ (lotta_davanti, lotta_spalle: disegno2d/lotta80.py).
# Uso: python3 anteprime/mk_niumon_lotta.py   (la pagina costruita non si salva su git)
import os, base64, json
here = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(here, '..', 'sprite', 'niumon', 'volpe_fuoco', 'solo2d')
def sheet(name):
    m = json.load(open(os.path.join(P, name + '.json')))
    m['src'] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(P, name + '.png'), 'rb').read()).decode()
    return m
S = {'davanti': sheet('lotta_davanti'), 'spalle': sheet('lotta_spalle'), 'prima': sheet('lotta_fermo')}
tpl = open(os.path.join(here, 'niumon_lotta.tpl.html'), encoding='utf-8').read()
page = tpl.replace('__SPRITES__', json.dumps(S, separators=(',', ':')))
open(os.path.join(here, 'niumon_lotta.html'), 'w', encoding='utf-8').write(page)
print('anteprime/niumon_lotta.html pronto (%d KB)' % (len(page) // 1024))
