/* Analysis mode: every report builds without error, and a few answers are checked. Run: node tests/analysis.js */
const src = require('./harness.js');
const api = new Function(src+';return {L3,ANA,anaAdd,anaReport,anaCompoundHTML,anaCompareHTML,anaReactionHTML};')();
api.L3.on = true; api.ANA.on = true;
const fail = [];
const one = n => { api.ANA.list = []; api.ANA.rep = {}; if(!api.anaAdd(n)) { fail.push(n+': '+api.ANA.err); return null; } const R = api.anaReport(0); api.anaCompoundHTML(0); return R; };
['water','caffeine','aspirin','ethanol','benzene','oxygen','nitrogen','acetic acid','ammonium','sodium chloride','H+','SO4 2-','glucose','2-butanol','carbon dioxide',
 'chloroform','folic acid','hydrogen','zinc','copper(II) ion','CCO','C2H6O','nitric acid','phenol','aniline','ethyl acetate','acetone','tristearin'].forEach(n=>{
  try{ const R = one(n); if(R && R.err) fail.push(n+': '+R.err); }catch(e){ fail.push(n+' threw '+e.message); } });
const chk = (what, ok) => { if(!ok) fail.push(what); };
let R = one('oxygen'); chk('O2 bond order 2', R.mo && R.mo.bo === 2); chk('O2 paramagnetic', R.mo && R.mo.unp === 2);
R = one('nitrogen'); chk('N2 bond order 3', R.mo && R.mo.bo === 3 && R.mo.unp === 0);
R = one('ethyl acetate'); chk('ethyl acetate: 3 proton environments', R.nmr.length === 3); chk('ethyl acetate: an ester', R.groups.some(g=>g.k === 'ester'));
R = one('ethanol'); chk('ethanol: combustion within 10%', Math.abs(R.energy.hc - (-1367)) < 137); chk('ethanol: 3 H environments', R.nmr.length === 3);
R = one('water'); chk('water: bent', R.shape[0] && R.shape[0].shape === 'bent'); chk('water: O is -2', R.ox.some(r=>r.sym === 'O' && r.ox === -2));
R = one('benzene'); chk('benzene: one H environment', R.nmr.length === 1 && R.c13.length === 1);
R = one('butan-2-ol'); chk('butan-2-ol: one stereocentre', R.id.stereo.length === 1);
const pred = (a, b, kind) => { api.ANA.list = []; api.ANA.rep = {}; api.ANA.run = null; api.ANA.tab = 'rx'; api.anaAdd(a); api.anaAdd(b); api.anaReactionHTML(); chk(a+' + '+b+' predicts '+kind, api.ANA.pred.some(p=>p.kind === kind)); };
pred('hydrogen chloride', 'ammonia', 'acid–base'); pred('silver ion', 'chloride', 'precipitation'); pred('ethene', 'hydrogen bromide', 'addition'); pred('zinc', 'copper(II) ion', 'redox'); pred('boron trifluoride', 'ammonia', 'Lewis');
console.log(fail.length ? 'FAIL\n'+fail.join('\n') : 'analysis ok');
process.exit(fail.length ? 1 : 0);
