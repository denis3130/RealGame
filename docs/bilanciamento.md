# Bilanciamento misurato (6 novembre)

Denis, alla domanda «cosa miglioreresti nel gioco?»: «Bilanciamento misurato». Qui le misure con i giocatori automatici: i sette eroi
nelle arene a stanze (1 Golem, 4 Yeti, 7 Idra, 10 Fenice), due partite ciascuno, stesso equipaggiamento (arco e giubba al livello 3),
stessa carta presa a caso a ogni livello, la Super usata in ogni stanza. Niente nel gioco cambia senza il sì di Denis.

## Come si misura

- Il giocatore automatico (copia di `tests/run.js` nella cartella di lavoro, `misura2.js`): sta fermo e tira come chi gioca ad Archero;
  se per 1,5 s nessun nemico perde vita cammina 0,6 s verso il più vicino (con la levetta del gioco, quindi muri e rocce contano; di lato
  se non si è mosso). Non schiva. È invincibile, ma ogni punto di vita perso si conta: **vite perse** = vita persa / vita massima.
  Un nemico si uccide a forza solo se per 20 s nessuno perde vita (il boss dopo 60 s): nelle 56 partite è successo 0 volte.
- Il primo giro, con l'eroe sempre fermo, non andava bene per confrontare gli eroi: l'Alchimista è rimasto bloccato 19 minuti nella
  stanza 7 dell'arena 1 (le fiale arrivano a ~490 px, le frecce a ~780: il negromante lontano evocava scheletri all'infinito), e a 14 s
  di stanza il giocatore uccideva a forza anche i boss.
- Chi gioca davvero schiva: le vite perse vere sono molte meno. I numeri servono per confrontare eroi e arene tra loro. Velocità e
  scatto (Cacciatrice, Ninja) qui non contano, perché il giocatore automatico non schiva.

## Gli eroi (media di due partite)

| eroe | arena 1 | arena 4 | arena 7 | arena 10 | vite rispetto all'Arciere | tempo rispetto all'Arciere |
|---|---|---|---|---|---|---|
| Arciere | 1,3 | 16,3 | 10,1 | 20,1 | ×1,00 | ×1,00 |
| Cacciatrice | 3,4 | 14,1 | 15,8 | 29,1 | ×1,62 | ×1,13 |
| Balestriere | 2,0 | 10,6 | 10,4 | 19,0 | ×1,04 | ×1,08 |
| Druida | 1,7 | 6,9 | 13,1 | 7,3 | ×0,85 | ×0,98 |
| Bardo | 3,2 | 10,6 | 16,9 | 24,0 | ×1,50 | ×1,18 |
| Alchimista | 2,8 | 9,6 | 14,0 | 17,5 | ×1,25 | ×1,10 |
| Ninja | 3,8 | 21,7 | 26,2 | 31,1 | ×2,10 | ×1,36 |

(vite perse in tutta la partita; tutte le 56 partite vinte, nessun errore nella pagina)

- **Ninja**: il più debole in tutte e quattro le arene, e di molto: ci mette il 36% in più a ripulire le stanze (attacco ×0,76 con
  cadenza ×1,1: per un nemico solo fa l'84% dell'Arciere, e le due stelline di lato a 0,4 colpiscono poco) e con la vita ×0,8 perde il
  doppio.
- **Druida**: il più forte (vita e attacco ×1,2, rigenerazione): va bene, è quello che costa di più (12.000).
- **Bardo**: un po' sotto (attacco ×0,92).
- **Cacciatrice**: fragile come deve essere (vita ×0,8); la sua velocità qui non si vede.
- **Alchimista**: un po' sotto; le fiale arrivano a ~490 px, nelle arene grandi (460×820) deve avvicinarsi.
- **Balestriere** e **Arciere** si equivalgono.

## Le arene (media di tutti gli eroi)

| arena | vite perse | stanze 1–9 | boss | secondi col boss | tempo di battaglia |
|---|---|---|---|---|---|
| 1 Cripta di Muschio (Golem) | 2,6 | 1,8 | 0,8 | 8 | 81 s |
| 4 Picchi di Brina (Yeti) | 12,8 | 8,4 | 4,4 | 16 | 148 s |
| 7 Palude Avvelenata (Idra) | 15,2 | 11,8 | 3,4 | 43 | 196 s |
| 10 Forgia degli Dei (Fenice) | 21,1 | 14,5 | 6,7 | 61 | 193 s |

- La prima arena è gentile come deve essere (vita all'85% e danno al 78%); il salto vero è dall'1 al 4 (×5), poi la curva sale piano.
- La stanza più cara è sempre la 5, quella dei Campioni (2,0 / 2,5 / 3,3 vite), come voluto.
- Lo **Yeti** è il boss più duro al secondo: 4,4 vite in 16 s, contro 0,8 in 8 s del Golem e 3,4 in 43 s dell'Idra. Quasi tutto è contatto
  (25 a tocco): con l'eroe fermo gli sta addosso (lo dicevano già le misure dello Yeti rifatto in `docs/boss-classici.md`).
- Il Golem muore in 8 s: con la Super e l'equipaggiamento al livello 3 il primo boss dura poco.
