// L'aspetto dell'eroe (passo «Aspetto» della creazione e il barbiere: src/js/65-scelta-eroe.js; i pezzi in sprite/eroe3d/disegno_eroe.js):
// ogni scelta di ogni parte nelle quattro direzioni, in fogli PNG da guardare (tests/as_<parte>.png), più un aspetto completo sui quattro
// eroi (tests/as_eroi.png). Controlla che nessuna scelta dia errori in nessuna direzione né in nessuna mossa, che i pezzi si vedano
// davanti e non attraversino la testa da dietro, e che senza ritocchi lo stile dell'eroe resti lo stesso oggetto (eroe identico al pixel).
// Uso: python3 tests/mk.py && node tests/aspetto.js [eroe]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(fs.readFileSync(path.join(__dirname,'test.html'),'utf8'))});
const HERO=process.argv[2]||'arciere';
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:300}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:'+srv.address().port+'/test.html');await p.waitForTimeout(1000);
  const E=c=>p.evaluate(c=>__E(c),c);
  // a sheet: one row per look, the hero in four directions; head = only the head and shoulders, close
  const sheet=(file,rows,hero,head)=>p.evaluate(([rows,hero,head,GS])=>__E(`(()=>{const rows=${JSON.stringify(rows)},hero=${JSON.stringify(hero)},head=${head};
    const GS=${GS},SC=head?6.5:4,faces=[[Math.PI/2,'davanti'],[Math.PI/2-.75,'tre quarti'],[0,'lato'],[-Math.PI/2,'dietro']],cw=Math.round((head?30:44)*SC),ch=Math.round((head?29:56)*SC),lw=150,top=34;
    const c=document.createElement('canvas');c.width=lw+cw*4;c.height=top+ch*rows.length;const g=c.getContext('2d');g.fillStyle='#2f2924';g.fillRect(0,0,c.width,c.height);
    g.fillStyle='#d9c9a6';g.font='bold 15px sans-serif';g.textAlign='center';faces.forEach(([,n],i)=>g.fillText(n,lw+cw*i+cw/2,22));g.textAlign='left';
    const sv=ctx;ctx=g;G.t=1.3;
    try{rows.forEach((r,j)=>{const[label,lk,h]=r,y0=top+j*ch;g.fillStyle=j%2?'#3a332c':'#433b33';g.fillRect(0,y0,c.width,ch);
      g.fillStyle='#f3e6c8';g.font='bold 15px sans-serif';const ln=String(label).split('\\n');ln.forEach((t,i)=>g.fillText(t,10,y0+ch/2+(i-(ln.length-1)/2)*19));
      const st=GS(h||hero,lk);
      faces.forEach(([f],i)=>{g.save();g.beginPath();g.rect(lw+cw*i,y0,cw,ch);g.clip();
        EROE.arciere(lw+cw*i+cw/2,head?y0+ch/2+26.5*SC:y0+ch-14,f,'idle',.3,SC,{style:st,moss:false});g.restore()})})}
    finally{ctx=sv}
    return c.toDataURL('image/png')})()`),[rows,hero,head,GS]).then(u=>fs.writeFileSync(path.join(__dirname,file),Buffer.from(u.split(',')[1],'base64')));
  const L=await E("({cats:SCE_CATS.filter(c=>c.list).map(c=>({id:c.id,n:c.n,key:c.key,ckey:c.ckey||null,cn:c.cn||null,list:c.list.map(o=>({id:o.id,n:o.n})),cols:c.cols?c.cols.map(o=>({id:o.id,n:o.n})):null})),def:LOOK_DEF})");
  const lk=o=>({...L.def,...o});
  // the style as the game draws it: 62-eroe-3d.js gives the Druida his green eyes
  const GS="(h,lk)=>{const s=sceLookStyle(heroStyle0(h),lk);return s.hid==='druida'&&!s.eyes?{...s,eyes:s.eyeCol}:s}";
  // every choice of every part, on its own
  for(const C of L.cats){const head=C.id!=='acc',rows=C.list.map(o=>[`${C.n}:\n${o.n}`,lk({[C.key]:o.id})]);
    if(C.cols){const base=C.id==='occhi'?{occhi:'grandi'}:{capelli:'ciuffo'};for(const o of C.cols)rows.push([`${C.cn||'Colore'}:\n${o.n}`,lk({...base,[C.ckey]:o.id})])}
    await sheet(`as_${C.id}.png`,rows,HERO,head)}
  // a whole look on the four heroes (their own pieces stay: the Druida's antlers and green eyes, the Balestriere's helmet, the Cacciatrice's tail)
  const A={pelle:'dorata',occhi:'decisi',iride:'azzurri',sopr:'decise',segno:'cicatrice',capelli:'frangia',colCap:'rossi',acc:'sciarpa'},
    B={pelle:'scura',occhi:'grandi',iride:'ambra',sopr:'alzate',segno:'lentiggini',capelli:'riccioli',colCap:'bianchi',acc:'piuma'};
  const heroes=['arciere','cacciatrice','balestriere','druida'],names=await E("Object.fromEntries(HEROES.map(h=>[h.id,h.name]))");
  await sheet('as_eroi.png',heroes.flatMap(h=>[[`${names[h]||h}\nsenza ritocchi`,null,h],[`${names[h]||h}\naspetto A`,A,h],[`${names[h]||h}\naspetto B`,B,h]]),HERO,false);
  await sheet('as_eroi_viso.png',heroes.flatMap(h=>[[`${names[h]||h}\naspetto A`,A,h],[`${names[h]||h}\naspetto B`,B,h]]),HERO,true);
  ok(!errs.length,'i fogli: nessun errore'+(errs.length?': '+errs.slice(0,3).join(' | '):''));

  // every choice, every hero, every move, twelve directions: no errors, and the pieces drawn (a face piece shows in front, none from behind)
  const r=await E(`(()=>{const bad=[],moves=['idle','walk','aim','shoot','hit','dash'],c=document.createElement('canvas');c.width=160;c.height=200;const g=c.getContext('2d'),sv=ctx;ctx=g;G.t=.7;
    const draw=(st,f,a,p)=>{g.clearRect(0,0,160,200);EROE.arciere(80,186,f,a,p,3.4,{style:st,moss:false});return g.getImageData(0,0,160,200).data};
    const diff=(d1,d2)=>{let n=0;for(let i=3;i<d1.length;i+=4)if(Math.abs(d1[i-3]-d2[i-3])+Math.abs(d1[i-2]-d2[i-2])+Math.abs(d1[i-1]-d2[i-1])+Math.abs(d1[i]-d2[i])>8)n++;return n};
    let n=0,fr=0,bk=0;try{const GS=${GS};for(const h of ${JSON.stringify(heroes)}){const S0=GS(h,null);
      {const B=heroStyle0(h);if(sceLookStyle(B,{...LOOK_DEF})!==B||sceLookStyle(B,null)!==B)bad.push(h+': senza ritocchi lo stile cambia')}
      for(const C of SCE_CATS){if(!C.list)continue;for(const o of C.list){const look={...LOOK_DEF,[C.key]:o.id};if(o.id===LOOK_DEF[C.key])continue;const st=GS(h,look);
        for(const a of moves)for(let k=0;k<12;k++){const f=k/12*Math.PI*2;try{EROE.arciere(80,186,f,a,(k*.37)%1,3.4,{style:st,moss:false});n++}catch(e){bad.push(h+' '+o.id+' '+a+': '+e.message)}}
        // seen from the front the piece changes the picture; seen from straight behind a face piece must not show through the head
        const front=diff(draw(S0,Math.PI/2,'idle',.3),draw(st,Math.PI/2,'idle',.3));if(sceHides(h,C.key,o.id)){if(front>12)bad.push(h+' '+o.id+': nascosto per la scheda, ma davanti si vede ('+front+' px)')}else if(front<6)bad.push(h+' '+o.id+': davanti non si vede ('+front+' px)');else fr++;
        if(C.cam==='face'&&C.id!=='capelli'&&C.id!=='pelle'){const back=diff(draw(S0,-Math.PI/2,'idle',.3),draw(st,-Math.PI/2,'idle',.3));if(back>4)bad.push(h+' '+o.id+': da dietro si vede attraverso la testa ('+back+' px)');else bk++}}}}}
    finally{ctx=sv}return{bad,n,fr,bk}})()`);
  ok(!r.bad.length,`${r.n} disegni (4 eroi, ogni scelta, 6 mosse, 12 direzioni) senza errori; ${r.fr} scelte che si vedono davanti, ${r.bk} del viso nascoste da dietro`+(r.bad.length?' — '+r.bad.slice(0,8).join('; '):''));
  // the costs: the hero with a whole look against the hero of always (the same drawing, a few pieces more)
  const t=await E(`(()=>{const c=document.createElement('canvas');c.width=300;c.height=400;const g=c.getContext('2d'),sv=ctx;ctx=g;const S0=heroStyle0('arciere'),SA=sceLookStyle(S0,${JSON.stringify(A)}),SB=sceLookStyle(S0,${JSON.stringify(B)});
    const T=st=>{const t0=performance.now();for(let i=0;i<300;i++){G.t=i/60;EROE.arciere(150,380,i*.05,'walk',(i/40)%1,6,{style:st,moss:false})}g.getImageData(0,0,1,1);return(performance.now()-t0)/300};
    try{T(S0);return{o:T(S0),a:T(SA),b:T(SB)}}finally{ctx=sv}})()`);
  console.log(`        un eroe grande: ${t.o.toFixed(2)} ms senza ritocchi, ${t.a.toFixed(2)} ms con l'aspetto A, ${t.b.toFixed(2)} ms con il B`);ok(t.a<t.o*1.6+.3&&t.b<t.o*1.6+.3,'l\'aspetto costa poco in più');
  ok(!errs.length,'nessun errore nella pagina'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
  console.log(fails?`\n${fails} controlli NON passati`:'\nTutto a posto. Fogli: tests/as_*.png');await b.close();srv.close();process.exit(fails?1:0)})();
