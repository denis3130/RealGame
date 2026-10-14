# Prova dei suoni del filmato B: python3 anteprime/filmato_b/audio_prova.py <cartella>
# Rende tutto l'audio senza altoparlanti (OfflineAudioContext) dentro anteprime/filmato_b.html, lo salva in WAV e disegna forma d'onda,
# volume nel tempo e spettrogramma con i tagli delle inquadrature, così si vede dov'è il silenzio, quanto forte è l'urlo, ecc.
import os,sys,asyncio,base64,wave
import numpy as np
from playwright.async_api import async_playwright
here=os.path.dirname(os.path.abspath(__file__));out=sys.argv[1];os.makedirs(out,exist_ok=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto('file://'+os.path.join(here,'..','filmato_b.html')+'?foto=1');await pg.wait_for_timeout(1000)
    r=await pg.evaluate('FILM.audioOffline(40)');shots=await pg.evaluate('FILM.SHOTS().map(s=>[s.id,s.t0])')
    await b.close()
  print('peak',round(r['peak'],3),'errori nei suoni:',r['errs'][:5],[e for e in errs if 'TUNNEL' not in e][:5])
  raw=base64.b64decode(r['data']);sr=r['sr'];x=np.frombuffer(raw,dtype='<i2').astype(np.float32)/32768
  with wave.open(os.path.join(out,'filmato_b.wav'),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(raw)
  hop=int(sr*.05);n=len(x)//hop;rms=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)+1e-12) for i in range(n)]);db=20*np.log10(rms)
  for s in range(0,40):print(f'{s:2d}s  {"#"*max(0,int((db[s*20:(s+1)*20].max()+60)/1.5))} {db[s*20:(s+1)*20].max():6.1f} dB')
  import matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt
  fig,ax=plt.subplots(2,1,figsize=(18,7),sharex=True);t=np.arange(n)*.05;ax[0].plot(t,db,lw=.8);ax[0].set_ylim(-70,0);ax[0].set_ylabel('dB')
  ax[1].specgram(x,Fs=sr,NFFT=1024,noverlap=768,cmap='magma',vmin=-110);ax[1].set_ylim(0,8000)
  for sid,t0 in shots:
    for a in ax:a.axvline(t0,color='c',lw=.6)
    ax[0].text(t0+.05,-5,sid,fontsize=8,color='c')
  plt.tight_layout();plt.savefig(os.path.join(out,'audio.png'),dpi=80);print('ok',os.path.join(out,'audio.png'))
asyncio.run(main())
