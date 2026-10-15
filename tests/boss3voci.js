// Voci, personalità e arena che reagisce dei 4 boss nuovi (src/js/87-boss3-arena.js, 88-boss3-voci.js). Per ogni arena 9-12 entra nella
// stanza del boss e controlla: le voci pronte (preparate a fettine), il grido dell'entrata, i versi delle mosse, la presa in giro quando
// l'eroe viene colpito (col gesto dell'entrata), il lamento quando il boss viene colpito forte, la chiamata quando non lo colpisci, la
// rabbia della fase 2, il grido della sconfitta (e il pulcino della Fenice); poi la risata quando l'eroe cade. Conta le reazioni
// dell'arena (b3fx) per ogni colpo. Foto: tests/b3v_<boss>_presa.png (la presa in giro), tests/b3v_<boss>_segni.png (i segni a terra).
// Uso: python3 tests/mk.py && node tests/boss3voci.js [arena 9-12]
const {chromium}=require('playwright');const path=require('path');
const only=+process.argv[2]||0;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:5200,runs:9,introSeen:1,tutDone:1,handSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x?'  '+x:''));
  // every clip said and every reaction of the room, written down
  await E(`initAudio();AU.on.music=false;audioSettings();window.__vl=[];window.__fx={};{const _p=B3VO.play;B3VO.play=function(t,k){const d=_p.apply(this,arguments);__vl.push([t,k,+(G.t||0).toFixed(2),d?1:0]);return d}}
    {const _f=b3fx;b3fx=function(e,w){__fx[w]=(__fx[w]||0)+1;return _f.apply(this,arguments)}}document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);startRun();0`);await p.waitForTimeout(1200);
  const want={8:'puppeteer',9:'phoenix',10:'octopus',11:'stag'},cues={puppeteer:['c_slam','c_strings','c_puppets','c_vanish'],phoenix:['c_feathers','c_dive','c_vortex','c_rain'],octopus:['c_slam','c_ink','c_whirl','c_dive'],stag:['c_charge','c_crystals','c_aurora','c_stomp']},
    fxs={puppeteer:['pslam','pstrings','ppuppet','psink','prise'],phoenix:['ffeathers','fdive','fvortex'],octopus:['oslam','oink','owhirl','osink','orise'],stag:['sstride','swall','scrystals','saurora','scurtain','sstomp']};
  const said=async bt=>JSON.parse(await E(`JSON.stringify(__vl.filter(v=>v[0]==='${bt}').map(v=>v[1]+(v[3]?'':'(muto)')))`));
  for(const ai of [8,9,10,11]){if(only&&only!==ai+1)continue;const bt=want[ai];
    await E(`document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(e=>e.hidden=true);modal=false;SAVE.trophies=ARENAS[${ai}].t;startRun();0`);await p.waitForTimeout(600);
    await E(`G.arena=${ai};G.chapter=ARENAS[${ai}].ch;G.diff=ARENAS[${ai}].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;P.inv=0;P.hp=P.maxhp=1e7;__vl.length=0;window.__fx={};buildRoom();window.__t0=performance.now();0`);
    // the voices get ready in slices
    let st=null;for(let w=0;w<40;w++){st=JSON.parse(await E(`JSON.stringify(B3VO.state())`));if(!st.q&&!st.cur)break;await p.waitForTimeout(100)}
    const prepMs=await E(`Math.round(performance.now()-__t0)`);ok(`arena ${ai+1} · ${bt}: voci pronte`,!st.q&&!st.cur,`in ${prepMs} ms (a fettine) · ${JSON.stringify(st)}`);
    await p.waitForTimeout(3600);let v=await said(bt);ok(`  grido d'entrata`,v.includes('cry'),v.join(' '));
    // the fight: the hero gets hit now and then (never dies), shoots from the bottom; watch for the mocking gesture
    await E(`window.__tp=0;window.__iv=setInterval(()=>{const e=G.enemies.find(q=>q.type==='${bt}');if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}P.hp=P.maxhp;if(e&&e.hp<e.max*.55&&!window.__half)e.hp=e.max*.9;
      if(e&&e.st==='taunt'&&!__tp){window.__tp=1;window.__tpm=JSON.stringify(n3Move(e))}},50);0`);
    let shot=false;for(let i=0;i<60;i++){await p.waitForTimeout(400);if(!shot&&await E(`window.__tp===1`)){await p.waitForTimeout(250);await p.screenshot({path:path.join(__dirname,`b3v_${bt}_presa.png`)});shot=true;await E(`window.__tp=2;0`)}
      if(i%12===5)await E(`P.inv=0;P.dashT=0;hurtP(5);0`)}
    v=await said(bt);const tm=await E(`window.__tpm||''`);ok(`  presa in giro col gesto dell'entrata`,v.includes('laugh')&&shot&&/taunt/.test(tm),`mossa del modello ${tm}`);
    // a move's voice can stay silent when the boss has just spoken (1.2 s after the clip before): at least three of the four; and how much it talks
    const cs=cues[bt].filter(c=>v.includes(c));ok(`  versi delle mosse`,cs.length>=cues[bt].length-1,`${cs.join(', ')}${cs.length<cues[bt].length?' · muti questa volta: '+cues[bt].filter(c=>!v.includes(c)).join(', '):''} · ${(v.length/24*60).toFixed(0)} versi al minuto`);
    await p.screenshot({path:path.join(__dirname,`b3v_${bt}_segni.png`)});
    // hit hard: the cry of pain
    // (when it can be hit: not in the air, not hidden, not in the middle of its mocking gesture)
    for(let w=0;w<30;w++){if(await E(`(()=>{const e=G.enemies.find(q=>q.type==='${bt}');return !e||e.st!=='taunt'&&!e.air&&!e.hidden&&!(e.shell>0)})()`))break;await p.waitForTimeout(100)}
    await E(`__vl.length=0;{const e=G.enemies.find(q=>q.type==='${bt}');if(e&&e.b3s){e.b3s.hurtT=-99;e.b3s.talkT=-99}if(e)hurtE(e,e.max*.03,false)}0`);await p.waitForTimeout(500);v=await said(bt);ok(`  lamento quando lo colpisci forte`,v.includes('hurt'),v.join(' '));
    // the hero keeps away and does not hit it: it calls him out
    await E(`__vl.length=0;clearInterval(__iv);window.__iv=setInterval(()=>{P.hp=P.maxhp;const e=G.enemies.find(q=>q.type==='${bt}');if(e&&e.b3s){e.b3s.lastHit=G.t-9;e.b3s.tauntT=-99;e.b3s.callT=-99}if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},200);0`);
    for(let i=0;i<20;i++){await p.waitForTimeout(300);if((await said(bt)).includes('laugh2'))break}v=await said(bt);ok(`  chiamata quando non lo colpisci`,v.includes('laugh2'),v.join(' '));
    // half health: the angry cry (the Phoenix: its moan as it curls up, then the cry of the reborn)
    await E(`clearInterval(__iv);window.__iv=setInterval(()=>{P.hp=P.maxhp;if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},200);window.__half=1;__vl.length=0;{const e=G.enemies.find(q=>q.type==='${bt}');if(e)e.hp=e.max*.49}0`);
    await p.waitForTimeout(bt==='phoenix'?4500:2500);v=await said(bt);ok(`  rabbia della fase 2`,v.includes('angry'),v.join(' '));
    // the reactions of the room
    const fx=JSON.parse(await E(`JSON.stringify(__fx)`)),seen=fxs[bt].filter(w=>fx[w]);ok(`  l'arena reagisce`,seen.length>=fxs[bt].length-1,JSON.stringify(fx));
    // the defeat
    await E(`__vl.length=0;clearInterval(__iv);window.__iv=setInterval(()=>{if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}},100);{const e=G.enemies.find(q=>q.type==='${bt}');if(e){e.shell=0;e.hidden=false;e.air=0;hurtE(e,e.hp+10,false)}}0`);await p.waitForTimeout(bt==='phoenix'?5200:1200);
    v=await said(bt);ok(`  grido della sconfitta${bt==='phoenix'?' e pulcino':''}`,v.includes('die')&&(bt!=='phoenix'||v.includes('chick')),v.join(' '));
    for(let w=0;w<16;w++){await p.waitForTimeout(500);if(await E(`!$('endScr').hidden||!$('menu').hidden`))break}await E(`clearInterval(__iv);0`);await p.waitForTimeout(800)}
  // the hero falls: the boss laughs
  if(!only||only===9){await E(`document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(e=>e.hidden=true);modal=false;SAVE.trophies=ARENAS[8].t;startRun();0`);await p.waitForTimeout(600);
    await E(`G.arena=8;G.chapter=ARENAS[8].ch;G.diff=ARENAS[8].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;P.inv=0;buildRoom();__vl.length=0;0`);await p.waitForTimeout(4200);
    await E(`P.inv=0;P.dashT=0;P.hp=3;hurtP(50);0`);await p.waitForTimeout(600);const v=await said('puppeteer');ok(`l'eroe cade: il Burattinaio ride`,v.includes('win'),v.join(' '))}
  console.log(R.join('\n'));console.log('ERR',JSON.stringify(errs.slice(0,12)));await b.close()})();
