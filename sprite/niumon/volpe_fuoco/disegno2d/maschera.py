"""La sagoma della volpe nel disegno di Denis: senza carta, senza l'ombra a matita sotto le zampe, senza le braci staccate."""
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
DRAW = os.path.join(HERE, '..', 'fai', 'disegno.png')       # il disegno di Denis (non sta nel repository)

def load():
    im = np.asarray(Image.open(DRAW).convert('RGB'))
    hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV).astype(int)
    S, V = hsv[..., 1], hsv[..., 2]
    fg = (S > 55) | (V < 150)
    # ombra a terra: tratteggio chiaro sotto le zampe, e tratteggio rado (tra i tratti si vede la carta)
    yy = np.arange(im.shape[0])[:, None]
    shadow = (yy > 930) & (S < 125) & (V > 165)
    dens = nd.uniform_filter(fg.astype(np.float32), 15)
    shadow |= (yy > 880) & (dens < 0.8) & (V > 120)
    fg &= ~shadow
    fg = nd.binary_opening(fg, iterations=2)
    fg = nd.binary_closing(fg, iterations=3)
    filled = nd.binary_fill_holes(fg)
    # i buchi chiusi che sono carta bianca (per esempio tra le zampe) restano vuoti
    holes = filled & ~fg
    paper = (V > 228) & (S < 40)
    hl, hn = nd.label(holes)
    for i in range(1, hn + 1):
        h_ = hl == i
        if h_.sum() > 150 and paper[h_].mean() > 0.6: filled &= ~h_
    fg = filled
    # carta bianca rimasta chiusa sotto la pancia (non negli occhi, che stanno più in alto)
    pap = fg & (yy > 800) & (V > 222) & (S < 45)
    pl, pn = nd.label(pap)
    for i in range(1, pn + 1):
        if (pl == i).sum() > 200: fg &= ~(pl == i)
    fg = nd.binary_opening(fg, iterations=2)
    lab, n = nd.label(fg)
    sizes = nd.sum(fg, lab, range(1, n + 1))
    main = lab == (np.argmax(sizes) + 1)
    embers = fg & ~main & (lab > 0)
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if 300 < s < 20000])   # braci (pezzetti di fiamma)
    return im.astype(np.float32) / 255, main, keep & ~main

if __name__ == '__main__':
    a, m, e = load()
    ys, xs = np.nonzero(m); print('volpe', xs.min(), xs.max(), ys.min(), ys.max(), 'braci', nd.label(e)[1])
    v = (a * 255).astype(np.uint8).copy(); v[~m & ~e] = (v[~m & ~e] * 0.25 + 190).astype(np.uint8); v[e] = (255, 0, 255)
    Image.fromarray(v).resize((627, 627)).save(os.path.join(HERE, '_maschera.png'))
