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
    case, degli oggetti e degli zombie in 3D (`w.voci`, ~40 ms qui a 1,5 pixel a punto): la «piega» degli oggetti alti cambia a ogni passo
    della telecamera, quindi copiarli tali e quali avrebbe cambiato l'aspetto. Fatto dopo, sotto (13).

13. **Mappa zombie: gli strati fermi copiati** (20 ottobre; Denis: «Mappa zombie più fluida», dopo la proposta «ogni casa e oggetto
    disegnato una volta e rifatto solo quando la sua piega cambia di mezzo pixel»). In `anteprime/zombie/motore.js` (`LCB`, `lcPrep`,
    `lcPaint`, `lcDraw`, prima di `drawLayer`):
    - i pezzi fermi di ogni strato (facce, pannelli, palle, linee, contorni: i muri, i tetti, le lapidi, gli alberi, gli steccati, i mobili)
      si dipingono una volta in una tela loro, grande quanto serve, e si copiano 1:1: a vista dritta la telecamera sta su pixel interi della
      tela (lo spostamento arrotondato in `render`, al più mezzo pixel della tela, come in battaglia);
    - una copia si ridipinge quando la piega del suo strato, misurata sugli spigoli dell'impronta in basso e in alto (`L.pp`, calcolati in
      `layerSB` insieme al riquadro), si è mossa di più di mezzo pixel della tela (`LCB.tol`), o di meno ma con lo zoom diverso (lontano
      dall'angolo della mappa una scala diversa di un decimillesimo sposta la copia di un decimo di pixel: conta anche quello); tutti gli strati
      di un prop si ridipingono insieme, così i muri di una casa restano attaccati;
    - **a telecamera ferma le copie tornano esatte**: ferma da due fotogrammi, quelle fatte con la piega di poco diversa (più di due
      centesimi di pixel) si ridipingono, otto prop per fotogramma, le più lontane prima;
    - quando cambia un pezzo la copia si rifà: punti nuovi (le ante del cancello, l'asse che cade, la porta della latrina), materiale,
      colore, raggio, trasparenza, spessore (`lcTouch`), le assi delle barriere (`vis`), le trasparenze delle case con l'eroe dentro o
      dietro (contano i 256 passi che si vedono: il valore si avvicina alla meta senza fermarsi mai del tutto);
    - i disegni a mano (`fn`: lanterne, insegne, il secchio del pozzo che oscilla, le macchine, il corvo sul palo, i lumini) restano dal vivo
      al loro posto nell'ordine, tra una copia e l'altra; anche le fiamme figlie e i prop che sfumano (`fade`);
    - uno strato che cambia a ogni fotogramma (la piega che corre vicino al centro mentre l'eroe va di lato, una porta che si apre) si
      disegna dal vivo come prima finché non rallenta (`C.hot`), così non costa più di prima;
    - le tele stanno in 48 MB (`LCB.max`; una vista ne usa 20–45 a 2 pixel per punto, molto meno a 1,5): oltre, fuori le meno usate di
      recente, e quello che non entra si disegna dal vivo; si liberano quando si esce dalla mappa (`stop`, tornando al menu: si rifanno da
      sole nei primi fotogrammi quando si rientra) e con il terreno (`libera`);
    - girando la visuale (`CAM.rot`), per la sagoma dell'eroe dietro le cose e con `W.dbg.noLC`: tutto dal vivo, come prima.

    Misure (questo computer, 2 pixel a punto, mediane; i numeri ballano molto): fermo 35–55 → 25–41 ms a fotogramma (il disegno degli
    oggetti da 30–45 a 9–13 ms), in giù 35–63 → 26–48, di lato 33–84 → 25–57 (gli oggetti vicini al centro restano dal vivo), con 10 zombie
    di lato 46–76 → 39–70. Conteggi camminando di lato alla partenza: per fotogramma 47 copie, 6 ridipinti, 25 dal vivo (prima 78 dal vivo).
    Prova: `node anteprime/zombie/copie_prova.js` (sotto). Le prove di misura della mappa rifatte anche sul codice di prima delle copie
    (24751dd) danno gli stessi numeri: `ordine_mappa.js`, `bara_ordine.js` (i 4 errori di 15 px a visuale girata c'erano già),
    `visibilita.js`, `giro.js` (78,0 scambi per giro, oltre la soglia di 65 già prima: girando si disegna dal vivo); `navmappa.js` 93/96 in
    tutti e due (cambia solo quale zombie resta fermo).

14. **Apertura di bustine e casse** (20 ottobre; Denis: «i cali di frame […] quando apri bustine o le casse», «ok vai»). Misura:
    un'apertura intera sul telefono finto, ogni fotogramma (`chest_prof.js` nello scratch, con i tocchi fatti dalla prova). Prima 9
    fotogrammi al secondo qui. Le cause: la tela degli effetti a tutto schermo (lo sfondo in sfumatura rifatto a ogni fotogramma, il
    bagliore e il nucleo dei raggi stesi su tutto lo schermo anche dove erano trasparenti, 9–25 raggi a uno a uno lunghi fino all'angolo
    dello schermo), la sfocatura dietro la schermata (`.screen`, ma `#chestScr` ha lo sfondo pieno: non si vedeva, il telefono la
    calcolava lo stesso), la tela della bustina rifatta da capo a ogni fotogramma (seguiva il riquadro sullo schermo, che cambia di un
    pixel mentre la bustina galleggia e si inclina). Fatto, identico al pixel salvo arrotondamenti (`vis_fx.js`: al massimo 9 su 255 in
    pochi pixel): sfondo preparato una volta finché la cassa non si sposta (`fxBg` in 09, liberato alla chiusura), bagliore e nucleo
    solo nel loro quadrato, raggi in un solo tracciato che finisce dove finisce la sfumatura, la scossa scritta nella pagina solo quando
    cambia, niente sfocatura dietro `#chestScr` (`src/pagina.html`), la tela della bustina rifatta solo quando diventa più grande o molto
    più piccola (`pkResize` in 69). Dopo: 18–19 fotogrammi al secondo qui (il doppio), il 99% dei fotogrammi da 233–283 a 117 ms.
    Resta il disegno della bustina (6–7 ms qui a fotogramma, tutta animata) e le particelle.
15. **Falò del menu Zombie, seconda parte**: lo strato del campo (eroe seduto, ceppo, pala, zaino, cassa, fucile e la luce del fuoco
    su di loro, quattro passate su tutto lo strato tra cui una «soft-light») si ridipinge un fotogramma sì e uno no mentre l'eroe sta
    seduto (il respiro dura 9 s, il tremolio del fuoco è più lento di 30 al secondo); in piedi, mentre se ne va o cambia modalità a
    ogni fotogramma come prima. Gli zombie sul sentiero: ognuno dipinto in una tela sua, una volta ogni due fotogrammi a turno, e copiato
    dov'è a ogni fotogramma (come sulla mappa); quando cambiano mossa subito. Un fotogramma da 56 a 42 ms qui (`falo_ab2.js`). Uguale al
    pixel nel fotogramma in cui si ridipinge (`vis_falo.js`).
16. **Mappa zombie: nascite vicine, cose lontane ferme** (20 ottobre; Denis: «non far spawnare i zombie nelle aree ancora da sbloccare
    o troppo lontani a noi […] disattivare le parti di mappa dove siamo abbastanza lontani da non vederci»). Le zone chiuse erano già
    escluse (dal 14 ottobre, `zone_prova.js`); prima gli zombie nascevano dalle 6 buche più vicine a piedi tra 130 e 700 punti
    (mediana 444, uno su cinque oltre 500). Ora (`pickHole`, `holeScr` in `motore.js`): le buche entro 420 punti a piedi, tra queste
    prima quelle fuori dallo schermo; se ce n'è meno di due, le tre più vicine entro 700 come prima. «Fuori dallo schermo» non vuol dire
    lontano: lo schermo del telefono è alto, in su e in giù vede fino a 500 punti. Gli esseri (zombie, compagni, corvi posati, fiamme
    libere) si disegnano solo se la loro figura tocca lo schermo (`visB`; prima bastava il quadrato largo quanto lo schermo girato in
    ogni verso, che di lato prendeva zombie che non si vedevano e che consumavano i ridisegni a turno degli zombie); gli zombie fermi
    delle zone chiuse lontani dallo schermo non si muovono, se non li chiama una barriera (`nearScr`, `lureOf`); il fumo dei camini e le
    foglie solo vicino allo schermo, le foglie lontane non si disegnano. Prove: `comparse_prova.js` (tutte le buche entro 700 a piedi,
    più d'una, mai la stessa di fila), `zone_prova.js`, `chiusi_prova.js`, `ondate.js`, `gioco.js`. `ordine_mappa.js` dà gli stessi
    numeri di prima (sopra le sue soglie anche senza queste modifiche: da guardare a parte).

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
- Da provare sul telefono vero di Denis: fluidità in battaglia, nel menu, nei passaggi di stanza e sulla mappa zombie.

## Anteprima sul telefono

https://claude.ai/artifact/N8yfkjf53iaBG8PLeYkaHx («Mossbound Fase 9», 20 ottobre; ripubblicata lo stesso giorno con gli strati fermi della
mappa zombie, commit efe05c4, e poi con le aperture, il falò e gli zombie vicini, commit 24ae4a2): il gioco di `piano-maestro` diviso in tre pezzi come
quello pubblicato (`python3 app/mk_claude.py index.html <cartella>`, titolo cambiato). Ha il suo salvataggio (un'altra pagina): si parte
dal prologo, oppure si porta il proprio col codice di salvataggio (Impostazioni → Salvataggio).

## Prove

- `node tests/fluido.js [scene]`: la tela a 2 pixel a punto, lo stesso fotogramma con e senza le scorciatoie (differenza massima ≤ 64,
  pixel oltre 8 ≤ 0,2%; fogli `tests/fl_<scena>.png` con le due immagini e la differenza ×16), la qualità «auto» e «alta», il nero dei
  tre fotogrammi, i tempi con e senza (solo per confronto).
- Una partita automatica per capitolo (`run.js`), `meta2.js`, `menu2.js`, `menu3.js`: senza errori.
- `python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/copie_prova.js`: la mappa zombie, lo stesso fotogramma con le copie e
  tutto dal vivo (`W.dbg.lcLive`: la telecamera resta sui pixel interi) in otto posti, fermo, dopo una corsa di lato e in diagonale e di
  nuovo fermo, col cancello che si apre, la barriera rotta e riparata, la casa con l'eroe dentro, il piano di sopra della Locanda, gli
  effetti bassi. Fermo: al massimo lo 0,02% dei pixel con Δ>30 e nessun gruppo più spesso di 4 px (sono arrotondamenti dei bordi: di
  solito 0–0,007%, pixel sparsi); mentre la telecamera scivola ancora: ogni copia entro mezzo pixel della tela dal disegno vero (righe
  sottili lungo i bordi, al massimo lo 0,6% dei pixel). Poi i tempi con e senza copie e la memoria.
