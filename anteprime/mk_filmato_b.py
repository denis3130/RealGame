# Costruisce anteprime/filmato_b.html: il filmato B (l'allenamento all'alba) dentro una copia del gioco. Usa il motore del filmato A
# (anteprime/filmato/01-motore.js, 02-bosco.js, 06-suoni.js) più i pezzi in anteprime/filmato_b/. All'inizio si sceglie chi sei
# (l'Arciere o la Cacciatrice: il protagonista pensa, l'altro parla); alla fine si può rivederlo, con l'altro eroe o come trailer.
# Parametri dell'indirizzo: ?eroe=arciere|cacciatrice (parte subito con quel protagonista), ?trailer=1, ?t=12.5, ?shot=4.5, ?foto=1.
# La pagina costruita non si salva su git.  Uso: python3 anteprime/mk_filmato_b.py
import os,subprocess,sys,glob
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
game=open(os.path.join(root,'index.html'),encoding='utf-8').read()
parts=[os.path.join(here,'filmato',f) for f in('01-motore.js','02-bosco.js','06-suoni.js')]+sorted(glob.glob(os.path.join(here,'filmato_b','[0-9][0-9]-*.js')))
film='\n'.join(open(p,encoding='utf-8').read() for p in parts)
boot=r'''
// ---------- anteprima: il filmato B ----------
const FILM=(()=>{
''' + film + r'''
function setProt(id){FM.prot=id==='cacciatrice'?'cacciatrice':'arciere';bTexts()}
function foto(t,ver,prot){if(prot)setProt(prot);const sc0=$('introScr');sc0.hidden=false;sc0.classList.add('film');FM.ver=ver||FM.ver;fmSetup(sc0);render(t);fmLogo(t,true);return FM.shot&&FM.shot.id}
// the whole sound of the film rendered offline (for the checks): mono 22050 Hz, 16 bit, base64
async function audioOffline(dur,o){o=o||{};const sr=22050,off=new OfflineAudioContext(1,Math.ceil(sr*dur),sr),keep={};for(const k of['ctx','master','music','sfxBus','rev','mRev','sRev','dly','white','brown','cur','on','pan'])keep[k]=AU[k];
  try{AU.ctx=off;const comp=off.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=14;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.25;comp.connect(off.destination);
    AU.master=off.createGain();AU.master.gain.value=.9;AU.master.connect(comp);AU.music=off.createGain();AU.music.gain.value=.38;AU.music.connect(AU.master);AU.sfxBus=off.createGain();AU.sfxBus.gain.value=.8;AU.sfxBus.connect(AU.master);
    AU.rev=off.createConvolver();AU.rev.buffer=mkImpulse(off,3,2.4);const rv=off.createGain();rv.gain.value=.6;AU.rev.connect(rv);rv.connect(AU.master);AU.mRev=off.createGain();AU.mRev.connect(AU.rev);AU.sRev=off.createGain();AU.sRev.connect(AU.rev);
    AU.dly=off.createDelay(1.5);const fb=off.createGain(),dl=off.createBiquadFilter(),dOut=off.createGain();fb.gain.value=.36;dl.type='lowpass';dl.frequency.value=2400;dOut.gain.value=.42;AU.dly.connect(dl);dl.connect(fb);fb.connect(AU.dly);dl.connect(dOut);dOut.connect(AU.music);
    AU.white=mkNoise(off,2,'white');AU.brown=mkNoise(off,2,'brown');AU.cur=null;AU.on={music:true,sfx:true};AU.pan=0;
    FM.offline=true;FM.from=0;AUD.B=AUD.buses();AUD.tr={bus:AUD.B.mus,drum:AUD.B.drum};AUD.Q=(AUD.cues||fmCues)(AUD.tr);AUD.a0=.1;AUD.silences(0);
    AU.sfxBus=AUD.B.sfx;AU.sRev=AUD.B.rev;AU.mRev=AUD.B.mrev;AU.dly=AUD.B.dly;const errs=[];if(o.mute){AUD.B.out.gain.cancelScheduledValues(0);AUD.B.out.gain.value=0}
    AUD.Q.forEach(([ct,fn],i)=>{if(o.only&&(i<o.only[0]||i>=o.only[1]))return;try{fn(AUD.a0+ct)}catch(e){errs.push(ct+': '+e)}});
    const buf=await off.startRendering(),d=buf.getChannelData(0),b=new Uint8Array(d.length*2);let peak=0;for(let i=0;i<d.length;i++){const v=Math.max(-1,Math.min(1,d[i]));peak=Math.max(peak,Math.abs(d[i]));const s=v<0?v*32768:v*32767;const x=Math.round(s);b[i*2]=x&255;b[i*2+1]=(x>>8)&255}
    let bin='';for(let i=0;i<b.length;i+=8192)bin+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return{sr,peak,errs,data:btoa(bin)}}
  finally{for(const k in keep)AU[k]=keep[k];AUD.B=null;AUD.on=false;FM.offline=false}}
window.__FE=s=>eval(s);
return{play:fmPlay,end:fmEnd,render,foto,FM,SHOTS:()=>SHOTS,audioOffline,setProt,unlock:fmUnlock}})();
window.FILM=FILM;
// the game's first-launch choice of the hero (65) is not part of this page: the film asks who you are itself
try{if(SCE.on)sceClose()}catch(e){}
(()=>{const q=new URLSearchParams(location.search),trailer=q.get('trailer')==='1',foto=q.get('foto')==='1',e0=q.get('eroe');
  let from=+(q.get('t')||0);const sid=q.get('shot');if(sid){const s=FILM.SHOTS().find(o=>o.id===sid);if(s)from=s.t0;FILM.FM.debug=true}
  FILM.FM.from=from;
  const css=`<style>#fmB{position:absolute;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:18px;
    background:radial-gradient(120% 70% at 50% 30%,#f7c08a 0%,#c77a62 32%,#4a3a5e 70%,#1b1a2e 100%);font-family:"Baloo 2",system-ui,sans-serif;color:#fff;text-align:center}
    #fmB small{font:400 14px "Lilita One",system-ui;letter-spacing:.12em;text-transform:uppercase;color:#fff3c4;text-shadow:0 2px 0 #1b1612}
    #fmB h2{margin:0;font:400 34px/1.05 "Lilita One",system-ui;color:#fff;text-shadow:0 3px 0 #1b1612,2px 2px 0 #1b1612,-2px 2px 0 #1b1612,0 0 22px rgba(0,0,0,.4)}
    #fmB p{margin:0 0 6px;max-width:310px;font-size:15px;line-height:1.3;color:#fff6e6;text-shadow:0 1px 0 #1b1612}
    #fmB button{font:400 21px "Lilita One",system-ui;color:#fff;min-width:250px;padding:11px 18px 13px;border:3px solid #191714;border-radius:14px;cursor:pointer;text-shadow:0 2px 0 #191714;
      box-shadow:inset 0 3px 0 rgba(255,255,255,.55),inset 0 -4px 0 rgba(0,0,0,.18),0 5px 0 #191714}
    #fmB button:active{transform:translateY(3px);box-shadow:inset 0 3px 0 rgba(255,255,255,.5),0 2px 0 #191714}
    #fmB .ar{background:linear-gradient(#9ff2e2,#4cc7b2 48%,#2fa595 52%,#3dbaa8)}#fmB .ca{background:linear-gradient(#ffc8e0,#ff8cbe 48%,#e2609c 52%,#f27aae)}
    #fmB .tr{background:linear-gradient(#e6e0d0,#b8b0a0 48%,#958c7c 52%,#a9a090);font-size:17px;min-width:0;padding:8px 16px 10px}</style>`;
  function panel(end){let el=document.getElementById('fmB');if(!el){el=document.createElement('div');el.id='fmB';$('wrap').appendChild(el);
      el.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;el.hidden=true;FILM.FM.from=0;go(b.dataset.e,b.dataset.t==='1')})}
    const P=FILM.FM.prot||'arciere',O=P==='arciere'?'cacciatrice':'arciere',N={arciere:"l'Arciere",cacciatrice:'la Cacciatrice'};
    el.innerHTML=css+(end?`<small>Filmato B</small><h2>L'allenamento</h2><p>Hai visto la storia con ${N[P]}. Con l'altro eroe cambiano il protagonista e le battute.</p>
      <button class="${O==='arciere'?'ar':'ca'}" data-e="${O}">Rivedi con ${N[O]}</button><button class="${P==='arciere'?'ar':'ca'}" data-e="${P}">Rivedi con ${N[P]}</button><button class="tr" data-e="${P}" data-t="1">Trailer 9:16 (senza Salta)</button>`
      :`<small>Filmato B · all'alba</small><h2>Chi sei?</h2><p>Il protagonista è l'eroe che hai scelto: pensa, in basso. Gli altri (anche il Balestriere e il Druida) si allenano con te e parlano, in alto.</p>
      <button class="ar" data-e="arciere">Sono l'Arciere</button><button class="ca" data-e="cacciatrice">Sono la Cacciatrice</button>`);
    el.hidden=false}
  function go(id,tr){FILM.setProt(id);FILM.unlock(()=>FILM.play({ver:'AB',trailer:tr,onEnd:()=>panel(true)}))}
  try{AU.on.music=true;AU.on.sfx=true}catch(e){}
  if(foto){window.__FOTO=1;FILM.setProt(e0||'arciere');return}
  if(e0){FILM.setProt(e0);setTimeout(()=>FILM.play({ver:'AB',trailer,onEnd:()=>panel(true)}),200);return}
  panel(false)})();
'''
boot_old='newRun();applySettings();if(!playIntro(false))showMenu();requestAnimationFrame(loop);'
assert game.count(boot_old)==1
game=game.replace(boot_old,'newRun();applySettings();showMenu();requestAnimationFrame(loop);')
i=game.rfind('})();')
page=game[:i]+'\n'+boot+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Allenamento all\'alba</title>',1)
open(os.path.join(here,'filmato_b.html'),'w',encoding='utf-8').write(page)
print('anteprime/filmato_b.html pronto')
