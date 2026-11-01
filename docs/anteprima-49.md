# Anteprima 49 (31 ottobre 2026)

Denis, alla domanda «cosa possiamo fare per migliorare il gioco?», ha scelto:

- Classica: **Nemici più vivi nel gioco** (fatto e pubblicato lo stesso giorno: vedi `docs/nemici-vivi.md`), **Più fluido sul telefono**,
  **Abisso più ricco**;
- Zombie: **Musica della partita**, **Abilità zombie**, **Modalità sfida**, **Zombie nuovi**;
- Tutto: **Collaudo finale (FASE 10)**, **Missioni ed eventi nuovi**.

Le cose nuove stanno in file loro, **fuori da `src/ordine.txt`**, e vanno nell'Anteprima 49: il gioco di oggi più i file elencati in `NUOVI`
di `anteprime/mk_anteprima49.py`, messi prima della chiusura (`coda.html`). Alla prima apertura c'è già un eroe (niente prologo né
creazione) e, una volta sola, 10.000 oro, 600 Rottami e il record 15 della Zombie (`SAVE.__a49`) per sbloccare e provare subito le abilità.

- Pagina: `python3 anteprime/mk_anteprima49.py <cartella>` (divisa come il gioco), pubblicata su
  https://claude.ai/artifact/9NHUpsQR6kxzTyz8JthZKN; si aggiorna ripubblicando la stessa cartella.
- Prove: `python3 tests/a49/mk.py` (la pagina senza salvataggio pronto né spinta, con `window.__E`), poi
  `node tests/a49/musica.js`, `abilita.js`, `sfida.js`, `abisso.js`, `eventi.js` (foto in `tests/a49/`).
- Per metterle nel gioco dopo il sì: aggiungere in fondo a `src/ordine.txt`, prima di `coda.html`, nell'ordine
  `js/98-musica-zombie.js`, `js/99-abilita-zombie.js`, `js/100-sfida-zombie.js`, `js/102-abisso-ricco.js`, `js/103-missioni-eventi.js`,
  `js/104-mira.js` (103 aggiunge le missioni delle abilità e della Sfida solo se ci sono 99 e 100: metterli insieme, perché le missioni del
  giorno sono salvate col loro numero nell'elenco; 104 lavora anche da solo, e con 99 rende trascinabili le abilità).

## 1. La musica della partita zombie (`src/js/98-musica-zombie.js`)

Prima sulla mappa c'era solo l'atmosfera. `TRACKS.zpartita` (76 battiti, re minore, mi bemolle, si bemolle minore, la: un giro che non si
risolve) segue il direttore della partita (`ZM.W.director`) con un'intensità `ZMU.I` che cambia piano:

| Momento | Cosa suona |
|---|---|
| Inizio e pausa tra i round | bordone basso, una campana lontana, un carillon stonato |
| Round | il cuore che batte e il violoncello che striscia di un semitono; più fitti coi round e con gli zombie vivi |
| Round alti, tanti zombie | tamburi di guerra, una campana che stona di un tritono, il coro che respira |
| Becchino o Spaventapasseri | tamburi su ogni battito, ottoni bassi, il coro su ogni giro |
| Poca vita (sotto 40) | il cuore più forte, il resto più lontano |
| Caduto | un accordo basso con la campana, poi silenzio fino alla partita dopo |

Parte quando la musica del menu si è spenta (`zMusicOff` avvolto). Volume medio misurato: pausa 0,0075, round 14 con 6 zombie 0,0225, boss
0,027, poca vita 0,022, caduto 0,013 (prova `tests/a49/musica.js`).

## 2. Zombie nuovi su carta (`sprite/mostri/zombie_nuovi.js`)

Il Gonfio, lo Sputatore e il Bruto, col metodo dello spaventapasseri, dipinti come la lanterna; non ancora nella mappa (servono le quattro
direzioni e il sì di Denis). Dettagli in `sprite/mostri/LEGGIMI.md` («Gli zombie nuovi»); foglio `sprite/mostri/zombie_nuovi_4dir.jpg`;
pagina https://claude.ai/artifact/MhfnMzYQg7UjU6vcPzNe3G (`python3 anteprime/mk_mostro.py --nuovi`, anche «4 direzioni»).

**Attenzione**: il 9 ottobre Denis aveva scartato uno «Zombie gonfio» con la stessa idea (si gonfia e scoppia in una nube verde, commit
`48d279b`). Il Gonfio di adesso è disegnato da capo, ma l'idea è quella: deve decidere lui se tenerlo o cambiarlo.

## 3. Le abilità zombie (`src/js/99-abilita-zombie.js`)

L'idea di Denis del 12 ottobre: abilità da scegliere e sbloccare, al massimo 3 in partita.

| Abilità | Cosa fa | Ricarica | Sblocco |
|---|---|---|---|
| Scatto | un balzo dove vai (da fermo, via dallo zombie più vicino); per 0,45 s non ti toccano | 5 s | da subito |
| Bomba incendiaria | una bottiglia sul gruppo di zombie più vicino che vedi: la terra brucia 4 s (45% della vita di uno zombie al secondo, i boss un terzo) | 16 s | record 3, 900 oro, 40 Rottami |
| Rintocco | la campana a morto: gli zombie entro 125 px volano indietro e restano storditi 1,8 s (i boss no) | 14 s | record 6, 1.300 oro, 70 Rottami |
| Tagliola | resta dove stai; il primo zombie che la pesta resta preso 5 s e perde 1,4 volte la vita di uno zombie; al massimo due | 9 s | record 9, 1.800 oro, 100 Rottami |
| Adrenalina | per 7 s velocità ×1,3 e ricarica ×2 (con `ZM.modsHook`, perché le Lucky Cards rifanno `W.mods` a ogni fotogramma) | 28 s | record 12, 2.500 oro, 140 Rottami |
| Benda | torna il 60% della vita in un secondo | 32 s | record 15, 3.400 oro, 190 Rottami |

Arsenale: la sezione «Abilità» in cima (tre posti e le sei carte; un tocco apre il foglio con «Sblocca» o «Portala in partita»; il terzo che
porti prende il posto del primo, come i compagni). In partita: tre bottoni rotondi in fila in basso a destra, sotto il cerchio della
telecamera (il tocco non gira la telecamera), col tempo che gira come un orologio; tastiera 1, 2, 3. Salvataggio `SAVE.z.ab = {own, eq}`.
Prova `tests/a49/abilita.js`: Arsenale, sblocco col record, ogni abilità usata in una partita vera, ricarica, telecamera ferma.

## 4. La Sfida della notte (`src/js/100-sfida-zombie.js`)

La modalità sfida dentro la Zombie: nella Zombie il bottone «Sfida» apre la Sfida della notte (nella Classica resta la sfida del giorno).
Ogni notte una regola diversa, a giro di sette, sulla mappa e con le ondate di sempre:

| Regola | Cosa cambia |
|---|---|
| Solo pistola | armi a muro e Bara chiuse, in mano la pistola; zombie con un quarto di vita in meno |
| Orda famelica | zombie più veloci del 35%, monete doppie |
| Sangue freddo | la vita non torna da sola |
| Notte dei becchini | un boss ogni tre round (e non al 5 e al 10) |
| Mani di pietra | ricarica più lenta (×0,6), danno +50% |
| Ricchi e dannati | 4.000 monete in più, zombie con il 30% di vita in più |
| Cuore fragile | 60 di vita, un colpo su tre critico |

Medaglie al round 5 (400 oro e 10 Rottami), 10 (Bustina Zombie Rara) e 15 (25 cristalli e 30 Rottami), ognuna una volta per notte
(`SAVE.zchal`); la scritta della sfida sotto la barra in alto; la medaglia sulla schermata di fine; «Rigioca» rifà la sfida, «Menu» la
chiude. Si apre dopo la prima partita nel camposanto. Prova `tests/a49/sfida.js`.

## 5. L'Abisso più ricco (`src/js/102-abisso-ricco.js`)

- I 4 boss del terzo giro anche nell'Abisso: Burattinaio (45), Fenice (50), Piovra (55), Cervo (60), poi ogni 60 stanze (`boss3At` avvolto).
- I Patti dell'Abisso: battuto un boss dell'Abisso, tre sigilli tra nove patti, un dono e un prezzo (sangue: Attacco +30% e Salute −20%;
  oro: Oro +60% e nemici +15%; furia; brace; gelo; veggente: Critico +12% e boss +25%; lama; linfa; tesoro), mai lo stesso due volte.
- I tesori della discesa: dalla stanza 20 due cristalli ogni 5 stanze oltre la 15; una bustina Classica Rara dalla 30, Epica dalla 45,
  Leggendaria dalla 60; scritti sulla schermata di fine coi patti stretti.

Prova `tests/a49/abisso.js`.

## 6. Missioni ed eventi nuovi (`src/js/103-missioni-eventi.js`)

- Missioni della Zombie del giorno (round 5, 60 zombie, un boss del camposanto, 6 abilità, una medaglia della Sfida) e della settimana
  (500 zombie, round 12), solo per chi ha giocato almeno una partita nel camposanto.
- L'evento della settimana: Caccia ai boss, La grande orda, Fiera del muschio, uno diverso ogni lunedì; dal 25 ottobre al 7 novembre la
  **Notte delle zucche**. La moneta dell'evento arriva dagli stessi momenti delle missioni; cinque premi, l'ultimo con una cornice nuova
  del Profilo (Zucca, Teschio d'oro, Orda, Fiera). Bottone «Evento» in fondo alla colonna di destra della schermata principale, nelle due
  modalità. Prova `tests/a49/eventi.js`.

## 7. Collaudo

Le prove del gioco fatte girare con `tests/test.html` costruito dalla pagina di prova 49 (il gioco più i cinque file, senza salvataggio
pronto né spinta): `menu2`, `menu3`, `meta2`, `mig`, `fresh`, `contatore`, `enemies`, `colpi`, `classica` (tutti i controlli OK) e una
partita automatica per capitolo (Golem, Yeti, Idra, Fenice: quattro vittorie), nessun errore. `zombie.js` aveva un solo «no»: si aspettava
che sulla mappa non suonasse niente, e adesso suona la musica della partita; il controllo accetta tutte e due le cose (rifatto sul gioco di
oggi e sull'anteprima: tutto passa). Poi le prove di `tests/a49`: musica (volume medio: pausa 0,0073, round 2 0,0172, round 14 con 6 zombie
0,0224, boss 0,0277, poca vita 0,0214, caduto 0,013), abilità (13 controlli; la tagliola provata in un punto libero, perché vicino a un
recinto lo zombie gira intorno e non ci passa, com'è giusto), sfida (10), abisso (6), eventi (6): tutto passa, nessun errore.

## 8. La mira alla Brawl Stars (`src/js/104-mira.js`, 1° novembre)

Denis: «vorrei che aggiungessi al gioco una cosa tipo lo sparo alla brawl star che vede una piccola area che ti precede la gittata del
tiro di quell'arma ecc.». Alle domande ha risposto: **in tutte e due le modalità**, **«Automatica + levetta»**, **anche la Super e le
abilità zombie**, **nell'Anteprima 49**.

- **L'area del tiro**, a terra davanti all'eroe, con la forma e la gittata vere del colpo (colore crema come in Brawl Stars; i bordi chiari
  con un alone scuro, così si legge sul pavimento chiaro e su quello buio; le frecce che corrono verso la fine e la sbarra dove il colpo si
  ferma).
  - Classica: la freccia o il dardo fino al bordo della stanza o al primo ostacolo che lo ferma (calcolati come nel gioco: le frecce
    spariscono fuori da `L`–`R`, `TOP`–`BOT` e sugli ostacoli di `G.rocks`); più larga con le frecce in più davanti; le righe delle
    diagonali, dei lati, di dietro e del ventaglio; il rimbalzo sul muro (`P.wb`); le tre stelline del Ninja; la fiala dell'Alchimista
    a pallonetto (i puntini dell'ombra a terra e quelli in aria) col cerchio dove scoppia.
  - Zombie: ogni arma la sua (`ARMI.DATI`): striscia per pistola, revolver, mitra, fucile a vapore; cono per le pompe e per i mitra che
    spargono (mitraglietta, a tamburo, mitragliatrice), fatto di raggi che si fermano ognuno al suo muro (come `fireShot`: finestre e
    varchi si passano); il lanciarazzi col cerchio dell'esplosione; lo spicchio corto del lanciafiamme; il cerchio del Risonatore. Disegnata
    a terra con la telecamera della mappa (`inGround`), sotto le case e i lampioni; al piano di sopra della Locanda sale con l'eroe.
- **Da fermo** si spara da soli come prima e l'area, leggera, segue il bersaglio.
- **La levetta del tiro**: Classica in basso a destra accanto allo Scatto (68 px, «MIRA»; per i mancini a sinistra), Zombie sopra le
  abilità (76 px; il cerchio della telecamera sale a 300 px dal fondo, `W.lookY`, e le scritte d'aiuto sopra la levetta). La trascini e vedi
  l'area dove va il colpo (l'eroe si gira lì, da fermo con l'arco teso o l'arma alzata), lasci e spara lì, **anche camminando**; un tocco
  spara al più vicino; riportata al centro prima di lasciare non spara (come in Brawl Stars). Nella Classica il tiro aspetta l'arco pronto
  (al massimo 0,6 s) e passa dalla coda delle raffiche come quello automatico (il Multicolpo e l'albero delle abilità lo contano), con
  l'angolo segnato; la fiala cade alla distanza scelta (da 60 px alla sua gittata). Nella Zombie le armi a un colpo sparano un colpo
  (aspettano fino a 0,9 s che l'arma sia pronta), le automatiche una raffica: mitraglietta 5, a tamburo 6, mitra 4, mitragliatrice 10
  (dopo che le canne girano), lanciafiamme 6. La telecamera non si muove.
- **La Super trascinata** (Classica: il bottone della Super diventa una levetta d'oro quando è carica): la Pioggia di frecce cade nel
  cerchio che scegli (raggio 92, fino a 300 px; prima sui nemici dentro), il Calderone dove scegli (raggio 105, fino a 320 px), il Dardo
  d'assedio dove punti (la striscia larga fino al muro e l'esplosione); Ballata e Radici mostrano gli anelli d'oro sotto tutti i nemici
  che prendono, la Danza delle lame il suo giro (e parte girata dove punti), le Ombre del Ninja il loro giro. Un tocco la usa come prima,
  riportata al centro non parte.
- **Le abilità zombie trascinate**: lo Scatto dove punti (la striscia di 96 px fino al muro), la Bomba dove scegli (da 30 a 230 px, il
  cerchio del fuoco e la bottiglia che vola a puntini), la Tagliola dove scegli (fino a 80 px, non oltre un muro), il Rintocco mostra il
  suo raggio (125 px); Adrenalina e Benda si usano lasciando. Un tocco le usa come prima.
- Agganci: nel motore della mappa tre cose che senza questo file non fanno niente (`W.aimHook` in `updateBeings`: dove punta l'eroe e il
  grilletto, anche camminando; `h.aimP`: l'arma alzata da fermo; `W.lookY`: l'altezza del cerchio della telecamera); in 99 il bottone delle
  abilità chiede ad `aimAbDown` se il dito è suo e `zabUse(i, aim)` prende la mira. Nella Classica 104 avvolge `update`, `input`,
  `nearest` (mentre la levetta mira, il tiro automatico di quel fotogramma resta senza bersaglio), `volley` (la raffica segnata va
  dov'è segnata), `drawTelegraphs` (le aree a terra, insieme ai segni dei nemici) e `hudUlt`; il dito sul bottone della Super lo prende
  prima, in cattura. `MIRA.on = false` spegne tutto; `MIRA.last` dice cosa è stato disegnato (per le prove).
- Costo: l'area più cara (il cono della pompa, 5 raggi) 0,03–0,05 ms a fotogramma.
- Prova `node tests/a49/mira.js` (36 controlli: levetta nascosta nel menu e al suo posto in battaglia, area e eroe girato, tiro camminando,
  tocco, annullato, tiro automatico con l'area leggera, Multicolpo, la Super di ognuno dei sette eroi, la fiala alla distanza scelta,
  mancini, effetti bassi; sulla mappa: posti dei bottoni, area e telecamera ferma, telecamera girata, tiro camminando, raffica del mitra,
  pompa, tocco, annullato, l'area di ogni arma, Bomba, Tagliola, Scatto, Rintocco e Benda trascinati, il costo), foto `tests/a49/mi_*.png`.

### 8b. Nella Zombie si spara dove guarda la visuale; mire più trasparenti e più belle (1° novembre)

Denis, dopo averla provata: «sulla modalità zombie voglio che la visuale e lo sparo siano insieme cioè, se non guardo da quella direzione
muovendo la visuale il pg non spara, e fai più trasparenti e più belle le mire».

- **La visuale è la mira** (solo nella Zombie): la direzione della visuale è la cima dello schermo (nel mondo −π/2 − ψ). Davanti all'eroe
  c'è il **fascio della visuale**, una luce fredda e leggera (sommata, così sul buio sembra luce) che si ferma ai muri, coi due lati
  sottili e il bordo lontano a puntini: l'eroe spara da solo, **anche camminando**, al primo zombie che ci entra (aperto ±22°, ±30° per le
  armi corte e il Risonatore; lungo quanto arriva l'arma, al massimo 300 px); un aiuto di mira lo segue finché resta nel fascio e si vede
  (niente muri in mezzo; controllato ogni 0,1 s come il bersaglio del motore). Gli zombie fuori dal fascio non li colpisce: per sparargli si
  gira la visuale col dito a destra (o Q/E). Col bersaglio: l'area dell'arma verso di lui e un **mirino** rosso ai suoi piedi (un anello
  con quattro tacche che girano). Senza nessuno nel fascio l'eroe guarda dove guarda la visuale (camminando, dove cammina) e ricarica da
  solo. La riga d'aiuto lo dice: «Spari dove guardi: gira la visuale verso gli zombie».
- **Via la levetta del tiro nella Zombie** (il cerchio della telecamera torna al suo posto). Nella Classica la levetta resta.
- Le abilità si trascinano come prima.
- **Mire nuove** in tutte e due le modalità, come vetro di luce: il pieno appena accennato che sfuma verso la fine, i bordi sottili e chiari
  che si spengono con la distanza, niente più bordo scuro né frecce; le strisce tonde in fondo con un bagliore morbido (più chiaro su un muro)
  e una riga di mira al centro; una luce che corre lungo la mira (al posto delle frecce); i cerchi come lenti (più chiari verso l'orlo) con
  un anello tratteggiato che gira piano; i puntini più piccoli. Colori: Classica bianco caldo, Super oro, Zombie bianco freddo col fascio
  azzurrino e il mirino rosso. Con `LOWFX` niente luce che corre, anelli e onde.
- Motore della mappa: l'aggancio `W.aimHook` dà ora anche `face` (false: l'eroe resta girato dove cammina) e `idle` (niente da colpire: può
  ricaricare da solo); `h.aimP` vale null senza l'aggancio, e allora l'eroe alza l'arma come prima (col bersaglio del motore).
- Costo: fascio e area della pompa insieme 0,07 ms a fotogramma (i raggi del fascio si rifanno solo quando l'eroe o la visuale si muovono).
- Prova `node tests/a49/mira.js` (35 controlli): nella Zombie zombie davanti → spara e il mirino è su di lui; visuale girata → non spara e
  l'eroe guarda la visuale; a 17° sì, a 34° no; il dito che gira la visuale lo fa sparare; camminando spara girato verso di lui; dietro un
  muro no; ricarica da solo; ogni arma col suo bersaglio; le abilità trascinate; il costo. Foto `tests/a49/mi_z_*.png`, `mi_c_*.png`.

### 8c. L'area grande quanto il proiettile (1° novembre)

Denis: «ok mi piace ma fai la cosa trasparente tipo alla grandezza per ogni proiettile».

- **Zombie**: al posto del fascio largo uguale per tutte le armi (±22°), davanti all'eroe c'è l'**area del colpo dell'arma in mano, grande
  quanto i suoi proiettili** (`mzView`, `MZHW`, `mzDrawShot`): la striscia del proiettile, larga quanto il colpo (pistola 2,6 px di mezza
  larghezza, revolver 3,4, mitraglietta e a tamburo 2,4, mitra 2,8, mitragliatrice e chiodo del fucile a vapore 3,2, razzo 5) con intorno,
  appena accennato, il cuneo di quanto il proiettile può deviare (come in `disegno_armi.js`: un colpo solo fino a `spread`°, quindi la
  mitraglietta ±8°, il revolver ±1,5°, il vapore ±1°, il razzo niente); per le pompe un raggio sottile per ogni pallino con la sua testina
  di luce (8 la Pompa da caccia su ±8°, 7 la tattica su ±11°); la fiamma del lanciafiamme; l'onda del Risonatore tutto intorno; il razzo
  col cerchio dell'esplosione sul bersaglio. Lunga quanto arriva l'arma (al massimo 380), si ferma ai muri. Senza bersaglio è più leggera
  e d'un bianco più freddo; col bersaglio più chiara, girata verso di lui (dolcemente: l'angolo segue in circa 50 ms), con la luce che corre e
  il mirino rosso.
- **Si spara quando lo zombie entra in quell'area**: lo zombie conta col suo corpo e con la grossezza del proiettile, più 5° d'aiuto
  (`MZV.assist`); il Risonatore spara a chiunque sia nel suo cerchio. Così la pistola chiede di mirare più giusto (a 140 px: sì a 7°, no a
  20°), la pompa e la mitraglietta meno (la pompa a 19° sì).
- **Classica**: una striscia per ogni proiettile della raffica, larga quanto il colpo (`MCHW`: freccia 4, dardo e foglia 4,6, stellina 5,
  nota 5,4, freccia di fuoco 5,2; le frecce toccano un nemico fino a 5 px dal loro centro): le frecce in più davanti hanno ognuna la sua
  striscia, affiancate a 9 px come partono; le diagonali, i lati, dietro e il ventaglio con la stessa grossezza; le tre stelline del Ninja
  tre strisce.
- Prova `node tests/a49/mira.js` (36 controlli, nuovi: pistola a 7° sì e a 20° no, pompa a 19° sì, il costo dell'area di pompa, pistola e
  razzo, meno di 0,5 ms). Foto `tests/a49/mi_z_*.png` (anche `mi_z_pompa_lato.png`), `mi_c_*.png`.

