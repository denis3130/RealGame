// ---------- setup ----------
function newRun(){
  P=makeP();
  const md=SAVE.sel||'c1';G={mode:md==='inf'?'inf':'camp',chapter:md==='c2'?2:1,room:1,gold:0,kills:0,t:0,fade:0,shake:0,state:'play',bannerT:0,seq:null,si:0,event:null,orbs:[],lvlT:0,curseHp:1,gemsRun:0};
  if(G.mode!=='inf'){const ai=arenaIdx(SAVE.trophies||0);G.arena=ai;G.chapter=ARENAS[ai].ch;G.diff=ARENAS[ai].diff}
  if(md==='daily'){const C=chalToday();G.daily=C;G.chapter=C.ch;G.diff=1.25;G.arena=0;for(const id of C.mods){const M=CHAL_MODS.find(m=>m.id===id);if(M)M.f()}}
  G.pets=makePets();G.pet=G.pets[0]||null;G.petShots=[];P.ult=0;$('ultBtn').classList.remove('full');
  G.seq=makeSeqFor();G.ccRoom=pk([3,4,6,7,8,9]);buildRoom();
}
function makeP(){
  P={x:AW/2,y:BOT-40,r:12,hp:120,maxhp:120,atk:22,aspd:1.7,crit:.05,front:1,multi:1,diag:0,side:0,rear:0,ric:0,pierce:0,regen:0,revive:0,goldMul:1,
     fire:false,ice:false,orbit:0,dashMax:2.2,dashCd:0,dashT:0,dvx:0,dvy:0,inv:0,face:-Math.PI/2,fireCd:.3,moving:false,walk:0,queue:[],aiming:false,poisonCd:0,skills:{},lvl:1,xp:0,need:needXp(1),pendingLv:0};
  const g=gear();P.atk+=g.t.atk;P.maxhp=P.hp=Math.round(120+g.t.hp);P.aspd*=1+g.t.aspd;P.crit+=g.t.crit;P.dashMax*=1-Math.min(.5,g.t.dash);P.goldMul=1+g.t.gold;
  g.perks.forEach(f=>f(P));applyMeta(P);return P;
}
// ---- difficoltà: tutte le manopole stanno qui (da regolare giocando) ----
// Prima vita e danno si moltiplicavano tra loro: nell'arena 12 alla stanza 10 la vita era ×22 e il danno ×6,6.
// Ora la salita è più dolce: vita ×2,8 e danno ×1,45 alla fine dell'arena 1; vita ×10 e danno ×3 alla fine dell'arena 12.
const DIFF={hpRoom:.2,      // vita: +20% per stanza (effRoom conta anche +2 per mondo)
  dmgRoom:.05,              // danno: +5% per stanza
  dmgDiff:.5,               // danno: prende metà della difficoltà dell'arena (la vita la prende tutta)
  frRoom:.045,frMax:1.8,    // cadenza di tiro dei nemici
  eliteBase:.08,eliteRoom:.025,eliteMax:.5,eliteFrom:3,   // élite: probabilità base, crescita per stanza, tetto, prima stanza possibile
  eliteFirstArena:5,        // nella prima arena niente élite a sorpresa prima della stanza 5
  bossFirst:.9,             // il boss della prima arena ha il 90% della vita
  firstHp:.85,firstDmg:.78};// prima arena: nemici più fragili e meno cattivi (qui si impara)
const firstK=k=>G.mode!=='inf'&&!G.daily&&!G.arena?DIFF[k]:1;
// room 5 of every arena: no boss any more, two champions (elites) instead
const champRoom=()=>G.mode!=='inf'&&!G.daily&&!G.event&&G.room===5;
function hpMul(){return (1+(effRoom()-1)*DIFF.hpRoom)*(G.diff||1)*firstK('firstHp')}
const FR=()=>Math.min(DIFF.frMax,1+(effRoom()-1)*DIFF.frRoom),DMG=()=>(1+(effRoom()-1)*DIFF.dmgRoom)*(1+((G.diff||1)-1)*DIFF.dmgDiff)*firstK('firstDmg');
// bosses grow little by little with trophies: inside each group of 4 arenas (tier) health climbs a step per arena and
// smoothly with the trophies won inside the arena; higher tiers make them "smarter" (faster, fewer pauses, one extra move)
function bossLvl(){if(G.mode==='inf'||G.daily)return{grow:1,spd:1,tier:0,pos:0};const ai=G.arena||0,A=ARENAS[ai],N=ARENAS[ai+1],tr=SAVE.trophies||0;if(!ai)return{grow:1,spd:1,tier:0,pos:0};
  const frac=N?clamp((tr-A.t)/(N.t-A.t),0,1):clamp((tr-A.t)/3000,0,1),tier=Math.floor(ai/4),pos=ai%4;
  return{grow:1+.08*pos+.08*frac,spd:Math.min(1.38,1+.05*pos+.12*tier+.03*frac),tier,pos}}
const bossMul=()=>(G.mode==='inf'?1+Math.max(0,G.room-10)*.09:bossLvl().grow*(G.arena?1:DIFF.bossFirst))*(G.diff||1);
function makeE(type,x,y,spawn,elite){if(SAVE.seen)SAVE.seen[type]=1;const e=makeE0(type,x,y,spawn);if(elite){e.elite=true;e.hp*=2.6;e.max=e.hp;e.r=Math.round(e.r*1.2);e.gold*=3;e.cdmg=Math.round(e.cdmg*1.3)}if(G.giant&&!isBoss(type))e.r=Math.round(e.r*1.2);return e}
const BOSS_INTRO={golem:3.1,witch:2.9,salamander:2.6,smith:2.6,mimic:1.6};
function makeE0(type,x,y,spawn){const d=ET[type],m=isBoss(type)?bossMul():hpMul()*(G.curseHp||1);
  return{type,x,y,r:d.r,hp:d.hp*m,max:d.hp*m,cdmg:Math.round(d.cdmg*DMG()),gold:d.gold,spawn:spawn==null?.8:spawn,flash:0,burn:0,burnTick:0,slow:0,
    t:rand(0,5),cd:rand(.8,1.8),jump:0,z:0,vx:0,vy:0,aim:0,aimA:0,rot:0,orbCd:0,st:'walk',stT:1.4,si:0,sub:'',dead:false,
    face:Math.PI/2,walk:0,moving:false,intro:isBoss(type)?(BOSS_INTRO[type]||1.6):0,hidden:false,ph:'show',phT:rand(1,2),arm:0,puff:0,wind:0,lunge:0,la:0,
    side:1,p2:false,fireT:0,spin:0,bounces:0,orb:0,alpha:1,...(type==='golem'?{z:1200}:type==='witch'||type==='salamander'||type==='toad'||type==='hydra'?{em:0}:type==='smith'||type==='icequeen'?{fa:0}:{})}}
function composition(n){
  const C={1:['slime','slime','slime'],2:['slime','slime','bat','bat'],3:['goblin','goblin','mushroom','slime'],4:['skeleton','bat','slime','plant'],
    5:['goblin','skeleton','bat','mushroom'],6:['wisp','wisp','skeleton','bigslime'],7:['beetle','beetle','shadoweye','goblin','necro'],8:['mushroom','shadoweye','skeleton','necro','wisp']};
  if(C[n]){const out=C[n].slice();if(n>=3&&n!==5){const extra=n<5?['slime','bat','goblin']:['skeleton','wisp','beetle','mushroom','goblin','shadoweye','eyeflower','necro'];for(let i=0;i<Math.floor((n-1)/2);i++)out.push(extra[randi(0,extra.length-1)])}return out.slice(0,9)}
  const pool=['slime','bigslime','bat','goblin','skeleton','mushroom','wisp','beetle','plant'],out=[];let plants=0;
  for(let i=0;i<9;i++){let t=pool[randi(0,pool.length-1)];if(t==='plant'&&++plants>2)t='skeleton';out.push(t)}
  return out;
}
function freeSpot(r,minY,maxY){let x,y,tries=0;
  do{x=rand(L+30,R-30);y=rand(minY,maxY);tries++}
  while(tries<60&&(G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+r+8)||G.enemies.some(e=>Math.hypot(e.x-x,e.y-y)<40)));
  return{x,y}}
function buildRoom(){clearTimeout(bossDown.t);
  // gems still lying on the floor when you leave a room are yours anyway; the run total is never reset between rooms
  G.gemsRun=(G.gemsRun||0)+((G.gems&&G.gems.length)||0);$('bossDown').hidden=true;
  {const big=bigOn()&&!G.event&&!INTRO.on;setWorld(big?BIG.w:VW,big?BIG.h:VH)}
  Object.assign(G,{ultRain:[],petShots:[],goldRun:null,trial:null,dark:false,lobs:[],rollers:[],enemies:[],eproj:[],arrows:[],coins:[],gems:[],hearts:[],waves:[],fx:[],texts:[],decals:[],zones:[],bands:[],boulders:[],door:false,state:'play',clearT:0,orbs:[],prop:null,meteors:[],lines:[],lavaLights:[],bossDmg:false,cc:null,ccChosen:false,champN:0,corpses:[],winShown:false});
  P.x=AW/2;P.y=BOT-40;P.queue=[];P.inv=.6;P.face=-Math.PI/2;for(const pt of G.pets||[]){pt.x=P.x+(pt.slot?26:-26);pt.y=P.y+8}
  const boss=!G.event&&isBossRoom(G.room);
  let lay=G.event?[[66,190,16],[294,190,16],[66,500,16],[294,500,16]]:boss?bossLayout(zoneOf(G.room)):LAYOUTS[randi(0,LAYOUTS.length-1)];
  const flip=Math.random()<.5,kx=(R-L)/(VW-48),ky=(BOT-TOP)/(VH-26-TOP);if(AW>VW)lay=lay.map(([x,y,r])=>[L+(x-L)*kx,TOP+(y-TOP)*ky,r]);
  const th=themeOf(G.room);G.rocks=lay.map(([x,y,r])=>({x:flip?AW-x:x,y,r,seed:Math.random()*10,kind:pickKind(th,r)}));fields={};
  // the big arenas get a few more obstacles in their empty spaces (never near the gate, the hero's start or other obstacles)
  if(AW>VW&&!boss&&!G.event){const n=randi(2,3);for(let i=0,tries=0;i<n&&tries<80;tries++){const r=Math.random()<.5?20:14,x=rand(L+40,R-40),y=rand(TOP+90,BOT-110);
    if(Math.hypot(x-AW/2,y-TOP)<110||Math.hypot(x-AW/2,y-(BOT-40))<120||G.rocks.some(k=>Math.hypot(k.x-x,k.y-y)<k.r+r+70))continue;G.rocks.push({x,y,r,seed:Math.random()*10,kind:pickKind(th,r)});i++}}
  for(const t of (G.event?[]:compositionFor(G.room))){
    if(isBoss(t)){G.enemies.push(makeE(t,AW/2,TOP+(240-TOP)*ky,0));continue}
    const s=freeSpot(ET[t].r,TOP+40,TOP+320*(AH/VH));G.enemies.push(makeE(t,s.x,s.y,undefined,champRoom()&&G.champN<2&&!isBoss(t)?(G.champN++,true):eliteRoll(t)));
  }
  G.dark=rollDark(boss);
  if(G.event)setupEvent();
  buildEnv();renderFloor();bakeWalls();arenaTint();gradeRoom();playMusic(musicFor(G.room));
  const b=G.enemies.find(e=>isBoss(e.type));
  bossBarReset();$('bossBar').hidden=!b;$('bossBar').classList.remove('rage');if(b)$('bossName').textContent=ET[b.type].name;
  $('banner').classList.toggle('low',!!b&&!G.event);
  if(G.event)banner(EVENTS[G.event].n,EVENTS[G.event].sub,2.2);else if(b){banner(ET[b.type].name,ET[b.type].title,2.6);}else if(champRoom())banner('Stanza 5 · Campioni','Due élite ti sbarrano la strada',2.6);else banner((G.mode==='inf'?'Abisso · Stanza ':'Stanza ')+G.room,G.dark?'Buio! Le torce sono spente: oro doppio':G.variant.n);
}

