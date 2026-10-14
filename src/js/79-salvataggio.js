// ---------- IL CONTROLLO DEL SALVATAGGIO (anteprima 48, punto 55 del piano di Denis): dopo la lettura e prima di ogni scrittura (save, in
// 07-meta-oggetti-casse.js, che scrive i tre blocchi classica, zombie, condivisa). Rimette a posto solo quello che è rotto e non toglie mai
// niente di posseduto: numeri finiti, non negativi e interi (oro, cristalli, materiali, coppe, partite, carte, bustine, Lucky Cards); livelli
// tra 1 e il massimo (oggetti e armi zombie 10, vestiti 5); quello che è indossato o portato deve essere posseduto (oggetti, arma zombie,
// vestito, compagni), altrimenti torna a quello di partenza; i tetti di capienza (99 bustine per rarità, 99 Lucky Cards per tipo, 9.999 carte)
const SAVE_CAP={bustine:99,lucky:99,cards:9999};
function nn(v,max){v=Number(v);if(!isFinite(v)||v<0)return 0;v=Math.floor(v);return max!=null?Math.min(v,max):v}
function lvFix(o,max){if(!o||typeof o!=='object')return{lvl:1,cards:0};o.lvl=Math.max(1,nn(o.lvl,max)||1);o.cards=nn(o.cards,SAVE_CAP.cards);return o}
function saveCheck(S){if(!S||typeof S!=='object')return S;
  for(const k of['gold','gems','trophies','runs'])if(k in S)S[k]=nn(S[k]);
  if(S.mat&&typeof S.mat==='object')for(const k of Object.keys(S.mat))S.mat[k]=nn(S.mat[k]);
  if(S.items&&typeof S.items==='object'){for(const id of Object.keys(S.items))S.items[id]=lvFix(S.items[id],MAXLV)}
  if(S.eq&&typeof S.eq==='object'){const D0=defSave().eq;for(const sl of Object.keys(S.eq)){const id=S.eq[sl];if(id&&!(S.items&&S.items[id]))S.eq[sl]=D0[sl]&&S.items&&S.items[D0[sl]]?D0[sl]:null}}
  if(S.z&&typeof S.z==='object'){for(const g of['guns','acc'])if(S.z[g]&&typeof S.z[g]==='object')for(const id of Object.keys(S.z[g]))S.z[g][id]=lvFix(S.z[g][id],MAXLV);
    if(S.z.guns&&S.z.gun&&!S.z.guns[S.z.gun])S.z.gun='pistola'}
  if(S.bustine&&typeof S.bustine==='object')for(const m of Object.keys(S.bustine))if(S.bustine[m]&&typeof S.bustine[m]==='object')for(const r of Object.keys(S.bustine[m]))S.bustine[m][r]=nn(S.bustine[m][r],SAVE_CAP.bustine);
  if(S.lucky&&S.lucky.inv&&typeof S.lucky.inv==='object'){for(const k of Object.keys(S.lucky.inv))S.lucky.inv[k]=nn(S.lucky.inv[k],SAVE_CAP.lucky);if(S.lucky.pick&&!(S.lucky.inv[S.lucky.pick]>0))S.lucky.pick=null}
  if(S.skinCards&&typeof S.skinCards==='object')for(const k of Object.keys(S.skinCards))S.skinCards[k]=nn(S.skinCards[k],SAVE_CAP.cards);
  if(S.skinLv&&typeof S.skinLv==='object')for(const k of Object.keys(S.skinLv))S.skinLv[k]=Math.max(1,nn(S.skinLv[k],SKIN_MAX)||1);
  if(S.skin&&!(S.skins&&S.skins[S.skin]))S.skin=null;
  if(S.pets&&typeof S.pets==='object'){const P0=S.pets;if(P0.cards&&typeof P0.cards==='object')for(const k of Object.keys(P0.cards))P0.cards[k]=nn(P0.cards[k],SAVE_CAP.cards);
    if(P0.owned&&typeof P0.owned==='object')for(const o of Object.values(P0.owned))if(o&&typeof o==='object'){if('cards' in o)o.cards=nn(o.cards,SAVE_CAP.cards);if('lvl' in o)o.lvl=Math.max(1,nn(o.lvl)||1)}
    if(Array.isArray(P0.eq))P0.eq=P0.eq.filter((id,i,a)=>P0.owned&&P0.owned[id]&&a.indexOf(id)===i).slice(0,PET_SLOTS)}
  return S}
saveCheck(SAVE);
