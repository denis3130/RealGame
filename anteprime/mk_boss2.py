# Anteprime dei boss della Classica rifatti (Denis, 15 ottobre: «rivisita tutti i boss … possenti, belli, fighi, che diano timore nello
# sfidarli», «migliora anche le loro abilità speciali»; poi «sì, fai gli altri 12»): una copia del gioco con i modelli nuovi
# (sprite/nemici3d/<tipo>2.js) e i loro cervelli (src/js/89-<nome>-nuovo.js), più un pannello che porta subito nella stanza di un boss con
# l'eroe forte o invincibile. Il gioco vero non cambia finché i cervelli non entrano in src/ordine.txt. Ogni cervello dice nel registro
# BCL come si entra nella sua stanza, le sue mosse e i suoi pericoli (le prove: tests/boss2gioco.js).
# Uso: python3 anteprime/mk_boss2.py <tipo ...> | --tutti  [--stub] [--test] [--build] [--modello file.js]
#   <tipo>     golem, salamander, toad, yeti, witch, smith, hydra, icequeen, mimic, puppeteer, phoenix, octopus, stag
#   --tutti    tutti i boss che hanno il cervello (e il modello, o con --stub il modello finto) → anteprime/boss_classici_sfida.html
#   --stub     al posto del modello nuovo il modello finto anteprime/boss2/<tipo>_stub.js (il boss di oggi che fa le mosse nuove),
#              per provare il cervello prima che il modello ci sia; senza --stub il modello finto si usa solo se il modello manca
#   --test     la pagina per le prove (tests/<tipo>2_test.html o tests/boss2_test.html, con window.__E come tests/test.html, niente pannello)
#   --build    prima ricostruisce index.html (python3 build.py); di solito no: index.html si legge com'è, così più prove insieme non si
#              pestano i piedi
#   --modello  (con un solo tipo) un altro file di modello: il suo id diventa '<tipo>2', anche i disegni esportati con quel nome
# Uscita: anteprime/<tipo>2.html (un boss) o anteprime/boss_classici_sfida.html (--tutti o più boss); con --test in tests/.
import os,subprocess,sys,re
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
# tipo del gioco: (file del cervello, nome)
B={'golem':('89-golem-nuovo.js','Golem di Muschio'),'salamander':('89-salamandra-nuova.js','Salamandra di Lava'),'toad':('89-rospo-nuovo.js','Re Rospo'),
   'yeti':('89-yeti-nuovo.js','Yeti delle Vette'),'witch':('89-strega-nuova.js','Strega delle Radici'),'smith':('89-fabbro-nuovo.js','Il Fabbro Infernale'),
   'hydra':('89-idra-nuova.js',"L'Idra della Palude"),'icequeen':('89-regina-nuova.js','Regina dei Ghiacci'),'mimic':('89-mimic-nuovo.js','Il Mimic'),
   'puppeteer':('89-burattinaio-nuovo.js',"Il Burattinaio d'Ombra"),'phoenix':('89-fenice-nuova.js','La Fenice della Forgia'),
   'octopus':('89-piovra-nuova.js','La Piovra della Palude'),'stag':('89-cervo-nuovo.js',"Il Cervo d'Aurora")}
A=sys.argv[1:];stub='--stub' in A;test='--test' in A;tutti='--tutti' in A
mfile=A[A.index('--modello')+1] if '--modello' in A else None
types=[a for a in A if a in B]
if tutti:types=list(B)
if not types:sys.exit('uso: python3 anteprime/mk_boss2.py <tipo ...> | --tutti [--stub] [--test] [--build] [--modello file.js]')
if '--build' in A:subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
models,brains,used=[],[],[]
for t in types:
    bf=os.path.join(root,'src','js',B[t][0]);mp=os.path.abspath(mfile) if mfile and len(types)==1 else os.path.join(root,'sprite','nemici3d',t+'2.js')
    sp=os.path.join(here,'boss2',t+'_stub.js')
    if not os.path.exists(bf):
        if not tutti:print('manca il cervello',os.path.relpath(bf,root))
        continue
    if stub or not os.path.exists(mp):
        if not os.path.exists(sp):print('manca il modello di',t,'(né',os.path.relpath(mp,root),'né',os.path.relpath(sp,root)+')');continue
        models.append(open(sp,encoding='utf-8').read());kind='finto'
    else:
        src=open(mp,encoding='utf-8').read();mid=os.path.basename(mp)[:-3];models.append(src);kind='nuovo'
        if mid!=t+'2':models.append(f"""
// the work file {mid}.js as the model '{t}2' (its drawings for the game too)
(()=>{{if(!N3['{t}2']&&N3['{mid}']){{N3['{t}2']=N3['{mid}'];N3.meta['{t}2']=N3.meta['{mid}'];for(const k of Object.keys(N3))if(k.startsWith('{mid}')&&k!=='{mid}'){{const n='{t}2'+k.slice({len(mid)});if(!N3[n])N3[n]=N3[k]}}N3.order.push('{t}2')}}}})();
""")
    brains.append(open(bf,encoding='utf-8').read());used.append((t,kind))
if not used:sys.exit('nessun boss da mettere nella pagina')
multi=tutti or len(used)>1
title='Boss Classici · Sfida' if multi else B[used[0][0]][1]+' nuovo'
seed="""<script>try{if(!localStorage.getItem('cripta_save_v1'))localStorage.setItem('cripta_save_v1',JSON.stringify({gold:2000,gems:50,trophies:0,runs:3,introSeen:1,tutDone:1,handSeen:1,
starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:3,cards:0},giubba:{lvl:3,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))}catch(e){}</script>"""
s=s.replace('<title>Mossbound</title>','<title>'+title+'</title>'+seed,1)
panel=r"""
// ===================================================================== BOSS CLASSICI RIFATTI: il pannello della prova (solo in questa pagina)
(()=>{const PB={strong:true,inv:false,ran:false,open:false,was:null};
  const css=document.createElement('style');css.textContent=`#pbBtn{position:fixed;left:6px;top:46%;z-index:60;width:46px;height:46px;border-radius:50%;border:2px solid #2a1d14;background:#ffd36e;color:#2a1d14;
    font:800 11px/1.05 system-ui,sans-serif;box-shadow:0 3px 0 #2a1d14,0 6px 14px rgba(0,0,0,.4);cursor:pointer}
  #pbPan{position:fixed;inset:0;z-index:61;background:rgba(10,8,14,.78);display:flex;align-items:center;justify-content:center;padding:16px}
  #pbPan .w{width:min(380px,100%);max-height:92vh;overflow:auto;background:#2b2620;border:3px solid #15110d;border-radius:18px;padding:16px;color:#f4ecdc;font:500 14px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.6)}
  #pbPan h2{margin:0 0 4px;font:800 20px/1.2 system-ui,sans-serif;color:#ffd36e}#pbPan p{margin:0 0 12px;color:#ddd2bf;font-size:13px}
  #pbPan .b{display:block;width:100%;margin:0 0 8px;padding:11px 12px;border-radius:12px;border:2px solid #15110d;background:#4a3f33;color:#fff6e4;font:700 15px/1.2 system-ui,sans-serif;cursor:pointer;text-align:left}
  #pbPan .b small{display:block;font:500 12px/1.2 system-ui,sans-serif;color:#d9ccb6;margin-top:2px}
  #pbPan label{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}#pbPan .x{margin-top:8px;width:100%;padding:9px;border-radius:12px;border:2px solid #15110d;background:#5a5046;color:#fff6e4;font:700 14px system-ui,sans-serif;cursor:pointer}`;
  document.head.appendChild(css);
  const L=Object.keys(window.BCL||{}),one=L.length===1;
  const btn=document.createElement('button');btn.id='pbBtn';btn.textContent='Boss';document.body.appendChild(btn);
  const pan=document.createElement('div');pan.id='pbPan';pan.hidden=true;document.body.appendChild(pan);
  pan.innerHTML=`<div class="w"><h2>${one?BCL[L[0]].n+' nuovo':'I boss rifatti'}</h2><p>${one?'Entri subito nella sua stanza.':'Scegli un boss: entri subito nella sua stanza.'} Il gioco vero non cambia.</p>
    ${L.map(t=>`<button class="b" data-t="${t}">Sfida ${BCL[t].n}<small>${BCL[t].sub||(BCL[t].arena!=null?'Arena '+(BCL[t].arena+1)+' · '+ARENAS[BCL[t].arena].n:'')}</small></button>`).join('')}
    <label><input type="checkbox" id="pbStrong" checked> Eroe forte (più vita e più attacco, come a fine arena)</label>
    <label><input type="checkbox" id="pbInv"> Eroe invincibile</label><button class="x" id="pbClose">Chiudi</button></div>`;
  const show=()=>{if(PB.open)return;PB.open=true;pan.hidden=false;PB.was={paused,modal};if(started){paused=true}modal=true};
  const hide=()=>{if(!PB.open)return;PB.open=false;pan.hidden=true;if(PB.was){paused=PB.was.paused;modal=PB.was.modal}};
  btn.onclick=e=>{e.stopPropagation();show()};$('pbClose').onclick=e=>{e.stopPropagation();hide()};
  $('pbStrong').onchange=e=>{PB.strong=e.target.checked};$('pbInv').onchange=e=>{PB.inv=e.target.checked};
  pan.querySelectorAll('.b').forEach(b=>b.onclick=e=>{e.stopPropagation();const t=b.dataset.t,R=BCL[t];PB.open=false;pan.hidden=true;modal=false;paused=false;
    try{document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(q=>q.hidden=true);startRun()}catch(err){}
    setTimeout(()=>{try{R.enter();const d=R.arena!=null?ARENAS[R.arena].diff:1.5;if(PB.strong){P.maxhp=P.hp=Math.round(P.maxhp*(3+2*d));P.atk*=2+2*d;P.aspd*=1.3}PB.ran=true}catch(err){console.error(err)}},350)});
  let first=true;setInterval(()=>{try{if(PB.inv&&started&&P){P.hp=P.maxhp}const inMenu=!$('menu').hidden&&$('endScr').hidden;
    if(inMenu&&(first||PB.ran)){first=false;PB.ran=false;show()}}catch(err){}},300)})();
"""
i=s.rfind('})();')
s=s[:i]+'\n'+'\n'.join(models)+'\n'+'\n'.join(brains)+'\n'+('window.__E=s=>eval(s);' if test else panel)+s[i:]
name=('boss2' if multi else used[0][0]+'2')+'_test.html' if test else ('boss_classici_sfida.html' if multi else used[0][0]+'2.html')
out=os.path.join(root,'tests',name) if test else os.path.join(here,name)
open(out,'w',encoding='utf-8').write(s)
print(os.path.relpath(out,root),len(s)//1024,'KB ·',', '.join(f'{t} ({k})' for t,k in used))
