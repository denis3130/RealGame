"""Alberi spogli del bosco di notte, in pixel art: tronco storto con le radici che si allargano a terra, rami grossi e contorti
che si dividono e finiscono in rametti di un pixel. Contorno scurissimo, corteccia blu grigia in quattro toni, filo di luce della
luna sul lato in alto a destra, venature scure lungo il tronco, un nodo, un po' di muschio in basso sul lato della luce.
La tela si adatta all'albero (niente rami tagliati); il punto d'appoggio è la base del tronco."""
import numpy as np, math
from scipy import ndimage as nd
from pixel import Tela, capsula, linea, bordo, normali, pulisci, da_etichette

def struttura(r, base, alto, piega, rami, apertura, profondo, rametti, contorto, radici):
    """i segmenti dell'albero (x, y verso il basso, origine alla base del tronco)"""
    segs = []                                  # (x0, y0, x1, y1, w0, w1, livello)
    def ramo(x, y, ang, lung, w, d, curva):
        n = max(2, int(lung / 6))
        px, py, a = x, y, ang
        for i in range(n):
            a += r.normal(0, 0.11 + contorto * 0.12) + curva
            a -= a * (0.22 if d == profondo else 0.07)          # i rami tendono verso l'alto (il tronco di più)
            l = lung / n
            nx, ny = px + math.sin(a) * l, py - math.cos(a) * l
            w0 = w * (1 - i / n * 0.30); w1 = w * (1 - (i + 1) / n * 0.30)
            segs.append((px, py, nx, ny, w0, w1, d))
            if d < profondo and d >= 1 and r.random() < rametti and lung > 12:      # rametti di lato
                s = (1 if r.random() < 0.5 else -1) * (0.8 + r.random() * 0.5)
                ramo(nx, ny, a + s, lung * 0.30, max(w1 * 0.40, 0.6), 0, 0)
            px, py = nx, ny
        if d <= 0 or lung < 5: return
        k = rami if d == profondo else (2 if r.random() < 0.7 else 3)
        for j in range(k):
            sp = (j - (k - 1) / 2) * apertura * (0.8 + r.random() * 0.4) + r.normal(0, 0.10)
            ramo(px, py, a + sp * (1.0 if d == profondo else 0.85), lung * (0.62 + r.random() * 0.14),
                 w1 * (0.80 if k == 2 else 0.70), d - 1, r.normal(0, 0.06) * contorto)
    ramo(0.0, 0.0, piega, alto, base, profondo, r.normal(0, 0.035) * (1 + contorto))
    for j in range(radici):                    # radici che si allargano a terra
        s = -1 if j % 2 == 0 else 1
        ang = s * (1.95 + r.random() * 0.45)
        lr = base * (1.0 + r.random() * 0.8)
        xa, ya = s * base * 0.12, -base * 0.55
        segs.append((xa, ya, xa + math.sin(ang) * lr, min(ya - math.cos(ang) * lr, 0.5), base * 0.34, 0.9, profondo + 1))
    return segs

def albero(seed, base=11.0, alto=72.0, piega=0.0, rami=3, apertura=0.62, profondo=4, muschio=0.35, nodo=True, radici=3,
           rametti=0.35, contorto=0.5):
    r = np.random.default_rng(seed)
    segs = struttura(r, base, alto, piega, rami, apertura, profondo, rametti, contorto, radici)
    xs = [v for s in segs for v in (s[0], s[2])]; ys = [v for s in segs for v in (s[1], s[3])]
    m = 3
    x_min, x_max, y_min = min(xs) - base, max(xs) + base, min(ys) - 2
    W = int(math.ceil(x_max - x_min)) + 2 * m; W += W % 2
    H = int(math.ceil(-y_min)) + 2 * m + 2
    ox, oy = -x_min + m, H - m - 1                       # dove va la base del tronco
    grosso = np.zeros((H, W), bool); sottile = np.zeros((H, W), bool)
    tronco = []
    for (x0, y0, x1, y1, w0, w1, d) in segs:
        X0, Y0, X1, Y1 = x0 + ox, y0 + oy, x1 + ox, y1 + oy
        if w1 >= 1.15:
            capsula(grosso, X0, Y0, X1, Y1, w0 / 2, w1 / 2)
            if d == profondo: tronco.append((X0, Y0, X1, Y1, w0, w1))
        elif w0 >= 1.6:
            capsula(grosso, X0, Y0, X1, Y1, w0 / 2, 0.55)
        else:
            linea(sottile, X0, Y0, X1, Y1)
    mask = grosso | sottile
    lab = np.full((H, W), '', object)
    nx_, ny_ = normali(grosso, 1.0)
    luce = nx_ * 0.55 + ny_ * -0.83                       # la luna in alto a destra
    din = nd.distance_transform_edt(np.pad(grosso, 1))[1:-1, 1:-1]
    lab[grosso] = 'k3'
    lab[grosso & (din <= 2.5) & (luce < -0.25)] = 'k2'
    lab[grosso & (din <= 2.2) & (luce > 0.25)] = 'k4'
    ed = bordo(grosso)
    lab[ed] = 'k1'
    lab[ed & (luce > 0.45)] = 'k5'
    # venature del tronco: righe scure lungo i segmenti più grossi
    ven = np.zeros((H, W), bool)
    for (xa, ya, xb, yb, w0, w1) in tronco:
        if w0 < 6: continue
        for off in (-0.2, 0.16):
            dx, dy = xb - xa, yb - ya; L = math.hypot(dx, dy) + 1e-9
            ox_, oy_ = -dy / L * w0 * off, dx / L * w0 * off
            if r.random() < 0.8: linea(ven, xa + ox_, ya + oy_, xb + ox_ * 0.9, yb + oy_ * 0.9)
    lab[ven & grosso & ~ed & (din > 1.5)] = 'k2'
    # un nodo nel tronco
    if nodo and len(tronco) > 1:
        xa, ya, xb, yb, w0, w1 = tronco[1]
        cx, cy = (xa + xb) / 2 + r.normal(0, 0.8), (ya + yb) / 2
        for (dx, dy), c in (((0, 0), 'k0'), ((1, 0), 'k0'), ((0, 1), 'k1'), ((1, 1), 'k1'), ((-1, 0), 'k1'), ((0, -1), 'k4'), ((1, -1), 'k4')):
            x, y = int(cx + dx), int(cy + dy)
            if 0 <= x < W and 0 <= y < H and grosso[y, x] and not ed[y, x]: lab[y, x] = c
    # muschio: chiazze in basso sul tronco, sul lato della luce
    if muschio > 0:
        f = nd.gaussian_filter(r.random((H, W)), 2.2)
        f = (f - f.min()) / (np.ptp(f) + 1e-9)
        yy = (np.arange(H)[:, None] - (oy - 0.45 * H)) / (0.45 * H)
        dove = grosso & ~ed & (din > 1.2) & (f > 1 - muschio * np.clip(yy, 0, 1) ** 2) & (luce > -0.1)
        lab[dove] = 'm2'
        lab[dove & (luce > 0.3)] = 'm3'
        lab[dove & ~nd.binary_erosion(dove, structure=np.ones((3, 3), bool)) & (luce < 0.3)] = 'm1'
    lab[sottile & ~grosso] = 'k1'
    lab = pulisci(lab, mask, salva=('k1', 'k0', 'k5'))
    return da_etichette(lab, mask), dict(pivot=[int(round(ox)), int(oy)])

VARIANTI = [   # nome, parametri
    ('albero_spoglio_1', dict(seed=11, base=12, alto=78, rami=3, apertura=0.66, profondo=4, contorto=0.6)),
    ('albero_spoglio_2', dict(seed=27, base=10, alto=86, piega=0.07, rami=2, apertura=0.70, profondo=4, contorto=0.5)),
    ('albero_spoglio_3', dict(seed=43, base=13, alto=66, piega=-0.09, rami=3, apertura=0.78, profondo=4, muschio=0.5, contorto=0.8)),
    ('albero_spoglio_4', dict(seed=58, base=9, alto=96, piega=0.03, rami=2, apertura=0.52, profondo=4, rametti=0.5, contorto=0.4)),
    ('albero_storto_grande', dict(seed=71, base=18, alto=74, piega=-0.12, rami=3, apertura=0.86, profondo=5, muschio=0.6, radici=4, contorto=1.0)),
    ('alberello_secco', dict(seed=88, base=5, alto=34, rami=2, apertura=0.7, profondo=3, muschio=0.0, radici=2, contorto=0.6)),
]

if __name__ == '__main__':
    import sys
    from PIL import Image
    ims = []
    for nome, kw in VARIANTI:
        t, m = albero(**kw); ims.append(t.img()); print(nome, t.w, t.h, m)
    sc = 3
    Wt = sum(i.size[0] for i in ims) * sc + 10 * len(ims); Ht = max(i.size[1] for i in ims) * sc
    c = Image.new('RGBA', (Wt, Ht), (96, 112, 126, 255)); x = 0
    for i in ims:
        c.alpha_composite(i.resize((i.size[0] * sc, i.size[1] * sc), Image.NEAREST), (x, Ht - i.size[1] * sc)); x += i.size[0] * sc + 10
    c.save(sys.argv[1] if len(sys.argv) > 1 else '_alberi.png')
