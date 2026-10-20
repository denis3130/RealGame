# Colpi unici (20 ottobre, anteprima)

Denis: «voglio che gli attacchi tipo che sparano qualcosa siano unici per tutti e adatti al proprio stile e design. chiedimi se non hai
capito». Le sue risposte alle domande: **tutti i nemici e i boss della Classica**; **entrambe** le cose, cioè l'aspetto e il suono del colpo
**e** il modo di sparare; per i boss **i 13 rifatti** (non quelli di oggi nel gioco); **prima una pagina** da vedere sul telefono, nel gioco
solo dopo il suo sì.

Prima quasi tutti i nemici sparavano la stessa palla rossa con l'alone rosa (pipistrello, pianta, fuoco fatuo, negromante), goblin e
scheletro la stessa freccia rossa, e molti boss rifatti usavano il suono del fuoco, del ghiaccio, del veleno o quello della palla rossa.

## Come è fatto

- `src/js/93-colpi-unici.js` (**non** in `src/ordine.txt`: il gioco vero non cambia). Avvolge `updEnemy` (sa chi sta sparando: `CU.cur`),
  `shootE` (il colpo del nemico diventa il suo, `CUS[tipo]`; per i boss rifatti il colpo resta del suo tipo, perché i cervelli lo guardano
  dopo, e gli si aggiunge il modo di volare, `CUB[tipo]`, o lo si sostituisce, `CUX`), `meteor` e `lob` (meteore del piromante, bombe del
  nano), `update` (prima che il gioco muova i colpi: rallentare, accelerare, curvare, inseguire, danzare, zig zag, saltelli, spaccarsi,
  rimbalzare, andare e tornare; dopo: dardi piantati, schizzi), `drawEproj` (`CUD[tipo]`, o `CULOOK[p.cuLook]` per i boss), `drawTelegraphs`
  (la riga di mira del goblin, le ombre dello sputo della rana, le rune della meteora), `drawHazards2Air` e `drawLobsAir` (meteora, bomba,
  dardi piantati, fili d'oro, piccoli scoppi), `drawBeamLine` (lo sguardo dell'occhio d'ombra), `sfx` (`CUSND`, un suono per ogni colpo).
- `CU.on` spegne tutto (nella pagina: «Colpi nuovi» / «Colpi di oggi»).
- Pittura come la lanterna: tre toni con la luce dall'alto a sinistra (i gradienti si fanno una volta per angolo e grandezza e si
  riusano), contorno scuro, bordo chiaro, bagliore morbido (`glow`, mai con `LOWFX`).
- Le cose che cambiano solo con l'angolo (frecce, dardi, spilli, schegge, fiocchi, semi, la faccia del teschietto, i rombi) si disegnano
  una volta in una piccola tela alla scala dello schermo (2 pixel a punto, 1,5 sui telefoni lenti) e si copiano pixel per pixel, come il
  gioco fa dalla FASE 9 (`cuSprite`, `cuBlit`; 32 angoli, al massimo 900 tele).
- Danni, velocità e quante volte tirano restano quelli di oggi (unica eccezione: le braci del diavoletto fanno 0,7 della palla).

## I nemici

| Nemico | Il colpo | Il modo | Il suono |
|---|---|---|---|
| Goblin | freccia da bracconiere: asta grezza col nodo e la legatura, punta di selce scheggiata, una penna rossa e una verde | mentre mira una riga di puntini rossi dice dove tirerà (si accende quando la mira è ferma, 0,25 s prima); l'élite tira tre frecce in fila sulla stessa riga (0,11 s l'una dall'altra) invece del ventaglio | corda corta e fischio |
| Scheletro | dardo d'osso della balestra: asta scura e spessa, punta d'osso a uncino con la ghiera di ferro, due alette di ferro | resta piantato nei muri e nei massi, vibra e sparisce dopo 1,4 s; l'élite tira tre dardi paralleli (a 11 px) come una balestra a tre canne | scatto della balestra; «toc» quando si pianta |
| Pipistrello (solo l'élite) | lo strillo: tre archi rosa e viola che si allargano mentre volano | due strilli di fila sulla stessa riga | squittio acuto |
| Pianta | semi di girasole color crema con le righe, che girano | la corona rallenta fino a metà mentre si allarga e resta sospesa come un fiore | «puh» e fruscio |
| Fuoco fatuo | fiammelle fatue lilla e celesti con gli occhietti | danzano a destra e a sinistra (8 px), le vicine in controfase: si intrecciano | soffio e campanellino |
| Diavoletto | palla di fuoco con le lingue di fiamma | dopo 0,42 s si spacca in tre braci a ventaglio (cinque l'élite) | vampata; scoppiettio quando si spacca |
| Piromante | meteora: sasso di basalto con le crepe di lava e la coda di fuoco | come oggi dal cielo; a terra al cerchio rosso si aggiungono l'anello di rune del piromante che gira e l'ombra che cresce | fischio che scende, crepitio all'impatto |
| Negromante | teschietto fantasma con gli occhi verdi e la fiamma verde dietro, batte i denti | ti segue piano (gira al massimo di 1,25 rad/s per 1,8 s, poi dritto): l'unico colpo che insegue | lamento basso e denti |
| Nano bombarolo | bomba di ferro col tappo d'ottone e la miccia che sfavilla | come oggi (a pallonetto, poi la miccia) | la miccia sfrigola a terra |
| Rana | sputo: palla di muco verde con le bollicine e le goccioline dietro | va verso di te a quattro balzi e fa male solo quando tocca terra (l'ombra dice dove; in aria passa sopra i massi), poi si spiaccica | «plop», piccoli «blip» |
| Spirito della neve | fiocco di neve a sei punte | la corona gira mentre si allarga, a spirale (il verso cambia da spirito a spirito) | campanelli di vetro |
| Sentinella di ghiaccio | le sue schegge (cristallo a due facce che gira) | lancia le schegge che le girano intorno, una ogni 0,15 s, dal punto dove sono; ricrescono in 1,4 s e intanto è scoperta (senza schegge tira dal corpo) | ghiaccio e fruscio |
| Fiore occhio | petali taglienti rosa che girano | quelli di lato curvano e si chiudono dove eri tu, poi si riaprono | «fwip» e campanellino |
| Occhio d'ombra | lo sguardo: nell'avviso corrono occhietti, poi il raggio con i bordi viola scuro, il cuore bianco e le pupille a fessura | come oggi | ronzio che sale, «vwoom» |
| Burattino d'ombra | spillo d'oro col perlina e il filo d'oro | a zig zag come un punto da cucito (8 px), un po' più svelto (145 px/s) | «tic» e cerniera |

## I 13 boss rifatti

Avevano quasi tutti già un colpo disegnato apposta. Ora ognuno ha il suo suono e, dove due boss sparavano allo stesso modo (l'anello
tutto intorno: Golem, Yeti, Strega, Idra, Burattinaio, Piovra, Fenice, Salamandra), il suo modo:

| Boss | Cosa cambia |
|---|---|
| Golem | le schegge roventi (fase 2, dopo lo Schianto e a ogni rimbalzo della Valanga) sono pesanti: rallentano e cadono a terra dopo 130 px con un po' di polvere e due braci; suono di pietra |
| Salamandra | resta il suo modo (i tre ventagli sfalsati dalla bocca); le palle di magma sfrigolano come lava |
| Re Rospo | resta tutto (bolle con la lucciola, il suo «BUUURP») |
| Yeti | le schegge di ghiaccio pattinano e rimbalzano una volta sui muri e sui blocchi di ghiaccio, con un «tin» |
| Strega | la spirale di spine resta; i semi dell'anello partono al 38% della velocità e accelerano in un secondo, come se germogliassero; suoni di legno e di seme |
| Fabbro | non spara colpi (il maglio sulla catena è già suo) |
| Idra | l'anello di 16 gocce della fase 2 esce in tre ondate, una per testa (sinistra, centro, destra, a 0,13 s); sputo velenoso |
| Regina | resta tutto (lance, pilastri, i suoi suoni di vetro) |
| Mimic | resta tutto (le monete) |
| Burattinaio | le sfere d'ombra dell'anello (quando cade dall'alto) diventano rombi d'Arlecchino del suo costume, viola e cremisi col bordo d'oro (magenta nella fase 2), appesi ai fili d'oro: vanno fuori (circa 130 px), si fermano 0,3 s coi fili tesi e tornano da lui; campanellini e legno |
| Fenice | resta il suo modo (le piume nelle corsie che si piantano nei muri, le schegge della Rinascita); fruscio di fuoco |
| Piovra | le bolle diventano bolle d'inchiostro (scure e lucide, riflessi petrolio e magenta, il ricciolo dentro); la loro danza resta; «blub» |
| Cervo | l'anello della seconda Zoccolata usa le sue schegge di cristallo d'aurora (prima il ghiaccio di tutti); campanelle d'aurora |

## Misure

- Disegno di un colpo (computer di prova, senza scheda grafica, 40 colpi alla volta con la tela fatta finire): la palla rossa di oggi 15–27
  µs, la freccia 8; i colpi nuovi 2–40 µs (le cose copiate dalle piccole tele 2–9 µs; fiamme, archi e fiammelle disegnati dal vivo 20–40).
- Difficoltà dei nemici: danni e cadenze uguali. Più facili: la sentinella (scoperta 1,4 s dopo ogni lancio), il fiore occhio (i petali
  si chiudono in un punto: un passo di lato basta). Un po' più difficili: il diavoletto (tre braci), il negromante (insegue poco). Da
  regolare giocando.
- Difficoltà dei boss rifatti coi colpi nuovi (`node tests/boss2diff.js <tipo>`, eroe fermo che tira, caso peggiore, vite perse al
  minuto, senza → con i colpi nuovi): Golem 7,55 → 6,60 (le schegge corte), Yeti 26,2 → 26,4, Burattinaio 6,6 → 6,8, Strega 2,93 → 2,92,
  Idra 6,5 → 6,7: a parte il Golem, dentro il rumore della misura.
- Tutte le mosse dei 7 boss cambiati passano coi colpi nuovi (`boss2gioco.js` con `--colpi`: Golem, Yeti, Strega, Idra, Burattinaio,
  Piovra, Cervo), nessun errore.

## Pagina e prove

- Pagina: `python3 anteprime/mk_colpi.py` → `anteprime/colpi.html` (una copia del gioco coi 13 boss rifatti e il file dei colpi; il
  pannello «Colpi»: scegli un nemico o un boss, «Colpi nuovi» / «Colpi di oggi», «Élite», «L'eroe cammina avanti e indietro», «L'eroe non
  tira», «Fase 2» per i boss). Pubblicata (l'indirizzo è in CLAUDE.md).
- `node tests/colpi.js [tipo ...]`: ogni nemico (anche l'élite) spara il suo colpo, foto `tests/cu_<tipo>.png`, i colpi di oggi con «Colpi
  di oggi», il costo del disegno.
- `node tests/colpi_moto.js`: ogni modo di sparare messo alla prova (riga di mira, frecce in fila, dardi piantati e paralleli, semi che
  rallentano, fiammelle che danzano, teschietto che segue, sputo che fa male solo a terra, spirale, schegge che partono e ricrescono,
  petali che si chiudono, palla che si spacca, zig zag, raggio, meteore, bombe) e un suono per ogni colpo.
- `node tests/colpi_boss.js [tipo ...]`: i modi nuovi dei boss, i loro suoni, 12 s di lotta per ognuno dei 13 senza errori.
- `node tests/colpi_oggi.js` (pagina `python3 anteprime/mk_colpi.py --test --senza-boss`): coi boss di oggi delle arene 9–12, che
  usano gli stessi tipi di colpo dei rifatti, non cambia niente (i loro burattini tirano lo spillo come tutti i burattini).
- `node tests/colpi_foglio.js [scala]`: il foglio `tests/cu_foglio.png`, ogni colpo in cinque direzioni ingrandito, accanto a quello di oggi
  (anche i boss).
- `python3 anteprime/mk_boss2.py <tipo> --test --colpi` mette il file dei colpi anche nella pagina di prova di un boss, così
  `node tests/boss2gioco.js <tipo>` controlla tutte le sue mosse coi colpi nuovi.

## Per metterlo nel gioco (dopo il sì di Denis)

Aggiungere `js/93-colpi-unici.js` in fondo a `src/ordine.txt`. I boss rifatti prendono i loro modi solo quando i loro cervelli entrano
nel gioco (fino ad allora `CUB` non trova i loro tipi nuovi: i boss di oggi restano come sono, tranne il suono di 'crystal' del Cervo di
oggi, che prende quello d'aurora).
