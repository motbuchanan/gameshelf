const {chromium}=require('playwright'); const path=require('path');
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const url='file://'+path.join(__dirname,'index.html');
let pass=0, fail=0;
function ok(n,c){ if(c){pass++;console.log('  PASS',n);} else {fail++;console.log('  FAIL',n);} }
async function fresh(b){ const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.__errs=errs; return p; }
async function seed(p){ await p.goto(url); await p.waitForTimeout(300);
  await p.evaluate(()=>{ const S=JSON.parse(JSON.stringify(DEF)); S.creature={body:'blob',col:'#7dff8a',eyes:'dot',extra:'none',acc:'none',name:'Garrett'};
    S.flags.introDone=true; S.flags.seenTown=true; ['seen105','seen106','seen107','seen112','seen113','seen117','seen121','seen124','seenGuide127'].forEach(k=>S.flags[k]=true);
    S.band=S.band||{}; S.band.boom=true;
    localStorage.setItem('bq_save_v1',JSON.stringify(S)); }); }

(async()=>{
  const b=await chromium.launch({executablePath:CHROME});

  console.log('\nTEST 1 - version badge v1.37');
  { const p=await fresh(b); await p.goto(url); await p.waitForTimeout(300);
    const v=await p.evaluate(()=>({b:(document.getElementById('vbadge')||{}).textContent, V:typeof VERSION!=='undefined'?VERSION:''}));
    ok('badge v1.37', /v1\.37/.test(v.b||'')); ok('VERSION v1.37', /v1\.37/.test(v.V||''));
    await p.context().close(); }

  console.log('\nTEST 2 - guarded art primitives return a placeholder (never throw) on bad input');
  { const p=await fresh(b); await seed(p); await p.goto(url); await p.waitForTimeout(500);
    const r=await p.evaluate(()=>{ function isSvg(s){return typeof s==='string'&&s.indexOf('<svg')===0;}
      var out={}; try{out.creatureNull=isSvg(creatureSVG(null,80));}catch(e){out.creatureNull='THREW:'+e.message;}
      try{out.memberNull=isSvg(memberSVG(null,80));}catch(e){out.memberNull='THREW:'+e.message;}
      try{out.citNull=isSvg(citSvg(null,80));}catch(e){out.citNull='THREW:'+e.message;}
      try{out.ellyOk=isSvg(ellySVG(40));}catch(e){out.ellyOk='THREW:'+e.message;}
      return out; });
    ok('creatureSVG(null) -> placeholder', r.creatureNull===true);
    ok('memberSVG(null) -> placeholder', r.memberNull===true);
    ok('citSvg(null) -> placeholder', r.citNull===true);
    ok('ellySVG still works', r.ellyOk===true);
    await p.context().close(); }

  console.log('\nTEST 3 - avatar art throwing does NOT blank the hub or the town (the real bug)');
  { const p=await fresh(b); await seed(p); await p.goto(url); await p.waitForTimeout(500);
    await p.evaluate(()=>{ const sp=document.getElementById('splash'); if(sp)sp.remove(); });
    // make the avatar render blow up from inside (as a corrupt save would) - lighten() is called by creatureSVG
    await p.evaluate(()=>{ window.lighten=function(){ throw new Error('corrupt avatar colour'); }; });
    await p.evaluate(()=>{ try{renderHub();}catch(e){} });
    const hub=await p.evaluate(()=>({ player:(document.getElementById('hubPlayer')||{}).innerHTML||'', band:(document.getElementById('bandGrid')||{}).children.length||0 }));
    ok('hub avatar rendered (placeholder, not blank)', hub.player.indexOf('<svg')>=0);
    ok('hub band grid populated', hub.band>0);
    await p.evaluate(()=>{ try{openTown();}catch(e){} });
    await p.waitForTimeout(300);
    const town=await p.evaluate(()=>({ on:[...document.querySelectorAll('.scr.on')].map(s=>s.id), stage:((document.getElementById('twStage')||{}).innerHTML||'').length }));
    ok('on scr-town', town.on.includes('scr-town'));
    ok('town stage NOT blank', town.stage>200);
    const errOverlay=await p.evaluate(()=>!!document.getElementById('muErr'));
    ok('error overlay surfaced the cause', errOverlay);
    await p.context().close(); }

  console.log('\nTEST 4 - if renderTown fails outright, a visible "Go to the Garage" fallback shows (not black)');
  { const p=await fresh(b); await seed(p); await p.goto(url); await p.waitForTimeout(500);
    await p.evaluate(()=>{ const sp=document.getElementById('splash'); if(sp)sp.remove(); });
    // sabotage a helper the base renderTown uses but which is NOT art-guarded
    await p.evaluate(()=>{ window.twEnv=function(){ throw new Error('env boom'); }; });
    await p.evaluate(()=>{ try{openTown();}catch(e){} });
    await p.waitForTimeout(300);
    const st=await p.evaluate(()=>((document.getElementById('twStage')||{}).innerHTML||''));
    ok('town shows Garage fallback, not blank', /Garage/.test(st));
    await p.context().close(); }

  console.log('\nTEST 5 - normal flow still clean, zero UNCAUGHT page errors');
  { const p=await fresh(b); await seed(p); await p.goto(url); await p.waitForTimeout(500);
    await p.locator('#splash').tap().catch(()=>{}); await p.waitForTimeout(800);
    await p.locator('#btnStart').tap(); await p.waitForTimeout(600);
    const on=await p.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
    const stage=await p.evaluate(()=>((document.getElementById('twStage')||{}).innerHTML||'').length);
    ok('normal start reaches town', on.includes('scr-town'));
    ok('town fully rendered', stage>500);
    ok('no error overlay in normal flow', await p.evaluate(()=>!document.getElementById('muErr')));
    ok('zero uncaught page errors', p.__errs.length===0);
    if(p.__errs.length)console.log('    errors:',p.__errs.join(' | '));
    await p.context().close(); }

  console.log('\n================  '+pass+' passed / '+fail+' failed  ================');
  await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
