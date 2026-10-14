"""La volpe di fuoco come burattino 2D: pose (fermo, corsa) e disegno di un fotogramma in una direzione."""
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage as nd
from burattino import *

HS = 1.14; KB = 3.0
HEAD_C = np.array((21.5, 0, 52.5)); HEAD_R = (14.0 * HS, 16.0 * HS, 15.5 * HS)

# sagoma della coda (dal disegno di Denis, già portata nel piano del corpo: vedi ../fai/sagome.py)
_TAIL = None
def tail_contour():
    global _TAIL
    if _TAIL is None:
        g = np.asarray(Image.open(os.path.join(HERE, '..', 'fai', 'coda_sagoma.png'))) > 127   # in alto = z grande
        g = nd.binary_opening(g, iterations=2)
        cs, _ = cv2.findContours(g.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = max(cs, key=cv2.contourArea)[:, 0, :].astype(float)
        c = c[::3]
        nv = g.shape[0]
        x = -62.0 + c[:, 0] * 0.25 + KB; z = 8.0 + (nv - 1 - c[:, 1]) * 0.25
        _TAIL = np.stack([x, z], 1)
    return _TAIL

def pose(p, mode='corsa'):
    """tutto in funzione di p (0..1): l'ultimo fotogramma si collega al primo"""
    t = 2 * np.pi * p
    P = {}
    if mode == 'corsa':
        P['bob'] = 2.4 * (0.5 + 0.5 * np.cos(2 * t - 0.6))
        P['pitch'] = np.radians(8) * np.sin(t)
        legs = {}
        for side, off in ((1, 0.0), (-1, 0.07)):
            a = t + 2 * np.pi * off
            legs[('f', side)] = (np.radians(55) * np.sin(a), np.radians(95) * max(0.0, np.cos(a)))
            b = t + np.pi + 2 * np.pi * off
            legs[('h', side)] = (np.radians(50) * np.sin(b), np.radians(80) * max(0.0, np.cos(b)))
        P['legs'] = legs
        P['ear'] = np.radians(10) * (0.7 + 0.3 * np.sin(t))
        P['tail_lean'] = np.radians(-10) + np.radians(4) * np.sin(t + 1)
        P['head_pitch'] = -P['pitch'] * 0.7
    else:
        P['bob'] = 0.25 * (0.5 - 0.5 * np.cos(t)); P['pitch'] = 0.0
        P['legs'] = {(k, s): (0.0, 0.0) for k in 'fh' for s in (1, -1)}
        P['ear'] = 0.0; P['tail_lean'] = np.radians(2) * np.sin(t); P['head_pitch'] = 0.0
    P['flick'] = p
    return P

def body_xf(P):
    """trasformazione del corpo (beccheggio intorno al centro, poi su e giù)"""
    C = np.array((1.0, 0, 21.0)); R = roty(P['pitch'])
    return lambda q: C + R @ (np.asarray(q, float) - C) + np.array((0, 0, P['bob']))

def head_turn(theta):
    """nelle viste davanti e di lato la testa si gira un poco verso di noi (come nel disegno), da dietro no"""
    t = (theta + 180) % 360 - 180
    return np.radians(np.sign(t) * float(np.interp(abs(t), [0, 45, 90, 125, 180], [0, 18, 8, 0, 0])))

def head_xf(P):
    B = body_xf(P); piv = np.array((17.0, 0, 34.0)); R = roty(P['pitch'] + P['head_pitch']) @ rotz(P.get('yaw', 0.0))
    return lambda q: B(piv) + R @ (HEAD_C + HS * np.asarray(q, float) - piv) if True else None

def frame(theta, p=0.0, mode='corsa', size=64, upp=1.82, pivot=(32, 56), SS=6):
    v = View(theta, size=size, upp=upp, pivot=pivot, SS=SS)
    cv = Canvas(v); P = pose(p, mode); P['yaw'] = head_turn(theta); B = body_xf(P); Hx = head_xf(P)
    parts = []                                              # (profondità, funzione che disegna)
    def add(key, fn): parts.append((key, len(parts), fn))
    fl = P['flick'] * 2 * np.pi
    # ---- zampe
    LEG = {'f': dict(J=(12.5, 6.0, 15.0), L1=6.5, L2=6.2, r1=3.4, r2=2.9, back=-1),
           'h': dict(J=(-10.5 + KB, 5.8, 15.5), L1=7.0, L2=6.2, r1=3.5, r2=2.9, back=1)}
    for (k, s), (a, b) in P['legs'].items():
        d = LEG[k]; J = np.array(d['J']) * np.array((1, s, 1))
        def leg(J=J, a=a, b=b, d=d, k=k, s=s):
            Jw = B(J)
            u1 = np.array((np.sin(a), 0, -np.cos(a)))
            K = Jw + d['L1'] * u1
            a2 = a + d['back'] * b * (-1 if k == 'f' else 1) * (1 if k == 'h' else 1)
            a2 = a - b if k == 'f' else a + b
            u2 = np.array((np.sin(a2), 0, -np.cos(a2)))
            Pw = K + d['L2'] * u2
            Pc = Pw + np.array((1.2, 0, -0.4))
            jw, kw, pw = v.P(Jw), v.P(K), v.P(Pw)
            segs = [(jw, kw, v.L(d['r1'])), (kw, pw, v.L(d['r2']))]
            m = cv.mask_caps(segs)
            if k == 'h':      # coscia
                m |= cv.mask_poly(ellipse_pts(v, B(np.array((-10.0 + KB, 6.0 * s, 17.0))), (6.2, 3.6, 7.2), roty(-P['pitch'])))
            paw = cv.mask_poly(ellipse_pts(v, Pc, (3.4, 2.8, 2.0)))
            m |= paw
            far = (np.array((0, s, 0)) @ v.c) < -0.05
            cv.put(m, FUR, 'zampa_%s%s%s' % (k, 'L' if s > 0 else 'R', '_lontana' if far else ''))
            # calza rossa: dalla metà della parte bassa in giù, e la zampa
            mid = kw + (pw - kw) * 0.35
            sock = (cv.mask_caps([(mid, pw, v.L(d['r2']))]) | paw) & m
            reg = cv.nreg
            cv.mat[sock] = SOCK
        add(('leg', k, s), leg)
    # ---- corpo
    def body():
        m = cv.mask_poly(ellipse_pts(v, B((1.0, 0, 21.0)), (16.5, 8.0, 8.6), roty(-P['pitch'])))
        m |= cv.mask_poly(ellipse_pts(v, B((14.0, 0, 26.0)), (7.5, 6.8, 8.5), roty(-P['pitch'])))      # petto e collo
        cv.put(m, FUR, 'corpo')
    add(('body',), body)
    # ---- ciuffo di fiamma sulla schiena
    def tuft():
        m = np.zeros(cv.mat.shape, bool)
        for i, (x, z, L) in enumerate([(3, 28.5, 7.0), (-4, 28.5, 8.5), (-10.5, 27.5, 6.5)]):
            b0 = np.array((x, 0, z)); d = nrm((-0.5, 0, 1)); wob = 0.6 * np.sin(fl + i * 1.7)
            pts = [B(b0), B(b0 + d * L * 0.5 + (wob * 0.3, 0, 0)), B(b0 + nrm(d + (-0.6, 0, 0.1)) * L + (wob, 0, 0))]
            m |= cv.mask_poly(stroke_pts(v, pts, [2.4, 1.5, 0.05]))
        cv.put(m, FLAME, 'ciuffo')
    add(('tuft',), tuft)
    # ---- coda: la sagoma del disegno, sempre un po' larga anche vista da dietro
    def tail():
        tc = tail_contour().copy()
        xb, zb = -18.0 + KB, 25.0
        w = np.clip((tc[:, 1] - 30) / 50, 0, 1) ** 1.2
        tc[:, 0] += w * (1.3 * np.sin(tc[:, 1] / 7.0 - fl) + 0.5 * np.sin(tc[:, 1] / 3.2 - 2 * fl + 1))
        tc[:, 1] += w * (0.9 * np.sin(tc[:, 0] / 6.0 + fl))
        # inclinazione nella corsa
        ang = P['tail_lean']; dx, dz = tc[:, 0] - xb, tc[:, 1] - zb
        tc = np.stack([xb + dx * np.cos(ang) - dz * np.sin(ang), zb + dx * np.sin(ang) + dz * np.cos(ang)], 1)
        pts3 = np.stack([tc[:, 0], np.zeros(len(tc)), tc[:, 1]], 1)
        pw = np.array([B(q) for q in pts3])
        base = B((xb, 0, zb))
        scr = v.P(pw); sb = v.P(base)
        rx = v.r[0]; k = np.sign(rx if abs(rx) > 1e-3 else 1.0) * max(abs(rx), 0.55)
        # x sullo schermo: come se la coda fosse un poco girata verso di noi (mai di taglio)
        scr[:, 0] = sb[0] + (pw[:, 0] - base[0]) * k / v.upp * v.SS + (pw[:, 1] - base[1]) * v.r[1] / v.upp * v.SS
        cv.put(cv.mask_poly(scr), FLAME, 'coda')
    add(('tail',), tail)
    # ---- gorgiera
    def ruff():
        m = cv.mask_poly(ellipse_pts(v, B((21.5, 0, 28.5)), (5.6, 10.2, 7.6), roty(-P['pitch'])))
        for aa in np.radians([-78, -54, -30, -8, 14, 36, 58, 80]):
            b0 = B((21.5 + 4.5 * np.cos(aa), 9.0 * np.sin(aa), 23.5))
            tip = B((21.5 + 6.5 * np.cos(aa), 11.0 * np.sin(aa), 17.0))
            m |= cv.mask_poly(stroke_pts(v, [b0, (b0 + tip) / 2, tip], [2.4, 1.4, 0.05]))
        for s in (1, -1):
            for (b0, tip) in [((18.5, 10.0 * s, 26.0), (13.5, 15.0 * s, 21.5)), ((20.0, 11.5 * s, 31.0), (18.0, 17.5 * s, 27.0))]:
                m |= cv.mask_poly(stroke_pts(v, [B(b0), B(tip)], [2.2, 0.05]))
        cv.put(m, RUFF, 'gorgiera')
    add(('ruff',), ruff)
    # ---- testa
    hd = v.depth(Hx((0, 0, 0)))
    def cheeks():
        m = np.zeros(cv.mat.shape, bool)
        for s in (1, -1):
            for (b0, tip, w0) in [((2.0, 15.0 * s, -8.5), (0.0, 20.5 * s, -12.5), 2.0), ((0.5, 16.2 * s, -3.0), (-1.5, 21.5 * s, -4.5), 1.9),
                                  ((-1.0, 16.6 * s, 2.0), (-3.5, 21.0 * s, 2.5), 1.6)]:
                m |= cv.mask_poly(stroke_pts(v, [Hx(b0), Hx(tip)], [w0, 0.05]))
        cv.put(m, FUR, 'guance')
    add(('cheeks',), cheeks)
    def head():
        R = roty(P['pitch'] + P['head_pitch'])
        m = cv.mask_poly(ellipse_pts(v, Hx((0, 0, 0)), HEAD_R, R.T))
        m |= cv.mask_poly(ellipse_pts(v, Hx((11.5, 0, -8.8)), (4.6, 5.4, 4.0), R.T))      # musetto (si vede di lato)
        cv.put(m, FUR, 'testa')
    add(('head',), head)
    # orecchie
    for s in (1, -1):
        Bh = np.array((-2.5, 12.5 * s, 8.5)); Th = Bh + 1.12 * (np.array((-11.0, 25.5 * s, 30.5)) - Bh)
        Th = Th + np.array((-6.0, 0, -2.0)) * (P['ear'] / np.radians(10) if P['ear'] else 0) * 0.5
        def ear(Bh=Bh, Th=Th, s=s):
            Bw, Tw = Hx(Bh), Hx(Th)
            U = nrm(Tw - Bw); Wf = nrm(roty(P['pitch'] + P['head_pitch']) @ rotz(P.get('yaw', 0.0)) @ np.array((0.85, 0.5 * s, 0.15)))
            V = nrm(np.cross(U, Wf)) * s
            if V[1] * s < 0: V = -V
            w = 10.4 * 0.6 * HS
            pb, pt = v.P(Bw), v.P(Tw)
            pv = (v.P(Bw + V * w) - pb)
            axis = (pt - pb) / (np.linalg.norm(pt - pb) + 1e-9); perp = np.array([-axis[1], axis[0]])
            hw = max(abs(pv @ perp), v.L(w) * 0.62)
            sgn = np.sign(pv @ perp) if abs(pv @ perp) > 1e-6 else 1.0
            out_side = perp * sgn                       # verso l'esterno della testa sullo schermo
            hc = v.P(Hx((0, 0, 0)))
            if (pb - hc) @ out_side < 0: out_side = -out_side
            bl, br = pb - out_side * hw, pb + out_side * hw
            outer = cv.mask_poly(np.array([bl, pt, br]))
            for (tt, L2, r0) in [(0.45, 2.8, 1.2)]:
                e0 = br + (pt - br) * tt
                tip = e0 + (out_side * 0.8 + axis * 0.6) / np.linalg.norm(out_side * 0.8 + axis * 0.6) * v.L(L2)
                n2 = np.array([-(tip - e0)[1], (tip - e0)[0]]); n2 = n2 / (np.linalg.norm(n2) + 1e-9) * v.L(r0)
                outer |= cv.mask_poly(np.array([e0 + n2, tip, e0 - n2]))
            cv.put(outer, EAROUT, 'orecchio')
            if Wf @ v.c > 0.05:          # il dentro rosso scuro solo se l'orecchio guarda verso di noi
                k_ = 0.6
                inner = cv.mask_poly(np.array([pb - out_side * hw * k_ + axis * v.L(1.2), pt - axis * v.L(3.5), pb + out_side * hw * k_ + axis * v.L(1.2)])) & outer
                cv.mat[inner] = EARIN
        add(('ear', s), ear)
    # cresta di fiamma: lingue che salgono e vanno indietro, più la V sulla fronte
    CR = [([(5, 1.5, 9), (1, 2.0, 16), (-4, 2.5, 23), (-8.5, 3.0, 29), (-12, 3.5, 33)], [4.4, 4.0, 2.8, 1.4, 0.05]),
          ([(7, -3.0, 8.5), (5, -3.5, 14.5), (2.5, -4.0, 20), (0.5, -4.5, 24)], [3.6, 2.9, 1.5, 0.05]),
          ([(-2, 3.5, 9.5), (-6, 4.5, 15.5), (-10, 5.0, 20)], [3.2, 2.2, 0.05])]
    def crest():
        m = np.zeros(cv.mat.shape, bool)
        for j, (pts, rads) in enumerate(CR):
            pts = np.array(pts, float)
            for i in range(1, len(pts)):
                kk = i / (len(pts) - 1); pts[i] += (0.6 * kk * np.sin(fl + j + i), 0.5 * kk * np.sin(fl + j + i + 2), 0)
            m |= cv.mask_poly(stroke_pts(v, [Hx(q) for q in pts], rads))
        # la base della cresta: copre la cima della testa
        m |= cv.mask_poly(ellipse_pts(v, Hx((2.0, 0.5, 11.0)), (7.5, 8.5, 4.5)))
        cv.put(m, CREST, 'cresta')
    add(('crest',), crest)
    def vfront():
        pts = [Hx((13.6, 0, 2.5)), Hx((11.0, 0, 8.0)), Hx((7.0, 0, 12.0))]
        cv.put(cv.mask_poly(stroke_pts(v, pts, [0.05, 2.6, 4.2])), CREST, 'fronte', outline=True)
    if np.array((1.0, 0, 0)) @ v.c > 0.2:
        add(('vfront',), vfront)
    order(v, parts)
    return v, cv, P, Hx

def order(v, parts):
    cx, cy = v.c[0], v.c[1]
    byk = {p[0]: p[2] for p in parts}
    legs = [k for k in byk if k[0] == 'leg']
    def near(k):
        _, kind, s = k
        if abs(cy) > 0.2: return s * cy > 0
        return (1 if kind == 'f' else -1) * cx > 0
    far_l = sorted([k for k in legs if not near(k)], key=lambda k: 0 if k[1] == ('h' if cx >= 0 else 'f') else 1)
    near_l = sorted([k for k in legs if near(k)], key=lambda k: 0 if k[1] == ('h' if cx >= 0 else 'f') else 1)
    ears = [k for k in byk if k[0] == 'ear']
    far_e = [k for k in ears if k[1] * cy < -0.2]
    near_e = [k for k in ears if k not in far_e]
    head = far_e + [('cheeks',), ('head',)] + ([('vfront',)] if ('vfront',) in byk else []) + [('crest',)] + near_e
    if cx >= -0.3:
        seq = far_l + [('tail',), ('body',), ('tuft',)] + near_l + [('ruff',)] + head
    else:
        seq = far_l + [('ruff',)] + head + [('body',), ('tuft',)] + near_l + [('tail',)]
    for k in seq:
        if k in byk: byk[k]()

def eye_world(Hx, s):
    rx, ry, rz = HEAD_R
    y, z = 9.2 * s, 0.6
    x = (rx / HS) * np.sqrt(max(1 - (y * HS / ry) ** 2 - (z * HS / rz) ** 2, 0.05))
    p = np.array((x, y, z)); n_ = p * HS / np.array(HEAD_R) ** 2; n_ /= np.linalg.norm(n_)
    o = Hx((0, 0, 0))
    return Hx(p), (Hx(p + n_ * 5) - Hx(p)) / 5

# ------------------------------------------------------------------ a grandezza di sprite: colori, ombre piatte, occhi
FURN = ('corpo', 'testa', 'guance')

def shift(a, dy, dx, fill=0):
    h, w = a.shape; out = np.full_like(a, fill)
    ys = slice(max(dy, 0), h + min(dy, 0)); yd = slice(max(-dy, 0), h + min(-dy, 0))
    xs = slice(max(dx, 0), w + min(dx, 0)); xd = slice(max(-dx, 0), w + min(-dx, 0))
    out[yd, xd] = a[ys, xs]; return out

def down(v, cv):
    S = v.SS; H = W = v.size
    M = cv.mat.reshape(H, S, W, S).transpose(0, 2, 1, 3).reshape(H, W, S * S)
    R = cv.reg.reshape(H, S, W, S).transpose(0, 2, 1, 3).reshape(H, W, S * S)
    cnt = np.stack([(M == k).sum(-1) for k in range(9)], -1).astype(float)
    cnt[..., OL] *= 1.45
    cov = (M > 0).sum(-1)
    mat = np.where(cov >= S * S * 0.45, cnt[..., 1:].argmax(-1) + 1, 0)
    reg = np.zeros((H, W), np.int16)
    for i in range(H):
        for j in range(W):
            if mat[i, j] > 1:
                rr = R[i, j][M[i, j] == mat[i, j]]
                if rr.size: reg[i, j] = np.bincount(rr).argmax()
    return mat, reg

def colorize(v, cv, mat, reg):
    H, W = mat.shape; out = np.zeros((H, W), np.int16)
    out[mat == OL] = KI['ol']
    fl = np.isin(mat, (FLAME, CREST, EAROUT, EARIN)).astype(int); fu = np.isin(mat, (FUR, SOCK, RUFF)).astype(int)
    nfl = sum(shift(fl, dy, dx, 0) for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)))
    nfu = sum(shift(fu, dy, dx, 0) for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)))
    out[(mat == OL) & (nfl > nfu)] = KI['r3']
    for r, (name, m0) in cv.info.items():
        R = reg == r
        if not R.any(): continue
        far = name.endswith('_lontana')
        for m in (FUR, SOCK, FLAME, CREST, RUFF, EARIN, EAROUT):
            Rm = R & (mat == m)
            if not Rm.any(): continue
            if m == FUR:
                top = Rm & ~shift(R, 1, 0, False)
                bot = Rm & (~shift(R, -1, 0, False) | ~shift(R, -2, 0, False))
                o = np.where(Rm, KI['f2' if far else 'f1'], 0)
                if name in FURN: o[top] = KI['f0']
                o[bot & (o > 0)] = KI['f2']
                if far: o[top] = KI['f1']
                out[Rm] = o[Rm]
            elif m == SOCK:
                bot = Rm & ~shift(R, -1, 0, False)
                out[Rm] = KI['p2' if far else 'p1']; out[bot] = KI['p2']
            else:
                d = nd.distance_transform_edt(np.pad(R & np.isin(mat, (FLAME, CREST, RUFF, EAROUT, EARIN)), 1))[1:-1, 1:-1]
                dd = d[Rm]
                if m == FLAME:
                    t = np.where(dd < 1.5, 'r2', np.where(dd < 2.5, 'r1', np.where(dd < 3.5, 'o1', np.where(dd < 5.5, 'y1', 'y0'))))
                elif m == CREST:
                    t = np.where(dd < 1.5, 'r1', np.where(dd < 2.5, 'o1', 'y1'))
                elif m == RUFF:
                    t = np.where(dd < 1.5, 'r1', np.where(dd < 3.0, 'o1', 'y1'))
                elif m == EAROUT:
                    t = np.where(dd < 1.5, 'r1', 'o1')
                else:
                    t = np.full(dd.shape, 'r3')
                out[Rm] = [KI[q] for q in t]
    return out

ST = {'fronte': [".KKK.", "KWWDK", "KWKDK", "KRKRK", "KRKRK", "KYYYK", ".KKK."],
      'tre_quarti': [".KK.", "KWWK", "KWKK", "KRKK", "KRKK", "KYYK", ".KK."],
      'lato': [".K.", "KWK", "KKK", "KRK", "KRK", "KYK", ".K."],
      'chiuso': ["K...K", ".KKK."], 'chiuso_s': ["K..K", ".KK."]}
SC = {'K': 'ek', 'D': 'e1', 'R': 'e2', 'Y': 'e3', 'W': 'ew'}

def stamp(out, rows, cx, cy, ok, mirror=False):
    h, w = len(rows), len(rows[0]); x0 = int(round(cx - (w - 1) / 2)); y0 = int(round(cy - (h - 1) / 2))
    for i, r in enumerate(rows):
        if mirror: r = r[::-1]
        for j, ch in enumerate(r):
            if ch == '.': continue
            y, x = y0 + i, x0 + j
            if 0 <= y < out.shape[0] and 0 <= x < out.shape[1] and ok[y, x]: out[y, x] = KI[SC[ch]]

def face(v, cv, P, Hx, out, reg, blink=False):
    head_regs = [r for r, (n, m) in cv.info.items() if n in ('testa',)]
    onhead = np.isin(reg, head_regs)
    for s in (1, -1):
        pe, ne = eye_world(Hx, s)
        cosv = ne @ v.c
        if cosv < 0.3: continue
        q = v.P(pe) / v.SS
        cx, cy = q[0] - 0.5, q[1] - 0.5
        if blink: rows = ST['chiuso'] if cosv > 0.6 else ST['chiuso_s']
        elif cosv > 0.66: rows = ST['fronte']
        elif cosv > 0.45: rows = ST['tre_quarti']
        else: rows = ST['lato']
        # luce dell'occhio sempre verso il muso
        fx = (Hx((10, 0, 0)) - Hx((0, 0, 0))) @ v.r
        stamp(out, rows, cx, cy, onhead, mirror=(fx > 0.5 and rows is ST['tre_quarti']) or (fx < -0.5 and rows is not ST['tre_quarti'] and rows is not ST['fronte']))
    # naso e bocca aperta, se il muso guarda verso di noi
    fwd = nrm(Hx((10, 0, 0)) - Hx((0, 0, 0)))
    if fwd @ v.c > -0.1:
        rx = HEAD_R[0] / HS
        for (pt, rows) in [((rx * 0.97, 0, -8.4), ["K"]), ((rx * 0.92, 0, -11.2), ["MMM", ".T."])]:
            q = v.P(Hx(pt)) / v.SS
            rr = [r.replace('M', 'm').replace('T', 't') for r in rows]
            h, w = len(rr), len(rr[0]); x0 = int(round(q[0] - 0.5 - (w - 1) / 2)); y0 = int(round(q[1] - 0.5))
            for i, r in enumerate(rr):
                for j, ch in enumerate(r):
                    y, x = y0 + i, x0 + j
                    if ch == '.' or not (0 <= y < out.shape[0] and 0 <= x < out.shape[1]) or not onhead[y, x]: continue
                    out[y, x] = KI[{'K': 'r2', 'm': 'mo', 't': 'to'}[ch]]
    return out

def sprite(theta, p=0.0, mode='corsa', blink=False, **kw):
    v, cv, P, Hx = frame(theta, p, mode, **kw)
    mat, reg = down(v, cv)
    out = colorize(v, cv, mat, reg)
    out = face(v, cv, P, Hx, out, reg, blink=blink)
    rgba = np.zeros(out.shape + (4,), np.uint8); rgba[..., :3] = RGB[out]; rgba[..., 3] = (out > 0) * 255
    return rgba
