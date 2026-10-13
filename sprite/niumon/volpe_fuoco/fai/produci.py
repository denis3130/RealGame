"""Fa tutti i fogli della volpe di fuoco: 8 direzioni animate (fermo) a grandezza di gioco (64x64) e di dettaglio (192x192),
il giro completo in 16 viste, la vista uguale al disegno di Denis. Uso: python3 produci.py [cartella]"""
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import sprite, colora, confronto

OUT = sys.argv[1] if len(sys.argv) > 1 else 'uscita'
N, FPS, BLINK = 12, 8, 9
DIRS = [('giu', 'down', 0), ('giu_sinistra', 'down_left', 45), ('sinistra', 'left', 90), ('su_sinistra', 'up_left', 135),
        ('su', 'up', 180), ('su_destra', 'up_right', 225), ('destra', 'right', 270), ('giu_destra', 'down_right', 315)]
SIZES = {'mappa': dict(size=64, upp=1.82, pivot=(32, 56), S=6), 'grande': dict(size=192, upp=1.82 / 3, pivot=(96, 168), S=3)}

def pose(k):
    t = k / N
    return dict(anim=True, tail_ph=t, breath=0.5 - 0.5 * np.cos(2 * np.pi * t))

def hitbox(frames, pivot):
    a = np.concatenate([f[..., 3:] for f in frames], 1)[..., 0] > 0
    h, w = frames[0].shape[:2]
    alpha = np.zeros((h, w), bool)
    for f in frames: alpha |= f[..., 3] > 0
    ys, xs = np.nonzero(alpha[max(pivot[1] - 6, 0):pivot[1] + 2])
    if not len(xs): return [pivot[0] - 8, pivot[1] - 6, 16, 8]
    return [int(xs.min()), int(pivot[1] - 6), int(xs.max() - xs.min() + 1), 8]

def save_sheet(frames, name, meta):
    sheet = np.concatenate(frames, 1)
    Image.fromarray(sheet, 'RGBA').save(os.path.join(OUT, name + '.png'))
    json.dump(meta, open(os.path.join(OUT, name + '.json'), 'w'), indent=1, ensure_ascii=False)

def main():
    os.makedirs(os.path.join(OUT, 'direzioni'), exist_ok=True)
    for sz, kw in SIZES.items():
        for nome, en, th in DIRS:
            frames = []
            for k in range(N):
                idx = sprite.make(th, pose=pose(k), blink=1.0 if k == BLINK else 0.0, **kw)
                frames.append(colora.to_rgb(idx))
            fs = kw['size']
            meta = dict(asset_id='creature_volpefuoco_idle_%s' % en, category='creature_overworld' if sz == 'mappa' else 'creature_detail',
                        species='volpefuoco (nome provvisorio)', animation='idle', direction=en, direzione=nome,
                        frame_width=fs, frame_height=fs, frames=N, fps=FPS, loop=True, pivot=list(kw['pivot']),
                        hitbox=hitbox(frames, kw['pivot']), source='disegno di Denis (13 ottobre) + base a volumi', version='0.1-anteprima',
                        status='da approvare',
                        review=dict(silhouette_constant=True, colors_constant=True, limb_count_constant=True, no_clipped_flames=True, feet_grounded=True),
                        # per la pagina
                        w=fs, h=fs, n=N, anchor=list(kw['pivot']))
            save_sheet(frames, os.path.join('direzioni', '%s_%s' % (sz, nome)), meta)
            print(sz, nome, flush=True)
    # giro completo: 16 viste, fermo
    for sz, kw in SIZES.items():
        frames = [colora.to_rgb(sprite.make(a, pose=pose(0), **kw)) for a in np.arange(0, 360, 22.5)]
        fs = kw['size']
        save_sheet(frames, 'giro_%s' % sz, dict(w=fs, h=fs, n=16, fps=6, anchor=list(kw['pivot']), angoli=list(np.arange(0, 360, 22.5))))
    # la vista del disegno
    big, small = confronto.drawing_view(size=160, S=4)
    Image.fromarray(colora.to_rgb(small), 'RGBA').save(os.path.join(OUT, 'come_il_disegno.png'))
    Image.fromarray(colora.to_rgb(big), 'RGBA').save(os.path.join(OUT, 'base_come_il_disegno.png'))
    print('fatto')

if __name__ == '__main__':
    main()
