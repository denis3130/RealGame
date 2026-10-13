// =====================================================================
// TWO MENUS (punti 42-44 del piano di Denis): the Classic menu and the Zombie menu are two different places. On the home a swipe sideways
// in the middle of the screen, or a tap on the little zombie hand peeking at the top right (on the Zombie side: the moss sprout at the top
// left), changes the mode with a short scene: the other world sweeps across the screen, the hero sits down by the fire (or stands up and
// goes back to the rune stone), the music changes. A tap during the change ends it at once; a second swipe waits for the first to end.
// The choice stays (SAVE.modo). The Zombie menu has its own look (#menu.zmode: night, rust, cold green) and its own scene (src/js/66-falo.js).
// =====================================================================
const MM={tr:null,sw:null,eatNext:false,DUR:1.5};
const mez=k=>k<.5?2*k*k:1-Math.pow(2-2*k,2)/2;
// ------------------------------------------------------------------ the look of the Zombie menu and of the two corner signs
{const st=document.createElement('style');st.textContent=`
#zHand,#cSprout{position:absolute;z-index:6;width:34px;height:40px;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
#zHand{right:68px;top:-4px;transform-origin:50% 0}
#cSprout{left:66px;top:0;transform-origin:50% 100%}
#zHand svg,#cSprout svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
#zHand .fg{transform-origin:50% 20%;animation:zhCurl 2.8s ease-in-out infinite}
#zHand{animation:zhPeek 7s ease-in-out infinite}
#cSprout{animation:csSway 3.2s ease-in-out infinite alternate}
#zHand .nw{position:absolute;right:-6px;bottom:-14px;padding:1px 5px 2px;border:2px solid var(--crInk);border-radius:7px;background:linear-gradient(#b4f57a,#4cb328);font:400 9px var(--display);color:#fff;text-shadow:var(--tol-s);white-space:nowrap}
@keyframes zhPeek{0%,12%{transform:translateY(-16px)}22%,70%{transform:translateY(0)}74%{transform:translateY(-3px) rotate(-4deg)}78%{transform:translateY(0) rotate(3deg)}88%,100%{transform:translateY(-16px)}}
@keyframes zhCurl{0%,100%{transform:rotate(0)}40%{transform:rotate(9deg)}55%{transform:rotate(-6deg)}}
@keyframes csSway{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}
@media (prefers-reduced-motion:reduce){#zHand,#zHand .fg,#cSprout{animation:none}}
#menu.mswap .sideBtns,#menu.mswap .homeFoot,#menu.mswap #chapCard,#menu.mswap .playRow{opacity:0;transform:translateY(6px)}
#menu .sideBtns,#menu .homeFoot,#menu #chapCard,#menu .playRow{transition:opacity .22s ease,transform .22s ease}
/* --- the Zombie menu: night, rust and cold green (no moss, no bone) --- */
#menu.zmode{--crInk:#0a0c0b}
#menu.zmode #topbar::after{filter:hue-rotate(-60deg) saturate(.35) brightness(.55)}
#menu.zmode #tabs::before{filter:grayscale(.6) brightness(.45) sepia(.5) hue-rotate(-30deg)}
#menu.zmode.home #topbar{background:linear-gradient(rgba(6,9,9,.9),rgba(6,9,9,.3))}
#menu.zmode #tabs,#menu.zmode.home #tabs{background:linear-gradient(#2c302c,#151816);box-shadow:inset 0 2px 0 rgba(160,190,170,.12)}
#menu.zmode #tabs button{background:linear-gradient(#323733,#1d211e);color:#a9b5ab;border-left-color:rgba(0,0,0,.6)}
#menu.zmode #tabs button.on,#menu.zmode.home #tabs button.on{color:#c4f08e;background:linear-gradient(#5a5f4e,#3a3d33 55%,#2a2c25);box-shadow:inset 0 3px 0 rgba(200,230,160,.25),0 -3px 12px rgba(0,0,0,.5)}
#menu.zmode .res{background:linear-gradient(#0e100f,#202421);border-color:#0a0c0b}
#menu.zmode .qbtn{background:linear-gradient(#3a3d36,#22251f);border-color:#0a0c0b;box-shadow:inset 0 2px 0 rgba(200,230,180,.12),0 3px 0 #0a0c0b;clip-path:polygon(0 4%,8% 0,92% 2%,100% 8%,98% 92%,90% 100%,6% 97%,0 90%)}
#menu.zmode .qbtn small{color:#d8e2c8}
#menu.zmode .qbtn.hot{background:linear-gradient(#5c6a2c,#2e3618)}
#menu.zmode .heroPill{background:linear-gradient(#2b2f2a,#161916);border-color:#0a0c0b}
#menu.zmode .heroPill i{background:linear-gradient(#8fd45e,#3f7a26);color:#fff}
#menu.zmode .enter{background:linear-gradient(#b5e46a 0%,#5e9a2c 46%,#3f7a1c 54%,#4c8a24 100%);color:#0a0c0b;border-color:#0a0c0b;box-shadow:inset 0 3px 0 rgba(255,255,255,.35),0 6px 0 #0a0c0b,0 0 22px rgba(130,220,90,.25)}
#menu.zmode .playRow .modeBtn{display:none}
#menu.zmode .playRow .enter{flex:1}
#menu.zmode .chapCard .candle{display:none}
/* --- the Zombie menu's own pieces: a torn edge with dried blood under the top bar, barbed wire on the tab bar, metal plates with rivets for
   the side buttons (a cold green glow when something waits), a rusty green Gioca with claw marks --- */
#menu.zmode #topbar::after{filter:none;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%2014%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20d%3D%22M0%200h120v4l-4%203-3-2-5%204-4-3-6%202-3-3-5%204-4-2-5%203-6-4-3%202-5-1-4%203-6-2-3%203-5-4-4%202-6-1-3%203-4-3-6%202-4-3-5%204-3-2-6%201-4-3-3%203H0z%22%20fill%3D%22%230b0e0c%22%2F%3E%3Cpath%20d%3D%22M23%206v5M71%207v6M98%206v3%22%20stroke%3D%22%234a1813%22%20stroke-width%3D%221.6%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E") center/100% 100% no-repeat;height:12px;bottom:-11px}
#menu.zmode #tabs::before{filter:none;top:-9px;height:16px;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2016%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20d%3D%22M0%208c10-5%2010%205%2020%200s10%205%2020%200%2010%205%2020%200%2010%205%2020%200%22%20fill%3D%22none%22%20stroke%3D%22%230a0c0b%22%20stroke-width%3D%223.2%22%2F%3E%3Cpath%20d%3D%22M0%208c10%205%2010-5%2020%200s10-5%2020%200%2010-5%2020%200%2010-5%2020%200%22%20fill%3D%22none%22%20stroke%3D%22%230a0c0b%22%20stroke-width%3D%223.2%22%2F%3E%3Cpath%20d%3D%22M0%208c10-5%2010%205%2020%200s10%205%2020%200%2010%205%2020%200%2010%205%2020%200%22%20fill%3D%22none%22%20stroke%3D%22%236f6a5e%22%20stroke-width%3D%221.3%22%2F%3E%3Cpath%20d%3D%22M0%208c10%205%2010-5%2020%200s10-5%2020%200%2010-5%2020%200%2010-5%2020%200%22%20fill%3D%22none%22%20stroke%3D%22%238a8275%22%20stroke-width%3D%221.3%22%2F%3E%3Cpath%20d%3D%22M17%203l6%2010M23%203l-6%2010M57%203l6%2010M63%203l-6%2010%22%20stroke%3D%22%230a0c0b%22%20stroke-width%3D%222.6%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M17%203l6%2010M23%203l-6%2010M57%203l6%2010M63%203l-6%2010%22%20stroke%3D%22%239a9283%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E") 0 0/80px 100% repeat-x}
#menu.zmode #tabs button{background:linear-gradient(#323733,#1d211e)!important}
#menu.zmode #tabs button.on{background:radial-gradient(60% 50% at 50% 35%,rgba(150,255,110,.22),transparent 70%),linear-gradient(#4a5045,#2e322b 55%,#22251f)!important}
#menu.zmode #tabPlay .sideBtns .qbtn{border-radius:7px!important;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2040%22%3E%3Cg%20fill%3D%22%231a1d1a%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%225%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%225%22%20cy%3D%2235%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%2235%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%22%239aa39a%22%3E%3Ccircle%20cx%3D%224.4%22%20cy%3D%224.4%22%20r%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%2234.4%22%20cy%3D%224.4%22%20r%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%224.4%22%20cy%3D%2234.4%22%20r%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%2234.4%22%20cy%3D%2234.4%22%20r%3D%22.8%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M27%2030c3-2%207-1%209%202v6h-8c-2-2-3-5-1-8zM2%2014c2%201%203%204%202%207l-2%201z%22%20fill%3D%22rgba%28122%2C62%2C30%2C.45%29%22%2F%3E%3C%2Fsvg%3E") center/100% 100% no-repeat,radial-gradient(60% 45% at 40% 25%,rgba(200,230,200,.16),transparent 70%),linear-gradient(#4b524b,#2a2f2a 70%,#22261f)!important;
  box-shadow:inset 0 2px 0 rgba(220,240,220,.16),inset 0 -3px 0 rgba(0,0,0,.4),0 3px 0 #0a0c0b!important}
#menu.zmode #tabPlay .sideBtns .qbtn:nth-child(odd){transform:rotate(-2.5deg)}#menu.zmode #tabPlay .sideBtns .qbtn:nth-child(even){transform:rotate(2deg)}
#menu.zmode #tabPlay .sideBtns .qbtn::before{display:none}
#menu.zmode #tabPlay .sideBtns .qbtn.hot{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2040%22%3E%3Cg%20fill%3D%22%231a1d1a%22%3E%3Ccircle%20cx%3D%225%22%20cy%3D%225%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%225%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%225%22%20cy%3D%2235%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%2235%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%22%239aa39a%22%3E%3Ccircle%20cx%3D%224.4%22%20cy%3D%224.4%22%20r%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%2234.4%22%20cy%3D%224.4%22%20r%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%224.4%22%20cy%3D%2234.4%22%20r%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%2234.4%22%20cy%3D%2234.4%22%20r%3D%22.8%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M27%2030c3-2%207-1%209%202v6h-8c-2-2-3-5-1-8zM2%2014c2%201%203%204%202%207l-2%201z%22%20fill%3D%22rgba%28122%2C62%2C30%2C.45%29%22%2F%3E%3C%2Fsvg%3E") center/100% 100% no-repeat,radial-gradient(60% 55% at 50% 45%,rgba(170,240,100,.85),rgba(80,140,40,.85) 60%,#24361a)!important;box-shadow:inset 0 3px 0 rgba(255,255,255,.3),0 3px 0 #0a0c0b,0 0 16px rgba(150,240,90,.55)!important}
#menu.zmode .playRow{grid-template-columns:minmax(0,1fr)}
#menu.zmode #tabPlay .enter{background:linear-gradient(#a8d862 0%,#5f9a30 46%,#40731f 54%,#4f8a27 100%)!important;color:#0c120b!important;text-shadow:0 1px 0 rgba(230,255,200,.45)!important;letter-spacing:.04em}
#menu.zmode #tabPlay .enter::before{left:auto;right:16px;top:4px;width:40px;height:30px;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2030%22%3E%3Cpath%20d%3D%22M8%202l14%2026M16%201l13%2024M24%202l11%2020%22%20fill%3D%22none%22%20stroke%3D%22rgba%2810%2C12%2C10%2C.55%29%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M8%202l14%2026M16%201l13%2024M24%202l11%2020%22%20fill%3D%22none%22%20stroke%3D%22rgba%28230%2C255%2C200%2C.35%29%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22round%22%20transform%3D%22translate%28-.8%20-.6%29%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat}
#menu.zmode .heroPill{background:linear-gradient(#383d37,#1e221d)!important}

/* --- the Classic menu without the skeleton (punto 42): a moss leaf before the pages' titles, golden sprigs on the Armeria's corners, side
   buttons as teal tiles with a golden rim instead of tombstones; in the Zombie menu a zombie hand before the titles and no sprigs --- */
.pageHead h2::before{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%2022c0-6-1-10%201-15%22%20fill%3D%22none%22%20stroke%3D%22%231b1612%22%20stroke-width%3D%223.6%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M12%2022c0-6-1-10%201-15%22%20fill%3D%22none%22%20stroke%3D%22%237bbf4a%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M12.5%2010C7%2010%203%206.5%202.5%202c5.5-.5%2010%202.5%2010%208z%22%20fill%3D%22%237bbf4a%22%20stroke%3D%22%231b1612%22%20stroke-width%3D%221.6%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M13%209c4-.5%207.5-4%208.5-8-5.5-.5-8.5%203.5-8.5%208z%22%20fill%3D%22%239fe06a%22%20stroke%3D%22%231b1612%22%20stroke-width%3D%221.6%22%20stroke-linejoin%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2219%22%20cy%3D%223%22%20r%3D%221%22%20fill%3D%22%23fff6a8%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat!important}
#menu.zmode .pageHead h2::before{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M6%2023v-6c-2-2-2-6%200-8l1%204V3c0-1.5%202-1.5%202%200v7-8c0-1.5%202-1.5%202%200v8-7c0-1.5%202-1.5%202%200v8-5c0-1.5%202-1.5%202%200v9c0%203-1%205-3%206v4z%22%20fill%3D%22%238aa676%22%20stroke%3D%22%230a0c0b%22%20stroke-width%3D%221.6%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M8%2018l2%201M12%2016l1%202%22%20stroke%3D%22%233a4a30%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%2212%22%20r%3D%221%22%20fill%3D%22%235a1a14%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat!important}
.gearStage::before,.gearStage::after{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2026%2026%22%3E%3Cpath%20d%3D%22M3%2023C8%2015%2014%209%2023%204%22%20fill%3D%22none%22%20stroke%3D%22%231b1612%22%20stroke-width%3D%223.4%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M3%2023C8%2015%2014%209%2023%204%22%20fill%3D%22none%22%20stroke%3D%22%23c99a3a%22%20stroke-width%3D%221.6%22%20stroke-linecap%3D%22round%22%2F%3E%3Cg%20fill%3D%22%237bbf4a%22%20stroke%3D%22%231b1612%22%20stroke-width%3D%221.3%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M8%2016c-4%200-6-3-6-6%204%200%206%203%206%206z%22%2F%3E%3Cpath%20d%3D%22M12%2012c-1-4%201-7%204-8%201%204-1%207-4%208z%22%2F%3E%3Cpath%20d%3D%22M14%2011c4%201%207-1%208-4-4-1-7%201-8%204z%22%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%2222%22%20cy%3D%224%22%20r%3D%221.6%22%20fill%3D%22%23ffd86b%22%20stroke%3D%22%231b1612%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat!important}
#menu.zmode .gearStage::before,#menu.zmode .gearStage::after{display:none}
#menu:not(.zmode) #tabPlay .sideBtns .qbtn:not(.hot){border-radius:14px!important;background:radial-gradient(70% 50% at 50% 18%,rgba(255,255,255,.28),transparent 70%),linear-gradient(#3fa7a4,#22706f 60%,#1a5352)!important;
  box-shadow:inset 0 0 0 2px rgba(255,216,107,.55),inset 0 3px 0 rgba(255,255,255,.3),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 var(--crInk)!important}
#menu:not(.zmode) #tabPlay .sideBtns .qbtn.hot{border-radius:14px!important}

/* the Zombie menu's pages: dark metal bands with a torn edge for the sections, the gear stage on rusty iron */
#menu.zmode .secTitle{background:linear-gradient(#3a3f38,#262a25)!important;border-color:#0a0c0b!important}
#menu.zmode .secTitle::after{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%2012%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20d%3D%22M0%200h120v3l-5%203-4-2-6%204-3-3-5%202-4-3-6%204-3-2-5%203-6-4-3%202-5-1-4%203-6-2-3%203-5-4-4%202-6-1-3%203-4-3-6%202-4-3-5%204-3-2-6%201-4-3-3%203H0z%22%20fill%3D%22%23262a25%22%2F%3E%3C%2Fsvg%3E") center/100% 100% no-repeat!important;height:9px;bottom:-8px}
#menu.zmode .secTitle small{color:#c4f08e!important}
#menu.zmode .gearStage{background:radial-gradient(60% 60% at 50% 40%,rgba(150,230,110,.1),transparent 70%),linear-gradient(#2c302b,#171a16)!important;border-color:#0a0c0b!important}
`;document.head.appendChild(st)}
// the hand at the top right of the Classic home (the Zombie mode is over there), the moss sprout at the top left of the Zombie home
{const st=$('homeStage');const h=document.createElement('button');h.id='zHand';h.type='button';h.setAttribute('aria-label','Vai alla modalità Zombie');
  h.innerHTML=`<svg viewBox="0 0 34 40" aria-hidden="true"><path d="M8 0h18l-1 10c-1 4-3 7-7 8l-1 1" fill="#4f5e45" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/>
    <g class="fg"><path d="M9 6c-2 8-3 16-1 24 1 3 4 3 5 0l1-14" fill="#8aa676" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 9c0 9 0 17 2 26 1 3 4 3 5 0V12" fill="#8aa676" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M22 8c1 7 2 14 1 21 0 3 3 3 4 1 2-6 2-13 1-20" fill="#7f9a6a" stroke="#0a0c0b" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 31l3-1M16 36l3-1M23 31l3 0" stroke="#2a2a22" stroke-width="2" stroke-linecap="round"/>
    <circle cx="18" cy="16" r="1.8" fill="#5a1a14"/></g></svg>`;st.appendChild(h);
  const s=document.createElement('button');s.id='cSprout';s.type='button';s.setAttribute('aria-label','Torna alla modalità Classica');
  s.innerHTML=`<svg viewBox="0 0 34 40" aria-hidden="true"><path d="M17 38C17 30 16 24 18 16" fill="none" stroke="#1b1612" stroke-width="6" stroke-linecap="round"/><path d="M17 38C17 30 16 24 18 16" fill="none" stroke="#7bbf4a" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M18 19C11 19 5 14 4 6c8-1 14 3 14 13z" fill="#7bbf4a" stroke="#1b1612" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 18c6-1 11-6 12-14-8-1-12 6-12 14z" fill="#9fe06a" stroke="#1b1612" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="27" cy="9" r="1.4" fill="#fff6a8"/><circle cx="8" cy="12" r="1" fill="#fff6a8"/></svg>`;st.appendChild(s);
  h.addEventListener('click',e=>{e.stopPropagation();modeSwitch('zombie',-1)});
  s.addEventListener('click',e=>{e.stopPropagation();modeSwitch('classica',1)})}
// ------------------------------------------------------------------ what the home shows in each mode
// (the classic things: the wheel, the cups' road, the pass, the chests, the offers, the gear row, Sfida and Abisso; the Zombie mode has its
// own, added by its systems)
const CLASSIC_ONLY=['wheelBtn','roadSide','passBtn','chestBtn','offerBtn','homeGear'];
function applyModeUI(){const z=zMode(),m=$('menu');m.classList.toggle('zmode',z);for(const id of CLASSIC_ONLY){const e=$(id);if(e)e.classList.toggle('zoff',z)}
  $('zHand').hidden=z||!!MM.tr;$('cSprout').hidden=!z||!!MM.tr;
  const nw=(SAVE.zN||0)===0&&(SAVE.runs||0)>=1;let b=$('zHand').querySelector('.nw');if(nw&&!b){b=document.createElement('i');b.className='nw';b.textContent='Nuovo!';$('zHand').appendChild(b)}else if(!nw&&b)b.remove()}
{const st=document.createElement('style');st.textContent='.zoff{display:none!important}';document.head.appendChild(st)}
{const _rp=renderPlay;renderPlay=function(){_rp.apply(this,arguments);applyModeUI()}}
// the old tabs above the card are gone: the hand and the swipe change the mode now
{const t=$('modeTabs');if(t)t.hidden=true}
renderModeTabs=function(){};
// ------------------------------------------------------------------ the switch
function modeSwitch(to,dir){if(MM.tr||ZG.wait||CAMP.walk>0||(to==='zombie')===zMode())return;if($('tabPlay').hidden||$('menu').hidden)return;
  initAudio();sfx('modeSwap',to);vib(14);MM.tr={from:zMode()?'zombie':'classica',to,dir:dir||(to==='zombie'?-1:1),t0:CAMP.t,mid:false};
  $('zHand').hidden=true;$('cSprout').hidden=true;$('menu').classList.add('mswap');
  // the music turns into the other one (the zombie menu's: dark, with the fire and the wind)
  playMusic(to==='zombie'?'zmenu':'menu')}
function modeMid(){const T=MM.tr;if(!T||T.mid)return;T.mid=true;SAVE.modo=T.to;save();sfx('ui');renderPlay();$('menu').classList.remove('mswap')}
function modeFinish(){const T=MM.tr;if(!T)return;modeMid();MM.tr=null;$('menu').classList.remove('mswap');applyModeUI()}
// a tap anywhere during the change ends it at once (the scene goes straight to its end); the click of that tap, and the click that ends
// a swipe, never reach a button (whatever time the finger takes to lift)
document.addEventListener('pointerdown',e=>{MM.eatNext=false;if(MM.tr&&!$('menu').hidden){e.stopPropagation();e.preventDefault();modeFinish();MM.eatNext=true}},true);
document.addEventListener('click',e=>{if(MM.eatNext){MM.eatNext=false;e.stopPropagation();e.preventDefault()}},true);
// ------------------------------------------------------------------ the swipe in the middle of the home
{const st=$('homeStage');
  st.addEventListener('pointerdown',e=>{if(MM.tr||$('tabPlay').hidden)return;MM.sw={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}});
  st.addEventListener('pointermove',e=>{const S=MM.sw;if(!S||S.id!==e.pointerId)return;const dx=e.clientX-S.x,dy=e.clientY-S.y;
    if(Math.abs(dx)>58&&Math.abs(dx)>Math.abs(dy)*1.7&&performance.now()-S.t<900){MM.sw=null;MM.eatNext=true;modeSwitch(zMode()?'classica':'zombie',dx>0?1:-1)}});
  for(const k of['pointerup','pointercancel','pointerleave'])st.addEventListener(k,()=>{MM.sw=null})}
// the home must let the finger move sideways (no page scroll there)
{const st=document.createElement('style');st.textContent='#homeStage{touch-action:pan-y}';document.head.appendChild(st)}
// ------------------------------------------------------------------ the scenes
// the home canvas' frame: the same as drawCamp's (the hero's feet just above the «Cambia» pill, his scale hs)
function campFrame(){campResize();const cr=campCv.getBoundingClientRect(),dpr=campCv.width/Math.max(1,cr.width),hp=$('heroPill').getBoundingClientRect(),tb=$('topbar').getBoundingClientRect();
  const u=campCv.width/SW,top=(tb.bottom-cr.top)*dpr,feet0=(hp.top-cr.top)*dpr,room=Math.max(80*dpr,feet0-top),hs=clamp(Math.min(room*.56,215*dpr)/(46*u),1.4,3.6),feet=feet0-13*hs*u,
    oy=feet-HOME_Y*u,ox=campCv.width/2-180*u;return{u,ox,oy,dpr,hs}}
// the Zombie home: the campfire (k: how much the hero is sitting); while walking off to play, he stands up and the night swallows the screen
function drawCampZ(dt,k){const F=campFrame(),saved=ctx;ctx=campX;const t=CAMP.t;try{
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#020407';ctx.fillRect(0,0,campCv.width,campCv.height);ctx.setTransform(F.u,0,0,F.u,F.ox,F.oy);
  let kk=k,wk=0;if(CAMP.walk>0){const q=Math.min(1,(t-CAMP.walk)/1.5);kk=Math.min(kk,1-Math.min(1,q/.3));wk=clamp((q-.3)/.7,0,1)}
  drawFalo({t,dt,hs:F.hs,hx:156,hy:HOME_Y,k:kk,walk:wk});
  if(CAMP.walk>0&&t-CAMP.walk>.9){ctx.fillStyle=`rgba(2,4,6,${Math.min(1,(t-CAMP.walk-.9)/.6)})`;ctx.fillRect(-400,-400,SW+800,1400)}
  CAMP.hero={x:F.ox+156*F.u,y:F.oy+(HOME_Y-FALO.up*F.hs)*F.u,w:20*F.hs*F.u,h:44*F.hs*F.u,dpr:F.dpr}}finally{ctx.setTransform(1,0,0,1,0,0);ctx=saved}}
{const _dc=drawCamp;drawCamp=function(dt){const T=MM.tr;
  if(!T){if(zMode()){CAMP.t+=dt;G.t=CAMP.t;drawCampZ(dt,1)}else _dc(dt);return}
  // the change: the old place, then the new one inside the sweep that crosses the screen
  const el=CAMP.t-T.t0,w=mez(clamp((el-.12)/.95,0,1)),W=campCv.width,H=campCv.height,toZ=T.to==='zombie';if(el>.62)modeMid();if(el>=MM.DUR){modeFinish();return drawCamp(0)}
  // the hero: by the fire he stands up first (going back to the Classic) or sits down once the night has come (going to the Zombie)
  const kOld=toZ?1:1-mez(clamp(el/.45,0,1)),kNew=toZ?mez(clamp((el-.75)/.6,0,1)):1;
  if(T.from==='zombie'){CAMP.t+=dt;G.t=CAMP.t;drawCampZ(dt,kOld)}else _dc(dt);
  const edge=x=>T.dir<0?W*(1-w)+x:W*w-x,sl=H*.18;campX.save();campX.setTransform(1,0,0,1,0,0);campX.beginPath();
  if(T.dir<0){campX.moveTo(edge(0)+sl,0);campX.lineTo(W+2,0);campX.lineTo(W+2,H);campX.lineTo(edge(0)-sl,H)}else{campX.moveTo(-2,0);campX.lineTo(edge(0)+sl,0);campX.lineTo(edge(0)-sl,H);campX.lineTo(-2,H)}
  campX.closePath();campX.clip();if(toZ)drawCampZ(dt,kNew);else{const t0=CAMP.t;_dc(dt);CAMP.t=t0}campX.restore();
  // the front of the sweep: a band of cold mist with eyes (into the night) or of warm light with leaves (back to the Classic)
  if(w>0&&w<1){const x0=edge(0),g=campX.createLinearGradient(x0-60,0,x0+60,0);campX.save();campX.setTransform(1,0,0,1,0,0);
    if(toZ){g.addColorStop(0,'rgba(10,20,16,0)');g.addColorStop(.5,'rgba(18,34,26,.92)');g.addColorStop(1,'rgba(10,20,16,0)')}else{g.addColorStop(0,'rgba(255,220,120,0)');g.addColorStop(.5,'rgba(255,236,170,.85)');g.addColorStop(1,'rgba(255,220,120,0)')}
    campX.fillStyle=g;campX.beginPath();campX.moveTo(x0-60+sl,0);campX.lineTo(x0+60+sl,0);campX.lineTo(x0+60-sl,H);campX.lineTo(x0-60-sl,H);campX.closePath();campX.fill();
    campX.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const yy=H*((i*.137+el*.3)%1),xx=x0+(yy/H-.5)*-2*sl+Math.sin(i*2.1+el*6)*14;
      if(toZ){const a=.6+.4*Math.sin(el*9+i);campX.fillStyle=`rgba(190,255,120,${(.75*a).toFixed(3)})`;campX.fillRect(xx-5,yy,3,3);campX.fillRect(xx+3,yy,3,3)}
      else{campX.fillStyle=`rgba(180,240,110,.8)`;campX.beginPath();campX.ellipse(xx,yy,5,2.4,el*3+i,0,TAU);campX.fill()}}
    campX.restore()}}}
// ------------------------------------------------------------------ sounds of the switch and the Zombie menu's music and ambience
{const _s=sfx;sfx=function(k,arg){if(k!=='modeSwap')return _s.apply(this,arguments);if(!AU.ctx||!AU.on.sfx)return;const t=AU.ctx.currentTime+.01;
  try{fNoise(t,.9,'bandpass',arg==='zombie'?380:1400,1.2,.09,{brown:arg==='zombie',att:.25,f2:arg==='zombie'?180:3200,rev:.6});
    if(arg==='zombie'){vBell(null,t+.25,VR(45,.01),3.2,.03);vBell(null,t+.28,57.3,2.4,.012)}else for(let i=0;i<4;i++)vBell(null,t+.12+i*.07,[84,88,91,96][i],1.2,.02)}catch(e){}}}
// the Zombie menu's music: a slow dark drone, a low bell far away, a music box out of tune that plays a few notes and stops (the audio part
// of the plan will make it richer)
TRACKS.zmenu={bpm:60,ch:[[50,53,57],[46,50,53],[48,51,55],[45,49,52]],sc:[62,65,67,69,70,72,74],
  play(tr,step,t,spb){const s=step%16,bar=Math.floor(step/16)%4,C=this.ch[bar],cyc=Math.floor(step/64);
    if(s===0){vPad(tr,t,[C[0]-12,C[1]-12],spb*16,.08,300);vBass(tr,t,C[0]-24,spb*12,.14)}
    if(s===0&&bar===0)vBell(tr,t,C[0]-12,spb*20,.035);
    if(cyc%2===1&&(s===4||s===10||s===13)&&Math.random()<.7)vBox(tr,t,this.sc[Math.floor(Math.random()*this.sc.length)]-(Math.random()<.5?12:0)+(Math.random()-.5)*.35,spb*3,.022);
    if(s===8&&bar===2)vChoir(tr,t,[C[0],C[2]],spb*14,.03)}};
// the ambience by the fire: crackles and pops, gusts of wind, a crow, wood creaking far away (the far groans come from the zombies on the path)
AMBEV.zmenu=[[.08,.35,t=>fNoise(t,.01,'highpass',VR(2600,.35),.7,.04)],[1.2,3.2,t=>{fNoise(t,.03,'bandpass',VR(900,.3),2,.07);fNoise(t+.03,.4,'lowpass',500,.7,.03,{brown:true,att:.05})}],
  [5,11,t=>fNoise(t,2.4,'bandpass',VR(420,.2),.9,.05,{brown:true,att:.9,f2:VR(260,.2)})],[16,34,t=>{const c=AU.ctx;for(let i=0;i<2;i++){const o=osc('sawtooth',VR(820,.1),t+i*.32,t+i*.32+.22),bp=filt('bandpass',1500,3),g=c.createGain();o.frequency.linearRampToValueAtTime(VR(520,.1),t+i*.32+.2);
    g.gain.setValueAtTime(.0001,t+i*.32);g.gain.linearRampToValueAtTime(.02,t+i*.32+.03);g.gain.exponentialRampToValueAtTime(.0004,t+i*.32+.22);o.connect(bp);bp.connect(g);route(g,null,.4,.5)}}],[20,40,SND2.creak]];
// (the ambience follows the mode by itself: src/js/57-suoni2-atmosfera.js picks 'zmenu' in the Zombie menu)
// the menu's music follows the mode too (showMenu plays 'menu')
{const _pm=playMusic;playMusic=function(name){if(name==='menu'&&zMode()&&!MM.tr)name='zmenu';return _pm.call(this,name)}}
applyModeUI();
