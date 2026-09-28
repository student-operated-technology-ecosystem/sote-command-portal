(() => {
  const API = 'https://api.github.com/repos/student-operated-technology-ecosystem/CIT-205-classroom/contents/knowledge/student-articles?ref=main';
  const RAW = 'https://raw.githubusercontent.com/student-operated-technology-ecosystem/CIT-205-classroom/main/knowledge/student-articles/';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\`([^`]+)\`/g,'<code>$1</code>');

  function markdown(text) {
    const lines=text.split(/\r?\n/); let out='', list=false, code=false, buf=[];
    const close=()=>{ if(list){out+='</ul>'; list=false;} };
    for (const line of lines) {
      if (line.startsWith('~~~') || line.startsWith('```')) { if(code){out+='<pre><code>'+esc(buf.join('\n'))+'</code></pre>';buf=[];code=false;}else{close();code=true;} continue; }
      if(code){buf.push(line);continue;}
      if(/^# /.test(line)){close();out+='<h1>'+inline(line.slice(2))+'</h1>';continue;}
      if(/^#### /.test(line)){close();out+='<h4>'+inline(line.slice(5))+'</h4>';continue;}
      if(/^### /.test(line)){close();out+='<h3>'+inline(line.slice(4))+'</h3>';continue;}
      if(/^## /.test(line)){close();out+='<h2>'+inline(line.slice(3))+'</h2>';continue;}
      if(/^- /.test(line)){if(!list){out+='<ul>';list=true;}out+='<li>'+inline(line.slice(2))+'</li>';continue;}
      close(); if(!line.trim()) continue; out+='<p>'+inline(line)+'</p>';
    }
    close(); return out;
  }

  function meta(text, name) {
    return (text.match(new RegExp('^\\*\\*'+name+':\\*\\*\\s*(.+)$','mi'))||[])[1]?.trim() || '';
  }

  async function classroomFiles() {
    const r=await fetch(API,{headers:{Accept:'application/vnd.github+json'}}); if(!r.ok) throw Error('classroom catalog');
    return (await r.json()).filter(f => f.type==='file' && f.name.endsWith('.md') && f.name!=='README.md');
  }

  async function addClassroomCards() {
    const host=document.querySelector('[data-kb-list]'); if(!host) return;
    try {
      const files=await classroomFiles();
      const articles=await Promise.all(files.map(async f => {
        const text=await fetch(RAW+encodeURIComponent(f.name)).then(r=>r.text());
        const heading=(text.match(/^#\s+(.+)$/m)||[])[1] || f.name.replace(/\.md$/,'');
        const title=heading.replace(/^KA-[^—-]+[—-]\s*/i,'');
        const summary=meta(text,'Summary') || meta(text,'Purpose') || 'Classroom-accepted knowledge article.';
        return {file:f.name,title,summary};
      }));
      host.insertAdjacentHTML('beforeend', articles.map(a => `
        <article class="project-card kb-card" data-kb-card data-category="classroom">
          <div class="project-card-top"><span class="status-badge status-online">Classroom Accepted</span><span class="priority-pill">CIT-205</span></div>
          <h3><a class="kb-card-link" href="knowledge-article.html?source=classroom&file=${encodeURIComponent(a.file)}">${esc(a.title)}</a></h3>
          <p>${esc(a.summary)}</p>
          <div class="project-meta"><span><strong>Category</strong>Classroom knowledge</span><span><strong>Source</strong>CIT-205 Classroom</span></div>
          <a class="button secondary kb-open" href="knowledge-article.html?source=classroom&file=${encodeURIComponent(a.file)}">Open article →</a>
        </article>`).join(''));
      if(typeof applyKbFilters==='function') applyKbFilters();
    } catch(e) { console.warn('Classroom Knowledge Base unavailable', e); }
  }

  async function readClassroomArticle() {
    const root=document.querySelector('[data-ka-reader]');
    const p=new URLSearchParams(location.search);
    if(!root || p.get('source')!=='classroom') return false;
    const file=p.get('file') || '';
    if(!/^KA-[A-Za-z0-9_.-]+\.md$/.test(file)) { root.innerHTML='<div class="callout"><h1>Article not found</h1><p>Return to the Knowledge Base and choose an available article.</p></div>'; return true; }
    try {
      const r=await fetch(RAW+encodeURIComponent(file)); if(!r.ok) throw Error(); const text=await r.text();
      root.innerHTML='<div class="ka-status-warning"><strong>Classroom Accepted</strong><span>Accepted for CIT-205 learning. This is not authorization to modify production or SOTE infrastructure.</span></div><article class="ka-document">'+markdown(text)+'</article><div class="destination-links"><a href="knowledge-contribute.html">Found a gap? Suggest an improvement →</a></div>';
      document.title='CIT-205 Knowledge Article | SOTE Command Portal';
    } catch(e) { root.innerHTML='<div class="callout"><h1>Article unavailable</h1><p>The classroom article could not be loaded.</p></div>'; }
    return true;
  }

  if(document.querySelector('[data-kb-list]')) addClassroomCards();
  if(new URLSearchParams(location.search).get('source')==='classroom') readClassroomArticle();
})();