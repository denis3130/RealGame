# Costruisce anteprime/filmato.html: il filmato dell'intro (anteprime/filmato/*.js) dentro una copia del gioco, che parte subito.
# Parametri dell'indirizzo: ?intro=A|B (solo le frasi brevi o solo i pensieri dell'eroe, per confrontare: di solito ci sono
# tutti e due insieme), ?trailer=1 (senza tasto Salta, resta sul logo),
# ?shot=3.2 (parte da quell'inquadratura e ne mostra il numero), ?t=12.5 (parte da quel secondo), ?foto=1 (fermo, per le foto di prova).
# La pagina costruita non si salva su git.  Uso: python3 anteprime/mk_filmato.py
import os,subprocess,sys,glob
here=os.path.dirname(os.path.abspath(__file__));root=os.path.join(here,'..')
subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
game=open(os.path.join(root,'index.html'),encoding='utf-8').read()
parts=sorted(glob.glob(os.path.join(here,'filmato','[0-9][0-9]-*.js')))
film='\n'.join(open(p,encoding='utf-8').read() for p in parts)
boot=r'''
// ---------- anteprima: il filmato parte subito ----------
const FILM=(()=>{
''' + film + r'''
function foto(t,ver){const sc0=$('introScr');sc0.hidden=false;sc0.classList.add('film');FM.ver=ver||FM.ver;fmSetup(sc0);render(t);fmLogo(t,true);return FM.shot&&FM.shot.id}
// the whole sound of the film rendered offline (for the checks): mono 22050 Hz, 16 bit, base64
async function audioOffline(dur,o){o=o||{};const sr=22050,off=new OfflineAudioContext(1,Math.ceil(sr*dur),sr),keep={};for(const k of['ctx','master','music','sfxBus','rev','mRev','sRev','dly','white','brown','cur','on','pan'])keep[k]=AU[k];
  try{AU.ctx=off;const comp=off.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=14;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.25;comp.connect(off.destination);
    AU.master=off.createGain();AU.master.gain.value=.9;AU.master.connect(comp);AU.music=off.createGain();AU.music.gain.value=.38;AU.music.connect(AU.master);AU.sfxBus=off.createGain();AU.sfxBus.gain.value=.8;AU.sfxBus.connect(AU.master);
    AU.rev=off.createConvolver();AU.rev.buffer=mkImpulse(off,3,2.4);const rv=off.createGain();rv.gain.value=.6;AU.rev.connect(rv);rv.connect(AU.master);AU.mRev=off.createGain();AU.mRev.connect(AU.rev);AU.sRev=off.createGain();AU.sRev.connect(AU.rev);
    AU.dly=off.createDelay(1.5);const fb=off.createGain(),dl=off.createBiquadFilter(),dOut=off.createGain();fb.gain.value=.36;dl.type='lowpass';dl.frequency.value=2400;dOut.gain.value=.42;AU.dly.connect(dl);dl.connect(fb);fb.connect(AU.dly);dl.connect(dOut);dOut.connect(AU.music);
    AU.white=mkNoise(off,2,'white');AU.brown=mkNoise(off,2,'brown');AU.cur=null;AU.on={music:true,sfx:true};AU.pan=0;
    FM.offline=true;FM.from=0;AUD.B=AUD.buses();AUD.tr={bus:AUD.B.mus,drum:AUD.B.drum};AUD.Q=fmCues(AUD.tr);AUD.a0=.1;AUD.silences(0);
    AU.sfxBus=AUD.B.sfx;AU.sRev=AUD.B.rev;AU.mRev=AUD.B.mrev;AU.dly=AUD.B.dly;const errs=[];if(o.mute){AUD.B.out.gain.cancelScheduledValues(0);AUD.B.out.gain.value=0}
    AUD.Q.forEach(([ct,fn],i)=>{if(o.only&&(i<o.only[0]||i>=o.only[1]))return;try{fn(AUD.a0+ct)}catch(e){errs.push(ct+': '+e)}});
    const buf=await off.startRendering(),d=buf.getChannelData(0),b=new Uint8Array(d.length*2);let peak=0;for(let i=0;i<d.length;i++){const v=Math.max(-1,Math.min(1,d[i]));peak=Math.max(peak,Math.abs(d[i]));const s=v<0?v*32768:v*32767;const x=Math.round(s);b[i*2]=x&255;b[i*2+1]=(x>>8)&255}
    let bin='';for(let i=0;i<b.length;i+=8192)bin+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return{sr,peak,errs,data:btoa(bin)}}
  finally{for(const k in keep)AU[k]=keep[k];AUD.B=null;AUD.on=false;FM.offline=false}}
window.__FE=s=>eval(s);
return{play:fmPlay,end:fmEnd,render,foto,FM,SHOTS:()=>SHOTS,audioOffline}})();
window.FILM=FILM;
(()=>{const q=new URLSearchParams(location.search),ver=(q.get('intro')||'AB').toUpperCase(),trailer=q.get('trailer')==='1',foto=q.get('foto')==='1';
  let from=+(q.get('t')||0);const sid=q.get('shot');if(sid){const s=FILM.SHOTS().find(o=>o.id===sid);if(s)from=s.t0;FILM.FM.debug=true}
  FILM.FM.from=from;
  function panel(){let el=document.getElementById('fmEnd');if(!el){el=document.createElement('div');el.id='fmEnd';el.innerHTML=`<style>
    #fmEnd{position:absolute;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle at 50% 45%,#13230f,#000 70%);font-family:"Baloo 2",system-ui,sans-serif;color:#f6ead2}
    #fmEnd h2{margin:0 0 6px;font:400 30px "Lilita One",system-ui;color:#ffd84a;text-shadow:0 3px 0 #1b1612}
    #fmEnd p{margin:0 18px 8px;text-align:center;font-size:14px;color:#d9c9a6;max-width:300px}
    #fmEnd button{font:400 20px "Lilita One",system-ui;color:#fff;min-width:230px;padding:10px 18px 12px;border:3px solid #191714;border-radius:14px;background:linear-gradient(#ffe46e,#ffc61f 48%,#f2a400 52%,#ffb816);box-shadow:inset 0 3px 0 rgba(255,255,255,.6),0 5px 0 #191714;text-shadow:0 2px 0 #191714;cursor:pointer}
    #fmEnd button.b2{background:linear-gradient(#bff0ff,#6fc8f0 48%,#3a9ad0 52%,#5ab4e6)}#fmEnd button.b3{background:linear-gradient(#e6e0d0,#b8b0a0 48%,#958c7c 52%,#a9a090)}
    </style><h2>Il filmato</h2><p>Frasi brevi in alto e pensieri dell'eroe in basso, nella stessa versione.</p>
    <button data-v="AB">Guarda di nuovo</button><button class="b2" data-v="T">Trailer 9:16 (senza Salta)</button>`;
    $('wrap').appendChild(el);el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;el.hidden=true;FILM.FM.from=0;
      if(b.dataset.v==='T')go('AB',true);else go(b.dataset.v,false)})}el.hidden=false}
  function go(v,tr){FILM.play({ver:v,trailer:tr,onEnd:()=>{panel()}})}
  try{AU.on.music=true;AU.on.sfx=true}catch(e){}
  if(foto){window.__FOTO=1;return}
  setTimeout(()=>go(ver,trailer),200)})();
'''
boot_old='newRun();applySettings();if(!playIntro(false))showMenu();requestAnimationFrame(loop);'
assert game.count(boot_old)==1
game=game.replace(boot_old,'newRun();applySettings();showMenu();requestAnimationFrame(loop);')
i=game.rfind('})();')
page=game[:i]+'\n'+boot+'\n'+game[i:]
page=page.replace('<title>Mossbound</title>','<title>Intro di Mossbound</title>',1)
open(os.path.join(here,'filmato.html'),'w',encoding='utf-8').write(page)
print('anteprime/filmato.html pronto')
