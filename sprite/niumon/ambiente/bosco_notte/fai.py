"""Rifà tutti gli sprite del bosco di notte (ambiente della lotta dei Niumon) e i loro dati.
Uso: python3 fai.py   ->  alberi/, piante/, rocce/, terreno/, a_terra/, luce/, particelle/ (un PNG e un .json per sprite),
bosco_notte.json (l'elenco), atlante.png + atlante.json (tutti gli sprite in pixel art in un'immagine sola, per la pagina 3D),
foglio_di_controllo.png (tutti insieme, ingranditi)."""
import os, json
import numpy as np
from PIL import Image, ImageDraw
import alberi, piccoli, terreno, luce

HERE = os.path.dirname(os.path.abspath(__file__))
VERSIONE = '0.1-bosco-di-notte'
# unità del mondo per pixel: le volpi della lotta stanno a 1/50 (96 px = 1,9 unità), il bosco ha pixel un po' più grossi
PS = {'alberi': 1 / 26, 'rocce': 1 / 40, 'piante': 1 / 40, 'a_terra': 1 / 32, 'terreno': 1 / 32, 'luce': 1 / 40, 'particelle': 1 / 50}

def scrivi(cartella, nome, tela, meta):
    os.makedirs(os.path.join(HERE, cartella), exist_ok=True)
    tela.img().save(os.path.join(HERE, cartella, nome + '.png'))
    meta = dict(asset_id='env_bosconotte_' + nome, nome=nome, cartella=cartella, file=f'{cartella}/{nome}.png',
                frame_width=meta.pop('fw', tela.w), frame_height=meta.pop('fh', tela.h), **meta)
    meta.setdefault('frames', 1); meta.setdefault('fps', 0); meta.setdefault('loop', False); meta.setdefault('blend', 'normale')
    meta.setdefault('unita_per_pixel', round(PS[cartella], 5))
    meta.update(source='disegnato col codice (sprite/niumon/ambiente/bosco_notte/fai.py)', version=VERSIONE, status='da approvare',
                format='PNG_RGBA', background='transparent')
    json.dump(meta, open(os.path.join(HERE, cartella, nome + '.json'), 'w'), indent=1, ensure_ascii=False)
    return meta

def main():
    elenco = []
    for nome, kw in alberi.VARIANTI:
        t, m = alberi.albero(**kw)
        elenco.append(scrivi('alberi', nome, t, dict(category='env_tree', pivot=m['pivot'], billboard=True,
                                                      descrizione='albero spoglio, si guarda sempre verso la telecamera')))
    for nome, f, kw in piccoli.VARIANTI:
        t, m = f(**kw)
        a_terra = m.get('a_terra', False)
        cart = 'a_terra' if a_terra else ('rocce' if nome.startswith('sasso') or nome == 'ceppo' else 'piante')
        meta = dict(category='env_decal' if a_terra else 'env_prop', pivot=m['pivot'], billboard=not a_terra,
                    descrizione=('steso a terra, visto dall\'alto' if a_terra else 'in piedi, si guarda verso la telecamera'))
        if 'brilla' in m: meta['brilla'] = m['brilla']
        elenco.append(scrivi(cart, nome, t, meta))
    for nome, tipo, seed in terreno.VARIANTI:
        t = terreno.piastrella(tipo, seed)
        elenco.append(scrivi('terreno', nome, t, dict(category='tileset', piastrella=True, ripetibile=True,
                                                       descrizione='piastrella 64x64 che si ripete senza cuciture')))
    for nome, f, kw in luce.VARIANTI:
        t = f(**kw)
        if nome in ('lucciola', 'cenere', 'brace'):
            n = {'lucciola': 4, 'cenere': 2, 'brace': 5}[nome]; fps = {'lucciola': 6, 'cenere': 4, 'brace': 8}[nome]
            elenco.append(scrivi('particelle', nome, t, dict(category='vfx_world', frames=n, fps=fps, loop=nome != 'brace',
                                                              fw=t.w // n, fh=t.h, pivot=[t.w // n // 2, t.h // 2], billboard=True,
                                                              blend='normale')))
        else:
            morbido = nome != 'luna'
            # blend: 'normale' pixel art coi bordi netti, 'somma' luce che si somma alla scena, 'alfa' velo morbido (nebbia, ombra)
            blend = 'normale' if nome == 'luna' else ('somma' if nome in ('alone_luna', 'raggio_di_luna', 'luce_fuoco') else 'alfa')
            elenco.append(scrivi('luce', nome, t, dict(category='vfx_light', pivot=[t.w // 2, t.h // 2], billboard=nome != 'ombra',
                                                        blend=blend, morbido=morbido)))
    json.dump(dict(nome='bosco di notte', versione=VERSIONE, sprite=elenco), open(os.path.join(HERE, 'bosco_notte.json'), 'w'),
              indent=1, ensure_ascii=False)
    atlante(elenco)
    controllo(elenco)
    print(len(elenco), 'sprite')

def atlante(elenco, W=1024, pad=4):
    """tutti gli sprite in pixel art (non le piastrelle né le luci morbide) in un'immagine sola, a scaffali"""
    voci = [m for m in elenco if m['category'] not in ('tileset',) and not m.get('morbido')]
    ims = {m['nome']: Image.open(os.path.join(HERE, m['file'])) for m in voci}
    voci.sort(key=lambda m: -ims[m['nome']].size[1])
    x = y = pad; riga = 0; rect = {}
    for m in voci:
        w, h = ims[m['nome']].size
        if x + w + pad > W: x = pad; y += riga + pad; riga = 0
        rect[m['nome']] = [x, y, w, h]; x += w + pad; riga = max(riga, h)
    H = y + riga + pad; H = 1 << (H - 1).bit_length()
    at = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for m in voci: at.paste(ims[m['nome']], tuple(rect[m['nome']][:2]))
    at.save(os.path.join(HERE, 'atlante.png'))
    json.dump(dict(w=W, h=H, rect=rect), open(os.path.join(HERE, 'atlante.json'), 'w'), indent=1)

def controllo(elenco, sc=3):
    """il foglio di controllo: ogni sprite ingrandito col suo nome, su un fondo di notte"""
    ims = [(m, Image.open(os.path.join(HERE, m['file']))) for m in elenco]
    W = 1800; x = y = 16; riga = 0; pos = []
    for m, im in ims:
        w, h = max(im.size[0] * sc, len(m['nome']) * 6 + 6), im.size[1] * sc + 18     # largo almeno quanto il nome
        if x + w > W - 16: x = 16; y += riga + 16; riga = 0
        pos.append((x, y)); x += w + 16; riga = max(riga, h)
    H = y + riga + 16
    c = Image.new('RGBA', (W, H), (34, 44, 52, 255)); d = ImageDraw.Draw(c)
    for (m, im), (x, y) in zip(ims, pos):
        big = im.resize((im.size[0] * sc, im.size[1] * sc), Image.NEAREST)
        c.alpha_composite(big, (x, y + 18)); d.text((x, y + 2), m['nome'], fill=(230, 236, 240, 255))
    c.save(os.path.join(HERE, 'foglio_di_controllo.png'))

if __name__ == '__main__':
    main()
