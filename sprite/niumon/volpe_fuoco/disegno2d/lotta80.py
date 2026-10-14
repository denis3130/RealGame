"""Gli sprite della lotta in pixel art pulita (riquadro 96x96, la volpe a 12,2 pixel del disegno per pixel), come nello screenshot
di riferimento di Denis: pixel grossi, pochi toni, contorno scuro. Un foglio per vista, una riga per animazione.

- davanti (l'avversario), dal disegno (pulito.py): occhi, bocca e naso del disegno;
- di spalle (il proprio Niumon): visto dalla parte opposta la sagoma è la stessa, specchiata; dentro si ridipinge quello che
  cambia: la nuca tonda (pelo con la luce in alto a destra, ombra verso il collo, ciuffi), il dietro delle orecchie, il petto che
  non si vede, le zampe lontane più scure.

Animazioni (stesse per le due viste):
- fermo: 8 fotogrammi a 8 al secondo. Il corpo respira di un pixel e la testa lo segue un fotogramma dopo (pezzi spostati a
  pixel interi: niente tremolio), la coda ondeggia e oscilla, le fiamme della cresta si allungano e tremano, braci che nascono
  dalle punte delle fiamme e salgono spegnendosi. Davanti anche le righe con gli occhi a metà e chiusi (battito di ciglia).
- attacco: 8 fotogrammi a 12 al secondo: si abbassa e si carica (fiamme più grandi), scatta in avanti col corpo allungato e le
  fiamme tirate indietro, torna.
- colpito: 4 fotogrammi a 12 al secondo: spinto indietro, occhi strizzati, fiamme che si abbassano, poi si riprende.
Uso: python3 lotta80.py [cartella]   -> lotta_davanti.png/.json, lotta_spalle.png/.json"""
import numpy as np, os, sys, json
from PIL import Image
from scipy import ndimage as nd
import pulito as Q

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'solo2d')
W, H = Q.W, Q.H
N_FERMO, FPS_FERMO = 8, 8
FEET = np.array(Q.PIVOT_SRC, float)

# ------------------------------------------------------------------ deformazioni del disegno (pixel del disegno)
CODA_BASE = np.array((800.0, 770.0))      # dove la coda si attacca
def rampa(v, a, b):
    return np.clip((v - a) / (b - a), 0, 1)

def deforma(t=0.0, fiamma=1.0, vento=0.0, coda_su=0.0, piega=0.0, schiaccia=0.0, testa=(0.0, 0.0), ampiezza=1.0):
    """t: fase delle fiamme (0..1, il giro torna uguale); fiamma: grandezza delle fiamme (1 = normali); vento: fiamme tirate
    indietro (verso destra, lontano dal nemico); coda_su: coda che si alza (radianti); piega: il corpo si piega in avanti (pixel
    del disegno in cima, i piedi restano); schiaccia: il corpo si abbassa (pixel del disegno in cima); testa: spostamento in più
    della testa"""
    def warp(Y, X):
        ph = 2 * np.pi * t
        # coda: ferma alla base, un'onda che corre verso la punta e un'oscillazione intorno alla base
        wt = rampa(805 - Y, 0, 560) ** 1.3 * rampa(X, 760, 800)
        ang = 0.05 * np.sin(ph) * ampiezza + coda_su
        rx, ry = X - CODA_BASE[0], Y - CODA_BASE[1]
        dx = wt * ((np.cos(ang) - 1) * rx - np.sin(ang) * ry + ampiezza * (13 * np.sin(Y / 70 - ph) + 5 * np.sin(Y / 31 - 2 * ph + 1)))
        dy = wt * (np.sin(ang) * rx + (np.cos(ang) - 1) * ry + ampiezza * 6 * np.sin(X / 60 + ph))
        # cresta: ferma sulla fronte; le punte tremano di lato e si allungano verso l'alto due volte per giro (bordi morbidi,
        # così le orecchie accanto si muovono appena e niente si strappa)
        su_c = rampa(440 - Y, 0, 270) ** 1.2
        wc = su_c * rampa(X, 270, 350) * rampa(-X, -720, -640)
        dx = dx + wc * ampiezza * (9 * np.sin(Y / 40 - ph + 2) + 4 * np.sin(Y / 22 - 2 * ph))
        dy = dy - wc * ampiezza * (7 + 7 * np.sin(2 * ph - X / 45))
        # fiamme più grandi: la cresta cresce dalla fronte verso l'alto, la coda dalla sua base
        if fiamma != 1.0:
            dy = dy - wc * (fiamma - 1) * (440 - Y) * 0.8
            dx = dx + wt * (fiamma - 1) * (X - CODA_BASE[0]) * 0.3
            dy = dy + wt * (fiamma - 1) * (Y - CODA_BASE[1]) * 0.45
        # vento: tutto quello che sta sopra la fronte (cresta e orecchie) e la coda tirati indietro, di più in punta
        if vento:
            dx = dx + vento * (su_c * rampa(-X, -800, -760) * (440 - Y) * 0.30 + wt * (805 - Y) * 0.22)
        # il corpo: piega in avanti e si abbassa, i piedi fermi
        if piega or schiaccia:
            su = rampa(FEET[1] - Y, 0, FEET[1] - 160)
            dx = dx - piega * su
            dy = dy + schiaccia * su
        if testa[0] or testa[1]:
            wh = rampa(760 - Y, 0, 90) * rampa(-X, -820, -760)
            dx = dx + testa[0] * wh; dy = dy + testa[1] * wh
        return dx, dy
    return warp

def spost_testa(piega=0.0, schiaccia=0.0, testa=(0.0, 0.0)):
    """di quanti pixel (interi) si sposta il muso con la deformazione (per incollare occhi e bocca)"""
    cy = 640.0
    su = rampa(FEET[1] - cy, 0, FEET[1] - 160)
    dx = -piega * su + testa[0]; dy = schiaccia * su + testa[1]
    return int(round(dx / Q.K)), int(round(dy / Q.K))

# ------------------------------------------------------------------ braci
# dove nascono (punte delle fiamme nel disegno), quando (fase), di quanto salgono e ondeggiano
BRACI = [((540, 168), 0.00, 13, 1.0), ((420, 250), 0.40, 10, -1.0), ((582, 272), 0.72, 9, 1.0),
         ((990, 252), 0.15, 12, -1.0), ((826, 262), 0.55, 10, 1.0), ((1118, 446), 0.30, 11, 1.0), ((1084, 578), 0.85, 9, -1.0),
         ((1028, 212), 0.62, 8, 1.0), ((412, 205), 0.08, 8, -1.0)]
def braci(lab, op, t, mirror=False, forza=1.0, solo=None):
    """braci che nascono dalle punte, salgono, ondeggiano e si spengono (2x2 gialle, poi un pixel arancio e rosso);
    mai sopra la volpe"""
    for n, ((x0, y0), off, su, lato) in enumerate(BRACI):
        if solo is not None and n not in solo: continue
        k = (t + off) % 1.0
        sx, sy = Q.to_sprite(x0, y0)
        if mirror: sx = W - 1 - sx; lato = -lato
        y = int(round(sy - 2 - su * forza * k)); x = int(round(sx + lato * (1.2 * np.sin(2 * np.pi * k) + 1.5 * k)))
        if k < 0.30: pts = [((0, 0), 'y0'), ((1, 0), 'y1'), ((0, 1), 'o0'), ((1, 1), 'o1')]
        elif k < 0.55: pts = [((0, 0), 'y1'), ((0, 1), 'o1')]
        elif k < 0.78: pts = [((0, 0), 'o0')]
        elif k < 0.92: pts = [((0, 0), 'r1')]
        else: pts = []
        for (dx, dy), c in pts:
            yy, xx = y + dy, x + dx
            if 1 <= yy < H - 1 and 1 <= xx < W - 1 and not op[yy, xx]:
                lab[yy, xx] = c; op[yy, xx] = True

# ------------------------------------------------------------------ dita (le righe tra le dita delle zampe, davanti)
DITA = [((265, 965), (265, 995)), ((292, 962), (292, 992)),
        ((418, 1045), (418, 1078)), ((448, 1045), (448, 1078)),
        ((612, 955), (612, 988)), ((640, 955), (640, 988)),
        ((852, 965), (852, 1005)), ((882, 965), (882, 1005))]
def dita(lab, op, warp=None):
    for (x0, y0), (x1, y1) in DITA:
        a = np.array(Q.to_sprite(x0, y0)); b = np.array(Q.to_sprite(x1, y1))
        n = int(np.ceil(np.abs(b - a).max())) + 1
        for k in range(n):
            q = a + (b - a) * k / max(n - 1, 1)
            y, x = int(q[1]), int(q[0])
            if 0 <= y < H and 0 <= x < W and op[y, x] and lab[y, x] in ('r0', 'r1', 'r2', 'o1'):
                lab[y, x] = 'r3'

# ------------------------------------------------------------------ un fotogramma
def posa(i=0, n=N_FERMO, respiro=0, testa_giu=0, occhi='aperti', fiamma=1.0, vento=0.0, coda_su=0.0, piega=0.0, schiaccia=0.0,
         testa=(0.0, 0.0), ampiezza=1.0, braci_forza=1.0, key=None):
    return dict(t=i / n, respiro=respiro, testa_giu=testa_giu, occhi=occhi, fiamma=fiamma, vento=vento, coda_su=coda_su,
                piega=piega, schiaccia=schiaccia, testa=testa, ampiezza=ampiezza, braci_forza=braci_forza, key=key)

def corpo(p):
    """il disegno deformato, ridotto a pixel, con le parti spostate a pixel interi (respiro)"""
    warp = deforma(p['t'], p['fiamma'], p['vento'], p['coda_su'], p['piega'], p['schiaccia'], p['testa'], p['ampiezza'])
    S = Q.sprite(warp=warp, key=p['key'])
    b, h = p['respiro'], p['respiro'] + p['testa_giu']
    if b or h:
        S = Q.componi(S, {Q.CORPO: (0, b), Q.CODA: (0, b), Q.TESTA: (0, h), Q.CRESTA: (0, h)})
    ox, oy = spost_testa(p['piega'], p['schiaccia'], p['testa'])
    return S, (ox, oy + h)

def fronte(p):
    S, off = corpo(p)
    lab, edge = Q.colora(S)
    op = S['op'].copy()
    dita(lab, op)
    Q.volto(lab, op, off=off, occhi=p['occhi'])
    braci(lab, op, p['t'], forza=p['braci_forza'])
    return lab, op

# ------------------------------------------------------------------ di spalle
PETTO = [(345, 755), (495, 740), (510, 840), (460, 910), (380, 880), (340, 820)]
BOCCA = [(330, 660), (430, 660), (430, 740), (330, 740)]                   # dove il disegno ha la bocca aperta
ZAMPE_VICINE = [[(372, 846), (530, 860), (520, 1100), (370, 1100)],      # davanti vicina (da dietro è lontana)
                [(780, 800), (950, 800), (950, 1060), (790, 1060)]]      # dietro vicina
DISCO = np.array([[0, 1, 1, 1, 0], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [0, 1, 1, 1, 0]], bool)
_YY, _XX = np.mgrid[0:H, 0:W] + 0.5

def tri(x):
    return 2 * np.abs(x - np.floor(x + 0.5))      # onda a triangolo da 0 a 1

def maschere(polys, dx, dy):
    out = []
    for poly in polys:
        m = Q.poligono_sprite(poly, mirror=True, dy=dy)
        if dx: m = np.roll(m, dx, 1)
        out.append(m)
    return out

def chiudi_bocca(S, dx, dy):
    """da dietro la testa è tonda: si chiude la bocca aperta del disegno (solo lì: i ciuffi delle guance restano)"""
    op, idx, parts = S['op'], S['idx'], S['parts']
    zona = nd.binary_dilation(maschere([BOCCA], dx, dy)[0], iterations=2)
    nuovi = nd.binary_closing(op, structure=DISCO) & zona & ~op
    S = dict(S); S['op'] = op | nuovi
    idx = idx.copy(); parts = parts.copy(); line = S['line'].copy()
    near = nd.grey_dilation(np.where(op, idx, 0), size=(3, 3)); idx[nuovi] = near[nuovi]
    parts[nuovi] = Q.TESTA; line[nuovi] = False
    S['idx'] = idx; S['parts'] = parts; S['line'] = line
    return S

def nuca(lab, op, edge, parts, orecchie, b1=0.25, b2=0.68, amp=0.22, per=3.6):
    """la testa vista da dietro: pelo illuminato dall'alto (arancio chiaro), che scende a fasce verso la nuca (arancio, poi
    rosso arancio) con il bordo a dentini come ciuffi; il lato lontano dalla luce un po' più scuro, un filo di luce sul bordo in
    alto a destra, una riga dove la testa tocca il collo"""
    head = op & ~edge & (parts == Q.TESTA) & ~orecchie
    if not head.any(): return
    ys, xs = np.nonzero(head)
    cx, cy = xs.mean() + .5, ys.mean() + .5
    rx, ry = 2 * xs.std(), 2 * ys.std()
    u = (_XX - cx) / rx; v = (_YY - cy) / ry
    z1 = amp * (tri(_XX / per) - 0.5)                 # i dentini: ciuffi con la punta in su
    z2 = amp * (tri(_XX / per + 0.5) - 0.5)
    tono = np.full((H, W), 5)
    tono[v > b1 + z1 - 0.18 * u] = 4                   # più in basso e più a sinistra, più ombra (luce in alto a destra)
    tono[v > b2 + z2 - 0.18 * u] = 3
    tono[(u < -0.78 + 0.1 * (tri(_YY / per) - .5)) & (tono > 4)] = 4
    dm = nd.distance_transform_edt(np.pad(head, 1))[1:-1, 1:-1]
    verso = (u * 0.55 - v * 0.83) / np.maximum(np.hypot(u, v), 1e-3)
    tono[(dm <= 1.5) & (verso > 0.35) & (np.hypot(u, v) > 0.55)] = 6
    for y, x in zip(*np.nonzero(head)): lab[y, x] = Q.SCALA[tono[y, x]]
    collo = head & nd.binary_dilation(op & ~edge & (parts == Q.CORPO), structure=Q.N4)
    for y, x in zip(*np.nonzero(collo)): lab[y, x] = 'ol'

def orecchie_dietro(lab, op, edge, parts, ears, dy):
    """il dietro delle orecchie: pelo arancio alla base che diventa rosso verso la punta, il lato verso la luce più chiaro,
    una riga dove toccano la testa"""
    for em0, poly in zip(ears, (Q.POLY_ORECCHIO_V, Q.POLY_ORECCHIO_L)):
        em = em0 & op & ~edge & (parts == Q.TESTA)
        if not em.any(): continue
        q = np.array([Q.to_sprite(x, y) for x, y in poly]); q[:, 0] = W - q[:, 0]; q[:, 1] += dy
        tip = q[np.argmin(q[:, 1])]
        ys, xs = np.nonzero(em)
        base = np.array((xs.mean() + .5, ys.max() + .5))
        ax = tip - base; ln = np.linalg.norm(ax); ax = ax / ln
        s = ((_XX - base[0]) * ax[0] + (_YY - base[1]) * ax[1]) / ln
        lato = (_XX - base[0]) * ax[1] - (_YY - base[1]) * ax[0]
        tono = np.where(s > 0.70, 2, np.where(s > 0.42, 3, 4))
        tono = np.where((lato < -0.6) & (s < 0.70), tono + 1, tono)
        for y, x in zip(*np.nonzero(em)): lab[y, x] = Q.SCALA[min(tono[y, x], 5)]
        resto = op & ~edge & ~em0 & (parts == Q.TESTA)
        bordo = em & nd.binary_dilation(resto, structure=Q.N4)
        for y, x in zip(*np.nonzero(bordo)): lab[y, x] = 'r4'

def spalle(p):
    S, off = corpo(p)
    S = {k: (v[:, ::-1].copy() if isinstance(v, np.ndarray) else v) for k, v in S.items()}
    dx_h, dy_h = -off[0], off[1]
    S = chiudi_bocca(S, dx_h, dy_h)
    lab, edge = Q.colora(S)
    op = S['op'].copy(); parts = S['parts']
    ears = maschere((Q.POLY_ORECCHIO_V, Q.POLY_ORECCHIO_L), dx_h, dy_h)
    nuca(lab, op, edge, parts, ears[0] | ears[1])
    orecchie_dietro(lab, op, edge, parts, ears, dy_h)
    inner = op & ~edge
    # il petto chiaro non si vede da dietro
    pe = maschere([PETTO], 0, p['respiro'])[0] & inner
    for y, x in zip(*np.nonzero(pe)):
        if lab[y, x] in ('y1', 'y0'): lab[y, x] = 'o0'
        elif lab[y, x] == 'il': lab[y, x] = 'o1'
    # le zampe che davanti erano vicine, da dietro sono lontane: un tono più scure
    for zm in maschere(ZAMPE_VICINE, 0, 0):
        for y, x in zip(*np.nonzero(zm & inner & (parts == Q.ZAMPE))):
            if lab[y, x] in Q.SCALA: lab[y, x] = Q.SCALA[max(0, Q.SCALA.index(lab[y, x]) - 1)]
    braci(lab, op, p['t'], mirror=True, forza=p['braci_forza'])
    return lab, op

# ------------------------------------------------------------------ le animazioni
RESPIRO = [0, 0, 1, 1, 1, 1, 0, 0]         # il corpo scende di un pixel e torna
TESTA = [0, 0, 0, 1, 1, 1, 1, 0]           # la testa lo segue con un fotogramma di ritardo (scende dopo, risale dopo)

def fermo_posa(i, occhi='aperti'):
    b = RESPIRO[i]
    return posa(i, N_FERMO, respiro=b, testa_giu=TESTA[i] - b, occhi=occhi, key=('fermo', i))

ATTACCO = [   # (fase, fiamma, vento, coda_su, piega, schiaccia, testa, occhi, braci)
    (0.00, 1.08, -0.08, 0.05, -10, 14, (8, 6), 'aperti', 1.0),        # si carica: indietro e giù
    (0.12, 1.16, -0.12, 0.10, -22, 30, (16, 12), 'aperti', 1.3),
    (0.25, 1.22, -0.10, 0.14, -26, 38, (20, 14), 'mezzi', 1.5),       # tutto raccolto, occhi stretti
    (0.37, 1.22, 0.55, 0.04, 40, 4, (-28, -6), 'aperti', 1.6),        # scatto in avanti, fiamme tirate indietro
    (0.50, 1.18, 0.70, 0.00, 52, 0, (-36, -8), 'aperti', 1.6),
    (0.62, 1.12, 0.45, 0.02, 34, 6, (-20, -2), 'aperti', 1.4),
    (0.75, 1.05, 0.20, 0.03, 12, 8, (-6, 2), 'aperti', 1.2),          # torna
    (0.87, 1.01, 0.05, 0.00, 0, 2, (0, 0), 'aperti', 1.0)]
COLPITO = [
    (0.00, 0.85, 0.40, -0.05, -34, 10, (26, -6), 'chiusi', 0.6),
    (0.25, 0.82, 0.30, -0.06, -40, 14, (30, -4), 'chiusi', 0.6),
    (0.50, 0.90, 0.15, -0.03, -18, 8, (14, 0), 'mezzi', 0.8),
    (0.75, 0.97, 0.05, 0.00, -6, 2, (4, 0), 'aperti', 1.0)]

def posa_mossa(riga, j, nome):
    t, fi, ve, cs, pi, sc, te, oc, br = riga
    return posa(0, 1, occhi=oc, fiamma=fi, vento=ve, coda_su=cs, piega=pi, schiaccia=sc, testa=te, braci_forza=br,
                key=(nome, j)) | dict(t=t)

def foglio(righe, name, meta):
    """righe: lista di liste di (lab, op); tutte le righe lunghe come la più lunga (le corte lasciano vuoto)"""
    nc = max(len(r) for r in righe)
    a = np.zeros((H * len(righe), W * nc, 4), np.uint8)
    for ri, r in enumerate(righe):
        for ci, (l, o) in enumerate(r):
            a[ri * H:(ri + 1) * H, ci * W:(ci + 1) * W] = np.asarray(Q.render(l, o))
    Image.fromarray(a, 'RGBA').save(os.path.join(OUT, name + '.png'))
    al = a[..., 3] > 0
    tocca = []
    for ri in range(len(righe)):
        for ci in range(nc):
            f = al[ri * H:(ri + 1) * H, ci * W:(ci + 1) * W]
            if f[:1].any() or f[-1:].any() or f[:, :1].any() or f[:, -1:].any(): tocca.append((ri, ci))
    json.dump(meta, open(os.path.join(OUT, name + '.json'), 'w'), indent=1, ensure_ascii=False)
    return tocca

def punti(mirror=False):
    """punti utili alla scena (pixel dello sprite): bocca (da dove escono le fiamme), corpo (dove arrivano i colpi), braci (le
    punte delle fiamme)"""
    def q(x, y):
        sx, sy = Q.to_sprite(x, y)
        if mirror: sx = W - 1 - sx
        return [int(round(sx)), int(round(sy))]
    return dict(bocca=q(392, 690), corpo=q(640, 800), braci=[q(540, 168), q(990, 252), q(1118, 446), q(420, 250)])

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    px, py = Q.to_sprite(*Q.PIVOT_SRC)
    piv = [int(round(px)), int(round(py))]
    comune = dict(category='creature_battle', frame_width=W, frame_height=H, pivot=piv, anchor=piv, w=W, h=H,
                  source='disegno di Denis (13 ottobre): pixel art pulita come lo screenshot della lotta, occhi e bocca del disegno',
                  version='0.7-occhi-del-disegno', status='da approvare',
                  scala_consigliata='avversario 1x, il tuo 3x (pixel grossi come nello screenshot)')
    anim_davanti = {
        'fermo': dict(riga=0, n=N_FERMO, fps=FPS_FERMO, loop=True),
        'fermo_occhi_mezzi': dict(riga=1, n=N_FERMO, fps=FPS_FERMO, loop=True, nota='stesso fotogramma del fermo, occhi a metà'),
        'fermo_occhi_chiusi': dict(riga=2, n=N_FERMO, fps=FPS_FERMO, loop=True, nota='stesso fotogramma del fermo, occhi chiusi'),
        'attacco': dict(riga=3, n=len(ATTACCO), fps=12, loop=False, scatto=3, nota='0-2 si carica, 3-5 scatta, 6-7 torna'),
        'colpito': dict(riga=4, n=len(COLPITO), fps=12, loop=False),
    }
    righe = [[fronte(fermo_posa(i, oc)) for i in range(N_FERMO)] for oc in ('aperti', 'mezzi', 'chiusi')]
    righe.append([fronte(posa_mossa(r, j, 'attacco')) for j, r in enumerate(ATTACCO)])
    righe.append([fronte(posa_mossa(r, j, 'colpito')) for j, r in enumerate(COLPITO)])
    t1 = foglio(righe, 'lotta_davanti', dict(asset_id='creature_volpefuoco_battle_front', direction='front', animazioni=anim_davanti,
                                             punti=punti(), battito='mezzi, chiusi, mezzi (0,06 s, 0,10 s, 0,06 s) ogni 2-5 s', **comune))
    piv_s = [W - 1 - piv[0], piv[1]]
    c2 = dict(comune); c2.update(pivot=piv_s, anchor=piv_s)
    anim_spalle = {
        'fermo': dict(riga=0, n=N_FERMO, fps=FPS_FERMO, loop=True),
        'attacco': dict(riga=1, n=len(ATTACCO), fps=12, loop=False, scatto=3, nota='0-2 si carica, 3-5 scatta, 6-7 torna'),
        'colpito': dict(riga=2, n=len(COLPITO), fps=12, loop=False),
    }
    righe = [[spalle(fermo_posa(i)) for i in range(N_FERMO)]]
    righe.append([spalle(posa_mossa(r, j, 'attacco')) for j, r in enumerate(ATTACCO)])
    righe.append([spalle(posa_mossa(r, j, 'colpito')) for j, r in enumerate(COLPITO)])
    t2 = foglio(righe, 'lotta_spalle', dict(asset_id='creature_volpefuoco_battle_back', direction='back', animazioni=anim_spalle,
                                            punti=punti(mirror=True), **c2))
    print('davanti', 'tocca il bordo: %s' % t1 if t1 else 'ok', '| spalle', 'tocca il bordo: %s' % t2 if t2 else 'ok')
