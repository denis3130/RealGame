"""La coda: sagoma presa dal disegno di Denis (vista di tre quarti) e portata nel piano del corpo, poi gonfiata.
coda_sagoma.png è la sagoma già portata nel piano (griglia da 0,25 unità): basta quella per rifare tutto."""
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
DRAW = os.path.join(HERE, 'disegno.png')            # il disegno di Denis (non sta nel repository)
SAG = os.path.join(HERE, 'coda_sagoma.png')
TH, PH = np.radians(62), np.radians(15)             # la telecamera del disegno (stimata)
SX = np.sin(TH); A = np.sin(PH) * np.cos(TH); CP = np.cos(PH)
ROOT = (640, 1010); K = 10.0                        # px del disegno per unità
U0, U1, V0, V1, CS = -62.0, -14.0, 8.0, 96.0, 0.25  # la griglia nel piano del corpo (x, z)

def to_draw(x, z):
    return ROOT[0] - x * SX * K, ROOT[1] - (-A * x + CP * z) * K

def from_drawing():
    im = np.asarray(Image.open(DRAW).convert('RGB'))
    hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV)
    fg = ((hsv[..., 1] > 55) | (hsv[..., 2] < 150)).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    h, w = fg.shape
    ff = fg.copy(); msk = np.zeros((h + 2, w + 2), np.uint8); cv2.floodFill(ff, msk, (0, 0), 1)
    fg = fg | (1 - ff)
    fg[:, :803] = 0; fg[818:, :] = 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
    tm = (lab == (np.argmax(st[1:, 4]) + 1)).astype(np.float32)
    nu = int(round((U1 - U0) / CS)) + 1; nv = int(round((V1 - V0) / CS)) + 1
    X, Z = np.meshgrid(U0 + np.arange(nu) * CS, V0 + np.arange(nv) * CS)
    px, py = to_draw(X, Z)
    g = cv2.remap(tm, px.astype(np.float32), py.astype(np.float32), cv2.INTER_LINEAR) > 0.5
    g = ndi.binary_opening(g, iterations=1)
    Image.fromarray((g[::-1] * 255).astype(np.uint8)).save(SAG)    # in alto = z grande
    return g

_G = None
_CACHE = {}

def sagoma():
    global _G
    if _G is None:
        if os.path.exists(SAG): _G = np.asarray(Image.open(SAG))[::-1] > 127
        else: _G = from_drawing()
    return _G

def tail_grid(lam=0.95, phase=None):
    key = None if phase is None else round(float(phase) % 1.0, 4)
    if key in _CACHE: return _CACHE[key]
    g0 = sagoma().astype(np.float32)
    nv, nu = g0.shape
    X, Z = np.meshgrid(U0 + np.arange(nu) * CS, V0 + np.arange(nv) * CS)
    if key is not None:
        t = 2 * np.pi * key
        w = np.clip((Z - 26) / 46, 0, 1) ** 1.3          # la base resta ferma, le punte si muovono di più
        Xs = X + 1.5 * w * np.sin(Z / 7.0 - t) + 0.6 * w * np.sin(Z / 3.1 - 2 * t + 1.0)
        Zs = Z + 1.3 * w * np.sin(X / 6.0 + t + 0.5) - 1.0 * w * (0.5 + 0.5 * np.sin(t))
        g = cv2.remap(g0, ((Xs - U0) / CS).astype(np.float32), ((Zs - V0) / CS).astype(np.float32), cv2.INTER_LINEAR) > 0.5
    else:
        g = g0 > 0.5
    din = ndi.distance_transform_edt(g) * CS
    dout = ndi.distance_transform_edt(~g) * CS
    d2 = np.where(g, -din + CS * 0.5, dout - CS * 0.5)
    R = ndi.gaussian_filter(ndi.maximum_filter(din, size=41), 6)
    R = np.maximum(R, din)
    hh = lam * np.sqrt(np.clip(din * (2 * R - din), 0, None))
    hh = ndi.gaussian_filter(hh, 1.2) * g
    r = (d2.astype(np.float32), hh.astype(np.float32), U0, V0, CS)
    _CACHE[key] = r
    return r
