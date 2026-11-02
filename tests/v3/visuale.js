// La visuale in terza e prima persona della modalità zombie (src/js/105-visuale-3d.js, anteprime/mk_visuale.py): prima python3 tests/v3/mk.py.
// L'eroe in 3D vero in terza persona e l'arma in 3D in prima persona; il foglio delle quattro direzioni dell'eroe (tests/v3/vi_eroe4.png).
// La partita parte in terza persona; il terreno e la mappa in 3D; camminare va dove guarda la telecamera, girare la visuale la gira; si spara
// allo zombie davanti; in prima persona l'arma in mano e il colpo dalla canna; in casa il tetto sparisce; la telecamera non entra nei muri;
// la Bara; dall'alto torna come prima; effetti bassi; i tempi. Il tripla A: zombie e boss in 3D (106), gli effetti della battaglia (107), l'erba,
// i coni di luce col pulviscolo e le nuvole sulla luna (108). Foto in tests/v3/vi_*.png.
const {chromium}=require('playwright');const path=require('path');const D=path.join(__dirname,'/');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});// (the test browser draws 3D without a graphics card: slow, so 1×)
  const p=await b.newPage({viewport:{width:390,height:763},deviceScaleFactor:1});const errs=[];
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  let nok=0,nno=0;const ok=(t,c,x)=>{if(c)nok++;else nno++;console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''))};
  await p.goto('file://'+path.join(__dirname,'test_v3.html'));await p.waitForTimeout(2500);const E=s=>p.evaluate(s=>window.__E(s),s),J=async s=>JSON.parse(await E(s));
  await E(`try{closeSheet()}catch(e){};SAVE.modo='zombie';SAVE.hero='arciere';SAVE.runs=Math.max(1,SAVE.runs||0);zGo();0`);
  for(let i=0;i<120;i++){await p.waitForTimeout(500);if(await E(`!!(ZG.on&&ZM.W.director&&ZM.W.director.st)`))break}
  for(let i=0;i<90;i++){await p.waitForTimeout(300);if(await E(`!!(window.__V3&&__V3.built&&__V3.on)`))break}
  await E(`ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;__V3.noLow=1;__V3.low=false;SAVE.set.q='alta';LOWFX=false;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);await p.waitForTimeout(800);
  const s0x=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);
  const s0=await J(`JSON.stringify({mode:__V3.mode,on:ZM.W.v3.on,btn:(document.getElementById('v3btn')||{}).textContent||'',ground:G3.ground.length,pages:V3A.pages.length,gl:__V3.gl.getError(),tb:Math.round(__V3.tBuild)})`);
  ok('la partita parte da sola in terza persona, col bottone «Visuale» e il mondo in 3D (terreno, fogli delle texture)',s0.mode==='terza'&&s0.on&&/Terza persona/.test(s0.btn)&&s0.ground>0&&s0.pages>0&&s0.gl===0,s0);
  // the map as well made as from above: the ground's photo whole (1.5 pixels a unit) with its fine detail, the near walls painted sharp
  // (4 pixels a unit, the engine's own recipe), the camera free next to the lamp post, the life of the map (fireflies, mist, crows, smoke)
  await p.waitForTimeout(1500);
  const mp=await J(`JSON.stringify({gk:+(G3.ground[0].pw/G3.ground[0].w).toFixed(2),det:!!G3.detT,near:__V3.nNear||0,ready:G3.props.filter(p=>v3NearOk(p)).length,life:__V3.nLife||0})`);
  ok('la mappa fatta come dall\'alto: il terreno intero col dettaglio, i muri vicini ridipinti nitidi, la vita della mappa',mp.gk>=1.4&&mp.det&&mp.near>0&&mp.ready>0&&mp.life>0,mp);
  {const r=await J(`(()=>{const h=ZM.W.hero;h.x=409.6;h.y=1301.6;window.__MZ.view(0);return JSON.stringify(1)})()`);await p.waitForTimeout(2500);
    const k=await E(`+__V3.camK.toFixed(2)`);ok('accanto al lampione la telecamera resta dietro l\'eroe (non gli finisce addosso)',k>=.6,{k});await E(`ZM.W.hero.x=${s0x[0]};ZM.W.hero.y=${s0x[1]};0`);await p.waitForTimeout(400)}
  await p.screenshot({path:D+'vi_terza.png'});
  // walking: forward goes where the camera looks; after turning the view, the new way
  const home=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);// (each walk starts from the start of the match, in the open)
  const walk=async(key,ms)=>{await E(`ZM.W.hero.x=${home[0]};ZM.W.hero.y=${home[1]};0`);await p.waitForTimeout(200);const a=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y,__V3.th])`);await p.keyboard.down(key);await p.waitForTimeout(ms);await p.keyboard.up(key);await p.waitForTimeout(150);
    const c=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);return{d:Math.hypot(c[0]-a[0],c[1]-a[1]),a:Math.atan2(c[1]-a[1],c[0]-a[0]),th:a[2]}};
  const dA=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  const w1=await walk('KeyW',2200);ok('in terza persona la levetta in su (W) porta l\'eroe dove guarda la telecamera',w1.d>25&&dA(w1.a,w1.th)<.3,w1);
  const th0=await E(`__V3.th`);await p.keyboard.down('KeyE');await p.waitForTimeout(900);await p.keyboard.up('KeyE');await p.waitForTimeout(900);const th1=await E(`__V3.th`);
  const w2=await walk('KeyW',2200);ok('girando la visuale (E) la telecamera gira e l\'eroe cammina nella direzione nuova',dA(th0,th1)>.3&&w2.d>20&&dA(w2.a,th1)<.3,{th0,th1,w2});
  const w3=await walk('KeyD',2200);ok('a destra (D) va alla destra della telecamera',w3.d>20&&dA(w3.a,th1+Math.PI/2)<.35,w3);
  // a zombie ahead: the hero shoots it
  const put=(off,dist)=>E(`(()=>{const h=ZM.W.hero,f=__V3.th+(${off});for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const k=window.__MZ.addZombie('zombie',h.x+Math.cos(f)*${dist},h.y+Math.sin(f)*${dist},0);const z=ZM.W.Z[k];z.hp=99999;z.q=1;z.stun=999;return 1})()`);
  await E(`ZM.W.hero.x=${home[0]};ZM.W.hero.y=${home[1]};window.__MZ.view(0);0`);await p.waitForTimeout(500);// (from the start, looking north along the path)
  await put(0,130);await p.waitForTimeout(600);const n0=await E(`MZ.shots`);await p.waitForTimeout(4000);const n1=await E(`MZ.shots`),f1=await E(`__V3.figs`);await p.screenshot({path:D+'vi_terza_spara.png'});
  ok('uno zombie davanti: in terza persona l\'eroe gli spara, zombie ed eroe disegnati',n1-n0>=1&&/z/.test(f1)&&/h/.test(f1),{colpi:n1-n0,figure:f1});
  // the hero in 3D: his pieces made of triangles (body, head, feet, hands, the weapon), the shot from the muzzle of the 3D weapon
  const h3=await J(`JSON.stringify({ok:__V3.h3ok,n:__V3.h3,muz:!!__V3.muz,no:!!__V3.no3h,gm:V3GM.size})`);
  ok('in terza persona l\'eroe è in 3D vero (corpo, testa, piedi, mani e arma fatti di triangoli) e il colpo parte dalla bocca dell\'arma 3D',h3.ok&&h3.n>=7&&h3.muz&&!h3.no&&h3.gm>0,h3);
  // the four sides of the 3D hero, close (for Denis): front, his right, back, his left
  await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);__V3.dbgCam=92;0`);const sides=[];
  for(const y of [Math.PI,-Math.PI/2,0,Math.PI/2]){await E(`__V3.dbgYaw=${y};0`);await p.waitForTimeout(900);sides.push(await p.screenshot({clip:{x:65,y:225,width:260,height:290}}))}
  await E(`__V3.dbgYaw=0;__V3.dbgCam=0;0`);
  {const html=`<body style="margin:0;background:#111;display:flex">${sides.map(b=>`<img src="data:image/png;base64,${b.toString('base64')}">`).join('')}</body>`;const q=await b.newPage({viewport:{width:1040,height:290}});await q.setContent(html);await q.waitForTimeout(300);await q.screenshot({path:D+'vi_eroe4.png'});await q.close()}
  // the other heroes: the head painted as in the game (coda, piuma, occhiali, maschera, elmo, corna), the rest in 3D
  const oh=await J(`(()=>{const r=[];for(const id of ['cacciatrice','ninja','druida']){SAVE.heroes[id]=1;SAVE.hero=id;ZM.stile(zHeroStyle());ZM.equip(ZM.W.gunId||'pistola');r.push(id)}SAVE.hero='arciere';ZM.stile(zHeroStyle());ZM.equip('pistola');return JSON.stringify(r)})()`);
  await p.waitForTimeout(900);const oh2=await J(`JSON.stringify({ok:__V3.h3ok,err:__V3.err})`);ok('gli altri eroi (anche con la testa dipinta del gioco) senza errori',oh2.ok&&oh2.err===0,{oh,oh2});
  // first person
  await E(`v3Set('prima');0`);await p.waitForTimeout(1500);await put(.05,140);await p.waitForTimeout(600);const m0=await E(`MZ.shots`);await p.waitForTimeout(4000);
  const fp=await J(`JSON.stringify({mode:__V3.mode,shots:MZ.shots-${m0},vm:__V3.vmMuz,figs:__V3.figs,btn:document.getElementById('v3btn').textContent})`);await p.screenshot({path:D+'vi_prima.png'});
  ok('in prima persona: l\'arma in mano (la bocca dell\'arma sullo schermo), niente eroe, lo zombie davanti preso',fp.mode==='prima'&&/Prima persona/.test(fp.btn)&&fp.shots>=1&&Array.isArray(fp.vm)&&!/h/.test(fp.figs)&&/z/.test(fp.figs),fp);
  ok('in prima persona l\'arma è in 3D vero (lo stesso modello, con le mani e le maniche)',await E(`__V3.vm3===true`));
  await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);
  // in the house: no roof
  await E(`v3Set('terza');0`);await p.waitForTimeout(400);
  const hs=await J(`(()=>{const H=ZM.houses[0],h=ZM.W.hero;h.x=H.x+H.w*.5;h.y=H.y+H.d*.55;return JSON.stringify([H.x,H.y,H.w,H.d])})()`);await p.waitForTimeout(3500);
  // (the camera never inside a wall: between it and the hero's head nothing tall; with the camera high it may look over the walls)
  const inH=await J(`(()=>{const h=ZM.W.hero,e=__V3.eye,hd=[h.x,h.y,(h.zh||0)+42];let blk=0;for(let i=1;i<20;i++){const t=i/20,x=e[0]+(hd[0]-e[0])*t,y=e[1]+(hd[1]-e[1])*t,z=e[2]+(hd[2]-e[2])*t;if(v3HAt(x,y)>z+2)blk++}
    return JSON.stringify({a:ZM.houses[0].a,roof:v3TagVis(ZM.houses[0],'roof'),k:+__V3.camK.toFixed(2),blk})})()`);await p.screenshot({path:D+'vi_casa.png'});
  ok('in casa il tetto sparisce e tra la telecamera e l\'eroe non c\'è nessun muro',inH.a<.5&&!inH.roof&&inH.blk===0,{hs,inH});
  await E(`v3Set('prima');0`);await p.waitForTimeout(1500);await p.screenshot({path:D+'vi_casa_prima.png'});
  // the ground drawings of the match (the Bomb's fire, the Trap): laid on the ground
  await E(`v3Set('terza');(()=>{const h=ZM.W.hero,f=__V3.th;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);ZABS.fires.push({x:h.x+Math.cos(f)*90,y:h.y+Math.sin(f)*90,r:58,t:.5,T:30});ZABS.traps.push({x:h.x+Math.cos(f)*45+12,y:h.y+Math.sin(f)*45,a:0,t:1,shut:0})})();0`);
  await p.waitForTimeout(2500);const dc=await J(`JSON.stringify({cv:!!__V3.decCv,fires:ZABS.fires.length,traps:ZABS.traps.length})`);await p.screenshot({path:D+'vi_a_terra.png'});
  ok('a terra si vedono il fuoco della Bomba e la Tagliola (i disegni a terra della partita)',dc.cv&&dc.fires>0&&dc.traps>0,dc);await E(`ZABS.fires.length=0;ZABS.traps.length=0;0`);
  // the Bara
  await E(`v3Set('terza');0`);
  const bx=await J(`(()=>{const B=ZM.bara();if(!B)return 'null';const h=ZM.W.hero;h.x=B.x;h.y=B.y+95;window.__MZ.view(0);return JSON.stringify([B.x,B.y])})()`);await p.waitForTimeout(3000);
  const bf=await E(`__V3.figs`);await p.screenshot({path:D+'vi_bara.png'});ok('la Bara delle Sorprese si vede',bx&&/b/.test(bf),{bx,bf});
  // tripla A (106): the zombies and the two bosses in 3D, made of triangles from the same poses as their drawings
  await E(`(()=>{const h=ZM.W.hero;h.x=${home[0]};h.y=${home[1]};window.__MZ.view(0);for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const f=-Math.PI/2;
    ['zombie','strisciante','minatore','hound','zombie','zombie'].forEach((k,i)=>{const a=f+(i-2.5)*.2,j=window.__MZ.addZombie(k,h.x+Math.cos(a)*125,h.y+Math.sin(a)*125,0),z=ZM.W.Z[j];z.hp=1e9;z.q=1;z.stun=1e9;z.rise=1});
    const Z=ZM.W.Z;Z[4].kind='becchino';Z[4].sc=1.6;Z[5].kind='spaventapasseri';Z[5].sc=1.3;ZM.W.dbg.noShoot=true})();0`);
  for(let i=0;i<40;i++){await p.waitForTimeout(400);if(await E(`__V3.z3.n>=6&&!__V3.z3.left`))break}await p.waitForTimeout(600);
  const z3=await J(`JSON.stringify({n:__V3.z3.n,left:__V3.z3.left,all:ZM.W.Z.every(z=>z.__z3),kinds:ZM.W.Z.map(z=>z.kind),meshes:__V3.z3.M.size})`);await p.screenshot({path:D+'vi_zombie3d.png'});
  ok('zombie, strisciante, minatore, cane, Becchino e Spaventapasseri in 3D vero (fatti di triangoli, con le loro mosse)',z3.n>=6&&z3.all&&z3.meshes>0,z3);
  // (107) the battle in 3D: the beam of the shot, the blood of the zombie hit and its stains, the explosion that lights all round and shakes the camera
  await E(`ZM.W.dbg.noShoot=false;for(const z of ZM.W.Z.slice(1))ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);await p.waitForTimeout(3500);
  const fx1=await J(`JSON.stringify({p:FX3.P.length,tr:(FX3.tracers||[]).length,d:FX3.D.length,blood:FX3.P.filter(q=>q.k==='blood'||q.k==='mist').length+FX3.D.length})`);
  await E(`(()=>{const h=ZM.W.hero;FX3.mk.boom(h.x,h.y-110,0,46);return 1})()`);await p.waitForTimeout(120);
  const fx2=await J(`JSON.stringify({fire:FX3.P.filter(q=>q.k==='fire').length,light:FX3.lights().length,shk:+FX3.shk.toFixed(2)})`);await p.screenshot({path:D+'vi_esplosione.png'});
  ok('gli effetti della battaglia in 3D: scie, sangue con le macchie a terra, l\'esplosione che illumina e fa tremare la telecamera',fx1.blood>0&&fx2.fire>0&&fx2.light>0&&fx2.shk>0,{fx1,fx2});
  await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);await p.waitForTimeout(1500);
  // (108) the world: the grass blade by blade where the ground is grass (the field east of the start), the cones of light under the lamps and the
  // dust in them, the clouds over the moon (and the camera does not end up inside the well when the hero has his back to it)
  await E(`(()=>{const h=ZM.W.hero;h.x=790;h.y=1430;window.__MZ.view(90,45);__V3.camK=null;return 1})()`);for(let i=0;i<40;i++){await p.waitForTimeout(400);if(await E(`__V3.mw.nB>2000&&!__V3.mw.miss`))break}await p.waitForTimeout(1200);
  const g1=await J(`JSON.stringify({erba:__V3.mw.nB,pezzi:__V3.mw.nC,coni:__V3.mw.nL,nuvole:__V3.mw.nCl})`);await p.screenshot({path:D+'vi_erba.png'});
  ok('l\'erba vera nel prato (fili 3D a pezzi intorno a dove si guarda), i coni di luce dei lampioni lontani, le nuvole',g1.erba>2000&&g1.pezzi>4&&g1.coni>0&&g1.nuvole>0,g1);
  await E(`(()=>{const h=ZM.W.hero;h.x=700;h.y=1420;window.__MZ.view(-90,45);return 1})()`);await p.waitForTimeout(2500);
  const wl=await J(`(()=>{const e=__V3.eye,w=G3.props.find(p=>p.name==='well');const b=w&&w._v3b,inW=!!b&&e[0]>b[0]&&e[0]<b[3]&&e[1]>b[1]&&e[1]<b[4]&&e[2]<b[5];return JSON.stringify({k:+__V3.camK.toFixed(2),inW,drawn:!!(w&&w._v3c)})})()`);
  ok('con le spalle al pozzo la telecamera non mostra l\'interno del pozzo (se ci finisce dentro, il pozzo non si disegna)',!wl.inW||!wl.drawn,wl);
  // (then in first person under the lamp post, and towards the moon with a cloud passing over it)
  await E(`v3Set('prima');(()=>{const h=ZM.W.hero;h.x=398;h.y=1400;window.__MZ.view(0,35);return 1})()`);await p.waitForTimeout(2600);
  const l1=await J(`JSON.stringify({coni:__V3.mw.nL,polvere:__V3.mw.nM,nuvole:__V3.mw.nCl})`);await p.screenshot({path:D+'vi_lampione.png'});
  ok('in prima persona sotto il lampione: il cono di luce col pulviscolo dentro',l1.coni>0&&l1.polvere>0,l1);
  await E(`(()=>{const h=ZM.W.hero;h.x=${home[0]};h.y=${home[1]};window.__MZ.view(105.7,35);return 1})()`);await p.waitForTimeout(1500);await E(`ZM.W.t=28;0`);await p.waitForTimeout(1500);await p.screenshot({path:D+'vi_luna.png'});
  await E(`v3Set('terza');LOWFX=true;0`);await p.waitForTimeout(1200);const lw=await J(`JSON.stringify({erba:__V3.mw.nB,coni:__V3.mw.nL,nuvole:__V3.mw.nCl,err:__V3.err,gl:__V3.gl.getError()})`);await E(`LOWFX=false;0`);
  ok('con gli effetti bassi niente erba, coni e pulviscolo (le nuvole sì, meno), nessun errore',lw.erba===0&&lw.coni===0&&lw.nuvole>0&&lw.err===0&&lw.gl===0,lw);
  await E(`(()=>{const h=ZM.W.hero;h.x=${home[0]};h.y=${home[1]};window.__MZ.view(0);return 1})()`);await p.waitForTimeout(600);
  // back from above, and again
  await E(`v3Set('alto');0`);await p.waitForTimeout(900);const al=await J(`JSON.stringify({on:ZM.W.v3.on,disp:__V3.cv.style.display})`);await p.screenshot({path:D+'vi_alto.png'});
  ok('«Dall\'alto» torna la visuale di oggi (il 3D spento)',!al.on&&al.disp==='none',al);
  await E(`v3Set('terza');0`);await p.waitForTimeout(700);ok('e si torna in terza persona',await E(`ZM.W.v3.on&&__V3.mode==='terza'`));
  // low effects; the time of a frame
  await E(`LOWFX=true;0`);await p.waitForTimeout(900);await p.screenshot({path:D+'vi_lowfx.png'});await E(`LOWFX=false;0`);
  const t=await J(`JSON.stringify({ms:+__V3.ms.toFixed(1),gl:__V3.gl.getError(),err:__V3.err})`);ok('nessun errore di disegno (WebGL e del file)',t.gl===0&&t.err===0,t);
  const mem=await J(`JSON.stringify({pages:V3A.pages.length,tb:Math.round(__V3.tBuild)})`);ok('al massimo tre fogli di texture (la memoria del telefono)',mem.pages<=3,mem);
  console.log(`${nok} OK, ${nno} NO`);console.log(errs.slice(0,8).join('\n')||'nessun errore');await b.close()})();
