"""Le cose piccole del bosco di notte, in pixel art: sassi a faccette, ceppo, ciuffi d'erba, felci, funghi che brillano,
cespuglio secco; a terra (viste dall'alto) radici e foglie secche. Luce della luna dall'alto, contorno scuro, pochi toni."""
import numpy as np, math
from scipy import ndimage as nd
from pixel import Tela, capsula, linea, ovale, bordo, normali, pulisci, da_etichette, griglia

L3 = np.array((0.42, -0.70, 0.58)); L3 = L3 / np.linalg.norm(L3)     # luce: in alto a destra, un po' verso di noi

def sasso(seed, W, H, rx, ry, faccette=5, muschio=0.3, crepe=1):
    """sasso a faccette piatte: ogni faccia un tono (dalla luce), contorno scuro, base appoggiata a terra"""
    r = np.random.default_rng(seed)
    xx, yy = griglia(W, H)
    cx, cy = W / 2, H - 1.5 - ry * 0.78
    th = np.arctan2(yy - cy, xx - cx)
    rad = 1 + 0.10 * np.sin(3 * th + r.random() * 6) + 0.06 * np.sin(5 * th + r.random() * 6)
    u = (xx - cx) / rx; v = (yy - cy) / ry
    mask = (u * u + v * v <= rad * rad) & (yy <= H - 1.5)
    mask[:, :1] = mask[:, -1:] = False; mask[:1] = False
    ys, xs = np.nonzero(mask)
    # faccette: punti a caso, ogni pixel va al punto più vicino
    pts = np.stack([xs[r.integers(len(xs), size=faccette)] + 0.5, ys[r.integers(len(ys), size=faccette)] + 0.5], 1)
    d = np.stack([np.hypot(xx - p[0], yy - p[1]) for p in pts], -1)
    fac = d.argmin(-1)
    lab = np.full((H, W), '', object)
    for k in range(faccette):
        sel = mask & (fac == k)
        if not sel.any(): continue
        my, mx = np.nonzero(sel)
        uu = ((mx + 0.5).mean() - cx) / rx; vv = ((my + 0.5).mean() - cy) / ry
        nz = math.sqrt(max(0.05, 1 - min(uu * uu + vv * vv, 0.95)))
        n = np.array((uu, vv, nz)) + r.normal(0, 0.25, 3); n /= np.linalg.norm(n)
        s = float(n @ L3)
        lab[sel] = 's5' if s > 0.75 else ('s4' if s > 0.45 else ('s3' if s > 0.15 else 's2'))
    # spigoli tra le faccette un po' più chiari sopra, scuri sotto
    ed = bordo(mask)
    nx_, ny_ = normali(mask, 1.0)
    lit = nx_ * 0.5 - ny_ * 0.85
    lab[ed] = 's1'
    lab[ed & (lit > 0.55)] = 's5'
    lab[mask & (yy > H - 3.2) & ~ed] = 's2'                    # la base in ombra, dove tocca terra
    # muschio sopra
    if muschio:
        f = nd.gaussian_filter(r.random((H, W)), 1.3); f = (f - f.min()) / (np.ptp(f) + 1e-9)
        top = mask & (v < -0.15) & (f > 1 - muschio)
        lab[top & ~ed] = 'm2'; lab[top & ~ed & (lit > 0.3)] = 'm3'
    for _ in range(crepe):                                      # una crepa
        if len(xs) < 30: break
        i = r.integers(len(xs)); x0, y0 = xs[i], ys[i]
        crep = np.zeros((H, W), bool); linea(crep, x0, y0, x0 + r.integers(-4, 5), y0 + r.integers(2, 5))
        lab[crep & mask & ~ed] = 's1'
    lab = pulisci(lab, mask, salva=('s1',))
    return da_etichette(lab, mask), dict(pivot=[W // 2, H - 2])

def ceppo(seed, W=40, H=34):
    """ceppo tagliato: cima con gli anelli, fianco di corteccia, radici"""
    r = np.random.default_rng(seed)
    xx, yy = griglia(W, H)
    cx = W / 2; top_y = 9.0; rx, ry = 13.0, 5.0; bot = H - 4
    corpo = (np.abs(xx - cx) <= rx - (yy - top_y) * -0.06) & (yy >= top_y) & (yy <= bot)
    corpo |= ovale(W, H, cx, bot, rx, 3.0)
    for s in (-1, 1):                                           # radici
        capsula(corpo, cx + s * (rx - 3), bot - 3, cx + s * (rx + 5), H - 2, 3.0, 1.2)
    cima = ovale(W, H, cx, top_y, rx, ry)
    mask = corpo | cima
    lab = np.full((H, W), '', object)
    lab[corpo] = 'k3'
    lab[corpo & (xx > cx + rx * 0.35)] = 'k4'
    lab[corpo & (xx < cx - rx * 0.4)] = 'k2'
    for x in range(int(cx - rx) + 2, int(cx + rx) - 1, 3):     # venature verticali
        if r.random() < 0.7:
            v = np.zeros((H, W), bool); linea(v, x, top_y + 4, x + r.integers(-1, 2), bot - 1); lab[v & corpo] = 'k2'
    lab[cima] = 'f3'
    for k, c in ((0.78, 'f2'), (0.52, 'f4'), (0.28, 'f2')):    # anelli
        a = ovale(W, H, cx, top_y, rx * k, ry * k); b = ovale(W, H, cx, top_y, rx * k - 1, ry * k - 1)
        lab[a & ~b] = c
    lab[ovale(W, H, cx - 1, top_y, 1.6, 1.0)] = 'f2'
    lab[cima & ~ovale(W, H, cx, top_y, rx - 1, ry - 1)] = 'k4'
    ed = bordo(mask)
    lab[ed] = 'k1'
    nx_, ny_ = normali(mask, 1.0); lab[ed & (nx_ * 0.5 - ny_ * 0.85 > 0.5)] = 'k5'
    f = nd.gaussian_filter(r.random((H, W)), 1.4); f = (f - f.min()) / (np.ptp(f) + 1e-9)   # muschio
    lab[corpo & ~ed & (f > 0.72) & (yy > top_y + 6)] = 'm2'
    lab = pulisci(lab, mask, salva=('k1',))
    return da_etichette(lab, mask), dict(pivot=[W // 2, H - 3])

def erba(seed, W=18, H=16, n=8, alta=1.0):
    """ciuffo d'erba: fili di un pixel che si aprono dalla base, scuri giù e chiari in punta"""
    r = np.random.default_rng(seed)
    lab = np.full((H, W), '', object); mask = np.zeros((H, W), bool)
    for i in range(n):
        x0 = W / 2 + r.normal(0, 1.6); y0 = H - 1
        ang = (i - (n - 1) / 2) / n * 1.7 + r.normal(0, 0.15)
        L = (H - 3) * alta * (0.55 + r.random() * 0.45) * (1 - abs(ang) * 0.25)
        cur = r.normal(0, 0.08) + ang * 0.12
        x, y, a = x0, y0, ang * 0.55
        steps = int(L)
        for s in range(steps):
            a += cur
            nx, ny = x + math.sin(a), y - math.cos(a)
            seg = np.zeros((H, W), bool); linea(seg, x, y, nx, ny)
            k = s / max(steps - 1, 1)
            c = 'g1' if k < 0.2 else ('g2' if k < 0.42 else ('g3' if k < 0.66 else ('g4' if k < 0.88 else 'g5')))
            lab[seg & ~mask] = c; mask |= seg
            x, y = nx, ny
    # la base più folta
    base = ovale(W, H, W / 2, H - 1, 3.2, 1.6)
    lab[base] = 'g1'; mask |= base
    return da_etichette(lab, mask), dict(pivot=[W // 2, H - 1])

def felce(seed, W=30, H=20, foglie=3):
    """felce: fronde ad arco con le foglioline fitte ai due lati (a lisca di pesce), più chiare sul lato della luce"""
    r = np.random.default_rng(seed)
    lab = np.full((H, W), '', object); mask = np.zeros((H, W), bool)
    for j in range(foglie):
        s_ = (j - (foglie - 1) / 2)
        ang = s_ * 0.85 + r.normal(0, 0.10)
        x, y, a = W / 2 + s_ * 0.8, H - 1.0, ang * 0.35
        L = int(H * (1.0 + r.random() * 0.2) * (0.8 if abs(s_) > 0.6 else 1.0))
        pts = []
        for k in range(L):
            a += ang * 0.07
            x, y = x + math.sin(a) * 0.95, y - math.cos(a) * 0.80
            pts.append((x, y, a))
        for k, (x, y, a) in enumerate(pts):
            X, Y = int(x), int(y)
            if 0 <= X < W and 0 <= Y < H: lab[Y, X] = 'g2'; mask[Y, X] = True
            if k >= 2:
                ln = (1 - k / len(pts)) * 5.0 + 0.6
                for side in (-1, 1):
                    for q in range(1, int(ln) + 1):
                        px_ = x + math.cos(a) * side * q; py_ = y + math.sin(a) * side * q * 0.7 + q * 0.45
                        Xp, Yp = int(px_), int(py_)
                        if 0 <= Xp < W and 0 <= Yp < H and not (lab[Yp, Xp] == 'g2'):
                            lab[Yp, Xp] = ('g5' if (side * math.cos(a) > 0 and q >= ln - 1) else ('g4' if side * math.cos(a) > 0 else 'g3'))
                            mask[Yp, Xp] = True
    return da_etichette(lab, mask), dict(pivot=[W // 2, H - 1])

def funghi(seed, W=16, H=14, n=3):
    """funghetti che brillano azzurri: gambo chiaro, cappello con la luce sopra, puntini"""
    r = np.random.default_rng(seed)
    lab = np.full((H, W), '', object); mask = np.zeros((H, W), bool)
    spec = [(W * 0.38, 1.0), (W * 0.68, 0.7), (W * 0.18, 0.55)][:n]
    for (x, k) in sorted(spec, key=lambda q: -q[1]):
        h = int(round(4 + 6 * k)); cw = 2.2 + 2.6 * k
        x = x + r.normal(0, 0.5)
        stem = np.zeros((H, W), bool)
        capsula(stem, x, H - 1, x + r.normal(0, 0.6), H - h + 1, 0.9 + 0.4 * k, 0.8)
        lab[stem] = 'u5'; lab[stem & (np.arange(W)[None, :] + 0.5 < x)] = 'u6'; mask |= stem
        cap = ovale(W, H, x, H - h + 0.5, cw, 1.6 + 0.9 * k) & (np.arange(H)[:, None] + 0.5 <= H - h + 1.2)
        lab[cap] = 'u2'
        lab[cap & ~nd.binary_erosion(cap)] = 'u1'
        top = cap & (np.arange(H)[:, None] + 0.5 < H - h - 0.4 * k)
        lab[top & nd.binary_erosion(cap)] = 'u3'
        hy = int(H - h - 1 - 0.6 * k); hxp = int(x + 1)
        if 0 <= hy < H and 0 <= hxp < W and cap[hy, hxp]: lab[hy, hxp] = 'u4'
        lab[cap & (np.arange(H)[:, None] + 0.5 > H - h + 0.6)] = 'u0'      # il sotto del cappello
        mask |= cap
    return da_etichette(lab, mask), dict(pivot=[W // 2, H - 1], brilla='#6fe0e6')

def cespuglio(seed, W=34, H=24):
    """cespuglio secco: rametti intrecciati a cupola, scuri, con qualche punta chiara e due foglie secche"""
    r = np.random.default_rng(seed)
    lab = np.full((H, W), '', object); mask = np.zeros((H, W), bool)
    for i in range(16):
        x0 = W / 2 + r.normal(0, 2.5); y0 = H - 1
        ang = r.uniform(-1.25, 1.25)
        x, y, a = x0, y0, ang
        L = r.uniform(H * 0.5, H * 0.95) * (1 - abs(ang) * 0.2)
        for k in range(int(L / 2)):
            a += r.normal(0, 0.35)
            nx, ny = x + math.sin(a) * 2, y - math.cos(a) * 2
            seg = np.zeros((H, W), bool); linea(seg, x, y, nx, ny)
            lab[seg] = 'k2' if k > 1 else 'k1'; mask |= seg
            if r.random() < 0.3:
                b = np.zeros((H, W), bool); bx = nx + r.choice((-2, 2)); by = ny - 1.5
                linea(b, nx, ny, bx, by); lab[b & ~mask] = 'k1'; mask |= b
            x, y = nx, ny
        X, Y = int(x), int(y)
        if 0 <= X < W and 0 <= Y < H: lab[Y, X] = 'k4'
    for _ in range(4):                                            # foglie secche rimaste
        ys, xs = np.nonzero(mask)
        i = r.integers(len(xs)); X, Y = xs[i], ys[i]
        for (dx, dy), c in (((0, 0), 'f3'), ((1, 0), 'f4'), ((0, 1), 'f2')):
            if 0 <= X + dx < W and 0 <= Y + dy < H: lab[Y + dy, X + dx] = c; mask[Y + dy, X + dx] = True
    return da_etichette(lab, mask), dict(pivot=[W // 2, H - 1])

def radici(seed, W=64, H=32, n=3):
    """radici che escono da un lato e corrono sulla terra (viste dall'alto), unite: legno scuro, dorso chiaro, contorno"""
    r = np.random.default_rng(seed)
    mask = np.zeros((H, W), bool); dorso = np.zeros((H, W), bool)
    def rad(x, y, a, w, passi):
        for k in range(passi):
            a += r.normal(0, 0.28)
            nx, ny = x + math.cos(a) * 4.2, y + math.sin(a) * 2.8
            capsula(mask, x, y, nx, ny, w / 2, max(w * 0.86, 1.1) / 2)
            if w > 2.2: linea(dorso, x, y - w * 0.2, nx, ny - w * 0.2)
            if k > 1 and r.random() < 0.28 and w > 2.0:
                rad(nx, ny, a + r.choice((-0.9, 0.9)), w * 0.6, passi - k - 1)
            x, y = nx, ny; w *= 0.86
            if not (2 < x < W - 2 and 2 < y < H - 2) or w < 1.0: break
    x0, y0 = 4.0, H * 0.5
    for i in range(n):
        rad(x0, y0 + r.normal(0, 2), r.normal(0, 0.45), r.uniform(3.6, 5.0), 14)
    mask[:1] = mask[-1:] = False; mask[:, :1] = mask[:, -1:] = False
    lab = np.full((H, W), '', object); lab[mask] = 'f2'
    lab[dorso & mask] = 'f3'
    ed = bordo(mask); lab[ed] = 'f0'
    nx_, ny_ = normali(mask, 1.0); lab[ed & (-ny_ > 0.6)] = 'f1'
    return da_etichette(lab, mask), dict(pivot=[4, H // 2], a_terra=True)

def foglie(seed, W=48, H=48, n=42):
    """foglie secche sparse a terra (viste dall'alto)"""
    r = np.random.default_rng(seed)
    lab = np.full((H, W), '', object); mask = np.zeros((H, W), bool)
    xx, yy = griglia(W, H)
    for i in range(n):
        x, y = r.uniform(3, W - 3), r.uniform(3, H - 3)
        if (x - W / 2) ** 2 + (y - H / 2) ** 2 > (W / 2 - 3) ** 2: continue
        rot = r.uniform(0, math.pi)
        f = ovale(W, H, x, y, r.uniform(1.9, 3.0), r.uniform(1.0, 1.4), rot)
        c = r.choice(['f2', 'f3', 'f4', 'f3', 'm1'])
        lab[f] = c; lab[f & ~nd.binary_erosion(f)] = {'f2': 'f1', 'f3': 'f2', 'f4': 'f3', 'm1': 'm0'}[c]
        mask |= f
    return da_etichette(lab, mask), dict(pivot=[W // 2, H // 2], a_terra=True)

VARIANTI = [
    ('sasso_grande', sasso, dict(seed=3, W=44, H=30, rx=19, ry=12.5, faccette=7, muschio=0.35, crepe=2)),
    ('sasso_medio', sasso, dict(seed=5, W=28, H=20, rx=12, ry=8, faccette=5, muschio=0.25)),
    ('sasso_piccolo', sasso, dict(seed=8, W=16, H=12, rx=6.5, ry=4.5, faccette=3, muschio=0.0, crepe=0)),
    ('sasso_piatto', sasso, dict(seed=13, W=32, H=14, rx=14.5, ry=5, faccette=4, muschio=0.2)),
    ('ceppo', ceppo, dict(seed=21)),
    ('erba_1', erba, dict(seed=31)),
    ('erba_2', erba, dict(seed=32, W=22, H=18, n=11, alta=1.0)),
    ('erba_3', erba, dict(seed=33, W=14, H=12, n=6, alta=0.9)),
    ('felce_1', felce, dict(seed=41)),
    ('felce_2', felce, dict(seed=42, W=26, H=18, foglie=2)),
    ('funghi_1', funghi, dict(seed=51)),
    ('funghi_2', funghi, dict(seed=52, W=12, H=12, n=2)),
    ('cespuglio_secco', cespuglio, dict(seed=61)),
    ('radici_1', radici, dict(seed=71)),
    ('radici_2', radici, dict(seed=72, W=56, H=40, n=4)),
    ('foglie_secche', foglie, dict(seed=81)),
]

if __name__ == '__main__':
    import sys
    from PIL import Image
    ims = []
    for nome, f, kw in VARIANTI:
        t, m = f(**kw); ims.append(t.img())
    sc = 5
    Wt = sum(i.size[0] for i in ims) * sc + 8 * len(ims); Ht = max(i.size[1] for i in ims) * sc
    c = Image.new('RGBA', (Wt, Ht), (58, 70, 66, 255)); x = 0
    for i in ims:
        c.alpha_composite(i.resize((i.size[0] * sc, i.size[1] * sc), Image.NEAREST), (x, Ht - i.size[1] * sc)); x += i.size[0] * sc + 8
    c.save(sys.argv[1] if len(sys.argv) > 1 else '_piccoli.png')
