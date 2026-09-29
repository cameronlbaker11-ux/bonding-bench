/* Every Learn topic, on the 3D bench, run to its end: event topics wait for
   their steps (nudging when idle, as a person would), hands-on topics have
   the temperature set as the checklist asks. Prints how long each took.
   Run: node tests/learn.js */
const src = require('./harness.js');
const api=new Function(src+`;return {L3,l3Step,l3Scene,LOG,LEARN,LEARN_TOPICS,learnStart,learnGo,learnMode,learnTaskCheck,learnNudge,stepNext,set3D,kelvin,kelvinOf,STEP,setP:(k,v)=>{P[k]=v;}};`)();
const sliderFor=K=>{ let lo=-30,hi=140; for(let i=0;i<40;i++){ const m=(lo+hi)/2; if(api.kelvinOf(m)<K) lo=m; else hi=m; } return (lo+hi)/2; };
api.L3.on = true;
const plans = {hbond:[[60,220]], melt:[[60,1000],[400,1300]]};
let bad = 0;
for(const t of api.LEARN_TOPICS){
  api.learnStart(t.k); api.learnGo();
  const L = api.LEARN; let f = 0, stage = 0, lastN = 0, lastF = 0;
  const plan = plans[t.k] || [];
  for(; f < 5000 && !L.ticks.every(Boolean); f++){
    if(plan[stage] && f === plan[stage][0]){ api.setP('temp', sliderFor(plan[stage][1])); stage++; }
    api.l3Step(0.016);
    if(api.STEP.pending || api.STEP.hold){ api.STEP.pending = false; api.stepNext(); }
    if(f % 60 === 0) api.learnTaskCheck();
    const n = api.LOG.length; if(n !== lastN){ lastN = n; lastF = f; }
    if(!t.hands && f - lastF > 500){ api.learnNudge(); lastF = f; }
  }
  const ok = L.ticks.every(Boolean); if(!ok) bad++;
  console.log((t.k+'           ').slice(0,8), ok ? 'done in '+Math.round(f*0.016)+' s' : 'NOT DONE ('+L.ticks.map(x=>x?'x':'_').join('')+')');
}
console.log(bad ? bad+' topic(s) did not finish' : 'all topics finish');
process.exit(bad ? 1 : 0);
