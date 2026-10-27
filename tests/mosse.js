// Prova delle mosse leggendarie (src/js/96-albero-abilita.js, sezione 5) sulla pagina di anteprime/mk_mosse.py: ognuna delle 46 mosse in
// una stanza vera parte, suona (il suo suono è nella tabella), accende le sue luci, la prima volta dice il suo nome con la stella; nessun
// errore; il costo del disegno coi suoi effetti. Foto: tests/mv_<abilità><lato>.png e il foglio tests/mv_foglio.jpg (python3 dopo).
// Uso: python3 anteprime/mk_mosse.py --test && node tests/mosse.js [abilità ...]
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const ONLY=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,240))});
  await p.goto('file://'+path.join(__dirname,'mosse_test.html'));await p.waitForFunction(()=>typeof window.__E==='function',null,{timeout:30000});await p.waitForTimeout(1500);
  const E=s=>p.evaluate(s=>__E(s),s),J=async s=>JSON.parse(await E(`JSON.stringify(${s})`)),W=ms=>p.waitForTimeout(ms);const R=[];const ok=(n,c,x)=>{R.push((c?'OK   ':'NO   ')+n+(x!=null?'  '+x:''));console.log(R[R.length-1])};
  await E(`(()=>{SAVE.set=SAVE.set||{};SAVE.set.q='alta';applySettings();LOWFX=false;return 0})()`);
  const pan=await J(`({open:!$('mvPan').hidden,abs:document.querySelectorAll('#mvPan .ab').length,btns:document.querySelectorAll('#mvPan .two button').length})`);
  ok('il pannello: 23 abilità, 46 mosse',pan.abs===23&&pan.btns===46,JSON.stringify(pan));
  const ids=await J(`TR_IDS`),keys=[];for(const id of ids)for(const s of[0,1])if(!ONLY.length||ONLY.includes(id))keys.push([id,s]);
  const miss=[],slow=[],got={};let first=true;
  for(const [id,s] of keys){const key=id+s;
    const n0=await J(`TR_LEGN['${key}']||0`);   // before entering: some moves start at once (little health, the first hit)
    if(first){await p.click(`#mvPan .two button[data-id="${id}"][data-b="${s}"]`);first=false}else await E(`(()=>{MVgo('${id}',${s});return 0})()`);
    let hit=null;const t0=Date.now();
    while(Date.now()-t0<12000){await W(90);const q=await J(`({n:TR_LEGN['${key}']||0,p:TR_LEGP['${key}']||null,err:TR.err})`);if(q.n>n0){hit=q;break}}
    if(!hit){miss.push(key);continue}
    await W(170);
    const box=await J(`(()=>{const q=TR_LEGP['${key}'],r=cv.getBoundingClientRect(),k=r.width/cv.width,s=Math.min(cv.width/VW,cv.height/VH),ox=Math.round((cv.width-VW*s)/2),oy=Math.round(Math.max(0,(cv.height-VH*s)/2));
      const x=q?q.x:P.x,y=q?q.y:P.y,cx=r.left+(ox+(x-(G.vx||0))*s)*k,cy=r.top+(oy+(y-20-(G.vy||0))*s)*k;return{x:Math.max(0,Math.min(innerWidth-240,cx-120)),y:Math.max(0,Math.min(innerHeight-240,cy-120))}})()`);
    await p.screenshot({path:path.join(__dirname,`mv_${key}.png`),clip:{x:box.x,y:box.y,width:240,height:240}});
    const lab=await J(`({lab:$('mvLab').textContent,star:G.texts.some(t=>/★/.test(t.t)),seen:!!TR.legSeen['${key}']})`);got[key]={lab:lab.lab.slice(0,40),seen:lab.seen}}
  ok('ogni mossa parte nella sua stanza (suono, luci, nome la prima volta)',!miss.length&&Object.values(got).every(g=>g.seen),JSON.stringify({miss,n:Object.keys(got).length}));
  // il costo del disegno: tutte le mosse dell'ultimo gruppo insieme, molti effetti in aria
  const ms=await J(`(()=>{const S=trS();for(const id of TR_IDS)S[id]={lv:5,f3:0,f5:1};for(let i=0;i<40;i++){trFx({k:'lring',x:P.x+rand(-80,80),y:P.y-rand(0,200),r0:8,r1:60,rgb:'255,220,120',w:5,t:.5,max:.5});trFx({k:'lray',x:P.x+rand(-80,80),y:P.y-rand(0,200),n:8,r:50,rgb:'255,236,160',rot:0,t:.4,max:.4,w:4})}
    let t0=performance.now();for(let i=0;i<20;i++)render();const a=(performance.now()-t0)/20;TR.fx=[];t0=performance.now();for(let i=0;i<20;i++)render();return{con:+a.toFixed(1),senza:+((performance.now()-t0)/20).toFixed(1)}})()`);
  ok('il disegno con 80 luci delle mosse insieme resta leggero',ms.con<ms.senza+12,JSON.stringify(ms));
  // gli effetti ridotti: niente raggi né colonne né segni, il resto sì
  const lo=await J(`(()=>{LOWFX=true;TR.fx=[];trFx({k:'lray',x:0,y:0,n:4,r:10,rgb:'1,1,1',t:1,max:1});trFx({k:'pillar',x:0,y:0,w:4,h:4,rgb:'1,1,1',t:1,max:1});trFx({k:'lring',x:0,y:0,r0:1,r1:2,rgb:'1,1,1',w:1,t:1,max:1});const r=TR.fx.map(f=>f.k);TR.fx=[];LOWFX=false;return r})()`);
  ok('con gli effetti ridotti restano solo gli anelli',lo.join()==='lring',JSON.stringify(lo));
  ok('nessun errore',!errs.length,errs.slice(0,5).join(' | '));
  console.log('\n'+R.join('\n'));await b.close()})();
