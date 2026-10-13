"""Base solida: costruttore di modelli a volumi (SDF) e chiamata del raymarcher rs."""
import numpy as np, subprocess, os, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RS = os.path.join(HERE, 'rs')

def nrm(v):
    v = np.asarray(v, float); return v / (np.linalg.norm(v) + 1e-12)

def rotz(a):
    c, s = np.cos(a), np.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.]])
def roty(a):
    c, s = np.cos(a), np.sin(a); return np.array([[c, 0, s], [0, 1., 0], [-s, 0, c]])
def rotx(a):
    c, s = np.cos(a), np.sin(a); return np.array([[1., 0, 0], [0, c, -s], [0, s, c]])

def frame_from(xdir, zhint=(0, 0, 1)):
    """Terna (righe = assi locali) con x lungo xdir."""
    x = nrm(xdir); z = np.asarray(zhint, float)
    y = np.cross(z, x)
    if np.linalg.norm(y) < 1e-6: y = np.cross((0, 1, 0), x)
    y = nrm(y); z = np.cross(x, y)
    return np.array([x, y, z])

class Model:
    def __init__(s):
        s.groups = []          # k di raccordo per gruppo
        s.gname = {}
        s.prims = []           # dict
        s.tris = []
        s.stack = [(np.eye(3), np.zeros(3))]
        s.parts = {}           # nome -> id
        s.grid = []            # valori delle griglie (forme gonfiate)
        s.pname = []
    def group(s, name, k):
        if name not in s.gname:
            s.gname[name] = len(s.groups); s.groups.append(k)
        return s.gname[name]
    def part(s, name):
        if name not in s.parts:
            s.parts[name] = len(s.pname); s.pname.append(name)
        return s.parts[name]
    # trasformazioni (rotazione R e traslazione t: p' = R p + t)
    def push(s, R=np.eye(3), t=(0, 0, 0), pivot=None):
        R0, t0 = s.stack[-1]; R = np.asarray(R, float); t = np.asarray(t, float)
        if pivot is not None:
            pv = np.asarray(pivot, float); t = t + pv - R @ pv
        s.stack.append((R0 @ R, R0 @ t + t0))
    def pop(s): s.stack.pop()
    def X(s, p):
        R, t = s.stack[-1]; return R @ np.asarray(p, float) + t
    def XR(s):
        return s.stack[-1][0]
    def _add(s, d):
        d['id'] = len(s.prims); s.prims.append(d); return d
    def ell(s, c, r, part, group, rot=np.eye(3)):
        """ellissoide: centro c, semiassi r; rot = righe assi locali (in coordinate del contesto)"""
        Rw = np.asarray(rot, float) @ s.XR().T     # mondo -> locale
        c = s.X(c)
        return s._add(dict(type=0, group=group, part=s.part(part), c=c, R=Rw, p=list(r) + [0] * 5,
                           bc=c, br=max(r)))
    def cone(s, a, b, ra, rb, part, group):
        a = s.X(a); b = s.X(b)
        L = np.linalg.norm(b - a)
        if L <= abs(ra - rb) + 1e-3:     # cono degenere: allunga un poco
            b = a + nrm(b - a + 1e-6) * (abs(ra - rb) + 0.05)
            L = np.linalg.norm(b - a)
        return s._add(dict(type=1, group=group, part=s.part(part), c=(a + b) / 2, R=np.eye(3),
                           p=list(a) + list(b) + [ra, rb], bc=(a + b) / 2, br=L / 2 + max(ra, rb)))
    def tube(s, pts, rads, part, group):
        out = []
        for i in range(len(pts) - 1):
            out.append(s.cone(pts[i], pts[i + 1], rads[i], rads[i + 1], part, group))
        return out
    def slab(s, origin, U, V, tris, t0, part, group, taper=0., rr=0.2, cup=0.):
        """profilo 2D (triangoli in coordinate u,v) estruso lungo W = U x V"""
        U = nrm(U); V = nrm(V - np.dot(V, U) * U); W = np.cross(U, V)
        R = s.XR(); Rw = np.array([R @ U, R @ V, R @ W])   # righe in mondo
        o = s.X(origin)
        tri0 = len(s.tris)
        ext = 0
        for tri in tris:
            s.tris.append([c for p in tri for c in p])
            for p in tri: ext = max(ext, np.hypot(*p))
        return s._add(dict(type=2, group=group, part=s.part(part), c=o, R=Rw,
                           p=[t0, taper, rr, cup, 0, 0, 0, 0], tri0=tri0, ntri=len(tris),
                           bc=o, br=ext + t0 + rr + abs(cup) * ext * ext + 0.5))
    def infl(s, origin, U, V, d2, hh, u0, v0, cs, part, group, lip=0.55):
        """forma gonfiata: d2 (distanza 2D con segno, unità) e hh (mezzo spessore) su una griglia nel piano (U,V)"""
        U = nrm(U); V = nrm(V - np.dot(V, U) * U); W = np.cross(U, V)
        R = s.XR(); Rw = np.array([R @ U, R @ V, R @ W])
        o = s.X(origin)
        nv, nu = d2.shape
        off = len(s.grid)
        s.grid.extend(np.asarray(d2, np.float32).ravel().tolist()); s.grid.extend(np.asarray(hh, np.float32).ravel().tolist())
        # sfera che la contiene
        cu, cv = u0 + (nu - 1) * cs / 2, v0 + (nv - 1) * cs / 2
        bc = o + Rw[0] * cu + Rw[1] * cv
        br = np.hypot((nu - 1) * cs, (nv - 1) * cs) / 2 + float(np.max(hh)) + cs
        return s._add(dict(type=3, group=group, part=s.part(part), c=o, R=Rw,
                           p=[nu, nv, u0, v0, cs, off, lip, 0], bc=bc, br=br))
    def write(s, path):
        with open(path, 'w') as f:
            f.write('%d\n' % len(s.groups)); f.write(' '.join('%g' % k for k in s.groups) + '\n')
            f.write('%d %d\n' % (len(s.prims), len(s.tris)))
            for d in s.prims:
                k = s.groups[d['group']]
                vals = [d['type'], d['group'], d['part']] + list(d['c']) + list(np.asarray(d['R']).ravel()) + \
                       list(d['p']) + [d.get('tri0', 0), d.get('ntri', 0)] + list(d['bc']) + [d['br'] + k + 0.3]
                f.write(' '.join(('%d' % v) if i < 3 or i in (23, 24) else ('%.5f' % v) for i, v in enumerate(vals)) + '\n')
            for t in s.tris: f.write(' '.join('%.5f' % v for v in t) + '\n')
            f.write('%d\n' % len(s.grid))
            if s.grid: f.write(' '.join('%.4f' % v for v in s.grid) + '\n')

def camera(theta, phi):
    """c = verso la telecamera, r = destra dello schermo, u = su dello schermo"""
    c = np.array([np.cos(phi) * np.cos(theta), np.cos(phi) * np.sin(theta), np.sin(phi)])
    r = np.array([-np.sin(theta), np.cos(theta), 0.])
    u = np.cross(c, r)
    return c, r, u

def render(model, theta, phi, W, H, scale, center, tag='r'):
    c, r, u = camera(theta, phi)
    td = tempfile.mkdtemp(dir=HERE)
    mp, cp, op = [os.path.join(td, n) for n in ('m.txt', 'c.txt', 'o.bin')]
    model.write(mp)
    with open(cp, 'w') as f:
        f.write('%d %d %.6f\n' % (W, H, scale))
        f.write(' '.join('%.6f' % v for v in list(center) + list(c) + list(r) + list(u)) + '\n')
    subprocess.run([RS, mp, cp, op], check=True)
    a = np.fromfile(op, np.float32).reshape(H, W, 9)
    for p in (mp, cp, op): os.remove(p)
    os.rmdir(td)
    return dict(hit=a[..., 0] > 0.5, depth=a[..., 1], pos=a[..., 2:5], n=a[..., 5:8], prim=a[..., 8].astype(int),
                c=c, r=r, u=u, theta=theta, phi=phi, scale=scale, center=np.asarray(center, float))
