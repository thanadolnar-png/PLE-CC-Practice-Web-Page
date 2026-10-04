const fs = require('fs');
const html = fs.readFileSync('exam-simulation.html', 'utf8');

const openScript = (html.match(/<script/g) || []).length;
const closeScript = (html.match(/<\/script>/g) || []).length;
console.log('Script tags open/close:', openScript, '/', closeScript);

const checks = [
  ['results-participants-superhost div', html.includes('results-participants-superhost')],
  ['results-participants-examinees div', html.includes('results-participants-examinees')],
  ['results-participants-examiners div', html.includes('results-participants-examiners')],
  ['score-val hidden', html.includes('display:none;')],
  ['pct font enlarged', html.includes('font-size:2.6rem')],
  ['makeChip function', html.includes('const makeChip =')],
  ['rosterSuperhost JS', html.includes('rosterSuperhost')],
  ['rosterExaminees JS', html.includes('rosterExaminees')],
  ['rosterExaminers JS', html.includes('rosterExaminers')],
];

checks.forEach(([label, ok]) => {
  console.log((ok ? '✅' : '❌') + ' ' + label);
});
