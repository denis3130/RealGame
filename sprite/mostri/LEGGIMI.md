# Nemici della modalità zombie (bozza, non ancora nel gioco)

`disegno_mostri.js` disegna i tre mostri con le funzioni del gioco (`ctx`, `ink`, `circ`, `ell`, `fs`, `glow`, `shadow`, `basis`, `INK`, `LOWFX`). Va eseguito dentro la funzione principale di `index.html`; espone `CR.zombie`, `CR.gonfio`, `CR.strisciante`, `CR.minatore`, `CR.hound`, `CR.becchino` con firma `(x, y, face, anim, p, sc)`, dove `p` va da 0 a 1 lungo la mossa.

- **Zombie della cripta** (`zombie`): mosse `idle`, `walk`, `attack` (graffio: braccia su, poi colpo in avanti).
- **Segugio infernale** (`hound`): mosse `idle`, `walk` (corsa), `attack` (si acquatta, salta, atterra).
- **Zombie gonfio** (`gonfio`): mosse `idle`, `walk`, `attack` (si gonfia, scoppia in una nube di gas verde, si sgonfia).
- **Zombie strisciante** (`strisciante`): mosse `idle`, `walk` (si trascina sulle braccia), `attack` (si alza e scatta in avanti).
- **Zombie minatore** (`minatore`): mosse `idle`, `walk`, `attack` (piccone sopra la testa, colpo a terra con scintille); la lampada del casco illumina il pavimento davanti.
- **Il Becchino** (`becchino`, boss): mosse `idle`, `walk`, `slam` (pala sopra la testa e colpo a terra con crepa verde), `summon` (alza il braccio, cerchio verde, mani di zombie che escono da terra).

Ogni parte del corpo sta in un piccolo spazio 3D (avanti, destra, su) e viene proiettata con l'angolo di direzione: i mostri girano a 360 gradi e ogni pezzo resta attaccato allo stesso punto. Occhi, bocca e dettagli si vedono solo dal lato giusto.

Fogli PNG: 8 righe (davanti, davanti-destra, destra, dietro-destra, dietro, dietro-sinistra, sinistra, davanti-sinistra) × un fotogramma per colonna; caselle 228 px (Becchino 340 px). Nessuna direzione è specchiata.
Da fare dopo l'ok di Denis: voci in `ET`, IA, danni, capitolo in cui compaiono, ingresso del boss.
