/* Read-only tests for view transformations; run with Node from repository root. */
const assert=require('node:assert/strict'),fs=require('node:fs'),D=require('../five-view/dashboard-data.js');
const data=JSON.parse(fs.readFileSync('five-view/data.json')),rows=data.trials.filter(t=>t.pair);
assert.equal(rows.length,38);assert.equal(new Set(rows.map(t=>t.nct_id)).size,38);
assert.deepEqual(rows.map(t=>t.nct_id).sort(),data.pairs.map(t=>t.nct_id).sort());
let S=0,C=0,N=0;
for(const t of rows){const f=D.flow(t);assert.equal(f.id,t.nct_id);assert.equal(f.arms.length,2);assert.equal(f.started,t.started);for(const a of f.arms){const src=t.arms.find(x=>a.id===t.nct_id+':'+x.group_id);assert.ok(src);assert.equal(a.started,src.started);assert.equal(a.completed,src.completed);assert.equal(a.started,a.completed+a.notCompleted);S+=a.started;C+=a.completed;N+=a.notCompleted;}}
assert.deepEqual([S,C,N],[7920,6721,1199]);
for(const t of data.trials.filter(t=>!t.pair))assert.equal(D.flow(t),null);
let cases=0;
for(const gapMode of ['absolute','signed'])for(const lo of [0,10,20,40,70])for(const gapLo of [-20,0,5,10,20])for(const sponsor of ['all','INDUSTRY','OTHER']){
 const s={phase:'all',sponsor,gapMode,activeBrushes:{attrition:[lo,100],gap:[gapLo,25]}};
 const expected=rows.filter(t=>t.attrition*100>=lo-1e-9&&(gapMode==='signed'?t.pair.difference_pp:t.pair.absolute_difference_pp)>=gapLo-1e-9&&(gapMode==='signed'?t.pair.difference_pp:t.pair.absolute_difference_pp)<=25+1e-9&&(sponsor==='all'||t.sponsor_class===sponsor)).map(t=>t.nct_id).sort();
 assert.deepEqual([...D.subset(rows,s)].sort(),expected);cases++;
}
const state={phase:'all',sponsor:'all',gapMode:'absolute',activeBrushes:{}};
assert.equal(D.subset(rows,state).size,38);state.activeBrushes.year=[1900,2100];assert.equal(D.subset(rows,state).size,37);assert.ok(!D.subset(rows,state).has('NCT01488071'));
state.activeBrushes={started:[100,400],attrition:[10,25],gap:[2,10],year:[2010,2026]};
assert.deepEqual([...D.subset(rows,state)].sort(),rows.filter(t=>t.started>=100&&t.started<=400&&100*t.attrition>=10&&100*t.attrition<=25&&t.pair.absolute_difference_pp>=2&&t.pair.absolute_difference_pp<=10&&t.completion_year!=null&&t.completion_year>=2010&&t.completion_year<=2026).map(t=>t.nct_id).sort());
console.log(JSON.stringify({result:'PASS',paired_trials:rows.length,flow_started:S,flow_completed:C,flow_noncompleted:N,intersection_cases:cases,missing_year_excluded_only_when_brushed:true,nonpaired_flow_is_null:true}));
