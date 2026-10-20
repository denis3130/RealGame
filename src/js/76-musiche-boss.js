// =====================================================================
// MUSICHE DEI BOSS (punto 51 del piano maestro). Ogni boss ha il suo tema (TRACKS golem, witch, salamandra, fabbro, rospo, idra, yetiM,
// regina e, nuovo, mimic). Prima il tema partiva appena si entrava nella stanza; ora:
// - entrando nella stanza del boss la musica dell'arena si abbassa e resta sotto, in attesa (se non ce n'era: «attesa», un bordone basso
//   col battito del cuore);
// - quando il boss compare (a metà della sua entrata) un colpo d'orchestra suo (un respiro che sale, il tamburo grande, ottoni e coro sul
//   primo accordo del suo tema, il colore del suo mondo: campane, incudine, fuoco, acqua, ghiaccio, cristallo, monete) e subito il suo
//   tema, un poco più basso delle altre musiche perché colpi e versi si sentano bene;
// - al colpo finale la musica reagisce: si chiude come sott'acqua e cala mentre il tempo rallenta; nel momento clou della morte unica
//   (BDEATH[tipo].clou) un accordo di vittoria tutto suo, fuori dal filtro; poi una musica calma («vittoria») fino all'uscita (dopo il
//   Mimic, che sta in una stanza normale, torna la musica di prima).
// Tutto torna normale nella stanza dopo e nel menu. I quattro boss nuovi del terzo giro avranno i loro temi dopo l'ok di Denis.
// =====================================================================
const BM={pend:null,t0:0,type:'',prev:null,winRoom:-1};
// each boss: its theme, the first chord of the theme (the entrance hit), the bright chord of the victory, the colour of its world
const BMS={golem:{m:'golem',ch:[51,55,60],win:[48,52,55,60],fl:'stone'},witch:{m:'witch',ch:[54,57,61],win:[54,58,61,66],fl:'bell'},
  salamander:{m:'salamandra',ch:[57,58,64],win:[57,61,64,69],fl:'fire'},smith:{m:'fabbro',ch:[61,64,68],win:[49,53,56,61],fl:'anvil'},
  toad:{m:'rospo',ch:[52,55,59],win:[52,56,59,64],fl:'water'},hydra:{m:'idra',ch:[53,56,60],win:[53,57,60,65],fl:'water'},
  yeti:{m:'yetiM',ch:[52,55,59],win:[52,56,59,64],fl:'ice'},icequeen:{m:'regina',ch:[64,67,71],win:[59,63,66,71],fl:'crystal'},
  mimic:{m:'mimic',ch:[52,55,59],win:[52,56,59,64],fl:'coins'}};
const BMTRACK={};for(const k in BMS)BMTRACK[BMS[k].m]=k;
// the music gets a low-pass filter (wide open: 20 kHz), put in once when the audio is there
function bmFilter(){const c=AU.ctx;if(!c)return null;if(AU.mlp)return AU.mlp;try{const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=20000;f.Q.value=.7;
  AU.music.disconnect();AU.music.connect(f);f.connect(AU.master);AU.mlp=f}catch(e){}return AU.mlp}
function bmOpen(){const f=bmFilter();if(!f)return;const t=AU.ctx.currentTime;f.frequency.cancelScheduledValues(t);f.frequency.setValueAtTime(Math.max(40,f.frequency.value),t);f.frequency.exponentialRampToValueAtTime(20000,t+.25)}
// a short-lived track for the hits: straight to the master, past the filter and the ducking (only with the music on)
function bmTrack(vol){const c=AU.ctx,g=c.createGain();g.gain.value=(AU.on.music?1:0)*.38*VOLM()*(vol||1);g.connect(AU.master);setTimeout(()=>{try{g.disconnect()}catch(e){}},9000);return{bus:g,drum:g}}
// a breath of noise rising into the hit at time t1
function bmSwell(tr,t0,t1,f0,f1,vol){const c=AU.ctx,n=noiseSrc(t0,t1-t0+.1),bp=filt('bandpass',f0,1.4),g=c.createGain();bp.frequency.setValueAtTime(f0,t0);bp.frequency.exponentialRampToValueAtTime(f1,t1);
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t1-.02);g.gain.linearRampToValueAtTime(.0001,t1+.06);n.connect(bp);bp.connect(g);route(g,tr,.4,0)}
// the colour of each world on the hits
function bmColour(tr,t,fl,ch,big){const k=big?1.3:1;
  if(fl==='bell'){vBell(tr,t,ch[2]+24,3,.07*k);vBell(tr,t+.18,ch[0]+36,2.4,.05*k)}
  else if(fl==='anvil'){vAnvil(tr,t,.22*k,520);vAnvil(tr,t+.27,.14*k,600)}
  else if(fl==='fire'){fNoise(t,.9,'bandpass',900,.7,.16*k,{f2:260,att:.03});vBell(tr,t,ch[2]+24,1.8,.05*k)}
  else if(fl==='water'){for(let i=0;i<6;i++)vHarp(tr,t+.06*i,ch[i%3]+24+12*Math.floor(i/3),1.4,.07*k);fNoise(t+.05,.5,'bandpass',600,2,.08*k,{f2:1600})}
  else if(fl==='ice'){for(let i=0;i<5;i++)vBell(tr,t+.09*i,ch[i%3]+36+(i>2?12:0),2.2,.05*k)}
  else if(fl==='crystal'){for(let i=0;i<6;i++)vBell(tr,t+.07*i,ch[(5-i)%3]+36+(i<3?12:0),2.6,.045*k);vChoir(tr,t,ch.map(m=>m+12),2.4,.12*k)}
  else if(fl==='coins'){for(let i=0;i<7;i++)vBell(tr,t+.05*i,[88,91,95,93,96,100,98][i],.5,.05*k);dTom(tr,t,.3,900)}
  else{dTaiko(tr,t+.24,.7*k);dTom(tr,t+.36,.4*k,120)}}
// the boss shows up: the hit, then its theme
function bmIn(type){const B=BMS[type]||(BM.pend&&BMS[BMTRACK[BM.pend]])||BMS.golem,name=BM.pend||B.m;BM.pend=null;BM.type=type||BMTRACK[name]||'';
  if(!AU.ctx){playMusic(name);return}
  bmOpen();const c=AU.ctx,t=c.currentTime+.05,hit=t+.42,tr=bmTrack(.46);
  bmSwell(tr,t,hit,300,4200,.22);dTaiko(tr,hit,1.2);dDrum(tr,hit,.9,70,32,1.3,260,.3);
  for(const m of B.ch)vBrass(tr,hit,m-12,1.7,.12);vChoir(tr,hit,B.ch,2.6,.24);vBass(tr,hit,B.ch[0]-24,2.2,.3);bmColour(tr,hit,B.fl,B.ch,false);
  if(AU.cur&&AU.cur.name!==name)BM.prev=AU.cur.name;duckMusic(.85);setTimeout(()=>{if(G&&!G.ended)playMusic(name)},380)}
// the finishing blow: the music sinks as under water while time slows down
function bmDie(type){if(!AU.ctx)return;const f=bmFilter(),c=AU.ctx,t=c.currentTime;BM.type=type;BM.winRoom=G?G.room:-1;
  if(f){f.frequency.cancelScheduledValues(t);f.frequency.setValueAtTime(Math.min(20000,Math.max(60,f.frequency.value)),t);f.frequency.exponentialRampToValueAtTime(360,t+.8)}
  duckMusic(.42);const tr=bmTrack(.5);dDrum(tr,t+.02,.85,80,28,1.6,240,.35);bmSwell(tr,t+.1,t+1.05,180,2400,.12)}
// the clou of the death: its own victory chord, then the calm music (or back to the music of the room after the Mimic)
function bmWin(type){const B=BMS[type]||BMS.golem;if(!AU.ctx)return;const c=AU.ctx,t=c.currentTime+.03,tr=bmTrack(.48);
  dTaiko(tr,t,1.15);dDrum(tr,t,.8,90,36,1.2,300,.3);for(const m of B.win)vBrass(tr,t,m,2.4,.1);vChoir(tr,t,B.win.map(m=>m+12),3.4,.26);vBass(tr,t,B.win[0]-24,3,.3);
  for(let i=0;i<5;i++)vBell(tr,t+.14*i,B.win[i%B.win.length]+24+(i>3?12:0),2.4,.06);bmColour(tr,t+.1,B.fl,B.win,true);
  const room=G?G.room:-1,back=type==='mimic'&&BM.prev;
  setTimeout(()=>{if(!G||(!G.ended&&G.room!==room))return;bmOpen();duckMusic(1);playMusic(back?BM.prev:'vittoria')},1500)}
// ---- the new tracks: the waiting drone, the calm music after a victory, the Mimic's theme
Object.assign(TRACKS,{
  attesa:{bpm:64,pad:[[38,45,50],[38,45,51],[37,44,49],[38,45,50]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4;
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.13,380);vBass(tr,t,this.pad[bar][0]-12,spb*15,.2)}
      if(s===0||s===3)dDrum(tr,t,s?.22:.32,62,38,.3,180,.08);if(s===8&&bar%2)vBell(tr,t,86,2.6,.022);if(s===12&&bar===3)vBell(tr,t,81,2.2,.018)}},
  vittoria:{bpm:74,pad:[[62,66,69],[57,61,64],[59,62,66],[55,59,62]],arp:[[50,57,62,66,69,74],[45,52,57,61,64,69],[47,54,59,62,66,71],[43,50,55,59,62,67]],
    mel:[[0,78,8],[8,76,4],[12,74,4],[16,73,12],[28,71,4],[32,74,8],[40,76,8],[48,74,16]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64);
      if(s===0){vPad(tr,t,this.pad[bar],spb*16,.12,1300);vBass(tr,t,this.pad[bar][0]-24,spb*14,.18)}
      if(s%2===0)vHarp(tr,t,this.arp[bar][[0,2,4,5,3,4,2,1][(s/2)%8]],1.4,s===0?.1:.065);
      if(cyc>=1)for(const[ss,m,l] of this.mel)if(ss===loop)vBell(tr,t,m,spb*l*1.6,.05)}},
  mimic:{bpm:118,ch:[[52,55,59],[52,55,60],[50,53,57],[51,54,59]],roots:[40,40,38,39],
    mel:[[0,71,2],[2,72,2],[4,71,2],[6,67,2],[8,64,4],[12,66,2],[14,67,2],[16,69,4],[20,71,2],[22,69,2],[24,67,8],[32,71,2],[34,72,2],[36,74,4],[40,72,2],[42,71,2],[44,69,4],[48,67,4],[52,66,4],[56,64,8]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar];
      if(s===0){vPad(tr,t,this.ch[bar],spb*16,.07,700);vBell(tr,t,r+48,1.4,.035)}
      if(s%4===0||s%4===3)vBass(tr,t,r+(s%4===3?7:0),spb*1.4,.2);
      if(s%2===0)vPluck(tr,t,[this.ch[bar][(s/2)%3]+12],spb*1.6,.09);
      if(s%4===2)dTom(tr,t,.22,s%8===2?950:760);if(s===0||s===8)dTaiko(tr,t,s?.45:.7);dShaker(tr,t,s%2?.035:.02);
      if(cyc%2===1)for(const[ss,m,l] of this.mel)if(ss===loop)vMallet(tr,t,m,spb*l*1.4,.09);
      if(bar===3&&s===12)for(let i=0;i<4;i++)vBell(tr,t+i*spb*.5,[91,95,93,98][i],.4,.04)}}});
// ---- the hooks
// entering the room of a boss: the music of the arena goes down and waits under (the theme is kept for when the boss shows up)
{const _mf=musicFor;musicFor=function(room){const m=_mf(room);
  if(G&&room===G.room&&!G.event&&BMTRACK[m]&&m!=='mimic'){BM.pend=m;BM.t0=performance.now();BM.type='';const cur=AU.cur&&AU.cur.name;duckMusic(.42);return cur&&cur!=='menu'&&cur!=='zmenu'&&cur!=='vittoria'&&!BMTRACK[cur]?cur:'attesa'}
  BM.pend=null;bmOpen();if(AU.duck!==1)duckMusic(1);return m}}
// the boss shows up: half way through its entrance (or at once when it has none; BMAT: another moment for a boss, as a part of its
// entrance), at most 5 s after the room started
const BMAT={};
{const _u=update;update=function(dt){_u(dt);if(!BM.pend||!G||!started||paused)return;const b=G.enemies&&G.enemies.find(e=>isBoss(e.type)&&!e.dead);
  const T=b?(BOSS_INTRO[b.type]||1.6):0;if(b&&(b.intro<=0||(b.iT!=null&&b.iT>=T*(BMAT[b.type]||.42)))||performance.now()-BM.t0>5000)bmIn(b?b.type:null)}}
// the finishing blow and the clou of the death
{const _bd=bossDie;bossDie=function(e){const n0=(G.corpses||[]).length;_bd.apply(this,arguments);try{bmDie(e.type);if((G.corpses||[]).length===n0)setTimeout(()=>bmWin(e.type),500)}catch(err){}}}
{const _tc=tickCorpses;tickCorpses=function(dt){const wait=(G.corpses||[]).filter(c=>!c.clou);_tc.apply(this,arguments);
  for(const c of wait)if(c.clou){try{bmWin(c.type)}catch(err){}}}}
// back in the menu: everything open again
{const _sm=showMenu;showMenu=function(){BM.pend=null;bmOpen();return _sm.apply(this,arguments)}}
