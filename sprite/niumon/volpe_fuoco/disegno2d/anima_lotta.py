"""La mossa in lotta, tutta in 2D dal disegno: si carica all'indietro, scatta in avanti e sputa una fiammata, poi torna.
Uso: python3 anima_lotta.py [cartella]  -> lotta_fiammata.png (128x96 x 10, 12 al secondo) e .json"""
import sys, os, json, numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd
import pixel2d as P
import anima2d as A

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join('..', 'solo2d')
K, W, H = 10.5, 144, 96
PIV_SRC = (681 - 22 * 10.5, 1062)          # la volpe a destra (centro a x 94), spazio a sinistra per la fiammata
FEET = np.array((681.0, 1062.0)); MOUTH = np.array((392.0, 690.0))
# fotogrammi: (larghezza, altezza, spostamento x, spostamento y) in pixel del disegno
POSE = [(1.00, 1.00, 0, 0), (1.03, 0.96, 30, 0), (1.05, 0.93, 52, 6), (0.97, 1.04, -60, -18), (0.98, 1.03, -55, -14),
        (0.99, 1.02, -50, -10), (0.99, 1.02, -46, -8), (1.00, 1.01, -36, -5), (1.00, 1.00, -16, -2), (1.00, 1.00, 0, 0)]
FIRE = {4: [(0.10, 4.0), (0.22, 5.0)], 5: [(0.12, 4.5), (0.30, 6.5), (0.48, 7.0)], 6: [(0.14, 4.5), (0.34, 7.0), (0.56, 8.5), (0.78, 8.0)],
        7: [(0.42, 6.5), (0.66, 8.5), (0.90, 8.0)], 8: [(0.78, 5.5), (0.98, 4.5)]}
DIR = np.array((-0.93, 0.36)); DIR = DIR / np.linalg.norm(DIR)

def affine(sx, sy, dx, dy):
    """scala intorno ai piedi, poi spostamento (coordinate del disegno)"""
    Am = np.array([[sx, 0, FEET[0] * (1 - sx) + dx], [0, sy, FEET[1] * (1 - sy) + dy]], float)
    return Am

def warp_for(i, Am):
    flick = A.make_warp(i / len(POSE))
    def w(sm, m, e, a):
        sm, m, e, a = flick(sm, m, e, a)
        h, wd = m.shape
        f = lambda im, interp: cv2.warpAffine(im, Am, (wd, h), flags=interp, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        return (f(sm, cv2.INTER_LINEAR), f(m.astype(np.uint8), cv2.INTER_NEAREST) > 0, f(e.astype(np.uint8), cv2.INTER_NEAREST) > 0,
                f(a, cv2.INTER_LINEAR))
    return w

def fire(lab, op, mouth_px, puffs):
    """sbuffi di fuoco: cuore giallo, arancio, bordo rosso, contorno rosso scuro"""
    Hh, Ww = lab.shape
    yy, xx = np.mgrid[0:Hh, 0:Ww]
    reach = 64.0
    m = np.zeros((Hh, Ww), bool)
    for (t, r) in puffs:
        c = mouth_px + DIR * reach * t
        # una goccia: un po' allungata nella direzione della fiammata
        dxv, dyv = xx + .5 - c[0], yy + .5 - c[1]
        along = dxv * DIR[0] + dyv * DIR[1]; across = -dxv * DIR[1] + dyv * DIR[0]
        m |= (along / (r * 1.3)) ** 2 + (across / r) ** 2 < 1
    # dal muso alla prima nuvola, una lingua di fuoco
    if puffs:
        t0 = min(t for t, _ in puffs)
        for s_ in np.linspace(0, t0, 12):
            c = mouth_px + DIR * reach * s_
            m |= (xx + .5 - c[0]) ** 2 + (yy + .5 - c[1]) ** 2 < (2.0 + 2.5 * s_ / max(t0, 1e-3)) ** 2
    if not m.any(): return lab, op
    d = nd.distance_transform_edt(np.pad(m, 1))[1:-1, 1:-1]
    col = np.where(d < 1.5, 'r3', np.where(d < 2.5, 'r2', np.where(d < 3.5, 'r1', np.where(d < 4.5, 'o1', np.where(d < 6, 'y1', 'y0')))))
    lab = lab.copy(); op = op.copy()
    lab[m] = col[m]; op[m] = True
    return lab, op

def main():
    os.makedirs(OUT, exist_ok=True)
    frames = []
    for i, (sx, sy, dx, dy) in enumerate(POSE):
        Am = affine(sx, sy, dx, dy)
        lab, op, (ox, oy) = P.run(K, (W, H), pivot_src=PIV_SRC, warp=warp_for(i, Am), xf=Am, blink=False)
        mouth = Am[:, :2] @ MOUTH + Am[:, 2]
        mouth_px = np.array(((mouth[0] - ox) / K, (mouth[1] - oy) / K))
        if i in FIRE:
            lab, op = fire(lab, op, mouth_px, FIRE[i])
        op[:1, :] = False; op[-1:, :] = False; op[:, :1] = False; op[:, -1:] = False
        frames.append(np.asarray(P.render(lab, op)))
    sheet = np.concatenate(frames, 1)
    Image.fromarray(sheet, 'RGBA').save(os.path.join(OUT, 'lotta_fiammata.png'))
    meta = dict(asset_id='creature_volpefuoco_attack_front', category='creature_battle', animation='attack', direction='front',
                frame_width=W, frame_height=H, frames=len(POSE), fps=12, loop=False, pivot=[94, 90], hitbox=[60, 20, 76, 72],
                source='disegno di Denis (13 ottobre), tutto in 2D', version='0.4-anteprima-2d', status='da approvare',
                w=W, h=H, n=len(POSE), anchor=[94, 90], nota='da mostrare a 2 pixel per pixel; la fiammata esce a sinistra verso l\'avversario')
    json.dump(meta, open(os.path.join(OUT, 'lotta_fiammata.json'), 'w'), indent=1, ensure_ascii=False)
    print('fatto')

if __name__ == '__main__':
    main()
