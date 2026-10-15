# I 4 boss nuovi del terzo giro (anteprima 48, nel gioco dal 15 ottobre)

Punto 5 del piano: un boss per arena; fino al 14 ottobre le arene 9–12 riusavano i custodi del secondo giro. Questi sono i quattro boss nuovi, uno per
mondo, disegnati con lo stesso metodo degli altri (modelli 3D in `sprite/nemici3d/boss3.js`, cassetta `C3`), nello stile della Classica:
forme tonde da giocattolo, colori pieni, occhi grandi con la luce, bocche semplici, niente sangue. Denis li ha visti nelle quattro direzioni
e con le mosse (pagina `python3 anteprime/mk_nemici3d.py --nuovi` → `anteprime/boss3.html`; fogli `node tests/boss3.js` →
`tests/nb_<boss>_dir.png` e `tests/nb_<boss>_mosse.png`) e il 14 ottobre ha detto sì: sono nel gioco (sotto, «Nel gioco»).

| Arena | Boss | Sagoma | Attacchi (come si leggono) | Cambio di fase | Sconfitta |
|---|---|---|---|---|---|
| 9 · Cripta delle Ombre | **Il Burattinaio d'Ombra** | mantello viola a campana che fluttua, cappuccio a punta col sonaglio, occhi gialli nel buio, due grandi guanti staccati con i fili d'oro | **Manate** (le mani salgono e battono a terra davanti: onda viola; avviso: le mani si alzano), **Fili** (un filo di luce tra le mani spazza l'arena: si salta col dash o ci si abbassa dietro un ostacolo), **Burattini** (tre ombre piccole escono da terra appese ai suoi fili), **Sipario** (sparisce in una pozza d'ombra e ricompare altrove) | mantello più scuro, bordi rosa, occhi arancioni, fiammelle viola sulle dita: fili più veloci | i fili si spezzano, le mani cadono e si sciolgono in fumo, il mantello si affloscia e svanisce, resta il cappuccio col sonaglio; gli occhi salgono come bolle e scoppiano |
| 10 · Forgia degli Dei | **La Fenice della Forgia** | uccello di fuoco tondo su zampette d'oro, testa grande, cresta di fiamme, ali di piume dal rosso all'oro, coda di tre piume lunghe | **Piume di fuoco** (ventaglio di piume: avviso le ali all'indietro), **Picchiata** (si alza e si tuffa in linea retta lasciando una scia di fuoco), **Vortice** (gira con le ali aperte: anello di fuoco che si allarga), **Pioggia di braci** (vola in alto, braci che cadono con l'ombra a terra) | **Rinascita** a metà vita: si chiude in una palla di fuoco, diventa un uovo di cenere, si spacca e rinasce con le fiamme azzurre (più veloce) | le fiamme si spengono, le piume diventano cenere, si chiude in un uovo che brilla, l'uovo si crepa e ne esce un pulcino che sbatte gli occhi |
| 11 · Palude Maledetta | **La Piovra della Palude** | piovra verde acqua seduta nell'acqua, mantello alto con le macchie chiare, una ninfea col fiore in testa, occhi grandi con le palpebre pesanti, sei tentacoli arricciati | **Tentacolata** (un tentacolo si alza arricciato e si abbatte davanti: schizzi), **Inchiostro** (si gonfia e sputa tre palle d'inchiostro che lasciano chiazze), **Gorgo** (gira coi tentacoli distesi: vortice nell'acqua che tira), **Immersione** (sparisce sott'acqua e riemerge altrove con uno spruzzo) | viola con le macchie magenta che brillano, occhi rossi | impallidisce, i tentacoli si arricciano come molle, gira e affonda, una nuvola d'inchiostro si apre e si schiarisce: resta solo la ninfea che galleggia col suo fiore |
| 12 · Vetta di Mossbound | **Il Cervo d'Aurora** (l'ultimo) | grande cervo bianco come la neve, muschio sulla schiena e criniera di muschio, fiorellini, occhi grandi e buoni, corna di cristallo di ghiaccio che brillano dei colori dell'aurora | **Carica** (abbassa la testa e raspa: poi galoppa dritto), **Cristalli** (testa all'indietro, poi lancia un ventaglio di schegge), **Aurora** (alza la testa: tende di luce che ondeggiano e scendono), **Zoccolata** (si impenna e batte gli zoccoli: anello di punte di ghiaccio) | corna che ardono, muschio che brilla pieno di fiori | si inginocchia, si sdraia, le corna si crepano e cadono come neve, sbocciano i fiori sul muschio, diventa la luce dell'aurora che sale: resta un cumulo di muschio con un fiore che brilla |

Entrate: il Burattinaio scende appeso ai suoi fili e fa l'inchino; la Fenice scende dal cielo dentro una colonna di fuoco e apre le ali;
la Piovra sale dall'acqua (prima la ninfea, poi gli occhi) e saluta con due tentacoli prima di fare la faccia arrabbiata; il Cervo salta
giù dall'alto e alza la testa mentre le corna si accendono punta dopo punta.

Musica (dopo il sì): carillon storto e archi pizzicati per il Burattinaio, tamburi di forgia e ottoni per la Fenice, marimba e bolle per
la Piovra, coro e campane di ghiaccio per il Cervo, sullo stesso schema delle musiche dei boss (punto 51).

## Nel gioco (15 ottobre)

Denis, il 14 ottobre dopo la terza richiesta: «ok perfetto riporta tutto sul gioco». Le arene 9–12 hanno i loro custodi (`ARENAS[i].bt`); l'Abisso e la
sfida del giorno tengono i boss di prima.

- **Collegamenti** (`src/js/81-boss3-base.js`): vita, danno, nome e titolo (`ET`); la stanza resta quella del mondo, con un cerchio di rune
  suo (`B3V`, `RUNEC`: Teatro delle Ombre, Nido della Fenice, Stagno della Piovra con la pozza, Prato dell'Aurora). L'entrata e la sconfitta
  le recitano i modelli (mosse `enter` e `die`, col loro tempo). Poi la barra che si rompe a modo suo (`BBFX`), alone, aura e anello di
  carica (`B2`), la musica e l'accordo di vittoria (`BMS`), le anteprime e la schermata di sblocco col custode nuovo, la guida, quattro
  traguardi (30–50 cristalli). Il giro d'anello generico delle arene alte (`bossExtra`) è spento per loro: hanno i loro schemi.
- **Pericoli nuovi**: il filo d'oro che attraversa la stanza (si passa con lo scatto o dietro un ostacolo), le tende d'aurora, le palle
  d'inchiostro con le chiazze che rallentano, i proiettili (sfere d'ombra, piume di fuoco anche azzurre, gocce d'inchiostro, cristalli),
  gli avvisi a terra (cerchi e strisce). Il burattino d'ombra è un nemico nuovo, in 3D come gli altri (`N3.puppet` in
  `sprite/nemici3d/boss3.js`), uguale ai burattini della mossa del Burattinaio.
- **Mosse**: ogni stato del boss ha il nome di una mossa del modello, il colpo vero parte nel suo fotogramma (`b3at`). I file:
  `82-burattinaio.js`, `83-fenice.js` (la rinascita a metà vita: uovo che non si può colpire, poi fiamme azzurre), `84-piovra.js`,
  `85-cervo.js`. Musiche in `86-musiche-boss3.js`.

| Boss | Vita (×arena) | Danno di contatto | Mosse |
|---|---|---|---|
| Burattinaio d'Ombra | 6.000 | 22 | Manate (onda), Fili, Burattini (2, 3 nella fase 2; al massimo 4; 14 s di vita), Sipario |
| Fenice della Forgia | 6.600 | 24 | Piume (7, 9 azzurre), Picchiata (striscia di fuoco), Vortice, Pioggia di braci; Rinascita a metà vita |
| Piovra della Palude | 7.000 | 24 | Tentacolata (doppia nella fase 2), Inchiostro (3, 5), Gorgo che tira, Immersione |
| Cervo d'Aurora | 7.600 | 22 | Carica (doppia nella fase 2), Cristalli, Aurora (3, 4 tende), Zoccolata |

Misure:
- **Disegno**: ogni modello costa da 0,6 a 1,2 ms a fotogramma (i boss di prima da 0,4 a 0,8), misurato pulendo la tela a ogni
  fotogramma come fa il gioco. La stanza intera col boss: da 2,5 a 4,7 ms sul computer di prova.
- **Difficoltà**: con l'eroe fermo che tira, come nelle misure della FASE 2 (caso peggiore, livello 6, arco al livello 3), vite perse al
  minuto: Burattinaio 6, Fenice 9,3, Piovra 8, Cervo 10,6. I custodi di prima nelle stesse arene: Strega 4,6, Fabbro 32, Idra 10,
  Regina 5,5. Prima i burattini facevano da scudo e il 96% del danno del Burattinaio era il loro contatto: ora meno vita, meno danno,
  più lenti, meno insieme. Da regolare giocando.
- **Volume delle musiche**: da −25 a −27 dB come i temi dei boss di prima.

Prove: `node tests/boss3gioco.js [arena]` (entrata, lotta, tutte le mosse, fase 2, sconfitta, stanza ripulita, tempi di disegno; foto
`tests/b3g_<boss>_*.png`); `node tests/boss3mosse.js [boss]` (ogni mossa in tre momenti: `tests/b3m_<boss>.png`); `node tests/anteprime.js`
(miniature e sblocco delle arene).

Collaudo (15 ottobre), tutto passato senza errori: `boss3gioco.js` (tutte le mosse dei 4 boss, fase 2, sconfitta); una partita automatica
per ognuna delle arene 9–12 (vittoria sul custode nuovo alla stanza 10) e una per capitolo (Golem, Re Rospo, Yeti, Strega); `zombie.js`,
`avvio.js`, `meta2.js`, `menu2.js`, `menu3.js` (foto guardate), `salvataggio.js`, `bossdie.js` (le morti dei boss di prima non cambiano),
`audio.js`, `mig.js`. Poi ripubblicati il gioco su claude.ai e l'app.
