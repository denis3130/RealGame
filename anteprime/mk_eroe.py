# Builds anteprime/eroe.html: the game with Denis's hooded archer (his 8 poses, cut by cut_eroe.py)
# in place of the drawn hero, plus a small panel (Gioca, Prima/Dopo, chapter, infinite life). index.html is not touched.
import pathlib,base64,json
here=pathlib.Path(__file__).parent
s=(here.parent/'index.html').read_text()
meta=json.loads((here/'eroe_sprite'/'meta.json').read_text())
srcs=['data:image/png;base64,'+base64.b64encode((here/'eroe_sprite'/f'd{i}.png').read_bytes()).decode() for i in range(8)]
patch='const HSPR_SRC='+json.dumps(srcs)+';const HSPR_META='+json.dumps(meta)+';\n'+(here/'eroe_sprite.js').read_text()
panel=r"""
// ---------- preview panel ----------
SAVE.introSeen=1;SAVE.runs=Math.max(SAVE.runs||0,9);SAVE.handSeen=1;
{const st=document.createElement('style');st.textContent=`#ebar{position:fixed;left:0;bottom:calc(4px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;flex-wrap:wrap;gap:5px;padding:4px 6px;background:rgba(10,6,4,.65);border-radius:0 10px 0 0;font-family:"Lilita One",sans-serif;max-width:250px}
#ebar button{border:2px solid #16120e;border-radius:7px;padding:4px 7px;font:inherit;font-size:12px;color:#fff;text-shadow:0 1px 0 #16120e;background:linear-gradient(#8a8276,#5a544c);box-shadow:0 2px 0 #16120e}
#ebar .go{background:linear-gradient(#ffe46e,#f2a400)}#ebar .tog{background:linear-gradient(#b4f57a,#4cb328)}#ebar .tog.off{background:linear-gradient(#b7c2d0,#76839a)}`;document.head.appendChild(st)}
{const bar=document.createElement('div');bar.id='ebar';bar.innerHTML='<button class="go" data-a="go">Gioca</button><button class="tog" data-a="ab">Nuovo</button><button data-a="ch">Cap. 1</button><button class="tog" data-a="god">Vita ∞</button>';document.body.appendChild(bar);
  let god=true,ch=1;const TR=[0,300,700,1200];
  const go=()=>{document.querySelectorAll('#sheetScr,#arenaUpScr,#loginScr').forEach(e=>e&&(e.hidden=true));SAVE.trophies=TR[ch-1];SAVE.trBest=Math.max(SAVE.trBest||0,TR[ch-1]);SAVE.sel='c1';SAVE.hero='arciere';
    if(started){showMenu()}startRun();setTimeout(()=>{const idx=G.seq.findIndex(q=>q.c===3);if(idx>0){G.si=idx-1;nextStep()}},300)};
  bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();const a=b.dataset.a;
    if(a==='go')go();
    else if(a==='ab'){window.NEWHERO=!window.NEWHERO;b.textContent=window.NEWHERO?'Nuovo':'Vecchio';b.classList.toggle('off',!window.NEWHERO)}
    else if(a==='god'){god=!god;b.classList.toggle('off',!god);b.textContent=god?'Vita ∞':'Vita normale'}
    else if(a==='ch'){ch=ch%4+1;b.textContent='Cap. '+ch;go()}});
  bar.addEventListener('pointerdown',ev=>ev.stopPropagation());
  {const _p=update;update=function(dt){_p(dt);if(started&&P&&god)P.hp=P.maxhp}}
  window.__E=c=>eval(c)}
"""
end="newRun();applySettings();if(!playIntro(false))showMenu();requestAnimationFrame(loop);"
assert s.count(end)==1
s=s.replace(end,patch+panel+end).replace('<title>','<title>Anteprima Eroe · ',1)
(here/'eroe.html').write_text(s)
print('ok',len(s))
