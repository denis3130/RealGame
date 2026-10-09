# Sprite di Mossbound

Materiale grafico preparato fuori dal gioco. Non è ancora collegato a `index.html`.

## `oggetti/` — icone nuove dei 17 oggetti (bozza)

- Un file per oggetto, con lo stesso `id` usato in `ITEMS` dentro `index.html` (per esempio `arco_fenice.svg`).
- `.svg`: disegno originale, `viewBox="0 0 48 48"`, come le icone di oggi (`itemSVG(it)`). Il contenuto del tag `<svg>` si può incollare al posto del disegno generato da `itemSVG`.
- `.png`: lo stesso disegno a 256 × 256 px, sfondo trasparente.
- `_anteprima.png`: tutti gli oggetti con le cornici della rarità e alla grandezza vera del gioco (46 px).
- Stile: contorno `#1b1612`, colori presi da `tint` di ogni oggetto.

Da fare, se Denis approva: sostituire in `itemSVG(it)` il disegno unico per slot con un disegno per oggetto.

## `eroe/` — fotogrammi dell'arciere con l'equipaggiamento

- Presi dal codice del gioco (versione 41): `drawRig` con `heroStyle('arciere')`, quindi identici al gioco.
- 29 fogli, 12 colonne × 4 righe, caselle da 192 × 192 px, sfondo trasparente. Dettagli in `eroe/LEGGIMI.txt`.
- L'equipaggiamento addosso è quello disegnato oggi dal gioco (`armorBits`, `cape`, `bowKind`, `ringOn`, `amulet`), non quello delle icone nuove.
