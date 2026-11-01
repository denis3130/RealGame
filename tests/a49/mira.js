// la mira alla Brawl Stars (104-mira.js): Classica (levetta, area, tiro camminando, tocco, annullato, raffiche, fiala, rimbalzo, le Super
// trascinate di ogni eroe, mancini, effetti bassi) e Zombie (si spara dove guarda la visuale, nel fascio largo con dentro l'area grande quanto
// il proiettile: davanti sì, dietro no, pistola 17° sì e 34° no, pompa 26° sì, il dito che gira la visuale, camminando, dietro un muro no, la
// ricarica da sola, l'area di ogni arma; abilità trascinate); foto tests/a49/mi_*.png
const {chromium}=require('playwright');const D=__dirname+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.addInitScript(()=>{if(localStorage.getItem('cripta_save_v1'))return;localStorage.setItem('cripta_save_v1',JSON.stringify({gold:9000,gems:10,trophies:0,runs:5,introSeen:1,handSeen:1,starter:'arciere',
    heroes:{arciere:1,cacciatrice:1,bardo:1,alchimista:1,ninja:1,balestriere:1,druida:1},hero:'arciere',zRec:15,mat:{ess:0,rot:500},
    z:{ab:{own:{scatto:1,bomba:1,rintocco:1,tagliola:1,adrenalina:1,benda:1},eq:['scatto','bomba','tagliola']}},
    items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null},slots:[null,null,null,null]}))});
  await p.goto('file://'+D+'test_a49.html');await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(s));const ok=(t,c,x)=>console.log((c?'OK  ':'NO  ')+t+(x!==undefined?'  '+JSON.stringify(x):''));
  const box=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,l:r.left,r:r.right,t:r.top,b:r.bottom,w:r.width}},sel);
  const dA=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
  // a drag from the middle of a button: down, a few steps to (dx, dy), then (back to the middle if asked), up
  const drag=async(sel,dx,dy,o={})=>{const c=await box(sel);await p.mouse.move(c.x,c.y);await p.mouse.down();await p.mouse.move(c.x+dx,c.y+dy,{steps:6});if(o.hold)await p.waitForTimeout(o.hold);
    if(o.shot)await p.screenshot({path:D+o.shot});const mid=o.before?await o.before():null;if(o.back)await p.mouse.move(c.x+1,c.y+1,{steps:4});await p.mouse.up();return mid};
  await E(`try{introEnd()}catch(e){};INTRO.on=false;try{closeSheet()}catch(e){};0`);
  // ================================================================ CLASSICA
  const vis0=await E(`getComputedStyle(document.getElementById('aimBtn')).display`);ok('nel menu la levetta del tiro non c\'è',vis0==='none',vis0);
  const run=async hero=>{await E(`SAVE.hero='${hero}';SAVE.sel='arena';startRun();0`);await p.waitForTimeout(2600);
    // the enemies stand still and don't die (one more far up the room, so there is always someone for the automatic shot)
    await E(`P.maxhp=P.hp=99999;{const e=makeE('slime',P.x,TOP+110,0);G.enemies.push(e)}for(const e of G.enemies){e.spd=0;e.cd=99;e.hp=99999}0`)};
  await run('arciere');
  // every arrow when it leaves (they vanish at the walls before the test can look at them)
  await E(`window.__AL=[];{const _a=arrow;arrow=function(){const r=_a.apply(this,arguments);__AL.push(G.arrows[G.arrows.length-1]);return r}}0`);
  const L=await J(`(()=>{const r=e=>{const q=document.getElementById(e).getBoundingClientRect();return{l:q.left,r:q.right,t:q.top,b:q.bottom}};return JSON.stringify({aim:r('aimBtn'),dash:r('dashBtn'),ult:r('ultBtn'),vis:getComputedStyle(document.getElementById('aimBtn')).display})})()`);
  const over=(a,b)=>a.l<b.r&&b.l<a.r&&a.t<b.b&&b.t<a.b;
  ok('in battaglia la levetta c\'è, accanto allo Scatto, senza toccare Scatto e Super',L.vis!=='none'&&!over(L.aim,L.dash)&&!over(L.aim,L.ult)&&L.aim.r<L.dash.l,L);
  // drag: the area, the hero turned that way with the bow drawn
  const m1=await drag('#aimBtn',24,-30,{hold:350,shot:'mi_c_trascina.png',before:()=>J(`JSON.stringify({last:MIRA.last,face:P.face,aiming:P.aiming,live:MC.drag&&MC.drag.live})`)});
  const a1=Math.atan2(-30,24);ok('trascinando: l\'area del tiro verso il dito, l\'eroe girato lì con l\'arco teso',m1.live&&m1.last&&m1.last.k==='tiro'&&dA(m1.last.a,a1)<.05&&dA(m1.face,a1)<.05&&m1.aiming,m1);
  await p.waitForTimeout(700);
  // release while walking: the arrow goes the stick's way
  // (the count starts once the hero walks: before, standing, he may shoot by himself)
  const shotWalk=async(dx,dy)=>{await p.keyboard.down('KeyD');await p.waitForTimeout(150);await E(`window.__n0=__AL.length;0`);await drag('#aimBtn',dx,dy,{hold:120});await p.waitForTimeout(700);
    const r=await J(`JSON.stringify({mov:P.moving,a:__AL.slice(__n0).map(a=>a.a)})`);await p.keyboard.up('KeyD');return r};
  const w1=await shotWalk(-30,-20);ok('lasciata camminando: la freccia parte dove punta la levetta',w1.mov&&w1.a.length>=1&&w1.a.every(a=>dA(a,Math.atan2(-20,-30))<.06),w1);
  // a tap shoots at the nearest
  await p.keyboard.down('KeyD');await p.waitForTimeout(150);await E(`window.__n0=__AL.length;0`);const tp=await drag('#aimBtn',0,0,{before:()=>J(`(()=>{const t=nearest(P.x,P.y);return JSON.stringify(t?Math.atan2(t.y-P.y,t.x-P.x):null)})()`)});
  await p.waitForTimeout(700);const tp2=await J(`JSON.stringify(__AL.slice(__n0).map(a=>a.a))`);await p.keyboard.up('KeyD');
  ok('un tocco: tira da solo al nemico più vicino, anche camminando',tp!=null&&tp2.length>=1&&dA(tp2[0],tp)<.25,{verso:tp,frecce:tp2});
  // back to the middle: nothing
  await p.keyboard.down('KeyD');await p.waitForTimeout(150);await E(`window.__n0=__AL.length;0`);await drag('#aimBtn',30,-10,{hold:150,back:1});await p.waitForTimeout(700);
  const cn=await J(`JSON.stringify(__AL.length-__n0)`);await p.keyboard.up('KeyD');ok('riportata al centro prima di lasciare: non tira',cn===0,cn);
  // standing still: the automatic shot as before, with its light area on the target
  await p.waitForTimeout(900);const au=await J(`JSON.stringify({aim:P.aiming,last:MIRA.last,t:(()=>{const t=nearest(P.x,P.y);return t?Math.atan2(t.y-P.y,t.x-P.x):null})()})`);await p.screenshot({path:D+'mi_c_auto.png'});
  ok('da fermo spara da solo come prima e l\'area leggera segue il bersaglio',au.aim&&au.last&&au.last.al<.6&&dA(au.last.a,au.t)<.05,au);
  // the multishot: all the arrows of the volley the stick's way
  await E(`P.multi=3;0`);const w3=await shotWalk(30,10);ok('col Multicolpo tutte le frecce della raffica vanno dove punta',w3.a.length>=3&&w3.a.every(a=>dA(a,Math.atan2(10,30))<.06),w3);
  await E(`P.multi=1;P.front=3;P.diag=1;P.wb=1;0`);await drag('#aimBtn',34,-4,{hold:300,shot:'mi_c_raffica.png'});await p.waitForTimeout(500);await E(`P.front=1;P.diag=0;P.wb=0;0`);
  // the Super of the Arciere: the rain in the circle chosen
  await E(`P.ult=100;ultGain(0);0`);await p.waitForTimeout(150);
  const s1=await drag('#ultBtn',-26,-34,{hold:300,shot:'mi_c_super_arciere.png',before:()=>J(`JSON.stringify({live:MC.ult&&MC.ult.live,a:MC.ult&&Math.atan2(MC.ult.dy,MC.ult.dx),f:MC.ult&&MC.ult.f,last:MIRA.last})`)});
  await p.waitForTimeout(80);const s1b=await J(`(()=>{const c=mcUltPt('arciere',${s1.a},${s1.f});return JSON.stringify({ult:P.ult,n:G.ultRain.length,far:Math.max(...G.ultRain.map(r=>Math.hypot(r.x-c.x,r.y-c.y))),c})})()`);
  ok('la Super trascinata: la Pioggia di frecce cade nel cerchio scelto',s1.live&&s1.last&&s1.last.k==='super'&&s1b.ult<50&&s1b.n>=18&&s1b.far<92+24,{s1,s1b});
  // back to the middle: the Super stays; a tap: as before
  await p.waitForTimeout(1500);await E(`P.ult=100;ultGain(0);0`);await drag('#ultBtn',30,0,{hold:150,back:1});await p.waitForTimeout(100);const sc=await E(`P.ult`);ok('la Super riportata al centro non parte',sc===100,sc);
  await drag('#ultBtn',0,0);await p.waitForTimeout(100);const st=await E(`P.ult`);ok('la Super con un tocco parte come prima',st<50,st);// (a hit just after gives back a little)
  // the other heroes: the shot area and the Super
  const heroes=[['cacciatrice',-20,-30],['bardo',20,-30],['alchimista',30,-20],['ninja',-30,-24],['balestriere',26,-26],['druida',-24,-30]];
  for(const[h,dx,dy] of heroes){await run(h);await p.waitForTimeout(400);await drag('#aimBtn',dx,dy,{hold:300,shot:'mi_c_'+h+'.png'});await p.waitForTimeout(800);
    await E(`P.ult=100;ultGain(0);0`);await p.waitForTimeout(100);
    const u=await drag('#ultBtn',dx*1.1,dy*1.1,{hold:300,shot:'mi_c_super_'+h+'.png',before:()=>J(`JSON.stringify({a:MC.ult&&Math.atan2(MC.ult.dy,MC.ult.dx),f:MC.ult&&MC.ult.f,last:MIRA.last})`)});await p.waitForTimeout(60);
    const r=await J(`JSON.stringify({ult:P.ult,cauld:G.cauld?{x:G.cauld.x,y:G.cauld.y}:null,siege:(G.arrows.find(a=>a.siege)||{}).a,spin:P.spin>0,ballad:!!G.ballad,sh:!!G.shadows,pt:'${h}'==='alchimista'?mcUltPt('alchimista',${u.a},${u.f}):null})`);
    const good=h==='alchimista'?r.cauld&&Math.hypot(r.cauld.x-r.pt.x,r.cauld.y-r.pt.y)<1:h==='balestriere'?r.siege!=null&&dA(r.siege,u.a)<.05:h==='cacciatrice'?r.spin:h==='bardo'?r.ballad:h==='ninja'?r.sh:r.ult===0;
    ok(`${h}: l'area del tiro e la Super trascinata (${h==='alchimista'?'il Calderone dove si è scelto':h==='balestriere'?'il Dardo d\'assedio dove punta':h==='cacciatrice'?'la Danza':h==='bardo'?'la Ballata su tutti':h==='ninja'?'le Ombre':'le Radici su tutti'})`,u.last&&u.last.k==='super'&&r.ult<100&&good,{u,r});
    if(h==='alchimista'){// the flask lands where the stick says
      await p.waitForTimeout(1200);await p.keyboard.down('KeyD');await p.waitForTimeout(120);await E(`window.__n0=__AL.length;0`);
      const f=await drag('#aimBtn',0,-26,{hold:120,before:()=>J(`JSON.stringify(MC.drag.f)`)});await p.waitForTimeout(650);
      const fl=await J(`JSON.stringify(__AL.slice(__n0).filter(a=>a.flask).map(a=>({l0:a.l0,v:Math.hypot(a.vx,a.vy)})))`);await p.keyboard.up('KeyD');
      const md=await E(`mcFlaskD(${f})`);ok('la fiala trascinata cade alla distanza scelta (il suo volo dura quanto quella distanza)',fl.some(q=>Math.abs(q.l0*q.v-Math.min(md,q.v*1.05))<3),{f,md,fl})}
    await p.waitForTimeout(600)}
  // left-handed: the stick on the left; low effects: no errors
  await E(`SAVE.set.left=true;applySettings();0`);await p.waitForTimeout(200);const lf=await J(`(()=>{const q=document.getElementById('aimBtn').getBoundingClientRect(),d=document.getElementById('dashBtn').getBoundingClientRect();return JSON.stringify({aim:q.left,dash:d.left,w:innerWidth})})()`);
  ok('per i mancini la levetta va a sinistra, accanto allo Scatto',lf.aim<lf.w/2&&lf.aim>lf.dash,lf);await E(`SAVE.set.left=false;applySettings();0`);
  await E(`LOWFX=true;0`);await drag('#aimBtn',-30,-30,{hold:300,shot:'mi_c_lowfx.png'});await p.waitForTimeout(400);await E(`LOWFX=false;0`);
  // ================================================================ ZOMBIE
  await E(`endRun(false,true);0`);await p.waitForTimeout(800);
  await E(`try{closeSheet()}catch(e){};$('endScr').hidden=true;SAVE.modo='zombie';SAVE.hero='arciere';zGo();0`);
  for(let i=0;i<120;i++){await p.waitForTimeout(500);if(await E(`!!(ZG.on&&ZM.W.director&&ZM.W.director.st)`))break}
  await p.waitForTimeout(2500);await E(`ZM.W.dbg.noSpawn=true;ZM.W.dbg.god=true;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);
  // no stick for the shot on the map (Denis, 1 November: «la visuale e lo sparo siano insieme»): the camera pad back in its place
  const ZL=await J(`JSON.stringify({lever:!!document.getElementById('mzAim'),lookY:ZM.W.lookY==null?null:ZM.W.lookY,hint:document.getElementById('mzHint').textContent})`);
  ok('sulla mappa niente levetta del tiro: il cerchio della telecamera al suo posto, la riga d\'aiuto dice «Spari dove guardi»',!ZL.lever&&ZL.lookY==null&&/Spari dove guardi/.test(ZL.hint),ZL);
  await p.screenshot({path:D+'mi_z_mappa.png'});
  // put(off, dist): one zombie at off radians from the view (the top of the screen), dist px away (stunned: it stays there)
  const put=async(off,dist)=>J(`(()=>{const h=ZM.W.hero;for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const f=-Math.PI/2-ZM.CAM.yaw+(${off});const x=h.x+Math.cos(f)*${dist},y=h.y+Math.sin(f)*${dist};
    const k=window.__MZ.addZombie('zombie',x,y,0);const z=ZM.W.Z[k];z.hp=99999;z.q=1;z.stun=999;z.lv=h.lv||0;window.__zt=z;return JSON.stringify({clear:ZM.physClear(h.x,h.y,x,y,2),a:Math.atan2(y-h.y,x-h.x)})})()`);
  const shots=async ms=>{const s0=await E(`MZ.shots`);await p.waitForTimeout(ms);return (await E(`MZ.shots`))-s0};
  const home=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);const goHome=()=>E(`ZM.W.hero.x=${home[0]};ZM.W.hero.y=${home[1]};ZM.W.hero.moving=false;window.__MZ.view(0);0`);
  await goHome();await p.waitForTimeout(300);
  const z0=await put(0,140);await p.waitForTimeout(250);const n0=await shots(1200);const l0=await J(`JSON.stringify({last:MIRA.last,aim:ZM.W.hero.aim,face:ZM.W.hero.face})`);await p.screenshot({path:D+'mi_z_davanti.png'});
  ok('uno zombie davanti (dove guarda la visuale): l\'eroe gli spara da solo, il mirino ai suoi piedi',z0.clear&&n0>=2&&l0.last&&l0.last.k==='tiro'&&l0.last.lock&&dA(l0.aim,z0.a)<.05&&dA(l0.face,z0.a)<.05,{z0,n0,l0});
  await E(`window.__MZ.view(180);0`);await p.waitForTimeout(400);const n1=await shots(1200);const l1=await J(`JSON.stringify({last:MIRA.last,face:ZM.W.hero.face,f:-Math.PI/2-ZM.CAM.yaw})`);await p.screenshot({path:D+'mi_z_dietro.png'});
  ok('girata la visuale dall\'altra parte (lo zombie ora è dietro): non spara, e l\'eroe guarda dove guarda la visuale',n1===0&&l1.last&&l1.last.k==='vista'&&dA(l1.face,l1.f)<.1,{n1,l1});
  await goHome();await p.waitForTimeout(300);
  // the wide beam (Denis: «lascia il fascio largo», «togli tutti i fasci tranne quello largo»): ±22° with the pistol, ±30° with the short guns
  const z2=await put(.3,140);await p.waitForTimeout(250);const n2=await shots(1000);
  const z3=await put(.6,140);await p.waitForTimeout(250);const n3=await shots(1000);
  ok('con la pistola a 17° dalla visuale (dentro il fascio largo) le spara, a 34° no',z2.clear&&z3.clear&&n2>=1&&n3===0,{n17:n2,n34:n3});
  await E(`ZM.equip('pompa');0`);await p.waitForTimeout(1100);const z3b=await put(.45,120);await p.waitForTimeout(250);const n3b=await shots(1200);await p.screenshot({path:D+'mi_z_pompa_lato.png'});
  ok('con la pompa (arma corta: fascio di ±30°) a 26° le spara',n3b>=1,{n26:n3b});await E(`ZM.equip('pistola');for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);await p.waitForTimeout(1100);
  const z3c=await put(.6,140);await p.waitForTimeout(250);const n3c=await shots(800);
  // the finger on the right half turns the view onto it: then it shoots
  const before=n3c+await shots(300);const ctr=[300,430];await p.mouse.move(ctr[0],ctr[1]);await p.mouse.down();await p.mouse.move(ctr[0]+64,ctr[1],{steps:10});await p.mouse.up();await p.waitForTimeout(400);
  const n4=await shots(1000);const yawD=await E(`ZM.CAM.yaw`);ok('trascinando il dito a destra la visuale gira verso lo zombie e l\'eroe comincia a sparare',before===0&&n4>=1,{prima:before,dopo:n4,yaw:+yawD.toFixed(2)});
  // walking: it shoots while it walks (the hero turned to it), and stops when the zombie leaves the view
  await goHome();await p.waitForTimeout(300);await put(0,280);await p.waitForTimeout(300);
  const s5=await E(`MZ.shots`),x5=await E(`ZM.W.hero.x`);await p.keyboard.down('KeyD');await p.waitForTimeout(300);
  const w5=await J(`JSON.stringify({mov:ZM.W.hero.moving,face:ZM.W.hero.face,a:Math.atan2(window.__zt.y-ZM.W.hero.y,window.__zt.x-ZM.W.hero.x)})`);await p.keyboard.up('KeyD');
  const n5=(await E(`MZ.shots`))-s5,dx5=(await E(`ZM.W.hero.x`))-x5;ok('camminando spara lo stesso allo zombie nella visuale, girato verso di lui',n5>=1&&w5.mov&&dx5>20&&dA(w5.face,w5.a)<.1,{colpi:n5,passi:Math.round(dx5),w5});
  // behind a wall: in the view but not seen, no shots
  await goHome();await p.waitForTimeout(300);
  const wl=await J(`(()=>{const h=ZM.W.hero;for(let i=0;i<126;i++){const a=i*.05;let s=12,hit=0;for(;s<200;s+=5){const q=ZM.hit(h.x+Math.cos(a)*s,h.y+Math.sin(a)*s,1.5);if(q&&!q.bar&&q.tag!=='hole'){hit=1;break}}if(hit&&s>=50&&s<=120){return JSON.stringify({a,s})}}return 'null'})()`);
  if(wl){await E(`window.__MZ.view(${(-90-wl.a*180/Math.PI).toFixed(3)});0`);await p.waitForTimeout(400);const zw=await put(0,wl.s+45);await p.waitForTimeout(300);const n6=await shots(1200);await p.screenshot({path:D+'mi_z_muro.png'});
    ok('uno zombie nella visuale ma dietro un muro: non gli spara (il fascio si ferma al muro)',!zw.clear&&n6===0,{muro:wl,clear:zw.clear,colpi:n6})}else console.log('(nessun muro vicino per la prova del muro: saltata)');
  // reloading by itself when nothing is in the view
  await goHome();await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);const g=ZM.gun();g.mag=3;0`);await p.waitForTimeout(1900);
  const rl=await J(`JSON.stringify({st:ZM.gun().st,mag:ZM.gun().mag})`);ok('senza zombie nella visuale ricarica da solo',rl.st==='ricarica'||rl.mag===12,rl);
  // every gun's area toward the zombie in the view, a photo each
  const guns=['revolver','mitraglietta','mitragliatrice','tattica','lanciarazzi','lanciafiamme','vapore','risonatore','tamburo'];const seen={};
  // (the Resonator's wave pushes the zombie away: for it the shot is enough)
  for(const g of guns){await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);ZM.equip('${g}');0`);await p.waitForTimeout(1000);const s0=await E(`MZ.shots`);await put(.12,g==='lanciafiamme'?90:g==='risonatore'?110:150);await p.waitForTimeout(g==='mitragliatrice'?900:600);
    await p.screenshot({path:D+'mi_z_'+g+'.png'});const r=await J(`JSON.stringify(MIRA.last)`),n=(await E(`MZ.shots`))-s0;seen[g]=n>0&&(g==='risonatore'||!!(r&&r.k==='tiro'&&r.lock&&r.gun===g))}
  ok('ogni arma spara al bersaglio nel fascio largo, col mirino rosso',Object.values(seen).every(Boolean),seen);
  await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);0`);
  // the abilities dragged: the bomb where you choose, the trap where you choose, the dash the way you choose
  await E(`ZM.equip('pistola');ZABS.cd=[0,0,0];0`);await p.waitForTimeout(600);
  const abBtn=i=>`#mzAb .ab[data-i="${i}"]`;
  const bo=await drag(abBtn(1),-20,-40,{hold:250,shot:'mi_z_bomba.png',before:()=>J(`JSON.stringify({last:MIRA.last,pt:mzAbAim('bomba',MZ.ab)})`)});await p.waitForTimeout(80);
  const bo2=await J(`JSON.stringify(ZABS.bottles.map(b=>[b.x,b.y]))`);ok('la Bomba trascinata cade dove si è scelto',bo.last&&bo.last.k==='abilita'&&bo2.length===1&&Math.hypot(bo2[0][0]-bo.pt.x,bo2[0][1]-bo.pt.y)<1,{bo,bo2});
  await p.waitForTimeout(700);const tr=await drag(abBtn(2),-30,0,{hold:200,shot:'mi_z_tagliola.png',before:()=>J(`JSON.stringify(mzAbAim('tagliola',MZ.ab))`)});await p.waitForTimeout(80);
  const tr2=await J(`JSON.stringify(ZABS.traps.map(t=>[t.x,t.y]))`);const hh=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);
  ok('la Tagliola trascinata va dove si è scelto (al massimo 80 passi)',tr2.length>=1&&Math.hypot(tr2[tr2.length-1][0]-tr.x,tr2[tr2.length-1][1]-tr.y)<1&&Math.hypot(tr.x-hh[0],tr.y-hh[1])<=81,{tr,tr2});
  const d0=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);const sd=await drag(abBtn(0),0,-36,{hold:200,shot:'mi_z_scatto.png',before:()=>J(`JSON.stringify(mzS2W(0,-36))`)});await p.waitForTimeout(400);
  const d1=await J(`JSON.stringify([ZM.W.hero.x,ZM.W.hero.y])`);const dm=Math.atan2(d1[1]-d0[1],d1[0]-d0[0]);ok('lo Scatto trascinato va dove si è scelto',Math.hypot(d1[0]-d0[0],d1[1]-d0[1])>30&&dA(dm,sd)<.35,{dist:Math.round(Math.hypot(d1[0]-d0[0],d1[1]-d0[1])),dir:+dm.toFixed(2),voluto:+sd.toFixed(2)});
  // the bell and the bandage: dragging shows the bell's reach; the bandage has no area, it's used when let go
  await E(`SAVE.z.ab.eq=['rintocco','benda','adrenalina'];zabReset();0`);await p.waitForTimeout(300);
  const rb=await drag(abBtn(0),-20,-20,{hold:200,shot:'mi_z_rintocco.png',before:()=>J(`JSON.stringify(MIRA.last)`)});await p.waitForTimeout(100);const rcd=await E(`ZABS.cd[0]`);
  ok('il Rintocco trascinato mostra il suo raggio e suona',rb&&rb.k==='abilita'&&rb.id==='rintocco'&&rcd>10,{rb,rcd});
  await E(`ZM.W.director.hp=30;0`);await drag(abBtn(1),-20,-30,{hold:150});await p.waitForTimeout(1300);const bh=await E(`ZM.W.director.hp`);ok('la Benda trascinata si usa lo stesso',bh>80,Math.round(bh));
  // a dragged ability doesn't turn the camera either
  const yw=await E(`ZM.CAM.yaw`);await drag(abBtn(2),-80,-10,{hold:100});await p.waitForTimeout(200);ok('trascinare le abilità non gira la telecamera',Math.abs(await E(`ZM.CAM.yaw`)-yw)<1e-6);
  // only the wide beam (Denis: «togli tutti i fasci tranne quello largo»): with a zombie in the view the frame draws the beam and the red
  // sight, nothing else (no strip, cone, flame or circle of the shot); with no one, only the beam
  await goHome();await E(`for(const z of ZM.W.Z.slice())ZM.W.Z.splice(ZM.W.Z.indexOf(z),1);ZM.equip('pompa');0`);await p.waitForTimeout(1100);const zo=await put(.1,120);await p.waitForTimeout(500);
  const only=await J(`(()=>{const o={},keep={};for(const n of ['mLane','mCirc','mGlow','mDots','mLob','mRing','mzDrawBeam'])o[n]=0;
    const w=(n,f)=>function(){o[n]++;return f.apply(this,arguments)};keep.L=mLane;keep.C=mCirc;keep.G=mGlow;keep.D=mDots;keep.B=mLob;keep.R=mRing;keep.Z=mzDrawBeam;
    mLane=w('mLane',mLane);mCirc=w('mCirc',mCirc);mGlow=w('mGlow',mGlow);mDots=w('mDots',mDots);mLob=w('mLob',mLob);mRing=w('mRing',mRing);mzDrawBeam=w('mzDrawBeam',mzDrawBeam);
    let a,b;try{mzGround();a=Object.assign({},o,{last:MIRA.last&&MIRA.last.k});for(const n in o)o[n]=0;const t=MZ.tg;MZ.tg=null;mzGround();MZ.tg=t;b=Object.assign({},o,{last:MIRA.last&&MIRA.last.k})}
    finally{mLane=keep.L;mCirc=keep.C;mGlow=keep.G;mDots=keep.D;mLob=keep.B;mRing=keep.R;mzDrawBeam=keep.Z}
    return JSON.stringify({conBersaglio:a,senza:b,vecchie:[typeof mzDrawShot,typeof mSpread,typeof mPellets,typeof mSector,typeof mFan]})})()`);
  await p.screenshot({path:D+'mi_z_solo_fascio.png'});
  const sa=only.conBersaglio,sb=only.senza;
  ok('solo il fascio largo: col bersaglio il fascio e il mirino rosso, senza nessuno il fascio, nient\'altro (niente strisce, coni, fiamme o cerchi)',
    sa.last==='tiro'&&sa.mzDrawBeam===1&&sa.mRing===1&&!sa.mLane&&!sa.mCirc&&!sa.mGlow&&!sa.mDots&&!sa.mLob&&sb.last==='vista'&&sb.mzDrawBeam===1&&!sb.mRing&&!sb.mLane&&!sb.mCirc&&!sb.mGlow&&
    only.vecchie.every(t=>t==='undefined'),Object.assign({clear:zo.clear},only));
  await E(`ZM.equip('pistola');0`);
  // times: the beam and the sight
  const tm=await J(`(()=>{const f=-Math.PI/2,h=ZM.W.hero,o={};for(const id of ['pompa','pistola','lanciarazzi']){ZM.equip(id);const g=ZM.gun(),V=mzView(g),t0=performance.now();for(let i=0;i<200;i++){MZ.ray=null;mzOnFloor(()=>{mzDrawBeam(h,f,V,1);mRing(h.x,h.y-120,13,MZC.bers,1)})}o[id]=+((performance.now()-t0)/200).toFixed(3)}ZM.equip('pistola');return JSON.stringify(o)})()`);
  ok('il fascio e il mirino costano poco a disegnare (meno di 0,5 ms per la pompa, la pistola e il razzo, rifacendo i raggi ogni volta)',Object.values(tm).every(v=>v<.5),tm);
  await E(`LOWFX=true;0`);await put(0,140);await p.waitForTimeout(700);await p.screenshot({path:D+'mi_z_lowfx.png'});await E(`LOWFX=false;0`);
  console.log(errs.slice(0,6).join('\n')||'nessun errore');await b.close()})();
