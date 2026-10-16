# Il gioco su claude.ai, diviso in tre pezzi: la pagina (piccola: le scritte e la schermata d'avvio), stile.css (tutto lo stile) e gioco.js
# (tutto il codice). Così, quando una chat nuova deve aggiornare la pagina pubblicata, claude.ai le chiede di rileggere solo la pagina piccola
# e non i 3 MB del gioco intero (16 ottobre: con un file solo l'aggiornamento chiedeva di rileggere 23.000 righe).
# index.html non cambia: la divisione sta solo nella copia per claude.ai (app/claude/, non va su git).
# Uso: python3 app/mk_claude.py                 → costruisce index.html (build.py) e poi app/claude/
#      python3 app/mk_claude.py <index.html> <cartella>   → divide quel file in quella cartella (senza costruire)
# Poi si pubblica app/claude/index.html con files {"stile.css": …, "gioco.js": …} allo stesso indirizzo (in CLAUDE.md).
import os,re,sys,subprocess
here=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(here)
if len(sys.argv)>2:src,out=sys.argv[1],sys.argv[2]
else:
  subprocess.run([sys.executable,os.path.join(root,'build.py')],check=True)
  src,out=os.path.join(root,'index.html'),os.path.join(here,'claude')
html=open(src,encoding='utf-8',newline='').read()
# the game's script: the first <script> of the page (src/pagina.html ends with it) up to its </script> (the start of src/coda.html)
a=html.index('<script>');b=html.index('</script>',a)
head,code,tail=html[:a],html[a+len('<script>'):b],html[b+len('</script>'):]
if 'window.__mbGo' not in code:sys.exit('non trovo il codice del gioco (window.__mbGo) nel primo <script>')
# the style blocks of the page, in their order, into stile.css (the first one becomes the link, the others go away)
css=[];first=[True]
def cut(m):
  css.append(m.group(1))
  if first[0]:first[0]=False;return '<link rel="stylesheet" href="stile.css">'
  return ''
head=re.sub(r'<style>(.*?)</style>',cut,head,flags=re.S)
if not css:sys.exit('nessuno stile nella pagina')
os.makedirs(out,exist_ok=True)
page=head+'<script src="gioco.js" charset="utf-8"></script>'+tail
open(os.path.join(out,'index.html'),'w',encoding='utf-8',newline='').write(page)
open(os.path.join(out,'stile.css'),'w',encoding='utf-8',newline='').write('@charset "UTF-8";\n'+'\n'.join(css))
open(os.path.join(out,'gioco.js'),'w',encoding='utf-8',newline='').write(code)
kb=lambda s:len(s.encode('utf-8'))/1024
print(os.path.relpath(out,root)+': pagina %.0f KB (%d righe), stile %.0f KB, gioco %.0f KB'%(kb(page),page.count('\n')+1,kb('\n'.join(css)),kb(code)))
