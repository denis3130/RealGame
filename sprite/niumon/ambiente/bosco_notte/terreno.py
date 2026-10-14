"""Il terreno del bosco di notte, piastrelle 64x64 che si ripetono senza cuciture (vista dall'alto):
- terra: terra scura a chiazze, muschio, sassolini con la luce sopra e l'ombra sotto, rametti e foglie;
- radura: pietre piatte chiare (come nella scena della lotta) tra terra battuta e ciuffetti;
- muschio: tappeto di muschio con poca terra.
Ogni cosa disegnata vicino al bordo continua dall'altra parte (coordinate modulo 64)."""
import numpy as np, math
from scipy import ndimage as nd
from pixel import Tela, PAL, hx, rumore

S = 64

def _put(lab, x, y, c):
    lab[int(y) % S, int(x) % S] = c

def _sassolino(lab, r, x, y, w, h):
    for j in range(h):
        for i in range(w):
            if (i in (0, w - 1)) and (j in (0, h - 1)) and w > 2 and h > 1: continue      # angoli tondi
            _put(lab, x + i, y + j, 's3')
    for i in range(1, max(w - 1, 2)): _put(lab, x + i, y, 's5' if r.random() < 0.6 else 's4')   # luce sopra
    for i in range(w): _put(lab, x + i, y + h, 's1')                                              # ombra sotto

def piastrella(tipo, seed):
    r = np.random.default_rng(seed)
    lab = np.full((S, S), '', object)
    n1 = rumore(S, S, 5, seed, wrap=True); n2 = rumore(S, S, 2, seed + 1, wrap=True); n3 = rumore(S, S, 9, seed + 2, wrap=True)
    if tipo == 'terra':
        lab[:] = 't2'
        lab[n1 < 0.38] = 't1'; lab[n1 > 0.66] = 't3'
        lab[(n2 > 0.82) & (n1 > 0.5)] = 't4'
        lab[(n3 > 0.70) & (n2 > 0.45)] = 'm1'; lab[(n3 > 0.80) & (n2 > 0.55)] = 'm2'
        for _ in range(14): _sassolino(lab, r, r.integers(S), r.integers(S), r.integers(2, 4), r.integers(1, 3))
        for _ in range(10):                                             # rametti
            x, y = r.integers(S), r.integers(S); a = r.uniform(0, math.pi); L = r.integers(3, 7)
            for k in range(L): _put(lab, x + math.cos(a) * k, y + math.sin(a) * k * 0.6, 'f1')
        for _ in range(12):                                             # foglie
            x, y = r.integers(S), r.integers(S); c = r.choice(['f2', 'f3', 'f2', 'm1'])
            _put(lab, x, y, c); _put(lab, x + 1, y, c); _put(lab, x + 1, y + 1, 'f1' if c != 'm1' else 'm0')
    elif tipo == 'radura':
        lab[:] = 't3'
        lab[n1 < 0.35] = 't2'; lab[n1 > 0.7] = 't4'
        # pietre piatte: un'ellisse per pietra, luce in alto a sinistra, ombra in basso a destra, fughe scure
        pietre = []
        for _ in range(240):
            if len(pietre) >= 26: break
            x, y = r.uniform(0, S), r.uniform(0, S); rx, ry = r.uniform(3.2, 6.5), r.uniform(2.2, 4.0)
            if all(min(abs(x - px), S - abs(x - px)) > (rx + prx) * 0.95 or min(abs(y - py), S - abs(y - py)) > (ry + pry) * 0.95
                   for (px, py, prx, pry) in pietre):
                pietre.append((x, y, rx, ry))
        yy, xx = np.mgrid[0:S, 0:S] + 0.5
        for (x, y, rx, ry) in pietre:
            dx = (xx - x + S / 2) % S - S / 2; dy = (yy - y + S / 2) % S - S / 2
            q = (dx / rx) ** 2 + (dy / ry) ** 2
            m = q <= 1
            sh = (((dx - 0.8) / rx) ** 2 + ((dy - 0.9) / ry) ** 2 <= 1) & ~m
            lab[sh] = 't1'
            lab[m] = 's3' if r.random() < 0.6 else 's4'
            lab[m & (dx / rx * 0.6 + dy / ry * 0.8 < -0.55)] = 's5'
            lab[m & (dx / rx * 0.6 + dy / ry * 0.8 > 0.62)] = 's2'
            if r.random() < 0.4: lab[m & (n2 > 0.75)] = 'm2'
        for _ in range(16):                                             # ciuffetti tra le pietre
            x, y = r.integers(S), r.integers(S)
            if lab[y % S, x % S] in ('t2', 't3', 't1'):
                _put(lab, x, y, 'g3'); _put(lab, x + 1, y - 1, 'g4'); _put(lab, x - 1, y - 1, 'g2')
    else:  # muschio
        lab[:] = 'm1'
        lab[n1 < 0.33] = 'm0'; lab[n1 > 0.62] = 'm2'; lab[(n1 > 0.78) & (n2 > 0.5)] = 'm3'
        lab[(n3 < 0.22)] = 't2'
        for _ in range(26):
            x, y = r.integers(S), r.integers(S); _put(lab, x, y, 'm4' if r.random() < 0.3 else 'm3')
        for _ in range(6): _sassolino(lab, r, r.integers(S), r.integers(S), r.integers(2, 4), 1)
    t = Tela(S, S)
    for q in set(lab.ravel().tolist()):
        if q: t.put(lab == q, q)
    return t

VARIANTI = [('terra', 'terra', 101), ('radura', 'radura', 202), ('muschio', 'muschio', 303)]

if __name__ == '__main__':
    import sys
    from PIL import Image
    c = Image.new('RGBA', (S * 3 * 2 * 3 + 20, S * 2 * 3), (0, 0, 0, 255))
    for i, (nome, tipo, seed) in enumerate(VARIANTI):
        im = piastrella(tipo, seed).img()
        big = Image.new('RGBA', (S * 2, S * 2))
        for a in range(2):
            for b in range(2): big.paste(im, (a * S, b * S))
        c.paste(big.resize((S * 2 * 3, S * 2 * 3), Image.NEAREST), (i * (S * 6 + 10), 0))
    c.save(sys.argv[1] if len(sys.argv) > 1 else '_terreno.png')
