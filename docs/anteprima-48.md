# Anteprima 48 (dal 14 ottobre)

Richiesta di Denis del 14 ottobre: «continua pure con le cose che mancano e lasciate a metà». Si lavora sul ramo `anteprima-48`
(partito da `anteprima`, cioè dall'anteprima 47 che Denis deve ancora approvare): il gioco sul telefono e l'app non cambiano. Elenco di
cosa mancava (dal piano maestro di 60 punti, testo completo nella trascrizione dell'11 ottobre): 4 boss nuovi (punto 5) con
animazioni, morti, barre e musiche; musiche dei boss (51); animazioni complete dei nemici (4: preparazione, morte, abilità); mappa
zombie enormemente più grande con edifici esplorabili, piano di sopra, confini, collegamenti (10, 12–15), barriere a pagamento e spawn
nuovo (16–17), finestre e recinzioni (18–19), casse 3–5 usi (20), armi a muro con munizioni (21), macchina di potenziamento (22), perk
(23), ottimizzazione della mappa (54), salvataggi in tre blocchi (55), controllo finale (57); più l'Arco del tuono rimasto sul ramo
`nuovi-oggetti`.

## Stato

| Punto | Cosa | Stato |
|---|---|---|
| 5–7 | 4 boss nuovi del terzo giro «su carta» | fatto, da far approvare a Denis (`docs/boss-nuovi.md`) |
| 51 | Musiche dei boss: entrata, tema, reazione alla morte, vittoria | fatto |
| 4 | Nemici: preparazione, morte, abilità | da fare |
| — | Arco del tuono, faretre, scia di ghiaccio (`nuovi-oggetti`) | da fare |
| 10–17, 54 | Mappa zombie grande | da fare |
| 18–23 | Finestre, recinzioni, casse, armi a muro, potenziamento, perk | da fare |
| 55, 57 | Salvataggi in tre blocchi, collaudo | da fare |

## 5–7: i 4 boss nuovi su carta

`sprite/nemici3d/boss3.js` (gruppo `boss3`): il Burattinaio d'Ombra (arena 9), la Fenice della Forgia (10), la Piovra della Palude (11), il
Cervo d'Aurora (12), ognuno con fermo, movimento, preparazione, tre o quattro attacchi, colpito, entrata e sconfitta, e la seconda fase
(`o.p2`). Pagina `python3 anteprime/mk_nemici3d.py --nuovi` → `anteprime/boss3.html`, pubblicata su
https://claude.ai/artifact/KrYogWLkw61CANfz64uzmA; fogli `node tests/boss3.js` → `tests/nb_<boss>_dir.png`, `nb_<boss>_mosse.png`.
Scheda di ogni boss in `docs/boss-nuovi.md`. Non sono nel gioco: dopo l'ok di Denis vanno fatti comportamento, entrata, morte unica
nel gioco (`BDEATH`/`BDIE`), barra (`BBFX`), anteprima dell'arena, musica.

## 51: musiche dei boss

`src/js/76-musiche-boss.js` (`BM`, `BMS`): entrando nella stanza del boss la musica dell'arena si abbassa e resta sotto («attesa» se non
ce n'era); a metà dell'entrata del boss un colpo d'orchestra suo (respiro che sale, tamburo, ottoni e coro sul primo accordo del suo
tema, il colore del mondo: campane, incudine, fuoco, acqua, ghiaccio, cristallo, monete) e il suo tema, un po' più basso; al colpo
finale la musica passa in un filtro che la chiude «sott'acqua» e cala; nel clou della morte unica l'accordo di vittoria suo, poi la
musica calma «vittoria» (dopo il Mimic torna quella di prima). Tema nuovo del Mimic (`TRACKS.mimic`). Volumi misurati: i colpi hanno il
picco a 0,34 contro 0,15 del tema. Prova `node tests/bossmusica.js`.
