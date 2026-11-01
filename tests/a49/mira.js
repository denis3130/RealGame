// la mira alla Brawl Stars (104-mira.js): Classica (levetta, area, tiro camminando, tocco, annullato, raffiche, fiala, rimbalzo, le Super
// trascinate di ogni eroe, mancini, effetti bassi) e Zombie (levetta, area di ogni arma, telecamera ferma, tiro camminando, raffiche delle
// automatiche, tocco, annullato, abilità trascinate); foto tests/a49/mi_*.png
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
  const shotWalk=async(dx,dy)=>{await E(`window.__n0=__AL.length;0`);await p.keyboard.down('KeyD');await p.waitForTimeout(150);await drag('#aimBtn',dx,dy,{hold:120});await p.waitForTimeout(700);
    const r=await J(`JSON.stringify({mov:P.moving,a:__AL.slice(__n0).map(a=>a.a)})`);await p.keyboard.up('KeyD');return r};
  const w1=await shotWalk(-30,-20);ok('lasciata camminando: la freccia parte dove punta la levetta',w1.mov&&w1.a.length>=1&&w1.a.every(a=>dA(a,Math.atan2(-20,-30))<.06),w1);
  // a tap shoots at the nearest
  await E(`window.__n0=__AL.length;0`);await p.keyboard.down('KeyD');await p.waitForTimeout(150);const tp=await drag('#aimBtn',0,0,{before:()=>J(`(()=>{const t=nearest(P.x,P.y);return JSON.stringify(t?Math.atan2(t.y-P.y,t.x-P.x):null)})()`)});
  await p.waitForTimeout(700);const tp2=await J(`JSON.stringify(__AL.slice(__n0).map(a=>a.a))`);await p.keyboard.up('KeyD');
  ok('un tocco: tira da solo al nemico più vicino, anche camminando',tp!=null&&tp2.length>=1&&dA(tp2[0],tp)<.25,{verso:tp,frecce:tp2});
  // back to the middle: nothing
  await E(`window.__n0=__AL.length;0`);await p.keyboard.down('KeyD');await p.waitForTimeout(150);await drag('#aimBtn',30,-10,{hold:150,back:1});await p.waitForTimeout(700);
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
  ok('la Super trascinata: la Pioggia di frecce cade nel cerchio scelto',s1.live&&s1.last&&s1.last.k==='super'&&s1b.ult===0&&s1b.n>=18&&s1b.far<92+24,{s1,s1b});
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
      await p.waitForTimeout(1200);await E(`window.__n0=__AL.length;0`);await p.keyboard.down('KeyD');await p.waitForTimeout(120);
      const f=await drag('#aimBtn',0,-26,{hold:120,before:()=>J(`JSON.stringify(MC.drag.f)`)});await p.waitForTimeout(650);
      const fl=await J(`JSON.stringify(__AL.slice(__n0).filter(a=>a.flask).map(a=>({l0:a.l0,v:Math.hypot(a.vx,a.vy)})))`);await p.keyboard.up('KeyD');
      const md=await E(`mcFlaskD(${f})`);ok('la fiala trascinata cade alla distanza scelta (il suo volo dura quanto quella distanza)',fl.length>=1&&Math.abs(fl[0].l0*fl[0].v-Math.min(md,fl[0].v*1.05))<3,{f,md,fl})}
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
  const ZL=await J(`(()=>{const r=e=>{const q=e.getBoundingClientRect();return{l:q.left,r:q.right,t:q.top,b:q.bottom}};return JSON.stringify({aim:r(document.getElementById('mzAim')),ab:[...document.querySelectorAll('#mzAb .ab')].map(r),lookY:ZM.W.lookY,H:innerHeight,W:innerWidth,hint:r(document.getElementById('mzHint'))})})()`);
  ok('sulla mappa la levetta del tiro sopra le abilità, senza toccarle; il cerchio della telecamera più in alto; le scritte sopra la levetta',ZL.ab.every(a=>!over(ZL.aim,a))&&ZL.lookY===300&&ZL.hint.b<=ZL.aim.t+2,ZL);
  await p.screenshot({path:D+'mi_z_mappa.png'});
  const yaw0=await E(`ZM.CAM.yaw`);
  const zm=await drag('#mzAim',-30,-24,{hold:350,shot:'mi_z_trascina.png',before:()=>J(`JSON.stringify({last:MIRA.last,aim:ZM.W.hero.aim,want:mzS2W(-30,-24),aimP:ZM.W.hero.aimP})`)});
  await p.waitForTimeout(600);const yaw1=await E(`ZM.CAM.yaw`);
  ok('trascinando: l\'area dell\'arma dove punta il dito, l\'eroe che mira lì, la telecamera ferma',zm.last&&zm.last.k==='tiro'&&dA(zm.aim,zm.want)<.02&&zm.aimP&&Math.abs(yaw1-yaw0)<1e-6,{zm,yaw0,yaw1});
  // the camera turned: the stick still points where the thumb says on the screen
  await E(`ZM.CAM.yaw=1.1;0`);await p.waitForTimeout(300);const zr=await drag('#mzAim',30,0,{hold:200,before:()=>J(`JSON.stringify({aim:ZM.W.hero.aim,want:mzS2W(30,0),scr:ZM.scrAng(ZM.W.hero.aim)})`)});await p.waitForTimeout(400);
  ok('con la telecamera girata la mira segue lo schermo (a destra è a destra)',dA(zr.aim,zr.want)<.02&&Math.abs(zr.scr)<.05,zr);await E(`ZM.CAM.yaw=0;0`);await p.waitForTimeout(300);
  // walking and shooting
  const zShot=async(dx,dy,gun)=>{if(gun){await E(`ZM.equip('${gun}');0`);await p.waitForTimeout(1300)}const s0=await E(`MZ.shots`);await p.keyboard.down('KeyD');await p.waitForTimeout(150);
    await drag('#mzAim',dx,dy,{hold:100});await p.waitForTimeout(gun==='mitragliatrice'?1700:1100);const r=await J(`JSON.stringify({n:MZ.shots-${s0},mov:ZM.W.hero.moving})`);await p.keyboard.up('KeyD');return r};
  const zw=await zShot(-20,-30);ok('lasciata camminando: la pistola spara un colpo, l\'eroe intanto cammina',zw.n===1&&zw.mov,zw);
  const zb=await zShot(-24,-26,'mitra');ok('il mitra lasciato: una raffica (4 colpi)',zb.n>=3&&zb.n<=5,zb);
  const zp=await zShot(-24,-26,'pompa');ok('la pompa lasciata: un colpo',zp.n===1,zp);
  // a zombie: the tap shoots at it; back to the middle: nothing
  await E(`ZM.equip('pistola');0`);await p.waitForTimeout(1300);
  await E(`(()=>{const h=ZM.W.hero;for(let i=0;i<16;i++){const a=i/16*6.283,x=h.x+Math.cos(a)*120,y=h.y+Math.sin(a)*120;if(ZM.physClear(h.x,h.y,x,y,2)){const k=window.__MZ.addZombie('zombie',x,y,0);const z=ZM.W.Z[k];z.hp=9999;z.q=1;z.stun=99;z.lv=h.lv||0;window.__za=a;break}}return 1})()`);await p.waitForTimeout(900);
  const s0=await E(`MZ.shots`);await drag('#mzAim',0,0);await p.waitForTimeout(500);const zt=await J(`JSON.stringify({n:MZ.shots-${s0},aim:ZM.W.hero.aim,za:window.__za})`);
  ok('un tocco: spara da solo allo zombie più vicino',zt.n>=1&&dA(zt.aim,zt.za)<.15,zt);
  await E(`ZM.W.Z.length=0;0`);await p.waitForTimeout(400);const s2=await E(`MZ.shots`);await drag('#mzAim',30,-30,{hold:150,back:1});await p.waitForTimeout(600);const zc=await E(`MZ.shots-${s2}`);ok('riportata al centro prima di lasciare: non spara',zc===0,zc);
  // every gun's area, a photo each
  const guns=['revolver','mitraglietta','mitragliatrice','tattica','lanciarazzi','lanciafiamme','vapore','risonatore','tamburo'];const seen={};
  for(const g of guns){await E(`ZM.equip('${g}');0`);await p.waitForTimeout(900);const r=await drag('#mzAim',-32,-22,{hold:250,shot:'mi_z_'+g+'.png',before:()=>J(`JSON.stringify(MIRA.last)`)});seen[g]=!!(r&&r.k==='tiro'&&r.gun===g);await p.waitForTimeout(1300)}
  ok('ogni arma ha la sua area (strisce, coni, esplosione, fiamma, onda)',Object.values(seen).every(Boolean),seen);
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
  // times: a frame with the area (with the stick held) against one without
  const tm=await J(`(()=>{const h=ZM.W.hero,g=ZM.gun();ZM.equip('pompa');const t0=performance.now();for(let i=0;i<200;i++)mzOnFloor(()=>mzDrawGun(ZM.gun(),-1,1));const t1=performance.now();return JSON.stringify({ms:(t1-t0)/200})})()`);
  ok('l\'area della pompa costa poco a disegnare (meno di 0,5 ms)',tm.ms<.5,tm);
  console.log(errs.slice(0,6).join('\n')||'nessun errore');await b.close()})();
