# Costruisce anteprime/niumon_lotta.html: la volpe di fuoco in pixel art pulita (riquadro 96x96, come lo screenshot di riferimento
# di Denis) dentro una scena di lotta nel bosco di notte: la tua di spalle in primo piano (3x), quella selvatica davanti più
# lontana (1x), quattro mosse con gli effetti; chi attacca si carica e scatta, chi è colpito si piega. Sotto: i due sprite da vicino
# con i bottoni per vedere le animazioni, e com'era prima (occhi fatti a mano).
# Fogli in sprite/niumon/volpe_fuoco/solo2d/ (lotta_davanti, lotta_spalle: disegno2d/lotta80.py; prima80/: la versione di prima).
# Uso: python3 anteprime/mk_niumon_lotta.py   (la pagina costruita non si salva su git)
import os, base64, json
here = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(here, '..', 'sprite', 'niumon', 'volpe_fuoco', 'solo2d')

def sheet(name):
    m = json.load(open(os.path.join(P, name + '.json')))
    m['src'] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(P, name + '.png'), 'rb').read()).decode()
    if 'animazioni' not in m:
        # foglio di prima: una riga sola (giro del fermo, poi occhi chiusi e a metà)
        A = {'fermo': dict(riga=0, n=m.get('giro', m['n']), fps=m['fps'], loop=True)}
        if m.get('occhi_chiusi') is not None:
            A['fermo_occhi_chiusi'] = dict(riga=0, cols=[m['occhi_chiusi']], fps=m['fps'], loop=True)
            A['fermo_occhi_mezzi'] = dict(riga=0, cols=[m.get('occhi_mezzi', m['occhi_chiusi'])], fps=m['fps'], loop=True)
        m['animazioni'] = A
    return m

S = {'davanti': sheet('lotta_davanti'), 'spalle': sheet('lotta_spalle'), 'prima_davanti': sheet('prima80/lotta_davanti')}
tpl = open(os.path.join(here, 'niumon_lotta.tpl.html'), encoding='utf-8').read()
page = tpl.replace('__SPRITES__', json.dumps(S, separators=(',', ':')))
open(os.path.join(here, 'niumon_lotta.html'), 'w', encoding='utf-8').write(page)
print('anteprime/niumon_lotta.html pronto (%d KB)' % (len(page) // 1024))
