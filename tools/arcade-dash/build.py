import sys,re,os,json
exec(open('conv.py').read())
CFG=json.load(open(os.environ['TAGS'])) if os.environ.get('TAGS') else {}
TAGS=CFG
def emit2(nd,path='0'):
    if isinstance(nd,str): return nd
    a=''
    for k,v in nd.attrs.items():
        if k in('xmlns','xmlnsXlink'): continue
        a+=f' {attrname(k)}="{v}"'
    if nd.style:
        cl=cls_for(nd.style)
        if cl: a+=f' class="{PREFIX}{cl[1:]}"'
    if path in TAGS: a+=f' data-w="{TAGS[path]}"'
    inner=''.join(emit2(k,path+'.'+str(j)) for j,k in enumerate(nd.kids))
    if not nd.kids and nd.tag in('path','rect','circle','line','polyline','stop','ellipse','polygon','br'): return f'<{nd.tag}{a}/>'
    return f'<{nd.tag}{a}>{inner}</{nd.tag}>'
html=emit2(root)
html=re.sub(r'>\{"([^"]*)"\}<',r'>\1<',html)
css=''
for c,name in classes.items():
    c=re.sub(r'round\((\d+)%, 1px\)',r'\1%',c)
    css+=f'.adx .{PREFIX}{name[1:]}{{{c}}}\n'
out=os.environ['OUT']
os.makedirs(os.path.dirname(out),exist_ok=True)
open(out+'.html','w').write(html); open(out+'.css','w').write(css)
print(out,len(html),len(css),html.count('data-w='),len(TAGS))
