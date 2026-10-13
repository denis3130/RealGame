"""Dalla resa grande ai pixel: etichetta più votata per blocco, toni scelti dopo, pulizia, contorno e linee interne."""
import numpy as np
import colora
from colora import PAL, MATS, PRIOR, LINE_OF

def down(lab, nl, g, depth, S, cover=0.5, grp=None):
    H, W = lab.shape; h, w = H // S, W // S
    def blocks(a): return a[:h * S, :w * S].reshape(h, S, w, S).transpose(0, 2, 1, 3).reshape(h, w, S * S)
    L = blocks(lab); N = blocks(nl); G = blocks(g); D = blocks(depth)
    GR = blocks(grp) if grp is not None else None
    keys = sorted(set(np.unique(L).tolist()) - {0})
    cnt = np.zeros((h, w, len(keys)), np.float32)
    for i, k in enumerate(keys):
        cnt[..., i] = (L == k).sum(-1) * (1 + 0.9 * PRIOR.get(k, 0))
    covered = (L > 0).sum(-1)
    opaque = covered >= cover * S * S
    best = np.array(keys)[cnt.argmax(-1)]
    out_lab = np.where(opaque, best, 0).astype(np.int16)
    nlo = np.zeros((h, w), np.float32); go = np.zeros((h, w), np.float32); do = np.full((h, w), -1e9, np.float32)
    gro = np.full((h, w), -1, np.int16)
    for k in keys:
        msk = opaque & (best == k)
        if not msk.any(): continue
        sel = L[msk] == k; ns = np.maximum(sel.sum(-1), 1)
        nlo[msk] = np.where(sel, N[msk], 0).sum(-1) / ns
        go[msk] = np.where(sel, G[msk], 0).sum(-1) / ns
        do[msk] = np.where(sel, D[msk], 0).sum(-1) / ns
        if GR is not None:
            gs = np.where(sel, GR[msk], -1)
            # gruppo più votato tra i sottopixel del colore scelto
            ng = int(GR.max()) + 2
            cnt_g = np.stack([(gs == q).sum(-1) for q in range(ng)], -1)
            gro[msk] = cnt_g.argmax(-1)
    if GR is not None: return out_lab, nlo, go, do, gro
    return out_lab, nlo, go, do

def shift(a, dy, dx, fill=0):
    h, w = a.shape; out = np.full_like(a, fill)
    ys = slice(max(dy, 0), h + min(dy, 0)); yd = slice(max(-dy, 0), h + min(-dy, 0))
    xs = slice(max(dx, 0), w + min(dx, 0)); xd = slice(max(-dx, 0), w + min(-dx, 0))
    out[yd, xd] = a[ys, xs]
    return out

N4 = ((0, 1), (0, -1), (1, 0), (-1, 0))

def despeckle(idx, keep=(14, 15, 16, 17, 18, 19, 20, 21, 22, 23), passes=2):
    out = idx.copy()
    for _ in range(passes):
        nb = [shift(out, dy, dx) for dy, dx in N4]
        same3 = np.zeros(out.shape, bool); val = np.zeros_like(out)
        # se almeno 3 vicini su 4 hanno lo stesso colore (diverso dal pixel), il pixel lo prende
        for i in range(4):
            c = sum((nb[j] == nb[i]).astype(int) for j in range(4))
            ok = (c >= 3) & (nb[i] != out) & (nb[i] > 0) & (out > 0) & ~same3
            same3 |= ok; val = np.where(ok, nb[i], val)
        ok = same3 & ~np.isin(out, keep) & ~np.isin(val, keep)
        out[ok] = val[ok]
    return out

def finish(lab, nl, g, dep, thr=4.0, col_out=24, post=None):
    idx = colora.resolve(lab, nl, g)
    idx = despeckle(idx)
    if post is not None: idx = post(idx)
    solid = idx > 0
    out = idx.copy()
    # linee interne: sul pixel più lontano accanto a uno molto più vicino
    for dy, dx in N4:
        nbs = shift(solid, dy, dx, False); dn = shift(dep, dy, dx, -1e9)
        nlab = shift(lab, dy, dx, 0)
        jump = dn - dep
        far = solid & nbs & (((jump > thr) & (nlab != lab)) | (jump > 3 * thr)) & (lab != colora.RUFF)
        for mt, lc in LINE_OF.items():
            out[far & (lab == mt)] = lc
        out[far & (lab < 100) & (lab > 0) & ~np.isin(lab, list(PRIOR.keys()))] = 25
    ring = np.zeros_like(solid)
    for dy, dx in N4: ring |= shift(solid, dy, dx, False)
    ring &= ~solid
    out[ring] = col_out
    return out


# ---------------------------------------------------------------- stile 2D (come gli sprite classici delle creature)
from scipy import ndimage as _ndi

FLAMES = (colora.FLAME, colora.CREST, colora.RUFF, colora.EAROUT)

def finish2d(lab, nl, g, dep, grp, k=1, thr=4.0, post=None):
    """colori piatti: tono base + ombra semplice + filo di luce in alto; fiamme a fasce dal bordo verso il cuore"""
    h, w = lab.shape
    idx = np.where(lab < 100, lab, 0).astype(np.int16)
    solid = lab > 0
    # luce ammorbidita sui pixel (forme d'ombra semplici)
    furm = np.isin(lab, (colora.FUR, colora.SOCK, colora.EARIN)) 
    wsum = _ndi.gaussian_filter(furm.astype(np.float32), 0.8 * k)
    nls = np.where(furm, _ndi.gaussian_filter(np.where(furm, nl, 0), 0.8 * k) / np.maximum(wsum, 1e-6), nl)
    up1 = shift(lab, 1, 0, 0)       # il pixel sopra
    up2 = shift(lab, 2, 0, 0)
    def rim(mt):
        r = (lab == mt) & (up1 != mt)
        if k >= 2: r |= (lab == mt) & (up2 != mt) & (shift(lab, 1, 0, 0) == mt)
        return r
    m = lab == colora.FUR
    idx[m] = 2
    idx[m & (nls < -0.05)] = 3
    idx[rim(colora.FUR) & (nls > 0.2)] = 1
    m = lab == colora.SOCK
    idx[m] = 10
    idx[m & (nls < -0.12)] = 11
    idx[rim(colora.SOCK) & (nls > 0.2)] = 9
    m = lab == colora.EARIN
    idx[m] = 12
    idx[m & (nls < -0.1)] = 13
    # fiamme: distanza dal bordo della propria zona (stesso gruppo)
    for gq in np.unique(grp[np.isin(lab, FLAMES)]):
        zone = np.isin(lab, FLAMES) & (grp == gq)
        if not zone.any(): continue
        d = _ndi.distance_transform_edt(np.pad(zone, 1)) [1:-1, 1:-1] - 1
        for mt in FLAMES:
            mm = zone & (lab == mt)
            if not mm.any(): continue
            dd = d[mm] / k
            if mt == colora.FLAME:
                t = np.where(dd < 1, 8, np.where(dd < 2, 7, np.where(dd < 3.5, 6, np.where(dd < 5, 5, 4))))
            elif mt == colora.CREST:
                t = np.where(dd < 1, 8, np.where(dd < 2, 7, np.where(dd < 3.2, 6, 5)))
            elif mt == colora.RUFF:
                t = np.where(dd < 1, 7, np.where(dd < 2.5, 6, 5))
            else:
                t = np.where(dd < 1, 8, 7)
            idx[mm] = t
    if post is not None: idx = post(idx)
    idx = despeckle(idx)
    out = idx.copy()
    flame_like = np.isin(lab, FLAMES)
    # linee interne, del colore del contorno della parte lontana
    for dy, dx in N4:
        nbs = shift(solid, dy, dx, False); dn = shift(dep, dy, dx, -1e9)
        nlab = shift(lab, dy, dx, 0); ngr = shift(grp, dy, dx, -1)
        jump = dn - dep
        far = solid & nbs & (((jump > thr) & ((ngr != grp) | (nlab != lab))) | (jump > 3 * thr)) & (lab != colora.RUFF)
        far &= ~np.isin(idx, (14, 15, 16, 17, 18, 19, 20, 21, 22))
        out[far & flame_like] = 29
        out[far & ~flame_like] = 28
    # contorno esterno: scuro marrone vicino al pelo, rosso scuro vicino alle fiamme
    ring = np.zeros_like(solid); nfl = np.zeros(solid.shape, np.int16); nfu = np.zeros(solid.shape, np.int16)
    for dy, dx in N4:
        s_ = shift(solid, dy, dx, False); ring |= s_
        nfl += shift(flame_like, dy, dx, False).astype(np.int16)
        nfu += (s_ & ~shift(flame_like, dy, dx, False)).astype(np.int16)
    ring &= ~solid
    col = np.where(nfl > nfu, 29, 28)
    out[ring] = col[ring]
    if k >= 2:                       # nelle misure grandi il contorno è di due pixel
        solid2 = out > 0
        ring2 = np.zeros_like(solid2); c2 = np.zeros(solid2.shape, np.int16)
        for dy, dx in N4:
            s_ = shift(ring, dy, dx, False); ring2 |= s_
            c2 = np.maximum(c2, shift(np.where(ring, out, 0), dy, dx, 0))
        ring2 &= ~solid2
        out[ring2] = c2[ring2]
    return out
