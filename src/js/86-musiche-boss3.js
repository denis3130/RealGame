// =====================================================================
// LE MUSICHE DEI 4 BOSS NUOVI (docs/boss-nuovi.md), sullo stesso schema delle altre musiche dei boss (76-musiche-boss.js: attesa,
// colpo d'orchestra all'arrivo, tema, accordo di vittoria). Quattro battute che girano, una voce in più dal secondo giro:
// - burattinaio: carillon storto (due note un po' stonate l'una sull'altra) e archi pizzicati, un violoncello che scende, il sonaglio;
// - fenice: tamburi di forgia e incudini, ottoni che chiamano, il basso che pulsa;
// - piovra: marimba che ondeggia, bolle (note brevi e alte che salgono), il basso morbido;
// - cervo: coro e campane di ghiaccio, l'arpa che sale, i tamburi lontani.
// =====================================================================
Object.assign(TRACKS,{
  burattinaio:{bpm:100,roots:[45,41,43,40],ch:[[57,60,64],[53,57,60],[55,59,62],[52,56,59]],
    mel:[[0,76,2],[2,77,2],[4,76,2],[6,72,2],[8,69,6],[16,71,2],[18,72,2],[20,71,2],[22,67,2],[24,64,6],[32,69,2],[34,72,2],[36,76,2],[38,79,2],[40,77,4],[44,76,4],[48,75,2],[50,76,2],[52,71,4],[56,68,8]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,loop=step%64,cyc=Math.floor(step/64),r=this.roots[bar],c=this.ch[bar];
      if(s===0){vCello(tr,t,r-12,spb*15,.22);vPad(tr,t,c,spb*16,.09,650)}
      if(s%2===0)vPluck(tr,t,[c[(s/2)%3]+(s%8===6?12:0)],spb*1.4,.13);
      if(s===4||s===12)dTom(tr,t,.28,s===4?520:440);if(s===0||s===10)dDrum(tr,t,.5,90,40,.35,300,.12);dShaker(tr,t,s%4===2?.04:.016);
      // the crooked music box: the tune and the same note a little out of tune under it
      for(const[ss,m,l] of this.mel)if(ss===loop){vBox(tr,t,m,spb*l*1.8,.1);if(cyc%2===1)vBox(tr,t+.012,m-.32,spb*l*1.4,.045)}
      if(bar===3&&s===14)vBell(tr,t,93,1.2,.025)}},
  fenice:{bpm:126,roots:[48,44,46,43],ch:[[60,64,67],[56,60,63],[58,62,65],[55,59,62]],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,cyc=Math.floor(step/64),r=this.roots[bar],c=this.ch[bar];
      if(s===0){vPad(tr,t,c,spb*16,.06,900);vBass(tr,t,r-12,spb*6,.22)}
      if(s%4===0||s===14)vBass(tr,t,r-12+(s===14?7:0),spb*1.6,.17);
      if([0,3,6,8,11,14].includes(s))dTaiko(tr,t,{0:.72,3:.4,6:.52,8:.66,11:.4,14:.52}[s]);if(s===4||s===12)vAnvil(tr,t,.05,s===4?520:600);dShaker(tr,t,s%2?.04:.022);
      // the brass call: on the first and the third bar, then everywhere from the second round
      if((bar%2===0||cyc>0)&&(s===0||s===6||s===10)){const m=c[s===0?0:s===6?1:2];vBrass(tr,t,m,spb*(s===10?6:4),.1);if(s===0)vBrass(tr,t,m-12,spb*6,.08)}
      if(cyc>0&&s===8&&bar===3)for(let i=0;i<3;i++)vBrass(tr,t+i*spb*.66,c[i]+12,spb*2,.06)}},
  piovra:{bpm:104,roots:[43,46,41,38],ch:[[55,58,62],[58,62,65],[53,57,60],[50,53,57]],
    run:[0,2,4,7,4,2,0,-3],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,cyc=Math.floor(step/64),r=this.roots[bar],c=this.ch[bar];
      if(s===0){vPad(tr,t,c,spb*16,.07,700);vBass(tr,t,r-12,spb*10,.22)}
      if(s===8)vBass(tr,t,r-5,spb*6,.13);
      // the marimba sways up and down the chord
      if(s%2===0)vMallet(tr,t,c[0]+12+this.run[(s/2)%8],spb*2,s%8===0?.12:.08);
      if(cyc>0&&s%4===3)vMallet(tr,t,c[2]+12,spb,.04);
      // bubbles: short high notes rising
      if(s===5||s===13&&bar%2){for(let i=0;i<3;i++)vBox(tr,t+i*spb*.33,84+i*4+(bar%2)*3,.18,.022)}
      dShaker(tr,t,s%2?.03:.015);if(s===4||s===12)dTom(tr,t,.15,s===4?300:260)}},
  cervo:{bpm:92,roots:[50,46,43,45],ch:[[62,66,69],[58,62,65],[55,59,62],[57,61,64]],arp:[0,7,12,16,19,16,12,7],
    play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,cyc=Math.floor(step/64),r=this.roots[bar],c=this.ch[bar];
      if(s===0){vChoir(tr,t,c,spb*16,.13);vBass(tr,t,r-12,spb*14,.18);vBell(tr,t,c[0]+24,3,.04)}
      vHarp(tr,t,r+24+this.arp[s%8],.5,s%4===0?.07:.04);
      if(s===6||s===14)vBell(tr,t,c[s===6?1:2]+24+(cyc>0?12:0),2.2,.035);
      if(cyc>0&&s===8)vChoir(tr,t,c.map(m=>m+12),spb*8,.06);
      if(s===0||s===8)dTaiko(tr,t,s?.4:.65);if(s===11)dTom(tr,t,.2,170);dShaker(tr,t,s%2?.025:.012)}}});
