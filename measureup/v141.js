/* ================= v1.41 · NEIGHBORS: apartment buildings, visit anyone at home, decorate their rooms (Oct 6 2026) =================
   Phase 2 of the Animal-Crossing layer. Adds:
     - Three HOMES districts on the plot (Midwest / East Coast / South & West), six apartment buildings. Every citizen
       with a home state lives in the building for their part of the country, so walking the halls is geography too.
       Residents are computed from MEMBER_HOME, so new citizens move in automatically.
     - Knock on any door: meeting someone at home counts as meeting them. Each citizen has their OWN ROOM (same wall
       strip + floor grid as Your Apartment) with a couple of their own things already in it.
     - Every citizen has a TASTE (cozy / natural / cool / fancy / playful / music) read from their likes, shown with a
       kid definition. Give them furniture from your Stuff and paint their floor and wall with themes you own.
       Matching their taste makes them happier (+2 an item, +3 a theme) than a mismatch (+1). Happiness tiers:
       Bare, Homey, Lovely, Dream Home; each tier pays once (coins, notes, a gold at Dream Home).
     - Gifts you gave can be asked back (with a confirm). Their own starter things stay put.
     - 10 new catalog items so every taste has things to love (vase, mirror, velvet chair, trophy, guitar, gold record,
       jukebox, lava lamp, fish tank, kite). Uses the v1.35 catalog lookups exposed as TOWN_BYID / TOWN_ART.
     - Citizen cards gain a "Visit their home" button. Extension points for v1.42: nbRoomTop(id), nbDoorBadge(id).
   State: S.nb {rooms:{id:{placed,floor,wall}}, tier:{id:n}, gifts:n}. Additive, audio-safe, no em dashes, literal hex. */
(function(){
  if(typeof document==='undefined')return;
  if(typeof townPlan!=='function'||typeof zScr!=='function'||!window.TOWN_ITEMS||!window.TOWN_BYID||!window.TOWN_ART)return;
  var ITEMS=window.TOWN_ITEMS, BYID=window.TOWN_BYID, ART=window.TOWN_ART;

  /* ---------- new catalog items (all tastes covered) ---------- */
  var NEW_ART={
   vase:'<path d="M17 12 L27 12 L26 16 Q33 22 29 32 Q27 37 22 37 Q17 37 15 32 Q11 22 18 16 Z" fill="#5d8bff"/><path d="M16 24 Q22 27 28 24" stroke="#ffd158" stroke-width="2" fill="none"/><circle cx="18" cy="8" r="3" fill="#ff8ac0"/><circle cx="25" cy="7" r="3" fill="#ffd158"/><rect x="21" y="7" width="1.5" height="6" fill="#5fae53"/>',
   goldmirror:'<ellipse cx="22" cy="22" rx="12" ry="15" fill="#e8c55a"/><ellipse cx="22" cy="22" rx="9" ry="12" fill="#d9f2ff"/><path d="M17 15 L20 13" stroke="#ffffff" stroke-width="2"/><circle cx="22" cy="6" r="2.5" fill="#e8c55a"/>',
   velvetchair:'<rect x="11" y="7" width="22" height="20" rx="8" fill="#a3326a"/><rect x="13" y="10" width="18" height="14" rx="6" fill="#c8487f"/><rect x="9" y="23" width="26" height="8" rx="3" fill="#a3326a"/><rect x="11" y="31" width="3" height="7" fill="#e8c55a"/><rect x="30" y="31" width="3" height="7" fill="#e8c55a"/>',
   trophy:'<path d="M14 8 L30 8 L28 20 Q22 26 16 20 Z" fill="#e8c55a"/><path d="M14 10 Q8 10 9 15 Q10 19 15 18" stroke="#e8c55a" stroke-width="2" fill="none"/><path d="M30 10 Q36 10 35 15 Q34 19 29 18" stroke="#e8c55a" stroke-width="2" fill="none"/><rect x="20" y="23" width="4" height="7" fill="#c9a24c"/><rect x="14" y="30" width="16" height="6" rx="1" fill="#8a5630"/>',
   guitar:'<rect x="20.5" y="4" width="3" height="18" fill="#8a5630"/><rect x="19" y="3" width="6" height="4" rx="1" fill="#2b2350"/><circle cx="22" cy="26" r="8" fill="#ff8a57"/><circle cx="22" cy="32" r="7" fill="#ff8a57"/><circle cx="22" cy="27" r="2.5" fill="#2b2350"/><rect x="18" y="33" width="8" height="2" fill="#2b2350"/>',
   recordwall:'<rect x="7" y="7" width="30" height="30" rx="2" fill="#2b2350" stroke="#e8c55a" stroke-width="2"/><circle cx="22" cy="22" r="10" fill="#e8c55a"/><circle cx="22" cy="22" r="6" fill="none" stroke="#c9a24c" stroke-width="1"/><circle cx="22" cy="22" r="2.5" fill="#2b2350"/>',
   jukebox:'<path d="M9 38 L9 16 Q9 5 22 5 Q35 5 35 16 L35 38 Z" fill="#ff5d5d"/><path d="M13 20 Q13 10 22 10 Q31 10 31 20 Z" fill="#ffd158"/><rect x="13" y="22" width="18" height="8" rx="2" fill="#7ad9ff"/><rect x="15" y="32" width="14" height="3" fill="#2b2350"/>',
   lavalamp:'<path d="M17 8 L27 8 L31 30 L13 30 Z" fill="#c58dff"/><ellipse cx="21" cy="15" rx="3" ry="4" fill="#ff8ac0"/><ellipse cx="25" cy="24" rx="3.5" ry="3" fill="#ff8ac0"/><rect x="16" y="5" width="12" height="4" rx="1" fill="#4a3f7a"/><path d="M13 30 L31 30 L33 38 L11 38 Z" fill="#4a3f7a"/>',
   fishtank:'<rect x="5" y="12" width="34" height="22" rx="2" fill="#aee6ff" stroke="#4a3f7a" stroke-width="2"/><path d="M14 24 L20 20 L20 28 Z" fill="#ff9f43"/><ellipse cx="22" cy="24" rx="5" ry="3.5" fill="#ff9f43"/><circle cx="24" cy="23" r="1" fill="#2b2350"/><path d="M30 34 Q29 26 32 22 M34 34 Q35 28 33 24" stroke="#5fae53" stroke-width="2" fill="none"/><rect x="5" y="34" width="34" height="4" fill="#4a3f7a"/>',
   kite:'<path d="M22 4 L33 17 L22 30 L11 17 Z" fill="#ff6b6b"/><path d="M22 4 L22 30 M11 17 L33 17" stroke="#ffffff" stroke-width="1.5"/><path d="M22 30 Q18 34 22 37 Q26 40 22 43" stroke="#2b2350" stroke-width="1.5" fill="none"/><path d="M19 34 L23 33 L20 37 Z" fill="#ffd158"/>'
  };
  var NEW_ITEMS=[
   {id:'vase',       name:'Flower Vase',  cat:'decor',     zone:'floor',style:'fancy',  p:{c:35}},
   {id:'goldmirror', name:'Gold Mirror',  cat:'decor',     zone:'wall', style:'fancy',  p:{c:55}},
   {id:'velvetchair',name:'Velvet Chair', cat:'furniture', zone:'floor',style:'fancy',  p:{c:65}},
   {id:'trophy',     name:'Gold Trophy',  cat:'decor',     zone:'floor',style:'fancy',  p:{c:45}},
   {id:'guitar',     name:'Guitar',       cat:'furniture', zone:'floor',style:'music',  p:{c:50}},
   {id:'recordwall', name:'Gold Record',  cat:'decor',     zone:'wall', style:'music',  p:{c:45}},
   {id:'jukebox',    name:'Jukebox',      cat:'furniture', zone:'floor',style:'music',  p:{c:85}},
   {id:'lavalamp',   name:'Lava Lamp',    cat:'furniture', zone:'floor',style:'cool',   p:{c:30}},
   {id:'fishtank',   name:'Fish Tank',    cat:'furniture', zone:'floor',style:'natural',p:{c:60}},
   {id:'kite',       name:'Kite',         cat:'decor',     zone:'wall', style:'playful',p:{c:25}}
  ];
  Object.keys(NEW_ART).forEach(function(k){ if(!ART[k])ART[k]=NEW_ART[k]; });
  NEW_ITEMS.forEach(function(it){ if(!BYID[it.id]){ BYID[it.id]=it; /* keep themes last in the list so the shop grid stays grouped */ var ti=-1; for(var i=0;i<ITEMS.length;i++){ if(ITEMS[i].cat==='theme'){ ti=i; break; } } if(ti<0)ITEMS.push(it); else ITEMS.splice(ti,0,it); } });

  /* ---------- tastes ---------- */
  var STYLES={
   cozy:   {nm:'COZY',   def:'soft, warm and comfy',            col:'#ff9f6b'},
   natural:{nm:'NATURAL',def:'plants, wood and the outdoors',   col:'#7dd87a'},
   cool:   {nm:'COOL',   def:'techy, sleek and modern',         col:'#5bbfe6'},
   fancy:  {nm:'FANCY',  def:'shiny, gold and extra special',   col:'#e8c55a'},
   playful:{nm:'PLAYFUL',def:'bright, silly and fun',           col:'#ff8ac0'},
   music:  {nm:'MUSIC',  def:'instruments, records and notes',  col:'#c58dff'}
  };
  window.NB_STYLES=STYLES;
  var KEYS={
   natural:['corn','farm','river','mountain','trail','garden','lake','fishing','canyon','peak','rock','sky','prairie','ocean','wave','peach','rain','geyser','aurora','country','tide','glacier','sea','sail','plant','horse'],
   cozy:['pizza','cheese','syrup','milkshake','gumbo','seafood','quiet','warm','night','food','curds','crab','pancake','story','stories','cozy','deep-dish'],
   cool:['tech','gadget','car','grid','light','machine','clock','dice','random','volume','zero','experiment','unknown','synth','sample','thermometer','map','odometer','road'],
   fancy:['librar','history','gem','sparkl','mansion','ledger','change','diamond','first','bell','harmony','balanc','tidy','old'],
   playful:['hop','flip','spin','skate','fun','guess','surprise','trip','jar','glid','conga','loud','punk','fast','ranks'],
   music:['jazz','blues','drum','fiddle','banjo','solo','choir','brass','harmonica','bass','riff','hip-hop','beat','vocal','song','chime','guitar','fife','reel','tone','record','note','band','horn','music']
  };
  var ORDER=['natural','cozy','cool','fancy','playful','music'];
  function hsh(s){ var n=0; s=String(s); for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))>>>0; return n; }
  function likesOf(id){ try{ var h=(typeof HOME==='function')?HOME(id):null; if(h&&h.likes&&h.likes.length)return h.likes; }catch(e){} return []; }
  var TASTE_CACHE={};
  function taste(id){ if(TASTE_CACHE[id])return TASTE_CACHE[id];
    var txt=likesOf(id).join(' ').toLowerCase(); var best=null,bn=0;
    ORDER.forEach(function(st){ var n=0; KEYS[st].forEach(function(k){ if(txt.indexOf(k)>=0)n++; }); if(st==='music')n-=0.5; if(n>bn){ bn=n; best=st; } });
    if(!best)best=ORDER[hsh(id)%ORDER.length];
    TASTE_CACHE[id]=best; return best; }
  window.nbTaste=taste;

  /* ---------- buildings ---------- */
  function regionOf(id){ try{ var h=MEMBER_HOME[id]; var r=h&&roadInfo(h.st); return r?r.r:''; }catch(e){ return ''; } }
  function residentsAll(){ var ids=[]; try{ ids=Object.keys(MEMBER_HOME); }catch(e){} return ids; }
  function byRegion(r){ return residentsAll().filter(function(id){ return regionOf(id)===r; }).sort(); }
  var BUILDINGS=[
   {id:'lakeview', nm:'Lakeview Flats',  region:'Midwest',   part:0, col:'#7ad9ff', tg:'MIDWEST',   host:'oompa', blurb:'Great Lakes neighbors, first half of the Midwest.'},
   {id:'prairie',  nm:'Prairie House',   region:'Midwest',   part:1, col:'#ffcf6b', tg:'MIDWEST',   host:'maple', blurb:'Wide-open plains neighbors, the rest of the Midwest.'},
   {id:'harbor',   nm:'Harbor House',    region:'Northeast', part:-1,col:'#8fd0ff', tg:'NORTHEAST', host:'della', blurb:'Neighbors from the old harbor states up north and east.'},
   {id:'magnolia', nm:'Magnolia Court',  region:'Southeast', part:-1,col:'#ff9ec4', tg:'SOUTHEAST', host:'bibi',  blurb:'Neighbors from the warm Southeast.'},
   {id:'lonestar', nm:'Lone Star Lofts', region:'South',     part:-1,col:'#ff9f43', tg:'SOUTH',     host:'cadence',blurb:'Neighbors from the big South and Southwest.'},
   {id:'canyon',   nm:'Canyon Lofts',    region:'West',      part:-1,col:'#c58dff', tg:'WEST',      host:'harper',blurb:'Mountain, desert and coast neighbors out West.'}
  ];
  var BBY={}; BUILDINGS.forEach(function(b){ BBY[b.id]=b; });
  function residents(bid){ var b=BBY[bid]; if(!b)return []; var all=byRegion(b.region); if(b.part<0)return all; var half=Math.ceil(all.length/2); return b.part===0?all.slice(0,half):all.slice(half); }
  function buildingOf(id){ for(var i=0;i<BUILDINGS.length;i++){ if(residents(BUILDINGS[i].id).indexOf(id)>=0)return BUILDINGS[i]; } return null; }
  window.nbResidents=residents; window.nbBuildingOf=buildingOf; window.NB_BUILDINGS=BUILDINGS;

  /* ---------- state ---------- */
  function NB(){ if(typeof S==='undefined'||!S)return {rooms:{},tier:{},gifts:0};
    if(!S.nb||typeof S.nb!=='object')S.nb={};
    if(!S.nb.rooms||typeof S.nb.rooms!=='object')S.nb.rooms={};
    if(!S.nb.tier||typeof S.nb.tier!=='object')S.nb.tier={};
    if(typeof S.nb.gifts!=='number')S.nb.gifts=0;
    if(!S.inv||typeof S.inv!=='object')S.inv={};
    return S.nb; }
  (function(){ if(typeof load==='function'){ var _l=load; window.load=load=function(){ _l(); try{NB();}catch(e){} }; } })();
  try{ NB(); }catch(e){}
  function styleItems(st,zone){ return ITEMS.filter(function(it){ return it.cat!=='theme'&&it.style===st&&(!zone||it.zone===zone)&&it.p&&it.p.c; }); }
  function room(id){ var nb=NB(); var r=nb.rooms[id];
    if(!r||typeof r!=='object'||!Array.isArray(r.placed)){
      var t=taste(id), n=hsh(id);
      var fl=styleItems(t,'floor'), wl=styleItems(t,'wall');
      var placed=[]; if(fl.length)placed.push({id:fl[n%fl.length].id,zone:'floor',slot:7,g:false});
      if(wl.length)placed.push({id:wl[(n>>3)%wl.length].id,zone:'wall',slot:2,g:false});
      else if(fl.length>1)placed.push({id:fl[(n%fl.length+1+((n>>3)%(fl.length-1)))%fl.length].id,zone:'floor',slot:12,g:false});
      r=nb.rooms[id]={placed:placed,floor:'floor_wood',wall:'wall_cream'}; }
    if(!r.floor)r.floor='floor_wood'; if(!r.wall)r.wall='wall_cream';
    return r; }
  window.nbRoom=room;
  function itemPts(id,it){ return it&&it.style===taste(id)?2:1; }
  function themeStyle(tid){ var it=BYID[tid]; return it?it.style:''; }
  function points(id){ var r=room(id), t=taste(id), p=0;
    r.placed.forEach(function(x){ p+=itemPts(id,BYID[x.id]); });
    if(themeStyle(r.floor)===t)p+=3; if(themeStyle(r.wall)===t)p+=3;
    return p; }
  var TIERS=[{at:0,nm:'Bare',h:0},{at:8,nm:'Homey',h:1,c:30,n:10},{at:14,nm:'Lovely',h:2,c:60,n:15},{at:22,nm:'Dream Home',h:3,c:100,n:25,g:1}];
  function tierOf(p){ var t=0; for(var i=0;i<TIERS.length;i++)if(p>=TIERS[i].at)t=i; return t; }
  window.nbPoints=points; window.nbTierOf=tierOf; window.NB_TIERS=TIERS;
  function hearts(t){ var s=''; for(var i=1;i<=3;i++)s+=(i<=t?'❤️':'♡'); return s; }
  function nm(id){ try{ return (typeof citName==='function')?citName(id):id; }catch(e){ return id; } }
  function svg(id,sz){ try{ if(typeof citSvg==='function')return citSvg(id,sz); if(typeof memberSVG==='function')return memberSVG(id,sz); }catch(e){} return ''; }
  function isMet(id){ try{ return !!((S.friends&&S.friends.met&&S.friends.met[id])||(S.band&&S.band[id])); }catch(e){ return false; } }
  function markMet(id){ try{ if(!S.friends)S.friends={met:{}}; if(!S.friends.met)S.friends.met={}; var first=!S.friends.met[id]; S.friends.met[id]=true; if(typeof save==='function')save(); return first; }catch(e){ return false; } }
  function spare(itemId){ var have=(S.inv&&S.inv[itemId])||0; var used=((S.home&&S.home.placed)||[]).filter(function(x){ return x.id===itemId; }).length; return have-used; }
  function art(id,sz){ return (typeof itemArt==='function')?itemArt(id,sz):''; }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function sv(){ try{ if(typeof save==='function')save(); }catch(e){} }
  function tap(){ try{ if(typeof sTap==='function')sTap(); }catch(e){} }
  function tst(m){ try{ if(typeof toast==='function')toast(m); }catch(e){} }
  var THEME_BG={floor_wood:'#e9c49a',floor_checker:'#dff1ff',floor_grass:'#9fe08f',floor_star:'#2b2350',wall_cream:'#fff6e6',wall_blue:'#d6ecff',wall_stripe:'#ffefd6',wall_music:'#efe6ff'};
  function tasteChip(id,big){ var st=STYLES[taste(id)]; return '<span class="nb-taste" style="--c:'+st.col+(big?';font-size:13px':'')+'">'+st.nm+'</span>'; }

  /* ---------- tier check + rewards ---------- */
  function checkTier(id,quiet){ var nb=NB(); var t=tierOf(points(id)); var had=nb.tier[id]||0; if(t<=had)return false;
    nb.tier[id]=t; var c=0,n=0,g=0; for(var i=had+1;i<=t;i++){ c+=TIERS[i].c||0; n+=TIERS[i].n||0; g+=TIERS[i].g||0; }
    try{ if(c&&typeof addCoins==='function')addCoins(c); if(n&&typeof addNotes==='function')addNotes(n); if(g&&typeof addGold==='function')addGold(g); }catch(e){}
    sv(); if(quiet)return true;
    try{ if(typeof confetti==='function')confetti(); }catch(e){}
    try{ modal('<div class="center">'+svg(id,90)+'<h2 style="margin:4px 0 0">'+hearts(t)+' '+TIERS[t].nm+'!</h2></div>'
      +'<div class="speak center"><b>'+esc(nm(id))+':</b> '+(t>=3?'This is my DREAM HOME. I never want to leave. Thank you, thank you!':(t===2?'My place feels so lovely now. You really get me.':'It finally feels like home in here!'))+'</div>'
      +'<div class="sub center" style="color:#7dff8a">+💰 '+c+' coins, +'+n+' 🎵'+(g?', +'+g+' 🌟':'')+'</div>'
      +'<button class="btn wide" onclick="closeModal()">Yay!</button>'); }catch(e){}
    return true; }
  window.nbCheckTier=checkTier;

  /* ---------- extension points (v1.42 wraps these) ---------- */
  window.nbRoomTop=function(id){ return ''; };
  window.nbDoorBadge=function(id){ return ''; };
  window.nbOnPlace=function(id,itemId){ };

  /* ---------- BUILDING screen ---------- */
  var CUR_B=null;
  window.openBuilding=function(bid){ tap(); NB(); var b=BBY[bid]; if(!b)return; CUR_B=bid;
    zScr('scr-nbb','nbbScore','nbbBody','Knock on any door to visit. Everyone here is from the '+b.region+'. A clipboard on a door means an errand, a star means a full wishlist.');
    nbbRender(); if(typeof show==='function')show('scr-nbb'); var s=document.getElementById('scr-nbb'); if(s)s.scrollTop=0; };
  function buildingArt(b){ var w=''; for(var r=0;r<3;r++)for(var c=0;c<4;c++)w+='<rect x="'+(18+c*22)+'" y="'+(24+r*20)+'" width="12" height="11" rx="2" fill="'+((r+c)%3===0?'#ffe6a0':'#2b2350')+'"/>';
    return '<svg viewBox="0 0 120 100" width="120" height="100" style="display:block;margin:0 auto"><rect x="8" y="14" width="104" height="84" rx="6" fill="'+b.col+'"/><rect x="4" y="8" width="112" height="10" rx="3" fill="#2b2350"/>'+w+'<rect x="50" y="80" width="20" height="18" rx="3" fill="#2b2350"/><circle cx="66" cy="89" r="1.6" fill="#ffd158"/></svg>'; }
  window.nbbRender=function(){ var body=document.getElementById('nbbBody'); if(!body)return; var b=BBY[CUR_B]; if(!b)return; NB();
    var ids=residents(b.id); var dream=ids.filter(function(id){ return (S.nb.tier[id]||0)>=3; }).length; var metN=ids.filter(isMet).length;
    var sc=document.getElementById('nbbScore'); if(sc)sc.textContent='🚪 '+metN+'/'+ids.length+' met · ❤️ '+dream+' dream homes';
    var states={}; ids.forEach(function(id){ try{ states[MEMBER_HOME[id].st]=1; }catch(e){} });
    var html='<div class="center">'+buildingArt(b)+'<h2 style="margin:4px 0 0">'+esc(b.nm)+'</h2><div class="sub" style="margin:2px 0 4px">'+esc(b.blurb)+'</div>'
      +'<div class="sub" style="margin:0 0 6px;font-size:11px">Home states: '+Object.keys(states).sort().join(', ')+'</div></div>';
    html+='<div class="nb-doors">'+ids.map(function(id){ var met=isMet(id); var t=S.nb.tier[id]||0; var badge=''; try{ badge=window.nbDoorBadge(id)||''; }catch(e){}
      return '<div class="nb-door'+(met?'':' no')+'" onclick="nbVisit(\''+id+'\')"><div class="nb-dnum">'+(ids.indexOf(id)+101)+'</div>'+svg(id,46)
        +'<div class="n">'+(met?esc(nm(id)):'???')+'</div><div class="h">'+(met?hearts(t):'knock!')+'</div>'+(met?tasteChip(id):'')+badge+'</div>'; }).join('')+'</div>';
    body.innerHTML=html; };

  /* ---------- ROOM screen ---------- */
  var CUR=null, RTAB='room', RSEL=null;
  window.nbVisit=function(id){ tap(); NB(); if(!MEMBER_HOME[id])return; CUR=id; RTAB='room'; RSEL=null;
    var b=buildingOf(id); if(b)CUR_B=b.id;
    var first=markMet(id); room(id); sv();
    zScr('scr-nbroom','nbrScore','nbrBody','Give them things from your Stuff and paint their floor and wall. Things that match their TASTE make them happiest.');
    try{ var bk=document.querySelector('#scr-nbroom .wow-top .btn'); if(bk){ bk.textContent='← Building'; bk.setAttribute('onclick','nbBackToBuilding()'); } }catch(e){}
    nbrRender(); if(typeof show==='function')show('scr-nbroom'); var s=document.getElementById('scr-nbroom'); if(s)s.scrollTop=0;
    if(first)tst('You met '+nm(id)+'! Knock knock.'); };
  window.nbBackToBuilding=function(){ tap(); if(CUR_B)openBuilding(CUR_B); else if(typeof openTown==='function')openTown(); };
  window.nbTab=function(t){ tap(); RTAB=t; RSEL=null; nbrRender(); };
  function roomGrid(id){ var r=room(id); var by={}; r.placed.forEach(function(p){ by[p.zone+':'+p.slot]=p; });
    var s='<div class="room"><div class="room-wall" style="background:'+(THEME_BG[r.wall]||'#eee')+'">';
    for(var i=0;i<5;i++){ var p=by['wall:'+i]; s+='<div class="rslot wall'+(p?' full':'')+(p&&p.g?' gift':'')+'" onclick="nbSlot(\'wall\','+i+')">'+(p?art(p.id,40):'')+'</div>'; }
    s+='</div><div class="room-floor" style="background:'+(THEME_BG[r.floor]||'#eee')+'">';
    for(var j=0;j<15;j++){ var q=by['floor:'+j]; s+='<div class="rslot'+(q?' full':'')+(q&&q.g?' gift':'')+'" onclick="nbSlot(\'floor\','+j+')">'+(q?art(q.id,38):'')+'</div>'; }
    return s+'</div></div>'; }
  window.nbrRender=function(){ var body=document.getElementById('nbrBody'); if(!body||!CUR)return; var id=CUR; NB();
    var p=points(id), t=tierOf(p), st=STYLES[taste(id)], nxt=TIERS[t+1];
    var sc=document.getElementById('nbrScore'); if(sc)sc.textContent='💰 '+((S&&S.coins)||0)+' · '+hearts(t);
    var b=buildingOf(id); var h=null; try{ h=HOME(id); }catch(e){}
    var html='<div class="center">'+svg(id,76)+'<h2 style="margin:2px 0 0">'+esc(nm(id))+'’s place</h2>'
      +'<div class="sub" style="margin:2px 0 4px">'+(b?esc(b.nm)+' · ':'')+(h?'from '+esc(h.st):'')+'</div></div>';
    html+='<div class="nb-info"><div>Loves '+tasteChip(id,true)+' things: <b>'+st.def+'</b>.</div>'
      +'<div class="nb-meter"><div class="nb-mfill" style="width:'+Math.min(100,Math.round(p/22*100))+'%;background:'+st.col+'"></div></div>'
      +'<div style="font-size:12px;color:#e9e2ff">'+hearts(t)+' <b>'+TIERS[t].nm+'</b> · '+p+' happy points'+(nxt?' · '+(nxt.at-p)+' more for <b>'+nxt.nm+'</b>':' · the best it gets!')+'</div></div>';
    try{ html+=window.nbRoomTop(id)||''; }catch(e){}
    html+='<div class="ap-tabs"><button class="btn ghost small'+(RTAB==='room'?' sel':'')+'" onclick="nbTab(\'room\')">🏠 Room</button>'
      +'<button class="btn ghost small'+(RTAB==='give'?' sel':'')+'" onclick="nbTab(\'give\')">🎁 Give a gift</button>'
      +'<button class="btn ghost small'+(RTAB==='paint'?' sel':'')+'" onclick="nbTab(\'paint\')">🎨 Paint</button></div>';
    var hint=RSEL?('Tap a '+(BYID[RSEL].zone==='wall'?'wall':'floor')+' spot to give the '+BYID[RSEL].name+'.'):'Gold outline = a gift from you. Tap one to ask for it back.';
    html+='<div class="sub center" style="margin:2px 0">'+hint+'</div>'+roomGrid(id);
    if(RTAB==='give'){
      var mine=ITEMS.filter(function(it){ return it.cat!=='theme'&&spare(it.id)>0; });
      if(!mine.length)html+='<div class="speak center">You have no spare things to give. Buy some at <b>Cozy Home</b> or the <b>Corner Store</b> (things in your own apartment stay there).</div>';
      else { mine.sort(function(a,b){ return (b.style===taste(id))-(a.style===taste(id)); });
        html+='<div class="st-grid">'+mine.map(function(it){ var match=it.style===taste(id);
          return '<div class="st-card'+(RSEL===it.id?' sel':'')+'" onclick="nbPick(\''+it.id+'\')"><div class="st-art">'+art(it.id,44)+'</div><div class="st-nm">'+esc(it.name)+'</div>'
            +'<div class="sub">'+(match?'<b style="color:#7dff8a">✓ '+STYLES[it.style].nm+'</b>':esc(it.style))+' · x'+spare(it.id)+'</div></div>'; }).join('')+'</div>'; }
    } else if(RTAB==='paint'){
      var owned=((S.home&&S.home.themes)||['floor_wood','wall_cream']);
      var themes=['floor_wood','wall_cream'].concat(ITEMS.filter(function(it){ return it.cat==='theme'; }).map(function(it){ return it.id; }));
      var r=room(id);
      html+='<div class="sub center" style="margin-top:6px">Themes you own. Painting does not use them up.</div><div class="st-grid">'+themes.map(function(tid){ var it=BYID[tid]; var sub=(it&&it.sub)||(tid.indexOf('floor')===0?'floor':'wall'); var name=it?it.name:(tid==='floor_wood'?'Wood Floor':'Cream Wall');
        var on=r[sub]===tid, has=owned.indexOf(tid)>=0, match=it&&it.style===taste(id);
        var btn=on?'<div class="st-own">✓ On</div>':(has?'<button class="btn small" onclick="nbPaint(\''+tid+'\',\''+sub+'\')">Use</button>':'<div class="sub">buy at Corner Store</div>');
        return '<div class="st-card"><div class="st-art">'+art(tid,46)+'</div><div class="st-nm">'+esc(name)+'</div>'+(match?'<div class="sub"><b style="color:#7dff8a">✓ '+STYLES[taste(id)].nm+'</b></div>':'')+btn+'</div>'; }).join('')+'</div>';
    } else {
      html+='<div class="sub center">Tap Give a gift to bring them something. Tap Paint to change their floor and wall.</div>';
    }
    html+='<div class="z-pick"><button class="btn ghost" onclick="try{citizenCard(\''+id+'\')}catch(e){}">📇 Card</button><button class="btn ghost" onclick="nbBackToBuilding()">🚪 Hallway</button></div>';
    body.innerHTML=html; };
  window.nbPick=function(itemId){ tap(); RSEL=(RSEL===itemId?null:itemId); nbrRender(); if(RSEL){ var g=document.querySelector('#nbrBody .room'); if(g&&g.scrollIntoView)try{ g.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){} } };
  function reactLine(id,it){ var match=it.style===taste(id); var st=STYLES[taste(id)];
    return match?('I LOVE it! A '+it.name+' is so '+st.nm.toLowerCase()+'!'):('Oh, thank you! It is not really my style. I like '+st.nm.toLowerCase()+' things, but it is sweet of you.'); }
  window.nbSlot=function(zone,slot){ if(!CUR)return; var id=CUR, r=room(id);
    var ex=r.placed.filter(function(p){ return p.zone===zone&&p.slot===slot; })[0];
    if(ex){ var it=BYID[ex.id]; if(!ex.g){ tst('That is '+nm(id)+'’s own '+(it?it.name:'thing')+'.'); return; }
      try{ modal('<div class="center">'+art(ex.id,64)+'<h3>Ask for the '+esc(it?it.name:'gift')+' back?</h3></div><div class="speak center">It goes back into your Stuff.</div><div class="z-pick"><button class="btn" onclick="closeModal();nbTakeBack(\''+zone+'\','+slot+')">Yes, take it back</button><button class="btn ghost" onclick="closeModal()">No, keep it here</button></div>'); }catch(e){}
      return; }
    if(!RSEL){ tst('Pick something in "Give a gift" first.'); return; }
    var itm=BYID[RSEL]; if(!itm)return;
    if(itm.zone!==zone){ tst(itm.zone==='wall'?'That goes on the wall':'That goes on the floor'); return; }
    if(spare(RSEL)<=0){ RSEL=null; nbrRender(); return; }
    tap(); S.inv[RSEL]=(S.inv[RSEL]||0)-1; if(S.inv[RSEL]<=0)delete S.inv[RSEL];
    r.placed.push({id:RSEL,zone:zone,slot:slot,g:true}); S.nb.gifts++;
    var placedId=RSEL; if(spare(RSEL)<=0)RSEL=null;
    if(itm.style===taste(id)){ try{ if(typeof addNotes==='function')addNotes(2); }catch(e){} try{ if(typeof sCorrect==='function')sCorrect(); }catch(e){} }
    sv(); tst(nm(id)+': '+reactLine(id,itm)); try{ window.nbOnPlace(id,placedId); }catch(e){}
    nbrRender(); checkTier(id); };
  window.nbTakeBack=function(zone,slot){ if(!CUR)return; var r=room(CUR); var ex=r.placed.filter(function(p){ return p.zone===zone&&p.slot===slot&&p.g; })[0]; if(!ex)return;
    r.placed=r.placed.filter(function(p){ return p!==ex; }); S.inv[ex.id]=(S.inv[ex.id]||0)+1; sv(); tst('Back in your Stuff.'); nbrRender(); };
  window.nbPaint=function(tid,sub){ if(!CUR)return; tap(); var owned=((S.home&&S.home.themes)||['floor_wood','wall_cream']); if(owned.indexOf(tid)<0)return;
    var r=room(CUR); r[sub]=tid; sv(); var it=BYID[tid];
    if(it&&it.style===taste(CUR))tst(nm(CUR)+': Ooh, that '+sub+' is SO my style!'); else tst(nm(CUR)+': A new '+sub+'! Thanks.');
    nbrRender(); checkTier(CUR); };

  /* ---------- CSS ---------- */
  (function(){ if(document.getElementById('nbCSS'))return; var st=document.createElement('style'); st.id='nbCSS'; st.textContent=
     '.nb-doors{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin:8px 0}'
    +'.nb-door{position:relative;background:#160f33;border:2px solid #4a3d84;border-radius:12px 12px 6px 6px;padding:16px 6px 8px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:transform .08s}'
    +'.nb-door:active{transform:scale(.96)}'
    +'.nb-door.no{opacity:.75;border-style:dashed}'
    +'.nb-door .n{font-weight:800;font-size:13px;line-height:1.1}'
    +'.nb-door .h{font-size:12px;letter-spacing:1px}'
    +'.nb-dnum{position:absolute;top:3px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:900;color:#ffd158;background:#2b2350;border-radius:6px;padding:0 6px}'
    +'.nb-taste{display:inline-block;font-size:10px;font-weight:900;letter-spacing:.6px;color:#141028;background:var(--c);border-radius:999px;padding:2px 8px}'
    +'.nb-info{background:#160f33;border:1px solid #2b2350;border-radius:14px;padding:10px 12px;margin:6px 0;font-size:14px;line-height:1.5;text-align:left}'
    +'.nb-meter{height:10px;background:#241c48;border-radius:6px;overflow:hidden;margin:6px 0 4px}'
    +'.nb-mfill{height:100%;border-radius:6px;transition:width .3s}'
    +'.rslot.gift{border-color:#e8a800!important;box-shadow:inset 0 0 0 2px #ffd158}'
    +'.nb-star{position:absolute;top:2px;right:4px;font-size:14px}';
    document.head.appendChild(st); })();

  /* ---------- the map: three HOMES districts ---------- */
  (function(){ var _tp=townPlan; window.townPlan=townPlan=function(){ var rows=_tp();
    try{ if(!rows.some(function(r){ return r.name==='MIDWEST HOMES'; })){
      var ty=2400;
      function slot(bid){ var b=BBY[bid]; var ids=residents(bid); var met=0; try{ met=ids.filter(isMet).length; }catch(e){}
        return {col:b.col,tg:b.tg,nm:b.nm,host:b.host,prog:met+'/'+ids.length+' neighbors met',go:'nb:'+bid}; }
      rows.push({y:ty,     name:'MIDWEST HOMES',     sub:'apartments · visit your neighbors',color:'#7ad9ff',slots:[slot('lakeview'),slot('prairie')]});
      rows.push({y:ty+220, name:'EAST COAST HOMES',  sub:'apartments · Northeast & Southeast',color:'#ff9ec4',slots:[slot('harbor'),slot('magnolia')]});
      rows.push({y:ty+440, name:'SOUTH & WEST HOMES',sub:'apartments · South & West',color:'#c58dff',slots:[slot('lonestar'),slot('canyon')]});
    } }catch(e){ try{ window.__muErr&&window.__muErr('townPlan(homes)',e); }catch(_){} }
    return rows; }; })();
  (function(){ var _tg=townGo; window.townGo=townGo=function(dest){ if(typeof dest==='string'&&dest.indexOf('nb:')===0){ openBuilding(dest.slice(3)); return; } return _tg.apply(this,arguments); }; })();

  /* ---------- citizen card: visit their home ---------- */
  (function(){ if(typeof citizenCard!=='function')return; var _cc=citizenCard; window.citizenCard=citizenCard=function(id){ var r=_cc.apply(this,arguments);
    try{ if(!MEMBER_HOME[id])return r; var box=document.getElementById('mbox'); if(!box)return r; var btns=box.querySelectorAll('button'); var last=btns[btns.length-1]; if(!last)return r;
      var b=document.createElement('button'); b.className='btn wide'; var bd=buildingOf(id); b.innerHTML='🏠 Visit their home'+(bd?' · '+bd.nm:''); b.onclick=function(){ try{ closeModal(); }catch(e){} nbVisit(id); }; last.parentNode.insertBefore(b,last); }catch(e){}
    return r; }; })();

  if(window.BQ)try{ Object.assign(window.BQ,{openBuilding:window.openBuilding,nbVisit:window.nbVisit,nbTaste:taste,nbRoom:room,nbPoints:points}); }catch(e){}
})();
