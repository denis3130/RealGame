"""la base vista come nel disegno (stessa telecamera, testa girata), colorata e in pixel, accanto al disegno"""
import sys, numpy as np
sys.path.insert(0, '.')
from PIL import Image
from base import render, camera
import volpe, colora, pixel

def drawing_view(size=160, S=4, head_yaw=38, head_roll=15):
    m, info = volpe.build(head_yaw=head_yaw, head_roll=head_roll)
    th, ph = np.radians(62), np.radians(15)
    c, r, u = camera(th, ph)
    # inquadratura: il disegno 1254 px -> size px; 1 unità = 10 px del disegno
    upp = 125.4 / size
    W = H = size * S; s = upp / S
    sx = (640 - 627) * 0.1; sy = (627 - 1010) * 0.1
    center = - sx * r - sy * u
    b = render(m, th, ph, W, H, s, center)
    b['nsig'] = S * 0.9
    lab, nl, g = colora.labels(m, info, b)
    dep = np.where(b['hit'], b['depth'], -1e9).astype(np.float32)
    big = colora.resolve(lab, nl, g)
    gid = np.array([d['group'] for d in m.prims])[np.clip(b['prim'], 0, len(m.prims) - 1)]
    gid = np.where(b['hit'], gid, -1).astype(np.int16)
    sl, sn, sg, sd, sgr = pixel.down(lab, nl, g, dep, S, grp=gid)
    small = pixel.finish2d(sl, sn, sg, sd, sgr, k=max(1, round(1.82 / upp)))
    return big, small

if __name__ == '__main__':
    big, small = drawing_view()
    dr = Image.open('disegno.png').convert('RGB').resize((640, 640), Image.LANCZOS)
    a = colora.to_rgb(big); A = a[..., 3:] / 255.0
    bigc = (a[..., :3] * A + 255 * (1 - A)).astype(np.uint8)
    b2 = colora.to_rgb(small); B = b2[..., 3:] / 255.0
    smc = (b2[..., :3] * B + 255 * (1 - B)).astype(np.uint8)
    can = Image.new('RGB', (640 * 3, 640), 'white')
    can.paste(dr, (0, 0)); can.paste(Image.fromarray(bigc), (640, 0)); can.paste(Image.fromarray(smc).resize((640, 640), Image.NEAREST), (1280, 0))
    can.save('confronto.png')
