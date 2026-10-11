// ---------- run sequences ----------
function makeSeqFor(){
  if(G.mode==='inf'){const seq=[];for(let r=1;r<=400;r++){seq.push({c:r});if(r%3===0&&r%5!==0)seq.push({e:pk(Object.keys(EVENTS))})}return seq}
  return makeSeq();
}
function compositionFor(n){
  const z=zoneOf(n);
  if(BOSSZ[z])return[BOSSZ[z]];
  if(G.mode!=='inf'&&G.chapter===2){
    const C={1:['magmaslime','magmaslime','imp'],2:['magmaslime','imp','magmaslime','skeleton'],3:['pyro','bomber','magmaslime','beetle'],4:['obsidian','imp','imp','pyro'],5:['obsidian','pyro','magmaslime','imp'],
      6:['obsidian','obsidian','pyro','bomber'],7:['beetle','bomber','pyro','magmaslime','obsidian'],8:['pyro','bomber','skeleton','obsidian','imp']};
    const pool=['magmaslime','imp','pyro','obsidian','skeleton','beetle','shadoweye','bomber'];
    const out=C[n]?C[n].slice():Array.from({length:7},()=>pk(pool));
    for(let i=0;i<Math.floor((n-1)/2);i++)out.push(pk(pool));return out.slice(0,9)}
  if(G.mode!=='inf'&&(G.chapter===3||G.chapter===4)){
    const C=G.chapter===3?{1:['frog','frog','mosquito'],2:['frog','mosquito','croc','frog'],3:['snail','frog','mosquito','mosquito'],4:['croc','croc','snail','frog'],5:['croc','snail','mosquito','frog'],6:['mosquito','mosquito','croc','snail','frog'],7:['snail','snail','frog','frog','mushroom'],8:['croc','croc','mosquito','snail','frog']}
      :{1:['wolf','wolf','snowspirit'],2:['wolf','snowspirit','icesentinel'],3:['snowspirit','snowspirit','wolf','wolf'],4:['icesentinel','wolf','wolf','snowspirit'],5:['icesentinel','wolf','snowspirit','wolf'],6:['icesentinel','icesentinel','snowspirit','wolf'],7:['wolf','wolf','wolf','snowspirit','icesentinel'],8:['icesentinel','snowspirit','snowspirit','wolf','wolf']};
    const pool=G.chapter===3?['frog','mosquito','croc','snail','frog','mushroom']:['wolf','snowspirit','icesentinel','wolf'];
    const out=C[n]?C[n].slice():Array.from({length:7},()=>pk(pool));
    for(let i=0;i<Math.floor((n-1)/2);i++)out.push(pk(pool));return out.slice(0,9)}
  if(G.mode==='inf'){
    const pools={palude:['frog','mosquito','croc','snail','mushroom'],canneto:['frog','mosquito','croc','snail','tadpole'],brina:['wolf','snowspirit','icesentinel'],ghiacciaio:['wolf','snowspirit','icesentinel','wolf'],muschio:['slime','bigslime','bat','goblin','mushroom','plant','eyeflower'],cristalli:['skeleton','wisp','beetle','mushroom','goblin','plant','shadoweye','eyeflower','necro'],cenere:['magmaslime','imp','pyro','skeleton','beetle','shadoweye'],forgia:['obsidian','pyro','imp','skeleton','beetle','bomber']};
    const p=pools[z],n2=Math.min(10,3+Math.floor(n/2));return Array.from({length:n2},()=>pk(p))}
  return composition(n);
}
function bossLayout(z){return{golem:[[78,200,18],[282,200,18]],radici:[[70,230,16],[290,230,16],[70,470,16],[290,470,16]],magma:[[80,200,18],[280,200,18],[180,500,16]],fabbro:[[66,220,16],[294,220,16],[66,480,16],[294,480,16]],rospo:[[66,200,16],[294,200,16],[180,520,16]],idra:[[64,460,16],[296,460,16]],yeti:[[78,200,18],[282,200,18],[78,480,18],[282,480,18]],regina:[[92,190,16],[268,190,16],[180,480,16]]}[z]}

