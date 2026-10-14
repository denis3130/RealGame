"""Attrezzi per disegnare sprite in pixel art col codice: tela RGBA, linee spesse e sottili, ovali, contorno, pulizia, tavolozza
del bosco di notte (blu e grigi freddi, così le volpi di fuoco si staccano)."""
import numpy as np, math
from PIL import Image
from scipy import ndimage as nd

def hx(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

# la tavolozza del bosco di notte: pochi toni per materiale, dal buio alla luce della luna
PAL = {
    # corteccia
    'k0': '#06090d', 'k1': '#0e151c', 'k2': '#16202a', 'k3': '#202d39', 'k4': '#2e4050', 'k5': '#43596c', 'k6': '#5f7a90',
    # muschio e licheni
    'm0': '#0f221e', 'm1': '#173229', 'm2': '#21473a', 'm3': '#2f604f', 'm4': '#4a8170',
    # pietra
    's0': '#0c1014', 's1': '#1a2027', 's2': '#262e36', 's3': '#36404a', 's4': '#4b5763', 's5': '#66737f', 's6': '#8794a0',
    # erba e felci
    'g0': '#09130f', 'g1': '#102019', 'g2': '#182e24', 'g3': '#223f31', 'g4': '#2f5443', 'g5': '#456f5a',
    # terra
    't0': '#0d110f', 't1': '#151b17', 't2': '#1c241f', 't3': '#242e27', 't4': '#2e3a31', 't5': '#3b483d',
    # foglie secche e legno
    'f0': '#1c1512', 'f1': '#2c211b', 'f2': '#3d2d23', 'f3': '#52392b', 'f4': '#6b4a35', 'f5': '#86603f',
    # funghi luminosi
    'u0': '#123a44', 'u1': '#1f6a76', 'u2': '#37a7b4', 'u3': '#6fe0e6', 'u4': '#c6fbf8', 'u5': '#cfd9d6', 'u6': '#8ea19f',
    # luna, lucciole
    'l0': '#9fb4c4', 'l1': '#c8d6df', 'l2': '#eef4f6', 'y0': '#fff0b0', 'y1': '#ffd468', 'v0': '#d6ff8a', 'v1': '#8fd65c',
    # fuoco (come le volpi)
    'o0': '#fbb24b', 'o1': '#f4913e', 'r0': '#ee7240', 'r1': '#e05a38', 'r2': '#c8402f', 'r3': '#992a2c', 'r4': '#74202a',
    'w0': '#fffaf0',
}

class Tela:
    """una tela RGBA; si disegna con i nomi della tavolozza"""
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.c = np.zeros((h, w, 4), np.uint8)
    def put(self, mask, col, alpha=255):
        mask = mask & np.ones((self.h, self.w), bool)
        self.c[mask, :3] = hx(PAL.get(col, col)); self.c[mask, 3] = alpha
    def px(self, x, y, col):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.c[y, x, :3] = hx(PAL.get(col, col)); self.c[y, x, 3] = 255
    @property
    def alpha(self):
        return self.c[..., 3] > 0
    def img(self):
        return Image.fromarray(self.c, 'RGBA')

def griglia(w, h):
    yy, xx = np.mgrid[0:h, 0:w]
    return xx + 0.5, yy + 0.5

def capsula(mask, x0, y0, x1, y1, r0, r1):
    """riempie un tratto spesso (raggio da r0 a r1) da (x0,y0) a (x1,y1)"""
    h, w = mask.shape
    R = max(r0, r1) + 1
    xa, xb = int(max(0, math.floor(min(x0, x1) - R))), int(min(w, math.ceil(max(x0, x1) + R)))
    ya, yb = int(max(0, math.floor(min(y0, y1) - R))), int(min(h, math.ceil(max(y0, y1) + R)))
    if xb <= xa or yb <= ya: return
    yy, xx = np.mgrid[ya:yb, xa:xb] + 0.5
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy
    t = np.clip(((xx - x0) * dx + (yy - y0) * dy) / L2, 0, 1) if L2 > 0 else np.zeros_like(xx)
    d = np.hypot(xx - (x0 + t * dx), yy - (y0 + t * dy))
    mask[ya:yb, xa:xb] |= d <= r0 + (r1 - r0) * t

def linea(mask, x0, y0, x1, y1):
    """linea di un pixel (Bresenham)"""
    x0, y0, x1, y1 = int(math.floor(x0)), int(math.floor(y0)), int(math.floor(x1)), int(math.floor(y1))
    dx, dy = abs(x1 - x0), -abs(y1 - y0); sx = 1 if x0 < x1 else -1; sy = 1 if y0 < y1 else -1; err = dx + dy
    h, w = mask.shape
    while True:
        if 0 <= x0 < w and 0 <= y0 < h: mask[y0, x0] = True
        if x0 == x1 and y0 == y1: break
        e2 = 2 * err
        if e2 >= dy: err += dy; x0 += sx
        if e2 <= dx: err += dx; y0 += sy

def ovale(w, h, cx, cy, rx, ry, rot=0.0):
    xx, yy = griglia(w, h)
    c, s = math.cos(rot), math.sin(rot)
    u = ((xx - cx) * c + (yy - cy) * s) / rx; v = (-(xx - cx) * s + (yy - cy) * c) / ry
    return u * u + v * v <= 1

N4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)

def bordo(mask):
    """i pixel della sagoma che toccano il fuori (in 4 direzioni)"""
    return mask & ~nd.binary_erosion(mask, structure=N4, border_value=0)

def normali(mask, sig=1.2):
    """direzione verso fuori di ogni pixel (dalla sagoma sfumata)"""
    f = nd.gaussian_filter(mask.astype(float), sig)
    gy, gx = np.gradient(f)
    n = np.hypot(gx, gy) + 1e-9
    return -gx / n, -gy / n

def pulisci(lab, mask, passes=2, salva=()):
    """un pixel solo, diverso da tutti i vicini, prende il colore più comune intorno"""
    lab = lab.copy(); h, w = lab.shape
    for _ in range(passes):
        ch = 0
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                if not mask[y, x] or lab[y, x] in salva: continue
                nb = [lab[y + dy, x + dx] for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)) if mask[y + dy, x + dx]]
                if len(nb) >= 3 and lab[y, x] not in nb:
                    v, c = np.unique(nb, return_counts=True); lab[y, x] = v[np.argmax(c)]; ch += 1
        if not ch: break
    return lab

def da_etichette(lab, mask):
    t = Tela(lab.shape[1], lab.shape[0])
    for q in set(lab[mask].tolist()):
        if q: t.put(mask & (lab == q), q)
    return t

def rumore(w, h, scala, seed, wrap=False):
    """rumore liscio (0..1); con wrap si ripete ai bordi (per le piastrelle)"""
    r = np.random.default_rng(seed)
    a = r.random((h, w))
    f = nd.gaussian_filter(a, scala, mode='wrap' if wrap else 'reflect')
    f = (f - f.min()) / (np.ptp(f) + 1e-9)
    return f
