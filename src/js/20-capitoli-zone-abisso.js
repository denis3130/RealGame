// ---------- chapters, zones and endless mode ----------
Object.assign(ET,{
  imp:{r:10,hp:30,cdmg:9,gold:2},
  magmaslime:{r:14,hp:55,cdmg:13,gold:3},
  obsidian:{r:15,hp:120,cdmg:18,gold:5},
  pyro:{r:12,hp:55,cdmg:10,gold:4},
  salamander:{r:24,hp:2600,cdmg:22,gold:50,name:'Salamandra di Lava',title:'Regina delle pendici'},
  smith:{r:30,hp:4200,cdmg:26,gold:90,name:'Il Fabbro Infernale',title:'Signore della forgia'}});
Object.assign(ECOL,{imp:'#e5484d',magmaslime:'#ff7a2e',obsidian:'#3a3440',pyro:'#a8342a',salamander:'#d94a1f',smith:'#5a5a62'});
Object.assign(XPV,{imp:4,magmaslime:5,obsidian:9,pyro:6,salamander:80,smith:0});
const BOSSZ={golem:'golem',radici:'witch',magma:'salamander',fabbro:'smith',rospo:'toad',idra:'hydra',yeti:'yeti',regina:'icequeen'};
const LAVAZ=['cenere','magma','forgia','fabbro'];
const MUSIC={muschio:'muschio',golem:'golem',cristalli:'cristalli',radici:'witch',cenere:'vulcano',magma:'salamandra',forgia:'forgia',fabbro:'fabbro'};
function zoneOf(room){
  if(G.mode==='inf'){if(room%10===5)return['golem','magma','rospo','yeti'][Math.floor(room/10)%4];if(room%10===0)return['radici','fabbro','idra','regina'][(room/10-1)%4];return['muschio','cristalli','cenere','forgia','palude','canneto','brina','ghiacciaio'][Math.floor((room-1)/5)%8]}
  // one boss per arena, in the last room; the daily challenge keeps the chapter's custodian
  if(room>=ROOMS)return G.daily?['radici','fabbro','idra','regina'][(G.chapter||1)-1]:(ARENAS[G.arena||0].boss||'radici');
  if(G.chapter===2)return room<=5?'cenere':'forgia';
  if(G.chapter===3)return room<=5?'palude':'canneto';
  if(G.chapter===4)return room<=5?'brina':'ghiacciaio';
  return room<=5?'muschio':'cristalli'}
const isBossRoom=room=>!!BOSSZ[zoneOf(room)];
const effRoom=()=>G.mode==='inf'?G.room:G.room+2*((G.chapter||1)-1);
const isLava=()=>LAVAZ.includes(themeOf(G.room));
Object.assign(ENV,{
  cenere:{wall:['#2a2220','#30261f','#241d1b','#352a24'],mortar:'#140f0d',side:'#1f1916',floor:['#3d3532','#38302d','#423936','#342d2a'],base:'#2a2422',torch:['#ff3c10','#ff8a22','#ffe6a0'],light:'255,130,60',ember:'#ff9a3c',dark:.5,amb:{ash:16,ember:8},fog:'120,70,50',door:'#4a3c34'},
  magma:{wall:['#2c1f1a','#33241c','#261a16','#3a2a20'],mortar:'#120c0a',side:'#1e1512',floor:['#3a2f2b','#352a26','#40332e','#30261f'],base:'#271e1a',torch:['#ff2a08','#ff7a1a','#ffe0a0'],light:'255,110,50',ember:'#ff8a3c',dark:.52,amb:{ember:18,ash:8},fog:'140,60,30',door:'#4a362c'},
  forgia:{wall:['#2b2b2e','#333338','#26262a','#3a3a40'],mortar:'#141416',side:'#1e1e22',floor:['#46464c','#404046','#4c4c52','#3c3c42'],base:'#2c2c30',torch:['#ff5a14','#ffa632','#fff1c0'],light:'255,150,70',ember:'#ffb347',dark:.48,amb:{ember:12,mote:8},fog:null,door:'#4a4a52'},
  fabbro:{wall:['#28262a','#302d32','#232125','#36323a'],mortar:'#121013',side:'#1c1a1e',floor:['#424048','#3c3a42','#48464e','#38363e'],base:'#29272c',torch:['#ff3c10','#ff8a22','#ffe6a0'],light:'255,120,55',ember:'#ff9a3c',dark:.52,amb:{ember:20},fog:'150,70,40',door:'#48444c'}});
Object.assign(VARIANTS,{
  cenere:[{n:'Pendici di cenere',lavaCracks:9,rubble:6,cracks:3,bones:2},{n:'Campo di ossidiana',lavaCracks:4,shards:12,rubble:4},{n:'Crosta di lava',lavaPools:4,lavaCracks:6,rubble:3}],
  magma:[{n:'Nido della Salamandra',lavaPools:3,lavaCracks:10,rune:'magma'}],
  forgia:[{n:'Fucina dei Nani',grates:5,rails:1,rubble:5,lavaCracks:2},{n:'Sala delle Incudini',grates:3,rubble:8,cracks:4,lavaChannel:1},{n:'Condotti di lava',lavaChannel:2,grates:3,rubble:3}],
  fabbro:[{n:'Forgia Infernale',rune:'fabbro',lavaCracks:8,grates:4}]});
Object.assign(KINDS,{
  cenere:{big:['basalt','lavarock','obsidian'],small:['obsidian','skulls','brazier']},
  magma:{big:['basalt'],small:['basalt']},
  forgia:{big:['anvil','cauldron','crate'],small:['anvil','brazier','crate']},
  fabbro:{big:['anvil'],small:['anvil']}});
Object.assign(KH,{basalt:2,lavarock:.9,obsidian:1.5,anvil:.95,cauldron:1.1,crate:1.1});
Object.assign(DPAL,{basalt:['#5a4d46','#3d3430','#ff7a2e'],lavarock:['#3d3430','#2a2320','#ff8a3c'],obsidian:['#1b1820','#3a3440','#ff7a2e'],anvil:['#ffd86b','#ff8a3c','#6b6f78'],cauldron:['#2a2a30','#ff7a2e','#ffd86b'],crate:['#c9a26a','#8a6038','#6b4a2a']});

