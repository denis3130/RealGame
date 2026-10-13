"""Volpe di fuoco (Niumon): base solida a volumi. x avanti, y sinistra, z su; 1 unità ~ 10 px del disegno."""
import numpy as np
from base import Model, nrm, rotz, roty, rotx, frame_from

def bez(p0, p1, p2, n):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2

def tongue(m, base, d, L, r0, part, g, curl=(0, 0, 1), bend=0.45, n=5, rtip=0.06, wob=None, pw=1.15):
    """lingua di fiamma: curva che parte lungo d e piega verso curl, raggio che va a zero"""
    base = np.asarray(base, float); d = nrm(d); cu = nrm(curl)
    p1 = base + d * L * 0.55
    p2 = base + nrm(d * (1 - bend) + cu * bend) * L
    if wob is not None: p2 = p2 + np.asarray(wob, float); p1 = p1 + np.asarray(wob, float) * 0.35
    pts = bez(base, p1, p2, n)
    rs = [r0 * (1 - (i / (n - 1)) ** pw) + rtip * (i / (n - 1)) for i in range(n)]
    rs[-1] = rtip
    return m.tube(pts, rs, part, g)

def flat_chain(m, pts, wr, tr, part, g, Vax=None, Wax=None):
    """catena di ellissoidi schiacciati: larghezza wr (lungo Vax), spessore tr (lungo Wax)"""
    out = []
    for i in range(len(pts) - 1):
        a, b = np.asarray(pts[i], float), np.asarray(pts[i + 1], float)
        d = b - a; L = np.linalg.norm(d); U = d / L
        V = np.asarray(Vax, float); V = nrm(V - np.dot(V, U) * U); W = np.cross(U, V)
        if Wax is not None and np.dot(W, Wax) < 0: W = -W
        w = (wr[i] + wr[i + 1]) / 2; t = (tr[i] + tr[i + 1]) / 2
        out.append(m.ell((a + b) / 2, (L / 2 + w * 0.35, w, t), part, g, rot=np.array([U, V, W])))
    return out

P0 = dict(head_yaw=0.0, head_pitch=0.0, head_roll=0.0, breath=0.0, tail_ph=0.0, ear_tw=0.0, anim=False)

HS = 1.08                                   # testa più grande (stile tenero)
KB = 3.0                                    # il dietro (anche zampe e coda) più vicino: corpo più corto
HEAD_C = np.array((21.5, 0, 52.5)); HEAD_R = (14.0 * HS, 16.0 * HS, 15.5 * HS)

def build(**kw):
    P = dict(P0); P.update(kw)
    m = Model()
    gB = m.group('body', 8.5)
    gH = m.group('head', 5.0)
    gC = m.group('crest', 2.6)
    gR = m.group('ruff', 1.2)
    gT = m.group('tail', 2.4)
    gK = m.group('tuft', 1.0)
    gE = m.group('ears', 1.0)
    br = P['breath']
    ph = P['tail_ph'] * 2 * np.pi
    sw = lambda i, a=1.0: a * np.sin(ph + i * 1.3)
    # ---- corpo
    m.ell((9, 0, 21.5 + 0.15 * br), (13, 8.0 + 0.25 * br, 8.8 + 0.25 * br), 'fur', gB)
    m.push(np.eye(3), (KB, 0, 0)); m.ell((-11, 0, 20.5), (11, 7.6, 8.2), 'fur', gB); m.pop()
    m.ell((17, 0, 30), (6.5, 6.3, 8), 'fur', gB)
    for s in (1, -1):                       # zampe davanti
        y = 6.2 * s
        m.ell((12.5, y, 18), (5, 3.4, 6.5), 'fur', gB)
        m.cone((13, y, 14), (14, y, 4.6), 3.0, 2.45, 'leg', gB)
        m.ell((15.4, y, 2.4), (4.2, 3.1, 2.4), 'paw', gB)
        tongue(m, (10.5, y + 0.9 * s, 13.5), (-1, 0.15 * s, -0.3), 4.2, 1.4, 'tuftfur', gK, curl=(-1, 0, 0.4), n=3)
    m.push(np.eye(3), (KB, 0, 0))
    for s in (1, -1):                       # zampe dietro
        y = 6.0 * s
        m.ell((-12, y, 17), (7.5, 4.2, 8.5), 'fur', gB)
        m.cone((-15, y, 11), (-16.5, y, 7), 3.1, 2.5, 'leg', gB)
        m.cone((-16.5, y, 7), (-14.5, y, 4.2), 2.5, 2.4, 'leg', gB)
        m.ell((-13, y, 2.4), (4.1, 3.0, 2.4), 'paw', gB)
        tongue(m, (-18.5, y + 0.6 * s, 10.5), (-0.6, 0.1 * s, 0.8), 4.0, 1.3, 'tuftfur', gK, curl=(-0.3, 0, 1), n=3)
    m.pop()
    # ---- gorgiera
    m.ell((22, 0, 28), (6.6, 12.2, 8.8), 'ruff', gR)
    for a in np.radians([-78, -54, -30, -8, 14, 36, 58, 80]):
        b = np.array([22 + 5.0 * np.cos(a), 10.0 * np.sin(a), 23.0])
        d = np.array([0.5 * np.cos(a), 0.9 * np.sin(a), -1.0])
        tongue(m, b, d, 9.0, 2.9, 'ruff', gR, curl=(0.4 * np.cos(a), 0.8 * np.sin(a), -1), bend=0.3, n=3)
    for s in (1, -1):
        tongue(m, (18.5, 10.0 * s, 25.5), (-0.5, 0.75 * s, -0.45), 6.5, 2.4, 'ruff', gR, curl=(-1, 0.3 * s, -0.2), bend=0.3, n=3)
        tongue(m, (20, 11.5 * s, 31), (-0.1, 1.0 * s, -0.25), 6.5, 2.4, 'ruff', gR, curl=(-0.3, 1 * s, -0.6), bend=0.3, n=3)
        tongue(m, (23, 10.5 * s, 34), (0.2, 1.0 * s, 0.1), 5.0, 2.0, 'ruff', gR, curl=(0, 1 * s, -0.5), bend=0.3, n=3)
    # ---- ciuffo sulla schiena
    for i, (x, z, L) in enumerate([(3, 27.8, 7.0), (-4, 27.8, 8.5), (-10.5, 27.0, 6.5)]):
        tongue(m, (x, 0, z), (-0.45, 0, 1), L, 2.5, 'flame', gK, curl=(-1, 0, 0.1), bend=0.55, n=4,
               wob=(0, 0.35 * sw(i), 0.25 * sw(i + 2)))
    # ---- coda di fuoco: la sagoma del disegno portata nel piano del corpo e gonfiata
    import sagome
    d2, hh, u0, v0, cs = sagome.tail_grid(phase=P['tail_ph'] if P.get('anim') else None)
    m.push(np.eye(3), (KB, 0, 0))
    m.infl((0, 0, 0), (1, 0, 0), (0, 0, 1), d2, hh, u0, v0, cs, 'flame', gT)
    tail_d2 = d2
    # braci che si staccano dalla coda e salgono (come nel disegno)
    if P.get('anim'):
        gX = m.group('embers', 0.0)
        for (p0, p1, off) in [((-50, 2.5, 58), (-55, 4.0, 80), 0.0), ((-27, -3.0, 70), (-23, -4.5, 87), 0.45),
                              ((-46, -2.0, 34), (-52, -3.5, 50), 0.7)]:
            t = (P['tail_ph'] + off) % 1.0
            if t > 0.8: continue
            k = t / 0.8
            p = np.array(p0) * (1 - k) + np.array(p1) * k + np.array((0.8 * np.sin(6.28 * k * 1.5), 0, 0))
            rr = 1.25 * (1 - k ** 2) + 0.3
            m.cone(p, p + np.array((0.3, 0, 2.2 * rr)), rr, 0.08, 'ember', gX)
    m.pop()
    # ---- testa (gira sul collo)
    Rh = rotz(np.radians(P['head_yaw'])) @ rotx(np.radians(P['head_roll'])) @ roty(np.radians(-P['head_pitch']))
    m.push(Rh, (0, 0, 0.12 * br), pivot=(17, 0, 34))
    hc = HEAD_C
    H = lambda p: hc + HS * np.asarray(p, float)
    head = dict(c=m.X(hc), R=m.XR().copy(), r=HEAD_R, s=HS)
    m.ell(hc, HEAD_R, 'head', gH)
    m.ell(H((5.0, 0, -7.0)), (9.0, 12.5, 7.5), 'head', gH)            # guance e mento
    m.ell(H((12.0, 0, -8.6)), (4.6, 5.0, 3.8), 'head', gH)            # muso
    for s in (1, -1):                                                  # ciuffi sulle guance
        tongue(m, H((2.0, 14.0 * s, -9.0)), (-0.2, 0.8 * s, -0.6), 5.0, 1.8, 'tuftfur', gK, curl=(-0.3, 0.4 * s, -1), bend=0.3, n=4, pw=0.9)
        tongue(m, H((0.5, 15.5 * s, -3.5)), (-0.35, 0.9 * s, -0.25), 4.6, 1.7, 'tuftfur', gK, curl=(-0.5, 0.5 * s, -0.8), bend=0.3, n=4, pw=0.9)
    # cresta di fiamma: una massa che sale dalla fronte e si apre in lingue che vanno indietro
    m.ell(H((2.0, 0.5, 11.0)), (9.5, 10.5, 7.5), 'flame', gC, rot=roty(np.radians(18)).T)
    cr = [
        ([(1, 3.0, 15), (-2, 3.5, 22), (-6, 4.0, 29), (-10, 4.5, 34), (-13, 5.0, 37.5)], [5.6, 4.6, 3.2, 1.6, 0.06]),
        ([(5, -2.5, 14), (4, -3.0, 20), (1, -3.2, 25.5), (-1.5, -3.5, 29)], [4.6, 3.4, 1.8, 0.06]),
        ([(1, -8.0, 12.5), (-2, -10.0, 17.5), (-5, -11.5, 21.5), (-7, -12.0, 24)], [3.8, 2.8, 1.4, 0.06]),
        ([(-1, 8.0, 12.5), (-4, 10.5, 17.0), (-8, 12.0, 21), (-11, 12.5, 23.5)], [3.8, 2.8, 1.4, 0.06]),
        ([(8.5, 0.0, 10.0), (10.5, 0.5, 14.5), (11.5, 1.0, 18)], [3.4, 2.2, 0.06]),
        ([(-6, 0.0, 13.0), (-11, 0.0, 17.0), (-15, 0.0, 19.5)], [3.6, 2.2, 0.06]),
    ]
    for j, (pts, rads) in enumerate(cr):
        pts = np.array(pts, float)
        for i in range(1, len(pts)):
            k = i / (len(pts) - 1)
            pts[i] += (0.5 * k * sw(j + i, 1), 0.6 * k * sw(j + i + 2, 1), 0)
        m.tube([H(p) for p in pts], rads, 'flame', gC)
    # orecchie: coni schiacciati (dentro rosso scuro), con due ciuffi di fiamma sul bordo esterno
    ears = []
    for s in (1, -1):
        B = H((-2.5, 12.5 * s, 8.5)); T = B + 1.12 * (H((-11.0, 25.5 * s, 30.5)) - B)
        tw = P['ear_tw'] if s > 0 else 0
        T = T + np.array((-2.5 * tw, 0, -0.8 * tw))
        U = nrm(T - B); L = np.linalg.norm(T - B)
        Wf = nrm((0.85, 0.5 * s, 0.15)); Wf = nrm(Wf - np.dot(Wf, U) * U)
        Vo = np.cross(U, Wf) * s                     # verso l'esterno
        if np.dot(Vo, (0, s, 0)) < 0: Vo = -Vo
        n = 6
        us = np.linspace(0, 1, n)
        pts = [B + U * L * t for t in us]
        wr = [10.4 * (1 - t) ** 0.7 + 0.25 for t in us]
        tr = [2.6 * (1 - t) ** 0.8 + 0.2 for t in us]
        prims = flat_chain(m, pts, wr, tr, 'ear', gE, Vax=Vo, Wax=Wf)
        for (t, L2, r0) in [(0.38, 4.6, 1.7), (0.62, 3.6, 1.3)]:
            w = 10.4 * (1 - t) ** 0.7
            b = B + U * L * t + Vo * (w * 0.75)
            tongue(m, b, nrm(Vo * 0.9 + U * 0.6), L2, r0, 'earfl', gE, curl=U, bend=0.5, n=3)
        ears.append(dict(B=m.X(B) if False else None, Bh=B, U=U, V=Vo, W=Wf, L=L, s=s))
    m.pop()
    info = dict(head=head, ears=ears, P=P, tail_d2=tail_d2)
    return m, info
