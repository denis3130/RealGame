"""Pacchetto degli sprite della lotta nel bosco di notte: le due volpi di fuoco in lotta, tutto il bosco (alberi, sassi, piante,
cose a terra, terreno, luna e luci, particelle), gli effetti delle mosse, i livelli della scena di lotta 2D, l'atlante, il registro
con i dati di ogni sprite (JSON e CSV) e le anteprime (fogli ingranditi, volpi animate in GIF, foto della scena 3D).

Uso: python3 sprite/niumon/pacchetto_lotta.py <cartella_di_uscita> [foto.png ...]
  -> <cartella_di_uscita>/niumon_lotta_bosco_notte.zip
Le foto in più (per esempio della pagina 3D) vanno nella cartella previews/ col loro nome.
Prima rifare gli sprite se sono cambiati: ambiente/bosco_notte/fai.py, effetti/fuoco/effetti.py fai,
ambiente/scena_lotta_2d/esporta.py, volpe_fuoco/disegno2d/lotta80.py."""
import os, sys, json, csv, io, shutil, zipfile, tempfile
from PIL import Image, ImageDraw

N = os.path.dirname(os.path.abspath(__file__))
RADICE = 'niumon_lotta_bosco_notte'
VERSIONE = '0.1'
BOSCO360 = 'https://claude.ai/artifact/DkjGkNBHoUGK8EVVscxr2c'
LOTTA2D = 'https://claude.ai/artifact/YDzxScVHMophiGdL2Bi4r8'
NOTTE = (34, 44, 52, 255)

# descrizioni corte, una per sprite
DESCR = {
    'albero_spoglio_1': 'albero spoglio con la chioma larga e il tronco dritto',
    'albero_spoglio_2': 'albero spoglio alto e sottile, rami aperti in cima',
    'albero_spoglio_3': 'albero spoglio col tronco curvo, chioma larga, muschio alla base',
    'albero_spoglio_4': 'albero spoglio alto e storto, inclinato',
    'albero_storto_grande': 'albero grande col tronco doppio attorcigliato, chioma fitta, muschio alla base',
    'alberello_secco': 'alberello secco piccolo, per riempire',
    'sasso_grande': 'sasso grande sfaccettato col muschio', 'sasso_medio': 'sasso medio sfaccettato',
    'sasso_piccolo': 'sasso piccolo', 'sasso_piatto': 'sasso piatto e basso',
    'ceppo': 'ceppo tagliato con gli anelli e il muschio',
    'erba_1': 'ciuffo d\'erba', 'erba_2': 'ciuffo d\'erba largo', 'erba_3': 'ciuffo d\'erba piccolo',
    'felce_1': 'felce', 'felce_2': 'felce piccola',
    'funghi_1': 'funghi che brillano di azzurro (tre)', 'funghi_2': 'funghi che brillano di azzurro (due)',
    'cespuglio_secco': 'cespuglio secco di rametti',
    'radici_1': 'radici stese a terra ai piedi di un albero', 'radici_2': 'radici stese a terra, più corte',
    'foglie_secche': 'foglie secche sparse a terra',
    'terra': 'terra scura con chiazze di muschio, sassolini, rametti e foglie',
    'radura': 'radura di pietre piatte chiare tra la terra battuta (il centro della lotta)',
    'muschio': 'tappeto di muschio con poca terra',
    'luna': 'la luna piena coi crateri',
    'alone_luna': 'alone morbido chiaro (intorno alla luna, ai funghi e alle lucciole)',
    'nebbia': 'banco di nebbia bassa che scorre', 'raggio_di_luna': 'raggio di luna che scende tra gli alberi',
    'luce_fuoco': 'luce calda del fuoco a terra e intorno alle volpi', 'ombra': 'ombra morbida sotto le creature',
    'lucciola': 'lucciola che si accende e si spegne', 'cenere': 'fiocco di cenere che scende girando',
    'brace': 'brace che nasce gialla e si spegne rossa',
    'palla_di_fuoco': 'palla di fuoco che vola (mossa Braci)',
    'fiammata': 'sbuffo di fiamma che si gonfia e diventa fumo (il getto della Fiammata, le fiamme della Coda ardente)',
    'esplosione': 'anello di fuoco che esplode (mossa Coda ardente)', 'graffio': 'tre graffi di fuoco (mossa Graffio)',
    'scintilla': 'scintilla dove arriva il colpo',
    'cielo_e_bosco_lontano': 'cielo di notte, luna e bosco lontano nella nebbia (livello in fondo)',
    'alberi_di_mezzo': 'alberi scuri a metà strada (livello di mezzo)',
    'terra_2d': 'il suolo della radura con sassi, erba e rametti (livello del terreno)',
    'primo_piano': 'tronchi scuri e sfocati davanti, ai bordi (livello davanti)',
    'nebbia_che_scorre': 'striscia di nebbia che si ripete in orizzontale e scorre',
}

def leggi(p):
    return json.load(open(p, encoding='utf-8'))

def raccogli():
    """[(percorso nel pacchetto senza estensione, file png sorgente, meta, usato_in)]"""
    out = []
    V = os.path.join(N, 'volpe_fuoco', 'solo2d')
    for nome in ('lotta_davanti', 'lotta_spalle'):
        m = leggi(os.path.join(V, nome + '.json')); m['nome'] = nome
        m['descrizione'] = ('la volpe di fuoco vista davanti (l\'avversario): fermo, battito degli occhi, attacco, colpito'
                            if nome == 'lotta_davanti' else 'la volpe di fuoco vista di spalle (la tua): fermo, attacco, colpito')
        out.append(('creatures/volpe_fuoco/battle/' + nome, os.path.join(V, nome + '.png'), m, ['bosco 360°', 'lotta 2D']))
    B = os.path.join(N, 'ambiente', 'bosco_notte')
    for m in leggi(os.path.join(B, 'bosco_notte.json'))['sprite']:
        c = m['cartella']
        dove = {'alberi': 'objects/world/bosco_notte/alberi', 'rocce': 'objects/world/bosco_notte/rocce',
                'piante': 'objects/world/bosco_notte/piante', 'a_terra': 'objects/world/bosco_notte/a_terra',
                'terreno': 'tilesets/bosco_notte', 'luce': 'vfx/world/bosco_notte/luce',
                'particelle': 'vfx/world/bosco_notte/particelle'}[c]
        out.append((dove + '/' + m['nome'], os.path.join(B, m['file']), dict(m), ['bosco 360°']))
    F = os.path.join(N, 'effetti', 'fuoco')
    for m in leggi(os.path.join(F, 'effetti_fuoco.json'))['sprite']:
        out.append(('vfx/battle/fuoco/' + m['nome'], os.path.join(F, m['file']), dict(m), ['bosco 360°']))
    S = os.path.join(N, 'ambiente', 'scena_lotta_2d')
    for m in leggi(os.path.join(S, 'scena_lotta_2d.json'))['sprite']:
        m = dict(m)
        out.append(('backgrounds/battle/bosco_notte_2d/' + m['nome'], os.path.join(S, m['file']), m, ['lotta 2D']))
    for _, _, m, _ in out:
        k = m['nome'] + ('_2d' if m.get('category') == 'background_battle' and m['nome'] == 'terra' else '')
        m['descrizione'] = DESCR.get(k, m.get('descrizione', ''))
    return out

# ----------------------------------------------------------------------------------------------- anteprime
def scritta(d, xy, testo, col=(230, 236, 240, 255)):
    d.text(xy, testo, fill=col)

def gif_volpe(png, meta, sc=3):
    """la volpe animata: fermo, (battito), attacco, fermo, colpito, fermo; sfondo di notte, il nome dell'animazione in alto"""
    im = Image.open(png).convert('RGBA'); fw, fh = meta['frame_width'], meta['frame_height']; A = meta['animazioni']
    def fot(riga, i):
        f = im.crop((i * fw, riga * fh, (i + 1) * fw, (riga + 1) * fh)).resize((fw * sc, fh * sc), Image.NEAREST)
        c = Image.new('RGBA', f.size, NOTTE); c.alpha_composite(f); return c
    seq = []
    def anim(nome, etichetta, giri=1, battito=False):
        a = A[nome]
        for g in range(giri):
            for i in range(a['n']):
                if battito and g == giri - 1 and i == 4 and 'fermo_occhi_mezzi' in A:
                    for r, ms in ((A['fermo_occhi_mezzi']['riga'], 60), (A['fermo_occhi_chiusi']['riga'], 100),
                                  (A['fermo_occhi_mezzi']['riga'], 60)):
                        seq.append((fot(r, i), ms, etichetta))
                seq.append((fot(a['riga'], i), int(1000 / a['fps']), etichetta))
    anim('fermo', 'fermo', 2, battito=True); anim('attacco', 'attacco'); anim('fermo', 'fermo'); anim('colpito', 'colpito')
    anim('fermo', 'fermo', 2)
    frames = []
    for f, ms, et in seq:
        d = ImageDraw.Draw(f); scritta(d, (8, 6), et, (170, 186, 196, 255)); frames.append(f.convert('RGB'))
    buf = io.BytesIO()
    frames[0].save(buf, 'GIF', save_all=True, append_images=frames[1:], duration=[ms for _, ms, _ in seq], loop=0, optimize=False)
    return buf.getvalue()

def fogli_volpe(voci, sc=2):
    """i due fogli delle volpi ingranditi, col nome di ogni riga"""
    blocchi = []
    for pkg, png, m, _ in voci:
        im = Image.open(png).convert('RGBA'); A = m['animazioni']
        righe = sorted(A.items(), key=lambda kv: kv[1]['riga'])
        blocchi.append((m['nome'], im, righe, m['frame_height']))
    L = 150; W = L + max(b[1].size[0] for b in blocchi) * sc + 16
    H = sum(24 + b[1].size[1] * sc + 16 for b in blocchi) + 8
    c = Image.new('RGBA', (W, H), NOTTE); d = ImageDraw.Draw(c); y = 8
    for nome, im, righe, fh in blocchi:
        scritta(d, (16, y + 4), nome + '.png'); y += 24
        c.alpha_composite(im.resize((im.size[0] * sc, im.size[1] * sc), Image.NEAREST), (L, y))
        for k, a in righe:
            scritta(d, (16, y + a['riga'] * fh * sc + fh * sc // 2 - 12), k, (170, 186, 196, 255))
            scritta(d, (16, y + a['riga'] * fh * sc + fh * sc // 2 + 2), '%d fot. %d fps' % (a['n'], a['fps']), (120, 136, 146, 255))
        y += im.size[1] * sc + 16
    return c

def foglio_effetti(voci, sc=6):
    righe = []
    for pkg, png, m, _ in voci:
        righe.append((m, Image.open(png).convert('RGBA')))
    W = max(im.size[0] * sc + 4 * m['frames'] for m, im in righe) + 32
    H = sum(im.size[1] * sc + 34 for m, im in righe) + 8
    c = Image.new('RGBA', (W, H), NOTTE); d = ImageDraw.Draw(c); y = 8
    for m, im in righe:
        scritta(d, (16, y), '%s  (%d fotogrammi %dx%d, %d fps)' % (m['nome'], m['frames'], m['frame_width'], m['frame_height'], m['fps']))
        y += 18; fw = m['frame_width']
        for i in range(m['frames']):
            f = im.crop((i * fw, 0, (i + 1) * fw, m['frame_height'])).resize((fw * sc, m['frame_height'] * sc), Image.NEAREST)
            c.alpha_composite(f, (16 + i * (fw * sc + 4), y))
        y += m['frame_height'] * sc + 16
    return c

def scacchi(w, h, q=16):
    c = Image.new('RGBA', (w, h), (58, 62, 70, 255)); d = ImageDraw.Draw(c)
    for y in range(0, h, q):
        for x in range(0, w, q):
            if (x // q + y // q) % 2: d.rectangle((x, y, x + q - 1, y + q - 1), fill=(74, 78, 86, 255))
    return c

def livelli_2d(voci):
    """i livelli della scena 2D uno per uno (sulla scacchiera = trasparente) e poi tutti insieme"""
    ims = {m['nome']: Image.open(png).convert('RGBA') for _, png, m, _ in voci}
    tw, th = 640, 360
    ordine = ['cielo_e_bosco_lontano', 'alberi_di_mezzo', 'terra', 'primo_piano', 'nebbia_che_scorre']
    comp = ims['cielo_e_bosco_lontano'].copy()
    for n in ordine[1:4]: comp.alpha_composite(ims[n])
    neb = ims['nebbia_che_scorre']
    for x in range(0, comp.size[0], neb.size[0]): comp.alpha_composite(neb, (x, 470))
    tiles = []
    for n in ordine:
        im = ims[n]
        if n == 'nebbia_che_scorre':
            t = scacchi(tw, th); s = im.resize((im.size[0] * 5 // 4, im.size[1] * 5 // 4), Image.NEAREST)
            for x in range(-40, tw, s.size[0]): t.alpha_composite(s, (x, th // 2 - s.size[1] // 2))
        else:
            t = scacchi(tw, th); t.alpha_composite(im.resize((tw, th), Image.NEAREST))
        tiles.append((n + '.png', t))
    tiles.append(('tutti insieme', comp.resize((tw, th), Image.NEAREST)))
    c = Image.new('RGBA', (tw * 2 + 48, (th + 30) * 3 + 16), NOTTE); d = ImageDraw.Draw(c)
    for i, (et, t) in enumerate(tiles):
        x = 16 + (i % 2) * (tw + 16); y = 8 + (i // 2) * (th + 30)
        scritta(d, (x, y + 4), et); c.paste(t, (x, y + 22))
    return c

# ----------------------------------------------------------------------------------------------- pacchetto
LEGGIMI = """# Niumon · sprite della lotta nel bosco di notte

Versione {ver} (14 ottobre 2026). PNG con lo sfondo trasparente, e accanto a ognuno il suo `.json` con i dati. Volpi, bosco ed
effetti sono pixel art; le luci morbide (alone, nebbia, raggio di luna, luce del fuoco, ombra) e i livelli della scena 2D sono
sfumati. Stato di tutto: **da approvare** (niente è nel gioco finché non lo approvi).

Vederli in movimento: Bosco 360° {b360} · Lotta 2D {l2d}

## Cosa c'è

| cartella | cosa | quanti |
|---|---|---|
| `creatures/volpe_fuoco/battle/` | la volpe di fuoco in lotta: davanti (l'avversario) e di spalle (la tua), un'animazione per riga | {n_volpe} fogli |
| `objects/world/bosco_notte/` | alberi, sassi e ceppo, piante, cose stese a terra (radici, foglie) | {n_ogg} |
| `tilesets/bosco_notte/` | terreno 64×64 che si ripete senza cuciture: terra, radura, muschio | {n_ter} |
| `vfx/world/bosco_notte/` | la luna e le luci morbide; le particelle (lucciola, cenere, brace) | {n_vw} |
| `vfx/battle/fuoco/` | effetti delle mosse: palla di fuoco, fiammata, esplosione, graffio, scintilla | {n_vb} |
| `backgrounds/battle/bosco_notte_2d/` | i livelli della scena di lotta 2D, 1280×720 (cielo, alberi di mezzo, terra, primo piano) e la nebbia | {n_bg} |
| `atlases/bosco_notte/` | gli sprite del bosco in un'immagine sola, con il rettangolo di ognuno (`atlante.json`) | 1 |
| `metadata/` | `registro.json` e `registro.csv`: una riga per sprite, con il percorso nel pacchetto | {n_tot} sprite |
| `previews/` | fogli ingranditi, le volpi animate (GIF), le foto della scena 3D | |

## Come si leggono i dati

- `frame_width`, `frame_height`: la misura di un fotogramma. I fotogrammi stanno in fila da sinistra a destra (`frames`, `fps`,
  `loop`). Nelle volpi ogni riga è un'animazione: `animazioni` dice riga, fotogrammi, fps e se si ripete.
- `pivot`: il punto del fotogramma che tocca terra (o il centro, per luci ed effetti), in pixel.
- `unita_per_pixel`: quanto è grande un pixel nel mondo 3D. La volpe 1/50 (96 px = 1,9 unità), gli alberi 1/26, sassi e
  piante 1/40, terreno e cose a terra 1/32.
- `billboard`: `true` = sta in piedi e guarda sempre la telecamera; `false` = steso a terra, visto dall'alto.
- `blend`: `normale` (pixel art coi bordi netti), `alfa` (velo morbido: nebbia, ombra), `somma` (luce che si somma alla scena).
- `punti` (volpi): `bocca`, `corpo`, `braci`, cioè da dove partono fiammate, bagliore e scintille.
- `brilla` (funghi): il colore della loro luce.
- Nella scena di lotta la tua volpe si disegna a pixel grossi (3×) e l'avversario a 1× (`scala_consigliata`).

## Da dove vengono

Sono disegnati col codice (si rifanno uguali), tranne le volpi che vengono dal tuo disegno:
- volpi: `sprite/niumon/volpe_fuoco/disegno2d/lotta80.py`
- bosco: `sprite/niumon/ambiente/bosco_notte/fai.py`
- effetti: `sprite/niumon/effetti/fuoco/effetti.py fai`
- livelli 2D: `sprite/niumon/ambiente/scena_lotta_2d/esporta.py` (li prende dalla pagina della lotta 2D)
- questo pacchetto: `sprite/niumon/pacchetto_lotta.py`
"""

def main(uscita, foto):
    voci = raccogli()
    tmp = tempfile.mkdtemp(); R = os.path.join(tmp, RADICE)
    registro = []
    for pkg, png, m, usato in voci:
        dst = os.path.join(R, pkg + '.png'); os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(png, dst)
        im = Image.open(png)
        m = dict(m); m['file'] = pkg + '.png'
        m.setdefault('frames', sum(a['n'] for a in m['animazioni'].values()) if 'animazioni' in m else 1)
        json.dump(m, open(os.path.join(R, pkg + '.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        voce = dict(asset_id=m['asset_id'], nome=m['nome'], descrizione=m.get('descrizione', ''), category=m.get('category', ''),
                    file=pkg + '.png', larghezza_png=im.size[0], altezza_png=im.size[1],
                    frame_width=m.get('frame_width', im.size[0]), frame_height=m.get('frame_height', im.size[1]),
                    frames=m['frames'], fps=m.get('fps', 0), loop=m.get('loop', False), pivot=m.get('pivot'),
                    unita_per_pixel=m.get('unita_per_pixel'), billboard=m.get('billboard'), blend=m.get('blend', 'normale'),
                    usato_in=usato, status=m.get('status', ''), version=m.get('version', ''), source=m.get('source', ''))
        if 'animazioni' in m:          # un foglio con più animazioni: fps e loop sono di ogni riga
            voce['animazioni'] = {k: dict(riga=a['riga'], n=a['n'], fps=a['fps'], loop=a['loop']) for k, a in m['animazioni'].items()}
            voce['fps'] = voce['loop'] = None
        registro.append(voce)
    # atlante del bosco
    B = os.path.join(N, 'ambiente', 'bosco_notte'); A = os.path.join(R, 'atlases', 'bosco_notte'); os.makedirs(A)
    shutil.copyfile(os.path.join(B, 'atlante.png'), os.path.join(A, 'atlante.png'))
    shutil.copyfile(os.path.join(B, 'atlante.json'), os.path.join(A, 'atlante.json'))
    # registro
    M = os.path.join(R, 'metadata'); os.makedirs(M)
    json.dump(dict(nome='sprite della lotta nel bosco di notte', versione=VERSIONE, data='2026-10-14', sprite=registro),
              open(os.path.join(M, 'registro.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    with open(os.path.join(M, 'registro.csv'), 'w', encoding='utf-8-sig', newline='') as f:      # con la firma: Excel legge gli accenti
        w = csv.writer(f, delimiter=';')
        w.writerow(['asset_id', 'file', 'categoria', 'descrizione', 'fotogramma', 'fotogrammi', 'fps', 'usato_in', 'stato'])
        for v in registro:
            fps = '/'.join(str(x) for x in sorted({a['fps'] for a in v['animazioni'].values()})) if 'animazioni' in v else v['fps']
            w.writerow([v['asset_id'], v['file'], v['category'], v['descrizione'], '%dx%d' % (v['frame_width'], v['frame_height']),
                        v['frames'], fps, ', '.join(v['usato_in']), v['status']])
    # anteprime
    P = os.path.join(R, 'previews'); os.makedirs(P)
    shutil.copyfile(os.path.join(B, 'foglio_di_controllo.png'), os.path.join(P, 'bosco_notte_tutti.png'))
    volpi = [v for v in voci if v[0].startswith('creatures/')]
    fogli_volpe(volpi).save(os.path.join(P, 'volpe_lotta_fogli.png'))
    for pkg, png, m, _ in volpi:
        open(os.path.join(P, 'volpe_' + m['nome'].replace('lotta_', '') + '.gif'), 'wb').write(gif_volpe(png, m))
    foglio_effetti([v for v in voci if v[0].startswith('vfx/battle/')]).save(os.path.join(P, 'effetti_fuoco.png'))
    livelli_2d([v for v in voci if v[0].startswith('backgrounds/')]).save(os.path.join(P, 'scena_2d_livelli.png'))
    for f in foto: shutil.copyfile(f, os.path.join(P, os.path.basename(f)))
    # leggimi
    conta = lambda pre: sum(1 for v in voci if v[0].startswith(pre))
    open(os.path.join(R, 'LEGGIMI.md'), 'w', encoding='utf-8').write(LEGGIMI.format(
        ver=VERSIONE, b360=BOSCO360, l2d=LOTTA2D, n_volpe=conta('creatures/'), n_ogg=conta('objects/'), n_ter=conta('tilesets/'),
        n_vw=conta('vfx/world/'), n_vb=conta('vfx/battle/'), n_bg=conta('backgrounds/'), n_tot=len(voci)))
    # zip
    os.makedirs(uscita, exist_ok=True); zp = os.path.join(uscita, RADICE + '.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for dp, dn, fn in os.walk(R):
            dn.sort()
            for f in sorted(fn):
                p = os.path.join(dp, f); z.write(p, os.path.relpath(p, tmp))
    shutil.rmtree(tmp)
    print(zp, '%d sprite, %d KB' % (len(voci), os.path.getsize(zp) // 1024))

if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2:])
