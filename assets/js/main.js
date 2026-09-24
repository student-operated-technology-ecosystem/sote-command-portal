
/* Site-wide public shell normalization */
(() => {
  const script = document.currentScript;
  const siteRoot = script ? new URL('../../', script.src).pathname : '/';
  const href = file => siteRoot + file;
  const bannerText = 'External Testing Preview — Not an official public CCAC website.';

  let banner = document.querySelector('.prototype-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'prototype-banner';
    document.body.prepend(banner);
  }
  banner.textContent = bannerText;

  const header = document.querySelector('.site-header');
  if (header) {
    const current = location.pathname.split('/').pop() || 'index.html';
    const exploreFiles = ['ecosystem.html','tour.html','characters.html','zones.html','badges.html','student-technology-corps.html','corps.html','mission-board.html','tour-mode.html','tour-guide-kit.html','environment-map.html','start-here.html'];
    const activeFor = file => {
      if (file === 'ecosystem.html' && (exploreFiles.includes(current) || location.pathname.includes('/characters/') || location.pathname.includes('/missions/') || location.pathname.includes('/zones/') || location.pathname.includes('/spaces/') || location.pathname.includes('/pages/'))) return ' class="active"';
      return current === file ? ' class="active"' : '';
    };
    header.innerHTML = '<div class="container header-inner">' +
      '<a class="brand" href="'+href('index.html')+'" aria-label="SOTE Command Portal home">' +
      '<img src="'+href('assets/img/brand/sote_paw_badge_icon.webp')+'" alt="" width="52" height="52">' +
      '<span><strong>SOTE Command Portal</strong><small>Student-Operated Technology Ecosystem</small></span></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>' +
      '<nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">' +
      '<a'+activeFor('index.html')+' href="'+href('index.html')+'">Home</a>' +
      '<a'+activeFor('ace-help-desk.html')+' href="'+href('ace-help-desk.html')+'">Ace Help Desk</a>' +
      '<a'+activeFor('knowledge-base.html')+' href="'+href('knowledge-base.html')+'">Knowledge Base</a>' +
      '<a'+activeFor('projects.html')+' href="'+href('projects.html')+'">Projects</a>' +
      '<a'+activeFor('ecosystem.html')+' href="'+href('ecosystem.html')+'">Explore SOTE</a>' +
      '<a'+activeFor('operator.html')+' href="'+href('operator.html')+'">Operator Login</a>' +
      '</nav></div>';
    const button = header.querySelector('.nav-toggle');
    const nav = header.querySelector('#primary-nav');
    button?.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
    nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      button?.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) {
        nav?.classList.remove('open');
        button?.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        nav?.classList.remove('open');
        button?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('.site-footer').forEach(footer => {
    footer.querySelectorAll('p').forEach(p => {
      if (/static package|true baseline|portal version|canonical baseline/i.test(p.textContent)) {
        p.textContent = 'Student-Operated Technology Ecosystem';
      }
    });
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (node.parentElement?.closest('.prototype-banner')) return;
    node.nodeValue = node.nodeValue
      .replace(/Prototype Preview/gi, 'External Testing Preview')
      .replace(/Working draft for SOTE review and tester feedback\.?/gi, '')
      .replace(/\bv0\.\d+\s+(?:approved[- ]media\s+)?baseline\b/gi, '')
      .replace(/\bDemo mission, fully functional\b/gi, 'Visitor mission')
      .replace(/\bTechnology Cadet demo mission\b/gi, 'Technology Cadet mission')
      .replace(/\bTechnology Cadet demo\b/gi, 'Technology Cadet mission')
      .replace(/\bThis demo runs\b/gi, 'This mission runs')
      .replace(/\bv0\.8 media note:\s*/gi, 'Media note: ');
  });
})();

const filterInput = document.querySelector('[data-filter-input]');
if (filterInput) {
  filterInput.addEventListener('input', () => {
    const term = filterInput.value.trim().toLowerCase();
    applyProjectFilters();
  });
}


// v0.3 guided tour controls
const tourButtons = Array.from(document.querySelectorAll('[data-tour-target]'));
const tourStops = Array.from(document.querySelectorAll('[data-tour-stop]'));
function showTourStop(id) {
  if (!tourStops.length) return;
  tourStops.forEach(stop => stop.classList.toggle('active', stop.dataset.tourStop === id));
  tourButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tourTarget === id));
}
tourButtons.forEach(btn => btn.addEventListener('click', () => showTourStop(btn.dataset.tourTarget)));
document.querySelectorAll('[data-tour-next]').forEach(btn => btn.addEventListener('click', () => showTourStop(btn.dataset.tourNext)));
if (tourStops.length) showTourStop(tourStops[0].dataset.tourStop);


// v0.5 project board filtering
let activeProjectFilter = 'all';
function applyProjectFilters() {
  const term = (document.querySelector('[data-filter-input]')?.value || '').trim().toLowerCase();
  document.querySelectorAll('[data-filter-card]').forEach(card => {
    const haystack = card.textContent.toLowerCase();
    const searchMatch = !term || haystack.includes(term);
    let statusMatch = true;
    if (activeProjectFilter && activeProjectFilter !== 'all') {
      if (activeProjectFilter.startsWith('bucket:')) {
        statusMatch = card.dataset.bucket === activeProjectFilter.slice(7);
      } else {
        statusMatch = card.dataset.status === activeProjectFilter;
      }
    }
    card.style.display = searchMatch && statusMatch ? '' : 'none';
  });
}
document.querySelectorAll('[data-status-filter]').forEach(button => {
  button.addEventListener('click', () => {
    activeProjectFilter = button.dataset.statusFilter;
    document.querySelectorAll('[data-status-filter]').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    applyProjectFilters();
  });
});
applyProjectFilters();


// v0.6 mission checklist demo
function updateMissionDemo() {
  document.querySelectorAll('[data-mission-demo]').forEach(demo => {
    const checks = Array.from(demo.querySelectorAll('[data-mission-check]'));
    const done = checks.filter(c => c.checked).length;
    const total = checks.length || 1;
    const pct = Math.round((done / total) * 100);
    const bar = demo.querySelector('[data-mission-progress-bar]');
    const text = demo.querySelector('[data-mission-progress-text]');
    const complete = demo.querySelector('[data-mission-complete]');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = `${done} of ${total} steps complete.`;
    if (complete) complete.hidden = done !== total;
  });
}
document.querySelectorAll('[data-mission-check]').forEach(check => check.addEventListener('change', updateMissionDemo));
updateMissionDemo();

// v0.6 project proposal draft builder
const proposalForm = document.querySelector('[data-proposal-form]');
const proposalOutput = document.querySelector('[data-proposal-output]');
const proposalText = document.querySelector('[data-proposal-text]');
function getProposalValue(name) {
  return proposalForm?.elements[name]?.value?.trim() || '';
}
document.querySelector('[data-generate-proposal]')?.addEventListener('click', () => {
  if (!proposalForm || !proposalOutput || !proposalText) return;
  const title = getProposalValue('title') || 'Untitled SOTE Project Proposal';
  const draft = `SOTE STUDENT PROJECT PROPOSAL\n\nProject title: ${title}\nStudent-facing name: ${getProposalValue('studentName')}\nConnected zone: ${getProposalValue('zone')}\nPathway: ${getProposalValue('pathway')}\n\nProblem or opportunity:\n${getProposalValue('problem')}\n\nProposed student work:\n${getProposalValue('work')}\n\nSuccess criteria:\n${getProposalValue('success')}\n\nResources or approvals needed:\n${getProposalValue('needs')}\n\nPublic-safe notes:\n${getProposalValue('safeNotes')}\n\nSafety reminder: Do not include credentials, student private data, sensitive configurations, internal secrets, or unapproved screenshots.`;
  proposalText.value = draft;
  proposalOutput.hidden = false;
  proposalText.focus();
});
document.querySelector('[data-copy-proposal]')?.addEventListener('click', async () => {
  if (!proposalText) return;
  proposalText.select();
  try { await navigator.clipboard.writeText(proposalText.value); } catch (e) { document.execCommand('copy'); }
});


// v1.0 data-driven knowledge base
let activeKbCategory = 'all';

function escapeKb(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function renderKnowledgeBase(articles) {
  const list = document.querySelector('[data-kb-list]');
  if (!list) return;
  list.innerHTML = articles.map(article => `
    <article class="project-card kb-card" data-kb-card data-category="${escapeKb(article.category)}">
      <div class="project-card-top"><span class="status-badge status-online">${escapeKb(article.status)}</span><span class="priority-pill">${escapeKb(article.id)}</span></div>
      <h3><a class="kb-card-link" href="${escapeKb(article.url || `knowledge-article.html?id=${article.id}`)}">${escapeKb(article.title)}</a></h3>
      <p>${escapeKb(article.summary)}</p>
      <div class="project-meta"><span><strong>Category</strong>${escapeKb(article.category_label)}</span><span><strong>Source</strong>SOTE Framework</span><span><strong>Version</strong>${escapeKb(article.version)}</span></div><a class="button secondary kb-open" href="${escapeKb(article.url || `knowledge-article.html?id=${article.id}`)}">Open article →</a>
    </article>`).join('');
  applyKbFilters();
}

function applyKbFilters() {
  const term = (document.querySelector('[data-kb-filter-input]')?.value || '').trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('[data-kb-card]').forEach(card => {
    const searchMatch = !term || card.textContent.toLowerCase().includes(term);
    const categoryMatch = activeKbCategory === 'all' || card.dataset.category === activeKbCategory;
    const show = searchMatch && categoryMatch;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.querySelector('[data-kb-empty]');
  if (empty) empty.hidden = visible !== 0;
}

document.querySelector('[data-kb-filter-input]')?.addEventListener('input', applyKbFilters);
document.querySelectorAll('[data-kb-category]').forEach(button => {
  button.addEventListener('click', () => {
    activeKbCategory = button.dataset.kbCategory;
    document.querySelectorAll('[data-kb-category]').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    applyKbFilters();
  });
});

if (document.querySelector('[data-kb-list]')) {
  fetch('data/knowledge-base.json')
    .then(response => {
      if (!response.ok) throw new Error('Knowledge Base catalog unavailable');
      return response.json();
    })
    .then(data => renderKnowledgeBase(data.articles || []))
    .catch(() => {
      const list = document.querySelector('[data-kb-list]');
      if (list) list.innerHTML = '<article class="project-card"><h3>Knowledge Base temporarily unavailable</h3><p>The catalog could not be loaded. Try again shortly.</p></article>';
    });
}


// Live SOTE GitHub project dashboard
let liveIssues = [];
let liveFilter = 'all';
function escapeLive(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML;}
function issueType(i){const t=(i.title||'').toUpperCase();if(t.includes('CLASSROOM')||t.includes('CIT-205'))return'classroom';if(t.includes('DOCUMENTATION'))return'documentation';if(t.includes('PLANNED')||t.includes('PROPOSAL')||t.includes('ROADMAP')||t.includes('FUTURE WORK'))return'planned';return'active';}
function issueLabel(t){return {active:'Active',planned:'Planned',classroom:'Classroom',documentation:'Documentation'}[t]||'Active';}
function renderLiveIssues(){
 const host=document.querySelector('[data-live-projects]');if(!host)return;
 const term=(document.querySelector('[data-live-project-search]')?.value||'').toLowerCase().trim();
 const shown=liveIssues.filter(i=>{const type=issueType(i);return(liveFilter==='all'||type===liveFilter)&&(!term||(i.title||'').toLowerCase().includes(term));});
 host.innerHTML=shown.length?shown.map(i=>{const type=issueType(i);return '<article class="project-card live-project-card"><div class="project-card-top"><span class="status-badge status-online">'+escapeLive(issueLabel(type))+'</span><span class="priority-pill">#'+i.number+'</span></div><h3>'+escapeLive(i.title)+'</h3><p>Tracked operational work from the SOTE Framework repository.</p><div class="project-meta"><span><strong>Source</strong>SOTE Framework</span></div><a class="card-link" href="'+escapeLive(i.html_url)+'" target="_blank" rel="noopener noreferrer">Open GitHub Issue →</a></article>';}).join(''):'<article class="project-card"><h3>No matching work</h3><p>Try another filter or search term.</p></article>';
}
function setLiveMetric(n,v){const e=document.querySelector('[data-metric="'+n+'"]');if(e)e.textContent=v;}
function loadSoteDashboard(){
 if(!document.querySelector('[data-live-projects]'))return;
 const data=window.SOTE_PROJECT_DATA;
 if(!data){const host=document.querySelector('[data-live-projects]');if(host)host.innerHTML='<article class="project-card"><h3>Project snapshot unavailable</h3><p>The dashboard data bundle has not loaded yet.</p></article>';return;}
 liveIssues=data.issues||[];const commits=data.commits||[];
 setLiveMetric('active',liveIssues.filter(i=>issueType(i)==='active').length);
 setLiveMetric('planned',liveIssues.filter(i=>issueType(i)==='planned').length);
 setLiveMetric('classroom',liveIssues.filter(i=>issueType(i)==='classroom').length);
 setLiveMetric('recent',commits.length);
 renderLiveIssues();
 const activity=document.querySelector('[data-github-activity]');
 if(activity)activity.innerHTML=commits.map(c=>{const first=(c.message||'Repository update').split('\n')[0];const when=c.created_at?new Date(c.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'';return '<article class="activity-item"><div><strong>'+escapeLive(first)+'</strong><span>'+escapeLive(when)+'</span></div><a href="'+escapeLive(c.html_url)+'" target="_blank" rel="noopener noreferrer">View commit →</a></article>';}).join('');
 const stamp=document.querySelector('[data-github-updated]');if(stamp&&data.generated_at)stamp.textContent='· snapshot '+new Date(data.generated_at).toLocaleString();
}
document.querySelector('[data-live-project-search]')?.addEventListener('input',renderLiveIssues);
document.querySelectorAll('[data-live-filter]').forEach(btn=>btn.addEventListener('click',()=>{liveFilter=btn.dataset.liveFilter;document.querySelectorAll('[data-live-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderLiveIssues();}));
loadSoteDashboard();
