#!/usr/bin/env python3
# Pagina per sentire le voci degli eroi dal telefono (src/js/95-voci-eroi.js): per ognuno dei tredici eroi i bottoni del tiro, del colpito,
# della Super, della vittoria, della caduta e della battuta (la voce che borbotta e il fumetto con una delle sue frasi), più tutte le sue
# battute. Le voci sono le stesse del gioco: la gola fatta col codice dei boss nuovi (B3VO, 88) e le tabelle di HV, prese dai file del
# gioco così come sono (cambiano col gioco).
# Uso: python3 anteprime/mk_voci_eroi.py  ->  anteprime/voci_eroi.html
import os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def cut(path, a, b):
    s = open(os.path.join(R, path), encoding='utf-8').read(); i = s.index(a); j = s.index(b, i) + len(b); return s[i:j]
b3vo = cut('src/js/88-boss3-voci.js', 'const B3VO=(()=>{', 'return{prep,play,has,state,VB,clip,render,job,SR}})();')
hv = cut('src/js/95-voci-eroi.js', 'const HV=(()=>{', "const HVOL={att:.42,hurt:.5,ult:.66,win:.55,die:.62,talk:.46};")
HEROES = [('arciere', 'Arciere', '#2fb3a6', 'squillante'), ('cacciatrice', 'Cacciatrice', '#ff8ab8', 'decisa'), ('balestriere', 'Balestriere', '#dfe4ea', 'burbera'),
          ('druida', 'Druida', '#9fff7a', 'calma, col fiato'), ('bardo', 'Bardo', '#ffd84a', 'cantata'), ('alchimista', 'Alchimista', '#7bf06a', 'ridacchia'),
          ('ninja', 'Ninja delle ombre', '#b8a6ff', 'sussurrata'), ('paladino', 'Paladino', '#ffd86b', 'eroica'), ('mago', 'Mago del ghiaccio', '#9fe8ff', 'vecchia e ventosa'),
          ('berserker', 'Berserker', '#ff6a3c', 'ruggisce'), ('corsaro', 'Corsaro', '#f0c64a', 'rolla le erre'), ('domatore', 'Domatore', '#8fc8ff', 'fischia al lupo'),
          ('monaco', 'Monaco', '#fff1a8', 'col suo «Hai!»')]
heroes_js = '[' + ','.join("['%s','%s','%s','%s']" % h for h in HEROES) + ']'
page = r'''<meta charset="utf-8">
<title>Voci degli eroi</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Baloo+2:wght@500;700&display=swap">
<style>
/* Layout: one column of hero slabs on the phone, two or three side by side on wider screens; the game's crypt stone, its ink outlines and its type */
:root{
  --stone:#211a15; --slab:#2e2620; --slab2:#3a3029; --edge:#4a3c30; --parch:#f6ead2; --muted:#b8a990; --moss:#7bbf4a; --ink:#120d0a; --bubble:#fff8ea; --bubbleInk:#1b1612;
  --display:"Lilita One","Arial Rounded MT Bold","Trebuchet MS",sans-serif; --body:"Baloo 2","Trebuchet MS",Arial,sans-serif;
  color-scheme:dark}
html{background:var(--stone)}
body{background:var(--stone);color:var(--parch);font-family:var(--body);font-size:15px;line-height:1.45;margin:0;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:22px 48px}
header{max-width:1100px;margin:0 auto 18px;display:grid;gap:6px}
h1{font-family:var(--display);font-weight:400;font-size:clamp(28px,7vw,40px);line-height:1.05;margin:0;letter-spacing:.01em;text-wrap:balance}
h1 span{color:var(--moss)}
.lead{margin:0;color:var(--muted);max-width:62ch}
.grid{max-width:1100px;margin:0 auto;display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))}
.hero{background:var(--slab);border:2px solid var(--ink);border-radius:14px;box-shadow:0 4px 0 var(--ink);padding:14px 14px 12px;display:grid;gap:10px;min-width:0}
.top{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--ink);flex:none;align-self:center}
.name{font-family:var(--display);font-size:21px;line-height:1}
.voice{color:var(--muted);font-size:13px}
.hz{margin-left:auto;font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;font-variant-numeric:tabular-nums}
.say{min-height:40px;display:flex;align-items:flex-end}
.bub{position:relative;background:var(--bubble);color:var(--bubbleInk);border:2.5px solid var(--bubbleInk);border-radius:12px;padding:4px 12px 5px;font-family:var(--display);font-size:15px;line-height:1.2;
  max-width:100%;transform-origin:20px 100%;animation:pop .22s ease-out}
.bub::after{content:"";position:absolute;left:16px;bottom:-9px;width:10px;height:10px;background:var(--bubble);border-right:2.5px solid var(--bubbleInk);border-bottom:2.5px solid var(--bubbleInk);transform:rotate(45deg)}
.idle{color:var(--muted);font-size:13px}
@keyframes pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
.btns{display:flex;flex-wrap:wrap;gap:8px}
button{font-family:var(--display);font-size:15px;color:var(--parch);background:var(--slab2);border:2px solid var(--ink);border-radius:999px;padding:6px 13px 7px;
  box-shadow:0 3px 0 var(--ink);cursor:pointer;touch-action:manipulation}
button:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
button:focus-visible{outline:3px solid var(--moss);outline-offset:2px}
button.line{background:var(--moss);color:var(--ink)}
details{border-top:1px solid var(--edge);padding-top:8px}
summary{cursor:pointer;color:var(--muted);font-size:13px;letter-spacing:.05em;text-transform:uppercase}
dl{margin:8px 0 0;display:grid;grid-template-columns:auto 1fr;gap:3px 12px;font-size:14px}
dt{color:var(--muted)}dd{margin:0;min-width:0}
@media (prefers-reduced-motion:reduce){.bub{animation:none}}
</style>
<header>
  <h1>Voci degli <span>eroi</span></h1>
  <p class="lead">Tocca un bottone per sentire la voce. «Battuta» fa borbottare l'eroe e mostra una delle frasi che dice in battaglia. Le voci sono fatte col codice, come quelle dei boss nuovi.</p>
</header>
<main class="grid" id="grid"></main>
<script>
const AU={ctx:null,on:{sfx:true},pan:0};
const VR=(v,k)=>v*(1+(Math.random()*2-1)*k);
function route(g){g.connect(AU.ctx.destination)}
function audioOn(){try{if(!AU.ctx)AU.ctx=new (window.AudioContext||window.webkitAudioContext)();if(AU.ctx.state!=='running')AU.ctx.resume()}catch(e){}}
''' + b3vo + '\n' + hv + r'''
const HEROES=''' + heroes_js + r''';
const KINDS=[['att','Tiro'],['hurt','Colpito'],['ult','Super'],['win','Vittoria'],['die','Caduta']];
const LBL={start:'Inizio',boss:'Arriva il boss',win:'Boss battuto',low:'Salute bassa',revive:'Si rialza',room:'Stanza pulita'};
const grid=document.getElementById('grid');
for(const [id,n,col,vc] of HEROES){const p=HV.PF[id],L=HLINE[id],el=document.createElement('section');el.className='hero';
  const all=[];for(const k in LBL){const v=L[k];(Array.isArray(v)?v:[v]).forEach(s=>all.push(s))}
  el.innerHTML=`<div class="top"><i class="dot" style="background:${col}"></i><span class="name">${n}</span><span class="voice">voce ${vc}</span><span class="hz">${p.whisper?'sussurro':Math.round(p.f)+' Hz'}</span></div>
    <div class="say"><span class="idle">Tocca «Battuta»</span></div>
    <div class="btns">${KINDS.map(([k,t])=>`<button type="button" data-k="${k}">${t}</button>`).join('')}<button type="button" class="line" data-k="talk">Battuta</button></div>
    <details><summary>Tutte le battute</summary><dl>${Object.keys(LBL).map(k=>`<dt>${LBL[k]}</dt><dd>${(Array.isArray(L[k])?L[k]:[L[k]]).join(' · ')}</dd>`).join('')}</dl></details>`;
  const say=el.querySelector('.say');
  el.querySelector('.btns').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;audioOn();const k=b.dataset.k;
    const go=()=>{HV.play(id,k,HVOL[k]||.5);if(k==='talk'){const s=all[(Math.random()*all.length)|0];say.innerHTML='';const q=document.createElement('span');q.className='bub';q.textContent=s;say.appendChild(q)}};
    if(AU.ctx&&AU.ctx.state!=='running')AU.ctx.resume().then(go,go);else go()});
  grid.appendChild(el)}
// the voices get ready a little at a time, so the first tap is quick
setTimeout(()=>{for(const h of HEROES)HV.prep(h[0])},300);
</script>
'''
out = os.path.join(R, 'anteprime', 'voci_eroi.html')
open(out, 'w', encoding='utf-8').write(page)
print('anteprime/voci_eroi.html pronta (%d KB)' % (len(page) // 1024))
