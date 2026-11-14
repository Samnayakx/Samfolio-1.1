import re,json,sys
import os
src=open(os.environ.get('JSX','dash.jsx')).read().strip()
PREFIX=os.environ.get('PREFIX','ax')
if src.startswith('('): src=src[1:]
src=src.rstrip(')').strip()
# tokenizer
i=0;n=len(src)
def parse_style(s):
    # s: content inside {{ ... }}
    d={}
    for m in re.finditer(r"(\w+):\s*(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|([\d.\-]+))\s*(?:,|$)",s):
        k=m.group(1); v=m.group(2) if m.group(2) is not None else (m.group(3) if m.group(3) is not None else m.group(4))
        d[k]=v
    return d
def kebab(k):
    if k.startswith('Webkit'): return '-webkit-'+kebab(k[6:]).lstrip('-')
    if k.startswith('Moz'): return '-moz-'+kebab(k[3:]).lstrip('-')
    return re.sub(r'([A-Z])',lambda m:'-'+m.group(1).lower(),k)
UNITLESS={'flexShrink','flexGrow','fontWeight','lineHeight','opacity','zIndex','flex','order'}
def css_of(d):
    out=[]
    for k,v in d.items():
        if k in ('fontSynthesis','MozOsxFontSmoothing','WebkitFontSmoothing','overflowWrap','boxSizing'): continue
        out.append(f"{kebab(k)}:{v}")
    return ';'.join(out)
ATTR={'strokeWidth':'stroke-width','strokeLinecap':'stroke-linecap','strokeLinejoin':'stroke-linejoin','fillRule':'fill-rule','clipRule':'clip-rule','stopColor':'stop-color','stopOpacity':'stop-opacity','strokeDasharray':'stroke-dasharray','strokeOpacity':'stroke-opacity','fillOpacity':'fill-opacity','clipPath':'clip-path','className':'class'}
class N:
    def __init__(s,tag): s.tag=tag;s.attrs={};s.style=None;s.kids=[]
def parse():
    global i
    # parse element at src[i]=='<'
    m=re.compile(r'<([A-Za-z][\w:]*)').match(src,i); tag=m.group(1); i=m.end()
    node=N(tag)
    while True:
        while src[i].isspace(): i+=1
        if src.startswith('/>',i): i+=2; return node
        if src[i]=='>': i+=1; break
        m=re.compile(r'([\w:-]+)=').match(src,i); name=m.group(1); i=m.end()
        if src.startswith('{{',i):
            j=src.index('}}',i); node.style=parse_style(src[i+2:j]+','); i=j+2
        elif src[i]=='"':
            j=src.index('"',i+1); node.attrs[name]=src[i+1:j]; i=j+1
        elif src[i]=='{':
            j=src.index('}',i); v=src[i+1:j].strip().strip("'\""); node.attrs[name]=v; i=j+1
    while True:
        if src.startswith('</',i):
            i=src.index('>',i)+1; return node
        if src[i]=='<': node.kids.append(parse()); continue
        j=i
        while j<n and src[j] not in '<': j+=1
        raw=src[i:j]; i=j
        txt=raw.strip()
        if txt:
            if re.search(r'[ \t]$',raw): txt+=' '
            if re.match(r'^[ \t]+\S',raw): txt=' '+txt
            node.kids.append(txt)
root=parse()
json_dump=None
classes={}
def cls_for(d):
    c=css_of(d)
    if not c: return None
    if c not in classes: classes[c]='a%d'%len(classes)
    return classes[c]
def attrname(k):
    if k in ATTR: return ATTR[k]
    if k in ('viewBox','gradientUnits','preserveAspectRatio','clipPathUnits','gradientTransform'): return k
    return re.sub(r'([A-Z])',lambda m:'-'+m.group(1).lower(),k)
def esc(t): return t.replace('&amp;','&amp;')
def emit(nd,idx=None):
    if isinstance(nd,str): return nd
    a=''
    for k,v in nd.attrs.items():
        if k=='xmlns' or k=='xmlnsXlink': continue
        a+=f' {attrname(k)}="{v}"'
    if nd.style:
        cl=cls_for(nd.style)
        if cl: a+=f' class="{cl}"'
    inner=''.join(emit(k) for k in nd.kids)
    if not nd.kids and nd.tag in ('path','rect','circle','line','polyline','stop','ellipse','polygon','img','br'): return f'<{nd.tag}{a}/>'
    return f'<{nd.tag}{a}>{inner}</{nd.tag}>'
def outline(nd,depth=0,path='0'):
    if isinstance(nd,str): return
    txt=' '.join(k for k in nd.kids if isinstance(k,str))[:50]
    st=nd.style or {}
    print('  '*depth+f"[{path}] {nd.tag} w={st.get('width','')} h={st.get('height','')} bg={st.get('backgroundColor','')[:22]} {txt}")
    if depth<int(sys.argv[1]) if len(sys.argv)>1 else 4:
        for j,k in enumerate(nd.kids): outline(k,depth+1,path+'.'+str(j))
import pickle
pickle.dump((root,),open('tree.pkl','wb')) if False else None
if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='outline':
        globals()['DEPTH']=int(sys.argv[2])
        def ol(nd,depth,path):
            if isinstance(nd,str): return
            txt=' '.join(k for k in nd.kids if isinstance(k,str))[:50]
            st=nd.style or {}
            if nd.tag in('path','rect','circle','line','defs','linearGradient','stop','polyline'): return
            print('  '*depth+f"[{path}] {nd.tag} w={st.get('width','')} h={st.get('height','')} bg={st.get('backgroundColor','')[:24]} {txt}")
            if depth<DEPTH:
                for j,k in enumerate(nd.kids): ol(k,depth+1,path+'.'+str(j))
        ol(root,0,'0')
def at(path):
    nd=root
    for p in path.split('.')[1:]: nd=nd.kids[int(p)]
    return nd
