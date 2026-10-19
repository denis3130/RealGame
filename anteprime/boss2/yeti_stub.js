// A pretend model for the brain's tests while the new model is not there yet: the Yeti of today plays every move of the new one, with
// the new lengths (anteprime/mk_boss2.py yeti --stub). Each boss has one like this: anteprime/boss2/<type>_stub.js. The short hop of the
// second phase and the claws are its leap and its fists on the floor, the icy breath its roar, the panting, the mocking gesture and the
// entrance its idle, the rage and the defeat its knock back; the height of the jumps comes from the game (o.z, as the new model does).
(()=>{const map={bound:'leap',breath:'roar',gasp:'idle',claws:'pound',rage:'hit',taunt:'idle',enter:'idle',die:'hit'};
  const og=N3.yeti;N3.yeti2=(x,y,f,a,p,sc,o)=>og(x,y,f,map[a]||a,p,sc,o);
  N3.meta.yeti2={n:'Yeti delle Vette',g:'boss',sc:1,an:['idle','walk','hit','leap','bound','pound','snowball','breath','gasp','roar','claws','rage','taunt','enter','die'],
    dur:{idle:3,walk:1.3,hit:.6,leap:2.4,bound:1.3,pound:2.2,snowball:2,breath:3,gasp:1.4,roar:3,claws:1.9,rage:3,taunt:1.2,enter:3.4,die:4},lab:{}};
  N3.order.push('yeti2')})();
