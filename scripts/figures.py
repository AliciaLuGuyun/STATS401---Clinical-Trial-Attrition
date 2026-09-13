"""Generate three static figures and their exact tabular plotting inputs."""
import collections,csv,json,os,pathlib,statistics
os.environ.setdefault('MPLCONFIGDIR',str(pathlib.Path('.mplconfig').resolve()))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter,MaxNLocator
from process import write_csv
P=pathlib.Path('data/processed');F=pathlib.Path('figures');F.mkdir(exist_ok=True)
read=lambda n:list(csv.DictReader((P/(n+'.csv')).open()))
trials=[t for t in read('trials') if t['usable']=='True' and t['completion_year']]
for t in trials:
 for k in ['completion_year','started','completed']:t[k]=int(t[k])
 t['attrition']=float(t['attrition'])
trials.sort(key=lambda t:(t['completion_year'],t['nct_id']))
pairs=read('pairs')
for p in pairs:p['difference_pp']=float(p['difference_pp'])
pairs.sort(key=lambda p:(p['difference_pp'],p['nct_id']))
ids={t['nct_id'] for t in read('trials') if t['usable']=='True'}
aa=[a for a in read('arms') if a['nct_id'] in ids and a['reason_reconciles']=='True']
keys={(a['nct_id'],a['group_id']) for a in aa}
rr=[r for r in read('reasons') if (r['nct_id'],r['group_id']) in keys]
counts=collections.Counter();studies=collections.defaultdict(set)
for r in rr:counts[r['reason_label']]+=int(r['count']);studies[r['reason_label']].add(r['nct_id'])
ranked=sorted(counts.items(),key=lambda v:(-v[1],v[0]))
reason_rows=[{'reason_label':k,'reported_count':v,'reporting_trials':len(studies[k])} for k,v in ranked]
write_csv(P/'plot_landscape.csv',trials);write_csv(P/'plot_pairs.csv',pairs);write_csv(P/'plot_reasons_all.csv',reason_rows)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'axes.titleweight':'bold','svg.fonttype':'none','svg.hashsalt':'stats401-interim'})
def save(fig,name):
 fig.savefig(F/(name+'.svg'),bbox_inches='tight',metadata={'Date':None})
 svg=F/(name+'.svg');svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines())+'\n')
 fig.savefig(F/(name+'.png'),dpi=160,bbox_inches='tight',metadata={'Software':'STATS401 Matplotlib'})
 plt.close(fig)
fig,ax=plt.subplots(figsize=(10.5,5.7),layout='constrained')
ax.scatter([t['completion_year'] for t in trials],[t['attrition'] for t in trials],s=[t['started']*.25 for t in trials],color='#24657b',alpha=.65,edgecolors='white',linewidth=.6)
ax.set(xlabel='Registered study completion year',ylabel='Non-completion in reported period',ylim=(-.025,1.07),title=f'Attrition across {len(trials)} depression trials')
ax.yaxis.set_major_formatter(PercentFormatter(1));ax.xaxis.set_major_locator(MaxNLocator(integer=True));ax.grid(axis='y',alpha=.2);ax.set_axisbelow(True)
med=statistics.median(t['attrition'] for t in trials);ax.axhline(med,color='#555',ls='--',lw=1);ax.text(min(t['completion_year'] for t in trials),med+.025,f'Median trial: {med:.1%}',fontsize=10)
for t in trials:
 if t['attrition']==1:ax.annotate(t['nct_id']+' · reported 0 completions',(t['completion_year'],1),xytext=(7,-15),textcoords='offset points',fontsize=9)
handles=[ax.scatter([],[],s=n*.25,c='#24657b',alpha=.65,label=f'{n:,}') for n in [100,500,1000]]
ax.legend(handles=handles,title='Participants started\n(bubble area)',loc='upper right',frameon=False,fontsize=9)
save(fig,'01_attrition_landscape')
fig,axes=plt.subplots(1,2,figsize=(12,8),sharex=True,layout='constrained')
limit=max(abs(p['difference_pp']) for p in pairs)+5
half=(len(pairs)+1)//2
for ax,part in zip(axes,[pairs[:half],pairs[half:]]):
 y=list(range(len(part)));vals=[p['difference_pp'] for p in part]
 ax.hlines(y,0,vals,color='#bbb',lw=1)
 ax.scatter(vals,y,color=['#a54b22' if v>0 else '#24657b' for v in vals],s=34)
 ax.set_yticks(y,[p['nct_id'] for p in part],fontsize=9);ax.invert_yaxis();ax.axvline(0,color='#555',lw=1)
 ax.set_xlim(-limit,limit);ax.grid(axis='x',alpha=.18);ax.set_axisbelow(True);ax.set_xlabel('Experimental − comparator (percentage points)')
fig.suptitle(f'Within-trial attrition differences · {len(pairs)} unambiguous two-arm trials',fontsize=14,fontweight='bold')
axes[0].set_title('← Higher in comparator',fontsize=11);axes[1].set_title('Higher in experimental →',fontsize=11)
save(fig,'02_arm_differences')
fig,ax=plt.subplots(figsize=(11,6),layout='constrained');top=ranked[:10];y=list(range(len(top)))
ax.barh(y,[v for k,v in top],color='#24657b',height=.65)
ax.set_yticks(y,[k for k,v in top],fontsize=10);ax.invert_yaxis();ax.set_xlabel('Reported non-completions (participants)');ax.set_title('Ten most frequent original non-completion labels')
ax.set_xlim(0,top[0][1]*1.12);ax.grid(axis='x',alpha=.18);ax.set_axisbelow(True)
for i,(k,v) in enumerate(top):ax.text(v+5,i,f'{v:,}',va='center',fontsize=10)
save(fig,'03_reported_reasons')
findings={'landscape_trials':len(trials),'median_trial_attrition':med,'min_trial_attrition':min(t['attrition'] for t in trials),'max_trial_attrition':max(t['attrition'] for t in trials),'completion_year_min':min(t['completion_year'] for t in trials),'completion_year_max':max(t['completion_year'] for t in trials),'total_started':sum(t['started'] for t in trials),'total_completed':sum(t['completed'] for t in trials),'pairs':len(pairs),'pair_difference_min_pp':min(p['difference_pp'] for p in pairs),'pair_difference_max_pp':max(p['difference_pp'] for p in pairs),'experimental_higher':sum(p['difference_pp']>1e-9 for p in pairs),'comparator_higher':sum(p['difference_pp'] < -1e-9 for p in pairs),'equal':sum(abs(p['difference_pp'])<=1e-9 for p in pairs),'reason_arms':len(aa),'reason_trials':len({a['nct_id'] for a in aa}),'reason_rows_used':len(rr),'reason_label_count':len(ranked),'reason_total':sum(counts.values()),'top10_total':sum(v for k,v in top),'top_reason':top[0][0],'top_reason_count':top[0][1]}
assert sum(counts.values())==sum(int(a['noncompleted']) for a in aa)
(P/'findings.json').write_text(json.dumps(findings,indent=2)+'\n');print(json.dumps(findings,indent=2))
