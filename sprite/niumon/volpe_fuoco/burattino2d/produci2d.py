"""Fogli della mappa in 2D: 8 direzioni, corsa (6 fotogrammi, 12 al secondo) e fermo (8 fotogrammi, 8 al secondo, palpebre al 5).
Uso: python3 produci2d.py [cartella]"""
import sys, os, json, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import volpe2d

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join('..', 'solo2d', 'mappa')
DIRS = [('giu', 'down', 0), ('giu_sinistra', 'down_left', 45), ('sinistra', 'left', 90), ('su_sinistra', 'up_left', 135),
        ('su', 'up', 180), ('su_destra', 'up_right', 225), ('destra', 'right', 270), ('giu_destra', 'down_right', 315)]
ANIM = {'corsa': dict(n=6, fps=12, blink=None, en='run'), 'fermo': dict(n=8, fps=8, blink=5, en='idle')}

def main():
    os.makedirs(OUT, exist_ok=True)
    report = []
    for an, A in ANIM.items():
        for nome, en, th in DIRS:
            fr = [volpe2d.sprite(th, k / A['n'], an, blink=(k == A['blink'])) for k in range(A['n'])]
            sheet = np.concatenate(fr, 1)
            Image.fromarray(sheet, 'RGBA').save(os.path.join(OUT, '%s_%s.png' % (an, nome)))
            al = np.stack([f[..., 3] > 0 for f in fr])
            edge = bool(al[:, 0].any() or al[:, -1].any() or al[:, :, 0].any() or al[:, :, -1].any())
            report.append((an, nome, edge))
            meta = dict(asset_id='creature_volpefuoco_%s_%s' % (A['en'], en), category='creature_overworld', animation=A['en'],
                        direction=en, direzione=nome, frame_width=64, frame_height=64, frames=A['n'], fps=A['fps'], loop=True,
                        pivot=[32, 56], hitbox=[20, 50, 24, 8], source='burattino 2D dal disegno di Denis (13 ottobre)',
                        version='0.4-anteprima-2d', status='da approvare', w=64, h=64, n=A['n'], anchor=[32, 56])
            json.dump(meta, open(os.path.join(OUT, '%s_%s.json' % (an, nome)), 'w'), indent=1, ensure_ascii=False)
    for r in report: print(*r)

if __name__ == '__main__':
    main()
