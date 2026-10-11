// ---------- definitions ----------
const ET={
  slime:{r:13,hp:40,cdmg:12,gold:2},
  bigslime:{r:20,hp:95,cdmg:16,gold:4},
  bat:{r:10,hp:24,cdmg:9,gold:2},
  goblin:{r:12,hp:46,cdmg:10,gold:3},
  plant:{r:15,hp:75,cdmg:10,gold:3},
  skeleton:{r:13,hp:80,cdmg:14,gold:4},
  mushroom:{r:13,hp:55,cdmg:10,gold:3},
  wisp:{r:11,hp:38,cdmg:8,gold:3},
  beetle:{r:11,hp:30,cdmg:10,gold:3},
  golem:{r:34,hp:1500,cdmg:22,gold:40,name:'Golem di Muschio',title:'Guardiano della prima cripta'},
  witch:{r:20,hp:2300,cdmg:18,gold:70,name:'Strega delle Radici',title:'Signora della cripta'}};
const BOSSES=new Set(['golem','witch','salamander','smith','mimic','toad','hydra','yeti','icequeen']);const isBoss=t=>BOSSES.has(t);
const LAYOUTS=[
  [[110,270,22],[250,270,22],[180,390,26]],
  [[90,210,20],[270,210,20],[90,430,20],[270,430,20]],
  [[180,250,24],[118,340,18],[242,340,18]],
  [[70,310,18],[108,310,18],[252,310,18],[290,310,18]],
  [[130,220,20],[236,440,22],[182,330,16]],
  [[180,200,18],[100,300,22],[260,400,22]]];
const SK=[
  {id:'front',n:'Freccia frontale',d:'Un dardo parallelo in più',max:3,f:()=>P.front++},
  {id:'multi',n:'Raffica',d:'Ogni attacco scocca una volta in più',max:2,f:()=>P.multi++},
  {id:'diag',n:'Frecce diagonali',d:'Due dardi a ventaglio',max:2,f:()=>P.diag++},
  {id:'side',n:'Frecce laterali',d:'Un dardo per lato',max:1,f:()=>P.side=1},
  {id:'rear',n:'Freccia posteriore',d:'Un dardo alle tue spalle',max:1,f:()=>P.rear=1},
  {id:'ric',n:'Rimbalzo',d:'Il dardo salta su un altro nemico',max:3,f:()=>P.ric++},
  {id:'pierce',n:'Perforazione',d:'Il dardo trapassa un nemico in più',max:3,f:()=>P.pierce++},
  {id:'aspd',n:'Corda tesa',d:"Velocità d'attacco +20%",max:5,f:()=>P.aspd*=1.2},
  {id:'atk',n:'Punte affilate',d:'Attacco +20%',max:5,f:()=>P.atk*=1.2},
  {id:'crit',n:'Occhio di falco',d:'Colpo critico +10%',max:4,f:()=>P.crit+=.1},
  {id:'hp',n:'Cuore di quercia',d:'Salute massima +20%',max:5,f:()=>{const a=Math.round(P.maxhp*.2);P.maxhp+=a;P.hp+=a}},
  {id:'heal',n:'Pozione',d:'Recuperi il 40% della salute',max:99,f:()=>{P.hp=Math.min(P.maxhp,P.hp+P.maxhp*.4)},cond:()=>P.hp<P.maxhp*.85},
  {id:'fire',n:'Frecce infuocate',d:'I nemici colpiti bruciano',max:1,f:()=>P.fire=true},
  {id:'ice',n:'Frecce di ghiaccio',d:'I nemici colpiti rallentano',max:1,f:()=>P.ice=true},
  {id:'orbit',n:'Lame rotanti',d:'Una lama ti gira attorno',max:3,f:()=>P.orbit++},
  {id:'dash',n:"Passo d'ombra",d:'Ricarica dello scatto -30%',max:2,f:()=>P.dashMax*=.7}];
const S2='stroke="#1b1612" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const arrowP=(x1,y1,x2,y2,c='#8a5a20')=>{const a=Math.atan2(y2-y1,x2-x1),hx=x2-Math.cos(a)*7,hy=y2-Math.sin(a)*7;return `<path d="M${x1} ${y1}L${hx} ${hy}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/><path d="M${x2} ${y2}L${hx+Math.cos(a+1.57)*5} ${hy+Math.sin(a+1.57)*5}L${hx+Math.cos(a-1.57)*5} ${hy+Math.sin(a-1.57)*5}Z" fill="#c9cfd6" ${S2}/>`};
const ICON={
  front:arrowP(8,26,34,26)+arrowP(8,14,34,14),
  multi:arrowP(4,20,22,20)+arrowP(16,20,36,20),
  diag:arrowP(20,32,20,6)+arrowP(20,32,6,10)+arrowP(20,32,34,10),
  side:arrowP(20,20,4,20)+arrowP(20,20,36,20)+'<circle cx="20" cy="20" r="5" fill="#2fb3a6" '+S2+'/>',
  rear:arrowP(22,20,38,20)+arrowP(18,20,2,20,'#b5482f'),
  ric:'<path d="M6 32L18 10L34 30" fill="none" stroke="#8a5a20" stroke-width="3.5" stroke-dasharray="4 4"/><circle cx="18" cy="10" r="5" fill="#7bbf4a" '+S2+'/><circle cx="34" cy="30" r="5" fill="#7bbf4a" '+S2+'/>',
  pierce:'<circle cx="20" cy="20" r="9" fill="#7bbf4a" '+S2+'/>'+arrowP(2,20,38,20),
  aspd:'<path d="M23 3L10 22h9l-3 15 14-20h-9z" fill="#ffc93c" '+S2+'/>',
  atk:'<path d="M20 3L28 20L20 37L12 20Z" fill="#c9cfd6" '+S2+'/><path d="M20 10v20" stroke="#1b1612" stroke-width="2"/>',
  crit:'<circle cx="20" cy="20" r="13" fill="none" stroke="#e5484d" stroke-width="3.5"/><circle cx="20" cy="20" r="4" fill="#e5484d"/><path d="M20 2v8M20 30v8M2 20h8M30 20h8" stroke="#1b1612" stroke-width="3"/>',
  hp:'<path d="M20 34C8 25 4 18 4 13a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 5-4 12-16 21z" fill="#e5484d" '+S2+'/><path d="M20 14v10M15 19h10" stroke="#f6ead2" stroke-width="3"/>',
  heal:'<path d="M15 4h10v8l7 10v10a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V22l7-10z" fill="#e5484d" '+S2+'/><rect x="13" y="2" width="14" height="5" rx="2" fill="#8a5a20" '+S2+'/>',
  fire:'<path d="M20 3c4 7 12 11 12 21a12 12 0 0 1-24 0c0-6 4-9 6-13 1 4 3 6 5 6 0-6 0-9 1-14z" fill="#ff8a3c" '+S2+'/><path d="M20 22c3 3 5 5 5 8a5 5 0 0 1-10 0c0-3 3-5 5-8z" fill="#ffc93c"/>',
  ice:'<path d="M20 3v34M5 11l30 18M35 11L5 29" stroke="#7fd3f0" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="20" r="4" fill="#f6ead2" '+S2+'/>',
  orbit:'<circle cx="20" cy="20" r="13" fill="none" stroke="#b8a990" stroke-width="2" stroke-dasharray="3 4"/><path d="M33 20l4-6 1 9-6 5z" fill="#c9cfd6" '+S2+'/><circle cx="20" cy="20" r="5" fill="#2fb3a6" '+S2+'/>',
  dash:'<path d="M14 8h12l-6 10h10L14 34l4-12H9z" fill="#2fb3a6" '+S2+'/><path d="M2 14h7M1 22h6M3 30h6" stroke="#b8a990" stroke-width="3" stroke-linecap="round"/>'};

