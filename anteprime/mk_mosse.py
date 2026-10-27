# Pagina delle mosse leggendarie (Denis, 26 ottobre, sull'albero delle abilità: «Mosse più spettacolari», ogni mossa leggendaria con
# luci e suoni tutti suoi, più grandi da vedere). Una copia del gioco con la Classica nuova (94, 95 e 96, come mk_classica.py; se sono già
# nel gioco, il gioco com'è) e un pannello: scegli un'abilità e una delle sue due mosse leggendarie e la vedi in una stanza vera, coi nemici
# che tornano sempre, senza dover comprare l'albero. La stanza è quella del bottone «Prova» dell'albero (trTryStart in 96), qui senza fine:
# l'eroe non muore e, per le mosse che lo chiedono, la stanza lo fa colpire, scattare, correre, bere la pozione o stare con poca salute.
# «Rifai» la fa ripartire subito. Il salvataggio della pagina non cambia.
# Uso: python3 anteprime/mk_mosse.py [--test] [--build]
#   --test   la pagina per le prove (tests/mosse_test.html, con window.__E come tests/test.html)
#   --build  prima ricostruisce index.html (python3 build.py)
# Uscita: anteprime/mosse.html (con --test tests/mosse_test.html).
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
A=sys.argv[1:];test='--test' in A
if '--build' in A:subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
js=[open(os.path.join(root,'src','js',f),encoding='utf-8').read() for f in ('94-classica-nuova.js','95-ostacoli-3d.js','96-albero-abilita.js')]
if js[0][:300] in s:js=[]   # già nel gioco: si aggiunge solo il pannello
seed="""<script>try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:1500,gems:60,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,
starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))}catch(e){}</script>"""
assert '<title>Mossbound</title>' in s
s=s.replace('<title>Mossbound</title>','<title>Mosse leggendarie</title>'+seed,1)
panel=r"""
// ===================================================================== MOSSE LEGGENDARIE: il pannello della pagina (solo in questa pagina)
// La stanza è quella del bottone «Prova» dell'albero (trTryStart in src/js/96-albero-abilita.js, sezione 6), qui senza fine (loop).
(()=>{const MV={open:false,was:null,cur:null,first:true};window.MV=MV;
  const css=document.createElement('style');css.textContent=`#mvBtn{position:fixed;left:6px;top:46%;z-index:60;width:54px;height:54px;border-radius:50%;border:2px solid #1b1612;background:#ffd24a;color:#1b1612;
    font:800 11px/1.05 system-ui,sans-serif;box-shadow:0 3px 0 #1b1612,0 6px 14px rgba(0,0,0,.4);cursor:pointer}
  #mvRe{position:fixed;right:8px;top:46%;z-index:60;padding:10px 12px;border-radius:14px;border:2px solid #1b1612;background:#b9a4ff;color:#1b1612;font:800 13px system-ui,sans-serif;box-shadow:0 3px 0 #1b1612;cursor:pointer}
  #mvPan{position:fixed;inset:0;z-index:61;background:rgba(9,7,20,.82);display:flex;align-items:center;justify-content:center;padding:12px}
  #mvPan .w{width:min(420px,100%);max-height:94vh;overflow:auto;background:linear-gradient(#2b2056,#171233);border:3px solid #120f22;border-radius:18px;padding:14px;color:#efe9ff;font:500 14px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.6)}
  #mvPan h2{margin:0 0 4px;font:800 20px/1.2 system-ui,sans-serif;color:#ffe9a8}#mvPan h3{margin:14px 0 6px;font:800 12px/1.2 system-ui,sans-serif;color:#cfc4ef;letter-spacing:.08em;text-transform:uppercase}
  #mvPan p{margin:0 0 8px;color:#d9d0f2;font-size:13px}
  #mvPan .ab{margin:0 0 8px;padding:8px;border-radius:14px;background:rgba(10,8,24,.45);border:1px solid rgba(var(--c),.45)}
  #mvPan .ab b{display:flex;align-items:center;gap:8px;font:800 15px/1.2 system-ui,sans-serif;color:#fff}#mvPan .ab b svg{width:26px;height:26px;flex:none}
  #mvPan .two{display:flex;gap:6px;margin-top:6px}#mvPan .two button{flex:1;min-width:0;padding:8px 8px 9px;border-radius:11px;border:2px solid #120f22;background:rgba(var(--c),.22);color:#fff;
    font:700 13px/1.2 system-ui,sans-serif;text-align:left;cursor:pointer}#mvPan .two button small{display:block;margin-top:3px;font:500 11.5px/1.3 system-ui,sans-serif;color:#ddd4f6}
  #mvPan .two button.on{background:rgb(var(--c));color:#1b1612}#mvPan .two button.on small{color:#2a2240}
  #mvPan .x{margin-top:8px;width:100%;padding:10px;border-radius:12px;border:2px solid #120f22;background:#4a3f74;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer}
  #mvLab{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 58px);z-index:59;width:max-content;max-width:min(360px,92vw);padding:6px 12px;border-radius:12px;background:rgba(14,11,30,.78);
    color:#fff6d8;font:800 14px/1.2 system-ui,sans-serif;text-align:center;pointer-events:none;border:1px solid rgba(var(--c),.6)}
  #mvLab small{display:block;font:500 11.5px/1.3 system-ui,sans-serif;color:#ddd4f6;margin-top:2px}#mvLab i{font-style:normal;color:rgb(var(--c))}`;
  document.head.appendChild(css);
  const btn=document.createElement('button');btn.id='mvBtn';btn.textContent='Mosse';document.body.appendChild(btn);
  const re=document.createElement('button');re.id='mvRe';re.textContent='↺ Rifai';re.hidden=true;document.body.appendChild(re);
  const lab=document.createElement('div');lab.id='mvLab';lab.hidden=true;document.body.appendChild(lab);
  const pan=document.createElement('div');pan.id='mvPan';pan.hidden=true;document.body.appendChild(pan);
  const nm=id=>{const q=SK.find(x=>x.id===id);return q?q.n:id};
  pan.innerHTML=`<div class="w"><h2>Le mosse leggendarie</h2><p>Scegli un'abilità e una delle sue due mosse leggendarie (il passo V dell'albero): la vedi in una stanza vera, coi nemici che tornano sempre. L'eroe non muore. Il gioco non cambia.</p>
    ${TR_GRP.map(([g,ids])=>`<h3>${g}</h3>`+ids.map(id=>{const D=TRD[id],V=D.s[4];return`<div class="ab" style="--c:${trRgb(D.c)}"><b><svg viewBox="0 0 40 40">${ICON[id]||''}</svg>${nm(id)}</b>
      <div class="two">${[0,1].map(b=>`<button data-id="${id}" data-b="${b}">★ ${V[b].n}<small>${V[b].d}</small></button>`).join('')}</div></div>`}).join('')).join('')}
    <button class="x" id="mvClose">Chiudi</button></div>`;
  const show=()=>{if(MV.open)return;MV.open=true;pan.hidden=false;MV.was={paused,modal};if(started)paused=true;modal=true;
    pan.querySelectorAll('.two button').forEach(q=>q.classList.toggle('on',!!MV.cur&&MV.cur.id===q.dataset.id&&MV.cur.b===+q.dataset.b))};
  const hide=()=>{if(!MV.open)return;MV.open=false;pan.hidden=true;if(MV.was){paused=MV.was.paused;modal=MV.was.modal}};
  const label=()=>{const c=MV.cur;re.hidden=!c;if(!c){lab.hidden=true;return}const D=TRD[c.id],q=D.s[4][c.b];lab.hidden=false;lab.style.setProperty('--c',trRgb(D.c));
    lab.innerHTML=`<i>★</i> ${q.n} <i>·</i> ${nm(c.id)}<small>${q.d}</small>`};
  const go=(id,b)=>{MV.cur={id,b};trTryStart(id,b,{loop:true});label()};
  window.MVgo=go;
  btn.onclick=e=>{e.stopPropagation();show()};re.onclick=e=>{e.stopPropagation();trTryAgain()};$('mvClose').onclick=e=>{e.stopPropagation();hide()};
  pan.querySelectorAll('.two button').forEach(q=>q.onclick=e=>{e.stopPropagation();hide();modal=false;paused=false;go(q.dataset.id,+q.dataset.b)});
  // tornati al menu (pausa → esci): di nuovo il pannello
  setInterval(()=>{try{const inMenu=!$('menu').hidden&&$('endScr').hidden;
      if(inMenu&&(MV.first||MV.cur)){MV.first=false;MV.cur=null;label();document.querySelectorAll('#sheetScr').forEach(q=>q.hidden=true);show()}}catch(err){}},50);
})();
"""
i=s.rfind('})();')
s=s[:i]+'\n'+'\n'.join(js)+'\n'+panel+('window.__E=s=>eval(s);' if test else '')+s[i:]
out=os.path.join(root,'tests','mosse_test.html') if test else os.path.join(here,'mosse.html')
open(out,'w',encoding='utf-8').write(s)
print(os.path.relpath(out,root),len(s)//1024,'KB')
