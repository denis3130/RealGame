# Anteprima del Golem di Muschio rifatto («Il Colosso della Cripta», Denis 15 ottobre: «possenti, belli, fighi, che diano timore nello
# sfidarli», «migliora anche le loro abilità speciali»): una copia del gioco con il modello nuovo (sprite/nemici3d/golem2.js) e il suo
# cervello (src/js/89-golem-nuovo.js), più un pannello che porta subito nella stanza del Golem (arena 1, stanza 10) con l'eroe forte o
# invincibile. Il gioco vero non cambia finché Denis non dice sì. Ha il suo salvataggio (la pagina pubblicata è un altro indirizzo).
# Uso: python3 anteprime/mk_golem2.py [--stub] [--test]  ->  anteprime/golem2.html
#   --stub  senza il modello nuovo: un modello finto che usa il Golem di oggi per tutte le mosse (per provare il cervello)
#   --test  la pagina per le prove (tests/golem2_test.html, con window.__E come tests/test.html)
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
stub='--stub' in sys.argv
test='--test' in sys.argv
mp=os.path.join(root,'sprite','nemici3d','golem2.js')
if stub:
    model=r"""
// a pretend model for the brain's tests: the Golem of today for every move of the new one
(()=>{const map={stuck:'idle',fault:'throw',curl:'roll',unroll:'idle',beam:'throw',rage:'hit',taunt:'idle',enter:'idle',die:'hit'};
  const og=N3.golem;N3.golem2=(x,y,f,a,p,sc,o)=>og(x,y,f,map[a]||a,p,sc,o);
  N3.meta.golem2={n:'Golem di Muschio',g:'boss',sc:1,an:['idle','walk','hit','leap','stuck','throw','fault','curl','roll','unroll','beam','rage','taunt','enter','die'],
    dur:{idle:3,walk:1.2,hit:.6,leap:1.8,stuck:1,throw:1.6,fault:1.4,curl:.8,roll:1,unroll:1,beam:3.1,rage:2.8,taunt:1,enter:3.2,die:4},lab:{}};N3.order.push('golem2')})();
"""
else:
    if not os.path.exists(mp):sys.exit('manca sprite/nemici3d/golem2.js (oppure usa --stub)')
    model=open(mp,encoding='utf-8').read()
brain=open(os.path.join(root,'src','js','89-golem-nuovo.js'),encoding='utf-8').read()
seed="""<script>try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:2000,gems:50,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,
login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))}catch(e){}</script>"""
s=s.replace('<title>Mossbound</title>','<title>Golem nuovo</title>'+seed,1)
panel=r"""
// ===================================================================== GOLEM NUOVO: il pannello della prova (solo in questa pagina)
(()=>{const PB={strong:true,inv:false,ran:false,open:false,was:null};
  const css=document.createElement('style');css.textContent=`#pbBtn{position:fixed;left:6px;top:46%;z-index:60;width:46px;height:46px;border-radius:50%;border:2px solid #2a1d14;background:#6ee7b7;color:#12261c;
    font:800 11px/1.05 system-ui,sans-serif;box-shadow:0 3px 0 #2a1d14,0 6px 14px rgba(0,0,0,.4);cursor:pointer}
  #pbPan{position:fixed;inset:0;z-index:61;background:rgba(10,8,14,.78);display:flex;align-items:center;justify-content:center;padding:16px}
  #pbPan .w{width:min(360px,100%);background:#26302b;border:3px solid #111813;border-radius:18px;padding:16px;color:#eef6ea;font:500 14px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.6)}
  #pbPan h2{margin:0 0 4px;font:800 20px/1.2 system-ui,sans-serif;color:#8ff5c8}#pbPan p{margin:0 0 12px;color:#cfdccf;font-size:13px}
  #pbPan .b{display:block;width:100%;margin:0 0 8px;padding:12px;border-radius:12px;border:2px solid #111813;background:#3a4a41;color:#eef6ea;font:700 16px/1.2 system-ui,sans-serif;cursor:pointer}
  #pbPan label{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}#pbPan .x{margin-top:8px;width:100%;padding:9px;border-radius:12px;border:2px solid #111813;background:#4d5a52;color:#eef6ea;font:700 14px system-ui,sans-serif;cursor:pointer}`;
  document.head.appendChild(css);
  const btn=document.createElement('button');btn.id='pbBtn';btn.textContent='Golem';document.body.appendChild(btn);
  const pan=document.createElement('div');pan.id='pbPan';pan.hidden=true;document.body.appendChild(pan);
  pan.innerHTML=`<div class="w"><h2>Il Golem nuovo</h2><p>Il Colosso della Cripta: entri subito nella sua stanza. Guarda il cuore: la sua luce scende nel braccio o nelle gambe che stanno per colpire.</p>
    <button class="b" id="pbGo">Sfida il Golem</button>
    <label><input type="checkbox" id="pbStrong" checked> Eroe forte (più vita e più attacco, come a fine arena)</label>
    <label><input type="checkbox" id="pbInv"> Eroe invincibile</label><button class="x" id="pbClose">Chiudi</button></div>`;
  const show=()=>{if(PB.open)return;PB.open=true;pan.hidden=false;PB.was={paused,modal};if(started){paused=true}modal=true};
  const hide=()=>{if(!PB.open)return;PB.open=false;pan.hidden=true;if(PB.was){paused=PB.was.paused;modal=PB.was.modal}};
  btn.onclick=e=>{e.stopPropagation();show()};$('pbClose').onclick=e=>{e.stopPropagation();hide()};
  $('pbStrong').onchange=e=>{PB.strong=e.target.checked};$('pbInv').onchange=e=>{PB.inv=e.target.checked};
  $('pbGo').onclick=e=>{e.stopPropagation();PB.open=false;pan.hidden=true;modal=false;paused=false;
    try{document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(q=>q.hidden=true);startRun()}catch(err){}
    setTimeout(()=>{try{G.arena=0;G.chapter=ARENAS[0].ch;G.diff=ARENAS[0].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;
      if(PB.strong){P.maxhp=P.hp=Math.round(P.maxhp*4);P.atk*=3;P.aspd*=1.3}buildRoom();PB.ran=true}catch(err){console.error(err)}},350)};
  let first=true;setInterval(()=>{try{if(PB.inv&&started&&P){P.hp=P.maxhp}const inMenu=!$('menu').hidden&&$('endScr').hidden;
    if(inMenu&&(first||PB.ran)){first=false;PB.ran=false;show()}}catch(err){}},300)})();
"""
i=s.rfind('})();')
s=s[:i]+'\n'+model+'\n'+brain+'\n'+('window.__E=s=>eval(s);' if test else panel)+s[i:]
out=os.path.join(root,'tests','golem2_test.html') if test else os.path.join(here,'golem2.html');open(out,'w',encoding='utf-8').write(s)
print(out,len(s)//1024,'KB','(modello finto)' if stub else '')
