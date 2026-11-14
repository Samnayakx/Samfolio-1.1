import os,re,sys
os.environ['JSX']='dash.jsx'; sys.argv=['x']
exec(open('conv.py').read())
def st(**k): return "{{ "+", ".join(f"{a}: {v if isinstance(v,(int,float)) else repr(v)}" for a,v in k.items())+" }}"
def d(style,*kids): return f"<div style={st(**style)}>"+"".join(kids)+"</div>"
def tx(style,text): return d(style,text)
def inter(**k): return dict(boxSizing='border-box',fontFamily='"Inter", system-ui, sans-serif',**k)
V=lambda n:f'var(--color-{n})'
btn=lambda t: d(dict(backgroundColor=V('surface-2'),borderRadius='8px',boxSizing='border-box',paddingBlock='6px',paddingInline='12px'),tx(inter(color=V('text'),fontSize='13px',lineHeight='16px'),t))
def need(dot,title,sub,b,border):
    return d(dict(alignItems='center',backgroundColor=V('surface-1'),borderColor=border,borderRadius='12px',borderStyle='solid',borderWidth='1px',boxSizing='border-box',display='flex',gap='12px',paddingBlock='14px',paddingInline='16px'),
      d(dict(backgroundColor=dot,borderRadius='999px',boxSizing='border-box',flexShrink=0,height='8px',width='8px')),
      d(dict(boxSizing='border-box',display='flex',flexDirection='column',flexGrow=1,gap='2px'),tx(inter(color=V('text'),fontSize='14px',fontWeight=500,lineHeight='18px'),title),tx(inter(color=V('text-muted'),fontSize='12px',lineHeight='16px'),sub)),btn(b))
def chg(tag,soft,text,when,last=False):
    bd={} if last else dict(borderBottomColor=V('border'),borderBottomStyle='solid',borderBottomWidth='1px')
    return d(dict(alignItems='center',boxSizing='border-box',display='flex',gap='12px',paddingBlock='12px',paddingInline='4px',**bd),
      d(dict(backgroundColor=soft,borderRadius='999px',boxSizing='border-box',flexShrink=0,paddingBlock='3px',paddingInline='8px',textAlign='center',width='72px'),tx(inter(color=V('text'),fontSize='11px',lineHeight='14px',textAlign='center'),tag)),
      tx(inter(color=V('text'),flexGrow=1,fontSize='13px',lineHeight='16px'),text),tx(inter(color=V('text-muted'),flexShrink=0,fontSize='12px',lineHeight='16px'),when))
chip=lambda t: d(dict(borderColor=V('border-strong'),borderRadius='999px',borderStyle='solid',borderWidth='1px',boxSizing='border-box',paddingBlock='8px',paddingInline='14px'),tx(inter(color=V('text-muted'),fontSize='13px',lineHeight='16px'),t))
colhead=lambda a,b: d(dict(alignItems='center',boxSizing='border-box',display='flex',justifyContent='space-between',paddingBottom='10px'),tx(inter(color=V('text-muted'),fontSize='11px',letterSpacing='0.08em',lineHeight='14px',textTransform='uppercase'),a),tx(inter(color=V('text-muted'),fontSize='12px',lineHeight='16px'),b))
col=dict(boxSizing='border-box',display='flex',flexBasis='0px',flexDirection='column',flexGrow=1,flexShrink=1,gap='2px',minWidth='0px')
SEND='<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: \'inline-block\', flexShrink: 0 }}><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>'
prompt=d(dict(backgroundColor=V('surface-1'),borderColor=V('border-strong'),borderRadius='16px',borderStyle='solid',borderWidth='1px',boxSizing='border-box',display='flex',flexDirection='column',gap='14px',padding='20px'),
  tx(inter(color=V('text-faint'),fontSize='16px',lineHeight='24px'),'Ask, or tell the agent what to do. For example: Let our support bot post to Slack, but only in two channels.'),
  d(dict(alignItems='center',boxSizing='border-box',display='flex',gap='8px'),
    d(dict(alignItems='center',backgroundColor=V('surface-2'),borderRadius='8px',boxSizing='border-box',display='flex',gap='6px',paddingBlock='6px',paddingInline='10px'),tx(inter(color=V('text'),fontSize='12px',lineHeight='16px'),'Ask')),
    d(dict(alignItems='center',borderRadius='8px',boxSizing='border-box',display='flex',paddingBlock='6px',paddingInline='10px'),tx(inter(color=V('text-muted'),fontSize='12px',lineHeight='16px'),'Draft changes')),
    d(dict(boxSizing='border-box',flexGrow=1)),
    d(dict(alignItems='center',backgroundColor=V('coral'),borderRadius='999px',boxSizing='border-box',display='flex',flexShrink=0,height='32px',justifyContent='center',width='32px'),SEND)))
body=d(dict(boxSizing='border-box',display='flex',flexBasis='0%',flexDirection='column',flexGrow=1,gap='24px',padding='32px'),
  d(dict(boxSizing='border-box',display='flex',flexDirection='column',gap='4px'),tx(inter(color=V('text'),fontSize='28px',fontWeight=600,letterSpacing='-0.03em',lineHeight='34px'),'What do you want to get done?'),tx(inter(color=V('text-muted'),fontSize='14px',lineHeight='20px'),'Describe it and the Arcade Agent drafts it. You review and approve every change here.')),
  d(dict(boxSizing='border-box',display='flex',flexDirection='column',gap='20px',width='100%'),prompt,
    d(dict(boxSizing='border-box',display='flex',gap='8px'),chip('Why did my last run fail?'),chip('Build a gateway for Cursor'),chip('Tighten Slack posting rules')),
    d(dict(boxSizing='border-box',display='flex',gap='20px',paddingTop='12px',width='100%'),
      d(col,colhead('Needs you','3 items'),need(V('marigold'),'4 Slack posts waiting for approval','Bug Report Agent, oldest 8 min','Review',V('marigold-border')),need(V('data'),'Policy draft v4 is ready to review','Drafted by Arcade Agent, 12 calls would change','Review',V('border')),need(V('coral'),'Google token expired for 3 users','Runs using Gmail tools will fail','Re-authorize',V('border'))),
      d(col,colhead('Recent changes','Audit logs'),chg('Agent',V('data-soft'),'Drafted policy v4 (allow #support-escalations)','4 min ago'),chg('You',V('surface-2'),'Approved 2 Slack posts from Bug Report Agent','1 h ago'),chg('Agent',V('data-soft'),'Tightened gateway "Support bot": removed Gmail.deleteEmail','Yesterday'),chg('API',V('surface-2'),'Created key for CI, shown once','Yesterday',True)))))
src=body; i=0
node=parse()
main=root.kids[1]; assert main.kids[1].tag=='div'
main.kids[1]=node
def emit2(nd):
    if isinstance(nd,str): return nd
    a=''
    for k,v in nd.attrs.items():
        if k in('xmlns','xmlnsXlink'): continue
        a+=f' {attrname(k)}="{v}"'
    if nd.style:
        cl=cls_for(nd.style)
        if cl: a+=f' class="fq{cl[1:]}"'
    inner=''.join(emit2(k) for k in nd.kids)
    if not nd.kids and nd.tag in('path','rect','circle','line','polyline','stop','ellipse','polygon','br'): return f'<{nd.tag}{a}/>'
    return f'<{nd.tag}{a}>{inner}</{nd.tag}>'
html=emit2(root)
css=''.join('.adx .fq%s{%s}\n'%(n[1:],re.sub(r'round\((\d+)%, 1px\)',r'\1%',c)) for c,n in classes.items())
O='/Users/sambitnayak/Documents/SAMFOLIO 1.1/assets/arcade-dash/f-agent-home'
open(O+'.html','w').write(html); open(O+'.css','w').write(css); print('agent-home',len(html),len(css))
