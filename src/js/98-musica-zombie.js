// =====================================================================
// 98. LA MUSICA DELLA PARTITA ZOMBIE (FASE 8; Denis, 31 ottobre: «Musica della partita»). Prima sulla mappa c'era solo l'atmosfera.
// Una musica lenta e malata in re (re minore, mi bemolle, si bemolle minore, la: il giro che non si risolve mai) che segue la partita
// (ZM.W.director, partita.js):
// - all'inizio e nella pausa tra un round e l'altro solo il bordone basso, una campana lontana e un carillon stonato;
// - nel round il cuore che batte e il violoncello che striscia di un semitono, sempre più fitti coi round e con gli zombie in giro;
// - più avanti (tanti zombie, round alti) i tamburi di guerra, una campana che stona e il coro che respira;
// - quando c'è il Becchino o lo Spaventapasseri i tamburi su ogni battito, gli ottoni bassi e il coro su ogni giro;
// - con poca vita il cuore batte più forte e il resto si allontana;
// - quando l'eroe cade si spegne tutto e resta un accordo basso con la campana (con «Rigioca» si ricomincia dalla calma).
// Tutto passa piano da uno stato all'altro (l'intensità ZMU.I segue lo stato in qualche secondo). Il volume è quello della musica.
// =====================================================================
const ZMU={I:0,low:0,end:0};
// the loop: D minor, E flat, B flat minor, A (the dominant of the harmonic minor: it never comes home)
const ZMU_CH=[[50,53,57],[51,55,58],[46,49,53],[45,49,52]],ZMU_BOX=[62,63,65,67,69,70,72];
// the cello's crawl on the eighth notes: semitones from the root of the chord
const ZMU_CRAWL=[0,0,1,0,0,-1,0,3];
TRACKS.zpartita={bpm:76,
  play(tr,step,t,spb){const W=typeof ZM!=='undefined'?ZM.W:null,D=W&&W.director;if(!D)return;
    const s=step%16,bar=Math.floor(step/16)%4,C=ZMU_CH[bar],R=D.R||0;
    let alive=0;if(W.Z)for(const z of W.Z)if(!z.die&&!z.idle)alive++;
    // where the match is: the target of the intensity, followed slowly
    const boss=!!(D.boss&&!D.boss.die),down=D.st==='giu'||D.st==='fine',calm=D.st==='inizio'||D.st==='pausa';
    let tgt=calm?.15:Math.min(1,.38+Math.min(.3,R*.03)+Math.min(.25,alive*.035));if(boss)tgt=1;
    ZMU.I+=(tgt-ZMU.I)*.07;const I=ZMU.I,low=!down&&D.hp<40?1:0;ZMU.low+=(low-ZMU.low)*.1;const L=ZMU.low,amb=1-.55*L;
    // the end: one low chord with the bell, then silence until the next match
    if(down){if(!ZMU.end){ZMU.end=1;vPad(tr,t,[38,45,50],spb*40,.09,260);vBell(tr,t+.05,38,spb*36,.05)}return}
    if(ZMU.end){ZMU.end=0;ZMU.I=.15}
    // always: the low drone on the root of the chord
    if(s===0){vPad(tr,t,[C[0]-12,C[0]-5],spb*16,.05+.03*I,200+300*I);if(I>.3)vBass(tr,t,C[0]-24,spb*12,.08*amb)}
    // the calm: a bell far away at the start of the loop, the out-of-tune music box
    if(I<.45){const k=(.45-I)/.3;if(s===0&&bar===0)vBell(tr,t,C[0]-12,spb*20,.025*k);
      if((s===4||s===10||s===13)&&Math.random()<.6)vBox(tr,t,ZMU_BOX[Math.floor(Math.random()*ZMU_BOX.length)]+(Math.random()-.5)*.4,spb*3,.018*k)}
    // the round: the heart beating (twice as often when it gets hard) and the cello crawling
    if(I>.28){const v=Math.min(1,(I-.28)/.3);if(s===0||s===3||(I>.75&&(s===8||s===11)))dDrum(tr,t,(s%8?.06:.09)*v+.05*L,s%8?54:62,36,.4,180,.05);
      if(s%2===0)vCello(tr,t,C[0]-12+ZMU_CRAWL[s>>1],spb*1.8,.035*v*amb)}
    // the tension: war drums, a bell a tritone off, the choir breathing in the dark
    if(I>.6){const v=Math.min(1,(I-.6)/.25)*amb;if(s===0||s===8)dTaiko(tr,t,.18*v);if(s===12&&bar%2===1)vBell(tr,t,C[0]+6,spb*8,.02*v);
      if(s===0&&bar%2===0)vChoir(tr,t,[C[0]-12,C[1]-12,C[2]-12],spb*30,.035*v)}
    // the boss: drums on every beat, the low brass climbing a semitone, the choir on every bar
    if(boss){if(s%4===0)dTaiko(tr,t,s===0?.26:.16);if(s===0)vBrass(tr,t,C[0]-12,spb*6,.06);if(s===8)vBrass(tr,t,C[0]-11,spb*6,.05);if(s===0)vChoir(tr,t,[C[0]-12,C[0]-6,C[0]],spb*15,.045)}}};
// on the map the match's music starts as soon as the menu's has faded (before, the map was silent); the menu starts its own again on leaving
{const _o=zMusicOff;zMusicOff=function(){_o.apply(this,arguments);ZMU.I=0;ZMU.end=0;ZMU.low=0;setTimeout(()=>{if(ZG.on)playMusic('zpartita')},700)}}
