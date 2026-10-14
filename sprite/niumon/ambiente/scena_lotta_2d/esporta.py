"""Esporta come PNG i livelli del bosco della scena di lotta in 2D (anteprime/niumon_lotta.html): la pagina li disegna col codice a
1280x720 (cielo e bosco lontano, alberi di mezzo, terra, primo piano, nebbia che scorre); qui si aprono nel browser di prova e si
salvano accanto a questo file. Uso: python3 esporta.py  (prima: python3 anteprime/mk_niumon_lotta.py)"""
import os, base64, json, threading, http.server, functools, tempfile, shutil
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, '..', '..', '..', '..', 'anteprime', 'niumon_lotta.html')
NOMI = {'far': 'cielo_e_bosco_lontano', 'mid': 'alberi_di_mezzo', 'ground': 'terra', 'near': 'primo_piano', 'fog': 'nebbia_che_scorre'}
tmp = tempfile.mkdtemp()
src = open(PAGE, encoding='utf-8').read().replace('<link rel="stylesheet" href="https://fonts.googleapis.com', '<link rel="x" href="https://fonts.googleapis.com')
open(os.path.join(tmp, 'p.html'), 'w', encoding='utf-8').write('<meta charset="utf-8">' + src)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=tmp)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 800})
    pg.goto('http://127.0.0.1:%d/p.html' % port); pg.wait_for_function('window.__strati', timeout=60000)
    out = pg.evaluate("Object.fromEntries(Object.entries(window.__strati).map(([k,c])=>[k,[c.width,c.height,c.toDataURL('image/png')]]))")
    b.close()
srv.shutdown(); shutil.rmtree(tmp)
elenco = []
for k, (w, h, url) in out.items():
    nome = NOMI.get(k, k)
    open(os.path.join(HERE, nome + '.png'), 'wb').write(base64.b64decode(url.split(',', 1)[1]))
    elenco.append(dict(asset_id='bg_battle_bosconotte2d_' + nome, nome=nome, file=nome + '.png', category='background_battle', frame_width=w, frame_height=h,
                       livello=k, uso='scena 2D (anteprime/niumon_lotta.tpl.html): ' + {'far': 'in fondo, si sposta poco', 'mid': 'alberi scuri a metà strada',
                       'ground': 'il suolo della radura', 'near': 'tronchi sfocati davanti, ai bordi', 'fog': 'striscia che si ripete in orizzontale'}.get(k, ''),
                       source='disegnato col codice dalla pagina della lotta 2D', status='in uso nella prova 2D'))
json.dump(dict(nome='livelli della scena di lotta 2D', sprite=elenco), open(os.path.join(HERE, 'scena_lotta_2d.json'), 'w'), indent=1, ensure_ascii=False)
print(len(elenco), 'livelli:', ', '.join(e['nome'] + ' %dx%d' % (e['frame_width'], e['frame_height']) for e in elenco))
