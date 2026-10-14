"""La volpe di fuoco per la mappa con più pixel (128x128, 8 direzioni) e più vera: burattino 2D con le forme e i colori del disegno.

Ogni pezzo è una forma piatta (ellissi, lingue di fiamma, triangoli) messa al suo posto da uno scheletro di punti, con il suo
contorno di un pixel. I toni si scelgono come in una pittura a mano, pezzo per pezzo: filo di luce sul bordo verso la luce (in alto
a sinistra), ombra sul bordo opposto, pieno al centro, più scuro in basso; il pelo usa i colori del disegno (oro, arancio, rosso),
le calze vanno dall'arancio al rosso scuro, le fiamme dal bordo rosso al cuore giallo. Sopra c'è il tratteggio della matita, fisso
sul pezzo (si muove con lui). Proporzioni del disegno (testa e corpo come nella base controllata sul disegno), zampe grosse con le
dita, orecchie con i ciuffi di fiamma, cresta grande, ciuffi sulle guance, gorgiera a punte, ciuffo sulla schiena, braci."""
import numpy as np, cv2, os, sys, zlib
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..', 'disegno2d'))
from burattino import View, ellipse_pts, stroke_pts, nrm, rotz, roty
import pixel2d

# ------------------------------------------------------------------ tavolozza (quella dello sprite fatto dal disegno)
PAL = dict(pixel2d.PAL); PAL['r4'] = '#74202a'
KEYS = list(PAL); KI = {k: i + 1 for i, k in enumerate(KEYS)}
RGB = np.zeros((len(KEYS) + 1, 3), np.uint8)
for _k, _i in KI.items(): RGB[_i] = [int(PAL[_k][j:j + 2], 16) for j in (1, 3, 5)]

OL, FUR, SOCK, FLAME, CREST, RUFF, EARIN, EAROUT = 1, 2, 3, 4, 5, 6, 7, 8
NMAT = 9
SIZE, UPP, PIV, SS = 128, 0.915, (64, 111), 4
ANCHOR = (-12.5, 0, 0)

# ------------------------------------------------------------------ proporzioni (quelle della base controllata sul disegno)
HS = 1.0; KB = 0.0
HEAD_C = np.array((21.5, 0, 52.5)); HEAD_R = (14.0, 16.0, 15.5)

_TAIL = None
def tail_contour():
    """la sagoma della coda del disegno, già portata nel piano del corpo (../fai/coda_sagoma.png, in alto = z grande)"""
    global _TAIL
    if _TAIL is None:
        g = np.asarray(Image.open(os.path.join(HERE, '..', 'fai', 'coda_sagoma.png'))) > 127
        g = nd.binary_opening(g, iterations=2)
        cs, _ = cv2.findContours(g.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = max(cs, key=cv2.contourArea)[:, 0, :].astype(float)[::2]
        nv = g.shape[0]
        _TAIL = np.stack([-62.0 + c[:, 0] * 0.25 + KB, 8.0 + (nv - 1 - c[:, 1]) * 0.25], 1)
    return _TAIL

# ------------------------------------------------------------------ pose: tutto dipende solo da p (0..1)
def pose(p, mode='corsa'):
    t = 2 * np.pi * p
    P = {}
    if mode == 'corsa':
        P['bob'] = 2.2 * (0.5 + 0.5 * np.cos(2 * t - 0.6))
        P['pitch'] = np.radians(7) * np.sin(t)
        legs = {}
        for side, off in ((1, 0.0), (-1, 0.13)):
            a = t + 2 * np.pi * off
            legs[('f', side)] = (np.radians(58) * np.sin(a), np.radians(78) * max(0.0, np.cos(a)))
            b = t + np.pi + 2 * np.pi * off
            legs[('h', side)] = (np.radians(52) * np.sin(b), np.radians(66) * max(0.0, np.cos(b)))
        P['legs'] = legs
        P['ear'] = np.radians(10) * (0.7 + 0.3 * np.sin(t))
        P['tail_lean'] = np.radians(-9) + np.radians(4) * np.sin(t + 1)
        P['head_pitch'] = -P['pitch'] * 0.7
        P['breath'] = 0.0
    else:
        P['bob'] = 0.0; P['pitch'] = 0.0
        P['legs'] = {(k, s): (0.0, 0.0) for k in 'fh' for s in (1, -1)}
        P['ear'] = 0.0; P['tail_lean'] = np.radians(2.5) * np.sin(t); P['head_pitch'] = np.radians(1.5) * np.sin(t)
        P['breath'] = 0.5 - 0.5 * np.cos(t)
    P['flick'] = p
    return P

def body_xf(P):
    C = np.array((0.0, 0, 21.0)); R = roty(P['pitch'])
    return lambda q: C + R @ (np.asarray(q, float) - C) + np.array((0, 0, P['bob']))

def head_turn(theta):
    """nelle viste davanti e di lato la testa si gira un poco verso di noi (come nel disegno), da dietro no"""
    t = (theta + 180) % 360 - 180
    return np.radians(np.sign(t) * float(np.interp(abs(t), [0, 45, 90, 125, 180], [0, 16, 10, 0, 0])))

def head_xf(P):
    B = body_xf(P); piv = np.array((17.0, 0, 34.0))
    R = roty(P['pitch'] + P['head_pitch']) @ rotz(P.get('yaw', 0.0))
    up = np.array((0, 0, 0.35 * P.get('breath', 0.0)))
    return lambda q: B(piv) + up + R @ (HEAD_C + HS * np.asarray(q, float) - piv)

# ------------------------------------------------------------------ la tela: materiale, pezzo e tono per ogni sottopixel
def _edges(mc, S):
    """distanza dal bordo (in pixel di sprite) e normale verso fuori"""
    d = nd.distance_transform_edt(np.pad(mc, 1))[1:-1, 1:-1] / S
    ds = nd.gaussian_filter(d, S * 0.6)
    gy, gx = np.gradient(ds)
    n = np.hypot(gx, gy) + 1e-6
    return d, -gx / n, -gy / n

LIGHT = nrm((-0.55, -0.83))

class Tela:
    def __init__(s, v):
        s.v = v; N = v.size * v.SS
        s.mat = np.zeros((N, N), np.int16); s.reg = np.zeros((N, N), np.int16); s.val = np.zeros((N, N), np.float32)
        s.own = np.zeros((N, N), np.int16)          # di quale pezzo è il contorno
        s.nreg = 0; s.info = {}
    def poly(s, pts):
        m = np.zeros(s.mat.shape, np.uint8); cv2.fillPoly(m, [np.round(pts).astype(np.int32)], 1, lineType=cv2.LINE_8); return m > 0
    def caps(s, segs):
        m = np.zeros(s.mat.shape, np.uint8)
        for a, b, wa, wb in segs:
            n = 12
            for k in range(n + 1):
                t = k / n; c = a + (b - a) * t; r = wa + (wb - wa) * t
                cv2.circle(m, tuple(np.round(c).astype(int)), int(round(r)), 1, -1)
        return m > 0
    def put(s, m, mat, name, kind='fur', far=False, sub=(), ring=True, dark=0.0, ctx=None):
        """un pezzo: prima il suo contorno (un pixel di sprite), poi il pieno con il suo tono"""
        if not m.any(): return
        S = s.v.SS; N = m.shape[0]
        ys, xs = np.nonzero(m)
        pad = 3 * S
        Y0, Y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, N); X0, X1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, N)
        mc = m[Y0:Y1, X0:X1]
        M = s.mat[Y0:Y1, X0:X1]; R = s.reg[Y0:Y1, X0:X1]; Vv = s.val[Y0:Y1, X0:X1]; O = s.own[Y0:Y1, X0:X1]
        if ring:
            rr = nd.binary_dilation(mc, structure=np.ones((3, 3)), iterations=S) & ~mc
            M[rr] = OL; R[rr] = 0; O[rr] = s.nreg + 1
        d, nx, ny = _edges(mc | ctx[Y0:Y1, X0:X1] if ctx is not None else mc, S)
        yy, xx = np.mgrid[Y0:Y1, X0:X1]
        if kind in ('fur', 'sock'):
            lit = nx * LIGHT[0] + ny * LIGHT[1]
            w = np.exp(-d / 1.7)
            cy = ys.mean(); hy = max(np.ptp(ys) / 2, S)
            vert = np.clip(-(yy - cy) / hy, -1, 1)
            val = 0.55 + 0.34 * w * lit + 0.16 * vert + 0.05 * np.clip(d / 3, 0, 1) - dark
        else:
            val = d - 1.6 * dark
        s.nreg += 1
        M[mc] = mat; R[mc] = s.nreg; Vv[mc] = val[mc]
        main = s.nreg
        s.info[s.nreg] = dict(name=name, mat=mat, kind=kind, far=far, part=main,
                              anchor=(int(round(xs.mean() / S)), int(round(ys.mean() / S))))
        for (sm, smat, skind, sval) in sub:          # zone dentro il pezzo con un altro materiale (calze, dentro delle orecchie)
            sc = sm[Y0:Y1, X0:X1] & mc
            if not sc.any(): continue
            s.nreg += 1
            M[sc] = smat; R[sc] = s.nreg; Vv[sc] = sval(sc, Y0, X0, d, nx, ny)[sc]
            sy, sx = np.nonzero(sc)
            s.info[s.nreg] = dict(name=name + '_' + skind, mat=smat, kind=skind, far=far, part=main,
                                  anchor=(int(round((sx.mean() + X0) / S)), int(round((sy.mean() + Y0) / S))))

# ------------------------------------------------------------------ il burattino
def frame(theta, p=0.0, mode='corsa', size=SIZE, upp=UPP, pivot=PIV, SS_=SS):
    v = View(theta, size=size, upp=upp, pivot=pivot, anchor=ANCHOR, SS=SS_)
    cv = Tela(v); P = pose(p, mode); P['yaw'] = head_turn(theta); B = body_xf(P); Hx = head_xf(P)
    parts = []
    def add(key, fn): parts.append((key, fn))
    fl = P['flick'] * 2 * np.pi
    br = P['breath']
    # ---- zampe: spalla o coscia, due ossa grosse, piede con le dita; calza rossa dal polso in giù
    LEG = {'f': dict(J=(13.0, 6.6, 15.5), L1=6.0, L2=6.0, r1=4.1, r2=3.5, sh=((12.5, 6.4, 18.5), (5.6, 3.9, 7.0))),
           'h': dict(J=(-12.5, 6.3, 15.0), L1=6.4, L2=5.8, r1=4.2, r2=3.5, sh=((-12.0, 6.2, 17.0), (7.6, 4.4, 8.6)))}
    for (k, s), (a, b) in P['legs'].items():
        d = LEG[k]
        def leg(d=d, k=k, s=s, a=a, b=b):
            J = np.array(d['J']) * np.array((1, s, 1))
            Jw = B(J)
            a0 = a + (np.radians(-16) if k == 'h' else np.radians(4))
            u1 = np.array((np.sin(a0), 0, -np.cos(a0)))
            K = Jw + d['L1'] * u1
            a2 = a0 - b if k == 'f' else a0 + b + np.radians(22)
            u2 = np.array((np.sin(a2), 0, -np.cos(a2)))
            Pw = K + d['L2'] * u2
            Pc = Pw + np.array((1.3, 0, -0.2))
            jw, kw, pw = v.P(Jw), v.P(K), v.P(Pw)
            m = cv.caps([(jw, kw, v.L(d['r1']), v.L(d['r2'] + 0.2)), (kw, pw, v.L(d['r2'] + 0.2), v.L(d['r2']))])
            c, rr = d['sh']
            m |= cv.poly(ellipse_pts(v, B(np.array(c) * np.array((1, s, 1))), rr, roty(-P['pitch'])))
            paw = cv.poly(ellipse_pts(v, Pc, (4.9, 3.8, 2.7)))
            m |= paw
            far = (np.array((0, s, 0)) @ v.c) < -0.05
            # calza: dal punto a metà dell'osso basso in giù, più il piede
            mid = kw + (pw - kw) * 0.3
            sock = (cv.caps([(mid, pw, v.L(d['r2'] + 0.3), v.L(d['r2'] + 0.3))]) | paw) & m
            top_y = mid[1]; bot_y = v.P(Pc)[1] + v.L(2.5)
            def sval(sc, Y0, X0, dd, nx, ny, top_y=top_y, bot_y=bot_y, far=far):
                yy = np.mgrid[Y0:Y0 + sc.shape[0], X0:X0 + sc.shape[1]][0]
                h = np.clip((bot_y - yy) / max(bot_y - top_y, 1), 0, 1)
                lit = nx * LIGHT[0] + ny * LIGHT[1]
                return 0.12 + 0.62 * h + 0.22 * np.exp(-dd / 1.5) * lit - (0.15 if far else 0)
            pid = cv.nreg + 1
            cv.put(m, FUR, 'zampa_%s%s' % (k, '_lontana' if far else ''), 'fur', far=far, sub=[(sock, SOCK, 'sock', sval)],
                   dark=0.2 if far else 0.0, ctx=getattr(cv, 'body_mask', None))
            # le dita: due righe sul davanti del piede
            cv.toes = getattr(cv, 'toes', []) + [(Pc, s, far, pid)]
        add(('leg', k, s), leg)
    # ---- corpo
    def body():
        R = roty(-P['pitch'])
        m = cv.poly(ellipse_pts(v, B((8.0, 0, 21.5 + 0.12 * br)), (13.0, 8.0 + 0.2 * br, 8.8 + 0.2 * br), R))
        m |= cv.poly(ellipse_pts(v, B((-11.0 + KB, 0, 20.5)), (11.0, 7.6, 8.2), R))
        m |= cv.poly(ellipse_pts(v, B((17.0, 0, 30.0)), (6.5, 6.3, 8.0), R))
        cv.put(m, FUR, 'corpo', 'fur')
        cv.body_mask = m
    add(('body',), body)
    # ---- ciuffo sulla schiena (dietro la gorgiera)
    def tuft():
        m = np.zeros(cv.mat.shape, bool)
        for i, (x, z, L, w0) in enumerate([(8, 28.5, 7.5, 2.8), (2, 28.8, 8.5, 2.9), (-4.5, 28.2, 7.0, 2.5)]):
            b0 = np.array((x, 0, z)); wob = 0.5 * np.sin(fl + i * 1.7)
            pts = [B(b0), B(b0 + (-2.0, 0, 0.55 * L)), B(b0 + (-L * 0.75 + wob, 0, L * 0.65))]
            m |= cv.poly(stroke_pts(v, pts, [w0, w0 * 0.55, 0.05]))
        cv.put(m, RUFF, 'ciuffo', 'flame')
    add(('tuft',), tuft)
    # ---- coda: la sagoma del disegno, mai di taglio
    def tail():
        tc = tail_contour().copy()
        xb, zb = -18.0 + KB, 25.0
        w = np.clip((tc[:, 1] - 30) / 50, 0, 1) ** 1.2
        tc[:, 0] += w * (1.3 * np.sin(tc[:, 1] / 7.0 - fl) + 0.5 * np.sin(tc[:, 1] / 3.2 - 2 * fl + 1))
        tc[:, 1] += w * (0.9 * np.sin(tc[:, 0] / 6.0 + fl))
        ang = P['tail_lean']; dx, dz = tc[:, 0] - xb, tc[:, 1] - zb
        tc = np.stack([xb + dx * np.cos(ang) - dz * np.sin(ang), zb + dx * np.sin(ang) + dz * np.cos(ang)], 1)
        pts3 = np.stack([tc[:, 0], np.zeros(len(tc)), tc[:, 1]], 1)
        pw = np.array([B(q) for q in pts3]); base = B((xb, 0, zb))
        scr = v.P(pw); sb = v.P(base)
        rx = v.r[0]; k = np.sign(rx if abs(rx) > 1e-3 else 1.0) * max(abs(rx), 0.55)
        scr[:, 0] = sb[0] + (pw[:, 0] - base[0]) * k / v.upp * v.SS + (pw[:, 1] - base[1]) * v.r[1] / v.upp * v.SS
        cv.put(cv.poly(scr), FLAME, 'coda', 'flame')
    add(('tail',), tail)
    # ---- gorgiera: collare rosso con le punte chiare che scendono sul petto
    def ruff():
        R = roty(-P['pitch'])
        # punte chiare del petto (pelo), sotto il collare
        m = np.zeros(cv.mat.shape, bool)
        for aa in np.radians([-70, -44, -18, 8, 34, 60]):
            b0 = B((21.5 + 4.2 * np.cos(aa), 8.0 * np.sin(aa), 24.5))
            tip = B((22.5 + 6.2 * np.cos(aa), 9.8 * np.sin(aa), 16.5 + 2.0 * abs(np.sin(aa))))
            m |= cv.poly(stroke_pts(v, [b0, b0 + (tip - b0) * 0.5, tip], [3.0, 1.9, 0.05]))
        m |= cv.poly(ellipse_pts(v, B((21.0, 0, 23.5)), (5.0, 8.0, 4.5), R))
        cv.put(m, FUR, 'petto', 'fur', dark=-0.14)
        # il collare: rosso, a ciuffi
        m = cv.poly(ellipse_pts(v, B((21.5, 0, 29.0)), (5.6, 11.0, 6.0), R))
        for aa in np.radians([-84, -60, -36, -12, 12, 36, 60, 84]):
            b0 = B((21.5 + 4.2 * np.cos(aa), 9.6 * np.sin(aa), 27.0))
            tip = B((22.0 + 6.4 * np.cos(aa), 13.0 * np.sin(aa), 22.0))
            m |= cv.poly(stroke_pts(v, [b0, tip], [2.3, 0.05]))
        for s in (1, -1):
            for (b0, tip) in [((18.5, 10.0 * s, 27.0), (13.5, 15.5 * s, 23.0)), ((20.0, 11.5 * s, 31.0), (17.5, 18.0 * s, 27.5)),
                              ((22.5, 10.5 * s, 34.0), (22.0, 16.5 * s, 32.0))]:
                m |= cv.poly(stroke_pts(v, [B(b0), B(tip)], [2.3, 0.05]))
        cv.put(m, RUFF, 'gorgiera', 'flame')
    add(('ruff',), ruff)
    # ---- testa
    def cheeks():
        m = np.zeros(cv.mat.shape, bool)
        for s in (1, -1):
            for (b0, tip, w0) in [((3.0, 14.5 * s, -9.5), (0.5, 20.0 * s, -13.0), 2.2), ((1.0, 16.0 * s, -4.0), (-1.5, 21.5 * s, -5.5), 2.1),
                                  ((-1.0, 16.5 * s, 1.5), (-3.5, 21.0 * s, 2.5), 1.8)]:
                m |= cv.poly(stroke_pts(v, [Hx(b0), Hx(tip)], [w0, 0.05]))
        cv.put(m, FUR, 'guance', 'fur', dark=0.04)
    add(('cheeks',), cheeks)
    def head():
        R = (roty(P['pitch'] + P['head_pitch']) @ rotz(P.get('yaw', 0.0))).T
        m = cv.poly(ellipse_pts(v, Hx((0, 0, 0)), HEAD_R, R))
        m |= cv.poly(ellipse_pts(v, Hx((5.0, 0, -7.0)), (9.0, 12.5, 7.5), R))     # guance e mento
        m |= cv.poly(ellipse_pts(v, Hx((12.0, 0, -8.6)), (4.6, 5.0, 3.8), R))     # muso
        cv.put(m, FUR, 'testa', 'fur')
    add(('head',), head)
    hc_scr = v.P(Hx((0, 0, 0)))
    for s in (1, -1):
        Bh = np.array((-2.5, 12.5 * s, 8.5)); Th = Bh + 1.04 * (np.array((-11.0, 25.5 * s, 30.5)) - Bh)
        Th = Th + np.array((-6.0, 0, -2.0)) * (P['ear'] / np.radians(10) if P['ear'] else 0) * 0.5
        def ear(Bh=Bh, Th=Th, s=s):
            Bw, Tw = Hx(Bh), Hx(Th)
            U = nrm(Tw - Bw); Wf = nrm(roty(P['pitch'] + P['head_pitch']) @ rotz(P.get('yaw', 0.0)) @ np.array((0.85, 0.5 * s, 0.15)))
            Vv = nrm(np.cross(U, Wf)) * s
            if Vv[1] * s < 0: Vv = -Vv
            w = 6.6
            pb, pt = v.P(Bw), v.P(Tw)
            pv = v.P(Bw + Vv * w) - pb
            Ls = np.linalg.norm(pt - pb); axis = (pt - pb) / (Ls + 1e-9); perp = np.array([-axis[1], axis[0]])
            hw = max(abs(pv @ perp), v.L(w) * 0.62)
            out = perp * (np.sign(pv @ perp) if abs(pv @ perp) > 1e-6 else 1.0)
            if (pb - hc_scr) @ out < 0: out = -out
            bl, brc = pb - out * hw, pb + out * hw
            E = lambda t: brc + (pt - brc) * t + out * hw * 0.16 * np.sin(np.pi * t)
            outer = [brc]
            for (t0, L2) in [(0.30, 3.6), (0.56, 2.9)]:
                a = E(t0 - 0.07); bpt = E(t0 + 0.03)
                dirn = out * 0.85 + axis * 0.75; dirn = dirn / np.linalg.norm(dirn)
                outer += [a, E(t0) + dirn * v.L(L2), bpt]
            outer += [E(0.8), pt]
            inner = [pt, pb - out * hw * 0.92 + axis * Ls * 0.5 - out * hw * 0.10, bl]
            poly = np.array(outer + inner)
            m = cv.poly(poly)
            sub = []
            if Wf @ v.c > 0.05:
                k_ = 0.58
                im = cv.poly(np.array([pb - out * hw * k_ + axis * v.L(2.0), pt - axis * v.L(4.0), pb + out * hw * k_ * 0.9 + axis * v.L(2.0)]))
                def sval(sc, Y0, X0, dd, nx, ny):
                    di = nd.distance_transform_edt(np.pad(sc, 1))[1:-1, 1:-1] / v.SS
                    return di
                sub = [(im, EARIN, 'dentro', sval)]
            cv.put(m, EAROUT, 'orecchio', 'flame', sub=sub)
        add(('ear', s), ear)
    # cresta: una massa che sale dalla fronte e si apre in lingue che vanno indietro (come la base controllata sul disegno)
    CR = [([(1, 3.0, 15), (-2, 3.5, 23), (-6, 4.0, 31), (-10.5, 4.5, 37), (-14, 5.0, 41)], [6.0, 5.0, 3.5, 1.8, 0.05]),
          ([(5, -2.5, 14), (4, -3.0, 21), (1, -3.2, 27.5), (-1.5, -3.5, 32)], [5.0, 3.8, 2.0, 0.05]),
          ([(1, -8.0, 12.5), (-2, -10.5, 18.5), (-5, -12.5, 23.0), (-7.5, -13.5, 26.5)], [4.2, 3.1, 1.6, 0.05]),
          ([(-1, 8.0, 12.5), (-4, 11.0, 18.0), (-8, 13.0, 22.5), (-11.5, 13.8, 26)], [4.2, 3.1, 1.6, 0.05]),
          ([(8.5, 0.0, 10.0), (10.5, 0.5, 15.0), (11.5, 1.0, 19.5)], [3.6, 2.4, 0.05]),
          ([(-6, 0.0, 13.0), (-11.5, 0.0, 17.5), (-16, 0.0, 20.5)], [3.8, 2.4, 0.05])]
    def crest():
        m = cv.poly(ellipse_pts(v, Hx((2.0, 0.5, 11.0)), (9.0, 10.0, 6.8),
                                (roty(P['pitch'] + P['head_pitch']) @ rotz(P.get('yaw', 0.0)) @ roty(np.radians(18))).T))
        for j, (pts, rads) in enumerate(CR):
            pts = np.array(pts, float)
            for i in range(1, len(pts)):
                kk = i / (len(pts) - 1)
                pts[i] += (0.6 * kk * np.sin(fl + j + i), 0.6 * kk * np.sin(fl + j + i + 2), 0.3 * kk * np.sin(fl * 2 + j))
            m |= cv.poly(stroke_pts(v, [Hx(q) for q in pts], rads))
        cv.put(m, CREST, 'cresta', 'flame')
    add(('crest',), crest)
    def nape():
        m = np.zeros(cv.mat.shape, bool)
        for j, (b0, tip, w0) in enumerate([((-9.0, 0.0, 8.0), (-17.5, 0.0, -3.0), 4.4), ((-8.0, 6.5, 6.0), (-15.0, 10.0, -5.0), 3.6),
                                           ((-8.0, -6.5, 6.0), (-15.0, -10.0, -5.0), 3.6)]):
            b0 = np.array(b0); tip = np.array(tip) + (0.6 * np.sin(fl + j), 0, 0.4 * np.sin(fl + j + 1))
            m |= cv.poly(stroke_pts(v, [Hx(b0), Hx((b0 + tip) / 2 + (-1.5, 0, 1.0)), Hx(tip)], [w0, w0 * 0.6, 0.05]))
        cv.put(m, CREST, 'nuca', 'flame')
    if np.array((1.0, 0, 0)) @ v.c < 0.35:
        add(('nape',), nape)
    def vfront():
        pts = [Hx((13.4, 0, 1.0)), Hx((11.5, 0, 6.5)), Hx((7.0, 0, 12.0))]
        cv.put(cv.poly(stroke_pts(v, pts, [0.05, 2.6, 4.4])), CREST, 'fronte', 'flame')
    if np.array((1.0, 0, 0)) @ v.c > 0.25:
        add(('vfront',), vfront)
    order(v, parts)
    return v, cv, P, Hx

def order(v, parts):
    cx, cy = v.c[0], v.c[1]
    byk = dict(parts)
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
    if cx >= -0.3:
        head = far_e + [('nape',), ('cheeks',), ('head',)] + ([('vfront',)] if ('vfront',) in byk else []) + [('crest',)] + near_e
        seq = far_l + [('tail',), ('tuft',), ('body',)] + near_l + [('ruff',)] + head
    else:
        head = far_e + [('cheeks',), ('head',), ('nape',), ('crest',)] + near_e
        seq = far_l + [('ruff',)] + head + [('body',), ('tuft',)] + near_l + [('tail',)]
    for k in seq:
        if k in byk: byk[k]()

def eye_world(Hx, s):
    rx, ry, rz = HEAD_R
    y, z = 9.0 * s, 0.4
    x = (rx / HS) * np.sqrt(max(1 - (y * HS / ry) ** 2 - (z * HS / rz) ** 2, 0.05))
    p = np.array((x, y, z)); n_ = p * HS / np.array(HEAD_R) ** 2; n_ /= np.linalg.norm(n_)
    return Hx(p), (Hx(p + n_ * 5) - Hx(p)) / 5

# ------------------------------------------------------------------ a grandezza di sprite
def down(cv):
    S = cv.v.SS; H = W = cv.v.size
    blk = lambda a: a.reshape(H, S, W, S).transpose(0, 2, 1, 3).reshape(H, W, S * S)
    M, R, Vv = blk(cv.mat), blk(cv.reg), blk(cv.val)
    cnt = np.stack([(M == k).sum(-1) for k in range(NMAT)], -1).astype(float)
    cnt[..., OL] *= 1.45
    cov = (M > 0).sum(-1)
    mat = np.where(cov >= S * S * 0.45, cnt[..., 1:].argmax(-1) + 1, 0)
    Rm = np.where(M == mat[..., None], R, -1)
    same = (Rm[..., :, None] == Rm[..., None, :]) & (Rm[..., :, None] >= 0)
    best = same.sum(-1).argmax(-1)
    reg = np.take_along_axis(Rm, best[..., None], -1)[..., 0]
    reg = np.where(mat > 1, np.maximum(reg, 0), 0)
    sel = (R == reg[..., None]) & (mat[..., None] > 1)
    val = (Vv * sel).sum(-1) / np.maximum(sel.sum(-1), 1)
    # di chi è il contorno (il pezzo più votato tra i sottopixel di contorno)
    Ob = np.where(M == OL, blk(cv.own), -1)
    same = (Ob[..., :, None] == Ob[..., None, :]) & (Ob[..., :, None] > 0)
    own = np.take_along_axis(Ob, same.sum(-1).argmax(-1)[..., None], -1)[..., 0]
    own = np.where(mat == OL, np.maximum(own, 0), 0)
    return mat, reg, val, own

def _matita(seed=11, N=256):
    """il tratteggio della matita: macchie e tratti corti un po' storti, fissi sul pezzo"""
    rng = np.random.default_rng(seed)
    w = rng.standard_normal((N, N)).astype(np.float32)
    k = np.zeros((5, 5), np.float32)
    for i in range(5): k[4 - i, i] = 1.0
    k[3, 2] = k[2, 3] = 0.5
    t1 = nd.convolve(w, k / k.sum(), mode='wrap')
    t2 = nd.gaussian_filter(rng.standard_normal((N, N)).astype(np.float32), 0.8, mode='wrap')
    t1 = (t1 - t1.mean()) / t1.std(); t2 = (t2 - t2.mean()) / t2.std()
    t = 0.55 * t1 + 0.75 * t2
    return np.clip((t - t.mean()) / t.std(), -2.2, 2.2)
TEX = _matita()

def bands(val, cuts, names):
    out = np.full(val.shape, KI[names[-1]], np.int16)
    for c, n in reversed(list(zip(cuts, names))):
        out[val < c] = KI[n]
    return out

RAMP = {
    'fur': ([0.17, 0.30, 0.45, 0.70, 0.88], ['r1', 'r0', 'o1', 'o0', 'y1', 'y0']),
    'sock': ([0.22, 0.40, 0.58, 0.76], ['p3', 'r2', 'r1', 'r0', 'o1']),
    'flame': ([1.15, 2.1, 3.1, 4.4, 6.0, 8.6], ['r2', 'r1', 'r0', 'o1', 'o0', 'y1', 'y0']),
    'crest': ([1.15, 2.1, 3.1, 4.3, 5.6], ['r2', 'r1', 'r0', 'o1', 'o0', 'y1']),
    'ruff': ([1.1, 2.0, 3.1, 4.4], ['r2', 'r1', 'r0', 'o1', 'o0']),
    'earout': ([1.2, 2.3, 3.5], ['r2', 'r1', 'r0', 'o1']),
    'earin': ([1.1, 2.4], ['r2', 'r3', 'r4']),
}

def colorize(cv, mat, reg, val, own):
    H, W = mat.shape; out = np.zeros((H, W), np.int16)
    yy, xx = np.mgrid[0:H, 0:W]
    for r, inf in cv.info.items():
        Rm = (reg == r) & (mat == inf['mat'])
        if not Rm.any(): continue
        ax, ay = inf['anchor']; o = (zlib.crc32(inf['name'].encode()) % 97) * 7
        tex = TEX[(yy - ay + o) % TEX.shape[0], (xx - ax + 3 * o) % TEX.shape[1]]
        m = inf['mat']; vv = val.copy()
        if m == FUR:
            key = 'fur'; vv = vv + 0.065 * tex
        elif m == SOCK:
            key = 'sock'; vv = vv + 0.07 * tex
        elif m in (FLAME,):
            key = 'flame'
            vv = vv + 1.1 * np.sin((xx - ax) * 0.55 + (yy - ay) * 0.17 + r) + 0.6 * np.sin((yy - ay) * 0.37 - (xx - ax) * 0.12 + 2 * r) + 0.45 * tex
        elif m == CREST:
            key = 'crest'; vv = vv + 0.8 * np.sin((xx - ax) * 0.7 + (yy - ay) * 0.25 + r) + 0.4 * tex
        elif m == RUFF:
            key = 'ruff'; vv = vv + 0.6 * np.sin((xx - ax) * 0.9 + 0.3 * (yy - ay)) + 0.4 * tex
        elif m == EAROUT:
            key = 'earout'; vv = vv + 0.35 * tex
        elif m == EARIN:
            key = 'earin'; vv = vv + 0.3 * tex
        else:
            continue
        cuts, names = RAMP[key]
        t = bands(vv, cuts, names)
        out[Rm] = t[Rm]
    # contorni: fuori marrone scuro (rosso scurissimo vicino alle fiamme), dentro più chiari
    olm = mat == OL
    empty = np.pad(mat == 0, 1, constant_values=True)
    outer = olm & (empty[:-2, 1:-1] | empty[2:, 1:-1] | empty[1:-1, :-2] | empty[1:-1, 2:])
    fl = np.isin(mat, (FLAME, CREST, EAROUT, EARIN, RUFF)).astype(int); fu = np.isin(mat, (FUR, SOCK)).astype(int)
    sh = lambda a, dy, dx: np.roll(np.roll(a, dy, 0), dx, 1)
    nfl = sum(sh(fl, dy, dx) for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)))
    nfu = sum(sh(fu, dy, dx) for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)))
    out[olm] = KI['il']
    out[olm & (nfl > nfu)] = KI['r3']
    out[outer] = KI['ol']
    out[outer & (nfl > nfu)] = KI['r4']
    # linee interne solo dove servono: sul bordo in alto di un pezzo di pelo che sta sopra altro pelo la linea non c'è
    # (la spalla e la coscia si fondono nel corpo, come nel disegno); restano sui lati e sotto
    part = np.zeros(len(cv.info) + 2, np.int32)
    for r, inf in cv.info.items(): part[r] = inf['part']
    pm = part[reg]; po = part[own]
    isfur = np.isin(mat, (FUR, SOCK))
    drop = []
    for i, j in zip(*np.nonzero(olm & ~outer & (own > 0))):
        o = po[i, j]
        if cv.info[own[i, j]]['mat'] not in (FUR, SOCK): continue
        D = np.zeros(2); src = None; other = False
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                if (di or dj) and 0 <= i + di < H and 0 <= j + dj < W:
                    if pm[i + di, j + dj] == o and isfur[i + di, j + dj]:
                        D += (dj, di)
                        if abs(di) + abs(dj) == 1 and src is None: src = (i + di, j + dj)
                    elif isfur[i + di, j + dj]:
                        other = True
        if src is None or not other: continue
        n = -D / (np.linalg.norm(D) + 1e-9)
        if n @ LIGHT > 0.2:                       # bordo verso la luce: niente linea
            drop.append((i, j, src))
    for i, j, (a_, b_) in drop:
        out[i, j] = out[a_, b_]
    return out

# ------------------------------------------------------------------ muso: occhi, naso, bocca, guance, dita
def eye(out, ok, cx, cy, a, b, far=False, closed=False, ss=6):
    H, W = out.shape
    for i in range(int(cy - b - 2), int(cy + b + 3)):
        for j in range(int(cx - a - 2), int(cx + a + 3)):
            if not (0 <= i < H and 0 <= j < W) or not ok[i, j]: continue
            votes = {}
            for si in range(ss):
                for sj in range(ss):
                    py = i + (si + .5) / ss; px = j + (sj + .5) / ss
                    ex = (px - cx) / a; ey = (py - cy) / b; r = np.hypot(ex, ey)
                    if r > 1: continue
                    if closed:
                        if abs(ey - 0.25 - 0.25 * ex * ex) < 0.16: votes['ek'] = votes.get('ek', 0) + 1
                        continue
                    ring = 1 - 1.05 / max(a, 1.5) if ey > -0.35 else 1 - 1.8 / max(a, 1.5)
                    if r > ring: c = 'ek'
                    else:
                        c = 'e0' if ey < -0.45 else ('e1' if ey < -0.1 else ('e2' if ey < 0.35 else ('e3' if ey < 0.62 else 'e4')))
                        if (ex / 0.27) ** 2 + ((ey - 0.02) / 0.5) ** 2 < 1: c = 'ek'
                        if ((ex - (0.05 if far else -0.22)) / 0.3) ** 2 + ((ey + 0.4) / 0.24) ** 2 < 1: c = 'ew'
                        if not far and a >= 3.5 and ((ex - 0.3) / 0.13) ** 2 + ((ey - 0.42) / 0.11) ** 2 < 1: c = 'ew'
                    votes[c] = votes.get(c, 0) + 1
            if not votes: continue
            if closed:
                if votes.get('ek', 0) >= ss * 2: out[i, j] = KI['ek']
                continue
            if sum(votes.values()) < ss * ss * 0.45: continue
            pr = dict(ek=4, ew=5, e0=1, e1=1, e2=1, e3=1, e4=1)
            out[i, j] = KI[max(votes, key=lambda q: votes[q] * (1 + 0.35 * pr[q]))]

def face(v, cv, P, Hx, out, reg, blink=False):
    head_regs = [r for r, inf in cv.info.items() if inf['name'] == 'testa']
    onhead = np.isin(reg, head_regs)
    fwd = nrm(Hx((10, 0, 0)) - Hx((0, 0, 0)))
    for s in (1, -1):
        pe, ne = eye_world(Hx, s)
        cosv = ne @ v.c
        if cosv < 0.28: continue
        q = v.P(pe) / v.SS
        a = 4.5 / v.upp * max(cosv, 0.38) * 0.98; b = 5.6 / v.upp * 0.92
        eye(out, onhead, q[0], q[1], a, b, far=cosv < 0.55, closed=blink)
        if cosv > 0.45:
            g = v.P(Hx((9.0, 12.0 * s, -5.0))) / v.SS
            for i in range(int(g[1] - 2), int(g[1] + 3)):
                for j in range(int(g[0] - 4), int(g[0] + 5)):
                    if 0 <= i < out.shape[0] and 0 <= j < out.shape[1] and onhead[i, j] and out[i, j] in (KI['o0'], KI['y1'], KI['o1'], KI['y0']):
                        if ((j + .5 - g[0]) / 3.4) ** 2 + ((i + .5 - g[1]) / 1.5) ** 2 < 1: out[i, j] = KI['bl']
    if fwd @ v.c > -0.15:
        n_ = v.P(Hx((16.0, 0, -6.2))) / v.SS
        for (dx, dy) in ((-1, 0), (0, 0), (1, 0), (0, 1)):
            i, j = int(n_[1] + dy), int(n_[0] + dx)
            if 0 <= i < out.shape[0] and 0 <= j < out.shape[1] and onhead[i, j]: out[i, j] = KI['r2']
        mth = v.P(Hx((15.2, 0, -8.4))) / v.SS
        sc = max(fwd @ v.c, 0.42)
        mw, mh = 4.3 * sc / (v.upp / 0.91), 3.5 / (v.upp / 0.91)
        for i in range(int(mth[1] - 1), int(mth[1] + mh + 2)):
            for j in range(int(mth[0] - mw - 1), int(mth[0] + mw + 2)):
                if not (0 <= i < out.shape[0] and 0 <= j < out.shape[1]) or not onhead[i, j]: continue
                ex = (j + .5 - mth[0]) / mw; ey = (i + .5 - mth[1]) / mh
                if ey < 0 or ex * ex + ey * ey > 1: continue
                rr = ex * ex + ey * ey
                out[i, j] = KI['ek'] if rr > 0.62 or ey < 0.18 else (KI['to'] if ey > 0.55 else KI['mo'])

def toes(v, cv, out, reg):
    """le dita: due righe corte sul davanti di ogni piede che si vede"""
    part = np.zeros(len(cv.info) + 2, np.int32)
    for r, inf in cv.info.items(): part[r] = inf['part']
    pr = part[reg]
    for (Pc, s, far, pid) in getattr(cv, 'toes', []):
        fwd = np.array((1.0, 0, 0))
        if fwd @ v.c < -0.3: continue
        for dy in (-1.1, 1.1):
            a = v.P(Pc + np.array((3.0, dy, 0.9))) / v.SS; b = v.P(Pc + np.array((3.9, dy, -1.6))) / v.SS
            n = int(max(abs(b - a)) + 1)
            for k in range(n + 1):
                q = a + (b - a) * k / max(n, 1)
                i, j = int(q[1]), int(q[0])
                if 0 <= i < out.shape[0] and 0 <= j < out.shape[1] and pr[i, j] == pid and out[i, j] in (KI['r1'], KI['r2'], KI['r0'], KI['o1']):
                    out[i, j] = KI['p3'] if not far else KI['r4']

def embers(v, P, out, mode):
    """braci che si staccano dalla coda e dalla cresta e salgono (solo da fermo)"""
    if mode == 'corsa': return
    B = body_xf(P)
    for (p0, p1, off) in [((-53, 2.5, 60), (-58, 4.0, 82), 0.0), ((-30, -3.0, 70), (-26, -4.5, 86), 0.45),
                          ((-49, -2.0, 36), (-55, -3.5, 52), 0.7)]:
        t = (P['flick'] + off) % 1.0
        if t > 0.8: continue
        k = t / 0.8
        p = np.array(p0) * (1 - k) + np.array(p1) * k + np.array((0.8 * np.sin(6.28 * k * 1.5), 0, 0))
        q = v.P(B(p)) / v.SS
        big = k < 0.5
        pts = [((0, 0), 'y1'), ((0, -1), 'o0'), ((0, 1), 'r1'), ((-1, 0), 'r1'), ((1, 0), 'r1')] if big else [((0, 0), 'o0'), ((0, -1), 'r1')]
        for (dx, dy), c in pts:
            i, j = int(q[1]) + dy, int(q[0]) + dx
            if 0 <= i < out.shape[0] and 0 <= j < out.shape[1] and out[i, j] == 0: out[i, j] = KI[c]

FEAT = None
def despeckle(out, mat):
    """pulizia da pixel artist: un pixel solo, diverso da tutti e quattro i vicini che invece sono uguali tra loro, prende il loro
    colore (non sui contorni, non fuori dalla sagoma)"""
    H, W = out.shape
    o = out.copy()
    up, dn = np.roll(out, 1, 0), np.roll(out, -1, 0); lf, rt = np.roll(out, 1, 1), np.roll(out, -1, 1)
    same = (up == dn) & (up == lf) & (up == rt) & (up != out) & (up > 0)
    inner = np.isin(mat, (FUR, SOCK, FLAME, CREST, RUFF, EAROUT, EARIN))
    nb_ok = ~np.isin(up, [KI['ol'], KI['il'], KI['r3'], KI['r4']])
    sel = same & inner & nb_ok
    sel[0, :] = sel[-1, :] = sel[:, 0] = sel[:, -1] = False
    o[sel] = up[sel]
    return o

def sprite(theta, p=0.0, mode='corsa', blink=False):
    v, cv, P, Hx = frame(theta, p, mode)
    mat, reg, val, own = down(cv)
    out = colorize(cv, mat, reg, val, own)
    out = despeckle(out, mat)
    face(v, cv, P, Hx, out, reg, blink=blink)
    toes(v, cv, out, reg)
    embers(v, P, out, mode)
    rgba = np.zeros(out.shape + (4,), np.uint8); rgba[..., :3] = RGB[out]; rgba[..., 3] = (out > 0) * 255
    return rgba
