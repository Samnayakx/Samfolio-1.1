import subprocess,os,sys,string
names=["role-fork","quickstart","first-call","dashboard-empty","tool-catalog","playground-auth","accounts","gateway-builder","trace-policy","trace-auth","trace-states","policy-simulator","policy-conflict","policy-replay","agent-summoned","agent-docked","agent-home","agent-charts"]
OUT='/Users/sambitnayak/Documents/SAMFOLIO 1.1/assets/arcade-dash/f-'
logo=open('dash.jsx').read()
import re
LOGO=re.search(r'<path fillRule="evenodd" d="(M1153\.8[^"]+)"',logo).group(1)
for i,n in enumerate(names):
    f=f'feat/{n}.jsx'
    if not os.path.exists(f): print('missing',n); continue
    t=open(f).read()
    if 'd="LOGO"' in t: t=t.replace('d="LOGO"','d="'+LOGO+'"'); open('feat/'+n+'.full.jsx','w').write(t); src='feat/'+n+'.full.jsx'
    else: src=f
    pfx='f'+string.ascii_lowercase[i]
    env=dict(os.environ,JSX=src,PREFIX=pfx,TAGS='tags-none.json',OUT=OUT+n)
    r=subprocess.run(['python3','build2.py'],env=env,capture_output=True,text=True)
    print(n,pfx,r.stdout.strip().split('/')[-1] if r.returncode==0 else r.stderr[-300:])
