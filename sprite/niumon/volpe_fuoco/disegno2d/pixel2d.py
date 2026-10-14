"""Pixel art in 2D dal disegno di Denis, senza nessuna base 3D: la matita lisciata, un pixel ogni k pixel del disegno,
tavolozza fissa di fuoco, contorno scuro di un pixel, linee interne dai tratti scuri, occhi puliti, pixel isolati tolti."""
import numpy as np, os
from PIL import Image
from scipy import ndimage as nd
from skimage.color import rgb2lab
from skimage.restoration import denoise_tv_chambolle
from skimage.morphology import skeletonize
import maschera

HEX = lambda h: [int(h[i:i + 2], 16) for i in (1, 3, 5)]
PAL = {
    'ol': '#4a2420',   # contorno
    'il': '#8a3a26',   # linee interne
    'f0': '#fde3a8',   # pelo chiarissimo
    'f1': '#f9cf86',   # pelo chiaro
    'f2': '#f6bb6c',   # pelo
    'f3': '#f0a257',   # pelo ombra
    'f4': '#e3863f',   # pelo ombra scura
    'y0': '#fff0b0',   # fiamma cuore
    'y1': '#ffd468',   # fiamma gialla
    'o0': '#fbb24b',   # fiamma arancio chiaro
    'o1': '#f4913e',   # fiamma arancio
    'r0': '#ee7240',   # fiamma rosso arancio chiaro
    'r1': '#e05a38',   # fiamma rosso arancio
    'r2': '#c8402f',   # fiamma rossa
    'r3': '#992a2c',   # rosso scuro (orecchie dentro, ombre delle fiamme)
    'p0': '#ee8a63',   # zampe chiare
    'p1': '#e0704d',   # zampe
    'p2': '#c2533d',   # zampe ombra
    'p3': '#9c3c33',   # zampe ombra scura
    'bl': '#f28a6e',   # guance
    'ek': '#3a1418',   # pupilla e contorno dell'occhio
    'e0': '#5e1a1e',   # iride scurissima
    'e1': '#8e2226',   # iride scura
    'e2': '#d24a32',   # iride rossa
    'e3': '#f7a54a',   # iride bassa
    'e4': '#ffd27a',   # iride bassa chiara
    'ew': '#fffaf0',   # luce dell'occhio
    'to': '#ee8a8a',   # lingua
    'mo': '#7a2228',   # bocca
}
KEYS = [q for q in PAL]
LAB = {q: rgb2lab(np.array([[np.array(HEX(PAL[q])) / 255.0]]))[0, 0] for q in PAL}
BODY = ['f0', 'f1', 'f2', 'f3', 'f4', 'y0', 'y1', 'o0', 'o1', 'r0', 'r1', 'r2', 'r3', 'p0', 'p1', 'p2', 'p3', 'bl']

def nearest(L, keys, w=(1.0, 1.3, 1.3)):
    P = np.array([LAB[q] for q in keys]); d = ((L[..., None, :] - P) ** 2 * np.array(w)).sum(-1)
    return np.array(keys)[d.argmin(-1)]

_SRC = None
def source(tv=0.2):
    global _SRC
    if _SRC is None:
        a, m, e = maschera.load()
        sm = denoise_tv_chambolle(a, weight=tv, channel_axis=-1)
        _SRC = (a, sm.astype(np.float32), m, e)
    return _SRC

_FULL = {}
GRAIN = 9
def full_labels(sm, m, contrast, sat, shift, cache=True):
    key = (id(sm), contrast, sat, shift)
    if cache and key in _FULL: return _FULL[key]
    ys, xs = np.nonzero(m)
    L = rgb2lab(np.clip(sm[ys, xs][None], 0, 1))[0]
    L[:, 0] = 50 + (L[:, 0] - 50) * contrast - shift
    L[:, 1:] *= sat
    idx = np.full(m.shape, -1, np.int16)
    P = np.array([LAB[q] for q in BODY]); w = np.array((1.0, 1.3, 1.3))
    best = np.empty(len(ys), np.int16)
    for s0 in range(0, len(ys), 200000):
        d = ((L[s0:s0 + 200000, None, :] - P) ** 2 * w).sum(-1); best[s0:s0 + 200000] = d.argmin(-1)
    idx[ys, xs] = best
    # grana della matita: ogni pixel prende il colore più comune intorno (finestra 7x7)
    oh = np.stack([(idx == q).astype(np.float32) for q in range(len(BODY))], -1)
    oh = np.stack([nd.uniform_filter(oh[..., q], GRAIN) for q in range(len(BODY))], -1)
    idx = np.where(m, oh.argmax(-1), -1).astype(np.int16)
    if cache: _FULL[key] = idx
    return idx

def block_mode(idx, m, k, ox, oy, W, H):
    out = np.empty((H, W), object); out[:] = 'f1'
    h, w = m.shape
    for i in range(H):
        y0, y1 = oy + int(round(i * k)), oy + int(round((i + 1) * k))
        for j in range(W):
            x0, x1 = ox + int(round(j * k)), ox + int(round((j + 1) * k))
            blk = idx[max(y0, 0):max(min(y1, h), 0), max(x0, 0):max(min(x1, w), 0)]
            blk = blk[blk >= 0]
            if blk.size: out[i, j] = BODY[np.bincount(blk).argmax()]
    return out

def blocks(img, m, k, ox, oy, W, H):
    """media (pesata dalla sagoma) di ogni blocco k×k e quanto è coperto"""
    h, w = m.shape
    out = np.zeros((H, W, img.shape[2]), np.float32); cov = np.zeros((H, W), np.float32)
    for i in range(H):
        y0, y1 = oy + int(round(i * k)), oy + int(round((i + 1) * k))
        if y1 <= 0 or y0 >= h: continue
        for j in range(W):
            x0, x1 = ox + int(round(j * k)), ox + int(round((j + 1) * k))
            if x1 <= 0 or x0 >= w: continue
            mm = m[max(y0, 0):y1, max(x0, 0):x1]
            if mm.size == 0: continue
            c = mm.mean(); cov[i, j] = c
            if c > 0: out[i, j] = img[max(y0, 0):y1, max(x0, 0):x1][mm].mean(0)
    return out, cov

def run(k, frame, pivot_src=(681, 1062), contrast=1.22, sat=1.3, shift=4, cov_t=0.42, ink_t=0.38, line_f=0.16,
        warp=None, blink=False, embers=True, xf=None):
    a, sm, m, e = source()
    if warp is not None:
        sm, m, e, a = warp(sm, m, e, a)
    W, H = frame
    # il punto a terra del disegno (sotto il centro tra muso e coda) va al pivot del riquadro
    ox = int(round(pivot_src[0] - W / 2 * k)); oy = int(round(pivot_src[1] - (H - 6) * k))
    allm = m | (e if embers else np.zeros_like(m))
    _, cov = blocks(sm[..., :1], allm, k, ox, oy, W, H)
    op = cov >= cov_t
    op[:2, :] = False; op[-2:, :] = False; op[:, :2] = False; op[:, -2:] = False     # margine: niente tocca il bordo
    full = full_labels(sm, allm, contrast, sat, shift, cache=(warp is None))
    lab = block_mode(full, allm, k, ox, oy, W, H).astype(object)
    lab[~op] = 'f1'
    # tratti scuri del disegno (contorni interni), ridotti a un pixel
    lum = a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11
    loc = nd.gaussian_filter(lum, 8)
    bnd = m & ~nd.binary_erosion(m, iterations=int(k * 0.9))
    ink = ((lum < ink_t) & (lum < loc - 0.08) & m & ~bnd).astype(np.float32)
    fr, _ = blocks(ink[..., None], np.ones_like(m), k, ox, oy, W, H)
    line = skeletonize((fr[..., 0] > line_f) & op)
    # niente pixel di linea isolati
    nbh = nd.convolve(line.astype(int), np.ones((3, 3), int), mode='constant') - line
    line &= nbh > 0
    edge = op & nd.binary_dilation(~op, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]])
    lab = modefilter(lab, op)
    lab = np.where(line, 'il', lab); lab = np.where(edge, 'ol', lab)
    lab = despeckle(lab, op)
    feat = features(lab, op, a, k, ox, oy, warp_shift=None, xf=xf)
    for (cx, cy, ex, ey, far) in EYES:
        if xf is not None:
            cx, cy = xf[:, :2] @ np.array((cx, cy)) + xf[:, 2]; ex *= np.hypot(*xf[:, 0]); ey *= np.hypot(*xf[:, 1])
        clear_around(lab, op, (cx - ox) / k, (cy - oy) / k, ex / k * 1.35, ey / k * 1.25)
        if k >= 13: stamp(lab, op, (cx - ox) / k, (cy - oy) / k, far=far, closed=blink)
        else: eye(lab, op, (cx - ox) / k, (cy - oy) / k, ex / k, ey / k, far=far, closed=blink)
    return lab, op, (ox, oy)

# riquadri nel disegno (pixel dell'immagine 1254x1254)
# occhi: centro e mezze misure nel disegno; disegnati come occhi da sprite, sempre puliti
EYES = [(304, 592, 21, 52, True), (472, 600, 50, 55, False)]      # misurati sul disegno (centro, mezze misure)
FEAT = [
    ((334, 640, 358, 662), ['r2'], dict(r2=2.0)),                                              # naso
    ((352, 662, 428, 724), ['mo', 'to', 'ek'], dict(to=1.4, mo=1.2)),                          # bocca aperta
    ((515, 612, 552, 650), ['bl'], dict(bl=1.4)),                                              # guancia
]

def features(lab, op, a, k, ox, oy, warp_shift=None, xf=None):
    H, W = lab.shape; out = np.zeros((H, W), bool)
    fur = ['f0', 'f1', 'f2', 'f3', 'y1', 'o0', 'o1']
    for (x0, y0, x1, y1), keys, wt in FEAT:
        if xf is not None:
            (x0, y0), (x1, y1) = [xf[:, :2] @ np.array(q) + xf[:, 2] for q in ((x0, y0), (x1, y1))]
        j0, j1 = int((x0 - ox) // k), int((x1 - ox) // k) + 1; i0, i1 = int((y0 - oy) // k), int((y1 - oy) // k) + 1
        for i in range(max(i0, 0), min(i1, H)):
            for j in range(max(j0, 0), min(j1, W)):
                if not op[i, j] or lab[i, j] == 'ol': continue
                yy0, yy1 = oy + int(round(i * k)), oy + int(round((i + 1) * k)); xx0, xx1 = ox + int(round(j * k)), ox + int(round((j + 1) * k))
                blk = a[yy0:yy1, xx0:xx1].reshape(-1, 3)
                q = nearest(rgb2lab(blk[None])[0], keys + fur)
                vals, cnt = np.unique(q, return_counts=True); cnt = cnt.astype(float)
                for t, w in wt.items(): cnt[vals == t] *= w
                v = vals[cnt.argmax()]
                if v in keys: lab[i, j] = v; out[i, j] = True
    return out

# occhi fatti a mano per la grandezza di gioco (come i timbri della prova di prima)
ST = {'vicino': [".KKK.", "KWWDK", "KWKDK", "KRKRK", "KRKRK", "KYYYK", ".KKK."],
      'lontano': [".KK", "KWK", "KKK", "KRK", "KYK", ".KK"],
      'chiuso': ["K...K", ".KKK."], 'chiuso_l': ["K.K", ".K."]}
SC = {'K': 'ek', 'D': 'e1', 'R': 'e2', 'Y': 'e3', 'W': 'ew'}

def stamp(lab, op, cx, cy, far=False, closed=False):
    rows = ST[('chiuso_l' if far else 'chiuso') if closed else ('lontano' if far else 'vicino')]
    h, w = len(rows), len(rows[0]); x0 = int(round(cx - w / 2)); y0 = int(round(cy - h / 2))
    for i, r in enumerate(rows):
        for j, ch in enumerate(r):
            if ch == '.': continue
            y, x = y0 + i, x0 + j
            if 0 <= y < lab.shape[0] and 0 <= x < lab.shape[1] and op[y, x]: lab[y, x] = SC[ch]

def clear_around(lab, op, cx, cy, a, b):
    """i pixel non di pelo dentro l'ellisse prendono il pelo più comune lì intorno"""
    H, W = lab.shape
    fur = ('f0', 'f1', 'f2', 'f3', 'f4')
    ring = []
    for i in range(int(cy - b - 3), int(cy + b + 4)):
        for j in range(int(cx - a - 3), int(cx + a + 4)):
            if 0 <= i < H and 0 <= j < W and op[i, j] and lab[i, j] in fur:
                r = np.hypot((j + .5 - cx) / a, (i + .5 - cy) / b)
                if 1.0 < r < 1.6: ring.append(lab[i, j])
    fill = max(set(ring), key=ring.count) if ring else 'f1'
    for i in range(int(cy - b - 1), int(cy + b + 2)):
        for j in range(int(cx - a - 1), int(cx + a + 2)):
            if 0 <= i < H and 0 <= j < W and op[i, j] and lab[i, j] not in ('ol', 'il', 'bl', 'mo', 'to'):
                if np.hypot((j + .5 - cx) / a, (i + .5 - cy) / b) <= 1.0 and lab[i, j] not in fur: lab[i, j] = fill

def eye(lab, op, cx, cy, a, b, far=False, closed=False, ss=6):
    """occhio da sprite: contorno scuro (più spesso sopra), iride dal rosso scuro all'arancio, pupilla dritta, due luci"""
    H, W = lab.shape
    y0, y1 = int(np.floor(cy - b - 1)), int(np.ceil(cy + b + 1)); x0, x1 = int(np.floor(cx - a - 1)), int(np.ceil(cx + a + 1))
    PR = dict(ek=4, ew=5, e0=1, e1=1, e2=1, e3=1, e4=1)
    for i in range(max(y0, 0), min(y1 + 1, H)):
        for j in range(max(x0, 0), min(x1 + 1, W)):
            votes = {}
            for si in range(ss):
                for sj in range(ss):
                    py = i + (si + 0.5) / ss; px = j + (sj + 0.5) / ss
                    ex = (px - cx) / a; ey = (py - cy) / b
                    r = np.hypot(ex, ey)
                    if r > 1: continue
                    if closed:
                        c = 'ek' if abs(ey - 0.25 - 0.25 * ex * ex) < 0.2 else None
                        if c is None: continue
                    else:
                        ring = 1 - 1.05 / max(a, 1.5) if ey > -0.35 else 1 - 1.7 / max(a, 1.5)   # palpebra sopra più spessa
                        if r > ring: c = 'ek'
                        else:
                            if a >= 6:
                                c = 'e0' if ey < -0.45 else ('e1' if ey < -0.1 else ('e2' if ey < 0.35 else ('e3' if ey < 0.62 else 'e4')))
                            else:
                                c = 'e1' if ey < -0.3 else ('e2' if ey < 0.38 else 'e3')
                            if (ex / 0.24) ** 2 + ((ey - 0.02) / 0.5) ** 2 < 1: c = 'ek'
                            if ((ex - (0.05 if far else -0.2)) / 0.3) ** 2 + ((ey + 0.4) / 0.24) ** 2 < 1: c = 'ew'
                            if a >= 6 and not far and ((ex - 0.3) / 0.12) ** 2 + ((ey - 0.42) / 0.1) ** 2 < 1: c = 'ew'
                    votes[c] = votes.get(c, 0) + 1
            if not votes: continue
            tot = sum(votes.values())
            if tot < ss * ss * 0.45 and not closed: continue
            if closed:
                if votes.get('ek', 0) >= ss * 2: lab[i, j] = 'ek'
                continue
            best = max(votes, key=lambda q: votes[q] * (1 + 0.35 * PR[q]))
            lab[i, j] = best

def blink_eyes(lab, feat):
    """palpebre chiuse: l'occhio diventa pelo con una riga scura curva in basso"""
    eye = feat & np.isin(lab, ['ek', 'e1', 'e2', 'e3', 'ew'])
    lb, n = nd.label(eye)
    for c in range(1, n + 1):
        ys, xs = np.nonzero(lb == c)
        if len(ys) < 3: continue
        lab[lb == c] = 'f1'
        yb = int(round(ys.mean() + (ys.max() - ys.mean()) * 0.35))
        for x in range(xs.min(), xs.max() + 1):
            off = 0 if xs.min() < x < xs.max() else -1
            lab[yb + off, x] = 'ek'
    return feat

def modefilter(lab, op):
    """ogni pixel prende il colore più comune nel suo intorno 3x3 se lui è in minoranza (zone più piatte)"""
    out = lab.copy(); H, W = lab.shape
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if not op[y, x]: continue
            nb = [lab[y + dy, x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if op[y + dy, x + dx]]
            vals, cnt = np.unique(nb, return_counts=True)
            if cnt.max() >= 5 and lab[y, x] != vals[cnt.argmax()] and (np.array(nb) == lab[y, x]).sum() <= 2:
                out[y, x] = vals[cnt.argmax()]
    return out

def despeckle(lab, op, passes=2):
    out = lab.copy(); H, W = lab.shape
    for _ in range(passes):
        src = out.copy()
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                c = src[y, x]
                if not op[y, x] or c in ('ol', 'il'): continue
                nb = [src[y + dy, x + dx] for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)) if op[y + dy, x + dx] and src[y + dy, x + dx] not in ('ol', 'il')]
                if len(nb) >= 3 and c not in nb:
                    vals, cnt = np.unique(nb, return_counts=True); out[y, x] = vals[cnt.argmax()]
    return out

def render(lab, op, scale=1, bg=None):
    H, W = lab.shape; rgb = np.zeros((H, W, 4), np.uint8)
    for q in PAL: rgb[lab == q, :3] = HEX(PAL[q])
    rgb[..., 3] = op * 255
    im = Image.fromarray(rgb)
    if scale > 1: im = im.resize((W * scale, H * scale), Image.NEAREST)
    if bg: b = Image.new('RGBA', im.size, bg); b.alpha_composite(im); im = b
    return im

if __name__ == '__main__':
    lab, op, _ = run(10.5, (96, 96)); render(lab, op, 5, (120, 132, 110, 255)).save('_lotta.png')
    lab, op, _ = run(10.5, (96, 96), blink=True); render(lab, op, 5, (120, 132, 110, 255)).save('_lotta_chiusi.png')
    lab, op, _ = run(16.0, (64, 64)); render(lab, op, 6, (120, 132, 110, 255)).save('_mappa.png')
