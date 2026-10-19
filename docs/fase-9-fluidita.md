# FASE 9 · Più fluido sul telefono

Richiesta di Denis (19 ottobre): «vai, lascia perdere l'intro ecc» → la FASE 9 subito, senza toccare intro, prologo e filmati. Obiettivo:
il gioco più fluido sul suo iPhone **senza cambiare l'aspetto**.

## Come si misura

- Un telefono finto come quello di Denis: Chromium di Playwright, 390×844 punti, 3 pixel a punto (`deviceScaleFactor:3`, `isMobile:false`,
  perché la pagina non ha il meta viewport e con `isMobile` il browser la impagina a 980).
- Il tempo vero di un fotogramma: `render()` più il disegno sulla tela, forzato a finire con la lettura di un pixel
  (`ctx.getImageData(0,0,1,1)`); senza quella lettura si misura solo il JavaScript.
- Questo computer non ha scheda grafica e ha 2 processori condivisi: i numeri assoluti ballano del ±15% e sono 3–4 volte quelli di un
  iPhone; contano i confronti, fatti alternando le due versioni nella stessa pagina e prendendo le mediane.
- Sul telefono il disegno lo fa un processo a parte (il «GPU process» di WebKit, con CoreGraphics), in parallelo al JavaScript: conta il
  più lento dei due. Qui il disegno era l'80% del fotogramma.

## Dove andava il tempo (prima)

Stanza 7 dell'arena 3, 8 nemici: 70 ms a fotogramma, di cui 60 di disegno. Le copie *scalate* di immagini sono la parte più cara: la
tela era 780×1688 (2 pixel a punto del telefono, cioè 2,17 pixel a punto del mondo) e il pavimento, i muri e il paesaggio fuori
dall'arena, preparati a 2×, venivano ricampionati a ogni fotogramma; in più la vignetta, la mappa delle luci (un pixel ogni 3 punti
allargato 6 volte), le nebbie, le luci morbide grandi (un'immagine 64×64 allargata fino a 760×600) e le colonne di luce in sfumatura.
Copiare un'immagine 1:1 su pixel interi costa 5–7 volte meno che copiarla scalata.

## Cosa è cambiato (nessuna differenza visibile: `tests/fluido.js` lo controlla)

1. **Tela a 2 pixel a punto esatti** (`resize` in `src/js/45-render.js`): su un telefono (tra 1,75 e 2,75 pixel a punto) la tela è
   larga 720 (non 780) e la telecamera e le scosse stanno su pixel interi: pavimento, muri e paesaggio si copiano 1:1. Il browser stira
   la tela sullo schermo come prima. La tela non si rifà se ha già la misura giusta.
2. **Qualità «Automatica»** (`RESCUT` nel `loop`): se i fotogrammi restano sotto i 60 al secondo per 2 s, la tela passa a 1,5 pixel a
   punto (poco più di metà dei pixel; la mappa zombie fa già lo stesso); solo se non basta si spengono gli effetti (`LOWFX`), come prima.
   «Alta» e «Bassa» la rimettono com'era.
3. **Luci morbide grandi copiate 1:1** (`glowFast` in `18`): una luce che tiene la stessa misura da un fotogramma all'altro (torce,
   nebbie, pulsazioni delle arene, pozze di luce…) si disegna una volta alla sua misura e poi si copia; quelle che crescono o si
   girano, come prima. Al massimo 3 milioni di pixel, le luci non usate da 90 fotogrammi si buttano (`glowTick`).
4. **Vignetta** (`drawVig` in `45`): preparata una volta alla misura della tela e copiata a bande, saltando il centro trasparente.
5. **Mappa delle luci** (`lwFill`, `lightBlit` in `18`): la piccola mappa si allarga una volta sola a un pixel per punto (solo la parte
   sullo schermo) e si copia con ogni pixel raddoppiato: la differenza è al massimo mezzo punto della sua pendenza (1–2 gradini su 255).
6. **Ombre degli ostacoli fermi** (`shadowSprite` in `47`): le tre ombre in un'immagine sola; **sprite degli ostacoli** copiati 1:1.
7. **Colonne di luce** delle torce e delle arene, e la fascia fredda (`stripFast` in `18`): disegnate una volta a piena luce e copiate a
   bande che seguono la pendenza, con la luce come trasparenza.
8. **HUD**: le scritte e le barre si toccano solo quando cambiano (`hudSet`; prima a ogni fotogramma).
9. **Pausa** (scelta dell'abilità, rinascita, fine): la stanza si disegna una volta e resta sotto la schermata (con lo sfocato dietro),
   invece di ridisegnarla a ogni fotogramma.
10. **Stanza nuova**: il nero resta tre fotogrammi in più (circa 50 ms), così il primo disegno della stanza (immagini copiate la prima
    volta, luci e ombre preparate) cade nel buio e non nella dissolvenza.

11. **Menu, schermata principale** (la cripta della Classica e il falò della Zombie): stessa cura. La tela della scena a 2 pixel a punto
    esatti e la scena su pixel interi (`campResize`, `oy`/`ox` arrotondati in `drawCamp` e `campFrame`), così lo sfondo e il recinto del
    falò, preparati a 2×, si copiano 1:1; la mappa delle luci a un pixel per punto (`campLightBlit` in 40); la vignetta preparata una
    volta (`campVigDraw`, fatta solo quando la scena è ferma da tre fotogrammi: mentre il menu entra si muove); i fotogrammi del menu
    contano per le luci morbide (`glowTick` intorno a `drawCamp`, in 67). La cripta da 41 a 21 ms qui, il falò da 55 a 41 (resta il
    disegno dell'eroe seduto, degli oggetti e degli zombie sul sentiero). Le altre schede del menu andavano già a 60 al secondo.

12. **Mappa zombie**: la vignetta (una sfumatura su tutto lo schermo a ogni fotogramma) preparata una volta e copiata a bande (`zVig` in
    `anteprime/zombie/motore.js`), e i fotogrammi della mappa contano per le luci morbide. Il resto della mappa zombie è il disegno delle
    case, degli oggetti e degli zombie in 3D (`w.voci`, ~40 ms qui a 1,5 pixel a punto): da guardare a parte, con Denis, perché lì la
    «piega» degli oggetti alti cambia a ogni passo della telecamera e non si può copiare senza toccare l'aspetto.

## Risultati (questo computer, un fotogramma con il disegno)

| scena | prima | dopo |
|---|---|---|
| arena 3, stanza 7 (8 nemici) | 70–84 ms | 44–59 ms |
| arena 1, stanza 3 (5 nemici, colonne di luce) | 78–82 ms | 44–53 ms |
| arena 12, stanza 7 (8 nemici, sole) | 77 ms | 48 ms |
| boss dell'arena 4 | 78–86 ms | 41–45 ms |

Circa il 35–45% in meno. `update()` costa meno di 1 ms: tutto il resto è disegno.

## Cosa resta

- I **modelli 3D** (nemici ~1–2,5 ms l'uno qui, l'eroe ~3,5): tanti tratti sottili (contorni, pieghe) e riempimenti; non si alleggeriscono
  senza cambiarne l'aspetto. Gli ostacoli animati (`ROCK_LIVE`: canne, bracieri, cumuli di fango…) ~0,5 ms l'uno.
- Da provare sul telefono vero di Denis: fluidità in battaglia, nel menu, nei passaggi di stanza.

## Anteprima sul telefono

https://claude.ai/artifact/N8yfkjf53iaBG8PLeYkaHx («Mossbound Fase 9», 20 ottobre): il gioco di `piano-maestro` diviso in tre pezzi come
quello pubblicato (`python3 app/mk_claude.py index.html <cartella>`, titolo cambiato). Ha il suo salvataggio (un'altra pagina): si parte
dal prologo, oppure si porta il proprio col codice di salvataggio (Impostazioni → Salvataggio).

## Prove

- `node tests/fluido.js [scene]`: la tela a 2 pixel a punto, lo stesso fotogramma con e senza le scorciatoie (differenza massima ≤ 64,
  pixel oltre 8 ≤ 0,2%; fogli `tests/fl_<scena>.png` con le due immagini e la differenza ×16), la qualità «auto» e «alta», il nero dei
  tre fotogrammi, i tempi con e senza (solo per confronto).
- Una partita automatica per capitolo (`run.js`), `meta2.js`, `menu2.js`, `menu3.js`: senza errori.
