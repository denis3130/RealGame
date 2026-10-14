// Le ricariche di tutte le dodici armi zombie in un foglio solo, per Denis: una riga per arma, nel momento più chiaro della ricarica
// (il caricatore che esce, il tamburo aperto coi bossoli, la cartuccia in mano, il razzo portato al tubo...), nelle quattro direzioni.
// Uso: python3 tests/mk.py && node tests/ricarica_tutte.js [file.png]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const OUT=process.argv[2]||path.join(__dirname,'ricarica_tutte.png');
const ROWS=[['pistola',.15,'Pistola: il caricatore esce'],['revolver',.19,'Revolver: tamburo aperto, i bossoli escono'],['mitraglietta',.15,'Mitraglietta: il caricatore esce'],['mitra',.38,'Mitra: porta il caricatore nuovo'],
  ['mitragliatrice',.15,'Mitragliatrice: la cassetta scende'],['pompa',.45,'Pompa: la cartuccia in mano'],['tattica',.45,'Tattica: la cartuccia dal fianco'],['lanciarazzi',.1,'Lanciarazzi: porta il razzo'],
  ['tamburo',.15,'Tamburo: il tamburo scende'],['lanciafiamme',.15,'Lanciafiamme: la bombola scende'],['vapore',.15,'Vapore: la stecca dei chiodi'],['risonatore',.15,'Risonatore: il cristallo esce']];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,handSeen:1}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1800);
  const url=await p.evaluate(R=>__E(`(()=>{const ROWS=${JSON.stringify(R)},CW=190,CH=170,W0=4*CW,H0=ROWS.length*CH+34,C=document.createElement('canvas');C.width=W0*2;C.height=H0*2;const g=C.getContext('2d');g.scale(2,2);
    g.fillStyle='#22282f';g.fillRect(0,0,W0,H0);g.font='600 13px system-ui';g.textAlign='center';g.fillStyle='#e8e2d4';
    const dirs=[['davanti',Math.PI/2],['lato',0],['dietro',-Math.PI/2],['altro lato',Math.PI]];dirs.forEach((d,i)=>g.fillText(d[0],i*CW+CW/2,22));const sv=ctx;ctx=g;
    try{ROWS.forEach(([id,k,lab],j)=>{const D=ARMI.DATI[id],gs=ARMI.nuova(id);let n=0;while(gs.mag>0&&n++<400){gs.cd=0;gs.update(1/60,true);gs.update(1/60,false)}
        for(let i=0;i<40;i++)gs.update(1/60,false);if(gs.st!=='ricarica')gs.ricarica();const tt=(gs.t<0?-gs.t:0)+k*D.rel;let t=0;while(t<tt){gs.update(1/240,false);t+=1/240}const gp=gs.pose(),st=Object.assign({},HERO,{hid:'arciere',held:null,quiver:false,gun:id});
        if(j%2){g.fillStyle='rgba(255,255,255,.03)';g.fillRect(0,34+j*CH,W0,CH)}
        dirs.forEach((d,i)=>{const x=i*CW+CW/2,y=34+j*CH+CH-22;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,30,9,0,0,Math.PI*2);g.fill();EROE.arciere(x,y,d[1],'idle',.25,2.15,{style:st,noFx:true,gp})});
        g.textAlign='left';g.fillStyle='#c8d0bf';g.font='600 12px system-ui';g.fillText(lab,8,34+j*CH+15);g.textAlign='center';g.font='600 13px system-ui';g.fillStyle='#e8e2d4'})}finally{ctx=sv}
    return C.toDataURL('image/png')})()`),ROWS);
  fs.writeFileSync(OUT,Buffer.from(url.split(',')[1],'base64'));console.log(OUT,'ERR',JSON.stringify(errs));await b.close()})();
