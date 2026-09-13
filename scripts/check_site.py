"""Verify published HTML and every local link/asset match the checked-out version."""
import argparse,concurrent.futures,hashlib,json,pathlib,subprocess,urllib.parse
from html.parser import HTMLParser
class Links(HTMLParser):
    def __init__(self):super().__init__();self.paths={'index.html'}
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key in {'href','src'} and value and not value.startswith(('https:','http:','#','mailto:','data:')):
                self.paths.add(value.split('#')[0])
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--url',default='https://alicialuguyun.github.io/STATS401---Clinical-Trial-Attrition/');ap.add_argument('--output');args=ap.parse_args()
    parser=Links();parser.feed(pathlib.Path('index.html').read_text())
    def check(path):
        url=urllib.parse.urljoin(args.url,path)
        r=subprocess.run(['curl','-fsSL','--retry','2','--max-time','45',url],capture_output=True,check=True)
        expected=pathlib.Path(path).read_bytes();assert r.stdout==expected,'Deployed bytes differ: '+path
        return {'path':path,'bytes':len(r.stdout),'sha256':hashlib.sha256(r.stdout).hexdigest(),'matches_local':True}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,sorted(parser.paths)))
    report={'url':args.url,'status':'PASS','files_checked':results,'note':'HTTP/content verification; browser rendering is checked separately.'}
    if args.output:pathlib.Path(args.output).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
if __name__=='__main__':main()
