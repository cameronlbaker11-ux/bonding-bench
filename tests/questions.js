/* Every practice/assessment skill, 300 questions each: no errors, the right
   answer among the options, no duplicate options, at least three to choose from.
   Run: node tests/questions.js */
const src = require('./harness.js');
const api = new Function(src+';return {SKILLS, genQuestion};')();
let bad = 0;
for(const k of Object.keys(api.SKILLS)){
  let fails = [];
  for(let i=0;i<300;i++){
    let q; try{ q = api.genQuestion(k); } catch(e){ fails.push('threw '+e.message); continue; }
    if(!q){ fails.push('no question'); continue; }
    if(!(q.a >= 0 && q.a < q.opts.length)) fails.push('answer out of range');
    if(new Set(q.opts).size !== q.opts.length) fails.push('duplicate options: '+q.opts.join(' | '));
    if(q.opts.length < (api.SKILLS[k].min || 3)) fails.push('only '+q.opts.length+' options: '+q.q);
    if(!q.why || !q.q) fails.push('missing text');
  }
  if(fails.length){ bad++; console.log(k.padEnd(10), 'FAIL', fails.length, fails[0]); } else console.log(k.padEnd(10), 'ok');
}
console.log(bad ? bad+' skill(s) failed' : 'all skills ok');
process.exit(bad ? 1 : 0);
