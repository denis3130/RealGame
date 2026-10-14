"""Gli sprite della lotta in pixel art pulita, 80x80, come nello screenshot di riferimento di Denis (pixel grossi, pochi toni):
- davanti (l'avversario): dal disegno (pulito.py), fermo di 4 fotogrammi a 6 al secondo (coda e cresta che fiammeggiano, la testa
  e il petto che scendono di un pixel col respiro, braci che salgono) più un fotogramma a occhi chiusi da mettere ogni tanto;
- di spalle (il proprio Niumon, in primo piano): visto dalla parte opposta la sagoma è la stessa del disegno, specchiata; dentro
  si ridipinge quello che cambia: la nuca al posto del muso (pelo con la luce in alto e le lingue della cresta che scendono), il
  dietro delle orecchie, il petto chiaro che non si vede. Stessa animazione.
Uso: python3 lotta80.py [cartella]   -> lotta_davanti.png/.json e lotta_spalle.png/.json"""
import numpy as np, cv2, os, sys, json
from PIL import Image
from scipy import ndimage as nd
import pulito as Q

N, FPS = 4, 6
RESPIRO = [0, 1, 1, 0]
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'solo2d')
W = H = Q.W

def warp_fermo(t, breath):
    def warp(sm, m, e, a):
        h, w = m.shape
        Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
        ph = 2 * np.pi * t
        wt = np.clip((790 - Y) / 560, 0, 1) ** 1.4 * (X > 770)                     # coda: ferma alla base
        wc = np.clip((420 - Y) / 240, 0, 1) ** 1.3 * ((X > 300) & (X < 640))       # cresta: ferma sulla fronte
        dx = wt * (9 * np.sin(Y / 70 - ph) + 4 * np.sin(Y / 31 - 2 * ph + 1)) + wc * (6 * np.sin(Y / 40 - ph + 2))
        dy = wt * (5 * np.sin(X / 60 + ph)) + wc * (3 * np.sin(X / 35 + ph))
        dy = dy + breath * Q.K * np.clip((930 - Y) / 290, 0, 1)                      # respiro: le zampe restano giù
        mx, my = X - dx, Y - dy
        sm2 = cv2.remap(sm, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        m2 = cv2.remap(m.astype(np.float32), mx, my, cv2.INTER_LINEAR) > 0.5
        a2 = cv2.remap(a, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        return sm2, m2, e, a2
    return warp

# ------------------------------------------------------------------ dettagli a grandezza di sprite (coordinate del disegno)
DITA = [((265, 965), (265, 995)), ((292, 962), (292, 992)),            # zampa davanti lontana (allungata)
        ((418, 1045), (418, 1078)), ((448, 1045), (448, 1078)),        # zampa davanti vicina
        ((612, 955), (612, 988)), ((640, 955), (640, 988)),            # zampa dietro lontana
        ((852, 965), (852, 1005)), ((882, 965), (882, 1005))]          # zampa dietro vicina
BRACI = [((1028, 212), 1.0), ((1103, 372), 0.0), ((412, 205), 0.5), ((1060, 735), 0.25)]   # dal disegno: dove nascono

def dita(lab, op):
    for (x0, y0), (x1, y1) in DITA:
        a = np.array(Q.to_sprite(x0, y0)); b = np.array(Q.to_sprite(x1, y1))
        n = int(np.ceil(np.abs(b - a).max())) + 1
        for k in range(n):
            q = a + (b - a) * k / max(n - 1, 1)
            y, x = int(q[1]), int(q[0])
            if 0 <= y < H and 0 <= x < W and op[y, x] and lab[y, x] in ('r0', 'r1', 'r2', 'o1'):
                lab[y, x] = 'r3'

def braci(lab, op, t, mirror=False):
    """braci che salgono piano e cambiano colore; mai sopra la volpe"""
    for (x0, y0), off in BRACI:
        sx, sy = Q.to_sprite(x0, y0)
        if mirror: sx = W - 1 - sx
        k = (t + off) % 1.0
        y = int(round(sy - 3 * k)); x = int(round(sx + 0.8 * np.sin(2 * np.pi * (k + off))))
        big = k < 0.6
        pts = [((0, 0), 'y1' if big else 'o0'), ((0, 1), 'r1')] + ([((1, 0), 'o0'), ((0, -1), 'r0')] if big else [])
        for (dx, dy), c in pts:
            yy, xx = y + dy, x + dx
            if 2 <= yy < H - 2 and 2 <= xx < W - 2 and not op[yy, xx]:
                lab[yy, xx] = c; op[yy, xx] = True

def fronte(i, blink=False):
    t = i / N; b = RESPIRO[i]
    lab, op = Q.sprite(warp=warp_fermo(t, b), key=('f', i), xf=np.array([[1, 0, 0], [0, 1, b * Q.K]], float), blink=blink)
    dita(lab, op)
    op = op.copy(); braci(lab, op, t)
    return lab, op

# ------------------------------------------------------------------ di spalle
def poli(pts, dy=0.0):
    """poligono del disegno -> maschera nello sprite specchiato"""
    q = np.array([Q.to_sprite(x, y) for x, y in pts]); q[:, 1] += dy
    q[:, 0] = W - 1 - q[:, 0] + 0.5
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [np.round(q * 8).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=3)
    return m > 0

MUSO = [(310, 470), (390, 485), (460, 492), (535, 482), (590, 470), (630, 530), (650, 590), (635, 640), (590, 680), (540, 705),
        (450, 740), (365, 745), (300, 700), (255, 640), (245, 580), (260, 520)]
ORECCHIO_V = [(700, 255), (725, 390), (710, 470), (675, 560), (630, 590), (590, 475), (575, 420), (620, 340)]
ORECCHIO_L = [(300, 240), (355, 370), (350, 470), (310, 475), (260, 520), (240, 490), (245, 390)]
PETTO = [(345, 755), (495, 740), (510, 840), (460, 910), (380, 880), (340, 820)]
# punte della cresta che scendono sulla nuca: (posizione lungo la testa 0..1, quanto scendono in pixel, larghezza 0..1)
LINGUE = [(0.18, 5.0, 0.13), (0.42, 6.5, 0.14), (0.66, 4.5, 0.12)]

def spalle(i):
    t = i / N; b = RESPIRO[i]
    lab, op, idx = Q.sprite(warp=warp_fermo(t, b), key=('f', i), muso=False, full=True)
    lab = lab[:, ::-1].copy(); op = op[:, ::-1].copy(); idx = idx[:, ::-1].copy()
    outer = op & ~nd.binary_erosion(op, structure=Q.N4)
    inner = op & ~outer
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    # la nuca: pelo con la luce in alto a destra (la luce del disegno, specchiata), più scuro verso il collo
    mu = poli(MUSO, b) & inner
    ys, xs = np.nonzero(mu)
    cx, cy = xs.mean(), ys.min() + 0.42 * np.ptp(ys); rx, ry = np.ptp(xs) / 2 + 1, np.ptp(ys) / 2 + 1
    u = (xx - cx) / rx; v = (yy - cy) / ry
    d = nd.distance_transform_edt(np.pad(op, 1))[1:-1, 1:-1]
    sh = 0.52 + 0.20 * u - 0.30 * v - 0.10 * np.clip(v, 0, 1) ** 2
    sh += 0.16 * (d <= 1.5) * (u > -0.2) * (v < 0.2)                   # filo di luce sul bordo in alto a destra
    tono = np.where(sh < 0.26, 3, np.where(sh < 0.42, 4, np.where(sh < 0.64, 5, 6)))
    for y, x in zip(ys, xs): lab[y, x] = Q.SCALA[tono[y, x]]; idx[y, x] = tono[y, x]
    # la cresta vista da dietro copre la parte alta della testa e scende a lingue (all'indietro, verso di noi e a sinistra)
    x_min, x_max = xs.min(), xs.max(); hh = np.ptp(ys) + 1
    top = np.full(W, -1)
    for x in range(x_min, x_max + 1):
        c = np.nonzero(mu[:, x])[0]
        if len(c): top[x] = c.min()
    cover = np.zeros((H, W), bool)
    for x in range(x_min, x_max + 1):
        if top[x] < 0: continue
        f = (x - x_min) / max(x_max - x_min, 1)
        ln = hh * 0.30
        for (fc, a_, wd) in LINGUE:                        # punte che scendono
            ln += a_ * max(0.0, 1 - abs(f - fc) / wd) ** 1.6
        ln -= 2.0 * f                                      # verso destra (il muso, lontano) la cresta copre meno
        for y in range(top[x], min(H, int(top[x] + ln + 0.5))):
            if mu[y, x]: cover[y, x] = True
    # bordo in basso della cresta: rosso; dentro dal rosso arancio all'arancio
    lower = cover & ~np.vstack([cover[1:], np.zeros((1, W), bool)])
    dist = nd.distance_transform_edt(np.pad(cover, 1))[1:-1, 1:-1]
    for y, x in zip(*np.nonzero(cover)):
        dl = 0
        while y - dl - 1 >= 0 and cover[y - dl - 1, x] and not lower[y, x] and dl < 9: dl += 1
        # distanza dal bordo in basso (contando in su dalla punta)
        db = 0
        while y + db + 1 < H and cover[y + db + 1, x]: db += 1
        lab[y, x] = 'r1' if db == 0 else ('r0' if db <= 2 else ('o1' if db <= 4 else 'o0'))
    # il dietro delle orecchie: niente rosso scuro di dentro, pelo rosso arancio col bordo più scuro
    for P_ in (ORECCHIO_V, ORECCHIO_L):
        em = poli(P_, b) & inner
        de = nd.distance_transform_edt(np.pad(em | ~op, 1))[1:-1, 1:-1]
        dd = nd.distance_transform_edt(np.pad(op, 1))[1:-1, 1:-1]
        for y, x in zip(*np.nonzero(em)):
            if idx[y, x] <= 2 or lab[y, x] in ('r4', 'il', 'r3', 'r2'):
                c = 'r1' if dd[y, x] <= 1.5 else ('r0' if dd[y, x] <= 3 else 'o1')
                lab[y, x] = c
    # il petto chiaro non si vede da dietro
    pe = poli(PETTO, b) & inner
    for y, x in zip(*np.nonzero(pe)):
        if lab[y, x] in ('y1', 'y0'): lab[y, x] = 'o0'
        elif lab[y, x] == 'il': lab[y, x] = 'o1'
    op = op.copy(); braci(lab, op, t, mirror=True)
    return lab, op

def foglio(frames, name, meta):
    ims = [np.asarray(Q.render(l, o)) for l, o in frames]
    a = np.concatenate(ims, 1)
    Image.fromarray(a, 'RGBA').save(os.path.join(OUT, name + '.png'))
    al = np.stack([im[..., 3] > 0 for im in ims])
    edge = bool(al[:, :2].any() or al[:, -2:].any() or al[:, :, :2].any() or al[:, :, -2:].any())
    json.dump(meta, open(os.path.join(OUT, name + '.json'), 'w'), indent=1, ensure_ascii=False)
    return edge

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    px, py = Q.to_sprite(*Q.PIVOT_SRC)
    piv = [int(round(px)), int(round(py))]
    comune = dict(category='creature_battle', frame_width=W, frame_height=H, fps=FPS, loop=True, pivot=piv, anchor=piv, w=W, h=H,
                  source='disegno di Denis (13 ottobre): pixel art pulita come lo screenshot della lotta', version='0.6-pixel-pulita',
                  status='da approvare', scala_consigliata='avversario 1x, il tuo 3x (pixel grossi come nello screenshot)')
    f = [fronte(i) for i in range(N)] + [fronte(0, blink=True)]
    e1 = foglio(f, 'lotta_davanti', dict(asset_id='creature_volpefuoco_battle_front_idle', animation='idle', direction='front',
                                          frames=N + 1, n=N + 1, giro=N, occhi_chiusi=N, **comune))
    piv_s = [W - 1 - piv[0], piv[1]]
    s = [spalle(i) for i in range(N)]
    c2 = dict(comune); c2.update(pivot=piv_s, anchor=piv_s)
    e2 = foglio(s, 'lotta_spalle', dict(asset_id='creature_volpefuoco_battle_back_idle', animation='idle', direction='back',
                                         frames=N, n=N, giro=N, **c2))
    print('davanti', 'TOCCA IL BORDO' if e1 else 'ok', '| spalle', 'TOCCA IL BORDO' if e2 else 'ok')
