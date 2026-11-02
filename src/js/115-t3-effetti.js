// =====================================================================
// 115. MOSSBOUND TRIPLA A · LA LUCE DEI COLPI E I COLPI CHE SI SENTONO (anteprima a parte, con 110–114).
// Ogni freccia e ogni colpo dei nemici porta la sua luce nella stanza (il pavimento, i muri e i corpi vicini se ne accendono, del colore del
// colpo); un colpo a segno fa un lampo caldo sul nemico, un'uccisione un lampo più grande del colore del nemico, un colpo preso un lampo
// rosso sull'eroe e la telecamera che si stringe un attimo; quando il gioco scuote lo schermo (gli schianti dei boss) la telecamera dà
// anche un colpetto. Sotto i colpi, le uccisioni e gli schianti un tonfo basso, con la coda della cripta. Niente allunga le lotte: il
// gioco, i tempi e i danni restano quelli di sempre. Con gli effetti ridotti: niente luci dei colpi in volo.
// =====================================================================
const T3FX={on:true,L:[],kick:0,t:0,shake:0,n:0};
const T3KILL={slime:[.55,1,.4],bigslime:[.55,1,.4],magmaslime:[1,.55,.2],bat:[.8,.55,1],mushroom:[.8,.55,1],wisp:[.45,.85,1],plant:[.6,1,.4],golem:[.45,1,.75]};
function t3FxLight(x,y,z,r,rgb,a,d){if(T3FX.L.length>24)T3FX.L.shift();T3FX.L.push({x,y,z,r,rgb,a,d,t0:G.t||0})}
const t3ColOf=p=>{const c=p&&(p.col||p.c||p.color);if(typeof c==='string'&&c.length>3){const q=t3rgbT(c);if(q.every(v=>isFinite(v)))return[q[0],q[1],q[2]]}return[1,.48,.3]};
// the lights of this frame: the shots in flight, the flashes that fade
T3H.pre.push(()=>{if(!T3FX.on)return;const t=G.t||0;let n=0;
  if(!LOWFX){for(const a of G.arrows){if(n>=6)break;n++;t3Light(a.x,a.y,12,62,[1,.86,.58],.5)}for(const p of G.eproj){if(n>=11)break;n++;t3Light(p.x,p.y,10,56,t3ColOf(p),.6)}}
  // (what shines by itself lights the room too: the wisps, the lava slimes)
  for(const e of G.enemies){if(e.spawn>0||e.dead)continue;if(e.type==='wisp')t3Light(e.x,e.y,24,95,[.72,.66,1],.75);else if(e.type==='magmaslime')t3Light(e.x,e.y,12,80,[1,.5,.22],.7)}
  T3FX.L=T3FX.L.filter(l=>{const k=1-(t-l.t0)/l.d;if(k<=0||t<l.t0)return false;t3Light(l.x,l.y,l.z,l.r*(.65+.35*k),l.rgb,l.a*k*k);return true});T3FX.n=n});
// a blow that lands, a kill, a blow taken
{const _h=hurtE;hurtE=function(e,dmg,crit,dot){const hp0=e&&e.hp,r=_h.apply(this,arguments);try{if(T3FX.on&&e&&!dot&&typeof t3Active==='function'&&t3Active()){const z=(e.r||12)*1.2+(e.z||0);
      if(e.hp<=0&&hp0>0)t3FxLight(e.x,e.y,z,isBoss(e.type)?220:120,T3KILL[e.type]||[1,.82,.45],isBoss(e.type)?1.6:1.15,isBoss(e.type)?.6:.3);
      else t3FxLight(e.x,e.y,z,crit?95:70,crit?[1,.9,.5]:[1,.95,.8],crit?1.1:.75,.12)}}catch(err){}return r}}
{const _p=hurtP;hurtP=function(d){const t0=P.hurtT,r=_p.apply(this,arguments);try{if(T3FX.on&&P.hurtT!==t0&&typeof t3Active==='function'&&t3Active()){t3FxLight(P.x,P.y,16,90,[1,.25,.18],1.1,.3);T3FX.kick=Math.max(T3FX.kick,.05)}}catch(err){}return r}}
// the camera: a short squeeze when the hero is hit or the screen shakes hard (the boss lands, a slab falls), then back
T3.fxCam=function(T){const t=G.t||0,dt=Math.min(.05,Math.max(0,t-T3FX.t));T3FX.t=t;const sh=G.shake||0;if(sh>T3FX.shake+2.5)T3FX.kick=Math.max(T3FX.kick,Math.min(.07,sh*.006));T3FX.shake=sh;
  T3FX.kick=Math.max(0,T3FX.kick-dt*.45);T.zk=1+T3FX.kick};
// the sounds: a low thump under the blows, the kills and the crashes, sent also into the reverb of the crypt
function t3Thump(k,x){const w={hit:.16,death:.3,boom:.55,quake:.6,block:.14,shieldBreak:.3,hurt:.26}[k];if(!w||!AU.ctx||!AU.on.sfx)return;const c=AU.ctx,t=c.currentTime+.004,g=c.createGain(),o=osc('sine',k==='boom'||k==='quake'?70:105,t,t+.34);
  o.frequency.exponentialRampToValueAtTime(k==='boom'||k==='quake'?32:46,t+.22);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(w*.55,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+(k==='boom'||k==='quake'?.32:.18));
  const lp=filt('lowpass',220,.7);o.connect(lp);lp.connect(g);let out=g;if(c.createStereoPanner&&x!=null){const pn=c.createStereoPanner();pn.pan.value=Math.max(-.6,Math.min(.6,(x-180)/220));g.connect(pn);out=pn}out.connect(AU.sfxBus);
  if(AU.sRev){const s=c.createGain();s.gain.value=.35;g.connect(s);s.connect(AU.sRev)}}
{const _s=sfx;sfx=function(k,arg,x){const r=_s.apply(this,arguments);try{if(T3FX.on&&typeof t3Active==='function'&&t3Active())t3Thump(k,x)}catch(err){}return r}}
