"""Pixel art pulita dal disegno di Denis, come gli sprite del suo screenshot di riferimento (lotta HD-2D nel bosco di notte):
riquadro 80x80, pixel grossi, pochi toni piatti, contorno di un pixel (marrone scuro sul pelo, rosso scurissimo sulle fiamme),
linee interne solo dove il disegno ha i tratti più forti, occhi, naso e bocca disegnati a mano.

Il disegno dà la forma e dove stanno luce e ombra; il tratteggio della matita non passa: ogni pixel del disegno diventa un
numero sulla scala di fuoco (dal rosso scuro al giallo chiaro, i colori del disegno), il numero si liscia, si fa la media in ogni
blocco e si arrotonda a uno dei toni della scala. Così le zone restano piatte e le ombre hanno bordi puliti."""
import numpy as np, os
from PIL import Image
from scipy import ndimage as nd
from skimage.color import rgb2lab
from skimage.morphology import skeletonize
import pixel2d as P

HEX = P.HEX
PAL = dict(P.PAL); PAL['r4'] = '#74202a'; PAL['ol'] = '#3e1c1c'
SCALA = ['r3', 'r2', 'r1', 'r0', 'o1', 'o0', 'y1', 'y0']          # la scala di fuoco del disegno, dal buio alla luce
LABS = np.array([rgb2lab(np.array([[np.array(HEX(PAL[q])) / 255.0]]))[0, 0] for q in SCALA])

W = H = 80
K = 12.2                                   # pixel del disegno per pixel di sprite
BOX = (236, 164, 1127, 1091)               # la volpe nel disegno (senza braci)
OX = int(round((BOX[0] + BOX[2]) / 2 - W / 2 * K)); OY = int(round(BOX[3] - 77.9 * K))
PIVOT_SRC = (681, 1062)                    # il punto a terra sotto il centro della volpe

def to_sprite(x, y, xf=None):
    if xf is not None: x, y = xf[:, :2] @ np.array((x, y)) + xf[:, 2]
    return (x - OX) / K, (y - OY) / K

def scala_t(lab):
    """posizione di ogni colore sulla scala di fuoco (0 = r3 ... 7 = y0), proiettato sul tratto più vicino"""
    best_d = np.full(lab.shape[:-1], np.inf); best_t = np.zeros(lab.shape[:-1])
    w = np.array((1.0, 0.8, 0.8))
    for i in range(len(LABS) - 1):
        A, B = LABS[i], LABS[i + 1]; AB = B - A
        t = np.clip(((lab - A) * AB * w).sum(-1) / ((AB * AB * w).sum()), 0, 1)
        q = A + t[..., None] * AB
        d = (((lab - q) ** 2) * w).sum(-1)
        sel = d < best_d; best_d[sel] = d[sel]; best_t[sel] = i + t[sel]
    return best_t, best_d

_SRC = {}
SIG = 0.7
LINE_T = 1.1
LINE_MIN = 4
def campi(warp=None, key=None):
    """dal disegno (eventualmente deformato): sagoma, scala di fuoco lisciata, tratti scuri"""
    if key is not None and key in _SRC: return _SRC[key]
    a, sm, m, e = P.source()
    if warp is not None: sm, m, e, a = warp(sm, m, e, a)
    ys, xs = np.nonzero(m)
    lab = np.zeros(m.shape + (3,), np.float32)
    lab[ys, xs] = rgb2lab(np.clip(sm[ys, xs][None], 0, 1))[0]
    t = np.zeros(m.shape, np.float32); t[ys, xs] = scala_t(lab[ys, xs])[0]
    L = lab[..., 0]
    lum = a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11
    loc = nd.gaussian_filter(lum, 8)
    ink = m & (lum < 0.40) & (lum < loc - 0.07)
    wgt = (m & ~ink).astype(np.float32)
    s = SIG * K
    tt = nd.gaussian_filter(t * wgt, s) / np.maximum(nd.gaussian_filter(wgt, s), 1e-4)
    out = (a, m, tt.astype(np.float32), ink)
    if key is not None: _SRC[key] = out
    return out

def blocchi(img, msk):
    """media di img sui pixel di msk in ogni blocco, e quanto il blocco è coperto da msk"""
    h, w = msk.shape
    ys = [int(round(OY + i * K)) for i in range(H + 1)]; xs = [int(round(OX + j * K)) for j in range(W + 1)]
    mean = np.zeros((H, W), np.float32); cov = np.zeros((H, W), np.float32)
    for i in range(H):
        y0, y1 = max(ys[i], 0), min(ys[i + 1], h)
        if y1 <= y0: continue
        for j in range(W):
            x0, x1 = max(xs[j], 0), min(xs[j + 1], w)
            if x1 <= x0: continue
            mm = msk[y0:y1, x0:x1]
            cov[i, j] = mm.mean()
            if cov[i, j] > 0: mean[i, j] = img[y0:y1, x0:x1][mm].mean()
    return mean, cov

N4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)

def pulisci(idx, op, passes=3):
    """un pixel solo, diverso da tutti i vicini, prende il tono più comune intorno"""
    idx = idx.copy()
    for _ in range(passes):
        ch = 0
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                if not op[y, x]: continue
                nb = [idx[y + dy, x + dx] for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)) if op[y + dy, x + dx]]
                if len(nb) >= 3 and idx[y, x] not in nb:
                    v, c = np.unique(nb, return_counts=True)
                    # tra due toni vicini resta quello più vicino al suo
                    best = v[np.argmax(c * 10 - np.abs(v - idx[y, x]))]
                    idx[y, x] = best; ch += 1
        if not ch: break
    return idx

def sprite(warp=None, key=None, shift=0.0, xf=None, blink=False, muso=True, full=False):
    a, m, tt, ink = campi(warp, key)
    tm, cov = blocchi(tt, m)
    op = cov >= 0.45
    # i buchi piccoli (la luce bianca degli occhi del disegno) si chiudono; restano aperti quelli grandi (tra le zampe)
    hl, hn = nd.label(nd.binary_fill_holes(op) & ~op)
    for c in range(1, hn + 1):
        if (hl == c).sum() <= 6: op[hl == c] = True
    op[:2, :] = op[-2:, :] = False; op[:, :2] = op[:, -2:] = False
    idx = np.clip(np.round(tm + shift), 0, len(SCALA) - 1).astype(int)
    idx = pulisci(idx, op)
    lab = np.empty((H, W), object); lab[:] = None
    for i, q in enumerate(SCALA): lab[(idx == i) & op] = q
    # linee interne: i tratti scuri più lunghi del disegno, sottili un pixel
    sk = skeletonize(ink)
    fr, _ = blocchi(sk.astype(np.float32), np.ones_like(m))
    line = skeletonize((fr * K > LINE_T) & op)             # un tratto che attraversa almeno LINE_T del blocco
    lb, n = nd.label(line, structure=np.ones((3, 3)))
    for c in range(1, n + 1):
        if (lb == c).sum() < LINE_MIN: line[lb == c] = False
    edge = op & ~nd.binary_erosion(op, structure=N4)
    hot = idx <= 3
    near_hot = nd.binary_dilation(hot & op, structure=N4)
    for y, x in zip(*np.nonzero(line & ~edge)):
        lab[y, x] = 'r4' if idx[y, x] <= 3 else 'il'
    for y, x in zip(*np.nonzero(edge)):
        # contorno: rosso scurissimo vicino alle fiamme e alle calze, marrone scuro vicino al pelo
        nb = [idx[y + dy, x + dx] for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)) if 0 <= y + dy < H and 0 <= x + dx < W and op[y + dy, x + dx]]
        lab[y, x] = 'r4' if (nb and np.mean(nb) <= 3.2) else 'ol'
    if muso:
        rifai_pelo(lab, op, idx, edge, xf)
        volto(lab, op, xf=xf, blink=blink)
    if full: return lab, op, idx
    return lab, op

# zone del muso nel disegno (centro, mezzi assi in pixel del disegno): lì il disegno ha occhi, bocca, naso e i loro tratti scuri.
# Nello sprite queste zone tornano pelo (sfumato dai pixel intorno) e sopra si mettono i timbri: così niente avanzi del disegno
# intorno agli occhi, che sembravano uscire dal muso.
ZONE = [((471, 602), (66, 70)), ((303, 593), (36, 64)), ((372, 696), (52, 38)), ((346, 651), (20, 16))]

def rifai_pelo(lab, op, idx, edge, xf=None):
    yy, xx = np.mgrid[0:H, 0:W] + 0.5
    zone = np.zeros((H, W), bool)
    for (cx, cy), (rx, ry) in ZONE:
        sx, sy = to_sprite(cx, cy, xf)
        zone |= ((xx - sx) / (rx / K)) ** 2 + ((yy - sy) / (ry / K)) ** 2 <= 1
    zone &= op & ~edge
    have = op & ~zone
    val = np.where(have, idx, 0).astype(float)
    k3 = np.ones((3, 3))
    for _ in range(30):
        miss = zone & ~have
        if not miss.any(): break
        s_ = nd.convolve(val * have, k3, mode='constant'); c_ = nd.convolve(have.astype(float), k3, mode='constant')
        new = miss & (c_ > 0)
        val[new] = s_[new] / c_[new]; have |= new
    # una passata di media dentro la zona, poi il tono più vicino
    s_ = nd.convolve(val * op, k3, mode='constant'); c_ = nd.convolve(op.astype(float), k3, mode='constant')
    sm = np.where(zone, s_ / np.maximum(c_, 1), val)
    nz = np.clip(np.round(sm), 0, len(SCALA) - 1).astype(int)
    idx[zone] = nz[zone]
    for y, x in zip(*np.nonzero(zone)): lab[y, x] = SCALA[idx[y, x]]

# ------------------------------------------------------------------ il muso, a mano (misurato sul disegno)
OCCHIO_VICINO = [          # 8x10, come l'occhio vicino del disegno
    "..KKKK..",
    ".KKKKKK.",
    "KKDDDWWK",
    "KDDKKWWK",
    "KDKKKDDK",
    "KRKKKRRK",
    "KRRKKRRK",
    "KORRRROK",
    ".kOYYOk.",
    "..kkkk..",
]
OCCHIO_LONTANO = [         # 4x8: l'occhio lontano, stretto perché il muso è girato
    ".KK.",
    "KKKK",
    "KWKK",
    "KKDK",
    "KKRK",
    "KRRK",
    "KOOK",
    ".kk.",
]
CHIUSO_VICINO = ["K......K", ".KKKKKK."]
CHIUSO_LONTANO = ["K..K", ".KK."]
MEZZO_VICINO = [           # a metà: la palpebra scende sull'occhio (per un battito di ciglia morbido)
    "........",
    "........",
    "........",
    "..KKKK..",
    ".KKKKKK.",
    "KDKKKKDK",
    "KRKKKRRK",
    "KORRRROK",
    ".kOYYOk.",
    "..kkkk..",
]
MEZZO_LONTANO = [
    "....",
    "....",
    ".KK.",
    "KKKK",
    "KKRK",
    "KRRK",
    "KOOK",
    ".kk.",
]
BOCCA = [                  # bocca aperta col sorriso che sale a sinistra e la lingua in fondo
    "KK....",
    ".KKKKK",
    ".KMMMK",
    "..KTTK",
    "...KK.",
]
COL = {'K': 'ek', 'k': 'e0', 'W': 'ew', 'D': 'e1', 'R': 'e2', 'O': 'e3', 'Y': 'e4', 'M': 'mo', 'T': 'to', 'N': 'r3', 'B': 'bl'}

def timbro(lab, op, rows, cx, cy, mirror=False):
    h, w = len(rows), len(rows[0]); x0 = int(round(cx - w / 2)); y0 = int(round(cy - h / 2))
    for i, r in enumerate(rows):
        if mirror: r = r[::-1]
        for j, ch in enumerate(r):
            if ch == '.': continue
            y, x = y0 + i, x0 + j
            if 0 <= y < H and 0 <= x < W and op[y, x]: lab[y, x] = COL[ch]

def volto(lab, op, xf=None, blink=False):
    bx, by = to_sprite(546, 636, xf)            # guancia (prima degli occhi: l'occhio vince sempre)
    timbro(lab, op, ["BBB"], bx, by)
    nx, ny = to_sprite(346, 651, xf)            # naso
    timbro(lab, op, ["NN"], nx, ny)
    mx, my = to_sprite(375, 698, xf)            # bocca aperta con la lingua
    timbro(lab, op, BOCCA, mx, my)
    fx, fy = to_sprite(471, 602, xf)            # occhio vicino (centro misurato sul disegno)
    gx, gy = to_sprite(303, 593, xf)            # occhio lontano
    if blink == 'mezzo':
        timbro(lab, op, MEZZO_VICINO, fx, fy); timbro(lab, op, MEZZO_LONTANO, gx, gy)
    elif blink:
        timbro(lab, op, CHIUSO_VICINO, fx, fy + 2.0); timbro(lab, op, CHIUSO_LONTANO, gx, gy + 2.0)
    else:
        timbro(lab, op, OCCHIO_VICINO, fx, fy); timbro(lab, op, OCCHIO_LONTANO, gx, gy)

def render(lab, op, scale=1, bg=None):
    rgb = np.zeros((H, W, 4), np.uint8)
    for q in set(lab[op].tolist()):
        if q is None: continue
        rgb[(lab == q) & op, :3] = HEX(PAL[q])
    rgb[..., 3] = op * 255
    im = Image.fromarray(rgb)
    if scale > 1: im = im.resize((W * scale, H * scale), Image.NEAREST)
    if bg: b = Image.new('RGBA', im.size, bg); b.alpha_composite(im); im = b
    return im

if __name__ == '__main__':
    import sys
    lab, op = sprite(key='base')
    render(lab, op, 6, (40, 46, 58, 255)).save(sys.argv[1] if len(sys.argv) > 1 else '_pulito.png')
