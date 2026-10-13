"""Colori della volpe di fuoco.
Per ogni sottopixel: un'etichetta (materiale da ombreggiare, oppure un colore fisso del muso/occhi) e due valori continui
(luce e 'fiamma'). Il tono si sceglie solo dopo aver rimpicciolito, così le fasce di colore restano pulite."""
import numpy as np

PAL = np.array([
    (0, 0, 0),          # 0 vuoto
    (252, 216, 152),    # 1 pelo chiaro
    (247, 189, 108),    # 2 pelo medio
    (241, 156, 78),     # 3 pelo ombra
    (252, 218, 132),    # 4 fiamma cuore
    (248, 180, 84),     # 5 fiamma gialla
    (242, 138, 60),     # 6 fiamma arancio
    (232, 96, 60),      # 7 fiamma rosso arancio
    (206, 62, 48),      # 8 fiamma rossa
    (236, 112, 84),     # 9 zampa chiara
    (216, 86, 64),      # 10 zampa media
    (176, 60, 50),      # 11 zampa ombra
    (178, 58, 50),      # 12 orecchio dentro
    (138, 40, 42),      # 13 orecchio dentro ombra
    (60, 26, 28),       # 14 contorno occhio / linee scure
    (138, 32, 32),      # 15 iride scura
    (200, 56, 42),      # 16 iride rossa
    (244, 146, 64),     # 17 iride bassa arancio
    (66, 18, 22),       # 18 pupilla
    (255, 253, 244),    # 19 luce dell'occhio
    (200, 82, 60),      # 20 naso
    (132, 36, 40),      # 21 bocca
    (238, 128, 128),    # 22 lingua
    (243, 132, 98),     # 23 guance rosse
    (74, 32, 30),       # 24 contorno esterno
    (176, 86, 52),      # 25 linea interna (pelo)
    (226, 122, 64),     # 26 pelo ombra profonda
    (156, 42, 40),      # 27 fiamma rosso scuro / linea interna fiamme
    (92, 44, 32),       # 28 contorno del pelo (stile 2D)
    (120, 30, 32),      # 29 contorno delle fiamme (stile 2D)
], np.uint8)

# materiali ombreggiati (etichette >= 100)
FUR, SOCK, FLAME, CREST, RUFF, EARIN, EAROUT = 100, 101, 102, 103, 104, 105, 106
MATS = (FUR, SOCK, FLAME, CREST, RUFF, EARIN, EAROUT)
LINE_OF = {FUR: 25, SOCK: 11, FLAME: 27, CREST: 27, RUFF: 27, EARIN: 24, EAROUT: 27}

def tone(mat, nl, g):
    """dal materiale e dai valori continui al colore della tavolozza"""
    nl = np.asarray(nl); g = np.asarray(g)
    if mat == FUR:
        return np.where(nl > 0.84, 1, np.where(nl > 0.22, 2, np.where(nl > -0.30, 3, 26)))
    if mat == SOCK:
        return np.where(nl > 0.45, 9, np.where(nl > -0.15, 10, 11))
    if mat == FLAME:
        return np.where(g > 0.975, 4, np.where(g > 0.92, 5, np.where(g > 0.79, 6, np.where(g > 0.55, 7, np.where(g > 0.25, 8, 27)))))
    if mat == CREST:
        return np.where(g > 0.80, 5, np.where(g > 0.62, 6, np.where(g > 0.40, 7, np.where(g > 0.20, 8, 27))))
    if mat == RUFF:
        return np.where(g > 0.88, 5, np.where(g > 0.70, 6, np.where(g > 0.46, 7, 8)))
    if mat == EARIN:
        return np.where(nl > 0.15, 12, 13)
    if mat == EAROUT:
        return np.where(g > 0.5, 7, 8)
    raise ValueError(mat)

PRIOR = {14: 3, 18: 3, 19: 3, 20: 3, 21: 3, 15: 2, 16: 2, 17: 2, 22: 2, 23: 1, 11: 1}

def head_local(info, pos):
    h = info['head']
    return ((pos - h['c']) @ h['R']) / h.get('s', 1.0)

def face(info, pos, open_mouth=True, blink=0.0):
    l = head_local(info, pos)
    X, Y, Z = l[..., 0], l[..., 1], l[..., 2]
    out = np.zeros(X.shape, np.int16)
    front = X > 0
    for s in (1, -1):
        yc, zc, hw, hh = 9.2 * s, 0.6, 4.0, 5.9
        ex = (Y - yc) / hw * s; ey = (Z - zc) / hh
        exs = (Y - yc) / hw
        r = np.sqrt(ex ** 2 + ey ** 2)
        inside = front & (r <= 1.0)
        if blink > 0.5:
            lid = inside & (np.abs(ey + 0.15) < 0.24)
            out[lid] = 14
            continue
        ring = inside & ((r > 0.80) | ((ey > 0.25) & (r > 0.70)))
        iris = inside & ~ring
        o = np.full(X.shape, 16, np.int16)
        o[ey > 0.2] = 15
        o[ey < -0.35] = 17
        pup = ((ex / 0.34) ** 2 + ((ey + 0.02) / 0.58) ** 2) < 1
        o[pup] = 18
        hl = (((exs - 0.10) / 0.28) ** 2 + ((ey - 0.38) / 0.3) ** 2) < 1
        o[hl] = 19
        hl2 = (((exs + 0.32) / 0.13) ** 2 + ((ey + 0.52) / 0.13) ** 2) < 1
        o[hl2] = 19
        out[iris] = o[iris]
        out[ring] = 14
    nz0, nz1 = -9.3, -7.7
    t = (Z - nz0) / (nz1 - nz0)
    nose = front & (Z > nz0) & (Z < nz1) & (np.abs(Y) < 1.5 * t + 0.15)
    out[nose] = 20
    mz = -10.0
    if open_mouth:
        mo = front & (Z < mz) & ((Y / 3.7) ** 2 + ((Z - mz) / 3.5) ** 2 < 1)
        ton = mo & ((Y / 2.6) ** 2 + ((Z - (mz - 3.1)) / 1.6) ** 2 < 1)
        rim = front & (Z < mz + 0.4) & ((Y / 4.15) ** 2 + ((Z - mz) / 3.95) ** 2 < 1) & ~mo
        out[rim & (out == 0)] = 14
        out[mo] = 21
        out[ton] = 22
    else:
        line = front & (np.abs(Z - (mz - 0.3 * np.cos(Y / 1.6) ** 2)) < 0.35) & (np.abs(Y) < 2.8)
        out[line] = 14
    for s in (1, -1):
        bl = front & (((Y - 11.8 * s) / 2.6) ** 2 + ((Z + 4.6) / 1.25) ** 2 < 1)
        out[bl & (out == 0)] = 23
    return out

def forehead_flame(info, pos):
    l = head_local(info, pos)
    X, Y, Z = l[..., 0], l[..., 1], l[..., 2]
    v = (X > -3) & (Z > 2.8 + 1.15 * np.abs(Y))
    cap = Z > 9.0 - 0.15 * np.maximum(-X, 0)
    return v | cap

def smooth_normals(b, sigma=2.0):
    from scipy import ndimage as ndi
    if sigma <= 0: return b['n']
    hit = b['hit'].astype(np.float32)
    w = ndi.gaussian_filter(hit, sigma)
    n = np.dstack([ndi.gaussian_filter(b['n'][..., k] * hit, sigma) for k in range(3)]) / np.maximum(w, 1e-6)[..., None]
    n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-6)
    return np.where(b['hit'][..., None], n, b['n'])

def labels(m, info, b, blink=0.0, open_mouth=True, light=(-0.3, 0.85, 0.45)):
    """etichette e valori continui per ogni sottopixel"""
    hit = b['hit']; H, W = hit.shape
    c, r, u = b['c'], b['r'], b['u']
    L = light[0] * r + light[1] * u + light[2] * c; L /= np.linalg.norm(L)
    n = smooth_normals(b, sigma=b.get('nsig', 2.0)); pos = b['pos']
    prim = np.clip(b['prim'], 0, len(m.prims) - 1)
    pid = np.array([d['part'] for d in m.prims]); name = np.array(m.pname)[pid[prim]]
    gid = np.array([d['group'] for d in m.prims])[prim]
    nl = n @ L
    fr = n @ c
    lab = np.zeros((H, W), np.int16)
    fur = hit & np.isin(name, ['fur', 'head', 'leg', 'tuftfur', 'paw'])
    lab[fur] = FUR
    z = pos[..., 2]
    lab[hit & np.isin(name, ['leg', 'paw']) & (z < 8.5)] = SOCK
    hd = hit & (name == 'head')
    ff = forehead_flame(info, pos)
    flame = hit & np.isin(name, ['flame', 'earfl', 'ember'])
    lab[flame] = FLAME
    crest = hit & ((gid == m.gname['crest']) | (hd & ff))
    lab[crest] = CREST
    lab[hit & (name == 'ruff')] = RUFF
    # spessore locale delle lingue (punte più rosse)
    rloc = np.full((H, W), 6.0)
    for k, d in enumerate(m.prims):
        if d['type'] == 1:
            msk = hit & (prim == k) & (lab != FUR)
            if not msk.any(): continue
            a = np.array(d['p'][0:3]); bb = np.array(d['p'][3:6]); ra, rb = d['p'][6], d['p'][7]
            ba = bb - a; tt = np.clip(((pos[msk] - a) @ ba) / (ba @ ba), 0, 1)
            rloc[msk] = ra + (rb - ra) * tt
    g = fr + 0.06 * np.clip(nl, -1, 1) + 0.08 * np.clip((rloc - 2.5) / 4, -1, 0.5)
    g = g.astype(np.float64)
    # coda gonfiata: il cuore giallo segue la sagoma (più lontano dal bordo = più giallo), come nel disegno
    for k, d in enumerate(m.prims):
        if d['type'] != 3: continue
        msk = hit & (prim == k)
        if not msk.any(): continue
        l = (pos[msk] - d['c']) @ np.asarray(d['R']).T
        nu, nv, u0, v0, cs = int(d['p'][0]), int(d['p'][1]), d['p'][2], d['p'][3], d['p'][4]
        D2 = info['tail_d2']
        iu = np.clip(np.round((l[:, 0] - u0) / cs).astype(int), 0, nu - 1)
        iv = np.clip(np.round((l[:, 1] - v0) / cs).astype(int), 0, nv - 1)
        din = np.clip(-D2[iv, iu], 0, None)
        core = np.clip(din / 5.5, 0, 1)
        g[msk] = np.maximum(0.45 * fr[msk] + 0.58 * core, 0.86 * fr[msk] - 0.08) + 0.05 * np.clip(nl[msk], -1, 1)
    lh = head_local(info, pos)
    hfrac = np.clip((lh[..., 2] - 9.0) / 26.0, 0, 1)
    gc = 0.5 * fr + 0.55 * (1 - np.clip(np.abs(lh[..., 1]) / 10.0, 0, 1)) - 0.18 * hfrac + 0.1 * np.clip(nl, 0, 1)
    g = np.where(lab == CREST, gc, g)
    g = np.where(lab == RUFF, 0.8 * g + 0.25 * np.clip((z - 18) / 12, 0, 1) - 0.05, g)
    # orecchie
    ear = hit & (name == 'ear')
    if ear.any():
        from volpe import HEAD_C
        Rh = info['head']['R']; hcw = info['head']['c']
        for e in info['ears']:
            Bw = Rh @ (e['Bh'] - HEAD_C) + hcw
            Uw, Vw, Ww = Rh @ e['U'], Rh @ e['V'], Rh @ e['W']
            dlt = pos - Bw
            uu = dlt @ Uw / e['L']; vv = dlt @ Vw
            side = ear & (np.sign(dlt @ (Rh @ np.array((0, 1., 0)))) == e['s'])
            half = 10.4 * np.clip(1 - uu, 0, 1) ** 0.7 + 0.25
            inner = side & (n @ Ww > 0.2) & (np.abs(vv) < half * 0.52) & (uu < 0.82)
            lab[inner] = EARIN
            lab[side & ~inner] = EAROUT
    g = np.where(lab == EAROUT, fr * 0.8 + 0.2 * nl, g)
    # dita delle zampe
    paws = hit & (name == 'paw')
    if paws.any():
        for k, d in enumerate(m.prims):
            if d['type'] != 0 or m.pname[d['part']] != 'paw': continue
            msk = paws & (prim == k)
            if not msk.any(): continue
            l = (pos[msk] - d['c']) @ np.asarray(d['R']).T
            rx, ry, rz = d['p'][:3]
            toe = (l[:, 0] > rx * 0.35) & (l[:, 2] > -rz * 0.35) & \
                  (np.minimum(np.abs(l[:, 1] - ry * 0.33), np.abs(l[:, 1] + ry * 0.33)) < 0.32)
            sub = lab[msk]; sub[toe] = 11; lab[msk] = sub
    fc = face(info, pos, open_mouth=open_mouth, blink=blink)
    mk = hd & (fc > 0)
    lab[mk] = fc[mk]
    lab[~hit] = 0
    return lab, nl.astype(np.float32), g.astype(np.float32)

def colorize(m, info, b, **kw):
    lab, nl, g = labels(m, info, b, **kw)
    return resolve(lab, nl, g)

def resolve(lab, nl, g):
    out = np.where(lab < 100, lab, 0).astype(np.int16)
    for mt in MATS:
        msk = lab == mt
        if msk.any(): out[msk] = tone(mt, nl[msk], g[msk])
    return out

def to_rgb(idx):
    a = PAL[idx]
    al = (idx > 0).astype(np.uint8) * 255
    return np.dstack([a, al])
