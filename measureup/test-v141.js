const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const url='file://'+path.join(__dirname,'index.html');
const out=path.join(__dirname,'shots141'); fs.mkdirSync(out,{recursive:true});
let pass=0, fail=0; function ok(n,c){ if(c){pass++;console.log('  PASS',n);} else {fail++;console.log('  FAIL',n);} }
(async()=>{
  const b=await chromium.launch({executablePath:CHROME});
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(250);
  await p.evaluate(()=>{ const S=JSON.parse(JSON.stringify(DEF)); S.creature={body:'blob',col:'#7dff8a',eyes:'dot',extra:'none',acc:'none',name:'Garrett'}; S.flags.introDone=true; Object.keys(S.flags).forEach(k=>{if(/^seen/.test(k))S.flags[k]=true;}); S.flags.seen142=true; localStorage.setItem('bq_save_v1',JSON.stringify(S)); });
  await p.goto(url); await p.waitForTimeout(400);
  await p.evaluate(()=>{ document.getElementById('splash')?.remove(); document.getElementById('btnStart').click(); }); await p.waitForTimeout(600);

  console.log('\nTEST 1 - version, catalog, tastes');
  ok('badge v1.41+', await p.evaluate(()=>/v1\.4[1-9]/.test(document.getElementById('vbadge').textContent)));
  const cat=await p.evaluate(()=>({n:TOWN_ITEMS.length, byid:['vase','jukebox','kite','fishtank'].every(i=>!!TOWN_BYID[i]), art:['vase','jukebox','kite'].every(i=>/<path|<rect/.test(itemArt(i,44)))}));
  ok('catalog grew to 37 items', cat.n===37); ok('new items buyable (BYID)', cat.byid); ok('new items have art', cat.art);
  const dist=await p.evaluate(()=>{ const d={}; Object.keys(MEMBER_HOME).forEach(id=>{ const t=nbTaste(id); d[t]=(d[t]||0)+1; }); return d; });
  console.log('   taste spread', JSON.stringify(dist));
  ok('all 6 tastes used', Object.keys(dist).length===6);
  ok('no taste hogs more than 40%', Math.max(...Object.values(dist))<=0.4*Object.values(dist).reduce((a,b)=>a+b,0));
  ok('every taste has floor items to buy', await p.evaluate(()=>Object.keys(NB_STYLES).every(st=>TOWN_ITEMS.filter(it=>it.style===st&&it.zone==='floor'&&it.p.c).length>=2)));

  console.log('\nTEST 2 - map: 3 HOMES rows, every citizen housed once');
  const plan=await p.evaluate(()=>townPlan().filter(r=>/HOMES/.test(r.name)).map(r=>r.slots.map(s=>s.go)));
  ok('three homes rows, two buildings each', plan.length===3 && plan.every(r=>r.length===2));
  const housing=await p.evaluate(()=>{ const all=Object.keys(MEMBER_HOME); const seen={}; NB_BUILDINGS.forEach(b=>nbResidents(b.id).forEach(id=>seen[id]=(seen[id]||0)+1)); return {all:all.length, housed:Object.keys(seen).length, dup:Object.values(seen).some(v=>v>1), sizes:NB_BUILDINGS.map(b=>nbResidents(b.id).length)}; });
  console.log('   sizes', housing.sizes.join(','));
  ok('every citizen has exactly one home', housing.all===housing.housed && !housing.dup);
  ok('tab strip shows the homes', await p.evaluate(()=>[...document.querySelectorAll('#twTabs .twTab')].some(t=>/MIDWEST HOMES/.test(t.textContent))));
  ok('building facades drawn on the plot', await p.evaluate(()=>[...document.querySelectorAll('#twStage .tw-fac')].some(f=>/Canyon Lofts/.test(f.textContent))));
  await p.evaluate(()=>{ const i=townPlan().findIndex(r=>r.name==='MIDWEST HOMES'); document.querySelector('#twTabs .twTab[data-k="'+i+'"]').click(); }); await p.waitForTimeout(600);
  await p.screenshot({path:path.join(out,'1-map-homes.png')});

  console.log('\nTEST 3 - building + knocking meets');
  await p.evaluate(()=>townGo('nb:canyon')); await p.waitForTimeout(150);
  ok('building screen open', await p.evaluate(()=>document.getElementById('scr-nbb').classList.contains('on')));
  ok('one door per resident', await p.evaluate(()=>document.querySelectorAll('#nbbBody .nb-door').length===nbResidents('canyon').length));
  await p.screenshot({path:path.join(out,'2-building.png')});
  const who=await p.evaluate(()=>nbResidents('canyon').find(id=>!(S.friends.met[id]||S.band[id])));
  await p.evaluate(id=>nbVisit(id),who); await p.waitForTimeout(150);
  ok('knocking marks met', await p.evaluate(id=>!!S.friends.met[id],who));
  ok('room screen open with starter things', await p.evaluate(id=>document.getElementById('scr-nbroom').classList.contains('on') && nbRoom(id).placed.length>=1 && nbRoom(id).placed.every(x=>!x.g),who));
  await p.screenshot({path:path.join(out,'3-room.png')});

  console.log('\nTEST 4 - gifting: match vs mismatch points, inventory moves, take back');
  const t=await p.evaluate(id=>nbTaste(id),who);
  const pick=await p.evaluate(t=>{ const m=TOWN_ITEMS.find(it=>it.style===t&&it.zone==='floor'&&it.p.c); const o=TOWN_ITEMS.find(it=>it.style!==t&&it.zone==='floor'&&it.p.c); return {m:m.id,o:o.id}; },t);
  await p.evaluate(pk=>{ S.inv[pk.m]=1; S.inv[pk.o]=1; S.home.placed=[]; },pick);
  const p0=await p.evaluate(id=>nbPoints(id),who);
  await p.evaluate(pk=>{ nbTab('give'); nbPick(pk.m); nbSlot('floor',0); },pick);
  const p1=await p.evaluate(id=>nbPoints(id),who);
  ok('matching gift = +2', p1-p0===2);
  ok('gift left your inventory', await p.evaluate(pk=>!S.inv[pk.m],pick));
  await p.screenshot({path:path.join(out,'4-give.png')});
  await p.evaluate(pk=>{ nbPick(pk.o); nbSlot('floor',1); },pick);
  const p2=await p.evaluate(id=>nbPoints(id),who);
  ok('mismatched gift = +1', p2-p1===1);
  await p.evaluate(()=>nbSlot('floor',1)); await p.waitForTimeout(80);
  ok('tapping a gift asks first', await p.evaluate(()=>/back\?/.test(document.getElementById('mbox').textContent)));
  await p.evaluate(()=>{ closeModal(); nbTakeBack('floor',1); });
  ok('take back returns it to Stuff', await p.evaluate(pk=>S.inv[pk.o]===1,pick));
  ok('starter thing cannot be taken', await p.evaluate(id=>{ const st=nbRoom(id).placed.find(x=>!x.g); const n=nbRoom(id).placed.length; nbSlot(st.zone,st.slot); closeModal(); nbSlot(st.zone,st.slot); return nbRoom(id).placed.length===n && !document.getElementById('modal').classList.contains('on'); },who));
  ok('apartment item is not spare (cannot be gifted)', await p.evaluate(pk=>{ S.inv={chair:1}; S.home.placed=[{id:'chair',zone:'floor',slot:0}]; nbTab('give'); return !/Comfy Chair/.test(document.getElementById('nbrBody').textContent); },pick));

  console.log('\nTEST 5 - tiers pay once, paint, persistence');
  const tierRes=await p.evaluate(id=>{ const t=nbTaste(id); const its=TOWN_ITEMS.filter(it=>it.style===t&&it.zone==='floor'); const c0=S.coins; const r=nbRoom(id); for(let i=0;i<12;i++){ r.placed.push({id:its[i%its.length].id,zone:'floor',slot:2+i>14?14:2+i,g:true}); } nbCheckTier(id,true); const c1=S.coins; nbCheckTier(id,true); const c2=S.coins; return {tier:S.nb.tier[id], paid:c1-c0, again:c2-c1}; },who);
  console.log('   ', JSON.stringify(tierRes));
  ok('reached a reward tier and got paid', tierRes.tier>=2 && tierRes.paid>=90);
  ok('tier reward pays only once', tierRes.again===0);
  const paint=await p.evaluate(id=>{ const t=nbTaste(id); const th=TOWN_ITEMS.find(it=>it.cat==='theme'&&it.style===t&&it.sub); if(!th)return 'none'; S.home.themes.push(th.id); const before=nbPoints(id); nbPaint(th.id,th.sub); return nbPoints(id)-before; },who);
  ok('matching paint = +3 (or no matching theme exists)', paint===3||paint==='none');
  ok('unowned theme cannot be painted', await p.evaluate(id=>{ S.home.themes=['floor_wood','wall_cream']; const r=nbRoom(id); const f=r.floor; nbPaint('floor_star','floor'); return nbRoom(id).floor===f; },who));
  const pers=await p.evaluate(()=>{ save(); const o=JSON.parse(localStorage.getItem('bq_save_v1')); return !!(o.nb&&o.nb.rooms&&Object.keys(o.nb.rooms).length); });
  ok('rooms persist', pers);

  console.log('\nTEST 6 - citizen card gets Visit their home');
  await p.evaluate(()=>citizenCard('fern')); await p.waitForTimeout(100);
  ok('Visit their home button on card', await p.evaluate(()=>/Visit their home/.test(document.getElementById('mbox').textContent)));
  await p.evaluate(()=>{ [...document.querySelectorAll('#mbox button')].find(b=>/Visit their home/.test(b.textContent)).click(); }); await p.waitForTimeout(150);
  ok('card button opens Fern\'s room', await p.evaluate(()=>document.getElementById('scr-nbroom').classList.contains('on') && /Fern/.test(document.getElementById('nbrBody').textContent)));
  await p.evaluate(()=>nbBackToBuilding()); await p.waitForTimeout(100);
  ok('back goes to her building', await p.evaluate(()=>document.getElementById('scr-nbb').classList.contains('on') && /Harbor House/.test(document.getElementById('nbbBody').textContent)));
  ok('shops still sell the new items', await p.evaluate(()=>{ openStore('home'); return /Jukebox/.test(document.getElementById('storeBody').textContent); }));
  ok('buying a new item works', await p.evaluate(()=>{ S.coins=500; storeBuy('jukebox'); return S.inv.jukebox===1 && S.coins===415; }));

  ok('zero uncaught page errors', errs.length===0); if(errs.length)console.log('   ',errs.join(' | '));
  ok('no error overlay', await p.evaluate(()=>!document.getElementById('muErr')));
  console.log('\n================  '+pass+' passed / '+fail+' failed  ================');
  await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
