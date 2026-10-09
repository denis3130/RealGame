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
- Equipaggiamento addosso: `bowKind` (nuovo `thunder` per l'Arco del tuono), `armorBits` (funghetto sulla Corazza di muschio), `cape`, `ringOn`, `amulet`. La Giubba di cuoio è il vestito base con i colori del cuoio (`tint.a`, `tint.b`, `tint.belt`).
- Faretra sulla schiena, in diagonale come vuole Denis: `quiver(x,y,rot,S)` con lo stile preso da `QUIV[S.wk]`. Ogni arma ha la sua faretra e le sue munizioni:
  - Arco di frassino: faretra di cuoio, frecce di legno con piume rosse
  - Arco ricurvo: faretra rosso scuro con lacci verdi, frecce con impennaggio a foglia (anche in volo)
  - Balestra leggera: astuccio d'acciaio più corto, dardi con alette blu
  - Arco del tuono: faretra blu con fulmine giallo, frecce con piume azzurre e punta a fulmine (in volo), scintille
  - Arco della fenice: faretra rossa e oro, frecce con piume di fuoco e bagliore
- Anello del gelo eterno: alone di ghiaccio leggero ai piedi (`ringAura`) e scia di ghiaccio che si scioglie quando l'eroe cammina (`frostTick`, `drawFrostTrail`, lista `G.frost`). La scia è sul pavimento, quindi non è nei fogli dei fotogrammi.
