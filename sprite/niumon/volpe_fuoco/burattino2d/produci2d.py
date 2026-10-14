"""Fogli della mappa in 2D: 8 direzioni a 128x128 (volpe_hd), corsa (6 fotogrammi, 12 al secondo) e fermo (8 fotogrammi,
8 al secondo, palpebre al 5). Uso: python3 produci2d.py [cartella]"""
import sys, os, json, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import volpe_hd as V

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'solo2d', 'mappa')
DIRS = [('giu', 'down', 0), ('giu_sinistra', 'down_left', 45), ('sinistra', 'left', 90), ('su_sinistra', 'up_left', 135),
        ('su', 'up', 180), ('su_destra', 'up_right', 225), ('destra', 'right', 270), ('giu_destra', 'down_right', 315)]
ANIM = {'corsa': dict(n=6, fps=12, blink=None, en='run'), 'fermo': dict(n=8, fps=8, blink=5, en='idle')}

def main():
    os.makedirs(OUT, exist_ok=True)
    S = V.SIZE; piv = [int(V.PIV[0]), int(V.PIV[1])]
    report = []
    for an, A in ANIM.items():
        for nome, en, th in DIRS:
            fr = [V.sprite(th, k / A['n'], an, blink=(k == A['blink'])) for k in range(A['n'])]
            sheet = np.concatenate(fr, 1)
            Image.fromarray(sheet, 'RGBA').save(os.path.join(OUT, '%s_%s.png' % (an, nome)))
            al = np.stack([f[..., 3] > 0 for f in fr])
            edge = bool(al[:, :2].any() or al[:, -2:].any() or al[:, :, :2].any() or al[:, :, -2:].any())
            report.append((an, nome, 'TOCCA IL BORDO' if edge else 'ok'))
            meta = dict(asset_id='creature_volpefuoco_%s_%s' % (A['en'], en), category='creature_overworld', animation=A['en'],
                        direction=en, direzione=nome, frame_width=S, frame_height=S, frames=A['n'], fps=A['fps'], loop=True,
                        pivot=piv, hitbox=[piv[0] - 24, piv[1] - 12, 48, 16],
                        source='burattino 2D con le forme e i colori del disegno di Denis (13 ottobre)',
                        version='0.5-anteprima-2d-hd', status='da approvare', w=S, h=S, n=A['n'], anchor=piv)
            json.dump(meta, open(os.path.join(OUT, '%s_%s.json' % (an, nome)), 'w'), indent=1, ensure_ascii=False)
    for r in report: print(*r)

if __name__ == '__main__':
    main()
