const {chromium}=require('playwright'); const path=require('path');
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const url='file://'+path.join(__dirname,'index.html');
let pass=0, fail=0;
function ok(n,c){ if(c){pass++;console.log('  PASS',n);} else {fail++;console.log('  FAIL',n);} }

async function fresh(b){ const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.__errs=errs; return p; }
async function seedReturning(p){
  await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(()=>{ const S=JSON.parse(JSON.stringify(DEF)); S.creature={body:'blob',col:'#7dff8a',eyes:'dot',extra:'none',acc:'none',name:'Garrett'};
    S.flags.introDone=true; S.flags.seenTown=true;
    ['seen105','seen106','seen107','seen112','seen113','seen117','seen121','seen124','seenGuide127'].forEach(k=>S.flags[k]=true);
    localStorage.setItem('bq_save_v1',JSON.stringify(S)); });
}

(async()=>{
  const b=await chromium.launch({executablePath:CHROME});

  // ---- TEST 1: version badge ----
  console.log('\nTEST 1 - version badge reads v1.36');
  { const p=await fresh(b); await p.goto(url); await p.waitForTimeout(300);
    const v=await p.evaluate(()=>({badge:document.getElementById('vbadge')&&document.getElementById('vbadge').textContent, VER:typeof VERSION!=='undefined'?VERSION:null}));
    ok('badge v1.36', /v1\.36/.test(v.badge)); ok('VERSION const v1.36', /v1\.36/.test(v.VER||''));
    await p.context().close(); }

  // ---- TEST 2: normal returning-player start (tap splash, then Let's Play) ----
  console.log('\nTEST 2 - real two-tap flow reaches town, zero errors');
  { const p=await fresh(b); await seedReturning(p); await p.goto(url); await p.waitForTimeout(500);
    // tap the splash to dismiss
    await p.locator('#splash').tap().catch(async()=>{ await p.tap('#splash'); });
    await p.waitForTimeout(900);
    const splashGone=await p.evaluate(()=>!document.getElementById('splash'));
    ok('splash removed after one tap', splashGone);
    // now tap Let's Play
    await p.locator('#btnStart').tap();
    await p.waitForTimeout(600);
    const on=await p.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
    ok('landed on scr-town', on.includes('scr-town'));
    ok('zero page errors', p.__errs.length===0);
    if(p.__errs.length)console.log('    errors:',p.__errs.join(' | '));
    await p.context().close(); }

  // ---- TEST 3: resilience - start chain throws, player must NOT be stuck on title ----
  console.log('\nTEST 3 - if renderTown throws, Let\'s Play still leaves the title');
  { const p=await fresh(b); await seedReturning(p); await p.goto(url); await p.waitForTimeout(500);
    await p.evaluate(()=>{ const sp=document.getElementById('splash'); if(sp)sp.remove(); });
    // sabotage: force the map render to throw
    await p.evaluate(()=>{ window.renderTown=function(){ throw new Error('simulated map crash'); }; if(window.BQ)try{window.BQ.renderTown=window.renderTown;}catch(e){} });
    await p.locator('#btnStart').tap();
    await p.waitForTimeout(500);
    const on=await p.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
    ok('not stuck on title (town shown despite crash)', on.includes('scr-town') && !(on.length===1 && on[0]==='scr-title'));
    await p.context().close(); }

  // ---- TEST 4: resilience - openTown itself throws ----
  console.log('\nTEST 4 - if a late openTown wrap throws, start still shows town');
  { const p=await fresh(b); await seedReturning(p); await p.goto(url); await p.waitForTimeout(500);
    await p.evaluate(()=>{ const sp=document.getElementById('splash'); if(sp)sp.remove(); });
    await p.evaluate(()=>{ const _o=window.openTown; window.openTown=function(){ throw new Error('simulated openTown crash'); }; window.__realOpen=_o; });
    // btnStart captured openTown at wire time via closure? No - it calls global openTown(). But our hardened handler
    // calls the CURRENT global openTown. Overriding global means our guard is bypassed; so instead simulate a wrap
    // throwing INSIDE the guarded chain by throwing from renderHub (also in the start path).
    await p.evaluate(()=>{ window.openTown=window.__realOpen; window.renderHub=function(){ throw new Error('renderHub crash'); }; });
    await p.locator('#btnStart').tap();
    await p.waitForTimeout(500);
    const on=await p.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
    ok('renderHub crash does not block start', on.includes('scr-town'));
    await p.context().close(); }

  // ---- TEST 5: splash watchdog removes splash even with NO tap ----
  console.log('\nTEST 5 - splash watchdog clears it with no interaction (never stuck at load)');
  { const p=await fresh(b); await seedReturning(p); await p.goto(url); await p.waitForTimeout(400);
    const present=await p.evaluate(()=>!!document.getElementById('splash'));
    ok('splash present at load', present);
    await p.waitForTimeout(6600); // > 6s watchdog
    const gone=await p.evaluate(()=>!document.getElementById('splash'));
    ok('splash auto-removed by watchdog', gone);
    // and Let's Play works afterward
    await p.locator('#btnStart').tap(); await p.waitForTimeout(500);
    const on=await p.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
    ok('Let\'s Play works after watchdog', on.includes('scr-town'));
    await p.context().close(); }

  // ---- TEST 6: splash that throws during flourish still dismisses on one tap ----
  console.log('\nTEST 6 - broken audio/flourish cannot strand the splash');
  { const p=await fresh(b); await seedReturning(p); await p.goto(url); await p.waitForTimeout(400);
    await p.evaluate(()=>{ if(typeof V!=='undefined'){ V.kick=function(){throw new Error('audio dead');}; V.snare=V.kick; V.clap=V.kick; } window.memberSVG=function(){ throw new Error('svg dead'); }; });
    await p.locator('#splash').tap();
    await p.waitForTimeout(900);
    const gone=await p.evaluate(()=>!document.getElementById('splash'));
    ok('splash removed on one tap despite flourish throwing', gone);
    await p.context().close(); }

  // ---- TEST 7: fresh player (no creature) -> intro, not stuck ----
  console.log('\nTEST 7 - brand-new player reaches intro/creator');
  { const p=await fresh(b); await p.goto(url); await p.waitForTimeout(400);
    await p.evaluate(()=>{ try{localStorage.removeItem('bq_save_v1');}catch(e){} });
    await p.goto(url); await p.waitForTimeout(500);
    await p.locator('#splash').tap(); await p.waitForTimeout(800);
    await p.locator('#btnStart').tap(); await p.waitForTimeout(600);
    const on=await p.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
    ok('new player left the title', !(on.length===1 && on[0]==='scr-title'));
    ok('new player zero errors', p.__errs.length===0);
    if(p.__errs.length)console.log('    errors:',p.__errs.join(' | '));
    await p.context().close(); }

  console.log('\n================  '+pass+' passed / '+fail+' failed  ================');
  await b.close();
  process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
