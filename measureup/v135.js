/* ================= v1.35 · DOWNTOWN: shops, coins, inventory & your apartment (Oct 3 2026) =================
   Phase 1 of the Animal-Crossing layer. Adds:
     - A third currency: COINS (town money). Earned from a daily allowance at the Bank + a drip from every zPay
       reward. Notes (learning), Gold (rare) and Coins (shopping) all stay in play.
     - A DOWNTOWN district on the map with three buildings: Cozy Home (furniture, Lumi), the Corner Store
       (decor/plants/themes + SELL, Oompa) and the Bank (Reg: daily allowance). Plus Your Apartment to enter.
     - A shared ITEM CATALOG drawn as flat SVG (no emoji, literal hex) across furniture, decor, wall art and
       floor/wall themes, each with a style tag (for Phase 2 character tastes).
     - A player INVENTORY and an APARTMENT room you decorate by tapping an item then a slot (wall slots + a floor
       grid). Change floor/wall themes. Everything persists in S.coins / S.inv / S.home.
   Additive: wraps townPlan/townGeo/townGo/townFacade/zPay/load; new screens via zScr. Audio-safe. */

(function(){
  if(typeof townPlan!=='function'||typeof zScr!=='function'||typeof zRoom!=='function')return;

  /* ---------- state ---------- */
  function HS(){ if(typeof S==='undefined'||!S)return {coins:0,inv:{},home:{placed:[],themes:[],floor:'floor_wood',wall:'wall_cream'}};
    if(typeof S.coins!=='number')S.coins=0;
    if(!S.inv||typeof S.inv!=='object')S.inv={};
    if(!S.home||typeof S.home!=='object')S.home={};
    var h=S.home; if(!Array.isArray(h.placed))h.placed=[]; if(!Array.isArray(h.themes))h.themes=['floor_wood','wall_cream'];
    if(h.themes.indexOf('floor_wood')<0)h.themes.push('floor_wood'); if(h.themes.indexOf('wall_cream')<0)h.themes.push('wall_cream');
    if(!h.floor)h.floor='floor_wood'; if(!h.wall)h.wall='wall_cream';
    if(!S.town||typeof S.town!=='object')S.town={allowDay:'',granted:false};
    if(!S.town.granted){ S.town.granted=true; S.coins+=60; } // starter coins so decorating can begin right away
    return S; }
  (function(){ if(typeof load==='function'){ var _l=load; window.load=load=function(){ _l(); try{HS();}catch(e){} }; } })();
  try{ HS(); }catch(e){}
  function day(){ return (typeof ctDay==='function')?ctDay():(new Date().toDateString()); }

  /* ---------- currency ---------- */
  function hudCoins(){ var el=document.getElementById('hudCoins'); if(el)el.textContent=S.coins; }
  window.addCoins=function(n,msg){ HS(); S.coins+=n; if(typeof save==='function')save(); hudCoins(); if(msg&&typeof toast==='function')toast(msg); };
  window.spendCoins=function(n){ HS(); if(S.coins<n)return false; S.coins-=n; if(typeof save==='function')save(); hudCoins(); return true; };
  function spendNotes(n){ if((S.notes||0)<n)return false; S.notes-=n; if(typeof save==='function')save(); var e=document.getElementById('hudNotes'); if(e)e.textContent=S.notes; return true; }
  function spendGold(n){ if((S.gold||0)<n)return false; S.gold-=n; if(typeof save==='function')save(); var e=document.getElementById('hudGold'); if(e)e.textContent=S.gold; return true; }
  /* inject a coins chip into the hub topbar once */
  (function(){ try{ var g=document.getElementById('hudGold'); if(g&&!document.getElementById('hudCoins')){ var chip=document.createElement('div'); chip.className='chip'; chip.innerHTML='💰 <span class="cv" id="hudCoins">0</span>'; var par=g.closest?g.closest('.chip'):null; if(par&&par.parentNode){ par.parentNode.insertBefore(chip, par.nextSibling); } hudCoins(); } }catch(e){} })();
  /* drip coins from every reward */
  (function(){ if(typeof zPay==='function'){ var _zp=zPay; window.zPay=zPay=function(n,msg){ _zp(n,msg); try{ HS(); S.coins+=Math.max(1,Math.round(n/3)); if(typeof save==='function')save(); hudCoins(); }catch(e){} }; } })();

  /* ---------- item art (flat SVG, literal hex) ---------- */
  var ART={
   chair:'<rect x="14" y="8" width="16" height="16" rx="3" fill="#7ad9ff"/><rect x="12" y="22" width="20" height="7" rx="2" fill="#5bbfe6"/><rect x="13" y="29" width="3" height="8" fill="#3a7fa0"/><rect x="28" y="29" width="3" height="8" fill="#3a7fa0"/>',
   table:'<rect x="7" y="16" width="30" height="6" rx="2" fill="#c98a5a"/><rect x="10" y="22" width="3" height="14" fill="#a86b3f"/><rect x="31" y="22" width="3" height="14" fill="#a86b3f"/>',
   sofa:'<rect x="4" y="18" width="7" height="16" rx="3" fill="#ff8a57"/><rect x="33" y="18" width="7" height="16" rx="3" fill="#ff8a57"/><rect x="7" y="14" width="30" height="12" rx="4" fill="#ffb98f"/><rect x="5" y="22" width="34" height="12" rx="4" fill="#ff9f6b"/><rect x="9" y="33" width="4" height="5" fill="#8a5630"/><rect x="31" y="33" width="4" height="5" fill="#8a5630"/>',
   bed:'<rect x="4" y="22" width="36" height="14" rx="3" fill="#a86b3f"/><rect x="4" y="18" width="36" height="8" rx="3" fill="#7ad9ff"/><rect x="7" y="13" width="13" height="10" rx="3" fill="#ffffff" stroke="#cfe6ef"/><rect x="4" y="30" width="4" height="8" fill="#8a5630"/><rect x="36" y="30" width="4" height="8" fill="#8a5630"/>',
   stool:'<ellipse cx="22" cy="18" rx="12" ry="5" fill="#ff8ac0"/><rect x="12" y="18" width="3" height="16" fill="#a86b3f"/><rect x="29" y="18" width="3" height="16" fill="#a86b3f"/><rect x="20.5" y="20" width="3" height="16" fill="#a86b3f"/>',
   shelf:'<rect x="9" y="8" width="26" height="30" rx="2" fill="#c98a5a"/><rect x="11" y="13" width="22" height="3" fill="#a86b3f"/><rect x="11" y="24" width="22" height="3" fill="#a86b3f"/><rect x="13" y="16" width="4" height="7" fill="#ff6b6b"/><rect x="18" y="16" width="4" height="7" fill="#7dd87a"/><rect x="23" y="16" width="4" height="7" fill="#5d8bff"/>',
   lamp:'<ellipse cx="22" cy="36" rx="9" ry="3" fill="#a86b3f"/><rect x="20" y="20" width="4" height="15" fill="#c9a24c"/><path d="M12 20 L32 20 L28 10 L16 10 Z" fill="#ffd158"/>',
   floorlamp:'<ellipse cx="22" cy="38" rx="7" ry="2.5" fill="#a86b3f"/><rect x="20.5" y="13" width="3" height="25" fill="#8a7a3a"/><path d="M13 14 L31 14 L27 5 L17 5 Z" fill="#ffd158"/>',
   beanbag:'<path d="M10 34 Q8 18 22 16 Q36 18 34 34 Z" fill="#c58dff"/><ellipse cx="22" cy="20" rx="10" ry="4" fill="#d8b3ff"/>',
   toychest:'<rect x="9" y="20" width="26" height="16" rx="2" fill="#ff9f43"/><rect x="9" y="14" width="26" height="8" rx="3" fill="#ffb347"/><rect x="20" y="20" width="4" height="4" fill="#ffd158"/>',
   tv:'<rect x="6" y="10" width="32" height="20" rx="2" fill="#2b2350"/><rect x="9" y="13" width="26" height="14" rx="1" fill="#5bbfe6"/><rect x="19" y="30" width="6" height="4" fill="#4a3f7a"/><rect x="14" y="34" width="16" height="2" fill="#2b2350"/>',
   radio:'<rect x="8" y="16" width="28" height="18" rx="3" fill="#c98a5a"/><circle cx="16" cy="25" r="5" fill="#2b2350"/><circle cx="16" cy="25" r="2" fill="#ffd158"/><rect x="24" y="20" width="9" height="3" fill="#8a5630"/><rect x="24" y="26" width="9" height="5" fill="#8a5630"/><rect x="14" y="9" width="2" height="8" fill="#8a8a8a"/>',
   piano:'<rect x="8" y="16" width="28" height="12" rx="2" fill="#2b2350"/><rect x="8" y="24" width="28" height="9" fill="#ffffff" stroke="#cccccc"/><rect x="11" y="24" width="2" height="5" fill="#2b2350"/><rect x="15" y="24" width="2" height="5" fill="#2b2350"/><rect x="21" y="24" width="2" height="5" fill="#2b2350"/><rect x="27" y="24" width="2" height="5" fill="#2b2350"/><rect x="31" y="24" width="2" height="5" fill="#2b2350"/>',
   drum:'<ellipse cx="22" cy="34" rx="12" ry="4" fill="#ff6b6b"/><rect x="10" y="22" width="24" height="12" rx="3" fill="#ff8a8a"/><rect x="10" y="22" width="24" height="3" fill="#ffffff"/><line x1="30" y1="22" x2="38" y2="11" stroke="#a86b3f" stroke-width="2"/><ellipse cx="38" cy="11" rx="5" ry="2" fill="#ffd158"/>',
   rug:'<ellipse cx="22" cy="24" rx="18" ry="10" fill="#ff8ac0"/><ellipse cx="22" cy="24" rx="12" ry="6.5" fill="none" stroke="#ffffff" stroke-width="2"/><ellipse cx="22" cy="24" rx="5" ry="3" fill="#ffd158"/>',
   plant:'<path d="M15 24 L29 24 L27 36 L17 36 Z" fill="#d98a5a"/><circle cx="22" cy="18" r="8" fill="#7dd87a"/><circle cx="16" cy="20" r="5" fill="#8fe08f"/><circle cx="28" cy="20" r="5" fill="#8fe08f"/>',
   bigplant:'<path d="M16 26 L28 26 L26 38 L18 38 Z" fill="#d98a5a"/><path d="M22 26 C14 20 14 8 22 6 C30 8 30 20 22 26 Z" fill="#7dd87a"/><path d="M22 24 C18 20 18 12 22 10 C26 12 26 20 22 24 Z" fill="#8fe08f"/>',
   clock:'<circle cx="22" cy="21" r="13" fill="#ffffff" stroke="#c98a5a" stroke-width="3"/><rect x="21" y="13" width="2" height="9" rx="1" fill="#2b2350"/><rect x="22" y="20" width="7" height="2" rx="1" fill="#2b2350"/><rect x="15" y="33" width="3" height="4" fill="#a86b3f"/><rect x="26" y="33" width="3" height="4" fill="#a86b3f"/>',
   poster:'<rect x="10" y="8" width="24" height="28" rx="1" fill="#ffffff" stroke="#c98a5a" stroke-width="2"/><circle cx="22" cy="18" r="6" fill="#ffd158"/><path d="M13 32 L19 22 L24 28 L28 20 L31 32 Z" fill="#7dd87a"/>',
   window:'<rect x="8" y="8" width="28" height="26" rx="2" fill="#aee6ff" stroke="#c98a5a" stroke-width="3"/><circle cx="16" cy="16" r="4" fill="#ffd158"/><rect x="21" y="8" width="2" height="26" fill="#c98a5a"/><rect x="8" y="20" width="28" height="2" fill="#c98a5a"/>',
   wallclock:'<circle cx="22" cy="22" r="14" fill="#ffffff" stroke="#2b2350" stroke-width="3"/><rect x="21" y="12" width="2" height="11" rx="1" fill="#2b2350"/><rect x="22" y="21" width="8" height="2" rx="1" fill="#ff6b6b"/>',
   /* theme swatches */
   floor_wood:'<rect width="44" height="44" fill="#e9c49a"/><line x1="0" y1="14" x2="44" y2="14" stroke="#cf9f6a" stroke-width="2"/><line x1="0" y1="30" x2="44" y2="30" stroke="#cf9f6a" stroke-width="2"/>',
   floor_checker:'<rect width="44" height="44" fill="#ffffff"/><rect x="0" y="0" width="22" height="22" fill="#9fd4ff"/><rect x="22" y="22" width="22" height="22" fill="#9fd4ff"/>',
   floor_grass:'<rect width="44" height="44" fill="#9fe08f"/><path d="M8 34 l2 -6 2 6 M20 36 l2 -6 2 6 M32 34 l2 -6 2 6" stroke="#5fae53" stroke-width="2" fill="none"/>',
   floor_star:'<rect width="44" height="44" fill="#2b2350"/><path d="M12 12 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 z" fill="#ffd158"/><circle cx="32" cy="30" r="2" fill="#ffffff"/>',
   wall_cream:'<rect width="44" height="44" fill="#fff6e6"/>',
   wall_blue:'<rect width="44" height="44" fill="#d6ecff"/>',
   wall_stripe:'<rect width="44" height="44" fill="#fff6e6"/><rect x="6" width="6" height="44" fill="#ffe0ba"/><rect x="24" width="6" height="44" fill="#ffe0ba"/>',
   wall_music:'<rect width="44" height="44" fill="#efe6ff"/><text x="10" y="20" font-size="14" fill="#c58dff">♪</text><text x="24" y="34" font-size="14" fill="#c58dff">♫</text>'
  };
  function art(id,sz){ sz=sz||44; var m=ART[id]||''; return '<svg viewBox="0 0 44 44" width="'+sz+'" height="'+sz+'" style="display:block">'+m+'</svg>'; }
  window.itemArt=art;

  /* ---------- catalog ---------- */
  var ITEMS=[
   {id:'chair', name:'Comfy Chair', cat:'furniture', zone:'floor', style:'cozy',   p:{c:20}},
   {id:'table', name:'Round Table', cat:'furniture', zone:'floor', style:'natural',p:{c:30}},
   {id:'sofa',  name:'Big Sofa',    cat:'furniture', zone:'floor', style:'cozy',   p:{c:60}},
   {id:'bed',   name:'Cozy Bed',    cat:'furniture', zone:'floor', style:'cozy',   p:{c:70}},
   {id:'stool', name:'Pink Stool',  cat:'furniture', zone:'floor', style:'playful',p:{c:18}},
   {id:'shelf', name:'Bookshelf',   cat:'furniture', zone:'floor', style:'natural',p:{c:45}},
   {id:'lamp',  name:'Table Lamp',  cat:'furniture', zone:'floor', style:'cozy',   p:{c:25}},
   {id:'floorlamp',name:'Floor Lamp',cat:'furniture',zone:'floor', style:'cool',   p:{c:35}},
   {id:'beanbag',name:'Bean Bag',   cat:'furniture', zone:'floor', style:'playful',p:{c:40}},
   {id:'toychest',name:'Toy Chest', cat:'furniture', zone:'floor', style:'playful',p:{c:35}},
   {id:'tv',    name:'TV Set',      cat:'furniture', zone:'floor', style:'cool',   p:{c:80}},
   {id:'radio', name:'Radio',       cat:'furniture', zone:'floor', style:'cool',   p:{c:40}},
   {id:'piano', name:'Keyboard',    cat:'furniture', zone:'floor', style:'music',  p:{c:90}},
   {id:'drum',  name:'Drum Kit',    cat:'furniture', zone:'floor', style:'music',  p:{g:3}},
   {id:'rug',   name:'Round Rug',   cat:'decor', zone:'floor', style:'cozy',   p:{c:35}},
   {id:'plant', name:'Little Plant',cat:'decor', zone:'floor', style:'natural',p:{c:20}},
   {id:'bigplant',name:'Tall Plant',cat:'decor', zone:'floor', style:'natural',p:{c:45}},
   {id:'clock', name:'Table Clock', cat:'decor', zone:'floor', style:'fancy',  p:{c:30}},
   {id:'poster',name:'Sunny Poster',cat:'decor', zone:'wall',  style:'playful',p:{c:20}},
   {id:'window',name:'Window',      cat:'decor', zone:'wall',  style:'natural',p:{c:50}},
   {id:'wallclock',name:'Wall Clock',cat:'decor',zone:'wall',  style:'fancy',  p:{n:40}},
   {id:'floor_checker',name:'Checker Floor',cat:'theme',zone:'theme',sub:'floor',style:'cool',   p:{c:40}},
   {id:'floor_grass', name:'Grass Floor', cat:'theme',zone:'theme',sub:'floor',style:'natural',p:{c:40}},
   {id:'floor_star',  name:'Starry Floor',cat:'theme',zone:'theme',sub:'floor',style:'fancy',  p:{g:2}},
   {id:'wall_blue',   name:'Blue Wall',   cat:'theme',zone:'theme',sub:'wall', style:'cool',   p:{c:40}},
   {id:'wall_stripe', name:'Striped Wall',cat:'theme',zone:'theme',sub:'wall', style:'cozy',   p:{c:40}},
   {id:'wall_music',  name:'Music Wall',  cat:'theme',zone:'theme',sub:'wall', style:'music',  p:{n:50}}
  ];
  var BYID={}; ITEMS.forEach(function(it){ BYID[it.id]=it; });
  window.TOWN_ITEMS=ITEMS; window.TOWN_BYID=BYID; window.TOWN_ART=ART;
  function priceLabel(p){ if(p.c)return '💰 '+p.c; if(p.n)return '🎵 '+p.n; if(p.g)return '📀 '+p.g; return 'free'; }
  function canAfford(p){ if(p.c)return S.coins>=p.c; if(p.n)return (S.notes||0)>=p.n; if(p.g)return (S.gold||0)>=p.g; return true; }
  function pay(p){ if(p.c)return spendCoins(p.c); if(p.n)return spendNotes(p.n); if(p.g)return spendGold(p.g); return true; }
  function ownsTheme(id){ return HS().home.themes.indexOf(id)>=0; }
  function placedCount(id){ return HS().home.placed.filter(function(x){return x.id===id;}).length; }
  function avail(id){ return (S.inv[id]||0)-placedCount(id); }

  /* ---------- buy / sell ---------- */
  function buy(it){ if(typeof sTap==='function')sTap(); HS();
    if(it.cat==='theme'){ if(ownsTheme(it.id)){ if(typeof toast==='function')toast('Already owned'); return; } if(!canAfford(it.p)){ if(typeof toast==='function')toast('Not enough '+(it.p.c?'coins':it.p.n?'notes':'gold')); return; } pay(it.p); S.home.themes.push(it.id); save(); if(typeof confetti==='function')confetti(); if(typeof toast==='function')toast('Bought '+it.name+'! Set it in your apartment.'); return; }
    if(!canAfford(it.p)){ if(typeof toast==='function')toast('Not enough '+(it.p.c?'coins':it.p.n?'notes':'gold')); return; }
    pay(it.p); S.inv[it.id]=(S.inv[it.id]||0)+1; save(); if(typeof confetti==='function')confetti(); if(typeof toast==='function')toast('Bought '+it.name+'!'); }
  function sellValue(it){ var base=it.p.c||((it.p.n||0)*2)||((it.p.g||0)*30)||20; return Math.max(5,Math.round(base*0.4)); }
  function sell(it){ if(typeof sTap==='function')sTap(); HS(); if(avail(it.id)<=0){ if(typeof toast==='function')toast('None spare to sell (some are placed).'); return; } S.inv[it.id]=(S.inv[it.id]||0)-1; if(S.inv[it.id]<=0)delete S.inv[it.id]; addCoins(sellValue(it),'Sold '+it.name+' for 💰 '+sellValue(it)); }

  /* ---------- SHOPS ---------- */
  var SHOPS={
   home:{nm:'Cozy Home', host:'lumi', hint:'Lumi’s furniture shop. Fill your apartment with cozy things.', cats:['furniture']},
   gen:{nm:'Corner Store', host:'oompa', hint:'Oompa’s Corner Store: plants, art, floors and walls - and sell what you don’t want.', cats:['decor','theme'], sell:true}
  };
  var STAB='buy';
  window.openStore=function(which){ if(typeof sTap==='function')sTap(); HS(); var sh=SHOPS[which]; if(!sh)return; STORE=which; STAB='buy';
    zScr('scr-store','storeWallet','storeBody',sh.hint); storeRender(); show('scr-store'); var b=document.getElementById('scr-store'); if(b)b.scrollTop=0; };
  var STORE='home';
  function wallet(){ return '💰 '+S.coins+'  ·  🎵 '+(S.notes||0)+'  ·  📀 '+(S.gold||0); }
  window.storeTab=function(t){ if(typeof sTap==='function')sTap(); STAB=t; storeRender(); };
  window.storeRender=function(){ var body=document.getElementById('storeBody'); if(!body)return; var sh=SHOPS[STORE]; HS();
    var sc=document.getElementById('storeWallet'); if(sc)sc.textContent=wallet();
    var html=zRoom(sh.host, sh.nm, sh.hint);
    if(sh.sell){ html+='<div class="st-tabs">'
       +'<button class="btn ghost small'+(STAB==='buy'?' sel':'')+'" onclick="storeTab(\'buy\')">🛍️ Buy</button>'
       +'<button class="btn ghost small'+(STAB==='sell'?' sel':'')+'" onclick="storeTab(\'sell\')">💰 Sell</button></div>'; }
    if(STAB==='sell'){
      var own=ITEMS.filter(function(it){ return it.cat!=='theme' && (S.inv[it.id]||0)>0; });
      html+='<div class="sub center" style="margin:4px 0">Tap an item to sell it for coins. Placed items stay put.</div>';
      if(!own.length)html+='<div class="speak center">Nothing to sell yet. Buy some things first!</div>';
      html+='<div class="st-grid">'+own.map(function(it){ return '<div class="st-card" onclick="storeSell(\''+it.id+'\')"><div class="st-art">'+art(it.id,46)+'</div><div class="st-nm">'+it.name+'</div><div class="st-pz" style="color:#7dff8a">sell 💰 '+sellValue(it)+'</div><div class="sub">have '+(S.inv[it.id]||0)+' · spare '+avail(it.id)+'</div></div>'; }).join('')+'</div>';
      body.innerHTML=html; return;
    }
    var list=ITEMS.filter(function(it){ return sh.cats.indexOf(it.cat)>=0; });
    html+='<div class="st-grid">'+list.map(function(it){ return storeCard(it); }).join('')+'</div>';
    body.innerHTML=html;
  };
  function storeCard(it){ var owned = it.cat==='theme' ? ownsTheme(it.id) : false; var have = it.cat!=='theme' ? (S.inv[it.id]||0) : 0;
    var btn = owned ? '<div class="st-own">✓ Owned</div>' : '<button class="btn small'+(canAfford(it.p)?'':' ghost')+'" onclick="storeBuy(\''+it.id+'\')">'+priceLabel(it.p)+'</button>';
    return '<div class="st-card"><div class="st-art">'+art(it.id,46)+'</div><div class="st-nm">'+it.name+'</div>'
      +(have?'<div class="sub">you have '+have+'</div>':'<div class="sub">'+it.style+'</div>')+btn+'</div>'; }
  window.storeBuy=function(id){ buy(BYID[id]); storeRender(); };
  window.storeSell=function(id){ sell(BYID[id]); storeRender(); };

  /* ---------- BANK ---------- */
  window.openBank=function(){ if(typeof sTap==='function')sTap(); HS(); zScr('scr-bank','bankWallet','bankBody','Reg’s Bank. Collect your daily coins and keep your money safe.'); bankRender(); show('scr-bank'); var b=document.getElementById('scr-bank'); if(b)b.scrollTop=0; };
  window.bankRender=function(){ var body=document.getElementById('bankBody'); if(!body)return; HS(); var sc=document.getElementById('bankWallet'); if(sc)sc.textContent=wallet();
    var got=(S.town.allowDay===day());
    var html=zRoom('reg','Reg’s Bank','Money in the town is counted in coins.');
    html+='<div class="speak center" style="font-size:16px">You have <b style="color:#ffd158">💰 '+S.coins+' coins</b>.</div>';
    html+='<div class="bank-row"><div class="bank-k">Daily allowance</div><div class="bank-v">'+(got?'<span style="color:#7dff8a">✓ Collected today</span>':'<button class="btn" onclick="bankAllow()">Collect 💰 25</button>')+'</div></div>';
    html+='<div class="bank-row"><div class="bank-k">Swap notes for coins</div><div class="bank-v"><button class="btn ghost small" onclick="bankSwap()">🎵 10 → 💰 10</button></div></div>';
    html+='<div class="sub center" style="margin-top:8px">You also earn coins every time you finish a learning activity.</div>';
    body.innerHTML=html; };
  window.bankAllow=function(){ if(typeof sTap==='function')sTap(); HS(); if(S.town.allowDay===day())return; S.town.allowDay=day(); addCoins(25,'Daily allowance! +💰 25'); if(typeof confetti==='function')confetti(); bankRender(); };
  window.bankSwap=function(){ if(typeof sTap==='function')sTap(); HS(); if((S.notes||0)<10){ if(typeof toast==='function')toast('Need 10 notes'); return; } spendNotes(10); addCoins(10,'Swapped 🎵 10 for 💰 10'); bankRender(); };

  /* ---------- APARTMENT ---------- */
  var FSLOTS=15, WSLOTS=5, ATAB='room';
  window.openApartment=function(){ if(typeof sTap==='function')sTap(); HS(); ASEL=null; ATAB='room'; zScr('scr-apt','aptScore','aptBody','Your apartment. Decorate it with everything you own.'); aptRender(); show('scr-apt'); var b=document.getElementById('scr-apt'); if(b)b.scrollTop=0; };
  var ASEL=null; // selected inventory item id to place
  function roomHtml(){ var h=HS().home; var fa=ART[h.floor]||ART.floor_wood, wa=ART[h.wall]||ART.wall_cream;
    var placedBy={}; h.placed.forEach(function(p){ placedBy[p.zone+':'+p.slot]=p; });
    var s='<div class="room">';
    // wall
    s+='<div class="room-wall" style="background:'+themeBg(h.wall)+'">';
    for(var i=0;i<WSLOTS;i++){ var p=placedBy['wall:'+i]; s+='<div class="rslot wall'+(p?' full':'')+'" onclick="aptSlot(\'wall\','+i+')">'+(p?art(p.id,40):'')+'</div>'; }
    s+='</div>';
    // floor
    s+='<div class="room-floor" style="background:'+themeBg(h.floor)+'">';
    for(var j=0;j<FSLOTS;j++){ var q=placedBy['floor:'+j]; s+='<div class="rslot'+(q?' full':'')+'" onclick="aptSlot(\'floor\','+j+')">'+(q?art(q.id,38):'')+'</div>'; }
    s+='</div></div>';
    return s; }
  function themeBg(id){ // flat color for the room zones (swatch art is for the shop)
    return {floor_wood:'#e9c49a',floor_checker:'#dff1ff',floor_grass:'#9fe08f',floor_star:'#2b2350',wall_cream:'#fff6e6',wall_blue:'#d6ecff',wall_stripe:'#ffefd6',wall_music:'#efe6ff'}[id]||'#eee'; }
  window.aptTab=function(t){ if(typeof sTap==='function')sTap(); ATAB=t; ASEL=null; aptRender(); };
  window.aptRender=function(){ var body=document.getElementById('aptBody'); if(!body)return; HS();
    var sc=document.getElementById('aptScore'); if(sc)sc.textContent='💰 '+S.coins+' · '+HS().home.placed.length+' things placed';
    var subt=ASEL?('Tap a '+(BYID[ASEL].zone==='wall'?'wall':'floor')+' spot to place your '+BYID[ASEL].name+'.'):'Decorate your place.';
    var por=(typeof creatureSVG==='function'&&S.creature)?creatureSVG(S.creature,60):'';
    var html='<div class="center">'+por+'<h2 style="margin:2px 0 0">Your Apartment</h2><div class="sub" style="margin:2px 0 6px">'+subt+'</div></div>';
    html+='<div class="ap-tabs">'
      +'<button class="btn ghost small'+(ATAB==='room'?' sel':'')+'" onclick="aptTab(\'room\')">🏠 Room</button>'
      +'<button class="btn ghost small'+(ATAB==='inv'?' sel':'')+'" onclick="aptTab(\'inv\')">📦 Stuff</button>'
      +'<button class="btn ghost small'+(ATAB==='theme'?' sel':'')+'" onclick="aptTab(\'theme\')">🎨 Floor &amp; Wall</button></div>';
    html+=roomHtml();
    if(ATAB==='room'){
      html+='<div class="sub center">Tap a thing in Stuff, then tap a spot. Tap a placed thing to pick it back up.</div>';
    } else if(ATAB==='inv'){
      var inv=ITEMS.filter(function(it){ return it.cat!=='theme' && avail(it.id)>0; });
      if(!inv.length)html+='<div class="speak center">No furniture to place yet. Buy some at <b>Cozy Home</b> or the <b>Corner Store</b>.</div>';
      html+='<div class="st-grid">'+inv.map(function(it){ return '<div class="st-card'+(ASEL===it.id?' sel':'')+'" onclick="aptPick(\''+it.id+'\')"><div class="st-art">'+art(it.id,44)+'</div><div class="st-nm">'+it.name+'</div><div class="sub">x'+avail(it.id)+' to place</div></div>'; }).join('')+'</div>';
    } else {
      var floors=[{id:'floor_wood',name:'Wood Floor',sub:'floor'}].concat(ITEMS.filter(function(it){return it.zone==='theme'&&it.sub==='floor';}));
      var walls=[{id:'wall_cream',name:'Cream Wall',sub:'wall'}].concat(ITEMS.filter(function(it){return it.zone==='theme'&&it.sub==='wall';}));
      html+='<div class="sub center" style="margin-top:6px">Floors</div><div class="st-grid">'+floors.map(function(it){ return themeCard(it); }).join('')+'</div>';
      html+='<div class="sub center" style="margin-top:6px">Walls</div><div class="st-grid">'+walls.map(function(it){ return themeCard(it); }).join('')+'</div>';
    }
    body.innerHTML=html;
  };
  function themeCard(it){ var owned=ownsTheme(it.id); var cur=(S.home[it.sub]===it.id);
    var btn = cur?'<div class="st-own">✓ On</div>':(owned?'<button class="btn small" onclick="aptTheme(\''+it.id+'\',\''+it.sub+'\')">Use</button>':'<div class="sub">buy at Corner Store</div>');
    return '<div class="st-card"><div class="st-art">'+art(it.id,46)+'</div><div class="st-nm">'+it.name+'</div>'+btn+'</div>'; }
  window.aptTheme=function(id,sub){ if(typeof sTap==='function')sTap(); HS(); if(!ownsTheme(id))return; S.home[sub]=id; save(); aptRender(); };
  window.aptPick=function(id){ if(typeof sTap==='function')sTap(); ASEL=(ASEL===id?null:id); ATAB='room'; aptRender(); };
  window.aptSlot=function(zone,slot){ HS(); var key=zone+':'+slot; var existing=S.home.placed.filter(function(p){return p.zone===zone&&p.slot===slot;})[0];
    if(existing){ // pick up
      if(typeof sTap==='function')sTap(); S.home.placed=S.home.placed.filter(function(p){return !(p.zone===zone&&p.slot===slot);}); save(); aptRender(); return; }
    if(!ASEL)return; var it=BYID[ASEL]; if(!it)return;
    if(it.zone!==zone){ if(typeof toast==='function')toast(it.zone==='wall'?'That goes on the wall':'That goes on the floor'); return; }
    if(avail(ASEL)<=0){ ASEL=null; aptRender(); return; }
    if(typeof sTap==='function')sTap(); S.home.placed.push({id:ASEL,zone:zone,slot:slot}); save(); if(avail(ASEL)<=0)ASEL=null; aptRender(); };

  /* ---------- CSS ---------- */
  (function(){ if(document.getElementById('townCSS'))return; var st=document.createElement('style'); st.id='townCSS'; st.textContent=
     '.st-tabs,.ap-tabs,.st-tabs{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0 8px}'
    +'.st-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin:8px 0}'
    +'.st-card{background:#160f33;border:1px solid #2b2350;border-radius:12px;padding:8px 6px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px}'
    +'.st-card.sel{outline:2px solid #ffd158}'
    +'.st-art{background:#fff;border-radius:8px;padding:4px;width:54px;height:54px;display:flex;align-items:center;justify-content:center}'
    +'.st-nm{font-size:12px;font-weight:700;line-height:1.1}'
    +'.st-own{font-size:12px;font-weight:800;color:#7dff8a}'
    +'.st-card .btn{margin-top:2px}'
    +'.bank-row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#160f33;border:1px solid #2b2350;border-radius:12px;padding:10px 12px;margin:8px 0}'
    +'.bank-k{font-weight:700;font-size:14px}'
    +'.room{max-width:330px;margin:8px auto;border-radius:14px;overflow:hidden;border:2px solid #2b2350}'
    +'.room-wall{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:8px}'
    +'.room-floor{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:8px}'
    +'.rslot{aspect-ratio:1/1;border-radius:8px;border:2px dashed rgba(43,35,80,.35);display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(255,255,255,.25)}'
    +'.rslot.full{border-style:solid;border-color:rgba(43,35,80,.5);background:rgba(255,255,255,.55)}'
    +'.rslot.wall{aspect-ratio:1/0.8}';
    document.head.appendChild(st); })();

  /* ---------- wire the map: DOWNTOWN district + routing ---------- */
  (function(){ var _tp=townPlan; window.townPlan=townPlan=function(){ var rows=_tp(); var base=1840; // after HEALTH ROW
    if(!rows.some(function(r){return r.name==='DOWNTOWN';})){
      rows.push({y:base+220,name:'DOWNTOWN',sub:'shops & money',color:'#ffcf6b',slots:[
        {col:'#ffcf6b',tg:'FURNITURE',nm:'Cozy Home',host:'lumi',prog:(Object.keys((S&&S.inv)||{}).length)+' things owned',go:'d_home'},
        {col:'#8fd0ff',tg:'GOODS',nm:'Corner Store',host:'oompa',prog:'buy & sell',go:'d_gen'} ]});
      rows.push({y:base+440,name:'DOWNTOWN · HOME',sub:'your money & your place',color:'#ff9ec4',slots:[
        {col:'#7dd87a',tg:'BANK',nm:'The Bank',host:'reg',prog:((S&&S.coins)||0)+' coins',go:'d_bank'},
        {col:'#ff9ec4',tg:'HOME',nm:'Your Apartment',host:'__you',prog:(((S&&S.home&&S.home.placed)||[]).length)+' things placed',go:'d_apt'} ]});
    }
    return rows; }; })();
  if(typeof TOWN_H!=='undefined')TOWN_H=1840+480; // grow the map for the two new rows
  (function(){ if(typeof townGeo!=='function')return; var _g=townGeo; window.townGeo=townGeo=function(plan,wide){ var g=_g(plan,wide);
    if(!wide){ g.H=TOWN_H; var prevY=(g.pos.length?plan[g.pos.length-1].y:700);
      while(g.pos.length<plan.length){ var idx=g.pos.length; var r=plan[idx];
        g.pos.push({sign:{x:195,y:r.y-112},slots:[{x:80,y:r.y},{x:312,y:r.y}]});
        g.roads.push([195,prevY,195,r.y],[195,r.y+34,80,r.y+34],[195,r.y+34,312,r.y+34]);
        g.greens.push([24,r.y-30],[366,r.y-30]); prevY=r.y; } }
    else { if(g.extra)g.extra=[]; }
    return g; }; })();
  (function(){ var _tg=townGo; window.townGo=townGo=function(dest){ if(typeof sTap==='function'){try{sTap();}catch(e){}}
    if(dest==='d_home'){ openStore('home'); return; } if(dest==='d_gen'){ openStore('gen'); return; }
    if(dest==='d_bank'){ openBank(); return; } if(dest==='d_apt'){ openApartment(); return; }
    return _tg(dest); }; })();
  /* "Your Apartment" facade shows Garrett's own creature */
  (function(){ if(typeof townFacade!=='function')return; var _tf=townFacade; window.townFacade=townFacade=function(v,x,y){
    if(v&&v.host==='__you'){ var html=_tf(Object.assign({},v,{host:'boom'}),x,y); try{ var por=(typeof creatureSVG==='function'&&S.creature)?creatureSVG(S.creature,60):''; if(por)html=html.replace(/<div class="tw-host">[\s\S]*?<\/div>/,'<div class="tw-host">'+por+'</div>'); }catch(e){} return html; }
    return _tf(v,x,y); }; })();
})();
