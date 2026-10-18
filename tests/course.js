/* The course: every step of every lesson renders, every unit has lessons, and the
   newer hands-on tasks can be completed by a scripted student. Run: node tests/course.js */
const src = require('./harness.js');
const api = new Function(src+`;return {COURSE, CRS_UNITS, CRS, crsEnter, courseHTML, crsInfoHTML, L3, l3Step, l3BuildAny, setSlider, crsK, crsNudge, CFIG, crsFig, CRS_ACTS, genQuestion, SKILLS, kelvin, crsSetup, l3Polymerise, l3Scene, l3FitView:()=>{}};`)();
api.L3.on = true;
const fail = [];
api.CRS.on = true;
/* 1. every step renders */
api.COURSE.forEach((L, li)=>{
  if(!api.CRS_UNITS[L.u]) fail.push(L.k+': no unit '+L.u);
  for(let si=0; si<=L.steps.length; si++){
    api.CRS.li = li; api.CRS.si = si;
    try{ api.crsEnter(); const h = api.courseHTML(); if(!h || /undefined|\bNaN\b/.test(h.replace(/data-[a-z]+="[^"]*"/g, ''))) fail.push(L.k+' step '+si+': '+(!h ? 'empty' : 'undefined/NaN in HTML'));
      const st = L.steps[si]; if(st) api.crsInfoHTML(st);
      if(st && st.fig){ const f = api.crsFig(st.fig); if(!f) fail.push(L.k+' step '+si+': figure '+JSON.stringify(st.fig)+' is empty'); }
      if(st && (st.t === 'quiz' || st.t === 'check')) (st.skills||[]).forEach(k=>{ if(!api.SKILLS[k]) fail.push(L.k+': no skill '+k); });
    }catch(e){ fail.push(L.k+' step '+si+' threw '+e.message); }
  }
});
/* 2. the newer hands-on tasks, done by a script */
const run = (secs, each) => { for(let i=0;i<secs*60;i++){ api.l3Step(1/60); if(each && i % 60 === 0) each(); } };
const doStep = (k, h, act, secs) => {
  const li = api.COURSE.findIndex(L=>L.k === k); if(li < 0){ fail.push('no lesson '+k); return; }
  const si = api.COURSE[li].steps.findIndex(s=>s.t === 'do' && (!h || s.h === h)); const st = api.COURSE[li].steps[si];
  let done = null;
  for(let tries=0; tries<3 && !done; tries++){
    api.CRS.li = li; api.CRS.si = si; api.crsEnter();
    try{ act(st); }catch(e){ fail.push(k+' act threw '+e.message); return; }
    const ok = st.tasks.map(()=>false);
    for(let i=0;i<(secs||40)*60 && !ok.every(Boolean);i++){ api.l3Step(1/60); if(i % 30 === 0) st.tasks.forEach((t, j)=>{ try{ if(!ok[j] && t.check()) ok[j] = true; }catch(e){} }); if(i % 600 === 599) api.crsNudge(); }
    if(ok.every(Boolean)) done = true; else done = done || null, (tries === 2 && fail.push(k+' ('+st.h+'): tasks not done '+ok.map(x=>x ? 'Y' : 'n').join('')));
  }
};
const sel = s => { const a = api.L3.atoms.find(x=>api.L3 && x && require ? true : true); };
doStep('orbitals', null, st=>{ ['O','K','Fe'].forEach(sy=>{ const a = api.l3BuildAny(sy); }); ['O','K','Fe'].forEach(sy=>api.CRS.sel.add(sy)); }, 2);
doStep('light', null, st=>{ api.setSlider('temp', api.crsK(2400)); api.l3BuildAny('Cu2+'); }, 30);
doStep('resonance', null, st=>{ api.l3BuildAny('nitrate'); api.l3BuildAny('benzene'); }, 5);
doStep('hybrid', null, st=>{ ['ethane','ethene','ethyne'].forEach(n=>api.l3BuildAny(n)); }, 5);
doStep('isomers', null, st=>{ api.l3BuildAny('butane'); api.l3BuildAny('isobutane'); }, 5);
doStep('limiting', null, st=>{}, 60);
doStep('series', 'Copper meets nitric acid', st=>{ api.l3Scene('cunitric'); }, 30);
doStep('entropy', null, st=>{ api.setSlider('temp', api.crsK(700)); }, 15);
doStep('cells', null, st=>{}, 60);
doStep('naming', null, st=>{ ['propan-2-ol','butanone','propanoic acid'].forEach(n=>api.l3BuildAny(n)); }, 5);
doStep('polymers', null, st=>{ api.CRS_ACTS.poly(); }, 5);
console.log(fail.length ? 'FAIL\n'+fail.join('\n') : 'course ok: '+api.COURSE.length+' entries in '+api.CRS_UNITS.length+' units');
process.exit(fail.length ? 1 : 0);
