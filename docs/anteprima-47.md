# Anteprima 47 (dal 13 ottobre)

Richiesta di Denis del 13 ottobre: lavorare ora sui punti 3, 9, 11, 24–34, 38–50, 52 e 53 del piano maestro, poi mandargli «una piccola
anteprima»: se gli piace, si aggiunge al gioco. Si lavora sul ramo `anteprima` (partito da `piano-maestro`); il gioco sul telefono e l'app
non cambiano finché Denis non dice sì (`app/mk_app.py --pubblica` funziona solo dal ramo `piano-maestro`). L'anteprima si pubblica come un
artefatto nuovo, separato dal gioco: **https://claude.ai/artifact/VwGxMMndRAxBNrRRZj33Qh** (pubblicata il 14 ottobre).

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
| 25, 29 | Sistemi distinti e progressione separata | fatto |
| 26, 27, 28 | Bustine a 5 rarità, copertine, apertura a strappo | fatto |
| 30 | Casse Classiche a 4 rarità, 4 posti + quinta | fatto |
| 31–34 | Lucky Cards (con 35–37: Macchina della Fortuna, carte che bruciano, Arsenale e Pass Zombie) | fatto |
| 42–45 | Menu rifatti, due menu, passaggio con la mano zombie, falò | fatto |
| 24 | 4 armi zombie nuove | fatto |
| 38 | Disegni degli oggetti | fatto |
| 39–40 | Vestiti nuovi e Guardaroba | fatto |
| 41 | Creature nuove (via Muschietto) | fatto |
| 3, 9 | Arene con personalità, anteprime con sblocco | fatto |
| 11 | Oggetti della mappa zombie (usura, vetri, falene) | fatto |
| 46–50 | Audio di zombie, nemici e armi, musiche dei menu | fatto |

Commit sul ramo `anteprima`, in ordine: ae82b1e (52–53), 80709e7 (42–45), 853abf3 (25–37), 19bf9f2 (24), 5768f20 (41), e4f4990
(39–40), 9bc897b (38), 63a0d62 (3, 9), fe1b479 (11), e680e80 (46–50) e il collaudo finale.

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

## 42–45: due menu (fatto)

- **Menu Zombie col falò** (`src/js/66-falo.js`): lontano (dipinto una volta) cielo di notte, colline, fattoria in rovina con una luce,
  mulino, alberi morti, sentiero, staccionata rotta, tombe, erba alta; dal vivo luna e nuvole, pale del mulino, zombie lontani che si fermano
  e girano di scatto la testa, nebbia, corvi. Il campo in 3D con la telecamera dei mostri: tronco, eroe seduto (posa `sit` in
  `disegno_eroe.js`, `o.mix` per alzarsi e sedersi), pistola sul tronco, zaino, pala, munizioni, pentola, falò con fiamme, scintille, braci e
  fumo, luce del fuoco sulle cose vicine.
- **Passaggio tra le modalità** (`src/js/67-menu-modi.js`): `SAVE.modo` cambia con uno scorrimento in mezzo allo schermo o toccando la
  manina zombie (in alto a destra; dalla Zombie il germoglio in alto a sinistra); la scena dell'altra modalità attraversa lo schermo, l'eroe
  si siede o si alza, cambiano musica e atmosfera; un tocco salta il passaggio. Via le vecchie linguette. Aspetto proprio della Zombie: bordo
  strappato con sangue secco, filo spinato, targhe coi rivetti, Gioca verde ruggine.
- **Classica senza scheletro** (punto 42): via teschio e costole; dietro la cripta il grande albero di Mossbound nei colori dell'arena, cielo
  al tramonto; bottoni a piastrelle col bordo d'oro, foglia nei titoli, rametti nell'Armeria.
- Prova: `tests/zombie.js` (aggiornata al passaggio nuovo), `menu2.js`, `menu3.js`.

## 25–37: economia delle due modalità (fatto)

- **Sistemi separati** (punto 25) e **progressione separata** (punto 29), in `src/js/68-economia.js` (tutti i numeri sono lì): gli oggetti
  Classici crescono con carte Classiche e «Essenza di muschio» (dal livello 5), le armi zombie e i quattro accessori (Fondina, Zaino,
  Stivali, Talismano) con carte Zombie e «Rottami»; vestiti e creature sono di tutte e due.
- **Bustine** (punti 26–28, `src/js/69-bustine.js`): cinque rarità per modalità (Comune, Rara, Epica, Leggendaria, Implacabile), copertine
  dipinte, apertura col dito sulla linea tratteggiata (un tocco accelera solo il passo in corso). Si trovano in Bottega, pass, missioni,
  accesso, cammino e ruota (i premi che erano casse ora sono bustine).
- **Casse Classiche** (punto 30, `src/js/70-casse-negozio.js`): solo dalle partite, legno, argento, oro, cristallo; 4 posti più la quinta
  (Epica o Leggendaria, al massimo una ogni 5 ore); posti pieni: un po' d'oro al posto della cassa, con l'avviso.
- **Lucky Cards** (punti 31–34): nove abilità per la partita zombie (Munizioni d'emergenza, Impulso repulsivo, Cash istantaneo, Scudo
  temporaneo, Rigenerazione, Raffica infinita, Invisibilità, Colpo fortunato, Autorianimazione), in pacchetti da 2, 4, 8, 12 carte vinti a
  fine partita (4 posti più la quinta) o comprati in Bottega (pochi al giorno); collezione e carta da portare in partita
  (`src/js/71-menu-zombie.js`).
- In più (35–37): **Macchina della Fortuna** sulla mappa (`anteprime/zombie/fortuna.js`: gratis ogni 5 round, poi 2.000 monete; la carta
  si accende subito e brucia a destra quando finisce), **Arsenale** (armi e accessori zombie con i livelli) e **Pass Zombie**.

## 24: quattro armi zombie nuove (fatto)

- Mitraglietta a tamburo, Lanciafiamme (cono di fuoco, zombie che bruciano), Fucile a vapore (pressione che sale, chiodo che passa quattro
  zombie), Risonatore (onda d'urto col raggio segnato a terra), in 2D (`sprite/armi/`) e in 3D (`sprite/eroe3d/armi3d.js`), con i suoni e
  dentro la Bara.

## 41: creature nuove (fatto)

- Via Muschietto. Al suo posto (`sprite/nemici3d/creature.js`, `PETS` in `src/js/34-compagni.js`): **Spiritello della lanterna**
  (fiammelle che inseguono), **Funghetto** (spore che avvelenano intorno), **Corvetto d'ossa** (piume che passano due nemici), con Lucciola e
  Draghetto. I vecchi salvataggi con Muschietto passano allo Spiritello con le stesse carte e lo stesso livello.
- **Compagni anche sulla mappa zombie** (`anteprime/zombie/compagni.js`, `ZM.compagni`): gli stessi portati nel menu, con carte e livelli,
  camminano al fianco dell'eroe (a lato rispetto allo schermo), attaccano gli zombie, se restano bloccati ricompaiono con uno sbuffo.
- Prova: `tests/pets.js`, `tests/meta2.js`, `tests/run.js ... spiritello`.

## 39–40: vestiti e Guardaroba (fatto)

- Nove vestiti 3D in `sprite/eroe3d/vestiti3d.js` (`VESTITI`, ganci `tunic`, `over`, `parts`, `hoodFx` in `disegno_eroe.js`): Giacca nera
  stracciata, Felpa strappata, Tenuta del Sopravvissuto, Mantello logoro, Abito del Becchino col cilindro, Hoodie Neon, Giacca Varsity,
  Piumino delle Rune, Kimono del Drago; strappi, toppe, mantelli e code seguono le mosse. **Senza vestito l'Arciere è identico al pixel**
  (`tests/eroe3d.js`).
- **Guardaroba** (`src/js/72-vestiti.js`): eroe che gira, si provano anche quelli chiusi, livelli con le carte; si apre da Armeria e
  Profilo; icone 3D nel pass («Nuovo vestito!»).

## 38: disegni degli oggetti (fatto)

- `src/js/73-icone-oggetti.js` (`ITART`): ogni oggetto Classico con la sua forma e il suo materiale (archi e balestra dai modelli 3D,
  armature, anelli, amuleti dipinti in tre toni col bordo illuminato), accessori zombie ridipinti (`ZART`), vestiti e compagni in 3D nelle
  schede. `itemSVG` restituisce l'immagine dipinta.

## 3 e 9: arene e anteprime (fatto)

- `src/js/74-arene.js` (`ARST`, una ricetta per ognuna delle 12 arene): pezzi sui muri (rampicanti, radici, colate di lava, catene,
  ghiaccioli, candele, stendardi, cristalli e aurora, occhi nel buio, lanterne, rune, gabbie, bandiere), pezzi ai lati e a terra, particelle
  e luce propria, posti condivisi così i pezzi non si sovrappongono; **stemma dell'arena** inciso nel pavimento al posto del teschio
  (`floorEmblem`, chiamato da `17-ambiente.js`).
- Anteprime (`src/js/61-anteprime-arene.js`): la stanza vera dell'arena con i suoi pezzi vivi e il boss che attacca ogni 3,5 s
  (`arenaScene`, base in cache `AUBASE`); sblocco con le porte che si aprono (`showArenaUp`, `auDoors`).

## 11: oggetti della mappa zombie (fatto)

- `anteprime/zombie/motore.js`: usura su tutti i materiali (`WEAR`: graffi, crepe, ruggine con le colature, intonaco che si stacca, schegge,
  polvere), vetri delle finestre (materiale `pane`: sporco, riflesso, qualche crepa), falene intorno ai lampioni accesi.

## 46–50: audio (fatto)

- **Zombie sulla mappa** (`anteprime/zombie/audio_zombie.js`, `ZV`, `ZM.audio`): gemiti e rantoli diversi per tipo, passi a tempo,
  ringhio e artiglio quando colpiscono, impatto e lamento quando sono colpiti, morte col corpo che cade, terra che si sgretola quando escono;
  più piano e più lontani se distanti, a destra o a sinistra. **Bossoli** espulsi che rimbalzano e tintinnano solo quando toccano terra,
  molto più bassi degli spari (picco 0,035 contro 0,594 della pistola).
- **Nemici Classici** (`src/js/75-audio-nuovo.js`, `VOX`): versi e passi propri.
- **Musiche**: menu Classico nuovo (`TRACKS.menu`, 112 bpm in re maggiore, energico e orecchiabile, con variazioni a ogni giro) e menu
  Zombie (`TRACKS.zmenu`: bordone, battito, violoncello, carillon, coro, gemiti lontani, vento); bottoni intonati alla modalità; la musica
  cambia insieme alla manina nel passaggio.

## Collaudo finale (14 ottobre)

- Partite automatiche vinte senza errori: arena 1 (Arciere e Spiritello), 2 (Cacciatrice e Funghetto), 3 (Balestriere e Corvetto), 4
  (Druida e Lucciola), 7 (Arciere e Draghetto).
- Passano `meta2.js` (25 su 25), `menu2.js`, `menu3.js` (foto guardate), `zombie.js`, `pets.js`, `mig.js`, `avvio.js` (da sola: il
  fotogramma più lento dopo il tocco 31 ms) e sulla mappa `gioco.js`, `ondate.js`, `ordine_mappa.js` e `bara_ordine.js` (numeri identici a
  `piano-maestro`: 28.558 px, 148 sugli esseri).
- Tempi di disegno di una stanza con tutti gli effetti, arene 1, 4, 7, 9: 5,1–5,6 ms contro 4,6–5,8 ms di prima (i pezzi delle arene non
  pesano).
- Corretti durante il collaudo: la funzione `ring` delle icone (73) prendeva il posto di quella dell'apertura delle casse (09) e casse e
  bustine si fermavano a metà (ora `iRing`; controllato con un'analisi del codice che nessun altro nome è dichiarato due volte); nel browser
  delle prove il filmato copiava il salvataggio prima che i file dal 66 in poi aggiungessero i loro campi (ora parte dopo l'ultimo file);
  `pets.js` aggiornata alle casse nuove (una cassa vera viene dal posto) e al prezzo della Lucciola (320 cristalli).

