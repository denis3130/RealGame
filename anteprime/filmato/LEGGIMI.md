# Il filmato dell'intro (anteprima, non ancora nel gioco)

Un'intro di 40 secondi girata come un film, non con la vista dall'alto del gioco: il bosco di notte, la cripta, l'arco
sull'altare, l'urlo, la lastra che chiude l'uscita, il coraggio, l'arena e il guardiano di muschio e ossa, poi il logo.
Richiesta di Denis del 13-14 ottobre; stile «Classica di notte», boss solo per il filmato, arco di frassino.

- `01-motore.js`: telecamera in prospettiva, «cartoni» a profondità diverse, pavimenti e pareti proiettati, luce sull'eroe
  (`drawHero`: notte in `multiply`, luci in `screen`, bordo di luce dentro il contorno), sfocatura dello sfondo, grana,
  vignettatura, scritte (versione A frasi brevi al centro, versione B pensieri dell'eroe in basso), riproduzione, Salta, splash.
- `02-bosco.js` bosco e cripta di fuori · `03-cripta.js` dentro la cripta, uscita, lastra, corridoio · `04-arena.js` cancello,
  arena, guardiano, pavimento con il bastoncino · `05-inquadrature.js` le 26 inquadrature (tempi, telecamera, recitazione)
  e i testi · `06-suoni.js` suoni e musica (tutto con il motore audio del gioco, su bus propri; un secondo di silenzio vero a 18 s).
- L'eroe è `EROE.arciere` del gioco; le pose in più arrivano con `o.tweak(A, p)` (aggiunto a `sprite/eroe3d/disegno_eroe.js`,
  senza `tweak` niente cambia).
- Anteprima: `python3 anteprime/mk_filmato.py` → `anteprime/filmato.html` (non va su git). Indirizzo: `?intro=B`, `?trailer=1`
  (senza Salta, resta sul logo), `?shot=3.2` (parte da lì e scrive il numero), `?t=12.5`.
- Foto di prova: `python3 anteprime/filmato/foto.py <cartella> 1.5 12 37.4 --sheet foglio.png [--ver B]`.
- Prova dei suoni: `python3 anteprime/filmato/audio_prova.py <cartella>` (WAV, volume nel tempo, spettrogramma).
- Telefoni lenti: se tra un fotogramma e l'altro passano più di ~30 ms, il filmato passa da solo al modo leggero
  (luce dell'eroe a mezza risoluzione, niente sfocatura né grana). Con `LOWFX` parte già così.

Da fare quando Denis approva: metterlo nel gioco al posto del trailer di `src/js/38-trailer-intro.js` (a ogni avvio, con Salta).
