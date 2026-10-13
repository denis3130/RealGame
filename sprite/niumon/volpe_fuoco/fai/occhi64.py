"""Occhi fatti a mano per la grandezza di gioco (64 px): al posto dell'occhio rimpicciolito si mette un timbro
scelto da quanto l'occhio guarda verso di noi."""
import numpy as np
from base import camera

K = {'.': -1, 'O': 14, 'D': 15, 'R': 16, 'Y': 17, 'P': 18, 'W': 19}
def T(rows): return np.array([[K[c] for c in r] for r in rows], np.int16)

STAMP = {
    'fronte': T([".OOO.",
                 "ODWWO",
                 "ODPWO",
                 "ORPRO",
                 "ORPRO",
                 "OYYYO",
                 ".OOO."]),
    'tre_quarti': T([".OO.",
                     "ODWO",
                     "OPWO",
                     "OPRO",
                     "OPRO",
                     "OYYO",
                     ".OO."]),
    'lato': T([".O.",
               "OWO",
               "OPO",
               "OPO",
               "ORO",
               "OYO",
               ".O."]),
    'chiuso': T(["O...O",
                 ".OOO."]),
    'chiuso_stretto': T(["O..O",
                         ".OO."]),
    'lontano': T(["OO.",
                  "DWO",
                  "PWO",
                  "PRO",
                  "YYO",
                  "OO."]),
}
EYE_LAB = (14, 15, 16, 17, 18, 19)

def eye_points(info):
    """centro e normale dei due occhi nel mondo"""
    h = info['head']; R = h['R']; c = h['c']; rx, ry, rz = h['r']; hs = h.get('s', 1.0)
    out = []
    for s in (1, -1):
        y, z = 9.2 * s * hs, 0.6 * hs
        x = rx * np.sqrt(max(1 - (y / ry) ** 2 - (z / rz) ** 2, 0.05))
        p = np.array((x, y, z)); nrm = p / np.array((rx, ry, rz)) ** 2; nrm /= np.linalg.norm(nrm)
        out.append((R @ p + c, R @ nrm, s))
    return out

def apply(idx, lab, info, theta, phi, size, upp, pivot, anchor, fur_fill, blink=0.0):
    th, ph = np.radians(theta), np.radians(phi)
    c, r, u = camera(th, ph)
    out = idx.copy()
    eyes = eye_points(info)
    # dove sono i pixel degli occhi rimpiccioliti
    ys, xs = np.nonzero(np.isin(lab, EYE_LAB))
    proj = []
    for p, nrm, s in eyes:
        d = p - anchor
        px = pivot[0] + (d @ r) / upp - 0.5
        py = pivot[1] - (d @ u) / upp - 0.5
        proj.append((px, py, nrm @ c, s))
    owner = np.zeros(len(xs), int)
    if len(xs):
        dd = np.stack([np.hypot(xs - px, ys - py) for px, py, _, _ in proj], 1)
        owner = dd.argmin(1)
    for k, (px, py, cosv, s) in enumerate(proj):
        mine = owner == k
        n_vis = int(mine.sum())
        # togli l'occhio rimpicciolito
        for yy, xx in zip(ys[mine], xs[mine]):
            out[yy, xx] = fur_fill[yy, xx]
        if (n_vis < 3 and blink <= 0.5) or (blink > 0.5 and n_vis < 1) or cosv < 0.12: continue
        if blink > 0.5:
            st = STAMP['chiuso'] if cosv > 0.6 else STAMP['chiuso_stretto']
        elif cosv > 0.80: st = STAMP['fronte']
        elif cosv > 0.50: st = STAMP['tre_quarti']
        elif cosv > 0.25: st = STAMP['lato']
        else: st = STAMP['lontano']
        hh, ww = st.shape
        x0 = int(round(px - (ww - 1) / 2)); y0 = int(round(py - (hh - 1) / 2))
        # il timbro deve stare tutto dentro la testa: se tocca il bordo si sposta verso il centro del muso
        hcx = pivot[0] + ((info['head']['c'] - anchor) @ r) / upp - 0.5
        step = 1 if hcx > px else -1
        def fits(x0):
            for j in range(hh):
                for i in range(ww):
                    if st[j, i] < 0: continue
                    yy, xx = y0 + j, x0 + i
                    if not (0 <= yy < out.shape[0] and 0 <= xx < out.shape[1]) or idx[yy, xx] == 0: return False
                    # anche il pixel accanto (verso fuori) deve essere pieno, così resta il contorno della testa
                    xo = xx - step
                    if (i == 0 and step > 0) or (i == ww - 1 and step < 0):
                        if not (0 <= xo < out.shape[1]) or idx[yy, xo] == 0: return False
            return True
        moved = 0
        while not fits(x0) and moved < 3:
            x0 += step; moved += 1
        if not fits(x0): continue
        for j in range(hh):
            for i in range(ww):
                v = st[j, i]
                if v < 0: continue
                yy, xx = y0 + j, x0 + i
                if 0 <= yy < out.shape[0] and 0 <= xx < out.shape[1] and out[yy, xx] > 0:
                    out[yy, xx] = v
    return out
