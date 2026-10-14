// ---------- LA MAPPA della modalità zombie (pianta approvata da Denis il 12 ottobre, anteprime/zombie/pianta.py): a sud l'area di partenza
// «Camposanto e Casa» (12×12 caselle: l'anteprima di prima con due caselle in più a nord e due a est), a nord oltre il cancello a pagamento la
// «Fattoria dei Corvi» (16×12), e sopra la fattoria due caselle di granturco che continua oltre il bordo. Coordinate: X(), Y() dalla pianta (in
// caselle), AX(), AY() dall'anteprima di prima (area_prova.js). Si parte con 500 monete, ogni zombie ne dà 60; il cancello costa 750 (si tiene
// premuto il bottone), il Revolver a muro dietro la casa 500, la Pompa da caccia sul fienile 1.500, la Bara delle Sorprese 750.
(()=>{const{T,P,G,prop,solid,holes,perches,bakeGround,boot,W,rr,srand}=ZM;
const X=v=>v*T,Y=v=>(v+2)*T,AX=v=>(v+2)*T,AY=v=>(v+16)*T;
// le cose che una partita cambia e che una partita nuova rimette com'erano: l'eroe alla partenza, gli zombie fermi nell'aia, il velo sulla fattoria
const HERO0=()=>({x:AX(4.4),y:AY(8.4),face:-Math.PI/2,walk:0,moving:false,aim:0,fireCd:0}),IDLE=[['zombie',6.0,8.6],['lanterna',9.3,5.3],['strisciante',8.9,8.7]],
  veil=()=>({y:Y(12.3),k:1,wisps:Array.from({length:8},(_,i)=>({x:rr(0,16*T),y:rr(Y(1),Y(11.4)),r:rr(110,190),v:rr(5,11)}))});
const AREA={title:'Camposanto',zoneName:h=>h.y<Y(12.3)?'Fattoria dei Corvi':'Camposanto',
  // una partita nuova (ZM.ctl.nuova): 500 monete, la fattoria chiusa col cancello e il velo, gli zombie dell'aia, la Bara al cimitero, l'eroe alla partenza
  reset(){W.coins=500;W.zoneOpen={1:true,2:false};W.gate.open=false;if(AREA.gate)AREA.gate.close();W.split=veil();for(const[k,x,y] of IDLE)ZM.idleZombie(k,X(x),Y(y),2);ZM.boxReset();W.hero=HERO0()},
  build(){const w=16*T,h=29*T;srand(11);W.coins=500;W.maxZ=6;W.zoneOpen={1:true,2:false};// sotto l'area di partenza tre caselle di nebbia (non ci si va)
    // ================================================================ AREA 1: Camposanto e Casa (l'anteprima di prima, spostata)
    P.wall(AX(0),AY(.35),AX(3.7)+6,AY(.35),true);P.wall(AX(0),AY(7.3),AX(3.7)+6,AY(7.3),true);P.wall(AX(3.7),AY(.35)+7.5,AX(3.7),AY(4.95)-15,true);P.wall(AX(3.7),AY(6.05)+15,AX(3.7),AY(7.3)-7.5,true);
    P.pillar(AX(3.7),AY(4.95),2);P.pillar(AX(3.7),AY(6.05),0);P.gateLeaf(AX(3.7),AY(4.95),30,-2.1);P.gateLeaf(AX(3.7),AY(6.05),30,2.2);
    P.crypt(AX(.12),AY(1),1.9*T,1.35*T);
    // (anteprima 48) la cancellata a ovest del cimitero, sul bordo della mappa: un pezzo è crollato e restano solo sbarre di ferro ribattute
    // (barriere.js); di là, dal buio oltre il bordo, escono gli zombie e le strappano
    P.wall(AX(0),AY(.35)+6,AX(0),AY(3.9)-20,true);P.wall(AX(0),AY(3.9)+20,AX(0),AY(7.3)-6,true);
    P.barricade(AX(0),AY(3.9)-20,AX(0),AY(3.9)+20,{kind:'ferro',out:[-1,0],n0:2,th:12,reach:42,hop:16,zfx:28});holes.push([AX(0)-34,AY(3.9),1,'fuori']);
    for(const[x,y,k,o] of[[2.9,1.4,1],[1,3.2,0,{wreath:1}],[1.9,3.3,2],[2.85,3.25,3],[.95,5,1,{lean:.12}],[2.9,5.1,0,{candle:1}],[1,6.5,2,{lean:-.15}],[2.85,6.55,0]])P.grave(AX(x),AY(y),k,o);
    // l'albero un po' più a ovest che nell'anteprima: tra l'albero e il muro ora passano gli zombie (prima 30 px)
    P.openGrave(AX(1.6),AY(4.95));P.tree(AX(2.8),AY(2.25),true,1.05);P.sign(AX(5.12),AY(5.38),'Cimitero','Casa');
    ZM.group([AX(5.5),AY(1),AX(9.2),AY(3.5)],()=>{P.house(AX(5.5),AY(1),3.7*T,2.5*T,{wall:'siding',roof:'shingle',boards:[1]});
      P.fence(AX(5.2),AY(4.25),AX(6.65),AY(4.25));P.fence(AX(8.05),AY(4.25),AX(9.85),AY(4.25));P.fence(AX(9.85),AY(.9),AX(9.85),AY(4.25));
      P.pumpkin(AX(6.85),AY(4.05),1,true);P.pumpkin(AX(7.85),AY(4.1),1.2,true)});P.pumpkin(AX(9.6),AY(4.42),.9,false);
    P.lamp(AX(3.95),AY(4.45));P.lamp(AX(5.35),AY(8.6));P.well(AX(8.4),AY(6.2));P.barrow(AX(6.3),AY(5.75));
    P.crate(AX(8.95),AY(4.7));P.crate(AX(9.32),AY(4.74),.8);P.barrel(AX(9.5),AY(5.25));P.rock(AX(6.3),AY(7.45),11);P.bush(AX(5.55),AY(7.95),1);P.hay(AX(6.75),AY(6.95));
    P.tree(AX(8.9),AY(8.6),false,1.05);P.tree(AX(.7),AY(9.1),false,.85);
    holes.push([AX(8.1),AY(7.9),1],[AX(2.3),AY(9.2),1]);
    perches.push({x:AX(2),y:AY(7.3),z:52,t:0},{x:AX(2.85),y:AY(3.25),z:58,t:2});
    // novità dell'area di partenza: il confine con la cancellata e il cancello della fattoria, dietro la cripta l'albero morto e una fossa nuova,
    // dietro la casa la catasta col ceppo e lo stendibiancheria e il Revolver col gesso; a est la latrina, la lanterna sul palo, una buca, la
    // quercia morta e la legna; il cespuglio spostato dalla strada nuova
    P.wall(X(2),Y(12.3),X(5.7)-15,Y(12.3),true);P.wall(X(7.2)+15,Y(12.3),X(14),Y(12.3),true);
    const gate=AREA.gate=P.farmGate(X(5.7),X(7.2),Y(12.3),750,'Fattoria dei Corvi');
    P.tree(X(2.75),Y(12.95),true,.95);P.openGrave(X(3.75),Y(13.4));
    P.woodpile(X(8.0),Y(13.05),X(9.25)-X(8.0),Y(13.55)-Y(13.05),20);P.chopBlock(X(9.6),Y(13.35));P.clothesline(X(10.05),X(11.75),Y(13.6));
    P.bush(X(7.28),Y(14.35),1);
    const oh=P.outhouse(X(12.6),Y(14.55));holes.push([X(12.6)+20,Y(14.55)+64,1,'porta',()=>oh.bang()]);
    P.lanternPole(X(12.85),Y(17.4),-1);holes.push([X(13.05),Y(20.0),1]);P.tree(X(13.1),Y(22.4),true,1.15);P.woodpile(X(12.3),Y(18.7),X(12.9)-X(12.3),Y(19.15)-Y(18.7),16);
    // il Revolver col gesso sul muro nord della casa (si vede da nord); si compra stando lì dietro
    const face=(name,tagW,key,test)=>{for(const p of ZM.props){if(p.name!==name)continue;for(const t of p.parts)if(t.part===tagW&&t.k==='face'&&t.key===key&&(!test||test(t)))return t}return null};
    const nWall=face('house','wN','n');ZM.group([AX(5.5),AY(1),AX(9.2),AY(3.5)],()=>P.wallGun(X(9.6),Y(15)-.6,22,'x','revolver',500,nWall));// si piega con la casa
    // ================================================================ AREA 2: la Fattoria dei Corvi
    // il granturco: file da nord a sud fino al margine (y 3,25), oltre il bordo della mappa; non si attraversa; si apre intorno al poggio del
    // mulino e ai pali degli spaventapasseri
    const rows=[];for(let k=0,yy=-1.82;yy<3.12;k++,yy+=.53)rows.push(yy);
    const skip=(x,y)=>Math.hypot(x-X(14.4),(y-Y(1.6))*1.2)<1.45*T||Math.hypot(x-X(4.4),y-Y(1.7))<.42*T||Math.hypot(x-X(11.3),y-Y(1.5))<.42*T;
    rows.forEach((ry,k)=>{for(let s=0;s<4;s++)P.cornRow(X(s*4)+(s?0:6),X(s*4+4)-(s===3?6:0),Y(ry),k*31+s*7+3,skip)});
    solid(0,0,w,Y(3.2),'corn');
    P.scarecrowPole(X(4.4),Y(1.7));P.scarecrowPole(X(11.3),Y(1.5));P.windmill(X(14.4),Y(1.6));
    // la staccionata tra il campo e l'aia, rotta dove escono gli zombie (tre varchi coi paletti a terra)
    // (anteprima 48: i tre varchi sono barriere, barriere.js: due assi vecchie inchiodate di traverso che gli zombie strappano per entrare
    // nell'aia e che l'eroe rimette; il varco di mezzo stretto come gli altri)
    for(const[a,b] of[[.15,2.25],[2.95,7.6],[8.4,12.05],[12.75,15.85]])P.fence(X(a),Y(3.55),X(b),Y(3.55));
    for(const[a,b] of[[2.25,2.95],[7.6,8.4],[12.05,12.75]])P.barricade(X(a),Y(3.55),X(b),Y(3.55),{kind:'legno',out:[0,-1],n0:2,reach:42});
    P.fallenPickets(X(2.6),Y(3.66),3);P.fallenPickets(X(8.0),Y(3.72),2);P.fallenPickets(X(12.4),Y(3.66),3);
    holes.push([X(2.6),Y(3.05),2,'mais'],[X(8.0),Y(3.0),2,'mais'],[X(12.4),Y(3.05),2,'mais']);
    // la casa colonica: la casa dell'anteprima girata di un quarto (porta e portico a est, sull'aia), di pietra col tetto di coppi e le
    // finestre inchiodate; si entra e il tetto sparisce
    {const cx=X(2.32),cy=Y(5.95),wl=X(7.6)-X(4.3),dl=X(4.0)-X(.5);ZM.turn(cx,cy,1,()=>P.house(cx-wl/2,cy-dl/2,wl,dl,{wall:'stoneW',roof:'tile',boards:[0,1,2]}))}
    P.pump(X(5.15),Y(7.5));P.trough(X(5.15)+13,Y(7.36),44,18);P.well(X(7.8),Y(6.6));
    P.hay(X(10.0)-17,Y(4.6)-11);P.hay(X(10.0)-17,Y(7.7)-11);P.barrel(X(4.95),Y(4.65));P.barrel(X(5.25),Y(4.5),.85);P.crate(X(10.05),Y(5.35));
    for(const[k,x,y] of IDLE)ZM.idleZombie(k,X(x),Y(y),2);
    // il fienile rosso col portone sull'aia; la Pompa da caccia col gesso sul muro ovest, a sud del portone
    const barn=P.barn(X(11.0),Y(4.12),X(15.4)-X(11.0),Y(8.32)-Y(4.12));// (36 px dalla staccionata: niente corridoi tra 18 e 34 px)
    const wWall=face('barn','wW','w',t=>Math.min(...t.c.map(q=>q[1]))>Y(6.5));ZM.group([X(11.0),Y(4.12),X(15.4),Y(8.32)],()=>P.wallGun(X(11.0)-.6,Y(7.45),22,'y','pompa',1500,wWall));
    perches.push({x:X(13.2),y:Y(5.0),z:155,t:0},{x:X(13.2),y:Y(7.5),z:155,t:1.4});
    // la rimessa con la mola, l'orto delle zucche coi sacchi del Becchino e la terra smossa, il recinto dei maiali col fango, la cuccia, il pollaio
    P.shed(X(13.4),Y(8.9),X(15.4)-X(13.4),Y(10.8)-Y(8.9));
    for(const[x,y,s,c] of[[10.8,9.3,1,1],[11.5,11.2,1.1,0],[12.6,10.4,.9,1],[12.9,11.4,1.2,0],[10.7,10.6,.8,0],[11.9,9.4,.85,0],[12.2,11.45,.7,1]])P.pumpkin(X(x),Y(y),s,!!c,!c&&s<.9);
    P.sack(X(12.7),Y(9.2),1,true);P.sack(X(13.02),Y(9.42),.9,true);holes.push([X(11.6),Y(10.45),2,'orto']);
    P.fence(X(.7),Y(8.4),X(3.7),Y(8.4));P.fence(X(.7),Y(10.6),X(3.7),Y(10.6));P.fence(X(.7),Y(8.4),X(.7),Y(10.6),{noStart:1});
    P.fence(X(3.7),Y(8.4),X(3.7),Y(9.2),{noStart:1,endPost:1});P.fence(X(3.7),Y(9.8),X(3.7),Y(10.6));
    P.trough(X(2.75),Y(8.62),34,13);holes.push([X(2.2),Y(9.6),2,'fango']);
    P.kennel(X(4.35),Y(10.15),[X(5.3),Y(9.95)]);P.coop(X(.6),Y(10.74),X(2.1)-X(.6),Y(11.68)-Y(10.74));
    // la tettoia col carretto del Becchino (accanto, uno dei posti della Bara), la lanterna sul palo lungo la strada, i confini della fattoria
    P.shelter(X(7.6),Y(10.1),X(10.0)-X(7.6),Y(11.5)-Y(10.1));P.cart(X(7.75),Y(10.42));
    P.lanternPole(X(5.5),Y(11.35),1);
    P.fence(X(0),Y(11.95),X(2),Y(11.95));P.fence(X(14),Y(11.95),X(16),Y(11.95));
    // ================================================================ il gioco: il cancello, le armi a muro, la Bara, il velo sulla fattoria
    W.gate={x:X(6.45),y:Y(12.3),open:false,lure:4.2*T,slots:[[X(6.45)-20,Y(12.3)-21],[X(6.45)+3,Y(12.3)-19],[X(6.45)+22,Y(12.3)-22],[X(6.45)-40,Y(12.3)-30],[X(6.45)+40,Y(12.3)-29]]};
    W.split=veil();
    ZM.buyable({id:'cancello',x:X(6.45),y:Y(12.3)+28,r:74,show:()=>!gate.state.open,label:()=>'Cancello della Fattoria',price:()=>750,
      act(){if(W.coins<750)return false;W.coins-=750;gate.open();W.zoneOpen[2]=true;W.gate.open=true;if(W.split)W.split.fade=true;ZM.navRebuild();W.toast=['La Fattoria dei Corvi è aperta',2.6];return true}});
    for(const[id,pr,hx,hy,zone] of[['revolver',500,X(9.6),Y(15)-24,1],['pompa',1500,X(11.0)-26,Y(7.45),2]])
      ZM.buyable({id:'muro_'+id,x:hx,y:hy,r:56,show:()=>W.zoneOpen[zone],label:()=>(W.gunId===id?'Colpi: ':'')+(window.ARMI?ARMI.DATI[id].n:id),price:()=>W.gunId===id?Math.round(pr/2):pr,
        act(){const p=W.gunId===id?Math.round(pr/2):pr;if(W.coins<p)return false;W.coins-=p;
          // (anteprima 48, punto 21) la stessa arma: solo i colpi, l'arma resta quella che hai (anche forgiata); un soffio di gesso e il suono dell'arma
          if(W.gunId===id){const g=ZM.gun();g.mag=g.D.mag;g.res=Math.max(g.res,g.D.res*((g.pap||0)+1));if(g.st==='ricarica'&&g.annulla)g.annulla();W.toast=['Colpi: '+(g.nome||g.D.n),1.8]}else ZM.equip(id);
          if(ZM.barriere)ZM.barriere.burst('gesso',hx,hy,26,8,[0,0],24);try{if(window.ARMI&&ARMI.suono)ARMI.suono(id,'ricarica',180);if(AU.ctx&&AU.on.sfx)coinClink(AU.ctx.currentTime+.01,.8)}catch(e){}return true}});
    // la Bara delle Sorprese e i suoi tre posti [x, y, zona, verso della testa]: nel cimitero vicino alla cripta (girata un po', il teschio verso
    // sud), sotto la tettoia accanto al carretto, dentro il fienile nell'angolo a nord-ovest (non nella stalla: lì restava un corridoio di 23 px)
    ZM.sorpresa(X(4.45),Y(16.76),[[X(4.45),Y(16.76),1,.3],[X(9.55),Y(10.85),2,0],[X(12.2),Y(5.0),2,0]]);
    // la partita a ondate (partita.js): la Lanterna delle Anime nell'area di partenza, a ovest del sentiero dove si comincia, tra il muretto
    // del cimitero e la buca
    const anime=P.soulLantern(AX(2.55),AY(8.25),1500);ZM.partita({lanterna:anime});
    // le due Macchine della Fortuna (fortuna.js): una a est della partenza, una nell'aia della fattoria appena oltre il cancello (posti larghi:
    // niente corridoi stretti intorno)
    P.fortuneMachine(X(9.2),Y(22.7),0);P.fortuneMachine(X(7.35),Y(8.3),1);
    // (anteprima 48) la Credenza degli Elisir a est della casa, tra la latrina e la lanterna; la Forgia delle Anime e la valvola della caldaia per ora
    // nell'area di partenza, a sud-est (con le zone nuove andranno nel borgo e nella segheria)
    P.elisir(X(13.0),Y(16.0));ZM.turn(X(13.2),Y(23.0),3,()=>P.forgia(X(13.2),Y(23.0)));ZM.turn(X(12.9),Y(21.2),3,()=>P.valvola(X(12.9),Y(21.2)));
    // i bordi del mondo e la nebbia ai lati dell'area di partenza
    solid(-200,-200,w+400,200,'edge');solid(-200,h,w+400,200,'edge');solid(-200,0,200,h,'edge');solid(w,0,200,h,'edge');
    solid(0,Y(12.3)+6,X(2),h-Y(12.3)-6,'edge');solid(X(14),Y(12.3)+6,X(2),h-Y(12.3)-6,'edge');solid(X(2),Y(24),X(12),h-Y(24),'edge');
    W.hero=HERO0();
    // ================================================================ il terreno
    const onPath=(x,y)=>{const ax=x/T-2,ay=y/T-16;return(ax>3.85&&ax<4.95&&ay>4.2&&ay<10)||(ay>5.05&&ay<6&&ax>3.6&&ax<5)||(ay>4.2&&ay<5.15&&ax>3.85&&ax<7.75)||(ax>6.95&&ax<7.75&&ay>3.4&&ay<5)||(x>X(5.95)&&x<X(6.95)&&y>Y(12.35)&&y<Y(18.3))};
    const nz=(x,y)=>Math.sin(x*.05+y*.031)*7+Math.sin(y*.07-x*.02)*5;
    const inYard=(x,y)=>{const e=nz(x,y),a=x>X(4.7)+e&&x<X(10.8)+e&&y>Y(3.9)+e&&y<Y(9.8)+e,r=x>X(5.9)+e*.4&&x<X(7.0)+e*.4&&y>Y(9.6)&&y<Y(12.3),
      p=x>X(3.95)&&x<X(4.9)+e&&y>Y(5.4)&&y<Y(6.6);if(a||r||p)return 1;const e2=e+9;return(x>X(4.7)+e-9&&x<X(10.8)+e2&&y>Y(3.9)+e-9&&y<Y(9.8)+e2)||(x>X(5.9)-9&&x<X(7.0)+9&&y>Y(9.6)&&y<Y(12.3))?2:0};
    bakeGround(w,h,function*(){yield* G.grass$(w,h);G.cornSoil(0,0,w,Y(3.3),rows.map(Y));yield;
      G.yard(w,h,inYard,[[[X(6.45),Y(12.3),1,0],[X(6.45),Y(10.4),1,0],[X(7.1),Y(8.9),.9,.4],[X(8.6),Y(7.3),.5,.85],[X(10.6),Y(6.2),.2,1]]]);
      yield;G.furrows(X(10.4),Y(8.9),X(13.2),Y(11.7));G.mud(X(.85),Y(8.55),X(3.55),Y(10.45));yield;
      {const x0=X(11.0),y0=Y(4.12),bw=X(15.4)-x0,bd=Y(8.32)-y0;ctx.fillStyle='#3a2f22';ctx.fillRect(x0,y0,bw,bd);const Q=[new Path2D(),new Path2D()];for(let i=0;i<bw*bd/40;i++){const x=rr(x0,x0+bw),y=rr(y0,y0+bd),p=Q[rr(0,1)<.6?0:1],a=rr(0,6.3);p.moveTo(x,y);p.lineTo(x+Math.cos(a)*4,y+Math.sin(a)*4)}ctx.lineWidth=.9;ctx.strokeStyle='rgba(200,170,90,.5)';ctx.stroke(Q[0]);ctx.strokeStyle='rgba(140,110,50,.5)';ctx.stroke(Q[1])}
      yield;G.floorPlanks(X(2.32)-112,Y(5.95)-105.6,224,211.2);yield;
      G.soil(AX(0),AY(.35),3.7*T,6.95*T);yield;yield* G.cobbles$(w,h,onPath);yield;
      yield* G.tufts$(w,h,(x,y)=>y<Y(3.3)||inYard(x,y)===1||onPath(x,y)||(x>X(10.4)&&x<X(13.2)&&y>Y(8.9)&&y<Y(11.7))||(x>X(.7)&&x<X(3.7)&&y>Y(8.4)&&y<Y(10.6))||(x>X(11)&&x<X(15.4)&&y>Y(4.12)&&y<Y(8.32))||(x>X(2.32)-112&&x<X(2.32)+112&&y>Y(4.3)&&y<Y(7.6))||(x<AX(3.7)&&x>AX(0)&&y>AY(.35)&&y<AY(7.3)&&((x*7+y*13)%10)<7));
      yield;G.voidFog(0,Y(12.3)+4,X(2),h,-1);yield;G.voidFog(X(14),Y(12.3)+4,w,h,1);yield;G.voidFogV(0,Y(24)-10,w,h);yield;
      ZM.edgeSnap();yield;
      G.leaves(AX(8.9),AY(8.6),90,120);G.twigs(AX(2.8),AY(2.25),50,40);G.twigs(X(2.75),Y(12.95),40,30);G.twigs(X(13.1),Y(22.4),50,40);yield;
      G.floorPlanks(AX(5.5),AY(1),3.7*T,2.5*T);G.holes();yield;
      for(const[x,y,r] of[[AX(4.4),AY(7.6),14],[AX(5.6),AY(4.7),11],[AX(4.3),AY(5.5),9],[X(6.6),Y(10.9),12],[X(8.4),Y(8.2),10],[X(2.0),Y(9.9),13],[X(1.4),Y(9.1),9]])G.puddle(x,y,r);
      yield;G.feathers(X(2.5),Y(11.2),40,40);G.chips(X(9.6),Y(13.35),26,30);
      // la terra smossa dell'orto da cui escono, e quella sotto la Bara
      for(const[x,y] of[[X(11.6),Y(10.45)],[X(4.45),Y(16.76)]]){ctx.fillStyle='rgba(30,22,14,.75)';ctx.beginPath();ctx.ellipse(x,y,26,15,0,0,6.3);ctx.fill();for(let i=0;i<14;i++){ctx.fillStyle=i%2?'#5a4630':'#3a2c1e';ctx.beginPath();ctx.ellipse(x+rr(-24,24),y+rr(-13,13),rr(2,4),rr(1.4,2.6),rr(0,3),0,6.3);ctx.fill()}}});
    ZM.props.sort((a,b)=>a.ky-b.ky)},
  update(dt){for(const f of ZM.anim||[])f(dt)}};
ZM.AREE.mappa=AREA})();// la costruisce il gioco col menu (src/js/63-zombie.js) o la pagina di prova (anteprime/zombie/mk.py area_mappa)
