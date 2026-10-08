# Builds anteprime/bestia.html: the game with the Beast of the Abyss (beast.js) and a small panel to fight it,
# jump to its phases and switch infinite life on and off. The real game (index.html) is not touched.
import pathlib
here=pathlib.Path(__file__).parent
s=(here.parent/'index.html').read_text()
patch=(here/'beast.js').read_text()
panel=r"""
// ---------- preview panel ----------
SAVE.introSeen=1;SAVE.runs=Math.max(SAVE.runs||0,9);SAVE.handSeen=1;
{const st=document.createElement('style');st.textContent=`#bbar{position:fixed;left:0;right:0;bottom:calc(4px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;flex-wrap:wrap;justify-content:center;gap:5px;padding:3px 6px;right:90px;background:rgba(10,6,4,.6);border-radius:0 10px 0 0;font-family:"Lilita One",sans-serif}
#bbar button{border:2px solid #16120e;border-radius:7px;padding:3px 6px;font:inherit;font-size:11px;color:#fff;text-shadow:0 1px 0 #16120e;background:linear-gradient(#8a8276,#5a544c);box-shadow:0 2px 0 #16120e}
#bbar .go{background:linear-gradient(#ffe46e,#f2a400)}#bbar .tog{background:linear-gradient(#b4f57a,#4cb328)}#bbar .tog.off{background:linear-gradient(#b7c2d0,#76839a)}
#bbar .lbl{display:none;width:100%;text-align:center;color:#ffd84a;font-size:15px;text-shadow:0 2px 0 #16120e}`;document.head.appendChild(st)}
{const bar=document.createElement('div');bar.id='bbar';bar.innerHTML='<div class="lbl">Anteprima · La Bestia dell’Abisso</div><button class="go" data-a="go">Combatti</button><button data-a="p1">Fase 2</button><button data-a="p2">Fase 3</button><button class="tog" data-a="god">Vita ∞: SÌ</button><button data-a="ch">Cap. 1</button>';document.body.appendChild(bar);
  let god=true,ch=1;
  const go=()=>{if(!started){document.querySelectorAll('#sheetScr,#arenaUpScr,#loginScr').forEach(e=>e&&(e.hidden=true));startRun();setTimeout(()=>{G.chapter=ch;G.room=3;startBeast()},500)}else{G.chapter=ch;G.room=3;P.hp=P.maxhp;startBeast()}};
  bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();const a=b.dataset.a;
    if(a==='go')go();
    else if(a==='p1'||a==='p2'){const e=G&&G.enemies&&G.enemies.find(e=>e.type==='beast');if(!e){go();setTimeout(()=>{const e2=G.enemies.find(e=>e.type==='beast');if(e2){e2.intro=0;e2.iT=99;e2.hp=e2.max*(a==='p1'?.6:.3)}},900)}else{e.intro=0;e.iT=99;e.hp=e.max*(a==='p1'?.6:.3)}}
    else if(a==='god'){god=!god;b.textContent='Vita ∞: '+(god?'SÌ':'NO');b.classList.toggle('off',!god)}
    else if(a==='ch'){ch=ch%4+1;b.textContent='Cap. '+ch;if(started&&G.enemies.some(e=>e.type==='beast'))go()}});
  bar.addEventListener('pointerdown',ev=>ev.stopPropagation());
  {const _p=update;update=function(dt){_p(dt);if(started&&P&&god)P.hp=P.maxhp}}
  window.__beastGo=go}
"""
end="newRun();applySettings();if(!playIntro(false))showMenu();requestAnimationFrame(loop);"
assert s.count(end)==1
# backdrop without ribs / skull while the beast is awake; vignette and fade follow a zoomed camera
for old,new in [("  for(let y=TOP+20,i=0;y<AH-30;y+=104,i++)for(const sd of [-1,1]){","  if(!G.bdNoRibs)for(let y=TOP+20,i=0;y<AH-30;y+=104,i++)for(const sd of [-1,1]){"),
  ("  {const cx=AW/2,cy=6;","  if(!G.bdNoSkull){const cx=AW/2,cy=6;"),
  ("key=kind+W+'x'+H+SC","key=kind+W+'x'+H+SC+(G.bdNoRibs?'r':'')+(G.bdNoSkull?'s':'')"),
  ("{const ex=ox/s+2,ey=oy/s+2;ctx.drawImage(VIG,vx-ex,vy-ey,VW+ex*2,VH+ey*2)}","{const z=G.cam?G.cam.z:1,cx=G.cam?G.cam.x-VW/2/z:vx,cy=G.cam?G.cam.y-VH/2/z:vy,ex=(ox/s+2)/z,ey=(oy/s+2)/z;ctx.drawImage(VIG,cx-ex,cy-ey,VW/z+ex*2,VH/z+ey*2)}")]:
  assert s.count(old)==1,old
  s=s.replace(old,new)
s=s.replace(end,patch+panel+end).replace('<title>','<title>Anteprima Bestia · ',1)
(here/'bestia.html').write_text(s)
print('ok',len(s))
