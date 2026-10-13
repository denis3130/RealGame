#!/bin/bash
# Rifà gli sprite di Lumbra in pixel art dai disegni di Denis (v_front.png e v_back.png, 1254×1254, da mettere in questa cartella:
# non sono nel repository). Servono Python 3 con numpy, scipy, scikit-image e Pillow.
set -e;cd "$(dirname "$0")"
python3 mask.py v_front 1030 '[[900,1000,1066]]'        # ritaglio senza carta né ombra a terra (sotto y=1030 solo le zampe)
python3 mask.py v_back 1012 '[[290,505,1040]]'
python3 smoke.py v_front '[[760,470],[860,740],[950,1010]]'   # le code di fumo: radice (attaccata al corpo) e punta
python3 smoke.py v_back '[[586,540],[546,740],[506,950]]'
python3 anim.py v_front 24 '{"ycut":70}'                   # 24 fotogrammi: fumo che ondeggia, respiro, battito delle palpebre
python3 anim.py v_back 24 '{"ycut":62,"blink":[]}'
cp v_front_idle.png lumbra_davanti.png;cp v_back_idle.png lumbra_dietro.png;cp v_front_idle.json lumbra_davanti.json;cp v_back_idle.json lumbra_dietro.json
echo "fatto: lumbra_davanti.png, lumbra_dietro.png (poi python3 ../../../anteprime/mk_lumbra_lotta.py)"
