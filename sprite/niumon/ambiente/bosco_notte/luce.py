"""Luci e particelle del bosco di notte: luna in pixel art, e le cose morbide che si sommano alla scena (alone della luna, nebbia,
raggio di luna, luce del fuoco a terra, ombra) più le particelle animate (lucciola, cenere, brace) in fogli di fotogrammi."""
import numpy as np, math
from scipy import ndimage as nd
from pixel import Tela, PAL, hx, ovale, griglia, rumore

def luna(W=28):
    """la luna: disco chiaro con i crateri, la parte in basso a sinistra più scura"""
    xx, yy = griglia(W, W)
    c = W / 2; R = W / 2 - 1.5
    d = np.hypot(xx - c, yy - c)
    mask = d <= R
    lab = np.full((W, W), '', object); lab[mask] = 'l1'
    lab[mask & ((xx - c) * 0.6 + (yy - c) * 0.8 > R * 0.35)] = 'l0'
    lab[mask & ((xx - c) * 0.6 + (yy - c) * 0.8 < -R * 0.45)] = 'l2'
    for (x, y, rr) in ((c - 4, c - 2, 3.2), (c + 4, c + 4, 2.4), (c + 3, c - 6, 1.6), (c - 6, c + 5, 1.4), (c + 7, c - 1, 1.2)):
        cr = (np.hypot(xx - x, yy - y) <= rr) & mask
        lab[cr] = 'l0'
        lab[cr & (np.hypot(xx - x - 0.8, yy - y - 0.8) > rr - 0.2)] = 'l2'
    t = Tela(W, W)
    for q in set(lab[mask].tolist()): t.put(mask & (lab == q), q)
    return t

def morbido(W, H, f, col):
    """tela con un colore solo e la trasparenza da f (0..1): per le luci che si sommano"""
    t = Tela(W, H)
    t.c[..., :3] = hx(col); t.c[..., 3] = np.clip(f * 255, 0, 255).astype(np.uint8)
    return t

def alone(W=64):
    xx, yy = griglia(W, W); d = np.hypot(xx - W / 2, yy - W / 2) / (W / 2)
    return morbido(W, W, np.clip(1 - d, 0, 1) ** 2.2, '#cfe0ee')

def nebbia(W=128, H=48, seed=5):
    xx, yy = griglia(W, H)
    u = (xx - W / 2) / (W / 2); v = (yy - H / 2) / (H / 2)
    base = np.clip(1 - (u * u + v * v * 1.0), 0, 1)
    n = rumore(W, H, 5, seed)
    f = base ** 1.4 * (0.55 + 0.45 * n)
    return morbido(W, H, f * 0.9, '#a8bccb')

def raggio(W=48, H=192):
    xx, yy = griglia(W, H)
    u = np.abs(xx - W / 2) / (W / 2); v = yy / H
    f = np.clip(1 - u, 0, 1) ** 1.6 * np.clip(1 - v, 0, 1) ** 0.8 * np.clip(v * 6, 0, 1)
    return morbido(W, H, f * 0.75, '#c7dcec')

def luce_fuoco(W=64):
    xx, yy = griglia(W, W); d = np.hypot(xx - W / 2, yy - W / 2) / (W / 2)
    return morbido(W, W, np.clip(1 - d, 0, 1) ** 1.8, '#ff8a3a')

def ombra(W=48, H=16):
    xx, yy = griglia(W, H)
    d = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
    return morbido(W, H, np.clip(1 - d, 0, 1) ** 0.9 * 0.85, '#03060a')

def foglio(frames):
    """fotogrammi (tele della stessa misura) messi in fila"""
    w, h = frames[0].w, frames[0].h
    t = Tela(w * len(frames), h)
    for i, f in enumerate(frames): t.c[:, i * w:(i + 1) * w] = f.c
    return t

def lucciola():
    """5x5, 4 fotogrammi: il puntino giallo verde che si accende e si spegne"""
    fr = []
    for k in (0.35, 0.7, 1.0, 0.6):
        t = Tela(5, 5)
        t.px(2, 2, 'y0' if k > 0.9 else 'v0')
        if k > 0.5:
            for (x, y) in ((1, 2), (3, 2), (2, 1), (2, 3)): t.px(x, y, 'v1')
        if k > 0.9:
            for (x, y) in ((0, 2), (4, 2), (2, 0), (2, 4)): t.px(x, y, '#3f6b2c')
        fr.append(t)
    return foglio(fr)

def cenere():
    """3x3, 2 fotogrammi: un fiocco di cenere grigio chiaro che gira"""
    a = Tela(3, 3); a.px(1, 1, '#aebdc8'); a.px(0, 1, '#6f7c86')
    b = Tela(3, 3); b.px(1, 1, '#aebdc8'); b.px(1, 0, '#6f7c86')
    return foglio([a, b])

def brace():
    """4x4, 5 fotogrammi: la brace nasce gialla 2x2 e si spegne arancio, rossa, rosso scuro"""
    fr = []
    for cols in ((('y0', 'y1'), ('o0', 'o1')), (('y1', 'o0'), ('o1', 'r0')), (('o0', None), (None, None)),
                 (('r1', None), (None, None)), (('r3', None), (None, None))):
        t = Tela(4, 4)
        for j, row in enumerate(cols):
            for i, c in enumerate(row):
                if c: t.px(1 + i, 1 + j, c)
        fr.append(t)
    return foglio(fr)

VARIANTI = [
    ('luna', luna, {}), ('alone_luna', alone, {}), ('nebbia', nebbia, {}), ('raggio_di_luna', raggio, {}),
    ('luce_fuoco', luce_fuoco, {}), ('ombra', ombra, {}),
    ('lucciola', lucciola, {}), ('cenere', cenere, {}), ('brace', brace, {}),
]

if __name__ == '__main__':
    import sys
    from PIL import Image
    ims = [f(**kw).img() for _, f, kw in VARIANTI]
    sc = 4
    Wt = sum(i.size[0] for i in ims) * sc + 8 * len(ims); Ht = max(i.size[1] for i in ims) * sc
    c = Image.new('RGBA', (Wt, Ht), (20, 28, 36, 255)); x = 0
    for i in ims:
        c.alpha_composite(i.resize((i.size[0] * sc, i.size[1] * sc), Image.NEAREST), (x, 0)); x += i.size[0] * sc + 8
    c.save(sys.argv[1] if len(sys.argv) > 1 else '_luce.png')
