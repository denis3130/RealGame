"""Fermo animato tutto in 2D: la coda e la cresta del disegno si piegano a onde (la base resta ferma), una volta le palpebre.
Uso: python3 anima2d.py [cartella]   -> lotta_fermo.png (96x96 x 8) e mappa_fermo.png (64x64 x 8) con i .json"""
import sys, os, json, numpy as np, cv2
from PIL import Image
import pixel2d as P

N, FPS, BLINK = 8, 8, 5
OUT = sys.argv[1] if len(sys.argv) > 1 else '..'

def make_warp(t):
    def warp(sm, m, e, a):
        h, w = m.shape
        Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
        ph = 2 * np.pi * t
        # coda: ferma alla base (y ~ 790), si muove di più verso la punta (y ~ 150)
        wt = np.clip((790 - Y) / 560, 0, 1) ** 1.4 * (X > 770)
        # cresta: ferma sulla fronte (y ~ 420), le punte si muovono (y ~ 165)
        wc = np.clip((420 - Y) / 240, 0, 1) ** 1.3 * ((X > 300) & (X < 640))
        dx = wt * (9 * np.sin(Y / 70 - ph) + 4 * np.sin(Y / 31 - 2 * ph + 1)) + wc * (6 * np.sin(Y / 40 - ph + 2))
        dy = wt * (5 * np.sin(X / 60 + ph)) + wc * (3 * np.sin(X / 35 + ph))
        mx, my = X - dx, Y - dy
        sm2 = cv2.remap(sm, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        m2 = cv2.remap(m.astype(np.float32), mx, my, cv2.INTER_LINEAR) > 0.5
        # braci: salgono e tornano giù a giro
        e2 = np.roll(e, -int(round(40 * t)), axis=0) if t < 0.99 else e
        a2 = cv2.remap(a, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        return sm2, m2, e2, a2
    return warp

def sheet(k, frame, name, pivot):
    frames = []
    for i in range(N):
        lab, op, _ = P.run(k, frame, warp=make_warp(i / N), blink=(i == BLINK))
        frames.append(np.asarray(P.render(lab, op)))
    a = np.concatenate(frames, 1)
    Image.fromarray(a, 'RGBA').save(os.path.join(OUT, name + '.png'))
    meta = dict(asset_id='creature_volpefuoco_%s' % name, w=frame[0], h=frame[1], n=N, fps=FPS, loop=True, anchor=list(pivot),
                frame_width=frame[0], frame_height=frame[1], frames=N, pivot=list(pivot), direction='down_left',
                source='disegno di Denis (13 ottobre), tutto in 2D', version='0.3-anteprima-2d', status='da approvare')
    json.dump(meta, open(os.path.join(OUT, name + '.json'), 'w'), indent=1, ensure_ascii=False)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    sheet(10.5, (96, 96), 'lotta_fermo', (48, 90))
    sheet(16.0, (64, 64), 'mappa_fermo', (32, 58))
    print('fatto')
