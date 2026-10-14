// Prova del piano di sopra della Locanda (punto 15 del piano): «Sali al piano di sopra» al piede della scala porta l'eroe su per i gradini
// (1,1 s) fino al pianerottolo, dove si vede il solaio e spariscono i mobili di sotto; di sopra i muri, la ringhiera intorno al buco e i mobili
// fermano l'eroe; la Pompa tattica col gesso si compra solo di sopra; uno zombie a terra va al piede della scala, sale e arriva all'eroe;
// l'eroe di sopra non colpisce chi sta di sotto (e viceversa); «Scendi» lo riporta giù e lo zombie di sopra lo segue; una partita nuova rimette
// tutto di sotto. Fa le foto in anteprime/zombie/_piano_*.png
// Uso: python3 anteprime/zombie/mk.py area_mappa && node anteprime/zombie/piani_prova.js
const {chromium}=require('../../node_modules/playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','zombie.html'));let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  NO  ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:900,gems:40,introSeen:1,handSeen:1,runs:3}))});
  await p.goto('file://'+PAGE);await p.waitForFunction(()=>window.__MZ&&__MZ.W.ground,null,{timeout:90000});await p.waitForTimeout(600);
  const E=(f,a)=>p.evaluate(f,a);
  await E(()=>{const M=__MZ,W=M.W;window.ZM=M.ZM;W.dbg.god=true;W.dbg.noSpawn=true;W.dbg.noShoot=true;for(const z of[2,3,4])W.zoneOpen[z]=true;W.split=null;W.Z.length=0;ZM.navRebuild();
    window.S0=ZM.STAIRS[0];window.HS=S0.hs;window.mkZ=(x,y,lv)=>{const z={kind:'zombie',sc:1.1,spd:34,spd0:34,hp:400,x,y,face:0,p:0,anim:'walk',rise:1,die:0,flash:0,q:1};if(lv){z.lv=1;z.lvH=S0.H;z.st=S0;z.zh=S0.H}W.Z.push(z);return z}});
  const info=await E(()=>({n:ZM.STAIRS.length,H:S0.H,bot:S0.bot.map(Math.round),land:S0.land.map(Math.round),hs:[HS.x,HS.y,HS.w,HS.d].map(Math.round),name:HS.name,len:Math.round(S0.len)}));
  console.log(JSON.stringify(info));
  ok(info.n===1&&info.name==='Locanda del Corvo'&&info.H===92,`una scala, nella ${info.name} (piano alto ${info.H}, percorso ${info.len} px)`);
  // ---- 1. salire
  const up=await E(()=>{const M=__MZ,W=M.W,h=W.hero;M.tp(S0.bot[0],S0.bot[1]);M.sim(2,1/60);const shown=ZM.buys.filter(o=>!(o.show&&!o.show())&&(o.lv||0)===(h.lv||0)&&Math.hypot(h.x-o.x,h.y-o.y)<o.r).map(o=>o.id);
    M.buyNow('sali0');const mid=[];for(let i=0;i<90;i++){M.sim(1,1/60);if(i===30||i===55)mid.push({zh:Math.round(W.hero.zh),cl:!!W.hero.cl,up:+(HS.up||0).toFixed(2)})}
    return{shown,mid,lv:h.lv,zh:Math.round(h.zh),x:Math.round(h.x),y:Math.round(h.y),up:+(HS.up||0).toFixed(2),inside:HS.inside}});
  ok(up.shown.includes('sali0'),`al piede della scala c'è il bottone «Sali al piano di sopra» (${up.shown.join(', ')})`);
  ok(up.mid.length===2&&up.mid[0].cl&&up.mid[0].zh>0&&up.mid[0].zh<92&&up.mid[1].zh>up.mid[0].zh,`sale i gradini piano piano (a metà: ${up.mid.map(m=>m.zh+' px').join(', ')})`);
  ok(up.lv===1&&up.zh===92&&Math.hypot(up.x-info.land[0],up.y-info.land[1])<2&&up.up>.99&&up.inside,`arriva al pianerottolo del piano di sopra (piano ${up.lv}, alto ${up.zh}, solaio ${up.up})`);
  await E(()=>{__MZ.cam(null);__MZ.zoom(null)});await p.waitForTimeout(900);await p.screenshot({path:path.join(__dirname,'_piano_sopra.png')});
  // ---- 2. di sopra: muri, ringhiera e mobili fermano l'eroe; mai fuori dalla casa, mai nel buco
  const walls=await E(()=>{const M=__MZ,W=M.W,h=W.hero,out=[];const ins=()=>h.x>HS.x+9&&h.x<HS.x+HS.w-9&&h.y>HS.y+9&&h.y<HS.y+HS.d-9;
    let inHole=false,outside=false;const Y1=S0.foot[1]+15;
    for(const[ix,iy] of[[0,-1],[-1,0],[0,1],[1,0],[1,-1],[-1,-1],[1,1],[0,-1]]){M.walk(ix,iy,240,1/60);if(!ins())outside=true;if(h.x>S0.head[0]+14&&h.x<S0.foot[0]&&h.y<Y1)inHole=true;out.push([Math.round(h.x-HS.x),Math.round(h.y-HS.y)])}
    return{outside,inHole,lv:h.lv,zh:Math.round(h.zh),pts:out}});
  ok(!walls.outside&&!walls.inHole&&walls.lv===1&&walls.zh===92,`di sopra i muri e la ringhiera tengono: mai fuori dalla Locanda né nel buco della scala (${walls.pts.map(q=>q.join(',')).join(' ')})`);
  // ---- 3. la Pompa tattica col gesso: solo di sopra
  const gun=await E(()=>{const M=__MZ,W=M.W,h=W.hero,o=ZM.buys.find(b=>b.id==='muro_tattica');M.tp(o.x,o.y);M.sim(2,1/60);const lvOk=(o.lv||0)===1;M.coins(5000);const r=M.buyNow('muro_tattica');return{lvOk,r,gun:W.gunId,coins:W.coins}});
  ok(gun.lvOk&&gun.r&&gun.gun==='tattica'&&gun.coins===3000,`la Pompa tattica (2.000) si compra di sopra (${gun.gun}, monete ${gun.coins})`);
  const gunDown=await E(()=>{const W=__MZ.W,h=W.hero,o=ZM.buys.find(b=>b.id==='muro_tattica');const sv=[h.lv,h.x,h.y];h.lv=0;const vis=(o.lv||0)===(h.lv||0);h.lv=sv[0];return vis});
  ok(!gunDown,'… e il suo bottone non c\'è per chi sta di sotto');
  // ---- 4. uno zombie a terra (fuori dalla porta sulla strada) va alla scala, sale e arriva all'eroe
  const chase=await E(()=>{const M=__MZ,W=M.W,h=W.hero;M.tp(S0.land[0]+60,S0.land[1]+40);M.sim(2,1/60);const z=mkZ(HS.x+HS.w*.5,HS.y+HS.d+40,0);let climbed=-1,reached=-1,t=0;
    for(let i=0;i<60*45;i++){M.sim(1,1/60);t+=1/60;if(climbed<0&&z.cl)climbed=t;if(z.lv===1&&Math.hypot(z.x-h.x,z.y-h.y)<34){reached=t;break}}
    return{climbed:+climbed.toFixed(1),reached:+reached.toFixed(1),lv:z.lv||0,anim:z.anim,zh:Math.round(z.zh||0)}});
  ok(chase.climbed>0&&chase.reached>chase.climbed&&chase.lv===1,`uno zombie fuori dalla Locanda entra, comincia a salire dopo ${chase.climbed} s e arriva all'eroe di sopra dopo ${chase.reached} s`);
  // ---- 5. i colpi solo sullo stesso piano: l'eroe di sopra non colpisce lo zombie di sotto, sì quello di sopra
  const shots=await E(()=>{const M=__MZ,W=M.W,h=W.hero;W.Z.length=0;M.tp(HS.x+HS.w*.5,HS.y+HS.d*.62);M.sim(2,1/60);ZM.equip('pistola');W.dbg.noShoot=false;
    const zd=mkZ(h.x+30,h.y+50,0);zd.spd=0;const hp0=zd.hp;M.sim(90,1/60);const below=hp0-zd.hp,tgBelow=h.tgZ===zd;
    const zu=mkZ(h.x+60,h.y+30,1);zu.spd=0;const hu0=zu.hp;M.sim(90,1/60);const above=hu0-zu.hp;W.dbg.noShoot=true;W.Z.length=0;return{below,tgBelow,above}});
  ok(shots.below===0&&!shots.tgBelow&&shots.above>0,`di sopra non si colpisce lo zombie di sotto (danno ${shots.below}), quello di sopra sì (danno ${shots.above})`);
  const bite=await E(()=>{const M=__MZ,W=M.W,h=W.hero,D=W.director;W.dbg.god=false;const hp0=D.hp;const z=mkZ(h.x+12,h.y+8,0);z.spd=0;M.sim(150,1/60);const lost=hp0-D.hp;W.dbg.god=true;D.hp=hp0;W.Z.length=0;return{lost,anim:z.anim}});
  ok(bite.lost===0&&bite.anim!=='attack',`lo zombie di sotto, proprio sotto l'eroe, non lo morde (vita persa ${bite.lost})`);
  // ---- 6. scendere: lo zombie di sopra lo segue giù
  const down=await E(()=>{const M=__MZ,W=M.W,h=W.hero;const z=mkZ(HS.x+HS.w*.7,HS.y+HS.d*.5,1);M.tp(S0.land[0],S0.land[1]);M.sim(2,1/60);
    const shown=ZM.buys.filter(o=>!(o.show&&!o.show())&&(o.lv||0)===(h.lv||0)&&Math.hypot(h.x-o.x,h.y-o.y)<o.r).map(o=>o.id);M.buyNow('scendi0');M.sim(80,1/60);
    const me={lv:h.lv||0,zh:Math.round(h.zh),x:Math.round(h.x),y:Math.round(h.y),up:+(HS.up||0).toFixed(2)};M.tp(S0.bot[0]+40,S0.bot[1]+90);let back=-1,t=0;
    for(let i=0;i<60*40;i++){M.sim(1,1/60);t+=1/60;if(!z.cl&&(z.lv||0)===0&&z.zh<1){back=t;break}}return{shown,me,back:+back.toFixed(1)}});
  ok(down.shown.includes('scendi0'),`sul pianerottolo c'è «Scendi» (${down.shown.join(', ')})`);
  ok(down.me.lv===0&&down.me.zh===0&&Math.hypot(down.me.x-info.bot[0],down.me.y-info.bot[1])<2&&down.me.up<.05,`scende e torna al piede della scala (piano ${down.me.lv}, solaio ${down.me.up})`);
  ok(down.back>0,`lo zombie rimasto di sopra scende anche lui la scala (dopo ${down.back} s)`);
  // ---- 7. di sotto, dentro: la parte alta dei muri sparisce come il tetto; foto
  await E(()=>{const M=__MZ;M.tp(HS.x+HS.w*.4,HS.y+HS.d*.6);M.sim(30,1/60)});await p.waitForTimeout(900);await p.screenshot({path:path.join(__dirname,'_piano_sotto.png')});
  // la salita a metà, da vicino
  // (la pagina va avanti da sola: per la foto a metà la salita si rallenta)
  await E(()=>{const M=__MZ,W=M.W;M.tp(S0.bot[0],S0.bot[1]);M.sim(2,1/60);M.buyNow('sali0');M.sim(40,1/60);W.hero.cl.T=600;mkZ(S0.bot[0]+6,S0.bot[1]+4,0).spd=0});await p.waitForTimeout(900);await p.screenshot({path:path.join(__dirname,'_piano_scala.png')});
  await E(()=>{const W=__MZ.W;W.hero.cl.T=1.1;W.Z.length=0;__MZ.sim(80,1/60)});
  // ---- 7b. (difetti 48) la salita vera, coi fotogrammi disegnati: l'eroe sui gradini e poi di sopra sta sopra la scala e sopra il solaio, e
  // anche uno zombie di sopra (prima l'isteresi dell'ordine teneva il verso di quando era sotto il solaio: si vedeva solo la testa)
  await E(()=>{const M=__MZ,W=M.W;W.Z.length=0;M.tp(S0.bot[0],S0.bot[1]);M.sim(2,1/60);M.buyNow('sali0')});await p.waitForTimeout(450);
  const onSt=await E(()=>{const M=__MZ,o=M.order(),L=M.layers().filter(l=>l.part==='st'&&l.z0<2).map(l=>l.id).filter(id=>o.includes(id));return{cl:!!__MZ.W.hero.cl,ok:L.length>0&&L.every(id=>o.indexOf('H')>o.indexOf(id))}});
  await p.waitForTimeout(2200);
  const top=await E(()=>{const M=__MZ,W=M.W,h=W.hero;const z=mkZ(h.x+40,h.y+26,1);z.spd=0;return 1});await p.waitForTimeout(900);
  const ord=await E(()=>{const M=__MZ,W=M.W,o=M.order(),z=W.Z[W.Z.length-1],zid='Z'+z.id,sl=M.layers().filter(l=>l.part==='slab'&&o.includes(l.id));
    const under=(id,who)=>{const r=M.rel(who,id);return r&&r[0]>0};const bad=[];for(const l of sl){if(under(l.id,'H')&&o.indexOf('H')<o.indexOf(l.id))bad.push('H<'+l.id);if(o.includes(zid)&&under(l.id,zid)&&o.indexOf(zid)<o.indexOf(l.id))bad.push(zid+'<'+l.id)}
    W.Z.length=0;return{lv:W.hero.lv,n:sl.length,bad,z:o.includes(zid)}});
  await p.screenshot({path:path.join(__dirname,'_piano_salita_vera.png')});
  ok(onSt.ok&&onSt.cl,`salendo coi fotogrammi l'eroe è disegnato sopra i gradini (sulla scala: ${onSt.cl})`);
  ok(ord.lv===1&&ord.n>0&&ord.z&&!ord.bad.length,`arrivato di sopra, l'eroe e lo zombie di sopra sono disegnati sopra il solaio (${ord.n} pezzi di solaio, fuori posto: ${ord.bad.join(', ')||'nessuno'})`);
  await E(()=>{const M=__MZ;M.tp(S0.land[0],S0.land[1]);M.sim(2,1/60);M.buyNow('scendi0');M.sim(80,1/60)});
  // ---- 8. una partita nuova: tutto di sotto
  const fresh=await E(()=>{const M=__MZ,W=M.W;ZM.ctl.nuova();M.sim(2,1/60);return{lv:W.hero.lv||0,cl:!!W.hero.cl,up:HS.up||0}});
  ok(fresh.lv===0&&!fresh.cl&&fresh.up===0,'una partita nuova rimette l\'eroe di sotto (e il solaio sparisce)');
  console.log('ERR',JSON.stringify(errs));console.log(fails?fails+' prove non passate':'tutte le prove passate');await b.close()})();
