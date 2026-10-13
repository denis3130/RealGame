import sys, numpy as np
sys.path.insert(0, '.')
from base import render, camera
import volpe, colora, pixel, occhi64

ANCHOR = np.array((-11.0, 0, 0))

def head_turn(theta):
    """la testa si gira un poco verso di noi nelle viste davanti e di lato (come nel disegno); niente nelle viste da dietro"""
    t = (theta + 180) % 360 - 180
    k = float(np.interp(abs(t), [0, 45, 90, 125, 180], [0, 20, 12, 0, 0]))
    return np.sign(t) * k

def make(theta, phi=20, size=64, upp=1.72, pivot=(32, 56), S=6, pose=None, blink=0.0, open_mouth=True,
         cover=0.5, thr=4.0, nsig=None, raw=False):
    pose = dict(pose or {})
    pose.setdefault('head_yaw', head_turn(theta))
    m, info = volpe.build(**pose)
    th, ph = np.radians(theta), np.radians(phi)
    c, r, u = camera(th, ph)
    W = H = size * S; s = upp / S
    sx = (pivot[0] - size / 2) * upp; sy = (size / 2 - pivot[1]) * upp
    center = ANCHOR - sx * r - sy * u
    b = render(m, th, ph, W, H, s, center)
    b['nsig'] = nsig if nsig is not None else S * 0.9
    lab, nl, g = colora.labels(m, info, b, blink=blink, open_mouth=open_mouth)
    dep = np.where(b['hit'], b['depth'], -1e9).astype(np.float32)
    if raw: return lab, nl, g, dep, b, m, info
    sl, sn, sg, sd = pixel.down(lab, nl, g, dep, S, cover=cover)
    post = None
    if size <= 96:
        fill = colora.tone(colora.FUR, sn, sg)
        post = lambda idx: occhi64.apply(idx, sl, info, theta, phi, size, upp, pivot, ANCHOR, fill, blink=blink)
    return pixel.finish(sl, sn, sg, sd, thr=thr, post=post)

def sheet(tiles, k, bg=(120, 132, 110)):
    from PIL import Image
    row = np.concatenate(tiles, 1)
    a = row[..., 3:] / 255.0
    comp = (row[..., :3] * a + np.array(bg) * (1 - a)).astype(np.uint8)
    return Image.fromarray(comp).resize((row.shape[1] * k, row.shape[0] * k), Image.NEAREST)

if __name__ == '__main__':
    small, big = [], []
    for t in (0, 45, 90, 135, 180, 225, 270, 315):
        small.append(colora.to_rgb(make(t)))
        big.append(colora.to_rgb(make(t, size=192, upp=1.72 / 3, pivot=(96, 168), S=3)))
    sheet(small, 4).save('dir_64.png')
    sheet(big, 1).save('dir_192.png')
