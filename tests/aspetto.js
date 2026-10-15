// L'aspetto dell'eroe (passo «Aspetto» della creazione e il barbiere: src/js/89-scelta-eroe.js; i pezzi in sprite/eroe3d/disegno_eroe.js):
// ogni scelta di ogni parte nelle quattro direzioni, in fogli PNG da guardare (tests/as_<parte>.png; capelli, orecchie, barba e accessori
// anche senza cappuccio: as_<parte>_senza.png), i colori di ogni parte, le grandezze (as_grandezze.png), più due aspetti completi sui quattro eroi
// (as_eroi.png, as_eroi_viso.png). Controlla che nessuna scelta (né grandezza né colore) dia errori in nessuna direzione né in nessuna mossa,
// che i pezzi si vedano davanti e non attraversino la testa da dietro, che ogni colore cambi il disegno, che i riquadri della schermata si disegnino tutti, e che senza
// ritocchi lo stile dell'eroe resti lo stesso oggetto (eroe identico al pixel).
// Uso: python3 tests/mk.py && node tests/aspetto.js [eroe]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(fs.readFileSync(path.join(__dirname,'test.html'),'utf8'))});
const HERO=process.argv[2]||'arciere';
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:300}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:'+srv.address().port+'/test.html');await p.waitForTimeout(1000);
  const E=c=>p.evaluate(c=>__E(c),c);
  // a sheet: one row per look, the hero in four directions; mode: 'head' only the head, close; 'mid' the head and the shoulders; else whole
  const sheet=(file,rows,hero,mode)=>p.evaluate(([rows,hero,mode,GS])=>__E(`(()=>{const rows=${JSON.stringify(rows)},hero=${JSON.stringify(hero)},mode=${JSON.stringify(mode||'')};
    const GS=${GS},SC=mode==='head'?6.5:mode==='mid'?5:4,faces=[[Math.PI/2,'davanti'],[Math.PI/2-.75,'tre quarti'],[0,'lato'],[-Math.PI/2,'dietro']],
      cw=Math.round((mode==='head'?30:mode==='mid'?34:44)*SC),ch=Math.round((mode==='head'?31:mode==='mid'?40:56)*SC),lw=170,top=34;
    const c=document.createElement('canvas');c.width=lw+cw*4;c.height=top+ch*rows.length;const g=c.getContext('2d');g.fillStyle='#2f2924';g.fillRect(0,0,c.width,c.height);
    g.fillStyle='#d9c9a6';g.font='bold 15px sans-serif';g.textAlign='center';faces.forEach(([,n],i)=>g.fillText(n,lw+cw*i+cw/2,22));g.textAlign='left';
    const sv=ctx;ctx=g;G.t=1.3;
    try{rows.forEach((r,j)=>{const[label,lk,h]=r,y0=top+j*ch;g.fillStyle=j%2?'#3a332c':'#433b33';g.fillRect(0,y0,c.width,ch);
      g.fillStyle='#f3e6c8';g.font='bold 15px sans-serif';const ln=String(label).split('\\n');ln.forEach((t,i)=>g.fillText(t,10,y0+ch/2+(i-(ln.length-1)/2)*19));
      const st=GS(h||hero,lk);
      faces.forEach(([f],i)=>{g.save();g.beginPath();g.rect(lw+cw*i,y0,cw,ch);g.clip();
        EROE.arciere(lw+cw*i+cw/2,mode==='head'?y0+ch*.47+26.5*SC:mode==='mid'?y0+ch*.36+26.5*SC:y0+ch-14,f,'idle',.3,SC,{style:st,moss:false});g.restore()})})}
    finally{ctx=sv}
    return c.toDataURL('image/png')})()`),[rows,hero,mode,GS]).then(u=>fs.writeFileSync(path.join(__dirname,file),Buffer.from(u.split(',')[1],'base64')));
  const L=await E("({cats:SCE_CATS.filter(c=>c.list).map(c=>({id:c.id,n:c.n,key:c.key,ckey:c.ckey||null,cn:c.cn||null,cshare:!!c.cshare,size:c.size||null,list:c.list.map(o=>({id:o.id,n:o.n})),cols:c.cols?c.cols.map(o=>({id:o.id,n:o.n})):null})),def:LOOK_DEF,K:LOOK_K,kmin:LOOK_KMIN,kmax:LOOK_KMAX})");
  const lk=o=>({...L.def,...o});
  // the style as the game draws it: 62-eroe-3d.js gives the Druida his green eyes
  const GS="(h,lk)=>{const s=sceLookStyle(heroStyle0(h),lk);return s.hid==='druida'&&!s.eyes?{...s,eyes:s.eyeCol}:s}";
  const MODE={cappuccio:'',capelli:'head',orecchie:'head',pelle:'head',occhi:'head',sopr:'head',bocca:'head',segni:'head',tatuaggi:'head',barba:'mid',acc:''};
  const DOWN={capelli:1,orecchie:1,barba:1,acc:1};
  // every choice of every part, on its own (and without the hood where it matters); the colours of the part, on a choice that shows them
  const CB={occhi:{occhi:'grandi'},capelli:{capelli:'ciuffo',cappuccio:'senza'},sopr:{sopr:'folte'},bocca:{bocca:'sorrisone'},segni:{segno:'pittura'},tatuaggi:{tatuaggio:'tribale'},barba:{barba:'barba',cappuccio:'senza'},acc:{acc:'sciarpa'},cappuccio:{cappuccio:'punta'}};
  for(const C of L.cats){const rows=C.list.map(o=>[`${C.n}:\n${o.n}`,lk({[C.key]:o.id})]);
    if(C.cols)for(const o of C.cols)rows.push([`${C.cn||'Colore'}:\n${o.n}`,lk({...(CB[C.id]||{}),[C.ckey]:o.id})]);
    await sheet(`as_${C.id}.png`,rows,HERO,MODE[C.id]);
    if(DOWN[C.id])await sheet(`as_${C.id}_senza.png`,C.list.map(o=>[`${C.n}:\n${o.n}\nsenza cappuccio`,lk({[C.key]:o.id,cappuccio:'senza'})]),HERO,MODE[C.id])}
  // the sizes: the smallest, as drawn, the biggest
  const SZ={capelli:['riccioli',{cappuccio:'senza'}],occhi:['grandi'],sopr:['folte'],bocca:['sorrisone'],segno:['lentiggini'],tatuaggio:['spirale'],barba:['barba',{cappuccio:'senza'}],orecchie:['lunghe']};
  const szRows=[];for(const k of L.K){const C=L.cats.find(c=>c.size===k),[id,more]=SZ[k];for(const v of[L.kmin,1,L.kmax])szRows.push([`${C.n} (${C.list.find(o=>o.id===id).n}):\n${Math.round(v*100)}%`,{...lk({[C.key]:id,...(more||{})}),k:{[k]:v}}])}
  await sheet('as_grandezze.png',szRows,HERO,'mid');
  // two whole looks on the four heroes (their own pieces stay: the Druida's antlers and green eyes, the Balestriere's helmet, the Cacciatrice's tail)
  const A={pelle:'dorata',occhi:'decisi',iride:'azzurri',sopr:'decise',bocca:'ghigno',segno:'cicatrice',capelli:'frangia',colCap:'rossi',barba:'barbetta',orecchie:'punta',acc:'sciarpa',colAcc:'verde',colBarba:'neri'},
    B={pelle:'scura',occhi:'grandi',iride:'ambra',sopr:'alzate',bocca:'sorriso',segno:'lentiggini',capelli:'riccioli',colCap:'bianchi',orecchie:'gatto',cappuccio:'senza',acc:'piuma',colSopr:'neri',colBocca:'rosso',k:{occhi:1.15,capelli:1.1}};
  const heroes=['arciere','cacciatrice','balestriere','druida','bardo','alchimista','ninja'],names=await E("Object.fromEntries(HEROES.map(h=>[h.id,h.name]))");
  await sheet('as_eroi.png',heroes.flatMap(h=>[[`${names[h]||h}\nsenza ritocchi`,null,h],[`${names[h]||h}\naspetto A`,A,h],[`${names[h]||h}\naspetto B`,B,h]]),HERO,'');
  await sheet('as_eroi_viso.png',heroes.flatMap(h=>[[`${names[h]||h}\naspetto A`,A,h],[`${names[h]||h}\naspetto B`,B,h]]),HERO,'head');
  ok(!errs.length,'i fogli: nessun errore'+(errs.length?': '+errs.slice(0,3).join(' | '):''));

  // every choice and every size, every hero, every move, twelve directions: no errors, and the pieces drawn (a face piece shows in front,
  // none from behind)
  const r=await E(`(()=>{const bad=[],moves=['idle','walk','aim','shoot','hit','dash'],c=document.createElement('canvas');c.width=160;c.height=200;const g=c.getContext('2d'),sv=ctx;ctx=g;G.t=.7;
    const draw=(st,f,a,p)=>{g.clearRect(0,0,160,200);EROE.arciere(80,186,f,a,p,3.4,{style:st,moss:false});return g.getImageData(0,0,160,200).data};
    const diff=(d1,d2)=>{let n=0;for(let i=3;i<d1.length;i+=4)if(Math.abs(d1[i-3]-d2[i-3])+Math.abs(d1[i-2]-d2[i-2])+Math.abs(d1[i-1]-d2[i-1])+Math.abs(d1[i]-d2[i])>8)n++;return n};
    let n=0,fr=0,bk=0,cl=0;
    // the colours a style really draws with (a colour picked equal to the one of always changes nothing)
    const EF=st=>{const L=st.look||{};return JSON.stringify([L.iris,L.browCol,L.beardCol||L.hairCol,L.hairCol,L.lipCol,L.markCol,L.accCol,SCE_ACCFIX[L.acc]?L.accFix||null:null,L.tatCol||null,L.hatCol||(EROE.hatCol[L.hood]||null)])};
    try{const GS=${GS};for(const h of ${JSON.stringify(heroes)}){const S0=GS(h,null);
      {const B=heroStyle0(h);if(sceLookStyle(B,{...LOOK_DEF})!==B||sceLookStyle(B,null)!==B||sceLookStyle(B,{...LOOK_DEF,k:{occhi:1}})!==B)bad.push(h+': senza ritocchi lo stile cambia')}
      const tries=[];for(const C of SCE_CATS){if(!C.list)continue;for(const o of C.list)if(o.id!==LOOK_DEF[C.key])tries.push({C,id:o.id,look:{...LOOK_DEF,[C.key]:o.id}})}
      for(const k of LOOK_K){const C=SCE_CATS.find(c=>c.size===k),o=C.list.find(x=>x.id!==LOOK_NONE[k]&&x.id!==LOOK_DEF[C.key])||C.list[1];for(const v of[LOOK_KMIN,LOOK_KMAX])tries.push({C,id:o.id+'@'+v,look:{...LOOK_DEF,[C.key]:o.id,k:{[k]:v}},size:1})}
      const CB=${JSON.stringify({occhi:{occhi:'grandi'},capelli:{capelli:'ciuffo',cappuccio:'senza'},sopr:{sopr:'folte'},bocca:{bocca:'sorrisone'},segni:{segno:'pittura'},tatuaggi:{tatuaggio:'tribale'},barba:{barba:'barba',cappuccio:'senza'},acc:{acc:'sciarpa'},cappuccio:{cappuccio:'punta'}})};
      for(const C of SCE_CATS){if(!C.cols||(C.id==='occhi'&&h==='druida'))continue;const base={...LOOK_DEF,...CB[C.id]};
        for(const o of C.cols)if(o.id!==LOOK_DEF[C.ckey])tries.push({C,id:C.ckey+':'+o.id,look:{...base,[C.ckey]:o.id},base,size:1})}
      for(const T of tries){const st=GS(h,T.look);
        for(const a of moves)for(let k=0;k<12;k++){const f=k/12*Math.PI*2;try{EROE.arciere(80,186,f,a,(k*.37)%1,3.4,{style:st,moss:false});n++}catch(e){bad.push(h+' '+T.id+' '+a+': '+e.message)}}
        // a colour must change the picture (unless the piece does not show on this hero, or the colour is the one it had anyway)
        if(T.base){const sb=GS(h,T.base);if(!sceHides(h,T.C.key,T.base[T.C.key])&&EF(sb)!==EF(st)){const d=diff(draw(sb,Math.PI/2-.4,'idle',.3),draw(st,Math.PI/2-.4,'idle',.3));if(d<3)bad.push(h+' '+T.id+': il colore non si vede ('+d+' px)');else cl++}}
        if(T.size)continue;
        // seen from the front the piece changes the picture; seen from straight behind a face piece must not show through the head
        const front=diff(draw(S0,Math.PI/2,'idle',.3),draw(st,Math.PI/2,'idle',.3));if(sceHides(h,T.C.key,T.id)){if(front>12)bad.push(h+' '+T.id+': nascosto per la scheda, ma davanti si vede ('+front+' px)')}else if(front<6)bad.push(h+' '+T.id+': davanti non si vede ('+front+' px)');else fr++;
        if(T.C.cam==='face'&&T.C.id!=='pelle'){const back=diff(draw(S0,-Math.PI/2,'idle',.3),draw(st,-Math.PI/2,'idle',.3));if(back>4)bad.push(h+' '+T.id+': da dietro si vede attraverso la testa ('+back+' px)');else bk++}}}}
    finally{ctx=sv}return{bad,n,fr,bk,cl}})()`);
  ok(!r.bad.length,`${r.n} disegni (${heroes.length} eroi, ogni scelta, grandezza e colore, 6 mosse, 12 direzioni) senza errori; ${r.fr} scelte che si vedono davanti, ${r.bk} del viso nascoste da dietro, ${r.cl} colori che cambiano il disegno`+(r.bad.length?' — '+r.bad.slice(0,40).join('; '):''));
  // the tiles of the screen: every choice of every part drawn, on every hero (a tile is never empty)
  const t2=await E(`(()=>{const bad=[];let n=0;const keep={sel:SCE.sel,look:SCE.look,manto:SCE.manto};try{for(const h of ${JSON.stringify(heroes)}){SCE.sel=h;SCE.look=sceLook(null);SCE.manto='';
      for(const C of SCE_CATS)for(const o of(C.id==='manto'?SCE_MANTI:C.list)){const cv=document.createElement('canvas');sceTileDraw(cv,C,o.id,48);const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let k=0;for(let i=3;i<d.length;i+=4)if(d[i]>40)k++;
        if(k<d.length/4*.12)bad.push(h+' '+C.id+' '+o.id+' ('+Math.round(k/(d.length/4)*100)+'%)');n++}}}finally{Object.assign(SCE,keep)}return{bad,n}})()`);
  ok(!t2.bad.length,`${t2.n} riquadri della schermata disegnati (ogni scelta su ogni eroe)`+(t2.bad.length?' — vuoti: '+t2.bad.slice(0,8).join(', '):''));
  // the costs: the hero with a whole look against the hero of always (the same drawing, a few pieces more; without the hood a whole head of
  // hair, the hood on the back and round the neck), big as in the menu and small as in battle
  const t=await E(`(()=>{const c=document.createElement('canvas');c.width=300;c.height=400;const g=c.getContext('2d'),sv=ctx;ctx=g;const S0=heroStyle0('arciere'),SA=sceLookStyle(S0,${JSON.stringify(A)}),SB=sceLookStyle(S0,${JSON.stringify(B)});
    const T=(st,sc)=>{const t0=performance.now();for(let i=0;i<300;i++){G.t=i/60;EROE.arciere(150,380,i*.05,'walk',(i/40)%1,sc,{style:st,moss:false})}g.getImageData(0,0,1,1);return(performance.now()-t0)/300};
    try{T(S0,6);T(SB,6);return{o:T(S0,6),a:T(SA,6),b:T(SB,6),so:T(S0,1.3),sa:T(SA,1.3),sb:T(SB,1.3)}}finally{ctx=sv}})()`);
  console.log(`        un eroe grande: ${t.o.toFixed(2)} ms senza ritocchi, ${t.a.toFixed(2)} ms con l'aspetto A, ${t.b.toFixed(2)} ms con il B (senza cappuccio)`);
  console.log(`        in battaglia: ${t.so.toFixed(2)} ms, ${t.sa.toFixed(2)} ms, ${t.sb.toFixed(2)} ms`);
  ok(t.a<t.o*1.6+.3&&t.b<t.o*2+.3&&t.sa-t.so<1.2&&t.sb-t.so<1.6,'l\'aspetto costa poco in più');
  ok(!errs.length,'nessun errore nella pagina'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
  console.log(fails?`\n${fails} controlli NON passati`:'\nTutto a posto. Fogli: tests/as_*.png');await b.close();srv.close();process.exit(fails?1:0)})();
