# Costruisce anteprime/modello_prova.html: il modello della foto del 3 novembre («Vanguard», un soldato di Mixamo dagli esempi di three.js,
# non nostro) con le sue mosse, disegnato col nostro WebGL (sprite/mostri3d/mb3.js) nella pagina di anteprime/modello_prova.js.
# Il modello non sta su git: si scarica (https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/Soldier.glb), si prepara con
# node sprite/mostri3d/prepara.js <cartella con rigged.glb = Soldier.glb> <prova.glb> fermo=Soldier.glb#Idle cammina=Soldier.glb#Walk corre=Soldier.glb#Run
# e poi: python3 anteprime/mk_modello_prova.py <prova.glb> [uscita.html]. La pagina costruita non si salva su git.
import base64,json,os,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
glb=sys.argv[1]
out=sys.argv[2] if len(sys.argv)>2 else os.path.join(here,'modello_prova.html')
rd=lambda *p:open(os.path.join(root,*p),encoding='utf-8').read()
info_p=os.path.join(root,'sprite','mostri3d','modello_prova.json')
info=json.load(open(info_p,encoding='utf-8')) if os.path.exists(info_p) else {}
oggi_p=os.path.join(root,'sprite','meshy','zombie_oggi.webp')
oggi='data:image/webp;base64,'+base64.b64encode(open(oggi_p,'rb').read()).decode() if os.path.exists(oggi_p) else ''
page=rd('anteprime','modello_prova.js').replace("'__GLB__'","'"+base64.b64encode(open(glb,'rb').read()).decode()+"'").replace("'__OGGI__'","'"+oggi+"'").replace('__INFO__',json.dumps(info))
html='''<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<title>Modello di prova</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Lilita+One&display=swap" rel="stylesheet">
<style>
:root{--ink:#1b1612;--bg:#0b1016;--tx:#f1e4c6;--bt:#3a3027;--on:#7a5a24;--on2:#fff2c0;color-scheme:dark}
[hidden]{display:none!important}
html,body{margin:0;height:100%;background:var(--bg);color:var(--tx);font-family:"Baloo 2",system-ui,sans-serif;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
#st{position:fixed;inset:0}#st canvas{position:absolute;inset:0;width:100%;height:100%;display:block}#fr{pointer-events:none}
.ui{position:fixed;left:0;right:0;z-index:2}
.top{top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 8px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;background:linear-gradient(rgba(8,10,12,.92),rgba(8,10,12,0));pointer-events:none}
.top>*{pointer-events:auto}h1{margin:0;font:400 21px/1.1 "Lilita One",system-ui;letter-spacing:.02em;text-shadow:0 2px 0 var(--ink)}
.sub{font-size:12.5px;opacity:.75;margin-top:2px;max-width:62vw;line-height:1.25}#ms{font-size:12.5px;opacity:.8;white-space:nowrap;margin-top:3px}
.zz{display:flex;gap:6px;margin-top:6px}
.bot{bottom:0;padding:8px 8px calc(10px + env(safe-area-inset-bottom,0px));background:linear-gradient(rgba(8,10,12,0),rgba(8,10,12,.94) 34%)}
.row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.row+.row{margin-top:7px}
#src{text-align:center;font-size:13px;opacity:.82;margin:0 6px 7px;min-height:17px;line-height:1.25}
button{font:700 14px "Baloo 2",system-ui;color:var(--tx);background:var(--bt);border:2px solid var(--ink);border-radius:12px;padding:6px 11px;box-shadow:0 3px 0 var(--ink);cursor:pointer}
#op button{font-size:12.5px;padding:4px 9px;border-radius:10px;background:#2a241e}
button.on{background:var(--on);color:var(--on2)}button:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
#oggi{position:fixed;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 100px);width:100%;z-index:1;pointer-events:none}
.lab{position:fixed;left:10px;z-index:2;font:400 15px "Lilita One",system-ui;text-shadow:0 2px 0 var(--ink)}
#load,#msg{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font:400 20px "Lilita One",system-ui;z-index:5;background:var(--bg)}
</style></head><body>
<div id="st"><canvas id="bk"></canvas><canvas id="cv"></canvas><canvas id="fr"></canvas></div>
<img id="oggi" hidden alt="Il nostro zombie di oggi da quattro lati">
<div class="ui top"><div><h1 id="tit">Modello di prova</h1><div class="sub">Il soldato di prova (Mixamo), disegnato col nostro WebGL · trascina per girare</div><div id="ms"></div></div>
<div class="zz"><button id="zm" aria-label="Più lontano">−</button><button id="zp" aria-label="Più vicino">+</button></div></div>
<div class="ui bot"><div id="src"></div><div class="row" id="mv"></div><div class="row" id="op"></div></div>
<div id="load">Lo zombie si sta svegliando…</div><div id="msg" hidden></div>
<script>'''+rd('sprite','mostri3d','mb3.js')+'''</script>
<script>'''+page+'''</script>
</body></html>'''
open(out,'w',encoding='utf-8').write(html);print(out,len(html)//1024,'KB')
