# Builds anteprime/epico.html: the game with the floor life in the joints and more weight in battle (epico.js),
# plus a small panel (Prima/Dopo, chapter, infinite life). The real game (index.html) is not touched.
import pathlib
here=pathlib.Path(__file__).parent
s=(here.parent/'index.html').read_text()
patch=(here/'epico.js').read_text()
panel=r"""
// ---------- preview panel ----------
SAVE.introSeen=1;SAVE.runs=Math.max(SAVE.runs||0,9);SAVE.handSeen=1;
{const st=document.createElement('style');st.textContent=`#ebar{position:fixed;left:0;bottom:calc(4px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;flex-wrap:wrap;gap:5px;padding:4px 6px;background:rgba(10,6,4,.65);border-radius:0 10px 0 0;font-family:"Lilita One",sans-serif;max-width:250px}
#ebar button{border:2px solid #16120e;border-radius:7px;padding:4px 7px;font:inherit;font-size:12px;color:#fff;text-shadow:0 1px 0 #16120e;background:linear-gradient(#8a8276,#5a544c);box-shadow:0 2px 0 #16120e}
#ebar .go{background:linear-gradient(#ffe46e,#f2a400)}#ebar .tog{background:linear-gradient(#b4f57a,#4cb328)}#ebar .tog.off{background:linear-gradient(#b7c2d0,#76839a)}`;document.head.appendChild(st)}
{const bar=document.createElement('div');bar.id='ebar';bar.innerHTML='<button class="go" data-a="go">Gioca</button><button class="tog" data-a="ab">Dopo</button><button data-a="ch">Cap. 1</button><button class="tog" data-a="god">Vita ∞</button>';document.body.appendChild(bar);
  let god=true,ch=1;const TR=[0,300,700,1200];
  const go=()=>{document.querySelectorAll('#sheetScr,#arenaUpScr,#loginScr').forEach(e=>e&&(e.hidden=true));SAVE.trophies=TR[ch-1];SAVE.trBest=Math.max(SAVE.trBest||0,TR[ch-1]);SAVE.sel='c1';
    if(started){showMenu()}startRun();setTimeout(()=>{const idx=G.seq.findIndex(q=>q.c===3);if(idx>0){G.si=idx-1;nextStep()}},300)};
  const regrade=()=>{renderFloor();if(HASF&&!LOWFX){const t=document.createElement('canvas');t.width=floorCv.width;t.height=floorCv.height;const x=t.getContext('2d');x.filter='saturate(1.22) contrast(1.06)';x.drawImage(floorCv,0,0);const c=floorCv.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,floorCv.width,floorCv.height);c.drawImage(t,0,0);c.restore()}makeTufts()};
  bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();const a=b.dataset.a;
    if(a==='go')go();
    else if(a==='ab'){const on=!window.SEAMS;window.SEAMS=window.EPIC=on;b.textContent=on?'Dopo':'Prima';b.classList.toggle('off',!on);if(started&&G)regrade()}
    else if(a==='god'){god=!god;b.classList.toggle('off',!god);b.textContent=god?'Vita ∞':'Vita normale'}
    else if(a==='ch'){ch=ch%4+1;b.textContent='Cap. '+ch;go()}});
  bar.addEventListener('pointerdown',ev=>ev.stopPropagation());
  {const _p=update;update=function(dt){_p(dt);if(started&&P&&god)P.hp=P.maxhp}}
  window.__epicGo=go;window.__E=c=>eval(c)}
"""
end="newRun();applySettings();if(!playIntro(false))showMenu();requestAnimationFrame(loop);"
assert s.count(end)==1
for old,new in [
  ("const ts=34,nc=Math.ceil((R-L)/ts)","G.slabs=[];G.slabCracks=[];const ts=34,nc=Math.ceil((R-L)/ts)"),
  ("slab(L+i*ts,TOP+j*ts,w*ts,h*ts)}","slab(L+i*ts,TOP+j*ts,w*ts,h*ts);G.slabs.push([L+i*ts,TOP+j*ts,w*ts,h*ts])}"),
  ("fx.strokeStyle=icy?'rgba(60,90,130,.35)':'rgba(0,0,0,.42)';","G.slabCracks.push(pts);fx.strokeStyle=icy?'rgba(60,90,130,.35)':'rgba(0,0,0,.42)';"),
  ("  // a carved border runs round the room","  if(window.SEAMS){slabDetail();seamLife()}\n  // a carved border runs round the room"),
  ("for(let i=0;i<14;i++){const x=Math.random()<.5?rand(L,L+60):rand(R-60,R),y=rand(TOP,BOT);","if(!window.SEAMS)for(let i=0;i<14;i++){const x=Math.random()<.5?rand(L,L+60):rand(R-60,R),y=rand(TOP,BOT);"),
  ("for(let i=0;i<(V.grass||0);i++){","if(!window.SEAMS)for(let i=0;i<(V.grass||0);i++){"),
  ("for(let i=0;i<(V.flowers||0);i++){","if(!window.SEAMS)for(let i=0;i<(V.flowers||0);i++){"),
  ("else ctx.setTransform(s,0,0,s,ox+sx*s,oy+sy*s);","else{const z=1+(window.EPIC&&G.pz||0);ctx.setTransform(s*z,0,0,s*z,ox+s*VW/2*(1-z)+sx*s,oy+s*VH/2*(1-z)+sy*s)}")]:
  assert s.count(old)==1,old
  s=s.replace(old,new)
s=s.replace(end,patch+panel+end).replace('<title>','<title>Anteprima Epico · ',1)
(here/'epico.html').write_text(s)
print('ok',len(s))
