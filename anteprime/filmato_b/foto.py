# Foto di prova del filmato B: python3 anteprime/filmato_b/foto.py <cartella> <t1> <t2> ... [--eroe cacciatrice] [--w 360 --h 640] [--sheet nome.png]
# Apre anteprime/filmato_b.html?foto=1 in Chromium senza finestra, disegna i fotogrammi a quei secondi e li salva (più un foglio con tutti).
import os,sys,asyncio
from playwright.async_api import async_playwright
here=os.path.dirname(os.path.abspath(__file__))
args=sys.argv[1:];out=args.pop(0);ver='AB';W=360;H=640;sheet=None;ts=[];lowfx=False;eroe='arciere'
while args:
  a=args.pop(0)
  if a=='--ver':ver=args.pop(0)
  elif a=='--w':W=int(args.pop(0))
  elif a=='--h':H=int(args.pop(0))
  elif a=='--sheet':sheet=args.pop(0)
  elif a=='--low':lowfx=True
  elif a=='--eroe':eroe=args.pop(0)
  else:ts.append(float(a))
os.makedirs(out,exist_ok=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':W,'height':H},device_scale_factor=2)
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append('console: '+m.text) if m.type=='error' else None)
    await pg.goto('file://'+os.path.join(here,'..','filmato_b.html')+'?foto=1&eroe='+eroe)
    await pg.wait_for_timeout(1200)
    if lowfx: await pg.evaluate('LOWFX=true') if False else None
    files=[]
    for t in ts:
      sid=await pg.evaluate(f'FILM.foto({t},"{ver}","{eroe}")')
      await pg.wait_for_timeout(1300 if t>=36.75 else 60)
      f=os.path.join(out,f'f_{t:06.2f}.png');el=await pg.query_selector('#introScr')
      await el.screenshot(path=f);files.append((t,sid,f))
    for e in errs[:12]:print('ERR',e)
    await b.close()
    if sheet and files:
      from PIL import Image,ImageDraw
      ims=[Image.open(f) for _,_,f in files];w,h=ims[0].size;sc=.5;cw,ch=int(w*sc),int(h*sc);cols=min(len(ims),5);rows=(len(ims)+cols-1)//cols
      S=Image.new('RGB',(cols*cw+(cols+1)*6,rows*(ch+22)+6),(30,30,30));d=ImageDraw.Draw(S)
      for i,(t,sid,f) in enumerate(files):
        im=ims[i].resize((cw,ch));x=6+(i%cols)*(cw+6);y=6+(i//cols)*(ch+22);S.paste(im,(x,y));d.text((x+4,y+ch+4),f'{sid}  t={t}',fill=(240,230,200))
      S.save(os.path.join(out,sheet));print('foglio',os.path.join(out,sheet))
asyncio.run(main())
