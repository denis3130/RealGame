# Mossbound · Piano maestro — FASE 1: analisi del progetto

Scritto l'11 ottobre 2026 da Claude per Denis, prima di toccare qualsiasi riga. Serve a decidere da dove si parte e a non buttare lavoro.

## 1. Da dove si parte: il problema dei rami

> **Decisione presa l'11 ottobre** (Denis: «devi fare tutto quello che ti ho descritto»): base = `lavori-in-sospeso`, nuovo ramo `piano-maestro`, dentro il codice dei mostri e delle armi di `zombie-spaventapasseri`; sorgente diviso in `src/` con `build.py`. Il resto del documento è l'analisi com'era prima della decisione.

Oggi il progetto ha **due linee di lavoro che non si sono mai riunite**, entrambe nate da `main`:

| Ramo | Cosa contiene | `index.html` |
|---|---|---|
| `main` | il gioco alla versione 41 + le icone PNG degli oggetti e i fotogrammi dell'arciere | 6.610 righe |
| `lavori-in-sospeso` | **il gioco che hai sul telefono**: versioni 42–45 (arene grandi, paesaggio fuori dall'arena, boss nuovi, menu nuovo, ruota, missioni, livello esploratore, economia, audio, animazioni, uscita dalla stanza, menu «cripta viva») | 8.183 righe (+2.071 / −498 rispetto a `main`) |
| `nuovi-oggetti` | oggetti nuovi nel gioco (Arco del tuono, icone disegnate per ogni oggetto, faretra diversa per arma, balestra uguale alla carta, scia di ghiaccio: 74 righe cambiate, «da approvare») + **i nemici zombie** (`sprite/mostri/disegno_mostri.js`, 635 righe, 6 mostri) + **le armi zombie** (`sprite/armi/disegno_armi.js`, 775 righe, 8 armi e Bara delle Sorprese) + fogli PNG/WEBP di anteprima (circa 55 MB) | 6.653 righe |
| `armi-zombie` | `nuovi-oggetti` + pagina di prova e test delle armi aggiornati | come sopra |
| `mappa-zombie` | `nuovi-oggetti` + la bozza `docs/bozza-mappa-zombie.md` (+ oggi il `.gitignore`) | come sopra |

Conseguenza: i mostri e le armi zombie stanno su un gioco **vecchio di 1.500 righe**; tutto quello che il piano chiama «il gioco» (menu col teschio, casse a 4 posti, anteprime delle arene, boss nuovi) sta su `lavori-in-sospeso`.

**Proposta:** base = `lavori-in-sospeso`. Ci porto sopra il codice dei mostri e delle armi (sono JavaScript, si incollano) e, se vuoi, le modifiche agli oggetti di `nuovi-oggetti`. I fogli PNG/WEBP non servono al gioco (sono solo anteprime): restano fuori.

## 2. Cosa c'è oggi nel gioco (versione 45)

- **Modalità**: arena a coppe (12 arene in 4 mondi: Cripta, Vulcano, Palude, Ghiacci, ripetuti su tre giri), Abisso (infinita), Sfida del giorno. **Modalità zombie: zero righe nel gioco.**
- **Partita**: 10 stanze + 3 eventi (dopo la 2ª, la 5ª e la 7ª: fontana, mercante, altare, tesoro, oro, prova del coraggio). **Boss alla stanza 5 e alla stanza 10** del mondo; nei giri 2 e 3 gli stessi boss, più forti (`bossLvl`).
- **Nemici**: 36 tipi, di cui 9 boss (Golem, Strega, Salamandra, Fabbro, Re Rospo, Idra, Yeti, Regina dei Ghiacci, Mimic). Tutti disegnati dal codice.
- **Eroi** 4 · **compagni** 3 (Muschietto, Lucciola, Draghetto) · **oggetti** 20 in 5 set · **abilità** 29 · **skin** 2 · **missioni** 22 · **traguardi** 19.
- **Casse**: 3 tipi (legno, argento, oro), 4 posti con timer + cassa gratis.
- **Audio**: tutto generato dal codice, nessun file: 19 musiche (menu, mondi, boss, trailer), 52 effetti.
- **Salvataggio**: una chiave (`cripta_save_v1`), 33 campi; nessuna separazione per modalità.
- **Test**: 36 script automatici (partite intere, menu, salvataggi, prestazioni, fogli dei personaggi).
- **Già pronto e utile per la mappa zombie**: stanze più grandi dello schermo con telecamera morbida (`BIG`, `setWorld`, `camStep`), frecce per i nemici fuori schermo, paesaggio cotto in immagini.

## 3. Sistema per sistema: cosa esiste e cosa chiede il piano

| Piano | Oggi nel codice | Cosa cambia |
|---|---|---|
| **2. Difficoltà** | vita nemici `(1+(stanza−1)·0,28)·diff`, danno `(1+(stanza−1)·0,08)·(1+(diff−1)·0,6)`; la «stanza» conta +2 per mondo; `diff` per arena: 1 ×4, poi 1,7–1,85, poi 2,9–4,3 | i moltiplicatori si **moltiplicano tra loro**: nell'arena 12 alla stanza 10 la vita è ×22 e il danno ×6,6. È da qui che nascono i «nemici spugna». Va rifatta la curva, non ritoccata |
| **4. Nemici** | 27 nemici normali con respiro, passi, stellina prima dell'attacco (`ELIFE`); nessuno ha animazioni separate di «colpito» e «morte» (si schiacciano e scoppiano) | ogni nemico: fermo, cammina, prepara, attacca, colpito, muore, abilità |
| **5. Boss per arena** | 2 boss per mondo (stanza 5 e 10), riusati nei 3 giri | 12 arene → 12 boss: 8 esistono, il Mimic resta mini-boss, **ne servono 4 nuovi** (uno per mondo nel terzo giro: Cripta delle Ombre, Forgia degli Dei, Palude Maledetta, Vetta di Mossbound). La stanza 5 non ha più il boss |
| **6–7. Animazioni boss e morte unica** | entrate dedicate, due fasi, mosse che cambiano l'arena (`BOSSES 2`); **morte generica** per tutti: rallentatore 1,5 s + esplosione (`vfxBlast`) | morte diversa per ognuno dei 12, sincronizzata con barra e musica |
| **7. Replay** | esiste: buffer di fotogrammi, `rpArm`/`rpStart`, schermata `#replayScr` | si toglie |
| **8. Barra del boss** | si frantuma in schegge (`bbShard`), uguale per tutti | varianti per boss, suono, scossa |
| **9. Anteprime arene** | sblocco (`showArenaUp`) mostra il paesaggio dell'accampamento **col teschio**; scheda dell'arena con teschio e ossa | anteprima per arena con il suo boss animato; animazione di sblocco |
| **10–24. Zombie** | niente nel gioco. Fuori: 6 mostri (zombie, strisciante, minatore, lanterna, segugio, boss Becchino) e 8 armi con suoni, ricariche, Bara; poligono di prova; bozza della mappa; schizzi degli sprite della mappa (case col tetto che sparisce, oggetti, buche) | **è un secondo gioco**: mappa, zone a pagamento, spawn, finestre e recinzioni riparabili, casse misteriose, armi al muro, potenziamento, perk, 4 armi nuove, round e cash |
| **25–30. Bustine e casse** | solo casse (3 tipi) con 4 posti; carte oggetto dentro le casse; negozio con casse e oro | bustine Classiche e Zombie (5 rarità, apertura a strappo), casse Classiche a 4 rarità + 5ª bonus ogni 5 ore, inventari separati per modalità, vestiti e creature condivisi |
| **31–37. Lucky Cards** | niente | sistema nuovo: bustine, 4+1 posti, macchinario, carte che bruciano, negozio con limite giornaliero |
| **38–41. Vestiti e creature** | 2 skin; 3 compagni (Muschietto da togliere) | outfit scuri/strappati e swag; creature nuove condivise |
| **42–45. Menu** | menu v45 + «cripta viva» (teschio in `campBg`, `drawMenuBg`, scheda arena) | via lo scheletro; due menu diversi; falò zombie; scorrimento tra modalità con mano zombie |
| **46–51. Audio** | tutto procedurale | musiche nuove (menu moderno, horror, una per boss), suoni nemici/armi/bossoli |
| **52–54. Caricamenti e prestazioni** | un file, tutto in memoria; `LOWFX` per i telefoni lenti | caricamento a pezzi, mappa disegnata solo dove si vede |
| **55. Salvataggi** | una chiave sola | tre blocchi: Classica, Zombie, condiviso; migrazione dei salvataggi vecchi |

## 4. Quattro cose da sistemare prima di iniziare

1. **Il ramo base** (punto 1). Senza questa scelta ogni riga scritta rischia di finire sul gioco sbagliato.
2. **I commit.** Oggi non posso committare senza che tu lo chieda, e il push mi viene bloccato dal controllo dei permessi. Un piano di questa misura si fa a passi: ogni passo collaudato va salvato e caricato, altrimenti quando la sessione si chiude il lavoro sparisce. Propongo un ramo di lavoro `piano-maestro`, commit e push dopo ogni passo collaudato, mai su `main` senza il tuo sì.
3. **Il file unico.** 8.200 righe oggi; con il piano saranno 20–25 mila. Propongo di dividerlo in più file (`src/…`) con uno script che li riunisce: il gioco pubblicato resta **un solo `index.html`** come adesso, i test continuano a funzionare. Era il punto 8 delle cose da fare.
4. **La misura della mappa.** «25×25» di cosa? Se sono 25×25 stanze da 360×640 vuol dire 9.000×16.000 pixel (l'arena grande di oggi è 460×820). Si fa, ma solo disegnando ciò che è a schermo e cuocendo il terreno a zone.

## 5. Decisioni vecchie che il piano ribalta (le prendo per confermate, dimmi se no)

- Via il teschio e lo scheletro ovunque: menu «cripta viva» (fatto due giorni fa su tua richiesta), scheda dell'arena, anteprime, teschio dietro il cancello, e **l'idea del boss «Bestia»** che si risveglia dal paesaggio.
- Via Muschietto. Via il replay del colpo finale.
- Resta la progressione a coppe e arene: **«La Discesa» non si fa più.**
- La ruota della fortuna resta; l'energia (30/30) non si fa.
- Regola «deve piacere anche ai bambini»: vale per la Classica; la Zombie è cupa ma senza sangue a schizzi.

## 6. Scelte che faccio io se non dici diversamente

- Audio: resta tutto generato dal codice (zero file audio, gioco in un file). Si può fare una musica da gioco mobile moderno anche così; con file veri suonerebbe meglio ma cambia l'architettura.
- I 4 boss nuovi vanno nelle arene del terzo giro, uno per mondo; prima di disegnarli ti mostro le quattro direzioni e le mosse su carta.
- Stanza 5 senza boss: diventa una stanza con due élite annunciati.
- 25×25 = stanze da 360×640.
- Le modifiche agli oggetti di `nuovi-oggetti` (Arco del tuono, icone, faretre) le porto sulla base: le avevi fatte fare, non le avevi bocciate.

## 7. Prima misura della difficoltà (giocatori automatici)

Vedi in fondo: un eroe **fermo**, con l'equipaggiamento di partenza, quanto danno prende stanza per stanza (in «vite»: 1,0 = sarebbe morto una volta). È una misura pessimista (un giocatore vero schiva), ma mostra la forma della curva tra i giri di arene.

| Arena | Vite perse in tutta la partita | Stanze peggiori |
|---|---|---|
| 1 · Cripta di Muschio | 4.3 | stanza 8 (1.7), stanza 5 (1.5), stanza 7 (0.3) |
| 2 · Cuore del Vulcano | 11.9 | stanza 8 (2.7), stanza 9 (2.2), stanza 6 (2.1) |
| 3 · Palude delle Lucciole | 9.8 | stanza 5 (2.8), stanza 8 (2.8), stanza 4 (1.5) |
| 4 · Picchi di Brina | 12.6 | stanza 9 (2.2), stanza 5 (2.0), stanza 7 (1.8) |
| 5 · Cripta Risvegliata | 12.2 | stanza 6 (4.0), stanza 7 (2.3), stanza 5 (1.9) |
| 9 · Cripta delle Ombre | 44.6 | stanza 9 (14.0), stanza 8 (9.6), stanza 7 (9.1) |
| 12 · Vetta di Mossbound | 131.7 | stanza 7 (25.8), stanza 8 (25.4), stanza 6 (18.7) |

Lettura: già nella prima arena un eroe fermo perde 4 vite, quasi tutte alla stanza 5 (il Golem) e alla stanza 8; dalla seconda arena in poi si passa a 10–13 vite, e nei giri alti la cifra non è più confrontabile perché la partita si allunga per i nemici troppo resistenti. La curva da costruire: arena 1 sotto una vita per un eroe fermo, poi salita regolare.
## 8. Ordine proposto (il tuo, con i primi passi concreti)

1. **Preparazione** (una sessione): ramo `piano-maestro` da `lavori-in-sospeso`; dentro il codice dei mostri e delle armi; file diviso in `src/` + script di costruzione; test che girano sul file costruito; pubblicazione uguale a oggi.
2. **FASE 2 primo pezzo, visibile sul telefono**: curva di difficoltà nuova misurata con i bot, un boss per arena (stanza 10), via il replay, barra del boss per boss, morte unica dei boss uno alla volta (partendo dai 4 del primo giro).
3. Poi nemici, arene, anteprime, 4 boss nuovi. Ogni passo: test automatici + schermate + gioco ripubblicato per provarlo, poi commit.
4. FASI 3–10 nell'ordine che hai scritto.

Dimensione, detta onestamente: la FASE 2 da sola (36 nemici con 7 animazioni, 12 arene, 12 boss con morti e musiche uniche) è il pezzo di grafica più grosso mai fatto sul gioco; le FASI 3–4 sono un secondo gioco. Si fa un pezzo alla volta e si vede sul telefono ogni volta.
