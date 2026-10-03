const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const url='file://'+path.join(__dirname,'index.html');
const out=path.join(__dirname,'shots139'); fs.mkdirSync(out,{recursive:true});
let pass=0, fail=0; function ok(n,c){ if(c){pass++;console.log('  PASS',n);} else {fail++;console.log('  FAIL',n);} }
async function page(b,w,h){ const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.__errs=errs;
  await p.goto(url); await p.waitForTimeout(250);
  await p.evaluate(()=>{ const S=JSON.parse(JSON.stringify(DEF)); S.creature={body:'blob',col:'#7dff8a',eyes:'dot',extra:'none',acc:'none',name:'Garrett'}; S.flags.introDone=true; S.flags.seenTown=true; Object.keys(S.flags).forEach(k=>{if(/^seen/.test(k))S.flags[k]=true;}); S.band=S.band||{}; S.band.boom=true; localStorage.setItem('bq_save_v1',JSON.stringify(S)); });
  await p.goto(url); await p.waitForTimeout(450);
  await p.evaluate(()=>{ const sp=document.getElementById('splash'); if(sp)sp.remove(); document.getElementById('btnStart').click(); });
  await p.waitForTimeout(700); return p; }
const cam=p=>p.evaluate(()=>({x:twCam.cam.x,y:twCam.cam.y,z:twCam.cam.z,cx:twCam.cam.cx,cy:twCam.cam.cy,W:twCam.cam.W,H:twCam.cam.H,tf:document.getElementById('twStage').style.transform}));
const geoSig=p=>p.evaluate(()=>{ const pl=townPlan(); const g=townGeo(pl,townIsWide()); return {wide:townIsWide(), rows:pl.length, pos:g.pos.length, W:g.W, H:g.H, extra:g.extra.length, firstSign:JSON.stringify(g.pos[0].sign)}; });

(async()=>{
  const b=await chromium.launch({executablePath:CHROME});

  console.log('\nTEST 1 - badge + one layout in both orientations');
  const pP=await page(b,390,844), pL=await page(b,1080,810);
  ok('badge v1.39', await pP.evaluate(()=>/v1\.39/.test(document.getElementById('vbadge').textContent)));
  const gP=await geoSig(pP), gL=await geoSig(pL);
  console.log('   portrait', JSON.stringify(gP)); console.log('   landscape', JSON.stringify(gL));
  ok('portrait uses the plot (wide)', gP.wide===true);
  ok('identical geometry in both orientations', JSON.stringify(gP)===JSON.stringify(gL));
  ok('a block exists for every district + 1 open lot block', gP.pos===gP.rows+1 && gP.extra===2);
  ok('open lots rendered', await pP.evaluate(()=>document.querySelectorAll('#twStage .tw-lot2').length)===2);

  console.log('\nTEST 2 - shell present, in-map header buttons hidden');
  ok('tabs strip has SQUARE + one chip per district', await pP.evaluate(()=>document.querySelectorAll('#twTabs .twTab').length)===gP.rows+1);
  ok('Garage + Grown-ups pills present', await pP.evaluate(()=>document.querySelectorAll('#twShellTop .twPill').length)===2);
  ok('in-map GROWN-UPS/GARAGE chips hidden', await pP.evaluate(()=>[...document.querySelectorAll('#twStage .tw-grown')].every(e=>getComputedStyle(e).display==='none')));

  console.log('\nTEST 3 - camera starts on the square, inside the land');
  const c0=await cam(pP); console.log('   cam', JSON.stringify(c0));
  ok('transform applied', /translate3d/.test(c0.tf));
  ok('centered near the square (460,470)', Math.abs(c0.cx-460)<40 && Math.abs(c0.cy-470)<60);
  ok('SQUARE chip active', await pP.evaluate(()=>document.querySelector('#twTabs .twTab.on')?.dataset.k==='sq'));
  await pP.screenshot({path:path.join(out,'portrait-start.png')});
  await pL.screenshot({path:path.join(out,'landscape-start.png')});

  console.log('\nTEST 4 - drag pans; a drag never taps a building; a plain tap still does');
  await pP.evaluate(()=>{ window.__goLog=[]; const _t=townGo; window.townGo=townGo=function(d){ window.__goLog.push(d); if(d==='grown'||d==='garage')return; return _t.apply(this,arguments); }; });
  const before=await cam(pP);
  // drag upward 300px starting on a building-free spot
  await pP.mouse.move(195,600); await pP.mouse.down(); for(let i=1;i<=12;i++){ await pP.mouse.move(195,600-25*i); await pP.waitForTimeout(12); } await pP.mouse.up();
  await pP.waitForTimeout(400);
  const after=await cam(pP);
  ok('camera moved on drag', Math.abs(after.y-before.y)>150);
  // now drag starting ON a facade: must not open it (aim the camera at UPTOWN first so a facade is centered on screen)
  await pP.evaluate(()=>{ const p=twCam.cam.geo.pos[0]; twCam.centerOn(p.sign.x,p.sign.y+90,false); }); await pP.waitForTimeout(200);
  const fac=await pP.evaluate(()=>{ const f=[...document.querySelectorAll('#twStage .tw-fac')].map(e=>e.getBoundingClientRect()).find(r=>{const cx=r.left+r.width/2,cy=r.top+r.height/2;return cx>30&&cx<360&&cy>120&&cy<680;}); return f?{x:f.left+f.width/2,y:f.top+f.height/2}:null; });
  ok('found a visible facade to test on', !!fac);
  if(fac){ await pP.mouse.move(fac.x,fac.y); await pP.mouse.down(); for(let i=1;i<=8;i++){ await pP.mouse.move(fac.x,fac.y+20*i); await pP.waitForTimeout(12); } await pP.mouse.up(); await pP.waitForTimeout(400);
    const logAfterDrag=await pP.evaluate(()=>window.__goLog.slice());
    ok('drag that started on a building did NOT open it', logAfterDrag.length===0);
    const fac2=await pP.evaluate(()=>{ const f=[...document.querySelectorAll('#twStage .tw-fac')].map(e=>e.getBoundingClientRect()).find(r=>{const cx=r.left+r.width/2,cy=r.top+r.height/2;return cx>30&&cx<360&&cy>120&&cy<680;}); return f?{x:f.left+f.width/2,y:f.top+f.height/2}:null; });
    await pP.mouse.click(fac2.x,fac2.y); await pP.waitForTimeout(200);
    const logAfterTap=await pP.evaluate(()=>window.__goLog.slice());
    ok('plain tap on a building fires townGo', logAfterTap.length===1);
    console.log('   townGo log:', JSON.stringify(logAfterTap));
    await pP.evaluate(()=>{ try{ openTown(); }catch(e){} }); await pP.waitForTimeout(300);
  }

  console.log('\nTEST 5 - district tab flies the camera there and lights up');
  const lastIdx=gP.rows-1;
  await pP.evaluate((i)=>{ document.querySelector('#twTabs .twTab[data-k="'+i+'"]').click(); }, lastIdx);
  await pP.waitForTimeout(600);
  const cT=await cam(pP); const target=await pP.evaluate((i)=>{ const p=twCam.cam.geo.pos[i]; return {x:p.sign.x,y:p.sign.y+90}; }, lastIdx);
  console.log('   cam center', cT.cx.toFixed(0), cT.cy.toFixed(0), 'target', target.x, target.y);
  ok('camera near the Downtown block (clamped to land edge is fine)', Math.abs(cT.cx-target.x)<=240 && Math.abs(cT.cy-target.y)<=200);
  ok('that chip is active', await pP.evaluate((i)=>document.querySelector('#twTabs .twTab.on')?.dataset.k===String(i), lastIdx));
  ok('camera stays within the land', cT.x<=0.5 && cT.y<=0.5);
  await pP.screenshot({path:path.join(out,'portrait-downtown.png')});

  console.log('\nTEST 6 - rotation keeps the same spot, same land');
  const beforeRot=await cam(pP);
  await pP.setViewportSize({width:844,height:390}); await pP.waitForTimeout(700);
  const afterRot=await cam(pP); const gR=await geoSig(pP);
  ok('geometry unchanged after rotate', JSON.stringify(gR)===JSON.stringify(gP));
  ok('focus point preserved (within clamp)', Math.abs(afterRot.cx-beforeRot.cx)<=240 && Math.abs(afterRot.cy-beforeRot.cy)<=200);
  await pP.screenshot({path:path.join(out,'rotated-downtown.png')});

  console.log('\nTEST 7 - camera position persists across reload');
  await pP.setViewportSize({width:390,height:844}); await pP.waitForTimeout(400);
  const saved=await pP.evaluate(()=>{ save(); return JSON.parse(localStorage.getItem('bq_save_v1')).town.cam; });
  ok('S.town.cam saved', !!saved && isFinite(saved.cx));
  await pP.reload(); await pP.waitForTimeout(500);
  await pP.evaluate(()=>{ const sp=document.getElementById('splash'); if(sp)sp.remove(); document.getElementById('btnStart').click(); }); await pP.waitForTimeout(700);
  const cR=await cam(pP);
  ok('reopened where it left off', Math.abs(cR.cx-saved.cx)<=60 && Math.abs(cR.cy-saved.cy)<=60);

  console.log('\nTEST 8 - garage pill works, zero uncaught errors');
  await pP.evaluate(()=>{ document.querySelector('#twShellTop .twPill[data-go="garage"]').click(); }); await pP.waitForTimeout(500);
  const on=await pP.evaluate(()=>[...document.querySelectorAll('.scr.on')].map(s=>s.id));
  ok('garage pill leaves the town screen', !on.includes('scr-town') && on.length>0);
  ok('portrait: zero uncaught errors', pP.__errs.length===0); if(pP.__errs.length)console.log('   ',pP.__errs.join(' | '));
  ok('landscape: zero uncaught errors', pL.__errs.length===0); if(pL.__errs.length)console.log('   ',pL.__errs.join(' | '));
  ok('no error overlay', await pP.evaluate(()=>!document.getElementById('muErr')) && await pL.evaluate(()=>!document.getElementById('muErr')));

  console.log('\n================  '+pass+' passed / '+fail+' failed  ================');
  await b.close(); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
