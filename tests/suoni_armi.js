// I suoni delle armi zombie (Denis, 14 ottobre: «poi l'audio delle medesime armi»): per ogni arma prepara il banco (sprite/armi/suoni_armi.js)
// e lo misura: tempo per prepararlo, quanti suoni, quanta memoria. Poi lo sparo nuovo (le tre varianti del banco) e quello di prima, ognuno
// da solo in un OfflineAudioContext con la stessa strada del gioco (sfxBus 0,8 -> master 0,9, eco del gioco): così non si sommano i rumori di
// fondo del menu. Quattro uscite: piatta, pesata come l'orecchio (K: +4 dB sopra 1,5 kHz, passa-alto 38 Hz), pesata come la cassa di un
// telefono (K + passa-alto 350 Hz del 4° ordine: sotto non suona quasi niente), sotto i 150 Hz. Volume = massimo della media su 400 ms (dB).
// Il gioco tiene al massimo sei banchi: ognuno si prepara subito prima di misurarlo (se no si misurerebbe il suono di riserva, a metà).
// Uso: python3 tests/mk.py && node tests/suoni_armi.js [armi...]
const {chromium}=require('playwright');const path=require('path');
const ALL=['pistola','revolver','mitraglietta','mitra','mitragliatrice','pompa','tattica','lanciarazzi','tamburo','lanciafiamme','vapore','risonatore'],ids=process.argv.slice(2).length?process.argv.slice(2):ALL;
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('cripta_save_v1',JSON.stringify({gold:500,gems:0,trophies:0,runs:9,introSeen:1,handSeen:1}))});
  await p.goto('file://'+path.join(__dirname,'test.html'));await p.waitForTimeout(1500);const E=s=>p.evaluate(s=>__E(s),s);
  await E(`initAudio();AU.on.music=false;audioSettings();$('menu').hidden=true;
    // a bank ready to use (prepared now if it was not there or had been put away)
    window.__bank=async id=>{const t0=performance.now();ARMI.prepara(id);while(ARMI.banco[id]&&ARMI.banco[id].wait)await new Promise(r=>setTimeout(r,10));return performance.now()-t0};
    // one sound on its own: fn(c) plays it on AU.ctx = an offline context with the game's road; back: per output the energy, the loudest 400 ms, the peak
    window.__take=async fn=>{const SR=48000,LEN=Math.ceil(1.8*SR),c=new OfflineAudioContext(4,LEN,SR),mg=c.createChannelMerger(4);mg.connect(c.destination);
      const master=c.createGain();master.gain.value=.9;const bus=c.createGain();bus.gain.value=.8;bus.connect(master);
      const rev=c.createConvolver();rev.buffer=mkImpulse(c,3,2.4);const rv=c.createGain();rv.gain.value=.6;rev.connect(rv);rv.connect(master);const sR=c.createGain();sR.connect(rev);
      // (the Web Audio lowpass and highpass take Q in dB: 4th order Butterworth = -5.33 and 2.32 dB, Q 0.5 = -6.02 dB)
      const bq=(t,f,q,g)=>{const x=c.createBiquadFilter();x.type=t;x.frequency.value=f;if(q!=null)x.Q.value=q;if(g!=null)x.gain.value=g;return x};
      const chain=(list,ch)=>{let n=master;for(const f of list){n.connect(f);n=f}n.connect(mg,0,ch)};
      chain([],0);chain([bq('highshelf',1500,null,4),bq('highpass',38,-6.02)],1);
      chain([bq('highshelf',1500,null,4),bq('highpass',38,-6.02),bq('highpass',350,-5.33),bq('highpass',350,2.32)],2);
      chain([bq('lowpass',150,-5.33),bq('lowpass',150,2.32)],3);
      const sv={ctx:AU.ctx,bus:AU.sfxBus,sRev:AU.sRev,pan:AU.pan,ld:AU.ld,ldT:AU.ldT};AU.ctx=c;AU.sfxBus=bus;AU.sRev=sR;AU.pan=0;AU.ld=0;AU.ldT=0;
      try{fn(c)}finally{AU.ctx=sv.ctx;AU.sfxBus=sv.bus;AU.sRev=sv.sRev;AU.pan=sv.pan;AU.ld=sv.ld;AU.ldT=sv.ldT}
      const buf=await c.startRendering(),W=Math.floor(.4*SR),H=Math.floor(.01*SR),res=[];
      for(let ch=0;ch<4;ch++){const d=buf.getChannelData(ch),sq=new Float64Array(d.length+1);let pk=0,mx=0;
        for(let i=0;i<d.length;i++){sq[i+1]=sq[i]+d[i]*d[i];const a=Math.abs(d[i]);if(a>pk)pk=a}
        for(let i=0;i+W<=d.length;i+=H){const m=(sq[i+W]-sq[i])/W;if(m>mx)mx=m}res.push({tot:sq[d.length],mx,pk})}
      return res};
    // a sound of the bank, as play() makes it (gain 1, a little of the game's echo)
    window.__buf=(c,buf,rev,at)=>{const s=c.createBufferSource();s.buffer=buf;const g=c.createGain();s.connect(g);route(g,null,rev);s.start(at||.01)};0`);
  // the banks: how long each takes, how many sounds, how much memory
  for(const id of ids){const r=JSON.parse(await E(`(async()=>{for(const k in ARMI.banco)delete ARMI.banco[k];const ms=await __bank('${id}'),B=ARMI.banco['${id}'];let n=0,smp=0;
      for(const k in B){const v=Array.isArray(B[k])?B[k]:[B[k]];for(const x of v)if(x&&x.length){n++;smp+=x.length}}
      return JSON.stringify({ms:Math.round(ms),n,kb:Math.round(smp*4/1024),fail:!!B.fail,names:Object.keys(B).filter(k=>k!=='u').join(' ')})})()`));
    console.log(id.padEnd(15),'banco',String(r.ms).padStart(5),'ms',String(r.n).padStart(3),'suoni',String(r.kb).padStart(5),'KB',r.fail?'FALLITO':'',r.names)}
  // the shot, new and old, each on its own
  const db=v=>v>0?10*Math.log10(v):-99,f=v=>v.toFixed(1).padStart(6);
  console.log('\nsparo           orecchio: nuovo  prima   diff  | telefono: nuovo  prima   diff  | sotto 150 Hz: nuovo prima | picco: nuovo prima');
  for(const id of ids){if(id==='lanciafiamme'){console.log(id.padEnd(15),'(il suo suono è il ruggito continuo, ARMI.fiamma)');continue}
    const r=JSON.parse(await E(`(async()=>{await __bank('${id}');const B=ARMI.banco['${id}'],nu=[],ol=[];
      for(const buf of (B&&B.sparo)||[])nu.push(await __take(c=>__buf(c,buf,.08)));
      for(let k=0;k<3;k++)ol.push(await __take(c=>ARMI.suonoVecchio('${id}','sparo',180,0)));
      const avg=(L,ch,fl)=>L.reduce((a,x)=>a+x[ch][fl],0)/Math.max(1,L.length);
      return JSON.stringify({n:nu.length,nK:avg(nu,1,'mx'),oK:avg(ol,1,'mx'),nP:avg(nu,2,'mx'),oP:avg(ol,2,'mx'),nS:avg(nu,3,'tot')/avg(nu,0,'tot'),oS:avg(ol,3,'tot')/avg(ol,0,'tot'),nPk:avg(nu,0,'pk'),oPk:avg(ol,0,'pk')})})()`));
    console.log(id.padEnd(15),'         ',f(db(r.nK)),f(db(r.oK)),f(db(r.nK)-db(r.oK)),' |         ',f(db(r.nP)),f(db(r.oP)),f(db(r.nP)-db(r.oP)),' |',
      String(Math.round(r.nS*100)).padStart(9)+'%',String(Math.round(r.oS*100)).padStart(4)+'%',' |',r.nPk.toFixed(2).padStart(7),r.oPk.toFixed(2).padStart(5),r.n===3?'':'(varianti '+r.n+')')}
  // the reload of the pistol, beat by beat at their moments, and the rocket's blast (it must sound, not too loud)
  const rl=JSON.parse(await E(`(async()=>{await __bank('pistola');const B=ARMI.banco.pistola,R=ARMI.RLT||{};let t=.01;
      const r=await __take(c=>{for(const w of['rl:out','rl:pouch','rl:seat','rl:rack','rl:fwd'])if(B[w]){__buf(c,B[w],0,t);t+=.28}});return JSON.stringify({K:r[1].mx,P:r[2].mx,pk:r[0].pk})})()`));
  console.log('\nricarica della pistola (cinque rumori)  orecchio',db(rl.K).toFixed(1),'dB  telefono',db(rl.P).toFixed(1),'dB  picco',rl.pk.toFixed(2));
  const ex=JSON.parse(await E(`(async()=>{await __bank('lanciarazzi');const B=ARMI.banco.lanciarazzi;const r=await __take(c=>{if(B.esplosione)__buf(c,B.esplosione,.08)});
      return JSON.stringify({K:r[1].mx,P:r[2].mx,pk:r[0].pk,S:r[3].tot/r[0].tot})})()`));
  console.log('esplosione del razzo                   orecchio',db(ex.K).toFixed(1),'dB  telefono',db(ex.P).toFixed(1),'dB  picco',ex.pk.toFixed(2),' sotto 150 Hz',Math.round(ex.S*100)+'%');
  console.log('ERR',JSON.stringify(errs));await b.close()})();
