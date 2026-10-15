// I 4 boss del terzo giro nel gioco (src/js/81-86): per ogni arena 9-12 entra nella stanza del boss, guarda l'entrata, lascia combattere
// (eroe che non muore ma tira davvero), controlla che passino tutte le mosse, porta il boss a metà vita (fase 2), poi lo sconfigge e
// guarda la sconfitta fino alla stanza ripulita. Foto in tests/b3g_<boss>_<momento>.png e i tempi di disegno a confronto con il boss di
// prima (la Strega, il Fabbro, l'Idra, la Regina). Uso: python3 tests/mk.py && node tests/boss3gioco.js [arena 9-12]
const {chromium}=require('playwright');const path=require('path');
const only=+process.argv[2]||0;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:5200,runs:9,introSeen:1,tutDone:1,handSeen:1,login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);const R=[];const ok=(n,c,x)=>R.push((c?'OK   ':'NO   ')+n+(x?'  '+x:''));
  await E(`document.querySelectorAll('#sheetScr,#arenaUpScr').forEach(e=>e.hidden=true);AU.on.music=false;startRun()`);await p.waitForTimeout(1200);
  const want={8:'puppeteer',9:'phoenix',10:'octopus',11:'stag'},moves={puppeteer:['slam','strings','puppets','vanish'],phoenix:['feathers','dive','vortex','rain','rebirth'],octopus:['slam','ink','whirl','dive'],stag:['charge','crystals','aurora','stomp']};
  for(const ai of [8,9,10,11]){if(only&&only!==ai+1)continue;const bt=want[ai];
    await E(`document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(e=>e.hidden=true);modal=false;SAVE.trophies=ARENAS[${ai}].t;startRun();0`);await p.waitForTimeout(600);
    await E(`G.arena=${ai};G.chapter=ARENAS[${ai}].ch;G.diff=ARENAS[${ai}].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;P.inv=0;P.hp=P.maxhp=1e7;buildRoom();window.__st={};window.__hz={thr:0,aur:0,lob:0,lines:0,met:0,pup:0};0`);
    const st0=JSON.parse(await E(`JSON.stringify({b:(G.enemies.find(e=>isBoss(e.type))||{}).type,v:G.variant&&G.variant.n,rune:G.variant&&G.variant.rune,name:$('bossName').textContent,pend:BM.pend})`));
    ok(`arena ${ai+1}: boss ${st0.b}`,st0.b===bt,`stanza «${st0.v}» rune ${st0.rune} · barra «${st0.name}» · musica in attesa ${st0.pend}`);
    await p.waitForTimeout(500);await p.screenshot({path:path.join(__dirname,`b3g_${bt}_entrata1.png`)});await p.waitForTimeout(900);await p.screenshot({path:path.join(__dirname,`b3g_${bt}_entrata2.png`)});
    await p.waitForTimeout(1600);
    // the fight: the hero stays put at the bottom and shoots; every 100 ms note the state and the dangers in the room
    await E(`window.__iv=setInterval(()=>{const e=G.enemies.find(q=>isBoss(q.type));if(!e)return;__st[e.st]=(__st[e.st]||0)+1;const H=__hz;if(G.b3){H.thr=Math.max(H.thr,G.b3.thr.length);H.aur=Math.max(H.aur,G.b3.aur.length);H.lob=Math.max(H.lob,G.b3.lob.length)}
      H.lines=Math.max(H.lines,G.lines.length);if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}H.met=Math.max(H.met,G.meteors.length);H.pup=Math.max(H.pup,G.enemies.filter(q=>q.type==='puppet').length);P.hp=P.maxhp;const B=G.enemies.find(q=>isBoss(q.type));if(B&&B.hp<B.max*.55&&!B.p2&&!window.__half)B.hp=B.max*.6},100);0`);
    for(let i=0;i<4;i++){await p.waitForTimeout(4000);await p.screenshot({path:path.join(__dirname,`b3g_${bt}_lotta${i+1}.png`)})}
    // half health: the phase 2
    await E(`window.__half=1;{const B=G.enemies.find(q=>isBoss(q.type));if(B)B.hp=B.max*.49}0`);await p.waitForTimeout(5000);await p.screenshot({path:path.join(__dirname,`b3g_${bt}_fase2.png`)});
    await p.waitForTimeout(9000);
    const st=JSON.parse(await E(`clearInterval(__iv);JSON.stringify({st:__st,hz:__hz,p2:!!(G.enemies.find(q=>isBoss(q.type))||{}).p2})`));
    const seen=moves[bt].filter(m=>st.st[m]);ok(`  mosse viste`,seen.length===moves[bt].length,`${seen.join(', ')}${seen.length<moves[bt].length?' · mancano: '+moves[bt].filter(m=>!st.st[m]).join(', '):''}`);
    ok(`  fase 2`,st.p2);R.push('     pericoli (massimo insieme): '+JSON.stringify(st.hz));
    // drawing time: the boss room now, against the old guardian of the arena drawn in the same room
    const ms=JSON.parse(await E(`(()=>{const T=[];for(let i=0;i<40;i++){const t0=performance.now();render();T.push(performance.now()-t0)}T.sort((a,b)=>a-b);return JSON.stringify({med:+T[20].toFixed(2)})})()`));
    R.push(`     disegno della stanza (mediana di 40): ${ms.med} ms`);
    // the defeat
    await E(`window.__half=0;{const B=G.enemies.find(q=>isBoss(q.type));if(B){B.shell=0;B.hidden=false;B.air=0;hurtE(B,B.hp+10,false)}}0`);
    await p.waitForTimeout(700);await p.screenshot({path:path.join(__dirname,`b3g_${bt}_sconfitta1.png`)});await p.waitForTimeout(1300);await p.screenshot({path:path.join(__dirname,`b3g_${bt}_sconfitta2.png`)});
    await p.waitForTimeout(2600);const fin=JSON.parse(await E(`JSON.stringify({state:G.state,corpses:(G.corpses||[]).length,left:G.enemies.length,kills:(SAVE.stats&&SAVE.stats.bosses&&SAVE.stats.bosses['${bt}'])||0})`));
    ok(`  sconfitta e stanza ripulita`,fin.state==='cleared'||fin.state==='exit'||fin.corpses===0&&fin.left===0,JSON.stringify(fin));
    // the end of the run (the victory, the end screen) comes a few seconds later: wait for it before the next arena
    for(let w=0;w<16;w++){await p.waitForTimeout(500);if(await E(`!$('endScr').hidden||!$('menu').hidden`))break}await p.waitForTimeout(800)}
  console.log(R.join('\n'));console.log('ERR',JSON.stringify(errs.slice(0,12)));await b.close()})();
