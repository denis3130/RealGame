# Pagina di prova dei 4 boss nuovi del terzo giro, per Denis (15 ottobre): una copia del gioco (index.html) con un pannello che porta
# subito nella stanza di uno dei quattro boss (arene 9-12) senza arrivare a 5.200 coppe, per sentire le voci, vedere le prese in giro e
# l'arena che reagisce. L'eroe può essere «forte» (come alla fine di un'arena: più vita e più attacco) o invincibile. Non è nel gioco:
# ha il suo salvataggio (la pagina pubblicata è un altro indirizzo), il gioco sul telefono non cambia.
# Uso: python3 anteprime/mk_prova_boss.py  ->  anteprime/prova_boss.html
import os,subprocess,sys
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
# a save of its own with the first film already seen (otherwise the trailer would play first)
seed="""<script>try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:2000,gems:50,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,
login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))}catch(e){}</script>"""
s=s.replace('<title>Mossbound</title>','<title>Prova dei boss nuovi</title>'+seed,1)
panel=r"""
// ===================================================================== PROVA DEI BOSS NUOVI (solo in questa pagina di prova)
(()=>{const B=[[8,"Il Burattinaio d'Ombra",'Cripta delle Ombre','#b48cff'],[9,'La Fenice della Forgia','Forgia degli Dei','#ff9a4a'],[10,'La Piovra della Palude','Palude Maledetta','#5fe0d0'],[11,"Il Cervo d'Aurora",'Vetta di Mossbound','#c8fff0']];
  const PB={strong:true,inv:false,ran:false,open:false,was:null};
  const css=document.createElement('style');css.textContent=`#pbBtn{position:fixed;left:6px;top:46%;z-index:60;width:46px;height:46px;border-radius:50%;border:2px solid #2a1d14;background:#ffd84a;color:#2a1d14;
    font:800 11px/1.05 system-ui,sans-serif;box-shadow:0 3px 0 #2a1d14,0 6px 14px rgba(0,0,0,.4);cursor:pointer}
  #pbPan{position:fixed;inset:0;z-index:61;background:rgba(10,8,14,.78);display:flex;align-items:center;justify-content:center;padding:16px}
  #pbPan .w{width:min(360px,100%);background:#2c2620;border:3px solid #1b1612;border-radius:18px;padding:16px;color:#f4ead6;font:500 14px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.6)}
  #pbPan h2{margin:0 0 4px;font:800 20px/1.2 system-ui,sans-serif;color:#ffd84a}#pbPan p{margin:0 0 12px;color:#d8ccb4;font-size:13px}
  #pbPan .b{display:flex;align-items:center;gap:10px;width:100%;margin:0 0 8px;padding:10px 12px;border-radius:12px;border:2px solid #1b1612;background:#3c342c;color:#f4ead6;font:700 15px/1.2 system-ui,sans-serif;text-align:left;cursor:pointer}
  #pbPan .b i{flex:none;width:14px;height:14px;border-radius:50%;border:2px solid #1b1612}#pbPan .b small{display:block;font-weight:500;font-size:12px;color:#bfb29a}
  #pbPan label{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}#pbPan .x{margin-top:8px;width:100%;padding:9px;border-radius:12px;border:2px solid #1b1612;background:#5a4f44;color:#f4ead6;font:700 14px system-ui,sans-serif;cursor:pointer}`;
  document.head.appendChild(css);
  const btn=document.createElement('button');btn.id='pbBtn';btn.textContent='Prova boss';document.body.appendChild(btn);
  const pan=document.createElement('div');pan.id='pbPan';pan.hidden=true;document.body.appendChild(pan);
  pan.innerHTML=`<div class="w"><h2>Prova dei boss nuovi</h2><p>Scegli un combattimento: entri subito nella stanza del boss. Ascolta le voci, fatti colpire per vederlo prenderti in giro, guarda come reagisce l'arena.</p>
    ${B.map(([ai,n,w,c])=>`<button class="b" data-a="${ai}"><i style="background:${c}"></i><span>${n}<small>Arena ${ai+1} · ${w}</small></span></button>`).join('')}
    <label><input type="checkbox" id="pbStrong" checked> Eroe forte (più vita e più attacco, come a fine arena)</label>
    <label><input type="checkbox" id="pbInv"> Eroe invincibile</label><button class="x" id="pbClose">Chiudi</button></div>`;
  const show=()=>{if(PB.open)return;PB.open=true;pan.hidden=false;PB.was={paused,modal};if(started){paused=true}modal=true};
  const hide=()=>{if(!PB.open)return;PB.open=false;pan.hidden=true;if(PB.was){paused=PB.was.paused;modal=PB.was.modal}};
  btn.onclick=e=>{e.stopPropagation();show()};$('pbClose').onclick=e=>{e.stopPropagation();hide()};
  $('pbStrong').onchange=e=>{PB.strong=e.target.checked};$('pbInv').onchange=e=>{PB.inv=e.target.checked};
  pan.querySelectorAll('.b').forEach(b=>b.onclick=e=>{e.stopPropagation();const ai=+b.dataset.a;PB.open=false;pan.hidden=true;modal=false;paused=false;
    try{document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(q=>q.hidden=true);startRun()}catch(err){}
    setTimeout(()=>{try{G.arena=ai;G.chapter=ARENAS[ai].ch;G.diff=ARENAS[ai].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;
      if(PB.strong){P.maxhp=P.hp=Math.round(P.maxhp*4);P.atk*=3;P.aspd*=1.3}buildRoom();PB.ran=true}catch(err){console.error(err)}},350)});
  // the invincible hero; the menu after a fight opens the panel again; the first time the menu shows, the panel opens by itself
  let first=true;setInterval(()=>{try{if(PB.inv&&started&&P){P.hp=P.maxhp}const inMenu=!$('menu').hidden&&$('endScr').hidden;
    if(inMenu&&(first||PB.ran)){first=false;PB.ran=false;show()}}catch(err){}},300)})();
"""
i=s.rfind('})();')
s=s[:i]+panel+s[i:]
out=os.path.join(here,'prova_boss.html');open(out,'w',encoding='utf-8').write(s)
print(out,len(s)//1024,'KB')
