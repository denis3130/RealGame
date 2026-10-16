// A pretend model for the brain's tests while the new model is not there yet: the Golem of today plays every move of the new one
// (anteprime/mk_boss2.py golem --stub). Each boss has one like this: anteprime/boss2/<type>_stub.js.
(()=>{const map={stuck:'idle',fault:'throw',curl:'roll',unroll:'idle',beam:'throw',rage:'hit',taunt:'idle',enter:'idle',die:'hit'};
  const og=N3.golem;N3.golem2=(x,y,f,a,p,sc,o)=>og(x,y,f,map[a]||a,p,sc,o);
  N3.meta.golem2={n:'Golem di Muschio',g:'boss',sc:1,an:['idle','walk','hit','leap','stuck','throw','fault','curl','roll','unroll','beam','rage','taunt','enter','die'],
    dur:{idle:3,walk:1.2,hit:.6,leap:1.8,stuck:1,throw:1.6,fault:1.4,curl:.8,roll:1,unroll:1,beam:3.1,rage:2.8,taunt:1,enter:3.2,die:4},lab:{}};N3.order.push('golem2')})();
