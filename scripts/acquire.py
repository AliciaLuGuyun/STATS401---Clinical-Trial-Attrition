"""Archive complete paginated ClinicalTrials.gov API responses without overwriting."""
import argparse, datetime, hashlib, json, pathlib, subprocess, urllib.parse

BASE = 'https://clinicaltrials.gov/api/v2/studies'
QUERY = {'query.cond': 'Major Depressive Disorder', 'filter.overallStatus': 'COMPLETED',
         'filter.advanced': 'AREA[StudyType]INTERVENTIONAL AND AREA[Phase](PHASE2 OR PHASE3) AND AREA[HasResults]true',
         'format': 'json', 'pageSize': '100', 'countTotal': 'true'}

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--output', required=True)
    args = parser.parse_args(); folder = pathlib.Path(args.output); folder.mkdir(parents=True, exist_ok=False)
    manifest = {'retrieved_start_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'endpoint': BASE, 'query': QUERY, 'pages': []}
    params = dict(QUERY); total = 0
    while True:
        url = BASE + '?' + urllib.parse.urlencode(params)
        target = folder / ('page_%03d.json' % (len(manifest['pages'])+1))
        subprocess.run(['curl', '--silent', '--show-error', '--fail', '--retry', '3', '--max-time', '90', url, '-o', str(target)], check=True)
        raw = target.read_bytes(); data = json.loads(raw)
        total += len(data['studies'])
        manifest['pages'].append({'file':target.name, 'url':url, 'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(), 'studies':len(data['studies'])})
        manifest['api_total_count'] = data.get('totalCount', manifest.get('api_total_count'))
        print(target, len(data['studies']), flush=True)
        if not data.get('nextPageToken'): break
        params['pageToken'] = data['nextPageToken']
    manifest['candidate_count'] = total
    manifest['retrieved_end_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    assert total == manifest['api_total_count'], 'Pagination count mismatch'
    (folder/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Archived',total,'candidates')
if __name__ == '__main__': main()
