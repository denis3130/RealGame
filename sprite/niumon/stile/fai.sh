#!/bin/bash
# Lumbra «nel mio stile» (13 ottobre): i disegni di Denis ridipinti come i mostri di Mossbound (contorno scuro spesso, tre toni morbidi
# al posto della matita, occhi ripuliti, fumo viola, ombra viola), stesse forme e stesse proporzioni. È il riferimento per il 3D.
# Servono i disegni di Denis (v_sx, v_front, v_dx, v_back, ref: 1254×1254) in questa cartella: non sono nel repository.
set -e;cd "$(dirname "$0")";P=../pixel
python3 $P/mask.py v_sx 1015 '[[880,990,1062]]';python3 $P/mask.py v_dx 1015 '[[180,300,1055]]'
python3 $P/mask.py v_front 1030 '[[900,1000,1066]]';python3 $P/mask.py v_back 1012 '[[290,505,1040]]';python3 $P/mask.py ref 905 '[[1000,1130,1060]]'
python3 eyes2.py v_front 300 480 450 660 505 480 650 660;python3 eyes2.py v_sx 120 560 250 715;python3 eyes2.py v_dx 1000 580 1150 720;python3 eyes2.py ref 150 700 300 900 315 690 490 905
for v in ref v_sx v_front v_dx v_back;do python3 style.py $v;done
