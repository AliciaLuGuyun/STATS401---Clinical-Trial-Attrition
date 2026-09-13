"""Independent raw-to-table numerical audit plus deterministic reproduction checks."""
import collections,csv,hashlib,json,math,pathlib,subprocess,sys,tempfile
from process import load_snapshot
P=pathlib.Path('data/processed');read=lambda n:list(csv.DictReader((P/(n+'.csv')).open()))
studies,m=load_snapshot(pathlib.Path('data/raw/2026-09-13'));raw={s['protocolSection']['identificationModule']['nctId']:s for s in studies}
tr=read('trials');aa=read('arms');rr=read('reasons');pairs=read('pairs');candidates=read('candidates')
assert len({t['nct_id'] for t in tr})==len(tr)
assert len({(a['nct_id'],a['group_id'],a['period_index']) for a in aa})==len(aa)
assert len({(r['nct_id'],r['group_id'],r['period_index'],r['reason_index'],r['entry_index']) for r in rr})==len(rr)
assert len(candidates)==m['candidate_count'] and sum(t['eligible']=='True' for t in candidates)==len(tr)
for a in aa:
 flow=raw[a['nct_id']]['resultsSection']['participantFlowModule'];assert len(flow['periods'])==1
 milestones=flow['periods'][0]['milestones']
 for kind,col in [('STARTED','started'),('COMPLETED','completed')]:
  records=[r for ms in milestones if ms['type']==kind for r in ms['achievements'] if r['groupId']==a['group_id']]
  assert len(records)==1 and a[col]==records[0]['numSubjects']
 if a['count_valid']=='True':
  s,c=int(a['started']),int(a['completed']);assert 0<=c<=s and s>0
  assert math.isclose(float(a['attrition']),(s-c)/s,abs_tol=1e-12)
for r in rr:
 entry=raw[r['nct_id']]['resultsSection']['participantFlowModule']['periods'][int(r['period_index'])]['dropWithdraws'][int(r['reason_index'])]
 assert entry['type']==r['reason_label']
 item=entry['reasons'][int(r['entry_index'])];assert item['groupId']==r['group_id'] and str(item.get('numSubjects',''))==r['count']
for t in tr:
 if t['usable']!='True':assert not t['attrition'];continue
 rows=[a for a in aa if a['nct_id']==t['nct_id']]
 assert sum(int(a['started']) for a in rows)==int(t['started'])
 assert sum(int(a['completed']) for a in rows)==int(t['completed'])
 assert math.isclose(float(t['attrition']),1-int(t['completed'])/int(t['started']),abs_tol=1e-12)
 assert 0<=float(t['attrition'])<=1
 pg=raw[t['nct_id']]['protocolSection']['armsInterventionsModule']['armGroups']
 assert len(pg)==len(rows)
 for a in rows:
  matches=[g for g in pg if ' '.join(g['label'].casefold().split())==' '.join(a['flow_title'].casefold().split())]
  assert len(matches)==1 and matches[0]['type']==a['arm_type']
for p in pairs:
 rows=[a for a in aa if a['nct_id']==p['nct_id']];assert len(rows)==2
 e=next(a for a in rows if a['group_id']==p['experimental_group_id']);c=next(a for a in rows if a['group_id']==p['comparator_group_id'])
 assert e['arm_type']=='EXPERIMENTAL' and c['arm_type'] in {'PLACEBO_COMPARATOR','ACTIVE_COMPARATOR','SHAM_COMPARATOR','NO_INTERVENTION'}
 assert math.isclose(float(p['difference_pp']),100*(float(e['attrition'])-float(c['attrition'])),abs_tol=1e-12)
plot=read('plot_landscape');assert len(plot)==sum(t['usable']=='True' and bool(t['completion_year']) for t in tr)
pv=read('plot_pairs');assert len(pv)==len(pairs);assert [float(p['difference_pp']) for p in pv]==sorted(float(p['difference_pp']) for p in pv)
ids={t['nct_id'] for t in tr if t['usable']=='True'}
keys={(a['nct_id'],a['group_id']) for a in aa if a['nct_id'] in ids and a['reason_reconciles']=='True'}
agg=collections.Counter()
for r in rr:
 if (r['nct_id'],r['group_id']) in keys:agg[r['reason_label']]+=int(r['count'])
assert dict(agg)=={r['reason_label']:int(r['reported_count']) for r in read('plot_reasons_all')}
assert sum(agg.values())==sum(int(a['noncompleted']) for a in aa if (a['nct_id'],a['group_id']) in keys)
with tempfile.TemporaryDirectory() as tmp:
 subprocess.run([sys.executable,'scripts/process.py','--out',tmp],check=True,stdout=subprocess.DEVNULL)
 for name in ['candidates.csv','trials.csv','arms.csv','reasons.csv','pairs.csv','summary.json','source_manifest.json']:
  assert (P/name).read_bytes()==(pathlib.Path(tmp)/name).read_bytes(),name+' not reproducible'
# Rebuild figures and verify numeric inputs and SVG output are byte-stable.
paths=list(P.glob('plot_*.csv'))+list(pathlib.Path('figures').glob('*.svg'))+[P/'findings.json']
before={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
subprocess.run([sys.executable,'scripts/figures.py'],check=True,stdout=subprocess.DEVNULL)
assert all(hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()==h for p,h in before.items())
report={'result':'PASS','candidate_studies':len(candidates),'trial_rows':len(tr),'arm_rows_checked_against_raw':len(aa),'reason_rows_checked_against_raw':len(rr),'pairs_checked':len(pairs),'unique_keys':True,'valid_denominators_ranges_aggregates':True,'raw_sha256_verified':True,'reprocessing_byte_identical':True,'figure_svg_and_plot_inputs_byte_identical':True,'missing_completion_year_usable_trials':[t['nct_id'] for t in tr if t['usable']=='True' and not t['completion_year']],'all_zero_completions_usable_trials':[t['nct_id'] for t in tr if t['usable']=='True' and t['completed']=='0'],'figure_inputs':before}
(P/'validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
