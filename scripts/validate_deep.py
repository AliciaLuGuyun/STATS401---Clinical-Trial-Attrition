"""Independent extended-field checks, source-cell audit, model checks and deterministic rebuild."""
import csv, datetime, hashlib, json, math, pathlib, subprocess, sys
import numpy as np
from process import load_snapshot, norm
P=pathlib.Path('data/analysis');payload=json.loads(pathlib.Path('final/data.json').read_text())
studies,_=load_snapshot(pathlib.Path('data/raw/2026-09-13'));raw={s['protocolSection']['identificationModule']['nctId']:s for s in studies}
trials=payload['trials'];assert len({t['nct_id'] for t in trials})==len(trials)
for t in trials:
    p=raw[t['nct_id']]['protocolSection'];assert t['enrollment']==int(p['designModule']['enrollmentInfo']['count'])
    assert t['site_count']==(len(p.get('contactsLocationsModule',{}).get('locations',[])) or None)
    assert t['allocation']=='RANDOMIZED';assert t['number_randomized'] is None
    assert t['start_date']==p['statusModule'].get('startDateStruct',{}).get('date','')
    assert t['completion_date']==p['statusModule'].get('completionDateStruct',{}).get('date','')
    assert t['phase_III_present']==('PHASE3' in p['designModule'].get('phases',[]))
    assert t['enrollment_type']==p['designModule']['enrollmentInfo'].get('type','')
    ints=p['armsInterventionsModule'].get('interventions',[])
    assert t['intervention_types']==' + '.join(sorted({v.get('type','UNKNOWN') for v in ints}))
    assert t['interventions']==' | '.join(v.get('name','') for v in ints)
    if t['calendar_span_days'] is not None:
        assert len(t['start_date'])==len(t['completion_date'])==10
        assert t['calendar_span_days']==(datetime.date.fromisoformat(t['completion_date'])-datetime.date.fromisoformat(t['start_date'])).days>=0
    assert t['enrollment_minus_started']==(t['enrollment']-t['started'] if t['started'] is not None else None)
    assert t['protocol_arm_count']==(len(p['armsInterventionsModule'].get('armGroups',[])) or None)
    if t['usable']:
        assert len(t['arms'])==t['protocol_arm_count']
        assert t['started']==sum(a['started'] for a in t['arms'])
        assert t['completed']==sum(a['completed'] for a in t['arms'])
        assert math.isclose(t['attrition'],(t['started']-t['completed'])/t['started'],abs_tol=1e-12)
        assert 0<=t['attrition']<=1
    else:assert t['attrition'] is None
    for o in t['primary_outcomes']:
        src=raw[t['nct_id']]['resultsSection']['outcomeMeasuresModule']['outcomeMeasures'][o['outcome_index']]
        assert src['type']=='PRIMARY' and src['title']==o['title']
        for m in o['measurements']:
            original=src['classes'][m['class_index']]['categories'][m['category_index']]['measurements'][m['measurement_index']]
            assert original.get('value','')==m['raw_value'] and original['groupId']==m['group_id']
            assert json.loads(m['denominators_json'])==src.get('denoms',[])
        if o['exact_flow_group_link']:
            assert len(src['groups'])==len(t['arms'])
            assert len({norm(g['title']) for g in src['groups']})==len(src['groups'])
            assert {norm(g['title']) for g in src['groups']}=={norm(a['flow_title']) for a in t['arms']}
for row in csv.DictReader((P/'reporting_by_year.csv').open()):
    year=int(row['completion_year']) if row['completion_year'] else None
    members=[t for t in trials if t['completion_year']==year]
    assert int(row['eligible_n'])==len(members)
    assert int(row['usable_n'])==sum(t['usable'] for t in members)
    assert int(row['reason_entries_n'])==sum(t['reporting']['reason_counts_present'] for t in members)
for row in payload['coverage']:
    cohort=[t for t in trials if row['cohort']=='eligible' or t['usable']]
    assert len(cohort)==row['total']
    assert row['present']==sum(t[row['variable']] is not None and t[row['variable']]!='' for t in cohort)
    assert row['present']+row['missing']==row['total']
for row in payload['subgroups']:
    cohort=[t for t in trials if t[row['variable']]==row['level']]
    assert len(cohort)==row['eligible_n'];subset=[t for t in cohort if t['usable']]
    assert len(subset)==row['n']
    if subset:assert math.isclose(row['median'],float(np.median([t['attrition'] for t in subset])))
for sensitivity in ['all_usable','omit_zero_completions']:
    r=[t for t in trials if t['usable'] and not (sensitivity=='omit_zero_completions' and t['reported_zero_completions'])]
    X=np.array([[1,np.log2(t['started']),t['sponsor_class']=='INDUSTRY',t['phase_III_present']] for t in r],dtype=float);y=np.array([t['attrition']*100 for t in r]);assert np.linalg.matrix_rank(X)==4
    coeff=[v for v in payload['model'] if v['sensitivity']==sensitivity];beta=np.array([v['estimate_pp'] for v in coeff]);assert np.allclose(X.T@(y-X@beta),0,atol=1e-8)
    assert all(c['bootstrap_low_pp']<=c['bootstrap_high_pp'] and c['n']==len(r) for c in coeff)
# Check published-derived pairs against protocol arm types, not just row order.
for pair in payload['pairs']:
    t=next(t for t in trials if t['nct_id']==pair['nct_id']);assert t['usable'] and len(t['arms'])==2
    exp=next(a for a in t['arms'] if a['group_id']==pair['experimental_group_id']);comp=next(a for a in t['arms'] if a['group_id']==pair['comparator_group_id'])
    assert exp['arm_type']=='EXPERIMENTAL';assert comp['arm_type'] in {'ACTIVE_COMPARATOR','PLACEBO_COMPARATOR','SHAM_COMPARATOR','NO_INTERVENTION'}
    assert math.isclose(pair['absolute_difference_pp'],abs(100*(exp['attrition']-comp['attrition'])),abs_tol=1e-10)
paths=list(P.glob('*.csv'))+[P/'summary.json',pathlib.Path('final/data.json')]
hashes={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
subprocess.run([sys.executable,'scripts/deepen.py'],check=True,stdout=subprocess.DEVNULL)
assert all(hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()==h for p,h in hashes.items())
result=dict(result='PASS',trials_checked=len(trials),outcomes_checked=sum(len(t['primary_outcomes']) for t in trials),outcome_cells_checked=sum(len(o['measurements']) for t in trials for o in t['primary_outcomes']),pairs_checked=len(payload['pairs']),raw_hashes_verified=True,all_extended_fields_source_checked=True,model_normal_equations_checked=True,byte_identical_rebuild=True,outputs_sha256=hashes)
(P/'validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='outputs_sha256'},indent=2))
