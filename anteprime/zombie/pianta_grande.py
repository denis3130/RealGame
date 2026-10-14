# Pianta dall'alto della mappa zombie grande (anteprima 48, punti 10 e 12-17 del piano di Denis): alle due aree di prima (la partenza
# «Camposanto e Casa» e la «Fattoria dei Corvi») si aggiungono a est il «Borgo dei Lumi» (dietro la partenza) e la «Segheria del Fiume»
# (dietro la fattoria). Le quattro zone fanno un anello: partenza -> borgo -> segheria -> fattoria -> partenza, ognuna aperta da una barriera
# a pagamento. Coordinate in caselle della pianta (x 0..30, y 0..24; nel mondo y + 2). Uso: python3 anteprime/zombie/pianta_grande.py [uscita.png]
import sys, math
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else 'anteprime/zombie/pianta_grande.png'
K = 2
TS = 34 * K
MX, MY = 24 * K, 110 * K
W_T, H_T = 30, 24
LEG_H = 560 * K
IW, IH = MX * 2 + W_T * TS, MY + H_T * TS + 30 * K + LEG_H
img = Image.new('RGB', (IW, IH), '#0d0f16')
d = ImageDraw.Draw(img)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f = lambda s, b=True: ImageFont.truetype(FB if b else FR, int(s * K))
X = lambda x: MX + x * TS
Y = lambda y: MY + y * TS
P = lambda x, y: (X(x), Y(y))

def rect(x0, y0, x1, y1, fill, out=None, w=2):
    d.rectangle([X(x0), Y(y0), X(x1), Y(y1)], fill=fill, outline=out, width=int(w * K) if out else 0)
def poly(pts, fill, out=None, w=2):
    d.polygon([P(*p) for p in pts], fill=fill, outline=out, width=int(w * K) if out else 0)
def line(pts, col, w=2, dash=None):
    Q = [P(*p) for p in pts]
    if not dash:
        d.line(Q, fill=col, width=int(w * K), joint='curve'); return
    for (a, b) in zip(Q, Q[1:]):
        L = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** .5; n = max(1, int(L / (dash * K)))
        for i in range(0, n, 2):
            t0, t1 = i / n, min(1, (i + 1) / n)
            d.line([(a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0), (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)], fill=col, width=int(w * K))
def circ(x, y, r, fill, out=None, w=2):
    d.ellipse([X(x) - r * TS, Y(y) - r * TS, X(x) + r * TS, Y(y) + r * TS], fill=fill, outline=out, width=int(w * K) if out else 0)
def text(x, y, s, size=11, col='#f2ead8', anchor='mm', b=True, stroke=2):
    d.text(P(x, y), s, font=f(size, b), fill=col, anchor=anchor, stroke_width=int(stroke * K), stroke_fill='#0b0a10')
def bldg(x0, y0, x1, y1, col, name, sub=None, size=11):
    rect(x0, y0, x1, y1, col, '#0b0a10', 3); text((x0 + x1) / 2, (y0 + y1) / 2 - (.22 if sub else 0), name, size)
    if sub: text((x0 + x1) / 2, (y0 + y1) / 2 + .3, sub, 8, '#d8cfc0', b=False)
def door(x, y, horiz=True):
    if horiz: rect(x - .25, y - .09, x + .25, y + .09, '#c8a06a', '#0b0a10', 1)
    else: rect(x - .09, y - .25, x + .09, y + .25, '#c8a06a', '#0b0a10', 1)
def win(x, y, horiz=True):   # finestra-barriera: gli zombie la rompono, l'eroe la sbarra
    if horiz: rect(x - .2, y - .07, x + .2, y + .07, '#9fd0ff', '#0b0a10', 1)
    else: rect(x - .07, y - .2, x + .07, y + .2, '#9fd0ff', '#0b0a10', 1)
def bar(pts, col='#e0a050'):  # varco riparabile (legno o ferro)
    line(pts, '#0b0a10', 6); line(pts, col, 3)
def gate(x, y, price, label, horiz=True, col='#ffd65a'):   # barriera a pagamento tra le zone
    if horiz: rect(x - .8, y - .14, x + .8, y + .14, '#3a2a14', col, 2)
    else: rect(x - .14, y - .8, x + .14, y + .8, '#3a2a14', col, 2)
    text(x + (0 if horiz else .1), y + (.45 if horiz else 0), '● ' + price, 9, col, 'mm' if horiz else 'lm')
    if label: text(x + (0 if horiz else .1), y + (.82 if horiz else .45), label, 7, '#e8dcc0', 'mm' if horiz else 'lm', b=False)
def spawn(x, y, kind=''):
    circ(x, y, .2, '#b8302a', '#2a0808', 2); text(x, y + .01, 'Z', 8, '#ffe8e0', stroke=0)
def mach(x, y, ch, col):
    circ(x, y, .3, col, '#0b0a10', 2); text(x, y + .01, ch, 9, '#0b0a10', stroke=0)
def arma(x, y, price):
    rect(x - .32, y - .16, x + .32, y + .16, '#1c1a1e', '#e8e4da', 2); line([(x - .2, y), (x + .22, y - .03)], '#e8e4da', 3)
    text(x, y - .38, price, 7, '#e8e4da')
def bara(x, y):
    pts = [(x - .1, y - .26), (x + .1, y - .26), (x + .18, y - .08), (x + .12, y + .26), (x - .12, y + .26), (x - .18, y - .08)]
    poly(pts, '#3a2418', '#7ae08a', 2); text(x, y + .02, '?', 8, '#ffe28a', stroke=0)

# ---------------------------------------------------------------- le quattro zone
rect(0, 0, 16, 12.3, '#3d3324')            # 2 fattoria
rect(2, 12.3, 14, 24, '#2e3b28')           # 1 partenza
rect(16, 0, 30, 12.3, '#2c2f26')           # 4 segheria
rect(14, 12.3, 30, 24, '#2b2a2c')          # 3 borgo
for i in range(W_T + 1): line([(i, 0), (i, 24)], '#ffffff10' if False else '#262a25', 1)
for i in range(H_T + 1): line([(0, i), (30, i)], '#262a25', 1)
# fuori dalla mappa (si vede ma non ci si va): nebbia ai lati della partenza, il fiume e il bosco a nord-est, le case in rovina a sud
rect(0, 12.3, 2, 24, '#141820'); text(1, 18, 'nebbia', 8, '#8a90a0', b=False)
# ---------------------------------------------------------------- FATTORIA (com'è) e PARTENZA (com'è), in breve
rect(0, 0, 16, 3.25, '#27321f')
for i in range(32): line([(.25 + i * .5, .1), (.25 + i * .5, 3.15)], '#3a4a2c', 2)
rect(4.7, 3.9, 10.8, 9.8, '#4e3f2a')
bldg(.5, 4.3, 4.0, 7.6, '#5a4a40', 'Casa colonica', None, 9)
bldg(11.0, 4.12, 15.4, 8.32, '#7b2e26', 'Fienile', None, 10)
circ(7.8, 6.6, .35, '#2a2f38', '#0b0a10', 2)
for x in (2.6, 8.0, 12.4): bar([(x - .35, 3.55), (x + .35, 3.55)]); spawn(x, 3.0)
for (x, y, h) in [(4.0, 5.2, False), (4.0, 6.7, False), (2.3, 4.3, True)]: win(x, y, h)
gate(6.45, 12.3, '750', None)
rect(5.95, 12.3, 6.95, 18.25, '#5b5d66')
bldg(2.0, 14.35, 5.7, 21.3, '#3a3127', 'Cimitero', None, 10)
bldg(7.5, 15, 11.2, 17.5, '#4e3b4a', 'Casa', None, 10)
for (x, y, h) in [(8.24, 17.5, True), (10.53, 17.5, True), (11.2, 16.1, False)]: win(x, y, h)
bar([(2, 17.6), (2, 18.2)], '#a0a8b8'); spawn(1.4, 17.9)
arma(9.6, 14.6, '500'); bara(4.45, 16.76); arma(10.7, 9.45, '1.500')
mach(13.0, 16.0, 'E', '#d8452e')          # Credenza degli Elisir
mach(9.2, 22.7, 'F', '#7dffa0'); mach(7.35, 8.3, 'F', '#7dffa0')   # Macchine della Fortuna
mach(4.55, 22.25, 'A', '#5dff8f')         # Lanterna delle Anime
text(8, 23.4, 'PARTENZA · Camposanto e Casa', 11, '#9fe6a8'); text(8, 1.6, 'FATTORIA DEI CORVI', 11, '#ffd65a')
circ(4.4, 23.0, .32, '#5dff8f', '#0b0a10', 2); text(4.4, 23.0, '★', 9, '#0b0a10', stroke=0)
# ---------------------------------------------------------------- SEGHERIA DEL FIUME (nuova, a est della fattoria)
rect(16, 0, 30, 1.6, '#1a2638');
for i in range(14): line([(16.3 + i, .5 + (i % 2) * .4), (16.9 + i, .5 + (i % 2) * .4)], '#3a5a7a', 2)
text(23, .75, 'il fiume (ci si affaccia, non ci si entra)', 8, '#9fc0e0', b=False)
rect(16, 1.6, 30, 2.1, '#3a3426')           # la riva fangosa
circ(18.7, 1.9, .6, '#5a4a3a', '#0b0a10', 2); text(18.7, 1.9, 'ruota', 7)    # la ruota del mulino ad acqua
for x in (21.2, 26.2): spawn(x, 1.85)       # escono dall'acqua
bldg(19.5, 3.4, 26.5, 8.4, '#5a4a3a', 'Segheria', 'grande, tre porte', 12)
door(23.25, 8.4); door(19.5, 5.6, False); door(24.6, 3.4)
win(21.2, 8.4); win(26.5, 6.0, False)
rect(22.0, 5.2, 25.0, 6.3, '#8a7a62', '#0b0a10', 1); text(23.5, 5.75, 'sega', 7, '#1b120a', stroke=0)
bara(20.4, 4.2); arma(21.6, 8.85, '1.250')
bldg(27.0, 4.0, 29.5, 7.0, '#6a3a30', 'Caldaia', None, 9); mach(28.2, 6.6, 'V', '#ff8a50')   # la valvola
bldg(16.4, 5.0, 18.6, 7.0, '#4a3d30', 'Rimessa', None, 8)
for (x0, y0, x1, y1) in [(16.8, 9.2, 19.0, 10.8), (27.0, 8.6, 29.6, 10.4)]:
    rect(x0, y0, x1, y1, '#6a5038', '#0b0a10', 2); text((x0 + x1) / 2, (y0 + y1) / 2, 'tronchi', 7)
rect(21.0, 10.2, 22.8, 11.0, '#5a4430', '#0b0a10', 2); spawn(21.9, 10.6)   # carro dei tronchi abbandonato
circ(26.2, 10.6, .25, '#4a3d30', '#0b0a10', 2); text(26.2, 11.05, 'gru', 7)
bar([(30, 6.0), (30, 7.0)]); spawn(30.4, 6.5)
text(23, 11.7, 'SEGHERIA DEL FIUME', 11, '#ffb070')
# ---------------------------------------------------------------- BORGO DEI LUMI (nuovo, a est della partenza)
rect(14, 17.4, 30, 19.6, '#4a4a52'); text(28.6, 18.0, '→ la strada va', 7, '#c8c8d0', b=False)
for i in range(0, 64): line([(14.1 + i * .25, 17.45), (14.1 + i * .25, 19.55)], '#3e3e46', 1)
bldg(15.2, 13.3, 21.6, 16.9, '#5a3a32', 'Locanda del Corvo', 'due piani: scale dentro', 11)
door(18.4, 16.9); door(16.6, 13.3); door(21.6, 15.0, False)
for (x, y, h) in [(16.4, 16.9, True), (20.4, 16.9, True), (19.4, 13.3, True), (15.2, 15.2, False)]: win(x, y, h)
rect(15.4, 13.5, 17.6, 14.0, '#c8a06a', '#0b0a10', 1); text(16.5, 13.75, 'scale', 6, '#1b120a', stroke=0)
mach(20.6, 14.4, 'E', '#d8452e')          # la seconda Credenza, dietro il banco
arma(16.0, 15.4, '2.000 (sopra)')
rect(22.6, 13.2, 27.0, 17.0, '#3e3a36'); text(24.8, 13.65, 'piazza del mercato', 8, '#d8cfc0', b=False)
for (x, y) in [(23.4, 14.6), (25.2, 14.6), (24.3, 16.0)]: rect(x - .5, y - .3, x + .5, y + .3, '#7a5a3a', '#0b0a10', 2)
rect(26.0, 15.6, 26.9, 16.6, '#5a4430', '#0b0a10', 2); spawn(26.45, 16.1)   # carretto rovesciato
circ(15.6, 12.8, .3, '#2a2f38', '#0b0a10', 2); spawn(15.6, 12.8)          # il pozzo del cortile
bldg(15.0, 20.3, 19.5, 23.4, '#4a3a2e', 'Fucina', 'aperta sulla strada', 10)
mach(17.2, 21.3, 'P', '#8fe6ff'); arma(19.0, 20.0, '1.000')               # la Forgia delle Anime
rect(20.4, 20.4, 24.2, 23.6, '#2e3324', '#6a6e7a', 2); text(22.3, 20.8, 'orto del parroco', 7, '#c8d0b8', b=False)
for (x, y) in [(21.4, 22.4), (23.2, 22.6)]: spawn(x, y)
bldg(25.0, 20.0, 29.0, 23.6, '#6a6a72', 'Cappella', None, 10)
rect(28.0, 20.0, 29.0, 21.0, '#7a7a84', '#0b0a10', 2)
door(25.0, 21.6, False); win(26.6, 20.0); win(26.6, 23.6); bara(27.6, 22.2)
rect(27.2, 17.65, 29.6, 18.8, '#2a2220', '#ff8a50', 2); text(28.4, 18.22, 'carrozza della scuola', 6, '#ffcfa0', stroke=1); spawn(28.4, 19.2)
bar([(30, 18.2), (30, 19.0)]); spawn(30.4, 18.6)
bar([(22.0, 24), (23.0, 24)], '#a0a8b8'); spawn(22.5, 24.45)
text(22, 23.95, 'BORGO DEI LUMI', 11, '#ffd0a0')
# ---------------------------------------------------------------- le barriere a pagamento tra le zone (l'anello)
gate(14.0, 18.5, '1.000', 'carri e assi', horiz=False)
gate(16.0, 9.7, '1.000', 'tronchi', horiz=False)
gate(25.5, 12.3, '1.250', 'cancello della segheria')
for (a, b) in [((13.4, 19.5), (14.6, 19.5)), ((25.5, 11.6), (25.5, 13.0)), ((16.6, 9.0), (15.4, 9.0)), ((6.45, 13.0), (6.45, 11.6))]:
    line([a, b], '#ffd65a', 3)
# ---------------------------------------------------------------- titolo e legenda
d.text((MX, 22 * K), 'Mappa zombie grande · pianta (30×24 caselle)', font=f(19), fill='#f2ead8')
d.text((MX, 52 * K), 'Quattro zone ad anello: Partenza → Borgo dei Lumi → Segheria del Fiume → Fattoria → Partenza.', font=f(10.5, False), fill='#c8c0b0')
d.text((MX, 70 * K), 'Ogni zona si apre pagando (barriere gialle); quelle aperte restano aperte e si gira in tondo.', font=f(10.5, False), fill='#c8c0b0')
ly = MY + H_T * TS + 40 * K
def leg(x, y, draw, s):
    draw(x, y); d.text((X(x) + 22 * K, Y(y) - 7 * K), s, font=f(9.5, False), fill='#e8e0d0')
LX = lambda c: c
items = [
    (lambda x, y: gate(x, y, '', None), 'barriera a pagamento: si tiene premuto, si paga, la barriera si apre con la sua animazione'),
    (lambda x, y: win(x, y), 'finestra: gli zombie rompono il vetro (una volta sola) ed entrano; l\'eroe la sbarra con le assi'),
    (lambda x, y: bar([(x - .35, y), (x + .35, y)]), 'varco riparabile di legno (assi) o di ferro (sbarre, grigio)'),
    (lambda x, y: spawn(x, y), 'da dove escono gli zombie: fosse, granturco, fiume, pozzo, carri, carrozza bruciata, buio oltre il bordo'),
    (lambda x, y: mach(x, y, 'E', '#d8452e'), 'Credenza degli Elisir (perk): una nella partenza, una dietro il banco della Locanda'),
    (lambda x, y: mach(x, y, 'P', '#8fe6ff'), 'Forgia delle Anime (potenziamento delle armi) nella Fucina del borgo'),
    (lambda x, y: mach(x, y, 'V', '#ff8a50'), 'valvola della caldaia nella segheria: dà il vapore alla Forgia (gratis)'),
    (lambda x, y: arma(x, y, ''), 'arma a muro (col prezzo): Revolver, Pompa, Mitraglietta, Mitra, Pompa tattica (al piano di sopra)'),
    (lambda x, y: bara(x, y), 'posti della Bara delle Sorprese (si apre 3-5 volte, poi si sposta)'),
    (lambda x, y: mach(x, y, 'F', '#7dffa0'), 'Macchina della Fortuna · A: Lanterna delle Anime · ★ partenza'),
]
for i, (fn, s) in enumerate(items):
    cx = .7 if i < 5 else 15.7
    yy = (ly - MY) / TS + .7 + (i % 5) * 1.25
    fn(cx, yy); d.text((X(cx) + 20 * K, Y(yy) - 7 * K), s, font=f(8.6, False), fill='#e8e0d0')
img = img.resize((IW // 2, IH // 2), Image.LANCZOS)
img.save(OUT); print(OUT, img.size)
