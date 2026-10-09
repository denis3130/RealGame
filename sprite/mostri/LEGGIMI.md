# Nemici zombie (bozza, non ancora nel gioco)

`disegno_mostri.js` disegna i tre mostri con le funzioni del gioco (`ctx`, `ink`, `circ`, `ell`, `fs`, `glow`, `shadow`, `basis`, `INK`, `LOWFX`). Va eseguito dentro la funzione principale di `index.html`; espone `CR.zombie`, `CR.hound`, `CR.becchino` con firma `(x, y, face, anim, p, sc)`, dove `p` va da 0 a 1 lungo la mossa.

- **Zombie della cripta** (`zombie`): mosse `idle`, `walk`, `attack` (graffio: braccia su, poi colpo in avanti).
- **Segugio infernale** (`hound`): mosse `idle`, `walk` (corsa), `attack` (si acquatta, salta, atterra).
- **Il Becchino** (`becchino`, boss): mosse `idle`, `walk`, `slam` (pala sopra la testa e colpo a terra con crepa verde), `summon` (alza il braccio, cerchio verde, mani di zombie che escono da terra).

Fogli PNG: 4 righe (davanti, tre quarti, lato, dietro) × un fotogramma per colonna; caselle 192 px (Becchino 300 px).
Da fare dopo l'ok di Denis: voci in `ET`, IA, danni, capitolo in cui compaiono, ingresso del boss.
