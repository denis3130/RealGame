# Sprite di Mossbound

Materiale grafico dell'equipaggiamento. Sul branch `nuovi-oggetti` le icone sono già dentro `index.html` (`ICON_ART`, usato da `itemSVG`) e i fotogrammi dell'eroe escono dal codice di quel branch.

## `oggetti/` — icone dei 17 oggetti (versione 2)

- Un file per oggetto, con lo stesso `id` usato in `ITEMS` dentro `index.html` (per esempio `arco_fenice.svg`).
- `.svg`: disegno originale, `viewBox="0 0 48 48"`, come le icone di oggi (`itemSVG(it)`). Il contenuto del tag `<svg>` si può incollare al posto del disegno generato da `itemSVG`.
- `.png`: lo stesso disegno a 256 × 256 px, sfondo trasparente.
- `_anteprima.png`: tutti gli oggetti con le cornici della rarità e alla grandezza vera del gioco (46 px).
- Stile: contorno `#1b1612`, colori presi da `tint` di ogni oggetto.

L'Arco delle spine non c'è più: al suo posto c'è l'**Arco del tuono** (`arco_tuono`, epico, le frecce richiamano fulmini con `P.light`).

## `eroe/` — fotogrammi dell'arciere con l'equipaggiamento

- Presi dal codice del branch `nuovi-oggetti`: `drawRig` con `heroStyle('arciere')`, quindi identici al gioco. L'eroe non ha più la punta sul cappuccio (`hoodTip:false`).
- 29 fogli, 12 colonne × 4 righe, caselle da 192 × 192 px, sfondo trasparente. Dettagli in `eroe/LEGGIMI.txt`.
- Equipaggiamento addosso: `bowKind` (nuovo `thunder` per l'Arco del tuono), `armorBits` (spalline di cuoio sulla Giubba, funghetto sulla Corazza di muschio), `cape`, `ringOn`, `amulet`.
