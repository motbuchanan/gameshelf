/* ================= v1.42 · ERRANDS, TRADES & WISHLISTS (Oct 6 2026) =================
   Phase 3 of the Animal-Crossing layer, built on v1.41 Neighbors. Adds:
     - ERRANDS & SWAPS district (beside Downtown) with two places:
       Gus's ERRAND BOARD: three errands a day.
         FETCH  "Fern wants a Little Plant." Buy or find one, walk it to her door, hand it over. It goes into her room.
         TRADE  a three-step courier job between two neighbors: pick up A's thing, carry it to B, carry B's thing back
                to A. Teaches doing steps in order. Both things end up in the right rooms.
         Do all three in a day for a bonus gold.
       Flip's SWAP MEET: three swap offers a day ("your Pink Stool for my Drum Kit"). Before swapping, Garrett calls
         it: GOOD DEAL or BAD DEAL, by comparing what each thing is worth (number comparison). Calling it right pays.
     - WISHLISTS: every neighbor wants three specific things (mostly their taste). The list shows in their room; fill
       it (gifts or errands both count) for a big one-time reward, and their door gets a star.
     - Hooks into the existing systems: errands run through neighbors' rooms (v1.41 nbRoomTop), the Square's daily
       quest asks for an errand on Sundays (wkMark 'errand'), and a one-time What's New card introduces it all.
   State: S.er {day, board[], carry, allDay, done, wishDone{}, swap{day,offers[]}, deals}. Additive, audio-safe,
   no em dashes, literal hex. */
(function(){
  if(typeof document==='undefined')return;
  if(typeof window.nbVisit!=='function'||!window.TOWN_ITEMS||!window.TOWN_BYID)return;
  var ITEMS=window.TOWN_ITEMS, BYID=window.TOWN_BYID;

  /* ---------- helpers ---------- */
  function hsh(s){ var n=0; s=String(s); for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))>>>0; return n; }
  function rng(seed){ var x=hsh(seed)||1; return function(){ x^=x<<13; x>>>=0; x^=x>>>17; x^=x<<5; x>>>=0; return (x>>>0)/4294967296; }; }
  function day(){ return (typeof ctDay==='function')?ctDay():new Date().toDateString(); }
  function nm(id){ try{ return (typeof citName==='function')?citName(id):id; }catch(e){ return id; } }
  function svg(id,sz){ try{ if(typeof citSvg==='function')return citSvg(id,sz); }catch(e){} return ''; }
  function art(id,sz){ return (typeof itemArt==='function')?itemArt(id,sz):''; }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function sv(){ try{ if(typeof save==='function')save(); }catch(e){} }
  function tap(){ try{ if(typeof sTap==='function')sTap(); }catch(e){} }
  function tst(m){ try{ if(typeof toast==='function')toast(m); }catch(e){} }
  function party(){ try{ if(typeof confetti==='function')confetti(); }catch(e){} }
  function coins(n){ try{ if(n&&typeof addCoins==='function')addCoins(n); }catch(e){} }
  function notes(n){ try{ if(n&&typeof addNotes==='function')addNotes(n); }catch(e){} }
  function gold(n){ try{ if(n&&typeof addGold==='function')addGold(n); }catch(e){} }
  function spare(itemId){ var have=(S.inv&&S.inv[itemId])||0; var used=((S.home&&S.home.placed)||[]).filter(function(x){ return x.id===itemId; }).length; return have-used; }
  function worth(it){ if(!it||!it.p)return 0; return it.p.c||it.p.n||((it.p.g||0)*30)||0; }
  function priceTxt(it){ return it.p.c?('💰 '+it.p.c):(it.p.n?('🎵 '+it.p.n):('📀 '+it.p.g)); }
  function shopOf(it){ return it.cat==='furniture'?'Cozy Home':'the Corner Store'; }
  function taste(id){ return window.nbTaste(id); }
  function allRes(){ var out=[]; (window.NB_BUILDINGS||[]).forEach(function(b){ out=out.concat(window.nbResidents(b.id)); }); return out; }
  function isMet(id){ try{ return !!((S.friends&&S.friends.met&&S.friends.met[id])||(S.band&&S.band[id])); }catch(e){ return false; } }
  function where(id){ var b=window.nbBuildingOf(id); if(!b)return ''; var n=window.nbResidents(b.id).indexOf(id)+101; return b.nm+', door '+n; }
  function tasteItems(st){ return ITEMS.filter(function(it){ return it.cat!=='theme'&&it.style===st&&it.p&&it.p.c; }); }
  function goods(){ return ITEMS.filter(function(it){ return it.cat!=='theme'; }); }

  /* ---------- state ---------- */
  function ER(){ if(typeof S==='undefined'||!S)return {board:[],wishDone:{},swap:{offers:[]}};
    if(!S.er||typeof S.er!=='object')S.er={};
    var e=S.er; if(!Array.isArray(e.board))e.board=[]; if(typeof e.day!=='string')e.day='';
    if(!e.wishDone||typeof e.wishDone!=='object')e.wishDone={};
    if(!e.swap||typeof e.swap!=='object')e.swap={day:'',offers:[]}; if(!Array.isArray(e.swap.offers))e.swap.offers=[];
    if(typeof e.done!=='number')e.done=0; if(typeof e.deals!=='number')e.deals=0; if(typeof e.allDay!=='string')e.allDay='';
    if(e.carry===undefined)e.carry=null;
    return e; }
  (function(){ if(typeof load==='function'){ var _l=load; window.load=load=function(){ _l(); try{ER();}catch(e){} }; } })();
  try{ ER(); }catch(e){}

  /* ---------- the daily board ---------- */
  function pickPeople(r,n){ var pool=allRes(); var met=pool.filter(isMet); if(met.length>=5)pool=met; pool=pool.slice(); var out=[];
    while(out.length<n&&pool.length){ var i=Math.floor(r()*pool.length); out.push(pool.splice(i,1)[0]); } return out; }
  function pickItem(r,st,not){ var list=tasteItems(st).filter(function(it){ return it.p.c<=70&&(!not||not.indexOf(it.id)<0); }); if(!list.length)list=tasteItems(st); if(!list.length)list=goods(); return list[Math.floor(r()*list.length)].id; }
  function board(){ var e=ER(); var d=day();
    if(e.day!==d||!e.board.length){
      var r=rng('er'+d); var ppl=pickPeople(r,4);
      var b=[];
      if(ppl[0])b.push({k:'fetch',who:ppl[0],item:pickItem(r,taste(ppl[0])),done:false});
      if(ppl[1])b.push({k:'fetch',who:ppl[1],item:pickItem(r,taste(ppl[1])),done:false});
      if(ppl[2]&&ppl[3]){ var x=pickItem(r,taste(ppl[3])); var y=pickItem(r,taste(ppl[2]),[x]); b.push({k:'trade',a:ppl[2],b:ppl[3],x:x,y:y,step:0,done:false}); }
      e.day=d; e.board=b; if(e.carry&&e.carry.day!==d)e.carry=null; sv(); }
    return e.board; }
  window.erBoard=board;

  /* place a thing into a neighbor's room (errand deliveries are theirs to keep) */
  function placeInto(id,itemId){ var r=window.nbRoom(id); var it=BYID[itemId]; if(!it)return false; var zone=it.zone; var max=zone==='wall'?5:15;
    var used={}; r.placed.forEach(function(p){ if(p.zone===zone)used[p.slot]=1; });
    for(var s=0;s<max;s++){ if(!used[s]){ r.placed.push({id:itemId,zone:zone,slot:s,g:false}); return true; } }
    if(!Array.isArray(r.closet))r.closet=[]; r.closet.push(itemId); return false; }

  function errandDone(){ var e=ER(); e.done++; try{ if(typeof wkMark==='function')wkMark('errand'); }catch(x){}
    var all=board().every(function(q){ return q.done; });
    if(all&&e.allDay!==day()){ e.allDay=day(); gold(1); setTimeout(function(){ tst('All three errands done today! +1 🌟'); },1400); }
    sv(); }

  /* ---------- wishlists ---------- */
  function wishOf(id){ var r=rng('wish'+id); var st=taste(id); var mine=tasteItems(st); var out=[];
    var guard=0; while(out.length<2&&mine.length&&guard++<40){ var a=mine[Math.floor(r()*mine.length)].id; if(out.indexOf(a)<0)out.push(a); }
    var other=goods().filter(function(it){ return it.style!==st; }); guard=0;
    while(out.length<3&&guard++<40){ var b=other[Math.floor(r()*other.length)].id; if(out.indexOf(b)<0)out.push(b); }
    return out; }
  function wishHave(id){ var r=window.nbRoom(id); var ids=r.placed.map(function(p){ return p.id; }).concat(r.closet||[]); return wishOf(id).map(function(w){ return ids.indexOf(w)>=0; }); }
  function checkWish(id){ var e=ER(); if(e.wishDone[id])return false; if(!wishHave(id).every(Boolean))return false;
    e.wishDone[id]=true; coins(60); notes(15); gold(1); sv(); party();
    setTimeout(function(){ try{ modal('<div class="center">'+svg(id,90)+'<h2 style="margin:4px 0 0">⭐ Wishlist complete!</h2></div><div class="speak center"><b>'+esc(nm(id))+':</b> Every single thing I wished for! You are the best neighbor in town.</div><div class="sub center" style="color:#7dff8a">+💰 60 coins, +15 🎵, +1 🌟</div><button class="btn wide" onclick="closeModal()">Hooray!</button>'); }catch(x){} },500);
    return true; }
  window.erWishOf=wishOf; window.erCheckWish=checkWish;

  /* ---------- errand actions (done at the neighbor's door) ---------- */
  window.erGiveFetch=function(i){ var q=board()[i]; if(!q||q.k!=='fetch'||q.done)return; if(spare(q.item)<=0){ tst('You need a '+BYID[q.item].name+' first.'); return; }
    tap(); S.inv[q.item]--; if(S.inv[q.item]<=0)delete S.inv[q.item]; placeInto(q.who,q.item); q.done=true;
    var it=BYID[q.item]; var pay=(it.p.c||30)+15; coins(pay); notes(8); errandDone(); party();
    try{ modal('<div class="center">'+svg(q.who,84)+'<h2 style="margin:4px 0 0">📋 Errand done!</h2></div><div class="speak center"><b>'+esc(nm(q.who))+':</b> My very own '+esc(it.name)+'! Thank you so much. Here, this is for your trouble.</div><div class="sub center" style="color:#7dff8a">+💰 '+pay+' coins, +8 🎵</div><button class="btn wide" onclick="closeModal()">You are welcome!</button>'); }catch(x){}
    window.nbCheckTier(q.who,true); checkWish(q.who); refresh(); };
  window.erTradeStep=function(i){ var q=board()[i]; if(!q||q.k!=='trade'||q.done)return; var e=ER(); tap();
    if(q.step===0){ q.step=1; e.carry={day:day(),item:q.x,to:q.b}; sv(); tst(nm(q.a)+' handed you the '+BYID[q.x].name+'. Take it to '+nm(q.b)+'!'); }
    else if(q.step===1){ placeInto(q.b,q.x); q.step=2; e.carry={day:day(),item:q.y,to:q.a}; sv(); tst(nm(q.b)+' loves the '+BYID[q.x].name+' and gave you a '+BYID[q.y].name+' for '+nm(q.a)+'.'); window.nbCheckTier(q.b,true); checkWish(q.b); }
    else if(q.step===2){ placeInto(q.a,q.y); q.done=true; e.carry=null; coins(40); notes(12); errandDone(); party(); window.nbCheckTier(q.a,true); checkWish(q.a);
      try{ modal('<div class="center"><div class="row" style="justify-content:center;gap:6px">'+svg(q.a,64)+svg(q.b,64)+'</div><h2 style="margin:4px 0 0">🔁 Trade complete!</h2></div><div class="speak center">'+esc(nm(q.a))+' got the '+esc(BYID[q.y].name)+' and '+esc(nm(q.b))+' got the '+esc(BYID[q.x].name)+'. You did all three steps in order!</div><div class="sub center" style="color:#7dff8a">+💰 40 coins, +12 🎵</div><button class="btn wide" onclick="closeModal()">Nice!</button>'); }catch(x){} }
    refresh(); };
  function refresh(){ try{ var on=document.querySelector('.scr.on'); if(!on)return; if(on.id==='scr-nbroom'&&typeof nbrRender==='function')nbrRender(); if(on.id==='scr-erb')erbRender(); }catch(e){} }

  /* ---------- room banner: errands for this neighbor + their wishlist ---------- */
  (function(){ var _top=window.nbRoomTop; window.nbRoomTop=function(id){ var html=''; try{ html=_top(id)||''; }catch(e){}
    try{ var bd=board();
      bd.forEach(function(q,i){ if(q.done)return;
        if(q.k==='fetch'&&q.who===id){ var it=BYID[q.item]; var have=spare(q.item)>0;
          html+='<div class="er-ban"><div class="er-bt">📋 Errand</div><div class="er-row">'+art(q.item,40)+'<div>'+esc(nm(id))+' wants a <b>'+esc(it.name)+'</b>.'+(have?'':'<div class="sub" style="text-align:left;margin:0">You need one. Buy it at '+shopOf(it)+' ('+priceTxt(it)+').</div>')+'</div></div>'
            +(have?'<button class="btn wide" onclick="erGiveFetch('+i+')">🎁 Give the '+esc(it.name)+'</button>':'')+'</div>'; }
        if(q.k==='trade'){ var X=BYID[q.x], Y=BYID[q.y];
          if(q.step===0&&q.a===id)html+='<div class="er-ban"><div class="er-bt">🔁 Trade · step 1 of 3</div><div class="er-row">'+art(q.x,40)+'<div>'+esc(nm(id))+' wants to trade this <b>'+esc(X.name)+'</b> with '+esc(nm(q.b))+'.</div></div><button class="btn wide" onclick="erTradeStep('+i+')">🎒 Pick up the '+esc(X.name)+'</button></div>';
          else if(q.step===1&&q.a===id)html+='<div class="er-ban dim"><div class="er-bt">🔁 Trade · step 2 of 3</div>Now carry the '+esc(X.name)+' to '+esc(nm(q.b))+' at '+esc(where(q.b))+'.</div>';
          else if(q.step===1&&q.b===id)html+='<div class="er-ban"><div class="er-bt">🔁 Trade · step 2 of 3</div><div class="er-row">'+art(q.x,40)+'<div>Give '+esc(nm(id))+' the <b>'+esc(X.name)+'</b> from '+esc(nm(q.a))+'. You get a <b>'+esc(Y.name)+'</b> to carry back.</div></div><button class="btn wide" onclick="erTradeStep('+i+')">🔁 Swap it</button></div>';
          else if(q.step===2&&q.a===id)html+='<div class="er-ban"><div class="er-bt">🔁 Trade · step 3 of 3</div><div class="er-row">'+art(q.y,40)+'<div>Bring '+esc(nm(id))+' the <b>'+esc(Y.name)+'</b> from '+esc(nm(q.b))+'.</div></div><button class="btn wide" onclick="erTradeStep('+i+')">🎁 Hand it over</button></div>';
          else if(q.step===2&&q.b===id)html+='<div class="er-ban dim"><div class="er-bt">🔁 Trade · step 3 of 3</div>Now bring the '+esc(Y.name)+' back to '+esc(nm(q.a))+' at '+esc(where(q.a))+'.</div>'; }
      });
      var wl=wishOf(id), hv=wishHave(id), done=!!ER().wishDone[id];
      html+='<div class="er-wish"><div class="er-bt">⭐ '+esc(nm(id))+'’s wishlist'+(done?' · <span style="color:#7dff8a">complete!</span>':' · '+hv.filter(Boolean).length+'/3')+'</div><div class="er-wl">'
        +wl.map(function(w,k){ var it=BYID[w]; return '<div class="er-wi'+(hv[k]?' got':'')+'">'+art(w,34)+'<div class="n">'+(hv[k]?'✓ ':'')+esc(it.name)+'</div><div class="p">'+priceTxt(it)+'</div></div>'; }).join('')
        +'</div>'+(done?'':'<div class="sub" style="margin:2px 0 0">Put all three in their room for a big reward.</div>')+'</div>';
    }catch(e){ try{ window.__muErr&&window.__muErr('nbRoomTop(errands)',e); }catch(_){} }
    return html; }; })();
  (function(){ var _b=window.nbDoorBadge; window.nbDoorBadge=function(id){ var s=''; try{ s=_b(id)||''; }catch(e){} try{ if(ER().wishDone[id])s+='<div class="nb-star">⭐</div>'; else if(board().some(function(q){ return !q.done&&((q.k==='fetch'&&q.who===id)||(q.k==='trade'&&((q.step===0&&q.a===id)||(q.step===1&&q.b===id)||(q.step===2&&q.a===id)))); }))s+='<div class="nb-star">📋</div>'; }catch(e){} return s; }; })();
  (function(){ var _p=window.nbOnPlace; window.nbOnPlace=function(id,itemId){ try{ _p(id,itemId); }catch(e){} try{ checkWish(id); }catch(e){} }; })();

  /* ---------- ERRAND BOARD screen ---------- */
  window.openErrands=function(){ tap(); ER(); zScr('scr-erb','erbScore','erbBody','Three errands every day. Tap Go to walk to the right door, then do the errand there.'); erbRender(); if(typeof show==='function')show('scr-erb'); var s=document.getElementById('scr-erb'); if(s)s.scrollTop=0; };
  window.erGo=function(id){ window.nbVisit(id); };
  window.erbRender=function(){ var body=document.getElementById('erbBody'); if(!body)return; var e=ER(); var bd=board();
    var dn=bd.filter(function(q){ return q.done; }).length; var sc=document.getElementById('erbScore'); if(sc)sc.textContent='📋 '+dn+'/'+bd.length+' today · '+e.done+' all time';
    var html=(typeof zRoom==='function')?zRoom('gus','Gus’s Errand Board','Gus drives all over town and knows who needs what.'):'';
    if(e.carry&&e.carry.day===day()&&BYID[e.carry.item])html+='<div class="er-carry">🎒 Carrying: '+art(e.carry.item,30)+' <b>'+esc(BYID[e.carry.item].name)+'</b> for '+esc(nm(e.carry.to))+'</div>';
    bd.forEach(function(q,i){
      if(q.k==='fetch'){ var it=BYID[q.item]; var have=spare(q.item)>0;
        html+='<div class="er-card'+(q.done?' done':'')+'"><div class="er-row">'+svg(q.who,52)+'<div style="flex:1"><div class="er-t">📦 Fetch: '+esc(nm(q.who))+' wants a '+esc(it.name)+'</div><div class="sub" style="text-align:left;margin:2px 0">'+esc(where(q.who))+'</div>'
          +'<div class="sub" style="text-align:left;margin:0">'+(q.done?'<b style="color:#7dff8a">✓ Delivered!</b>':(have?'<b style="color:#7dff8a">You have one. Go deliver it!</b>':'Buy one at '+shopOf(it)+' ('+priceTxt(it)+'), then deliver it.'))+'</div></div>'+art(q.item,44)+'</div>'
          +(q.done?'':'<div class="z-pick">'+(have?'':'<button class="btn ghost" onclick="openStore(\''+(it.cat==='furniture'?'home':'gen')+'\')">🛒 Shop</button>')+'<button class="btn"'+(have?' style="grid-column:1/-1"':'')+' onclick="erGo(\''+q.who+'\')">🚶 Go to '+esc(nm(q.who))+'</button></div>')+'</div>'; }
      else { var X=BYID[q.x], Y=BYID[q.y];
        var steps=[
          {t:'Pick up the '+X.name+' from '+nm(q.a),who:q.a},
          {t:'Carry it to '+nm(q.b)+' and swap for a '+Y.name,who:q.b},
          {t:'Bring the '+Y.name+' back to '+nm(q.a),who:q.a}];
        html+='<div class="er-card'+(q.done?' done':'')+'"><div class="er-t">🔁 Trade between '+esc(nm(q.a))+' and '+esc(nm(q.b))+'</div><div class="row" style="justify-content:center;gap:6px;align-items:center;margin:4px 0">'+svg(q.a,46)+art(q.x,34)+'<span style="font-size:20px">⇄</span>'+art(q.y,34)+svg(q.b,46)+'</div>'
          +steps.map(function(s,k){ var st=q.done||k<q.step?'ok':(k===q.step?'now':'later'); return '<div class="er-step '+st+'"><span class="d">'+(st==='ok'?'✓':(k+1))+'</span>'+esc(s.t)+'</div>'; }).join('')
          +(q.done?'':'<button class="btn wide" onclick="erGo(\''+steps[q.step].who+'\')">🚶 Step '+(q.step+1)+': go to '+esc(nm(steps[q.step].who))+'</button>')+'</div>'; }
    });
    html+='<div class="sub center" style="margin-top:8px">'+(dn===bd.length?'All done today! New errands tomorrow.':'Finish all three today for a bonus 🌟.')+'</div>';
    html+='<div class="speak" style="text-align:left;font-size:14px">⭐ <b>Wishlists:</b> every neighbor wants three special things. Knock on their door to see their list. Fill one for 💰 60 + 🌟.</div>';
    body.innerHTML=html; };

  /* ---------- SWAP MEET ---------- */
  function swaps(){ var e=ER(); var d=day(); if(e.swap.day===d&&e.swap.offers.length)return e.swap.offers;
    var r=rng('sw'+d); var ppl=pickPeople(r,3); var mine=goods().filter(function(it){ return spare(it.id)>0; });
    var cheap=goods().filter(function(it){ return it.p.c&&it.p.c<=30; }); var offers=[];
    ppl.forEach(function(who,k){ var askPool=mine.length?mine:cheap;
      var want=k<2?'good':'bad'; if(r()<0.25)want=want==='good'?'bad':'good';
      var ask=askPool[Math.floor(r()*askPool.length)];
      if(want==='bad'){ var top=askPool.slice().sort(function(a,b){ return worth(b)-worth(a); })[0]; if(worth(ask)<=20&&top)ask=top; if(worth(ask)<=18)ask=BYID.sofa; }
      var cands=goods().filter(function(it){ return it.id!==ask.id&&(want==='good'?worth(it)>worth(ask):worth(it)<worth(ask)); });
      if(!cands.length){ cands=goods().filter(function(it){ return it.id!==ask.id&&worth(it)!==worth(ask); }); }
      var give=cands[Math.floor(r()*cands.length)];
      offers.push({who:who,ask:ask.id,give:give.id,judged:'',taken:false}); });
    e.swap={day:d,offers:offers}; sv(); return offers; }
  window.erSwaps=swaps;
  window.openSwap=function(){ tap(); ER(); zScr('scr-swap','swScore','swBody','Compare what each thing is worth. Bigger number is worth more. Call it first, then decide.'); swRender(); if(typeof show==='function')show('scr-swap'); var s=document.getElementById('scr-swap'); if(s)s.scrollTop=0; };
  window.swJudge=function(i,call){ var o=swaps()[i]; if(!o||o.judged)return; var good=worth(BYID[o.give])>worth(BYID[o.ask]); var right=(call==='good')===good;
    o.judged=right?'right':'wrong'; if(right){ notes(3); ER().deals++; try{ if(typeof sCorrect==='function')sCorrect(); }catch(e){} tst('Right! +3 🎵'); } else { try{ if(typeof ellyChime==='function')ellyChime(); }catch(e){} tst('Look again: compare the two numbers.'); }
    sv(); swRender(); };
  window.swTake=function(i){ var o=swaps()[i]; if(!o||o.taken||!o.judged)return; if(spare(o.ask)<=0){ tst('You need a spare '+BYID[o.ask].name+' to swap.'); return; }
    tap(); S.inv[o.ask]--; if(S.inv[o.ask]<=0)delete S.inv[o.ask]; S.inv[o.give]=(S.inv[o.give]||0)+1; o.taken=true; sv(); party();
    tst('Swapped! The '+BYID[o.give].name+' is in your Stuff.'); swRender(); };
  window.swRender=function(){ var body=document.getElementById('swBody'); if(!body)return; var e=ER(); var offs=swaps();
    var sc=document.getElementById('swScore'); if(sc)sc.textContent='🤝 '+offs.filter(function(o){return o.taken;}).length+'/'+offs.length+' swapped · '+e.deals+' deals called right';
    var html=(typeof zRoom==='function')?zRoom('flip','Flip’s Swap Meet','Trade your spare things with neighbors. Is it a good deal?'):'';
    offs.forEach(function(o,i){ var A=BYID[o.ask], G=BYID[o.give]; var wa=worth(A), wg=worth(G); var have=spare(o.ask)>0;
      html+='<div class="er-card'+(o.taken?' done':'')+'"><div class="er-row">'+svg(o.who,48)+'<div class="er-t" style="flex:1">'+esc(nm(o.who))+': “I will give you my '+esc(G.name)+' for your '+esc(A.name)+'.”</div></div>'
        +'<div class="sw-pair"><div class="sw-side"><div class="sub" style="margin:0">YOU GIVE</div>'+art(o.ask,52)+'<div class="n">'+esc(A.name)+'</div><div class="w">worth '+wa+'</div><div class="sub" style="margin:0">'+(have?'you have '+spare(o.ask):'you have none')+'</div></div>'
        +'<div class="sw-mid">'+(o.judged?(wg>wa?wg+' &gt; '+wa:wg+' &lt; '+wa):'?')+'</div>'
        +'<div class="sw-side"><div class="sub" style="margin:0">YOU GET</div>'+art(o.give,52)+'<div class="n">'+esc(G.name)+'</div><div class="w">worth '+wg+'</div></div></div>';
      if(o.taken)html+='<div class="sub center" style="color:#7dff8a">✓ Swapped!</div>';
      else if(!o.judged)html+='<div class="sub center" style="margin:2px 0">Is this a good deal for you?</div><div class="z-pick"><button class="btn" onclick="swJudge('+i+',\'good\')">👍 Good deal</button><button class="btn" onclick="swJudge('+i+',\'bad\')">👎 Bad deal</button></div>';
      else { var good=wg>wa; html+='<div class="sub center" style="margin:2px 0">'+(good?'<b style="color:#7dff8a">Good deal:</b> you get more than you give.':'<b style="color:#ff9a9a">Bad deal:</b> you give more than you get. You can still swap if you really want it!')+(o.judged==='wrong'?' (Not quite this time.)':'')+'</div>'
        +'<div class="z-pick"><button class="btn'+(have?'':' ghost')+'" onclick="swTake('+i+')">🔁 Swap</button><button class="btn ghost" onclick="tst2()">No thanks</button></div>'; }
      html+='</div>'; });
    html+='<div class="sub center" style="margin-top:6px">New offers tomorrow. Worth is the shop price (gold counts as 30).</div>';
    body.innerHTML=html; };
  window.tst2=function(){ tst('Okay! Maybe another day.'); };

  /* ---------- CSS ---------- */
  (function(){ if(document.getElementById('erCSS'))return; var st=document.createElement('style'); st.id='erCSS'; st.textContent=
     '.er-ban{background:#2a1f05;border:2px solid #ffd158;border-radius:14px;padding:9px 11px;margin:6px 0;font-size:14px;text-align:left}'
    +'.er-ban.dim{border-style:dashed;border-color:#8a7a3a;color:#e9e2ff}'
    +'.er-bt{font-size:11px;font-weight:900;letter-spacing:.6px;color:#ffd158;margin-bottom:4px}'
    +'.er-row{display:flex;align-items:center;gap:10px}'
    +'.er-row svg{flex:none}'
    +'.er-ban .er-row svg,.er-wi svg,.er-card .er-row>svg:last-child,.er-carry svg,.sw-side svg{background:#fff;border-radius:8px;padding:2px}'
    +'.er-wish{background:#160f33;border:1px solid #4a3d84;border-radius:14px;padding:9px 11px;margin:6px 0;text-align:left}'
    +'.er-wl{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}'
    +'.er-wi{background:#241c48;border:1.5px solid #4a3d84;border-radius:10px;padding:6px 4px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px}'
    +'.er-wi.got{border-color:#7dff8a;background:#16331f}'
    +'.er-wi .n{font-size:11px;font-weight:800;line-height:1.1}.er-wi .p{font-size:10px;color:#9a8fce}'
    +'.er-card{background:#160f33;border:1.5px solid #4a3d84;border-radius:14px;padding:10px 12px;margin:8px 0}'
    +'.er-card.done{border-color:#7dff8a66;opacity:.8}'
    +'.er-t{font-weight:800;font-size:14px;line-height:1.25;text-align:left}'
    +'.er-step{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 0;text-align:left}'
    +'.er-step .d{width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;background:#241c48;border:1.5px solid #4a3d84;flex:none}'
    +'.er-step.ok{color:#7dff8a}.er-step.ok .d{background:#16331f;border-color:#7dff8a}'
    +'.er-step.now{color:#ffd158;font-weight:800}.er-step.now .d{background:#ffd158;color:#241c48;border-color:#ffd158}'
    +'.er-step.later{color:#8a80b8}'
    +'.er-carry{background:#1a2440;border:1px solid #2f3d63;border-radius:12px;padding:7px 10px;margin:6px 0;display:flex;align-items:center;gap:8px;font-size:14px}'
    +'.sw-pair{display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center;margin:8px 0}'
    +'.sw-side{background:#241c48;border-radius:12px;padding:8px 4px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px}'
    +'.sw-side .n{font-weight:800;font-size:13px}.sw-side .w{font-weight:900;font-size:16px;color:#ffd158}'
    +'.sw-mid{font-size:20px;font-weight:900;color:#ffd158;min-width:44px;text-align:center}';
    document.head.appendChild(st); })();

  /* ---------- map: ERRANDS & SWAPS beside Downtown ---------- */
  (function(){ var _tp=townPlan; window.townPlan=townPlan=function(){ var rows=_tp();
    try{ if(!rows.some(function(r){ return r.name==='ERRANDS & SWAPS'; })){
      var dn=0,tot=3,sw=0; try{ var bd=board(); tot=bd.length; dn=bd.filter(function(q){ return q.done; }).length; var e=ER(); if(e.swap&&e.swap.day===day())sw=e.swap.offers.filter(function(o){ return o.taken; }).length; }catch(x){}
      var row={y:2300,name:'ERRANDS & SWAPS',sub:'help neighbors · trade things',color:'#ffd158',slots:[
        {col:'#ffd158',tg:'ERRANDS',nm:'Errand Board',host:'gus',prog:dn+'/'+tot+' errands today',go:'er_board'},
        {col:'#7dff8a',tg:'TRADES',nm:'Swap Meet',host:'flip',prog:sw+'/3 swaps today',go:'er_swap'} ]};
      var at=-1; rows.forEach(function(r,i){ if(r.name==='DOWNTOWN · HOME')at=i; });
      if(at>=0)rows.splice(at+1,0,row); else rows.push(row); } }catch(e){ try{ window.__muErr&&window.__muErr('townPlan(errands)',e); }catch(_){} }
    return rows; }; })();
  (function(){ var _tg=townGo; window.townGo=townGo=function(dest){ if(dest==='er_board'){ openErrands(); return; } if(dest==='er_swap'){ openSwap(); return; } return _tg.apply(this,arguments); }; })();

  /* ---------- the Square's daily quest: Sundays are errand day ---------- */
  (function(){ if(typeof questOfDay!=='function')return; var _q=questOfDay; window.questOfDay=questOfDay=function(id){ if(new Date().getDay()===0)return {type:'errand',t:'Finish an errand from Gus’s Errand Board.',go:function(){ openErrands(); }}; return _q(id); }; })();

  /* ---------- what's new (once) ---------- */
  (function(){ if(typeof openTown!=='function')return; var _ot=openTown; window.openTown=openTown=function(){ var r=_ot.apply(this,arguments);
    try{ if(S.flags&&S.flags.introDone&&!S.flags.seen142){ S.flags.seen142=true; sv();
      setTimeout(function(){ try{ var m=document.getElementById('modal'); if(m&&m.classList.contains('on'))return;
        modal('<div class="center"><div class="row" style="justify-content:center;gap:6px">'+svg('gus',52)+svg('fern',52)+svg('flip',52)+'</div><h2>✨ The neighbors moved in!</h2></div>'
          +'<div class="card" style="text-align:left"><b>🏠 Apartment buildings.</b> <span class="sub" style="display:inline;margin:0">Knock on any door to visit a neighbor at home. Give them gifts and paint their walls. Things that match their TASTE make them happiest.</span></div>'
          +'<div class="card" style="text-align:left"><b>📋 Gus’s Errand Board.</b> <span class="sub" style="display:inline;margin:0">Fetch things for neighbors and carry trades between them, three a day.</span></div>'
          +'<div class="card" style="text-align:left"><b>🤝 Flip’s Swap Meet + ⭐ wishlists.</b> <span class="sub" style="display:inline;margin:0">Is it a good deal? Compare the numbers. And fill a neighbor’s wishlist for a big reward.</span></div>'
          +'<button class="btn wide" onclick="closeModal()">Let’s go</button>'); }catch(e){} },700); } }catch(e){}
    return r; }; if(window.BQ)try{ window.BQ.openTown=openTown; }catch(_){} })();

  if(window.BQ)try{ Object.assign(window.BQ,{openErrands:window.openErrands,openSwap:window.openSwap,erBoard:board,erWishOf:wishOf}); }catch(e){}
})();
