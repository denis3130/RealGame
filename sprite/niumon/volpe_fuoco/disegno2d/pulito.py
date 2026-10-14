"""Pixel art pulita dal disegno di Denis, come gli sprite del suo screenshot di riferimento (lotta HD-2D nel bosco di notte):
riquadro 96x96 (la volpe come prima, a 12,2 pixel del disegno per pixel, più spazio intorno per le braci e le mosse), pixel
grossi, pochi toni piatti, contorno di un pixel (marrone scuro sul pelo, rosso scurissimo sulle fiamme), linee interne solo dove
il disegno ha i tratti più forti.

Il disegno dà la forma e dove stanno luce e ombra; il tratteggio della matita non passa: ogni pixel del disegno diventa un
numero sulla scala di fuoco (dal rosso scuro al giallo chiaro, i colori del disegno), il numero si liscia, si fa la media in ogni
blocco e si arrotonda a uno dei toni della scala. Così le zone restano piatte e le ombre hanno bordi puliti.

Occhi, bocca e naso sono quelli del disegno (niente timbri fatti a mano): la loro forma è il contorno a matita chiuso e riempito,
i colori sono i suoi (iride dal rosso scuro all'arancio, pupilla, luce bianca, bocca e lingua); si riducono a pixel con delle
precedenze (la luce, poi il contorno e la pupilla, poi il colore più presente). Il pelo intorno si calcola senza di loro, così
niente avanzi della matita che escono dal muso. Si calcolano una volta e si incollano a pixel interi dove sta la testa, così non
tremano tra un fotogramma e l'altro.

Le parti del corpo (zampe, corpo, coda, testa) si possono spostare a pixel interi (respiro, testa che segue, scatti): il
contorno si rifà dopo, sulla sagoma nuova."""
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd
from skimage.color import rgb2lab
from skimage.morphology import skeletonize, disk, convex_hull_image
import pixel2d as P

HEX = P.HEX
PAL = dict(P.PAL); PAL['r4'] = '#74202a'; PAL['ol'] = '#3e1c1c'
SCALA = ['r3', 'r2', 'r1', 'r0', 'o1', 'o0', 'y1', 'y0']          # la scala di fuoco del disegno, dal buio alla luce
LABS = np.array([rgb2lab(np.array([[np.array(HEX(PAL[q])) / 255.0]]))[0, 0] for q in SCALA])
PALL = {q: rgb2lab(np.array([[np.array(HEX(PAL[q])) / 255.0]]))[0, 0] for q in PAL}

W = H = 96
K = 12.2                                   # pixel del disegno per pixel di sprite
BOX = (236, 164, 1127, 1091)               # la volpe nel disegno (senza braci)
OX = int(round((BOX[0] + BOX[2]) / 2 - W / 2 * K)); OY = int(round(BOX[3] - (H - 7.1) * K))
PIVOT_SRC = (681, 1062)                    # il punto a terra sotto il centro della volpe
N4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)

def to_sprite(x, y):
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

def griglia():
    ys = [int(round(OY + i * K)) for i in range(H + 1)]; xs = [int(round(OX + j * K)) for j in range(W + 1)]
    return ys, xs

# ------------------------------------------------------------------ le parti del corpo nel disegno
ZAMPE, CORPO, CODA, TESTA, CRESTA = 1, 2, 3, 4, 5
ORDINE = (CODA, ZAMPE, CORPO, TESTA, CRESTA)   # da dietro a davanti (la cresta si muove con la testa)
POLY_TESTA = [(200, 100), (775, 100), (775, 545), (705, 600), (645, 664), (560, 712), (470, 742), (380, 744), (318, 720),
              (232, 702), (200, 702)]
POLY_CODA = [(775, 100), (1254, 100), (1254, 840), (905, 840), (872, 806), (812, 792), (780, 760), (775, 700)]
POLY_ZAMPE = [(0, 846), (330, 832), (420, 850), (520, 870), (600, 882), (700, 886), (780, 864), (860, 870), (1000, 872),
              (1254, 872), (1254, 1254), (0, 1254)]
POLY_CRESTA = [(318, 100), (640, 100), (640, 300), (590, 360), (566, 430), (470, 446), (380, 436), (334, 404), (318, 330)]
POLY_ORECCHIO_V = [(700, 255), (728, 390), (712, 470), (676, 560), (630, 592), (590, 476), (574, 420), (620, 340)]   # quello vicino (a destra)
POLY_ORECCHIO_L = [(300, 240), (356, 370), (350, 470), (312, 476), (262, 522), (238, 490), (244, 390)]                # quello lontano
_PARTI = None
def parti_disegno():
    global _PARTI
    if _PARTI is None:
        a, sm, m, e = P.source()
        lab = np.full(m.shape, CORPO, np.uint8)
        for poly, v in ((POLY_ZAMPE, ZAMPE), (POLY_CODA, CODA), (POLY_TESTA, TESTA), (POLY_CRESTA, CRESTA)):
            mm = np.zeros(m.shape, np.uint8); cv2.fillPoly(mm, [np.array(poly, np.int32)], 1); lab[mm > 0] = v
        _PARTI = lab
    return _PARTI

def poligono_sprite(poly, mirror=False, dy=0.0):
    """poligono del disegno -> maschera nello sprite (specchiata per la vista di spalle)"""
    q = np.array([to_sprite(x, y) for x, y in poly]); q[:, 1] += dy
    if mirror: q[:, 0] = W - q[:, 0]
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [np.round(q * 8).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=3)
    return m > 0

# ------------------------------------------------------------------ il muso nel disegno: occhi, bocca, naso
FEATS = {                                  # centro e mezzi assi della zona dove cercarli (pixel del disegno)
    'occhio_v': (471, 602, 75, 78),
    'occhio_l': (303, 590, 45, 72),
    'bocca': (378, 698, 58, 42),
    'naso': (346, 654, 20, 13),
}
IRIDE = ['e1', 'e2', 'r1', 'e3', 'e4']
_VOLTO = None
def volto_disegno():
    """le maschere e i colori di occhi, bocca e naso nel disegno (una volta sola)"""
    global _VOLTO
    if _VOLTO is not None: return _VOLTO
    a, sm, m, e = P.source()
    ag = np.stack([nd.gaussian_filter(a[..., c], 1.0) for c in range(3)], -1)
    LR = rgb2lab(np.clip(ag, 0, 1)); LS = rgb2lab(np.clip(sm, 0, 1))
    LL = LR[..., 0]; CC = np.hypot(LR[..., 1], LR[..., 2]); LOC = nd.gaussian_filter(LL, 7)
    hh, ww = LL.shape
    yy, xx = np.mgrid[0:hh, 0:ww]
    # tratto a matita: scuro e poco colorato, oppure più scuro di quello che ha intorno (la riga sottile sotto l'occhio)
    ink_all = ((LL < 50) & (CC < 32)) | ((LL < 62) & (LL < LOC - 7) & (CC < 46))
    out = {}
    for nome, (cx, cy, rx, ry) in FEATS.items():
        roi = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
        ink = nd.binary_opening(ink_all & roi, structure=disk(1))
        if nome.startswith('occhio'):
            # l'occhio è un ovale: il suo contorno (il pezzo di tratto più grande) chiuso col suo involucro
            ink2 = nd.binary_closing(ink, structure=disk(3))
            lb, n = nd.label(ink2); sz = nd.sum(ink2, lb, range(1, n + 1))
            mk = convex_hull_image(lb == int(np.argmax(sz)) + 1)
            dist = nd.distance_transform_edt(mk)
            ys, xs = np.nonzero(mk)
            cl = np.full(mk.shape, '', object)
            P_ = np.array([PALL[q] for q in IRIDE])
            d = ((LS[ys, xs][:, None, :] - P_) ** 2).sum(-1)
            c = np.array(IRIDE, object)[d.argmin(1)]
            dark = ink[ys, xs]
            c[dark & (dist[ys, xs] <= 13)] = 'anello'          # il contorno
            c[dark & (dist[ys, xs] > 13)] = 'pupilla'
            c[(LL[ys, xs] > 84) & (CC[ys, xs] < 20)] = 'ew'      # la luce
            cl[ys, xs] = c
        elif nome == 'bocca':
            # la bocca aperta: il suo contorno chiuso col suo involucro (il tratto del sorriso resta fuori)
            ink2 = nd.binary_closing(ink, structure=disk(3))
            lb, n = nd.label(ink2); sz = nd.sum(ink2, lb, range(1, n + 1))
            mk = convex_hull_image(lb == int(np.argmax(sz)) + 1)
            dist = nd.distance_transform_edt(mk)
            ys, xs = np.nonzero(mk)
            cl = np.full(mk.shape, '', object)
            Ls = LS[ys, xs]
            c = np.where((Ls[:, 1] > 26) & (Ls[:, 0] > 54) & (Ls[:, 2] < 30), 'to', 'mo').astype(object)
            c[ink[ys, xs] & (dist[ys, xs] <= 9)] = 'anello'
            c[(LL[ys, xs] > 86) & (CC[ys, xs] < 16)] = 'ew'
            cl[ys, xs] = c
            # il sorriso: il tratto che esce dalla bocca
            riga = ink & ~mk & (yy < cy)
            cl[riga] = 'riga'
            mk = mk | riga
        else:                                                    # naso: il triangolino rosso
            mk = roi & (LS[..., 1] > 22) & (LL < 68)
            lb, n = nd.label(mk); sz = nd.sum(mk, lb, range(1, n + 1))
            mk = lb == int(np.argmax(sz)) + 1
            cl = np.full(mk.shape, '', object); cl[mk] = 'naso'
        ys, xs = np.nonzero(mk)
        out[nome] = dict(mask=mk, cls=cl, box=(ys.min(), ys.max() + 1, xs.min(), xs.max() + 1))
    tutto = np.zeros(m.shape, bool)
    for v in out.values(): tutto |= v['mask']
    out['escludi'] = nd.binary_dilation(tutto, structure=disk(6))            # il pelo intorno si calcola senza
    nolin = nd.binary_dilation(tutto, structure=disk(int(K * 1.4)))         # niente linee interne qui
    # dentro le orecchie il tratteggio della matita non diventa righe (resta il bordo, dove l'orecchio tocca la testa)
    for poly in (POLY_ORECCHIO_V, POLY_ORECCHIO_L):
        mm = np.zeros(m.shape, np.uint8); cv2.fillPoly(mm, [np.array(poly, np.int32)], 1)
        nolin |= nd.binary_erosion(mm > 0, structure=disk(int(K * 1.6)))
    out['senza_righe'] = nolin
    _VOLTO = out
    return out

_PX = {}
def volto_px():
    """occhi, bocca e naso del disegno ridotti a pixel (posizione di riposo): {nome: {(y, x): colore}} e le varianti a
    occhi mezzi chiusi e chiusi"""
    if _PX: return _PX
    V = volto_disegno()
    ys, xs = griglia()
    for nome in ('occhio_v', 'occhio_l', 'bocca', 'naso'):
        F = V[nome]; mk, cl = F['mask'], F['cls']; y0, y1, x0, x1 = F['box']
        i0 = int((y0 - OY) // K) - 1; i1 = int((y1 - OY) // K) + 2
        j0 = int((x0 - OX) // K) - 1; j1 = int((x1 - OX) // K) + 2
        cov = {}; fr = {}
        for i in range(i0, i1):
            for j in range(j0, j1):
                b = (slice(ys[i], ys[i + 1]), slice(xs[j], xs[j + 1]))
                mm = mk[b]
                if not mm.any(): continue
                cov[i, j] = mm.mean()
                v, c = np.unique(cl[b][mm], return_counts=True)
                fr[i, j] = dict(zip(v, c / mm.size))
        pix = {}
        if nome.startswith('occhio'):
            cov_t = 0.5 if nome == 'occhio_v' else 0.38
            ein = {k for k, c in cov.items() if c >= cov_t}
            bordo = {k for k in ein if any((k[0] + di, k[1] + dj) not in ein for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)))}
            for k in ein:
                f = fr[k]; scuro = f.get('anello', 0) + f.get('pupilla', 0); luce = f.get('ew', 0)
                if luce >= (0.40 if k in bordo else 0.25): pix[k] = 'ew'                    # la luce
                elif k in bordo: pix[k] = 'ek' if (scuro >= 0.2 or (k[0] - 1, k[1]) not in ein) else 'e0'   # contorno (sotto più chiaro)
                elif f.get('pupilla', 0) >= 0.4: pix[k] = 'e0'                              # la pupilla
                elif f.get('anello', 0) >= 0.6: pix[k] = 'ek'                               # la palpebra spessa in alto
                else: pix[k] = max(IRIDE, key=lambda q: f.get(q, 0))                         # l'iride
            # nessun occhio senza luce: se manca, il pixel dove il disegno ne ha di più
            if 'ew' not in pix.values():
                k = max(ein, key=lambda k: fr[k].get('ew', 0))
                if fr[k].get('ew', 0) > 0.08: pix[k] = 'ew'
            _PX[nome] = pix
            _PX[nome + '_chiuso'], _PX[nome + '_mezzo'] = palpebre(pix)
        elif nome == 'bocca':
            ein = {k for k, c in cov.items() if c - fr[k].get('riga', 0) >= 0.4}       # la bocca, senza il tratto del sorriso
            bordo = {k for k in ein if any((k[0] + di, k[1] + dj) not in ein for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)))}
            for k in ein:
                f = fr[k]
                if f.get('ew', 0) >= 0.4: pix[k] = 'ew'
                elif k in bordo and f.get('anello', 0) + f.get('riga', 0) >= 0.15: pix[k] = 'ek'
                elif f.get('anello', 0) >= 0.5: pix[k] = 'ek'
                else: pix[k] = 'to' if f.get('to', 0) > f.get('mo', 0) else 'mo'
            for k, f in fr.items():                            # il sorriso fuori dalla bocca
                if k not in pix and f.get('riga', 0) >= 0.22: pix[k] = 'ek'
            _PX[nome] = pix
        else:
            best = max(fr, key=lambda k: fr[k].get('naso', 0))
            for k, f in fr.items():
                if f.get('naso', 0) >= 0.3 or k == best: pix[k] = 'r2'
            _PX[nome] = pix
    return _PX

def palpebre(pix):
    """dall'occhio aperto: chiuso (la riga della palpebra in basso, seguendo l'ovale) e a metà (la palpebra scende sulla
    parte alta, sotto resta l'occhio)"""
    rows = sorted({k[0] for k in pix}); top, bot = rows[0], rows[-1]
    cols = sorted({k[1] for k in pix})
    chiuso = {}
    fondo = [(max(k[0] for k in pix if k[1] == j), j) for j in cols]     # la palpebra chiusa sta sulla riga di sotto dell'ovale
    fondo = [q for q in fondo if q[0] >= top + 0.6 * (bot - top)]           # solo la parte bassa (niente ganci ai lati)
    for (y0, x0), (y1, x1) in zip(fondo, fondo[1:] + fondo[-1:]):
        n = max(abs(y1 - y0), abs(x1 - x0), 1)
        for s in range(n + 1):                       # pezzi uniti, senza buchi
            chiuso[int(round(y0 + (y1 - y0) * s / n)), int(round(x0 + (x1 - x0) * s / n))] = 'ek'
    taglio = top + int(round((bot - top) * 0.45))
    mezzo = {}
    for k, c in pix.items():
        if k[0] > taglio: mezzo[k] = c
    for j in cols:
        if (taglio, j) in pix or (taglio + 1, j) in pix: mezzo[taglio, j] = 'ek'
    return chiuso, mezzo

# ------------------------------------------------------------------ dal disegno ai campi
_SRC = {}
SIG = 0.7
LINE_T = 1.1
LINE_MIN = 4
_GRID = None
def campi(warp=None, key=None):
    """dal disegno (eventualmente deformato): sagoma, scala di fuoco lisciata, tratti scuri, parti del corpo.
    warp(Y, X) -> (dx, dy): di quanto si sposta ogni punto del disegno (pixel del disegno)"""
    global _GRID
    if key is not None and key in _SRC: return _SRC[key]
    a, sm, m, e = P.source()
    V = volto_disegno(); escl = V['escludi']; nolin = V['senza_righe']
    parts = parti_disegno()
    if warp is not None:
        if _GRID is None: _GRID = np.mgrid[0:m.shape[0], 0:m.shape[1]].astype(np.float32)
        Y, X = _GRID
        dx, dy = warp(Y, X)
        mx, my = (X - dx).astype(np.float32), (Y - dy).astype(np.float32)
        rm = lambda im, it: cv2.remap(im, mx, my, it, borderMode=cv2.BORDER_REPLICATE)
        sm = rm(sm, cv2.INTER_LINEAR); a = rm(a, cv2.INTER_LINEAR)
        m = cv2.remap(m.astype(np.float32), mx, my, cv2.INTER_LINEAR) > 0.5
        escl = cv2.remap(escl.astype(np.uint8), mx, my, cv2.INTER_NEAREST) > 0
        nolin = cv2.remap(nolin.astype(np.uint8), mx, my, cv2.INTER_NEAREST) > 0
        parts = cv2.remap(parts, mx, my, cv2.INTER_NEAREST)
    ys, xs = np.nonzero(m)
    lab = rgb2lab(np.clip(sm[ys, xs][None], 0, 1))[0]
    t = np.zeros(m.shape, np.float32); t[ys, xs] = scala_t(lab)[0]
    lum = a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11
    loc = nd.gaussian_filter(lum, 8)
    ink = m & (lum < 0.40) & (lum < loc - 0.07)
    wgt = (m & ~ink & ~escl).astype(np.float32)
    s = SIG * K
    den = nd.gaussian_filter(wgt, s)
    tt = nd.gaussian_filter(t * wgt, s) / np.maximum(den, 1e-6)
    # dentro gli occhi e la bocca (lontano dal pelo) il pelo arriva da più lontano: niente macchie quando gli occhi si chiudono
    den2 = nd.gaussian_filter(wgt, 3.5 * s)
    tt2 = nd.gaussian_filter(t * wgt, 3.5 * s) / np.maximum(den2, 1e-6)
    al = np.clip(den / 0.25, 0, 1)
    tt = al * tt + (1 - al) * tt2
    out = dict(a=a, m=m, tt=tt.astype(np.float32), ink=ink & ~nolin, parts=parts)
    if key is not None: _SRC[key] = out
    return out

def blocchi(img, msk):
    """media di img sui pixel di msk in ogni blocco, e quanto il blocco è coperto da msk"""
    h, w = msk.shape
    ys, xs = griglia()
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

def blocchi_moda(lbl, msk, n):
    """in ogni blocco l'etichetta più presente tra i pixel di msk"""
    h, w = msk.shape
    ys, xs = griglia()
    out = np.zeros((H, W), np.uint8)
    for i in range(H):
        y0, y1 = max(ys[i], 0), min(ys[i + 1], h)
        if y1 <= y0: continue
        for j in range(W):
            x0, x1 = max(xs[j], 0), min(xs[j + 1], w)
            if x1 <= x0: continue
            mm = msk[y0:y1, x0:x1]
            if mm.any(): out[i, j] = np.bincount(lbl[y0:y1, x0:x1][mm], minlength=n + 1).argmax()
    return out

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
                    best = v[np.argmax(c * 10 - np.abs(v - idx[y, x]))]     # tra due toni vicini resta quello più vicino al suo
                    idx[y, x] = best; ch += 1
        if not ch: break
    return idx

def sprite(warp=None, key=None, shift=0.0):
    """il disegno (deformato) ridotto a pixel: toni, sagoma, linee interne, parti del corpo (senza contorno né muso)"""
    C = campi(warp, key)
    tm, cov = blocchi(C['tt'], C['m'])
    op = cov >= 0.45
    # i buchi piccoli (la luce bianca degli occhi del disegno) si chiudono; restano aperti quelli grandi (tra le zampe)
    hl, hn = nd.label(nd.binary_fill_holes(op) & ~op)
    for c in range(1, hn + 1):
        if (hl == c).sum() <= 6: op[hl == c] = True
    op[:2, :] = op[-2:, :] = False; op[:, :2] = op[:, -2:] = False
    idx = np.clip(np.round(tm + shift), 0, len(SCALA) - 1).astype(int)
    idx = pulisci(idx, op)
    # linee interne: i tratti scuri più lunghi del disegno, sottili un pixel
    sk = skeletonize(C['ink'])
    fr, _ = blocchi(sk.astype(np.float32), np.ones_like(C['m']))
    line = skeletonize((fr * K > LINE_T) & op)             # un tratto che attraversa almeno LINE_T del blocco
    lb, n = nd.label(line, structure=np.ones((3, 3)))
    for c in range(1, n + 1):
        if (lb == c).sum() < LINE_MIN: line[lb == c] = False
    parts = blocchi_moda(C['parts'], C['m'], 5)
    # i buchi chiusi (la luce degli occhi nel disegno) prendono la parte che hanno intorno
    for _ in range(3):
        vuoti = op & (parts == 0)
        if not vuoti.any(): break
        near = nd.grey_dilation(parts, size=(3, 3)); parts[vuoti] = near[vuoti]
    parts[op & (parts == 0)] = CORPO
    # il giallo più chiaro solo nelle fiamme (coda e cresta): sul pelo sembrava una macchia di luce
    idx[(idx == len(SCALA) - 1) & ~np.isin(parts, (CODA, CRESTA))] = len(SCALA) - 2
    return dict(idx=idx, op=op, line=line, parts=parts)

# ------------------------------------------------------------------ parti spostate a pixel interi, contorno rifatto
def componi(S, spost):
    """sposta ogni parte del corpo di (dx, dy) pixel interi, da dietro a davanti; i buchi rimasti dentro la sagoma prendono il
    tono del pelo vicino"""
    idx = np.zeros((H, W), int); op = np.zeros((H, W), bool); line = np.zeros((H, W), bool); parts = np.zeros((H, W), np.uint8)
    for p in ORDINE:
        dx, dy = spost.get(p, (0, 0))
        ys, xs = np.nonzero(S['op'] & (S['parts'] == p))
        y2, x2 = ys + dy, xs + dx
        ok = (y2 >= 2) & (y2 < H - 2) & (x2 >= 2) & (x2 < W - 2)
        ys, xs, y2, x2 = ys[ok], xs[ok], y2[ok], x2[ok]
        idx[y2, x2] = S['idx'][ys, xs]; op[y2, x2] = True; line[y2, x2] = S['line'][ys, xs]; parts[y2, x2] = p
    buchi = nd.binary_fill_holes(op) & ~op
    hl, hn = nd.label(buchi)
    for c in range(1, hn + 1):
        if (hl == c).sum() > 12: buchi[hl == c] = False      # i vuoti grandi (tra le zampe) restano vuoti
    k3 = np.ones((3, 3))
    have = op & ~line
    val = np.where(have, idx, 0).astype(float)
    for _ in range(6):
        miss = buchi & ~have
        if not miss.any(): break
        s_ = nd.convolve(val * have, k3, mode='constant'); c_ = nd.convolve(have.astype(float), k3, mode='constant')
        new = miss & (c_ > 0)
        val[new] = s_[new] / c_[new]; have |= new
    idx[buchi] = np.clip(np.round(val[buchi]), 0, len(SCALA) - 1).astype(int); op |= buchi
    # le parti dei buchi: dalla parte vicina
    if buchi.any():
        near = nd.grey_dilation(parts, size=(3, 3)); parts[buchi] = near[buchi]
    return dict(idx=idx, op=op, line=line, parts=parts)

def colora(S):
    """toni, linee interne e contorno: rosso scurissimo vicino alle fiamme e alle calze, marrone scuro vicino al pelo"""
    idx, op, line = S['idx'], S['op'], S['line']
    lab = np.empty((H, W), object); lab[:] = None
    for i, q in enumerate(SCALA): lab[(idx == i) & op] = q
    edge = op & ~nd.binary_erosion(op, structure=N4)
    for y, x in zip(*np.nonzero(line & ~edge)):
        lab[y, x] = 'r4' if idx[y, x] <= 3 else 'il'
    for y, x in zip(*np.nonzero(edge)):
        nb = [idx[y + dy, x + dx] for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)) if 0 <= y + dy < H and 0 <= x + dx < W and op[y + dy, x + dx]]
        lab[y, x] = 'r4' if (nb and np.mean(nb) <= 3.2) else 'ol'
    return lab, edge

def volto(lab, op, off=(0, 0), occhi='aperti'):
    """il muso del disegno incollato dove sta la testa (spostata di off pixel interi)"""
    V = volto_px()
    dx, dy = off
    nomi = ['naso', 'bocca']
    suf = {'aperti': '', 'mezzi': '_mezzo', 'chiusi': '_chiuso'}[occhi]
    nomi += ['occhio_l' + suf, 'occhio_v' + suf]
    for nome in nomi:
        for (i, j), c in V[nome].items():
            y, x = i + dy, j + dx
            if 0 <= y < H and 0 <= x < W and op[y, x]: lab[y, x] = c

def occhi_zona(off=(0, 0)):
    """i pixel occupati dagli occhi aperti (per ripulirli quando si chiudono)"""
    V = volto_px(); s = set()
    for nome in ('occhio_v', 'occhio_l'):
        for (i, j) in V[nome]: s.add((i + off[1], j + off[0]))
    return s

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
    S = sprite(key='base')
    lab, edge = colora(S)
    volto(lab, S['op'])
    render(lab, S['op'], 6, (40, 46, 58, 255)).save(sys.argv[1] if len(sys.argv) > 1 else '_pulito.png')
