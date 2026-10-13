# Anteprima 47 (dal 13 ottobre)

Richiesta di Denis del 13 ottobre: lavorare ora sui punti 3, 9, 11, 24–34, 38–50, 52 e 53 del piano maestro, poi mandargli «una piccola
anteprima»: se gli piace, si aggiunge al gioco. Si lavora sul ramo `anteprima` (partito da `piano-maestro`); il gioco sul telefono e l'app
non cambiano finché Denis non dice sì (`app/mk_app.py --pubblica` funziona solo dal ramo `piano-maestro`). L'anteprima si pubblica come un
artefatto nuovo, separato dal gioco.

Decisioni già date a Denis (13 ottobre):
- **Punto 29, progressione separata**: gli oggetti della Classica (armi, armature, anelli, amuleti) crescono solo con carte e materiali della
  Classica; le armi zombie e quattro accessori zombie (Fondina = ricarica più veloce, Zaino = più munizioni, Stivali = corsa più veloce,
  Talismano = più monete) solo con carte e materiali Zombie; vestiti e creature sono di tutte e due. Materiali: «Essenza di muschio»
  (Classica) e «Rottami» (Zombie).
- **Punto 52, a ogni apertura**: una schermata d'avvio breve a ogni apertura dell'app, con l'avanzamento vero e «Tocca per iniziare»; il
  filmato lungo solo la prima volta (si rivede dalle impostazioni).

## Stato dei punti

| Punto | Cosa | Stato |
|---|---|---|
| 52 | Icone e schermate di caricamento (Classica fantasy, Zombie con la mano) | fatto |
| 53 | Caricamento intelligente (asincrono, progressivo, memoria, avanzamento vero) | fatto |
| 25, 29 | Sistemi distinti e progressione separata | da fare |
| 26, 27, 28 | Bustine a 5 rarità, copertine, apertura a strappo | da fare |
| 30 | Casse Classiche a 4 rarità, 4 posti + quinta | da fare |
| 31–34 | Lucky Cards | da fare |
| 42–45 | Menu rifatti, due menu, passaggio con la mano zombie, falò | da fare |
| 24, 38–41 | 4 armi nuove, disegni degli oggetti, vestiti, creature | da fare |
| 3, 9, 11 | Arene ridisegnate, anteprime con sblocco, oggetti della mappa zombie | da fare |
| 46–50 | Audio di zombie, nemici e armi, musiche dei menu | da fare |

## 52–53: avvio e caricamenti (fatto)

- **Avvio**: la pagina mostra subito la schermata `#boot` (in `src/pagina.html`, animata solo con il CSS, così si muove anche mentre il
  telefono legge il codice); tutto il gioco sta in `window.__mbGo`, avviato dalla coda dopo il primo disegno. Prima la pagina restava vuota
  finché il codice non era letto (con la CPU 4×: 2 s). Poi (`src/js/65-caricamento.js`, `BOOTS`): il menu si disegna qualche volta sotto la
  schermata, arrivano i font, gli eroi e i compagni 3D si disegnano una volta fuori schermo; la barra va avanti per davvero; «Pronto!» e
  «Tocca per iniziare» (un consiglio di gioco in basso). Il tocco apre l'audio e la schermata sfuma sul menu; la prima volta parte il
  filmato con la sua musica (aspetta che l'audio sia aperto, niente secondo «tocca»). Misurato con la CPU 4×: schermata a 0,55 s, pronto a
  2,6 s, primi fotogrammi del menu dopo il tocco lisci (prima uno da 122 ms).
- **Ingresso zombie**: la mappa si costruisce a pezzi (`ZM.bootAsync`, dettagli in `anteprime/zombie/LEGGIMI.md`) dietro la schermata zombie
  (la mano che esce dalla terra, «Camposanto dei Corvi», un consiglio), con l'avanzamento vero; il menu sotto non si disegna. Con la CPU 4×:
  prima un blocco da 6 s, ora nessuno oltre ~190 ms durante il caricamento.
- **Momenti liberi** (`IDLE`): dopo il tocco, quando il telefono non ha niente da fare, il disegno della scheda zombie e tutti i modelli 3D di
  nemici e boss (ogni mossa una volta, fuori schermo): la prima volta che uno compare in una stanza non scatta.
- **Memoria**: quando l'app va in secondo piano con la mappa zombie spenta, la foto del suo terreno (30 MB) viene buttata e rientrando torna
  identica (iOS chiude per prime le app in secondo piano che usano più memoria, e allora si riparte da capo).
- **Prova**: `node tests/avvio.js` (si fa passare per un telefono vero).
