#!/bin/bash
# Rifà gli sprite del primo Niumon dal foglio di Denis (da mettere in questa cartella come foglio.png: non è nel repository).
# Servono Python 3 con numpy, scipy, scikit-image, matplotlib e Pillow.
set -e;cd "$(dirname "$0")"
python3 ritaglia.py foglio.png
for p in "front 520" "back 525" "left 520" "right 520" "idle 285" "walk 280" "attack 270" "hit 280";do set -- $p;python3 mask2.py $1 $2;done
python3 mk_sprites.py                       # lotta e mappa (pose del foglio)
python3 fixeyes.py                          # occhi puliti: lotta (disegnati con 3 numeri) e mappa (a mano)
# le diagonali costruite: tre quarti davanti (testa di «idle» sul corpo di lato) e tre quarti dietro (lato con la faccia girata)
python3 collage.py sw '{"hp":[[0,160],[30,92],[150,80],[250,105],[262,190],[250,262],[228,300],[150,312],[60,318],[0,300]],"sp":[[8,140],[38,58],[88,22],[150,24],[205,60],[245,100],[262,160],[250,230],[205,282],[150,300],[112,306],[48,296],[12,232]],"at":[132,236],"scale":1.18,"narrow":0.82,"feather":14}'
python3 turnaway.py
python3 -c "
import mk_sprites as M
M.EYES['sw']=[];M.EYES['nw']=[]
M.SETS={'dir':{'front':5.5,'left':5.5,'back':5.5,'right':5.5,'sw':5.5,'nw':5.5},'dmap':{'front':9.5,'left':9.5,'back':9.5,'right':9.5,'sw':9.5,'nw':9.5}}
for s,P in M.SETS.items():
  for n,k in P.items():M.make(n,k,s)"
python3 eyes_dir.py;python3 eyes_dmap.py
for n in front sw left nw back right;do python3 anim2.py spr_${n}_dmap_e 8 '{"cut":50,"amp":1.2,"fps":6}';done
python3 anim2.py spr_front_dir_e 16 '{"cut":86,"blink":[12,13],"eyes":[[[17.6,54.6],[13.2,47.6],2.1],[[28.4,54.6],[32.8,47.6],2.1]]}'
python3 anim2.py spr_sw_dir_e 16 '{"cut":84,"blink":[12,13],"eyes":[[[17.2,52.6],[21.4,46.6],1.8],[[10.4,53.4],[7.0,49.6],1.25]]}'
python3 anim2.py spr_left_dir_e 16 '{"cut":84,"blink":[12,13],"eyes":[[[9.2,55.0],[13.6,47.4],2.2]]}'
python3 anim2.py spr_right_dir_e 16 '{"cut":80,"blink":[12,13],"eyes":[[[68.0,48.6],[65.4,40.8],1.9]]}'
python3 anim2.py spr_nw_dir_e 16 '{"cut":84}';python3 anim2.py spr_back_dir_e 16 '{"cut":84,"front":1}'
python3 anim2.py spr_idle_battle_e 16 '{"cut":66,"blink":[12,13],"eyes":[[[26.8,60.2],[34.0,48.8],2.7],[[14.8,60.5],[10.2,50.5],2.0]]}'
python3 anim2.py spr_back_battle 16 '{"cut":74,"front":1}'
echo "fatto: i fogli *_idle.png e *_idle.json (copiarli in .. e in ../direzioni con i nomi del LEGGIMI)"
