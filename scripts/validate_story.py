"""Verify editorial claims and exact cohort nesting; no new analysis or redefinition."""
import csv, hashlib, json, math
from pathlib import Path

def rows(name):return list(csv.DictReader(Path('data/analysis',name+'.csv').open()))
t=rows('trial_metrics');p=rows('differential_attrition');m=rows('outcome_review_candidates')
stages=[('eligible','Eligible depression trials',{r['nct_id'] for r in t}),('attrition','Usable trial-level attrition',{r['nct_id'] for r in t if r['usable']=='True'}),('paired','Reliable paired-arm comparisons',{r['nct_id'] for r in p}),('outcome','Initial MADRS-change candidates',{r['nct_id'] for r in m})]
assert [len(s) for _,_,s in stages]==[201,82,38,14]
for previous,current in zip(stages,stages[1:]):assert current[2]<previous[2],(current[0],sorted(current[2]-previous[2]))
assert len(m)==len(stages[-1][2])==14
payload=json.loads(Path('final/data.json').read_text());sm=payload['summary']
assert {x['nct_id'] for x in payload['trials']}==stages[0][2]
assert {x['nct_id'] for x in payload['trials'] if x['usable']}==stages[1][2]
assert {x['nct_id'] for x in payload['pairs']}==stages[2][2]
assert all(x['numeric_primary_results'] for x in payload['trials'] if x['nct_id'] in stages[2][2])
assert sm['usable']['n']==82 and sm['usable_arms']==221
assert (sm['usable']['started'],sm['usable']['completed'])==(20949,17674)
assert round(sm['usable']['median']*100,2)==13.66
assert round(sm['usable']['pooled_attrition']*100,2)==15.63
assert round(sm['pair_median_absolute_pp'],2)==3.52
assert math.isclose(sm['pair_min_pp'],-20) and math.isclose(sm['pair_max_pp'],25)
assert sm['primary_outcome_rows']==330 and len(rows('primary_outcome_cells'))==1888
assert all(r['bootstrap_low_pp']<0<r['bootstrap_high_pp'] for r in payload['model'] if r['term']!='Intercept')
# This model's response is overall trial attrition, never paired-arm difference.
assert all(float(r['observed_pp'])==100*next(x['attrition'] for x in payload['trials'] if x['nct_id']==r['nct_id']) for r in rows('model_diagnostics'))
baseline=json.loads(Path('docs/NARRATIVE_BASELINE.json').read_text())
for file,h in baseline['protected_sha256'].items():assert hashlib.sha256(Path(file).read_bytes()).hexdigest()==h,file+' changed during editorial pass'
for file,h in baseline['backup_sha256'].items():assert hashlib.sha256(Path('research-2026-09-27',file).read_bytes()).hexdigest()==h,file+' backup changed'
sourcefiles=['data/analysis/trial_metrics.csv','data/analysis/differential_attrition.csv','data/analysis/outcome_review_candidates.csv']
receipt={'result':'PASS','unit':'unique NCT ID / trial','strictly_nested':True,'stages':[dict(key=k,label=l,count=len(s),nct_ids=sorted(s)) for k,l,s in stages],'final_stage':'Not yet a defensible harmonized treatment-effect analysis; not a zero-study count.','all_38_pairs_have_numeric_primary_results':True,'source_sha256':{f:hashlib.sha256(Path(f).read_bytes()).hexdigest() for f in sourcefiles},'protected_analyses_and_backup_unchanged':True,'model_response':'overall trial attrition percentage points, not differential attrition'}
Path('final/eligibility.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='stages'},indent=2));print('Verified nesting: 201 > 82 > 38 > 14; zero membership exceptions.')
