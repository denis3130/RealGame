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
  `js/98-musica-zombie.js`, `js/99-abilita-zombie.js`, `js/100-sfida-zombie.js`, `js/102-abisso-ricco.js`, `js/103-missioni-eventi.js`
  (103 aggiunge le missioni delle abilità e della Sfida solo se ci sono 99 e 100: metterli insieme, perché le missioni del giorno sono
  salvate col loro numero nell'elenco).

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
