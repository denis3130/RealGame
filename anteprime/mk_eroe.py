# Builds anteprime/eroe.html: the game with Denis's hooded archer redrawn in the old hero's style and colours (eroe_stile.js),
# plus a small panel (Gioca, Nuovo/Vecchio, Direzioni, chapter, infinite life). index.html is not touched.
import pathlib,base64,json
here=pathlib.Path(__file__).parent
s=(here.parent/'index.html').read_text()
patch=(here/'eroe_stile.js').read_text()
panel=r"""
// ---------- preview panel ----------
SAVE.introSeen=1;SAVE.runs=Math.max(SAVE.runs||0,9);SAVE.handSeen=1;
{const st=document.createElement('style');st.textContent=`#ebar{position:fixed;left:0;bottom:calc(4px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;flex-wrap:wrap;gap:5px;padding:4px 6px;background:rgba(10,6,4,.65);border-radius:0 10px 0 0;font-family:"Lilita One",sans-serif;max-width:250px}
#ebar button{border:2px solid #16120e;border-radius:7px;padding:4px 7px;font:inherit;font-size:12px;color:#fff;text-shadow:0 1px 0 #16120e;background:linear-gradient(#8a8276,#5a544c);box-shadow:0 2px 0 #16120e}
#ebar .go{background:linear-gradient(#ffe46e,#f2a400)}#ebar .tog{background:linear-gradient(#b4f57a,#4cb328)}#ebar .tog.off{background:linear-gradient(#b7c2d0,#76839a)}`;document.head.appendChild(st)}
{const bar=document.createElement('div');bar.id='ebar';bar.innerHTML='<button class="go" data-a="go">Gioca</button><button class="tog" data-a="ab">Nuovo</button><button data-a="dv">Direzioni</button><button data-a="ch">Cap. 1</button><button class="tog" data-a="god">Vita ∞</button>';document.body.appendChild(bar);
  let god=true,ch=1;const TR=[0,300,700,1200];
  const go=()=>{document.querySelectorAll('#sheetScr,#arenaUpScr,#loginScr').forEach(e=>e&&(e.hidden=true));SAVE.trophies=TR[ch-1];SAVE.trBest=Math.max(SAVE.trBest||0,TR[ch-1]);SAVE.sel='c1';SAVE.hero='arciere';
    if(started){showMenu()}startRun();setTimeout(()=>{const idx=G.seq.findIndex(q=>q.c===3);if(idx>0){G.si=idx-1;nextStep()}},300)};
  bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();const a=b.dataset.a;
    if(a==='go')go();
    else if(a==='ab'){window.NEWHERO=!window.NEWHERO;b.textContent=window.NEWHERO?'Nuovo':'Vecchio';b.classList.toggle('off',!window.NEWHERO)}
    else if(a==='dv'){dv.hidden=!dv.hidden;if(!dv.hidden)requestAnimationFrame(drawDirs)}
    else if(a==='god'){god=!god;b.classList.toggle('off',!god);b.textContent=god?'Vita ∞':'Vita normale'}
    else if(a==='ch'){ch=ch%4+1;b.textContent='Cap. '+ch;go()}});
  bar.addEventListener('pointerdown',ev=>ev.stopPropagation());
  // the eight directions side by side, standing and walking
  const dv=document.createElement('canvas');dv.width=760;dv.height=430;dv.hidden=true;dv.style.cssText='position:fixed;left:0;right:0;top:70px;width:100%;z-index:9998;background:#2a241d;border-top:3px solid #16120e;border-bottom:3px solid #16120e';document.body.appendChild(dv);
  dv.addEventListener('pointerdown',ev=>{ev.stopPropagation();dv.hidden=true});
  const DA=[[Math.PI/2,'Davanti'],[Math.PI/4,'↘'],[0,'Lato →'],[-Math.PI/4,'↗'],[-Math.PI/2,'Dietro'],[-Math.PI*.75,'↖'],[Math.PI,'← Lato'],[Math.PI*.75,'↙']];
  function drawDirs(){if(dv.hidden)return;const c=dv.getContext('2d'),saved=ctx;c.setTransform(1,0,0,1,0,0);c.fillStyle='#2a241d';c.fillRect(0,0,760,430);
    c.font='16px "Lilita One",sans-serif';c.textAlign='center';c.fillStyle='#ffd84a';c.fillText('Fermo',380,22);c.fillText('Cammina',380,232);
    ctx=c;try{for(let r=0;r<2;r++)DA.forEach(([a,n],k)=>{c.setTransform(2.4,0,0,2.4,48+k*95,150+r*210);drawRig(0,0,a,(G.t||0)*10,r===1,P.style||HERO,{});c.setTransform(1,0,0,1,0,0);c.fillStyle='#d8ccb6';c.font='13px "Lilita One",sans-serif';c.fillText(n,48+k*95,195+r*210)})}finally{ctx=saved}
    requestAnimationFrame(drawDirs)}
  {const _p=update;update=function(dt){_p(dt);if(started&&P&&god)P.hp=P.maxhp}}
  window.__E=c=>eval(c)}
"""
end="newRun();applySettings();if(!playIntro(false))showMenu();requestAnimationFrame(loop);"
assert s.count(end)==1
s=s.replace(end,patch+panel+end).replace('<title>','<title>Anteprima Eroe · ',1)
(here/'eroe.html').write_text(s)
print('ok',len(s))
