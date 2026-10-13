"""Dalla resa grande ai pixel: etichetta più votata per blocco, toni scelti dopo, pulizia, contorno e linee interne."""
import numpy as np
import colora
from colora import PAL, MATS, PRIOR, LINE_OF

def down(lab, nl, g, depth, S, cover=0.5):
    H, W = lab.shape; h, w = H // S, W // S
    def blocks(a): return a[:h * S, :w * S].reshape(h, S, w, S).transpose(0, 2, 1, 3).reshape(h, w, S * S)
    L = blocks(lab); N = blocks(nl); G = blocks(g); D = blocks(depth)
    keys = sorted(set(np.unique(L).tolist()) - {0})
    cnt = np.zeros((h, w, len(keys)), np.float32)
    for i, k in enumerate(keys):
        cnt[..., i] = (L == k).sum(-1) * (1 + 0.9 * PRIOR.get(k, 0))
    covered = (L > 0).sum(-1)
    opaque = covered >= cover * S * S
    best = np.array(keys)[cnt.argmax(-1)]
    out_lab = np.where(opaque, best, 0).astype(np.int16)
    nlo = np.zeros((h, w), np.float32); go = np.zeros((h, w), np.float32); do = np.full((h, w), -1e9, np.float32)
    for k in keys:
        msk = opaque & (best == k)
        if not msk.any(): continue
        sel = L[msk] == k; ns = np.maximum(sel.sum(-1), 1)
        nlo[msk] = np.where(sel, N[msk], 0).sum(-1) / ns
        go[msk] = np.where(sel, G[msk], 0).sum(-1) / ns
        do[msk] = np.where(sel, D[msk], 0).sum(-1) / ns
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
