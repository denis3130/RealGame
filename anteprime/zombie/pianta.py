# Pianta dall'alto della mappa zombie (per farla approvare a Denis prima di costruirla in 3D): l'area di partenza «Camposanto e Casa»
# (quella dell'anteprima, allargata a 12×12 caselle) e a nord, oltre il cancello a pagamento, la «Fattoria dei Corvi» (16×12).
# Coordinate in caselle del mondo intero (16×24): fattoria x 0..16, y 0..12; area di partenza x 2..14, y 12..24. Le cose che ci sono già
# nell'anteprima (area_prova.js) sono riportate con lo scarto (+2, +14). Uso: python3 anteprime/zombie/pianta.py [uscita.png]
import sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else 'anteprime/zombie/pianta.png'
K = 2                      # disegno a 2× e poi rimpicciolisco (bordi morbidi)
TS = 50 * K                # una casella
MX, MY = 30 * K, 140 * K   # margini della mappa
W_T, H_T = 16, 24
LEG_H = 1060 * K
IW, IH = MX * 2 + W_T * TS, MY + H_T * TS + 40 * K + LEG_H
img = Image.new('RGB', (IW, IH), '#0d0f16')
d = ImageDraw.Draw(img)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f = lambda s, b=True: ImageFont.truetype(FB if b else FR, s * K)
X = lambda x: MX + x * TS
Y = lambda y: MY + y * TS
P = lambda x, y: (X(x), Y(y))
A1 = lambda x, y: (x + 2, y + 14)   # dall'anteprima (area_prova.js) al mondo intero

def rect(x0, y0, x1, y1, fill, out=None, w=2):
    d.rectangle([X(x0), Y(y0), X(x1), Y(y1)], fill=fill, outline=out, width=w * K if out else 0)
def poly(pts, fill, out=None, w=2):
    d.polygon([P(*p) for p in pts], fill=fill, outline=out, width=w * K if out else 0)
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
    d.ellipse([X(x) - r * TS, Y(y) - r * TS, X(x) + r * TS, Y(y) + r * TS], fill=fill, outline=out, width=w * K if out else 0)
def text(x, y, s, size=15, col='#f2ead8', anchor='mm', b=True, stroke=3):
    d.text(P(x, y), s, font=f(size, b), fill=col, anchor=anchor, stroke_width=stroke * K, stroke_fill='#0b0a10')
def num(x, y, n, col='#f2ead8', bg='#2a2430'):
    r = .2; circ(x, y, r, bg, '#0b0a10', 2); text(x, y + .01, str(n), 11, col, stroke=0)
def spawn(x, y, dx=0, dy=0):
    circ(x, y, .2, '#b8302a', '#2a0808', 2); text(x, y + .01, 'Z', 11, '#ffe8e0', stroke=0)
    if dx or dy:
        ex, ey = x + dx, y + dy; line([(x + dx * .3, y + dy * .3), (ex, ey)], '#d84a40', 3)
        import math
        a = math.atan2(dy, dx)
        for s in (-1, 1):
            line([(ex, ey), (ex - .22 * math.cos(a + s * .5), ey - .22 * math.sin(a + s * .5))], '#d84a40', 3)

# ---------------------------------------------------------------- terreno
# fuori dalle aree: il buio; le due aree
rect(0, 0, 16, 12, '#3d3324')                       # fattoria: terra
rect(2, 12, 14, 24, '#2e3b28')                      # area di partenza: erba
# fattoria: granturco (non ci si cammina) a file, con i pali degli spaventapasseri
rect(0, 0, 16, 3.25, '#27321f')
for i in range(0, 32):
    xx = .25 + i * .5
    line([(xx, .1), (xx, 3.15)], '#3a4a2c', 3)
for i in range(6):
    line([(0, .3 + i * .55), (16, .3 + i * .55)], '#1f2819', 1)
# fattoria: erba ai bordi, aia di terra battuta, orto arato, fango dei maiali
rect(0, 3.25, 16, 12, '#334128')
rect(4.7, 3.9, 10.8, 9.8, '#4e3f2a')                 # aia
rect(5.85, 9.8, 7.05, 12, '#4e3f2a')                 # strada dal cancello
rect(10.4, 8.9, 13.2, 11.7, '#33281d')               # orto
for i in range(7): line([(10.5, 9.1 + i * .38), (13.1, 9.1 + i * .38)], '#241c14', 2)
rect(0.7, 8.4, 3.7, 10.6, '#2b2219')                 # recinto dei maiali (fango)
# la griglia delle caselle, sotto tutto il resto
for i in range(W_T + 1): line([(i, 3.25), (i, 12)], '#3e4934', 1)
for i in range(4, 13): line([(0, i), (16, i)], '#3e4934', 1)
for i in range(2, 15): line([(i, 12.3), (i, 24)], '#36432f', 1)
for i in range(13, 25): line([(2, i), (14, i)], '#36432f', 1)
# area di partenza: terra del cimitero, sentieri di ciottoli, strada nuova verso il cancello
rect(*A1(0, .35), *A1(3.7, 7.3), '#3a3127')
for (x0, y0, x1, y1) in [(3.85, 4.2, 4.95, 10), (3.6, 5.05, 5, 6), (3.85, 4.2, 7.75, 5.15), (6.95, 3.4, 7.75, 5)]:
    rect(*A1(x0, y0), *A1(x1, y1), '#5b5d66')
rect(5.95, 12.3, 6.95, 18.25, '#5b5d66')             # strada nuova: dal bivio al cancello
for yy in range(0, 50):
    y = 12.4 + yy * .24
    if y < 24: line([(5.98, y), (6.92, y)], '#4a4c55', 1)

# ---------------------------------------------------------------- AREA 1: Camposanto e Casa (l'anteprima di adesso, allargata)
# muretti del cimitero con la cancellata
WC = '#8b8e9a'
line([A1(0, .35), A1(3.8, .35)], WC, 7); line([A1(0, 7.3), A1(3.8, 7.3)], WC, 7)
line([A1(3.7, .47), A1(3.7, 4.73)], WC, 7); line([A1(3.7, 6.28), A1(3.7, 7.18)], WC, 7)
for (x, y) in [(3.7, 4.95), (3.7, 6.05)]: rect(*A1(x - .17, y - .17), *A1(x + .17, y + .17), '#a3a6b2', '#0b0a10', 2)
line([A1(3.7 - .1, 4.95 - .2), A1(3.3, 4.55)], '#c6c8d2', 3); line([A1(3.7 - .1, 6.05 + .2), A1(3.3, 6.45)], '#c6c8d2', 3)  # ante aperte
# cripta
rect(*A1(.12, 1), *A1(2.02, 2.35), '#6d6a72', '#0b0a10', 3); rect(*A1(.5, 2.35), *A1(1.64, 2.55), '#55535b')
text(*A1(1.07, 1.62), 'Cripta', 13)
# lapidi
for (x, y) in [(2.9, 1.4), (1, 3.2), (1.9, 3.3), (2.85, 3.25), (.95, 5), (2.9, 5.1), (1, 6.5), (2.85, 6.55)]:
    rect(*A1(x - .17, y - .08), *A1(x + .17, y + .08), '#9a97a2', '#0b0a10', 2)
# fossa aperta, albero morto col cappio
rect(*A1(1.38, 4.55), *A1(1.82, 5.35), '#0a0708', '#3a2a1a', 2); spawn(*A1(1.6, 4.95), .45, -.3)
circ(*A1(3, 2.25), .18, '#4a3b2e', '#0b0a10', 2)
for (dx, dy) in [(-.45, -.15), (.4, .1), (.05, -.42)]: line([A1(3, 2.25), A1(3 + dx, 2.25 + dy)], '#6a5644', 3)
text(*A1(1.85, 3.95), 'Cimitero', 16)
# casa con il portico e il recinto (si entra: il tetto sparisce)
rect(*A1(5.5, 1), *A1(9.2, 3.5), '#4e3b4a', '#0b0a10', 3)
line([A1(5.5, 2.25), A1(9.2, 2.25)], '#3a2430', 3)
rect(*A1(6.87, 3.5), *A1(7.83, 4.06), '#6e5236', '#0b0a10', 2)
text(*A1(7.35, 1.65), 'Casa', 16); text(*A1(7.35, 2.8), '(si entra)', 11, '#d8cfc0', b=False)
FC = '#8a6e4c'
for (a, b) in [((5.2, 4.25), (6.65, 4.25)), ((8.05, 4.25), (9.85, 4.25)), ((9.85, .9), (9.85, 4.25))]: line([A1(*a), A1(*b)], FC, 4, dash=6)
for (x, y) in [(6.85, 4.05), (7.85, 4.1), (9.6, 4.42)]: circ(*A1(x, y), .14, '#d0702a', '#0b0a10', 2)
# lampioni, pozzo, carriola, casse, botte, sasso, cespugli, fieno, alberi, cartello
for (x, y) in [(3.95, 4.45), (5.35, 8.6)]: circ(*A1(x, y), .12, '#ffcf6a', '#0b0a10', 2)
circ(*A1(8.4, 6.2), .36, '#6a6d78', '#0b0a10', 3); circ(*A1(8.4, 6.2), .2, '#0b1a22')
rect(*A1(5.95, 5.55), *A1(6.6, 5.95), '#7d5a38', '#0b0a10', 2)
rect(*A1(8.95, 4.7), *A1(9.3, 5.0), '#54402c', '#0b0a10', 2); rect(*A1(9.32, 4.74), *A1(9.6, 4.99), '#54402c', '#0b0a10', 2)
circ(*A1(9.5, 5.25), .16, '#54402c', '#0b0a10', 2); circ(*A1(6.3, 7.45), .17, '#6d6a72', '#0b0a10', 2)
circ(*A1(5.55, 7.95), .18, '#3a5234', '#0b0a10', 2); rect(*A1(6.75, 6.95), *A1(7.28, 7.3), '#a8944a', '#0b0a10', 2)
for (x, y, r) in [(8.9, 8.6, .75), (.7, 9.1, .6)]: circ(*A1(x, y), r, '#2f4a2a', '#0b0a10', 2); circ(*A1(x, y), .12, '#4a3b2e')
rect(*A1(5.0, 5.33), *A1(5.24, 5.43), '#5a4a3a', '#0b0a10', 1)
# buche nel terreno
for (x, y) in [(8.1, 7.9), (2.3, 9.2)]: circ(*A1(x, y), .2, '#0a0708', '#3a2a1a', 2); spawn(*A1(x + .38, y - .25))
# partenza
hx, hy = A1(4.4, 8.4); circ(hx, hy, .26, '#3fb27a', '#0b0a10', 3); text(hx, hy + .01, '★', 13, '#eafff2', stroke=0)
text(hx + 1.25, hy, 'Partenza', 14, '#9ff0c4')

# novità dell'area di partenza (allargata a 12×12: due caselle a nord, due a est)
# il muro di confine con la cancellata (si vede oltre) e il CANCELLO di ferro con catena e lucchetto
line([(2, 12.3), (5.62, 12.3)], WC, 7); line([(7.28, 12.3), (14, 12.3)], WC, 7)
for x in (5.8, 7.1): rect(x - .18, 12.12, x + .18, 12.48, '#a3a6b2', '#0b0a10', 2)
line([(5.98, 12.3), (6.92, 12.3)], '#e0b040', 8)
for i in range(5): circ(6.06 + i * .19, 12.3, .055, '#1a1a20')
rect(6.3, 12.42, 6.6, 12.68, '#d8b040', '#0b0a10', 2)                                  # lucchetto
text(6.45, 12.98, '750', 15, '#ffe28a')
text(9.6, 12.72, 'Cancello con catena: 750 monete', 12, '#ffe28a')
# retro della casa: catasta di legna col ceppo e l'accetta, stendibiancheria con le lenzuola strappate; cespuglio spostato dalla strada
rect(8.0, 13.05, 9.25, 13.55, '#7d5a38', '#0b0a10', 2); circ(9.55, 13.35, .16, '#8a6a46', '#0b0a10', 2)
line([(10.0, 13.55), (11.7, 13.55)], '#c8c0b0', 2)
for x in (10.0, 11.7): circ(x, 13.55, .07, '#5a4a3a')
for x in (10.25, 10.8, 11.3): rect(x, 13.55, x + .32, 13.95, '#d8d2c2', '#0b0a10', 1)
circ(7.28, 14.35, .2, '#3a5234', '#0b0a10', 2)
# dietro la cripta: un albero morto con i corvi e una fossa nuova da cui escono zombie
circ(2.8, 12.95, .16, '#4a3b2e', '#0b0a10', 2)
for (dx, dy) in [(-.4, -.1), (.35, .15), (.1, -.38)]: line([(2.8, 12.95), (2.8 + dx, 12.95 + dy)], '#6a5644', 3)
rect(3.3, 13.0, 3.9, 13.55, '#0a0708', '#3a2a1a', 2); spawn(3.6, 13.28, .55, .55)
# striscia est: latrina (a volte uno zombie spalanca la porta), lanterna sul palo, buca, quercia morta, legna
rect(12.55, 14.5, 13.35, 15.45, '#5a4a3a', '#0b0a10', 3); text(12.95, 14.97, '☾', 12, '#d8cfa0', stroke=0)
spawn(12.4, 15.0, -.5, .3)
circ(12.8, 17.4, .12, '#ffcf6a', '#0b0a10', 2)
circ(13.0, 20.0, .2, '#0a0708', '#3a2a1a', 2); spawn(13.38, 19.75, -.45, -.1)
circ(13.1, 22.3, .55, '#2a2420', '#0b0a10', 2)
for (dx, dy) in [(-.45, -.2), (.4, .25), (0, -.5)]: line([(13.1, 22.3), (13.1 + dx, 22.3 + dy)], '#6a5644', 3)
rect(12.3, 18.7, 12.9, 19.15, '#7d5a38', '#0b0a10', 2)

# ---------------------------------------------------------------- AREA 2: Fattoria dei Corvi (16×12)
# spaventapasseri sui pali con i corvi
for (x, y) in [(4.4, 1.7), (11.3, 1.5)]:
    line([(x, y - .35), (x, y + .35)], '#8a6e4c', 4); line([(x - .3, y - .1), (x + .3, y - .1)], '#8a6e4c', 4); circ(x, y - .38, .12, '#c8b07a', '#0b0a10', 2)
    for dx in (-.32, .3): circ(x + dx, y - .2, .06, '#101014')
# mulino a vento sul poggio, nell'angolo a nord-est
circ(14.4, 1.8, .95, '#3a4430', None); circ(14.4, 1.8, .45, '#7a6a58', '#0b0a10', 3)
for (dx, dy) in [(1, 1), (1, -1)]:
    line([(14.4 - dx * 1.15, 1.8 - dy * 1.15), (14.4 + dx * 1.15, 1.8 + dy * 1.15)], '#c8b896', 5)
text(14.4, .45, 'Mulino', 12)
# staccionata tra il campo e l'aia, con il varco
line([(.15, 3.55), (7.3, 3.55)], FC, 4, dash=6); line([(8.7, 3.55), (15.85, 3.55)], FC, 4, dash=6)
# zombie che escono dal margine del granturco
spawn(2.6, 3.0, 0, .7); spawn(8.0, 2.95, 0, .9); spawn(12.4, 3.0, -.2, .7)
text(8.0, 1.2, 'Granturco', 17); text(8.0, 1.75, '(non ci si cammina: gli zombie escono dal bordo)', 11, '#d8cfc0', b=False)
# casa colonica col portico (si entra)
rect(.5, 4.3, 4.0, 7.6, '#6a4a3a', '#0b0a10', 3); line([(.5, 5.95), (4.0, 5.95)], '#4a3228', 3)
rect(4.0, 5.3, 4.8, 6.7, '#6e5236', '#0b0a10', 2)
text(2.25, 5.3, 'Casa colonica', 13); text(2.25, 6.6, '(si entra)', 11, '#d8cfc0', b=False)
for (x, y) in [(1.2, 4.3), (2.9, 4.3), (.5, 6.9)]: rect(x - .22, y - .06, x + .22, y + .06, '#c8a060')       # finestre con le assi
circ(4.4, 6.0, .11, '#ffcf6a', '#0b0a10', 2)
# pompa dell'acqua con l'abbeveratoio
circ(5.15, 7.5, .1, '#34363e'); rect(5.3, 7.35, 6.0, 7.65, '#54402c', '#0b0a10', 2)
# aia: pozzo con la carrucola, balle di fieno, zombie che girano (si vedono dal cancello)
circ(7.8, 6.6, .45, '#6a6d78', '#0b0a10', 3); circ(7.8, 6.6, .26, '#0b1a22'); line([(7.3, 6.6), (8.3, 6.6)], '#7d5a38', 4)
text(7.8, 7.4, 'Aia', 16); text(7.8, 5.8, 'Pozzo', 11, '#d8cfc0', b=False)
for (x, y) in [(10.3, 4.5), (10.3, 7.7)]: rect(x - .25, y - .2, x + .25, y + .2, '#a8944a', '#0b0a10', 2)
for (x, y) in [(6.0, 8.6), (9.3, 5.2), (8.9, 8.7)]:
    circ(x, y, .16, '#5a8a6a', '#0b0a10', 2); circ(x, y - .2, .1, '#5a8a6a', '#0b0a10', 2)
# fienile rosso (si entra), portone a ovest sull'aia, lanterna rossa sopra
rect(11.0, 4.0, 15.4, 8.2, '#7b2e26', '#0b0a10', 3); line([(13.2, 4.0), (13.2, 8.2)], '#4c5866', 4)
rect(10.85, 5.5, 11.15, 6.7, '#3a2a20', '#0b0a10', 2); circ(10.85, 5.3, .12, '#ff6a50', '#0b0a10', 2)
text(13.2, 5.6, 'Fienile', 16); text(13.2, 6.3, '(si entra)', 11, '#f0d8d0', b=False)
for (x, y) in [(12.0, 7.6), (14.6, 7.5), (14.6, 4.6)]: rect(x - .25, y - .2, x + .25, y + .2, '#a8944a', '#0b0a10', 1)
# rimessa con la mola (la gira il mulino con la cinghia: niente motori)
rect(13.4, 8.8, 15.6, 10.8, '#5a4a3a', '#0b0a10', 3); text(14.5, 9.8, 'Rimessa', 12)
line([(14.4, 2.3), (14.9, 8.8)], '#8a7a5a', 2, dash=4)
# orto delle zucche con i sacchi di terra del Becchino; la terra smossa da cui escono
for (x, y) in [(10.8, 9.3), (11.5, 11.2), (12.6, 10.4), (12.9, 11.4)]: circ(x, y, .16, '#d0702a', '#0b0a10', 2)
for (x, y) in [(12.7, 9.2), (13.0, 9.35)]: rect(x - .14, y - .12, x + .14, y + .12, '#8a7a5a', '#0b0a10', 1)
circ(11.6, 10.45, .22, '#2a2018', '#4a3a28', 2); spawn(11.6, 10.45, -.6, -.6)
text(11.8, 11.85, 'Orto delle zucche', 11)
# recinto dei maiali col fango, cuccia con la catena, pollaio
rect(.7, 8.4, 3.7, 10.6, None, FC, 3)
circ(2.2, 9.55, .3, '#1e1812', '#3a2a1a', 2); spawn(2.2, 9.55, .7, -.6)
rect(3.0, 8.6, 3.5, 8.8, '#54402c', '#0b0a10', 1)
text(2.2, 8.05, 'Maiali', 11)
rect(4.35, 10.15, 4.85, 10.6, '#6e5236', '#0b0a10', 2); line([(4.85, 10.4), (5.35, 10.0)], '#34363e', 2)
text(4.6, 11.0, 'Cuccia', 10)
rect(.4, 10.9, 1.9, 11.8, '#5a4a3a', '#0b0a10', 2); text(1.15, 11.35, 'Pollaio', 10)
# tettoia con il carretto del Becchino, i sacchi col teschio e la bara
rect(7.6, 10.1, 10.0, 11.5, '#4a3a2e', '#0b0a10', 3)
rect(7.9, 10.4, 9.2, 11.1, '#7d5a38', '#0b0a10', 2); rect(9.35, 10.35, 9.8, 11.25, '#2a1a14', '#9a7a3a', 2)
text(8.8, 9.75, 'Carretto e bara', 11)
# lanterna sul palo lungo la strada
circ(5.5, 11.35, .12, '#ffcf6a', '#0b0a10', 2)
# confine della fattoria dove non c'è l'area di partenza (staccionata rustica) e cosa c'è oltre i bordi
line([(0, 11.95), (2, 11.95)], FC, 4, dash=6); line([(14, 11.95), (16, 11.95)], FC, 4, dash=6)
# la vista dal cancello: si intravede l'aia
for (ex, ey) in [(4.2, 8.0), (9.6, 8.0)]: line([(6.45, 12.1), (ex, ey)], '#e0b040', 1, dash=3)

# ---------------------------------------------------------------- cornici, nomi delle aree, griglia, nord, scala
d.rectangle([X(0), Y(0), X(16), Y(12)], outline='#d8b86a', width=3 * K)
d.rectangle([X(2), Y(12.3), X(14), Y(24)], outline='#9fd0a8', width=3 * K)
line([(2.05, 14), (12, 14), (12, 23.95)], '#c8e0c0', 2, dash=5)
text(9.0, 23.62, 'qui dentro: l\'anteprima di adesso (10×10)', 11, '#c8e0c0', b=False)
text(13.0, 12.95, 'nuovo', 11, '#c8e0c0', b=False)
text(.2, -.55, 'AREA 2 · Fattoria dei Corvi (16×12 caselle) — si apre con le monete', 15, '#ffe28a', anchor='lm')
text(2.2, 24.55, 'AREA 1 · Camposanto e Casa (12×12 caselle) — si parte da qui', 15, '#9ff0c4', anchor='lm')
d.text((MX, 22 * K), 'Pianta della mappa zombie', font=f(28), fill='#f2ead8')
d.text((MX, 62 * K), 'vista dall\'alto · nord in alto · 1 quadretto = 1 casella (circa mezzo secondo di cammino)', font=f(14, False), fill='#c8c0b4')
# fuori dai bordi
text(8, -.2, '↑ il granturco continua oltre il bordo', 11, '#b8c8a8', b=False)
text(-.0, 6, '', 10)
text(15.0, 17.0, 'nebbia', 11, '#8890a8', b=False); text(1.0, 17.0, 'nebbia', 11, '#8890a8', b=False)

# ---------------------------------------------------------------- legenda
ly = MY + H_T * TS + 70 * K
def leg(i, x, y, sym, s1, s2=None):
    sx, sy = MX + x * K, ly + y * K
    sym(sx, sy)
    d.text((sx + 34 * K, sy - 12 * K), s1, font=f(15), fill='#f2ead8')
    if s2: d.text((sx + 34 * K, sy + 8 * K), s2, font=f(13, False), fill='#c8c0b4')
def s_spawn(sx, sy):
    d.ellipse([sx - 10 * K, sy - 10 * K, sx + 10 * K, sy + 10 * K], fill='#b8302a', outline='#2a0808', width=2 * K); d.text((sx, sy), 'Z', font=f(11), fill='#ffe8e0', anchor='mm')
def s_gate(sx, sy):
    d.line([(sx - 14 * K, sy), (sx + 14 * K, sy)], fill='#e0b040', width=8 * K)
def s_start(sx, sy):
    d.ellipse([sx - 12 * K, sy - 12 * K, sx + 12 * K, sy + 12 * K], fill='#3fb27a', outline='#0b0a10', width=3 * K); d.text((sx, sy), '★', font=f(12), fill='#eafff2', anchor='mm')
def s_lamp(sx, sy):
    d.ellipse([sx - 7 * K, sy - 7 * K, sx + 7 * K, sy + 7 * K], fill='#ffcf6a', outline='#0b0a10', width=2 * K)
def s_zomb(sx, sy):
    d.ellipse([sx - 8 * K, sy - 4 * K, sx + 8 * K, sy + 12 * K], fill='#5a8a6a', outline='#0b0a10', width=2 * K); d.ellipse([sx - 5 * K, sy - 14 * K, sx + 5 * K, sy - 4 * K], fill='#5a8a6a', outline='#0b0a10', width=2 * K)
def s_wall(sx, sy):
    d.line([(sx - 14 * K, sy), (sx + 14 * K, sy)], fill=WC, width=7 * K)
def s_fence(sx, sy):
    for i in range(3): d.line([(sx - 14 * K + i * 11 * K, sy), (sx - 7 * K + i * 11 * K, sy)], fill=FC, width=4 * K)
def s_view(sx, sy):
    for i in range(3): d.line([(sx - 14 * K + i * 11 * K, sy + 6 * K - i * 4 * K), (sx - 8 * K + i * 11 * K, sy + 4 * K - i * 4 * K)], fill='#e0b040', width=2 * K)
items = [
    (s_start, 'Partenza dell\'eroe', 'sul sentiero, come nell\'anteprima di adesso'),
    (s_gate, 'Cancello di ferro con catena e lucchetto', 'prezzo scritto col gesso: 750 monete (da regolare giocando); ti avvicini, tieni premuto, la catena cade'),
    (s_view, 'Dal cancello si intravede la fattoria', 'tra le sbarre e oltre il muro: fienile, spaventapasseri, mulino e zombie nell\'aia, velati dalla nebbia'),
    (s_spawn, 'Da dove escono gli zombie', 'buche, fosse, la latrina, il margine del granturco, il fango dei maiali, la terra smossa dell\'orto'),
    (s_zomb, 'Zombie che girano nell\'aia', 'si vedono già prima di aprire il cancello'),
    (s_wall, 'Muretti di pietra con la cancellata', 'il cimitero e il confine tra le due aree (si vede oltre)'),
    (s_fence, 'Staccionate e recinti di legno', ''),
    (s_lamp, 'Lanterne e lampioni a olio', 'mondo antico: lanterne, candele, mulino, pozzi, carretti; niente motori'),
]
for i, (sym, a, b) in enumerate(items):
    leg(i, 22, 18 + i * 62, sym, a, b)
ny = 18 + len(items) * 62 + 20
d.text((MX + 22 * K, ly + ny * K), 'Cosa c\'è di nuovo nell\'area di partenza', font=f(16), fill='#9ff0c4')
nov = ['Due caselle in più a nord: la strada di ciottoli prosegue dal bivio fino al cancello.',
       'Dietro la cripta: un albero morto con i corvi e una fossa nuova da cui escono zombie.',
       'Dietro la casa: catasta di legna col ceppo e l\'accetta, stendibiancheria con le lenzuola strappate.',
       'Due caselle in più a est: la latrina (a volte uno zombie spalanca la porta), una lanterna sul palo,',
       '   una buca, una quercia morta, una pila di legna.']
for i, s in enumerate(nov): d.text((MX + 22 * K, ly + (ny + 34 + i * 28) * K), s, font=f(13, False), fill='#d8cfc0')
ny2 = ny + 34 + len(nov) * 28 + 22
d.text((MX + 22 * K, ly + ny2 * K), 'La Fattoria dei Corvi', font=f(16), fill='#ffe28a')
fat = ['Granturco alto a nord (continua oltre il bordo) con due spaventapasseri sui pali e i corvi;',
       '   gli zombie ne escono dal margine, la staccionata ha un varco nel mezzo.',
       'Casa colonica con il portico e le finestre inchiodate (si entra, il tetto sparisce).',
       'Aia di terra battuta con il pozzo e la carrucola, balle di fieno, la pompa dell\'acqua.',
       'Fienile rosso con il portone sull\'aia e la lanterna rossa (si entra).',
       'Mulino a vento sul poggio: le pale girano e muovono la mola nella rimessa con una cinghia.',
       'Orto delle zucche con i sacchi di terra del Becchino; recinto dei maiali col fango; cuccia; pollaio.',
       'Tettoia con il carretto del Becchino, i sacchi col teschio e la bara, appena dopo il cancello.']
for i, s in enumerate(fat): d.text((MX + 22 * K, ly + (ny2 + 34 + i * 28) * K), s, font=f(13, False), fill='#d8cfc0')

img = img.resize((IW // K, IH // K), Image.LANCZOS)
img.save(OUT)
print(OUT, img.size)
