"""Il Niumon di fuoco come burattino 2D: ogni pezzo è una forma piatta (ellissi, triangoli, fiamme) con il suo contorno scuro,
disegnato sopra o sotto gli altri secondo la direzione. Uno scheletro di punti dice solo dove sta ogni pezzo in ogni direzione:
non c'è nessun volume colorato dalla luce. Colori come lo sprite fatto dal disegno (pixel2d.PAL)."""
import numpy as np, cv2, os, sys
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'disegno2d'))
from PIL import Image

PAL = {'ol': '#4a2420', 'il': '#8a3a26', 'f0': '#fbd796', 'f1': '#f8c47a', 'f2': '#f1a25a', 'y0': '#ffe58f', 'y1': '#fbbd52',
       'o1': '#f4913e', 'r1': '#e8623c', 'r2': '#cc4134', 'r3': '#992a2c', 'p1': '#e2724f', 'p2': '#bd4a3a', 'bl': '#f28a6e',
       'ek': '#3a1418', 'e1': '#8e2226', 'e2': '#d24a32', 'e3': '#f7a54a', 'ew': '#fffaf0', 'to': '#ee8a8a', 'mo': '#7a2228'}
KEYS = list(PAL)
KI = {k: i + 1 for i, k in enumerate(KEYS)}          # 0 = vuoto
RGB = np.zeros((len(KEYS) + 1, 3), np.uint8)
for k, i in KI.items(): RGB[i] = [int(PAL[k][j:j + 2], 16) for j in (1, 3, 5)]

# materiali delle forme (si colorano dopo, a grandezza di sprite)
OL, FUR, SOCK, FLAME, CREST, RUFF, EARIN, EAROUT = 1, 2, 3, 4, 5, 6, 7, 8

def nrm(v): v = np.asarray(v, float); return v / (np.linalg.norm(v) + 1e-12)
def rotz(a): c, s = np.cos(a), np.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.]])
def roty(a): c, s = np.cos(a), np.sin(a); return np.array([[c, 0, s], [0, 1., 0], [-s, 0, c]])

class View:
    def __init__(s, theta, phi=20, size=64, upp=1.82, pivot=(32, 56), anchor=(-11, 0, 0), SS=6):
        th, ph = np.radians(theta), np.radians(phi)
        s.c = np.array([np.cos(ph) * np.cos(th), np.cos(ph) * np.sin(th), np.sin(ph)])
        s.r = np.array([-np.sin(th), np.cos(th), 0.]); s.u = np.cross(s.c, s.r)
        s.theta, s.size, s.upp, s.pivot, s.anchor, s.SS = theta, size, upp, pivot, np.asarray(anchor, float), SS
    def P(s, p):
        d = np.asarray(p, float) - s.anchor
        return np.stack([(s.pivot[0] + d @ s.r / s.upp) * s.SS, (s.pivot[1] - d @ s.u / s.upp) * s.SS], -1)
    def depth(s, p): return float((np.asarray(p, float) - s.anchor) @ s.c)
    def L(s, units): return units / s.upp * s.SS

def ellipse_pts(v, C, radii, R=np.eye(3), n=80):
    """sagoma (ellisse) di un ellissoide visto dalla telecamera: per sapere dove e quanto è grande il pezzo"""
    M = R.T @ np.diag(1 / np.asarray(radii, float) ** 2) @ R
    B = np.stack([v.r, v.u, v.c], 1)
    Q = B.T @ M @ B
    N = Q[:2, :2] - np.outer(Q[:2, 2], Q[2, :2]) / Q[2, 2]
    w, e = np.linalg.eigh(N)
    ax = 1 / np.sqrt(np.maximum(w, 1e-9))
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    q = e[:, 0][None] * ax[0] * np.cos(t)[:, None] + e[:, 1][None] * ax[1] * np.sin(t)[:, None]
    c2 = v.P(C)
    return np.stack([c2[0] + q[:, 0] / v.upp * v.SS, c2[1] - q[:, 1] / v.upp * v.SS], 1)

def stroke_pts(v, pts3, rads):
    """lingua di fiamma piatta: una striscia che si assottiglia lungo i punti (larghezza in unità)"""
    p = v.P(np.asarray(pts3, float)); w = np.array([v.L(r) for r in rads])
    n = len(p); L_, R_ = [], []
    for i in range(n):
        d = p[min(i + 1, n - 1)] - p[max(i - 1, 0)]; d = d / (np.linalg.norm(d) + 1e-9)
        nn = np.array([-d[1], d[0]])
        L_.append(p[i] + nn * w[i]); R_.append(p[i] - nn * w[i])
    return np.array(L_ + R_[::-1])

class Canvas:
    def __init__(s, v):
        s.v = v; H = W = v.size * v.SS
        s.mat = np.zeros((H, W), np.int16); s.reg = np.zeros((H, W), np.int16); s.nreg = 0; s.info = {}
    def mask_poly(s, pts):
        m = np.zeros(s.mat.shape, np.uint8); cv2.fillPoly(m, [np.round(pts).astype(np.int32)], 1, lineType=cv2.LINE_8); return m > 0
    def mask_caps(s, segs):
        m = np.zeros(s.mat.shape, np.uint8)
        for a, b, wa in segs:
            t = max(1, int(round(2 * wa)))
            cv2.line(m, tuple(np.round(a).astype(int)), tuple(np.round(b).astype(int)), 1, t, lineType=cv2.LINE_8)
            cv2.circle(m, tuple(np.round(a).astype(int)), int(round(wa)), 1, -1); cv2.circle(m, tuple(np.round(b).astype(int)), int(round(wa)), 1, -1)
        return m > 0
    def put(s, m, mat, name, outline=True, ring=None):
        """un pezzo: prima il suo contorno (un pixel di sprite), poi il pieno"""
        if not m.any(): return
        if outline:
            k = ring or s.v.SS
            ringm = nd.binary_dilation(m, structure=np.ones((3, 3)), iterations=k) & ~m
            s.mat[ringm] = OL; s.reg[ringm] = 0
        s.nreg += 1; s.mat[m] = mat; s.reg[m] = s.nreg; s.info[s.nreg] = (name, mat)
