// A pretend model for the brain's tests while the new model is not there yet: the Re Rospo of today plays every move of the new one
// (anteprime/mk_boss2.py toad --stub). Each boss has one like this: anteprime/boss2/<type>_stub.js. The Lingua incollata is its tongue held
// out (to o.tip, where the game says), the Frustata its tongue too, the Tamburo and the Pioggia its throat swelling, the Furia a hit that
// grows 12%, the entrance a belly flop from the sky (not there before .30, it falls until .45), the defeat a swelling and a shrinking.
(()=>{const og=N3.toad,OM=N3.meta.toad;
  // the new tongue's moments (out at .55, all out at .60, held to .66, back in by .90) on today's (.57, .69, .75, .97)
  const tg=p=>p<.55?p/.55*.57:p<.6?.57+(p-.55)/.05*.12:p<.66?.69+(p-.6)/.06*.06:p<.9?.75+(p-.66)/.24*.22:.97+(p-.9)/.1*.029;
  const map=(a,p)=>{switch(a){case 'tongue':return['tongue',tg(p)];case 'stuck':return p<.7?['tongue',.72]:['idle',p];
    case 'sweep':return p<.52?['tongue',p/.52*.55]:p<.7?['tongue',.72]:p<.85?['tongue',.75+(p-.7)/.15*.22]:['idle',p];
    case 'drum':case 'rain':return['bubbles',Math.min(.999,p*1.1)];case 'taunt':return['idle',p];
    default:return[OM.an.includes(a)?a:'idle',p]}};
  N3.toad2=(x,y,f,a,p,sc,o)=>{o=Object.assign({},o||{});sc=(sc||1)*(o.p2?1.12:1);
    if(a==='enter'){if(p<.3)return;if(p<.45){const u=(p-.3)/.15;o.z=360*(1-u*u);og(x,y,f,'flop',.6,sc,o);return}
      og(x,y,f,p<.62?'flop':'idle',p<.62?.8+(p-.45)/.17*.199:p,sc,{p2:o.p2});return}
    if(a==='die'){if(p>.93)return;const s=p<.5?1+.45*Math.sin(p/.5*Math.PI/2):p<.85?1.45-(p-.5)/.35*1.29:.16;og(x,y,f,'hit',(p*2)%1,sc*s,{p2:o.p2&&p<.5});return}
    if(a==='rage'){og(x,y,f,'hit',(p*3)%1,sc*(1+.12*Math.min(1,Math.max(0,(p-.45)/.17))),{p2:p>.5});return}
    const[m,q]=map(a,p);og(x,y,f,m,Math.min(.999,Math.max(0,q)),sc,o)};
  N3.meta.toad2={n:'Re Rospo',g:'boss',sc:1,an:['idle','walk','hit','tongue','stuck','sweep','flop','bubbles','drum','rain','rage','taunt','enter','die'],
    dur:{idle:3.2,walk:1,hit:.6,tongue:1.6,stuck:1.1,sweep:1.6,flop:2,bubbles:1.8,drum:2.6,rain:2.4,rage:3,taunt:1.2,enter:3.4,die:4},lab:{}};
  N3.order.push('toad2')})();
