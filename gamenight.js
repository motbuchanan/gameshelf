/* Game Night shared runtime — players, coin flip, global ledger, stats overlay.
   Storage is seam-isolated for the Firebase swap. */
(function(){
const GN={};window.GN=GN;

/* ---------- players ---------- */
const PALETTE=[
  {color:"#d8312b",light:"#f06a60",dark:"#8d1d19"},
  {color:"#2f6fd0",light:"#6fa0ec",dark:"#194182"},
  {color:"#46b06a",light:"#7ed29a",dark:"#2a6e42"},
  {color:"#e88030",light:"#f3a86c",dark:"#9a4f14"},
  {color:"#b06ad0",light:"#cf9ce6",dark:"#6e3a8a"},
  {color:"#3fb6b2",light:"#7fd6d2",dark:"#1f6f6c"},
  {color:"#f4c542",light:"#f9dd8a",dark:"#9a7414"},
  {color:"#e25c8e",light:"#f09ab9",dark:"#8e2f55"}];
const PKEY="gn_players",PAIRKEY="gn_lastpair";
function defaultPlayers(){return[
  {name:"Mot",...PALETTE[0]},
  {name:"Kathy",...PALETTE[1]},
  {name:"Garrett",...PALETTE[2]}];}
function pload(){try{const l=JSON.parse(localStorage.getItem(PKEY));return(l&&l.length)?l:defaultPlayers();}catch(e){return defaultPlayers();}}
function psave(l){try{localStorage.setItem(PKEY,JSON.stringify(l));}catch(e){}}
GN.players=function(){return pload();};
GN.addPlayer=function(name){name=(name||"").trim();if(!name)return null;
  const l=pload();if(l.some(p=>p.name.toLowerCase()===name.toLowerCase()))return l.find(p=>p.name.toLowerCase()===name.toLowerCase());
  const used=new Set(l.map(p=>p.color));
  const pal=PALETTE.find(c=>!used.has(c.color))||PALETTE[l.length%PALETTE.length];
  const p={name,...pal};l.push(p);psave(l);
  mirror(()=>_db.doc("households/"+_hh+"/state/players").set({list:FV().arrayUnion(p)},{merge:true}));
  return p;};
GN.lastPair=function(){try{const pr=JSON.parse(localStorage.getItem(PAIRKEY));
    if(pr&&pr.length===2){const l=pload();
      const a=l.find(p=>p.name===pr[0]),b=l.find(p=>p.name===pr[1]);
      if(a&&b)return[a,b];}}catch(e){}
  const l=pload();return[l[0],l[1]];};
function savePair(a,b){try{localStorage.setItem(PAIRKEY,JSON.stringify([a.name,b.name]));}catch(e){}}

/* ---------- global ledger (dynamic player names; seam for Firebase) ---------- */
const GKEY="gn_global";let _gmem=null;
function blank(){return{flips:{n:0,won:{},streak:{who:null,len:0}},
  dice:{rolled:0,sixes:0,doubles:0},sentHome:0,wins:{},games:0,timeMs:0};}
function gload(){try{const g=JSON.parse(localStorage.getItem(GKEY));if(!g)return blank();
    if(!g.flips.won)g.flips.won={Mot:g.flips.Mot||0,Kathy:g.flips.Kathy||0}; // migrate v1
    return g;}catch(e){return _gmem||blank();}}
function gsave(g){try{localStorage.setItem(GKEY,JSON.stringify(g));}catch(e){_gmem=g;}}
GN.g={
  addFlip(winnerName){const g=gload();g.flips.n++;
    g.flips.won[winnerName]=(g.flips.won[winnerName]||0)+1;
    if(g.flips.streak.who===winnerName)g.flips.streak.len++;else g.flips.streak={who:winnerName,len:1};
    gsave(g);
    mirror(()=>_db.doc("households/"+_hh+"/state/global").update({"flips.n":FV().increment(1),
      ["flips.won."+winnerName]:FV().increment(1),"flips.streak":g.flips.streak}));},
  addDice(vals){const g=gload();g.dice.rolled+=vals.length;
    let sx=0;for(const v of vals)if(v===6){g.dice.sixes++;sx++;}
    const db=(vals.length===2&&vals[0]===vals[1])?1:0;if(db)g.dice.doubles++;
    gsave(g);
    mirror(()=>_db.doc("households/"+_hh+"/state/global").update({"dice.rolled":FV().increment(vals.length),
      "dice.sixes":FV().increment(sx),"dice.doubles":FV().increment(db)}));},
  addSentHome(n){const g=gload();g.sentHome+=(n||1);gsave(g);
    mirror(()=>_db.doc("households/"+_hh+"/state/global").update({sentHome:FV().increment(n||1)}));},
  addResult(winner,loser,durMs){const g=gload();
    if(winner)g.wins[winner]=(g.wins[winner]||0)+1;
    g.games++;g.timeMs+=(durMs||0);gsave(g);
    mirror(()=>{const u={games:FV().increment(1),timeMs:FV().increment(durMs||0)};
      if(winner)u["wins."+winner]=FV().increment(1);
      _db.doc("households/"+_hh+"/state/global").update(u);});},
  read(){return gload();}};

GN.friendly=false;
GN.recordGame=function(key,rec){
  if(GN.friendly)return; // friendly games leave no trace

  let l=[];try{l=JSON.parse(localStorage.getItem(key))||[];}catch(e){}
  l.push(rec);
  try{localStorage.setItem(key,JSON.stringify(l));}catch(e){}
  mirror(()=>_db.doc("households/"+_hh+"/records/"+key).set({list:FV().arrayUnion(rec)},{merge:true}));
  GN.g.addResult(rec.winner,rec.loser,rec.durationMs);};
GN.readGames=function(key){try{return JSON.parse(localStorage.getItem(key))||[];}catch(e){return[];}};

/* ---------- shared CSS ---------- */
const css=`
.gnOv{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  padding:26px;text-align:center;background:rgba(7,12,9,.92);font-family:system-ui,sans-serif;color:#e8f0e4;}
.gnTitle{font-size:23px;font-weight:800;}
.gnBtn{font-family:inherit;font-size:16px;font-weight:bold;padding:10px 20px;border-radius:10px;border:none;
  color:#1c2b16;background:#b0d235;cursor:pointer;box-shadow:0 4px 0 #7e9a1f,0 5px 10px rgba(0,0,0,.4);}
.gnBtn.ghost{background:#15241b;color:#cfe6d8;box-shadow:0 4px 0 #0b160f;border:1px solid #3a5a47;}
.gnSeats{display:flex;align-items:center;gap:14px;}
.gnSeat{min-width:118px;padding:12px 14px;border-radius:14px;border:2px solid rgba(255,255,255,.25);
  font-weight:800;font-size:17px;color:#fff;cursor:pointer;background:none;font-family:inherit;
  box-shadow:0 6px 14px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.25);}
.gnSeat small{display:block;font-weight:400;font-size:11px;opacity:.85;margin-top:2px;}
.gnVs{color:#7d9a88;font-weight:700;}
.gnAdd{background:none;border:none;color:#9fbdac;font-size:13px;text-decoration:underline;cursor:pointer;font-family:inherit;}
.gnScene{perspective:700px;width:140px;height:140px;}
.gnCoin{position:relative;width:120px;height:120px;margin:10px;transform-style:preserve-3d;}
.gnFace{position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;
  font-size:22px;font-weight:800;color:#fff;
  box-shadow:inset 0 0 0 5px #c9a23c,inset 0 0 0 8px rgba(0,0,0,.18),inset 0 6px 14px rgba(255,255,255,.45);}
.gnEdge{position:absolute;inset:0;border-radius:50%;background:repeating-linear-gradient(90deg,#cda53e 0 3px,#9c7a28 3px 6px);}
.gnShadow{width:90px;height:18px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.5),transparent);margin-top:-6px;}
.gnStats{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;gap:10px;
  padding:22px 16px;overflow:auto;background:radial-gradient(110% 80% at 50% 30%,#1f3327 0%,#0c1410 80%);
  font-family:system-ui,sans-serif;color:#e8f0e4;}
.gnStats h1{font-size:25px;}
.gnH2H{display:flex;align-items:center;gap:18px;font-weight:700;}
.gnH2H .big{font-size:38px;line-height:1;}
.gnRow{display:grid;grid-template-columns:130px 1fr 70px;align-items:center;gap:8px;width:100%;max-width:420px;}
.gnRow .l{font-size:13px;color:#cfe6d8;text-align:right;}
.gnRow .bar{height:13px;border-radius:7px;overflow:hidden;display:flex;background:#0e1813;}
.gnRow .bar span{display:block;height:100%;}
.gnRow .v{font-size:12px;color:#bcd6c7;font-variant-numeric:tabular-nums;}
.gnSec{margin-top:8px;color:#9fbdac;font-size:12px;letter-spacing:.6px;text-transform:uppercase;}
.gnMeta{color:#9fbdac;font-size:13px;text-align:center;max-width:440px;}
`;
function injectCSS(){if(document.getElementById("gnCSS"))return;
  const s=document.createElement("style");s.id="gnCSS";s.textContent=css;document.head.appendChild(s);}

/* ---------- match start: who's playing? + coin flip ---------- */
/* GN.matchStart(done) -> done({a,b,first}) where a,b,first are player objects */
GN.matchStart=function(done){injectCSS();
  let[a,b]=GN.lastPair();
  const ov=document.createElement("div");ov.className="gnOv";
  ov.innerHTML='<div class="gnTitle" id="gnT">Who\u2019s playing?</div>'+
    '<div class="gnSeats"><button class="gnSeat" id="gnA"></button><span class="gnVs">vs</span><button class="gnSeat" id="gnB"></button></div>'+
    '<button class="gnAdd" id="gnNew">+ add a player</button>'+
    '<button class="gnAdd" id="gnFr" style="color:#cfe6d8;">\u2713 Counts for the record</button>'+
    '<div class="gnScene" style="display:none" id="gnSc"><div class="gnCoin" id="gnC"></div><div class="gnShadow"></div></div>'+
    '<button class="gnBtn" id="gnGo">Flip for first</button>';
  document.body.appendChild(ov);
  const eA=ov.querySelector("#gnA"),eB=ov.querySelector("#gnB"),go=ov.querySelector("#gnGo"),
        title=ov.querySelector("#gnT"),scene=ov.querySelector("#gnSc"),coin=ov.querySelector("#gnC");
  function seat(el,p){el.textContent=p.name;el.style.background="linear-gradient(160deg,"+p.light+","+p.color+" 60%,"+p.dark+")";
    const s=document.createElement("small");s.textContent="tap to change";el.appendChild(s);}
  function refresh(){seat(eA,a);seat(eB,b);}
  function cycle(cur,other){const l=GN.players();let i=l.findIndex(p=>p.name===cur.name);
    for(let k=1;k<=l.length;k++){const c=l[(i+k)%l.length];if(c.name!==other.name)return c;}return cur;}
  eA.onclick=()=>{a=cycle(a,b);refresh();};
  eB.onclick=()=>{b=cycle(b,a);refresh();};
  ov.querySelector("#gnNew").onclick=()=>{const n=prompt("Player name?");
    const p=GN.addPlayer(n);if(p&&p.name!==a.name){b=p;refresh();}};
  let friendly=false;const fr=ov.querySelector("#gnFr");
  fr.onclick=()=>{friendly=!friendly;
    fr.textContent=friendly?"\u26a0 Friendly game \u2014 not recorded":"\u2713 Counts for the record";
    fr.style.color=friendly?"#f4c542":"#cfe6d8";};
  refresh();
  go.onclick=function(){savePair(a,b);
    eA.disabled=true;eB.disabled=true;ov.querySelector("#gnNew").style.display="none";
    ov.querySelector(".gnSeats").style.display="none";scene.style.display="";
    title.textContent="Who goes first?";go.style.visibility="hidden";
    coin.innerHTML="";
    for(let i=0;i<9;i++){const e=document.createElement("div");e.className="gnEdge";
      e.style.transform="translateZ("+(-6+i*1.5)+"px)";coin.appendChild(e);}
    const fH=document.createElement("div");fH.className="gnFace";fH.textContent=a.name.toUpperCase();
    fH.style.background="radial-gradient(circle at 38% 32%,"+a.light+","+a.color+" 70%,"+a.dark+")";
    fH.style.transform="translateZ(6px)";coin.appendChild(fH);
    const fT=document.createElement("div");fT.className="gnFace";fT.textContent=b.name.toUpperCase();
    fT.style.background="radial-gradient(circle at 38% 32%,"+b.light+","+b.color+" 70%,"+b.dark+")";
    fT.style.transform="rotateX(180deg) translateZ(6px)";coin.appendChild(fT);
    const heads=Math.random()<0.5,finalDeg=heads?0:180,turns=5+Math.floor(Math.random()*3);
    const H=200,dur=1300;let t0=null;
    function toss(ts){if(t0===null)t0=ts;const el=ts-t0;
      if(el<dur){const p=el/dur,arc=Math.sin(p*Math.PI);
        const ty=90*(1-p)-arc*H,sc=0.8+0.2*p+0.35*arc,deg=(turns*360+finalDeg)*(1-Math.pow(1-p,2.2));
        coin.style.transform="translateY("+ty+"px) scale("+sc+") rotateX("+deg+"deg)";
        requestAnimationFrame(toss);return;}
      land(ts);}
    let l0=null;const ldur=1050,dir=Math.random()<0.5?1:-1;
    function land(ts){if(l0===null)l0=ts;const p=Math.min(1,(ts-l0)/ldur);
      const decay=Math.pow(1-p,2),amp=24*decay;
      const phi=dir*2*Math.PI*3*Math.pow(p,1.45);
      coin.style.transform="translateY(0) rotateX("+(finalDeg+amp*Math.cos(phi))+"deg) rotateY("+(amp*Math.sin(phi))+"deg)";
      if(p<1){requestAnimationFrame(land);return;}
      coin.style.transform="rotateX("+finalDeg+"deg)";
      const first=heads?a:b;
      GN.friendly=friendly;
      if(!friendly)GN.g.addFlip(first.name);
      title.textContent=first.name+" goes first!";title.style.color=first.color;
      go.textContent="Begin";go.style.visibility="visible";
      go.onclick=function(){ov.remove();done({a,b,first,friendly});};}
    requestAnimationFrame(toss);};};

/* ---------- stats overlay ---------- */
/* GN.openStats({title,key,specials:[{label,of:(recs,name)=>num}]}) — h2h is the last pairing */
GN.openStats=function(cfg){injectCSS();
  const old=document.getElementById("gnStats");if(old)old.remove();
  const recs=GN.readGames(cfg.key);
  const[pa,pb]=GN.lastPair();
  const pairRecs=recs.filter(r=>(r.winner===pa.name||r.winner===pb.name||r.loser===pa.name||r.loser===pb.name));
  let m=0,k=0,dur=0;for(const r of recs){if(r.winner===pa.name)m++;else if(r.winner===pb.name)k++;dur+=r.durationMs||0;}
  let streak=0,who=null;
  for(let i=recs.length-1;i>=0;i--){const w=recs[i].winner;if(!w)break;if(who===null){who=w;streak=1;}else if(w===who)streak++;else break;}
  const fmt=ms=>{if(!ms)return"\u2014";const s=Math.round(ms/1000),mn=Math.floor(s/60);return mn?(mn+"m "+(s%60)+"s"):(s+"s");};
  function row(label,va,vb){const tot=(va+vb)||1,p=Math.round(va/tot*100);
    return '<div class="gnRow"><div class="l">'+label+'</div><div class="bar"><span style="width:'+p+'%;background:'+pa.color+'"></span><span style="width:'+(100-p)+'%;background:'+pb.color+'"></span></div><div class="v">'+va+" / "+vb+'</div></div>';}
  const wrap=document.createElement("div");wrap.className="gnStats";wrap.id="gnStats";
  let h='<h1>'+cfg.title+' \u2014 Stats</h1>';
  h+='<div class="gnH2H"><span style="color:'+pa.color+'"><span class="big">'+m+'</span> '+pa.name+'</span><span style="color:#7d9a88">vs</span><span style="color:'+pb.color+'">'+pb.name+' <span class="big">'+k+'</span></span></div>';
  h+='<div class="gnMeta">'+recs.length+' game'+(recs.length===1?"":"s")+' recorded \u00b7 avg '+fmt(recs.length?dur/recs.length:0)+(who?' \u00b7 '+who+' on a '+streak+'-game streak':'')+'</div>';
  if(cfg.specials&&recs.length){h+='<div class="gnSec">This game</div>';
    for(const s of cfg.specials)h+=row(s.label,s.of(recs,pa.name),s.of(recs,pb.name));}
  const g=GN.g.read();
  h+='<div class="gnSec">Across the whole shelf</div>';
  h+=row("All-game wins",g.wins[pa.name]||0,g.wins[pb.name]||0);
  h+=row("Coin flips won",g.flips.won[pa.name]||0,g.flips.won[pb.name]||0);
  const others=Object.keys(g.wins).filter(n=>n!==pa.name&&n!==pb.name&&g.wins[n]>0);
  if(others.length)h+='<div class="gnMeta">Other players: '+others.map(n=>n+" "+g.wins[n]).join(" \u00b7 ")+'</div>';
  h+='<div class="gnMeta">'+g.games+' games \u00b7 '+g.flips.n+' coin flips'+(g.flips.streak.who?' \u00b7 '+g.flips.streak.who+' has won '+g.flips.streak.len+' flip'+(g.flips.streak.len>1?'s':'')+' running':'')+'</div>';
  h+='<div class="gnMeta">'+g.dice.rolled+' dice rolled \u00b7 '+g.dice.sixes+' sixes \u00b7 '+g.dice.doubles+' doubles \u00b7 '+g.sentHome+' pieces sent home</div>';
  h+='<button class="gnBtn" id="gnX" style="margin-top:10px;">Close</button>';
  wrap.innerHTML=h;document.body.appendChild(wrap);
  wrap.querySelector("#gnX").onclick=()=>wrap.remove();};

GN.statsButton=function(container,cfg){injectCSS();
  const b=document.createElement("button");b.className="gnBtn ghost";b.textContent="Stats";
  b.style.fontSize="15px";b.style.padding="9px 16px";
  b.onclick=()=>GN.openStats(cfg);container.appendChild(b);return b;};

/* ---------- household cloud sync (Firebase, opt-in per device) ---------- */
const FB_CONFIG={apiKey:"AIzaSyBcQedEEuBlsxaPke8y49QZXU42SVP1kiE",
  authDomain:"buchanan-gameshelf.firebaseapp.com",projectId:"buchanan-gameshelf",
  storageBucket:"buchanan-gameshelf.firebasestorage.app",
  messagingSenderId:"391867096201",appId:"1:391867096201:web:3ceafef2bb7d6cbfe97a58"};
const FB_CDN="https://www.gstatic.com/firebasejs/10.12.2/";
let _db=null,_hh=null,_fbReady=false;
function hhId(code){let h=5381;for(let i=0;i<code.length;i++)h=((h<<5)+h+code.charCodeAt(i))>>>0;return"hh_"+h.toString(36);}
function loadScript(u){return new Promise((res,rej)=>{const s=document.createElement("script");
  s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
const GAME_KEYS=["sorry_games","checkers_games","c4_games","trouble_games","mancala_games",
  "dom_games","yahtzee_games","bs_games","cc_games","bg_games",
  "war_games","pig_games","sb_games","sl_games","uttt_games",
  "gomoku_games","dots_games","hex_games","cb_games"];
GN.sync={
  status(){try{return localStorage.getItem("gn_sync_hh")?"on":"off";}catch(e){return"off";}},
  enable(code){if(!code||!code.trim())return false;
    try{localStorage.setItem("gn_sync_hh",hhId(code.trim()));}catch(e){return false;}
    bootSync();return true;},
  disable(){try{localStorage.removeItem("gn_sync_hh");}catch(e){}_db=null;_hh=null;_fbReady=false;},
  resetCloud(){if(!_fbReady)return;
    _db.doc("households/"+_hh+"/state/global").set(blank());
    for(const k of GAME_KEYS)_db.doc("households/"+_hh+"/records/"+k).set({list:[]});}
};
async function bootSync(){
  let hh=null;try{hh=localStorage.getItem("gn_sync_hh");}catch(e){}
  if(!hh||typeof window==="undefined")return;
  try{
    if(!window.firebase){await loadScript(FB_CDN+"firebase-app-compat.js");
      await loadScript(FB_CDN+"firebase-auth-compat.js");
      await loadScript(FB_CDN+"firebase-firestore-compat.js");}
    if(!firebase.apps.length)firebase.initializeApp(FB_CONFIG);
    await firebase.auth().signInAnonymously();
    _db=firebase.firestore();_hh=hh;
    try{await _db.enablePersistence({synchronizeTabs:true});}catch(e){}
    // first contact: device with history seeds the cloud; empty devices adopt it
    const gref=_db.doc("households/"+_hh+"/state/global");
    const snap=await gref.get();
    if(!snap.exists){await gref.set(gload());
      for(const k of GAME_KEYS){const l=GN.readGames(k);
        if(l.length)await _db.doc("households/"+_hh+"/records/"+k).set({list:l});}
      const pl=pload();await _db.doc("households/"+_hh+"/state/players").set({list:pl});}
    _fbReady=true;
    // live adoption: cloud is the household truth once synced
    gref.onSnapshot(s=>{if(s.exists)gsave(s.data());});
    _db.collection("households/"+_hh+"/records").onSnapshot(q=>{
      q.forEach(d=>{try{localStorage.setItem(d.id,JSON.stringify(d.data().list||[]));}catch(e){}});});
    _db.doc("households/"+_hh+"/state/players").onSnapshot(s=>{
      if(s.exists&&s.data().list&&s.data().list.length)psave(s.data().list);});
  }catch(e){/* offline or blocked: localStorage carries on */}
}
function mirror(fn){if(_fbReady){try{fn();}catch(e){}}}
function FV(){return firebase.firestore.FieldValue;}
if(typeof window!=="undefined")setTimeout(bootSync,0);

/* ---------- rules overlay ---------- */
/* GN.openRules({title,sections:[{h,p}]}) */
GN.openRules=function(cfg){injectCSS();
  const old=document.getElementById("gnRules");if(old)old.remove();
  const wrap=document.createElement("div");wrap.className="gnStats";wrap.id="gnRules";
  let h='<h1>'+cfg.title+' \u2014 How to play</h1>';
  for(const s of cfg.sections){
    h+='<div class="gnSec">'+s.h+'</div>';
    h+='<div class="gnMeta" style="text-align:left;line-height:1.55;font-size:14px;color:#d8e8dd;">'+s.p+'</div>';}
  h+='<button class="gnBtn" id="gnRX" style="margin-top:12px;">Close</button>';
  wrap.innerHTML=h;document.body.appendChild(wrap);
  wrap.querySelector("#gnRX").onclick=()=>wrap.remove();};
GN.rulesButton=function(container,cfg){injectCSS();
  const b=document.createElement("button");b.className="gnBtn ghost";b.textContent="Rules";
  b.style.fontSize="15px";b.style.padding="9px 16px";
  b.onclick=()=>GN.openRules(cfg);container.appendChild(b);return b;};
})();
