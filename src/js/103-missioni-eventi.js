// =====================================================================
// 103. MISSIONI ED EVENTI NUOVI (Denis, 31 ottobre, alla domanda «cosa possiamo migliorare?»: «Missioni ed eventi nuovi»).
// - Le missioni della Zombie, del giorno e della settimana (round raggiunto, zombie uccisi, un boss del camposanto, le abilità, una
//   medaglia della Sfida della notte), per chi ha giocato almeno una volta nel camposanto. Stanno in fondo agli elenchi (MPOOL, WPOOL):
//   gli indici delle missioni di prima non cambiano; a chi non ha mai giocato la Zombie non vengono date (si tolgono un attimo mentre il
//   gioco pesca le missioni del giorno e della settimana).
// - L'evento della settimana: ogni settimana uno diverso (Caccia ai boss, La grande orda, Fiera del muschio; dal 25 ottobre al 7
//   novembre la Notte delle zucche), con la sua moneta, che si guadagna giocando in tutte e due le modalità (dagli stessi momenti che fanno
//   avanzare le missioni: mprog), e cinque premi lungo il cammino, l'ultimo con una cornice del Profilo. Un bottone «Evento» in fondo alla
//   colonna di destra della schermata principale (Classica e Zombie), col punto esclamativo quando c'è un premio da prendere.
// =====================================================================
// ------------------------------------------------------------------ the missions of the Zombie
const ZMIS_D=[{k:'zround',g:5,n:'Raggiungi il round 5 nel camposanto'},{k:'zkill',g:60,n:'Uccidi 60 zombie nel camposanto'},{k:'zboss',g:1,n:'Sconfiggi un boss del camposanto'}]
  .concat(typeof ZAB!=='undefined'?[{k:'zab',g:6,n:'Usa 6 volte le abilità zombie'}]:[]).concat(typeof ZCH!=='undefined'?[{k:'zmed',g:1,n:'Prendi una medaglia nella Sfida della notte'}]:[]),
  ZMIS_W=[{k:'zkill',g:500,n:'Uccidi 500 zombie nel camposanto'},{k:'zround',g:12,n:'Raggiungi il round 12 nel camposanto'}];
const ZMP0=MPOOL.length,ZMW0=WPOOL.length;MPOOL.push(...ZMIS_D);WPOOL.push(...ZMIS_W);
const zPlayed=()=>(SAVE.zN||0)>=1;
{const _d=ensureDaily;ensureDaily=function(){if(zPlayed())return _d.apply(this,arguments);const keep=MPOOL.splice(ZMP0);try{return _d.apply(this,arguments)}finally{MPOOL.push(...keep)}}}
{const _w=ensureWeekly;ensureWeekly=function(){if(zPlayed())return _w.apply(this,arguments);const keep=WPOOL.splice(ZMW0);try{return _w.apply(this,arguments)}finally{WPOOL.push(...keep)}}}
// where they move: the end of a match in the graveyard, a boss of the graveyard, an ability used, a medal of the Night Challenge
if(typeof zFine==='function'){const _f=zFine;zFine=function(oro,R,kills){const r=_f.apply(this,arguments);try{mprog('zround',null,R,true);mprog('zkill',null,kills||0);evRunToast()}catch(e){console.error(e)}return r}}
if(typeof ZM!=='undefined'&&ZM.partita){const inst=D=>{if(!D||D.__evm)return;D.__evm=1;const _k=D.killed;D.killed=function(z){_k.apply(this,arguments);try{if(z&&z.boss)mprog('zboss',null,1)}catch(e){}}};
  const _p=ZM.partita;ZM.partita=function(){const D=_p.apply(this,arguments);inst(D);return D};if(ZM.W.director)inst(ZM.W.director)}
if(typeof zabUse==='function'){const _u=zabUse;zabUse=function(i){const c0=ZABS.cd[i];_u.apply(this,arguments);try{if(ZABS.cd[i]>0&&!(c0>0))mprog('zab',null,1)}catch(e){}}}
if(typeof zchEnd==='function'){const _z=zchEnd;zchEnd=function(){const C=zchSave(),n0=C.got.filter(Boolean).length;_z.apply(this,arguments);try{if(zchSave().got.filter(Boolean).length>n0)mprog('zmed',null,1)}catch(e){}}}
// ------------------------------------------------------------------ the event of the week
Object.assign(FRAMES,{zucca:{n:'Zucca',c:['#ffb040','#8a3a10']},teschio:{n:"Teschio d'oro",c:['#ffe58a','#6a4a10']},orda:{n:'Orda',c:['#dfe6cf','#3a4a2a']},fiera:{n:'Fiera',c:['#c8f08a','#2f5a22']}});
const EVL={
  zucche:{n:'Notte delle zucche',tok:'zucche',col:'#ff8a2a',d:'Le zucche spuntano tra le tombe e nella cripta. Ogni stanza superata vale una zucca, ogni round del camposanto due, ogni boss tre.',
    earn:{room:1,boss:3,zround:2,zboss:3},steps:[[20,{gold:300}],[50,{pack:['classica','r']}],[90,{gems:15}],[140,{pack:['zombie','e']}],[200,{gems:40,frame:'zucca'}]]},
  teschi:{n:'Caccia ai boss',tok:"teschi d'oro",col:'#ffd84a',d:"Ogni boss battuto lascia teschi d'oro: quattro nella Classica, nell'Abisso e nel camposanto; ogni arena conquistata ne vale tre.",
    earn:{boss:4,zboss:4,win:3},steps:[[8,{gold:400}],[20,{pack:['classica','r']}],[36,{gems:20}],[56,{pack:['classica','e']}],[80,{gems:40,frame:'teschio'}]]},
  orda:{n:'La grande orda',tok:'denti',col:'#e8e2d0',d:'Un dente ogni 5 zombie uccisi nel camposanto, e uno ogni 15 nemici nella Classica.',
    earn:{zkill:1/5,kill:1/15},steps:[[15,{gold:300}],[40,{pack:['zombie','r']}],[75,{gems:15}],[120,{pack:['zombie','e']}],[180,{gems:40,frame:'orda'}]]},
  muschio:{n:'Fiera del muschio',tok:'semi di muschio',col:'#9fe06a',d:"Un seme di muschio per ogni stanza superata, e uno ogni 150 oro raccolto nelle partite.",
    earn:{room:1,gold:1/150},steps:[[20,{gold:300}],[50,{pack:['classica','r']}],[90,{gems:15}],[140,{pack:['classica','e']}],[200,{gems:40,frame:'fiera'}]]}};
const EV_ROT=['teschi','orda','muschio'];
// which event now: the pumpkins from 25 October to 7 November, otherwise one of three, a different one each week (Monday to Monday)
function evCur(){const d=new Date(),y=d.getFullYear(),mo=d.getMonth(),dd=d.getDate();
  if((mo===9&&dd>=25)||(mo===10&&dd<=7)){const y0=mo===9?y:y;return{id:'zucche',key:'zucche'+y0,end:new Date(y0,10,8)}}
  const day=(d.getDay()+6)%7,mon=new Date(y,mo,dd-day),wk=Math.round(mon.getTime()/6048e5);return{id:EV_ROT[((wk%3)+3)%3],key:EV_ROT[((wk%3)+3)%3]+'|'+weekKey(),end:weekEnd()}}
function evSave(){const E=evCur();if(!SAVE.evt||SAVE.evt.key!==E.key)SAVE.evt={key:E.key,id:E.id,tok:0,got:[0,0,0,0,0],run:0};return SAVE.evt}
const evTok=()=>Math.floor(evSave().tok+1e-6);
// the coin of the event comes from the same moments that move the missions
function evEarn(k,t,v){const S=evSave(),r=EVL[S.id].earn[k];if(!r)return;const n=k==='room'?r:r*(+v||0);if(!(n>0))return;S.tok+=n;S.run=(S.run||0)+n}
{const _m=mprog;mprog=function(k,t,v,abs){_m.apply(this,arguments);try{evEarn(k,t,v)}catch(e){}}}
// at the end of a run, how much of the event's coin it gave
function evRunToast(){const S=evSave(),n=Math.floor(S.run||0);S.run=0;if(n>0)setTimeout(()=>{try{toast('+'+n+' '+EVL[S.id].tok+' · '+EVL[S.id].n)}catch(e){}},900)}
{const _e=endRun;endRun=function(){_e.apply(this,arguments);try{evRunToast()}catch(e){}}}
const evReady=()=>{const S=evSave(),E=EVL[S.id];return E.steps.some((s,i)=>!S.got[i]&&S.tok+1e-6>=s[0])};
function evRewTxt(r){const P={c:'Comune',r:'Rara',e:'Epica',l:'Leggendaria'};const a=[];if(r.gold)a.push(r.gold.toLocaleString('it-IT')+' oro');if(r.gems)a.push(r.gems+' cristalli');
  if(r.pack)a.push('Bustina '+(r.pack[0]==='zombie'?'Zombie':'Classica')+' '+P[r.pack[1]]);if(r.frame)a.push('cornice «'+FRAMES[r.frame].n+'»');return a.join(' e ')}
function evGrant(r){if(r.gold){SAVE.gold+=r.gold;sfx('coin')}if(r.gems){SAVE.gems=(SAVE.gems||0)+r.gems;sfx('gem')}if(r.pack)addPack(r.pack[0],r.pack[1]);
  if(r.frame){SAVE.xframes=SAVE.xframes||[];if(!SAVE.xframes.includes(r.frame))SAVE.xframes.push(r.frame);sfx('victory')}save()}
// the coin's little picture: a pumpkin, a golden skull, a tooth, a seed of moss
function evIcon(id,s){s=s||30;const I={zucche:'<path d="M16 9c-7 0-11 5-11 10s4 9 11 9 11-4 11-9-4-10-11-10z" fill="#ff8a2a" stroke="#191714" stroke-width="2"/><path d="M16 9c-3 4-3 15 0 19M16 9c3 4 3 15 0 19M10 11c-2 5-2 12 1 16M22 11c2 5 2 12-1 16" fill="none" stroke="#a8480e" stroke-width="1.4"/><path d="M15 9c0-3 1-5 3-6" stroke="#4a6a2a" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M11 18l2-2 2 2zM17 18l2-2 2 2zM11 22q5 4 10 0l-2 1-1-1-2 1-1-1-2 1z" fill="#ffe08a"/>',
  teschi:'<path d="M16 5c-6 0-10 4-10 10 0 4 2 6 4 7v4h12v-4c2-1 4-3 4-7 0-6-4-10-10-10z" fill="#ffd84a" stroke="#191714" stroke-width="2"/><circle cx="12" cy="15" r="2.6" fill="#191714"/><circle cx="20" cy="15" r="2.6" fill="#191714"/><path d="M14 22v3M16 22v3M18 22v3" stroke="#191714" stroke-width="1.4"/><path d="M9 9q3-3 7-3" stroke="#fff6c0" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  orda:'<path d="M9 7c2-2 5-1 7 0 2-1 5-2 7 0 3 3 1 8 0 12-1 3-1 8-3 8-2 0-2-5-4-5s-2 5-4 5c-2 0-2-5-3-8-1-4-3-9 0-12z" fill="#efe9d6" stroke="#191714" stroke-width="2"/><path d="M12 9q2-1 4 0" stroke="#a89e84" stroke-width="1.4" fill="none"/>',
  muschio:'<path d="M16 5c6 4 9 9 8 15-1 5-5 8-8 8s-7-3-8-8c-1-6 2-11 8-15z" fill="#9fe06a" stroke="#191714" stroke-width="2"/><path d="M16 9v16M16 14l-4-3M16 19l4-3" stroke="#3f6a2a" stroke-width="1.6" stroke-linecap="round"/>'}[id]||'';
  return `<svg viewBox="0 0 32 32" width="${s}" height="${s}" aria-hidden="true">${I}</svg>`}
// ------------------------------------------------------------------ the button and the sheet
{const b=document.createElement('button');b.className='qbtn';b.id='evtBtn';b.setAttribute('aria-label','Evento');document.querySelector('.sideBtns.r').appendChild(b);b.onclick=()=>openSheet('evento')}
let evBtnK='';
function renderEvBtn(){const S=evSave(),r=evReady(),k=S.id+'|'+r;if(k===evBtnK)return;evBtnK=k;const b=$('evtBtn');b.innerHTML=`${evIcon(S.id)}<small>Evento</small>${r?'<em class="pip">!</em>':''}`;b.classList.toggle('hot',r)}
{const _s=renderSide;renderSide=function(){_s.apply(this,arguments);try{renderEvBtn()}catch(e){console.error(e)}}}
function fillEvento(){const S=evSave(),E=EVL[S.id],C=evCur(),left=C.end-new Date(),days=Math.floor(left/864e5),tok=evTok(),last=E.steps[E.steps.length-1][0];lastSheetHTML='';
  const tl=days>=1?`${days} ${days===1?'giorno':'giorni'} e ${Math.floor(left%864e5/36e5)} ore`:fmtH(left);
  $('sheet').innerHTML=`<style>.evHead{display:flex;align-items:center;gap:12px;justify-content:center;margin:4px 0 6px}.evHead b{font:400 30px var(--display);color:${E.col};text-shadow:0 2px 0 var(--ink)}
    .evBar{height:12px;border:2px solid var(--ink);border-radius:8px;background:#211a15;overflow:hidden;margin:2px 0 8px}.evBar i{display:block;height:100%;background:linear-gradient(${E.col},#7a4a1a)}
    .evStep{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:6px 0;border:2px solid var(--ink);border-radius:12px;background:rgba(0,0,0,.25)}.evStep.got{opacity:.6}.evStep.ready{box-shadow:0 0 0 2px ${E.col} inset}
    .evStep .n{min-width:44px;display:flex;align-items:center;gap:3px;font:400 16px var(--display)}.evStep .t{flex:1;font-weight:800;font-size:13.5px;line-height:1.2}.evStep .btn{padding:6px 12px;font-size:14px;margin:0}.evStep .ok{color:#9fe06a;font-weight:800}</style>
    <h2>${E.n}</h2><p class="lead">${E.d}</p><p class="lead small">Finisce tra <b>${tl}</b>.</p>
    <div class="evHead">${evIcon(S.id,40)}<b>${tok}</b><span class="muted">${E.tok}</span></div><div class="evBar"><i style="width:${Math.min(100,tok/last*100).toFixed(1)}%"></i></div>
    ${E.steps.map((s,i)=>{const got=!!S.got[i],ready=!got&&tok>=s[0];return `<div class="evStep ${got?'got':''} ${ready?'ready':''}"><span class="n">${evIcon(S.id,18)}${s[0]}</span><span class="t">${evRewTxt(s[1])}</span>${got?'<span class="ok">Preso</span>':ready?`<button class="btn go" data-evget="${i}">Prendi</button>`:''}</div>`}).join('')}
    <button class="btn alt close">Chiudi</button>`}
{const _os=openSheet;openSheet=function(kind){if(kind==='evento'){SHEET=kind;sfx('ui');fillEvento();$('sheetScr').hidden=false;return}return _os.apply(this,arguments)}}
$('sheet').addEventListener('click',e=>{const b=e.target.closest('button[data-evget]');if(!b)return;const S=evSave(),E=EVL[S.id],i=+b.dataset.evget,s=E.steps[i];if(!s||S.got[i]||evTok()<s[0])return;
  S.got[i]=1;evGrant(s[1]);try{achPop(E.n,evRewTxt(s[1]),'trophy')}catch(_){}evBtnK='';try{renderEvBtn()}catch(_){}fillEvento()});
try{renderEvBtn()}catch(e){}
