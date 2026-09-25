(() => {
  const root = document.querySelector('[data-ka-reader]');
  if (!root) return;
  const id = (new URLSearchParams(location.search).get('id') || '').toUpperCase();
  if (!/^KA-00[1-5]$/.test(id)) { root.innerHTML='<div class="callout"><h1>Article not found</h1><p>Return to the Knowledge Base and choose an available article.</p></div>'; return; }

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\`([^\`]+)\`/g,'<code>$1</code>');
  function md(text){
    const lines=text.split(/\r?\n/); let out='', list=false, code=false, buf=[];
    const closeList=()=>{if(list){out+='</ul>';list=false;}};
    for(const line of lines){
      if(line.startsWith('~~~')||line.startsWith('```')){ if(code){out+='<pre><code>'+esc(buf.join('\n'))+'</code></pre>';buf=[];code=false;} else {closeList();code=true;} continue; }
      if(code){buf.push(line);continue;}
      if(/^# /.test(line)){closeList();out+='<h1>'+inline(line.slice(2).replace(/^KA-\d+\s+[—-]\s+/,''))+'</h1>';continue;}
      if(/^#### /.test(line)){closeList();out+='<h4>'+inline(line.slice(5))+'</h4>';continue;}
      if(/^### /.test(line)){closeList();out+='<h3>'+inline(line.slice(4))+'</h3>';continue;}
      if(/^## /.test(line)){closeList();out+='<h2>'+inline(line.slice(3))+'</h2>';continue;}
      if(/^- /.test(line)){if(!list){out+='<ul>';list=true;}out+='<li>'+inline(line.slice(2))+'</li>';continue;}
      closeList();
      if(!line.trim()) continue;
      if(/^\*\*(Version|Status|Knowledge Area|Applies To|Related Missions):\*\*/.test(line)){out+='<p class="ka-meta-line">'+inline(line)+'</p>';continue;}
      out+='<p>'+inline(line)+'</p>';
    }
    closeList(); return out;
  }
  fetch('data/knowledge/'+id+'.md').then(r=>{if(!r.ok)throw Error();return r.text();}).then(text=>{
    const status=(text.match(/^\*\*Status:\*\*\s*(.+)$/m)||[])[1]||'Draft';
    root.innerHTML='<div class="ka-status-warning"><strong>'+esc(status.trim())+'</strong><span>This article is visible for learning and validation. It is not yet approved production guidance.</span></div><article class="ka-document">'+md(text)+'</article>';
    const article = root.querySelector('.ka-document');
    const headings = Array.from(article.querySelectorAll('h2'));
    if (headings.length > 2) {
      const nav = document.createElement('nav');
      nav.className = 'ka-contents';
      nav.setAttribute('aria-label', 'Article contents');
      const label = document.createElement('strong');
      label.textContent = 'On this page';
      nav.append(label);
      headings.forEach((heading, index) => {
        heading.id = 'section-' + (index + 1);
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        nav.append(link);
      });
      article.querySelector('h1')?.after(nav);
    }
    document.title=id+' | SOTE Knowledge Base';
  }).catch(()=>root.innerHTML='<div class="callout"><h1>Article unavailable</h1><p>The public-safe reader copy could not be loaded.</p></div>');
})();
