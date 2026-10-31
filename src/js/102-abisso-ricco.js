// =====================================================================
// 102. L'ABISSO PIÙ RICCO (Denis, 31 ottobre, alla domanda «cosa possiamo migliorare?»: «Abisso più ricco»). Tre cose nuove:
// - i 4 boss del terzo giro anche nell'Abisso: dopo gli 8 di prima (stanze 5–40) arrivano il Burattinaio d'Ombra (45), la Fenice della
//   Forgia (50), la Piovra della Palude (55) e il Cervo d'Aurora (60), poi il giro ricomincia ogni 60 stanze; la stanza resta quella del
//   mondo del giro (come nelle arene 9–12), con il loro cerchio di rune, la musica, l'entrata e le voci;
// - i Patti dell'Abisso: battuto un boss dell'Abisso, il buio offre tre patti e se ne sceglie uno, un dono e un prezzo (Attacco +30% e
//   Salute −20%, Oro +60% e nemici più forti…); i patti si sommano per tutta la discesa e cambiano ogni partita;
// - i tesori della discesa: oltre alla cassa di sempre, dalla stanza 20 cristalli (2 ogni 5 stanze oltre la 15) e una bustina Classica
//   (Rara dalla 30, Epica dalla 45, Leggendaria dalla 60), scritti sulla schermata di fine.
// =====================================================================
// ------------------------------------------------------------------ the four new bosses in the Abyss
{const _b=boss3At;boss3At=function(n){const r=_b.apply(this,arguments);if(r)return r;if(!G||G.mode!=='inf'||G.event)return null;const room=n==null?G.room:n;if(room<45||room%5)return null;
  const c=((room/5)-1)%12;return c>=8?B3T[c-8]:null}}
// ------------------------------------------------------------------ the pacts
const PATTI=[
  {id:'sangue',n:'Patto del sangue',dono:'Attacco +30%',prezzo:'Salute massima −20%',col:'#e0473a',f:()=>{P.atk*=1.3;pactHp(.8)}},
  {id:'oro',n:"Patto dell'oro",dono:'Oro +60%',prezzo:'Nemici +15% salute',col:'#ffd84a',f:()=>{P.goldMul*=1.6;G.curseHp=(G.curseHp||1)*1.15}},
  {id:'furia',n:'Patto della furia',dono:'Cadenza +25%',prezzo:'Salute massima −15%',col:'#ff8a3c',f:()=>{P.aspd*=1.25;pactHp(.85)}},
  {id:'brace',n:'Patto della brace',dono:'I tuoi colpi bruciano',prezzo:'Attacco −10%',col:'#ff6a20',ok:()=>!P.fire,f:()=>{P.fire=true;P.atk*=.9}},
  {id:'gelo',n:'Patto del gelo',dono:'I tuoi colpi rallentano',prezzo:'Cadenza −10%',col:'#8fd0ff',ok:()=>!P.ice,f:()=>{P.ice=true;P.aspd*=.9}},
  {id:'veggente',n:'Patto del veggente',dono:'Critico +12%',prezzo:'Boss +25% salute',col:'#c48ae8',f:()=>{P.crit+=.12;G.pactBoss=(G.pactBoss||1)*1.25}},
  {id:'lama',n:'Patto della lama',dono:'Colpi perforanti +1',prezzo:'Salute massima −10%',col:'#d4d9e2',f:()=>{P.pierce=(P.pierce||0)+1;pactHp(.9)}},
  {id:'vita',n:'Patto della linfa',dono:'Rigenerazione +1,5 al secondo',prezzo:'Attacco −12%',col:'#8ff0a8',f:()=>{P.regen=(P.regen||0)+1.5;P.atk*=.88}},
  {id:'tesoro',n:'Patto del tesoro',dono:'+4 cristalli subito',prezzo:'Nemici +10% salute',col:'#5fd0f0',f:()=>{G.gemsRun=(G.gemsRun||0)+4;G.curseHp=(G.curseHp||1)*1.1}}];
function pactHp(k){P.maxhp=Math.max(30,Math.round(P.maxhp*k));P.hp=Math.min(P.hp,P.maxhp)}
// the icons: a seal with the colour of the pact and its mark
function pactSVG(p){const m={sangue:'<path d="M20 9c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z" fill="#fff" opacity=".9"/>',oro:'<circle cx="20" cy="20" r="7.5" fill="#fff" opacity=".9"/><path d="M20 15v10M16.5 18h7" stroke="#2a1430" stroke-width="2"/>',
  furia:'<path d="M23 9l-9 13h6l-3 10 10-14h-6z" fill="#fff" opacity=".9"/>',brace:'<path d="M20 8c3 5 8 7 8 14a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 1 4 2 4 0-4 0-7 2-10z" fill="#fff" opacity=".9"/>',
  gelo:'<path d="M20 9v22M10.5 14.5l19 11M10.5 25.5l19-11" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',veggente:'<path d="M9 20c4-6 18-6 22 0-4 6-18 6-22 0z" fill="#fff" opacity=".9"/><circle cx="20" cy="20" r="3.4" fill="#2a1430"/>',
  lama:'<path d="M12 28L27 13l2-3-3 2L11 27z" fill="#fff"/><path d="M11 24l5 5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>',vita:'<path d="M20 31c-1-7 0-12 6-16-1 6-3 9-6 11 2-5 1-9-3-12-1 6 0 11 3 17z" fill="#fff" opacity=".9"/>',
  tesoro:'<path d="M20 9l7 8-7 14-7-14z" fill="#fff" opacity=".9"/><path d="M13 17h14" stroke="#2a1430" stroke-width="1.6"/>'}[p.id]||'';
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#2a1430" stroke="#191714" stroke-width="2.4"/><circle cx="20" cy="20" r="13.5" fill="none" stroke="${p.col}" stroke-width="2.2" stroke-dasharray="3 2.4"/>${m}</svg>`}
// the screen of the pacts: three seals to choose from, the game stopped behind it
const PACT={el:null,offer:[]};
function pactUI(){if(PACT.el)return PACT.el;const el=document.createElement('div');el.id='pactScr';el.hidden=true;el.innerHTML=`<style>
  #pactScr{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:calc(16px + env(safe-area-inset-top,0px)) 14px calc(16px + env(safe-area-inset-bottom,0px));
    background:radial-gradient(ellipse at 50% 40%,rgba(60,20,80,.86),rgba(8,4,14,.95));font-family:var(--body,"Baloo 2",system-ui);color:#f1e4c6;animation:pactIn .35s ease-out}
  @keyframes pactIn{from{opacity:0}to{opacity:1}}
  #pactScr h2{margin:0;font:400 30px var(--display,"Lilita One",system-ui);letter-spacing:.03em;color:#e6c8ff;text-shadow:0 3px 0 #000,0 0 18px rgba(196,138,232,.6);text-align:center}
  #pactScr p.s{margin:0 0 4px;font:700 14px var(--body,"Baloo 2",system-ui);opacity:.85;text-align:center;max-width:320px}
  #pactScr .row{display:flex;gap:10px;justify-content:center;max-width:560px}
  #pactScr .pc{width:min(calc((100vw - 58px)/3),170px);min-width:0;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px 12px;border-radius:16px;border:3px solid #000;cursor:pointer;
    background:linear-gradient(#3a2346,#1c1024);box-shadow:0 5px 0 #000,inset 0 0 0 2px var(--pc),0 0 18px rgba(0,0,0,.5);color:inherit;font:inherit;animation:pactCard .45s cubic-bezier(.2,1.4,.4,1) backwards}
  #pactScr .pc:nth-child(2){animation-delay:.08s}#pactScr .pc:nth-child(3){animation-delay:.16s}
  @keyframes pactCard{from{transform:translateY(30px) scale(.85);opacity:0}}
  #pactScr .pc:active{transform:translateY(3px);box-shadow:0 2px 0 #000,inset 0 0 0 2px var(--pc)}
  #pactScr .pc svg{width:58px;height:58px}#pactScr .pc b{font:400 15px var(--display,"Lilita One",system-ui);letter-spacing:.02em;text-align:center;line-height:1.1;min-height:2.2em;display:flex;align-items:center}
  #pactScr .pc .d{font-weight:800;font-size:13px;color:#9fe06a;text-align:center;line-height:1.15}#pactScr .pc .x{font-weight:800;font-size:12.5px;color:#ff8a70;text-align:center;line-height:1.15}
  #pactScr .mine{font:700 12px var(--body,"Baloo 2",system-ui);opacity:.7;text-align:center;max-width:340px}
  </style><h2>Patto dell'Abisso</h2><p class="s">Il buio ti offre un dono. In cambio vuole qualcosa.</p><div class="row"></div><div class="mine"></div>`;
  document.body.appendChild(el);el.addEventListener('click',e=>{const b=e.target.closest('.pc');if(!b)return;pactPick(+b.dataset.i)});PACT.el=el;return el}
function pactOpen(){const taken=G.pacts||[],pool=PATTI.filter(p=>!taken.includes(p.id)&&(!p.ok||p.ok()));if(pool.length<1){G.pactPend=0;return}
  const offer=[];while(offer.length<Math.min(3,pool.length)){const p=pool[Math.floor(Math.random()*pool.length)];if(!offer.includes(p))offer.push(p)}PACT.offer=offer;
  const el=pactUI();el.querySelector('.row').innerHTML=offer.map((p,i)=>`<button class="pc" data-i="${i}" style="--pc:${p.col}">${pactSVG(p)}<b>${p.n}</b><span class="d">${p.dono}</span><span class="x">${p.prezzo}</span></button>`).join('');
  el.querySelector('.mine').textContent=taken.length?'I tuoi patti: '+taken.map(id=>PATTI.find(p=>p.id===id).n.replace('Patto ','')).join(' · '):'';
  el.hidden=false;modal=true;paused=true;G.pactPend=0;try{sfx('ui')}catch(e){}pactSnd()}
function pactPick(i){const p=PACT.offer[i];if(!p||!PACT.el||PACT.el.hidden)return;try{p.f()}catch(e){console.error(e)}G.pacts=(G.pacts||[]).concat(p.id);PACT.el.hidden=true;modal=false;paused=false;
  try{sfx('upgrade')}catch(e){}try{toast(p.n+': '+p.dono)}catch(e){}}
function pactSnd(){try{if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.02;AU.pan=0;vChoir(null,t,[38,45,50],2.4,.07);vBell(null,t+.2,50,2.8,.18);fNoise(t,1.4,'lowpass',320,.7,.3,{brown:true,att:.4})}catch(e){}}
// after a boss of the Abyss: the pact comes when the boss's body has finished and no other choice is open
{const _c=onRoomClear;onRoomClear=function(){_c.apply(this,arguments);if(G.mode==='inf'&&!G.event&&isBossRoom(G.room))G.pactPend=1}}
{const _u=update;update=function(dt){_u.apply(this,arguments);if(G&&G.pactPend&&G.mode==='inf'&&!paused&&!modal&&!(P.pendingLv>0)&&!(G.corpses&&G.corpses.length)&&G.state!=='dead')pactOpen()}}
// the bosses' health under the seer's pact
{const _m=makeE;makeE=function(type){const e=_m.apply(this,arguments);if(e&&G&&G.mode==='inf'&&G.pactBoss&&isBoss(type)){e.hp*=G.pactBoss;e.max*=G.pactBoss}return e}}
// ------------------------------------------------------------------ the treasures of the descent (at the end, not when you give up)
function abyssTreasure(room){const out=[];const gems=room>=20?2*Math.floor((room-15)/5):0;if(gems){SAVE.gems=(SAVE.gems||0)+gems;out.push('+'+gems+' cristalli')}
  const pk=room>=60?'l':room>=45?'e':room>=30?'r':null;if(pk){addPack('classica',pk);out.push('Bustina Classica '+{r:'Rara',e:'Epica',l:'Leggendaria'}[pk])}if(out.length)save();return out}
{const _e=endRun;endRun=function(win,quit){const inf=G&&G.mode==='inf',room=G&&G.room||0,np=(G&&G.pacts||[]).length;_e.apply(this,arguments);if(!inf||quit)return;
  const got=abyssTreasure(room),t=$('endText');if(!t)return;let el=document.getElementById('endAbyss');if(!el){el=document.createElement('p');el.id='endAbyss';el.style.cssText='margin:4px 0 0;font-weight:800;color:#e6c8ff;text-align:center';t.after(el)}
  el.textContent=(got.length?"Tesori dell'Abisso: "+got.join(' · '):'Dalla stanza 20 l\'Abisso dà i suoi tesori.')+(np?` · Patti stretti: ${np}`:'')}}
// the sheet of the Abyss says what is new down there
{const _f=fillAbyss;fillAbyss=function(){_f.apply(this,arguments);const b=$('sheet').querySelector('.abTop');if(!b)return;const p=document.createElement('p');p.className='lead small';
  p.innerHTML='Dopo ogni boss, un <b>Patto dell\'Abisso</b>: un dono e un prezzo. Dalla stanza 45 i <b>quattro boss del terzo giro</b>. Dalla stanza 20, a fine discesa, <b>cristalli e bustine</b>.';b.after(p)}}
