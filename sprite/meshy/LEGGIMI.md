# Modelli fatti con Meshy

**Ferma: Meshy non si usa** (3 novembre, Denis: «fa niente non usare meshy»). La prova si è fermata prima di generare qualcosa: in
questa sessione c'erano le istruzioni di Meshy ma non l'accesso all'account (nessun accesso salvato né chiave), i tre codici da approvare
su meshy.ai sono scaduti e nessun credito è stato speso. Quello che segue resta come era pronto, fuori dal gioco.

Prova del 3 novembre (Denis: «vorrei rifacessi per ora 1 zombie quello base rifatto su meshy con dettagli cartoon così ma fatti
meglio. fai una piccola prova creando appunto questo zombie base fatto meglio con animazioni adatte sempre su meshy, penso si dovrebbe
chiamare zombie walk attack ecc non lo so vedi tu altrimenti se non ci sono creiamo noi»). Solo una prova: niente entra nel gioco senza
il sì di Denis.

## I file

- `mb3.js` (`MB3`): legge un glTF binario (`.glb`) con lo scheletro e le mosse e lo disegna col nostro WebGL 2, senza librerie:
  `readGLB`, `model` (nodi, scheletro, pezzi, materiali, immagini, mosse), `pose` (le matrici delle ossa in un momento: una mossa, o due
  che sfumano, più i ritocchi fatti da noi, `tw` rotazioni di un osso intorno alla sua radice nello spazio del modello e `tr` spostamenti),
  `gpu`, `draw` (contorno spesso a guscio rovesciato, tre toni come la lanterna, bordo di luna, rilievo della texture di Meshy, luce degli
  occhi che si può far pulsare, lampo bianco, nebbia, `clipY` per non disegnare quello che sta sotto terra). Gira anche in Node per la
  lettura e le mosse. Il disegno della lanterna e i suoi fogli non c'entrano.
- `prepara.js`: dal personaggio con lo scheletro (`rigged.glb` di Meshy) e dalle mosse scaricate (un `.glb` per mossa, con lo stesso
  scheletro) fa un `.glb` solo con tutte le mosse dentro, prese per nome d'osso e ricampionate a 30 al secondo; nelle mosse che si
  ripetono il bacino resta sul posto (la velocità del passo resta in `extras.passo`); texture più leggere (colore JPEG 2048, rilievo JPEG
  1024, luce PNG 512; via metallo e ruvidità, che non usiamo). Uso: `node sprite/meshy/prepara.js <cartella> <uscita.glb> nome=file.glb[:fermo] …`.
- `oggi.js` → `zombie_oggi.webp`: il nostro zombie di oggi da quattro lati (davanti, tre quarti, lato, dietro), per «Prima e dopo».
- Pagina: `python3 anteprime/mk_meshy.py [modello.glb] [uscita.html]` → `anteprime/meshy.html` (codice in `anteprime/meshy_zombie.js`).
  Prova: `node tests/meshy.js [pagina.html]` (foto `tests/meshy_mosse.jpg`, `tests/meshy_prima_dopo.png`, `tests/meshy_quattro.png`).

## Meshy: cosa serve (letto il 3 novembre 2026)

- L'accesso da qui passa dalla riga di comando di Meshy (`meshy-cli` 0.4.0, `npm exec --yes --package=meshy-cli@0.4.0 -- meshy …`):
  `meshy auth login --device` dà un codice da scrivere su https://www.meshy.ai/oauth/device (dura circa 10 minuti), Denis approva dal suo
  account. Nessuna chiave in chiaro nella chat.
- Per usarlo così ci vuole un piano con l'accesso dalle API: il gratuito non ce l'ha; il Pro (20 $ al mese) dà 1.000 crediti al mese e
  i modelli restano privati.
- Prezzi (https://docs.meshy.ai/en/api/pricing): immagine → modello con texture 30 crediti; scheletro 5 (con camminata e corsa); ogni
  mossa del catalogo 3; rifare la maglia 5.
- Mosse da zombie nel catalogo pubblico di Meshy (680 mosse, `meshy animation-catalog list`): l'unica col nome è «Zombie Scream» (386).
  Le più adatte, guardate una per una: «Alert» (2, per stare fermo), «Arise» (3, si rialza da terra), «Slow Orc Walk» (119, ingobbito con
  le braccia penzoloni), «Mummy Stagger» (113, barcolla con un braccio avanti), «Attack» (4, le due mani dall'alto), «Hit Reaction»
  (178), «Dead» (8, in ginocchio e giù di faccia). Un morso o una zampata da zombie non c'è: il «Morso» lo facciamo noi sulle sue ossa
  (`layers` in `anteprime/meshy_zombie.js`), come la testa che scatta verso di te da fermo, la testa piegata troppo camminando, i
  tremori, lo sbucare da sotto terra.
