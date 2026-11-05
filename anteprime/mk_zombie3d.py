# Costruisce anteprime/zombie3d.html: i nostri zombie in 3D vero, lo zombie base (sprite/mostri3d/zombie.js), quello col corpo vero in prova
# (sprite/mostri3d/zombie_vero.js, scolpito con sprite/mostri3d/scultura.js), lo strisciante
# (sprite/mostri3d/strisciante.js) e il minatore (sprite/mostri3d/minatore.js), fatti con la cassetta sprite/mostri3d/kit3d.js e disegnati col nostro WebGL (sprite/mostri3d/mb3.js) nella
# pagina di anteprime/zombie3d.js: la scelta del mostro, le mosse, il dito che gira, «Quattro direzioni», «Prima e dopo» (sopra il nostro
# mostro di oggi, sprite/mostri3d/zombie_oggi.webp, strisciante_oggi.webp e minatore_oggi.webp, fatti da sprite/mostri3d/oggi.js). Tutto dentro un file solo.
# Uso: python3 anteprime/mk_zombie3d.py [uscita.html]. La pagina costruita non si salva su git.
import base64,json,os,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
ZOMBIE=['zombie.js','scultura.js','zombie_vero.js','strisciante.js','minatore.js']
rd=lambda *p:open(os.path.join(root,*p),encoding='utf-8').read()
def img(n):
  p=os.path.join(root,'sprite','mostri3d',n);return 'data:image/webp;base64,'+base64.b64encode(open(p,'rb').read()).decode() if os.path.exists(p) else ''
def pagina(out,libs=ZOMBIE,cfg=None,titolo='Zombie in 3D',sotto='Il nostro zombie base in 3D vero',carica='Lo zombie si sta svegliando…',rif=''):
  page=rd('anteprime','zombie3d.js').replace("'__OGGI__'","'"+img('zombie_oggi.webp')+"'").replace("'__OGGI_S__'","'"+img('strisciante_oggi.webp')+"'").replace("'__OGGI_M__'","'"+img('minatore_oggi.webp')+"'").replace("'__OGGI_V__'","'"+rif+"'").replace("'__OGGI_N__'","'"+rif+"'")
  conf='<script>window.Z3D_PAGE='+json.dumps(cfg,ensure_ascii=False)+'</script>\n' if cfg else ''
  scripts=''.join('<script>'+rd('sprite','mostri3d',f)+'</script>\n' for f in libs)
  html='''<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<title>'''+titolo+'''</title>
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
.zz{display:flex;gap:6px;margin-top:6px}.mz{display:flex;gap:6px;margin-top:7px}.mz button{font-size:13px;padding:3px 10px;border-radius:10px}
.bot{bottom:0;padding:8px 8px calc(10px + env(safe-area-inset-bottom,0px));background:linear-gradient(rgba(8,10,12,0),rgba(8,10,12,.94) 34%)}
.row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.row+.row{margin-top:7px}
#src{text-align:center;font-size:13px;opacity:.82;margin:0 6px 7px;min-height:17px;line-height:1.25}
button{font:700 14px "Baloo 2",system-ui;color:var(--tx);background:var(--bt);border:2px solid var(--ink);border-radius:12px;padding:6px 11px;box-shadow:0 3px 0 var(--ink);cursor:pointer}
#op button{font-size:12.5px;padding:4px 9px;border-radius:10px;background:#2a241e}#op button.on{background:var(--on);color:var(--on2)}
button.on{background:var(--on);color:var(--on2)}button:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
#oggi{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 100px);width:min(100%,640px);z-index:1;pointer-events:none}
#oggi.ref{left:2%;transform:none;width:min(47%,330px);border-radius:10px}
.lab{position:fixed;left:10px;z-index:2;font:400 15px "Lilita One",system-ui;text-shadow:0 2px 0 var(--ink)}
#load,#msg{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font:400 20px "Lilita One",system-ui;z-index:5;background:var(--bg)}
</style></head><body>
<div id="st"><canvas id="bk"></canvas><canvas id="cv"></canvas><canvas id="fr"></canvas></div>
<img id="oggi" hidden alt="Il nostro mostro di oggi da quattro lati">
<div class="ui top"><div><h1 id="tit">'''+titolo+'''</h1><div class="sub">'''+sotto+''' · trascina per girare</div><div class="mz" id="mz"></div><div id="ms"></div></div>
<div class="zz"><button id="zm" aria-label="Più lontano">−</button><button id="zp" aria-label="Più vicino">+</button></div></div>
<div class="ui bot"><div id="src"></div><div class="row" id="mv"></div><div class="row" id="op"></div></div>
<div id="load">'''+carica+'''</div><div id="msg" hidden></div>
<script>'''+rd('sprite','mostri3d','mb3.js')+'''</script>
<script>'''+rd('sprite','mostri3d','kit3d.js')+'''</script>
'''+scripts+conf+'''<script>'''+page+'''</script>
</body></html>'''
  open(out,'w',encoding='utf-8').write(html);print(out,len(html)//1024,'KB')
if __name__=='__main__':pagina(sys.argv[1] if len(sys.argv)>1 else os.path.join(here,'zombie3d.html'))
