// Le ricariche delle armi zombie in 3D (Denis, 14 ottobre: «miglioriamo le animazioni delle pistole, cioè la ricarica»): per ogni arma un
// foglio con l'eroe nelle quattro direzioni (davanti, lato, dietro, altro lato) in otto momenti della ricarica, con lo stato vero dell'arma
// (ARMI.nuova(id): si spara fino a vuotarla, si ricarica e si ferma il tempo al momento giusto). Uso: python3 tests/mk.py && node tests/ricarica4.js
// [armi...] [--out cartella] → ricarica_<arma>.png
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const args=process.argv.slice(2),oi=args.indexOf('--out'),OUT=oi>=0?args.splice(oi,2)[1]:__dirname;
const ALL=['pistola','revolver','mitraglietta','mitra','mitragliatrice','pompa','tattica','lanciarazzi','tamburo','lanciafiamme','vapore','risonatore'],ids=args.length?args:ALL;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,handSeen:1}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1800);
  for(const id of ids){
    const url=await p.evaluate(id=>__E(`(()=>{const id=${JSON.stringify(id)},sh=id==='pompa'||id==='tattica',D=ARMI.DATI[id];
      // the moments: k along the reload (shotguns: the shell's f, for the first and a later shell)
      const ks=sh?[[-1,'pronta'],[.05,'1ª cartuccia: va alla cintura'],[.3,'la prende'],[.5,'sotto la finestrella'],[.7,'la spinge dentro'],[1.15,'2ª: va a prenderla'],[1.62,'la spinge'],[9,'pompa e pronta']]
        :id==='revolver'?[[-1,'pronta'],[.1,'apre il tamburo'],[.19,'butta fuori i bossoli'],[.27,'prende i colpi'],[.42,'colpo dopo colpo'],[.7,'gli ultimi'],[.88,'lo chiude'],[.97,'pronta']]
        :id==='lanciarazzi'?[[-1,'pronta'],[.1,'va alla cintura'],[.22,'porta il razzo'],[.4,'lo infila'],[.62,'lo spinge'],[.8,'dentro'],[.92,'torna'],[1.2,'pronta']]
        :[[-1,'pronta'],[.06,'va al caricatore'],[.15,'lo tira fuori'],[.25,'cade, va alla cintura'],[.38,'porta quello nuovo'],[.58,'lo spinge dentro'],[.76,'tira il carrello'],[.94,'torna']];
      const W0=4*230,H0=ks.length*215+40,C=document.createElement('canvas');C.width=W0*2;C.height=H0*2;const g=C.getContext('2d');g.scale(2,2);
      g.fillStyle='#27303a';g.fillRect(0,0,W0,H0);g.font='600 13px system-ui';g.fillStyle='#e8e2d4';g.textAlign='center';
      const dirs=[['davanti',Math.PI/2],['lato',0],['dietro',-Math.PI/2],['altro lato',Math.PI]];dirs.forEach((d,i)=>g.fillText(d[0],i*230+115,22));
      const st=Object.assign({},HERO,{hid:'arciere',held:null,quiver:false,gun:id}),sv=ctx;ctx=g;const savedT=G.t;
      try{ks.forEach((kk,j)=>{const gs=ARMI.nuova(id);
          if(kk[0]>=0){// empty it, then reload to the moment
            let n=0;while(gs.mag>0&&n++<400){gs.cd=0;gs.update(1/60,true);gs.update(1/60,false)}
            for(let i=0;i<40;i++)gs.update(1/60,false);if(gs.st!=='ricarica')gs.ricarica();
            const R=sh?D.rel:D.rel,tt=(gs.t<0?-gs.t:0)+kk[0]*R;let t=0;const dt=1/240;while(t<tt){gs.update(dt,false);t+=dt}}
          const gp=gs.pose();
          dirs.forEach((d,i)=>{const x=i*230+115,y=40+j*215+182;g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,36,10,0,0,Math.PI*2);g.fill();g.restore();
            EROE.arciere(x,y,d[1],'idle',.25,2.5,{style:st,noFx:true,gp})});
          g.textAlign='left';g.fillStyle='#b8b0a0';g.fillText(kk[1],8,40+j*215+16);g.textAlign='center';g.fillStyle='#e8e2d4'})}finally{ctx=sv;G.t=savedT}
      return C.toDataURL('image/png')})()`),id);
    const f=path.join(OUT,'ricarica_'+id+'.png');fs.writeFileSync(f,Buffer.from(url.split(',')[1],'base64'));console.log(f)}
  console.log('ERR',JSON.stringify(errs));await b.close()})();
