// Quanto è difficile un boss rifatto rispetto a quello di oggi: nella sua stanza l'eroe sta fermo in basso e tira (il caso peggiore),
// non muore (la vita torna piena a ogni passo) ma ogni punto perso si conta; fino alla sconfitta del boss o a 240 s di gioco. Tre prove col
// boss di oggi (tests/test.html) e tre col nuovo (tests/<tipo>2_test.html): vite perse a combattimento e al minuto, durata.
// Uso: python3 tests/mk.py (una volta) && python3 anteprime/mk_boss2.py <tipo> --test && node tests/boss2diff.js <tipo> [livello eroe, 4]
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const T=process.argv[2],LV=+process.argv[3]||4;if(!T){console.log('uso: node tests/boss2diff.js <tipo> [livello]');process.exit(1)}
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];let arena=null;const out=[];
  for(const [name,file] of [['nuovo',`${T}2_test.html`],['oggi','test.html']]){if(!fs.existsSync(path.join(__dirname,file))){console.log('manca',file);continue}
    const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(name+': '+e.message));
    await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:6,introSeen:1,handSeen:1,tutDone:1,starter:'arciere',login:{last:'2099-1-1',n:1},items:{arco_frassino:{lvl:1,cards:0},giubba:{lvl:1,cards:0}},eq:{arma:'arco_frassino',armatura:'giubba',anello:null,amuleto:null}}))});
    await p.goto('file://'+path.join(__dirname,file));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
    if(name==='nuovo')arena=await E(`window.BCL&&BCL['${T}']?BCL['${T}'].arena:null`);
    // into the boss room: the new one as its brain says; the old one in the same arena (the Mimic: spawned in a cleared room)
    const ENTER=name==='nuovo'?`BCL['${T}'].enter()`:(arena!=null&&T!=='mimic'?`G.arena=${arena};G.chapter=ARENAS[${arena}].ch;G.diff=ARENAS[${arena}].diff;G.bossLvl=null;G.room=ROOMS;G.event=null;buildRoom()`
      :`G.room=4;G.event=null;buildRoom();G.enemies=[];const m=makeE('${T}',AW/2,TOP+(BOT-TOP)*.4,0);m.hp=m.max=Math.round(ET['${T}'].hp*(1+(effRoom()-1)*.14));m.intro=1.3;G.enemies.push(m);G.state='play'`);
    for(let rep=0;rep<3;rep++){
      const r=JSON.parse(await E(`(()=>{document.querySelectorAll('#sheetScr,#arenaUpScr,#endScr,#skScr').forEach(e=>e.hidden=true);modal=false;AU.on.music=false;AU.on.sfx=false;
        startRun();P.lvl=${LV};${ENTER};const B=G.enemies.find(e=>e.type==='${T}')||G.enemies.find(e=>isBoss(e.type));let lost=0,t=0,hits=0,lp1=0,t1=0;
        while(t<240&&B&&!B.dead&&G.enemies.includes(B)){P.hp=P.maxhp;const h0=P.hp;if(!$('skScr').hidden){$('skScr').hidden=true;modal=false;paused=false}if(G.hitstop>0)G.hitstop=0;
          update(.033);t+=.033;if(P.hp<h0){lost+=h0-P.hp;hits++}if(!B.p2){lp1=lost;t1=t}P.x=AW/2;P.y=BOT-60}
        return JSON.stringify({type:B&&B.type,t:+t.toFixed(1),t1:+t1.toFixed(1),lost:Math.round(lost),lp1:Math.round(lp1),hits,maxhp:Math.round(P.maxhp),dead:!!(B&&(B.dead||!G.enemies.includes(B)))})})()`));
      const L=r.lost/r.maxhp,M=r.lost/Math.max(1,r.t)*60/r.maxhp;out.push({name,...r,L,M});
      console.log(`${name.padEnd(6)} prova ${rep+1} · ${String(r.type).padEnd(10)} tempo ${String(r.t).padStart(5)} s (fase 1 ${r.t1}) · vita persa ${String(r.lost).padStart(5)} (${r.hits} colpi) = ${L.toFixed(1)} vite · ${M.toFixed(2)} vite/min (fase 1 ${(r.lp1/Math.max(1,r.t1)*60/r.maxhp).toFixed(2)})${r.dead?'':' · NON BATTUTO'}`)}
    await p.close()}
  for(const n of['oggi','nuovo']){const o=out.filter(q=>q.name===n);if(!o.length)continue;const av=k=>(o.reduce((s,q)=>s+q[k],0)/o.length);
    console.log(`MEDIA ${n.padEnd(6)} ${av('L').toFixed(1)} vite a combattimento · ${av('M').toFixed(2)} vite/min · ${av('t').toFixed(0)} s`)}
  console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
