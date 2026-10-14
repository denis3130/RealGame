"""Gli effetti delle mosse di fuoco in pixel art, fogli di fotogrammi (stessi colori delle volpi):
- palla_di_fuoco (16x16, 4): cuore chiaro, corpo arancio, bordo rosso che tremola; vola verso il bersaglio;
- fiammata (24x24, 6): uno sbuffo di fuoco che nasce, si gonfia e si spegne in fumo (per la Fiammata, tanti in fila);
- esplosione (48x48, 6): lampo, anello di fuoco che si apre, fumo;
- graffio (32x32, 4): tre artigli di luce che tagliano in diagonale;
- scintilla (9x9, 3): stellina del colpo andato a segno."""
import numpy as np, math, os, sys
from scipy import ndimage as nd
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'ambiente', 'bosco_notte'))
from pixel import Tela, PAL, hx, ovale, griglia, linea, rumore

FUOCO = ['r4', 'r3', 'r2', 'r1', 'r0', 'o1', 'o0', 'y1', 'y0', 'w0']

def palla(k, S=16):
    """k: fase 0..1"""
    xx, yy = griglia(S, S)
    c = S / 2
    d = np.hypot(xx - c, yy - c)
    th = np.arctan2(yy - c, xx - c)
    R = 5.6 + 0.9 * np.sin(5 * th + k * 2 * math.pi) + 0.5 * np.sin(3 * th - k * 4 * math.pi)
    # coda di fiamma in alto a destra (vola verso il basso a sinistra)
    coda = np.hypot((xx - c - 2.5) * 0.9, (yy - c + 2.5) * 0.9) <= 4.2 + 0.8 * math.sin(k * 6.28)
    m = (d <= R) | coda
    q = np.clip(1 - d / np.maximum(R, 1), 0, 1)
    lv = np.clip((q * 7.5 + 2).astype(int), 1, 9)
    lv[coda & ~(d <= R)] = np.clip(lv[coda & ~(d <= R)] - 3, 1, 9)
    t = Tela(S, S)
    edge = m & ~nd.binary_erosion(m)
    for i, col in enumerate(FUOCO):
        t.put(m & (lv == i), col)
    t.put(edge, 'r3')
    return t

def sbuffo(k, S=24, seed=3):
    """fiammata: sbuffo che nasce (k=0), si gonfia, si spegne in fumo (k=1)"""
    xx, yy = griglia(S, S)
    c = S / 2
    R = 3 + 8 * min(1, k * 1.6)
    n = rumore(S, S, 1.6, seed + int(k * 10))
    d = np.hypot(xx - c, (yy - c) * 1.1) + (n - 0.5) * 4
    m = d <= R
    q = np.clip(1 - d / R, 0, 1)
    caldo = max(0.0, 1 - k * 1.25)
    lv = np.clip((q * 6 + caldo * 4).astype(int), 0, 9)
    t = Tela(S, S)
    if k < 0.8:
        for i, col in enumerate(FUOCO): t.put(m & (lv == i), col)
        t.put(m & ~nd.binary_erosion(m), 'r3' if k < 0.5 else 'r4')
    # fumo che sale dopo
    if k > 0.45:
        fm = (np.hypot(xx - c + 1, (yy - c + 3) * 1.2) + (n - 0.5) * 5 <= R * 0.9) & ~(m & (k < 0.8))
        t.put(fm, '#3a3f47'); t.put(fm & (n > 0.6), '#4f555e')
    return t

def esplosione(k, S=48, seed=9):
    xx, yy = griglia(S, S)
    c = S / 2
    n = rumore(S, S, 2.0, seed)
    d = np.hypot(xx - c, yy - c) + (n - 0.5) * 6
    t = Tela(S, S)
    if k < 0.2:                                                         # lampo
        R = 7 + k * 40
        m = d <= R
        t.put(m, 'y1'); t.put(m & (d < R * 0.6), 'y0'); t.put(m & (d < R * 0.3), 'w0')
        return t
    R1 = 6 + k * 22; R0 = max(0, R1 - 9 + k * 4)                        # anello di fuoco
    anello = (d <= R1) & (d >= R0)
    q = 1 - np.abs(d - (R0 + R1) / 2) / ((R1 - R0) / 2 + 1e-9)
    caldo = max(0.0, 1 - k)
    lv = np.clip((q * 5 + caldo * 4).astype(int), 0, 9)
    if k < 0.85:
        for i, col in enumerate(FUOCO): t.put(anello & (lv == i), col)
        t.put(anello & ~nd.binary_erosion(anello), 'r3')
    if k > 0.4:                                                         # fumo dentro
        fm = (d <= R0 * 0.95) & (n > 0.35 + k * 0.2)
        t.put(fm, '#30353c'); t.put(fm & (n > 0.7), '#454b53')
    return t

def graffio(k, S=32):
    """tre artigli che tagliano dall'alto a destra in basso a sinistra"""
    t = Tela(S, S)
    L = min(1.0, k * 2.2)
    for j in range(3):
        off = (j - 1) * 7
        x0, y0 = 26 + off * 0.5, 4 + off * 0.5
        x1, y1 = 6 + off * 0.5, 26 + off * 0.5
        xe, ye = x0 + (x1 - x0) * L, y0 + (y1 - y0) * L
        m = np.zeros((S, S), bool); linea(m, x0, y0, xe, ye)
        core = m.copy()
        if k < 0.6:
            m2 = np.zeros((S, S), bool); linea(m2, x0 + 1, y0, xe + 1, ye); m |= m2
        col = 'w0' if k < 0.35 else ('y0' if k < 0.6 else 'o0')
        t.put(nd.binary_dilation(m) & ~m, 'o1' if k < 0.6 else 'r1', 255 if k < 0.75 else 160)
        t.put(m, col)
        t.put(core & (np.arange(S)[None, :] > (xe + 3)), 'y1')
    return t

def scintilla(k, S=9):
    t = Tela(S, S); c = S // 2
    L = [1, 3, 2][int(k * 2.99)]
    for i in range(1, L + 1):
        for (dx, dy) in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            t.px(c + dx * i, c + dy * i, 'y0' if i == 1 else ('y1' if i == 2 else 'o0'))
    if L >= 2:
        for (dx, dy) in ((1, 1), (-1, 1), (1, -1), (-1, -1)): t.px(c + dx, c + dy, 'o0')
    t.px(c, c, 'w0')
    return t

def foglio(frames):
    w, h = frames[0].w, frames[0].h
    out = Tela(w * len(frames), h)
    for i, f in enumerate(frames): out.c[:, i * w:(i + 1) * w] = f.c
    return out

VARIANTI = [
    ('palla_di_fuoco', lambda: foglio([palla(i / 4) for i in range(4)]), dict(frames=4, fps=14, loop=True, w=16, h=16)),
    ('fiammata', lambda: foglio([sbuffo(i / 5) for i in range(6)]), dict(frames=6, fps=14, loop=False, w=24, h=24)),
    ('esplosione', lambda: foglio([esplosione(i / 5) for i in range(6)]), dict(frames=6, fps=14, loop=False, w=48, h=48)),
    ('graffio', lambda: foglio([graffio(i / 3) for i in range(4)]), dict(frames=4, fps=16, loop=False, w=32, h=32)),
    ('scintilla', lambda: foglio([scintilla(i / 2) for i in range(3)]), dict(frames=3, fps=16, loop=False, w=9, h=9)),
]

def fai():
    """scrive i fogli e i loro dati qui accanto"""
    import json
    here = os.path.dirname(os.path.abspath(__file__)); elenco = []
    for nome, f, meta in VARIANTI:
        t = f(); t.img().save(os.path.join(here, nome + '.png'))
        m = dict(asset_id='vfx_battle_fuoco_' + nome, nome=nome, file=nome + '.png', category='vfx_battle', frame_width=meta['w'],
                 frame_height=meta['h'], frames=meta['frames'], fps=meta['fps'], loop=meta['loop'], pivot=[meta['w'] // 2, meta['h'] // 2],
                 blend='normale', source='disegnato col codice (sprite/niumon/effetti/fuoco/effetti.py)', version='0.1-effetti-fuoco',
                 status='da approvare', format='PNG_RGBA', background='transparent')
        json.dump(m, open(os.path.join(here, nome + '.json'), 'w'), indent=1, ensure_ascii=False); elenco.append(m)
    json.dump(dict(nome='effetti di fuoco', sprite=elenco), open(os.path.join(here, 'effetti_fuoco.json'), 'w'), indent=1, ensure_ascii=False)
    print(len(elenco), 'fogli di effetti')

if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'fai':
    fai()
elif __name__ == '__main__':
    from PIL import Image
    ims = [f().img() for _, f, _ in VARIANTI]
    sc = 4
    Wt = max(i.size[0] for i in ims) * sc; Ht = sum(i.size[1] for i in ims) * sc + 8 * len(ims)
    c = Image.new('RGBA', (Wt, Ht), (20, 28, 36, 255)); y = 0
    for i in ims:
        c.alpha_composite(i.resize((i.size[0] * sc, i.size[1] * sc), Image.NEAREST), (0, y)); y += i.size[1] * sc + 8
    c.save(sys.argv[1] if len(sys.argv) > 1 else '_effetti.png')
