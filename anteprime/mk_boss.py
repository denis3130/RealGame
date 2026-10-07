# Builds anteprime/boss_nuovi.html: the game with the new boss details (boss2.js) and a small gallery to look at every boss,
# switching the new details on and off. The real game (index.html) is not touched.
import pathlib
here=pathlib.Path(__file__).parent
s=(here.parent/'index.html').read_text()
patch=(here/'boss2.js').read_text()
gallery=r"""
// ---------- preview gallery: pick a boss, compare before / after ----------
SAVE.introSeen=1;SAVE.runs=Math.max(SAVE.runs||0,9);
{const st=document.createElement('style');st.textContent=`#b2bar{position:fixed;left:0;right:0;bottom:calc(70px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;flex-wrap:wrap;justify-content:center;gap:5px;padding:6px 8px;background:linear-gradient(rgba(5,10,28,.0),rgba(5,10,28,.85) 30%);font-family:"Lilita One",sans-serif}
#b2bar button{border:2px solid #0b1326;border-radius:8px;padding:5px 8px;font:inherit;font-size:13px;color:#fff;text-shadow:0 1px 0 #0b1326;background:linear-gradient(#5b95e6,#2a5aa8);box-shadow:0 2px 0 #0b1326}
#b2bar button.on{background:linear-gradient(#ffe46e,#f2a400)}#b2bar .tog{background:linear-gradient(#b4f57a,#4cb328)}#b2bar .tog.off{background:linear-gradient(#b7c2d0,#76839a)}
#b2bar .lbl{width:100%;text-align:center;color:#ffd84a;font-size:15px;text-shadow:0 2px 0 #0b1326}`;document.head.appendChild(st)}
{const L=[['golem','Golem',1,5],['witch','Strega',1,10],['salamander','Salamandra',2,5],['smith','Fabbro',2,10],['toad','Re Rospo',3,5],['hydra','Idra',3,10],['yeti','Yeti',4,5],['icequeen','Regina',4,10],['mimic','Mimic',1,4]];
  const bar=document.createElement('div');bar.id='b2bar';bar.innerHTML='<div class="lbl">Anteprima boss · tocca un boss</div>'+L.map(([id,n])=>`<button data-b="${id}">${n}</button>`).join('')+'<button class="tog" id="b2tog">Dettagli nuovi: SÌ</button><button id="b2again">Rivedi entrata</button>';document.body.appendChild(bar);
  let cur=null;
  const show=id=>{cur=id;const it=L.find(x=>x[0]===id);bar.querySelectorAll('[data-b]').forEach(b=>b.classList.toggle('on',b.dataset.b===id));
    const go=()=>{P.inv=1e9;P.maxhp=P.hp=1e9;G.chapter=it[2];G.room=it[3];G.event=null;rollDark=()=>false;buildRoom();
      if(id==='mimic'){G.enemies=[];const m=makeE('mimic',AW/2,TOP+(BOT-TOP)*.35,0);G.enemies.push(m);$('bossBar').hidden=false;$('bossName').textContent=ET.mimic.name}
      for(const e of G.enemies){e.hp=e.max=1e9}const bo=G.enemies.find(e=>isBoss(e.type));P.x=bo?bo.x:AW/2;P.y=bo?Math.min(BOT-30,bo.y+170):BOT-80;camSnap()};
    if(!started){document.querySelectorAll('#sheetScr,#arenaUpScr,#loginScr').forEach(e=>e&&(e.hidden=true));startRun();setTimeout(go,400)}else go()};
  bar.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();
    if(b.dataset.b)show(b.dataset.b);else if(b.id==='b2tog'){BOSS2=!BOSS2;b.textContent='Dettagli nuovi: '+(BOSS2?'SÌ':'NO');b.classList.toggle('off',!BOSS2)}else if(b.id==='b2again'&&cur)show(cur)});
  bar.addEventListener('pointerdown',ev=>ev.stopPropagation());
  {const _p=update;update=function(dt){_p(dt);if(started&&P){P.hp=P.maxhp;for(const e of G.enemies)if(isBoss(e.type))e.hp=e.max}}}
  window.__b2show=show}
"""
end="newRun();applySettings();if(!playIntro(false))showMenu();requestAnimationFrame(loop);"
assert s.count(end)==1
s=s.replace(end,patch+gallery+end)
s=s.replace('<title>','<title>Anteprima boss · ',1) if '<title>' in s else s
(here/'boss_nuovi.html').write_text(s)
print('ok',len(s))
