/* The molecule library: exactly 1000 entries, each one parses, none repeats a
   structure, and every hand-written entry builds to the molecular formula it
   should. Typed names find their entries whatever the case or hyphens.
   Run: node tests/library.js */
const src = require('./harness.js');
const api = new Function(src+';return {libEntries, LIB_EXPECT, L3_LIB, l3SmilesGraph, benchFormula, smilesKey, libLookup, LIB_SIZE};')();
const fails = [];
const all = api.libEntries();
if(all.length !== api.LIB_SIZE) fails.push('library has '+all.length+' entries, not '+api.LIB_SIZE);
const keys = new Set();
all.forEach(e=>{ if(keys.has(e.key)) fails.push('duplicate structure: '+e.n); keys.add(e.key);
  if(e.sm){ try{ const g = api.l3SmilesGraph(e.sm); if(!g.syms.length || g.syms.length > 800) fails.push(e.n+': '+g.syms.length+' atoms'); }catch(err){ fails.push(e.n+': '+err.message); } } });
Object.keys(api.LIB_EXPECT).forEach(n=>{ const g = api.l3SmilesGraph(api.L3_LIB[n]), c = {}; g.syms.forEach(s=>{ c[s] = (c[s]||0) + 1; }); const f = api.benchFormula(c); if(f !== api.LIB_EXPECT[n]) fails.push(n+': builds '+f+', should be '+api.LIB_EXPECT[n]); });
['pentan 2 ol', 'iron(iii) sulfate', 'n,n dimethylaniline', 'lauric acid', 'caffeine'].forEach(k=>{ if(!api.libLookup(k)) fails.push('name not found: '+k); });
fails.slice(0, 20).forEach(f=>console.log('FAIL', f));
console.log(fails.length ? fails.length+' problem(s)' : 'library ok: '+all.length+' entries, '+Object.keys(api.LIB_EXPECT).length+' formulas checked');
process.exit(fails.length ? 1 : 0);
